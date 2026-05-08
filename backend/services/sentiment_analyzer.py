from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from typing import Any

import httpx

from backend.config import settings

POSITIVE_WORDS = {"excellent", "great", "good", "amazing", "helpful", "useful", "supportive", "clean", "fast", "awesome", "love", "best", "well"}
NEGATIVE_WORDS = {"bad", "poor", "slow", "broken", "terrible", "worst", "issue", "issues", "dirty", "unsafe", "harassment", "unavailable", "delay", "disappointed", "late", "lag"}
JOY_WORDS = {"happy", "joy", "excited", "love", "great", "awesome"}
ANGER_WORDS = {"angry", "frustrated", "hate", "broken", "terrible", "worst", "issue"}
SADNESS_WORDS = {"sad", "disappointed", "down", "depressed", "unhappy"}
FEAR_WORDS = {"afraid", "unsafe", "scared", "fear", "worry", "anxious"}
SURPRISE_WORDS = {"surprised", "unexpected", "shock", "suddenly"}


@dataclass
class AnalysisResult:
    label: str
    confidence: float
    model_name: str


class SentimentAnalyzer:
    """Unified interface for sentiment analysis using local or external backends."""

    def __init__(self, model_type: str = "local", model_name: str | None = None):
        self.model_type = model_type
        self.model_name = model_name or (
            settings.huggingface_model if model_type == "local" else settings.external_llm_model
        )
        self._sentiment_pipeline = None
        self._emotion_pipeline = None

    @property
    def sentiment_pipeline(self):
        if self._sentiment_pipeline is None:
            self._sentiment_pipeline = self._load_pipeline(settings.huggingface_model)
        return self._sentiment_pipeline

    @property
    def emotion_pipeline(self):
        if self._emotion_pipeline is None:
            self._emotion_pipeline = self._load_pipeline(settings.emotion_model)
        return self._emotion_pipeline

    @lru_cache(maxsize=2)
    def _load_pipeline(self, model_name: str):
        try:
            from transformers import pipeline

            return pipeline("text-classification", model=model_name)
        except Exception:
            return None

    def _normalize_text(self, text: str | None) -> str:
        if text is None:
            raise ValueError("text cannot be None")
        normalized = text.strip()
        if not normalized:
            raise ValueError("text cannot be empty")
        return normalized

    def _heuristic_sentiment(self, text: str) -> AnalysisResult:
        words = {word.strip(".,!?;:") for word in text.lower().split()}
        positive = len(words & POSITIVE_WORDS)
        negative = len(words & NEGATIVE_WORDS)
        if positive > negative:
            return AnalysisResult("positive", min(0.55 + 0.1 * positive, 0.99), self.model_name)
        if negative > positive:
            return AnalysisResult("negative", min(0.55 + 0.1 * negative, 0.99), self.model_name)
        return AnalysisResult("neutral", 0.62, self.model_name)

    def _heuristic_emotion(self, text: str) -> AnalysisResult:
        words = {word.strip(".,!?;:") for word in text.lower().split()}
        mapping = [
            (JOY_WORDS, "joy"),
            (ANGER_WORDS, "anger"),
            (SADNESS_WORDS, "sadness"),
            (FEAR_WORDS, "fear"),
            (SURPRISE_WORDS, "surprise"),
        ]
        for bucket, label in mapping:
            if words & bucket:
                return AnalysisResult(label, 0.78, self.model_name)
        return AnalysisResult("neutral", 0.6, self.model_name)

    async def analyze_sentiment(self, text: str) -> dict[str, Any]:
        normalized = self._normalize_text(text)
        if len(normalized) < 10:
            return {"sentiment_label": "neutral", "confidence_score": 0.5, "model_name": self.model_name}
        if self.model_type == "external" and settings.external_llm_api_key:
            result = await self._analyze_with_external(normalized, task="sentiment")
            if result:
                return result
        pipeline = self.sentiment_pipeline
        if pipeline is not None:
            try:
                output = pipeline(normalized[:512])[0]
                label = str(output.get("label", "neutral")).upper()
                score = float(output.get("score", 0.5))
                if label in {"POSITIVE", "LABEL_1"}:
                    sentiment = "positive"
                elif label in {"NEGATIVE", "LABEL_0"}:
                    sentiment = "negative"
                else:
                    sentiment = "neutral"
                if sentiment != "neutral" and score < 0.6:
                    sentiment = "neutral"
                return {"sentiment_label": sentiment, "confidence_score": max(0.0, min(score, 1.0)), "model_name": self.model_name}
            except Exception:
                pass
        heuristic = self._heuristic_sentiment(normalized)
        return {"sentiment_label": heuristic.label, "confidence_score": heuristic.confidence, "model_name": heuristic.model_name}

    async def analyze_emotion(self, text: str) -> dict[str, Any]:
        normalized = self._normalize_text(text)
        if len(normalized) < 10:
            return {"emotion": "neutral", "confidence_score": 0.5, "model_name": self.model_name}
        if self.model_type == "external" and settings.external_llm_api_key:
            result = await self._analyze_with_external(normalized, task="emotion")
            if result:
                return result
        pipeline = self.emotion_pipeline
        if pipeline is not None:
            try:
                output = pipeline(normalized[:512])[0]
                label = str(output.get("label", "neutral")).lower()
                score = float(output.get("score", 0.5))
                allowed = {"joy", "anger", "sadness", "fear", "surprise", "neutral"}
                emotion = label if label in allowed else "neutral"
                return {"emotion": emotion, "confidence_score": max(0.0, min(score, 1.0)), "model_name": self.model_name}
            except Exception:
                pass
        heuristic = self._heuristic_emotion(normalized)
        return {"emotion": heuristic.label, "confidence_score": heuristic.confidence, "model_name": heuristic.model_name}

    async def batch_analyze(self, texts: list[str]) -> list[dict[str, Any]]:
        if not texts:
            return []
        results = []
        for text in texts:
            try:
                sentiment = await self.analyze_sentiment(text)
                emotion = await self.analyze_emotion(text)
                results.append({**sentiment, **emotion})
            except Exception as exc:
                results.append({"error": str(exc)})
        return results

    async def _analyze_with_external(self, text: str, task: str) -> dict[str, Any] | None:
        system_prompt = "Return strict JSON only."
        if task == "sentiment":
            user_prompt = (
                "Classify this college feedback as positive, negative, or neutral. "
                f"Text: {text}"
            )
        else:
            user_prompt = (
                "Classify the dominant emotion as joy, anger, sadness, fear, surprise, or neutral. "
                f"Text: {text}"
            )
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.external_llm_api_key}"},
                    json={
                        "model": settings.external_llm_model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                        "temperature": 0,
                    },
                )
                response.raise_for_status()
                payload = response.json()
                content = payload["choices"][0]["message"]["content"]
                if task == "sentiment":
                    label = self._extract_json_value(content, ["sentiment_label", "label"]) or "neutral"
                    confidence = float(self._extract_json_value(content, ["confidence_score", "confidence"]) or 0.5)
                    return {"sentiment_label": label, "confidence_score": max(0.0, min(confidence, 1.0)), "model_name": settings.external_llm_model}
                emotion = self._extract_json_value(content, ["emotion"]) or "neutral"
                confidence = float(self._extract_json_value(content, ["confidence_score", "confidence"]) or 0.5)
                return {"emotion": emotion, "confidence_score": max(0.0, min(confidence, 1.0)), "model_name": settings.external_llm_model}
        except Exception:
            return None

    def _extract_json_value(self, content: str, keys: list[str]) -> Any:
        content_lower = content.lower()
        for key in keys:
            marker = f'"{key}"'
            if marker in content_lower:
                start = content_lower.find(marker)
                colon = content_lower.find(":", start)
                if colon != -1:
                    value = content[colon + 1 :].strip().lstrip('"').split("\n", 1)[0].split(",", 1)[0].strip('" ,}')
                    return value
        return None

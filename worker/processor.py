from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker

from backend.api.schemas import FeedbackCreate
from backend.config import settings
from backend.models.feedback import FeedbackAlert, FeedbackPost, SentimentAnalysis
from backend.services.alerting import evaluate_alerts
from backend.services.sentiment_analyzer import SentimentAnalyzer


class FeedbackProcessor:
    def __init__(self, session_maker: async_sessionmaker, analyzer: SentimentAnalyzer):
        self.session_maker = session_maker
        self.analyzer = analyzer

    async def process_message(self, message: dict[str, Any]) -> dict[str, Any]:
        feedback_id = message["feedback_id"]
        created_at = self._parse_datetime(message.get("created_at"))
        async with self.session_maker() as session:
            feedback = await session.scalar(select(FeedbackPost).where(FeedbackPost.feedback_id == feedback_id))
            if feedback is None:
                feedback = FeedbackPost(
                    feedback_id=feedback_id,
                    student_name=message["student_name"],
                    hall_ticket=message["hall_ticket"],
                    department=message["department"],
                    year=int(message["year"]),
                    category=message["category"],
                    rating=int(message["rating"]),
                    feedback_message=message["feedback_message"],
                    created_at=created_at,
                )
                session.add(feedback)
                await session.flush()

            sentiment = await self.analyzer.analyze_sentiment(message["feedback_message"])
            emotion = await self.analyzer.analyze_emotion(message["feedback_message"])

            analysis = await session.scalar(select(SentimentAnalysis).where(SentimentAnalysis.feedback_id == feedback_id))
            if analysis is None:
                analysis = SentimentAnalysis(
                    feedback_id=feedback_id,
                    model_name=sentiment["model_name"],
                    sentiment_label=sentiment["sentiment_label"],
                    confidence_score=float(sentiment["confidence_score"]),
                    emotion=emotion["emotion"],
                )
                session.add(analysis)
            else:
                analysis.model_name = sentiment["model_name"]
                analysis.sentiment_label = sentiment["sentiment_label"]
                analysis.confidence_score = float(sentiment["confidence_score"])
                analysis.emotion = emotion["emotion"]

            await session.commit()
            await session.refresh(feedback)
            await session.refresh(analysis)

            alerts = await evaluate_alerts(
                session,
                feedback_id=feedback_id,
                threshold_ratio=settings.alert_negative_ratio_threshold,
                window_minutes=settings.alert_window_minutes,
                min_posts=settings.alert_min_posts,
            )

            return {
                "feedback_id": feedback_id,
                "sentiment_label": analysis.sentiment_label,
                "confidence_score": analysis.confidence_score,
                "emotion": analysis.emotion,
                "alerts": [alert.alert_type for alert in alerts],
            }

    def _parse_datetime(self, value: str | None) -> datetime:
        if not value:
            return datetime.now(timezone.utc)
        normalized = value.replace("Z", "+00:00")
        return datetime.fromisoformat(normalized)

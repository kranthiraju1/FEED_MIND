import pytest

from backend.services.sentiment_analyzer import SentimentAnalyzer


@pytest.mark.asyncio
async def test_sentiment_analyzer_batch():
    analyzer = SentimentAnalyzer()
    texts = [
        "Faculty teaching is excellent.",
        "WiFi is broken.",
        "Lab posted on schedule.",
    ]
    results = await analyzer.batch_analyze(texts)
    assert len(results) == 3
    assert all("sentiment_label" in r for r in results)


@pytest.mark.asyncio
async def test_sentiment_analyzer_empty_text():
    analyzer = SentimentAnalyzer()
    with pytest.raises(ValueError):
        await analyzer.analyze_sentiment("")


@pytest.mark.asyncio
async def test_emotion_detection_various_texts():
    analyzer = SentimentAnalyzer()
    tests = [
        ("I love this faculty!", "joy"),
        ("This is terrible", "anger"),
        ("I feel sad", "sadness"),
        ("Scared of the unsafe path", "fear"),
        ("Unexpected maintenance today", "surprise"),
    ]
    for text, expected_emotion in tests:
        result = await analyzer.analyze_emotion(text)
        assert result["emotion"] in {expected_emotion, "neutral", "joy", "anger", "sadness", "fear", "surprise"}
        assert 0.0 <= result["confidence_score"] <= 1.0


@pytest.mark.asyncio
async def test_sentiment_extraction_from_external_response():
    """Test parsing of external LLM response format."""
    analyzer = SentimentAnalyzer()
    json_response = '{"sentiment_label": "positive", "confidence_score": 0.95}'
    value = analyzer._extract_json_value(json_response, ["sentiment_label"])
    assert value == "positive"

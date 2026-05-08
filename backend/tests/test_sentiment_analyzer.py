import pytest

from backend.services.sentiment_analyzer import SentimentAnalyzer


@pytest.mark.asyncio
async def test_sentiment_analyzer_positive_and_joy():
    analyzer = SentimentAnalyzer()
    sentiment = await analyzer.analyze_sentiment("Faculty teaching is excellent and very helpful for our class.")
    emotion = await analyzer.analyze_emotion("Faculty teaching is excellent and very helpful for our class.")
    assert sentiment["sentiment_label"] == "positive"
    assert 0.0 <= sentiment["confidence_score"] <= 1.0
    assert emotion["emotion"] in {"joy", "neutral"}


@pytest.mark.asyncio
async def test_sentiment_analyzer_negative_and_anger():
    analyzer = SentimentAnalyzer()
    sentiment = await analyzer.analyze_sentiment("WiFi is broken and the bus service is terrible.")
    emotion = await analyzer.analyze_emotion("WiFi is broken and the bus service is terrible.")
    assert sentiment["sentiment_label"] == "negative"
    assert 0.0 <= sentiment["confidence_score"] <= 1.0
    assert emotion["emotion"] in {"anger", "fear", "neutral"}


@pytest.mark.asyncio
async def test_sentiment_analyzer_neutral_short_text():
    analyzer = SentimentAnalyzer()
    sentiment = await analyzer.analyze_sentiment("Lab schedule posted.")
    emotion = await analyzer.analyze_emotion("Lab schedule posted.")
    assert sentiment["sentiment_label"] == "neutral"
    assert emotion["emotion"] == "neutral"

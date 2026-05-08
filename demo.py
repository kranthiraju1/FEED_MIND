import asyncio
from backend.services.sentiment_analyzer import SentimentAnalyzer

async def main():
    analyzer = SentimentAnalyzer()
    
    test_texts = [
        'Faculty teaching is excellent and very helpful for our class.',
        'WiFi is broken and the bus service is terrible.',
        'Lab schedule posted.'
    ]
    
    print('=== FeedMind Sentiment Analysis Demo ===\n')
    for text in test_texts:
        sentiment = await analyzer.analyze_sentiment(text)
        emotion = await analyzer.analyze_emotion(text)
        print(f'Text: {text}')
        print(f'Sentiment: {sentiment["sentiment_label"]} (confidence: {sentiment["confidence_score"]:.2f})')
        print(f'Emotion: {emotion["emotion"]}')
        print()

asyncio.run(main())

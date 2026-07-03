from unittest.mock import patch
from app.services.sentiment.sentiment_aggregator import SentimentAggregator

@patch('app.services.sentiment.finbert_service.FinBERTService.analyze_text')
def test_sentiment_aggregator_bullish(mock_analyze):
    # Mock a highly bullish article
    mock_analyze.return_value = {"positive": 0.9, "negative": 0.05, "neutral": 0.05}
    
    articles = [
        {"title": "Earnings Beat", "source": "Yahoo", "content": "Record profits", "published_at": "2026-01-01T12:00:00Z"}
    ]
    
    result = SentimentAggregator.calculate_aggregated_sentiment(articles)
    
    assert result["article_count"] == 1
    assert result["confidence"] == 10.0
    # Expected score: (0.9*100) - (0.05*100) = 90 - 5 = 85
    assert result["sentiment_score"] == 85.0

@patch('app.services.sentiment.finbert_service.FinBERTService.analyze_text')
def test_sentiment_aggregator_bearish(mock_analyze):
    # Mock a highly bearish article
    mock_analyze.return_value = {"positive": 0.05, "negative": 0.85, "neutral": 0.10}
    
    articles = [
        {"title": "Lawsuit", "source": "Reuters", "content": "CEO resigns", "published_at": "2026-01-01T12:00:00Z"},
        {"title": "Guidance cut", "source": "CNBC", "content": "Margins drop", "published_at": "2026-01-01T12:00:00Z"}
    ]
    
    result = SentimentAggregator.calculate_aggregated_sentiment(articles)
    
    assert result["article_count"] == 2
    assert result["confidence"] == 20.0
    # Expected score: (0.05*100) - (0.85*100) = 5 - 85 = -80
    assert result["sentiment_score"] == -80.0

def test_sentiment_empty_array():
    result = SentimentAggregator.calculate_aggregated_sentiment([])
    assert result["sentiment_score"] == 0.0
    assert result["confidence"] == 0.0
    assert result["article_count"] == 0

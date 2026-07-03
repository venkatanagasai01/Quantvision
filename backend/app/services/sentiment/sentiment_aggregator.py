from datetime import datetime
from app.services.sentiment.finbert_service import FinBERTService
from typing import Dict, Any, List

class SentimentAggregator:
    """
    Aggregates sentiment scores across multiple news articles applying
    recency and relevance weights.
    """

    @staticmethod
    def calculate_aggregated_sentiment(articles: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not articles:
            return {"sentiment_score": 0.0, "confidence": 0.0, "article_count": 0, "articles": []}
            
        total_weight = 0
        weighted_score = 0
        now = datetime.utcnow()
        
        analyzed_articles = []
        
        for article in articles:
            scores = FinBERTService.analyze_text(article["content"])
            
            # Mathematical Mapping: [-100 to 100] scale
            # Positive dominates -> + score, Negative dominates -> - score
            article_score = (scores["positive"] * 100) - (scores["negative"] * 100)
            
            # Recency Weighting
            try:
                # Handle isoformat with or without Z
                pub_str = article["published_at"].replace("Z", "+00:00")
                published = datetime.fromisoformat(pub_str).replace(tzinfo=None)
                days_old = (now - published).days
                # Decay 10% per day, floor at 0.2
                recency_weight = max(0.2, 1.0 - (days_old * 0.1)) 
            except Exception:
                recency_weight = 0.5
                
            weight = recency_weight
            weighted_score += article_score * weight
            total_weight += weight
            
            article["pos_score"] = scores["positive"]
            article["neg_score"] = scores["negative"]
            article["neu_score"] = scores["neutral"]
            analyzed_articles.append(article)
            
        final_score = weighted_score / total_weight if total_weight > 0 else 0
        
        # Confidence logic: The more articles we have, the higher the confidence.
        # Assuming 10 articles = 100% confidence.
        confidence = min(100.0, len(articles) * 10.0)
        
        return {
            "sentiment_score": round(final_score, 2),
            "confidence": round(confidence, 2),
            "article_count": len(articles),
            "articles": analyzed_articles
        }

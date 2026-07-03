from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.db.database import get_db
from app.models.db_models import SentimentAnalysis, NewsArticle, User
from app.core.security import get_current_user
from app.api.schemas.sentiment_schemas import SentimentResponse
from app.services.sentiment.news_service import NewsService
from app.services.sentiment.sentiment_aggregator import SentimentAggregator

router = APIRouter(prefix="/api/sentiment", tags=["Sentiment"])

@router.get("/{symbol}", response_model=SentimentResponse)
def get_sentiment(symbol: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetches real-time institutional-grade financial sentiment using FinBERT.
    Results are cached in Postgres for 1 hour to prevent redundant heavy ML inference.
    """
    symbol = symbol.upper()
    
    # Cache lookup (1 hour)
    cutoff = datetime.utcnow() - timedelta(hours=1)
    cached = db.query(SentimentAnalysis).filter(
        SentimentAnalysis.symbol == symbol,
        SentimentAnalysis.user_id == current_user.id,
        SentimentAnalysis.analyzed_at >= cutoff
    ).order_by(SentimentAnalysis.analyzed_at.desc()).first()
    
    if cached:
        return {
            "symbol": cached.symbol,
            "sentiment_score": cached.sentiment_score,
            "confidence": cached.confidence,
            "article_count": cached.article_count,
            "articles": [
                {
                    "title": a.title, "source": a.source, "published_at": a.published_at,
                    "pos_score": a.pos_score, "neg_score": a.neg_score, "neu_score": a.neu_score
                } for a in cached.articles
            ]
        }
        
    # Execute NLP Pipeline
    raw_articles = NewsService.fetch_recent_news(symbol)
    result = SentimentAggregator.calculate_aggregated_sentiment(raw_articles)
    
    # Persist to Postgres
    new_sentiment = SentimentAnalysis(
        user_id=current_user.id,
        symbol=symbol,
        sentiment_score=result["sentiment_score"],
        confidence=result["confidence"],
        article_count=result["article_count"]
    )
    db.add(new_sentiment)
    db.commit()
    db.refresh(new_sentiment)
    
    for a in result["articles"]:
        news_art = NewsArticle(
            sentiment_id=new_sentiment.id,
            title=a["title"][:500], # Trucate just in case
            source=a["source"], 
            published_at=a["published_at"],
            pos_score=a["pos_score"], 
            neg_score=a["neg_score"], 
            neu_score=a["neu_score"]
        )
        db.add(news_art)
    db.commit()
    
    return {
        "symbol": symbol,
        "sentiment_score": result["sentiment_score"],
        "confidence": result["confidence"],
        "article_count": result["article_count"],
        "articles": result["articles"]
    }

from pydantic import BaseModel
from typing import List

class NewsArticleSchema(BaseModel):
    title: str
    source: str
    published_at: str
    pos_score: float
    neg_score: float
    neu_score: float

class SentimentResponse(BaseModel):
    symbol: str
    sentiment_score: float
    confidence: float
    article_count: int
    articles: List[NewsArticleSchema]

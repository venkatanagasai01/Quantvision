from pydantic import BaseModel
from typing import List, Optional

class StockSearchResponse(BaseModel):
    symbol: str
    name: str

class StockDetailsResponse(BaseModel):
    symbol: str
    name: str
    current_price: float
    change_percentage: float
    market_cap: str

class TechnicalScores(BaseModel):
    trend: str
    rsi: str
    macd: str
    volatility: str

class SentimentScore(BaseModel):
    overall: int
    label: str
    newsImpact: str
    socialMentions: str

class StockAnalysisResponse(BaseModel):
    symbol: str
    recommendation: str
    confidence_score: int
    technical_score: int
    fundamental_score: int
    risk_score: int
    sentiment_score: Optional[float] = None
    ai_explanation: Optional[str] = None
    risk_override: Optional[bool] = False
    strengths: List[str]
    weaknesses: List[str]
    investment_thesis: str
    risk_factors: List[str]

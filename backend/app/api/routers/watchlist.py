from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
import yfinance as yf

from app.db.database import get_db
from app.models.db_models import Watchlist, ResearchReport, SentimentAnalysis, User
from app.core.security import get_current_user

router = APIRouter(prefix="/api/watchlist", tags=["Watchlist"])

class WatchlistBase(BaseModel):
    symbol: str

class WatchlistResponse(BaseModel):
    id: int
    symbol: str
    company_name: str
    price: float
    change_pct: float
    recommendation: str
    confidence_score: float
    sentiment_score: float
    added_at: str

    model_config = ConfigDict(from_attributes=True)

@router.get("", response_model=List[WatchlistResponse])
def get_watchlist(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetches the institutional watchlist.
    Batch-fetches live prices via yfinance.
    Queries the latest DB cache for AI Recommendations and FinBERT Sentiments.
    """
    items = db.query(Watchlist).filter(Watchlist.user_id == current_user.id).all()
    if not items:
        return []

    symbols = [item.symbol for item in items]
    
    # 1. Fetch live prices via yfinance
    prices = {}
    try:
        # yfinance download allows batch fetching
        data = yf.download(symbols, period="2d", group_by="ticker")
        
        for symbol in symbols:
            try:
                if len(symbols) == 1:
                    closes = data['Close'].dropna()
                else:
                    closes = data[symbol]['Close'].dropna()
                
                if len(closes) >= 2:
                    last = float(closes.iloc[-1])
                    prev = float(closes.iloc[-2])
                    change = ((last - prev) / prev) * 100
                elif len(closes) == 1:
                    last = float(closes.iloc[-1])
                    change = 0.0
                else:
                    last = 0.0
                    change = 0.0
                
                prices[symbol] = {
                    "price": round(last, 2),
                    "change": round(change, 2)
                }
            except Exception:
                prices[symbol] = {"price": 0.0, "change": 0.0}
    except Exception as e:
        print(f"YFinance batch fetch failed: {e}")
        for symbol in symbols:
            prices[symbol] = {"price": 0.0, "change": 0.0}

    # 2. Build enriched response by querying latest cached AI records
    enriched_watchlist = []
    
    for item in items:
        sym = item.symbol
        
        # Latest Research Report for Recommendation & Confidence
        latest_report = db.query(ResearchReport)\
                          .filter(ResearchReport.symbol == sym)\
                          .order_by(desc(ResearchReport.generated_at))\
                          .first()
                          
        rec = latest_report.recommendation if latest_report else "N/A"
        conf = latest_report.confidence_score if latest_report else 0.0
        
        # Latest Sentiment Analysis for Sentiment Score
        latest_sentiment = db.query(SentimentAnalysis)\
                             .filter(SentimentAnalysis.symbol == sym)\
                             .order_by(desc(SentimentAnalysis.analyzed_at))\
                             .first()
                             
        sentiment_score = latest_sentiment.sentiment_score if latest_sentiment else 0.0
        
        enriched_watchlist.append({
            "id": item.id,
            "symbol": sym,
            "company_name": sym, # Could integrate a company name mapper, but symbol works for now
            "price": prices[sym]["price"],
            "change_pct": prices[sym]["change"],
            "recommendation": rec,
            "confidence_score": conf,
            "sentiment_score": sentiment_score,
            "added_at": item.created_at.isoformat()
        })

    return enriched_watchlist

@router.post("")
def add_to_watchlist(item: WatchlistBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    symbol = item.symbol.upper()
    existing = db.query(Watchlist).filter(Watchlist.symbol == symbol, Watchlist.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Symbol already in watchlist")
    
    new_item = Watchlist(symbol=symbol, user_id=current_user.id)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return {"status": "success", "symbol": new_item.symbol}

@router.delete("/{symbol}")
def remove_from_watchlist(symbol: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(Watchlist).filter(Watchlist.symbol == symbol.upper(), Watchlist.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Symbol not found in watchlist")
    
    db.delete(item)
    db.commit()
    return {"status": "success"}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
from app.db.database import get_db
from app.models.db_models import BacktestRun, PerformanceMetrics, SentimentAnalysis, Watchlist, User, BenchmarkComparison, PredictionExplanation
from app.core.security import get_current_user
from pydantic import BaseModel
import yfinance as yf
import random

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

class WatchlistBase(BaseModel):
    symbol: str

class WatchlistResponse(WatchlistBase):
    id: int
    added_at: datetime
    class Config:
        orm_mode = True

@router.get("/market-overview")
def get_market_overview():
    try:
        tickers = ["^NSEI", "^BSESN", "^GSPC", "^IXIC"]
        data = yf.download(tickers, period="5d")
        
        def calculate_change(ticker):
            try:
                closes = data['Close'][ticker].dropna()
                if len(closes) >= 2:
                    last = float(closes.iloc[-1])
                    prev = float(closes.iloc[-2])
                    change = ((last - prev) / prev) * 100
                    return {"price": round(last, 2), "change": f"{change:+.2f}%", "isPositive": change >= 0}
            except Exception:
                pass
            return {"price": "N/A", "change": "+0.00%", "isPositive": True}
        
        return {
            "nifty": calculate_change("^NSEI"),
            "sensex": calculate_change("^BSESN"),
            "sp500": calculate_change("^GSPC"),
            "nasdaq": calculate_change("^IXIC"),
            "market_status": "OPEN",
            "top_gainers": ["RELIANCE", "TCS", "INFY"],
            "top_losers": ["PAYTM", "HDFCBANK", "WIPRO"]
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail="Market Data Provider (yfinance) Unavailable")

@router.get("/portfolio-summary")
def get_portfolio_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    backtests = db.query(BacktestRun).filter(BacktestRun.user_id == current_user.id).all()
    total_backtests = len(backtests)
    if total_backtests == 0:
        return {
            "total_backtests": 0,
            "avg_return": 0.0,
            "avg_win_rate": 0.0,
            "avg_sharpe": 0.0,
            "cagr": 0.0,
            "alpha": 0.0,
            "best_strategy": None
        }

    total_return = sum(b.total_return for b in backtests)
    profitable = sum(1 for b in backtests if b.total_return > 0)
    
    # Calculate sharpe averages via PerformanceMetrics join
    perf_metrics = db.query(PerformanceMetrics).join(BacktestRun).filter(BacktestRun.user_id == current_user.id).all()
    valid_sharpes = [p.sharpe_ratio for p in perf_metrics if p.sharpe_ratio is not None]
    avg_sharpe = sum(valid_sharpes) / len(valid_sharpes) if valid_sharpes else 0.0
    
    valid_cagrs = [p.CAGR for p in perf_metrics if p.CAGR is not None]
    avg_cagr = sum(valid_cagrs) / len(valid_cagrs) if valid_cagrs else 0.0

    bench_comps = db.query(BenchmarkComparison).join(BacktestRun).filter(BacktestRun.user_id == current_user.id).all()
    valid_alphas = [b.alpha for b in bench_comps if b.alpha is not None]
    avg_alpha = sum(valid_alphas) / len(valid_alphas) if valid_alphas else 0.0

    best_strategy_db = sorted(backtests, key=lambda x: x.total_return, reverse=True)[0]
    
    return {
        "total_backtests": total_backtests,
        "avg_return": total_return / total_backtests,
        "avg_win_rate": (profitable / total_backtests) * 100,
        "avg_sharpe": avg_sharpe,
        "cagr": avg_cagr,
        "alpha": avg_alpha,
        "best_strategy": {
            "symbol": best_strategy_db.symbol,
            "return": best_strategy_db.total_return
        }
    }



@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alerts = []
    
    # Check Sentiment anomalies
    recent_sentiments = db.query(SentimentAnalysis).filter(SentimentAnalysis.user_id == current_user.id).order_by(SentimentAnalysis.analyzed_at.desc()).limit(5).all()
    for s in recent_sentiments:
        if s.sentiment_score > 0.8:
            alerts.append({
                "type": "MOMENTUM",
                "severity": "success",
                "symbol": s.symbol,
                "message": f"Extreme positive news sentiment detected (Score: {s.sentiment_score:.2f}).",
                "created_at": s.analyzed_at.isoformat()
            })
        elif s.sentiment_score < -0.5:
            alerts.append({
                "type": "RISK",
                "severity": "danger",
                "symbol": s.symbol,
                "message": f"Negative news sentiment clustering detected. Proceed with caution.",
                "created_at": s.analyzed_at.isoformat()
            })

    # Check Backtest anomalies
    recent_backtests = db.query(BacktestRun).filter(BacktestRun.user_id == current_user.id).order_by(BacktestRun.created_at.desc()).limit(5).all()
    for b in recent_backtests:
        if b.total_return > 50:
            alerts.append({
                "type": "OPPORTUNITY",
                "severity": "info",
                "symbol": b.symbol,
                "message": f"Historical strategy identified massive breakout potential: +{b.total_return:.2f}%.",
                "created_at": b.created_at.isoformat()
            })
        elif b.total_return < -20:
            alerts.append({
                "type": "DRAWDOWN",
                "severity": "warning",
                "symbol": b.symbol,
                "message": f"Strategy hit significant drawdown: {b.total_return:.2f}%. Validate risk parameters.",
                "created_at": b.created_at.isoformat()
            })

    # Sort alerts by date, newest first
    alerts.sort(key=lambda x: x["created_at"], reverse=True)
    
    # Assign IDs
    for i, alert in enumerate(alerts):
        alert["id"] = i + 1
        
    return alerts[:10]

@router.get("/equity-curve")
def get_equity_curve(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Phase 16.5A: Remove synthetic compounding backtests to avoid fake data
    # We will return an empty array until Phase 16 (Paper Trading) is built
    return []

@router.get("/explainability/latest")
def get_latest_explainability(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    latest = db.query(PredictionExplanation).filter(PredictionExplanation.user_id == current_user.id).order_by(PredictionExplanation.created_at.desc()).first()
    if not latest:
        return None
    import json
    return {
        "symbol": latest.symbol,
        "created_at": latest.created_at.isoformat(),
        "explanation": json.loads(latest.explanation_json)
    }

from fastapi import APIRouter, HTTPException, Query, Depends, Path
from typing import List
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.db_models import User
from app.core.security import get_current_user
from app.services.market_data.market_data_service import MarketDataService
from app.services.technical_analysis.technical_analysis_service import TechnicalAnalysisService
from app.services.fundamental_analysis.fundamental_analysis_service import FundamentalAnalysisService
from app.services.risk_analysis.risk_analysis_service import RiskAnalysisService
from app.services.recommendation.recommendation_engine import RecommendationEngine
from app.services.explanation.explanation_service import ExplanationService
from app.models.stock import StockAnalysisResponse

router = APIRouter(prefix="/api/stocks", tags=["stocks"])

@router.get("/analyze/{symbol}", response_model=StockAnalysisResponse)
async def analyze_stock(
    symbol: str = Path(..., pattern=r"^[A-Z0-9=\.\-\^]{1,15}$"), 
    profile: str = Query("balanced", description="Risk profile: conservative, balanced, aggressive"),
    current_user: User = Depends(get_current_user)
):
    print(f"DEBUG /analyze/{symbol} User: {current_user.email}")
    # 1. Fetch Market Data
    market_data = await MarketDataService.fetch_stock_data(symbol)
    if not market_data:
        raise HTTPException(status_code=404, detail=f"Data not found for {symbol}")

    hist_df = market_data['historical']

    # 2. Run Analyses
    tech_data = TechnicalAnalysisService.analyze(hist_df)
    fund_data = FundamentalAnalysisService.analyze(market_data)
    risk_data = RiskAnalysisService.analyze(market_data)
    
    # Run Sentiment Analysis via LLM
    from app.services.llm_analysis.llm_sentiment_service import LLMSentimentService
    quant_scores = {
        'tech_score': tech_data['score'],
        'fund_score': fund_data['score'],
        'risk_score': risk_data['score']
    }
    
    try:
        ai_analysis = await LLMSentimentService.analyze_sentiment(symbol, quant_scores)
        sentiment_score = ai_analysis.get('ai_sentiment_score', 0.0)
        risk_override = ai_analysis.get('risk_override', False)
        ai_explanation = ai_analysis.get('ai_explanation', '')
    except Exception as e:
        print(f"LLM Sentiment failed: {e}")
        sentiment_score = 0.0
        risk_override = False
        ai_explanation = "LLM Analysis failed."

    # 3. Generate Recommendation
    rec = RecommendationEngine.generate_recommendation(
        tech_score=tech_data['score'],
        fund_score=fund_data['score'],
        risk_score=risk_data['score'],
        sentiment_score=sentiment_score,
        profile=profile
    )
    
    if risk_override:
        rec['recommendation'] = "SELL"
        rec['confidence_score'] = min(rec['confidence_score'] + 20, 99) # High confidence due to macro event

    # 4. Generate Explainability (now data-driven)
    explanation = ExplanationService.generate_explanation(
        tech_data=tech_data,
        fund_data=fund_data,
        risk_data=risk_data,
        recommendation=rec['recommendation'],
        symbol=symbol,
        sentiment_score=sentiment_score
    )

    # 5. Return Aggregated Response
    return StockAnalysisResponse(
        symbol=symbol.upper(),
        recommendation=rec['recommendation'],
        confidence_score=rec['confidence_score'],
        technical_score=rec['technical_score'],
        fundamental_score=rec['fundamental_score'],
        risk_score=rec['risk_score'],
        sentiment_score=rec['sentiment_score'],
        ai_explanation=ai_explanation,
        risk_override=risk_override,
        strengths=explanation['strengths'],
        weaknesses=explanation['weaknesses'],
        investment_thesis=explanation['investment_thesis'],
        risk_factors=explanation['risk_factors']
    )

import numpy as np
import pandas as pd

@router.get("/history/{symbol}")
async def get_stock_history(
    symbol: str = Path(..., pattern=r"^[A-Z0-9=\.\-\^]{1,15}$"), 
    current_user: User = Depends(get_current_user)
):
    """
    Returns time-series arrays for OHLCV prices and technical indicators (SMA, MACD, RSI).
    Uses the same pure-pandas TA calculations as the analysis engine.
    """
    market_data = await MarketDataService.fetch_stock_data(symbol)
    if not market_data or market_data['historical'].empty:
        raise HTTPException(status_code=404, detail=f"History not found for {symbol}")

    df = market_data['historical'].copy()
    close = df['Close']
    
    # Calculate indicators using pure pandas (same logic as TechnicalAnalysisService)
    df['SMA_50'] = close.rolling(window=50).mean()
    df['SMA_200'] = close.rolling(window=200).mean()
    
    # RSI
    delta = close.diff()
    gain = delta.where(delta > 0, 0.0)
    loss = -delta.where(delta < 0, 0.0)
    avg_gain = gain.ewm(com=13, min_periods=14).mean()
    avg_loss = loss.ewm(com=13, min_periods=14).mean()
    rs = avg_gain / avg_loss
    df['RSI_14'] = 100 - (100 / (1 + rs))
    
    # MACD
    ema_fast = close.ewm(span=12, adjust=False).mean()
    ema_slow = close.ewm(span=26, adjust=False).mean()
    df['MACD_12_26_9'] = ema_fast - ema_slow
    df['MACDs_12_26_9'] = df['MACD_12_26_9'].ewm(span=9, adjust=False).mean()
    df['MACDh_12_26_9'] = df['MACD_12_26_9'] - df['MACDs_12_26_9']

    # Clean NaN values to None for JSON serialization
    df = df.replace({np.nan: None})
    
    # Format for lightweight-charts
    chart_data = []
    volume_data = []
    sma50_data = []
    sma200_data = []
    rsi_data = []
    macd_data = []
    macd_signal_data = []
    macd_hist_data = []

    for index, row in df.iterrows():
        time_str = index.strftime('%Y-%m-%d')
        
        chart_data.append({
            "time": time_str,
            "open": row.get("Open"),
            "high": row.get("High"),
            "low": row.get("Low"),
            "close": row.get("Close")
        })
        
        open_val = row.get("Open") or 0
        close_val = row.get("Close") or 0
        volume_data.append({
            "time": time_str,
            "value": row.get("Volume"),
            "color": "rgba(16, 185, 129, 0.5)" if close_val >= open_val else "rgba(239, 68, 68, 0.5)"
        })
        
        if row.get("SMA_50") is not None:
            sma50_data.append({"time": time_str, "value": row.get("SMA_50")})
        if row.get("SMA_200") is not None:
            sma200_data.append({"time": time_str, "value": row.get("SMA_200")})
        if row.get("RSI_14") is not None:
            rsi_data.append({"time": time_str, "value": row.get("RSI_14")})
            
        macd_val = row.get("MACD_12_26_9")
        sig_val = row.get("MACDs_12_26_9")
        hist_val = row.get("MACDh_12_26_9")
        
        if macd_val is not None:
            macd_data.append({"time": time_str, "value": macd_val})
        if sig_val is not None:
            macd_signal_data.append({"time": time_str, "value": sig_val})
        if hist_val is not None:
            macd_hist_data.append({
                "time": time_str, 
                "value": hist_val,
                "color": "rgba(16, 185, 129, 0.8)" if hist_val >= 0 else "rgba(239, 68, 68, 0.8)"
            })

    return {
        "symbol": symbol.upper(),
        "candles": chart_data,
        "volume": volume_data,
        "sma50": sma50_data,
        "sma200": sma200_data,
        "rsi": rsi_data,
        "macd": {
            "macd": macd_data,
            "signal": macd_signal_data,
            "histogram": macd_hist_data
        }
    }

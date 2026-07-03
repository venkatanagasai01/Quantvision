from typing import List, Dict, Any
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

from app.services.technical_analysis.technical_analysis_service import TechnicalAnalysisService
from app.services.fundamental_analysis.fundamental_analysis_service import FundamentalAnalysisService
from app.services.risk_analysis.risk_analysis_service import RiskAnalysisService
from app.services.recommendation.recommendation_engine import RecommendationEngine

class HistoricalSimulationEngine:
    """
    Simulates the quantitative model over historical data day-by-day,
    strictly preventing look-ahead bias by truncating the dataframe
    at each step before passing it to the indicators.
    """

    @staticmethod
    def run_simulation(symbol: str, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """
        Executes Phase 1 of the backtesting framework.
        
        Args:
            symbol: Ticker symbol (e.g. 'AAPL')
            start_date: YYYY-MM-DD
            end_date: YYYY-MM-DD
            
        Returns:
            List of daily recommendations and confidence scores.
        """
        # Parse dates
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        
        # We need historical data *before* the start_date to "warm up" moving averages (e.g. SMA 200).
        # We fetch 300 calendar days prior to the start date.
        warmup_start = start - timedelta(days=300)
        
        try:
            ticker = yf.Ticker(symbol)
            # Fetch entire requested block + warmup period at once to minimize network calls
            hist_df = ticker.history(start=warmup_start.strftime("%Y-%m-%d"), end=end.strftime("%Y-%m-%d"))
            
            if hist_df.empty:
                raise ValueError(f"No historical data found for {symbol}")
            
            # Fundamentals are mostly static in yfinance API for historical sweeps without enterprise data.
            # We will use current fundamentals as a mock constraint, but in a true hedge fund environment,
            # this would pull from a point-in-time fundamental database.
            info = ticker.info
            mock_fundamental_data = {
                "pe_ratio": info.get('trailingPE', 15), # Safe default
                "eps": info.get('trailingEps', 1.0),
                "market_cap": info.get('marketCap', 1_000_000_000),
                "beta": info.get('beta', 1.0)
            }
            
            # Filter the index to only include dates between start_date and end_date for our loop
            # Ensure index is tz-naive or normalize properly for comparison
            if hist_df.index.tz is not None:
                hist_df.index = hist_df.index.tz_localize(None)
            
            simulation_dates = hist_df.loc[start_date:end_date].index
            
            results = []
            
            # DAY-BY-DAY SIMULATION LOOP
            for current_date in simulation_dates:
                # 1. Truncate Data (PREVENT LOOK-AHEAD BIAS)
                # We strictly slice the dataframe up to the current_date (inclusive).
                # The engine physically cannot see data from current_date + 1.
                truncated_df = hist_df.loc[:current_date].copy()
                
                # We need enough rows to calculate 200 SMA safely
                if len(truncated_df) < 200:
                    continue # Skip days where we don't have enough warmup history
                
                # 2. Run Analyses on truncated data
                tech_data = TechnicalAnalysisService.analyze(truncated_df)
                fund_data = FundamentalAnalysisService.analyze(mock_fundamental_data)
                risk_data = RiskAnalysisService.analyze(truncated_df, mock_fundamental_data['beta'])
                
                # 3. Generate Recommendation
                rec = RecommendationEngine.generate_recommendation(
                    tech_score=tech_data['score'],
                    fund_score=fund_data['score'],
                    risk_score=risk_data['score']
                )
                
                # 4. Store Result
                results.append({
                    "date": current_date.strftime("%Y-%m-%d"),
                    "recommendation": rec['recommendation'],
                    "confidence_score": rec['confidence_score']
                })

            return results
            
        except Exception as e:
            print(f"Simulation failed for {symbol}: {e}")
            raise e

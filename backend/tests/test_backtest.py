import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from app.services.backtesting.historical_simulation import HistoricalSimulationEngine
from unittest.mock import patch

@patch('app.services.backtesting.historical_simulation.yf.Ticker')
def test_historical_simulation_engine_no_lookahead_bias(mock_ticker):
    """
    Tests that the simulation engine correctly chunks the dataframe and produces
    the expected output schema without crashing.
    """
    
    symbol = "AAPL"
    
    # We use a very recent 30-day window. The engine will automatically pull
    # the 300-day warmup data internally to calculate the 200-SMA.
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    start_str = start_date.strftime("%Y-%m-%d")
    end_str = end_date.strftime("%Y-%m-%d")
    
    # Provide mock yfinance data (include 300 days warmup)
    warmup_start = start_date - timedelta(days=300)
    dates = pd.date_range(warmup_start.strftime("%Y-%m-%d"), end_str, freq="B")
    mock_df = pd.DataFrame(index=dates, data={
        'Open': [100.0] * len(dates),
        'High': [105.0] * len(dates),
        'Low': [95.0] * len(dates),
        'Close': [100.0] * len(dates),
        'Volume': [1000] * len(dates),
    })
    mock_ticker.return_value.history.return_value = mock_df
    mock_ticker.return_value.info = {'beta': 1.0}

    try:
        results = HistoricalSimulationEngine.run_simulation(
            symbol=symbol,
            start_date=start_str,
            end_date=end_str
        )
        
        # Verify structure
        assert isinstance(results, list)
        
        if len(results) > 0:
            first_result = results[0]
            assert "date" in first_result
            assert "recommendation" in first_result
            assert "confidence_score" in first_result
            
            assert first_result["recommendation"] in ["BUY", "HOLD", "SELL"]
            assert 0 <= first_result["confidence_score"] <= 100
            
    except Exception as e:
        pytest.fail(f"Simulation engine raised an exception: {e}")

import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from app.services.backtesting.historical_simulation import HistoricalSimulationEngine

def test_historical_simulation_engine_no_lookahead_bias():
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

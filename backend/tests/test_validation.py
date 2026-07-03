import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from app.services.backtesting.validation_service import RecommendationValidationService

@pytest.fixture
def mock_hist_df():
    """Generates a mock dataframe with predictable prices for testing."""
    dates = pd.date_range(start="2024-01-01", periods=100, freq="B") # Business days
    
    # Create a predictable price curve: starts at 100, goes up 1 point per day
    prices = np.linspace(100, 199, 100)
    
    df = pd.DataFrame(index=dates, data={'Close': prices})
    return df

def test_validation_logic_buy_correct(mock_hist_df):
    signals = [{
        "date": "2024-01-01", # Entry price: 100
        "recommendation": "BUY",
        "confidence_score": 80
    }]
    
    result = RecommendationValidationService.validate_signals(signals, mock_hist_df)
    val = result['validated_signals'][0]
    
    assert val['entry_price'] == 100.0
    # 7 business days later is index 7. Price = 107. Return = 7% = 0.07
    assert val['return_7d'] == 0.07
    assert val['recommendation_correct']['7d'] is True # 0.07 > 0
    assert result['statistics_summary']['accuracy_7d'] == 100.0

def test_validation_logic_sell_incorrect(mock_hist_df):
    signals = [{
        "date": "2024-01-01", # Entry price: 100
        "recommendation": "SELL",
        "confidence_score": 80
    }]
    
    result = RecommendationValidationService.validate_signals(signals, mock_hist_df)
    val = result['validated_signals'][0]
    
    # The price goes UP in our mock, so a SELL recommendation is incorrect
    assert val['recommendation_correct']['7d'] is False
    assert result['statistics_summary']['accuracy_7d'] == 0.0

def test_validation_incomplete_window(mock_hist_df):
    """Test what happens if the signal is generated too close to current day (e.g. no 90d future)"""
    signals = [{
        "date": "2024-05-13", # Very near the end of our 100-day mock
        "recommendation": "HOLD",
        "confidence_score": 80
    }]
    
    result = RecommendationValidationService.validate_signals(signals, mock_hist_df)
    val = result['validated_signals'][0]
    
    # 90 days later doesn't exist in a 100-period dataframe starting Jan 1
    assert val['return_90d'] is None
    assert val['recommendation_correct']['90d'] is None
    assert result['statistics_summary']['accuracy_90d'] == 0.0 # Handled gracefully

def test_missing_data_handling():
    """Test that missing dates or empty dataframes don't crash the engine."""
    empty_df = pd.DataFrame()
    signals = [{"date": "2024-01-01", "recommendation": "BUY", "confidence_score": 50}]
    
    result = RecommendationValidationService.validate_signals(signals, empty_df)
    assert len(result['validated_signals']) == 0
    assert result['statistics_summary']['total_signals'] == 0

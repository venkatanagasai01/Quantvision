import pytest
import pandas as pd
import numpy as np

from app.services.portfolio.portfolio_simulator import PortfolioSimulator

@pytest.fixture
def mock_hist_df():
    """Generates a mock 10-day dataframe for testing portfolio logic."""
    dates = pd.date_range(start="2024-01-01", periods=10, freq="B")
    # Prices: 100, 110, 120, 130, 140, 150, 140, 130, 120, 110
    prices = [100.0, 110.0, 120.0, 130.0, 140.0, 150.0, 140.0, 130.0, 120.0, 110.0]
    df = pd.DataFrame(index=dates, data={'Close': prices})
    return df

def test_portfolio_buy_and_sell(mock_hist_df):
    signals = [
        {"date": "2024-01-01", "recommendation": "BUY", "entry_price": 100.0},
        {"date": "2024-01-08", "recommendation": "SELL", "entry_price": 150.0} # Day 6
    ]
    
    res = PortfolioSimulator.run_simulation(signals, mock_hist_df)
    
    assert res['initial_capital'] == 10000.0
    
    # Check Trade History
    trades = res['trade_history']
    assert len(trades) == 2
    
    # Buy Trade
    assert trades[0]['action'] == "BUY"
    assert trades[0]['price'] == 100.0
    assert trades[0]['shares'] == 100.0 # 10000 / 100
    assert trades[0]['cash_after_trade'] == 0.0
    
    # Sell Trade
    assert trades[1]['action'] == "SELL"
    assert trades[1]['price'] == 150.0
    assert trades[1]['shares'] == 100.0
    assert trades[1]['cash_after_trade'] == 15000.0 # 100 * 150
    
    # Final Metrics
    assert res['final_portfolio_value'] == 15000.0
    assert res['total_return_percent'] == 50.0

def test_duplicate_buy_and_sell(mock_hist_df):
    """Tests that consecutive identical signals are ignored."""
    signals = [
        {"date": "2024-01-01", "recommendation": "BUY", "entry_price": 100.0},
        {"date": "2024-01-02", "recommendation": "BUY", "entry_price": 110.0}, # Duplicate, should ignore
        {"date": "2024-01-08", "recommendation": "SELL", "entry_price": 150.0},
        {"date": "2024-01-09", "recommendation": "SELL", "entry_price": 140.0}  # Duplicate, should ignore
    ]
    
    res = PortfolioSimulator.run_simulation(signals, mock_hist_df)
    trades = res['trade_history']
    
    assert len(trades) == 2 # Only the first BUY and first SELL should execute
    assert res['final_portfolio_value'] == 15000.0

def test_hold_behavior(mock_hist_df):
    """Tests that HOLD signals do not alter cash or shares."""
    signals = [
        {"date": "2024-01-01", "recommendation": "HOLD", "entry_price": 100.0}, # Stays in cash
    ]
    
    res = PortfolioSimulator.run_simulation(signals, mock_hist_df)
    trades = res['trade_history']
    
    assert len(trades) == 0
    assert res['final_portfolio_value'] == 10000.0
    
def test_open_position_at_end(mock_hist_df):
    """Tests Mark-to-Market calculation if the simulation ends without a SELL."""
    signals = [
        {"date": "2024-01-01", "recommendation": "BUY", "entry_price": 100.0},
    ]
    
    res = PortfolioSimulator.run_simulation(signals, mock_hist_df)
    
    # Never sold. Final day price is 110.0 in the mock df
    assert len(res['trade_history']) == 1
    assert res['final_portfolio_value'] == 11000.0 # 100 shares * 110.0
    assert res['total_return_percent'] == 10.0

def test_empty_signals(mock_hist_df):
    """Test safe handling of empty data."""
    res = PortfolioSimulator.run_simulation([], mock_hist_df)
    assert res['final_portfolio_value'] == 10000.0
    assert len(res['equity_curve']) == 0

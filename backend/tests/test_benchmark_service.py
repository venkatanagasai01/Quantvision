import pytest
import pandas as pd
import numpy as np
from unittest.mock import patch

from app.services.benchmark.benchmark_service import BenchmarkService

@pytest.fixture
def mock_strategy_report():
    # 100 days of 0.1% daily return
    dates = pd.date_range("2024-01-01", periods=100, freq="B").strftime("%Y-%m-%d").tolist()
    daily_returns = [{"date": d, "return": 0.001} for d in dates]
    
    # Starting at 10000, growing by 0.1% a day
    equity = 10000.0
    equity_curve = []
    for d in dates:
        equity_curve.append({"date": d, "portfolio_value": equity})
        equity *= 1.001
        
    return {
        "performance_report": {
            "total_return": 0.105, # roughly 10.5%
        },
        "chart_data": {
            "daily_returns": daily_returns,
            "equity_curve": equity_curve
        }
    }

@pytest.fixture
def mock_yfinance_history():
    # Mock benchmark dataframe (S&P 500)
    # Grows by exactly 0.05% a day (Half the speed of the strategy)
    dates = pd.date_range("2024-01-01", periods=100, freq="B")
    prices = [100.0 * (1.0005 ** i) for i in range(100)]
    df = pd.DataFrame(index=dates, data={'Close': prices})
    return df

@patch("app.services.benchmark.benchmark_service.yf.Ticker")
def test_outperformance_alpha_beta(mock_ticker, mock_strategy_report, mock_yfinance_history):
    # Setup mock yfinance
    mock_ticker.return_value.history.return_value = mock_yfinance_history
    
    result = BenchmarkService.analyze_benchmark(
        strategy_report=mock_strategy_report,
        start_date="2024-01-01",
        end_date="2024-05-20",
        benchmark_symbol="^GSPC"
    )
    
    comp = result["comparison_metrics"]
    print("COMP:", comp)
    
    # 1. Strategy grew at 0.1% daily, benchmark at 0.05% daily. 
    # Excess return should be positive and it should outperform.
    assert comp["outperformed_benchmark"] is True
    assert comp["excess_return"] > 0
    
    # 2. Beta calculation
    # Since both are perfectly deterministic constant growth curves, variance is near 0.
    # Our edge case protection or math should prevent crashes.
    assert "beta" in comp
    assert "alpha" in comp
    assert "information_ratio" in comp

@patch("app.services.benchmark.benchmark_service.yf.Ticker")
def test_missing_benchmark_data(mock_ticker, mock_strategy_report):
    # Simulating a delisted or wrong ticker
    mock_ticker.return_value.history.return_value = pd.DataFrame()
    
    result = BenchmarkService.analyze_benchmark(
        strategy_report=mock_strategy_report,
        start_date="2024-01-01",
        end_date="2024-05-20",
        benchmark_symbol="INVALID_TICKER"
    )
    
    # Should safely return empty structure without raising Exception
    assert result["comparison_metrics"]["excess_return"] == 0.0
    assert len(result["chart_data"]["strategy_equity"]) == 0

def test_empty_strategy_report():
    result = BenchmarkService.analyze_benchmark(
        strategy_report={"chart_data": {"daily_returns": []}},
        start_date="2024-01-01",
        end_date="2024-05-20",
        benchmark_symbol="^GSPC"
    )
    
    assert result["comparison_metrics"]["alpha"] == 0.0

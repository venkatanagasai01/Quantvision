import pytest
from app.services.analytics.performance_metrics import PerformanceMetricsService

def test_empty_equity_curve():
    result = PerformanceMetricsService.calculate_metrics({"equity_curve": []})
    assert result["performance_report"]["total_return"] == 0.0
    assert len(result["chart_data"]["drawdown_curve"]) == 0

def test_single_day_curve():
    data = {"equity_curve": [{"date": "2024-01-01", "portfolio_value": 10000.0}]}
    result = PerformanceMetricsService.calculate_metrics(data)
    assert result["performance_report"]["total_return"] == 0.0

def test_constant_portfolio():
    data = {
        "equity_curve": [
            {"date": "2024-01-01", "portfolio_value": 10000.0},
            {"date": "2024-01-02", "portfolio_value": 10000.0},
            {"date": "2024-01-03", "portfolio_value": 10000.0}
        ]
    }
    result = PerformanceMetricsService.calculate_metrics(data)
    
    # Standard metrics should be safely 0
    report = result["performance_report"]
    assert report["total_return"] == 0.0
    assert report["annualized_volatility"] == 0.0
    assert report["sharpe_ratio"] == 0.0
    assert report["max_drawdown"] == 0.0
    assert report["win_rate"] == 0.0
    
    # First daily return is 0 (filled NaN), others are 0
    assert result["chart_data"]["daily_returns"][1]["return"] == 0.0

def test_profitable_curve_metrics():
    # 3 days: +10% then -5% then +15%
    data = {
        "equity_curve": [
            {"date": "2024-01-01", "portfolio_value": 10000.0},
            {"date": "2024-01-02", "portfolio_value": 11000.0}, # +10%
            {"date": "2024-01-03", "portfolio_value": 10450.0}, # -5%
            {"date": "2024-01-04", "portfolio_value": 12017.5}  # +15%
        ]
    }
    
    result = PerformanceMetricsService.calculate_metrics(data)
    report = result["performance_report"]
    
    # Win rate logic: 2 winning days, 1 losing day -> 66.6% win rate
    assert report["winning_days"] == 2
    assert report["losing_days"] == 1
    assert round(report["win_rate"], 2) == 0.67
    
    # Total return: (12017.5 - 10000) / 10000 = 20.175%
    assert round(report["total_return"], 4) == 0.2018
    
    # Max Drawdown: Peak was 11000, dropped to 10450. 
    # (10450 - 11000) / 11000 = -0.05
    assert round(report["max_drawdown"], 2) == -0.05
    
    # Sharpe & Sortino should be computable and positive
    assert report["sharpe_ratio"] > 0
    assert report["sortino_ratio"] > 0
    
    # Verify Chart Data arrays match length
    charts = result["chart_data"]
    assert len(charts["equity_curve"]) == 4
    assert len(charts["drawdown_curve"]) == 4
    assert len(charts["daily_returns"]) == 4
    
def test_downward_curve_metrics():
    data = {
        "equity_curve": [
            {"date": "2024-01-01", "portfolio_value": 10000.0},
            {"date": "2024-01-02", "portfolio_value": 9000.0},
            {"date": "2024-01-03", "portfolio_value": 8000.0}
        ]
    }
    
    result = PerformanceMetricsService.calculate_metrics(data)
    report = result["performance_report"]
    
    assert report["winning_days"] == 0
    assert report["losing_days"] == 2
    assert report["win_rate"] == 0.0
    assert report["loss_rate"] == 1.0
    assert report["max_drawdown"] == -0.20 # (8000 - 10000) / 10000
    
    # Since returns are all negative, sortino will be heavily penalized
    assert report["sharpe_ratio"] < 0
    assert report["sortino_ratio"] < 0

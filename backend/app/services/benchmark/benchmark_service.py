import pandas as pd
import numpy as np
import yfinance as yf
from typing import Dict, Any, Optional
from app.services.analytics.performance_metrics import PerformanceMetricsService

class BenchmarkService:
    """
    Benchmark Comparison Engine.
    Compares strategy performance against major market benchmarks (SPY, NIFTY, NASDAQ).
    """

    RISK_FREE_RATE = 0.04 # 4% Annualized

    @staticmethod
    def _safe_float(val: float) -> float:
        """Helper to ensure JSON safety for Edge Cases 5 (NaN/Inf)"""
        if pd.isna(val) or np.isinf(val):
            return 0.0
        return float(val)

    @classmethod
    def analyze_benchmark(
        cls, 
        strategy_report: Dict[str, Any], 
        start_date: str, 
        end_date: str, 
        benchmark_symbol: str = "^GSPC"
    ) -> Dict[str, Any]:
        """
        Calculates Alpha, Beta, Information Ratio, and generates relative charts.
        """
        
        # 1. Extract Strategy Data
        strategy_metrics = strategy_report.get("performance_report", {})
        chart_data = strategy_report.get("chart_data", {})
        
        strat_returns_raw = chart_data.get("daily_returns", [])
        
        # Edge Case 4: Short simulations / Empty Data
        if not strat_returns_raw or len(strat_returns_raw) < 2:
            return cls._empty_response()

        # Build Strategy Dataframes
        df_strat = pd.DataFrame(strat_returns_raw)
        df_strat['date'] = pd.to_datetime(df_strat['date'])
        df_strat.set_index('date', inplace=True)
        df_strat.rename(columns={'return': 'strat_return'}, inplace=True)

        strat_equity_raw = chart_data.get("equity_curve", [])
        df_equity = pd.DataFrame(strat_equity_raw)
        if not df_equity.empty:
            df_equity['date'] = pd.to_datetime(df_equity['date'])
            df_equity.set_index('date', inplace=True)
            df_strat['strat_equity'] = df_equity['portfolio_value']

        # 2. Fetch Benchmark Data
        try:
            bench_ticker = yf.Ticker(benchmark_symbol)
            df_bench = bench_ticker.history(start=start_date, end=end_date)
            
            # Edge Case 1 & 6: Missing or invalid benchmark
            if df_bench.empty:
                raise ValueError(f"No benchmark data for {benchmark_symbol}")
                
            # Normalize timezone
            if df_bench.index.tz is not None:
                df_bench.index = df_bench.index.tz_localize(None)

            # Feature 2: Benchmark Return & Equity Curve
            df_bench['bench_return'] = df_bench['Close'].pct_change().fillna(0.0)
            df_bench['bench_equity'] = (1 + df_bench['bench_return']).cumprod() * 10000.0 # Normalize to 10k baseline
            
        except Exception as e:
            print(f"Benchmark Fetch Error: {e}")
            return cls._empty_response()

        # 3. Align Dataframes (Feature 1)
        # Inner join to perfectly align trading calendars, dropping mismatched holidays
        df_merged = df_strat.join(df_bench[['bench_return', 'bench_equity']], how='inner').dropna()
        
        if len(df_merged) < 2:
            return cls._empty_response()

        # Calculate Benchmark Metrics (Feature 2) using our existing Analytics Engine structure
        # We simulate passing the benchmark equity curve through PerformanceMetricsService
        bench_mock_curve = [{"date": d.strftime("%Y-%m-%d"), "portfolio_value": v} for d, v in zip(df_merged.index, df_merged['bench_equity'])]
        bench_analytics = PerformanceMetricsService.calculate_metrics({"equity_curve": bench_mock_curve})
        benchmark_metrics = bench_analytics["performance_report"]

        # Vectorized Returns
        R_s = df_merged['strat_return']
        R_b = df_merged['bench_return']

        # 4. Beta Calculation (Feature 4)
        cov_matrix = np.cov(R_s, R_b)
        variance_b = np.var(R_b, ddof=1)
        
        # Edge Case 3: Zero variance benchmark (e.g. static flatline)
        if variance_b > 0:
            beta = cov_matrix[0, 1] / variance_b
        else:
            beta = 1.0

        # 5. Alpha Calculation (Feature 3) - CAPM Annualized
        ann_strat_return = strategy_metrics.get("total_return", 0.0) # Using total or CAGR? Let's use annualized if available.
        # It's better to use annualized daily returns for CAPM
        ann_rs = R_s.mean() * 252
        ann_rb = R_b.mean() * 252
        
        expected_return = cls.RISK_FREE_RATE + beta * (ann_rb - cls.RISK_FREE_RATE)
        alpha = ann_rs - expected_return

        # 6. Excess Return (Feature 5)
        excess_return = ann_rs - ann_rb

        # 7. Information Ratio (Feature 6)
        active_returns = R_s - R_b
        tracking_error = active_returns.std() * np.sqrt(252)
        
        if tracking_error > 0:
            information_ratio = (active_returns.mean() * 252) / tracking_error
        else:
            information_ratio = 0.0

        # 8. Outperformance Analysis (Feature 7)
        outperformed = bool(excess_return > 0)

        comparison_metrics = {
            "excess_return": cls._safe_float(excess_return),
            "alpha": cls._safe_float(alpha),
            "beta": cls._safe_float(beta),
            "information_ratio": cls._safe_float(information_ratio),
            "outperformed_benchmark": outperformed
        }

        # 9. Chart Data (Feature 9)
        dates_str = df_merged.index.strftime("%Y-%m-%d").tolist()
        
        # Relative Performance (Strategy / Benchmark)
        df_merged['relative_perf'] = df_merged['strat_equity'] / df_merged['bench_equity']
        
        # Rolling Alpha / Excess (20-day window for charts)
        window = 20
        df_merged['rolling_strat_ret'] = df_merged['strat_return'].rolling(window).mean() * 252
        df_merged['rolling_bench_ret'] = df_merged['bench_return'].rolling(window).mean() * 252
        df_merged['rolling_excess'] = df_merged['rolling_strat_ret'] - df_merged['rolling_bench_ret']
        
        # Rolling Beta for Rolling Alpha
        # Simplified Rolling Alpha for charting: Rolling Excess - (1 - Beta) * RiskFree? 
        # Standard: Rolling Strat - (Rf + Beta * (Rolling Bench - Rf))
        df_merged['rolling_alpha'] = df_merged['rolling_strat_ret'] - (cls.RISK_FREE_RATE + beta * (df_merged['rolling_bench_ret'] - cls.RISK_FREE_RATE))

        chart_data_out = {
            "strategy_equity": [{"date": d, "value": cls._safe_float(v)} for d, v in zip(dates_str, df_merged['strat_equity'])],
            "benchmark_equity": [{"date": d, "value": cls._safe_float(v)} for d, v in zip(dates_str, df_merged['bench_equity'])],
            "relative_performance": [{"date": d, "ratio": cls._safe_float(v)} for d, v in zip(dates_str, df_merged['relative_perf'])],
            "rolling_alpha": [{"date": d, "value": cls._safe_float(v)} for d, v in zip(dates_str, df_merged['rolling_alpha'].fillna(0))],
            "rolling_excess_return": [{"date": d, "value": cls._safe_float(v)} for d, v in zip(dates_str, df_merged['rolling_excess'].fillna(0))]
        }

        # 10. Compile Report (Feature 8)
        return {
            "strategy_metrics": strategy_metrics,
            "benchmark_metrics": benchmark_metrics,
            "comparison_metrics": comparison_metrics,
            "chart_data": chart_data_out
        }

    @staticmethod
    def _empty_response() -> Dict[str, Any]:
        return {
            "strategy_metrics": {},
            "benchmark_metrics": {},
            "comparison_metrics": {
                "excess_return": 0.0,
                "alpha": 0.0,
                "beta": 1.0,
                "information_ratio": 0.0,
                "outperformed_benchmark": False
            },
            "chart_data": {
                "strategy_equity": [],
                "benchmark_equity": [],
                "relative_performance": [],
                "rolling_alpha": [],
                "rolling_excess_return": []
            }
        }

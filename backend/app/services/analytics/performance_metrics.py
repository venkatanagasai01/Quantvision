import pandas as pd
import numpy as np
from typing import Dict, Any, List

class PerformanceMetricsService:
    """
    Professional Performance Analytics Engine.
    Calculates industry-standard quantitative metrics from a portfolio equity curve.
    """

    RISK_FREE_RATE = 0.04 # 4% Annualized

    @staticmethod
    def calculate_metrics(portfolio_output: Dict[str, Any]) -> Dict[str, Any]:
        equity_curve_raw = portfolio_output.get("equity_curve", [])
        
        # 1. Handle Empty Equity Curve
        if not equity_curve_raw or len(equity_curve_raw) < 2:
            return PerformanceMetricsService._get_empty_response()

        df = pd.DataFrame(equity_curve_raw)
        df['date'] = pd.to_datetime(df['date'])
        df.set_index('date', inplace=True)
        
        # 2. Daily Returns Series
        # pct_change() generates NaN for the first row. We fill it with 0 to maintain array length for charts
        df['daily_return'] = df['portfolio_value'].pct_change()
        df['daily_return'] = df['daily_return'].fillna(0.0)
        
        # 3. Total Return
        initial_val = df['portfolio_value'].iloc[0]
        final_val = df['portfolio_value'].iloc[-1]
        
        if initial_val <= 0:
            return PerformanceMetricsService._get_empty_response()
            
        total_return = (final_val - initial_val) / initial_val

        # 4. CAGR
        # Handle periods < 1 year by scaling up, but use calendar days to be highly accurate
        days_diff = (df.index[-1] - df.index[0]).days
        years = max(days_diff / 365.25, 1 / 252.0) # Prevent zero division, minimum period 1 day
        cagr = ((final_val / initial_val) ** (1 / years)) - 1
        
        # 5. Volatility (Annualized)
        daily_std = df['daily_return'].std()
        annualized_volatility = daily_std * np.sqrt(252) if pd.notna(daily_std) else 0.0

        # 6. Sharpe Ratio
        mean_daily_return = df['daily_return'].mean()
        annualized_return = mean_daily_return * 252
        
        if annualized_volatility > 0:
            sharpe_ratio = (annualized_return - PerformanceMetricsService.RISK_FREE_RATE) / annualized_volatility
        else:
            sharpe_ratio = 0.0

        # 7. Sortino Ratio
        downside_returns = df[df['daily_return'] < 0]['daily_return']
        downside_std = downside_returns.std() * np.sqrt(252) if len(downside_returns) > 1 else 0.0
        
        if downside_std > 0:
            sortino_ratio = (annualized_return - PerformanceMetricsService.RISK_FREE_RATE) / downside_std
        else:
            sortino_ratio = 0.0 if mean_daily_return <= 0 else 999.0 # Infinite Sortino if no downside and positive return

        # 8. Maximum Drawdown
        df['peak'] = df['portfolio_value'].cummax()
        df['drawdown'] = (df['portfolio_value'] - df['peak']) / df['peak']
        
        # Replace NaN/Inf in drawdown with 0.0
        df['drawdown'] = df['drawdown'].replace([np.inf, -np.inf], 0.0).fillna(0.0)
        max_drawdown = df['drawdown'].min()

        # 9. Win/Loss Metrics
        # Ignore zero return days (e.g. holding cash)
        winning_days = len(df[df['daily_return'] > 0])
        losing_days = len(df[df['daily_return'] < 0])
        active_days = winning_days + losing_days
        
        win_rate = winning_days / active_days if active_days > 0 else 0.0
        loss_rate = losing_days / active_days if active_days > 0 else 0.0

        # Build Chart Data
        # Ensure native Python float conversion to avoid JSON serialization errors
        dates_str = df.index.strftime("%Y-%m-%d").tolist()
        
        drawdown_curve = [
            {"date": d, "drawdown": float(v)} 
            for d, v in zip(dates_str, df['drawdown'].values)
        ]
        
        daily_return_series = [
            {"date": d, "return": float(v)} 
            for d, v in zip(dates_str, df['daily_return'].values)
        ]

        # Clean NaN/Inf in scalar values before returning
        def safe_float(val):
            return 0.0 if pd.isna(val) or np.isinf(val) else float(val)

        return {
            "performance_report": {
                "total_return": safe_float(total_return),
                "CAGR": safe_float(cagr),
                "annualized_volatility": safe_float(annualized_volatility),
                "sharpe_ratio": safe_float(sharpe_ratio),
                "sortino_ratio": safe_float(sortino_ratio),
                "max_drawdown": safe_float(max_drawdown),
                "win_rate": safe_float(win_rate),
                "loss_rate": safe_float(loss_rate),
                "winning_days": winning_days,
                "losing_days": losing_days
            },
            "chart_data": {
                "equity_curve": equity_curve_raw,
                "drawdown_curve": drawdown_curve,
                "daily_returns": daily_return_series
            }
        }

    @staticmethod
    def _get_empty_response() -> Dict[str, Any]:
        """Returns a safe empty structure for edge cases."""
        return {
            "performance_report": {
                "total_return": 0.0,
                "CAGR": 0.0,
                "annualized_volatility": 0.0,
                "sharpe_ratio": 0.0,
                "sortino_ratio": 0.0,
                "max_drawdown": 0.0,
                "win_rate": 0.0,
                "loss_rate": 0.0,
                "winning_days": 0,
                "losing_days": 0
            },
            "chart_data": {
                "equity_curve": [],
                "drawdown_curve": [],
                "daily_returns": []
            }
        }

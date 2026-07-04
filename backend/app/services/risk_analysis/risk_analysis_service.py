import pandas as pd
import numpy as np
from typing import Dict, Any

class RiskAnalysisService:
    """
    Calculates Volatility, Drawdown, and dynamic Beta risk scores.
    """

    @staticmethod
    def analyze(market_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            hist_data = market_data['historical']
            benchmark_hist = market_data.get('benchmark_historical')
            
            # Calculate daily returns
            returns = hist_data['Close'].pct_change().dropna()
            
            # Annualized Volatility
            volatility = returns.std() * np.sqrt(252)

            # Maximum Drawdown
            cumulative_returns = (1 + returns).cumprod()
            peak = cumulative_returns.cummax()
            drawdown = (cumulative_returns - peak) / peak
            max_drawdown = drawdown.min()

            # Dynamic Beta Calculation
            beta = 1.0
            if benchmark_hist is not None and not benchmark_hist.empty:
                bench_returns = benchmark_hist['Close'].pct_change().dropna()
                aligned = pd.concat([returns, bench_returns], axis=1, join='inner').dropna()
                if len(aligned) > 30: # Ensure enough data points
                    cov = aligned.cov().iloc[0, 1]
                    var = aligned.iloc[:, 1].var()
                    if var > 0:
                        beta = cov / var
            else:
                # Fallback to API provided beta if benchmark missing
                beta = market_data.get('beta', 1.0)

            # Risk Score Logic (Lower risk = Higher score 0-100)
            score = 100
            
            if volatility > 0.4: score -= 30
            elif volatility > 0.2: score -= 15

            if max_drawdown < -0.3: score -= 30
            elif max_drawdown < -0.15: score -= 15

            if beta > 1.5: score -= 20
            elif beta < 0.5: score += 10 # Low market risk

            score = max(0, min(100, score))

            return {
                "volatility": round(volatility * 100, 2), # percentage
                "drawdown": round(max_drawdown * 100, 2), # percentage
                "beta": round(beta, 2),
                "score": score
            }
        except Exception as e:
            print(f"Risk analysis error: {e}")
            return {"volatility": 0, "drawdown": 0, "beta": 1.0, "score": 50}

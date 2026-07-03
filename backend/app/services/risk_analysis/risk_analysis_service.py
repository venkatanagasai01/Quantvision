import pandas as pd
import numpy as np
from typing import Dict, Any

class RiskAnalysisService:
    """
    Calculates Volatility, Drawdown, and Beta risk scores.
    """

    @staticmethod
    def analyze(hist_data: pd.DataFrame, beta: float) -> Dict[str, Any]:
        try:
            # Calculate daily returns
            returns = hist_data['Close'].pct_change().dropna()
            
            # Annualized Volatility
            volatility = returns.std() * np.sqrt(252)

            # Maximum Drawdown
            cumulative_returns = (1 + returns).cumprod()
            peak = cumulative_returns.cummax()
            drawdown = (cumulative_returns - peak) / peak
            max_drawdown = drawdown.min()

            # Risk Score Logic (Lower risk = Higher score 0-100)
            # High volatility/drawdown/beta lowers the score.
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

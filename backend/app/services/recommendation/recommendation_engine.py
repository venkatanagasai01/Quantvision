from typing import Dict, Any

class RecommendationEngine:
    """
    Weighted Scoring Engine to generate BUY, HOLD, or SELL recommendations.
    """

    @staticmethod
    def generate_recommendation(tech_score: int, fund_score: int, risk_score: int, sentiment_score: float = 0.0) -> Dict[str, Any]:
        """
        Weights:
        - Technical: 35%
        - Fundamental: 35%
        - Risk: 15%
        - Sentiment: 15% (Scale is -100 to 100, map it to 0-100 for global logic)
        """
        # Map sentiment [-100, 100] -> [0, 100]
        mapped_sentiment = (sentiment_score + 100) / 2
        
        # Calculate Final Score
        final_score = (tech_score * 0.35) + (fund_score * 0.35) + (risk_score * 0.15) + (mapped_sentiment * 0.15)
        final_score = round(final_score)

        # Recommendation Logic
        if final_score >= 70:
            recommendation = "BUY"
        elif final_score >= 45:
            recommendation = "HOLD"
        else:
            recommendation = "SELL"

        return {
            "recommendation": recommendation,
            "confidence_score": final_score,
            "technical_score": tech_score,
            "fundamental_score": fund_score,
            "risk_score": risk_score,
            "sentiment_score": round(sentiment_score, 2)
        }

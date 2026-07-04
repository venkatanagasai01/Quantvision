from typing import Dict, Any

class RecommendationEngine:
    """
    Weighted Scoring Engine to generate BUY, HOLD, or SELL recommendations
    based on risk profiles.
    """
    
    PROFILES = {
        "conservative": {"tech": 0.20, "fund": 0.45, "risk": 0.25, "sent": 0.10},
        "balanced":     {"tech": 0.35, "fund": 0.35, "risk": 0.15, "sent": 0.15},
        "aggressive":   {"tech": 0.45, "fund": 0.20, "risk": 0.05, "sent": 0.30},
    }

    @classmethod
    def generate_recommendation(
        cls, 
        tech_score: int, 
        fund_score: int, 
        risk_score: int, 
        sentiment_score: float = 0.0,
        profile: str = "balanced"
    ) -> Dict[str, Any]:
        """
        Generates recommendation based on dynamic weights.
        """
        # Ensure profile exists, fallback to balanced
        weights = cls.PROFILES.get(profile.lower(), cls.PROFILES["balanced"])
        
        # Map sentiment [-100, 100] -> [0, 100]
        mapped_sentiment = (sentiment_score + 100) / 2
        
        # Calculate Final Score
        final_score = (
            (tech_score * weights["tech"]) + 
            (fund_score * weights["fund"]) + 
            (risk_score * weights["risk"]) + 
            (mapped_sentiment * weights["sent"])
        )
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
            "sentiment_score": round(sentiment_score, 2),
            "profile_used": profile.lower()
        }

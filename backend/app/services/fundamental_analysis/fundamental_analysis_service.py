from typing import Dict, Any

class FundamentalAnalysisService:
    """
    Calculates fundamental scores based on PE, EPS growth, and Market Cap.
    Implements a bounded/multiplier scoring system to prevent absolute failures.
    """
    
    # Simple static currency conversion to USD for major currencies
    CURRENCY_MULTIPLIERS = {
        "USD": 1.0,
        "EUR": 1.08,
        "GBP": 1.26,
        "INR": 0.012, # roughly 83 INR per USD
        "CAD": 0.73,
        "AUD": 0.65,
        "JPY": 0.0066,
        "HKD": 0.13,
        "CNY": 0.14
    }

    @classmethod
    def analyze(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            pe_ratio = data.get('pe_ratio', 0)
            eps = data.get('eps', 0)
            forward_eps = data.get('forward_eps', 0)
            market_cap_raw = data.get('market_cap', 0)
            currency = data.get('currency', 'USD').upper()
            
            # Normalize market cap to USD
            multiplier = cls.CURRENCY_MULTIPLIERS.get(currency, 1.0)
            market_cap_usd = market_cap_raw * multiplier

            # Base score
            score = 50.0

            # 1. PE Ratio Logic (Multiplier based)
            if pe_ratio:
                if 0 < pe_ratio < 15:
                    score *= 1.2  # +20% boost
                elif 15 <= pe_ratio <= 25:
                    score *= 1.1  # +10% boost
                elif pe_ratio > 35:
                    score *= 0.8  # -20% penalty
                elif pe_ratio < 0:
                    score *= 0.7  # Negative PE penalty (losing money)

            # 2. EPS Growth Trajectory
            # If both are valid, check growth
            if eps and forward_eps:
                growth = (forward_eps - eps) / abs(eps) if eps != 0 else 0
                if growth > 0.2:
                    score *= 1.25 # High growth boost
                elif growth > 0.05:
                    score *= 1.1
                elif growth < -0.1:
                    score *= 0.8  # Shrinking earnings
            elif eps > 0:
                # Fallback if no forward EPS is available
                score *= 1.1

            # 3. Market Cap Logic (Larger is more stable, provides a floor)
            if market_cap_usd > 100_000_000_000:
                score *= 1.15 # Large Cap stability

            # Bound the final score
            final_score = max(0, min(100, int(score)))

            return {
                "pe_ratio": round(pe_ratio, 2) if pe_ratio else 0,
                "eps": round(eps, 2),
                "forward_eps": round(forward_eps, 2),
                "market_cap": market_cap_raw,
                "market_cap_usd": int(market_cap_usd),
                "currency": currency,
                "score": final_score
            }
        except Exception as e:
            print(f"Fundamental analysis error: {e}")
            return {"pe_ratio": 0, "eps": 0, "forward_eps": 0, "market_cap": 0, "score": 50}

from typing import Dict, Any

class FundamentalAnalysisService:
    """
    Calculates fundamental scores based on PE, EPS, Market Cap.
    """

    @staticmethod
    def analyze(data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            pe_ratio = data.get('pe_ratio', 0)
            eps = data.get('eps', 0)
            market_cap = data.get('market_cap', 0)

            score = 50

            # PE Ratio Logic (lower is generally better, but negative is bad)
            if pe_ratio and 0 < pe_ratio < 15: score += 20
            elif pe_ratio and 15 <= pe_ratio <= 25: score += 10
            elif pe_ratio and pe_ratio > 35: score -= 15

            # EPS Logic
            if eps > 0: score += 15
            elif eps < 0: score -= 20

            # Market Cap Logic (Larger is more stable fundamentally)
            if market_cap > 100_000_000_000: score += 15 # > 100B Large Cap

            score = max(0, min(100, score))

            return {
                "pe_ratio": round(pe_ratio, 2) if pe_ratio else 0,
                "eps": round(eps, 2),
                "market_cap": market_cap,
                "score": score
            }
        except Exception as e:
            print(f"Fundamental analysis error: {e}")
            return {"pe_ratio": 0, "eps": 0, "market_cap": 0, "score": 50}

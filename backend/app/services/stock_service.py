from typing import List, Optional
from app.models.stock import StockSearchResponse, StockDetailsResponse, StockAnalysisResponse

class StockService:
    @staticmethod
    def search_stocks(query: str) -> List[StockSearchResponse]:
        # Mock data search
        mock_db = [
            {"symbol": "TCS", "name": "Tata Consultancy Services"},
            {"symbol": "INFY", "name": "Infosys Limited"},
            {"symbol": "RELIANCE", "name": "Reliance Industries"},
            {"symbol": "AAPL", "name": "Apple Inc."},
        ]
        
        results = [
            StockSearchResponse(**stock) for stock in mock_db 
            if query.lower() in stock['symbol'].lower() or query.lower() in stock['name'].lower()
        ]
        return results

    @staticmethod
    def get_stock_details(symbol: str) -> Optional[StockDetailsResponse]:
        # Mock details
        return StockDetailsResponse(
            symbol=symbol.upper(),
            name=f"Mock Company ({symbol.upper()})",
            current_price=1245.50,
            change_percentage=1.24,
            market_cap="1.2T"
        )

    @staticmethod
    def analyze_stock(symbol: str) -> StockAnalysisResponse:
        # Mock analysis (Gemini integration will replace this)
        return StockAnalysisResponse(
            symbol=symbol.upper(),
            recommendation="BUY",
            confidence=85,
            target_price="1500.00",
            timeframe="3-6 Months",
            technical_scores={
                "trend": "Bullish",
                "rsi": "60.2 (Neutral)",
                "macd": "Positive Divergence",
                "volatility": "Low"
            },
            sentiment_score={
                "overall": 78,
                "label": "Positive",
                "newsImpact": "High",
                "socialMentions": "Stable"
            },
            investment_thesis=[
                "Strong quarterly revenue growth.",
                "Favorable macroeconomic conditions in the sector.",
            ],
            risk_analysis=[
                "Potential regulatory changes ahead.",
                "Currency exchange rate volatility."
            ]
        )

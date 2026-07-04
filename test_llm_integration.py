import asyncio
import sys
import os
from dotenv import load_dotenv

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))
load_dotenv(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'backend', '.env'))

from backend.app.services.llm_analysis.llm_sentiment_service import LLMSentimentService

async def test_llm():
    print("Fetching news for AAPL...")
    news = await LLMSentimentService.fetch_recent_news("AAPL")
    print(f"News preview: {news[:200]}...")

    quant_scores = {
        'tech_score': 75,
        'fund_score': 80,
        'risk_score': 45
    }
    
    print("\nAsking Gemini for sentiment analysis...")
    result = await LLMSentimentService.analyze_sentiment("AAPL", quant_scores)
    print("\nLLM Result:")
    import json
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    asyncio.run(test_llm())

import os
import json
import asyncio
from typing import Dict, Any
import google.generativeai as genai
from ddgs import DDGS
from dotenv import load_dotenv
from cachetools import TTLCache
import uuid

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
ENV_PATH = os.path.join(BASE_DIR, '.env')
load_dotenv(ENV_PATH)

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    print("WARNING: GEMINI_API_KEY not found in environment.")

# Cache for news and sentiment (15 minutes)
llm_cache = TTLCache(maxsize=100, ttl=900)

class LLMSentimentService:
    @staticmethod
    async def fetch_recent_news(symbol: str, max_results: int = 5) -> str:
        """
        Fetches the latest news headlines for the given symbol using DuckDuckGo.
        Runs in a separate thread to avoid blocking the event loop.
        """
        def _fetch():
            cache_key = f"news_{symbol}_{max_results}"
            if cache_key in llm_cache:
                return llm_cache[cache_key]
                
            try:
                results = DDGS().news(keywords=f"{symbol} stock market news", max_results=max_results)
                if not results:
                    return "No recent news found."
                
                news_text = ""
                for i, article in enumerate(results):
                    news_text += f"{i+1}. {article.get('title', '')} - {article.get('body', '')}\n"
                
                llm_cache[cache_key] = news_text
                return news_text
            except Exception as e:
                print(f"Error fetching news for {symbol}: {e}")
                return "Failed to fetch news due to network error or rate limit."

        return await asyncio.to_thread(_fetch)

    @staticmethod
    async def analyze_sentiment(symbol: str, quant_scores: Dict[str, Any]) -> Dict[str, Any]:
        """
        Asks Gemini to analyze the breaking news alongside the quant scores.
        Returns a structured dictionary with sentiment, risk override, and explanation.
        """
        if not api_key:
            # Fallback if no API key is provided
            return {
                "ai_sentiment_score": 0.0,
                "risk_override": False,
                "ai_explanation": "Gemini API key missing. Defaulting to neutral sentiment."
            }
            
        cache_key = f"sentiment_{symbol}"
        if cache_key in llm_cache:
            return llm_cache[cache_key]

        # 1. Fetch News
        news_context = await LLMSentimentService.fetch_recent_news(symbol)

        # 2. Prepare Prompt
        prompt = f"""
        You are an expert AI quantitative and qualitative financial analyst.
        I am giving you the latest quant model scores and breaking news for the stock: {symbol}

        Current Quant Scores:
        - Technical Analysis Score: {quant_scores.get('tech_score', 'N/A')}/100
        - Fundamental Analysis Score: {quant_scores.get('fund_score', 'N/A')}/100
        - Risk Analysis Score (Lower is riskier): {quant_scores.get('risk_score', 'N/A')}/100

        Breaking News / Recent Context:
        {news_context}

        Task:
        1. Evaluate the sentiment of the news. Is it extremely bullish, neutral, or severely bearish (e.g. war, bankruptcy, fraud)?
        2. Output a sentiment score between -100 (extremely bearish) and 100 (extremely bullish). 0 is neutral.
        3. If there is a critical, company-ending or macro-economic disaster event (like war, major fraud, bankruptcy) that invalidates the quantitative scores, set risk_override to true. Otherwise false.
        4. Provide a 2-3 sentence qualitative explanation for your rating.

        You MUST respond ONLY with a valid JSON object in the following format, with no markdown formatting around it:
        {{
            "ai_sentiment_score": float,
            "risk_override": boolean,
            "ai_explanation": string
        }}
        """

        # 3. Call Gemini
        def _call_gemini():
            try:
                model = genai.GenerativeModel("gemini-1.5-flash-latest", generation_config={"response_mime_type": "application/json"})
                response = model.generate_content(prompt)
                
                return json.loads(response.text)
            except Exception as e:
                print(f"Error calling Gemini for {symbol}: {e}")
                return None
                
        # 4. Parse Response
        ai_result = await asyncio.to_thread(_call_gemini)
        
        if ai_result:
            llm_cache[cache_key] = ai_result
            return ai_result
        else:
            return {
                "ai_sentiment_score": 0.0,
                "risk_override": False,
                "ai_explanation": "Failed to analyze sentiment. Defaulting to neutral."
            }

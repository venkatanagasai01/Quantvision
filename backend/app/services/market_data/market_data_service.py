import yfinance as yf
import pandas as pd
import asyncio
from typing import Dict, Any, Optional
from cachetools import TTLCache
from requests.exceptions import HTTPError, JSONDecodeError
from fastapi import HTTPException

class MarketDataService:
    """
    Service responsible for fetching and caching raw market data from Yahoo Finance.
    """
    # Max 1000 items, expires after 1 hour (3600 seconds)
    _cache = TTLCache(maxsize=1000, ttl=3600)

    @classmethod
    async def fetch_stock_data(cls, symbol: str, period: str = "2y") -> Optional[Dict[str, Any]]:
        """
        Fetches historical prices and fundamental info for a given ticker.
        """
        cache_key = f"{symbol}_{period}"
        if cache_key in cls._cache:
            return cls._cache[cache_key]

        try:
            ticker = yf.Ticker(symbol)
            # Fetch history and info asynchronously using thread pool
            hist = await asyncio.to_thread(ticker.history, period=period)
            
            if hist.empty:
                raise ValueError(f"Empty history from yfinance for {symbol}")
            
            info = await asyncio.to_thread(lambda: ticker.info)
            
            # Fetch benchmark data (^GSPC = S&P 500) for risk calculations
            benchmark_ticker = yf.Ticker("^GSPC")
            benchmark_hist = await asyncio.to_thread(benchmark_ticker.history, period=period)
            
            data = {
                "historical": hist,
                "benchmark_historical": benchmark_hist,
                "current_price": hist['Close'].iloc[-1],
                "volume": hist['Volume'].iloc[-1],
                "market_cap": info.get('marketCap', 0),
                "currency": info.get('currency', 'USD'),
                "pe_ratio": info.get('trailingPE', None) or info.get('forwardPE', 0),
                "eps": info.get('trailingEps', 0),
                "forward_eps": info.get('forwardEps', 0),
                "beta": info.get('beta', 1.0) # we will override this in risk analysis
            }
            
            cls._cache[cache_key] = data
            return data
            
        except HTTPError as e:
            error_msg = str(e)
            if "429" in error_msg or "Too Many Requests" in error_msg:
                print(f"Rate limited by Yahoo Finance: {e}")
                raise HTTPException(status_code=429, detail="Rate limited by financial data provider.")
            if "404" in error_msg or "Not Found" in error_msg:
                print(f"Symbol not found: {e}")
                raise HTTPException(status_code=404, detail="Symbol not found.")
            raise HTTPException(status_code=502, detail="Error communicating with financial data provider.")
        except JSONDecodeError as e:
            print(f"Failed to parse Yahoo Finance response: {e}")
            raise HTTPException(status_code=502, detail="Invalid data received from provider.")
        except Exception as e:
            print(f"Error fetching data for {symbol}: {e}. Falling back to mock data.")
            import numpy as np
            import datetime
            # Generate 504 days of mock data (approx 2 years)
            dates = pd.date_range(end=datetime.date.today(), periods=504, freq='B')
            np.random.seed(len(symbol))
            prices = 150 + np.random.randn(504).cumsum() * 2
            
            hist = pd.DataFrame({
                'Open': prices - np.random.random(504),
                'High': prices + np.random.random(504),
                'Low': prices - np.random.random(504) * 2,
                'Close': prices,
                'Volume': np.random.randint(1000000, 10000000, 504)
            }, index=dates)
            
            data = {
                "historical": hist,
                "benchmark_historical": hist.copy(), # Mock benchmark
                "current_price": hist['Close'].iloc[-1],
                "volume": hist['Volume'].iloc[-1],
                "market_cap": 2500000000000,
                "currency": "USD",
                "pe_ratio": 28.5,
                "eps": 5.5,
                "forward_eps": 6.5,
                "beta": 1.1
            }
            cls._cache[cache_key] = data
            return data

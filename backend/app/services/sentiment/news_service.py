import yfinance as yf
from datetime import datetime
from typing import List, Dict, Any

class NewsService:
    """
    Service responsible for fetching and normalizing news articles for a given stock symbol.
    """

    @staticmethod
    def fetch_recent_news(symbol: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Fetches news from Yahoo Finance, deduplicates, and formats timestamps.
        Returns empty list if no news found.
        """
        try:
            ticker = yf.Ticker(symbol)
            raw_news = ticker.news
            
            if not raw_news:
                return []
                
            normalized = []
            seen_uuids = set()
            
            for item in raw_news:
                # Deduplicate by UUID
                uuid = item.get("uuid", "")
                if uuid in seen_uuids:
                    continue
                seen_uuids.add(uuid)
                
                # We prioritize summary if available, else we use the title.
                # In many finance contexts, the title conveys the strongest sentiment anyway.
                content = item.get("summary") or item.get("title") or ""
                
                # Parse timestamp
                published_at_unix = item.get("providerPublishTime")
                if published_at_unix:
                    published_at = datetime.utcfromtimestamp(published_at_unix).isoformat()
                else:
                    published_at = datetime.utcnow().isoformat()
                    
                normalized.append({
                    "title": item.get("title", "Unknown Title"),
                    "source": item.get("publisher", "Unknown Source"),
                    "published_at": published_at,
                    "content": content
                })
                
                if len(normalized) >= limit:
                    break
                    
            return normalized
            
        except Exception as e:
            print(f"Failed to fetch news for {symbol}: {str(e)}")
            return []

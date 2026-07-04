import pandas as pd
import numpy as np
from typing import Dict, Any

class TechnicalAnalysisService:
    """
    Calculates technical indicators using pure pandas (no external TA library).
    Computes: SMA-50, SMA-200, RSI-14, MACD(12,26,9), ATR-14.
    """

    @staticmethod
    def _compute_rsi(close: pd.Series, period: int = 14) -> pd.Series:
        """Compute RSI using exponential weighted moving average."""
        delta = close.diff()
        gain = delta.where(delta > 0, 0.0)
        loss = -delta.where(delta < 0, 0.0)
        avg_gain = gain.ewm(com=period - 1, min_periods=period).mean()
        avg_loss = loss.ewm(com=period - 1, min_periods=period).mean()
        rs = avg_gain / avg_loss
        return 100 - (100 / (1 + rs))

    @staticmethod
    def _compute_macd(close: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9):
        """Compute MACD line, signal line, and histogram."""
        ema_fast = close.ewm(span=fast, adjust=False).mean()
        ema_slow = close.ewm(span=slow, adjust=False).mean()
        macd_line = ema_fast - ema_slow
        signal_line = macd_line.ewm(span=signal, adjust=False).mean()
        histogram = macd_line - signal_line
        return macd_line, signal_line, histogram

    @staticmethod
    def _compute_atr(df: pd.DataFrame, period: int = 14) -> pd.Series:
        """Compute Average True Range."""
        high = df['High']
        low = df['Low']
        close = df['Close'].shift(1)
        tr = pd.concat([
            high - low,
            (high - close).abs(),
            (low - close).abs()
        ], axis=1).max(axis=1)
        return tr.rolling(window=period).mean()

    @classmethod
    def analyze(cls, hist_data: pd.DataFrame) -> Dict[str, Any]:
        """
        Full technical analysis from raw OHLCV data.
        Returns scores, indicators, and trend classification.
        """
        try:
            df = hist_data.copy()
            close = df['Close']

            # Compute all indicators
            df['SMA_50'] = close.rolling(window=50).mean()
            df['SMA_200'] = close.rolling(window=200).mean()
            df['RSI_14'] = cls._compute_rsi(close)
            macd_line, signal_line, histogram = cls._compute_macd(close)
            df['MACD_12_26_9'] = macd_line
            df['MACDs_12_26_9'] = signal_line
            df['MACDh_12_26_9'] = histogram
            df['ATRr_14'] = cls._compute_atr(df)

            latest = df.iloc[-1]
            prev = df.iloc[-2] if len(df) > 1 else latest

            rsi = float(latest['RSI_14']) if pd.notna(latest['RSI_14']) else 50.0
            macd_val = float(latest['MACD_12_26_9']) if pd.notna(latest['MACD_12_26_9']) else 0.0
            macd_sig = float(latest['MACDs_12_26_9']) if pd.notna(latest['MACDs_12_26_9']) else 0.0
            macd_hist = float(latest['MACDh_12_26_9']) if pd.notna(latest['MACDh_12_26_9']) else 0.0
            sma50 = float(latest['SMA_50']) if pd.notna(latest['SMA_50']) else None
            sma200 = float(latest['SMA_200']) if pd.notna(latest['SMA_200']) else None
            atr = float(latest['ATRr_14']) if pd.notna(latest['ATRr_14']) else 0.0
            price = float(latest['Close'])
            
            # Previous MACD for crossover detection
            prev_macd = float(prev['MACD_12_26_9']) if pd.notna(prev.get('MACD_12_26_9', np.nan)) else 0.0
            prev_sig = float(prev['MACDs_12_26_9']) if pd.notna(prev.get('MACDs_12_26_9', np.nan)) else 0.0

            # 52-week high/low
            high_52w = float(df['High'].max())
            low_52w = float(df['Low'].min())
            pct_from_high = ((price - high_52w) / high_52w) * 100
            pct_from_low = ((price - low_52w) / low_52w) * 100

            # Volume analysis
            avg_volume_20 = float(df['Volume'].tail(20).mean())
            latest_volume = float(latest['Volume'])
            volume_ratio = latest_volume / avg_volume_20 if avg_volume_20 > 0 else 1.0

            # Trend classification (Safe against NaNs for new stocks)
            trend = "Neutral"
            if sma50 is not None and sma200 is not None:
                if sma50 > sma200 and price > sma50:
                    trend = "Bullish"
                elif sma50 < sma200 and price < sma50:
                    trend = "Bearish"
                elif price > sma50 > sma200:
                    trend = "Strong Bullish"
                elif price < sma50 < sma200:
                    trend = "Strong Bearish"
            elif sma50 is not None:
                # Fallback if SMA200 is unavailable (e.g. IPO < 200 days ago)
                if price > sma50:
                    trend = "Bullish"
                elif price < sma50:
                    trend = "Bearish"

            # MACD crossover detection
            macd_crossover = "Neutral"
            if macd_val > macd_sig and prev_macd <= prev_sig:
                macd_crossover = "Bullish Crossover"
            elif macd_val < macd_sig and prev_macd >= prev_sig:
                macd_crossover = "Bearish Crossover"
            elif macd_val > macd_sig:
                macd_crossover = "Bullish"
            else:
                macd_crossover = "Bearish"

            # Volatility context
            volatility = "Normal"
            if atr > 0 and price > 0:
                atr_pct = atr / price
                if atr_pct > 0.03:
                    volatility = "High"
                elif atr_pct < 0.01:
                    volatility = "Low"

            # ---- Scoring Engine (0-100) ----
            score = 50

            # Trend contribution (±20)
            if trend in ("Bullish", "Strong Bullish"):
                score += 20
            elif trend in ("Bearish", "Strong Bearish"):
                score -= 20

            # RSI contribution (±15)
            if 40 <= rsi <= 60:
                score += 5  # Neutral zone, slight positive
            elif 30 < rsi < 40:
                score += 10  # Approaching oversold
            elif rsi <= 30:
                score += 15  # Oversold — contrarian buy signal
            elif 60 < rsi < 70:
                score -= 5   # Getting warm
            elif rsi >= 70:
                score -= 15  # Overbought — bearish

            # MACD contribution (±15)
            if "Bullish" in macd_crossover:
                score += 15
            elif "Bearish" in macd_crossover:
                score -= 15

            # Volume surge bonus (±5)
            if volume_ratio > 1.5:
                score += 5  # Unusual volume confirms momentum
            elif volume_ratio < 0.5:
                score -= 5  # Dry volume, weak conviction

            # Proximity to 52-week levels (±5)
            if pct_from_low < 10:
                score += 5  # Near 52-week low, potential value
            if pct_from_high > -5:
                score -= 3  # Near 52-week high, limited upside

            score = max(0, min(100, score))

            return {
                "rsi": round(rsi, 2),
                "macd_val": round(macd_val, 4),
                "macd_signal_val": round(macd_sig, 4),
                "macd_histogram": round(macd_hist, 4),
                "macd_signal": macd_crossover,
                "sma50": round(sma50, 2) if sma50 is not None else 0.0,
                "sma200": round(sma200, 2) if sma200 is not None else 0.0,
                "atr": round(atr, 2),
                "trend": trend,
                "volatility": volatility,
                "price": round(price, 2),
                "high_52w": round(high_52w, 2),
                "low_52w": round(low_52w, 2),
                "pct_from_high": round(pct_from_high, 2),
                "pct_from_low": round(pct_from_low, 2),
                "volume_ratio": round(volume_ratio, 2),
                "score": score
            }
        except Exception as e:
            print(f"Technical analysis error: {e}")
            return {
                "rsi": 50, "macd_val": 0, "macd_signal_val": 0, "macd_histogram": 0,
                "macd_signal": "Neutral", "sma50": 0, "sma200": 0, "atr": 0,
                "trend": "Unknown", "volatility": "Unknown", "price": 0,
                "high_52w": 0, "low_52w": 0, "pct_from_high": 0, "pct_from_low": 0,
                "volume_ratio": 1.0, "score": 50
            }


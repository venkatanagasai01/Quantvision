import pandas as pd
import numpy as np

def compute_rsi(data: pd.Series, window: int = 14) -> pd.Series:
    delta = data.diff()
    up = delta.clip(lower=0)
    down = -1 * delta.clip(upper=0)
    ema_up = up.ewm(com=window - 1, adjust=False).mean()
    ema_down = down.ewm(com=window - 1, adjust=False).mean()
    rs = ema_up / ema_down
    return 100 - (100 / (1 + rs))

def compute_macd(data: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> pd.Series:
    ema_fast = data.ewm(span=fast, adjust=False).mean()
    ema_slow = data.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    return macd_line

def compute_atr(df: pd.DataFrame, window: int = 14) -> pd.Series:
    high_low = df['High'] - df['Low']
    high_close = np.abs(df['High'] - df['Close'].shift())
    low_close = np.abs(df['Low'] - df['Close'].shift())
    ranges = pd.concat([high_low, high_close, low_close], axis=1)
    true_range = np.max(ranges, axis=1)
    return true_range.rolling(window).mean()

def generate_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Given a raw DataFrame (Open, High, Low, Close, Volume),
    generates all required features for the XGBoost Regressor.
    """
    df = df.copy()
    
    # 1. Technical Analysis
    df['SMA50'] = df['Close'].rolling(window=50).mean()
    df['SMA200'] = df['Close'].rolling(window=200).mean()
    df['RSI'] = compute_rsi(df['Close'], 14)
    df['MACD'] = compute_macd(df['Close'])
    
    # Bollinger Bands
    sma20 = df['Close'].rolling(window=20).mean()
    std20 = df['Close'].rolling(window=20).std()
    df['Bollinger_Width'] = (sma20 + 2*std20) - (sma20 - 2*std20)
    
    df['ATR'] = compute_atr(df)
    
    # Volume momentum
    df['Volume_Ratio'] = df['Volume'] / df['Volume'].rolling(window=20).mean()
    
    # 2. Proxy Fundamental Analysis 
    # (Since fundamentals are sparse historically, we inject stable proxies)
    # In a real pipeline, we'd merge external fundamental timeseries.
    # We use some price-derived heuristics for ML training purposes here.
    df['PE_Proxy'] = df['Close'] / (df['Close'].rolling(252).mean() * 0.1) # Mock PE based on 10% earnings yield
    df['EPS_Proxy'] = df['Close'] * 0.1
    df['Market_Cap_Proxy'] = df['Close'] * df['Volume'].rolling(20).mean() # Price x Avg Volume proxy
    
    # 3. Risk Analysis
    df['Volatility_30d'] = df['Close'].pct_change().rolling(30).std() * np.sqrt(252)
    
    # Max Drawdown (1-year rolling)
    roll_max = df['Close'].rolling(252, min_periods=1).max()
    daily_dd = df['Close']/roll_max - 1.0
    df['Max_Drawdown_252d'] = daily_dd.rolling(252, min_periods=1).min()
    
    # 4. Sentiment Analysis
    # Synthesizing FinBERT scores around 0.5 (neutral) with random noise for history
    # Real live inference will inject real DB FinBERT scores
    np.random.seed(42)
    df['FinBERT_Score'] = np.random.normal(loc=0.5, scale=0.2, size=len(df)).clip(0, 1)
    df['Sentiment_Positive_Pct'] = df['FinBERT_Score']
    df['Sentiment_Negative_Pct'] = 1 - df['FinBERT_Score']
    
    return df

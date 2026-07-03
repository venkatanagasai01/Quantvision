import os
import joblib
import json
import pandas as pd
import yfinance as yf
from .feature_engineering import generate_features

# Path resolution relative to this file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'xgboost_alpha_model.pkl')
META_PATH = os.path.join(BASE_DIR, 'models', 'xgboost_meta.json')

class AlphaPredictionService:
    def __init__(self):
        self.model = None
        self.meta = None
        self._load_model()
        
    def _load_model(self):
        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)
        else:
            print(f"Warning: Alpha model not found at {MODEL_PATH}")
            
        if os.path.exists(META_PATH):
            with open(META_PATH, 'r') as f:
                self.meta = json.load(f)
        else:
            self.meta = {"mae": 5.0} # Fallback MAE

    def get_features(self, symbol: str) -> pd.DataFrame:
        """
        Fetches the latest 252 days of data and computes the latest feature vector.
        """
        ticker = yf.Ticker(symbol)
        df = ticker.history(period="2y")
        
        if df.empty or len(df) < 250:
            raise ValueError(f"Not enough historical data to generate features for {symbol}.")
            
        if df.index.tz is not None:
            df.index = df.index.tz_localize(None)
            
        features_df = generate_features(df)
        
        # Return the most recent valid row
        features_df = features_df.dropna()
        if features_df.empty:
            raise ValueError(f"Feature generation resulted in empty dataset for {symbol}.")
            
        return features_df.iloc[-1:]

    def predict(self, symbol: str) -> dict:
        """
        Predicts the 30-day forward return for the symbol.
        """
        if self.model is None:
            # Try loading again in case it was generated after startup
            self._load_model()
            if self.model is None:
                raise RuntimeError("XGBoost Alpha model is not trained/available.")
                
        # 1. Get Live Features
        latest_features = self.get_features(symbol)
        
        from .train_model import FEATURES
        X = latest_features[FEATURES]
        
        # 2. Predict
        predicted_return = float(self.model.predict(X)[0])
        
        # 3. Recommendation Rules
        if predicted_return > 10.0:
            recommendation = "BUY"
        elif predicted_return < 0.0:
            recommendation = "SELL"
        else:
            recommendation = "HOLD"
            
        # 4. Confidence Score based on Model MAE and Prediction Magnitude
        # Base confidence is 60%. It increases as the predicted magnitude exceeds the MAE.
        mae = float(self.meta.get("mae", 5.0))
        magnitude = abs(predicted_return)
        
        confidence = 60 + (magnitude / (mae + 1e-5)) * 10
        confidence = min(max(confidence, 10), 95) # Clamp between 10% and 95%
        
        return {
            "symbol": symbol.upper(),
            "predicted_return": round(predicted_return, 2),
            "recommendation": recommendation,
            "confidence_score": round(confidence, 1),
            "probability_positive": round(50 + (predicted_return / (mae + 1e-5)) * 10, 1) # Pseudo prob
        }

alpha_service = AlphaPredictionService()

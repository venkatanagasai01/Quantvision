import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os

FEATURES = [
    'SMA50', 'SMA200', 'RSI', 'MACD', 'Bollinger_Width', 'ATR', 'Volume_Ratio',
    'PE_Proxy', 'EPS_Proxy', 'Market_Cap_Proxy',
    'Volatility_30d', 'Max_Drawdown_252d',
    'FinBERT_Score', 'Sentiment_Positive_Pct', 'Sentiment_Negative_Pct'
]

TARGET = 'future_return_30d'

def train():
    data_path = 'data/alpha_dataset.csv'
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}. Run dataset_builder.py first.")
        
    print(f"Loading dataset from {data_path}...")
    df = pd.read_csv(data_path, index_col=0)
    
    X = df[FEATURES]
    y = df[TARGET]
    
    print(f"Dataset shape: X={X.shape}, y={y.shape}")
    
    # Chronological or random split. For real trading, chronological is better.
    # For this system, we use train_test_split without shuffle for time-series integrity
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
    
    print(f"Training XGBoost Regressor on {len(X_train)} samples...")
    model = xgb.XGBRegressor(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        objective='reg:squarederror'
    )
    
    model.fit(
        X_train, y_train,
        eval_set=[(X_train, y_train), (X_test, y_test)],
        verbose=10
    )
    
    # Evaluation
    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))
    r2 = r2_score(y_test, predictions)
    
    print("\n--- Model Evaluation ---")
    print(f"MAE:  {mae:.4f}%")
    print(f"RMSE: {rmse:.4f}%")
    print(f"R2:   {r2:.4f}")
    
    # Feature Importance
    importance = model.feature_importances_
    feature_imp = pd.DataFrame({'Feature': FEATURES, 'Importance': importance})
    feature_imp = feature_imp.sort_values(by='Importance', ascending=False)
    print("\n--- Feature Importance ---")
    print(feature_imp.head(10))
    
    # Save Model
    os.makedirs('models', exist_ok=True)
    model_path = 'models/xgboost_alpha_model.pkl'
    joblib.dump(model, model_path)
    
    # Also save a metadata file to track MAE for confidence scoring
    meta_path = 'models/xgboost_meta.json'
    pd.Series({'mae': mae, 'rmse': rmse, 'r2': r2}).to_json(meta_path)
    
    print(f"\nModel saved successfully to {model_path}")

if __name__ == "__main__":
    train()

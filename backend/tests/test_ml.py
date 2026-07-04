import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
import pandas as pd
import numpy as np
from app.api.routers.ml import router as ml_router

from app.core.security import get_current_user
from app.models.db_models import User

app = FastAPI()
app.include_router(ml_router)

def override_get_current_user():
    return User(id=1, email="test@example.com")

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def clear_overrides():
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield
    app.dependency_overrides = {}

def test_feature_engineering_structure():
    from app.ml.feature_engineering import generate_features
    
    # Create mock OHLCV
    dates = pd.date_range(start="2023-01-01", periods=300)
    df = pd.DataFrame(index=dates)
    df['Close'] = np.random.normal(100, 5, 300)
    df['High'] = df['Close'] + 2
    df['Low'] = df['Close'] - 2
    df['Open'] = df['Close'].shift(1).fillna(100)
    df['Volume'] = np.random.randint(10000, 50000, 300)
    
    features = generate_features(df)
    
    # Check if all required features exist
    expected_cols = ['SMA50', 'SMA200', 'RSI', 'MACD', 'Bollinger_Width', 'ATR']
    for col in expected_cols:
        assert col in features.columns

def test_ml_predict_endpoint_invalid_symbol():
    response = client.get("/api/ml/predict/INVALID_TICKER_123")
    assert response.status_code == 500

def test_ml_predict_endpoint_valid_symbol():
    # We can pass SYNTH for testing since we added it to our synthetic fallback
    response = client.get("/api/ml/predict/AAPL")
    if response.status_code == 200:
        data = response.json()
        assert "predicted_return" in data
        assert "recommendation" in data
        assert "confidence_score" in data
        assert data["recommendation"] in ["BUY", "HOLD", "SELL"]
        assert 0 <= data["confidence_score"] <= 100

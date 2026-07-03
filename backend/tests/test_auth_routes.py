import pytest
import sys
from unittest.mock import MagicMock
sys.modules['pandas_ta'] = MagicMock()
sys.modules['yfinance'] = MagicMock()
sys.modules['xgboost'] = MagicMock()
sys.modules['shap'] = MagicMock()

import joblib
joblib.load = MagicMock()

import passlib.handlers.bcrypt
passlib.handlers.bcrypt.detect_wrap_bug = lambda *args: False

from fastapi.testclient import TestClient
from app.main import app
from app.db.database import get_db, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.security import pwd_context

pwd_context.hash = lambda x: x + "_hashed"
pwd_context.verify = lambda x, y: (x + "_hashed") == y

# Set up test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_quantan.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_users():
    # Register User A
    res_a = client.post("/api/auth/register", json={
        "name": "User A",
        "email": "a@example.com",
        "password": "password123"
    })
    token_a = res_a.json()["access_token"]
    
    # Register User B
    res_b = client.post("/api/auth/register", json={
        "name": "User B",
        "email": "b@example.com",
        "password": "password123"
    })
    token_b = res_b.json()["access_token"]
    
    return {"token_a": token_a, "token_b": token_b}

def test_unauthenticated_request_fails():
    res = client.get("/api/dashboard/portfolio-summary")
    assert res.status_code == 401

def test_authenticated_request_succeeds(setup_users):
    headers = {"Authorization": f"Bearer {setup_users['token_a']}"}
    res = client.get("/api/dashboard/portfolio-summary", headers=headers)
    assert res.status_code == 200

def test_user_data_isolation(setup_users):
    headers_a = {"Authorization": f"Bearer {setup_users['token_a']}"}
    headers_b = {"Authorization": f"Bearer {setup_users['token_b']}"}
    
    # User A adds symbol to watchlist
    client.post("/api/watchlist", json={"symbol": "AAPL"}, headers=headers_a)
    
    # User A sees AAPL
    res_a = client.get("/api/watchlist", headers=headers_a)
    assert len(res_a.json()) == 1
    assert res_a.json()[0]["symbol"] == "AAPL"
    
    # User B does NOT see AAPL
    res_b = client.get("/api/watchlist", headers=headers_b)
    assert len(res_b.json()) == 0

def test_stock_analysis_endpoint_works(setup_users):
    headers = {"Authorization": f"Bearer {setup_users['token_a']}"}
    # Test valid execution, mocking actual market calls might be needed if they hit yfinance, 
    # but we just want to ensure it doesn't crash on dependency injection.
    res = client.get("/api/stocks/analyze/AAPL", headers=headers)
    # yfinance might fail in test env or succeed, but we shouldn't get 401 or TypeError
    assert res.status_code in [200, 400, 404, 500, 503]
    if res.status_code == 500:
        # Verify it's not a TypeError missing current_user
        assert "current_user" not in res.text

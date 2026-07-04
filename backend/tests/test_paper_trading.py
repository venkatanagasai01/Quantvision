import pytest
import sys
from unittest.mock import MagicMock

# Mock external dependencies for isolated testing BEFORE importing app
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

from unittest.mock import MagicMock, AsyncMock, patch
# We will use patch in fixtures/tests instead

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_trading.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def mock_market_data():
    with patch("app.api.routers.paper_trading.MarketDataService.fetch_stock_data", new_callable=AsyncMock) as mock_fetch:
        mock_fetch.return_value = {"current_price": 150.0, "name": "Apple Inc."}
        yield mock_fetch

@pytest.fixture(scope="module")
def setup_trading_users():
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # Register User A
    res_a = client.post("/api/auth/register", json={
        "name": "Trader A",
        "email": "tradera@example.com",
        "password": "password123"
    })
    token_a = res_a.json()["access_token"]
    
    # Register User B
    res_b = client.post("/api/auth/register", json={
        "name": "Trader B",
        "email": "traderb@example.com",
        "password": "password123"
    })
    token_b = res_b.json()["access_token"]
    
    return {"token_a": token_a, "token_b": token_b}

def test_get_initial_portfolio(setup_trading_users):
    headers = {"Authorization": f"Bearer {setup_trading_users['token_a']}"}
    res = client.get("/api/paper-trading/portfolio", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["initial_capital"] == 100000.0
    assert data["cash_balance"] == 100000.0
    assert data["total_value"] == 100000.0

def test_buy_order_success(setup_trading_users):
    headers = {"Authorization": f"Bearer {setup_trading_users['token_a']}"}
    
    # Buy 10 shares of AAPL at mocked price $150.0
    res = client.post("/api/paper-trading/buy", json={"symbol": "AAPL", "shares": 10}, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["message"] == "Trade executed successfully"
    assert data["execution_price"] == 150.0
    assert data["total_amount"] == 1500.0
    
    # Verify Portfolio Cash decreased
    port_res = client.get("/api/paper-trading/portfolio", headers=headers)
    port_data = port_res.json()
    assert port_data["cash_balance"] == 98500.0 # 100000 - 1500

def test_insufficient_cash_rejection(setup_trading_users):
    headers = {"Authorization": f"Bearer {setup_trading_users['token_a']}"}
    
    # Try to buy 1000 shares of AAPL at $150 = $150,000 (Exceeds $98,500)
    res = client.post("/api/paper-trading/buy", json={"symbol": "AAPL", "shares": 1000}, headers=headers)
    assert res.status_code == 400
    assert "Insufficient cash balance" in res.json()["detail"]

def test_sell_order_success(setup_trading_users):
    headers = {"Authorization": f"Bearer {setup_trading_users['token_a']}"}
    
    # Sell 5 shares of AAPL (we own 10)
    res = client.post("/api/paper-trading/sell", json={"symbol": "AAPL", "shares": 5}, headers=headers)
    assert res.status_code == 200
    
    # Verify Portfolio Cash increased
    port_res = client.get("/api/paper-trading/portfolio", headers=headers)
    assert port_res.json()["cash_balance"] == 99250.0 # 98500 + 750
    
    # Verify Positions
    pos_res = client.get("/api/paper-trading/positions", headers=headers)
    positions = pos_res.json()
    assert len(positions) == 1
    assert positions[0]["shares"] == 5

def test_short_selling_rejection(setup_trading_users):
    headers = {"Authorization": f"Bearer {setup_trading_users['token_a']}"}
    
    # Try to sell 10 shares of AAPL (we only own 5)
    res = client.post("/api/paper-trading/sell", json={"symbol": "AAPL", "shares": 10}, headers=headers)
    assert res.status_code == 400
    assert "Insufficient shares" in res.json()["detail"]

def test_user_isolation(setup_trading_users):
    headers_a = {"Authorization": f"Bearer {setup_trading_users['token_a']}"}
    headers_b = {"Authorization": f"Bearer {setup_trading_users['token_b']}"}
    
    # Trader B should have 0 positions and 100000 cash
    port_b = client.get("/api/paper-trading/portfolio", headers=headers_b).json()
    assert port_b["cash_balance"] == 100000.0
    
    pos_b = client.get("/api/paper-trading/positions", headers=headers_b).json()
    assert len(pos_b) == 0
    
    # Trader A should still have their AAPL position
    pos_a = client.get("/api/paper-trading/positions", headers=headers_a).json()
    assert len(pos_a) == 1
    assert pos_a[0]["symbol"] == "AAPL"

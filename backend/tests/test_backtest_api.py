from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import pytest
from app.main import app
from app.db.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def create_test_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

# We mock the entire internal quantitative simulation process so we don't hit 
# the actual internet/yfinance during the API router tests.
from unittest.mock import patch

@patch('app.api.routers.backtests.HistoricalSimulationEngine')
@patch('app.api.routers.backtests.yf.Ticker')
def test_run_backtest_endpoint(mock_ticker, mock_hist_sim):
    # Mocking Phase 1
    mock_hist_sim.run_simulation.return_value = [{"date": "2024-01-01", "recommendation": "BUY", "confidence_score": 80}]
    
    # Mocking yfinance
    import pandas as pd
    mock_df = pd.DataFrame(index=pd.date_range("2024-01-01", periods=10, freq="B"), data={'Close': [100.0] * 10})
    mock_ticker.return_value.history.return_value = mock_df

    response = client.post(
        "/api/backtests/run",
        json={
            "symbol": "AAPL",
            "benchmark": "^GSPC",
            "start_date": "2024-01-01",
            "end_date": "2024-01-10",
            "initial_capital": 10000.0
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "backtest_id" in data
    assert data["status"] == "COMPLETED"

def test_list_backtests_endpoint():
    response = client.get("/api/backtests?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert data["page"] == 1
    assert data["items"][0]["symbol"] == "AAPL"

def test_get_backtest_report_endpoint():
    # Fetch list to get valid ID
    res_list = client.get("/api/backtests")
    bt_id = res_list.json()["items"][0]["id"]
    
    response = client.get(f"/api/backtests/{bt_id}/report")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == bt_id
    assert "performance_metrics" in data
    assert "benchmark_comparison" in data
    assert "trade_history" in data

def test_delete_backtest_endpoint():
    res_list = client.get("/api/backtests")
    bt_id = res_list.json()["items"][0]["id"]
    
    response = client.delete(f"/api/backtests/{bt_id}")
    assert response.status_code == 200
    assert "deleted" in response.json()["message"]
    
    # Verify it's gone
    res_verify = client.get(f"/api/backtests/{bt_id}")
    assert res_verify.status_code == 404

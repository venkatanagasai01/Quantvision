import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.database import Base
from app.models.db_models import BacktestRun, TradeHistory, PerformanceMetrics, BenchmarkComparison
from app.repositories.backtest_repository import BacktestRepository
from app.services.persistence.persistence_service import PersistenceService

# Use SQLite memory for rapid DB testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture
def db_session():
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()

def test_create_and_cascade_delete_backtest(db_session):
    repo = BacktestRepository(db_session)
    
    # 1. Create Core
    bt = BacktestRun(
        symbol="AAPL",
        start_date="2024-01-01",
        end_date="2024-06-01",
        initial_capital=10000.0,
        final_portfolio_value=12000.0,
        total_return=20.0
    )
    saved_bt = repo.create_backtest(bt)
    
    assert saved_bt.id is not None
    assert saved_bt.symbol == "AAPL"
    
    # 2. Create Relations
    trade = TradeHistory(backtest_id=saved_bt.id, trade_date="2024-01-02", action="BUY", shares=10.0, price=100.0, cash_after_trade=9000.0)
    perf = PerformanceMetrics(backtest_id=saved_bt.id, CAGR=0.1, sharpe_ratio=1.5, sortino_ratio=2.0, max_drawdown=-0.05, volatility=0.2, win_rate=0.6)
    bench = BenchmarkComparison(backtest_id=saved_bt.id, benchmark_symbol="^GSPC", benchmark_return=10.0, alpha=0.05, beta=1.1, information_ratio=0.8, excess_return=10.0)
    
    repo.save_trade(trade)
    repo.save_metrics(perf)
    repo.save_benchmark(bench)
    
    # 3. Retrieve and Validate Relationships
    fetched_bt = repo.get_backtest(saved_bt.id)
    assert len(fetched_bt.trades) == 1
    assert fetched_bt.performance.sharpe_ratio == 1.5
    assert fetched_bt.benchmark_comparison.benchmark_symbol == "^GSPC"
    
    # 4. Test Cascade Delete
    db_session.delete(fetched_bt)
    db_session.commit()
    
    assert db_session.query(TradeHistory).count() == 0
    assert db_session.query(PerformanceMetrics).count() == 0
    assert db_session.query(BenchmarkComparison).count() == 0

def test_persistence_service_save_complete(db_session):
    portfolio = {
        "initial_capital": 10000.0,
        "final_portfolio_value": 11000.0,
        "total_return_percent": 10.0,
        "trade_history": [
            {"date": "2024-01-02", "action": "BUY", "shares": 10.0, "price": 100.0, "cash_after_trade": 9000.0}
        ]
    }
    performance = {
        "performance_report": {
            "CAGR": 0.1, "sharpe_ratio": 1.2, "sortino_ratio": 1.5, "max_drawdown": -0.1, "annualized_volatility": 0.2, "win_rate": 0.6
        }
    }
    benchmark = {
        "comparison_metrics": {
            "benchmark_symbol": "^GSPC", "alpha": 0.05, "beta": 1.0, "information_ratio": 0.5, "excess_return": 5.0
        },
        "benchmark_metrics": {
            "total_return": 5.0
        }
    }
    
    saved = PersistenceService.save_complete_backtest(
        db=db_session, symbol="TSLA", start_date="2024-01-01", end_date="2024-06-01",
        portfolio_result=portfolio, performance_result=performance, benchmark_result=benchmark
    )
    
    assert saved.symbol == "TSLA"
    assert len(saved.trades) == 1
    
    report = PersistenceService.load_backtest_report(db_session, saved.id)
    assert report["symbol"] == "TSLA"
    assert report["performance"]["sharpe_ratio"] == 1.2

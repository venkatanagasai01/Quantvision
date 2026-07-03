from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from app.models.db_models import BacktestRun, TradeHistory, PerformanceMetrics, BenchmarkComparison

class BacktestRepository:
    """Repository layer for abstracting database operations for backtests."""
    
    def __init__(self, db: Session):
        self.db = db

    def create_backtest(self, backtest: BacktestRun) -> BacktestRun:
        self.db.add(backtest)
        self.db.commit()
        self.db.refresh(backtest)
        return backtest

    def save_trade(self, trade: TradeHistory) -> TradeHistory:
        self.db.add(trade)
        self.db.commit()
        self.db.refresh(trade)
        return trade

    def save_metrics(self, metrics: PerformanceMetrics) -> PerformanceMetrics:
        self.db.add(metrics)
        self.db.commit()
        self.db.refresh(metrics)
        return metrics

    def save_benchmark(self, benchmark: BenchmarkComparison) -> BenchmarkComparison:
        self.db.add(benchmark)
        self.db.commit()
        self.db.refresh(benchmark)
        return benchmark

    def get_backtest(self, backtest_id: int) -> Optional[BacktestRun]:
        stmt = select(BacktestRun).where(BacktestRun.id == backtest_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def list_backtests(self, skip: int = 0, limit: int = 100) -> List[BacktestRun]:
        stmt = select(BacktestRun).order_by(BacktestRun.created_at.desc()).offset(skip).limit(limit)
        return list(self.db.execute(stmt).scalars().all())

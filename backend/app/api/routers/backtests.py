from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from app.db.database import get_db
from app.models.db_models import BacktestRun, User
from app.core.security import get_current_user
from app.repositories.backtest_repository import BacktestRepository
from app.services.persistence.persistence_service import PersistenceService
from app.api.schemas.backtest_schemas import (
    BacktestRequest, BacktestSummaryResponse, BacktestDetailResponse, 
    PaginatedBacktestResponse, BacktestReportResponse
)

# Services from Phase 1-5
from app.services.backtesting.historical_simulation import HistoricalSimulationEngine
from app.services.backtesting.validation_service import RecommendationValidationService
from app.services.portfolio.portfolio_simulator import PortfolioSimulator
from app.services.analytics.performance_metrics import PerformanceMetricsService
from app.services.benchmark.benchmark_service import BenchmarkService

import yfinance as yf
import pandas as pd

router = APIRouter(prefix="/api/backtests", tags=["Backtesting"])

@router.post("/run", response_model=BacktestSummaryResponse)
def run_backtest(request: BacktestRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Orchestrates the entire quant pipeline and saves to Postgres."""
    try:
        # Phase 1: Historical Simulation
        signals = HistoricalSimulationEngine.run_simulation(
            symbol=request.symbol, 
            start_date=request.start_date, 
            end_date=request.end_date
        )
        if not signals:
            raise HTTPException(status_code=400, detail="No signals generated for the specified period.")

        # Re-fetch full historical dataframe for subsequent phases
        ticker = yf.Ticker(request.symbol)
        full_hist_df = ticker.history(start=request.start_date, end=request.end_date)
        if full_hist_df.empty:
            raise HTTPException(status_code=400, detail="Missing historical data for symbol.")

        # Phase 2: Recommendation Validation
        validation_output = RecommendationValidationService.validate_signals(signals, full_hist_df)
        validated_signals = validation_output.get("validated_signals", signals)

        # Phase 3: Portfolio Simulation
        # Ensure simulator uses the exact requested capital
        PortfolioSimulator.INITIAL_CAPITAL = request.initial_capital
        portfolio_result = PortfolioSimulator.run_simulation(validated_signals, full_hist_df)

        # Phase 4: Performance Analytics
        performance_result = PerformanceMetricsService.calculate_metrics(portfolio_result)

        # Phase 5: Benchmark Comparison
        benchmark_result = BenchmarkService.analyze_benchmark(
            strategy_report=performance_result,
            start_date=request.start_date,
            end_date=request.end_date,
            benchmark_symbol=request.benchmark
        )

        # Phase 6: Persistence
        saved_run = PersistenceService.save_complete_backtest(
            db=db,
            user_id=current_user.id,
            symbol=request.symbol,
            start_date=request.start_date,
            end_date=request.end_date,
            portfolio_result=portfolio_result,
            performance_result=performance_result,
            benchmark_result=benchmark_result
        )

        return BacktestSummaryResponse(
            backtest_id=saved_run.id,
            status=saved_run.status,
            total_return=saved_run.total_return,
            sharpe_ratio=saved_run.performance.sharpe_ratio if saved_run.performance else None
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=PaginatedBacktestResponse)
def list_backtests(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    symbol: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all backtests with pagination and filtering."""
    query = db.query(BacktestRun).filter(BacktestRun.user_id == current_user.id)
    if symbol:
        query = query.filter(BacktestRun.symbol == symbol)
        
    total = query.count()
    items = query.order_by(BacktestRun.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    return PaginatedBacktestResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[
            BacktestDetailResponse(
                id=i.id, symbol=i.symbol, benchmark=i.benchmark,
                start_date=i.start_date, end_date=i.end_date, created_at=i.created_at,
                total_return=i.total_return, status=i.status,
                sharpe_ratio=i.performance.sharpe_ratio if i.performance else None
            ) for i in items
        ]
    )

@router.get("/{id}", response_model=BacktestDetailResponse)
def get_backtest_metadata(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Return specific backtest metadata."""
    repo = BacktestRepository(db)
    bt = repo.get_backtest(id)
    if not bt or bt.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Backtest not found")
        
    return BacktestDetailResponse(
        id=bt.id, symbol=bt.symbol, benchmark=bt.benchmark,
        start_date=bt.start_date, end_date=bt.end_date, created_at=bt.created_at,
        total_return=bt.total_return, status=bt.status,
        sharpe_ratio=bt.performance.sharpe_ratio if bt.performance else None
    )

@router.get("/{id}/report", response_model=BacktestReportResponse)
def get_backtest_report(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Return complete frontend-ready JSON report."""
    repo = BacktestRepository(db)
    bt = repo.get_backtest(id)
    if not bt or bt.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Backtest not found")

    # Reconstruct the dictionaries from ORM
    trade_history = [
        {
            "date": t.trade_date, "action": t.action, "shares": t.shares,
            "price": t.price, "cash_after_trade": t.cash_after_trade
        } for t in bt.trades
    ]
    
    perf = bt.performance
    performance_metrics = {
        "CAGR": perf.CAGR, "sharpe_ratio": perf.sharpe_ratio, "sortino_ratio": perf.sortino_ratio,
        "max_drawdown": perf.max_drawdown, "annualized_volatility": perf.volatility, "win_rate": perf.win_rate
    } if perf else {}
    
    bench = bt.benchmark_comparison
    benchmark_comparison = {
        "benchmark_symbol": bench.benchmark_symbol, "benchmark_return": bench.benchmark_return,
        "alpha": bench.alpha, "beta": bench.beta, "information_ratio": bench.information_ratio,
        "excess_return": bench.excess_return
    } if bench else {}

    # Since we did not persist the raw equity arrays to Postgres to save space,
    # a true production engine would store them in S3 or a NoSQL JSONB column.
    # For now, we return empty arrays for charts if they aren't stored, but the API schema is ready.
    chart_data = {
        "equity_curve": [], "drawdown_curve": [], "daily_returns": []
    }

    return BacktestReportResponse(
        id=bt.id, symbol=bt.symbol, start_date=bt.start_date, end_date=bt.end_date,
        initial_capital=bt.initial_capital, final_portfolio_value=bt.final_portfolio_value,
        total_return=bt.total_return, status=bt.status,
        performance_metrics=performance_metrics,
        benchmark_comparison=benchmark_comparison,
        trade_history=trade_history,
        chart_data=chart_data
    )

@router.delete("/{id}")
def delete_backtest(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete backtest and cascade delete trades/metrics."""
    repo = BacktestRepository(db)
    bt = repo.get_backtest(id)
    if not bt or bt.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Backtest not found")
        
    db.delete(bt)
    db.commit()
    return {"status": "success", "message": f"Backtest {id} successfully deleted"}

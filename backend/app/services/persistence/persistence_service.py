from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.db_models import BacktestRun, TradeHistory, PerformanceMetrics, BenchmarkComparison
from app.repositories.backtest_repository import BacktestRepository

class PersistenceService:
    """
    Service layer bridging the quantitative simulation output to the relational database.
    """
    
    @staticmethod
    def save_complete_backtest(db: Session, user_id: int, symbol: str, start_date: str, end_date: str, 
                               portfolio_result: Dict[str, Any], 
                               performance_result: Dict[str, Any],
                               benchmark_result: Dict[str, Any]) -> BacktestRun:
        repo = BacktestRepository(db)
        
        # 1. Create Core Backtest Run
        benchmark_symbol = benchmark_result.get("comparison_metrics", {}).get("benchmark_symbol", "^GSPC") if benchmark_result else None
        
        backtest = BacktestRun(
            user_id=user_id,
            symbol=symbol,
            benchmark=benchmark_symbol,
            start_date=start_date,
            end_date=end_date,
            initial_capital=portfolio_result.get("initial_capital", 10000.0),
            final_portfolio_value=portfolio_result.get("final_portfolio_value", 10000.0),
            total_return=portfolio_result.get("total_return_percent", 0.0),
            status="COMPLETED"
        )
        saved_run = repo.create_backtest(backtest)
        
        # 2. Save Trades
        trades_to_save = []
        for trade_dict in portfolio_result.get("trade_history", []):
            trade = TradeHistory(
                backtest_id=saved_run.id,
                trade_date=trade_dict["date"],
                action=trade_dict["action"],
                shares=trade_dict["shares"],
                price=trade_dict["price"],
                cash_after_trade=trade_dict["cash_after_trade"]
            )
            db.add(trade)
        
        # 3. Save Performance Metrics
        perf = performance_result.get("performance_report", {})
        metrics = PerformanceMetrics(
            backtest_id=saved_run.id,
            CAGR=perf.get("CAGR", 0.0),
            sharpe_ratio=perf.get("sharpe_ratio", 0.0),
            sortino_ratio=perf.get("sortino_ratio", 0.0),
            max_drawdown=perf.get("max_drawdown", 0.0),
            volatility=perf.get("annualized_volatility", 0.0),
            win_rate=perf.get("win_rate", 0.0)
        )
        db.add(metrics)
        
        # 4. Save Benchmark Comparison
        comp = benchmark_result.get("comparison_metrics", {})
        bench_perf = benchmark_result.get("benchmark_metrics", {})
        
        if comp:
            benchmark_comp = BenchmarkComparison(
                backtest_id=saved_run.id,
                benchmark_symbol=benchmark_symbol,
                benchmark_return=bench_perf.get("total_return", 0.0),
                alpha=comp.get("alpha", 0.0),
                beta=comp.get("beta", 0.0),
                information_ratio=comp.get("information_ratio", 0.0),
                excess_return=comp.get("excess_return", 0.0)
            )
            db.add(benchmark_comp)
            
        # Bulk commit everything connected to the backtest
        db.commit()
        db.refresh(saved_run)
        
        return saved_run

    @staticmethod
    def load_backtest_report(db: Session, backtest_id: int) -> Dict[str, Any]:
        """Loads a structured backtest representation for the API."""
        repo = BacktestRepository(db)
        backtest = repo.get_backtest(backtest_id)
        
        if not backtest:
            return {}
            
        return {
            "id": backtest.id,
            "symbol": backtest.symbol,
            "start_date": backtest.start_date,
            "end_date": backtest.end_date,
            "initial_capital": backtest.initial_capital,
            "final_portfolio_value": backtest.final_portfolio_value,
            "total_return": backtest.total_return,
            "status": backtest.status,
            "trades_count": len(backtest.trades),
            "performance": {
                "CAGR": backtest.performance.CAGR if backtest.performance else None,
                "sharpe_ratio": backtest.performance.sharpe_ratio if backtest.performance else None
            }
        }

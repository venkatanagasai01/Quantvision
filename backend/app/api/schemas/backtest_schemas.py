from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class BacktestRequest(BaseModel):
    symbol: str = Field(..., example="TCS.NS")
    benchmark: str = Field(..., example="^NSEI")
    start_date: str = Field(..., example="2023-01-01")
    end_date: str = Field(..., example="2024-01-01")
    initial_capital: float = Field(10000.0, example=10000.0)

class BacktestSummaryResponse(BaseModel):
    backtest_id: int
    status: str
    total_return: float
    sharpe_ratio: Optional[float] = None

class BacktestDetailResponse(BaseModel):
    id: int
    symbol: str
    benchmark: Optional[str]
    start_date: str
    end_date: str
    created_at: datetime
    total_return: float
    status: str
    sharpe_ratio: Optional[float] = None

class PaginatedBacktestResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[BacktestDetailResponse]

class BacktestReportResponse(BaseModel):
    id: int
    symbol: str
    start_date: str
    end_date: str
    initial_capital: float
    final_portfolio_value: float
    total_return: float
    status: str
    performance_metrics: Dict[str, Any]
    benchmark_comparison: Dict[str, Any]
    trade_history: List[Dict[str, Any]]
    chart_data: Dict[str, Any]

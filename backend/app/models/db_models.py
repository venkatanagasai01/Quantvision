from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Float, Integer, ForeignKey, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

class BacktestRun(Base):
    __tablename__ = "backtest_runs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    symbol: Mapped[str] = mapped_column(String(20), index=True)
    benchmark: Mapped[Optional[str]] = mapped_column(String(20), index=True)
    start_date: Mapped[str] = mapped_column(String(20), index=True)
    end_date: Mapped[str] = mapped_column(String(20))
    initial_capital: Mapped[float] = mapped_column(Float)
    final_portfolio_value: Mapped[float] = mapped_column(Float)
    total_return: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(20), default="COMPLETED")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="backtests")
    trades: Mapped[List["TradeHistory"]] = relationship(back_populates="backtest", cascade="all, delete-orphan")
    performance: Mapped["PerformanceMetrics"] = relationship(back_populates="backtest", cascade="all, delete-orphan", uselist=False)
    benchmark_comparison: Mapped["BenchmarkComparison"] = relationship(back_populates="backtest", cascade="all, delete-orphan", uselist=False)

class TradeHistory(Base):
    __tablename__ = "trade_history"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    backtest_id: Mapped[int] = mapped_column(ForeignKey("backtest_runs.id", ondelete="CASCADE"))
    trade_date: Mapped[str] = mapped_column(String(20))
    action: Mapped[str] = mapped_column(String(10)) # BUY, SELL
    shares: Mapped[float] = mapped_column(Float)
    price: Mapped[float] = mapped_column(Float)
    cash_after_trade: Mapped[float] = mapped_column(Float)

    backtest: Mapped["BacktestRun"] = relationship(back_populates="trades")

class PerformanceMetrics(Base):
    __tablename__ = "performance_metrics"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    backtest_id: Mapped[int] = mapped_column(ForeignKey("backtest_runs.id", ondelete="CASCADE"), unique=True)
    CAGR: Mapped[float] = mapped_column(Float)
    sharpe_ratio: Mapped[float] = mapped_column(Float)
    sortino_ratio: Mapped[float] = mapped_column(Float)
    max_drawdown: Mapped[float] = mapped_column(Float)
    volatility: Mapped[float] = mapped_column(Float)
    win_rate: Mapped[float] = mapped_column(Float)

    backtest: Mapped["BacktestRun"] = relationship(back_populates="performance")

class BenchmarkComparison(Base):
    __tablename__ = "benchmark_comparisons"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    backtest_id: Mapped[int] = mapped_column(ForeignKey("backtest_runs.id", ondelete="CASCADE"), unique=True)
    benchmark_symbol: Mapped[str] = mapped_column(String(20))
    benchmark_return: Mapped[float] = mapped_column(Float)
    alpha: Mapped[float] = mapped_column(Float)
    beta: Mapped[float] = mapped_column(Float)
    information_ratio: Mapped[float] = mapped_column(Float)
    excess_return: Mapped[float] = mapped_column(Float)

    backtest: Mapped["BacktestRun"] = relationship(back_populates="benchmark_comparison")

class SentimentAnalysis(Base):
    __tablename__ = "sentiment_analysis"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    symbol: Mapped[str] = mapped_column(String(20), index=True)
    sentiment_score: Mapped[float] = mapped_column(Float)
    confidence: Mapped[float] = mapped_column(Float)
    article_count: Mapped[int] = mapped_column(Integer)
    analyzed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    user: Mapped["User"] = relationship(back_populates="sentiments")
    articles: Mapped[List["NewsArticle"]] = relationship(back_populates="sentiment", cascade="all, delete-orphan")

class NewsArticle(Base):
    __tablename__ = "news_articles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    sentiment_id: Mapped[int] = mapped_column(ForeignKey("sentiment_analysis.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(500))
    source: Mapped[str] = mapped_column(String(100))
    published_at: Mapped[str] = mapped_column(String(50))
    pos_score: Mapped[float] = mapped_column(Float)
    neg_score: Mapped[float] = mapped_column(Float)
    neu_score: Mapped[float] = mapped_column(Float)

    sentiment: Mapped["SentimentAnalysis"] = relationship(back_populates="articles")

class Watchlist(Base):
    __tablename__ = "watchlist"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    symbol: Mapped[str] = mapped_column(String(20), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="watchlists")

class ResearchReport(Base):
    __tablename__ = "research_reports"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    symbol: Mapped[str] = mapped_column(String(20), index=True)
    recommendation: Mapped[str] = mapped_column(String(20), index=True)
    confidence_score: Mapped[float] = mapped_column(Float)
    report_json: Mapped[str] = mapped_column(String) # String can hold large JSON text in SQLite
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    user: Mapped["User"] = relationship(back_populates="reports")

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), default="Quantan Admin")
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    profile_image: Mapped[str] = mapped_column(String(255), nullable=True)
    auth_provider: Mapped[str] = mapped_column(String(50), default="local")
    last_login: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    settings: Mapped["UserSettings"] = relationship(back_populates="user", cascade="all, delete-orphan", uselist=False)
    backtests: Mapped[List["BacktestRun"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    sentiments: Mapped[List["SentimentAnalysis"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    watchlists: Mapped[List["Watchlist"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    reports: Mapped[List["ResearchReport"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    prediction_explanations: Mapped[List["PredictionExplanation"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    portfolios: Mapped[List["Portfolio"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class UserSettings(Base):
    __tablename__ = "user_settings"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    theme: Mapped[str] = mapped_column(String(20), default="system")
    risk_profile: Mapped[str] = mapped_column(String(50), default="Moderate")
    benchmark: Mapped[str] = mapped_column(String(50), default="S&P 500")
    notifications_json: Mapped[str] = mapped_column(String, default='{"recommendation":true,"sentiment":true,"volatility":false,"backtest":true}')
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="settings")

class PredictionExplanation(Base):
    __tablename__ = "prediction_explanations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    symbol: Mapped[str] = mapped_column(String(20), index=True)
    prediction_id: Mapped[str] = mapped_column(String(100), index=True, nullable=True) # E.g., UUID to link to a prediction log
    explanation_json: Mapped[str] = mapped_column(String) # Store full SHAP explanation blob
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    user: Mapped["User"] = relationship(back_populates="prediction_explanations")

# --- PAPER TRADING MODELS ---

class Portfolio(Base):
    __tablename__ = "portfolios"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(100), default="Main Portfolio")
    initial_capital: Mapped[float] = mapped_column(Float, default=100000.0)
    cash_balance: Mapped[float] = mapped_column(Float, default=100000.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="portfolios")
    positions: Mapped[List["Position"]] = relationship(back_populates="portfolio", cascade="all, delete-orphan")
    orders: Mapped[List["Order"]] = relationship(back_populates="portfolio", cascade="all, delete-orphan")
    trades: Mapped[List["Trade"]] = relationship(back_populates="portfolio", cascade="all, delete-orphan")
    cash_transactions: Mapped[List["CashTransaction"]] = relationship(back_populates="portfolio", cascade="all, delete-orphan")

class Position(Base):
    __tablename__ = "positions"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    portfolio_id: Mapped[int] = mapped_column(Integer, ForeignKey("portfolios.id", ondelete="CASCADE"), index=True)
    symbol: Mapped[str] = mapped_column(String(20), index=True)
    shares: Mapped[float] = mapped_column(Float, default=0.0)
    average_cost: Mapped[float] = mapped_column(Float, default=0.0)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    portfolio: Mapped["Portfolio"] = relationship(back_populates="positions")

class Order(Base):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    portfolio_id: Mapped[int] = mapped_column(Integer, ForeignKey("portfolios.id", ondelete="CASCADE"), index=True)
    symbol: Mapped[str] = mapped_column(String(20), index=True)
    action: Mapped[str] = mapped_column(String(10)) # BUY, SELL
    order_type: Mapped[str] = mapped_column(String(20), default="MARKET")
    shares: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(20), default="PENDING") # PENDING, FILLED, REJECTED
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    portfolio: Mapped["Portfolio"] = relationship(back_populates="orders")
    trade: Mapped["Trade"] = relationship(back_populates="order", cascade="all, delete-orphan", uselist=False)

class Trade(Base):
    __tablename__ = "trades"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), unique=True, index=True)
    portfolio_id: Mapped[int] = mapped_column(Integer, ForeignKey("portfolios.id", ondelete="CASCADE"), index=True)
    symbol: Mapped[str] = mapped_column(String(20), index=True)
    action: Mapped[str] = mapped_column(String(10)) # BUY, SELL
    shares: Mapped[float] = mapped_column(Float)
    execution_price: Mapped[float] = mapped_column(Float)
    total_amount: Mapped[float] = mapped_column(Float)
    executed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    order: Mapped["Order"] = relationship(back_populates="trade")
    portfolio: Mapped["Portfolio"] = relationship(back_populates="trades")

class CashTransaction(Base):
    __tablename__ = "cash_transactions"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    portfolio_id: Mapped[int] = mapped_column(Integer, ForeignKey("portfolios.id", ondelete="CASCADE"), index=True)
    amount: Mapped[float] = mapped_column(Float)
    transaction_type: Mapped[str] = mapped_column(String(20)) # DEPOSIT, WITHDRAWAL, TRADE
    description: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    portfolio: Mapped["Portfolio"] = relationship(back_populates="cash_transactions")


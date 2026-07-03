from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any
from pydantic import BaseModel

from app.db.database import get_db
from app.models.db_models import User
from app.core.security import get_current_user

from app.services.trading.portfolio_service import PortfolioService
from app.services.trading.position_service import PositionService
from app.services.trading.order_service import OrderService
from app.services.trading.execution_service import ExecutionService
from app.services.market_data.market_data_service import MarketDataService

router = APIRouter(prefix="/api/paper-trading", tags=["paper-trading"])

class TradeRequest(BaseModel):
    symbol: str
    shares: float

@router.get("/portfolio")
def get_portfolio(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    portfolio = PortfolioService.get_or_create_portfolio(db, current_user)
    
    # Calculate current portfolio value based on live prices
    positions = PositionService.get_positions(db, portfolio.id)
    holdings_value = 0.0
    
    for pos in positions:
        if pos.shares > 0:
            md = MarketDataService.fetch_stock_data(pos.symbol)
            current_price = md.get("current_price", pos.average_cost) if md else pos.average_cost
            holdings_value += current_price * pos.shares
            
    total_value = portfolio.cash_balance + holdings_value
    unrealized_pnl = total_value - portfolio.initial_capital
    unrealized_pnl_pct = (unrealized_pnl / portfolio.initial_capital) * 100 if portfolio.initial_capital > 0 else 0
    
    return {
        "id": portfolio.id,
        "name": portfolio.name,
        "initial_capital": portfolio.initial_capital,
        "cash_balance": portfolio.cash_balance,
        "holdings_value": holdings_value,
        "total_value": total_value,
        "unrealized_pnl": unrealized_pnl,
        "unrealized_pnl_pct": unrealized_pnl_pct,
        "created_at": portfolio.created_at
    }

@router.get("/positions")
def get_positions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    portfolio = PortfolioService.get_or_create_portfolio(db, current_user)
    positions = PositionService.get_positions(db, portfolio.id)
    
    res = []
    for pos in positions:
        if pos.shares > 0:
            md = MarketDataService.fetch_stock_data(pos.symbol)
            current_price = md.get("current_price", pos.average_cost) if md else pos.average_cost
            market_value = current_price * pos.shares
            cost_basis = pos.average_cost * pos.shares
            unrealized_pnl = market_value - cost_basis
            unrealized_pnl_pct = (unrealized_pnl / cost_basis) * 100 if cost_basis > 0 else 0
            
            res.append({
                "id": pos.id,
                "symbol": pos.symbol,
                "shares": pos.shares,
                "average_cost": pos.average_cost,
                "current_price": current_price,
                "market_value": market_value,
                "unrealized_pnl": unrealized_pnl,
                "unrealized_pnl_pct": unrealized_pnl_pct,
                "updated_at": pos.updated_at
            })
    return res

@router.get("/orders")
def get_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    portfolio = PortfolioService.get_or_create_portfolio(db, current_user)
    orders = OrderService.get_orders(db, portfolio.id)
    return orders

@router.get("/trades")
def get_trades(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    portfolio = PortfolioService.get_or_create_portfolio(db, current_user)
    trades = [t for order in portfolio.orders if order.trade for t in [order.trade]]
    return sorted(trades, key=lambda t: t.executed_at, reverse=True)

@router.post("/buy")
def execute_buy(request: TradeRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    portfolio = PortfolioService.get_or_create_portfolio(db, current_user)
    try:
        trade = ExecutionService.execute_market_order(db, portfolio, request.symbol, "BUY", request.shares)
        return {"message": "Trade executed successfully", "trade_id": trade.id, "execution_price": trade.execution_price, "total_amount": trade.total_amount}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sell")
def execute_sell(request: TradeRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    portfolio = PortfolioService.get_or_create_portfolio(db, current_user)
    try:
        trade = ExecutionService.execute_market_order(db, portfolio, request.symbol, "SELL", request.shares)
        return {"message": "Trade executed successfully", "trade_id": trade.id, "execution_price": trade.execution_price, "total_amount": trade.total_amount}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/performance")
def get_performance(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    portfolio = PortfolioService.get_or_create_portfolio(db, current_user)
    
    # We could historically track equity curves in the db, but for simplicity here
    # we return a static mock curve since we aren't saving historical snapshots yet
    import datetime
    now = datetime.datetime.utcnow()
    dates = [(now - datetime.timedelta(days=i)).strftime('%Y-%m-%d') for i in range(30, -1, -1)]
    equity = [portfolio.initial_capital * (1 + (i*0.001)) for i in range(31)]
    equity[-1] = portfolio.cash_balance # Approx current
    
    return {
        "dates": dates,
        "equity": equity
    }

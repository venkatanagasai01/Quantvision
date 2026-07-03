from sqlalchemy.orm import Session
from app.models.db_models import Portfolio, Trade, CashTransaction
from app.services.trading.order_service import OrderService
from app.services.trading.position_service import PositionService
from app.services.market_data.market_data_service import MarketDataService

class ExecutionService:
    @staticmethod
    def execute_market_order(db: Session, portfolio: Portfolio, symbol: str, action: str, shares: float):
        action = action.upper()
        if action not in ["BUY", "SELL"]:
            raise ValueError("Action must be BUY or SELL")
            
        # 1. Fetch current live price
        market_data = MarketDataService.fetch_stock_data(symbol)
        if not market_data:
            raise ValueError(f"Could not fetch market data for {symbol}")
            
        current_price = market_data.get("current_price", 0.0)
        if current_price <= 0:
            raise ValueError(f"Invalid market price for {symbol}")
            
        total_value = current_price * shares
        
        # 2. Create Order
        order = OrderService.create_order(db, portfolio.id, symbol, action, shares, "MARKET")
        
        try:
            # 3. Validate against portfolio balances & positions
            if action == "BUY":
                if portfolio.cash_balance < total_value:
                    raise ValueError(f"Insufficient cash balance. Required: ${total_value:.2f}, Available: ${portfolio.cash_balance:.2f}")
                
                # Deduct cash
                portfolio.cash_balance -= total_value
                
                # Update position
                PositionService.update_position(db, portfolio.id, symbol, shares, current_price)
                
            elif action == "SELL":
                # PositionService.update_position validates sufficient shares
                PositionService.update_position(db, portfolio.id, symbol, -shares, current_price)
                
                # Add cash
                portfolio.cash_balance += total_value

            # 4. Record Trade & Cash Transaction
            trade = Trade(
                order_id=order.id,
                portfolio_id=portfolio.id,
                symbol=symbol,
                action=action,
                shares=shares,
                execution_price=current_price,
                total_amount=total_value
            )
            db.add(trade)
            
            cash_tx = CashTransaction(
                portfolio_id=portfolio.id,
                amount=-total_value if action == "BUY" else total_value,
                transaction_type="TRADE",
                description=f"{action} {shares} shares of {symbol} at ${current_price:.2f}"
            )
            db.add(cash_tx)
            
            # 5. Mark Order Filled
            order.status = "FILLED"
            
            db.commit()
            return trade
            
        except Exception as e:
            # Mark Order Rejected
            order.status = "REJECTED"
            db.commit()
            raise e

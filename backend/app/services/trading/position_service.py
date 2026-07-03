from sqlalchemy.orm import Session
from app.models.db_models import Position
from typing import List

class PositionService:
    @staticmethod
    def get_positions(db: Session, portfolio_id: int) -> List[Position]:
        return db.query(Position).filter(Position.portfolio_id == portfolio_id).all()

    @staticmethod
    def get_position_by_symbol(db: Session, portfolio_id: int, symbol: str) -> Position:
        return db.query(Position).filter(
            Position.portfolio_id == portfolio_id, 
            Position.symbol == symbol
        ).first()

    @staticmethod
    def update_position(db: Session, portfolio_id: int, symbol: str, shares_change: float, price: float) -> Position:
        position = PositionService.get_position_by_symbol(db, portfolio_id, symbol)
        
        if not position:
            if shares_change > 0:
                position = Position(
                    portfolio_id=portfolio_id,
                    symbol=symbol,
                    shares=shares_change,
                    average_cost=price
                )
                db.add(position)
            else:
                raise ValueError("Cannot sell shares of a stock you do not own.")
        else:
            if shares_change > 0:
                # Buying: Update average cost
                total_cost = (position.shares * position.average_cost) + (shares_change * price)
                new_shares = position.shares + shares_change
                position.average_cost = total_cost / new_shares
                position.shares = new_shares
            else:
                # Selling: Shares reduce, average cost remains the same
                if position.shares + shares_change < 0:
                    raise ValueError(f"Insufficient shares. You own {position.shares} shares.")
                position.shares += shares_change
                
                if position.shares == 0:
                    position.average_cost = 0.0

        db.commit()
        db.refresh(position)
        return position

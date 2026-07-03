from sqlalchemy.orm import Session
from app.models.db_models import Order
from typing import List

class OrderService:
    @staticmethod
    def get_orders(db: Session, portfolio_id: int) -> List[Order]:
        return db.query(Order).filter(Order.portfolio_id == portfolio_id).order_by(Order.created_at.desc()).all()

    @staticmethod
    def create_order(db: Session, portfolio_id: int, symbol: str, action: str, shares: float, order_type: str = "MARKET") -> Order:
        if shares <= 0:
            raise ValueError("Shares must be greater than zero.")
            
        order = Order(
            portfolio_id=portfolio_id,
            symbol=symbol,
            action=action.upper(),
            order_type=order_type.upper(),
            shares=shares,
            status="PENDING"
        )
        db.add(order)
        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def update_order_status(db: Session, order_id: int, status: str) -> Order:
        order = db.query(Order).filter(Order.id == order_id).first()
        if order:
            order.status = status
            db.commit()
            db.refresh(order)
        return order

from sqlalchemy.orm import Session
from app.models.db_models import Portfolio, User
from typing import Optional

class PortfolioService:
    @staticmethod
    def get_portfolio(db: Session, user: User) -> Optional[Portfolio]:
        return db.query(Portfolio).filter(Portfolio.user_id == user.id).first()

    @staticmethod
    def create_portfolio(db: Session, user: User, initial_capital: float = 100000.0) -> Portfolio:
        portfolio = Portfolio(
            user_id=user.id,
            name="Main Portfolio",
            initial_capital=initial_capital,
            cash_balance=initial_capital
        )
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)
        return portfolio

    @staticmethod
    def get_or_create_portfolio(db: Session, user: User) -> Portfolio:
        portfolio = PortfolioService.get_portfolio(db, user)
        if not portfolio:
            portfolio = PortfolioService.create_portfolio(db, user)
        return portfolio

    @staticmethod
    def reset_portfolio(db: Session, user: User) -> Portfolio:
        portfolio = PortfolioService.get_portfolio(db, user)
        if portfolio:
            db.delete(portfolio)
            db.commit()
        return PortfolioService.create_portfolio(db, user)

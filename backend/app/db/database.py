import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Default to SQLite for local development/testing if POSTGRES_URL is not set
DATABASE_URL = os.getenv("POSTGRES_URL", "sqlite:///./quantan.db")

# In SQLite we need connect_args={"check_same_thread": False} for FastAPI, but not for Postgres.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

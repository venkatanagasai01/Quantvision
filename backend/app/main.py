from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.api.routers import stocks, sentiment, backtests, dashboard, watchlist, reports, settings, ml, auth, paper_trading


# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Quantan AI Backend", version="1.0.0")

# Setup CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(stocks.router)
app.include_router(sentiment.router)
app.include_router(backtests.router)
app.include_router(dashboard.router)
app.include_router(watchlist.router)
app.include_router(reports.router)
app.include_router(settings.router)
app.include_router(ml.router)
app.include_router(paper_trading.router)

@app.get("/")
def read_root():
    return {"message": "Quantan AI Backend Running"}

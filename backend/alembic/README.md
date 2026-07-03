# Quantan AI Database Migrations

This folder contains the Alembic migrations for the PostgreSQL database.

## Setup Instructions

Make sure your PostgreSQL database is running and the connection string is exported in your environment variables before running migrations:

```bash
# Windows
set POSTGRES_URL=postgresql+psycopg2://user:password@localhost/quantan

# Mac/Linux
export POSTGRES_URL="postgresql+psycopg2://user:password@localhost/quantan"
```

## Initial Migration & Upgrade Path

To generate the initial migration based on the `app/models/db_models.py` schema:

```bash
cd backend
python -m alembic revision --autogenerate -m "Initial migration: Create Backtest models"
```

To apply the migration and create the tables in your PostgreSQL database:

```bash
python -m alembic upgrade head
```

If you ever need to rollback a migration:

```bash
python -m alembic downgrade -1
```

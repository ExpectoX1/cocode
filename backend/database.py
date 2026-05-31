import os
from pathlib import Path

import psycopg2.pool
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise ValueError("DATABASE_URL is not set in .env")

connection_pool = psycopg2.pool.SimpleConnectionPool(
    minconn=1,
    maxconn=10,
    dsn=database_url,
)

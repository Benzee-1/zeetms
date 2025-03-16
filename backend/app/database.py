# ZeeTMS/backend/app/database.py
import psycopg2
from psycopg2.extras import RealDictCursor
from config import config

def get_db_connection():
    params = config()
    conn = psycopg2.connect(
        host=params['host'],
        database=params['database'],
        user=params['user'],
        password=params['password'],
        port=params['port'],
        cursor_factory=RealDictCursor
    )
    return conn
"""
Database schema initialization for captured_pokemon table.
Run this on server startup to ensure the table exists.
"""
import os
import logging
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

logger = logging.getLogger(__name__)


def get_db_connection():
    """Get PostgreSQL database connection."""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=int(os.getenv('DB_PORT', 5432)),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', 'postgres'),
        database=os.getenv('DB_NAME', 'app_db')
    )


def init_database():
    """Initialize the database schema for captured_pokemon table."""
    try:
        conn = get_db_connection()
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS captured_pokemon (
                pokemon_name VARCHAR(255) PRIMARY KEY,
                captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_captured_pokemon_name 
            ON captured_pokemon(pokemon_name);
        """)
        
        cursor.close()
        conn.close()
        logger.info("Database schema initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Error initializing database schema: {e}")
        return False


if __name__ == '__main__':
    init_database()


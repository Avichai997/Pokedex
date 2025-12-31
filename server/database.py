"""
PostgreSQL database connection pool management.
"""
import os
import logging
from typing import Optional
from psycopg2 import pool

logger = logging.getLogger(__name__)

# Global connection pool
_db_pool: Optional[pool.ThreadedConnectionPool] = None


def init_connection_pool(min_conn: int = 1, max_conn: int = 10) -> bool:
    """
    Initialize PostgreSQL connection pool.
    
    Args:
        min_conn: Minimum number of connections in pool
        max_conn: Maximum number of connections in pool
        
    Returns:
        True if pool initialized successfully, False otherwise
    """
    global _db_pool
    
    try:
        _db_pool = pool.ThreadedConnectionPool(
            min_conn,
            max_conn,
            host=os.getenv('DB_HOST', 'localhost'),
            port=int(os.getenv('DB_PORT', 5432)),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', 'postgres'),
            database=os.getenv('DB_NAME', 'app_db')
        )
        logger.info(f"PostgreSQL connection pool initialized (min={min_conn}, max={max_conn})")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize PostgreSQL connection pool: {e}")
        _db_pool = None
        return False


def get_db_connection():
    """
    Get a connection from the connection pool.
    
    Returns:
        Database connection object
        
    Raises:
        RuntimeError: If pool is not initialized
        psycopg2.Error: If connection cannot be obtained
    """
    global _db_pool
    
    if _db_pool is None:
        raise RuntimeError("Database connection pool not initialized")
    
    try:
        return _db_pool.getconn()
    except Exception as e:
        logger.error(f"Failed to get database connection from pool: {e}")
        raise


def return_db_connection(conn) -> None:
    """
    Return a connection to the pool.
    
    Args:
        conn: Database connection to return
    """
    global _db_pool
    
    if _db_pool is None:
        return
    
    try:
        _db_pool.putconn(conn)
    except Exception as e:
        logger.error(f"Failed to return connection to pool: {e}")


def close_connection_pool() -> None:
    """
    Close all connections in the pool.
    """
    global _db_pool
    
    if _db_pool is None:
        return
    
    try:
        _db_pool.closeall()
        logger.info("PostgreSQL connection pool closed")
    except Exception as e:
        logger.error(f"Error closing connection pool: {e}")
    finally:
        _db_pool = None


def check_db_health() -> bool:
    """
    Check if database is accessible.
    
    Returns:
        True if database is accessible, False otherwise
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        return_db_connection(conn)
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        if conn:
            try:
                return_db_connection(conn)
            except:
                pass
        return False

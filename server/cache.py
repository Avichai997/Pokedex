"""
Redis caching logic with graceful degradation.
"""
import os
import json
import logging
import time
from typing import Optional, List, Dict, Any
import redis
from redis.exceptions import ConnectionError, TimeoutError, RedisError

import db

logger = logging.getLogger(__name__)

# Redis connection
_redis_client: Optional[redis.Redis] = None
_cache_ttl: int = int(os.getenv('POKEMON_CACHE_TTL', 120))
_redis_enabled: bool = True


def init_redis_connection(max_retries: int = 3, retry_delay: float = 1.0) -> bool:
    """
    Initialize Redis connection with retry logic.
    
    Args:
        max_retries: Maximum number of connection retry attempts
        retry_delay: Initial delay between retries (exponential backoff)
        
    Returns:
        True if connection successful, False otherwise
    """
    global _redis_client, _redis_enabled
    
    for attempt in range(max_retries):
        try:
            _redis_client = redis.Redis(
                host=os.getenv('REDIS_HOST', 'localhost'),
                port=int(os.getenv('REDIS_PORT', 6379)),
                db=int(os.getenv('REDIS_DB', 0)),
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True
            )
            
            # Test connection
            _redis_client.ping()
            _redis_enabled = True
            logger.info(f"Redis connection established (attempt {attempt + 1})")
            return True
            
        except (ConnectionError, TimeoutError, RedisError) as e:
            delay = retry_delay * (2 ** attempt)
            logger.warning(f"Redis connection attempt {attempt + 1} failed: {e}. Retrying in {delay}s...")
            if attempt < max_retries - 1:
                time.sleep(delay)
            else:
                logger.error("Redis connection failed after all retries. Caching disabled.")
                _redis_enabled = False
                _redis_client = None
                return False
        except Exception as e:
            logger.error(f"Unexpected error initializing Redis: {e}")
            _redis_enabled = False
            _redis_client = None
            return False
    
    return False


def check_redis_health() -> bool:
    """
    Check if Redis is accessible.
    
    Returns:
        True if Redis is accessible, False otherwise
    """
    global _redis_client, _redis_enabled
    
    if not _redis_enabled or _redis_client is None:
        return False
    
    try:
        _redis_client.ping()
        return True
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        return False


def get_cached_pokemon() -> List[Dict[str, Any]]:
    """
    Get Pokemon data from Redis cache or fetch from DB.
    Falls back to DB if Redis is unavailable.
    
    Returns:
        List of Pokemon dictionaries
    """
    global _redis_client, _redis_enabled
    
    cache_key = 'pokemon:all'
    
    # Try to get from cache
    if _redis_enabled and _redis_client is not None:
        try:
            cached = _redis_client.get(cache_key)
            if cached:
                logger.debug("Cache hit for pokemon:all")
                return json.loads(cached)
        except (ConnectionError, TimeoutError, RedisError) as e:
            logger.warning(f"Redis error while getting cache: {e}. Falling back to DB.")
            _redis_enabled = False
        except Exception as e:
            logger.error(f"Unexpected Redis error: {e}. Falling back to DB.")
    
    # Cache miss or Redis unavailable - fetch from DB
    logger.debug("Cache miss or Redis unavailable - fetching from DB")
    pokemon_data = db.get()
    
    # Try to store in cache (non-blocking)
    if _redis_enabled and _redis_client is not None:
        try:
            _redis_client.setex(cache_key, _cache_ttl, json.dumps(pokemon_data))
            logger.debug(f"Cached pokemon data with TTL {_cache_ttl}s")
        except Exception as e:
            logger.warning(f"Failed to cache Pokemon data: {e}")
    
    return pokemon_data


def get_cached_types() -> List[str]:
    """
    Get Pokemon types from Redis cache or extract from Pokemon data.
    Falls back to extracting from cached Pokemon data if Redis unavailable.
    
    Returns:
        Sorted list of Pokemon types
    """
    global _redis_client, _redis_enabled
    
    cache_key = 'pokemon:types'
    
    # Try to get from cache
    if _redis_enabled and _redis_client is not None:
        try:
            cached = _redis_client.get(cache_key)
            if cached:
                logger.debug("Cache hit for pokemon:types")
                return json.loads(cached)
        except (ConnectionError, TimeoutError, RedisError) as e:
            logger.warning(f"Redis error while getting types cache: {e}")
        except Exception as e:
            logger.error(f"Unexpected Redis error: {e}")
    
    # Cache miss - extract types from Pokemon data
    logger.debug("Cache miss for types - extracting from Pokemon data")
    all_pokemon = get_cached_pokemon()
    types_set = set()
    
    for pokemon in all_pokemon:
        if pokemon.get('type_one'):
            types_set.add(pokemon.get('type_one'))
        if pokemon.get('type_two'):
            types_set.add(pokemon.get('type_two'))
    
    types_list = sorted(list(types_set))
    
    # Try to store in cache (non-blocking)
    if _redis_enabled and _redis_client is not None:
        try:
            _redis_client.setex(cache_key, _cache_ttl, json.dumps(types_list))
            logger.debug(f"Cached types data with TTL {_cache_ttl}s")
        except Exception as e:
            logger.warning(f"Failed to cache types data: {e}")
    
    return types_list


def invalidate_cache() -> bool:
    """
    Invalidate Redis cache for Pokemon data and types.
    
    Returns:
        True if successful, False otherwise
    """
    global _redis_client, _redis_enabled
    
    if not _redis_enabled or _redis_client is None:
        logger.warning("Cannot invalidate cache - Redis not available")
        return False
    
    try:
        _redis_client.delete('pokemon:all')
        _redis_client.delete('pokemon:types')
        logger.info("Cache invalidated successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to invalidate cache: {e}")
        return False


def is_redis_enabled() -> bool:
    """
    Check if Redis caching is currently enabled.
    
    Returns:
        True if Redis is enabled and available, False otherwise
    """
    return _redis_enabled and _redis_client is not None

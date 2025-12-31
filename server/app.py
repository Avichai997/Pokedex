"""
Flask application for Pokédex API.
"""
import os
import logging
from typing import Dict, Any
from flask import Flask, jsonify, request
from flask_cors import CORS

import db
import db_schema
from database import (
    init_connection_pool,
    get_db_connection,
    return_db_connection,
    close_connection_pool,
    check_db_health
)
from cache import (
    init_redis_connection,
    get_cached_pokemon,
    get_cached_types,
    invalidate_cache,
    check_redis_health,
    is_redis_enabled
)
from utils import filter_by_type, fuzzy_search, sort_pokemon

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True)


class ValidationError(Exception):
    """Raised when request validation fails."""
    pass


class NotFoundError(Exception):
    """Raised when a resource is not found."""
    pass


@app.errorhandler(ValidationError)
def handle_validation_error(e: ValidationError):
    """Handle validation errors."""
    logger.warning(f"Validation error: {e}")
    return jsonify({'error': str(e)}), 400


@app.errorhandler(NotFoundError)
def handle_not_found_error(e: NotFoundError):
    """Handle not found errors."""
    logger.warning(f"Not found error: {e}")
    return jsonify({'error': str(e)}), 404


@app.errorhandler(Exception)
def handle_generic_error(e: Exception):
    """Handle generic errors."""
    logger.error(f"Unhandled error: {e}", exc_info=True)
    return jsonify({'error': 'An internal server error occurred'}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint for Redis, PostgreSQL, and DB file.
    
    Returns:
        JSON with health status of all services
    """
    health_status: Dict[str, Any] = {
        'status': 'healthy',
        'services': {}
    }
    
    # Check Redis
    redis_healthy = check_redis_health()
    health_status['services']['redis'] = {
        'status': 'healthy' if redis_healthy else 'unhealthy',
        'enabled': is_redis_enabled()
    }
    
    # Check PostgreSQL
    db_healthy = check_db_health()
    health_status['services']['postgresql'] = {
        'status': 'healthy' if db_healthy else 'unhealthy'
    }
    
    # Check DB file access
    try:
        import db
        # Just check if we can access the file (don't actually read it)
        db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "pokemon_db.json"))
        file_accessible = os.path.exists(db_path) and os.access(db_path, os.R_OK)
        health_status['services']['db_file'] = {
            'status': 'healthy' if file_accessible else 'unhealthy'
        }
    except Exception as e:
        logger.error(f"DB file health check failed: {e}")
        health_status['services']['db_file'] = {
            'status': 'unhealthy',
            'error': str(e)
        }
    
    # Overall status
    all_healthy = (
        health_status['services']['postgresql']['status'] == 'healthy' and
        health_status['services']['db_file']['status'] == 'healthy'
    )
    health_status['status'] = 'healthy' if all_healthy else 'degraded'
    
    status_code = 200 if all_healthy else 503
    return jsonify(health_status), status_code


@app.route('/icon/<name>')
def get_icon_url(name: str):
    """Get Pokemon icon URL."""
    return jsonify(f"https://img.pokemondb.net/sprites/silver/normal/{name.lower()}.png")


@app.route('/api/pokemon', methods=['GET'])
def get_pokemon():
    """Get paginated, sorted, and filtered Pokemon list."""
    try:
        # Get query parameters
        try:
            page = int(request.args.get('page', 1))
            page_size = int(request.args.get('page_size', 10))
        except ValueError:
            raise ValidationError("Invalid page or page_size parameter")
        
        sort = request.args.get('sort', 'asc')
        type_filter = request.args.get('type', None)
        search_query = request.args.get('search', None)
        
        # Validate sort direction
        if sort not in ['asc', 'desc']:
            sort = 'asc'
        
        # Validate page_size
        valid_page_sizes = [5, 10, 20]
        if page_size not in valid_page_sizes:
            page_size = 10
        
        # Get cached Pokemon data
        all_pokemon = get_cached_pokemon()
        
        # Apply filters
        filtered_pokemon = all_pokemon
        
        if type_filter:
            filtered_pokemon = filter_by_type(filtered_pokemon, type_filter)
        
        if search_query:
            filtered_pokemon = fuzzy_search(filtered_pokemon, search_query)
        
        # Apply sorting
        sorted_pokemon = sort_pokemon(filtered_pokemon, sort)
        
        # Calculate pagination
        total = len(sorted_pokemon)
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0
        
        # Clamp page to valid range
        if page < 1:
            page = 1
        elif page > total_pages and total_pages > 0:
            page = total_pages
        
        # Get paginated results
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_pokemon = sorted_pokemon[start_idx:end_idx]
        
        return jsonify({
            'pokemon': paginated_pokemon,
            'total': total,
            'page': page,
            'page_size': page_size,
            'total_pages': total_pages
        })
    
    except ValidationError:
        raise
    except Exception as e:
        logger.error(f"Error in get_pokemon: {e}", exc_info=True)
        raise


@app.route('/api/pokemon/captured', methods=['GET'])
def get_captured_pokemon():
    """Get list of captured Pokemon names."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT pokemon_name FROM captured_pokemon")
        results = cursor.fetchall()
        
        captured_names = [row[0] for row in results]
        
        cursor.close()
        return_db_connection(conn)
        
        return jsonify({'captured': captured_names})
    
    except Exception as e:
        logger.error(f"Error in get_captured_pokemon: {e}", exc_info=True)
        if conn:
            try:
                return_db_connection(conn)
            except:
                pass
        raise


@app.route('/api/pokemon/capture', methods=['POST'])
def toggle_capture():
    """Toggle capture status for a Pokemon."""
    conn = None
    try:
        data = request.get_json()
        if not data:
            raise ValidationError("Request body is required")
        
        pokemon_name = data.get('name')
        captured = data.get('captured', False)
        
        if pokemon_name is None:
            raise ValidationError("Pokemon name is required")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if captured:
            # Insert or update (ignore if already exists)
            cursor.execute("""
                INSERT INTO captured_pokemon (pokemon_name, captured_at)
                VALUES (%s, CURRENT_TIMESTAMP)
                ON CONFLICT (pokemon_name) DO NOTHING
            """, (pokemon_name,))
        else:
            # Delete
            cursor.execute("DELETE FROM captured_pokemon WHERE pokemon_name = %s", (pokemon_name,))
        
        conn.commit()
        cursor.close()
        return_db_connection(conn)
        
        return jsonify({'success': True})
    
    except ValidationError:
        raise
    except Exception as e:
        logger.error(f"Error in toggle_capture: {e}", exc_info=True)
        if conn:
            try:
                conn.rollback()
                return_db_connection(conn)
            except:
                pass
        raise


@app.route('/api/pokemon/types', methods=['GET'])
def get_pokemon_types():
    """Get list of available Pokemon types."""
    try:
        types = get_cached_types()
        return jsonify({'types': types})
    except Exception as e:
        logger.error(f"Error in get_pokemon_types: {e}", exc_info=True)
        raise


@app.route('/api/pokemon/invalidate-cache', methods=['POST'])
def invalidate_cache_endpoint():
    """Invalidate Redis cache for Pokemon data and types."""
    try:
        success = invalidate_cache()
        if success:
            return jsonify({'success': True, 'message': 'Cache invalidated successfully'})
        else:
            return jsonify({
                'success': False,
                'message': 'Cache invalidation failed or Redis is unavailable'
            }), 503
    except Exception as e:
        logger.error(f"Error in invalidate_cache: {e}", exc_info=True)
        raise


@app.route('/')
def hello():
    """Legacy endpoint - returns all Pokemon."""
    try:
        data = db.get()
        return jsonify(data)
    except Exception as e:
        logger.error(f"Error in legacy endpoint: {e}", exc_info=True)
        raise


@app.teardown_appcontext
def close_db_connections(error):
    """Clean up database connections on request teardown."""
    # Connections are returned to pool automatically, but this is a safety net
    pass


if __name__ == '__main__':
    # Initialize logging
    logger.info("Starting Pokédex API server...")
    
    # Initialize database schema
    logger.info("Initializing database schema...")
    db_schema.init_database()
    
    # Initialize connection pool
    logger.info("Initializing PostgreSQL connection pool...")
    if not init_connection_pool(min_conn=1, max_conn=10):
        logger.error("Failed to initialize PostgreSQL connection pool")
        exit(1)
    
    # Initialize Redis connection
    logger.info("Initializing Redis connection...")
    init_redis_connection(max_retries=3, retry_delay=1.0)
    
    # Register cleanup on shutdown
    import atexit
    atexit.register(close_connection_pool)
    
    port = int(os.getenv('PORT', 8080))
    logger.info(f"Server starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)

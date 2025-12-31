from flask import Flask, jsonify, request
from flask_cors import CORS
import db
import redis
import os
import json
import db_schema

# Initialize Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True)

# Redis connection setup
redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    db=int(os.getenv('REDIS_DB', 0)),
    decode_responses=True
)

# Cache TTL (default: 2 minutes)
CACHE_TTL = int(os.getenv('POKEMON_CACHE_TTL', 120))


def get_db_connection():
    """Get PostgreSQL database connection."""
    import psycopg2
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=int(os.getenv('DB_PORT', 5432)),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', 'postgres'),
        database=os.getenv('DB_NAME', 'app_db')
    )


def get_cached_pokemon():
    """Get Pokemon data from Redis cache or fetch from DB."""
    cache_key = 'pokemon:all'
    cached = redis_client.get(cache_key)
    
    if cached:
        return json.loads(cached)
    
    # Cache miss or expired - fetch from DB (2-second delay)
    pokemon_data = db.get()
    
    # Store in Redis with TTL
    redis_client.setex(cache_key, CACHE_TTL, json.dumps(pokemon_data))
    
    return pokemon_data


def get_cached_types():
    """Get Pokemon types from Redis cache or extract from cached Pokemon data."""
    cache_key = 'pokemon:types'
    cached = redis_client.get(cache_key)
    
    if cached:
        return json.loads(cached)
    
    # Cache miss - extract types from cached Pokemon data
    all_pokemon = get_cached_pokemon()
    types_set = set()
    
    for pokemon in all_pokemon:
        if pokemon.get('type_one'):
            types_set.add(pokemon.get('type_one'))
        if pokemon.get('type_two'):
            types_set.add(pokemon.get('type_two'))
    
    types_list = sorted(list(types_set))
    
    # Store in Redis with same TTL as Pokemon cache
    redis_client.setex(cache_key, CACHE_TTL, json.dumps(types_list))
    
    return types_list


def filter_by_type(pokemon_list, type_filter):
    """Filter Pokemon by type (matches type_one OR type_two)."""
    if not type_filter:
        return pokemon_list
    
    type_filter_lower = type_filter.lower()
    return [
        p for p in pokemon_list
        if (p.get('type_one', '').lower() == type_filter_lower or
            p.get('type_two', '').lower() == type_filter_lower)
    ]


def fuzzy_search(pokemon_list, search_query):
    """Fuzzy search across Pokemon properties."""
    if not search_query:
        return pokemon_list
    
    search_lower = search_query.lower()
    results = []
    
    for pokemon in pokemon_list:
        # Search in name
        if search_lower in pokemon.get('name', '').lower():
            results.append(pokemon)
            continue
        
        # Search in types
        if (search_lower in pokemon.get('type_one', '').lower() or
            search_lower in pokemon.get('type_two', '').lower()):
            results.append(pokemon)
            continue
        
        # Search in number (as string)
        if search_lower in str(pokemon.get('number', '')):
            results.append(pokemon)
            continue
        
        # Search in other fields (optional)
        if search_lower in str(pokemon.get('generation', '')).lower():
            results.append(pokemon)
            continue
    
    return results


def sort_pokemon(pokemon_list, sort_direction='asc'):
    """Sort Pokemon by number attribute."""
    sorted_list = sorted(pokemon_list, key=lambda x: x.get('number', 0))
    if sort_direction.lower() == 'desc':
        sorted_list.reverse()
    return sorted_list


@app.route('/icon/<name>')
def get_icon_url(name: str):
    """Get Pokemon icon URL."""
    return jsonify(f"https://img.pokemondb.net/sprites/silver/normal/{name.lower()}.png")


@app.route('/api/pokemon', methods=['GET'])
def get_pokemon():
    """Get paginated, sorted, and filtered Pokemon list."""
    try:
        # Get query parameters
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('page_size', 10))
        sort = request.args.get('sort', 'asc')
        type_filter = request.args.get('type', None)
        search_query = request.args.get('search', None)
        
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
        total_pages = (total + page_size - 1) // page_size
        
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
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/pokemon/captured', methods=['GET'])
def get_captured_pokemon():
    """Get list of captured Pokemon names."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT pokemon_name FROM captured_pokemon")
        results = cursor.fetchall()
        
        captured_names = [row[0] for row in results]
        
        cursor.close()
        conn.close()
        
        return jsonify({'captured': captured_names})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/pokemon/capture', methods=['POST'])
def toggle_capture():
    """Toggle capture status for a Pokemon."""
    try:
        data = request.get_json()
        pokemon_name = data.get('name')
        captured = data.get('captured', False)
        
        if pokemon_name is None:
            return jsonify({'error': 'Pokemon name is required'}), 400
        
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
        conn.close()
        
        return jsonify({'success': True})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/pokemon/types', methods=['GET'])
def get_pokemon_types():
    """Get list of available Pokemon types."""
    try:
        types = get_cached_types()
        return jsonify({'types': types})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/pokemon/invalidate-cache', methods=['POST'])
def invalidate_cache():
    """Invalidate Redis cache for Pokemon data and types."""
    try:
        redis_client.delete('pokemon:all')
        redis_client.delete('pokemon:types')
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/')
def hello():
    """Legacy endpoint - returns all Pokemon."""
    data = db.get()
    return jsonify(data)


if __name__ == '__main__':
    # Initialize database schema on startup
    print("Initializing database schema...")
    db_schema.init_database()
    
    port = int(os.getenv('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)

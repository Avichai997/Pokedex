# Pokédex - Full-Stack Application

A full-stack Pokédex application built with React 18, Flask (Python), PostgreSQL, and Redis.

## Prerequisites

- Node.js 22+
- Docker and Docker Compose
- Python 3.11+ (for local development)

## Quick Start

### Development Mode

```bash
# Start all services (PostgreSQL, Redis, Flask server)
docker-compose -f docker-compose.dev.yml up --build

# Start Client app
cd client
npm install
npm run dev
```

**Access:**

- Client: http://localhost:5173
- API: http://localhost:8080/api

### Production Mode

```bash
# Build and start production containers
docker-compose up --build
```

**Access:**

- Client: http://localhost:5173
- API: http://localhost:8080/api

## Architecture

### Client (React + TypeScript)

The frontend is a React application built with:

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Query** for data fetching and caching
- **Zustand** for state management
- **Tailwind CSS** for styling

**Key Features:**

- Browse Pokemon with pagination
- Filter by type
- Search Pokemon by name, type, or number
- Sort by Pokemon number
- Mark Pokemon as captured
- Light/dark theme toggle
- Infinite scroll mode

### Server (Flask + Python)

The backend is a Flask REST API that provides:

- **Flask** web framework
- **PostgreSQL** for persistent storage (captured Pokemon)
- **Redis** for caching Pokemon data (2-minute TTL)

**Key Features:**

- RESTful API endpoints
- Redis caching for performance with graceful degradation
- PostgreSQL connection pooling
- Structured logging
- Health check endpoint
- Error handling with proper HTTP status codes
- CORS enabled for client communication

#### Server Architecture

The server is organized into modular components:

- **`app.py`**: Main Flask application with route handlers
- **`cache.py`**: Redis caching logic with error handling and fallback
- **`database.py`**: PostgreSQL connection pool management
- **`utils.py`**: Utility functions for filtering, sorting, and searching
- **`db_schema.py`**: Database schema initialization

#### Redis Caching Strategy

**Current Implementation:**
- Single cache key (`pokemon:all`) stores the complete Pokemon dataset
- TTL: 2 minutes (configurable via `POKEMON_CACHE_TTL` environment variable)
- Types cached separately (`pokemon:types`) with same TTL
- Filtering, sorting, and pagination performed in-memory after cache retrieval

**Why This Strategy Works:**
- Pokemon dataset is relatively small (~800-1000 items), making in-memory operations fast
- The underlying DB query has a 2-second artificial delay (per `db.py`), making caching critical for performance
- Single cache key simplifies cache invalidation
- Reduces Redis memory usage compared to caching multiple filtered/sorted variants

**Error Handling:**
- Graceful degradation: If Redis is unavailable, the application automatically falls back to direct DB queries
- Connection retry logic with exponential backoff on startup
- Health checks to monitor Redis availability
- Non-blocking cache writes (failures don't block requests)

**Cache Invalidation:**
- Manual invalidation via `POST /api/pokemon/invalidate-cache` endpoint
- Automatic expiration via TTL (2 minutes default)
- Cache automatically repopulates on next request after expiration

#### Database Connection Pooling

- Uses `psycopg2.pool.ThreadedConnectionPool` for efficient connection management
- Pool size: 1-10 connections (configurable)
- Connections are automatically returned to the pool after use
- Health checks ensure pool availability

#### Error Handling

- Custom exception types: `ValidationError` (400), `NotFoundError` (404)
- Proper HTTP status codes for all error scenarios
- Structured logging with error context
- Graceful error responses with consistent format

## API Endpoints

### Pokemon Endpoints

- `GET /api/pokemon` - Get paginated Pokemon list

  - Query params: `page`, `page_size` (5/10/20), `sort` (asc/desc), `type`, `search`
  - Returns: `{ pokemon: [], total: number, page: number, page_size: number, total_pages: number }`

- `GET /api/pokemon/captured` - Get list of captured Pokemon names

  - Returns: `{ captured: string[] }`

- `POST /api/pokemon/capture` - Toggle capture status

  - Body: `{ name: string, captured: boolean }`
  - Returns: `{ success: boolean }`

- `GET /api/pokemon/types` - Get available Pokemon types

  - Returns: `{ types: string[] }`

- `POST /api/pokemon/invalidate-cache` - Invalidate Redis cache

  - Returns: `{ success: boolean }`

- `GET /icon/<name>` - Get Pokemon icon URL
  - Returns: Icon URL string

- `GET /api/health` - Health check endpoint
  - Returns: `{ status: string, services: { redis: {...}, postgresql: {...}, db_file: {...} } }`
  - Checks Redis, PostgreSQL, and DB file accessibility

## Tech Stack

**Frontend:**

- React 18 + TypeScript
- Vite
- React Query v5
- Zustand
- Tailwind CSS

**Backend:**

- Flask (Python)
- PostgreSQL 15
- Redis 7

**Infrastructure:**

- Docker & Docker Compose

## Architecture Diagram

```
┌─────────────┐
│   Client    │ (React + TypeScript)
│  (Browser)  │
└──────┬──────┘
       │ HTTP/REST
       │
┌──────▼──────────────────────────────────────┐
│         Flask API Server                     │
│  ┌──────────────────────────────────────┐   │
│  │  Route Handlers (app.py)              │   │
│  └──────┬───────────────────┬───────────┘   │
│         │                   │                │
│  ┌──────▼──────┐    ┌──────▼──────────┐     │
│  │  Cache      │    │  Database Pool   │     │
│  │  (cache.py) │    │  (database.py)  │     │
│  └──────┬──────┘    └──────┬───────────┘     │
│         │                  │                 │
└─────────┼──────────────────┼─────────────────┘
          │                  │
    ┌─────▼─────┐    ┌──────▼────────┐
    │   Redis   │    │  PostgreSQL   │
    │  (Cache)  │    │  (Captured)   │
    └───────────┘    └───────────────┘
          │
    ┌─────▼──────────┐
    │  pokemon_db.json│
    │  (Pokemon Data) │
    └────────────────┘
```

## Performance Considerations

### Client-Side vs Server-Side Processing

**Current Approach: Server-Side Processing**
- Filtering, sorting, and pagination performed on the server
- Reduces client-side computation
- Ensures consistent results across clients
- Better for large datasets (though Pokemon dataset is manageable)

**Trade-offs:**
- More server CPU usage
- Network bandwidth for filtered results
- Server must handle all filtering logic

**Why This Works:**
- Pokemon dataset fits in memory easily
- Redis caching minimizes DB load
- Server-side processing ensures data consistency
- Reduces client bundle size and computation

### Caching Strategy Trade-offs

**Single Cache Key Approach (Current):**
- ✅ Simple cache invalidation
- ✅ Lower Redis memory usage
- ✅ Fast cache lookups
- ❌ Must filter/sort in-memory for each request
- ❌ Cache hit doesn't benefit from different filter combinations

**Alternative: Multiple Cache Keys (Not Implemented):**
- ✅ Could cache filtered/sorted combinations
- ❌ Complex cache invalidation
- ❌ Higher Redis memory usage
- ❌ Cache key explosion (many combinations)

**Decision:** Single cache key is optimal for this use case given dataset size and query patterns.

## Development Notes

### Environment Variables

**Server:**
- `DB_HOST`: PostgreSQL host (default: localhost)
- `DB_PORT`: PostgreSQL port (default: 5432)
- `DB_USER`: PostgreSQL user (default: postgres)
- `DB_PASSWORD`: PostgreSQL password (default: postgres)
- `DB_NAME`: PostgreSQL database name (default: app_db)
- `REDIS_HOST`: Redis host (default: localhost)
- `REDIS_PORT`: Redis port (default: 6379)
- `REDIS_DB`: Redis database number (default: 0)
- `POKEMON_CACHE_TTL`: Cache TTL in seconds (default: 120)
- `PORT`: Server port (default: 8080)

**Client:**
- `VITE_API_URL`: API base URL (default: http://localhost:8080/api)

### Logging

The server uses Python's `logging` module with structured logging:
- Log level: INFO (configurable)
- Format: Timestamp, logger name, level, message
- Cache operations are logged at DEBUG level
- Errors include full stack traces

### Error Handling

All endpoints include comprehensive error handling:
- Validation errors return 400 with descriptive messages
- Not found errors return 404
- Server errors return 500 with generic messages (detailed errors logged)
- Database connection errors are handled gracefully
- Redis failures fall back to direct DB queries

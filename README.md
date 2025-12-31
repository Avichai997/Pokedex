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
- Redis caching for performance
- PostgreSQL for data persistence
- CORS enabled for client communication

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

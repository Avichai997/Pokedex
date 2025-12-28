# Full-Stack App Template

A full-stack application template with user authentication. Built with React 18, NestJS, and PostgreSQL.

## Quick Start

### Prerequisites

- Node.js 22+
- Docker and Docker Compose
- npm or yarn

### Installation Steps

1. **Install dependencies:**

   ```bash
   npm run install
   ```

2. **Configure environment variables (optional):**

   You can set environment variables or edit the config files directly:

   - Server config: `server/src/config/config.ts`
   - Client config: `client/src/config/config.ts`

   Or set environment variables before running:

   ```bash
   # Example: Set environment variables
   export DB_PASSWORD=yourpassword
   export JWT_SECRET=your-secret-key
   ```

3. **Start database and server (Terminal 1):**

   ```bash
   npm run docker:up:dev
   ```

4. **Run database migrations (wait for server to start, then in a new terminal):**

   ```bash
   cd server
   npm run migration:run
   ```

5. **Start client (Terminal 2):**
   ```bash
   npm run client:dev
   ```

That's it! The application will be available at:

- **Client**: http://localhost:5173
- **Server API**: http://localhost:3001/api
- **API Documentation (Swagger)**: http://localhost:3001/api/docs
- **Database**: localhost:5432

> 📖 For detailed setup instructions, troubleshooting, and production deployment, see [SETUP.md](./SETUP.md)

## Features

- User authentication with JWT and HTTP-only cookies
- Secure API with CSRF protection, CORS, and XSS prevention
- Dockerized setup for easy deployment
- TypeScript throughout for type safety

## Tech Stack

**Frontend:**

- React 18 with TypeScript
- Vite
- React Query v5
- Zustand
- Material-UI
- Tailwind CSS

**Backend:**

- NestJS 11 with TypeScript
- TypeORM
- PostgreSQL
- JWT authentication
- bcrypt for password hashing
- Swagger/OpenAPI for API documentation

**Infrastructure:**

- Docker & Docker Compose
- PostgreSQL 15

## Prerequisites

- Node.js 22 (use `.nvmrc` if you have nvm: `nvm use`)
- Docker and Docker Compose
- npm or yarn

## Configuration

Configuration is managed through config files with environment variable support:

### Server Configuration

Edit `server/src/config/config.ts` or set environment variables:

```typescript
// Default values in config.ts
export const config = {
  server: {
    port: 3001,
    nodeEnv: 'development',
  },
  database: {
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    name: 'app_db',
  },
  jwt: {
    secret: 'dev-secret-key-change-in-production',
    expiresIn: 604800, // 7 days
  },
  cors: {
    clientUrl: 'http://localhost:5173',
  },
};
```

**Environment variables override defaults:**

- `SERVER_PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Database config
- `JWT_SECRET`, `JWT_EXPIRES_IN` - JWT configuration
- `CLIENT_URL` - CORS allowed origin

### Client Configuration

Edit `client/src/config/config.ts` or set environment variables:

```typescript
// Default values in config.ts
export const config = {
  api: {
    baseURL: 'http://localhost:3001/api',
  },
};
```

**Environment variables override defaults:**

- `VITE_API_URL` - API base URL (default: http://localhost:3001/api)

## Development Mode (Recommended for Fast HMR)

For the best development experience with instant Hot Module Replacement (HMR), run the client **natively** while the server and database run in Docker:

```bash
# Install dependencies first
npm run install

# Start everything with one command (recommended!)
npm run dev
# This will:
# 1. Start DB + Server in Docker with hot-reload
# 2. Start Vite client natively with instant HMR
```

Or run components separately:

```bash
# Terminal 1: Start Docker services (DB + Server only)
npm run docker:up:dev

# Terminal 2: Start client natively (if not using npm run dev)
cd client && npm run dev
```

**Why this approach?**

- ⚡ **Super fast HMR**: Vite runs natively without Docker overhead
- 🔄 **Live reload**: Changes reflect instantly (< 50ms)
- 🐛 **Better debugging**: Native Chrome DevTools integration
- 📦 **Isolated services**: Server & DB still in Docker for consistency

### Manual Setup (All Services Local)

If you prefer to run everything locally without Docker:

#### 1. Database Setup

Start PostgreSQL:

```bash
docker-compose up db
```

#### 2. Backend Setup

```bash
cd server
npm install
# Optionally edit server/src/config/config.ts or set environment variables
npm run start:dev
```

The server will run on http://localhost:3001

#### 3. Frontend Setup

```bash
cd client
npm install
# Optionally edit client/src/config/config.ts or set VITE_API_URL
npm run dev
```

The client will run on http://localhost:5173

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login (sets HTTP-only cookie)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `GET /api/auth/csrf-token` - Get CSRF token

## API Documentation (OpenAPI/Swagger)

The server includes auto-generated OpenAPI/Swagger documentation for all API endpoints.

### Access the Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:3001/api/docs

### Features

- **Interactive API Testing**: Try out endpoints directly from the browser
- **Request/Response Schemas**: View detailed schemas for all DTOs
- **Authentication Support**:
  - JWT Bearer token authentication
  - Cookie-based authentication (access_token)
- **Complete Endpoint Documentation**: All endpoints with descriptions, parameters, and examples

### Using the Documentation

1. **View Endpoints**: Browse all available API endpoints organized by tags
2. **Test Endpoints**: Click "Try it out" on any endpoint to test it directly
3. **Authenticate**: Use the "Authorize" button at the top to set your JWT token or cookie
4. **View Schemas**: Check the "Schemas" section to see all data models and DTOs

The documentation is automatically generated from your code using decorators and will stay up-to-date as you modify your controllers and DTOs.

## Running Tests

```bash
# Backend tests
cd server
npm test

# With coverage
npm run test:cov
```

## Code Quality

The project uses ESLint and Prettier with Husky git hooks:

- **Pre-commit**: Runs lint-staged (ESLint + Prettier on staged files)
- **Pre-push**: Runs full lint and build checks

To format code manually:

```bash
# Server
cd server
npm run format
npm run lint

# Client
cd client
npm run lint
```

## Docker Commands

### Start Services

```bash
# Development mode (with hot-reload)
NODE_ENV=development DOCKERFILE=Dockerfile.dev docker-compose up --build

# Production mode
docker-compose up --build

# Run in background (detached mode)
docker-compose up -d --build
```

### Stop Services

```bash
docker-compose down
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f db
```

### Other Useful Commands

```bash
# Check running containers
docker-compose ps

# Rebuild specific service
docker-compose build server
docker-compose build client

# Restart a service
docker-compose restart server
```

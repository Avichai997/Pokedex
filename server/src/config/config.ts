/**
 * Application Configuration
 * All environment variables with defaults
 */

export const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.SERVER_PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'app_db',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    expiresIn: Number(process.env.JWT_EXPIRES_IN) || 7 * 24 * 60 * 60, // 7 days in seconds
  },

  // CORS Configuration
  cors: {
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  },
} as const;

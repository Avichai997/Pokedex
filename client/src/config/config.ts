/**
 * Client Configuration
 * All environment variables with defaults
 */

export const config = {
  api: {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  },
} as const;

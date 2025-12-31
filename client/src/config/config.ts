export const config = {
  api: {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  },
} as const;

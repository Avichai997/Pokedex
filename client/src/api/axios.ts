import axios from 'axios';

import { config } from '@/config';
import { APP_ROUTES } from '@/constants/routes';

const api = axios.create({
  baseURL: config.api.baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let csrfToken: string | null = null;

export const setCsrfToken = (token: string) => {
  csrfToken = token;
};

api.interceptors.request.use(
  (config) => {
    if (csrfToken && config.method !== 'get' && config.method !== 'head') {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const isAuthEndpoint =
        error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');

      if (!isAuthEndpoint) {
        window.location.href = APP_ROUTES.LOGIN;
      }
    }
    return Promise.reject(error);
  },
);

export default api;

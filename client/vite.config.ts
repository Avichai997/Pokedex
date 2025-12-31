import path from 'path';
import fs from 'fs';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Detect if running in Docker container
const isDocker = (() => {
  if (process.env.DOCKER_ENV === 'true') return true;
  if (fs.existsSync('/.dockerenv')) return true;
  try {
    if (fs.existsSync('/proc/self/cgroup')) {
      const cgroup = fs.readFileSync('/proc/self/cgroup', 'utf8');
      return cgroup.includes('docker');
    }
  } catch {
    // Ignore errors reading cgroup
  }
  return false;
})();

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: !isDocker, // Disable auto-open in Docker
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5173,
    host: true,
    open: !isDocker, // Disable auto-open in Docker
  },
});

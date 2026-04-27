import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite Configuration — Multi-Backend Proxy
 *
 * Routes API calls to the correct Flask backend:
 *   /api/admin/*                → Admin server (port 5001)
 *   /api/volunteer/*            → Volunteer server (port 5002)
 *   /api/ngo/*                  → NGO server (port 5003)
 *   /api/auth/register/volunteer → Volunteer server (port 5002)
 *   /api/auth/register/ngo      → NGO server (port 5003)
 *   /api/auth/login/admin       → Admin server (port 5001)
 *   /api/auth/login/volunteer   → Volunteer server (port 5002)
 *   /api/auth/login/ngo         → NGO server (port 5003)
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // ---- Admin API ----
      '/api/admin': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },

      // ---- Volunteer API ----
      '/api/volunteer': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },

      // ---- NGO API ----
      '/api/ngo': {
        target: 'http://localhost:5003',
        changeOrigin: true,
      },

      // ---- Auth: Role-specific login ----
      '/api/auth/login/admin': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/auth/login/admin', '/api/auth/login'),
      },
      '/api/auth/login/volunteer': {
        target: 'http://localhost:5002',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/auth/login/volunteer', '/api/auth/login'),
      },
      '/api/auth/login/ngo': {
        target: 'http://localhost:5003',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/auth/login/ngo', '/api/auth/login'),
      },

      // ---- Auth: Registration ----
      '/api/auth/register/volunteer': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
      '/api/auth/register/ngo': {
        target: 'http://localhost:5003',
        changeOrigin: true,
      },
    },
  },
})

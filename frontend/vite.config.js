import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            // When Spring Boot backend is not running, return 502 gracefully
            // instead of crashing or throwing unhandled AggregateError
            if (res && !res.headersSent && typeof res.writeHead === 'function') {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                status: 502,
                error: 'Bad Gateway',
                message: 'Backend server at http://127.0.0.1:8080 is not reachable.'
              }));
            }
          });
        }
      },
    },
  },
})

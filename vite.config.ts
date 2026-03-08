import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/webhook': {
        target: 'https://realsoftapps.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/webhook/, '/n8n/webhook-test/DataDiscovery'),
        secure: true,
      },
    },
  },
})


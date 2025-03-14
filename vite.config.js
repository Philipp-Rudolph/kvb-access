import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  // plugins: [vue(), vueDevTools()],
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0', // To allow external connections
    port: 9090, // Default port for development
    allowedHosts: ['www.kvb-access.de'],
    proxy: {
      '/api': {
        target: 'https://data.webservice-kvb.koeln/service/opendata', // Use for macOS/Windows, use host IP for Linux
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})

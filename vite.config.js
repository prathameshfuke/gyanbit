import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        studio: resolve(__dirname, 'studio.html'),
        games: resolve(__dirname, 'games.html'),
        about: resolve(__dirname, 'about.html'),
        hardware: resolve(__dirname, 'hardware.html'),
        docs: resolve(__dirname, 'docs.html')
      }
    },
    // Copy chatbot.js to dist as a standalone file
    copyPublicDir: true,
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // default is 500 kB
    chunkSizeWarningLimit: 1600, // set this higher if needed
  },
})

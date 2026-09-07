import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: replace 'hostel-frontend' below with your EXACT GitHub repo name.
// This tells the built app where it will live: https://<username>.github.io/<repo-name>/
export default defineConfig({
  base: '/hostel-frontend/',
  plugins: [react()],
  server: {
    port: 5173
  }
})

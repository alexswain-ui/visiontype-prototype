import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Simple settings for running on your own computer.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})

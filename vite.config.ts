import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BASE_PATH is set by the deploy workflows:
//   main:     /Kaylee-Gamepack/
//   previews: /Kaylee-Gamepack/pr-preview/pr-<n>/
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  server: { host: true },
  preview: { host: true },
})

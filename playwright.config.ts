import { defineConfig } from '@playwright/test'

// Smoke tests run against the production build (npm run build first; `npm run check` does both).
export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173/',
    browserName: 'chromium',
    viewport: { width: 820, height: 1180 }, // iPad Air, portrait
    hasTouch: true,
  },
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: !process.env.CI,
  },
})

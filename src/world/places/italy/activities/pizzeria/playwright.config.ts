import { defineConfig } from '@playwright/test'

// Run with: npx playwright test --config src/world/places/italy/activities/pizzeria/playwright.config.ts
export default defineConfig({
  testDir: '.',
  testMatch: 'Pizzeria.spec.ts',
  timeout: 120_000,
  use: { baseURL: 'http://localhost:4173/', browserName: 'webkit', hasTouch: true, screenshot: 'only-on-failure' },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: !process.env.CI,
  },
})

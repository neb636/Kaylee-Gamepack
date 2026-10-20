import { defineConfig } from '@playwright/test'

// Smoke tests run against the production build (npm run build first; `npm run check` does both).
export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173/',
    hasTouch: true,
  },
  projects: [
    // Step-by-step walkthroughs are tagged @behavior: they break on every UI tweak, so they run nightly (`npm run test:behavior`), not on every PR.
    { name: 'chromium', testIgnore: /tap-around/, grepInvert: process.env.BEHAVIOR ? undefined : /@behavior/, use: { browserName: 'chromium', viewport: { width: 820, height: 1180 } } }, // iPad Air, portrait
    // Safari's engine, like Kaylee's iPad: every section opened and poked (tests/tap-around.spec.ts).
    { name: 'webkit', testMatch: /tap-around/, use: { browserName: 'webkit', viewport: { width: 1180, height: 820 } } }, // iPad Air, landscape
  ],
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: !process.env.CI,
  },
})

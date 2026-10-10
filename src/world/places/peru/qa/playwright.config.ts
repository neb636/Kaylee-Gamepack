import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: '.', testMatch: 'CozyAndes.spec.ts', timeout: 120_000, workers: 1,
  outputDir: '../../../../../qa-output/peru/test-results', reporter: 'list',
  use: { baseURL: 'http://localhost:4187/', browserName: 'webkit', hasTouch: true },
  webServer: { command: 'npm run preview -- --port 4187 --strictPort', url: 'http://localhost:4187/', reuseExistingServer: !process.env.CI },
})

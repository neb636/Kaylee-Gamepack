import { defineConfig } from '@playwright/test'

export default defineConfig({
  outputDir: `${process.cwd()}/qa-output/trevi-tests`,
  testDir: '.', testMatch: 'Trevi.spec.ts', timeout: 60_000,
  use: { baseURL: 'http://localhost:4197/', browserName: 'webkit', hasTouch: true, screenshot: 'only-on-failure' },
  webServer: { command: 'npm run preview -- --port 4197 --strictPort', url: 'http://localhost:4197/', reuseExistingServer: !process.env.CI },
})

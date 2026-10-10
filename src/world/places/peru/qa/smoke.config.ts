import { defineConfig } from '@playwright/test'
import base from '../../../../../playwright.config'
// Isolated preview port avoids testing a different worktree's existing server.
export default defineConfig({ ...base, testDir: '../../../../../tests', use: { ...base.use, baseURL: 'http://localhost:4187/' }, webServer: { command: 'npm run preview -- --port 4187 --strictPort', url: 'http://localhost:4187/', reuseExistingServer: !process.env.CI } })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import posthog from '@posthog/rollup-plugin'
import { offline } from './scripts/vite-offline'
import { plans } from './scripts/vite-plans'
import { lockPlace } from './scripts/vite-lock'

// BASE_PATH is set by the deploy workflows:
//   main:     /Kaylee-Gamepack/
//   previews: /Kaylee-Gamepack/pr-preview/pr-<n>/
// Only the main deploy sets POSTHOG_API_KEY and POSTHOG_PROJECT_ID: the build then uploads source
// maps to PostHog error tracking (and deletes them, so they aren't published) and tags exceptions
// with the commit.
// LOCK_CODE (the THAILAND_CODE secret) locks Thailand behind the family code: see scripts/vite-lock.ts.
const { POSTHOG_API_KEY, POSTHOG_PROJECT_ID, VITE_POSTHOG_HOST, GITHUB_SHA } = process.env

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    react(),
    plans(), // dist/planning/: the plan pages, readable on the iPad (scripts/vite-plans.ts)
    offline(), // dist/sw.js: plays offline on the iPad (src/offline/sw.js)
    !!(POSTHOG_API_KEY && POSTHOG_PROJECT_ID) &&
      posthog({
        personalApiKey: POSTHOG_API_KEY!,
        projectId: POSTHOG_PROJECT_ID,
        host: VITE_POSTHOG_HOST,
        sourcemaps: {
          releaseName: 'kaylee-gamepack-web',
          releaseVersion: GITHUB_SHA,
          deleteAfterUpload: true,
        },
      }),
    // Last, so it encrypts the finished files: with LOCK_CODE set, Thailand's code needs the family code to load
    // (its 3D house is the family's real home). Unset (dev, tests) nothing is locked. scripts/vite-lock.ts
    lockPlace('thailand'),
  ],
  // The nested Electron renderer has its own Vite process. Do not scan it as a game entry or reload play when it builds.
  optimizeDeps: { entries: ['index.html'] },
  server: { host: true, watch: { ignored: ['**/workbench/index.html', '**/workbench/dist/**', '**/workbench/dist-electron/**', '**/workbench/release/**'] } },
  preview: { host: true },
})

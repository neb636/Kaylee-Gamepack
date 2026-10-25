import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import posthog from '@posthog/rollup-plugin'
import { offline } from './scripts/vite-offline'
import { plans } from './scripts/vite-plans'

// BASE_PATH is set by the deploy workflows:
//   main:     /Kaylee-Gamepack/
//   previews: /Kaylee-Gamepack/pr-preview/pr-<n>/
// Only the main deploy sets POSTHOG_API_KEY and POSTHOG_PROJECT_ID: the build then uploads source
// maps to PostHog error tracking (and deletes them, so they aren't published) and tags exceptions
// with the commit.
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
  ],
  server: { host: true },
  preview: { host: true },
})

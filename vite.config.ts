import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import posthog from '@posthog/rollup-plugin'
import { offline } from './scripts/vite-offline'
import { docs } from './scripts/vite-docs'

// BASE_PATH is set by the deploy workflows:
//   main:     /Kaylee-Gamepack/
//   previews: /Kaylee-Gamepack/pr-preview/pr-<n>/
// Only the main deploy sets POSTHOG_API_KEY and POSTHOG_PROJECT_ID: the build then uploads source
// maps to PostHog error tracking (and deletes them, so they aren't published) and tags exceptions
// with the commit.
const here = fileURLToPath(new URL('.', import.meta.url))
const { POSTHOG_API_KEY, POSTHOG_PROJECT_ID, VITE_POSTHOG_HOST, GITHUB_SHA } = process.env

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    react(),
    docs(), // dist/docs/: the gameplay reference report and its local images
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
  optimizeDeps: { entries: ['index.html'] },
  // Folders the game never imports aren't watched: QA screenshots, review media and art originals would otherwise keep
  // the dev server busy.
  server: { host: true, watch: { ignored: ['art', 'qa-output', 'review', 'app-styling-inspiration-images', 'tests', 'playwright-report']
    .map((folder) => `${here}${folder}/**`) } },
  preview: { host: true },
})

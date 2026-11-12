// After a deploy the old hashed chunks are deleted, so a tab opened before it 404s on its next lazy import and the
// screen goes pink. Reload once to pick up the new build (at most once per 30 s, so a real outage can't loop).
import posthog from './posthog'

const KEY = 'chunk-reload-at'

export function isChunkError(error: unknown): boolean {
  const msg = String((error as Error | undefined)?.message ?? error)
  return /dynamically imported module|importing a module script failed|error loading dynamically imported/i.test(msg)
}

/** Reloads to fetch the new build. Returns false when it already did a moment ago (or can't), so callers show a card. */
export function reloadForNewBuild(): boolean {
  try {
    const last = Number(sessionStorage.getItem(KEY) ?? 0)
    if (Date.now() - last < 30_000) return false
    sessionStorage.setItem(KEY, String(Date.now()))
  } catch {
    return false
  }
  posthog.capture('chunk_reload')
  location.reload()
  return true
}

window.addEventListener('vite:preloadError', (event) => {
  if (reloadForNewBuild()) event.preventDefault()
})

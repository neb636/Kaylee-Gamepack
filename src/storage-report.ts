// How much room the app has on the device (her iPad often runs out of space). Once a day: what the app uses, its
// quota, whether iOS agreed not to clear it (persist), whether it runs as the Home Screen app, and whether a whole copy
// of the game is saved for offline play. A web page can't see the iPad's free space: the quota is worked out from the
// disk's total size. The real "out of space" signal is `offline_save_failed` (src/offline/register.ts), sent when the
// offline worker can't save a new build.
const DAY_KEY = 'gamepack.storage-day'

const mb = (bytes: number | undefined) => (bytes == null ? null : Math.round(bytes / 1e5) / 10)

export async function reportStorage(capture: (event: string, props: Record<string, unknown>) => void) {
  const today = new Date().toISOString().slice(0, 10)
  try {
    if (localStorage.getItem(DAY_KEY) === today) return
    localStorage.setItem(DAY_KEY, today)
  } catch {
    return
  }
  const storage = navigator.storage
  const estimate = await storage?.estimate?.().catch(() => undefined)
  const persisted = await storage?.persisted?.().catch(() => undefined)
  let offlineReady: boolean | null = null
  let caches_: number | null = null
  if ('caches' in window) {
    const marker = new URL(`${import.meta.env.BASE_URL}.offline-complete`, location.origin).href
    offlineReady = !!(await caches.match(marker).catch(() => undefined))
    caches_ = (await caches.keys().catch(() => [])).length
  }
  capture('app_storage', {
    usage_mb: mb(estimate?.usage),
    quota_mb: mb(estimate?.quota),
    persisted: persisted ?? null,
    standalone: matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true,
    offline_ready: offlineReady,
    cache_count: caches_,
  })
}

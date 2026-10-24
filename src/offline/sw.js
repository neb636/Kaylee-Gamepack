// Offline copies for the iPad. Not bundled: scripts/vite-offline.ts fills in PRECACHE and CACHE and writes it to
// dist/sw.js. Network first, always: online she gets the latest deploy, and the copies here are only used when the
// network fails or doesn't answer in a few seconds. Never switch this to cache-first.

const PRECACHE = __PRECACHE__ // every built file, relative to the app's folder
const CACHE = __CACHE__ // one cache per deploy folder (main, each PR preview): they share the origin
const TIMEOUT_MS = 4000

const scope = self.registration.scope
const INDEX = new URL('index.html', scope).href
const WANTED = new Set(PRECACHE.map((p) => new URL(p, scope).href))

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

// The page asks for this on every online launch. Downloads only what's missing (hashed names, so a new deploy
// fetches just the changed files) and drops files the current build no longer has. Safe to interrupt: the next
// launch carries on.
self.addEventListener('message', (event) => {
  if (event.data === 'fill') event.waitUntil(fill())
})

let filling = null
function fill() {
  filling ??= (async () => {
    // Each PR preview saves its own full copy: keep only the one in use, so old previews don't fill the iPad.
    for (const name of await caches.keys()) if (name !== CACHE && name.includes('/pr-preview/')) await caches.delete(name)
    const cache = await caches.open(CACHE)
    const have = new Set((await cache.keys()).map((r) => r.url))
    await Promise.all([...have].filter((url) => !WANTED.has(url)).map((url) => cache.delete(url)))
    const missing = [...WANTED].filter((url) => !have.has(url))
    const next = async () => {
      for (let url; (url = missing.pop()); ) {
        try {
          const res = await fetch(url, { cache: 'no-cache' })
          if (res.ok) await cache.put(url, res)
        } catch {
          return // offline again: stop, the next launch tries again
        }
      }
    }
    await Promise.all(Array.from({ length: 6 }, next))
  })().finally(() => (filling = null))
  return filling
}

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET' || req.headers.has('range')) return
  const url = req.url.split('#')[0]
  // Main's folder contains the PR previews' folders: leave those to their own worker.
  if (!url.startsWith(scope) || url.startsWith(scope + 'pr-preview/')) return
  if (req.mode === 'navigate') event.respondWith(networkFirst(event, fetch(url, { cache: 'no-cache' }), INDEX))
  else if (WANTED.has(url)) event.respondWith(networkFirst(event, fetch(req), url))
})

async function networkFirst(event, network, key) {
  const cache = await caches.open(CACHE)
  const saved = network.then((res) => {
    if (res.ok) event.waitUntil(cache.put(key, res.clone()))
    return res
  })
  saved.catch(() => {})
  const slow = new Promise((resolve) => setTimeout(resolve, TIMEOUT_MS)).then(async () => (await cache.match(key)) ?? saved)
  try {
    return await Promise.race([saved, slow])
  } catch {
    return (await cache.match(key)) ?? Response.error()
  }
}

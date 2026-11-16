// Offline copies for the iPad. Not bundled: scripts/vite-offline.ts fills in the __NAMES__ below and writes it to
// dist/sw.js. Network first, always: online she gets the latest deploy, and the copies here are only used when the
// network fails or doesn't answer in a few seconds. Never switch this to cache-first.
//
// Every build saves into its own cache, and a build's cache is used only as a whole: a new deploy downloads into a
// fresh cache while the last complete one keeps answering offline, and the old one is dropped only once the new one
// has every file. So a download cut short (she leaves the wifi halfway) can never leave a new index.html pointing at
// chunks that were never saved, or an old index.html whose chunks were already deleted.

const PRECACHE = __PRECACHE__ // every built file, relative to the app's folder
const FOLDER = __FOLDER__ // this deploy folder (main, each PR preview): they share the origin
const BUILD = __BUILD__ // this build's id (its files and its index.html)
const INDEX_SHA256 = __INDEX_SHA256__ // the index.html this build was made with
const TIMEOUT_MS = 4000

const CACHE = `${FOLDER}#${BUILD}`
const scope = self.registration.scope
const INDEX = new URL('index.html', scope).href
const WANTED = new Set(PRECACHE.map((p) => new URL(p, scope).href))
// Put in a cache once it holds every file of its build.
const COMPLETE = new URL('.offline-complete', scope).href

/** Vite's content-hashed files never change under the same name, so any build's copy of one is this build's too. */
const hashed = (url) => url.startsWith(scope + 'assets/') && /-[A-Za-z0-9_-]{8}\.[a-z0-9]+$/.test(url)

/** This folder's caches: one per build, plus the single unversioned cache older workers kept. */
const ours = (name) => name === FOLDER || name.startsWith(`${FOLDER}#`)

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

// The page asks for this on every online launch. Downloads only what's missing (copying unchanged files from the last
// build's cache) and is safe to interrupt: the next launch carries on, and until then the last complete copy stays.
self.addEventListener('message', (event) => {
  if (event.data === 'fill') event.waitUntil(fill())
})

let filling = null
function fill() {
  filling ??= fillOnce().finally(() => (filling = null))
  return filling
}

async function fillOnce() {
  const names = await caches.keys()
  // Each PR preview saves its own full copy: keep only the one in use, so old previews don't fill the iPad.
  for (const name of names) if (!ours(name) && name.includes('/pr-preview/')) await caches.delete(name)
  const cache = await caches.open(CACHE)
  if (!(await cache.match(COMPLETE))) {
    const older = await Promise.all(names.filter((n) => ours(n) && n !== CACHE).map((n) => caches.open(n)))
    const have = new Set((await cache.keys()).map((r) => r.url))
    const missing = [...WANTED].filter((url) => !have.has(url))
    // index.html first: if the server already has a newer deploy, this worker's files are gone from it. Stop and leave
    // the saving to the newer worker, which the browser installs on this same launch.
    if (missing.includes(INDEX)) {
      const res = await fetch(INDEX, { cache: 'no-cache' }).catch(() => null)
      if (!res?.ok || (await sha256(await res.clone().arrayBuffer())) !== INDEX_SHA256) return
      await cache.put(INDEX, res)
      missing.splice(missing.indexOf(INDEX), 1)
    }
    let offline = false
    const next = async () => {
      for (let url; !offline && (url = missing.pop()); ) {
        if (hashed(url)) {
          const copy = await matchIn(older, url)
          if (copy) {
            await cache.put(url, copy)
            continue
          }
        }
        try {
          const res = await fetch(url, { cache: 'no-cache' })
          if (res.ok) await cache.put(url, res)
        } catch {
          offline = true // offline again: stop, the next launch tries again
        }
      }
    }
    await Promise.all(Array.from({ length: 6 }, next))
    const saved = new Set((await cache.keys()).map((r) => r.url))
    if (![...WANTED].every((url) => saved.has(url))) return
    await cache.put(COMPLETE, new Response(String(Date.now())))
  }
  // This build is whole: the older copies of this folder can go.
  for (const name of await caches.keys()) if (ours(name) && name !== CACHE) await caches.delete(name)
}

async function sha256(buffer) {
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function matchIn(list, url) {
  for (const cache of list) {
    const hit = await cache.match(url)
    if (hit) return hit
  }
  return undefined
}

/** The saved copy of `url`: from a complete build first (this one, else the last one), so index.html and its chunks
 *  come from the same build; a half-filled cache only when nothing complete has it. */
async function saved(url) {
  const names = (await caches.keys()).filter(ours)
  const all = await Promise.all(names.map(async (name) => {
    const cache = await caches.open(name)
    return { name, cache, complete: !!(await cache.match(COMPLETE)) }
  }))
  const rank = (c) => (c.complete ? 0 : 2) + (c.name === CACHE ? 0 : 1)
  all.sort((a, b) => rank(a) - rank(b))
  return matchIn(all.map((c) => c.cache), url)
}

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET' || req.headers.has('range')) return
  const url = req.url.split('#')[0]
  // Main's folder contains the PR previews' folders: leave those to their own worker. Plans and documentation are
  // for reading online: never answer them with the app, and never save them over it.
  if (!url.startsWith(scope) || url.startsWith(scope + 'pr-preview/') || url.startsWith(scope + 'review/') || url.startsWith(scope + 'docs/')) return
  if (req.mode === 'navigate') event.respondWith(networkFirst(event, fetch(url, { cache: 'no-cache' }), INDEX))
  // A hashed file this build doesn't list is still answered from the saved copies: offline, an older complete build's
  // index.html (see saved()) asks for its own chunks.
  else if (WANTED.has(url) || hashed(url)) event.respondWith(networkFirst(event, fetch(req), url))
})

async function networkFirst(event, network, key) {
  let answered = false
  const fromNetwork = network.then(async (res) => {
    if (res.ok) {
      answered = true
      // Only a hashed file is saved on the way past: it is the same in every build. index.html and the other unhashed
      // files are saved by fill() alone, which checks they belong to this build (the server may already have a newer
      // deploy than this worker).
      if (hashed(key) && WANTED.has(key)) {
        const copy = res.clone()
        event.waitUntil(caches.open(CACHE).then((cache) => cache.put(key, copy)))
      }
      return res
    }
    // A server error (503 during a deploy, a 404 for a chunk) answers fetch() without rejecting: prefer the saved
    // copy, exactly as when the network fails, and pass the error through only when there's nothing saved.
    return (await saved(key)) ?? res
  })
  fromNetwork.catch(() => {})
  const slow = new Promise((resolve) => setTimeout(resolve, TIMEOUT_MS)).then(async () => (answered ? fromNetwork : (await saved(key)) ?? fromNetwork))
  try {
    return await Promise.race([fromNetwork, slow])
  } catch {
    return (await saved(key)) ?? Response.error()
  }
}

// Offline copies for the iPad. Not bundled: scripts/vite-offline.ts fills in the __NAMES__ below and writes it to
// dist/sw.js. index.html is network first, always: online she gets the latest deploy, and its saved copy is only used
// when the network fails or doesn't answer in a few seconds. Never switch index.html to cache-first. Content-hashed
// files (assets/<name>-<hash>.<ext>) never change under the same name, so this build's saved copy of one answers
// first: on a slow or dying connection she plays from the iPad instead of waiting on the network.
//
// Every build saves into its own cache, and a build's cache is used only as a whole: a new deploy downloads into a
// fresh cache while the last complete one keeps answering offline, and the old one is dropped only once the new one
// has every file. So a download cut short (she leaves the wifi halfway) can never leave a new index.html pointing at
// chunks that were never saved, or an old index.html whose chunks were already deleted.
//
// A copy is saved only when it is whole: this build's file, at its exact size, not redirected. Hotel and airport wifi
// answer every request with their login page and a 200 until you sign in, and a dropped connection can end a download
// early; neither may ever be saved as the game (or mark a build complete and delete the last good copy).

const FILES = __FILES__ // every built file (relative to the app's folder) and its size in bytes
const FOLDER = __FOLDER__ // this deploy folder (main, each PR preview): they share the origin
const BUILD = __BUILD__ // this build's id (its files and its index.html)
const INDEX_SHA256 = __INDEX_SHA256__ // the index.html this build was made with
const APP_MARK = __APP_MARK__ // in every deploy's index.html: a page without it (a wifi login page) isn't the app
// Per request, not a limit on downloading the app: fill() has no deadline, and a file with no saved copy keeps waiting
// on the network. index.html must arrive whole (it is small) within it, or the saved one answers.
const TIMEOUT_MS = 4000

const CACHE = `${FOLDER}#${BUILD}`
const scope = self.registration.scope
const INDEX = new URL('index.html', scope).href
const SIZE = new Map(Object.entries(FILES).map(([path, bytes]) => [new URL(path, scope).href, bytes]))
const WANTED = new Set(SIZE.keys())
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
      const copy = await whole(INDEX, res)
      if (!copy || (await sha256(await copy.clone().arrayBuffer())) !== INDEX_SHA256) return
      try {
        await cache.put(INDEX, copy)
      } catch (error) {
        return saveFailed(error)
      }
      missing.splice(missing.indexOf(INDEX), 1)
    }
    let stop = false
    const next = async () => {
      for (let url; !stop && (url = missing.pop()); ) {
        if (hashed(url)) {
          const copy = await matchIn(older, url)
          if (copy && (await save(cache, url, copy))) continue
        }
        try {
          const res = await fetch(url, { cache: 'no-cache' })
          // A 200 that isn't the file (a wifi login page, a download cut short): stop, the next launch tries again.
          if (res.ok && !(await save(cache, url, res))) stop = true
        } catch {
          stop = true // offline again: stop, the next launch tries again
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

/** `res` as a copy worth saving, or null: this build's file `url`, all of it (see the top). */
async function whole(url, res) {
  if (!res || !usable(url, res)) return null
  const body = await res.arrayBuffer().catch(() => null) // a connection that drops mid-download rejects here
  if (!body || body.byteLength !== SIZE.get(url)) return null
  // The bytes are already decoded: the network's length and encoding no longer describe them.
  const headers = new Headers(res.headers)
  headers.delete('content-length')
  headers.delete('content-encoding')
  return new Response(body, { status: res.status, statusText: res.statusText, headers })
}

/** Saves `res` as `url` in `cache` if it is whole. Returns whether it did. */
async function save(cache, url, res) {
  const copy = await whole(url, res)
  if (!copy) return false
  try {
    await cache.put(url, copy)
  } catch (error) {
    await saveFailed(error) // the iPad is out of room (QuotaExceededError): this fill stops, the last copy keeps working
    return false
  }
  return true
}

/** Tells the open app that a copy couldn't be saved, so it reaches the play data (src/offline/register.ts). */
async function saveFailed(error) {
  const estimate = await self.navigator.storage?.estimate?.().catch(() => undefined)
  const mb = (bytes) => (bytes == null ? null : Math.round(bytes / 1e5) / 10)
  const message = { type: 'offline-save-failed', error: error?.name ?? String(error), build: BUILD, usage_mb: mb(estimate?.usage), quota_mb: mb(estimate?.quota) }
  for (const client of await self.clients.matchAll({ includeUncontrolled: true })) client.postMessage(message)
}

/** An answer to use or save: a wifi login page is a 200 too, but it's HTML where a script, model or sound should be.
 *  (A page of the same length as a file still can't pass as it.) */
const usable = (key, res) => res.ok && !res.redirected && (key.endsWith('.html') || !/text\/html/i.test(res.headers.get('content-type') ?? ''))

/** Whether a navigation's answer is the app (this deploy's or a newer one), read to the end: a wifi login page isn't,
 *  and a page that stalls or drops halfway never answers. It is a few KB. */
const appPage = async (res) => usable(INDEX, res) && (await res.clone().text()).includes(APP_MARK)

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
 *  come from the same build; then the unversioned cache an older worker filled (a whole app as far as it knows); a
 *  half-filled cache only when none of those has it. */
async function saved(url) {
  const names = (await caches.keys()).filter(ours)
  const all = await Promise.all(names.map(async (name) => {
    const cache = await caches.open(name)
    return { name, cache, complete: !!(await cache.match(COMPLETE)) }
  }))
  const rank = (c) => (c.complete ? (c.name === CACHE ? 0 : 1) : c.name === FOLDER ? 2 : c.name === CACHE ? 3 : 4)
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
  else if (WANTED.has(url) && hashed(url)) event.respondWith(fromThisBuild(url).then((copy) => copy ?? networkFirst(event, fetch(req), url)))
  else if (WANTED.has(url) || hashed(url)) event.respondWith(networkFirst(event, fetch(req), url))
})

/** This build's saved copy of `url`. Only save() writes this build's files, so a copy here is whole. */
async function fromThisBuild(url) {
  return (await caches.open(CACHE)).match(url)
}

async function networkFirst(event, network, key) {
  let answered = false
  const fromNetwork = network.then(async (res) => {
    if (key === INDEX ? await appPage(res) : usable(key, res)) {
      answered = true
      // Only a hashed file is saved on the way past: it is the same in every build. index.html and the other unhashed
      // files are saved by fill() alone, which checks they belong to this build (the server may already have a newer
      // deploy than this worker).
      if (hashed(key) && WANTED.has(key)) {
        const copy = res.clone()
        event.waitUntil(caches.open(CACHE).then((cache) => save(cache, key, copy)))
      }
      return res
    }
    // A server error (503 during a deploy, a 404 for a chunk) or a wifi login page answers fetch() without rejecting:
    // prefer the saved copy, exactly as when the network fails, and pass the answer through only when there's nothing
    // saved.
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

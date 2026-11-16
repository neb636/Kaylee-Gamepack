import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { expect, test } from '@playwright/test'
import { APP_MARK } from '../scripts/vite-offline'

// Run the real offline worker without a browser: this is the offline cache contract, independent of rendering or
// gameplay gestures. CacheStorage is faked in memory; `fetch` is whatever the test's "server" answers.

class FakeCache {
  readonly entries = new Map<string, Response>()
  async put(key: string | Request, response: Response) {
    this.entries.set(typeof key === 'string' ? key : key.url, response.clone())
  }
  async match(key: string | Request) {
    return this.entries.get(typeof key === 'string' ? key : key.url)?.clone()
  }
  async keys() {
    return [...this.entries.keys()].map((url) => ({ url }))
  }
  async text(key: string) {
    return (await this.match(key))?.text()
  }
}

class FakeCaches {
  readonly store = new Map<string, FakeCache>()
  async open(name: string) {
    if (!this.store.has(name)) this.store.set(name, new FakeCache())
    return this.store.get(name)!
  }
  async keys() {
    return [...this.store.keys()]
  }
  async delete(name: string) {
    return this.store.delete(name)
  }
}

type Server = (url: string) => Promise<Response>

const sha256 = (text: string) => createHash('sha256').update(text).digest('hex')

/** An index.html as a deploy writes it: with the mark that tells the app from a wifi login page. */
const app = (body: string) => `${APP_MARK}${body}`

/** One build of the app's worker, as scripts/vite-offline.ts would write it. `files` is what that build wrote: each
 *  path and its body (the worker gets their sizes; the server may have different files by now). */
function worker(o: { folder: string; files: Record<string, string>; build: string; caches: FakeCaches; server: Server }) {
  const sizes = Object.fromEntries(Object.entries(o.files).map(([path, body]) => [path, new TextEncoder().encode(body).byteLength]))
  const scope = `https://example.test${o.folder}`
  const handlers = new Map<string, (event: unknown) => void>()
  const requests: string[] = []
  const timers: (() => void)[] = []
  const source = readFileSync('src/offline/sw.js', 'utf8')
    .replace('__FILES__', JSON.stringify(sizes))
    .replace('__FOLDER__', JSON.stringify(`gamepack:${o.folder}`))
    .replace('__BUILD__', JSON.stringify(o.build))
    .replace('__INDEX_SHA256__', JSON.stringify(sha256(o.files['index.html'] ?? '')))
    .replace('__APP_MARK__', JSON.stringify(APP_MARK))
  runInNewContext(source, {
    self: { registration: { scope }, addEventListener: (name: string, handler: (event: unknown) => void) => handlers.set(name, handler) },
    URL, Response, Headers, crypto: globalThis.crypto, caches: o.caches,
    fetch: (url: string | { url: string }) => {
      const href = typeof url === 'string' ? url : url.url
      requests.push(href)
      return o.server(href)
    },
    // The worker's 4 s wait passes only when a test calls elapse().
    setTimeout: (fn: () => void) => timers.push(fn),
  })
  const at = (path: string) => new URL(path, scope).href
  return {
    scope,
    at,
    requests,
    /** The worker's 4 s wait for the network is over. */
    elapse: () => timers.splice(0).forEach((fn) => fn()),
    cache: () => o.caches.open(`gamepack:${o.folder}#${o.build}`),
    async fill() {
      const pending: Promise<unknown>[] = []
      handlers.get('message')!({ data: 'fill', waitUntil: (p: Promise<unknown>) => pending.push(p) })
      await Promise.all(pending)
    },
    async request(path: string, mode = 'navigate') {
      const pending: Promise<unknown>[] = []
      let response: Promise<Response> | undefined
      handlers.get('fetch')!({
        request: { method: 'GET', url: at(path), headers: new Headers(), mode },
        respondWith(value: Promise<Response>) { response = value },
        waitUntil(value: Promise<unknown>) { pending.push(value) },
      })
      const result = response ? await response : undefined
      await Promise.all(pending)
      return result
    },
  }
}

/** A static site: path → body. Missing paths are 404s; `online = false` makes every request fail. */
function site(scope: string, files: Record<string, string>) {
  const s = {
    online: true,
    files,
    failAfter: Infinity,
    server: async (url: string) => {
      if (!s.online || s.failAfter-- <= 0) throw new Error('offline')
      const path = url.startsWith(scope) ? url.slice(scope.length) : url
      const body = s.files[path === '' ? 'index.html' : path]
      return body === undefined ? new Response('missing', { status: 404 }) : new Response(body)
    },
  }
  return s
}

for (const folder of ['/Kaylee-Gamepack/', '/Kaylee-Gamepack/pr-preview/pr-298/']) {
  test(`documentation cannot replace the offline app entry point (${folder})`, async () => {
    const scope = `https://example.test${folder}`
    const host = site(scope, { 'index.html': 'GAME', 'docs/gameplay-reference-report.html': 'REPORT' })
    const caches = new FakeCaches()
    const sw = worker({ folder, files: { 'index.html': 'GAME' }, build: 'a', caches, server: host.server })
    await sw.fill()
    const cache = await sw.cache()
    expect(await cache.text(sw.at('index.html'))).toBe('GAME')

    // Online app navigations stay network-first even with a saved copy, and never overwrite it.
    host.files['index.html'] = app('NEWER GAME')
    expect(await (await sw.request(''))?.text()).toBe(app('NEWER GAME'))
    expect(await cache.text(sw.at('index.html'))).toBe('GAME')
    const beforeDocs = sw.requests.length
    for (const path of ['docs/gameplay-reference-report.html', 'docs/gameplay-reference-report.html?view=all', 'docs/gameplay-reference-assets/canoe.webp', 'review/index.html', 'pr-preview/pr-999/']) {
      expect(await sw.request(path, path.endsWith('.webp') ? 'cors' : 'navigate')).toBeUndefined()
    }
    expect(sw.requests).toHaveLength(beforeDocs)
    expect(await cache.text(sw.at('index.html'))).toBe('GAME')

    host.online = false
    expect(await (await sw.request(''))?.text()).toBe('GAME')
    expect(await sw.request('docs/gameplay-reference-report.html')).toBeUndefined()
  })
}

test('a server error answers with the saved copy instead of the error', async () => {
  const folder = '/Kaylee-Gamepack/'
  const scope = `https://example.test${folder}`
  const host = site(scope, { 'index.html': 'GAME', 'assets/reef-abc12345.js': 'CHUNK' })
  const built = { 'index.html': 'GAME', 'assets/reef-abc12345.js': 'CHUNK', 'assets/new-def45678.js': 'NEW' }
  const caches = new FakeCaches()
  const sw = worker({ folder, files: built, build: 'a', caches, server: host.server })
  await sw.fill() // new-def45678.js 404s: the build stays incomplete, but what it saved still answers

  const server = (status: number) => (host.server = async () => new Response(status === 200 ? app('FRESH') : 'ERROR', { status }))
  const sw2 = worker({ folder, files: built, build: 'a', caches, server: (u) => host.server(u) })
  server(503)
  expect(await (await sw2.request('', 'navigate'))!.text()).toBe('GAME')
  server(404)
  expect(await (await sw2.request('assets/reef-abc12345.js', 'cors'))!.text()).toBe('CHUNK')
  // Nothing saved: the error goes through, and it never replaces a saved copy.
  expect((await sw2.request('assets/new-def45678.js', 'cors'))!.status).toBe(404)
  expect(await (await sw2.cache()).text(sw2.at('index.html'))).toBe('GAME')
  server(200)
  expect(await (await sw2.request('', 'navigate'))!.text()).toBe(app('FRESH'))
})

test('an update cut short keeps playing the last complete build offline', async () => {
  const folder = '/Kaylee-Gamepack/'
  const scope = `https://example.test${folder}`
  const caches = new FakeCaches()
  const oldFiles = { 'index.html': 'OLD GAME -> reef-aaaaaaaa.js', 'assets/reef-aaaaaaaa.js': 'OLD REEF', 'assets/shared-cccccccc.js': 'SHARED' }
  const host = site(scope, { ...oldFiles })
  const old = worker({ folder, files: oldFiles, build: 'old', caches, server: host.server })
  await old.fill()
  expect(await (await old.cache()).match(old.at('.offline-complete'))).toBeTruthy()

  // A deploy: new index.html, a changed chunk, an unchanged one. The old chunk is gone from the server.
  const newFiles = { 'index.html': 'NEW GAME -> reef-bbbbbbbb.js', 'assets/reef-bbbbbbbb.js': 'NEW REEF', 'assets/shared-cccccccc.js': 'SHARED', 'assets/big-dddddddd.webp': 'BIG' }
  host.files = { ...newFiles }
  const sw = worker({ folder, files: newFiles, build: 'new', caches, server: host.server })
  host.failAfter = 2 // index.html and one more file, then the wifi drops
  await sw.fill()
  const fresh = await sw.cache()
  expect(await fresh.match(sw.at('.offline-complete'))).toBeUndefined()
  // The unchanged hashed chunk came from the old build's cache, not the network.
  expect(await fresh.text(sw.at('assets/shared-cccccccc.js'))).toBe('SHARED')
  expect(sw.requests).not.toContain(sw.at('assets/shared-cccccccc.js'))
  expect(await caches.keys()).toContain('gamepack:/Kaylee-Gamepack/#old')

  // Offline: the old build answers as a whole, its index.html and the chunks it points at.
  host.online = false
  host.failAfter = Infinity
  expect(await (await sw.request(''))!.text()).toBe(oldFiles['index.html'])
  // The new worker is in charge by now: it still answers the old build's chunks from the old build's cache.
  expect(await (await sw.request('assets/reef-aaaaaaaa.js', 'cors'))!.text()).toBe('OLD REEF')
  expect(await (await sw.request('assets/shared-cccccccc.js', 'cors'))!.text()).toBe('SHARED')

  // Back online, the next launch finishes the new build and only then drops the old one.
  host.online = true
  await sw.fill()
  expect(await fresh.match(sw.at('.offline-complete'))).toBeTruthy()
  expect(await caches.keys()).toEqual(['gamepack:/Kaylee-Gamepack/#new'])
  host.online = false
  expect(await (await sw.request(''))!.text()).toBe(newFiles['index.html'])
  expect(await (await sw.request('assets/big-dddddddd.webp', 'cors'))!.text()).toBe('BIG')
})

test('a worker never saves a newer deploy\'s index.html as its own', async () => {
  const folder = '/Kaylee-Gamepack/'
  const scope = `https://example.test${folder}`
  const caches = new FakeCaches()
  const host = site(scope, { 'index.html': app('NEWER DEPLOY'), 'assets/reef-aaaaaaaa.js': 'REEF' })
  const sw = worker({ folder, files: { 'index.html': 'THIS BUILD', 'assets/reef-aaaaaaaa.js': 'REEF' }, build: 'a', caches, server: host.server })
  await sw.fill()
  const cache = await sw.cache()
  expect(await cache.match(sw.at('index.html'))).toBeUndefined()
  expect(await cache.match(sw.at('.offline-complete'))).toBeUndefined()
  // Online, she still gets what the server has.
  expect(await (await sw.request(''))!.text()).toBe(app('NEWER DEPLOY'))
  expect(await cache.match(sw.at('index.html'))).toBeUndefined()
})

test('the cache an older worker kept still answers until a new build is complete', async () => {
  const folder = '/Kaylee-Gamepack/'
  const scope = `https://example.test${folder}`
  const caches = new FakeCaches()
  const legacy = await caches.open('gamepack:/Kaylee-Gamepack/')
  await legacy.put(`${scope}index.html`, new Response('LEGACY GAME'))
  const main = await caches.open('gamepack:/Kaylee-Gamepack/#other')
  const preview = await caches.open('gamepack:/Kaylee-Gamepack/pr-preview/pr-1/#x')
  await main.put(`${scope}index.html`, new Response('x'))
  await preview.put(`${scope}pr-preview/pr-1/index.html`, new Response('x'))

  const host = site(scope, { 'index.html': 'GAME', 'assets/a-aaaaaaaa.js': 'A' })
  const sw = worker({ folder, files: { 'index.html': 'GAME', 'assets/a-aaaaaaaa.js': 'A' }, build: 'b', caches, server: host.server })
  host.online = false
  expect(await (await sw.request(''))!.text()).toBe('LEGACY GAME')
  host.online = true
  await sw.fill()
  // Its own folder's old copies are gone; another PR preview's is too (only the one in use stays on the iPad).
  expect((await caches.keys()).sort()).toEqual(['gamepack:/Kaylee-Gamepack/#b'])
})

test('a PR preview never deletes main\'s copies', async () => {
  const caches = new FakeCaches()
  const main = await caches.open('gamepack:/Kaylee-Gamepack/#m')
  await main.put('https://example.test/Kaylee-Gamepack/index.html', new Response('MAIN'))
  const folder = '/Kaylee-Gamepack/pr-preview/pr-7/'
  const scope = `https://example.test${folder}`
  const host = site(scope, { 'index.html': 'PREVIEW' })
  const sw = worker({ folder, files: { 'index.html': 'PREVIEW' }, build: 'p', caches, server: host.server })
  await sw.fill()
  expect((await caches.keys()).sort()).toEqual(['gamepack:/Kaylee-Gamepack/#m', 'gamepack:/Kaylee-Gamepack/pr-preview/pr-7/#p'])
})

test('the first update from an older worker keeps its copy until the new build is whole', async () => {
  const folder = '/Kaylee-Gamepack/'
  const scope = `https://example.test${folder}`
  const caches = new FakeCaches()
  const legacy = await caches.open('gamepack:/Kaylee-Gamepack/')
  await legacy.put(`${scope}index.html`, new Response('LEGACY -> old-aaaaaaaa.js'))
  await legacy.put(`${scope}assets/old-aaaaaaaa.js`, new Response('OLD CHUNK'))
  const host = site(scope, { 'index.html': 'NEW -> new-bbbbbbbb.js', 'assets/new-bbbbbbbb.js': 'NEW CHUNK' })
  const sw = worker({ folder, files: { 'index.html': 'NEW -> new-bbbbbbbb.js', 'assets/new-bbbbbbbb.js': 'NEW CHUNK' }, build: 'b', caches, server: host.server })
  host.failAfter = 1 // the new index.html is saved, then the wifi drops before its chunk
  await sw.fill()
  expect(await (await sw.cache()).text(sw.at('index.html'))).toBe('NEW -> new-bbbbbbbb.js')
  host.online = false
  host.failAfter = Infinity
  expect(await (await sw.request(''))!.text()).toBe('LEGACY -> old-aaaaaaaa.js')
  expect(await (await sw.request('assets/old-aaaaaaaa.js', 'cors'))!.text()).toBe('OLD CHUNK')
})

/** Hotel and airport wifi before you sign in: every request gets the login page, with a 200. */
const loginPage = async () => new Response('<html>Sign in to the hotel wifi</html>', { headers: { 'content-type': 'text/html; charset=utf-8' } })

test('a wifi login page is never saved as the game, and the last good copy stays', async () => {
  const folder = '/Kaylee-Gamepack/'
  const scope = `https://example.test${folder}`
  const caches = new FakeCaches()
  const oldFiles = { 'index.html': 'OLD GAME', 'assets/reef-aaaaaaaa.js': 'OLD REEF', 'assets/voice-vvvvvvvv.mp3': 'VOICE' }
  const host = site(scope, { ...oldFiles })
  await worker({ folder, files: oldFiles, build: 'old', caches, server: host.server }).fill()

  // A deploy. At home the new index.html is saved, then she closes the app before the rest comes down.
  const newFiles = { 'index.html': 'NEW GAME', 'assets/reef-bbbbbbbb.js': 'NEW REEF', 'assets/voice-vvvvvvvv.mp3': 'VOICE', 'assets/house-hhhhhhhh.glb': 'HOUSE' }
  host.files = { ...newFiles }
  host.failAfter = 1
  await worker({ folder, files: newFiles, build: 'new', caches, server: host.server }).fill()

  // The next launch is on hotel wifi: the rest of the build is never saved as the login page, and never marked whole.
  const hotel = worker({ folder, files: newFiles, build: 'new', caches, server: loginPage })
  await hotel.fill()
  const fresh = await hotel.cache()
  expect(await fresh.match(hotel.at('.offline-complete'))).toBeUndefined()
  for (const path of ['assets/reef-bbbbbbbb.js', 'assets/house-hhhhhhhh.glb']) expect(await fresh.match(hotel.at(path))).toBeUndefined()
  // The unchanged voice was copied from the old build; the old build is kept whole.
  expect(await fresh.text(hotel.at('assets/voice-vvvvvvvv.mp3'))).toBe('VOICE')
  expect(await caches.keys()).toContain('gamepack:/Kaylee-Gamepack/#old')
  // Playing on the hotel wifi doesn't save the login page either.
  await hotel.request('assets/house-hhhhhhhh.glb', 'cors')
  expect(await fresh.match(hotel.at('assets/house-hhhhhhhh.glb'))).toBeUndefined()

  // On the plane: the old build answers as a whole.
  const plane = worker({ folder, files: newFiles, build: 'new', caches, server: async () => { throw new Error('offline') } })
  expect(await (await plane.request(''))!.text()).toBe('OLD GAME')
  expect(await (await plane.request('assets/reef-aaaaaaaa.js', 'cors'))!.text()).toBe('OLD REEF')
})

test('a login page instead of a saved file plays the saved copy', async () => {
  const folder = '/Kaylee-Gamepack/'
  const scope = `https://example.test${folder}`
  const caches = new FakeCaches()
  const files = { 'index.html': 'GAME', 'manifest.webmanifest': '{}' }
  await worker({ folder, files, build: 'a', caches, server: site(scope, { ...files }).server }).fill()
  const hotel = worker({ folder, files, build: 'a', caches, server: loginPage })
  expect(await (await hotel.request('manifest.webmanifest', 'cors'))!.text()).toBe('{}')
})

test('a download cut short is never saved, and the next launch finishes it', async () => {
  const folder = '/Kaylee-Gamepack/'
  const scope = `https://example.test${folder}`
  const caches = new FakeCaches()
  const files = { 'index.html': 'GAME', 'assets/house-hhhhhhhh.glb': 'A BIG HOUSE MODEL' }
  const host = site(scope, { ...files, 'assets/house-hhhhhhhh.glb': 'A BIG HO' })
  const sw = worker({ folder, files, build: 'a', caches, server: host.server })
  await sw.fill()
  const cache = await sw.cache()
  expect(await cache.match(sw.at('assets/house-hhhhhhhh.glb'))).toBeUndefined()
  expect(await cache.match(sw.at('.offline-complete'))).toBeUndefined()
  host.files = { ...files }
  await sw.fill()
  expect(await cache.text(sw.at('assets/house-hhhhhhhh.glb'))).toBe('A BIG HOUSE MODEL')
  expect(await cache.match(sw.at('.offline-complete'))).toBeTruthy()
})

test('on a slow connection a saved hashed file answers at once, and index.html still asks the network', async () => {
  const folder = '/Kaylee-Gamepack/'
  const scope = `https://example.test${folder}`
  const caches = new FakeCaches()
  const files = { 'index.html': 'GAME', 'assets/voice-vvvvvvvv.mp3': 'VOICE' }
  const host = site(scope, { ...files })
  const sw = worker({ folder, files, build: 'a', caches, server: (url) => host.server(url) })
  await sw.fill()
  // The wifi is connected but nothing comes back (the test's timeout never fires, so waiting on it would hang).
  host.server = () => new Promise<Response>(() => {})
  const before = sw.requests.length
  expect(await (await sw.request('assets/voice-vvvvvvvv.mp3', 'cors'))!.text()).toBe('VOICE')
  expect(sw.requests).toHaveLength(before)
  // index.html is network first: the next deploy reaches her as soon as the network answers.
  host.server = async () => new Response(app('NEXT DEPLOY'))
  expect(await (await sw.request(''))!.text()).toBe(app('NEXT DEPLOY'))
})

test('a login page the same length as a file is still never saved as it', async () => {
  const folder = '/Kaylee-Gamepack/'
  const scope = `https://example.test${folder}`
  const caches = new FakeCaches()
  const oldFiles = { 'index.html': app('OLD GAME'), 'assets/reef-aaaaaaaa.js': 'OLD REEF' }
  const host = site(scope, { ...oldFiles })
  await worker({ folder, files: oldFiles, build: 'old', caches, server: host.server }).fill()
  const login = '<html>Sign in</html>'
  const newFiles = { 'index.html': app('NEW GAME'), 'assets/reef-bbbbbbbb.js': 'x'.repeat(login.length) }
  host.files = { ...newFiles }
  host.failAfter = 1 // the new index.html is saved, then she closes the app
  await worker({ folder, files: newFiles, build: 'new', caches, server: host.server }).fill()

  const hotel = worker({ folder, files: newFiles, build: 'new', caches, server: async () => new Response(login, { headers: { 'content-type': 'text/html' } }) })
  await hotel.fill()
  expect(await (await hotel.cache()).match(hotel.at('assets/reef-bbbbbbbb.js'))).toBeUndefined()
  expect(await (await hotel.cache()).match(hotel.at('.offline-complete'))).toBeUndefined()
  expect(await caches.keys()).toContain('gamepack:/Kaylee-Gamepack/#old')
})

test('hotel wifi when the app opens plays the saved app, not the login page', async () => {
  const folder = '/Kaylee-Gamepack/'
  const scope = `https://example.test${folder}`
  const caches = new FakeCaches()
  const files = { 'index.html': app('GAME') }
  await worker({ folder, files, build: 'a', caches, server: site(scope, { ...files }).server }).fill()
  const hotel = worker({ folder, files, build: 'a', caches, server: loginPage })
  expect(await (await hotel.request(''))!.text()).toBe(app('GAME'))
  // With nothing saved yet, the login page goes through: signing in is how the app gets online.
  const first = worker({ folder, files, build: 'a', caches: new FakeCaches(), server: loginPage })
  expect(await (await first.request(''))!.text()).toContain('Sign in')
})

/** Lets the worker's pending promises run. */
const tick = () => new Promise((resolve) => setImmediate(resolve))

test('a launch the network takes over 4 s to answer plays the saved app; with none saved, it keeps waiting', async () => {
  const folder = '/Kaylee-Gamepack/'
  const scope = `https://example.test${folder}`
  const caches = new FakeCaches()
  const files = { 'index.html': app('GAME') }
  await worker({ folder, files, build: 'a', caches, server: site(scope, { ...files }).server }).fill()

  const slow = worker({ folder, files, build: 'a', caches, server: () => new Promise<Response>(() => {}) })
  const answer = slow.request('')
  await tick()
  slow.elapse()
  expect(await (await answer)!.text()).toBe(app('GAME'))

  // The 4 s is a fallback, not a deadline: nothing saved, so the network's page is worth the wait.
  let arrive!: (res: Response) => void
  const first = worker({ folder, files, build: 'a', caches: new FakeCaches(), server: () => new Promise<Response>((resolve) => (arrive = resolve)) })
  const late = first.request('')
  await tick()
  first.elapse()
  await tick()
  arrive(new Response(app('GAME')))
  expect(await (await late)!.text()).toBe(app('GAME'))
})

test('a start page that stalls or drops halfway plays the saved app', async () => {
  const folder = '/Kaylee-Gamepack/'
  const scope = `https://example.test${folder}`
  const caches = new FakeCaches()
  const files = { 'index.html': app('GAME') }
  await worker({ folder, files, build: 'a', caches, server: site(scope, { ...files }).server }).fill()
  const half = new TextEncoder().encode('<!doctype html><html><he')

  // The headers come at once, then the rest never does.
  const stalled = worker({ folder, files, build: 'a', caches, server: async () => new Response(new ReadableStream({ start: (c) => c.enqueue(half) })) })
  const answer = stalled.request('')
  await tick()
  stalled.elapse()
  expect(await (await answer)!.text()).toBe(app('GAME'))

  // The connection drops partway through.
  const dropped = worker({
    folder, files, build: 'a', caches,
    server: async () => new Response(new ReadableStream({ start: (c) => { c.enqueue(half); c.error(new Error('reset')) } })),
  })
  expect(await (await dropped.request(''))!.text()).toBe(app('GAME'))
})

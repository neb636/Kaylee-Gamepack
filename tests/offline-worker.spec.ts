import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { expect, test } from '@playwright/test'

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

/** One build of the app's worker, as scripts/vite-offline.ts would write it. */
function worker(o: { folder: string; files: string[]; index: string; build: string; caches: FakeCaches; server: Server }) {
  const scope = `https://example.test${o.folder}`
  const handlers = new Map<string, (event: unknown) => void>()
  const requests: string[] = []
  const source = readFileSync('src/offline/sw.js', 'utf8')
    .replace('__PRECACHE__', JSON.stringify(o.files))
    .replace('__FOLDER__', JSON.stringify(`gamepack:${o.folder}`))
    .replace('__BUILD__', JSON.stringify(o.build))
    .replace('__INDEX_SHA256__', JSON.stringify(sha256(o.index)))
  runInNewContext(source, {
    self: { registration: { scope }, addEventListener: (name: string, handler: (event: unknown) => void) => handlers.set(name, handler) },
    URL, Response, crypto: globalThis.crypto, caches: o.caches,
    fetch: (url: string | { url: string }) => {
      const href = typeof url === 'string' ? url : url.url
      requests.push(href)
      return o.server(href)
    },
    // No real timeout is needed: the network resolves or rejects immediately.
    setTimeout: () => 0,
  })
  const at = (path: string) => new URL(path, scope).href
  return {
    scope,
    at,
    requests,
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
    const sw = worker({ folder, files: ['index.html'], index: 'GAME', build: 'a', caches, server: host.server })
    await sw.fill()
    const cache = await sw.cache()
    expect(await cache.text(sw.at('index.html'))).toBe('GAME')

    // Online app navigations stay network-first even with a saved copy, and never overwrite it.
    host.files['index.html'] = 'NEWER GAME'
    expect(await (await sw.request(''))?.text()).toBe('NEWER GAME')
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
  const caches = new FakeCaches()
  const sw = worker({ folder, files: ['index.html', 'assets/reef-abc12345.js', 'assets/new-def45678.js'], index: 'GAME', build: 'a', caches, server: host.server })
  await sw.fill() // new-def45678.js 404s: the build stays incomplete, but what it saved still answers

  const server = (status: number) => (host.server = async () => new Response(status === 200 ? 'FRESH' : 'ERROR', { status }))
  const sw2 = worker({ folder, files: ['index.html', 'assets/reef-abc12345.js', 'assets/new-def45678.js'], index: 'GAME', build: 'a', caches, server: (u) => host.server(u) })
  server(503)
  expect(await (await sw2.request('', 'navigate'))!.text()).toBe('GAME')
  server(404)
  expect(await (await sw2.request('assets/reef-abc12345.js', 'cors'))!.text()).toBe('CHUNK')
  // Nothing saved: the error goes through, and it never replaces a saved copy.
  expect((await sw2.request('assets/new-def45678.js', 'cors'))!.status).toBe(404)
  expect(await (await sw2.cache()).text(sw2.at('index.html'))).toBe('GAME')
  server(200)
  expect(await (await sw2.request('', 'navigate'))!.text()).toBe('FRESH')
})

test('an update cut short keeps playing the last complete build offline', async () => {
  const folder = '/Kaylee-Gamepack/'
  const scope = `https://example.test${folder}`
  const caches = new FakeCaches()
  const oldFiles = { 'index.html': 'OLD GAME -> reef-aaaaaaaa.js', 'assets/reef-aaaaaaaa.js': 'OLD REEF', 'assets/shared-cccccccc.js': 'SHARED' }
  const host = site(scope, { ...oldFiles })
  const old = worker({ folder, files: Object.keys(oldFiles), index: oldFiles['index.html'], build: 'old', caches, server: host.server })
  await old.fill()
  expect(await (await old.cache()).match(old.at('.offline-complete'))).toBeTruthy()

  // A deploy: new index.html, a changed chunk, an unchanged one. The old chunk is gone from the server.
  const newFiles = { 'index.html': 'NEW GAME -> reef-bbbbbbbb.js', 'assets/reef-bbbbbbbb.js': 'NEW REEF', 'assets/shared-cccccccc.js': 'SHARED', 'assets/big-dddddddd.webp': 'BIG' }
  host.files = { ...newFiles }
  const sw = worker({ folder, files: Object.keys(newFiles), index: newFiles['index.html'], build: 'new', caches, server: host.server })
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
  const host = site(scope, { 'index.html': 'NEWER DEPLOY', 'assets/reef-aaaaaaaa.js': 'REEF' })
  const sw = worker({ folder, files: ['index.html', 'assets/reef-aaaaaaaa.js'], index: 'THIS BUILD', build: 'a', caches, server: host.server })
  await sw.fill()
  const cache = await sw.cache()
  expect(await cache.match(sw.at('index.html'))).toBeUndefined()
  expect(await cache.match(sw.at('.offline-complete'))).toBeUndefined()
  // Online, she still gets what the server has.
  expect(await (await sw.request(''))!.text()).toBe('NEWER DEPLOY')
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
  const sw = worker({ folder, files: ['index.html', 'assets/a-aaaaaaaa.js'], index: 'GAME', build: 'b', caches, server: host.server })
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
  const sw = worker({ folder, files: ['index.html'], index: 'PREVIEW', build: 'p', caches, server: host.server })
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
  const sw = worker({ folder, files: ['index.html', 'assets/new-bbbbbbbb.js'], index: 'NEW -> new-bbbbbbbb.js', build: 'b', caches, server: host.server })
  host.failAfter = 1 // the new index.html is saved, then the wifi drops before its chunk
  await sw.fill()
  expect(await (await sw.cache()).text(sw.at('index.html'))).toBe('NEW -> new-bbbbbbbb.js')
  host.online = false
  host.failAfter = Infinity
  expect(await (await sw.request(''))!.text()).toBe('LEGACY -> old-aaaaaaaa.js')
  expect(await (await sw.request('assets/old-aaaaaaaa.js', 'cors'))!.text()).toBe('OLD CHUNK')
})

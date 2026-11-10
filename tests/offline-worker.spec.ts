import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { expect, test } from '@playwright/test'

// Run the real fetch handler without a browser: this is the offline cache
// contract, independent of rendering or gameplay gestures.
for (const folder of ['/Kaylee-Gamepack/', '/Kaylee-Gamepack/pr-preview/pr-298/']) {
  test(`documentation cannot replace the offline app entry point (${folder})`, async () => {
    const scope = `https://example.test${folder}`
    const index = new URL('index.html', scope).href
    const stored = new Map<string, Response>()
    const handlers = new Map<string, (event: unknown) => void>()
    const requests: string[] = []
    let online = true
    const cache = {
      async put(key: string, response: Response) { stored.set(key, response.clone()) },
      async match(key: string) { return stored.get(key)?.clone() },
    }
    const fetch = async (url: string) => {
      requests.push(url)
      if (!online) throw new Error('offline')
      return new Response(url.includes('/docs/') ? 'REPORT' : 'GAME')
    }
    const worker = readFileSync('src/offline/sw.js', 'utf8')
      .replace('__PRECACHE__', JSON.stringify(['index.html']))
      .replace('__CACHE__', JSON.stringify(`gamepack:${folder}`))
    runInNewContext(worker, {
      self: { registration: { scope }, addEventListener: (name: string, handler: (event: unknown) => void) => handlers.set(name, handler) },
      URL, Response, caches: { open: async () => cache }, fetch,
      // No real timeout is needed: network resolves or rejects immediately.
      setTimeout: () => 0,
    })
    async function request(path: string, mode = 'navigate') {
      const pending: Promise<unknown>[] = []
      let response: Promise<Response> | undefined
      handlers.get('fetch')!({
        request: { method: 'GET', url: new URL(path, scope).href, headers: new Headers(), mode },
        respondWith(value: Promise<Response>) { response = value },
        waitUntil(value: Promise<unknown>) { pending.push(value) },
      })
      const result = response ? await response : undefined
      await Promise.all(pending)
      return result
    }

    expect(await (await request('index.html'))?.text()).toBe('GAME')
    // Online app navigations remain network-first even with a saved response.
    stored.set(index, new Response('STALE GAME'))
    expect(await (await request(''))?.text()).toBe('GAME')
    expect(await (await cache.match(index))?.text()).toBe('GAME')
    const report = await request('docs/gameplay-reference-report.html')
    expect(await (await cache.match(index))?.text()).toBe('GAME')
    expect(report).toBeUndefined()
    const beforeDocs = requests.length
    for (const path of ['docs/gameplay-reference-report.html', 'docs/gameplay-reference-report.html?view=all', 'docs/gameplay-reference-assets/canoe.webp', 'review/index.html', 'pr-preview/pr-999/']) {
      expect(await request(path, path.endsWith('.webp') ? 'cors' : 'navigate')).toBeUndefined()
    }
    expect(requests).toHaveLength(beforeDocs)
    expect(await (await cache.match(index))?.text()).toBe('GAME')

    online = false
    expect(await (await request(''))?.text()).toBe('GAME')
    expect(await request('docs/gameplay-reference-report.html')).toBeUndefined()
    expect(await (await cache.match(index))?.text()).toBe('GAME')
  })
}

test('a server error answers with the saved copy instead of the error', async () => {
  const scope = 'https://example.test/Kaylee-Gamepack/'
  const index = new URL('index.html', scope).href
  const chunk = new URL('assets/reef-abc123.js', scope).href
  const stored = new Map<string, Response>([[index, new Response('GAME')], [chunk, new Response('CHUNK')]])
  const handlers = new Map<string, (event: unknown) => void>()
  let status = 200
  const cache = {
    async put(key: string, response: Response) { stored.set(key, response.clone()) },
    async match(key: string) { return stored.get(key)?.clone() },
  }
  const worker = readFileSync('src/offline/sw.js', 'utf8')
    .replace('__PRECACHE__', JSON.stringify(['index.html', 'assets/reef-abc123.js', 'assets/new-def456.js']))
    .replace('__CACHE__', JSON.stringify('gamepack:/Kaylee-Gamepack/'))
  runInNewContext(worker, {
    self: { registration: { scope }, addEventListener: (name: string, handler: (event: unknown) => void) => handlers.set(name, handler) },
    URL, Response, caches: { open: async () => cache },
    fetch: async () => new Response(status === 200 ? 'FRESH' : 'ERROR', { status }),
    setTimeout: () => 0,
  })
  async function request(path: string, mode: string) {
    let response: Promise<Response> | undefined
    const pending: Promise<unknown>[] = []
    handlers.get('fetch')!({
      request: { method: 'GET', url: new URL(path, scope).href, headers: new Headers(), mode },
      respondWith(value: Promise<Response>) { response = value },
      waitUntil(value: Promise<unknown>) { pending.push(value) },
    })
    const result = await response!
    await Promise.all(pending)
    return result
  }

  status = 503
  expect(await (await request('', 'navigate')).text()).toBe('GAME')
  status = 404
  expect(await (await request('assets/reef-abc123.js', 'cors')).text()).toBe('CHUNK')
  // Nothing saved: the error goes through, and it never replaces a saved copy.
  expect((await request('assets/new-def456.js', 'cors')).status).toBe(404)
  expect(await (await cache.match(index))!.text()).toBe('GAME')
  status = 200
  expect(await (await request('', 'navigate')).text()).toBe('FRESH')
})

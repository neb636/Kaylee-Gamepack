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
    for (const path of ['docs/gameplay-reference-report.html', 'docs/gameplay-reference-report.html?view=all', 'docs/gameplay-reference-assets/canoe.webp', 'planning/around-the-world/canada.html', 'pr-preview/pr-999/']) {
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

// Exercise the real SDK without sending QA data to PostHog: node scripts/qa-posthog.mjs
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import { assertCanLaunchBrowser } from './qa-lib.mjs'

const host = 'https://posthog.invalid'
process.env.VITE_POSTHOG_ENABLED = 'true'
process.env.VITE_POSTHOG_KEY = 'phc_local_qa_only'
process.env.VITE_POSTHOG_HOST = host

const html = `<html><body><button id="rage">Play</button><div id="root"></div>
<script type="module">
import React from 'react'
import { createRoot } from 'react-dom/client'
import posthog from '/src/posthog.ts'
import { outbox } from '/src/analytics-outbox.ts'
window.outbox = outbox
window.posthog = posthog
import { reactErrorHandlers } from '/src/react-errors.ts'
window.events = []
window.qaAutocaptureReady = () => posthog.autocapture?.isEnabled
posthog.on('eventCaptured', event => window.events.push(event))
window.crash = (caught) => {
  class Boundary extends React.Component {
    state = { failed: false }
    static getDerivedStateFromError() { return { failed: true } }
    render() { return this.state.failed ? 'Recovered' : this.props.children }
  }
  function Broken() { throw new Error(caught ? 'qa-react-caught' : 'qa-react-uncaught') }
  const root = createRoot(document.createElement('div'), reactErrorHandlers)
  root.render(caught ? React.createElement(Boundary, null, React.createElement(Broken)) : React.createElement(Broken))
}
window.recover = () => reactErrorHandlers.onRecoverableError(new Error('qa-react-recoverable'), { componentStack: 'QAComponent' })
window.qaReady = true
</script></body></html>`

const server = await createServer({
  logLevel: 'error',
  server: { host: '127.0.0.1', port: 0 },
  plugins: [{
    name: 'posthog-qa-page',
    configureServer(vite) {
      vite.middlewares.use('/__posthog-qa', async (_req, res) => {
        res.setHeader('Content-Type', 'text/html')
        res.end(await vite.transformIndexHtml('/__posthog-qa', html))
      })
    },
  }],
})
let browser
const batches = [] // what the offline outbox sent to /batch/
let batchAnswer = 500
try {
  await server.listen()
  assertCanLaunchBrowser()
  browser = await chromium.launch()
  const qaUrl = `http://127.0.0.1:${server.httpServer.address().port}/__posthog-qa`
  /** A fresh browser (its own storage) on the QA page. */
  async function open(query = '') {
    // Emulate a real browser: PostHog intentionally drops automated browser events.
    const context = await browser.newContext({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' })
    const page = await context.newPage()
    page.setDefaultTimeout(15_000)
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false })
      Object.defineProperty(navigator, 'userAgentData', { get: () => undefined })
    })
    // Serve the SDK's own extensions locally. All analytics requests terminate here.
    await page.route('https://posthog.invalid/**', async route => {
      const pathname = new URL(route.request().url()).pathname
      const extension = path.join('node_modules/posthog-js/dist', path.basename(pathname))
      if (pathname.startsWith('/static/') && pathname.endsWith('.js') && existsSync(extension)) {
        return route.fulfill({ contentType: 'application/javascript', body: readFileSync(extension, 'utf8') })
      }
      if (pathname.endsWith('.js')) {
        return route.fulfill({ contentType: 'application/javascript', body: '' })
      }
      if (pathname === '/batch/') {
        batches.push({ status: batchAnswer, body: route.request().postDataJSON() })
        return route.fulfill({ status: batchAnswer, json: { status: 1 }, headers: { 'access-control-allow-origin': '*' } })
      }
      await route.fulfill({ json: { autocapture_opt_out: false, featureFlags: {}, errorsWhileComputingFlags: false } })
    })
    // Fail closed if a future SDK change tries another PostHog domain.
    await page.route(/https:\/\/[^/]*posthog\.com\//, route => route.abort())
    await page.goto(qaUrl + query)
    await page.waitForFunction(() => window.qaReady && window.__PosthogExtensions__?.errorWrappingFunctions)
    return { context, page }
  }

  // 1. Errors, rage clicks and the storage report, as on her iPad.
  const { page, context } = await open()
  await page.evaluate(() => {
    setTimeout(() => { throw new Error('qa-unhandled') }, 0)
    Promise.reject(new Error('qa-rejection'))
    console.error(new Error('qa-console'))
    window.crash(true)
    window.crash(false)
    window.recover()
  })
  await page.waitForFunction(() => window.qaAutocaptureReady())
  await page.locator('#rage').click({ clickCount: 3, delay: 50 })
  const messages = ['qa-unhandled', 'qa-rejection', 'qa-console', 'qa-react-caught', 'qa-react-uncaught', 'qa-react-recoverable']
  await page.waitForFunction(expected => expected.every(message => window.events.some(event =>
    event.event === '$exception' && event.properties.$exception_list?.some(error => error.value === message),
  )) && window.events.some(event => event.event === '$rageclick') && window.events.some(event => event.event === 'app_storage'), messages).catch(async error => {
    console.log(JSON.stringify(await page.evaluate(() => window.events.map(e => e.event)), null, 2))
    throw error
  })
  const events = await page.evaluate(() => window.events)
  for (const message of messages) {
    const matching = events.filter(event => event.event === '$exception' && event.properties.$exception_list.some(error => error.value === message))
    assert.equal(matching.length, 1, `${message}: captured exactly once`)
    assert.ok(matching[0].properties.$exception_list[0].stacktrace.frames.length, `${message}: JS stack present`)
    if (message.startsWith('qa-react')) assert.ok(matching[0].properties.componentStack, `${message}: component stack present`)
    console.log(`PASS ${message}: one exception with stack`)
  }
  assert.ok(events.some(event => event.event === '$rageclick'))
  console.log('PASS $rageclick captured; no production data sent')
  const storage = events.find(event => event.event === 'app_storage').properties
  assert.equal(typeof storage.usage_mb, 'number', 'app_storage: usage_mb')
  assert.equal(typeof storage.quota_mb, 'number', 'app_storage: quota_mb')
  assert.equal(events.filter(event => event.event === 'app_storage').length, 1, 'app_storage: once')
  assert.ok(!events.some(event => event.properties.target_audience || event.properties.tester), 'an untagged browser is neither')
  console.log('PASS app_storage sent once with usage and quota')

  // 2. Offline: events wait in the outbox and go out, with their own uuids and times, once PostHog has them.
  await context.setOffline(true)
  const before = await page.evaluate(() => window.events.length)
  const offline = await page.evaluate(() => {
    for (const n of [1, 2, 3]) window.posthog.capture('world_section_entered', { place: 'qa', activity: 'offline', section: String(n) })
    return window.outbox().map(e => ({ uuid: e.uuid, timestamp: e.timestamp, event: e.event }))
  })
  assert.equal(offline.filter(e => e.event === 'world_section_entered').length, 3, 'offline: three events in the outbox')
  assert.equal(await page.evaluate(() => window.events.length), before, 'offline: nothing sent')
  console.log('PASS offline events wait in the outbox')
  batchAnswer = 500
  await context.setOffline(false)
  await page.waitForTimeout(500)
  assert.ok(batches.length >= 1 && batches.every(b => b.status === 500), 'a failed send was tried')
  assert.equal((await page.evaluate(() => window.outbox().length)) >= 3, true, 'a failed send keeps the outbox')
  console.log('PASS a failed send keeps them')
  batchAnswer = 200
  await page.evaluate(() => window.dispatchEvent(new Event('online')))
  await page.waitForFunction(() => window.outbox().length === 0)
  const sent = batches.filter(b => b.status === 200).flatMap(b => b.body.batch)
  for (const e of offline) {
    const match = sent.find(s => s.uuid === e.uuid)
    assert.ok(match, `outbox sent ${e.uuid}`)
    assert.equal(match.timestamp, e.timestamp, 'with its original time')
    assert.equal(match.properties.$replayed_offline, true, 'marked as replayed')
  }
  assert.equal(batches.find(b => b.status === 200).body.api_key, 'phc_local_qa_only')
  console.log('PASS back online, the outbox is sent and emptied')
  await context.close()

  // 3. A tester's browser sends errors only, and the tag survives the next launch.
  // Play saved offline before the tag follows the tester rule too: errors go (marked), play is dropped.
  const tester = await open()
  await tester.page.evaluate(() => localStorage.setItem('gamepack.outbox', JSON.stringify([
    { uuid: 'qa-old-play', event: 'world_section_entered', properties: { distinct_id: 'qa', token: 'phc_local_qa_only' }, timestamp: new Date().toISOString() },
    { uuid: 'qa-old-error', event: '$exception', properties: { distinct_id: 'qa', token: 'phc_local_qa_only' }, timestamp: new Date().toISOString() },
  ])))
  const sentBefore = batches.length
  await tester.page.goto(qaUrl + '?tester=1')
  await tester.page.waitForFunction(() => window.qaReady && window.outbox().length === 0)
  const replayed = batches.slice(sentBefore).flatMap(b => b.body.batch)
  assert.deepEqual(replayed.map(e => e.uuid), ['qa-old-error'], 'tester: saved play dropped, saved error sent')
  assert.equal(replayed[0].properties.tester, true, 'tester: the saved error is marked')
  console.log('PASS play saved before ?tester=1 is dropped')
  assert.equal(new URL(tester.page.url()).searchParams.get('tester'), null, '?tester is taken off the URL')
  await tester.page.evaluate(() => {
    window.posthog.capture('world_section_entered', { place: 'qa', activity: 'tester', section: 'a' })
    window.crash(false)
  })
  await tester.page.waitForFunction(() => window.events.some(e => e.event === '$exception'))
  await tester.page.locator('#rage').click({ clickCount: 3, delay: 50 })
  await tester.page.waitForTimeout(500)
  const testerEvents = await tester.page.evaluate(() => window.events)
  assert.deepEqual([...new Set(testerEvents.map(e => e.event))], ['$exception'], 'tester: only exceptions')
  assert.ok(testerEvents.every(e => e.properties.tester === true), 'tester: marked')
  await tester.page.goto(qaUrl)
  await tester.page.waitForFunction(() => window.qaReady)
  assert.equal(await tester.page.evaluate(() => localStorage.getItem('gamepack.tester')), '1', 'tester: remembered')
  console.log('PASS a tester sends errors only')
  await tester.page.goto(qaUrl + '?tester=0')
  await tester.page.waitForFunction(() => window.qaReady)
  await tester.page.evaluate(() => window.posthog.capture('world_section_entered', { place: 'qa', activity: 'untester', section: 'a' }))
  await tester.page.waitForFunction(() => window.events.some(e => e.event === 'world_section_entered'))
  assert.ok(!(await tester.page.evaluate(() => window.events.some(e => e.properties.tester))), '?tester=0: no tester property left')
  console.log('PASS ?tester=0 clears the tag')
  await tester.context.close()

  // 4. Her device: every event carries target_audience, and all her devices are one person.
  const target = await open('?target_audience=1')
  await target.page.evaluate(() => window.posthog.capture('world_section_entered', { place: 'qa', activity: 'target', section: 'a' }))
  await target.page.waitForFunction(() => window.events.some(e => e.event === 'world_section_entered'))
  const targetEvents = await target.page.evaluate(() => window.events)
  assert.ok(targetEvents.every(e => e.properties.target_audience === true), 'target audience: every event marked')
  assert.equal(await target.page.evaluate(() => window.posthog.get_distinct_id()), 'target-audience')
  console.log('PASS her device is the target audience')
  await target.page.goto(qaUrl + '?target_audience=0')
  await target.page.waitForFunction(() => window.qaReady)
  await target.page.evaluate(() => window.posthog.capture('world_section_entered', { place: 'qa', activity: 'untarget', section: 'a' }))
  await target.page.waitForFunction(() => window.events.some(e => e.event === 'world_section_entered'))
  assert.ok(!(await target.page.evaluate(() => window.events.some(e => e.properties.target_audience))), '?target_audience=0: no property left')
  assert.notEqual(await target.page.evaluate(() => window.posthog.get_distinct_id()), 'target-audience', '?target_audience=0: her identity is reset')
  console.log('PASS ?target_audience=0 clears the tag and her identity')
  await target.context.close()
} finally {
  await browser?.close()
  await server.close()
}

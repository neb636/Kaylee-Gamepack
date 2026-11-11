// Exercise the real SDK without sending QA data to PostHog: node scripts/qa-posthog.mjs
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'
import { createServer } from 'vite'

const host = 'https://posthog.invalid'
process.env.VITE_POSTHOG_ENABLED = 'true'
process.env.VITE_POSTHOG_KEY = 'phc_local_qa_only'
process.env.VITE_POSTHOG_HOST = host

const html = `<html><body><button id="rage">Play</button><div id="root"></div>
<script type="module">
import React from 'react'
import { createRoot } from 'react-dom/client'
import posthog from '/src/posthog.ts'
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
try {
  await server.listen()
  browser = await chromium.launch()
  // Emulate a real browser: PostHog intentionally drops automated browser events.
  const page = await browser.newPage({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' })
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
    await route.fulfill({ json: { autocapture_opt_out: false, featureFlags: {}, errorsWhileComputingFlags: false } })
  })
  // Fail closed if a future SDK change tries another PostHog domain.
  await page.route(/https:\/\/[^/]*posthog\.com\//, route => route.abort())
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/__posthog-qa`)
  await page.waitForFunction(() => window.qaReady && window.__PosthogExtensions__?.errorWrappingFunctions)
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
  )) && window.events.some(event => event.event === '$rageclick'), messages).catch(async error => {
    console.log(JSON.stringify(await page.evaluate(() => window.events), null, 2))
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
} finally {
  await browser?.close()
  await server.close()
}

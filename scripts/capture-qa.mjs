// One-off visual review for the game being built. Run after `npm run build`.
// Screenshots are workflow artifacts, never shipped with the game.
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'
import sharp from 'sharp'

const gameId = process.argv[2]
if (!gameId || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(gameId)) {
  console.error('Usage: node scripts/capture-qa.mjs <game-id> (after npm run build)')
  process.exit(1)
}

const sizes = [
  ['iphone-short', 375, 667],
  ['iphone', 390, 844],
  ['ipad-portrait', 820, 1180],
  ['ipad-landscape', 1180, 820],
  ['desktop', 1440, 900],
]
const port = 4174
const baseURL = `http://127.0.0.1:${port}`
const output = `qa-screenshots/${gameId}`
await mkdir(output, { recursive: true })
const server = spawn('node', ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
  env: { ...process.env, BASE_PATH: '/' }, stdio: 'ignore',
})
let browser
const captures = []
const findings = []

async function ready() {
  for (let i = 0; i < 100; i++) {
    if (server.exitCode !== null) throw new Error('Vite preview exited before it was ready')
    try { if ((await fetch(baseURL)).ok) return } catch { /* server starting */ }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error('Vite preview did not start')
}

async function capture(page, device, stage) {
  await page.waitForTimeout(400) // allow entrance animations to settle
  const filename = `${device}-${stage}.png`
  await page.screenshot({ path: `${output}/${filename}`, animations: 'disabled' })
  captures.push({ device, stage, filename })
  const clipped = await page.locator('button').evaluateAll((buttons) => buttons.flatMap((button) => {
    const rect = button.getBoundingClientRect()
    if (!rect.width || !rect.height || getComputedStyle(button).visibility === 'hidden') return []
    // A scrollable ancestor can bring an off-screen control into view.
    let parent = button.parentElement
    while (parent) {
      const style = getComputedStyle(parent)
      if (/(auto|scroll)/.test(style.overflowY) && parent.scrollHeight > parent.clientHeight + 2) return []
      parent = parent.parentElement
    }
    if (rect.top < -2 || rect.left < -2 || rect.bottom > innerHeight + 2 || rect.right > innerWidth + 2) {
      return [{ label: button.getAttribute('aria-label') || button.textContent?.trim().slice(0, 50),
        bounds: [rect.left, rect.top, rect.right, rect.bottom].map(Math.round) }]
    }
    return []
  }))
  if (clipped.length) findings.push({ device, stage, clipped })
}

try {
  await ready()
  browser = await chromium.launch()
  for (const [device, width, height] of sizes) {
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: device !== 'desktop' })
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    try {
      await page.goto(`${baseURL}/#/game/${gameId}`)
      await page.getByRole('button', { name: /let's play/i }).click()
      await page.getByRole('button', { name: 'Home' }).waitFor()
      await capture(page, device, 'intro')
      const go = page.getByRole('button', { name: /go!/i })
      if (await go.isVisible()) {
        await go.click()
        await capture(page, device, 'first-round')
      }
      await page.evaluate(() => window.__kaylee?.win())
      await page.getByRole('heading', { name: /you did it/i }).waitFor()
      await capture(page, device, 'trophy')
      if (errors.length) findings.push({ device, errors })
    } finally { await page.close() }
  }
  // Compact overview for the PR artifact; retain full-resolution images for inspection.
  const cellWidth = 300, cellHeight = 360
  const composite = []
  for (let i = 0; i < captures.length; i++) {
    const { device, stage, filename } = captures[i]
    const column = sizes.findIndex(([name]) => name === device)
    const row = stage === 'intro' ? 0 : stage === 'first-round' ? 1 : 2
    const image = await sharp(`${output}/${filename}`).resize({ width: 280, height: 325, fit: 'contain', background: '#ffffff' }).png().toBuffer()
    composite.push({ input: image, left: column * cellWidth + 10, top: row * cellHeight + 30 })
    const label = Buffer.from(`<svg width="290" height="26"><text x="5" y="18" font-size="14" font-family="sans-serif">${device} · ${stage}</text></svg>`)
    composite.push({ input: label, left: column * cellWidth + 5, top: row * cellHeight })
  }
  await sharp({ create: { width: sizes.length * cellWidth, height: 3 * cellHeight, channels: 4, background: '#fff' } })
    .composite(composite).png().toFile(`${output}/contact-sheet.png`)
  await writeFile(`${output}/report.json`, JSON.stringify({ gameId, sizes, captures, findings }, null, 2))
  console.log(`Review ${output}/contact-sheet.png and ${output}/report.json; automated findings: ${findings.length}`)
} finally {
  await browser?.close()
  server.kill()
}

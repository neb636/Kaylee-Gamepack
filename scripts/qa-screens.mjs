// Screenshots every Around the World screen (plus home) at iPad and iPhone sizes for visual QA.
//
//   npm run build && node scripts/qa-screens.mjs [--webkit] [--only=iphone-landscape] [--routes=home,world]
//
// Writes qa-output/<browser>-<viewport>/<nn>-<screen>.png and qa-output/errors.txt (console errors per screen).
import { chromium, webkit } from '@playwright/test'
import { spawn } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const out = path.join(root, 'qa-output')
const args = process.argv.slice(2)
const flag = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1]
const browserType = args.includes('--webkit') ? webkit : chromium
const browserName = args.includes('--webkit') ? 'webkit' : 'chromium'
const PORT = 4179

export const VIEWPORTS = [
  { name: 'ipad-portrait', width: 820, height: 1180 },
  { name: 'ipad-landscape', width: 1180, height: 820 },
  { name: 'ipadpro-portrait', width: 1024, height: 1366 },
  { name: 'ipadpro-landscape', width: 1366, height: 1024 },
  { name: 'iphone-portrait', width: 390, height: 844 },
  { name: 'iphone-landscape', width: 844, height: 390 },
  { name: 'iphonemax-portrait', width: 430, height: 932 },
].filter((v) => !flag('only') || flag('only').split(',').includes(v.name))

const skip = async (page) => {
  const b = page.getByRole('button', { name: 'Skip' })
  if (await b.isVisible().catch(() => false)) await b.click({ force: true }).catch(() => {})
  await page.waitForTimeout(700)
}

// Each screen: how to get there from a fresh start. `page.goto` keeps localStorage between screens.
const SCREENS = [
  { name: 'home', hash: '#/' },
  { name: 'world-map', hash: '#/world' },
  {
    name: 'world-map-continent',
    hash: '#/world',
    act: async (p) => {
      await p.getByRole('button', { name: 'africa' }).click({ force: true })
      await p.waitForTimeout(600)
    },
  },
  { name: 'passport-empty', hash: '#/world/passport', reset: true },
  { name: 'coloring-shelf', hash: '#/world/coloring' },
  {
    name: 'coloring-page',
    hash: '#/world/coloring/australia-koala',
    act: async (p) => {
      await p.waitForTimeout(800)
      const c = p.getByLabel('coloring page')
      const box = await c.boundingBox()
      if (box) for (const [fx, fy] of [[0.5, 0.5], [0.2, 0.2], [0.8, 0.3]]) await c.click({ force: true, position: { x: box.width * fx, y: box.height * fy } })
    },
  },
  { name: 'australia-intro', hash: '#/world/australia', reset: true, wait: 300 },
  { name: 'australia-hub', hash: '#/world/australia', act: skip },
  { name: 'outback-story', hash: '#/world/australia/outback', wait: 250 },
  {
    name: 'outback-pack',
    hash: '#/world/australia/outback',
    act: async (p) => {
      await skip(p)
      await p.getByRole('button', { name: 'hat' }).click({ force: true })
      await p.waitForTimeout(400)
    },
  },
  {
    name: 'outback-hop',
    hash: '#/world/australia/outback',
    act: async (p) => {
      await skip(p)
      for (const item of ['hat', 'glasses', 'water']) {
        await p.getByRole('button', { name: item }).click({ force: true })
        await p.waitForTimeout(250)
      }
      await p.waitForTimeout(1500)
      await p.getByRole('button', { name: 'Hop' }).click({ force: true })
      await p.waitForTimeout(700)
    },
  },
  { name: 'forest-feed', hash: '#/world/australia/forest', act: skip },
  { name: 'reef-find', hash: '#/world/australia/reef', act: skip },
  { name: 'stars-sky', hash: '#/world/australia/stars', act: skip },
  {
    name: 'stars-flag',
    hash: '#/world/australia/stars',
    act: async (p) => {
      await skip(p)
      for (const star of await p.getByRole('button', { name: 'star' }).all()) await star.click({ force: true })
      await p.waitForTimeout(4500)
    },
  },
  {
    name: 'postcard-color',
    hash: '#/world/australia/postcard',
    act: async (p) => {
      await skip(p)
      await p.waitForTimeout(600)
      const c = p.getByLabel('coloring page')
      const box = await c.boundingBox()
      if (box) for (const [fx, fy] of [[0.15, 0.2], [0.5, 0.5], [0.9, 0.9], [0.1, 0.9], [0.6, 0.1], [0.35, 0.65]]) await c.click({ force: true, position: { x: box.width * fx, y: box.height * fy } })
      await p.waitForTimeout(500)
    },
  },
  {
    name: 'stamp-earned',
    hash: '#/world/australia/stars',
    act: async (p) => {
      await skip(p)
      for (const star of await p.getByRole('button', { name: 'star' }).all()) await star.click({ force: true })
      await p.waitForTimeout(4500)
      await p.getByRole('button', { name: 'star' }).first().click({ force: true }).catch(() => {})
      await p.waitForTimeout(1500)
      await p.getByRole('button', { name: 'australia flag' }).click({ force: true }).catch(() => {})
      await p.waitForTimeout(2000)
    },
  },
  { name: 'australia-hub-stamps', hash: '#/world/australia', stampAll: true },
  { name: 'party', hash: '#/world/australia/party', stampAll: true, act: skip },
  { name: 'passport-full', hash: '#/world/passport', stampAll: true },
  {
    name: 'win-ceremony',
    hash: '#/world/australia',
    stampAll: true,
    act: async (p) => {
      await p.evaluate(() => window.__kaylee?.win())
      await p.waitForTimeout(1500)
    },
  },
].filter((s) => !flag('routes') || flag('routes').split(',').includes(s.name))

async function waitForServer(url) {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(url)).ok) return
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error(`Server did not start at ${url}`)
}

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { cwd: root, stdio: 'ignore' })
const base = `http://localhost:${PORT}/`
const errors = []
try {
  await waitForServer(base)
  rmSync(out, { recursive: true, force: true })
  const browser = await browserType.launch()
  for (const vp of VIEWPORTS) {
    const dir = path.join(out, `${browserName}-${vp.name}`)
    mkdirSync(dir, { recursive: true })
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: true, deviceScaleFactor: 1 })
    const page = await context.newPage()
    let current = ''
    page.on('console', (m) => m.type() === 'error' && errors.push(`${vp.name} ${current}: ${m.text()}`))
    page.on('pageerror', (e) => errors.push(`${vp.name} ${current}: ${e.message}`))
    await page.goto(base)
    await page.getByRole('button', { name: /let's play/i }).click()
    for (const [i, s] of SCREENS.entries()) {
      current = s.name
      if (s.reset) await page.evaluate(() => localStorage.clear())
      if (s.stampAll) {
        await page.goto(`${base}#/world/australia`)
        await page.waitForTimeout(400)
        await skip(page)
        await page.evaluate(() => window.__kayleeWorld?.stampAll())
      }
      await page.goto(`${base}#/blank`)
      await page.goto(`${base}${s.hash}`)
      await page.waitForTimeout(s.wait ?? 900)
      try {
        if (s.act) await s.act(page)
      } catch (e) {
        errors.push(`${vp.name} ${s.name}: step failed: ${e.message.split('\n')[0]}`)
      }
      const file = path.join(dir, `${String(i).padStart(2, '0')}-${s.name}.png`)
      await page.screenshot({ path: file })
      // Overflow check: anything wider/taller than the screen that would scroll or clip?
      const overflow = await page.evaluate(() => {
        const el = document.scrollingElement
        return el.scrollWidth > innerWidth + 1 || el.scrollHeight > innerHeight + 1 ? `${el.scrollWidth}x${el.scrollHeight}` : null
      })
      if (overflow) errors.push(`${vp.name} ${s.name}: page overflows the screen (${overflow})`)
    }
    await context.close()
    console.log(`${browserName}-${vp.name}: ${SCREENS.length} screens`)
  }
  await browser.close()
} finally {
  server.kill()
}
writeFileSync(path.join(out, 'errors.txt'), errors.join('\n') + '\n')
console.log(errors.length ? `${errors.length} problems, see qa-output/errors.txt` : 'No console errors or overflow.')

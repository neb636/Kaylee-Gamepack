// Screenshots every Around the World screen (plus home and the puppet lab) at iPad and iPhone sizes for visual QA.
//
//   npm run build && node scripts/qa-screens.mjs [--chromium] [--only=iphone-landscape,ipad-portrait] [--routes=home,world-map]
//
// WebKit by default (the iPad runs Safari), touch + mobile emulation, rendered at 2x and saved at 1x (CSS pixels).
// Writes qa-output/<browser>-<viewport>/<nn>-<screen>.png and qa-output/errors.txt (console errors, overflow, failed steps).
// A failed step never stops the run: it is listed in errors.txt and the screenshot is taken anyway.
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { browserName, device, flag, launch, openApp, out, pad, serve, skip, VIEWPORTS as ALL_VIEWPORTS } from './qa-lib.mjs'

export const VIEWPORTS = ALL_VIEWPORTS.filter((v) => !flag('only') || flag('only').split(',').includes(v.name))
const PORT = 4179

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
  { name: 'puppet-lab', hash: '#/world/puppets', wait: 1200 },
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
      await p.locator('svg.world-glow').first().click({ force: true }).catch(() => {}) // the big seven-point star
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

const { base, stop } = await serve(PORT)
const errors = []
try {
  mkdirSync(out, { recursive: true })
  // Only clear this browser's screenshot folders (qa-output also holds motion/, pacing.md, voice samples...).
  for (const name of readdirSync(out)) if (name.startsWith(`${browserName}-`)) rmSync(path.join(out, name), { recursive: true, force: true })
  const browser = await launch()
  for (const vp of VIEWPORTS) {
    const dir = path.join(out, `${browserName}-${vp.name}`)
    mkdirSync(dir, { recursive: true })
    const context = await device(browser, vp)
    const page = await context.newPage()
    let current = ''
    page.on('console', (m) => m.type() === 'error' && errors.push(`${vp.name} ${current}: ${m.text()}`))
    page.on('pageerror', (e) => errors.push(`${vp.name} ${current}: ${e.message}`))
    await openApp(page, base)
    for (const [i, s] of SCREENS.entries()) {
      current = s.name
      try {
        if (s.reset) await page.evaluate(() => localStorage.clear())
        if (s.stampAll) {
          await page.goto(`${base}#/world/australia`)
          await page.waitForTimeout(400)
          await skip(page)
          await page.evaluate(() => window.__kayleeWorld?.stampAll())
        }
        await page.goto(`${base}#/blank`)
        await page.goto(`${base}${s.hash}`)
        // Going to the same address again reloads the app: tap through the splash if it came back.
        await page.getByRole('button', { name: /let's play/i }).click({ timeout: 700 }).catch(() => {})
        await page.waitForTimeout(s.wait ?? 900)
        if (s.act) await s.act(page)
      } catch (e) {
        errors.push(`${vp.name} ${s.name}: step failed: ${e.message.split('\n')[0]}`)
      }
      const file = path.join(dir, `${pad(i)}-${s.name}.png`)
      await page.screenshot({ path: file, scale: 'css' }).catch((e) => errors.push(`${vp.name} ${s.name}: screenshot failed: ${e.message.split('\n')[0]}`))
      // Overflow check: anything wider/taller than the screen that would scroll or clip?
      const overflow = await page
        .evaluate(() => {
          const el = document.scrollingElement
          return el.scrollWidth > innerWidth + 1 || el.scrollHeight > innerHeight + 1 ? `${el.scrollWidth}x${el.scrollHeight}` : null
        })
        .catch(() => null)
      if (overflow) errors.push(`${vp.name} ${s.name}: page overflows the screen (${overflow})`)
    }
    await context.close()
    console.log(`${browserName}-${vp.name}: ${SCREENS.length} screens`)
  }
  await browser.close()
} finally {
  stop()
}
writeFileSync(path.join(out, 'errors.txt'), errors.join('\n') + '\n')
console.log(errors.length ? `${errors.length} problems, see qa-output/errors.txt` : 'No console errors or overflow.')

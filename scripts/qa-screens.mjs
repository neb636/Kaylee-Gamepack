// Screenshots every Around the World screen (plus the puppet lab) at iPad and iPhone sizes for visual QA.
//
//   npm run build && node scripts/qa-screens.mjs [--chromium] [--only=iphone-landscape,ipad-portrait] [--routes=world-map,passport]
//                                                 [--parallel=3] [--max-minutes=20]
// Viewports run side by side (--parallel, default 3) and the run stops starting new screens after --max-minutes
// (default 20), listing what it skipped in errors.txt, so a sweep can never eat an hour. Then `npm run qa:sheets`.
//
// WebKit by default (the iPad runs Safari), touch + mobile emulation, rendered at 2x and saved at 1x (CSS pixels).
// Writes qa-output/<browser>-<viewport>/<nn>-<screen>.png and qa-output/errors.txt (console errors, overflow, failed steps).
// A failed step never stops the run: it is listed in errors.txt and the screenshot is taken anyway.
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { browserName, device, flag, launch, loadScenarios, openApp, out, pad, seedWall, serve, skip, uncovered, VIEWPORTS as ALL_VIEWPORTS } from './qa-lib.mjs'

export const VIEWPORTS = ALL_VIEWPORTS.filter((v) => !flag('only') || flag('only').split(',').includes(v.name))
const PORT = Number(flag('port')) || 4179 // --port=N when another checkout's preview has 4179

// Each screen: how to get there from a fresh start. `page.goto` keeps localStorage between screens. The screens of the
// world map, the passport and the labs are here; each country's are in its src/world/places/<id>/qa.mjs (an
// activity's can be in its own activities/<id>/qa.mjs), and an activity nobody wrote screens for gets one per section.
// The racing slide: climb the steps (taps), then scoot (`taps` a second) until `until(window.__thaiMallQA())`, then
// wait `after` ms. Stops on its own after 25 s.
async function raceTo(page, until, taps = 0, after = 0) {
  const t0 = Date.now()
  while (Date.now() - t0 < 25000) {
    const q = await page.evaluate(() => window.__thaiMallQA?.() ?? {})
    if (until(q)) break
    if (q.phase === 'climb') await page.locator('[data-anchor="steps"]').click({ force: true }).catch(() => {})
    else if (q.phase === 'race' && taps && q.kaylee) await page.mouse.click(...q.kaylee)
    await page.waitForTimeout(q.phase === 'race' && taps ? 1000 / taps : q.phase === 'climb' ? 420 : 60)
  }
  await page.waitForTimeout(after)
}

const CENTRAL = [
  { name: 'world-map', hash: '#/world' },
  {
    name: 'world-map-continent',
    hash: '#/world',
    act: async (p) => {
      await p.getByRole('button', { name: 'africa' }).click({ force: true })
      await p.waitForTimeout(600)
    },
  },
  // The game shelf (the world map's list view) and a game's own page.
  { name: 'world-shelf', hash: '#/world?view=list' },
  {
    name: 'world-shelf-page',
    hash: '#/world?view=list',
    act: async (p) => {
      await p.getByRole('button', { name: 'Vet' }).click()
      await p.waitForTimeout(900)
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
  { name: 'character-lab', hash: '#/world/characters/kaylee', wait: 2500 },
  { name: 'character-lab-lineup', hash: '#/world/characters/agong?lineup=agong,jum,kaylee,putter', wait: 2500 },
  { name: 'theater-world', hash: '#/world/theater', wait: 1200 },
  {
    name: 'theater-poster',
    hash: '#/world/theater',
    act: async (p) => {
      await p.getByRole('button', { name: /^Watch / }).first().click()
      await p.waitForTimeout(1400)
    },
  },
  {
    name: 'theater-full',
    hash: '#/world/theater',
    act: async (p) => {
      await p.getByRole('button', { name: /^Watch / }).first().click()
      await p.waitForTimeout(600)
      await p.evaluate(() => window.__kayleeTheaterFull?.())
      await p.waitForTimeout(800)
    },
  },
  { name: 'passport-full', hash: '#/world/passport', stampAll: true },
  // (The look step: the rivals on the chibi rig in the character lab, front and back.)
  { name: 'nan-cup-rivals', hash: '#/world/characters/taeng?lineup=taeng,pao,moon', wait: 3000 },
  { name: 'nan-cup-rivals-back', hash: '#/world/characters/taeng?lineup=taeng,pao,moon&yaw=150', wait: 3000 },
]
const placed = [...CENTRAL, ...(await loadScenarios('screens'))]
const fresh = (await uncovered(placed.map((s) => s.hash))).flatMap((a) => a.sections.map((x) => ({ name: `${a.activity}-${x.id}`, hash: x.hash, reset: true, wait: 2500 })))
// --routes=venice,pizzeria-own: exact screen names, or an activity id for all of its screens (venice-*).
const SCREENS = [...placed, ...fresh].filter((s) => !flag('routes') || flag('routes').split(',').some((r) => s.name === r || s.name.startsWith(`${r}-`)))
if (fresh.length) console.log(`No screens written yet for ${[...new Set(fresh.map((s) => s.name.split('-')[0]))].join(', ')}: one per section (add a qa.mjs for more).`)

const { base, stop } = await serve(PORT)
const errors = []
try {
  mkdirSync(out, { recursive: true })
  // Only clear this browser's screenshot folders (qa-output also holds motion/, pacing.md, voice samples...).
  for (const name of readdirSync(out)) if (name.startsWith(`${browserName}-`)) rmSync(path.join(out, name), { recursive: true, force: true })
  const browser = await launch()
  const deadline = Date.now() + Number(flag('max-minutes') ?? 20) * 60_000
  const runViewport = async (vp) => {
    const dir = path.join(out, `${browserName}-${vp.name}`)
    mkdirSync(dir, { recursive: true })
    const context = await device(browser, vp)
    const page = await context.newPage()
    let current = ''
    page.on('console', (m) => m.type() === 'error' && !/youtube/i.test(`${m.text()} ${m.location().url}`) && errors.push(`${vp.name} ${current}: ${m.text()}`))
    page.on('pageerror', (e) => !/youtube/i.test(e.message) && errors.push(`${vp.name} ${current}: ${e.message}`))
    await openApp(page, base)
    for (const [i, s] of SCREENS.entries()) {
      current = s.name
      if (Date.now() > deadline) {
        errors.push(`${vp.name} ${s.name}: skipped, --max-minutes reached (rerun with --routes/--only for the rest)`)
        continue
      }
      try {
        if (s.reset) await page.evaluate(() => localStorage.clear())
        if (s.seed) await page.evaluate(s.seed)
        if (s.stampAll) {
          await page.goto(`${base}#/world/${s.stampAll === true ? 'australia' : s.stampAll}`)
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
  const queue = [...VIEWPORTS]
  await Promise.all(Array.from({ length: Math.min(Number(flag('parallel') ?? 3), queue.length) }, async () => {
    for (let vp = queue.shift(); vp; vp = queue.shift()) await runViewport(vp)
  }))
  await browser.close()
} finally {
  stop()
}
writeFileSync(path.join(out, 'errors.txt'), errors.join('\n') + '\n')
console.log(errors.length ? `${errors.length} problems, see qa-output/errors.txt` : 'No console errors or overflow.')

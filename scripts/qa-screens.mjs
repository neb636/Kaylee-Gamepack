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
  { name: 'croc-story', hash: '#/world/australia/croc', wait: 250 },
  { name: 'croc-hatch', hash: '#/world/australia/croc', act: skip },
  {
    name: 'croc-ride',
    hash: '#/world/australia/croc',
    act: async (p) => {
      await skip(p)
      for (let i = 0; i < 3; i++) {
        await p.getByRole('button', { name: 'egg' }).first().click({ force: true }).catch(() => {})
        await p.waitForTimeout(i === 0 ? 3500 : 300) // Sparkle tells the chirp fact after the first egg
      }
      await p.waitForTimeout(9000)
      await p.getByRole('button', { name: 'baby crocodile' }).first().click({ force: true }).catch(() => {})
      await p.waitForTimeout(700)
    },
  },
  {
    name: 'croc-swim',
    hash: '#/world/australia/croc',
    act: async (p) => {
      await skip(p)
      for (let i = 0; i < 3; i++) {
        await p.getByRole('button', { name: 'egg' }).first().click({ force: true }).catch(() => {})
        await p.waitForTimeout(i === 0 ? 3500 : 300) // Sparkle tells the chirp fact after the first egg
      }
      await p.waitForTimeout(9000)
      for (let i = 0; i < 3; i++) {
        await p.getByRole('button', { name: 'baby crocodile' }).first().click({ force: true }).catch(() => {})
        await p.waitForTimeout(500)
      }
      await p.waitForTimeout(7000)
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
  { name: 'theater-australia', hash: '#/world/australia/theater', wait: 1200 },
  {
    name: 'video-break',
    hash: '#/world/australia/forest',
    act: async (p) => {
      await skip(p)
      await p.evaluate(() => window.__kayleeWorld?.finish?.())
      await p.waitForTimeout(1200)
      await p.getByRole('button', { name: 'Back to the map' }).first().click()
      await p.waitForTimeout(1400)
    },
  },
  { name: 'party', hash: '#/world/australia/party', stampAll: true, act: skip },
  { name: 'china-intro', hash: '#/world/china', reset: true, wait: 300 },
  { name: 'china-hub', hash: '#/world/china', act: skip },
  { name: 'dumplings-arrive', hash: '#/world/china/dumplings', reset: true, wait: 400 },
  { name: 'dumplings-oldtown', hash: '#/world/china/dumplings', reset: true, act: skip },
  {
    name: 'dumplings-kitchen',
    hash: '#/world/china/dumplings',
    reset: true,
    act: async (p) => {
      await skip(p)
      await p.getByRole('button', { name: 'zig-zag bridge' }).click({ force: true }).catch(() => {})
      await p.waitForTimeout(2600)
      await p.getByRole('button', { name: 'dumpling house door' }).click({ force: true }).catch(() => {})
      await p.waitForTimeout(2200)
    },
  },
  { name: 'bamboo-story', hash: '#/world/china/bamboo', reset: true, wait: 400 },
  { name: 'bamboo-round1', hash: '#/world/china/bamboo', reset: true, act: skip },
  {
    name: 'bamboo-grown',
    hash: '#/world/china/bamboo',
    reset: true,
    act: async (p) => {
      await skip(p)
      await p.getByRole('button', { name: 'bamboo shoot' }).click({ force: true }).catch(() => {})
      await p.waitForTimeout(900)
      await p.getByRole('button', { name: 'bamboo shoot' }).click({ force: true }).catch(() => {})
      await p.waitForTimeout(900)
    },
  },
  { name: 'wall-story', hash: '#/world/china/wall', reset: true, wait: 400 },
  { name: 'wall-gap1', hash: '#/world/china/wall', reset: true, act: skip },
  {
    name: 'wall-gap1-wrong',
    hash: '#/world/china/wall',
    reset: true,
    act: async (p) => {
      await skip(p)
      await p.waitForTimeout(1500)
      await p.getByRole('button', { name: 'gold brick' }).click({ force: true }).catch(() => {})
      await p.waitForTimeout(700)
    },
  },
  { name: 'hotpot-story', hash: '#/world/china/hotpot', reset: true, wait: 400 },
  { name: 'hotpot-play', hash: '#/world/china/hotpot', reset: true, act: async (p) => { await skip(p); await p.waitForTimeout(1800) } },
  { name: 'brush-story', hash: '#/world/china/brush', reset: true, wait: 400 },
  { name: 'brush-play', hash: '#/world/china/brush', reset: true, act: async (p) => { await skip(p); await p.waitForTimeout(1800) } },
  { name: 'race-story', hash: '#/world/china/race', reset: true, wait: 400 },
  { name: 'race-play', hash: '#/world/china/race', reset: true, act: async (p) => { await skip(p); await p.waitForTimeout(1800) } },
  { name: 'train-story', hash: '#/world/china/train', reset: true, wait: 400 },
  { name: 'train-play', hash: '#/world/china/train', reset: true, act: async (p) => { await skip(p); await p.waitForTimeout(1800) } },
  { name: 'china-parade', hash: '#/world/china/party', stampAll: 'china', act: async (p) => { await skip(p); await p.waitForTimeout(2500) } },
  { name: 'china-hub-done', hash: '#/world/china', stampAll: 'china', act: skip },
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
  // Egypt
  { name: 'egypt-intro', hash: '#/world/egypt', reset: true, wait: 300 },
  { name: 'egypt-hub', hash: '#/world/egypt', act: skip },
  { name: 'pyramid-story', hash: '#/world/egypt/pyramid', wait: 250 },
  {
    name: 'pyramid-build',
    hash: '#/world/egypt/pyramid',
    act: async (p) => {
      await skip(p)
      await p.waitForTimeout(1200)
      for (let i = 0; i < 4; i++) {
        await p.getByRole('button', { name: /(mid|big) stone/ }).last().click({ force: true, timeout: 1500 }).catch(() => {})
        await p.waitForTimeout(1600)
      }
    },
  },
  { name: 'passage-maze', hash: '#/world/egypt/passage', act: skip },
  { name: 'sphinx-sand', hash: '#/world/egypt/sphinx', act: skip },
  {
    name: 'sphinx-rubbed',
    hash: '#/world/egypt/sphinx',
    act: async (p) => {
      await skip(p)
      const c = await p.getByLabel('Rub the sand away').boundingBox()
      if (!c) return
      for (let row = 0; row < 4; row++) {
        const y = c.y + c.height * (0.2 + row * 0.1)
        await p.mouse.move(c.x + c.width * 0.2, y)
        await p.mouse.down()
        for (let k = 1; k <= 8; k++) await p.mouse.move(c.x + c.width * (0.2 + k * 0.05), y)
        await p.mouse.up()
      }
      await p.waitForTimeout(800)
    },
  },
  { name: 'nile-sail', hash: '#/world/egypt/nile', act: async (p) => (await skip(p), await p.waitForTimeout(2500)) },
  { name: 'scribe-stamps', hash: '#/world/egypt/scribe', act: skip },
  {
    name: 'market-koshari',
    hash: '#/world/egypt/market',
    act: async (p) => {
      await skip(p)
      await p.waitForTimeout(3500)
      for (const f of ['rice', 'lentils']) {
        await p.getByRole('button', { name: f, exact: true }).click({ force: true, timeout: 1500 }).catch(() => {})
        await p.waitForTimeout(500)
      }
    },
  },
  { name: 'egypt-hub-stamps', hash: '#/world/egypt', stampAll: 'egypt' },
  { name: 'light-show', hash: '#/world/egypt/party', stampAll: 'egypt', act: skip },
  { name: 'italy-intro', hash: '#/world/italy', reset: true, wait: 300 },
  { name: 'italy-hub', hash: '#/world/italy', act: skip },
  { name: 'pizzeria-story', hash: '#/world/italy/pizzeria', reset: true, wait: 400 },
  { name: 'pizzeria-play', hash: '#/world/italy/pizzeria', reset: true, act: async (p) => { await skip(p); await p.waitForTimeout(1800) } },
  { name: 'olives-story', hash: '#/world/italy/olives', reset: true, wait: 400 },
  { name: 'olives-play', hash: '#/world/italy/olives', reset: true, act: async (p) => { await skip(p); await p.waitForTimeout(1800) } },
  { name: 'trevi-story', hash: '#/world/italy/trevi', reset: true, wait: 400 },
  { name: 'trevi-play', hash: '#/world/italy/trevi', reset: true, act: async (p) => { await skip(p); await p.waitForTimeout(1800) } },
  { name: 'colosseum-story', hash: '#/world/italy/colosseum', reset: true, wait: 400 },
  { name: 'colosseum-play', hash: '#/world/italy/colosseum', reset: true, act: async (p) => { await skip(p); await p.waitForTimeout(1800) } },
  { name: 'venice-story', hash: '#/world/italy/venice', reset: true, wait: 400 },
  { name: 'venice-pick', hash: '#/world/italy/venice', reset: true, act: async (p) => { await skip(p); await p.waitForTimeout(900) } },
  // Venice moments, reached through its QA hook (window.__veniceQA.jump): driving, a friend riding with the LEFT/RIGHT
  // "go this way" bubble, Gino's trip to the mask shop, the mirror mask, the night finale.
  ...['play', 'ride', 'trip', 'mask', 'finale'].map((to) => ({
    name: `venice-${to}`,
    hash: '#/world/italy/venice',
    reset: true,
    act: async (p) => {
      await skip(p)
      await p.waitForTimeout(500)
      await p.evaluate((t) => window.__veniceQA?.jump(t), to)
      await p.waitForTimeout(to === 'trip' ? 6000 : to === 'finale' ? 2500 : 1500)
    },
  })),
  { name: 'etna-story', hash: '#/world/italy/etna', reset: true, wait: 400 },
  { name: 'etna-play', hash: '#/world/italy/etna', reset: true, act: async (p) => { await skip(p); await p.waitForTimeout(1800) } },
  // Etna moments, reached through its QA hook (window.__etnaQA.jump): the lemon grove, the chestnut forest and stream,
  // the cold (snow falling, the scarf on its trail post), the snow drifts, the full cart going down, the granita stand
  // and the piano payoff.
  ...['grove', 'forest', 'cold', 'snow', 'full', 'granita', 'payoff'].map((to) => ({
    name: `etna-${to}`,
    hash: '#/world/italy/etna',
    reset: true,
    act: async (p) => {
      await skip(p)
      await p.waitForTimeout(500)
      await p.evaluate((t) => window.__etnaQA?.jump(t), to)
      await p.waitForTimeout(to === 'payoff' ? 2500 : 1500)
    },
  })),
  { name: 'italy-hub-stamps', hash: '#/world/italy', stampAll: 'italy' },
  { name: 'italy-opera', hash: '#/world/italy/party', stampAll: 'italy', act: async (p) => { await skip(p); await p.waitForTimeout(2500) } },
  // Opera moments, reached through its QA hook (window.__operaQA.jump): the owl, the solos, the wishing star, Lupa's high
  // note, the jets' sky and the picnic.
  ...['owl', 'solo', 'star', 'high', 'sky', 'picnic'].map((to) => ({
    name: `opera-${to}`,
    hash: '#/world/italy/party',
    stampAll: 'italy',
    act: async (p) => {
      await skip(p)
      await p.waitForTimeout(500)
      await p.evaluate((t) => window.__operaQA?.jump(t), to)
      await p.waitForTimeout(to === 'star' ? 2600 : 1200)
    },
  })),
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
    page.on('console', (m) => m.type() === 'error' && !/youtube/i.test(`${m.text()} ${m.location().url}`) && errors.push(`${vp.name} ${current}: ${m.text()}`))
    page.on('pageerror', (e) => !/youtube/i.test(e.message) && errors.push(`${vp.name} ${current}: ${e.message}`))
    await openApp(page, base)
    for (const [i, s] of SCREENS.entries()) {
      current = s.name
      try {
        if (s.reset) await page.evaluate(() => localStorage.clear())
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
  await browser.close()
} finally {
  stop()
}
writeFileSync(path.join(out, 'errors.txt'), errors.join('\n') + '\n')
console.log(errors.length ? `${errors.length} problems, see qa-output/errors.txt` : 'No console errors or overflow.')

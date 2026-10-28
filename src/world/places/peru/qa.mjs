// Peru's QA scenarios, picked up by scripts/qa-screens.mjs (screens), qa-pacing.mjs (pacing) and
// qa-motion.mjs (motion). A new activity can keep its own next to its sections.ts (activities/<id>/qa.mjs);
// sections no screen reaches get a plain screenshot anyway. Not part of the app: Node runs it, Vite never sees it.
import { skip, vp } from '../../../../scripts/qa-lib.mjs'

/** Screenshots (scripts/qa-screens.mjs): how to get to each screen from a fresh start. */
export const screens = [
  { name: 'peru-intro', hash: '#/world/peru', reset: true, wait: 300 },
  { name: 'peru-hub', hash: '#/world/peru', act: skip },
  { name: 'alpaca-story', hash: '#/world/peru/alpaca/story', reset: true, wait: 400 },
  { name: 'alpaca-play', hash: '#/world/peru/alpaca/brush', reset: true, wait: 1800 },
  // Luna's Fluffy Day moments, opened through section URLs: the clippers, the family's turn,
  // the yarn and the cactus, the hats tray, the journal photo.
  ...['clip', 'family', 'yarn', 'hats', 'photo'].map((to) => ({
    name: `alpaca-${to}`,
    hash: `#/world/peru/alpaca/${to}`,
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(500)
      await p.waitForTimeout(to === 'family' ? 2400 : 1500)
    },
  })),
  { name: 'terraces-story', hash: '#/world/peru/machu-picchu/story', reset: true, wait: 400 },
  { name: 'terraces-play', hash: '#/world/peru/machu-picchu/wall-1', reset: true, wait: 1800 },
  // Tika's Mountain Terraces, opened through section URLs: the second and third walls, the
  // last wall in the clouds, and the photobomb at the top.
  ...[1, 2, 3, 'photo'].map((to) => ({
    name: `terraces-${to === 'photo' ? 'photo' : `wall${to}`}`,
    hash: `#/world/peru/machu-picchu/${to === 'photo' ? 'photo' : `wall-${to + 1}`}`,
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(500)
      await p.waitForTimeout(1500)
    },
  })),
  { name: 'penguins-story', hash: '#/world/peru/penguins/story', reset: true, wait: 400 },
  { name: 'penguins-play', hash: '#/world/peru/penguins/splash', reset: true, wait: 1500 },
  // Pepa's Penguin Cliff moments, opened through section URLs: the fish schools, feeding the
  // chicks, the twist (third chick, swell, pelican), the chicks' first swim, the family parade.
  ...['fish', 'feed', 'twist', 'swim', 'parade'].map((to) => ({
    name: `penguins-${to}`,
    hash: `#/world/peru/penguins/${to}`,
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(500)
      await p.waitForTimeout(to === 'parade' ? 3200 : to === 'twist' ? 2400 : 1800)
    },
  })),
  { name: 'condor-story', hash: '#/world/peru/condor/story', reset: true, wait: 400 },
  { name: 'condor-start', hash: '#/world/peru/condor/start', reset: true, wait: 1500 },
  // Coco's Canyon Glide moments, opened through section URLs: leading Pluma to the places,
  // the sun on the other wall (the ridge), Pluma flying by herself, the condor circle at the end.
  ...['follow', 'ridge', 'solo', 'finale'].map((to) => ({
    name: `condor-${to}`,
    hash: `#/world/peru/condor/${to}`,
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(500)
      await p.waitForTimeout(to === 'finale' ? 1200 : 3000)
    },
  })),
  { name: 'river-story', hash: '#/world/peru/river/story', reset: true, wait: 400 },
  { name: 'river-play', hash: '#/world/peru/river/forest', reset: true, wait: 1800 },
  // Rosa's Rainy River moments, opened through section URLs: raining on the river, the river
  // view once it's filled, the lagoon, the lily pads with the friends, the rainbow.
  {
    name: 'river-rain',
    hash: '#/world/peru/river/forest',
    reset: true,
    act: async (p) => {
      await p.evaluate(() => window.__peruRiverQA?.rain(0.5, 12))
      await p.waitForTimeout(3500)
    },
  },
  ...['river', 'lagoon', 'pads', 'rainbow'].map((to) => ({
    name: `river-${to === 'river' ? 'full' : to}`,
    hash: `#/world/peru/river/${to}${to === 'river' ? '?river=1' : ''}`,
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(500)
      await p.waitForTimeout(to === 'rainbow' ? 2600 : 3200)
    },
  })),
  { name: 'peru-hub-stamps', hash: '#/world/peru', stampAll: 'peru' },
  { name: 'peru-balloon-soon', hash: '#/world/peru/party/soon', stampAll: 'peru', wait: 800 },
]

/** Auto-played runs (scripts/qa-pacing.mjs): talk before the first touch, talk per touch, the play strip. */
export const pacing = [
  { name: 'peru intro + map', id: 'peru', hash: '#/world/peru', reset: true, play: false },
  { name: "peru luna's fluffy day", id: 'alpaca', hash: '#/world/peru/alpaca', reset: true },
  { name: "peru tika's mountain terraces", id: 'machu-picchu', hash: '#/world/peru/machu-picchu', reset: true },
  { name: "peru pepa's penguin cliff", id: 'penguins', hash: '#/world/peru/penguins', reset: true },
  { name: "peru coco's canyon glide", id: 'condor', hash: '#/world/peru/condor', reset: true },
  { name: "peru rosa's rainy river", id: 'river', hash: '#/world/peru/river', reset: true },
]

/** Filmed moments (scripts/qa-motion.mjs): the core verbs, driven the way a child would. */
export const motion = []

// Luna's Fluffy Day: rub the brush over Luna's fleece (tangles turn shiny, sparkles, things pop out), then the
// clippers (puffs snip off and float into the basket).
const fluffyRub = (name, seconds, jump) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/peru/alpaca/${jump || 'brush'}`)
    await page.waitForTimeout(600)
    await page.waitForTimeout(900)
  },
  act: async (page) => {
    const b = await page.locator('[aria-label="Luna"]').first().boundingBox()
    if (!b) throw new Error('no Luna found')
    await page.mouse.move(b.x + b.width * 0.2, b.y + b.height * 0.5)
    await page.mouse.down()
    for (let i = 0; i < 5; i++) await page.mouse.move(b.x + b.width * (i % 2 ? 0.2 : 0.75), b.y + b.height * (0.48 + i * 0.05), { steps: 10 })
    await page.mouse.up()
  },
})
motion.push(fluffyRub('fluffy-brush', 2.4), fluffyRub('fluffy-clip', 2.6, 'clip'))

// Tika's Mountain Terraces: drag a stone off the pile into its own gap (magnetic pull, clonk, dust, shake), then one
// into a wrong gap (bonk, rolls back). `jump` starts on a later wall.
const terracesStone = (name, seconds, wrong, jump) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/peru/machu-picchu/${jump ? (jump === 'photo' ? 'photo' : `wall-${jump + 1}`) : 'wall-1'}`)
    await page.waitForTimeout(600)
    await page.waitForTimeout(1500)
  },
  act: async (page) => {
    const r = await page.evaluate((wrong) => {
      const el = document.querySelector('[data-stone]')
      if (!el) return null
      const gaps = [...document.querySelectorAll('[data-gap]')]
      const gap = gaps.find((g) => (g.dataset.gap === el.dataset.stone) !== wrong)
      if (!gap) return null
      const b = el.getBoundingClientRect()
      const t = gap.getBoundingClientRect()
      return { x: b.left + b.width / 2, y: b.top + b.height / 2, tx: t.left + t.width / 2, ty: t.top + t.height / 2 }
    }, wrong)
    if (!r) throw new Error('no stone or gap found')
    await page.mouse.move(r.x, r.y)
    await page.mouse.down()
    for (let i = 1; i <= 12; i++) {
      await page.mouse.move(r.x + ((r.tx - r.x) * i) / 12, r.y + ((r.ty - r.y) * i) / 12)
      await page.waitForTimeout(40)
    }
    await page.mouse.up()
  },
})
motion.push(terracesStone('terraces-clonk', 2.4, false), terracesStone('terraces-bonk', 2.4, true), terracesStone('terraces-clouds', 2.4, false, 3))

// Pepa's Penguin Cliff: grab the front penguin on the launch rock, pull it back (it crouches, the dotted arc shows the
// splash spot), let go: the leap, the splash, the underwater swim. `jump` starts later (fish schools, the chicks' swim).
const penguinLaunch = (name, seconds, jump, pull) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/peru/penguins/${jump || 'splash'}`)
    await page.waitForTimeout(600)
    await page.waitForSelector('[aria-label="penguin"]', { timeout: 20000 })
    await page.waitForTimeout(jump === 'swim' ? 3200 : 900)
  },
  act: async (page) => {
    const boxes = await page.$$eval('[aria-label="penguin"], [aria-label="penguin chick"]', (els) =>
      els.filter((e) => getComputedStyle(e).display !== 'none').map((e) => {
        const r = e.getBoundingClientRect()
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
      }),
    )
    const front = boxes.sort((a, b) => b.x - a.x)[0]
    if (!front) throw new Error('no penguin found')
    await page.mouse.move(front.x, front.y)
    await page.mouse.down()
    await page.mouse.move(front.x - pull * vp.width, front.y + pull * vp.height * 0.5, { steps: 12 })
    await page.waitForTimeout(400)
    await page.mouse.up()
  },
})
motion.push(penguinLaunch('penguin-launch', 8, null, 0.13), penguinLaunch('penguin-fish', 5, 'fish', 0.09), penguinLaunch('penguin-chick-swim', 4.5, 'swim', 0.08))

// Coco's Canyon Glide: hold a finger in the sky and Coco banks after it, sinking slowly in plain air; steer him into a
// swirl of warm air and he circles up (wings up, fingers spread); pull down for a dive (wings fold) and a swoop.
const canyonFly = (name, seconds, jump, path) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/peru/condor/${jump || 'start'}`)
    await page.waitForTimeout(600)
    await page.waitForTimeout(900)
  },
  act: async (page) => {
    const vp = page.viewportSize()
    // `path`: world targets [x, y, ms]; the finger sits where that point is on screen (clamped to the screen).
    let down = false
    for (const [x, y, ms] of path) {
      const end = Date.now() + ms
      while (Date.now() < end) {
        const w = await page.evaluate(() => window.__canyonQA?.where())
        if (!w) break
        const sx = Math.min(vp.width - 20, Math.max(20, (x - w.cam.x) * w.s))
        const sy = Math.min(vp.height - 20, Math.max(140, (y - w.cam.y) * w.s))
        if (!down) {
          await page.mouse.move(sx, sy)
          await page.mouse.down()
          down = true
        } else await page.mouse.move(sx, sy)
        await page.waitForTimeout(100)
      }
    }
    await page.mouse.up()
  },
})
motion.push(
  canyonFly('canyon-ride', 4, null, [[1340, 1800, 1500], [1340, 900, 2500]]),
  canyonFly('canyon-dive', 3.2, 'follow', [[1700, 2600, 2000], [2000, 2100, 1200]]),
)

// Rosa's Rainy River: grab the cloud and squeeze it (it squishes and rains), wiggle it over the river (harder rain, a
// rumble), then a lily bud unrolling in the lagoon's rain.
const riverSqueeze = (name, seconds, jump) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/peru/river/${jump || 'forest'}`)
    await page.waitForTimeout(600)
    await page.waitForTimeout(jump ? 3200 : 900)
  },
  act: async (page) => {
    const b = await page.locator('[aria-label="rain cloud"]').first().boundingBox()
    if (!b) throw new Error('no cloud found')
    const x = b.x + b.width / 2
    const y = b.y + b.height / 2
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.waitForTimeout(700)
    for (let i = 0; i < 6; i++) await page.mouse.move(x + (i % 2 ? 60 : -60) + i * 12, y + (i % 2 ? 10 : -10), { steps: 6 })
    await page.waitForTimeout(600)
    await page.mouse.up()
  },
})
motion.push(riverSqueeze('river-squeeze', 3.2), riverSqueeze('river-lagoon-rain', 3.2, 'lagoon'))

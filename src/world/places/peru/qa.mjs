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
  { name: 'river-story', hash: '#/world/peru/river/story', reset: true, wait: 400 },
  // Swim with Rosa, opened through section URLs: the treetops, the fruit tree, the start of the race, and the rainbow
  // both ways (she wins; the otters win and the again button shows).
  ...['treetops', 'fruit', 'race', 'rainbow', 'rainbow?result=lose'].map((to) => ({
    name: `river-${to.replace('?result=', '-')}`,
    hash: `#/world/peru/river/${to}`,
    reset: true,
    wait: to.startsWith('rainbow') ? 1400 : 2200,
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
  { name: 'peru swim with rosa', id: 'river', hash: '#/world/peru/river', reset: true },
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
    // The chicks' swim hides every adult: wait for a chick there, an adult everywhere else.
    await page.waitForSelector(jump === 'swim' ? '[aria-label="penguin chick"]' : '[aria-label="penguin"]', { timeout: 20000 })
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

// Swim with Rosa: a finger held ahead of her and she swims after it; a run-up from the deep and she leaps. The robot
// reads where things are on screen from window.__peruRiverQA.state() and plays the way a child would: to the
// capybaras (the baby rides), a leap that wakes the sloth, the fruit, and the race to the rainbow.
const riverState = (page) => page.evaluate(() => window.__peruRiverQA?.state())
/** Hold the finger where `aim(state)` says until `done(state)`, or `ms` at most. */
async function riverHold(page, done, aim, ms = 8000) {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    const s = await riverState(page)
    if (!s || done(s)) return s
    const a = aim(s)
    await page.mouse.move(a.x, a.y, { steps: 2 })
    await page.waitForTimeout(35)
  }
}
const riverSwimTo = (page, wx, depth = 110) =>
  riverHold(
    page,
    (s) => Math.abs(s.rosa.wx - wx) < 60,
    (s) => ({ x: s.rosa.x + Math.sign(wx - s.rosa.wx) * 240, y: s.water + depth * s.scale }),
  )
/** Down to the riverbed just before `wx`, then straight up at it. */
async function riverLeap(page, wx) {
  await riverHold(page, (s) => s.rosa.wy > 270 && Math.abs(s.rosa.wx - (wx - 120)) < 80, (s) => ({ x: s.rosa.x + (wx - 120 - s.rosa.wx) * s.scale, y: s.bed - 60 * s.scale }), 2600)
  await riverHold(page, (s) => s.rosa.air, (s) => ({ x: s.rosa.x + (wx - s.rosa.wx) * s.scale * 0.8 + 30, y: s.water - 300 * s.scale }), 2600)
  await riverHold(page, (s) => !s.rosa.air, (s) => ({ x: s.rosa.x, y: s.water - 100 * s.scale }), 2600)
}
const riverRun = (name, seconds, section, play) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/peru/river/${section}`)
    await page.waitForTimeout(1600)
  },
  act: async (page) => {
    const s = await riverState(page)
    if (!s) throw new Error('the river is not on screen')
    await page.mouse.move(s.rosa.x, s.rosa.y)
    await page.mouse.down()
    await play(page)
    await page.mouse.up()
  },
})
motion.push(
  riverRun('river-swim', 8, 'treetops', async (page) => {
    await riverSwimTo(page, 1000)
    await riverSwimTo(page, 1500, 60)
  }),
  riverRun('river-leap', 8, 'treetops?met=capy', async (page) => {
    await riverSwimTo(page, 1500)
    await riverLeap(page, 1860)
    await riverLeap(page, 2060)
  }),
  riverRun('river-fruit', 12, 'fruit', async (page) => {
    for (let i = 0; i < 6; i++) {
      const f = (await riverState(page)).fruit.find((f) => f.state === 'hang')
      if (!f) break
      await riverLeap(page, f.wx)
    }
    await page.waitForTimeout(1500)
  }),
  riverRun('river-race', 16, 'race', async (page) => {
    await riverHold(page, (s) => s.race === 'won' || s.race === 'lost', (s) => ({ x: s.rosa.x + 280, y: s.water + 130 * s.scale }), 30000)
    await page.waitForTimeout(1500)
  }),
)

// Luna's map (the hub): tap each of Peru's three worlds (a wave rolls in, the snowcap glints, a pink dolphin leaps),
// then Luna in her meadow. Spots are in the map's own 1000 units (mapLand.ts).
motion.push({
  name: 'hub-worlds',
  seconds: 8,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/peru`)
    await page.waitForTimeout(900)
    await skip(page)
    await page.waitForTimeout(900)
  },
  act: async (page) => {
    const b = await page.getByRole('button', { name: "Peru's three worlds" }).boundingBox()
    if (!b) throw new Error('no map found')
    for (const [x, y] of [[300, 520], [392, 470], [520, 180]]) {
      await page.mouse.click(b.x + (x / 1000) * b.width, b.y + (y / 1000) * b.height)
      await page.waitForTimeout(1900)
    }
    await page.getByRole('button', { name: 'Luna', exact: true }).click({ force: true })
  },
})

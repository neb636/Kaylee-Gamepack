// The Poles's QA scenarios, picked up by scripts/qa-screens.mjs (screens), qa-pacing.mjs (pacing) and
// qa-motion.mjs (motion). A new activity can keep its own next to its sections.ts (activities/<id>/qa.mjs);
// sections no screen reaches get a plain screenshot anyway. Not part of the app: Node runs it, Vite never sees it.
import { vp } from '../../../../scripts/qa-lib.mjs'

/** Screenshots (scripts/qa-screens.mjs): how to get to each screen from a fresh start. */
export const screens = [
  // The Poles: the globe hub (greybox 1) from the middle, each pole, the sun out with summer up north, and the north in
  // its winter night; the lost penguin and the lost bear cub adrift (hub greybox 2); Ice Floe Hop; then an activity's
  // and the finale's "coming soon" cards.
  ...['globe', 'globe?side=north', 'globe?side=south', 'sun?summer=north', 'sun?side=north&summer=south', 'sun?side=south&summer=south', 'lost?who=penguin', 'lost?who=bear'].map((to) => ({
    name: `poles-${to.replace(/[?=&]/g, '-')}`,
    hash: `#/world/poles/hub/${to}`,
    reset: true,
    wait: 1800,
  })),
  // Ice Floe Hop (greybox 2): Mama far away, then each stage's first floe, and home with Mama (the hug, then the look back).
  ...['story', 'steady', 'drift', 'melt', 'mama'].map((to) => ({ name: `poles-floe-${to}`, hash: `#/world/poles/floe/${to}`, reset: true, wait: to === 'mama' ? 4200 : 1800 })),
  // Penguin Slide (greybox 3): each stretch from its link (home: the feeding, then the colony).
  ...['top', 'bumps?run=right', 'dive', 'home?krill=12'].map((to) => ({ name: `poles-slide-${to.replace(/[?=&]/g, '-')}`, hash: `#/world/poles/slide/${to}`, reset: true, wait: to.startsWith('home') ? 5000 : 2500 })),
  // Iceberg Maker (greybox 4): the pick, then each stretch at both poles from its link (sail: the camera turned round,
  // looking out to sea from the cliff top).
  { name: 'poles-iceberg-pick', hash: '#/world/poles/iceberg/pick', reset: true, wait: 1800 },
  ...['bits', 'giant', 'sail'].flatMap((to) => ['north', 'south'].map((pole) => ({ name: `poles-iceberg-${to}-${pole}`, hash: `#/world/poles/iceberg/${to}?pole=${pole}`, reset: true, wait: to === 'sail' ? 3000 : 1800 }))),
  // Snow Coats (greybox 5, 2D): the brown fox in late summer, hide and seek (half painted), the summer.
  { name: 'poles-coats-fox', hash: '#/world/poles/coats/fox', reset: true, wait: 1500 },
  { name: 'poles-coats-hide', hash: '#/world/poles/coats/hide?painted=fox,hare', reset: true, wait: 1500 },
  { name: 'poles-coats-summer', hash: '#/world/poles/coats/summer', reset: true, wait: 1500 },
  { name: 'poles-huddle-small', hash: '#/world/poles/huddle/small', reset: true, wait: 1500 },
  { name: 'poles-huddle-blizzard', hash: '#/world/poles/huddle/blizzard?wind=right', reset: true, wait: 1500 },
  { name: 'poles-huddle-hatch', hash: '#/world/poles/huddle/hatch', reset: true, wait: 1500 },
  { name: 'poles-huddle-chick', hash: '#/world/poles/huddle/hatch?chick=hatched', reset: true, wait: 5000 },
  { name: 'poles-huddle-sunrise', hash: '#/world/poles/huddle/sunrise', reset: true, wait: 6000 },
  // The finale (greybox): Terry over each leg of the flight, the postcard at the colony, a question of each kind
  // (drag, spin, tap a pole, pick from the row) and the badge.
  ...['fly?leg=north', 'fly?leg=warm', 'fly?leg=south', 'deliver', 'quiz?q=bear', 'quiz?q=south&stars=2', 'quiz?q=coldest&stars=3', 'quiz?q=summer&stars=4', 'badge'].map((to) => ({
    name: `poles-party-${to.replace(/[?=&]/g, '-')}`,
    hash: `#/world/poles/party/${to}`,
    reset: true,
    wait: to === 'deliver' ? 3600 : 2500,
  })),
]

/** Auto-played runs (scripts/qa-pacing.mjs): talk before the first touch, talk per touch, the play strip. */
export const pacing = [
  { name: 'poles globe hub', id: 'poles', hash: '#/world/poles', reset: true },
  { name: 'poles ice floe hop', id: 'floe', hash: '#/world/poles/floe', reset: true },
  { name: 'poles penguin slide', id: 'slide', hash: '#/world/poles/slide', reset: true },
  { name: 'poles iceberg maker', id: 'iceberg', hash: '#/world/poles/iceberg', reset: true },
  { name: 'poles snow coats', id: 'coats', hash: '#/world/poles/coats', reset: true },
  // Emperor Huddle (greybox, no voices): the core verb is a drag, so the auto-player's taps only sing and poke; the cold
  // ones sneeze and waddle in by themselves, so it gets slowly through the small huddle. The robot run that drags them in
  // is qa-motion's poles-huddle-drag.
  { name: 'poles emperor huddle', id: 'huddle', hash: '#/world/poles/huddle', reset: true },
  // The finale: Terry's flight from the top (she steers; the robot just watches him fly).
  { name: 'poles pole to pole', id: 'party', hash: '#/world/poles/party/fly?stamps=all', reset: true },
]

/** Filmed moments (scripts/qa-motion.mjs): the core verbs, driven the way a child would. */
export const motion = []

// The Poles' globe (3D greybox): grab it and pull down so the Arctic rolls to the front (Pola hops and waves), flick it
// up past the middle to Antarctica (the world rolls over so the penguins stand up), back to the middle; then the sun
// dragged from summer up north down to summer in the south (the north goes dark: stars and the northern lights).
const polesDrag = async (page, path) => {
  const [x0, y0] = path[0]
  await page.mouse.move(vp.width * x0, vp.height * y0)
  await page.mouse.down()
  for (const [fx, fy, ms] of path.slice(1)) {
    await page.mouse.move(vp.width * fx, vp.height * fy, { steps: 10 })
    await page.waitForTimeout(ms)
  }
  await page.mouse.up()
}
motion.push(
  {
    name: 'poles-spin',
    seconds: 8,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/poles/hub/globe`)
      await page.waitForFunction(() => window.__polesGlobeQA?.().mode, null, { timeout: 20000 })
      await page.waitForTimeout(1000)
    },
    act: async (page) => {
      await polesDrag(page, [[0.5, 0.35], [0.52, 0.6, 60]])
      await page.waitForTimeout(2000)
      await polesDrag(page, [[0.5, 0.6], [0.5, 0.25, 0]])
      await page.waitForTimeout(2200)
      await polesDrag(page, [[0.5, 0.5], [0.3, 0.42, 0]])
    },
  },
  {
    // Ice Floe Hop: grab Pola, pull back (he crouches, the arc and ring show), let go: the leap and the landing thump on
    // the next floe; then a fling far off to the side: the belly-flop, the swim and the climb out.
    name: 'poles-floe-fling',
    seconds: 9,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/poles/floe/steady`)
      await page.waitForFunction(() => window.__polesFloeQA?.().mode, null, { timeout: 20000 })
      await page.waitForTimeout(1200)
    },
    act: async (page) => {
      const pull = async (dx, dy) => {
        const b = await page.locator('[data-anchor="pola"]').boundingBox()
        if (!b) throw new Error('no Pola')
        const x = b.x + b.width / 2
        const y = b.y + b.height / 2
        await page.mouse.move(x, y)
        await page.mouse.down()
        await page.mouse.move(x + dx, y + dy, { steps: 14 })
        await page.waitForTimeout(500)
        await page.mouse.up()
      }
      await pull(0, Math.min(110, vp.height * 0.18))
      await page.waitForTimeout(2000)
      await pull(Math.min(240, vp.width * 0.3), Math.min(60, vp.height * 0.1))
    },
  },
  {
    // Penguin Slide: Papa belly-sliding down the bumps (the wheel under her finger), held over to one side up the
    // snowbank (head first in the snow, feet wiggling), then let go: he pops out and drifts back to the middle.
    name: 'poles-slide-steer',
    seconds: 9,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/poles/slide/bumps`)
      await page.waitForFunction(() => window.__polesSlideQA?.().mode, null, { timeout: 20000 })
      await page.waitForTimeout(800)
    },
    act: async (page) => {
      const x = vp.width / 2
      const y = vp.height * 0.7
      await page.mouse.move(x, y)
      await page.mouse.down()
      await page.mouse.move(x - Math.min(70, vp.width * 0.08), y, { steps: 8 })
      await page.waitForTimeout(1500)
      await page.mouse.move(x + Math.min(120, vp.width * 0.14), y, { steps: 10 })
      await page.waitForTimeout(3500)
      await page.mouse.up()
    },
  },
  {
    // Iceberg Maker: the long crack tapped all the way (it creaks, leans out, groans), the giant drops with a splash and
    // a wave, rocks and settles, and the camera sinks under the waterline; then her finger pushes it down and lets go.
    name: 'poles-iceberg-giant',
    seconds: 14,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/poles/iceberg/giant?pole=north`)
      await page.waitForFunction(() => window.__polesIcebergQA?.().section, null, { timeout: 20000 })
      await page.waitForTimeout(1000)
    },
    act: async (page) => {
      for (let i = 0; i < 5; i++) {
        const b = await page.locator('[data-anchor="giant"]').boundingBox()
        if (!b) break
        await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
        await page.waitForTimeout(450)
      }
      await page.waitForFunction(() => window.__polesIcebergQA?.().under, null, { timeout: 12000 })
      await page.waitForTimeout(1500)
      const b = await page.locator('[data-anchor="berg"]').boundingBox()
      if (!b) throw new Error('no berg')
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
      await page.mouse.down()
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2 + vp.height * 0.25, { steps: 20 })
      await page.waitForTimeout(800)
      await page.mouse.up()
    },
  },
  {
    name: 'poles-sun',
    seconds: 6,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/poles/hub/sun?summer=north`)
      await page.waitForFunction(() => window.__polesGlobeQA?.().mode, null, { timeout: 20000 })
      await page.waitForTimeout(1200)
    },
    act: async (page) => {
      const b = await page.locator('[data-anchor="sun"]').boundingBox()
      if (!b) throw new Error('no sun')
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
      await page.mouse.down()
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2 + vp.height * 0.45, { steps: 30 })
      await page.waitForTimeout(2500)
      await page.mouse.up()
    },
  },
  {
    // The hub's lost penguin (hub greybox 2): carried to the top (the wrong pole: a look round, a "?", the bottom glows,
    // back onto the berg), then to the bottom, where the globe turns to show him home with Pebble.
    name: 'poles-lost',
    seconds: 11,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/poles/hub/lost?who=penguin`)
      await page.waitForFunction(() => window.__polesGlobeQA?.().lost === 'penguin:drift', null, { timeout: 20000 })
      await page.waitForTimeout(800)
    },
    act: async (page) => {
      const g = await page.locator('[data-anchor="globe"]').boundingBox()
      const carry = async (to) => {
        await page.waitForFunction(() => window.__polesGlobeQA?.().lost === 'penguin:drift', null, { timeout: 8000 })
        const b = await page.locator('[data-anchor="lost"]').boundingBox()
        if (!b || !g) throw new Error('no lost penguin')
        await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
        await page.mouse.down()
        await page.mouse.move(b.x + b.width / 2, g.y + g.height * to, { steps: 20 })
        await page.mouse.up()
      }
      await carry(0.06)
      await page.waitForTimeout(4200)
      await carry(0.94)
      await page.waitForTimeout(3000)
    },
  },
  {
    // The finale: her finger steers Terry left, right, left over the Arctic; the fish he flies over are his.
    name: 'poles-party-fly',
    seconds: 7,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/poles/party/fly?leg=north`)
      await page.waitForFunction(() => window.__polesPartyQA?.().mode, null, { timeout: 20000 })
      await page.waitForTimeout(1200)
    },
    act: async (page) => {
      for (const x of [0.2, 0.8, 0.3, 0.7]) {
        await page.mouse.move(vp.width * x, vp.height * 0.75)
        await page.mouse.down()
        await page.waitForTimeout(1400)
        await page.mouse.up()
      }
    },
  },
  {
    // Snow Coats (2D): her finger zigzags over the brown fox; the coat goes white where it goes and fluffs up, then the
    // rest puffs on by itself and the fox hops.
    name: 'poles-coats-rub',
    seconds: 6,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/poles/coats/fox`)
      await page.waitForFunction(() => window.__polesCoatsQA?.().section, null, { timeout: 20000 })
      await page.waitForTimeout(800)
    },
    act: async (page) => {
      const b = await page.locator('[data-k="fox-body"]').boundingBox()
      if (!b) throw new Error('no fox')
      await page.mouse.move(b.x, b.y + b.height * 0.25)
      await page.mouse.down()
      for (let r = 0; r <= 12; r++) await page.mouse.move(b.x + (r % 2 ? 0 : b.width), b.y + b.height * (0.25 + (0.65 * r) / 12), { steps: 14 })
      await page.mouse.up()
      await page.waitForTimeout(1500)
    },
  },
  {
    // Emperor Huddle (2D): the shivering dad alone on the windy edge lifted (feet paddling), carried into the middle and
    // let go: the huddle squishes to make room, everyone shuffles, and out of the wind he warms up (pink cheeks, a hop).
    name: 'poles-huddle-drag',
    seconds: 7,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/poles/huddle/small`)
      await page.waitForFunction(() => window.__polesHuddleQA?.().section, null, { timeout: 20000 })
      await page.waitForTimeout(800)
    },
    act: async (page) => {
      const a = await page.locator('[data-k="d0-body"]').boundingBox()
      const b = await page.locator('[data-k="d3-body"]').boundingBox()
      if (!a || !b) throw new Error('no penguins')
      await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
      await page.mouse.down()
      await page.mouse.move(b.x + b.width * 0.2, b.y + b.height * 0.4, { steps: 30 })
      await page.waitForTimeout(400)
      await page.mouse.up()
      await page.waitForTimeout(4000)
    },
  },
)

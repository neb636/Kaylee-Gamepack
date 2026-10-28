// The Poles' QA scenarios for the globe hub and the finale, picked up by scripts/qa-screens.mjs (screens),
// qa-pacing.mjs (pacing) and qa-motion.mjs (motion). Each activity keeps its own next to its sections.ts
// (activities/<id>/qa.mjs); sections no screen reaches get a plain screenshot anyway. Not part of the app: Node runs it, Vite never sees it.
import { vp } from '../../../../scripts/qa-lib.mjs'

/** Screenshots (scripts/qa-screens.mjs): how to get to each screen from a fresh start. */
export const screens = [
  // The Poles: the globe hub (greybox 1) from the middle, each pole, the sun out with summer up north, and the north in
  // its winter night; the lost penguin and the lost bear cub adrift (hub greybox 2).
  ...['globe', 'globe?side=north', 'globe?side=south', 'sun?summer=north', 'sun?side=north&summer=south', 'sun?side=south&summer=south', 'lost?who=penguin', 'lost?who=bear'].map((to) => ({
    name: `poles-${to.replace(/[?=&]/g, '-')}`,
    hash: `#/world/poles/hub/${to}`,
    reset: true,
    wait: 1800,
  })),
  // The finale : Terry over each leg of the flight, the postcard at the colony, a question of each kind
  // (drag, spin, tap a pole, pick from the row) and the badge (with every stamp, or the finale opens the globe).
  ...['fly?leg=north', 'fly?leg=warm', 'fly?leg=south', 'deliver', 'quiz?q=bear', 'quiz?q=south&stars=2', 'quiz?q=coldest&stars=3', 'quiz?q=summer&stars=4', 'badge'].map((to) => ({
    name: `poles-party-${to.replace(/[?=&]/g, '-')}`,
    hash: `#/world/poles/party/${to}${to.includes('?') ? '&' : '?'}stamps=all`,
    reset: true,
    wait: to === 'deliver' ? 3600 : 2500,
  })),
]

/** Auto-played runs (scripts/qa-pacing.mjs): talk before the first touch, talk per touch, the play strip. */
export const pacing = [
  { name: 'poles globe hub', id: 'poles', hash: '#/world/poles', reset: true },
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
      await page.goto(`${base}#/world/poles/party/fly?leg=north&stamps=all`)
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
)

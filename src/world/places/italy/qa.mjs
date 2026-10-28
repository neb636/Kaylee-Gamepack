// Italy's QA scenarios, picked up by scripts/qa-screens.mjs (screens), qa-pacing.mjs (pacing) and
// qa-motion.mjs (motion). A new activity can keep its own next to its sections.ts (activities/<id>/qa.mjs);
// sections no screen reaches get a plain screenshot anyway. Not part of the app: Node runs it, Vite never sees it.
import { skip, vp } from '../../../../scripts/qa-lib.mjs'

/** Screenshots (scripts/qa-screens.mjs): how to get to each screen from a fresh start. */
export const screens = [
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
  // Venice moments, opened by section link (#/world/sections): driving, a friend riding with the LEFT/RIGHT "go this
  // way" bubble, Gino's trip to the mask shop, the mirror mask, the night finale.
  ...['cruise', 'ride-1', 'trip', 'mask', 'finale'].map((to) => ({
    name: `venice-${to}`,
    hash: `#/world/italy/venice/${to}`,
    reset: true,
    wait: to === 'trip' ? 6000 : to === 'finale' ? 2500 : 1500,
  })),
  { name: 'etna-story', hash: '#/world/italy/etna', reset: true, wait: 400 },
  { name: 'etna-play', hash: '#/world/italy/etna', reset: true, act: async (p) => { await skip(p); await p.waitForTimeout(1800) } },
  // Etna moments, opened by section link: the lemon grove, the chestnut forest and stream, the cold (snow falling, the
  // scarf on its trail post), the snow drifts, the full cart going down, the granita stand and the piano payoff.
  ...['grove', 'forest', 'cold', 'snow', 'full', 'granita', 'payoff'].map((to) => ({
    name: `etna-${to}`,
    hash: `#/world/italy/etna/${to}`,
    reset: true,
    wait: to === 'payoff' ? 2500 : 1500,
  })),
  { name: 'italy-hub-stamps', hash: '#/world/italy', stampAll: 'italy' },
  { name: 'italy-opera', hash: '#/world/italy/party', stampAll: 'italy', act: async (p) => { await skip(p); await p.waitForTimeout(2500) } },
  // Opera moments, opened by section link: the owl, the solos, the wishing star, Lupa's high note, the jets' sky and
  // the picnic.
  ...['owl', 'solo', 'star', 'high', 'sky', 'picnic'].map((to) => ({
    name: `opera-${to}`,
    hash: `#/world/italy/party/${to}?stamps=all`,
    wait: to === 'star' ? 2600 : 1200,
  })),
  // The Pizzeria's later pizzas, straight from a link instead of three pizzas of play.
  ...['bufala?at=toppings', 'gino?at=cut', 'own?at=sauce&sauce=pink', 'own?at=oven', 'payoff'].map((to) => ({
    name: `pizzeria-${to.replace(/[?&=]+/g, '-')}`,
    hash: `#/world/italy/pizzeria/${to}`,
    reset: true,
    wait: 1500,
  })),
]

/** Auto-played runs (scripts/qa-pacing.mjs): talk before the first touch, talk per touch, the play strip. */
export const pacing = [
  { name: 'italy intro + map', id: 'italy', hash: '#/world/italy', reset: true, play: false },
  { name: 'italy pizzeria', id: 'pizzeria', hash: '#/world/italy/pizzeria', reset: true },
  { name: 'italy olive grove', id: 'olives', hash: '#/world/italy/olives', reset: true },
  { name: 'italy trevi fountain', id: 'trevi', hash: '#/world/italy/trevi', reset: true },
  { name: 'italy colosseum', id: 'colosseum', hash: '#/world/italy/colosseum', reset: true },
  { name: 'italy venice', id: 'venice', hash: '#/world/italy/venice', reset: true },
  { name: 'italy snow on a volcano', id: 'etna', hash: '#/world/italy/etna', reset: true },
  { name: 'italy opera (finale)', id: 'opera', hash: '#/world/italy/party', stampAll: 'italy' },
]

/** Filmed moments (scripts/qa-motion.mjs): the core verbs, driven the way a child would. */
export const motion = []

// Venice greybox: grab the gondola, pull it right (wake, tilt, the canal scrolls), then back left (the happy spin).
const veniceDrive = (name, seconds, moves) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/italy/venice/cruise`)
    await page.waitForTimeout(1400)
  },
  act: async (page) => {
    const b = await page.locator('[aria-label="gondola"]').boundingBox()
    if (!b) throw new Error('no gondola found')
    // The gondola element is its waterline anchor; grab just above it, on the hull.
    const x = b.x
    const y = b.y - 30
    await page.mouse.move(x, y)
    await page.mouse.down()
    for (const [dx, dy, ms] of moves) {
      const steps = Math.max(2, Math.round(ms / 40))
      await page.mouse.move(x + dx * vp.width, y + dy * vp.height, { steps })
      await page.waitForTimeout(ms)
    }
    await page.mouse.up()
  },
})
motion.push(
  veniceDrive('venice-drive', 3.2, [[0.3, 0, 1200], [0.3, -0.1, 600], [-0.35, -0.1, 900]]),
  veniceDrive('venice-coast', 2.4, [[0.35, 0, 450]]),
)

// Snow on a Volcano: grab Nino and lead him up the trail (trot, the cart rattles after him), then back the other way
// (he hops round and the cart swings round behind him); and in the cold, with snow falling.
const etnaDrive = (name, seconds, jump, moves) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/italy/etna/${jump}`)
    await page.waitForTimeout(1500)
  },
  act: async (page) => {
    const b = await page.locator('[aria-label="Nino"]').boundingBox()
    if (!b) throw new Error('no Nino found')
    // The Nino element is his hooves' anchor; grab him by the body.
    const x = b.x
    const y = b.y - 60
    await page.mouse.move(x, y)
    await page.mouse.down()
    for (const [dx, dy, ms] of moves) {
      const steps = Math.max(2, Math.round(ms / 40))
      await page.mouse.move(x + dx * vp.width, y + dy * vp.height, { steps })
      await page.waitForTimeout(ms)
    }
    await page.mouse.up()
  },
})
motion.push(
  etnaDrive('etna-trot', 3.2, 'grove', [[0.3, 0, 1200], [-0.3, 0, 1200]]),
  etnaDrive('etna-cold', 3.2, 'cold', [[0.25, 0, 900]]),
)

// Opera greybox: swing the conductor's wand (big swings bounce the band high, little ones sway), then stop (freeze).
const operaSwing = (name, seconds, size, ms) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/italy/party`)
    await page.waitForTimeout(600)
    await skip(page)
    await page.waitForTimeout(400)
  },
  act: async (page) => {
    const x = vp.width * 0.5
    const y = vp.height * 0.4
    await page.mouse.move(x, y)
    await page.mouse.down()
    for (let i = 0; i < 6; i++) {
      await page.mouse.move(x + (i % 2 ? -1 : 1) * size * vp.width, y + 10, { steps: 8 })
      await page.waitForTimeout(ms)
    }
    await page.mouse.up()
  },
})
motion.push(operaSwing('opera-forte', 3.4, 0.35, 280), operaSwing('opera-piano', 3.4, 0.05, 280))

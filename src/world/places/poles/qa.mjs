// The Poles' QA scenarios for the globe hub (the ending's are in activities/night/qa.mjs), picked up by scripts/qa-screens.mjs (screens),
// qa-pacing.mjs (pacing) and qa-motion.mjs (motion). Each activity keeps its own next to its sections.ts
// (activities/<id>/qa.mjs); sections no screen reaches get a plain screenshot anyway. Not part of the app: Node runs it, Vite never sees it.
import { vp } from '../../../../scripts/qa-lib.mjs'

/** The first two chapters' stamps in the passport (the balloon has moved on down the trail). */
const twoStamps = () => localStorage.setItem('kaylee-gamepack:/:world', JSON.stringify({ visited: ['poles'], stamps: { poles: ['floe', 'narwhal'] } }))

/** The whole story told: every stamp (the ending's too) and the Polar Explorer trophy (the movie ticket ends the trail). */
const told = () => {
  localStorage.setItem('kaylee-gamepack:/:world', JSON.stringify({ visited: ['poles'], stamps: { poles: ['floe', 'narwhal', 'coats', 'slide', 'night'] } }))
  const now = new Date().toISOString()
  localStorage.setItem('kaylee-gamepack:/:trophies', JSON.stringify([{ gameId: 'world-poles', gameTitle: 'The Poles', trophyTitle: 'Polar Explorer', emoji: '🐧', firstEarnedAt: now, lastEarnedAt: now, count: 1 }]))
}

/** Screenshots (scripts/qa-screens.mjs): how to get to each screen from a fresh start. */
export const screens = [
  // The Poles: the globe hub, the map of the story. With no stamps (the balloon over the first stop): the whole globe
  // and its trail, each pole (Pola and Pebble up north, Papa down south), the sun out with summer up north, and the
  // north in its winter night. Then the trail with two stamps in, arriving from the map (the globe has turned by
  // itself to the balloon), and with every stamp (home glows).
  ...['globe', 'globe?side=north', 'globe?side=south', 'sun?summer=north', 'sun?side=north&summer=south', 'sun?side=south&summer=south'].map((to) => ({
    name: `poles-${to.replace(/[?=&]/g, '-')}`,
    hash: `#/world/poles/hub/${to}`,
    reset: true,
    wait: to === 'globe' ? 3500 : 1800,
  })),
  ...['globe', 'globe?side=north'].map((to) => ({ name: `poles-two-stamps-${to.replace(/[?=&]/g, '-')}`, hash: `#/world/poles/hub/${to}`, reset: true, seed: twoStamps, wait: 1800 })),
  { name: 'poles-two-stamps-arrive', hash: '#/world/poles', reset: true, seed: twoStamps, wait: 5200 },
  { name: 'poles-story-told', hash: '#/world/poles/hub/globe', reset: true, seed: told, wait: 1800 },
  ...['globe', 'globe?side=south'].map((to) => ({ name: `poles-all-stamps-${to.replace(/[?=&]/g, '-')}`, hash: `#/world/poles/hub/${to}${to.includes('?') ? '&' : '?'}stamps=all`, reset: true, wait: 1800 })),
]

/** Auto-played runs (scripts/qa-pacing.mjs): talk before the first touch, talk per touch, the play strip. */
export const pacing = [
  { name: 'poles globe hub', id: 'poles', hash: '#/world/poles/hub/globe', reset: true },
]

/** Filmed moments (scripts/qa-motion.mjs): the core verbs, driven the way a child would. */
export const motion = []

// The Poles' globe: grab it and pull down so the Arctic rolls to the front (Pola and Pebble hop), flick it up past the
// middle to Antarctica (the world rolls over so Papa stands up), back to the middle; the sun dragged from summer up north
// down to summer in the south (the north goes dark: stars and the northern lights); a picture on the trail picked from
// the whole globe (it rolls to that stop's pole, then the chapter opens); arriving with two stamps (the globe swings the
// trail round and rolls to the balloon) and poking who is there.
let arriveBase = ''
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
    // A picture on the trail: from the whole globe she picks the slide (a southern stop, the next one once the north's
    // three are done; the story goes in order the first time): the globe rolls over to Antarctica with the trail in
    // front, then the chapter opens (its way-in film).
    name: 'poles-stop',
    seconds: 6,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/poles/hub/globe`)
      await page.evaluate(() => localStorage.setItem('kaylee-gamepack:/:world', JSON.stringify({ visited: ['poles'], stamps: { poles: ['floe', 'narwhal', 'coats'] } })))
      await page.reload()
      await page.waitForFunction(() => window.__polesGlobeQA?.().mode, null, { timeout: 20000 })
      await page.waitForTimeout(1200)
    },
    act: async (page) => {
      await page.locator('[data-activity="slide"]').click({ force: true })
      await page.waitForTimeout(4000)
    },
  },
  {
    // Arriving with two stamps: the globe swings the trail to the front, then rolls to the balloon's pole by itself.
    // Then she pokes who is there: Pebble, Pola, the balloon, and a tap on the sky for snowflakes.
    name: 'poles-arrive',
    seconds: 10,
    setup: async (page, base) => {
      await page.goto(`${base}#/blank`)
      await page.evaluate(twoStamps)
      arriveBase = base
    },
    act: async (page) => {
      await page.goto(`${arriveBase}#/world/poles`)
      await page.waitForFunction(() => window.__polesGlobeQA?.().side === 'north', null, { timeout: 20000 })
      await page.waitForTimeout(1500)
      for (const id of ['pebble', 'pola', 'balloon']) {
        await page.locator(`[data-anchor="${id}"]`).click({ force: true })
        await page.waitForTimeout(1100)
      }
      await page.mouse.click(vp.width * 0.12, vp.height * 0.3)
      await page.waitForTimeout(1200)
    },
  },
)

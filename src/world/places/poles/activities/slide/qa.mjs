// Penguin Slide's QA scenarios (scripts/qa-screens.mjs, qa-pacing.mjs, qa-motion.mjs pick them up next to the Poles' own
// qa.mjs). Not part of the app: Node runs it, Vite never sees it.
import { vp } from '../../../../../../scripts/qa-lib.mjs'

const ready = (page) => page.waitForFunction(() => window.__polesSlideQA?.().mode, null, { timeout: 20000 })
const qa = (page) => page.evaluate(() => window.__polesSlideQA())

/** Steers the way a child would, for `ms`: a finger down low in the middle, pushed toward whatever `aim(state)` says
 *  to go for (a lat in meters; null = let him drift). Looks again five times a second. */
async function chase(page, ms, aim) {
  const x = vp.width / 2
  const y = vp.height * 0.72
  const reach = Math.min(110, vp.width * 0.13)
  await page.mouse.move(x, y)
  await page.mouse.down()
  const until = Date.now() + ms
  while (Date.now() < until) {
    const s = await qa(page)
    const want = aim(s)
    const push = want == null ? 0 : Math.max(-1, Math.min(1, (want - s.lat) / 2.5))
    await page.mouse.move(x + push * reach, y, { steps: 3 })
    await page.waitForTimeout(200)
  }
  await page.mouse.up()
}

/** Screenshots: how to get to each screen from a fresh start. */
export const screens = [
  // Each stretch from its link (Sparkle in the corner): the top with the first maybe-Pebble ahead, the bumps in the
  // woolly hat, the sea, the ice edge with the Adélies cheering; then the stamp and the Adélie sticker.
  ...['top', 'bumps?run=right&looked=askh', 'dive', 'home?krill=12&looked=askhbf'].map((to) => ({
    name: `poles-slide-${to.replace(/[?=&]/g, '-')}`,
    hash: `#/world/poles/slide/${to}`,
    reset: true,
    wait: 500,
    // (Once the world is up, however long a busy machine takes to load it.)
    act: async (page) => {
      await ready(page)
      await page.waitForTimeout(to.startsWith('home') ? 3000 : 1800)
    },
  })),
  // The things beside the way: the elephant seal and the sleeping seal on the gentle slope, the science station,
  // the humpback and the buoy under the sea, his look up at the sky.
  {
    name: 'poles-slide-seals',
    hash: '#/world/poles/slide/top',
    reset: true,
    wait: 1000,
    act: async (page) => {
      await ready(page)
      await page.waitForFunction(() => window.__polesSlideQA().s > 100, null, { timeout: 60000 })
    },
  },
  {
    name: 'poles-slide-station',
    hash: '#/world/poles/slide/bumps',
    reset: true,
    wait: 1000,
    act: async (page) => {
      await ready(page)
      await page.waitForFunction(() => window.__polesSlideQA().s > 250, null, { timeout: 60000 })
    },
  },
  {
    name: 'poles-slide-whale',
    hash: '#/world/poles/slide/dive',
    reset: true,
    wait: 1000,
    act: async (page) => {
      await ready(page)
      await page.waitForFunction(() => window.__polesSlideQA().s > 665, null, { timeout: 90000 })
    },
  },
  {
    name: 'poles-slide-sky',
    hash: '#/world/poles/slide/home?krill=12&looked=askhbf',
    reset: true,
    wait: 500,
    act: async (page) => {
      await page.waitForFunction(() => window.__polesSlideQA?.().home, null, { timeout: 40000 })
      await page.waitForTimeout(3200)
    },
  },
  { name: 'poles-slide-stamp', hash: '#/world/poles/slide/home?krill=12', reset: true, wait: 16000 },
]

/** Auto-played runs: talk before the first touch, talk per touch, the play strip. */
export const pacing = [{ name: 'poles penguin slide', id: 'slide', hash: '#/world/poles/slide/top', reset: true }]

/** Filmed moments: the core verb, driven the way a child would. */
export const motion = [
  {
    // The gentle slope from the top: she steers for the gold star (the snowy heap that might be Pebble), he hops over
    // it and an Adélie shakes the snow off; then on toward the sleeping seal.
    name: 'poles-slide-look',
    seconds: 15,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/poles/slide/top`)
      await ready(page)
      await page.waitForTimeout(600)
    },
    act: (page) => chase(page, 14000, (s) => s.nextLook?.lat ?? null),
  },
  {
    // Papa belly-sliding down the bumps (the wheel under her finger), held over to one side up the snowbank (head
    // first in the snow, feet wiggling), then let go: he pops out and drifts back to the middle.
    name: 'poles-slide-steer',
    seconds: 9,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/poles/slide/bumps`)
      await ready(page)
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
    // Under the sea: the same wheel steers him to the swarms of krill and up to the round grey buoy (bong!).
    name: 'poles-slide-dive',
    seconds: 14,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/poles/slide/dive`)
      await ready(page)
      await page.waitForTimeout(600)
    },
    act: (page) => chase(page, 13000, (s) => (s.nextLook && s.nextLook.s - s.s < 16 ? s.nextLook.lat : s.nextKrill)),
  },
  {
    // The ice edge: he leaps out with his tummy full, the Adélies gather and cheer, he looks up at the sky.
    name: 'poles-slide-home',
    seconds: 8,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/poles/slide/home?krill=12&looked=askhbf`)
      await ready(page)
    },
    act: async (page) => {
      await page.waitForTimeout(7000)
    },
  },
]

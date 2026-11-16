// The Longest Night's QA scenarios (scripts/qa-screens.mjs, qa-pacing.mjs, qa-motion.mjs pick them up next to the
// Poles' own qa.mjs). Not part of the app: Node runs it, Vite never sees it. Act 2 is 3D: the robot finds Pebble on
// screen through window.__polesNightQA() (chorus.ts `qa`).

const ready = async (page, base, hash) => {
  await page.goto(`${base}${hash}`)
  await page.waitForFunction(() => window.__polesNightQA?.().section, null, { timeout: 60000 })
  await page.waitForTimeout(1500)
}
const state = (page) => page.evaluate(() => window.__polesNightQA())
/** Holds Pebble for `ms` and lets go, the way a finger does. */
async function sing(page, ms) {
  const p = (await state(page)).pebble
  await page.mouse.move(p.x, p.y)
  await page.mouse.down()
  await page.waitForTimeout(ms)
  await page.mouse.up()
}

/** Screenshots: how to get to each screen from a fresh start. */
export const screens = [
  { name: 'poles-night-whiteout', hash: '#/world/poles/night/whiteout', reset: true, wait: 4000 },
  { name: 'poles-night-edge', hash: '#/world/poles/night/edge', reset: true, wait: 4000 },
  { name: 'poles-night-together', hash: '#/world/poles/night/together', reset: true, wait: 5000 },
]

/** Auto-played runs: talk before the first touch, talk per touch, the play strip. */
export const pacing = [
  // Sing in the Dark: Sparkle's one line, then the hold. The auto-player's taps on Pebble are peeps (little rings),
  // which find the near friends; a friend the rings keep missing answers anyway after a few, so it gets through.
  { name: 'poles sing in the dark', id: 'night', hash: '#/world/poles/night/whiteout', reset: true },
]

/** Filmed moments: the core verb, driven the way a child would. */
export const motion = [
  {
    // The core verb: hold Pebble (the dashed circle grows), let go, and the ring rolls across the whiteout: it lights
    // Pola up white in the white, finds the woolly hat (it flips onto Pebble's head), then a bigger one finds Terry
    // upside down in a drift, who joins in.
    name: 'poles-night-whiteout',
    seconds: 16,
    setup: async (page, base) => ready(page, base, '#/world/poles/night/whiteout'),
    act: async (page) => {
      await sing(page, 900)
      await page.waitForTimeout(3500)
      await sing(page, 2000)
      await page.waitForTimeout(6000)
    },
  },
  {
    // The ice edge: the Weddell seal pops up through her hole, the Adelies hop out of their drift, and a full hold
    // reaches the humpback far out in the dark sea. Every friend adds a band of color and a voice.
    name: 'poles-night-edge',
    seconds: 18,
    setup: async (page, base) => ready(page, base, '#/world/poles/night/edge'),
    act: async (page) => {
      await sing(page, 1400)
      await page.waitForTimeout(4500)
      await sing(page, 2400)
      await page.waitForTimeout(7000)
    },
  },
  {
    // The payoff: one long, long hold (the preview turns gold), the rainbow ring rolls over the hills to the colony,
    // silence, then Papa's gold ring and his song come back.
    name: 'poles-night-together',
    seconds: 24,
    setup: async (page, base) => ready(page, base, '#/world/poles/night/together'),
    act: async (page) => {
      await page.waitForTimeout(2500)
      await sing(page, 2800)
      await page.waitForTimeout(18000)
    },
  },
]

// Narwhal Ride's QA scenarios (scripts/qa-screens.mjs, qa-pacing.mjs, qa-motion.mjs pick them up next to the Poles' own
// qa.mjs). Not part of the app: Node runs it, Vite never sees it.
import { vp } from '../../../../../../scripts/qa-lib.mjs'

/** Screenshots: how to get to each screen from a fresh start. */
export const screens = [
  // Narwhal Ride: the look at the three of them at the start, each stretch from its link a few seconds in (Sparkle in
  // the corner), each channel round the big icebergs, at the balloon, then the stamp and the narwhal sticker.
  { name: 'poles-narwhal-start', hash: '#/world/poles/narwhal/open', reset: true, wait: 900 },
  ...['open', 'bergs', 'bergs?channel=left', 'bergs?channel=right', 'under', 'glacier', 'balloon?fish=14'].map((to) => ({
    name: `poles-narwhal-${to.replace(/[?=&]/g, '-')}`,
    hash: `#/world/poles/narwhal/${to}`,
    reset: true,
    wait: to.startsWith('bergs?') ? 14000 : to === 'under' ? 6500 : to === 'glacier' ? 8600 : to.startsWith('balloon') ? 9000 : 4500,
  })),
  { name: 'poles-narwhal-stamp', hash: '#/world/poles/narwhal/balloon?fish=14', reset: true, wait: 22000 },
]

/** Auto-played runs: talk before the first touch, talk per touch, the play strip. */
export const pacing = [{ name: 'poles narwhal ride', id: 'narwhal', hash: '#/world/poles/narwhal/open', reset: true }]

const ready = async (page, base, to) => {
  await page.goto(`${base}#/world/poles/narwhal/${to}`)
  await page.waitForFunction(() => window.__polesNarwhalQA?.().mode === 'swim', null, { timeout: 20000 })
  await page.waitForTimeout(400)
}
/** A child's steering: finger down low on the screen, pushed left and right of where it went down, held, let go. */
const steer = async (page, pushes) => {
  const x = vp.width / 2
  const y = vp.height * 0.72
  const reach = Math.min(110, vp.width * 0.13)
  await page.mouse.move(x, y)
  await page.mouse.down()
  for (const [k, ms] of pushes) {
    await page.mouse.move(x + k * reach, y + (Math.abs(k) > 0.5 ? 6 : 0), { steps: 8 })
    await page.waitForTimeout(ms)
  }
  await page.mouse.up()
}

/** Filmed moments: the core verb, driven the way a child would. */
export const motion = [
  {
    // Open water: weaving between the floes (one bumped: boing), a school of fish scooped up, then over the first ramp
    // of ice and the splash back down; let go, and Nari drifts back to the middle.
    name: 'poles-narwhal-open',
    seconds: 16,
    setup: (page, base) => ready(page, base, 'open'),
    act: async (page) => {
      await steer(page, [[0.8, 1400], [-0.9, 2600], [0.6, 1800], [0, 600]])
      await page.waitForTimeout(600)
      await steer(page, [[-0.7, 1500], [0.9, 2200], [-0.5, 1600]])
      await page.waitForTimeout(2500)
    },
  },
  {
    // Among the icebergs: the slalom, then steered into the right channel and over its jump.
    name: 'poles-narwhal-bergs',
    seconds: 18,
    setup: (page, base) => ready(page, base, 'bergs'),
    act: async (page) => {
      await steer(page, [[0.9, 1800], [-0.9, 2200], [0.9, 2400]])
      await page.waitForTimeout(500)
      await steer(page, [[1, 3000], [0.4, 3000], [1, 2500]])
      await page.waitForTimeout(1500)
    },
  },
  {
    // Under the sea ice: Nari dips under the bridge (the riders' bubble), round the hanging keels, through the fish,
    // the belugas alongside, and up through the hole with a splash.
    name: 'poles-narwhal-under',
    seconds: 19,
    setup: (page, base) => ready(page, base, 'under'),
    act: async (page) => {
      await page.waitForTimeout(2500)
      await steer(page, [[-0.8, 2000], [0.8, 2400], [-0.7, 2200], [0.3, 1500]])
      await page.waitForTimeout(6000)
    },
  },
  {
    // The glacier: a jump, the wall cracks and a new iceberg drops in, the waves lift her, then on to the balloon.
    name: 'poles-narwhal-glacier',
    seconds: 34,
    setup: (page, base) => ready(page, base, 'glacier'),
    act: async (page) => {
      await steer(page, [[-0.6, 1500], [0.3, 1500]])
      await page.waitForTimeout(4000)
      await steer(page, [[0.8, 2000], [-0.8, 2500], [0.5, 2000]])
      await page.waitForTimeout(2000)
      await steer(page, [[-0.7, 2000], [0.7, 2500]])
      await page.waitForFunction(() => window.__polesNarwhalQA?.().done, null, { timeout: 30000 })
      await page.waitForTimeout(2500)
    },
  },
]

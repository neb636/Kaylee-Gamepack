// Ice Floe Hop's QA scenarios (scripts/qa-screens.mjs, qa-pacing.mjs, qa-motion.mjs pick them up next to the Poles' own
// qa.mjs). Not part of the app: Node runs it, Vite never sees it.
import { vp } from '../../../../../../scripts/qa-lib.mjs'

/** Screenshots: how to get to each screen from a fresh start. */
export const screens = [
  // Ice Floe Hop (greybox 2): Mama far away, then each stage's first floe, and home with Mama (the hug, then the look back).
  ...['story', 'steady', 'drift', 'melt', 'mama'].map((to) => ({ name: `poles-floe-${to}`, hash: `#/world/poles/floe/${to}`, reset: true, wait: to === 'mama' ? 4200 : 1800 })),
]

/** Auto-played runs: talk before the first touch, talk per touch, the play strip. */
export const pacing = [
  { name: 'poles ice floe hop', id: 'floe', hash: '#/world/poles/floe', reset: true },
]

/** Filmed moments: the core verb, driven the way a child would. */
export const motion = [
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
]

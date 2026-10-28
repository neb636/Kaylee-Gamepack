// Penguin Slide's QA scenarios (scripts/qa-screens.mjs, qa-pacing.mjs, qa-motion.mjs pick them up next to the Poles' own
// qa.mjs). Not part of the app: Node runs it, Vite never sees it.
import { vp } from '../../../../../../scripts/qa-lib.mjs'

/** Screenshots: how to get to each screen from a fresh start. */
export const screens = [
  // Penguin Slide: the story on a fresh start (Pebble is hungry), each stretch from its link (Sparkle in the corner),
  // the feeding at home, then the stamp and the Adélie sticker.
  { name: 'poles-slide-story', hash: '#/world/poles/slide/story', reset: true, wait: 1500 },
  ...['top', 'bumps?run=right', 'dive', 'home?krill=12'].map((to) => ({ name: `poles-slide-${to.replace(/[?=&]/g, '-')}`, hash: `#/world/poles/slide/${to}`, reset: true, wait: to.startsWith('home') ? 3000 : 2500 })),
  { name: 'poles-slide-stamp', hash: '#/world/poles/slide/home?krill=12', reset: true, wait: 15000 },
]

/** Auto-played runs: talk before the first touch, talk per touch, the play strip. */
export const pacing = [
  { name: 'poles penguin slide', id: 'slide', hash: '#/world/poles/slide/story', reset: true },
]

/** Filmed moments: the core verb, driven the way a child would. */
export const motion = [
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
]

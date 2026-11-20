// Canada's QA scenarios, picked up by scripts/qa-screens.mjs (screens), qa-pacing.mjs (pacing) and
// qa-motion.mjs (motion). A new activity can keep its own next to its sections.ts (activities/<id>/qa.mjs);
// sections no screen reaches get a plain screenshot anyway. Not part of the app: Node runs it, Vite never sees it.
import { vp } from '../../../../scripts/qa-lib.mjs'

/** Screenshots (scripts/qa-screens.mjs): how to get to each screen from a fresh start. */
export const screens = [
  // Canada: all activity pins on the 3D country map, including older region links.
  { name: 'canada-intro', hash: '#/world/canada', reset: true, wait: 900 },
  ...['msa', 'quebec', 'ottawa', 'prairies', 'banff', 'rockies', 'bc'].map((at) => ({ name: `canada-map-${at}`, hash: `#/world/canada/hub/map?at=${at}`, reset: true, wait: 2200 })),
  // Red Canoe: each part from its link (glide both ways to paddle), the loon family at the glacier.
  ...['glide', 'glide?paddle=pull', 'stream', 'loon', 'glacier'].map((to) => ({ name: `canada-canoe-${to.replace(/[?=&]/g, '-')}`, hash: `#/world/canada/canoe/${to}`, reset: true, wait: to.startsWith('glide') ? 4000 : 3000 })),
]

/** Auto-played runs (scripts/qa-pacing.mjs): talk before the first touch, talk per touch, the play strip. */
export const pacing = [
  { name: 'canada pin map', id: 'canada', hash: '#/world/canada', reset: true },
  // Red Canoe: the core verb is a stroke (a drag beside the canoe), so the auto-player's taps only
  // splash, poke and make trout jump; the robot run that paddles is qa-motion's canada-canoe-stroke.
  { name: 'canada red canoe', id: 'canoe', hash: '#/world/canada/canoe', reset: true },
]

/** Filmed moments (scripts/qa-motion.mjs): the core verbs, driven the way a child would. */
export const motion = []


// (Campfire Night's are in activities/campfire/qa.mjs.)

// Red Canoe: long paddle strokes from the dock, alternating left and right of the canoe (it glides off,
// zigzagging gently), then two on the left only (it turns right) and the blade held still on the right (it brakes and
// turns that way).
motion.push({
  name: 'canada-canoe-stroke',
  seconds: 10,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/canada/canoe/glide`)
    await page.waitForFunction(() => window.__canadaCanoeQA?.().section, null, { timeout: 20000 })
    await page.waitForTimeout(3500)
  },
  act: async (page) => {
    const reach = Math.min(130, vp.width * 0.14)
    for (const side of [-1, 1, -1, 1, -1, -1]) {
      const { canoe } = await page.evaluate(() => window.__canadaCanoeQA())
      await page.mouse.move(canoe.x + side * reach, canoe.y - reach * 0.8)
      await page.mouse.down()
      await page.mouse.move(canoe.x + side * reach, canoe.y + reach, { steps: 12 })
      await page.mouse.up()
      await page.waitForTimeout(350)
    }
    const { canoe } = await page.evaluate(() => window.__canadaCanoeQA())
    await page.mouse.move(canoe.x + reach, canoe.y)
    await page.mouse.down()
    await page.mouse.move(canoe.x + reach, canoe.y + 20, { steps: 3 })
    await page.waitForTimeout(1500)
    await page.mouse.up()
  },
})


// Snow Coats's QA scenarios (scripts/qa-screens.mjs, qa-pacing.mjs, qa-motion.mjs pick them up next to the Poles' own
// qa.mjs). Not part of the app: Node runs it, Vite never sees it.

/** Screenshots: how to get to each screen from a fresh start. */
export const screens = [
  // Snow Coats (greybox 5, 2D): the brown fox in late summer, hide and seek (half painted), the summer.
  { name: 'poles-coats-fox', hash: '#/world/poles/coats/fox', reset: true, wait: 1500 },
  { name: 'poles-coats-hide', hash: '#/world/poles/coats/hide?painted=fox,hare', reset: true, wait: 1500 },
  { name: 'poles-coats-summer', hash: '#/world/poles/coats/summer', reset: true, wait: 1500 },
]

/** Auto-played runs: talk before the first touch, talk per touch, the play strip. */
export const pacing = [
  // The section link (the activity rewrites a bare #/world/poles/coats to it, and the robot waits for its own hash).
  // Its taps only poke (the verb is a rub), so it never finishes: the rub is qa-motion's poles-coats-rub.
  { name: 'poles snow coats', id: 'coats', hash: '#/world/poles/coats/fox', reset: true },
]

/** Filmed moments: the core verb, driven the way a child would. */
export const motion = [
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
]

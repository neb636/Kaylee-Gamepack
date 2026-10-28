// Sugar Snow's own QA scenarios (the section screens and the pour filmstrip are in canada/qa.mjs): the story beat
// (Maple and her cousin), the orders with only the moose still hungry, and a poke on every friend at the table.
// Node runs it, Vite never sees it.

/** Screenshots (scripts/qa-screens.mjs). */
export const screens = [
  { name: 'taffy-story', hash: '#/world/canada/taffy/story', reset: true, wait: 1200 },
  { name: 'taffy-orders-all-but-moose', hash: '#/world/canada/taffy/orders?made=9&fed=chipmunk,cousin,owl', reset: true, wait: 1500 },
]

/** Filmed moments (scripts/qa-motion.mjs): each friend reacts to a poke its own way (Maple waves, the owl spins). */
export const motion = [
  {
    name: 'taffy-pokes',
    seconds: 7,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/taffy/orders`)
      await page.waitForFunction(() => window.__canadaTaffyQA?.().section, null, { timeout: 20000 })
      await page.waitForTimeout(600)
    },
    act: async (page) => {
      const at = (x, y) =>
        page.evaluate(([x, y]) => {
          const svg = document.querySelector('svg[aria-label="Pour maple syrup on the snow"]')
          const p = new DOMPoint(x, y).matrixTransform(svg.getScreenCTM())
          return [p.x, p.y]
        }, [x, y])
      // The wide stage's line-up: Maple, the chipmunk, the cousin, the owl, the moose.
      for (const [x, y] of [[410, 178], [590, 212], [770, 205], [960, 205], [1200, 195]]) {
        await page.mouse.click(...(await at(x, y)))
        await page.waitForTimeout(1100)
      }
    },
  },
]

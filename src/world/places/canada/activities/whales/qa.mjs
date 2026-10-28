// Whale Watch's own QA scenarios (the other whale screens and canada-whales-steer are in canada/qa.mjs): the story at
// the dock (Maple at the wheel on the rig, in her life jacket), and a filmed run where the boat drives into a whale that
// comes up in its way (it bumps off now) and then chases the orcas, turning hard so the baby copies her.
// Not part of the app: Node runs it, Vite never sees it.

/** Screenshots (scripts/qa-screens.mjs). */
export const screens = [
  { name: 'canada-whales-story', hash: '#/world/canada/whales/story', reset: true, wait: 3200 },
]

/** Filmed moments (scripts/qa-motion.mjs). */
export const motion = [
  {
    name: 'canada-whales-orcas',
    seconds: 8,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/whales/orcas`)
      await page.waitForFunction(() => window.__canadaWhalesQA?.().orcas, null, { timeout: 20000 })
      await page.waitForTimeout(1200)
    },
    act: async (page) => {
      const vp = page.viewportSize()
      // Hold the water far ahead, then swing the finger left and right (the baby copies the turns).
      const x = vp.width / 2
      const y = vp.height * 0.3
      await page.mouse.move(x, y)
      await page.mouse.down()
      for (let i = 0; i < 70; i++) {
        await page.mouse.move(x + Math.sin(i / 9) * vp.width * 0.35, y)
        await page.waitForTimeout(100)
      }
      await page.mouse.up()
    },
  },
]

// Animal Bridge's own QA scenarios (the section screens and the lead are in canada/qa.mjs): Maple's story on the bare
// link, and the lost calf: mama elk led over the bridge, the littlest calf stops to sniff its flower, and her finger
// fetches it over to its family. Not part of the app: Node runs it, Vite never sees it.

/** Screenshots (scripts/qa-screens.mjs). */
export const screens = [{ name: 'canada-bridge-story', hash: '#/world/canada/bridge', reset: true, wait: 1500 }]

/** Filmstrips (scripts/qa-motion.mjs). */
export const motion = [
  {
    name: 'canada-bridge-calf',
    seconds: 12,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/bridge/elk`)
      await page.waitForFunction(() => window.__canadaBridgeQA?.().section, null, { timeout: 20000 })
      await page.waitForTimeout(600)
    },
    act: async (page) => {
      const q = await page.evaluate(() => window.__canadaBridgeQA())
      await page.mouse.move(q.fams.elk.x, q.fams.elk.y)
      await page.mouse.down()
      for (const p of [{ x: q.bridge.left.x - 40, y: q.bridge.left.y + 40 }, q.bridge.left, q.bridge.middle, q.bridge.right, q.meadow]) {
        await page.mouse.move(p.x, p.y, { steps: 16 })
        await page.waitForTimeout(300)
      }
      await page.mouse.up()
      await page.waitForTimeout(1200)
      // The lost calf: from its flower, over the bridge, to its family.
      const r = await page.evaluate(() => window.__canadaBridgeQA())
      if (!r.calf) return
      await page.mouse.move(r.calf.x, r.calf.y)
      await page.mouse.down()
      for (const p of [r.bridge.left, r.bridge.middle, r.bridge.right, r.meadow]) {
        await page.mouse.move(p.x, p.y, { steps: 16 })
        await page.waitForTimeout(300)
      }
      await page.mouse.up()
    },
  },
]

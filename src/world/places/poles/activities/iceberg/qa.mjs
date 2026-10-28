// Iceberg Maker's QA scenarios (scripts/qa-screens.mjs, qa-pacing.mjs, qa-motion.mjs pick them up next to the Poles' own
// qa.mjs). Not part of the app: Node runs it, Vite never sees it.
import { vp } from '../../../../../../scripts/qa-lib.mjs'

/** Screenshots: how to get to each screen from a fresh start. */
export const screens = [
  // Iceberg Maker (greybox 4): the pick, then each stretch at both poles from its link (sail: the camera turned round,
  // looking out to sea from the cliff top).
  { name: 'poles-iceberg-pick', hash: '#/world/poles/iceberg/pick', reset: true, wait: 1800 },
  ...['bits', 'giant', 'sail'].flatMap((to) => ['north', 'south'].map((pole) => ({ name: `poles-iceberg-${to}-${pole}`, hash: `#/world/poles/iceberg/${to}?pole=${pole}`, reset: true, wait: to === 'sail' ? 3000 : 1800 }))),
]

/** Auto-played runs: talk before the first touch, talk per touch, the play strip. */
export const pacing = [
  { name: 'poles iceberg maker', id: 'iceberg', hash: '#/world/poles/iceberg', reset: true },
]

/** Filmed moments: the core verb, driven the way a child would. */
export const motion = [
  {
    // Iceberg Maker: the long crack tapped all the way (it creaks, leans out, groans), the giant drops with a splash and
    // a wave, rocks and settles, and the camera sinks under the waterline; then her finger pushes it down and lets go.
    name: 'poles-iceberg-giant',
    seconds: 14,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/poles/iceberg/giant?pole=north`)
      await page.waitForFunction(() => window.__polesIcebergQA?.().section, null, { timeout: 20000 })
      await page.waitForTimeout(1000)
    },
    act: async (page) => {
      for (let i = 0; i < 5; i++) {
        const b = await page.locator('[data-anchor="giant"]').boundingBox()
        if (!b) break
        await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
        await page.waitForTimeout(450)
      }
      await page.waitForFunction(() => window.__polesIcebergQA?.().under, null, { timeout: 12000 })
      await page.waitForTimeout(1500)
      const b = await page.locator('[data-anchor="berg"]').boundingBox()
      if (!b) throw new Error('no berg')
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
      await page.mouse.down()
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2 + vp.height * 0.25, { steps: 20 })
      await page.waitForTimeout(800)
      await page.mouse.up()
    },
  },
]

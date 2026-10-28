// Salmon Leap's own QA scenarios (format: scripts/qa-lib.mjs; Canada's shared ones are in ../../qa.mjs).
import { vp } from '../../../../../../scripts/qa-lib.mjs'

/** Flicks the waiting salmon up `n` times: grab it, a quick flick up and to the right, let go. */
async function flicks(page, n, gap = 1300) {
  for (let i = 0; i < n; i++) {
    const q = await page.evaluate(() => window.__canadaSalmonQA())
    if (!q.waiting) break
    await page.mouse.move(q.waiting.x, q.waiting.y)
    await page.mouse.down()
    await page.waitForTimeout(60)
    await page.mouse.move(q.waiting.x + vp.width * 0.06, q.waiting.y - vp.height * 0.12, { steps: 5 })
    await page.mouse.up()
    await page.waitForTimeout(gap)
  }
}

const ready = (page) => page.waitForFunction(() => window.__canadaSalmonQA?.().section, null, { timeout: 20000 })

export const screens = [
  // The story: Maple at the river.
  { name: 'canada-salmon-story', hash: '#/world/canada/salmon/story', reset: true, wait: 900 },
  // The payoff: every salmon has laid its eggs, and spring has come (the eggs wobble, ready to hatch).
  {
    name: 'canada-salmon-eggs-spring',
    hash: '#/world/canada/salmon/eggs',
    reset: true,
    act: async (page) => {
      await ready(page)
      await page.waitForTimeout(500)
      for (let i = 0; i < 14; i++) {
        const q = await page.evaluate(() => window.__canadaSalmonQA())
        if (q.phase !== 'lay' || !q.waiting) break
        await page.mouse.click(q.waiting.x, q.waiting.y)
        await page.waitForTimeout(250)
      }
      await page.waitForTimeout(6500)
    },
  },
]

export const motion = [
  // The bears fishing: a swipe at the water, a snap at a salmon flying past, the boop on the nose (sneeze, plop), and
  // after two boops each a roll and the wade off to the berry bushes for a munch.
  {
    name: 'canada-salmon-bears',
    seconds: 14,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/salmon/bears`)
      await ready(page)
      await page.waitForTimeout(600)
    },
    act: (page) => flicks(page, 9, 1400),
  },
  // Maple on the bank: the cub, the slug, the raven and Maple poked, then a salmon flicked too hard into her lap.
  {
    name: 'canada-salmon-pokes',
    seconds: 8,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/salmon/steps`)
      await ready(page)
      await page.waitForTimeout(600)
    },
    act: async (page) => {
      const q = await page.evaluate(() => window.__canadaSalmonQA())
      for (const k of ['cub', 'slug', 'raven', 'maple', 'eagle']) {
        await page.mouse.click(q[k].x, q[k].y)
        await page.waitForTimeout(900)
      }
      const w = (await page.evaluate(() => window.__canadaSalmonQA())).waiting
      if (!w) return
      await page.mouse.move(w.x, w.y)
      await page.mouse.down()
      await page.mouse.move(w.x + vp.width * 0.5, w.y - vp.height * 0.6, { steps: 3 })
      await page.mouse.up()
      await page.waitForTimeout(2000)
    },
  },
]

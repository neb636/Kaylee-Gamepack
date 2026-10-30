// Decorate a Snowman's own QA scenarios (canada/qa.mjs has the screens of each part and the decorating run): Maple's
// hello from the bare link, the park a while into the face round (the carriage on the terrace, the fox in to watch),
// and the end of the parade. Not part of the app: Node runs it, Vite never sees it.
import { vp } from '../../../../../../scripts/qa-lib.mjs'

export const screens = [
  { name: 'snowman-story', hash: '#/world/canada/snowman', reset: true, wait: 1800 },
  { name: 'snowman-after-story', hash: '#/world/canada/snowman', reset: true, wait: 7000 },
  { name: 'snowman-park-life', hash: '#/world/canada/snowman/face', reset: true, wait: 24000 },
  { name: 'snowman-parade-end', hash: '#/world/canada/snowman/parade?made=5', reset: true, wait: 12000 },
]

// The wake-up: a few tool taps (each does a short go), then the drum, and he hops and says hello.
export const motion = [
  {
    name: 'snowman-wake-up',
    seconds: 8,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/snowman/face`)
      await page.waitForFunction(() => window.__canadaSnowmanQA?.().man, null, { timeout: 20000 })
      await page.waitForTimeout(1200)
      for (let i = 0; i < 8; i++) {
        const { tools, drum } = await page.evaluate(() => window.__canadaSnowmanQA())
        if (drum) break
        const t = Object.values(tools)[i % 4]
        await page.mouse.click(t.x, t.y)
        await page.waitForTimeout(2000)
      }
    },
    act: async (page) => {
      const { drum } = await page.evaluate(() => window.__canadaSnowmanQA())
      if (drum) await page.mouse.click(drum.x, drum.y)
      void vp
    },
  },
]

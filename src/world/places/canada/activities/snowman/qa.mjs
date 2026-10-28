// Carnival Snowballs' own QA scenarios (canada/qa.mjs has the screens of each part): the story from the bare link,
// the park a while into dressing (the horse and carriage on the terrace, the geese over the park, the fox in to watch),
// and the end of the parade (the last snowman waves). Not part of the app: Node runs it, Vite never sees it.
import { vp } from '../../../../../../scripts/qa-lib.mjs'

export const screens = [
  { name: 'snowman-story', hash: '#/world/canada/snowman', reset: true, wait: 1800 },
  { name: 'snowman-after-story', hash: '#/world/canada/snowman', reset: true, wait: 9000 },
  { name: 'snowman-park-life', hash: '#/world/canada/snowman/dress?snowmen=3', reset: true, wait: 24000 },
  { name: 'snowman-parade-end', hash: '#/world/canada/snowman/parade?snowmen=5', reset: true, wait: 16000 },
]

// Maple acts it out: a snowman stacked from the stack link (she cheers), then the fox poked if she's in.
export const motion = [
  {
    name: 'snowman-maple-cheer',
    seconds: 6,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/snowman/stack`)
      await page.waitForFunction(() => window.__canadaSnowmanQA?.().section, null, { timeout: 20000 })
      await page.waitForTimeout(1500)
    },
    act: async (page) => {
      const { ball, loose } = await page.evaluate(() => window.__canadaSnowmanQA())
      const big = loose.find((b) => b.r > 0.5)
      if (!ball || !big) return
      await page.mouse.move(ball.x, ball.y)
      await page.mouse.down()
      await page.mouse.move(big.x, big.y, { steps: 18 })
      await page.waitForTimeout(500)
      await page.mouse.up()
      void vp
    },
  },
]

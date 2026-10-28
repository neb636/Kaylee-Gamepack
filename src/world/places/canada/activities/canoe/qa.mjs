// Red Canoe's own QA scenarios (the glide/stream/loon/glacier screens and the stroke run are in canada/qa.mjs): Maple's
// question at the dock, and the animals poked one after another (each reacts; the book's card pops up the first time).
// Not part of the app: Node runs it, Vite never sees it.
import { tapAnchor } from '../../../../../../scripts/qa-lib.mjs'

export const screens = [
  { name: 'canada-canoe-story', hash: '#/world/canada/canoe', reset: true, wait: 2500 },
  { name: 'canada-canoe-story-pull', hash: '#/world/canada/canoe/story?paddle=pull', reset: true, wait: 2500 },
]

export const motion = [
  {
    name: 'canada-canoe-pokes',
    seconds: 10,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/canoe/glide`)
      await page.waitForFunction(() => window.__canadaCanoeQA?.().section, null, { timeout: 20000 })
      await page.waitForTimeout(3000)
    },
    act: async (page) => {
      for (const id of ['maple', 'ducks', 'logs', 'squirrel', 'glacier', 'moose', 'eagle', 'maple']) {
        await tapAnchor(page, id)
        await page.waitForTimeout(1100)
      }
    },
  },
]

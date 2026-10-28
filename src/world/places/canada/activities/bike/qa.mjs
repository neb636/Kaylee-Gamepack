// Mountain Bike's own QA scenarios (the stretches' screens and the steering filmstrip are in canada/qa.mjs): the story
// in her gondola cabin, and Maple's poses up close at the waterfall. Not part of the app: Node runs it, Vite never sees it.
import { tapAnchor } from '../../../../../../scripts/qa-lib.mjs'

export const screens = [
  // The story: Maple on her bike in the gondola cabin at the bottom, waving (before the story's tap-anywhere skip).
  { name: 'canada-bike-story', hash: '#/world/canada/bike', reset: true, wait: 2200 },
]

export const motion = [
  // Maple at the waterfall: she rolls to a stop, cheers on the saddle (both paws up), then the wide shot with the rainbow.
  {
    name: 'canada-bike-cheer',
    seconds: 5,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/bike/falls`)
      await page.waitForFunction(() => window.__canadaBikeQA?.().done, null, { timeout: 40000 })
    },
    act: async (page) => {
      await page.waitForTimeout(4500)
    },
  },
  // The moose in his pond: poked, he lifts his dripping head with a mouthful of pond weed and looks at her.
  {
    name: 'canada-bike-moose',
    seconds: 5,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/bike/green`)
      await page.waitForFunction(() => (window.__canadaBikeQA?.().s ?? 0) > 72, null, { timeout: 40000 })
    },
    act: async (page) => {
      await tapAnchor(page, 'moose')
      await page.waitForTimeout(4000)
    },
  },
]

// Mountain Bike's QA scenarios (scripts/qa-screens.mjs, qa-pacing.mjs and qa-motion.mjs pick them up next to Canada's
// own qa.mjs): the stretches' screens, the chapter's two films, the auto-played run, the steering, Monty in his bath.
// Not part of the app: Node runs it, Vite never sees it. The game answers on window.__canadaBikeQA() (ride.ts `qa`), the
// films on window.__canadaStoryQA() (story/stage.ts `qa`: { film: { film, beat, t }, films: { done, skipped }, ended }).
import { tapAnchor, vp } from '../../../../../../scripts/qa-lib.mjs'

/** Waits for a film to be played to the end (or skipped). */
const filmOver = (id, timeout = 60000) => (page) => page.waitForFunction((f) => { const q = window.__canadaStoryQA?.(); return q && (q.films.done.includes(f) || q.films.skipped.includes(f)) }, id, { timeout })

export const screens = [
  // The hello in her gondola cabin at the bottom (a link, or a replay: no film in), before the tap-anywhere skip.
  { name: 'canada-bike-story', hash: '#/world/canada/bike', reset: true, wait: 2200 },
  // The gondola, each stretch from its link (berms: both ways), the bottom with Monty in his bath.
  ...['gondola', 'green', 'berms?trail=green', 'berms?trail=blue', 'creek', 'falls'].map((to) => ({ name: `canada-bike-${to.replace(/[?=&]/g, '-')}`, hash: `#/world/canada/bike/${to}`, reset: true, wait: to === 'falls' ? 14000 : to === 'gondola' ? 4000 : 3500 })),
  // The films: the look down the mountain (zoomed in on the pool), and Monty with the lily pad on his antler.
  { name: 'canada-film-bike-in', hash: '#/world/canada/story/bike-in', reset: true, wait: 10500 },
  { name: 'canada-film-bike-out', hash: '#/world/canada/story/bike-out', reset: true, wait: 7000 },
]

export const pacing = [
  // The hello, the gondola, then every touch steers the bike (or pokes something on the way).
  { name: 'canada mountain bike', id: 'bike', hash: '#/world/canada/bike', reset: true },
]

export const motion = [
  // Maple riding the blue way's berms with the wheel under her finger, pushed right up the berm and held, then let go:
  // she leans into the bends, bumps over the roots and drifts back to the middle of her way.
  {
    name: 'canada-bike-steer',
    seconds: 9,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/bike/berms?trail=blue`)
      await page.waitForFunction(() => window.__canadaBikeQA?.().mode, null, { timeout: 20000 })
      await page.waitForTimeout(1200)
    },
    act: async (page) => {
      const x = vp.width / 2
      const y = vp.height * 0.7
      await page.mouse.move(x, y)
      await page.mouse.down()
      await page.mouse.move(x + Math.min(110, vp.width * 0.12), y, { steps: 8 })
      await page.waitForTimeout(2500)
      await page.mouse.move(x - Math.min(60, vp.width * 0.07), y, { steps: 8 })
      await page.waitForTimeout(1500)
      await page.mouse.up()
    },
  },
  // Rolling in at the bottom: Monty in his bath in the pool, nose in the water; she stops, Maple cheers and spots him,
  // he looks up with a mouthful of pond weed and says hello (then on into the film out).
  {
    name: 'canada-bike-cheer',
    seconds: 9,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/bike/falls`)
      await page.waitForFunction(() => window.__canadaBikeQA?.().mode === 'ride', null, { timeout: 40000 })
    },
    act: async (page) => {
      await page.waitForFunction(() => window.__canadaBikeQA?.().done, null, { timeout: 40000 })
      await page.waitForTimeout(5000)
    },
  },
  // Monty poked as she rolls up: his head comes up out of the water, dripping, chewing pond weed, and he looks at her.
  {
    name: 'canada-bike-moose',
    seconds: 6,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/bike/falls`)
      await page.waitForFunction(() => (window.__canadaBikeQA?.().s ?? 0) > 864, null, { timeout: 40000 })
    },
    act: async (page) => {
      await tapAnchor(page, 'moose')
      await page.waitForTimeout(4500)
    },
  },
  // The film in, played to the end: the top of the trail, the look down the mountain to the tiny moose, she hops on and
  // rolls off (then the game starts).
  {
    name: 'canada-bike-film-in',
    seconds: 24,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/story/bike-in`)
      await page.waitForFunction(() => window.__canadaStoryQA?.().film, null, { timeout: 30000 })
    },
    act: filmOver('bike-in'),
  },
  // The film out, played to the end: Monty in his bath, the goalie talk, the pinecone bonk, the scarf.
  {
    name: 'canada-bike-film-out',
    seconds: 24,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/story/bike-out`)
      await page.waitForFunction(() => window.__canadaStoryQA?.().film, null, { timeout: 30000 })
    },
    act: filmOver('bike-out'),
  },
  // ⏭ held in the middle of the film out (as Monty says he's very good at standing): it ends at once, and the chapter goes
  // on (from a link: back to the map).
  {
    name: 'canada-bike-film-skip',
    seconds: 6,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/story/bike-out`)
      await page.waitForFunction(() => window.__canadaStoryQA?.().film?.beat === 'good', null, { timeout: 40000 })
    },
    act: async (page) => {
      const b = await page.getByRole('button', { name: 'Hold to skip the story' }).boundingBox()
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
      await page.mouse.down()
      await page.waitForTimeout(900)
      await page.mouse.up()
      await page.waitForFunction(() => !document.querySelector('[data-story-film]'), null, { timeout: 5000 })
    },
  },
]

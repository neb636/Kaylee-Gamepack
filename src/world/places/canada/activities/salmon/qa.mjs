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
  // Each stretch of the river from its link (the bears' falls with the spirit bear low too), and the stream where the
  // eggs hatch. (Moved here from Canada's qa.mjs.)
  ...['steps', 'falls', 'bears', 'bears?spirit=low', 'eggs'].map((to) => ({ name: `canada-salmon-${to.replace(/[?=&,.]/g, '-')}`, hash: `#/world/canada/salmon/${to}`, reset: true, wait: 1500 })),
  // The films (story/films/salmon.ts): Misty's swing in the way in; the slap shot on the way out.
  { name: 'canada-film-salmon-in', hash: '#/world/canada/story/salmon-in', reset: true, wait: 7000 },
  { name: 'canada-film-salmon-out', hash: '#/world/canada/story/salmon-out', reset: true, wait: 9000 },
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

/** Auto-played runs (scripts/qa-pacing.mjs). A tap on a salmon makes it hop (the first on the spot, then up a step
 *  each time) and a tap pokes things, so the auto-player gets salmon up the river by tapping alone; flicking them up
 *  the falls is a quick drag (canada-salmon-flick). */
export const pacing = [{ name: 'canada salmon leap', id: 'salmon', hash: '#/world/canada/salmon', reset: true }]

const story = (page) => page.evaluate(() => window.__canadaStoryQA?.() ?? {})
/** Plays a film from its link to the end (it then goes on: the way in into the game, the way out to the map). */
const watch = (id, seconds) => ({
  name: `canada-film-${id}`,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/canada/story/${id}`)
    await page.waitForFunction(() => window.__canadaStoryQA?.().film, null, { timeout: 30000 })
  },
  act: async (page) => {
    await page.waitForFunction((f) => {
      const q = window.__canadaStoryQA?.()
      return !q || q.ended || q.films?.done?.includes(f)
    }, id, { timeout: seconds * 1000 + 20000 })
    const q = await story(page)
    if (q.films?.skipped?.length) throw new Error(`${id} was skipped, not watched`)
  },
})

export const motion = [
  watch('salmon-in', 26),
  watch('salmon-out', 24),
  // Holding ⏭ in the middle of the way-in film (Misty's swing) skips it, and the game starts at the river.
  {
    name: 'canada-film-salmon-skip',
    seconds: 10,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/story/salmon-in`)
      await page.waitForFunction(() => window.__canadaStoryQA?.().film?.beat === 'jump', null, { timeout: 40000 })
    },
    act: async (page) => {
      const b = await page.getByRole('button', { name: 'Hold to skip the story' }).boundingBox()
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
      await page.mouse.down()
      await page.waitForTimeout(900)
      await page.mouse.up()
      await page.waitForFunction(() => window.__canadaSalmonQA?.().section, null, { timeout: 20000 })
      await page.waitForTimeout(3000)
    },
  },
  // In the bears' falls, the waiting salmon flicked up one pool at a time: the leap, the splash and the happy wiggle,
  // a bear lunging and the boop on its nose. (Moved here from Canada's qa.mjs.)
  {
    name: 'canada-salmon-flick',
    seconds: 9,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/salmon/bears`)
      await ready(page)
      await page.waitForTimeout(600)
    },
    act: async (page) => {
      for (let i = 0; i < 6; i++) {
        const q = await page.evaluate(() => window.__canadaSalmonQA())
        if (!q.waiting) break
        await page.mouse.move(q.waiting.x, q.waiting.y)
        await page.mouse.down()
        await page.waitForTimeout(60)
        await page.mouse.move(q.waiting.x + 70, q.waiting.y - 100, { steps: 5 })
        await page.mouse.up()
        await page.waitForTimeout(1300)
      }
    },
  },
  // Taps only, the way a child who never flicks plays: the first tap hops on the spot, every tap after it hops the
  // salmon up a step, so the little steps get done by tapping alone.
  {
    name: 'canada-salmon-taps',
    seconds: 16,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/salmon/steps`)
      await ready(page)
      await page.waitForTimeout(600)
    },
    act: async (page) => {
      for (let i = 0; i < 40; i++) {
        const q = await page.evaluate(() => window.__canadaSalmonQA())
        if (q.section !== 'steps') break
        if (q.waiting) await page.mouse.click(q.waiting.x, q.waiting.y)
        await page.waitForTimeout(900)
      }
      const q = await page.evaluate(() => window.__canadaSalmonQA())
      if (q.section === 'steps') throw new Error(`taps alone didn't get the steps done (home ${q.home})`)
    },
  },
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

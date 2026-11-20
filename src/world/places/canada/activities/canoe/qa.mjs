// Red Canoe's QA scenarios (scripts/qa-screens.mjs, qa-pacing.mjs, qa-motion.mjs pick them up next to Canada's own
// qa.mjs): every part from its link, both films, the paddling driven the way a child would (a finger held on the water,
// and only taps), the animals poked, and the films watched to the end and skipped. Not part of the app: Node runs it,
// Vite never sees it. The game answers on window.__canadaCanoeQA() (paddle.ts `qa`), the films on
// window.__canadaStoryQA() ({ film, films: { done, skipped }, ended }).
import { tapAnchor, vp } from '../../../../../../scripts/qa-lib.mjs'

const ready = async (page, base, hash) => {
  await page.goto(`${base}${hash}`)
  await page.waitForFunction(() => window.__canadaCanoeQA?.().section, null, { timeout: 30000 })
}
const state = (page) => page.evaluate(() => window.__canadaCanoeQA())

/** Where a child would put her finger next: on the goal if it's on the screen, or up ahead of the canoe toward it. */
async function aim(page) {
  const s = await state(page)
  const g = s.goalAt
  const on = g && !g.behind && g.x > 30 && g.x < vp.width - 30 && g.y > 100 && g.y < vp.height - 80
  if (on) return { s, x: g.x, y: g.y }
  const dx = g ? Math.max(-1, Math.min(1, (g.x - s.canoe.x) / 300)) : 0
  return { s, x: Math.max(30, Math.min(vp.width - 30, s.canoe.x + dx * vp.width * 0.3)), y: Math.max(110, s.canoe.y - vp.height * 0.32) }
}

/** Holds the water where the canoe should go, following the story's goal, for `ms` or until the payoff. */
async function paddle(page, ms) {
  const t0 = Date.now()
  let p = await aim(page)
  await page.mouse.move(p.x, p.y)
  await page.mouse.down()
  while (Date.now() - t0 < ms && !p.s.done) {
    await page.waitForTimeout(150)
    p = await aim(page)
    await page.mouse.move(p.x, p.y, { steps: 2 })
  }
  await page.mouse.up()
}

const filmReady = async (page, base, id) => {
  await page.goto(`${base}#/world/canada/story/${id}`)
  await page.waitForFunction(() => window.__canadaStoryQA?.().film, null, { timeout: 30000 })
}

/** Screenshots: how to get to each screen from a fresh start. */
export const screens = [
  { name: 'canada-canoe-story', hash: '#/world/canada/canoe', reset: true, wait: 2500 },
  ...['glide', 'stream', 'loon', 'glacier'].map((to) => ({ name: `canada-canoe-${to}`, hash: `#/world/canada/canoe/${to}`, reset: true, wait: to === 'glide' ? 4000 : 3000 })),
  // Her finger held on the water ahead: Maple paddling mid-stroke, the pink ring where it's going.
  { name: 'canada-canoe-glide-paddling', hash: '#/world/canada/canoe/glide', reset: true, wait: 3500, act: async (page) => {
    await page.mouse.move(vp.width * 0.42, vp.height * 0.38)
    await page.mouse.down()
    await page.waitForTimeout(2600)
  } },
  ...['canoe-in', 'canoe-out'].map((id) => ({ name: `canada-film-${id}`, hash: `#/world/canada/story/${id}`, reset: true, wait: 6000 })),
]

/** Auto-played runs: talk before the first touch, talk per touch, the play strip. */
export const pacing = [
  // Red Canoe: a tap on the water sends the canoe a short way toward it (Maple paddles there), so the auto-player's
  // taps paddle it about and poke the animals; the robot run that crosses the lake is qa-motion's canada-canoe-cross.
  { name: 'canada red canoe', id: 'canoe', hash: '#/world/canada/canoe', reset: true },
]

/** Filmed moments: the core verb, driven the way a child would. */
export const motion = [
  {
    // The whole crossing, a finger on the water: from the dock to the milky water, then the bubbles to Lulu, to the
    // glacier. It should never stick on a shore.
    name: 'canada-canoe-cross',
    seconds: 60,
    setup: async (page, base) => {
      await ready(page, base, '#/world/canada/canoe/glide')
      await page.waitForTimeout(1500)
    },
    act: (page) => paddle(page, 58000),
  },
  {
    // A child who only taps: tap tap tap toward where she's going (each tap paddles a short way).
    name: 'canada-canoe-taps',
    seconds: 20,
    setup: async (page, base) => {
      await ready(page, base, '#/world/canada/canoe/glide')
      await page.waitForTimeout(1500)
    },
    act: async (page) => {
      for (let i = 0; i < 18; i++) {
        const p = await aim(page)
        await page.mouse.click(p.x, p.y)
        await page.waitForTimeout(900)
      }
    },
  },
  {
    // Odd play: her finger held off to one side and then behind (big happy arcs, never a spin on the spot), then
    // straight into the shore (it slides along and the next nudge frees it).
    name: 'canada-canoe-arcs',
    seconds: 16,
    setup: async (page, base) => {
      await ready(page, base, '#/world/canada/canoe/glide')
      await page.waitForTimeout(1500)
    },
    act: async (page) => {
      for (const [x, y, ms] of [
        [0.92, 0.55, 4000],
        [0.5, 0.95, 3500],
        [0.05, 0.45, 4000],
      ]) {
        await page.mouse.move(vp.width * x, vp.height * y)
        await page.mouse.down()
        await page.waitForTimeout(ms)
        await page.mouse.up()
      }
    },
  },
  {
    name: 'canada-canoe-pokes',
    seconds: 10,
    setup: async (page, base) => {
      await ready(page, base, '#/world/canada/canoe/glide')
      await page.waitForTimeout(3000)
    },
    act: async (page) => {
      for (const id of ['maple', 'ducks', 'logs', 'squirrel', 'glacier', 'moose', 'eagle', 'maple']) {
        await tapAnchor(page, id)
        await page.waitForTimeout(1100)
      }
    },
  },
  // The films, watched to the end (each has to finish by itself) and skipped mid-way (hold the skip button).
  ...['canoe-in', 'canoe-out'].map((id) => ({
    name: `canada-film-${id}`,
    seconds: 20,
    setup: (page, base) => filmReady(page, base, id),
    act: async (page) => {
      // (When it ends the link goes on: canoe-in into the game, canoe-out to the map.)
      await page.waitForFunction((f) => !location.hash.includes('/story/') || window.__canadaStoryQA?.().ended || window.__canadaStoryQA?.().films.done.includes(f), id, { timeout: 40000 })
    },
  })),
  {
    name: 'canada-film-canoe-out-skip',
    seconds: 8,
    setup: (page, base) => filmReady(page, base, 'canoe-out'),
    act: async (page) => {
      await page.waitForTimeout(4500)
      await page.keyboard.press('Escape')
      await page.waitForFunction(() => !location.hash.includes('/story/') || window.__canadaStoryQA?.().ended || window.__canadaStoryQA?.().films.skipped.includes('canoe-out'), null, { timeout: 8000 })
    },
  },
]

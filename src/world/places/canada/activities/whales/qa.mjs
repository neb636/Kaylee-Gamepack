// Whale Watch's QA scenarios (scripts/qa-screens.mjs, qa-pacing.mjs, qa-motion.mjs pick them up next to Canada's own
// qa.mjs): every part from its link, the chapter's two films (story/films/whales.ts), a run that fetches Ollie and
// tows her home, steering out at sea, the orcas, and the films watched to the end and skipped. The game answers on
// window.__canadaWhalesQA() (watch.ts `qa`), the films on window.__canadaStoryQA() (story/stage.ts).
// Not part of the app: Node runs it, Vite never sees it.
import { vp } from '../../../../../../scripts/qa-lib.mjs'

const whales = (page) => page.evaluate(() => window.__canadaWhalesQA())
const ready = async (page, base, to, ms = 1500) => {
  await page.goto(`${base}#/world/canada/whales/${to}`)
  await page.waitForFunction(() => window.__canadaWhalesQA?.().section, null, { timeout: 20000 })
  await page.waitForTimeout(ms)
}
const film = async (page, base, id) => {
  await page.goto(`${base}#/world/canada/story/${id}`)
  await page.waitForFunction(() => window.__canadaStoryQA?.().film, null, { timeout: 30000 })
}

/** Screenshots (scripts/qa-screens.mjs). */
export const screens = [
  // At the dock (the hello from a link), each part from its link (the humpback that jumps), under the water listening.
  { name: 'canada-whales-story', hash: '#/world/canada/whales/story', reset: true, wait: 3200 },
  ...['harbour', 'otters', 'spouts', 'spouts?found=3', 'orcas', 'listen'].map((to) => ({ name: `canada-whales-${to.replace(/[?=&]/g, '-')}`, hash: `#/world/canada/whales/${to}`, reset: true, wait: to === 'listen' ? 4500 : 3000 })),
  // The films: the dock at Tofino (Maple's twirl), and Ollie in the kelp before the whale soaks everybody.
  { name: 'canada-film-whales-in', hash: '#/world/canada/story/whales-in', reset: true, wait: 5500 },
  { name: 'canada-film-whales-out', hash: '#/world/canada/story/whales-out', reset: true, wait: 2500 },
]

/** Auto-played runs (scripts/qa-pacing.mjs). A tap on the water drives the boat there, so the auto-player's taps steer
 *  it about and poke the animals; fetching Ollie and steering out to the spouts is qa-motion's canada-whales-ollie. */
export const pacing = [{ name: 'canada whale watch', id: 'whales', hash: '#/world/canada/whales', reset: true }]

/** Filmed moments (scripts/qa-motion.mjs). */
export const motion = [
  {
    // Ollie: her finger held on the water by the sleepy otter (the boat slows as it gets close, she wakes and grabs the
    // rope), then on the raft (the boat tows her home gently), and she climbs back on the rope to ride along.
    name: 'canada-whales-ollie',
    seconds: 22,
    setup: async (page, base) => ready(page, base, 'otters'),
    act: async (page) => {
      const hold = async (pick, ms) => {
        const end = Date.now() + ms
        let down = false
        while (Date.now() < end) {
          const q = await whales(page)
          const p = pick(q)
          if (!p) break
          const x = Math.min(vp.width - 20, Math.max(20, p.x))
          const y = Math.min(vp.height - 20, Math.max(vp.height * 0.2, p.y))
          await page.mouse.move(x, y)
          if (!down) await page.mouse.down()
          down = true
          await page.waitForTimeout(250)
        }
        if (down) await page.mouse.up()
      }
      await hold((q) => (q.drifter === 'drift' ? q.drifterAt : null), 9000)
      await page.waitForTimeout(1200)
      // (The raft is behind her now: a U-turn to the left first, then her finger on the raft.)
      await hold((q) => (q.drifter === 'towed' && (!q.raftAt || q.raftAt.x < 40 || q.raftAt.x > vp.width - 40) ? { x: q.boat.x - vp.width * 0.3, y: q.boat.y + 40 } : null), 4000)
      await hold((q) => (q.drifter === 'towed' ? q.raftAt : null), 9000)
      await page.waitForTimeout(3000)
    },
  },
  {
    // Out at sea: her finger held ahead and to the left of the boat (it speeds up and swoops round, hopping off the
    // waves, Ollie swinging on her rope), swung across to the right (it turns back), then let go (it coasts).
    name: 'canada-whales-steer',
    seconds: 9,
    setup: async (page, base) => ready(page, base, 'spouts'),
    act: async (page) => {
      const { boat } = await whales(page)
      const up = Math.min(boat.y - vp.height * 0.2, vp.height * 0.4)
      await page.mouse.move(boat.x - vp.width * 0.18, boat.y - up)
      await page.mouse.down()
      await page.waitForTimeout(2600)
      await page.mouse.move(boat.x + vp.width * 0.25, boat.y - up, { steps: 14 })
      await page.waitForTimeout(2600)
      await page.mouse.up()
    },
  },
  {
    // The orcas: hold the water far ahead, then swing the finger left and right (the baby copies the turns).
    name: 'canada-whales-orcas',
    seconds: 8,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/whales/orcas`)
      await page.waitForFunction(() => window.__canadaWhalesQA?.().orcas, null, { timeout: 20000 })
      await page.waitForTimeout(1200)
    },
    act: async (page) => {
      const x = vp.width / 2
      const y = vp.height * 0.3
      await page.mouse.move(x, y)
      await page.mouse.down()
      for (let i = 0; i < 70; i++) {
        await page.mouse.move(x + Math.sin(i / 9) * vp.width * 0.35, y)
        await page.waitForTimeout(100)
      }
      await page.mouse.up()
    },
  },
  // The films, watched to the end (the readout lists them as done), and the film out skipped in the middle of the
  // whale's spout (finish() is safe from any beat, and the story goes on).
  ...['whales-in', 'whales-out'].map((id) => ({
    name: `canada-film-${id}`,
    seconds: 20,
    setup: async (page, base) => film(page, base, id),
    act: async (page) => {
      await page.waitForFunction((id) => window.__canadaStoryQA?.().films?.done?.includes(id) || window.__canadaStoryQA?.().ended, id, { timeout: 40000 })
    },
  })),
  {
    name: 'canada-film-whales-out-skip',
    seconds: 14,
    setup: async (page, base) => film(page, base, 'whales-out'),
    act: async (page) => {
      await page.waitForFunction(() => window.__canadaStoryQA?.().film?.beat === 'whale', null, { timeout: 30000 })
      await page.keyboard.press('Escape')
      // (Skipped, the stage is thrown away and the story goes on: the readout is gone or on the next film.)
      await page.waitForFunction(() => {
        const q = window.__canadaStoryQA?.()
        return !q || q.films?.skipped?.includes('whales-out') || q.ended || q.film?.film !== 'whales-out'
      }, null, { timeout: 8000 })
      await page.waitForTimeout(1500)
    },
  },
]

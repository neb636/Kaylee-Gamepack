// Whale Peek-a-Boo's QA scenarios (scripts/qa-screens.mjs, qa-pacing.mjs, qa-motion.mjs pick them up next to Canada's
// own qa.mjs): every part from its link, the chapter's two films (story/films/whales.ts), the core verb (bubbles and
// the grey whale's zones), the humpback's three jump sizes and the ride, the orcas' peek-a-boo, and the robots that
// must finish the toy: one that only taps, one that does nothing at all, and one on a Mac (?device=mouse). The game
// answers on window.__canadaWhalesQA() (watch.ts `qa`: `at` has every tap target's middle on screen), the films on
// window.__canadaStoryQA() (story/stage.ts).
// Not part of the app: Node runs it, Vite never sees it.
import { vp } from '../../../../../../scripts/qa-lib.mjs'

const whales = (page) => page.evaluate(() => window.__canadaWhalesQA?.())
const ready = async (page, base, to, ms = 1500) => {
  await page.goto(`${base}#/world/canada/whales/${to}`)
  await page.waitForFunction(() => window.__canadaWhalesQA?.().section, null, { timeout: 30000 })
  await page.waitForTimeout(ms)
}
const film = async (page, base, id) => {
  await page.goto(`${base}#/world/canada/story/${id}`)
  await page.waitForFunction(() => window.__canadaStoryQA?.().film, null, { timeout: 30000 })
}
/** A tap on a target by its id (watch.ts `qa().at`); false when it isn't on screen. */
const tapAt = async (page, id, ms = 60) => {
  const q = await whales(page)
  const p = q?.at?.[id]
  if (!p) return false
  await page.mouse.move(p.x, p.y)
  await page.mouse.down()
  await page.waitForTimeout(ms)
  await page.mouse.up()
  return true
}
/** Waits for the readout to say something (polling, and drifting the pointer so headless WebKit keeps its frame rate). */
const until = async (page, test, ms, label) => {
  const end = Date.now() + ms
  let k = 0
  while (Date.now() < end) {
    const q = await whales(page)
    if (q && test(q)) return q
    await page.mouse.move(vp.width * (0.1 + 0.02 * (k++ % 5)), vp.height * 0.95)
    await page.waitForTimeout(400)
  }
  throw new Error(`timed out waiting for ${label}`)
}

/** A child who only taps: the bubbles, any part of the whale, the baby orca, never a hold. */
async function tapper(page, ms) {
  const end = Date.now() + ms
  const zones = ['blowhole', 'back', 'barnacles', 'tail']
  let n = 0
  while (Date.now() < end) {
    const q = await whales(page)
    if (q?.done) return q
    let did = false
    if (q?.phase === 'bubbles') did = await tapAt(page, 'bubbles')
    else if (q?.phase === 'grey') did = await tapAt(page, zones[n++ % zones.length])
    else if (q?.phase === 'hump') did = await tapAt(page, 'hump')
    else if (q?.phase === 'peek') did = await tapAt(page, 'baby')
    if (!did) await page.mouse.move(vp.width * 0.5 + (n++ % 3), vp.height * 0.96)
    await page.waitForTimeout(did ? 900 : 400)
  }
  throw new Error('the tap robot did not finish')
}

/** Screenshots (scripts/qa-screens.mjs). */
export const screens = [
  // Ollie's line from a link; each part from its link (the bubbles), and each whale once it's up.
  { name: 'canada-whales-story', hash: '#/world/canada/whales/story', reset: true, wait: 2500 },
  ...['grey', 'humpback', 'orcas'].map((to) => ({ name: `canada-whales-${to}`, hash: `#/world/canada/whales/${to}`, reset: true, wait: to === 'orcas' ? 5200 : 2500 })),
  { name: 'canada-whales-grey-up', hash: '#/world/canada/whales/grey', reset: true, wait: 9500 },
  { name: 'canada-whales-humpback-up', hash: '#/world/canada/whales/humpback', reset: true, wait: 9500 },
  // The films: Ollie juggling her rock in the kelp; the film out with the rock back on her tummy.
  { name: 'canada-film-whales-in', hash: '#/world/canada/story/whales-in', reset: true, wait: 3500 },
  { name: 'canada-film-whales-out', hash: '#/world/canada/story/whales-out', reset: true, wait: 2500 },
]

/** Auto-played runs (scripts/qa-pacing.mjs), a part at a time (each part finishes when the address bar moves on; the
 *  orcas at the stamp). The auto-player only taps: the humpback's jumps grow anyway, so taps get the ride. */
export const pacing = [
  { name: 'canada whale peek-a-boo: the grey whale', id: 'whales-grey', hash: '#/world/canada/whales/grey', reset: true, next: 'humpback' },
  { name: 'canada whale peek-a-boo: the humpback', id: 'whales-humpback', hash: '#/world/canada/whales/humpback', reset: true, next: 'orcas' },
  { name: 'canada whale peek-a-boo: the orcas', id: 'whales-orcas', hash: '#/world/canada/whales/orcas', reset: true },
]

/** Filmed moments (scripts/qa-motion.mjs): the core verb and the payoff, and the robots that must finish. */
export const motion = [
  {
    // The bubbles, then the grey whale's every zone: the blowhole (the spout comes down on Maple), its back (it rolls
    // over and waves), the tail (a slap), the barnacles (it laughs bubbles).
    name: 'canada-whales-grey',
    seconds: 22,
    setup: async (page, base) => ready(page, base, 'grey', 1800),
    act: async (page) => {
      await tapAt(page, 'bubbles')
      await until(page, (q) => q.phase === 'grey', 9000, 'the grey whale')
      await page.waitForTimeout(2200)
      for (const [id, wait] of [
        ['blowhole', 3000],
        ['back', 3800],
        ['tail', 2600],
        ['barnacles', 2200],
      ]) {
        await tapAt(page, id)
        await page.waitForTimeout(wait)
      }
    },
  },
  {
    // The close-up: the second spout soaks Maple ("Achoo!"), her soaked face in close-up, then back to the game.
    name: 'canada-whales-soaked',
    seconds: 16,
    setup: async (page, base) => ready(page, base, 'grey', 1800),
    act: async (page) => {
      await tapAt(page, 'bubbles')
      await until(page, (q) => q.phase === 'grey', 9000, 'the grey whale')
      await page.waitForTimeout(2200)
      await tapAt(page, 'blowhole')
      await page.waitForTimeout(3000)
      await tapAt(page, 'blowhole')
      await until(page, (q) => q.films?.done?.includes('soaked-1'), 14000, 'the close-up')
    },
  },
  {
    // The hold robot: the humpback held down and let go three times, longer each time (a hop, a big jump, the
    // biggest), a close-up for the bigger two, and the ride on its back; then the orcas come.
    name: 'canada-whales-hold',
    seconds: 50,
    setup: async (page, base) => ready(page, base, 'humpback', 1800),
    act: async (page) => {
      await tapAt(page, 'bubbles')
      await until(page, (q) => q.phase === 'hump' && q.at?.hump, 9000, 'the humpback')
      await page.waitForTimeout(2200)
      for (const [hold, wait] of [
        [300, 5500],
        [1300, 9000],
        [2800, 4000],
      ]) {
        await until(page, (q) => q.phase === 'hump' && q.at?.hump && !q.film, 12000, 'the humpback up again')
        await tapAt(page, 'hump', hold)
        await page.waitForTimeout(wait)
      }
      const q = await until(page, (q) => q.ridden, 15000, 'the ride')
      if (q.closeups < 2) throw new Error(`only ${q.closeups} close-ups`)
      await until(page, (q) => q.section === 'orcas', 15000, 'the orcas')
    },
  },
  {
    // Peek-a-boo: the baby orca pops up with the rock (here, then there), a tap tosses it; the third pop stays until
    // tapped; Grandma; the rock flies to Ollie; all the whales jump together.
    name: 'canada-whales-orcas',
    seconds: 34,
    setup: async (page, base) => ready(page, base, 'orcas', 800),
    act: async (page) => {
      for (let pop = 1; pop <= 3; pop++) {
        await until(page, (q) => q.phase === 'peek' && q.popN === pop && q.at?.baby, 12000, `pop ${pop}`)
        await page.waitForTimeout(pop === 3 ? 1500 : 500)
        await tapAt(page, 'baby')
      }
      await until(page, (q) => q.rockBack, 12000, 'the rock back')
      await until(page, (q) => q.done, 8000, 'everybody jumping')
      await page.waitForTimeout(3000)
    },
  },
  {
    // The tap robot: from the first bubbles to all the whales jumping, only taps (never a hold). It must finish.
    name: 'canada-whales-tap-robot',
    seconds: 170,
    setup: async (page, base) => ready(page, base, 'grey', 1200),
    act: async (page) => {
      const q = await tapper(page, 200000)
      if (!q.ridden) throw new Error('no ride')
    },
  },
  {
    // The do-nothing robot: no touch at all (only the pointer drifting, off everything). Every whale comes by
    // itself, the humpback jumps by itself (small, bigger, the biggest and the ride), and the baby orca's last pop,
    // left alone, swims to the boat and boops it. It must finish.
    name: 'canada-whales-wait-robot',
    seconds: 200,
    setup: async (page, base) => ready(page, base, 'grey', 500),
    act: async (page) => {
      const q = await until(page, (q) => q.done, 230000, 'the end, doing nothing')
      if (!q.boops) throw new Error('the baby never booped the boat')
    },
  },
  {
    // On a Mac (?device=mouse): Sparkle says "click", and the tap robot still finishes with a mouse.
    name: 'canada-whales-mouse',
    seconds: 170,
    setup: async (page, base) => {
      await page.goto(`${base}?device=mouse#/world/canada/whales/grey`)
      await page.reload()
      await page.evaluate(() => (window.__kayleeSpeech = []))
      await page.waitForFunction(() => window.__canadaWhalesQA?.().section, null, { timeout: 30000 })
      await page.waitForTimeout(1200)
    },
    act: async (page) => {
      await tapper(page, 200000)
      const said = await page.evaluate(() => (window.__kayleeSpeech ?? []).map((l) => l.text))
      const touchy = said.filter((t) => /\btap\b|finger/i.test(t))
      if (touchy.length) throw new Error(`touch words on a Mac: ${touchy.join(' / ')}`)
      if (!said.some((t) => /click/i.test(t))) throw new Error('Sparkle never said "click"')
    },
  },
  // The films, watched to the end (the readout lists them as done), and the film in skipped in the middle of the
  // spout (finish() is safe from any beat, and the story goes on).
  ...['whales-in', 'whales-out'].map((id) => ({
    name: `canada-film-${id}`,
    seconds: 18,
    setup: async (page, base) => film(page, base, id),
    act: async (page) => {
      await page.waitForFunction((id) => window.__canadaStoryQA?.().films?.done?.includes(id) || window.__canadaStoryQA?.().ended, id, { timeout: 40000 })
    },
  })),
  {
    name: 'canada-film-whales-in-skip',
    seconds: 12,
    setup: async (page, base) => film(page, base, 'whales-in'),
    act: async (page) => {
      await page.waitForFunction(() => window.__canadaStoryQA?.().film?.beat === 'higher', null, { timeout: 30000 })
      await page.waitForTimeout(2600)
      await page.keyboard.press('Escape')
      await page.waitForFunction(() => {
        const q = window.__canadaStoryQA?.()
        return !q || q.films?.skipped?.includes('whales-in') || q.ended || q.film?.film !== 'whales-in'
      }, null, { timeout: 8000 })
      await page.waitForTimeout(1500)
    },
  },
]

// The finale's QA scenarios (scripts/qa-screens.mjs, qa-pacing.mjs, qa-motion.mjs pick them up next to the Poles' own
// qa.mjs): the flight home, Papa's song, Terry's Polar Explorer quiz and the badge. Every link has ?stamps=all (without
// every stamp the finale opens the globe). Not part of the app: Node runs it, Vite never sees it.
import { vp } from '../../../../../../scripts/qa-lib.mjs'

const link = (to) => `#/world/poles/party/${to}${to.includes('?') ? '&' : '?'}stamps=all`
const ready = async (page, base, to, section) => {
  await page.goto(`${base}${link(to)}`)
  await page.waitForFunction((s) => window.__polesPartyQA?.().mode && window.__polesPartyQA().section === s, section, { timeout: 20000 })
}
const center = async (page, id) => {
  const b = await page.locator(`[data-anchor="${id}"]`).boundingBox()
  if (!b) throw new Error(`no ${id}`)
  return [b.x + b.width / 2, b.y + b.height / 2]
}
const tap = async (page, id) => {
  const [x, y] = await center(page, id)
  await page.mouse.click(x, y)
}

/** Screenshots: how to get to each screen from a fresh start. */
export const screens = [
  // The flight over each leg (the balloon behind Terry; Pola fanning herself in the warm middle; the albatross in the
  // south), each round of Papa's song (three dads; five dads; the snowstorm), a question of each kind (drag, spin,
  // tap a pole, pick from the row) and the badge.
  // (The badge first: the first screen of a run also waits for the place's code to load.)
  ...['badge', 'fly?leg=north', 'fly?leg=warm', 'fly?leg=south', 'song', 'song?round=2', 'song?round=3', 'quiz?q=bear', 'quiz?q=south&stars=2', 'quiz?q=coldest&stars=3', 'quiz?q=summer&stars=4', 'quiz?q=tern&stars=1'].map((to) => ({
    name: `poles-party-${to.replace(/[?=&]/g, '-')}`,
    hash: link(to),
    reset: true,
    wait: to === 'badge' ? 9000 : to.startsWith('song') ? 5200 : to === 'fly?leg=south' ? 9000 : to.startsWith('fly') ? 5000 : 3200,
  })),
  // The finale as she meets it (no section in the link): the film of the balloon lifting off.
  { name: 'poles-party-film', hash: '#/world/poles/party?stamps=all', reset: true, wait: 3500 },
]

/** Auto-played runs: talk before the first touch, talk per touch, the play strip. */
export const pacing = [
  // The flight from the top (she steers; the robot just watches him fly), and Papa's song from its first round.
  { name: 'poles the flight home', id: 'party', hash: link('fly'), reset: true },
  { name: 'poles papa song', id: 'party', hash: link('song'), reset: true },
]

/** Filmed moments: the core verbs, driven the way a child would. */
export const motion = [
  {
    // The flight: her finger steers Terry left, right, left over the warm middle; the balloon swings after him like a
    // kite; then a poke at the balloon (the burner, and the friends hop).
    name: 'poles-party-fly',
    seconds: 9,
    setup: async (page, base) => {
      await ready(page, base, 'fly?leg=warm', 'fly')
      await page.waitForTimeout(1200)
    },
    act: async (page) => {
      for (const x of [0.2, 0.8, 0.3, 0.7]) {
        await page.mouse.move(vp.width * x, vp.height * 0.75)
        await page.mouse.down()
        await page.waitForTimeout(1400)
        await page.mouse.up()
      }
      await tap(page, 'balloon')
      await page.waitForTimeout(1500)
    },
  },
  {
    // Papa's song, round 1: Pebble hums; she tries a dad who isn't Papa (he sings his own tune and bows), hears
    // Pebble's tune again, then taps Papa: the same song, the waddle, the hug and the hearts.
    name: 'poles-party-song',
    seconds: 16,
    setup: async (page, base) => {
      await ready(page, base, 'song', 'song')
      await page.waitForFunction(() => window.__polesPartyQA?.().state === 'listen', null, { timeout: 20000 })
    },
    act: async (page) => {
      const q = await page.evaluate(() => window.__polesPartyQA())
      await tap(page, q.row.find((d) => d !== q.papa))
      await page.waitForFunction(() => window.__polesPartyQA?.().state === 'listen', null, { timeout: 12000 })
      await tap(page, 'chick')
      await page.waitForTimeout(2200)
      await tap(page, q.papa)
      await page.waitForTimeout(6500)
    },
  },
  {
    // Papa's song, round 3: the snowstorm. The dads call in turn out of the white; she pokes Pola and the snow on the
    // way, misses twice (the right one sways and glows), then finds the last papa.
    name: 'poles-party-song-storm',
    seconds: 22,
    setup: async (page, base) => {
      await ready(page, base, 'song?round=3', 'song')
      await page.waitForFunction(() => window.__polesPartyQA?.().state === 'listen', null, { timeout: 20000 })
    },
    act: async (page) => {
      const q = await page.evaluate(() => window.__polesPartyQA())
      await page.waitForTimeout(3000)
      await page.mouse.click(vp.width * 0.5, vp.height * 0.9)
      for (const d of q.row.filter((d) => d !== q.papa).slice(0, 2)) {
        await page.waitForFunction(() => window.__polesPartyQA?.().state === 'listen', null, { timeout: 12000 })
        await tap(page, d)
      }
      await page.waitForFunction(() => window.__polesPartyQA?.().state === 'listen', null, { timeout: 12000 })
      await page.waitForTimeout(1200)
      await tap(page, q.papa)
      await page.waitForTimeout(5000)
    },
  },
  {
    // The quiz's first question, the story's last step: Pola dragged to the bottom of the world (not her home: a "?"
    // and the top glows), then to the top, where she waves from the sea ice and the first star lands.
    name: 'poles-party-quiz',
    seconds: 12,
    setup: async (page, base) => {
      await ready(page, base, 'quiz?q=bear', 'quiz')
      await page.waitForTimeout(1500)
    },
    act: async (page) => {
      const g = await page.locator('[data-anchor="globe"]').boundingBox()
      if (!g) throw new Error('no globe')
      const carry = async (to) => {
        await page.waitForFunction(() => window.__polesPartyQA?.().state === 'ask', null, { timeout: 12000 })
        const [x, y] = await center(page, 'piece')
        await page.mouse.move(x, y)
        await page.mouse.down()
        await page.mouse.move(g.x + g.width / 2, g.y + g.height * to, { steps: 20 })
        await page.mouse.up()
      }
      await carry(0.92)
      await page.waitForTimeout(2500)
      await carry(0.08)
      await page.waitForTimeout(3500)
    },
  },
]

// The Longest Night's QA scenarios (scripts/qa-screens.mjs, qa-pacing.mjs, qa-motion.mjs pick them up next to the
// Poles' own qa.mjs). Not part of the app: Node runs it, Vite never sees it. Every act is 3D and answers on
// window.__polesNightQA() (fly.ts, chorus.ts, through.ts, goodbye.ts `qa`); the films on window.__polesStoryQA().

const ready = async (page, base, hash) => {
  await page.goto(`${base}${hash}`)
  await page.waitForFunction(() => window.__polesNightQA?.().section, null, { timeout: 60000 })
  await page.waitForTimeout(1500)
}
const state = (page) => page.evaluate(() => window.__polesNightQA())
/** Holds Pebble for `ms` and lets go, the way a finger does. */
async function sing(page, ms) {
  const p = (await state(page)).pebble
  await page.mouse.move(p.x, p.y)
  await page.mouse.down()
  await page.waitForTimeout(ms)
  await page.mouse.up()
}

/** Holds anywhere for `ms` (the burner), the way a finger does. */
async function hold(page, ms) {
  await page.mouse.move(600, 380)
  await page.mouse.down()
  await page.waitForTimeout(ms)
  await page.mouse.up()
}
/** Leads Pebble toward Papa: her finger on the ice just short of him, held a moment. */
async function lead(page, ms = 1500) {
  const s = await state(page)
  await page.mouse.move(s.papa.x, s.papa.y + 30)
  await page.mouse.down()
  await page.mouse.move(s.papa.x + 4, s.papa.y + 34)
  await page.waitForTimeout(ms)
  await page.mouse.up()
}

/** Screenshots: how to get to each screen from a fresh start. */
export const screens = [
  ...['north', 'warm', 'south'].map((leg) => ({ name: `poles-night-fly-${leg}`, hash: `#/world/poles/night/fly?leg=${leg}`, reset: true, wait: 4000 })),
  ...['near', 'churn', 'middle'].map((part) => ({ name: `poles-night-huddle-${part}`, hash: `#/world/poles/night/huddle?part=${part}`, reset: true, wait: 4000 })),
  { name: 'poles-night-goodbye', hash: '#/world/poles/night/goodbye', reset: true, wait: 4000 },
  ...['night-in', 'night-lost', 'night-colony', 'night-sunrise', 'night-goodbye', 'the-end'].map((id) => ({ name: `poles-film-${id}`, hash: `#/world/poles/story/${id}`, reset: true, wait: 9000 })),
  { name: 'poles-night-whiteout', hash: '#/world/poles/night/whiteout', reset: true, wait: 4000 },
  { name: 'poles-night-edge', hash: '#/world/poles/night/edge', reset: true, wait: 4000 },
  { name: 'poles-night-together', hash: '#/world/poles/night/together', reset: true, wait: 5000 },
]

/** Auto-played runs: talk before the first touch, talk per touch, the play strip. */
export const pacing = [
  // Sing in the Dark: Sparkle's one line, then the hold. The auto-player's taps on Pebble are peeps (little rings),
  // which find the near friends; a friend the rings keep missing answers anyway after a few, so it gets through.
  { name: 'poles sing in the dark', id: 'night', hash: '#/world/poles/night/whiteout', reset: true },
  // Hold to Fly: Sparkle's one line, then every touch is the burner.
  { name: 'poles hold to fly', id: 'night', hash: '#/world/poles/night/fly', reset: true },
  // Through the Huddle: her finger leads Pebble from the first second.
  { name: 'poles through the huddle', id: 'night', hash: '#/world/poles/night/huddle', reset: true },
]

/** Filmed moments: the core verb, driven the way a child would. */
export const motion = [
  {
    // Hold to Fly: hold and the burner roars, the balloon climbs out of the slow blue wind into the fast pink one
    // (Terry rides it ahead); a couple of seconds in the pink wind and it takes over: the rest races south like a film.
    name: 'poles-night-fly',
    seconds: 20,
    setup: async (page, base) => ready(page, base, '#/world/poles/night/fly'),
    act: async (page) => {
      await page.waitForTimeout(1500)
      await hold(page, 3200)
      await page.waitForFunction(() => window.__polesNightQA?.().auto === true, null, { timeout: 12000 })
      await page.waitForTimeout(12000)
    },
  },
  {
    // Through the Huddle: lead Pebble toward Papa, the dads squish aside and honk; just as he gets close, the huddle
    // shuffles Papa away ("Papa, wait!").
    name: 'poles-night-huddle',
    seconds: 18,
    setup: async (page, base) => ready(page, base, '#/world/poles/night/huddle'),
    act: async (page) => {
      for (let i = 0; i < 5; i++) await lead(page)
      await page.waitForTimeout(3000)
    },
  },
  {
    // The packed middle: three songs (tap Pebble), the friends outside join in, Papa calls, the dads step aside one
    // by one, and her finger takes Pebble onto Papa's feet.
    name: 'poles-night-tuck',
    seconds: 30,
    setup: async (page, base) => ready(page, base, '#/world/poles/night/huddle?part=middle'),
    act: async (page) => {
      for (let i = 0; i < 3; i++) {
        const p = (await state(page)).pebble
        await page.mouse.click(p.x, p.y)
        await page.waitForTimeout(2600)
      }
      await page.waitForFunction(() => window.__polesNightQA?.().step === 'aisle', null, { timeout: 20000 })
      for (let i = 0; i < 4; i++) await lead(page)
      await page.waitForTimeout(4000)
    },
  },
  {
    // Goodbye: hold to rise into the pink wind and Pola flies home up the toy globe to Mama.
    name: 'poles-night-goodbye',
    seconds: 20,
    setup: async (page, base) => ready(page, base, '#/world/poles/night/goodbye'),
    act: async (page) => {
      await page.waitForTimeout(3000)
      for (let i = 0; i < 6; i++) {
        await hold(page, 1800)
        await page.waitForTimeout(900)
      }
    },
  },
  {
    // The core verb: hold Pebble (the dashed circle grows), let go, and the ring rolls across the whiteout: it lights
    // Pola up white in the white, finds the woolly hat (it flips onto Pebble's head), then a bigger one finds Terry
    // upside down in a drift, who joins in.
    name: 'poles-night-whiteout',
    seconds: 16,
    setup: async (page, base) => ready(page, base, '#/world/poles/night/whiteout'),
    act: async (page) => {
      await sing(page, 900)
      await page.waitForTimeout(3500)
      await sing(page, 2000)
      await page.waitForTimeout(6000)
    },
  },
  {
    // The ice edge: the Weddell seal pops up through her hole, the Adelies hop out of their drift, and a full hold
    // reaches the humpback far out in the dark sea. Every friend adds a band of color and a voice.
    name: 'poles-night-edge',
    seconds: 18,
    setup: async (page, base) => ready(page, base, '#/world/poles/night/edge'),
    act: async (page) => {
      await sing(page, 1400)
      await page.waitForTimeout(4500)
      await sing(page, 2400)
      await page.waitForTimeout(7000)
    },
  },
  {
    // The payoff: one long, long hold (the preview turns gold), the rainbow ring rolls over the hills to the colony,
    // silence, then Papa's gold ring and his song come back.
    name: 'poles-night-together',
    seconds: 24,
    setup: async (page, base) => ready(page, base, '#/world/poles/night/together'),
    act: async (page) => {
      await page.waitForTimeout(2500)
      await sing(page, 2800)
      await page.waitForTimeout(18000)
    },
  },
]

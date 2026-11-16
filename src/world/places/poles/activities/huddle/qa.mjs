// Emperor Huddle's QA scenarios (scripts/qa-screens.mjs, qa-pacing.mjs, qa-motion.mjs pick them up next to the Poles' own
// qa.mjs). Not part of the app: Node runs it, Vite never sees it. The huddle is 3D: the robot finds the penguins on
// screen through window.__polesHuddleQA() (world.ts `qa`).

const ready = async (page, base, hash) => {
  await page.goto(`${base}${hash}`)
  await page.waitForFunction(() => window.__polesHuddleQA?.().section, null, { timeout: 60000 })
  await page.waitForTimeout(1500)
}
const state = (page) => page.evaluate(() => window.__polesHuddleQA())
/** Lifts a penguin at (a) and carries it to (b), the way a finger does. */
async function carry(page, a, b, steps = 30) {
  await page.mouse.move(a.x, a.y)
  await page.mouse.down()
  await page.mouse.move(b.x, b.y, { steps })
  await page.waitForTimeout(300)
  await page.mouse.up()
}

/** Screenshots: how to get to each screen from a fresh start. */
export const screens = [
  { name: 'poles-huddle-small', hash: '#/world/poles/huddle/small', reset: true, wait: 4000 },
  { name: 'poles-huddle-blizzard', hash: '#/world/poles/huddle/blizzard?wind=right', reset: true, wait: 4000 },
  { name: 'poles-huddle-hatch', hash: '#/world/poles/huddle/hatch', reset: true, wait: 4000 },
  { name: 'poles-huddle-chick', hash: '#/world/poles/huddle/hatch?chick=hatched', reset: true, wait: 7000 },
  { name: 'poles-huddle-song', hash: '#/world/poles/huddle/song', reset: true, wait: 9000 },
]

/** Auto-played runs: talk before the first touch, talk per touch, the play strip. */
export const pacing = [
  // Emperor Huddle: Papa says he is cold and Sparkle says what to do, then the core verb is a carry, so the
  // auto-player's taps only sing and poke; the cold ones sneeze and waddle in by themselves, so it gets slowly through
  // the small huddle. The robot run that carries them in is qa-motion's poles-huddle-carry.
  { name: 'poles emperor huddle', id: 'huddle', hash: '#/world/poles/huddle', reset: true },
]

/** Filmed moments: the core verb, driven the way a child would. */
export const motion = [
  {
    // The core verb: Papa, alone and shivering on the windy edge, lifted (flippers flapping), carried into the middle
    // and set down: the huddle squishes to make room, and out of the wind he warms up (the snow falls off, a heart).
    name: 'poles-huddle-carry',
    seconds: 9,
    setup: async (page, base) => ready(page, base, '#/world/poles/huddle/small'),
    act: async (page) => {
      const s = await state(page)
      const papa = s.dads.find((d) => d.i === 0)
      await carry(page, papa, s.middle)
      await page.waitForTimeout(5000)
    },
  },
  {
    // The hatch: Papa carried in out of the wind, the egg wobbles and cracks, and Pebble pops out.
    name: 'poles-huddle-hatch',
    seconds: 14,
    setup: async (page, base) => ready(page, base, '#/world/poles/huddle/hatch'),
    act: async (page) => {
      const s = await state(page)
      await carry(page, s.dads.find((d) => d.i === 0), s.middle)
      await page.waitForTimeout(11000)
    },
  },
  {
    // A gust rolls Pebble off Papa's feet; she carries him back and he tucks in.
    name: 'poles-huddle-tuck',
    seconds: 12,
    setup: async (page, base) => ready(page, base, '#/world/poles/huddle/hatch?chick=hatched'),
    act: async (page) => {
      await page.waitForFunction(() => window.__polesHuddleQA().chick === 'out', null, { timeout: 15000 })
      await page.waitForTimeout(600)
      const s = await state(page)
      const papa = s.dads.find((d) => d.i === 0)
      await carry(page, s.pebble, { x: papa.x, y: papa.y + 30 })
      await page.waitForTimeout(3000)
    },
  },
  {
    // The payoff: the wind drops, the camera comes down low under the lights, Papa sings Pebble his song and Pebble
    // sings it back; everyone cheers.
    name: 'poles-huddle-song',
    seconds: 18,
    setup: async (page, base) => ready(page, base, '#/world/poles/huddle/song'),
    act: async (page) => {
      await page.waitForTimeout(16000)
    },
  },
]

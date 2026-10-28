// Emperor Huddle's QA scenarios (scripts/qa-screens.mjs, qa-pacing.mjs, qa-motion.mjs pick them up next to the Poles' own
// qa.mjs). Not part of the app: Node runs it, Vite never sees it.

/** Screenshots: how to get to each screen from a fresh start. */
export const screens = [
  { name: 'poles-huddle-small', hash: '#/world/poles/huddle/small', reset: true, wait: 1500 },
  { name: 'poles-huddle-blizzard', hash: '#/world/poles/huddle/blizzard?wind=right', reset: true, wait: 1500 },
  { name: 'poles-huddle-hatch', hash: '#/world/poles/huddle/hatch', reset: true, wait: 1500 },
  { name: 'poles-huddle-chick', hash: '#/world/poles/huddle/hatch?chick=hatched', reset: true, wait: 5000 },
  { name: 'poles-huddle-sunrise', hash: '#/world/poles/huddle/sunrise', reset: true, wait: 6000 },
]

/** Auto-played runs: talk before the first touch, talk per touch, the play strip. */
export const pacing = [
  // Emperor Huddle (greybox, no voices): the core verb is a drag, so the auto-player's taps only sing and poke; the cold
  // ones sneeze and waddle in by themselves, so it gets slowly through the small huddle. The robot run that drags them in
  // is qa-motion's poles-huddle-drag.
  { name: 'poles emperor huddle', id: 'huddle', hash: '#/world/poles/huddle', reset: true },
]

/** Filmed moments: the core verb, driven the way a child would. */
export const motion = [
  {
    // Emperor Huddle (2D): the shivering dad alone on the windy edge lifted (feet paddling), carried into the middle and
    // let go: the huddle squishes to make room, everyone shuffles, and out of the wind he warms up (pink cheeks, a hop).
    name: 'poles-huddle-drag',
    seconds: 7,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/poles/huddle/small`)
      await page.waitForFunction(() => window.__polesHuddleQA?.().section, null, { timeout: 20000 })
      await page.waitForTimeout(800)
    },
    act: async (page) => {
      const a = await page.locator('[data-k="d0-body"]').boundingBox()
      const b = await page.locator('[data-k="d3-body"]').boundingBox()
      if (!a || !b) throw new Error('no penguins')
      await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
      await page.mouse.down()
      await page.mouse.move(b.x + b.width * 0.2, b.y + b.height * 0.4, { steps: 30 })
      await page.waitForTimeout(400)
      await page.mouse.up()
      await page.waitForTimeout(4000)
    },
  },
]

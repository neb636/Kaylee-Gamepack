// Campfire Night's QA scenarios (scripts/qa-screens.mjs, qa-pacing.mjs and qa-motion.mjs pick them up next to
// Canada's own qa.mjs). Not part of the app: Node runs it, Vite never sees it. The game answers on
// window.__canadaCampfireQA() (CampfireNight.tsx `qa`); its two films (story/films/campfire.ts) on window.__canadaStoryQA().

/** Screenshots: how to get to each screen from a fresh start. */
export const screens = [
  // The dark campsite under the flashlight, each part from its link; the last one with the darkness turned off (a
  // feel-lab knob) to check where everything stands.
  ...['eyes', 'sounds', 'bandit', 'marshmallow', 'stars', 'bandit?feel.campTorch.dark=0'].map((to) => ({ name: `canada-campfire-${to.replace(/[?=&,.]/g, '-')}`, hash: `#/world/canada/campfire/${to}`, reset: true, wait: 1800 })),
  // The films: the paw at the bag (in), Roxy with the puck (out).
  { name: 'canada-film-campfire-in', hash: '#/world/canada/story/campfire-in', reset: true, wait: 9000 },
  { name: 'canada-film-campfire-out', hash: '#/world/canada/story/campfire-out', reset: true, wait: 7500 },
]

/** Auto-played runs: talk before the first touch, talk per touch, the play strip. */
export const pacing = [
  // A tap moves the flashlight there and a tap on eyes finds the animal at once, so the auto-player gets through the
  // eyes; the sounds, the trail and the marshmallow need the light held and dragged (canada-campfire-light below).
  { name: 'canada campfire night', id: 'campfire', hash: '#/world/canada/campfire', reset: true },
]

/** A film has ended (played or skipped), or the game it leads into has begun. */
const filmOver = (id) => async (page) => {
  await page.waitForFunction(
    (f) => {
      const q = window.__canadaStoryQA?.()
      return !!q && (q.films.done.includes(f) || q.films.skipped.includes(f) || q.ended) ? true : !document.querySelector('[data-story-film]') || !!window.__canadaCampfireQA
    },
    id,
    { timeout: 60000 },
  )
}
const filmReady = (id) => async (page, base) => {
  await page.goto(`${base}#/world/canada/story/${id}`)
  await page.waitForFunction(() => window.__canadaStoryQA?.().film, null, { timeout: 30000 })
}

/** Filmed moments: the core verb, driven the way a child would, and the films. */
export const motion = [
  {
    // Her finger sweeps the flashlight across the dark campsite from the lake to the tent and back up into the trees,
    // resting on whatever eyes it finds (they come out), then up into the sky (stars come out).
    name: 'canada-campfire-light',
    seconds: 9,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/campfire/eyes`)
      await page.waitForFunction(() => window.__canadaCampfireQA?.().section, null, { timeout: 20000 })
      await page.waitForTimeout(600)
    },
    act: async (page) => {
      const at = (x, y) =>
        page.evaluate(([x, y]) => {
          const svg = document.querySelector('[aria-label="Shine the flashlight around the campsite"] svg')
          const wide = svg.clientWidth / svg.clientHeight >= 1.05
          const s = wide ? { w: 1600, h: 1000 } : { w: 1000, h: 1500 }
          const p = new DOMPoint(s.w * x, s.h * y).matrixTransform(svg.getScreenCTM())
          return [p.x, p.y]
        }, [x, y])
      const sweep = [[0.15, 0.85], [0.3, 0.75], [0.5, 0.65], [0.7, 0.62], [0.85, 0.7], [0.7, 0.45], [0.45, 0.35], [0.25, 0.4], [0.4, 0.2], [0.7, 0.15]]
      await page.mouse.move(...(await at(...sweep[0])))
      await page.mouse.down()
      for (const p of sweep) {
        await page.mouse.move(...(await at(...p)), { steps: 6 })
        await page.waitForTimeout(500)
      }
      await page.mouse.up()
    },
  },
  {
    // The bandit's trail followed with the light held down (the Mac's click-and-hold): print by print round the tent
    // and along the trees to the hollow log, where Roxy and her three kits come out with the marshmallows.
    name: 'canada-campfire-trail',
    seconds: 16,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/campfire/bandit`)
      await page.waitForFunction(() => window.__canadaCampfireQA?.().prints, null, { timeout: 20000 })
      await page.waitForTimeout(1500)
    },
    act: async (page) => {
      const q0 = await page.evaluate(() => window.__canadaCampfireQA())
      // (The light lands a little above her finger.)
      const lift = 40
      await page.mouse.move(q0.prints.at[0], q0.prints.at[1] + lift)
      await page.mouse.down()
      for (let i = 0; i < 40; i++) {
        const q = await page.evaluate(() => window.__canadaCampfireQA())
        if (!q.prints || q.prints.next >= q.prints.of) break
        await page.mouse.move(q.prints.at[0], q.prints.at[1] + lift, { steps: 5 })
        await page.waitForTimeout(250)
      }
      await page.mouse.up()
      await page.waitForTimeout(5000)
    },
  },
  {
    // The side verb: the marshmallow held over the flames until it puffs golden, given to Maple; then one held until
    // it catches fire, blown out with a click, and given to the raccoons (they love the burnt ones).
    name: 'canada-campfire-roast',
    seconds: 22,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/campfire/marshmallow`)
      await page.waitForFunction(() => window.__canadaCampfireQA?.().spots, null, { timeout: 20000 })
      await page.waitForTimeout(1500)
    },
    act: async (page) => {
      const q = () => page.evaluate(() => window.__canadaCampfireQA())
      const roast = async (until, to) => {
        const s = (await q()).spots
        await page.mouse.move(s.mallow[0], s.mallow[1])
        await page.mouse.down()
        await page.mouse.move(s.fire[0], s.fire[1] + 25, { steps: 12 })
        await page.waitForFunction(until, null, { timeout: 15000 })
        if (until.toString().includes('fire')) {
          // On fire: let go, click it to blow it out, pick it up again.
          await page.mouse.up()
          const m = (await q()).spots.mallow
          await page.mouse.click(m[0], m[1])
          await page.waitForTimeout(400)
          const m2 = (await q()).spots.mallow
          await page.mouse.move(m2[0], m2[1])
          await page.mouse.down()
        }
        const dest = (await q()).spots[to]
        await page.mouse.move(dest[0], dest[1], { steps: 12 })
        await page.mouse.up()
        await page.waitForTimeout(1800)
      }
      await roast(() => window.__canadaCampfireQA().stick.toast > 3.6, 'maple')
      await roast(() => window.__canadaCampfireQA().stick.fire, 'family')
    },
  },
  // The films: each watched to the end, and the way in skipped in the middle (the game starts as it should).
  { name: 'canada-film-campfire-in', seconds: 22, setup: filmReady('campfire-in'), act: filmOver('campfire-in') },
  { name: 'canada-film-campfire-out', seconds: 22, setup: filmReady('campfire-out'), act: filmOver('campfire-out') },
  {
    name: 'canada-film-campfire-skip',
    seconds: 8,
    setup: async (page, base) => {
      await filmReady('campfire-in')(page, base)
      await page.waitForFunction(() => window.__canadaStoryQA?.().film?.beat === 'snatch', null, { timeout: 30000 })
    },
    act: async (page) => {
      const b = await page.getByRole('button', { name: 'Hold to skip the story' }).boundingBox()
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
      await page.mouse.down()
      await page.waitForTimeout(900)
      await page.mouse.up()
      await page.waitForFunction(() => window.__canadaCampfireQA?.().section === 'eyes', null, { timeout: 20000 })
      await page.waitForTimeout(2500)
    },
  },
]

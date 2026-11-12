// The Koh Samet finale's QA scenarios for "The Lost Fireflies" (finale/story.ts; the older finale runs are in
// ../qa.mjs): the fire show's way-in film (the dark poi, the fireflies flying in, each lighting a poi in its own color,
// Kae's lights for her), the fireflies in the show (chasing her lights, swirling up on a big circle, each leading its
// surprise in at the finish), the thank you after the fireworks (the bow, the heart of light, the way home), and the
// fireflies round her horn at the sunset and in Mom's photo. Filmed: each film watched to the end, each skipped
// mid-way with the held ⏭, and the whole show robot-played from the way in to the 🏠.
// Not part of the app: Node runs it, Vite never sees it.

const SHOW = '#/world/thailand/samet-trip/fireshow'
const qa = (page) => page.evaluate(() => window.__thaiSametQA?.())
const ready = (page) => page.waitForFunction(() => window.__thaiSametQA?.().phase, null, { timeout: 20000 })
/** Waits until the film is `s` seconds into its beat `beat` (the film's own clock: a test browser runs slow). */
const atBeat = (beat, s) => (page) => page.waitForFunction(([b, at]) => { const f = window.__thaiSametQA?.().film; return f?.beat === b && f.t >= at }, [beat, s], { timeout: 90000 })
/** Waits until a film has been played to the end (or skipped). */
const filmDone = (id) => (page) => page.waitForFunction((f) => { const q = window.__thaiSametQA?.(); return q?.films.done.includes(f) || q?.films.skipped.includes(f) }, id, { timeout: 120000 })
const open = (params) => async (page, base) => {
  await page.goto(`${base}${SHOW}?${params}`)
  await ready(page)
}
/** Waits until the sunset has been going `s` seconds (its own clock: its first frames can take a while to come up). */
const sunsetAt = (s) => (page) => page.waitForFunction((at) => { const q = window.__thaiSametQA?.(); return q?.section === 'sunset' && q.time >= at }, s, { timeout: 30000 })
/** Holds the film's ⏭ until it skips. */
async function holdSkip(page) {
  const b = await page.getByRole('button', { name: 'Hold to skip the story' }).boundingBox()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(900)
  await page.mouse.up()
}

/** Her finger drawing circles round the middle of the fire show's drawing plane (`r` meters, `loops` times). */
async function poiCircles(page, r, loops, steps = 36) {
  const q = await qa(page)
  if (!q?.plane) return
  const { x, y, ppm } = q.plane
  const R = (typeof r === 'function' ? r(q) : r) * ppm
  await page.mouse.move(x + R, y)
  await page.mouse.down()
  for (let i = 0; i <= loops * steps; i++) {
    const a = (i / steps) * Math.PI * 2
    await page.mouse.move(x + Math.cos(a) * R, y + Math.sin(a) * R)
    await page.waitForTimeout(18)
  }
  await page.mouse.up()
}
/** Her finger round the fire show's dots, in order (QA's `dotsLeft`). */
async function traceDots(page) {
  const q = await qa(page)
  const pts = q?.dotsLeft
  if (!pts?.length) return
  await page.mouse.move(pts[0].x, pts[0].y)
  await page.mouse.down()
  for (const p of [...pts, pts[0]]) {
    await page.mouse.move(p.x, p.y, { steps: 2 })
    await page.waitForTimeout(45)
  }
  await page.mouse.up()
}
/** The finish's loops, one for each surprise, then the giant circle. */
async function finish(page, pause = 500) {
  for (let i = 0; i < 4; i++) {
    await poiCircles(page, 0.8, 1.15, 30)
    await page.waitForTimeout(pause)
  }
  await page.waitForFunction(() => window.__thaiSametQA().phase === 'big', null, { timeout: 8000 }).catch(() => {})
  await page.waitForTimeout(400)
  await poiCircles(page, (q) => q.bigR, 1.15, 40)
}

/** Screenshots (scripts/qa-screens.mjs). */
export const screens = [
  // The way in: Tuk drooping by the dark poi; your unicorn trotting in with her fireflies; the poi catching one by
  // one; Kae's lights flying over the rope; with only two fireflies found (two poi stay dark).
  { name: 'thailand-samet-fire-story', hash: `${SHOW}?round=story&flags=all`, reset: true, act: atBeat('dark', 3.6) },
  { name: 'thailand-samet-fire-story-wait', hash: `${SHOW}?round=story&flags=all`, reset: true, act: atBeat('wait', 1.4) },
  { name: 'thailand-samet-fire-story-lights', hash: `${SHOW}?round=story&flags=all`, reset: true, act: atBeat('lights', 2.4) },
  { name: 'thailand-samet-fire-story-back', hash: `${SHOW}?round=story&flags=all`, reset: true, act: atBeat('back', 1.9) },
  { name: 'thailand-samet-fire-story-light', hash: `${SHOW}?round=story&flags=all`, reset: true, act: atBeat('light', 2.6) },
  { name: 'thailand-samet-fire-story-light2', hash: `${SHOW}?round=story&flags=all`, reset: true, act: atBeat('light2', 1.75) },
  { name: 'thailand-samet-fire-story-yours', hash: `${SHOW}?round=story&flags=all`, reset: true, act: atBeat('yours', 1.15) },
  { name: 'thailand-samet-fire-story-start', hash: `${SHOW}?round=story&flags=all`, reset: true, act: atBeat('start', 1.8) },
  { name: 'thailand-samet-fire-story-two', hash: `${SHOW}?round=story&flags=jetski,snorkel`, reset: true, act: atBeat('light2', 1.2) },
  // The show after the film: the colored fire, the fireflies chasing her lights.
  { name: 'thailand-samet-fire-flies', hash: `${SHOW}?round=twirl&flags=all`, reset: true, wait: 3000, act: async (page) => { await poiCircles(page, 0.7, 1.7, 60) } },
  // The finish: Zoom at the jet ski's nose, Sandy on the castle's top tower (each firefly leads its surprise in).
  { name: 'thailand-samet-fire-lead-ski', hash: `${SHOW}?round=finish&flags=all`, reset: true, wait: 2500, act: async (page) => { await poiCircles(page, 0.8, 1.15, 30); await page.waitForTimeout(3600) } },
  { name: 'thailand-samet-fire-lead-castle', hash: `${SHOW}?round=finish&flags=all`, reset: true, wait: 2500, act: async (page) => { await poiCircles(page, 0.8, 1.15, 30); await page.waitForTimeout(700); await poiCircles(page, 0.8, 1.15, 30); await page.waitForTimeout(1500) } },
  // The thank you: the bow, the heart of light, Kae's wai, and the way home with the heart in the sky.
  { name: 'thailand-samet-fire-thanks', hash: `${SHOW}?round=thanks&flags=all`, reset: true, act: atBeat('best', 2.5) },
  { name: 'thailand-samet-fire-thanks-heart', hash: `${SHOW}?round=thanks&flags=all`, reset: true, act: atBeat('heart', 3.7) },
  { name: 'thailand-samet-fire-thanks-wai', hash: `${SHOW}?round=thanks&flags=all`, reset: true, act: atBeat('thanks', 1.7) },
  { name: 'thailand-samet-fire-home', hash: `${SHOW}?round=thanks&flags=all`, reset: true, act: async (page) => { await filmDone('thanks')(page); await page.waitForFunction(() => window.__thaiSametQA().home, null, { timeout: 8000 }); await page.waitForTimeout(3200) } },
  // The sunset: the fireflies round her horn, and lined up over the three of them for Mom's photo.
  { name: 'thailand-samet-fire-sunset', hash: '#/world/thailand/samet-trip/sunset?flags=all', reset: true, act: sunsetAt(2.5) },
  { name: 'thailand-samet-fire-sunset-photo', hash: '#/world/thailand/samet-trip/sunset?flags=all', reset: true, act: async (page) => { await sunsetAt(1.5)(page); await page.locator('[data-anchor="family:ji"]').click({ force: true }).catch(() => {}); await page.waitForFunction(() => window.__thaiSametQA().turn > 0.97, null, { timeout: 15000 }); await page.waitForTimeout(500) } },
]

/** Filmed moments (scripts/qa-motion.mjs). */
export const motion = [
  // The way-in film, watched to the end (it goes on into the twirl), and in two halves for a closer look.
  { name: 'thailand-samet-fire-story', seconds: 27, setup: open('round=story&flags=all'), act: filmDone('intro') },
  { name: 'thailand-samet-fire-story-a', seconds: 12, setup: open('round=story&flags=all'), act: (page) => page.waitForTimeout(12000) },
  { name: 'thailand-samet-fire-story-b', seconds: 13, setup: async (page, base) => { await open('round=story&flags=all')(page, base); await atBeat('back', 2.2)(page) }, act: filmDone('intro') },
  {
    // The ⏭ held mid-way (as the first poi catches): the show is there at once, as the twirl needs it.
    name: 'thailand-samet-fire-story-skip',
    seconds: 7,
    setup: async (page, base) => {
      await open('round=story&flags=all')(page, base)
      await atBeat('light', 2.1)(page)
    },
    act: async (page) => {
      await holdSkip(page)
      await page.waitForFunction(() => { const q = window.__thaiSametQA(); return !q.film && q.round === 'twirl' && q.lights && !q.staged && q.poiLit.every(Boolean) && q.films.skipped.includes('intro') }, null, { timeout: 5000 })
      await page.waitForTimeout(1200)
      await poiCircles(page, 0.9, 2, 30)
    },
  },
  {
    // Skipped in the very first beat (her lights not given, your unicorn still walking in).
    name: 'thailand-samet-fire-story-skip-early',
    seconds: 5,
    setup: async (page, base) => {
      await open('round=story&flags=all')(page, base)
      await atBeat('wait', 0.9)(page)
    },
    act: async (page) => {
      await holdSkip(page)
      await page.waitForFunction(() => { const q = window.__thaiSametQA(); return !q.film && q.round === 'twirl' && q.lights && !q.staged && q.poiLit.every(Boolean) }, null, { timeout: 5000 })
      await poiCircles(page, 0.9, 2, 30)
    },
  },
  // The fireflies in the show: chasing her lights round small circles, swirling up on big ones.
  {
    name: 'thailand-samet-fire-flies',
    seconds: 10,
    setup: async (page, base) => {
      await open('round=twirl&flags=all')(page, base)
      await page.waitForTimeout(2500)
    },
    act: async (page) => {
      await poiCircles(page, 0.6, 3, 24)
      await poiCircles(page, 1.3, 2, 48)
      await page.waitForTimeout(2000)
    },
  },
  // The finish: each firefly leads its surprise in (the jet ski, the castle, the fish, Dad), one a loop.
  {
    name: 'thailand-samet-fire-lead',
    seconds: 16,
    setup: async (page, base) => {
      await open('round=finish&flags=all')(page, base)
      await page.waitForTimeout(2000)
    },
    act: async (page) => {
      for (let i = 0; i < 4; i++) {
        await poiCircles(page, 0.8, 1.15, 30)
        await page.waitForTimeout(2600)
      }
    },
  },
  // The thank you, watched to the end (the bow, the heart, the wai), then the 🔥 🏆 and the 🏠.
  {
    name: 'thailand-samet-fire-thanks',
    seconds: 18,
    setup: open('round=thanks&flags=all'),
    act: async (page) => {
      await filmDone('thanks')(page)
      await page.waitForFunction(() => window.__thaiSametQA().home, null, { timeout: 8000 })
      await page.waitForTimeout(3000)
    },
  },
  {
    name: 'thailand-samet-fire-thanks-skip',
    seconds: 7,
    setup: async (page, base) => {
      await open('round=thanks&flags=all')(page, base)
      await atBeat('heart', 1.5)(page)
    },
    act: async (page) => {
      await holdSkip(page)
      // The heart is whole in the sky, the dancers back at their places, the way home up.
      await page.waitForFunction(() => { const q = window.__thaiSametQA(); return !q.film && q.heart === 1 && !q.staged && q.home && q.films.skipped.includes('thanks') }, null, { timeout: 8000 })
      await page.getByRole('button', { name: "Home to Agong's house" }).waitFor({ timeout: 8000 })
      await page.waitForTimeout(2500)
    },
  },
  {
    // The whole show, robot-played: the way in, six loops, three shapes, the four surprises and the giant circle, the
    // fireworks, the thank you, the way home.
    name: 'thailand-samet-fire-whole',
    seconds: 115,
    setup: open('round=story&flags=all'),
    act: async (page) => {
      await filmDone('intro')(page)
      await page.waitForFunction(() => { const q = window.__thaiSametQA(); return q.round === 'twirl' && q.lights }, null, { timeout: 5000 })
      await page.waitForTimeout(1500)
      for (let i = 0; i < 5 && (await qa(page)).round === 'twirl'; i++) await poiCircles(page, 0.8, 2, 30)
      for (let s = 0; s < 3; s++) {
        await page.waitForFunction(() => window.__thaiSametQA().phase === 'trace', null, { timeout: 15000 })
        await page.waitForTimeout(500)
        for (let n = 0; n < 4 && (await qa(page)).phase === 'trace'; n++) await traceDots(page)
      }
      await page.waitForFunction(() => window.__thaiSametQA().round === 'finish', null, { timeout: 10000 })
      await page.waitForTimeout(1500)
      await finish(page, 900)
      await page.waitForFunction(() => window.__thaiSametQA().phase === 'fireworks', null, { timeout: 15000 })
      // (A tap on the sky for one more firework, as she would.)
      await page.waitForTimeout(2500)
      await page.mouse.click(300, 220)
      await filmDone('thanks')(page)
      await page.getByRole('button', { name: "Home to Agong's house" }).waitFor({ timeout: 10000 })
      await page.waitForTimeout(3000)
    },
  },
  // The sunset: the fireflies round her horn, lining up for Mom's photo; then the sun pulled down, and night.
  {
    name: 'thailand-samet-fire-sunset',
    seconds: 16,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/sunset?flags=all`)
      await ready(page)
      await sunsetAt(2)(page)
    },
    act: async (page) => {
      await page.locator('[data-anchor="family:ji"]').click({ force: true }).catch(() => {})
      await page.waitForTimeout(4500)
      const q = await qa(page)
      await page.mouse.move(q.sun.x, q.sun.y)
      await page.mouse.down()
      for (let i = 0; i <= 30; i++) {
        await page.mouse.move(q.sun.x, q.sun.y + ((q.horizon.y + 60 - q.sun.y) * i) / 30)
        await page.waitForTimeout(40)
      }
      await page.mouse.up()
      await page.waitForFunction(() => window.__thaiSametQA().phase === 'night', null, { timeout: 12000 })
      await page.getByRole('button', { name: 'To the fire show' }).waitFor({ timeout: 5000 })
      await page.waitForTimeout(2000)
    },
  },
]

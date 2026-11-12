// The jet ski stop's QA scenarios for Zoom's story (story.ts): the way-in film's four beats and the life jacket it
// leaves her at, the found film's three beats, Zoom in play (alongside the jet ski, at the race's start, round the
// horn once she's found) and the two ways she's found without a link (a race lost by a nose, a race won). Filmed: the
// way in to its end, the way in skipped half way (hold ⏭), found to its end and skipped, and the chase in the ride.
// The stop's older runs (the jacket, the waves, the race, parking) are in ../qa.mjs.
// Not part of the app: Node runs it, Vite never sees it.

const LINK = '#/world/thailand/samet-trip/jetski'
const qa = (page) => page.evaluate(() => window.__thaiSametQA?.() ?? {})
const ready = (page) => page.waitForFunction(() => window.__thaiSametQA?.().section === 'jetski', null, { timeout: 30000 })
/** Waits for a film's beat, then `ms` more. */
const beat = (id, ms) => async (page) => {
  await page.waitForFunction((b) => window.__thaiSametQA?.().film?.beat === b, id, { timeout: 90000 })
  await page.waitForTimeout(ms)
}
/** The film is over (played or skipped), or the stop has handed over to the island. */
const filmOver = (id) => (page) =>
  page.waitForFunction(
    (f) => {
      const q = window.__thaiSametQA?.()
      return !!q && (q.section !== 'jetski' || q.films?.done.includes(f) || q.films?.skipped.includes(f))
    },
    id,
    { timeout: 120000 },
  )
const onIsland = (page) => page.waitForFunction(() => window.__thaiSametQA?.().section === 'island', null, { timeout: 30000 })
/** Holds the ⏭ until it skips. */
async function holdSkip(page) {
  const b = await page.getByRole('button', { name: 'Hold to skip the story' }).boundingBox()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(900)
  await page.mouse.up()
}
/** The life jacket on, and out on the water. */
async function jacketOn(page) {
  await page.locator('[data-anchor="jacket"]').waitFor({ state: 'visible', timeout: 15000 })
  await page.locator('[data-anchor="jacket"]').click({ force: true })
  await page.waitForFunction(() => window.__thaiSametQA?.().phase === 'ride', null, { timeout: 8000 })
}
/** A finger held above the jet ski, leaning toward a point on the bay (game meters), until `done(q)` or `ms`. */
async function steerTo(page, goal, done, ms) {
  const vp = page.viewportSize()
  const t0 = Date.now()
  let down = false
  while (Date.now() - t0 < ms) {
    const s = await qa(page)
    if (s.section !== 'jetski' || done(s)) break
    const [gx, gz] = goal(s)
    const want = (Math.atan2(gx - s.x, gz - s.z) * 180) / Math.PI
    const off = ((want - s.heading + 540) % 360) - 180
    // (The chase camera looks along the way it's heading, so a goal to the +x side of the nose is to the screen's left.)
    const x = Math.max(8, Math.min(vp.width - 8, s.ski.x - (Math.abs(off) > 80 ? Math.sign(off) * vp.width * 0.4 : Math.max(-vp.width * 0.4, Math.min(vp.width * 0.4, off * 6)))))
    const y = Math.max(130, s.ski.y - vp.height * 0.4)
    await page.mouse.move(x, y)
    if (!down) {
      await page.mouse.down()
      down = true
    }
    await page.waitForTimeout(110)
  }
  if (down) await page.mouse.up()
}
// (island/layout.ts: the big orange buoy at bay(0, 118), the flags' line in front of the hut at bay(0, 4).)
const BUOY = [44.46, 107.92]
const HOME = [9.24, -0.5]
/** Races the jet ski man: out round the big orange buoy and home between the flags. */
async function race(page) {
  await page.waitForFunction(() => window.__thaiSametQA?.().phase === 'racing', null, { timeout: 20000 })
  await steerTo(page, (s) => (s.leg === 0 ? BUOY : HOME), (s) => s.phase !== 'racing', 90000)
}

/** Screenshots (scripts/qa-screens.mjs). */
export const screens = [
  // The way in: the jet ski man at his hut, Zoom's figure-eight round the flag buoys, nose to nose with her, "She
  // only stops for someone fast!", then the life jacket as the ride has always begun.
  { name: 'thailand-samet-jetski-story-hello', hash: `${LINK}?round=story`, reset: true, act: beat('hello', 2600) },
  { name: 'thailand-samet-jetski-story-zoom', hash: `${LINK}?round=story`, reset: true, act: beat('zoom', 1250) },
  { name: 'thailand-samet-jetski-story-face', hash: `${LINK}?round=story`, reset: true, act: beat('face', 1150) },
  { name: 'thailand-samet-jetski-story-fast', hash: `${LINK}?round=story`, reset: true, act: beat('fast', 1300) },
  {
    name: 'thailand-samet-jetski-story-jacket',
    hash: `${LINK}?round=story`,
    reset: true,
    act: async (page) => {
      await filmOver('intro')(page)
      await page.waitForFunction(() => { const q = window.__thaiSametQA(); return q.phase === 'jacket' && q.round === 'ride' && !q.film }, null, { timeout: 5000 })
      await page.waitForTimeout(2200)
    },
  },
  // Found: Zoom spirals down onto the horn, close on her glowing there, Dad's cheer.
  { name: 'thailand-samet-jetski-found-land', hash: `${LINK}?round=found`, reset: true, act: beat('land', 2500) },
  { name: 'thailand-samet-jetski-found-close', hash: `${LINK}?round=found`, reset: true, act: beat('found', 1000) },
  { name: 'thailand-samet-jetski-found-dad', hash: `${LINK}?round=found`, reset: true, act: beat('dad', 1300) },
  // Zoom in play: alongside the jet ski once it's fast (then she darts ahead), and hovering at the race's start.
  {
    name: 'thailand-samet-jetski-zoom-ride',
    hash: `${LINK}?round=ride`,
    reset: true,
    wait: 2500,
    act: async (page) => {
      const vp = page.viewportSize()
      await jacketOn(page)
      await page.mouse.move(vp.width / 2, vp.height * 0.3)
      await page.mouse.down()
      await page.waitForFunction(() => window.__thaiSametQA?.().zoom.state === 'beside', null, { timeout: 15000 }).catch(() => {})
      await page.waitForTimeout(900)
      await page.mouse.up()
    },
  },
  { name: 'thailand-samet-jetski-zoom-race', hash: `${LINK}?round=race`, reset: true, wait: 3200 },
  // Found already (the trip's flags): she and Sandy ride along round the horn.
  { name: 'thailand-samet-jetski-zoom-horn', hash: `${LINK}?round=ride&flags=jetski,sandcastle`, reset: true, wait: 3500 },
  // Never only by winning: she rounds the buoy, then stops well short of the flags; the jet ski man passes her and
  // wins by a nose, and Zoom still comes down to her. (Nobody touching the race at all ends the same way, but he
  // takes a minute and a half to get round.)
  {
    name: 'thailand-samet-jetski-lost-found',
    hash: `${LINK}?round=race`,
    reset: true,
    act: async (page) => {
      await page.waitForFunction(() => window.__thaiSametQA?.().phase === 'racing', null, { timeout: 20000 })
      await steerTo(page, (s) => (s.leg === 0 ? BUOY : HOME), (s) => s.phase !== 'racing' || (s.leg === 1 && s.v < 58), 90000)
      await page.waitForFunction(() => { const q = window.__thaiSametQA?.(); return !!q && (q.section !== 'jetski' || q.phase !== 'racing') }, null, { timeout: 90000 })
      const won = (await qa(page)).winner
      if (won !== 'him') throw new Error(`the robot was meant to lose this one (${won})`)
      await beat('found', 1000)(page)
    },
  },
  // A race won: the bell, Zoom's found film, and the island with her flag (found=jetski in the address bar).
  {
    name: 'thailand-samet-jetski-won-found',
    hash: `${LINK}?round=race`,
    reset: true,
    act: async (page) => {
      await race(page)
      const won = (await qa(page)).winner
      await onIsland(page)
      if (won !== 'her') throw new Error(`the robot lost the race (${won})`)
      const hash = await page.evaluate(() => location.hash)
      if (!/flags=[^&]*jetski/.test(hash) || !/found=jetski/.test(hash)) throw new Error(`back on the island without Zoom: ${hash}`)
      await page.waitForTimeout(2500)
    },
  },
]

/** Filmed (scripts/qa-motion.mjs). */
export const motion = [
  {
    // The whole way in, then the life jacket.
    name: 'thailand-samet-jetski-story',
    seconds: 18,
    setup: async (page, base) => {
      await page.goto(`${base}${LINK}?round=story`)
      await ready(page)
    },
    act: async (page) => {
      await filmOver('intro')(page)
      const q = await qa(page)
      if (!q.films.done.includes('intro') || q.phase !== 'jacket' || q.round !== 'ride') throw new Error(`after the way in: ${JSON.stringify({ films: q.films, phase: q.phase, round: q.round })}`)
    },
  },
  {
    // Skipped while Zoom is out round the buoys: everyone is back on the jet ski, the life jacket waits.
    name: 'thailand-samet-jetski-story-skip',
    seconds: 7,
    setup: async (page, base) => {
      await page.goto(`${base}${LINK}?round=story`)
      await ready(page)
      await beat('zoom', 900)(page)
    },
    act: async (page) => {
      await holdSkip(page)
      await page.waitForFunction(() => { const q = window.__thaiSametQA(); return !q.film && q.round === 'ride' && q.phase === 'jacket' && q.films.skipped.includes('intro') }, null, { timeout: 5000 })
      const hash = await page.evaluate(() => location.hash)
      if (!hash.includes('round=ride')) throw new Error(`the address bar didn't follow: ${hash}`)
      // And the ride goes on from there: the jacket's tap.
      await page.waitForTimeout(1500)
      await jacketOn(page)
    },
  },
  {
    // Found, to the end: then the island has her.
    name: 'thailand-samet-jetski-found',
    seconds: 12,
    setup: async (page, base) => {
      await page.goto(`${base}${LINK}?round=found`)
      await ready(page)
    },
    act: async (page) => {
      await filmOver('found')(page)
      await onIsland(page)
      const hash = await page.evaluate(() => location.hash)
      if (!/found=jetski/.test(hash)) throw new Error(`back on the island without Zoom: ${hash}`)
    },
  },
  {
    name: 'thailand-samet-jetski-found-skip',
    seconds: 5,
    setup: async (page, base) => {
      await page.goto(`${base}${LINK}?round=found`)
      await ready(page)
      await beat('land', 1200)(page)
    },
    act: async (page) => {
      await holdSkip(page)
      await onIsland(page)
    },
  },
  {
    // The chase: full speed out into the bay, Zoom comes alongside, then darts ahead ("There she is! After her!").
    name: 'thailand-samet-jetski-chase',
    seconds: 11,
    setup: async (page, base) => {
      await page.goto(`${base}${LINK}?round=ride`)
      await ready(page)
      await jacketOn(page)
    },
    act: async (page) => {
      const vp = page.viewportSize()
      await page.mouse.move(vp.width / 2, vp.height * 0.3)
      await page.mouse.down()
      for (let i = 0; i < 100; i++) {
        await page.mouse.move(vp.width / 2 + Math.sin(i / 14) * vp.width * 0.22, vp.height * 0.3)
        await page.waitForTimeout(100)
      }
      await page.mouse.up()
      const q = await qa(page)
      if (!q.zoom.chased) throw new Error('Zoom never came alongside')
    },
  },
  {
    // Getting off before any race: a decent ride, back into the pink ring, and Zoom comes down to her there.
    name: 'thailand-samet-jetski-park-found',
    seconds: 60,
    setup: async (page, base) => {
      await page.goto(`${base}${LINK}?round=ride`)
      await ready(page)
      await jacketOn(page)
    },
    act: async (page) => {
      // Out to sea for a few seconds, then round and back into the ring (island/layout.ts: its middle is bay(0, 3)).
      await steerTo(page, (s) => [s.x + Math.sin((s.heading * Math.PI) / 180) * 30, s.z + Math.cos((s.heading * Math.PI) / 180) * 30], (s) => s.rode > 8, 14000)
      // Back in: a finger held on the pink ring, the way she'd do it (the jet ski heads for the finger). Up the sand
      // instead, the jet ski man pushes it back and she tries again.
      const t0 = Date.now()
      let down = false
      while (Date.now() - t0 < 40000) {
        const s = await qa(page)
        if (s.section !== 'jetski' || s.film?.film === 'found') break
        if (s.phase !== 'ride' || !s.dock.shown) {
          if (down) await page.mouse.up()
          down = false
          await page.waitForTimeout(300)
          continue
        }
        const vp = page.viewportSize()
        const on = s.dock.at.x > 20 && s.dock.at.x < vp.width - 20 && s.dock.at.y > 120 && s.dock.at.y < vp.height - 20
        if (on) await page.mouse.move(s.dock.at.x, s.dock.at.y)
        else {
          // (Behind her: turn round toward it first, the way the pink arrow points.)
          const want = (Math.atan2(8.93 - s.x, -1.45 - s.z) * 180) / Math.PI
          const off = ((want - s.heading + 540) % 360) - 180
          await page.mouse.move(Math.max(8, Math.min(vp.width - 8, s.ski.x - (Math.abs(off) > 80 ? Math.sign(off) * vp.width * 0.4 : off * 6))), Math.max(130, s.ski.y - vp.height * 0.4))
        }
        if (!down) await page.mouse.down()
        down = true
        await page.waitForTimeout(120)
      }
      if (down) await page.mouse.up()
      const q = await qa(page)
      if (q.section === 'jetski' && q.film?.film !== 'found') throw new Error(`parked without Zoom's film: ${JSON.stringify({ phase: q.phase, film: q.film, dock: q.dock, rode: q.rode, zoom: q.zoom })}`)
      await onIsland(page)
    },
  },
]

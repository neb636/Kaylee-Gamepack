// The sandcastle's story QA (Sandy, the shy gold firefly: story.ts). Screens of each film's shots and of Sandy in
// play (peeking out of a hole she dug, round a new tower, hovering over the moat as the tide comes); filmed: the way-in
// film to its end, the same skipped part-way (then a stroke in the sand, to show the game is hers), the found film
// from its link, the same skipped, and the whole stop start to finish (the film, a moat dug round, two towers, the
// tide, a channel to the sea, the moat filling, the found film, the island).
// The stop's own play runs (digging, buckets, burying Dad) are in ../qa.mjs.
// Not part of the app: Node runs it, Vite never sees it.

const LINK = '#/world/thailand/samet-trip/sandcastle'
const qa = (page) => page.evaluate(() => window.__thaiSametQA?.())
const ready = (page) => page.waitForFunction(() => window.__thaiSametQA?.().section === 'sandcastle', null, { timeout: 30000 })
/** Waits for a film's beat, then a little into it. */
const beat = (id, ms) => async (page) => {
  await page.waitForFunction((b) => window.__thaiSametQA?.().film?.beat === b, id, { timeout: 60000 })
  await page.waitForTimeout(ms)
}
/** Waits until a film has been played to its end or skipped (or the stop has gone back to the island after it). */
const filmOver = (id) => async (page) => {
  await page.waitForFunction(
    (f) => {
      const q = window.__thaiSametQA?.()
      return !location.hash.includes('/sandcastle') || (q?.films && !q.film && (q.films.done.includes(f) || q.films.skipped.includes(f)))
    },
    id,
    { timeout: 90000 },
  )
}
/** Holds the film's ⏭ until it skips. */
async function holdSkip(page) {
  const b = await page.getByRole('button', { name: 'Hold to skip the story' }).boundingBox()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(900)
  await page.mouse.up()
}
/** Screen pixels to a meter of sand at the castle. */
const scale = (q) => Math.abs(q.sea0.y - q.castle.y) / 5.3

/** Her finger round the castle: a moat (`loops` times round). */
async function digRing(page, loops = 2) {
  const q = await qa(page)
  const c = q.castle
  const pm = scale(q)
  await page.mouse.move(c.x + 1.25 * pm, c.y)
  await page.mouse.down()
  for (let i = 1; i <= loops * 40; i++) {
    const t = (i / 40) * Math.PI * 2
    await page.mouse.move(c.x + Math.cos(t) * 1.25 * pm, c.y + Math.sin(t) * 0.8 * pm)
    await page.waitForTimeout(45)
  }
  await page.mouse.up()
}
/** A deep hole dug with a little scribble, `dx`, `dy` meters from the castle's middle. */
async function digHole(page, dx, dy) {
  const q = await qa(page)
  const pm = scale(q)
  const x = q.castle.x + dx * pm
  const y = q.castle.y + dy * pm
  await page.mouse.move(x, y)
  await page.mouse.down()
  for (let i = 0; i < 26; i++) {
    await page.mouse.move(x + Math.cos(i * 1.3) * 8, y + Math.sin(i * 1.3) * 6)
    await page.waitForTimeout(45)
  }
  await page.mouse.up()
}
/** Drags mould `i` through the sand until it is full (it scoops), lets go, then taps it: a tower where it stands. */
async function makeTower(page, i) {
  const vp = page.viewportSize()
  const u = Math.min(vp.width, vp.height) / 12
  let m = (await qa(page)).moulds[i]
  await page.mouse.move(m.x, m.y)
  await page.mouse.down()
  for (let k = 1; k <= 90; k++) {
    await page.mouse.move(m.x + Math.sin(k * 0.35) * u * 1.4, m.y - Math.min(1, k / 36) * u * 2.2 - Math.sin(k * 0.2) * u * 0.3)
    await page.waitForTimeout(60)
    if (k % 6 === 0 && (await qa(page)).fills[i] >= 1) break
  }
  await page.mouse.up()
  await page.waitForTimeout(600)
  const q = await qa(page)
  if (q.fills[i] < 1) throw new Error(`mould ${i} should be full after a drag through the sand: ${q.fills[i]}`)
  m = q.moulds[i]
  await page.mouse.click(m.x, m.y)
}
/** A channel from the moat's sea side down to the water (three strokes). */
async function digChannel(page) {
  const q = await qa(page)
  const c = q.castle
  const s = q.sea0
  const pm = scale(q)
  const y0 = c.y - 0.85 * pm
  for (let r = 0; r < 3; r++) {
    await page.mouse.move(c.x + 0.7 * pm, y0)
    await page.mouse.down()
    for (let i = 1; i <= 17; i++) {
      await page.mouse.move(c.x + 0.7 * pm, y0 + (i / 17) * (s.y - 25 - y0))
      await page.waitForTimeout(45)
    }
    await page.mouse.up()
  }
}
const sandy = (mode) => (page) => page.waitForFunction((m) => { const s = window.__thaiSametQA?.().sandy; return s?.mode === m && s.out }, mode, { timeout: 30000 })

export const screens = [
  // The way in: the three of them and the glow, Sandy's close shot, Mom's line with Sandy's eyes over the rim, Dad's
  // idea, and the game as the film leaves it.
  { name: 'thailand-samet-sand-story-glow', hash: `${LINK}?round=story`, reset: true, wait: 600, act: beat('glow', 1800) },
  { name: 'thailand-samet-sand-story', hash: `${LINK}?round=story`, reset: true, wait: 600, act: beat('pop', 1150) },
  { name: 'thailand-samet-sand-story-shy', hash: `${LINK}?round=story`, reset: true, wait: 600, act: beat('shy', 1900) },
  { name: 'thailand-samet-sand-story-castle', hash: `${LINK}?round=story`, reset: true, wait: 600, act: beat('castle', 1300) },
  { name: 'thailand-samet-sand-story-dig', hash: `${LINK}?round=story`, reset: true, wait: 600, act: async (page) => { await filmOver('intro')(page); await page.waitForTimeout(2500) } },
  // Found: Sandy on the tallest tower in her close shot, then everyone round the glowing castle.
  { name: 'thailand-samet-sand-found', hash: `${LINK}?round=found`, reset: true, wait: 600, act: beat('home', 1900) },
  { name: 'thailand-samet-sand-found-castle', hash: `${LINK}?round=found`, reset: true, wait: 600, act: beat('dad', 1500) },
  // Sandy in play: out of a hole she dug, round a new tower, over the moat as the tide comes.
  {
    name: 'thailand-samet-sand-sandy-hole',
    hash: `${LINK}?round=dig`,
    reset: true,
    wait: 2500,
    act: async (page) => {
      await digHole(page, -1.6, -0.4)
      await sandy('peek')(page)
      await page.waitForTimeout(600)
    },
  },
  {
    name: 'thailand-samet-sand-sandy-tower',
    hash: `${LINK}?round=towers`,
    reset: true,
    wait: 2500,
    act: async (page) => {
      await makeTower(page, 0)
      await sandy('tower')(page)
      await page.waitForTimeout(700)
    },
  },
  { name: 'thailand-samet-sand-sandy-tide', hash: `${LINK}?round=tide`, reset: true, wait: 4500 },
  // A visit after she is found: no film, she rides along by the unicorn's horn.
  { name: 'thailand-samet-sand-sandy-horn', hash: `${LINK}?round=dig&flags=sandcastle`, reset: true, wait: 3500 },
]

const open = (round, more = '') => async (page, base) => {
  await page.goto(`${base}${LINK}?round=${round}${more}`)
  await ready(page)
}

export const motion = [
  // The way-in film, to its end (then the game's camera, Sparkle's line).
  { name: 'thailand-samet-sand-story', seconds: 18, setup: open('story'), act: filmOver('intro') },
  // Skipped in Sandy's close shot: everyone is where the game has them, and a stroke digs.
  {
    name: 'thailand-samet-sand-story-skip',
    seconds: 9,
    setup: async (page, base) => {
      await open('story')(page, base)
      await beat('pop', 1200)(page)
    },
    act: async (page) => {
      await holdSkip(page)
      await page.waitForFunction(() => { const q = window.__thaiSametQA(); return !q.film && q.round === 'dig' && q.films.skipped.includes('intro') && q.sandy.mode === 'under' }, null, { timeout: 5000 })
      await page.waitForTimeout(2600)
      await digRing(page, 1)
      const q = await qa(page)
      if (!(q.strokes >= 1 && q.dug > 0.01)) throw new Error(`after the skip a stroke should dig: strokes ${q.strokes}, dug ${q.dug}`)
    },
  },
  // The found film from its link (a castle built for it), to its end: then the island.
  { name: 'thailand-samet-sand-found', seconds: 13, setup: open('found'), act: filmOver('found') },
  {
    name: 'thailand-samet-sand-found-skip',
    seconds: 6,
    setup: async (page, base) => {
      await open('found')(page, base)
      await beat('home', 800)(page)
    },
    act: async (page) => {
      await holdSkip(page)
      // Skipped, it still ends the stop: the island, Sandy's flag up.
      await page.waitForFunction(() => location.hash.includes('/island') && location.hash.includes('sandcastle'), null, { timeout: 8000 })
    },
  },
  // The whole stop: the film (skipped, it has its own run), a moat dug round (Sandy peeks out of it), two towers (she
  // peeks round them), the tide, a channel to the sea, the moat fills, the found film, the island with her flag.
  {
    name: 'thailand-samet-sand-whole',
    seconds: 75,
    setup: async (page, base) => {
      await open('story', '&feel.sandPlay.towers=2&feel.sandTide.time=4')(page, base)
      await beat('pop', 600)(page)
    },
    act: async (page) => {
      await holdSkip(page)
      await page.waitForFunction(() => { const q = window.__thaiSametQA(); return !q.film && q.round === 'dig' }, null, { timeout: 5000 })
      // (The camera glides back to the game's shot first: the robot reads the castle's place on screen from it.)
      await page.waitForTimeout(2600)
      await digRing(page, 2)
      await page.waitForFunction(() => window.__thaiSametQA().round === 'towers', null, { timeout: 20000 })
      await page.waitForFunction(() => window.__thaiSametQA().sandy.peeks >= 1, null, { timeout: 20000 })
      for (const i of [0, 1]) {
        await page.waitForFunction((k) => window.__thaiSametQA().moulds[k].state === 'home', i, { timeout: 10000 })
        await makeTower(page, i)
        await page.waitForFunction((n) => window.__thaiSametQA().towersStanding >= n, i + 1, { timeout: 10000 })
        await page.waitForTimeout(1500)
      }
      await page.waitForFunction(() => window.__thaiSametQA().round === 'tide', null, { timeout: 10000 })
      await page.waitForFunction(() => window.__thaiSametQA().tide > 0.9, null, { timeout: 20000 })
      await digChannel(page)
      await page.waitForFunction(() => window.__thaiSametQA().moatFilled, null, { timeout: 20000 })
      await page.waitForFunction(() => window.__thaiSametQA?.().film?.film === 'found', null, { timeout: 10000 })
      await page.waitForFunction(() => location.hash.includes('/island') && location.hash.includes('sandcastle'), null, { timeout: 30000 })
      await page.waitForTimeout(1500)
    },
  },
]

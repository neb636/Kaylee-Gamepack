// Snorkeling at Ko Kudi: the QA scenarios of Bubbles' story (story.ts). Screens: each shot of the way-in film (the bow
// two-shot, the captain close, the bubble sinking in the garden, "Can you find her?"), the moment after it (on the
// ladder, the captain on the bow), the blue glow in view on the way to the garden, the cuttlefish hugging the bubble,
// and each shot of the found film. Filmed: the way-in film to its end and her splash in, the film skipped half way
// (⏭ held), the glow coming into view behind the parrotfish, the cuttlefish reached three times and the found film
// after it, the found film from its link to the island, and the found film skipped.
// The trip's other snorkel runs (float, follow, cuttle) are in ../qa.mjs.
// Not part of the app: Node runs it, Vite never sees it.

const LINK = '#/world/thailand/samet-trip/snorkel'
const qa = (page) => page.evaluate(() => window.__thaiSametQA?.())
const ready = (page) => page.waitForFunction(() => window.__thaiSametQA?.().section === 'snorkel', null, { timeout: 30000 })
/** Waits until a film is `ms` into a beat (the film's own clock: a slow test browser films the same moment). */
const beat = (id, ms) => (page) => page.waitForFunction(([b, s]) => { const f = window.__thaiSametQA?.().film; return f?.beat === b && f.t >= s }, [id, ms / 1000], { timeout: 90000 })
/** A film is over (played to its end or skipped). */
const filmOver = (page, id) => page.waitForFunction((f) => { const q = window.__thaiSametQA?.(); return q?.films && (q.films.done.includes(f) || q.films.skipped.includes(f)) }, id, { timeout: 90000 })
/** The found film ends on the island (the shell takes her there): the snorkel's own readout is gone by then. */
const onIsland = (page) => page.waitForFunction(() => location.hash.includes('/island'), null, { timeout: 90000 })

/** Holds the film's ⏭ until it skips. */
async function holdSkip(page) {
  const b = await page.getByRole('button', { name: 'Hold to skip the story' }).boundingBox()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(950)
  await page.mouse.up()
}

/** Holds a finger on something the readout gives a screen point for (`parrotAt`, `cuttleAt`, `bubbleAt`), following
 *  it, for `ms` or until `until(readout)`. A film on screen (the found film) ends it too. */
async function lead(page, key, ms, until = () => false) {
  const vp = page.viewportSize()
  const at = (p) => [Math.max(5, Math.min(vp.width - 5, p.x)), Math.max(130, Math.min(vp.height - 5, p.y))]
  let q = await qa(page)
  if (!q?.[key]) return
  await page.mouse.move(...at(q[key]))
  await page.mouse.down()
  for (let t = 0; t < ms; t += 200) {
    q = await qa(page)
    if (!q?.[key] || q.film || until(q)) break
    await page.mouse.move(...at(q[key]))
    await page.waitForTimeout(200)
  }
  await page.mouse.up()
}
/** Reaches the cuttlefish three times (it jets off twice), then waits for the found film to begin. */
async function catchCuttle(page) {
  for (let i = 0; i < 3; i++) {
    await lead(page, 'cuttleAt', 30000, (q) => q.cuttleBest > i)
    await page.waitForTimeout(i < 2 ? 2400 : 200)
  }
  await page.waitForFunction(() => window.__thaiSametQA?.().film?.film === 'found', null, { timeout: 15000 })
}

export const screens = [
  { name: 'thailand-samet-snorkel-story', hash: `${LINK}?round=story`, reset: true, wait: 500, act: beat('fell', 2200) },
  { name: 'thailand-samet-snorkel-story-captain', hash: `${LINK}?round=story`, reset: true, wait: 500, act: beat('bubble', 1700) },
  { name: 'thailand-samet-snorkel-story-sink', hash: `${LINK}?round=story`, reset: true, wait: 500, act: beat('sink', 1500) },
  { name: 'thailand-samet-snorkel-story-hug', hash: `${LINK}?round=story`, reset: true, wait: 500, act: beat('sink', 3300) },
  { name: 'thailand-samet-snorkel-story-down', hash: `${LINK}?round=story`, reset: true, wait: 500, act: beat('down', 1600) },
  // The film is over: she is on the ladder, the captain on the bow sends her in.
  { name: 'thailand-samet-snorkel-story-ready', hash: `${LINK}?round=story`, reset: true, wait: 500, act: async (page) => { await filmOver(page, 'intro'); await page.waitForTimeout(500) } },
  // The blue glow comes into view on the way to the garden (Sparkle: "A blue glow!").
  { name: 'thailand-samet-snorkel-glow', hash: `${LINK}?round=follow`, reset: true, wait: 3000, act: async (page) => { await lead(page, 'parrotAt', 60000, (q) => q.seen); await page.waitForTimeout(900) } },
  // The garden: the cuttlefish hugging her bubble, a few meters off.
  { name: 'thailand-samet-snorkel-hug', hash: `${LINK}?round=cuttle`, reset: true, wait: 2500, act: async (page) => { await lead(page, 'bubbleAt', 4000, (q) => q.cuttleStage > 0); await page.waitForTimeout(300) } },
  { name: 'thailand-samet-snorkel-found-rise', hash: `${LINK}?round=found`, reset: true, wait: 300, act: beat('rise', 1500) },
  { name: 'thailand-samet-snorkel-found-pop', hash: `${LINK}?round=found`, reset: true, wait: 300, act: beat('pop', 1150) },
  { name: 'thailand-samet-snorkel-found-loops', hash: `${LINK}?round=found`, reset: true, wait: 300, act: beat('pop', 2200) },
  { name: 'thailand-samet-snorkel-found-saved', hash: `${LINK}?round=found`, reset: true, wait: 300, act: beat('saved', 1300) },
  { name: 'thailand-samet-snorkel-found', hash: `${LINK}?round=found`, reset: true, wait: 300, act: beat('found', 1800) },
]

const open = (round) => async (page, base) => {
  await page.goto(`${base}${LINK}?round=${round}`)
  await ready(page)
}

export const motion = [
  {
    // The way-in film to its end, then "Masks on! Jump in!" and her splash in.
    name: 'thailand-samet-snorkel-story',
    seconds: 22,
    setup: open('story'),
    act: async (page) => {
      await filmOver(page, 'intro')
      await page.waitForFunction(() => window.__thaiSametQA?.().phase === 'float', null, { timeout: 15000 })
    },
  },
  {
    // ⏭ held while the bubble sinks: she is on the ladder, the float round begins.
    name: 'thailand-samet-snorkel-story-skip',
    seconds: 7,
    setup: async (page, base) => {
      await open('story')(page, base)
      await beat('sink', 900)(page)
    },
    act: async (page) => {
      await holdSkip(page)
      await page.waitForFunction(() => { const q = window.__thaiSametQA(); return !q.film && q.round === 'float' && q.films.skipped.includes('intro') && q.bubbles === 'held' }, null, { timeout: 5000 })
      await page.waitForFunction(() => window.__thaiSametQA().phase === 'float', null, { timeout: 8000 })
    },
  },
  {
    // Behind the parrotfish, through the gap and over the sand: the blue glow comes into view.
    name: 'thailand-samet-snorkel-glow',
    seconds: 34,
    setup: async (page, base) => {
      await open('follow')(page, base)
      await page.waitForTimeout(2500)
    },
    act: async (page) => {
      await lead(page, 'parrotAt', 60000, (q) => q.seen)
      await lead(page, 'bubbleAt', 3000)
    },
  },
  {
    // The whole last round: the cuttlefish reached three times (rainbow, stripes, pink), the bubble let go, the found
    // film, the island.
    name: 'thailand-samet-snorkel-cuttle-found',
    seconds: 46,
    setup: async (page, base) => {
      await open('cuttle')(page, base)
      await page.waitForTimeout(1500)
    },
    act: async (page) => {
      await catchCuttle(page)
      await onIsland(page)
    },
  },
  {
    // The found film from its link, to the island.
    name: 'thailand-samet-snorkel-found',
    seconds: 14,
    setup: open('found'),
    act: onIsland,
  },
  {
    // ⏭ held as the bubble pops: straight to the island, Bubbles found.
    name: 'thailand-samet-snorkel-found-skip',
    seconds: 6,
    setup: async (page, base) => {
      await open('found')(page, base)
      await beat('pop', 300)(page)
    },
    act: async (page) => {
      await holdSkip(page)
      await onIsland(page)
    },
  },
]

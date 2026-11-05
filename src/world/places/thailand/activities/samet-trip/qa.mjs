// The Koh Samet trip's QA scenarios. Greybox 1, the jet ski at Sai Kaew: the life jacket, the waves round mid-ride and
// the race's start; filmed: carving doughnuts in the calm bay (the wake loop, Daddy dizzy), and steering into the waves
// to jump. Greybox 2, the island to roam: landing at Na Dan pier, Sai Kaew with the jet ski hers, Ao Prao in the
// afternoon, the night; filmed: leading Kaylee down the beach into the sea (the gallop, the floatie), and the umbrella
// kite.
// Not part of the app: Node runs it, Vite never sees it.

const ready = (page) => page.waitForFunction(() => window.__thaiSametQA?.().phase, null, { timeout: 20000 })

/** Screenshots (scripts/qa-screens.mjs). */
export const screens = [
  { name: 'thailand-samet-island-nadan', hash: '#/world/thailand/samet-trip/island?at=nadan', reset: true, wait: 2500 },
  { name: 'thailand-samet-island-saikaew', hash: '#/world/thailand/samet-trip/island?at=saikaew&flags=jetski', reset: true, wait: 2500 },
  { name: 'thailand-samet-island-prao', hash: '#/world/thailand/samet-trip/island?at=prao&flags=jetski,sandcastle,snorkel', reset: true, wait: 2500 },
  { name: 'thailand-samet-island-night', hash: '#/world/thailand/samet-trip/island?at=saikaew&flags=all&time=night', reset: true, wait: 2500 },
  { name: 'thailand-samet-jetski-jacket', hash: '#/world/thailand/samet-trip/jetski?round=ride', reset: true, wait: 3500 },
  {
    name: 'thailand-samet-jetski-waves',
    hash: '#/world/thailand/samet-trip/jetski?round=waves',
    reset: true,
    wait: 2500,
    act: async (page) => {
      const vp = page.viewportSize()
      await page.mouse.move(vp.width / 2, vp.height * 0.3)
      await page.mouse.down()
      await page.waitForTimeout(3000)
      await page.mouse.up()
    },
  },
  { name: 'thailand-samet-jetski-race', hash: '#/world/thailand/samet-trip/jetski?round=race', reset: true, wait: 2500 },
]

/** Filmed moments (scripts/qa-motion.mjs). */
export const motion = [
  {
    name: 'thailand-samet-island-lead',
    seconds: 10,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/island?at=saikaew`)
      await ready(page)
    },
    act: async (page) => {
      // Lead her along the sand (a finger far ahead: the gallop, hoofprints), then down into the sea (the floatie).
      const vp = page.viewportSize()
      await page.mouse.move(vp.width * 0.15, vp.height * 0.45)
      await page.mouse.down()
      await page.waitForTimeout(4000)
      await page.mouse.move(vp.width * 0.2, vp.height * 0.85)
      await page.waitForTimeout(5000)
      await page.mouse.up()
    },
  },
  {
    name: 'thailand-samet-island-kite',
    seconds: 5,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/island?at=hinkhok`)
      await ready(page)
    },
    act: async (page) => {
      // Poke the umbrella three times: it takes off like a kite with Kaylee holding on.
      for (let i = 0; i < 3; i++) {
        await page.locator('[data-anchor="umbrella:0"]').click({ force: true })
        await page.waitForTimeout(150)
      }
      await page.waitForTimeout(4000)
    },
  },
  {
    name: 'thailand-samet-jetski-carve',
    seconds: 10,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/jetski?round=ride`)
      await ready(page)
      await page.locator('[data-anchor="jacket"]').click({ force: true })
      await page.waitForFunction(() => window.__thaiSametQA?.().phase === 'ride', null, { timeout: 8000 })
    },
    act: async (page) => {
      const vp = page.viewportSize()
      // Straight out, then hold far to one side: doughnuts (the wake closes into a loop, Daddy goes dizzy).
      await page.mouse.move(vp.width / 2, vp.height * 0.3)
      await page.mouse.down()
      await page.waitForTimeout(2500)
      await page.mouse.move(vp.width * 0.95, vp.height * 0.62)
      await page.waitForTimeout(7000)
      await page.mouse.up()
    },
  },
  {
    name: 'thailand-samet-jetski-jumps',
    seconds: 8,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/jetski?round=waves`)
      await ready(page)
    },
    act: async (page) => {
      const vp = page.viewportSize()
      const x = vp.width / 2
      await page.mouse.move(x, vp.height * 0.3)
      await page.mouse.down()
      for (let i = 0; i < 75; i++) {
        await page.mouse.move(x + Math.sin(i / 12) * vp.width * 0.2, vp.height * 0.3)
        await page.waitForTimeout(100)
      }
      await page.mouse.up()
    },
  },
]

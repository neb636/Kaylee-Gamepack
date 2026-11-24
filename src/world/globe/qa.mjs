// The home globe's filmed moments (scripts/qa-motion.mjs and scripts/reel.mjs): spinning it, a flick, a continent's
// name, and the flight to a country. Its screenshots are with the other home screens in scripts/qa-screens.mjs.
// Not part of the app: Node runs it, Vite never sees it.

/** The home screen with some stamps in the passport, so the pins' rings show (Australia is finished: its gold cup). */
async function home(page, base) {
  const passport = { visited: ['australia', 'italy', 'egypt', 'thailand'], stamps: { australia: ['outback', 'forest', 'reef', 'stars', 'croc', 'postcard'], italy: ['pizzeria', 'venice'], egypt: ['pyramid', 'nile', 'sphinx', 'market'], thailand: ['boat-trip'] } }
  await page.evaluate(([key, value]) => localStorage.setItem(key, value), [`kaylee-gamepack:${new URL(base).pathname}:world`, JSON.stringify(passport)])
  await page.reload()
  await page.getByRole('button', { name: /let's play/i }).click({ timeout: 3000 }).catch(() => {})
  await page.goto(`${base}#/world?view=map`)
  // It turns into place as it arrives.
  await page.waitForTimeout(2300)
}

/** The middle of the globe and its radius on the page. */
async function ball(page) {
  const box = await page.locator('.globe-ball').boundingBox()
  return { x: box.x + box.width / 2, y: box.y + box.height / 2, r: box.width / 2.7 }
}

/** A finger from (x0, y0) to (x1, y1) in `ms`; `rest` ms still before it lifts (no rest: a flick). */
async function swipe(page, x0, y0, x1, y1, ms, rest = 0) {
  const steps = Math.max(4, Math.round(ms / 16))
  await page.mouse.move(x0, y0)
  await page.mouse.down()
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps)
    await page.waitForTimeout(ms / steps)
  }
  if (rest) await page.waitForTimeout(rest)
  await page.mouse.up()
}

export const motion = [
  {
    // The core verb: she turns the world with her finger, flicks it and it keeps spinning, then taps the land.
    name: 'globe-spin',
    seconds: 9,
    setup: home,
    act: async (page) => {
      const { x, y, r } = await ball(page)
      await swipe(page, x + r * 0.3, y + r * 0.1, x - r * 0.5, y + r * 0.2, 900, 250)
      await page.waitForTimeout(500)
      await swipe(page, x + r * 0.5, y - r * 0.1, x - r * 0.4, y - r * 0.05, 140)
      await page.waitForTimeout(3600)
      // Whichever continent has come to the front: a tap names it.
      await page.locator('.globe-land:visible').first().click({ force: true })
      await page.waitForTimeout(1200)
    },
  },
  {
    // The payoff: a tap on a country's pin, the globe turns it to the front, the balloon lands on it, the screen opens.
    name: 'globe-fly',
    seconds: 3.4,
    setup: home,
    act: async (page) => {
      await page.getByRole('button', { name: 'Egypt', exact: true }).click({ force: true })
    },
  },
]

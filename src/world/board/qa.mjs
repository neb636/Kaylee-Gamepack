// QA for the world board (#/world): filmed moments for scripts/qa-motion.mjs and scripts/reel.mjs. Not part of the app:
// Node runs it, Vite never sees it. (Its screenshots are in scripts/qa-screens.mjs with the rest of the home screen.)

const open = async (page, base) => {
  await page.goto(`${base}#/world?view=map`)
  await page.getByRole('button', { name: /let's play/i }).click({ timeout: 3000 }).catch(() => {})
  await page.waitForFunction(() => window.__worldBoardQA?.().buildMs, null, { timeout: 30000 })
  await page.waitForTimeout(1500)
}
const tap = async (page, name) => {
  const b = await page.getByRole('button', { name, exact: true }).boundingBox()
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
}

/** Filmed moments: the board at rest, things poked, and a flight to a country. */
export const motion = [
  {
    name: 'world-board-poke',
    seconds: 11,
    setup: open,
    act: async (page) => {
      await page.waitForTimeout(1800)
      await tap(page, 'The whale')
      await page.waitForTimeout(2200)
      // A continent says its name: the middle of Africa.
      const size = page.viewportSize()
      await page.mouse.click(size.width * 0.46, size.height * 0.56)
      await page.waitForTimeout(1800)
      await tap(page, 'The sailboat')
      await page.waitForTimeout(1800)
      await tap(page, "Sparkle's balloon")
      await page.waitForTimeout(2600)
    },
  },
  {
    name: 'world-board-fly-italy',
    seconds: 4,
    setup: open,
    act: async (page) => {
      await page.waitForTimeout(700)
      await tap(page, 'Italy')
      await page.waitForTimeout(1750)
    },
  },
  {
    name: 'world-board-fly-australia',
    seconds: 4,
    setup: open,
    act: async (page) => {
      await page.waitForTimeout(700)
      await tap(page, 'Australia')
      await page.waitForTimeout(1750)
    },
  },
]

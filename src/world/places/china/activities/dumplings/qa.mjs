// The Dumpling House's own QA scenarios (3D, counter.ts): the opening, each round at a handy step, the payoff, and
// filmed moments of the core verb (squish a ball flat, fold a half-moon, pinch the pleats round a soup dumpling). The
// robot finger reads where things are from window.__chinaDumplingsQA(). Not part of the app: Node runs it, Vite never
// sees it.
import { vp } from '../../../../../../scripts/qa-lib.mjs'

const ready = (page) => page.waitForFunction(() => window.__chinaDumplingsQA?.().stage, null, { timeout: 30000 })
const qa = (page) => page.evaluate(() => window.__chinaDumplingsQA())

export const screens = [
  { name: 'dumplings-open', hash: '#/world/china/dumplings/open', reset: true, wait: 2500 },
  { name: 'dumplings-play', hash: '#/world/china/dumplings/play', reset: true, wait: 2500 },
  { name: 'dumplings-grandpa-fold', hash: '#/world/china/dumplings/grandpa?at=fold', reset: true, wait: 2500 },
  { name: 'dumplings-grandpa-steam', hash: '#/world/china/dumplings/grandpa?at=steam', reset: true, wait: 2500 },
  { name: 'dumplings-colors', hash: '#/world/china/dumplings/colors', reset: true, wait: 2500 },
  { name: 'dumplings-colors-serve', hash: '#/world/china/dumplings/colors?at=serve', reset: true, wait: 2500 },
  { name: 'dumplings-giant', hash: '#/world/china/dumplings/giant', reset: true, wait: 2500 },
  { name: 'dumplings-payoff', hash: '#/world/china/dumplings/payoff?made=cream,pink,green,swirl-yellow,giant-pink,tiny-green', reset: true, wait: 5500 },
]

export const motion = [
  {
    // Squish: four presses on the ball, then a stretch, then the wrapper.
    name: 'dumplings-squish',
    seconds: 4,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/china/dumplings/play`)
      await ready(page)
      await page.waitForTimeout(1800)
    },
    act: async (page) => {
      const { piece } = await qa(page)
      if (!piece) return
      for (let i = 0; i < 3; i++) {
        await page.mouse.move(piece.x + (i - 1) * 18, piece.y)
        await page.mouse.down()
        await page.waitForTimeout(260)
        await page.mouse.up()
        await page.waitForTimeout(300)
      }
      void vp
    },
  },
  {
    // Fold: push the near edge of a filled wrapper over into a half-moon.
    name: 'dumplings-fold',
    seconds: 3,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/china/dumplings/grandpa?at=fold`)
      await ready(page)
      await page.waitForTimeout(1800)
    },
    act: async (page) => {
      const { piece } = await qa(page)
      if (!piece) return
      await page.mouse.move(piece.x, piece.y + 40)
      await page.mouse.down()
      await page.mouse.move(piece.x, piece.y - 90, { steps: 24 })
      await page.mouse.up()
    },
  },
  {
    // Pleat: a finger all the way round the rim; a pleat rises under it each step, then it twists shut.
    name: 'dumplings-pleat',
    seconds: 4,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/china/dumplings/colors?at=fold`)
      await ready(page)
      await page.waitForTimeout(1800)
    },
    act: async (page) => {
      const { piece } = await qa(page)
      if (!piece) return
      const r = 60 + piece.r * 380
      await page.mouse.move(piece.x + r, piece.y)
      await page.mouse.down()
      for (let i = 0; i <= 60; i++) {
        const a = (i / 60) * Math.PI * 2.1
        await page.mouse.move(piece.x + Math.cos(a) * r, piece.y + Math.sin(a) * r * 0.6)
        await page.waitForTimeout(25)
      }
      await page.mouse.up()
    },
  },
]

// China's QA scenarios, picked up by scripts/qa-screens.mjs (screens), qa-pacing.mjs (pacing) and
// qa-motion.mjs (motion). A new activity can keep its own next to its sections.ts (activities/<id>/qa.mjs);
// sections no screen reaches get a plain screenshot anyway. Not part of the app: Node runs it, Vite never sees it.
import { skip } from '../../../../scripts/qa-lib.mjs'

/** Screenshots (scripts/qa-screens.mjs): how to get to each screen from a fresh start. */
export const screens = [
  { name: 'china-intro', hash: '#/world/china', reset: true, wait: 300 },
  { name: 'china-hub', hash: '#/world/china', act: skip },
  // China: open the exact section instead of replaying earlier rounds.
  { name: 'dumplings-arrive', hash: '#/world/china/dumplings/arrive', reset: true, wait: 400 },
  { name: 'dumplings-oldtown', hash: '#/world/china/dumplings/walk', reset: true },
  { name: 'dumplings-kitchen', hash: '#/world/china/dumplings/k1', reset: true, wait: 2200 },
  { name: 'dumplings-kitchen3', hash: '#/world/china/dumplings/k3?at=make&baskets=baobao:pink-green-yellow', reset: true, wait: 1500 },
  { name: 'dumplings-dining2', hash: '#/world/china/dumplings/d2', reset: true, wait: 1500 },
  { name: 'bamboo-story', hash: '#/world/china/bamboo/story', reset: true, wait: 400 },
  { name: 'bamboo-round1', hash: '#/world/china/bamboo/r1', reset: true },
  {
    name: 'bamboo-grown',
    hash: '#/world/china/bamboo/r1',
    reset: true,
    act: async (p) => {
      await p.getByRole('button', { name: 'bamboo shoot' }).click({ force: true }).catch(() => {})
      await p.waitForTimeout(900)
      await p.getByRole('button', { name: 'bamboo shoot' }).click({ force: true }).catch(() => {})
      await p.waitForTimeout(900)
    },
  },
  { name: 'wall-story', hash: '#/world/china/wall/story', reset: true, wait: 400 },
  { name: 'wall-gap1', hash: '#/world/china/wall/brick', reset: true },
  {
    name: 'wall-gap1-wrong',
    hash: '#/world/china/wall/brick',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      await p.getByRole('button', { name: 'gold brick' }).click({ force: true }).catch(() => {})
      await p.waitForTimeout(700)
    },
  },
  { name: 'hotpot-story', hash: '#/world/china/hotpot/story', reset: true, wait: 400 },
  { name: 'hotpot-play', hash: '#/world/china/hotpot/noodles-drop', reset: true, wait: 1800 },
  { name: 'brush-story', hash: '#/world/china/brush/story', reset: true, wait: 400 },
  { name: 'brush-play', hash: '#/world/china/brush/ren', reset: true, wait: 1800 },
  { name: 'race-story', hash: '#/world/china/race/story', reset: true, wait: 400 },
  { name: 'race-play', hash: '#/world/china/race/board', reset: true, wait: 1800 },
  { name: 'train-story', hash: '#/world/china/train/story', reset: true, wait: 400 },
  { name: 'train-play', hash: '#/world/china/train/harbin', reset: true, wait: 1800 },
  { name: 'china-parade', hash: '#/world/china/party/drive?stamps=all', stampAll: 'china', wait: 2500 },
  { name: 'china-hub-done', hash: '#/world/china', stampAll: 'china', act: skip },
]

/** Auto-played runs (scripts/qa-pacing.mjs): talk before the first touch, talk per touch, the play strip. */
export const pacing = [
  { name: 'china intro + map', id: 'china', hash: '#/world/china', reset: true, play: false },
  { name: 'china dumpling house', id: 'dumplings', hash: '#/world/china/dumplings', reset: true },
  { name: 'china great wall', id: 'wall', hash: '#/world/china/wall', reset: true },
  { name: 'china bamboo forest', id: 'bamboo', hash: '#/world/china/bamboo', reset: true },
  { name: 'china hotpot night', id: 'hotpot', hash: '#/world/china/hotpot', reset: true },
  { name: 'china magic brush', id: 'brush', hash: '#/world/china/brush', reset: true },
  { name: 'china great race', id: 'race', hash: '#/world/china/race', reset: true },
  { name: 'china bullet train', id: 'train', hash: '#/world/china/train', reset: true },
  { name: 'china dragon parade (finale)', id: 'parade', hash: '#/world/china/party', stampAll: 'china' },
]

/** Filmed moments (scripts/qa-motion.mjs): the core verbs, driven the way a child would. */
export const motion = [
  {
    name: 'bamboo-grow',
    seconds: 2.2,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/china/bamboo/r1`)
      await page.waitForTimeout(1400)
    },
    act: async (page) => {
      // A real swipe up on the sprout, then a tap.
      const b = await page.getByRole('button', { name: 'bamboo shoot' }).first().boundingBox()
      const x = b.x + b.width / 2
      const y = b.y + b.height * 0.7
      await page.mouse.move(x, y)
      await page.mouse.down()
      for (let i = 1; i <= 6; i++) {
        await page.mouse.move(x, y - i * 14)
        await page.waitForTimeout(30)
      }
      await page.mouse.up()
      await page.waitForTimeout(900)
      await page.getByRole('button', { name: 'bamboo shoot' }).first().click({ force: true })
    },
  },
  {
    name: 'bamboo-payoff',
    seconds: 12,
    setup: async (page, base) => {
      // The last round (tap the shortest): bamboo 3 is the short one.
      await page.goto(`${base}#/world/china/bamboo/r3b`)
      await page.waitForTimeout(3500)
    },
    act: (page) => page.getByRole('button', { name: 'bamboo 3' }).click({ force: true }),
  },
  {
    name: 'wall-brick-snap',
    seconds: 1.6,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/china/wall/brick`)
      await page.waitForTimeout(3000)
    },
    act: async (page) => {
      // Drag the red brick into the first hole.
      const bb = await page.getByRole('button', { name: 'red brick' }).first().boundingBox()
      const hb = await page.locator('[data-target="hole"]').boundingBox()
      const from = { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 }
      const to = { x: hb.x + hb.width / 2, y: hb.y + hb.height / 2 }
      await page.mouse.move(from.x, from.y)
      await page.mouse.down()
      await page.mouse.move((from.x + to.x) / 2, (from.y + to.y) / 2, { steps: 6 })
      await page.mouse.move(to.x, to.y, { steps: 6 })
      await page.mouse.up()
    },
  },
  {
    name: 'wall-beacon',
    seconds: 12,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/china/wall/beacon`)
      await page.waitForTimeout(4500)
    },
    act: (page) => page.getByRole('button', { name: 'beacon tower' }).click({ force: true }),
  },
]

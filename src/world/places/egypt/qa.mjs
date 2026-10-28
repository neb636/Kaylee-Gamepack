// Egypt's QA scenarios, picked up by scripts/qa-screens.mjs (screens), qa-pacing.mjs (pacing) and
// qa-motion.mjs (motion). A new activity can keep its own next to its sections.ts (activities/<id>/qa.mjs);
// sections no screen reaches get a plain screenshot anyway. Not part of the app: Node runs it, Vite never sees it.
import { skip } from '../../../../scripts/qa-lib.mjs'

/** Screenshots (scripts/qa-screens.mjs): how to get to each screen from a fresh start. */
export const screens = [
  // Egypt: open the exact section instead of replaying earlier rounds.
  { name: 'egypt-intro', hash: '#/world/egypt', reset: true, wait: 300 },
  { name: 'egypt-hub', hash: '#/world/egypt', act: skip },
  { name: 'pyramid-story', hash: '#/world/egypt/pyramid/story', wait: 250 },
  { name: 'pyramid-build', hash: '#/world/egypt/pyramid/row-2', wait: 1200 },
  { name: 'passage-maze', hash: '#/world/egypt/passage/maze-1' },
  { name: 'sphinx-sand', hash: '#/world/egypt/sphinx/face' },
  { name: 'sphinx-rubbed', hash: '#/world/egypt/sphinx/paws' },
  { name: 'nile-sail', hash: '#/world/egypt/nile/sail-1', wait: 2500 },
  { name: 'scribe-stamps', hash: '#/world/egypt/scribe/k' },
  {
    name: 'market-koshari',
    hash: '#/world/egypt/market/koshari',
    act: async (p) => {
      await p.waitForTimeout(3500)
      for (const f of ['rice', 'lentils']) {
        await p.getByRole('button', { name: f, exact: true }).click({ force: true, timeout: 1500 }).catch(() => {})
        await p.waitForTimeout(500)
      }
    },
  },
  { name: 'egypt-hub-stamps', hash: '#/world/egypt', stampAll: 'egypt' },
  { name: 'light-show', hash: '#/world/egypt/party/wake-1?stamps=all', stampAll: 'egypt' },
]

/** Auto-played runs (scripts/qa-pacing.mjs): talk before the first touch, talk per touch, the play strip. */
export const pacing = [
  { name: 'egypt intro + map', id: 'egypt-intro', hash: '#/world/egypt', reset: true, play: false },
  { name: 'pyramid', id: 'pyramid', hash: '#/world/egypt/pyramid' },
  { name: 'passage', id: 'passage', hash: '#/world/egypt/passage' },
  { name: 'sphinx', id: 'sphinx', hash: '#/world/egypt/sphinx' },
  { name: 'nile', id: 'nile', hash: '#/world/egypt/nile' },
  { name: 'scribe', id: 'scribe', hash: '#/world/egypt/scribe' },
  { name: 'market', id: 'market', hash: '#/world/egypt/market' },
  { name: 'light show (finale)', id: 'show', hash: '#/world/egypt/party', stampAll: 'egypt' },
]

/** Filmed moments (scripts/qa-motion.mjs): the core verbs, driven the way a child would. */
export const motion = [
  {
    name: 'passage-walk',
    seconds: 2.5,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/egypt/passage/maze-1`)
      await page.waitForTimeout(500)
      await page.waitForTimeout(600)
    },
    act: async (page) => {
      // Drag Miu along the first tunnel and round the corner (torchlight follows her).
      const box = await page.locator('svg[viewBox="0 0 160 100"], svg[viewBox="0 0 100 160"]').first().boundingBox()
      if (!box) throw new Error('no maze found')
      const land = box.width > box.height
      const at = (x, y) => (land ? { x: box.x + (x / 160) * box.width, y: box.y + (y / 100) * box.height } : { x: box.x + (y / 100) * box.width, y: box.y + (x / 160) * box.height })
      const a = at(80, 76)
      await page.mouse.move(a.x, a.y)
      await page.mouse.down()
      await page.waitForTimeout(1100)
      const b = at(80, 30)
      await page.mouse.move(b.x, b.y)
      await page.waitForTimeout(1000)
      await page.mouse.up()
    },
  },
  {
    name: 'sphinx-rub',
    seconds: 2.5,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/egypt/sphinx/face`)
      await page.waitForTimeout(500)
      await page.waitForTimeout(600)
    },
    act: async (page) => {
      const c = await page.getByLabel('Rub the sand away').boundingBox()
      if (!c) throw new Error('no sand found')
      for (let row = 0; row < 5; row++) {
        const y = c.y + c.height * (0.18 + row * 0.08)
        await page.mouse.move(c.x + c.width * 0.22, y)
        await page.mouse.down()
        for (let k = 1; k <= 8; k++) await page.mouse.move(c.x + c.width * (0.22 + k * 0.045), y, { steps: 2 })
        await page.mouse.up()
      }
    },
  },
]

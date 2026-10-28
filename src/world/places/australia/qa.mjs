// Australia's QA scenarios, picked up by scripts/qa-screens.mjs (screens), qa-pacing.mjs (pacing) and
// qa-motion.mjs (motion). A new activity can keep its own next to its sections.ts (activities/<id>/qa.mjs);
// sections no screen reaches get a plain screenshot anyway. Not part of the app: Node runs it, Vite never sees it.
import { skip, vp } from '../../../../scripts/qa-lib.mjs'

/** Screenshots (scripts/qa-screens.mjs): how to get to each screen from a fresh start. */
export const screens = [
  { name: 'australia-intro', hash: '#/world/australia', reset: true, wait: 300 },
  { name: 'australia-hub', hash: '#/world/australia', act: skip },
  { name: 'outback-story', hash: '#/world/australia/outback/story', wait: 250 },
  {
    name: 'outback-pack', hash: '#/world/australia/outback/pack',
    act: async (p) => { await p.getByRole('button', { name: 'hat' }).click({ force: true }); await p.waitForTimeout(400) },
  },
  {
    name: 'outback-hop', hash: '#/world/australia/outback/water',
    act: async (p) => { await p.getByRole('button', { name: 'Hop' }).click({ force: true }); await p.waitForTimeout(700) },
  },
  { name: 'outback-mama', hash: '#/world/australia/outback/mama', wait: 2800 },
  { name: 'forest-feed', hash: '#/world/australia/forest/feed-2' },
  { name: 'forest-feed-four', hash: '#/world/australia/forest/feed-4' },
  { name: 'forest-sleep', hash: '#/world/australia/forest/sleep' },
  { name: 'reef-find', hash: '#/world/australia/reef/turtle' },
  { name: 'reef-octopus', hash: '#/world/australia/reef/octopus' },
  { name: 'stars-sky', hash: '#/world/australia/stars/sky' },
  { name: 'stars-flag', hash: '#/world/australia/stars/flag', wait: 4500 },
  { name: 'stars-quiz', hash: '#/world/australia/stars/quiz' },
  { name: 'croc-story', hash: '#/world/australia/croc/story', wait: 250 },
  { name: 'croc-hatch', hash: '#/world/australia/croc/hatch' },
  {
    name: 'croc-ride', hash: '#/world/australia/croc/ride',
    act: async (p) => { await p.getByRole('button', { name: 'baby crocodile' }).first().click({ force: true }); await p.waitForTimeout(700) },
  },
  { name: 'croc-swim', hash: '#/world/australia/croc/swim', wait: 700 },
  { name: 'croc-snap', hash: '#/world/australia/croc/snap', wait: 1800 },
  {
    name: 'postcard-color', hash: '#/world/australia/postcard/color',
    act: async (p) => {
      await p.waitForTimeout(600)
      const c = p.getByLabel('coloring page')
      const box = await c.boundingBox()
      if (box) for (const [fx, fy] of [[0.15, 0.2], [0.5, 0.5], [0.9, 0.9], [0.1, 0.9], [0.6, 0.1], [0.35, 0.65]]) await c.click({ force: true, position: { x: box.width * fx, y: box.height * fy } })
      await p.waitForTimeout(500)
    },
  },
  { name: 'postcard-send', hash: '#/world/australia/postcard/send', wait: 250 },
  {
    name: 'stamp-earned', hash: '#/world/australia/stars/quiz',
    act: async (p) => {
      await p.getByRole('button', { name: 'australia flag' }).click({ force: true })
      await p.waitForTimeout(2000)
    },
  },
  { name: 'australia-hub-stamps', hash: '#/world/australia', stampAll: true },
  { name: 'theater-australia', hash: '#/world/australia/theater', wait: 1200 },
  {
    name: 'video-break',
    hash: '#/world/australia/forest/feed-2',
    act: async (p) => {
      await p.evaluate(() => window.__kayleeWorld?.finish?.())
      await p.waitForTimeout(1200)
      await p.getByRole('button', { name: 'Back to the map' }).first().click()
      await p.waitForTimeout(1400)
    },
  },
  { name: 'party', hash: '#/world/australia/party/pat?stamps=all&danced=mama,koko,shelly,kooky,chompy' },
  {
    name: 'win-ceremony',
    hash: '#/world/australia',
    stampAll: true,
    act: async (p) => {
      await p.evaluate(() => window.__kaylee?.win())
      await p.waitForTimeout(1500)
    },
  },
]

/** Auto-played runs (scripts/qa-pacing.mjs): talk before the first touch, talk per touch, the play strip. */
export const pacing = [
  { name: 'australia intro + map', id: 'intro', hash: '#/world/australia', reset: true, play: false },
  { name: 'outback', id: 'outback', hash: '#/world/australia/outback' },
  { name: 'forest', id: 'forest', hash: '#/world/australia/forest' },
  { name: 'reef', id: 'reef', hash: '#/world/australia/reef' },
  { name: 'stars', id: 'stars', hash: '#/world/australia/stars' },
  { name: 'croc', id: 'croc', hash: '#/world/australia/croc' },
  { name: 'postcard', id: 'postcard', hash: '#/world/australia/postcard' },
  { name: 'party (finale)', id: 'party', hash: '#/world/australia/party', stampAll: true },
]

/** Filmed moments (scripts/qa-motion.mjs): the core verbs, driven the way a child would. */
export const motion = [
  {
    name: 'outback-hop',
    seconds: 1.3,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/australia/outback/water`)
      await page.waitForTimeout(600)
    },
    act: async (page) => {
      const hop = page.getByRole('button', { name: /hop/i }).first()
      if (await hop.isVisible().catch(() => false)) await hop.click({ force: true })
      else await page.mouse.click(vp.width / 2, vp.height * 0.7)
    },
  },
  {
    name: 'forest-feed',
    seconds: 3,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/australia/forest/feed-2`)
      await page.waitForTimeout(600)
    },
    act: async (page) => {
      const leaf = page.getByRole('button', { name: /leaf/i }).first()
      const koko = page.locator('[data-dropzone="koko"], [aria-label*="Koko"]').first()
      const from = await leaf.boundingBox().catch(() => null)
      const to = await koko.boundingBox().catch(() => null)
      if (!from) throw new Error('no gum leaf button found')
      if (to) {
        // Slow drag so the koala has time to watch the leaf and open wide.
        await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
        await page.mouse.down()
        for (let i = 1; i <= 12; i++) {
          await page.mouse.move(from.x + from.width / 2 + ((to.x + to.width / 2 - from.x - from.width / 2) * i) / 12, from.y + from.height / 2 + ((to.y + to.height * 0.45 - from.y - from.height / 2) * i) / 12)
          await page.waitForTimeout(40)
        }
        await page.mouse.up()
      } else await leaf.click({ force: true })
    },
  },
  {
    name: 'croc-ride',
    seconds: 3,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/australia/croc/ride`)
      await page.waitForTimeout(600)
    },
    act: async (page) => {
      const baby = page.getByRole('button', { name: 'baby crocodile' }).first()
      const chompy = page.locator('[data-dropzone="chompy"]').first()
      const from = await baby.boundingBox().catch(() => null)
      const to = await chompy.boundingBox().catch(() => null)
      if (!from || !to) throw new Error('no baby crocodile or Chompy found')
      // Slow drag toward her snout (the right end) so her jaw has time to open wide.
      await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
      await page.mouse.down()
      for (let i = 1; i <= 14; i++) {
        await page.mouse.move(from.x + from.width / 2 + ((to.x + to.width * 0.8 - from.x - from.width / 2) * i) / 14, from.y + from.height / 2 + ((to.y + to.height * 0.45 - from.y - from.height / 2) * i) / 14)
        await page.waitForTimeout(45)
      }
      await page.mouse.up()
    },
  },
]

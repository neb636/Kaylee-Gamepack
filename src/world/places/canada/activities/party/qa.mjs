// QA scenarios for Canada's finale (Animal Homes + Pond Hockey), picked up next to its sections.ts by
// scripts/qa-screens.mjs, qa-pacing.mjs and qa-motion.mjs. Not part of the app: Node runs it, Vite never sees it.

const QA = () => window.__canadaPartyQA?.()

/** Screenshots: the story, a question on the map (and one with five already home), each goal of the game, the win. */
export const screens = [
  { name: 'canada-party-story', hash: '#/world/canada/party/story?stamps=all', reset: true, wait: 2500 },
  { name: 'canada-party-homes', hash: '#/world/canada/party/homes?stamps=all', reset: true, wait: 2500 },
  { name: 'canada-party-homes-last', hash: '#/world/canada/party/homes?stamps=all&q=orca&home=5', reset: true, wait: 2500 },
  { name: 'canada-party-hockey', hash: '#/world/canada/party/hockey?stamps=all&team=all', reset: true, wait: 5500 },
  { name: 'canada-party-hockey-geese', hash: '#/world/canada/party/hockey?stamps=all&team=taffy,campfire,whales&score=1', reset: true, wait: 5500 },
  { name: 'canada-party-hockey-alone', hash: '#/world/canada/party/hockey?stamps=all&team=none&score=2', reset: true, wait: 5500 },
  { name: 'canada-party-win', hash: '#/world/canada/party/win?stamps=all&team=all', reset: true, wait: 3500 },
]

/** The whole finale auto-played: the auto-player's taps poke things and slap the puck at the net. */
export const pacing = [{ name: 'canada finale', id: 'party', hash: '#/world/canada/party?stamps=all', reset: true }]

/** Filmed: an animal dragged home across the map, and a flick of the puck at the net. */
export const motion = [
  {
    name: 'canada-party-drag-home',
    seconds: 6,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/party/homes?stamps=all&q=orca`)
      await page.waitForFunction(() => window.__canadaPartyQA?.()?.phase === 'ask', null, { timeout: 20000 })
    },
    act: async (page) => {
      const s = await page.evaluate(QA)
      await page.mouse.move(s.animal.x, s.animal.y)
      await page.mouse.down()
      // First somewhere wrong (the prairie: it flops), then home.
      await page.mouse.move(s.homes.bison.x, s.homes.bison.y + 40, { steps: 18 })
      await page.mouse.up()
      await page.waitForTimeout(2600)
      const t = await page.evaluate(QA)
      await page.mouse.move(t.animal.x, t.animal.y)
      await page.mouse.down()
      await page.mouse.move(t.target.x, t.target.y + 40, { steps: 22 })
      await page.mouse.up()
    },
  },
  {
    name: 'canada-party-flick',
    seconds: 7,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/party/hockey?stamps=all&team=all`)
      await page.waitForFunction(() => window.__canadaPartyQA?.()?.phase === 'play', null, { timeout: 20000 })
    },
    act: async (page) => {
      const s = await page.evaluate(QA)
      await page.mouse.move(s.puck.x, s.puck.y + 30)
      await page.mouse.down()
      await page.mouse.move(s.puck.x + 10, s.puck.y - 10, { steps: 8 })
      await page.mouse.move(s.net.x, s.net.y + 60, { steps: 4 })
      await page.mouse.up()
    },
  },
]

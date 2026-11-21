// QA scenarios for Canada's finale (the big game: the `game-in` film, Pond Hockey, the `game-win` film), picked up
// next to its sections.ts by scripts/qa-screens.mjs, qa-pacing.mjs and qa-motion.mjs. Not part of the app: Node runs
// it, Vite never sees it. The game's readout is window.__canadaPartyQA() (rink.ts `qa`); the films' is
// window.__canadaStoryQA() (story/stage.ts).

const QA = () => window.__canadaPartyQA?.()

/** Waits until the hockey is on and the puck is on Maple's stick (any rush at the faceoff is over). */
const hersNow = (page) => page.waitForFunction(() => { const q = window.__canadaPartyQA?.(); return q && q.phase === 'play' && q.puck.by === 'maple' }, null, { timeout: 30000 })
/** A flick from the puck to the net (a drag that speeds up at the end). */
async function flick(page) {
  const s = await page.evaluate(QA)
  await page.mouse.move(s.puck.x, s.puck.y + 30)
  await page.mouse.down()
  await page.mouse.move(s.puck.x + 10, s.puck.y - 10, { steps: 8 })
  await page.mouse.move(s.net.x, s.net.y + 60, { steps: 4 })
  await page.mouse.up()
}
/** Waits until a film has played to its end (or been skipped) and its stage has gone (the stage is thrown away as the
 *  game goes on, so the last readout it gave is kept on every poll). */
const filmOver = (page, id, skipped = false) =>
  page.waitForFunction(
    ({ id, skipped }) => {
      // (Its last readout is kept: the stage is thrown away as the game goes on, and another film may follow it.)
      const q = window.__canadaStoryQA?.()
      if (q?.film?.film === id || q?.films.done.includes(id) || q?.films.skipped.includes(id)) window.__canadaFilmSeen = q
      const last = window.__canadaFilmSeen
      return !document.querySelector(`[data-story-film="${id}"]`) && !!last && (skipped ? last.films.skipped.includes(id) : last.films.done.includes(id) || last.film?.film === id)
    },
    { id, skipped },
    { timeout: 60000 },
  )
/** Holds the film's ⏭ until it skips. */
async function holdSkip(page) {
  const b = await page.getByRole('button', { name: 'Hold to skip the story' }).boundingBox()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(900)
  await page.mouse.up()
}

/** Screenshots: each part of the game (the first goal, the geese's rush, the geese in the way, the goose wall), a
 *  smaller team, the films. */
export const screens = [
  { name: 'canada-party-story', hash: '#/world/canada/party/story?stamps=all&team=all', reset: true, wait: 4500 },
  { name: 'canada-party-hockey', hash: '#/world/canada/party/hockey?stamps=all&team=all', reset: true, wait: 4000 },
  { name: 'canada-party-hockey-rush', hash: '#/world/canada/party/hockey?stamps=all&team=all&score=1', reset: true, wait: 2200 },
  { name: 'canada-party-hockey-geese', hash: '#/world/canada/party/hockey?stamps=all&team=all&score=1', reset: true, wait: 8000 },
  { name: 'canada-party-hockey-wall', hash: '#/world/canada/party/hockey?stamps=all&team=all&score=2', reset: true, wait: 9000 },
  { name: 'canada-party-hockey-few', hash: '#/world/canada/party/hockey?stamps=all&team=snowman,canoe,bath,whales&score=1', reset: true, wait: 6000 },
  { name: 'canada-party-hockey-alone', hash: '#/world/canada/party/hockey?stamps=all&team=none&score=2', reset: true, wait: 6000 },
  { name: 'canada-party-win', hash: '#/world/canada/party/win?stamps=all&team=all', reset: true, wait: 6000 },
  ...['game-in', 'game-win'].map((id) => ({ name: `canada-film-${id}`, hash: `#/world/canada/story/${id}`, reset: true, wait: 8000 })),
]

/** The whole finale auto-played: the auto-player's taps poke things and slap the puck at the net. */
export const pacing = [{ name: 'canada finale', id: 'party', hash: '#/world/canada/party/hockey?stamps=all&team=all', reset: true }]

/** Filmed: a flick that scores, the geese's rush (Roxy steals it), the goose wall and Misty's slap shot, a whole game
 *  played with flicks (and one only with taps), and the two films watched to the end and skipped. */
export const motion = [
  {
    name: 'canada-party-flick',
    seconds: 8,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/party/hockey?stamps=all&team=all`)
      await hersNow(page)
    },
    act: async (page) => {
      await flick(page)
      await page.waitForFunction(() => window.__canadaPartyQA?.().goals >= 1 || window.__canadaPartyQA?.().saves >= 1, null, { timeout: 6000 })
      await page.waitForTimeout(2500)
    },
  },
  {
    // The geese take the faceoff and rush her net; Roxy steals it in a blink and passes to Maple.
    name: 'canada-party-rush',
    seconds: 9,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/party/hockey?stamps=all&team=all&score=1`)
      await page.waitForFunction(() => window.__canadaPartyQA?.()?.rush, null, { timeout: 20000 })
    },
    act: async (page) => {
      await hersNow(page)
      await page.waitForFunction(() => window.__canadaPartyQA?.().shown.includes('roxy'), null, { timeout: 2000 })
      await page.waitForTimeout(2500)
    },
  },
  {
    // The last goal: a rush, the goose wall, her shot bounces off it, Misty's slap shot knocks it flat, and she scores
    // into the open net: the cheer, then the Cup.
    name: 'canada-party-wall',
    seconds: 24,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/party/hockey?stamps=all&team=all&score=2`)
      await hersNow(page)
    },
    act: async (page) => {
      await page.waitForFunction(() => window.__canadaPartyQA?.().wall === 'up', null, { timeout: 25000 })
      await page.waitForTimeout(1200)
      await flick(page)
      await page.waitForFunction(() => window.__canadaPartyQA?.().wall === 'down', null, { timeout: 30000 })
      await hersNow(page)
      await page.waitForTimeout(600)
      await flick(page)
      await page.waitForFunction(() => window.__canadaPartyQA?.().phase === 'win', null, { timeout: 25000 })
      await page.waitForTimeout(4000)
    },
  },
  {
    // A whole game with flicks: every friend's talent shows, the geese may score once, she wins.
    name: 'canada-party-game',
    seconds: 150,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/party/hockey?stamps=all&team=all`)
      await hersNow(page)
    },
    act: async (page) => {
      for (let i = 0; i < 40; i++) {
        const q = await page.evaluate(QA)
        if (!q || q.phase === 'win') break
        if (q.phase === 'play' && q.puck.by === 'maple') await flick(page)
        await page.waitForTimeout(1500)
      }
      await page.waitForFunction(() => document.querySelector('[data-story-film="game-win"]'), null, { timeout: 15000 })
      const q = await page.evaluate(() => window.__canadaPartyQA?.() ?? null)
      if (q) console.log('canada-party-game', JSON.stringify(q))
    },
  },
  {
    // Only taps (a child who doesn't flick): a tap on the net slaps the puck there, and she still wins.
    name: 'canada-party-taps',
    seconds: 150,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/party/hockey?stamps=all&team=all`)
      await hersNow(page)
    },
    act: async (page) => {
      for (let i = 0; i < 50; i++) {
        const q = await page.evaluate(QA)
        if (!q || q.phase === 'win') break
        if (q.phase === 'play') await page.mouse.click(q.net.x, q.net.y + 20)
        await page.waitForTimeout(1300)
      }
      await page.waitForFunction(() => document.querySelector('[data-story-film="game-win"]'), null, { timeout: 15000 })
    },
  },
  ...['game-in', 'game-win'].flatMap((id) => [
    {
      name: `canada-film-${id}`,
      seconds: 24,
      setup: async (page, base) => {
        await page.goto(`${base}#/world/canada/story/${id}`)
        await page.waitForFunction(() => window.__canadaStoryQA?.()?.film, null, { timeout: 20000 })
      },
      act: async (page) => {
        await filmOver(page, id)
      },
    },
    {
      name: `canada-film-${id}-skip`,
      seconds: 8,
      setup: async (page, base) => {
        await page.goto(`${base}#/world/canada/story/${id}`)
        await page.waitForFunction(() => window.__canadaStoryQA?.()?.time > 0 || window.__canadaStoryQA?.()?.film, null, { timeout: 20000 })
        await page.waitForTimeout(5000)
      },
      act: async (page) => {
        await holdSkip(page)
        // (Skipped 5 s into a 16 s film: it must be gone at once, the game or the map in its place.)
        await page.waitForFunction((id) => !document.querySelector(`[data-story-film="${id}"]`), id, { timeout: 4000 })
        await page.waitForTimeout(1500)
      },
    },
  ]),
]

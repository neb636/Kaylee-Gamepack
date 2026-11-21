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

// ---- The team dressed from the Team Cabin (looks.ts, saved where the cabin saves it), with hats chosen to fight a
// stick, a helmet or the ice if anything could: a chef's hat on Ollie (she slides on her back), antlers on Misty (her
// slap shot), a helmet on Gus (he freezes like a statue when Roxy robs him). Misty in the bath's default look.
const LOOKS_KEY = 'kaylee-gamepack:/:saved:canada-looks'
const DRESSED = {
  misty: { fur: { earL: { c: 'pink', k: 1 }, earR: { c: 'pink', k: 1 }, tummy: { c: 'blue', k: 0.7 }, armR: { c: 'purple', k: 0.8 } }, puff: 0.5, hair: { style: 'spikes', color: 'pink' }, worn: [{ id: 'flower', at: 'earL' }], print: ['purple'], sweater: true },
  team: {
    maple: { jersey: 'blue', hat: 'crown', scarf: 'mint', cheek: 'heart' },
    tuque: { jersey: 'purple', hat: 'chef', cheek: 'star' },
    monty: { jersey: 'red', hat: 'antlers', scarf: 'blue' },
    roxy: { jersey: 'mint', hat: 'pompom', scarf: 'purple', cheek: 'leaf' },
    lulu: { jersey: 'pink', hat: 'flowers', scarf: 'red' },
    misty: { jersey: 'purple', hat: 'antlers', cheek: 'heart' },
    ollie: { jersey: 'blue', hat: 'chef', scarf: 'pink', cheek: 'star' },
    gus: { hat: 'helmet', scarf: 'red' },
  },
}
/** Opens a link with the whole team dressed (the looks are saved first, then the page is loaded fresh). */
async function dressed(page, base, hash) {
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [LOOKS_KEY, JSON.stringify(DRESSED)])
  await fresh(page, base, hash)
}
/** The app loaded fresh (so it reads the saved looks again), then the link. */
async function fresh(page, base, hash) {
  await page.goto(`${base}#/blank`)
  await page.reload()
  await page.getByRole('button', { name: /let's play/i }).click({ timeout: 3000 }).catch(() => {})
  await page.goto(`${base}${hash}`)
}
const fail = (why) => {
  throw new Error(why)
}
/** With the puck: a tap wide into the left boards. The puck stops in the corner and Ollie fetches it (her slide, her
 *  flip of the puck, her pass). */
async function wide(page) {
  await shoot(page, async () => {
    const q = await page.evaluate(QA)
    await page.mouse.click(q.wide.x, q.wide.y)
  })
}
/** A shot (`how`: a flick or a tap), again until it goes (a camera still settling can swallow one). */
async function shoot(page, how, tries = 4) {
  for (let i = 0; i < tries; i++) {
    await hersNow(page)
    const before = (await page.evaluate(QA)).shots
    await how()
    const went = await page.waitForFunction((n) => window.__canadaPartyQA().shots > n, before, { timeout: 1200 }).then(() => true, () => false)
    if (went) return
    await page.waitForTimeout(400)
  }
  fail('her shot never went')
}
/** Shots wide into the boards until Ollie fetches one and winds up (a shot can go in, or come back to Maple). */
async function untilOllie(page) {
  for (let i = 0; i < 4; i++) {
    await wide(page)
    const ollie = await page
      .waitForFunction(() => { const q = window.__canadaPartyQA(); return q.winding.includes('ollie') || (q.phase === 'play' && q.puck.by === 'maple' && q.puck.state === 'held') }, null, { timeout: 15000 })
      .then(() => page.evaluate(() => window.__canadaPartyQA().winding.includes('ollie')))
    if (ollie) return
    await page.waitForTimeout(600)
  }
  fail('Ollie never fetched the puck and wound up')
}
/** Her shots off the goose wall until Misty fetches one and winds up (a rebound can come straight back to Maple). */
async function untilMisty(page, closeup = null) {
  for (let i = 0; i < 5; i++) {
    // (A close-up on Misty goes on once her shot has gone: the robot aims with the game's own camera.)
    if (closeup) {
      await page.evaluate(() => (window.__canadaPartyCloseup = null))
      await page.waitForTimeout(900)
    }
    await shoot(page, () => flick(page))
    if (closeup) await page.evaluate((c) => (window.__canadaPartyCloseup = c), closeup)
    const misty = await page
      .waitForFunction(() => { const q = window.__canadaPartyQA(); return q.winding.includes('misty') || (q.puck.by === 'maple' && q.puck.state === 'held') }, null, { timeout: 12000 })
      .then(() => page.evaluate(() => window.__canadaPartyQA().winding.includes('misty')))
    if (misty) return
    await page.waitForTimeout(800)
  }
  fail('Misty never wound up')
}
/** Waits for something in the readout, or fails with what it says. */
const until = (page, f, arg, ms, why) => page.waitForFunction(f, arg, { timeout: ms }).catch(() => fail(why))

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
  { name: 'canada-party-hockey-mouse', hash: '#/world/canada/party/hockey?stamps=all&team=all&device=mouse', reset: true, wait: 4000 },
  { name: 'canada-party-win', hash: '#/world/canada/party/win?stamps=all&team=all', reset: true, wait: 6000 },
  ...['game-in', 'game-win'].map((id) => ({ name: `canada-film-${id}`, hash: `#/world/canada/story/${id}`, reset: true, wait: 8000 })),
]

/** The team dressed from the cabin, and close-ups (`closeup=`) of the wind-ups, the frozen goose and the hats. */
const dressedScreens = [
  { name: 'canada-party-dressed', hash: '#/world/canada/party/hockey?stamps=all&team=all', wait: 4000 },
  ...['maple', 'tuque', 'monty', 'roxy', 'ollie', 'misty', 'lulu', 'gus'].flatMap((who) => ['front', 'side'].map((view) => ({ name: `canada-party-wear-${who}-${view}`, hash: `#/world/canada/party/hockey?stamps=all&team=all&closeup=${who}.${view}`, wait: 3500 }))),
].map((s) => ({
  ...s,
  reset: true,
  seed: `localStorage.setItem(${JSON.stringify(LOOKS_KEY)}, ${JSON.stringify(JSON.stringify(DRESSED))})`,
  // (Loaded fresh, so the saved looks are read again.)
  act: async (page) => {
    await fresh(page, page.url().split('#')[0], s.hash)
    await page.waitForTimeout(s.wait)
  },
  wait: 300,
}))
screens.push(...dressedScreens)

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
  // ---- The plays, with the whole team dressed from the cabin: each friend's wind-up, then their play.
  {
    // The geese rush: Roxy crouches and rubs her paws, whisks the puck, and Gus freezes like a statue for a second.
    // Then a shot wide into the boards: Ollie slides on her back to it, flips the puck up and catches it, and passes.
    // Then a goal (Lulu's big breath, then her song), the last rush (Tuque or Monty winds up for the shot), the goose
    // wall, Misty's wind-up and slap shot, and the winning goal.
    name: 'canada-party-moves',
    seconds: 70,
    setup: async (page, base) => {
      await dressed(page, base, '#/world/canada/party/hockey?stamps=all&team=all&score=1')
      await page.waitForFunction(() => window.__canadaPartyQA?.()?.rush, null, { timeout: 20000 })
    },
    act: async (page) => {
      await until(page, () => window.__canadaPartyQA().winding.includes('roxy'), null, 3000, 'Roxy never wound up before her steal')
      await until(page, () => window.__canadaPartyQA().frozen.length > 0, null, 4000, 'the goose Roxy robbed never froze')
      await hersNow(page)
      await page.waitForTimeout(700)
      await untilOllie(page)
      await hersNow(page)
      await page.waitForTimeout(800)
      // A goal: Lulu winds up, then sings.
      for (let i = 0; i < 8 && (await page.evaluate(QA)).score < 2; i++) {
        await shoot(page, () => flick(page))
        await page.waitForTimeout(1800)
      }
      await until(page, () => window.__canadaPartyQA().score >= 2, null, 20000, 'no second goal')
      // The last rush, then the goose wall: her shot off it, and Misty's.
      await until(page, () => window.__canadaPartyQA().wall === 'up', null, 30000, 'the goose wall never went up')
      await page.waitForTimeout(1200)
      await untilMisty(page)
      await until(page, () => window.__canadaPartyQA().wall === 'down', null, 4000, 'the wall never went down')
      for (let i = 0; i < 8 && (await page.evaluate(QA))?.phase !== 'win'; i++) {
        await shoot(page, () => flick(page)).catch(() => {})
        await page.waitForTimeout(1500)
      }
      await until(page, () => window.__canadaPartyQA?.()?.phase === 'win' || document.querySelector('[data-story-film="game-win"]'), null, 15000, 'she never won')
      await page.waitForTimeout(2500)
    },
  },
  {
    // The same, close up: Gus frozen in his helmet, Ollie's flip in her chef's hat.
    name: 'canada-party-moves-gus',
    seconds: 5,
    setup: async (page, base) => {
      await dressed(page, base, '#/world/canada/party/hockey?stamps=all&team=all&score=1&closeup=gus.back')
      await page.waitForFunction(() => window.__canadaPartyQA?.()?.rush, null, { timeout: 20000 })
    },
    act: async (page) => {
      await until(page, () => window.__canadaPartyQA().frozen.length > 0, null, 4000, 'the goose Roxy robbed never froze')
      await page.waitForTimeout(2000)
    },
  },
  {
    name: 'canada-party-moves-ollie',
    seconds: 12,
    setup: async (page, base) => {
      await dressed(page, base, '#/world/canada/party/hockey?stamps=all&team=all')
      await hersNow(page)
    },
    act: async (page) => {
      await untilOllie(page)
      await page.evaluate(() => (window.__canadaPartyCloseup = 'ollie.side'))
      await until(page, () => window.__canadaPartyQA().passes > 0, null, 5000, 'Ollie never passed')
      await page.waitForTimeout(800)
    },
  },
  {
    // The last goal: the goose wall, her shot off it, Misty's wind-up (the stick right back) and her slap shot, close up.
    name: 'canada-party-moves-misty',
    seconds: 10,
    setup: async (page, base) => {
      await dressed(page, base, '#/world/canada/party/hockey?stamps=all&team=all&score=2')
      await hersNow(page)
      await page.waitForFunction(() => window.__canadaPartyQA?.().wall === 'up', null, { timeout: 25000 })
    },
    act: async (page) => {
      await page.waitForTimeout(1200)
      await untilMisty(page, 'misty.front')
      await until(page, () => window.__canadaPartyQA().wall === 'down', null, 4000, 'the wall never went down')
      await page.waitForTimeout(1500)
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

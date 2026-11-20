// Carnival Snowballs' QA scenarios (the Quebec City chapter: the game and its two films, story/films/snowman.ts):
// every part from its link, the story from the bare link, the park a while into dressing, the end of the parade, the
// films; the robot runs that roll, stack and dress (Tuque wakes up and says his name), and the films watched to the end
// and skipped half way. The game answers on window.__canadaSnowmanQA() (carnival.ts `qa`), the films on
// window.__canadaStoryQA() (story/stage.ts). Not part of the app: Node runs it, Vite never sees it.
import { vp } from '../../../../../../scripts/qa-lib.mjs'

const game = (page) => page.evaluate(() => window.__canadaSnowmanQA())
const ready = async (page, base, hash, ms = 1500) => {
  await page.goto(`${base}${hash}`)
  await page.waitForFunction(() => window.__canadaSnowmanQA?.().section, null, { timeout: 20000 })
  await page.waitForTimeout(ms)
}
/** A film from its link, once its stage is up. */
const film = async (page, base, id) => {
  await page.goto(`${base}#/world/canada/story/${id}`)
  await page.waitForFunction(() => window.__canadaStoryQA?.().film, null, { timeout: 30000 })
}
/** The film is over: played to the end (or skipped), or its stage has gone and the game took over. */
const filmOver = (page, id, how = 'done') =>
  page.waitForFunction(
    ([f, h]) => {
      const q = window.__canadaStoryQA?.()
      return !q || q.ended || q.films[h].includes(f)
    },
    [id, how],
    { timeout: 60000 },
  )
/** Holds the ⏭ until it skips. */
async function holdSkip(page) {
  const b = await page.getByRole('button', { name: 'Hold to skip the story' }).boundingBox()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(900)
  await page.mouse.up()
}
/** A push on the smallest loose ball toward a screen point, the way a finger does. */
async function push(page, to, steps = 18) {
  const { ball } = await game(page)
  if (!ball) return
  await page.mouse.move(ball.x, ball.y)
  await page.mouse.down()
  await page.mouse.move((ball.x + to.x) / 2, (ball.y + to.y) / 2, { steps: Math.ceil(steps / 2) })
  await page.mouse.move(to.x, to.y, { steps: Math.ceil(steps / 2) })
  await page.waitForTimeout(500)
  await page.mouse.up()
}

export const screens = [
  // Each part from its link (the stack with the huge ball and Maple on top; dressing with two already in the parade
  // line, Tuque at its front), and the parade (Tuque leads it).
  ...['roll', 'stack', 'stack?size=huge', 'dress', 'dress?snowmen=3', 'parade'].map((to) => ({ name: `canada-snowman-${to.replace(/[?=&]/g, '-')}`, hash: `#/world/canada/snowman/${to}`, reset: true, wait: to === 'roll' ? 4000 : to === 'parade' ? 6000 : 2500 })),
  { name: 'snowman-story', hash: '#/world/canada/snowman', reset: true, wait: 1800 },
  { name: 'snowman-after-story', hash: '#/world/canada/snowman', reset: true, wait: 9000 },
  { name: 'snowman-park-life', hash: '#/world/canada/snowman/dress?snowmen=3', reset: true, wait: 24000 },
  { name: 'snowman-parade-end', hash: '#/world/canada/snowman/parade?snowmen=5', reset: true, wait: 16000 },
  // The films: Maple has her idea; the snowball on her head and Tuque in his new scarf.
  { name: 'canada-film-snowman-in', hash: '#/world/canada/story/snowman-in', reset: true, wait: 12500 },
  { name: 'canada-film-snowman-out', hash: '#/world/canada/story/snowman-out', reset: true, wait: 11500 },
]

export const pacing = [
  // The core verb is a push (a drag on the ball), so the auto-player's taps only pat the ball, shake trees and poke;
  // the robot runs that roll, stack and dress are qa-motion's canada-snowman-roll and canada-snowman-tuque.
  { name: 'canada carnival snowballs', id: 'snowman', hash: '#/world/canada/snowman', reset: true },
]

export const motion = [
  {
    // The little ball pushed round in a big loop (it grows and leaves a green stripe, the camera follows), then a
    // fresh ball dragged out of bare snow and pushed into the big one (it hops on top).
    name: 'canada-snowman-roll',
    seconds: 12,
    setup: (page, base) => ready(page, base, '#/world/canada/snowman/roll', 3200),
    act: async (page) => {
      const step = Math.min(150, vp.width * 0.16)
      for (const [dx, dy] of [
        [1, 0],
        [0, -0.6],
        [-1, 0],
        [-1, 0],
        [0, 0.6],
        [1, 0],
      ]) {
        const { ball } = await game(page)
        if (!ball) break
        await page.mouse.move(ball.x, ball.y)
        await page.mouse.down()
        await page.mouse.move(ball.x + dx * step, ball.y + dy * step, { steps: 14 })
        await page.waitForTimeout(250)
        await page.mouse.up()
        await page.waitForTimeout(250)
      }
      // A new ball out of the snow beside the big one, pushed into it.
      const { loose } = await game(page)
      const big = loose[0]
      if (!big) return
      const sx = big.x + step * 1.4
      await page.mouse.move(sx, big.y)
      await page.mouse.down()
      await page.mouse.move(sx - 20, big.y, { steps: 3 })
      await page.mouse.move(big.x, big.y, { steps: 16 })
      await page.waitForTimeout(600)
      await page.mouse.up()
    },
  },
  {
    // Maple acts it out: a snowman stacked from the stack link (she cheers).
    name: 'snowman-maple-cheer',
    seconds: 6,
    setup: (page, base) => ready(page, base, '#/world/canada/snowman/stack'),
    act: async (page) => {
      const { ball, loose } = await game(page)
      const big = loose.find((b) => b.r > 0.5)
      if (!ball || !big) return
      await page.mouse.move(ball.x, ball.y)
      await page.mouse.down()
      await page.mouse.move(big.x, big.y, { steps: 18 })
      await page.waitForTimeout(500)
      await page.mouse.up()
    },
  },
  {
    // Tuque gets dressed: from the dress link (he's the one waiting), a snowball into the hat box (his floppy red
    // tuque flies on), another into the sash box; he wakes up, waves, says his name and hops off to the parade line.
    name: 'canada-snowman-tuque',
    seconds: 16,
    setup: (page, base) => ready(page, base, '#/world/canada/snowman/dress', 2500),
    act: async (page) => {
      for (const box of ['hatBox', 'sashBox']) {
        for (let tries = 0; tries < 4; tries++) {
          const q = await game(page)
          if (box === 'hatBox' ? /H/.test(q.tuque ?? '') : /S/.test(q.tuque ?? '')) break
          if (!q.ball) {
            await page.waitForTimeout(1500)
            continue
          }
          await push(page, q[box], 24)
          await page.waitForTimeout(1600)
        }
      }
      await page.waitForFunction(() => /line|walk/.test(window.__canadaSnowmanQA().tuque ?? ''), null, { timeout: 8000 }).catch(() => {})
      await page.waitForTimeout(1500)
    },
  },
  {
    // The film in, watched to the end (it goes on into the game).
    name: 'canada-snowman-film-in',
    seconds: 18,
    setup: (page, base) => film(page, base, 'snowman-in'),
    act: (page) => filmOver(page, 'snowman-in'),
  },
  {
    // The film out, watched to the end.
    name: 'canada-snowman-film-out',
    seconds: 16,
    setup: (page, base) => film(page, base, 'snowman-out'),
    act: (page) => filmOver(page, 'snowman-out'),
  },
  {
    // The film in, skipped half way (hold ⏭ while Maple looks for hockey players): straight on into the game.
    name: 'canada-snowman-film-skip',
    seconds: 6,
    setup: async (page, base) => {
      await film(page, base, 'snowman-in')
      await page.waitForFunction(() => window.__canadaStoryQA?.().film?.beat === 'none', null, { timeout: 30000 })
    },
    act: async (page) => {
      await holdSkip(page)
      await filmOver(page, 'snowman-in', 'skipped')
      await page.waitForFunction(() => window.__canadaSnowmanQA?.().section, null, { timeout: 20000 })
      await page.waitForTimeout(1500)
    },
  },
]

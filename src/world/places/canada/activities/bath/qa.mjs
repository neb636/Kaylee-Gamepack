// Misty's Bubble Bath's QA scenarios (the rainforest river chapter: the game and its two films, story/films/bath.ts):
// every part from its link, the films, and the robots the plan names, each of which must FINISH the bath (Misty in her
// sweater): a rub robot (drags, the way a finger rubs), a taps-only robot (a tap with a tool does a short go, so she
// never has to drag), and a do-little robot (it only drifts the pointer: the rain finishes the mud and every part moves
// on by itself, so the toy can never get stuck). The game answers on window.__canadaBathQA() (bath.ts `qa`), the films
// on window.__canadaStoryQA(). Not part of the app: Node runs it, Vite never sees it.
import { tapAnchor } from '../../../../../../scripts/qa-lib.mjs'

const game = (page) => page.evaluate(() => window.__canadaBathQA?.() ?? null)
const ready = async (page, base, hash, ms = 2000) => {
  await page.goto(`${base}${hash}`)
  await page.waitForFunction(() => window.__canadaBathQA?.().section, null, { timeout: 30000 })
  await page.waitForTimeout(ms)
}
const film = async (page, base, id) => {
  await page.goto(`${base}#/world/canada/story/${id}`)
  await page.waitForFunction(() => window.__canadaStoryQA?.().film, null, { timeout: 30000 })
}
const filmOver = (page, id, how = 'done') =>
  page.waitForFunction(
    ([f, h]) => {
      const q = window.__canadaStoryQA?.()
      return !q || q.ended || q.films[h].includes(f)
    },
    [id, how],
    { timeout: 60000 },
  )
async function holdSkip(page) {
  const b = await page.getByRole('button', { name: 'Hold to skip the story' }).boundingBox()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(900)
  await page.mouse.up()
}

/** A rub on one of her zones: the finger down and round in loops (a little below, as the tool's tip rides above it). */
async function rub(page, at, loops = 3, r = 46) {
  if (!at) return
  const y = at.y + 30
  await page.mouse.move(at.x, y)
  await page.mouse.down()
  for (let i = 0; i < loops * 10; i++) await page.mouse.move(at.x + Math.cos(i * 0.63) * r, y + Math.sin(i * 0.63 * 2) * r * 0.5, { steps: 2 })
  await page.mouse.up()
}
/** A comb stroke on her head: up, down or sideways. */
async function stroke(page, at, dx, dy) {
  const y = at.y + 30
  await page.mouse.move(at.x - dx * 50, y - dy * 50)
  await page.mouse.down()
  for (let i = 1; i <= 8; i++) {
    await page.mouse.move(at.x - dx * 50 + dx * 12.5 * i, y - dy * 50 + dy * 12.5 * i)
    await page.waitForTimeout(40)
  }
  await page.mouse.up()
}
/** Drags the decoration on the log onto her head. */
async function dropDeco(page, q) {
  const slot = Object.entries(q.log).find(([id]) => id.startsWith('deco:'))
  if (!slot) return false
  const [, s] = slot
  const to = q.zones[['head', 'earL', 'earR', 'chest'][q.worn.length % 4]]
  await page.mouse.move(s.x, s.y)
  await page.mouse.down()
  await page.mouse.move(to.x, to.y + 30, { steps: 14 })
  await page.waitForTimeout(150)
  await page.mouse.up()
  return true
}

const ZONES = ['tummy', 'chest', 'head', 'armL', 'armR', 'legL', 'legR', 'earL', 'earR', 'muzzle']
/** The bath's last state a robot saw (it ends when Misty has her sweater on: then the film out takes the screen). */
let last = null
const finished = (name) => {
  if (!last?.done) throw new Error(`${name} did not finish (stage ${last?.stage}, ${last?.strokes} strokes)`)
}

/** The rub robot: a finger rubbing her all over, the way a child would, through every part to the sweater. */
async function rubRobot(page, ms) {
  last = null
  const t0 = Date.now()
  let i = 0
  while (Date.now() - t0 < ms) {
    const q = await game(page)
    if (q) last = q
    if (!q || q.done) break
    i++
    const z = q.zones[ZONES[i % ZONES.length]]
    if (q.film) await page.waitForTimeout(400)
    else if (q.stage === 'story') await page.mouse.click(z.x, z.y)
    else if (q.stage === 'comb') await stroke(page, q.zones.head, i % 3 === 2 ? 1 : 0, i % 3 === 0 ? -1 : i % 3 === 1 ? 1 : 0)
    else if (q.stage === 'berries' || q.stage === 'mirror') {
      if (i % 5 === 0) await tapAnchor(page, `tool:${['pink', 'blue', 'purple'][Math.floor(i / 5) % 3]}`)
      if (i % 4 === 0 && (await dropDeco(page, q))) continue
      if (q.stage === 'mirror' && (q.worn.length >= 2 || i % 7 === 0)) await tapAnchor(page, 'pool')
      else await rub(page, z, 2)
    } else if (q.stage === 'sweater') {
      await page.waitForTimeout(300)
      if (!q.act) await tapAnchor(page, 'sweater')
    } else await rub(page, z, 3)
    await page.waitForTimeout(80)
  }
  await page.waitForTimeout(1500)
}

/** The taps-only robot: never drags. A tap on her does a short go with the tool in hand; a tap on a tool on the log
 *  picks it up and does a short go where it's needed. */
async function tapRobot(page, ms) {
  last = null
  const t0 = Date.now()
  let i = 0
  while (Date.now() - t0 < ms) {
    const q = await game(page)
    if (q) last = q
    if (!q || q.done) break
    i++
    if (q.film || q.act === 'press') await page.waitForTimeout(400)
    else if (q.stage === 'mirror' && i % 3 === 0) await tapAnchor(page, 'pool')
    else if (q.stage === 'sweater') await tapAnchor(page, 'sweater')
    else if ((q.stage === 'berries' || q.stage === 'mirror') && i % 4 === 0) await tapAnchor(page, i % 8 === 0 ? 'tool:deco' : `tool:${['pink', 'blue', 'purple'][(i / 4) % 3 | 0]}`)
    else if (i % 6 === 0 && q.stage !== 'story') await tapAnchor(page, `tool:${q.tool === 'pink' || q.tool === 'blue' || q.tool === 'purple' ? q.tool : q.tool}`)
    else {
      const z = q.zones[ZONES[i % ZONES.length]]
      await page.mouse.click(z.x, z.y + 30)
    }
    await page.waitForTimeout(q.stage === 'mirror' || q.stage === 'sweater' ? 700 : 1100)
  }
  await page.waitForTimeout(1500)
}

/** The do-little robot: the pointer drifts (so a test browser doesn't throttle the page) and nothing is pressed. */
async function idleRobot(page, ms) {
  last = null
  const t0 = Date.now()
  let i = 0
  while (Date.now() - t0 < ms) {
    const q = await game(page)
    if (q) last = q
    if (!q || q.done) break
    await page.mouse.move(200 + (i++ % 7) * 30, 200)
    await page.waitForTimeout(1500)
  }
  await page.waitForTimeout(1500)
}

export const screens = [
  // Each part from its link: muddy at the start, clean and wet for the towel, fluffy for the berries, a finished look
  // with the pool glowing (and the same in a link's look).
  { name: 'canada-bath-story', hash: '#/world/canada/bath', reset: true, wait: 1800 },
  ...['wash', 'fluff', 'colors', 'mirror'].map((to) => ({ name: `canada-bath-${to}`, hash: `#/world/canada/bath/${to}`, reset: true, wait: 3500 })),
  { name: 'canada-bath-mirror-look', hash: '#/world/canada/bath/mirror?look=head.purple.6,earL.pink.9,earR.pink.9,tummy.blue.7,armL.pink.9,armR.purple.8~8~swoop.purple~crown.crown,flower.earL~~0', reset: true, wait: 3500 },
  // A Mac's words ("Click and wiggle").
  { name: 'canada-bath-wash-mouse', hash: '#/world/canada/bath/wash?device=mouse', reset: true, wait: 3500 },
  // Mid-wash: suds piled on her tummy and head, the mud coming off under them.
  {
    name: 'canada-bath-wash-suds',
    hash: '#/world/canada/bath/wash',
    reset: true,
    wait: 3000,
    act: async (page) => {
      const q = await game(page)
      for (const z of ['tummy', 'head', 'tummy']) await rub(page, q.zones[z], 2)
      await page.waitForTimeout(600)
    },
  },
  // Misty in her look on the map and in the big game (dressMisty at 1.05 m and 1.55 m).
  { name: 'canada-bath-look-map', hash: '#/world/canada/hub/map?team=all&look=', reset: true, wait: 6000 },
  { name: 'canada-bath-look-hockey', hash: '#/world/canada/party/hockey?stamps=all&team=all&look=', reset: true, wait: 6000 },
  // The films: the muddy lump in the rain; Misty in her look with the hockey stick.
  { name: 'canada-film-bath-in', hash: '#/world/canada/story/bath-in', reset: true, wait: 7000 },
  // `oddities`: scene facts for the opt-in Jev visual QA (scripts/qa-oddities.mjs): her stick came loose once (#512).
  { name: 'canada-film-bath-out', hash: '#/world/canada/story/bath-out?look=', reset: true, wait: 6000, oddities: { held: [{ holder: 'the white bear', prop: 'hockey stick' }] } },
]

export const pacing = [
  // The auto-player's taps pick tools up (each does a short go on her), tap her, the pokeables and the pool: a tap is
  // a whole go, so taps alone finish the bath. The drag robot is qa-motion's canada-bath-rub.
  { name: 'canada bubble bath', id: 'bath', hash: '#/world/canada/bath/wash', reset: true },
]

export const motion = [
  {
    // The rub robot, the whole bath: sponge, rain, towel, comb, berries, decorations, the mirror, the sweater.
    name: 'canada-bath-rub',
    seconds: 150,
    setup: (page, base) => ready(page, base, '#/world/canada/bath/wash', 1500),
    act: async (page) => {
      await rubRobot(page, 145000)
      finished('the rub robot')
    },
  },
  {
    // On a Mac (`?device=mouse`: "Click and wiggle"): the same rub with the mouse, all the way to the sweater.
    name: 'canada-bath-mouse',
    seconds: 150,
    setup: (page, base) => ready(page, base, '#/world/canada/bath/wash?device=mouse', 1500),
    act: async (page) => {
      await rubRobot(page, 145000)
      finished('the mouse robot')
    },
  },
  {
    // Taps only, never a drag: every tool's short go, all the way to the sweater.
    name: 'canada-bath-taps',
    seconds: 170,
    setup: (page, base) => ready(page, base, '#/world/canada/bath/wash', 1500),
    act: async (page) => {
      await tapRobot(page, 165000)
      finished('the taps robot')
    },
  },
  {
    // Does nothing at all: the rain comes and finishes the mud, every next tool comes by itself, Misty sees herself in
    // the pool and Maple presses the sweater to her paw.
    name: 'canada-bath-idle',
    seconds: 175,
    setup: (page, base) => ready(page, base, '#/world/canada/bath/wash', 500),
    act: async (page) => {
      await idleRobot(page, 170000)
      finished('the do-little robot')
    },
  },
  {
    // The core verb up close: the sponge's suds piling up on her tummy and head, then the rain popping them.
    name: 'canada-bath-suds',
    seconds: 14,
    setup: (page, base) => ready(page, base, '#/world/canada/bath/wash', 1500),
    act: async (page) => {
      let q = await game(page)
      for (const z of ['tummy', 'head', 'chest', 'armR']) await rub(page, q.zones[z], 2)
      await page.waitForFunction(() => window.__canadaBathQA().stage === 'rain', null, { timeout: 20000 }).catch(() => {})
      q = await game(page)
      for (const z of ['head', 'tummy', 'chest']) await rub(page, q.zones[z], 3, 60)
    },
  },
  {
    // The bubbles: rubbing lets soap bubbles float up, her finger pops them (a tap, a swipe through), a sneeze blows a
    // flurry of them, and the pink rubber duck squeaks and hops. It must pop at least one.
    name: 'canada-bath-bubbles',
    seconds: 18,
    setup: (page, base) => ready(page, base, '#/world/canada/bath/wash', 1500),
    act: async (page) => {
      let q = await game(page)
      for (const z of ['tummy', 'chest', 'head']) await rub(page, q.zones[z], 3)
      await tapAnchor(page, 'duck')
      await page.waitForTimeout(700)
      await tapAnchor(page, 'nose')
      await page.waitForTimeout(1200)
      for (let i = 0; i < 6; i++) {
        q = await game(page)
        const f = q.floats[0]
        if (f) await page.mouse.click(f.x, f.y)
        await page.waitForTimeout(450)
      }
      q = await game(page)
      if (!q.popped) throw new Error('no soap bubble popped')
      await page.waitForTimeout(1200)
    },
  },
  {
    // The payoff: the pool glows, Misty sees herself (the close-up), Maple brings the sweater, THUMP, she pulls it on.
    name: 'canada-bath-mirror',
    seconds: 16,
    setup: (page, base) => ready(page, base, '#/world/canada/bath/mirror?look=head.purple.6,earL.pink.9,earR.pink.9,tummy.blue.7,armL.pink.9,armR.purple.8~8~swoop.purple~crown.crown,flower.earL~~0', 1500),
    act: async (page) => {
      await tapAnchor(page, 'pool')
      await page.waitForFunction(() => window.__canadaBathQA().stage === 'sweater', null, { timeout: 20000 })
      await page.waitForTimeout(1500)
      await tapAnchor(page, 'sweater')
      await page.waitForTimeout(6000)
    },
  },
  {
    // The silly pokes: her nose (a sneeze of suds and bubbles), the soap (batted over the cedars), the salmon (a swing and
    // a miss), the cedar (a back scratch), the rubber duck (a squeak and a hop).
    name: 'canada-bath-pokes',
    seconds: 16,
    setup: (page, base) => ready(page, base, '#/world/canada/bath/wash', 1500),
    act: async (page) => {
      const q = await game(page)
      await rub(page, q.zones.tummy, 2)
      await tapAnchor(page, 'nose')
      await page.waitForTimeout(2000)
      await tapAnchor(page, 'soap')
      await page.waitForTimeout(3000)
      await tapAnchor(page, 'salmon')
      await page.waitForTimeout(2500)
      await tapAnchor(page, 'cedar')
      await page.waitForTimeout(5000)
      await tapAnchor(page, 'duck')
      await page.waitForTimeout(1200)
    },
  },
  {
    name: 'canada-bath-film-in',
    seconds: 20,
    setup: (page, base) => film(page, base, 'bath-in'),
    act: (page) => filmOver(page, 'bath-in'),
  },
  {
    name: 'canada-bath-film-out',
    seconds: 18,
    setup: (page, base) => film(page, base, 'bath-out?look=head.purple.6,earL.pink.9,earR.pink.9,tummy.blue.7,armL.pink.9,armR.purple.8~8~swoop.purple~crown.crown,flower.earL~pink.purple~1'),
    act: (page) => filmOver(page, 'bath-out'),
  },
  {
    // The film in, skipped half way: straight on into the bath, Misty still muddy.
    name: 'canada-bath-film-skip',
    seconds: 6,
    setup: (page, base) => film(page, base, 'bath-in'),
    act: async (page) => {
      await page.waitForTimeout(4000)
      await holdSkip(page)
      await filmOver(page, 'bath-in', 'skipped')
      await page.waitForFunction(() => window.__canadaBathQA?.().section, null, { timeout: 20000 })
      await page.waitForTimeout(1500)
    },
  },
]

// Campfire Night's QA scenarios (Flashlight Statues; scripts/qa-screens.mjs, qa-pacing.mjs and qa-motion.mjs pick them
// up next to Canada's own qa.mjs). Not part of the app: Node runs it, Vite never sees it. The game answers on
// window.__canadaCampfireQA() (world.ts `qa`: the section, who is lit, the kits, Roxy, the roast, and `at`, where each
// thing the light can land on is on the screen); its two films (story/films/campfire.ts) on window.__canadaStoryQA().
//
// The robots: a sweep robot that plays the whole toy to the northern lights, a robot that leaves Roxy alone (she
// yoinks, comes back slower, and the game can still be finished), a do-nothing robot (after 8 s a kit's tail sticks out
// and wiggles, with the hint's hand), and a Mac robot (?device=mouse: click and hold, then move; a plain click puts the
// light there; moving with no button down leaves it be).
import { vp } from '../../../../../../scripts/qa-lib.mjs'

const Q = (page) => page.evaluate(() => window.__canadaCampfireQA())
const ready = async (page, base, hash) => {
  await page.goto(`${base}${hash}`)
  await page.waitForFunction(() => window.__canadaCampfireQA?.().section, null, { timeout: 30000 })
}
const fail = (why, q) => {
  throw new Error(`${why} (${JSON.stringify({ section: q?.section, kits: q?.kits, roxy: q?.roxy, roast: q?.roast, sky: q?.sky, met: q?.met })})`)
}

/** Her finger, held down and moved round like a flashlight (it lands the light `liftPx` above itself). */
function finger(page) {
  let down = false
  let at = { x: vp.width / 2, y: vp.height * 0.7 }
  return {
    async to(p, lift, steps = 8) {
      const t = { x: p.x, y: p.y + lift }
      if (!down) {
        await page.mouse.move(t.x, t.y)
        await page.mouse.down()
        down = true
      } else await page.mouse.move(t.x, t.y, { steps })
      at = t
    },
    async up() {
      if (down) await page.mouse.up()
      down = false
    },
    get at() {
      return at
    },
  }
}

const UNMET = ['owl', 'porcupine', 'deer', 'frog', 'bat', 'monty', 'maple']
const GIVE_TO = ['maple', 'roxy', 'monty']

/** Plays the toy from wherever it is to the northern lights, the way a child would: the light swept from animal to
 *  animal, onto each kit as it peeks, held on Roxy until she topples over, then three marshmallows roasted and handed
 *  out, then the flashlight clicked off. */
async function playThrough(page, ms) {
  const f = finger(page)
  const t0 = Date.now()
  let q = await Q(page)
  let wander = 0
  while (Date.now() - t0 < ms) {
    q = await Q(page)
    const lift = q.liftPx ?? 0
    if (q.film) {
      await page.waitForTimeout(300)
      continue
    }
    if (q.sky) {
      if (q.sky.lights > 0.6) return q
      await page.waitForTimeout(400)
      continue
    }
    if (q.section === 'eyes' || q.section === 'story') {
      const id = UNMET.find((i) => !q.met.includes(i) && q.at[i])
      if (id) await f.to(q.at[id], lift)
      await page.waitForTimeout(650)
    } else if (q.section === 'peek') {
      const out = q.kits.at.find((k) => k.state === 'out')
      if (out) await f.to(out, lift, 4)
      else if (q.kits.stuck && q.at.tail) await f.to(q.at.tail, lift, 6)
      else {
        // (Nobody out: the light wanders round the hiding places, as a child's would.)
        const spots = [q.kits.at[0], q.kits.at[1], q.kits.at[2]]
        await f.to(spots[wander++ % 3], lift + 60, 10)
      }
      await page.waitForTimeout(200)
    } else if (q.section === 'statues') {
      if (q.at.roxy && ['sneak', 'home', 'statue'].includes(q.roxy.state)) await f.to(q.at.roxy, lift, 5)
      await page.waitForTimeout(250)
    } else if (q.section === 'roast' && q.roast) {
      await f.up()
      // Pick the marshmallow up, hold it in the flames until it's golden (blow it out if it catches), hand it over.
      const tip = q.roast.tip
      await page.mouse.move(tip.x, tip.y)
      await page.mouse.down()
      await page.mouse.move(q.at.fire.x, q.at.fire.y - 6, { steps: 10 })
      const t1 = Date.now()
      while (Date.now() - t1 < 12000) {
        const r = (await Q(page)).roast
        if (!r || r.golden || r.fire) break
        await page.waitForTimeout(250)
      }
      let r = (await Q(page)).roast
      if (r?.fire) {
        await page.mouse.up()
        const p = (await Q(page)).roast.tip
        await page.mouse.click(p.x, p.y)
        await page.waitForTimeout(300)
        r = (await Q(page)).roast
        await page.mouse.move(r.tip.x, r.tip.y)
        await page.mouse.down()
      }
      const to = GIVE_TO[(r?.given ?? 0) % GIVE_TO.length]
      const dest = (await Q(page)).at[to]
      await page.mouse.move(dest.x, dest.y - 20, { steps: 12 })
      await page.waitForTimeout(250)
      await page.mouse.up()
      await page.waitForTimeout(1500)
    } else if (q.section === 'sky') {
      await f.up()
      await page.mouse.click(q.flashlight.x, q.flashlight.y)
      await page.waitForTimeout(800)
    } else await page.waitForTimeout(300)
  }
  return q
}

/** Moves the pointer a little with no button down (headless WebKit slows a page that has had no input for 30 s). */
const drift = async (page, ms) => {
  const t0 = Date.now()
  let i = 0
  while (Date.now() - t0 < ms) {
    await page.mouse.move(vp.width * (0.1 + 0.02 * (i++ % 3)), vp.height * 0.95)
    await page.waitForTimeout(Math.min(2000, ms - (Date.now() - t0)))
  }
}

/** Screenshots: how to get to each screen from a fresh start. */
export const screens = [
  { name: 'canada-campfire-story', hash: '#/world/canada/campfire', reset: true, wait: 2500 },
  ...['eyes', 'peek', 'statues', 'roast', 'sky'].map((to) => ({ name: `canada-campfire-${to}`, hash: `#/world/canada/campfire/${to}`, reset: true, wait: to === 'statues' ? 5000 : 2500 })),
  // The light on the owl (his head going round), on Monty (sunglasses on), a kit peeking from the tent's door, and Roxy
  // in two of her statue poses, the light on her (the QA flag ?statue= stands her in the middle of the clearing).
  {
    name: 'canada-campfire-eyes-owl',
    hash: '#/world/canada/campfire/eyes',
    reset: true,
    wait: 2500,
    act: async (page) => {
      const q = await Q(page)
      await page.mouse.click(q.at.owl.x, q.at.owl.y + q.liftPx)
      await page.waitForTimeout(900)
    },
  },
  {
    name: 'canada-campfire-eyes-monty',
    hash: '#/world/canada/campfire/eyes',
    reset: true,
    wait: 2500,
    act: async (page) => {
      const q = await Q(page)
      await page.mouse.click(q.at.monty.x, q.at.monty.y + q.liftPx)
      await page.waitForTimeout(3200)
    },
  },
  ...['tree', 'whistling'].map((p) => ({ name: `canada-campfire-statue-${p}`, hash: `#/world/canada/campfire/roast?statue=${p}`, reset: true, wait: 2500 })),
  // The films: the paw at the bag (in), Roxy with the puck (out).
  { name: 'canada-film-campfire-in', hash: '#/world/canada/story/campfire-in', reset: true, wait: 9000 },
  { name: 'canada-film-campfire-out', hash: '#/world/canada/story/campfire-out', reset: true, wait: 7500 },
]

/** Auto-played runs: talk before the first touch, talk per touch, the play strip. */
export const pacing = [
  // A tap puts the light there, so the auto-player's taps light up whatever they land on; the robot that plays the
  // whole toy (the light dragged, the marshmallows handed out) is qa-motion's canada-campfire-sweep.
  { name: 'canada campfire night', id: 'campfire', hash: '#/world/canada/campfire', reset: true },
]

const filmOver = (id) => async (page) => {
  await page.waitForFunction((f) => !location.hash.includes('/story/') || window.__canadaStoryQA?.().ended || window.__canadaStoryQA?.().films.done.includes(f), id, { timeout: 40000 })
}
const filmReady = (id) => async (page, base) => {
  await page.goto(`${base}#/world/canada/story/${id}`)
  await page.waitForFunction(() => window.__canadaStoryQA?.().film, null, { timeout: 30000 })
}

/** Filmed moments: the core verb, driven the way a child would, the robots, and the films. */
export const motion = [
  {
    // The core verb: the light swept round the dark clearing from animal to animal; each does its bit as it lands.
    name: 'canada-campfire-light',
    seconds: 12,
    setup: async (page, base) => {
      await ready(page, base, '#/world/canada/campfire/eyes')
      await page.waitForTimeout(1500)
    },
    act: async (page) => {
      const f = finger(page)
      for (const id of ['frog', 'maple', 'owl', 'monty', 'bat', 'deer', 'porcupine']) {
        const q = await Q(page)
        if (q.at[id]) await f.to(q.at[id], q.liftPx, 10)
        await page.waitForTimeout(1400)
      }
      await f.up()
    },
  },
  {
    // The sweep robot: the whole toy, from the first animal to the northern lights. It must finish.
    name: 'canada-campfire-sweep',
    seconds: 200,
    setup: async (page, base) => {
      await ready(page, base, '#/world/canada/campfire/eyes')
      await page.waitForTimeout(1500)
    },
    act: async (page) => {
      const q = await playThrough(page, 195000)
      if (!q.sky || q.sky.lights < 0.6) fail('the sweep robot did not reach the northern lights', q)
      if (q.kits.home < 3 || q.roxy.laughs < 3 || (q.roast?.given ?? 3) < 3) fail('something was skipped', q)
    },
  },
  {
    // Peek-a-boo: the light on each kit as it peeks (each freezes in a pose, then runs to the fire).
    name: 'canada-campfire-peek',
    seconds: 30,
    setup: async (page, base) => {
      await ready(page, base, '#/world/canada/campfire/peek')
      await page.waitForTimeout(800)
    },
    act: async (page) => {
      await playThrough(page, 28000)
      const q = await Q(page)
      if (q.kits.home < 3 && q.section === 'peek') fail('the kits were not all caught in 28 s', q)
    },
  },
  {
    // Statues: Roxy caught in the beam (the close-up of her silly face the first time), held until she wobbles and
    // topples over laughing, three times.
    name: 'canada-campfire-statues',
    seconds: 45,
    setup: async (page, base) => {
      await ready(page, base, '#/world/canada/campfire/statues')
      await page.waitForTimeout(1500)
    },
    act: async (page) => {
      const t0 = Date.now()
      await page.waitForFunction(() => window.__canadaCampfireQA().at.roxy, null, { timeout: 10000 })
      await playThrough(page, 1000)
      while (Date.now() - t0 < 42000) {
        const q = await playThrough(page, 600)
        if (q.section === 'roast') return
      }
      fail('Roxy did not give up in 42 s', await Q(page))
    },
  },
  {
    // Left alone, Roxy reaches the bag ("Yoink!"), scampers home and comes back slower; then the light catches her
    // and the game still goes on to the roast.
    name: 'canada-campfire-alone',
    seconds: 70,
    setup: async (page, base) => {
      await ready(page, base, '#/world/canada/campfire/statues')
      await page.waitForTimeout(500)
    },
    act: async (page) => {
      await drift(page, 24000)
      const q = await Q(page)
      if (q.roxy.yoinks < 2) fail('Roxy never reached the bag twice', q)
      if (!(q.roxy.speed < 0.45)) fail('Roxy did not slow down after her grabs', q)
      const t0 = Date.now()
      while (Date.now() - t0 < 42000) {
        const r = await playThrough(page, 600)
        if (r.section === 'roast') return
      }
      fail('after the yoinks the game did not go on to the roast', await Q(page))
    },
  },
  {
    // Doing nothing in peek-a-boo: after 8 s a kit's tail sticks out of its hiding place and wiggles, the hint's hand
    // on it; the light on the tail catches that kit.
    name: 'canada-campfire-idle',
    seconds: 18,
    setup: async (page, base) => {
      await ready(page, base, '#/world/canada/campfire/peek')
    },
    act: async (page) => {
      await drift(page, 12500)
      const q = await Q(page)
      if (!q.kits.stuck || !q.at.tail) fail('no wiggly tail after 12 s of doing nothing', q)
      const hand = await page.evaluate(() => document.querySelector('.camp-hint')?.style.display !== 'none')
      if (!hand) fail('the hint hand is not showing the tail', q)
      await page.mouse.move(q.at.tail.x, q.at.tail.y + q.liftPx)
      await page.mouse.down()
      await page.waitForTimeout(2000)
      await page.mouse.up()
      const r = await Q(page)
      if (r.kits.home < 1) fail('lighting the tail did not catch the kit', r)
    },
  },
  {
    // The roast: held in the flames until golden, given to Maple; held until it catches fire, clicked out, given to
    // Roxy (burnt is her favorite); one for Monty (he eats the stick).
    name: 'canada-campfire-roast',
    seconds: 34,
    setup: async (page, base) => {
      await ready(page, base, '#/world/canada/campfire/roast')
      await page.waitForTimeout(2500)
    },
    act: async (page) => {
      await playThrough(page, 32000)
      const q = await Q(page)
      if (q.section !== 'sky') fail('three marshmallows were not handed out', q)
    },
  },
  {
    // The end: the flashlight clicked off, the sky fills with stars, the northern lights dance.
    name: 'canada-campfire-sky',
    seconds: 14,
    setup: async (page, base) => {
      await ready(page, base, '#/world/canada/campfire/sky')
      await page.waitForTimeout(2500)
    },
    act: async (page) => {
      const q = await Q(page)
      await page.mouse.click(q.flashlight.x, q.flashlight.y)
      await page.waitForFunction(() => window.__canadaCampfireQA()?.sky?.lights > 0.5, null, { timeout: 13000 })
    },
  },
  {
    // On a Mac (?device=mouse): the light moves only while the button is held; a plain click puts it there.
    name: 'canada-campfire-mouse',
    seconds: 12,
    setup: async (page, base) => {
      await ready(page, base, '#/world/canada/campfire/eyes?device=mouse')
      await page.waitForTimeout(1500)
    },
    act: async (page) => {
      const pill = await page.evaluate(() => document.body.innerText.includes('Click and hold, then move to shine the light!'))
      if (!pill) fail('the Mac line is not showing', await Q(page))
      const q0 = await Q(page)
      if (q0.liftPx !== 0) fail('the light should land right under a mouse', q0)
      // Moving with no button down: the light stays.
      await page.mouse.move(q0.at.owl.x, q0.at.owl.y, { steps: 6 })
      await page.waitForTimeout(500)
      const q1 = await Q(page)
      if (Math.hypot(q1.light.x - q0.light.x, q1.light.y - q0.light.y) > 4) fail('the light followed a mouse with no button down', q1)
      // A plain click: the light goes there (the owl's head goes round).
      await page.mouse.click(q0.at.owl.x, q0.at.owl.y)
      await page.waitForTimeout(700)
      const q2 = await Q(page)
      if (!q2.lit.includes('owl')) fail('a click did not put the light on the owl', q2)
      // Click and hold, then move: it follows.
      await page.mouse.move(q0.at.frog.x, q0.at.frog.y)
      await page.mouse.down()
      await page.mouse.move(q0.at.porcupine.x, q0.at.porcupine.y, { steps: 20 })
      await page.waitForTimeout(800)
      await page.mouse.up()
      const q3 = await Q(page)
      if (!q3.met.includes('porcupine') || !q3.met.includes('frog')) fail('click and hold, then move did not shine on the way', q3)
    },
  },
  // The films: each watched to the end, and the way in skipped in the middle (the game starts as it should).
  { name: 'canada-film-campfire-in', seconds: 22, setup: filmReady('campfire-in'), act: filmOver('campfire-in') },
  { name: 'canada-film-campfire-out', seconds: 22, setup: filmReady('campfire-out'), act: filmOver('campfire-out') },
]

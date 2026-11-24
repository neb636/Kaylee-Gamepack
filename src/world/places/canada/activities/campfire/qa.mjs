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
  // (The device is read when the app loads: a ?device= link needs a fresh load.)
  if (hash.includes('device=')) {
    await page.reload()
    await page.getByRole('button', { name: /let's play/i }).click({ timeout: 5000 }).catch(() => {})
  }
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

/** The roast, for one order: a tap on the bag (a marshmallow hops onto the stick over the fire), wait until it's the
 *  kind they want (their bubble says ready; a burnt one is let catch fire: touching it blows it out), take it off the
 *  stick and let go of it on them. `wrong`: dragged straight out of the bag to them instead, white (a miss). `off`:
 *  let go this far (px) to the side of their middle, like a child's aim. */
async function roastFor(page, order, q, wrong = false, off = 0) {
  const R = () => Q(page).then((x) => x.roast)
  if (wrong) {
    await page.mouse.move(q.roast.bag.x, q.roast.bag.y)
    await page.mouse.down()
  } else {
    if (q.roast.mallow === 'bag') {
      await page.mouse.click(q.roast.bag.x, q.roast.bag.y)
      await page.waitForFunction(() => window.__canadaCampfireQA().roast?.mallow === 'stick', null, { timeout: 3000 })
    }
    const t1 = Date.now()
    while (Date.now() - t1 < 20000) {
      const r = await R()
      const o = r?.orders.find((x) => x.who === order.who)
      if (!r || !o) break
      if (order.want === 'burnt' ? r.fire || r.charred : o.ready && r.toast > 0.05) break
      await page.waitForTimeout(150)
    }
    const r = await R()
    await page.mouse.move(r.tip.x, r.tip.y)
    await page.mouse.down()
  }
  await page.waitForTimeout(120)
  const held = await R()
  if (held && !held.held) fail('the marshmallow was not picked up', await Q(page))
  const dest = (await Q(page)).at[order.who]
  // (Her finger goes `liftPx` below where she wants the marshmallow: it rides above her fingertip on a touch screen.)
  await page.mouse.move(dest.x + off, dest.y + (held?.liftPx ?? 0), { steps: 12 })
  await page.waitForTimeout(250)
  await page.mouse.up()
  await page.waitForTimeout(1600)
}

/** Plays the toy from wherever it is to the northern lights, the way a child would: the light swept from animal to
 *  animal, onto each kit as it peeks, held on Roxy until she topples over, then every marshmallow order toasted the
 *  way they want it and handed over, then the flashlight clicked off. */
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
      if (q.roast.flashlight) fail('the flashlight should be put away in the roast', q)
      const order = q.roast.orders.find((o) => o.showing)
      if (!order) {
        await page.waitForTimeout(300)
        continue
      }
      await roastFor(page, order, q)
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

/** Waits until a film is `t` seconds into its beat `beat` (for a screenshot of that moment). */
const atBeat = (beat, t) => async (page) => {
  await page.waitForFunction(([b, s]) => {
    const now = window.__canadaStoryQA?.().film
    return now && now.beat === b && now.t >= s
  }, [beat, t], { timeout: 30000, polling: 50 })
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
  // (?statue= also holds the close-up's own camera on her, so the screen is what the close-up shows.)
  ...['tree', 'whistling', 'ballerina'].map((p) => ({ name: `canada-campfire-statue-${p}`, hash: `#/world/canada/campfire/roast?statue=${p}`, reset: true, wait: 2500 })),
  // Each thing close, from the front, the side and behind (?look=<thing>&yaw=<degrees round it>, everyone lit), to
  // check it's put together right from every side.
  ...['owl', 'bat', 'deer', 'porcupine', 'frog', 'tent', 'fire', 'log', 'den', 'stick'].flatMap((id) =>
    [0, 90, 180].map((yaw) => ({ name: `canada-campfire-look-${id}-${yaw}`, hash: `#/world/canada/campfire/${id === 'stick' ? 'roast' : 'eyes'}?look=${id}&yaw=${yaw}`, reset: true, wait: 2200 })),
  ),
  // The roast as she plays it: a marshmallow on the stick over the fire, one in her fingers on its way to Maple
  // (her mouth open), and Monty's giant one on the thick branch.
  {
    name: 'canada-campfire-roast-stick',
    hash: '#/world/canada/campfire/roast',
    reset: true,
    wait: 3500,
    act: async (page) => {
      const q = await Q(page)
      await page.mouse.click(q.roast.bag.x, q.roast.bag.y)
      await page.waitForTimeout(2600)
    },
  },
  {
    name: 'canada-campfire-roast-carry',
    hash: '#/world/canada/campfire/roast',
    reset: true,
    wait: 3500,
    act: async (page) => {
      const q = await Q(page)
      await page.mouse.click(q.roast.bag.x, q.roast.bag.y)
      await page.waitForTimeout(3300)
      const r = (await Q(page)).roast
      await page.mouse.move(r.tip.x, r.tip.y)
      await page.mouse.down()
      await page.mouse.move(q.at.maple.x + 70, q.at.maple.y - 10 + r.liftPx, { steps: 10 })
      await page.waitForTimeout(500)
    },
  },
  {
    name: 'canada-campfire-roast-giant',
    hash: '#/world/canada/campfire/roast?order=4',
    reset: true,
    wait: 3500,
    act: async (page) => {
      // (The screen before this one leaves its finger down, holding the marshmallow.)
      await page.mouse.up()
      const q = await Q(page)
      await page.mouse.click(q.roast.bag.x, q.roast.bag.y)
      await page.waitForTimeout(3000)
    },
  },
  // The films. In: Maple with her stick in her paw, the little paw out of the bush at the bag (twice: behind her, and
  // close), the end. Out: Roxy and her kits with their sticks, Maple's puck.
  ...[
    ['shh', 2.1, [{ holder: 'the beaver', prop: 'stick with a marshmallow on it' }]],
    ['snatch', 0.8, []],
    ['hey', 1.2, [{ holder: 'the beaver', prop: 'stick with a marshmallow on it' }]],
  ].map(([beat, t, held]) => ({ name: `canada-film-campfire-in-${beat}`, hash: '#/world/canada/story/campfire-in', reset: true, act: atBeat(beat, t), oddities: { held } })),
  { name: 'canada-film-campfire-in', hash: '#/world/canada/story/campfire-in', reset: true, wait: 9000 },
  { name: 'canada-film-campfire-out-got', hash: '#/world/canada/story/campfire-out', reset: true, act: atBeat('got', 0.6), oddities: { held: [{ holder: 'the beaver', prop: 'hockey puck' }, { holder: 'the big raccoon', prop: 'stick with a marshmallow on it' }] } },
  { name: 'canada-film-campfire-out-babies', hash: '#/world/canada/story/campfire-out', reset: true, act: atBeat('babies', 1.0), oddities: { held: [{ holder: 'a little raccoon', prop: 'stick with a marshmallow on it' }] } },
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
    seconds: 240,
    setup: async (page, base) => {
      await ready(page, base, '#/world/canada/campfire/eyes')
      await page.waitForTimeout(1500)
    },
    act: async (page) => {
      const q = await playThrough(page, 235000)
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
    // The roast (marshmallow orders): the flashlight put away, the close camera. Maple is fed a white one straight out
    // of the bag first (a miss: she eats it anyway and her bubble stays, wider), then every order toasted on the stick
    // until it's right: golden, squishy, burnt (caught fire, clicked out), two at once, Monty's giant one. Six stars,
    // then the sky.
    name: 'canada-campfire-roast',
    seconds: 80,
    setup: async (page, base) => {
      await ready(page, base, '#/world/canada/campfire/roast')
      await page.waitForTimeout(3000)
    },
    act: async (page) => {
      let q = await Q(page)
      const first = q.roast.orders[0]
      await roastFor(page, first, q, true)
      q = await Q(page)
      const after = q.roast.orders.find((o) => o.who === first.who)
      if (!after || after.miss !== 1 || q.roast.stars !== 0) fail('a white marshmallow for Maple should be a miss (her order stays)', q)
      await playThrough(page, 76000)
      q = await Q(page)
      if (q.section !== 'sky') fail('the marshmallow orders were not all given', q)
    },
  },
  {
    // The roast, played the way a five-year-old might. Doing nothing: the hint's hand comes to the bag. A tap on the
    // bag: a marshmallow hops onto the stick and toasts by itself. Taken off and let go in the air, or over the fire
    // (Monty is right behind it on the screen): it goes back on the stick, nobody eats it. A second tap on the bag
    // while one is out: no second marshmallow. Let go a bit to the side of Maple, not on her middle: she still gets it.
    name: 'canada-campfire-roast-sloppy',
    seconds: 40,
    setup: async (page, base) => {
      await ready(page, base, '#/world/canada/campfire/roast')
    },
    act: async (page) => {
      await drift(page, 9500)
      let q = await Q(page)
      if (q.roast.mallow !== 'bag' || !q.roast.hint) fail('doing nothing: the hint hand should be on the bag', q)
      await page.mouse.click(q.roast.bag.x, q.roast.bag.y)
      await page.waitForTimeout(700)
      q = await Q(page)
      if (q.roast.mallow !== 'stick') fail('a tap on the bag should put a marshmallow on the stick', q)
      if (Math.hypot(q.roast.tip.x - q.roast.stick.x, q.roast.tip.y - q.roast.stick.y) > 3) fail('the marshmallow is not on the tip of the stick', q)
      await page.mouse.click(q.roast.bag.x, q.roast.bag.y)
      await page.waitForTimeout(400)
      q = await Q(page)
      if (q.roast.mallow !== 'stick' || q.roast.given) fail('a second tap on the bag should not start another marshmallow', q)
      // Off the stick, let go in the empty air at the top right: back on the stick.
      for (const [dx, dy, why] of [[330, -250, 'let go in the air'], [0, -45, 'let go over the fire (Monty is behind it)']]) {
        await page.mouse.move(q.roast.tip.x, q.roast.tip.y)
        await page.mouse.down()
        await page.mouse.move(q.roast.stick.x + dx, q.roast.stick.y + dy + q.roast.liftPx, { steps: 8 })
        await page.waitForTimeout(200)
        await page.mouse.up()
        await page.waitForTimeout(600)
        q = await Q(page)
        if (q.roast.mallow !== 'stick' || q.roast.given) fail(`${why}: it should go back on the stick`, q)
      }
      // Golden by now (or nearly): to Maple, let go off to her side.
      await page.waitForFunction(() => window.__canadaCampfireQA().roast.orders[0]?.ready, null, { timeout: 8000 })
      q = await Q(page)
      await roastFor(page, q.roast.orders[0], q, false, 75)
      q = await Q(page)
      if (q.roast.stars !== 1 || q.roast.ate !== 'maple') fail('let go beside Maple with a golden one: she should get it, and a star', q)
    },
  },
  {
    // Monty's giant one, from its link: it waits on the bag, bigger and slower; the stick is the thick branch, and he
    // eats that too.
    name: 'canada-campfire-roast-giant',
    seconds: 38,
    setup: async (page, base) => {
      await ready(page, base, '#/world/canada/campfire/roast?order=4')
      await page.waitForTimeout(3000)
    },
    act: async (page) => {
      const q = await Q(page)
      if (!q.roast.giant || q.roast.orders[0]?.who !== 'monty') fail('the last round should be Monty and the giant marshmallow', q)
      await roastFor(page, q.roast.orders[0], q)
      const ate = await Q(page)
      if (ate.section === 'roast' && ate.roast.spit) fail('Monty should have eaten the branch too', ate)
      // (On to the sky: the flashlight is back, and a click turns it off.)
      const end = await playThrough(page, 30000)
      if (!end.sky || end.sky.lights < 0.6) fail('after Monty\'s giant marshmallow the flashlight did not turn off to the northern lights', end)
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
      await page.waitForTimeout(600)
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

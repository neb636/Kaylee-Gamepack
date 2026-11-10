// The Koh Samet trip's QA scenarios. Greybox 1, the jet ski at Sai Kaew: the life jacket, the waves round mid-ride and
// the race's start; filmed: carving doughnuts in the calm bay (the wake loop, Daddy dizzy), and steering into the waves
// to jump. Greybox 2, the island to roam: landing at Na Dan pier, Sai Kaew with the jet ski hers, Ao Prao in the
// afternoon, the night; filmed: leading Kaylee down the beach into the sea (the gallop, the floatie), and the umbrella
// kite. Greybox 3, Mommy's phone and the animal book: the phone out at Ao Wong Duan and Ao Prao, the book nearly full;
// filmed: snapping the animals at Ao Prao with the phone, and the beach clean (lift the bottle, the hermit crab, the bin).
// Greybox 4, the sandcastle at Ao Hin Khok: the bare beach, the towers round with its moat, the tide with a channel dug
// to the sea (the moat fills); filmed: digging a moat round and a channel to the sea, and burying Daddy.
// Greybox 5, snorkeling at Ko Kudi: the splash in, the parrotfish arriving, the garden; filmed: leading Kaylee over the
// reef (the damselfish parting round her) and following the parrotfish toward the gap.
// Greybox 6, lunch and hide and seek at Ao Prao: the deck with a roll eaten and the coconut sipped, hide and seek's
// count, a seek, the trickier round and her turn hiding; filmed: finding Daddy behind the tree, and Daddy searching
// the wrong places while she hides behind the chairs.
// Greybox 7, getting there and the trip frame: packing in Kaylee's room, the speedboat leaving Ban Phe and out at sea
// (her hoof in the spray), the island with every flag up (the way home); filmed: her hoof in the spray out at sea,
// dragging along the side.
// Step 9, the finale: the sunset at the driftwood tree, the sun pulled down into the sea (night), the fire show's
// twirl, a shape to draw over and the big finish (the ring of fire, fireworks); filmed: twirling the glowing poi in
// circles (the ribbons, the dancers copying her), and drawing the big ring for the ring of fire.
// Not part of the app: Node runs it, Vite never sees it.

const ready = (page) => page.waitForFunction(() => window.__thaiSametQA?.().phase, null, { timeout: 20000 })

/** A finger held ~150 px ahead of Kaylee, toward each point of a route on the island in turn, for `ms`. */
async function leadAlong(page, route, ms) {
  const vp = page.viewportSize()
  const start = Date.now()
  let i = 0
  let down = false
  while (Date.now() - start < ms && i < route.length) {
    const c = await page.evaluate(() => {
      const q = window.__thaiSametQA()
      return { x: q.x, z: q.z, yaw: q.cameraYaw, k: q.kaylee }
    })
    // (A toy opened: the island's not there to lead her on.)
    if (!c.k || !Number.isFinite(c.yaw)) break
    if (Math.hypot(route[i][0] - c.x, route[i][1] - c.z) < 3) {
      i++
      continue
    }
    const th = (c.yaw * Math.PI) / 180
    const dx = route[i][0] - c.x
    const dz = route[i][1] - c.z
    const n = Math.hypot(dx, dz) || 1
    const across = (dx * -Math.cos(th) + dz * Math.sin(th)) / n
    const up = -(dx * Math.sin(th) + dz * Math.cos(th)) / n
    const len = Math.hypot(across, up * 0.7) || 1
    const x = Math.max(10, Math.min(vp.width - 10, c.k.x + (across / len) * 150))
    const y = Math.max(110, Math.min(vp.height - 20, c.k.y + ((up * 0.7) / len) * 150))
    if (!down) {
      // (Pressed on Mommy, Daddy or a prop it would tap them instead of leading her.)
      await page.mouse.move(c.k.x, Math.max(120, c.k.y - 150))
      await page.mouse.down()
      down = true
    }
    await page.mouse.move(x, y)
    await page.waitForTimeout(200)
  }
  if (down) await page.mouse.up()
}

/** Screenshots (scripts/qa-screens.mjs). */
/** A finger held ~150 px from Kaylee toward the beach puppy (where there is one: #357 way-finding), else along a
 *  route, until `done(q)` or `ms` run out. In the taxi the finger lifts (it drives); with the puppy waiting in the
 *  taxi, toward the taxi. */
async function followPuppy(page, route, done, ms) {
  const vp = page.viewportSize()
  const t0 = Date.now()
  let i = 0
  let down = false
  while (Date.now() - t0 < ms) {
    const q = await page.evaluate(() => window.__thaiSametQA?.())
    if (!q || !q.kaylee || done(q)) break
    let x = null
    let y = null
    if (q.phase === 'taxi') {
      if (down) await page.mouse.up()
      down = false
      await page.waitForTimeout(300)
      continue
    }
    const aim = q.puppy ? (q.puppy.state === 'aboard' ? { x: q.taxi.x, y: q.taxi.y } : q.puppy.onScreen ? q.puppy.screen : null) : null
    if (aim) {
      const dx = aim.x - q.kaylee.x
      const dy = aim.y - q.kaylee.y
      const l = Math.hypot(dx, dy) || 1
      x = q.kaylee.x + (dx / l) * Math.min(150, l)
      y = q.kaylee.y + (dy / l) * Math.min(150, l)
    } else {
      const goal = q.puppy ? [q.puppy.x, q.puppy.z] : route[i]
      while (!q.puppy && i < route.length && Math.hypot(route[i][0] - q.x, route[i][1] - q.z) < 3) i++
      if (!goal || (!q.puppy && i >= route.length)) break
      const th = (q.cameraYaw * Math.PI) / 180
      const dx = goal[0] - q.x
      const dz = goal[1] - q.z
      const n = Math.hypot(dx, dz) || 1
      const across = (dx * -Math.cos(th) + dz * Math.sin(th)) / n
      const up = -(dx * Math.sin(th) + dz * Math.cos(th)) / n
      const len = Math.hypot(across, up * 0.7) || 1
      x = q.kaylee.x + (across / len) * 150
      y = q.kaylee.y + ((up * 0.7) / len) * 150
    }
    x = Math.max(10, Math.min(vp.width - 10, x))
    y = Math.max(120, Math.min(vp.height - 20, y))
    if (!down) {
      await page.mouse.move(q.kaylee.x, Math.max(130, q.kaylee.y - 150))
      await page.mouse.down()
      down = true
    }
    await page.mouse.move(x, y)
    await page.waitForTimeout(200)
  }
  if (down) await page.mouse.up()
}

export const screens = [
  { name: 'thailand-samet-pack', hash: '#/world/thailand/samet-trip/pack', reset: true, wait: 3500 },
  { name: 'thailand-samet-speedboat-pier', hash: '#/world/thailand/samet-trip/speedboat', reset: true, wait: 2500 },
  { name: 'thailand-samet-speedboat-sea', hash: '#/world/thailand/samet-trip/speedboat', reset: true, wait: 9000, act: async (page) => boatSpray(page, 3000) },
  { name: 'thailand-samet-island-home', hash: '#/world/thailand/samet-trip/island?at=nadan&flags=all', reset: true, wait: 2500 },
  { name: 'thailand-samet-island-nadan', hash: '#/world/thailand/samet-trip/island?at=nadan', reset: true, wait: 2500 },
  { name: 'thailand-samet-island-saikaew', hash: '#/world/thailand/samet-trip/island?at=saikaew&flags=jetski', reset: true, wait: 2500 },
  { name: 'thailand-samet-island-prao', hash: '#/world/thailand/samet-trip/island?at=prao&flags=jetski,sandcastle,snorkel', reset: true, wait: 2500 },
  { name: 'thailand-samet-island-night', hash: '#/world/thailand/samet-trip/island?at=saikaew&flags=all&time=night', reset: true, wait: 2500 },
  { name: 'thailand-samet-phone-wongduan', hash: '#/world/thailand/samet-trip/island?at=wongduan&phone=1', reset: true, wait: 2500 },
  { name: 'thailand-samet-phone-prao', hash: '#/world/thailand/samet-trip/island?at=prao&phone=1', reset: true, wait: 2500 },
  { name: 'thailand-samet-book', hash: '#/world/thailand/samet-trip/book?at=saikaew&flags=jetski,sandcastle,snorkel&book=monitor,squirrel,macaque,hornbill,heron,tern,crab,parrotfish,damselfish,cuttlefish,urchin,coral', reset: true, wait: 3000 },
  { name: 'thailand-samet-jetski-jacket', hash: '#/world/thailand/samet-trip/jetski?round=ride', reset: true, wait: 3500 },
  {
    name: 'thailand-samet-jetski-waves',
    hash: '#/world/thailand/samet-trip/jetski?round=waves',
    reset: true,
    wait: 2500,
    act: async (page) => {
      const vp = page.viewportSize()
      await page.mouse.move(vp.width / 2, vp.height * 0.3)
      await page.mouse.down()
      await page.waitForTimeout(3000)
      await page.mouse.up()
    },
  },
  { name: 'thailand-samet-jetski-race', hash: '#/world/thailand/samet-trip/jetski?round=race', reset: true, wait: 2500 },
  { name: 'thailand-samet-sand-dig', hash: '#/world/thailand/samet-trip/sandcastle?round=dig', reset: true, wait: 2500 },
  {
    name: 'thailand-samet-sand-towers',
    hash: '#/world/thailand/samet-trip/sandcastle?round=towers',
    reset: true,
    wait: 2500,
    act: async (page) => {
      // Tap each mould where it waits: it hops onto the castle and flips to leave its tower.
      for (const i of [0, 1, 2]) {
        const m = (await page.evaluate(() => window.__thaiSametQA?.()))?.moulds?.[i]
        if (m) await page.mouse.click(m.x, m.y)
        await page.waitForTimeout(1800)
      }
    },
  },
  {
    name: 'thailand-samet-sand-tide',
    hash: '#/world/thailand/samet-trip/sandcastle?round=tide&feel.sandTide.time=4',
    reset: true,
    wait: 3000,
    act: async (page) => {
      await sandChannel(page)
      await page.waitForTimeout(5000)
    },
  },
  {
    name: 'thailand-samet-deck-lunch',
    hash: '#/world/thailand/samet-trip/deck',
    reset: true,
    wait: 2500,
    act: async (page) => {
      // A roll from the basket and three bites, then hold a finger on the coconut until it's gone.
      await page.locator('[data-anchor="basket"]').click({ force: true }).catch(() => {})
      await page.waitForTimeout(1200)
      for (let i = 0; i < 3; i++) {
        await page.locator('[data-anchor="kaylee"]').click({ force: true }).catch(() => {})
        await page.waitForTimeout(400)
      }
      await page.waitForTimeout(800)
      const c = (await page.evaluate(() => window.__thaiSametQA?.()))?.cup
      if (c) {
        await page.mouse.move(c.x, c.y - 20)
        await page.mouse.down()
        await page.waitForTimeout(4000)
        await page.mouse.up()
      }
    },
  },
  { name: 'thailand-samet-hideseek-count', hash: '#/world/thailand/samet-trip/hideseek?round=1', reset: true, wait: 2600 },
  { name: 'thailand-samet-hideseek-seek', hash: '#/world/thailand/samet-trip/hideseek?round=1', reset: true, wait: 6000 },
  { name: 'thailand-samet-hideseek-tricky', hash: '#/world/thailand/samet-trip/hideseek?round=2', reset: true, wait: 6000 },
  {
    name: 'thailand-samet-hideseek-hide',
    hash: '#/world/thailand/samet-trip/hideseek?round=hide',
    reset: true,
    wait: 2000,
    act: async (page) => {
      await page.locator('[data-anchor="hide:chairs"]').click({ force: true }).catch(() => {})
      await page.waitForTimeout(6500)
    },
  },
  { name: 'thailand-samet-snorkel-float', hash: '#/world/thailand/samet-trip/snorkel?round=float', reset: true, wait: 3500 },
  { name: 'thailand-samet-snorkel-follow', hash: '#/world/thailand/samet-trip/snorkel?round=follow', reset: true, wait: 3500 },
  {
    name: 'thailand-samet-snorkel-cuttle',
    hash: '#/world/thailand/samet-trip/snorkel?round=cuttle',
    reset: true,
    wait: 2500,
    act: async (page) => snorkelLead(page, 'cuttleAt', 5000),
  },
  { name: 'thailand-samet-sunset', hash: '#/world/thailand/samet-trip/sunset?flags=all', reset: true, wait: 3000 },
  { name: 'thailand-samet-sunset-night', hash: '#/world/thailand/samet-trip/sunset?flags=all', reset: true, wait: 2500, act: async (page) => { await pullSun(page); await page.waitForTimeout(4500) } },
  { name: 'thailand-samet-fireshow-twirl', hash: '#/world/thailand/samet-trip/fireshow?round=twirl&flags=all', reset: true, wait: 3000, act: async (page) => { await poiCircles(page, 1, 2); } },
  { name: 'thailand-samet-fireshow-shape', hash: '#/world/thailand/samet-trip/fireshow?round=shapes&flags=all', reset: true, wait: 4000 },
  { name: 'thailand-samet-fireshow-finish', hash: '#/world/thailand/samet-trip/fireshow?round=finish&flags=all', reset: true, wait: 2500, act: async (page) => { for (let i = 0; i < 4; i++) await poiCircles(page, 0.8, 1.15, 30); await page.waitForTimeout(2000); await poiCircles(page, (q) => q.bigR, 1.15, 40); await page.waitForTimeout(5000) } },
]

/** Holds a finger on something the snorkel's QA reports a screen point for (`parrotAt`, `cuttleAt`), following it. */
async function snorkelLead(page, key, ms) {
  const vp = page.viewportSize()
  let q = await page.evaluate(() => window.__thaiSametQA?.())
  const at = (p) => [Math.max(5, Math.min(vp.width - 5, p.x)), Math.max(120, Math.min(vp.height - 5, p.y))]
  await page.mouse.move(...at(q[key]))
  await page.mouse.down()
  for (let t = 0; t < ms; t += 250) {
    q = await page.evaluate(() => window.__thaiSametQA?.())
    await page.mouse.move(...at(q[key]))
    await page.waitForTimeout(250)
  }
  await page.mouse.up()
}

/** Digs a channel from the moat's sea side down to the water (the castle and the sea's screen points from QA). */
async function sandChannel(page) {
  const q = await page.evaluate(() => window.__thaiSametQA?.())
  if (!q?.castle) return
  const c = q.castle
  const s = q.sea0
  const pm = Math.abs(s.y - c.y) / 5.3
  const y0 = c.y - 0.85 * pm
  for (let r = 0; r < 3; r++) {
    await page.mouse.move(c.x + 0.7 * pm, y0)
    await page.mouse.down()
    for (let i = 1; i <= 17; i++) {
      await page.mouse.move(c.x + 0.7 * pm, y0 + (i / 17) * (s.y - 25 - y0))
      await page.waitForTimeout(45)
    }
    await page.mouse.up()
  }
}

/** Holds a finger on the water beside the speedboat (QA's `water` point), dragging along the side and back. */
async function boatSpray(page, ms) {
  const vp = page.viewportSize()
  const q = await page.evaluate(() => window.__thaiSametQA?.())
  if (!q?.water) return
  const at = (x, y) => [Math.max(5, Math.min(vp.width - 5, x)), Math.max(120, Math.min(vp.height - 5, y))]
  await page.mouse.move(...at(q.water.x, q.water.y))
  await page.mouse.down()
  for (let t = 0; t < ms; t += 120) {
    await page.mouse.move(...at(q.water.x + Math.sin(t / 400) * vp.width * 0.06, q.water.y + Math.sin(t / 300) * vp.height * 0.08))
    await page.waitForTimeout(120)
  }
  await page.mouse.up()
}

/** Her finger drawing circles round the middle of the fire show's drawing plane (`r` meters, `loops` times). */
async function poiCircles(page, r, loops, steps = 36) {
  const q = await page.evaluate(() => window.__thaiSametQA?.())
  if (!q?.plane) return
  const { x, y, ppm } = q.plane
  const R = (typeof r === 'function' ? r(q) : r) * ppm
  await page.mouse.move(x + R, y)
  await page.mouse.down()
  for (let i = 0; i <= loops * steps; i++) {
    const a = (i / steps) * Math.PI * 2
    await page.mouse.move(x + Math.cos(a) * R, y + Math.sin(a) * R)
    await page.waitForTimeout(18)
  }
  await page.mouse.up()
}
/** Her finger round the fire show's dots, in order (QA's `dotsLeft`), or round the plane at the shape's size. */
async function traceDots(page) {
  const q = await page.evaluate(() => window.__thaiSametQA?.())
  if (!q) return
  let pts = q.dotsLeft
  if (!pts?.length) {
    const { x, y, ppm } = q.plane
    pts = Array.from({ length: 40 }, (_, i) => ({ x: x + Math.sin((i / 40) * Math.PI * 2) * q.shapeSize * ppm, y: y - Math.cos((i / 40) * Math.PI * 2) * q.shapeSize * ppm }))
  }
  await page.mouse.move(pts[0].x, pts[0].y)
  await page.mouse.down()
  for (const p of [...pts, pts[0]]) {
    await page.mouse.move(p.x, p.y, { steps: 2 })
    await page.waitForTimeout(45)
  }
  await page.mouse.up()
}
/** Pulls the sun down to the sea. */
async function pullSun(page) {
  const q = await page.evaluate(() => window.__thaiSametQA?.())
  if (!q?.sun) return
  await page.mouse.move(q.sun.x, q.sun.y)
  await page.mouse.down()
  for (let i = 0; i <= 30; i++) {
    await page.mouse.move(q.sun.x, q.sun.y + ((q.horizon.y + 60 - q.sun.y) * i) / 30)
    await page.waitForTimeout(40)
  }
  await page.mouse.up()
}

/** The first tap target showing whose name starts with one of these. */
const firstAnchor = (page, ...prefixes) => page.evaluate((prefixes) => {
  for (const e of document.querySelectorAll('[data-anchor]')) {
    if (e.style.display === 'none' || !prefixes.some((p) => e.dataset.anchor.startsWith(p))) continue
    const r = e.getBoundingClientRect()
    const x = r.x + r.width / 2
    const y = r.y + r.height / 2
    if (x > 20 && x < innerWidth - 20 && y > 120 && y < innerHeight - 140) return { id: e.dataset.anchor, x, y }
  }
  return null
}, prefixes)
const press = async (page, p, ms) => {
  await page.mouse.move(p.x, p.y)
  await page.mouse.down()
  await page.waitForTimeout(ms)
  await page.mouse.up()
}

/** Filmed moments (scripts/qa-motion.mjs). */
export const motion = [
  // Taps and targets on the island (#357 batch 4).
  {
    name: 'thailand-samet-taps-snorkel-ring',
    seconds: 11,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/island?at=wongduan`)
      await ready(page)
      await page.waitForTimeout(3000)
    },
    act: async (page) => {
      const r = (await page.evaluate(() => window.__thaiSametQA())).rings.snorkel
      await leadAlong(page, [[r.x, r.z]], 8000)
      await page.waitForTimeout(2500)
    },
  },
  {
    name: 'thailand-samet-taps-hold-or-poke',
    seconds: 9,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/island?at=prao`)
      await ready(page)
      await page.waitForTimeout(3000)
    },
    act: async (page) => {
      // A quick tap pokes the umbrella; a held finger on the next one leads her.
      const a = await firstAnchor(page, 'umbrella:', 'chair:', 'palm:')
      if (a) await press(page, a, 120)
      await page.waitForTimeout(1200)
      const b = await firstAnchor(page, 'chair:', 'umbrella:', 'palm:')
      if (b) await press(page, b, 2600)
      await page.waitForTimeout(800)
    },
  },
  {
    name: 'thailand-samet-taps-bin',
    seconds: 13,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/island?at=prao`)
      await ready(page)
      await page.waitForTimeout(3000)
    },
    act: async (page) => {
      const j = await firstAnchor(page, 'junk:')
      if (j) await press(page, j, 80)
      await page.waitForFunction(() => window.__thaiSametQA().carrying, null, { timeout: 7000 }).catch(() => {})
      await page.waitForTimeout(400)
      const bin = await firstAnchor(page, 'bin:')
      if (bin) await press(page, bin, 80)
      await page.waitForTimeout(5000)
    },
  },
  {
    name: 'thailand-samet-taps-pier-rail',
    seconds: 8,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/island?at=nadan`)
      await ready(page)
      await page.waitForTimeout(3000)
    },
    act: async (page) => {
      // A finger square across the pier, past its rail.
      const r = (await page.evaluate(() => window.__thaiSametQA())).rails[0]
      await press(page, r, 4000)
      await page.waitForTimeout(1500)
    },
  },
  {
    name: 'thailand-samet-fireshow-twirl',
    seconds: 10,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/fireshow?round=twirl&flags=all`)
      await ready(page)
      await page.waitForTimeout(2500)
    },
    act: async (page) => {
      // Small quick circles, then big slow ones (the dancers copy her, then swing a ring of fire).
      await poiCircles(page, 0.6, 3, 24)
      await poiCircles(page, 1.3, 2, 48)
      await page.waitForTimeout(1500)
    },
  },
  {
    name: 'thailand-samet-fireshow-finish',
    seconds: 12,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/fireshow?round=finish&flags=all`)
      await ready(page)
      await page.waitForTimeout(2000)
      for (let i = 0; i < 4; i++) {
        await poiCircles(page, 0.8, 1.15, 30)
        await page.waitForTimeout(500)
      }
      await page.waitForTimeout(1600)
    },
    act: async (page) => {
      await poiCircles(page, (q) => q.bigR, 1.15, 40)
      await page.waitForTimeout(9000)
    },
  },
  {
    name: 'thailand-samet-speedboat-spray',
    seconds: 10,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/speedboat`)
      await ready(page)
      await page.waitForTimeout(9000)
    },
    act: async (page) => boatSpray(page, 9000),
  },
  {
    name: 'thailand-samet-snorkel-lead',
    seconds: 10,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/snorkel?round=float`)
      await ready(page)
      await page.waitForTimeout(2500)
    },
    act: async (page) => {
      // Lead her over the reef, weaving left and right (the crowd parts round her, bubbles stream off her flippers).
      const vp = page.viewportSize()
      await page.mouse.move(vp.width / 2, vp.height * 0.25)
      await page.mouse.down()
      for (let i = 0; i < 36; i++) {
        await page.mouse.move(vp.width / 2 + Math.sin(i / 5) * vp.width * 0.25, vp.height * 0.25)
        await page.waitForTimeout(250)
      }
      await page.mouse.up()
    },
  },
  {
    name: 'thailand-samet-snorkel-follow',
    seconds: 10,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/snorkel?round=follow`)
      await ready(page)
      await page.waitForTimeout(3000)
    },
    act: async (page) => snorkelLead(page, 'parrotAt', 9000),
  },
  {
    name: 'thailand-samet-hideseek-find',
    seconds: 10,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/hideseek?round=1`)
      await ready(page)
      await page.waitForTimeout(5200)
    },
    act: async (page) => {
      // Peek behind the umbrella (not there: he giggles from the tree), then the tree: "Found you!", he jumps out.
      await page.locator('[data-anchor="hide:umbrella"]').click({ force: true }).catch(() => {})
      await page.waitForTimeout(3500)
      await page.locator('[data-anchor="hide:tree"]').click({ force: true }).catch(() => {})
      await page.waitForTimeout(5000)
    },
  },
  {
    name: 'thailand-samet-hideseek-search',
    seconds: 12,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/hideseek?round=hide`)
      await ready(page)
      await page.waitForTimeout(1500)
      await page.locator('[data-anchor="hide:chairs"]').click({ force: true }).catch(() => {})
      await page.waitForTimeout(5000)
    },
    act: async (page) => page.waitForTimeout(12000),
  },
  {
    name: 'thailand-samet-sand-dig',
    seconds: 10,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/sandcastle?round=dig`)
      await ready(page)
    },
    act: async (page) => {
      // A moat round the castle (the walls pile up on both sides, Kaylee digs along), twice round, then bury Daddy.
      const q = await page.evaluate(() => window.__thaiSametQA?.())
      const c = q.castle
      const pm = Math.abs(q.sea0.y - c.y) / 5.3
      await page.mouse.move(c.x + 1.25 * pm, c.y)
      await page.mouse.down()
      for (let i = 1; i <= 80; i++) {
        const t = (i / 40) * Math.PI * 2
        await page.mouse.move(c.x + Math.cos(t) * 1.25 * pm, c.y + Math.sin(t) * 0.8 * pm)
        await page.waitForTimeout(45)
      }
      await page.mouse.up()
      const d = q.dad
      await page.mouse.move(d.x - 30, d.y - 40)
      await page.mouse.down()
      for (let i = 1; i <= 30; i++) {
        await page.mouse.move(d.x + (i % 2 ? 30 : -30), d.y - 40 + (i % 10) * 10)
        await page.waitForTimeout(50)
      }
      await page.mouse.up()
    },
  },
  {
    name: 'thailand-samet-sand-fill',
    seconds: 8,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/sandcastle?round=tide&feel.sandTide.time=3`)
      await ready(page)
      await page.waitForTimeout(3000)
    },
    act: async (page) => {
      // The channel to the sea: the water rushes in and fills the moat, the hermit crab walks up to a tower.
      await sandChannel(page)
      await page.waitForTimeout(4000)
    },
  },
  // #357 sandcastle batch: the moat dug round (each bit twinkles, the moulds bounce in, a cheer, the towers come).
  {
    name: 'thailand-samet-sand-moat',
    seconds: 10,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/sandcastle?round=dig`)
      await ready(page)
      await page.waitForTimeout(1500)
    },
    act: async (page) => {
      const q = await page.evaluate(() => window.__thaiSametQA?.())
      const c = q.castle
      const pm = Math.abs(q.sea0.y - c.y) / 5.3
      await page.mouse.move(c.x + 1.25 * pm, c.y)
      await page.mouse.down()
      for (let i = 1; i <= 52; i++) {
        const t = (i / 48) * Math.PI * 2
        await page.mouse.move(c.x + Math.cos(t) * 1.25 * pm, c.y + Math.sin(t) * 0.8 * pm)
        await page.waitForTimeout(70)
      }
      await page.mouse.up()
      await page.waitForTimeout(3000)
    },
  },
  // Filling a bucket: drag it through the sand (it scoops) and tap it (a tower); dig beside the next one.
  {
    name: 'thailand-samet-sand-bucket',
    seconds: 12,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/sandcastle?round=towers`)
      await ready(page)
      await page.waitForTimeout(2500)
    },
    act: async (page) => {
      const vp = page.viewportSize()
      const u = Math.min(vp.width, vp.height) / 12
      let m = (await page.evaluate(() => window.__thaiSametQA?.()))?.moulds?.[0]
      if (!m) return
      await page.mouse.move(m.x, m.y)
      await page.mouse.down()
      for (let i = 1; i <= 36; i++) {
        await page.mouse.move(m.x + Math.sin(i * 0.35) * u * 1.4, m.y - (i / 36) * u * 2.2)
        await page.waitForTimeout(60)
      }
      await page.mouse.up()
      await page.waitForTimeout(600)
      m = (await page.evaluate(() => window.__thaiSametQA?.()))?.moulds?.[0]
      await page.mouse.click(m.x, m.y)
      await page.waitForTimeout(2000)
      // The square one: dig right beside it, and the sand flies in.
      const s = (await page.evaluate(() => window.__thaiSametQA?.()))?.moulds?.[1]
      for (let r = 0; r < 3; r++) {
        await page.mouse.move(s.x - u * 1.2, s.y - u * (1.1 + r * 0.25))
        await page.mouse.down()
        for (let i = 1; i <= 10; i++) {
          await page.mouse.move(s.x - u * 1.2 + (i / 10) * u * 2.4, s.y - u * (1.1 + r * 0.25))
          await page.waitForTimeout(60)
        }
        await page.mouse.up()
      }
      await page.waitForTimeout(1500)
    },
  },
  // Burying Daddy: a few rubs over him, then he wiggles his toes and sneezes himself out.
  {
    name: 'thailand-samet-sand-bury',
    seconds: 10,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/sandcastle?round=dig`)
      await ready(page)
      await page.waitForTimeout(1500)
    },
    act: async (page) => {
      const d = (await page.evaluate(() => window.__thaiSametQA?.())).dad
      const vp = page.viewportSize()
      const u = Math.min(vp.width, vp.height) / 14
      await page.mouse.move(d.x - u, d.y + u)
      await page.mouse.down()
      for (let i = 1; i <= 60; i++) {
        await page.mouse.move(d.x + (i % 2 ? u : -u), d.y + u - ((i % 12) / 12) * u * 2.4)
        await page.waitForTimeout(55)
      }
      await page.mouse.up()
      await page.waitForTimeout(5000)
    },
  },
  // The tide, a channel dug from the moat's rim out to the sea (#357: it left a dam and the moat stayed dry): the
  // sand left between glints and gives way, and the water runs into the moat.
  {
    name: 'thailand-samet-sand-out',
    seconds: 11,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/sandcastle?round=tide&feel.sandTide.time=3`)
      await ready(page)
      await page.waitForTimeout(3500)
    },
    act: async (page) => {
      // (From the castle's and the sea's screen points, so the same spot on main for the before clip.)
      const q = await page.evaluate(() => window.__thaiSametQA?.())
      const c = q.castle
      const pm = Math.abs(q.sea0.y - c.y) / 5.3
      const a = { x: c.x + 0.7 * pm, y: c.y - 1.45 * pm }
      const b = { x: c.x + 0.7 * pm, y: q.sea0.y - 0.3 * pm }
      await page.mouse.move(a.x, a.y)
      await page.mouse.down()
      for (let i = 1; i <= 24; i++) {
        await page.mouse.move(a.x + ((b.x - a.x) * i) / 24, a.y + ((b.y - a.y) * i) / 24)
        await page.waitForTimeout(60)
      }
      await page.mouse.up()
      await page.waitForTimeout(6500)
    },
  },
  {
    name: 'thailand-samet-island-lead',
    seconds: 10,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/island?at=saikaew`)
      await ready(page)
    },
    act: async (page) => {
      // Lead her along the sand (a finger far ahead: the gallop, hoofprints), then down into the sea (the floatie).
      const vp = page.viewportSize()
      await page.mouse.move(vp.width * 0.15, vp.height * 0.45)
      await page.mouse.down()
      await page.waitForTimeout(4000)
      await page.mouse.move(vp.width * 0.2, vp.height * 0.85)
      await page.waitForTimeout(5000)
      await page.mouse.up()
    },
  },
  {
    name: 'thailand-samet-family-road',
    seconds: 13,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/island?at=saikaew`)
      await ready(page)
    },
    // Up the slope behind Sai Kaew and along the inland road: Mommy and Daddy climb it with her.
    act: (page) => leadAlong(page, [[-6, -22], [-6, -17], [-11, -27], [-14, -40]], 13000),
  },
  {
    name: 'thailand-samet-family-swim',
    seconds: 44,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/island?at=wongduan`)
      await ready(page)
    },
    // Out to sea for half a minute: Mommy and Daddy wait at the water's edge, and they're there when she swims back.
    act: async (page) => {
      await leadAlong(page, [[-138, 134], [-130, 175]], 23000)
      await leadAlong(page, [[-140, 140], [-152, 133]], 21000)
    },
  },
  {
    name: 'thailand-samet-island-kite',
    seconds: 5,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/island?at=hinkhok`)
      await ready(page)
    },
    act: async (page) => {
      // Poke the umbrella three times: it takes off like a kite with Kaylee holding on.
      for (let i = 0; i < 3; i++) {
        await page.locator('[data-anchor="umbrella:0"]').click({ force: true })
        await page.waitForTimeout(150)
      }
      await page.waitForTimeout(4000)
    },
  },
  {
    name: 'thailand-samet-jetski-carve',
    seconds: 10,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/jetski?round=ride`)
      await ready(page)
      await page.locator('[data-anchor="jacket"]').waitFor({ state: 'visible', timeout: 15000 })
      await page.locator('[data-anchor="jacket"]').click({ force: true })
      await page.waitForFunction(() => window.__thaiSametQA?.().phase === 'ride', null, { timeout: 8000 })
    },
    act: async (page) => {
      const vp = page.viewportSize()
      // Straight out, then hold far to one side: doughnuts (the wake closes into a loop, Daddy goes dizzy).
      await page.mouse.move(vp.width / 2, vp.height * 0.3)
      await page.mouse.down()
      await page.waitForTimeout(2500)
      await page.mouse.move(vp.width * 0.95, vp.height * 0.62)
      await page.waitForTimeout(7000)
      await page.mouse.up()
    },
  },
  {
    // Issue #357: a finger straight up the screen goes straight, then the same distance right and left.
    name: 'thailand-samet-jetski-steer',
    seconds: 13,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/jetski?round=ride`)
      await ready(page)
      await page.locator('[data-anchor="jacket"]').waitFor({ state: 'visible', timeout: 15000 })
      await page.locator('[data-anchor="jacket"]').click({ force: true })
      await page.waitForFunction(() => window.__thaiSametQA?.().phase === 'ride', null, { timeout: 8000 })
      await page.waitForTimeout(2500)
    },
    act: async (page) => {
      const vp = page.viewportSize()
      await page.mouse.move(vp.width / 2, vp.height * 0.3)
      await page.mouse.down()
      await page.waitForTimeout(4500)
      await page.mouse.move(vp.width * 0.8, vp.height * 0.3)
      await page.waitForTimeout(4000)
      await page.mouse.move(vp.width * 0.2, vp.height * 0.3)
      await page.waitForTimeout(4000)
      await page.mouse.up()
    },
  },
  {
    // The rope: she runs into the edge of the bay and rides along it.
    name: 'thailand-samet-jetski-rope',
    seconds: 13,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/jetski?round=ride`)
      await ready(page)
      await page.locator('[data-anchor="jacket"]').waitFor({ state: 'visible', timeout: 15000 })
      await page.locator('[data-anchor="jacket"]').click({ force: true })
      await page.waitForFunction(() => window.__thaiSametQA?.().phase === 'ride', null, { timeout: 8000 })
    },
    act: async (page) => {
      const vp = page.viewportSize()
      await page.mouse.move(vp.width / 2, vp.height * 0.3)
      await page.mouse.down()
      await page.waitForTimeout(13000)
      await page.mouse.up()
    },
  },
  {
    // The waves round's stars: wander over the waves and catch them.
    name: 'thailand-samet-jetski-stars',
    seconds: 16,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/jetski?round=waves`)
      await ready(page)
      await page.waitForTimeout(1000)
    },
    act: async (page) => {
      const vp = page.viewportSize()
      await page.mouse.move(vp.width / 2, vp.height * 0.3)
      await page.mouse.down()
      for (let i = 0; i < 150; i++) {
        await page.mouse.move(vp.width / 2 + Math.sin(i / 9) * vp.width * 0.4, vp.height * 0.3)
        await page.waitForTimeout(100)
      }
      await page.mouse.up()
    },
  },
  {
    // The race with no finger on the screen: the arrow, the ring on the buoy, Sparkle's hint.
    name: 'thailand-samet-jetski-race-idle',
    seconds: 15,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/jetski?round=race`)
      await ready(page)
    },
    act: async (page) => {
      await page.waitForTimeout(15000)
    },
  },
  {
    name: 'thailand-samet-jetski-jumps',
    seconds: 8,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/jetski?round=waves`)
      await ready(page)
    },
    act: async (page) => {
      const vp = page.viewportSize()
      const x = vp.width / 2
      await page.mouse.move(x, vp.height * 0.3)
      await page.mouse.down()
      for (let i = 0; i < 75; i++) {
        await page.mouse.move(x + Math.sin(i / 12) * vp.width * 0.2, vp.height * 0.3)
        await page.waitForTimeout(100)
      }
      await page.mouse.up()
    },
  },
  {
    name: 'thailand-samet-phone-snap',
    seconds: 8,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/island?at=prao&phone=1`)
      await ready(page)
      await page.waitForTimeout(1500)
    },
    act: async (page) => {
      // Snap whatever animals are on screen (each poses, the flash, the photo flies into the book).
      const vp = page.viewportSize()
      const s = await page.evaluate(() => window.__thaiSametQA?.())
      const on = Object.values(s?.animals ?? {}).filter((a) => a.x > 40 && a.x < vp.width - 40 && a.y > 90 && a.y < vp.height - 40)
      for (const a of on.slice(0, 3)) {
        await page.mouse.click(a.x, a.y)
        await page.waitForTimeout(2200)
      }
      await page.waitForTimeout(1500)
    },
  },
  {
    name: 'thailand-samet-beach-clean',
    seconds: 12,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/island?at=prao`)
      await ready(page)
      await page.waitForTimeout(1000)
    },
    act: async (page) => {
      // Tap the rubbish on the sand: she walks over and lifts it (a hermit crab climbs out); then the bin: plonk.
      const vp = page.viewportSize()
      const s = await page.evaluate(() => window.__thaiSametQA?.())
      const id = Object.entries(s?.junk ?? {}).find(([, a]) => a.x > 0 && a.x < vp.width && a.y > 80 && a.y < vp.height)?.[0]
      if (id) await page.locator(`[data-anchor="${id}"]`).click({ force: true })
      await page.waitForTimeout(5000)
      await page.locator('[data-anchor="bin:4"]').click({ force: true }).catch(() => {})
      await page.waitForTimeout(6000)
    },
  },
  // Snorkel and hide and seek, fixed (#357 batch): Daddy's hiding place on screen and the help rising when she's stuck
  // (he peeks out, his place glows, he pops out and waves, he runs over), every hide of the trickier round found, a
  // silly hide behind a thin palm (Mommy giggles, Daddy looks the wrong way), the cuttlefish jetting off twice before it
  // turns pink, and her floaties keeping off the boat's hull.
  {
    name: 'thailand-samet-fix-hideseek-help',
    seconds: 34,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/hideseek?round=2`)
      await ready(page)
    },
    act: async (page) => page.waitForTimeout(34000),
  },
  {
    name: 'thailand-samet-fix-hideseek-tricky',
    seconds: 30,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/hideseek?round=2`)
      await ready(page)
    },
    act: async (page) => {
      // Each seek: a moment to look, then tap where he hides (she walks over and finds him).
      const t0 = Date.now()
      let last = ''
      while (Date.now() - t0 < 29000) {
        const s = await page.evaluate(() => window.__thaiSametQA?.())
        if (s?.round === 'hide') break
        if (s?.phase === 'seek' && s.hide !== last) {
          last = s.hide
          await page.waitForTimeout(900)
          await page.locator(`[data-anchor="hide:${s.hide}"]`).click({ force: true, timeout: 2000 }).catch(() => {})
        }
        await page.waitForTimeout(300)
      }
    },
  },
  {
    name: 'thailand-samet-fix-hide-silly',
    seconds: 16,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/hideseek?round=hide`)
      await ready(page)
      await page.waitForTimeout(1200)
    },
    act: async (page) => {
      await page.locator('[data-anchor="hide:palmL"]').click({ force: true }).catch(() => {})
      await page.waitForTimeout(15000)
    },
  },
  {
    name: 'thailand-samet-fix-cuttle',
    seconds: 34,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/snorkel?round=cuttle`)
      await ready(page)
      await page.waitForTimeout(2000)
    },
    act: async (page) => snorkelLead(page, 'cuttleAt', 33000),
  },
  {
    name: 'thailand-samet-fix-float-boat',
    seconds: 12,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/snorkel?round=float`)
      await ready(page)
      await page.waitForTimeout(3000)
    },
    act: async (page) => {
      // Swim her right into the boat's side, then along it (she slides along the hull, her floaties outside it).
      const s = await page.evaluate(() => window.__thaiSametQA?.())
      const vp = page.viewportSize()
      const at = (x, y) => [Math.max(5, Math.min(vp.width - 5, x)), Math.max(120, Math.min(vp.height - 5, y))]
      await page.mouse.move(...at(s.kaylee.x + vp.width * 0.3, s.kaylee.y - 10))
      await page.mouse.down()
      for (let i = 0; i < 44; i++) {
        const k = i / 44
        await page.mouse.move(...at(s.kaylee.x + vp.width * 0.32, s.kaylee.y - 10 - k * vp.height * 0.25))
        await page.waitForTimeout(250)
      }
      await page.mouse.up()
    },
  },
  // ---- The finale, fixed (#357 batch: the fire show's shapes, the finish badge, the idle sunset).
  {
    name: 'thailand-samet-finale-shapes',
    seconds: 14,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/fireshow?round=shapes&flags=all`)
      await ready(page)
      await page.waitForFunction(() => window.__thaiSametQA().phase === 'trace', null, { timeout: 15000 }).catch(() => {})
      await page.waitForTimeout(800)
    },
    act: async (page) => {
      // The circle's dots up in the sky over the family: she draws round them, it lifts away as lanterns; then the
      // star the dancers draw next.
      await traceDots(page)
      await page.waitForFunction(() => window.__thaiSametQA().phase === 'trace', null, { timeout: 8000 }).catch(() => {})
      await page.waitForTimeout(600)
      await traceDots(page)
      await page.waitForTimeout(2500)
    },
  },
  {
    name: 'thailand-samet-finale-badge',
    seconds: 14,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/fireshow?round=finish&flags=all`)
      await ready(page)
      await page.waitForTimeout(2000)
      for (let i = 0; i < 4; i++) {
        await poiCircles(page, 0.8, 1.15, 30)
        await page.waitForTimeout(500)
      }
      await page.waitForTimeout(1600)
      await poiCircles(page, (q) => q.bigR, 1.15, 40)
    },
    // The ring of fire, the fireworks, the 🔥 🏆 badge and 🏠, while Sparkle and the dancers talk.
    act: async (page) => page.waitForTimeout(14000),
  },
  {
    name: 'thailand-samet-finale-sunset-idle',
    seconds: 30,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/sunset?flags=all`)
      await ready(page)
    },
    // Nobody touches it: the finger shows the pull, Sparkle says it once she's been still a while, and the sun sets on
    // its own (it took 75 s).
    act: async (page) => page.waitForTimeout(30000),
  },
  // Visual polish (#357 batch): see-through, the swim area's rope, the suitcase, the speedboat.
  {
    name: 'thailand-samet-polish-road',
    seconds: 15,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/island?at=saikaew`)
      await ready(page)
    },
    // Up from Sai Kaew past the shelter and under the trees on the inland road: whatever is between the camera and her
    // opens in a clean round hole (it was a screen-door dither with a dark smudge inside the crowns).
    act: (page) => leadAlong(page, [[-6, -22], [-6, -17], [-11, -27], [-14, -40], [-20, -60]], 15000),
  },
  {
    name: 'thailand-samet-polish-sunset',
    seconds: 4,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/sunset?flags=all`)
      await ready(page)
    },
    // The three of them at the driftwood tree: the deck and the tree beyond them stay whole, nothing is banded.
    act: (page) => page.waitForTimeout(4000),
  },
  {
    name: 'thailand-samet-polish-rope',
    seconds: 36,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/island?at=saikaew`)
      await ready(page)
    },
    // Out to sea from Sai Kaew (the floats come up round her near the edge), then a finger held seaward of her: the
    // rope boings her back and the floats bob (`rope.bumps`).
    act: async (page) => {
      await leadAlong(page, [[40, -20], [80, -20]], 26000)
      const vp = page.viewportSize()
      const t0 = Date.now()
      let down = false
      while (Date.now() - t0 < 10000) {
        const q = await page.evaluate(() => window.__thaiSametQA())
        // (Seaward: the camera looks back at the beach from the sea there.)
        const x = Math.max(10, Math.min(vp.width - 10, q.kaylee.x + 105))
        const y = Math.max(110, Math.min(vp.height - 10, q.kaylee.y + 105))
        await page.mouse.move(x, y)
        if (!down) await page.mouse.down()
        down = true
        await page.waitForTimeout(250)
      }
      await page.mouse.up()
    },
  },
  {
    name: 'thailand-samet-polish-pack',
    seconds: 9,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/pack?packed=sunhat,sunscreen,duck`)
      await page.waitForFunction(() => window.__thaiSametQA?.().trip === 'pack', null, { timeout: 20000 })
      await page.waitForTimeout(1200)
    },
    // A tap in the middle of each thing in the suitcase: that thing hops out (their targets overlap on a phone).
    act: async (page) => {
      for (const id of ['sunhat', 'sunscreen', 'duck']) {
        const r = await page.locator(`[data-anchor="trip:item:${id}"]`).boundingBox()
        if (r) await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2)
        await page.waitForTimeout(2200)
      }
    },
  },
  {
    name: 'thailand-samet-polish-boat',
    seconds: 14,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/speedboat`)
      await ready(page)
    },
    // Nobody touching it: the finger shows her hoof's place in the spray at once, and flying fish leap by themselves.
    act: (page) => page.waitForTimeout(14000),
  },
  // #357 way-finding, card B: the beach puppy. The same moments film on main (no puppy: the old way) for before/after.
  {
    name: 'thailand-samet-wayfind-idle',
    seconds: 14,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/island?at=phai`)
      await ready(page)
    },
    // Nobody touching at Ao Phai: the puppy runs ahead toward the sandcastle (his bubble a picture of it), sits and
    // looks back, and after ~8 s comes back to fetch her (main: a small flag badge on the phone button).
    act: (page) => page.waitForTimeout(14000),
  },
  {
    name: 'thailand-samet-wayfind-prao',
    seconds: 50,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/island?at=prao&flags=hideseek`)
      await ready(page)
      await page.waitForTimeout(1500)
    },
    // Ao Prao to Ao Wong Duan following the puppy: his shortcut over the west hills and the sand slide (main: the road
    // round by the spine, ~75 s).
    act: (page) => followPuppy(page, [[-160, -40], [-153, -37], [-134, -40], [-110, -44], [-85, -46], [-95, -20], [-104, 10], [-111, 40], [-121, 70], [-134, 100], [-146, 121], [-150, 135]], (q) => q.at === 'wongduan', 50000),
  },
  {
    name: 'thailand-samet-wayfind-taxi',
    seconds: 40,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/island?at=nadan&flags=jetski,sandcastle,hideseek`)
      await ready(page)
      await page.waitForTimeout(1500)
    },
    // Only the snorkel left, from Na Dan pier: the puppy runs to the taxi and jumps in, she follows him in, it drives
    // straight to Ao Wong Duan and names it there (main: no puppy, she walks to the taxi and taps it).
    act: async (page) => {
      await followPuppy(page, [[-11, -80], [-14, -74]], (q) => q.phase === 'taxi', 16000)
      const q = await page.evaluate(() => window.__thaiSametQA())
      if (q.phase !== 'taxi') await page.mouse.click(q.taxi.x, q.taxi.y)
      await page.waitForTimeout(24000)
    },
  },
  {
    name: 'thailand-samet-wayfind-beside',
    seconds: 14,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/island?at=saikaew`)
      await ready(page)
    },
    // Up the sand to the waiting taxi and stand beside it: it stays, and the camera takes it in.
    act: async (page) => {
      await leadAlong(page, [[-4, -10], [-4, -14]], 8000)
      await page.waitForTimeout(6000)
    },
  },
  {
    name: 'thailand-samet-wayfind-topleft',
    seconds: 8,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/island?at=saikaew`)
      await ready(page)
      await page.waitForTimeout(1500)
    },
    // The big top-left button: the puppy comes running and woofs (main: it leaves Koh Samet for the map).
    act: async (page) => {
      await page.getByRole('button', { name: /Back to the map|Call the puppy/ }).first().click()
      await page.waitForTimeout(6000)
    },
  },
  {
    name: 'thailand-samet-wayfind-home',
    seconds: 16,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/samet-trip/island?at=nadan&flags=jetski`)
      await ready(page)
      await page.waitForTimeout(1500)
    },
    // Tap the speedboat at the end of Na Dan pier: she walks to it, Mommy asks, the home picture comes up.
    act: async (page) => {
      await page.locator('[data-anchor="speedboat:0"]').click({ force: true }).catch(() => {})
      await page.waitForTimeout(8000)
      await page.locator('[data-anchor="speedboat:0"]').click({ force: true }).catch(() => {})
      await page.waitForTimeout(6000)
    },
  },
]

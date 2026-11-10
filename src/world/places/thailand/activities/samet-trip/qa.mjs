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
]

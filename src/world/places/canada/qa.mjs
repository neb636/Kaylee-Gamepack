// Canada's QA scenarios, picked up by scripts/qa-screens.mjs (screens), qa-pacing.mjs (pacing) and
// qa-motion.mjs (motion). A new activity can keep its own next to its sections.ts (activities/<id>/qa.mjs);
// sections no screen reaches get a plain screenshot anyway. Not part of the app: Node runs it, Vite never sees it.
import { vp } from '../../../../scripts/qa-lib.mjs'

/** Screenshots (scripts/qa-screens.mjs): how to get to each screen from a fresh start. */
export const screens = [
  // Canada: the train map: the whole country first, then the train at each stop and on the way (the
  // prairies, just out of the Spiral Tunnel); then an activity's and the finale's "coming soon" cards.
  { name: 'canada-intro', hash: '#/world/canada', reset: true, wait: 900 },
  ...['msa', 'quebec', 'ottawa', 'prairies', 'banff', 'rockies', 'bc'].map((at) => ({ name: `canada-map-${at}`, hash: `#/world/canada/hub/map?at=${at}`, reset: true, wait: 2200 })),
  // Mountain Bike: the gondola, each stretch from its link (berms: both ways), the waterfall at the end.
  ...['gondola', 'green', 'berms?trail=green', 'berms?trail=blue', 'creek', 'falls'].map((to) => ({ name: `canada-bike-${to.replace(/[?=&]/g, '-')}`, hash: `#/world/canada/bike/${to}`, reset: true, wait: to === 'falls' ? 14000 : to === 'gondola' ? 4000 : 3500 })),
  // Sugar Snow (2D): each part from its link (orders with the chipmunk fed; share: everyone's lollipop).
  ...['pour', 'shapes', 'orders?fed=chipmunk', 'share'].map((to) => ({ name: `canada-taffy-${to.replace(/[?=&,]/g, '-')}`, hash: `#/world/canada/taffy/${to}`, reset: true, wait: to === 'share' ? 2400 : 1500 })),
  // Campfire Night: the dark campsite under the flashlight; the last one with the darkness turned off (a
  // feel-lab knob) to check where everything stands.
  ...['eyes', 'sounds', 'bandit', 'marshmallow', 'stars', 'bandit?feel.campTorch.dark=0'].map((to) => ({ name: `canada-campfire-${to.replace(/[?=&,.]/g, '-')}`, hash: `#/world/canada/campfire/${to}`, reset: true, wait: 1800 })),
  // Red Canoe: each part from its link (glide both ways to paddle), the loon family at the glacier.
  ...['glide', 'glide?paddle=pull', 'stream', 'loon', 'glacier'].map((to) => ({ name: `canada-canoe-${to.replace(/[?=&]/g, '-')}`, hash: `#/world/canada/canoe/${to}`, reset: true, wait: to.startsWith('glide') ? 4000 : 3000 })),
  // Animal Bridge: each family from its link (the grizzlies at the bare bridge, then the bridge planted),
  // and the camera's photos at the end.
  ...['elk', 'sheep', 'bears', 'bears?green=1', 'album'].map((to) => ({ name: `canada-bridge-${to.replace(/[?=&,.]/g, '-')}`, hash: `#/world/canada/bridge/${to}`, reset: true, wait: to === 'album' ? 3200 : 1500 })),
  // Whale Watch: each part from its link (the harbour both ways to steer, the humpback that jumps), and
  // under the water listening.
  ...['harbour', 'harbour?steer=wheel', 'otters', 'spouts', 'spouts?found=3', 'orcas', 'listen'].map((to) => ({ name: `canada-whales-${to.replace(/[?=&]/g, '-')}`, hash: `#/world/canada/whales/${to}`, reset: true, wait: to === 'listen' ? 4500 : 3000 })),
  // Salmon Leap: each stretch of the river from its link (the bears' falls with the spirit bear low too),
  // and the stream where the eggs hatch.
  ...['steps', 'falls', 'bears', 'bears?spirit=low', 'eggs'].map((to) => ({ name: `canada-salmon-${to.replace(/[?=&,.]/g, '-')}`, hash: `#/world/canada/salmon/${to}`, reset: true, wait: 1500 })),
  // Decorate a Snowman: each part from its link (his face; dressing him; each friend's picture with the line
  // growing behind), and the parade.
  ...['face', 'dress', 'friends', 'friends?made=3', 'parade'].map((to) => ({ name: `canada-snowman-${to.replace(/[?=&]/g, '-')}`, hash: `#/world/canada/snowman/${to}`, reset: true, wait: to === 'parade' ? 6000 : 2500 })),
]

/** Auto-played runs (scripts/qa-pacing.mjs): talk before the first touch, talk per touch, the play strip. */
export const pacing = [
  { name: 'canada train map', id: 'canada', hash: '#/world/canada', reset: true },
  { name: 'canada mountain bike', id: 'bike', hash: '#/world/canada/bike', reset: true },
  { name: 'canada sugar snow', id: 'taffy', hash: '#/world/canada/taffy', reset: true },
  // Campfire Night: a tap moves the flashlight there and a tap on eyes finds the animal at once,
  // so the auto-player gets through the eyes; the sounds, the trail and the marshmallow need the light held and dragged
  // (qa-motion's canada-campfire-light).
  { name: 'canada campfire night', id: 'campfire', hash: '#/world/canada/campfire', reset: true },
  // Red Canoe: the core verb is a stroke (a drag beside the canoe), so the auto-player's taps only
  // splash, poke and make trout jump; the robot run that paddles is qa-motion's canada-canoe-stroke.
  { name: 'canada red canoe', id: 'canoe', hash: '#/world/canada/canoe', reset: true },
  // Animal Bridge: a tap on the ground walks the family she leads there and a tap pokes things, so
  // the auto-player wanders the herd about; leading them over the bridge is a long drag (qa-motion's canada-bridge-lead).
  { name: 'canada animal bridge', id: 'bridge', hash: '#/world/canada/bridge', reset: true },
  // Whale Watch: a tap on the water drives the boat there, so the auto-player's taps steer it about
  // and poke the animals; holding the water and steering out to the otters and the spouts is qa-motion's canada-whales-steer.
  { name: 'canada whale watch', id: 'whales', hash: '#/world/canada/whales', reset: true },
  // Salmon Leap: a tap on a salmon makes it hop and a tap pokes things, so the auto-player hops
  // them about and pokes; flicking them up the falls is a quick drag (qa-motion's canada-salmon-flick).
  { name: 'canada salmon leap', id: 'salmon', hash: '#/world/canada/salmon', reset: true },
  // Decorate a Snowman: a tap on a tool does a short go with it by itself (a coal smile, a carrot nose,
  // a tuque on), so the auto-player decorates by tapping; dragging tools onto him is qa-motion's canada-snowman-decorate.
  { name: 'canada decorate a snowman', id: 'snowman', hash: '#/world/canada/snowman', reset: true },
]

/** Filmed moments (scripts/qa-motion.mjs): the core verbs, driven the way a child would. */
export const motion = []

// Canada's train map: the train grabbed in Quebec and pushed west hard (it chugs, puffs and whistles, the
// camera rides along), let go to roll on; then by Ottawa a tap sends the moose on the track ambling off with a snort, and
// a second tap makes it hop where it stands.
motion.push(
  {
    name: 'canada-push',
    seconds: 7,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/hub/map?at=quebec`)
      await page.waitForFunction(() => window.__canadaMapQA?.().mode, null, { timeout: 20000 })
      await page.waitForTimeout(1500)
    },
    act: async (page) => {
      const b = await page.locator('[data-anchor="train"]').boundingBox()
      if (!b) throw new Error('no train')
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
      await page.mouse.down()
      await page.mouse.move(vp.width * 0.08, b.y + b.height / 2, { steps: 25 })
      await page.waitForTimeout(2500)
      await page.mouse.up()
    },
  },
  {
    name: 'canada-moose',
    seconds: 8,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/hub/map?at=ottawa`)
      await page.waitForFunction(() => window.__canadaMapQA?.().mode, null, { timeout: 20000 })
      await page.waitForTimeout(1500)
    },
    act: async (page) => {
      await page.locator('[data-anchor="animal:moose"]').click({ force: true })
      await page.waitForTimeout(400)
      await page.locator('[data-anchor="animal:moose"]').click({ force: true })
    },
  },
)

// Sugar Snow: her finger tips the pot and pours a wave of syrup across the snow (thin where she moves,
// a puddle where she stops), it steams and sets, then the stick rolls it back up into a lollipop that flies to Maple.
motion.push({
  name: 'canada-taffy-pour',
  seconds: 9,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/canada/taffy/pour`)
    await page.waitForFunction(() => window.__canadaTaffyQA?.().section, null, { timeout: 20000 })
    await page.waitForTimeout(600)
  },
  act: async (page) => {
    const snow = (fx, fy) =>
      page.evaluate(([fx, fy]) => {
        const svg = document.querySelector('svg[aria-label="Pour maple syrup on the snow"]')
        const wide = svg.clientWidth / svg.clientHeight >= 1.05
        const s = wide ? { x: 330, y: 270, w: 940, h: 630 } : { x: 85, y: 440, w: 830, h: 730 }
        const p = new DOMPoint(s.x + s.w * fx, s.y + s.h * fy).matrixTransform(svg.getScreenCTM())
        return [p.x, p.y]
      }, [fx, fy])
    const wave = Array.from({ length: 24 }, (_, i) => [0.2 + (0.6 * i) / 23, 0.5 + 0.2 * Math.sin((i / 23) * Math.PI * 2)])
    await page.mouse.move(...(await snow(...wave[0])))
    await page.mouse.down()
    for (const p of wave) {
      await page.mouse.move(...(await snow(...p)), { steps: 3 })
      await page.waitForTimeout(40)
    }
    await page.waitForTimeout(900)
    await page.mouse.up()
    await page.waitForTimeout(2800)
    await page.mouse.move(...(await snow(...wave[0])))
    await page.mouse.down()
    for (const p of wave) await page.mouse.move(...(await snow(...p)), { steps: 3 })
    await page.mouse.up()
  },
})

// Campfire Night: her finger sweeps the flashlight across the dark campsite from the lake to the tent and
// back up into the trees, resting on whatever eyes it finds (they come out), then up into the sky (stars come out).
motion.push({
  name: 'canada-campfire-light',
  seconds: 9,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/canada/campfire/eyes`)
    await page.waitForFunction(() => window.__canadaCampfireQA?.().section, null, { timeout: 20000 })
    await page.waitForTimeout(600)
  },
  act: async (page) => {
    const at = (x, y) =>
      page.evaluate(([x, y]) => {
        const svg = document.querySelector('[aria-label="Shine the flashlight around the campsite"] svg')
        const wide = svg.clientWidth / svg.clientHeight >= 1.05
        const s = wide ? { w: 1600, h: 1000 } : { w: 1000, h: 1500 }
        const p = new DOMPoint(s.w * x, s.h * y).matrixTransform(svg.getScreenCTM())
        return [p.x, p.y]
      }, [x, y])
    const sweep = [[0.15, 0.85], [0.3, 0.75], [0.5, 0.65], [0.7, 0.62], [0.85, 0.7], [0.7, 0.45], [0.45, 0.35], [0.25, 0.4], [0.4, 0.2], [0.7, 0.15]]
    await page.mouse.move(...(await at(...sweep[0])))
    await page.mouse.down()
    for (const p of sweep) {
      await page.mouse.move(...(await at(...p)), { steps: 6 })
      await page.waitForTimeout(500)
    }
    await page.mouse.up()
  },
})

// Animal Bridge: her finger on mama elk, up the forest bank to the bridge, over it while the cars zoom
// under, and down into the meadow; the calves follow in a wobbly line (and munch when they get there).
motion.push({
  name: 'canada-bridge-lead',
  seconds: 9,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/canada/bridge/elk`)
    await page.waitForFunction(() => window.__canadaBridgeQA?.().section, null, { timeout: 20000 })
    await page.waitForTimeout(600)
  },
  act: async (page) => {
    const q = await page.evaluate(() => window.__canadaBridgeQA())
    const way = [{ x: q.bridge.left.x - 40, y: q.bridge.left.y + 40 }, q.bridge.left, q.bridge.middle, q.bridge.right, q.meadow]
    await page.mouse.move(q.fams.elk.x, q.fams.elk.y)
    await page.mouse.down()
    for (const p of way) {
      await page.mouse.move(p.x, p.y, { steps: 18 })
      await page.waitForTimeout(350)
    }
    await page.waitForTimeout(1200)
    await page.mouse.up()
  },
})

// Whale Watch: her finger held on the water out ahead and to the left of the boat out at sea (it speeds up
// and swoops round, hopping off the waves), then swung across to the right (it turns back), then let go (it coasts).
motion.push({
  name: 'canada-whales-steer',
  seconds: 9,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/canada/whales/spouts`)
    await page.waitForFunction(() => window.__canadaWhalesQA?.().section, null, { timeout: 20000 })
    await page.waitForTimeout(1500)
  },
  act: async (page) => {
    const { boat } = await page.evaluate(() => window.__canadaWhalesQA())
    const up = Math.min(boat.y - vp.height * 0.2, vp.height * 0.4)
    await page.mouse.move(boat.x - vp.width * 0.18, boat.y - up)
    await page.mouse.down()
    await page.waitForTimeout(2600)
    await page.mouse.move(boat.x + vp.width * 0.25, boat.y - up, { steps: 14 })
    await page.waitForTimeout(2600)
    await page.mouse.up()
  },
})

// Salmon Leap: in the bears' falls, the waiting salmon flicked up one pool at a time: the leap, the splash
// and the happy wiggle, a bear lunging and the boop on its nose.
motion.push({
  name: 'canada-salmon-flick',
  seconds: 9,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/canada/salmon/bears`)
    await page.waitForFunction(() => window.__canadaSalmonQA?.().section, null, { timeout: 20000 })
    await page.waitForTimeout(600)
  },
  act: async (page) => {
    for (let i = 0; i < 6; i++) {
      const q = await page.evaluate(() => window.__canadaSalmonQA())
      if (!q.waiting) break
      await page.mouse.move(q.waiting.x, q.waiting.y)
      await page.mouse.down()
      await page.waitForTimeout(60)
      await page.mouse.move(q.waiting.x + 70, q.waiting.y - 100, { steps: 5 })
      await page.mouse.up()
      await page.waitForTimeout(1300)
    }
  },
})

// Mountain Bike: Maple riding the blue way's berms with the wheel under her finger, pushed right up the
// berm and held, then let go: she leans into the bends, bumps over the roots and drifts back to the middle of her way.
motion.push({
  name: 'canada-bike-steer',
  seconds: 9,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/canada/bike/berms?trail=blue`)
    await page.waitForFunction(() => window.__canadaBikeQA?.().mode, null, { timeout: 20000 })
    await page.waitForTimeout(1200)
  },
  act: async (page) => {
    const x = vp.width / 2
    const y = vp.height * 0.7
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x + Math.min(110, vp.width * 0.12), y, { steps: 8 })
    await page.waitForTimeout(2500)
    await page.mouse.move(x - Math.min(60, vp.width * 0.07), y, { steps: 8 })
    await page.waitForTimeout(1500)
    await page.mouse.up()
  },
})

// Red Canoe: long paddle strokes from the dock, alternating left and right of the canoe (it glides off,
// zigzagging gently), then two on the left only (it turns right) and the blade held still on the right (it brakes and
// turns that way).
motion.push({
  name: 'canada-canoe-stroke',
  seconds: 10,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/canada/canoe/glide`)
    await page.waitForFunction(() => window.__canadaCanoeQA?.().section, null, { timeout: 20000 })
    await page.waitForTimeout(3500)
  },
  act: async (page) => {
    const reach = Math.min(130, vp.width * 0.14)
    for (const side of [-1, 1, -1, 1, -1, -1]) {
      const { canoe } = await page.evaluate(() => window.__canadaCanoeQA())
      await page.mouse.move(canoe.x + side * reach, canoe.y - reach * 0.8)
      await page.mouse.down()
      await page.mouse.move(canoe.x + side * reach, canoe.y + reach, { steps: 12 })
      await page.mouse.up()
      await page.waitForTimeout(350)
    }
    const { canoe } = await page.evaluate(() => window.__canadaCanoeQA())
    await page.mouse.move(canoe.x + reach, canoe.y)
    await page.mouse.down()
    await page.mouse.move(canoe.x + reach, canoe.y + 20, { steps: 3 })
    await page.waitForTimeout(1500)
    await page.mouse.up()
  },
})

// Decorate a Snowman: coal dragged into a smile on his head, a carrot let go on his face, the snow paint swept
// across his middle, and a tuque dropped on him (it hops onto his head).
motion.push({
  name: 'canada-snowman-decorate',
  seconds: 12,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/canada/snowman/dress`)
    await page.waitForFunction(() => window.__canadaSnowmanQA?.().man, null, { timeout: 20000 })
    await page.waitForTimeout(1500)
  },
  act: async (page) => {
    const drag = async (tool, path) => {
      const q = await page.evaluate(() => window.__canadaSnowmanQA())
      const from = q.tools[tool]
      if (!from) return
      await page.mouse.move(from.x, from.y)
      await page.mouse.down()
      for (const [x, y] of path(q.man)) await page.mouse.move(x, y + 30, { steps: 10 })
      await page.waitForTimeout(250)
      await page.mouse.up()
      await page.waitForTimeout(400)
    }
    const r = Math.min(70, vp.width * 0.05)
    await drag('coal', (m) => [[m.head.x - r, m.head.y + r * 0.2], [m.head.x, m.head.y + r * 0.6], [m.head.x + r, m.head.y + r * 0.2]])
    await drag('carrot', (m) => [[m.head.x, m.head.y]])
    await drag('paint', (m) => [[m.middle.x - r * 1.5, m.middle.y], [m.middle.x + r * 1.5, m.middle.y], [m.bottom.x - r * 2, m.bottom.y]])
    await drag('tuque', (m) => [[m.middle.x, m.middle.y]])
  },
})

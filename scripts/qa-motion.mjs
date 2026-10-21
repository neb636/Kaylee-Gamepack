// Motion QA: films puppet actions and a few in-game moments (rapid timed screenshots, ~15-18 fps), then turns each
// into a filmstrip (12 frames in a grid, each stamped with its time) and a GIF, so a reviewer can judge animation
// (anticipation, squash and stretch, follow-through, blinking) from still images.
//
//   npm run build && node scripts/qa-motion.mjs [--chromium] [--only=pip-hop,koko-chew] [--viewport=ipad-landscape]
//
// Writes qa-output/motion/<scenario>.png (filmstrip), <scenario>.gif (if ffmpeg is installed) and motion/report.txt.
// Puppets come from the lab (#/world/puppets/<id>) and are driven with window.__puppets[id].play(action).
// Mouths moving with speech can't be filmed here: automated browsers skip the audio (check lip sync by ear on a device).
import { spawnSync } from 'node:child_process'
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { browserName, device, filmstrip, flag, launch, openApp, out, serve, skip, VIEWPORTS } from './qa-lib.mjs'

const dir = path.join(out, 'motion')
const vp = VIEWPORTS.find((v) => v.name === (flag('viewport') ?? 'ipad-landscape')) ?? VIEWPORTS[1]
const PORT = 4183

// Puppet scenarios: [puppet id, action, seconds to film]. Missing puppets/actions are skipped, not failures.
const PUPPET_SCENARIOS = [
  ['nino', 'hop', 1.0],
  ['nino', 'bray', 1.4],
  ['nino', 'kick', 1.0],
  ['nino', 'sneeze', 1.2],
  ['nino-cold', 'shake', 1.0],
  ['pip', 'hop', 1.2],
  ['pip', 'cheer', 1.4],
  ['pip', 'shake', 1.1],
  ['mama', 'hop', 1.3],
  ['koko', 'chew', 1.2],
  ['koko', 'yuck', 1.1],
  ['koko', 'yawn', 1.8],
  ['chompy', 'snap', 1.1],
  ['chompy', 'gulp', 1.1],
  ['chompy', 'swim', 2.2],
  ['chompy', 'cheer', 1.2],
  ['sparkle', 'cheer', 1.4],
  ['sparkle', 'wave', 1.4],
  ['doudou', 'hop', 1.0],
  ['doudou', 'run', 1.1],
  ['doudou', 'pour', 1.8],
  ['cheffu', 'knead', 1.8],
  ['cheffu', 'laugh', 1.8],
  ['cheffu', 'aiyo', 1.7],
  ['houhou', 'cheer', 1.3],
  ['houhou', 'hop', 0.9],
  ['houhou', 'shake', 1.1],
  ['houhou', 'oops', 1.4],
  ['houhou', 'run', 1.0],
  ['houhou', 'point', 1.3],
  ['houhou', 'swing', 1.4],
  ['houhou', 'giggle', 1.1],
  ['dumpling', 'squish', 0.7],
  ['dumpling', 'hop', 0.9],
  ['dumpling-steaming', 'wobble', 1.1],
  ['miu', 'pounce', 1.1],
  ['miu', 'purr', 1.7],
  ['miu', 'wave', 1.3],
  ['miu-torch', 'shake', 1],
  ['jamal', 'walk', 1.2],
  ['jamal', 'chew', 1.4],
  ['jamal', 'cheer', 1.2],
  ['sphinx', 'sneeze', 1.4],
  ['sphinx-asleep', 'wake', 1.3],
  ['tutu', 'yawn', 1.9],
  ['tutu', 'wave', 1.3],
  ['tutu', 'giggle', 1.1],
  ['baobao', 'wave', 1.5],
  ['baobao', 'cheer', 1.3],
  ['baobao', 'hop', 0.9],
  ['baobao', 'nod', 0.8],
  ['baobao', 'shake', 1.0],
  ['baobao', 'wiggle', 0.9],
  ['baobao', 'munch', 1.7],
  ['baobao', 'sneeze', 1.8],
  ['baobao', 'roll', 1.6],
  ['baobao', 'climb', 1.7],
  ['baobao-bamboo', 'munch', 1.7],
  ['lupa', 'howl', 1.9],
  ['lupa', 'hop', 0.9],
  ['lupa', 'wag', 1.3],
  ['bruno', 'toss', 1.6],
  ['bruno', 'laugh', 1.6],
  ['spina', 'shake', 1.1],
  ['spina', 'puff', 1.1],
  ['cesare', 'flick', 1.1],
  ['cesare', 'bow', 1.4],
  ['civetta', 'swivel', 1.4],
  ['civetta', 'flap', 1.1],
  ['civetta', 'hoot', 1.1],
  ['gino-oar', 'cheer', 1.4],
  ['gino', 'cheer', 1.3],
  ['gino', 'bonk', 1.1],
  ['gino', 'giggle', 1.1],
  ['gino-singing', 'nod', 1.2],
  ['gino-dizzy', 'hop', 1.2],
  ['gino-accordion', 'nod', 1.6],
  ['luna', 'hop', 1.0],
  ['luna', 'giggle', 1.2],
  ['luna', 'shiver', 1.5],
  ['luna', 'lean', 1.3],
  ['luna', 'look', 1.9],
  ['luna-hat', 'cheer', 1.4],
  ['paco', 'roll', 2.0],
  ['paco', 'giggle', 1.2],
  ['abuela', 'yawn', 1.9],
  ['abuela-asleep', 'nod', 1.0],
  ['rosa', 'spout', 1.4],
  ['rosa', 'jump', 1.6],
  ['rosa', 'giggle', 1.2],
  ['rosa', 'cheer', 1.4],
].map(([id, action, seconds]) => ({
  name: `${id}-${action}`,
  seconds,
  crop: `[data-puppet="${id}"]`,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/puppets/${id}`)
    const ok = await page.waitForFunction((pid) => !!window.__puppets?.[pid], id, { timeout: 4000 }).then(() => true, () => false)
    if (!ok) return `no puppet "${id}" in the lab yet`
    await page.waitForTimeout(600)
  },
  act: (page) => page.evaluate(([pid, a]) => void window.__puppets[pid].play(a), [id, action]),
}))

// In-activity moments, driven the way a child would (tolerant: the UI changes as activities get rebuilt).
const GAME_SCENARIOS = [
  {
    name: 'outback-hop',
    seconds: 1.3,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/australia/outback/water`)
      await page.waitForTimeout(600)
    },
    act: async (page) => {
      const hop = page.getByRole('button', { name: /hop/i }).first()
      if (await hop.isVisible().catch(() => false)) await hop.click({ force: true })
      else await page.mouse.click(vp.width / 2, vp.height * 0.7)
    },
  },
  {
    name: 'forest-feed',
    seconds: 3,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/australia/forest/feed-2`)
      await page.waitForTimeout(600)
    },
    act: async (page) => {
      const leaf = page.getByRole('button', { name: /leaf/i }).first()
      const koko = page.locator('[data-dropzone="koko"], [aria-label*="Koko"]').first()
      const from = await leaf.boundingBox().catch(() => null)
      const to = await koko.boundingBox().catch(() => null)
      if (!from) throw new Error('no gum leaf button found')
      if (to) {
        // Slow drag so the koala has time to watch the leaf and open wide.
        await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
        await page.mouse.down()
        for (let i = 1; i <= 12; i++) {
          await page.mouse.move(from.x + from.width / 2 + ((to.x + to.width / 2 - from.x - from.width / 2) * i) / 12, from.y + from.height / 2 + ((to.y + to.height * 0.45 - from.y - from.height / 2) * i) / 12)
          await page.waitForTimeout(40)
        }
        await page.mouse.up()
      } else await leaf.click({ force: true })
    },
  },
  {
    name: 'croc-ride',
    seconds: 3,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/australia/croc/ride`)
      await page.waitForTimeout(600)
    },
    act: async (page) => {
      const baby = page.getByRole('button', { name: 'baby crocodile' }).first()
      const chompy = page.locator('[data-dropzone="chompy"]').first()
      const from = await baby.boundingBox().catch(() => null)
      const to = await chompy.boundingBox().catch(() => null)
      if (!from || !to) throw new Error('no baby crocodile or Chompy found')
      // Slow drag toward her snout (the right end) so her jaw has time to open wide.
      await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
      await page.mouse.down()
      for (let i = 1; i <= 14; i++) {
        await page.mouse.move(from.x + from.width / 2 + ((to.x + to.width * 0.8 - from.x - from.width / 2) * i) / 14, from.y + from.height / 2 + ((to.y + to.height * 0.45 - from.y - from.height / 2) * i) / 14)
        await page.waitForTimeout(45)
      }
      await page.mouse.up()
    },
  },
  {
    name: 'passage-walk',
    seconds: 2.5,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/egypt/passage/maze-1`)
      await page.waitForTimeout(500)
      await page.waitForTimeout(600)
    },
    act: async (page) => {
      // Drag Miu along the first tunnel and round the corner (torchlight follows her).
      const box = await page.locator('svg[viewBox="0 0 160 100"], svg[viewBox="0 0 100 160"]').first().boundingBox()
      if (!box) throw new Error('no maze found')
      const land = box.width > box.height
      const at = (x, y) => (land ? { x: box.x + (x / 160) * box.width, y: box.y + (y / 100) * box.height } : { x: box.x + (y / 100) * box.width, y: box.y + (x / 160) * box.height })
      const a = at(80, 76)
      await page.mouse.move(a.x, a.y)
      await page.mouse.down()
      await page.waitForTimeout(1100)
      const b = at(80, 30)
      await page.mouse.move(b.x, b.y)
      await page.waitForTimeout(1000)
      await page.mouse.up()
    },
  },
  {
    name: 'sphinx-rub',
    seconds: 2.5,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/egypt/sphinx/face`)
      await page.waitForTimeout(500)
      await page.waitForTimeout(600)
    },
    act: async (page) => {
      const c = await page.getByLabel('Rub the sand away').boundingBox()
      if (!c) throw new Error('no sand found')
      for (let row = 0; row < 5; row++) {
        const y = c.y + c.height * (0.18 + row * 0.08)
        await page.mouse.move(c.x + c.width * 0.22, y)
        await page.mouse.down()
        for (let k = 1; k <= 8; k++) await page.mouse.move(c.x + c.width * (0.22 + k * 0.045), y, { steps: 2 })
        await page.mouse.up()
      }
    },
  },
  {
    name: 'bamboo-grow',
    seconds: 2.2,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/china/bamboo/r1`)
      await page.waitForTimeout(1400)
    },
    act: async (page) => {
      // A real swipe up on the sprout, then a tap.
      const b = await page.getByRole('button', { name: 'bamboo shoot' }).first().boundingBox()
      const x = b.x + b.width / 2
      const y = b.y + b.height * 0.7
      await page.mouse.move(x, y)
      await page.mouse.down()
      for (let i = 1; i <= 6; i++) {
        await page.mouse.move(x, y - i * 14)
        await page.waitForTimeout(30)
      }
      await page.mouse.up()
      await page.waitForTimeout(900)
      await page.getByRole('button', { name: 'bamboo shoot' }).first().click({ force: true })
    },
  },
  {
    name: 'bamboo-payoff',
    seconds: 12,
    setup: async (page, base) => {
      // The last round (tap the shortest): bamboo 3 is the short one.
      await page.goto(`${base}#/world/china/bamboo/r3b`)
      await page.waitForTimeout(3500)
    },
    act: (page) => page.getByRole('button', { name: 'bamboo 3' }).click({ force: true }),
  },
  {
    name: 'wall-brick-snap',
    seconds: 1.6,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/china/wall/brick`)
      await page.waitForTimeout(3000)
    },
    act: async (page) => {
      // Drag the red brick into the first hole.
      const bb = await page.getByRole('button', { name: 'red brick' }).first().boundingBox()
      const hb = await page.locator('[data-target="hole"]').boundingBox()
      const from = { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 }
      const to = { x: hb.x + hb.width / 2, y: hb.y + hb.height / 2 }
      await page.mouse.move(from.x, from.y)
      await page.mouse.down()
      await page.mouse.move((from.x + to.x) / 2, (from.y + to.y) / 2, { steps: 6 })
      await page.mouse.move(to.x, to.y, { steps: 6 })
      await page.mouse.up()
    },
  },
  {
    name: 'wall-beacon',
    seconds: 12,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/china/wall/beacon`)
      await page.waitForTimeout(4500)
    },
    act: (page) => page.getByRole('button', { name: 'beacon tower' }).click({ force: true }),
  },
]

// Venice greybox: grab the gondola, pull it right (wake, tilt, the canal scrolls), then back left (the happy spin).
const veniceDrive = (name, seconds, moves) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/italy/venice/cruise`)
    await page.waitForTimeout(1400)
  },
  act: async (page) => {
    const b = await page.locator('[aria-label="gondola"]').boundingBox()
    if (!b) throw new Error('no gondola found')
    // The gondola element is its waterline anchor; grab just above it, on the hull.
    const x = b.x
    const y = b.y - 30
    await page.mouse.move(x, y)
    await page.mouse.down()
    for (const [dx, dy, ms] of moves) {
      const steps = Math.max(2, Math.round(ms / 40))
      await page.mouse.move(x + dx * vp.width, y + dy * vp.height, { steps })
      await page.waitForTimeout(ms)
    }
    await page.mouse.up()
  },
})
GAME_SCENARIOS.push(
  veniceDrive('venice-drive', 3.2, [[0.3, 0, 1200], [0.3, -0.1, 600], [-0.35, -0.1, 900]]),
  veniceDrive('venice-coast', 2.4, [[0.35, 0, 450]]),
)

// Snow on a Volcano: grab Nino and lead him up the trail (trot, the cart rattles after him), then back the other way
// (he hops round and the cart swings round behind him); and in the cold, with snow falling.
const etnaDrive = (name, seconds, jump, moves) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/italy/etna/${jump}`)
    await page.waitForTimeout(1500)
  },
  act: async (page) => {
    const b = await page.locator('[aria-label="Nino"]').boundingBox()
    if (!b) throw new Error('no Nino found')
    // The Nino element is his hooves' anchor; grab him by the body.
    const x = b.x
    const y = b.y - 60
    await page.mouse.move(x, y)
    await page.mouse.down()
    for (const [dx, dy, ms] of moves) {
      const steps = Math.max(2, Math.round(ms / 40))
      await page.mouse.move(x + dx * vp.width, y + dy * vp.height, { steps })
      await page.waitForTimeout(ms)
    }
    await page.mouse.up()
  },
})
GAME_SCENARIOS.push(
  etnaDrive('etna-trot', 3.2, 'grove', [[0.3, 0, 1200], [-0.3, 0, 1200]]),
  etnaDrive('etna-cold', 3.2, 'cold', [[0.25, 0, 900]]),
)

// Luna's Fluffy Day: rub the brush over Luna's fleece (tangles turn shiny, sparkles, things pop out), then the
// clippers (puffs snip off and float into the basket).
const fluffyRub = (name, seconds, jump) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/peru/alpaca/${jump || 'brush'}`)
    await page.waitForTimeout(600)
    await page.waitForTimeout(900)
  },
  act: async (page) => {
    const b = await page.locator('[aria-label="Luna"]').first().boundingBox()
    if (!b) throw new Error('no Luna found')
    await page.mouse.move(b.x + b.width * 0.2, b.y + b.height * 0.5)
    await page.mouse.down()
    for (let i = 0; i < 5; i++) await page.mouse.move(b.x + b.width * (i % 2 ? 0.2 : 0.75), b.y + b.height * (0.48 + i * 0.05), { steps: 10 })
    await page.mouse.up()
  },
})
GAME_SCENARIOS.push(fluffyRub('fluffy-brush', 2.4), fluffyRub('fluffy-clip', 2.6, 'clip'))

// Tika's Mountain Terraces: drag a stone off the pile into its own gap (magnetic pull, clonk, dust, shake), then one
// into a wrong gap (bonk, rolls back). `jump` starts on a later wall.
const terracesStone = (name, seconds, wrong, jump) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/peru/machu-picchu/${jump ? (jump === 'photo' ? 'photo' : `wall-${jump + 1}`) : 'wall-1'}`)
    await page.waitForTimeout(600)
    await page.waitForTimeout(1500)
  },
  act: async (page) => {
    const r = await page.evaluate((wrong) => {
      const el = document.querySelector('[data-stone]')
      if (!el) return null
      const gaps = [...document.querySelectorAll('[data-gap]')]
      const gap = gaps.find((g) => (g.dataset.gap === el.dataset.stone) !== wrong)
      if (!gap) return null
      const b = el.getBoundingClientRect()
      const t = gap.getBoundingClientRect()
      return { x: b.left + b.width / 2, y: b.top + b.height / 2, tx: t.left + t.width / 2, ty: t.top + t.height / 2 }
    }, wrong)
    if (!r) throw new Error('no stone or gap found')
    await page.mouse.move(r.x, r.y)
    await page.mouse.down()
    for (let i = 1; i <= 12; i++) {
      await page.mouse.move(r.x + ((r.tx - r.x) * i) / 12, r.y + ((r.ty - r.y) * i) / 12)
      await page.waitForTimeout(40)
    }
    await page.mouse.up()
  },
})
GAME_SCENARIOS.push(terracesStone('terraces-clonk', 2.4, false), terracesStone('terraces-bonk', 2.4, true), terracesStone('terraces-clouds', 2.4, false, 3))

// Pepa's Penguin Cliff: grab the front penguin on the launch rock, pull it back (it crouches, the dotted arc shows the
// splash spot), let go: the leap, the splash, the underwater swim. `jump` starts later (fish schools, the chicks' swim).
const penguinLaunch = (name, seconds, jump, pull) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/peru/penguins/${jump || 'splash'}`)
    await page.waitForTimeout(600)
    await page.waitForSelector('[aria-label="penguin"]', { timeout: 20000 })
    await page.waitForTimeout(jump === 'swim' ? 3200 : 900)
  },
  act: async (page) => {
    const boxes = await page.$$eval('[aria-label="penguin"], [aria-label="penguin chick"]', (els) =>
      els.filter((e) => getComputedStyle(e).display !== 'none').map((e) => {
        const r = e.getBoundingClientRect()
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
      }),
    )
    const front = boxes.sort((a, b) => b.x - a.x)[0]
    if (!front) throw new Error('no penguin found')
    await page.mouse.move(front.x, front.y)
    await page.mouse.down()
    await page.mouse.move(front.x - pull * vp.width, front.y + pull * vp.height * 0.5, { steps: 12 })
    await page.waitForTimeout(400)
    await page.mouse.up()
  },
})
GAME_SCENARIOS.push(penguinLaunch('penguin-launch', 8, null, 0.13), penguinLaunch('penguin-fish', 5, 'fish', 0.09), penguinLaunch('penguin-chick-swim', 4.5, 'swim', 0.08))

// Agong's house (Thailand, 3D): Kaylee's hop-trot across the floor, hopping up the stairs (the camera follows her to
// the other floor), and the mattress bounce getting higher until she flops down. Taps go through the house's tap
// targets ([data-anchor]), like a finger.
const thaiHouse = (name, seconds, section, taps) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/hub/${section}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiHouseQA?.().mode, null, { timeout: 20000 })
    await page.waitForTimeout(800)
  },
  act: async (page) => {
    for (const [what, wait] of taps) {
      if (what === 'floor') await page.mouse.click(vp.width * 0.42, vp.height * 0.38)
      else await page.locator(`[data-anchor="${what}"]`).click({ force: true })
      await page.waitForTimeout(wait)
    }
  },
})
GAME_SCENARIOS.push(
  thaiHouse('thai-walk', 2.6, 'downstairs', [['floor', 0]]),
  thaiHouse('thai-stairs', 6, 'downstairs?at=fridge', [['stairs-up', 0]]),
  thaiHouse('thai-bounce', 5, 'upstairs?at=mattress', [['mattress', 900], ['mattress', 1100], ['mattress', 1300]]),
)

// Thailand's boat trip (3D greybox): a finger held on the water ahead of the longtail (it surges after it, then turns
// when the finger moves right, the wake and spray streaming), a VROOM tap, a finger held far to one side (doughnuts),
// and the canoe paddling under the low cave roof (Daddy's horn bonks first, then Mommy's, then Kaylee's).
const thaiBoat = (name, seconds, section, steps) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/boat-trip/${section}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiBoatQA?.().mode, null, { timeout: 20000 })
    await page.waitForTimeout(800)
  },
  act: async (page) => {
    for (const [what, dx, dy, ms] of steps) {
      const b = await page.locator('[data-anchor="boat"]').boundingBox()
      if (!b) throw new Error('no boat found')
      if (what === 'vroom') await page.locator('[data-anchor="boat"]').click({ force: true })
      else {
        // The finger: dx across the screen from the middle, dy up from the boat (fractions of the screen).
        await page.mouse.move(vp.width * (0.5 + dx), b.y + b.height / 2 - dy * vp.height, { steps: 4 })
        if (what === 'down') await page.mouse.down()
      }
      await page.waitForTimeout(ms)
    }
    await page.mouse.up()
  },
})
GAME_SCENARIOS.push(
  thaiBoat('boat-drive', 5, 'bay', [['down', 0, 0.28, 2600], ['move', 0.3, 0.2, 2200]]),
  thaiBoat('boat-vroom', 3, 'bay', [['vroom', 0, 0, 2800]]),
  thaiBoat('boat-doughnut', 5, 'bay', [['down', 0.45, 0.05, 4800]]),
  thaiBoat('boat-cave-roof', 8, 'cave', [['down', 0, 0.25, 7800]]),
)

// The bay's stops, one scenario per verb: ribbons fluttering through the air onto the prow (then the garland, and the
// family stepping in), the bumper-boat football (the boat pushes the ball back to the floating field: the kick, GOAL),
// lying the family down in the canoe before the low roof, and the Nail Island pose (Kaylee strikes it, Mommy and
// Daddy copy her, the flash).
const bayMoment = (name, seconds, section, setup, act) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/boat-trip/${section}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiBoatQA?.().mode, null, { timeout: 20000 })
    await page.waitForTimeout(1200)
    if (setup) await setup(page)
  },
  act,
})
const tapAnchor = (page, id) => page.locator(`[data-anchor="${id}"]`).click({ force: true }).catch(() => {})
GAME_SCENARIOS.push(
  bayMoment('bay-ribbons', 5.5, 'pier', null, async (page) => {
    for (const id of ['ribbon:pink', 'ribbon:sky', 'ribbon:hotpink', 'garland']) {
      await tapAnchor(page, id)
      await page.waitForTimeout(800)
    }
  }),
  bayMoment(
    'bay-football',
    6,
    'village',
    async (page) => {
      // Push the ball until it's nearly back at the field.
      for (let i = 0; i < 6; i++) {
        await tapAnchor(page, 'ball')
        await page.waitForTimeout(1500)
      }
    },
    async (page) => {
      for (let i = 0; i < 3; i++) {
        await tapAnchor(page, 'ball')
        await page.waitForTimeout(1800)
      }
    },
  ),
  bayMoment('bay-lie-down', 7, 'cave', null, async (page) => {
    for (const who of ['nick', 'ji', 'kaylee']) {
      await tapAnchor(page, `family:${who}`)
      await page.waitForTimeout(300)
    }
    const b = await page.locator('[data-anchor="boat"]').boundingBox()
    if (!b) return
    await page.mouse.move(vp.width * 0.5, b.y + b.height / 2 - vp.height * 0.25)
    await page.mouse.down()
    await page.waitForTimeout(5800)
    await page.mouse.up()
  }),
  bayMoment(
    'bay-pose',
    4,
    'nail?packed=bucket',
    async (page) => {
      await tapAnchor(page, 'glow:beach')
      await page.waitForFunction(() => window.__thaiBoatQA?.().phase === 'beach', null, { timeout: 45000 }).catch(() => {})
      await page.waitForTimeout(600)
    },
    async (page) => {
      await page.getByRole('button', { name: 'Cheer pose' }).click({ force: true }).catch(() => {})
      await page.waitForTimeout(3600)
    },
  ),
)

// The boat race: the countdown with a finger down (revving, then a rocket start at GO), racing with the finger
// sweeping across the course (leaning into the turns, the rooster tail, passing), the ramp's jump and a trick (a tap in
// the air), and the podium (the trophy floating down into her hands, the kids and the macaque cheering, confetti).
const thaiRace = (name, seconds, section, wait, act) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/boat-trip/${section}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiBoatQA?.().mode, null, { timeout: 20000 })
    // (Nudging the mouse while it waits: an automated tab with no input for 30 s drops to 4 fps.)
    for (let i = 0; wait && i < 300 && !(await page.evaluate(wait)); i++) {
      await page.mouse.move(5 + (i % 3), 5)
      await page.waitForTimeout(200)
    }
  },
  act,
})
GAME_SCENARIOS.push(
  thaiRace('race-start', 6, 'race', () => window.__thaiBoatQA?.().phase === 'count', async (page) => {
    await page.mouse.move(vp.width * 0.5, vp.height * 0.45)
    await page.mouse.down()
    await page.waitForTimeout(5800)
    await page.mouse.up()
  }),
  thaiRace('race-drive', 6, 'race', () => window.__thaiBoatQA?.().phase === 'race', async (page) => {
    await page.mouse.move(vp.width * 0.3, vp.height * 0.45)
    await page.mouse.down()
    for (let i = 0; i < 6; i++) {
      await page.mouse.move(vp.width * (i % 2 ? 0.75 : 0.3), vp.height * 0.45, { steps: 6 })
      await page.waitForTimeout(950)
    }
    await page.mouse.up()
  }),
  thaiRace('race-ramp-trick', 5, 'race?lap=3', () => (window.__thaiBoatQA?.().racers?.kaylee?.s ?? 0) > 280, async (page) => {
    for (let i = 0; i < 50; i++) {
      if (await page.evaluate(() => window.__thaiBoatQA?.().airborne)) {
        await page.mouse.click(vp.width * 0.5, vp.height * 0.5)
        break
      }
      await page.waitForTimeout(100)
    }
    await page.waitForTimeout(3000)
  }),
  thaiRace('race-podium', 7, 'podium', null, async (page) => {
    await page.waitForTimeout(6800)
  }),
)

// The boat trip's way there: things hopping into the suitcase in an arc, Kaylee sitting on the too-full suitcase (squash, squash, squash, click) and her
// things going on, everyone hopping into Aunty Sri's van and it gliding off, the suitcase through the x-ray and the
// officer's stamp, the plane's takeoff (everyone presses back, then up), the tray and the call button (the flight
// attendant's trolley, snacks piling up), the air vent in her mane, and the landing (bump, bump, claps) into Krabi's
// songthaew. Taps go through the tap targets.
const thaiTrip = (name, seconds, section, taps, wait = 1400) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/boat-trip/${section}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiBoatQA?.().mode, null, { timeout: 20000 })
    await page.waitForTimeout(wait)
  },
  act: async (page) => {
    for (const [what, ms] of taps) {
      await page.locator(`[data-anchor="${what}"]`).click({ force: true }).catch(() => {})
      await page.waitForTimeout(ms)
    }
  },
})
GAME_SCENARIOS.push(
  thaiTrip('trip-toss', 3.4, 'pack', [['trip:item:sunhat', 500], ['trip:item:duck', 500], ['trip:item:floaties', 500], ['trip:item:duck', 900]]),
  thaiTrip('trip-sit', 7, 'pack?packed=sunhat,sunglasses,floaties,duck,teddy,camera', [['trip:suitcase', 2600], ['trip:suitcase', 800], ['trip:suitcase', 3000]]),
  thaiTrip('trip-van', 5, 'goodbye', [['trip:van', 4500]], 3800),
  thaiTrip('trip-xray', 8, 'airport?packed=gan,fan,mango', [['suitcase', 7800]]),
  thaiTrip('trip-takeoff', 10, 'takeoff', [['belt', 9500]]),
  thaiTrip('trip-tray', 5, 'fly', [['tray', 700], ['call', 400], ['call', 3500]], 2000),
  thaiTrip('trip-vent', 3, 'fly?packed=sunhat', [['vent', 2800]], 2000),
  thaiTrip('trip-land', 9, 'land', [], 8000),
)

// HarborLand (the mall trip, greybox 1): climbing the Golden Mountain (three hops), the Boomerang Donut swinging, down
// the twin-dragon spiral into the balls (from the tower's deck, after walking the skywalk), the zip line, and the cannon
// at Daddy (bonk, topple, the ball on his horn). Taps go through the tap targets, or a point on the screen.
const thaiMall = (name, seconds, section, steps) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/mall-trip/${section}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiMallQA?.().mode, null, { timeout: 20000 })
    await page.waitForTimeout(1200)
  },
  act: async (page) => {
    for (const [what, ms, fx, fy] of steps) {
      if (what === 'point') await page.mouse.click(vp.width * fx, vp.height * fy)
      else await page.locator(`[data-anchor="${what}"]`).click({ force: true }).catch(() => {})
      await page.waitForTimeout(ms)
    }
  },
})
GAME_SCENARIOS.push(
  // The hall: walking to the cafe's door and going in (the door swings, the camera moves in), the barber's door
  // puffing out hair, and Little Land's bricks tumbling and hopping home.
  thaiMall('hall-go-in', 5, 'hall?from=vet', [['door:cafe', 4800]]),
  thaiMall('hall-barber', 3, 'hall?from=barber', [['door:barber', 2800]]),
  thaiMall('hall-bricks', 14, 'hall?from=race', [['point', 3500, 0.97, 0.88], ['point', 3500, 0.97, 0.88], ['blocks', 6500]]),
  thaiMall('mall-mountain', 4, 'play', [['climb:mountain', 3800]]),
  thaiMall('mall-donut', 7, 'mountain', [['ride:donut', 6800]]),
  thaiMall('mall-dragon', 9, 'dragon', [['point', 4200, 0.15, 0.47], ['ride:dragon', 4600]]),
  thaiMall('mall-zip', 6, 'mountain?rides=mountain', [['point', 3600, 0.9, 0.66], ['ride:zip', 2300]]),
  thaiMall('mall-cannon', 6, 'play', [['cannon', 2700], ['cannon', 1400], ['cannon', 1700]]),
)

// The Vet Clinic (mall trip, greybox): her finger drags a tool from the tray onto the patient and works it there, the
// core verb. The bandage wound round the puppy's sore paw, the thorn pulled out, the soap rubbed into the muddy pony,
// and the elephant's sneeze. Where things are comes from window.__thaiMallQA (its zones and tools, in screen pixels).
const thaiVet = (name, seconds, patient, strokes) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/mall-trip/vet?patient=${patient}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiMallQA?.().phase === 'exam', null, { timeout: 20000 })
    await page.waitForTimeout(400)
  },
  act: async (page) => {
    for (const [tool, zone, how, after = 300] of strokes) {
      const q = await page.evaluate(() => window.__thaiMallQA())
      const [zx, zy] = [q.zones[zone][0], q.zones[zone][1] + q.liftPx]
      await page.mouse.move(...q.tools[tool])
      await page.mouse.down()
      await page.mouse.move(zx, zy, { steps: 14 })
      if (how === 'pull') {
        await page.waitForTimeout(300)
        await page.mouse.move(zx + 130, zy - 110, { steps: 10 })
      } else for (let i = 0; i < 36; i++) {
        const a = i * (how === 'circle' ? 0.45 : 0.9)
        await page.mouse.move(zx + Math.cos(a) * 26, zy + Math.sin(a) * (how === 'circle' ? 26 : 14), { steps: 3 })
      }
      await page.mouse.up()
      await page.waitForTimeout(after)
    }
  },
})
GAME_SCENARIOS.push(
  thaiVet('vet-thorn-bandage', 6, 'puppy', [['tweezers', 'paw', 'pull', 600], ['bandage-pink', 'paw', 'circle']]),
  thaiVet('vet-soap', 4, 'pony', [['soap', 'belly', 'rub']]),
  thaiVet('vet-sneeze', 7, 'elephant', [['soap', 'belly', 'rub'], ['soap', 'head', 'rub', 2600]]),
)

// Cafe & Cake (mall trip, greybox): the blender, its core verb. Her finger drags the strawberry and the banana into the
// jar, presses the big button (the colors swirl into pink), then lifts the jar to the cup: it tips as it gets there
// and pours. Where things are comes from window.__thaiMallQA (the tray, the jar's mouth, where to hold it to pour).
GAME_SCENARIOS.push({
  name: 'cafe-blend-pour',
  seconds: 9,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/mall-trip/cafe?round=2`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiMallQA?.().game === 'cafe', null, { timeout: 20000 })
    await page.waitForTimeout(400)
  },
  act: async (page) => {
    const q = () => page.evaluate(() => window.__thaiMallQA())
    for (const fruit of ['strawberry', 'banana']) {
      const s = await q()
      await page.mouse.move(...s.items[fruit])
      await page.mouse.down()
      await page.mouse.move(s.mouth[0], s.mouth[1] + s.liftPx, { steps: 14 })
      await page.mouse.up()
      await page.waitForTimeout(350)
    }
    await page.locator('[data-anchor="button"]').click({ force: true })
    await page.waitForTimeout(2100)
    const s = await q()
    await page.mouse.move(...s.jarAt)
    await page.mouse.down()
    await page.mouse.move(...s.pourAt[0], { steps: 18 })
    for (let i = 0; i < 10; i++) await page.mouse.move(s.pourAt[0][0] + (i % 2) * 4, s.pourAt[0][1], { steps: 2 })
    await page.waitForTimeout(1200)
    await page.mouse.up()
  },
})

// The Racing Slide (mall trip, greybox): the core verb, scooting down a lane. Setup climbs the steps (taps on the
// steps' tap target) and waits for the 3-2-1; the act taps Kaylee: steadily (`every` ms, round 1's scoots) or just as a
// bump's ring closes on her (round 2's flights; round 3 in the spinning rings), until she's in the balls (Daddy head
// first). Where she is comes from window.__thaiMallQA (screen pixels).
const thaiSlide = (name, seconds, round, every) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/mall-trip/race?round=${round}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiMallQA?.().phase === 'climb', null, { timeout: 20000 })
    for (let i = 0; i < 60; i++) {
      const q = await page.evaluate(() => window.__thaiMallQA())
      if (q.phase === 'race') break
      if (q.phase === 'climb') await page.locator('[data-anchor="steps"]').click({ force: true }).catch(() => {})
      await page.waitForTimeout(400)
    }
  },
  act: async (page) => {
    const t0 = Date.now()
    let last = 0
    while (Date.now() - t0 < seconds * 1000) {
      const q = await page.evaluate(() => window.__thaiMallQA())
      if (q.phase === 'race' && q.kaylee && (every ? Date.now() - last > every : q.window && Date.now() - last > 500)) {
        await page.mouse.click(...q.kaylee)
        last = Date.now()
      }
      await page.waitForTimeout(40)
    }
  },
})
GAME_SCENARIOS.push(thaiSlide('mall-race-scoot', 8, 1, 330), thaiSlide('mall-race-bump', 9, 2, 0), thaiSlide('mall-race-rings', 9, 3, 0))

// The Pizza Company (mall trip, greybox): her finger pulls a slice out of the pan and the cheese stretches, wobbles as
// she swings it, and snaps; she lets go over a plate. Hawaiian snaps early, Double Cheese stretches longest, and in the
// tug (after one each) Daddy grabs the other end. Where things are comes from window.__thaiMallQA (screen pixels).
const thaiPizza = (name, seconds, link, to, opts = {}) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/mall-trip/share?${link}`)
    await page.waitForFunction(() => window.__thaiMallQA?.().pan?.length, null, { timeout: 20000 })
    await page.waitForTimeout(400)
  },
  act: async (page) => {
    const q = await page.evaluate(() => window.__thaiMallQA())
    const [sx, sy] = q.pan[0]
    const [px, py] = q.plates[to]
    await page.mouse.move(sx, sy)
    await page.mouse.down()
    await page.mouse.move(sx, sy - 90, { steps: 10 })
    if (opts.tug) await page.waitForTimeout(800)
    // Swing it side to side on the way (the cheese wobbles), then over the plate.
    for (let i = 0; i < 3; i++) await page.mouse.move(sx + (i % 2 ? -60 : 60), sy - 110, { steps: 6 })
    await page.mouse.move(px, py + 40, { steps: 16 })
    await page.waitForTimeout(250)
    await page.mouse.up()
    await page.waitForTimeout(900)
  },
})
GAME_SCENARIOS.push(
  thaiPizza('pizza-pull-cheese', 5, 'pizza=cheese', 'nick'),
  thaiPizza('pizza-pull-hawaiian', 5, 'pizza=hawaiian', 'ji'),
  thaiPizza('pizza-tug', 6, 'pizza=cheese&shared=3', 'ji', { tug: true }),
)

// Kaylee's boat trip photo on Agong's wall, as if she had finished a trip (a drawn stand-in: pink sky, the nail, three
// friends), for the photo wall's screens. Runs in the page.
function seedWallInPage() {
  const c = document.createElement('canvas')
  c.width = 320
  c.height = 240
  const g = c.getContext('2d')
  const sky = g.createLinearGradient(0, 0, 0, 240)
  sky.addColorStop(0, '#A98FE8')
  sky.addColorStop(0.6, '#FF9DC0')
  sky.addColorStop(1, '#5FC7B4')
  g.fillStyle = sky
  g.fillRect(0, 0, 320, 240)
  g.fillStyle = '#8A7FA8'
  g.fillRect(150, 60, 26, 130)
  g.fillStyle = '#FF8FB8'
  for (const x of [90, 220, 250]) {
    g.beginPath()
    g.arc(x, 180, 22, 0, 7)
    g.fill()
  }
  localStorage.setItem('kaylee-gamepack:/:saved:thailand-photo-wall', JSON.stringify([{ trip: 'boat-trip', src: c.toDataURL('image/jpeg', 0.8), at: '2026-10-20' }]))
}

// Coming home (step 5): the flight home (the plane over the pink sunset), and Agong taking the photo, holding it up and
// walking in to hang it on his wall; then everyone gathering and the cousins putting their phones down. A home link
// first builds the bay to take its photo, so the setup waits for each moment.
const thaiHome = (name, seconds, until, act) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/boat-trip/home`)
    await page.waitForFunction(() => window.__thaiBoatQA?.().trip === 'flight', null, { timeout: 120000 })
    if (until === 'flight') return
    await page.mouse.click(200, 400)
    await page.waitForFunction(() => window.__thaiBoatQA?.().trip === 'pick', null, { timeout: 60000 })
    await page.getByRole('button', { name: /^Photo: / }).first().click({ force: true })
    await page.waitForFunction(() => window.__thaiBoatQA?.().trip === 'give', null, { timeout: 20000 })
    await page.waitForTimeout(1200)
    if (until === 'give') return
    await page.locator('[data-anchor="family:agong"]').click({ force: true })
    await page.waitForFunction(() => window.__thaiBoatQA?.().trip === 'gather', null, { timeout: 60000 })
  },
  act,
})
GAME_SCENARIOS.push(
  thaiHome('trip-flight-home', 4, 'flight', async (page) => page.waitForTimeout(3800)),
  thaiHome('trip-give-agong', 9, 'give', async (page) => {
    await page.locator('[data-anchor="family:agong"]').click({ force: true })
    await page.waitForTimeout(8800)
  }),
  // Everyone hops in; once the cousins glow she taps Ken, and he puts his phone down ("Whoa! Cool!").
  thaiHome('trip-cousins-look-up', 9, 'gather', async (page) => {
    await page.waitForTimeout(3000)
    await page.locator('[data-anchor="family:ken"]').click({ force: true }).catch(() => {})
    await page.waitForTimeout(5800)
  }),
  { ...thaiTrip('trip-replay-pass', 2, 'invite?replay=1', [], 3800), act: async (page) => {
    await page.getByRole('button', { name: 'Yes', exact: true }).dispatchEvent('click').catch(() => {})
    await page.waitForTimeout(1900)
  } },
)
// The photo wall in the house: tap Kaylee's trip photo and it swings on its nail and comes close.
GAME_SCENARIOS.push({
  name: 'photo-wall',
  seconds: 2,
  setup: async (page, base) => {
    await page.evaluate(seedWallInPage)
    await page.goto(`${base}#/world/thailand/hub/downstairs?at=photos`)
    await page.waitForFunction(() => window.__thaiHouseQA?.().mode, null, { timeout: 20000 })
    await page.waitForTimeout(2000)
  },
  act: async (page) => {
    await page.locator('[data-anchor="trip:wall:boat-trip"]').click({ force: true }).catch(() => {})
    await page.waitForTimeout(1900)
  },
})

// Coco's Canyon Glide: hold a finger in the sky and Coco banks after it, sinking slowly in plain air; steer him into a
// swirl of warm air and he circles up (wings up, fingers spread); pull down for a dive (wings fold) and a swoop.
const canyonFly = (name, seconds, jump, path) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/peru/condor/${jump || 'start'}`)
    await page.waitForTimeout(600)
    await page.waitForTimeout(900)
  },
  act: async (page) => {
    const vp = page.viewportSize()
    // `path`: world targets [x, y, ms]; the finger sits where that point is on screen (clamped to the screen).
    let down = false
    for (const [x, y, ms] of path) {
      const end = Date.now() + ms
      while (Date.now() < end) {
        const w = await page.evaluate(() => window.__canyonQA?.where())
        if (!w) break
        const sx = Math.min(vp.width - 20, Math.max(20, (x - w.cam.x) * w.s))
        const sy = Math.min(vp.height - 20, Math.max(140, (y - w.cam.y) * w.s))
        if (!down) {
          await page.mouse.move(sx, sy)
          await page.mouse.down()
          down = true
        } else await page.mouse.move(sx, sy)
        await page.waitForTimeout(100)
      }
    }
    await page.mouse.up()
  },
})
GAME_SCENARIOS.push(
  canyonFly('canyon-ride', 4, null, [[1340, 1800, 1500], [1340, 900, 2500]]),
  canyonFly('canyon-dive', 3.2, 'follow', [[1700, 2600, 2000], [2000, 2100, 1200]]),
)

// Rosa's Rainy River: grab the cloud and squeeze it (it squishes and rains), wiggle it over the river (harder rain, a
// rumble), then a lily bud unrolling in the lagoon's rain.
const riverSqueeze = (name, seconds, jump) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/peru/river/${jump || 'forest'}`)
    await page.waitForTimeout(600)
    await page.waitForTimeout(jump ? 3200 : 900)
  },
  act: async (page) => {
    const b = await page.locator('[aria-label="rain cloud"]').first().boundingBox()
    if (!b) throw new Error('no cloud found')
    const x = b.x + b.width / 2
    const y = b.y + b.height / 2
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.waitForTimeout(700)
    for (let i = 0; i < 6; i++) await page.mouse.move(x + (i % 2 ? 60 : -60) + i * 12, y + (i % 2 ? 10 : -10), { steps: 6 })
    await page.waitForTimeout(600)
    await page.mouse.up()
  },
})
GAME_SCENARIOS.push(riverSqueeze('river-squeeze', 3.2), riverSqueeze('river-lagoon-rain', 3.2, 'lagoon'))

// Opera greybox: swing the conductor's wand (big swings bounce the band high, little ones sway), then stop (freeze).
const operaSwing = (name, seconds, size, ms) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/italy/party`)
    await page.waitForTimeout(600)
    await skip(page)
    await page.waitForTimeout(400)
  },
  act: async (page) => {
    const x = vp.width * 0.5
    const y = vp.height * 0.4
    await page.mouse.move(x, y)
    await page.mouse.down()
    for (let i = 0; i < 6; i++) {
      await page.mouse.move(x + (i % 2 ? -1 : 1) * size * vp.width, y + 10, { steps: 8 })
      await page.waitForTimeout(ms)
    }
    await page.mouse.up()
  },
})
GAME_SCENARIOS.push(operaSwing('opera-forte', 3.4, 0.35, 280), operaSwing('opera-piano', 3.4, 0.05, 280))

// --only=venice-drive,etna: exact scenario names, or a prefix for all of them (etna-*).
const all = [...PUPPET_SCENARIOS, ...GAME_SCENARIOS].filter((s) => !flag('only') || flag('only').split(',').some((o) => s.name === o || s.name.startsWith(`${o}-`)))

const ffmpeg = (a) => spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...a], { encoding: 'utf8' })
const hasFfmpeg = !ffmpeg(['-version']).error

/** Screenshot `clip` as fast as possible while `act` runs, for `seconds`. Returns [{ t, buf }]. */
async function film(page, clip, seconds, act) {
  const frames = []
  const t0 = Date.now()
  const acting = act().catch((e) => e)
  while (Date.now() - t0 < seconds * 1000) {
    const t = (Date.now() - t0) / 1000
    frames.push({ t, buf: await page.screenshot({ clip, type: 'jpeg', quality: 85, scale: 'css' }) })
  }
  const err = await acting
  if (err instanceof Error) throw err
  return frames
}

async function gif(frames, file) {
  if (!hasFfmpeg) return
  const tmp = `${file}.frames`
  mkdirSync(tmp, { recursive: true })
  await Promise.all(frames.map((f, i) => sharp(f.buf).resize(360).jpeg().toFile(path.join(tmp, `${String(i).padStart(4, '0')}.jpg`))))
  const fps = (frames.length / (frames.at(-1).t - frames[0].t || 1)).toFixed(2)
  ffmpeg(['-framerate', fps, '-i', path.join(tmp, '%04d.jpg'), '-vf', 'split[a][b];[a]palettegen[p];[b][p]paletteuse', '-loop', '0', file])
  rmSync(tmp, { recursive: true, force: true })
}

mkdirSync(dir, { recursive: true })
// A full run starts clean; --only reruns just replace their own files.
for (const f of readdirSync(dir)) if (!flag('only') || all.some((s) => f.startsWith(`${s.name}.`))) rmSync(path.join(dir, f), { recursive: true, force: true })
const report = []
const { base, stop } = await serve(PORT)
try {
  const browser = await launch()
  for (const s of all) {
    const context = await device(browser, vp, { deviceScaleFactor: 1 })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    let status = 'ok'
    try {
      await openApp(page, base)
      const why = await s.setup(page, base)
      if (why) status = `skipped: ${why}`
      else {
        const box = s.crop ? await page.locator(s.crop).first().boundingBox() : null
        // Puppet cards get extra room above, so hops and cheers aren't cut off at the top of the card.
        const top = box ? Math.max(0, box.y - box.height * 0.4) : 0
        const clip = box ? { x: Math.max(0, box.x), y: top, width: Math.min(box.width, vp.width - box.x), height: Math.min(box.y + box.height, vp.height) - top } : { x: 0, y: 0, width: vp.width, height: vp.height }
        const frames = await film(page, clip, s.seconds + 0.2, () => page.waitForTimeout(150).then(() => s.act(page)))
        await filmstrip(frames, path.join(dir, `${s.name}.png`))
        await gif(frames, path.join(dir, `${s.name}.gif`))
        status = `ok (${frames.length} frames, ${(frames.length / (s.seconds + 0.2)).toFixed(0)} fps)`
      }
    } catch (e) {
      status = `failed: ${e.message.split('\n')[0]}`
    }
    await context.close()
    if (errors.length) status += ` (page errors: ${errors.slice(0, 2).join(' | ')})`
    report.push(`${s.name}: ${status}`)
    console.log(`${s.name}: ${status}`)
  }
  await browser.close()
} finally {
  stop()
}
writeFileSync(path.join(dir, 'report.txt'), `Motion QA (${browserName}, ${vp.name} ${vp.width}x${vp.height}). Filmstrip frames are stamped with seconds since filming began; the action starts at ~0.15s.\n${report.join('\n')}\n`)
console.log(`Filmstrips in ${path.relative(process.cwd(), dir)}/ (report.txt lists skipped/failed scenarios)`)

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
// A thing dropped where it doesn't belong (a shoe on her head, paint on the mirror): silly, never wrong. The drag goes
// from the thing's tap target to a point on the screen (fractions of the viewport).
const thaiDrop = (name, seconds, drawer, thing, to) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/hub/wardrobe?drawer=${drawer}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiHouseQA?.().wardrobe, null, { timeout: 20000 })
    await page.waitForTimeout(1200)
  },
  act: async (page) => {
    const box = await page.locator(`[data-anchor="trip:ward:thing:${thing}"]`).boundingBox()
    const [x, y] = [box.x + box.width / 2, box.y + box.height / 2]
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x + 6, y + 6, { steps: 2 })
    await page.mouse.move(vp.width * to[0], vp.height * to[1], { steps: 10 })
    await page.mouse.up()
    await page.waitForTimeout(seconds * 1000 - 800)
  },
})
GAME_SCENARIOS.push(
  thaiDrop('wardrobe-shoe-on-head', 4, 'feet', 'boots', [0.71, 0.52]),
  thaiDrop('wardrobe-paint-mirror', 4, 'paint', 'pot-pink', [0.56, 0.43]),
)
GAME_SCENARIOS.push(
  thaiHouse('thai-walk', 2.6, 'downstairs', [['floor', 0]]),
  thaiHouse('thai-stairs', 6, 'downstairs?at=fridge', [['stairs-up', 0]]),
  thaiHouse('thai-bounce', 5, 'upstairs?at=mattress', [['mattress', 900], ['mattress', 1100], ['mattress', 1300]]),
  // Her wardrobe (wardrobe.html, gate 4): two things on in turn (each pops on and she shows it off), the mirror's picture
  // flying to the door, Sparkle's wand (a surprise look), and a picture tapped on the door (the whole look at once).
  thaiHouse('wardrobe-dress', 5, 'wardrobe?drawer=head', [['trip:ward:thing:crown', 1600], ['trip:ward:thing:cowboy', 2200]]),
  thaiHouse('wardrobe-mirror', 5, 'wardrobe?drawer=head&look=cowboy,fairy', [['trip:ward:mirror', 3800]]),
  thaiHouse('wardrobe-wand', 4, 'wardrobe', [['trip:ward:wand', 3000]]),
  thaiHouse('wardrobe-door', 4, 'wardrobe?door=crown,hearts,tutu;bow,fairy,dress-mint', [['trip:ward:thing:photo-1', 2500]]),
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

// The Poles' globe (3D greybox): grab it and pull down so the Arctic rolls to the front (Pola hops and waves), flick it
// up past the middle to Antarctica (the world rolls over so the penguins stand up), back to the middle; then the sun
// dragged from summer up north down to summer in the south (the north goes dark: stars and the northern lights).
const polesDrag = async (page, path) => {
  const [x0, y0] = path[0]
  await page.mouse.move(vp.width * x0, vp.height * y0)
  await page.mouse.down()
  for (const [fx, fy, ms] of path.slice(1)) {
    await page.mouse.move(vp.width * fx, vp.height * fy, { steps: 10 })
    await page.waitForTimeout(ms)
  }
  await page.mouse.up()
}
GAME_SCENARIOS.push(
  {
    name: 'poles-spin',
    seconds: 8,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/poles/hub/globe`)
      await page.waitForFunction(() => window.__polesGlobeQA?.().mode, null, { timeout: 20000 })
      await page.waitForTimeout(1000)
    },
    act: async (page) => {
      await polesDrag(page, [[0.5, 0.35], [0.52, 0.6, 60]])
      await page.waitForTimeout(2000)
      await polesDrag(page, [[0.5, 0.6], [0.5, 0.25, 0]])
      await page.waitForTimeout(2200)
      await polesDrag(page, [[0.5, 0.5], [0.3, 0.42, 0]])
    },
  },
  {
    // Ice Floe Hop: grab Pola, pull back (he crouches, the arc and ring show), let go: the leap and the landing thump on
    // the next floe; then a fling far off to the side: the belly-flop, the swim and the climb out.
    name: 'poles-floe-fling',
    seconds: 9,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/poles/floe/steady`)
      await page.waitForFunction(() => window.__polesFloeQA?.().mode, null, { timeout: 20000 })
      await page.waitForTimeout(1200)
    },
    act: async (page) => {
      const pull = async (dx, dy) => {
        const b = await page.locator('[data-anchor="pola"]').boundingBox()
        if (!b) throw new Error('no Pola')
        const x = b.x + b.width / 2
        const y = b.y + b.height / 2
        await page.mouse.move(x, y)
        await page.mouse.down()
        await page.mouse.move(x + dx, y + dy, { steps: 14 })
        await page.waitForTimeout(500)
        await page.mouse.up()
      }
      await pull(0, Math.min(110, vp.height * 0.18))
      await page.waitForTimeout(2000)
      await pull(Math.min(240, vp.width * 0.3), Math.min(60, vp.height * 0.1))
    },
  },
  {
    // Penguin Slide: Papa belly-sliding down the bumps (the wheel under her finger), held over to one side up the
    // snowbank (head first in the snow, feet wiggling), then let go: he pops out and drifts back to the middle.
    name: 'poles-slide-steer',
    seconds: 9,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/poles/slide/bumps`)
      await page.waitForFunction(() => window.__polesSlideQA?.().mode, null, { timeout: 20000 })
      await page.waitForTimeout(800)
    },
    act: async (page) => {
      const x = vp.width / 2
      const y = vp.height * 0.7
      await page.mouse.move(x, y)
      await page.mouse.down()
      await page.mouse.move(x - Math.min(70, vp.width * 0.08), y, { steps: 8 })
      await page.waitForTimeout(1500)
      await page.mouse.move(x + Math.min(120, vp.width * 0.14), y, { steps: 10 })
      await page.waitForTimeout(3500)
      await page.mouse.up()
    },
  },
  {
    // Iceberg Maker: the long crack tapped all the way (it creaks, leans out, groans), the giant drops with a splash and
    // a wave, rocks and settles, and the camera sinks under the waterline; then her finger pushes it down and lets go.
    name: 'poles-iceberg-giant',
    seconds: 14,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/poles/iceberg/giant?pole=north`)
      await page.waitForFunction(() => window.__polesIcebergQA?.().section, null, { timeout: 20000 })
      await page.waitForTimeout(1000)
    },
    act: async (page) => {
      for (let i = 0; i < 5; i++) {
        const b = await page.locator('[data-anchor="giant"]').boundingBox()
        if (!b) break
        await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
        await page.waitForTimeout(450)
      }
      await page.waitForFunction(() => window.__polesIcebergQA?.().under, null, { timeout: 12000 })
      await page.waitForTimeout(1500)
      const b = await page.locator('[data-anchor="berg"]').boundingBox()
      if (!b) throw new Error('no berg')
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
      await page.mouse.down()
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2 + vp.height * 0.25, { steps: 20 })
      await page.waitForTimeout(800)
      await page.mouse.up()
    },
  },
  {
    name: 'poles-sun',
    seconds: 6,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/poles/hub/sun?summer=north`)
      await page.waitForFunction(() => window.__polesGlobeQA?.().mode, null, { timeout: 20000 })
      await page.waitForTimeout(1200)
    },
    act: async (page) => {
      const b = await page.locator('[data-anchor="sun"]').boundingBox()
      if (!b) throw new Error('no sun')
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
      await page.mouse.down()
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2 + vp.height * 0.45, { steps: 30 })
      await page.waitForTimeout(2500)
      await page.mouse.up()
    },
  },
  {
    // Snow Coats (2D): her finger zigzags over the brown fox; the coat goes white where it goes and fluffs up, then the
    // rest puffs on by itself and the fox hops.
    name: 'poles-coats-rub',
    seconds: 6,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/poles/coats/fox`)
      await page.waitForFunction(() => window.__polesCoatsQA?.().section, null, { timeout: 20000 })
      await page.waitForTimeout(800)
    },
    act: async (page) => {
      const b = await page.locator('[data-k="fox-body"]').boundingBox()
      if (!b) throw new Error('no fox')
      await page.mouse.move(b.x, b.y + b.height * 0.25)
      await page.mouse.down()
      for (let r = 0; r <= 12; r++) await page.mouse.move(b.x + (r % 2 ? 0 : b.width), b.y + b.height * (0.25 + (0.65 * r) / 12), { steps: 14 })
      await page.mouse.up()
      await page.waitForTimeout(1500)
    },
  },
)

// The Thailand map (2D greybox, thailand-map.html): the toy plane grabbed at Bangkok and swooped up north and round in a
// curve (it banks, buzzes and puffs a trail), then let go to glide into its lazy circle.
GAME_SCENARIOS.push({
  name: 'thailand-plane',
  seconds: 7,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand`)
    await page.waitForTimeout(1800)
  },
  act: async (page) => {
    const b = await page.getByLabel("Bangkok, Agong's house").boundingBox()
    if (!b) throw new Error('no Bangkok pin')
    const [x, y] = [b.x + b.width / 2, b.y + b.height / 2]
    await page.mouse.move(x, y)
    await page.mouse.down()
    for (let i = 1; i <= 30; i++) {
      const a = (i / 30) * Math.PI * 1.5
      await page.mouse.move(x + Math.sin(a) * vp.width * 0.25, y - (1 - Math.cos(a)) * vp.height * 0.15)
      await page.waitForTimeout(60)
    }
    await page.mouse.up()
  },
})

// Canada's train map (3D greybox): the train grabbed in Quebec and pushed west hard (it chugs, puffs and whistles, the
// camera rides along), let go to roll on; then by Ottawa a tap sends the moose on the track ambling off with a snort, and
// a second tap makes it hop where it stands.
GAME_SCENARIOS.push(
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

// Baan Chang's feeding yard (3D greybox): a banana pulled out of Daddy's basket and held up on Mali's side (her trunk
// snakes after it, curls round it and swings it to her mouth), then a stick of sugarcane held high on the right (the
// trunks stretch up after it) and brought down to Khanom.
GAME_SCENARIOS.push({
  name: 'chang-trunk',
  seconds: 7,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/boat-trip/feed`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiBoatQA?.().mode, null, { timeout: 20000 })
    await page.waitForTimeout(1200)
  },
  act: async (page) => {
    for (const [food, path] of [
      ['banana', [[0.34, 0.5, 2600]]],
      ['cane', [[0.7, 0.12, 1600], [0.66, 0.55, 1800]]],
    ]) {
      const b = await page.locator(`[data-anchor="food:${food}"]`).boundingBox()
      if (!b) throw new Error(`no ${food} in the basket`)
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
      await page.mouse.down()
      for (const [fx, fy, ms] of path) {
        await page.mouse.move(vp.width * fx, vp.height * fy, { steps: 10 })
        await page.waitForTimeout(ms)
      }
      await page.mouse.up()
    }
  },
})

// Baan Chang's cafe: her chocolate milk, all by dragging. The milk jug to her glass (it tips and pours), the chocolate
// held over it (upside down, brown ribbons), the spoon going round and round (the ribbons melt), a purple straw in.
GAME_SCENARIOS.push({
  name: 'chang-pour',
  seconds: 9,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/boat-trip/drinks`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiBoatQA?.().drink, null, { timeout: 20000 })
    await page.waitForTimeout(1200)
  },
  act: async (page) => {
    const d = await page.evaluate(() => window.__thaiBoatQA().drink)
    for (const [tool, to, ms, round] of [
      ['milk', d.pourAt[0], 1700],
      ['choc', d.squeezeAt[0], 1400],
      ['spoon', d.stirAt[0], 0, true],
      ['straw-purple', d.glassAt[0], 200],
    ]) {
      const b = await page.locator(`[data-anchor="tool:${tool}"]`).boundingBox()
      if (!b) throw new Error(`no ${tool} on the tray`)
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
      await page.mouse.down()
      await page.mouse.move(to[0], to[1], { steps: 10 })
      if (round) for (let k = 0; k < 45; k++) await page.mouse.move(to[0] + Math.cos(k / 3) * 28, to[1] + Math.sin(k / 3) * 14), await page.waitForTimeout(35)
      else await page.waitForTimeout(ms)
      await page.mouse.up()
      await page.waitForTimeout(250)
    }
  },
})

// Baan Chang deeper: in favorites a food held out to the elephant who doesn't want it (sniffed, then tossed through
// the air to the one who does); in the splash, a tap on each elephant (dip, spray up over the family, the rainbow).
const changMoment = (name, seconds, section, act) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/boat-trip/${section}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiBoatQA?.().mode, null, { timeout: 20000 })
    await page.waitForTimeout(1500)
  },
  act,
})
GAME_SCENARIOS.push(
  changMoment('chang-pass', 5, 'favorites', async (page) => {
    // Whatever Khanom wants, held out on Mali's side: she takes it, sniffs it and passes it over.
    const want = await page.evaluate(() => window.__thaiBoatQA().trunks.find((t) => t.id === 'khanom').want?.split(' ')[0] ?? 'banana')
    const b = await page.locator(`[data-anchor="food:${want}"]`).boundingBox()
    if (!b) throw new Error('no food in the basket')
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
    await page.mouse.down()
    await page.mouse.move(vp.width * 0.3, vp.height * 0.45, { steps: 10 })
    await page.waitForTimeout(4200)
    await page.mouse.up()
  }),
  // The way in: the sign photo (Kaylee strikes the pose, Mommy and Daddy copy her, the flash), and the boardwalk (a
  // finger held ahead of her: she walks after it, Mommy and Daddy tag along, down the steps toward the rail).
  changMoment('chang-pose', 5, 'sign', async (page) => {
    await page.getByRole('button', { name: 'Cheer pose' }).click({ force: true })
    await page.waitForTimeout(4500)
  }),
  changMoment('chang-walk', 6, 'boardwalk', async (page) => {
    await page.mouse.move(vp.width * 0.38, vp.height * 0.58)
    await page.mouse.down()
    for (let i = 0; i < 30; i++) {
      await page.mouse.move(vp.width * Math.max(0.04, 0.38 - i * 0.02), vp.height * 0.6)
      await page.waitForTimeout(180)
    }
    await page.mouse.up()
  }),
  changMoment('chang-splash', 6, 'splash', async (page) => {
    for (const id of ['ele:mali', 'ele:khanom', 'ele:lamyai']) {
      await page.locator(`[data-anchor="${id}"]`).click({ force: true }).catch(() => {})
      await page.waitForTimeout(1900)
    }
  }),
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
  thaiRace('race-ramp', 5, 'race?lap=3', () => (window.__thaiBoatQA?.().racers?.kaylee?.s ?? 0) > 280, async (page) => {
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

// HarborLand (the mall trip): the hall's ways in, and the Big Frame's climbs and rides: up the red wall, through the
// tunnel, the Boomerang Donut swinging, down the twin-dragon spiral into the balls (after walking to the top's left
// end), the Ta-Khon roller over the racing lanes, the zip line along the front, the mask's nose slide, and the cannon
// at Daddy (bonk, the ball on his horn, his flop). Taps go through the tap targets, or a point on the screen.
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
  // The hall: walking to the cafe's door and going in (the door swings, the camera moves in), going in at the barber's
  // (Daddy following with his new look), and Little Land's bricks tumbling and hopping home.
  thaiMall('hall-go-in', 5, 'hall?from=vet', [['door:cafe', 4800]]),
  thaiMall('hall-barber', 3, 'hall?from=barber&hair=k.roygbvproygbvproygbvproyg.s', [['door:barber', 2800]]),
  thaiMall('hall-bricks', 14, 'hall?from=race', [['point', 3500, 0.97, 0.88], ['point', 3500, 0.97, 0.88], ['blocks', 6500]]),
  thaiMall('frame-wall', 6, 'frame?at=out', [['climb:wall', 5800]]),
  thaiMall('frame-tunnel', 5, 'frame?at=out', [['tunnel', 4800]]),
  thaiMall('frame-donut', 9, 'frame?at=l1', [['ride:donut', 8800]]),
  thaiMall('frame-dragon', 12, 'frame?at=top', [['point', 4000, 0.12, 0.62], ['ride:dragon', 7800]]),
  thaiMall('frame-roller', 12, 'frame?at=top', [['point', 4000, 0.85, 0.6], ['ride:roller', 7800]]),
  thaiMall('frame-zip', 8, 'frame?at=l2', [['ride:zip', 7800]]),
  thaiMall('frame-nose', 7, 'frame?at=top', [['ride:nose', 6800]]),
  thaiMall('frame-cannon', 7, 'frame?at=in', [['cannon', 2700], ['cannon', 1400], ['cannon', 2700]]),
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
  // The stethoscope: only its chest piece goes to the puppy; the ear tips sit on Kaylee's own ears, with a tube between.
  thaiVet('vet-heart', 4, 'puppy', [['stethoscope', 'chest', 'rub', 900]]),
  thaiVet('vet-soap', 4, 'pony', [['soap', 'belly', 'rub']]),
  thaiVet('vet-sneeze', 7, 'elephant', [['soap', 'belly', 'rub'], ['soap', 'head', 'rub', 2600]]),
)

// The Barber Salon (mall trip, greybox): tools on Daddy's mane, the core verb. Her finger drags the grow tonic round
// his head (the strands grow long and wild), the scissors across (the tufts fall), the comb up (spikes) and the color
// spray across (rainbow stripes); then the mirror: the chair spins round to it, he poses, Mommy's flash. Where things
// are comes from window.__thaiMallQA (his head and the tools, in screen pixels).
const thaiBarber = (name, seconds, round, strokes, mirror = false) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/mall-trip/barber?round=${round}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiMallQA?.().game === 'barber' && window.__thaiMallQA().head, null, { timeout: 20000 })
    await page.waitForTimeout(400)
  },
  act: async (page) => {
    for (const [tool, path] of strokes) {
      const q = await page.evaluate(() => window.__thaiMallQA())
      const [hx, hy, r] = q.head
      await page.mouse.move(...q.tools[tool])
      await page.mouse.down()
      for (const [fx, fy] of path) await page.mouse.move(hx + fx * r, hy + fy * r + q.liftPx, { steps: 5 })
      await page.mouse.up()
      await page.waitForTimeout(300)
    }
    if (mirror) {
      await page.locator('[data-anchor="mirror"]').click({ force: true })
      await page.waitForTimeout(3600)
    }
  },
})
const around = (n, y) => Array.from({ length: n }, (_, i) => [Math.cos(i * 0.5) * 0.9, y + Math.sin(i * 0.5) * 0.4])
GAME_SCENARIOS.push(
  thaiBarber('barber-grow-snip', 6, 1, [['tonic', around(26, -0.6)], ['scissors', [[-1.8, 0], [1.8, 0], [-1.8, -0.4]]]]),
  thaiBarber('barber-comb-color', 6, 2, [['tonic', around(20, -0.6)], ['comb', [[-0.5, -0.2], [-0.3, -1.6], [0, -0.2], [0.2, -1.6], [0.5, -0.2], [0.6, -1.6]]], ['spray', Array.from({ length: 30 }, (_, i) => [-1.2 + i * 0.08, -0.8])]]),
  // (The mirror glows after 8 strokes of hair work.)
  thaiBarber('barber-mirror', 10, 1, [0, 1, 2, 3].flatMap((i) => [['tonic', around(8, -0.6)], ['scissors', [[-1.8, 0.4 - i * 0.2], [1.8, 0.4 - i * 0.2]]]]), true),
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

// The mall day's HarborLand counter (the trip loop, greybox): its tiny toys. Setup rides the lift up (the big button);
// the act taps a pair of grip socks (they hop onto her feet, and Daddy's stretch up to his knees), the shoe rack (her
// shoes hop into a cubby, Daddy squashes his big ones in) and the height chart (her horn counts, Daddy's goes off the
// top).
GAME_SCENARIOS.push({
  name: 'mall-counter-toys',
  seconds: 12,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/mall-trip/arrive`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiMallQA?.().phase === 'lift', null, { timeout: 30000 })
    await page.locator('[data-anchor="lift-button"]').click({ force: true })
    await page.waitForFunction(() => window.__thaiMallQA?.().phase === 'counter', null, { timeout: 30000 })
    await page.waitForTimeout(800)
  },
  act: async (page) => {
    await page.locator('[data-anchor="socks:pink"]').click({ force: true })
    await page.waitForTimeout(2600)
    await page.locator('[data-anchor="rack"]').click({ force: true })
    await page.waitForTimeout(3600)
    await page.locator('[data-anchor="chart"]').click({ force: true })
    await page.waitForTimeout(5000)
  },
})

// Little Land (mall trip, greybox): the core verb, a brick from the box put on the stack. Her finger drags bricks onto
// the spots (each drops in, squashes, and the stack sways; the second goes half over the edge: a big wobble), then a
// swipe through the stack knocks it over and the bricks bounce. In round 3 the tower passes Daddy's ribbon and he
// sneezes it down. Where things are comes from window.__thaiMallQA (the box and the spots, in screen pixels).
const thaiBlocks = (name, seconds, round, targets, end) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/mall-trip/blocks?round=${round}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiMallQA?.().game === 'blocks', null, { timeout: 20000 })
    await page.waitForTimeout(400)
  },
  act: async (page) => {
    for (const [s, r] of targets) {
      const q = await page.evaluate(() => window.__thaiMallQA())
      const sp = q.spots.find((p) => p[0] === s && (r === undefined || p[1] === r)) ?? q.spots.find((p) => p[0] === s)
      if (!sp) continue
      await page.mouse.move(...q.box)
      await page.mouse.down()
      await page.mouse.move(sp[2], sp[3] + q.liftPx, { steps: 14 })
      await page.mouse.up()
      await page.waitForTimeout(700)
    }
    if (end === 'swipe') {
      // From a brick at the bottom (it has bricks on top, so it doesn't lift off), sideways through the stack.
      const q = await page.evaluate(() => window.__thaiMallQA())
      const low = q.stack.find((b) => b[1] === 0)
      if (!low) return
      await page.mouse.move(low[2], low[3])
      await page.mouse.down()
      await page.mouse.move(low[2] + 220, low[3] - 20, { steps: 8 })
      await page.mouse.up()
      await page.waitForTimeout(2200)
    } else await page.waitForTimeout(3200)
  },
})
GAME_SCENARIOS.push(thaiBlocks('blocks-stack-crash', 7, 1, [[3, 0], [4, 1], [1, 0], [2, 1]], 'swipe'), thaiBlocks('blocks-sneeze', 8, 3, [[3, 0], [3, 1], [3, 2], [3, 3]], 'wait'))

// Muay Thai (mall trip, greybox): the core verb, a punch. Round 1: her finger goes down on the bag, high then low, and
// a swipe across it (a hook): the glove goes out where she touched, the bag swings and squashes, Daddy staggers, POW.
// Round 2: punches on the drum's beat (when the ring is gold): the big gold POW. Round 3: Daddy's pad as it moves, then
// the big kick. Where things are comes from window.__thaiMallQA (screen pixels).
const thaiBoxing = (name, seconds, round, mode) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/mall-trip/boxing?round=${round}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiMallQA?.().game === 'boxing', null, { timeout: 20000 })
    await page.waitForTimeout(400)
    // Round 1 starts with the wai kru: six taps on her gloves.
    for (let i = 0; i < 8 && (await page.evaluate(() => window.__thaiMallQA().phase)) !== 'play'; i++) {
      await page.locator('[data-anchor="gloves"]').click({ force: true }).catch(() => {})
      await page.waitForTimeout(500)
    }
  },
  act: async (page) => {
    const t0 = Date.now()
    let i = 0
    while (Date.now() - t0 < seconds * 1000) {
      const q = await page.evaluate(() => window.__thaiMallQA())
      if (mode === 'bag' && q.bag) {
        const [x, y] = q.bag
        if (i % 3 === 2) {
          await page.mouse.move(x - 40, y)
          await page.mouse.down()
          await page.mouse.move(x + 60, y, { steps: 4 })
          await page.mouse.up()
        } else await page.mouse.click(x, y + (i % 2 ? -50 : 40))
        i++
        await page.waitForTimeout(550)
      } else if (mode === 'beat' && q.bag && q.window && q.toNext < 0.3) {
        await page.mouse.click(...q.bag)
        await page.waitForTimeout(400)
      } else if (mode === 'pad' && q.pad && !q.hopping && (q.phase === 'play' || q.phase === 'kick')) {
        await page.mouse.click(...q.pad)
        await page.waitForTimeout(500)
      }
      await page.waitForTimeout(30)
    }
  },
})
GAME_SCENARIOS.push(thaiBoxing('boxing-punch', 5, 1, 'bag'), thaiBoxing('boxing-beat', 6, 2, 'beat'), thaiBoxing('boxing-pad-kick', 9, 3, 'pad'))
// The Golden Mountain (mall trip, greybox): the core verb, pulling up hold by hold. Her finger goes down on a glowing
// hold and pulls down (she reaches, rises, lands with a squash, the number pops); at the top the bell and the slide.
// In round 3 Daddy climbs the other side, puffing, a hold behind. Where things are comes from window.__thaiMallQA.
const thaiMountain = (name, seconds, round, steps) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/mall-trip/mountain?round=${round}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiMallQA?.().game === 'mountain', null, { timeout: 20000 })
    await page.waitForTimeout(400)
  },
  act: async (page) => {
    for (let i = 0; i < steps; i++) {
      const q = await page.evaluate(() => window.__thaiMallQA())
      const r = q.reach.find((h) => h[2] === 1 && h.length > 3)
      if (r) {
        await page.mouse.move(r[3], r[4])
        await page.mouse.down()
        await page.mouse.move(r[3], r[4] + q.pullPx + 10, { steps: 8 })
        await page.mouse.up()
        await page.waitForTimeout(500)
      } else if (q.state === 'top' && !q.rung && q.bell) {
        await page.mouse.click(...q.bell)
        await page.waitForTimeout(1300)
      } else if (q.state === 'top' && q.slide) {
        await page.mouse.click(...q.slide)
        await page.waitForTimeout(2600)
      } else await page.waitForTimeout(300)
    }
  },
})
GAME_SCENARIOS.push(thaiMountain('mountain-climb', 9, 1, 9), thaiMountain('mountain-race', 9, 3, 9))
// The Sky Pod (mall trip, greybox): the core verb, slapping the pods. Each slap squashes the pod, flashes it, plays its
// note and throws sparks, and Kaylee bounces over on the mat and jumps to slap it too (a big jump for the high ones).
// The first run slaps low, high, across and back; the second slides a finger across the arch (a glissando). Where the
// pods are comes from window.__thaiMallQA (screen pixels).
const thaiSkyPod = (name, seconds, pods, glide) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/mall-trip/skypod`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiMallQA?.().game === 'skypod', null, { timeout: 20000 })
    await page.waitForTimeout(600)
  },
  act: async (page) => {
    const q = await page.evaluate(() => window.__thaiMallQA())
    if (glide) {
      const [a, b] = [q.pods[0], q.pods[q.pods.length - 1]]
      await page.mouse.move(a[0], a[1])
      await page.mouse.down()
      for (const p of q.pods) await page.mouse.move(p[0], p[1], { steps: 4 })
      await page.mouse.move(b[0] + 30, b[1], { steps: 2 })
      await page.mouse.up()
      await page.waitForTimeout(1500)
      return
    }
    for (const i of pods) {
      await page.mouse.click(q.pods[i][0], q.pods[i][1])
      await page.waitForTimeout(900)
    }
  },
})
GAME_SCENARIOS.push(thaiSkyPod('skypod-slap', 7, [0, 4, 8, 3, 1]), thaiSkyPod('skypod-glide', 4, [], true))

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

// The Nan road trip's mountain road: her finger steering the Pajero, the core verb. On the valley road she puts her
// finger down (the steering wheel appears), turns it right and holds it: the Pajero swerves off onto the grass (bumping,
// tufts flying, "Oh no, the grass!"), on past it (it hops off and tumbles, "Oh no!", poof), and drops back onto the road
// ("We're back!"); she lets go and Mommy takes it back to the left lane, then she taps the Pajero (it hops, boing).
GAME_SCENARIOS.push({
  name: 'nan-steer',
  seconds: 11,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/nan-trip/drive`)
    await page.waitForFunction(() => window.__thaiNanQA?.().mode, null, { timeout: 30000 })
    await page.waitForTimeout(1500)
  },
  act: async (page) => {
    await page.mouse.move(vp.width * 0.38, vp.height * 0.45)
    await page.mouse.down()
    await page.waitForTimeout(1800)
    await page.mouse.move(vp.width * 0.85, vp.height * 0.45, { steps: 20 })
    await page.waitForFunction(() => window.__thaiNanQA().overs > 0, null, { timeout: 12000 }).catch(() => {})
    await page.waitForTimeout(3000)
    await page.mouse.up()
    await page.waitForTimeout(2200)
    await page.getByRole('button', { name: 'The Pajero' }).click({ force: true }).catch(() => {})
    await page.waitForTimeout(1500)
  },
})

// The Nan Mountain Cup (greybox 1): the kart toy. After GO her finger holds the road just ahead of the kart (where QA's
// `aim` says it is) and swings from side to side across it, over coins and pads; then (nan-bounce) the forest's trick:
// racing on by itself up to the first bouncy mushroom, and boing, up in the air.
GAME_SCENARIOS.push(
  {
    name: 'nan-kart',
    seconds: 12,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/nan-trip/race`)
      await page.waitForFunction(() => window.__thaiNanQA?.().phase === 'race', null, { timeout: 40000 })
    },
    act: async (page) => {
      const aim = () => page.evaluate(() => window.__thaiNanQA().aim)
      let a = await aim()
      await page.mouse.move(a?.x ?? vp.width / 2, a?.y ?? vp.height * 0.45)
      await page.mouse.down()
      for (let i = 0; i < 20; i++) {
        await page.waitForTimeout(500)
        a = await aim()
        if (a) await page.mouse.move(a.x + Math.sin(i / 2.5) * vp.width * 0.12, a.y, { steps: 4 })
      }
      await page.mouse.up()
    },
  },
  {
    name: 'nan-bounce',
    seconds: 8,
    setup: async (page, base) => {
      // Racing on by itself, it drives straight over the mushrooms (the good bits don't need her to aim): up to just
      // before the first one.
      await page.goto(`${base}#/world/thailand/nan-trip/race`)
      await page.waitForFunction(() => window.__thaiNanQA?.().racers?.kaylee.progress > 140, null, { timeout: 60000 })
    },
    act: async (page) => {
      await page.waitForFunction(() => window.__thaiNanQA().bounces > 0, null, { timeout: 8000 }).catch(() => {})
      await page.waitForTimeout(2500)
    },
  },
)

// The Nan Mountain Cup, greybox 2: each new track's trick. On the rice steps (nan-splash) racing on by itself through
// the first puddles (it steers into them): the splash, the mud on the kart. On the climb (nan-cloud) from just below the
// cloud: the white closing in and the lanterns lighting up one by one as it drives under them.
GAME_SCENARIOS.push(
  {
    name: 'nan-splash',
    seconds: 8,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/nan-trip/race?track=steps`)
      await page.waitForFunction(() => window.__thaiNanQA?.().racers?.kaylee.progress > 50, null, { timeout: 60000 })
    },
    act: async (page) => {
      await page.waitForFunction(() => window.__thaiNanQA().splashes > 1, null, { timeout: 12000 }).catch(() => {})
      await page.waitForTimeout(1500)
    },
  },
  {
    name: 'nan-cloud',
    seconds: 10,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/nan-trip/race?track=cloud`)
      await page.waitForFunction(() => window.__thaiNanQA?.().cloud?.in > 0.15, null, { timeout: 120000 })
    },
    act: async (page) => {
      await page.waitForTimeout(10000)
    },
  },
)

// The Nan Mountain Cup (greybox 3): the silver podium, where she taps the winner (Grandma Taeng) for a high five and
// Taeng hops down to tie her ribbon on the pink kart and back up; then the Cup ceremony: the scoreboard lights up race by
// race, the Cup flies over from its stand, a tap and she lifts it over her head (fireworks, everyone cheering).
GAME_SCENARIOS.push(
  {
    name: 'nan-high-five',
    seconds: 6,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/nan-trip/podium?track=steps&place=2`)
      await page.waitForFunction(() => window.__thaiNanQA?.().mode === 'podium', null, { timeout: 30000 })
      await page.waitForTimeout(2500)
    },
    act: async (page) => {
      await page.getByRole('button', { name: 'Grandma Taeng', exact: true }).click({ force: true }).catch(() => {})
      await page.waitForFunction(() => window.__thaiNanQA().ui.next, null, { timeout: 30000 }).catch(() => {})
      await page.waitForTimeout(800)
    },
  },
  {
    name: 'nan-cup-lift',
    seconds: 7,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/nan-trip/cup-win`)
      await page.waitForFunction(() => window.__thaiNanQA?.().cupHere, null, { timeout: 60000 })
    },
    act: async (page) => {
      await page.getByRole('button', { name: 'The Nan Mountain Cup', exact: true }).click({ force: true }).catch(() => {})
      await page.waitForTimeout(6000)
    },
  },
)

// The Nan road trip's mushroom farm (greybox): misting, the core verb. Her finger holds the hose on the rack and sweeps
// along the middle row (mist, pins popping, swelling, the rainbow), then in round 2 pulls a grown clump off and carries
// it to the basket.
GAME_SCENARIOS.push(
  {
    name: 'nan-mist',
    seconds: 8,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/nan-trip/mushrooms`)
      await page.waitForFunction(() => window.__thaiNanQA?.().game === 'mushrooms', null, { timeout: 30000 })
      await page.waitForTimeout(1200)
    },
    act: async (page) => {
      const bags = (await page.evaluate(() => window.__thaiNanQA())).bags.map((b) => b.at)
      await page.mouse.move(bags[4][0], bags[4][1])
      await page.mouse.down()
      for (const i of [4, 5, 6, 7, 3, 2, 1, 0]) {
        await page.mouse.move(bags[i][0], bags[i][1], { steps: 10 })
        await page.waitForTimeout(700)
      }
      await page.mouse.up()
    },
  },
  {
    name: 'nan-pick',
    seconds: 6,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/nan-trip/mushrooms?round=2`)
      await page.waitForFunction(() => window.__thaiNanQA?.().game === 'mushrooms', null, { timeout: 30000 })
      await page.waitForTimeout(1500)
    },
    act: async (page) => {
      const q = await page.evaluate(() => window.__thaiNanQA())
      const [x, y] = q.bags[5].at
      await page.mouse.move(x, y)
      await page.mouse.down()
      await page.mouse.move(x - 30, y + 70, { steps: 12 })
      await page.mouse.move(q.points.basket[0], q.points.basket[1] - 50, { steps: 14 })
      await page.mouse.up()
      await page.waitForTimeout(1200)
      await page.mouse.click(...q.bags[6].at)
      await page.waitForTimeout(1500)
    },
  },
)

// Kaylee's rice farm (greyboxes A and B): leading Kaylee, the core verb. A finger held on paddy A zigzags across it at about
// her trotting speed (she splashes after it, ripples behind her, seedlings plip in where she wades); then in the
// growing round the finger chases the pecking birds off the rice.
const riceReady = async (page, base, round) => {
  await page.goto(`${base}#/world/thailand/nan-trip/rice?round=${round}`)
  await page.waitForFunction(() => window.__thaiNanQA?.().game === 'rice', null, { timeout: 30000 })
  await page.waitForTimeout(1200)
}
const slowDrag = async (page, to, ms = 900) => {
  const from = await page.evaluate(() => window.__qaMouse ?? null)
  for (let k = 1; k <= 12; k++) {
    const x = (from?.[0] ?? to[0]) + ((to[0] - (from?.[0] ?? to[0])) * k) / 12
    const y = (from?.[1] ?? to[1]) + ((to[1] - (from?.[1] ?? to[1])) * k) / 12
    await page.mouse.move(x, y)
    await page.waitForTimeout(ms / 12)
  }
  await page.evaluate((p) => (window.__qaMouse = p), to)
}
GAME_SCENARIOS.push(
  {
    name: 'nan-plant',
    seconds: 9,
    setup: (page, base) => riceReady(page, base, 'plant'),
    act: async (page) => {
      const [x0, y0, x1, y1] = (await page.evaluate(() => window.__thaiNanQA())).paddies[0]
      await page.mouse.move(x0 + 12, y1 - 12)
      await page.evaluate((p) => (window.__qaMouse = p), [x0 + 12, y1 - 12])
      await page.mouse.down()
      for (let r = 0; r < 4; r++) await slowDrag(page, [r % 2 ? x0 + 12 : x1 - 12, y1 - 14 - ((y1 - y0 - 28) * r) / 3], 1500)
      await page.mouse.up()
    },
  },
  {
    name: 'nan-shoo',
    seconds: 8,
    setup: async (page, base) => {
      await riceReady(page, base, 'grow')
      await page.waitForTimeout(2500)
    },
    act: async (page) => {
      for (let k = 0; k < 4; k++) {
        const b = (await page.evaluate(() => window.__thaiNanQA())).birds.at[0]
        if (!b) {
          await page.waitForTimeout(800)
          continue
        }
        await page.mouse.move(...b)
        await page.mouse.down()
        await page.waitForTimeout(900)
        await page.mouse.up()
      }
    },
  },
  // Greybox B's threshing: a tap every 0.7 s on the basket, so she takes bundles, swings and bangs them and tosses the
  // straw onto the pile; the filmstrip should show the anticipation up, the fast down and the grains spraying.
  {
    name: 'nan-thresh',
    seconds: 8,
    setup: (page, base) => riceReady(page, base, 'thresh'),
    act: async (page) => {
      for (let k = 0; k < 10; k++) {
        const p = (await page.evaluate(() => window.__thaiNanQA())).points.basket
        if (p) await page.mouse.click(...p)
        await page.waitForTimeout(700)
      }
    },
  },
)

// Bo Kluea's salt wells (greybox): the bucket, the core verb. A held finger takes the bucket down into the well (splash,
// glug), lifts it full (it swings on its rope), carries it over the pan and lowers it so it tips and pours; then in
// round 3 the finger drags the paddle's blade through the salt toward her and lets go over the basket.
const saltReady = async (page, base, round) => {
  await page.goto(`${base}#/world/thailand/nan-trip/salt?round=${round}`)
  await page.waitForFunction(() => window.__thaiNanQA?.().game === 'salt', null, { timeout: 30000 })
  await page.waitForTimeout(1200)
}
GAME_SCENARIOS.push(
  {
    name: 'nan-bucket',
    seconds: 9,
    setup: (page, base) => saltReady(page, base, '1'),
    act: async (page) => {
      const p = (await page.evaluate(() => window.__thaiNanQA())).points
      await page.mouse.move(...p.well)
      await page.mouse.down()
      await page.mouse.move(p.wellDeep[0], p.wellDeep[1] + 40, { steps: 12 })
      await page.waitForTimeout(1100)
      await page.mouse.move(p.well[0], p.well[1] - 160, { steps: 14 })
      await page.waitForTimeout(400)
      await page.mouse.move(p.panLow[0], p.pan[1] - 160, { steps: 18 })
      await page.waitForTimeout(300)
      await page.mouse.move(p.panLow[0], p.panLow[1] + 20, { steps: 10 })
      await page.waitForTimeout(1500)
      await page.mouse.up()
    },
  },
  {
    name: 'nan-scrape',
    seconds: 7,
    setup: (page, base) => saltReady(page, base, '3'),
    act: async (page) => {
      const p = (await page.evaluate(() => window.__thaiNanQA())).points
      for (const dx of [-120, 0, 120]) {
        await page.mouse.move(p.saltBack[0] + dx, p.saltBack[1])
        await page.mouse.down()
        await page.mouse.move(p.saltFront[0] + dx, p.saltFront[1], { steps: 16 })
        await page.mouse.up()
        await page.waitForTimeout(900)
      }
    },
  },
)

// The Nan trip's map and the 3 (greybox, step 6): on the map, the little Pajero grabbed at
// the airport and pulled along the roads over the bridge, through town and up the valley to the mushroom farm (held
// there, it goes: the camera dives into the road); at the viewpoint, a finger drawing the 3 along the road below.
const nanReady = async (page, base, hash, ready) => {
  await page.goto(`${base}#/world/thailand/nan-trip/${hash}`)
  await page.waitForFunction(ready, null, { timeout: 30000 })
  await page.waitForTimeout(1500)
}
GAME_SCENARIOS.push(
  {
    name: 'nan-map-drag',
    seconds: 9,
    setup: (page, base) => nanReady(page, base, 'map', () => window.__thaiNanQA?.().game === 'map'),
    act: async (page) => {
      const q = await page.evaluate(() => window.__thaiNanQA())
      const n = q.points.nodes
      await page.mouse.move(...q.car)
      await page.mouse.down()
      for (const to of [n.town, n.mushrooms]) {
        const from = (await page.evaluate(() => window.__thaiNanQA())).car ?? to
        for (let k = 1; k <= 14; k++) {
          await page.mouse.move(from[0] + ((to[0] - from[0]) * k) / 14, from[1] + ((to[1] - from[1]) * k) / 14)
          await page.waitForTimeout(110)
        }
        await page.waitForTimeout(500)
      }
      await page.waitForTimeout(900)
      await page.mouse.up()
    },
  },
  {
    // The 3 from above: the bends pop one, two, three by themselves, then the fanfare (nothing to draw).
    name: 'nan-three-view',
    seconds: 5,
    setup: (page, base) => {
      return page.goto(`${base}#/world/thailand/nan-trip/three`).then(() => page.waitForFunction(() => window.__thaiNanQA?.().phase === 'view', null, { timeout: 30000 }))
    },
    act: async () => {},
  },
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

// Ice Floe Hop's QA scenarios (scripts/qa-screens.mjs, qa-pacing.mjs, qa-motion.mjs pick them up next to the Poles' own
// qa.mjs). Not part of the app: Node runs it, Vite never sees it.
import { vp } from '../../../../../../scripts/qa-lib.mjs'

const link = (to) => `#/world/poles/floe/${to}`

/** Screenshots: how to get to each screen from a fresh start. */
export const screens = [
  // Each stretch's first floe, Pebble on Pola's back: the big steady floes (the seal's hole beside them), the drifting
  // ice (the narwhal's tusk), summer's little floes (the belugas).
  ...['steady', 'drift', 'melt'].map((to) => ({ name: `poles-floe-${to}`, hash: link(to), reset: true, wait: 3200 })),
  // Another way the floes can lie.
  { name: 'poles-floe-steady-2', hash: `${link('steady')}?layout=2`, reset: true, wait: 3200 },
  // Home: Pola runs up to Mama on her ice (the icebergs and the sun behind), then the cheer.
  { name: 'poles-floe-mama', hash: link('mama'), reset: true, wait: 2000 },
  { name: 'poles-floe-home', hash: link('mama'), reset: true, wait: 4200 },
]

/** Auto-played runs: talk before the first touch, talk per touch, the play strip. */
export const pacing = [{ name: 'poles ice floe hop', id: 'floe', hash: '#/world/poles/floe', reset: true }]

const ready = async (page, base, to) => {
  await page.goto(`${base}${link(to)}`)
  await page.waitForFunction(() => window.__polesFloeQA?.().mode, null, { timeout: 20000 })
  await page.waitForTimeout(1200)
}
/** Grab Pola, pull back by (dx, dy) pixels, hold a moment (she crouches, Pebble holds on), let go. */
const pull = async (page, dx, dy) => {
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
/** Poke every animal on screen now (the world says where they are), one after the other. */
const pokeAll = async (page, skip = []) => {
  const list = await page.evaluate(() => window.__polesFloeQA().critters)
  for (const c of list) {
    if (skip.includes(c.id)) continue
    await page.mouse.click(c.x, c.y)
    await page.waitForTimeout(1300)
  }
  return list.map((c) => c.id)
}

/** Filmed moments: the core verb, driven the way a child would. */
export const motion = [
  {
    // The fling: grab Pola and pull back (she crouches, Pebble holds on tight, the arc and ring show), let go: the leap
    // with Pebble's flippers up, the landing thump and his bounce; then twice more up the big floes.
    name: 'poles-floe-fling',
    seconds: 10,
    setup: (page, base) => ready(page, base, 'steady'),
    act: async (page) => {
      for (let i = 0; i < 3; i++) {
        await pull(page, i === 1 ? 30 : 0, Math.min(110, vp.height * 0.18))
        await page.waitForTimeout(2000)
      }
    },
  },
  {
    // A miss: a fling back off the first floe into open water. The belly-flop, Pola swimming with Pebble standing up dry
    // on her back, the climb out and both of them shaking.
    name: 'poles-floe-flop',
    seconds: 9,
    setup: (page, base) => ready(page, base, 'steady'),
    act: async (page) => {
      await pull(page, Math.min(60, vp.width * 0.08), -Math.min(170, vp.height * 0.26))
      await page.waitForFunction(() => window.__polesFloeQA().flops > 0, null, { timeout: 5000 })
      await page.waitForFunction(() => window.__polesFloeQA().mode === 'stand', null, { timeout: 12000 })
    },
  },
  {
    // Pokes on the first floe: the seal in her hole, whoever else is in sight (an iceberg, the owl), Pola and Pebble,
    // the ice and the water.
    name: 'poles-floe-poke',
    seconds: 10,
    setup: (page, base) => ready(page, base, 'steady'),
    act: async (page) => {
      const seen = await pokeAll(page)
      if (!seen.includes('seal')) throw new Error(`no seal to poke (saw ${seen.join(', ') || 'nobody'})`)
      const b = await page.locator('[data-anchor="pola"]').boundingBox()
      await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
      await page.waitForTimeout(900)
      await page.mouse.click(vp.width * 0.12, vp.height * 0.9)
      await page.waitForTimeout(600)
      const n = await page.evaluate(() => window.__polesFloeQA().pokes)
      if (n < 1) throw new Error('the pokes did nothing')
    },
  },
  {
    // The drifting ice: the narwhal's tusk beside the first floe (a poke brings him up for a turn and a blow), the
    // puffin if she's up, then a fling onto the moving ice.
    name: 'poles-floe-narwhal',
    seconds: 10,
    setup: (page, base) => ready(page, base, 'drift'),
    act: async (page) => {
      const seen = await pokeAll(page, ['berg'])
      if (!seen.includes('narwhal')) throw new Error(`no narwhal to poke (saw ${seen.join(', ') || 'nobody'})`)
      await page.waitForTimeout(2500)
      await pull(page, 0, Math.min(110, vp.height * 0.18))
    },
  },
]

// The map of Canada (map/world.ts): its look in every screen shape, the team at the rink (none, three, all six), a new
// friend arriving, and a tap that closes in and opens a chapter. window.__canadaMapQA() has `targets` (each tap
// target's center and size on screen), `team`, `arriving`, `glowing`, `picked`.
const ready = (page) => page.waitForFunction(() => window.__canadaMapQA?.().targets?.['go:party'], null, { timeout: 20000 })
const at = async (page, id) => (await page.evaluate(() => window.__canadaMapQA())).targets[id]

export const screens = [
  { name: 'canada-map', hash: '#/world/canada/hub/map', reset: true, wait: 4500 },
  { name: 'canada-map-team-none', hash: '#/world/canada/hub/map?team=none', reset: true, wait: 4500 },
  { name: 'canada-map-team-three', hash: '#/world/canada/hub/map?team=snowman,bike,canoe', reset: true, wait: 4500 },
  { name: 'canada-map-team-all', hash: '#/world/canada/hub/map?team=all', reset: true, wait: 9000 },
  { name: 'canada-map-arrival', hash: '#/world/canada/hub/map?team=snowman,bike&new=canoe', reset: true, wait: 8000 },
  { name: 'canada-map-book', hash: '#/world/canada/hub/book', reset: true, wait: 1500 },
]

export const pacing = [{ name: 'canada map', id: 'canada', hash: '#/world/canada/hub/map', reset: true }]

export const motion = [
  // A tap on Ollie's bay: the bay hops, the camera closes in, and Whale Watch opens.
  {
    name: 'canada-map-tap',
    seconds: 4,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/hub/map?team=snowman,bike`)
      await ready(page)
      await page.waitForTimeout(3500)
    },
    act: async (page) => {
      const t = await at(page, 'go:whales')
      if (t) await page.mouse.click(t.x, t.y)
      await page.waitForTimeout(3000)
    },
  },
  // Back from a chapter with a new friend: the camera starts on the rink, Lulu pops in, then the board.
  {
    name: 'canada-map-arrive',
    seconds: 6,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/hub/map?team=snowman,bike&new=canoe`)
    },
    act: async (page) => {
      await page.waitForTimeout(5500)
    },
  },
  // The rink before the team is whole (Maple: not yet; the places still to do bounce), then the geese, the owl, the bison and the orca.
  {
    name: 'canada-map-pokes',
    seconds: 7,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/hub/map?team=bike,campfire`)
      await ready(page)
      await page.waitForTimeout(3500)
    },
    act: async (page) => {
      for (const id of ['go:party', 'poke:owl', 'poke:bison', 'poke:orca']) {
        const t = await at(page, id)
        if (t) await page.mouse.click(t.x, t.y)
        await page.waitForTimeout(1600)
      }
    },
  },
]

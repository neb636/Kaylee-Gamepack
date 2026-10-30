// Canada’s direct pin selection, animal book and skating team.
const tap = (page, id) => page.locator(`[data-anchor="${id}"]`).click({ force: true, timeout: 3000 }).catch(() => {})
const ready = (page) => page.waitForFunction(() => window.__canadaMapQA?.().mode, null, { timeout: 20000 })

export const screens = [
  { name: 'canada-map-pins', hash: '#/world/canada', reset: true, wait: 1500 },
  { name: 'canada-map-team', hash: '#/world/canada/hub/map?at=ottawa&team=bike,campfire,canoe,whales,taffy,snowman,bridge,salmon', reset: true, wait: 3000 },
  { name: 'canada-map-forest-polar', hash: '#/world/canada/hub/map?at=forest', reset: true, wait: 3500 },
]

export const motion = [
  {
    name: 'canada-map-pins',
    seconds: 4,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/hub/map`)
      await ready(page)
    },
    act: async (page) => {
      await tap(page, 'go:whales')
      await page.waitForTimeout(3000)
    },
  },
]

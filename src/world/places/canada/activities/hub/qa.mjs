// The train map's own QA scenarios (the push and the moose are in canada/qa.mjs): the story on Quebec City's platform,
// the hockey team on Ottawa's canal, and the pokes that act something out (the Mountie's hat, the bison's roll, the
// polar bear on the ice). Not part of the app: Node runs it, Vite never sees it.

const tap = (page, id) => page.locator(`[data-anchor="${id}"]`).click({ force: true, timeout: 3000 }).catch(() => {})
const ready = (page) => page.waitForFunction(() => window.__canadaMapQA?.().mode, null, { timeout: 20000 })

export const screens = [
  { name: 'canada-map-story', hash: '#/world/canada', reset: true, wait: 7500 },
  { name: 'canada-map-team', hash: '#/world/canada/hub/map?at=ottawa&team=bike,campfire,canoe,whales,taffy,snowman,bridge,salmon', reset: true, wait: 3000 },
  { name: 'canada-map-forest-polar', hash: '#/world/canada/hub/map?at=forest', reset: true, wait: 3500 },
]

export const motion = [
  {
    // Maple tells the story on the platform, hops into the open car, and the camera pulls back to the train.
    name: 'canada-map-story',
    seconds: 14,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada`)
      await ready(page)
    },
    act: async (page) => page.waitForTimeout(13000),
  },
  {
    // On the prairies: the Mountie stops, his horse rears a little and he waves his hat; then the bison ambles off the
    // track and rolls in the dust.
    name: 'canada-map-prairies',
    seconds: 6,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/hub/map?at=prairies`)
      await ready(page)
      await page.waitForTimeout(1500)
    },
    act: async (page) => {
      await tap(page, 'poke:mountie')
      await page.waitForTimeout(2200)
      await tap(page, 'animal:bison')
      await page.waitForTimeout(3000)
    },
  },
  {
    // Her team skating on the canal, and a cheer when one is tapped.
    name: 'canada-map-team',
    seconds: 4,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/canada/hub/map?at=ottawa&team=bike,campfire,canoe,whales,taffy,snowman,bridge,salmon`)
      await ready(page)
      await page.waitForTimeout(1500)
    },
    act: async (page) => {
      await tap(page, 'team')
      await page.waitForTimeout(3000)
    },
  },
]

// Sai Kaew's scenery for the jet ski, built from code in the toon look (no generated art): the whole island's look
// (island/scenery.ts: the ground from the real coastline, the lagoon water, the sky, the horizon, the plants), Sai
// Kaew's own pieces (island/props.ts: the pink umbrellas and red chairs, the jet ski hut with its bell, the mermaid on
// her rocks), and the bay's buoys. Plan: planning/around-the-world/thailand/samet-trip.md ("The look").
import { Group } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'
import type { Lagoon } from '../../../../../engine3d/lagoon'
import { PAL } from '../../../../../engine3d/toon'
import { buildSaiKaew } from '../island/props'
import { buildIsland, DAY, type Ground, type Island } from '../island/scenery'
import { bay, FAR_BUOY, RACE, toBay } from '../island/layout'

export const SKY = { haze: DAY.noon.haze }

export interface Scenery {
  root: Group
  terrain: Ground
  lagoon: Lagoon
  island: Island
  /** The bell on the hut's front post (it swings on its own pivot). */
  bell: Group
  /** The big orange buoy, and the two pink flag buoys at the finish (they bob). */
  farBuoy: Group
  flags: Group[]
  /** The umbrellas' canopies (a tap spins one). */
  umbrellas: Group[]
  mermaid: Group
  /** The far horizon's pieces stay put; the clouds drift (update). */
  update(dt: number, t: number, x: number, z: number, lights: Parameters<Island['update']>[4]): void
}

export function buildScenery(bag: Bag): Scenery {
  const island = buildIsland(bag)
  const root = island.root
  const { bell, umbrellas, mermaid } = buildSaiKaew(bag, root)

  // ---- The buoys: the big orange one the race goes round, and the two pink flags at the finish.
  const buoy = (c: string, r: number, flag?: string) => {
    const g = new Group()
    const parts = [P.sphere(r, c, { at: [0, r * 0.35, 0] }, 16), P.torus(r * 0.98, r * 0.12, '#FFFFFF', { at: [0, r * 0.5, 0], rot: [Math.PI / 2, 0, 0] })]
    if (flag) parts.push(P.cyl(0.04, 0.04, 2.2, '#FFFFFF', { at: [0, r + 1.0, 0] }, 6), P.prism([[0, 0], [0.9, -0.3], [0, -0.6]], 0.03, flag, { at: [0.03, r + 2.05, 0] }))
    g.add(solid(merge(parts), bag, 2))
    return g
  }
  const farBuoy = buoy('#FF8A2E', 1.4, PAL.hotpink)
  farBuoy.position.set(FAR_BUOY.x, 0, FAR_BUOY.z)
  root.add(farBuoy)
  const flags = [RACE.finish.w, RACE.finish.e].map((u) => {
    const b = buoy(PAL.pink, 0.55, PAL.hotpink)
    const p = bay(u, RACE.finish.v)
    b.position.set(p.x, 0, p.z)
    root.add(b)
    return b
  })
  return {
    root,
    terrain: island.ground,
    lagoon: island.lagoon,
    island,
    bell,
    farBuoy,
    flags,
    umbrellas,
    mermaid,
    update(dt, t, x, z, lights) {
      island.update(dt, t, x, z, lights)
    },
  }
}

/** The beach frame helper for whoever places things on the sand. */
export { toBay }

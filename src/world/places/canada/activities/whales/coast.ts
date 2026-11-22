// Whale Watch's coast as greybox shapes in the toon look (the art gate dresses it): Tofino's little town on the south
// shore with its dock and two moored boats, rocky points and islands with dark rainforest (the lighthouse on one point,
// the eagle's dead tree on the other), the sea lions' flat rock, the puffins' tall stack, the surf breaking on the big
// island's beach, the misty mountains of Vancouver Island far away, and the kelp bed (golden fronds on the water, long
// stalks down to the sea floor). Under the water: the sandy floor and the bright surface seen from below.
// The world (watch.ts) adds the water, the boat and the animals.
import { Color, DoubleSide, Group, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { loft, merge, P, solid, type LoftRing, type PartOpts } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'
import { rng } from '../canoe/shore'
import { cottage, fishingBoat } from './harbour'
import { BIG_ISLE, DOCK, EAGLE_TREE, ISLES, KELP, LIGHTHOUSE, PUFFIN_ROCK, SEAL_ROCK, SEALION_ROCK, SHORE_Z, SURF, TIDE_SHELF, type Isle } from './sea'

export const SKY = '#CFEAF7'
export const DEEP = '#2F8FA3'
const CEDAR = ['#3C7A5F', '#4A8C6A', '#346E57']
const ROCK = '#9C95AE'
const ROCK_DARK = '#7F7894'
const SAND = '#F1E2C6'
const GRASS = '#86C08C'
/** How deep the sea floor is (m). */
export const FLOOR_Y = -14

export interface Coast {
  /** Everything above the water. */
  land: Group
  /** Under the water: the sea floor, the kelp's stalks, the surface seen from below (shown only while listening). */
  under: Group
  /** The bright underside of the surface. */
  ceiling: Mesh
  /** The kelp bed in a few clumps (each clump's fronds one shape on the water, its stalks one shape below), swaying. */
  kelp: Kelp[]
  /** The lighthouse's turning beam, and its lamp. */
  beam: Group
  lamp: Group
  /** The breaking wave the surfer rides. */
  surf: Group
  /** Where the sea lions lie and the puffin stands. */
  lions: { x: number; y: number; z: number; h: number }[]
  puffin: Vector3
  eagle: Vector3
  /** The tide pool on its shelf (the sea stars' group sits here), and the sea stars round it (pool-local). */
  pool: Vector3
  stars: [number, number, number, number][]
  /** Where the harbour seals nap (and which way they lie), and the raven's post at the end of the dock. */
  seals: { x: number; y: number; z: number; h: number }[]
  raven: Vector3
}

export interface Kelp {
  top: Group
  stalk: Group
  a: number
}

/** One rocky island or point: a rounded rock rising out of the sea, a green top, rainforest on it. */
function isle(s: Isle, bag: Bag, seed: number) {
  const rand = rng(seed)
  const parts: BufferGeometry[] = [
    P.cyl(s.r * 0.86, s.r, s.h, ROCK, { at: [0, s.h / 2 - 0.4, 0] }, 14),
    P.cyl(s.r * 0.55, s.r * 0.9, s.h * 0.5, ROCK_DARK, { at: [s.r * 0.12, s.h * 0.25 - 0.4, s.r * 0.1] }, 9),
  ]
  if (s.trees) parts.push(P.cyl(s.r * 0.8, s.r * 0.86, 0.5, GRASS, { at: [0, s.h - 0.15, 0] }, 14))
  for (let i = 0; i < s.trees; i++) {
    const a = rand() * Math.PI * 2
    const r = Math.sqrt(rand()) * s.r * 0.66
    const h = 5 + rand() * 6
    const c = CEDAR[i % CEDAR.length]
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r
    parts.push(P.cyl(0.25, 0.32, 1.4, '#6E5243', { at: [x, s.h + 0.6, z] }, 6), P.cone(1.6 + h * 0.12, h, c, { at: [x, s.h + 1 + h / 2, z] }, 8))
  }
  const g = solid(merge(parts), bag, 2.5)
  g.position.set(s.x, 0, s.z)
  return g
}

/** A wave-cut ledge. The top stays flat under the sea lions, and the sides break into slanted strata. */
function seaLionLedge(s: Isle, bag: Bag) {
  const angles = [0.00, 0.57, 1.03, 1.77, 2.33, 2.96, 3.51, 4.18, 4.67, 5.41, 5.89]
  const edge = [0.96, 1.07, 0.9, 0.99, 1.05, 0.89, 1.07, 0.92, 1.05, 0.86, 0.95]
  const rings = [
    [-0.52, 1.06, 0],
    [0.22, 1, 0.11],
    [0.35, 0.96, 0.12],
    [0.63, 0.97, 0.08],
    [0.72, 0.93, 0.07],
    [0.98, 0.90, 0.04],
    [s.h - 0.25, 0.76, 0],
  ].map(([y, width, slope], layer) => ({
    z: y,
    pts: angles.map((a, i): [number, number] => {
      const r = s.r * edge[i] * width
      return [r * Math.cos(a) + layer * 0.055, r * Math.sin(a) * 0.9]
    }),
    slope,
  }))
  // Loft along +z first, then stand it up. The cap is flat; the exposed layers dip along the ledge.
  const stone = loft(rings, '#82807D', { rot: [-Math.PI / 2, 0, 0], at: [s.x, 0, s.z] })
  const pos = stone.attributes.position
  const colors = stone.attributes.color
  const shades = ['#53575C', '#77746F', '#696968', '#8B8780', '#797773', '#9B958B', '#ABA598'].map((c) => new Color(c))
  const tint = new Color()
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    const x = pos.getX(i) - s.x
    const z = pos.getZ(i) - s.z
    const layer = rings.findIndex((ring) => Math.abs(y - ring.z) < 0.001)
    pos.setY(i, y + (x * 0.52 - z * 0.26) * rings[layer].slope)
    tint.copy(shades[layer]).multiplyScalar(0.96 + 0.10 * Math.sin(x * 2 + z))
    colors.setXYZ(i, tint.r, tint.g, tint.b)
  }
  stone.computeVertexNormals()
  return solid(stone, bag, 1.5, '#4F4C52')
}

const KELP_BLADES = ['#9C8E38', '#8A8A3A', '#A89842', '#7E8237']

/** One bull-kelp blade lying on the water: a long thin ribbon along +z from its float, wavy, wider in the middle and
 *  tapering to a point. `ph` sets where its ripples fall. */
function blade(len: number, w: number, ph: number, col: string, o: PartOpts) {
  const rings: LoftRing[] = []
  for (let k = 0; k <= 10; k++) {
    const s = k / 10
    const cx = Math.sin(s * Math.PI * 2.2 + ph) * 0.22 * s
    const hw = w * Math.min(1, 0.35 + s * 4) * (1 - 0.85 * s ** 3)
    rings.push({ z: s * len, pts: [[cx + hw, 0], [cx, 0.025], [cx - hw, 0], [cx, -0.025]] })
  }
  return loft(rings, col, o)
}

export function buildCoast(bag: Bag): Coast {
  const land = new Group()
  const under = new Group()
  const rand = rng(23)

  // ---- The south shore: a strip of land with the town along it, rainforest behind, hills further back.
  const town: BufferGeometry[] = [P.box(420, 2.4, 60, GRASS, { at: [0, 0.6, SHORE_Z + 30] }), P.box(420, 0.8, 4, SAND, { at: [0, 0.1, SHORE_Z + 1.4] })]
  const houses = ['#FFD3E2', '#D9CCFF', '#FFF0B8', '#C8F0DF', '#FFD9C4', '#CDEBFF']
  const roofs = ['#E87B8F', '#B9A6F5', '#F29E6B', '#7FA8D9']
  for (let i = 0; i < 14; i++) {
    const x = -70 + i * 11 + (rand() - 0.5) * 4
    if (Math.abs(x - DOCK.x) < 5) continue
    const w = 5 + rand() * 2.5
    const h = 3.5 + rand() * 2
    const z = SHORE_Z + 7 + rand() * 4
    town.push(...cottage(x, z, w, h, houses[i % houses.length], roofs[(i * 3) % roofs.length], 1.8, rng(100 + i)))
  }
  for (let i = 0; i < 40; i++) {
    const x = -200 + rand() * 400
    const z = SHORE_Z + 18 + rand() * 30
    const h = 7 + rand() * 7
    town.push(P.cone(2 + h * 0.13, h, CEDAR[i % 3], { at: [x, 1.8 + h / 2, z] }, 8))
  }
  land.add(solid(merge(town), bag, 2.5))
  // The hills behind the town and the mountains of Vancouver Island all round the far sea (misty, no outline).
  const far: BufferGeometry[] = []
  for (let i = 0; i < 9; i++) far.push(P.sphere(40 + rand() * 20, '#7FAF92', { at: [-240 + i * 60, -10, SHORE_Z + 80 + rand() * 30], scale: [1.3, 0.55, 0.8] }, 12))
  for (let i = 0; i < 26; i++) {
    const a = -Math.PI * 0.95 + (i / 25) * Math.PI * 1.9 + (rand() - 0.5) * 0.1
    // (Round the north half: behind the sea, beyond the islands.)
    const r = 520 + rand() * 120
    const h = 60 + rand() * 90
    far.push(P.cone(70 + rand() * 50, h, i % 2 ? '#A8B6D1' : '#B5BFD9', { at: [Math.sin(a) * r, h / 2 - 8, -Math.cos(a) * r - 30] }, 7))
  }
  land.add(solid(merge(far), bag, 0))

  // ---- The dock and the moored boats.
  const dockLen = DOCK.z0 - DOCK.z1
  const dock: BufferGeometry[] = [P.box(DOCK.w, 0.3, dockLen, '#C9A27E', { at: [DOCK.x, 0.9, DOCK.z1 + dockLen / 2] })]
  for (let z = DOCK.z1 + 1; z < DOCK.z0; z += 4) dock.push(P.cyl(0.18, 0.18, 2.6, '#8C6A55', { at: [DOCK.x - DOCK.w / 2 + 0.2, 0, z] }, 6), P.cyl(0.18, 0.18, 2.6, '#8C6A55', { at: [DOCK.x + DOCK.w / 2 - 0.2, 0, z] }, 6))
  // (Fishing boats: a red and a navy hull, each with a butter wheelhouse, nothing like ice.)
  dock.push(...fishingBoat(DOCK.x + 4.2, 77, '#E8443F', PAL.butter), ...fishingBoat(DOCK.x + 4.4, 83.2, '#4E6A9C', PAL.butter))
  land.add(solid(merge(dock), bag, 2))

  // ---- The islands and points.
  ISLES.forEach((s, i) => land.add(s === SEALION_ROCK ? seaLionLedge(s, bag) : isle(s, bag, 40 + i)))

  // ---- The lighthouse: white with red bands, a lamp on top and a beam that turns.
  const lhY = ISLES[0].h - 0.2
  const lh = solid(merge([P.cyl(1.1, 1.5, 8, '#FFFFFF', { at: [0, 4, 0] }, 14), P.cyl(1.15, 1.25, 1.2, '#E8443F', { at: [0, 5, 0] }, 14), P.cyl(1.4, 1.4, 0.3, '#E8443F', { at: [0, 8.1, 0] }, 14), P.cyl(0.9, 0.9, 1.4, '#FFF6C8', { at: [0, 8.9, 0] }, 12), P.cone(1.2, 1.2, '#E8443F', { at: [0, 10.2, 0] }, 12)]), bag, 2.5)
  lh.position.set(LIGHTHOUSE.x, lhY, LIGHTHOUSE.z)
  land.add(lh)
  const lamp = new Group()
  lamp.position.set(LIGHTHOUSE.x, lhY + 8.9, LIGHTHOUSE.z)
  land.add(lamp)
  const beam = new Group()
  beam.position.copy(lamp.position)
  const beamMat = bag.add(new MeshBasicMaterial({ color: '#FFF3A8', transparent: true, opacity: 0.32, depthWrite: false, side: DoubleSide }))
  // (A cone with its tip at the lamp, lying along +x; the group turns it round.)
  const cone = new Mesh(bag.add(P.cone(3, 26, '#FFFFFF', { at: [0, -13, 0] }, 12)), beamMat)
  cone.rotation.z = Math.PI / 2 + 0.04
  beam.add(cone)
  land.add(beam)

  // ---- The eagle's dead tree on the east point.
  const et = EAGLE_TREE
  const ey = ISLES[1].h - 0.2
  const tree = solid(merge([P.cyl(0.3, 0.45, 9, '#B9AAA0', { at: [0, 4.5, 0] }, 7), P.cyl(0.12, 0.18, 3.2, '#B9AAA0', { at: [1.2, 7, 0], rot: [0, 0, -1] }, 6), P.cyl(0.1, 0.15, 2.6, '#B9AAA0', { at: [-1, 8, 0.2], rot: [0, 0, 0.9] }, 6), P.cyl(0.1, 0.14, 2, '#B9AAA0', { at: [0.2, 9.4, 0.5], rot: [0.5, 0, -0.3] }, 6)]), bag, 2)
  tree.position.set(et.x, ey, et.z)
  land.add(tree)
  const eagle = new Vector3(et.x + 2.3, ey + 7.8, et.z)

  // ---- The sea lions' rock: spots for three of them, and sea stars by the water.
  const sr = SEALION_ROCK
  const lions = [
    { x: sr.x - 1.6, y: sr.h - 0.3, z: sr.z + 0.6, h: -2.4 },
    { x: sr.x + 1.2, y: sr.h - 0.3, z: sr.z - 1, h: -1.6 },
    { x: sr.x + 0.2, y: sr.h - 0.2, z: sr.z + 2.2, h: -3 },
  ]
  // ---- The tide pool: a flat rock shelf at the foot of the sea lions' rock with a pool of clear water on top, sea
  // stars round its rim and anemones in it.
  const ts = TIDE_SHELF
  const shelfTop = ts.h - 0.4
  const pool = new Vector3(ts.x, shelfTop + 0.02, ts.z)
  land.add(solid(merge([P.cyl(ts.r * 0.62, ts.r * 0.62, 0.06, '#8FDCE3', { at: [ts.x, shelfTop + 0.01, ts.z] }, 16), P.sphere(0.5, ROCK_DARK, { at: [ts.x + 1.2, shelfTop + 0.1, ts.z - 1.4], scale: [1, 0.5, 1] }, 8)]), bag, 1.5))
  const stars: [number, number, number, number][] = [
    [-1.9, 0.06, 0.6, 0.5],
    [0.4, 0.06, 2.0, 1.2],
    [1.8, 0.06, -0.3, -0.4],
    [-0.9, 0.06, -1.9, 2.2],
  ]
  // ---- The harbour seals' low rock, by the town.
  const seals = [
    { x: SEAL_ROCK.x - 0.9, y: SEAL_ROCK.h - 0.45, z: SEAL_ROCK.z + 0.4, h: 0.8 },
    { x: SEAL_ROCK.x + 1.1, y: SEAL_ROCK.h - 0.45, z: SEAL_ROCK.z - 0.6, h: -2.2 },
  ]
  // ---- The raven's post: a tall mooring post at the end of the dock.
  const raven = new Vector3(DOCK.x + DOCK.w / 2 - 0.1, 2.2, DOCK.z1 + 0.4)
  land.add(solid(merge([P.cyl(0.24, 0.26, 2.6, '#8C6A55', { at: [raven.x, 0.9, raven.z] }, 8), P.cyl(0.28, 0.28, 0.12, '#6E5243', { at: [raven.x, 2.2, raven.z] }, 8)]), bag, 2))
  // ---- The puffins' stack.
  const puffin = new Vector3(PUFFIN_ROCK.x + 0.8, PUFFIN_ROCK.h - 0.35, PUFFIN_ROCK.z + 2.2)

  // ---- The surf: a long white curl breaking on the big island's beach (the sand on its west side).
  const beach = solid(merge([P.cyl(BIG_ISLE.r + 3, BIG_ISLE.r + 4, 0.8, SAND, { at: [0, 0, 0] }, 20)]), bag, 2)
  beach.position.set(BIG_ISLE.x, -0.1, BIG_ISLE.z)
  land.add(beach)
  const surf = new Group()
  surf.add(solid(merge([P.capsule(0.55, SURF.len, '#FFFFFF', { rot: [Math.PI / 2, 0, 0], scale: [1.3, 1, 1] }), P.capsule(0.4, SURF.len - 1, '#BFF0F2', { at: [-0.5, -0.15, 0], rot: [Math.PI / 2, 0, 0] })]), bag, 2))
  surf.position.set(SURF.x, 0.1, SURF.z)
  land.add(surf)

  // ---- The kelp: bull kelp, a round golden float with a bunch of long ribbon blades streaming from it on the water,
  // all trailing the same way in the current (like real bull kelp at the surface), and a long stalk down to the sea
  // floor. In four clumps, so the whole bed is a handful of shapes: each clump's fronds sway together on the water,
  // its stalks lean together from the floor.
  const kelp: Kelp[] = []
  const clumps: { tops: BufferGeometry[]; stalks: BufferGeometry[] }[] = Array.from({ length: 4 }, () => ({ tops: [], stalks: [] }))
  const CURRENT = 0.9
  for (let i = 0; i < 38; i++) {
    const a = rand() * Math.PI * 2
    const r = Math.sqrt(rand()) * KELP.r
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r
    const c = clumps[Math.floor(((a + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 2)) % 4]
    const b = CURRENT + (rand() - 0.5) * 0.7
    const n = 5 + Math.floor(rand() * 3)
    c.tops.push(P.sphere(0.34, '#C9A24A', { at: [x, 0.08, z], scale: [1, 0.7, 1] }, 10), P.sphere(0.16, '#B08A3A', { at: [x - Math.sin(b) * 0.3, 0.05, z - Math.cos(b) * 0.3], scale: [1, 0.6, 1] }, 7))
    for (let j = 0; j < n; j++) {
      const t = n > 1 ? j / (n - 1) - 0.5 : 0
      c.tops.push(blade(2 + rand() * 1.8, 0.16 + rand() * 0.06, rand() * 6, KELP_BLADES[(i + j) % KELP_BLADES.length], { at: [x + Math.sin(b) * 0.2, 0.03, z + Math.cos(b) * 0.2], rot: [0, b + t * 1.2 + (rand() - 0.5) * 0.2, 0] }))
    }
    c.stalks.push(P.cyl(0.08, 0.1, -FLOOR_Y, '#8E7E36', { at: [x, FLOOR_Y / 2, z] }, 5), ...[0, 1, 2, 3].map((j) => P.rbox(0.35, 1.4, 0.04, 0.05, '#A39242', { at: [x + 0.25 * (j % 2 ? 1 : -1), FLOOR_Y * (0.2 + j * 0.2), z], rot: [0, j + b, (j % 2 ? -1 : 1) * 0.5] })))
  }
  clumps.forEach((c, i) => {
    const top = solid(merge(c.tops), bag, 1.5)
    top.position.set(KELP.x, 0, KELP.z)
    land.add(top)
    // (The stalks lean from the sea floor.)
    const stalk = new Group()
    stalk.position.set(KELP.x, FLOOR_Y, KELP.z)
    const g = solid(merge(c.stalks), bag, 1.2)
    g.position.y = -FLOOR_Y
    stalk.add(g)
    under.add(stalk)
    kelp.push({ top, stalk, a: i * 1.7 })
  })

  // ---- Under the water: the sea floor (sand with rocks) and the surface seen from below.
  const floor: BufferGeometry[] = [P.box(900, 1, 900, '#C8D9C0', { at: [0, FLOOR_Y - 0.5, 0] })]
  for (let i = 0; i < 70; i++) {
    const x = -200 + rand() * 400
    const z = -200 + rand() * 300
    const r = 0.8 + rand() * 2.2
    floor.push(P.sphere(r, i % 3 ? '#9DA9B8' : '#B7A6C9', { at: [x, FLOOR_Y, z], scale: [1, 0.5, 1] }, 8))
  }
  under.add(solid(merge(floor), bag, 0))
  const ceiling = new Mesh(bag.add(new PlaneGeometry(900, 900)), bag.add(new MeshBasicMaterial({ color: new Color('#9FE6EE'), transparent: true, opacity: 0.85, side: DoubleSide, depthWrite: false })))
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.y = -0.03
  under.add(ceiling)
  under.visible = false

  return { land, under, ceiling, kelp, beam, lamp, surf, lions, puffin, eagle, pool, stars, seals, raven }
}

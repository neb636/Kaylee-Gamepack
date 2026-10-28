// Whale Watch's coast as greybox shapes in the toon look (the art gate dresses it): Tofino's little town on the south
// shore with its dock and two moored boats, rocky points and islands with dark rainforest (the lighthouse on one point,
// the eagle's dead tree on the other), the sea lions' flat rock, the puffins' tall stack, the surf breaking on the big
// island's beach, the misty mountains of Vancouver Island far away, and the kelp bed (golden fronds on the water, long
// stalks down to the sea floor). Under the water: the sandy floor and the bright surface seen from below.
// The world (watch.ts) adds the water, the boat and the animals.
import { Color, DoubleSide, Group, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'
import { rng } from '../canoe/shore'
import { BIG_ISLE, DOCK, EAGLE_TREE, ISLES, KELP, LIGHTHOUSE, PUFFIN_ROCK, SEALION_ROCK, SHORE_Z, SURF, type Isle } from './sea'

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
  /** The kelp's stalks and fronds, swaying. */
  kelp: Group[]
  /** The lighthouse's turning beam, and its lamp. */
  beam: Group
  lamp: Group
  /** The breaking wave the surfer rides. */
  surf: Group
  /** Where the sea lions lie and the puffin stands. */
  lions: { x: number; y: number; z: number; h: number }[]
  puffin: Vector3
  eagle: Vector3
  /** The rocks' sea stars, by the water on the sea lions' rock. */
  stars: [number, number, number, number][]
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

export function buildCoast(bag: Bag): Coast {
  const land = new Group()
  const under = new Group()
  const rand = rng(23)

  // ---- The south shore: a strip of land with the town along it, rainforest behind, hills further back.
  const town: BufferGeometry[] = [P.box(420, 2.4, 60, GRASS, { at: [0, 0.6, SHORE_Z + 30] }), P.box(420, 0.8, 4, SAND, { at: [0, 0.1, SHORE_Z + 1.4] })]
  const houses = ['#FFD3E2', '#D9CCFF', '#FFF0B8', '#C8F0DF', '#FFD9C4', '#CDEBFF']
  for (let i = 0; i < 14; i++) {
    const x = -70 + i * 11 + (rand() - 0.5) * 4
    if (Math.abs(x - DOCK.x) < 5) continue
    const w = 5 + rand() * 2.5
    const h = 3.5 + rand() * 2
    const z = SHORE_Z + 7 + rand() * 4
    const c = houses[i % houses.length]
    town.push(P.rbox(w, h, 5, 0.15, c, { at: [x, 1.8 + h / 2, z] }), P.prism([[-w / 2 - 0.4, 0], [w / 2 + 0.4, 0], [0, 2]], 5.6, i % 2 ? '#B9A6F5' : '#E87B8F', { at: [x, 1.8 + h, z] }))
    town.push(P.box(1, 1.6, 0.2, '#8A6A58', { at: [x, 2.6, z - 2.55] }), P.box(1.1, 1, 0.2, '#BFE9F7', { at: [x + w * 0.28, 3.4 + h * 0.2, z - 2.55] }))
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
  // (Fishing boats: a red and a navy hull with a yellow cabin, nothing like ice.)
  for (const [x, z, c] of [
    [DOCK.x + 4.2, 77, '#E8443F'],
    [DOCK.x + 4.4, 83, '#4E6A9C'],
  ] as const) {
    dock.push(P.rbox(2.2, 1, 5.4, 0.4, c, { at: [x, 0.4, z] }), P.box(2.24, 0.16, 5.2, '#FFFFFF', { at: [x, 0.82, z] }), P.rbox(1.5, 1.3, 1.8, 0.15, PAL.butter, { at: [x, 1.5, z + 0.6] }), P.box(1.3, 0.4, 0.06, '#4A4458', { at: [x, 1.75, z - 0.32] }))
  }
  land.add(solid(merge(dock), bag, 2))

  // ---- The islands and points.
  ISLES.forEach((s, i) => land.add(isle(s, bag, 40 + i)))

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
  const stars: [number, number, number, number][] = [
    [sr.x - 3.4, 0.5, sr.z - 3, 0.5],
    [sr.x - 4.4, 0.6, sr.z - 1.2, 1.2],
    [sr.x - 2.6, 0.3, sr.z - 3.8, -0.4],
  ]
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

  // ---- The kelp: golden-olive fronds floating on the water in the bed, long stalks down to the sea floor.
  const kelp: Group[] = []
  for (let i = 0; i < 26; i++) {
    const a = rand() * Math.PI * 2
    const r = Math.sqrt(rand()) * KELP.r
    const x = KELP.x + Math.cos(a) * r
    const z = KELP.z + Math.sin(a) * r
    const g = new Group()
    g.position.set(x, 0, z)
    const top = solid(merge([P.sphere(0.35, '#B79A3E', { at: [0, 0.03, 0], scale: [1, 0.25, 1] }, 8), P.rbox(0.5, 0.04, 2, 0.1, '#9C8A3A', { at: [0.3, 0.02, 0.8], rot: [0, a, 0] }), P.rbox(0.45, 0.04, 1.7, 0.1, '#A99440', { at: [-0.4, 0.02, -0.5], rot: [0, a + 2, 0] })]), bag, 1.5)
    g.add(top)
    const stalk = solid(merge([P.cyl(0.08, 0.1, -FLOOR_Y, '#8E7E36', { at: [0, FLOOR_Y / 2, 0] }, 5), ...[0, 1, 2, 3].map((j) => P.rbox(0.35, 1.4, 0.04, 0.05, '#A39242', { at: [0.25 * (j % 2 ? 1 : -1), FLOOR_Y * (0.2 + j * 0.2), 0], rot: [0, j, (j % 2 ? -1 : 1) * 0.5] }))]), bag, 1.2)
    under.add(stalk)
    stalk.position.set(x, 0, z)
    stalk.userData.base = { x, z, a }
    g.userData.stalk = stalk
    land.add(g)
    kelp.push(g)
  }

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

  return { land, under, ceiling, kelp, beam, lamp, surf, lions, puffin, eagle, stars }
}

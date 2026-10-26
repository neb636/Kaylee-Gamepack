// Bo Kluea's salt hut, modeled in code in the house's toon look (engine/geo.ts parts), cooler and greener for the
// mountains. The open-sided hut on its earth floor (wet and darker where the brine splashes): wooden posts on stone feet,
// a tin roof cut away like a doll's house (the back slope's rusty tin and the rafters), the stone well with moss at its
// foot, the bamboo beam and the bucket on its rope, the big pan with its rolled rim on its mud stove (soot round the
// fire's mouth, the glow, the flames, the clay chimney), the woodpile she takes logs from and the big one stacked
// against the back wall, Kaylee's pink salt basket and the paddle, the shelf for the salt bags, the woven drying trays,
// the water jar, the salt aunty, the cat by the fire, the stack of baskets and the rooster outside. The street and the
// house with the painted couple across it are village.ts.
import { CylinderGeometry, Group, IcosahedronGeometry, InstancedMesh, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three'
import { buildAnimal, type Rig } from '../../../characters/animal'
import type { Look } from '../../../characters/looks'
import type { Bag } from '../../../engine/dispose'
import { bake, blobShadow, merge, P, solid } from '../../../engine/geo'
import { PAL, toon } from '../../../engine/toon'
import {
  AUNTY_AT,
  BAGS,
  BASKET_R,
  BASKET_RIM,
  BASKETS,
  BEAM,
  BLADE,
  BUCKET,
  CAT,
  MOUTH,
  PAN,
  PAN_X,
  ROOSTER,
  SALT,
  SALT_BASKET,
  SHELF,
  STOVE_FRONT,
  WELL,
  WOODPILE,
} from './layout'
import { buildVillage, type Village } from './village'

const WOOD = '#9A7462'
const WOOD_DARK = '#6E5049'
const BAMBOO = '#D9C27A'
const BAMBOO_DARK = '#B59C55'
const EARTH = '#B8A595'
const MUD = '#C99A7A'
const STONE = '#B7B0C6'
const METAL = '#8C8FA6'
const WICKER = '#D2A56C'
const TIN = '#B7B9C9'
const TIN_RUST = '#C99A86'
export const BRINE = '#9ED3EC'
export const SALT_WHITE = '#FFFFFF'

/** The salt aunty: a pony in a sun hat and an apron (not family: the village's salt maker, who talks in her own voice,
 *  cast.json's `saltaunty`). */
export const SALT_AUNTY: Look = { species: 'pony', height: 1.4, chub: 1.12, fur: '#F2C9A0', light: '#FFF1E2', dark: '#7A5A50', ear: '#FFC2C8', mane: ['#6E4E46', '#8A6458'], hair: 'medium', outfit: { kind: 'blouse', color: '#9FD3F7' }, extras: ['sunhat', 'apron'], lashes: true, open: true }

export interface Hut {
  root: Group
  overhead: Group
  bucket: { root: Group; brine: Mesh }
  rope: Mesh
  trolley: Group
  brine: Mesh
  salt: InstancedMesh
  fire: { flames: Group; glow: Mesh; embers: Mesh }
  wood: Group
  basket: { root: Group; heap: Mesh }
  paddle: { root: Group; load: Mesh }
  handle: Mesh
  bags: Group[]
  cat: { root: Group; head: Group; tail: Group }
  baskets: Group
  rooster: { root: Group; head: Group }
  mural: Group
  scooter: Group
  village: Village
  aunty: Rig
}

/** A log (the woodpile's, and the ones she throws on), lying along x. */
export function logGeo() {
  return merge([P.cyl(0.055, 0.055, 0.42, '#9A6A4E', { rot: [0, 0, Math.PI / 2] }, 10), ...[1, -1].map((s) => P.cyl(0.045, 0.045, 0.01, '#E8C69A', { at: [s * 0.211, 0, 0], rot: [0, 0, Math.PI / 2] }, 10))])
}

export function buildHut(bag: Bag): Hut {
  const root = new Group()
  // ---- The hut: the earth floor (darker and wet round the well and the stove), the posts on their stone feet, the
  // well, the stove and the pan, the shelf, the big woodpile against a low plank wall, the water jar ----
  const POSTS: [number, number][] = [-2.75, 2.85].flatMap((x) => [-1.2, 1.15].map((z): [number, number] => [x, z]))
  const hut = [
    P.box(7.6, 0.06, 4.0, EARTH, { at: [0, -0.03, -0.1] }),
    // Worn, darker, wet patches where the brine splashes, and a few flat stones to step on.
    P.cyl(0.85, 0.85, 0.004, '#A99689', { at: [WELL.x, 0.002, 0.1] }, 28),
    P.cyl(0.5, 0.5, 0.004, '#A99689', { at: [-0.5, 0.002, 0.35], scale: [1.6, 1, 0.7] }, 20),
    P.cyl(0.6, 0.6, 0.004, '#AE9888', { at: [PAN_X, 0.002, 0.55], scale: [1.4, 1, 0.5] }, 20),
    ...([[-0.2, 1.35], [0.5, 1.55], [-3.1, -0.2], [3.3, 0.2]] as [number, number][]).map(([x, z], i) => P.cyl(0.16 + (i % 2) * 0.04, 0.18, 0.03, i % 2 ? '#C9C3D6' : STONE, { at: [x, 0.01, z], scale: [1.3, 1, 1] }, 10)),
    // (The front posts run up out of the picture: the roof over the front is cut away.)
    ...POSTS.flatMap(([x, z]) => {
      const h = z > 0 ? 3.6 : 2.9
      return [P.cyl(0.075, 0.085, h, WOOD_DARK, { at: [x, h / 2, z] }, 8), P.rbox(0.26, 0.14, 0.26, 0.04, STONE, { at: [x, 0.07, z] })]
    }),
    // ---- The well: a round wall of stones, two rows offset like bricks, a stone lip on top, moss at its foot ----
    P.cyl(WELL.r - 0.02, WELL.r + 0.02, WELL.rim - 0.04, '#9C95AE', { at: [WELL.x, (WELL.rim - 0.04) / 2, WELL.z] }, 24),
    ...[0, 1, 2].flatMap((row) =>
      Array.from({ length: 10 }, (_, i) => {
        const a = ((i + (row % 2) * 0.5) / 10) * Math.PI * 2
        return P.rbox(0.25, 0.15, 0.1, 0.035, (i + row) % 3 ? STONE : '#C9C3D6', { at: [WELL.x + Math.sin(a) * (WELL.r + 0.01), 0.09 + row * 0.16, WELL.z + Math.cos(a) * (WELL.r + 0.01)], rot: [0, a, 0] })
      }),
    ),
    P.torus(WELL.r - 0.01, 0.055, '#D9D4E4', { at: [WELL.x, WELL.rim, WELL.z], rot: [Math.PI / 2, 0, 0] }),
    ...Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + 0.3
      return P.sphere(0.07, '#8CBF86', { at: [WELL.x + Math.sin(a) * (WELL.r + 0.06), 0.03, WELL.z + Math.cos(a) * (WELL.r + 0.06)], scale: [1.4, 0.5, 1] }, 8)
    }),
    // ---- The stove: a mud block under the pan, rounded and built up round it, soot round the fire's mouth, a clay
    // chimney at the back ----
    P.rbox(PAN.x1 - PAN.x0 + 0.22, PAN.top - PAN.depth, STOVE_FRONT - PAN.z0 + 0.1, 0.08, MUD, { at: [PAN_X, (PAN.top - PAN.depth) / 2, (STOVE_FRONT + PAN.z0 - 0.1) / 2] }),
    P.rbox(MOUTH.w + 0.2, MOUTH.h + 0.16, 0.012, 0.005, '#8E6656', { at: [MOUTH.x, MOUTH.y + 0.04, STOVE_FRONT + 0.004] }),
    P.cyl(0.11, 0.14, 2.0, '#C99A7A', { at: [PAN.x1 - 0.12, 1.0, PAN.z0 - 0.2] }, 10),
    ...[0.6, 1.3].map((y) => P.cyl(0.125, 0.125, 0.05, '#B5856A', { at: [PAN.x1 - 0.12, y, PAN.z0 - 0.2] }, 10)),
    // ---- The pan: a wide, shallow metal tray with a rolled rim ----
    P.box(PAN.x1 - PAN.x0, 0.02, PAN.z1 - PAN.z0, '#7E8198', { at: [PAN_X, PAN.top - PAN.depth, (PAN.z0 + PAN.z1) / 2] }),
    ...[PAN.z0, PAN.z1].map((z) => P.box(PAN.x1 - PAN.x0 + 0.03, PAN.depth, 0.03, METAL, { at: [PAN_X, PAN.top - PAN.depth / 2, z] })),
    ...[PAN.x0, PAN.x1].map((x) => P.box(0.03, PAN.depth, PAN.z1 - PAN.z0 + 0.03, METAL, { at: [x, PAN.top - PAN.depth / 2, (PAN.z0 + PAN.z1) / 2] })),
    ...[PAN.z0, PAN.z1].map((z) => P.cyl(0.026, 0.026, PAN.x1 - PAN.x0 + 0.05, '#C9CCDA', { at: [PAN_X, PAN.top, z], rot: [0, 0, Math.PI / 2] }, 8)),
    ...[PAN.x0, PAN.x1].map((x) => P.cyl(0.026, 0.026, PAN.z1 - PAN.z0 + 0.05, '#C9CCDA', { at: [x, PAN.top, (PAN.z0 + PAN.z1) / 2], rot: [Math.PI / 2, 0, 0] }, 8)),
    // ---- The shelf for the salt bags, between two posts at the back, folded empty sacks waiting at the bottom ----
    ...[SHELF.x0, SHELF.x1].map((x) => P.box(0.06, 1.65, 0.06, WOOD_DARK, { at: [x, 0.825, SHELF.z] })),
    ...[0.38, ...SHELF.ys].map((y) => P.box(SHELF.x1 - SHELF.x0 + 0.12, 0.04, 0.32, WOOD, { at: [(SHELF.x0 + SHELF.x1) / 2, y, SHELF.z] })),
    ...[0, 1, 2].map((k) => P.rbox(0.5, 0.035, 0.24, 0.015, k % 2 ? '#F4F0E8' : '#E8E2D6', { at: [(SHELF.x0 + SHELF.x1) / 2 + (k - 1) * 0.03, 0.42 + k * 0.035, SHELF.z] })),
    // ---- A low plank wall at the back on the right, and the big woodpile stacked against it ----
    P.box(1.9, 0.75, 0.06, WOOD, { at: [2.0, 0.375, -1.42] }),
    ...Array.from({ length: 6 }, (_, i) => P.box(0.02, 0.73, 0.012, WOOD_DARK, { at: [1.2 + i * 0.32, 0.375, -1.385] })),
    ...[0, 1, 2, 3].flatMap((row) => Array.from({ length: 11 - row }, (_, k) => logGeo().rotateY(Math.PI / 2 + Math.sin(k * 3 + row) * 0.05).translate(1.25 + (k + row * 0.5) * 0.115, 0.06 + row * 0.1, -1.2))),
    // ---- A big clay water jar by the left posts ----
    P.sphere(0.3, '#B5715C', { at: [-3.25, 0.32, 0.75], scale: [1, 1.1, 1] }, 16),
    P.cyl(0.17, 0.2, 0.1, '#9E5E4C', { at: [-3.25, 0.66, 0.75] }, 14),
    P.torus(0.17, 0.03, '#C98670', { at: [-3.25, 0.71, 0.75], rot: [Math.PI / 2, 0, 0] }),
  ]
  root.add(solid(merge(hut), bag, 2))
  // The round woven drying trays hung on the back posts.
  const trays = ([[-2.75, 1.95, -1.27, 0.34], [-2.45, 1.45, -1.29, 0.3], [2.85, 2.0, -1.27, 0.32]] as [number, number, number, number][]).flatMap(([x, y, z, r], i) => [
    P.cyl(r, r, 0.04, i % 2 ? '#C99A5E' : WICKER, { at: [x, y, z], rot: [Math.PI / 2 - 0.12, 0, 0] }, 20),
    P.torus(r, 0.025, '#B5854E', { at: [x, y, z + 0.02], rot: [-0.12, 0, 0] }),
    ...[0.35, 0.65].map((k) => P.torus(r * k, 0.008, '#B5854E', { at: [x, y, z + 0.025], rot: [-0.12, 0, 0] })),
  ])
  root.add(solid(merge(trays), bag, 2))
  // The roof and the bamboo beam on its two posts (with rings where the bamboo's joints are): their own group, hidden
  // while the camera looks down into the pan from above them. The roof is cut away like a doll's house: the back slope
  // is rusty tin on its rafters (seen from below), and over the front there's nothing, so the camera sees in and the
  // street and the painted couple show behind.
  const RIDGE = { y: 3.45, z: -0.05 }
  const EAVE_B = { y: 2.72, z: -1.65 }
  const slope = (a: { y: number; z: number }, b: { y: number; z: number }) => ({ len: Math.hypot(a.z - b.z, a.y - b.y), rot: Math.atan2(b.y - a.y, b.z - a.z), y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 })
  const back = slope(EAVE_B, RIDGE)
  const rafterXs = Array.from({ length: 7 }, (_, i) => -2.85 + i * 0.95)
  const overhead = solid(
    merge([
      // The back slope's tin, rust stripes, a ridge cap.
      P.box(6.4, 0.05, back.len + 0.1, TIN, { at: [0, back.y + 0.05, back.z], rot: [-back.rot, 0, 0] }),
      ...Array.from({ length: 5 }, (_, i) => P.box(0.22, 0.052, back.len + 0.08, TIN_RUST, { at: [-2.6 + i * 1.3 + Math.sin(i * 7) * 0.25, back.y + 0.052, back.z], rot: [-back.rot, 0, 0] })),
      P.box(6.4, 0.09, 0.2, '#9A9CB0', { at: [0, RIDGE.y + 0.07, RIDGE.z] }),
      // The back plate on the posts, the ridge beam, the rafters under the tin.
      P.box(5.9, 0.12, 0.12, WOOD_DARK, { at: [0, 2.84, -1.2] }),
      P.box(6.3, 0.12, 0.12, WOOD_DARK, { at: [0, RIDGE.y, RIDGE.z] }),
      ...rafterXs.map((x) => P.box(0.07, 0.07, back.len, WOOD, { at: [x, back.y - 0.03, back.z], rot: [-back.rot, 0, 0] })),
      P.cyl(0.05, 0.05, BEAM.x1 - BEAM.x0 + 0.3, BAMBOO, { at: [(BEAM.x0 + BEAM.x1) / 2, BEAM.y, 0], rot: [0, 0, Math.PI / 2] }, 10),
      ...Array.from({ length: 9 }, (_, i) => P.cyl(0.056, 0.056, 0.03, BAMBOO_DARK, { at: [BEAM.x0 - 0.1 + i * 0.52, BEAM.y, 0], rot: [0, 0, Math.PI / 2] }, 10)),
      ...[BEAM.x0 - 0.08, BEAM.x1 + 0.08].map((x) => P.cyl(0.06, 0.07, BEAM.y + 0.1, BAMBOO_DARK, { at: [x, (BEAM.y + 0.1) / 2, -0.06] }, 8)),
    ]),
    bag,
    2,
  )
  root.add(overhead)
  // The dark inside of the well and the brine far down in it.
  const hole = new Mesh(bag.add(new CylinderGeometry(WELL.r - 0.04, WELL.r - 0.04, 0.02, 24)), bag.add(new MeshBasicMaterial({ color: '#3C3350' })))
  hole.position.set(WELL.x, WELL.rim - 0.02, WELL.z)
  root.add(hole)
  // ---- The pan's brine (it rises and falls) and the salt that grows in it ----
  const brine = new Mesh(bag.add(new PlaneGeometry(PAN.x1 - PAN.x0 - 0.03, PAN.z1 - PAN.z0 - 0.03)), bag.add(new MeshBasicMaterial({ color: BRINE, transparent: true, opacity: 0.88, depthWrite: false })))
  brine.rotation.x = -Math.PI / 2
  brine.position.set(PAN_X, PAN.top - PAN.depth + 0.015, (PAN.z0 + PAN.z1) / 2)
  brine.renderOrder = 1
  root.add(brine)
  // A heap of salt: a faceted little mound of crystals.
  const heap = new IcosahedronGeometry(0.058, 0)
  heap.scale(1, 0.75, 1)
  const salt = new InstancedMesh(bag.add(heap), toon(SALT_WHITE), SALT.length)
  salt.renderOrder = 2
  root.add(salt)
  // ---- The fire's mouth in the stove's front: dark, the glow, the flames and the embers ----
  const mouth = new Mesh(bag.add(new PlaneGeometry(MOUTH.w, MOUTH.h)), bag.add(new MeshBasicMaterial({ color: '#3A2B33' })))
  mouth.position.set(MOUTH.x, MOUTH.y, STOVE_FRONT + 0.012)
  root.add(mouth)
  const glow = new Mesh(bag.add(new PlaneGeometry(MOUTH.w - 0.04, MOUTH.h - 0.04)), bag.add(new MeshBasicMaterial({ color: '#FF8A3D', transparent: true, opacity: 0, depthWrite: false })))
  glow.position.set(MOUTH.x, MOUTH.y, STOVE_FRONT + 0.016)
  root.add(glow)
  const embers = new Mesh(bag.add(merge([P.box(MOUTH.w - 0.08, 0.05, 0.1, '#FF6B3D', {}), ...[-0.12, 0, 0.12].map((x) => P.sphere(0.035, '#FFC83D', { at: [x, 0.03, 0.02] }, 8))])), toon('#ffffff', true))
  embers.position.set(MOUTH.x, MOUTH.y - MOUTH.h / 2 + 0.04, STOVE_FRONT - 0.02)
  root.add(embers)
  const flames = new Group()
  flames.position.set(MOUTH.x, MOUTH.y - MOUTH.h / 2 + 0.03, STOVE_FRONT + 0.02)
  const flameMat = (c: string) => bag.add(new MeshBasicMaterial({ color: c }))
  for (const [x, h, c] of [[-0.13, 0.18, '#FF7A3D'], [0.12, 0.2, '#FF7A3D'], [0, 0.26, '#FF9A3D'], [-0.05, 0.16, '#FFD45C'], [0.06, 0.15, '#FFD45C']] as const) {
    const f = new Mesh(bag.add(P.cone(0.06, h, '#ffffff', { at: [0, h / 2, 0] }, 8)), flameMat(c))
    f.position.x = x
    f.userData.h = h
    flames.add(f)
  }
  root.add(flames)
  // ---- The woodpile ----
  const wood = new Group()
  wood.position.set(...WOODPILE)
  wood.userData.pick = 'wood'
  const logs = []
  // Ends toward us, stacked three, two, one.
  for (let row = 0; row < 3; row++) for (let k = 0; k < 3 - row; k++) logs.push(logGeo().rotateY(Math.PI / 2 + 0.06 * (k - 1)).translate((k - (2 - row) / 2) * 0.115, 0.055 + row * 0.1, 0))
  wood.add(solid(merge(logs), bag, 2))
  wood.add(blobShadow(0.35, bag))
  root.add(wood)
  // ---- Kaylee's salt basket: wicker, and the heap of salt in it ----
  const bRoot = new Group()
  bRoot.position.set(...SALT_BASKET)
  bRoot.userData.pick = 'basket'
  bRoot.add(
    solid(
      merge([
        // Wide and round with a pink rim and a pink band (not like the drying baskets' tall stack).
        P.cyl(BASKET_R, BASKET_R * 0.7, BASKET_RIM, '#F2C98E', { at: [0, BASKET_RIM / 2, 0] }, 18),
        P.torus(BASKET_R, 0.03, PAL.hotpink, { at: [0, BASKET_RIM, 0], rot: [Math.PI / 2, 0, 0] }),
        P.torus(BASKET_R * 0.86, 0.02, PAL.pink, { at: [0, BASKET_RIM * 0.5, 0], rot: [Math.PI / 2, 0, 0] }),
        ...[1, -1].map((s) => P.torus(0.06, 0.015, '#D9A86C', { at: [s * BASKET_R, BASKET_RIM - 0.02, 0], rot: [0, Math.PI / 2, 0] }, Math.PI)),
      ]),
      bag,
      2,
    ),
  )
  const bHeap = new Mesh(bag.add(P.sphere(BASKET_R * 0.92, SALT_WHITE, { scale: [1, 0.5, 1] }, 16)), toon('#ffffff', true))
  bHeap.position.y = BASKET_RIM - 0.02
  bHeap.scale.setScalar(0.001)
  bRoot.add(bHeap)
  bRoot.add(blobShadow(0.3, bag))
  root.add(bRoot)
  // ---- The paddle: a flat wooden blade (across local x), with a little heap of salt on it; the handle is its own
  // stick, from the blade up to Kaylee's hands (it stretches as she reaches) ----
  const paddle = new Group()
  paddle.add(solid(merge([P.rbox(BLADE.w, 0.025, 0.09, 0.01, '#D8B07E', {}), P.box(0.05, 0.03, 0.06, '#B98A64', { at: [0, 0.02, 0.06] })]), bag, 2))
  const load = new Mesh(bag.add(P.sphere(0.1, SALT_WHITE, { scale: [1.3, 0.5, 0.7] }, 12)), toon('#ffffff', true))
  load.position.set(0, 0.03, -0.02)
  load.scale.setScalar(0.001)
  paddle.add(load)
  paddle.visible = false
  root.add(paddle)
  const handle = new Mesh(bag.add(new CylinderGeometry(0.018, 0.018, 1, 8).translate(0, 0.5, 0)), toon('#B98A64'))
  handle.visible = false
  root.add(handle)
  // ---- The bucket: a wooden bucket with two bands and a handle; brine inside it (it rises as it fills) ----
  const bucket = new Group()
  bucket.userData.pick = 'bucket'
  // Open at the top, so the brine shows rising inside it (the outer wall, its bands and handle, outlined).
  bucket.add(
    solid(
      merge([
        bake(new CylinderGeometry(BUCKET.r, BUCKET.r * 0.86, BUCKET.h, 16, 1, true), '#C9965E'),
        ...[-0.08, 0.09].map((y) => P.torus(BUCKET.r * (y > 0 ? 1.0 : 0.93), 0.012, '#7E6A86', { at: [0, y, 0], rot: [Math.PI / 2, 0, 0] })),
        P.torus(BUCKET.r - 0.006, 0.012, '#B8874F', { at: [0, BUCKET.h / 2, 0], rot: [Math.PI / 2, 0, 0] }),
        P.torus(BUCKET.r * 0.95, 0.012, '#7E6A86', { at: [0, BUCKET.h / 2, 0] }, Math.PI),
      ]),
      bag,
      2,
    ),
  )
  // The inside: a darker wall facing in (mirrored, so its faces point inward) and the bottom, both without outlines.
  const inner = new Mesh(
    bag.add(merge([bake(new CylinderGeometry(BUCKET.r - 0.012, BUCKET.r * 0.86 - 0.012, BUCKET.h - 0.004, 16, 1, true), '#9C6E45', { scale: [-1, 1, 1] }), P.cyl(BUCKET.r * 0.86 - 0.012, BUCKET.r * 0.86 - 0.012, 0.01, '#6E4E46', { at: [0, -BUCKET.h / 2 + 0.02, 0] }, 16)])),
    toon('#ffffff', true),
  )
  bucket.add(inner)
  const bBrine = new Mesh(bag.add(new CylinderGeometry(BUCKET.r - 0.035, BUCKET.r - 0.035, 0.012, 16)), bag.add(new MeshBasicMaterial({ color: BRINE })))
  bBrine.visible = false
  bucket.add(bBrine)
  root.add(bucket)
  // The rope (from the beam's little ring down to the bucket's handle, its length set each frame) and the ring.
  const rope = new Mesh(bag.add(new CylinderGeometry(0.009, 0.009, 1, 6).translate(0, 0.5, 0)), toon('#E8D7B0'))
  root.add(rope)
  const trolley = solid(merge([P.torus(0.07, 0.02, BAMBOO_DARK, { rot: [0, Math.PI / 2, 0] }), P.sphere(0.03, '#8E6A5C', { at: [0, -0.07, 0] }, 8)]), bag, 2)
  root.add(trolley)
  // ---- The salt bags that go on the shelf at the end (hidden until then) ----
  const bags: Group[] = []
  for (let i = 0; i < BAGS; i++) {
    const b = solid(merge([P.rbox(0.2, 0.26, 0.16, 0.06, SALT_WHITE, { at: [0, 0.13, 0] }), P.cyl(0.035, 0.05, 0.06, '#F4F0E8', { at: [0, 0.28, 0] }, 10), P.torus(0.04, 0.012, PAL.hotpink, { at: [0, 0.27, 0], rot: [Math.PI / 2, 0, 0] })]), bag, 2)
    const row = i < 2 ? 0 : 1
    b.position.set(SHELF.x0 + 0.22 + (i % 2) * 0.42, SHELF.ys[row] + 0.02, SHELF.z)
    b.scale.setScalar(0.001)
    b.visible = false
    bags.push(b)
    root.add(b)
  }
  // ---- The cat, curled up warm by the fire ----
  const catRoot = new Group()
  catRoot.position.set(...CAT)
  catRoot.rotation.y = 0.5
  catRoot.userData.pick = 'cat'
  catRoot.add(solid(merge([P.sphere(0.16, '#C9C3D6', { at: [0, 0.1, 0], scale: [1.45, 0.72, 1.1] }), ...[-0.06, 0.04].map((x) => P.box(0.03, 0.02, 0.2, '#A39CB6', { at: [x, 0.2, 0], rot: [0.2, 0, 0] }))]), bag, 2))
  const catHead = new Group()
  catHead.position.set(0.2, 0.12, 0.06)
  catHead.add(
    solid(
      merge([
        P.sphere(0.085, '#C9C3D6', { scale: [1, 0.9, 1] }),
        ...[1, -1].map((s) => P.cone(0.035, 0.07, '#C9C3D6', { at: [0, 0.075, s * 0.045], rot: [s * 0.3, 0, 0] }, 6)),
        ...[1, -1].map((s) => P.cone(0.02, 0.04, '#FFB8CC', { at: [0.008, 0.07, s * 0.045], rot: [s * 0.3, 0, 0] }, 6)),
        ...[1, -1].map((s) => P.box(0.008, 0.008, 0.03, PAL.ink, { at: [0.07, 0.015, s * 0.032] })),
        P.sphere(0.012, '#FF9DB8', { at: [0.085, -0.01, 0] }, 8),
      ]),
      bag,
      2,
    ),
  )
  catRoot.add(catHead)
  const catTail = new Group()
  catTail.position.set(-0.2, 0.08, 0)
  catTail.add(solid(P.capsule(0.025, 0.16, '#C9C3D6', { at: [0, 0.02, 0.09], rot: [Math.PI / 2, 0, 0.2] }), bag, 1))
  catRoot.add(catTail)
  catRoot.add(blobShadow(0.3, bag))
  root.add(catRoot)
  // ---- A stack of woven baskets by the well ----
  const baskets = new Group()
  baskets.position.set(...BASKETS)
  baskets.userData.pick = 'baskets'
  baskets.add(solid(merge([0, 1, 2].map((k) => P.cyl(0.2 - k * 0.012, 0.13 - k * 0.01, 0.16, k % 2 ? '#C99A5E' : WICKER, { at: [0.02 * (k % 2), 0.08 + k * 0.11, 0] }, 14))), bag, 2))
  baskets.add(blobShadow(0.3, bag))
  root.add(baskets)
  // ---- The rooster, outside the hut ----
  const rRoot = new Group()
  rRoot.position.set(...ROOSTER)
  rRoot.rotation.y = 0.7
  rRoot.userData.pick = 'rooster'
  rRoot.add(
    solid(
      merge([
        P.sphere(0.14, '#FFF7EC', { at: [0, 0.24, 0], scale: [1.2, 1, 0.9] }),
        ...[0, 1, 2].map((k) => P.cone(0.05, 0.2, ['#5B4A78', '#8F7AC0', '#3F7F6A'][k], { at: [-0.16, 0.36 + k * 0.03, (k - 1) * 0.04], rot: [0, 0, 0.6 + k * 0.25] }, 6)),
        ...[1, -1].map((s) => P.cyl(0.012, 0.012, 0.14, '#FFB43C', { at: [0.02, 0.08, s * 0.05] }, 6)),
        P.sphere(0.07, '#E5A15A', { at: [0.02, 0.24, 0], scale: [1.3, 0.9, 1.25] }),
      ]),
      bag,
      2,
    ),
  )
  const rHead = new Group()
  rHead.position.set(0.12, 0.38, 0)
  rHead.add(
    solid(
      merge([
        P.sphere(0.065, '#FFF7EC'),
        P.cone(0.025, 0.06, '#FFB43C', { at: [0.075, -0.005, 0], rot: [0, 0, -Math.PI / 2] }, 6),
        ...[0, 1, 2].map((k) => P.sphere(0.025, '#FF5A6E', { at: [-0.02 + k * 0.03, 0.065, 0] }, 8)),
        P.sphere(0.02, '#FF5A6E', { at: [0.06, -0.05, 0], scale: [1, 1.5, 0.6] }, 8),
        ...[1, -1].map((s) => P.sphere(0.011, PAL.ink, { at: [0.035, 0.015, s * 0.05] }, 8)),
      ]),
      bag,
      2,
    ),
  )
  rRoot.add(rHead)
  rRoot.add(blobShadow(0.2, bag))
  root.add(rRoot)
  // ---- Outside: the street, the house with the painted couple, the mountains (village.ts) ----
  const village = buildVillage(bag)
  root.add(village.root)
  // ---- The salt aunty, by the pan ----
  const aunty = buildAnimal(SALT_AUNTY, bag)
  aunty.root.position.set(...AUNTY_AT)
  aunty.root.rotation.y = -0.9
  aunty.root.userData.pick = 'aunty'
  root.add(aunty.root)
  return {
    root,
    overhead,
    bucket: { root: bucket, brine: bBrine },
    rope,
    trolley,
    brine,
    salt,
    fire: { flames, glow, embers },
    wood,
    basket: { root: bRoot, heap: bHeap },
    paddle: { root: paddle, load },
    handle,
    bags,
    cat: { root: catRoot, head: catHead, tail: catTail },
    baskets,
    rooster: { root: rRoot, head: rHead },
    mural: village.mural,
    scooter: village.scooter,
    village,
    aunty,
  }
}

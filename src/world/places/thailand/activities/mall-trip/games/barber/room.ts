// The salon, modeled in code in the house's toon look (engine/geo.ts parts): a checkered floor, pale blue walls, the
// big mirror in its bulb frame, the big chair (it pumps up and down and spins round), Kaylee's step stool, the waiting
// bench, and the things to poke: the striped pole (it spins) and the jar of comb water (it bubbles). Greybox: shapes only.
import { Group } from 'three'
import type { Bag } from '../../../../engine/dispose'
import { merge, P, solid } from '../../../../engine/geo'
import { PAL } from '../../../../engine/toon'
import { BENCH, CHAIR, MIRROR, POLE, ROOM, SHELF, STOOL } from './layout'

const WALL = '#DCEBFF'
const CHROME = '#D8D2E6'
const LEATHER = '#FF8FB8'

export interface Room {
  root: Group
  /** The chair: `lift` goes up and down (the pump), `spin` turns (Daddy sits on it). */
  chair: { root: Group; lift: Group; spin: Group }
  /** The mirror's glass (it shines for the reveal) and its bulbs. */
  mirror: { glass: Group; shine: Group; bulbs: Group }
  pole: { root: Group; stripes: Group }
  jar: { root: Group; combs: Group }
}

export function buildRoom(bag: Bag): Room {
  const root = new Group()
  const add = (o: Group) => (root.add(o), o)
  const z = ROOM.back
  // ---- The checkered floor and the walls ----
  const tiles = []
  for (let x = ROOM.x0; x < ROOM.x1; x += 0.5) for (let zz = z; zz < ROOM.front; zz += 0.5) tiles.push(P.box(0.5, 0.02, 0.5, (Math.round((x - ROOM.x0) / 0.5) + Math.round((zz - z) / 0.5)) % 2 ? '#2E2748' : '#FFFFFF', { at: [x + 0.25, -0.01, zz + 0.25] }))
  add(solid(merge(tiles), bag, 0))
  add(solid(merge([
    P.box(ROOM.x1 - ROOM.x0, ROOM.height, 0.2, WALL, { at: [(ROOM.x0 + ROOM.x1) / 2, ROOM.height / 2, z - 0.1] }),
    // A white skirting and a blue stripe of little combs along the wall.
    P.box(ROOM.x1 - ROOM.x0, 0.14, 0.03, '#FFFFFF', { at: [(ROOM.x0 + ROOM.x1) / 2, 0.07, z + 0.01] }),
    P.box(ROOM.x1 - ROOM.x0, 0.1, 0.02, '#8EB6F0', { at: [(ROOM.x0 + ROOM.x1) / 2, 0.75, z + 0.01] }),
  ]), bag, 2))

  // ---- The big mirror: a white frame with round bulbs, the glass a pale sky ----
  const mw = MIRROR.w
  const my = (MIRROR.y0 + MIRROR.y1) / 2
  const mh = MIRROR.y1 - MIRROR.y0
  add(solid(merge([
    P.rbox(mw + 0.22, mh + 0.22, 0.06, 0.08, '#FFFFFF', { at: [MIRROR.x, my, z + 0.02] }),
    P.rbox(mw + 0.5, 0.1, 0.36, 0.04, '#FFFFFF', { at: [MIRROR.x, MIRROR.y0 - 0.12, z + 0.18] }),
  ]), bag, 2))
  const glass = add(solid(P.box(mw, mh, 0.02, '#BFE3FF', { at: [MIRROR.x, my, z + 0.06] }), bag, 0))
  const shine = add(solid(merge([-0.3, -0.12].map((dx, i) => P.box(0.08 - i * 0.03, mh * 0.8, 0.01, '#FFFFFF', { at: [MIRROR.x + dx * mw, my, z + 0.075], rot: [0, 0, 0.5] }))), bag, 0))
  const bulbs = add(solid(merge([
    ...Array.from({ length: 5 }, (_, i) => P.sphere(0.045, PAL.butter, { at: [MIRROR.x - mw / 2 + 0.1 + (i * (mw - 0.2)) / 4, MIRROR.y1 + 0.11, z + 0.07] }, 10)),
    ...[-1, 1].flatMap((s) => Array.from({ length: 4 }, (_, i) => P.sphere(0.045, PAL.butter, { at: [MIRROR.x + s * (mw / 2 + 0.11), MIRROR.y0 + 0.2 + (i * (mh - 0.4)) / 3, z + 0.07] }, 10))),
  ]), bag, 1.5))

  // ---- The chair: a chrome base and pump pedal, a column that lifts, a pink seat with arms and a tall back ----
  const chairRoot = new Group()
  chairRoot.position.set(CHAIR.x, 0, CHAIR.z)
  chairRoot.add(solid(merge([
    P.cyl(0.36, 0.4, 0.06, CHROME, { at: [0, 0.03, 0] }, 24),
    P.rbox(0.16, 0.04, 0.12, 0.02, '#8E95A6', { at: [0.3, 0.07, 0.25], rot: [0, -0.6, 0.2] }),
    P.cyl(0.07, 0.07, 0.3, CHROME, { at: [0, 0.2, 0] }),
  ]), bag, 2))
  const lift = new Group()
  chairRoot.add(lift)
  const spin = new Group()
  lift.add(spin)
  spin.add(solid(merge([
    P.cyl(0.05, 0.05, 0.3, CHROME, { at: [0, CHAIR.seat - 0.22, 0] }),
    P.rbox(0.66, 0.14, 0.58, 0.06, LEATHER, { at: [0, CHAIR.seat - 0.07, 0] }),
    P.rbox(0.66, 0.78, 0.12, 0.06, LEATHER, { at: [0, CHAIR.seat + 0.36, -0.3], rot: [-0.08, 0, 0] }),
    ...[-1, 1].flatMap((s) => [
      P.rbox(0.1, 0.07, 0.5, 0.03, CHROME, { at: [s * 0.38, CHAIR.seat + 0.18, 0] }),
      P.cyl(0.025, 0.025, 0.2, CHROME, { at: [s * 0.38, CHAIR.seat + 0.07, 0.18] }),
    ]),
    P.rbox(0.3, 0.06, 0.14, 0.03, CHROME, { at: [0, CHAIR.seat - 0.3, 0.38] }),
  ]), bag, 2))
  root.add(chairRoot)

  // ---- Kaylee's step stool, the waiting bench, the shelf with the comb jar, the pole ----
  add(solid(merge([
    P.rbox(0.5, STOOL.top, 0.42, 0.05, PAL.mint, { at: [STOOL.x, STOOL.top / 2, STOOL.z] }),
    P.box(0.4, 0.02, 0.32, '#FFFFFF', { at: [STOOL.x, STOOL.top + 0.005, STOOL.z] }),
  ]), bag, 2))
  add(solid(merge([
    P.rbox(1.4, 0.08, 0.42, 0.03, PAL.lavenderDark, { at: [BENCH.x, BENCH.seat, BENCH.z] }),
    P.rbox(1.4, 0.4, 0.07, 0.03, PAL.lavenderDark, { at: [BENCH.x, BENCH.seat + 0.24, BENCH.z - 0.2] }),
    ...[-0.6, 0.6].map((dx) => P.box(0.06, BENCH.seat, 0.3, CHROME, { at: [BENCH.x + dx, BENCH.seat / 2, BENCH.z] })),
  ]), bag, 2))
  add(solid(merge([
    P.rbox(0.7, 0.05, 0.3, 0.02, '#FFFFFF', { at: [SHELF.x, SHELF.y, SHELF.z + 0.1] }),
    P.sphere(0.07, PAL.pink, { at: [SHELF.x + 0.22, SHELF.y + 0.09, SHELF.z + 0.1] }),
    P.cyl(0.04, 0.05, 0.1, '#FFFFFF', { at: [SHELF.x + 0.22, SHELF.y + 0.06, SHELF.z + 0.1] }),
  ]), bag, 2))
  const jar = new Group()
  jar.position.set(SHELF.x - 0.1, SHELF.y + 0.025, SHELF.z + 0.12)
  jar.add(solid(merge([
    P.cyl(0.1, 0.1, 0.26, '#7FC4F5', { at: [0, 0.13, 0] }),
    P.cyl(0.105, 0.105, 0.04, '#2E2748', { at: [0, 0.28, 0] }),
  ]), bag, 2))
  const combs = new Group()
  combs.add(solid(merge([-0.04, 0.03].map((x, i) => P.rbox(0.03, 0.22, 0.012, 0.01, i ? PAL.hotpink : '#2E2748', { at: [x, 0.3, 0], rot: [0, 0, i ? -0.2 : 0.15] }))), bag, 1.5))
  jar.add(combs)
  root.add(jar)
  const pole = new Group()
  pole.position.set(POLE.x, POLE.y, POLE.z)
  pole.add(solid(merge([
    P.cyl(0.12, 0.12, 0.08, CHROME, { at: [0, 0.48, 0] }),
    P.sphere(0.1, CHROME, { at: [0, 0.55, 0] }),
    P.cyl(0.12, 0.12, 0.08, CHROME, { at: [0, -0.48, 0] }),
    P.box(0.06, 0.06, 0.2, CHROME, { at: [0, 0, -0.12] }),
  ]), bag, 2))
  const stripes = new Group()
  const bands = []
  for (let i = 0; i < 9; i++) bands.push(P.cyl(0.095, 0.095, 0.1, ['#FF6B6B', '#FFFFFF', '#74C0FC'][i % 3], { at: [0, -0.4 + i * 0.1, 0], rot: [0, 0, 0.35] }, 14))
  stripes.add(solid(merge(bands), bag, 2))
  pole.add(stripes)
  root.add(pole)

  return { root, chair: { root: chairRoot, lift, spin }, mirror: { glass, shine, bulbs }, pole: { root: pole, stripes }, jar: { root: jar, combs } }
}

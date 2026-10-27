// What gets shared: the pizza's eight slices (each its own toy shape, with the toppings of the pizza she picked), the
// pan on its stand, the three plates (a glow under the one that's behind, a pink ring under the one she's holding a
// slice over) and Agong's take-away box with its lid. Plus the sharing sums: who's behind, where a slice stacks.
import { Group, Mesh, MeshBasicMaterial, Quaternion, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { CHEESE } from './cheese'
import { BOX, EATERS, PAN, PLATE_R, PLATE_Z, SEATS, SLICES, TABLE, type EaterId, type PizzaId } from './layout'

const A = Math.PI / SLICES
/** From the pan's center to a slice's middle (a wedge's centroid). */
export const MID = (2 * PAN.r * Math.sin(A)) / (3 * A)
const CRUST = '#F2C27B'
const RIM = '#E5A457'

export type Where = 'pan' | 'held' | 'fly' | 'plate' | 'box' | 'gone'
export type Target = EaterId | 'box'

export interface Slice {
  i: number
  root: Group
  /** Pivots at the crust: bites shorten the slice from its tip. */
  bite: Group
  where: Where
  owner: Target | null
  bites: number
  /** Its tip, local to root (where the cheese hangs on). */
  tip: Vector3
}

/** A wedge [-A, A] around +z, flat, its middle at the origin (the tip toward -z). */
function wedge(r: number, depth: number, y: number, color: string): BufferGeometry {
  const pts: [number, number][] = [[0, 0]]
  for (let k = 0; k <= 6; k++) {
    const f = -A + (2 * A * k) / 6
    pts.push([r * Math.sin(f), -r * Math.cos(f)])
  }
  return P.prism(pts, depth, color, { at: [0, y, -MID], rot: [-Math.PI / 2, 0, 0] })
}
/** A point on the slice: `rho` from the pan's center, `phi` from the slice's middle line. */
const on = (rho: number, phi: number, y: number): [number, number, number] => [rho * Math.sin(phi), y, rho * Math.cos(phi) - MID]

function toppings(pizza: PizzaId, i: number): BufferGeometry[] {
  // A little different on each slice, so the pizza doesn't look stamped.
  const s = i % 2 ? 1 : -1
  const spots: [number, number][] = [[0.11, 0.12 * s], [0.18, -0.16 * s], [0.23, 0.15 * s], [0.25, -0.02]]
  const out: BufferGeometry[] = []
  spots.forEach(([rho, phi], k) => {
    const at = on(rho, phi, 0.05)
    if (pizza === 'hawaiian') {
      if (k % 2) out.push(P.box(0.04, 0.022, 0.04, '#FFD84D', { at, rot: [0, k, 0] }))
      else out.push(P.cyl(0.032, 0.032, 0.01, '#FF9DB0', { at }, 12))
    } else if (pizza === 'seafood') {
      if (k === 3) out.push(P.sphere(0.014, '#7CCB7A', { at, scale: [1, 0.5, 1] }, 8))
      else if (k === 2) out.push(P.torus(0.022, 0.008, '#FFF6EE', { at, rot: [Math.PI / 2, 0, 0] }))
      else out.push(P.torus(0.024, 0.012, '#FF9A6B', { at, rot: [Math.PI / 2, 0, k * 2] }, Math.PI * 1.25))
    } else {
      // Double cheese: puddles of a second cheese, a little cheddar.
      out.push(P.sphere(k % 2 ? 0.026 : 0.034, k === 1 ? '#FFB347' : '#FFF1A8', { at, scale: [1, 0.35, 1] }, 12))
    }
  })
  return out
}

/** One slice of the pizza she picked. */
export function buildSlice(pizza: PizzaId, i: number, bag: Bag): Slice {
  const root = new Group()
  const bite = new Group()
  // The crust edge is at about PAN.r - MID: the bite pivot sits there.
  const crust = PAN.r - MID
  bite.position.z = crust
  root.add(bite)
  const cheese = pizza === 'cheese' ? '#FFD24A' : CHEESE
  const parts = [
    wedge(PAN.r, 0.026, 0.013, CRUST),
    wedge(PAN.r * 0.9, 0.012, 0.031, cheese),
    ...Array.from({ length: 5 }, (_, k) => P.sphere(0.028, RIM, { at: on(PAN.r * 0.93, -A * 0.8 + (A * 1.6 * k) / 4, 0.032), scale: [1.1, 0.75, 1] }, 10)),
    ...toppings(pizza, i),
  ]
  const model = solid(merge(parts), bag, 1.5)
  model.position.z = -crust
  bite.add(model)
  root.userData.pick = 'pan'
  return { i, root, bite, where: 'pan', owner: null, bites: 0, tip: new Vector3(0, 0.03, -MID + 0.03) }
}

/** Where slice `i` lies in the pan (local to the tray, whose origin is the pan's center on the table). */
export function panHome(i: number, out = new Vector3()) {
  const th = (i + 0.5) * 2 * A
  return out.set(Math.sin(th) * MID, PAN.y - TABLE.top + 0.012, Math.cos(th) * MID)
}
export const panTurn = (i: number) => (i + 0.5) * 2 * A

/** The pan on its little wire stand (the tray the server carries). Its origin is on the table under the pan. */
export function buildTray(bag: Bag) {
  const root = new Group()
  const top = PAN.y - TABLE.top
  root.add(solid(merge([
    P.cyl(PAN.r + 0.04, PAN.r + 0.04, 0.014, '#CFC8E0', { at: [0, top, 0] }, 32),
    P.torus(PAN.r + 0.04, 0.012, '#B8B0CE', { at: [0, top + 0.008, 0], rot: [Math.PI / 2, 0, 0] }),
    P.torus(0.18, 0.008, '#9D94B8', { at: [0, top - 0.03, 0], rot: [Math.PI / 2, 0, 0] }),
    ...[0, 1, 2].map((k) => {
      const a = (k / 3) * Math.PI * 2 + 0.3
      return P.cyl(0.008, 0.008, top, '#9D94B8', { at: [Math.sin(a) * 0.18, top / 2, Math.cos(a) * 0.18] }, 6)
    }),
  ]), bag, 1.5))
  return root
}

export interface Plate {
  id: EaterId
  root: Group
  at: Vector3
  glow: Mesh
  hover: Mesh
}

const ring = (r: number, w: number, color: string, bag: Bag) => {
  const m = new Mesh(bag.add(P.torus(r, w, '#fff', { rot: [Math.PI / 2, 0, 0] })), bag.add(new MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false })))
  m.scale.y = 0.15
  m.renderOrder = 2
  return m
}

export function buildPlates(bag: Bag): Plate[] {
  return EATERS.map((id) => {
    const at = new Vector3(SEATS[id].x, TABLE.top, PLATE_Z)
    const root = new Group()
    root.position.copy(at)
    root.add(solid(merge([
      P.cyl(PLATE_R, PLATE_R * 0.8, 0.02, '#FFFFFF', { at: [0, 0.01, 0] }, 28),
      P.torus(PLATE_R * 0.94, 0.008, PAL.lavender, { at: [0, 0.021, 0], rot: [Math.PI / 2, 0, 0] }),
    ]), bag, 1.5))
    const glow = ring(PLATE_R * 1.12, 0.035, PAL.gold, bag)
    const hover = ring(PLATE_R * 1.2, 0.03, PAL.hotpink, bag)
    glow.position.y = hover.position.y = 0.012
    root.add(glow, hover)
    root.userData.pick = `plate:${id}`
    return { id, root, at, glow, hover }
  })
}

/** Where the k-th slice on a plate goes (they fan out and stack a little), and its turn. */
export function plateSpot(p: Plate, k: number, out = new Vector3()) {
  out.copy(p.at)
  out.x += ((k % 3) - 1) * 0.035
  out.z += 0.02 - (k % 2) * 0.03
  out.y += 0.022 + k * 0.03
  return out
}
export const plateTurn = (k: number) => ((k % 3) - 1) * 0.45

export interface Box {
  root: Group
  lid: Group
  glow: Mesh
  hover: Mesh
  at: Vector3
}

/** Agong's take-away box: white with a green band and a little panda face (Agong) on the front; its lid hinged at the back. */
export function buildBox(bag: Bag): Box {
  const root = new Group()
  const at = new Vector3(BOX.x, TABLE.top, BOX.z)
  root.position.copy(at)
  const { w, h } = BOX
  const t = 0.012
  root.add(solid(merge([
    P.box(w, t, w, '#FFFFFF', { at: [0, t / 2, 0] }),
    P.box(w, h, t, '#FFFFFF', { at: [0, h / 2, w / 2 - t / 2] }),
    P.box(w, h, t, '#FFFFFF', { at: [0, h / 2, -w / 2 + t / 2] }),
    P.box(t, h, w, '#FFFFFF', { at: [w / 2 - t / 2, h / 2, 0] }),
    P.box(t, h, w, '#FFFFFF', { at: [-w / 2 + t / 2, h / 2, 0] }),
    P.box(w + 0.002, 0.018, t + 0.004, '#4DB57A', { at: [0, h * 0.35, w / 2 - t / 2] }),
    // Agong (a panda) on the front.
    P.sphere(0.03, '#FFFFFF', { at: [0.1, h * 0.55, w / 2 + 0.004], scale: [1, 1, 0.3] }),
    ...[-1, 1].map((s) => P.sphere(0.012, '#4A3F4F', { at: [0.1 + s * 0.024, h * 0.55 + 0.026, w / 2 + 0.006], scale: [1, 1, 0.4] })),
    ...[-1, 1].map((s) => P.sphere(0.008, '#4A3F4F', { at: [0.1 + s * 0.011, h * 0.56, w / 2 + 0.014], scale: [1, 1.2, 0.4] })),
  ]), bag, 1.5))
  const lid = new Group()
  lid.position.set(0, h, -w / 2)
  lid.add(solid(merge([
    P.box(w + 0.01, t, w + 0.01, '#FFFFFF', { at: [0, t / 2, w / 2] }),
    // Outside: a green circle; inside (what shows while it's open): pale green.
    P.cyl(0.06, 0.06, 0.006, '#4DB57A', { at: [0, t + 0.004, w / 2] }, 20),
    P.box(w * 0.86, 0.004, w * 0.86, '#BFEBD2', { at: [0, -0.002, w / 2] }),
  ]), bag, 1.5))
  root.add(lid)
  const glow = ring(w * 0.75, 0.035, PAL.gold, bag)
  const hover = ring(w * 0.82, 0.03, PAL.hotpink, bag)
  glow.position.y = hover.position.y = 0.012
  root.add(glow, hover)
  root.userData.pick = 'box'
  return { root, lid, glow, hover, at }
}
export const BOX_OPEN = -2.25
/** Where the k-th slice in the box goes. */
export function boxSpot(b: Box, k: number, out = new Vector3()) {
  return out.copy(b.at).add(new Vector3((k ? 1 : -1) * 0.05, 0.014 + k * 0.024, 0))
}
export const boxTurn = (k: number) => (k ? 0.5 : -0.5)

/** Who's behind: the plates with the fewest slices, if not everyone has the same. */
export function behind(counts: Record<EaterId, number>): EaterId[] {
  const min = Math.min(...EATERS.map((e) => counts[e]))
  const max = Math.max(...EATERS.map((e) => counts[e]))
  return min === max ? [] : EATERS.filter((e) => counts[e] === min)
}

/** Round the table, one each in turn (Mommy, Daddy, Kaylee), as the `shared` link sets it up. */
export const ROUND: EaterId[] = ['ji', 'nick', 'kaylee']

export const turnY = (a: number) => new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), a)

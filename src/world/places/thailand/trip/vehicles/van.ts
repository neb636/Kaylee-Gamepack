// Aunty Sri's van: a quick white electric van (Dad, 2026-10-19), tall and rounded, with a mint stripe and a
// light bar for a face (no grille: it's electric, and it hums instead of putting). The steering wheel is on the right, as
// in every Thai car, so Aunty Sri sits on the right and Daddy beside her; Mommy and Kaylee sit in the middle row. The
// sliding door is on the left, the curb side. Big windows all round, so whoever is inside shows. Faces +z.
import { Group, Mesh, MeshBasicMaterial } from 'three'
import type { Bag } from '../../engine/dispose'
import { merge, P, solid, type V3 } from '../../engine/geo'
import { PAL } from '../../engine/toon'

const BODY = '#FBFAFF'
const TRIM = '#D9D5E6'
const SEAT = '#B9B2CC'
const GLASS = '#CDEBFF'

export interface Van {
  root: Group
  /** Bounces on the road. */
  body: Group
  /** Seat groups (local to `body`) that the family sit in. */
  seats: { kaylee: Group; ji: Group; nick: Group; sri: Group }
  /** The sliding door, shut at `doorAt` (slide it back by `doorTravel` to open it). */
  door: Group
  doorAt: V3
  doorTravel: number
  wheels: Group[]
  /** Where the suitcase goes in (local). */
  trunk: V3
  length: number
}

export function buildVan(bag: Bag): Van {
  const root = new Group()
  const body = new Group()
  root.add(body)
  const L = 4.3
  const W = 1.82
  const parts = [
    // The tub, the mint stripe along it, a soft nose with a light bar, and the bumpers.
    P.rbox(W, 0.7, L, 0.26, BODY, { at: [0, 0.62, 0] }),
    P.box(W + 0.02, 0.07, L - 0.7, PAL.mint, { at: [0, 0.52, -0.1] }),
    P.rbox(W - 0.06, 0.34, 0.7, 0.16, BODY, { at: [0, 1.1, L / 2 - 0.42], rot: [0.32, 0, 0] }),
    P.rbox(W - 0.3, 0.07, 0.06, 0.03, PAL.cream, { at: [0, 0.86, L / 2 + 0.01] }),
    ...[-1, 1].map((s) => P.sphere(0.1, PAL.butter, { at: [s * 0.7, 0.86, L / 2 + 0.01], scale: [1, 0.7, 0.4] })),
    ...[-1, 1].map((s) => P.sphere(0.1, '#FF6F8E', { at: [s * 0.72, 0.9, -L / 2 - 0.01], scale: [0.8, 1.2, 0.4] })),
    P.rbox(W - 0.1, 0.16, 0.18, 0.06, TRIM, { at: [0, 0.35, L / 2 + 0.03] }),
    P.rbox(W - 0.1, 0.16, 0.18, 0.06, TRIM, { at: [0, 0.35, -L / 2 - 0.03] }),
    // The charging flap, a little mint dot on the right side.
    P.sphere(0.07, PAL.mint, { at: [-W / 2 - 0.01, 0.85, -1.4], scale: [0.4, 1, 1] }),
    // Inside: the floor, the front seats, the middle bench, the dashboard and the wheel on the right.
    P.box(W - 0.2, 0.06, L - 0.6, '#8F88A3', { at: [0, 0.6, 0] }),
    ...[-1, 1].flatMap((s) => [P.rbox(0.62, 0.16, 0.55, 0.06, SEAT, { at: [s * 0.44, 0.66, 0.85] }), P.rbox(0.62, 0.66, 0.14, 0.06, SEAT, { at: [s * 0.44, 1.0, 0.55], rot: [-0.12, 0, 0] })]),
    P.rbox(W - 0.26, 0.16, 0.6, 0.06, SEAT, { at: [0, 0.66, -0.45] }),
    P.rbox(W - 0.26, 0.64, 0.14, 0.06, SEAT, { at: [0, 1.0, -0.8], rot: [-0.12, 0, 0] }),
    P.rbox(W - 0.14, 0.24, 0.4, 0.08, TRIM, { at: [0, 1.06, 1.45] }),
    P.torus(0.16, 0.025, PAL.ink, { at: [-0.44, 1.2, 1.22], rot: [-0.5, 0, 0] }),
    // The roof, and the pillars that hold it up.
    P.rbox(W - 0.02, 0.14, L - 0.75, 0.07, BODY, { at: [0, 2.0, -0.32] }),
    ...[-1, 1].flatMap((s) => [-L / 2 + 0.12, -0.15, 0.95, 1.5].map((z, i) => P.box(0.09, i === 3 ? 0.78 : 0.98, 0.1, BODY, { at: [s * (W / 2 - 0.05), i === 3 ? 1.48 : 1.46, z], rot: i === 3 ? [-0.5, 0, 0] : [0, 0, 0] }))),
  ]
  body.add(solid(merge(parts), bag, 2))
  // Big windows all round (see-through, so the family shows inside).
  const glassMat = bag.add(new MeshBasicMaterial({ color: GLASS, transparent: true, opacity: 0.3, depthWrite: false }))
  const glass = [
    ...[-1, 1].map((s) => P.box(0.02, 0.92, 2.95, '#FFFFFF', { at: [s * (W / 2 - 0.05), 1.46, -0.35] })),
    P.box(W - 0.2, 0.86, 0.02, '#FFFFFF', { at: [0, 1.5, -L / 2 + 0.12] }),
    P.box(W - 0.2, 0.8, 0.02, '#FFFFFF', { at: [0, 1.5, 1.52], rot: [-0.5, 0, 0] }),
  ]
  for (const g of glass) body.add(new Mesh(bag.add(g), glassMat))

  // The sliding door on the left (curb) side: it slides back along the van to open.
  const door = new Group()
  const doorAt: V3 = [W / 2 + 0.035, 0, 0.35]
  door.position.set(...doorAt)
  door.add(solid(merge([P.rbox(0.05, 0.62, 1.0, 0.04, BODY, { at: [0, 0.66, 0] }), P.box(0.06, 0.07, 1.0, PAL.mint, { at: [0, 0.52, 0] }), P.box(0.07, 0.04, 0.16, TRIM, { at: [0.01, 0.82, -0.35] })]), bag, 2))
  door.add(new Mesh(bag.add(P.box(0.02, 0.82, 0.96, '#FFFFFF', { at: [0, 1.44, 0] })), glassMat))
  body.add(door)

  const wheels: Group[] = []
  for (const [x, z] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const w = new Group()
    w.position.set(x * (W / 2 - 0.12), 0.3, z * (L / 2 - 0.68))
    w.add(solid(merge([P.torus(0.25, 0.1, PAL.ink, { rot: [0, Math.PI / 2, 0] }), P.cyl(0.13, 0.13, 0.08, '#EDEAF5', { rot: [0, 0, Math.PI / 2] }), P.box(0.1, 0.32, 0.05, PAL.mint, { at: [x * 0.03, 0, 0] })]), bag, 2))
    body.add(w)
    wheels.push(w)
  }

  const seat = (x: number, z: number) => {
    const g = new Group()
    g.position.set(x, 0.74, z)
    body.add(g)
    return g
  }
  const seats = { sri: seat(-0.44, 0.88), nick: seat(0.44, 0.88), ji: seat(-0.45, -0.42), kaylee: seat(0.45, -0.42) }

  return { root, body, seats, door, doorAt, doorTravel: 1.0, wheels, trunk: [0, 1.0, -L / 2 + 0.45], length: L }
}

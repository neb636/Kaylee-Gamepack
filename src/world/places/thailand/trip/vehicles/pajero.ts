// The family's rental for the Nan road trip (Dad, 2026-10-24): a silver Mitsubishi Pajero Sport, the big seven-seat
// SUV that's made in Thailand. GREYBOX (plan: thailand/nan-trip.md, step 1): a chunky toy box in the house's toon look,
// tall and square with big wheels, roof rails and a black face, enough to steer and to read as "the big car". The real
// model (modelled on veloz.ts, with doors and the family inside) is the look step. Faces +z. Right-hand drive.
//
// root (where it is, which way it faces) > tilt (the road's slope) > body (leans out on bends, squats when it brakes,
// bounces): the drive moves each.
import { Group, Mesh, MeshBasicMaterial } from 'three'
import type { Bag } from '../../engine/dispose'
import { blobShadow, merge, P, solid } from '../../engine/geo'
import { PAL } from '../../engine/toon'

const SILVER = '#C9CDD8'
const SHADE = '#A9AEBC'
const TRIM = '#3E3849'
const GLASS = '#BFE2FA'

export interface Pajero {
  root: Group
  tilt: Group
  body: Group
  wheels: Group[]
  /** The headlights' color (they come on in the cloud, and wink when she taps the car). */
  lamps: MeshBasicMaterial
  /** Soft beams of light ahead, for the cloud. */
  beams: Mesh
  length: number
  width: number
}

export function buildPajero(bag: Bag): Pajero {
  const root = new Group()
  const tilt = new Group()
  const body = new Group()
  root.add(tilt)
  tilt.add(body)
  const W = 1.95
  const L = 4.8
  const parts = [
    // The tall body and the cabin on it.
    P.rbox(W, 0.95, L, 0.22, SILVER, { at: [0, 1.0, 0] }),
    P.rbox(W - 0.14, 0.78, 2.9, 0.18, SILVER, { at: [0, 1.82, -0.45] }),
    // Windows all round (the windshield leans back).
    P.box(W - 0.32, 0.62, 0.05, GLASS, { at: [0, 1.82, 1.03], rot: [-0.32, 0, 0] }),
    P.box(W - 0.32, 0.55, 0.05, GLASS, { at: [0, 1.85, -1.91] }),
    ...[-1, 1].flatMap((s) => [P.box(0.05, 0.5, 1.2, GLASS, { at: [s * (W / 2 - 0.06), 1.86, 0.25] }), P.box(0.05, 0.5, 1.15, GLASS, { at: [s * (W / 2 - 0.06), 1.86, -1.1] })]),
    // The black face: the big grille, the headlight bezels, the bumper and the skid plate.
    P.rbox(1.3, 0.42, 0.08, 0.05, TRIM, { at: [0, 1.08, L / 2 + 0.01] }),
    ...[0.98, 1.12, 1.24].map((y) => P.box(1.18, 0.03, 0.04, SHADE, { at: [0, y, L / 2 + 0.05] })),
    P.rbox(W + 0.02, 0.3, 0.2, 0.08, TRIM, { at: [0, 0.6, L / 2 - 0.04] }),
    P.rbox(1.0, 0.08, 0.1, 0.03, '#E8EAF2', { at: [0, 0.44, L / 2 + 0.02] }),
    // The tail: red lamps up the corners, the bumper.
    ...[-1, 1].map((s) => P.rbox(0.2, 0.5, 0.08, 0.04, '#FF5C7A', { at: [s * (W / 2 - 0.16), 1.2, -L / 2 - 0.01] })),
    P.rbox(W + 0.02, 0.3, 0.2, 0.08, TRIM, { at: [0, 0.6, -L / 2 + 0.04] }),
    // Black wheel arches, the side sills, the roof rails, the mirrors.
    ...[-1, 1].flatMap((s) => [1.5, -1.5].map((z) => P.torus(0.56, 0.08, TRIM, { at: [s * (W / 2 + 0.01), 0.62, z], rot: [0, -Math.PI / 2, 0] }, Math.PI))),
    ...[-1, 1].map((s) => P.box(0.08, 0.14, 2.3, TRIM, { at: [s * (W / 2 + 0.02), 0.6, 0] })),
    ...[-1, 1].map((s) => P.box(0.07, 0.07, 2.6, TRIM, { at: [s * (W / 2 - 0.22), 2.27, -0.45] })),
    ...[-1, 1].map((s) => P.rbox(0.24, 0.18, 0.14, 0.05, SILVER, { at: [s * (W / 2 + 0.12), 1.6, 0.95] })),
    // Inside, the wheel on the right (Thailand keeps left).
    P.torus(0.17, 0.03, PAL.ink, { at: [-0.45, 1.62, 0.65], rot: [-0.5, 0, 0] }),
  ]
  body.add(solid(merge(parts), bag, 2))
  const lamps = bag.add(new MeshBasicMaterial({ color: '#FFF4CC' }))
  for (const s of [-1, 1]) body.add(new Mesh(bag.add(P.rbox(0.36, 0.16, 0.08, 0.05, '#ffffff', { at: [s * 0.74, 1.12, L / 2 + 0.02] })), lamps))
  // Two soft cones of light reaching ahead (only in the cloud).
  const beamMat = bag.add(new MeshBasicMaterial({ color: '#FFF6D6', transparent: true, opacity: 0.28, depthWrite: false }))
  const beams = new Mesh(bag.add(merge([-1, 1].map((s) => P.cone(1.6, 11, '#ffffff', { at: [s * 0.74, 1.0, L / 2 + 5.6], rot: [-Math.PI / 2, 0, 0] }, 12)))), beamMat)
  beams.visible = false
  body.add(beams)

  const wheels: Group[] = []
  for (const [x, z] of [[-1, 1.5], [1, 1.5], [-1, -1.5], [1, -1.5]]) {
    const w = new Group()
    w.position.set(x * (W / 2 - 0.12), 0.45, z)
    w.add(solid(merge([P.torus(0.33, 0.13, PAL.ink, { rot: [0, Math.PI / 2, 0] }), P.cyl(0.24, 0.24, 0.2, '#D9DCE8', { rot: [0, 0, Math.PI / 2] }), P.box(0.22, 0.06, 0.4, SHADE, { at: [x * 0.05, 0, 0] })]), bag, 2))
    tilt.add(w)
    wheels.push(w)
  }
  root.add(blobShadow(2.6, bag))
  return { root, tilt, body, wheels, lamps, beams, length: L, width: W }
}

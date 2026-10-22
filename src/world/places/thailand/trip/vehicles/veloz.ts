// Mommy's rental car for the mall day (Dad, 2026-10-20): a silver Toyota Veloz, a 7-seat MPV. A toy model in the
// house's look, built like Aunty Sri's van (van.ts): a long sloping hood, a raked windshield, a long roof with roof
// rails, a near-upright tailgate with the full-width light bar across it, black cladding round the wheels, and four
// hinged doors. Right-hand drive, as in every Thai car: Mommy drives on the right, Daddy sits in front beside her and
// Kaylee in the back by the window. Big see-through windows, so whoever is inside shows. Faces +z. The roof is high
// enough for Daddy's horn with everyone sitting up (a toy's proportions, not the real 1.7 m).
import { Group, Mesh, MeshBasicMaterial } from 'three'
import type { Bag } from '../../engine/dispose'
import { merge, P, solid, type V3 } from '../../engine/geo'
import { PAL } from '../../engine/toon'

const SILVER = '#D6D9E3'
const SHADE = '#B4B9C8'
const CLAD = '#4A4458'
const SEAT = '#6E6880'
const GLASS = '#CDEBFF'
const LIGHT = '#FF5C7A'

export type DoorId = 'fr' | 'fl' | 'rr' | 'rl'

export interface Veloz {
  root: Group
  /** Bounces on the road. */
  body: Group
  /** Seat groups (local to `body`): Mommy at the wheel on the right, Daddy beside her, Kaylee in the back by the
   *  window, and a spare back seat. */
  seats: { driver: Group; nick: Group; kaylee: Group; spare: Group }
  /** The four hinged doors, each pivoting at its front edge (rotation.y). */
  doors: Record<DoorId, Group>
  /** Swings the doors open (1) or shut (0): the front pair and Kaylee's back door. */
  setDoors(k: number): void
  wheels: Group[]
  /** Where shopping (or a pizza box) goes in (local). */
  trunk: V3
  length: number
}

export function buildVeloz(bag: Bag): Veloz {
  const root = new Group()
  const body = new Group()
  root.add(body)
  const L = 4.5
  const W = 1.84
  const ROOF = 2.38
  // The side profile (z along the car, y up), pushed across its width: bumper to hood, hood up to the windshield's
  // foot, along the waist to the tailgate. The doors are the skin in between, so the tub is a little narrower.
  const side = (pts: [number, number][], w: number, c: string) => P.prism(pts, w, c, { rot: [0, -Math.PI / 2, 0] })
  const tub: [number, number][] = [[-2.2, 0.3], [2.18, 0.3], [2.28, 0.52], [2.22, 0.9], [1.25, 1.12], [-2.18, 1.14], [-2.27, 0.72]]
  // The windshield's foot and top, the roof's ends.
  const ws = { z0: 1.25, y0: 1.12, z1: 0.42, y1: ROOF - 0.05 }
  const tilt = Math.atan2(ws.z0 - ws.z1, ws.y1 - ws.y0)
  const wsLen = Math.hypot(ws.z0 - ws.z1, ws.y1 - ws.y0)
  const wsMid: V3 = [0, (ws.y0 + ws.y1) / 2, (ws.z0 + ws.z1) / 2]
  const parts = [
    side(tub, W - 0.1, SILVER),
    // Front fenders and rear quarters, full width (the doors sit between them).
    P.rbox(W, 0.8, 1.15, 0.14, SILVER, { at: [0, 0.72, 1.62] }),
    P.rbox(W, 0.82, 1.0, 0.14, SILVER, { at: [0, 0.73, -1.72] }),
    // Black cladding along the bottom and round the wheels, the bumpers.
    P.box(W + 0.02, 0.12, L - 0.2, CLAD, { at: [0, 0.36, 0] }),
    P.rbox(W - 0.06, 0.2, 0.22, 0.08, CLAD, { at: [0, 0.4, L / 2 + 0.02] }),
    P.rbox(W - 0.06, 0.2, 0.22, 0.08, CLAD, { at: [0, 0.42, -L / 2 - 0.02] }),
    // The face: a dark grille, slim headlights swept back, a butter glow.
    P.rbox(1.1, 0.22, 0.06, 0.05, CLAD, { at: [0, 0.66, L / 2 + 0.05] }),
    ...[-1, 1].map((s) => P.rbox(0.42, 0.09, 0.08, 0.04, PAL.butter, { at: [s * 0.66, 0.86, L / 2 - 0.02], rot: [0, s * -0.25, s * 0.08] })),
    // The tail: the full-width light bar across the tailgate, the lamps at its ends.
    P.rbox(W - 0.12, 0.08, 0.06, 0.03, LIGHT, { at: [0, 1.14, -L / 2 - 0.03] }),
    ...[-1, 1].map((s) => P.rbox(0.18, 0.3, 0.07, 0.04, LIGHT, { at: [s * (W / 2 - 0.12), 1.0, -L / 2 - 0.02] })),
    P.box(0.5, 0.14, 0.03, SHADE, { at: [0, 0.82, -L / 2 - 0.04] }),
    // Inside: the floor, the front seats, the middle bench, the dashboard and the wheel on the right.
    P.box(W - 0.24, 0.06, L - 0.9, '#8F88A3', { at: [0, 0.5, -0.1] }),
    ...[-1, 1].flatMap((s) => [P.rbox(0.6, 0.14, 0.55, 0.06, SEAT, { at: [s * 0.42, 0.55, 0.38] }), P.rbox(0.6, 0.7, 0.14, 0.06, SEAT, { at: [s * 0.42, 0.92, 0.08], rot: [-0.12, 0, 0] })]),
    P.rbox(W - 0.3, 0.14, 0.58, 0.06, SEAT, { at: [0, 0.55, -0.78] }),
    P.rbox(W - 0.3, 0.68, 0.14, 0.06, SEAT, { at: [0, 0.92, -1.1], rot: [-0.12, 0, 0] }),
    P.rbox(W - 0.18, 0.24, 0.4, 0.08, SHADE, { at: [0, 1.0, 1.08] }),
    P.torus(0.16, 0.025, PAL.ink, { at: [-0.42, 1.18, 0.86], rot: [-0.5, 0, 0] }),
    // The roof, the pillars, and the roof rails on their feet.
    P.rbox(W - 0.04, 0.12, 2.6, 0.06, SILVER, { at: [0, ROOF, -0.85] }),
    ...[-1, 1].flatMap((s) => [
      P.box(0.09, ROOF - 1.12, 0.12, SILVER, { at: [s * (W / 2 - 0.05), (ROOF + 1.12) / 2, -0.12] }),
      P.box(0.09, ROOF - 1.12, 0.16, SILVER, { at: [s * (W / 2 - 0.05), (ROOF + 1.12) / 2, -2.1] }),
      P.box(0.09, wsLen, 0.1, SILVER, { at: [s * (W / 2 - 0.05), wsMid[1], wsMid[2]], rot: [-tilt, 0, 0] }),
      P.box(0.06, 0.05, 2.3, CLAD, { at: [s * (W / 2 - 0.2), ROOF + 0.14, -0.85] }),
      ...[0.2, -1.95].map((z) => P.box(0.06, 0.1, 0.12, CLAD, { at: [s * (W / 2 - 0.2), ROOF + 0.08, z] })),
      // The wing mirrors.
      P.rbox(0.18, 0.12, 0.1, 0.04, SILVER, { at: [s * (W / 2 + 0.07), 1.25, 1.15] }),
    ]),
    // The tailgate's top above its window.
    P.box(W - 0.1, 0.12, 0.08, SILVER, { at: [0, ROOF - 0.08, -2.17] }),
  ]
  body.add(solid(merge(parts), bag, 2))
  // Big windows all round (see-through, so the family shows inside).
  const glassMat = bag.add(new MeshBasicMaterial({ color: GLASS, transparent: true, opacity: 0.3, depthWrite: false }))
  const glass = [
    P.box(W - 0.16, wsLen, 0.02, '#FFFFFF', { at: wsMid, rot: [-tilt, 0, 0] }),
    P.box(W - 0.2, ROOF - 1.2, 0.02, '#FFFFFF', { at: [0, (ROOF + 1.2) / 2, -2.18] }),
    // The quarter windows behind the back doors.
    ...[-1, 1].map((s) => P.box(0.02, ROOF - 1.24, 0.8, '#FFFFFF', { at: [s * (W / 2 - 0.05), (ROOF + 1.2) / 2, -1.65] })),
  ]
  for (const g of glass) body.add(new Mesh(bag.add(g), glassMat))

  // The four hinged doors: a silver panel with a dark seam and a handle, a window above it. Each pivots at its front
  // edge, out from the side it's on.
  const door = (s: number, front: number, len: number): Group => {
    const g = new Group()
    g.position.set(s * (W / 2 + 0.01), 0, front)
    g.add(solid(merge([
      P.rbox(0.06, 0.74, len, 0.04, SILVER, { at: [0, 0.74, -len / 2] }),
      P.box(0.065, 0.03, len, SHADE, { at: [0, 0.98, -len / 2] }),
      P.box(0.07, 0.04, 0.16, CLAD, { at: [s * 0.01, 0.86, -len + 0.22] }),
      // The window frame.
      P.box(0.05, 0.05, len, SILVER, { at: [0, ROOF - 0.08, -len / 2] }),
    ]), bag, 2))
    g.add(new Mesh(bag.add(P.box(0.02, ROOF - 1.2, len - 0.08, '#FFFFFF', { at: [0, (ROOF + 1.12) / 2, -len / 2] })), glassMat))
    body.add(g)
    return g
  }
  // (Local -x is the car's right: the driver's side.)
  const doors: Record<DoorId, Group> = { fr: door(-1, 1.04, 1.12), fl: door(1, 1.04, 1.12), rr: door(-1, -0.1, 1.0), rl: door(1, -0.1, 1.0) }
  const setDoors = (k: number) => {
    // Out from each side: the right ones swing toward -x, the left ones toward +x. Kaylee's spare-side door stays shut.
    doors.fr.rotation.y = 1.05 * k
    doors.fl.rotation.y = -1.05 * k
    doors.rl.rotation.y = -1.0 * k
    doors.rr.rotation.y = 0
  }

  const wheels: Group[] = []
  for (const [x, z] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const w = new Group()
    w.position.set(x * (W / 2 - 0.14), 0.32, z * (L / 2 - 0.78))
    w.add(solid(merge([P.torus(0.24, 0.1, PAL.ink, { rot: [0, Math.PI / 2, 0] }), P.cyl(0.15, 0.15, 0.08, '#EDEAF5', { rot: [0, 0, Math.PI / 2] }), ...[0, 1, 2].map((i) => P.box(0.09, 0.28, 0.04, SHADE, { at: [x * 0.03, 0, 0], rot: [(i * Math.PI) / 3, 0, 0] }))]), bag, 2))
    body.add(w)
    wheels.push(w)
  }

  const seat = (x: number, z: number) => {
    const g = new Group()
    g.position.set(x, 0.62, z)
    body.add(g)
    return g
  }
  const seats = { driver: seat(-0.42, 0.4), nick: seat(0.42, 0.4), kaylee: seat(0.45, -0.75), spare: seat(-0.45, -0.75) }

  return { root, body, seats, doors, setDoors, wheels, trunk: [0, 0.9, -L / 2 + 0.4], length: L }
}

// Mommy's rental car for the mall day (Dad, 2026-10-20; grey since 2026-10-22): a grey Toyota Veloz, a 7-seat MPV. A
// toy model in the house's look that still reads as the real car: the Veloz's face (slim swept headlights joined by a
// piano-black bar with the Toyota badge, the big trapezoid lower grille, black corner intakes, a silver skid plate),
// its "floating" roof (black pillars all round, the rear quarter window kicking up into a black D-pillar), round wheel
// arches over big two-tone alloys, roof rails and a shark-fin aerial, and at the back the full-width light bar across
// the tailgate with the tail lamps wrapping round the corners. Four hinged doors. Right-hand drive, as in every Thai
// car: Mommy drives on the right, Daddy sits in front beside her and Kaylee in the back by the window. Big see-through
// windows, so whoever is inside shows. Faces +z. The roof is high enough for Daddy's horn with everyone sitting up (a
// toy's proportions, not the real 1.7 m).
import { Group, Mesh, MeshBasicMaterial } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid, type V3 } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'

const GREY = '#A9ADB8'
const SHADE = '#8E929F'
const CHROME = '#EEF0F6'
const TRIM = '#3E3849'
const CLAD = '#4A4458'
const SEAT = '#6E6880'
const GLASS = '#CDEBFF'
const LIGHT = '#FF5C7A'
const LAMP = '#FFF8D6'

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

type Pt = [number, number]

export function buildVeloz(bag: Bag): Veloz {
  const root = new Group()
  const body = new Group()
  root.add(body)
  const L = 4.5
  const W = 1.84
  const ROOF = 2.38
  // The side profile is drawn in (z along the car, y up) and pushed across the car's width.
  const side = (pts: Pt[], w: number, c: string, x = 0) => P.prism(pts, w, c, { at: [x, 0, 0], rot: [0, -Math.PI / 2, 0] })
  // A face drawn in (x across, y up), pushed along the car at z.
  const face = (pts: Pt[], d: number, c: string, z: number) => P.prism(pts, d, c, { at: [0, 0, z] })
  const BOTTOM = 0.34
  const WHEEL = { r: 0.4, front: 1.5, rear: -1.5 }
  const ARCH = { r: 0.5, y: 0.42 }
  // A wheel arch, from its back end over the top to its front end (or the other way round).
  const arch = (zc: number, frontToBack = false): Pt[] =>
    Array.from({ length: 11 }, (_, i) => {
      const a = (i / 10) * Math.PI
      return [zc + (frontToBack ? 1 : -1) * ARCH.r * Math.cos(a), ARCH.y + ARCH.r * Math.sin(a)]
    })
  // The window line rises gently from the windshield to the back doors, then the quarter window kicks up.
  const belt = (z: number) => 1.18 + ((1.25 - z) * 0.08) / 2.65
  // The crease along the doors, rising to the back.
  const crease = (z: number) => 0.64 + ((1 - z) * 0.1) / 2
  const KICK = { z0: -1.4, z1: -1.92, y: 1.52 }
  const TOP = ROOF - 0.1
  // The windshield's foot and top; the A-pillar runs along its edges.
  const ws = { z0: 1.25, y0: 1.18, z1: 0.55, y1: ROOF - 0.05 }
  const tilt = Math.atan2(ws.z0 - ws.z1, ws.y1 - ws.y0)
  const wsLen = Math.hypot(ws.z0 - ws.z1, ws.y1 - ws.y0)
  const wsMid: V3 = [0, (ws.y0 + ws.y1) / 2, (ws.z0 + ws.z1) / 2]
  const aPillarZ = (y: number) => ws.z0 - ((y - ws.y0) * (ws.z0 - ws.z1)) / (ws.y1 - ws.y0)
  const DOOR = { front: { hinge: 0.98, len: 1.02 }, rear: { hinge: -0.1, len: 0.88 } }
  const B_Z = (DOOR.front.hinge - DOOR.front.len + DOOR.rear.hinge) / 2
  const C_Z = DOOR.rear.hinge - DOOR.rear.len
  // Where the A-pillar meets the front door's leading edge (the top of the little black sail).
  const SAIL_Y = ws.y0 + ((ws.z0 - DOOR.front.hinge) * (ws.y1 - ws.y0)) / (ws.z0 - ws.z1)

  // The nose block, full width: front bumper, the hood, the front fenders round the front arch.
  const nose: Pt[] = [
    [0.96, 0.46], [1.0, BOTTOM + 0.04], ...arch(WHEEL.front), [2.0, BOTTOM], [2.08, BOTTOM], [2.22, 0.4], [2.28, 0.58], [2.29, 0.9],
    [2.24, 1.04], [2.0, 1.12], [ws.z0, ws.y0], [0.96, belt(0.96)],
  ]
  // The rear quarters (each side) round the rear arch, up to the kicked-up window line.
  const quarter: Pt[] = [
    [C_Z, belt(C_Z)], [C_Z, 0.46], [C_Z - 0.02, BOTTOM + 0.04], ...arch(WHEEL.rear, true), [-2.0, BOTTOM], [-2.2, BOTTOM], [-2.27, 0.52],
    [-2.27, 1.0], [-2.23, KICK.y], [KICK.z1, KICK.y], [KICK.z0, belt(KICK.z0)],
  ]
  // The back: bumper and tailgate up to the rear window.
  const tail: Pt[] = [[-2.02, BOTTOM], [-2.2, BOTTOM], [-2.27, 0.52], [-2.27, 1.0], [-2.23, KICK.y + 0.02], [-2.02, KICK.y + 0.02]]
  // The big trapezoid lower grille, wider at the bottom.
  const grille: Pt[] = [[-0.6, 0.44], [0.6, 0.44], [0.47, 0.78], [-0.47, 0.78]]
  const toyota = (at: V3, k = 1) => [
    P.torus(0.07 * k, 0.012 * k, CHROME, { at, scale: [1.4, 1, 0.5] }),
    P.torus(0.045 * k, 0.01 * k, CHROME, { at, scale: [1.5, 0.55, 0.5] }),
    P.torus(0.04 * k, 0.01 * k, CHROME, { at: [at[0], at[1] - 0.01 * k, at[2]], scale: [0.5, 1.2, 0.5] }),
  ]
  const FRONT = 2.29
  const BACK = -2.27
  const parts = [
    side(nose, W, GREY),
    ...[-1, 1].map((s) => side(quarter, 0.1, GREY, s * (W / 2 - 0.05))),
    side(tail, W - 0.1, GREY),
    // Dark wheel wells behind the wheels, the cabin floor, the sills under the doors.
    ...[WHEEL.front, WHEEL.rear].map((z) => P.box(W - 0.56, 0.5, 1.0, TRIM, { at: [0, 0.55, z] })),
    P.box(W - 0.16, 0.08, 3.3, '#8F88A3', { at: [0, 0.5, -0.45] }),
    P.box(W + 0.02, 0.12, DOOR.front.hinge - C_Z, CLAD, { at: [0, BOTTOM + 0.06, (DOOR.front.hinge + C_Z) / 2] }),
    // Black flares round the arches.
    ...[-1, 1].flatMap((s) => [WHEEL.front, WHEEL.rear].map((z) => P.torus(ARCH.r + 0.02, 0.05, CLAD, { at: [s * (W / 2 - 0.01), ARCH.y, z], rot: [0, -Math.PI / 2, 0], scale: [1, 1, 0.8] }, Math.PI))),
    // The face: piano-black bar joining the slim swept headlights, the Toyota badge in it, the LED brows.
    P.rbox(1.0, 0.12, 0.06, 0.04, TRIM, { at: [0, 0.95, FRONT - 0.01] }),
    ...toyota([0, 0.95, FRONT + 0.03]),
    ...[-1, 1].flatMap((s) => [
      P.rbox(0.44, 0.13, 0.12, 0.05, LAMP, { at: [s * 0.66, 0.95, FRONT - 0.06], rot: [0, s * 0.3, s * 0.12] }),
      P.box(0.36, 0.025, 0.04, CHROME, { at: [s * 0.68, 1.02, FRONT - 0.02], rot: [0, s * 0.3, s * 0.12] }),
      // The black corner intakes with a fog lamp and a silver slash.
      P.rbox(0.2, 0.3, 0.06, 0.05, TRIM, { at: [s * 0.78, 0.6, FRONT - 0.03], rot: [0, s * 0.25, 0] }),
      P.rbox(0.1, 0.06, 0.05, 0.025, LAMP, { at: [s * 0.79, 0.53, FRONT], rot: [0, s * 0.25, 0] }),
      P.box(0.04, 0.26, 0.04, CHROME, { at: [s * 0.66, 0.62, FRONT + 0.005], rot: [0, 0, s * -0.35] }),
    ]),
    // The big lower grille: black, with dark slats; the silver skid plate under it.
    face(grille, 0.06, TRIM, FRONT - 0.03),
    ...[0.52, 0.61, 0.7].map((y) => P.box(1.06 - (y - 0.44) * 0.78, 0.025, 0.04, CLAD, { at: [0, y, FRONT + 0.01] })),
    P.rbox(0.9, 0.06, 0.06, 0.03, CHROME, { at: [0, 0.4, FRONT - 0.07] }),
    // The tail: the smoked full-width light bar with its red line, the tail lamps wrapping round the corners, the
    // badge, the plate's recess, the black bumper with its silver garnish and red reflectors.
    P.rbox(W - 0.08, 0.13, 0.06, 0.04, TRIM, { at: [0, 1.3, BACK + 0.01] }),
    P.box(W - 0.4, 0.03, 0.04, LIGHT, { at: [0, 1.3, BACK - 0.02] }),
    ...[-1, 1].flatMap((s) => [
      P.rbox(0.26, 0.3, 0.06, 0.04, LIGHT, { at: [s * (W / 2 - 0.15), 1.26, BACK - 0.01] }),
      P.rbox(0.06, 0.22, 0.3, 0.03, LIGHT, { at: [s * (W / 2 - 0.01), 1.28, BACK + 0.14] }),
      P.rbox(0.12, 0.04, 0.04, 0.02, LIGHT, { at: [s * 0.62, 0.5, BACK - 0.06] }),
    ]),
    ...toyota([0, 1.12, BACK - 0.02], 0.85),
    P.box(0.56, 0.18, 0.04, SHADE, { at: [0, 0.88, BACK] }),
    P.rbox(W - 0.06, 0.22, 0.12, 0.06, CLAD, { at: [0, 0.44, BACK + 0.02] }),
    P.rbox(0.8, 0.05, 0.05, 0.02, CHROME, { at: [0, 0.4, BACK - 0.04] }),
    // Inside: the front seats, the middle bench, the dashboard and the wheel on the right.
    ...[-1, 1].flatMap((s) => [P.rbox(0.6, 0.14, 0.55, 0.06, SEAT, { at: [s * 0.42, 0.55, 0.38] }), P.rbox(0.6, 0.7, 0.14, 0.06, SEAT, { at: [s * 0.42, 0.92, 0.08], rot: [-0.12, 0, 0] })]),
    P.rbox(W - 0.3, 0.14, 0.58, 0.06, SEAT, { at: [0, 0.55, -0.78] }),
    P.rbox(W - 0.3, 0.68, 0.14, 0.06, SEAT, { at: [0, 0.92, -1.1], rot: [-0.12, 0, 0] }),
    P.rbox(W - 0.18, 0.26, 0.4, 0.08, TRIM, { at: [0, 1.02, 1.1] }),
    P.torus(0.16, 0.025, PAL.ink, { at: [-0.42, 1.18, 0.86], rot: [-0.5, 0, 0] }),
    // The roof (body colour, floating on black pillars), the spoiler with its stop lamp, the roof rails and the aerial.
    P.rbox(W - 0.04, 0.12, 2.82, 0.06, GREY, { at: [0, ROOF, -0.84] }),
    P.rbox(W - 0.12, 0.07, 0.2, 0.035, GREY, { at: [0, ROOF - 0.02, -2.24], rot: [0.12, 0, 0] }),
    P.box(0.36, 0.03, 0.03, LIGHT, { at: [0, ROOF - 0.06, -2.34] }),
    P.rbox(0.08, 0.1, 0.24, 0.04, TRIM, { at: [0, ROOF + 0.1, -1.95] }),
    ...[-1, 1].flatMap((s) => [
      // The A-pillar, the B-pillar between the doors, the C-pillar behind the back door, the D-pillar at the back.
      P.box(0.09, wsLen, 0.1, TRIM, { at: [s * (W / 2 - 0.05), wsMid[1], wsMid[2]], rot: [-tilt, 0, 0] }),
      P.box(0.08, TOP - belt(B_Z) + 0.06, 0.12, TRIM, { at: [s * (W / 2 - 0.05), (TOP + belt(B_Z)) / 2, B_Z] }),
      P.box(0.08, TOP - belt(C_Z) + 0.06, 0.08, TRIM, { at: [s * (W / 2 - 0.05), (TOP + belt(C_Z)) / 2, C_Z - 0.02] }),
      side([[KICK.z1, KICK.y], [BACK + 0.04, KICK.y], [BACK + 0.04, TOP + 0.04], [KICK.z1 + 0.06, TOP + 0.04]], 0.1, TRIM, s * (W / 2 - 0.05)),
      // The little black sail between the windshield and the front door, with the wing mirror on it.
      side([[ws.z0, ws.y0], [DOOR.front.hinge, belt(DOOR.front.hinge)], [DOOR.front.hinge, SAIL_Y]], 0.1, TRIM, s * (W / 2 - 0.05)),
      P.box(0.16, 0.05, 0.06, TRIM, { at: [s * (W / 2 + 0.06), 1.32, 1.12] }),
      P.rbox(0.2, 0.15, 0.12, 0.05, GREY, { at: [s * (W / 2 + 0.16), 1.36, 1.1], rot: [0, s * -0.15, 0] }),
      // The window line's chrome along the quarter, the roof rails on their feet.
      P.box(0.02, 0.03, KICK.z0 - KICK.z1, CHROME, { at: [s * (W / 2 + 0.005), (belt(KICK.z0) + KICK.y) / 2, (KICK.z0 + KICK.z1) / 2], rot: [Math.atan2(KICK.y - belt(KICK.z0), KICK.z0 - KICK.z1), 0, 0] }),
      P.box(0.06, 0.05, 2.4, CLAD, { at: [s * (W / 2 - 0.2), ROOF + 0.16, -0.85] }),
      ...[0.25, -1.95].map((z) => P.box(0.06, 0.12, 0.14, CLAD, { at: [s * (W / 2 - 0.2), ROOF + 0.09, z] })),
    ]),
  ]
  body.add(solid(merge(parts), bag, 2))
  // Big windows all round (see-through, so the family shows inside).
  const glassMat = bag.add(new MeshBasicMaterial({ color: GLASS, transparent: true, opacity: 0.3, depthWrite: false }))
  const glass = [
    P.box(W - 0.16, wsLen, 0.02, '#FFFFFF', { at: wsMid, rot: [-tilt, 0, 0] }),
    P.box(W - 0.2, TOP - KICK.y - 0.04, 0.02, '#FFFFFF', { at: [0, (TOP + KICK.y + 0.04) / 2, BACK + 0.06] }),
    // The quarter windows behind the back doors, kicking up at the back.
    ...[-1, 1].map((s) => side([[C_Z - 0.04, belt(C_Z)], [KICK.z0, belt(KICK.z0)], [KICK.z1, KICK.y], [KICK.z1, TOP], [C_Z - 0.04, TOP]], 0.02, '#FFFFFF', s * (W / 2 - 0.05))),
  ]
  for (const g of glass) body.add(new Mesh(bag.add(g), glassMat))

  // The four hinged doors: a grey panel with a rising crease, a chrome handle and window line, a black window frame
  // (the floating roof) round the glass. Each pivots at its front edge, out from the side it's on.
  const door = (s: number, hinge: number, len: number, front: boolean): Group => {
    const g = new Group()
    g.position.set(s * (W / 2 - 0.03), 0, hinge)
    const y0 = belt(hinge)
    const y1 = belt(hinge - len)
    // The front door's window follows the A-pillar down to the sail.
    const slantZ = front ? aPillarZ(TOP) - hinge : 0
    const slant: Pt[] = front ? [[0, SAIL_Y], [slantZ, TOP]] : [[0, TOP]]
    const win: Pt[] = [[0, y0], [-len, y1], [-len, TOP], ...slant.slice().reverse()]
    g.add(solid(merge([
      side([[0, BOTTOM + 0.12], [-len, BOTTOM + 0.12], [-len, y1], [0, y0]], 0.06, GREY),
      P.box(0.065, 0.025, len - 0.04, SHADE, { at: [0, crease(hinge - len / 2), -len / 2], rot: [Math.atan2(0.1, 2), 0, 0] }),
      P.box(0.07, 0.025, len - 0.02, CHROME, { at: [0, (y0 + y1) / 2 + 0.005, -len / 2], rot: [Math.atan2(y1 - y0, len), 0, 0] }),
      P.rbox(0.05, 0.05, 0.18, 0.02, CHROME, { at: [s * 0.03, 1.04, -len + 0.22] }),
      // The black frame round the window.
      P.box(0.07, 0.06, len + slantZ, TRIM, { at: [0, TOP, (slantZ - len) / 2] }),
      P.box(0.07, TOP - y1, 0.05, TRIM, { at: [0, (TOP + y1) / 2, -len + 0.025] }),
      ...(front ? [P.box(0.07, Math.hypot(slantZ, TOP - SAIL_Y), 0.05, TRIM, { at: [0, (TOP + SAIL_Y) / 2, slantZ / 2], rot: [-tilt, 0, 0] })] : [P.box(0.07, TOP - y0, 0.05, TRIM, { at: [0, (TOP + y0) / 2, -0.025] })]),
    ]), bag, 2))
    g.add(new Mesh(bag.add(side(win, 0.02, '#FFFFFF')), glassMat))
    body.add(g)
    return g
  }
  // (Local -x is the car's right: the driver's side.)
  const doors: Record<DoorId, Group> = {
    fr: door(-1, DOOR.front.hinge, DOOR.front.len, true),
    fl: door(1, DOOR.front.hinge, DOOR.front.len, true),
    rr: door(-1, DOOR.rear.hinge, DOOR.rear.len, false),
    rl: door(1, DOOR.rear.hinge, DOOR.rear.len, false),
  }
  const setDoors = (k: number) => {
    // Out from each side: the right ones swing toward -x, the left ones toward +x. Kaylee's spare-side door stays shut.
    doors.fr.rotation.y = 1.05 * k
    doors.fl.rotation.y = -1.05 * k
    doors.rl.rotation.y = -1.0 * k
    doors.rr.rotation.y = 0
  }

  // Big wheels: a fat tyre round a two-tone alloy (dark between five machined silver spokes, a silver cap).
  const wheels: Group[] = []
  for (const [x, z] of [[-1, WHEEL.front], [1, WHEEL.front], [-1, WHEEL.rear], [1, WHEEL.rear]]) {
    const w = new Group()
    w.position.set(x * (W / 2 - 0.17), WHEEL.r, z)
    const face = x * 0.08
    w.add(solid(merge([
      P.torus(WHEEL.r - 0.11, 0.11, PAL.ink, { rot: [0, Math.PI / 2, 0] }),
      P.cyl(WHEEL.r - 0.12, WHEEL.r - 0.12, 0.14, TRIM, { rot: [0, 0, Math.PI / 2] }),
      P.torus(WHEEL.r - 0.13, 0.018, CHROME, { at: [face, 0, 0], rot: [0, Math.PI / 2, 0] }),
      ...[0, 1, 2, 3, 4].flatMap((i) => [-0.16, 0.16].map((d) => {
        const a = (i * 2 * Math.PI) / 5 + d
        return P.box(0.03, 0.2, 0.045, CHROME, { at: [face, 0.13 * Math.cos(a), 0.13 * Math.sin(a)], rot: [a, 0, 0] })
      })),
      P.cyl(0.06, 0.06, 0.04, CHROME, { at: [face, 0, 0], rot: [0, 0, Math.PI / 2] }),
    ]), bag, 2))
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

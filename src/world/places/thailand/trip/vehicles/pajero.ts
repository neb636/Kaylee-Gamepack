// The family's rental for the Nan road trip (Dad, 2026-10-24): a silver Mitsubishi Pajero Sport, the big seven-seat
// SUV that's made in Thailand. GREYBOX (plan: thailand/nan-trip.md, steps 1 and 6): a chunky toy box in the house's toon
// look, tall and square with big wheels, roof rails and a black face, enough to steer and to read as "the big car". Since
// the rental desk (step 6) it's hollow, so the family shows inside through see-through windows: seats (Mommy at the wheel
// on the right, Daddy beside her, Kaylee behind Mommy), the back door on Kaylee's side that swings open, the tailgate
// that lifts for the bags, and wing mirrors that fold out when the key fob beeps. The real model is the look step.
// Faces +z. Right-hand drive: local -x is the car's right, the driver's side.
//
// root (where it is, which way it faces) > tilt (the road's slope) > body (leans out on bends, squats when it brakes,
// bounces): the drive moves each.
import { Group, Mesh, MeshBasicMaterial, type BufferGeometry } from 'three'
import type { Bag } from '../../engine/dispose'
import { blobShadow, merge, P, solid, type V3 } from '../../engine/geo'
import { PAL } from '../../engine/toon'

const SILVER = '#C9CDD8'
const SHADE = '#A9AEBC'
const TRIM = '#3E3849'
const SEAT = '#6E6880'
const GLASS = '#CDEBFF'

export interface Pajero {
  root: Group
  tilt: Group
  body: Group
  wheels: Group[]
  /** The headlights' color (they come on in the cloud, and wink when she taps the car). */
  lamps: MeshBasicMaterial
  /** The tail lamps and the indicators (they wink with the key fob). */
  tails: MeshBasicMaterial
  /** Soft beams of light ahead, for the cloud. */
  beams: Mesh
  /** Seats (local to `body`, at the cushion's top): Mommy at the wheel on the right, Daddy beside her, Kaylee behind
   *  Mommy, and the spare back seat. */
  seats: { driver: Group; nick: Group; kaylee: Group; spare: Group }
  /** Kaylee's back door (right side, behind Mommy's), pivoting at its front edge: setDoor(1) is wide open. */
  door: Group
  setDoor(k: number): void
  /** The tailgate, hinged at the roof: setTailgate(1) is up. */
  tailgate: Group
  setTailgate(k: number): void
  /** The wing mirrors: setMirrors(0) folded flat against the windows, 1 out. */
  setMirrors(k: number): void
  /** Where the bags go in the boot (local to `body`), from the back to the front. */
  boot: V3[]
  /** Kaylee's seatbelt: where it hangs from (by the door, over her shoulder) and where it buckles (local to `body`). */
  belt: { from: V3; to: V3 }
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
  const BELT = 1.475
  const ROOF = 2.21
  const BACK = -2.32
  const FRONT_PILLAR = 1.0
  // The back door on each side runs from the B-pillar back to the C-pillar.
  const DOOR = { hinge: 0.02, len: 0.98 }
  const side = W / 2 - 0.05
  const glassMat = bag.add(new MeshBasicMaterial({ color: GLASS, transparent: true, opacity: 0.3, depthWrite: false }))
  const parts: BufferGeometry[] = [
    // The nose (the hood block in front of the windshield), the floor, the sides below the windows.
    P.rbox(W, 0.95, L / 2 - FRONT_PILLAR + 0.08, 0.22, SILVER, { at: [0, 1.0, (L / 2 + FRONT_PILLAR) / 2 - 0.04] }),
    P.box(W - 0.06, 0.14, FRONT_PILLAR - BACK, SILVER, { at: [0, 0.6, (FRONT_PILLAR + BACK) / 2] }),
    P.box(W - 0.2, 0.04, FRONT_PILLAR - BACK - 0.1, '#8F88A3', { at: [0, 0.69, (FRONT_PILLAR + BACK) / 2] }),
    // Left side: all one panel (Daddy's doors stay shut in the greybox). Right side: the front door, then the gap for
    // Kaylee's door, then the back quarter.
    P.rbox(0.1, 0.95, FRONT_PILLAR - BACK, 0.04, SILVER, { at: [side, 1.0, (FRONT_PILLAR + BACK) / 2] }),
    P.rbox(0.1, 0.95, FRONT_PILLAR - DOOR.hinge, 0.04, SILVER, { at: [-side, 1.0, (FRONT_PILLAR + DOOR.hinge) / 2] }),
    P.rbox(0.1, 0.95, DOOR.hinge - DOOR.len - BACK, 0.04, SILVER, { at: [-side, 1.0, (DOOR.hinge - DOOR.len + BACK) / 2] }),
    // The back below the tailgate: the bumper; the tail lamps up the corners.
    P.rbox(W + 0.02, 0.3, 0.2, 0.08, TRIM, { at: [0, 0.6, BACK - 0.04] }),
    P.box(W - 0.1, 0.18, 0.08, SILVER, { at: [0, 0.83, BACK + 0.02] }),
    // The cabin: the roof on its pillars (A by the windshield, B between the doors, C behind Kaylee's door, D at the back).
    P.rbox(W - 0.1, 0.12, FRONT_PILLAR - BACK + 0.04, 0.06, SILVER, { at: [0, ROOF, (FRONT_PILLAR + BACK) / 2 - 0.02] }),
    ...[-1, 1].flatMap((s) => [
      P.box(0.1, 0.82, 0.1, TRIM, { at: [s * side, (BELT + ROOF) / 2, FRONT_PILLAR + 0.02], rot: [-0.32, 0, 0] }),
      ...[DOOR.hinge, DOOR.hinge - DOOR.len, BACK + 0.06].map((z) => P.box(0.1, ROOF - BELT, 0.1, TRIM, { at: [s * side, (BELT + ROOF) / 2, z] })),
    ]),
    // The black face: the big grille, the headlight bezels, the bumper and the skid plate.
    P.rbox(1.3, 0.42, 0.08, 0.05, TRIM, { at: [0, 1.08, L / 2 + 0.01] }),
    ...[0.98, 1.12, 1.24].map((y) => P.box(1.18, 0.03, 0.04, SHADE, { at: [0, y, L / 2 + 0.05] })),
    P.rbox(W + 0.02, 0.3, 0.2, 0.08, TRIM, { at: [0, 0.6, L / 2 - 0.04] }),
    P.rbox(1.0, 0.08, 0.1, 0.03, '#E8EAF2', { at: [0, 0.44, L / 2 + 0.02] }),
    // Black wheel arches, the side sills, the roof rails.
    ...[-1, 1].flatMap((s) => [1.5, -1.5].map((z) => P.torus(0.56, 0.08, TRIM, { at: [s * (W / 2 + 0.01), 0.62, z], rot: [0, -Math.PI / 2, 0] }, Math.PI))),
    ...[-1, 1].map((s) => P.box(0.08, 0.14, 2.3, TRIM, { at: [s * (W / 2 + 0.02), 0.6, 0] })),
    ...[-1, 1].map((s) => P.box(0.07, 0.07, 2.9, TRIM, { at: [s * (W / 2 - 0.22), ROOF + 0.09, -0.6] })),
    // Inside: the dashboard, the wheel on the right (Thailand keeps left), the front seats and the back bench.
    P.rbox(W - 0.2, 0.3, 0.4, 0.08, TRIM, { at: [0, 1.32, 0.85] }),
    P.torus(0.17, 0.03, PAL.ink, { at: [-0.45, 1.5, 0.62], rot: [-0.5, 0, 0] }),
    ...[-1, 1].flatMap((s) => [P.rbox(0.62, 0.16, 0.6, 0.06, SEAT, { at: [s * 0.45, 0.8, 0.35] }), P.rbox(0.62, 0.72, 0.14, 0.06, SEAT, { at: [s * 0.45, 1.2, 0.02], rot: [-0.12, 0, 0] })]),
    P.rbox(W - 0.3, 0.16, 0.62, 0.06, SEAT, { at: [0, 0.8, -0.62] }),
    P.rbox(W - 0.3, 0.72, 0.14, 0.06, SEAT, { at: [0, 1.2, -0.98], rot: [-0.12, 0, 0] }),
    // The boot's floor behind the back seats.
    P.box(W - 0.24, 0.05, 1.1, '#8F88A3', { at: [0, 0.95, -1.7] }),
    // Kaylee's seatbelt buckle, by her hip.
    P.rbox(0.07, 0.1, 0.05, 0.02, '#FF5C7A', { at: [-0.06, 0.95, -0.5] }),
  ]
  body.add(solid(merge(parts), bag, 2))
  // Big windows (see-through, so the family shows inside): the windshield, the side windows, the back quarters.
  const glass = [
    P.box(W - 0.3, 0.86, 0.03, '#ffffff', { at: [0, (BELT + ROOF) / 2, FRONT_PILLAR + 0.02], rot: [-0.32, 0, 0] }),
    ...[-1, 1].map((s) => P.box(0.03, ROOF - BELT - 0.04, FRONT_PILLAR - DOOR.hinge - 0.22, '#ffffff', { at: [s * side, (BELT + ROOF) / 2, (FRONT_PILLAR - 0.22 + DOOR.hinge) / 2] })),
    P.box(0.03, ROOF - BELT - 0.04, DOOR.len, '#ffffff', { at: [side, (BELT + ROOF) / 2, DOOR.hinge - DOOR.len / 2] }),
    ...[-1, 1].map((s) => P.box(0.03, ROOF - BELT - 0.04, DOOR.hinge - DOOR.len - BACK - 0.12, '#ffffff', { at: [s * side, (BELT + ROOF) / 2, (DOOR.hinge - DOOR.len + BACK + 0.12) / 2] })),
  ]
  body.add(new Mesh(bag.add(merge(glass)), glassMat))
  const lamps = bag.add(new MeshBasicMaterial({ color: '#FFF4CC' }))
  for (const s of [-1, 1]) body.add(new Mesh(bag.add(P.rbox(0.36, 0.16, 0.08, 0.05, '#ffffff', { at: [s * 0.74, 1.12, L / 2 + 0.02] })), lamps))
  const tails = bag.add(new MeshBasicMaterial({ color: '#FF5C7A' }))
  body.add(new Mesh(bag.add(merge([-1, 1].map((s) => P.rbox(0.2, 0.5, 0.08, 0.04, '#ffffff', { at: [s * (W / 2 - 0.16), 1.22, BACK - 0.02] })))), tails))
  // Two soft cones of light reaching ahead (only in the cloud).
  const beamMat = bag.add(new MeshBasicMaterial({ color: '#FFF6D6', transparent: true, opacity: 0.28, depthWrite: false }))
  const beams = new Mesh(bag.add(merge([-1, 1].map((s) => P.cone(1.6, 11, '#ffffff', { at: [s * 0.74, 1.0, L / 2 + 5.6], rot: [-Math.PI / 2, 0, 0] }, 12)))), beamMat)
  beams.visible = false
  body.add(beams)

  // ---- Kaylee's door: the panel, its window frame and glass, the handle ----
  const door = new Group()
  door.position.set(-side, 0, DOOR.hinge)
  door.add(solid(merge([
    P.rbox(0.08, 0.95, DOOR.len - 0.04, 0.04, SILVER, { at: [-0.01, 1.0, -DOOR.len / 2] }),
    P.box(0.08, 0.06, DOOR.len - 0.04, TRIM, { at: [-0.01, ROOF - 0.05, -DOOR.len / 2] }),
    P.box(0.08, ROOF - BELT, 0.06, TRIM, { at: [-0.01, (BELT + ROOF) / 2, -DOOR.len + 0.05] }),
    P.rbox(0.05, 0.05, 0.18, 0.02, SHADE, { at: [-0.06, 1.3, -DOOR.len + 0.25] }),
  ]), bag, 2))
  door.add(new Mesh(bag.add(P.box(0.03, ROOF - BELT - 0.1, DOOR.len - 0.12, '#ffffff', { at: [-0.01, (BELT + ROOF) / 2 - 0.02, -DOOR.len / 2] })), glassMat))
  body.add(door)
  // (Out from the right side, toward -x.)
  const setDoor = (k: number) => (door.rotation.y = 1.15 * k)

  // ---- The tailgate, hinged at the back of the roof, lifting up and back ----
  const tailgate = new Group()
  tailgate.position.set(0, ROOF - 0.02, BACK - 0.02)
  const gateH = ROOF - 0.92
  tailgate.add(solid(merge([
    P.rbox(W - 0.08, gateH * 0.48, 0.07, 0.04, SILVER, { at: [0, -gateH * 0.76, 0] }),
    P.box(W - 0.08, 0.07, 0.07, TRIM, { at: [0, -0.04, 0] }),
    ...[-1, 1].map((s) => P.box(0.08, gateH * 0.52, 0.07, TRIM, { at: [s * (W / 2 - 0.08), -gateH * 0.26, 0] })),
    P.rbox(0.4, 0.12, 0.03, 0.02, SHADE, { at: [0, -gateH * 0.7, -0.045] }),
  ]), bag, 2))
  tailgate.add(new Mesh(bag.add(P.box(W - 0.24, gateH * 0.46, 0.02, '#ffffff', { at: [0, -gateH * 0.28, 0] })), glassMat))
  body.add(tailgate)
  const setTailgate = (k: number) => (tailgate.rotation.x = 1.45 * k)

  // ---- The wing mirrors (they fold out with the key fob's beep) ----
  const mirrors = [-1, 1].map((s) => {
    const m = new Group()
    m.position.set(s * (W / 2 + 0.02), 1.6, 0.92)
    m.add(solid(merge([P.box(0.1, 0.06, 0.08, TRIM, { at: [s * 0.04, 0, 0] }), P.rbox(0.2, 0.18, 0.14, 0.05, SILVER, { at: [s * 0.14, 0, 0] })]), bag, 2))
    body.add(m)
    return m
  })
  // Folded back flat along the windows (0), or out (1).
  const setMirrors = (k: number) => mirrors.forEach((m, i) => (m.rotation.y = (i === 0 ? -1 : 1) * (1 - k) * 1.3))

  const wheels: Group[] = []
  for (const [x, z] of [[-1, 1.5], [1, 1.5], [-1, -1.5], [1, -1.5]]) {
    const w = new Group()
    w.position.set(x * (W / 2 - 0.12), 0.45, z)
    w.add(solid(merge([P.torus(0.33, 0.13, PAL.ink, { rot: [0, Math.PI / 2, 0] }), P.cyl(0.24, 0.24, 0.2, '#D9DCE8', { rot: [0, 0, Math.PI / 2] }), P.box(0.22, 0.06, 0.4, SHADE, { at: [x * 0.05, 0, 0] })]), bag, 2))
    tilt.add(w)
    wheels.push(w)
  }
  root.add(blobShadow(2.6, bag))

  const seat = (x: number, z: number) => {
    const g = new Group()
    g.position.set(x, 0.88, z)
    body.add(g)
    return g
  }
  const seats = { driver: seat(-0.45, 0.38), nick: seat(0.45, 0.38), kaylee: seat(-0.45, -0.6), spare: seat(0.45, -0.6) }
  return {
    root,
    tilt,
    body,
    wheels,
    lamps,
    tails,
    beams,
    seats,
    door,
    setDoor,
    tailgate,
    setTailgate,
    setMirrors,
    boot: [[-0.45, 1.0, -1.95], [0.45, 1.0, -1.95], [0, 1.0, -1.55]],
    belt: { from: [-side + 0.1, 1.85, -0.85], to: [-0.06, 1.0, -0.5] },
    length: L,
    width: W,
  }
}

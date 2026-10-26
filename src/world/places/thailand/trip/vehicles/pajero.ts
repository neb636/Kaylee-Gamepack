// The family's rental for the Nan road trip (Dad, 2026-10-24): a silver Mitsubishi Pajero Sport, the big seven-seat
// SUV that's made in Thailand. A chunky toy model in the house's toon look that still reads as the real car (plan:
// thailand/nan-trip.html, step 8): its "Dynamic Shield" face (a black grille with chrome bars between slim high
// headlights, chrome swooshes curving down from them to the bumper's corners, black corner intakes with tall fog
// lamps, a silver skid plate), a long flat hood, a tall glasshouse on black pillars, chunky black arches and side steps,
// roof rails, big six-spoke alloys, and at the back its tall tail lamps running down the corners either side of the
// tailgate. A little shine on the silver: pale highlight strips along the hood, the shoulders and the roof edge.
//
// It's hollow, so the family shows inside through see-through windows: seats (Mommy at the wheel on the right, Daddy
// beside her, Kaylee behind Mommy), the back door on Kaylee's side that swings open, the tailgate that lifts for the
// bags, and wing mirrors that fold out when the key fob beeps. A little pink elephant toy nods on top of the back seat
// (it faces back, so she sees it through the tailgate's window), and the wipers (two on the windshield, one on the
// tailgate) swish when the drive says so. Faces +z. Right-hand drive: local -x is the car's right, the driver's side.
//
// root (where it is, which way it faces) > tilt (the road's slope) > body (leans out on bends, squats when it brakes,
// bounces): the drive moves each.
import { Group, Mesh, MeshBasicMaterial, type BufferGeometry } from 'three'
import type { Bag } from '../../engine/dispose'
import { blobShadow, merge, P, solid, solidMix, type V3 } from '../../engine/geo'
import { PAL } from '../../engine/toon'

const SILVER = '#CDD1DC'
const SHADE = '#A9AEBC'
const SHINE = '#F6F8FF'
const CHROME = '#EEF0F6'
const TRIM = '#3E3849'
const CLAD = '#4A4458'
const SEAT = '#6E6880'
const GLASS = '#CDEBFF'
const LAMP = '#FFF8D6'
const RED = '#FF5C7A'

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
  /** The little pink elephant on top of the back seat, facing back: `head` nods (rotation.x), `root` bobs. */
  elephant: { root: Group; head: Group }
  /** The wipers: 0 lying down, 1 at the top of their sweep (the front pair and the tailgate's together). */
  setWipers(k: number): void
  /** Where the tailgate's wiper is (local to `body`), for its tap target. */
  rearWiper: V3
  /** Where the bags go in the boot (local to `body`), from the back to the front. */
  boot: V3[]
  /** Kaylee's seatbelt: where it hangs from (by the door, over her shoulder) and where it buckles (local to `body`). */
  belt: { from: V3; to: V3 }
  length: number
  width: number
}

type Pt = [number, number]

export function buildPajero(bag: Bag): Pajero {
  const root = new Group()
  const tilt = new Group()
  const body = new Group()
  root.add(tilt)
  tilt.add(body)
  const W = 1.95
  const L = 4.8
  const BELT = 1.475
  // (A toy's tall glasshouse: room for the family's horns and ears with everyone sitting up.)
  const ROOF = 2.45
  const BACK = -2.32
  const FRONT = L / 2 + 0.04
  const FRONT_PILLAR = 1.0
  const SILL = 0.42
  // The back door on each side runs from the B-pillar back to the C-pillar.
  const DOOR = { hinge: 0.02, len: 0.98 }
  const WHEEL = { r: 0.46, y: 0.45, front: 1.5, rear: -1.5 }
  const ARCH = { r: 0.6, y: 0.45 }
  const side = W / 2 - 0.05
  // The windshield leans back; its glass is this long.
  const WS = (ROOF - BELT) / Math.cos(0.32)
  // The seats' cushions are this much lower than they'd be in a real car (the same room for the riders' heads).
  const SEAT_Y = 0.74
  // A side profile drawn in (z along the car, y up), pushed `w` across the car at x.
  const prof = (pts: Pt[], w: number, c: string, x = 0) => P.prism(pts, w, c, { at: [x, 0, 0], rot: [0, -Math.PI / 2, 0] })
  // The wheel arch round a wheel at zc, from z = from over the top to z = to.
  const arch = (zc: number, from: number, to: number): Pt[] => {
    const a0 = Math.acos(Math.max(-1, Math.min(1, (from - zc) / ARCH.r)))
    const a1 = Math.acos(Math.max(-1, Math.min(1, (to - zc) / ARCH.r)))
    return Array.from({ length: 11 }, (_, i) => {
      const a = a0 + ((a1 - a0) * i) / 10
      return [zc + ARCH.r * Math.cos(a), ARCH.y + ARCH.r * Math.sin(a)]
    })
  }
  const glassMat = bag.add(new MeshBasicMaterial({ color: GLASS, transparent: true, opacity: 0.3, depthWrite: false }))

  // ---- The nose: the long flat hood, the face, round the front arches (full width) ----
  const nose: Pt[] = [
    [0.9, BELT], [0.9, SILL], ...arch(WHEEL.front, WHEEL.front - ARCH.r, WHEEL.front + ARCH.r), [2.12, 0.38], [2.3, 0.34], [FRONT - 0.03, 0.48], [FRONT, 0.8],
    [FRONT - 0.01, 1.16], [FRONT - 0.07, 1.31], [2.1, 1.38], [FRONT_PILLAR + 0.02, BELT],
  ]
  // ---- The sides below the windows: Daddy's side all one panel (his doors stay shut), Mommy's front door and the
  // back quarter behind Kaylee's door (her door is its own group) ----
  const rearArch = (from: number) => arch(WHEEL.rear, from, WHEEL.rear - ARCH.r)
  const fullSide: Pt[] = [[0.9, BELT], [0.9, SILL], [WHEEL.rear + ARCH.r, SILL], ...rearArch(WHEEL.rear + ARCH.r), [BACK - 0.02, SILL + 0.02], [BACK - 0.02, BELT]]
  const frontDoor: Pt[] = [[0.9, BELT], [0.9, SILL], [DOOR.hinge + 0.01, SILL], [DOOR.hinge + 0.01, BELT]]
  const qz = DOOR.hinge - DOOR.len
  const quarter: Pt[] = [[qz, BELT], ...rearArch(qz), [BACK - 0.02, SILL + 0.02], [BACK - 0.02, BELT]]
  const shell: BufferGeometry[] = [
    prof(nose, W, SILVER),
    prof(fullSide, 0.1, SILVER, side),
    prof(frontDoor, 0.1, SILVER, -side),
    prof(quarter, 0.1, SILVER, -side),
    // The floor and the dark wheel wells behind the wheels.
    P.box(W - 0.06, 0.14, FRONT_PILLAR - BACK, SHADE, { at: [0, 0.6, (FRONT_PILLAR + BACK) / 2] }),
    P.box(W - 0.2, 0.04, FRONT_PILLAR - BACK - 0.1, '#8F88A3', { at: [0, 0.69, (FRONT_PILLAR + BACK) / 2] }),
    ...[WHEEL.front, WHEEL.rear].map((z) => P.box(W - 0.5, 0.5, 1.05, TRIM, { at: [0, 0.6, z] })),
    // The shoulder crease along each side, the black cladding along the bottom, the side steps.
    ...[-1, 1].flatMap((s) => [
      P.box(0.03, 0.04, 3.3, SHADE, { at: [s * (W / 2 + 0.005), 1.16, -0.6] }),
      P.box(0.05, 0.14, 1.75, CLAD, { at: [s * (W / 2 + 0.01), SILL + 0.08, 0] }),
      P.rbox(0.2, 0.07, 1.6, 0.03, TRIM, { at: [s * (W / 2 + 0.06), 0.36, 0] }),
      ...[-0.5, 0.5].map((z) => P.box(0.12, 0.08, 0.08, TRIM, { at: [s * (W / 2 - 0.02), 0.39, z] })),
    ]),
    // Chunky black flares round all four arches.
    ...[-1, 1].flatMap((s) => [WHEEL.front, WHEEL.rear].map((z) => P.torus(ARCH.r + 0.02, 0.07, CLAD, { at: [s * (W / 2 + 0.01), ARCH.y, z], rot: [0, -Math.PI / 2, 0], scale: [1, 1, 0.9] }, Math.PI))),

    // ---- The face: the Dynamic Shield ----
    // The black grille with three chrome bars and the badge (three little diamonds).
    P.rbox(1.0, 0.36, 0.08, 0.05, TRIM, { at: [0, 1.1, FRONT - 0.02] }),
    ...[1.0, 1.1, 1.2].map((y) => P.box(0.92, 0.035, 0.04, CHROME, { at: [0, y, FRONT + 0.03] })),
    ...[0, 2.09, 4.19].map((a) => P.prism([[0, 0], [0.035, 0.05], [0, 0.1], [-0.035, 0.05]], 0.03, '#E8404E', { at: [Math.sin(a) * 0.05, 1.1 + Math.cos(a) * 0.05 - 0.05, FRONT + 0.06], rot: [0, 0, -a] })),
    ...[-1, 1].flatMap((s) => [
      // The chrome swoosh from under the headlight round and down to the bumper's corner (the shield's two sides).
      P.box(0.07, 0.34, 0.05, CHROME, { at: [s * 0.56, 0.96, FRONT - 0.005], rot: [0, 0, s * 0.18] }),
      P.box(0.07, 0.3, 0.05, CHROME, { at: [s * 0.68, 0.66, FRONT - 0.02], rot: [0, 0, s * 0.62] }),
      // The black corner intakes, each with a tall fog lamp.
      P.rbox(0.26, 0.4, 0.06, 0.05, TRIM, { at: [s * 0.8, 0.72, FRONT - 0.04] }),
      P.rbox(0.08, 0.26, 0.04, 0.03, LAMP, { at: [s * 0.84, 0.74, FRONT - 0.01] }),
      // The headlights' black surrounds (the lamps themselves glow, below) and the indicators by the fenders.
      P.rbox(0.48, 0.17, 0.06, 0.05, TRIM, { at: [s * 0.7, 1.22, FRONT - 0.04], rot: [0, 0, s * -0.05] }),
      P.rbox(0.1, 0.08, 0.2, 0.03, '#FFB45C', { at: [s * (W / 2 - 0.02), 1.2, FRONT - 0.24] }),
    ]),
    // The black lower bumper, the silver skid plate, the tow hook.
    P.rbox(1.2, 0.2, 0.08, 0.05, TRIM, { at: [0, 0.6, FRONT - 0.03] }),
    P.rbox(1.0, 0.14, 0.16, 0.05, '#E2E5EE', { at: [0, 0.4, FRONT - 0.06], rot: [0.35, 0, 0] }),

    // ---- The back below the tailgate: the bumper with its step, the plate, the corners with the tall lamps ----
    P.rbox(W + 0.02, 0.32, 0.22, 0.08, TRIM, { at: [0, 0.6, BACK - 0.04] }),
    P.box(W - 0.6, 0.05, 0.12, '#E2E5EE', { at: [0, 0.77, BACK - 0.08] }),
    P.box(W - 0.44, 0.2, 0.08, SILVER, { at: [0, 0.86, BACK + 0.02] }),
    P.box(0.5, 0.16, 0.03, '#FBFBFF', { at: [0, 0.6, BACK - 0.16] }),
    ...[-1, 1].map((s) => P.rbox(0.24, ROOF - 0.8, 0.12, 0.05, SILVER, { at: [s * (W / 2 - 0.12), (ROOF + 0.8) / 2, BACK + 0.03] })),

    // ---- The cabin: the roof on black pillars (A by the windshield, B between the doors, C behind Kaylee's door) ----
    P.rbox(W - 0.06, 0.12, FRONT_PILLAR - BACK + 0.06, 0.06, SILVER, { at: [0, ROOF, (FRONT_PILLAR + BACK) / 2 - 0.02] }),
    // The little spoiler over the tailgate with its stop lamp, the shark-fin aerial.
    P.rbox(W - 0.3, 0.07, 0.24, 0.035, SILVER, { at: [0, ROOF + 0.02, BACK + 0.02], rot: [0.12, 0, 0] }),
    P.box(0.4, 0.03, 0.03, RED, { at: [0, ROOF - 0.01, BACK - 0.1] }),
    P.rbox(0.08, 0.1, 0.24, 0.04, TRIM, { at: [0, ROOF + 0.1, -1.7] }),
    ...[-1, 1].flatMap((s) => [
      P.box(0.1, WS, 0.1, TRIM, { at: [s * side, (BELT + ROOF) / 2, FRONT_PILLAR + 0.02 - (ROOF - BELT) * 0.16], rot: [-0.32, 0, 0] }),
      ...[DOOR.hinge, DOOR.hinge - DOOR.len].map((z) => P.box(0.1, ROOF - BELT, 0.1, TRIM, { at: [s * side, (BELT + ROOF) / 2, z] })),
      // The chrome line along the bottom of the windows.
      P.box(0.03, 0.03, FRONT_PILLAR - BACK - 0.3, CHROME, { at: [s * (W / 2 - 0.02), BELT + 0.01, (FRONT_PILLAR + BACK) / 2 + 0.1] }),
      // The roof rails, silver on black feet.
      P.rbox(0.07, 0.06, 2.9, 0.03, '#DADDE6', { at: [s * (W / 2 - 0.2), ROOF + 0.17, -0.6] }),
      ...[0.8, -0.6, -2.0].map((z) => P.box(0.08, 0.12, 0.14, TRIM, { at: [s * (W / 2 - 0.2), ROOF + 0.09, z] })),
    ]),

    // ---- Inside: the dashboard, the wheel on the right (Thailand keeps left), the front seats and the back bench ----
    P.rbox(W - 0.2, 0.3, 0.4, 0.08, TRIM, { at: [0, 1.32, 0.85] }),
    P.torus(0.17, 0.03, PAL.ink, { at: [-0.45, 1.5, 0.62], rot: [-0.5, 0, 0] }),
    ...[-1, 1].flatMap((s) => [
      P.rbox(0.62, 0.16, 0.6, 0.06, SEAT, { at: [s * 0.45, SEAT_Y - 0.08, 0.35] }),
      P.rbox(0.62, 0.72, 0.14, 0.06, SEAT, { at: [s * 0.45, SEAT_Y + 0.32, 0.02], rot: [-0.12, 0, 0] }),
      P.rbox(0.36, 0.2, 0.12, 0.05, SEAT, { at: [s * 0.45, SEAT_Y + 0.78, -0.03], rot: [-0.12, 0, 0] }),
    ]),
    P.rbox(W - 0.3, 0.16, 0.62, 0.06, SEAT, { at: [0, SEAT_Y - 0.08, -0.62] }),
    P.rbox(W - 0.3, 0.72, 0.14, 0.06, SEAT, { at: [0, SEAT_Y + 0.32, -0.98], rot: [-0.12, 0, 0] }),
    // The boot's floor behind the back seats.
    P.box(W - 0.24, 0.05, 1.1, '#8F88A3', { at: [0, 0.95, -1.7] }),
    // Kaylee's seatbelt buckle, by her hip.
    P.rbox(0.07, 0.1, 0.05, 0.02, RED, { at: [-0.06, SEAT_Y + 0.07, -0.5] }),
  ]
  // A little shine on the silver (no outline): along the hood's front, down the shoulders, round the roof's edge.
  const shine: BufferGeometry[] = [
    P.box(W - 0.6, 0.012, 0.07, SHINE, { at: [0, 1.39, 2.0] }),
    P.box(0.5, 0.012, 0.05, SHINE, { at: [0.35, 1.42, 1.5], rot: [0, 0.2, 0] }),
    ...[-1, 1].flatMap((s) => [
      P.box(0.012, 0.05, 2.6, SHINE, { at: [s * (W / 2 + 0.012), 1.32, -0.5] }),
      P.box(0.012, 0.035, 0.9, SHINE, { at: [s * (W / 2 + 0.012), 1.24, 1.65] }),
      P.box(0.06, 0.012, 2.6, SHINE, { at: [s * (W / 2 - 0.12), ROOF + 0.065, -0.5] }),
    ]),
  ]
  body.add(solidMix(shell, shine, bag, 2))

  // Big windows (see-through, so the family shows inside): the windshield, the side windows, the back quarters.
  const glass = [
    P.box(W - 0.3, WS - 0.04, 0.03, '#ffffff', { at: [0, (BELT + ROOF) / 2, FRONT_PILLAR + 0.02 - (ROOF - BELT) * 0.16], rot: [-0.32, 0, 0] }),
    ...[-1, 1].map((s) => P.box(0.03, ROOF - BELT - 0.04, FRONT_PILLAR - DOOR.hinge - 0.22, '#ffffff', { at: [s * side, (BELT + ROOF) / 2, (FRONT_PILLAR - 0.22 + DOOR.hinge) / 2] })),
    P.box(0.03, ROOF - BELT - 0.04, DOOR.len, '#ffffff', { at: [side, (BELT + ROOF) / 2, DOOR.hinge - DOOR.len / 2] }),
    ...[-1, 1].map((s) => P.box(0.03, ROOF - BELT - 0.04, DOOR.hinge - DOOR.len - BACK - 0.26, '#ffffff', { at: [s * side, (BELT + ROOF) / 2, (DOOR.hinge - DOOR.len + BACK + 0.26) / 2] })),
  ]
  body.add(new Mesh(bag.add(merge(glass)), glassMat))
  // The lamps glow: slim headlights high in the face, the tall tail lamps down the back corners.
  const lamps = bag.add(new MeshBasicMaterial({ color: '#E6E2EE' }))
  body.add(new Mesh(bag.add(merge([-1, 1].map((s) => P.rbox(0.4, 0.11, 0.06, 0.04, '#ffffff', { at: [s * 0.7, 1.22, FRONT - 0.005], rot: [0, 0, s * -0.05] })))), lamps))
  const tails = bag.add(new MeshBasicMaterial({ color: RED }))
  body.add(new Mesh(bag.add(merge([-1, 1].flatMap((s) => [
    P.rbox(0.16, 0.62, 0.06, 0.05, '#ffffff', { at: [s * (W / 2 - 0.12), 1.46, BACK - 0.04] }),
    P.rbox(0.1, 0.3, 0.06, 0.04, '#ffffff', { at: [s * (W / 2 - 0.14), 0.98, BACK - 0.04] }),
  ]))), tails))
  // Two soft cones of light reaching ahead (only in the cloud).
  const beamMat = bag.add(new MeshBasicMaterial({ color: '#FFF6D6', transparent: true, opacity: 0.28, depthWrite: false }))
  const beams = new Mesh(bag.add(merge([-1, 1].map((s) => P.cone(1.6, 11, '#ffffff', { at: [s * 0.7, 1.05, L / 2 + 5.6], rot: [-Math.PI / 2, 0, 0] }, 12)))), beamMat)
  beams.visible = false
  body.add(beams)

  // ---- Kaylee's door: the panel (notched round the arch), its crease, window frame and glass, the handle ----
  const door = new Group()
  door.position.set(-side, 0, DOOR.hinge)
  const dl = DOOR.len - 0.02
  door.add(solid(merge([
    prof([[-0.01, BELT], [-0.01, SILL], [-dl + 0.12, SILL], [-dl, SILL + 0.3], [-dl, BELT]], 0.08, SILVER, -0.01),
    P.box(0.03, 0.04, dl - 0.04, SHADE, { at: [-0.06, 1.16, -dl / 2] }),
    P.box(0.03, 0.03, dl - 0.04, CHROME, { at: [-0.04, BELT + 0.01, -dl / 2] }),
    P.box(0.08, 0.06, dl - 0.04, TRIM, { at: [-0.01, ROOF - 0.05, -dl / 2] }),
    P.box(0.08, ROOF - BELT, 0.06, TRIM, { at: [-0.01, (BELT + ROOF) / 2, -dl + 0.05] }),
    P.rbox(0.05, 0.05, 0.18, 0.02, CHROME, { at: [-0.06, 1.3, -dl + 0.25] }),
  ]), bag, 2))
  door.add(new Mesh(bag.add(P.box(0.03, ROOF - BELT - 0.1, DOOR.len - 0.12, '#ffffff', { at: [-0.01, (BELT + ROOF) / 2 - 0.02, -DOOR.len / 2] })), glassMat))
  body.add(door)
  // (Out from the right side, toward -x.)
  const setDoor = (k: number) => (door.rotation.y = 1.15 * k)

  // ---- The tailgate, hinged at the back of the roof, lifting up and back (between the tall lamps) ----
  const tailgate = new Group()
  tailgate.position.set(0, ROOF - 0.02, BACK - 0.02)
  const gateH = ROOF - 0.92
  const GW = W - 0.46
  tailgate.add(solidMix([
    P.rbox(GW, gateH * 0.48, 0.07, 0.04, SILVER, { at: [0, -gateH * 0.76, 0] }),
    P.box(GW, 0.07, 0.07, TRIM, { at: [0, -0.04, 0] }),
    ...[-1, 1].map((s) => P.box(0.06, gateH * 0.52, 0.07, TRIM, { at: [s * (GW / 2 - 0.03), -gateH * 0.26, 0] })),
    // The chrome bar over the plate with the badge, the handle.
    P.box(GW - 0.3, 0.05, 0.03, CHROME, { at: [0, -gateH * 0.6, -0.045] }),
    ...[0, 2.09, 4.19].map((a) => P.prism([[0, 0], [0.03, 0.045], [0, 0.09], [-0.03, 0.045]], 0.03, '#E8404E', { at: [Math.sin(a) * 0.045, -gateH * 0.7 + Math.cos(a) * 0.045 - 0.045, -0.05], rot: [0, Math.PI, -a] })),
    P.rbox(0.3, 0.08, 0.03, 0.02, SHADE, { at: [0, -gateH * 0.84, -0.045] }),
  ], [P.box(GW - 0.3, 0.012, 0.012, SHINE, { at: [0, -gateH * 0.53, -0.04] })], bag, 2))
  tailgate.add(new Mesh(bag.add(P.box(GW - 0.12, gateH * 0.46, 0.02, '#ffffff', { at: [0, -gateH * 0.28, 0] })), glassMat))
  // The tailgate's wiper, lying along the bottom of its window.
  const rearW = new Group()
  rearW.position.set(0, -gateH * 0.5, -0.05)
  rearW.add(solid(merge([P.box(0.62, 0.03, 0.025, TRIM, { at: [0.31, 0, 0] }), P.cyl(0.035, 0.035, 0.04, TRIM, { rot: [Math.PI / 2, 0, 0] })]), bag, 1))
  tailgate.add(rearW)
  body.add(tailgate)
  const setTailgate = (k: number) => (tailgate.rotation.x = 1.45 * k)

  // ---- The windshield's wipers (in the glass's own tilted plane) ----
  const screen = new Group()
  screen.position.set(0, (BELT + ROOF) / 2, FRONT_PILLAR + 0.04 - (ROOF - BELT) * 0.16)
  screen.rotation.x = -0.32
  const frontW = [-0.62, 0.12].map((x) => {
    const w = new Group()
    w.position.set(x, -WS / 2 + 0.06, 0.03)
    w.add(solid(merge([P.box(0.7, 0.03, 0.025, TRIM, { at: [0.35, 0, 0] }), P.cyl(0.035, 0.035, 0.04, TRIM, { rot: [Math.PI / 2, 0, 0] })]), bag, 1))
    screen.add(w)
    return w
  })
  body.add(screen)
  const setWipers = (k: number) => {
    for (const w of frontW) w.rotation.z = 0.05 + k * 1.9
    // (Seen from behind, the tailgate's sweeps the other way round.)
    rearW.rotation.z = 0.08 + k * 2.2
  }
  setWipers(0)

  // ---- The wing mirrors (they fold out with the key fob's beep) ----
  const mirrors = [-1, 1].map((s) => {
    const m = new Group()
    m.position.set(s * (W / 2 + 0.02), 1.6, 0.92)
    m.add(solid(merge([
      P.box(0.1, 0.06, 0.08, TRIM, { at: [s * 0.04, 0, 0] }),
      P.rbox(0.22, 0.18, 0.14, 0.05, SILVER, { at: [s * 0.15, 0, 0] }),
      P.box(0.16, 0.025, 0.02, '#FFB45C', { at: [s * 0.16, -0.05, 0.07] }),
    ]), bag, 2))
    body.add(m)
    return m
  })
  // Folded back flat along the windows (0), or out (1).
  const setMirrors = (k: number) => mirrors.forEach((m, i) => (m.rotation.y = (i === 0 ? -1 : 1) * (1 - k) * 1.3))

  // ---- The nodding elephant: a pink toy sitting on top of the back seat, looking back out of the tailgate ----
  const ele = new Group()
  ele.position.set(0.02, SEAT_Y + 0.69, -1.02)
  ele.rotation.y = Math.PI
  const PINK = '#FFB3CF'
  ele.add(solid(merge([
    P.sphere(0.11, PINK, { at: [0, 0.09, 0], scale: [1, 0.9, 1.1] }),
    ...[-1, 1].map((s) => P.capsule(0.035, 0.05, PINK, { at: [s * 0.06, 0.03, 0.06] })),
    P.cyl(0.07, 0.08, 0.03, PAL.lavenderDark, { at: [0, -0.005, 0] }),
  ]), bag, 1))
  const head = new Group()
  head.position.set(0, 0.17, 0.04)
  head.add(solidMix([
    P.sphere(0.1, PINK, { at: [0, 0.06, 0.02] }),
    ...[-1, 1].map((s) => P.sphere(0.075, '#FF9DC4', { at: [s * 0.1, 0.07, -0.01], scale: [0.35, 1, 0.9] })),
    P.capsule(0.03, 0.08, PINK, { at: [0, -0.02, 0.12], rot: [0.9, 0, 0] }),
    P.torus(0.035, 0.022, PINK, { at: [0, -0.07, 0.17], rot: [0, Math.PI / 2, 0] }, Math.PI),
  ], [
    ...[-1, 1].map((s) => P.sphere(0.016, PAL.ink, { at: [s * 0.045, 0.09, 0.105] })),
    ...[-1, 1].map((s) => P.sphere(0.018, '#FF7FAE', { at: [s * 0.07, 0.04, 0.09], scale: [1, 0.6, 0.4] })),
  ], bag, 1))
  ele.add(head)
  body.add(ele)

  // ---- Big wheels: a fat tyre round a dark six-spoke alloy with machined silver faces ----
  const wheels: Group[] = []
  for (const [x, z] of [[-1, WHEEL.front], [1, WHEEL.front], [-1, WHEEL.rear], [1, WHEEL.rear]]) {
    const w = new Group()
    w.position.set(x * (W / 2 - 0.12), WHEEL.y, z)
    const face = x * 0.09
    w.add(solid(merge([
      P.torus(WHEEL.r - 0.15, 0.15, PAL.ink, { rot: [0, Math.PI / 2, 0] }),
      P.cyl(WHEEL.r - 0.15, WHEEL.r - 0.15, 0.18, TRIM, { rot: [0, 0, Math.PI / 2] }),
      P.torus(WHEEL.r - 0.16, 0.022, CHROME, { at: [face, 0, 0], rot: [0, Math.PI / 2, 0] }),
      ...[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i * Math.PI) / 3
        return P.box(0.04, 0.24, 0.07, CHROME, { at: [face, 0.13 * Math.cos(a), 0.13 * Math.sin(a)], rot: [a, 0, 0] })
      }),
      P.cyl(0.07, 0.07, 0.05, CHROME, { at: [face, 0, 0], rot: [0, 0, Math.PI / 2] }),
    ]), bag, 2))
    tilt.add(w)
    wheels.push(w)
  }
  const shadow = blobShadow(1.9, bag)
  shadow.scale.set(0.85, 1.45, 1)
  root.add(shadow)

  const seat = (x: number, z: number) => {
    const g = new Group()
    g.position.set(x, SEAT_Y, z)
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
    elephant: { root: ele, head },
    setWipers,
    rearWiper: [0.25, ROOF - 0.02 - gateH * 0.42, BACK - 0.1],
    boot: [[-0.45, 1.0, -1.95], [0.45, 1.0, -1.95], [0, 1.0, -1.55]],
    belt: { from: [-side + 0.1, SEAT_Y + 0.97, -0.85], to: [-0.06, SEAT_Y + 0.12, -0.5] },
    length: L,
    width: W,
  }
}

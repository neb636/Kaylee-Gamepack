// A songthaew, the pickup-truck bus of Thailand ("two benches"): a little cab in front, and in the open back two
// benches facing each other under a striped roof on posts, a step at the back to hop on. Krabi's are bright, so this
// one is coral pink with white and butter stripes. The family sit on the far bench (facing the camera at the curb), the
// suitcase rides on the near one. Faces +x (it drives along the road).
import { Group } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'

const BODY0 = '#FF6F8E'
const STRIPE0 = PAL.cream
const ROOF0 = PAL.butter
const SEAT0 = '#C9B5F7'
const GLASS = '#CDEBFF'
const CHROME = '#EEF0F6'
const DARK = '#3E3849'
const LAMP = '#FFF6C8'
/** The roof's middle (its underside 0.05 lower): Dad, sitting on the bench, comes up to about 2.4 m. */
const ROOF_Y = 2.85

export interface Songthaew {
  root: Group
  /** Bounces on the road (the riders sit in it). */
  body: Group
  /** Seat groups along the far bench (local to `body`), back to front: Kaylee at the open back, Mom, Dad. */
  seats: { kaylee: Group; ji: Group; nick: Group }
  /** Where the suitcase rides (local to `body`). */
  luggage: Group
  wheels: Group[]
  length: number
}

/** Its paint: Krabi's coral pink by default; Koh Samet's taxis are island green. */
export interface SongthaewPaint {
  body: string
  stripe: string
  roof: string
  seat: string
}
export const SAMET_GREEN: SongthaewPaint = { body: '#4FBF7A', stripe: PAL.cream, roof: '#FFFFFF', seat: '#FFE08A' }

export function buildSongthaew(bag: Bag, paint?: SongthaewPaint): Songthaew {
  const BODY = paint?.body ?? BODY0
  const STRIPE = paint?.stripe ?? STRIPE0
  const ROOF = paint?.roof ?? ROOF0
  const SEAT = paint?.seat ?? SEAT0
  const root = new Group()
  const body = new Group()
  root.add(body)
  const L = 4.6
  const W = 1.9
  const bedX = -0.55
  const bedL = 2.9
  // The cab's middle, the hood's middle, the front wheels' axle and the very front of the grille.
  const CAB_X = 1.25
  const HOOD_X = 1.98
  const FRONT_X = 1.8
  const NOSE = 2.28
  const parts = [
    // The cab, a little pickup's front: a hood sloping down to a chrome grille with dark slats, round headlamps in
    // chrome rings with amber blinkers beside them, a chunky bumper with a number plate, fenders arching over the
    // front wheels, a raked windshield on its pillars under a cab roof, open side windows (the driver shows through
    // them; it's hot), a door line, wing mirrors on stalks and two wipers.
    P.rbox(0.62, 0.7, W - 0.02, 0.14, BODY, { at: [HOOD_X, 0.8, 0], rot: [0, 0, -0.07] }),
    P.rbox(0.92, 0.72, W, 0.16, BODY, { at: [CAB_X, 0.78, 0] }),
    P.rbox(0.12, 0.66, W, 0.05, BODY, { at: [CAB_X - 0.42, 1.46, 0] }),
    P.rbox(0.86, 0.09, W - 0.04, 0.04, BODY, { at: [CAB_X - 0.06, 1.82, 0] }),
    // The windshield between its pillars, leaning back from the hood to the roof.
    P.box(0.04, 0.68, W - 0.3, GLASS, { at: [CAB_X + 0.31, 1.47, 0], rot: [0, 0, 0.42] }),
    ...[-1, 1].flatMap((s) => [
      P.box(0.07, 0.72, 0.08, BODY, { at: [CAB_X + 0.31, 1.47, s * (W / 2 - 0.06)], rot: [0, 0, 0.42] }),
      P.box(0.07, 0.7, 0.08, BODY, { at: [CAB_X - 0.06, 1.47, s * (W / 2 - 0.04)] }),
      // The door line and its handle.
      P.box(0.03, 0.5, 0.012, DARK, { at: [CAB_X - 0.3, 0.84, s * (W / 2 + 0.002)] }),
      P.rbox(0.12, 0.035, 0.03, 0.012, CHROME, { at: [CAB_X - 0.18, 1.02, s * (W / 2 + 0.01)] }),
      // A wing mirror on its stalk.
      P.cyl(0.018, 0.018, 0.2, DARK, { at: [CAB_X + 0.3, 1.2, s * (W / 2 + 0.08)], rot: [s * 1.2, 0, 0] }, 6),
      P.rbox(0.06, 0.16, 0.12, 0.03, DARK, { at: [CAB_X + 0.3, 1.27, s * (W / 2 + 0.17)] }),
      // A wiper resting on the glass.
      P.box(0.025, 0.025, 0.5, DARK, { at: [CAB_X + 0.5, 1.17, s * 0.32], rot: [0, 0, 0.42] }),
      // The fender arching over the front wheel, and a little step under the door.
      P.torus(0.36, 0.08, BODY, { at: [FRONT_X, 0.3, s * (W / 2 - 0.04)] }, Math.PI),
      P.rbox(0.5, 0.06, 0.18, 0.02, DARK, { at: [CAB_X - 0.1, 0.36, s * (W / 2 + 0.02)] }),
      // A round headlamp in its chrome ring, an amber blinker under it.
      P.cyl(0.13, 0.13, 0.06, CHROME, { at: [NOSE + 0.01, 0.92, s * 0.64], rot: [0, 0, Math.PI / 2] }, 18),
      P.cyl(0.1, 0.1, 0.07, LAMP, { at: [NOSE + 0.02, 0.92, s * 0.64], rot: [0, 0, Math.PI / 2] }, 18),
      P.rbox(0.05, 0.07, 0.16, 0.02, '#FFB347', { at: [NOSE, 0.72, s * 0.66] }),
    ]),
    // The grille: chrome surround, dark slats, a little round badge.
    P.rbox(0.06, 0.34, 0.9, 0.04, CHROME, { at: [NOSE, 0.88, 0] }),
    ...[0.8, 0.88, 0.96].map((y) => P.box(0.03, 0.035, 0.78, DARK, { at: [NOSE + 0.03, y, 0] })),
    P.cyl(0.05, 0.05, 0.03, PAL.butter, { at: [NOSE + 0.045, 1.0, 0], rot: [0, 0, Math.PI / 2] }, 12),
    // The bumper and its number plate.
    P.rbox(0.2, 0.17, W + 0.08, 0.07, CHROME, { at: [NOSE + 0.05, 0.52, 0] }),
    P.rbox(0.03, 0.12, 0.42, 0.02, '#FFFFFF', { at: [NOSE + 0.16, 0.52, 0] }),
    P.box(0.02, 0.025, 0.3, DARK, { at: [NOSE + 0.175, 0.53, 0] }),
    // A white stripe and a butter one along the whole truck.
    P.box(L - 0.6, 0.08, W + 0.02, STRIPE, { at: [-0.3, 0.62, 0] }),
    P.box(L - 0.6, 0.05, W + 0.03, ROOF, { at: [-0.3, 0.5, 0] }),
    // The open back: its floor, low side walls, the two benches with their backs, and the step.
    P.box(bedL, 0.5, W, BODY, { at: [bedX, 0.6, 0] }),
    P.box(bedL, 0.04, W - 0.16, '#B9A6F5', { at: [bedX, 0.87, 0] }),
    ...[-1, 1].flatMap((s) => [
      P.rbox(bedL - 0.2, 0.12, 0.42, 0.04, SEAT, { at: [bedX, 1.1, s * (W / 2 - 0.3)] }),
      P.box(bedL - 0.2, 0.24, 0.12, SEAT, { at: [bedX, 0.98, s * (W / 2 - 0.3)] }),
    ]),
    // The far bench's back (the near one has none, so the family on the far bench shows from the curb).
    P.rbox(bedL - 0.2, 0.42, 0.08, 0.03, SEAT, { at: [bedX, 1.44, -(W / 2 - 0.08)] }),
    P.rbox(0.3, 0.08, 0.9, 0.03, '#D9D5E6', { at: [bedX - bedL / 2 - 0.12, 0.38, 0] }),
    // The roof on its posts, striped, with a rail round it: high enough for Dad sitting up tall, horn and all.
    ...[-1, 1].flatMap((s) => [bedX - bedL / 2 + 0.06, bedX, bedX + bedL / 2 - 0.06].map((x) => P.cyl(0.04, 0.04, ROOF_Y - 0.85, '#F4EFF8', { at: [x, (ROOF_Y + 0.85) / 2, s * (W / 2 - 0.05)] }))),
    P.rbox(bedL + 0.1, 0.1, W + 0.1, 0.05, ROOF, { at: [bedX, ROOF_Y, 0] }),
    ...[-0.7, 0, 0.7].map((dz) => P.box(bedL + 0.12, 0.11, 0.2, BODY, { at: [bedX, ROOF_Y, dz] })),
    P.box(bedL + 0.1, 0.06, 0.06, '#F4EFF8', { at: [bedX, ROOF_Y + 0.14, W / 2] }),
    P.box(bedL + 0.1, 0.06, 0.06, '#F4EFF8', { at: [bedX, ROOF_Y + 0.14, -W / 2] }),
    // A grab rail at the back.
    P.cyl(0.03, 0.03, W - 0.2, '#F4EFF8', { at: [bedX - bedL / 2 + 0.02, 1.25, 0], rot: [Math.PI / 2, 0, 0] }),
  ]
  body.add(solid(merge(parts), bag, 2))

  const wheels: Group[] = []
  for (const [x, z] of [[FRONT_X, 1], [FRONT_X, -1], [bedX - 0.7, 1], [bedX - 0.7, -1]]) {
    const w = new Group()
    w.position.set(x, 0.3, z * (W / 2 - 0.06))
    w.add(solid(merge([P.torus(0.24, 0.1, PAL.ink), P.cyl(0.13, 0.13, 0.1, '#EDEAF5', { rot: [Math.PI / 2, 0, 0] }), P.box(0.3, 0.05, 0.11, PAL.hotpink)]), bag, 2))
    root.add(w)
    wheels.push(w)
  }
  const seat = (x: number) => {
    const g = new Group()
    g.position.set(x, 1.16, -(W / 2 - 0.3))
    body.add(g)
    return g
  }
  const seats = { kaylee: seat(bedX - 0.95), ji: seat(bedX + 0.05), nick: seat(bedX + 1.0) }
  const luggage = new Group()
  luggage.position.set(bedX - 0.4, 1.16, W / 2 - 0.32)
  body.add(luggage)
  return { root, body, seats, luggage, wheels, length: L }
}

// A songthaew, the pickup-truck bus of Thailand ("two benches"): a little cab in front, and in the open back two
// benches facing each other under a striped roof on posts, a step at the back to hop on. Krabi's are bright, so this
// one is coral pink with white and butter stripes. The family sit on the far bench (facing the camera at the curb), the
// suitcase rides on the near one. Faces +x (it drives along the road).
import { Group } from 'three'
import type { Bag } from '../../engine/dispose'
import { merge, P, solid } from '../../engine/geo'
import { PAL } from '../../engine/toon'

const BODY = '#FF6F8E'
const STRIPE = PAL.cream
const ROOF = PAL.butter
const SEAT = '#C9B5F7'
const GLASS = '#CDEBFF'
/** The roof's middle (its underside 0.05 lower): Daddy, sitting on the bench, comes up to about 2.4 m. */
const ROOF_Y = 2.85

export interface Songthaew {
  root: Group
  /** Bounces on the road (the riders sit in it). */
  body: Group
  /** Seat groups along the far bench (local to `body`), back to front: Kaylee at the open back, Mommy, Daddy. */
  seats: { kaylee: Group; ji: Group; nick: Group }
  /** Where the suitcase rides (local to `body`). */
  luggage: Group
  wheels: Group[]
  length: number
}

export function buildSongthaew(bag: Bag): Songthaew {
  const root = new Group()
  const body = new Group()
  root.add(body)
  const L = 4.6
  const W = 1.9
  const bedX = -0.55
  const bedL = 2.9
  const parts = [
    // The cab: a rounded box with a windshield, side windows, a bumper and round lights.
    P.rbox(1.45, 0.75, W, 0.22, BODY, { at: [L / 2 - 0.75, 0.75, 0] }),
    P.rbox(1.05, 0.62, W - 0.12, 0.18, BODY, { at: [L / 2 - 0.95, 1.42, 0] }),
    P.box(0.04, 0.46, W - 0.36, GLASS, { at: [L / 2 - 0.43, 1.42, 0], rot: [0, 0, -0.35] }),
    ...[-1, 1].map((s) => P.box(0.66, 0.4, 0.04, GLASS, { at: [L / 2 - 0.98, 1.44, s * (W / 2 - 0.04)] })),
    P.rbox(0.16, 0.18, W - 0.1, 0.06, '#D9D5E6', { at: [L / 2 - 0.02, 0.45, 0] }),
    ...[-1, 1].map((s) => P.sphere(0.11, PAL.butter, { at: [L / 2 - 0.02, 0.82, s * 0.62], scale: [0.4, 1, 1] })),
    // A white stripe and a butter one along the whole truck.
    P.box(L - 0.1, 0.08, W + 0.02, STRIPE, { at: [-0.05, 0.62, 0] }),
    P.box(L - 0.1, 0.05, W + 0.03, ROOF, { at: [-0.05, 0.5, 0] }),
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
    // The roof on its posts, striped, with a rail round it: high enough for Daddy sitting up tall, horn and all.
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
  for (const [x, z] of [[L / 2 - 0.85, 1], [L / 2 - 0.85, -1], [bedX - 0.7, 1], [bedX - 0.7, -1]]) {
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

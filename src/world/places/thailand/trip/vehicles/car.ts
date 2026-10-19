// Aunty Sri's car, greybox: a little rounded lavender family car (like her blouse, until Dad says what she really
// drives). The steering wheel is on the right, as in every Thai car, so Aunty Sri sits on the right and Daddy beside
// her; Mommy and Kaylee sit in the back, Kaylee by the left window. Faces +z. The roof lifts off for the ride (the
// camera looks in like the house's dollhouse view); it stays on in the street at the goodbye.
import { Group, Mesh, MeshBasicMaterial } from 'three'
import type { Bag } from '../../engine/dispose'
import { merge, P, solid, type V3 } from '../../engine/geo'
import { PAL } from '../../engine/toon'
import { buildItem } from '../props'

const BODY = '#C9B5F7'
const TRIM = '#A792EE'
const SEAT = '#FFF0DA'
const GLASS = '#CDEBFF'

export interface Car {
  root: Group
  /** Rolls, pitches and bounces on the road. */
  body: Group
  roof: Group
  /** Seat groups (local to `body`) that the family sit in: tilt or bob them to move everyone with the car. */
  seats: { kaylee: Group; ji: Group; nick: Group; sri: Group }
  /** Kaylee's window glass (slides down), her seatbelt (shows when buckled) and its buckle. */
  window: Group
  belt: Group
  buckle: Group
  radio: Group
  /** The jasmine and marigold garland on the mirror (swings). */
  garland: Group
  /** The middle of the steering wheel: the horn. */
  horn: Group
  snacks: Group
  wheels: Group[]
  /** Where the suitcase goes in (local). */
  trunk: V3
  length: number
}

export function buildCar(bag: Bag): Car {
  const root = new Group()
  const body = new Group()
  root.add(body)
  const L = 3.7
  const W = 1.72
  const parts = [
    // The tub: a rounded lower body, a lighter belt line, bumpers and lights.
    P.rbox(W, 0.62, L, 0.24, BODY, { at: [0, 0.6, 0] }),
    P.box(W + 0.02, 0.06, L - 0.5, TRIM, { at: [0, 0.86, 0] }),
    P.rbox(W - 0.1, 0.16, 0.2, 0.06, PAL.cream, { at: [0, 0.38, L / 2 + 0.02] }),
    P.rbox(W - 0.1, 0.16, 0.2, 0.06, PAL.cream, { at: [0, 0.38, -L / 2 - 0.02] }),
    ...[-1, 1].map((s) => P.sphere(0.1, PAL.butter, { at: [s * 0.6, 0.64, L / 2 + 0.02], scale: [1, 0.8, 0.5] })),
    ...[-1, 1].map((s) => P.sphere(0.09, '#FF6F8E', { at: [s * 0.62, 0.66, -L / 2 - 0.02], scale: [1, 0.8, 0.5] })),
    // Inside: the floor, the seats (front pair and back bench), the dashboard and the steering wheel on the right.
    P.box(W - 0.2, 0.06, L - 0.6, '#8C7CC4', { at: [0, 0.58, -0.1] }),
    ...[-1, 1].flatMap((s) => [P.rbox(0.6, 0.16, 0.55, 0.06, SEAT, { at: [s * 0.42, 0.62, 0.4] }), P.rbox(0.6, 0.62, 0.14, 0.06, SEAT, { at: [s * 0.42, 0.95, 0.1], rot: [-0.12, 0, 0] })]),
    P.rbox(W - 0.24, 0.16, 0.6, 0.06, SEAT, { at: [0, 0.62, -0.75] }),
    P.rbox(W - 0.24, 0.6, 0.14, 0.06, SEAT, { at: [0, 0.94, -1.1], rot: [-0.14, 0, 0] }),
    P.rbox(W - 0.12, 0.28, 0.42, 0.08, TRIM, { at: [0, 0.98, 1.05] }),
    P.torus(0.16, 0.025, PAL.ink, { at: [-0.42, 1.14, 0.8], rot: [-0.5, 0, 0] }),
    P.cyl(0.025, 0.025, 0.25, PAL.ink, { at: [-0.42, 1.06, 0.92], rot: [0.9, 0, 0] }),
    // The windscreen frame and its glass (the roof's front edge stays).
    ...[-1, 1].map((s) => P.box(0.06, 0.55, 0.06, TRIM, { at: [s * (W / 2 - 0.08), 1.18, 1.15], rot: [-0.35, 0, 0] })),
    P.box(W - 0.2, 0.06, 0.06, TRIM, { at: [0, 1.43, 1.06] }),
    // The rear-view mirror.
    P.box(0.22, 0.07, 0.04, PAL.ink, { at: [0, 1.36, 1.0] }),
  ]
  body.add(solid(merge(parts), bag, 2))
  const glassMat = bag.add(new MeshBasicMaterial({ color: GLASS, transparent: true, opacity: 0.35, depthWrite: false }))
  body.add(new Mesh(bag.add(P.box(W - 0.24, 0.5, 0.02, '#FFFFFF', { at: [0, 1.17, 1.13], rot: [-0.35, 0, 0] })), glassMat))

  // The wheels turn.
  const wheels: Group[] = []
  for (const [x, z] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const w = new Group()
    w.position.set(x * (W / 2 - 0.12), 0.3, z * (L / 2 - 0.62))
    w.add(solid(merge([P.torus(0.24, 0.1, PAL.ink, { rot: [0, Math.PI / 2, 0] }), P.cyl(0.12, 0.12, 0.08, '#D8D2E6', { rot: [0, 0, Math.PI / 2] }), P.box(0.1, 0.32, 0.05, '#B9B2CC', { at: [x * 0.03, 0, 0] })]), bag, 2))
    body.add(w)
    wheels.push(w)
  }

  // The roof: pillars and a rounded top (off for the ride, so the camera sees in).
  const roof = new Group()
  roof.add(solid(merge([P.rbox(W - 0.12, 0.12, 1.85, 0.06, BODY, { at: [0, 1.62, -0.35] }), ...[-1, 1].flatMap((s) => [P.box(0.08, 0.7, 0.08, TRIM, { at: [s * (W / 2 - 0.1), 1.25, -1.2] }), P.box(0.08, 0.7, 0.08, TRIM, { at: [s * (W / 2 - 0.1), 1.25, -0.2] })])]), bag, 2))
  for (const s of [-1, 1]) for (const z of [0.45, -0.7]) roof.add(new Mesh(bag.add(P.box(0.02, 0.45, 0.8, '#FFFFFF', { at: [s * (W / 2 - 0.08), 1.18, z] })), glassMat))
  body.add(roof)

  // Kaylee's window (back left), which slides down into the door.
  const window = new Group()
  window.position.set(W / 2 - 0.07, 0, -0.72)
  window.add(new Mesh(bag.add(P.box(0.03, 0.44, 0.78, '#FFFFFF', { at: [0, 1.15, 0] })), glassMat))
  window.add(solid(merge([P.box(0.05, 0.04, 0.8, TRIM, { at: [0, 1.38, 0] })]), bag, 1.5))
  window.userData.pick = 'window'
  body.add(window)

  const seat = (x: number, z: number) => {
    const g = new Group()
    g.position.set(x, 0.7, z)
    body.add(g)
    return g
  }
  const seats = { sri: seat(-0.42, 0.45), nick: seat(0.42, 0.45), ji: seat(-0.45, -0.72), kaylee: seat(0.45, -0.72) }

  // Her seatbelt (a strap over her shoulder, only once it's buckled) and its buckle by her hip.
  const belt = new Group()
  belt.add(solid(merge([P.box(0.06, 0.62, 0.02, '#5E5468', { at: [0.02, 0.3, 0.14], rot: [0, 0, 0.75] })]), bag, 1))
  belt.visible = false
  seats.kaylee.add(belt)
  const buckle = new Group()
  buckle.position.set(-0.24, 0.05, 0.08)
  buckle.add(solid(merge([P.rbox(0.1, 0.07, 0.06, 0.02, PAL.gold), P.box(0.06, 0.02, 0.07, PAL.hotpink, { at: [0, 0.035, 0] })]), bag, 1.5))
  buckle.userData.pick = 'belt'
  seats.kaylee.add(buckle)

  const radio = new Group()
  // Forward on the dash, under the windscreen (apart from the wheel and the garland, so each is easy to tap).
  radio.position.set(0.15, 1.15, 1.2)
  radio.add(solid(merge([P.rbox(0.3, 0.12, 0.08, 0.03, PAL.cream), P.sphere(0.03, PAL.hotpink, { at: [-0.09, 0, 0.04] }), P.sphere(0.03, PAL.mint, { at: [0.09, 0, 0.04] })]), bag, 1.5))
  radio.userData.pick = 'radio'
  body.add(radio)

  const garland = new Group()
  garland.position.set(0, 1.33, 0.98)
  garland.add(solid(merge([...Array.from({ length: 7 }, (_, i) => P.sphere(0.028, i % 3 === 0 ? '#FF9F45' : PAL.cream, { at: [Math.sin((i / 6) * Math.PI) * 0.06 - 0.03, -0.04 - (i / 6) * 0.18, 0] })), P.sphere(0.04, '#FF6F8E', { at: [0, -0.26, 0] })]), bag, 1))
  garland.userData.pick = 'garland'
  body.add(garland)

  const horn = new Group()
  horn.position.set(-0.42, 1.14, 0.8)
  horn.rotation.x = -0.5
  horn.add(solid(merge([P.cyl(0.07, 0.07, 0.04, PAL.hotpink, { rot: [Math.PI / 2, 0, 0] })]), bag, 1.5))
  horn.userData.pick = 'horn'
  body.add(horn)

  // Jum's snack bag on the back seat between Kaylee and Mommy.
  const snacks = buildItem('snacks', bag)
  snacks.position.set(0, 0.7, -0.72)
  snacks.scale.setScalar(0.85)
  snacks.userData.pick = 'snacks'
  body.add(snacks)

  return { root, body, roof, seats, window, belt, buckle, radio, garland, horn, snacks, wheels, trunk: [0, 0.95, -L / 2 + 0.3], length: L }
}

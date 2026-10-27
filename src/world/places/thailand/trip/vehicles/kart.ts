// A go-kart for the Nan Mountain Cup (activities/nan-trip/cup/): a low toy racer on four fat wheels, built from simple
// shapes in the toon look. Kaylee's is pink with a little horn on the nose (plan: "her own pink kart"); the rivals
// drive the same kart in their own colors. One seat behind a little steering wheel; the front wheels turn with the
// steering and every wheel spins with the speed. Faces +z, its middle on the ground at the origin.
import { Group, type BufferGeometry } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'
import type { Feel } from '../../../../engine3d/drive'
import type { Seat, Vehicle } from './vehicle'

/** Her kart's feel before the race's own knobs (cup/race.ts) take over. */
export const KART_FEEL: Feel = { top: 13, boost: 1.6, accel: 9, coast: 0.5, turn: 2.4, grip: 4, near: 2, far: 9, dead: 0.04, lean: 0.12 }

export interface KartColors {
  body: string
  trim: string
  seat: string
}
export const PINK_KART: KartColors = { body: PAL.hotpink, trim: '#FFFFFF', seat: PAL.lavenderDark }

const TYRE = '#4A4352'
const HUB = '#E9ECF4'
const L = 2.4
const W = 1.5
/** The wheels' radius: the kart sits this high off the ground. */
const R = 0.3

export interface Kart extends Vehicle {
  /** The horn on the nose (squashes when she honks). */
  horn: Group | null
  /** Where the driver sits (local to `body`): a block or Kaylee goes in here. */
  seat: Group
}

export function buildKart(bag: Bag, colors: KartColors = PINK_KART, o: { horn?: boolean } = {}): Kart {
  const root = new Group()
  const body = new Group()
  root.add(body)
  const { body: c, trim, seat: seatColor } = colors
  const parts: BufferGeometry[] = [
    // The tub: a low rounded floor, raised sides, a sloping nose with a bumper, a rear bumper.
    P.rbox(W * 0.78, 0.22, L * 0.9, 0.08, c, { at: [0, R + 0.02, 0] }),
    P.rbox(0.22, 0.32, L * 0.62, 0.08, c, { at: [W * 0.39 - 0.11, R + 0.2, -0.1] }),
    P.rbox(0.22, 0.32, L * 0.62, 0.08, c, { at: [-W * 0.39 + 0.11, R + 0.2, -0.1] }),
    P.rbox(W * 0.62, 0.3, 0.75, 0.1, c, { at: [0, R + 0.17, L * 0.33], rot: [-0.25, 0, 0] }),
    P.rbox(W * 0.9, 0.16, 0.18, 0.06, trim, { at: [0, R - 0.02, L / 2 - 0.02] }),
    P.rbox(W * 0.9, 0.16, 0.18, 0.06, trim, { at: [0, R - 0.02, -L / 2 + 0.06] }),
    // A white stripe down the nose.
    P.box(0.22, 0.04, 0.6, trim, { at: [0, R + 0.34, L * 0.33], rot: [-0.25, 0, 0] }),
    // The seat: a cushion and a high back.
    P.rbox(0.62, 0.14, 0.5, 0.06, seatColor, { at: [0, R + 0.18, -0.38] }),
    P.rbox(0.62, 0.62, 0.14, 0.06, seatColor, { at: [0, R + 0.45, -0.7], rot: [-0.2, 0, 0] }),
    // The engine behind the seat, an exhaust pipe.
    P.rbox(0.62, 0.3, 0.32, 0.06, '#A3AAC4', { at: [0, R + 0.2, -1.0] }),
    P.cyl(0.06, 0.06, 0.32, '#7E86A6', { at: [0.24, R + 0.3, -1.2], rot: [Math.PI / 2, 0, 0] }, 8),
    // The steering column.
    P.cyl(0.03, 0.03, 0.5, '#5E5468', { at: [0, R + 0.42, 0.12], rot: [0.9, 0, 0] }, 6),
  ]
  body.add(solid(merge(parts), bag, 2))

  // The steering wheel, on its own pivot (it turns with the steering).
  const wheel = new Group()
  wheel.position.set(0, R + 0.58, 0.02)
  wheel.rotation.x = -0.9
  wheel.add(solid(merge([P.torus(0.15, 0.035, '#5E5468', { rot: [Math.PI / 2, 0, 0] })]), bag, 1))
  body.add(wheel)

  // The horn on the nose: a pink bulb on a little gold trumpet.
  let horn: Group | null = null
  if (o.horn !== false) {
    horn = new Group()
    horn.position.set(0.32, R + 0.36, L * 0.42)
    horn.add(solid(merge([P.cone(0.09, 0.22, PAL.gold, { at: [0, 0, 0.1], rot: [Math.PI / 2, 0, 0] }, 10), P.sphere(0.1, PAL.pink, { at: [0, 0, -0.06] }, 10)]), bag, 1))
    body.add(horn)
  }

  // The wheels: fat tyres with pale hubs, each on its own pivot (spin), the front ones on a steering pivot too.
  const wheels: { spin: Group; steer: Group | null }[] = []
  for (const [x, z, front] of [[W / 2, L * 0.34, true], [-W / 2, L * 0.34, true], [W / 2, -L * 0.33, false], [-W / 2, -L * 0.33, false]] as const) {
    const steer = new Group()
    steer.position.set(x, R, z)
    const spin = new Group()
    const tyre = merge([P.cyl(R, R, 0.3, TYRE, { rot: [0, 0, Math.PI / 2] }, 14), P.cyl(R * 0.5, R * 0.5, 0.32, HUB, { rot: [0, 0, Math.PI / 2] }, 10), P.box(0.33, R * 0.25, R * 1.1, HUB)])
    spin.add(solid(tyre, bag, 2))
    steer.add(spin)
    root.add(steer)
    wheels.push({ spin, steer: front ? steer : null })
  }

  // Where the driver sits.
  const seat = new Group()
  seat.position.set(0, R + 0.25, -0.38)
  body.add(seat)

  const at: Seat = { x: 0, y: R + 0.25, z: -0.38 }
  let roll = 0
  const kart: Kart = {
    root,
    body,
    seat,
    horn,
    seats: { kaylee: at, ji: at, nick: at },
    hull: { at: [-0.55, 0.55], r: 0.78 },
    // (Its own copy: the race changes its top speed as she picks up coins.)
    feel: { ...KART_FEEL },
    stern: -L / 2,
    bow: L / 2,
    animate(steer, speed, _t, dt) {
      roll += (speed * kart.feel.top * dt) / R
      for (const w of wheels) {
        w.spin.rotation.x = roll
        if (w.steer) w.steer.rotation.y = -steer * 0.45
      }
      wheel.rotation.z = steer * 0.9
    },
  }
  return kart
}

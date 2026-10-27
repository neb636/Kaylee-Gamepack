// The yellow sea canoe, greybox: the hidden lagoons are only reached by little boats through low caves (Phang Nga Bay's
// real canoe trips). Low and drifty. Daddy paddles in front; Kaylee steers from the back, like a canoe's captain.
import { Group } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'
import type { Feel } from '../drive'
import type { Vehicle } from './vehicle'

const YELLOW = '#FFD34D'
const INSIDE = '#FFF0B8'

export const CANOE_FEEL: Feel = { top: 2.6, boost: 1.4, accel: 1.8, coast: 0.6, turn: 0.9, grip: 1.1, near: 1.5, far: 9, dead: 0.15, lean: 0.1 }

export function buildCanoe(bag: Bag): Vehicle {
  const root = new Group()
  const body = new Group()
  root.add(body)
  const L = 4.4
  body.add(
    solid(
      merge([
        P.capsule(0.46, L - 0.92, YELLOW, { at: [0, 0.12, 0], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.55] }),
        P.box(0.7, 0.05, L - 1.3, INSIDE, { at: [0, 0.34, 0] }),
        P.box(0.84, 0.06, 0.12, PAL.hotpink, { at: [0, 0.36, L / 2 - 0.55] }),
        P.box(0.84, 0.06, 0.12, PAL.hotpink, { at: [0, 0.36, -L / 2 + 0.55] }),
      ]),
      bag,
      2,
    ),
  )
  // Daddy's paddle: a stick with a blade at each end, dipping left and right.
  const paddle = new Group()
  paddle.position.set(0, 1.0, 1.15)
  paddle.add(solid(merge([P.cyl(0.03, 0.03, 2.2, '#8C6A55', { rot: [0, 0, Math.PI / 2] }), ...[-1, 1].map((s) => P.rbox(0.42, 0.04, 0.2, 0.02, PAL.mint, { at: [s * 1.1, 0, 0] }))]), bag, 1.5))
  body.add(paddle)
  let stroke = 0

  return {
    root,
    body,
    seats: { nick: { x: 0, y: 0.34, z: 1.15 }, ji: { x: 0, y: 0.34, z: 0.05 }, kaylee: { x: 0, y: 0.34, z: -1.1 } },
    hull: { at: [1.4, 0, -1.4], r: 0.5 },
    feel: CANOE_FEEL,
    stern: -L / 2,
    bow: L / 2,
    animate(steer, speed, _t, dt) {
      stroke += dt * (1.2 + 3.2 * Math.min(1, Math.abs(speed)))
      paddle.rotation.z = Math.sin(stroke) * 0.55 + steer * 0.2
      paddle.rotation.x = Math.cos(stroke) * 0.25
    },
  }
}

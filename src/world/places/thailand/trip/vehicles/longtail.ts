// The family's longtail boat (เรือหางยาว, ruea hang yao), greybox: a long, narrow wooden boat with a bow that sweeps up,
// two benches, and at the back a car engine on a pivot with a long pole that reaches into the water, the propeller at
// its end. Real longtails steer by swinging the whole engine and pole: Kaylee stands at the back holding the handle.
// Ribbons on the bow come in the next gate.
import { Group } from 'three'
import type { Bag } from '../../engine/dispose'
import { merge, P, solid } from '../../engine/geo'
import { PAL } from '../../engine/toon'
import type { Feel } from '../drive'
import type { Vehicle } from './vehicle'

const WOOD = '#E6A375'
const WOOD_IN = '#F6D3AE'
const ENGINE = '#A3AAC4'
const POLE = '#5E5468'

/** Tuned by eye in the greybox (the ?debug panel edits it live). */
export const LONGTAIL_FEEL: Feel = { top: 9, boost: 1.75, accel: 5, coast: 0.42, turn: 1.35, grip: 2.2, near: 3, far: 26, dead: 0.2, lean: 0.16 }

export function buildLongtail(bag: Bag): Vehicle {
  const root = new Group()
  const body = new Group()
  root.add(body)
  const L = 6.4
  const parts = [
    // The hull: a long rounded tub, a pink stripe along the top, the inside lighter.
    P.rbox(1.3, 0.55, L, 0.25, WOOD, { at: [0, 0.2, 0] }),
    P.box(1.36, 0.1, L - 0.6, PAL.hotpink, { at: [0, 0.43, -0.1] }),
    P.box(1.1, 0.06, L - 1.2, WOOD_IN, { at: [0, 0.46, -0.2] }),
    // The bow sweeps up into a tall prow.
    P.rbox(0.9, 0.4, 1.3, 0.18, WOOD, { at: [0, 0.48, L / 2 - 0.25], rot: [-0.45, 0, 0] }),
    P.rbox(0.42, 0.34, 1.1, 0.15, WOOD, { at: [0, 0.92, L / 2 + 0.25], rot: [-0.9, 0, 0] }),
    P.cyl(0.07, 0.09, 0.7, WOOD, { at: [0, 1.32, L / 2 + 0.55], rot: [-0.35, 0, 0] }),
    // Two benches.
    ...[0.9, -0.5].map((z) => P.box(1.2, 0.08, 0.36, WOOD_IN, { at: [0, 0.5, z] })),
    // The engine's post at the stern.
    P.cyl(0.08, 0.1, 0.4, POLE, { at: [0, 0.6, -L / 2 + 0.35] }),
  ]
  body.add(solid(merge(parts), bag, 2))

  // The tail: the engine, the long pole into the water and the propeller, all swinging round the post.
  const tail = new Group()
  tail.position.set(0, 0.85, -L / 2 + 0.35)
  tail.add(
    solid(
      merge([
        P.rbox(0.5, 0.42, 0.68, 0.1, ENGINE, { at: [0, 0.1, 0.05] }),
        P.cyl(0.1, 0.1, 0.12, PAL.ink, { at: [0, 0.36, 0.05] }),
        // The handle Kaylee holds, reaching forward.
        P.cyl(0.035, 0.035, 0.9, POLE, { at: [0, 0.18, 0.75], rot: [Math.PI / 2 - 0.25, 0, 0] }),
        P.sphere(0.06, PAL.hotpink, { at: [0, 0.29, 1.18] }),
        // The pole, slanting back and down to the water.
        P.cyl(0.05, 0.05, 3.1, POLE, { at: [0, -0.32, -1.5], rot: [Math.PI / 2 - 0.26, 0, 0] }),
      ]),
      bag,
      2,
    ),
  )
  const prop = new Group()
  prop.position.set(0, -0.72, -3.0)
  prop.add(solid(merge([P.box(0.5, 0.08, 0.05, PAL.gold), P.box(0.08, 0.5, 0.05, PAL.gold)]), bag, 1.5))
  tail.add(prop)
  body.add(tail)

  return {
    root,
    body,
    seats: { nick: { x: 0, y: 0.52, z: 0.9 }, ji: { x: 0, y: 0.52, z: -0.5 }, kaylee: { x: -0.18, y: 0.42, z: -1.95, stand: true } },
    hull: { at: [2.4, 0.4, -1.8], r: 0.85 },
    feel: LONGTAIL_FEEL,
    stern: -L / 2 - 2.7,
    bow: L / 2 + 0.4,
    animate(steer, speed, t, dt) {
      // Steering swings the tail the other way (push the handle left, the boat goes right).
      tail.rotation.y += (-steer * 0.45 - tail.rotation.y) * Math.min(1, dt * 8)
      // Faster = the pole dips deeper and the propeller spins.
      tail.rotation.x = 0.04 * speed
      prop.rotation.z += dt * (8 + 50 * speed)
      // The engine shakes a little.
      tail.position.y = 0.85 + Math.sin(t * 60) * 0.006 * (0.4 + speed)
    },
  }
}

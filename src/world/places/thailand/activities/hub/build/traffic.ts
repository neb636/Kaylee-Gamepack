// Life on the street: now and then a scooter or a pink taxi (Bangkok's taxis are pink!) drives past on the far lane,
// with a little putt-putt as it goes by. Only while she's outside; not tappable (it doesn't stop).
import { Group } from 'three'
import { P } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { sfx } from '../../../sfx'
import { scenery, type Kit } from './kit'

const LANE_Z = 6.7
const FROM = 30

interface Car {
  g: Group
  speed: number
  /** Seconds until it sets off again (while waiting off-screen). */
  wait: number
  honked: boolean
}

export class Traffic {
  readonly root = new Group()
  private cars: Car[]

  constructor(kit: Kit) {
    const wheel = (x: number, z: number, r = 0.22) => P.torus(r, r * 0.35, PAL.ink, { at: [x, r, z] })
    // Both drive toward -x, so they face -x.
    const scooter = new Group()
    scooter.add(
      scenery(kit, [
        wheel(-0.5, 0),
        wheel(0.5, 0),
        P.rbox(0.95, 0.3, 0.32, 0.12, PAL.mint, { at: [0, 0.5, 0] }),
        P.rbox(0.2, 0.55, 0.24, 0.06, PAL.mint, { at: [-0.45, 0.68, 0], rot: [0, 0, 0.35] }),
        // The rider: a body, a helmet, arms on the handlebars.
        P.capsule(0.17, 0.25, '#FFB896', { at: [0.1, 0.95, 0] }),
        P.sphere(0.2, PAL.hotpink, { at: [0.05, 1.42, 0] }),
        P.box(0.04, 0.12, 0.3, '#5A8FD8', { at: [-0.13, 1.4, 0] }),
        ...[-1, 1].map((s) => P.capsule(0.05, 0.3, '#FFB896', { at: [-0.18, 1.0, s * 0.15], rot: [0, 0, 1.1] })),
      ]),
    )
    const taxi = new Group()
    taxi.add(
      scenery(kit, [
        ...[-0.7, 0.7].flatMap((x) => [wheel(x, -0.62, 0.26), wheel(x, 0.62, 0.26)]),
        P.rbox(2.3, 0.6, 1.3, 0.2, '#FF8FB8', { at: [0, 0.6, 0] }),
        P.rbox(1.3, 0.5, 1.2, 0.2, '#FF8FB8', { at: [0.15, 1.1, 0] }),
        ...[-1, 1].map((s) => P.box(1.1, 0.34, 0.02, '#CDEBFF', { at: [0.15, 1.12, s * 0.61] })),
        P.box(0.02, 0.34, 1.0, '#CDEBFF', { at: [-0.51, 1.12, 0] }),
        P.rbox(0.5, 0.14, 0.24, 0.05, PAL.butter, { at: [0.15, 1.42, 0] }),
        P.sphere(0.1, PAL.butter, { at: [-1.15, 0.65, 0.45], scale: [0.5, 1, 1] }),
        P.sphere(0.1, PAL.butter, { at: [-1.15, 0.65, -0.45], scale: [0.5, 1, 1] }),
      ]),
    )
    this.cars = [
      { g: scooter, speed: 6.5, wait: 3, honked: false },
      { g: taxi, speed: 4.6, wait: 11, honked: false },
    ]
    for (const c of this.cars) {
      c.g.position.set(FROM, 0, LANE_Z)
      this.root.add(c.g)
    }
  }

  /** `audible`: she's outside to hear it go by. */
  update(dt: number, audible: boolean) {
    for (const c of this.cars) {
      if (c.wait > 0) {
        c.wait -= dt
        continue
      }
      const p = c.g.position
      p.x -= c.speed * dt
      p.y = Math.abs(Math.sin(p.x * 3)) * 0.015
      if (!c.honked && p.x < 4) {
        c.honked = true
        if (audible) sfx.putt()
      }
      if (p.x < -FROM) {
        p.x = FROM
        c.honked = false
        c.wait = 6 + Math.random() * 10
      }
    }
  }
}

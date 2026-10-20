// The house gecko (a tokay, ตุ๊กแก "tuk-kae", named for its call): it crawls about high on the back wall of Kaylee's
// room upstairs (Dad, 2026-10-19), stops, looks around, and now and then calls. Tap it and it calls and scurries off
// somewhere else.
import { Group } from 'three'
import { P } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import { DIM } from '../layout'
import { poke, scenery, type Kit } from './kit'

const SKIN = '#9FB8E8'
const SPOT = '#FFB27A'
/** Where it roams on the back wall: x from..to, y from..to (between the air conditioner and the bathroom door). */
const ZONE = { x0: -0.2, x1: 1.5, y0: DIM.g0 + 1.9, y1: DIM.g0 + 2.65 }
const START = { x: 0.5, y: DIM.g0 + 2.3 }

export class Gecko {
  readonly root: Group
  private heading = new Group()
  private body = new Group()
  private target = { ...START }
  private speed = 0.18
  private rest = 2
  private callIn = 20 + Math.random() * 15

  constructor(kit: Kit) {
    this.root = poke(kit, 'gecko', [], [START.x, START.y, DIM.back + 0.04], { rotY: -Math.PI / 2 })
    // It goes where it likes: reactions mustn't snap it back to where it started.
    this.root.userData.moves = true
    // Built lying belly-down with its head toward +x; turned so its belly is on the wall and its back faces the room
    // (the root's turn puts that wall at the back: its local +z is the room's -x).
    this.body.rotation.z = -Math.PI / 2
    this.body.add(
      scenery(
        kit,
        [
          P.capsule(0.05, 0.14, SKIN, { rot: [0, 0, Math.PI / 2], scale: [1, 1, 0.8] }),
          P.sphere(0.06, SKIN, { at: [0.14, 0.005, 0], scale: [1.15, 0.7, 1] }),
          ...[-1, 1].map((s) => P.sphere(0.024, PAL.butter, { at: [0.15, 0.03, s * 0.045] })),
          ...[-0.1, -0.16, -0.22, -0.27, -0.31].map((x, i) => P.sphere(0.04 - i * 0.006, SKIN, { at: [x, 0, Math.sin(i * 0.9) * 0.04] })),
          ...[-1, 1].flatMap((s) =>
            [-0.05, 0.07].flatMap((x) => [P.capsule(0.014, 0.07, SKIN, { at: [x, -0.01, s * 0.07], rot: [s * 1.2, 0, x > 0 ? -0.5 : 0.5] }), P.sphere(0.02, SKIN, { at: [x + (x > 0 ? 0.04 : -0.04), -0.02, s * 0.11], scale: [1, 0.5, 1] })]),
          ),
          ...[
            [0.03, 0.02],
            [-0.04, -0.02],
            [0.08, -0.025],
            [-0.12, 0.012],
          ].map(([x, z]) => P.sphere(0.017, SPOT, { at: [x, 0.04, z], scale: [1, 0.5, 1] })),
        ],
        1.5,
      ),
      scenery(kit, [-1, 1].map((s) => P.sphere(0.011, PAL.ink, { at: [0.165, 0.042, s * 0.05] })), 0),
    )
    this.heading.add(this.body)
    // A toy-sized gecko (a real one would be lost on the wall from up here).
    this.heading.scale.setScalar(1.4)
    this.root.add(this.heading)
  }

  /** Startled: off it goes, fast, to the far side of its patch. */
  scare() {
    const p = this.root.position
    this.target = { y: ZONE.y0 + Math.random() * (ZONE.y1 - ZONE.y0), x: p.x < (ZONE.x0 + ZONE.x1) / 2 ? ZONE.x1 - Math.random() * 0.8 : ZONE.x0 + Math.random() * 0.8 }
    this.speed = 1.1
    this.rest = 0
  }

  /** Returns true when it wants to call on its own (the house plays the sound if she's there to hear it). */
  update(dt: number, t: number): boolean {
    const p = this.root.position
    const dy = this.target.y - p.y
    const dx = this.target.x - p.x
    const d = Math.hypot(dy, dx)
    let moving = false
    if (d > 0.01) {
      moving = true
      const step = Math.min(d, this.speed * dt)
      p.y += (dy / d) * step
      p.x += (dx / d) * step
      // Its head (built along -y once on the wall) points along the way it goes (world x is its local -z).
      const want = Math.atan2(dx, -dy)
      let diff = want - this.heading.rotation.x
      diff = Math.atan2(Math.sin(diff), Math.cos(diff))
      this.heading.rotation.x += diff * Math.min(1, dt * 10)
    } else {
      this.rest -= dt
      if (this.rest <= 0) {
        this.target = { y: ZONE.y0 + Math.random() * (ZONE.y1 - ZONE.y0), x: ZONE.x0 + Math.random() * (ZONE.x1 - ZONE.x0) }
        this.speed = 0.18
        this.rest = 2 + Math.random() * 4
      }
    }
    // A wiggle down its body while it runs, a slow look around while it rests.
    this.body.rotation.x = moving ? Math.sin(t * (this.speed > 0.5 ? 40 : 16)) * 0.25 : Math.sin(t * 0.8) * 0.12
    this.callIn -= dt
    if (this.callIn <= 0) {
      this.callIn = 30 + Math.random() * 25
      return true
    }
    return false
  }
}

// Pebble the emperor chick, riding on Pola's back (the film before the game ends with him hopping on). The same toy as
// in the films (story/actor.ts) and Penguin Slide: the chibi rig with Pebble's look. He is a passenger, never something
// she steers: the world (floe.ts) tells him what Pola is doing each frame and he acts it out. He holds on tight as she
// crouches, throws his flippers up in the air, bounces on a landing, stands tall and dry on her back while she swims
// (a chick's fluff isn't waterproof), and shakes when she does.
import { Group, type Vector3 } from 'three'
import { bell } from '../../../../../sdk'
import { buildAnimal, type Rig } from '../../../../engine3d/characters/animal'
import { FaceLife } from '../../../../engine3d/characters/face'
import type { Bag } from '../../../../engine3d/dispose'
import { POLES_LOOKS } from '../../characters/looks'

export interface RiderPose {
  /** Holding on (0..1): Pola is crouching under him. */
  cling?: number
  /** Flippers up, eyes wide (0..1): in the air. */
  up?: number
  /** Held up out of the water (0..1): standing tall, flippers out for balance, wobbling. */
  dry?: number
}

export class Rider {
  /** Where he sits (the world puts this on Pola's back). */
  readonly root = new Group()
  readonly rig: Rig
  readonly height: number
  private life: FaceLife
  private bounceT = -1
  private shakeT = -1
  private flapT = -1
  private phase = Math.random() * 6

  constructor(bag: Bag, height = 0.8) {
    this.height = height
    this.rig = buildAnimal({ ...POLES_LOOKS.pebble, height }, bag)
    // (No shadow of his own: he's on Pola.)
    this.rig.root.children[0].visible = false
    this.root.add(this.rig.root)
    this.life = new FaceLife(this.rig, 'pebble')
  }

  /** A bounce on Pola's back (a landing). */
  bounce() {
    this.bounceT = 0
  }
  /** A shake (after the swim, or a tickle). */
  shake() {
    this.shakeT = 0
  }
  /** A happy flutter of his flippers. */
  flap() {
    this.flapT = 0
  }

  /** The middle of him, in the world. */
  center(out: Vector3) {
    return this.root.localToWorld(out.set(0, this.height * 0.5, 0))
  }

  update(dt: number, t: number, pose: RiderPose = {}) {
    const r = this.rig
    this.life.update(dt)
    const cling = pose.cling ?? 0
    const up = pose.up ?? 0
    const dry = pose.dry ?? 0
    let lift = 0
    let squash = cling * 0.16
    if (this.bounceT >= 0) {
      this.bounceT += dt / 0.6
      if (this.bounceT >= 1) this.bounceT = -1
      else {
        // Two little bounces, the second smaller.
        const k = this.bounceT
        lift = Math.abs(Math.sin(k * Math.PI * 2)) * (1 - k) * 0.28 * this.height
        squash += k < 0.12 ? 0.22 * bell(k / 0.24) : 0
      }
    }
    if (this.shakeT >= 0 && (this.shakeT += dt / 0.9) >= 1) this.shakeT = -1
    if (this.flapT >= 0 && (this.flapT += dt / 0.9) >= 1) this.flapT = -1
    const shake = this.shakeT >= 0 ? Math.sin(this.shakeT * 40) * (1 - this.shakeT) : 0
    const flap = this.flapT >= 0 ? bell(this.flapT) : 0
    const breathe = 0.022 * Math.sin(t * 2.8 + this.phase)
    const wobble = dry * Math.sin(t * 5 + this.phase) * 0.12

    r.body.position.y = lift
    r.body.scale.set(1 + squash * 0.6, 1 - squash + breathe + up * 0.06, 1 + squash * 0.6)
    r.body.rotation.set(cling * 0.32 - up * 0.18, 0, 0.3 * shake + wobble)
    // Flippers: hugging forward as he clings, up in the air, out to the sides for balance, a flutter when he's happy.
    const out = 0.14 + up * (2.2 + 0.25 * Math.sin(t * 22)) + dry * (1.25 + 0.3 * Math.sin(t * 9)) + flap * (1.1 + 0.6 * Math.sin(t * 26)) + Math.abs(shake) * 0.6
    r.armR.rotation.set(-cling * 1.1, 0, out)
    r.armL.rotation.set(-cling * 1.1, 0, -out)
    if (r.tail) r.tail.rotation.z = 0.4 * Math.sin(t * 3 + this.phase) * (0.3 + Math.abs(shake))
    // The face: eyes wide and looking up in the air, squeezed shut as he holds on.
    r.eyes.scale.y = Math.min(r.eyes.scale.y, 1 - cling * 0.6) * (1 + up * 0.25)
    r.head.rotation.set(cling * 0.25 - up * 0.3 - dry * 0.1, 0, -0.3 * shake + 0.5 * wobble + 0.14 * flap * Math.sin(t * 9))
  }
}

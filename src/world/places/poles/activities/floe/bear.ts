// Pola and Mama Bear as greybox shapes (the art gate builds them on the chibi rig): a white ball of a polar bear cub in
// the toon look, with arms on their own pivots so he can paddle, wave and flail. The world (floe.ts) sets his pose each
// frame; this file only owns the shapes and the little actions that play by themselves (a hop, a wave, a shake).
import { Group, type Vector3 } from 'three'
import { bell, span } from '../../../../../sdk'
import type { Bag } from '../../../../engine3d/dispose'
import { P, solidMix } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'

const WHITE = '#FFFFFF'
const HOP_S = 0.55
const WAVE_S = 1.6
const SHAKE_S = 0.9

export class Bear {
  /** Where it stands (on a floe, or in the sea). */
  readonly root = new Group()
  /** Turns, leans, squashes and hops. */
  readonly body = new Group()
  readonly arms: Group[] = []
  /** Inside the body at its size: the actions move this. */
  private inner = new Group()
  /** Meters from its feet to the top of its head. */
  readonly height: number
  private hopT = -1
  private waveT = -1
  private shakeT = -1
  private phase = Math.random() * 6

  constructor(bag: Bag, readonly size = 1) {
    this.height = 1.05 * size
    this.root.add(this.body)
    this.body.scale.setScalar(size)
    const inner = this.inner
    this.body.add(inner)
    inner.add(
      solidMix(
        [
          P.sphere(0.34, WHITE, { at: [0, 0.36, 0], scale: [1, 0.92, 1.12] }),
          P.sphere(0.26, WHITE, { at: [0, 0.78, 0.12] }),
          P.sphere(0.085, WHITE, { at: [0.17, 0.98, 0.08] }),
          P.sphere(0.085, WHITE, { at: [-0.17, 0.98, 0.08] }),
          P.sphere(0.12, PAL.cream, { at: [0, 0.71, 0.33], scale: [1, 0.78, 1] }),
          P.capsule(0.08, 0.08, WHITE, { at: [0.16, 0.08, 0.12], rot: [Math.PI / 2, 0, 0] }),
          P.capsule(0.08, 0.08, WHITE, { at: [-0.16, 0.08, 0.12], rot: [Math.PI / 2, 0, 0] }),
          P.sphere(0.07, WHITE, { at: [0, 0.3, -0.37] }),
        ],
        [
          P.sphere(0.045, PAL.ink, { at: [0, 0.76, 0.44] }),
          P.sphere(0.034, PAL.ink, { at: [0.1, 0.86, 0.335] }),
          P.sphere(0.034, PAL.ink, { at: [-0.1, 0.86, 0.335] }),
          P.sphere(0.012, WHITE, { at: [0.11, 0.875, 0.365] }),
          P.sphere(0.012, WHITE, { at: [-0.09, 0.875, 0.365] }),
          P.sphere(0.05, PAL.pink, { at: [0.18, 0.74, 0.29], scale: [1, 0.6, 0.4] }),
          P.sphere(0.05, PAL.pink, { at: [-0.18, 0.74, 0.29], scale: [1, 0.6, 0.4] }),
          P.sphere(0.045, PAL.pink, { at: [0.17, 0.99, 0.15], scale: [1, 1, 0.4] }),
          P.sphere(0.045, PAL.pink, { at: [-0.17, 0.99, 0.15], scale: [1, 1, 0.4] }),
        ],
        bag,
        3,
      ),
    )
    for (const x of [0.3, -0.3]) {
      const arm = new Group()
      arm.position.set(x, 0.52, 0.08)
      arm.add(solidMix([P.capsule(0.075, 0.16, WHITE, { at: [0, -0.14, 0] })], [], bag, 2.5))
      inner.add(arm)
      this.arms.push(arm)
    }
  }

  hop() {
    if (this.hopT < 0 || this.hopT > HOP_S * 0.7) this.hopT = 0
  }
  wave() {
    this.waveT = 0
  }
  shake() {
    this.shakeT = 0
  }
  get busy() {
    return this.hopT >= 0 || this.waveT >= 0 || this.shakeT >= 0
  }

  /** Where a finger finds it, in the world. */
  center(out: Vector3) {
    return this.root.localToWorld(out.set(0, this.height * 0.5, 0))
  }

  /**
   * One frame. `pose`: crouch (0..1, pulled back), lean (radians forward), stretch (+ long, - squashed), swim (0..1, the
   * arms paddle), flail (0..1, the arms go up in the air).
   */
  update(dt: number, t: number, pose: { crouch?: number; lean?: number; stretch?: number; swim?: number; flail?: number } = {}) {
    const inner = this.inner
    // The little actions.
    let lift = 0
    let sq = 0
    if (this.hopT >= 0) {
      this.hopT += dt
      const p = this.hopT / HOP_S
      if (p >= 1) this.hopT = -1
      else {
        const air = span(p, 0.2, 0.8)
        lift = bell(air) * 0.35
        sq = p < 0.2 ? bell(p / 0.4) * 0.2 : p > 0.8 ? bell((p - 0.8) / 0.4) * 0.16 : -0.08 * bell(air)
      }
    }
    if (this.waveT >= 0 && (this.waveT += dt) > WAVE_S) this.waveT = -1
    if (this.shakeT >= 0 && (this.shakeT += dt) > SHAKE_S) this.shakeT = -1

    const crouch = pose.crouch ?? 0
    const stretch = pose.stretch ?? 0
    const breathe = 0.025 * Math.sin(t * 2.6 + this.phase)
    const squash = sq + crouch * 0.32 - stretch
    inner.position.y = lift
    inner.scale.set(1 + squash * 0.6, 1 - squash + breathe, 1 + squash * 0.6)
    inner.rotation.x = (pose.lean ?? 0) - crouch * 0.25
    inner.rotation.z = this.shakeT >= 0 ? 0.32 * Math.sin(this.shakeT * 42) * (1 - this.shakeT / SHAKE_S) : 0

    // The arms: hanging, paddling, flailing or waving (the right one).
    const swim = pose.swim ?? 0
    const flail = pose.flail ?? 0
    const w = this.waveT >= 0 ? bell(this.waveT / WAVE_S) : 0
    this.arms.forEach((a, i) => {
      const s = i ? -1 : 1
      a.rotation.x = swim * (Math.sin(t * 9 + i * Math.PI) * 1.1 - 0.9) - crouch * 0.6
      a.rotation.z = s * (0.18 + flail * (2.3 + 0.3 * Math.sin(t * 20 + i)) + (i === 0 ? w * (2.2 + 0.4 * Math.sin(this.waveT * 15)) : 0))
    })
  }
}

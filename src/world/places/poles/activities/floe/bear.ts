// Pola and Mama Bear on the chibi rig (engine3d/characters/animal.ts, their looks in characters/looks.ts): the toy polar
// bears from the character lab, with the body, head and arms on their own pivots so he can paddle, wave and flail. The
// world (floe.ts) sets his pose each frame; this file owns the little actions that play by themselves (a hop, a wave, a
// shake) and the face's life (blinks, and the mouth with their voice once they have one).
import { Group, type Vector3 } from 'three'
import { bell, span } from '../../../../../sdk'
import { buildAnimal, type Rig } from '../../../../engine3d/characters/animal'
import { FaceLife } from '../../../../engine3d/characters/face'
import type { Bag } from '../../../../engine3d/dispose'
import { POLES_LOOKS } from '../../characters/looks'

const HOP_S = 0.55
const WAVE_S = 1.6
const SHAKE_S = 0.9

export class Bear {
  /** Where it stands (on a floe, or in the sea). */
  readonly root: Group
  readonly rig: Rig
  /** Meters from its feet to the top of its head. */
  readonly height: number
  private life: FaceLife
  private hopT = -1
  private waveT = -1
  private shakeT = -1
  private phase = Math.random() * 6

  /**
   * `height`: bigger than in the lab (Pola stands 0.9 m beside Kaylee), so he reads from the camera over the floes.
   * `shadow`: the rig's own blob shadow (Pola's is drawn on whatever is under him by the world instead).
   */
  constructor(bag: Bag, who: 'pola' | 'mama', height: number, shadow = true) {
    this.rig = buildAnimal({ ...POLES_LOOKS[who], height }, bag)
    this.root = this.rig.root
    this.root.children[0].visible = shadow
    this.height = height
    this.life = new FaceLife(this.rig, who)
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
    const { body, head, armL, armR, tail } = this.rig
    this.life.update(dt)
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
    const shake = this.shakeT >= 0 ? Math.sin(this.shakeT * 42) * (1 - this.shakeT / SHAKE_S) : 0
    const w = this.waveT >= 0 ? bell(this.waveT / WAVE_S) : 0
    body.position.y = lift
    body.scale.set(1 + squash * 0.6, 1 - squash + breathe, 1 + squash * 0.6)
    body.rotation.set((pose.lean ?? 0) - crouch * 0.25, 0, 0.32 * shake)
    // The head follows through: it lags the shake the other way, tips up into a flail and to the side for a wave.
    head.rotation.set(-0.3 * (pose.flail ?? 0) + crouch * 0.2, 0, -0.35 * shake + 0.18 * w)
    if (tail) tail.rotation.z = 0.4 * Math.sin(t * 3 + this.phase) * (0.3 + Math.abs(shake))

    // The arms: hanging, paddling, flailing or waving (the right one). armR is on +x, so its "out" is +z.
    const swim = pose.swim ?? 0
    const flail = pose.flail ?? 0
    ;[armR, armL].forEach((a, i) => {
      const s = i ? -1 : 1
      a.rotation.x = swim * (Math.sin(t * 9 + i * Math.PI) * 1.1 - 0.9) - crouch * 0.6
      a.rotation.z = s * (0.18 + flail * (2.3 + 0.3 * Math.sin(t * 20 + i)) + (i === 0 ? w * (2.2 + 0.4 * Math.sin(this.waveT * 15)) : 0))
    })
  }
}

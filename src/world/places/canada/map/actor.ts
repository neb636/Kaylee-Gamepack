// A friend on the chibi rig (engine3d/characters/animal.ts) at the train map's toy scale: Maple, the moose on the track,
// the polar bear up north and her hockey team in Ottawa. The map sets where it stands and which pose it eases into; this
// owns the little actions that play by themselves (a hop with a crouch first and a squash on landing, a wave, a cheer
// with both arms up, a skate, a sit), the breathing, the blinks and the mouth that opens with their own voice.
import { Group, Vector3 } from 'three'
import { bell, span } from '../../../../sdk'
import { buildAnimal, type Rig } from '../../../engine3d/characters/animal'
import { FaceLife } from '../../../engine3d/characters/face'
import type { Look } from '../../../engine3d/characters/look'
import type { Bag } from '../../../engine3d/dispose'

const HOP_S = 0.55
const WAVE_S = 1.5
const CHEER_S = 1.2
const SHAKE_S = 0.8

export type Act = 'hop' | 'wave' | 'cheer' | 'shake'

export class Actor {
  readonly root: Group
  readonly rig: Rig
  readonly height: number
  private life: FaceLife
  private t: Record<Act, number> = { hop: -1, wave: -1, cheer: -1, shake: -1 }
  private phase = Math.random() * 6
  /** Eased poses (0..1): sitting in the train, walking (a bob and swinging arms), skating (a lean and glide). */
  private sitK = 0
  private walkK = 0
  private skateK = 0
  private lookYaw = 0

  constructor(bag: Bag, look: Look, height: number, voice?: string) {
    this.rig = buildAnimal({ ...look, height }, bag)
    this.root = this.rig.root
    this.height = height
    this.life = new FaceLife(this.rig, voice)
  }

  /** Plays an action (a hop interrupts a hop only near its end, so taps in a row don't stutter). */
  play(a: Act) {
    if (a === 'hop' && this.t.hop >= 0 && this.t.hop < HOP_S * 0.7) return
    this.t[a] = 0
  }
  get busy() {
    return Object.values(this.t).some((v) => v >= 0)
  }

  center(out: Vector3) {
    return this.root.localToWorld(out.set(0, this.height * 0.55, 0))
  }

  /**
   * One frame. `pose`: sit (in the train), walk (ambling along), skate (gliding on the ice), look (head turn, radians),
   * up (radians: tips the head back to look up at the camera above the table), lift (m, e.g. the arc of a jump into the
   * train, added to the hop).
   */
  update(dt: number, t: number, pose: { sit?: boolean; walk?: boolean; skate?: boolean; look?: number; up?: number; lift?: number } = {}) {
    const { body, head, armL, armR, tail } = this.rig
    this.life.update(dt)
    const ease = (k: number, want: boolean, rate = 6) => k + ((want ? 1 : 0) - k) * (1 - Math.exp(-rate * dt))
    this.sitK = ease(this.sitK, !!pose.sit)
    this.walkK = ease(this.walkK, !!pose.walk, 8)
    this.skateK = ease(this.skateK, !!pose.skate, 4)
    this.lookYaw += ((pose.look ?? 0) - this.lookYaw) * (1 - Math.exp(-5 * dt))

    let lift = pose.lift ?? 0
    let sq = 0
    for (const a of Object.keys(this.t) as Act[]) {
      if (this.t[a] < 0) continue
      this.t[a] += dt
      const len = a === 'hop' ? HOP_S : a === 'wave' ? WAVE_S : a === 'cheer' ? CHEER_S : SHAKE_S
      if (this.t[a] > len) this.t[a] = -1
    }
    if (this.t.hop >= 0) {
      // Crouch, up, squash on landing, settle.
      const p = this.t.hop / HOP_S
      const air = span(p, 0.2, 0.8)
      lift += bell(air) * this.height * 0.35
      sq = p < 0.2 ? bell(p / 0.4) * 0.2 : p > 0.8 ? bell((p - 0.8) / 0.4) * 0.16 : -0.08 * bell(air)
    }
    const cheer = this.t.cheer >= 0 ? bell(this.t.cheer / CHEER_S) : 0
    if (this.t.cheer >= 0) lift += Math.abs(Math.sin((this.t.cheer / CHEER_S) * Math.PI * 2)) * this.height * 0.12
    const wave = this.t.wave >= 0 ? bell(this.t.wave / WAVE_S) : 0
    const shake = this.t.shake >= 0 ? Math.sin(this.t.shake * 40) * (1 - this.t.shake / SHAKE_S) : 0

    const breathe = 0.025 * Math.sin(t * 2.6 + this.phase)
    const stepT = t * 9 + this.phase
    const bob = this.walkK * Math.abs(Math.sin(stepT)) * this.height * 0.06
    const glide = this.skateK * Math.sin(t * 2.2 + this.phase)
    body.position.y = lift + bob - this.sitK * this.height * 0.18
    const squash = sq + this.sitK * 0.12
    body.scale.set(1 + squash * 0.6, 1 - squash + breathe, 1 + squash * 0.6)
    body.rotation.set(this.skateK * 0.28 + this.walkK * 0.08, 0, 0.2 * glide + 0.3 * shake + this.walkK * 0.06 * Math.sin(stepT))
    head.rotation.set(-0.2 * cheer - (pose.up ?? 0), this.lookYaw, -0.25 * shake + 0.15 * wave - 0.12 * glide)
    if (tail) tail.rotation.z = 0.35 * Math.sin(t * 3 + this.phase) * (0.4 + Math.abs(shake) + this.walkK)
    // Arms: hanging (resting on the car's side when she sits), swinging as she walks, out for balance on the ice, both up
    // for a cheer, the right one waving.
    ;[armR, armL].forEach((arm, i) => {
      const s = i ? -1 : 1
      const swing = this.walkK * Math.sin(stepT + i * Math.PI) * 0.6
      arm.rotation.x = swing - this.sitK * 0.9 + this.skateK * 0.2 * Math.sin(t * 2.2 + i * Math.PI)
      arm.rotation.z = s * (0.18 + this.skateK * 0.9 + cheer * 2.5 + (i === 0 ? wave * (2.3 + 0.45 * Math.sin(this.t.wave * 14)) : 0))
    })
  }
}

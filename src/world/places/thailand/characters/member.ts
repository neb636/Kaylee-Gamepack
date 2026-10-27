// A family member in Agong's house: their toy animal (engine3d/characters/animal.ts, looks.ts) standing, sitting or
// lying at their spot, breathing and blinking, turning their head to look at Kaylee when she comes near, waving and
// hopping when she says hi, and moving their mouth when their voice plays (engine3d/characters/face.ts).
import { Group, Vector3 } from 'three'
import { bell, clamp, span } from '../../../../sdk'
import type { Bag } from '../../../engine3d/dispose'
import { buildAnimal, Wind, type Rig } from '../../../engine3d/characters/animal'
import { FaceLife } from '../../../engine3d/characters/face'
import type { FamilyMember } from './family'
import { LOOKS, type Look } from './looks'
import type { Character, Pose } from './types'

const deg = Math.PI / 180
const tmp = new Vector3()

export class Member implements Character {
  readonly id: string
  readonly root: Group
  readonly height: number
  pose: Pose = 'stand'
  private chibi: Rig
  private reaction: { kind: 'hop' | 'wiggle'; t: number } | null = null
  private life: FaceLife
  /** Time into a wave (-1: not waving). */
  private waving = -1
  private look: Vector3 | null = null
  private headYaw = 0
  private phase = Math.random() * 10
  private baseY: number
  /** Glued to their phone (the big cousins): head down at the screen, both hands on it, never looking up for long. */
  onPhone: boolean
  /** Time into putting the phone down (-1: not doing it). */
  private phoneDown = -1
  private glance = 1
  /** Time into a wave with one hand off the phone, eyes still on the screen (-1: not waving). */
  private phoneWaving = -1
  private wind = new Wind()

  /** `look` and `voice` default to the family member's own; the character lab (lab/) gives a trip's extras theirs. */
  constructor(readonly member: FamilyMember, bag: Bag, look: Look = LOOKS[member.id], voice: string | undefined = member.id) {
    this.id = member.id
    this.chibi = buildAnimal(look, bag)
    this.root = this.chibi.root
    this.height = this.chibi.height
    this.life = new FaceLife(this.chibi, voice)
    this.onPhone = !!look.extras?.includes('phone')
    if (this.onPhone) {
      this.chibi.armL.rotation.set(-1.2, 0, 0.75)
      this.chibi.armR.rotation.set(-1.2, 0, -0.75)
    }
    const s = member.spot
    this.baseY = (s?.floor ? 3.6 : 0) + (s?.pose === 'sit' ? (s.seat ?? 0.45) - 0.1 * this.height : s?.pose === 'lie' ? 0.2 : 0)
    if (s) {
      this.root.position.set(s.x, this.baseY, s.z)
      this.root.rotation.y = s.face * deg
      this.setPose(s.pose)
    }
    this.root.userData.pick = `family:${member.id}`
  }

  /** The toy's pivots (arms, head, eyes), for a pose held on top of the usual life (the boat trip's photo poses). */
  get rig(): Rig {
    return this.chibi
  }
  /** Puts them somewhere else (the family photo). */
  place(x: number, y: number, z: number, faceDeg: number, pose: Pose = 'stand') {
    this.baseY = y
    this.root.position.set(x, y, z)
    this.root.rotation.y = faceDeg * deg
    this.setPose(pose)
  }

  setPose(pose: Pose) {
    this.pose = pose
    const { body } = this.chibi
    body.rotation.set(pose === 'lie' ? -Math.PI / 2 : 0, 0, 0)
    body.position.set(0, pose === 'lie' ? this.chibi.radius : 0, 0)
  }

  react(kind: 'hop' | 'wiggle' | 'wave') {
    // Too busy with the phone to hop or wave: a quick look up, then back to the screen.
    if (this.onPhone) this.glance = 0
    else if (kind === 'wave') this.waving = 0
    else this.reaction = { kind, t: 0 }
  }
  /** Bye without looking up: one hand leaves the phone and waves, the head stays down at the screen. (Anyone else
   *  just waves.) */
  phoneWave() {
    if (this.onPhone) this.phoneWaving = 0
    else this.waving = 0
  }
  /** For the first time ever: the phone goes down (into a pocket), the arms drop and the head comes up. */
  putPhoneDown() {
    if (!this.onPhone) return
    this.onPhone = false
    this.phoneDown = 0
    this.glance = 1
  }
  /** Wind in a unicorn's mane and tail: 0 still, 1 strong (it eases there). */
  setWind(k: number) {
    this.wind.goal = k
  }
  lookAt(x: number, y: number, z: number) {
    this.look = (this.look ?? new Vector3()).set(x, y, z)
  }
  lookAway() {
    this.look = null
  }

  update(dt: number, t: number) {
    const { body, head, armR } = this.chibi
    const lying = this.pose === 'lie'
    this.life.update(dt)
    this.wind.update(this.chibi, dt, t)
    if (this.phoneDown >= 0) {
      // The phone shrinks away into a pocket while the arms come down from holding it.
      this.phoneDown = Math.min(1, this.phoneDown + dt / 0.5)
      const p = this.phoneDown
      const e = 1 - (1 - p) ** 3
      this.chibi.armL.rotation.set(-1.2 * (1 - e), 0, 0.75 * (1 - e))
      armR.rotation.set(-1.2 * (1 - e), 0, -0.75 * (1 - e))
      head.rotation.x = 0.45 * (1 - e)
      const ph = this.chibi.phone
      if (ph) {
        ph.scale.setScalar(Math.max(0.001, 1 - e))
        ph.visible = p < 1
      }
      if (p >= 1) this.phoneDown = -1
    }
    if (this.phoneWaving >= 0) {
      // From holding the phone up to a wave beside the head and back, the other hand keeps the phone.
      this.phoneWaving += dt / 1.6
      const p = Math.min(1, this.phoneWaving)
      const up = span(p, 0, 0.18) * (1 - span(p, 0.82, 1))
      armR.rotation.set(-1.2 * (1 - up), 0, -0.75 * (1 - up) + up * (2.3 + Math.sin(p * Math.PI * 7) * 0.35))
      if (p >= 1) this.phoneWaving = -1
    }
    // A wave: the right arm swings up and waves side to side, then comes down.
    if (this.waving >= 0) {
      this.waving += dt / 1.5
      const p = Math.min(1, this.waving)
      const up = span(p, 0, 0.15) * (1 - span(p, 0.8, 1))
      armR.rotation.z = up * (2.5 + Math.sin(p * Math.PI * 7) * 0.35)
      if (p >= 1) {
        armR.rotation.z = 0
        this.waving = -1
      }
    }
    // Breathing.
    const breath = 1 + Math.sin(t * 2.6 + this.phase) * 0.018
    body.scale.set(1 / Math.sqrt(breath), breath, 1 / Math.sqrt(breath))
    // Look at Kaylee (head only, within a comfortable turn). Phone people only look up for a moment when she says hi.
    let want = 0
    this.glance = Math.min(1, this.glance + dt / 1.1)
    const up = this.onPhone ? bell(this.glance) : 1
    if (this.look && !lying && up > 0.05) {
      this.root.worldToLocal(tmp.copy(this.look))
      want = clamp(Math.atan2(tmp.x, tmp.z), -1.0, 1.0)
    }
    this.headYaw += (want - this.headYaw) * (1 - Math.exp(-dt * 6))
    head.rotation.y = this.headYaw * up
    if (this.onPhone) head.rotation.x = 0.45 * (1 - up) + Math.sin(t * 1.3 + this.phase) * 0.02
    // Reactions.
    let y = 0
    if (this.reaction) {
      const r = this.reaction
      r.t += dt
      if (r.kind === 'hop') {
        const p = r.t / 0.55
        const crouch = bell(span(p, 0, 0.22))
        const air = span(p, 0.2, 0.85)
        const land = bell(span(p, 0.82, 1))
        y = lying ? 0 : bell(air) * 0.28 * this.height
        const sq = 1 - 0.14 * crouch - 0.1 * land + 0.08 * bell(air)
        body.scale.y *= sq
        body.scale.x *= 1 / Math.sqrt(sq)
        body.scale.z *= 1 / Math.sqrt(sq)
        if (p >= 1) this.reaction = null
      } else {
        const p = r.t / 0.6
        body.rotation.z = Math.sin(p * Math.PI * 6) * 0.14 * (1 - p)
        if (p >= 1) {
          body.rotation.z = 0
          this.reaction = null
        }
      }
    }
    this.root.position.y = this.baseY + y
  }
}

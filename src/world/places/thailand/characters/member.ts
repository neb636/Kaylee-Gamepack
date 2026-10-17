// A family member in Agong's house: their toy animal (animal.ts, looks.ts) standing, sitting or lying at their spot,
// breathing, turning their head to look at Kaylee when she comes near, and hopping when she says hi.
import { Group, Vector3 } from 'three'
import { bell, clamp, span } from '../../../../sdk'
import type { Bag } from '../engine/dispose'
import { buildAnimal, type Rig } from './animal'
import type { FamilyMember } from './family'
import { LOOKS } from './looks'
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
  private look: Vector3 | null = null
  private headYaw = 0
  private phase = Math.random() * 10
  private baseY: number

  constructor(readonly member: FamilyMember, bag: Bag) {
    this.id = member.id
    this.chibi = buildAnimal(LOOKS[member.id], bag)
    this.root = this.chibi.root
    this.height = this.chibi.height
    const s = member.spot
    this.baseY = (s?.floor ? 3.6 : 0) + (s?.pose === 'sit' ? (s.seat ?? 0.45) - 0.1 * this.height : s?.pose === 'lie' ? 0.2 : 0)
    if (s) {
      this.root.position.set(s.x, this.baseY, s.z)
      this.root.rotation.y = s.face * deg
      this.setPose(s.pose)
    }
    this.root.userData.pick = `family:${member.id}`
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

  react(kind: 'hop' | 'wiggle') {
    this.reaction = { kind, t: 0 }
  }
  lookAt(x: number, y: number, z: number) {
    this.look = (this.look ?? new Vector3()).set(x, y, z)
  }
  lookAway() {
    this.look = null
  }

  update(dt: number, t: number) {
    const { body, head } = this.chibi
    const lying = this.pose === 'lie'
    // Breathing.
    const breath = 1 + Math.sin(t * 2.6 + this.phase) * 0.018
    body.scale.set(1 / Math.sqrt(breath), breath, 1 / Math.sqrt(breath))
    // Look at Kaylee (head only, within a comfortable turn).
    let want = 0
    if (this.look && !lying) {
      this.root.worldToLocal(tmp.copy(this.look))
      want = clamp(Math.atan2(tmp.x, tmp.z), -1.0, 1.0)
    }
    this.headYaw += (want - this.headYaw) * (1 - Math.exp(-dt * 6))
    head.rotation.y = this.headYaw
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

// Gate 1 stand-ins: a chibi capsule body and a big round head with eyes and blush, in each person's color. Good
// enough to judge scale, places and the feel of walking around; gate 2 swaps in the real animals (same Character).
import { Group, Vector3 } from 'three'
import { bell, clamp, span } from '../../../../sdk'
import type { Bag } from '../engine/dispose'
import { blobShadow, merge, P, solid } from '../engine/geo'
import { PAL } from '../engine/toon'
import type { FamilyMember } from './family'
import type { Character, Pose } from './types'

export interface Chibi {
  root: Group
  body: Group
  head: Group
  height: number
  /** Body radius (lying down lifts the body by this). */
  radius: number
}

/** The body + head every placeholder shares. `extras` add parts to the head (a horn, ears) or body (a tail). */
export function buildChibi(height: number, colorBody: string, bag: Bag, extras?: { head?: Parameters<typeof merge>[0]; body?: Parameters<typeof merge>[0] }): Chibi {
  const H = height
  const rb = 0.19 * H
  const hb = 0.56 * H
  const rh = 0.22 * H
  const root = new Group()
  const body = new Group()
  const head = new Group()
  root.add(blobShadow(rb * 1.6, bag), body)
  body.add(
    solid(
      merge([
        P.capsule(rb, hb - 2 * rb, colorBody, { at: [0, hb / 2, 0] }),
        P.capsule(0.05 * H, 0.12 * H, colorBody, { at: [rb + 0.02 * H, 0.33 * H, 0], rot: [0, 0, 0.5] }),
        P.capsule(0.05 * H, 0.12 * H, colorBody, { at: [-rb - 0.02 * H, 0.33 * H, 0], rot: [0, 0, -0.5] }),
        P.sphere(0.075 * H, PAL.ink, { at: [0.08 * H, 0.04 * H, 0.03 * H], scale: [1, 0.55, 1.3] }),
        P.sphere(0.075 * H, PAL.ink, { at: [-0.08 * H, 0.04 * H, 0.03 * H], scale: [1, 0.55, 1.3] }),
        ...(extras?.body ?? []),
      ]),
      bag,
      3,
    ),
  )
  head.position.y = hb + rh * 0.72
  body.add(head)
  head.add(
    solid(
      merge([
        P.sphere(rh, colorBody, {}, 24),
        // Big shiny eyes and blush, on the front (+z).
        ...[1, -1].flatMap((s) => [
          P.sphere(0.042 * H, PAL.ink, { at: [s * 0.075 * H, 0.015 * H, rh * 0.9], scale: [0.85, 1.15, 0.5] }),
          P.sphere(0.014 * H, '#ffffff', { at: [s * 0.075 * H + 0.012 * H, 0.04 * H, rh * 0.93] }),
          P.sphere(0.03 * H, PAL.pink, { at: [s * 0.13 * H, -0.035 * H, rh * 0.8], scale: [1.2, 0.6, 0.4] }),
        ]),
        P.torus(0.025 * H, 0.006 * H, PAL.ink, { at: [0, -0.05 * H, rh * 0.95], rot: [0, 0, Math.PI] }, Math.PI),
        ...(extras?.head ?? []),
      ]),
      bag,
      3,
    ),
  )
  return { root, body, head, height: H, radius: rb }
}

const deg = Math.PI / 180
const tmp = new Vector3()

/** A family member: idle breathing, turns to look at Kaylee, hops when greeted. */
export class Placeholder implements Character {
  readonly id: string
  readonly root: Group
  readonly height: number
  pose: Pose = 'stand'
  private chibi: Chibi
  private reaction: { kind: 'hop' | 'wiggle'; t: number } | null = null
  private look: Vector3 | null = null
  private headYaw = 0
  private phase = Math.random() * 10
  private baseY: number

  constructor(readonly member: FamilyMember, bag: Bag) {
    this.id = member.id
    this.chibi = buildChibi(member.height, member.color, bag)
    this.root = this.chibi.root
    this.height = member.height
    const s = member.spot
    this.baseY = (s?.floor ? 3.6 : 0) + (s?.pose === 'sit' ? (s.seat ?? 0.45) - 0.1 * member.height : s?.pose === 'lie' ? 0.2 : 0)
    if (s) {
      this.root.position.set(s.x, this.baseY, s.z)
      this.root.rotation.y = s.face * deg
      this.setPose(s.pose)
    }
    this.root.userData.pick = `family:${member.id}`
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

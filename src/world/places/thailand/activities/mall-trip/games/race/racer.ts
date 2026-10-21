// A racer on the slide: one of the family's toy animals (or a placeholder kid) driven by the race instead of the house.
// It walks, hops up steps, sits in its lane, pumps its arms to scoot, throws them up (whee!), flips head first into the
// balls (Daddy), cheers by the pit, and spins in a rubber ring. Its pivots: `root` (where it is and which way it faces),
// a `flipper` at the hips (so a head-first dive turns round the middle, not the feet), then the chibi rig.
import { Group, Vector3 } from 'three'
import { bell, clamp, span, wobble } from '../../../../../../../sdk'
import { buildAnimal, Wind, type Rig } from '../../../../characters/animal'
import { FaceLife } from '../../../../characters/face'
import { LOOKS, type Look } from '../../../../characters/looks'
import type { Bag } from '../../../../engine/dispose'
import { merge, P, solid } from '../../../../engine/geo'
import type { RacerId } from './layout'

/** The two kids racing beside her: plain placeholders (a puppy and a pony) until the art gate. */
export const KID_LOOKS: Record<'kidA' | 'kidB', Look> = {
  kidA: { species: 'puppy', height: 1.05, fur: '#E9B486', light: '#FFF1DC', dark: '#5A4148', ear: '#C98A5A', outfit: { kind: 'tee', color: '#8EC9F5', shorts: '#5D7BB0' }, open: true },
  kidB: { species: 'pony', height: 1.1, fur: '#FFE0EC', light: '#FFF6FA', dark: '#B07A8A', ear: '#FFB8CC', mane: ['#B9A6F5', '#FF8FB8'], hair: 'medium', outfit: { kind: 'dress', color: '#FBEA9A' }, lashes: true },
}

export type Arms = 'down' | 'race' | 'up' | 'cheer'

interface Move {
  kind: 'walk' | 'hop'
  to: Vector3
  /** walk: m/s; hop: seconds. */
  speed: number
  arc: number
  t: number
  from?: Vector3
  done?: () => void
}

const tmp = new Vector3()

export class Racer {
  readonly root = new Group()
  readonly flipper = new Group()
  readonly rig: Rig
  readonly height: number
  /** Where the feet (or the seat) are. */
  readonly pos = new Vector3()
  /** Which way it faces (radians, 0 = toward the camera), and an extra spin on top (the rubber ring). */
  yaw = 0
  spin = 0
  /** Head over heels (radians, round the hips): Daddy's dive. */
  flip = 0
  /** Height off the lane this frame (a flight off a bump). */
  lift = 0
  sitting = false
  arms: Arms = 'down'
  /** Legs kicking in the air (upside down in the balls). */
  kicking = false
  ring: Group | null = null
  private yawGoal = 0
  private moves: Move[] = []
  private life: FaceLife
  private wind = new Wind()
  private gait = 0
  private walkSpeed = 0
  private settle = 1
  private hopK = 1
  private wiggleK = 1
  private scootK = 1
  private ringPop = 1
  private look: Vector3 | null = null
  private headYaw = 0
  private phase = Math.random() * 10

  /** `look` dresses it as someone else (HarborLand's hall: more kids, the staff). */
  constructor(readonly id: RacerId, bag: Bag, look?: Look) {
    this.rig = buildAnimal(look ?? (id === 'kidA' || id === 'kidB' ? KID_LOOKS[id] : LOOKS[id]), bag)
    this.height = this.rig.height
    this.life = new FaceLife(this.rig)
    this.flipper.position.y = 0.45 * this.height
    this.rig.root.position.y = -0.45 * this.height
    this.flipper.add(this.rig.root)
    this.root.add(this.flipper)
    this.root.userData.pick = id === 'kaylee' ? 'kaylee' : `racer:${id}`
  }

  /** A rubber ring round its middle (round 3), popping on with a squeaky boing. */
  setRing(color: string | null, bag: Bag) {
    if (!color) {
      if (this.ring) this.ring.visible = false
      return
    }
    if (!this.ring) {
      const r = 0.22 + 0.13 * this.height
      this.ring = solid(merge([P.torus(r, 0.12 + 0.03 * this.height, color, { rot: [Math.PI / 2, 0, 0] }), ...[0, 1, 2, 3].map((i) => P.box(0.06, 0.05, 0.26, '#FFFFFF', { at: [Math.cos((i * Math.PI) / 2) * r, 0.1, Math.sin((i * Math.PI) / 2) * r], rot: [0, -(i * Math.PI) / 2, 0] }))]), bag, 2)
      this.root.add(this.ring)
    }
    if (!this.ring.visible || this.ringPop >= 1) this.ringPop = 0
    this.ring.visible = true
  }
  get inRing() {
    return !!this.ring?.visible
  }

  /** Puts it somewhere at once. */
  place(x: number, y: number, z: number, yaw = 0) {
    this.pos.set(x, y, z)
    this.yaw = this.yawGoal = yaw
    this.moves = []
  }
  face(yaw: number) {
    this.yawGoal = yaw
  }
  walkTo(to: Vector3, speed = 2.2, done?: () => void) {
    this.moves.push({ kind: 'walk', to: to.clone(), speed, arc: 0, t: 0, done })
  }
  hopTo(to: Vector3, dur = 0.38, arc = 0.35, done?: () => void) {
    this.moves.push({ kind: 'hop', to: to.clone(), speed: dur, arc, t: 0, done })
  }
  get busy() {
    return this.moves.length > 0
  }
  stop() {
    this.moves = []
  }

  /** A happy hop on the spot (a tap). */
  hop() {
    if (!this.moves.length) this.hopK = 0
  }
  wiggle() {
    this.wiggleK = 0
  }
  /** Hands push the slide: one scoot. */
  scoot() {
    this.scootK = 0
  }
  /** Something landed: a squash and a wobble. */
  land() {
    this.settle = 0
  }
  lookAt(p: Vector3 | null) {
    this.look = p ? (this.look ?? new Vector3()).copy(p) : null
  }
  setWind(k: number) {
    this.wind.goal = k
  }

  update(dt: number, t: number) {
    const { body, head, armL, armR } = this.rig
    const H = this.height
    // ---- Moving: walking along, hopping up a step ----
    const mv = this.moves[0]
    let arc = 0
    this.walkSpeed = 0
    if (mv) {
      if (!mv.from) {
        mv.from = this.pos.clone()
        if (Math.hypot(mv.to.x - mv.from.x, mv.to.z - mv.from.z) > 0.05) this.yawGoal = Math.atan2(mv.to.x - mv.from.x, mv.to.z - mv.from.z)
      }
      if (mv.kind === 'walk') {
        const d = mv.from.distanceTo(mv.to)
        mv.t += (dt * mv.speed) / Math.max(1e-3, d)
        this.walkSpeed = mv.speed
      } else mv.t += dt / mv.speed
      const k = clamp(mv.t)
      this.pos.lerpVectors(mv.from, mv.to, k)
      if (mv.kind === 'hop') arc = bell(k) * mv.arc
      if (k >= 1) {
        this.moves.shift()
        if (mv.kind === 'hop') this.settle = 0
        mv.done?.()
      }
    }
    // ---- Facing (a spring, angle-wrapped) ----
    const diff = Math.atan2(Math.sin(this.yawGoal - this.yaw), Math.cos(this.yawGoal - this.yaw))
    this.yaw += diff * (1 - Math.exp(-dt * 12))
    // ---- Life: blinking, the mane in the wind ----
    this.life.update(dt)
    this.wind.update(this.rig, dt, t)
    // ---- The body: breathing, gait, sitting, squash on landing, a hop, a wiggle ----
    let sy = 1 + Math.sin(t * 2.6 + this.phase) * 0.018
    let y = 0
    let lean = 0
    if (this.walkSpeed > 0) {
      this.gait += dt * Math.PI * 3.4 * (this.walkSpeed / 1.8)
      const s = Math.abs(Math.sin(this.gait))
      y += s * 0.07 * H
      sy *= 1 + 0.06 * (s - 0.5)
      lean = 0.14
    } else this.gait = 0
    if (this.sitting) {
      // Sitting back on the slide, legs out in front.
      y -= 0.17 * H
      sy *= 0.88
      lean = -0.34
    }
    this.settle = Math.min(1, this.settle + dt / 0.4)
    if (this.settle < 1) sy *= 1 + wobble(this.settle, 2) * 0.14
    this.hopK = Math.min(1, this.hopK + dt / 0.55)
    if (this.hopK < 1) {
      const p = this.hopK
      const crouch = bell(span(p, 0, 0.22))
      const air = span(p, 0.2, 0.85)
      y += bell(air) * 0.26 * H
      sy *= 1 - 0.14 * crouch - 0.1 * bell(span(p, 0.82, 1)) + 0.08 * bell(air)
    }
    this.wiggleK = Math.min(1, this.wiggleK + dt / 0.6)
    body.rotation.z = Math.sin(this.wiggleK * Math.PI * 6) * 0.16 * (1 - this.wiggleK) + (this.kicking ? Math.sin(t * 15) * 0.22 : 0)
    // A scoot: lean forward and push, then rock back.
    this.scootK = Math.min(1, this.scootK + dt / 0.32)
    const push = this.scootK < 1 ? Math.sin(this.scootK * Math.PI) : 0
    lean += push * 0.28
    body.position.y = y
    body.rotation.x = lean
    body.scale.set(1 / Math.sqrt(sy), sy, 1 / Math.sqrt(sy))
    // ---- Arms ----
    armL.rotation.set(0, 0, 0)
    armR.rotation.set(0, 0, 0)
    if (this.arms === 'race') {
      // At the sides on the slide's edges, swinging forward then pushing back on a scoot.
      const sw = this.scootK < 1 ? -0.9 + 1.8 * span(this.scootK, 0.15, 0.8) : 0.15
      armL.rotation.set(sw, 0, -0.55)
      armR.rotation.set(sw, 0, 0.55)
    } else if (this.arms === 'up') {
      armL.rotation.z = -2.5 + Math.sin(t * 9) * 0.15
      armR.rotation.z = 2.5 - Math.sin(t * 9 + 1) * 0.15
    } else if (this.arms === 'cheer') {
      armL.rotation.z = -1.6 - Math.max(0, Math.sin(t * 9)) * 0.9
      armR.rotation.z = 1.6 + Math.max(0, Math.sin(t * 9 + Math.PI)) * 0.9
    }
    // ---- Head: looks at what's interesting ----
    let want = 0
    if (this.look && this.flip === 0) {
      this.root.updateWorldMatrix(true, false)
      this.root.worldToLocal(tmp.copy(this.look))
      want = clamp(Math.atan2(tmp.x, tmp.z), -0.9, 0.9)
    }
    this.headYaw += (want - this.headYaw) * (1 - Math.exp(-dt * 6))
    head.rotation.set(0, this.headYaw, 0)
    // ---- Where it all goes ----
    const inRing = this.inRing
    this.ringPop = Math.min(1, this.ringPop + dt / 0.45)
    if (this.ring) {
      this.ring.position.y = 0.06 + 0.12 * H
      this.ring.scale.setScalar(this.ringPop < 1 ? Math.max(0.01, 1 + wobble(this.ringPop, 2) * 0.3 - (1 - this.ringPop) * 0.6) : 1)
    }
    this.root.position.set(this.pos.x, this.pos.y + arc + this.lift + (inRing ? 0.09 : 0), this.pos.z)
    this.root.rotation.y = this.yaw + this.spin
    this.flipper.rotation.x = this.flip
  }
}

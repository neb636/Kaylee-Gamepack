// The coach: the Muay Thai boxer kid from the top of the Big Frame come alive, as a little monkey on the family's chibi
// rig (characters/looks.ts COACH_LOOK: the red headband, red gloves, blue shorts). He's driven by hand every frame:
//   - 'wai':   standing for the wai kru, his gloves pressed together; he copies her bows and her dance steps.
//   - 'drum':  behind his drum, a glove coming down on every beat (the world tells him where in the beat he is).
//   - 'guard': gloves up, bouncing on his toes.
// On top of that, actions that ease in and out (anticipation, a settle): a bow, a dance step, a cheer, a spinning kick
// on the small bag, a hop, a ram muay pose. Blinks and the mouth with his voice come from FaceLife (cast id `coach`).
import { Group, Vector3 } from 'three'
import { bell, clamp, span } from '../../../../../../../sdk'
import { buildAnimal, type Rig } from '../../../../characters/animal'
import { FaceLife } from '../../../../characters/face'
import { COACH_LOOK } from '../../../../characters/looks'
import type { Bag } from '../../../../engine/dispose'

const deg = Math.PI / 180
export type CoachMode = 'wai' | 'drum' | 'guard'
type ActKind = 'bow' | 'dance' | 'cheer' | 'kick' | 'hop' | 'pose'
interface Act {
  kind: ActKind
  t: number
  dur: number
  /** How deep (a bow) or which way (a dance step: -1, 1). */
  k: number
  hit?: () => void
  hitDone?: boolean
}
const DUR: Record<ActKind, number> = { bow: 1.0, dance: 0.62, cheer: 1.3, kick: 0.95, hop: 0.55, pose: 1.2 }

/** Arm angles for a pose: [x, z] for each arm (left, right). */
type Arms = [number, number, number, number]
const lerpArms = (a: Arms, b: Arms, k: number): Arms => a.map((v, i) => v + (b[i] - v) * k) as Arms
export const WAI: Arms = [-1.75, 0.5, -1.75, -0.5]
export const GUARD: Arms = [-1.95, 0.35, -1.95, -0.35]
const WINGS: Arms = [-0.25, -1.25, -0.25, 1.25]
const CHEER: Arms = [-0.3, -2.4, -0.3, 2.4]
const DRUM_REST = -0.8

export class Coach {
  readonly rig: Rig
  readonly root: Group
  readonly height: number
  mode: CoachMode = 'wai'
  readonly pos = new Vector3()
  private yaw = 0
  private yawGoal = 0
  private yawVel = 0
  private life: FaceLife
  private walk: { from: Vector3; to: Vector3; t: number; dur: number; face: number; done?: () => void } | null = null
  private act: Act | null = null
  /** The drum: where in the beat he is (0 just hit, 1 the next hit), and which glove comes down next. */
  drumPhase = 0
  drumArm = 0
  look: Vector3 | null = null
  private headYaw = 0
  private modeK = 1
  private lastArms: Arms = WAI

  constructor(bag: Bag) {
    this.rig = buildAnimal(COACH_LOOK, bag)
    this.root = this.rig.root
    this.height = this.rig.height
    this.root.userData.pick = 'coach'
    this.life = new FaceLife(this.rig, 'coach')
  }

  place(x: number, z: number, faceDeg: number) {
    this.walk = null
    this.pos.set(x, 0, z)
    this.yaw = this.yawGoal = faceDeg * deg
  }
  face(faceDeg: number) {
    this.yawGoal = faceDeg * deg
  }
  setMode(m: CoachMode) {
    if (m === this.mode) return
    this.mode = m
    this.modeK = 0
  }
  /** A happy hop-trot to somewhere (his drum, her side). */
  goTo(x: number, z: number, faceDeg: number, done?: () => void) {
    const to = new Vector3(x, 0, z)
    const d = to.distanceTo(this.pos)
    this.walk = { from: this.pos.clone(), to, t: 0, dur: Math.max(0.35, d / 1.7), face: faceDeg * deg, done }
    if (d > 0.05) this.yawGoal = Math.atan2(x - this.pos.x, z - this.pos.z)
  }
  get walking() {
    return !!this.walk
  }
  play(kind: ActKind, k = 1, hit?: () => void) {
    this.act = { kind, t: 0, dur: DUR[kind], k, hit }
  }
  get busy() {
    return !!this.act
  }

  update(dt: number, t: number) {
    const { body, head, armL, armR, tail } = this.rig
    this.life.update(dt)
    this.modeK = Math.min(1, this.modeK + dt / 0.35)
    // ---- Where he is: walking (a hop each step), or standing ----
    let y = 0
    const w = this.walk
    if (w) {
      w.t += dt / w.dur
      const k = clamp(w.t)
      this.pos.lerpVectors(w.from, w.to, k)
      y = Math.abs(Math.sin(k * w.dur * Math.PI * 4.5)) * 0.07
      if (k >= 1) {
        this.walk = null
        this.yawGoal = w.face
        w.done?.()
      }
    }
    // Turning spring.
    let diff = this.yawGoal - this.yaw
    diff = Math.atan2(Math.sin(diff), Math.cos(diff))
    this.yawVel += (200 * diff - 26 * this.yawVel) * dt
    this.yaw += this.yawVel * dt

    // ---- The pose for his mode ----
    let arms: Arms
    let lean = 0
    let tilt = 0
    let headPitch = 0
    let spin = 0
    const side = new Vector3()
    if (this.mode === 'wai') arms = WAI
    else if (this.mode === 'guard') {
      arms = GUARD
      y += Math.abs(Math.sin(t * 6.5)) * 0.03
    } else {
      // A glove comes down on the drum on every beat: up through the beat, then a quick drop onto it.
      const p = this.drumPhase
      const lift = span(p, 0.05, 0.6) * (1 - span(p, 0.82, 1))
      const a = DRUM_REST - 1.0 * lift
      arms = this.drumArm ? [DRUM_REST, 0.25, a, -0.25] : [a, 0.25, DRUM_REST, -0.25]
      lean = 0.18 + 0.06 * (1 - span(p, 0, 0.15))
      headPitch = 0.12
      y += 0.015 * (1 - span(p, 0, 0.12))
    }
    if (this.modeK < 1) arms = lerpArms(this.lastArms, arms, this.modeK * this.modeK * (3 - 2 * this.modeK))
    else this.lastArms = arms

    // ---- An action on top ----
    const act = this.act
    if (act) {
      act.t += dt / act.dur
      const p = Math.min(1, act.t)
      const e = bell(p)
      if (act.kind === 'bow') {
        // Gloves together first, then down into the bow and up again.
        arms = lerpArms(arms, WAI, span(p, 0, 0.2) * (1 - span(p, 0.85, 1)))
        lean += act.k * bell(span(p, 0.15, 0.9))
        headPitch += 0.35 * bell(span(p, 0.15, 0.9))
      } else if (act.kind === 'dance') {
        // A hop to the side, arms out like a bird's wings, a lean into it.
        arms = lerpArms(arms, WINGS, e)
        y += 0.12 * bell(span(p, 0.1, 0.8))
        side.set(act.k * 0.14 * e, 0, 0)
        tilt = -act.k * 0.22 * e
      } else if (act.kind === 'cheer') {
        arms = lerpArms(arms, CHEER, span(p, 0, 0.15) * (1 - span(p, 0.85, 1)))
        y += 0.16 * Math.abs(Math.sin(p * Math.PI * 2))
      } else if (act.kind === 'hop') {
        y += 0.2 * bell(span(p, 0.15, 0.85))
      } else if (act.kind === 'pose') {
        // The ram muay: one glove up high, one forward, a deep knee bend and a turn of the head.
        arms = lerpArms(arms, [-2.4, -0.4, -1.5, -0.2], e)
        y -= 0.06 * e
        lean += 0.15 * e
        tilt = 0.12 * e
      } else if (act.kind === 'kick') {
        // A wind-up, a spin all the way round (the tail whips), contact on the way through, and a settle.
        arms = lerpArms(arms, GUARD, span(p, 0, 0.15))
        const s = span(p, 0.15, 0.75)
        spin = Math.PI * 2 * s * s * (3 - 2 * s)
        tilt = 0.3 * bell(s)
        y += 0.08 * bell(s)
        if (p > 0.55 && !act.hitDone) {
          act.hitDone = true
          act.hit?.()
        }
      }
      if (p >= 1) this.act = null
    }

    // ---- Write it ----
    this.root.position.set(this.pos.x, y, this.pos.z)
    this.root.rotation.y = this.yaw + spin
    if (side.x) this.root.position.add(side.applyAxisAngle(new Vector3(0, 1, 0), this.yaw))
    const breath = 1 + Math.sin(t * 2.6) * 0.018
    body.scale.set(1 / Math.sqrt(breath), breath, 1 / Math.sqrt(breath))
    body.rotation.set(lean, 0, tilt)
    armL.rotation.set(arms[0], 0, arms[1])
    armR.rotation.set(arms[2], 0, arms[3])
    let want = 0
    if (this.look) {
      const local = this.root.worldToLocal(this.look.clone())
      want = clamp(Math.atan2(local.x, local.z), -0.9, 0.9)
    }
    this.headYaw += (want - this.headYaw) * (1 - Math.exp(-dt * 6))
    head.rotation.set(headPitch, this.headYaw, 0)
    if (tail) tail.rotation.z = Math.sin(t * 2.2) * 0.25
  }
}

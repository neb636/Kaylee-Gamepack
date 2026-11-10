// The beach puppy (#357 way-finding, card B: "Follow the Beach Puppy"): a cream island dog in a pink bandana who
// knows the way. His body and how he moves live here; where he goes (a beach she hasn't played, the taxi, fetching
// her when she stands still) is the island's (island.ts, "the beach puppy"). On the shared chibi rig, like the other
// islanders (../cast.ts). He's alive: he breathes, his tail wags (harder when she's near), his head turns to look back
// for her, he trots with a bounce, sits to wait, and does a silly trick when she pokes him (chases his tail, rolls
// over, a big hop). His voice is barks (sound only: no words).
import { Group, Mesh, type Vector3 } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { buildAnimal, type Rig } from '../../../../../engine3d/characters/animal'
import { FaceLife } from '../../../../../engine3d/characters/face'
import { blobShadow } from '../../../../../engine3d/geo'
import { noise, tone } from '../../../../../kit/sfx'
import { PUPPY } from '../cast'
import { pointAt, type Route } from './route'

export type Trick = 'spin' | 'roll' | 'hop'
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

/** One woof: a quick falling square tone with a puff of breath (a small dog: high). */
export function woof(delay = 0, pitch = 1) {
  tone(720 * pitch, 430 * pitch, 0.11, 0.07, 'square', delay)
  tone(1440 * pitch, 860 * pitch, 0.09, 0.025, 'triangle', delay)
  noise(0.07, 0.04, 'bandpass', 1500, 900, delay)
}

export class Puppy {
  readonly root = new Group()
  readonly rig: Rig
  readonly shadow: Mesh
  private life: FaceLife
  x = 0
  z = 0
  y = 0
  yaw = 0
  /** His speed now (m/s) and where he's heading. */
  speed = 0
  /** Sitting (waiting for her, or there). */
  sit = 0
  /** How hard his tail wags (0..1). */
  wag = 0.4
  /** Where his head looks (null: where he's going). */
  look: Vector3 | null = null
  private phase = 0
  private trick: { kind: Trick; t: number } | null = null
  private barks: number[] = []
  private barkK = 0
  private hopY = 0
  private hopV = 0
  private stillT = 0

  constructor(bag: Bag) {
    this.rig = buildAnimal(PUPPY, bag)
    this.root.add(this.rig.root)
    this.root.userData.pick = 'puppy'
    this.life = new FaceLife(this.rig)
    this.shadow = blobShadow(0.32, bag)
  }

  get height() {
    return this.rig.height
  }
  get busy() {
    return !!this.trick
  }

  place(x: number, z: number, yaw = this.yaw) {
    this.x = x
    this.z = z
    this.yaw = yaw
  }

  /** `n` woofs in a row (a beach's name: one per beat), `gap` seconds apart. */
  bark(n = 1, gap = 0.22) {
    const now = this.barks.length ? this.barks[this.barks.length - 1] + gap : 0
    for (let i = 0; i < n; i++) {
      this.barks.push(now + i * gap)
      woof(now + i * gap, 0.95 + Math.random() * 0.1)
    }
  }
  /** A silly trick (a poke). */
  play(kind: Trick) {
    this.trick = { kind, t: 0 }
    if (kind === 'hop') this.hopV = 3.4
  }
  hop(v = 2.6) {
    if (this.hopY <= 0.001) this.hopV = v
  }

  /** Moves toward `goal` at up to `top` m/s (stops `near` short), over the ground; returns the meters still to go. */
  moveToward(goal: { x: number; z: number }, top: number, dt: number, near = 0.25) {
    const dx = goal.x - this.x
    const dz = goal.z - this.z
    const d = Math.hypot(dx, dz)
    const want = d <= near ? 0 : Math.min(top, Math.max(0.8, (d - near) * 2.2))
    this.speed += Math.max(-7 * dt, Math.min(6 * dt, want - this.speed))
    if (d > 0.01 && this.speed > 0.01) {
      const step = Math.min(d, this.speed * dt)
      this.x += (dx / d) * step
      this.z += (dz / d) * step
      this.yaw += wrap(Math.atan2(dx, dz) - this.yaw) * Math.min(1, dt * 9)
    }
    return Math.max(0, d - near)
  }
  /** Moves along a route from `s` toward `goalS` (either way) at up to `top`; returns his new place along it. */
  alongRoute(r: Route, s: number, goalS: number, top: number, dt: number) {
    const ds = goalS - s
    const want = Math.abs(ds) < 0.2 ? 0 : Math.min(top, Math.max(0.8, Math.abs(ds) * 1.8))
    this.speed += Math.max(-7 * dt, Math.min(6 * dt, want - this.speed))
    const ns = s + Math.sign(ds) * Math.min(Math.abs(ds), this.speed * dt)
    const p = pointAt(r, ns)
    // (Off the route, after a fetch or a hop out of the taxi: he heads back onto it first.)
    const off = Math.hypot(p.x - this.x, p.z - this.z)
    if (off > 0.6) {
      this.moveToward(p, top, dt, 0)
      return s
    }
    const ahead = pointAt(r, ns + Math.sign(ds || 1) * 1.2)
    if (this.speed > 0.05) this.yaw += wrap(Math.atan2(ahead.x - this.x, ahead.z - this.z) - this.yaw) * Math.min(1, dt * 8)
    this.x = p.x
    this.z = p.z
    return ns
  }
  /** Stands still, turning to face a point. */
  stay(dt: number, face?: { x: number; z: number }) {
    this.speed = Math.max(0, this.speed - 7 * dt)
    if (face) this.yaw += wrap(Math.atan2(face.x - this.x, face.z - this.z) - this.yaw) * Math.min(1, dt * 4)
  }

  update(dt: number, t: number, groundY: number) {
    const rig = this.rig
    this.life.update(dt)
    this.y = groundY
    // A hop (or a jump for joy): a little gravity.
    this.hopV -= 14 * dt
    this.hopY = Math.max(0, this.hopY + this.hopV * dt)
    if (this.hopY === 0) this.hopV = Math.max(0, this.hopV)
    const run = Math.min(1, this.speed / 4)
    this.phase += dt * (5 + this.speed * 3.2)
    const bounce = Math.abs(Math.sin(this.phase)) * (0.03 + run * 0.07)
    // Still for a moment: he sits down to wait.
    this.stillT = this.speed < 0.2 && this.hopY === 0 ? this.stillT + dt : 0
    this.sit += ((this.stillT > 0.8 && !this.trick ? 1 : 0) - this.sit) * Math.min(1, dt * 6)
    this.root.position.set(this.x, this.y + bounce + this.hopY, this.z)
    this.root.rotation.set(0, this.yaw, 0)
    rig.body.position.y = -this.sit * 0.08 * rig.height
    rig.body.rotation.x = run * 0.28 - this.sit * 0.12
    // Breathing (a pant when he's run): the body swells a little.
    const pant = 0.012 + run * 0.02
    rig.body.scale.set(1 + Math.sin(t * (6 + run * 8)) * pant, 1 - Math.sin(t * (6 + run * 8)) * pant * 0.6, 1)
    // The tail: wags all the time, harder when she's near (wag) and when he runs.
    if (rig.tail) {
      const w = 0.25 + this.wag * 0.75
      rig.tail.rotation.y = Math.sin(t * (9 + w * 9)) * (0.35 + w * 0.5)
      rig.tail.rotation.x = -0.2 - run * 0.3
    }
    // Paws: swing with the trot, out to the sides when he sits.
    rig.armL.rotation.x = Math.sin(this.phase) * 0.9 * run
    rig.armR.rotation.x = -Math.sin(this.phase) * 0.9 * run
    rig.armL.rotation.z = this.sit * 0.3
    rig.armR.rotation.z = -this.sit * 0.3
    // The head: looks where he's going, or back at her (turns up to ~100°, the body does the rest).
    let hy = 0
    let hx = 0
    if (this.look) {
      const a = wrap(Math.atan2(this.look.x - this.x, this.look.z - this.z) - this.yaw)
      hy = Math.max(-1.75, Math.min(1.75, a))
      hx = -0.1
    }
    // Barking: the head lifts and the mouth opens for each woof.
    this.barks = this.barks.map((b) => b - dt).filter((b) => b > -0.16)
    const barking = this.barks.some((b) => b <= 0 && b > -0.14)
    this.barkK += ((barking ? 1 : 0) - this.barkK) * Math.min(1, dt * 30)
    hx -= this.barkK * 0.3
    rig.head.rotation.y += (hy - rig.head.rotation.y) * Math.min(1, dt * 7)
    rig.head.rotation.x += (hx - rig.head.rotation.x) * Math.min(1, dt * 10)
    rig.head.rotation.z = Math.sin(t * 1.3) * 0.06
    if (!rig.open) {
      rig.talk.visible = this.barkK > 0.2
      rig.mouth.visible = !rig.talk.visible
    } else rig.mouth.scale.set(1 + this.barkK * 0.2, 1 + this.barkK * 1.2, 1)
    // A trick (a poke): chase his tail round twice, roll over, or a big hop.
    if (this.trick) {
      const tr = this.trick
      tr.t += dt / (tr.kind === 'roll' ? 1.3 : tr.kind === 'spin' ? 1.2 : 0.8)
      const p = Math.min(1, tr.t)
      if (tr.kind === 'spin') this.rig.root.rotation.y = p * Math.PI * 4
      else if (tr.kind === 'roll') {
        this.rig.root.rotation.z = Math.sin(p * Math.PI) * Math.PI * 0.95
        this.rig.root.position.y = Math.sin(p * Math.PI) * 0.18
      } else this.rig.root.rotation.x = -Math.sin(p * Math.PI) * 0.4
      if (tr.t >= 1) {
        this.trick = null
        this.rig.root.rotation.set(0, 0, 0)
        this.rig.root.position.y = 0
      }
    }
    this.shadow.position.set(this.x, this.y + 0.03, this.z)
    this.shadow.scale.setScalar(1 - Math.min(0.5, this.hopY * 0.5))
  }
}

/** A beach's name as beats for his barks (one woof a syllable): Hat Sai Kaew is three, Ao Prao two. */
export const BEATS: Record<string, number> = { nadan: 2, saikaew: 3, hinkhok: 3, phai: 2, wongduan: 3, prao: 2, aonoina: 3, deck: 2 }

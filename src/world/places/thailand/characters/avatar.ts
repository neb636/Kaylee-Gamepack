// Kaylee, the one she steers: her lilac unicorn with the rainbow mane and gold horn (looks.ts; on purpose nothing like
// Sparkle).
//
// How she moves: a bouncy hop-trot along a path (a little hop every step, squash when she lands, stretch at the top,
// leaning into the walk), turning with a spring so corners curve, a settle wobble when she arrives. Everything else
// (sitting down, hopping onto the mattress, each stair) is a short tween with an arc.
import { Group, Vector3 } from 'three'
import { bell, clamp, span, wobble } from '../../../../sdk'
import type { Bag } from '../engine/dispose'
import type { XZ } from '../engine/nav'
import { TUNE } from '../engine/tune'
import { buildAnimal, buildWorn, Wind, type Rig } from './animal'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FaceLife } from './face'
import { LOOKS, type Wearable } from './looks'
import { buildModelRig } from './model'
import type { Character, Pose } from './types'

const H = LOOKS.kaylee.height
const BOUNCES = [0.28, 0.5, 0.78]

interface Tween {
  from: Vector3
  to: Vector3
  dur: number
  arc: number
  t: number
  done?: () => void
}

export class Avatar implements Character {
  readonly id = 'kaylee'
  readonly root: Group
  readonly height = H
  pose: Pose = 'stand'
  /** Which floor she's on (0 = street level, 1 = upstairs). */
  floor: 0 | 1 = 0
  /** Where she steps back to when she gets up from a seat or the mattress. */
  standPoint: Vector3 | null = null
  private chibi: Rig
  private path: XZ[] = []
  private onArrive: (() => void) | null = null
  private speed = 0
  private yaw = Math.PI
  private yawVel = 0
  private yawGoal = Math.PI
  private phase = 0
  private tweens: Tween[] = []
  private settle = 1
  private bounce = { level: -1, t: 0 }
  private flop = 1
  private look: Vector3 | null = null
  private headYaw = 0
  private life: FaceLife
  private waving = -1
  private wind = new Wind()
  /** What she has on (her sun hat, sunglasses, floaties), built the first time she puts each on. */
  private worn = new Map<Wearable, Group[]>()
  /** Things she's just put on, and how far through their little show (0..1). */
  private entering = new Map<Wearable, number>()

  /** `model`: the modelled vinyl-toy Kaylee (model.ts) instead of the code-built one. */
  constructor(private bag: Bag, model?: GLTF) {
    this.chibi = model ? buildModelRig(model, bag) : buildAnimal(LOOKS.kaylee, bag)
    this.life = new FaceLife(this.chibi)
    this.root = this.chibi.root
    this.root.rotation.y = this.yaw
    this.root.userData.pick = 'kaylee'
  }

  get position() {
    return this.root.position
  }
  /** The toy's pivots (arms, head, eyes), for a pose held on top of the usual life (the boat trip's photo poses). */
  get rig(): Rig {
    return this.chibi
  }
  /** Puts on exactly these (and takes off the rest): they ride on her head and arms. */
  wear(ids: readonly Wearable[]) {
    for (const id of new Set([...ids, ...this.worn.keys()])) {
      const on = ids.includes(id)
      let groups = this.worn.get(id)
      if (!groups && on) {
        const w = buildWorn(LOOKS.kaylee, id, this.bag)
        groups = []
        for (const [g, pivot] of [[w.head, this.chibi.head], [w.armL, this.chibi.armL], [w.armR, this.chibi.armR], [w.body, this.chibi.body]] as const) {
          if (!g) continue
          pivot.add(g)
          groups.push(g)
          g.userData.base = g.position.clone()
          // Hats sit tipped back a little, so her face shows under the brim.
          if (id === 'sunhat' || id === 'spare-hat') g.rotation.x = -0.16
        }
        this.worn.set(id, groups)
      }
      for (const g of groups ?? []) g.visible = on
    }
  }
  /** Puts these on with a little show: the hat drops onto her head, the sunglasses slide down, the floaties pop on. */
  putOn(ids: readonly Wearable[]) {
    const before = new Set(this.wearing)
    this.wear(ids)
    for (const id of ids) if (!before.has(id)) this.entering.set(id, 0)
  }
  /** Indoors (the plane) she pushes her sunglasses up onto her hat's brim; outdoors they're back on her eyes. */
  glassesUp(up: boolean) {
    const R = 0.24 * H
    for (const g of this.worn.get('sunglasses') ?? []) {
      g.position.set(0, up ? 0.62 * R : 0, up ? 0.12 * R : 0)
      g.userData.base = g.position.clone()
      g.rotation.x = up ? -0.42 : 0
    }
  }
  get wearing(): Wearable[] {
    return [...this.worn].filter(([, gs]) => gs[0]?.visible).map(([id]) => id)
  }
  /** Wind in her mane and tail: 0 still, 1 strong (it eases there). */
  setWind(k: number) {
    this.wind.goal = k
  }

  get walking() {
    return this.path.length > 0 || this.tweens.length > 0
  }
  /** Something is moving (the frame loop may slow down when nothing is). */
  get busy() {
    return this.walking || this.speed > 0.01 || this.pose === 'bounce' || this.settle < 1 || this.flop < 1
  }

  /** Puts her somewhere at once (a deep link, the end of the arrival). */
  place(x: number, y: number, z: number, faceDeg: number) {
    this.root.position.set(x, y, z)
    this.yaw = this.yawGoal = faceDeg * (Math.PI / 180)
    this.yawVel = 0
    this.path = []
    this.tweens = []
    this.speed = 0
  }

  face(yawRad: number) {
    this.yawGoal = yawRad
  }
  faceToward(x: number, z: number) {
    const p = this.root.position
    if (Math.hypot(x - p.x, z - p.z) > 0.05) this.yawGoal = Math.atan2(x - p.x, z - p.z)
  }

  /** Walks along `path` (from a NavGrid); getting up first if she's sitting or bouncing. */
  walk(path: XZ[], onArrive?: () => void) {
    const go = () => {
      this.path = path.slice()
      this.onArrive = onArrive ?? null
    }
    if (this.pose !== 'stand' && this.standPoint) {
      const to = this.standPoint
      this.standPoint = null
      this.setPose('stand')
      this.path = []
      this.hopTo(to, 0.28, 0.18, go)
    } else {
      this.setPose('stand')
      go()
    }
  }

  stop() {
    this.path = []
    this.onArrive = null
  }

  /** A little jump to `to` (onto a stool, the mattress, the next stair). */
  hopTo(to: Vector3, dur: number, arc: number, done?: () => void) {
    this.tweens.push({ from: new Vector3(), to: to.clone(), dur, arc, t: -1, done })
  }

  setPose(pose: Pose) {
    if (pose === 'bounce' && this.pose !== 'bounce') this.bounce = { level: 0, t: 0 }
    if (pose === 'lie') this.flop = 0
    this.pose = pose
  }

  /** On the mattress: each tap bounces higher, and after the highest one she flops down. Returns the new level. */
  bounceHigher(): number {
    if (this.pose === 'lie') {
      this.setPose('bounce')
      return 0
    }
    if (this.pose !== 'bounce') this.setPose('bounce')
    else if (this.bounce.level >= BOUNCES.length - 1) {
      this.setPose('lie')
      return BOUNCES.length
    } else this.bounce.level++
    return this.bounce.level
  }

  react(kind: 'hop' | 'wiggle' | 'wave') {
    if (kind === 'wave') this.waving = 0
    else if (kind === 'hop' && this.pose === 'stand' && !this.tweens.length) this.hopTo(this.root.position, 0.45, 0.25)
    else this.settle = 0
  }
  lookAt(x: number, y: number, z: number) {
    this.look = (this.look ?? new Vector3()).set(x, y, z)
  }
  lookAway() {
    this.look = null
  }

  update(dt: number, t: number) {
    // Small substeps keep the turning spring steady when a frame is slow (headless browsers run at 10-20 fps).
    const steps = Math.max(1, Math.ceil(dt / (1 / 90)))
    for (let i = 0; i < steps; i++) this.step(dt / steps)
    this.pose3d(t)
    this.life.update(dt)
    this.wind.update(this.chibi, dt, t)
    for (const [id, e0] of this.entering) {
      const e = Math.min(1, e0 + dt / 0.5)
      if (e >= 1) this.entering.delete(id)
      else this.entering.set(id, e)
      for (const g of this.worn.get(id) ?? []) {
        const base = (g.userData.base as Vector3 | undefined) ?? g.position
        g.position.copy(base)
        if (id === 'floaties') g.scale.setScalar(Math.max(0.01, e < 0.6 ? (e / 0.6) * 1.2 : 1.2 - (e - 0.6) * 0.5))
        else if (id === 'sunglasses') g.position.y += (1 - e) * 0.12
        else {
          g.position.y += (1 - e) ** 2 * 0.55
          g.scale.set(1, 1 - 0.22 * bell(span(e, 0.65, 1)), 1)
        }
      }
    }
    if (this.waving >= 0) {
      this.waving += dt / 1.3
      const p = Math.min(1, this.waving)
      const up = span(p, 0, 0.15) * (1 - span(p, 0.8, 1))
      this.chibi.armR.rotation.z = up * (2.5 + Math.sin(p * Math.PI * 6) * 0.35)
      if (p >= 1) this.waving = -1
    }
  }

  private step(dt: number) {
    const p = this.root.position
    // Scripted hops first (sitting down, stairs, the mattress).
    const tw = this.tweens[0]
    if (tw) {
      if (tw.t < 0) {
        tw.from.copy(p)
        tw.t = 0
        if (tw.to.distanceToSquared(tw.from) > 1e-4) this.yawGoal = Math.atan2(tw.to.x - tw.from.x, tw.to.z - tw.from.z)
      }
      tw.t += dt
      const k = clamp(tw.t / tw.dur)
      p.lerpVectors(tw.from, tw.to, k)
      p.y += bell(k) * tw.arc
      if (k >= 1) {
        this.tweens.shift()
        this.settle = 0
        tw.done?.()
      }
    } else if (this.path.length) {
      const [tx, tz] = this.path[0]
      const dx = tx - p.x
      const dz = tz - p.z
      const d = Math.hypot(dx, dz)
      const left = d + this.pathLength()
      // Long trips (across the house to the stairs) turn into a happy run, up to 1.6x.
      const run = 1 + clamp((left - 4) / 6, 0, 0.6)
      const max = TUNE.walkSpeed * run * clamp(left / 0.45, 0.35, 1)
      this.speed = this.speed > max ? max : Math.min(max, this.speed + (TUNE.walkSpeed / 0.15) * dt)
      const move = this.speed * dt
      if (d <= Math.max(move, 0.02)) {
        p.x = tx
        p.z = tz
        this.path.shift()
        if (!this.path.length) {
          this.speed = 0
          this.settle = 0
          const cb = this.onArrive
          this.onArrive = null
          cb?.()
        }
      } else {
        p.x += (dx / d) * move
        p.z += (dz / d) * move
        this.yawGoal = Math.atan2(dx, dz)
      }
    } else this.speed = 0
    // Turning spring (angle-wrapped).
    let diff = this.yawGoal - this.yaw
    diff = Math.atan2(Math.sin(diff), Math.cos(diff))
    this.yawVel += (220 * diff - 28 * this.yawVel) * dt
    this.yaw += this.yawVel * dt
    // Gait phase: one hop per step, faster the faster she goes.
    if (this.speed > 0.01) this.phase += Math.PI * TUNE.stepsPerSecond * (this.speed / TUNE.walkSpeed) * dt
    else this.phase = 0
    this.settle = Math.min(1, this.settle + dt / 0.35)
    this.flop = Math.min(1, this.flop + dt / 0.5)
    if (this.pose === 'bounce') this.bounce.t += dt
  }

  private pathLength() {
    let sum = 0
    for (let i = 1; i < this.path.length; i++) sum += Math.hypot(this.path[i][0] - this.path[i - 1][0], this.path[i][1] - this.path[i - 1][1])
    return sum
  }

  /** Writes the body's pose for this frame: gait, squash and stretch, sitting, lying, bouncing, bowing. */
  private pose3d(t: number) {
    const { body, head } = this.chibi
    this.root.rotation.y = this.yaw
    const pose = this.pose
    let y = 0
    let sy = 1 + Math.sin(t * 2.4) * 0.015
    let lean = 0
    let roll = 0
    let headPitch = 0
    const walkK = this.speed / TUNE.walkSpeed
    if (walkK > 0.01) {
      const s = Math.abs(Math.sin(this.phase))
      y = s * TUNE.hop
      sy *= 1 + 0.06 * (s - 0.5) * 2 * walkK
      lean = 0.14 * walkK
    }
    if (pose === 'sit') {
      y -= 0.1
      sy *= 0.92
    } else if (pose === 'wai') {
      lean = 0.32
      headPitch = 0.15
    } else if (pose === 'peek') {
      lean = 0.22
      headPitch = 0.2
    } else if (pose === 'lookup') {
      headPitch = -0.5
    } else if (pose === 'bounce') {
      const level = BOUNCES[clamp(this.bounce.level, 0, BOUNCES.length - 1)]
      const period = 0.42 + level * 0.55
      const ph = (this.bounce.t % period) / period
      y += Math.sin(ph * Math.PI) * level
      // Squash in the mattress at each landing.
      const contact = 1 - span(Math.min(ph, 1 - ph), 0, 0.08)
      sy *= 1 - 0.2 * contact + 0.08 * Math.sin(ph * Math.PI)
    }
    // Settle wobble when she lands somewhere.
    if (this.settle < 1) sy *= 1 + wobble(this.settle, 2) * 0.12
    body.position.y = pose === 'lie' ? this.chibi.radius * (1 - 0.5 * (1 - this.flop)) : y
    body.rotation.x = pose === 'lie' ? -Math.PI / 2 * Math.min(1, this.flop * 1.2) : lean
    body.rotation.z = roll
    body.scale.set(1 / Math.sqrt(sy), sy, 1 / Math.sqrt(sy))
    // Head: look at something interesting, otherwise ahead.
    let want = 0
    if (this.look && pose !== 'lie') {
      const local = this.root.worldToLocal(this.look.clone())
      want = clamp(Math.atan2(local.x, local.z), -0.9, 0.9)
    }
    this.headYaw += (want - this.headYaw) * 0.15
    head.rotation.set(headPitch, this.headYaw, 0)
  }
}

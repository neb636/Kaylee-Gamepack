// Mountain Bike's bike and its rider as greybox shapes in the toon look (the art gate builds Maple on the chibi rig):
// a pink mountain bike with knobbly tires, and Maple the beaver in a pink helmet, flat tail out behind, big orange
// teeth. Her legs turn the pedals (two bones each, the knee bending), her arms hold the bars; she waves, cheers, ducks
// and wobbles. The world (ride.ts) moves, turns and leans the whole thing and sets the pose each frame; this file owns
// the shapes and the little actions that play by themselves (a wave, a cheer, the bell's wiggle, covered in leaves).
import { Euler, Group, Quaternion, Vector3, type BufferGeometry } from 'three'
import { bell, clamp, span } from '../../../../../sdk'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid, solidMix, type V3 } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'

const FUR = '#A8714A'
const FUR_LIGHT = '#E2B48A'
const TAIL = '#6E4B3B'
const TEETH = '#FF9A3C'
const FRAME = PAL.hotpink
const TIRE = '#4A4058'
const RIM = PAL.lavender
const WHEEL_R = 0.34
const REAR = -0.54
const BB: V3 = [0, 0.36, 0]
const CRANK = 0.17
const HIP: V3 = [0, 0.98, -0.16]
const THIGH = 0.4
const SHIN = 0.42
const WAVE_S = 1.3
const CHEER_S = 1.6
const LEAVES_S = 3.2

const Y = new Vector3(0, 1, 0)
const tv = new Vector3()
const tv2 = new Vector3()

/** A round bar from a to b (radius r): a frame tube, an arm. */
function tube(a: V3, b: V3, r: number, c: string, seg = 8): BufferGeometry {
  const d = new Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2])
  const len = d.length()
  const e = new Euler().setFromQuaternion(new Quaternion().setFromUnitVectors(Y, d.normalize()))
  return P.cyl(r, r, len, c, { at: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], rot: [e.x, e.y, e.z] }, seg)
}

/** A limb bone: a rounded bar along +y, one meter long, stretched to fit between two points each frame. */
class Bone {
  readonly g = new Group()
  constructor(bag: Bag, r: number, c: string, parent: Group) {
    this.g.add(solid(merge([P.cyl(r, r * 0.92, 1, c, { at: [0, 0.5, 0] }, 8)]), bag, 2))
    parent.add(this.g)
  }
  set(a: Vector3, b: Vector3) {
    this.g.position.copy(a)
    tv2.subVectors(b, a)
    const len = tv2.length()
    this.g.quaternion.setFromUnitVectors(Y, tv2.multiplyScalar(1 / Math.max(1e-4, len)))
    this.g.scale.set(1, len, 1)
  }
}

export interface RiderPose {
  /** Ground speed (m/s): the wheels turn, the pedals go round. */
  speed: number
  /** Pedalling (0 coasting .. 1 pedalling hard). */
  pedal: number
  /** The suspension squashed (m, + = down). */
  squash: number
  /** In the air: she stands up a little and tucks. */
  air: number
  /** Steering (-1..1): the front wheel turns that way (+ = toward her left, +x in the model). */
  steer: number
}

export class Rider {
  /** Placed and turned by the world (faces +z). */
  readonly root = new Group()
  /** Pitches with the slope and leans into the bends, round the wheels' contact. */
  readonly lean = new Group()
  /** The bike's frame and everything on it (dips with the suspension). */
  private bike = new Group()
  private rear = new Group()
  private front = new Group()
  private fork = new Group()
  private crank = new Group()
  private pedals: Group[] = []
  /** Maple: her body pivots at the saddle. */
  private body = new Group()
  private head = new Group()
  private tail = new Group()
  private arms: Group[] = []
  private thighs: Bone[] = []
  private shins: Bone[] = []
  private knees: Group[] = []
  private leaves: Group
  readonly height = 1.9
  private crankA = 0
  private waveT = -1
  private cheerT = -1
  private ringT = -1
  private leavesT = -1
  private tailA = 0
  private tailV = 0

  constructor(bag: Bag) {
    this.root.add(this.lean)
    this.lean.add(this.bike)

    // ---- The bike ----
    const seat: V3 = [0, 0.86, -0.2]
    const head: V3 = [0, 0.86, 0.38]
    const headLow: V3 = [0, 0.66, 0.43]
    const rear: V3 = [0, WHEEL_R, REAR]
    this.bike.add(
      solid(
        merge([
          tube(seat, head, 0.035, FRAME),
          tube(BB, headLow, 0.045, FRAME),
          tube(BB, seat, 0.035, FRAME),
          tube(BB, rear, 0.028, FRAME),
          tube(seat, rear, 0.024, FRAME),
          tube(headLow, head, 0.04, FRAME),
          // The saddle, the seat post, the bottle on the down tube.
          P.rbox(0.13, 0.05, 0.28, 0.025, PAL.ink, { at: [0, 0.94, -0.22] }),
          tube([0, 0.86, -0.2], [0, 0.92, -0.215], 0.022, '#BFB8CC'),
          P.capsule(0.04, 0.1, PAL.mint, { at: [0, 0.55, 0.2], rot: [-0.95, 0, 0] }),
          // The chainring.
          P.cyl(0.11, 0.11, 0.02, '#BFB8CC', { at: [-0.06, 0.36, 0], rot: [0, 0, Math.PI / 2] }, 14),
        ]),
        bag,
        2,
      ),
    )
    // The fork turns with the bars (the front wheel inside it).
    this.fork.position.set(...head)
    this.fork.rotation.x = -0.32
    this.bike.add(this.fork)
    const fork = (x: number) => tube([x, 0, 0], [x, -0.55, 0.06], 0.026, PAL.mint)
    this.fork.add(
      solid(
        merge([
          fork(0.06),
          fork(-0.06),
          tube([0, 0, 0], [0, 0.12, -0.04], 0.03, PAL.ink),
          // The bars, the grips, the bell.
          tube([-0.34, 0.14, -0.06], [0.34, 0.14, -0.06], 0.022, PAL.ink),
          P.capsule(0.03, 0.08, PAL.lavenderDark, { at: [0.3, 0.14, -0.06], rot: [0, 0, Math.PI / 2] }),
          P.capsule(0.03, 0.08, PAL.lavenderDark, { at: [-0.3, 0.14, -0.06], rot: [0, 0, Math.PI / 2] }),
          P.sphere(0.045, PAL.gold, { at: [0.17, 0.19, -0.06], scale: [1, 0.7, 1] }),
        ]),
        bag,
        2,
      ),
    )
    this.front.position.set(0, -0.55, 0.06)
    this.fork.add(this.front)
    this.rear.position.set(...rear)
    this.bike.add(this.rear)
    for (const w of [this.front, this.rear]) w.add(this.wheel(bag))

    this.crank.position.set(...BB)
    this.bike.add(this.crank)
    this.crank.add(solid(merge([tube([0.09, 0, 0], [0.09, CRANK, 0], 0.018, '#BFB8CC'), tube([-0.09, 0, 0], [-0.09, -CRANK, 0], 0.018, '#BFB8CC')]), bag, 1.5))
    for (const side of [1, -1]) {
      // The pedals stay level as the crank turns; her feet rest on them.
      const p = new Group()
      p.position.set(side * 0.13, side * CRANK, 0)
      p.add(solid(merge([P.rbox(0.09, 0.02, 0.1, 0.01, PAL.ink), P.sphere(0.065, TAIL, { at: [0, 0.05, 0.03], scale: [0.9, 0.65, 1.35] })]), bag, 1.5))
      this.crank.add(p)
      this.pedals.push(p)
    }

    // ---- Maple ----
    this.body.position.set(0, 0.95, -0.2)
    this.body.rotation.x = 0.35
    this.bike.add(this.body)
    this.body.add(
      solidMix(
        [P.sphere(0.27, FUR, { at: [0, 0.26, 0], scale: [1, 1.15, 0.92] })],
        [P.sphere(0.2, FUR_LIGHT, { at: [0, 0.22, 0.1], scale: [0.85, 1.05, 0.7] })],
        bag,
        2.5,
      ),
    )
    this.head.position.set(0, 0.62, 0.06)
    this.head.rotation.x = -0.3
    this.body.add(this.head)
    this.head.add(
      solidMix(
        [
          P.sphere(0.25, FUR, { at: [0, 0.03, 0], scale: [1, 0.95, 0.95] }),
          P.sphere(0.07, FUR, { at: [0.18, 0.16, -0.02] }),
          P.sphere(0.07, FUR, { at: [-0.18, 0.16, -0.02] }),
          P.sphere(0.13, FUR_LIGHT, { at: [0, -0.05, 0.17], scale: [1.15, 0.85, 0.85] }),
          // The pink helmet with a white stripe, its little peak.
          P.sphere(0.27, PAL.pink, { at: [0, 0.07, -0.01], scale: [1, 0.8, 1.02] }),
          P.box(0.06, 0.06, 0.5, '#FFFFFF', { at: [0, 0.27, -0.01] }),
          P.rbox(0.3, 0.03, 0.12, 0.012, PAL.hotpink, { at: [0, 0.12, 0.25], rot: [0.25, 0, 0] }),
        ],
        [
          P.sphere(0.034, PAL.ink, { at: [0.09, 0.03, 0.21] }),
          P.sphere(0.034, PAL.ink, { at: [-0.09, 0.03, 0.21] }),
          P.sphere(0.011, '#FFFFFF', { at: [0.1, 0.045, 0.24] }),
          P.sphere(0.011, '#FFFFFF', { at: [-0.08, 0.045, 0.24] }),
          P.sphere(0.04, PAL.ink, { at: [0, -0.01, 0.3], scale: [1.2, 0.8, 0.8] }),
          // Her big orange teeth.
          P.box(0.05, 0.06, 0.02, TEETH, { at: [0.027, -0.11, 0.26] }),
          P.box(0.05, 0.06, 0.02, TEETH, { at: [-0.027, -0.11, 0.26] }),
          P.sphere(0.04, PAL.pink, { at: [0.15, -0.04, 0.18], scale: [1, 0.6, 0.4] }),
          P.sphere(0.04, PAL.pink, { at: [-0.15, -0.04, 0.18], scale: [1, 0.6, 0.4] }),
        ],
        bag,
        2.5,
      ),
    )
    // The flat tail out behind (it flaps up and down over the bumps).
    this.tail.position.set(0, 0.04, -0.2)
    this.body.add(this.tail)
    this.tail.add(solid(merge([P.rbox(0.34, 0.06, 0.52, 0.08, TAIL, { at: [0, 0, -0.26] }), P.box(0.26, 0.064, 0.016, '#9A6A52', { at: [0, 0, -0.18] }), P.box(0.26, 0.064, 0.016, '#9A6A52', { at: [0, 0, -0.32] }), P.box(0.016, 0.064, 0.4, '#9A6A52', { at: [0, 0, -0.26] })]), bag, 2))
    for (const side of [1, -1]) {
      const a = new Group()
      a.position.set(side * 0.21, 0.44, 0.04)
      this.body.add(a)
      a.add(solid(merge([tube([0, 0, 0], [0, -0.42, 0], 0.055, FUR), P.sphere(0.065, FUR, { at: [0, -0.44, 0] })]), bag, 2))
      this.arms.push(a)
    }
    for (let i = 0; i < 2; i++) {
      this.thighs.push(new Bone(bag, 0.075, FUR, this.bike))
      this.shins.push(new Bone(bag, 0.06, FUR, this.bike))
      const k = solid(P.sphere(0.075, FUR, {}, 10), bag, 2)
      this.bike.add(k)
      this.knees.push(k)
    }
    // Leaves stuck all over her after a leaf pile (they fall off).
    const leafColors = ['#E8553F', '#F2873A', '#F5B83D', '#D9443A']
    this.leaves = solid(
      merge(
        Array.from({ length: 9 }, (_, i) => {
          const a = i * 2.4
          return P.prism(
            [
              [0, -0.07],
              [0.05, 0],
              [0, 0.07],
              [-0.05, 0],
            ],
            0.015,
            leafColors[i % 4],
            { at: [Math.sin(a) * 0.2, 0.15 + (i % 3) * 0.17, Math.cos(a) * 0.2], rot: [a, a * 0.7, 0.4] },
          )
        }),
      ),
      bag,
      1,
    )
    this.leaves.visible = false
    this.body.add(this.leaves)
  }

  private wheel(bag: Bag) {
    const spokes = [0, 1, 2, 3, 4, 5].map((i) => P.box(0.012, WHEEL_R * 1.9, 0.012, '#E9E4F2', { rot: [(i * Math.PI) / 6, 0, 0] }))
    // Knobbly tire: little bumps all the way round.
    const knobs = Array.from({ length: 18 }, (_, i) => {
      const a = (i / 18) * Math.PI * 2
      return P.box(0.07, 0.03, 0.05, TIRE, { at: [0, Math.cos(a) * (WHEEL_R + 0.01), Math.sin(a) * (WHEEL_R + 0.01)], rot: [a, 0, 0] })
    })
    return solid(merge([P.torus(WHEEL_R - 0.03, 0.045, TIRE, { rot: [0, Math.PI / 2, 0] }), P.torus(WHEEL_R - 0.08, 0.015, RIM, { rot: [0, Math.PI / 2, 0] }), P.cyl(0.035, 0.035, 0.1, RIM, { rot: [0, 0, Math.PI / 2] }), ...spokes, ...knobs]), bag, 2)
  }

  /** She lets go with one hand and waves. */
  wave() {
    if (this.cheerT < 0) this.waveT = 0
  }
  /** Both arms up, a hop on the saddle. */
  cheer() {
    this.cheerT = 0
    this.waveT = -1
  }
  /** The bell's wiggle (the world plays the ding). */
  ring() {
    this.ringT = 0
  }
  /** Covered in leaves (they fall off after a while). */
  leafy() {
    this.leavesT = 0
    this.leaves.visible = true
  }
  get busy() {
    return this.waveT >= 0 || this.cheerT >= 0 || this.leavesT >= 0
  }
  /** Where her head is, in the world (leaves fall from there). */
  headAt(out: Vector3) {
    return this.head.localToWorld(out.set(0, 0, 0))
  }

  update(dt: number, t: number, pose: RiderPose) {
    // ---- The wheels and the pedals ----
    const roll = (pose.speed * dt) / WHEEL_R
    this.rear.rotation.x += roll
    this.front.rotation.x += roll
    this.fork.rotation.y = clamp(pose.steer, -1, 1) * 0.35
    // Pedalling: a turn per half second hard, a lazy turn coasting; still in the air.
    const cadence = pose.air > 0.5 ? 0 : (0.6 + 1.8 * pose.pedal) * Math.min(1, pose.speed / 3) * Math.PI * 2
    this.crankA += cadence * dt
    this.crank.rotation.x = this.crankA
    for (const p of this.pedals) p.rotation.x = -this.crankA

    // ---- Her body: crouched forward, bobbing with the suspension, up off the saddle in the air ----
    const sq = pose.squash
    this.bike.position.y = -sq * 0.35
    let cheer = 0
    if (this.cheerT >= 0) {
      this.cheerT += dt
      cheer = bell(span(this.cheerT, 0, CHEER_S))
      if (this.cheerT > CHEER_S) this.cheerT = -1
    }
    this.body.position.y = 0.95 - sq * 0.5 + pose.air * 0.08 + cheer * 0.12 + Math.abs(Math.sin(t * 2.2)) * 0.012
    this.body.rotation.x = 0.35 + sq * 0.8 - pose.air * 0.1 - cheer * 0.3
    this.body.rotation.z = Math.sin(this.crankA) * 0.04 * pose.pedal
    this.head.rotation.x = -0.3 - sq * 0.6 + cheer * 0.2
    this.head.rotation.y = Math.sin(t * 0.7) * 0.12 * (1 - Math.min(1, pose.speed / 6))
    // The tail: a spring that flaps with the bumps.
    this.tailV += (-120 * this.tailA - 9 * this.tailV + sq * 400 * dt * 60) * dt
    this.tailA = clamp(this.tailA + this.tailV * dt, -0.6, 0.6)
    this.tail.rotation.x = 0.35 + this.tailA + Math.sin(t * 5) * 0.04

    // ---- Arms: on the bars, or waving, or up in a cheer ----
    let wave = 0
    if (this.waveT >= 0) {
      this.waveT += dt
      wave = bell(span(this.waveT, 0, WAVE_S))
      if (this.waveT > WAVE_S) this.waveT = -1
    }
    this.arms.forEach((a, i) => {
      const side = i === 0 ? 1 : -1
      // Reaching down and forward to the grips (the bars turn a little with the steering).
      const reach = 1.15 - sq * 0.5
      const up = i === 1 ? Math.max(wave, cheer) : cheer
      a.rotation.x = reach * (1 - up) + -2.7 * up
      a.rotation.z = side * (0.12 + 0.35 * up) + (i === 1 && wave > 0 ? Math.sin(this.waveT * 14) * 0.35 * wave : 0)
    })

    // ---- Legs: hip to pedal, the knee bending out in front ----
    this.body.updateMatrix()
    this.bike.updateMatrixWorld(true)
    this.pedals.forEach((p, i) => {
      const side = i === 0 ? 1 : -1
      const hip = tv.set(side * 0.11, HIP[1] - 0.95 + this.body.position.y, HIP[2])
      const foot = p.getWorldPosition(new Vector3())
      this.bike.worldToLocal(foot)
      foot.y += 0.05
      const d = tv2.subVectors(foot, hip)
      const len = Math.min(d.length(), THIGH + SHIN - 0.01)
      // Two bones: the knee sits where both lengths meet, pushed forward.
      const a = (THIGH * THIGH - SHIN * SHIN + len * len) / (2 * len)
      const h = Math.sqrt(Math.max(0, THIGH * THIGH - a * a))
      const dir = d.clone().normalize()
      const fwd = new Vector3(0, 0, 1).sub(dir.clone().multiplyScalar(dir.z)).normalize()
      const knee = hip.clone().addScaledVector(dir, a).addScaledVector(fwd, h)
      knee.x += side * 0.04
      this.thighs[i].set(hip, knee)
      this.shins[i].set(knee, foot)
      this.knees[i].position.copy(knee)
    })

    // ---- The bell's wiggle, the leaves ----
    if (this.ringT >= 0) {
      this.ringT += dt
      this.fork.rotation.z = Math.sin(this.ringT * 40) * 0.05 * (1 - span(this.ringT, 0, 0.5))
      if (this.ringT > 0.5) this.ringT = -1
    }
    if (this.leavesT >= 0) {
      this.leavesT += dt
      const k = span(this.leavesT, LEAVES_S - 0.6, LEAVES_S)
      this.leaves.scale.setScalar(1 - k)
      this.leaves.rotation.y = this.leavesT * 0.5
      if (this.leavesT > LEAVES_S) {
        this.leavesT = -1
        this.leaves.visible = false
      }
    }
  }
}

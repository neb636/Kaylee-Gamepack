// The race's little effects, each one instanced mesh (one draw call however many): sparkles off a big bump flight,
// puffs behind a scoot, and the ball pit's balls (a heaped layer that parts round whoever lands in it, and flying balls
// for the splashes). No physics engine: simple arcs and pushes. (The sparkles and puffs are the engine's Floaters.)
import { Color, DynamicDrawUsage, Group, InstancedMesh, Matrix4, Quaternion, SphereGeometry, Vector3 } from 'three'
import type { Bag } from '../../../../../../engine3d/dispose'
import { toon } from '../../../../../../engine3d/toon'
import { PIT } from './layout'

const m = new Matrix4()
const q = new Quaternion()
const pos = new Vector3()
const one = new Vector3(1, 1, 1)

export { Floaters } from '../../../../../../engine3d/floaters'

const BALL_COLORS = ['#FF8FB8', '#FFFFFF', '#FF4F9A', '#FFFFFF', '#FFC2DA'].map((c) => new Color(c))
const R = 0.1
const FLY = 140

/** Who's in the balls now (they part round them). */
export interface Pusher {
  x: number
  z: number
  r: number
}

/** The pit of pink and white balls. */
export class BallPit {
  readonly root = new Group()
  readonly layer: InstancedMesh
  private base: Float32Array
  private off: Float32Array
  private fly: InstancedMesh
  private flying: { x: number; y: number; z: number; vx: number; vy: number; vz: number; c: number; live: boolean }[] = []
  private nextFly = 0
  private settling = 1

  constructor(bag: Bag) {
    const spots: number[] = []
    // Two loose layers, jittered, so it looks heaped, not tiled.
    for (const layer of [0, 1])
      for (let x = PIT.x0 + R; x < PIT.x1 - R; x += R * 2.05)
        for (let z = PIT.z0 + R; z < PIT.z1 - R; z += R * 2.05) {
          if (layer && Math.random() < 0.4) continue
          spots.push(x + (Math.random() - 0.5) * R * 0.9 + layer * R, PIT.surface - R * (layer ? 0.1 : 1.1) + Math.random() * 0.03, z + (Math.random() - 0.5) * R * 0.9 + layer * R)
        }
    const n = spots.length / 3
    this.base = new Float32Array(spots)
    this.off = new Float32Array(n * 3)
    const geo = bag.add(new SphereGeometry(R, 8, 6))
    this.layer = bag.add(new InstancedMesh(geo, toon('#ffffff'), n))
    this.layer.instanceMatrix.setUsage(DynamicDrawUsage)
    for (let i = 0; i < n; i++) {
      this.layer.setColorAt(i, BALL_COLORS[i % BALL_COLORS.length])
      m.compose(pos.set(spots[i * 3], spots[i * 3 + 1], spots[i * 3 + 2]), q.identity(), one)
      this.layer.setMatrixAt(i, m)
    }
    this.layer.userData.pick = 'balls'
    this.fly = bag.add(new InstancedMesh(geo, toon('#ffffff'), FLY))
    this.fly.instanceMatrix.setUsage(DynamicDrawUsage)
    this.fly.frustumCulled = false
    for (let i = 0; i < FLY; i++) {
      this.flying.push({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, c: 0, live: false })
      this.fly.setColorAt(i, BALL_COLORS[0])
    }
    this.fly.count = 0
    this.root.add(this.layer, this.fly)
  }

  /** Balls jump up from a spot: `n` of them; `power` 1 = a landing, 2 = a big one. `toward`: thrown that way (m/s). */
  splash(x: number, z: number, n: number, power = 1, toward: [number, number] = [0, 0]) {
    for (let i = 0; i < n; i++) {
      const f = this.flying[this.nextFly]
      this.nextFly = (this.nextFly + 1) % FLY
      const a = Math.random() * Math.PI * 2
      const s = (0.6 + Math.random() * 1.4) * power
      f.x = x + Math.cos(a) * 0.2
      f.z = z + Math.sin(a) * 0.2
      f.y = PIT.surface
      f.vx = Math.cos(a) * s + toward[0]
      f.vz = Math.sin(a) * s * 0.7 + toward[1]
      f.vy = (2.4 + Math.random() * 2.4) * Math.sqrt(power)
      f.c = Math.floor(Math.random() * BALL_COLORS.length)
      f.live = true
    }
  }

  update(dt: number, pushers: Pusher[]) {
    // The layer parts round anyone in the balls (and settles back after).
    const inPit = pushers.filter((p) => p.x > PIT.x0 && p.x < PIT.x1 && p.z > PIT.z0 && p.z < PIT.z1)
    if (inPit.length) this.settling = 1
    if (this.settling > 0) {
      const n = this.base.length / 3
      const k = 1 - Math.exp(-dt * 10)
      for (let i = 0; i < n; i++) {
        const bx = this.base[i * 3]
        const bz = this.base[i * 3 + 2]
        let tx = 0
        let ty = 0
        let tz = 0
        for (const p of inPit) {
          const dx = bx - p.x
          const dz = bz - p.z
          const d = Math.hypot(dx, dz)
          if (d >= p.r || d < 1e-4) continue
          const push = (p.r - d) / p.r
          tx += (dx / d) * push * p.r * 0.45
          tz += (dz / d) * push * p.r * 0.45
          ty += push * 0.1
        }
        const o = this.off
        o[i * 3] += (tx - o[i * 3]) * k
        o[i * 3 + 1] += (ty - o[i * 3 + 1]) * k
        o[i * 3 + 2] += (tz - o[i * 3 + 2]) * k
        m.compose(pos.set(bx + o[i * 3], this.base[i * 3 + 1] + o[i * 3 + 1], bz + o[i * 3 + 2]), q.identity(), one)
        this.layer.setMatrixAt(i, m)
      }
      this.layer.instanceMatrix.needsUpdate = true
      if (!inPit.length) this.settling = Math.max(0, this.settling - dt / 0.8)
    }
    // Flying balls: arcs with gravity, a bounce off the pit's walls, back into the layer.
    let live = 0
    for (const f of this.flying) {
      if (!f.live) continue
      f.vy -= 11 * dt
      f.x += f.vx * dt
      f.y += f.vy * dt
      f.z += f.vz * dt
      if (f.x < PIT.x0 + R || f.x > PIT.x1 - R) f.vx *= -0.6
      if (f.z < PIT.z0 + R || f.z > PIT.z1 - R) f.vz *= -0.6
      f.x = Math.min(PIT.x1 - R, Math.max(PIT.x0 + R, f.x))
      f.z = Math.min(PIT.z1 - R, Math.max(PIT.z0 + R, f.z))
      if (f.vy < 0 && f.y < PIT.surface) {
        f.live = false
        continue
      }
      m.compose(pos.set(f.x, f.y, f.z), q.identity(), one)
      this.fly.setMatrixAt(live, m)
      this.fly.setColorAt(live, BALL_COLORS[f.c])
      live++
    }
    this.fly.count = live
    this.fly.instanceMatrix.needsUpdate = true
    if (this.fly.instanceColor) this.fly.instanceColor.needsUpdate = true
  }
}

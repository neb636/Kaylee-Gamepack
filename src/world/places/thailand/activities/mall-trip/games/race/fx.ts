// The race's little effects, each one instanced mesh (one draw call however many): sparkles off a big bump flight,
// puffs behind a scoot, and the ball pit's balls (a heaped layer that parts round whoever lands in it, and flying balls
// for the splashes). No physics engine: simple arcs and pushes. (Floaters is copied from the vet's fx.ts, so each mini
// game stays in its own folder.)
import { Color, DynamicDrawUsage, Group, InstancedMesh, Matrix4, MeshBasicMaterial, Quaternion, SphereGeometry, Vector3, type BufferGeometry, type ColorRepresentation } from 'three'
import type { Bag } from '../../../../../../engine3d/dispose'
import { toon } from '../../../../../../engine3d/toon'
import { PIT } from './layout'

const m = new Matrix4()
const q = new Quaternion()
const pos = new Vector3()
const scl = new Vector3()
const tmp = new Vector3()
const one = new Vector3(1, 1, 1)

interface F {
  p: Vector3
  v: Vector3
  age: number
  life: number
  size: number
  spin: number
  c: number
}

/** Things that fly free and fade: sparkles, puffs. */
export class Floaters {
  readonly mesh: InstancedMesh
  private pool: F[] = []
  private next = 0
  private palette: Color[]

  /** `gravity`: m/s² down (negative floats up); `drag`: how fast they slow. */
  constructor(geo: BufferGeometry, colors: ColorRepresentation[], count: number, bag: Bag, private gravity = 0, private drag = 1.5) {
    this.mesh = bag.add(new InstancedMesh(bag.add(geo), bag.add(new MeshBasicMaterial({ color: '#ffffff' })), count))
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage)
    this.mesh.frustumCulled = false
    this.palette = colors.map((c) => new Color(c))
    for (let i = 0; i < count; i++) {
      this.pool.push({ p: new Vector3(), v: new Vector3(), age: 1, life: 0, size: 0, spin: 0, c: 0 })
      this.mesh.setColorAt(i, this.palette[0])
    }
    this.mesh.count = 0
  }

  emit(at: Vector3, v: Vector3, life: number, size: number, color = -1) {
    const f = this.pool[this.next]
    f.c = color >= 0 ? color % this.palette.length : Math.floor(Math.random() * this.palette.length)
    this.next = (this.next + 1) % this.pool.length
    f.p.copy(at)
    f.v.copy(v)
    f.age = 0
    f.life = life
    f.size = size
    f.spin = (Math.random() - 0.5) * 4
  }

  /** `n` flying out from a point in all directions (`up`: extra upward speed). */
  burst(at: Vector3, n: number, speed: number, up: number, life: number, size: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const s = speed * (0.4 + Math.random() * 0.6)
      this.emit(at, tmp.set(Math.cos(a) * s, up * (0.5 + Math.random() * 0.8), Math.sin(a) * s * 0.5 + 0.3), life * (0.7 + Math.random() * 0.6), size * (0.6 + Math.random() * 0.7))
    }
  }

  update(dt: number) {
    let n = 0
    for (const f of this.pool) {
      if (f.age >= f.life) continue
      f.age += dt
      if (f.age >= f.life) continue
      const k = f.age / f.life
      f.v.y -= this.gravity * dt
      f.v.multiplyScalar(Math.exp(-this.drag * dt))
      f.p.addScaledVector(f.v, dt)
      const s = f.size * Math.min(1, k * 6) * (1 - k * k)
      q.setFromAxisAngle(tmp.set(0, 0, 1), Math.sin(f.age * 3 + f.spin) * 0.3 + f.age * f.spin)
      m.compose(pos.copy(f.p), q, scl.set(s, s, s))
      this.mesh.setMatrixAt(n, m)
      this.mesh.setColorAt(n++, this.palette[f.c])
    }
    this.mesh.count = n
    this.mesh.instanceMatrix.needsUpdate = true
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true
  }
}

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

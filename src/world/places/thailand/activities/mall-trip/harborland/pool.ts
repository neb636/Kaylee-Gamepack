// The ball pit's balls: a layer of hundreds of pastel balls (one instanced mesh) that parts round whoever wades in it
// (Kaylee, Daddy, a kid), and a few dozen flying balls (another) for splashes: hopping in, a slide landing, a toss,
// Daddy's flop. Flying balls arc up and drop back into the layer (and bounce off a deck over the pit). No physics
// engine: simple arcs and pushes. A pit that already has its balls (the racing slide's) can take just the splashes.
import { Color, DynamicDrawUsage, Group, InstancedMesh, Matrix4, Quaternion, SphereGeometry, Vector3 } from 'three'
import type { Bag } from '../../../engine/dispose'
import { toon } from '../../../engine/toon'
import type { Rect } from './layout'

const COLORS = ['#FF8FB8', '#A8DCFF', '#FBEA9A', '#8FE3C8', '#D9CCFF', '#FFFFFF', '#FF4F9A', '#FFC2A8'].map((c) => new Color(c))
const R = 0.095
const FLY = 90

const m = new Matrix4()
const q = new Quaternion()
const pos = new Vector3()
const one = new Vector3(1, 1, 1)

export interface Pusher {
  x: number
  z: number
  /** How far the balls part round them (m). */
  r: number
  /** How deep they sink (0 = not in the balls). */
  depth: number
}

export class BallPool {
  readonly root = new Group()
  private layer: InstancedMesh
  private base: Float32Array
  private off: Float32Array
  private fly: InstancedMesh
  private flying: { x: number; y: number; z: number; vx: number; vy: number; vz: number; c: number; live: boolean }[] = []
  private nextFly = 0
  private settling = 0

  /** How high flying balls go before they bounce off whatever is over the pit. */
  private ceiling: number

  constructor(
    private inner: Rect,
    private surface: number,
    /** Spots without balls. */
    avoid: (x: number, z: number) => boolean,
    bag: Bag,
    opts: { layer?: boolean; ceiling?: number } = {},
  ) {
    this.ceiling = opts.ceiling ?? Infinity
    const [x0, x1, z0, z1] = inner
    const spots: number[] = []
    // Two loose layers, jittered, so it looks heaped, not tiled.
    for (const layer of [0, 1])
      for (let x = x0 + R; x < x1 - R; x += R * 2.05)
        for (let z = z0 + R; z < z1 - R; z += R * 2.05) {
          if (layer && Math.random() < 0.45) continue
          const jx = x + (Math.random() - 0.5) * R * 0.9 + layer * R
          const jz = z + (Math.random() - 0.5) * R * 0.9 + layer * R
          if (avoid(jx, jz)) continue
          spots.push(jx, surface - R * (layer ? 0.1 : 1.1) + Math.random() * 0.03, jz)
        }
    const n = spots.length / 3
    this.base = new Float32Array(spots)
    this.off = new Float32Array(n * 3)
    const geo = bag.add(new SphereGeometry(R, 8, 6))
    this.layer = bag.add(new InstancedMesh(geo, toon('#ffffff'), n))
    this.layer.instanceMatrix.setUsage(DynamicDrawUsage)
    for (let i = 0; i < n; i++) {
      this.layer.setColorAt(i, COLORS[i % COLORS.length])
      m.compose(pos.set(spots[i * 3], spots[i * 3 + 1], spots[i * 3 + 2]), q, one)
      this.layer.setMatrixAt(i, m)
    }
    this.layer.userData.pick = 'pool'
    this.layer.visible = opts.layer ?? true
    this.fly = bag.add(new InstancedMesh(geo, toon('#ffffff'), FLY))
    this.fly.instanceMatrix.setUsage(DynamicDrawUsage)
    this.fly.frustumCulled = false
    for (let i = 0; i < FLY; i++) {
      this.flying.push({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, c: 0, live: false })
      this.fly.setColorAt(i, COLORS[0])
    }
    this.fly.count = 0
    this.root.add(this.layer, this.fly)
  }

  /** Is this spot in the pool? */
  inside(x: number, z: number) {
    const [x0, x1, z0, z1] = this.inner
    return x > x0 && x < x1 && z > z0 && z < z1
  }

  /** Balls jump up from a spot: `n` of them, `power` 1 = a dive, 2 = a cannonball. Optionally thrown toward a side. */
  splash(x: number, z: number, n: number, power = 1, toward?: [number, number]) {
    for (let i = 0; i < n; i++) {
      const f = this.flying[this.nextFly]
      this.nextFly = (this.nextFly + 1) % FLY
      const a = Math.random() * Math.PI * 2
      const s = (0.8 + Math.random() * 1.6) * power
      f.x = x + Math.cos(a) * 0.2
      f.z = z + Math.sin(a) * 0.2
      f.y = this.surface
      f.vx = Math.cos(a) * s + (toward?.[0] ?? 0)
      f.vz = Math.sin(a) * s + (toward?.[1] ?? 0)
      f.vy = (2.6 + Math.random() * 2.2) * Math.sqrt(power)
      f.c = Math.floor(Math.random() * COLORS.length)
      f.live = true
    }
  }

  get busy() {
    return this.flying.some((f) => f.live)
  }

  update(dt: number, pushers: Pusher[]) {
    // The layer parts round anyone wading (and settles back after).
    const inPool = pushers.filter((p) => p.depth > 0 && this.inside(p.x, p.z))
    if (inPool.length) this.settling = 1
    if (this.settling > 0) {
      const n = this.base.length / 3
      const k = 1 - Math.exp(-dt * 10)
      for (let i = 0; i < n; i++) {
        const bx = this.base[i * 3]
        const bz = this.base[i * 3 + 2]
        let tx = 0
        let ty = 0
        let tz = 0
        for (const p of inPool) {
          const dx = bx - p.x
          const dz = bz - p.z
          const d = Math.hypot(dx, dz)
          if (d >= p.r || d < 1e-4) continue
          const push = (p.r - d) / p.r
          tx += (dx / d) * push * p.r * 0.45
          tz += (dz / d) * push * p.r * 0.45
          ty += push * 0.12 * p.depth
        }
        const o = this.off
        o[i * 3] += (tx - o[i * 3]) * k
        o[i * 3 + 1] += (ty - o[i * 3 + 1]) * k
        o[i * 3 + 2] += (tz - o[i * 3 + 2]) * k
        m.compose(pos.set(bx + o[i * 3], this.base[i * 3 + 1] + o[i * 3 + 1], bz + o[i * 3 + 2]), q, one)
        this.layer.setMatrixAt(i, m)
      }
      this.layer.instanceMatrix.needsUpdate = true
      if (!inPool.length) this.settling = Math.max(0, this.settling - dt / 0.8)
    }
    // Flying balls: arcs with gravity, back into the layer.
    let live = 0
    for (const f of this.flying) {
      if (!f.live) continue
      f.vy -= 11 * dt
      f.x += f.vx * dt
      f.y += f.vy * dt
      f.z += f.vz * dt
      if (f.y > this.ceiling) {
        f.y = this.ceiling
        f.vy = -Math.abs(f.vy) * 0.3
      }
      if (f.vy < 0 && f.y < this.surface) {
        f.live = false
        continue
      }
      m.compose(pos.set(f.x, f.y, f.z), q, one)
      this.fly.setMatrixAt(live, m)
      this.fly.setColorAt(live, COLORS[f.c])
      live++
    }
    this.fly.count = live
    this.fly.instanceMatrix.needsUpdate = true
    if (this.fly.instanceColor) this.fly.instanceColor.needsUpdate = true
  }
}

// Little things that fly free and fade (sparkles, puffs, crumbs, mist, confetti), all of them one instanced mesh: one
// draw call however many. The mall's mini games and the mushroom farm each used to carry their own copy of this; the
// differences between those copies are the options below, so each game keeps the look it had.
import { Color, DynamicDrawUsage, InstancedMesh, Matrix4, MeshBasicMaterial, Quaternion, Vector3, type BufferGeometry, type ColorRepresentation } from 'three'
import type { Bag } from './dispose'

const m = new Matrix4()
const q = new Quaternion()
const pos = new Vector3()
const scl = new Vector3()
const tmp = new Vector3()
const Z = new Vector3(0, 0, 1)

interface F {
  p: Vector3
  v: Vector3
  age: number
  life: number
  size: number
  spin: number
  c: number
}

export interface FloaterOptions {
  /** Falling ones (gravity > 0) vanish when they drop below this height (crumbs landing on a table). Default: never. */
  floor?: number
  /** Each one also turns round as it flies (sparkles); false: it only wobbles (crumbs, mist). Default true. */
  roll?: boolean
  /** See-through (mist): drawn after the scene, writing no depth. Default 1. */
  opacity?: number
  /** A puff that swells as it fades (0: they pop in, then shrink). Default 0. */
  grow?: number
  /** `burst` throws them out in the camera's plane (steam, mist) instead of across the ground. Default false. */
  facing?: boolean
}

export class Floaters {
  readonly mesh: InstancedMesh
  private pool: F[] = []
  private next = 0
  private palette: Color[]
  private floor: number | null
  private roll: boolean
  private grow: number
  private facing: boolean

  /** `gravity`: m/s² down (negative floats up); `drag`: how fast they slow. */
  constructor(geo: BufferGeometry, colors: ColorRepresentation[], count: number, bag: Bag, private gravity = 0, private drag = 1.5, opts: FloaterOptions = {}) {
    const opacity = opts.opacity ?? 1
    const mat = new MeshBasicMaterial({ color: '#ffffff', transparent: opacity < 1, opacity, depthWrite: opacity >= 1 })
    this.mesh = bag.add(new InstancedMesh(bag.add(geo), bag.add(mat), count))
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage)
    this.mesh.frustumCulled = false
    if (opacity < 1) this.mesh.renderOrder = 2
    this.floor = opts.floor ?? null
    this.roll = opts.roll ?? true
    this.grow = opts.grow ?? 0
    this.facing = opts.facing ?? false
    this.palette = colors.map((c) => new Color(c))
    for (let i = 0; i < count; i++) {
      this.pool.push({ p: new Vector3(), v: new Vector3(), age: 1, life: 0, size: 0, spin: 0, c: 0 })
      this.mesh.setColorAt(i, this.palette[0])
    }
    this.mesh.count = 0
  }

  /** One, from `at` with velocity `v` (m/s). `color`: an index into the palette (-1: a random one). */
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
  burst(at: Vector3, n: number, speed: number, up: number, life: number, size: number, color = -1) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const s = speed * (0.4 + Math.random() * 0.6)
      const lift = up * (0.5 + Math.random() * 0.8)
      if (this.facing) tmp.set(Math.cos(a) * s, lift + Math.sin(a) * s * 0.5, 0.3 * s)
      else tmp.set(Math.cos(a) * s, lift, Math.sin(a) * s * 0.5 + 0.3)
      this.emit(at, tmp, life * (0.7 + Math.random() * 0.6), size * (0.6 + Math.random() * 0.7), color)
    }
  }

  /** `n` flying out round a point on a wall (in its plane, a little toward the camera): a slapped Sky Pod. */
  ring(at: Vector3, n: number, speed: number, life: number, size: number, color = -1) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.4
      const s = speed * (0.7 + Math.random() * 0.5)
      this.emit(at, tmp.set(Math.cos(a) * s, Math.sin(a) * s, 0.4 + Math.random() * 0.5), life * (0.7 + Math.random() * 0.5), size * (0.7 + Math.random() * 0.6), color)
    }
  }

  /** How many are flying now. */
  get live() {
    return this.mesh.count
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
      if (this.floor !== null && this.gravity > 0 && f.p.y < this.floor) f.age = f.life
      const s = this.grow ? f.size * (0.4 + k * this.grow) * (1 - k * k) : f.size * Math.min(1, k * 6) * (1 - k * k)
      q.setFromAxisAngle(Z, Math.sin(f.age * 3 + f.spin) * 0.3 + (this.roll ? f.age * f.spin : 0))
      m.compose(pos.copy(f.p), q, scl.set(s, s, s))
      this.mesh.setMatrixAt(n, m)
      this.mesh.setColorAt(n++, this.palette[f.c])
    }
    this.mesh.count = n
    this.mesh.instanceMatrix.needsUpdate = true
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true
  }
}

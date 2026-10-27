// Muay Thai's little effects, each one instanced mesh (one draw call however many): gold stars bursting off a punch,
// sparkles for a star or the belt, and water drops from the bottle. (Floaters is copied from Little Land's fx.ts, so
// each mini game stays in its own folder.)
import { Color, DynamicDrawUsage, InstancedMesh, Matrix4, MeshBasicMaterial, Quaternion, Vector3, type BufferGeometry, type ColorRepresentation } from 'three'
import type { Bag } from '../../../../../../engine3d/dispose'

const m = new Matrix4()
const q = new Quaternion()
const pos = new Vector3()
const scl = new Vector3()
const tmp = new Vector3()

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

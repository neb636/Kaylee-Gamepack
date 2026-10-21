// The cafe's little effects, each one instanced mesh (one draw call however many). Copied from the vet's (games/vet/
// fx.ts) and given a color per particle, since a drink can be any color she blends:
//   - Floaters fly free and fade: drops off the stream, steam, hearts, sparkles, frost round Daddy's head.
//   - Splats stick where they land (the ceiling beam, the wall) and slowly shrink away.
import { Color, DynamicDrawUsage, IcosahedronGeometry, InstancedMesh, Matrix4, MeshBasicMaterial, Quaternion, Vector3, type BufferGeometry, type ColorRepresentation } from 'three'
import type { Bag } from '../../../../engine/dispose'
import { merge, P } from '../../../../engine/geo'
import { toon } from '../../../../engine/toon'

const m = new Matrix4()
const q = new Quaternion()
const pos = new Vector3()
const scl = new Vector3()
const tmp = new Vector3()
const Z = new Vector3(0, 0, 1)

/** A puffy heart (facing the camera), about 1 unit across. */
export function heartGeometry(): BufferGeometry {
  return merge([P.sphere(0.3, '#fff', { at: [-0.22, 0.12, 0] }, 12), P.sphere(0.3, '#fff', { at: [0.22, 0.12, 0] }, 12), P.cone(0.48, 0.6, '#fff', { at: [0, -0.28, 0], rot: [0, 0, Math.PI] }, 12)])
}

interface F {
  p: Vector3
  v: Vector3
  age: number
  life: number
  size: number
  spin: number
  c: Color
}

export class Floaters {
  readonly mesh: InstancedMesh
  private pool: F[] = []
  private next = 0

  /** `gravity`: m/s² down (negative floats up); `drag`: how fast they slow; `floor`: they vanish below it. */
  constructor(geo: BufferGeometry, count: number, bag: Bag, private gravity = 0, private drag = 1.5, private floor = 0.02) {
    this.mesh = bag.add(new InstancedMesh(bag.add(geo), bag.add(new MeshBasicMaterial({ color: '#ffffff' })), count))
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage)
    this.mesh.frustumCulled = false
    for (let i = 0; i < count; i++) {
      this.pool.push({ p: new Vector3(), v: new Vector3(), age: 1, life: 0, size: 0, spin: 0, c: new Color() })
      this.mesh.setColorAt(i, new Color('#ffffff'))
    }
    this.mesh.count = 0
  }

  emit(at: Vector3, v: Vector3, life: number, size: number, color: ColorRepresentation) {
    const f = this.pool[this.next]
    this.next = (this.next + 1) % this.pool.length
    f.c.set(color)
    f.p.copy(at)
    f.v.copy(v)
    f.age = 0
    f.life = life
    f.size = size
    f.spin = (Math.random() - 0.5) * 4
  }

  /** `n` flying out from a point in all directions (`up`: extra upward speed). */
  burst(at: Vector3, n: number, speed: number, up: number, life: number, size: number, colors: ColorRepresentation[]) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const s = speed * (0.4 + Math.random() * 0.6)
      this.emit(at, tmp.set(Math.cos(a) * s, up * (0.5 + Math.random() * 0.8), Math.sin(a) * s * 0.5 + 0.3), life * (0.7 + Math.random() * 0.6), size * (0.6 + Math.random() * 0.7), colors[i % colors.length])
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
      if (this.gravity > 0 && f.p.y < this.floor) f.age = f.life
      const s = f.size * Math.min(1, k * 6) * (1 - k * k)
      q.setFromAxisAngle(Z, Math.sin(f.age * 3 + f.spin) * 0.3)
      m.compose(pos.copy(f.p), q, scl.set(s, s, s))
      this.mesh.setMatrixAt(n, m)
      this.mesh.setColorAt(n++, f.c)
    }
    this.mesh.count = n
    this.mesh.instanceMatrix.needsUpdate = true
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true
  }
}

interface S {
  p: Vector3
  size: number
  k: number
  age: number
  c: Color
  rot: number
}

/** Flat splats stuck on a surface facing her: they pop in, wobble, and shrink away after `life` seconds. */
export class Splats {
  readonly mesh: InstancedMesh
  private list: S[] = []

  constructor(private max: number, bag: Bag, private life = 22) {
    this.mesh = bag.add(new InstancedMesh(bag.add(new IcosahedronGeometry(1, 1)), toon('#ffffff'), max))
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage)
    this.mesh.frustumCulled = false
    for (let i = 0; i < max; i++) this.mesh.setColorAt(i, new Color('#ffffff'))
    this.mesh.count = 0
  }

  add(at: Vector3, size: number, color: ColorRepresentation) {
    if (this.list.length >= this.max) this.list.shift()
    this.list.push({ p: at.clone(), size, k: 0, age: 0, c: new Color(color), rot: Math.random() * 6 })
  }
  get count() {
    return this.list.length
  }
  clear() {
    for (const s of this.list) s.age = Math.max(s.age, this.life - 1)
  }

  update(dt: number) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const s = this.list[i]
      s.age += dt
      if (s.age >= this.life) this.list.splice(i, 1)
    }
    let n = 0
    for (const s of this.list) {
      s.k += (1 - s.k) * (1 - Math.exp(-dt * 16))
      const fade = Math.min(1, (this.life - s.age) / 1.5)
      const r = s.size * s.k * fade * (1 + Math.sin(s.age * 9) * 0.06 * Math.exp(-s.age))
      q.setFromAxisAngle(Z, s.rot)
      m.compose(s.p, q, scl.set(r, r * 0.85, r * 0.2))
      this.mesh.setMatrixAt(n, m)
      this.mesh.setColorAt(n++, s.c)
    }
    this.mesh.count = n
    this.mesh.instanceMatrix.needsUpdate = true
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true
  }
}

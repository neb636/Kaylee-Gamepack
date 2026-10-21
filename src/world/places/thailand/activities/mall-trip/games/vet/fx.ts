// The vet's little effects, each one instanced mesh (one draw call however many):
//   - Floaters fly free and fade: hearts rising off the stethoscope, bubbles, water drops, fluff, sparkles.
//   - Blobs stick to a patient (on the body, the head or the paw, so they move with it): suds where she rubs the
//     soap, the pony's mud, the cream on the puppy's paw. They pop in, and shrink away when washed off.
import { Color, DynamicDrawUsage, IcosahedronGeometry, InstancedMesh, Matrix4, MeshBasicMaterial, Quaternion, Vector3, type BufferGeometry, type ColorRepresentation, type Object3D } from 'three'
import type { Bag } from '../../../../engine/dispose'
import { merge, P } from '../../../../engine/geo'
import { toon } from '../../../../engine/toon'

const m = new Matrix4()
const q = new Quaternion()
const pos = new Vector3()
const scl = new Vector3()
const tmp = new Vector3()

/** A puffy heart (facing the camera), about 1 unit across. */
export function heartGeometry(): BufferGeometry {
  return merge([P.sphere(0.3, '#fff', { at: [-0.22, 0.12, 0] }, 12), P.sphere(0.3, '#fff', { at: [0.22, 0.12, 0] }, 12), P.cone(0.48, 0.6, '#fff', { at: [0, -0.28, 0], rot: [0, 0, Math.PI], scale: [1, 1, 0.62] }, 12)])
}

interface F {
  p: Vector3
  v: Vector3
  age: number
  life: number
  size: number
  spin: number
  c: number
}

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
      if (this.gravity > 0 && f.p.y < 0.02) f.age = f.life
      const s = f.size * Math.min(1, k * 6) * (1 - k * k)
      q.setFromAxisAngle(tmp.set(0, 0, 1), Math.sin(f.age * 3 + f.spin) * 0.3)
      m.compose(pos.copy(f.p), q, scl.set(s, s, s))
      this.mesh.setMatrixAt(n, m)
      this.mesh.setColorAt(n++, this.palette[f.c])
    }
    this.mesh.count = n
    this.mesh.instanceMatrix.needsUpdate = true
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true
  }
}

interface B {
  p: Vector3
  size: number
  k: number
  goal: number
}

/** Blobs stuck on one part of a patient (local to `parent`). */
export class Blobs {
  readonly mesh: InstancedMesh
  readonly list: B[] = []

  constructor(color: ColorRepresentation, private max: number, parent: Object3D, bag: Bag, detail = 1) {
    this.mesh = bag.add(new InstancedMesh(bag.add(new IcosahedronGeometry(1, detail)), toon(color), max))
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage)
    this.mesh.frustumCulled = false
    this.mesh.count = 0
    parent.add(this.mesh)
  }

  /** A blob at a point (local to the parent). Full: the oldest one moves here. */
  add(local: Vector3, size: number) {
    if (this.list.length >= this.max) this.list.shift()
    this.list.push({ p: local.clone(), size, k: 0, goal: 1 })
  }
  /** How many are there (not washing off). */
  get count() {
    return this.list.filter((b) => b.goal > 0).length
  }
  /** Washes off the ones `hit` says (it gets each one's world position); returns how many started to go. */
  wash(hit: (world: Vector3) => boolean): number {
    let n = 0
    this.mesh.updateWorldMatrix(true, false)
    for (const b of this.list) {
      if (b.goal === 0) continue
      if (hit(tmp.copy(b.p).applyMatrix4(this.mesh.matrixWorld))) {
        b.goal = 0
        n++
      }
    }
    return n
  }
  /** Everything comes off (and each one's world position, for the bubbles that fly off in a sneeze). */
  clear(): Vector3[] {
    this.mesh.updateWorldMatrix(true, false)
    const out = this.list.filter((b) => b.goal > 0).map((b) => b.p.clone().applyMatrix4(this.mesh.matrixWorld))
    this.list.length = 0
    return out
  }

  update(dt: number, t: number) {
    for (const b of this.list) b.k += ((b.goal - b.k) * (1 - Math.exp(-dt * (b.goal ? 14 : 9))))
    for (let i = this.list.length - 1; i >= 0; i--) if (this.list[i].goal === 0 && this.list[i].k < 0.03) this.list.splice(i, 1)
    let n = 0
    for (const b of this.list) {
      // Pop in with a little overshoot, and wobble gently (suds).
      const s = b.size * b.k * (1 + Math.sin(t * 5 + b.p.x * 40) * 0.05)
      m.compose(b.p, q.identity(), scl.set(s, s, s))
      this.mesh.setMatrixAt(n++, m)
    }
    this.mesh.count = n
    this.mesh.instanceMatrix.needsUpdate = true
  }
}

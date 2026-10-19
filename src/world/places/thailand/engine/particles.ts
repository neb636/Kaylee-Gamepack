// Pooled particles drawn as one instanced mesh: foam on the water (flat white blobs that spread and shrink: wakes,
// splash rings) and spray in the air (little white drops that fly and fall: the rooster tail behind a fast longtail, a
// bonk, a landing). No allocation while playing; the oldest particle is reused when the pool is full.
import { CircleGeometry, DynamicDrawUsage, IcosahedronGeometry, InstancedMesh, Matrix4, MeshBasicMaterial, Quaternion, Vector3, type ColorRepresentation } from 'three'
import type { Bag } from './dispose'

interface P {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  age: number
  life: number
  size: number
}

export interface ParticleOpts {
  kind: 'foam' | 'spray'
  count: number
  color?: ColorRepresentation
  opacity?: number
}

const m = new Matrix4()
const q = new Quaternion()
const pos = new Vector3()
const scl = new Vector3()
const flat = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2)

export class Particles {
  readonly mesh: InstancedMesh
  private pool: P[] = []
  private next = 0
  private live = 0

  constructor(private o: ParticleOpts, bag: Bag) {
    const geo = o.kind === 'foam' ? new CircleGeometry(0.5, 16) : new IcosahedronGeometry(0.5, 0)
    const mat = new MeshBasicMaterial({ color: o.color ?? '#FFFFFF', transparent: (o.opacity ?? 1) < 1, opacity: o.opacity ?? 1, depthWrite: o.kind !== 'foam' })
    if (o.kind === 'foam') {
      mat.polygonOffset = true
      mat.polygonOffsetFactor = -2
    }
    this.mesh = bag.add(new InstancedMesh(bag.add(geo), bag.add(mat), o.count))
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = o.kind === 'foam' ? 1 : 0
    for (let i = 0; i < o.count; i++) this.pool.push({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, age: 1, life: 0, size: 0 })
    this.mesh.count = 0
  }

  /** One particle: where, how fast (m/s), how long it lives (s) and how big it gets (m). */
  emit(x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number, size: number) {
    const p = this.pool[this.next]
    this.next = (this.next + 1) % this.pool.length
    p.x = x
    p.y = y
    p.z = z
    p.vx = vx
    p.vy = vy
    p.vz = vz
    p.age = 0
    p.life = life
    p.size = size
  }

  /** A burst of `n` drops flying up and out from a point. */
  burst(x: number, y: number, z: number, n: number, speed: number, up: number, size = 0.22) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const s = speed * (0.4 + Math.random() * 0.6)
      this.emit(x, y, z, Math.cos(a) * s, up * (0.6 + Math.random() * 0.6), Math.sin(a) * s, 0.5 + Math.random() * 0.4, size * (0.6 + Math.random() * 0.8))
    }
  }

  get busy() {
    return this.live > 0
  }

  update(dt: number) {
    const foam = this.o.kind === 'foam'
    let n = 0
    for (const p of this.pool) {
      if (p.age >= p.life) continue
      p.age += dt
      if (p.age >= p.life) continue
      const k = p.age / p.life
      p.x += p.vx * dt
      p.z += p.vz * dt
      let s: number
      if (foam) {
        // Spreads out fast, then shrinks away.
        p.vx *= Math.exp(-2 * dt)
        p.vz *= Math.exp(-2 * dt)
        s = p.size * Math.sqrt(Math.min(1, k * 4)) * (1 - k * k)
        q.copy(flat)
      } else {
        p.vy -= 14 * dt
        p.y += p.vy * dt
        if (p.y < 0) p.age = p.life
        s = p.size * (1 - k)
        q.identity()
      }
      m.compose(pos.set(p.x, p.y, p.z), q, scl.set(s, s, s))
      this.mesh.setMatrixAt(n++, m)
    }
    this.live = n
    this.mesh.count = n
    this.mesh.instanceMatrix.needsUpdate = true
  }
}

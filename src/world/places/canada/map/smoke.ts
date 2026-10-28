// The engine's smoke: round toon puffs that pop out of the chimney small, billow up big and soft as they rise and drift
// back behind the train, then shrink away. One instanced mesh, no allocation while playing (the oldest puff is reused).
import { Color, DynamicDrawUsage, IcosahedronGeometry, InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three'
import type { Bag } from '../../../engine3d/dispose'
import { toon } from '../../../engine3d/toon'

interface Puff {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  age: number
  life: number
  size: number
  spin: number
}

const m = new Matrix4()
const q = new Quaternion()
const axis = new Vector3(0.3, 1, 0.2).normalize()
const pos = new Vector3()
const scl = new Vector3()

export class Smoke {
  readonly mesh: InstancedMesh
  private pool: Puff[] = []
  private next = 0
  private live = 0

  constructor(count: number, bag: Bag, color = '#FFFFFF') {
    const mat = toon(new Color(color))
    this.mesh = bag.add(new InstancedMesh(bag.add(new IcosahedronGeometry(0.5, 1)), mat, count))
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage)
    this.mesh.frustumCulled = false
    this.mesh.count = 0
    for (let i = 0; i < count; i++) this.pool.push({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, age: 1, life: 0, size: 0, spin: 0 })
  }

  /** One puff at (x, y, z), drifting at (vx, vy, vz) m/s, `size` m across at its biggest. */
  emit(x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number, size: number) {
    const p = this.pool[this.next]
    this.next = (this.next + 1) % this.pool.length
    Object.assign(p, { x, y, z, vx, vy, vz, age: 0, life, size, spin: Math.random() * 6 })
  }

  get busy() {
    return this.live > 0
  }

  update(dt: number) {
    let n = 0
    for (const p of this.pool) {
      if (p.age >= p.life) continue
      p.age += dt
      if (p.age >= p.life) continue
      const k = p.age / p.life
      // Slows as it rises (it billows, then hangs), and drifts on the breeze.
      const drag = Math.exp(-1.6 * dt)
      p.vx *= drag
      p.vz *= drag
      p.vy *= Math.exp(-0.9 * dt)
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.z += p.vz * dt
      // Pops out small, grows fast and soft, then shrinks away at the end.
      const grow = 1 - (1 - Math.min(1, k / 0.3)) ** 3
      const fade = k > 0.65 ? 1 - ((k - 0.65) / 0.35) ** 1.5 : 1
      const s = p.size * (0.25 + 0.75 * grow) * fade
      q.setFromAxisAngle(axis, p.spin + k * 1.5)
      m.compose(pos.set(p.x, p.y, p.z), q, scl.set(s, s * 0.85, s))
      this.mesh.setMatrixAt(n++, m)
    }
    this.live = n
    this.mesh.count = n
    this.mesh.instanceMatrix.needsUpdate = true
  }
}

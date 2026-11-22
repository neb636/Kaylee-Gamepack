// Bubbles coming up through the sea where a whale is about to peek out (the thing she touches), and the ring of them
// that grows while she holds the humpback down. Round shiny bubbles bulge up out of the water and pop, and a pale
// circle of churned water spreads under them. Two instanced meshes (the bubbles and their shines), a ring and the pale
// disc: four draw calls however many bubbles.
import { CircleGeometry, Group, IcosahedronGeometry, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, Quaternion, RingGeometry, SphereGeometry, Vector3, DynamicDrawUsage } from 'three'
import type { Bag } from '../../../../engine3d/dispose'

const N = 34
const m4 = new Matrix4()
const q = new Quaternion()
const v = new Vector3()
const sc = new Vector3()

interface B {
  x: number
  z: number
  t: number
  len: number
  r: number
}

export class Bubbles {
  readonly root = new Group()
  private balls: InstancedMesh
  private shines: InstancedMesh
  private ring: Mesh
  private ringMat: MeshBasicMaterial
  private shade: Mesh
  private shadeMat: MeshBasicMaterial
  private list: B[] = []
  private on = 0
  private goal = 0
  private time = 0
  /** How wide the patch is (m) and how busy (0..1); the world sets them (the hold grows them). */
  radius = 1.6
  busy = 1
  /** A bubble popped at the surface this frame (the world plinks now and then). */
  popped = 0

  constructor(bag: Bag) {
    const ballMat = bag.add(new MeshBasicMaterial({ color: '#F2FCFF', transparent: true, opacity: 0.88, depthWrite: false }))
    this.balls = bag.add(new InstancedMesh(bag.add(new SphereGeometry(0.5, 14, 10)), ballMat, N))
    const shineMat = bag.add(new MeshBasicMaterial({ color: '#FFFFFF' }))
    this.shines = bag.add(new InstancedMesh(bag.add(new IcosahedronGeometry(0.5, 1)), shineMat, N))
    for (const im of [this.balls, this.shines]) {
      im.instanceMatrix.setUsage(DynamicDrawUsage)
      im.frustumCulled = false
      im.renderOrder = 4
      this.root.add(im)
    }
    this.ringMat = bag.add(new MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0, depthWrite: false }))
    this.ring = new Mesh(bag.add(new RingGeometry(0.82, 1, 48)), this.ringMat)
    this.ring.rotation.x = -Math.PI / 2
    this.ring.position.y = 0.06
    this.ring.renderOrder = 3
    this.root.add(this.ring)
    // Churned water: a pale disc on the sea under them.
    this.shadeMat = bag.add(new MeshBasicMaterial({ color: '#BFEFF4', transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }))
    this.shade = new Mesh(bag.add(new CircleGeometry(1, 32)), this.shadeMat)
    this.shade.rotation.x = -Math.PI / 2
    this.shade.position.y = 0.025
    this.shade.renderOrder = 2
    this.root.add(this.shade)
    for (let i = 0; i < N; i++) this.list.push({ x: 0, z: 0, t: 1, len: 1, r: 0.1 })
    this.root.visible = false
  }

  /** Bubbles on (they fade in) or off (the last ones pop). */
  show(on: boolean) {
    this.goal = on ? 1 : 0
  }
  get showing() {
    return this.goal > 0
  }
  /** Moves the patch (world x, z). */
  at(x: number, z: number) {
    this.root.position.set(x, 0, z)
  }

  update(dt: number) {
    this.time += dt
    this.popped = 0
    this.on += ((this.goal ? 1 : 0) - this.on) * (1 - Math.exp(-dt * 4))
    const live = this.on > 0.02 || this.list.some((b) => b.t < b.len)
    this.root.visible = live
    if (!live) return
    let n = 0
    const rate = (6 + 18 * this.busy) * this.on * (0.5 + this.radius / 3)
    for (const b of this.list) {
      if (b.t >= b.len) {
        // A new one now and then, anywhere in the patch (more near the middle).
        if (this.goal && Math.random() < (rate * dt) / N * 4) {
          const a = Math.random() * Math.PI * 2
          const d = Math.sqrt(Math.random()) * this.radius
          b.x = Math.cos(a) * d
          b.z = Math.sin(a) * d
          b.t = 0
          b.len = 0.7 + Math.random() * 0.8
          b.r = (0.12 + Math.random() * 0.2) * (0.7 + 0.5 * this.busy)
        } else continue
      }
      b.t += dt
      if (b.t >= b.len) {
        this.popped++
        continue
      }
      // Up through the surface: a dome that swells, wobbles, and pops.
      const k = b.t / b.len
      const s = b.r * (0.4 + 0.8 * Math.min(1, k * 2.2)) * (k > 0.92 ? 1 + (k - 0.92) * 6 : 1)
      const y = -0.25 * (1 - Math.min(1, k * 3)) + s * 0.15
      const wob = 1 + Math.sin(this.time * 18 + b.x * 9) * 0.06
      m4.compose(v.set(b.x, y, b.z), q.identity(), sc.set(s * 2 * wob, s * 1.7, s * 2 / wob))
      this.balls.setMatrixAt(n, m4)
      m4.compose(v.set(b.x - s * 0.35, y + s * 0.45, b.z + s * 0.35), q, sc.setScalar(s * 0.42))
      this.shines.setMatrixAt(n, m4)
      n++
    }
    this.balls.count = this.shines.count = n
    this.balls.instanceMatrix.needsUpdate = this.shines.instanceMatrix.needsUpdate = true
    // The ring of churned water spreads and fades over and over; the pale disc and the shadow under it.
    const k = (this.time / 1.4) % 1
    const r = this.radius * (0.9 + 0.8 * k)
    this.ring.scale.set(r, r, 1)
    this.ringMat.opacity = 0.7 * (1 - k) * this.on
    this.shade.scale.setScalar(this.radius * 1.15)
    this.shadeMat.opacity = 0.55 * this.on
  }
}

// Something to steer toward, unmissable from far off: soft rings of ripples spreading on the water round it, and (for
// sleepy Ollie) big floating Zs rising over her. The world (watch.ts) moves it, switches it on and off, and lays the
// path of sparkles on the water toward it.
import { DoubleSide, Group, Mesh, MeshBasicMaterial, RingGeometry, Shape, ShapeGeometry, type Camera } from 'three'
import { smooth } from '../../../../../sdk'
import type { Bag } from '../../../../engine3d/dispose'

const RINGS = 3
const RING_S = 2.4
const ZS = 3
const Z_S = 2.6

/** A thick letter Z, about 1 m tall, centered. */
function zShape() {
  const p: [number, number][] = [[0, 1], [1, 1], [1, 0.76], [0.4, 0.24], [1, 0.24], [1, 0], [0, 0], [0, 0.24], [0.6, 0.76], [0, 0.76]]
  const s = new Shape()
  p.forEach(([x, y], i) => (i ? s.lineTo(x - 0.5, y - 0.5) : s.moveTo(x - 0.5, y - 0.5)))
  return s
}

export class Beacon {
  readonly root = new Group()
  private rings: { m: Mesh; mat: MeshBasicMaterial }[] = []
  private zs: { g: Group; mats: MeshBasicMaterial[] }[] = []
  private on = 0
  private t = 0

  constructor(
    bag: Bag,
    private o: { color: string; radius: number; zs?: boolean },
  ) {
    const ring = bag.add(new RingGeometry(0.86, 1, 48))
    for (let i = 0; i < RINGS; i++) {
      const mat = bag.add(new MeshBasicMaterial({ color: o.color, transparent: true, opacity: 0, depthWrite: false }))
      const m = new Mesh(ring, mat)
      m.rotation.x = -Math.PI / 2
      m.renderOrder = 2
      this.root.add(m)
      this.rings.push({ m, mat })
    }
    if (o.zs) {
      const geo = bag.add(new ShapeGeometry(zShape()))
      for (let i = 0; i < ZS; i++) {
        const g = new Group()
        // A plum shadow behind the white letter, so it reads on the sea and on the sky.
        const back = bag.add(new MeshBasicMaterial({ color: '#6B4C9A', transparent: true, opacity: 0, depthWrite: false, side: DoubleSide }))
        const front = bag.add(new MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0, depthWrite: false, side: DoubleSide }))
        const b = new Mesh(geo, back)
        b.position.set(0.09, -0.09, -0.02)
        const f = new Mesh(geo, front)
        b.renderOrder = f.renderOrder = 5
        g.add(b, f)
        this.root.add(g)
        this.zs.push({ g, mats: [back, front] })
      }
    }
    this.root.visible = false
  }

  /** Each frame: where it is, whether it's on (it fades), and the camera (the Zs face it). `size` scales the Zs. */
  update(dt: number, on: boolean, x: number, y: number, z: number, camera: Camera, size = 1) {
    this.on = Math.max(0, Math.min(1, this.on + (on ? dt / 0.4 : -dt / 0.4)))
    this.root.visible = this.on > 0.01
    if (!this.root.visible) return
    this.t += dt
    this.root.position.set(x, 0, z)
    this.rings.forEach(({ m, mat }, i) => {
      const k = (this.t / RING_S + i / RINGS) % 1
      const r = this.o.radius * (0.35 + 0.9 * k)
      m.scale.set(r, r, 1)
      // (A little over the water, so the swell's crests don't swallow it.)
      m.position.y = Math.max(0, y) + 0.4
      mat.opacity = 0.75 * smooth(Math.min(1, k * 4)) * (1 - k) * this.on
    })
    this.zs.forEach(({ g, mats }, i) => {
      const k = (this.t / Z_S + i / ZS) % 1
      const s = size * (0.55 + 0.7 * k)
      g.position.set(Math.sin(k * 5 + i) * 0.5 * size + 0.6 * size, y + size * (1.2 + 3.2 * k), 0)
      g.scale.setScalar(s)
      g.quaternion.copy(camera.quaternion)
      g.rotateZ(0.25)
      const a = smooth(Math.min(1, k * 5)) * (1 - smooth(Math.max(0, (k - 0.7) / 0.3))) * this.on
      mats[0].opacity = 0.8 * a
      mats[1].opacity = a
    })
  }
}

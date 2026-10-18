// Where she tapped: a hot-pink ring that grows and fades on the floor, with a few little stars hopping out of it.
import { Group, Mesh, MeshBasicMaterial, OctahedronGeometry, RingGeometry } from 'three'
import type { Bag } from './dispose'
import { PAL } from './toon'

const STARS = 5
const LIFE = 0.55

export class TapMarker {
  readonly root = new Group()
  private ring: Mesh
  private stars: Mesh[] = []
  private ringMat = new MeshBasicMaterial({ color: PAL.hotpink, transparent: true, depthWrite: false })
  private starMat = new MeshBasicMaterial({ color: PAL.gold, transparent: true, depthWrite: false })
  private t = LIFE

  constructor(bag: Bag) {
    bag.add(this.ringMat)
    bag.add(this.starMat)
    this.ring = new Mesh(bag.add(new RingGeometry(0.78, 1, 32)), this.ringMat)
    this.ring.rotation.x = -Math.PI / 2
    this.ring.renderOrder = 2
    this.root.add(this.ring)
    const star = bag.add(new OctahedronGeometry(0.05))
    for (let i = 0; i < STARS; i++) {
      const s = new Mesh(star, this.starMat)
      this.stars.push(s)
      this.root.add(s)
    }
    this.root.visible = false
  }

  show(x: number, y: number, z: number) {
    this.root.position.set(x, y + 0.02, z)
    this.root.visible = true
    this.t = 0
  }

  update(dt: number) {
    if (this.t >= LIFE) return
    this.t += dt
    const p = Math.min(1, this.t / LIFE)
    const r = 0.12 + 0.23 * Math.sqrt(p)
    this.ring.scale.set(r, r, r)
    this.ringMat.opacity = 1 - p
    this.starMat.opacity = 1 - p * p
    this.stars.forEach((s, i) => {
      const a = (i / STARS) * Math.PI * 2 + 0.4
      const d = 0.1 + 0.32 * p
      s.position.set(Math.cos(a) * d, 0.05 + Math.sin(Math.PI * p) * 0.28, Math.sin(a) * d)
      s.rotation.y = p * 6
    })
    if (p >= 1) this.root.visible = false
  }
}

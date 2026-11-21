// Pink suds that stick to whoever she rubs (Misty's fur, Maple's chin): one instanced mesh of round bubbles plus one
// instanced ink outline, two draw calls however many. Each bubble is stuck to a part of someone (its `parent`: a pivot
// of the rig, so it moves with her as she breathes, shakes and turns her head) at a point on the surface, and stands
// out of it along the surface's way out. Rubbing the same place piles them up on top of each other (a mohawk, horns,
// a beard: the shape she rubs is the shape they make); the rain pops them.
import { Color, DynamicDrawUsage, IcosahedronGeometry, InstancedMesh, Matrix4, Quaternion, Vector3, type Object3D, type Scene } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { hullGeometry, instancedOutlineMaterial } from '../../../../engine3d/outline'
import { toon } from '../../../../engine3d/toon'

const COLORS = ['#FFFFFF', '#FFE6F1', '#FFD3E7', '#FFF4F9'].map((c) => new Color(c))

interface Sud {
  parent: Object3D
  base: Vector3
  n: Vector3
  h: number
  size: number
  k: number
  goal: number
  c: number
  seed: number
}

const m = new Matrix4()
const q = new Quaternion()
const scl = new Vector3()
const w = new Vector3()

export class Suds {
  readonly mesh: InstancedMesh
  private hull: InstancedMesh
  readonly list: Sud[] = []
  private n = 0

  constructor(
    private max: number,
    scene: Scene,
    bag: Bag,
  ) {
    const geo = bag.add(new IcosahedronGeometry(1, 2))
    this.mesh = bag.add(new InstancedMesh(geo, toon('#ffffff'), max))
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage)
    this.mesh.frustumCulled = false
    this.mesh.raycast = () => {}
    for (let i = 0; i < max; i++) this.mesh.setColorAt(i, COLORS[i % COLORS.length])
    this.hull = bag.add(new InstancedMesh(bag.add(hullGeometry(geo)), instancedOutlineMaterial(1.6), max))
    this.hull.instanceMatrix = this.mesh.instanceMatrix
    this.hull.frustumCulled = false
    this.hull.raycast = () => {}
    this.mesh.count = this.hull.count = 0
    scene.add(this.mesh, this.hull)
  }

  /** A bubble on `parent` at `local` (a point on its surface, parent-local), standing out along `normal`. Where there
   *  are bubbles already it lands on top of them, so rubbing one place piles them up. Full: the oldest one goes. */
  add(parent: Object3D, local: Vector3, normal: Vector3, size: number) {
    if (this.list.length >= this.max) this.list.shift()
    let h = 0
    for (const s of this.list) if (s.parent === parent && s.goal > 0 && s.base.distanceTo(local) < size * 1.1) h = Math.max(h, s.h + s.size * 0.62)
    h = Math.min(h, size * 3.4)
    this.list.push({ parent, base: local.clone(), n: normal.clone().normalize(), h, size, k: 0, goal: 1, c: this.n++ % COLORS.length, seed: Math.random() * 6 })
  }
  /** How many there are (not popping). */
  get count() {
    return this.list.reduce((n, s) => n + (s.goal > 0 ? 1 : 0), 0)
  }
  /** How many on one parent. */
  countOn(parent: Object3D) {
    return this.list.reduce((n, s) => n + (s.goal > 0 && s.parent === parent ? 1 : 0), 0)
  }
  /** Pops the ones `hit` picks (it gets each one's world position); returns how many went. */
  pop(hit: (world: Vector3) => boolean): number {
    let n = 0
    for (const s of this.list) {
      if (s.goal === 0) continue
      if (hit(this.world(s, w))) {
        s.goal = 0
        n++
      }
    }
    return n
  }
  /** Everything comes off (on one parent, or all): their world positions, for the bubbles that fly off. */
  clear(parent?: Object3D): Vector3[] {
    const out: Vector3[] = []
    for (const s of this.list) {
      if (s.goal === 0 || (parent && s.parent !== parent)) continue
      out.push(this.world(s, new Vector3()))
      s.goal = 0
      s.k = Math.min(s.k, 0.3)
    }
    return out
  }
  /** Where one is in the world now. */
  world(s: Sud, out: Vector3) {
    return s.parent.localToWorld(out.copy(s.base).addScaledVector(s.n, s.h + s.size * 0.2))
  }

  update(dt: number, t: number) {
    for (const s of this.list) s.k += (s.goal - s.k) * (1 - Math.exp(-dt * (s.goal ? 16 : 11)))
    for (let i = this.list.length - 1; i >= 0; i--) if (this.list[i].goal === 0 && this.list[i].k < 0.04) this.list.splice(i, 1)
    let i = 0
    for (const s of this.list) {
      if (!s.parent.visible) continue
      // Pop in with a little overshoot, then a soft wobble, like foam.
      const pop = s.goal ? 1 + 0.25 * Math.max(0, 1 - s.k) * Math.sin(s.k * 9) : 1
      const r = s.size * s.k * pop * (1 + Math.sin(t * 4 + s.seed) * 0.05)
      this.world(s, w)
      // (The parent's scale shrinks a whole bubble with it: Maple's beard on her small head.)
      const k = s.parent.getWorldScale(scl).x
      m.compose(w, q, scl.set(r * k, r * k, r * k))
      this.mesh.setMatrixAt(i, m)
      this.mesh.setColorAt(i, COLORS[s.c])
      i++
    }
    this.mesh.count = this.hull.count = i
    this.mesh.instanceMatrix.needsUpdate = true
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true
  }
}

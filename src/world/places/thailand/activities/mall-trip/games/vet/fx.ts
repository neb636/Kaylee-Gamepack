// The vet's little effects, each one instanced mesh (one draw call however many):
//   - Floaters fly free and fade: hearts rising off the stethoscope, bubbles, water drops, fluff, sparkles.
//   - Blobs stick to a patient (on the body, the head or the paw, so they move with it): suds where she rubs the
//     soap, the pony's mud, the cream on the puppy's paw. They pop in, and shrink away when washed off.
import { DynamicDrawUsage, IcosahedronGeometry, InstancedMesh, Matrix4, Quaternion, Vector3, type BufferGeometry, type ColorRepresentation, type Object3D } from 'three'
import type { Bag } from '../../../../../../engine3d/dispose'
import { Floaters as EngineFloaters } from '../../../../../../engine3d/floaters'
import { merge, P } from '../../../../../../engine3d/geo'
import { toon } from '../../../../../../engine3d/toon'

const m = new Matrix4()
const q = new Quaternion()
const scl = new Vector3()
const tmp = new Vector3()

/** A puffy heart (facing the camera), about 1 unit across. */
export function heartGeometry(): BufferGeometry {
  return merge([P.sphere(0.3, '#fff', { at: [-0.22, 0.12, 0] }, 12), P.sphere(0.3, '#fff', { at: [0.22, 0.12, 0] }, 12), P.cone(0.48, 0.6, '#fff', { at: [0, -0.28, 0], rot: [0, 0, Math.PI], scale: [1, 1, 0.62] }, 12)])
}

/** The engine's Floaters (engine3d/floaters.ts) as this game uses them: falling ones vanish on the table, and they
 *  only wobble (no spin). */
export class Floaters extends EngineFloaters {
  constructor(geo: BufferGeometry, colors: ColorRepresentation[], count: number, bag: Bag, gravity = 0, drag = 1.5) {
    super(geo, colors, count, bag, gravity, drag, { floor: 0.02, roll: false })
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

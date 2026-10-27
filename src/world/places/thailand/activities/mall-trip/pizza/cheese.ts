// The stretchy cheese between a slice and the pan: two strands, each a tube rebuilt every frame from a dozen rings. The
// longer it gets the thinner its middle (the ends stay thick where they hold on), the more it sags, and it wobbles
// sideways when her finger swings. Past its length it snaps: boing, each half springs back to the end it was holding
// (the pan's half into the pan, the slice's half curls up under the slice). One mesh and one outline per tube, so it is
// a thing in the toon world rather than a line drawn over it (flat lit and outlined in gold, so it stays cheese-yellow).
import { BufferAttribute, BufferGeometry, Group, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { outlineMaterial } from '../../../../../engine3d/outline'

const RINGS = 14
const SIDES = 8
export const CHEESE = '#FFD95A'
const CHEESE_LINE = '#EDB443'

/** One strand: a closed tube along a list of points, with a radius at each (the first and last are 0, so it's capped). */
class Tube {
  readonly mesh: Mesh
  readonly hull: Mesh
  private pos: Float32Array
  private geo: BufferGeometry

  constructor(bag: Bag, parent: Group) {
    this.pos = new Float32Array(RINGS * SIDES * 3)
    const geo = bag.add(new BufferGeometry())
    geo.setAttribute('position', new BufferAttribute(this.pos, 3))
    const idx: number[] = []
    for (let i = 0; i < RINGS - 1; i++)
      for (let j = 0; j < SIDES; j++) {
        const a = i * SIDES + j
        const b = i * SIDES + ((j + 1) % SIDES)
        const c = a + SIDES
        const d = b + SIDES
        idx.push(a, b, c, b, d, c)
      }
    geo.setIndex(idx)
    this.geo = geo
    // Flat lit: the toon's lavender shadow band turns thin yellow strands brown.
    this.mesh = new Mesh(geo, bag.add(new MeshBasicMaterial({ color: CHEESE })))
    // A golden outline (not ink): a thin strand lined in ink reads as a cable, not cheese.
    this.hull = new Mesh(geo, outlineMaterial(0.8, CHEESE_LINE))
    this.mesh.frustumCulled = this.hull.frustumCulled = false
    parent.add(this.mesh, this.hull)
    this.show(false)
  }

  show(on: boolean) {
    this.mesh.visible = this.hull.visible = on
  }

  set(points: Vector3[], radii: number[]) {
    const t = new Vector3()
    const n = new Vector3()
    const b = new Vector3()
    const up = new Vector3()
    for (let i = 0; i < RINGS; i++) {
      t.subVectors(points[Math.min(RINGS - 1, i + 1)], points[Math.max(0, i - 1)]).normalize()
      up.set(0, 0, 1)
      if (Math.abs(t.z) > 0.9) up.set(0, 1, 0)
      n.crossVectors(t, up).normalize()
      b.crossVectors(t, n).normalize()
      for (let j = 0; j < SIDES; j++) {
        const a = (j / SIDES) * Math.PI * 2
        const r = radii[i]
        const k = (i * SIDES + j) * 3
        this.pos[k] = points[i].x + (Math.cos(a) * n.x + Math.sin(a) * b.x) * r
        this.pos[k + 1] = points[i].y + (Math.cos(a) * n.y + Math.sin(a) * b.y) * r
        this.pos[k + 2] = points[i].z + (Math.cos(a) * n.z + Math.sin(a) * b.z) * r
      }
    }
    this.geo.attributes.position.needsUpdate = true
    this.geo.computeVertexNormals()
    this.geo.computeBoundingSphere()
  }
}

/** Where a strand starts and ends (both move: the slice in her hand, Daddy's hand in the tug). */
export interface Ends {
  a: Vector3
  b: Vector3
}

const pts = Array.from({ length: RINGS }, () => new Vector3())
const radii = new Array<number>(RINGS).fill(0)
const side = new Vector3()

/** The cheese between a slice (`b`) and what it's pulled from (`a`): stretch, wobble, snap. */
export class CheeseBand {
  readonly root = new Group()
  private tubes: Tube[]
  /** 'on': stretching between the ends; 'snap': the two halves springing back; 'off': nothing. */
  state: 'off' | 'on' | 'snap' = 'off'
  /** The length when it snapped, and how far into the spring back (0..1). */
  private snapLen = 0
  private snapT = 0
  /** Sideways wobble: a spring kicked by the slice's sideways speed. */
  private wob = { x: 0, v: 0 }
  private lastB = new Vector3()
  private lastV = 0
  private ends: Ends = { a: new Vector3(), b: new Vector3() }
  /** The second strand is a little to the side of the first (the slice's edge). */
  private off = new Vector3()

  constructor(bag: Bag) {
    this.tubes = Array.from({ length: 4 }, () => new Tube(bag, this.root))
  }

  /** It starts stretching between a and b (`off`: where the second strand is, relative to the first). */
  start(a: Vector3, b: Vector3, off: Vector3) {
    this.state = 'on'
    this.ends.a.copy(a)
    this.ends.b.copy(b)
    this.lastB.copy(b)
    this.off.copy(off)
    this.wob = { x: 0, v: 0 }
    this.lastV = 0
  }
  /** Nothing showing (it springs back to nothing after a snap). */
  get gone() {
    return this.state === 'off'
  }
  /** How long it is now (meters). */
  get length() {
    return this.ends.a.distanceTo(this.ends.b)
  }
  /** Snaps now (boing is the caller's). */
  snap() {
    if (this.state !== 'on') return
    this.snapLen = this.length
    this.state = 'snap'
    this.snapT = 0
  }

  /** Moves the ends (call every frame while it's on or springing back), `right`: the camera's right, for the wobble. */
  update(dt: number, t: number, a: Vector3, b: Vector3, right: Vector3) {
    if (this.state === 'off') {
      for (const tb of this.tubes) tb.show(false)
      return
    }
    this.ends.a.copy(a)
    this.ends.b.copy(b)
    // The middle lags behind when the slice swings sideways (a kick from its change of speed), then rings down.
    const vx = dt > 0 ? side.subVectors(b, this.lastB).dot(right) / dt : 0
    this.lastB.copy(b)
    this.wob.v -= (vx - this.lastV) * 0.5
    this.lastV = vx
    this.wob.v += (-this.wob.x * 120 - this.wob.v * 6) * dt
    this.wob.x = Math.max(-0.12, Math.min(0.12, this.wob.x + this.wob.v * dt))
    if (this.state === 'on') {
      const L = this.length
      // Thin in the middle the longer it gets (never thinner than a string), sagging more when long and thin.
      const mid = Math.max(0.024, 0.05 * Math.min(1, Math.sqrt(0.09 / Math.max(L, 0.01))))
      const sag = Math.min(0.16, 0.12 * L)
      this.strand(0, a, b, 0.036, mid, sag, right, 1, t)
      this.strand(1, side.copy(a).add(this.off), b.clone().add(this.off.clone().multiplyScalar(0.6)), 0.026, mid * 0.7, sag * 1.25, right, -0.7, t + 1.3)
      this.tubes[2].show(false)
      this.tubes[3].show(false)
      return
    }
    // Snapped: each half springs back toward its own end, wiggling, and is gone.
    this.snapT = Math.min(1, this.snapT + dt / 0.42)
    const k = this.snapT
    if (k >= 1) {
      this.state = 'off'
      for (const tb of this.tubes) tb.show(false)
      return
    }
    const half = (this.snapLen / 2) * (1 - k) ** 2
    const dir = side.subVectors(b, a).normalize()
    const curl = Math.sin(k * Math.PI * 5) * 0.05 * (1 - k)
    // The pan's half points up out of the pan, the slice's half hangs down from the slice.
    const aTip = a.clone().addScaledVector(dir, half * 0.6).add(new Vector3(curl, half * 0.4, 0))
    const bTip = b.clone().add(new Vector3(-curl, -half, 0))
    this.strand(0, a, aTip, 0.034, 0.016, 0, right, 0, t)
    this.strand(2, b, bTip, 0.034, 0.016, 0, right, 0, t)
    this.strand(1, a.clone().add(this.off), aTip.clone().add(this.off), 0.024, 0.012, 0, right, 0, t)
    this.strand(3, b.clone().add(this.off), bTip.clone().addScaledVector(this.off, 0.6), 0.024, 0.012, 0, right, 0, t)
  }

  private strand(i: number, a: Vector3, b: Vector3, rEnd: number, rMid: number, sag: number, right: Vector3, wobK: number, t: number) {
    for (let k = 0; k < RINGS; k++) {
      const s = k / (RINGS - 1)
      const arch = 4 * s * (1 - s)
      pts[k].lerpVectors(a, b, s)
      pts[k].y -= sag * arch
      pts[k].addScaledVector(right, (this.wob.x + Math.sin(t * 9 + s * 3) * 0.004) * Math.sin(Math.PI * s) * wobK)
      // Thick where it holds on, thin in the middle; the very ends close the tube.
      const prof = Math.pow(Math.sin(Math.PI * s), 0.5)
      radii[k] = k === 0 || k === RINGS - 1 ? 0 : rEnd + (rMid - rEnd) * prof
    }
    this.tubes[i].set(pts, radii)
    this.tubes[i].show(true)
  }
}

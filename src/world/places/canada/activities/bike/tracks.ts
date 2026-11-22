// The bike's line on the ground (after Bottomless, where every turn leaves a trench in the snow): a thin groove the back
// wheel presses into the dirt and the leaves, there all the way down the mountain, so she sees the swoops she made. A
// ribbon of quads along the wheel's path, the oldest dropping off the end; a hop leaves a gap.
import { BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial } from 'three'
import type { Bag } from '../../../../engine3d/dispose'

/** A new point every this far (m). */
const STEP = 0.3

export class TireLine {
  readonly mesh: Mesh
  private geo = new BufferGeometry()
  private pos: Float32Array
  /** Point i starts a new piece (after a hop): no quad joins it to the one before. */
  private start: Uint8Array
  private n = 0
  private broken = true
  private lastX = 0
  private lastZ = 0

  constructor(bag: Bag, private max = 1600, private width = 0.2, color = '#5A3920') {
    this.pos = new Float32Array(max * 2 * 3)
    this.start = new Uint8Array(max)
    this.geo.setAttribute('position', new BufferAttribute(this.pos, 3))
    this.geo.setIndex(new BufferAttribute(new Uint32Array((max - 1) * 6), 1))
    this.geo.setDrawRange(0, 0)
    const mat = new MeshBasicMaterial({ color, transparent: true, opacity: 0.62, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })
    this.mesh = new Mesh(this.geo, mat)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = 1
    bag.add(this.geo)
    bag.add(mat)
  }

  /** Off the ground (a hop, the creek): the next point starts a new piece. */
  lift() {
    this.broken = true
  }

  /** The back wheel is at x, y, z, heading `h` (0 = +z). */
  add(x: number, y: number, z: number, h: number) {
    if (!this.broken && Math.hypot(x - this.lastX, z - this.lastZ) < STEP) return
    if (this.n === this.max) {
      // Full: drop the oldest point.
      this.pos.copyWithin(0, 6)
      this.start.copyWithin(0, 1)
      this.n--
      this.start[0] = 1
    }
    const i = this.n++
    const ox = Math.cos(h) * this.width * 0.5
    const oz = -Math.sin(h) * this.width * 0.5
    this.pos.set([x - ox, y, z - oz, x + ox, y, z + oz], i * 6)
    this.start[i] = this.broken ? 1 : 0
    this.broken = false
    this.lastX = x
    this.lastZ = z
    this.rebuild()
  }

  private rebuild() {
    const idx = this.geo.index!
    const a = idx.array as Uint32Array
    let q = 0
    for (let i = 1; i < this.n; i++) {
      if (this.start[i]) continue
      const p = (i - 1) * 2
      a.set([p, p + 1, p + 2, p + 1, p + 3, p + 2], q)
      q += 6
    }
    idx.needsUpdate = true
    ;(this.geo.getAttribute('position') as BufferAttribute).needsUpdate = true
    this.geo.setDrawRange(0, q)
  }
}

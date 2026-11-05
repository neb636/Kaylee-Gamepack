// A ribbon of light: the trail a glowing poi (or a ball of fire) leaves in the dark, hanging there a moment and fading.
// One mesh per ribbon, rebuilt every frame from the last points it passed through: three vertices across (a bright
// core between two dim edges, so it reads as a glow), additive so the dark parts vanish, wider where it's newest.
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, DoubleSide, DynamicDrawUsage, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'

const tA = new Vector3()
const tB = new Vector3()
const side = new Vector3()

export class Ribbon {
  readonly mesh: Mesh
  /** How long a point hangs there (s); change it any time (the fire dancers' flare). */
  life: number
  /** Width at the newest point (m). */
  width: number
  private pts: { p: Vector3; t: number }[] = []
  private pos: Float32Array
  private col: Float32Array
  private geo: BufferGeometry
  private head: Color
  private tail: Color
  private n: number

  /** `n`: how many points it remembers; `head` and `tail`: the newest and the oldest color. */
  constructor(bag: Bag, opts: { n?: number; life?: number; width?: number; head: string; tail: string }) {
    this.n = opts.n ?? 90
    this.life = opts.life ?? 1.2
    this.width = opts.width ?? 0.14
    this.head = new Color(opts.head)
    this.tail = new Color(opts.tail)
    const geo = (this.geo = bag.add(new BufferGeometry()))
    this.pos = new Float32Array(this.n * 3 * 3)
    this.col = new Float32Array(this.n * 3 * 3)
    const pa = new BufferAttribute(this.pos, 3).setUsage(DynamicDrawUsage)
    const ca = new BufferAttribute(this.col, 3).setUsage(DynamicDrawUsage)
    geo.setAttribute('position', pa)
    geo.setAttribute('color', ca)
    const idx: number[] = []
    for (let i = 0; i < this.n - 1; i++) {
      const a = i * 3
      const b = a + 3
      // Edge-core-edge strips: two quads per segment.
      idx.push(a, b, a + 1, a + 1, b, b + 1, a + 1, b + 1, a + 2, a + 2, b + 1, b + 2)
    }
    geo.setIndex(idx)
    const mat = bag.add(new MeshBasicMaterial({ vertexColors: true, transparent: true, blending: AdditiveBlending, depthWrite: false, side: DoubleSide, fog: false }))
    this.mesh = new Mesh(geo, mat)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = 6
  }

  /** The poi passed through `p` at time `t` (skipped when it hasn't moved). */
  push(p: Vector3, t: number, minStep = 0.025) {
    const last = this.pts[this.pts.length - 1]
    if (last && last.p.distanceToSquared(p) < minStep * minStep) {
      last.t = t
      return
    }
    const reuse = this.pts.length >= this.n ? this.pts.shift()! : { p: new Vector3(), t }
    reuse.p.copy(p)
    reuse.t = t
    this.pts.push(reuse)
  }
  clear() {
    this.pts.length = 0
  }
  /** The points still glowing (oldest first). */
  get points(): readonly { p: Vector3; t: number }[] {
    return this.pts
  }

  /** Rebuilds the strip: `normal` faces the camera (the ribbon lies flat to it); `k` dims the whole thing. */
  update(t: number, normal: Vector3, k = 1) {
    while (this.pts.length && t - this.pts[0].t > this.life) this.pts.shift()
    const P = this.pos
    const C = this.col
    const m = this.pts.length
    for (let i = 0; i < this.n; i++) {
      const o = i * 9
      if (i >= m) {
        // Unused: collapsed onto the newest point, black (invisible when added).
        const q = m ? this.pts[m - 1].p : tA.set(0, -999, 0)
        for (let j = 0; j < 3; j++) {
          P[o + j * 3] = q.x
          P[o + j * 3 + 1] = q.y
          P[o + j * 3 + 2] = q.z
          C[o + j * 3] = C[o + j * 3 + 1] = C[o + j * 3 + 2] = 0
        }
        continue
      }
      const cur = this.pts[i].p
      const prev = this.pts[Math.max(0, i - 1)].p
      const next = this.pts[Math.min(m - 1, i + 1)].p
      tB.subVectors(next, prev)
      if (tB.lengthSq() < 1e-8) tB.set(1, 0, 0)
      side.crossVectors(tB, normal).normalize()
      const age = Math.min(1, (t - this.pts[i].t) / this.life)
      const fade = (1 - age) * (1 - age)
      const w = this.width * (0.35 + 0.65 * (1 - age))
      const r = this.tail.r + (this.head.r - this.tail.r) * (1 - age)
      const g = this.tail.g + (this.head.g - this.tail.g) * (1 - age)
      const b = this.tail.b + (this.head.b - this.tail.b) * (1 - age)
      const f = fade * k
      for (let j = 0; j < 3; j++) {
        const s = (j - 1) * w
        P[o + j * 3] = cur.x + side.x * s
        P[o + j * 3 + 1] = cur.y + side.y * s
        P[o + j * 3 + 2] = cur.z + side.z * s
        // The core is bright and a touch whiter; the edges a soft glow.
        const e = j === 1 ? 0.62 : 0.14
        const wh = j === 1 ? 0.15 * fade : 0
        C[o + j * 3] = (r + (1 - r) * wh) * f * e
        C[o + j * 3 + 1] = (g + (1 - g) * wh) * f * e
        C[o + j * 3 + 2] = (b + (1 - b) * wh) * f * e
      }
    }
    ;(this.geo.attributes.position as BufferAttribute).needsUpdate = true
    ;(this.geo.attributes.color as BufferAttribute).needsUpdate = true
  }
}

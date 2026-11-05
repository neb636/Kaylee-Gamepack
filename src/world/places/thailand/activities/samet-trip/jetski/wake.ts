// The wake: a white line the jet ski leaves on the water behind it, widening and fading over ~20 s, so she sees where
// she's been. And the plan's secret: drive a loop and close it, and the wake circle sparkles and fills with jumping
// fish. A loop is found when the newest stretch of wake crosses an older one; the points between are the loop.
import { BufferAttribute, BufferGeometry, DynamicDrawUsage, Mesh, ShaderMaterial } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'

export interface WakePoint {
  x: number
  z: number
  t: number
  /** How fast it was going (a slow crawl leaves a thin, faint line). */
  k: number
}

export interface Loop {
  pts: { x: number; z: number }[]
  area: number
  cx: number
  cz: number
  /** Roughly heart-shaped (one dent at the top, a point at the bottom). */
  heart: boolean
}

const MAX = 420

export class Wake {
  readonly mesh: Mesh
  readonly pts: WakePoint[] = []
  private geo: BufferGeometry
  private pos: Float32Array
  private alpha: Float32Array
  /** Index of the first point the next loop may close on (a loop's points are used up once it fills). */
  private from = 0

  constructor(
    bag: Bag,
    /** Seconds the line stays on the water. */
    public life = 20,
  ) {
    this.geo = bag.add(new BufferGeometry())
    this.pos = new Float32Array(MAX * 2 * 3)
    this.alpha = new Float32Array(MAX * 2)
    this.geo.setAttribute('position', new BufferAttribute(this.pos, 3).setUsage(DynamicDrawUsage))
    this.geo.setAttribute('alpha', new BufferAttribute(this.alpha, 1).setUsage(DynamicDrawUsage))
    const idx: number[] = []
    for (let i = 0; i < MAX - 1; i++) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2)
    this.geo.setIndex(idx)
    const mat = bag.add(
      new ShaderMaterial({
        vertexShader: /* glsl */ `
          attribute float alpha;
          varying float vA;
          void main() { vA = alpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: /* glsl */ `
          varying float vA;
          void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, vA); }`,
        transparent: true,
        depthWrite: false,
        // (Drawn over the water even where its grid rounds a crest off a little.)
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      }),
    )
    this.mesh = new Mesh(this.geo, mat)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = 2
  }

  /** A new point behind the jet ski (every ~0.7 m it travels). Returns a loop it just closed, if any. */
  add(x: number, z: number, t: number, k: number): Loop | null {
    const last = this.pts[this.pts.length - 1]
    if (last && Math.hypot(x - last.x, z - last.z) < 0.7) return null
    this.pts.push({ x, z, t, k })
    if (this.pts.length > MAX) {
      this.pts.shift()
      this.from = Math.max(0, this.from - 1)
    }
    return this.findLoop()
  }

  /** Forget the line (a reset). */
  clear() {
    this.pts.length = 0
    this.from = 0
  }

  private findLoop(): Loop | null {
    const p = this.pts
    const n = p.length
    if (n < 14) return null
    const a = p[n - 2]
    const b = p[n - 1]
    // Against every older segment (not the last few, which always touch).
    for (let i = Math.max(this.from, 0); i < n - 10; i++) {
      const c = p[i]
      const d = p[i + 1]
      if (!cross(a.x, a.z, b.x, b.z, c.x, c.z, d.x, d.z)) continue
      const pts = p.slice(i + 1, n - 1).map(({ x, z }) => ({ x, z }))
      let area = 0
      let cx = 0
      let cz = 0
      for (let k = 0; k < pts.length; k++) {
        const u = pts[k]
        const v = pts[(k + 1) % pts.length]
        const f = u.x * v.z - v.x * u.z
        area += f
        cx += (u.x + v.x) * f
        cz += (u.z + v.z) * f
      }
      area /= 2
      if (Math.abs(area) < 1e-3) return null
      cx /= 6 * area
      cz /= 6 * area
      this.from = n - 1
      return { pts, area: Math.abs(area), cx, cz, heart: heartish(pts, cx, cz) }
    }
    return null
  }

  /** Lays the line on the water (each point at the water's height now) and fades the old end. */
  update(t: number, heading: number, height: (x: number, z: number) => number) {
    const p = this.pts
    while (p.length && t - p[0].t > this.life) p.shift()
    const n = Math.min(p.length, MAX)
    for (let i = 0; i < n; i++) {
      const q = p[i]
      const prev = p[Math.max(0, i - 1)]
      const next = p[Math.min(n - 1, i + 1)]
      let dx = next.x - prev.x
      let dz = next.z - prev.z
      if (n === 1) {
        dx = Math.sin(heading)
        dz = Math.cos(heading)
      }
      const l = Math.hypot(dx, dz) || 1
      const age = (t - q.t) / this.life
      // Narrow behind the jet ski, spreading wider as it ages.
      const w = (0.35 + age * 1.6) * (0.5 + 0.5 * q.k)
      const nx = (-dz / l) * w
      const nz = (dx / l) * w
      const y = height(q.x, q.z) + 0.12
      this.pos.set([q.x + nx, y, q.z + nz, q.x - nx, y, q.z - nz], i * 6)
      const fadeIn = Math.min(1, (n - 1 - i) / 3)
      const a = 0.78 * (1 - age) ** 1.4 * fadeIn * (0.35 + 0.65 * q.k)
      this.alpha[i * 2] = this.alpha[i * 2 + 1] = a
    }
    this.geo.setDrawRange(0, Math.max(0, n - 1) * 6)
    ;(this.geo.attributes.position as BufferAttribute).needsUpdate = true
    ;(this.geo.attributes.alpha as BufferAttribute).needsUpdate = true
  }
}

function cross(ax: number, az: number, bx: number, bz: number, cx: number, cz: number, dx: number, dz: number) {
  const d1 = (dx - cx) * (az - cz) - (dz - cz) * (ax - cx)
  const d2 = (dx - cx) * (bz - cz) - (dz - cz) * (bx - cx)
  const d3 = (bx - ax) * (cz - az) - (bz - az) * (cx - ax)
  const d4 = (bx - ax) * (dz - az) - (bz - az) * (dx - ax)
  return d1 * d2 < 0 && d3 * d4 < 0
}

/** A heart, roughly: going round the loop, its distance from the middle has exactly one deep dent (the top) and the
 *  far point opposite the dent (the bottom tip) is the farthest of all. Generous on purpose: a five-year-old's heart. */
function heartish(pts: { x: number; z: number }[], cx: number, cz: number) {
  const n = pts.length
  if (n < 16) return false
  const r = pts.map((p) => Math.hypot(p.x - cx, p.z - cz))
  const mean = r.reduce((a, b) => a + b, 0) / n
  // Smooth the radii a little.
  const s = r.map((_, i) => (r[(i - 1 + n) % n] + r[i] * 2 + r[(i + 1) % n]) / 4)
  let dents = 0
  let dentAt = -1
  for (let i = 0; i < n; i++) {
    const lo = Math.min(...Array.from({ length: 7 }, (_, k) => s[(i + k - 3 + n) % n]))
    if (s[i] === lo && s[i] < mean * 0.62) {
      dents++
      dentAt = i
    }
  }
  if (dents !== 1) return false
  const tip = s.indexOf(Math.max(...s))
  const apart = Math.abs(((tip - dentAt + n) % n) - n / 2)
  return apart < n * 0.18
}

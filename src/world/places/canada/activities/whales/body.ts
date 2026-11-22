// The modelling kit for Whale Peek-a-Boo's whales (whale.ts): smooth toy bodies swept along a spine instead of
// stretched spheres, so a whale has a real shape (a grey whale's narrow arched head, a humpback's broad flat one, an
// orca's round snout) and everything that goes on it sits on its skin: `Hull.at()` gives the point (and the way out)
// at any spot of the body, so eyes, blowholes, barnacles, fins and the smile are placed on the surface, not guessed.
//
// Colors are painted a triangle at a time (an orca's eye patch, a humpback's white throat): crisp toon edges, not the
// blur a color gets when it is shared by corners. The shading stays smooth (normals from the welded shape).
//
// Body frame: +z is the head (the snout at z0 + len), +y up, +x the whale's left. `s` runs 0 (the tail stock) to 1
// (the snout); `a` goes round a section from the top (0) toward +x (π/2), the belly at ±π.
import { BufferAttribute, BufferGeometry, Color, Vector3 } from 'three'

/** A section of the body at `s` (0 tail stock .. 1 snout): half its width and height, and how high its middle is. */
export interface Sec {
  s: number
  w: number
  h: number
  y: number
}

const smooth = (k: number) => k * k * (3 - 2 * k)

/** Catmull-Rom through the stations' values (smooth, passes through each). */
function curve(secs: Sec[], s: number, key: 'w' | 'h' | 'y') {
  const n = secs.length
  if (s <= secs[0].s) return secs[0][key]
  if (s >= secs[n - 1].s) return secs[n - 1][key]
  let i = 0
  while (i < n - 2 && secs[i + 1].s < s) i++
  const p0 = secs[Math.max(0, i - 1)]
  const p1 = secs[i]
  const p2 = secs[i + 1]
  const p3 = secs[Math.min(n - 1, i + 2)]
  const t = (s - p1.s) / (p2.s - p1.s)
  const m1 = ((p2[key] - p0[key]) / Math.max(1e-6, p2.s - p0.s)) * (p2.s - p1.s)
  const m2 = ((p3[key] - p1[key]) / Math.max(1e-6, p3.s - p1.s)) * (p2.s - p1.s)
  const t2 = t * t
  const t3 = t2 * t
  return (2 * t3 - 3 * t2 + 1) * p1[key] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2[key] + (t3 - t2) * m2
}

export interface HullOpts {
  /** Length from the tail stock to the snout (m), and where the tail stock is (z). */
  len: number
  z0: number
  secs: Sec[]
  /** How much of the length rounds off at each end (a share of `len`). */
  nose?: number
  tail?: number
  /** How square the belly is (2: round; higher: flatter underneath). */
  belly?: number
}

/** A swept body: sample its skin anywhere, and build it as one painted shape. */
export class Hull {
  constructor(readonly o: HullOpts) {}

  /** The section at `s`, with the ends rounded off. */
  sec(s: number) {
    const { secs, nose = 0.08, tail = 0.03 } = this.o
    let k = 1
    if (s > 1 - nose) k = Math.sqrt(Math.max(0, 1 - ((s - (1 - nose)) / nose) ** 2))
    if (s < tail) k = Math.sqrt(Math.max(0, 1 - ((tail - s) / tail) ** 2)) * 0.6 + 0.4
    return { w: curve(secs, s, 'w') * k, h: curve(secs, s, 'h') * k, y: curve(secs, s, 'y') }
  }

  /** The point on the skin at (s, a), pushed `push` meters further out along the way out (a fin's root, a badge). */
  at(s: number, a: number, push = 0, out = new Vector3()) {
    const c = this.sec(s)
    const z = this.o.z0 + s * this.o.len
    const ca = Math.cos(a)
    const sa = Math.sin(a)
    const nb = ca < 0 ? (this.o.belly ?? 2) : 2
    const py = Math.sign(ca) * Math.abs(ca) ** (2 / nb)
    out.set(c.w * sa, c.y + c.h * py, z)
    if (push) out.addScaledVector(this.normal(s, a, tmpN), push)
    return out
  }

  /** The way out of the skin at (s, a) (unit). */
  normal(s: number, a: number, out = new Vector3()) {
    const e = 0.004
    const p = this.at(s, a, 0, tmpA)
    const ds = this.at(Math.min(1, s + e), a, 0, tmpB).sub(this.at(Math.max(0, s - e), a, 0, tmpC))
    const da = this.at(s, a + e, 0, tmpB2).sub(this.at(s, a - e, 0, tmpC2))
    out.crossVectors(da, ds).normalize()
    // (Pointing away from the middle of the section.)
    const c = this.sec(s)
    if (out.x * p.x + out.y * (p.y - c.y) < 0) out.negate()
    return out
  }

  /** The body as one shape, each triangle painted by `paint(s, a, middle)` (a color). */
  geometry(paint: (s: number, a: number, p: Vector3) => string, rings = 56, around = 32): BufferGeometry {
    const pos: number[] = []
    const sAt: number[] = []
    const aAt: number[] = []
    for (let i = 0; i <= rings; i++) {
      const s = 0.5 - 0.5 * Math.cos((i / rings) * Math.PI)
      for (let j = 0; j < around; j++) {
        const a = (j / around) * Math.PI * 2
        const p = this.at(s, a, 0, tmpA)
        pos.push(p.x, p.y, p.z)
        sAt.push(s)
        aAt.push(a)
      }
    }
    const idx: number[] = []
    for (let i = 0; i < rings; i++)
      for (let j = 0; j < around; j++) {
        const a = i * around + j
        const b = i * around + ((j + 1) % around)
        const c = (i + 1) * around + ((j + 1) % around)
        const d = (i + 1) * around + j
        idx.push(a, c, b, a, d, c)
      }
    // End caps (a fan from each end's middle), so a slim tail stock or snout is closed.
    const capAt = (i: number, flip: boolean) => {
      const s = sAt[i * around]
      const c = this.sec(s)
      const mid = pos.length / 3
      pos.push(0, c.y, this.o.z0 + s * this.o.len)
      sAt.push(s)
      aAt.push(Math.PI)
      for (let j = 0; j < around; j++) {
        const a = i * around + j
        const b = i * around + ((j + 1) % around)
        if (flip) idx.push(mid, a, b)
        else idx.push(mid, b, a)
      }
    }
    capAt(0, true)
    capAt(rings, false)
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
    g.setIndex(idx)
    g.computeVertexNormals()
    return paintFaces(g, (tri) => {
      const sa = (sAt[tri[0]] + sAt[tri[1]] + sAt[tri[2]]) / 3
      // (The angle round the section, from the triangle's middle.)
      const p = mid3(g, tri)
      const c = this.sec(Math.min(1, Math.max(0, sa)))
      const a = Math.atan2(p.x / Math.max(1e-4, c.w), (p.y - c.y) / Math.max(1e-4, c.h))
      return paint(sa, a, p)
    })
  }
}

/**
 * A patch of color on the skin (an orca's eye patch, a white throat, a grey whale's pale blotch): the skin between s0
 * and s1, from a = lo(s) round to a = hi(s) (hi may pass π to wrap under the belly), standing `push` meters proud of
 * it so it never flickers. Its edges follow the curves exactly, so the patch is crisp and smooth (one color).
 */
export function skinPatch(hull: Hull, s0: number, s1: number, lo: (s: number) => number, hi: (s: number) => number, color: string, push = 0.01, rows = 20, cols = 10): BufferGeometry {
  const pos: number[] = []
  for (let i = 0; i <= rows; i++) {
    const s = s0 + (s1 - s0) * (0.5 - 0.5 * Math.cos((i / rows) * Math.PI))
    const a0 = lo(s)
    const a1 = Math.max(a0, hi(s))
    for (let j = 0; j <= cols; j++) {
      const p = hull.at(s, a0 + ((a1 - a0) * j) / cols, push, tmpA)
      pos.push(p.x, p.y, p.z)
    }
  }
  const idx: number[] = []
  const w = cols + 1
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++) {
      const a = i * w + j
      const b = i * w + j + 1
      const c = (i + 1) * w + j + 1
      const d = (i + 1) * w + j
      idx.push(a, c, b, a, d, c)
    }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  col.set(color)
  const n = pos.length / 3
  const rgb = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) rgb.set([col.r, col.g, col.b], i * 3)
  g.setAttribute('color', new BufferAttribute(rgb, 3))
  return g
}

/** A round-ish spot on the skin at (s, a): `rm` meters across along the body, `ra` meters round it (defaults to the
 *  same: a circle). */
export function skinSpot(hull: Hull, s: number, a: number, rm: number, color: string, push = 0.01, ra = rm, rows = 10, cols = 8): BufferGeometry {
  const ds = rm / hull.o.len
  return skinPatch(
    hull,
    s - ds,
    s + ds,
    (x) => a - (ra / Math.max(0.05, hull.sec(x).w)) * Math.sqrt(Math.max(0, 1 - ((x - s) / ds) ** 2)),
    (x) => a + (ra / Math.max(0.05, hull.sec(x).w)) * Math.sqrt(Math.max(0, 1 - ((x - s) / ds) ** 2)),
    color,
    push,
    rows,
    cols,
  )
}

const tmpA = new Vector3()
const tmpB = new Vector3()
const tmpC = new Vector3()
const tmpB2 = new Vector3()
const tmpC2 = new Vector3()
const tmpN = new Vector3()
const tmpM = new Vector3()

function mid3(g: BufferGeometry, tri: number[]) {
  const p = g.attributes.position
  tmpM.set(0, 0, 0)
  for (const i of tri) tmpM.add(tmpB.set(p.getX(i), p.getY(i), p.getZ(i)))
  return tmpM.multiplyScalar(1 / 3)
}

const col = new Color()
/** An indexed shape with smooth normals, opened up into plain triangles each painted one color (crisp toon edges). */
export function paintFaces(g: BufferGeometry, color: (tri: number[]) => string): BufferGeometry {
  const index = g.index!.array
  const flat = g.toNonIndexed()
  g.dispose()
  const n = flat.attributes.position.count
  const rgb = new Float32Array(n * 3)
  for (let t = 0; t < n / 3; t++) {
    col.set(color([index[t * 3], index[t * 3 + 1], index[t * 3 + 2]]))
    for (let k = 0; k < 3; k++) rgb.set([col.r, col.g, col.b], (t * 3 + k) * 3)
  }
  flat.setAttribute('color', new BufferAttribute(rgb, 3))
  // (merge() gives plain-triangle parts a simple index; so does this.)
  return flat
}

/** One station of a fin: `t` along its span (0 root .. 1 tip), the chord there, how far back its leading edge sits,
 *  and its thickness. */
export interface FinSec {
  t: number
  chord: number
  back: number
  thick: number
}

/** A fin's frame: along the span, its leading edge's way (square to the span), and the side its top faces (toward
 *  `hint` where it can; `flip` when that mirrored it, so the triangles turn the other way round). */
function finAxes(span: Vector3, fore: Vector3, hint: Vector3) {
  const sp = span.clone().normalize()
  const fw = fore.clone().addScaledVector(sp, -fore.dot(sp)).normalize()
  const up = new Vector3().crossVectors(fw, sp).normalize()
  const flip = up.dot(hint) < 0
  if (flip) up.negate()
  return { sp, fw, up, flip }
}

function finVal(secs: FinSec[], t: number, key: 'chord' | 'back' | 'thick') {
  let i = 0
  while (i < secs.length - 2 && secs[i + 1].t < t) i++
  const a = secs[i]
  const b = secs[i + 1]
  const k = Math.min(1, Math.max(0, (t - a.t) / Math.max(1e-6, b.t - a.t)))
  return a[key] + (b[key] - a[key]) * smooth(k)
}

/** A point on a fin's leading edge, `t` along its span (for knobs along a humpback's flipper). */
export function finEdge(secs: FinSec[], len: number, span: Vector3, fore: Vector3, t: number, out = new Vector3()) {
  const { sp, fw } = finAxes(span, fore, new Vector3(0, 1, 0))
  return out.copy(sp).multiplyScalar(t * len).addScaledVector(fw, -finVal(secs, t, 'back'))
}

/**
 * A fin (a flipper, a fluke, a dorsal fin): sections along its span, each a thin rounded lens (fat at the front, thin at
 * the back, like a real fin). `span` is the way out along the fin, `fore` the way its leading edge faces; the thickness
 * runs along their cross. Painted per triangle: `paint(t, top, along)` (`top`: on the side the cross points to;
 * `along`: 0 at the leading edge .. 1 at the trailing edge).
 */
export function fin(secs: FinSec[], len: number, span: Vector3, fore: Vector3, paint: (t: number, top: boolean, along: number) => string, rings = 14, around = 16, hint = new Vector3(0, 1, 0)): BufferGeometry {
  const { sp, fw, up, flip } = finAxes(span, fore, hint)
  const val = (t: number, key: 'chord' | 'back' | 'thick') => finVal(secs, t, key)
  const pos: number[] = []
  const tAt: number[] = []
  const alongAt: number[] = []
  const topAt: boolean[] = []
  const p = new Vector3()
  for (let i = 0; i <= rings; i++) {
    const t = i / rings
    const chord = Math.max(0.004, val(t, 'chord'))
    const back = val(t, 'back')
    const thick = Math.max(0.002, val(t, 'thick'))
    for (let j = 0; j < around; j++) {
      const a = (j / around) * Math.PI * 2
      // A lens: round leading edge, tapering to the trailing edge.
      const u = 0.5 - 0.5 * Math.cos(a) // 0 at the leading edge .. 1 at the trailing edge (and back)
      const side = Math.sin(a) >= 0 ? 1 : -1
      const th = (thick / 2) * Math.sqrt(Math.max(0, Math.sin(Math.acos(1 - 2 * u)))) * (1 - 0.55 * u) * side
      p.copy(sp).multiplyScalar(t * len).addScaledVector(fw, -back - u * chord).addScaledVector(up, th)
      pos.push(p.x, p.y, p.z)
      tAt.push(t)
      alongAt.push(u)
      topAt.push(side > 0)
    }
  }
  const idx: number[] = []
  for (let i = 0; i < rings; i++)
    for (let j = 0; j < around; j++) {
      const a = i * around + j
      const b = i * around + ((j + 1) % around)
      const c = (i + 1) * around + ((j + 1) % around)
      const d = (i + 1) * around + j
      if (flip) idx.push(a, b, c, a, c, d)
      else idx.push(a, c, b, a, d, c)
    }
  // The tip and the root closed.
  for (const [ring, f0] of [
    [0, true],
    [rings, false],
  ] as const) {
    const cap = f0 !== flip
    const mid = pos.length / 3
    const c = new Vector3()
    for (let j = 0; j < around; j++) c.add(tmpA.set(pos[(ring * around + j) * 3], pos[(ring * around + j) * 3 + 1], pos[(ring * around + j) * 3 + 2]))
    c.multiplyScalar(1 / around)
    pos.push(c.x, c.y, c.z)
    tAt.push(ring / rings)
    alongAt.push(0.5)
    topAt.push(true)
    for (let j = 0; j < around; j++) {
      const a = ring * around + j
      const b = ring * around + ((j + 1) % around)
      if (cap) idx.push(mid, a, b)
      else idx.push(mid, b, a)
    }
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return paintFaces(g, (tri) => {
    const t = (tAt[tri[0]] + tAt[tri[1]] + tAt[tri[2]]) / 3
    const along = (alongAt[tri[0]] + alongAt[tri[1]] + alongAt[tri[2]]) / 3
    const top = topAt[tri[0]] && topAt[tri[1]] && topAt[tri[2]]
    return paint(t, top, along)
  })
}

/** A thin round tube through points (a smile, a mouth line), its ends rounded. */
export function tube(points: Vector3[], r: number, color: string, around = 8): BufferGeometry {
  const pos: number[] = []
  const n = points.length
  const t = new Vector3()
  const nrm = new Vector3()
  const bin = new Vector3()
  const ref = new Vector3(0, 1, 0)
  for (let i = 0; i < n; i++) {
    t.subVectors(points[Math.min(n - 1, i + 1)], points[Math.max(0, i - 1)]).normalize()
    if (Math.abs(t.dot(ref)) > 0.95) ref.set(1, 0, 0)
    nrm.crossVectors(t, ref).normalize()
    bin.crossVectors(t, nrm).normalize()
    // (Thinner at the two ends.)
    const k = Math.sin(((i + 0.5) / n) * Math.PI) ** 0.35
    for (let j = 0; j < around; j++) {
      const a = (j / around) * Math.PI * 2
      const p = tmpA.copy(points[i]).addScaledVector(nrm, Math.cos(a) * r * k).addScaledVector(bin, Math.sin(a) * r * k)
      pos.push(p.x, p.y, p.z)
    }
  }
  const idx: number[] = []
  for (let i = 0; i < n - 1; i++)
    for (let j = 0; j < around; j++) {
      const a = i * around + j
      const b = i * around + ((j + 1) % around)
      const c = (i + 1) * around + ((j + 1) % around)
      const d = (i + 1) * around + j
      idx.push(a, b, c, a, c, d)
    }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  col.set(color)
  const cnt = pos.length / 3
  const rgb = new Float32Array(cnt * 3)
  for (let i = 0; i < cnt; i++) rgb.set([col.r, col.g, col.b], i * 3)
  g.setAttribute('color', new BufferAttribute(rgb, 3))
  return g
}

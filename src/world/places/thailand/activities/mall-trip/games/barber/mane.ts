// A mane of strands (the barber's toy, and Daddy's hairdo for the rest of the trip): every strand is a chain of
// SEG chunky tapered segments, all of them ONE instanced mesh plus one instanced ink outline (two draw calls for the
// whole head), so each strand has its own length, color, stiffness and curl. Strands grow in tufts (hair.ts's TUFTS)
// from the scalp (the top, sides and back of the head) and live in the head's own space, so they move
// with it. Their shape is worked out on the CPU whenever something changes: they stick out along the scalp, droop
// with their length, curl when poofed, stand up when spiked, lie down when combed flat, and blow in the dryer's wind,
// never going into the head.
//
// Her tools work on what's under her finger on screen (Salon): `nearest` finds the strands there, `cut` snips every
// strand a finger's sweep crosses (on an iPhone too: it tests the whole sweep, not just where the finger is now).
import { CylinderGeometry, SphereGeometry, Color, DynamicDrawUsage, Group, InstancedMesh, Matrix4, Quaternion, ShaderMaterial, BackSide, Vector2, Vector3, type BufferGeometry, type WebGLRenderer } from 'three'
import type { Rig } from '../../../../characters/animal'
import type { Look } from '../../../../characters/looks'
import type { Bag } from '../../../../engine/dispose'
import { merge, P, solid } from '../../../../engine/geo'
import { PAL, toon } from '../../../../engine/toon'
import { BOW_COLORS, decodeHair, encodeHair, HAIR_COLORS, LEN_STEPS, NATURAL, TUFTS, type BowId, type ColorId, type Hairdo, type Style } from './hair'

/** Segments per strand, strands per tuft, strands per eyebrow. */
const SEG = 5
const PER = 4
const BROW = 4

export interface Strand {
  /** Its tuft (TUFTS, TUFTS+1 are the eyebrows). */
  tuft: number
  root: Vector3
  /** Out of the scalp. */
  n: Vector3
  /** 0..LEN_STEPS (fractions while it grows). */
  len: number
  /** -1 combed flat .. 0 as it falls .. 1 spiky. */
  spike: number
  /** 0 straight .. 1 poofed curly. */
  curl: number
  /** How wild it is (it grows wild; a comb tames it). */
  wild: number
  color: ColorId
  /** Its own random lean and curl axis. */
  jit: Vector3
  axis: Vector3
  /** Head-local joints, SEG + 1 of them (root first). */
  joints: Vector3[]
}

interface Scalp {
  /** Where the strands root (an ellipsoid, head-local), and how far down its sides they grow (dir.y of the lowest). */
  c: Vector3
  r: Vector3
  low: number
  /** What strands never go into: the head (and a unicorn's hair cap). */
  avoid: { c: Vector3; r: Vector3 }[]
  brows: Vector3[]
  browN: Vector3
}

const tmp = new Vector3()
const tmp2 = new Vector3()
const q = new Quaternion()
const m = new Matrix4()
const UP = new Vector3(0, 1, 0)
const DOWN = new Vector3(0, -1, 0)
const scl = new Vector3()
const walk = new Vector3()
const BACK = new Vector3(0, 0, -1)
const FACE = new Vector3(0, 0.15, 1).normalize()
const ZERO = new Matrix4().makeScale(0, 0, 0)

/** A tiny repeatable random (a strand's lean is the same every time its hairdo is rebuilt). */
function rand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function scalpOf(rig: Rig, look: Look): Scalp {
  const { R, headY } = rig.face
  const head = { c: new Vector3(0, headY, 0), r: new Vector3(R, R, R).multiplyScalar(look.species === 'elephant' || look.species === 'puppy' ? 1.08 : 1.02) }
  const eyeX = 0.37 * R
  const eyeY = look.species === 'unicorn' || look.species === 'pony' ? 0.12 * R : 0.05 * R
  const on = (x: number, y: number) => new Vector3(x, headY + y, Math.sqrt(Math.max(0, R * R - x * x - y * y)))
  const brows = [-1, 1].map((s) => on(s * eyeX, eyeY + 0.3 * R))
  // Strands grow from the head itself, from the crown down to `low` (a unicorn's down the back and sides too).
  const scalp = { c: head.c.clone(), r: new Vector3(R, R, R).multiplyScalar(look.species === 'elephant' || look.species === 'puppy' ? 1.05 : 0.99) }
  const avoid = [head]
  if (look.species === 'unicorn') avoid.push({ c: new Vector3(0, headY + 0.42 * R, -0.12 * R), r: new Vector3(0.924 * R, 0.546 * R, 0.88 * R) })
  return { ...scalp, low: look.species === 'unicorn' ? -0.35 : 0.05, avoid, brows, browN: new Vector3(0, 0.3, 1).normalize() }
}

/** The colors of the hair as it is (his own mane's, tuft by tuft). */
function ownColor(look: Look, tuft: number) {
  const mane = look.mane ?? [look.dark]
  return mane[tuft % mane.length]
}

// ---------------------------------------------------------------- the outline (the house's, instanced)

const outlineVert = /* glsl */ `
  uniform vec2 uRes;
  uniform float uPx;
  void main() {
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    vec4 clip = projectionMatrix * mvPosition;
    vec3 n = normalMatrix * (mat3(instanceMatrix) * normal);
    vec2 dir = (projectionMatrix * vec4(n, 0.0)).xy;
    float len = length(dir);
    dir = len > 1e-5 ? dir / len : vec2(0.0);
    clip.xy += dir * uPx * 2.0 / uRes * clip.w;
    gl_Position = clip;
  }
`
const outlineFrag = /* glsl */ `
  uniform vec3 uColor;
  void main() { gl_FragColor = vec4(uColor, 1.0); }
`
const size = new Vector2()

/** Each segment is this much thinner than the one before (the tip ends at about a quarter of the root). */
const TAPER = 0.72
/** One tapered segment: radius 1 at y = 0, TAPER at y = 1. A ball at each joint (the knot) rounds the bend, so a
 *  strand reads as one smooth lock. */
function segmentGeometry(): BufferGeometry {
  return new CylinderGeometry(TAPER, 1, 1, 10, 1, true).translate(0, 0.5, 0)
}

export class Mane {
  readonly root = new Group()
  readonly strands: Strand[] = []
  /** Wind from the dryer (head-local direction), and how hard (0..1). */
  readonly wind = { dir: new Vector3(), k: 0 }
  /** Something changed since the last encode (the screen updates the `hair` param). */
  changed = false
  /** The segments and the balls at their joints, each with its ink outline. */
  private tubes: [InstancedMesh, InstancedMesh]
  private knots: [InstancedMesh, InstancedMesh]
  private scalp: Scalp
  private R: number
  private dirty = true
  private colors = new Map<string, Color>()
  private bows: { tuft: number; bow: BowId; g: Group; k: number }[] = []
  private bowShapes = new Map<BowId, BufferGeometry>()

  constructor(rig: Rig, private look: Look, private bag: Bag, hairdo: Hairdo | string = '') {
    this.scalp = scalpOf(rig, look)
    this.R = rig.face.R
    const n = (TUFTS * PER + 2 * BROW) * SEG
    const px = look.height >= 1 ? 1.6 : 1.3
    const ink = bag.add(new ShaderMaterial({ uniforms: { uRes: { value: [1, 1] }, uPx: { value: px }, uColor: { value: new Color(PAL.ink) } }, vertexShader: outlineVert, fragmentShader: outlineFrag, side: BackSide }))
    const pair = (geo: BufferGeometry): [InstancedMesh, InstancedMesh] => {
      const ims: [InstancedMesh, InstancedMesh] = [bag.add(new InstancedMesh(geo, toon('#ffffff'), n)), bag.add(new InstancedMesh(geo, ink, n))]
      // The outline is as wide in pixels as the house's (its canvas size, read as it draws).
      ims[1].onBeforeRender = (renderer: WebGLRenderer) => {
        renderer.getSize(size)
        ink.uniforms.uRes.value = [Math.max(1, size.x), Math.max(1, size.y)]
      }
      for (const im of ims) {
        im.instanceMatrix.setUsage(DynamicDrawUsage)
        im.frustumCulled = false
        this.root.add(im)
      }
      return ims
    }
    this.tubes = pair(bag.add(segmentGeometry()))
    this.knots = pair(bag.add(new SphereGeometry(1, 10, 7)))
    this.makeStrands()
    this.set(typeof hairdo === 'string' ? decodeHair(hairdo) : hairdo)
    rig.head.add(this.root)
    // The toy's own back locks give way to the strands.
    if (rig.mane) rig.mane.visible = false
  }

  /** Length in meters of a step (0..LEN_STEPS): a step past his own is a lot longer. */
  meters(step: number) {
    return (step / LEN_STEPS) * 1.55 * this.R
  }

  private makeStrands() {
    const { c, r, low, brows, browN } = this.scalp
    const golden = Math.PI * (3 - Math.sqrt(5))
    const root = (d: Vector3) => new Vector3(d.x * r.x, d.y * r.y, d.z * r.z).add(c)
    // Not on the face: the hairline is high on the forehead (long hair still falls over it as bangs).
    const shows = (d: Vector3) => d.dot(FACE) < 0.52
    // Tufts spread evenly over the scalp: a golden spiral from the crown down to `low`, as many points as it takes for
    // TUFTS of them to show.
    let dirs: Vector3[] = []
    for (let m = TUFTS; dirs.length < TUFTS && m < TUFTS * 6; m++) {
      dirs = []
      for (let t = 0; t < m; t++) {
        const y = 1 - ((t + 0.5) / m) * (1 - low)
        const ring = Math.sqrt(1 - y * y)
        const a = t * golden + 0.6
        const d = new Vector3(Math.cos(a) * ring, y, Math.sin(a) * ring)
        if (shows(d)) dirs.push(d)
      }
    }
    dirs.slice(0, TUFTS).forEach((dir, t) => {
      for (let k = 0; k < PER; k++) {
        const seed = t * 31 + k * 7
        const d = dir.clone()
        for (let spread = 0.42; k && spread > 0.05; spread /= 2) {
          d.copy(dir).add(tmp2.set(rand(seed) - 0.5, rand(seed + 1) - 0.5, rand(seed + 2) - 0.5).multiplyScalar(spread)).normalize()
          if (shows(d)) break
          d.copy(dir)
        }
        const n = new Vector3(d.x / r.x, d.y / r.y, d.z / r.z).normalize()
        this.strands.push(this.strand(t, root(d), n, seed))
      }
    })
    brows.forEach((at, b) => {
      for (let k = 0; k < BROW; k++) {
        const root = at.clone().add(tmp.set((k - (BROW - 1) / 2) * 0.09 * this.R, Math.abs(k - (BROW - 1) / 2) * -0.02 * this.R, 0))
        this.strands.push(this.strand(TUFTS + b, root, browN.clone().add(tmp.set((b ? 1 : -1) * 0.25, 0, 0)).normalize(), 900 + b * 13 + k))
      }
    })
  }

  private strand(tuft: number, root: Vector3, n: Vector3, seed: number): Strand {
    return {
      tuft,
      root,
      n,
      len: 0,
      spike: 0,
      curl: 0,
      wild: 0,
      color: 'n',
      jit: new Vector3(rand(seed + 3) - 0.5, rand(seed + 4) - 0.5, rand(seed + 5) - 0.5).normalize(),
      axis: new Vector3().crossVectors(n, tmp.set(rand(seed + 6) - 0.5, 1, rand(seed + 7) - 0.5)).normalize(),
      joints: Array.from({ length: SEG + 1 }, () => root.clone()),
    }
  }

  // ---------------------------------------------------------------- the hairdo in and out

  set(h: Hairdo) {
    for (const s of this.strands) {
      if (s.tuft >= TUFTS) {
        s.len = h.brows[s.tuft - TUFTS]
        s.spike = s.curl = 0
        s.wild = 0.3
        s.color = 'n'
        continue
      }
      const t = h.tufts[s.tuft]
      s.len = t.len
      s.color = t.color
      s.spike = t.style === 's' ? 1 : t.style === 'f' ? -1 : 0
      s.curl = t.style === 'c' ? 1 : 0
      s.wild = this.wildFor(s.len)
    }
    for (const b of this.bows) b.g.removeFromParent()
    this.bows = []
    for (const b of h.bows) this.addBow(b.tuft, b.bow, true)
    this.dirty = true
  }

  /** Grown past his own, hair gets wild. */
  wildFor(len: number) {
    return Math.min(1, Math.max(0, (len - NATURAL) / 14))
  }

  get hairdo(): Hairdo {
    const tufts = Array.from({ length: TUFTS }, (_, t) => {
      const list = this.strands.filter((s) => s.tuft === t)
      const avg = (f: (s: Strand) => number) => list.reduce((a, s) => a + f(s), 0) / list.length
      const spike = avg((s) => s.spike)
      const curl = avg((s) => s.curl)
      // The color most of its strands have.
      const count = new Map<ColorId, number>()
      for (const s of list) count.set(s.color, (count.get(s.color) ?? 0) + 1)
      const color = [...count.entries()].sort((a, b) => b[1] - a[1])[0][0]
      const style: Style = curl > 0.5 ? 'c' : spike > 0.45 ? 's' : spike < -0.45 ? 'f' : 'n'
      return { len: Math.round(avg((s) => s.len)), color, style }
    })
    const brow = (b: number) => Math.round(Math.max(...this.strands.filter((s) => s.tuft === TUFTS + b).map((s) => s.len)))
    return { tufts, bows: this.bows.map((b) => ({ tuft: b.tuft, bow: b.bow })), brows: [brow(0), brow(1)] }
  }
  get code() {
    return encodeHair(this.hairdo)
  }

  /** Something about these strands changed (a tool worked them). */
  touched() {
    this.dirty = true
    this.changed = true
  }

  colorOf(s: Strand) {
    return s.color === 'n' ? (s.tuft >= TUFTS ? this.look.dark : ownColor(this.look, s.tuft)) : HAIR_COLORS[s.color]
  }

  // ---------------------------------------------------------------- bows and clips

  addBow(tuft: number, bow: BowId, quiet = false) {
    if (this.bows.length >= 6) {
      this.bows[0].g.removeFromParent()
      this.bows.shift()
    }
    let geo = this.bowShapes.get(bow)
    if (!geo) {
      geo = this.bag.add(bowGeometry(bow, this.R))
      this.bowShapes.set(bow, geo)
    }
    const g = solid(geo.clone(), this.bag, 1.6)
    this.root.add(g)
    this.bows.push({ tuft, bow, g, k: quiet ? 1 : 0 })
    if (!quiet) this.changed = true
    this.dirty = true
  }
  /** The tuft whose roots are nearest a head-local point. */
  tuftNear(local: Vector3) {
    let best = 0
    let d = Infinity
    for (const s of this.strands) {
      if (s.tuft >= TUFTS) continue
      const dd = s.joints[Math.min(2, SEG)].distanceTo(local)
      if (dd < d) {
        d = dd
        best = s.tuft
      }
    }
    return best
  }

  // ---------------------------------------------------------------- where the strands are on screen

  /** The strands near a screen point (`toPx`: a head-local point to screen pixels), with how near (1 right there). */
  nearest(x: number, y: number, rPx: number, toPx: (v: Vector3) => Vector2 | null, fn: (s: Strand, k: number, at: Vector3) => void) {
    let hits = 0
    for (const s of this.strands) {
      if (s.len < 0.05 && s.tuft >= TUFTS) {
        // A bare brow still listens (the tonic grows it from nothing).
        const p = toPx(s.root)
        if (p && Math.hypot(p.x - x, p.y - y) < rPx) {
          fn(s, 1 - Math.hypot(p.x - x, p.y - y) / rPx, s.root)
          hits++
        }
        continue
      }
      let best = Infinity
      let at = s.root
      for (const j of s.joints) {
        const p = toPx(j)
        if (!p) continue
        const d = Math.hypot(p.x - x, p.y - y)
        if (d < best) {
          best = d
          at = j
        }
      }
      if (best < rPx) {
        fn(s, 1 - best / rPx, at)
        hits++
      }
    }
    return hits
  }

  /** Snips every strand the sweep from a to b crosses (within rPx). Returns the bits that fall (head-local, color). */
  cut(a: Vector2, b: Vector2, rPx: number, toPx: (v: Vector3) => Vector2 | null) {
    const fell: { at: Vector3; color: string; size: number }[] = []
    const stub = 0.6
    for (const s of this.strands) {
      if (s.len <= stub + 0.2) continue
      const pts = s.joints.map(toPx)
      let cutAt = -1
      for (let j = 1; j < pts.length && cutAt < 0; j++) {
        const p0 = pts[j - 1]
        const p1 = pts[j]
        if (!p0 || !p1) continue
        const f = segSeg(a, b, p0, p1, rPx)
        if (f >= 0) cutAt = j - 1 + f
      }
      if (cutAt < 0) continue
      const keep = Math.max(stub, (cutAt / SEG) * s.len)
      if (keep > s.len - 0.4) continue
      // The bit that falls: from the cut to the tip.
      const from = Math.floor(cutAt)
      for (let j = from + 1; j <= SEG; j++) fell.push({ at: s.joints[j].clone(), color: this.colorOf(s), size: 0.05 * this.R + 0.012 * (s.len - keep) })
      s.len = keep
    }
    if (fell.length) this.touched()
    return fell
  }

  // ---------------------------------------------------------------- shape

  update(dt: number, t: number) {
    for (const b of this.bows) b.k = Math.min(1, b.k + dt / 0.3)
    if (!this.dirty && this.wind.k < 0.01) return
    this.dirty = false
    const R = this.R
    let i = 0
    for (const s of this.strands) {
      this.shape(s, t)
      const L = this.meters(s.len)
      const base = (s.tuft >= TUFTS ? 0.055 : 0.105) * R
      const color = this.color(this.colorOf(s))
      // Thick at the root, thin at the tip; short hair stays a little chunkier.
      let rr = base * (0.8 + 0.2 * Math.min(1, 6 / Math.max(1, s.len)))
      for (let j = 0; j < SEG; j++) {
        if (L < 0.004) {
          for (const im of [...this.tubes, ...this.knots]) im.setMatrixAt(i, ZERO)
          i++
          continue
        }
        const a = s.joints[j]
        const b = s.joints[j + 1]
        tmp.subVectors(b, a)
        const len = tmp.length()
        q.setFromUnitVectors(UP, len > 1e-6 ? tmp.divideScalar(len) : UP)
        m.compose(a, q, scl.set(rr, len, rr))
        this.tubes[0].setMatrixAt(i, m)
        this.tubes[1].setMatrixAt(i, m)
        this.tubes[0].setColorAt(i, color)
        rr *= TAPER
        m.compose(b, q, scl.set(rr, rr, rr))
        this.knots[0].setMatrixAt(i, m)
        this.knots[1].setMatrixAt(i, m)
        this.knots[0].setColorAt(i++, color)
      }
    }
    for (const im of [...this.tubes, ...this.knots]) {
      im.instanceMatrix.needsUpdate = true
      if (im.instanceColor) im.instanceColor.needsUpdate = true
    }
    // Bows sit in the hair, a little way up their tuft (they ride the strands as they move).
    for (const b of this.bows) {
      const s = this.strands.find((x) => x.tuft === b.tuft)!
      const at = s.joints[Math.min(SEG, Math.max(1, Math.round(SEG * 0.35)))]
      b.g.position.copy(at).addScaledVector(s.n, 0.04 * R)
      b.g.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), s.n)
      const k = b.k < 1 ? 1 + Math.sin(b.k * Math.PI) * 0.4 : 1
      b.g.scale.setScalar(Math.max(0.01, b.k) * k)
    }
    if (this.bows.some((b) => b.k < 1)) this.dirty = true
  }

  private color(hex: string) {
    let c = this.colors.get(hex)
    if (!c) {
      c = new Color(hex)
      this.colors.set(hex, c)
    }
    return c
  }

  /** Where each joint of a strand is now: out of the scalp, then bending with gravity, curl, wildness and wind. */
  private shape(s: Strand, t: number) {
    const L = this.meters(s.len)
    const seg = L / SEG
    const brow = s.tuft >= TUFTS
    // As it falls: out of the scalp, leaning down. Spiky: straight out. Combed flat: along the scalp, down and back.
    const fall = tmp2.copy(DOWN).addScaledVector(BACK, 0.5)
    fall.addScaledVector(s.n, -fall.dot(s.n))
    if (fall.lengthSq() < 1e-4) fall.set(0, 0, -1)
    fall.normalize()
    const d = s.n.clone().addScaledVector(DOWN, brow ? 0.1 : 0.35)
    if (s.spike > 0) d.lerp(s.n, s.spike)
    else d.lerp(fall, -s.spike * 0.8)
    d.addScaledVector(s.jit, 0.25 + s.wild * 0.4).normalize()
    // Poofed: more volume (out from the head) and a curl round its own axis.
    if (s.curl > 0) d.lerp(s.n, s.curl * 0.35).normalize()
    const stiff = Math.max(0, s.spike)
    const droop = (0.07 + Math.min(0.5, L / (2.2 * this.R))) * (1 - stiff * 0.92) * (s.spike < 0 ? 1.6 : 1) * (1 - s.curl * 0.5)
    s.joints[0].copy(s.root)
    const p = walk.copy(s.root)
    const w = this.wind
    for (let j = 1; j <= SEG; j++) {
      d.addScaledVector(DOWN, droop)
      if (s.curl > 0) d.applyAxisAngle(s.axis, s.curl * 1.15)
      if (s.wild > 0) d.addScaledVector(s.jit, s.wild * 0.22 * Math.sin(j * 1.7 + s.tuft))
      if (w.k > 0.01) d.addScaledVector(w.dir, w.k * (0.55 + 0.35 * Math.sin(t * 17 + s.tuft * 1.3 + j))).addScaledVector(s.axis, w.k * 0.25 * Math.sin(t * 23 + s.tuft))
      d.normalize()
      const next = s.joints[j].copy(p).addScaledVector(d, seg)
      // Hair falls round the head, never into it (and keeps going from where it really is).
      this.pushOut(next)
      if (seg > 1e-5) d.subVectors(next, p).normalize()
      p.copy(next)
    }
  }

  private pushOut(p: Vector3) {
    for (const e of this.scalp.avoid) {
      tmp.subVectors(p, e.c).divide(e.r)
      const l = tmp.length()
      if (l < 1.05 && l > 1e-6) p.copy(tmp.multiplyScalar(1.05 / l).multiply(e.r).add(e.c))
    }
  }
}

/** Where along the segment p0-p1 a finger's sweep a-b crosses it, within r (0..1), or -1. */
function segSeg(a: Vector2, b: Vector2, p0: Vector2, p1: Vector2, r: number) {
  let best = -1
  let bd = r
  for (let i = 0; i <= 6; i++) {
    const f = i / 6
    const x = p0.x + (p1.x - p0.x) * f
    const y = p0.y + (p1.y - p0.y) * f
    const d = distToSeg(x, y, a, b)
    if (d < bd) {
      bd = d
      best = f
    }
  }
  return best
}
function distToSeg(x: number, y: number, a: Vector2, b: Vector2) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const l2 = dx * dx + dy * dy
  const k = l2 > 0 ? Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / l2)) : 0
  return Math.hypot(x - a.x - dx * k, y - a.y - dy * k)
}

/** A bow (two loops and a knot) or a hair clip (a little rounded bar with a star), facing +z. */
function bowGeometry(bow: BowId, R: number) {
  const c = BOW_COLORS[bow.toLowerCase()]
  const k = R * 1.25
  if (bow === bow.toUpperCase()) return merge([P.rbox(0.26 * k, 0.07 * k, 0.05 * k, 0.03 * k, c, { rot: [0, 0, 0.3] }), P.sphere(0.07 * k, '#FFFFFF', { at: [0, 0, 0.03 * k], scale: [1, 1, 0.5] })])
  return merge([...[-1, 1].map((s) => P.cone(0.13 * k, 0.2 * k, c, { at: [s * 0.11 * k, 0, 0], rot: [0, 0, s * Math.PI / 2], scale: [1, 1, 0.55] })), P.sphere(0.065 * k, c)])
}

/** Daddy keeps his hairdo for the rest of the trip: strands for a `hair` code on any toy (nothing for his own mane). */
export function wearHair(rig: Rig, look: Look, code: string, bag: Bag): Mane | null {
  if (!code) return null
  const mane = new Mane(rig, look, bag, code)
  mane.update(0, 0)
  return mane
}

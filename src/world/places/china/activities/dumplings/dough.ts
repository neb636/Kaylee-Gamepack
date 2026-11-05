// The dough: the toy at the heart of the Dumpling House. One soft shape under her finger that she squishes, stretches,
// folds and pleats. It isn't soft-body physics: it's a closed surface (a grid of rings from the top pole to the bottom
// one) whose every vertex is worked out each frame from a few numbers:
//   flat     0 a ball .. 1 a round flat wrapper (.. 1.3 a dumpling pancake, if she keeps squishing)
//   fold     0 .. 1 the near half folded over onto the far half (a half-moon, round 1)
//   gather   per angle round the rim, 0 .. 1 that bit of the rim pinched up into a pleat (a soup dumpling, rounds 2-3)
//   twist    the pleats twisted shut on top
// plus her finger's dents (they spring back), a stretch where she drags (it wobbles back) and a jiggle. One geometry,
// rebuilt in place every frame, drawn twice: the toon mesh and its ink outline (the same smooth normals push the line out).
import { BufferAttribute, BufferGeometry, Color, Group, Mesh } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { P, solid } from '../../../../engine3d/geo'
import { outlineMaterial } from '../../../../engine3d/outline'
import { toon } from '../../../../engine3d/toon'
import { knobs } from '../../../../kit/knobs'

const FILE = 'src/world/places/china/activities/dumplings/dough.ts'
/** How the dough feels under her finger (?feel=1). */
export const DOUGH = knobs('dough', 'The dough', FILE, {
  press: { value: 0.34, min: 0.05, max: 1, step: 0.01, label: 'One press flattens', note: 'how much of the way from a ball to a wrapper one press goes (0.34: three presses)' },
  hold: { value: 0.7, min: 0, max: 4, step: 0.05, label: 'Holding flattens', unit: '/s', note: 'a finger held down keeps squashing it this fast' },
  dent: { value: 0.45, min: 0, max: 0.9, step: 0.01, label: 'Dent depth', note: 'how deep her finger sinks in (a share of the dough’s height)' },
  spring: { value: 3.5, min: 0.3, max: 20, step: 0.1, label: 'Dents spring back', unit: '/s', note: 'low = it keeps her finger marks a while, like play-dough' },
  wobble: { value: 0.16, min: 0, max: 0.5, step: 0.01, label: 'Jiggle', note: 'how much it wobbles after a poke' },
  stretch: { value: 0.1, min: 0, max: 0.3, step: 0.005, label: 'Stretches up to', unit: 'm', note: 'how far a drag pulls it like mochi before it holds' },
  fold: { value: 0.2, min: 0.05, max: 0.6, step: 0.01, label: 'Fold drag', unit: 'm', note: 'how far her finger pushes the edge to fold it all the way over' },
})
/** Pinching the pleats round a soup dumpling (rounds 2 and 3). */
export const PLEAT = knobs('pleat', 'Pleating', FILE, {
  count: { value: 10, min: 4, max: 18, step: 1, label: 'Pleats round', note: 'Chef Fu counts each one (in Chinese up to ten)' },
  reach: { value: 1.8, min: 1, max: 3, step: 0.05, label: 'Rim reach', note: 'how far out her finger still pinches the rim (× the wrapper’s radius)' },
  inner: { value: 0.35, min: 0, max: 0.9, step: 0.05, label: 'Rim starts at', note: 'how close to the middle a finger still counts as on the rim (× the radius)' },
})

export type DoughColor = 'cream' | 'pink' | 'green' | 'yellow'
export const DOUGH_COLORS: Record<DoughColor, string> = { cream: '#FFF0D2', pink: '#FFB0C8', green: '#B5E39A', yellow: '#FFDD73' }
export const COLOR_NAMES: DoughColor[] = ['cream', 'pink', 'green', 'yellow']
export type Kind = 'moon' | 'pouch'
const FILLING = '#E08A6E'

const NU = 48
const NV = 26
const COUNT = 2 + NU * (NV - 1)
const TAU = Math.PI * 2
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)

interface Dent {
  x: number
  z: number
  d: number
  rad: number
}

export class Dough {
  readonly root = new Group()
  /** Squashes and jiggles (the root moves it around). */
  private body = new Group()
  private geo: BufferGeometry
  private pos: Float32Array
  private col: Float32Array
  private filling: Group
  /** The ball's radius (round 3 makes big and small ones). */
  r: number
  kind: Kind
  color: DoughColor
  swirl: DoughColor | null = null
  flat = 0
  flatGoal = 0
  fold = 0
  foldGoal = 0
  /** Scoops of filling on it (0..2). */
  fill = 0
  private fillShow = 0
  sealed = false
  twist = 0
  private twistGoal = 0
  private crimp = 0
  /** Per vertex column: how pinched up the rim is (eased), its goal, and how much pleat ridge shows. */
  private gather = new Float32Array(NU)
  private gatherGoal = new Float32Array(NU)
  private pleatAmp = new Float32Array(NU)
  /** Which pleats she has pinched so far. */
  pleats: boolean[] = []
  private dents: Dent[] = []
  private pull = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, gx: 0, gz: 0, held: false, tx: 0, ty: 0, tz: 0 }
  private jig = 0
  private jigV = 0
  private colorDirty = true
  private time = Math.random() * 10

  constructor(bag: Bag, opts: { r: number; kind: Kind; color: DoughColor; swirl?: DoughColor | null }) {
    this.r = opts.r
    this.kind = opts.kind
    this.color = opts.color
    this.swirl = opts.swirl ?? null
    this.pleats = Array.from({ length: Math.round(PLEAT.count) }, () => false)
    this.pos = new Float32Array(COUNT * 3)
    this.col = new Float32Array(COUNT * 3)
    const geo = bag.add(new BufferGeometry())
    geo.setAttribute('position', new BufferAttribute(this.pos, 3))
    geo.setAttribute('color', new BufferAttribute(this.col, 3))
    const idx: number[] = []
    const ring = (j: number, i: number) => 1 + (j - 1) * NU + ((i + NU) % NU)
    const bottom = COUNT - 1
    for (let i = 0; i < NU; i++) idx.push(0, ring(1, i + 1), ring(1, i))
    for (let j = 1; j < NV - 1; j++)
      for (let i = 0; i < NU; i++) {
        const a = ring(j, i)
        const a1 = ring(j, i + 1)
        const b = ring(j + 1, i)
        const b1 = ring(j + 1, i + 1)
        idx.push(a, a1, b, a1, b1, b)
      }
    for (let i = 0; i < NU; i++) idx.push(bottom, ring(NV - 1, i), ring(NV - 1, i + 1))
    geo.setIndex(idx)
    this.geo = geo
    const mesh = new Mesh(geo, toon('#ffffff', true))
    const hull = new Mesh(geo, outlineMaterial(2.5))
    mesh.frustumCulled = hull.frustumCulled = false
    this.body.add(mesh, hull)
    this.filling = solid(P.sphere(1, FILLING, {}, 14), bag, 2)
    this.filling.visible = false
    this.body.add(this.filling)
    this.root.add(this.body)
    this.build()
  }

  /** The radius of what's on the board now (for her finger). */
  get footprint() {
    const F = this.flat
    return this.r * (1 + 1.1 * Math.min(F, 1) + 0.6 * Math.max(0, F - 1)) * (1 - 0.35 * this.gatherAll)
  }
  get height() {
    if (this.gatherAll > 0.5) return this.r * 2.2
    if (this.sealed || this.fold > 0.5) return this.r * 1.1
    return this.r * 2 * (1 - 0.85 * Math.min(1, this.flat)) + 0.02
  }
  get wrapper() {
    return this.flatGoal >= 1 - 1e-3
  }
  get pleated() {
    return this.pleats.filter(Boolean).length
  }
  get gatherAll() {
    let s = 0
    for (let i = 0; i < NU; i++) s += this.gather[i]
    return s / NU
  }
  /** A finished dumpling: sealed shut (half-moon) or pleated and twisted (soup dumpling). */
  get done() {
    return this.sealed
  }

  setColor(c: DoughColor, swirl: DoughColor | null = null) {
    this.color = c
    this.swirl = swirl
    this.colorDirty = true
  }

  /** Her finger presses at (x, z) on the board, in the dough's own meters: a dent, and it squashes flatter. */
  press(x: number, z: number) {
    const fr = this.footprint
    this.dents.push({ x, z, d: DOUGH.dent, rad: Math.max(0.035, fr * 0.45) })
    if (this.dents.length > 6) this.dents.shift()
    this.poke(0.6)
    if (this.sealed || this.gatherAll > 0.05) return
    // A wrapper with filling on it doesn't squash any further (her press just dents it).
    if (this.fill > 0) return
    this.flatGoal = Math.min(1.3, this.flatGoal + DOUGH.press * (this.flatGoal >= 1 ? 0.5 : 1))
    if (this.flatGoal > 1 - DOUGH.press * 0.25 && this.flatGoal < 1) this.flatGoal = 1
  }
  /** A finger held still on it keeps squashing. */
  hold(x: number, z: number, dt: number) {
    const last = this.dents[this.dents.length - 1]
    if (last) {
      last.d = Math.max(last.d, DOUGH.dent)
      last.x += (x - last.x) * ease(dt, 10)
      last.z += (z - last.z) * ease(dt, 10)
    }
    if (this.sealed || this.fill > 0 || this.gatherAll > 0.05) return
    this.flatGoal = Math.min(1.3, this.flatGoal + DOUGH.hold * dt * (this.flatGoal >= 1 ? 0.3 : 1))
  }
  /** A drag: the dough stretches toward her finger (dx, dz meters from where she grabbed, gx/gz). */
  stretch(gx: number, gz: number, dx: number, dz: number) {
    const p = this.pull
    const d = Math.hypot(dx, dz)
    const max = DOUGH.stretch
    const k = d > max ? max / d : 1
    p.gx = gx
    p.gz = gz
    p.tx = dx * k
    p.tz = dz * k
    p.ty = Math.min(max, d) * 0.35
    p.held = true
  }
  letGo() {
    this.pull.held = false
    this.pull.tx = this.pull.ty = this.pull.tz = 0
  }
  /** A tap or a bump: it jiggles. */
  poke(k = 1) {
    this.jigV += DOUGH.wobble * 14 * k
  }

  addFilling() {
    this.fill = Math.min(2, this.fill + 1)
    this.filling.visible = true
    this.poke(0.5)
  }
  removeFilling() {
    this.fill = Math.max(1, this.fill - 1)
  }
  /** The fold follows her finger (0..1). */
  setFold(f: number) {
    this.foldGoal = Math.min(1, Math.max(0, f))
  }
  seal() {
    this.foldGoal = 1
    this.sealed = true
    this.poke(0.8)
  }
  /** Her finger at this angle round the rim (radians, 0 = +x, toward +z): the pleat there, if it's new (its index). */
  pinchAt(angle: number) {
    const n = this.pleats.length
    const a = ((angle % TAU) + TAU) % TAU
    const k = Math.floor((a / TAU) * n) % n
    if (this.pleats[k]) return -1
    this.pleats[k] = true
    for (let i = 0; i < NU; i++) {
      const u = (i / NU) * TAU
      if (Math.floor((u / TAU) * n) % n === k) {
        this.gatherGoal[i] = 1
        this.pleatAmp[i] = 1
      }
    }
    this.poke(0.35)
    return k
  }
  /** Every pleat pinched: the top twists shut. */
  twistShut() {
    this.twistGoal = 1.5
    this.sealed = true
    for (let i = 0; i < NU; i++) this.gatherGoal[i] = 1
    this.poke(0.7)
  }
  /** Set up as already made (a section link, Chef Fu's quick hands). */
  finish() {
    this.flat = this.flatGoal = 1
    this.fill = 1
    this.filling.visible = true
    if (this.kind === 'moon') {
      this.fold = this.foldGoal = 1
      this.crimp = 1
    } else {
      this.pleats.fill(true)
      this.gather.fill(1)
      this.gatherGoal.fill(1)
      this.pleatAmp.fill(1)
      this.twist = this.twistGoal = 1.5
    }
    this.sealed = true
  }
  /** Flat and ready for filling (a link). */
  makeWrapper() {
    this.flat = this.flatGoal = 1
  }

  update(dt: number) {
    this.time += dt
    this.flat += (this.flatGoal - this.flat) * ease(dt, 10)
    // Filling on a pancake: it gathers back to a proper wrapper.
    if (this.fill > 0 && this.flatGoal > 1) this.flatGoal += (1 - this.flatGoal) * ease(dt, 3)
    this.fold += (this.foldGoal - this.fold) * ease(dt, this.sealed ? 7 : 16)
    if (this.sealed) this.crimp += (1 - this.crimp) * ease(dt, 4)
    this.twist += (this.twistGoal - this.twist) * ease(dt, 5)
    this.fillShow += (this.fill - this.fillShow) * ease(dt, 9)
    for (let i = 0; i < NU; i++) this.gather[i] += (this.gatherGoal[i] - this.gather[i]) * ease(dt, 7)
    for (const d of this.dents) d.d *= 1 - ease(dt, DOUGH.spring)
    this.dents = this.dents.filter((d) => d.d > 0.01)
    // The stretch: a spring to her finger while she holds it, a wobbly spring home after.
    const p = this.pull
    const k = p.held ? 120 : 90
    const c = p.held ? 18 : 7
    p.vx += ((p.tx - p.x) * k - p.vx * c) * dt
    p.vy += ((p.ty - p.y) * k - p.vy * c) * dt
    p.vz += ((p.tz - p.z) * k - p.vz * c) * dt
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.z += p.vz * dt
    // The jiggle: a soft spring.
    this.jigV += (-this.jig * 160 - this.jigV * 9) * dt
    this.jig += this.jigV * dt
    const j = Math.max(-0.35, Math.min(0.35, this.jig))
    this.body.scale.set(1 + j * 0.5, 1 - j, 1 + j * 0.5)
    // A pleated one breathes a little (it's alive).
    if (this.sealed) this.body.scale.y *= 1 + Math.sin(this.time * 2.4) * 0.015
    this.build()
  }

  private build() {
    const { pos, r } = this
    const F = this.flat
    const kf = smooth(0, 1, Math.min(F, 1))
    const R = r * (1 + 1.1 * Math.min(F, 1) + 0.6 * Math.max(0, F - 1))
    const t = r * Math.max(0.1, 0.24 - 0.12 * Math.max(0, F - 1))
    const fold = this.fold * Math.PI * 0.96
    const fh = r * (0.55 + 0.25 * Math.max(0, this.fillShow - 1)) * Math.min(1, this.fillShow)
    const pr = r * (1.25 + 0.15 * Math.max(0, this.fillShow - 1))
    const wall = r * 0.14
    const nP = this.pleats.length
    const knot = Math.min(1, this.twist / 1.5)
    const psiMax = Math.PI * (0.88 + 0.08 * knot)
    const pull = this.pull
    const sig2 = (R * 0.8) ** 2
    let o = 0
    const put = (st: number, ct: number, u: number, gi: number, pl: number) => {
      const cu = Math.cos(u)
      const su = Math.sin(u)
      // The ball, sitting on the board.
      let x = r * st * cu
      let y = r * (1 + ct)
      let z = r * st * su
      // Squashed into a round wrapper with a soft rim.
      const s = Math.pow(st, 0.4)
      const dx = R * s * cu
      const dy = t * 0.5 * (1 + ct)
      const dz = R * s * su
      x += (dx - x) * kf
      y += (dy - y) * kf
      z += (dz - z) * kf
      // A half-moon: the near half (+z) swings up and over the far half, hinged across the middle, and puffs up over
      // the filling.
      if (fold > 0) {
        const a = fold * smooth(-0.04 * R, 0.22 * R, z)
        if (a > 0) {
          const py = t * 0.5
          const yy = y - py
          const ny = py + yy * Math.cos(a) + z * Math.sin(a)
          const nz = -yy * Math.sin(a) + z * Math.cos(a)
          const bump = fh * Math.exp(-((x / (R * 0.75)) ** 2) - ((z - R * 0.42) / (R * 0.5)) ** 2) * smooth(0, 0.3 * Math.PI, a)
          y = ny + bump * 1.4
          z = nz
          // Crimped along the sealed edge.
          if (s > 0.82) y += r * 0.05 * this.crimp * Math.sin(u * 16) * smooth(0.82, 1, s)
        }
      }
      // A soup dumpling: the rim pinched up into a pouch, pleat by pleat, then twisted shut on top.
      if (gi > 0.001) {
        const psi = s * psiMax
        const rad = ct < 0 ? pr : pr - wall
        let rho = rad * Math.sin(psi)
        const ty = rad * (1 - Math.cos(psi)) * 0.8
        if (ct < 0 && psi > 0.35 * Math.PI) rho += pl * r * 0.2 * (0.5 + 0.5 * Math.cos(nP * u)) * smooth(0.35 * Math.PI, 0.85 * Math.PI, psi)
        const uu = u + this.twist * (psi / Math.PI) ** 3
        const tx = rho * Math.cos(uu)
        const tz = rho * Math.sin(uu)
        const g = smooth(0, 1, gi)
        x += (tx - x) * g
        y += (ty - y) * g
        z += (tz - z) * g
      }
      // Her finger's dents (pushed down toward the board, a little out to the sides).
      for (const d of this.dents) {
        const f = Math.exp(-((x - d.x) ** 2 + (z - d.z) ** 2) / (d.rad * d.rad)) * d.d
        y *= 1 - f
        x += (x - d.x) * f * 0.2
        z += (z - d.z) * f * 0.2
      }
      // The stretch toward her finger.
      if (pull.x || pull.y || pull.z) {
        const w = Math.exp(-((x - pull.gx) ** 2 + (z - pull.gz) ** 2) / sig2)
        x += pull.x * w
        y += pull.y * w * Math.min(1, y / Math.max(0.01, r))
        z += pull.z * w
      }
      pos[o++] = x
      pos[o++] = Math.max(0, y)
      pos[o++] = z
    }
    const gAvg = this.gatherAll
    put(0, 1, 0, gAvg, 0)
    for (let j = 1; j < NV; j++) {
      const th = (j / NV) * Math.PI
      const st = Math.sin(th)
      const ct = Math.cos(th)
      for (let i = 0; i < NU; i++) {
        // A little blur round the rim, so a pinched pleat pulls its neighbours up with it.
        const g = (this.gather[(i + NU - 1) % NU] + this.gather[i] * 2 + this.gather[(i + 1) % NU]) / 4
        put(st, ct, (i / NU) * TAU, g, this.pleatAmp[i])
      }
    }
    put(0, -1, 0, gAvg, 0)
    this.geo.attributes.position.needsUpdate = true
    this.geo.computeVertexNormals()
    // The filling sits on the far half of the wrapper (where the near half folds over it), or in the middle of a pouch.
    const fs = this.fillShow
    // Covered once it's folded or gathered up (it shows through otherwise).
    this.filling.visible = this.fill > 0 && this.fold < 0.6 && this.gatherAll < 0.75
    if (this.filling.visible) {
      const fr = r * 0.48 * (fs > 1 ? 1 + 0.3 * (fs - 1) : fs)
      this.filling.scale.setScalar(Math.max(0.001, fr))
      const pouch = this.kind === 'pouch'
      this.filling.position.set(0, t + fr * 0.55, pouch ? 0 : -R * 0.38)
    }
    if (this.colorDirty) this.paint()
  }

  private paint() {
    this.colorDirty = false
    const a = new Color(DOUGH_COLORS[this.color])
    const b = new Color(DOUGH_COLORS[this.swirl ?? this.color])
    const c = this.col
    let o = 0
    const set = (th: number, u: number) => {
      const use = this.swirl && Math.sin(u * 3 + th * 5) > 0 ? b : a
      c[o++] = use.r
      c[o++] = use.g
      c[o++] = use.b
    }
    set(0, 0)
    for (let j = 1; j < NV; j++) for (let i = 0; i < NU; i++) set((j / NV) * Math.PI, (i / NU) * TAU)
    set(Math.PI, 0)
    this.geo.attributes.color.needsUpdate = true
  }
}

// The road kit's scenery, built from a Road (road.ts): the hills it's cut into (one height field, so the ground always
// meets the road), the ribbon of the road itself (two lanes, white edge lines, a dashed yellow middle, dirt verges),
// steel guard rails wherever the ground drops away beside it, black-and-white chevron signs round the sharp bends,
// round convex mirrors on blind bends, trees, a ring of far mountains, and a river with a bridge where one crosses; and
// after rain, the wet road's shine and its puddles (buildWet). Few draw calls: each kind of thing is merged into one mesh (plus its outline).
import { BoxGeometry, BufferAttribute, BufferGeometry, Color, Group, Matrix4, Mesh, MeshBasicMaterial, Quaternion, Vector3 } from 'three'
import type { Bag } from '../../engine/dispose'
import { bake, merge, P, solid, type V3 } from '../../engine/geo'
import { PAL, toon } from '../../engine/toon'
import type { Road } from './road'

export interface RoadLook {
  /** How far the hills rise and dip (meters): beside the road, and far from it. */
  hills: { near: number; far: number }
  /** A wall of mountains far off (meters high), round a valley. */
  wall?: number
  /** Flat rice paddies in squares beside the road (the valley). */
  paddies?: boolean
  /** A river crossing under the road at `s` (a bridge carries the road over it). */
  river?: { s: number; width: number }
  trees: number
  /** Seed for the hills and the trees (the same road always looks the same). */
  seed: number
}

const ASPHALT = '#8E88A3'
const LINE = '#FBFBFF'
const MIDDLE = '#FFD45C'
const VERGE = '#D9BC9C'
const RAIL = '#E9ECF4'
const POST = '#B9BCCB'

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** A seeded random 0..1 (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hash(ix: number, iz: number, seed: number) {
  let h = Math.imul(ix, 374761393) + Math.imul(iz, 668265263) + Math.imul(seed, 2246822519)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}
/** Smooth value noise, -1..1, a few octaves. */
function fbm(x: number, z: number, seed: number) {
  let sum = 0
  let amp = 1
  let norm = 0
  for (let o = 0; o < 3; o++) {
    const ix = Math.floor(x)
    const iz = Math.floor(z)
    const fx = x - ix
    const fz = z - iz
    const ux = fx * fx * (3 - 2 * fx)
    const uz = fz * fz * (3 - 2 * fz)
    const a = hash(ix, iz, seed + o)
    const b = hash(ix + 1, iz, seed + o)
    const c = hash(ix, iz + 1, seed + o)
    const d = hash(ix + 1, iz + 1, seed + o)
    sum += amp * (a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz)
    norm += amp
    amp *= 0.5
    x *= 2.03
    z *= 2.03
  }
  return (sum / norm) * 2 - 1
}

/** The ground: the road's own heights spread out over the land, plus hills that grow away from it. A grid of heights
 *  (for drawing it and for asking how high the ground is anywhere: the camera, the trees, the rails). */
export class HeightField {
  readonly x0: number
  readonly z0: number
  readonly nx: number
  readonly nz: number
  readonly cell = 4
  readonly h: Float32Array
  /** Meters to the road's middle at each grid point. */
  readonly d: Float32Array

  constructor(
    readonly road: Road,
    readonly look: RoadLook,
  ) {
    const b = road.bounds(170)
    this.x0 = b.x0
    this.z0 = b.z0
    this.nx = Math.ceil((b.x1 - b.x0) / this.cell) + 1
    this.nz = Math.ceil((b.z1 - b.z0) / this.cell) + 1
    this.h = new Float32Array(this.nx * this.nz)
    this.d = new Float32Array(this.nx * this.nz)
    const pts = road.samples.filter((_, i) => i % 3 === 0)
    for (let j = 0; j < this.nz; j++)
      for (let i = 0; i < this.nx; i++) {
        const x = this.x0 + i * this.cell
        const z = this.z0 + j * this.cell
        const { h, d } = this.natural(x, z, pts)
        this.h[j * this.nx + i] = h
        this.d[j * this.nx + i] = d
      }
  }

  private natural(x: number, z: number, pts: { x: number; y: number; z: number }[]) {
    const { look, road } = this
    let sw = 0
    let swy = 0
    let best = Infinity
    let yNear = 0
    for (const p of pts) {
      const d2 = (p.x - x) ** 2 + (p.z - z) ** 2
      const w = 1 / (d2 + 36)
      sw += w
      swy += w * p.y
      if (d2 < best) {
        best = d2
        yNear = p.y
      }
    }
    const d = Math.sqrt(best)
    const base = swy / sw
    const amp = look.hills.near + (look.hills.far - look.hills.near) * smooth(road.half + 6, 130, d)
    let h = base + amp * fbm(x / 55, z / 55, look.seed)
    if (look.wall) h += look.wall * smooth(90, 260, d) * (0.65 + 0.35 * fbm(x / 30, z / 30, look.seed + 7))
    if (look.paddies && d < 120) h = base - 0.4 + (h - base) * smooth(70, 120, d)
    // Flat under the road and its verges, easing out into the hills.
    const flat = yNear - 0.25
    h = flat + (h - flat) * smooth(road.half + 1.6, road.half + 9, d)
    // (After the flattening: the river runs right under the bridge.)
    if (look.river) {
      const r = road.spotAt(look.river.s)
      const p = road.sampleAt(look.river.s)
      // Meters from the river's middle (it runs across the road, along the road's left there).
      const off = Math.abs((x - r.x) * p.tx + (z - r.z) * p.tz)
      h = -3 + (h + 3) * smooth(look.river.width / 2, look.river.width / 2 + 10, off)
    }
    return { h, d }
  }

  /** How high the ground is at (x, z) (bilinear between the grid points; held at the edges). */
  at(x: number, z: number) {
    const u = Math.min(this.nx - 1.001, Math.max(0, (x - this.x0) / this.cell))
    const v = Math.min(this.nz - 1.001, Math.max(0, (z - this.z0) / this.cell))
    const i = Math.floor(u)
    const j = Math.floor(v)
    const fu = u - i
    const fv = v - j
    const h = this.h
    const n = this.nx
    const a = h[j * n + i]
    const b = h[j * n + i + 1]
    const c = h[(j + 1) * n + i]
    const d = h[(j + 1) * n + i + 1]
    return a + (b - a) * fu + (c - a) * fv + (a - b - c + d) * fu * fv
  }

  /** The ground as one mesh, colored by what grows there. */
  mesh(bag: Bag) {
    const { nx, nz, cell, look, road } = this
    const pos = new Float32Array(nx * nz * 3)
    const col = new Float32Array(nx * nz * 3)
    const c = new Color()
    const greens = ['#A3DC9C', '#8ED39A', '#77C48C', '#62B283'].map((g) => new Color(g))
    const paddy = [new Color('#B5E8A4'), new Color('#9FDCA0'), new Color('#BFE3EC')]
    const verge = new Color(VERGE)
    for (let j = 0; j < nz; j++)
      for (let i = 0; i < nx; i++) {
        const k = j * nx + i
        const x = this.x0 + i * cell
        const z = this.z0 + j * cell
        pos.set([x, this.h[k], z], k * 3)
        const d = this.d[k]
        const n = fbm(x / 22, z / 22, look.seed + 3)
        if (d < road.half + 1.2) c.copy(verge)
        else if (look.paddies && d < 75) c.copy(paddy[Math.abs(Math.floor(x / 14) + Math.floor(z / 14)) % 3])
        else c.copy(greens[Math.min(3, Math.max(0, Math.floor((n + 1) * 2)))])
        col.set([c.r, c.g, c.b], k * 3)
      }
    const idx: number[] = []
    for (let j = 0; j < nz - 1; j++)
      for (let i = 0; i < nx - 1; i++) {
        const a = j * nx + i
        idx.push(a, a + nx, a + 1, a + 1, a + nx, a + nx + 1)
      }
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(pos, 3))
    g.setAttribute('color', new BufferAttribute(col, 3))
    g.setIndex(idx)
    g.computeVertexNormals()
    return new Mesh(bag.add(g), toon('#ffffff', true))
  }
}

/** A box from `a` to `b` (its length along the line between them), `w` wide and `h` tall. */
function beam(a: Vector3, b: Vector3, w: number, h: number, color: string) {
  const dir = b.clone().sub(a)
  const len = dir.length()
  const g = new BoxGeometry(w, h, len)
  g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), dir.normalize()))
  g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2)
  return bake(g, color)
}
/** Parts built round the origin (facing +z), turned to `yaw` and moved to (x, y, z). */
function placed(parts: BufferGeometry[], x: number, y: number, z: number, yaw: number) {
  const g = merge(parts)
  g.applyMatrix4(new Matrix4().makeRotationY(yaw).setPosition(x, y, z))
  return g
}

/** A round convex mirror on an orange pole, its face turned toward the cars coming round the bend. The face is its own
 *  material, so the drive can flash it when a car shows in it. */
export interface Mirror {
  root: Group
  face: MeshBasicMaterial
  s: number
  /** The middle of the mirror, for its tap target. */
  at: Vector3
}
export function buildMirror(road: Road, field: HeightField, s: number, side: number, bag: Bag): Mirror {
  const p = road.spotAt(s, side * (road.half + 1.9))
  const t = road.sampleAt(s)
  const root = new Group()
  const y = field.at(p.x, p.z)
  root.position.set(p.x, y, p.z)
  // Facing back down the road toward her (and a little in toward the road).
  root.rotation.y = Math.atan2(-t.tx - side * t.lx * 0.4, -t.tz - side * t.lz * 0.4)
  root.add(solid(merge([P.cyl(0.07, 0.08, 3.1, '#FF8A3C', { at: [0, 1.55, 0] }), P.torus(0.55, 0.09, '#FF8A3C', { at: [0, 3.2, 0.02] }), P.cyl(0.5, 0.5, 0.06, '#D9DCE8', { at: [0, 3.2, -0.04], rot: [Math.PI / 2, 0, 0] })]), bag, 2))
  const face = bag.add(new MeshBasicMaterial({ color: '#CFE8FF' }))
  const disc = new Mesh(bag.add(P.cyl(0.47, 0.47, 0.02, '#ffffff', { at: [0, 3.2, 0.03], rot: [Math.PI / 2, 0, 0] })), face)
  root.add(disc)
  return { root, face, s, at: new Vector3(p.x, y + 3.2, p.z) }
}

export interface RoadScene {
  root: Group
  field: HeightField
  /** Where along the road there are guard rails, by side (+1 left, -1 right). */
  railed: (s: number, side: number) => boolean
}

export function buildRoadScene(road: Road, look: RoadLook, bag: Bag): RoadScene {
  const root = new Group()
  const field = new HeightField(road, look)
  root.add(field.mesh(bag))
  root.add(ribbon(road, bag))

  // ---- Guard rails where the ground drops away beside the road ----
  const half = road.half
  const railSet = new Set<string>()
  const railParts: BufferGeometry[] = []
  const POST_EVERY = 4
  for (const side of [1, -1]) {
    let prev: Vector3 | null = null
    for (let s = 0; s <= road.length; s += POST_EVERY) {
      const out = road.spotAt(s, side * (half + 5))
      const drop = road.sampleAt(s).y - field.at(out.x, out.z)
      const onBridge = look.river && Math.abs(s - look.river.s) < look.river.width / 2 + 4
      if (drop < 1.6 && !onBridge) {
        prev = null
        continue
      }
      railSet.add(`${side}:${Math.round(s / POST_EVERY)}`)
      const p = road.spotAt(s, side * (half + 0.55))
      const at = new Vector3(p.x, p.y, p.z)
      railParts.push(P.box(0.12, 0.85, 0.12, POST, { at: [at.x, at.y + 0.42, at.z] }))
      if (prev) railParts.push(beam(prev.clone().setY(prev.y + 0.62), at.clone().setY(at.y + 0.62), 0.07, 0.3, RAIL))
      prev = at
    }
  }
  if (railParts.length) root.add(solid(merge(railParts), bag, 2))

  // ---- Chevron signs round the sharp bends, on the outside, facing her as she comes ----
  const signs: BufferGeometry[] = []
  for (let s = 8; s < road.length - 8; s += 7) {
    const k = road.bendAhead(s - 6, 12) / 12
    if (Math.abs(k) < 1 / 38) continue
    const side = -Math.sign(k)
    const p = road.spotAt(s, side * (half + 1.7))
    const t = road.sampleAt(s)
    const y = field.at(p.x, p.z)
    // The arrow points the way the road turns (seen from her side: +x is her right).
    const dir = k > 0 ? 1 : -1
    const chevron: [number, number][] = [[-0.2, 0], [0.08, 0.24], [0.22, 0.24], [-0.06, 0], [0.22, -0.24], [0.08, -0.24]].map(([x, yy]) => [x * dir, yy] as [number, number])
    signs.push(
      placed(
        [P.box(0.08, 1.3, 0.08, POST, { at: [0, 0.65, -0.05] }), P.box(0.9, 0.62, 0.06, PAL.ink, { at: [0, 1.5, 0] }), P.prism(chevron, 0.03, '#FFFFFF', { at: [0, 1.5, 0.04] })],
        p.x,
        y,
        p.z,
        Math.atan2(-t.tx, -t.tz),
      ),
    )
  }
  if (signs.length) root.add(solid(merge(signs), bag, 2))

  // ---- Trees on the hills (not on the road, the paddies or in the river) ----
  const rand = rng(look.seed * 31 + 5)
  const trees: BufferGeometry[] = []
  const b = road.bounds(150)
  for (let n = 0, tries = 0; n < look.trees && tries < look.trees * 12; tries++) {
    const x = b.x0 + rand() * (b.x1 - b.x0)
    const z = b.z0 + rand() * (b.z1 - b.z0)
    const near = road.locate(x, z)
    if (near.d < half + 6 || (look.paddies && near.d < 70)) continue
    if (look.river) {
      const r = road.spotAt(look.river.s)
      const p = road.sampleAt(look.river.s)
      if (Math.abs((x - r.x) * p.tx + (z - r.z) * p.tz) < look.river.width / 2 + 3) continue
    }
    const y = field.at(x, z)
    const k = 0.8 + rand() * 0.9
    const green = ['#5FAE7E', '#6FBF86', '#4F9D78'][Math.floor(rand() * 3)]
    trees.push(
      rand() < 0.55
        ? merge([P.cyl(0.18 * k, 0.24 * k, 2 * k, '#A07A63', { at: [x, y + k, z] }, 6), P.cone(1.6 * k, 3 * k, green, { at: [x, y + 2.9 * k, z] }, 8), P.cone(1.1 * k, 2.2 * k, green, { at: [x, y + 4.2 * k, z] }, 8)])
        : merge([P.cyl(0.2 * k, 0.26 * k, 2.2 * k, '#A07A63', { at: [x, y + 1.1 * k, z] }, 6), P.sphere(1.7 * k, green, { at: [x, y + 3.2 * k, z], scale: [1, 0.85, 1] }, 8)]),
    )
    n++
  }
  if (trees.length) root.add(solid(merge(trees), bag, 2))

  // ---- A ring of far mountains, hazy in the fog ----
  const far: BufferGeometry[] = []
  const cx = (b.x0 + b.x1) / 2
  const cz = (b.z0 + b.z1) / 2
  const R = Math.max(b.x1 - b.x0, b.z1 - b.z0) / 2 + 140
  const { y0 } = road.bounds()
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + rand() * 0.3
    const r = R + rand() * 90
    const h = 110 + rand() * 120
    far.push(P.cone(70 + rand() * 60, h, ['#86BFA0', '#7AB497', '#93C7A8'][i % 3], { at: [cx + Math.cos(a) * r, y0 - 10 + h / 2, cz + Math.sin(a) * r] }, 9))
  }
  root.add(solid(merge(far), bag, 0))

  // ---- A river under a bridge ----
  if (look.river) {
    const r = road.spotAt(look.river.s)
    const p = road.sampleAt(look.river.s)
    const water = new Mesh(bag.add(P.box(look.river.width + 6, 0.1, 900, '#ffffff', { at: [0, 0, 0] })), toon('#86CBE6'))
    water.position.set(r.x, -1.6, r.z)
    water.rotation.y = Math.atan2(p.tx, p.tz) + Math.PI / 2
    root.add(water)
    const bridge: BufferGeometry[] = []
    const w = look.river.width / 2 + 4
    for (const side of [1, -1])
      for (let s = look.river.s - w; s < look.river.s + w; s += 2) {
        const a = road.spotAt(s, side * (half + 0.6))
        const c = road.spotAt(s + 2, side * (half + 0.6))
        bridge.push(beam(new Vector3(a.x, a.y + 0.9, a.z), new Vector3(c.x, c.y + 0.9, c.z), 0.12, 0.14, PAL.cream))
        bridge.push(P.box(0.14, 0.9, 0.14, PAL.cream, { at: [a.x, a.y + 0.45, a.z] }))
      }
    // The deck under the road.
    const a = road.spotAt(look.river.s - w)
    const c = road.spotAt(look.river.s + w)
    bridge.push(beam(new Vector3(a.x, a.y - 0.45, a.z), new Vector3(c.x, c.y - 0.45, c.z), half * 2 + 1.6, 0.8, '#C9C3D8'))
    root.add(solid(merge(bridge), bag, 2))
  }

  return { root, field, railed: (s, side) => railSet.has(`${side}:${Math.round(s / POST_EVERY)}`) }
}

/** The road itself: strips across it (verge, edge line, lane, the dashed middle, lane, edge line, verge), one mesh. */
function ribbon(road: Road, bag: Bag) {
  const h = road.half
  // Across the road from right to left, with each strip's color (a function of `s` for the dashes).
  const cuts = [-(h + 1.5), -h, -h + 0.2, -0.09, 0.09, h - 0.2, h, h + 1.5]
  const color = (j: number, s: number) => [VERGE, LINE, ASPHALT, Math.floor(s / 3) % 2 ? ASPHALT : MIDDLE, ASPHALT, LINE, VERGE][j]
  const lift = (j: number) => (j === 0 || j === 6 ? -0.03 : 0.03)
  const pos: number[] = []
  const col: number[] = []
  const c = new Color()
  const S = road.samples
  for (let i = 0; i < S.length - 1; i++) {
    const a = S[i]
    const b = S[i + 1]
    for (let j = 0; j < cuts.length - 1; j++) {
      c.set(color(j, a.s))
      const l0 = cuts[j]
      const l1 = cuts[j + 1]
      // The verges' outer edges dip a little into the ground.
      const y0 = j === 0 ? -0.2 : lift(j)
      const y1 = j === 6 ? -0.2 : lift(j)
      const quad: V3[] = [
        [a.x + a.lx * l0, a.y + y0, a.z + a.lz * l0],
        [b.x + b.lx * l0, b.y + y0, b.z + b.lz * l0],
        [a.x + a.lx * l1, a.y + y1, a.z + a.lz * l1],
        [b.x + b.lx * l1, b.y + y1, b.z + b.lz * l1],
      ]
      for (const k of [0, 1, 2, 1, 3, 2]) {
        pos.push(...quad[k])
        col.push(c.r, c.g, c.b)
      }
    }
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  g.setAttribute('color', new BufferAttribute(new Float32Array(col), 3))
  g.computeVertexNormals()
  const m = new Mesh(bag.add(g), toon('#ffffff', true))
  m.renderOrder = 1
  return m
}

/** A puddle on a wet road: where along it (s), how far across (lat) and how big (meters). */
export interface Puddle {
  s: number
  lat: number
  r: number
}

/** The road after rain: the asphalt a shade darker, long pale shine streaks along both lanes (the sky in the wet road),
 *  and puddles here and there that she can drive through (splash!). Two meshes, laid just over the ribbon. */
export function buildWet(road: Road, seed: number, bag: Bag): { root: Group; puddles: Puddle[] } {
  const rand = rng(seed * 7 + 3)
  const root = new Group()
  const h = road.half
  const S = road.samples
  // The darker wet film over both lanes.
  const film: number[] = []
  for (let i = 0; i < S.length - 1; i++) {
    const a = S[i]
    const b = S[i + 1]
    const q: V3[] = [
      [a.x - a.lx * h, a.y + 0.045, a.z - a.lz * h],
      [b.x - b.lx * h, b.y + 0.045, b.z - b.lz * h],
      [a.x + a.lx * h, a.y + 0.045, a.z + a.lz * h],
      [b.x + b.lx * h, b.y + 0.045, b.z + b.lz * h],
    ]
    for (const k of [0, 1, 2, 1, 3, 2]) film.push(...q[k])
  }
  const fg = new BufferGeometry()
  fg.setAttribute('position', new BufferAttribute(new Float32Array(film), 3))
  const filmMesh = new Mesh(bag.add(fg), bag.add(new MeshBasicMaterial({ color: '#5E5878', transparent: true, opacity: 0.16, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })))
  filmMesh.renderOrder = 2
  root.add(filmMesh)

  // Shine streaks along the lanes and the puddles, one mesh with vertex colors.
  const pos: number[] = []
  const col: number[] = []
  const c = new Color()
  const quad = (q: V3[], color: string) => {
    c.set(color)
    for (const k of [0, 1, 2, 1, 3, 2]) {
      pos.push(...q[k])
      col.push(c.r, c.g, c.b)
    }
  }
  for (const lane of [-h / 2, h / 2])
    for (let s = 2 + rand() * 6; s < road.length - 6; ) {
      const len = 1.5 + rand() * 3.5
      const lat = lane + (rand() - 0.5) * 2.2
      const w = 0.06 + rand() * 0.14
      for (let u = s; u < s + len && u < road.length - 1; u += 1) {
        const a = road.sampleAt(u)
        const b = road.sampleAt(Math.min(u + 1, s + len))
        quad([
          [a.x + a.lx * (lat - w), a.y + 0.06, a.z + a.lz * (lat - w)],
          [b.x + b.lx * (lat - w), b.y + 0.06, b.z + b.lz * (lat - w)],
          [a.x + a.lx * (lat + w), a.y + 0.06, a.z + a.lz * (lat + w)],
          [b.x + b.lx * (lat + w), b.y + 0.06, b.z + b.lz * (lat + w)],
        ], rand() < 0.3 ? '#E9E6F6' : '#C9C6E0')
      }
      s += len + 3 + rand() * 9
    }
  const puddles: Puddle[] = []
  for (let s = 18 + rand() * 20; s < road.length - 30; s += 22 + rand() * 30) {
    const p: Puddle = { s, lat: (rand() < 0.6 ? 1 : -1) * (0.8 + rand() * 2), r: 0.7 + rand() * 0.7 }
    puddles.push(p)
    // An ellipse, longer along the road, a paler rim round a sky-blue middle.
    const t = road.sampleAt(s)
    const N = 14
    for (const [k, color, y] of [[1, '#F4F8FF', 0.065], [0.78, '#B3CDEE', 0.07]] as const)
      for (let i = 0; i < N; i++) {
        const a0 = (i / N) * Math.PI * 2
        const a1 = ((i + 1) / N) * Math.PI * 2
        const at = (a: number): V3 => {
          const along = Math.cos(a) * p.r * 1.6 * k
          const across = p.lat + Math.sin(a) * p.r * k
          return [t.x + t.tx * along + t.lx * across, t.y + y, t.z + t.tz * along + t.lz * across]
        }
        const m: V3 = [t.x + t.lx * p.lat, t.y + y, t.z + t.lz * p.lat]
        c.set(color)
        for (const v of [m, at(a0), at(a1)]) {
          pos.push(...v)
          col.push(c.r, c.g, c.b)
        }
      }
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  g.setAttribute('color', new BufferAttribute(new Float32Array(col), 3))
  const shine = new Mesh(bag.add(g), bag.add(new MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.55, depthWrite: false, side: 2, polygonOffset: true, polygonOffsetFactor: -3 })))
  shine.renderOrder = 3
  root.add(shine)
  return { root, puddles }
}

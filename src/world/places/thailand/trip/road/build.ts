// The road kit's scenery, built from a Road (road.ts): the hills it's cut into (one height field, so the ground always
// meets the road), the ribbon of the road itself (two lanes, white edge lines, a dashed yellow middle, dirt verges),
// steel guard rails wherever the ground drops away beside it, black-and-white chevron signs round the sharp bends,
// round convex mirrors on blind bends, trees, a ring of far mountains, and a river with a bridge where one crosses; and
// after rain, the wet road's shine and its puddles (buildWet). Few draw calls: each kind of thing is merged into one mesh (plus its outline).
//
// The Nan look (`look.jungle`, the mountain roads; the photos Dad sent of Route 1081 and 1256): the road runs on past
// both ends into the hills (it never just stops), dark asphalt with a solid yellow middle and a grass shoulder, steel
// W-beam rails, power poles with sagging wires and white kilometer stones, hillsides deep in a lumpy forest canopy
// (forest.ts), cleared fields on the far slopes, paddies cut into fields with green bunds, villages with tin roofs in
// pink and blue (village.ts), and layer after layer of blue ridges going pale into the haze (far.ts).
import { BoxGeometry, BufferAttribute, BufferGeometry, Color, Group, Matrix4, Mesh, MeshBasicMaterial, Quaternion, Vector3 } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { bake, merge, P, solid, type V3 } from '../../../../engine3d/geo'
import { PAL, toon } from '../../../../engine3d/toon'
import { buildRidges } from './far'
import { buildForest, type Clear } from './forest'
import { Road, type RoadPoint } from './road'
import { buildVillages, type Village } from './village'

export interface RoadLook {
  /** How far the hills rise and dip (meters): beside the road, and far from it. */
  hills: { near: number; far: number }
  /** A wall of mountains far off (meters high), round a valley. */
  wall?: number
  /** Flat rice paddies in squares beside the road (the valley). */
  paddies?: boolean
  /** The paddies stepped into terraces down the hill, each step this many meters high (the rice steps). */
  terraces?: number
  /** A river crossing under the road at `s` (a bridge carries the road over it). */
  river?: { s: number; width: number }
  trees: number
  /** Chevron signs round the sharp bends (on unless false: a race track has hay bales there instead). */
  signs?: boolean
  /** Seed for the hills and the trees (the same road always looks the same). */
  seed: number
  /** The Nan look: the forest canopy, the far ridges, the road running on past its ends (see the top of the file). */
  jungle?: boolean
  /** The road's middle line (the Nan look): solid yellow on the mountain roads, dashed in the valley and the town. */
  middle?: 'solid' | 'dashed'
  /** Villages beside the road (the Nan look). */
  villages?: Village[]
  /** Flowering trees among the green (the Nan look): the share of the big trees in pink (Chomphu Phu Kha, the sky
   *  road's own) and gold (ratchaphruek). */
  bloom?: number
  /** How sharply the road bends away as it runs on past its ends (radians every 26 m; the Nan look). */
  runOn?: number
}

const ASPHALT = '#8E88A3'
const LINE = '#FBFBFF'
const MIDDLE = '#FFD45C'
const VERGE = '#D9BC9C'
const RAIL = '#E9ECF4'
const POST = '#B9BCCB'
// The Nan look's road: dark asphalt, a solid yellow middle, a concrete edge and a grass shoulder.
const J_ASPHALT = '#7A7686'
const J_MIDDLE = '#FFC93C'
const J_KERB = '#C9C5CF'
const J_VERGE = '#8EC756'

export const smooth = (a: number, b: number, x: number) => {
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
export function fbm(x: number, z: number, seed: number) {
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
  /** Meters to the road's middle at each grid point, and the height of the road there and how far along it that is. */
  readonly d: Float32Array
  readonly ry: Float32Array
  readonly rs: Float32Array

  constructor(
    readonly road: Road,
    readonly look: RoadLook,
    /** Where the drive's road starts along this one (the Nan look's road runs on past its ends): the river's `s` is the
     *  drive's. */
    readonly s0 = 0,
  ) {
    const b = road.bounds(170)
    this.x0 = b.x0
    this.z0 = b.z0
    this.nx = Math.ceil((b.x1 - b.x0) / this.cell) + 1
    this.nz = Math.ceil((b.z1 - b.z0) / this.cell) + 1
    this.h = new Float32Array(this.nx * this.nz)
    this.d = new Float32Array(this.nx * this.nz)
    this.ry = new Float32Array(this.nx * this.nz)
    this.rs = new Float32Array(this.nx * this.nz)
    const pts = road.samples.filter((_, i) => i % 3 === 0)
    for (let j = 0; j < this.nz; j++)
      for (let i = 0; i < this.nx; i++) {
        const x = this.x0 + i * this.cell
        const z = this.z0 + j * this.cell
        const { h, d, y, s } = this.natural(x, z, pts)
        this.h[j * this.nx + i] = h
        this.d[j * this.nx + i] = d
        this.ry[j * this.nx + i] = y
        this.rs[j * this.nx + i] = s
      }
  }

  private natural(x: number, z: number, pts: { x: number; y: number; z: number; s: number }[]) {
    const { look, road } = this
    let sw = 0
    let swy = 0
    let best = Infinity
    let yNear = 0
    let sNear = 0
    for (const p of pts) {
      const d2 = (p.x - x) ** 2 + (p.z - z) ** 2
      const w = 1 / (d2 + 36)
      sw += w
      swy += w * p.y
      if (d2 < best) {
        best = d2
        yNear = p.y
        sNear = p.s
      }
    }
    const d = Math.sqrt(best)
    const base = swy / sw
    const amp = look.hills.near + (look.hills.far - look.hills.near) * smooth(road.half + 6, 130, d)
    let h = base + amp * fbm(x / 55, z / 55, look.seed)
    if (look.wall) h += look.wall * smooth(90, 260, d) * (0.65 + 0.35 * fbm(x / 30, z / 30, look.seed + 7))
    if (look.paddies && d < 120) h = base - 0.4 + (h - base) * smooth(70, 120, d)
    if (look.terraces && d < 140) h = Math.round(h / look.terraces) * look.terraces
    // Flat under the road and its verges, easing out into the hills.
    const flat = yNear - 0.25
    h = flat + (h - flat) * smooth(road.half + 1.6, road.half + 9, d)
    // (After the flattening: the river runs right under the bridge.)
    if (look.river) {
      const r = road.spotAt(look.river.s + this.s0)
      const p = road.sampleAt(look.river.s + this.s0)
      // Meters from the river's middle (it runs across the road, along the road's left there).
      const off = Math.abs((x - r.x) * p.tx + (z - r.z) * p.tz)
      h = -3 + (h + 3) * smooth(look.river.width / 2, look.river.width / 2 + 10, off)
    }
    return { h, d, y: yNear, s: sNear }
  }

  /** How high the ground is at (x, z) (bilinear between the grid points; held at the edges). */
  at(x: number, z: number) {
    return this.lerp(this.h, x, z)
  }
  /** Meters from (x, z) to the road's middle (near enough: bilinear between the grid points). */
  dist(x: number, z: number) {
    return this.lerp(this.d, x, z)
  }
  /** How high the road is nearest (x, z). */
  roadY(x: number, z: number) {
    return this.lerp(this.ry, x, z)
  }
  /** About how far along the road the nearest bit of it is (from the nearest grid point). */
  roadS(x: number, z: number) {
    const i = Math.round(Math.min(this.nx - 1, Math.max(0, (x - this.x0) / this.cell)))
    const j = Math.round(Math.min(this.nz - 1, Math.max(0, (z - this.z0) / this.cell)))
    return this.rs[j * this.nx + i]
  }
  /** The Nan look: a cleared field on a far slope (corn, dry grass) instead of forest. */
  open(x: number, z: number) {
    return this.look.jungle === true && fbm(x / 95, z / 95, this.look.seed + 17) > 0.3
  }
  /** The Nan look's paddies: flat fields beside the valley road. */
  paddyAt(d: number) {
    return !!this.look.paddies && d < 72
  }

  private lerp(h: Float32Array, x: number, z: number) {
    const u = Math.min(this.nx - 1.001, Math.max(0, (x - this.x0) / this.cell))
    const v = Math.min(this.nz - 1.001, Math.max(0, (z - this.z0) / this.cell))
    const i = Math.floor(u)
    const j = Math.floor(v)
    const fu = u - i
    const fv = v - j
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
    const bank = new Color('#6FAE6E')
    for (let j = 0; j < nz; j++)
      for (let i = 0; i < nx; i++) {
        const k = j * nx + i
        const x = this.x0 + i * cell
        const z = this.z0 + j * cell
        pos.set([x, this.h[k], z], k * 3)
        const d = this.d[k]
        const n = fbm(x / 22, z / 22, look.seed + 3)
        if (look.jungle) this.jungleColor(c, x, z, d, n)
        else if (d < road.half + 1.2) c.copy(verge)
        else if (look.paddies && look.terraces && d < 75) {
          // Each step its own paddy, and a grassy bank along each step's edge.
          const hk = this.h[k]
          const drop = Math.max(...[k - 1, k + 1, k - nx, k + nx].map((n) => (n >= 0 && n < this.h.length ? hk - this.h[n] : 0)))
          c.copy(drop > look.terraces * 0.5 ? bank : paddy[Math.abs(Math.round(hk / look.terraces)) % 3])
        }
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

  /** The Nan look's ground: a grass shoulder along the road, the dark floor under the forest (its gaps read as shade
   *  between the crowns), cleared fields on the far slopes, green bunds round the paddies, and muddy banks by a river. */
  private jungleColor(c: Color, x: number, z: number, d: number, n: number) {
    const half = this.road.half
    const k = (n + 1) / 2
    c.copy(J.grass[0]).lerp(J.grass[1], k)
    if (this.paddyAt(d)) return void c.copy(J.bund).lerp(J.grass[1], smooth(66, 74, d) * 0.5)
    const forest = smooth(half + 3.5, half + 8, d)
    if (forest <= 0) return
    const f = tmpC.copy(J.floor[0]).lerp(J.floor[1], k)
    if (fbm(x / 9, z / 9, this.look.seed + 5) > 0.35) f.lerp(J.floor[2], 0.6)
    // (Each cleared field its own crop: dry corn, young corn, fresh grass, bare earth.)
    if (this.open(x, z) && d > 60) f.copy(J.field[Math.floor(((fbm(x / 40, z / 40, this.look.seed + 23) + 1) / 2) * 4) % 4])
    c.lerp(f, forest)
  }
}

/** The Nan look's ground colors. */
const J = {
  grass: [new Color('#98CF58'), new Color('#82C04C')],
  floor: [new Color('#4F8A3E'), new Color('#5F9A43'), new Color('#447E3C')],
  field: [new Color('#D9C78E'), new Color('#BFCB7C'), new Color('#A9D37A'), new Color('#C9A27E')],
  bund: new Color('#7FBF68'),
}
const tmpC = new Color()

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
  /** The road as drawn: with the Nan look, longer than the one she drives (it runs on past both ends); its `s` is the
   *  drive's plus `s0`. */
  drawn: Road
  s0: number
}

/** What to keep clear of trees and houses (a stop, the waterfall, the market): `r` meters round `lat` meters left of the
 *  road at `s` (the drive's own s). */
export interface ClearSpot {
  s: number
  lat: number
  r: number
}

export function buildRoadScene(road: Road, look: RoadLook, bag: Bag, clear: ClearSpot[] = []): RoadScene {
  const root = new Group()
  // (The Nan look: the road runs on into the hills past both ends, drawn and planted round like the rest of it.)
  const { drawn, s0 } = look.jungle ? runOn(road, look.runOn ?? 0.2) : { drawn: road, s0: 0 }
  const field = new HeightField(drawn, look, s0)
  root.add(field.mesh(bag))
  root.add(ribbon(drawn, look, bag))

  // ---- Guard rails where the ground drops away beside the road ----
  const half = drawn.half
  const railSet = new Set<string>()
  const railParts: BufferGeometry[] = []
  const POST_EVERY = 4
  for (const side of [1, -1]) {
    let prev: Vector3 | null = null
    for (let s = 0; s <= drawn.length; s += POST_EVERY) {
      const out = drawn.spotAt(s, side * (half + 5))
      const drop = drawn.sampleAt(s).y - field.at(out.x, out.z)
      const onBridge = look.river && Math.abs(s - s0 - look.river.s) < look.river.width / 2 + 4
      if (drop < 1.6 && !onBridge) {
        prev = null
        continue
      }
      railSet.add(`${side}:${Math.round(s / POST_EVERY)}`)
      const p = drawn.spotAt(s, side * (half + 0.55))
      const at = new Vector3(p.x, p.y, p.z)
      if (look.jungle) {
        // A W-beam on steel posts: the rail's two ridges catch the light, a groove between; an amber reflector now and then.
        railParts.push(P.box(0.14, 0.8, 0.14, '#A9ADBC', { at: [at.x, at.y + 0.4, at.z] }))
        if (Math.round(s / POST_EVERY) % 3 === 0) railParts.push(P.box(0.16, 0.12, 0.16, '#FFB23D', { at: [at.x, at.y + 0.86, at.z] }))
        if (prev) {
          const a = prev.clone().addScaledVector(new Vector3(-drawn.sampleAt(s - POST_EVERY).lx, 0, -drawn.sampleAt(s - POST_EVERY).lz), side * 0.06)
          const c = at.clone().addScaledVector(new Vector3(-drawn.sampleAt(s).lx, 0, -drawn.sampleAt(s).lz), side * 0.06)
          railParts.push(beam(a.clone().setY(a.y + 0.7), c.clone().setY(c.y + 0.7), 0.08, 0.36, '#E8EBF2'))
          railParts.push(beam(a.clone().setY(a.y + 0.7), c.clone().setY(c.y + 0.7), 0.1, 0.06, '#B8BCCA'))
        }
      } else if (prev) railParts.push(beam(prev.clone().setY(prev.y + 0.62), at.clone().setY(at.y + 0.62), 0.07, 0.3, RAIL))
      if (!look.jungle) railParts.push(P.box(0.12, 0.85, 0.12, POST, { at: [at.x, at.y + 0.42, at.z] }))
      prev = at
    }
  }
  if (railParts.length) root.add(solid(merge(railParts), bag, 2))
  const railed = (s: number, side: number) => railSet.has(`${side}:${Math.round((s + s0) / POST_EVERY)}`)

  // ---- Chevron signs round the sharp bends, on the outside, facing her as she comes ----
  const signs: BufferGeometry[] = []
  for (let s = 8; s < drawn.length - 8 && look.signs !== false; s += 7) {
    const k = drawn.bendAhead(s - 6, 12) / 12
    if (Math.abs(k) < 1 / 38) continue
    const side = -Math.sign(k)
    const p = drawn.spotAt(s, side * (half + 1.7))
    const t = drawn.sampleAt(s)
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

  const rand = rng(look.seed * 31 + 5)
  const b = drawn.bounds(150)
  if (look.jungle) {
    // ---- The Nan look: villages, power poles, kilometer stones, the forest, the far ridges ----
    const clears: Clear[] = clear.map((c) => {
      const p = drawn.spotAt(c.s + s0, c.lat)
      return { x: p.x, z: p.z, r: c.r }
    })
    if (look.river) {
      const r = drawn.spotAt(look.river.s + s0)
      const t = drawn.sampleAt(look.river.s + s0)
      clears.push({ x: r.x, z: r.z, r: 0, across: { tx: t.tx, tz: t.tz, w: look.river.width / 2 + 3 } })
    }
    if (look.villages?.length) {
      const v = buildVillages(drawn, field, look.villages.map((v) => ({ ...v, s: v.s + s0 })), look.seed, bag)
      root.add(v.root)
      clears.push(...v.clears)
    }
    if (look.paddies && !look.terraces) root.add(paddyFields(field, look, clears, bag))
    root.add(roadside(drawn, field, railed, s0, clears, bag))
    root.add(buildForest(drawn, field, look, clears, [s0, s0 + road.length], bag))
    root.add(buildRidges(b, drawn.bounds().y0, look.seed, bag))
  } else {
    // ---- Trees on the hills (not on the road, the paddies or in the river) ----
    const trees: BufferGeometry[] = []
    for (let n = 0, tries = 0; n < look.trees && tries < look.trees * 12; tries++) {
      const x = b.x0 + rand() * (b.x1 - b.x0)
      const z = b.z0 + rand() * (b.z1 - b.z0)
      const near = drawn.locate(x, z)
      if (near.d < half + 6 || (look.paddies && near.d < 70)) continue
      if (look.river) {
        const r = drawn.spotAt(look.river.s)
        const p = drawn.sampleAt(look.river.s)
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
    const { y0 } = drawn.bounds()
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + rand() * 0.3
      const r = R + rand() * 90
      const h = 110 + rand() * 120
      far.push(P.cone(70 + rand() * 60, h, ['#86BFA0', '#7AB497', '#93C7A8'][i % 3], { at: [cx + Math.cos(a) * r, y0 - 10 + h / 2, cz + Math.sin(a) * r] }, 9))
    }
    root.add(solid(merge(far), bag, 0))
  }

  // ---- A river under a bridge ----
  if (look.river) {
    const r = drawn.spotAt(look.river.s + s0)
    const p = drawn.sampleAt(look.river.s + s0)
    const water = new Mesh(bag.add(P.box(look.river.width + 6, 0.1, 900, '#ffffff', { at: [0, 0, 0] })), toon(look.jungle ? '#8FC9C2' : '#86CBE6'))
    water.position.set(r.x, -1.6, r.z)
    water.rotation.y = Math.atan2(p.tx, p.tz) + Math.PI / 2
    root.add(water)
    const bridge: BufferGeometry[] = []
    const w = look.river.width / 2 + 4
    const from = look.river.s + s0
    for (const side of [1, -1])
      for (let s = from - w; s < from + w; s += 2) {
        const a = drawn.spotAt(s, side * (half + 0.6))
        const c = drawn.spotAt(s + 2, side * (half + 0.6))
        bridge.push(beam(new Vector3(a.x, a.y + 0.9, a.z), new Vector3(c.x, c.y + 0.9, c.z), 0.12, 0.14, PAL.cream))
        bridge.push(P.box(0.14, 0.9, 0.14, PAL.cream, { at: [a.x, a.y + 0.45, a.z] }))
      }
    // The deck under the road.
    const a = drawn.spotAt(from - w)
    const c = drawn.spotAt(from + w)
    bridge.push(beam(new Vector3(a.x, a.y - 0.45, a.z), new Vector3(c.x, c.y - 0.45, c.z), half * 2 + 1.6, 0.8, '#C9C3D8'))
    root.add(solid(merge(bridge), bag, 2))
  }

  return { root, field, railed, drawn, s0 }
}

/** The road running on past both ends (the Nan look): a long way on from the start and the stop, bending gently away from
 *  the middle of the land and leveling off, so it goes on round a hill instead of stopping dead. The first point added
 *  at each end is exactly where the spline carries on by itself, so the part she drives is drawn exactly where it was. */
function runOn(road: Road, bend: number): { drawn: Road; s0: number } {
  const pts = road.points
  const n = pts.length
  const b = road.bounds()
  const cx = (b.x0 + b.x1) / 2
  const cz = (b.z0 + b.z1) / 2
  const away = (from: RoadPoint, prev: RoadPoint): RoadPoint[] => {
    const out: RoadPoint[] = []
    let [x, z, y] = from
    let dx = from[0] - prev[0]
    let dz = from[1] - prev[1]
    const len = Math.hypot(dx, dz) || 1
    let grade = (from[2] - prev[2]) / len
    dx /= len
    dz /= len
    // (The spline's own next point first, then on in 26 m steps, turning a little further from the middle each time.)
    x += dx * len
    z += dz * len
    y += grade * len
    out.push([x, z, y])
    for (let k = 0; k < 5; k++) {
      const ox = x - cx
      const oz = z - cz
      const side = Math.sign(dx * oz - dz * ox) || 1
      const turn = bend * side
      const c = Math.cos(turn)
      const s = Math.sin(turn)
      ;[dx, dz] = [dx * c - dz * s, dx * s + dz * c]
      grade *= 0.7
      x += dx * 26
      z += dz * 26
      y += grade * 26
      out.push([x, z, y])
    }
    return out
  }
  const lead = away(pts[0], pts[1]).reverse()
  const tail = away(pts[n - 1], pts[n - 2])
  const drawn = new Road([...lead, ...pts, ...tail], road.half)
  return { drawn, s0: drawn.locate(pts[0][0], pts[0][1]).s }
}

/** The Nan look's paddies: the flat land beside the valley road cut into fields of every shape (a grid pulled about),
 *  each its own green (bright young rice, deeper older rice, one still flooded and shining like the sky), with a strip of
 *  grass bund between them (the ground showing through). One mesh. */
function paddyFields(field: HeightField, look: RoadLook, clears: Clear[], bag: Bag) {
  const C = 13
  const half = field.road.half
  const greens = ['#B4E66A', '#9BDB5C', '#86CF55', '#C5EC72', '#A4DD62', '#9ED4C4', '#78C452'].map((c) => new Color(c))
  const corner = (i: number, j: number): [number, number] => [field.x0 + i * C + (hash(i, j, look.seed) - 0.5) * C * 0.5, field.z0 + j * C + (hash(i, j, look.seed + 1) - 0.5) * C * 0.5]
  const pos: number[] = []
  const col: number[] = []
  const nx = Math.ceil(((field.nx - 1) * field.cell) / C)
  const nz = Math.ceil(((field.nz - 1) * field.cell) / C)
  for (let j = 0; j < nz; j++)
    for (let i = 0; i < nx; i++) {
      const q = [corner(i, j), corner(i + 1, j), corner(i + 1, j + 1), corner(i, j + 1)]
      const cx = (q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4
      const cz = (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4
      if (q.some(([x, z]) => field.dist(x, z) < half + 3 || !field.paddyAt(field.dist(x, z) + 2))) continue
      if (clears.some((c) => (c.across ? Math.abs((cx - c.x) * c.across.tx + (cz - c.z) * c.across.tz) < c.across.w + 4 : Math.hypot(cx - c.x, cz - c.z) < c.r + 6))) continue
      // (Pulled in from the bunds.)
      const v = q.map(([x, z]): V3 => {
        const dx = cx - x
        const dz = cz - z
        const l = Math.hypot(dx, dz) || 1
        const px = x + (dx / l) * 0.7
        const pz = z + (dz / l) * 0.7
        return [px, field.at(px, pz) + 0.07, pz]
      })
      const c = greens[Math.floor(hash(i, j, look.seed + 2) * greens.length)]
      for (const k of [0, 2, 1, 0, 3, 2]) {
        pos.push(...v[k])
        col.push(c.r, c.g, c.b)
      }
    }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  g.setAttribute('color', new BufferAttribute(new Float32Array(col), 3))
  g.computeVertexNormals()
  return new Mesh(bag.add(g), toon('#ffffff', true))
}

/** Along the road (the Nan look): concrete power poles on one side with three sagging wires, and a white kilometer stone
 *  with a red cap every so often on her side. Kept clear of the rails, the bridge and the clear spots. */
function roadside(road: Road, field: HeightField, railed: (s: number, side: number) => boolean, s0: number, clears: Clear[], bag: Bag) {
  const half = road.half
  const g = new Group()
  const parts: BufferGeometry[] = []
  const wires: BufferGeometry[] = []
  const free = (x: number, z: number, r: number) => !clears.some((c) => (c.across ? Math.abs((x - c.x) * c.across.tx + (z - c.z) * c.across.tz) < c.across.w + r : Math.hypot(x - c.x, z - c.z) < c.r + r))
  // The poles: every 32 m on the right (the oncoming side), standing back past the grass; none round the hairpins (the
  // wires would cut across the bend, and the road).
  const side = -1
  const SPAN = 32
  let last: Vector3[] | null = null
  for (let s = 6; s < road.length - 4; s += SPAN) {
    const p = road.spotAt(s, side * (half + 6.4))
    const t = road.sampleAt(s)
    const y = field.at(p.x, p.z)
    if (!free(p.x, p.z, 2) || t.y - y > 6 || Math.abs(road.bendAhead(s - SPAN, SPAN * 2)) > 0.5) {
      last = null
      continue
    }
    const H = 8.5
    const yaw = Math.atan2(t.tx, t.tz)
    parts.push(placed([P.cyl(0.13, 0.2, H, '#D9D5DF', { at: [0, H / 2, 0] }, 6), P.box(2.2, 0.16, 0.16, '#C9C4D0', { at: [0, H - 0.5, 0] }), ...[-0.95, 0, 0.95].map((x) => P.cyl(0.05, 0.05, 0.22, '#F4F1F7', { at: [x, H - 0.3, 0] }, 5))], p.x, y, p.z, yaw))
    const tops = [-0.95, 0, 0.95].map((x) => new Vector3(p.x + Math.cos(yaw) * x, y + H - 0.2, p.z - Math.sin(yaw) * x))
    if (last) {
      // Sagging between the poles, in short straight pieces.
      for (let w = 0; w < 3; w++) {
        const a = last[w]
        const c = tops[w]
        const N = 6
        for (let i = 0; i < N; i++) {
          const at = (u: number) => new Vector3(a.x + (c.x - a.x) * u, a.y + (c.y - a.y) * u - Math.sin(u * Math.PI) * 0.9, a.z + (c.z - a.z) * u)
          wires.push(beam(at(i / N), at((i + 1) / N), 0.04, 0.04, '#4A4252'))
        }
      }
    }
    last = tops
  }
  // Kilometer stones (a toy's kilometer: one every 120 m) on her side, where there's no rail.
  for (let s = 40; s < road.length - 20; s += 120) {
    if (railed(s - s0, 1)) continue
    const p = road.spotAt(s, half + 1.6)
    const t = road.sampleAt(s)
    const y = field.at(p.x, p.z)
    parts.push(placed([P.rbox(0.42, 0.75, 0.2, 0.08, '#FBFAFF', { at: [0, 0.37, 0] }), P.rbox(0.44, 0.22, 0.22, 0.08, '#E8584F', { at: [0, 0.78, 0] })], p.x, y, p.z, Math.atan2(t.tx, t.tz) + Math.PI / 2))
  }
  if (parts.length) g.add(solid(merge(parts), bag, 2))
  if (wires.length) g.add(solid(merge(wires), bag, 0))
  return g
}

/** The road itself: strips across it (verge, edge line, lane, the dashed middle, lane, edge line, verge), one mesh. */
function ribbon(road: Road, look: RoadLook, bag: Bag) {
  const h = road.half
  // Across the road from right to left, with each strip's color (a function of `s` for the dashes).
  let cuts = [-(h + 1.5), -h, -h + 0.2, -0.09, 0.09, h - 0.2, h, h + 1.5]
  let color = (j: number, s: number) => [VERGE, LINE, ASPHALT, Math.floor(s / 3) % 2 ? ASPHALT : MIDDLE, ASPHALT, LINE, VERGE][j]
  if (look.jungle) {
    // The Nan look: grass, a strip of concrete, a white edge line inset from it, dark asphalt, the yellow middle.
    cuts = [-(h + 1.5), -(h + 0.25), -h, -h + 0.35, -h + 0.55, -0.1, 0.1, h - 0.55, h - 0.35, h, h + 0.25, h + 1.5]
    const mid = (s: number) => (look.middle === 'dashed' && Math.floor(s / 3) % 2 ? J_ASPHALT : J_MIDDLE)
    color = (j: number, s: number) => [J_VERGE, J_KERB, J_ASPHALT, LINE, J_ASPHALT, mid(s), J_ASPHALT, LINE, J_ASPHALT, J_KERB, J_VERGE][j]
  }
  const last = cuts.length - 2
  const lift = (j: number) => (j === 0 || j === last ? -0.03 : 0.03)
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
      const y1 = j === last ? -0.2 : lift(j)
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

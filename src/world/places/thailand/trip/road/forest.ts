// The Nan look's forest (build.ts, `look.jungle`; Dad's photos of the hills round Nan, 2026-10-28): the hillsides deep in
// a leafy broadleaf canopy packed crown to crown, every crown its own green (lime, olive, deep green), with now and then
// one in pink (Chomphu Phu Kha, the flower of Doi Phu Kha) or gold (ratchaphruek). Close to the road: clumps of bamboo
// arching over, banana plants with big paddle leaves, bushes and tufts of tall grass; further off the big trees, tall
// ones poking up through the canopy; far off the canopy alone. Near the road the trees stay short enough that the
// camera behind the Pajero sees over them. Palms by the villages and out in the paddies.
//
// The trees' crowns and the bushes are painted cards that face the camera (canopy.ts: the trick games use for forests,
// Dad's ask, 2026-10-28), on a 3D trunk. The bamboo, bananas, palms and grass are shapes. Each kind is drawn many times
// at once (an InstancedMesh, one per tile of ground so tiles off screen aren't drawn). No ink outlines on the plants:
// Dad likes the trees without the black border (2026-10-29); a kind could still ask for one with `px`.
import { BufferAttribute, Color, ConeGeometry, CylinderGeometry, Euler, Group, InstancedBufferAttribute, InstancedMesh, Matrix4, MeshToonMaterial, PlaneGeometry, Quaternion, SphereGeometry, Vector3, type BufferGeometry } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { Bag } from '../../../../engine3d/dispose'
import { hullGeometry, instancedOutlineMaterial } from '../../../../engine3d/outline'
import { toonGradient } from '../../../../engine3d/toon'
import { fbm, rng, type HeightField, type RoadLook } from './build'
import { BAMBOO_W, CROWN, crownMaterial, FERN_H, FERN_W, UPRIGHT, type CrownId } from './canopy'
import type { Road } from './road'

/** Somewhere to keep clear of plants: `r` meters round (x, z), or (`across`) a strip `w` meters either side of a line
 *  through (x, z) running across `t` (a river). */
export interface Clear {
  x: number
  z: number
  r: number
  across?: { tx: number; tz: number; w: number }
}

type V3 = [number, number, number]
interface Opts {
  at?: V3
  /** Pitch, yaw, roll (radians), applied yaw last: a part leaning `pitch` toward +z, then turned. */
  rot?: V3
  scale?: V3
}

/** A part of a plant: its shade (multiplied by the plant's green when `tint` is 1) and its place. Kept indexed (the
 *  instanced shapes are drawn thousands of times: shared corners keep them cheap). */
function part(g: BufferGeometry, shade: string, tint: number, o: Opts = {}) {
  for (const name of Object.keys(g.attributes)) if (name !== 'position' && name !== 'normal') g.deleteAttribute(name)
  const [p, y, r] = o.rot ?? [0, 0, 0]
  g.applyMatrix4(new Matrix4().compose(new Vector3(...(o.at ?? [0, 0, 0])), new Quaternion().setFromEuler(new Euler(p, y, r, 'YXZ')), new Vector3(...(o.scale ?? [1, 1, 1]))))
  const c = new Color(shade)
  const n = g.attributes.position.count
  const col = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) col.set([c.r, c.g, c.b], i * 3)
  g.setAttribute('color', new BufferAttribute(col, 3))
  g.setAttribute('tint', new BufferAttribute(new Float32Array(n).fill(tint), 1))
  return g
}

const BARK = '#8A6B5A'
const join = (parts: BufferGeometry[]) => {
  const g = mergeGeometries(parts, false)
  for (const p of parts) p.dispose()
  return g!
}

/** The plants, each about its real size in meters (scaled 0.7-1.4 per plant). `h`: how tall. A tree's trunk and limbs
 *  also carry `spots`: where its clusters of leaves go ([x, y, z, radius], m), round `mid`, its crown's middle. */
interface Kind {
  geo: BufferGeometry
  h: number
  /** Ink outline width (0: none, the far canopy). */
  px: number
  colors: string[]
  spots?: [number, number, number, number][]
  mid?: Vector3
}

/** A tree's trunk and limbs (one of a few shapes, each tree turned its own way): the trunk forks into limbs reaching up
 *  and out, each with a side branch; a cluster of leaves on every tip, more over the top, a couple of big ones inside to
 *  fill the crown. `tall`: a long bare trunk and limbs spreading wide and flat at the top. */
function limbs(seed: number, tall: boolean): Kind {
  const rand = rng(seed)
  const parts: BufferGeometry[] = []
  const spots: [number, number, number, number][] = []
  const H = tall ? 10 + rand() * 1.2 : 3.2 + rand() * 0.9
  parts.push(part(new CylinderGeometry(tall ? 0.24 : 0.2, tall ? 0.42 : 0.34, H + 0.4, 6), tall ? '#6E5E4E' : BARK, 0, { at: [0, (H + 0.4) / 2, 0] }))
  /** A branch from `a` reaching `len` m along elevation `e` (from level) and heading `yaw`; returns its tip. */
  const branch = (a: Vector3, yaw: number, e: number, len: number, r: number): Vector3 => {
    const dir = new Vector3(Math.cos(e) * Math.sin(yaw), Math.sin(e), Math.cos(e) * Math.cos(yaw))
    const b = a.clone().addScaledVector(dir, len)
    const mid = a.clone().add(b).multiplyScalar(0.5)
    // (Open-ended: the ends are hidden in the trunk and the leaves.)
    parts.push(part(new CylinderGeometry(r * 0.55, r, len, 5, 1, true), BARK, 0, { at: [mid.x, mid.y, mid.z], rot: [Math.PI / 2 - e, yaw, 0] }))
    return b
  }
  const n = 5
  let top = H
  for (let i = 0; i < n; i++) {
    const yaw = (i / n) * Math.PI * 2 + rand() * 0.7
    const e = tall ? 0.3 + rand() * 0.3 : 0.55 + rand() * 0.45
    const len = tall ? 4 + rand() * 1.6 : 2.3 + rand() * 1.4
    const from = new Vector3(0, H * (tall ? 0.94 + rand() * 0.06 : 0.75 + rand() * 0.25), 0)
    const tip = branch(from, yaw, e, len, tall ? 0.17 : 0.14)
    spots.push([tip.x, tip.y + 0.3, tip.z, 1.9 + rand() * 0.5])
    // A side branch from partway along, up and out.
    const at = from.clone().lerp(tip, 0.5 + rand() * 0.2)
    const side = branch(at, yaw + (rand() < 0.5 ? -0.7 : 0.7), e + 0.35, len * 0.55, 0.08)
    spots.push([side.x, side.y + 0.25, side.z, 1.5 + rand() * 0.4])
    top = Math.max(top, tip.y, side.y)
  }
  // Over the top, and filling the inside of the crown.
  spots.push([(rand() - 0.5) * 1.2, top + (tall ? 0.8 : 1.3), (rand() - 0.5) * 1.2, tall ? 2.1 : 2.3])
  spots.push([0, H + (tall ? 0.9 : 1.6), 0, tall ? 2.6 : 2.4])
  const mid = spots.reduce((m, [x, y, z]) => m.add(new Vector3(x, y, z)), new Vector3()).multiplyScalar(1 / spots.length)
  return { geo: join(parts), h: top + 2.2, px: 0, colors: ['#FFFFFF'], spots, mid }
}

function kinds() {
  // The trees' trunks and limbs (their leaves are painted cards on the limbs' tips, see `tree`): three shapes for the
  // broadleaf trees, one for the tall ones standing up through the canopy.
  const limbs0 = limbs(11, false)
  const limbs1 = limbs(23, false)
  const limbs2 = limbs(37, false)
  const limbsTall = limbs(53, true)
  // A coconut palm: a curving trunk, a crown of long drooping fronds, three coconuts.
  const palmParts: BufferGeometry[] = []
  let px = 0
  for (let i = 0; i < 3; i++) {
    palmParts.push(part(new CylinderGeometry(0.17, 0.22, 3.1, 6), '#A88E74', 0, { at: [px + 0.12, 1.5 + i * 3, 0], rot: [0, 0, -0.08 - i * 0.04] }))
    px += 0.25 + i * 0.12
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const droop = Math.PI / 2 + 0.3 + (i % 2) * 0.25
    palmParts.push(part(new ConeGeometry(0.55, 4.2, 4), '#FFFFFF', 1, { at: [px + Math.sin(a) * Math.sin(droop) * 2.1, 9.2 + Math.cos(droop) * 2.1, Math.cos(a) * Math.sin(droop) * 2.1], rot: [droop, a, 0], scale: [1, 1, 0.22] }))
  }
  for (let i = 0; i < 3; i++) palmParts.push(part(new SphereGeometry(0.22, 6, 4), '#8A6A3A', 0, { at: [px + Math.sin(i * 2.1) * 0.3, 8.9, Math.cos(i * 2.1) * 0.3] }))
  const palm: Kind = { geo: join(palmParts), h: 10, px: 0, colors: ['#7DBA5A', '#8CC463', '#72B256'] }
  // A tuft of tall grass.
  const blades: BufferGeometry[] = []
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + (i % 2) * 0.35
    const lean = 0.12 + (i % 3) * 0.17
    const L = 1.3 + (i % 4) * 0.15
    blades.push(part(new ConeGeometry(0.07, L, 3), i % 2 ? '#FFFFFF' : '#E8EFD8', 1, { at: [Math.sin(a) * Math.sin(lean) * L * 0.5, Math.cos(lean) * L * 0.5, Math.cos(a) * Math.sin(lean) * L * 0.5], rot: [lean, a, 0], scale: [1, 1, 0.4] }))
  }
  const tuft: Kind = { geo: join(blades), h: 1.5, px: 0, colors: ['#8FA55A', '#7E9A4C', '#A2AC62', '#B3AE6E'] }
  return { limbs0, limbs1, limbs2, limbsTall, palm, tuft }
}
type KindId = keyof ReturnType<typeof kinds>

/** The trees built of leaf clusters on limbs: their trunk shapes and the greens their clusters can be. */
const TREES = {
  broadleaf: { trunks: ['limbs0', 'limbs1', 'limbs2'], greens: ['clFresh', 'clMid', 'clOlive', 'clDark', 'clMid'] },
  tall: { trunks: ['limbsTall'], greens: ['clMid', 'clDark', 'clOlive'] },
} as const satisfies Record<string, { trunks: readonly KindId[]; greens: readonly CrownId[] }>
/** The plants that are a single painted card: how tall (m, at scale 1), the card's middle above the ground and its size,
 *  and which pictures it can be. The far forest's whole crowns, bushes, and the upright ferns, bananas and bamboo. */
const CROWNS = {
  canopy: { h: 9.5, y: 5.4, w: 10, ch: 9.6, tiles: ['crownA', 'crownB', 'crownA'], upright: false },
  far: { h: 11, y: 6, w: 12.5, ch: 12, tiles: ['crownA', 'crownB'], upright: false },
  shrub: { h: 2.3, y: 1.05, w: 3.2, ch: 3, tiles: ['bush'], upright: false },
  // (Standing on the ground: the card's middle is half its height up.)
  fern: { h: FERN_H, y: FERN_H / 2, w: FERN_W, ch: FERN_H, tiles: ['fern'], upright: true },
  banana: { h: 4.6, y: 2.3, w: 4.2, ch: 4.6, tiles: ['banana', 'banana2'], upright: true },
  bamboo: { h: 9.5, y: 4.75, w: BAMBOO_W, ch: 9.5, tiles: ['bamboo', 'bamboo2'], upright: true },
} as const satisfies Record<string, { h: number; y: number; w: number; ch: number; tiles: readonly CrownId[]; upright: boolean }>
type TreeId = keyof typeof TREES | keyof typeof CROWNS

/** The toon look with a per-plant tint: the leaves take the plant's color, the trunk keeps its own (the `tint`
 *  attribute: 1 tinted, 0 not). */
let tinted: MeshToonMaterial | null = null
function tintedToon() {
  if (tinted) return tinted
  const m = new MeshToonMaterial({ vertexColors: true, gradientMap: toonGradient() })
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float tint;').replace(
      '#include <color_vertex>',
      `vColor = vec3(1.0);
      #ifdef USE_COLOR
        vColor *= color;
      #endif
      #ifdef USE_INSTANCING_COLOR
        vColor *= mix(vec3(1.0), instanceColor.rgb, tint);
      #endif`,
    )
  }
  m.customProgramCacheKey = () => 'tinted-toon'
  return (tinted = m)
}

/** Ground tiles (m): each kind of plant is one InstancedMesh per tile, so the tiles out of view aren't drawn. */
const TILE = 160
/** Plants this close to the road (m) get the ink outline. */
const INK = 40

/** `span`: the part of the road she drives (s from, to); past it (the road running on) only the simple canopy. */
export function buildForest(road: Road, field: HeightField, look: RoadLook, clears: Clear[], span: [number, number], bag: Bag): Group {
  const rand = rng(look.seed * 97 + 13)
  const K = kinds()
  const half = road.half
  const placed = new Map<KindId, { m: Matrix4; c: Color; ink: boolean }[]>()
  const q = new Quaternion()
  const up = new Vector3(0, 1, 0)
  const blocked = (x: number, z: number, r: number) =>
    clears.some((c) => (c.across ? Math.abs((x - c.x) * c.across.tx + (z - c.z) * c.across.tz) < c.across.w + r : Math.hypot(x - c.x, z - c.z) < c.r + r))
  const bloom = look.bloom ?? 0
  /** The painted crowns: where each card's middle is, its size, its picture and its tint. */
  const crowns: { at: Vector3; w: number; h: number; tile: number; c: Color }[] = []
  /** A shape (a trunk, a palm, grass) at (x, y, z), `k` times its size, turned `yaw`. */
  const shape = (id: KindId, x: number, y: number, z: number, k: number, yaw = rand() * Math.PI * 2, color?: string) => {
    const kind = K[id]
    const c = new Color(color ?? kind.colors[Math.floor(rand() * kind.colors.length)])
    c.offsetHSL((rand() - 0.5) * 0.03, 0, (rand() - 0.5) * 0.07)
    q.setFromAxisAngle(up, yaw)
    const list = placed.get(id) ?? []
    list.push({ m: new Matrix4().compose(new Vector3(x, y - 0.15 * k, z), q, new Vector3(k, k, k)), c, ink: field.dist(x, z) < INK })
    placed.set(id, list)
  }
  const sun = new Vector3(-0.35, 0.85, 0.4).normalize()
  /** A tree of leaf clusters: its trunk and limbs, turned its own way, and a card of leaves on every spot, each lit by
   *  where it sits in the crown: on top and toward the sun brighter and warmer, low down and deep inside dark. All its
   *  clusters one green, now and then a fresher young one; `tile` a flowering tree's. */
  const tree = (id: keyof typeof TREES, x: number, y: number, z: number, k: number, tile?: CrownId) => {
    const t = TREES[id]
    const trunk = t.trunks[Math.floor(rand() * t.trunks.length)]
    const kind = K[trunk]
    const yaw = rand() * Math.PI * 2
    shape(trunk, x, y, z, k, yaw)
    const green = tile ?? t.greens[Math.floor(rand() * t.greens.length)]
    const light = 0.94 + rand() * 0.14
    const cos = Math.cos(yaw)
    const sin = Math.sin(yaw)
    const mid = kind.mid!
    const reach = Math.max(...kind.spots!.map(([sx, sy, sz]) => Math.hypot(sx - mid.x, sy - mid.y, sz - mid.z)))
    // (Turned with the trunk: a turn of `yaw` about up.)
    const mx = mid.x * cos + mid.z * sin
    const mz = -mid.x * sin + mid.z * cos
    for (const [sx, sy, sz, r] of kind.spots!) {
      const px = sx * cos + sz * sin
      const pz = -sx * sin + sz * cos
      const n = tmpV.set(px - mx, sy - mid.y, pz - mz)
      const out = n.length() / reach
      n.normalize()
      const lit = Math.max(0, n.dot(sun))
      const b = (0.62 + 0.22 * (n.y * 0.5 + 0.5) + 0.3 * lit) * (0.74 + 0.26 * out) * light
      // Warm where the sun catches it, cool and dim in the shade.
      const c = new Color(b * (1 + 0.06 * lit), b, b * (0.94 - 0.08 * lit))
      const pick = !tile && rand() < 0.12 ? 'clYoung' : green
      const w = r * 2.6 * k * (0.9 + rand() * 0.2)
      crowns.push({ at: new Vector3(x + px * k, y + sy * k, z + pz * k), w: rand() < 0.5 ? -w : w, h: r * 2.6 * k * (0.9 + rand() * 0.2), tile: CROWN[pick], c })
    }
  }
  /** Plants one, `k` times its size, its top kept under `cap` meters (a smaller one, or none if it would be tiny): a
   *  shape, a tree of leaf clusters, or a painted card (`tile`: a flowering tree's leaves instead of a green). */
  const plant = (id: KindId | TreeId, x: number, z: number, k: number, cap = Infinity, tile?: CrownId) => {
    const y = field.at(x, z)
    const h = id in TREES ? K[TREES[id as keyof typeof TREES].trunks[0]].h : id in CROWNS ? CROWNS[id as keyof typeof CROWNS].h : K[id as KindId].h
    if (y + h * k > cap) k = (cap - y) / h
    if (k < 0.5) return false
    if (id in TREES) return tree(id as keyof typeof TREES, x, y, z, k, tile), true
    if (!(id in CROWNS)) return shape(id as KindId, x, y, z, k), true
    const t = CROWNS[id as keyof typeof CROWNS]
    // (Every card a little different: its size, how wide, how light; mirrored half the time.)
    const w = t.w * k * (0.9 + rand() * 0.2) * (rand() < 0.5 ? -1 : 1)
    const ch = t.ch * k * (t.upright ? 1 : 0.9 + rand() * 0.2)
    const pick = (t.tiles as readonly CrownId[]).includes(tile as CrownId) ? tile! : t.tiles[Math.floor(rand() * t.tiles.length)]
    // (The far crowns a little darker and duller than the near trees' sunlit clusters, as they'd be in the haze.)
    const b = (id === 'far' || id === 'canopy' ? 0.92 : 0.95) + rand() * 0.16
    crowns.push({ at: new Vector3(x, y + (t.y - (t.upright ? 0.12 : 0)) * k, z), w, h: ch, tile: CROWN[pick] + (t.upright ? UPRIGHT : 0), c: new Color(b, b, b) })
    return true
  }
  /** How tall a plant may be here: near the road low enough for the camera behind the Pajero to see over it. */
  const capAt = (x: number, z: number, d: number) => field.roadY(x, z) + 9 + Math.max(0, d - half - 6) * 2.2
  const bigTree = (d: number): { id: TreeId; color?: CrownId } => {
    const r = rand()
    if (r < bloom * 0.6) return { id: 'broadleaf', color: 'clPink' }
    if (r < bloom) return { id: 'broadleaf', color: 'clGold' }
    return { id: d > 24 && rand() < 0.08 ? 'tall' : 'broadleaf' }
  }

  const x1 = field.x0 + (field.nx - 1) * field.cell
  const z1 = field.z0 + (field.nz - 1) * field.cell
  // Close in (every 4.2 m): the trees of leaf clusters, and the undergrowth.
  const G = 4.2
  for (let gz = field.z0; gz < z1; gz += G)
    for (let gx = field.x0; gx < x1; gx += G) {
      const x = gx + rand() * G
      const z = gz + rand() * G
      const d = field.dist(x, z)
      if (d < half + 2 || d > 110) continue
      if (blocked(x, z, 2)) continue
      const cap = capAt(x, z, d)
      // The verge: tall grass and ferns, and bushes where the Pajero doesn't go. (Low things never hide the road: no cap.)
      const s = field.roadS(x, z)
      const seen = s > span[0] - 30 && s < span[1] + 50
      if (d < half + 5.5) {
        const r = rand()
        // (A thick strip of grass and ferns, a few to a spot, thicker away from the road's edge.)
        for (let u = 0; u < (d > half + 3.2 ? 3 : 1); u++) {
          const px = x + (rand() - 0.5) * G
          const pz = z + (rand() - 0.5) * G
          if (field.dist(px, pz) < half + 1.8) continue
          if (rand() < 0.55) plant('tuft', px, pz, 0.8 + rand() * 0.7)
          else if (!field.paddyAt(d)) plant('fern', px, pz, 0.8 + rand() * 0.6)
        }
        if (r > 0.55 && d > half + 4.2 && !field.paddyAt(d)) plant(rand() < 0.7 ? 'shrub' : 'banana', x + rand() - 0.5, z + rand() - 0.5, 0.7 + rand() * 0.5)
        continue
      }
      if (field.paddyAt(d)) {
        // Out in the paddies, a palm here and there on the bunds.
        if (d > half + 8 && rand() < 0.012) plant('palm', x, z, 0.8 + rand() * 0.4, cap)
        continue
      }
      // (Where the road runs on past her part of it, only the simple canopy: she only glimpses it.)
      if (!seen) {
        if (rand() < 0.75 && !field.open(x, z)) plant('canopy', x, z, 0.8 + rand() * 0.6, cap)
        continue
      }
      if (field.open(x, z) && d > 60) {
        if (rand() < 0.03) plant('broadleaf', x, z, 0.8 + rand() * 0.5)
        continue
      }
      if (d < 38) {
        // (The first row by the road: more bananas, bamboo and bushes; then the big trees.)
        const edge = d < half + 12 ? 1 : 0.5
        const r = rand()
        if (r < 0.12 * edge + 0.04) plant('bamboo', x, z, 0.75 + rand() * 0.5, cap) || plant('banana', x, z, 1 + rand() * 0.3)
        else if (r < 0.26 * edge + 0.06) plant('banana', x, z, 0.8 + rand() * 0.4)
        else if (r < 0.36 * edge + 0.08) plant('shrub', x, z, 0.8 + rand() * 0.6)
        else {
          const t = bigTree(d)
          if (!plant(t.id, x, z, 0.75 + rand() * 0.55, cap, t.color)) {
            plant(rand() < 0.5 ? 'banana' : 'shrub', x, z, 0.9 + rand() * 0.4)
            plant('fern', x + (rand() - 0.5) * G, z + (rand() - 0.5) * G, 1 + rand() * 0.4)
          }
        }
        // (Thick undergrowth between the trees: bushes and ferns, a couple to a spot.)
        for (let u = 0; u < 2; u++) if (rand() < 0.55) plant(rand() < 0.5 ? 'shrub' : 'fern', x + (rand() - 0.5) * G, z + (rand() - 0.5) * G, 0.8 + rand() * 0.7)
      } else if (d < 56) {
        const t = bigTree(d)
        plant(rand() < 0.1 ? 'bamboo' : t.id, x, z, 0.8 + rand() * 0.6, cap, t.color)
        if (rand() < 0.35) plant(rand() < 0.5 ? 'shrub' : 'fern', x + (rand() - 0.5) * G, z + (rand() - 0.5) * G, 0.9 + rand() * 0.6)
      } else if (rand() < 0.8) {
        const t = bigTree(d)
        plant(t.id === 'tall' ? 'tall' : 'canopy', x, z, 0.85 + rand() * 0.6, Infinity, t.color)
      }
    }
  // Far off (every 8 m, out to where the haze takes over): the canopy alone.
  for (let gz = field.z0; gz < z1; gz += 8)
    for (let gx = field.x0; gx < x1; gx += 8) {
      const x = gx + rand() * 8
      const z = gz + rand() * 8
      const d = field.dist(x, z)
      if (d <= 110 || d > 280 || rand() < 0.12) continue
      if (field.open(x, z) || blocked(x, z, 4)) continue
      // (Thinner in patches, like the photos' hills.)
      if (fbm(x / 60, z / 60, look.seed + 31) < -0.45) continue
      plant('far', x, z, 0.85 + rand() * 0.6, Infinity, bigTree(d).color)
    }

  // ---- Into tiles, one InstancedMesh per kind per tile (plus its outline) ----
  const root = new Group()
  const mat = tintedToon()
  for (const [id, list] of placed) {
    const kind = K[id]
    const geo = bag.add(kind.geo)
    const hullGeo = kind.px > 0 ? bag.add(hullGeometry(kind.geo)) : null
    const tiles = new Map<string, typeof list>()
    for (const p of list) {
      const key = `${Math.floor(p.m.elements[12] / TILE)},${Math.floor(p.m.elements[14] / TILE)},${p.ink && !!hullGeo}`
      const t = tiles.get(key) ?? []
      t.push(p)
      tiles.set(key, t)
    }
    for (const t of tiles.values()) {
      const mesh = bag.add(new InstancedMesh(geo, mat, t.length))
      t.forEach((p, i) => {
        mesh.setMatrixAt(i, p.m)
        mesh.setColorAt(i, p.c)
      })
      mesh.computeBoundingSphere()
      root.add(mesh)
      if (hullGeo && t[0].ink) {
        const hull = bag.add(new InstancedMesh(hullGeo, instancedOutlineMaterial(kind.px), t.length))
        hull.instanceMatrix = mesh.instanceMatrix
        hull.computeBoundingSphere()
        root.add(hull)
      }
    }
  }
  // The painted crowns: one card shape, many cards per tile.
  const card = new PlaneGeometry(1, 1)
  const cardTiles = new Map<string, typeof crowns>()
  for (const p of crowns) {
    const key = `${Math.floor(p.at.x / TILE)},${Math.floor(p.at.z / TILE)}`
    const t = cardTiles.get(key) ?? []
    t.push(p)
    cardTiles.set(key, t)
  }
  const m = new Matrix4()
  for (const t of cardTiles.values()) {
    // (Each tile its own copy of the card: the picture each card shows rides on the geometry.)
    const geo = bag.add(card.clone())
    const mesh = bag.add(new InstancedMesh(geo, crownMaterial(), t.length))
    const tiles = new Float32Array(t.length)
    t.forEach((p, i) => {
      mesh.setMatrixAt(i, m.makeScale(p.w, p.h, 1).setPosition(p.at))
      mesh.setColorAt(i, p.c)
      tiles[i] = p.tile
    })
    geo.setAttribute('aTile', new InstancedBufferAttribute(tiles, 1))
    mesh.computeBoundingSphere()
    root.add(mesh)
  }
  card.dispose()
  for (const id of Object.keys(K) as KindId[]) if (!placed.has(id)) K[id].geo.dispose()
  root.userData.counts = { ...Object.fromEntries([...placed].map(([id, l]) => [id, l.length])), crowns: crowns.length }
  return root
}
const tmpV = new Vector3()

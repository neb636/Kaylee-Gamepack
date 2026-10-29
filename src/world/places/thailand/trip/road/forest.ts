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
import { BAMBOO_W, CROWN, crownMaterial, UPRIGHT, type CrownId } from './canopy'
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

/** The plants, each about its real size in meters (scaled 0.7-1.4 per plant). `h`: how tall. */
interface Kind {
  geo: BufferGeometry
  h: number
  /** Ink outline width (0: none, the far canopy). */
  px: number
  colors: string[]
}

function kinds() {
  // The trees' trunks (their crowns are painted cards, see CROWNS): a short one up into the crown, and the tall trees'
  // long bare one. (They stop inside the crown: above that they'd show in front of the leaves.)
  const trunk: Kind = {
    geo: join([part(new CylinderGeometry(0.2, 0.34, 3.4, 6), BARK, 0, { at: [0, 1.7, 0] })]),
    h: 3.4,
    px: 0,
    colors: ['#FFFFFF'],
  }
  const tallTrunk: Kind = {
    geo: join([part(new CylinderGeometry(0.24, 0.46, 10.8, 6), '#9C8070', 0, { at: [0, 5.4, 0] })]),
    h: 10.8,
    px: 0,
    colors: ['#FFFFFF'],
  }
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
  const tuft: Kind = { geo: join(blades), h: 1.5, px: 0, colors: ['#B4D879', '#A2CF6B', '#C6DF86', '#D3D58A'] }
  return { trunk, tallTrunk, palm, tuft }
}
type KindId = keyof ReturnType<typeof kinds>

/** The painted trees: how tall each is (m, at scale 1), its card's middle above the ground and its size, which trunk it
 *  stands on, and which pictures it can be. */
const CROWNS = {
  broadleaf: { h: 9.5, y: 5.8, w: 8.8, ch: 7.8, trunk: 'trunk', tiles: ['lime', 'green', 'deep', 'olive', 'green'], upright: false },
  tall: { h: 16, y: 12.8, w: 11.5, ch: 7.6, trunk: 'tallTrunk', tiles: ['wide'], upright: false },
  canopy: { h: 9.5, y: 5.6, w: 9.6, ch: 8.4, trunk: null, tiles: ['lime', 'green', 'deep', 'olive', 'deep'], upright: false },
  far: { h: 11, y: 6.2, w: 12.5, ch: 10.6, trunk: null, tiles: ['green', 'deep', 'olive', 'lime', 'deep'], upright: false },
  shrub: { h: 2.3, y: 1, w: 3, ch: 2.4, trunk: null, tiles: ['bush'], upright: false },
  // (Standing on the ground: the card's middle is half its height up.)
  banana: { h: 4.6, y: 2.3, w: 4.2, ch: 4.6, trunk: null, tiles: ['banana', 'banana2'], upright: true },
  bamboo: { h: 9.5, y: 4.75, w: BAMBOO_W, ch: 9.5, trunk: null, tiles: ['bamboo', 'bamboo2'], upright: true },
} as const satisfies Record<string, { h: number; y: number; w: number; ch: number; trunk: KindId | null; tiles: readonly CrownId[]; upright: boolean }>
type TreeId = keyof typeof CROWNS

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
  const shape = (id: KindId, x: number, y: number, z: number, k: number, color?: string) => {
    const kind = K[id]
    const c = new Color(color ?? kind.colors[Math.floor(rand() * kind.colors.length)])
    c.offsetHSL((rand() - 0.5) * 0.03, 0, (rand() - 0.5) * 0.07)
    q.setFromAxisAngle(up, rand() * Math.PI * 2)
    const list = placed.get(id) ?? []
    // (Outlined close to the road only: further off the ink would just be noise, and doubles the cost.)
    list.push({ m: new Matrix4().compose(new Vector3(x, y - 0.15 * k, z), q, new Vector3(k, k * (0.9 + rand() * 0.2), k)), c, ink: field.dist(x, z) < INK })
    placed.set(id, list)
  }
  /** Plants one, `k` times its size, its top kept under `cap` meters (a smaller one, or none if it would be tiny). A
   *  painted tree gets its trunk and its card (`tile`: a flowering one's picture instead of a green). */
  const plant = (id: KindId | TreeId, x: number, z: number, k: number, cap = Infinity, tile?: CrownId) => {
    const y = field.at(x, z)
    const h = id in CROWNS ? CROWNS[id as TreeId].h : K[id as KindId].h
    if (y + h * k > cap) k = (cap - y) / h
    if (k < 0.5) return false
    if (!(id in CROWNS)) return shape(id as KindId, x, y, z, k), true
    const t = CROWNS[id as TreeId]
    if (t.trunk) shape(t.trunk, x, y, z, k)
    // (Every crown a little different: its size, how wide, how light; an upright one mirrored half the time.)
    const w = t.w * k * (0.9 + rand() * 0.2) * (t.upright && rand() < 0.5 ? -1 : 1)
    const ch = t.ch * k * (t.upright ? 1 : 0.9 + rand() * 0.2)
    const pick = tile ?? t.tiles[Math.floor(rand() * t.tiles.length)]
    crowns.push({ at: new Vector3(x, y + (t.y - (t.upright ? 0.15 : 0)) * k, z), w, h: ch, tile: CROWN[pick] + (t.upright ? UPRIGHT : 0), c: new Color(1, 1, 1).multiplyScalar(0.88 + rand() * 0.22) })
    return true
  }
  /** How tall a plant may be here: near the road low enough for the camera behind the Pajero to see over it. */
  const capAt = (x: number, z: number, d: number) => field.roadY(x, z) + 7 + Math.max(0, d - half - 6) * 1.5
  const bigTree = (d: number): { id: TreeId; color?: CrownId } => {
    const r = rand()
    if (r < bloom * 0.6) return { id: 'broadleaf', color: 'pink' }
    if (r < bloom) return { id: 'broadleaf', color: 'gold' }
    return { id: d > 24 && rand() < 0.08 ? 'tall' : 'broadleaf' }
  }

  const x1 = field.x0 + (field.nx - 1) * field.cell
  const z1 = field.z0 + (field.nz - 1) * field.cell
  // Close in (every 5 m): the full plants, with outlines.
  const G = 5
  for (let gz = field.z0; gz < z1; gz += G)
    for (let gx = field.x0; gx < x1; gx += G) {
      const x = gx + rand() * G
      const z = gz + rand() * G
      const d = field.dist(x, z)
      if (d < half + 2 || d > 110) continue
      if (blocked(x, z, 2)) continue
      const cap = capAt(x, z, d)
      // The verge: tall grass, and bushes where the Pajero doesn't go. (Low things never hide the road: no cap.)
      const s = field.roadS(x, z)
      const seen = s > span[0] - 30 && s < span[1] + 50
      if (d < half + 5.5) {
        const r = rand()
        if (r < 0.5) plant('tuft', x, z, 0.8 + rand() * 0.6)
        if (r > 0.55 && d > half + 4.2 && !field.paddyAt(d)) plant(rand() < 0.75 ? 'shrub' : 'banana', x + rand() - 0.5, z + rand() - 0.5, 0.7 + rand() * 0.5)
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
          if (!plant(t.id, x, z, 0.75 + rand() * 0.55, cap, t.color)) plant(rand() < 0.5 ? 'banana' : 'shrub', x, z, 0.9 + rand() * 0.4)
        }
        // (Undergrowth between the trees.)
        if (rand() < 0.12) plant('shrub', x + (rand() - 0.5) * G, z + (rand() - 0.5) * G, 0.7 + rand() * 0.5)
      } else if (d < 56) {
        const t = bigTree(d)
        plant(rand() < 0.1 ? 'bamboo' : t.id, x, z, 0.8 + rand() * 0.6, cap, t.color)
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

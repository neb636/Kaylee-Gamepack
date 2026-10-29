// The Nan look's forest (build.ts, `look.jungle`; Dad's photos of the hills round Nan, 2026-10-28): the hillsides deep in
// a lumpy broadleaf canopy, like heads of broccoli packed side by side, every crown its own green (lime, olive, deep
// green), with now and then one in pink (Chomphu Phu Kha, the flower of Doi Phu Kha) or gold (ratchaphruek). Close to
// the road: clumps of bamboo arching over, banana plants with big paddle leaves, round shrubs and tufts of tall grass;
// further off the big trees, tall ones poking up through the canopy; far off a simpler canopy without outlines. Near the
// road the trees stay short enough that the camera behind the Pajero sees over them. Palms by the villages and out in
// the paddies.
//
// Each kind of plant is one shape drawn many times (an InstancedMesh, one per tile of ground so tiles off screen aren't
// drawn), its leaves tinted per plant and its trunk keeping its own brown. Near plants get the ink outline.
import { BufferAttribute, Color, ConeGeometry, CylinderGeometry, Euler, Group, InstancedMesh, Matrix4, MeshToonMaterial, Quaternion, SphereGeometry, Vector3, type BufferGeometry } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { Bag } from '../../../../engine3d/dispose'
import { hullGeometry, instancedOutlineMaterial } from '../../../../engine3d/outline'
import { toonGradient } from '../../../../engine3d/toon'
import { fbm, rng, type HeightField, type RoadLook } from './build'
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

/** A lumpy ball of leaves: a low sphere pushed in and out a little (its shading stays round, its edge goes bumpy). */
function blob(r: number, shade: string, at: V3, scale: V3, seed: number, seg: [number, number] = [6, 4], rot?: V3) {
  const g = new SphereGeometry(r, seg[0], seg[1])
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const y = p.getY(i)
    const z = p.getZ(i)
    const k = 1 + 0.13 * Math.sin((x * 3.1) / r + seed) * Math.cos((z * 2.7) / r + seed * 1.3) + 0.07 * Math.sin((y * 4.3) / r + seed * 0.7)
    p.setXYZ(i, x * k, y * k, z * k)
  }
  return part(g, shade, 1, { at, scale, rot })
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
  // A big broadleaf tree: a short trunk under a wide crown of lumps hanging low (the forest is crowns, not trunks), the
  // top one lit, the low ones in shade.
  const broadleaf: Kind = {
    geo: join([
      part(new CylinderGeometry(0.22, 0.36, 3.4, 6), BARK, 0, { at: [0, 1.7, 0] }),
      blob(3, '#FFFFFF', [0, 6.2, 0], [1.2, 0.85, 1.15], 1),
      blob(2.5, '#E6EEDE', [2.3, 4.9, 0.8], [1, 0.85, 1], 2),
      blob(2.6, '#E0E9D8', [-2.1, 5, -0.7], [1, 0.85, 1], 3),
      blob(2.3, '#D2DDCA', [0.2, 4.5, -2.3], [1, 0.8, 1], 4),
    ]),
    h: 8.6,
    px: 1.6,
    colors: ['#5DA453', '#6BB25A', '#4E9A55', '#7DBE5E', '#8CC762', '#56A06A', '#479150', '#93C96A', '#6AA84E'],
  }
  // A tall tree standing up out of the canopy: a long bare trunk, a wide flat crown.
  const tall: Kind = {
    geo: join([
      part(new CylinderGeometry(0.28, 0.48, 11, 6), '#9C8070', 0, { at: [0, 5.5, 0] }),
      blob(3.3, '#FFFFFF', [0, 12.4, 0], [1.3, 0.55, 1.3], 5),
      blob(2.6, '#E3EBDB', [2.6, 11.4, 0.9], [1.1, 0.55, 1.1], 6),
      blob(2.5, '#DCE5D4', [-2.3, 11.6, -1.2], [1.1, 0.55, 1.1], 7),
      blob(1.8, '#FFFFFF', [0.3, 13.6, 0.2], [1.2, 0.6, 1.2], 8),
    ]),
    h: 14.5,
    px: 1.6,
    colors: ['#5E9E4E', '#71AD57', '#4D8F4F', '#82B95E'],
  }
  // A clump of bamboo: canes leaning out from one root, each with a drooping plume of leaves at the top.
  const canes: BufferGeometry[] = []
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + (i % 2) * 0.4
    const lean = 0.18 + (i % 3) * 0.1
    const L = 7.2 + (i % 2) * 1.4
    const ax: V3 = [Math.sin(a) * Math.sin(lean), Math.cos(lean), Math.cos(a) * Math.sin(lean)]
    canes.push(part(new CylinderGeometry(0.06, 0.09, L, 5), '#A9BE5C', 0, { at: [ax[0] * L * 0.5, ax[1] * L * 0.5, ax[2] * L * 0.5], rot: [lean, a, 0] }))
    // (Plumes droop further out than the cane leans: arching over.)
    const out = lean + 0.7
    canes.push(blob(1, i % 2 ? '#FFFFFF' : '#E4EDDB', [ax[0] * L + Math.sin(a) * 0.9, ax[1] * L - 0.5, ax[2] * L + Math.cos(a) * 0.9], [0.85, 0.5, 1.9], 10 + i, [5, 3], [out, a, 0]))
  }
  for (let i = 0; i < 2; i++) {
    const a = i * Math.PI + 0.9
    canes.push(blob(1.1, '#D8E3CF', [Math.sin(a) * 1.4, 4.4, Math.cos(a) * 1.4], [0.9, 0.55, 1.6], 20 + i, [5, 3], [0.9, a, 0]))
  }
  const bamboo: Kind = { geo: join(canes), h: 8.6, px: 1.4, colors: ['#A6CF62', '#94C45A', '#B5D86E', '#9BC95E'] }
  // A banana plant: a green stem and big paddle leaves, the young ones standing up, the old ones hanging down.
  const leaves: BufferGeometry[] = [part(new CylinderGeometry(0.15, 0.22, 2.7, 6), '#A3BF6A', 0, { at: [0, 1.35, 0] })]
  for (let i = 0; i < 6; i++) {
    const a = i * 2.4
    const up = [1.05, 0.75, 0.45, 0.2, -0.1, 0.6][i]
    const dir: V3 = [Math.sin(a) * Math.cos(up), Math.sin(up), Math.cos(a) * Math.cos(up)]
    leaves.push(part(new SphereGeometry(1, 6, 3), i % 2 ? '#FFFFFF' : '#E6EEDD', 1, { at: [dir[0] * 1.35, 2.6 + dir[1] * 1.35, dir[2] * 1.35], rot: [-up, a, 0], scale: [0.42, 0.06, 1.5] }))
  }
  const banana: Kind = { geo: join(leaves), h: 4.2, px: 1.4, colors: ['#9AD06A', '#8BC560', '#A9D875', '#86C05E'] }
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
  const palm: Kind = { geo: join(palmParts), h: 10, px: 1.4, colors: ['#7DBA5A', '#8CC463', '#72B256'] }
  // A round bush, and a tuft of tall grass.
  const shrub: Kind = {
    geo: join([blob(0.95, '#FFFFFF', [0, 0.85, 0], [1.2, 0.9, 1.1], 30, [5, 4]), blob(0.75, '#E2EADA', [0.85, 0.6, 0.3], [1, 0.9, 1], 31, [5, 3]), blob(0.7, '#DCE5D3', [-0.7, 0.55, -0.4], [1, 0.9, 1], 32, [5, 3])]),
    h: 1.8,
    px: 1.3,
    colors: ['#6FB45C', '#5EA655', '#83C065', '#78B85A'],
  }
  const blades: BufferGeometry[] = []
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + (i % 2) * 0.35
    const lean = 0.12 + (i % 3) * 0.17
    const L = 1.3 + (i % 4) * 0.15
    blades.push(part(new ConeGeometry(0.07, L, 3), i % 2 ? '#FFFFFF' : '#E8EFD8', 1, { at: [Math.sin(a) * Math.sin(lean) * L * 0.5, Math.cos(lean) * L * 0.5, Math.cos(a) * Math.sin(lean) * L * 0.5], rot: [lean, a, 0], scale: [1, 1, 0.4] }))
  }
  const tuft: Kind = { geo: join(blades), h: 1.5, px: 0, colors: ['#B4D879', '#A2CF6B', '#C6DF86', '#D3D58A'] }
  // Further off: the canopy as three lumps with no trunk (the ground's shade shows between), and far off two.
  const canopy: Kind = {
    geo: join([blob(2.8, '#FFFFFF', [0, 6.6, 0], [1.2, 0.8, 1.15], 40, [6, 4]), blob(2.3, '#E2EADA', [2, 5.6, 0.6], [1, 0.8, 1], 41, [6, 4]), blob(2.3, '#D9E3D1', [-1.7, 5.7, -0.9], [1, 0.8, 1], 42, [6, 4])]),
    h: 8.6,
    px: 0,
    colors: broadleaf.colors,
  }
  const far: Kind = {
    geo: join([blob(4.2, '#FFFFFF', [0, 6.4, 0], [1.25, 0.75, 1.2], 50, [6, 3]), blob(3.2, '#DCE5D3', [3.2, 5.2, 1], [1, 0.75, 1], 51, [6, 3])]),
    h: 9.5,
    px: 0,
    colors: broadleaf.colors,
  }
  return { broadleaf, tall, bamboo, banana, palm, shrub, tuft, canopy, far }
}
type KindId = keyof ReturnType<typeof kinds>

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
  /** Plants one, `k` times its size, its top kept under `cap` meters (a smaller one, or none if it would be tiny). */
  const plant = (id: KindId, x: number, z: number, k: number, cap = Infinity, color?: string) => {
    const kind = K[id]
    const y = field.at(x, z)
    if (y + kind.h * k > cap) k = (cap - y) / kind.h
    if (k < 0.5) return false
    const c = new Color(color ?? kind.colors[Math.floor(rand() * kind.colors.length)])
    c.offsetHSL((rand() - 0.5) * 0.03, 0, (rand() - 0.5) * 0.07)
    q.setFromAxisAngle(up, rand() * Math.PI * 2)
    const list = placed.get(id) ?? []
    // (Outlined close to the road only: further off the ink would just be noise, and doubles the cost.)
    list.push({ m: new Matrix4().compose(new Vector3(x, y - 0.15 * k, z), q, new Vector3(k, k * (0.9 + rand() * 0.2), k)), c, ink: field.dist(x, z) < INK })
    placed.set(id, list)
    return true
  }
  /** How tall a plant may be here: near the road low enough for the camera behind the Pajero to see over it. */
  const capAt = (x: number, z: number, d: number) => field.roadY(x, z) + 7 + Math.max(0, d - half - 6) * 1.5
  const bigTree = (d: number) => {
    const r = rand()
    if (r < bloom * 0.6) return { id: 'broadleaf' as const, color: ['#FF9CC4', '#F7B0D0', '#FF86B8'][Math.floor(rand() * 3)] }
    if (r < bloom) return { id: 'broadleaf' as const, color: ['#FFD055', '#FFC93C'][Math.floor(rand() * 2)] }
    return { id: (d > 24 && rand() < 0.16 ? 'tall' : 'broadleaf') as KindId, color: undefined }
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
        if (rand() < 0.55 && !field.open(x, z)) plant('canopy', x, z, 0.8 + rand() * 0.6, cap)
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
      } else if (rand() < 0.55) {
        const t = bigTree(d)
        plant(t.id === 'tall' ? 'tall' : 'canopy', x, z, 0.85 + rand() * 0.6, Infinity, t.color)
      }
    }
  // Far off (every 10 m, out to where the haze takes over): the simple canopy.
  for (let gz = field.z0; gz < z1; gz += 10)
    for (let gx = field.x0; gx < x1; gx += 10) {
      const x = gx + rand() * 10
      const z = gz + rand() * 10
      const d = field.dist(x, z)
      if (d <= 110 || d > 230 || rand() < 0.2) continue
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
  for (const id of Object.keys(K) as KindId[]) if (!placed.has(id)) K[id].geo.dispose()
  root.userData.counts = Object.fromEntries([...placed].map(([id, l]) => [id, l.length]))
  return root
}

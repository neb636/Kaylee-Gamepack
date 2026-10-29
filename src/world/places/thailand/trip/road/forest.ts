// The Nan look's forest (build.ts, `look.jungle`; Dad's photos of the hills round Nan, 2026-10-28): the hillsides deep in
// a broadleaf canopy packed crown to crown, every crown its own green (lime, fresh green, deep green, a teal one), with
// now and then one in pink (Chomphu Phu Kha, the flower of Doi Phu Kha) or gold (ratchaphruek). Close to the road:
// clumps of bamboo arching over, banana plants with big paddle leaves, bushes and tufts of tall grass; further off the
// big trees, tall ones poking up through the canopy; far off the canopy alone. Near the road the trees stay short
// enough that the camera behind the Pajero sees over them. Palms by the villages and out in the paddies.
//
// Direction 3 of Dad's three tree looks (2026-10-29, his image 2: a cozy toy world): chunky toy trees. Every crown is
// a few soft puffs, each puff a squashed dome whose lower edge is scalloped into round lobes that droop a little, lit on
// top and dark in the curl underneath; curvy brown trunks; no ink outlines (Dad likes the trees without the black
// border). The same puff, simpler, makes the trees further off (fewer lobes, fewer rings) and far away (one or two
// puffs). Each kind of plant is one shape drawn many times (an InstancedMesh, one per tile of ground so tiles off
// screen aren't drawn), tinted per plant; its trunk keeps its own brown.
import { BufferAttribute, BufferGeometry, Color, ConeGeometry, CylinderGeometry, Euler, Group, InstancedMesh, Matrix4, MeshToonMaterial, Quaternion, SphereGeometry, Vector3 } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { Bag } from '../../../../engine3d/dispose'
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

/** Places a part and gives it its shade (multiplied by the plant's green when `tint` is 1). Kept indexed (the shapes
 *  are drawn thousands of times: shared corners keep them cheap). A part that already has its own shades keeps them. */
function part(g: BufferGeometry, shade: string | null, tint: number, o: Opts = {}) {
  for (const name of Object.keys(g.attributes)) if (name !== 'position' && name !== 'normal' && !(shade === null && (name === 'color' || name === 'tint'))) g.deleteAttribute(name)
  const [p, y, r] = o.rot ?? [0, 0, 0]
  g.applyMatrix4(new Matrix4().compose(new Vector3(...(o.at ?? [0, 0, 0])), new Quaternion().setFromEuler(new Euler(p, y, r, 'YXZ')), new Vector3(...(o.scale ?? [1, 1, 1]))))
  if (shade === null) return g
  const c = new Color(shade)
  const n = g.attributes.position.count
  const col = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) col.set([c.r, c.g, c.b], i * 3)
  g.setAttribute('color', new BufferAttribute(col, 3))
  g.setAttribute('tint', new BufferAttribute(new Float32Array(n).fill(tint), 1))
  return g
}

/** How detailed a puff is: lobes round its edge, points per lobe, rings from its top down to the rim. */
interface Detail {
  lobes: number
  per: number
  rings: number
}
const NEAR: Detail = { lobes: 6, per: 3, rings: 2 }
const MID: Detail = { lobes: 6, per: 2, rings: 2 }
const FAR: Detail = { lobes: 5, per: 2, rings: 1 }
/** How high a puff's top is, 1 m across: about a half ball. */
const DOME = 0.92

/** One soft puff of leaves, 1 m across: a dome (its top DOME up), its rim scalloped into round lobes whose middles
 *  droop, curling under to a dark belly (from the side, a dark wavy band under every puff, like the toy forest). Shades baked in (lit top, pale rim, dark curl underneath); the plant's
 *  green multiplies them. */
function puff(d: Detail, seed: number) {
  const N = d.lobes * d.per
  const pos: number[] = []
  const shade: number[] = []
  const ph = seed * 1.7
  const top = new Color('#FFFFFF')
  const rim = new Color('#E2ECD3')
  const under = new Color('#5C7A58')
  const c = new Color()
  // The profile from the top down: [how far out (0..1), how high, shade 0 top .. 1 rim .. 2 belly].
  const prof: [number, number, number][] = []
  for (let k = 1; k <= d.rings; k++) {
    const phi = (k / d.rings) * (Math.PI / 2)
    prof.push([Math.sin(phi), DOME * Math.cos(phi), k / d.rings])
  }
  prof.push([0.74, -0.3, 2])
  const at = (r: number, y: number, th: number, w: number): V3 => {
    // The scallops: out at each lobe's middle, in between, and drooping at the middle more toward the rim.
    const lobe = Math.cos(d.lobes * th + ph)
    const rr = r * (1 + 0.13 * lobe * w)
    return [Math.cos(th) * rr, y - 0.17 * (0.5 + 0.5 * lobe) * w * w, Math.sin(th) * rr]
  }
  const push = (p: V3, s: number) => {
    pos.push(...p)
    if (s <= 1) c.copy(top).lerp(rim, s * s)
    else c.copy(rim).lerp(under, s - 1)
    shade.push(c.r, c.g, c.b)
  }
  push([0, DOME, 0], 0)
  for (const [r, y, s] of prof)
    for (let i = 0; i < N; i++) {
      const th = (i / N) * Math.PI * 2
      // (How much of the scallop: none at the top, all of it at the rim and under it.)
      push(at(r, y, th, s >= 1 ? 1 : Math.sin((s * Math.PI) / 2)), s)
    }
  push([0, -0.42, 0], 2)
  const bottom = pos.length / 3 - 1
  const idx: number[] = []
  const ring = (k: number, i: number) => 1 + k * N + (i % N)
  for (let i = 0; i < N; i++) idx.push(0, ring(0, i), ring(0, i + 1))
  for (let k = 0; k < prof.length - 1; k++)
    for (let i = 0; i < N; i++) idx.push(ring(k, i), ring(k + 1, i), ring(k + 1, i + 1), ring(k, i), ring(k + 1, i + 1), ring(k, i + 1))
  for (let i = 0; i < N; i++) idx.push(bottom, ring(prof.length - 1, i + 1), ring(prof.length - 1, i))
  // (Every face turned outward: from the puff's middle to the face.)
  const P = (i: number) => new Vector3(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2])
  const mid = new Vector3(0, 0.2, 0)
  for (let t = 0; t < idx.length; t += 3) {
    const a = P(idx[t])
    const n = P(idx[t + 1]).sub(a).cross(P(idx[t + 2]).sub(a))
    const out = a.add(P(idx[t + 1])).add(P(idx[t + 2])).divideScalar(3).sub(mid)
    if (n.dot(out) < 0) [idx[t + 1], idx[t + 2]] = [idx[t + 2], idx[t + 1]]
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  g.setAttribute('color', new BufferAttribute(new Float32Array(shade), 3))
  g.setAttribute('tint', new BufferAttribute(new Float32Array(pos.length / 3).fill(1), 1))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

/** A puff `r` meters across (radius) at `at`, `squash` as tall as it is round, turned `yaw` (so lobes don't line up),
 *  leaning `tilt` radians. */
const pf = (d: Detail, at: V3, r: number, squash = 1, yaw = 0, tilt = 0) => part(puff(d, yaw * 3 + r), null, 1, { at, rot: [tilt, yaw, 0], scale: [r, r * squash, r] })

/** A smooth trunk that curves a little and flares at its foot: `h` tall, `r` thick at the top. */
function trunk(h: number, r: number, bend: number, color: string) {
  const g = new CylinderGeometry(r, r * 1.5, h, 6, 2)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) + h / 2
    const u = y / h
    // (Wider at the very foot.)
    const flare = 1 + Math.max(0, 0.18 - u) * 2.2
    p.setXYZ(i, p.getX(i) * flare + Math.sin(u * Math.PI) * bend, y, p.getZ(i) * flare)
  }
  g.computeVertexNormals()
  return part(g, color, 0)
}

const BARK = '#9A6B4A'
const join = (parts: BufferGeometry[]) => {
  const g = mergeGeometries(parts, false)
  for (const p of parts) p.dispose()
  return g!
}

/** The plants, each about its real size in meters (scaled 0.7-1.4 per plant). `h`: how tall. */
interface Kind {
  geo: BufferGeometry
  h: number
  colors: string[]
}

/** The crowns' greens: lime, fresh, deep, a teal one, like the toy forest. */
const GREENS = ['#86C643', '#6DB743', '#58A847', '#93CF4C', '#47A26D', '#4B9A45', '#9DD455', '#62B05A']
/** Flowering trees. */
const PINK = ['#FF9CC4', '#F7A8CD', '#FF8DBA']
const GOLD = ['#FFD24F', '#FFC93C']

function kinds() {
  // A round tree: a curvy trunk under a crown of four puffs, a big one, one on top and two lower at the sides, each
  // with its dark scalloped lip showing under it.
  const round: Kind = {
    geo: join([
      trunk(4.4, 0.26, 0.25, BARK),
      part(new CylinderGeometry(0.1, 0.16, 2.2, 5), BARK, 0, { at: [0.75, 4.1, 0.15], rot: [0, 0, -0.75] }),
      // (The big front one in full detail; the smaller ones simpler.)
      pf(NEAR, [0, 5.7, 0], 3, 0.95, 0.2),
      pf(MID, [2, 4.8, 0.9], 2.2, 0.95, 1.1),
      pf(MID, [-1.9, 4.9, -0.8], 2.2, 0.95, 2.3),
      pf(MID, [0.3, 7.4, -0.2], 1.9, 1, 0.7),
    ]),
    h: 9.3,
    colors: GREENS,
  }
  // A tall tree standing up through the canopy: a long bare trunk, a wide flat crown.
  const wide: Kind = {
    geo: join([trunk(10.8, 0.28, 0.45, '#A0785C'), pf(NEAR, [0, 11.2, 0], 3.6, 0.75, 0.3), pf(MID, [2.9, 10.7, 0.8], 2.5, 0.8, 1.4), pf(MID, [-2.8, 10.8, -0.7], 2.5, 0.8, 2.6)]),
    h: 14.5,
    colors: GREENS,
  }
  // Further off, the same trees in fewer, simpler puffs: past the first rows still on a trunk, then (the trunks hidden
  // under the crowns anyway) puffs only, two, then one big one; far off one big simpler puff.
  const roundNear: Kind = { geo: join([trunk(4.4, 0.26, 0.2, BARK), pf(MID, [0, 5.6, 0], 3.1, 0.95, 0.5), pf(MID, [1.9, 4.8, 0.8], 2.2, 0.95, 1.7), pf(MID, [-1.3, 7.1, -0.4], 2, 1, 0.9)]), h: 9.3, colors: GREENS }
  const roundMid: Kind = { geo: join([pf(MID, [0, 5.5, 0], 3.4, 0.95, 0.5), pf(MID, [1.6, 7.1, 0.5], 2.3, 1, 1.9)]), h: 9.4, colors: GREENS }
  const roundFar: Kind = { geo: join([pf(MID, [0, 5.3, 0], 4, 0.95, 0.5)]), h: 9, colors: GREENS }
  const wideMid: Kind = { geo: join([trunk(10.5, 0.28, 0.4, '#A0785C'), pf(MID, [0, 11.1, 0], 3.8, 0.75, 0.5), pf(MID, [2.8, 10.7, 0.5], 2.6, 0.8, 1.9)]), h: 14, colors: GREENS }
  const far: Kind = { geo: join([pf(FAR, [0, 5, 0], 4.7, 0.9, 0.3)]), h: 9, colors: GREENS }
  // A bush: three small puffs on the ground.
  const shrub: Kind = { geo: join([pf(MID, [0, 0.5, 0], 1.1, 0.9, 0.4), pf(MID, [0.85, 0.35, 0.3], 0.8, 0.9, 1.5), pf(MID, [-0.75, 0.35, -0.3], 0.75, 0.9, 2.5)]), h: 1.6, colors: GREENS }
  // A clump of bamboo: pale canes fanning up from one root, and over them a tall feathery mass of leaves arching out on
  // every side (tall puffs leaning outward, the top one highest).
  const canes: BufferGeometry[] = []
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + (i % 2) * 0.3
    const lean = 0.18 + (i % 3) * 0.08
    const L = 6.5
    const ax: V3 = [Math.sin(a) * Math.sin(lean), Math.cos(lean), Math.cos(a) * Math.sin(lean)]
    canes.push(part(new CylinderGeometry(0.08, 0.11, L, 5), '#B4C463', 0, { at: [ax[0] * L * 0.5, ax[1] * L * 0.5, ax[2] * L * 0.5], rot: [lean, a, 0] }))
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4
    canes.push(pf(MID, [Math.sin(a) * 1.5, 5.2 + (i % 2) * 0.8, Math.cos(a) * 1.5], 1.5, 1.7, a, 0.45))
  }
  canes.push(pf(MID, [0, 7.4, 0], 1.4, 1.5, 0.3))
  const bamboo: Kind = { geo: join(canes), h: 9.6, colors: ['#9BD15A', '#8CC650', '#A7D865'] }
  // A banana plant: a green stem and big round-ended paddle leaves, the young ones up, the old ones down.
  const leaves: BufferGeometry[] = [part(new CylinderGeometry(0.17, 0.24, 2.6, 7), '#9DBE5E', 0, { at: [0, 1.3, 0] })]
  for (let i = 0; i < 6; i++) {
    const a = i * 2.4
    const upA = [1.05, 0.7, 0.4, 0.15, -0.15, 0.55][i]
    const dir: V3 = [Math.sin(a) * Math.cos(upA), Math.sin(upA), Math.cos(a) * Math.cos(upA)]
    leaves.push(part(new SphereGeometry(1, 8, 4), i % 2 ? '#FFFFFF' : '#E3EDD7', 1, { at: [dir[0] * 1.35, 2.55 + dir[1] * 1.35, dir[2] * 1.35], rot: [-upA, a, 0], scale: [0.6, 0.15, 1.5] }))
  }
  const banana: Kind = { geo: join(leaves), h: 4.2, colors: ['#9AD55C', '#8CCB55', '#A6DB68'] }
  // A coconut palm: a curving trunk, a crown of long drooping fronds, three coconuts.
  const palmParts: BufferGeometry[] = [trunk(8.8, 0.18, 0.7, '#B08F70')]
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const droop = Math.PI / 2 + 0.3 + (i % 2) * 0.25
    palmParts.push(part(new ConeGeometry(0.6, 4.2, 5), '#FFFFFF', 1, { at: [Math.sin(a) * Math.sin(droop) * 2.1, 9 + Math.cos(droop) * 2.1, Math.cos(a) * Math.sin(droop) * 2.1], rot: [droop, a, 0], scale: [1, 1, 0.3] }))
  }
  for (let i = 0; i < 3; i++) palmParts.push(part(new SphereGeometry(0.24, 7, 5), '#8A6A3A', 0, { at: [Math.sin(i * 2.1) * 0.35, 8.7, Math.cos(i * 2.1) * 0.35] }))
  const palm: Kind = { geo: join(palmParts), h: 10, colors: ['#7DC55A', '#8CCB55', '#72BA56'] }
  // A tuft of tall grass.
  const blades: BufferGeometry[] = []
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + (i % 2) * 0.35
    const lean = 0.12 + (i % 3) * 0.17
    const L = 1.3 + (i % 4) * 0.15
    blades.push(part(new ConeGeometry(0.08, L, 3), i % 2 ? '#FFFFFF' : '#E8EFD8', 1, { at: [Math.sin(a) * Math.sin(lean) * L * 0.5, Math.cos(lean) * L * 0.5, Math.cos(a) * Math.sin(lean) * L * 0.5], rot: [lean, a, 0], scale: [1, 1, 0.45] }))
  }
  const tuft: Kind = { geo: join(blades), h: 1.5, colors: ['#B4D879', '#A2CF6B', '#C6DF86', '#D3D58A'] }
  return { round, wide, roundNear, roundMid, roundFar, wideMid, far, shrub, bamboo, banana, palm, tuft }
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

/** `span`: the part of the road she drives (s from, to); past it (the road running on) only the simpler trees. */
export function buildForest(road: Road, field: HeightField, look: RoadLook, clears: Clear[], span: [number, number], bag: Bag): Group {
  const rand = rng(look.seed * 97 + 13)
  const K = kinds()
  const half = road.half
  const placed = new Map<KindId, { m: Matrix4; c: Color }[]>()
  const q = new Quaternion()
  const up = new Vector3(0, 1, 0)
  const blocked = (x: number, z: number, r: number) =>
    clears.some((c) => (c.across ? Math.abs((x - c.x) * c.across.tx + (z - c.z) * c.across.tz) < c.across.w + r : Math.hypot(x - c.x, z - c.z) < c.r + r))
  const bloom = look.bloom ?? 0
  /** Plants one, `k` times its size, its top kept under `cap` meters (a smaller one, or none if it would be tiny). */
  const plant = (id: KindId, x: number, z: number, k: number, cap = Infinity, colors?: string[]) => {
    const kind = K[id]
    const y = field.at(x, z)
    if (y + kind.h * k > cap) k = (cap - y) / kind.h
    if (k < 0.5) return false
    const pool = colors ?? kind.colors
    const c = new Color(pool[Math.floor(rand() * pool.length)])
    c.offsetHSL((rand() - 0.5) * 0.03, 0, (rand() - 0.5) * 0.07)
    q.setFromAxisAngle(up, rand() * Math.PI * 2)
    const list = placed.get(id) ?? []
    list.push({ m: new Matrix4().compose(new Vector3(x, y - 0.15 * k, z), q, new Vector3(k, k * (0.9 + rand() * 0.2), k)), c })
    placed.set(id, list)
    return true
  }
  /** How tall a plant may be here: near the road low enough for the camera behind the Pajero to see over it. */
  const capAt = (x: number, z: number, d: number) => field.roadY(x, z) + 7 + Math.max(0, d - half - 6) * 1.5
  /** A big tree `d` meters from the road: which shape (simpler further off), and pink or gold now and then. */
  const bigTree = (d: number): { id: KindId; colors?: string[] } => {
    const r = rand()
    const plain: KindId = d < 24 ? 'round' : d < 40 ? 'roundNear' : d < 75 ? 'roundMid' : 'roundFar'
    const id: KindId = d > 24 && rand() < 0.08 ? (d < 56 ? 'wide' : 'wideMid') : plain
    if (r < bloom * 0.6) return { id: plain, colors: PINK }
    if (r < bloom) return { id: plain, colors: GOLD }
    return { id }
  }

  const x1 = field.x0 + (field.nx - 1) * field.cell
  const z1 = field.z0 + (field.nz - 1) * field.cell
  // Close in (every 6.5 m, the crowns big enough to meet): the full plants.
  const G = 6.5
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
      if (d < half + 5.5) continue
      if (field.paddyAt(d)) {
        // Out in the paddies, a palm here and there on the bunds.
        if (d > half + 8 && rand() < 0.012) plant('palm', x, z, 0.8 + rand() * 0.4, cap)
        continue
      }
      // (Where the road runs on past her part of it, only the simpler trees: she only glimpses it.)
      if (!seen) {
        if (rand() < 0.6 && !field.open(x, z)) plant('roundFar', x, z, 0.8 + rand() * 0.6, cap)
        continue
      }
      if (field.open(x, z) && d > 60) {
        if (rand() < 0.03) plant('roundFar', x, z, 0.8 + rand() * 0.5)
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
          if (!plant(t.id, x, z, 0.85 + rand() * 0.5, cap, t.colors)) plant(rand() < 0.5 ? 'banana' : 'shrub', x, z, 0.9 + rand() * 0.4)
        }
      } else if (d < 56) {
        const t = bigTree(d)
        plant(rand() < 0.1 ? 'bamboo' : t.id, x, z, 0.9 + rand() * 0.5, cap, t.colors)
      } else if (rand() < 0.62) {
        const t = bigTree(d)
        plant(t.id, x, z, 1 + rand() * 0.55, Infinity, t.colors)
      }
    }
  // The verge (every 3.5 m along it): tall grass, and bushes where the Pajero doesn't go. (Low: never under a cap.)
  for (let gz = field.z0; gz < z1; gz += 3.5)
    for (let gx = field.x0; gx < x1; gx += 3.5) {
      const x = gx + rand() * 3.5
      const z = gz + rand() * 3.5
      const d = field.dist(x, z)
      if (d < half + 2 || d > half + 10 || blocked(x, z, 1.5)) continue
      const r = rand()
      if (r < 0.45) plant('tuft', x, z, 0.8 + rand() * 0.6)
      else if (r < 0.66 && d > half + 4.2 && !field.paddyAt(d)) plant(rand() < 0.65 ? 'shrub' : 'banana', x, z, 0.8 + rand() * 0.55)
    }
  // Far off (every 10 m, out to where the haze takes over): the canopy alone.
  for (let gz = field.z0; gz < z1; gz += 10)
    for (let gx = field.x0; gx < x1; gx += 10) {
      const x = gx + rand() * 10
      const z = gz + rand() * 10
      const d = field.dist(x, z)
      if (d <= 110 || d > 270 || rand() < 0.15) continue
      if (field.open(x, z) || blocked(x, z, 4)) continue
      // (Thinner in patches, like the photos' hills.)
      if (fbm(x / 60, z / 60, look.seed + 31) < -0.45) continue
      plant('far', x, z, 0.95 + rand() * 0.6, Infinity, bigTree(d).colors)
    }

  // ---- Into tiles, one InstancedMesh per kind per tile ----
  const root = new Group()
  const mat = tintedToon()
  for (const [id, list] of placed) {
    const geo = bag.add(K[id].geo)
    const tiles = new Map<string, typeof list>()
    for (const p of list) {
      const key = `${Math.floor(p.m.elements[12] / TILE)},${Math.floor(p.m.elements[14] / TILE)}`
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
    }
  }
  for (const id of Object.keys(K) as KindId[]) if (!placed.has(id)) K[id].geo.dispose()
  root.userData.counts = Object.fromEntries([...placed].map(([id, l]) => [id, l.length]))
  return root
}

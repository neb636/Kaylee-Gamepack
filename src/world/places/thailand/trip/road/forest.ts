// The Nan look's forest (build.ts, `look.jungle`; Dad's photos of the hills round Nan, 2026-10-28): the hillsides deep in
// a leafy broadleaf canopy packed crown to crown, every crown its own green (lime, olive, deep green), with now and then
// one in pink (Chomphu Phu Kha, the flower of Doi Phu Kha) or gold (ratchaphruek). Close to the road: clumps of bamboo
// arching over, banana plants with big paddle leaves, bushes and tufts of tall grass; further off the big trees, tall
// ones poking up through the canopy; far off the canopy alone. Near the road the trees stay short enough that the
// camera behind the Pajero sees over them. Palms by the villages and out in the paddies.
//
// The hybrid of Dad's two tree looks (2026-10-29): the shapes of direction 3, the chunky toy trees (every crown a few
// soft puffs, each a squashed dome whose lower edge is scalloped into round lobes, lit on top and dark in the curl
// underneath), with the paint of direction 1, the Kingdom Come look: the puffs sit on the tips of real limbs, are
// covered in small painted leaves (canopy.ts `leafTexture`), and near the road a few painted clusters of leaves sit round
// their rims and over their tops, so the outline is leafy. Further off the same trees in fewer, simpler puffs, far off
// one puff each. The bamboo, bananas, ferns and bushes by the road are painted cards (canopy.ts); palms and grass are
// shapes. Each kind is drawn many times at once (an InstancedMesh, one per tile of ground so tiles off screen aren't
// drawn). No ink outlines on the plants: Dad likes the trees without the black border (2026-10-29).
import { BufferAttribute, BufferGeometry, Color, ConeGeometry, CylinderGeometry, Euler, Group, InstancedBufferAttribute, InstancedMesh, Matrix4, MeshToonMaterial, PlaneGeometry, Quaternion, SphereGeometry, Vector3 } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { Bag } from '../../../../engine3d/dispose'
import { toonGradient } from '../../../../engine3d/toon'
import { fbm, rng, type HeightField, type RoadLook } from './build'
import { BAMBOO_W, CROWN, crownMaterial, FERN_H, FERN_W, LEAF_M, leafTexture, UPRIGHT, type CrownId } from './canopy'
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
const FAR: Detail = { lobes: 5, per: 2, rings: 2 }
/** How high a puff's top is, 1 m across: about a half ball. */
const DOME = 0.92

/** One soft puff of leaves, 1 m across: a dome (its top DOME up), its rim scalloped into round lobes whose middles
 *  droop, curling under to a dark belly (from the side, a dark wavy band under every puff, like the toy forest). Shades
 *  baked in (lit top, pale rim, dark curl underneath); the plant's green multiplies them. */
function puff(d: Detail, seed: number) {
  const N = d.lobes * d.per
  const pos: number[] = []
  const shade: number[] = []
  const ph = seed * 1.7
  const top = new Color('#FFFFFF')
  const rim = new Color('#DCE6CC')
  const under = new Color('#55704F')
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

/** A puff `r` meters across (radius) at `at`, `squash` as tall as it is round, turned `yaw` (so lobes don't line up). */
const pf = (d: Detail, at: V3, r: number, squash = 1, yaw = 0) => part(puff(d, yaw * 3 + r), null, 1, { at, rot: [0, yaw, 0], scale: [r, r * squash, r] })

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

const BARK = '#8E6A50'
const join = (parts: BufferGeometry[]) => {
  const g = mergeGeometries(parts, false)
  for (const p of parts) p.dispose()
  return g!
}

/** The plants, each about its real size in meters (scaled 0.7-1.4 per plant). `h`: how tall. A tree also carries its
 *  `puffs` ([x, y, z, radius], m: where the painted clusters go round them) round `mid`, its crown's middle; `leafy`
 *  ones wear the painted leaves. */
interface Kind {
  geo: BufferGeometry
  h: number
  colors: string[]
  puffs?: [number, number, number, number][]
  mid?: Vector3
  leafy?: boolean
}

/** A tree: a curvy trunk forking into a few limbs reaching up and out, a puff on every limb's tip and a big one over the
 *  top (one of a few shapes, each tree turned its own way). `tall`: a long bare trunk and a wide flat crown, standing
 *  up through the canopy. `d`: how detailed its puffs are. */
function puffTree(seed: number, tall: boolean, d: Detail): Kind {
  const rand = rng(seed)
  const parts: BufferGeometry[] = []
  const puffs: [number, number, number, number][] = []
  const H = tall ? 9.6 + rand() * 1 : 3.3 + rand() * 0.6
  parts.push(trunk(H + 0.4, tall ? 0.26 : 0.22, (rand() - 0.5) * 0.5, tall ? '#9A7660' : BARK))
  /** A limb from `a` reaching `len` m along elevation `e` (from level) and heading `yaw`; returns its tip. */
  const branch = (a: Vector3, yaw: number, e: number, len: number, r: number): Vector3 => {
    const dir = new Vector3(Math.cos(e) * Math.sin(yaw), Math.sin(e), Math.cos(e) * Math.cos(yaw))
    const b = a.clone().addScaledVector(dir, len)
    const mid = a.clone().add(b).multiplyScalar(0.5)
    // (Open-ended: the ends are hidden in the trunk and the puffs.)
    parts.push(part(new CylinderGeometry(r * 0.6, r, len, 5, 1, true), BARK, 0, { at: [mid.x, mid.y, mid.z], rot: [Math.PI / 2 - e, yaw, 0] }))
    return b
  }
  const n = tall ? 3 : 4
  for (let i = 0; i < n; i++) {
    const yaw = (i / n) * Math.PI * 2 + rand() * 0.8
    const e = tall ? 0.22 + rand() * 0.2 : 0.5 + rand() * 0.4
    const len = tall ? 2.8 + rand() * 0.8 : 1.6 + rand() * 0.8
    const from = new Vector3(0, H * (tall ? 0.95 : 0.78 + rand() * 0.15), 0)
    const tip = branch(from, yaw, e, len, tall ? 0.16 : 0.13)
    const r = tall ? 2.3 + rand() * 0.5 : 1.85 + rand() * 0.45
    puffs.push([tip.x, tip.y + r * 0.1, tip.z, r])
  }
  puffs.push([(rand() - 0.5) * 0.8, H + (tall ? 1.1 : 2), (rand() - 0.5) * 0.8, tall ? 3.1 : 2.4 + rand() * 0.3])
  let top = 0
  for (const [x, y, z, r] of puffs) {
    const squash = tall ? 0.75 : 0.9 + rand() * 0.15
    parts.push(pf(d, [x, y, z], r, squash, rand() * 6))
    top = Math.max(top, y + r * squash * DOME)
  }
  const mid = puffs.reduce((m, [x, y, z]) => m.add(new Vector3(x, y, z)), new Vector3()).multiplyScalar(1 / puffs.length)
  return { geo: join(parts), h: top, colors: ['#FFFFFF'], puffs, mid, leafy: true }
}

function kinds() {
  // The trees by the road (three shapes and a tall one), then the same in simpler puffs past the first rows; then
  // (the trunks hidden under the crowns anyway) puffs only, two, then one big one far off.
  const tree0 = puffTree(11, false, NEAR)
  const tree1 = puffTree(23, false, NEAR)
  const tree2 = puffTree(37, false, NEAR)
  const tall = puffTree(53, true, NEAR)
  const treeMid0 = puffTree(11, false, MID)
  const treeMid1 = puffTree(37, false, MID)
  const tallMid = puffTree(53, true, MID)
  const roundMid: Kind = { geo: join([pf(MID, [0, 5.5, 0], 3.4, 0.95, 0.5), pf(MID, [1.6, 7.1, 0.5], 2.3, 1, 1.9)]), h: 9.4, colors: ['#FFFFFF'], leafy: true }
  const roundFar: Kind = { geo: join([pf(MID, [0, 5.3, 0], 4, 0.95, 0.5)]), h: 9, colors: ['#FFFFFF'], leafy: true }
  const far: Kind = { geo: join([pf(FAR, [0, 5, 0], 4.7, 0.9, 0.3)]), h: 9, colors: ['#FFFFFF'], leafy: true }
  // A coconut palm: a curving trunk, a crown of long drooping fronds, three coconuts.
  const palmParts: BufferGeometry[] = [trunk(8.8, 0.18, 0.7, '#A88E74')]
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const droop = Math.PI / 2 + 0.3 + (i % 2) * 0.25
    palmParts.push(part(new ConeGeometry(0.55, 4.2, 4), '#FFFFFF', 1, { at: [Math.sin(a) * Math.sin(droop) * 2.1, 9 + Math.cos(droop) * 2.1, Math.cos(a) * Math.sin(droop) * 2.1], rot: [droop, a, 0], scale: [1, 1, 0.22] }))
  }
  for (let i = 0; i < 3; i++) palmParts.push(part(new SphereGeometry(0.22, 6, 4), '#8A6A3A', 0, { at: [Math.sin(i * 2.1) * 0.3, 8.7, Math.cos(i * 2.1) * 0.3] }))
  const palm: Kind = { geo: join(palmParts), h: 10, colors: ['#7DBA5A', '#8CC463', '#72B256'] }
  // A tuft of tall grass.
  const blades: BufferGeometry[] = []
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + (i % 2) * 0.35
    const lean = 0.12 + (i % 3) * 0.17
    const L = 1.3 + (i % 4) * 0.15
    blades.push(part(new ConeGeometry(0.07, L, 3), i % 2 ? '#FFFFFF' : '#E8EFD8', 1, { at: [Math.sin(a) * Math.sin(lean) * L * 0.5, Math.cos(lean) * L * 0.5, Math.cos(a) * Math.sin(lean) * L * 0.5], rot: [lean, a, 0], scale: [1, 1, 0.4] }))
  }
  const tuft: Kind = { geo: join(blades), h: 1.5, colors: ['#98B460', '#86A852', '#AAB868', '#BAB874'] }
  return { tree0, tree1, tree2, tall, treeMid0, treeMid1, tallMid, roundMid, roundFar, far, palm, tuft }
}
type KindId = keyof ReturnType<typeof kinds>

/** A crown's greens: the puffs' color (halfway between the toy forest's bright greens and the painted leaves' muted
 *  ones) and the painted clusters that go with it. */
const GREENS = {
  fresh: { puff: '#8DBA4C', cards: 'clFresh' },
  mid: { puff: '#73A443', cards: 'clMid' },
  olive: { puff: '#97A548', cards: 'clOlive' },
  dark: { puff: '#5A9142', cards: 'clDark' },
  teal: { puff: '#529A68', cards: 'clDark' },
  pink: { puff: '#EBA2BF', cards: 'clPink' },
  gold: { puff: '#E9C452', cards: 'clGold' },
} as const satisfies Record<string, { puff: string; cards: CrownId }>
type GreenId = keyof typeof GREENS
const PLAIN: GreenId[] = ['fresh', 'mid', 'olive', 'dark', 'mid', 'fresh', 'teal']

/** The plants that are a single painted card: how tall (m, at scale 1), the card's middle above the ground and its size,
 *  and which pictures it can be: bushes, and the upright ferns, bananas and bamboo. */
const CROWNS = {
  shrub: { h: 2.3, y: 1.05, w: 3.2, ch: 3, tiles: ['bush'], upright: false },
  // (Standing on the ground: the card's middle is half its height up.)
  fern: { h: FERN_H, y: FERN_H / 2, w: FERN_W, ch: FERN_H, tiles: ['fern'], upright: true },
  banana: { h: 4.6, y: 2.3, w: 4.2, ch: 4.6, tiles: ['banana', 'banana2'], upright: true },
  bamboo: { h: 9.5, y: 4.75, w: BAMBOO_W, ch: 9.5, tiles: ['bamboo', 'bamboo2'], upright: true },
} as const satisfies Record<string, { h: number; y: number; w: number; ch: number; tiles: readonly CrownId[]; upright: boolean }>
type CardId = keyof typeof CROWNS

/** The toon look with a per-plant tint: the leaves take the plant's color, the trunk keeps its own (the `tint`
 *  attribute: 1 tinted, 0 not). `leafy`: the tinted parts also wear the painted leaves, laid on from the three sides
 *  (so a puff needs no unwrapping), LEAF_M meters to a square of leaves. */
const toons = new Map<boolean, MeshToonMaterial>()
function tintedToon(leafy: boolean) {
  const had = toons.get(leafy)
  if (had) return had
  const m = new MeshToonMaterial({ vertexColors: true, gradientMap: toonGradient() })
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float tint;\nvarying float vLeafy;\nvarying vec3 vLeafP;\nvarying vec3 vLeafN;').replace(
      '#include <color_vertex>',
      `vColor = vec3(1.0);
      #ifdef USE_COLOR
        vColor *= color;
      #endif
      #ifdef USE_INSTANCING_COLOR
        vColor *= mix(vec3(1.0), instanceColor.rgb, tint);
      #endif
      vLeafy = tint;`,
    )
    if (!leafy) return
    sh.uniforms.uLeaf = { value: leafTexture() }
    sh.vertexShader = sh.vertexShader.replace(
      '#include <project_vertex>',
      `#include <project_vertex>
      vec4 leafW = vec4(transformed, 1.0);
      vec3 leafN = objectNormal;
      #ifdef USE_INSTANCING
        leafW = instanceMatrix * leafW;
        leafN = mat3(instanceMatrix) * leafN;
      #endif
      vLeafP = (modelMatrix * leafW).xyz / ${LEAF_M.toFixed(2)};
      vLeafN = mat3(modelMatrix) * leafN;`,
    )
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uLeaf;\nvarying float vLeafy;\nvarying vec3 vLeafP;\nvarying vec3 vLeafN;').replace(
      '#include <color_fragment>',
      `#include <color_fragment>
      vec3 leafB = pow(abs(normalize(vLeafN)), vec3(4.0));
      leafB /= leafB.x + leafB.y + leafB.z;
      float leafT = texture2D(uLeaf, vLeafP.zy).r * leafB.x + texture2D(uLeaf, vLeafP.xz).r * leafB.y + texture2D(uLeaf, vLeafP.xy).r * leafB.z;
      diffuseColor.rgb *= mix(1.0, 0.5 + leafT * 0.8, vLeafy);`,
    )
  }
  m.customProgramCacheKey = () => (leafy ? 'tinted-toon-leafy' : 'tinted-toon')
  toons.set(leafy, m)
  return m
}

/** Ground tiles (m): each kind of plant is one InstancedMesh per tile, so the tiles out of view aren't drawn. */
const TILE = 160
/** Trees this close to the road (m) get painted clusters round their puffs. */
const CARDS = 40

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
  /** The painted cards: where each card's middle is, its size, its picture and its tint. */
  const cards: { at: Vector3; w: number; h: number; tile: number; c: Color }[] = []
  const sun = new Vector3(-0.35, 0.85, 0.4).normalize()
  /** A shape at (x, y, z), `k` times its size, turned `yaw`, in `color` (or one of its own). */
  const shape = (id: KindId, x: number, y: number, z: number, k: number, yaw: number, color?: string) => {
    const kind = K[id]
    const c = new Color(color ?? kind.colors[Math.floor(rand() * kind.colors.length)])
    c.offsetHSL((rand() - 0.5) * 0.03, 0, (rand() - 0.5) * 0.07)
    q.setFromAxisAngle(up, yaw)
    const list = placed.get(id) ?? []
    list.push({ m: new Matrix4().compose(new Vector3(x, y - 0.15 * k, z), q, new Vector3(k, k, k)), c })
    placed.set(id, list)
  }
  /** The painted clusters round a tree's puffs: three or four round each rim and one over its top, each lit by where it
   *  sits in the crown (on top and toward the sun brighter and warmer, low down and deep inside darker). */
  const fringe = (kind: Kind, x: number, y: number, z: number, k: number, yaw: number, green: GreenId) => {
    const cos = Math.cos(yaw)
    const sin = Math.sin(yaw)
    const mid = kind.mid!
    const reach = Math.max(...kind.puffs!.map(([sx, sy, sz, r]) => Math.hypot(sx - mid.x, sy - mid.y, sz - mid.z) + r))
    const add = (sx: number, sy: number, sz: number, size: number, tile: CrownId) => {
      // (Turned with the trunk: a turn of `yaw` about up.)
      const px = sx * cos + sz * sin
      const pz = -sx * sin + sz * cos
      const n = tmpV.set(px - (mid.x * cos + mid.z * sin), sy - mid.y, pz - (-mid.x * sin + mid.z * cos))
      const out = Math.min(1, n.length() / reach)
      n.normalize()
      const lit = Math.max(0, n.dot(sun))
      const b = (0.66 + 0.2 * (n.y * 0.5 + 0.5) + 0.28 * lit) * (0.78 + 0.22 * out)
      const c = new Color(b * (1 + 0.06 * lit), b, b * (0.94 - 0.08 * lit))
      const w = size * k * (0.9 + rand() * 0.2)
      cards.push({ at: new Vector3(x + px * k, y + sy * k, z + pz * k), w: rand() < 0.5 ? -w : w, h: size * k * (0.85 + rand() * 0.2), tile: CROWN[tile], c })
    }
    const own = GREENS[green].cards
    for (const [sx, sy, sz, r] of kind.puffs!) {
      const n = 3
      const a0 = rand() * Math.PI * 2
      for (let i = 0; i < n; i++) {
        const a = a0 + (i / n) * Math.PI * 2 + (rand() - 0.5) * 0.6
        add(sx + Math.cos(a) * r * 0.95, sy - r * 0.1 + rand() * r * 0.2, sz + Math.sin(a) * r * 0.95, r * 0.9, own === 'clPink' || own === 'clGold' || rand() > 0.12 ? own : 'clYoung')
      }
      if (rand() < 0.6) add(sx + (rand() - 0.5) * r * 0.5, sy + r * 0.8, sz + (rand() - 0.5) * r * 0.5, r * 0.85, own)
    }
  }
  /** Plants a tree, `k` times its size, its top kept under `cap` meters (a smaller one, or none if it would be tiny),
   *  in `green`; near the road with its painted clusters. */
  const tree = (id: KindId, x: number, z: number, k: number, cap: number, green: GreenId, withCards: boolean) => {
    const kind = K[id]
    const y = field.at(x, z)
    if (y + kind.h * k > cap) k = (cap - y) / kind.h
    if (k < 0.5) return false
    const yaw = rand() * Math.PI * 2
    shape(id, x, y, z, k, yaw, GREENS[green].puff)
    if (withCards && kind.puffs) fringe(kind, x, y - 0.15 * k, z, k, yaw, green)
    return true
  }
  /** Plants a shape (a palm, grass) or a painted card (a bush, a fern, a banana, bamboo), `k` times its size, under `cap`. */
  const plant = (id: KindId | CardId, x: number, z: number, k: number, cap = Infinity) => {
    const y = field.at(x, z)
    const h = id in CROWNS ? CROWNS[id as CardId].h : K[id as KindId].h
    if (y + h * k > cap) k = (cap - y) / h
    if (k < 0.5) return false
    if (!(id in CROWNS)) return shape(id as KindId, x, y, z, k, rand() * Math.PI * 2), true
    const t = CROWNS[id as CardId]
    // (Every card a little different: its size, how wide, how light; mirrored half the time.)
    const w = t.w * k * (0.9 + rand() * 0.2) * (rand() < 0.5 ? -1 : 1)
    const ch = t.ch * k * (t.upright ? 1 : 0.9 + rand() * 0.2)
    const pick = t.tiles[Math.floor(rand() * t.tiles.length)]
    const b = 0.97 + rand() * 0.16
    cards.push({ at: new Vector3(x, y + (t.y - (t.upright ? 0.12 : 0)) * k, z), w, h: ch, tile: CROWN[pick] + (t.upright ? UPRIGHT : 0), c: new Color(b, b, b) })
    return true
  }
  /** How tall a plant may be here: near the road low enough for the camera behind the Pajero to see over it. */
  const capAt = (x: number, z: number, d: number) => field.roadY(x, z) + 8 + Math.max(0, d - half - 6) * 1.8
  /** A big tree `d` meters from the road: which shape (simpler further off) and its green, pink or gold now and then. */
  const bigTree = (d: number): { id: KindId; green: GreenId } => {
    const r = rand()
    const green: GreenId = r < bloom * 0.6 ? 'pink' : r < bloom ? 'gold' : PLAIN[Math.floor(rand() * PLAIN.length)]
    const isTall = d > 24 && rand() < 0.08
    const id: KindId =
      d < 30 ? (['tree0', 'tree1', 'tree2'] as const)[Math.floor(rand() * 3)]
      : d < 60 ? (isTall ? (d < 45 ? 'tall' : 'tallMid') : rand() < 0.5 ? 'treeMid0' : 'treeMid1')
      : d < 85 ? 'roundMid'
      : 'roundFar'
    return { id: isTall && d < 30 ? 'tall' : id, green }
  }

  const x1 = field.x0 + (field.nx - 1) * field.cell
  const z1 = field.z0 + (field.nz - 1) * field.cell
  // Close in (every 5.5 m, the crowns big enough to meet): the trees, and the undergrowth.
  const G = 5.5
  for (let gz = field.z0; gz < z1; gz += G)
    for (let gx = field.x0; gx < x1; gx += G) {
      const x = gx + rand() * G
      const z = gz + rand() * G
      const d = field.dist(x, z)
      if (d < half + 2 || d > 110) continue
      if (blocked(x, z, 2)) continue
      const cap = capAt(x, z, d)
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
        if (rand() < 0.6 && !field.open(x, z)) tree('roundFar', x, z, 0.8 + rand() * 0.6, cap, PLAIN[Math.floor(rand() * PLAIN.length)], false)
        continue
      }
      if (field.open(x, z) && d > 60) {
        if (rand() < 0.03) tree('roundFar', x, z, 0.8 + rand() * 0.5, Infinity, PLAIN[Math.floor(rand() * PLAIN.length)], false)
        continue
      }
      if (d < 38) {
        // (The first row by the road: more bananas, bamboo and bushes; then the big trees.)
        const edge = d < half + 12 ? 1 : 0.5
        const r = rand()
        if (r < 0.12 * edge + 0.04) plant('bamboo', x, z, 0.75 + rand() * 0.5, cap) || plant('banana', x, z, 1 + rand() * 0.3)
        else if (r < 0.26 * edge + 0.06) plant('banana', x, z, 0.8 + rand() * 0.4)
        else if (r < 0.34 * edge + 0.08) plant('shrub', x, z, 0.8 + rand() * 0.6)
        else {
          const t = bigTree(d)
          if (!tree(t.id, x, z, 0.8 + rand() * 0.45, cap, t.green, d < CARDS)) {
            plant(rand() < 0.5 ? 'banana' : 'shrub', x, z, 0.9 + rand() * 0.4)
            plant('fern', x + (rand() - 0.5) * G, z + (rand() - 0.5) * G, 1 + rand() * 0.4)
          }
        }
        // (Undergrowth between the trees: bushes and ferns.)
        for (let u = 0; u < 2; u++) if (rand() < 0.45) plant(rand() < 0.5 ? 'shrub' : 'fern', x + (rand() - 0.5) * G, z + (rand() - 0.5) * G, 0.8 + rand() * 0.7)
      } else if (d < 56) {
        const t = bigTree(d)
        if (rand() < 0.1) plant('bamboo', x, z, 0.8 + rand() * 0.5, cap)
        else tree(t.id, x, z, 0.85 + rand() * 0.5, cap, t.green, d < CARDS)
      } else if (rand() < 0.62) {
        const t = bigTree(d)
        tree(t.id, x, z, 1 + rand() * 0.55, Infinity, t.green, false)
      }
    }
  // The verge (every 3.5 m along it): a thick strip of tall grass and ferns, and bushes and bananas where the Pajero
  // doesn't go. (Low: never under a cap.)
  for (let gz = field.z0; gz < z1; gz += 3.5)
    for (let gx = field.x0; gx < x1; gx += 3.5) {
      const x = gx + rand() * 3.5
      const z = gz + rand() * 3.5
      const d = field.dist(x, z)
      if (d < half + 1.8 || d > half + 10 || blocked(x, z, 1.5)) continue
      for (let u = 0; u < (d > half + 3.2 ? 2 : 1); u++) {
        const px = x + (rand() - 0.5) * 3.5
        const pz = z + (rand() - 0.5) * 3.5
        if (field.dist(px, pz) < half + 1.8) continue
        if (rand() < 0.55) plant('tuft', px, pz, 0.8 + rand() * 0.7)
        else if (!field.paddyAt(d)) plant('fern', px, pz, 0.8 + rand() * 0.6)
      }
      if (rand() < 0.3 && d > half + 4.2 && !field.paddyAt(d)) plant(rand() < 0.65 ? 'shrub' : 'banana', x, z, 0.75 + rand() * 0.5)
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
      tree('far', x, z, 0.95 + rand() * 0.6, Infinity, bigTree(d).green, false)
    }

  // ---- Into tiles, one InstancedMesh per kind per tile ----
  const root = new Group()
  for (const [id, list] of placed) {
    const geo = bag.add(K[id].geo)
    const mat = tintedToon(!!K[id].leafy)
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
  // The painted cards: one card shape, many cards per tile.
  const card = new PlaneGeometry(1, 1)
  const cardTiles = new Map<string, typeof cards>()
  for (const p of cards) {
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
  root.userData.counts = { ...Object.fromEntries([...placed].map(([id, l]) => [id, l.length])), cards: cards.length }
  return root
}
const tmpV = new Vector3()

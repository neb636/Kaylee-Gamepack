// HarborLand's playground, built from simple shapes in the house's toon look (greybox 1: soft-play blocks, nets as
// lattices, slides as open troughs with ink rims, the twin dragons as two tubes round the spiral tower). Everything
// still is merged into a few meshes; what moves (the rope bridge, the donut's ring, the zip line's handle, the Sky Pod's
// buttons, the bike's wheels, the Phi Ta Khon figures, the cannon) comes back as its own group.
import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, DoubleSide, Group, LineCurve3, Mesh, MeshToonMaterial, TubeGeometry, Vector3, type Curve } from 'three'
import type { Bag } from '../../../engine/dispose'
import { bake, merge, P, solid, type V3 } from '../../../engine/geo'
import { PAL, toon, toonGradient } from '../../../engine/toon'
import { BACK_Z, BIKE, BRIDGE, CANNON, DONUT, HALL, L1A, L1B, LV, MASKS, MOMMY, MOUNTAIN, PERCH, POOL, ROLLER, SKYPOD, SKYWALK, TOP, TOWER, TOWER_DECK, ZIP, type Rect } from './layout'

/** HarborLand's bright soft-play colors (our own: nobody wrote down the real ones). */
export const HL = {
  pad1: '#FF8FB8',
  pad2: '#8EC9F5',
  pad3: '#8FE3C8',
  pad4: '#FBEA9A',
  pad5: '#C9B5F7',
  side: '#F4EEFF',
  net: '#FF4F9A',
  rope: '#FFF7F0',
  gold: '#FFC83D',
  goldDark: '#E8A92A',
  dragonGreen: '#6FCF8E',
  dragonGold: '#FFC83D',
  slide: '#FFB347',
  slide2: '#8EC9F5',
  roller: '#FF6F6F',
  mat: '#B9A6F5',
  floorA: '#E9E1FF',
  floorB: '#DCD0FA',
  wall: '#EBDDFF',
}

export interface Built {
  root: Group
  /** The rope bridge's planks (their height follows the sag and the bounce). */
  planks: Group[]
  ring: Group
  handle: Group
  chedi: Group
  skypod: { root: Group; buttons: Mesh[] }
  bike: { root: Group; wheels: Group[]; lights: Mesh[] }
  masks: { root: Group; head: Group; tongue: Group }[]
  cannon: { root: Group; barrel: Group }
  /** The rides' paths (the bottom of each trough, top to bottom). */
  curves: { slideLittle: Curve<Vector3>; dragon: Curve<Vector3>; roller: Curve<Vector3> }
  /** Everything with userData.pick, for taps on the canvas. */
  picks: Group[]
}

const v = (x: number, y: number, z: number) => new Vector3(x, y, z)

/** An open slide trough along a path: a half-pipe whose bottom is the path (where she sits), two outlined rims. */
export function trough(curve: Curve<Vector3>, r: number, color: string, rim: string, segs: number, bag: Bag) {
  const g = new Group()
  const P_ = 10
  const pos: number[] = []
  const col: number[] = []
  const c = new Color(color)
  const up0 = v(0, 1, 0)
  const rimL: Vector3[] = []
  const rimR: Vector3[] = []
  for (let i = 0; i <= segs; i++) {
    const p = curve.getPointAt(i / segs)
    const t = curve.getTangentAt(i / segs)
    const side = new Vector3().crossVectors(t, up0).normalize()
    const up = new Vector3().crossVectors(side, t).normalize()
    for (let j = 0; j <= P_; j++) {
      const a = (Math.PI * j) / P_
      const q = p.clone().addScaledVector(side, Math.cos(a) * r).addScaledVector(up, r - Math.sin(a) * r)
      pos.push(q.x, q.y, q.z)
      // Stripes across the trough, like the real ones.
      const k = Math.floor(i / 3) % 2 ? 0.86 : 1
      col.push(c.r * k, c.g * k, c.b * k)
    }
    rimR.push(p.clone().addScaledVector(side, r).addScaledVector(up, r))
    rimL.push(p.clone().addScaledVector(side, -r).addScaledVector(up, r))
  }
  const idx: number[] = []
  for (let i = 0; i < segs; i++)
    for (let j = 0; j < P_; j++) {
      const a = i * (P_ + 1) + j
      const b = a + P_ + 1
      idx.push(a, b, a + 1, b, b + 1, a + 1)
    }
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  geo.setAttribute('color', new BufferAttribute(new Float32Array(col), 3))
  geo.setIndex(idx)
  geo.computeVertexNormals()
  g.add(new Mesh(bag.add(geo), shellMaterial(bag)))
  g.add(solid(merge([rimL, rimR].map((pts) => bake(new TubeGeometry(new CatmullRomCurve3(pts), segs, 0.05, 6), rim))), bag, 2))
  return g
}

/** A thin shell seen from both sides (the inside of a slide), colored per vertex. One per build: it goes with the
 *  build's bag (a material shared across mounts would be disposed under the next mount's shader compile). */
const shells = new WeakMap<Bag, MeshToonMaterial>()
function shellMaterial(bag: Bag) {
  let m = shells.get(bag)
  if (!m) {
    m = bag.add(new MeshToonMaterial({ vertexColors: true, gradientMap: toonGradient(), side: DoubleSide }))
    shells.set(bag, m)
  }
  return m
}

/** A climbing net on a vertical face: a lattice of ropes in a frame. `x` across, from y0 to y1, at depth z (pink here,
 *  black in the hall's Big Frame). */
export function net(x0: number, x1: number, y0: number, y1: number, z: number, along: 'x' | 'z' = 'x', color = HL.net) {
  const parts = []
  const w = x1 - x0
  const h = y1 - y0
  const cols = Math.max(3, Math.round(w / 0.28))
  const rows = Math.max(4, Math.round(h / 0.28))
  const at = (a: number, y: number): V3 => (along === 'x' ? [a, y, z] : [z, y, a])
  const box = (a: number, b: number, c: number) => (along === 'x' ? [a, b, c] : [c, b, a]) as [number, number, number]
  for (let i = 0; i <= cols; i++) parts.push(P.box(...box(0.04, h, 0.04), color, { at: at(x0 + (w * i) / cols, y0 + h / 2) }))
  for (let j = 0; j <= rows; j++) parts.push(P.box(...box(w, 0.04, 0.04), color, { at: at(x0 + w / 2, y0 + (h * j) / rows) }))
  return parts
}

/** A soft-play block: a padded top in one color, white sides, a colored band round the top. */
export function block([x0, x1, z0, z1]: Rect, y0: number, y1: number, top: string) {
  const w = x1 - x0
  const d = z1 - z0
  const cx = (x0 + x1) / 2
  const cz = (z0 + z1) / 2
  return [P.box(w, y1 - y0 - 0.12, d, HL.side, { at: [cx, y0 + (y1 - y0 - 0.12) / 2, cz] }), P.rbox(w + 0.04, 0.16, d + 0.04, 0.06, top, { at: [cx, y1 - 0.08, cz] }), P.box(w + 0.02, 0.1, 0.02, top, { at: [cx, y0 + (y1 - y0) * 0.5, z1 + 0.005] })]
}

/** Low padded rails along an edge from (x0, z) to (x1, z) (or along z), leaving gaps. */
function rail(y: number, from: number, to: number, at: number, gaps: [number, number][], alongX = true, color = HL.pad5) {
  const parts = []
  const cuts = [...gaps].sort((a, b) => a[0] - b[0])
  let s = from
  for (const [g0, g1] of [...cuts, [to, to] as [number, number]]) {
    const e = Math.min(g0, to)
    if (e - s > 0.15) {
      const len = e - s
      const mid = (s + e) / 2
      parts.push(P.rbox(alongX ? len : 0.12, 0.36, alongX ? 0.12 : len, 0.05, color, { at: alongX ? [mid, y + 0.18, at] : [at, y + 0.18, mid] }))
    }
    s = Math.max(s, g1)
  }
  return parts
}

export function buildHarborLand(bag: Bag): Built {
  const root = new Group()
  const picks: Group[] = []
  const add = (g: Group, pick?: string) => {
    if (pick) {
      g.userData.pick = pick
      picks.push(g)
    }
    root.add(g)
    return g
  }

  // ---- The hall: a soft mat floor in checks, the back wall with a gold Thai band and big painted shapes ----
  const [hx0, hx1, hz0, hz1] = HALL
  const tiles = []
  for (let x = hx0; x < hx1; x += 2)
    for (let z = hz0; z < hz1 + 2; z += 2) tiles.push(P.box(2, 0.1, 2, (Math.round((x - hx0) / 2) + Math.round((z - hz0) / 2)) % 2 ? HL.floorA : HL.floorB, { at: [x + 1, -0.05, z + 1] }))
  add(solid(merge(tiles), bag, 0))
  add(
    solid(
      merge([
        P.box(hx1 - hx0 + 8, 9, 0.2, HL.wall, { at: [(hx0 + hx1) / 2, 4.5, BACK_Z - 0.1] }),
        P.box(hx1 - hx0 + 8, 0.35, 0.06, HL.gold, { at: [(hx0 + hx1) / 2, 6.3, BACK_Z] }),
        ...Array.from({ length: 22 }, (_, i) => P.box(0.4, 0.4, 0.06, HL.goldDark, { at: [hx0 - 3 + i * 1.6, 6.3, BACK_Z + 0.02], rot: [0, 0, Math.PI / 4] })),
        // Painted hills and clouds on the wall ("all of Thailand in one day").
        ...[-12, -3, 6, 13].map((x, i) => P.sphere(2.6, i % 2 ? '#CFF3E3' : '#D7ECFF', { at: [x, 0.6, BACK_Z + 0.05], scale: [1.6, 1, 0.02] })),
        ...[-9, 1, 10].map((x) => P.sphere(0.7, '#FFFFFF', { at: [x, 7.4, BACK_Z + 0.05], scale: [1.8, 0.8, 0.02] })),
      ]),
      bag,
      0,
    ),
  )

  // ---- The ball pool: a padded rim (low at the front so she can be seen in it); the balls are pool.ts ----
  const [px0, px1, pz0, pz1] = POOL.rect
  add(
    solid(
      merge([
        P.rbox(px1 - px0, POOL.rim, 0.24, 0.08, HL.pad2, { at: [(px0 + px1) / 2, POOL.rim / 2, pz0 + 0.12] }),
        P.rbox(0.24, POOL.rim, pz1 - pz0, 0.08, HL.pad2, { at: [px0 + 0.12, POOL.rim / 2, (pz0 + pz1) / 2] }),
        P.rbox(0.24, POOL.rim, pz1 - pz0, 0.08, HL.pad2, { at: [px1 - 0.12, POOL.rim / 2, (pz0 + pz1) / 2] }),
        P.rbox(px1 - px0, POOL.front, 0.24, 0.08, HL.pad1, { at: [(px0 + px1) / 2, POOL.front / 2, pz1 - 0.12] }),
        P.box(px1 - px0 - 0.3, 0.02, pz1 - pz0 - 0.3, '#FFD6E7', { at: [(px0 + px1) / 2, POOL.balls - 0.12, (pz0 + pz1) / 2] }),
      ]),
      bag,
      2,
    ),
  )

  // ---- The dragon tower: its post, the deck on top, the slide winding round twice, two dragons round it ----
  const T = TOWER
  const helixPts: Vector3[] = []
  const N = 64
  const yTop = LV.top - 0.08
  for (let i = 0; i <= N; i++) {
    const k = i / N
    const a = k * T.turns * Math.PI * 2
    helixPts.push(v(T.x + Math.sin(a) * T.r, yTop + (T.bottom - yTop) * k, T.z + Math.cos(a) * T.r))
  }
  // Then out of the bottom, toward the front, into the balls.
  helixPts.push(v(T.x + 0.15, 0.5, T.z + T.r + 0.9), v(T.x + 0.35, 0.42, T.z + T.r + 1.5))
  const dragon = new CatmullRomCurve3(helixPts)
  add(trough(dragon, 0.36, HL.slide2, PAL.ink, 160, bag), 'ride:dragon')
  const dragonBody = (phase: number, color: string, head: string) => {
    const pts: Vector3[] = []
    for (let i = 0; i <= 48; i++) {
      const k = i / 48
      const a = phase + k * 2.2 * Math.PI * 2
      // (Inside the slide, round the post: she rides in front of them, never behind.)
      pts.push(v(T.x + Math.sin(a) * (T.post + 0.36), 3.9 + (0.2 - 3.9) * k, T.z + Math.cos(a) * (T.post + 0.36)))
    }
    // The head pokes out over the slide at the top, looking out.
    const out = v(Math.sin(phase + 0.6), 0, Math.cos(phase + 0.6))
    const h = v(T.x + out.x * (T.r + 0.15), LV.top - 0.55, T.z + out.z * (T.r + 0.15))
    pts.unshift(h.clone().addScaledVector(out, -0.35).setY(h.y - 0.1))
    return [
      bake(new TubeGeometry(new CatmullRomCurve3(pts), 120, 0.15, 8), color),
      // The head at the top, looking out: a round head, a long snout, gold horns and a frill.
      P.sphere(0.34, color, { at: [h.x, h.y + 0.25, h.z] }),
      P.rbox(0.36, 0.22, 0.42, 0.08, color, { at: [h.x + out.x * 0.35, h.y + 0.18, h.z + out.z * 0.35], rot: [0, Math.atan2(out.x, out.z), 0] }),
      ...[-1, 1].map((s) => P.cone(0.07, 0.36, head, { at: [h.x - out.z * 0.15 * s, h.y + 0.62, h.z + out.x * 0.15 * s], rot: [0, 0, s * 0.3] })),
      ...[-1, 1].map((s) => P.sphere(0.07, '#FFFFFF', { at: [h.x + out.x * 0.24 - out.z * 0.15 * s, h.y + 0.36, h.z + out.z * 0.24 + out.x * 0.15 * s] })),
      ...[-1, 1].map((s) => P.sphere(0.04, PAL.ink, { at: [h.x + out.x * 0.29 - out.z * 0.15 * s, h.y + 0.37, h.z + out.z * 0.29 + out.x * 0.15 * s] })),
    ]
  }
  add(
    solid(
      merge([
        P.cyl(T.post, T.post, yTop, HL.pad4, { at: [T.x, yTop / 2, T.z] }, 20),
        P.cyl(T.deck, T.deck, 0.18, HL.pad5, { at: [T.x, LV.top - 0.09, T.z] }, 28),
        P.torus(T.deck, 0.07, HL.pad1, { at: [T.x, LV.top + 0.25, T.z], rot: [Math.PI / 2, 0, 0] }),
        ...[0, 1, 2, 3, 4, 5].map((i) => P.cyl(0.04, 0.04, 0.32, HL.pad1, { at: [T.x + Math.sin(i + 2.4) * T.deck, LV.top + 0.1, T.z + Math.cos(i + 2.4) * T.deck] })),
        ...dragonBody(0, HL.dragonGreen, HL.gold),
        ...dragonBody(Math.PI, HL.dragonGold, HL.dragonGreen),
      ]),
      bag,
      2,
    ),
    'ride:dragon',
  )

  // ---- The skywalk from the top deck over the mountain to the dragon tower ----
  const [sx0, sx1, sz0, sz1] = SKYWALK
  const [tdx0, tdx1, tdz0, tdz1] = TOWER_DECK
  add(
    solid(
      merge([
        P.box(sx1 - sx0, 0.14, sz1 - sz0, HL.pad3, { at: [(sx0 + sx1) / 2, LV.top - 0.07, (sz0 + sz1) / 2] }),
        // A rope along the front (so the walkway shows) and a low wall at the back.
        ...[sx0 + 0.3, (sx0 + sx1) / 2, sx1 - 0.3].map((x) => P.cyl(0.04, 0.04, 0.5, HL.pad1, { at: [x, LV.top + 0.25, sz1] })),
        P.box(sx1 - sx0, 0.04, 0.04, HL.rope, { at: [(sx0 + sx1) / 2, LV.top + 0.48, sz1] }),
        ...rail(LV.top, sx0, sx1, sz0, [], true, HL.pad1),
        ...[sx0 + 0.6, (sx0 + sx1) / 2].map((x) => P.cyl(0.1, 0.1, LV.top, HL.pad4, { at: [x, LV.top / 2, sz0 + 0.1] })),
        P.box(tdx1 - tdx0 - 0.6, 0.1, tdz1 - tdz0 - 0.6, HL.pad5, { at: [(tdx0 + tdx1) / 2, LV.top - 0.05, (tdz0 + tdz1) / 2] }),
      ]),
      bag,
      2,
    ),
  )

  // ---- The Golden Mountain: gold tiers with lumps, a chedi on top ----
  const tiers = MOUNTAIN.tiers.flatMap(({ rect: [x0, x1, z0, z1], y }, i) => {
    const below = i ? MOUNTAIN.tiers[i - 1].y : 0
    return [P.rbox(x1 - x0, y - below + 0.1, z1 - z0, 0.22, i % 2 ? HL.goldDark : HL.gold, { at: [(x0 + x1) / 2, (below + y) / 2 - 0.05, (z0 + z1) / 2] })]
  })
  add(solid(merge(tiers), bag, 2), 'climb:mountain')
  const chedi = new Group()
  chedi.position.set(MOUNTAIN.chedi[0], LV.l1, MOUNTAIN.chedi[1])
  chedi.add(
    solid(
      merge([
        P.cyl(0.62, 0.7, 0.18, '#FFFFFF', { at: [0, 0.09, 0] }, 24),
        P.cyl(0.5, 0.58, 0.16, '#FFFFFF', { at: [0, 0.26, 0] }, 24),
        P.sphere(0.48, HL.gold, { at: [0, 0.55, 0], scale: [1, 0.9, 1] }, 24),
        P.cyl(0.14, 0.18, 0.18, HL.gold, { at: [0, 0.98, 0] }),
        ...[0, 1, 2, 3].map((i) => P.cyl(0.13 - i * 0.025, 0.15 - i * 0.025, 0.1, HL.gold, { at: [0, 1.12 + i * 0.1, 0] })),
        P.cone(0.06, 0.5, HL.gold, { at: [0, 1.75, 0] }),
      ]),
      bag,
      2,
    ),
  )
  add(chedi, 'chedi')

  // ---- The decks: L1a and L1b, the top deck on L1a, rails with gaps where the rides and nets start ----
  add(
    solid(
      merge([
        ...block(L1A, 0, LV.l1, HL.pad1),
        ...block(L1B, 0, LV.l1, HL.pad2),
        ...block(TOP, LV.l1, LV.top, HL.pad3),
        // L1a's front: the gap at the donut's lip. L1b's: the net. Its right end: the zip line. The top deck's front:
        // the net from L1a; its right end: the roller slide.
        ...rail(LV.l1, L1A[0], L1A[1], L1A[3] - 0.06, [[-5.85, -4.75]]),
        ...rail(LV.l1, L1B[0], L1B[1], L1B[3] - 0.06, [[0.75, 2.25]]),
        ...rail(LV.l1, L1B[2] + 1.2, L1B[3], L1B[1] - 0.06, [[-1.75, -0.65]], false),
        ...rail(LV.top, TOP[0], TOP[1], TOP[3] - 0.06, [[-4.85, -3.55]]),
        ...rail(LV.top, TOP[2], TOP[3], TOP[1] - 0.06, [[-3.45, -2.55]], false),
      ]),
      bag,
      2,
    ),
  )
  // Nets: up L1b's front from the ground, and up the top deck's front from L1a.
  add(solid(merge(net(0.8, 2.2, 0.05, LV.l1, 0.07)), bag, 1.5), 'climb:net-l1')
  add(solid(merge(net(-4.85, -3.55, LV.l1 + 0.05, LV.top, TOP[3] + 0.07)), bag, 1.5), 'climb:net-top')

  // ---- The rope bridge: planks that sag and bounce (moved per frame), rope rails ----
  const [bx0, bx1, bz0, bz1] = BRIDGE.rect
  const planks: Group[] = []
  const n = 8
  for (let i = 0; i < n; i++) {
    const p = solid(merge([P.rbox((bx1 - bx0) / n - 0.04, 0.07, bz1 - bz0, 0.02, i % 2 ? '#F4C98A' : '#E8B574')]), bag, 1.5)
    p.position.set(bx0 + ((i + 0.5) * (bx1 - bx0)) / n, LV.l1 - 0.04, (bz0 + bz1) / 2)
    planks.push(add(p))
  }
  add(solid(merge([bz0 - 0.02, bz1 + 0.02].map((z) => bake(new TubeGeometry(new CatmullRomCurve3([v(bx0, LV.l1 + 0.65, z), v((bx0 + bx1) / 2, LV.l1 + 0.5, z), v(bx1, LV.l1 + 0.65, z)]), 12, 0.035, 6), HL.rope))), bag, 1.5), 'bridge')
  for (const p of planks) p.userData.pick = 'bridge'
  picks.push(...planks)

  // ---- The perch, its two steps and the little slide into the pool ----
  add(solid(merge([...block(PERCH, 0, LV.perch, HL.pad4), P.rbox(0.42, 0.3, 0.9, 0.05, HL.pad1, { at: [PERCH[1] + 0.21, 0.15, 1.9] }), P.rbox(0.42, 0.6, 0.9, 0.05, HL.pad5, { at: [PERCH[1] + 0.0, 0.3, 1.9] })]), bag, 2), 'climb:steps')
  const slideLittle = new CatmullRomCurve3([v(-8.85, LV.perch + 0.02, 1.9), v(-9.4, 0.85, 1.9), v(-10.1, 0.62, 1.9), v(-10.8, 0.48, 1.9), v(-11.3, POOL.balls, 1.9)])
  add(trough(slideLittle, 0.3, HL.slide, PAL.ink, 30, bag), 'ride:slide-little')

  // ---- The Boomerang Donut: a half-pipe in front of L1a, its ring parked at the lip ----
  const D = DONUT
  {
    const pos: number[] = []
    const col: number[] = []
    const segs = 40
    const cc = new Color(HL.pad5)
    for (let i = 0; i <= segs; i++) {
      const a = D.from + ((D.to - D.from) * i) / segs
      const x = D.x + Math.sin(a) * D.r
      const y = D.bottom + D.r * (1 - Math.cos(a))
      for (const z of [D.z - D.width / 2, D.z + D.width / 2]) pos.push(x, y, z)
      const k = Math.floor(i / 4) % 2 ? 0.88 : 1
      col.push(cc.r * k, cc.g * k, cc.b * k, cc.r * k, cc.g * k, cc.b * k)
    }
    const idx: number[] = []
    for (let i = 0; i < segs; i++) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2)
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
    geo.setAttribute('color', new BufferAttribute(new Float32Array(col), 3))
    geo.setIndex(idx)
    geo.computeVertexNormals()
    const pipe = new Group()
    pipe.add(new Mesh(bag.add(geo), shellMaterial(bag)))
    const edge = (z: number) => {
      const pts: Vector3[] = []
      for (let i = 0; i <= 24; i++) {
        const a = D.from + ((D.to - D.from) * i) / 24
        pts.push(v(D.x + Math.sin(a) * D.r, D.bottom + D.r * (1 - Math.cos(a)), z))
      }
      return bake(new TubeGeometry(new CatmullRomCurve3(pts), 40, 0.06, 6), HL.net)
    }
    pipe.add(solid(merge([edge(D.z - D.width / 2), edge(D.z + D.width / 2), P.box(D.r * 1.9, 0.25, D.width, HL.side, { at: [D.x, 0.12, D.z] })]), bag, 2))
    add(pipe, 'ride:donut')
  }
  const ring = new Group()
  ring.add(solid(merge([P.torus(0.42, 0.17, HL.net, { rot: [Math.PI / 2, 0, 0] }), ...[0, 1, 2, 3].map((i) => P.sphere(0.06, '#FFFFFF', { at: [Math.sin(i * 1.57) * 0.42, 0.15, Math.cos(i * 1.57) * 0.42] }))]), bag, 2))
  add(ring, 'ride:donut')

  // ---- The zip line: two posts, the sagging cable, the trolley and its handle (moved along it) ----
  const [ax, ay, az] = ZIP.a
  const [zbx, zby, zbz] = ZIP.b
  const cable: Vector3[] = []
  for (let i = 0; i <= 16; i++) {
    const k = i / 16
    cable.push(v(ax + (zbx - ax) * k, ay + (zby - ay) * k - ZIP.sag * Math.sin(Math.PI * k), az + (zbz - az) * k))
  }
  add(
    solid(
      merge([
        P.cyl(0.08, 0.08, ay + 0.2 - LV.l1, HL.pad4, { at: [ax + 0.25, (ay + 0.2 + LV.l1) / 2, az - 0.2] }),
        P.cyl(0.1, 0.1, zby + 0.3, HL.pad4, { at: [zbx + 0.3, (zby + 0.3) / 2, zbz] }),
        bake(new TubeGeometry(new CatmullRomCurve3(cable), 32, 0.025, 5), PAL.ink),
        P.rbox(1.6, 0.08, 1.2, 0.04, HL.mat, { at: [ZIP.mat[0], 0.04, ZIP.mat[1]] }),
      ]),
      bag,
      1.5,
    ),
    'ride:zip',
  )
  const handle = new Group()
  handle.add(solid(merge([P.rbox(0.22, 0.14, 0.12, 0.04, HL.net, { at: [0, 0, 0] }), P.cyl(0.015, 0.015, 0.36, PAL.ink, { at: [0, -0.2, 0] }), P.cyl(0.03, 0.03, 0.5, HL.pad4, { at: [0, -0.38, 0], rot: [0, 0, Math.PI / 2] })]), bag, 1.5))
  handle.position.set(ax, ay, az)
  add(handle, 'ride:zip')

  // ---- The Ta-Khon roller slide: a long ramp of red rollers between rails, on posts ----
  const [rax, ray, raz] = ROLLER.a
  const [rbx, rby] = ROLLER.b
  const roller = new LineCurve3(v(rax, ray, raz), v(rbx, rby, raz))
  {
    const len = Math.hypot(rbx - rax, rby - ray)
    const ang = Math.atan2(rby - ray, rbx - rax)
    const W = ROLLER.width
    const parts = [P.box(len, 0.08, W, HL.side, { at: [0, -0.08, 0] })]
    for (let d = 0.15; d < len; d += 0.22) parts.push(P.cyl(0.045, 0.045, W - 0.08, d % 0.88 < 0.44 ? HL.roller : '#FFD0D0', { at: [d - len / 2, 0, 0], rot: [Math.PI / 2, 0, 0] }, 8))
    for (const s of [-1, 1]) parts.push(P.box(len, 0.24, 0.07, HL.pad4, { at: [0, 0.06, (s * W) / 2] }))
    const ramp = solid(merge(parts), bag, 1.5)
    ramp.position.set((rax + rbx) / 2, (ray + rby) / 2, raz)
    ramp.rotation.z = ang
    add(ramp, 'ride:roller')
    const posts = ROLLER.posts.map((x) => {
      const y = ray + ((x - rax) / (rbx - rax)) * (rby - ray)
      return P.cyl(0.1, 0.1, y, HL.pad5, { at: [x, y / 2, raz] })
    })
    add(solid(merge(posts), bag, 1.5))
  }

  // ---- The Sky Pod: a wall of round buttons that light up ----
  const skypod = new Group()
  skypod.position.set(SKYPOD.x, 0, SKYPOD.z)
  skypod.add(solid(merge([P.rbox(SKYPOD.w, 1.5, 0.14, 0.08, '#4A4170', { at: [0, 0.95, 0] }), P.box(0.1, 0.2, 0.1, '#4A4170', { at: [-0.6, 0.1, 0] }), P.box(0.1, 0.2, 0.1, '#4A4170', { at: [0.6, 0.1, 0] })]), bag, 2))
  const buttons: Mesh[] = []
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      const b = new Mesh(bag.add(P.cyl(0.16, 0.16, 0.06, '#ffffff', { rot: [Math.PI / 2, 0, 0] }, 18)), toon(PAL.lavenderDark))
      b.position.set(-0.45 + c * 0.45, 0.5 + r * 0.45, 0.09)
      skypod.add(b)
      buttons.push(b)
    }
  add(skypod, 'skypod')

  // ---- The bike race machine: two little bikes, a light column between them ----
  const bike = new Group()
  bike.position.set(BIKE.at[0], 0, BIKE.at[1])
  bike.add(
    solid(
      merge([
        ...[-0.3, 0.3].flatMap((x) => [P.box(0.08, 0.5, 0.5, HL.pad1, { at: [x, 0.35, 0] }), P.rbox(0.22, 0.08, 0.3, 0.03, PAL.ink, { at: [x, 0.62, -0.05] }), P.cyl(0.02, 0.02, 0.3, PAL.ink, { at: [x, 0.75, 0.2] }), P.box(0.3, 0.04, 0.04, PAL.ink, { at: [x, 0.9, 0.2] })]),
        P.box(0.16, 1.2, 0.16, '#4A4170', { at: [0, 0.6, -0.2] }),
      ]),
      bag,
      2,
    ),
  )
  const wheels = [-0.3, 0.3].map((x) => {
    const w = solid(merge([P.torus(0.2, 0.04, PAL.ink, { rot: [0, Math.PI / 2, 0] }), P.box(0.02, 0.36, 0.03, '#FFFFFF')]), bag, 1.5)
    w.position.set(x, 0.32, 0.12)
    bike.add(w)
    return w
  })
  const lights: Mesh[] = []
  for (let i = 0; i < 5; i++) {
    const m = new Mesh(bag.add(P.box(0.12, 0.16, 0.04, '#ffffff')), toon(PAL.lavenderDark))
    m.position.set(0, 0.2 + i * 0.22, -0.1)
    bike.add(m)
    lights.push(m)
  }
  add(bike, 'bike')

  // ---- Phi Ta Khon figures along the roller slide: patchwork robes, big masks with long noses, bells ----
  const masks = MASKS.map(([x, z], i) => {
    const r = new Group()
    r.position.set(x, 0, z)
    const robe = ['#FF6F6F', '#8EC9F5', '#8FE3C8'][i]
    r.add(solid(merge([P.cone(0.42, 1.0, robe, { at: [0, 0.5, 0] }, 12), ...[0, 1, 2, 3, 4].map((k) => P.box(0.18, 0.18, 0.04, ['#FBEA9A', '#FF8FB8', '#FFFFFF', '#C9B5F7', '#FFC83D'][(k + i) % 5], { at: [Math.sin(k * 1.3) * 0.2, 0.3 + k * 0.12, 0.3 - k * 0.04] })), ...[-1, 0, 1].map((k) => P.sphere(0.07, HL.gold, { at: [k * 0.16, 0.45, 0.36] }))]), bag, 2))
    const head = new Group()
    head.position.set(0, 1.12, 0)
    head.add(
      solid(
        merge([
          P.sphere(0.32, '#FFF7F0', { scale: [1, 1.15, 0.9] }),
          // The long nose, the big painted eyes and swirls, and the tall pointed hat.
          P.cone(0.09, 0.42, robe, { at: [0, -0.02, 0.42], rot: [Math.PI / 2, 0, 0] }),
          ...[-1, 1].map((s) => P.sphere(0.08, PAL.ink, { at: [s * 0.13, 0.08, 0.26] })),
          ...[-1, 1].map((s) => P.torus(0.1, 0.02, HL.net, { at: [s * 0.18, -0.1, 0.24] })),
          P.cone(0.2, 0.6, ['#FFC83D', '#FF8FB8', '#8FE3C8'][i], { at: [0, 0.55, -0.05] }),
          P.cyl(0.3, 0.32, 0.08, '#FFFFFF', { at: [0, 0.28, -0.05] }),
        ]),
        bag,
        2,
      ),
    )
    const tongue = new Group()
    tongue.position.set(0, -0.2, 0.25)
    tongue.add(solid(merge([P.rbox(0.12, 0.04, 0.18, 0.02, HL.net, { at: [0, 0, 0.08] })]), bag, 1))
    tongue.scale.setScalar(0.001)
    head.add(tongue)
    r.add(head)
    add(r, `mask:${i}`)
    return { root: r, head, tongue }
  })

  // ---- The cannon: a fat barrel on two wheels, aimed at the pool (where Daddy is) ----
  const cannon = new Group()
  cannon.position.set(CANNON.at[0], 0, CANNON.at[1])
  const barrel = new Group()
  barrel.position.set(0, 0.55, 0)
  barrel.add(solid(merge([P.cyl(0.2, 0.26, 0.9, HL.pad2, { at: [0, 0.32, 0], rot: [0, 0, 0] }), P.torus(0.2, 0.05, HL.net, { at: [0, 0.78, 0], rot: [Math.PI / 2, 0, 0] }), P.sphere(0.26, HL.pad2, { at: [0, -0.1, 0] })]), bag, 2))
  cannon.add(barrel)
  cannon.add(solid(merge([...[-1, 1].map((s) => P.cyl(0.28, 0.28, 0.08, HL.pad4, { at: [0, 0.3, s * 0.3], rot: [Math.PI / 2, 0, 0] }, 16)), P.box(0.4, 0.3, 0.5, HL.pad1, { at: [0, 0.35, 0] })]), bag, 2))
  add(cannon, 'cannon')

  // ---- Mommy's bench (the parents' bench by the pool) ----
  const [mx, mz] = MOMMY.bench
  add(solid(merge([P.rbox(1.4, 0.12, 0.5, 0.05, HL.pad5, { at: [mx, 0.42, mz] }), P.rbox(1.4, 0.5, 0.1, 0.05, HL.pad5, { at: [mx, 0.7, mz + 0.24] }), ...[-0.6, 0.6].map((x) => P.box(0.08, 0.4, 0.4, '#D8D2E6', { at: [mx + x, 0.2, mz] }))]), bag, 2))

  return { root, planks, ring, handle, chedi, skypod: { root: skypod, buttons }, bike: { root: bike, wheels, lights }, masks, cannon: { root: cannon, barrel }, curves: { slideLittle, dragon, roller }, picks }
}

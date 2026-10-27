// HarborLand's Big Frame, built from simple shapes in the house's toon look (greybox: no generated art), for the hall
// (hall/build.ts) and for the frame she plays in (frame.ts): the same model in both, so they always match.
//   - The frame: white padded pipes with round joints, golden padded beams along the decks, black nets round it, cream
//     cargo nets up the back where she climbs.
//   - Inside: the red climbing wall, the ball pit (Daddy in it) and the cannon, the tunnel in from the hall, the net
//     bridge, the net tunnel, the rope course over the Boomerang Donut's bowl, the zip line's platform.
//   - Round it: the twin-dragon spiral (two nagas are its rails), the Ta-Khon roller slide over the racing lanes (Phi Ta
//     Khon masks on its posts), the zip line along the front.
//   - On top: the giant Phi Ta Khon mask (its long pink nose is the slide), gold spires, the boxer kid on his little
//     ring, and the lit sign's mount and glow (its words are HTML: sign.tsx).
// Everything still is merged into a few meshes; what moves comes back as its own group.
import { AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, CatmullRomCurve3, Color, CylinderGeometry, DoubleSide, Euler, Group, Mesh, MeshBasicMaterial, MeshToonMaterial, PlaneGeometry, Quaternion, TubeGeometry, Vector3, type Curve, type Object3D } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { bake, merge, P, solid, solidMix, type V3 } from '../../../../../engine3d/geo'
import { PAL, toon, toonGradient } from '../../../../../engine3d/toon'
import { BOXER, BRIDGE, bx, CANNON, DECKS, DONUT, FRAME, LV, MASK, MASK_BASE, NET_FACE, NET_TUNNEL, NETS, NOSE, NOSE_MAT, NOSE_STEP, PIT, ROLLER, ROPE, SIGN, SPIRES, TOWER, TUNNEL, WALL, ZB, ZF, ZIP, ZIP_DECK, type Rect } from './layout'
import { BallPool } from './pool'

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

/** The Big Frame's own colors (from Dad's photos: white pipes, black nets, golden beams, the red wall). */
const C = {
  pipe: '#FFFFFF',
  joint: '#F4EEFF',
  beam: '#FFBE45',
  beamDark: '#F29B2E',
  net: '#2B2638',
  cargo: '#FFF1DC',
  red: '#FF5A5A',
  wood: '#E8B574',
  woodDark: '#C98E52',
  skin: '#F2C29A',
  naga: '#5FCB8A',
  nagaDark: '#3FA86C',
  white: '#FFFFFF',
}
const HOLDS = ['#FBEA9A', '#8FE3C8', '#8EC9F5', '#C9B5F7', '#FFFFFF', '#FF8FB8']
const TAKHON = ['#FF6F6F', '#FFC83D', '#6FCF8E', '#8EC9F5', '#FF8FB8']

export interface FrameBuilt {
  root: Group
  /** Everything with userData.pick, for taps on the canvas. */
  picks: Group[]
  /** The net bridge's planks (one mesh: `sag` lifts each plank, by its x in `plankX`), and the rope course's logs (they
   *  swing). */
  plankX: number[]
  sag(dy: number[]): void
  logs: Group[]
  ring: Group
  handle: Group
  cannon: { root: Group; barrel: Group }
  /** The giant mask (it wobbles) and its pupils (they roll). */
  mask: { root: Group; pupils: Group[] }
  /** The two nagas' heads at the top of the spiral. */
  nagas: Group[]
  boxer: { root: Group; body: Group; head: Group; armL: Group; armR: Group }
  spires: Group[]
  /** The Phi Ta Khon masks on the roller's posts (they turn and stick their tongues out). */
  takhon: { root: Group; head: Group; tongue: Group }[]
  /** The sign's glow on the nets behind its letters. */
  halo: Mesh
  pool: BallPool
  /** The rides' paths (where she sits, top to bottom). */
  curves: { nose: Curve<Vector3>; dragon: Curve<Vector3>; roller: Curve<Vector3> }
  /** Fades the nose slide's tube to a ghost (0..1) while she plays behind it. */
  noseFade(k: number): void
}

const v = (x: number, y: number, z: number) => new Vector3(x, y, z)
const UP = v(0, 1, 0)

/** A rod from a to b (a pipe, a rope, a post). */
function rod(a: V3, b: V3, r: number, c: string, seg = 8) {
  const A = v(...a)
  const d = v(...b).sub(A)
  const len = d.length()
  const e = new Euler().setFromQuaternion(new Quaternion().setFromUnitVectors(UP, d.normalize()))
  return P.cyl(r, r, len, c, { at: [A.x + (d.x * len) / 2, A.y + (d.y * len) / 2, A.z + (d.z * len) / 2], rot: [e.x, e.y, e.z] }, seg)
}

/** A flat board from a to b (`w` wide, level across): the roller slide's bed. */
function slab(a: V3, b: V3, w: number, thick: number, c: string) {
  const d = v(...b).sub(v(...a))
  const len = d.length()
  const q = new Quaternion().setFromEuler(new Euler(-Math.asin(d.y / len), Math.atan2(d.x, d.z), 0, 'YXZ'))
  const e = new Euler().setFromQuaternion(q)
  return P.box(w, thick, len, c, { at: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], rot: [e.x, e.y, e.z] })
}

/** A tube along points (a rail, a rope, a naga's body). */
function tube(pts: Vector3[], r: number, c: string, segs = 24, radial = 6) {
  return bake(new TubeGeometry(new CatmullRomCurve3(pts), segs, r, radial), c)
}

/** An open slide trough along a path: a half-pipe whose bottom is the path (where she sits), two outlined rims. */
export function trough(curve: Curve<Vector3>, r: number, color: string, rim: string, segs: number, bag: Bag, mat?: MeshToonMaterial) {
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
  g.add(new Mesh(bag.add(geo), mat ?? shellMaterial(bag)))
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

/** A climbing net on a vertical face: a lattice of ropes in a frame. `x` across, from y0 to y1, at depth z (pink in
 *  the first toy, black in the hall). */
export function net(x0: number, x1: number, y0: number, y1: number, z: number, along: 'x' | 'z' = 'x', color = HL.net) {
  return lattice(x0, x1, y0, y1, z, along, color, 0.28, 0.04)
}

/** A lattice of ropes on a vertical face: from a to b across (along x, or along z on a side face), y0 to y1, at depth
 *  `at`, a rope every `step` meters, `bar` thick. */
function lattice(a: number, b: number, y0: number, y1: number, at: number, along: 'x' | 'z', color: string, step: number, bar: number) {
  const parts: BufferGeometry[] = []
  const w = b - a
  const h = y1 - y0
  if (w <= 0.05 || h <= 0.05) return parts
  const cols = Math.max(2, Math.round(w / step))
  const rows = Math.max(2, Math.round(h / step))
  const box = (sa: number, sy: number) => (along === 'x' ? ([sa, sy, bar] as const) : ([bar, sy, sa] as const))
  const at3 = (p: number, y: number): V3 => (along === 'x' ? [p, y, at] : [at, y, p])
  for (let i = 0; i <= cols; i++) parts.push(P.box(...box(bar, h), color, { at: at3(a + (w * i) / cols, y0 + h / 2) }))
  for (let j = 0; j <= rows; j++) parts.push(P.box(...box(w, bar), color, { at: at3(a + w / 2, y0 + (h * j) / rows) }))
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

/** Pieces of a run along x with gaps cut out ([from, to] pairs): for rails and nets that leave a way through. */
function runs(from: number, to: number, gaps: [number, number][]) {
  const out: [number, number][] = []
  let s = from
  for (const [g0, g1] of [...gaps].sort((a, b) => a[0] - b[0])) {
    if (g0 > s) out.push([s, Math.min(g0, to)])
    s = Math.max(s, g1)
  }
  if (to > s) out.push([s, to])
  return out.filter(([a, b]) => b - a > 0.12)
}

/** A merged mesh (and its outline) whose parts move up and down on their own, each by the part nearest in x: the
 *  bridge's planks sag as one mesh instead of one draw call (and one outline) each. */
function sagging(group: Group, centers: number[]) {
  const parts = group.children.filter((c): c is Mesh => c instanceof Mesh).map((m) => {
    const pos = m.geometry.attributes.position as BufferAttribute
    const base = Float32Array.from(pos.array as Float32Array)
    const which = new Uint8Array(pos.count)
    for (let i = 0; i < pos.count; i++) {
      let best = 0
      for (let k = 1; k < centers.length; k++) if (Math.abs(centers[k] - base[i * 3]) < Math.abs(centers[best] - base[i * 3])) best = k
      which[i] = best
    }
    return { pos, base, which }
  })
  let last: number[] = []
  return (dy: number[]) => {
    // (Only when it moved: a still bridge uploads nothing.)
    if (dy.length === last.length && dy.every((d, i) => Math.abs(d - last[i]) < 2e-4)) return
    last = dy.slice()
    for (const { pos, base, which } of parts) {
      const a = pos.array as Float32Array
      for (let i = 0; i < pos.count; i++) a[i * 3 + 1] = base[i * 3 + 1] + dy[which[i]]
      pos.needsUpdate = true
    }
  }
}

let haloTex: CanvasTexture | null = null
/** A soft rounded glow (the light the sign's letters throw on the nets behind them). */
function haloTexture() {
  if (haloTex) return haloTex
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 128
  const x = c.getContext('2d')!
  // Only the blurred shadow of a rounded box drawn off the canvas (Safari has no canvas `filter`).
  x.shadowColor = '#FFFFFF'
  x.shadowBlur = 22
  x.shadowOffsetX = 1000
  x.fillStyle = '#FFFFFF'
  x.beginPath()
  x.roundRect(34 - 1000, 30, 188, 68, 34)
  x.fill()
  x.fill()
  haloTex = new CanvasTexture(c)
  return haloTex
}

/** A slide that's a tube (the mask's nose): see-through pink plastic with ribs round it, and a floor where she sits.
 *  `fade` (0..1) turns it into a ghost of itself, so it never hides her playing behind it. `curve` is where she sits. */
function tubeSlide(curve: Curve<Vector3>, r: number, color: string, rib: string, bag: Bag) {
  const g = new Group()
  const segs = 90
  const center: Vector3[] = []
  const frames: { p: Vector3; t: Vector3 }[] = []
  for (let i = 0; i <= segs; i++) {
    const p = curve.getPointAt(i / segs)
    const t = curve.getTangentAt(i / segs)
    const side = new Vector3().crossVectors(t, UP).normalize()
    const up = new Vector3().crossVectors(side, t).normalize()
    center.push(p.clone().addScaledVector(up, r * 0.92))
    frames.push({ p: center[i], t })
  }
  const skinMat = bag.add(new MeshToonMaterial({ color, gradientMap: toonGradient(), transparent: true, opacity: 0.4, side: DoubleSide, depthWrite: false }))
  const floorMat = bag.add(new MeshToonMaterial({ vertexColors: true, gradientMap: toonGradient(), side: DoubleSide, transparent: true }))
  const skin = new Mesh(bag.add(new TubeGeometry(new CatmullRomCurve3(center), segs, r, 18)), skinMat)
  skin.renderOrder = 3
  g.add(skin)
  g.add(trough(curve, r * 0.6, color, rib, 70, bag, floorMat))
  const ribs: BufferGeometry[] = []
  for (let i = 4; i < segs; i += 7) {
    const { p, t } = frames[i]
    const e = new Euler().setFromQuaternion(new Quaternion().setFromUnitVectors(v(0, 0, 1), t))
    ribs.push(P.torus(r + 0.01, 0.03, rib, { at: [p.x, p.y, p.z], rot: [e.x, e.y, e.z] }))
  }
  const end = frames[segs]
  const e = new Euler().setFromQuaternion(new Quaternion().setFromUnitVectors(v(0, 0, 1), end.t))
  ribs.push(P.torus(r + 0.02, 0.06, rib, { at: [end.p.x, end.p.y, end.p.z], rot: [e.x, e.y, e.z] }))
  g.add(solid(merge(ribs), bag, 1))
  const fade = (k: number) => {
    skinMat.opacity = 0.4 - 0.28 * k
    floorMat.opacity = 1 - 0.7 * k
    floorMat.depthWrite = k < 0.5
  }
  return { g, fade }
}

/** Everything under `root` merged into a few meshes, one per outline width (the hall's view of the frame, where nothing
 *  on it moves): tens of draw calls fewer. Meshes with their own materials (the slides' shells, the see-through tube,
 *  the balls, the sign's glow) stay as they are. */
function flatten(root: Group, bag: Bag) {
  root.updateMatrixWorld(true)
  const shared = toon('#ffffff', true)
  const byPx = new Map<number, BufferGeometry[]>()
  const drop: Object3D[] = []
  root.traverse((o) => {
    if (!(o instanceof Mesh) || o.userData.hull !== undefined || o.material !== shared) return
    const hull = o.parent?.children.find((c) => c.userData.hull !== undefined)
    const px = (hull?.userData.hull as number | undefined) ?? 0
    if (!byPx.has(px)) byPx.set(px, [])
    byPx.get(px)!.push(o.geometry.clone().applyMatrix4(o.matrixWorld))
    drop.push(o)
    if (hull) drop.push(hull)
  })
  for (const o of drop) o.removeFromParent()
  for (const [px, parts] of byPx) root.add(solid(merge(parts), bag, px))
}

/** The frame. `still`: for the hall, where nothing on it moves (it's merged into a few meshes, and its taps are all
 *  "the frame"). */
export function buildBigFrame(bag: Bag, still = false): FrameBuilt {
  const root = new Group()
  const picks: Group[] = []
  const add = <T extends Group>(g: T, pick?: string) => {
    if (pick) {
      g.userData.pick = pick
      picks.push(g)
    }
    root.add(g)
    return g
  }
  const { x0, x1 } = FRAME
  const xs = Array.from({ length: FRAME.cols }, (_, i) => bx(i))
  const levels = [LV.l1, LV.l2, LV.l3, LV.roof]
  const zm = (ZF + ZB) / 2

  // ---- The frame: white padded posts and pipes, a round joint where they meet, golden padded beams along the decks ----
  const frame: BufferGeometry[] = []
  for (const x of xs) for (const z of [ZF, ZB]) frame.push(P.cyl(0.1, 0.1, LV.roof, C.pipe, { at: [x, LV.roof / 2, z] }, 10), P.cyl(0.13, 0.13, 0.12, C.joint, { at: [x, 0.06, z] }, 10))
  for (const y of levels) {
    for (const x of xs) {
      frame.push(P.cyl(0.075, 0.075, ZF - ZB, C.pipe, { at: [x, y, zm], rot: [Math.PI / 2, 0, 0] }, 8))
      for (const z of [ZF, ZB]) frame.push(P.sphere(0.135, C.joint, { at: [x, y, z] }, 10))
    }
    // A white pipe all along; a golden padded beam where a deck meets the face (open bays keep just the pipe, so she's
    // seen through them).
    for (const z of [ZF, ZB]) {
      frame.push(P.cyl(0.08, 0.08, x1 - x0, C.pipe, { at: [(x0 + x1) / 2, y, z], rot: [0, 0, Math.PI / 2] }, 8))
      for (const d of DECKS) {
        if (d.y !== y || d.kind !== 'deck') continue
        const [a, b] = [bx(d.from), bx(d.to)]
        frame.push(P.rbox(b - a - 0.04, 0.16, 0.15, 0.06, C.beam, { at: [(a + b) / 2, y - 0.04, z] }), P.box(b - a - 0.06, 0.03, 0.155, C.beamDark, { at: [(a + b) / 2, y - 0.1, z] }))
      }
    }
  }
  // The decks: a padded top in the level's color, a white edge under it.
  for (const d of DECKS) {
    if (d.kind !== 'deck' && d.kind !== 'tunnel') continue
    const [a, b] = [bx(d.from), bx(d.to)]
    const [z0, z1] = d.kind === 'tunnel' ? [NET_TUNNEL.z - 0.62, NET_TUNNEL.z + 0.62] : [ZB + 0.06, ZF - 0.06]
    frame.push(P.rbox(b - a - 0.06, 0.1, z1 - z0, 0.04, d.color, { at: [(a + b) / 2, d.y - 0.05, (z0 + z1) / 2] }), P.box(b - a - 0.1, 0.05, z1 - z0 - 0.04, C.white, { at: [(a + b) / 2, d.y - 0.12, (z0 + z1) / 2] }))
  }
  // The zip line's little platform, jutting out of L2's front.
  {
    const [a, b, z0, z1] = ZIP_DECK
    frame.push(P.rbox(b - a, 0.12, z1 - z0 + 0.1, 0.05, HL.pad2, { at: [(a + b) / 2, LV.l2 - 0.06, (z0 + z1) / 2 - 0.05] }), P.rbox(b - a, 0.14, 0.12, 0.05, C.beam, { at: [(a + b) / 2, LV.l2 - 0.05, z1] }))
    frame.push(P.cyl(0.05, 0.05, 0.75, C.pipe, { at: [b - 0.05, LV.l2 + 0.37, z1 - 0.05] }), P.rbox(0.08, 0.08, z1 - z0, 0.03, C.beam, { at: [b - 0.05, LV.l2 + 0.74, (z0 + z1) / 2] }))
  }
  add(solid(merge(frame), bag, 2))

  // ---- Nets: a rail along the front of each deck, full nets round the sides and the back (black), and cream cargo
  //      nets up the back where she climbs ----
  const nets: BufferGeometry[] = []
  const railH = 0.72
  const railTops: BufferGeometry[] = []
  const frontRail = (y: number, from: number, to: number, gaps: [number, number][] = []) => {
    for (const [a, b] of runs(from + 0.11, to - 0.11, gaps)) {
      nets.push(...lattice(a, b, y + 0.04, y + railH, ZF + 0.02, 'x', C.net, 0.2, 0.022))
      railTops.push(P.cyl(0.045, 0.045, b - a, C.pipe, { at: [(a + b) / 2, y + railH, ZF + 0.02], rot: [0, 0, Math.PI / 2] }, 6))
    }
  }
  frontRail(LV.l1, bx(0), bx(1), [[bx(0) + 0.25, bx(1) - 0.25]])
  frontRail(LV.l1, bx(3), bx(4))
  frontRail(LV.l2, bx(0), bx(1))
  frontRail(LV.l2, bx(3), bx(4))
  frontRail(LV.l2, bx(5), bx(6), [[ZIP_DECK[0], ZIP_DECK[1]]])
  frontRail(LV.l3, bx(0), bx(6), [[NOSE[0][0] - 0.45, NOSE[0][0] + 0.45]])
  // The back: black nets from the mats to the roof, the cargo nets in front of them.
  for (let i = 0; i < 6; i++) nets.push(...lattice(xs[i] + 0.1, xs[i + 1] - 0.1, 0.05, LV.roof - 0.05, ZB + 0.02, 'x', C.net, 0.22, 0.02))
  // The sides: the left one leaves a way for the dragon's chute (at the bottom) and onto the slide (at the top); the
  // right one, a way onto the roller slide.
  const side = (x: number, y0: number, y1: number, gaps: [number, number][] = []) => {
    for (const [a, b] of runs(ZB + 0.1, ZF - 0.1, gaps)) nets.push(...lattice(a, b, y0 + 0.04, y1 - 0.04, x, 'z', C.net, 0.22, 0.02))
  }
  side(x0, 0, LV.l1, [[TOWER.z + TOWER.r - 0.35, TOWER.z + TOWER.r + 0.35]])
  side(x0, LV.l1, LV.l2)
  side(x0, LV.l2, LV.l3)
  side(x0, LV.l3, LV.roof, [[TOWER.z - 0.4, TOWER.z + 0.4]])
  side(x1, 0, LV.l1)
  side(x1, LV.l1, LV.l2)
  side(x1, LV.l2, LV.l3)
  side(x1, LV.l3, LV.roof, [[ROLLER.path[0][2] - 0.45, ROLLER.path[0][2] + 0.45]])
  add(solid(merge(nets), bag, 0))
  add(solid(merge(railTops), bag, 1.5))
  const cargo = (key: keyof typeof NETS, pick: string) => {
    const n = NETS[key]
    const parts = [...lattice(n.x - 0.38, n.x + 0.38, n.from + 0.05, n.to, NET_FACE, 'x', C.cargo, 0.24, 0.04), P.rbox(0.9, 0.12, 0.12, 0.05, HL.pad1, { at: [n.x, n.to + 0.06, NET_FACE] })]
    add(solid(merge(parts), bag, 1.5), pick)
  }
  cargo('netA', 'climb:net-a')
  cargo('netB', 'climb:net-b')
  cargo('netC', 'climb:net-c')

  // ---- White cut-outs hung on the back nets, like the stars and sea creatures on the real one's (Little Thailand's:
  //      a star, an elephant, a lotus, a kite) ----
  {
    const star: [number, number][] = Array.from({ length: 10 }, (_, i) => {
      const a = Math.PI / 2 + (i * Math.PI) / 5
      const r = i % 2 ? 0.13 : 0.31
      return [Math.cos(a) * r, Math.sin(a) * r]
    })
    const elephant: [number, number][] = [[-0.42, 0.02], [-0.44, 0.16], [-0.36, 0.3], [-0.16, 0.38], [0.1, 0.37], [0.2, 0.44], [0.36, 0.42], [0.45, 0.3], [0.46, 0.12], [0.5, -0.06], [0.47, -0.24], [0.4, -0.25], [0.38, -0.09], [0.32, 0.0], [0.29, -0.12], [0.29, -0.32], [0.18, -0.32], [0.16, -0.13], [-0.17, -0.13], [-0.19, -0.32], [-0.3, -0.32], [-0.33, -0.1]]
    const lotus: [number, number][] = [[0, 0.42], [0.12, 0.2], [0.3, 0.32], [0.25, 0.06], [0.38, 0.03], [0.18, -0.14], [-0.18, -0.14], [-0.38, 0.03], [-0.25, 0.06], [-0.3, 0.32], [-0.12, 0.2]]
    const kite: [number, number][] = [[0, 0.36], [0.22, 0.08], [0.12, -0.02], [0.04, -0.3], [-0.04, -0.3], [-0.12, -0.02], [-0.22, 0.08]]
    const z = ZB + 0.07
    add(
      solid(
        merge([
          P.prism(star, 0.03, C.white, { at: [bx(0) + 0.7, LV.l2 + 0.85, z] }),
          P.prism(elephant, 0.03, C.white, { at: [bx(4) + 0.72, LV.l2 + 0.95, z], scale: [1.1, 1.1, 1] }),
          P.prism(lotus, 0.03, C.white, { at: [bx(5) + 0.7, LV.l2 + 0.85, z] }),
          P.prism(kite, 0.03, C.white, { at: [bx(1) + 0.7, LV.l1 + 0.95, z], rot: [0, 0, 0.3] }),
          P.prism(star, 0.03, C.white, { at: [bx(2) + 0.75, LV.l1 + 0.8, z], scale: [0.7, 0.7, 1] }),
        ]),
        bag,
        1.5,
      ),
    )
  }

  // ---- The red climbing wall on B0's front, with holds in all the colors ----
  {
    const w = WALL.x1 - WALL.x0
    const cx = (WALL.x0 + WALL.x1) / 2
    const z = WALL.z
    // Padded panels (two columns, three rows) with white seams between them, so it reads as a real wall.
    const parts = [P.rbox(w, WALL.top - 0.04, 0.1, 0.04, C.red, { at: [cx, WALL.top / 2, z + 0.06] }), P.box(w + 0.04, 0.08, 0.12, C.white, { at: [cx, 0.04, z + 0.07] })]
    parts.push(P.box(0.03, WALL.top - 0.12, 0.02, C.white, { at: [cx, WALL.top / 2, z + 0.115] }))
    for (const k of [1, 2]) parts.push(P.box(w - 0.1, 0.03, 0.02, C.white, { at: [cx, 0.12 + ((WALL.top - 0.24) * k) / 3, z + 0.115] }))
    // Holds on a zig-zag route, one per rung, left and right turn about, each a different color; the rungs are a
    // hand's reach apart so she can see the way up.
    const rungs = 7
    for (let i = 0; i < rungs; i++) {
      const hy = 0.26 + (i * (WALL.top - 0.62)) / (rungs - 1)
      const left = i % 2 === 0
      const hx = cx + (left ? -1 : 1) * w * 0.22
      const c = HOLDS[i % HOLDS.length]
      const at: V3 = [hx, hy, z + 0.14]
      if (i % 3 === 0) parts.push(P.sphere(0.1, c, { at, scale: [1.35, 0.8, 0.6], rot: [0, 0, left ? 0.3 : -0.3] }, 10))
      else if (i % 3 === 1) parts.push(P.sphere(0.085, c, { at, scale: [1, 1, 0.65] }, 10))
      else parts.push(P.cone(0.09, 0.12, c, { at, rot: [Math.PI / 2, 0, 0] }, 6))
      // A small foot hold off to the side of each.
      parts.push(P.sphere(0.05, HOLDS[(i + 3) % HOLDS.length], { at: [cx + (left ? 1 : -1) * w * 0.3, hy + 0.12, z + 0.135], scale: [1, 0.8, 0.6] }, 8))
    }
    add(solid(merge(parts), bag, 2), 'climb:wall')
  }

  // ---- The ball pit (B1-B2): a padded rim, low at the front so she can be seen in it; the balls are pool.ts ----
  const [px0, px1, pz0, pz1] = PIT.rect
  add(
    solid(
      merge([
        P.rbox(px1 - px0, PIT.rim, 0.2, 0.07, HL.pad2, { at: [(px0 + px1) / 2, PIT.rim / 2, pz0 + 0.1] }),
        P.rbox(0.2, PIT.rim, pz1 - pz0, 0.07, HL.pad2, { at: [px0 + 0.1, PIT.rim / 2, (pz0 + pz1) / 2] }),
        P.rbox(0.2, PIT.rim, pz1 - pz0, 0.07, HL.pad2, { at: [px1 - 0.1, PIT.rim / 2, (pz0 + pz1) / 2] }),
        P.rbox(px1 - px0, PIT.front, 0.22, 0.07, HL.pad1, { at: [(px0 + px1) / 2, PIT.front / 2, pz1 - 0.11] }),
        P.box(px1 - px0 - 0.3, 0.02, pz1 - pz0 - 0.3, '#FFD6E7', { at: [(px0 + px1) / 2, PIT.balls - 0.14, (pz0 + pz1) / 2] }),
      ]),
      bag,
      2,
    ),
  )
  const pool = new BallPool(PIT.inner, PIT.balls, () => false, bag, { ceiling: LV.l1 - 0.22 })
  root.add(pool.root)

  // ---- The tunnel in from the hall: a padded pink tube into B3, dark inside ----
  {
    const T = TUNNEL
    const len = T.z0 - T.z1
    const body = bake(new CylinderGeometry(T.r, T.r, len, 22, 1, true), HL.pad1, { at: [T.x, T.y, (T.z0 + T.z1) / 2], rot: [Math.PI / 2, 0, 0] })
    add(
      solid(
        merge([
          body,
          ...[0.25, 0.5, 0.75].map((k) => P.torus(T.r + 0.01, 0.035, '#FF6FA5', { at: [T.x, T.y, T.z1 + len * k] })),
          P.torus(T.r + 0.03, 0.13, HL.pad1, { at: [T.x, T.y, T.z0] }),
          P.torus(T.r, 0.08, HL.pad5, { at: [T.x, T.y, T.z1] }),
          P.cyl(T.r, T.r, 0.02, '#4A3F5E', { at: [T.x, T.y, ZF - 0.02], rot: [Math.PI / 2, 0, 0] }, 22),
          // Its feet on the mats.
          ...[T.z0 - 0.2, T.z1 + 0.2].map((z) => P.rbox(T.r * 1.6, 0.1, 0.18, 0.04, HL.pad5, { at: [T.x, 0.05, z] })),
        ]),
        bag,
        2,
      ),
      'tunnel',
    )
  }

  // ---- The cannon: a fat barrel on two wheels, on the mats in B3, aimed at Daddy in the balls ----
  const cannon = new Group()
  cannon.position.set(CANNON.at[0], 0, CANNON.at[1])
  const barrel = new Group()
  barrel.position.set(0, 0.5, 0)
  barrel.add(solid(merge([P.cyl(0.17, 0.22, 0.75, HL.pad2, { at: [0, 0.27, 0] }), P.torus(0.17, 0.045, HL.net, { at: [0, 0.65, 0], rot: [Math.PI / 2, 0, 0] }), P.sphere(0.22, HL.pad2, { at: [0, -0.08, 0] }), ...[0.1, 0.38].map((y) => P.torus(0.2, 0.025, HL.gold, { at: [0, y, 0], rot: [Math.PI / 2, 0, 0] }))]), bag, 2))
  cannon.add(barrel)
  cannon.add(solid(merge([...[-1, 1].map((s) => P.cyl(0.24, 0.24, 0.07, HL.pad4, { at: [0, 0.26, s * 0.26], rot: [Math.PI / 2, 0, 0] }, 16)), ...[-1, 1].map((s) => P.sphere(0.05, HL.goldDark, { at: [0, 0.26, s * 0.3] })), P.rbox(0.36, 0.28, 0.42, 0.06, HL.pad1, { at: [0, 0.3, 0] })]), bag, 2))
  add(cannon, 'cannon')

  // ---- The net bridge on L1 (B1-B2): planks that sag and bounce (moved per frame), rope rails and side nets ----
  const [bx0, bx1, bz0, bz1] = BRIDGE.rect
  const pw = (bx1 - bx0) / BRIDGE.planks
  const plankX = Array.from({ length: BRIDGE.planks }, (_, i) => bx0 + (i + 0.5) * pw)
  const planks = add(
    solid(
      merge(
        plankX.flatMap((x, i) => {
          const at = (dz: number, dy = 0): V3 => [x, LV.l1 - 0.04 + dy, (bz0 + bz1) / 2 + dz]
          return [P.rbox(pw - 0.05, 0.07, bz1 - bz0, 0.02, i % 2 ? C.wood : '#F4C98A', { at: at(0) }), P.box(pw - 0.04, 0.02, 0.05, C.woodDark, { at: at((bz1 - bz0) / 2 - 0.1, -0.04) }), P.box(pw - 0.04, 0.02, 0.05, C.woodDark, { at: at(-(bz1 - bz0) / 2 + 0.1, -0.04) })]
        }),
      ),
      bag,
      1.5,
    ),
    'bridge',
  )
  const sag = sagging(planks, plankX)
  {
    const sag = (z: number, y: number, s: number) => [v(bx0, y, z), v((bx0 + bx1) / 2, y - s, z), v(bx1, y, z)]
    const parts = [bz0 - 0.03, bz1 + 0.03].flatMap((z) => [tube(sag(z, LV.l1 + 0.68, 0.14), 0.035, C.cargo, 16), tube(sag(z, LV.l1 + 0.02, BRIDGE.sag), 0.03, C.cargo, 16)])
    // Net hanging down each side (between the rope and the planks), in black.
    for (const z of [bz0 - 0.03, bz1 + 0.03]) {
      for (let i = 0; i <= 12; i++) {
        const x = bx0 + ((bx1 - bx0) * i) / 12
        const k = Math.sin((Math.PI * i) / 12)
        parts.push(rod([x, LV.l1 + 0.02 - BRIDGE.sag * k, z], [x, LV.l1 + 0.68 - 0.14 * k, z], 0.012, C.net, 4))
      }
      for (const f of [0.33, 0.66]) {
        const pts = Array.from({ length: 9 }, (_, i) => {
          const x = bx0 + ((bx1 - bx0) * i) / 8
          const k = Math.sin((Math.PI * i) / 8)
          return v(x, LV.l1 + 0.02 - BRIDGE.sag * k + (0.66 - 0.02 + (BRIDGE.sag - 0.14) * k) * f, z)
        })
        parts.push(tube(pts, 0.012, C.net, 16, 4))
      }
    }
    add(solid(merge(parts), bag, 1), 'bridge')
  }

  // ---- The net tunnel on L2 (B1-B2): hoops and lines of black net, padded pink rings at its ends ----
  {
    const T = NET_TUNNEL
    const parts: BufferGeometry[] = []
    const n = Math.round((T.x1 - T.x0) / 0.24)
    for (let i = 1; i < n; i++) parts.push(P.torus(T.r, 0.016, C.net, { at: [T.x0 + ((T.x1 - T.x0) * i) / n, T.y, T.z], rot: [0, Math.PI / 2, 0] }))
    for (let k = 0; k < 18; k++) {
      const a = (k / 18) * Math.PI * 2
      if (Math.sin(a) < -0.75) continue
      parts.push(P.box(T.x1 - T.x0, 0.022, 0.022, C.net, { at: [(T.x0 + T.x1) / 2, T.y + Math.sin(a) * T.r, T.z + Math.cos(a) * T.r] }))
    }
    add(solid(merge(parts), bag, 0))
    add(solid(merge([T.x0 + 0.06, T.x1 - 0.06].map((x) => P.torus(T.r + 0.02, 0.07, HL.pad1, { at: [x, T.y, T.z], rot: [0, Math.PI / 2, 0] }))), bag, 2))
  }

  // ---- The rope course on L2 (B4), over the donut's bowl: logs hanging on ropes (they swing), hand ropes ----
  const [rx0, rx1, rz0, rz1] = ROPE.rect
  const logs: Group[] = []
  const hang = LV.l3 - 0.12 - LV.l2
  for (let i = 0; i < ROPE.logs; i++) {
    const x = rx0 + ((i + 0.5) * (rx1 - rx0)) / ROPE.logs
    const g = new Group()
    g.position.set(x, LV.l3 - 0.12, (rz0 + rz1) / 2)
    const d = rz1 - rz0
    g.add(
      solid(
        merge([
          P.cyl(0.13, 0.13, d - 0.04, i % 2 ? C.wood : '#F4C98A', { at: [0, -hang - 0.02, 0], rot: [Math.PI / 2, 0, 0] }, 12),
          ...[-1, 1].map((s) => P.cyl(0.1, 0.1, 0.012, C.woodDark, { at: [0, -hang - 0.02, (s * (d - 0.04)) / 2], rot: [Math.PI / 2, 0, 0] }, 12)),
          ...[-1, 1].map((s) => P.cyl(0.014, 0.014, hang, C.cargo, { at: [0, -hang / 2, s * (d / 2 - 0.12)] }, 5)),
        ]),
        bag,
        1.5,
      ),
    )
    logs.push(add(g, 'rope'))
  }
  {
    const parts = [rz0 - 0.04, rz1 + 0.04].flatMap((z) => [tube([v(rx0, LV.l2 + 0.75, z), v((rx0 + rx1) / 2, LV.l2 + 0.6, z), v(rx1, LV.l2 + 0.75, z)], 0.03, C.cargo, 12)])
    add(solid(merge(parts), bag, 1), 'rope')
  }

  // ---- The Boomerang Donut: a half-pipe in B4-B5 under L2, its ring (a frosted donut) parked at the left lip ----
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
      return tube(pts, 0.06, HL.net, 40)
    }
    // Its edges, the padded base and a low padded rail in front of the open bay.
    pipe.add(solid(merge([edge(D.z - D.width / 2), edge(D.z + D.width / 2), P.rbox(D.r * 1.6, 0.18, D.width + 0.1, 0.06, C.white, { at: [D.x, 0.09, D.z] }), P.rbox(bx(6) - bx(4) - 0.2, 0.32, 0.14, 0.06, HL.pad4, { at: [(bx(4) + bx(6)) / 2 + 0.35, 0.16, ZF + 0.02] })]), bag, 2))
    add(pipe, 'ride:donut')
  }
  const ring = new Group()
  ring.add(
    solid(
      merge([
        P.torus(0.42, 0.17, C.wood, { rot: [Math.PI / 2, 0, 0] }),
        P.torus(0.42, 0.15, HL.pad1, { at: [0, 0.07, 0], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.75] }),
        ...Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2
          const rr = 0.42 + ((i % 3) - 1) * 0.07
          return P.capsule(0.016, 0.05, HOLDS[i % HOLDS.length], { at: [Math.cos(a) * rr, 0.19, Math.sin(a) * rr], rot: [Math.PI / 2, 0, a * 1.7] })
        }),
      ]),
      bag,
      2,
    ),
  )
  add(ring, 'ride:donut')

  // ---- The zip line: the cable along the front, its post and mat at the low end, the trolley and handle ----
  const [ax, ay, az] = ZIP.a
  const [zbx, zby, zbz] = ZIP.b
  {
    const cable: Vector3[] = []
    for (let i = 0; i <= 16; i++) {
      const k = i / 16
      cable.push(v(ax + (zbx - ax) * k, ay + 0.12 + (zby - ay) * k - ZIP.sag * Math.sin(Math.PI * k), az + (zbz - az) * k))
    }
    const [px, pz] = ZIP.post
    cable.push(v(px, zby + 0.25, pz))
    add(
      solid(
        merge([
          tube(cable, 0.022, PAL.ink, 40, 5),
          // The brackets off the frame's posts at each end (gold-capped), the mat she lands on.
          rod([x1, ay + 0.12, ZF], [ax + 0.05, ay + 0.12, az], 0.05, C.pipe),
          rod([px, zby + 0.25, ZF], [px, zby + 0.25, pz], 0.05, C.pipe),
          P.sphere(0.09, HL.gold, { at: [px, zby + 0.25, pz] }, 10),
          P.rbox(0.95, 0.08, 0.7, 0.04, HL.mat, { at: [ZIP.mat[0] + 0.2, 0.04, ZIP.mat[1] - 0.02] }),
        ]),
        bag,
        1.5,
      ),
      'ride:zip',
    )
  }
  const handle = new Group()
  handle.add(solid(merge([P.rbox(0.22, 0.14, 0.12, 0.04, HL.net, { at: [0, 0.12, 0] }), P.cyl(0.015, 0.015, 0.36, PAL.ink, { at: [0, -0.08, 0] }), P.cyl(0.035, 0.035, 0.5, HL.pad4, { at: [0, -0.26, 0], rot: [Math.PI / 2, 0, 0] })]), bag, 1.5))
  handle.position.set(ax, ay, az)
  add(handle, 'ride:zip')

  // ---- The twin-dragon spiral: a red-and-gold post, the white slide winding twice round it, out through B0's side
  //      into the ball pit. Its rails are the two nagas (green outside, gold inside); their heads rear up at the top ----
  const T = TOWER
  const helix: Vector3[] = []
  const N = 72
  const a0 = Math.PI / 2
  const yTop = T.top - 0.06
  for (let i = 0; i <= N; i++) {
    const k = i / N
    const a = a0 + k * T.turns * Math.PI * 2
    helix.push(v(T.x + Math.sin(a) * T.r, yTop + (T.bottom - yTop) * k, T.z + Math.cos(a) * T.r))
  }
  // Then straight out (behind the red wall), over the pit's rim, into the balls.
  const exitZ = T.z + T.r
  helix.push(v(T.x + 0.55, 0.55, exitZ), v(bx(0) + 0.3, 0.6, exitZ), v(bx(1) - 0.2, 0.64, exitZ), v(bx(1) + 0.25, 0.56, exitZ))
  const dragon = new CatmullRomCurve3(helix)
  add(trough(dragon, T.trough, C.white, HL.goldDark, 220, bag), 'ride:dragon')
  {
    const rail = (side: 1 | -1) => {
      const pts: Vector3[] = []
      for (let i = 0; i <= 96; i++) {
        const u = (i / 96) * 0.9
        const p = dragon.getPointAt(u)
        const t = dragon.getTangentAt(u)
        const s = new Vector3().crossVectors(t, UP).normalize()
        pts.push(p.addScaledVector(s, side * T.trough).add(v(0, T.trough + 0.02, 0)))
      }
      return pts
    }
    const parts: BufferGeometry[] = [
      P.cyl(T.post, T.post, T.top + 0.7, '#E85A5A', { at: [T.x, (T.top + 0.7) / 2, T.z] }, 14),
      ...Array.from({ length: 8 }, (_, i) => P.torus(T.post + 0.01, 0.03, HL.gold, { at: [T.x, 0.35 + i * 0.62, T.z], rot: [Math.PI / 2, 0, 0] })),
      // A gold lotus bud on top, a padded foot.
      P.sphere(0.2, HL.gold, { at: [T.x, T.top + 0.82, T.z], scale: [1, 1.3, 1] }, 14),
      P.cone(0.07, 0.36, HL.gold, { at: [T.x, T.top + 1.18, T.z] }),
      ...[0, 1, 2, 3, 4, 5].map((i) => P.sphere(0.1, HL.goldDark, { at: [T.x + Math.sin(i) * 0.17, T.top + 0.66, T.z + Math.cos(i) * 0.17], scale: [0.7, 1.3, 0.7] }, 8)),
      P.cyl(0.32, 0.36, 0.2, HL.pad5, { at: [T.x, 0.1, T.z] }, 18),
    ]
    // The nagas' bodies (the slide's rails), with a row of scales down each back.
    const outer = rail(1)
    const inner = rail(-1)
    parts.push(tube(outer, 0.075, C.naga, 260, 7), tube(inner, 0.07, HL.gold, 260, 7))
    for (let i = 4; i < outer.length - 2; i += 3) {
      parts.push(P.sphere(0.04, C.nagaDark, { at: [outer[i].x, outer[i].y + 0.065, outer[i].z] }, 6), P.sphere(0.038, HL.goldDark, { at: [inner[i].x, inner[i].y + 0.06, inner[i].z] }, 6))
    }
    add(solid(merge(parts), bag, 2), 'ride:dragon')
  }
  // The heads, rearing up either side of the slide's mouth, looking out at her.
  const nagas = [1, -1].map((side) => {
    const g = new Group()
    const start = dragon.getPointAt(0)
    const t = dragon.getTangentAt(0)
    const s = new Vector3().crossVectors(t, UP).normalize()
    const base = start.clone().addScaledVector(s, side * T.trough).addScaledVector(t, -0.4)
    g.position.set(base.x, base.y + T.trough, base.z)
    g.scale.setScalar(1.55)
    const body = side > 0 ? C.naga : HL.gold
    const dark = side > 0 ? C.nagaDark : HL.goldDark
    const belly = side > 0 ? '#FBEA9A' : '#FFF1C9'
    const crest = side > 0 ? HL.gold : '#FF6F6F'
    g.add(
      solid(
        merge([
          // The neck curling up and back, then the head looking toward us (+z).
          tube([v(0, 0, 0), v(0, 0.25, 0.1), v(0, 0.5, 0.05), v(0, 0.62, -0.08)], 0.085, body, 16, 8),
          P.sphere(0.17, body, { at: [0, 0.72, 0], scale: [1, 0.9, 1.05] }, 14),
          P.rbox(0.2, 0.13, 0.22, 0.06, body, { at: [0, 0.68, 0.17] }),
          P.rbox(0.16, 0.05, 0.18, 0.025, belly, { at: [0, 0.615, 0.18] }),
          // Nostrils, two little fangs, the curly crest (a fan of flames) and the beard.
          ...[-1, 1].map((k) => P.sphere(0.018, PAL.ink, { at: [k * 0.05, 0.72, 0.28] }, 6)),
          ...[-1, 1].map((k) => P.cone(0.016, 0.06, '#FFFFFF', { at: [k * 0.06, 0.6, 0.23], rot: [Math.PI, 0, 0] }, 5)),
          ...[-2, -1, 0, 1, 2].map((k) => P.cone(0.045, 0.3 - Math.abs(k) * 0.04, crest, { at: [k * 0.07, 0.9, -0.08], rot: [-0.55, 0, -k * 0.38] }, 6)),
          ...[-1, 1].map((k) => P.cone(0.03, 0.22, crest, { at: [k * 0.16, 0.74, -0.04], rot: [0, 0, k * 1.4] }, 5)),
          P.cone(0.035, 0.12, dark, { at: [0, 0.56, 0.1], rot: [Math.PI, 0, 0] }, 5),
          // Big friendly eyes.
          ...[-1, 1].flatMap((k) => [P.sphere(0.06, '#FFFFFF', { at: [k * 0.085, 0.78, 0.12], scale: [1, 1.1, 0.7] }, 10), P.sphere(0.033, PAL.ink, { at: [k * 0.085, 0.78, 0.165] }, 8), P.sphere(0.011, '#FFFFFF', { at: [k * 0.075, 0.795, 0.19] }, 5)]),
        ]),
        bag,
        2,
      ),
    )
    return add(g, `naga:${side > 0 ? 0 : 1}`)
  })

  // ---- The Ta-Khon roller slide: red, white and gold rollers between festival-striped walls, over the racing lanes,
  //      on white posts with Phi Ta Khon masks watching ----
  const roller = new CatmullRomCurve3(ROLLER.path.map((p) => v(...p)))
  {
    const W = ROLLER.width
    const len = roller.getLength()
    const parts: BufferGeometry[] = []
    const rollerColors = ['#FF6F6F', '#FFFFFF', '#FFC83D']
    let n = 0
    for (let d = 0.12; d < len - 0.05; d += 0.17, n++) {
      const u = d / len
      const p = roller.getPointAt(u)
      const t = roller.getTangentAt(u)
      const s = new Vector3().crossVectors(t, UP).normalize()
      const a = p.clone().addScaledVector(s, -W / 2 + 0.05)
      const b = p.clone().addScaledVector(s, W / 2 - 0.05)
      parts.push(rod([a.x, a.y, a.z], [b.x, b.y, b.z], 0.05, rollerColors[n % 3], 8))
    }
    // The bed under the rollers and the walls each side, in Phi Ta Khon festival stripes.
    const segs = 28
    for (let i = 0; i < segs; i++) {
      const u0 = i / segs
      const u1 = (i + 1) / segs
      const p0 = roller.getPointAt(u0)
      const p1 = roller.getPointAt(u1)
      const t = roller.getTangentAt((u0 + u1) / 2)
      const s = new Vector3().crossVectors(t, UP).normalize()
      for (const k of [-1, 1]) {
        const o = s.clone().multiplyScalar((k * W) / 2)
        parts.push(rod([p0.x + o.x, p0.y + 0.06, p0.z + o.z], [p1.x + o.x, p1.y + 0.06, p1.z + o.z], 0.06, TAKHON[(i + (k > 0 ? 2 : 0)) % TAKHON.length], 8))
      }
      parts.push(slab([p0.x, p0.y - 0.08, p0.z], [p1.x, p1.y - 0.08, p1.z], W, 0.07, '#F4EEFF'))
    }
    // The posts down to the mats (behind the lanes), each with an arm out to the bed.
    for (const x of ROLLER.posts) {
      let best = 0
      for (let i = 0; i <= 100; i++) if (Math.abs(roller.getPointAt(i / 100).x - x) < Math.abs(roller.getPointAt(best / 100).x - x)) best = i
      const p = roller.getPointAt(best / 100)
      parts.push(P.cyl(0.075, 0.09, p.y + 0.35, C.pipe, { at: [x, (p.y + 0.35) / 2, ROLLER.postZ] }, 10), rod([x, p.y - 0.14, ROLLER.postZ], [p.x, p.y - 0.14, p.z], 0.05, C.pipe), P.sphere(0.1, HL.gold, { at: [x, p.y + 0.38, ROLLER.postZ] }, 10))
    }
    // The start gate: two gold-topped posts on L3.
    const s0 = roller.getPointAt(0)
    for (const dz of [-W / 2 - 0.08, W / 2 + 0.08]) parts.push(P.cyl(0.05, 0.05, 0.85, HL.gold, { at: [s0.x - 0.2, LV.l3 + 0.42, s0.z + dz] }), P.sphere(0.08, HL.gold, { at: [s0.x - 0.2, LV.l3 + 0.88, s0.z + dz] }, 8))
    add(solid(merge(parts), bag, 1.5), 'ride:roller')
  }
  const takhon = ROLLER.posts.map((x, i) => {
    let best = 0
    for (let k = 0; k <= 100; k++) if (Math.abs(roller.getPointAt(k / 100).x - x) < Math.abs(roller.getPointAt(best / 100).x - x)) best = k
    const p = roller.getPointAt(best / 100)
    const r = new Group()
    r.position.set(x, p.y + 0.48, ROLLER.postZ)
    const head = new Group()
    head.position.set(0, 0.28, 0)
    const robe = TAKHON[i % TAKHON.length]
    head.add(
      solid(
        merge([
          P.sphere(0.24, '#FFF7F0', { scale: [1, 1.15, 0.9] }, 14),
          // The long nose, big painted eyes and swirls, a grin, and the tall pointed hat on its rim.
          P.cone(0.065, 0.32, robe, { at: [0, -0.02, 0.32], rot: [Math.PI / 2, 0, 0] }, 10),
          ...[-1, 1].flatMap((s) => [P.sphere(0.065, '#FFFFFF', { at: [s * 0.1, 0.07, 0.19], scale: [1, 1, 0.5] }, 10), P.sphere(0.035, PAL.ink, { at: [s * 0.1, 0.07, 0.22] }, 8), P.torus(0.075, 0.015, TAKHON[(i + 2) % 5], { at: [s * 0.1, 0.07, 0.19] }), P.torus(0.05, 0.014, '#FF6F6F', { at: [s * 0.15, -0.1, 0.17] })]),
          P.torus(0.08, 0.018, PAL.ink, { at: [0, -0.15, 0.18], rot: [0, 0, Math.PI] }, Math.PI),
          P.cone(0.15, 0.48, TAKHON[(i + 1) % 5], { at: [0, 0.48, -0.04] }, 12),
          P.cyl(0.24, 0.25, 0.06, '#FFFFFF', { at: [0, 0.23, -0.04] }, 14),
          P.sphere(0.035, HL.gold, { at: [0, 0.74, -0.04] }, 6),
        ]),
        bag,
        2,
      ),
    )
    const tongue = new Group()
    tongue.position.set(0, -0.16, 0.18)
    tongue.add(solid(merge([P.rbox(0.09, 0.03, 0.15, 0.015, HL.net, { at: [0, 0, 0.06] })]), bag, 1))
    tongue.scale.setScalar(0.001)
    head.add(tongue)
    r.add(head)
    add(r, `takhon:${i}`)
    return { root: r, head, tongue }
  })

  // ---- The giant Phi Ta Khon mask on the roof: a white face with a gold crown, big painted eyes and swirls, a grin,
  //      little ears; its long pink nose comes down off the face and turns into the slide ----
  const nose = new CatmullRomCurve3(NOSE.map((p) => v(...p)))
  const noseTube = tubeSlide(nose, 0.46, HL.pad1, '#E0447E', bag)
  add(noseTube.g, 'ride:nose')
  const M = MASK
  const maskRoot = new Group()
  maskRoot.position.set(M.x, M.y, M.z)
  // (Not deep, front to back: she walks round behind it on L3.)
  const fz = 0.58
  maskRoot.add(
    solid(
      merge([
        P.sphere(1.0, '#FFF7F0', { scale: [1, 1.12, 0.62] }, 28),
        // The gold crown: a band, five points with balls, a pink jewel in the middle.
        P.cyl(0.66, 0.8, 0.34, HL.gold, { at: [0, 0.98, -0.05], scale: [1, 1, 0.75] }, 22),
        P.torus(0.72, 0.045, HL.goldDark, { at: [0, 0.84, -0.05], rot: [Math.PI / 2, 0, 0], scale: [1, 0.75, 1] }),
        ...[-2, -1, 0, 1, 2].flatMap((k) => {
          const a = k * 0.42
          return [P.cone(0.13, k ? 0.42 : 0.56, HL.gold, { at: [Math.sin(a) * 0.62, 1.32 + (k ? 0 : 0.07), Math.cos(a) * 0.4 - 0.05] }, 10), P.sphere(0.06, k ? HL.goldDark : HL.pad1, { at: [Math.sin(a) * 0.62, k ? 1.56 : 1.67, Math.cos(a) * 0.4 - 0.05] }, 8)]
        }),
        P.sphere(0.1, '#FF4F9A', { at: [0, 1.0, 0.56], scale: [1, 1.2, 0.5] }, 10),
        // Painted flames on the forehead.
        ...[-1, 0, 1].map((k) => P.sphere(0.1, ['#6FCF8E', '#FF6F6F', '#8EC9F5'][k + 1], { at: [k * 0.28, 0.66, fz - 0.05 - Math.abs(k) * 0.06], scale: [0.7, 1.4, 0.35], rot: [0, 0, -k * 0.35] }, 10)),
        // The eyes' painted rings and the brows.
        ...[-1, 1].flatMap((k) => [P.torus(0.24, 0.045, '#FF6F6F', { at: [k * 0.38, 0.22, fz - 0.03], rot: [0, k * 0.4, 0] }), P.torus(0.31, 0.03, '#6FCF8E', { at: [k * 0.38, 0.22, fz - 0.08], rot: [0, k * 0.4, 0] }, Math.PI), P.rbox(0.36, 0.07, 0.06, 0.03, '#3F365F', { at: [k * 0.4, 0.56, fz - 0.07], rot: [0, k * 0.4, -k * 0.22] })]),
        ...[-1, 1].map((k) => P.sphere(0.2, '#FFFFFF', { at: [k * 0.38, 0.22, fz - 0.06], scale: [1, 1.05, 0.45] }, 14)),
        // Pink cheeks with swirls, the big grin with teeth, the little ears.
        ...[-1, 1].flatMap((k) => [P.sphere(0.15, '#FFB3CF', { at: [k * 0.6, -0.15, fz - 0.24], scale: [1, 0.8, 0.35], rot: [0, k * 0.6, 0] }, 10), P.torus(0.08, 0.02, '#FF6F6F', { at: [k * 0.6, -0.15, fz - 0.17], rot: [0, k * 0.6, 0] })]),
        P.torus(0.42, 0.06, '#5A2F45', { at: [0, -0.42, fz - 0.24], rot: [0.25, 0, Math.PI] }, Math.PI),
        ...[-3, -2, -1, 1, 2, 3].map((k) => P.box(0.08, 0.09, 0.04, '#FFFFFF', { at: [k * 0.11, -0.47 - Math.abs(k) * 0.012, fz - 0.17 - Math.abs(k) * 0.02] })),
        ...[-1, 1].map((k) => P.sphere(0.22, '#FF8FB8', { at: [k * 0.98, 0.15, -0.15], scale: [0.35, 0.8, 0.6] }, 12)),
        // The long nose, from between the eyes down to the slide's mouth.
        P.capsule(0.15, 0.55, HL.pad1, { at: [0, -0.15, fz + 0.1], rot: [-0.32, 0, 0] }),
        P.sphere(0.22, HL.pad1, { at: [0, -0.52, fz + 0.28] }, 14),
      ]),
      bag,
      2,
    ),
  )
  const pupils = [-1, 1].map((k) => {
    const g = new Group()
    g.position.set(k * 0.38, 0.22, fz + 0.04)
    g.add(solid(merge([P.sphere(0.1, PAL.ink, { scale: [1, 1, 0.5] }, 12), P.sphere(0.035, '#FFFFFF', { at: [-0.03, 0.04, 0.04] }, 6)]), bag, 0))
    maskRoot.add(g)
    return g
  })
  add(maskRoot, 'mask')
  // The pedestal it sits on, the padded step up to the slide's mouth, and the nose slide's mat.
  {
    const [mx0, mx1, mz0, mz1] = MASK_BASE
    add(
      solid(
        merge([
          P.rbox(mx1 - mx0, M.y - 1.05 - LV.l3, mz1 - mz0, 0.08, '#FFFFFF', { at: [M.x, (M.y - 1.05 + LV.l3) / 2, (mz0 + mz1) / 2] }),
          P.box(mx1 - mx0 + 0.02, 0.08, mz1 - mz0 + 0.02, HL.gold, { at: [M.x, M.y - 1.1, (mz0 + mz1) / 2] }),
          P.rbox(0.5, NOSE_STEP[1] - LV.l3, 0.55, 0.05, HL.pad4, { at: [NOSE_STEP[0], (NOSE_STEP[1] + LV.l3) / 2, NOSE_STEP[2]] }),
          P.rbox(NOSE_MAT[1] - NOSE_MAT[0], 0.1, NOSE_MAT[3] - NOSE_MAT[2], 0.04, HL.mat, { at: [(NOSE_MAT[0] + NOSE_MAT[1]) / 2, 0.05, (NOSE_MAT[2] + NOSE_MAT[3]) / 2] }),
        ]),
        bag,
        2,
      ),
      'ride:nose',
    )
  }

  // ---- Gold temple spires on the roof's corners: tiers, a bell, rings, a needle ----
  const spires = SPIRES.map(([sx, sy, sz], i) => {
    const g = new Group()
    g.position.set(sx, sy, sz)
    const s = i === 0 ? 1.15 : 1
    g.scale.setScalar(s)
    g.add(
      solid(
        merge([
          ...[0, 1, 2].map((k) => P.rbox(0.5 - k * 0.1, 0.1, 0.5 - k * 0.1, 0.03, k % 2 ? HL.goldDark : HL.gold, { at: [0, 0.08 + k * 0.1, 0] })),
          P.sphere(0.19, HL.gold, { at: [0, 0.48, 0], scale: [1, 1.05, 1] }, 14),
          P.cyl(0.09, 0.12, 0.08, HL.goldDark, { at: [0, 0.67, 0] }, 12),
          ...[0, 1, 2, 3, 4].map((k) => P.cyl(0.085 - k * 0.012, 0.1 - k * 0.012, 0.07, k % 2 ? HL.goldDark : HL.gold, { at: [0, 0.75 + k * 0.075, 0] }, 12)),
          P.cone(0.04, 0.42, HL.gold, { at: [0, 1.32, 0] }, 8),
          P.sphere(0.035, '#FFFFFF', { at: [0, 1.55, 0] }, 6),
        ]),
        bag,
        2,
      ),
    )
    return add(g, `spire:${i}`)
  })

  // ---- The boxer kid (a Muay Thai boy in a red headband) sitting on the edge of his little ring on top ----
  const B = BOXER
  const boxer = new Group()
  boxer.position.set(B.x, B.base, B.z)
  boxer.add(
    solid(
      merge([
        // His tower: a blue drum with gold trim, the ring's floor, corner posts and its red, white and blue ropes.
        P.cyl(0.32, 0.36, B.h, '#5D7BB0', { at: [0, B.h / 2, 0] }, 18),
        P.torus(0.34, 0.04, HL.gold, { at: [0, 0.06, 0], rot: [Math.PI / 2, 0, 0] }),
        P.rbox(0.8, 0.1, 0.8, 0.03, '#FFFFFF', { at: [0, B.h + 0.05, 0] }),
        ...[-1, 1].flatMap((a) => [-1, 1].map((b) => P.cyl(0.025, 0.025, 0.4, HL.gold, { at: [a * 0.38, B.h + 0.28, b * 0.38] }, 6))),
        ...['#FF6F6F', '#FFFFFF', '#5D7BB0'].flatMap((c, k) => [
          P.box(0.76, 0.018, 0.018, c, { at: [0, B.h + 0.2 + k * 0.08, -0.38] }),
          ...[-1, 1].map((a) => P.box(0.018, 0.018, 0.76, c, { at: [a * 0.38, B.h + 0.2 + k * 0.08, 0] })),
        ]),
      ]),
      bag,
      2,
    ),
  )
  const body = new Group()
  body.position.set(0, B.h + 0.1, 0.22)
  body.add(
    solid(
      merge([
        // Blue shorts with a gold band, a bare chest, legs dangling over the ring's edge.
        P.rbox(0.36, 0.16, 0.3, 0.07, '#3E6FD8', { at: [0, 0.08, 0] }),
        P.box(0.37, 0.04, 0.31, HL.gold, { at: [0, 0.17, 0] }),
        P.capsule(0.15, 0.1, C.skin, { at: [0, 0.32, 0] }),
        ...[-1, 1].flatMap((k) => [P.capsule(0.06, 0.12, '#3E6FD8', { at: [k * 0.1, 0.02, 0.17], rot: [Math.PI / 2, 0, 0] }), P.capsule(0.05, 0.16, C.skin, { at: [k * 0.1, -0.13, 0.26], rot: [0.2, 0, 0] }), P.sphere(0.06, C.skin, { at: [k * 0.1, -0.28, 0.29], scale: [1, 0.7, 1.3] }, 8)]),
      ]),
      bag,
      2,
    ),
  )
  boxer.add(body)
  const head = new Group()
  head.position.set(0, 0.56, 0)
  head.add(
    solidMix(
      [
        P.sphere(0.24, C.skin, { scale: [1, 0.95, 0.95] }, 18),
        // Black hair on top, the red headband (mongkhon) and its tail.
        P.sphere(0.245, '#2B2330', { at: [0, 0.06, -0.03], scale: [1, 0.75, 0.95] }, 16),
        P.torus(0.235, 0.04, '#E8403F', { at: [0, 0.09, 0], rot: [Math.PI / 2 - 0.12, 0, 0] }),
        P.capsule(0.03, 0.18, '#E8403F', { at: [0, 0.02, -0.28], rot: [-1.0, 0, 0] }),
        ...[-1, 1].map((k) => P.sphere(0.06, C.skin, { at: [k * 0.23, 0, 0], scale: [0.5, 1, 1] }, 8)),
      ],
      [
        ...[-1, 1].flatMap((k) => [P.sphere(0.04, PAL.ink, { at: [k * 0.08, 0.0, 0.2], scale: [1, 1.2, 0.6] }, 8), P.sphere(0.013, '#FFFFFF', { at: [k * 0.08 - 0.012, 0.018, 0.225] }, 5), P.sphere(0.04, '#FF9AB0', { at: [k * 0.14, -0.07, 0.17], scale: [1, 0.6, 0.4] }, 8)]),
        P.torus(0.05, 0.014, '#8A3B3B', { at: [0, -0.09, 0.2], rot: [0, 0, Math.PI] }, Math.PI),
      ],
      bag,
      2,
    ),
  )
  body.add(head)
  // His arms: red gloves, the prajioud bands on his arms. The right one punches the air.
  const arm = (k: 1 | -1) => {
    const g = new Group()
    g.position.set(k * 0.17, 0.4, 0)
    g.add(solid(merge([P.capsule(0.045, 0.12, C.skin, { at: [0, -0.1, 0] }), P.torus(0.05, 0.018, '#E8403F', { at: [0, -0.04, 0], rot: [Math.PI / 2, 0, 0] }), P.sphere(0.1, '#E8403F', { at: [0, -0.24, 0.02] }, 12), P.box(0.1, 0.03, 0.1, '#FFFFFF', { at: [0, -0.15, 0.02] })]), bag, 2))
    body.add(g)
    return g
  }
  const armL = arm(-1)
  const armR = arm(1)
  armL.rotation.set(-0.5, 0, -0.35)
  armR.rotation.set(-0.2, 0, 2.6)
  add(boxer, 'boxer')

  // ---- The lit sign's mount: slim dark rails for its letters, standoffs to the frame, and the glow they throw ----
  {
    const [sx, sy, sz] = SIGN.at
    add(
      solid(
        merge([
          P.rbox(SIGN.w + 0.2, 0.09, 0.07, 0.03, '#2B2638', { at: [sx, sy - 0.27, sz - 0.02] }),
          P.rbox(SIGN.w * 0.74, 0.07, 0.06, 0.03, '#2B2638', { at: [sx, sy - 0.72, sz - 0.02] }),
          P.rbox(1.2, 0.07, 0.06, 0.03, '#2B2638', { at: [sx, sy + 0.4, sz - 0.02] }),
          ...[-0.45, 0.45].map((d) => P.cyl(0.025, 0.025, 0.12, '#2B2638', { at: [sx + d, sy + 0.42, sz - 0.08], rot: [Math.PI / 2, 0, 0] }, 6)),
        ]),
        bag,
        1,
      ),
    )
  }
  const halo = new Mesh(bag.add(new PlaneGeometry(SIGN.w * 1.32, SIGN.h * 1.55)), bag.add(new MeshBasicMaterial({ map: haloTexture(), color: '#6FCBFF', transparent: true, opacity: 0.6, blending: AdditiveBlending, depthWrite: false })))
  halo.position.set(SIGN.at[0], SIGN.at[1] - 0.18, SIGN.at[2] - 0.06)
  halo.renderOrder = 2
  root.add(halo)

  ring.position.set(DONUT.x + Math.sin(DONUT.from) * (DONUT.r - 0.2), DONUT.bottom + DONUT.r - Math.cos(DONUT.from) * (DONUT.r - 0.2), DONUT.z)
  ring.rotation.z = DONUT.from
  if (still) {
    flatten(root, bag)
    picks.length = 0
    for (const c of root.children) if (c instanceof Group) picks.push(c)
  }
  return { root, picks, plankX, sag, logs, ring, handle, cannon: { root: cannon, barrel }, mask: { root: maskRoot, pupils }, nagas, boxer: { root: boxer, body, head, armL, armR }, spires, takhon, halo, pool, curves: { nose, dragon, roller }, noseFade: noseTube.fade }
}

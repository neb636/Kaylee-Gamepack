// The floating board: where the game table's games are played. Once she sits on her stool the screen fades, and the
// board is out on a little floating island in a pastel sky, with no characters in sight (the cousin plays from their
// face at the side of the screen). Under the board: a grass top with a cream path round it and a pink dice tray in
// front, a strata rock underneath that tapers to a point (pink, lilac, lavender) with crystals hanging off it. Round
// the board, each game dresses the island its own way (a rainbow and cotton-candy trees for the Unicorn game,
// lollipops, candy canes and gumdrops for Candy Land, a playground for Chutes and Ladders), and every prop wobbles and
// makes a sound when she taps it. Round the island: clouds drifting past below and around, little islands bobbing far
// off, two striped hot-air balloons rising, and twinkles in the air.
//
// It isn't a second scene: it's drawn in the house's own scene, on its own camera layer (STAGE_LAYER), right where the
// table top is. The plugin switches the house camera (and its taps) to that layer, so the house and everyone in it
// vanish and only the stage shows; the board, the pieces and the die keep the table top's space exactly as before.
// The island hangs off the table top (`top`), so its gentle bob carries the board and pieces with it; the sky is in
// the world, round the table top's place.
import { BufferAttribute, BufferGeometry, CanvasTexture, CatmullRomCurve3, Color, CylinderGeometry, Fog, Group, Mesh, MeshBasicMaterial, PlaneGeometry, Points, PointsMaterial, SphereGeometry, RepeatWrapping, SRGBColorSpace, TubeGeometry, Vector3, type Object3D, type Scene, type Texture } from 'three'
import { makeLights, PAL } from '../../../../../engine3d/toon'
import type { Bag } from '../../../../../engine3d/dispose'
import { bake, merge, P, solid } from '../../../../../engine3d/geo'
import { TUNE } from '../../../../../engine3d/tune'
import type { GameId } from './list'
import { unicornParts } from './pieces'

/** The camera layer the stage is drawn on (the house is on layer 0). */
export const STAGE_LAYER = 3

/** Every mesh under `o` on the stage's layer only. */
export function onStage(o: Object3D) {
  o.traverse((c) => c.layers.set(STAGE_LAYER))
}

const GRASS = '#A9E59B'
const GRASS_DARK = '#8FD68A'
const PATH = '#FFF1DE'
const TRAY = '#FFD3E6'
const SOIL = '#FBCBA8'
/** The rock's strata, top to bottom. */
const STRATA = ['#F9B8CB', '#F2A6C9', '#DDB0EE', '#C6B4F6', '#AE9FEA']
const TRUNK = '#D8A983'
const CLOUD = '#FFFFFF'
const CLOUD_UNDER = '#EADFFF'
const FOG = '#FBDDEC'

/** The island's top, in the table top's space (x across, z toward the camera): the board (0.6 x 0.72) in the middle,
 *  a margin round it for the props, more in front for the die. */
const ISLAND = { w: 1.08, d: 1.22, z: 0.04 }
/** The pond in the front-right corner, its waterfall pouring off the island's front edge. */
const POND = { x: 0.3, z: 0.585, r: 0.045 }

/** A tiny deterministic random (the island looks the same every visit). */
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}
/** A smooth bump field from a position (the same corner of the rock always gets the same dent). */
const hash = (x: number, y: number, z: number) => Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453 - Math.floor(Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453)

/** The rock under the island: a faceted cone tapering to a point, its vertices pushed in and out, colored in strata
 *  by height (with a ragged edge between bands). */
function rock(rx: number, rz: number, h: number, colors: string[], o: { at: [number, number, number]; seed?: number; seg?: number }): BufferGeometry {
  const seed = o.seed ?? 1
  const g = new CylinderGeometry(1, 1, h, o.seg ?? 11, 7)
  const pos = g.attributes.position as BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const top = y > h / 2 - 1e-4
    // Round-bellied, then tapering to a point (so it shows under the island's edge from above).
    const v = (h / 2 - y) / h
    const vv = Math.min(1, Math.max(0, v))
    const f = Math.max(0.03, Math.pow(1 - vv, 0.85) * (1 + 0.3 * Math.sin(vv * Math.PI)))
    const k = top ? 1 : f * (0.84 + 0.32 * hash(Math.round(x * 50) + seed, Math.round(y * 50), Math.round(z * 50)))
    pos.setXYZ(i, x * rx * k, y, z * rz * k)
  }
  const geo = bake(g, colors[0], { at: o.at })
  geo.computeVertexNormals()
  const col = geo.attributes.color as BufferAttribute
  const p = geo.attributes.position as BufferAttribute
  const c = new Color()
  const y0 = o.at[1] + h / 2
  for (let i = 0; i < p.count; i += 3) {
    // One band per triangle (by its middle), so the bands have facet edges like painted rock.
    const my = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3
    const mx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3
    const f = Math.min(0.999, Math.max(0, (y0 - my) / h + (hash(mx * 9, my * 9, seed) - 0.5) * 0.12))
    c.set(colors[Math.floor(Math.pow(f, 0.6) * colors.length)])
    for (let j = 0; j < 3; j++) col.setXYZ(i + j, c.r, c.g, c.b)
  }
  return geo
}

/** A puffy cloud: overlapping balls, white on top and a soft lilac underneath. */
function cloudParts(size: number, seed: number): BufferGeometry[] {
  const r = rng(seed)
  const n = 5 + Math.floor(r() * 3)
  const parts: BufferGeometry[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / (n - 1) - 0.5) * 2
    const rad = size * (0.32 + 0.22 * (1 - Math.abs(a)) + r() * 0.08)
    parts.push(P.sphere(rad, CLOUD, { at: [a * size * 0.62, rad * 0.35 + (1 - Math.abs(a)) * size * 0.1, (r() - 0.5) * size * 0.35], scale: [1, 0.82, 0.9] }, 14))
  }
  // A flat base, so it sits like a cartoon cloud.
  parts.push(P.sphere(size * 0.55, CLOUD_UNDER, { at: [0, 0, 0], scale: [1.45, 0.32, 0.7] }, 14))
  return parts
}

/** A round tree: a trunk and two or three balls of leaves. */
function tree(x: number, z: number, h: number, leaf: string, leaf2: string, r = 1): BufferGeometry[] {
  return [
    P.cyl(0.011 * r, 0.016 * r, h * 0.55, TRUNK, { at: [x, h * 0.275, z] }, 8),
    P.sphere(0.055 * r, leaf, { at: [x, h * 0.62, z] }, 12),
    P.sphere(0.04 * r, leaf2, { at: [x + 0.028 * r, h * 0.78, z + 0.01] }, 12),
    P.sphere(0.036 * r, leaf, { at: [x - 0.03 * r, h * 0.74, z - 0.006] }, 12),
  ]
}
/** A pine: three stacked cones. */
function pine(x: number, z: number, h: number, c: string): BufferGeometry[] {
  return [P.cyl(0.01, 0.012, h * 0.25, TRUNK, { at: [x, h * 0.125, z] }, 8), ...[0, 1, 2].map((i) => P.cone(0.05 - i * 0.012, h * 0.42, c, { at: [x, h * (0.38 + i * 0.2), z] }, 9))]
}
/** A little pastel cottage with a pointy roof, a door and a window. */
function cottage(x: number, z: number, wall: string, roof: string, rotY = 0): BufferGeometry[] {
  const w = 0.085
  const d = 0.075
  const h = 0.065
  const parts = [
    P.rbox(w, h, d, 0.008, wall, { at: [0, h / 2, 0] }),
    P.prism(
      [
        [-w / 2 - 0.012, 0],
        [w / 2 + 0.012, 0],
        [0, 0.055],
      ],
      d + 0.016,
      roof,
      { at: [0, h, 0] },
    ),
    P.rbox(0.022, 0.034, 0.006, 0.004, '#C98B6B', { at: [0, 0.017, d / 2 + 0.002] }),
    P.rbox(0.018, 0.018, 0.006, 0.003, PAL.sky, { at: [0.026, 0.042, d / 2 + 0.002] }),
    P.rbox(0.012, 0.03, 0.012, 0.003, roof, { at: [-0.022, h + 0.035, -0.01] }),
  ]
  const g = merge(parts)
  g.rotateY(rotY)
  g.translate(x, 0, z)
  return [g]
}
/** A mushroom: a stem and a spotty cap. */
function mushroom(x: number, z: number, s: number, cap: string): BufferGeometry[] {
  return [
    P.cyl(0.011 * s, 0.014 * s, 0.03 * s, PAL.cream, { at: [x, 0.015 * s, z] }, 10),
    P.sphere(0.026 * s, cap, { at: [x, 0.03 * s, z], scale: [1, 0.62, 1] }, 12),
    ...[0, 2.1, 4.2].map((a) => P.sphere(0.0055 * s, '#FFFFFF', { at: [x + Math.cos(a) * 0.016 * s, 0.043 * s, z + Math.sin(a) * 0.016 * s] }, 6)),
  ]
}
/** A lollipop: a stick and a swirly disc facing the camera. */
function lollipop(x: number, z: number, h: number, c: string, c2: string): BufferGeometry[] {
  const r = h * 0.3
  return [
    P.cyl(0.005, 0.005, h, '#FFFFFF', { at: [x, h / 2, z] }, 8),
    P.cyl(r, r, 0.014, c, { at: [x, h + r * 0.75, z], rot: [Math.PI / 2, 0, 0] }, 20),
    ...[0.72, 0.44].map((k, i) => P.torus(r * k, r * 0.09, i % 2 ? c : c2, { at: [x, h + r * 0.75, z + 0.008] }, Math.PI * 2)),
    P.sphere(r * 0.18, c2, { at: [x, h + r * 0.75, z + 0.008], scale: [1, 1, 0.4] }, 10),
  ]
}
/** A candy cane: a red-and-white striped stick with its hook. */
function candyCane(x: number, z: number, h: number, rotY: number): BufferGeometry[] {
  const pts: Vector3[] = []
  const n = 14
  for (let i = 0; i <= n; i++) pts.push(new Vector3(0, (h * 0.78 * i) / n, 0))
  const hr = h * 0.16
  for (let i = 1; i <= 8; i++) {
    const a = (Math.PI * i) / 8
    pts.push(new Vector3(hr - Math.cos(a) * hr, h * 0.78 + Math.sin(a) * hr, 0))
  }
  const parts = pts.map((p, i) => P.sphere(0.011, i % 2 ? '#FFFFFF' : '#FF4F6E', { at: [p.x, p.y, p.z] }, 8))
  const g = merge(parts)
  g.rotateY(rotY)
  g.translate(x, 0.008, z)
  return [g]
}
/** A gumdrop: a sugary dome. */
const gumdrop = (x: number, z: number, s: number, c: string) => [P.sphere(0.024 * s, c, { at: [x, 0.012 * s, z], scale: [1, 1.05, 1] }, 12), P.cyl(0.024 * s, 0.024 * s, 0.012 * s, c, { at: [x, 0.006 * s, z] }, 12)]
/** A cupcake: a striped cup, a swirl of frosting and a cherry. */
function cupcake(x: number, z: number, cup: string, icing: string): BufferGeometry[] {
  return [
    P.cyl(0.03, 0.022, 0.032, cup, { at: [x, 0.016, z] }, 12),
    P.sphere(0.034, icing, { at: [x, 0.04, z], scale: [1, 0.55, 1] }, 14),
    P.sphere(0.024, icing, { at: [x, 0.058, z], scale: [1, 0.6, 1] }, 12),
    P.sphere(0.011, '#FF3B6B', { at: [x, 0.075, z] }, 10),
  ]
}
/** An ice-cream tree: a waffle cone, tip down, with two scoops. */
function iceCream(x: number, z: number, a: string, b: string): BufferGeometry[] {
  return [P.cone(0.026, 0.07, '#EDB874', { at: [x, 0.035, z], rot: [Math.PI, 0, 0] }, 10), P.sphere(0.032, a, { at: [x, 0.078, z] }, 14), P.sphere(0.025, b, { at: [x, 0.112, z] }, 12)]
}
/** A star on a stick. */
function starWand(x: number, z: number, h: number, c: string): BufferGeometry[] {
  const pts: [number, number][] = []
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2
    const r = i % 2 ? 0.014 : 0.032
    pts.push([Math.cos(a) * r, Math.sin(a) * r])
  }
  return [P.cyl(0.004, 0.004, h, PAL.cream, { at: [x, h / 2, z] }, 6), P.prism(pts, 0.012, c, { at: [x, h + 0.02, z] })]
}
/** A rainbow arch, along x, its feet in two clouds. */
function rainbow(x: number, z: number, r: number): BufferGeometry[] {
  const bands = ['#FF8FB0', '#FFB27A', '#FFE37A', '#8FE3A8', '#8FCBFF', '#C7A6FF']
  const t = r * 0.06
  return [
    ...bands.map((c, i) => P.torus(r - i * t * 1.9, t, c, { at: [x, 0, z] }, Math.PI)),
    ...[-1, 1].flatMap((s) => [P.sphere(r * 0.24, CLOUD, { at: [x + s * r * 0.82, r * 0.08, z], scale: [1.2, 0.8, 1] }, 12), P.sphere(r * 0.17, CLOUD, { at: [x + s * r * 1.05, r * 0.05, z + 0.02] }, 12)]),
  ]
}
/** A playground slide with its ladder: two rails and rungs up the back, a curved candy-pink slide down the front. */
function slide(x: number, z: number, rotY: number): BufferGeometry[] {
  const h = 0.14
  const parts: BufferGeometry[] = []
  for (const s of [-1, 1]) parts.push(P.cyl(0.004, 0.004, h + 0.02, PAL.gold, { at: [s * 0.022, (h + 0.02) / 2, -0.05], rot: [0.18, 0, 0] }, 6))
  for (let i = 1; i <= 5; i++) parts.push(P.cyl(0.003, 0.003, 0.044, PAL.gold, { at: [0, (h * i) / 6, -0.05 + (h * i) / 6 * 0.18], rot: [0, 0, Math.PI / 2] }, 6))
  parts.push(P.rbox(0.06, 0.008, 0.04, 0.003, PAL.sky, { at: [0, h, -0.03] }))
  const curve = new CatmullRomCurve3([new Vector3(0, h, -0.01), new Vector3(0, h * 0.72, 0.04), new Vector3(0, h * 0.25, 0.09), new Vector3(0, 0.012, 0.13)])
  parts.push(bake(new TubeGeometry(curve, 16, 0.018, 8, false), PAL.hotpink))
  const g = merge(parts)
  g.rotateY(rotY)
  g.translate(x, 0, z)
  return [g]
}
/** A swing set: an A-frame each end, a bar, two seats on ropes. */
function swings(x: number, z: number, rotY: number): BufferGeometry[] {
  const h = 0.12
  const parts: BufferGeometry[] = []
  for (const sx of [-0.07, 0.07]) for (const sz of [-1, 1]) parts.push(P.cyl(0.004, 0.005, h * 1.04, PAL.sky, { at: [sx, h / 2, sz * 0.022], rot: [sz * 0.36, 0, 0] }, 6))
  parts.push(P.cyl(0.005, 0.005, 0.15, PAL.hotpink, { at: [0, h, 0], rot: [0, 0, Math.PI / 2] }, 8))
  for (const sx of [-0.032, 0.032]) {
    for (const s of [-1, 1]) parts.push(P.cyl(0.0015, 0.0015, h * 0.66, PAL.ink, { at: [sx + s * 0.012, h * 0.65, 0] }, 4))
    parts.push(P.rbox(0.032, 0.006, 0.018, 0.002, sx < 0 ? PAL.butter : PAL.mint, { at: [sx, h * 0.31, 0] }))
  }
  const g = merge(parts)
  g.rotateY(rotY)
  g.translate(x, 0, z)
  return [g]
}
/** A hot-air balloon: an envelope striped in gores, a basket, four ropes. */
function balloonParts(a: string, b: string): BufferGeometry[] {
  const env = new SphereGeometry(0.16, 16, 12)
  const geo = bake(env, a, { scale: [1, 1.12, 1] })
  const col = geo.attributes.color as BufferAttribute
  const p = geo.attributes.position as BufferAttribute
  const ca = new Color(a)
  const cb = new Color(b)
  for (let i = 0; i < p.count; i += 3) {
    const ang = Math.atan2((p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3, (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3)
    const c = Math.floor(((ang + Math.PI) / (Math.PI * 2)) * 8) % 2 ? cb : ca
    for (let j = 0; j < 3; j++) col.setXYZ(i + j, c.r, c.g, c.b)
  }
  return [
    geo,
    P.cone(0.07, 0.08, a, { at: [0, -0.18, 0], rot: [Math.PI, 0, 0] }, 16),
    P.rbox(0.06, 0.045, 0.06, 0.01, '#D8A983', { at: [0, -0.3, 0] }),
    ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => P.cyl(0.002, 0.002, 0.09, PAL.ink, { at: [sx * 0.026, -0.245, sz * 0.026] }, 4))),
  ]
}
/** A small far island: a grass cap on a faceted rock, a tree or a cottage on top. */
function miniIsland(r: number, seed: number, top: 'tree' | 'house' | 'pine'): BufferGeometry[] {
  const parts = [P.cyl(r, r * 0.96, 0.05, GRASS, { at: [0, -0.025, 0] }, 9), P.cyl(r * 0.98, r * 0.92, 0.04, SOIL, { at: [0, -0.07, 0] }, 9), rock(r * 0.92, r * 0.92, r * 1.6, STRATA.slice(1), { at: [0, -0.09 - r * 0.8, 0], seed, seg: 8 })]
  if (top === 'tree') parts.push(...tree(0, 0, 0.16, GRASS_DARK, '#B7EBA6', 1.4))
  else if (top === 'pine') parts.push(...pine(-0.03, 0.02, 0.2, '#7FD3A1'), ...pine(0.05, -0.02, 0.15, '#93DDB0'))
  else parts.push(...cottage(0, 0, '#FFF1F6', PAL.hotpink, 0.4))
  return parts
}

/** A prop she can tap: it wobbles like jelly. */
interface Prop {
  root: Group
  t: number
  /** What it sounds like (the plugin plays it). */
  sound: 'boing' | 'chime' | 'plink' | 'giggle' | 'pop'
}

/** The pastel sky behind it all: blue at the top through lilac to pink and peach, a soft sun glow up on the right. */
function skyTexture(bag: Bag): Texture {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 512
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 0, 512)
  grad.addColorStop(0, '#B4D3FF')
  grad.addColorStop(0.38, '#DCD6FF')
  grad.addColorStop(0.7, '#FFD6EA')
  grad.addColorStop(1, '#FFE6DA')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 512)
  const t = bag.add(new CanvasTexture(c))
  t.colorSpace = SRGBColorSpace
  return t
}

/** A soft round twinkle for the sparkles in the air. */
function twinkleTexture(bag: Bag): Texture {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  r.addColorStop(0, 'rgba(255,255,255,1)')
  r.addColorStop(0.25, 'rgba(255,240,250,.9)')
  r.addColorStop(1, 'rgba(255,220,240,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 64, 64)
  // A four-point glint across it.
  g.fillStyle = 'rgba(255,255,255,.95)'
  g.beginPath()
  g.moveTo(32, 2)
  g.quadraticCurveTo(35, 29, 62, 32)
  g.quadraticCurveTo(35, 35, 32, 62)
  g.quadraticCurveTo(29, 35, 2, 32)
  g.quadraticCurveTo(29, 29, 32, 2)
  g.fill()
  const t = bag.add(new CanvasTexture(c))
  t.colorSpace = SRGBColorSpace
  return t
}

export class FloatingStage {
  /** The island (under the board, in the table top's space). */
  readonly island = new Group()
  /** The sky round it (in the world). */
  readonly sky = new Group()
  private themes = new Map<GameId, Group>()
  private props: Prop[] = []
  private clouds: { o: Group; r: number; a: number; y: number; speed: number; bob: number }[] = []
  private far: { o: Group; base: Vector3; phase: number }[] = []
  private balloons: { o: Group; x: number; z: number; y: number; speed: number; phase: number }[] = []
  private twinkles: Points
  private twinkleBase: Float32Array
  private skyTex: Texture
  private saved: { background: Scene['background']; fog: Scene['fog'] } | null = null
  private fog = new Fog(FOG, 3.6, 12)
  private time = 0
  /** The board just changed: it pops in (0..1). */
  private popT = -1
  private popping: Object3D | null = null
  /** The table top's own height, which the bob rides on. */
  private baseY: number

  constructor(
    private bag: Bag,
    /** The table top (the board, pieces and die hang off it); the island goes under it. */
    private top: Group,
    /** The table top's place in the world (the sky is built round it). */
    center: Vector3,
  ) {
    this.baseY = top.position.y
    this.skyTex = skyTexture(bag)
    this.buildIsland()
    for (const g of ['unicorn', 'candy', 'chutes'] as GameId[]) this.themes.set(g, this.buildTheme(g))
    this.buildSky()
    // The sky's own lights (the house's are on its layer): a warm sun from the front right, a soft fill.
    const lights = makeLights(this.sky)
    lights.follow(0, 0, 0)
    lights.sun.position.set(2.4, 5, 4.2)
    lights.ambient.intensity = TUNE.ambient * Math.PI * 1.04
    // Twinkles drifting in the air round the island.
    const n = 70
    const r = rng(7)
    this.twinkleBase = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2
      const d = 0.55 + r() * 1.5
      this.twinkleBase.set([Math.cos(a) * d, -0.5 + r() * 1.1, Math.sin(a) * d - 0.2], i * 3)
    }
    const geo = bag.add(new BufferGeometry())
    geo.setAttribute('position', new BufferAttribute(this.twinkleBase.slice(), 3))
    this.twinkles = new Points(geo, bag.add(new PointsMaterial({ map: twinkleTexture(bag), size: 0.035, transparent: true, depthWrite: false, opacity: 0.9, sizeAttenuation: true, fog: false })))
    this.twinkles.frustumCulled = false
    this.sky.add(this.twinkles)
    this.sky.position.copy(center)
    onStage(this.island)
    onStage(this.sky)
    this.show(false)
  }

  // ---------------------------------------------------------------- the island

  private buildIsland() {
    const { w, d, z } = ISLAND
    const parts: BufferGeometry[] = [
      // Grass on top, its edge drooping a little over the soil like icing.
      P.rbox(w, 0.04, d, 0.028, GRASS, { at: [0, -0.02, z] }),
      P.rbox(w - 0.01, 0.05, d - 0.01, 0.025, SOIL, { at: [0, -0.06, z] }),
      // A chunky band of pink rock with straight sides (the island's edge, seen from the camera), then the strata rock
      // tapering down to a point under it.
      P.rbox(w - 0.03, 0.1, d - 0.03, 0.03, STRATA[0], { at: [0, -0.13, z] }),
      P.rbox(w - 0.06, 0.04, d - 0.06, 0.02, STRATA[1], { at: [0, -0.19, z] }),
      rock(w * 0.46, d * 0.46, 0.72, STRATA.slice(1), { at: [0, -0.56, z], seed: 3 }),
      // The pond in the front-right corner, its stones, and the stream to the edge (the waterfall pours off there).
      P.cyl(POND.r, POND.r, 0.006, '#8FD3FF', { at: [POND.x, 0.001, POND.z] }, 20),
      P.cyl(POND.r * 0.6, POND.r * 0.6, 0.004, '#BDE7FF', { at: [POND.x - 0.01, 0.003, POND.z - 0.008] }, 16),
      ...Array.from({ length: 11 }, (_, i) => {
        const a = (i / 11) * Math.PI * 2
        return Math.sin(a) > 0.72 ? P.box(0.001, 0.001, 0.001, GRASS) : P.sphere(0.011, i % 2 ? '#E8E0F6' : '#FFFFFF', { at: [POND.x + Math.cos(a) * POND.r, 0.004, POND.z + Math.sin(a) * POND.r], scale: [1, 0.6, 1] }, 7)
      }),
      P.box(0.05, 0.006, 0.07, '#8FD3FF', { at: [POND.x, 0.0, ISLAND.z + ISLAND.d / 2 - 0.03] }),
      // Mist puffs where the waterfall fades, far below.
      ...[0, 1, 2].map((i) => P.sphere(0.03 - i * 0.006, '#FFFFFF', { at: [POND.x + (i - 1) * 0.03, -0.6 + i * 0.012, ISLAND.z + ISLAND.d / 2 + 0.01], scale: [1.3, 0.8, 1] }, 10)),
      // The cream path round the board, and the pink tray in front where the die rolls and the cards sit.
      P.rbox(0.68, 0.012, 0.8, 0.02, PATH, { at: [0, -0.0045, 0] }),
      P.rbox(0.58, 0.012, 0.17, 0.035, TRAY, { at: [0, -0.003, 0.425] }),
      P.rbox(0.54, 0.004, 0.13, 0.03, '#FFE3EF', { at: [0, 0.003, 0.425] }),
    ]
    // Drips of grass over the soil all round the edge.
    const r = rng(11)
    const drip = (x: number, zz: number) => parts.push(P.sphere(0.024 + r() * 0.012, GRASS, { at: [x, -0.04, zz], scale: [1, 0.85 + r() * 0.5, 1] }, 8))
    for (let i = 0; i <= 12; i++) {
      const x = -w / 2 + 0.03 + ((w - 0.06) * i) / 12
      drip(x, z + d / 2 - 0.012)
      drip(x, z - d / 2 + 0.012)
    }
    for (let i = 1; i < 14; i++) {
      const zz = z - d / 2 + 0.03 + ((d - 0.06) * i) / 14
      drip(-w / 2 + 0.012, zz)
      drip(w / 2 - 0.012, zz)
    }
    // Crystals hanging off the rock, and stepping stones in the grass.
    const crystals: [number, number, number, string][] = [
      [-0.24, -0.25, 0.3, '#A8DCFF'],
      [0.27, -0.22, 0.18, '#FF9FCB'],
      [0.05, -0.36, 0.33, '#D9CCFF'],
      [-0.12, -0.3, -0.28, '#FFB8D8'],
    ]
    for (const [x, y, zz, c] of crystals) parts.push(P.cone(0.03, 0.12, c, { at: [x, y, zz], rot: [Math.PI, 0, 0.1] }, 5), P.cone(0.018, 0.07, c, { at: [x + 0.03, y + 0.01, zz + 0.01], rot: [Math.PI, 0, -0.25] }, 5))
    // Flowers and grass tufts in the margin (low, so they never hide the board).
    const flowers = ['#FF8FB8', '#FFFFFF', '#FBEA9A', '#C7A6FF', '#A8DCFF']
    for (let i = 0; i < 90; i++) {
      const x = (r() - 0.5) * (w - 0.08)
      const zz = z + (r() - 0.5) * (d - 0.08)
      // Not on the path, the board or the tray.
      if (Math.abs(x) < 0.36 && zz > -0.42 && zz < 0.53) continue
      if (Math.hypot(x - POND.x, zz - POND.z) < POND.r + 0.02) continue
      if (r() < 0.55) parts.push(P.sphere(0.008, flowers[i % flowers.length], { at: [x, 0.006, zz] }, 6), P.sphere(0.004, PAL.butter, { at: [x, 0.012, zz] }, 5))
      else parts.push(P.cone(0.009, 0.022, GRASS_DARK, { at: [x, 0.008, zz] }, 5), P.cone(0.007, 0.018, GRASS_DARK, { at: [x + 0.008, 0.007, zz + 0.004], rot: [0, 0, -0.3] }, 5))
    }
    this.island.add(solid(merge(parts), this.bag, 1.6))
    this.island.add(this.waterfall())
    this.top.add(this.island)
  }

  /** The waterfall: a ribbon of streaky water pouring off the front edge, scrolling down and fading out far below. */
  private waterfall(): Mesh {
    const c = document.createElement('canvas')
    c.width = 32
    c.height = 128
    const g = c.getContext('2d')!
    g.fillStyle = '#9FDBFF'
    g.fillRect(0, 0, 32, 128)
    const r = rng(5)
    for (let i = 0; i < 22; i++) {
      g.fillStyle = i % 3 ? 'rgba(255,255,255,.85)' : 'rgba(200,236,255,.9)'
      g.fillRect(Math.floor(r() * 30), Math.floor(r() * 128), 2 + Math.floor(r() * 2), 10 + Math.floor(r() * 26))
    }
    const map = this.bag.add(new CanvasTexture(c))
    map.colorSpace = SRGBColorSpace
    map.wrapS = map.wrapT = RepeatWrapping
    map.repeat.set(1, 2.5)
    this.water = map
    const a = document.createElement('canvas')
    a.width = 4
    a.height = 64
    const ga = a.getContext('2d')!
    const grad = ga.createLinearGradient(0, 0, 0, 64)
    grad.addColorStop(0, '#fff')
    grad.addColorStop(0.55, '#ddd')
    grad.addColorStop(1, '#000')
    ga.fillStyle = grad
    ga.fillRect(0, 0, 4, 64)
    const alpha = this.bag.add(new CanvasTexture(a))
    const h = 0.6
    const m = new Mesh(this.bag.add(new PlaneGeometry(0.05, h)), this.bag.add(new MeshBasicMaterial({ map, alphaMap: alpha, transparent: true, depthWrite: false })))
    m.position.set(POND.x, -h / 2 + 0.004, ISLAND.z + ISLAND.d / 2 + 0.004)
    return m
  }
  private water: Texture | null = null

  /** One of a game's props, its own little group so it can wobble. */
  private prop(theme: Group, parts: BufferGeometry[], at: [number, number], sound: Prop['sound'], px = 1.5) {
    // Each prop is built round its own foot, so it wobbles from the ground up.
    const g = merge(parts)
    g.translate(-at[0], 0, -at[1])
    const root = new Group()
    root.add(solid(g, this.bag, px))
    root.position.set(at[0], 0, at[1])
    root.userData.pick = `trip:table:prop:${this.props.length}`
    theme.add(root)
    this.props.push({ root, t: -1, sound })
  }

  /** What each game puts round its board. Keep them low in front and at the sides; the tall ones go at the back. */
  private buildTheme(game: GameId): Group {
    const g = new Group()
    // Shared: trees and cottages along the sides and back, mushrooms in the front corners.
    const L = -0.45
    const R = 0.45
    if (game === 'unicorn') {
      this.prop(g, rainbow(-0.18, -0.5, 0.2), [-0.18, -0.5], 'chime')
      this.prop(g, tree(L, -0.44, 0.2, '#FFB8D8', '#FFD6E8', 1.2), [L, -0.44], 'boing')
      this.prop(g, tree(R, -0.43, 0.24, '#D9CCFF', '#EEE6FF', 1.25), [R, -0.43], 'boing')
      this.prop(g, tree(L, -0.18, 0.16, '#FFC9E0', '#FFE3EF'), [L, -0.18], 'boing')
      this.prop(g, cottage(R, -0.16, '#FFF1F6', PAL.lavenderDark, -0.5), [R, -0.16], 'giggle')
      this.prop(g, tree(R, 0.08, 0.15, '#C9B3FF', '#E6DCFF'), [R, 0.08], 'boing')
      this.prop(g, starWand(L, 0.06, 0.12, PAL.gold), [L, 0.06], 'chime')
      this.prop(g, starWand(L + 0.04, 0.16, 0.09, '#FF8FB8'), [L + 0.04, 0.16], 'chime')
      // A big unicorn statue on the front right, on a cloud (like the pieces, three times the size).
      const statue = unicornParts('lavender').map((p) => p.scale(2.6, 2.6, 2.6).rotateY(-2.07))
      this.prop(g, [...statue.map((p) => p.translate(R - 0.02, 0.03, 0.34)), ...cloudParts(0.06, 5).map((p) => p.translate(R - 0.02, 0.012, 0.34))], [R - 0.02, 0.34], 'giggle', 1.3)
      this.prop(g, mushroom(L + 0.02, 0.38, 1.3, PAL.hotpink), [L + 0.02, 0.38], 'plink')
      this.prop(g, mushroom(L + 0.07, 0.5, 0.9, '#C7A6FF'), [L + 0.07, 0.5], 'plink')
    } else if (game === 'candy') {
      this.prop(g, lollipop(L, -0.46, 0.16, '#FF6FA8', '#FFFFFF'), [L, -0.46], 'plink')
      this.prop(g, lollipop(R - 0.02, -0.47, 0.19, '#A77BFF', '#FFE3F2'), [R - 0.02, -0.47], 'plink')
      this.prop(g, iceCream(0.1, -0.5, '#FFB8D8', '#FFF1DE'), [0.1, -0.5], 'boing')
      this.prop(g, iceCream(0.3, -0.5, '#8FE3C8', '#FBEA9A'), [0.3, -0.5], 'boing')
      this.prop(g, candyCane(L, -0.16, 0.16, 0.4), [L, -0.16], 'chime')
      this.prop(g, candyCane(R, -0.2, 0.14, 2.6), [R, -0.2], 'chime')
      this.prop(g, cupcake(R, 0.05, '#8FCBFF', '#FFF1F6'), [R, 0.05], 'giggle')
      this.prop(g, cupcake(L, 0.08, '#FFB27A', '#FFD3E6'), [L, 0.08], 'giggle')
      this.prop(g, lollipop(L + 0.02, 0.3, 0.09, '#FFD93D', '#FF9A3D'), [L + 0.02, 0.3], 'plink')
      this.prop(g, [...gumdrop(R - 0.03, 0.32, 1.2, '#4FCB7F'), ...gumdrop(R + 0.03, 0.38, 1, '#FF6FA8'), ...gumdrop(R - 0.04, 0.44, 0.9, '#4FA8FF')], [R, 0.38], 'boing')
      this.prop(g, [...gumdrop(L + 0.06, 0.48, 1, '#A77BFF'), ...gumdrop(L, 0.52, 0.8, '#FFD93D')], [L + 0.03, 0.5], 'boing')
      this.prop(g, candyCane(-0.12, -0.5, 0.12, 0), [-0.12, -0.5], 'chime')
    } else {
      this.prop(g, slide(R - 0.02, -0.42, -0.5), [R - 0.02, -0.42], 'boing')
      this.prop(g, swings(L + 0.02, -0.46, 0.25), [L + 0.02, -0.46], 'giggle')
      this.prop(g, tree(0.06, -0.5, 0.2, GRASS_DARK, '#B7EBA6', 1.2), [0.06, -0.5], 'boing')
      this.prop(g, pine(-0.2, -0.5, 0.2, '#7FD3A1'), [-0.2, -0.5], 'boing')
      this.prop(g, tree(L, -0.14, 0.15, '#9BE08F', '#C5F0B5'), [L, -0.14], 'boing')
      this.prop(g, cottage(R, -0.12, '#FFF7E6', '#FF9A3D', -0.6), [R, -0.12], 'giggle')
      this.prop(g, pine(R, 0.12, 0.15, '#8FDDB0'), [R, 0.12], 'boing')
      this.prop(g, tree(L, 0.12, 0.13, '#FFC9E0', '#FFE3EF'), [L, 0.12], 'boing')
      // A sandbox with a bucket, front left; a little seesaw, front right.
      this.prop(g, [P.rbox(0.12, 0.016, 0.1, 0.006, '#E9C3A2', { at: [L + 0.03, 0.008, 0.42] }), P.rbox(0.1, 0.012, 0.08, 0.006, '#FFE9B8', { at: [L + 0.03, 0.012, 0.42] }), P.cyl(0.012, 0.009, 0.02, PAL.hotpink, { at: [L + 0.05, 0.026, 0.41] }, 10)], [L + 0.03, 0.42], 'plink')
      this.prop(g, [P.cone(0.016, 0.022, PAL.sky, { at: [R - 0.02, 0.011, 0.4] }, 8), P.rbox(0.13, 0.008, 0.022, 0.004, PAL.butter, { at: [R - 0.02, 0.024, 0.4], rot: [0, 0, 0.15] })], [R - 0.02, 0.4], 'boing')
      this.prop(g, mushroom(L + 0.06, 0.53, 1, '#FF9A3D'), [L + 0.06, 0.53], 'plink')
    }
    g.visible = false
    this.island.add(g)
    return g
  }

  // ---------------------------------------------------------------- the sky

  private buildSky() {
    const r = rng(23)
    // Clouds in three rings: a sea of big ones far below, drifting ones round the island's middle, a few up high.
    const rings: [count: number, rMin: number, rMax: number, yMin: number, yMax: number, sMin: number, sMax: number][] = [
      [12, 1.1, 3.4, -1.35, -0.9, 0.35, 0.7],
      [9, 1.4, 2.8, -0.55, 0.0, 0.14, 0.3],
      [5, 1.6, 3.2, 0.35, 0.9, 0.18, 0.32],
    ]
    let seed = 100
    for (const [n, rMin, rMax, yMin, yMax, sMin, sMax] of rings)
      for (let i = 0; i < n; i++) {
        const o = solid(merge(cloudParts(sMin + r() * (sMax - sMin), seed++)), this.bag, 0)
        const c = { o, r: rMin + r() * (rMax - rMin), a: (i / n) * Math.PI * 2 + r() * 0.5, y: yMin + r() * (yMax - yMin), speed: (0.012 + r() * 0.02) * (r() < 0.5 ? 1 : -1), bob: r() * 6 }
        this.sky.add(o)
        this.clouds.push(c)
      }
    // Little islands far off.
    const minis: [number, number, number, number, 'tree' | 'house' | 'pine'][] = [
      [-1.35, -0.15, -1.0, 0.16, 'house'],
      [1.5, 0.12, -1.3, 0.2, 'tree'],
      [-1.9, -0.55, 0.2, 0.14, 'pine'],
      [1.75, -0.62, 0.35, 0.13, 'tree'],
      [0.3, 0.3, -2.4, 0.22, 'pine'],
    ]
    minis.forEach(([x, y, z, rr, top], i) => {
      const o = solid(merge(miniIsland(rr, 40 + i, top)), this.bag, 1.4)
      o.position.set(x, y, z)
      o.rotation.y = i * 1.3
      this.sky.add(o)
      this.far.push({ o, base: new Vector3(x, y, z), phase: i * 1.7 })
    })
    // Two hot-air balloons rising slowly (and starting again from below).
    const bs: [string, string, number, number, number, number][] = [
      ['#FF8FB8', '#FFF1F6', -1.7, -1.3, 0.06, 0],
      ['#C7A6FF', '#FBEA9A', 1.9, -1.7, 0.045, 2.5],
    ]
    for (const [a, b, x, z, speed, phase] of bs) {
      const o = new Group()
      o.add(solid(merge(balloonParts(a, b)), this.bag, 1.4))
      o.userData.pick = `trip:table:prop:${this.props.length}`
      this.props.push({ root: o, t: -1, sound: 'boing' })
      this.sky.add(o)
      this.balloons.push({ o, x, z, y: -0.7 + phase * 0.3, speed, phase })
    }
  }

  // ---------------------------------------------------------------- what the plugin does with it

  /** The stage on (the sky as the background, the pink haze) or off (the house's own back). */
  show(on: boolean, scene?: Scene) {
    this.island.visible = on
    this.sky.visible = on
    if (!scene) return
    if (on && !this.saved) {
      this.saved = { background: scene.background, fog: scene.fog }
      scene.background = this.skyTex
      scene.fog = this.fog
    } else if (!on && this.saved) {
      scene.background = this.saved.background
      scene.fog = this.saved.fog
      this.saved = null
    }
  }

  /** The game's props round its board. */
  setGame(game: GameId) {
    for (const [g, o] of this.themes) o.visible = g === game
  }

  /** The board that just came out pops in. */
  pop(o: Object3D) {
    this.popping = o
    this.popT = 0
  }

  /** The things she can tap (the plugin raycasts them). */
  get roots(): Object3D[] {
    return this.props.filter((p) => visibleUp(p.root)).map((p) => p.root)
  }

  /** A tap on prop `id`: it wobbles; returns its sound and where it is (for the sparkles). */
  poke(id: string): { sound: Prop['sound']; at: Vector3 } | null {
    const i = Number(id.slice('trip:table:prop:'.length))
    const p = this.props[i]
    if (!p) return null
    p.t = 0
    return { sound: p.sound, at: p.root.getWorldPosition(new Vector3()).add(new Vector3(0, 0.08, 0)) }
  }

  get busy() {
    return this.island.visible
  }

  /** `eye`: where the camera is (the haze starts just past the island, however far a narrow screen backs it off). */
  update(dt: number, eye?: Vector3) {
    if (!this.island.visible) {
      this.top.position.y = this.baseY
      this.top.rotation.set(0, 0, 0)
      return
    }
    this.time += dt
    const t = this.time
    if (eye) {
      const d = eye.distanceTo(this.sky.position)
      this.fog.near = d + 0.7
      this.fog.far = d + 8
    }
    // The island floats: a slow bob and the gentlest sway (the board and pieces ride along).
    this.top.position.y = this.baseY + Math.sin(t * 0.9) * 0.006
    this.top.rotation.set(Math.sin(t * 0.55) * 0.004, 0, Math.sin(t * 0.7 + 1) * 0.005)
    for (const c of this.clouds) {
      c.a += c.speed * dt
      c.o.position.set(Math.cos(c.a) * c.r, c.y + Math.sin(t * 0.4 + c.bob) * 0.02, Math.sin(c.a) * c.r - 0.3)
    }
    for (const f of this.far) {
      f.o.position.set(f.base.x, f.base.y + Math.sin(t * 0.6 + f.phase) * 0.03, f.base.z)
      f.o.rotation.y += dt * 0.05
    }
    for (const b of this.balloons) {
      b.y += b.speed * dt
      if (b.y > 1.4) b.y = -1.0
      b.o.position.set(b.x + Math.sin(t * 0.3 + b.phase) * 0.08, b.y, b.z)
      b.o.rotation.z = Math.sin(t * 0.8 + b.phase) * 0.05
    }
    // The waterfall pours.
    if (this.water) this.water.offset.y = (this.water.offset.y + dt * 0.9) % 1
    // Twinkles drift upward and wink.
    const pos = this.twinkles.geometry.attributes.position as BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      const b = i * 3
      const y = ((this.twinkleBase[b + 1] + t * 0.03 + 0.5) % 1.1) - 0.5
      pos.setXYZ(i, this.twinkleBase[b] + Math.sin(t * 0.5 + i) * 0.03, y, this.twinkleBase[b + 2] + Math.cos(t * 0.4 + i) * 0.03)
    }
    pos.needsUpdate = true
    ;(this.twinkles.material as PointsMaterial).opacity = 0.75 + Math.sin(t * 2.3) * 0.2
    // Tapped props wobble like jelly.
    for (const p of this.props) {
      if (p.t < 0) continue
      p.t = Math.min(1, p.t + dt / 0.6)
      const w = Math.sin(p.t * Math.PI * 4) * (1 - p.t) * 0.22
      p.root.scale.set(1 - w * 0.5, 1 + w, 1 - w * 0.5)
      if (p.t >= 1) {
        p.t = -1
        p.root.scale.set(1, 1, 1)
      }
    }
    // A new board pops in with a little bounce.
    if (this.popping && this.popT >= 0) {
      this.popT = Math.min(1, this.popT + dt / 0.5)
      const k = this.popT
      const s = 1 + Math.sin(k * Math.PI * 2.5) * (1 - k) * 0.08 - (1 - k) * (1 - k) * 0.12
      this.popping.scale.setScalar(s)
      if (k >= 1) {
        this.popping.scale.setScalar(1)
        this.popping = null
        this.popT = -1
      }
    }
  }
}

function visibleUp(o: Object3D | null) {
  for (let c = o; c; c = c.parent) if (!c.visible) return false
  return true
}

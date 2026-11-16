// The things in the Poles' story (story/stage.ts builds its sets from these; the games can use them too, so the
// balloon she flies in the finale is the one in the films): Sparkle's balloon, the scientists' red ship and its fish
// crate, Nari the narwhal, sea ice, icebergs, snowy mountains, the stars and the polar lights. All toon shapes with
// ink outlines (engine3d/geo.ts), built into a caller's Bag.
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, DoubleSide, ExtrudeGeometry, Group, IcosahedronGeometry, Mesh, MeshBasicMaterial, PlaneGeometry, Points, PointsMaterial, ShaderMaterial, Shape, Vector2, Vector3 } from 'three'
import { speechLevel } from '../../../../sdk'
import type { Bag } from '../../../engine3d/dispose'
import { bake, merge, P, solid, solidMix } from '../../../engine3d/geo'
import { smoothstep } from '../../../../sdk/math'
import { skirtGeo } from '../look/sea'
import { PAL } from '../../../engine3d/toon'

/** A little random-number maker with a seed, so a set looks the same every time. */
export function rng(seed: number) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

export const ICE = '#F4F8FF'
export const ICE_SHADE = '#CFE3F7'
export const ICE_BLUE = '#A9D4F5'
export const SNOW = '#FFFFFF'

// ---------------------------------------------------------------- Sparkle's balloon

/** Sparkle's hot-air balloon: pink and lavender stripes, a gold band, a wicker basket big enough for a cub and a
 *  chick. The origin is the basket's floor; riders stand at `seat(i)`. `update` bobs and sways it. */
export class Balloon {
  readonly root = new Group()
  private sway = new Group()
  /** The basket's floor is this high above the root when it hangs still. */
  readonly basketR = 0.62
  private phase = Math.random() * 6

  constructor(bag: Bag) {
    const parts = []
    // The envelope: a ball of eight stripes (thin wedges of a sphere, alternating colors), a little taller than wide.
    const R = 1.75
    const cy = 3.55
    for (let i = 0; i < 8; i++) {
      const c = i % 2 ? PAL.lavender : PAL.pink
      const a = (i / 8) * Math.PI * 2
      // A wedge: a squashed ball pushed out from the middle, so the stripes read as puffy gores.
      parts.push(P.sphere(R * 0.62, c, { at: [Math.sin(a) * R * 0.42, cy, Math.cos(a) * R * 0.42], scale: [0.9, 1.5, 0.9] }, 14))
    }
    parts.push(P.sphere(R * 0.78, PAL.pink, { at: [0, cy + 0.15, 0], scale: [1, 1.32, 1] }, 16))
    // The mouth and its gold band, a little star on top.
    parts.push(P.cyl(0.62, 0.42, 0.7, PAL.lavenderDark, { at: [0, cy - 2.05, 0] }, 14))
    parts.push(P.torus(0.5, 0.07, PAL.gold, { at: [0, cy - 2.4, 0], rot: [Math.PI / 2, 0, 0] }))
    parts.push(P.sphere(0.16, PAL.gold, { at: [0, cy + 2.25, 0] }, 10))
    // The basket and its ropes.
    const b = this.basketR
    parts.push(P.cyl(b, b * 0.86, 0.62, '#E0A868', { at: [0, 0.31, 0] }, 14))
    parts.push(P.torus(b, 0.07, '#C98B4B', { at: [0, 0.62, 0], rot: [Math.PI / 2, 0, 0] }))
    parts.push(P.torus(b * 0.95, 0.05, '#C98B4B', { at: [0, 0.3, 0], rot: [Math.PI / 2, 0, 0] }))
    const plain = []
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4
      plain.push(P.cyl(0.02, 0.02, 0.62, '#8A6A4A', { at: [Math.sin(a) * 0.5, 0.92, Math.cos(a) * 0.5], rot: [Math.cos(a) * 0.12, 0, -Math.sin(a) * 0.12] }, 5))
    }
    this.sway.add(solidMix(parts, plain, bag, 3))
    this.root.add(this.sway)
  }

  /** Where rider `i` stands in the basket (the basket's own coordinates: `ride(balloon.basket, ...seat(i))`). */
  seat(i: number): [number, number, number] {
    return [(i === 0 ? -1 : 1) * 0.24, 0.32, 0.12]
  }
  /** What riders are added to (it sways with the balloon). */
  get basket() {
    return this.sway
  }
  update(_dt: number, t: number) {
    this.sway.position.y = Math.sin(t * 1.1 + this.phase) * 0.12
    this.sway.rotation.z = Math.sin(t * 0.7 + this.phase) * 0.035
    this.sway.rotation.x = Math.sin(t * 0.9 + this.phase * 2) * 0.025
  }
}

// ---------------------------------------------------------------- the red ship and its crate

/** The scientists' red ship (a toy icebreaker): she sits at the ice edge with a ramp down, her bow toward +x.
 *  The origin is on the waterline amidships. */
export function makeShip(bag: Bag) {
  const red = '#F0564E'
  const parts = [
    // The hull: a long rounded box, a pointed bow, a white stripe.
    P.rbox(7.2, 1.5, 2.3, 0.4, red, { at: [0, 0.55, 0] }),
    P.prism([[0, -0.75], [1.7, 0.75], [0, 0.75]], 2.2, red, { at: [3.6, 0.55, 0] }),
    P.rbox(7.25, 0.22, 2.36, 0.1, '#FFFFFF', { at: [0, 1.2, 0] }),
    // The cabin, its roof and the funnel.
    P.rbox(2.6, 1.3, 1.7, 0.22, '#FFFDF7', { at: [-1.5, 1.95, 0] }),
    P.rbox(2.9, 0.18, 1.95, 0.08, red, { at: [-1.5, 2.66, 0] }),
    P.cyl(0.3, 0.34, 0.9, '#FFC83D', { at: [-2.2, 3.15, 0] }, 12),
    P.cyl(0.32, 0.32, 0.16, PAL.ink, { at: [-2.2, 3.62, 0] }, 12),
    // A mast with a little flag, and the crane arm over the foredeck.
    P.cyl(0.05, 0.05, 1.7, '#8A8FA6', { at: [0.4, 2.15, 0] }, 6),
    P.box(0.5, 0.3, 0.03, PAL.mint, { at: [0.67, 2.85, 0] }),
  ]
  const plain = [-2.3, -1.5, -0.7].map((x) => P.sphere(0.2, '#8FD0F5', { at: [x, 2.05, 0.86], scale: [1, 1, 0.2] }, 10))
  const g = new Group()
  g.add(solidMix(parts, plain, bag, 3))
  return g
}

/** The ship's ramp: a plank from the foredeck down to the ice. */
export function makeRamp(bag: Bag) {
  return solid(merge([P.rbox(0.9, 0.08, 3.0, 0.03, '#E0A868'), ...[-1, -0.3, 0.4, 1.1].map((z) => P.box(0.9, 0.05, 0.08, '#C98B4B', { at: [0, 0.06, z] }))]), bag, 2)
}

/** A wooden fish crate (a fish painted on the side), open at the top: someone small fits inside. */
export function makeCrate(bag: Bag) {
  const w = '#E3B878'
  const d = '#C98B4B'
  const s = 0.9
  const parts = [
    P.box(s, 0.06, s, d, { at: [0, 0.03, 0] }),
    P.box(s, s * 0.8, 0.06, w, { at: [0, s * 0.4, s / 2] }),
    P.box(s, s * 0.8, 0.06, w, { at: [0, s * 0.4, -s / 2] }),
    P.box(0.06, s * 0.8, s, w, { at: [s / 2, s * 0.4, 0] }),
    P.box(0.06, s * 0.8, s, w, { at: [-s / 2, s * 0.4, 0] }),
    P.box(s + 0.06, 0.08, 0.1, d, { at: [0, s * 0.8, s / 2] }),
    P.box(s + 0.06, 0.08, 0.1, d, { at: [0, s * 0.8, -s / 2] }),
  ]
  // The fish: a body and a tail, flat on the front.
  const plain = [P.sphere(0.2, '#7CC4F2', { at: [-0.04, s * 0.42, s / 2 + 0.035], scale: [1.25, 0.7, 0.08] }, 10), P.cone(0.13, 0.2, '#7CC4F2', { at: [0.26, s * 0.42, s / 2 + 0.035], rot: [0, 0, Math.PI / 2], scale: [1, 1, 0.1] }, 3)]
  const g = new Group()
  g.add(solidMix(parts, plain, bag, 2.5))
  return g
}

// ---------------------------------------------------------------- Nari the narwhal

/** Nari the narwhal, the unicorn of the sea: a round grey-blue whale with a pale tummy, freckles, a spiral tusk
 *  and a happy face. Her nose points to +z; the origin is the middle of her body at the waterline. Riders sit at
 *  `saddle`. `update` bobs her, beats her tail and moves her with her voice. */
export class Narwhal {
  readonly root = new Group()
  private body = new Group()
  private tail: Group
  private flips: Group[] = []
  private phase = Math.random() * 6
  private level = 0
  /** Body length, nose to tail (m). */
  readonly length: number
  /** How fast she's swimming (0..1): the tail beats harder. */
  speed = 0
  /** Dives under (meters down, eased by the caller). */
  dive = 0

  constructor(bag: Bag, size = 1) {
    const s = size
    this.length = 3.4 * s
    const skin = '#AFC3DE'
    const belly = '#F4F8FF'
    const parts = [
      P.sphere(0.8 * s, skin, { scale: [0.92, 0.86, 1.75] }, 20),
      // The pale tummy shows along her sides and chin.
      P.sphere(0.74 * s, belly, { at: [0, -0.16 * s, 0.1 * s], scale: [0.9, 0.78, 1.7] }, 18),
    ]
    const plain = []
    // Freckles on her back.
    const r = rng(5)
    for (let i = 0; i < 12; i++) {
      const a = (r() - 0.5) * 1.5
      const z = (r() - 0.6) * 1.9 * s
      const rr = 0.8 * s * Math.sqrt(Math.max(0.05, 1 - (z / (1.4 * s)) ** 2))
      plain.push(P.sphere((0.05 + r() * 0.05) * s, '#8CA3C4', { at: [Math.sin(a) * rr * 0.92, Math.cos(a) * rr * 0.86 + 0.01, z], scale: [1, 0.3, 1] }, 8))
    }
    // Her face, on the front: eyes with a shine, pink cheeks, a smile.
    for (const side of [-1, 1]) {
      plain.push(P.sphere(0.085 * s, PAL.ink, { at: [side * 0.36 * s, 0.14 * s, 1.08 * s] }, 10))
      plain.push(P.sphere(0.03 * s, '#FFFFFF', { at: [side * 0.34 * s, 0.18 * s, 1.15 * s] }, 8))
      plain.push(P.sphere(0.11 * s, '#FFB3CF', { at: [side * 0.46 * s, -0.04 * s, 0.98 * s], scale: [1, 0.6, 0.5] }, 8))
    }
    plain.push(P.torus(0.14 * s, 0.025 * s, PAL.ink, { at: [0, -0.02 * s, 1.3 * s], rot: [0.5, 0, 0] }, Math.PI).rotateZ(Math.PI).translate(0, -0.04 * s, 0))
    // The tusk: a long thin cone with a spiral of gold beads, like a unicorn's horn.
    parts.push(P.cone(0.075 * s, 1.5 * s, '#FFF7E0', { at: [0, 0.3 * s, 2.02 * s], rot: [Math.PI / 2 - 0.16, 0, 0] }, 10))
    for (let i = 0; i < 9; i++) {
      const k = i / 9
      const a = k * Math.PI * 5
      const rr = 0.07 * s * (1 - k)
      plain.push(P.sphere(0.022 * s, PAL.gold, { at: [Math.sin(a) * rr, 0.19 * s + k * 1.42 * s * 0.16 + Math.cos(a) * rr, 1.32 * s + k * 1.4 * s] }, 6))
    }
    this.body.add(solidMix(parts, plain, bag, 3))
    // Flippers, each on a hinge at her side.
    for (const side of [-1, 1]) {
      const f = new Group()
      f.add(solid(P.sphere(0.3 * s, skin, { at: [side * 0.22 * s, 0, 0], scale: [1, 0.16, 0.6] }, 12), bag, 2.5))
      f.position.set(side * 0.62 * s, -0.3 * s, 0.35 * s)
      this.body.add(f)
      this.flips.push(f)
    }
    // The tail: a stalk and two flukes, on a hinge behind her.
    this.tail = new Group()
    this.tail.add(solid(merge([P.sphere(0.3 * s, skin, { at: [0, 0, -0.3 * s], scale: [0.7, 0.6, 1.5] }, 12), ...[-1, 1].map((side) => P.sphere(0.34 * s, skin, { at: [side * 0.3 * s, 0, -0.78 * s], scale: [1, 0.16, 0.62], rot: [0, side * 0.5, 0] }, 12))]), bag, 2.5))
    this.tail.position.set(0, 0.02 * s, -1.2 * s)
    this.body.add(this.tail)
    this.root.add(this.body)
    this.saddle = new Group()
    this.saddle.position.set(0, 0.66 * s, -0.1 * s)
    this.body.add(this.saddle)
  }
  /** Where riders sit: add them here (it bobs and dives with her). */
  readonly saddle: Group

  /** The tip of her tusk, in the world. */
  tip(out = new Vector3()) {
    return this.body.localToWorld(out.set(0, 0.52 * (this.length / 3.4), 2.7 * (this.length / 3.4)))
  }
  update(dt: number, t: number) {
    const target = speechLevel('nari')
    this.level += (target - this.level) * (1 - Math.exp(-dt * 18))
    const beat = 2.4 + this.speed * 6
    this.body.position.y = 0.2 + Math.sin(t * 1.5 + this.phase) * 0.07 - this.dive
    this.body.rotation.x = Math.sin(t * 1.5 + this.phase + 1) * 0.05 - this.level * 0.12
    this.body.rotation.z = Math.sin(t * 1.1 + this.phase) * 0.04
    this.tail.rotation.x = Math.sin(t * beat + this.phase) * (0.22 + this.speed * 0.3)
    this.flips.forEach((f, i) => (f.rotation.z = (i ? 1 : -1) * (0.25 + 0.2 * Math.sin(t * 2.2 + i))))
    this.body.scale.setScalar(1 + this.level * 0.05)
  }
}

// ---------------------------------------------------------------- ice, snow and mountains
// (The look pass of 2026-11-16: floes with a cushion of snow on top and turquoise sides going down into the water,
// faceted icebergs and mountains sculpted from a lumpy ball instead of cones, soft blue-grey lines on the ice instead
// of ink. The polar sea's skirts, look/sea.ts, give each its glow under the water.)

/** The soft line round ice and snow (ink would draw black scribbles across a field of snow). */
export const ICE_LINE = '#7F9CC8'
/** The ice's colors, top to bottom: snow, the rim of the slab, its side, the waterline, under the water. */
const ICE_COLS = { snow: '#FFFFFF', rim: '#EAF5FF', side: '#CBEBFA', water: '#7FD6EE', under: '#3FA9D8' }

/** A floe's ragged, rounded outline ([x, z], counter-clockwise from above), about `r` meters out. */
export function floeOutline(r: number, seed: number): [number, number][] {
  const rand = rng(seed)
  const n = 7 + Math.floor(rand() * 3)
  const radii: number[] = []
  for (let i = 0; i < n; i++) radii.push(r * (0.78 + rand() * 0.34))
  const m = Math.max(12, Math.min(30, Math.round(r * 4)))
  const wob = rand() * 6
  const pts: [number, number][] = []
  for (let i = 0; i < m; i++) {
    const a = (i / m) * Math.PI * 2
    const u = (i / m) * n
    const i0 = Math.floor(u)
    const f = u - i0
    const k = f * f * (3 - 2 * f)
    const rr = (radii[i0 % n] * (1 - k) + radii[(i0 + 1) % n] * k) * (1 + 0.035 * Math.sin(a * 5 + wob) + 0.02 * Math.sin(a * 11 + wob * 2))
    pts.push([Math.cos(a) * rr, -Math.sin(a) * rr])
  }
  return pts
}

/** An outline with its corners rounded off (Chaikin's corner cutting, `times` over): an octagon becomes a floe. */
export function roundOff(pts: [number, number][], times = 2): [number, number][] {
  let p = pts
  for (let t = 0; t < times; t++) {
    const out: [number, number][] = []
    for (let i = 0; i < p.length; i++) {
      const [ax, az] = p[i]
      const [bx, bz] = p[(i + 1) % p.length]
      out.push([ax * 0.75 + bx * 0.25, az * 0.75 + bz * 0.25], [ax * 0.25 + bx * 0.75, az * 0.25 + bz * 0.75])
    }
    p = out
  }
  return p
}

/** Paints an extrusion by height: snow on its top, then the rim, the side bluer down to the water and under it. */
function paintIce(g: BufferGeometry, top: number, snowTop: number | null) {
  const pos = g.attributes.position
  const col = g.attributes.color
  const c = new Color()
  const side = new Color(ICE_COLS.side)
  const water = new Color(ICE_COLS.water)
  const under = new Color(ICE_COLS.under)
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    if (snowTop !== null && y > top - 0.01) c.set(ICE_COLS.snow)
    else if (y > top - 0.025) c.set(ICE_COLS.rim)
    else if (y > 0.02) c.copy(side).lerp(water, smoothstep(top - 0.05, 0.02, y))
    else c.copy(water).lerp(under, smoothstep(0.02, -0.25, y))
    col.setXYZ(i, c.r, c.g, c.b)
  }
}

/** A slab of ice with this outline ([x, z]), its top at `top`, `thick` deep, edges rounded; `snow` puts a soft
 *  cushion of snow on it (its top is then `top`, the ice's a little lower; a number: how thick). */
export function iceSlab(pts: [number, number][], top = 0.18, thick = 0.5, snow: boolean | number = true) {
  const pillow = snow === false ? 0 : typeof snow === 'number' ? snow : Math.min(0.1, thick * 0.22)
  const iceTop = top - pillow
  const bevel = Math.min(0.08, thick * 0.18)
  const depth = Math.max(0.02, thick - pillow - bevel * 2)
  const shape = new Shape(pts.map(([x, z]) => new Vector2(x, -z)))
  const slab = bake(new ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 1 }).rotateX(-Math.PI / 2), ICE)
  slab.translate(0, iceTop - depth - bevel, 0)
  paintIce(slab, iceTop, null)
  if (!snow) return slab
  // The cushion: the outline pulled in a little (more on a small floe), thick and very rounded.
  let cx = 0
  let cz = 0
  for (const [x, z] of pts) {
    cx += x / pts.length
    cz += z / pts.length
  }
  const r = pts.reduce((s, [x, z]) => s + Math.hypot(x - cx, z - cz), 0) / pts.length
  const inset = Math.min(0.32, 0.1 + r * 0.03)
  const inner = new Shape(pts.map(([x, z]) => {
    const dx = x - cx
    const dz = z - cz
    const l = Math.hypot(dx, dz) || 1
    const k = Math.max(0.3, (l - inset - 0.12) / l)
    return new Vector2(cx + dx * k, -(cz + dz * k))
  }))
  // (Its bottom hidden in the ice, its top at `top`: the bevel rounds it over.)
  const tall = pillow + 0.04
  const pb = tall * 0.4
  const cushion = bake(new ExtrudeGeometry(inner, { depth: tall - pb * 2, bevelEnabled: true, bevelThickness: pb, bevelSize: pb + 0.05, bevelSegments: 2, curveSegments: 1 }).rotateX(-Math.PI / 2), SNOW)
  cushion.translate(0, iceTop - 0.04 + pb, 0)
  return merge([slab, cushion])
}

/** A floe: a slab of sea ice with a ragged, rounded outline and a cushion of snow, its top at y = `top`. `r`: about
 *  how far across (m). */
export function floeGeo(r: number, seed: number, top = 0.18, thick = 0.5, snow = true) {
  return iceSlab(floeOutline(r, seed), top, thick, snow)
}
/** The glow round `floeGeo(r, seed)` under the water (look/sea.ts PolarSea.skirt). */
export function floeSkirt(r: number, seed: number) {
  return skirtGeo(floeOutline(r, seed), Math.max(0.55, Math.min(2.2, r * 0.32)))
}

// A little 3D value noise for the lumps (the same every time for a seed).
function hash3(x: number, y: number, z: number) {
  const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453
  return h - Math.floor(h)
}
function noise3(x: number, y: number, z: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const zi = Math.floor(z)
  const xf = x - xi
  const yf = y - yi
  const zf = z - zi
  const s = (t: number) => t * t * (3 - 2 * t)
  const u = s(xf)
  const v = s(yf)
  const w = s(zf)
  const l = (a: number, b: number, t: number) => a + (b - a) * t
  const c = (dx: number, dy: number, dz: number) => hash3(xi + dx, yi + dy, zi + dz)
  return l(l(l(c(0, 0, 0), c(1, 0, 0), u), l(c(0, 1, 0), c(1, 1, 0), u), v), l(l(c(0, 0, 1), c(1, 0, 1), u), l(c(0, 1, 1), c(1, 1, 1), u), v), w)
}
const fbm = (x: number, y: number, z: number) => noise3(x, y, z) * 0.6 + noise3(x * 2.1 + 5, y * 2.1, z * 2.1) * 0.3 + noise3(x * 4.3, y * 4.3 + 9, z * 4.3) * 0.1

interface LumpOpts {
  /** Half-widths and the height above the water (m). */
  rx: number
  rz: number
  h: number
  seed: number
  /** Peaks ([angle round, out from the middle 0..1, height ×]), or a flat top. */
  peaks?: [number, number, number][]
  flat?: boolean
  /** How far it goes below the waterline (m). */
  under?: number
  detail?: number
  /** How rough (0..1). */
  rough?: number
  paint(cy: number, ny: number, hf: number, r: () => number): string
}

/** A faceted lump: a ball pushed into peaks (or a table), roughened by noise, flat-shaded, each facet painted. */
function lump(o: LumpOpts) {
  const base = new IcosahedronGeometry(1, o.detail ?? 3)
  const g = base.index ? base.toNonIndexed() : base
  const pos = g.attributes.position
  const rough = o.rough ?? 0.55
  const sd = o.seed * 1.37
  const peaks = (o.peaks ?? []).map(([a, d, k]) => ({ x: Math.cos(a) * d, z: Math.sin(a) * d, k }))
  const v = new Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const n = fbm(v.x * 1.7 + sd, v.y * 1.7, v.z * 1.7 - sd)
    let x = v.x
    let z = v.z
    let y: number
    if (v.y < 0) {
      // Under the water: a short keel, a little wider than the top.
      y = v.y * (o.under ?? o.h * 0.15)
      x *= 1.04
      z *= 1.04
    } else if (o.flat) {
      // A table: cliffs up to an edge, rounded over, then flat.
      const e = 0.42
      y = v.y < e ? (v.y / e) * 0.92 : 0.92 + (1 - Math.cos(((v.y - e) / (1 - e)) * Math.PI * 0.5)) * 0.08
      const shrink = v.y < e ? 1 : Math.cos(((v.y - e) / (1 - e)) * Math.PI * 0.5) * 0.25 + 0.75
      x = (v.x / Math.max(0.0001, Math.hypot(v.x, v.z))) * Math.sqrt(1 - Math.min(v.y, e) ** 2) * shrink
      z = (v.z / Math.max(0.0001, Math.hypot(v.x, v.z))) * Math.sqrt(1 - Math.min(v.y, e) ** 2) * shrink
      y *= o.h
    } else {
      // Peaks: the top pulled up toward each, most where the ball points at it.
      let lift = 0.35
      for (const p of peaks) {
        const d = Math.hypot(v.x - p.x, v.z - p.z)
        lift = Math.max(lift, p.k * Math.exp(-(d * d) / 0.18))
      }
      y = Math.pow(v.y, 0.85) * lift * o.h
      // (Higher up, narrower: a peak, not a dome.)
      const narrow = 1 - 0.45 * Math.pow(v.y, 1.5)
      x *= narrow
      z *= narrow
    }
    const push = 1 + (n - 0.5) * rough * 0.5
    pos.setXYZ(i, x * o.rx * push, y * (v.y > 0 ? 1 + (n - 0.5) * rough * 0.25 : 1), z * o.rz * push)
  }
  g.computeVertexNormals()
  const nrm = g.attributes.normal
  const rgb = new Float32Array(pos.count * 3)
  const r = rng(o.seed + 3)
  const c = new Color()
  let top = 0.0001
  for (let i = 0; i < pos.count; i++) top = Math.max(top, pos.getY(i))
  for (let i = 0; i < pos.count; i += 3) {
    const cy = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3
    const ny = (nrm.getY(i) + nrm.getY(i + 1) + nrm.getY(i + 2)) / 3
    c.set(o.paint(cy, ny, cy / top, r))
    for (let k = 0; k < 3; k++) rgb.set([c.r, c.g, c.b], (i + k) * 3)
  }
  g.setAttribute('color', new BufferAttribute(rgb, 3))
  for (const name of Object.keys(g.attributes)) if (!['position', 'normal', 'color'].includes(name)) g.deleteAttribute(name)
  return g
}

/** Ice facets: snow where they face the sky, pale blue sides going turquoise down to the waterline. */
function paintBerg(cy: number, ny: number, hf: number, r: () => number) {
  if (cy < 0) return ICE_COLS.under
  if (ny > 0.62) return r() < 0.25 ? '#F4FAFF' : SNOW
  if (cy < 0.25 || hf < 0.08) return ICE_COLS.water
  const k = r()
  if (hf < 0.35) return k < 0.3 ? '#A6E2F4' : k < 0.75 ? '#BCE8F7' : '#D3F0FB'
  return k < 0.25 ? '#C4E9F8' : k < 0.7 ? '#DDF2FC' : '#EEF8FF'
}

/** A pointy northern iceberg, faceted: a few leaning peaks of ice with snow on every ledge. The origin is at the
 *  waterline; it reaches about `size` × 2 up. `detail`: how finely faceted (2 for far off). */
export function bergGeo(size: number, seed: number, detail = size < 1.6 ? 2 : 3) {
  const rand = rng(seed)
  const n = 2 + Math.floor(rand() * 3)
  const peaks: [number, number, number][] = []
  for (let i = 0; i < n; i++) peaks.push([rand() * Math.PI * 2, rand() * 0.55, 0.6 + rand() * 0.55])
  peaks[0][2] = 1
  return lump({ rx: size * 0.95, rz: size * (0.8 + rand() * 0.25), h: size * (1.7 + rand() * 0.9), seed, peaks, under: size * 0.3, detail, rough: 0.6, paint: paintBerg })
}

/** A flat southern iceberg: a table of ice, cliffs all round, snow on top. */
export function tableBergGeo(w: number, d: number, h: number) {
  return lump({ rx: w / 2, rz: d / 2, h, seed: Math.round(w * 7 + d * 3), flat: true, under: h * 0.25, detail: 3, rough: 0.35, paint: paintBerg })
}

/** A snowy mountain, faceted: blue-grey rock with snow down its upper slopes and on every ledge. */
export function mountainGeo(r: number, h: number, seed: number) {
  const rand = rng(seed)
  const peaks: [number, number, number][] = [[rand() * 6, rand() * 0.15, 1], [rand() * 6, 0.45 + rand() * 0.2, 0.55 + rand() * 0.2], [rand() * 6, 0.5 + rand() * 0.2, 0.45 + rand() * 0.2]]
  return lump({
    rx: r,
    rz: r * (0.7 + rand() * 0.25),
    h,
    seed: seed + 40,
    peaks,
    under: 1,
    detail: 3,
    rough: 0.75,
    paint: (_cy, ny, hf, rr) => {
      if (hf > 0.62 - ny * 0.25 || ny > 0.78) return rr() < 0.2 ? '#EEF3FF' : SNOW
      const k = rr()
      return hf > 0.35 ? (k < 0.5 ? '#B4C0E0' : '#A5B2D8') : k < 0.5 ? '#C3CBE8' : '#B3BEE2'
    },
  })
}

/** A soft snow drift: a low wide mound, a little blue underneath. */
export function driftGeo(r: number, h: number) {
  const g = P.sphere(r, SNOW, { scale: [1, h / r, 0.7] }, 14)
  const pos = g.attributes.position
  const col = g.attributes.color
  const c = new Color()
  for (let i = 0; i < pos.count; i++) {
    c.set(SNOW).lerp(tmpCol.set('#DCE6FA'), smoothstep(h * 0.5, -h * 0.2, pos.getY(i)))
    col.setXYZ(i, c.r, c.g, c.b)
  }
  return g
}
const tmpCol = new Color()

// ---------------------------------------------------------------- the sky

/** Stars over the long night: a dome of little points that twinkle (`update(t)`), `opacity` to fade them in. */
export class Stars {
  readonly points: Points
  private mat: PointsMaterial
  constructor(bag: Bag, n = 220, radius = 180) {
    const rand = rng(21)
    const pos = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2
      const up = 0.08 + rand() * 0.9
      const r = Math.sqrt(1 - up * up)
      pos.set([Math.cos(a) * r * radius, up * radius, Math.sin(a) * r * radius], i * 3)
    }
    const g = bag.add(new BufferGeometry())
    g.setAttribute('position', new BufferAttribute(pos, 3))
    this.mat = bag.add(new PointsMaterial({ color: '#FFFFFF', size: 2.4, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }))
    this.points = new Points(g, this.mat)
    this.points.frustumCulled = false
  }
  set opacity(a: number) {
    this.mat.opacity = a
    this.points.visible = a > 0.01
  }
  update(t: number) {
    this.mat.size = 2.4 + 0.5 * Math.sin(t * 2.2)
  }
}

/** The polar lights: tall curtains of green and pink (or lilac) that ripple across the night sky. `amount` 0..1
 *  fades them in; a tap can `flare()` them. */
export class Aurora {
  readonly root = new Group()
  private mat: ShaderMaterial
  private flareT = 0
  amount = 0

  constructor(bag: Bag, low = '#8FE3C8', high = '#FF8FB8') {
    this.mat = bag.add(
      new ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uAmount: { value: 0 }, uLow: { value: new Color(low) }, uHigh: { value: new Color(high) } },
        vertexShader: /* glsl */ `
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 p = position;
            // The curtain's folds: it waves toward and away as it goes along.
            p.z += sin(p.x * 0.09 + uTime * 0.6) * 9.0 + sin(p.x * 0.23 - uTime * 0.9) * 3.0;
            p.y += sin(p.x * 0.05 + uTime * 0.4) * 4.0;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform float uAmount;
          uniform vec3 uLow;
          uniform vec3 uHigh;
          varying vec2 vUv;
          void main() {
            // Bright along the bottom edge, fading up; streaked with rays that drift along.
            float rays = 0.55 + 0.45 * sin(vUv.x * 90.0 + uTime * 1.3 + sin(vUv.x * 17.0) * 2.0);
            float up = smoothstep(0.0, 0.08, vUv.y) * pow(1.0 - vUv.y, 1.6);
            float ends = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
            vec3 col = mix(uLow, uHigh, smoothstep(0.15, 0.85, vUv.y));
            gl_FragColor = vec4(col, up * rays * ends * uAmount * 0.85);
            #include <colorspace_fragment>
          }`,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide,
        fog: false,
      }),
    )
    for (const [x, y, z, w, h, yaw] of [[-30, 62, -150, 240, 70, 0.1], [50, 78, -165, 200, 60, -0.2], [-80, 70, -120, 160, 55, 0.5]] as const) {
      const m = new Mesh(bag.add(new PlaneGeometry(w, h, 64, 1)), this.mat)
      m.position.set(x, y, z)
      m.rotation.y = yaw
      m.frustumCulled = false
      m.renderOrder = -1
      this.root.add(m)
    }
  }
  flare() {
    this.flareT = 1
  }
  update(dt: number, t: number) {
    this.flareT = Math.max(0, this.flareT - dt * 0.7)
    this.mat.uniforms.uTime.value = t * (1 + this.flareT * 2)
    this.mat.uniforms.uAmount.value = this.amount * (1 + this.flareT * 0.8)
    this.root.visible = this.amount > 0.01
  }
}

/** A round sun or moon in the sky (a flat disc that always faces the camera's side of the set, with a soft halo). */
export function skyDisc(bag: Bag, r: number, color: string, halo: string) {
  const g = new Group()
  const disc = new Mesh(bag.add(P.cyl(r, r, 0.01, color, { rot: [Math.PI / 2, 0, 0] }, 28)), bag.add(new MeshBasicMaterial({ color, fog: false, depthWrite: false })))
  const glow = new Mesh(bag.add(P.cyl(r * 1.7, r * 1.7, 0.01, halo, { at: [0, 0, -0.5], rot: [Math.PI / 2, 0, 0] }, 28)), bag.add(new MeshBasicMaterial({ color: halo, transparent: true, opacity: 0.28, fog: false, depthWrite: false })))
  glow.renderOrder = -3
  disc.renderOrder = -2
  g.add(glow, disc)
  return g
}

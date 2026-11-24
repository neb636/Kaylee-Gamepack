// The toys on the home globe: little clay things that stand on the world and ride round with it (candy-colored
// trees, pines, palms, snowy peaks, a spouting whale, sailboats, icebergs, an island under a rainbow), puffy clouds
// that hang over its edge, and a sleepy baby moon that goes round and round it. On the side facing her they stand up
// like a storybook map; at the edge of the world they tip outward and stick out past it as they come and go. They
// sway when she spins it, and each one boings (or spouts, or wakes up) when she pokes it. All painted on the globe's 2D canvas, in the shelf's flat tones
// (shelf/STYLE.md): no three.js, this loads at startup.
import { DEG, lerp, smoothstep } from '../../sdk/math'
import { turned, type Turn } from './turn'

export type ToyKind = 'tree' | 'pine' | 'palm' | 'peak' | 'berg' | 'isle' | 'whale' | 'boat' | 'cloud' | 'moon' | 'rainbow'

type G = CanvasRenderingContext2D
type Tones = readonly [base: string, shade: string, light: string]
const TAU = Math.PI * 2

/** The app's cool shadow (#4b3a8c), as "r, g, b". */
export const SHADE = '75, 58, 140'

// The shelf's palette (shelf/STYLE.md): base, shade, light.
const LEAF: Tones = ['#73cf86', '#48a96c', '#aee8b7']
const BLOSSOM: Tones = ['#ff8fb8', '#e7699c', '#ffc4da']
const MINT: Tones = ['#8fe3c8', '#5cc6a6', '#c7f3e4']
const LILAC: Tones = ['#b9a6f5', '#937ee0', '#ddd2ff']
const GOLD: Tones = ['#ffc83d', '#eba123', '#ffe189']
const PINE: Tones = ['#3e9e78', '#2b7a5f', '#69c19a']
const WOOD: Tones = ['#c99266', '#a46e4b', '#e5b78f']
const STONE: Tones = ['#bcb6d6', '#9790ba', '#dedaf0']
const SNOW: Tones = ['#ffffff', '#d9d3ef', '#ffffff']
const ICE: Tones = ['#f4fbff', '#b5dcf7', '#ffffff']
const SAND: Tones = ['#f5dba8', '#e3bb7a', '#fdeecc']
const BUTTER: Tones = ['#fbea9a', '#ecc95c', '#fff6cc']
const INK = '#2b2330'
/** A round tree's crown, by its `tint`. */
const CROWNS = [LEAF, BLOSSOM, MINT, LILAC, GOLD]
/** The rainbow's bands, outside in. */
const BANDS = ['#ff8fb8', '#ffc595', '#fbea9a', '#8fe3c8', '#8ccfff', '#b9a6f5']

interface Toy {
  kind: ToyKind
  lon: number
  lat: number
  /** How tall it stands (a cloud: how wide; a whale: how long), as a part of the globe's radius. */
  size: number
  /** Which colors (a tree's crown, a snowy peak). */
  tint: number
  /** Degrees a second it floats east (clouds). */
  drift: number
  /** Its spot on the unit ball. */
  a: number
  b: number
  d: number
  /** Where it is this frame, as she sees it: x right, y up, z toward her. */
  x: number
  y: number
  z: number
  /** When she last poked it (the loop's clock, seconds). */
  poked: number
  /** Where her finger finds it this frame: px from the globe's center, and how near counts (0: out of sight). */
  hx: number
  hy: number
  hr: number
}

function toy(kind: ToyKind, lon: number, lat: number, size: number, tint = 0, drift = 0): Toy {
  const c = Math.cos(lat * DEG)
  return { kind, lon, lat, size, tint, drift, a: c * Math.sin(lon * DEG), b: Math.sin(lat * DEG), d: c * Math.cos(lon * DEG), x: 0, y: 0, z: -1, poked: -99, hx: 0, hy: 0, hr: 0 }
}

/** The rainbow stands on these two spots, over the island between them. */
const BOW_FEET: [[number, number], [number, number]] = [
  [177, 5],
  [-143, 25],
]

// Each stands clear of the countries' pins (meta.ts `globe`) and of the continents' named spots (Globe.tsx).
const TOYS: Toy[] = [
  // North America
  toy('pine', -138, 64, 0.15),
  toy('pine', -130, 61.5, 0.11),
  toy('pine', -73, 52, 0.15),
  toy('pine', -66, 54.5, 0.11),
  toy('peak', -113, 40, 0.14),
  toy('tree', -88, 37, 0.14, 1),
  toy('tree', -81, 40.5, 0.11, 0),
  toy('palm', -102, 24, 0.14),
  toy('peak', -42, 72, 0.12, 1),
  // South America
  toy('tree', -59, -3, 0.15, 0),
  toy('tree', -48, -8, 0.12, 2),
  toy('tree', -56, 3, 0.11, 3),
  toy('peak', -68, -31, 0.14),
  toy('palm', -42, -10, 0.13),
  // Europe
  toy('tree', 33, 51, 0.14, 1),
  toy('pine', 15, 62, 0.12),
  toy('tree', -4, 40.5, 0.11, 0),
  toy('tree', 40, 60, 0.11, 4),
  // Africa
  toy('palm', -6, 14, 0.15),
  toy('palm', 9, 21, 0.12),
  toy('tree', 22, -6, 0.15, 0),
  toy('tree', 29, -14, 0.11, 1),
  toy('peak', 37, -4, 0.13),
  toy('tree', 23, -25, 0.12, 2),
  toy('palm', 47, 22, 0.12),
  // Asia
  toy('pine', 64, 60, 0.15),
  toy('pine', 74, 63, 0.11),
  toy('pine', 118, 63, 0.15),
  toy('pine', 128, 65.5, 0.11),
  toy('pine', 152, 65, 0.12),
  toy('peak', 82, 32, 0.15),
  toy('palm', 77, 17, 0.14),
  toy('tree', 56, 42, 0.13, 0),
  toy('tree', 128, 48, 0.13, 2),
  toy('tree', 62, 47, 0.1, 3),
  // Australia
  toy('tree', 119, -28, 0.13, 0),
  // The sea
  toy('whale', -128, -16, 0.15),
  toy('whale', 74, -27, 0.14),
  toy('boat', -38, 29, 0.14),
  toy('boat', 160, -6, 0.13),
  toy('boat', -100, -34, 0.13),
  toy('isle', -162, 15, 0.15),
  toy('berg', -8, 72, 0.1),
  toy('berg', -172, 60, 0.1),
  // Clouds that float round the world, hanging over its edge as they come and go.
  toy('cloud', -150, 40, 0.3, 0, 1.1),
  toy('cloud', -38, 44, 0.24, 0, 0.8),
  toy('cloud', -18, -26, 0.28, 0, 1.3),
  toy('cloud', 72, -8, 0.25, 0, 0.9),
  toy('cloud', 158, 24, 0.27, 0, 1.2),
  toy('cloud', -112, -42, 0.23, 0, 0.7),
  toy('cloud', 20, 66, 0.2, 0, 1),
  toy('cloud', 100, -44, 0.22, 0, 1.4),
]
/** Clouds float this far above the ground (1: on it). */
const CLOUD_LIFT = 1.07
/** Facing her, a toy stands up the screen, tipped this much toward its side of the world. At the edge it points
 *  straight out from the ground; `ONTO` is how far onto the face (z) it has stood up. */
const TIP = 0.6
const ONTO = 0.45
/** Round the back, a toy is only worth painting while its top can still peek over the edge. */
const BEHIND = -0.6

// ---- One toy's frame: where it stands, which way it leans, how much of its height she sees ----

const F = {
  /** Its foot, px from the globe's center. */
  bx: 0,
  by: 0,
  /** Up, for the toy (a unit vector on the canvas, y down), and across (up turned a quarter). */
  dx: 0,
  dy: -1,
  nx: 1,
  ny: 0,
  /** The canvas turn of `across`, for ellipses. */
  rot: 0,
  /** How much of its height shows (1: side on, 0: straight down on its head). */
  f: 1,
  /** How round its footprint looks (1: from straight above, near 0: side on). */
  q: 0.1,
  /** px for one unit of height, and of width (a poke squashes and stretches them apart). */
  u: 1,
  v: 1,
  /** Which side is in shade: +1 along `across`, -1 against it (the light comes from the top left). */
  s: 1,
}
/** A point of the toy: `h` up its height, `s` across. */
const X = (h: number, s = 0) => F.bx + F.dx * h * F.f * F.u + F.nx * s * F.v
const Y = (h: number, s = 0) => F.by + F.dy * h * F.f * F.u + F.ny * s * F.v

/** A poke's boing: a quick squash and stretch that settles in about a second. */
const boing = (age: number) => (age >= 0 && age < 1.4 ? 1 + 0.45 * Math.sin(age * 16) * Math.exp(-age * 4) : 1)

/** Which way is up on the screen (x right, y up) for something standing at a spot of the world, and how far it has
 *  stood up (0 at the edge and behind, 1 on the face). */
function upOf(x: number, y: number, z: number): [number, number, number] {
  const r = Math.hypot(x, y) || 1
  const k = smoothstep(0, ONTO, z)
  return [lerp(x / r, x * TIP, k), lerp(y / r, 1, k), k]
}

function frame(t: Toy, R: number, time: number, sway: number, lean: number) {
  const [ux, uy, front] = upOf(t.x, t.y, t.z)
  const lx = ux + sway * 0.42 * front
  const ly = uy
  const len = Math.hypot(lx, ly)
  let dx = len > 0.02 ? lx / len : 0
  let dy = len > 0.02 ? -ly / len : -1
  if (lean) {
    const c = Math.cos(lean)
    const s = Math.sin(lean)
    ;[dx, dy] = [dx * c - dy * s, dx * s + dy * c]
  }
  const k = boing(time - t.poked)
  F.bx = t.x * R
  F.by = -t.y * R
  F.dx = dx
  F.dy = dy
  F.nx = -dy
  F.ny = dx
  F.rot = Math.atan2(F.ny, F.nx)
  F.f = Math.min(1, len)
  F.q = Math.sqrt(Math.max(0.03, 1 - F.f * F.f))
  F.u = R * t.size * k
  F.v = (R * t.size) / Math.sqrt(k)
  F.s = F.nx * 0.6 + F.ny * 0.8 >= 0 ? 1 : -1
}

// ---- Clay shapes ----

/** A ball `h` up (and `side` across): its shade, its color a little up and left, a dab of light. A ball looks the same
 *  from every side. */
function ball(g: G, h: number, r: number, [base, shade, light]: Tones, side = 0) {
  const cx = X(h, side)
  const cy = Y(h, side)
  const rr = r * F.v
  g.fillStyle = shade
  g.beginPath()
  g.arc(cx, cy, rr, 0, TAU)
  g.fill()
  g.fillStyle = base
  g.beginPath()
  g.arc(cx - rr * 0.1, cy - rr * 0.12, rr * 0.84, 0, TAU)
  g.fill()
  g.fillStyle = light
  g.beginPath()
  g.arc(cx - rr * 0.36, cy - rr * 0.4, rr * 0.2, 0, TAU)
  g.fill()
}

/** A cone from a round foot (`w` wide, `h0` up, `side` across) to its tip `h1` up, with its far side in shade. */
function cone(g: G, h0: number, w: number, h1: number, [base, shade]: Tones, side = 0) {
  const cx = X(h0, side)
  const cy = Y(h0, side)
  const ax = X(h1, side)
  const ay = Y(h1, side)
  const rw = w * F.v
  const ex = F.nx * rw
  const ey = F.ny * rw
  g.fillStyle = base
  g.beginPath()
  g.ellipse(cx, cy, rw, rw * F.q, F.rot, 0, TAU)
  g.fill()
  g.beginPath()
  g.moveTo(cx + ex, cy + ey)
  g.lineTo(ax, ay)
  g.lineTo(cx - ex, cy - ey)
  g.fill()
  g.fillStyle = shade
  g.beginPath()
  g.ellipse(cx, cy, rw, rw * F.q, F.rot, F.s > 0 ? -Math.PI / 2 : Math.PI / 2, F.s > 0 ? Math.PI / 2 : Math.PI * 1.5)
  g.fill()
  g.beginPath()
  g.moveTo(ax, ay)
  g.lineTo(cx + ex * F.s, cy + ey * F.s)
  g.lineTo(cx, cy)
  g.fill()
}

/** A mound on the ground: `r` wide, `tall` times that high (1: half a ball). */
function dome(g: G, r: number, tall: number, fill: string, ox = 0, oy = 0) {
  const rr = r * F.v
  g.fillStyle = fill
  g.beginPath()
  g.ellipse(F.bx + ox, F.by + oy, rr, Math.max(rr * F.q, r * F.u * Math.hypot(F.q, tall * F.f)), F.rot, Math.PI, TAU)
  g.ellipse(F.bx + ox, F.by + oy, rr, rr * F.q, F.rot, 0, Math.PI)
  g.fill()
}

/** A flat round patch on the ground under the toy (foam round a boat, the shallows round an island). */
function patch(g: G, r: number, fill: string) {
  g.fillStyle = fill
  g.beginPath()
  g.ellipse(F.bx, F.by, r * F.v, r * F.v * F.q, F.rot, 0, TAU)
  g.fill()
}

/** A trunk or a mast: from `h0` to `h1` up, `w0` wide at the foot and `w1` at the top. */
function post(g: G, h0: number, h1: number, w0: number, w1: number, fill: string) {
  g.fillStyle = fill
  g.beginPath()
  g.moveTo(X(h0, -w0), Y(h0, -w0))
  g.lineTo(X(h0, w0), Y(h0, w0))
  g.lineTo(X(h1, w1), Y(h1, w1))
  g.lineTo(X(h1, -w1), Y(h1, -w1))
  g.fill()
}

/** A shape through points given as [up, across]. */
function shape(g: G, fill: string, pts: [number, number][]) {
  g.fillStyle = fill
  g.beginPath()
  pts.forEach(([h, s], i) => (i ? g.lineTo(X(h, s), Y(h, s)) : g.moveTo(X(h, s), Y(h, s))))
  g.fill()
}

/** A flat-bottomed cloud of round puffs, `w` wide, centered on x, y (the shell's Cloud, drawn on a canvas). */
function puffs(g: G, x: number, y: number, w: number) {
  const u = w / 220
  g.beginPath()
  g.ellipse(x, y + 26 * u, 100 * u, 22 * u, 0, 0, TAU)
  g.moveTo(x - 20 * u, y + 12 * u)
  g.arc(x - 52 * u, y + 12 * u, 32 * u, 0, TAU)
  g.moveTo(x + 42 * u, y - 6 * u)
  g.arc(x - 2 * u, y - 6 * u, 44 * u, 0, TAU)
  g.moveTo(x + 84 * u, y + 10 * u)
  g.arc(x + 50 * u, y + 10 * u, 34 * u, 0, TAU)
  g.fill()
}

/** A four-pointed twinkle. */
function twinkle(g: G, x: number, y: number, r: number) {
  g.beginPath()
  g.moveTo(x, y - r)
  g.quadraticCurveTo(x, y, x + r, y)
  g.quadraticCurveTo(x, y, x, y + r)
  g.quadraticCurveTo(x, y, x - r, y)
  g.quadraticCurveTo(x, y, x, y - r)
  g.fill()
}

// ---- The toys ----

function palm(g: G) {
  const tx = X(0.8)
  const ty = Y(0.8)
  g.strokeStyle = WOOD[0]
  g.lineCap = 'round'
  g.lineWidth = 0.1 * F.v
  g.beginPath()
  g.moveTo(F.bx, F.by)
  g.quadraticCurveTo(X(0.45, 0.16), Y(0.45, 0.16), tx, ty)
  g.stroke()
  // Five fronds fanning out from the top: the two behind in shade.
  const up = Math.atan2(F.dy, F.dx)
  for (const [off, fill] of [[-2.05, LEAF[1]], [2.05, LEAF[1]], [-1.05, LEAF[0]], [1.05, LEAF[0]], [0, LEAF[2]]] as const) {
    const a = up + off
    g.fillStyle = fill
    g.beginPath()
    g.ellipse(tx + Math.cos(a) * 0.21 * F.v, ty + Math.sin(a) * 0.21 * F.v, 0.27 * F.v, 0.095 * F.v, a, 0, TAU)
    g.fill()
  }
  g.fillStyle = '#8a5b3d'
  g.beginPath()
  g.arc(tx - 0.05 * F.v, ty + 0.03 * F.v, 0.055 * F.v, 0, TAU)
  g.arc(tx + 0.06 * F.v, ty + 0.05 * F.v, 0.05 * F.v, 0, TAU)
  g.fill()
}

function whale(g: G, t: Toy, time: number) {
  const v = F.v
  patch(g, 0.74, 'rgba(255, 255, 255, 0.5)')
  // Her tail, up out of the water behind her.
  const tx = X(0.66, -0.74)
  const ty = Y(0.66, -0.74)
  g.strokeStyle = BLOSSOM[1]
  g.lineCap = 'round'
  g.lineWidth = 0.14 * v
  g.beginPath()
  g.moveTo(X(0.05, -0.4), Y(0.05, -0.4))
  g.quadraticCurveTo(X(0.2, -0.78), Y(0.2, -0.78), tx, ty)
  g.stroke()
  // Two flukes, up and out like a V.
  g.fillStyle = BLOSSOM[0]
  for (const side of [-1, 1]) {
    const fx = F.nx * side * 0.62 + F.dx * 0.78
    const fy = F.ny * side * 0.62 + F.dy * 0.78
    g.beginPath()
    g.ellipse(tx + fx * 0.14 * v, ty + fy * 0.14 * v, 0.19 * v, 0.09 * v, Math.atan2(fy, fx), 0, TAU)
    g.fill()
  }
  // Her back: a pink mound in the sea, a cheek of light, one eye and a blush.
  dome(g, 0.52, 0.8, BLOSSOM[1])
  dome(g, 0.46, 0.8, BLOSSOM[0], -0.035 * v, -0.045 * v)
  const lift = 0.2 * F.u * F.f
  const ex = F.bx + F.nx * 0.24 * v + F.dx * lift
  const ey = F.by + F.ny * 0.24 * v + F.dy * lift
  g.fillStyle = 'rgba(255, 79, 154, 0.5)'
  g.beginPath()
  g.ellipse(ex + F.nx * 0.15 * v + 0.01 * v, ey + F.ny * 0.15 * v + 0.07 * v, 0.075 * v, 0.05 * v, 0, 0, TAU)
  g.fill()
  g.fillStyle = INK
  g.beginPath()
  g.arc(ex, ey, 0.062 * v, 0, TAU)
  g.fill()
  g.fillStyle = '#fff'
  g.beginPath()
  g.arc(ex + 0.022 * v, ey - 0.024 * v, 0.024 * v, 0, TAU)
  g.fill()
  // A little smile at the front.
  g.strokeStyle = INK
  g.lineWidth = Math.max(1.2, 0.03 * v)
  g.beginPath()
  g.moveTo(X(0.1, 0.5), Y(0.1, 0.5))
  g.quadraticCurveTo(X(0.04, 0.4), Y(0.04, 0.4), X(0.1, 0.3), Y(0.1, 0.3))
  g.stroke()
  // Her spout: a little one every few seconds, a big one when she is poked.
  const age = time - t.poked
  const idle = (((time * 0.15 + t.lon * 0.013) % 1) + 1) % 1
  const a = age >= 0 && age < 1.1 ? age / 1.1 : idle < 0.16 ? idle / 0.16 : -1
  if (a < 0) return
  const amp = Math.sin(Math.PI * a) * (age >= 0 && age < 1.1 ? 1.7 : 1)
  const ox = X(0.34)
  const oy = Y(0.34)
  // It still shows from straight above.
  const high = 0.7 * F.u * Math.max(F.f, 0.55) * amp
  g.strokeStyle = '#fff'
  g.fillStyle = '#fff'
  g.lineWidth = 0.075 * v
  for (const side of [-1, 1]) {
    const out = side * 0.34 * v * Math.min(1.3, amp)
    const endX = ox + F.dx * high * 0.72 + F.nx * out
    const endY = oy + F.dy * high * 0.72 + F.ny * out
    g.beginPath()
    g.moveTo(ox, oy)
    g.quadraticCurveTo(ox + F.dx * high * 1.3 + F.nx * side * 0.05 * v, oy + F.dy * high * 1.3 + F.ny * side * 0.05 * v, endX, endY)
    g.stroke()
    g.beginPath()
    g.arc(endX, endY, 0.065 * v, 0, TAU)
    g.fill()
  }
}

function draw(g: G, t: Toy, R: number, time: number, sway: number) {
  if (t.kind === 'cloud') return cloud(g, t, R, time)
  const phase = t.lon * 0.7
  const lean = t.kind === 'boat' ? Math.sin(time * 1.8 + phase) * 0.12 : t.kind === 'peak' || t.kind === 'whale' ? 0 : Math.sin(time * 1.2 + phase) * 0.045
  frame(t, R, time, t.kind === 'peak' || t.kind === 'berg' || t.kind === 'whale' ? sway * 0.25 : sway, lean)
  // Her finger finds it around its middle.
  t.hx = X(0.5)
  t.hy = Y(0.5)
  t.hr = Math.max(26, R * t.size * 0.62)
  // Round the back, only the part that peeks over the edge can be poked.
  if (t.z < 0 && Math.hypot(t.hx, t.hy) < R) t.hr = 0
  switch (t.kind) {
    case 'tree':
      // A puffy crown: a small ball tucked in beside the big one.
      post(g, 0, 0.45, 0.08, 0.06, WOOD[1])
      ball(g, 0.5, 0.23, CROWNS[t.tint], 0.25 * F.s)
      ball(g, 0.64, 0.36, CROWNS[t.tint])
      break
    case 'pine':
      post(g, 0, 0.3, 0.055, 0.055, WOOD[1])
      cone(g, 0.16, 0.3, 0.6, PINE)
      cone(g, 0.42, 0.23, 0.82, PINE)
      cone(g, 0.66, 0.16, 1, PINE)
      break
    case 'palm':
      palm(g)
      break
    case 'peak': {
      const tones = t.tint ? SNOW : STONE
      cone(g, 0, 0.3, 0.6, tones, -0.36)
      cone(g, 0, 0.42, 1, tones)
      if (!t.tint) cone(g, 0.6, 0.168, 1, SNOW)
      break
    }
    case 'berg':
      patch(g, 0.66, 'rgba(255, 255, 255, 0.5)')
      cone(g, 0, 0.26, 0.55, ICE, -0.3)
      cone(g, 0, 0.36, 1, ICE, 0.06)
      break
    case 'isle':
      patch(g, 0.72, 'rgba(255, 255, 255, 0.45)')
      dome(g, 0.5, 0.32, SAND[1])
      dome(g, 0.44, 0.32, SAND[0], -0.03 * F.v, -0.035 * F.v)
      F.bx = X(0.1)
      F.by = Y(0.1)
      palm(g)
      break
    case 'whale':
      whale(g, t, time)
      break
    case 'boat':
      patch(g, 0.6, 'rgba(255, 255, 255, 0.5)')
      dome(g, 0.4, 0.5, GOLD[1])
      dome(g, 0.34, 0.5, GOLD[0], -0.03 * F.v, -0.035 * F.v)
      post(g, 0.1, 1, 0.028, 0.022, WOOD[1])
      shape(g, '#ffffff', [[0.95, 0.04], [0.3, 0.04], [0.3, 0.52]])
      shape(g, '#e4ddf6', [[0.3, 0.04], [0.3, 0.52], [0.42, 0.04]])
      shape(g, BLOSSOM[2], [[0.85, -0.04], [0.32, -0.04], [0.32, -0.36]])
      shape(g, '#ff4f9a', [[1, 0], [0.92, 0.17], [0.85, 0]])
      break
  }
}

/** A cloud floats above the ground and never leans: it is its own soft shade and white puffs. */
function cloud(g: G, t: Toy, R: number, time: number) {
  const k = boing(time - t.poked)
  const w = R * t.size * (0.72 + 0.28 * Math.max(0, t.z)) * k
  // The rainbow's two (they don't float off) sit right on its feet.
  const lift = t.drift ? CLOUD_LIFT : 1.02
  const x = t.x * R * lift
  const y = -t.y * R * lift
  g.fillStyle = '#e8ddff'
  puffs(g, x, y + w * 0.045, w)
  g.fillStyle = '#fff'
  puffs(g, x, y, w)
  t.hx = x
  t.hy = y
  t.hr = t.z < 0 && Math.hypot(x, y) < R ? 0 : Math.max(26, w * 0.45)
}

// ---- The rainbow ----

const BOW = (() => {
  const [p, q] = BOW_FEET.map(([lon, lat]) => toy('rainbow', lon, lat, 0))
  const mid = [(p.a + q.a) / 2, (p.b + q.b) / 2, (p.d + q.d) / 2]
  const across = [q.a - p.a, q.b - p.b, q.d - p.d]
  const half = Math.hypot(across[0], across[1], across[2]) / 2
  const out = Math.hypot(mid[0], mid[1], mid[2])
  return { mid, along: across.map((n) => n / (half * 2)), up: mid.map((n) => n / out), half, poked: -99, hx: 0, hy: 0, hr: 0 }
})()
/** Each band's width, as a part of the bow's half-span, and how tall the bow stands for its width. */
const BAND = 0.085
const BOW_TALL = 0.82
const BOW_STEPS = 26
// Its feet rest in two little clouds, one over the middle of each foot.
for (const side of [-1, 1]) {
  const at = BOW.mid.map((n, i) => n + BOW.along[i] * side * BOW.half * (1 - BAND * (BANDS.length - 1) * 0.5))
  const foot = toy('cloud', 0, 0, 0.25)
  const far = Math.hypot(at[0], at[1], at[2])
  ;[foot.a, foot.b, foot.d] = at.map((n) => n / far)
  TOYS.push(foot)
}

function rainbow(g: G, R: number, t: Turn, time: number) {
  const age = time - BOW.poked
  g.lineCap = 'round'
  g.lineJoin = 'round'
  g.lineWidth = BOW.half * BAND * R * 1.12
  BOW.hr = 0
  const top = turned(BOW.up[0], BOW.up[1], BOW.up[2], t)
  const [ux, uy] = upOf(top[0], top[1], top[2])
  BANDS.forEach((color, i) => {
    // A poke sends a shimmer through the bands, outside in.
    const shimmer = age >= 0 && age < 1.6 ? 0.07 * Math.sin(age * 14 - i * 0.9) * Math.exp(-age * 3) : 0
    const r = BOW.half * (1 - i * BAND + shimmer)
    g.strokeStyle = color
    g.beginPath()
    let pen = false
    for (let k = 0; k <= BOW_STEPS; k++) {
      const turn = (Math.PI * k) / BOW_STEPS
      const along = -Math.cos(turn) * r
      const up = Math.sin(turn) * r * BOW_TALL
      // Its foot line runs through the world from one cloud to the other; the bow stands up from it like the toys do.
      const [bx, by, bz] = turned(BOW.mid[0] + BOW.along[0] * along, BOW.mid[1] + BOW.along[1] * along, BOW.mid[2] + BOW.along[2] * along, t)
      const x = bx + ux * up
      const y = by + uy * up
      // Round the back it shows only where it stands out past the edge of the world.
      const seen = bz >= 0 || x * x + y * y > 1.02
      if (seen && pen) g.lineTo(x * R, -y * R)
      else if (seen) g.moveTo(x * R, -y * R)
      pen = seen
      if (i === 2 && k === BOW_STEPS / 2 && seen) {
        BOW.hx = x * R
        BOW.hy = -y * R
        BOW.hr = Math.max(30, BOW.half * R * 0.5)
      }
    }
    g.stroke()
  })
}

/** The toys back to front, sorted again each frame. */
const ORDER = TOYS.map((_, i) => i)

// ---- The baby moon ----

/** It goes round the world once in this many seconds, on a tilted ring just clear of the ground. */
const MOON = { seconds: 38, ring: 1.15, flat: 0.3, roll: -0.24, size: 0.075 }
const moon = { x: 0, y: 0, z: 0, r: 0, poked: -99 }

function placeMoon(R: number, time: number, back = 0) {
  const a = ((time - back) / MOON.seconds) * TAU
  const x = Math.cos(a) * MOON.ring * R
  const y = Math.sin(a) * MOON.flat * MOON.ring * R
  const c = Math.cos(MOON.roll)
  const s = Math.sin(MOON.roll)
  return { x: x * c - y * s, y: x * s + y * c, z: Math.sin(a) }
}

function paintMoon(g: G, R: number, time: number) {
  const r = moon.r
  const age = time - moon.poked
  const awake = age >= 0 && age < 2.2
  // A trail of twinkles follows it round.
  g.fillStyle = '#fff'
  for (let i = 1; i <= 3; i++) {
    const p = placeMoon(R, time, i * 0.85)
    if (p.z < 0 && Math.hypot(p.x, p.y) < R * 1.03) continue
    g.globalAlpha = 0.85 - i * 0.2
    twinkle(g, p.x, p.y, r * (0.52 - i * 0.1))
  }
  g.globalAlpha = 1
  g.save()
  g.translate(moon.x, moon.y)
  // Poked, it wakes up with a twirl and a little burst of twinkles.
  if (awake) {
    const burst = Math.min(1, age / 0.6)
    g.globalAlpha = 1 - burst
    for (let i = 0; i < 5; i++) twinkle(g, Math.cos(i * 1.257 + 0.4) * r * (1.2 + burst * 1.3), Math.sin(i * 1.257 + 0.4) * r * (1.2 + burst * 1.3), r * 0.34)
    g.globalAlpha = 1
    if (age < 0.7) g.rotate(TAU * (1 - (1 - age / 0.7) ** 2))
    g.scale(boing(age), boing(age))
  } else g.rotate(Math.sin(time * 0.9) * 0.12)
  // A butter ball with two little craters.
  g.fillStyle = BUTTER[1]
  g.beginPath()
  g.arc(0, 0, r, 0, TAU)
  g.fill()
  g.fillStyle = BUTTER[0]
  g.beginPath()
  g.arc(-r * 0.09, -r * 0.11, r * 0.86, 0, TAU)
  g.fill()
  g.fillStyle = BUTTER[2]
  g.beginPath()
  g.arc(-r * 0.4, -r * 0.5, r * 0.17, 0, TAU)
  g.fill()
  g.fillStyle = BUTTER[1]
  g.beginPath()
  g.arc(r * 0.46, -r * 0.42, r * 0.13, 0, TAU)
  g.arc(-r * 0.5, r * 0.4, r * 0.1, 0, TAU)
  g.fill()
  // Its face: fast asleep, or wide awake for a moment.
  g.fillStyle = 'rgba(255, 143, 184, 0.6)'
  g.beginPath()
  g.ellipse(-r * 0.5, r * 0.2, r * 0.17, r * 0.11, 0, 0, TAU)
  g.ellipse(r * 0.5, r * 0.2, r * 0.17, r * 0.11, 0, 0, TAU)
  g.fill()
  g.strokeStyle = INK
  g.fillStyle = INK
  g.lineCap = 'round'
  g.lineWidth = Math.max(1.5, r * 0.09)
  for (const side of [-1, 1]) {
    g.beginPath()
    if (awake) {
      g.ellipse(side * r * 0.3, -r * 0.02, r * 0.1, r * 0.13, 0, 0, TAU)
      g.fill()
    } else {
      g.arc(side * r * 0.3, -r * 0.08, r * 0.13, 0.15 * Math.PI, 0.85 * Math.PI)
      g.stroke()
    }
  }
  g.beginPath()
  g.arc(0, r * 0.2, awake ? r * 0.14 : r * 0.09, 0.1 * Math.PI, 0.9 * Math.PI)
  g.stroke()
  g.restore()
}

// ---- Painting them (sphere.ts's paintGlobe calls these, in this order) ----

/** Works out where every toy is this frame. Call it first. */
export function placeToys(R: number, t: Turn, time: number) {
  for (const toy of TOYS) {
    if (toy.drift) {
      const lon = (toy.lon + toy.drift * time) * DEG
      const c = Math.cos(toy.lat * DEG)
      toy.a = c * Math.sin(lon)
      toy.d = c * Math.cos(lon)
    }
    ;[toy.x, toy.y, toy.z] = turned(toy.a, toy.b, toy.d, t)
    toy.hr = 0
  }
  ORDER.sort((p, q) => TOYS[p].z - TOYS[q].z)
  const at = placeMoon(R, time)
  moon.x = at.x
  moon.y = at.y
  moon.z = at.z
  moon.r = R * MOON.size * (1 + 0.14 * at.z)
}

/** Behind the globe (paint before the sea): the moon on the far side of its ring, and whatever peeks over the edge. */
export function paintBehind(g: G, R: number, time: number) {
  if (moon.z < 0) paintMoon(g, R, time)
  for (const i of ORDER) {
    const toy = TOYS[i]
    if (toy.z >= 0) break
    if (toy.z > BEHIND) draw(g, toy, R, time, 0)
  }
}

/** On the ground (paint inside the globe's edge, over the land): a soft shadow under each toy and each cloud. */
export function paintShadows(g: G, R: number) {
  for (const toy of TOYS) {
    if (toy.z <= 0.05) continue
    const fade = Math.min(1, toy.z * 3)
    const x = toy.x * R
    const y = -toy.y * R
    if (toy.kind === 'cloud') {
      const w = R * toy.size * (0.72 + 0.28 * toy.z)
      g.fillStyle = `rgba(${SHADE}, ${0.13 * fade})`
      puffs(g, x + w * 0.07, y + w * 0.16, w)
    } else if (toy.kind === 'tree' || toy.kind === 'pine' || toy.kind === 'palm' || toy.kind === 'peak') {
      // Round on the ground, so it flattens toward the edge of the world.
      const r = R * toy.size * (toy.kind === 'peak' ? 0.5 : 0.32)
      g.fillStyle = `rgba(${SHADE}, ${0.16 * fade})`
      g.beginPath()
      g.ellipse(x + r * 0.22, y + r * 0.24, r, r * (0.3 + 0.7 * toy.z), Math.atan2(y, x) + Math.PI / 2, 0, TAU)
      g.fill()
    }
  }
}

/** In front (paint last, over the globe's edge): the rainbow, everything standing on this side, the clouds, the moon. */
export function paintFront(g: G, R: number, t: Turn, time: number, sway: number) {
  rainbow(g, R, t, time)
  for (const i of ORDER) if (TOYS[i].z >= 0 && TOYS[i].kind !== 'cloud') draw(g, TOYS[i], R, time, sway)
  for (const i of ORDER) if (TOYS[i].z >= 0 && TOYS[i].kind === 'cloud') draw(g, TOYS[i], R, time, sway)
  if (moon.z >= 0) paintMoon(g, R, time)
}

// ---- Her finger ----

let lastPoke = -99

/**
 * She tapped at x, y (px from the globe's center): the toy there boings, and its kind comes back (for its sound).
 * Nothing there: undefined. `time` is the loop's clock, in seconds.
 */
export function pokeAt(x: number, y: number, R: number, time: number): ToyKind | undefined {
  let hit: ToyKind | undefined
  // The moon first (it flies over everything), unless it is behind the world.
  if ((moon.z >= 0 || Math.hypot(moon.x, moon.y) > R) && Math.hypot(x - moon.x, y - moon.y) < Math.max(30, moon.r * 1.5)) {
    moon.poked = time
    hit = 'moon'
  } else {
    let best: Toy | undefined
    let near = 1
    for (const toy of TOYS) {
      if (!toy.hr) continue
      const d = Math.hypot(x - toy.hx, y - toy.hy) / toy.hr
      if (d < near) {
        near = d
        best = toy
      }
    }
    if (best) {
      best.poked = time
      hit = best.kind
    } else if (BOW.hr && Math.hypot(x - BOW.hx, y - BOW.hy) < BOW.hr) {
      BOW.poked = time
      hit = 'rainbow'
    }
  }
  if (hit) lastPoke = time
  return hit
}

/** Where each toy she could poke right now is (px from the globe's center): the robots aim their finger with it. */
export function toySpots(R: number): { kind: ToyKind; x: number; y: number }[] {
  const spots = TOYS.filter((toy) => toy.hr).map((toy) => ({ kind: toy.kind, x: toy.hx, y: toy.hy }))
  if (moon.z >= 0 || Math.hypot(moon.x, moon.y) > R) spots.push({ kind: 'moon', x: moon.x, y: moon.y })
  if (BOW.hr) spots.push({ kind: 'rainbow', x: BOW.hx, y: BOW.hy })
  return spots
}

/** Is a poked toy still wobbling? (The globe paints every frame while one is.) */
export const toysBusy = (time: number) => time - lastPoke < 2.3

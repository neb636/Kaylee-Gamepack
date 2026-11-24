// The home globe's geometry and its picture: the shared land outlines (land.ts) as shapes on a ball, which way the
// ball is turned, what is under her finger, and the painting itself (a 2D canvas: flat pastel land with a lip of
// shade, streaks on the sea, drifting clouds, one soft shade on the far side). No three.js: this loads at startup.
import { clamp, DEG, TO_DEG, wrapAngle } from '../../sdk/math'
import { AFRICA, antarcticaCoast, ARABIA, AUSTRALIA, EURASIA, EUROPE_BOX, GREENLAND, ISLANDS, LAND_COLORS, NORTH_AMERICA, SOUTH_AMERICA, type LandColor, type Pt } from './land'

export type Continent = 'northAmerica' | 'southAmerica' | 'europe' | 'africa' | 'asia' | 'australia' | 'antarctica'

/** Which point of the Earth faces her, in degrees. */
export interface View {
  lon: number
  lat: number
}

/** How far she can tip the globe: enough to peek at Antarctica or look down on the North Pole, never upside down. */
export const TILT = { min: -30, max: 38, home: 16 }
/** Pins float this far above the ground (1 = on it), so they stand out from the globe as it turns. */
export const LIFT = 1.17

// ---- Shapes ----

interface Shape {
  color: LandColor
  continent?: Continent
  /** The outline, close-set points in [lon, lat]. */
  ring: Pt[]
  /** The same points on the unit ball: (cos lat sin lon, sin lat, cos lat cos lon). */
  xyz: Float32Array
  /** [west, south, east, north], for a quick "is it near" test. */
  box: [number, number, number, number]
  /** A cap around a pole: its outline is a loop of longitude, so the flat inside test doesn't apply. */
  polar?: boolean
}

const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]

/** Rounded coasts: a curve through the midpoints of the outline (the same one the Poles' globe paints). */
function smoothRing(pts: Pt[], steps = 4): Pt[] {
  const out: Pt[] = []
  for (let i = 0; i < pts.length; i++) {
    const a = mid(pts[(i + pts.length - 1) % pts.length], pts[i])
    const c = pts[i]
    const b = mid(pts[i], pts[(i + 1) % pts.length])
    for (let k = 0; k < steps; k++) {
      const t = k / steps
      const u = 1 - t
      out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]])
    }
  }
  return out
}

/** No edge longer than `max` degrees, so straight edges bend with the ball and the horizon cuts them cleanly. */
function densify(ring: Pt[], max = 3): Pt[] {
  const out: Pt[] = []
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]
    const b = ring[(i + 1) % ring.length]
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) / max))
    for (let k = 0; k < n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n])
  }
  return out
}

/** The part of a ring inside a lon/lat box (Europe out of Eurasia). */
function clipBox(ring: Pt[], { west, east, south, north }: typeof EUROPE_BOX): Pt[] {
  const cut = (pts: Pt[], axis: 0 | 1, at: number, keepAbove: boolean) => {
    const out: Pt[] = []
    const inside = (p: Pt) => (keepAbove ? p[axis] >= at : p[axis] <= at)
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i]
      const b = pts[(i + 1) % pts.length]
      if (inside(a)) out.push(a)
      if (inside(a) !== inside(b)) {
        const t = (at - a[axis]) / (b[axis] - a[axis])
        out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
      }
    }
    return out
  }
  return cut(cut(cut(cut(ring, 0, west, true), 0, east, false), 1, south, true), 1, north, false)
}

function ellipse(lon: number, lat: number, rx: number, ry: number, turn = 0, n = 18): Pt[] {
  const out: Pt[] = []
  const c = Math.cos(turn * DEG)
  const s = Math.sin(turn * DEG)
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2
    const x = rx * Math.cos(a)
    const y = ry * Math.sin(a)
    // The Poles' globe turns these on a canvas (y down), so the turn is mirrored here (latitude goes up).
    out.push([lon + x * c - y * s, lat - (x * s + y * c)])
  }
  return out
}

function shape(ring: Pt[], color: LandColor, continent?: Continent, polar = false): Shape {
  const xyz = new Float32Array(ring.length * 3)
  const box: Shape['box'] = [180, 90, -180, -90]
  ring.forEach(([lon, lat], i) => {
    const cl = Math.cos(lat * DEG)
    xyz[i * 3] = cl * Math.sin(lon * DEG)
    xyz[i * 3 + 1] = Math.sin(lat * DEG)
    xyz[i * 3 + 2] = cl * Math.cos(lon * DEG)
    box[0] = Math.min(box[0], lon)
    box[1] = Math.min(box[1], lat)
    box[2] = Math.max(box[2], lon)
    box[3] = Math.max(box[3], lat)
  })
  return { color, continent, ring, xyz, box, polar }
}

const loop = (lat: (lon: number) => number): Pt[] => Array.from({ length: 120 }, (_, i) => [-180 + i * 3, lat(-180 + i * 3)] as Pt)
const eurasia = densify(smoothRing(EURASIA))
const ISLAND_CONTINENT: Partial<Record<LandColor, Continent>> = { north: 'northAmerica', europe: 'europe', asia: 'asia', africa: 'africa' }

// Painted in this order (Europe over Eurasia, ice last).
const SHAPES: Shape[] = [
  shape(densify(smoothRing(NORTH_AMERICA)), 'north', 'northAmerica'),
  shape(densify(smoothRing(SOUTH_AMERICA)), 'south', 'southAmerica'),
  shape(densify(smoothRing(AFRICA)), 'africa', 'africa'),
  shape(densify(smoothRing(ARABIA)), 'asia', 'asia'),
  shape(eurasia, 'asia', 'asia'),
  shape(densify(clipBox(eurasia, EUROPE_BOX)), 'europe', 'europe'),
  shape(densify(smoothRing(AUSTRALIA)), 'australia', 'australia'),
  // Tasmania is Australia; New Guinea and New Zealand share its color but not its name.
  ...ISLANDS.map(([lon, lat, rx, ry, color, turn]) => shape(ellipse(lon, lat, rx, ry, turn), color, color === 'australia' ? (lon < 150 && lat < -30 ? 'australia' : undefined) : ISLAND_CONTINENT[color])),
  shape(densify(smoothRing(GREENLAND)), 'ice', 'northAmerica'),
  shape(loop(antarcticaCoast), 'ice', 'antarctica', true),
  // Sea ice over the North Pole, so the top of the globe is white too.
  shape(loop((lon) => 80 + 1.8 * Math.sin(lon * 3 * DEG) + 1.2 * Math.cos(lon * 5 * DEG)), 'ice', undefined, true),
]
const MOST = Math.max(...SHAPES.map((s) => s.ring.length))

/** The lip under each color: the same hue, a little deeper and cooler (shelf/STYLE.md's shades). */
const LAND_SHADE: Record<LandColor, string> = { north: '#5cc6a6', south: '#f09d80', europe: '#a48fe6', asia: '#e7699c', africa: '#ecc95c', australia: '#e89a62', ice: '#d9d3ef' }

function inside({ ring, box }: Shape, lon: number, lat: number) {
  if (lon < box[0] || lon > box[2] || lat < box[1] || lat > box[3]) return false
  let hit = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}

const wrapLon = (lon: number) => ((((lon + 180) % 360) + 360) % 360) - 180

/** The continent at a spot, or none (the sea, sea ice, an island with no continent's name). */
export function continentAt(lon: number, lat: number): Continent | undefined {
  lon = wrapLon(lon)
  if (lat < antarcticaCoast(lon)) return 'antarctica'
  for (let i = SHAPES.length - 1; i >= 0; i--) if (!SHAPES[i].polar && inside(SHAPES[i], lon, lat)) return SHAPES[i].continent
  return undefined
}

/** Is there any land here (for keeping the sea's streaks off the coasts)? */
const isLand = (lon: number, lat: number) => lat < antarcticaCoast(wrapLon(lon)) + 3 || lat > 74 || SHAPES.some((s) => !s.polar && inside(s, wrapLon(lon), lat))

// ---- Turning the ball ----

/** The view's sines and cosines, worked out once per frame. */
export interface Turn {
  sl: number
  cl: number
  sp: number
  cp: number
}
export const turnOf = (v: View): Turn => ({ sl: Math.sin(v.lon * DEG), cl: Math.cos(v.lon * DEG), sp: Math.sin(v.lat * DEG), cp: Math.cos(v.lat * DEG) })

/** A spot on the Earth, as she sees it: x right, y up, z toward her (behind the globe when negative), each -1..1. */
export function project(lon: number, lat: number, t: Turn): [number, number, number] {
  const c = Math.cos(lat * DEG)
  const a = c * Math.sin(lon * DEG)
  const b = Math.sin(lat * DEG)
  const d = c * Math.cos(lon * DEG)
  const z1 = a * t.sl + d * t.cl
  return [a * t.cl - d * t.sl, b * t.cp - z1 * t.sp, b * t.sp + z1 * t.cp]
}

/** The spot on the Earth under a point of the disc (x right, y up, -1..1), or null off the globe. */
export function unproject(x: number, y: number, t: Turn): Pt | null {
  const r2 = x * x + y * y
  if (r2 >= 1) return null
  const z = Math.sqrt(1 - r2)
  const z1 = z * t.cp - y * t.sp
  const b = clamp(y * t.cp + z * t.sp, -1, 1)
  return [Math.atan2(x * t.cl + z1 * t.sl, -x * t.sl + z1 * t.cl) * TO_DEG, Math.asin(b) * TO_DEG]
}

// ---- The picture ----

// Scratch space for one outline on screen.
const PX = new Float32Array(MOST)
const PY = new Float32Array(MOST)
const ANG = new Float32Array(MOST)
const HID = new Uint8Array(MOST)

/**
 * One land shape as a path on the disc (radius R around 0,0), or null when all of it is round the back.
 * Points behind the globe slide out to its edge, and the outline follows the edge between them, so a continent
 * half over the horizon is cut by the horizon. A shape that covers the spot right behind the globe (Asia, seen from
 * the Pacific) shows as slivers along the edge: each visible stretch closes on itself.
 */
function landPath(s: Shape, t: Turn, R: number, behind: boolean): Path2D | null {
  const n = s.ring.length
  let seen = 0
  for (let i = 0; i < n; i++) {
    const a = s.xyz[i * 3]
    const b = s.xyz[i * 3 + 1]
    const d = s.xyz[i * 3 + 2]
    const z1 = a * t.sl + d * t.cl
    let x = a * t.cl - d * t.sl
    let y = b * t.cp - z1 * t.sp
    if (b * t.sp + z1 * t.cp < 0) {
      const m = Math.hypot(x, y) || 1
      x /= m
      y /= m
      HID[i] = 1
      ANG[i] = Math.atan2(-y, x)
    } else {
      HID[i] = 0
      seen++
    }
    PX[i] = x * R
    PY[i] = -y * R
  }
  if (!seen) return null
  const p = new Path2D()
  if (seen === n) {
    p.moveTo(PX[0], PY[0])
    for (let i = 1; i < n; i++) p.lineTo(PX[i], PY[i])
    p.closePath()
    return p
  }
  const edge = (from: number, to: number) => {
    const turn = wrapAngle(ANG[to] - ANG[from])
    if (Math.abs(turn) > 1e-4) p.arc(0, 0, R, ANG[from], ANG[to], turn < 0)
  }
  let start = 0
  while (!(HID[start] && !HID[(start + 1) % n])) start++
  if (!behind) {
    p.moveTo(PX[start], PY[start])
    for (let k = 1; k < n; k++) {
      const i = (start + k) % n
      const prev = (i + n - 1) % n
      if (HID[i] && HID[prev]) edge(prev, i)
      else p.lineTo(PX[i], PY[i])
    }
    const last = (start + n - 1) % n
    if (HID[last]) edge(last, start)
    p.closePath()
    return p
  }
  let k = 0
  while (k < n) {
    const i = (start + k) % n
    if (HID[i] && !HID[(i + 1) % n]) {
      p.moveTo(PX[i], PY[i])
      let j = i
      do {
        j = (j + 1) % n
        p.lineTo(PX[j], PY[j])
        k++
      } while (!HID[j] && k < n)
      edge(j, i)
      p.closePath()
    } else k++
  }
  return p
}

/** A little random-number maker with a seed, so the sea's streaks are the same every time. */
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
}

/** Light streaks on the open sea: [lon, lat, length in degrees]. They turn with the globe, so the sea shows the spin. */
const STREAKS: [number, number, number][] = (() => {
  const rnd = seeded(7)
  const out: [number, number, number][] = []
  for (let tries = 0; out.length < 40 && tries < 900; tries++) {
    const lon = -180 + rnd() * 360
    const lat = -56 + rnd() * 114
    const len = 5 + rnd() * 6
    if ([-0.4, 0, 0.5, 1, 1.4].some((f) => isLand(lon + (len * f) / Math.max(0.3, Math.cos(lat * DEG)), lat) || isLand(lon, lat + 5) || isLand(lon, lat - 5))) continue
    if (out.some(([o, a]) => Math.abs(a - lat) < 7 && Math.abs(wrapAngle((o - lon) * DEG)) * TO_DEG < 24)) continue
    out.push([lon, lat, len])
  }
  return out
})()

/** Clouds over the globe: [lon, lat, size (of the radius), drift (degrees a second)]. */
const CLOUDS: [number, number, number, number][] = [
  [-150, 34, 0.26, 1.1],
  [-38, 40, 0.2, 0.8],
  [-18, -26, 0.24, 1.3],
  [72, -24, 0.22, 0.9],
  [158, 18, 0.25, 1.2],
  [-112, -34, 0.19, 0.7],
  [20, 60, 0.17, 1],
]

/** A flat-bottomed cloud of round puffs, `w` wide, centered on x, y (the shell's Cloud, drawn on a canvas). */
function cloud(g: CanvasRenderingContext2D, x: number, y: number, w: number) {
  const u = w / 220
  g.beginPath()
  g.ellipse(x, y + 26 * u, 100 * u, 22 * u, 0, 0, Math.PI * 2)
  g.moveTo(x - 20 * u, y + 12 * u)
  g.arc(x - 52 * u, y + 12 * u, 32 * u, 0, Math.PI * 2)
  g.moveTo(x + 42 * u, y - 6 * u)
  g.arc(x - 2 * u, y - 6 * u, 44 * u, 0, Math.PI * 2)
  g.moveTo(x + 84 * u, y + 10 * u)
  g.arc(x + 50 * u, y + 10 * u, 34 * u, 0, Math.PI * 2)
  g.fill()
}

/** A pin's stalk: from its spot on the ground (sx, sy) to the pin (mx, my), all in the globe's pixels from its center. */
export interface Stalk {
  sx: number
  sy: number
  mx: number
  my: number
  /** How far it faces her: 1 in the middle of the globe, 0 at its edge. */
  z: number
  /** The pin's radius, for its shadow on the ground. */
  r: number
  /** 0..1: growing in as the pin comes up over the edge. */
  show: number
}

const SHADE = '75, 58, 140' // the app's cool shadow (#4b3a8c)

function stalks(g: CanvasRenderingContext2D, list: Stalk[], R: number) {
  g.lineCap = 'round'
  g.strokeStyle = '#fff'
  g.lineWidth = Math.max(3, R * 0.014)
  for (const s of list) {
    // A pin just coming up is too small to need one.
    if (s.show < 0.5) continue
    g.globalAlpha = s.show * 2 - 1
    g.beginPath()
    g.moveTo(s.sx, s.sy)
    g.lineTo(s.mx, s.my)
    g.stroke()
  }
  g.globalAlpha = 1
}

/**
 * Paints the globe with its center at the origin of `g` (translate first) and radius R: a glow, the sea, the land,
 * clouds, the shade on the far side, and the pins' stalks and ground shadows. `time` is seconds, for the clouds.
 */
export function paintGlobe(g: CanvasRenderingContext2D, R: number, view: View, time: number, pins: Stalk[]) {
  const t = turnOf(view)
  const full = Math.PI * 2

  // A soft glow, so it sits in the sky instead of on it.
  const glow = g.createRadialGradient(0, 0, R * 0.92, 0, 0, R * 1.2)
  glow.addColorStop(0, 'rgba(255, 255, 255, 0.6)')
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)')
  g.fillStyle = glow
  g.beginPath()
  g.arc(0, 0, R * 1.2, 0, full)
  g.fill()

  // The sea: a little lighter where the sun is (top left), deeper away from it. Gentle: a painted ball, not a glass one.
  const sea = g.createRadialGradient(-R * 0.42, -R * 0.48, R * 0.08, -R * 0.1, -R * 0.1, R * 1.25)
  sea.addColorStop(0, '#98def7')
  sea.addColorStop(0.5, '#7fd3f5')
  sea.addColorStop(1, '#58aeee')
  g.fillStyle = sea
  g.beginPath()
  g.arc(0, 0, R, 0, full)
  g.fill()

  g.save()
  g.beginPath()
  g.arc(0, 0, R, 0, full)
  g.clip()

  // Streaks on the water.
  g.lineCap = 'round'
  g.strokeStyle = '#fff'
  g.lineWidth = Math.max(2, R * 0.011)
  for (const [lon, lat, len] of STREAKS) {
    const stretch = len / Math.max(0.3, Math.cos(lat * DEG))
    const [x0, y0, z0] = project(lon, lat, t)
    const [x1, y1, z1] = project(lon + stretch / 2, lat, t)
    const [x2, y2, z2] = project(lon + stretch, lat, t)
    const z = Math.min(z0, z1, z2)
    if (z < 0.12) continue
    g.globalAlpha = Math.min(0.38, (z - 0.12) * 1.2)
    g.beginPath()
    g.moveTo(x0 * R, -y0 * R)
    g.quadraticCurveTo(x1 * R * 2 - (x0 + x2) * R * 0.5, -(y1 * R * 2 - (y0 + y2) * R * 0.5), x2 * R, -y2 * R)
    g.stroke()
  }
  g.globalAlpha = 1

  // The land: each shape's lip of shade first (down and right, away from the light), then every shape's color.
  const antipode: Pt = [wrapLon(view.lon + 180), -view.lat]
  const paths = SHAPES.map((s) => landPath(s, t, R, !s.polar && inside(s, antipode[0], antipode[1])))
  const lip = Math.max(2, R * 0.014)
  g.translate(lip * 0.7, lip)
  SHAPES.forEach((s, i) => {
    if (!paths[i]) return
    g.fillStyle = LAND_SHADE[s.color]
    g.fill(paths[i])
  })
  g.translate(-lip * 0.7, -lip)
  SHAPES.forEach((s, i) => {
    if (!paths[i]) return
    g.fillStyle = LAND_COLORS[s.color]
    g.fill(paths[i])
  })

  // Where each pin floats, a soft shadow on the ground under it.
  for (const s of pins) {
    if (s.z <= 0.05) continue
    g.fillStyle = `rgba(${SHADE}, ${0.2 * Math.min(1, s.z * 2)})`
    g.beginPath()
    g.ellipse(s.sx + s.r * 0.1, s.sy + s.r * 0.16, s.r * 0.82, s.r * 0.82 * (0.45 + 0.55 * s.z), 0, 0, full)
    g.fill()
  }

  // Clouds, each with its shadow on the world below.
  for (const [lon, lat, size, drift] of CLOUDS) {
    const [x, y, z] = project(lon + time * drift, lat, t)
    if (z < 0.1) continue
    const w = R * size * (0.55 + 0.45 * z)
    const fade = Math.min(1, (z - 0.1) * 3)
    g.fillStyle = `rgba(${SHADE}, ${0.14 * fade})`
    cloud(g, x * R + w * 0.07, -y * R + w * 0.16, w)
    g.fillStyle = `rgba(232, 221, 255, ${fade})`
    cloud(g, x * R * 1.04, -y * R * 1.04 + w * 0.04, w)
    g.fillStyle = `rgba(255, 255, 255, ${fade})`
    cloud(g, x * R * 1.04, -y * R * 1.04, w)
  }

  // The ball's own light and shade: a soft falloff and one clean crescent of shade. Matte: no shine spot (the user
  // found it too shiny, 2026-11-24).
  const round = g.createRadialGradient(-R * 0.38, -R * 0.44, R * 0.05, 0, 0, R)
  round.addColorStop(0, 'rgba(255, 255, 255, 0.1)')
  round.addColorStop(0.4, 'rgba(255, 255, 255, 0)')
  round.addColorStop(0.72, `rgba(${SHADE}, 0)`)
  round.addColorStop(1, `rgba(${SHADE}, 0.3)`)
  g.fillStyle = round
  g.fillRect(-R, -R, R * 2, R * 2)
  g.fillStyle = `rgba(${SHADE}, 0.09)`
  g.beginPath()
  g.arc(0, 0, R, 0, full)
  g.arc(-R * 0.17, -R * 0.2, R * 1.03, 0, full, true)
  g.fill('evenodd')
  g.restore()

  // A soft rim.
  g.strokeStyle = 'rgba(255, 255, 255, 0.35)'
  g.lineWidth = Math.max(2, R * 0.012)
  g.beginPath()
  g.arc(0, 0, R - g.lineWidth / 2, 0, full)
  g.stroke()

  stalks(g, pins, R)
}

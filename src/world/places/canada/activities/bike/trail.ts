// Mountain Bike's one course down Mont-Sainte-Anne, as data in meters (the build, the ride, the camera and the trees all
// read it). The trail is a curve on the ground: `s` is how far along it (m, from the summit station's door), `lat` is
// across it (+ = to her right as she rides down). It heads down the mountain toward -z, winding left and right.
//
//   START..0          out of the gondola's top station
//   0..GREEN_END      the green trail: wide, gentle bends, a few little rollers at the end
//   ..BERMS_END       berms and bumps: tighter banked turns; the trail splits round an island of trees into the green
//                     way (left: smooth, gently banked) and the blue way (right: steep berms, roots, rock hops, doubles)
//   ..CREEK_END       the creek (a wooden bridge on the left, a splash through on the right) and the jump (a wooden
//                     kicker on the right, a way round on the left)
//   ..END             the meadow at the bottom, by the waterfall's pool
//
// Plain numbers, no three.js.

export const START = -14
export const GREEN_END = 260
export const SPLIT = { from: 288, to: 522, half: 2.6 }
export const BERMS_END = 560
export const CREEK = { at: 628, w: 4.2, dip: 1.7, wide: 9 }
/** The bridge's deck runs this far either side of the creek (m along). */
export const BRIDGE_HALF = 8.5
export const JUMP = { s: 722, len: 6.5, h: 1.35 }
export const CREEK_END = 820
export const END = 884
/** The waterfall's rock face, across the end of the meadow. */
export const FALLS = 912
export const H0 = 124
/** How far past the trail's edge she can ride along the shoulder (m). */
export const SHOULDER = 1.6
/** The trail's own ground reaches this far past its edge; the mountain takes over beyond. */
export const RIB = 4
/** The gondola's top station (its middle, beside the trail's start), the moose's pond, and the waterfall's pool. */
export const STATION = { s: -27, lat: 7, w: 26, d: 12, h: 7 }
export const POND = { s: 100, lat: 15.5, r: 5.5 }
export const POOL = { s: 900, lat: -2, r: 12 }
/** The cliff the waterfall pours over (m above the meadow). */
export const CLIFF = 11

/** The bends: where each starts (s), how long it takes (m) and how far it turns (radians, + = toward +x). Each bend's
 *  sharpest point has a radius of len / (2 |turn|). */
const TURNS: [number, number, number][] = [
  [12, 44, 0.38],
  [64, 54, -0.74],
  [130, 52, 0.62],
  [194, 46, -0.36],
  // Berms: tighter (radius ~17 m).
  [270, 34, 0.5],
  [318, 36, -1.02],
  [366, 36, 1.06],
  [414, 36, -1.04],
  [462, 36, 0.98],
  [512, 34, -0.5],
  // The creek and the jump: straight across the creek and onto the kicker.
  [574, 40, 0.28],
  [664, 34, -0.42],
  [772, 40, 0.16],
]

const smooth = (k: number) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k))
/** A soft bump, 1 in the middle, 0 at ±1 and beyond. */
export const bump = (k: number) => (Math.abs(k) >= 1 ? 0 : (Math.cos(Math.PI * k) + 1) / 2)
const lerp = (a: number, b: number, k: number) => a + (b - a) * k

/** Which way the trail heads at s (radians from straight down the mountain, + = toward +x). */
export function phi(s: number) {
  let a = 0
  for (const [s0, len, d] of TURNS) {
    const k = (s - s0) / len
    if (k <= 0) continue
    a += k >= 1 ? d : d * (k - Math.sin(2 * Math.PI * k) / (2 * Math.PI))
  }
  return a
}
/** How sharply it bends at s (1/m, + = turning toward +x, so the outside of the bend is -lat). */
export function curve(s: number) {
  let c = 0
  for (const [s0, len, d] of TURNS) {
    const k = (s - s0) / len
    if (k > 0 && k < 1) c += (d * (1 - Math.cos(2 * Math.PI * k))) / len
  }
  return c
}

/** How steep the trail is (m down per m along): gentle on the green, steepest through the berms, flat at the bottom. */
function slope(s: number) {
  if (s < 0) return 0
  const blend = (a: number, b: number, at: number, w: number) => lerp(a, b, smooth((s - at + w / 2) / w))
  let k = blend(0, 0.11, 8, 16)
  k = blend(k, 0.165, GREEN_END + 6, 24)
  k = blend(k, 0.14, BERMS_END, 24)
  k = blend(k, 0.03, CREEK_END + 10, 36)
  return blend(k, 0, END - 6, 14)
}

const STEP = 0.5
const FROM = START - 30
const TO = FALLS + 60

/** The trail's middle line, sampled every half meter: x, z, heading, height. */
export class Trail {
  readonly n: number
  readonly x: Float32Array
  readonly z: Float32Array
  readonly h: Float32Array
  readonly a: Float32Array
  /** Sample indices by 10 m of z, to find the nearest bit of trail quickly. */
  private buckets = new Map<number, number[]>()

  constructor() {
    this.n = Math.round((TO - FROM) / STEP) + 1
    this.x = new Float32Array(this.n)
    this.z = new Float32Array(this.n)
    this.h = new Float32Array(this.n)
    this.a = new Float32Array(this.n)
    let x = 0
    let z = 0
    let h = H0
    // Integrate from s = 0 outward both ways (so s = 0 sits at the origin).
    const i0 = Math.round(-FROM / STEP)
    for (let i = i0; i < this.n; i++) {
      const s = FROM + i * STEP
      const a = phi(s)
      this.x[i] = x
      this.z[i] = z
      this.h[i] = h
      this.a[i] = a
      const am = phi(s + STEP / 2)
      x += Math.sin(am) * STEP
      z -= Math.cos(am) * STEP
      h -= slope(s + STEP / 2) * STEP
    }
    x = 0
    z = 0
    for (let i = i0 - 1; i >= 0; i--) {
      const s = FROM + i * STEP
      x -= Math.sin(phi(s + STEP / 2)) * STEP
      z += Math.cos(phi(s + STEP / 2)) * STEP
      this.x[i] = x
      this.z[i] = z
      this.h[i] = H0
      this.a[i] = phi(s)
    }
    for (let i = 0; i < this.n; i++) {
      const b = Math.floor(this.z[i] / 10)
      for (const k of [b - 1, b, b + 1]) {
        let list = this.buckets.get(k)
        if (!list) this.buckets.set(k, (list = []))
        list.push(i)
      }
    }
  }

  private at(s: number) {
    const f = Math.min(this.n - 1.001, Math.max(0, (s - FROM) / STEP))
    const i = Math.floor(f)
    return { i, k: f - i }
  }

  /** The trail's height (no bumps or banking) at s. */
  base(s: number) {
    const { i, k } = this.at(s)
    return lerp(this.h[i], this.h[i + 1], k)
  }
  heading(s: number) {
    return phi(s)
  }
  /** A spot on the ground plane: s along, lat across. */
  spot(s: number, lat: number, out = { x: 0, z: 0 }) {
    const { i, k } = this.at(s)
    const a = phi(s)
    out.x = lerp(this.x[i], this.x[i + 1], k) + Math.cos(a) * lat
    out.z = lerp(this.z[i], this.z[i + 1], k) + Math.sin(a) * lat
    return out
  }
  /** The middle line's x where it crosses z (it always heads down the mountain, so there's one). */
  xAtZ(z: number) {
    return this.sAtZ(z).x
  }
  /** Where along the trail it crosses z (clamped to the ends), and its x there. */
  sAtZ(z: number) {
    if (z >= this.z[0]) return { s: FROM, x: this.x[0] }
    if (z <= this.z[this.n - 1]) return { s: TO, x: this.x[this.n - 1] }
    let lo = 0
    let hi = this.n - 1
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (this.z[mid] > z) lo = mid
      else hi = mid
    }
    const k = (this.z[lo] - z) / (this.z[lo] - this.z[hi])
    return { s: FROM + (lo + k) * STEP, x: lerp(this.x[lo], this.x[hi], k) }
  }

  /** The nearest bit of trail to a point: s along, lat across (signed), from a nearby sample (`hint`, an s) if known. */
  locate(x: number, z: number, hint?: number) {
    let best = -1
    let bd = Infinity
    const consider = (i: number) => {
      const d = (this.x[i] - x) ** 2 + (this.z[i] - z) ** 2
      if (d < bd) {
        bd = d
        best = i
      }
    }
    if (hint !== undefined) {
      const c = this.at(hint).i
      for (let i = Math.max(0, c - 60); i <= Math.min(this.n - 1, c + 60); i++) consider(i)
    } else for (const i of this.buckets.get(Math.floor(z / 10)) ?? []) consider(i)
    if (best < 0) {
      // Off the end: the nearer end.
      best = z > this.z[0] ? 0 : this.n - 1
    }
    // Onto the segment either side of the nearest sample.
    const i = Math.min(this.n - 2, best)
    const a = phi(FROM + i * STEP)
    const tx = Math.sin(a)
    const tz = -Math.cos(a)
    const dx = x - this.x[i]
    const dz = z - this.z[i]
    const along = dx * tx + dz * tz
    return { s: FROM + i * STEP + along, lat: dx * Math.cos(a) + dz * Math.sin(a) }
  }
}

// ---------------------------------------------------------------- the trail's shape across

/** How wide the island of trees between the two ways is here (half, m; 0 where there's none). Its nose and tail taper. */
export function island(s: number) {
  const k = (s - SPLIT.from) / (SPLIT.to - SPLIT.from)
  if (k <= 0 || k >= 1) return 0
  return SPLIT.half * smooth(Math.min(k * 7, (1 - k) * 8))
}

/** Half the width of the rideable trail (m). Through the split each way is 3 m wide. */
export function half(s: number) {
  if (s < 0) return 2.4 + 1 * smooth((s - START) / 14)
  if (s < GREEN_END) return 3.4 - 0.4 * smooth((s - GREEN_END + 20) / 20)
  if (s < CREEK_END) return 3 + island(s)
  return 3 + 4.5 * smooth((s - CREEK_END) / (END - CREEK_END))
}

/** Where she settles when nobody steers: the middle, or the middle of whichever way she's on. */
export function lane(s: number, lat: number) {
  const r = island(s)
  if (!r) return 0
  return Math.sign(lat || 1) * (r + (half(s) - r) / 2)
}

/** Which way she's on through the split. */
export const way = (s: number, lat: number): 'green' | 'blue' | null => (island(s) > 0 ? (lat < 0 ? 'green' : 'blue') : null)

/** Bumps across the whole trail (the green's rollers): s, half length, height. */
export const ROLLERS: [number, number, number][] = [
  [214, 4, 0.32],
  [228, 4, 0.42],
  [242, 4, 0.52],
]
/** The green way's gentle rollers. */
export const GREEN_ROLLERS: [number, number, number][] = [
  [345, 5, 0.26],
  [362, 5, 0.3],
  [436, 5, 0.3],
  [486, 5, 0.32],
]
/** The blue way: roots right across it (s), rock hops (s, length, height: up, then it stops short) and doubles. */
export const ROOTS = [334, 337.5, 341, 418, 421, 424.5, 498, 501.5]
export const ROCKS: [number, number, number][] = [
  [376, 3.2, 0.6],
  [448, 3.6, 0.75],
]
export const DOUBLES: [number, number, number][] = [
  [394, 3.2, 0.62],
  [402, 3.2, 0.62],
  [474, 3.4, 0.7],
  [483, 3.4, 0.7],
]
/** How much each way leans into the bends (× the bend's sharpness). */
const BANK = { green: 3, blue: 7.5 }

/** How far the trail leans across here (m up per m toward +lat), for a rider at lat. */
export function bank(s: number, lat: number) {
  const c = curve(s)
  const r = island(s)
  const k = s < GREEN_END ? BANK.green * 1.4 : r > 0 && lat < 0 ? BANK.green : BANK.blue
  return Math.max(-0.34, Math.min(0.34, -c * k))
}

/** The bumps on the trail here (m added). */
export function bumps(s: number, lat: number) {
  let h = 0
  for (const [rs, len, rh] of ROLLERS) h += rh * bump((s - rs) / len)
  const r = island(s)
  if (r > 0 && lat < -r) for (const [rs, len, rh] of GREEN_ROLLERS) h += rh * bump((s - rs) / len)
  if (r > 0 && lat > r) {
    const inner = smooth(Math.min((lat - r) / 0.6, (half(s) - lat + 0.6) / 0.6))
    for (const rs of ROOTS) h += 0.17 * bump((s - rs) / 0.4) * inner
    for (const [rs, len, rh] of DOUBLES) h += rh * bump((s - rs) / len)
    for (const [rs, len, rh] of ROCKS) {
      const k = (s - rs) / len
      if (k >= 0 && k < 1) h += rh * k ** 1.5 * inner
    }
  }
  // The jump: up the wooden kicker on the right, then it stops short. Off she flies.
  if (lat > 0) {
    const k = (s - JUMP.s) / JUMP.len
    if (k >= 0 && k < 1) h += JUMP.h * k ** 1.6 * smooth((lat - 0.3) / 0.7)
  }
  return h
}

/** Over the roots the bike rattles but stays down (the springs take it). */
export const rattly = (s: number) => ROOTS.some((r) => Math.abs(s - r) < 0.7)

/** True on the jump's kicker (for its wooden color). */
export const onKicker = (s: number, lat: number) => lat > 0.3 && s >= JUMP.s && s < JUMP.s + JUMP.len
/** True in the creek's water (the right half: the splash through). */
export const inCreek = (s: number) => Math.abs(s - CREEK.at) < CREEK.w / 2
/** The bridge's span on the left half. */
export const onBridgeSpan = (s: number) => Math.abs(s - CREEK.at) < BRIDGE_HALF

export class Course {
  readonly trail = new Trail()
  /** The creek's water level. */
  readonly creekY: number
  /** The meadow at the bottom, the pool's and the pond's water. */
  readonly meadowY: number
  readonly poolY: number
  readonly pondY: number
  readonly station: { x: number; z: number }
  readonly pond: { x: number; z: number }
  readonly pool: { x: number; z: number }

  constructor() {
    const t = this.trail
    this.creekY = t.base(CREEK.at) - CREEK.dip + 0.42
    this.meadowY = t.base(END)
    this.poolY = this.meadowY - 0.4
    this.pondY = this.ground(POND.s, half(POND.s) + RIB) - 0.7
    this.station = t.spot(STATION.s, STATION.lat)
    this.pond = t.spot(POND.s, POND.lat)
    this.pool = t.spot(POOL.s, POOL.lat)
  }

  /** The ground anywhere (m up): under and beside the trail its own ground, blending out into the mountain; the
   *  summit's flat top by the station, the moose's pond, the meadow, the pool and the cliff at the bottom. */
  land(x: number, z: number, hint?: number) {
    const t = this.trail
    let h = this.mountain(x, z)
    const { s, lat } = t.locate(x, z, hint)
    const a = Math.abs(lat)
    if (s > START - 8 && s < END + 4) {
      const rib = half(s) + RIB
      if (a <= rib) h = this.ground(s, lat) - 0.7
      else if (a < rib + 14) h = lerp(this.ground(s, Math.sign(lat) * rib) - 0.25, h, smooth((a - rib) / 14))
    }
    // The summit's flat top round the station.
    const ds = Math.hypot(x - this.station.x, z - this.station.z)
    if (ds < 40) h = lerp(H0 - 0.05, h, smooth((ds - 22) / 16))
    // The pond, a little hollow beside the trail.
    const dp = Math.hypot(x - this.pond.x, z - this.pond.z)
    if (dp < POND.r) h = this.pondY - 1.1 * (1 - (dp / POND.r) ** 2)
    else if (dp < POND.r + 5) h = lerp(this.pondY + 0.15, h, smooth((dp - POND.r) / 5))
    // The meadow at the bottom, the pool, and the cliff behind it.
    if (s > END - 40) {
      const dm = Math.hypot(x - this.pool.x, z - this.pool.z)
      if (dm < 44) h = lerp(this.meadowY - 0.05, h, smooth((dm - 30) / 14))
      if (dm < POOL.r) h = this.poolY - 1.5 * (1 - (dm / POOL.r) ** 2)
      else if (dm < POOL.r + 2.5) h = lerp(this.poolY + 0.1, h, (dm - POOL.r) / 2.5)
      if (s > FALLS - 3) {
        const up = CLIFF * smooth((s - FALLS + 0.5) / 4) * (1 - smooth((a - 14) / 14)) * (1 - smooth((s - FALLS - 40) / 24))
        h = Math.max(h, this.meadowY + up + 1.5 * Math.sin(lat / 3 + s / 5) * smooth((s - FALLS) / 3))
      }
    }
    return h
  }

  /** The trail's ground (m up) at s, lat: banked, bumpy, dipping into the creek; off the edge, a grassy shoulder. */
  ground(s: number, lat: number) {
    const t = this.trail
    let h = t.base(s)
    const r = island(s)
    const hw = half(s)
    // Banked round the bends, each way about its own middle.
    // (Each way's middle eases in as the island grows, so the trail doesn't step where it splits.)
    const mid = r > 0 ? Math.sign(lat || 1) * (r + (hw - r) / 2) * smooth(r / 1.2) : 0
    const edge = Math.min(Math.abs(lat), hw + 0.6) * Math.sign(lat)
    h += bank(s, lat) * (edge - mid)
    // The island between the two ways: a mossy mound.
    if (r > 0 && Math.abs(lat) < r) h += 0.55 * smooth((r - Math.abs(lat)) / 0.9) * smooth(r / 1.2)
    // The shoulders rise a little past the edge.
    const out = Math.abs(lat) - hw
    if (out > 0) h += 0.42 * smooth(out / SHOULDER) + 0.12 * Math.max(0, out - SHOULDER)
    h += bumps(s, lat)
    h -= CREEK.dip * bump((s - CREEK.at) / CREEK.wide)
    return h
  }

  /** The bridge's deck height (or NaN off it): level with the banks, a little raised. */
  deck(s: number, lat: number) {
    if (!onBridgeSpan(s) || lat > -0.15 || lat < -half(s) - 0.4) return NaN
    return this.deckY(s)
  }
  /** The deck's height along the bridge (ends included). */
  deckY(s: number) {
    const t = this.trail
    const a = t.base(CREEK.at - BRIDGE_HALF)
    const b = t.base(CREEK.at + BRIDGE_HALF)
    const k = (s - (CREEK.at - BRIDGE_HALF)) / (2 * BRIDGE_HALF)
    return lerp(a, b, k) + 0.14
  }

  /** What she rides on: the deck if she's on the bridge, else the ground. */
  ride(s: number, lat: number, onBridge: boolean) {
    const d = onBridge ? this.deck(s, lat) : NaN
    return Number.isNaN(d) ? this.ground(s, lat) : d
  }

  /** The mountain away from the trail (m up at a world point): falling toward the valley and the St. Lawrence, a
   *  gully for the creek, hills and ridges; far below, the river with its long island, and the far shore. */
  mountain(x: number, z: number) {
    const t = this.trail
    const { s, x: cxz } = t.sAtZ(z)
    const valley = 1.5
    let prof: number
    if (s <= FROM) {
      // Behind the summit: a little higher, then down the far side.
      const dz = z - t.z[0]
      prof = H0 + 5 * smooth(dz / 30) - 0.3 * Math.max(0, dz - 50)
    } else if (s >= TO) {
      const dz = t.z[t.n - 1] - z
      prof = lerp(t.h[t.n - 1], valley, smooth(dz / 160))
    } else prof = t.base(s)
    const dx = x - cxz
    // Up the mountain, it falls away to the sides too (a big round mountain).
    const fall = 1 / (1 + (dx / 420) ** 2)
    let h = valley + (prof - valley) * fall
    // The face tilts down toward +x, with ridges and hollows further out.
    h -= 0.07 * dx * smooth((prof - 4) / 30)
    const far = smooth((Math.abs(dx) - 14) / 40)
    h += far * (7 * Math.sin(x / 41 + z / 67) * Math.sin(z / 53 - x / 90) + 3 * Math.sin(x / 17 + z / 23)) * smooth((prof - 2) / 20)
    h = Math.max(h, valley * 0.5)
    // The creek's gully, straight across the trail at the creek.
    h -= this.gully(x, z).depth
    // The St. Lawrence: wide and low, with its long island, then the far shore rising to the hills.
    const zr = this.riverZ
    const across = z - zr
    h = lerp(h, -4, smooth((95 - Math.abs(across)) / 30))
    h = Math.max(h, 2.5 * bump((across + 8) / 34) * bump((x - 150) / 520) - 0.2 + 6 * bump((across + 8) / 26) * bump((x - 150) / 380))
    if (across < -110) h = Math.max(h, valley + 0.06 * (-110 - across) + 6 * Math.sin(x / 90) * smooth((-140 - across) / 200))
    return h
  }

  /** Where the river runs (z). */
  get riverZ() {
    return this.trail.z[this.trail.n - 1] - 330
  }

  /** The ground far from the trail (no trail, pond or meadow to think about). */
  landFar(x: number, z: number) {
    return this.mountain(x, z)
  }

  /** On the waterfall's rock face (for its rocky color). */
  cliffAt(x: number, z: number) {
    const { s, lat } = this.trail.locate(x, z)
    return s > FALLS - 1.8 && s < FALLS + 2.4 && Math.abs(lat) < 34
  }

  /** How steeply the trail is banked at s (the blue way's, through the split). */
  bankAt(s: number) {
    return bank(s, 1)
  }

  /** The creek's line across the mountain: straight across the trail where it crosses, wiggling further out. */
  creekLine() {
    const t = this.trail
    const p = t.spot(CREEK.at, 0)
    const a = phi(CREEK.at)
    return { x: p.x, z: p.z, nx: Math.cos(a), nz: Math.sin(a), tx: Math.sin(a), tz: -Math.cos(a) }
  }
  /** How deep the creek's gully is at a world point (and how far along the creek it is). */
  gully(x: number, z: number) {
    const c = this.creekLine()
    const along = (x - c.x) * c.nx + (z - c.z) * c.nz
    const wig = 5 * Math.sin(along / 19) * smooth((Math.abs(along) - 10) / 20)
    const off = (x - c.x) * c.tx + (z - c.z) * c.tz - wig
    return { depth: (CREEK.dip + 0.6 * smooth(Math.abs(along) / 40)) * bump(off / (CREEK.wide + 2)) * (1 - smooth((Math.abs(along) - 120) / 40)), along, off }
  }
}

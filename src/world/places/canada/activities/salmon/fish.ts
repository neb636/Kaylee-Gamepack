// The flick for Salmon Leap: her finger grabs a salmon in its pool and flicks it, and it flies with her finger's speed
// in an arc, splashes into whichever pool it comes down in, and wiggles. A little flick hops a little; a big flick
// flies (over the whole falls, into Maple's lap). On the way it can bonk the rock face under a lip (and slide back
// down), bounce off a rock, boing off the springy log, or boop a bear's nose. A quiet aim help bends a flick that's
// roughly up the river toward a clean landing in the next pool up (or the pool it was going to reach anyway), and it
// helps a little more after each miss. How the flick feels is knobs (?feel=1). Plain TypeScript.
import { knobs } from '../../../../kit/knobs'
import { poolAt, lip, type Pt, type River } from './stage'

const FILE = 'src/world/places/canada/activities/salmon/fish.ts'
/** Distances are stage units (the wide stage is 1600 x 1000; on an iPad a unit is about 0.7 px). */
export const FLICK = knobs('salmonFlick', 'The flick', FILE, {
  power: { value: 0.65, min: 0.1, max: 1.5, step: 0.01, label: 'Power', note: 'how much of her finger’s speed the salmon flies with' },
  max: { value: 2600, min: 600, max: 4000, step: 50, label: 'Top speed', unit: 'u/s', note: 'the fastest a flick can send one (higher = easier to fly over the whole falls)' },
  hop: { value: 560, min: 200, max: 1200, step: 10, label: 'A tap hops', unit: 'u/s', note: 'a tap (no flick) makes it hop straight up this fast' },
  leash: { value: 60, min: 10, max: 200, step: 5, label: 'Lift out', unit: 'u', note: 'how far above the water her finger lifts it before it flies off on its own' },
  grab: { value: 120, min: 50, max: 260, step: 5, label: 'Grab reach', unit: 'u', note: 'how near a salmon her finger has to land to grab it' },
  gravity: { value: 2600, min: 800, max: 6000, step: 50, label: 'Gravity', unit: 'u/s²', note: 'lower = slow, floaty arcs; higher = quick, snappy hops' },
  help: { value: 0.55, min: 0, max: 1, step: 0.05, label: 'Aim help', note: 'how much a flick up the river is bent toward a clean landing (0 = exactly her flick)' },
  miss: { value: 0.2, min: 0, max: 0.5, step: 0.05, label: 'More help per miss', note: 'added to the aim help after each flick that doesn’t get up (back to normal after one that does)' },
  swim: { value: 90, min: 20, max: 300, step: 5, label: 'Swim speed', unit: 'u/s', note: 'how fast they swim about in a pool' },
})
export const BOUNCE = knobs('salmonBounce', 'Rocks, the log and the bears', FILE, {
  rock: { value: 1, min: 0, max: 1, step: 0.05, label: 'Rock aim', note: '1 = a rock throws them in a clean arc into the next pool up (a stepping stone); 0 = a plain bounce' },
  log: { value: 1.15, min: 0.5, max: 1.8, step: 0.05, label: 'Log spring', note: 'the springy log: above 1 it throws them higher than they came' },
  boop: { value: 620, min: 200, max: 1400, step: 10, label: 'Nose boop', unit: 'u/s', note: 'how high a bear’s nose bounces a salmon (up and over the bear)' },
  boops: { value: 2, min: 1, max: 6, step: 1, label: 'Boops till berries', note: 'how many boops on the nose before a bear gives up and goes to eat berries' },
})

/** The salmon's half length and body radius (for hitting things). */
export const FISH_R = 26

export type Mode = 'arrive' | 'swim' | 'held' | 'air' | 'dart' | 'lap' | 'home'
export interface Fish {
  id: number
  pool: number
  x: number
  y: number
  vx: number
  vy: number
  mode: Mode
  dir: 1 | -1
  /** Seconds in this mode. */
  t: number
  /** The tail's wiggle phase. */
  wig: number
  /** When it last did a happy wiggle (world time). */
  happy: number
  /** The pool it was flicked from (to tell a leap up from a slip down). */
  from: number
  /** Swimming: where it heads next. */
  goal: number
  /** A bear it just booped (so it doesn't boop twice in a row), and until when. */
  booped: number
  boopUntil: number
}

export function newFish(id: number, pool: number, x: number, y: number, mode: Mode = 'swim'): Fish {
  return { id, pool, x, y, vx: 0, vy: 0, mode, dir: 1, t: 0, wig: Math.random() * 6, happy: -9, from: pool, goal: x, booped: -1, boopUntil: 0 }
}

/** Something a flying salmon can hit, other than the river's own rocks and logs (a bear's nose). */
export interface Bumper {
  id: number
  x: number
  y: number
  r: number
}
export interface AirEvents {
  /** It hit the rock face under lip i and slides back down. */
  bonk: (f: Fish, lip: number) => void
  rock: (f: Fish) => void
  log: (f: Fish) => void
  boop: (f: Fish, bumper: number) => void
  /** It came down in a pool. */
  land: (f: Fish, pool: number) => void
  /** Over the whole falls: it flies into Maple's lap. */
  lap: (f: Fish) => void
}

/** One step of a flying salmon. `x0`/`x1` are the screen's edges (it bounces off the left one). */
export function stepAir(f: Fish, r: River, dt: number, now: number, bumpers: Bumper[], lapAt: Pt, x0: number, ev: AirEvents) {
  const px = f.x
  f.vy += FLICK.gravity * dt
  f.x += f.vx * dt
  f.y += f.vy * dt
  // The rock face under each lip: going right into it below its top, it bonks.
  for (let i = 0; i < r.pools.length - 1; i++) {
    const l = lip(r, i)
    if (px + FISH_R <= l.x && f.x + FISH_R > l.x && f.y > l.top) {
      f.x = l.x - FISH_R
      f.vx = -Math.abs(f.vx) * 0.35
      f.vy = Math.max(f.vy, 0)
      ev.bonk(f, i)
      break
    }
  }
  if (f.x < x0 + FISH_R && f.vx < 0) f.vx = Math.abs(f.vx) * 0.5
  for (const k of r.rocks) {
    const dx = f.x - k.x
    const dy = f.y - k.y
    const d = Math.hypot(dx, dy)
    // (Not in the first moment of a leap, so one flicked from beside a rock isn't stopped by it.)
    if (f.t > 0.1 && d < k.r + FISH_R * 0.7 && dx * f.vx + dy * f.vy < 0) {
      // A stepping stone: it throws them up into the next pool (blended with a plain bounce).
      f.x = k.x + (dx / d) * (k.r + FISH_R * 0.7)
      f.y = k.y + (dy / d) * (k.r + FISH_R * 0.7)
      bounce(f, dx / d, dy / d, 0.6)
      f.vy = Math.min(f.vy, -400)
      const [ix, iy] = launchTo(r, f.x, f.y, Math.min(r.pools.length - 1, poolAt(r, k.x) + 1), lapAt)
      f.vx += (ix - f.vx) * BOUNCE.rock
      f.vy += (iy - f.vy) * BOUNCE.rock
      ev.rock(f)
    }
  }
  for (const g of r.logs) {
    const [ax, ay] = g.a
    const [bx, by] = g.b
    const lx = bx - ax
    const ly = by - ay
    const len = Math.hypot(lx, ly)
    const t = Math.max(0, Math.min(1, ((f.x - ax) * lx + (f.y - ay) * ly) / (len * len)))
    const cx = ax + lx * t
    const cy = ay + ly * t
    // The log's upper side faces up and to the left.
    let nx = ly / len
    let ny = -lx / len
    if (ny > 0) {
      nx = -nx
      ny = -ny
    }
    const d = (f.x - cx) * nx + (f.y - cy) * ny
    if (Math.abs(d) < FISH_R * 0.8 && Math.hypot(f.x - cx, f.y - cy) < FISH_R * 1.2 && f.vx * nx + f.vy * ny < 0 && t > 0 && t < 1) {
      bounce(f, nx, ny, BOUNCE.log)
      // Springy: up the falls it goes.
      f.vx = Math.max(f.vx, 260)
      f.vy = Math.min(f.vy, -700)
      f.x = cx + nx * FISH_R
      f.y = cy + ny * FISH_R
      ev.log(f)
    }
  }
  for (const b of bumpers) {
    if (b.id === f.booped && now < f.boopUntil) continue
    const d = Math.hypot(f.x - b.x, f.y - b.y)
    if (d < b.r + FISH_R * 0.7) {
      // Boop: up and over the bear.
      f.vy = -Math.max(BOUNCE.boop, Math.abs(f.vy) * 0.8)
      f.vx = Math.max(220, Math.abs(f.vx) * 0.6)
      f.booped = b.id
      f.boopUntil = now + 0.6
      ev.boop(f, b.id)
    }
  }
  const top = r.pools[r.pools.length - 1]
  if (f.x > lapAt[0] - 70 && f.y < top.y - 20) return ev.lap(f)
  const i = poolAt(r, f.x)
  const p = r.pools[i]
  // Coming down at or under a pool's surface lands in it (even one it came down beside, under a lip's edge).
  if (f.vy > 0 && f.y >= p.y) ev.land(f, i)
}

function bounce(f: Fish, nx: number, ny: number, k: number) {
  const dot = f.vx * nx + f.vy * ny
  f.vx = (f.vx - 2 * dot * nx) * k
  f.vy = (f.vy - 2 * dot * ny) * k
}

/** Where a salmon flicked from (x, y) with this speed comes down, ignoring rocks, logs and bears (-1: Maple's lap). */
export function landing(r: River, x: number, y: number, vx: number, vy: number, lapAt: Pt) {
  const f = newFish(-1, 0, x, y, 'air')
  f.vx = vx
  f.vy = vy
  let out = poolAt(r, x)
  let done = false
  const ev: AirEvents = {
    bonk: () => {},
    rock: () => {},
    log: () => {},
    boop: () => {},
    land: (_f, p) => {
      out = p
      done = true
    },
    lap: () => {
      out = -1
      done = true
    },
  }
  for (let t = 0; t < 4 && !done; t += 1 / 120) stepAir(f, { ...r, rocks: [], logs: [] }, 1 / 120, 0, [], lapAt, -1e9, ev)
  return out
}

/** A clean launch from (x, y) into pool p: up over the lips, coming down a little way into it. */
export function launchTo(r: River, x: number, y: number, p: number, lapAt: Pt): Pt {
  const g = FLICK.gravity
  const pool = r.pools[p]
  // The middle of the pool if it can (a nice landing), else just past its lip (a steep leap, from right under a face).
  const far = p === r.pools.length - 1 ? Math.min(pool.x0 + 200, lapAt[0] - 200) : (Math.max(pool.x0, x + 80) + pool.x1) / 2
  let best: Pt = [0, -FLICK.hop]
  for (const tx of [far, Math.max(pool.x0 + 70, x + 40)])
    for (let clear = 110; clear < 500; clear += 60) {
      const apex = Math.min(y, pool.y) - clear
      const vy = -Math.sqrt(2 * g * (y - apex))
      const t = -vy / g + Math.sqrt((2 * (pool.y - apex)) / g)
      const vx = (tx - x) / t
      if (best[0] === 0) best = [vx, vy]
      if (landing(r, x, y, vx, vy, lapAt) === p) return [vx, vy]
    }
  return best
}

/** Her flick, as the salmon's launch: her finger's speed times the power, capped, and (when it's roughly up the
 *  river) bent toward a clean landing. `misses` in a row make the help stronger. */
export function aim(r: River, f: Fish, fvx: number, fvy: number, misses: number, lapAt: Pt): Pt {
  let vx = fvx * FLICK.power
  let vy = fvy * FLICK.power
  const s = Math.hypot(vx, vy)
  if (s > FLICK.max) {
    vx *= FLICK.max / s
    vy *= FLICK.max / s
  }
  if (vy > -150 || vx < -250) return [vx, vy]
  const top = r.pools.length - 1
  const lands = landing(r, f.x, f.y, vx, vy, lapAt)
  if (lands === -1) return [vx, vy]
  const want = lands > f.pool ? lands : Math.min(top, f.pool + 1)
  if (want === f.pool) return [vx, vy]
  const [ix, iy] = launchTo(r, f.x, f.y, want, lapAt)
  const h = Math.min(0.9, FLICK.help + misses * FLICK.miss)
  return [vx + (ix - vx) * h, vy + (iy - vy) * h]
}

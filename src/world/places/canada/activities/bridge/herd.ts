// Follow-the-leader for Animal Bridge: her finger leads one family's mama (or the big ram), and the rest walk behind in
// a wobbly line like ducklings. The leader heads for her finger; each follower springs toward its place in the line,
// which is a point `gap` further back along the path mama walked (so they go over the bridge, not through the fence),
// blended with the plain "go after the one ahead" (which cuts corners). Nobody ever steps into the highway: a step
// that would is slid along the fence instead. How the lead and the follow feel are knobs (?feel=1). Plain TypeScript.
import { knobs } from '../../../../kit/knobs'
import { MEMBERS, onBridge, onRocks, walkable, type FamilyId, type Kind, type Pt, type StageDef } from './stage'

const FILE = 'src/world/places/canada/activities/bridge/herd.ts'
/** Distances are stage units (the wide stage is 1600 x 1000; on an iPad a unit is about 0.7 px). */
export const LEAD = knobs('bridgeLead', 'The lead (mama after her finger)', FILE, {
  speed: { value: 560, min: 100, max: 1600, step: 10, label: 'Top speed', unit: 'u/s', note: 'how fast mama walks after her finger' },
  tight: { value: 6, min: 1, max: 30, step: 0.5, label: 'Keeps up', unit: '/s', note: 'how quickly mama closes the gap to her finger (lower = she ambles and lags; higher = she sticks to it)' },
  ease: { value: 10, min: 1, max: 40, step: 0.5, label: 'Turns and starts', unit: '/s', note: 'how quickly mama changes speed and direction (lower = heavy, swings wide)' },
  lift: { value: 40, min: 0, max: 160, step: 5, label: 'Mama above finger', unit: 'u', note: 'how far above her fingertip mama walks, so the finger doesn’t hide her' },
  grab: { value: 130, min: 40, max: 300, step: 5, label: 'Grab reach', unit: 'u', note: 'how near an animal her finger has to land to lead that family (anywhere else leads the family she led last)' },
  fence: { value: 0.45, min: 0.1, max: 2, step: 0.05, label: 'Head shake after', unit: 's', note: 'how long mama pushes at the fence before she looks at her and shakes her head' },
  rocks: { value: 0.55, min: 0.2, max: 1.5, step: 0.05, label: 'On the rocks', note: 'speed on the boulders for the elk and the bears (the sheep get 1.2: they love it)' },
})
export const FOLLOW = knobs('bridgeFollow', 'The line behind mama', FILE, {
  gap: { value: 92, min: 40, max: 200, step: 2, label: 'Gap', unit: 'u', note: 'how far apart they walk in the line' },
  pull: { value: 6, min: 1, max: 30, step: 0.5, label: 'Spring', unit: '/s', note: 'how hard each one is pulled to its place in the line (higher = a tight, stiff line)' },
  wobble: { value: 0.5, min: 0.1, max: 1.6, step: 0.05, label: 'Damping', note: 'below 1 they overshoot and wobble like ducklings; 1 and up they settle without wobbling' },
  path: { value: 0.85, min: 0, max: 1, step: 0.05, label: 'Walk mama’s path', note: '1 = each walks exactly where mama walked; 0 = heads straight for the one ahead (cuts corners, bumps the fence)' },
  sway: { value: 14, min: 0, max: 50, step: 1, label: 'Sway', unit: 'u', note: 'how much the line wanders side to side while walking' },
  max: { value: 950, min: 200, max: 2400, step: 25, label: 'Catch-up speed', unit: 'u/s' },
})

export interface Member {
  fam: FamilyId
  i: number
  kind: Kind
  x: number
  y: number
  vx: number
  vy: number
  dir: 1 | -1
  /** Distance walked (for the legs). */
  walk: number
  speed: number
  /** 0..1, eased: how much it's on the boulders (the sheep hop up them). */
  rocky: number
  /** Out of the line (the calf that stopped to sniff a flower): it stands, or walks after her finger by itself. */
  lost: boolean
  lostTo: Pt | null
}
export interface Family {
  id: FamilyId
  m: Member[]
  /** Where mama has walked, oldest first (her place now comes after it). */
  trail: Pt[]
  /** Where her finger leads mama (null: stand). */
  target: Pt | null
  /** A slower walk to a spot by itself (the gathering in the meadow). */
  auto: boolean
  /** Seconds mama has been pushing into something she won't cross. */
  push: number
  /** What stopped her last: the fence, or (the shy bears) the bare bridge. */
  block: 'fence' | 'bare' | null
  /** Mama stands still until then (shaking her head, the rams' bonk). */
  hold: number
  /** The bears won't step on the bridge while this is set. */
  shy: boolean
}

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)

export class Herd {
  fams = {} as Record<FamilyId, Family>
  /** On-screen limits (the view box), so nobody walks off the edge. */
  x0 = 0
  x1 = 1600
  constructor(
    public st: StageDef,
    spots: Record<FamilyId, Pt[]>,
  ) {
    for (const id of Object.keys(MEMBERS) as FamilyId[]) {
      const at = spots[id]
      const m = MEMBERS[id].map((kind, i): Member => ({ fam: id, i, kind, x: at[i][0], y: at[i][1], vx: 0, vy: 0, dir: at[0][0] >= at[Math.min(1, at.length - 1)][0] ? 1 : -1, walk: i * 37, speed: 0, rocky: 0, lost: false, lostTo: null }))
      // The line they're standing in counts as the path mama walked.
      this.fams[id] = { id, m, trail: at.slice(1).reverse().map(([x, y]) => [x, y] as Pt), target: null, auto: false, push: 0, block: null, hold: 0, shy: false }
    }
  }

  all() {
    return Object.values(this.fams).flatMap((f) => f.m)
  }

  private ok(f: Family, x: number, y: number) {
    if (!walkable(this.st, x, y, this.x0, this.x1)) return false
    return !(f.shy && onBridge(this.st, x, y, 90))
  }

  /** Moves an animal, sliding along the fence (or the bridge's end, for shy bears). Returns how far it went. */
  private move(f: Family, a: Member, dx: number, dy: number) {
    const x0 = a.x
    const y0 = a.y
    const free = !this.ok(f, a.x, a.y) // somehow off the ground (a link, the iPad turned): walk out freely
    const n = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 10))
    const sx = dx / n
    const sy = dy / n
    let blocked: 'fence' | 'bare' | null = null
    const why = (x: number, y: number) => (f.shy && onBridge(this.st, x, y, 90) && walkable(this.st, x, y, this.x0, this.x1) ? 'bare' : 'fence')
    for (let k = 0; k < n; k++) {
      if (free || this.ok(f, a.x + sx, a.y + sy)) {
        a.x += sx
        a.y += sy
        continue
      }
      blocked = why(a.x + sx, a.y + sy)
      if (Math.abs(sx) > 0.01 && this.ok(f, a.x + sx, a.y)) a.x += sx
      else if (Math.abs(sy) > 0.01 && this.ok(f, a.x, a.y + sy)) a.y += sy
      else break
    }
    return { moved: Math.hypot(a.x - x0, a.y - y0), blocked }
  }

  /** Where in the line follower i belongs: `d` back along mama's path from where she is. */
  pathPoint(f: Family, d: number): Pt {
    let [px, py] = [f.m[0].x, f.m[0].y]
    for (let k = f.trail.length - 1; k >= 0; k--) {
      const [qx, qy] = f.trail[k]
      const s = Math.hypot(qx - px, qy - py)
      if (s >= d) {
        const t = d / s
        return [px + (qx - px) * t, py + (qy - py) * t]
      }
      d -= s
      ;[px, py] = [qx, qy]
    }
    return [px, py]
  }

  step(dt: number, now: number) {
    for (const f of Object.values(this.fams)) this.stepFamily(f, dt, now)
  }

  private stepFamily(f: Family, dt: number, now: number) {
    const L = f.m[0]
    const sheep = f.id === 'sheep'
    // Mama: toward her finger, slowing as she gets there.
    let wx = 0
    let wy = 0
    if (f.target && now >= f.hold) {
      const dx = f.target[0] - L.x
      const dy = f.target[1] - L.y
      const d = Math.hypot(dx, dy)
      if (d > 4) {
        const rocks = L.rocky > 0.5 ? (sheep ? 1.2 : LEAD.rocks) : 1
        const v = Math.min(LEAD.speed * rocks * (f.auto ? 0.45 : 1), d * LEAD.tight)
        wx = (dx / d) * v
        wy = (dy / d) * v
      }
    }
    const e = 1 - Math.exp(-dt * LEAD.ease)
    L.vx += (wx - L.vx) * e
    L.vy += (wy - L.vy) * e
    const want = Math.hypot(L.vx, L.vy) * dt
    const r = this.move(f, L, L.vx * dt, L.vy * dt)
    this.after(L, r.moved, dt)
    // Pushing into the fence (or the bare bridge) with her finger past it.
    if (r.blocked && want > 0.5 && r.moved < want * 0.6 && Math.hypot(wx, wy) > 60) {
      f.push += dt
      f.block = r.blocked
    } else f.push = Math.max(0, f.push - dt * 2)
    if (r.moved < want * 0.6 && r.blocked) {
      // What was blocked doesn't keep pushing (so she doesn't creep along the fence forever).
      L.vx *= 0.6
      L.vy *= 0.6
    }
    // Her path.
    const last = f.trail[f.trail.length - 1]
    if (!last || Math.hypot(L.x - last[0], L.y - last[1]) > 6) f.trail.push([L.x, L.y])
    const keep = f.m.length * FOLLOW.gap * 1.4 + 300
    let len = 0
    for (let k = f.trail.length - 1; k > 0; k--) {
      len += Math.hypot(f.trail[k][0] - f.trail[k - 1][0], f.trail[k][1] - f.trail[k - 1][1])
      if (len > keep) {
        f.trail.splice(0, k - 1)
        break
      }
    }
    // The line: each one springs toward its place.
    const moving = clamp(L.speed / 160, 0, 1)
    const k = FOLLOW.pull * FOLLOW.pull
    const c = 2 * FOLLOW.wobble * FOLLOW.pull
    for (let i = 1; i < f.m.length; i++) {
      const me = f.m[i]
      if (me.lost) {
        this.stepLost(f, me, dt)
        continue
      }
      const a = f.m[i - 1]
      const [px, py] = this.pathPoint(f, i * FOLLOW.gap)
      let sx = me.x
      let sy = me.y
      const dd = Math.hypot(me.x - a.x, me.y - a.y)
      if (dd > FOLLOW.gap) {
        sx = a.x + ((me.x - a.x) / dd) * FOLLOW.gap
        sy = a.y + ((me.y - a.y) / dd) * FOLLOW.gap
      }
      let tx = sx + (px - sx) * FOLLOW.path
      let ty = sy + (py - sy) * FOLLOW.path
      if (dd > 1) {
        const sw = Math.sin(now * 2.3 + i * 1.9) * FOLLOW.sway * moving
        tx += (-(a.y - me.y) / dd) * sw
        ty += ((a.x - me.x) / dd) * sw
      }
      // A damped spring, stepped implicitly (steady at any spring and frame rate).
      const rocks = me.rocky > 0.5 ? (sheep ? 1.2 : LEAD.rocks) : 1
      me.vx = (me.vx + dt * k * (tx - me.x)) / (1 + dt * c + dt * dt * k)
      me.vy = (me.vy + dt * k * (ty - me.y)) / (1 + dt * c + dt * dt * k)
      const sp = Math.hypot(me.vx, me.vy)
      const max = FOLLOW.max * rocks
      if (sp > max) {
        me.vx *= max / sp
        me.vy *= max / sp
      }
      const rr = this.move(f, me, me.vx * dt, me.vy * dt)
      if (rr.blocked) {
        me.vx *= 0.5
        me.vy *= 0.5
      }
      this.after(me, rr.moved, dt)
    }
  }

  /** A little one out of the line walks after her finger by itself (a bit slower than mama), or stands. */
  private stepLost(f: Family, me: Member, dt: number) {
    let wx = 0
    let wy = 0
    if (me.lostTo) {
      const dx = me.lostTo[0] - me.x
      const dy = me.lostTo[1] - me.y
      const d = Math.hypot(dx, dy)
      if (d > 4) {
        const v = Math.min(LEAD.speed * 0.85, d * LEAD.tight)
        wx = (dx / d) * v
        wy = (dy / d) * v
      }
    }
    const e = 1 - Math.exp(-dt * LEAD.ease)
    me.vx += (wx - me.vx) * e
    me.vy += (wy - me.vy) * e
    const r = this.move(f, me, me.vx * dt, me.vy * dt)
    if (r.blocked) {
      me.vx *= 0.6
      me.vy *= 0.6
    }
    this.after(me, r.moved, dt)
  }

  private after(a: Member, moved: number, dt: number) {
    a.walk += moved
    a.speed += (moved / Math.max(dt, 1e-3) - a.speed) * Math.min(1, dt * 10)
    if (a.vx > 30) a.dir = 1
    else if (a.vx < -30) a.dir = -1
    a.rocky += ((onRocks(this.st, a.x, a.y) ? 1 : 0) - a.rocky) * Math.min(1, dt * 8)
  }

  /** The family whose animal is nearest (x, y), if one is within reach. */
  near(x: number, y: number, reach: number): { f: Family; a: Member } | null {
    let best: { f: Family; a: Member } | null = null
    let bd = reach
    for (const f of Object.values(this.fams))
      for (const a of f.m) {
        // Measured to the middle of its body, not its feet.
        const d = Math.hypot(a.x - x, a.y - 40 - y)
        if (d < bd) {
          bd = d
          best = { f, a }
        }
      }
    return best
  }
}

// Walking in a 3D place with more than one floor (HarborLand's playground first, any room later): the house's
// tap-to-walk and finger lead (a NavGrid per floor), plus links between the floors. A tap on another floor plans a
// route through the links (tap the top deck from the ground: walk to the net, climb it, walk on). Climbs go both ways,
// slides only down, and a slide costs little, so she takes one down whenever there is one. The world plays each link
// (`run`): the walker only says when, and which way. Agong's house keeps its own walking for now.
import type { Ray } from 'three'
import type { Avatar } from '../characters/avatar'
import type { NavGrid, XZ } from '../engine/nav'

export interface Floor {
  id: string
  /** Its height (m). */
  y: number
  nav: NavGrid
  /** Where a tap lands on it: rectangles [x0, x1, z0, z1] (the walkable top the camera sees). */
  rects: [number, number, number, number][]
  /** Extra height at a spot (a rope bridge that sags under her). */
  lift?: (x: number, z: number) => number
}

export interface Link {
  id: string
  from: string
  /** Where she starts it, on `from`. */
  at: XZ
  to: string
  /** Where she stands when it's done, on `to`. */
  end: XZ
  /** Climbs (nets, steps, the mountain) go both ways; slides only one. */
  twoWay?: boolean
  /** What it's worth in meters of walking: little for a slide (a treat), more for a climb (slow). */
  cost?: number
  /** Plays it: she stands at `at` (at `end` when `back`), and `done` once she stands at the other end. */
  run(back: boolean, done: () => void): void
}

type Step = { floor: Floor; to: XZ } | { link: Link; back: boolean }

interface Node {
  floor: string
  at: XZ
  /** How she got here: walking from node `from`, or a link. */
  via?: { from: number; link?: Link; back?: boolean }
}

export class Walker {
  floor: Floor
  /** On a link (climbing, sliding): finger leads wait, taps make new plans for after. */
  riding: Link | null = null
  /** Where the ride she's on ends (a tap during it plans from there). */
  private rideEnd: { floor: string; at: XZ } | null = null
  /** She stepped onto another floor (the sections follow it). */
  onFloor: ((f: Floor) => void) | null = null
  private steps: Step[] = []
  private then: (() => void) | null = null
  /** The last plan, for QA: each walk (`floor>x,z`) and link (`link` or `link<` backwards), or `none`. */
  plan: string[] = []
  /** Bumped by every new plan, so a step from an old one that finishes late does nothing. */
  private gen = 0

  constructor(
    private k: Avatar,
    readonly floors: Floor[],
    readonly links: Link[],
    start: string,
  ) {
    this.floor = this.get(start)
  }

  get(id: string): Floor {
    const f = this.floors.find((x) => x.id === id)
    if (!f) throw new Error(`no floor ${id}`)
    return f
  }

  /** Puts her on a floor at once (a deep link). */
  place(floor: string, x: number, z: number, face: number) {
    this.gen++
    this.steps = []
    this.riding = null
    this.rideEnd = null
    this.floor = this.get(floor)
    this.k.place(x, this.floor.y + (this.floor.lift?.(x, z) ?? 0), z, face)
  }

  /** Where a ray from the camera first lands on a floor she can walk on. */
  hit(ray: Ray): { floor: Floor; at: XZ } | null {
    let best: { floor: Floor; at: XZ } | null = null
    let bestT = Infinity
    const { origin: o, direction: d } = ray
    if (Math.abs(d.y) < 1e-6) return null
    for (const f of this.floors) {
      const t = (f.y - o.y) / d.y
      if (t <= 0 || t >= bestT) continue
      const x = o.x + d.x * t
      const z = o.z + d.z * t
      if (!f.rects.some(([x0, x1, z0, z1]) => x >= x0 && x <= x1 && z >= z0 && z <= z1)) continue
      bestT = t
      best = { floor: f, at: [x, z] }
    }
    return best
  }

  /** Walks her there, through links if it's another floor. False when there's no way (or she's mid-ride and it's a
   *  finger lead). */
  goTo(floor: string, to: XZ, then?: () => void, lead = false): boolean {
    if (this.riding && lead) return false
    const steps = this.route({ floor, at: to })
    if (!steps) {
      this.plan = ['none']
      return false
    }
    this.start(steps, then)
    return true
  }

  /** Walks her to a link and rides it (a climb from whichever end is nearer her floor). */
  ride(link: Link, then?: () => void): boolean {
    const back = link.twoWay === true && this.floor.id === link.to
    const steps = this.route({ floor: back ? link.to : link.from, at: back ? link.end : link.at })
    if (!steps) return false
    this.start([...steps, { link, back }], then)
    return true
  }

  stop() {
    this.gen++
    this.steps = []
    this.then = null
    if (!this.riding) this.k.stop()
  }

  get busy() {
    return !!this.riding || this.steps.length > 0 || this.k.walking
  }

  /** Before Kaylee's own update: on a floor she stands at its height (and sags on the rope bridge). */
  update() {
    if (this.riding) return
    const p = this.k.root.position
    p.y = this.floor.y + (this.floor.lift?.(p.x, p.z) ?? 0)
  }

  // ---------------------------------------------------------------- planning

  /** The steps from where she is to `goal`: one walk if it's her floor, otherwise the cheapest way through the links
   *  (straight-line distances: a tap must plan at once; each walk finds its real path when it starts). */
  private route(goal: { floor: string; at: XZ }): Step[] | null {
    const p = this.k.root.position
    // While riding, the plan starts where the ride ends.
    const from = this.rideEnd ?? { floor: this.floor.id, at: [p.x, p.z] as XZ }
    if (goal.floor === from.floor && this.get(from.floor).nav.path(from.at, goal.at)) return [{ floor: this.get(goal.floor), to: goal.at }]
    const nodes: Node[] = [{ floor: from.floor, at: from.at }, { floor: goal.floor, at: goal.at }]
    const ends = new Map<Link, [number, number]>()
    for (const l of this.links) {
      ends.set(l, [nodes.length, nodes.length + 1])
      nodes.push({ floor: l.from, at: l.at }, { floor: l.to, at: l.end })
    }
    const dist = nodes.map(() => Infinity)
    const done = nodes.map(() => false)
    dist[0] = 0
    for (;;) {
      let u = -1
      for (let i = 0; i < nodes.length; i++) if (!done[i] && dist[i] < Infinity && (u < 0 || dist[i] < dist[u])) u = i
      if (u < 0 || u === 1) break
      done[u] = true
      const a = nodes[u]
      const relax = (v: number, cost: number, via: Node['via']) => {
        if (dist[u] + cost < dist[v]) {
          dist[v] = dist[u] + cost
          nodes[v].via = via
        }
      }
      // Walking to anything on the same floor.
      for (let v = 0; v < nodes.length; v++) if (v !== u && !done[v] && nodes[v].floor === a.floor) relax(v, Math.hypot(nodes[v].at[0] - a.at[0], nodes[v].at[1] - a.at[1]), { from: u })
      // Riding a link from this end.
      for (const [l, [s, e]] of ends) {
        if (u === s) relax(e, l.cost ?? 2, { from: u, link: l, back: false })
        else if (u === e && l.twoWay) relax(s, l.cost ?? 2, { from: u, link: l, back: true })
      }
    }
    if (dist[1] === Infinity) return null
    const steps: Step[] = []
    for (let v = 1; v !== 0; ) {
      const via = nodes[v].via!
      if (via.link) steps.unshift({ link: via.link, back: !!via.back })
      else steps.unshift({ floor: this.get(nodes[v].floor), to: nodes[v].at })
      v = via.from
    }
    return steps
  }

  // ---------------------------------------------------------------- doing it

  private start(steps: Step[], then?: () => void) {
    this.plan = steps.map((s) => ('link' in s ? s.link.id + (s.back ? '<' : '') : `${s.floor.id}>${s.to.map((n) => n.toFixed(1)).join(',')}`))
    const gen = ++this.gen
    this.steps = steps
    this.then = then ?? null
    // Mid-ride: the new plan waits for the ride to end (next() runs then).
    if (!this.riding) this.next(gen)
  }

  private next(gen: number) {
    if (gen !== this.gen) return
    const s = this.steps.shift()
    if (!s) {
      const cb = this.then
      this.then = null
      cb?.()
      return
    }
    if ('link' in s) {
      const { link, back } = s
      this.riding = link
      this.rideEnd = back ? { floor: link.from, at: link.at } : { floor: link.to, at: link.end }
      link.run(back, () => {
        this.riding = null
        this.rideEnd = null
        const was = this.floor
        this.floor = this.get(back ? link.from : link.to)
        if (this.floor !== was) this.onFloor?.(this.floor)
        // (A tap during the ride made a new plan: it starts now.)
        this.next(this.gen)
      })
      return
    }
    const p = this.k.root.position
    const path = s.floor.nav.path([p.x, p.z], s.to)
    if (!path) {
      this.plan.push('stuck')
      this.steps = []
      return
    }
    this.k.walk(path, () => this.next(gen))
  }
}

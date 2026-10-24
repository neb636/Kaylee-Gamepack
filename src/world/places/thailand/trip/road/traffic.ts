// Who else is on the road (the road kit, plan: thailand/nan-trip.md): oncoming songthaews, scooters, tuk-tuks and the
// little car that comes round a blind bend, and the animals that share the road (a water buffalo that ambles across,
// chickens that flap off it, a monkey on the guard rail). They keep to THEIR left (her right, lat < 0), and they never
// crash into her: if she drifts onto their side, they pull onto the verge, stop and toot a tune until she's past.
// Every one of them reacts to a tap. Pure behavior plus toy models; the drive (activities/nan-trip/drive/) says when.
import { Group, MeshBasicMaterial, Vector3, Mesh } from 'three'
import type { Bag } from '../../engine/dispose'
import { blobShadow, merge, P, solid } from '../../engine/geo'
import { PAL } from '../../engine/toon'
import { buildSongthaew } from '../vehicles/songthaew'
import type { HeightField } from './build'
import type { Road } from './road'

export type MoverKind = 'songthaew' | 'scooter' | 'tuktuk' | 'car'

export interface MoverPlan {
  kind: MoverKind
  /** It sets off when she gets this far along the road (s). */
  when: number
  /** Where it sets off from (s), coming toward her. */
  from: number
  speed: number
  /** The car behind a blind bend (its round mirror shows it coming): it beeps back if she beeps first. */
  blind?: number
}

export interface TrafficPlan {
  movers: MoverPlan[]
  /** A buffalo grazing beside the road at each `s`; it ambles across as she comes. */
  buffalo: number[]
  /** A little flock of chickens pecking on the road at each `s`. */
  chickens: number[]
  /** A monkey sitting on the guard rail (s, side). */
  monkeys: { s: number; side: number }[]
}

export interface TrafficEvents {
  /** An oncoming driver toots (`tune`: a happy little tune, she's on their side). */
  toot(kind: MoverKind, tune: boolean): void
  /** The blind bend's car beeps back. */
  beepBack(): void
  moo(): void
  cluck(): void
  chatter(): void
  /** Feathers or dust at a spot. */
  puff(x: number, y: number, z: number): void
}

/** Where she is on the road (the drive's car). */
export interface Her {
  s: number
  lat: number
  speed: number
}

interface Mover {
  plan: MoverPlan
  root: Group
  body: Group
  wheels: Group[]
  lamps: MeshBasicMaterial | null
  s: number
  lat: number
  v: number
  state: 'wait' | 'go' | 'gone'
  /** Pulled onto the verge for her (and tooted). */
  yielded: boolean
  replied: boolean
  hop: number
  i: number
}

interface Buffalo {
  root: Group
  head: Group
  legs: Group[]
  s: number
  side: number
  lat: number
  state: 'graze' | 'cross' | 'done'
  hurry: number
  hop: number
  i: number
}

interface Chicken {
  root: Group
  wings: Group[]
  s: number
  lat: number
  to: number
  y: number
  vy: number
  state: 'peck' | 'flee' | 'safe'
}
interface Flock {
  s: number
  birds: Chicken[]
  fled: boolean
}

interface Monkey {
  root: Group
  arm: Group
  s: number
  side: number
  hop: number
  y: number
  vy: number
  waved: boolean
}

const LANE = 0.5
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

export class Traffic {
  readonly root = new Group()
  readonly movers: Mover[] = []
  readonly buffalo: Buffalo[] = []
  readonly flocks: Flock[] = []
  readonly monkeys: Monkey[] = []
  /** How many times something reacted to her (QA). */
  counts = { yields: 0, replies: 0, crossings: 0, flaps: 0 }

  constructor(
    private road: Road,
    private field: HeightField,
    plan: TrafficPlan,
    bag: Bag,
  ) {
    plan.movers.forEach((p, i) => this.movers.push(this.mover(p, i, bag)))
    plan.buffalo.forEach((s, i) => this.buffalo.push(this.buildBuffalo(s, i % 2 ? -1 : 1, i, bag)))
    for (const s of plan.chickens) this.flocks.push({ s, fled: false, birds: [-1.6, 0.4, 2.1].map((lat, k) => this.buildChicken(s + k * 1.3 - 1.3, lat, bag)) })
    for (const m of plan.monkeys) this.monkeys.push(this.buildMonkey(m.s, m.side, bag))
  }

  // ---------------------------------------------------------------- per frame

  update(dt: number, t: number, her: Her, ev: TrafficEvents) {
    for (const m of this.movers) this.moveMover(m, dt, t, her, ev)
    for (const b of this.buffalo) this.moveBuffalo(b, dt, t, her, ev)
    for (const f of this.flocks) this.moveFlock(f, dt, t, her, ev)
    for (const m of this.monkeys) this.moveMonkey(m, dt, t, her)
  }

  /** Meters to the nearest thing on the road ahead that she has to stop for (a buffalo crossing), or Infinity. */
  blockAhead(her: Her) {
    let best = Infinity
    for (const b of this.buffalo) {
      if (b.state !== 'cross' || Math.abs(b.lat) > this.road.half + 1.4) continue
      const gap = b.s - her.s
      if (gap > 0 && gap < best) best = gap
    }
    return best
  }

  /** Is the blind bend's car hidden behind its bend right now (the mirror shows it, and a beep gets one back)? */
  blindWarning(her: Her) {
    for (const m of this.movers)
      if (m.plan.blind !== undefined && m.state === 'go' && !m.replied && m.s > her.s + 6) return m.plan.blind
    return null
  }

  /** She beeped: the blind car beeps back, a buffalo moos back (and hurries), chickens scatter. */
  honk(her: Her, ev: TrafficEvents) {
    let heard = false
    for (const m of this.movers)
      if (m.plan.blind !== undefined && m.state === 'go' && !m.replied && m.s - her.s < 70) {
        m.replied = true
        this.counts.replies++
        m.hop = 1
        window.setTimeout(() => ev.beepBack(), 380)
        heard = true
      }
    for (const b of this.buffalo)
      if (Math.abs(b.s - her.s) < 45 && b.state !== 'done') {
        b.hurry = 2.2
        b.hop = 1
        window.setTimeout(() => ev.moo(), 300)
        heard = true
      }
    for (const f of this.flocks) if (Math.abs(f.s - her.s) < 30 && !f.fled) this.scatter(f, ev)
    return heard
  }

  /** A tap on one of them (its tap target id). */
  poke(id: string, ev: TrafficEvents) {
    const [kind, n] = id.split(':')
    const i = Number(n)
    if (kind === 'mover') {
      const m = this.movers[i]
      m.hop = 1
      ev.toot(m.plan.kind, true)
    } else if (kind === 'buffalo') {
      const b = this.buffalo[i]
      b.hop = 1
      ev.moo()
    } else if (kind === 'chickens') {
      const f = this.flocks[i]
      for (const c of f.birds) if (c.y <= 0) c.vy = 4
      ev.cluck()
      const c = f.birds[1]
      ev.puff(c.root.position.x, c.root.position.y + 0.4, c.root.position.z)
    } else if (kind === 'monkey') {
      const m = this.monkeys[i]
      if (m.y <= 0) m.vy = 5
      m.hop = 1
      ev.chatter()
    }
  }

  /** Where each tap target sits (null: not on the road now). */
  anchorAt(id: string, her: Her): { at: Vector3; r: number } | null {
    const [kind, n] = id.split(':')
    const i = Number(n)
    const near = (s: number) => s - her.s > -12 && s - her.s < 70
    if (kind === 'mover') {
      const m = this.movers[i]
      if (!m || m.state !== 'go' || !near(m.s)) return null
      return { at: m.root.getWorldPosition(new Vector3()).setY(m.root.position.y + 1.3), r: 1.6 }
    }
    if (kind === 'buffalo') {
      const b = this.buffalo[i]
      if (!b || !near(b.s)) return null
      return { at: b.root.getWorldPosition(new Vector3()).setY(b.root.position.y + 1.2), r: 1.4 }
    }
    if (kind === 'chickens') {
      const f = this.flocks[i]
      if (!f || !near(f.s)) return null
      return { at: f.birds[1].root.getWorldPosition(new Vector3()).setY(f.birds[1].root.position.y + 0.4), r: 1.2 }
    }
    if (kind === 'monkey') {
      const m = this.monkeys[i]
      if (!m || !near(m.s)) return null
      return { at: m.root.getWorldPosition(new Vector3()).setY(m.root.position.y + 0.6), r: 0.8 }
    }
    return null
  }

  qa() {
    return {
      movers: this.movers.map((m) => ({ kind: m.plan.kind, state: m.state, s: Math.round(m.s), lat: Math.round(m.lat * 10) / 10, yielded: m.yielded, replied: m.replied })),
      buffalo: this.buffalo.map((b) => b.state),
      chickens: this.flocks.map((f) => f.fled),
      ...this.counts,
    }
  }

  // ---------------------------------------------------------------- the oncoming traffic

  private moveMover(m: Mover, dt: number, t: number, her: Her, ev: TrafficEvents) {
    const half = this.road.half
    if (m.state === 'wait') {
      if (her.s < m.plan.when) return
      m.state = 'go'
      m.s = Math.max(m.plan.from, her.s + 35)
      m.lat = -half * LANE
      m.v = m.plan.speed
      m.root.visible = true
    }
    if (m.state !== 'go') return
    const gap = m.s - her.s
    // She's over the middle line (her car is about a meter either side of her lat), and it's coming: onto the verge,
    // stop, and toot her a happy tune.
    const inTheWay = her.lat < 1.3 && gap > -4 && gap < 34
    let wantLat = -half * LANE
    let wantV = m.plan.speed
    if (inTheWay) {
      wantLat = -(half + 0.9)
      wantV = gap < 16 ? 0 : m.plan.speed * 0.4
      if (!m.yielded) {
        m.yielded = true
        this.counts.yields++
        ev.toot(m.plan.kind, true)
      }
    } else if (m.yielded && gap < -4) m.yielded = false
    // Never into her, whatever happens.
    if (gap > 0 && gap < 9 && Math.abs(m.lat - her.lat) < 2.6) wantV = 0
    m.v += (wantV - m.v) * (1 - Math.exp(-dt * 2.5))
    m.lat += (wantLat - m.lat) * (1 - Math.exp(-dt * 2))
    m.s -= m.v * dt
    // The blind car beeps first if she hasn't, as it comes round (friendly: no failing).
    if (m.plan.blind !== undefined && !m.replied && gap < 22) {
      m.replied = true
      ev.toot('car', false)
    }
    if (m.s < her.s - 60 || m.s <= 0) {
      m.state = 'gone'
      m.root.visible = false
      return
    }
    const p = this.road.spotAt(m.s, m.lat)
    m.root.position.set(p.x, p.y, p.z)
    m.root.rotation.y = p.heading + Math.PI
    m.hop = Math.max(0, m.hop - dt * 2.5)
    m.body.position.y = Math.abs(Math.sin(t * 9 + m.i)) * 0.03 * Math.min(1, m.v / 3) + Math.sin(m.hop * Math.PI) * 0.35
    for (const w of m.wheels) w.rotation.x += (m.v * dt) / 0.3
    if (m.lamps) m.lamps.color.set(m.replied && Math.sin(t * 18) > 0 ? '#FFFFFF' : '#FFF1B8')
  }

  private mover(plan: MoverPlan, i: number, bag: Bag): Mover {
    const root = new Group()
    const body = new Group()
    root.add(body)
    let wheels: Group[] = []
    let lamps: MeshBasicMaterial | null = null
    if (plan.kind === 'songthaew') {
      const st = buildSongthaew(bag)
      // (It faces +x: turned to face +z like the others.)
      st.root.rotation.y = -Math.PI / 2
      body.add(st.root)
      wheels = st.wheels
    } else if (plan.kind === 'scooter') {
      const c = [PAL.mint, PAL.sky, PAL.peach, PAL.butter][i % 4]
      body.add(solid(merge([
        P.rbox(0.5, 0.45, 1.5, 0.15, c, { at: [0, 0.55, 0] }),
        P.rbox(0.45, 0.12, 0.7, 0.05, PAL.ink, { at: [0, 0.82, -0.2] }),
        P.cyl(0.04, 0.04, 0.6, '#D9DCE8', { at: [0, 1.05, 0.6], rot: [0.3, 0, 0] }),
        P.box(0.7, 0.05, 0.05, '#D9DCE8', { at: [0, 1.32, 0.68] }),
        // The rider and a little one behind (helmets on), waving.
        P.capsule(0.22, 0.35, PAL.lavender, { at: [0, 1.25, 0.05] }),
        P.sphere(0.24, PAL.hotpink, { at: [0, 1.82, 0.1] }),
        P.capsule(0.17, 0.2, PAL.pink, { at: [0, 1.15, -0.45] }),
        P.sphere(0.19, PAL.butter, { at: [0, 1.6, -0.45] }),
      ]), bag, 2))
      wheels = [0.55, -0.55].map((z) => {
        const w = new Group()
        w.position.set(0, 0.28, z)
        w.add(solid(P.torus(0.2, 0.08, PAL.ink, { rot: [0, Math.PI / 2, 0] }), bag, 2))
        body.add(w)
        return w
      })
    } else if (plan.kind === 'tuktuk') {
      const c = [PAL.sky, PAL.hotpink][i % 2]
      body.add(solid(merge([
        P.rbox(1.3, 0.55, 2.4, 0.15, c, { at: [0, 0.6, -0.1] }),
        P.rbox(0.8, 0.5, 0.7, 0.15, c, { at: [0, 1.05, 0.85] }),
        P.box(0.7, 0.35, 0.04, '#CDEBFF', { at: [0, 1.4, 1.05], rot: [-0.3, 0, 0] }),
        P.rbox(1.45, 0.12, 2.5, 0.05, PAL.butter, { at: [0, 2.05, -0.1] }),
        ...[-1, 1].flatMap((s) => [1.0, -1.15].map((z) => P.cyl(0.04, 0.04, 1.1, '#F4EFF8', { at: [s * 0.62, 1.5, z] }))),
        P.rbox(1.1, 0.12, 0.6, 0.04, PAL.lavender, { at: [0, 0.98, -0.6] }),
      ]), bag, 2))
      wheels = [[0, 1.0], [-0.6, -0.9], [0.6, -0.9]].map(([x, z]) => {
        const w = new Group()
        w.position.set(x, 0.26, z)
        w.add(solid(P.torus(0.18, 0.08, PAL.ink, { rot: [0, Math.PI / 2, 0] }), bag, 2))
        body.add(w)
        return w
      })
    } else {
      // A round little toy car (the one behind the blind bend): butter yellow, with headlights that flash hello.
      body.add(solid(merge([
        P.rbox(1.7, 0.6, 3.4, 0.25, PAL.butter, { at: [0, 0.6, 0] }),
        P.rbox(1.45, 0.55, 1.8, 0.25, PAL.butter, { at: [0, 1.15, -0.2] }),
        P.box(1.3, 0.38, 0.04, '#CDEBFF', { at: [0, 1.18, 0.72], rot: [-0.35, 0, 0] }),
        ...[-1, 1].map((s) => P.box(0.04, 0.34, 1.4, '#CDEBFF', { at: [s * 0.73, 1.17, -0.2] })),
      ]), bag, 2))
      lamps = bag.add(new MeshBasicMaterial({ color: '#FFF1B8' }))
      for (const s of [-1, 1]) body.add(new Mesh(bag.add(P.sphere(0.15, '#ffffff', { at: [s * 0.55, 0.68, 1.68], scale: [1, 1, 0.5] })), lamps))
      wheels = [[-0.8, 1.05], [0.8, 1.05], [-0.8, -1.05], [0.8, -1.05]].map(([x, z]) => {
        const w = new Group()
        w.position.set(x, 0.34, z)
        w.add(solid(P.torus(0.24, 0.1, PAL.ink, { rot: [0, Math.PI / 2, 0] }), bag, 2))
        body.add(w)
        return w
      })
    }
    root.add(blobShadow(plan.kind === 'scooter' ? 0.9 : 1.9, bag))
    root.visible = false
    this.root.add(root)
    return { plan, root, body, wheels, lamps, s: plan.from, lat: 0, v: 0, state: 'wait', yielded: false, replied: false, hop: 0, i }
  }

  // ---------------------------------------------------------------- the animals

  private moveBuffalo(b: Buffalo, dt: number, t: number, her: Her, ev: TrafficEvents) {
    const half = this.road.half
    const far = half + 3.6
    if (b.state === 'graze' && her.s > b.s - 44) {
      b.state = 'cross'
      this.counts.crossings++
      ev.moo()
    }
    let walking = false
    if (b.state === 'cross') {
      const to = -b.side * far
      const step = 1.5 * (1 + b.hurry) * dt
      b.lat += Math.sign(to - b.lat) * Math.min(step, Math.abs(to - b.lat))
      walking = true
      if (Math.abs(to - b.lat) < 0.01) b.state = 'done'
    }
    b.hurry = Math.max(0, b.hurry - dt * 0.4)
    const p = this.road.spotAt(b.s, b.lat)
    const y = Math.abs(b.lat) < half + 1.4 ? p.y : this.field.at(p.x, p.z)
    b.hop = Math.max(0, b.hop - dt * 2.2)
    b.root.position.set(p.x, y + Math.sin(b.hop * Math.PI) * 0.45, p.z)
    // Facing the way it walks across (or along the road, grazing).
    const across = p.heading + (b.side > 0 ? -Math.PI / 2 : Math.PI / 2)
    const want = b.state === 'cross' ? across : b.state === 'graze' ? p.heading + b.side * 0.5 : across + Math.PI * 0.4
    b.root.rotation.y += wrap(want - b.root.rotation.y) * (1 - Math.exp(-dt * 3))
    // Head down grazing, up walking; the legs swing.
    b.head.rotation.x = walking ? Math.sin(t * 5) * 0.08 : 0.5 + Math.sin(t * 1.3 + b.i) * 0.15
    b.legs.forEach((l, k) => (l.rotation.x = walking ? Math.sin(t * 6 * (1 + b.hurry * 0.5) + (k % 2) * Math.PI + (k > 1 ? Math.PI / 2 : 0)) * 0.4 : 0))
  }

  private buildBuffalo(s: number, side: number, i: number, bag: Bag): Buffalo {
    const root = new Group()
    const C = '#6F6884'
    const body = solid(merge([P.rbox(1.15, 1.0, 2.1, 0.4, C, { at: [0, 1.15, 0] }), P.cyl(0.05, 0.03, 0.6, C, { at: [0, 1.1, -1.15], rot: [0.4, 0, 0] })]), bag, 2)
    root.add(body)
    const head = new Group()
    head.position.set(0, 1.45, 1.05)
    head.add(solid(merge([
      P.rbox(0.62, 0.6, 0.8, 0.25, C, { at: [0, -0.1, 0.35] }),
      P.rbox(0.5, 0.32, 0.3, 0.12, '#9C93AE', { at: [0, -0.26, 0.74] }),
      // The big swept-back horns.
      ...[-1, 1].map((k) => P.torus(0.4, 0.07, '#EDE3D2', { at: [k * 0.42, 0.18, 0.12], rot: [Math.PI / 2, 0, k > 0 ? 0 : Math.PI] }, Math.PI * 0.75)),
      ...[-1, 1].map((k) => P.sphere(0.06, PAL.ink, { at: [k * 0.24, 0.05, 0.62] })),
    ]), bag, 2))
    root.add(head)
    const legs = [[-0.38, 0.7], [0.38, -0.7], [0.38, 0.7], [-0.38, -0.7]].map(([x, z]) => {
      const l = new Group()
      l.position.set(x, 0.75, z)
      l.add(solid(P.rbox(0.24, 0.8, 0.26, 0.08, C, { at: [0, -0.38, 0] }), bag, 2))
      root.add(l)
      return l
    })
    root.add(blobShadow(1.4, bag))
    this.root.add(root)
    return { root, head, legs, s, side, lat: side * (this.road.half + 3.6), state: 'graze', hurry: 0, hop: 0, i }
  }

  private scatter(f: Flock, ev: TrafficEvents) {
    f.fled = true
    this.counts.flaps++
    ev.cluck()
    for (const c of f.birds) {
      c.state = 'flee'
      c.to = (Math.sign(c.lat) || 1) * (this.road.half + 3.5)
      c.vy = 3.5
      ev.puff(c.root.position.x, c.root.position.y + 0.3, c.root.position.z)
    }
  }

  private moveFlock(f: Flock, dt: number, t: number, her: Her, ev: TrafficEvents) {
    if (!f.fled && her.s > f.s - 17) this.scatter(f, ev)
    for (const c of f.birds) {
      if (c.state === 'flee') {
        c.lat += Math.sign(c.to - c.lat) * Math.min(4.5 * dt, Math.abs(c.to - c.lat))
        if (Math.abs(c.to - c.lat) < 0.01) c.state = 'safe'
      }
      c.vy -= 16 * dt
      c.y = Math.max(0, c.y + c.vy * dt)
      if (c.y <= 0) c.vy = c.state === 'flee' ? 3.2 : Math.max(0, c.vy)
      const p = this.road.spotAt(c.s, c.lat)
      const g = Math.abs(c.lat) < this.road.half + 1.4 ? p.y : this.field.at(p.x, p.z)
      c.root.position.set(p.x, g + c.y, p.z)
      c.root.rotation.y = c.state === 'peck' ? p.heading + Math.sin(t * 0.7 + c.lat) * 2 : p.heading + Math.sign(c.to - c.lat || 1) * (Math.PI / 2)
      // Pecking: the whole bird tips forward now and then; fleeing: wings flap.
      c.root.rotation.x = c.state === 'peck' && Math.sin(t * 3 + c.lat * 5) > 0.7 ? 0.5 : 0
      for (const [k, w] of c.wings.entries()) w.rotation.z = (k ? -1 : 1) * (c.state === 'flee' || c.y > 0 ? 0.6 + Math.sin(t * 40) * 0.6 : 0.1)
    }
  }

  private buildChicken(s: number, lat: number, bag: Bag): Chicken {
    const root = new Group()
    const c = lat > 0 ? '#FFFFFF' : '#E8B98E'
    root.add(solid(merge([
      P.sphere(0.24, c, { at: [0, 0.38, 0], scale: [0.85, 0.9, 1.1] }),
      P.sphere(0.14, c, { at: [0, 0.62, 0.18] }),
      P.cone(0.05, 0.12, PAL.gold, { at: [0, 0.6, 0.34], rot: [Math.PI / 2, 0, 0] }),
      P.box(0.05, 0.1, 0.12, '#FF5C7A', { at: [0, 0.76, 0.18] }),
      P.cone(0.1, 0.22, c, { at: [0, 0.48, -0.26], rot: [-1, 0, 0] }),
      ...[-1, 1].map((k) => P.cyl(0.02, 0.02, 0.18, PAL.gold, { at: [k * 0.08, 0.1, 0] })),
    ]), bag, 2))
    const wings = [-1, 1].map((k) => {
      const w = new Group()
      w.position.set(k * 0.2, 0.42, 0)
      w.add(solid(P.sphere(0.13, c, { at: [k * 0.06, -0.04, 0], scale: [0.4, 0.8, 1.2] }), bag, 2))
      root.add(w)
      return w
    })
    this.root.add(root)
    return { root, wings, s, lat, to: lat, y: 0, vy: 0, state: 'peck' }
  }

  private moveMonkey(m: Monkey, dt: number, t: number, her: Her) {
    const gap = m.s - her.s
    if (!m.waved && gap < 10) {
      m.waved = true
      if (m.y <= 0) m.vy = 4
    }
    m.vy -= 16 * dt
    m.y = Math.max(0, m.y + m.vy * dt)
    m.hop = Math.max(0, m.hop - dt * 1.6)
    const p = this.road.spotAt(m.s, m.side * (this.road.half + 0.55))
    m.root.position.set(p.x, p.y + 0.85 + m.y, p.z)
    // Watching her go by (and a spin when poked).
    m.root.rotation.y = p.heading + (gap > 0 ? Math.PI : 0) + m.side * 0.6 + m.hop * Math.PI * 2
    m.arm.rotation.z = m.waved && gap > -25 ? -2.2 + Math.sin(t * 10) * 0.5 : -0.3
  }

  private buildMonkey(s: number, side: number, bag: Bag): Monkey {
    const root = new Group()
    const C = '#B08A6E'
    root.add(solid(merge([
      P.sphere(0.28, C, { at: [0, 0.3, 0], scale: [1, 1.1, 0.9] }),
      P.sphere(0.22, C, { at: [0, 0.72, 0.04] }),
      P.sphere(0.15, '#F2D3C0', { at: [0, 0.68, 0.18], scale: [1.1, 0.8, 0.6] }),
      ...[-1, 1].map((k) => P.sphere(0.08, '#F2D3C0', { at: [k * 0.22, 0.78, 0] })),
      ...[-1, 1].map((k) => P.sphere(0.035, PAL.ink, { at: [k * 0.07, 0.76, 0.21] })),
      P.torus(0.25, 0.04, C, { at: [0, 0.2, -0.3], rot: [0, Math.PI / 2, 0] }, Math.PI * 1.2),
    ]), bag, 2))
    const arm = new Group()
    arm.position.set(0.24, 0.42, 0)
    arm.add(solid(P.capsule(0.06, 0.3, C, { at: [0, -0.2, 0] }), bag, 2))
    root.add(arm)
    this.root.add(root)
    return { root, arm, s, side, hop: 0, y: 0, vy: 0, waved: false }
  }
}

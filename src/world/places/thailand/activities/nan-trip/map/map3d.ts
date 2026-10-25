// The Nan map (section `map`, plan: thailand/nan-trip.md, "The Nan map", build step 6: the greybox): the trip's hub, a
// toy diorama of Nan on a table (diorama.ts), seen from above at a slant. The little silver Pajero sits on its roads.
//
// The toy: the Pajero is a toy car on the board. Tap a place and it drives there along the roads (beep, putter), and
// when it gets there the camera dives into the road and she drives it for real (the drive section). Or grab the car and
// pull it: it follows her finger along the roads (never across the hills), and let go at a place (or hold it still at a
// stop a moment) to go. The stops she's done wear a pink stamp; the newest one lands with a ka-chunk when she comes back.
// After two stops the airport opens too (home, down the "number 3" road); after all three it's the only way left, and
// it glows. Nan town is a short drive through the market and back.
//
// Things to poke: the clouds on the peaks (a little rain), the river (a fish jumps), the tiny plane (it takes off,
// loops round and lands), the buffalo (moo), the flags of Thailand and Laos (they wave: Laos is just over the border),
// the places she's done (a happy jingle and their stamp spins), and the Pajero itself (beep beep).
import { Color, IcosahedronGeometry, OctahedronGeometry, Vector3, type WebGLRenderer } from 'three'
import { bell, clamp } from '../../../../../../sdk'
import type { AnchorInfo } from '../../../engine/Anchors'
import type { Shot } from '../../../engine/camera'
import { PAL } from '../../../engine/toon'
import { Stage, type AnchorSpot, type LegEvents } from '../../../trip/legs/stage'
import { Floaters } from '../mushrooms/fx'
import { buildDiorama, type Diorama } from './diorama'
import { BOARD, CAR_SPEED, CLOUDS, DRAG_SPEED, FISH, heightAt, HOME_AFTER, LAOS_FLAG, modelAt, PLACE_IDS, PLACES, RUNWAY, STAMP_Y, STOPS, THAI_FLAG, type PlaceId, type Stop } from './layout'
import { buildNet, nearest, route, STEP } from './net'
import { mapSfx as sfx } from './sounds'

export interface MapEvents extends LegEvents {
  /** The little Pajero got to the place she picked: drive there for real. */
  go(place: PlaceId): void
}

export const MAP_ANCHORS: AnchorInfo[] = [
  { id: 'car', label: 'The Pajero (beep beep!)', kind: 'thing' },
  ...PLACE_IDS.map((id): AnchorInfo => ({ id: `place:${id}`, label: PLACES[id].label, kind: 'thing' })),
  { id: 'plane', label: 'Tiny plane', kind: 'thing' },
  ...CLOUDS.map((_, i): AnchorInfo => ({ id: `cloud:${i}`, label: 'Cloud', kind: 'thing' })),
  { id: 'river', label: 'The Nan River', kind: 'thing' },
  { id: 'buffalo', label: 'Water buffalo', kind: 'thing' },
  { id: 'flag:thai', label: 'Flag of Thailand', kind: 'thing' },
  { id: 'flag:laos', label: 'Flag of Laos', kind: 'thing' },
]

/** Nothing touched for this long: the place to go next glows. */
const STUCK_S = 5
/** Held still at a stop this long while she holds the car: off it goes. (Not Nan town or the airport: the roads to the
 *  stops run through town, so only a tap or letting go there goes to them.) */
const DWELL_S = 0.8
/** The camera dives into the road this long before the drive opens. */
const DIVE_S = 1.15
const PLANE_S = 6

const tmp = new Vector3()

export class NanMap extends Stage {
  private d: Diorama
  private net = buildNet()
  private done: Set<Stop>
  private fresh: Stop | null
  private car = { path: [0], k: 0, speed: CAR_SPEED, heading: 0, hop: 1, flash: 0, putT: 0, lift: 0 }
  private going: PlaceId | null = null
  private arrived: { id: PlaceId; t: number } | null = null
  private held = false
  private finger = { x: 0, y: 0 }
  private target = -1
  private dwell = 0
  private counted = false
  private pokeT = new Map<string, number>()
  private planeT = -1
  private fishT = -1
  private rain = CLOUDS.map(() => -1)
  private stampT = -1
  private later: { t: number; f: () => void }[] = []
  private sparkles: Floaters
  private drops: Floaters
  private steam: Floaters

  constructor(renderer: WebGLRenderer, private ev: MapEvents, start: { stops: Stop[] }) {
    super(renderer, ev)
    const { scene, bag } = this
    this.scene.background = new Color('#E4DDF4')
    this.rig.fov = 34
    this.rig.lag = 0.5
    this.d = buildDiorama(bag, this.net)
    scene.add(this.d.root)
    this.sparkles = new Floaters(new OctahedronGeometry(0.5), [PAL.gold, PAL.hotpink, '#FFFFFF', PAL.mint], 140, bag, 0.6, 1.2)
    this.drops = new Floaters(new IcosahedronGeometry(0.5, 0), ['#A8DCFF', '#D6EEFF'], 80, bag, 2.2, 0.2)
    this.steam = new Floaters(new IcosahedronGeometry(0.5, 1), ['#FFFFFF', '#F1F4F8'], 40, bag, -0.15, 1.0, 0.7, 1.8)
    scene.add(this.sparkles.mesh, this.drops.mesh, this.steam.mesh)
    // ---- Where the link starts: the stops done so far, and the Pajero at the last one (or at the airport) ----
    this.done = new Set(start.stops)
    const last = start.stops[start.stops.length - 1]
    this.fresh = last ?? null
    const at = this.net.place[last ?? 'airport']
    this.car.path = [at]
    const n = this.net.nbr[at][0]
    if (n !== undefined) this.car.heading = Math.atan2(this.net.pts[at][0] - this.net.pts[n][0], this.net.pts[at][1] - this.net.pts[n][1])
    for (const s of STOPS) this.d.stamps[s].visible = this.done.has(s) && s !== this.fresh
    if (this.fresh) this.after(0.7, () => this.landStamp())
    this.placeCar(0)
  }

  // ---------------------------------------------------------------- which places are open

  /** Can she go there now? The stops she hasn't done; Nan town until all three are done; the airport after two. */
  private open(id: PlaceId) {
    if (id === 'airport') return this.done.size >= HOME_AFTER
    if (id === 'town') return this.done.size < STOPS.length
    return !this.done.has(id)
  }
  private get allDone() {
    return this.done.size >= STOPS.length
  }

  // ---------------------------------------------------------------- the little Pajero

  /** The road point the car is on (or just passed). */
  private get at() {
    const p = this.car.path
    return p[Math.min(p.length - 1, Math.round(this.car.k))]
  }
  private carPos(out = new Vector3()) {
    const { path, k } = this.car
    const i = Math.min(path.length - 1, Math.floor(k))
    const j = Math.min(path.length - 1, i + 1)
    const f = k - i
    const a = this.net.pts[path[i]]
    const b = this.net.pts[path[j]]
    const x = a[0] + (b[0] - a[0]) * f
    const z = a[1] + (b[1] - a[1]) * f
    return out.set(x, heightAt(x, z) + 0.02, z)
  }

  /** Off along the roads to a place (from the map). */
  private goTo(id: PlaceId) {
    const node = this.net.place[id]
    if (this.at === node && this.car.path.length <= 1) return this.arrive(id)
    this.car.path = route(this.net, this.at, node)
    this.car.k = 0
    this.car.speed = Math.max(CAR_SPEED, (this.car.path.length * STEP) / 2.6)
    this.going = id
    this.car.hop = 0
    sfx.zoom()
  }

  /** It's there: a hop and sparkles, the camera dives into the road, and the drive opens. */
  private arrive(id: PlaceId) {
    if (this.arrived) return
    this.going = null
    this.held = false
    this.arrived = { id, t: this.time }
    this.car.hop = 0
    this.car.flash = 0.6
    sfx.horn()
    this.after(0.3, () => sfx.dive())
    const p = this.carPos()
    this.sparkles.burst(p.setY(p.y + 0.1), 24, 0.6, 0.8, 0.8, 0.03)
    this.rig.lag = 0.75
    this.after(DIVE_S, () => this.ev.go(id))
  }

  private stepCar(dt: number, t: number) {
    const c = this.car
    // ---- Her finger pulls it along the roads ----
    if (this.held && !this.arrived) {
      const g = this.groundAt(this.finger.x, this.finger.y)
      const n = g ? nearest(this.net, g.x, g.z) : null
      if (n && n.d < 0.5 && n.i !== this.target) {
        this.target = n.i
        c.path = route(this.net, this.at, n.i)
        c.k = 0
        c.speed = DRAG_SPEED
      }
    }
    // ---- Along its path ----
    const before = this.carPos(tmp).clone()
    if (c.path.length > 1) {
      c.k = Math.min(c.path.length - 1, c.k + (c.speed * dt) / STEP)
      c.putT -= dt
      if (c.putT <= 0) {
        c.putT = 0.09
        sfx.putter()
      }
      if (c.k >= c.path.length - 1) {
        c.path = [c.path[c.path.length - 1]]
        c.k = 0
        if (this.going && this.at === this.net.place[this.going]) this.arrive(this.going)
      }
    }
    const now = this.carPos(tmp)
    const dx = now.x - before.x
    const dz = now.z - before.z
    if (Math.hypot(dx, dz) > 1e-4) {
      const want = Math.atan2(dx, dz)
      c.heading += Math.atan2(Math.sin(want - c.heading), Math.cos(want - c.heading)) * Math.min(1, dt * 14)
    }
    // ---- Held still at a place she can go to: off it goes ----
    const here = this.placeHere()
    if (this.held && here && here !== 'town' && here !== 'airport' && c.path.length <= 1) {
      this.dwell += dt
      if (this.dwell > DWELL_S) this.arrive(here)
    } else this.dwell = 0
    c.lift += ((this.held ? 1 : 0) - c.lift) * Math.min(1, dt * 10)
    c.hop = Math.min(1, c.hop + dt / 0.45)
    c.flash = Math.max(0, c.flash - dt)
    this.placeCar(t)
  }

  /** An open place right where the car is (null: none). */
  private placeHere(): PlaceId | null {
    const p = this.carPos(tmp)
    for (const id of PLACE_IDS) {
      const [x, z] = PLACES[id].at
      if (this.open(id) && Math.hypot(p.x - x, p.z - z) < 0.12) return id
    }
    return null
  }

  private placeCar(t: number) {
    const c = this.car
    const o = this.d.car
    this.carPos(o.root.position)
    o.root.position.y += c.lift * 0.08 + bell(c.hop) * 0.12
    o.root.rotation.y = c.heading
    const moving = c.path.length > 1
    o.body.position.y = moving ? Math.abs(Math.sin(t * 16)) * 0.04 : 0
    o.body.rotation.z = c.lift * Math.sin(t * 9) * 0.06
    for (const w of o.wheels) if (moving) w.rotation.x += 0.4
    o.lamps.color.set(c.flash > 0 && Math.sin(c.flash * 30) > 0 ? '#FFFFFF' : '#E6E2EE')
  }

  // ---------------------------------------------------------------- the stamps, the pokes

  /** The newest stamp lands on its stop: down from above, ka-chunk, sparkles. */
  private landStamp() {
    if (!this.fresh) return
    this.d.stamps[this.fresh].visible = true
    this.stampT = 0
  }

  private poke(id: PlaceId) {
    this.pokeT.set(id, this.time)
    if (id === 'airport') return this.fly()
    if (id === 'town') {
      sfx.chime()
      return
    }
    const stamp = this.d.stamps[id as Stop]
    if (stamp?.visible) {
      sfx.been()
      this.pokeT.set(`stamp:${id}`, this.time)
      this.sparkles.burst(stamp.position.clone(), 12, 0.5, 0.6, 0.7, 0.025)
    } else sfx.bloop()
  }

  /** The tiny plane takes off down the runway, loops round over the board, and lands again. */
  private fly() {
    if (this.planeT >= 0) return
    this.planeT = 0
    sfx.takeoff()
  }

  /** The plane's circuit: down the runway and up, out round a racetrack loop over the board, and back down onto the
   *  runway where it started. Where it is at `k` (0..1) and which way it's heading. */
  private planeAt(k: number) {
    const rw = RUNWAY
    const dir = new Vector3(Math.cos(rw.yaw), 0, -Math.sin(rw.yaw))
    const left = new Vector3(dir.z, 0, -dir.x)
    const ground = heightAt(...rw.at) + 0.03
    const S = new Vector3(rw.at[0], ground, rw.at[1]).addScaledVector(dir, -rw.len * 0.42)
    const L = rw.len * 0.84
    const R = 0.55
    const UP = 0.5
    const roll = L
    const arc = Math.PI * R
    const back = L + 0.6
    const legs = [roll + 0.3, arc, back, arc, 0.3]
    const total = legs.reduce((a, b) => a + b, 0)
    let u = k * total
    const at = new Vector3()
    let heading = dir.clone()
    let alt = UP
    if ((u -= legs[0]) < 0) {
      const d = u + legs[0]
      at.copy(S).addScaledVector(dir, d)
      alt = clamp((d - roll * 0.6) / 0.6, 0, 1) * UP
    } else if ((u -= legs[1]) < 0) {
      const a = (u + legs[1]) / R
      const c = S.clone().addScaledVector(dir, L + 0.3).addScaledVector(left, R)
      at.copy(c).addScaledVector(left, -Math.cos(a) * R).addScaledVector(dir, Math.sin(a) * R)
      heading = dir.clone().multiplyScalar(Math.cos(a)).addScaledVector(left, Math.sin(a))
    } else if ((u -= legs[2]) < 0) {
      at.copy(S).addScaledVector(dir, L + 0.3 - (u + legs[2])).addScaledVector(left, 2 * R)
      heading = dir.clone().negate()
    } else if ((u -= legs[3]) < 0) {
      const a = (u + legs[3]) / R
      const c = S.clone().addScaledVector(dir, -0.3).addScaledVector(left, R)
      at.copy(c).addScaledVector(left, Math.cos(a) * R).addScaledVector(dir, -Math.sin(a) * R)
      heading = dir.clone().multiplyScalar(-Math.cos(a)).addScaledVector(left, -Math.sin(a))
    } else {
      const d = clamp(u + legs[4], 0, 0.3)
      at.copy(S).addScaledVector(dir, d - 0.3)
      alt = (1 - d / 0.3) * UP
    }
    at.y = ground + alt
    return { at, yaw: Math.atan2(heading.x, heading.z) - Math.PI / 2, bank: alt > 0.05 && Math.abs(heading.dot(dir)) < 0.99 ? 0.4 : 0 }
  }

  private stepPlane(dt: number) {
    const p = this.d.plane
    if (this.planeT >= 0) {
      this.planeT += dt
      if (this.planeT >= PLANE_S) {
        this.planeT = -1
        sfx.thump()
      }
    }
    // (Eased, so it rolls off slowly and slows down to land.)
    const k = this.planeT < 0 ? 0 : this.planeT / PLANE_S
    const e = k < 0.15 ? (k * k) / 0.3 : k > 0.9 ? 1 - ((1 - k) * (1 - k)) / 0.2 : 0.075 + (k - 0.15) * (0.875 / 0.75)
    const at = this.planeAt(clamp(e, 0, 1))
    p.position.copy(at.at)
    p.rotation.set(at.bank, at.yaw, 0, 'YXZ')
  }

  // ---------------------------------------------------------------- the frame

  protected step(dt: number, t: number) {
    for (const l of this.later.filter((x) => x.t <= this.time)) {
      this.later.splice(this.later.indexOf(l), 1)
      if (!this.disposed) l.f()
    }
    this.stepCar(dt, t)
    this.stepPlane(dt)
    const d = this.d
    // ---- The places bounce when poked; the stamps bob and turn; the newest one lands ----
    for (const id of PLACE_IDS) {
      const k = Math.min(1, (this.time - (this.pokeT.get(id) ?? -9)) / 0.45)
      const b = bell(k)
      d.places[id].scale.set(1 + 0.08 * b, 1 - 0.12 * b + 0.12 * b * (k > 0.5 ? 1 : 0), 1 + 0.08 * b)
      // A glow-bounce on the place she should go to, when she's stuck.
      if (this.time - this.lastTouch > STUCK_S && this.hintPlace() === id) d.places[id].position.y = heightAt(...modelAt(id)) + Math.abs(Math.sin(t * 4)) * 0.04
      else d.places[id].position.y = heightAt(...modelAt(id))
    }
    for (const s of STOPS) {
      const g = d.stamps[s]
      if (!g.visible) continue
      const [x, z] = modelAt(s)
      const base = heightAt(x, z) + STAMP_Y
      const spin = clamp((this.time - (this.pokeT.get(`stamp:${s}`) ?? -9)) / 0.8, 0, 1)
      g.rotation.y = Math.sin(t * 1.3 + x) * 0.25 + (spin < 1 ? spin * Math.PI * 2 : 0)
      if (s === this.fresh && this.stampT >= 0) {
        this.stampT += dt
        const k = Math.min(1, this.stampT / 0.45)
        g.position.y = base + (1 - k * k) * 1.4
        const sq = this.stampT > 0.45 ? bell(Math.min(1, (this.stampT - 0.45) / 0.3)) : 0
        g.scale.set(1 + sq * 0.35, 1 - sq * 0.3, 1 + sq * 0.35)
        if (k >= 1 && this.stampT - dt < 0.45) {
          sfx.stamp()
          this.sparkles.burst(new Vector3(x, base, z), 30, 0.9, 0.9, 0.9, 0.035)
        }
        if (this.stampT > 0.8) this.stampT = -1
      } else g.position.y = base + Math.sin(t * 2 + x * 3) * 0.02
    }
    // ---- The clouds drift a little on their peaks; a poked one rains ----
    for (const [i, c] of d.clouds.entries()) {
      const [x, cy, z] = CLOUDS[i]
      c.position.set(x + Math.sin(t * 0.3 + i * 2) * 0.08, cy + Math.sin(t * 0.7 + i) * 0.02, z + Math.cos(t * 0.25 + i) * 0.05)
      if (this.rain[i] >= 0) {
        this.rain[i] += dt
        const k = this.rain[i]
        c.scale.set(1 + 0.08 * bell(Math.min(1, k / 0.4)), 1 - 0.1 * bell(Math.min(1, k / 0.4)), 1)
        if (k < 1.6 && Math.random() < dt * 40) this.drops.emit(tmp.set(c.position.x + (Math.random() - 0.5) * 0.4, c.position.y - 0.08, c.position.z + (Math.random() - 0.5) * 0.25), new Vector3(0, -0.6, 0), 0.5, 0.012)
        if (k > 1.6) this.rain[i] = -1
      }
    }
    // ---- The fish jumps out of the river and back in ----
    if (this.fishT >= 0) {
      this.fishT += dt
      const k = Math.min(1, this.fishT / 0.8)
      d.fish.visible = k < 1
      d.fish.position.set(FISH[0] - 0.1 + 0.2 * k, 0.02 + bell(k) * 0.28, FISH[1])
      d.fish.rotation.z = (0.5 - k) * 2.4
      if (k >= 1) {
        this.fishT = -1
        this.drops.burst(new Vector3(FISH[0] + 0.1, 0.03, FISH[1]), 10, 0.4, 0.6, 0.5, 0.012)
      }
    }
    // ---- The buffalo grazes (and hops when poked); the flags wave; steam rises off the salt pan ----
    const bk = clamp((this.time - (this.pokeT.get('buffalo') ?? -9)) / 0.5, 0, 1)
    d.buffalo.head.rotation.z = bk < 1 ? 0.4 * bell(bk) : -Math.max(0, Math.sin(t * 0.9)) * 0.5
    d.buffalo.root.position.y = heightAt(d.buffalo.root.position.x, d.buffalo.root.position.z) + 0.012 + bell(bk) * 0.06
    for (const [key, f] of [['flag:thai', d.flags.thai], ['flag:laos', d.flags.laos]] as const) {
      const k = clamp((this.time - (this.pokeT.get(key) ?? -9)) / 1.2, 0, 1)
      const cloth = f.children[1]
      cloth.rotation.y = Math.sin(t * (k < 1 ? 14 : 2.4) + f.position.x) * (k < 1 ? 0.45 : 0.15)
    }
    if (Math.random() < dt * 5) this.steam.emit(tmp.set(...d.steam), new Vector3((Math.random() - 0.5) * 0.04, 0.12, 0), 1.4, 0.03)
    for (const f of [this.sparkles, this.drops, this.steam]) f.update(dt)
  }

  // ---------------------------------------------------------------- touch

  private after(s: number, f: () => void) {
    this.later.push({ t: this.time + s, f })
  }

  /** Where a screen point meets the board (the ground's height under it). */
  private groundAt(x: number, y: number) {
    const cam = this.rig.camera
    const n = this.ndc(x, y)
    const near = new Vector3(n.x, n.y, -1).unproject(cam)
    const dir = new Vector3(n.x, n.y, 1).unproject(cam).sub(near).normalize()
    if (dir.y > -1e-4) return null
    let h = 0.1
    let p = near.clone()
    for (let k = 0; k < 4; k++) {
      p = near.clone().addScaledVector(dir, (h - near.y) / dir.y)
      h = heightAt(clamp(p.x, BOARD.x0, BOARD.x1), clamp(p.z, BOARD.z0, BOARD.z1))
    }
    return p
  }

  private screenOf(v: Vector3) {
    const c = v.clone().project(this.rig.camera)
    return c.z > 1 ? null : { x: ((c.x + 1) / 2) * this.w, y: ((1 - c.y) / 2) * this.h }
  }

  tap(x: number, y: number, id?: string) {
    if (this.counted) this.touches--
    this.counted = false
    super.tap(x, y, id)
  }

  pointerDown(x?: number, y?: number, id?: string) {
    super.pointerDown()
    this.counted = false
    if (x === undefined || y === undefined || this.arrived) return
    const s = this.screenOf(this.carPos())
    const onCar = id === 'car' || (!id && !!s && Math.hypot(s.x - x, s.y - y) < 80)
    if (!onCar) return
    this.held = true
    this.target = -1
    this.going = null
    this.finger = { x, y }
    this.touches++
    this.counted = true
  }

  pointerMove(x: number, y: number, _dx: number, _dy: number, isHeld: boolean) {
    if (!isHeld || !this.held) return
    this.finger = { x, y }
    this.lastTouch = this.time
  }

  pointerUp() {
    if (!this.held) return
    this.held = false
    // Let go at a place she can go to: off it goes.
    const here = this.placeHere()
    if (here && !this.arrived) this.arrive(here)
  }

  protected onTap(id: string | null, x: number, y: number): void {
    if (this.arrived) return
    if (id === 'car') {
      this.car.hop = 0
      this.car.flash = 0.6
      sfx.horn()
      return
    }
    if (id === null) {
      // On the board near a place: as if she'd tapped the place.
      const g = this.groundAt(x, y)
      if (!g) return
      for (const p of PLACE_IDS) if (Math.hypot(modelAt(p)[0] - g.x, modelAt(p)[1] - g.z) < 0.2) return this.onTap(`place:${p}`, x, y)
      return
    }
    if (id.startsWith('place:')) {
      const p = id.slice(6) as PlaceId
      if (this.open(p)) this.goTo(p)
      else this.poke(p)
      return
    }
    if (id.startsWith('cloud:')) {
      const i = Number(id.slice(6))
      if (this.rain[i] < 0) this.rain[i] = 0
      sfx.rain()
      return
    }
    switch (id) {
      case 'plane':
        return this.fly()
      case 'river':
        if (this.fishT < 0) {
          this.fishT = 0
          sfx.plip()
        }
        return
      case 'buffalo':
        this.pokeT.set('buffalo', this.time)
        sfx.moo()
        return
      case 'flag:thai':
      case 'flag:laos':
        this.pokeT.set(id, this.time)
        sfx.flutter()
        sfx.chime()
        return
    }
  }

  // ---------------------------------------------------------------- camera, tap targets, hints

  protected shot(): Shot {
    if (this.arrived) {
      // Diving into the road: down close to the little Pajero.
      const p = this.d.car.root.position
      return { center: p.clone().setY(p.y + 0.05), half: new Vector3(0.22, 0.1, 0.22), yaw: 0, pitch: 30, minDist: 0.7 }
    }
    const tall = this.w < this.h
    if (tall) return { center: new Vector3(0, 0.25, 0.1), half: new Vector3(2.95, 0.35, 2.2), yaw: 0, pitch: 64, minDist: 3 }
    return { center: new Vector3(0, 0.25, 0.12), half: new Vector3(2.95, 0.35, 2.15), yaw: 0, pitch: 54, minDist: 3 }
  }

  /** The place the hint points at: the nearest stop she hasn't done (or, all done, the airport). */
  private hintPlace(): PlaceId | null {
    if (this.arrived || this.going || this.held) return null
    if (this.allDone) return 'airport'
    const p = this.carPos()
    let best: PlaceId | null = null
    let bd = Infinity
    for (const s of STOPS) {
      if (this.done.has(s)) continue
      const d = Math.hypot(PLACES[s].at[0] - p.x, PLACES[s].at[1] - p.z)
      if (d < bd) (bd = d), (best = s)
    }
    return best
  }

  protected hintAt() {
    const id = this.hintPlace()
    if (!id) return null
    const [x, z] = modelAt(id)
    return new Vector3(x, heightAt(x, z) + 0.2, z)
  }

  protected anchorAt(id: string): AnchorSpot | null {
    if (this.arrived) return null
    const glow = (pid: PlaceId) => (this.time - this.lastTouch > STUCK_S && this.hintPlace() === pid) || (pid === 'airport' && this.allDone)
    if (id === 'car') return { at: this.carPos().setY(this.d.car.root.position.y + 0.08), r: 0.16, prio: 4, max: 110 }
    if (id.startsWith('place:')) {
      const p = id.slice(6) as PlaceId
      const [x, z] = modelAt(p)
      return { at: new Vector3(x, heightAt(x, z) + 0.15, z), r: p === 'town' ? 0.28 : 0.24, prio: 3, max: 150, glow: glow(p) }
    }
    if (id.startsWith('cloud:')) return { at: this.d.clouds[Number(id.slice(6))].position.clone(), r: 0.26, prio: 1, max: 140 }
    switch (id) {
      case 'plane':
        return { at: this.d.plane.position.clone(), r: 0.1, prio: 5, max: 100 }
      case 'river':
        return { at: new Vector3(FISH[0], 0.02, FISH[1]), r: 0.12, prio: 1, max: 100 }
      case 'buffalo':
        return { at: this.d.buffalo.root.position.clone().setY(this.d.buffalo.root.position.y + 0.06), r: 0.09, prio: 3, max: 100 }
      case 'flag:thai':
        return { at: new Vector3(THAI_FLAG[0] + 0.08, heightAt(...THAI_FLAG) + 0.3, THAI_FLAG[1]), r: 0.1, prio: 3, max: 100 }
      case 'flag:laos':
        return { at: new Vector3(LAOS_FLAG[0] + 0.08, heightAt(...LAOS_FLAG) + 0.3, LAOS_FLAG[1]), r: 0.1, prio: 3, max: 100 }
    }
    return null
  }

  qa() {
    const pt = (v: Vector3) => {
      const s = this.screenOf(v)
      return s ? [Math.round(s.x), Math.round(s.y)] : null
    }
    const places: Record<string, unknown> = {}
    const nodes: Record<string, unknown> = {}
    for (const id of PLACE_IDS) {
      const [x, z] = modelAt(id)
      places[id] = pt(new Vector3(x, heightAt(x, z) + 0.15, z))
      const [nx, nz] = PLACES[id].at
      nodes[id] = pt(new Vector3(nx, heightAt(nx, nz) + 0.02, nz))
    }
    return {
      game: 'map',
      stops: [...this.done],
      open: PLACE_IDS.filter((p) => this.open(p)),
      car: pt(this.carPos()),
      held: this.held,
      going: this.going,
      arrived: this.arrived?.id ?? null,
      plane: this.planeT >= 0,
      touches: this.touches,
      points: { places, nodes },
    }
  }
}

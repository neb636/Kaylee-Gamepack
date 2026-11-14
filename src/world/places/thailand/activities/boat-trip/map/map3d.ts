// The Krabi map (section `map`; notes: planning/around-the-world/thailand/krabi-map.md): the boat trip's hub, a toy
// diorama of Krabi and Phang Nga Bay floating in the sky (diorama.ts; the sky, the tray and the entrance are
// trip/sky.ts). It opens like the Thailand map: the camera is already moving behind the loading cover, then settles
// lower and closer (KRABI_CAM, ?feel=1). North is up the screen.
//
// The toy: pins. Over each place she can go to floats a pink pin with a toy of the place on its head: a baby elephant
// over Baan Chang, a longtail under a rock tower over the pier. Tap one (or the place under it): the pin hops and
// spins in a burst of sparkles, the camera dives in and that part of the trip opens (the pier: the family's longtail
// revs off into the bay; Baan Chang: the elephants trumpet and spray). The places she's done wear a pink stamp instead;
// the newest one lands with a ka-chunk when she comes back. After one place the way home opens: the plane's pin pops
// up over the airport, and a tap sends the tiny plane down the runway and away.
//
// Things to poke, a few and calm (2026-11-14: the first board was too busy): Ao Nang's beach (the sailfish leaps),
// Railay's cliffs (the monkey hops and chatters), Chicken Island (it clucks and bobs), Koh Phi Phi and Ko Tapu (a
// splash), Koh Lanta's lighthouse (the lamp comes on and turns), Krabi Town (its shophouses bounce), the elephants (a
// trumpet and a spray), the longtails (they roar off), the dolphins (they leap), the yacht (it spins), the clouds (a
// little rain), the rock towers (a splash) and the tiny plane (round the circuit).
//
// Talk (lines.ts, Dad and Sparkle, all recorded already): the first time, Dad asks "Where to, Captain?"; when she
// picks, "Pai!". After ~8 s with nothing done Sparkle says what's next: elephants or the boat, the elephants are
// waiting, tap the boat, or (both done) tap the plane to fly home. At most three times.
import { Group, IcosahedronGeometry, Mesh, OctahedronGeometry, Vector3, type WebGLRenderer } from 'three'
import { bell, clamp, speakingVoice, spendHint, type Line } from '../../../../../../sdk'
import { DEG } from '../../../../../../sdk/math'
import type { AnchorInfo } from '../../../../../engine3d/Anchors'
import type { Shot } from '../../../../../engine3d/camera'
import { blobShadow } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { L } from '../../../lines'
import { Stage, type AnchorSpot, type LegEvents } from '../../../trip/legs/stage'
import { circuitAt, circuitEase, CIRCUIT_S, departAt } from '../../../trip/map-plane'
import { Entrance, mapCamKnobs, puffCloud, skyTexture, trayBox } from '../../../trip/sky'
import { Floaters } from '../../nan-trip/mushrooms/fx'
import { buildDiorama, MONKEY_Y, PIN, type Diorama } from './diorama'
import { buildField, type Field } from './ground'
import {
  BOARD,
  BOAT_LOOPS,
  CLOUDS,
  DOLPHINS,
  HOME_AFTER,
  ll,
  PIN_IDS,
  PINS,
  PLACE_IDS,
  PLACE_PIN,
  PLACES,
  RUNWAY,
  SPOTS,
  STAMP_Y,
  STOP_PLACE,
  STOPS,
  YACHT,
  type PinId,
  type PlaceId,
  type SpotId,
  type Stop,
} from './layout'
import { mapBed, mapSfx as sfx } from './sounds'

export interface MapEvents extends LegEvents {
  /** She picked a place and the camera has dived in (the airport: the plane has flown off): that part of the trip opens. */
  go(place: 'chang' | 'pier' | 'airport'): void
  /** The camera has been moving behind the loading cover long enough: it can fade (KRABI_CAM.cover). */
  revealed(): void
}

/** The box the map's camera frames: the board, its tray (as diorama.ts builds it) and the mountains on it. */
const BOARD_BOX = trayBox(BOARD.x1 - BOARD.x0, BOARD.z1 - BOARD.z0, 0.07, 0.95, 0.2, 0.55)
export const KRABI_CAM = mapCamKnobs('krabi-map-cam', 'Krabi map camera', 'src/world/places/thailand/activities/boat-trip/map/map3d.ts', { yaw: 6, pitch: -8, zoom: 0.9 })

const SPOT_LABELS: Record<SpotId, string> = {
  aonang: 'Ao Nang beach',
  railay: "Railay's cliffs",
  chicken: 'Chicken Island',
  phiphi: 'Koh Phi Phi',
  lighthouse: "Koh Lanta's lighthouse",
  nail: 'Ko Tapu, the Nail Island',
}
const SPOT_IDS = Object.keys(SPOTS) as SpotId[]

export const MAP_ANCHORS: AnchorInfo[] = [
  ...PLACE_IDS.map((id): AnchorInfo => ({ id: `place:${id}`, label: PLACES[id].label, kind: 'thing' })),
  ...SPOT_IDS.map((id): AnchorInfo => ({ id: `spot:${id}`, label: SPOT_LABELS[id], kind: 'thing' })),
  ...PIN_IDS.map((id): AnchorInfo => ({ id: `pin:${id}`, label: PINS[id].label, kind: 'thing' })),
  { id: 'plane', label: 'Tiny plane', kind: 'thing' },
  { id: 'pierboat', label: 'Our longtail boat', kind: 'thing' },
  ...BOAT_LOOPS.map((_, i): AnchorInfo => ({ id: `boat:${i}`, label: 'Longtail boat', kind: 'thing' })),
  { id: 'elephants', label: 'Elephants', kind: 'thing' },
  { id: 'dolphins', label: 'Dolphins', kind: 'thing' },
  { id: 'yacht', label: 'Sailboat', kind: 'thing' },
  ...CLOUDS.map((_, i): AnchorInfo => ({ id: `cloud:${i}`, label: 'Cloud', kind: 'thing' })),
]

/** Nothing touched for this long: the place to go next glows. */
const STUCK_S = 5
/** A picked pin hops and spins this long before the camera dives; the dive lasts this long before that part of the
 *  trip opens (the plane's climb home a little longer). */
const HOP_S = 0.4
const DIVE_S = 1.5
const DEPART_S = 2.8
/** Nothing done for this long: Sparkle says what to do (again after SAY_EVERY, at most SAY_MAX times). */
const SAY_S = 8
const SAY_EVERY = 20
const SAY_MAX = 3

const tmp = new Vector3()

export class KrabiMap extends Stage {
  private d: Diorama
  private f: Field
  private done: Set<Stop>
  private fresh: Stop | null
  private arrived: { id: PlaceId; t: number } | null = null
  /** When each thing was last poked (seconds). */
  private pokeT = new Map<string, number>()
  /** The way home's pin popped up this long ago (-1: not yet). */
  private homeT = -1
  private planeT = -1
  private departT = -1
  private rain = CLOUDS.map(() => -1)
  private stampT = -1
  private boatA = BOAT_LOOPS.map((_, i) => i * 2.2)
  private later: { t: number; f: () => void }[] = []
  private sparkles: Floaters
  private drops: Floaters
  private foam: Floaters
  // ---- The sky round the board ----
  private entrance: Entrance
  private drifters: { root: Group; shadow: Mesh; speed: number; y: number }[] = []
  private under: Group[] = []
  /** What waits for the cover to go (the opening line, the stamp landing): [seconds after, what]. */
  private onShow: [number, () => void][] = []
  // ---- Talk ----
  private told = new Set<string>()
  private lastSay = -99
  private quietFrom = 3
  private sayN = 0

  constructor(renderer: WebGLRenderer, private ev: MapEvents, start: { been: Stop[]; from?: PlaceId | null }) {
    super(renderer, ev)
    this.bag.add({ dispose: mapBed() })
    const { scene, bag } = this
    this.scene.background = skyTexture(bag)
    this.rig.fov = 30
    this.rig.lag = 0.5
    this.entrance = new Entrance(KRABI_CAM, () => {
      ev.revealed()
      this.lastTouch = this.time
      for (const [t, f] of this.onShow.splice(0)) this.after(t, f)
    })
    this.f = buildField()
    this.d = buildDiorama(bag)
    scene.add(this.d.root)
    this.buildSky()
    this.sparkles = new Floaters(new OctahedronGeometry(0.5), [PAL.gold, PAL.hotpink, '#FFFFFF', PAL.mint], 140, bag, 0.6, 1.2)
    this.drops = new Floaters(new IcosahedronGeometry(0.5, 0), ['#A8DCFF', '#D6EEFF'], 80, bag, 2.2, 0.2)
    this.foam = new Floaters(new IcosahedronGeometry(0.5, 1), ['#FFFFFF', '#E9FBFF'], 90, bag, 0.6, 1.4)
    scene.add(this.sparkles.mesh, this.drops.mesh, this.foam.mesh)
    // ---- Where it starts: the places done so far (the one she just came back from: its stamp lands) ----
    this.done = new Set(start.been.filter((s) => (STOPS as readonly string[]).includes(s)))
    const last = start.been[start.been.length - 1]
    const from = start.from ?? (last ? STOP_PLACE[last] : null)
    this.fresh = last && from === STOP_PLACE[last] ? last : null
    for (const s of STOPS) this.d.stamps[s].visible = this.done.has(s) && s !== this.fresh
    if (this.fresh) this.onShow.push([0.7, () => this.landStamp()])
    // (The way home's pin pops up once the cover has gone, after the stamp.)
    if (this.open('airport')) this.onShow.push([this.fresh ? 1.5 : 0.5, () => this.showHome()])
    // ---- The opening line: Dad the first time; with both places done, Sparkle points at the plane home ----
    const t0 = this.fresh ? 1.6 : 0.6
    if (this.done.size === 0) this.onShow.push([t0, () => this.say('first', L.bay.whereTo)])
    else if (this.allDone) this.onShow.push([t0 + 0.6, () => this.say('home', L.home.fly)])
    // (Counted again from the reveal: the cover takes about KRABI_CAM.cover + fade.)
    this.quietFrom = t0 + 3 + KRABI_CAM.cover + KRABI_CAM.fade
  }

  // ---------------------------------------------------------------- talk

  private say(key: string, l: Line) {
    if (this.told.has(key)) return
    this.told.add(key)
    this.ev.say(l)
  }
  /** What Sparkle says when she's stuck: what's left to do. */
  private nudge(): Line {
    if (this.allDone) return L.home.fly
    if (this.done.size === 0) return L.chang.hint.fork
    return this.done.has('chang') ? L.chang.hint.boat : L.chang.waiting
  }
  private stuck() {
    if (this.arrived) return
    if (this.time - Math.max(this.lastTouch, this.quietFrom) < SAY_S || this.time - this.lastSay < SAY_EVERY || this.sayN >= SAY_MAX) return
    if (speakingVoice()) return
    this.lastSay = this.time
    this.sayN++
    const l = this.nudge()
    if (spendHint(l)) this.ev.say(l)
  }

  // ---------------------------------------------------------------- which places are open

  /** Can she go there now? The places she hasn't done; the airport after one. (Krabi Town is only to poke.) */
  private open(id: PlaceId) {
    if (id === 'town') return false
    if (id === 'airport') return this.done.size >= HOME_AFTER
    return !this.done.has(id === 'pier' ? 'bay' : 'chang')
  }
  private get allDone() {
    return this.done.size >= STOPS.length
  }

  // ---------------------------------------------------------------- picking a place

  private ground(x: number, z: number) {
    return Math.max(0, this.f.height(x, z))
  }

  /** She picked a place: its pin hops and spins in sparkles, then the camera dives in (the pier: the longtail revs off
   *  into the bay; Baan Chang: the elephants trumpet; the airport: the plane takes off for home). */
  private choose(id: PlaceId) {
    if (this.arrived || id === 'town') return
    this.arrived = { id, t: this.time }
    const pin = PLACE_PIN[id]
    if (pin) {
      this.poke(`pin:${pin}`)
      const p = this.d.pins[pin].root.position
      this.sparkles.burst(tmp.set(p.x, p.y + PIN.top * PIN.size * 0.6, p.z), 26, 0.6, 0.8, 0.8, 0.03)
    }
    sfx.zoom()
    sfx.chime()
    this.say('pai', L.bay.pai)
    this.rig.lag = 0.75
    if (id === 'airport') {
      this.after(HOP_S, () => {
        this.departT = 0
        this.planeT = -1
        sfx.takeoff()
      })
      this.after(HOP_S + DEPART_S, () => this.ev.go('airport'))
      return
    }
    this.after(HOP_S, () => sfx.dive())
    this.after(HOP_S - 0.1, () => (id === 'pier' ? sfx.rev() : sfx.trumpet()))
    this.after(HOP_S + DIVE_S, () => this.ev.go(id))
  }

  /** The way home opens: the plane's pin pops up over the airport. */
  private showHome() {
    if (this.homeT >= 0) return
    this.homeT = 0
    sfx.plip()
    const p = this.d.pins.home.root.position
    this.sparkles.burst(tmp.set(p.x, p.y + 0.2, p.z), 14, 0.5, 0.6, 0.6, 0.025)
  }

  // ---------------------------------------------------------------- the stamps, the pokes

  /** The newest stamp lands on its place: down from above, ka-chunk, sparkles. */
  private landStamp() {
    if (!this.fresh) return
    this.d.stamps[this.fresh].visible = true
    this.stampT = 0
  }

  private poked(id: string, after: number) {
    const k = this.time - (this.pokeT.get(id) ?? -99)
    return k < after ? k : -1
  }
  private poke(id: string) {
    this.pokeT.set(id, this.time)
  }

  /** A place she can't go to (yet, or any more): it bounces and answers. */
  private pokePlace(id: PlaceId) {
    this.poke(`place:${id}`)
    const stop = (Object.keys(STOP_PLACE) as Stop[]).find((s) => STOP_PLACE[s] === id)
    const stamp = stop ? this.d.stamps[stop] : null
    if (id === 'town') return sfx.town()
    if (stamp?.visible) {
      sfx.been()
      this.poke(`stamp:${stop}`)
      this.sparkles.burst(stamp.position.clone(), 12, 0.5, 0.6, 0.7, 0.025)
    } else sfx.bloop()
  }

  private pokeSpot(id: SpotId) {
    this.poke(`spot:${id}`)
    const [x, z] = SPOTS[id]
    switch (id) {
      case 'aonang':
        this.foam.burst(new Vector3(x + 0.3, this.ground(x, z) + 0.06, z + 0.03), 8, 0.3, 0.5, 0.4, 0.016)
        return sfx.twirl()
      case 'railay':
        this.poke('monkey')
        return sfx.monkey()
      case 'chicken':
        return sfx.cluck()
      case 'phiphi':
      case 'nail':
        this.foam.burst(new Vector3(x, 0.02, z + 0.12), 10, 0.4, 0.5, 0.5, 0.02)
        return sfx.splash(0.6)
      case 'lighthouse':
        return sfx.glow()
    }
  }

  /** The tiny plane takes off down the runway, loops round over the board, and lands again (or, the way home open,
   *  off it goes for home). */
  private fly() {
    if (this.open('airport')) return this.choose('airport')
    if (this.planeT >= 0) return
    this.planeT = 0
    sfx.takeoff()
  }

  private stepPlane(dt: number) {
    const p = this.d.plane
    const ground = this.ground(...RUNWAY.at) + 0.025
    if (this.departT >= 0) {
      this.departT += dt
      const a = departAt(RUNWAY, ground, this.departT)
      p.position.copy(a.at)
      p.rotation.set(0, a.yaw, a.pitch, 'YXZ')
      return
    }
    if (this.planeT >= 0) {
      this.planeT += dt
      if (this.planeT >= CIRCUIT_S) {
        this.planeT = -1
        sfx.thump()
      }
    }
    const at = circuitAt(RUNWAY, ground, circuitEase(this.planeT))
    p.position.copy(at.at)
    p.rotation.set(at.bank, at.yaw, 0, 'YXZ')
  }

  // ---------------------------------------------------------------- the frame

  protected step(dt: number, t: number) {
    if (this.arrived) this.entrance.finish()
    this.entrance.step(dt)
    this.stepSky(dt, t)
    this.d.sea.update(t)
    for (const l of this.later.filter((x) => x.t <= this.time)) {
      this.later.splice(this.later.indexOf(l), 1)
      if (!this.disposed) l.f()
    }
    this.stepPlane(dt)
    this.stepPlaces(dt, t)
    this.stepToys(dt, t)
    for (const f of [this.sparkles, this.drops, this.foam]) f.update(dt)
    this.stuck()
  }

  private stepPlaces(dt: number, t: number) {
    const d = this.d
    // ---- The places and the spots bounce when poked; the place to go next bobs when she's stuck ----
    const bounce = (g: Group, key: string, base: number, at: [number, number], hint: boolean) => {
      const k = Math.min(1, (this.time - (this.pokeT.get(key) ?? -9)) / 0.45)
      const b = bell(k)
      g.scale.set(1 + 0.08 * b, 1 - 0.12 * b + 0.12 * b * (k > 0.5 ? 1 : 0), 1 + 0.08 * b).multiplyScalar(base)
      g.position.y = this.ground(...at) + (hint ? Math.abs(Math.sin(t * 4)) * 0.04 : 0)
    }
    const hintId = this.time - this.lastTouch > STUCK_S ? this.hintPlace() : null
    for (const id of PLACE_IDS) bounce(d.places[id], `place:${id}`, PLACES[id].scale, PLACES[id].at, false)
    for (const id of SPOT_IDS) bounce(d.spots[id], `spot:${id}`, d.spots[id].userData.base ?? (d.spots[id].userData.base = d.spots[id].scale.x), SPOTS[id], false)
    // ---- The pins bob and face her; a poked one hops and its toy spins; the one she's stuck on bounces ----
    if (this.homeT >= 0) this.homeT += dt
    for (const id of PIN_IDS) {
      const pin = d.pins[id]
      const info = PINS[id]
      const place = info.place
      const stop = STOPS.find((s) => STOP_PLACE[s] === place)
      const g = pin.root
      // A stop's pin until it's done (then its stamp); the way home's once it's open.
      g.visible = stop ? !this.done.has(stop) : this.homeT >= 0
      if (!g.visible) continue
      const [x, z] = info.at
      const k = clamp((this.time - (this.pokeT.get(`pin:${id}`) ?? -9)) / 0.5, 0, 1)
      const hint = hintId === place
      const pop = place === 'airport' ? clamp(this.homeT / 0.4, 0, 1) : 1
      const picked = this.arrived?.id === place
      g.position.y = this.ground(x, z) + info.lift + Math.sin(t * 2.2 + x * 3) * 0.03 + bell(k) * 0.14 + (hint ? Math.abs(Math.sin(t * 4)) * 0.09 : 0)
      g.rotation.y = this.rig.yaw * DEG + Math.sin(t * 0.9 + x) * 0.25
      const b = bell(k)
      const size = PIN.size * (pop + bell(pop) * 0.25) * (picked ? 1 + 0.15 * clamp((this.time - this.arrived!.t) / HOP_S, 0, 1) : 1)
      g.scale.set(size * (1 + 0.1 * b), size * (1 - 0.12 * b + (k > 0.5 ? 0.12 * b : 0)), size * (1 + 0.1 * b))
      pin.mini.rotation.y = k < 1 ? k * k * (3 - 2 * k) * Math.PI * 2 : 0
      if (pin.spin) pin.spin.rotation.y = -t * (id === 'home' ? 1.6 : 2.4)
      const e = pin.elephant
      if (e) {
        const flap = Math.sin(t * 3 + x) * 0.3
        e.earL.rotation.y = -0.25 - flap
        e.earR.rotation.y = 0.25 + flap
        e.trunk.rotation.x = Math.sin(t * 1.6) * 0.3 - 0.4 - b * 1.2
      }
    }
    // ---- The stamps bob and turn; the newest one lands ----
    for (const s of STOPS) {
      const g = d.stamps[s]
      if (!g.visible) continue
      const [x, z] = PLACES[STOP_PLACE[s]].at
      const base = this.ground(x, z) + STAMP_Y
      const spin = clamp((this.time - (this.pokeT.get(`stamp:${s}`) ?? -9)) / 0.8, 0, 1)
      g.rotation.y = this.rig.yaw * DEG + Math.sin(t * 1.3 + x) * 0.25 + (spin < 1 ? spin * Math.PI * 2 : 0)
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
  }

  private stepToys(dt: number, t: number) {
    const d = this.d
    // ---- Clouds drift a little on their hills; a poked one rains ----
    for (const [i, c] of d.clouds.entries()) {
      const [lon, lat, cy] = CLOUDS[i]
      const [x, z] = ll(lon, lat)
      c.position.set(x + Math.sin(t * 0.3 + i * 2) * 0.08, cy + Math.sin(t * 0.7 + i) * 0.02, z + Math.cos(t * 0.25 + i) * 0.05)
      c.rotation.y = this.rig.yaw * DEG
      if (this.rain[i] >= 0) {
        this.rain[i] += dt
        const k = this.rain[i]
        c.scale.set(1 + 0.08 * bell(Math.min(1, k / 0.4)), 1 - 0.1 * bell(Math.min(1, k / 0.4)), 1)
        if (k < 1.6 && Math.random() < dt * 40) this.drops.emit(tmp.set(c.position.x + (Math.random() - 0.5) * 0.4, c.position.y - 0.08, c.position.z + (Math.random() - 0.5) * 0.25), new Vector3(0, -0.6, 0), 0.5, 0.012)
        if (k > 1.6) this.rain[i] = -1
      }
    }
    // ---- The longtails buzz round their loops with a foamy wake; poked, they roar round faster ----
    for (const [i, b] of d.boats.entries()) {
      const [lon, lat, rx, rz] = BOAT_LOOPS[i]
      const [cx, cz] = ll(lon, lat)
      const k = this.poked(`boat:${i}`, 2.4)
      const fast = k >= 0 ? 1 + 2.5 * bell(clamp(k / 2.4, 0, 1)) : 1
      this.boatA[i] += dt * 0.42 * fast * (i ? -1 : 1)
      const a = this.boatA[i]
      b.position.set(cx + Math.cos(a) * rx, 0.006 + Math.sin(t * 6 + i) * 0.004, cz + Math.sin(a) * rz)
      const s = i ? -1 : 1
      b.rotation.set(-0.06 * fast, Math.atan2(-Math.sin(a) * rx * s, Math.cos(a) * rz * s), 0)
      if (Math.random() < dt * 7 * fast) this.foam.emit(tmp.set(b.position.x - Math.sin(b.rotation.y) * 0.1, 0.012, b.position.z - Math.cos(b.rotation.y) * 0.1), new Vector3(0, 0.05, 0), 0.8, 0.012)
    }
    // ---- The family's longtail at the pier rocks; at the dive (the pier picked) it roars off into the bay ----
    {
      const b = d.pierBoat
      const [mx, mz] = PLACES.pier.at
      const off = this.arrived?.id === 'pier' ? Math.max(0, this.time - this.arrived.t - HOP_S) : 0
      const k = this.poked('pierboat', 0.6)
      b.position.set(mx - 0.56 - off * off * 0.5, 0.004 + (k >= 0 ? bell(k / 0.6) * 0.04 : 0), mz + 0.1)
      b.rotation.set(Math.sin(t * 1.7) * 0.04 - (off > 0 ? 0.08 : 0), -Math.PI / 2, Math.sin(t * 1.3) * 0.05)
      if (off > 0 && Math.random() < dt * 30) this.foam.emit(tmp.set(b.position.x + 0.1, 0.012, b.position.z), new Vector3(0.1, 0.1, 0), 0.8, 0.014)
    }
    // ---- Dolphins: they bob and hop now and then; poked, both leap high with a splash ----
    {
      const k = this.poked('dolphins', 1.5)
      d.dolphins.forEach((g, i) => {
        const small = clamp(((t + i * 2.3) % 6) - 4.6, 0, 1)
        const p = k >= 0 ? clamp((k - i * 0.22) / 1.1, 0, 1) : small
        const high = k >= 0 ? 0.28 : 0.1
        g.position.set(DOLPHINS[0] + (i ? 0.08 : -0.08), -0.015 + bell(p) * high, DOLPHINS[1] + (p > 0 && p < 1 ? (p - 0.5) * 0.25 : 0) + i * 0.05)
        g.rotation.set(p > 0 && p < 1 ? -1 + 2 * p : Math.sin(t * 1.6 + i * 2) * 0.1, 0, 0)
        if (p >= 1 && g.userData.in !== true) {
          g.userData.in = true
          this.foam.burst(g.position.clone().setY(0.01), 8, 0.4, 0.5, 0.5, 0.016)
        }
        if (p < 1) g.userData.in = false
      })
    }
    // ---- The yacht sails round, leaning in the wind; poked, it spins right round ----
    {
      const k = this.poked('yacht', 1.4)
      const a = -t * 0.16
      const y = d.yacht
      y.position.set(YACHT.at[0] + Math.cos(a) * YACHT.rx, 0.004 + Math.sin(t * 1.7) * 0.004, YACHT.at[1] + Math.sin(a) * YACHT.rz)
      y.rotation.set(0, Math.atan2(Math.sin(a) * YACHT.rx, -Math.cos(a) * YACHT.rz) + (k >= 0 ? (k / 1.4) * Math.PI * 2 : 0), 0.18 + Math.sin(t * 1.3) * 0.05)
    }
    // ---- Baan Chang's elephants: ears flap; poked (or the elephants picked), trunks up and a spray ----
    {
      const k = Math.max(this.poked('elephants', 2), this.arrived?.id === 'chang' ? this.time - this.arrived.t : -1)
      const up = k >= 0 ? bell(clamp(k / 1.8, 0, 1)) : 0
      d.elephants.forEach((e, i) => {
        const flap = Math.sin(t * (1.6 + up * 8) + i * 2) * (0.22 + up * 0.3)
        e.earL.rotation.y = -0.25 - flap
        e.earR.rotation.y = 0.25 + flap
        e.trunk.rotation.x = Math.sin(t * 1.2 + i * 5) * 0.12 - up * 1.9
        e.body.position.y = k >= 0 ? bell(clamp((k - i * 0.25) / 0.5, 0, 1)) * 0.12 : 0
      })
      if (k > 0.5 && k < 1.5 && Math.random() < dt * 20) {
        const p = d.elephants[0].trunk.getWorldPosition(tmp)
        this.drops.emit(tmp.set(p.x, p.y + 0.03, p.z), new Vector3((Math.random() - 0.5) * 0.2, 0.5, (Math.random() - 0.5) * 0.2), 0.7, 0.01)
      }
    }
    // ---- Railay's monkey hops; Chicken Island bobs its head; the lighthouse lamp turns ----
    {
      const k = this.poked('monkey', 1)
      const [rx, rz] = SPOTS.railay
      d.monkey.position.y = this.ground(rx, rz) + MONKEY_Y + (k >= 0 ? bell(clamp(k / 0.6, 0, 1)) * 0.12 : Math.abs(Math.sin(t * 2.2)) * 0.008)
      d.monkey.rotation.y = this.rig.yaw * DEG + (k >= 0 ? k * 6 : 0)
      const c = this.poked('spot:chicken', 1.2)
      d.chicken.rotation.z = c >= 0 ? Math.sin(c * 18) * 0.12 : Math.sin(t * 0.8) * 0.02
      // Ao Nang's sailfish leaps right over.
      const a = this.poked('spot:aonang', 0.9)
      d.sailfish.position.y = 0.03 + (a >= 0 ? bell(clamp(a / 0.9, 0, 1)) * 0.09 : 0)
      d.sailfish.rotation.z = -0.35 - (a >= 0 ? clamp(a / 0.9, 0, 1) * Math.PI * 2 : 0)
      const l = this.poked('spot:lighthouse', 6)
      d.beam.visible = l >= 0
      d.beam.rotation.y = t * 2.5
    }
    // ---- The rock towers she pokes wobble ----
    for (const [i, [x, z]] of d.karsts.entries()) {
      const k = this.poked(`karst:${i}`, 0.6)
      if (k >= 0 && k < dt * 1.5) this.foam.burst(new Vector3(x, 0.02, z), 8, 0.35, 0.4, 0.4, 0.016)
    }
  }

  // ---------------------------------------------------------------- touch

  private after(s: number, f: () => void) {
    this.later.push({ t: this.time + s, f })
  }

  /** Where a screen point meets the board (the ground's height under it, the sea's top over the water). */
  private groundAt(x: number, y: number) {
    const cam = this.rig.camera
    const n = this.ndc(x, y)
    const near = new Vector3(n.x, n.y, -1).unproject(cam)
    const dir = new Vector3(n.x, n.y, 1).unproject(cam).sub(near).normalize()
    if (dir.y > -1e-4) return null
    let h = 0.16
    let p = near.clone()
    for (let k = 0; k < 4; k++) {
      p = near.clone().addScaledVector(dir, (h - near.y) / dir.y)
      h = this.ground(clamp(p.x, BOARD.x0, BOARD.x1), clamp(p.z, BOARD.z0, BOARD.z1))
    }
    return p
  }

  private screenOf(v: Vector3) {
    const c = v.clone().project(this.rig.camera)
    return c.z > 1 ? null : { x: ((c.x + 1) / 2) * this.w, y: ((1 - c.y) / 2) * this.h }
  }

  protected onTap(id: string | null, x: number, y: number): void {
    if (this.arrived) return
    if (id === null) {
      // On the board near a place, a spot or a rock tower: as if she'd tapped it.
      const g = this.groundAt(x, y)
      if (!g) return
      for (const p of PLACE_IDS) if (Math.hypot(PLACES[p].at[0] - g.x, PLACES[p].at[1] - g.z) < 0.2) return this.onTap(`place:${p}`, x, y)
      for (const s of SPOT_IDS) if (Math.hypot(SPOTS[s][0] - g.x, SPOTS[s][1] - g.z) < 0.18) return this.onTap(`spot:${s}`, x, y)
      for (const [i, [kx, kz, s]] of this.d.karsts.entries())
        if (Math.hypot(kx - g.x, kz - g.z) < 0.1 * s + 0.04) {
          this.poke(`karst:${i}`)
          sfx.splash(0.5)
          return
        }
      return
    }
    if (id.startsWith('place:')) {
      const p = id.slice(6) as PlaceId
      if (p === 'airport') return this.fly()
      if (this.open(p)) this.choose(p)
      else this.pokePlace(p)
      return
    }
    if (id.startsWith('spot:')) return this.pokeSpot(id.slice(5) as SpotId)
    if (id.startsWith('pin:')) return this.onTap(`place:${PINS[id.slice(4) as PinId].place}`, x, y)
    if (id.startsWith('cloud:')) {
      const i = Number(id.slice(6))
      if (this.rain[i] < 0) this.rain[i] = 0
      sfx.rain()
      return
    }
    if (id.startsWith('boat:')) {
      this.poke(id)
      sfx.rev()
      return
    }
    switch (id) {
      case 'plane':
        return this.fly()
      case 'pierboat':
        // The boat still to go on: off to the pier. (Done: it just revs.)
        if (this.open('pier')) return this.choose('pier')
        this.poke('pierboat')
        return sfx.rev()
      case 'elephants':
        if (this.open('chang')) return this.choose('chang')
        this.poke('elephants')
        return sfx.trumpet()
      case 'dolphins':
        this.poke('dolphins')
        return sfx.dolphin()
      case 'yacht':
        this.poke('yacht')
        return sfx.twirl()
    }
  }

  // ---------------------------------------------------------------- camera, tap targets, hints

  protected shot(): Shot {
    if (this.arrived && this.time - this.arrived.t > HOP_S) {
      const id = this.arrived.id
      // Climbing away home: the camera rises after the plane.
      if (id === 'airport') {
        const p = this.d.plane.position
        return { center: p.clone(), half: new Vector3(0.5, 0.3, 0.5), yaw: KRABI_CAM.yaw, pitch: 40, minDist: 1.6 }
      }
      // Diving in: the pier's longtail, or Baan Chang's yard.
      const p = id === 'pier' ? this.d.pierBoat.position : this.d.places.chang.position
      return { center: p.clone().setY(p.y + 0.05), half: new Vector3(0.24, 0.1, 0.24), yaw: id === 'pier' ? -30 : 0, pitch: 30, minDist: 0.7 }
    }
    // The entrance (as on the Thailand map): from the plain view, turned by KRABI_CAM.yaw, down and in to where it
    // settles. The board and its tray, object-fit: contain, so it floats in the middle of the sky on any screen shape.
    const k = this.entrance.k
    const tall = this.w < this.h
    const zoom = 1 + (KRABI_CAM.zoom - 1) * k
    const { center, half } = BOARD_BOX
    if (tall) return { center: center.clone(), half: half.clone().multiplyScalar(zoom), yaw: KRABI_CAM.yaw, pitch: 64 + KRABI_CAM.pitch * k * 0.6, minDist: 3, objectFit: 'contain' }
    return { center: center.clone(), half: half.clone().multiplyScalar(zoom), yaw: KRABI_CAM.yaw, pitch: 56 + KRABI_CAM.pitch * k, minDist: 3, objectFit: 'contain' }
  }

  /** The entrance rides the camera exactly (no lag). */
  protected snap() {
    return this.entrance.running && !this.arrived
  }

  // ---------------------------------------------------------------- the sky round the board

  private buildSky() {
    const { scene, bag } = this
    // Clouds drifting high over the board, each with its shadow on the land or the sea.
    for (const [x, y, z, s] of [[-1.4, 1.5, -0.6, 0.55], [0.9, 1.65, 0.8, 0.48], [1.9, 1.55, -1.5, 0.42]]) {
      const root = puffCloud(bag, s)
      root.position.set(x, y, z)
      const shadow = blobShadow(0.3 * s, bag)
      scene.add(root, shadow)
      this.drifters.push({ root, shadow, speed: 0.04 + s * 0.03, y })
    }
    // Clouds below, round the tray: the board floats in the sky Sparkle's balloon flies through.
    const low: [number, number, number, number][] = [
      [-4.2, -1.0, -1.6, 1.7], [4.3, -1.2, -0.6, 1.9], [-4.4, -1.4, 1.9, 1.8], [4.1, -0.9, 2.4, 1.5],
      [-1.4, -1.5, 3.9, 2.0], [2.2, -1.3, -3.8, 1.7], [-3.4, -1.7, -3.6, 1.5], [3.6, -1.8, 4.0, 1.7], [0.6, -1.9, -4.3, 1.4],
    ]
    for (const [x, y, z, s] of low) {
      const c = puffCloud(bag, s)
      c.position.set(x, y, z)
      scene.add(c)
      this.under.push(c)
    }
  }

  private stepSky(dt: number, t: number) {
    const x0 = BOARD.x0 - 0.9
    const x1 = BOARD.x1 + 0.9
    for (const c of this.drifters) {
      const p = c.root.position
      p.x += c.speed * dt
      if (p.x > x1) p.x = x0
      p.y = c.y + Math.sin(t * 0.7 + c.speed * 90) * 0.04
      const g = this.ground(clamp(p.x, BOARD.x0, BOARD.x1), clamp(p.z, BOARD.z0, BOARD.z1))
      c.shadow.position.set(p.x, g + 0.012, p.z)
      c.shadow.visible = p.x > BOARD.x0 && p.x < BOARD.x1
      c.root.rotation.y = this.rig.yaw * DEG
    }
    this.under.forEach((c, i) => {
      c.position.y += Math.cos(t * 0.4 + i * 1.9) * 0.04 * dt
      c.rotation.y = this.rig.yaw * DEG
    })
  }

  /** The place the hint points at: a place she hasn't done (the elephants first), or, all done, the airport. */
  private hintPlace(): PlaceId | null {
    if (this.arrived) return null
    if (this.allDone) return 'airport'
    return this.done.has('chang') ? 'pier' : 'chang'
  }

  protected hintAt() {
    const id = this.hintPlace()
    const pin = id && PLACE_PIN[id]
    if (!pin) return null
    return this.d.pins[pin].root.position.clone().setY(this.d.pins[pin].root.position.y + PIN.top * PIN.size * 0.7)
  }

  protected anchorAt(id: string): AnchorSpot | null {
    if (this.arrived) return null
    const d = this.d
    const glow = (pid: PlaceId) => (this.time - this.lastTouch > STUCK_S && this.hintPlace() === pid) || (pid === 'airport' && this.allDone)
    if (id.startsWith('place:')) {
      const p = id.slice(6) as PlaceId
      const [x, z] = PLACES[p].at
      return { at: new Vector3(x, this.ground(x, z) + 0.12, z), r: p === 'town' ? 0.24 : 0.26, prio: 3, max: 150 }
    }
    if (id.startsWith('pin:')) {
      const pid = id.slice(4) as PinId
      const g = d.pins[pid].root
      const info = PINS[pid]
      if (!g.visible) return null
      // (Over the toys under it: the pin is what she taps.)
      return { at: g.position.clone().setY(g.position.y + PIN.top * PIN.size * 0.5), r: 0.26, prio: 6, max: 150, glow: glow(info.place) }
    }
    if (id.startsWith('spot:')) {
      const s = id.slice(5) as SpotId
      const [x, z] = SPOTS[s]
      const r = s === 'nail' || s === 'lighthouse' ? 0.12 : 0.18
      return { at: new Vector3(x, this.ground(x, z) + 0.12, z), r, prio: 2, max: 130 }
    }
    if (id.startsWith('cloud:')) return { at: d.clouds[Number(id.slice(6))].position.clone(), r: 0.26, prio: 1, max: 140 }
    if (id.startsWith('boat:')) return { at: d.boats[Number(id.slice(5))].position.clone().setY(0.05), r: 0.1, prio: 4, max: 100 }
    switch (id) {
      case 'plane':
        return { at: d.plane.position.clone(), r: 0.1, prio: 5, max: 100 }
      case 'pierboat':
        return { at: d.pierBoat.position.clone().setY(0.05), r: 0.11, prio: 4, max: 110 }
      case 'elephants':
        return { at: d.places.chang.position.clone().add(tmp.set(0.24, 0.12, 0.06)), r: 0.12, prio: 4, max: 110 }
      case 'dolphins':
        return { at: new Vector3(DOLPHINS[0], 0.08, DOLPHINS[1]), r: 0.16, prio: 3, max: 120 }
      case 'yacht':
        return { at: d.yacht.position.clone().setY(0.15), r: 0.14, prio: 3, max: 110 }
    }
    return null
  }

  qa() {
    const pt = (v: Vector3) => {
      const s = this.screenOf(v)
      return s ? [Math.round(s.x), Math.round(s.y)] : null
    }
    const places: Record<string, unknown> = {}
    const pins: Record<string, unknown> = {}
    for (const id of PLACE_IDS) {
      const [x, z] = PLACES[id].at
      places[id] = pt(new Vector3(x, this.ground(x, z) + 0.15, z))
    }
    for (const id of PIN_IDS) if (this.d.pins[id].root.visible) pins[id] = pt(this.d.pins[id].root.position)
    return {
      game: 'krabi-map',
      been: [...this.done],
      open: PLACE_IDS.filter((p) => this.open(p)),
      arrived: this.arrived?.id ?? null,
      plane: this.planeT >= 0 || this.departT >= 0,
      touches: this.touches,
      points: { places, pins },
    }
  }
}

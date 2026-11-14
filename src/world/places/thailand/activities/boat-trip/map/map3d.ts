// The Krabi map (section `map`; notes: planning/around-the-world/thailand/krabi-map.md): the boat trip's hub, a toy
// diorama of Krabi and Phang Nga Bay floating in the sky like the Thailand map and the Nan map (diorama.ts; the sky,
// the tray and the entrance are trip/sky.ts). It opens like them: the camera is already moving behind the loading cover,
// then settles lower and closer (KRABI_CAM, ?feel=1). North is up the screen.
//
// The toy: the little pink songthaew is a toy on the board's roads. Tap a place and it drives there (beep, its diesel
// putters), and when it gets there the camera dives in and that part of the trip opens: Baan Chang (the elephants) or
// the pier (the family's longtail revs off into the bay). Or grab the songthaew and pull it: it follows her finger
// along the roads, and let go at a place (or hold it still there a moment) to go. The places she's done wear a pink
// stamp; the newest one lands with a ka-chunk when she comes back. After one place the airport opens too (the way
// home): the songthaew drives there, the tiny plane takes off down the runway and climbs away, and the trip ends.
// Krabi Town (where the roads meet) is on the way, not a stop.
//
// Things to poke: Ao Nang's beach (the umbrellas twirl), Railay's cliffs (the monkey hops and chatters), Chicken Island
// (it clucks and bobs), Koh Phi Phi, Koh Lanta's huts and its lighthouse (the lamp comes on and turns), Khao Phanom
// Bencha (its waterfall splashes, its cloud rains), Ko Tapu and Ko Panyee's stilt village (a cheer from the pitch), the
// giant crab in Krabi Town (it waves its big claw), the elephants (a trumpet and a spray), the longtails (they roar
// off), the ferry (toot toot), the dolphins (they leap), the turtle (it dives), the sea eagle (it swoops), the clouds
// (a little rain), the rock towers (a wobble), the tiny plane (round the circuit) and the songthaew itself.
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
import { buildNet, nearest, route, STEP } from '../../../trip/net'
import { Entrance, mapCamKnobs, puffCloud, skyTexture, trayBox } from '../../../trip/sky'
import { knobs } from '../../../../../kit/knobs'
import { Floaters } from '../../nan-trip/mushrooms/fx'
import { buildDiorama, type Diorama } from './diorama'
import { buildField, type Field } from './ground'
import {
  BOARD,
  BOAT_LOOPS,
  CLOUDS,
  DOLPHINS,
  EAGLE,
  FERRY,
  HOME_AFTER,
  ll,
  PLACE_IDS,
  PLACES,
  ROADS,
  RUNWAY,
  SPOTS,
  STAMP_Y,
  STOP_PLACE,
  STOPS,
  TURTLE,
  WHALE,
  YACHT,
  type PlaceId,
  type SpotId,
  type Stop,
} from './layout'
import { mapBed, mapSfx as sfx } from './sounds'

export interface MapEvents extends LegEvents {
  /** The songthaew got to the place she picked (the airport: the plane has flown off): that part of the trip opens. */
  go(place: 'chang' | 'pier' | 'airport'): void
  /** The camera has been moving behind the loading cover long enough: it can fade (KRABI_CAM.cover). */
  revealed(): void
}

/** The box the map's camera frames: the board, its tray (as diorama.ts builds it) and the mountains on it. */
const BOARD_BOX = trayBox(BOARD.x1 - BOARD.x0, BOARD.z1 - BOARD.z0, 0.07, 0.75, 0.2, 0.55)
export const KRABI_CAM = mapCamKnobs('krabi-map-cam', 'Krabi map camera', 'src/world/places/thailand/activities/boat-trip/map/map3d.ts', { yaw: 6, pitch: -8, zoom: 0.9 })

const SPOT_LABELS: Record<SpotId, string> = {
  aonang: 'Ao Nang beach',
  railay: "Railay's cliffs",
  chicken: 'Chicken Island',
  phiphi: 'Koh Phi Phi',
  lanta: 'Koh Lanta',
  lighthouse: "Koh Lanta's lighthouse",
  bencha: 'Khao Phanom Bencha, the waterfall',
  nail: 'Ko Tapu, the Nail Island',
  panyee: "Ko Panyee's floating football pitch",
}
const SPOT_IDS = Object.keys(SPOTS) as SpotId[]

export const MAP_ANCHORS: AnchorInfo[] = [
  { id: 'car', label: 'The songthaew (beep beep!)', kind: 'thing' },
  ...PLACE_IDS.map((id): AnchorInfo => ({ id: `place:${id}`, label: PLACES[id].label, kind: 'thing' })),
  ...SPOT_IDS.map((id): AnchorInfo => ({ id: `spot:${id}`, label: SPOT_LABELS[id], kind: 'thing' })),
  ...STOPS.map((s): AnchorInfo => ({ id: `marker:${s}`, label: s === 'chang' ? 'To the elephants' : 'To the boat', kind: 'thing' })),
  { id: 'plane', label: 'Tiny plane', kind: 'thing' },
  { id: 'pierboat', label: 'Our longtail boat', kind: 'thing' },
  ...BOAT_LOOPS.map((_, i): AnchorInfo => ({ id: `boat:${i}`, label: 'Longtail boat', kind: 'thing' })),
  { id: 'ferry', label: 'The ferry', kind: 'thing' },
  { id: 'elephants', label: 'Elephants', kind: 'thing' },
  { id: 'crab', label: 'The giant crab', kind: 'thing' },
  { id: 'dolphins', label: 'Dolphins', kind: 'thing' },
  { id: 'turtle', label: 'Sea turtle', kind: 'thing' },
  { id: 'whale', label: 'Whale shark', kind: 'thing' },
  { id: 'yacht', label: 'Sailboat', kind: 'thing' },
  { id: 'eagle', label: 'Sea eagle', kind: 'thing' },
  ...CLOUDS.map((_, i): AnchorInfo => ({ id: `cloud:${i}`, label: 'Cloud', kind: 'thing' })),
]

/** How the songthaew answers her finger (the feel lab, ?feel=1): read live every frame. */
export const KRABI_DRIVE = knobs('krabi-map-drive', 'Krabi map songthaew', 'src/world/places/thailand/activities/boat-trip/map/map3d.ts', {
  speed: { value: 1.6, min: 0.5, max: 4, step: 0.1, label: 'Drive speed', unit: 'm/s', note: 'how fast it drives to a place she tapped (a long way goes a little faster, to get there in about 2.6 s)' },
  drag: { value: 3.2, min: 1, max: 6, step: 0.1, label: 'Drag speed', unit: 'm/s', note: 'how fast it catches up with her finger while she pulls it' },
  grab: { value: 80, min: 40, max: 160, step: 5, label: 'Grab reach', unit: 'px', note: 'how near the songthaew her finger has to land to pick it up' },
  snap: { value: 0.5, min: 0.1, max: 1.2, step: 0.05, label: 'Road reach', unit: 'm', note: 'how far off the road her finger can be and still pull it along' },
  dwell: { value: 0.8, min: 0.2, max: 2.5, step: 0.05, label: 'Hold to go', unit: 's', note: "held still at the pier (a road's end) this long while she holds it: off it goes" },
})

/** Nothing touched for this long: the place to go next glows. */
const STUCK_S = 5
/** The camera dives in this long before that part of the trip opens (the plane's climb home a little longer). */
const DIVE_S = 1.2
const DEPART_S = 2.8
/** Nothing done for this long: Sparkle says what to do (again after SAY_EVERY, at most SAY_MAX times). */
const SAY_S = 8
const SAY_EVERY = 20
const SAY_MAX = 3

const tmp = new Vector3()

export class KrabiMap extends Stage {
  private d: Diorama
  private f: Field
  private net = buildNet(PLACES, ROADS)
  private done: Set<Stop>
  private fresh: Stop | null
  private car = { path: [0], k: 0, speed: 0, heading: 0, hop: 1, flash: 0, putT: 0, lift: 0 }
  private going: PlaceId | null = null
  private arrived: { id: PlaceId; t: number } | null = null
  private held = false
  private finger = { x: 0, y: 0 }
  private target = -1
  private dwell = 0
  private counted = false
  /** When each thing was last poked (seconds). */
  private pokeT = new Map<string, number>()
  private planeT = -1
  private departT = -1
  private rain = CLOUDS.map(() => -1)
  private stampT = -1
  private boatA = BOAT_LOOPS.map((_, i) => i * 2.2)
  private ferryK = 0
  private eagleA = 0
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
    this.d = buildDiorama(bag, this.net)
    scene.add(this.d.root)
    this.buildSky()
    this.sparkles = new Floaters(new OctahedronGeometry(0.5), [PAL.gold, PAL.hotpink, '#FFFFFF', PAL.mint], 140, bag, 0.6, 1.2)
    this.drops = new Floaters(new IcosahedronGeometry(0.5, 0), ['#A8DCFF', '#D6EEFF'], 80, bag, 2.2, 0.2)
    this.foam = new Floaters(new IcosahedronGeometry(0.5, 1), ['#FFFFFF', '#E9FBFF'], 90, bag, 0.6, 1.4)
    scene.add(this.sparkles.mesh, this.drops.mesh, this.foam.mesh)
    // ---- Where it starts: the places done so far, and the songthaew where she came back from (or at the airport). ----
    this.done = new Set(start.been.filter((s) => (STOPS as readonly string[]).includes(s)))
    const last = start.been[start.been.length - 1]
    const from = start.from ?? (last ? STOP_PLACE[last] : null) ?? 'airport'
    this.fresh = last && from === STOP_PLACE[last] ? last : null
    const at = this.net.place[from]
    this.car.path = [at]
    const n = this.net.nbr[at][0]
    if (n !== undefined) this.car.heading = Math.atan2(this.net.pts[at][0] - this.net.pts[n][0], this.net.pts[at][1] - this.net.pts[n][1]) - Math.PI / 2
    for (const s of STOPS) this.d.stamps[s].visible = this.done.has(s) && s !== this.fresh
    if (this.fresh) this.onShow.push([0.7, () => this.landStamp()])
    // (Back from the boat, the longtail is back at the pier; still to go, it waits there too.)
    this.placeCar(0)
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
    if (this.held || this.going || this.arrived) return
    if (this.time - Math.max(this.lastTouch, this.quietFrom) < SAY_S || this.time - this.lastSay < SAY_EVERY || this.sayN >= SAY_MAX) return
    if (speakingVoice()) return
    this.lastSay = this.time
    this.sayN++
    const l = this.nudge()
    if (spendHint(l)) this.ev.say(l)
  }

  // ---------------------------------------------------------------- which places are open

  /** Can she go there now? The places she hasn't done; the airport after one. (Krabi Town is on the way, never a stop.) */
  private open(id: PlaceId) {
    if (id === 'town') return false
    if (id === 'airport') return this.done.size >= HOME_AFTER
    return !this.done.has(id === 'pier' ? 'bay' : 'chang')
  }
  private get allDone() {
    return this.done.size >= STOPS.length
  }

  // ---------------------------------------------------------------- the songthaew

  private ground(x: number, z: number) {
    return Math.max(0, this.f.height(x, z))
  }
  /** The road point it's on (or just passed). */
  private get at() {
    const p = this.car.path
    return p[Math.min(p.length - 1, Math.round(this.car.k))]
  }
  private carPos(out = new Vector3()) {
    const { path, k } = this.car
    const i = Math.min(path.length - 1, Math.floor(k))
    const j = Math.min(path.length - 1, i + 1)
    const fr = k - i
    const a = this.net.pts[path[i]]
    const b = this.net.pts[path[j]]
    const x = a[0] + (b[0] - a[0]) * fr
    const z = a[1] + (b[1] - a[1]) * fr
    return out.set(x, this.ground(x, z) + 0.012, z)
  }

  /** Off along the roads to a place (from the map). */
  private goTo(id: PlaceId) {
    const node = this.net.place[id]
    if (this.at === node && this.car.path.length <= 1) return this.arrive(id)
    this.car.path = route(this.net, this.at, node)
    this.car.k = 0
    this.car.speed = Math.max(KRABI_DRIVE.speed, (this.car.path.length * STEP) / 2.6)
    if (!this.going) {
      sfx.pullaway()
      this.say(`pai:${id}`, L.bay.pai)
    }
    this.going = id
    this.car.hop = 0
    sfx.zoom()
  }

  /** It's there: a hop and sparkles, and the camera dives in (the pier: the longtail revs off into the bay; the airport:
   *  the plane takes off for home). */
  private arrive(id: PlaceId) {
    if (this.arrived || id === 'town') return
    this.going = null
    this.held = false
    this.arrived = { id, t: this.time }
    this.car.hop = 0
    this.car.flash = 0.6
    sfx.horn()
    const p = this.carPos()
    this.sparkles.burst(p.setY(p.y + 0.1), 24, 0.6, 0.8, 0.8, 0.03)
    this.rig.lag = 0.75
    if (id === 'airport') {
      this.departT = 0
      this.planeT = -1
      this.after(0.4, () => sfx.takeoff())
      this.after(DEPART_S, () => this.ev.go('airport'))
      return
    }
    this.after(0.3, () => sfx.dive())
    if (id === 'pier') this.after(0.2, () => sfx.rev())
    else this.after(0.2, () => sfx.trumpet())
    this.after(DIVE_S, () => this.ev.go(id))
  }

  private stepCar(dt: number, t: number) {
    const c = this.car
    // ---- Her finger pulls it along the roads ----
    if (this.held && !this.arrived) {
      const g = this.groundAt(this.finger.x, this.finger.y)
      const n = g ? nearest(this.net, g.x, g.z) : null
      if (n && n.d < KRABI_DRIVE.snap && n.i !== this.target) {
        this.target = n.i
        c.path = route(this.net, this.at, n.i)
        c.k = 0
        c.speed = KRABI_DRIVE.drag
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
      // (The songthaew's model faces +x.)
      const want = Math.atan2(dx, dz) - Math.PI / 2
      c.heading += Math.atan2(Math.sin(want - c.heading), Math.cos(want - c.heading)) * Math.min(1, dt * 14)
    }
    // ---- Held still at a place she can go to: off it goes ----
    const here = this.placeHere()
    // (Only at a road's end: Baan Chang is on the way to the pier, so passing it slowly doesn't stop there.)
    if (this.held && here && here !== 'airport' && this.net.nbr[this.net.place[here]].length <= 1 && c.path.length <= 1) {
      this.dwell += dt
      if (this.dwell > KRABI_DRIVE.dwell) this.arrive(here)
    } else this.dwell = 0
    c.lift += ((this.held ? 1 : 0) - c.lift) * Math.min(1, dt * 10)
    c.hop = Math.min(1, c.hop + dt / 0.45)
    c.flash = Math.max(0, c.flash - dt)
    this.placeCar(t)
  }

  /** An open place right where the songthaew is (null: none). */
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
    o.root.position.y += c.lift * 0.08 + bell(c.hop) * 0.1
    o.root.rotation.y = c.heading
    const moving = c.path.length > 1
    o.body.position.y = moving ? Math.abs(Math.sin(t * 16)) * 0.25 : 0
    o.body.rotation.x = c.lift * Math.sin(t * 9) * 0.06
    for (const w of o.wheels) if (moving) w.rotation.z -= 0.4
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
    if (id === 'airport') return this.fly()
    if (id === 'town') {
      this.poke('crab')
      sfx.crab()
      return
    }
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
      case 'lanta':
        return sfx.chime()
      case 'bencha':
        if (this.rain[0] < 0) this.rain[0] = 0
        return sfx.splosh()
      case 'panyee':
        return sfx.chime()
    }
  }

  /** The tiny plane takes off down the runway, loops round over the board, and lands again (or, the way home open,
   *  the songthaew drives there). */
  private fly() {
    if (this.open('airport')) return this.goTo('airport')
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
    if (this.arrived || this.going || this.held) this.entrance.finish()
    this.entrance.step(dt)
    this.stepSky(dt, t)
    this.d.sea.update(t)
    for (const l of this.later.filter((x) => x.t <= this.time)) {
      this.later.splice(this.later.indexOf(l), 1)
      if (!this.disposed) l.f()
    }
    this.stepCar(dt, t)
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
    for (const id of PLACE_IDS) bounce(d.places[id], `place:${id}`, PLACES[id].scale, PLACES[id].model, hintId === id)
    for (const id of SPOT_IDS) bounce(d.spots[id], `spot:${id}`, d.spots[id].userData.base ?? (d.spots[id].userData.base = d.spots[id].scale.x), SPOTS[id], false)
    // ---- The floating friends bob and turn over the places still to do (the one she's stuck on bounces higher) ----
    for (const s of STOPS) {
      const g = d.markers[s]
      g.visible = !this.done.has(s) && this.arrived?.id !== STOP_PLACE[s]
      if (!g.visible) continue
      const [x, z] = PLACES[STOP_PLACE[s]].model
      const k = Math.min(1, (this.time - (this.pokeT.get(`place:${STOP_PLACE[s]}`) ?? -9)) / 0.5)
      g.position.y = this.ground(x, z) + STAMP_Y + Math.sin(t * 2.2 + x * 3) * 0.035 + bell(k) * 0.12 + (hintId === STOP_PLACE[s] ? Math.abs(Math.sin(t * 4)) * 0.08 : 0)
      g.rotation.y = this.rig.yaw * DEG + Math.sin(t * 0.9 + x) * 0.5
      const e = g.userData.toy as { trunk: Group; earL: Group; earR: Group } | undefined
      if (e) {
        const flap = Math.sin(t * 3 + x) * 0.3
        e.earL.rotation.y = -0.25 - flap
        e.earR.rotation.y = 0.25 + flap
        e.trunk.rotation.x = Math.sin(t * 1.6) * 0.3 - 0.4
      }
    }
    // ---- The stamps bob and turn; the newest one lands ----
    for (const s of STOPS) {
      const g = d.stamps[s]
      if (!g.visible) continue
      const [x, z] = PLACES[STOP_PLACE[s]].model
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
      const [mx, mz] = PLACES.pier.model
      const off = this.arrived?.id === 'pier' ? Math.max(0, this.time - this.arrived.t - 0.2) : 0
      const k = this.poked('pierboat', 0.6)
      b.position.set(mx - 0.56 - off * off * 0.5, 0.004 + (k >= 0 ? bell(k / 0.6) * 0.04 : 0), mz + 0.1)
      b.rotation.set(Math.sin(t * 1.7) * 0.04 - (off > 0 ? 0.08 : 0), -Math.PI / 2, Math.sin(t * 1.3) * 0.05)
      if (off > 0 && Math.random() < dt * 30) this.foam.emit(tmp.set(b.position.x + 0.1, 0.012, b.position.z), new Vector3(0.1, 0.1, 0), 0.8, 0.014)
    }
    // ---- The ferry chugs round its run to Phi Phi and Lanta; poked, it toots and bobs ----
    {
      const ferry = d.ferry
      const n = FERRY.length
      this.ferryK = (this.ferryK + dt * 0.09) % n
      const i = Math.floor(this.ferryK)
      const fr = this.ferryK - i
      const p0 = FERRY[(i - 1 + n) % n]
      const p1 = FERRY[i]
      const p2 = FERRY[(i + 1) % n]
      const p3 = FERRY[(i + 2) % n]
      const cr = (a: number, b: number, c: number, e: number) => 0.5 * (2 * b + (-a + c) * fr + (2 * a - 5 * b + 4 * c - e) * fr * fr + (-a + 3 * b - 3 * c + e) * fr * fr * fr)
      const x = cr(p0[0], p1[0], p2[0], p3[0])
      const z = cr(p0[1], p1[1], p2[1], p3[1])
      const dx = x - ferry.position.x
      const dz = z - ferry.position.z
      const k = this.poked('ferry', 0.8)
      ferry.position.set(x, 0.004 + (k >= 0 ? bell(k / 0.8) * 0.05 : Math.sin(t * 1.5) * 0.004), z)
      if (Math.hypot(dx, dz) > 1e-5) ferry.rotation.y = Math.atan2(dx, dz)
      if (Math.random() < dt * 5) this.foam.emit(tmp.set(x - Math.sin(ferry.rotation.y) * 0.18, 0.012, z - Math.cos(ferry.rotation.y) * 0.18), new Vector3(0, 0.04, 0), 1, 0.014)
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
    // ---- The turtle paddles round off Lanta; poked, it dives and pops back up ----
    {
      const k = this.poked('turtle', 2)
      const g = d.turtle
      const a = t * 0.25
      const dive = k >= 0 ? bell(clamp(k / 1.6, 0, 1)) : 0
      g.root.position.set(TURTLE[0] + Math.cos(a) * 0.18, Math.sin(t * 1.4) * 0.004 - dive * 0.12, TURTLE[1] + Math.sin(a) * 0.12)
      g.root.rotation.set(0, Math.atan2(-Math.sin(a) * 0.18, Math.cos(a) * 0.12), 0)
      const paddle = Math.sin(t * (k >= 0 ? 12 : 3)) * 0.5
      g.flipL.rotation.y = paddle
      g.flipR.rotation.y = -paddle
    }
    // ---- The whale shark cruises slowly round the open sea, tail swinging; poked, it dives and comes up with a splash ----
    {
      const k = this.poked('whale', 2.4)
      const w = d.whale
      const a = t * 0.12
      const dive = k >= 0 ? bell(clamp(k / 2, 0, 1)) : 0
      w.root.position.set(WHALE.at[0] + Math.cos(a) * WHALE.rx, -0.012 - dive * 0.1 + Math.sin(t * 0.9) * 0.004, WHALE.at[1] + Math.sin(a) * WHALE.rz)
      w.root.rotation.set(k >= 0 ? Math.sin(clamp(k / 2, 0, 1) * Math.PI * 2) * 0.4 : 0, Math.atan2(-Math.sin(a) * WHALE.rx, Math.cos(a) * WHALE.rz), 0)
      w.tail.rotation.y = Math.sin(t * (k >= 0 ? 7 : 2.2)) * 0.45
      if (k >= 0 && k < dt * 1.5) this.foam.burst(w.root.position.clone().setY(0.012), 14, 0.5, 0.6, 0.6, 0.02)
    }
    // ---- The yacht sails round, leaning in the wind; poked, it spins right round ----
    {
      const k = this.poked('yacht', 1.4)
      const a = -t * 0.16
      const y = d.yacht
      y.position.set(YACHT.at[0] + Math.cos(a) * YACHT.rx, 0.004 + Math.sin(t * 1.7) * 0.004, YACHT.at[1] + Math.sin(a) * YACHT.rz)
      y.rotation.set(0, Math.atan2(Math.sin(a) * YACHT.rx, -Math.cos(a) * YACHT.rz) + (k >= 0 ? (k / 1.4) * Math.PI * 2 : 0), 0.18 + Math.sin(t * 1.3) * 0.05)
    }
    // ---- The sea eagle circles high over the bay; poked, it swoops down to the water and back up ----
    {
      const k = this.poked('eagle', 2)
      const swoop = k >= 0 ? bell(clamp(k / 2, 0, 1)) : 0
      this.eagleA += dt * (0.35 + swoop * 0.6)
      const a = this.eagleA
      const e = d.eagle
      e.root.position.set(EAGLE.at[0] + Math.cos(a) * EAGLE.r, EAGLE.y - swoop * 0.85 + Math.sin(t * 1.1) * 0.03, EAGLE.at[1] + Math.sin(a) * EAGLE.r * 0.7)
      e.root.rotation.set(0, Math.atan2(-Math.sin(a) * EAGLE.r, Math.cos(a) * EAGLE.r * 0.7), -0.3)
      const flap = swoop > 0.1 ? Math.sin(t * 14) * 0.6 : Math.sin(t * 2) * 0.12
      e.wingL.rotation.z = flap
      e.wingR.rotation.z = -flap
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
    // ---- The crab waves its big claw (a lot, when poked) ----
    {
      const k = this.poked('crab', 1.6)
      d.crab.claw.rotation.z = k >= 0 ? Math.sin(k * 14) * 0.6 : Math.sin(t * 1.4) * 0.2
      d.crab.root.position.y = this.ground(d.crab.root.position.x, d.crab.root.position.z) + (k >= 0 ? bell(clamp(k / 0.5, 0, 1)) * 0.04 : 0)
    }
    // ---- Railay's monkey hops; Chicken Island bobs its head; the lighthouse lamp turns ----
    {
      const k = this.poked('monkey', 1)
      const [rx, rz] = SPOTS.railay
      d.monkey.position.y = this.ground(rx, rz) + 0.36 + (k >= 0 ? bell(clamp(k / 0.6, 0, 1)) * 0.12 : Math.abs(Math.sin(t * 2.2)) * 0.008)
      d.monkey.rotation.y = this.rig.yaw * DEG + (k >= 0 ? k * 6 : 0)
      const c = this.poked('spot:chicken', 1.2)
      d.chicken.rotation.z = c >= 0 ? Math.sin(c * 18) * 0.12 : Math.sin(t * 0.8) * 0.02
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
    const onCar = id === 'car' || (!id && !!s && Math.hypot(s.x - x, s.y - y) < KRABI_DRIVE.grab)
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
    // Let go at a place she can go to: off it goes. Let go while the songthaew is still catching up with her finger: it
    // goes where she let go, once it gets there.
    const here = this.placeHere()
    if (here && !this.arrived) return this.arrive(here)
    const end = this.car.path[this.car.path.length - 1]
    const to = PLACE_IDS.find((p) => this.net.place[p] === end && this.open(p))
    if (to && this.car.path.length > 1) this.going = to
  }

  protected onTap(id: string | null, x: number, y: number): void {
    if (this.arrived) return
    if (id === null) {
      // On the board near a place, a spot or a rock tower: as if she'd tapped it.
      const g = this.groundAt(x, y)
      if (!g) return
      for (const p of PLACE_IDS) if (Math.hypot(PLACES[p].model[0] - g.x, PLACES[p].model[1] - g.z) < 0.2) return this.onTap(`place:${p}`, x, y)
      for (const s of SPOT_IDS) if (Math.hypot(SPOTS[s][0] - g.x, SPOTS[s][1] - g.z) < 0.18) return this.onTap(`spot:${s}`, x, y)
      for (const [i, [kx, kz, s]] of this.d.karsts.entries())
        if (Math.hypot(kx - g.x, kz - g.z) < 0.1 * s + 0.04) {
          this.poke(`karst:${i}`)
          sfx.bloop()
          return
        }
      return
    }
    if (id === 'car') {
      this.car.hop = 0
      this.car.flash = 0.6
      sfx.horn()
      return
    }
    if (id.startsWith('place:')) {
      const p = id.slice(6) as PlaceId
      if (this.open(p)) this.goTo(p)
      else this.pokePlace(p)
      return
    }
    if (id.startsWith('spot:')) return this.pokeSpot(id.slice(5) as SpotId)
    if (id.startsWith('marker:')) return this.onTap(`place:${STOP_PLACE[id.slice(7) as Stop]}`, x, y)
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
        if (this.open('pier')) return this.goTo('pier')
        this.poke('pierboat')
        return sfx.rev()
      case 'elephants':
        if (this.open('chang')) return this.goTo('chang')
        this.poke('elephants')
        return sfx.trumpet()
      case 'ferry':
        this.poke('ferry')
        return sfx.toot()
      case 'crab':
        this.poke('crab')
        this.poke('place:town')
        return sfx.crab()
      case 'dolphins':
        this.poke('dolphins')
        return sfx.dolphin()
      case 'turtle':
        this.poke('turtle')
        return sfx.plop()
      case 'whale':
        this.poke('whale')
        return sfx.splash(1.1)
      case 'yacht':
        this.poke('yacht')
        return sfx.twirl()
      case 'eagle':
        this.poke('eagle')
        return sfx.eagle()
    }
  }

  // ---------------------------------------------------------------- camera, tap targets, hints

  protected shot(): Shot {
    if (this.arrived) {
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
    if (this.arrived || this.going || this.held) return null
    if (this.allDone) return 'airport'
    return this.done.has('chang') ? 'pier' : 'chang'
  }

  protected hintAt() {
    const id = this.hintPlace()
    if (!id) return null
    const [x, z] = PLACES[id].model
    return new Vector3(x, this.ground(x, z) + 0.2, z)
  }

  protected anchorAt(id: string): AnchorSpot | null {
    if (this.arrived) return null
    const d = this.d
    const glow = (pid: PlaceId) => (this.time - this.lastTouch > STUCK_S && this.hintPlace() === pid) || (pid === 'airport' && this.allDone)
    // (Over everything: it's the toy she grabs.)
    if (id === 'car') return { at: this.carPos().setY(d.car.root.position.y + 0.08), r: 0.16, prio: 6, max: 110 }
    if (id.startsWith('place:')) {
      const p = id.slice(6) as PlaceId
      const [x, z] = PLACES[p].model
      // (Where a friend floats over it, the friend glows instead.)
      const marked = (Object.keys(STOP_PLACE) as Stop[]).some((st) => STOP_PLACE[st] === p && d.markers[st].visible)
      return { at: new Vector3(x, this.ground(x, z) + 0.15, z), r: p === 'town' ? 0.24 : 0.26, prio: 3, max: 150, glow: glow(p) && !marked }
    }
    if (id.startsWith('marker:')) {
      const g = d.markers[id.slice(7) as Stop]
      return g.visible ? { at: g.position.clone(), r: 0.13, prio: 4, max: 120, glow: glow(STOP_PLACE[id.slice(7) as Stop]) } : null
    }
    if (id.startsWith('spot:')) {
      const s = id.slice(5) as SpotId
      const [x, z] = SPOTS[s]
      const r = s === 'bencha' ? 0.3 : s === 'nail' || s === 'lighthouse' ? 0.12 : 0.18
      return { at: new Vector3(x, this.ground(x, z) + 0.12, z), r, prio: 2, max: 130 }
    }
    if (id.startsWith('cloud:')) return { at: d.clouds[Number(id.slice(6))].position.clone(), r: 0.26, prio: 1, max: 140 }
    if (id.startsWith('boat:')) return { at: d.boats[Number(id.slice(5))].position.clone().setY(0.05), r: 0.1, prio: 4, max: 100 }
    switch (id) {
      case 'plane':
        return { at: d.plane.position.clone(), r: 0.1, prio: 5, max: 100, glow: this.allDone && this.time - this.lastTouch > STUCK_S }
      case 'pierboat':
        return { at: d.pierBoat.position.clone().setY(0.05), r: 0.11, prio: 4, max: 110 }
      case 'ferry':
        return { at: d.ferry.position.clone().setY(0.08), r: 0.13, prio: 4, max: 110 }
      case 'elephants':
        return { at: d.places.chang.position.clone().add(tmp.set(0.24, 0.12, 0.06)), r: 0.12, prio: 4, max: 110 }
      case 'crab':
        return { at: d.crab.root.position.clone().setY(d.crab.root.position.y + 0.08), r: 0.08, prio: 4, max: 100 }
      case 'dolphins':
        return { at: new Vector3(DOLPHINS[0], 0.08, DOLPHINS[1]), r: 0.16, prio: 3, max: 120 }
      case 'turtle':
        return { at: d.turtle.root.position.clone().setY(0.05), r: 0.1, prio: 3, max: 100 }
      case 'eagle':
        return { at: d.eagle.root.position.clone(), r: 0.1, prio: 5, max: 100 }
      case 'whale':
        return { at: d.whale.root.position.clone().setY(0.04), r: 0.2, prio: 3, max: 130 }
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
    const nodes: Record<string, unknown> = {}
    for (const id of PLACE_IDS) {
      const [x, z] = PLACES[id].model
      places[id] = pt(new Vector3(x, this.ground(x, z) + 0.15, z))
      const [nx, nz] = PLACES[id].at
      nodes[id] = pt(new Vector3(nx, this.ground(nx, nz) + 0.02, nz))
    }
    return {
      game: 'krabi-map',
      been: [...this.done],
      open: PLACE_IDS.filter((p) => this.open(p)),
      car: pt(this.carPos()),
      held: this.held,
      going: this.going,
      arrived: this.arrived?.id ?? null,
      plane: this.planeT >= 0 || this.departT >= 0,
      touches: this.touches,
      points: { places, nodes },
    }
  }
}

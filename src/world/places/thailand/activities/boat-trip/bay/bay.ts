// Phang Nga Bay by longtail boat (plan: planning/around-the-world/thailand/boat-trip.md, "The bay"): the main event.
//
// The toy (core verb): drive the longtail with one finger.
// - Finger on the water (or on the boat, then drag): the boat goes after it. Far ahead = fast, near = slow, held to one
//   side it keeps turning (doughnuts), behind it = a U-turn. Let go and it coasts and bobs. A tap = go there.
//   Both at once, Dad's pick (PR #99): a finger anywhere on the water, or one that grabs the boat and drags.
// - On an iPhone (race/tilt.ts, as in the boat race): she holds the phone sideways and turns it like a wheel to steer,
//   and holds the gas pedal (race/GasPedal.tsx) to go. Off the pedal it coasts and settles (a tilt still turns the bow
//   at a crawl); a finger on the water no longer drives, but taps still poke things and a glow still takes her there.
// - Tap the boat: VROOM. Bump a rock: boing (it slides round, never stuck). Cross the tour boat's wake fast: a jump.
// The verb deepens three ways: open water (rocks, wakes, critters to drive up to), tight places (the village's lane,
// where boats go slowly; the canoe through the low cave, where the family must lie down or Daddy's horn bonks the
// roof) and the Nail Island (the buoys bump her back; land on the beach and pose for the photo). Then the sunset ride
// home to the pier.
//
// This file is the core: the boats, the family in them, the driving, the camera, the tap targets, photos and the
// section in the address bar. Each place builds and plays its own part (part.ts): pier.ts (the ribbons), open.ts (the
// open water's critters and silly moments), village.ts, cave.ts (the canoe, the cave and the hong), nail.ts (the beach
// and the photo), sunset.ts (the ride home) and race-gate.ts (the rainbow gate into the boat race, race/). The soft bumps
// are bumps.ts, the tap targets and arrows overlay.ts.
import { Color, Fog, Plane, Raycaster, Scene, Vector2, Vector3, type Object3D, type PerspectiveCamera, type WebGLRenderer } from 'three'
import { bell, clamp, type Line } from '../../../../../../sdk'
import { Avatar } from '../../../characters/avatar'
import { wearing } from '../../../trip/packing'
import { FAMILY } from '../../../characters/family'
import { Member } from '../../../characters/member'
import type { AnchorInfo } from '../../../engine/Anchors'
import { CameraRig, type Shot } from '../../../engine/camera'
import { Bag } from '../../../engine/dispose'
import { TapMarker } from '../../../engine/marker'
import { setOutlineResolution } from '../../../engine/outline'
import { Particles } from '../../../engine/particles'
import { photoCamera, snapPhoto } from '../../../engine/photo'
import { applyBands, makeLights, PAL } from '../../../engine/toon'
import type { World3D } from '../../../engine/View3D'
import { swell, Water } from '../../../engine/water'
import { L } from '../../../lines'
import { sfx } from '../../../sfx'
import { Driver } from '../../../trip/drive'
import { buildCanoe } from '../../../trip/vehicles/canoe'
import { buildLongtail, type Longtail } from '../../../trip/vehicles/longtail'
import type { Vehicle } from '../../../trip/vehicles/vehicle'
import type { SteerMode, Tilt } from '../race/tilt'
import type { BoatSection } from '../sections'
import { CAVE_ANCHORS, CaveStop } from './cave'
import type { CritterId } from './critters'
import { BAY_START, BEACH_GLOW, CAVE_GLOW, CLIFFS, HONG, HOUSES, MOORED, NAIL, PIER, PIER_GLOW, RACE_EXIT, RACE_GLOW, RACE_ROCKS, RING, ROCKS, TUNNEL, VILLAGE, VILLAGE_GLOW } from './layout'
import { NAIL_ANCHORS, NailStop } from './nail'
import { OPEN_ANCHORS, OpenWater } from './open'
import { BayOverlay, HINT_S } from './overlay'
import { collide } from './bumps'
import type { BayPart, Box, Circle, Phase, PhotoKind, Pose3, PoseKind, Ride, Rider, RiderId, Stop } from './part'
import { PIER_ANCHORS, PierStop } from './pier'
import { RACE_GATE_ANCHORS, RaceGate } from './race-gate'
import { applyPose, clearPose } from './poses'
import { buildScenery, type GlowId, type Scenery } from './scenery'
import { Sky } from './sky'
import { SUNSET_ANCHORS, SunsetRide } from './sunset'
import { TourBoat, WAKE_LIFE } from './tour'
import { BAY_TUNE } from './tune'
import { VILLAGE_ANCHORS, VillageStop } from './village'

/** Where a bay section starts, and what it carries (the URL's params, or what she did before). */
export interface BayStart {
  section: BoatSection
  packed: string[]
  /** The ribbons on the bow; null = not tied yet (the pier, from the start). */
  ribbons: string[] | null
  stops: Stop[]
  /** Photos the album should already have (a deep link): staged and taken in the first frames. */
  photos: PhotoKind[]
  /** Photos already in the album (no new automatic one of these). */
  album: PhotoKind[]
  found: CritterId[]
  /** Back from the boat race: the longtail starts just out of its gate (a `bay` section, no "where to?"). */
  from?: 'race'
}

export interface BayEvents {
  /** She moved into another part of the bay (the address bar follows). */
  onSection(s: BoatSection): void
  say(line: Line): void
  /** A sticker found, flying from (x, y) on the screen to the album. */
  onFound(id: CritterId, x: number, y: number): void
  onPhoto(kind: PhotoKind, src: string): void
  onStops(stops: Stop[]): void
  onRibbons(colors: string[]): void
  /** The family landed on the Nail Island beach (the pose buttons show), or set off again. */
  onLanded(on: boolean): void
  onFlash(): void
  /** Back at the pier at sunset: the boarding pass's last punch. */
  onDocked(): void
  /** Through the rainbow gate: the boat race. */
  onRace(): void
  /** The bay's phase changed (driving, boarding, on the beach, docked): the gas pedal shows only while driving. */
  onPhase?(p: Phase): void
}

const CORE_ANCHORS: AnchorInfo[] = [
  { id: 'boat', label: 'Boat', kind: 'thing' },
  { id: 'engine', label: 'Engine', kind: 'thing' },
  { id: 'family:kaylee', label: 'Kaylee', kind: 'family' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'glow:village', label: 'The village', kind: 'thing' },
  { id: 'glow:cave', label: 'The cave', kind: 'thing' },
  { id: 'glow:beach', label: 'The Nail Island beach', kind: 'thing' },
  { id: 'glow:pier', label: 'The pier', kind: 'thing' },
  { id: 'glow:out', label: 'The way out of the hong', kind: 'thing' },
  { id: 'glow:race', label: 'The boat race', kind: 'thing' },
  { id: 'tour', label: 'Tour boat', kind: 'thing' },
]
export const BAY_ANCHORS: AnchorInfo[] = [...CORE_ANCHORS, ...PIER_ANCHORS, ...OPEN_ANCHORS, ...VILLAGE_ANCHORS, ...CAVE_ANCHORS, ...NAIL_ANCHORS, ...SUNSET_ANCHORS, ...RACE_GATE_ANCHORS]

/** The off-screen glows' arrows at the screen's edge: what each one is. */
export const GLOW_ICONS: Record<GlowId, string> = { village: '🏘️', cave: '🛶', beach: '🏝️', pier: '⚓', out: '🚤', race: '🏁' }
/** The badges at the screen's edge: the glows, and the village's loose ball. */
export const ARROW_ICONS: Record<string, string> = { ...GLOW_ICONS, ball: '⚽' }

interface Hop {
  r: Rider
  parent: Object3D
  to: Vector3
  pose: Pose3
  face: number
  delay: number
  t: number
  dur: number
  arc: number
  from?: Vector3
  done?: () => void
}

interface Glide {
  ride: Ride
  from: { x: number; z: number; h: number }
  to: { x: number; z: number; h: number }
  t: number
  dur: number
  done: () => void
}

const deg = Math.PI / 180
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
const wrapDeg = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180
const tmp = new Vector3()
const tmp2 = new Vector3()
const grip = new Vector3()
const STUCK_EVERY = 22
/** How long Daddy's "where to?" look over the bay lasts (any touch ends it). */
const WHERE_S = 3.4

export class Bay implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  readonly bag = new Bag()
  private lights = makeLights(this.scene)
  private water: Water
  private sky: Sky
  readonly scenery: Scenery
  readonly tour: TourBoat
  readonly foam: Particles
  readonly spray: Particles
  readonly dust: Particles
  private marker: TapMarker
  readonly rides: { longtail: Ride & { v: Longtail }; canoe: Ride }
  using: 'longtail' | 'canoe' = 'longtail'
  readonly riders: Rider[]
  private hops: Hop[] = []
  private glides: Glide[] = []
  phase: Phase = 'drive'
  section: BoatSection
  readonly packed: string[]
  readonly stops: Set<Stop>
  private foundSet: Set<CritterId>
  // The parts.
  private pier: PierStop
  private open: OpenWater
  private village: VillageStop
  private cave: CaveStop
  private nail: NailStop
  private sunset: SunsetRide
  private raceGate: RaceGate
  readonly parts: BayPart[]
  private finger: { x: number; y: number; onBoat: boolean; steering: boolean; t: number } | null = null
  /** How she drives (a finger on the water, or on a phone tilting it with the gas pedal), and the tilt. */
  private steer: SteerMode = 'finger'
  private tilt: Tilt | null = null
  private gasDown = false
  /** Tilting: the tilt or the gas is driving the boat this frame (so letting go of both lets it coast). */
  private tiltDriving = false
  /** The phone's setup is showing (turn it sideways, allow the tilt): taps wait. */
  private waiting = false
  /** A tap's way round big things (Ko Tapu's buoys, the hong, the towers, the houses): the waypoints still ahead. */
  private route: { x: number; z: number }[] = []
  private raycaster = new Raycaster()
  private plane = new Plane(new Vector3(0, 1, 0), 0)
  private overlay = new BayOverlay(this)
  private w = 1
  private h = 1
  time = 0
  lastTouch = 0
  private camHeading = 0
  private engineT = 0
  private jumpCool = 0
  private bonkCool = 0
  private buoyCool = 0
  /** Spinning round and round (doughnuts): everyone gets dizzy. */
  private spin = 0
  private dizzyT = 0
  private dizzySaid = -99
  /** Daddy's "where to?" look over the bay (seconds left). */
  /** Until when (performance.now(), ms) Daddy's look over the bay lasts: on the clock, whatever the frame rate. */
  private whereUntil = 0
  private paiSaid = false
  private told = new Set<string>()
  private lastStuck = -99
  private stuckCount = 0
  /** Photos to take at the next frames (before drawing the screen's own frame). */
  private shots: { kind: PhotoKind; staged: boolean }[] = []
  private frames = 0
  private selfies = 0
  private photoKinds = new Set<PhotoKind>()
  private counts = { bonks: 0, buoys: 0, jumps: 0, vrooms: 0, photos: 0, dizzy: 0, roof: { kaylee: 0, ji: 0, nick: 0 } as Record<RiderId, number> }
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private quiet = true
  /** Daddy asks "where to?" as soon as her finger lifts. */
  private whereSoon = false

  constructor(
    private renderer: WebGLRenderer,
    start: BayStart,
    private events: BayEvents,
  ) {
    const { scene, bag } = this
    const haze = '#DCEFFB'
    scene.background = new Color(PAL.sky)
    scene.fog = new Fog(haze, 150, 560)
    applyBands()
    // A wider lens than the house (the horizon and the rock towers show behind the boat), and far enough to see the
    // towers on the horizon.
    this.rig.fov = BAY_TUNE.fov
    this.rig.camera.far = 700
    this.packed = start.packed
    // A sunset link is the way home after both stops.
    this.stops = new Set(start.section === 'sunset' && !start.stops.length ? (['village', 'cave'] as Stop[]) : start.stops)
    this.foundSet = new Set(start.found)
    this.water = new Water({ size: 1600, deep: '#5FC7B4', shallow: '#78D4C1', haze, hazeNear: 120, hazeFar: 520 }, bag)
    this.sky = new Sky(bag, scene.fog as Fog, this.water, this.lights)
    this.scenery = buildScenery(bag)
    this.tour = new TourBoat(bag)
    this.foam = new Particles({ kind: 'foam', count: 520, opacity: 0.88 }, bag)
    this.spray = new Particles({ kind: 'spray', count: 320 }, bag)
    this.dust = new Particles({ kind: 'spray', count: 60, color: '#D3C7E2' }, bag)
    this.marker = new TapMarker(bag)
    scene.add(this.sky.root, this.water.mesh, this.scenery.root, this.tour.root, this.foam.mesh, this.spray.mesh, this.dust.mesh, this.marker.root)

    const ride = <V extends Vehicle>(v: V) => ({ v, d: new Driver(v.feel), roll: { x: 0, v: 0 }, pitch: { x: 0, v: 0 }, squash: 1, travelled: 0 })
    this.rides = { longtail: ride(buildLongtail(bag)), canoe: ride(buildCanoe(bag)) }
    for (const r of Object.values(this.rides)) {
      r.v.root.userData.pick = 'boat'
      scene.add(r.v.root)
    }
    // She wears what she packed (her sun hat or Mommy's spare, her sunglasses, her floaties).
    const kaylee = new Avatar(bag)
    kaylee.wear(wearing(start.packed))
    const member = (id: 'ji' | 'nick') => new Member(FAMILY.find((m) => m.id === id)!, bag)
    const rider = (id: RiderId, char: Avatar | Member): Rider => ({ id, char, height: char.height, lying: false, under: false, upT: 0, warn: false, pose: null })
    this.riders = [rider('kaylee', kaylee), rider('ji', member('ji')), rider('nick', member('nick'))]

    this.section = start.section
    this.pier = new PierStop(this, start.ribbons)
    this.open = new OpenWater(this)
    this.village = new VillageStop(this)
    this.cave = new CaveStop(this)
    this.nail = new NailStop(this)
    this.sunset = new SunsetRide(this, this.sky)
    this.raceGate = new RaceGate(this, start.from === 'race')
    this.parts = [this.pier, this.cave, this.sunset, this.village, this.nail, this.raceGate, this.open]
    this.begin(start)
    for (const kind of start.album) this.photoKinds.add(kind)
    for (const kind of start.photos) {
      this.shots.push({ kind, staged: true })
      this.photoKinds.add(kind)
    }
    this.quiet = false
  }

  get ride() {
    return this.rides[this.using]
  }
  /** Daddy's "where to?" look over the bay is on. */
  get looking() {
    return performance.now() < this.whereUntil
  }
  get tall() {
    return this.w < this.h
  }

  // ---------------------------------------------------------------- start / sections

  private begin(start: BayStart) {
    const { longtail, canoe } = this.rides
    longtail.d.place(MOORED.x, MOORED.z, MOORED.heading)
    canoe.d.place(TUNNEL.x, TUNNEL.z0 + 2.2, Math.PI)
    const s = start.section
    if (s === 'pier') this.pier.begin()
    else if (s === 'cave' || s === 'hong') this.cave.begin(s)
    else {
      const back = s === 'bay' && start.from === 'race'
      const spot = s === 'nail' ? this.nail.start : s === 'village' ? this.village.start : s === 'sunset' ? this.sunset.start : back ? RACE_EXIT : BAY_START
      longtail.d.place(spot.x, spot.z, spot.heading)
      this.seatAll(longtail)
      if (s === 'bay' && !back) this.whereTo()
      if (s === 'sunset') this.sunset.begin(true)
    }
    for (const r of Object.values(this.rides)) this.poseRide(r, 0, 0)
    this.camHeading = this.ride.d.heading
    this.rig.setShot(this.shot(), true)
  }

  rider(id: RiderId) {
    return this.riders.find((r) => r.id === id)!
  }

  /** Everyone in their seats in `ride` at once (a deep link, after a pose). */
  seatAll(ride: Ride) {
    for (const r of this.riders) {
      r.lying = r.under = false
      ride.v.body.add(r.char.root)
      this.reseat(r, ride)
    }
  }
  reseat(r: Rider, ride: Ride = this.ride) {
    const pose = this.poseIn(ride.v, r)
    const p = this.seatPos(ride.v, r, pose)
    this.put(r, p.x, p.y, p.z, pose)
  }

  poseIn(v: Vehicle, r: Rider): Pose3 {
    return r.lying ? 'lie' : v.seats[r.id].stand ? 'stand' : 'sit'
  }
  seatPos(v: Vehicle, r: Rider, pose: Pose3) {
    const s = v.seats[r.id]
    const member = !(r.char instanceof Avatar)
    const y = pose === 'lie' ? s.y - 0.2 : pose === 'sit' && member ? s.y - 0.1 * r.height : s.y
    return new Vector3(s.x, y, s.z)
  }
  /** Puts someone somewhere (local to whatever they're riding), standing, sitting or lying back. */
  put(r: Rider, x: number, y: number, z: number, pose: Pose3, face = 0) {
    if (r.char instanceof Avatar) {
      r.char.place(x, y, z, face)
      r.char.setPose(pose)
    } else r.char.place(x, y, z, face, pose)
  }

  private setSection(s: BoatSection) {
    if (s === this.section) return
    // Out from the pier into open water for the first time: "Where to, captain?"
    if (this.section === 'pier' && s === 'bay' && !this.told.has('whereTo')) {
      this.told.add('whereTo')
      // (Once her finger is up: the camera flying up under a finger that's driving would make the boat lurch.)
      this.whereSoon = true
    }
    this.section = s
    this.stuckCount = 0
    if (!this.quiet) this.events.onSection(s)
  }
  refreshSection() {
    this.updateSection()
  }

  // ---------------------------------------------------------------- what the parts call

  say(line: Line) {
    this.events.say(line)
  }
  once(key: string, line: Line) {
    if (this.told.has(key)) return
    this.told.add(key)
    this.say(line)
  }
  found(id: CritterId, at: Vector3) {
    if (this.foundSet.has(id)) return
    this.foundSet.add(id)
    sfx.chime()
    const s = this.toScreen(at.clone(), 0.5, tmp2.set(1, 0, 0).applyQuaternion(this.rig.camera.quaternion))
    this.events.onFound(id, s?.x ?? this.w / 2, s?.y ?? this.h / 2)
  }
  /** Was this sticker found already? */
  has(id: CritterId) {
    return this.foundSet.has(id)
  }
  photo(kind: PhotoKind) {
    this.shots.push({ kind, staged: false })
  }
  /** Is a photo of this kind in the album already (taken, or from a link)? */
  hasPhoto(kind: PhotoKind) {
    return this.photoKinds.has(kind)
  }
  visit(stop: Stop) {
    if (this.stops.has(stop)) return
    this.stops.add(stop)
    this.events.onStops([...this.stops])
  }
  flash() {
    this.events.onFlash()
  }
  landed(on: boolean) {
    this.events.onLanded(on)
  }
  docked() {
    this.events.onDocked()
  }
  ribbonsTied(colors: string[]) {
    this.events.onRibbons(colors)
  }
  setPhase(p: Phase) {
    if (p === this.phase) return
    this.phase = p
    if (p !== 'drive') this.gasDown = false
    this.events.onPhase?.(p)
  }
  /** Into the boat race (the longtail glided through the gate). */
  raceNow() {
    this.events.onRace()
  }
  /** She has her Nail Island photo and is back in the boat (the sunset can begin). */
  isNailDone() {
    return this.nail.done
  }
  /** On the beach with a photo taken: the boat is the way back. */
  isNailWaiting() {
    return this.nail.wantsBoat
  }
  isSunset() {
    return this.sunset.active
  }
  /** A pose button on the beach (BoatTrip.tsx). */
  pose(kind: PoseKind) {
    this.lastTouch = this.time
    this.nail.pose(kind)
  }
  /** Switches the boat in use (the canoe at the cave). */
  setUsing(v: 'longtail' | 'canoe') {
    this.using = v
    this.camHeading = this.ride.d.heading
  }
  strike(r: Rider, kind: PoseKind | null, seconds = Infinity) {
    if (!kind) {
      if (r.pose) clearPose(r.char.rig)
      r.pose = null
      return
    }
    r.pose = { kind, t: r.pose?.kind === kind ? r.pose.t : 0, until: seconds }
  }
  countRoof(id: RiderId) {
    this.counts.roof[id]++
  }
  countPhoto() {
    this.counts.photos++
  }
  /** "Where to, captain?": Daddy points at the glows, and the camera looks out over the bay for a moment. */
  whereTo() {
    this.told.add('whereTo')
    this.whereUntil = performance.now() + WHERE_S * 1000
    this.say(L.bay.whereTo)
    this.strike(this.rider('nick'), 'point', 2.4)
  }

  // ---------------------------------------------------------------- input

  setAnchorElements(els: Map<string, HTMLElement>) {
    this.overlay.anchorEls = els
  }
  setHintElement(el: HTMLElement | null) {
    this.overlay.hintEl = el
  }
  /** Where an edge badge points (null: it's not showing). */
  arrowTarget(id: string): Vector3 | null {
    if (id === 'ball') return this.village.ballToFind()
    const g = this.scenery.glows[id as GlowId]
    return g?.visible ? g.position.clone().setY(4) : null
  }
  setArrowElements(els: Map<string, HTMLElement>) {
    this.overlay.arrowEls = els
  }
  get width() {
    return this.w
  }
  get height() {
    return this.h
  }
  /** A finger is down (or the gas pedal). */
  get touching() {
    return this.finger !== null || this.gasDown
  }
  /** Steering by tilting the phone (no "finger on the water" hints). */
  get tilting() {
    return this.steer === 'tilt'
  }

  /** A finger on the water, or (on a phone) tilting it with the gas pedal. */
  setSteer(mode: SteerMode, tilt: Tilt | null) {
    this.steer = mode
    this.tilt = mode === 'tilt' ? tilt : null
    if (mode === 'finger') this.gasDown = false
    if (this.tiltDriving) {
      this.tiltDriving = false
      this.ride.d.release()
    }
  }
  /** The gas pedal, down or up (tilting). */
  gas(down: boolean) {
    this.lastTouch = this.time
    this.whereUntil = 0
    this.gasDown = down && !this.waiting
  }
  /** The phone's setup is showing (turn it sideways, allow the tilt): taps on the water wait for it. */
  setWaiting(on: boolean) {
    this.waiting = on
    if (on) this.gasDown = false
  }

  private get canDrive() {
    return this.phase === 'drive'
  }

  pointerDown(x: number, y: number, id?: string) {
    if (this.waiting) return
    this.lastTouch = this.time
    this.whereUntil = 0
    const hit = id ?? this.pick(x, y)
    const onBoat = hit === 'boat' || !!hit?.startsWith('family:')
    // A finger drives at once, even on the family (in the canoe they fill the middle of the screen); on the boat itself
    // only once it moves (a tap there is a VROOM). Things to poke never drive.
    const poke = !!hit && hit !== 'boat' && hit !== 'engine' && !hit.startsWith('family:')
    // Tilting, a finger never drives (the tilt and the gas pedal do).
    this.finger = { x, y, onBoat, steering: this.canDrive && !this.tilting && !poke && hit !== 'boat' && hit !== 'engine', t: this.time }
  }
  pointerMove(x: number, y: number, downX: number, downY: number, held: boolean) {
    const f = this.finger
    if (!held || !f) return
    f.x = x
    f.y = y
    if (!f.steering && this.canDrive && !this.tilting && Math.hypot(x - downX, y - downY) > 12) f.steering = true
  }
  pointerUp() {
    if (this.finger?.steering) this.ride.d.release()
    this.finger = null
  }

  tap(x: number, y: number, id?: string) {
    if (this.waiting) return
    this.lastTouch = this.time
    this.whereUntil = 0
    const target = id ?? this.pick(x, y)
    // Each part gets its own things first (a ribbon, the ball, a crab).
    if (target && !target.startsWith('family:') && target !== 'boat' && target !== 'engine' && !target.startsWith('glow:')) {
      for (const p of this.parts) if (p.tap(target)) return
    }
    if (this.phase === 'board' || this.phase === 'swap') {
      if (target?.startsWith('family:')) this.cheer(this.rider(target.slice(7) as RiderId))
      else if (this.phase === 'board' && (target === 'boat' || target === 'engine')) {
        // Waiting at the pier, it rocks.
        this.tip(this.rides.longtail, (Math.random() < 0.5 ? -1 : 1) * 2.5)
        sfx.boing()
      } else if (this.phase === 'board') {
        // A splash where she tapped the water.
        const p = this.waterPoint(x, y)
        if (p) {
          this.spray.burst(p.x, 0.2, p.z, 8, 1.6, 2.6, 0.18)
          sfx.splash(0.35)
        }
      }
      return
    }
    if (this.phase === 'beach' || this.phase === 'docked') {
      if (target === 'boat') (this.phase === 'beach' ? this.nail : this.sunset).reboard()
      else if (target?.startsWith('family:')) this.cheer(this.rider(target.slice(7) as RiderId))
      return
    }
    if (target === 'boat' || target === 'engine') return this.vroom()
    if (target?.startsWith('family:')) return this.poke(this.rider(target.slice(7) as RiderId))
    if (target === 'glow:village') return this.driveTo(VILLAGE_GLOW.x, VILLAGE_GLOW.z)
    if (target === 'glow:cave') return this.driveTo(CAVE_GLOW.x, CAVE_GLOW.z)
    if (target === 'glow:beach') return this.driveTo(BEACH_GLOW.x, BEACH_GLOW.z)
    if (target === 'glow:pier') return this.driveTo(PIER_GLOW.x, PIER_GLOW.z)
    if (target === 'glow:race') return this.driveTo(RACE_GLOW.x, RACE_GLOW.z)
    if (target === 'glow:ball') {
      const b = this.village.ballToFind()
      if (b) this.driveTo(b.x, b.z)
      return
    }
    if (target === 'glow:out') {
      this.route = this.cave.paddleOut()
      return
    }
    if (target === 'tour') {
      sfx.horn()
      this.rider('nick').char.react('wave')
      return
    }
    const p = this.aim(x, y)
    if (!p) return
    // Tilting, a tap on the water is a splash (the tilt and the gas pedal drive), not "go there".
    if (this.tilting) {
      this.spray.burst(p.x, 0.2, p.z, 8, 1.6, 2.6, 0.18)
      sfx.splash(0.35)
      return
    }
    this.driveTo(p.x, p.z)
  }

  /** Where a finger on the screen sends the boat: the spot on the water under it (the canoe in the tunnel: along it). */
  private aim(x: number, y: number) {
    return this.cave.aim(x, y, this.w, this.h) ?? this.waterPoint(x, y)
  }

  driveTo(x: number, z: number) {
    // A tap on a rock's foot means "go to that rock": the spot just in front of it (not grinding against it).
    if (this.using === 'longtail') {
      const d0 = this.ride.d
      for (const r of [...ROCKS, ...CLIFFS, VILLAGE.rock, ...RACE_ROCKS]) {
        const dist = Math.hypot(x - r.x, z - r.z)
        if (dist < r.r + 2.5) {
          const ox = dist > 0.01 ? (x - r.x) / dist : (d0.x - r.x) / (Math.hypot(d0.x - r.x, d0.z - r.z) || 1)
          const oz = dist > 0.01 ? (z - r.z) / dist : (d0.z - r.z) / (Math.hypot(d0.x - r.x, d0.z - r.z) || 1)
          x = r.x + ox * (r.r + 4)
          z = r.z + oz * (r.r + 4)
        }
      }
    }
    const [tx, tz] = this.cave.steerPoint(x, z)
    const d = this.ride.d
    const way = [...(this.using === 'longtail' ? this.around(d.x, d.z, tx, tz) : []), { x: tx, z: tz }]
    const first = way.shift()!
    d.goto(first.x, first.z, way.length > 0)
    this.route = way
    this.marker.show(x, 0, z)
  }

  /** Waypoints round whatever big thing stands between here and there (the straight line, bent round it). */
  private around(x: number, z: number, tx: number, tz: number) {
    const big: Circle[] = [
      [NAIL.x, NAIL.z, NAIL.buoys + 5],
      [HONG.x, HONG.z, HONG.outer + 5],
      ...ROCKS.map((r): Circle => [r.x, r.z, r.r + 5]),
      ...CLIFFS.map((r): Circle => [r.x, r.z, r.r + 5]),
      ...HOUSES.map((h): Circle => [h.x, h.z, Math.hypot(h.hx, h.hz) + 1.5]),
      ...RACE_ROCKS.map((r): Circle => [r.x, r.z, r.r + 5]),
    ]
    const out: { x: number; z: number }[] = []
    let cx = x
    let cz = z
    for (let n = 0; n < 4; n++) {
      const dx = tx - cx
      const dz = tz - cz
      const len = Math.hypot(dx, dz) || 1
      let hit: { t: number; ox: number; oz: number; r: number; px: number; pz: number } | null = null
      for (const [ox, oz, r] of big) {
        // Ignore things the boat (or the target) is already beside.
        if (Math.hypot(ox - cx, oz - cz) < r || Math.hypot(ox - tx, oz - tz) < r) continue
        const t = clamp(((ox - cx) * dx + (oz - cz) * dz) / (len * len), 0, 1)
        const px = cx + dx * t
        const pz = cz + dz * t
        if (Math.hypot(px - ox, pz - oz) < r && (!hit || t < hit.t)) hit = { t, ox, oz, r, px, pz }
      }
      if (!hit) break
      // Out to the side the line was passing on, a little past the edge.
      let sx = hit.px - hit.ox
      let sz = hit.pz - hit.oz
      const sl = Math.hypot(sx, sz)
      if (sl < 0.01) {
        sx = -dz / len
        sz = dx / len
      } else {
        sx /= sl
        sz /= sl
      }
      cx = hit.ox + sx * hit.r * 1.2
      cz = hit.oz + sz * hit.r * 1.2
      out.push({ x: cx, z: cz })
    }
    return out
  }

  private ndc(x: number, y: number) {
    return new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1)
  }

  /** What's under a screen point: 'boat', 'family:<id>', 'tour', or null. */
  private pick(x: number, y: number): string | null {
    this.raycaster.setFromCamera(this.ndc(x, y), this.rig.camera)
    const targets: Object3D[] = [this.ride.v.root, this.tour.root]
    for (const hit of this.raycaster.intersectObjects(targets, true)) {
      let o: Object3D | null = hit.object
      while (o && o.userData.pick === undefined) o = o.parent
      const id = o?.userData.pick as string | undefined
      if (!id) continue
      if (id === 'kaylee') return 'family:kaylee'
      return id
    }
    return null
  }

  /** Where a screen point lands on the water. Above the horizon (or very far): a point far off in that direction. */
  waterPoint(x: number, y: number) {
    this.raycaster.setFromCamera(this.ndc(x, y), this.rig.camera)
    const ray = this.raycaster.ray
    const hit = ray.intersectPlane(this.plane, new Vector3())
    const cam = this.rig.camera.position
    if (hit && Math.hypot(hit.x - cam.x, hit.z - cam.z) < 140) return hit
    const dir = tmp.set(ray.direction.x, 0, ray.direction.z)
    if (dir.lengthSq() < 1e-6) return null
    dir.normalize()
    return new Vector3(cam.x + dir.x * 140, 0, cam.z + dir.z * 140)
  }

  // ---------------------------------------------------------------- doing things

  private vroom() {
    const r = this.ride
    if (this.using === 'canoe') {
      // Daddy digs in hard with the paddle.
      r.d.vroom(1.1)
      sfx.paddle()
      setTimeout(sfx.paddle, 160)
      this.splashAt(r, r.v.bow * 0.3, 6)
    } else {
      r.d.vroom(2)
      sfx.vroom()
      setTimeout(() => this.once('longtail', L.bay.facts.longtail), 1600)
      r.pitch.v -= 2.6
      r.squash = 0.3
      this.splashAt(r, r.v.stern, 24)
      this.rider('ji').char.react('wiggle')
    }
    this.counts.vrooms++
  }

  /** Tapping someone in the boat: in the canoe they lie back (or sit up); in the longtail Kaylee giggles and dances,
   *  Mommy takes a selfie, Daddy points at something. */
  private poke(r: Rider) {
    if (this.using === 'canoe') return this.cave.lieDown(r)
    if (r.id === 'kaylee') {
      sfx.giggle()
      r.char.react('hop')
      this.strike(r, 'cheer', 1.1)
    } else if (r.id === 'ji') this.selfie()
    else {
      sfx.boing()
      r.char.react('hop')
      this.strike(r, 'point', 1.6)
      const at = this.open.somethingToSee()
      if (at) r.char.lookAt(at.x, 2, at.z)
    }
  }

  private selfie() {
    const ji = this.rider('ji')
    this.strike(ji, 'selfie', 1.8)
    ji.char.react('hop')
    setTimeout(() => {
      sfx.shutter()
      this.riders.forEach((r) => r.id !== 'ji' && r.char.react('hop'))
      if (this.selfies < 3) {
        this.selfies++
        this.photo('selfie')
      }
    }, 650)
  }

  cheer(r: Rider) {
    r.char.react('hop')
    r.char.react('wave')
    sfx.boing()
  }

  /** Someone hops from wherever they are to a spot on `parent` (a boat, or the world). */
  hop(r: Rider, parent: Object3D, to: Vector3, pose: Pose3, face: number, delay: number, done?: () => void) {
    this.hops = this.hops.filter((h) => h.r !== r)
    this.hops.push({ r, parent, to, pose, face, delay, t: 0, dur: 0.42, arc: 0.7, done })
  }
  get hopping() {
    return this.hops.length > 0
  }

  private updateHops(dt: number) {
    for (const hp of [...this.hops]) {
      if (hp.delay > 0) {
        hp.delay -= dt
        continue
      }
      if (!hp.from) {
        this.scene.updateMatrixWorld()
        const root = hp.r.char.root
        hp.parent.attach(root)
        // Keep only the way they face: not the old boat's tilt or squash.
        root.rotation.set(0, root.rotation.y, 0)
        root.scale.set(1, 1, 1)
        hp.from = root.position.clone()
        sfx.boing()
      }
      hp.t += dt / hp.dur
      const k = Math.min(1, hp.t)
      tmp.lerpVectors(hp.from, hp.to, k)
      tmp.y += bell(k) * hp.arc
      this.put(hp.r, tmp.x, tmp.y, tmp.z, k < 1 ? 'stand' : hp.pose, hp.face)
      if (k >= 1) {
        this.hops.splice(this.hops.indexOf(hp), 1)
        hp.r.char.react('wiggle')
        sfx.thump()
        hp.done?.()
      }
    }
  }

  /** A boat glides to a spot (parking, beaching, backing off the beach). */
  glide(ride: Ride, to: { x: number; z: number; h: number }, dur: number, done: () => void) {
    ride.d.stop()
    this.route = []
    this.glides = this.glides.filter((g) => g.ride !== ride)
    this.glides.push({ ride, from: { x: ride.d.x, z: ride.d.z, h: ride.d.heading }, to: { ...to, h: ride.d.heading + wrap(to.h - ride.d.heading) }, t: 0, dur, done })
  }
  private gliding(ride: Ride) {
    return this.glides.some((g) => g.ride === ride)
  }

  private updateGlides(dt: number) {
    for (const g of [...this.glides]) {
      g.t += dt / g.dur
      const k = Math.min(1, g.t)
      const e = k * k * (3 - 2 * k)
      g.ride.d.place(g.from.x + (g.to.x - g.from.x) * e, g.from.z + (g.to.z - g.from.z) * e, g.from.h + (g.to.h - g.from.h) * e)
      if (k >= 1) {
        this.glides.splice(this.glides.indexOf(g), 1)
        g.done()
      }
    }
  }

  // ---------------------------------------------------------------- per frame

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
    this.rig.setShot(this.shot(), true)
  }

  retune() {
    this.rig.fov = BAY_TUNE.fov
    applyBands()
    setOutlineResolution(this.w, this.h)
    this.rig.refit()
  }

  get calm() {
    const d = this.ride.d
    return Math.abs(d.speed) < 0.05 && !d.airborne && !this.hops.length && !this.glides.length && !this.finger && !this.foam.busy && !this.spray.busy && !this.rig.moving && !this.looking && this.phase !== 'board'
  }

  /** Tilting the phone like a wheel turns the bow (right edge down = right), the gas pedal is full speed. Off the
   *  pedal, a clear tilt still turns it round at a crawl; level and off the pedal, it coasts and settles (and a glow
   *  she tapped drives her there as before). */
  private driveTilt(dt: number) {
    this.tilt?.update(dt)
    const d = this.ride.d
    const v = this.tilt?.value ?? 0
    if (!this.canDrive || this.waiting || (!this.gasDown && Math.abs(v) < 0.15)) {
      if (this.tiltDriving) {
        this.tiltDriving = false
        if (this.canDrive) d.release()
      }
      return
    }
    this.tiltDriving = true
    this.route = []
    this.lastTouch = this.time
    // A point ahead, off to the side the phone is turned (heading grows to the left as seen from behind the boat): a
    // small tilt just past the drive's own dead zone, full lock where it turns as fast as the boat can.
    const f = d.feel
    const off = v === 0 ? 0 : Math.sign(v) * (f.dead + Math.abs(v) * (f.turn / 3 + 0.15))
    const a = (d.lock ?? d.heading) - off
    const dist = this.gasDown ? f.far + 6 : f.near * 0.9
    const [tx, tz] = this.cave.steerPoint(d.x + Math.sin(a) * dist, d.z + Math.cos(a) * dist)
    d.hold(tx, tz)
  }

  update(dt: number) {
    this.time += dt
    const t = this.time
    const ride = this.ride
    const d = ride.d

    this.updateHops(dt)
    this.updateGlides(dt)
    if (this.whereSoon && !this.touching && this.phase === 'drive') {
      this.whereSoon = false
      this.whereTo()
    }
    // A finger driving counts as playing (no "stuck" hints while she drives). Held still on something to poke (a bat,
    // the boat) for a moment, it drives too: holding means driving.
    // The boat driving itself to a spot she tapped, a glide, a hop: still her doing, not "stuck".
    if (this.ride.d.driven || this.glides.length || this.hops.length) this.lastTouch = t
    if (this.finger) {
      this.lastTouch = t
      if (!this.finger.steering && this.canDrive && !this.tilting && t - this.finger.t > 0.3) this.finger.steering = true
    }
    if (this.gasDown) this.lastTouch = t

    // ---- Driving ----
    const goal = d.goal
    if (this.route.length && goal && Math.hypot(d.x - goal.x, d.z - goal.z) < 9) {
      const next = this.route.shift()!
      d.goto(next.x, next.z, this.route.length > 0)
    }
    if (this.canDrive && this.finger?.steering) {
      this.route = []
      const p = this.aim(this.finger.x, this.finger.y)
      if (p) {
        const [tx, tz] = this.cave.steerPoint(p.x, p.z)
        d.hold(tx, tz)
      }
    }
    if (this.tilting) this.driveTilt(dt)
    // The village slows boats down by itself (real boats go slowly between the houses).
    d.cap = this.using === 'longtail' ? this.village.speedCap(d.x, d.z) : 1
    const before = { x: d.x, z: d.z }
    if (!this.gliding(ride)) {
      const ev = d.step(dt)
      if (ev.landed !== undefined && ev.landed > 1.2) this.landSplash(ride, ev.landed)
      if (this.canDrive) this.cave.rules(dt)
      this.collide(ride)
    }
    ride.travelled += Math.hypot(d.x - before.x, d.z - before.z)
    this.jumpCool -= dt
    this.bonkCool -= dt
    this.buoyCool -= dt
    if (this.using === 'longtail' && this.canDrive) {
      this.wakeJumps()
      this.arrivals()
      this.dizzy(dt)
      // The first drive away from the pier: "Pai!"
      if (!this.paiSaid && this.section === 'pier' && d.driven && Math.abs(d.speed) > 1.5) {
        this.paiSaid = true
        this.say(L.bay.pai)
        this.strike(this.rider('nick'), 'point', 1.2)
        setTimeout(() => this.once('pai', L.bay.facts.pai), 1100)
      }
    }

    // ---- The parts ----
    for (const p of this.parts) p.update(dt, t)

    // ---- The boats, the family in them, the bay ----
    for (const r of Object.values(this.rides)) this.poseRide(r, dt, t)
    this.trail(ride, dt)
    this.updateRiders(dt, t)
    this.tour.update(t, dt, this.foam)
    this.water.update(t)
    this.foam.update(dt)
    this.spray.update(dt)
    this.dust.update(dt)
    this.marker.update(dt)
    this.updateGlows(t)
    this.sounds(dt)
    this.stuck()

    // ---- Where she is (the address bar), and the camera ----
    this.updateSection()
    this.camHeading += wrap(d.heading - this.camHeading) * (1 - Math.exp(-dt / BAY_TUNE.camLag))
    this.rig.setShot(this.shot())
    this.rig.lag = this.looking ? 0.7 : this.cave.camLag() ?? 0.35
    this.rig.update(dt)
    this.unblockCamera()
    const cam = this.rig.camera
    this.sky.update(dt, cam.position.x, cam.position.z)
    // The sun stays on the camera's side (behind it, up and to the right), so what she looks at is lit.
    const back = tmp.set(cam.position.x - d.x, 0, cam.position.z - d.z).normalize()
    this.lights.follow(d.x, 0, d.z)
    this.lights.sun.position.set(d.x + back.x * 7 - back.z * 4, 10, d.z + back.z * 7 + back.x * 4)
  }

  /** Everyone's life for this frame: where they look, their poses on top (Kaylee's hands on the tiller), dizzy heads. */
  private updateRiders(dt: number, t: number) {
    const d = this.ride.d
    const lt = this.rides.longtail
    for (const r of this.riders) {
      const goal = d.goal
      if (goal && this.phase === 'drive') r.char.lookAt(goal.x, 1, goal.z)
      else if (r.pose?.kind !== 'point') r.char.lookAway()
      r.char.update(dt, t)
      const rig = r.char.rig
      if (r.pose) {
        r.pose.t += dt
        applyPose(rig, r.pose.kind, r.pose.t, Math.min(1, r.pose.t / 0.25))
        if (r.pose.t > r.pose.until) {
          clearPose(rig)
          r.pose = null
        }
      } else if (r.id === 'kaylee' && r.char.root.parent === lt.v.body && !this.hops.some((h) => h.r === r)) {
        // Her hands on the tiller, and she sways with it as it swings.
        applyPose(rig, 'tiller', t, 1)
        lt.v.grip(grip)
        r.char.root.position.x += (grip.x * 0.55 - r.char.root.position.x) * Math.min(1, dt * 10)
      }
      if (this.dizzyT > 0 && !r.lying) rig.head.rotation.z = Math.sin(t * 9 + r.height * 3) * 0.32 * Math.min(1, this.dizzyT)
    }
    this.dizzyT = Math.max(0, this.dizzyT - dt)
  }

  /** Round and round (doughnuts): everyone gets dizzy, and Mommy says so (now and then). */
  private dizzy(dt: number) {
    const d = this.rides.longtail.d
    this.spin = this.spin * Math.exp(-dt / 2.5) + (Math.abs(d.speed) > 2.5 ? Math.abs(d.yawRate) * dt : 0)
    if (this.spin > Math.PI * 2.2 && this.dizzyT <= 0) {
      this.dizzyT = 3.2
      this.spin = 0
      this.counts.dizzy++
      sfx.whoosh(0.6)
      if (this.time - this.dizzySaid > 40) {
        this.dizzySaid = this.time
        this.say(L.bay.dizzy)
      }
    }
  }

  /** The longtail reaching a stop: the village, the cave's raft (into the canoe), the Nail Island beach (the photo),
   *  the pier at sunset. */
  private arrivals() {
    const d = this.rides.longtail.d
    const v = this.rides.longtail.v
    const bx = d.x + Math.sin(d.heading) * v.bow
    const bz = d.z + Math.cos(d.heading) * v.bow
    this.village.arrive(bx, bz)
    if (this.cave.arrive(bx, bz)) return
    if (this.nail.arrive(bx, bz)) return
    if (this.raceGate.arrive(bx, bz)) return
    this.sunset.arrive(bx, bz)
  }

  private updateGlows(t: number) {
    const drive = this.using === 'longtail' && this.phase === 'drive'
    const sunset = this.sunset.active
    const g = this.scenery.glows
    g.village.visible = drive && !sunset && !this.stops.has('village') && !this.village.here
    g.cave.visible = drive && !sunset && !this.stops.has('cave') && this.cave.armed
    g.beach.visible = drive && !sunset && this.nail.armed
    g.pier.visible = drive && sunset
    g.out.visible = this.phase === 'drive' && this.cave.showExit
    g.race.visible = drive && !sunset && !this.stops.has('race') && this.raceGate.armed
    for (const k of Object.keys(g) as GlowId[]) g[k].scale.setScalar(1 + Math.sin(t * 2.2 + k.length) * 0.04)
  }

  /** After a while with nothing done, Sparkle says what to do (the part's own hint, or how to drive). */
  private stuck() {
    const idle = this.time - this.lastTouch
    if (idle < HINT_S || this.time - this.lastStuck < STUCK_EVERY || this.stuckCount >= 8 || this.hopping) return
    if (Math.abs(this.ride.d.speed) > 0.8 || this.ride.d.driven) return
    let line: Line | null = null
    for (const p of this.parts) if ((line = p.stuckLine?.() ?? null)) break
    // (Tilting, "put your finger on the water" would be wrong: the gas pedal's finger shows how instead.)
    if (!line && this.phase === 'drive') line = this.tilting ? (this.using === 'canoe' ? null : L.bay.hint.glow) : this.using === 'canoe' || this.stuckCount % 2 === 0 ? L.bay.hint.drive : L.bay.hint.glow
    if (!line) return
    this.lastStuck = this.time
    this.stuckCount++
    this.say(line)
  }

  /** Bumps: rocks, the pier, the stops' own (houses, cliffs, buoys...), the tour boat, the shore and the bay's edge. */
  private collide(ride: Ride) {
    const circles: Circle[] = []
    const boxes: Box[] = []
    this.bumps(ride.d.x, ride.d.z, circles, boxes)
    collide(ride, circles, boxes, (x, z, hit) => this.bonk(ride, x, z, hit), this.using === 'longtail' ? (at, px, pz) => this.nail.buoys(ride, at, px, pz) : undefined)
  }

  /** Buoy bumps (the Nail Island's soft ring), counted for QA. */
  buoyBump(ride: Ride, at: number) {
    if (this.buoyCool > 0) return
    this.buoyCool = 0.4
    this.counts.buoys++
    sfx.boop()
    ride.squash = 0.4
    this.splashAt(ride, at, 5)
  }

  /** Every bump near (x, z): the towers, the pier's posts, the parts' own, the longtail's extra ones. */
  private bumps(x: number, z: number, circles: Circle[], boxes: Box[]) {
    const near = (cx: number, cz: number, r: number) => Math.abs(cx - x) < r + 12 && Math.abs(cz - z) < r + 12
    for (const r of ROCKS) if (near(r.x, r.z, r.r)) circles.push([r.x, r.z, r.r])
    for (let pz = PIER.z0; pz <= PIER.z1; pz += 2) if (near(PIER.x, pz, 1.7)) circles.push([PIER.x, pz, 1.7])
    for (const p of this.parts) p.bumps?.(x, z, circles, boxes)
    if (this.using === 'longtail') {
      // The longtail is too big for the tunnel: the mouth stops it (the canoe goes in).
      circles.push([TUNNEL.x, TUNNEL.z0 + 0.5, 2.6])
      circles.push(...this.tour.circles())
    }
  }

  private bonk(ride: Ride, x: number, z: number, hit: number) {
    if (this.bonkCool > 0) return
    this.bonkCool = 0.35
    this.counts.bonks++
    sfx.boing()
    ride.squash = 0
    ride.roll.v += (Math.random() < 0.5 ? -1 : 1) * Math.min(3, hit * 0.4)
    this.spray.burst(x, 0.3, z, Math.round(4 + hit * 1.5), 2 + hit * 0.3, 3 + hit * 0.25, 0.2)
    this.riders.forEach((r, i) => setTimeout(() => r.char.react('wiggle'), i * 60))
    for (const p of this.parts) p.bonked?.(x, z, hit)
  }

  /** Crossing the tour boat's wake fast: the longtail hops off it like a ramp (a really high one blows Mommy's hat off). */
  private wakeJumps() {
    const d = this.rides.longtail.d
    if (this.jumpCool > 0 || d.airborne) return
    const now = this.time
    for (const r of this.tour.ridges) {
      if (now - r.t > WAKE_LIFE || Math.hypot(d.x - r.x, d.z - r.z) > 2.6) continue
      const across = Math.abs(d.vx * r.dz - d.vz * r.dx)
      if (across < 3) continue
      const vy = 2.4 + Math.abs(d.speed) * 0.22
      d.jump(vy)
      this.jumpCool = 1.2
      this.counts.jumps++
      sfx.vroom()
      this.splashAt(this.rides.longtail, 0, 10)
      this.open.jumped(vy)
      return
    }
  }

  private landSplash(ride: Ride, v: number) {
    const d = ride.d
    sfx.splash(clamp(v / 5, 0.5, 1.4))
    ride.squash = 0
    ride.pitch.v += 1.2
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2
      this.foam.emit(d.x + Math.sin(a) * 1.5, 0.03, d.z + Math.cos(a) * 1.5, Math.sin(a) * 2.5, 0, Math.cos(a) * 2.5, 2.2, 1.6)
    }
    this.spray.burst(d.x, 0.2, d.z, 16, 3.5, 4, 0.24)
    this.rider('ji').char.react('hop')
    this.rider('kaylee').char.react('hop')
    if (!this.told.has('whoa') || Math.random() < 0.35) {
      this.told.add('whoa')
      this.say(L.bay.whoa)
    }
  }

  private updateSection() {
    if (this.phase === 'swap' || this.phase === 'board') return
    for (const p of this.parts) {
      const s = p.sectionNow?.()
      if (s) return this.setSection(s)
    }
    this.setSection('bay')
  }

  /** Where the boat is, which way it faces, how it rolls, pitches, bobs and squashes. */
  private poseRide(r: Ride, dt: number, t: number) {
    const d = r.d
    const v = r.v
    const sp = d.speed / d.feel.top
    // Springs: stepping in tips it, a bonk rocks it, VROOM lifts the bow.
    const stepSpring = (s: { x: number; v: number }, target: number, k: number, damp: number) => {
      s.v += ((target - s.x) * k - s.v * damp) * dt
      s.x += s.v * dt
    }
    stepSpring(r.roll, 0, 60, 5)
    const bowUp = (d.boostT > 0 ? 0.12 : 0) + 0.012 * Math.max(0, sp) + (d.airborne ? clamp(d.vy * 0.025, -0.1, 0.1) : 0)
    stepSpring(r.pitch, -bowUp, 40, 7)
    r.squash = Math.min(1, r.squash + dt / 0.45)
    const w = swell(d.x, d.z, t) * (r === this.rides.canoe && this.cave.inTunnel ? 0.3 : 1)
    v.root.position.set(d.x, w + d.y, d.z)
    v.root.rotation.set(0, d.heading, 0)
    v.body.rotation.set(r.pitch.x + Math.sin(t * 1.3 + d.x) * 0.012, 0, d.roll + r.roll.x * 0.12 + Math.sin(t * 1.1 + d.z) * 0.015)
    const s = r.squash < 1 ? Math.cos(r.squash * Math.PI * 3) * (1 - r.squash) ** 2 : 0
    v.body.scale.set(1 + 0.08 * s, 1 - 0.16 * s, 1 + 0.04 * s)
    v.animate(clamp(d.yawRate / d.feel.turn, -1, 1), Math.min(1, Math.abs(sp)), t, dt)
  }
  /** Rocks the boat (a step in at the pier, a bump). */
  tip(ride: Ride, v: number) {
    ride.roll.v += v
    ride.squash = 0
  }

  /** Foam behind it and spray off the propeller (the rooster tail) when fast. */
  private trail(ride: Ride, dt: number) {
    const d = ride.d
    const v = ride.v
    const speed = Math.abs(d.speed)
    const sx = Math.sin(d.heading)
    const sz = Math.cos(d.heading)
    if (d.airborne || speed < 0.5) return
    const canoe = this.using === 'canoe'
    const every = canoe ? 0.6 : 0.8
    while (ride.travelled > every) {
      ride.travelled -= every
      const back = canoe ? v.stern : -2.8
      for (const s of [-1, 1]) {
        const lat = (canoe ? 0.35 : 0.6) * s
        this.foam.emit(d.x + sx * back + sz * lat, 0.03, d.z + sz * back - sx * lat, sz * s * speed * 0.12, 0, -sx * s * speed * 0.12, canoe ? 1.6 : 3.6, canoe ? 0.45 : 1.1 + speed * 0.08)
      }
    }
    if (canoe) return
    // The rooster tail: a tall plume of spray thrown up and back off the propeller, the faster the higher.
    const fast = Math.max(0, speed / v.feel.top - 0.35) + (d.boostT > 0 ? 0.7 : 0)
    let n = fast * 90 * dt
    while (n > 0) {
      if (n < 1 && Math.random() > n) break
      n--
      const px = d.x + sx * v.stern
      const pz = d.z + sz * v.stern
      const r = (Math.random() - 0.5) * 1.2
      this.spray.emit(px, 0.2, pz, -sx * (2.5 + speed * 0.35) + sz * r, 4 + fast * 6 + Math.random() * 2.5, -sz * (2.5 + speed * 0.35) - sx * r, 0.85, 0.22 + Math.random() * 0.18)
    }
    // Hard turns at speed throw spray off the bow.
    if (Math.abs(d.yawRate) > v.feel.turn * 0.6 && speed > v.feel.top * 0.5 && Math.random() < dt * 20) {
      const side = Math.sign(d.yawRate)
      this.spray.emit(d.x + sx * 2, 0.3, d.z + sz * 2, -sz * side * 3, 2.5, sx * side * 3, 0.5, 0.2)
    }
  }

  splashAt(ride: Ride, along: number, n: number) {
    const d = ride.d
    this.spray.burst(d.x + Math.sin(d.heading) * along, 0.25, d.z + Math.cos(d.heading) * along, n, 2.2, 3.5, 0.22)
  }

  /** The longtail's engine: putt-putt-putt slowly, RRRAAAH fast; the canoe's paddle is cave.ts's. */
  private sounds(dt: number) {
    const d = this.ride.d
    if (this.using !== 'longtail') return
    const sp = Math.min(1.4, Math.abs(d.speed) / d.feel.top)
    if (sp < 0.04 && !d.driven) return
    this.engineT += dt
    const every = 1 / (3.5 + 11 * sp)
    if (this.engineT > every) {
      this.engineT = 0
      sfx.engine(Math.min(1, sp + (d.boostT > 0 ? 0.3 : 0)))
    }
  }

  /** The camera's goal: a part's own (the tunnel, the hong, the beach, the pier at sunset), Daddy's look over the bay,
   *  or behind the boat on open water. */
  private shot(): Shot {
    const d = this.ride.d
    for (const p of this.parts) {
      const s = p.shot?.()
      if (s) return s
    }
    const behind = this.unwrap(this.camHeading / deg + 180)
    if (this.looking) {
      // Up and back over the boat, so both glows (the village, the cave) are on screen.
      const pts = [[d.x, d.z], [VILLAGE_GLOW.x, VILLAGE_GLOW.z], [CAVE_GLOW.x, CAVE_GLOW.z]]
      const cx = pts.reduce((a, p) => a + p[0], 0) / 3
      const cz = pts.reduce((a, p) => a + p[1], 0) / 3
      const half = Math.max(...pts.map((p) => Math.max(Math.abs(p[0] - cx), Math.abs(p[1] - cz)))) + 14
      return { center: new Vector3(cx, 4, cz), half: new Vector3(half, 8, half * 0.6), yaw: behind, pitch: 34, minDist: 20, maxDist: 320 }
    }
    const canoe = this.using === 'canoe'
    const sp = clamp(Math.abs(d.speed) / d.feel.top, 0, 1.6)
    // Faster = a little wider; a tall screen frames a narrower box (a bigger boat), the extra height goes to the towers.
    const tall = clamp((1 - this.w / this.h) / 0.4, 0, 1)
    // Tight places (the village's lane) bring the camera in.
    const tight = canoe ? 1 : this.village.closeness(d.x, d.z)
    const zoom = Math.round((canoe ? 1 : 1 + 0.18 * sp) * (1 - 0.3 * tall) * (1 - 0.18 * tight) * 10) / 10
    const ahead = canoe ? 2 : BAY_TUNE.camAhead * Math.min(1, 0.4 + sp)
    const board = this.phase === 'board'
    return {
      center: new Vector3(d.x + Math.sin(d.heading) * ahead - (board ? 1.2 : 0), board ? 1.2 : 1, d.z + Math.cos(d.heading) * ahead),
      half: canoe ? new Vector3(4.2 * zoom, 1.5, 4.5) : board ? new Vector3(5 * zoom, 2, 5) : new Vector3(BAY_TUNE.camWide * zoom, 2.2, BAY_TUNE.camDeep * zoom),
      yaw: behind + BAY_TUNE.camSide,
      pitch: canoe ? 26 : BAY_TUNE.camPitch + 4 * tight,
      minDist: canoe ? 5 : 7,
      maxDist: 90,
      follow: true,
    }
  }
  /** The chase camera never ends up inside a rock tower (after a bonk the boat can turn its back to one): it slides in
   *  along its view toward the boat until it's out (inside a tower's ink outline, the screen goes black). */
  private unblockCamera() {
    const cam = this.rig.camera
    const p = cam.position
    const towers = [...ROCKS, ...RING, ...CLIFFS, VILLAGE.rock, { x: NAIL.x, z: NAIL.z, r: NAIL.top, h: NAIL.h }, ...this.parts.flatMap((p) => p.towers?.() ?? [])]
    if (this.using === 'canoe') return
    const fwd = cam.getWorldDirection(tmp2)
    const d = this.ride.d
    // Inside a tower, or a tower standing between it and the boat (low enough to hide her).
    // (The rock over the cave's tunnel too: a long block, not a round tower.)
    const overTunnel = Math.abs(p.x - TUNNEL.x) < TUNNEL.half + 1.5 && p.z < TUNNEL.z0 + 1 && p.z > TUNNEL.z1 && p.y > 0.5
    if (overTunnel) {
      const back = new Vector3(d.x - p.x, 0, d.z - p.z).normalize()
      for (let i = 0; i < 40 && Math.abs(p.x - TUNNEL.x) < TUNNEL.half + 1.5 && p.z < TUNNEL.z0 + 1; i++) p.addScaledVector(back, 0.5)
    }
    const blocked = (r: { x: number; z: number; r: number; h: number }) => {
      if (Math.hypot(p.x - r.x, p.z - r.z) < r.r * 1.3 + 1.2 && p.y < r.h + 4) return true
      const sx = d.x - p.x
      const sz = d.z - p.z
      const len2 = sx * sx + sz * sz || 1
      const k = clamp(((r.x - p.x) * sx + (r.z - p.z) * sz) / len2, 0, 1)
      const y = p.y + (1 - p.y) * k
      return k > 0.02 && k < 0.98 && y < r.h && Math.hypot(p.x + sx * k - r.x, p.z + sz * k - r.z) < r.r * 1.1
    }
    for (let i = 0; i < 60; i++) {
      if (!towers.some(blocked)) return
      p.addScaledVector(fwd, 0.5)
      if (Math.hypot(p.x - d.x, p.z - d.z) < 4) return
    }
  }

  /** A yaw (degrees) unwrapped next to where the camera faces now, so it turns the short way round. */
  unwrap(yaw: number) {
    return this.rig.yaw + wrapDeg(yaw - this.rig.yaw)
  }
  get camHeadingDeg() {
    return this.camHeading / deg
  }

  render() {
    const r = this.renderer
    this.frames++
    // Photos first (each draws the scene once from its own camera), then the screen's frame over it.
    if (this.shots.length && this.frames > 3) this.takePhoto(this.shots.shift()!)
    r.render(this.scene, this.rig.camera)
    this.stats.calls = r.info.render.calls
    this.stats.tris = r.info.render.triangles
  }

  private takePhoto({ kind, staged }: { kind: PhotoKind; staged: boolean }) {
    let cam: PerspectiveCamera | null = null
    const saved = staged ? this.saveStage() : null
    if (kind === 'selfie') cam = this.selfieCamera()
    else for (const p of this.parts) if ((cam = p.photoCamera?.(kind, staged) ?? null)) break
    if (cam) {
      // (A staged photo moved the boats: put their models where their drivers are now.)
      if (staged) for (const r of Object.values(this.rides)) this.poseRide(r, 0, this.time)
      this.scene.updateMatrixWorld()
      const src = snapPhoto(this.renderer, this.scene, cam)
      this.counts.photos++
      this.photoKinds.add(kind)
      this.events.onPhoto(kind, src)
    }
    saved?.()
  }

  /** Before a staged photo moves things round: how to put them back. */
  private saveStage() {
    const keep = Object.values(this.rides).map((r) => ({ r, x: r.d.x, z: r.d.z, h: r.d.heading }))
    const phase = this.phase
    return () => {
      for (const k of keep) k.r.d.place(k.x, k.z, k.h)
      if (phase !== 'board') this.seatAll(this.ride)
      else this.pier.begin(false)
      for (const r of this.riders) this.strike(r, null)
      for (const r of Object.values(this.rides)) this.poseRide(r, 0, this.time)
    }
  }

  /** Mommy's selfie: from her phone, held up in front of the boat, looking back at the three of them. */
  private selfieCamera() {
    const d = this.rides.longtail.d
    const sx = Math.sin(d.heading)
    const sz = Math.cos(d.heading)
    const at = new Vector3(d.x - sx * 1.2, 1.4, d.z - sz * 1.2)
    return photoCamera(46, d.x + sx * 2.4 - sz * 0.6, 2.4, d.z + sz * 2.4 + sx * 0.6, at.x, at.y, at.z)
  }

  placeAnchors() {
    this.overlay.place()
  }
  toScreen(at: Vector3, r: number, right: Vector3, max = 170) {
    return this.overlay.toScreen(at, r, right, max)
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const d = this.ride.d
    const r2 = (v: number) => Math.round(v * 100) / 100
    return {
      section: this.section,
      phase: this.phase,
      vehicle: this.using,
      where: this.cave.where(),
      pos: [r2(d.x), r2(d.z)],
      heading: r2(wrap(d.heading)),
      speed: r2(d.speed),
      airborne: d.airborne,
      boost: d.boostT > 0,
      goal: d.goal ? [r2(d.goal.x), r2(d.goal.z)] : null,
      route: this.route.length,
      lying: Object.fromEntries(this.riders.map((r) => [r.id, r.lying])),
      stops: [...this.stops],
      found: [...this.foundSet],
      sunset: this.sunset.active,
      /** Daddy's "where to?" look over the bay is on (the camera is up high). */
      looking: this.looking,
      steer: { mode: this.steer, gas: this.gasDown, tilt: r2(this.tilt?.value ?? 0), live: this.tilt?.live ?? false, waiting: this.waiting },
      ...this.pier.qa(),
      ...this.village.qa(),
      ...this.open.qa(),
      ...this.nail.qa(),
      ...this.counts,
      roof: { ...this.counts.roof },
    }
  }
  memory() {
    return { ...this.renderer.info.memory }
  }

  dispose() {
    this.scene.clear()
    this.bag.dispose()
  }
}


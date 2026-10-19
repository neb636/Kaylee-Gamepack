// Phang Nga Bay by longtail boat, greybox (plan: planning/around-the-world/thailand/boat-trip.md, "Build plan" step 1):
// the boat toy only, in placeholder shapes, so Dad can feel the driving on the iPad before anything is built for real.
//
// The toy (core verb): drive the longtail with one finger.
// - Finger on the water (or on the boat, then drag): the boat goes after it. Far ahead = fast, near = slow, held to one
//   side it keeps turning (doughnuts), behind it = a U-turn. Let go and it coasts and bobs. A tap = go there.
//   Both at once, Dad's pick (PR #99): a finger anywhere on the water, or one that grabs the boat and drags.
// - Tap the boat: VROOM. Bump a rock: boing (it slides round, never stuck). Cross the tour boat's wake fast: a jump.
// The verb deepens three ways, as planned: open water (rocks, the tour boat's wake), the cave (into the little yellow
// canoe, through a tunnel whose roof comes so low the family must lie down, or Daddy's horn bonks it, out into the hong),
// and the Nail Island (buoys bump her back; land on the beach for the photo).
import { Color, Fog, Plane, Raycaster, Scene, Vector2, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp } from '../../../../../../sdk'
import { Avatar } from '../../../characters/avatar'
import { FAMILY } from '../../../characters/family'
import { Member } from '../../../characters/member'
import type { AnchorInfo } from '../../../engine/Anchors'
import { CameraRig, type Shot } from '../../../engine/camera'
import { Bag } from '../../../engine/dispose'
import { TapMarker } from '../../../engine/marker'
import { setOutlineResolution } from '../../../engine/outline'
import { Particles } from '../../../engine/particles'
import { applyBands, makeLights, PAL } from '../../../engine/toon'
import type { World3D } from '../../../engine/View3D'
import { swell, Water } from '../../../engine/water'
import { sfx } from '../../../sfx'
import { Driver } from '../../../trip/drive'
import { buildCanoe } from '../../../trip/vehicles/canoe'
import { buildLongtail } from '../../../trip/vehicles/longtail'
import type { Vehicle } from '../../../trip/vehicles/vehicle'
import type { BoatSection } from '../sections'
import { BAY_START, BEACH, BEACH_GLOW, BEACH_OUT, BOUNDS, CANOE_START, CAVE_GLOW, CLIFFS, HONG, LONGTAIL_PARK, MOORED, NAIL, NAIL_LEAVE, NAIL_NEAR, NAIL_START, PIER, RING, ROCKS, SHORE_Z, TUNNEL, tunnelRoof } from './layout'
import { buildScenery, type Scenery } from './scenery'
import { TourBoat, WAKE_LIFE } from './tour'
import { BAY_TUNE } from './tune'

export interface BayEvents {
  /** She moved into another part of the bay (the address bar follows). */
  onSection(s: BoatSection): void
  /** The family landed on the Nail Island beach (true) or set off again (false). */
  onLanded(on: boolean): void
  /** The camera flashed. */
  onFlash(): void
}

type RiderId = 'kaylee' | 'ji' | 'nick'
type Pose3 = 'sit' | 'stand' | 'lie'
type Phase = 'board' | 'drive' | 'swap' | 'beach'
/** Where the canoe is: outside the cave, in the tunnel, or in the hong. */
type Where = 'open' | 'tunnel' | 'hong'

interface Rider {
  id: RiderId
  char: Avatar | Member
  height: number
  lying: boolean
  /** Lying under a roof too low to sit up: once it's high again, they sit up by themselves. */
  under: boolean
  /** Seconds the roof has been high enough to sit up again. */
  upT: number
  /** The roof ahead is lower than their horn (their tap target glows: "lie down!"). */
  warn: boolean
}

interface Ride {
  v: Vehicle
  d: Driver
  roll: { x: number; v: number }
  pitch: { x: number; v: number }
  /** 0 = just squashed (a bonk, a landing), 1 = settled. */
  squash: number
  travelled: number
}

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

export const BAY_ANCHORS: AnchorInfo[] = [
  { id: 'boat', label: 'Boat', kind: 'thing' },
  { id: 'family:kaylee', label: 'Kaylee', kind: 'family' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'glow:cave', label: 'The cave', kind: 'thing' },
  { id: 'glow:beach', label: 'The Nail Island beach', kind: 'thing' },
  { id: 'tour', label: 'Tour boat', kind: 'thing' },
]

const deg = Math.PI / 180
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
const wrapDeg = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180
const tmp = new Vector3()
const tmp2 = new Vector3()
/** Where a unicorn's horn tip is above their seat, sitting (a fraction of their height). */
const HORN = 1.09
/** Stopped and not touched for this long: a finger shows her what to do. */
const HINT_S = 8

export class Bay implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private water: Water
  private scenery: Scenery
  private tour: TourBoat
  private foam: Particles
  private spray: Particles
  private dust: Particles
  private marker: TapMarker
  private rides: { longtail: Ride; canoe: Ride }
  private using: 'longtail' | 'canoe' = 'longtail'
  private riders: Rider[]
  private hops: Hop[] = []
  private glide: Glide | null = null
  private phase: Phase = 'drive'
  private section: BoatSection
  private boardT = 0
  /** The cave's glow and the beach only take her once she has driven away from them again. */
  private caveArmed = true
  private beachArmed = true
  private beachPose: { x: number; z: number; h: number; along: number } | null = null
  private finger: { x: number; y: number; onBoat: boolean; steering: boolean } | null = null
  /** A tap's way round big things (Ko Tapu's buoys, the hong, the towers): the waypoints still ahead. */
  private route: { x: number; z: number }[] = []
  private raycaster = new Raycaster()
  private plane = new Plane(new Vector3(0, 1, 0), 0)
  private anchorEls = new Map<string, HTMLElement>()
  private hintEl: HTMLElement | null = null
  private w = 1
  private h = 1
  private time = 0
  private lastTouch = 0
  private camHeading = 0
  /** The family is on (or getting onto) the Nail Island beach: the photo camera. */
  private ashore = false
  private engineT = 0
  private paddleT = 0
  private jumpCool = 0
  private bonkCool = 0
  private buoyCool = 0
  private counts = { bonks: 0, buoys: 0, jumps: 0, vrooms: 0, photos: 0, roof: { kaylee: 0, ji: 0, nick: 0 } as Record<RiderId, number> }
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private quiet = true

  constructor(
    private renderer: WebGLRenderer,
    start: BoatSection,
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
    this.water = new Water({ size: 1600, deep: '#5FC7B4', shallow: '#78D4C1', haze, hazeNear: 120, hazeFar: 520 }, bag)
    this.scenery = buildScenery(bag)
    this.tour = new TourBoat(bag)
    this.foam = new Particles({ kind: 'foam', count: 480, opacity: 0.88 }, bag)
    this.spray = new Particles({ kind: 'spray', count: 280 }, bag)
    this.dust = new Particles({ kind: 'spray', count: 60, color: '#D3C7E2' }, bag)
    this.marker = new TapMarker(bag)
    scene.add(this.water.mesh, this.scenery.root, this.tour.root, this.foam.mesh, this.spray.mesh, this.dust.mesh, this.marker.root)

    const ride = (v: Vehicle): Ride => ({ v, d: new Driver(v.feel), roll: { x: 0, v: 0 }, pitch: { x: 0, v: 0 }, squash: 1, travelled: 0 })
    this.rides = { longtail: ride(buildLongtail(bag)), canoe: ride(buildCanoe(bag)) }
    for (const r of Object.values(this.rides)) {
      r.v.root.userData.pick = 'boat'
      scene.add(r.v.root)
    }
    const kaylee = new Avatar(bag)
    const member = (id: 'ji' | 'nick') => new Member(FAMILY.find((m) => m.id === id)!, bag)
    this.riders = [
      { id: 'kaylee', char: kaylee, height: kaylee.height, lying: false, under: false, upT: 0, warn: false },
      ...(['ji', 'nick'] as const).map((id) => {
        const m = member(id)
        return { id, char: m, height: m.height, lying: false, under: false, upT: 0, warn: false }
      }),
    ]

    this.section = start
    this.begin(start)
    this.quiet = false
  }

  private get ride() {
    return this.rides[this.using]
  }

  // ---------------------------------------------------------------- start / sections

  private begin(start: BoatSection) {
    const { longtail, canoe } = this.rides
    longtail.d.place(MOORED.x, MOORED.z, MOORED.heading)
    canoe.d.place(CANOE_START.x, CANOE_START.z, CANOE_START.heading)
    if (start === 'pier') {
      // Everyone waits on the pier; they hop in one by one.
      this.phase = 'board'
      const spots: [RiderId, number, number][] = [
        ['nick', PIER.x + 0.4, MOORED.z - 0.6],
        ['ji', PIER.x - 0.5, MOORED.z + 1.2],
        ['kaylee', PIER.x + 0.6, MOORED.z + 2.4],
      ]
      for (const [id, x, z] of spots) {
        const r = this.rider(id)
        this.scene.add(r.char.root)
        this.put(r, x, 1.03, z, 'stand', 90)
      }
    } else if (start === 'cave') {
      longtail.d.place(LONGTAIL_PARK.x, LONGTAIL_PARK.z, LONGTAIL_PARK.heading)
      this.using = 'canoe'
      this.caveArmed = false
      this.seatAll(canoe)
    } else {
      const s = start === 'nail' ? NAIL_START : BAY_START
      longtail.d.place(s.x, s.z, s.heading)
      this.seatAll(longtail)
    }
    for (const r of Object.values(this.rides)) this.poseRide(r, 0, 0)
    this.camHeading = this.ride.d.heading
    this.rig.setShot(this.shot(), true)
  }

  private rider(id: RiderId) {
    return this.riders.find((r) => r.id === id)!
  }

  /** Everyone in their seats at once (a deep link). */
  private seatAll(ride: Ride) {
    for (const r of this.riders) {
      r.lying = r.under = false
      ride.v.body.add(r.char.root)
      const p = this.seatPos(ride.v, r, this.poseIn(ride.v, r))
      this.put(r, p.x, p.y, p.z, this.poseIn(ride.v, r))
    }
  }

  private poseIn(v: Vehicle, r: Rider): Pose3 {
    return r.lying ? 'lie' : v.seats[r.id].stand ? 'stand' : 'sit'
  }
  private seatPos(v: Vehicle, r: Rider, pose: Pose3) {
    const s = v.seats[r.id]
    const member = !(r.char instanceof Avatar)
    const y = pose === 'lie' ? s.y - 0.2 : pose === 'sit' && member ? s.y - 0.1 * r.height : s.y
    return new Vector3(s.x, y, s.z)
  }
  /** Puts someone somewhere (local to whatever they're riding), standing, sitting or lying back. */
  private put(r: Rider, x: number, y: number, z: number, pose: Pose3, face = 0) {
    if (r.char instanceof Avatar) {
      r.char.place(x, y, z, face)
      r.char.setPose(pose)
    } else r.char.place(x, y, z, face, pose)
  }

  private setSection(s: BoatSection) {
    if (s === this.section) return
    this.section = s
    if (!this.quiet) this.events.onSection(s)
  }

  // ---------------------------------------------------------------- input

  setAnchorElements(els: Map<string, HTMLElement>) {
    this.anchorEls = els
  }
  setHintElement(el: HTMLElement | null) {
    this.hintEl = el
  }

  private get canDrive() {
    return this.phase === 'drive'
  }

  pointerDown(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    const hit = id ?? this.pick(x, y)
    const onBoat = hit === 'boat' || !!hit?.startsWith('family:')
    // A finger drives at once, even on the family (in the canoe they fill the middle of the screen); on the boat itself
    // only once it moves (a tap there is a VROOM).
    this.finger = { x, y, onBoat, steering: this.canDrive && hit !== 'boat' && !hit?.startsWith('glow:') && hit !== 'tour' }
  }
  pointerMove(x: number, y: number, downX: number, downY: number, held: boolean) {
    const f = this.finger
    if (!held || !f) return
    f.x = x
    f.y = y
    if (!f.steering && this.canDrive && Math.hypot(x - downX, y - downY) > 12) f.steering = true
  }
  pointerUp() {
    if (this.finger?.steering) this.ride.d.release()
    this.finger = null
  }

  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    const target = id ?? this.pick(x, y)
    if (this.phase === 'board') {
      this.boardT = Math.max(this.boardT, 1)
      return
    }
    if (this.phase === 'swap') return
    if (this.phase === 'beach') {
      if (target === 'boat') this.reboard()
      else if (target?.startsWith('family:')) this.cheer(this.rider(target.slice(7) as RiderId))
      return
    }
    if (target === 'boat') return this.vroom()
    if (target?.startsWith('family:')) return this.poke(this.rider(target.slice(7) as RiderId))
    if (target === 'glow:cave') return this.driveTo(CAVE_GLOW.x, CAVE_GLOW.z)
    if (target === 'glow:beach') return this.driveTo(BEACH_GLOW.x, BEACH_GLOW.z)
    if (target === 'tour') {
      sfx.horn()
      this.rider('nick').char.react('wave')
      return
    }
    const p = this.aim(x, y)
    if (p) this.driveTo(p.x, p.z)
  }

  /** Where a finger on the screen sends the boat: the spot on the water under it, or in the tunnel, along it: above
   *  the canoe on the screen = paddle on (further up = faster), below it = back up. */
  private aim(x: number, y: number) {
    if (this.using !== 'canoe' || this.funnel() !== 'in') return this.waterPoint(x, y)
    const d = this.ride.d
    const at = tmp.set(d.x, 0.3, d.z).project(this.rig.camera)
    const up = ((1 - at.y) / 2) * this.h - y
    return new Vector3(TUNNEL.x, 0, d.z + Math.cos(d.lock ?? d.heading) * (up / this.h) * 40)
  }

  private driveTo(x: number, z: number) {
    const [tx, tz] = this.steerPoint(x, z)
    const d = this.ride.d
    const way = [...(this.using === 'longtail' ? this.around(d.x, d.z, tx, tz) : []), { x: tx, z: tz }]
    const first = way.shift()!
    d.goto(first.x, first.z, way.length > 0)
    this.route = way
    this.marker.show(x, 0, z)
  }

  /** Waypoints round whatever big thing stands between here and there (the straight line, bent round it). */
  private around(x: number, z: number, tx: number, tz: number) {
    const big: [number, number, number][] = [[NAIL.x, NAIL.z, NAIL.buoys + 5], [HONG.x, HONG.z, HONG.outer + 5], ...ROCKS.map((r): [number, number, number] => [r.x, r.z, r.r + 5]), ...CLIFFS.map((r): [number, number, number] => [r.x, r.z, r.r + 5])]
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

  /** What's under a screen point: 'boat', 'family:<id>', 'tour', 'glow:<stop>', or null. */
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
  private waterPoint(x: number, y: number) {
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

  /** In the tunnel (and at its two ends) the canoe can only go along it: aim at the point on its middle line. */
  private steerPoint(x: number, z: number): [number, number] {
    if (this.using === 'canoe' && this.funnel() !== null) return [TUNNEL.x, z]
    return [x, z]
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
      r.pitch.v -= 1.6
      this.splashAt(r, r.v.stern, 14)
      this.rider('ji').char.react('wiggle')
    }
    this.counts.vrooms++
  }

  /** Tapping someone in the boat: in the canoe they lie back (or sit up); in the longtail they hop and wave. */
  private poke(r: Rider) {
    if (this.using === 'canoe') {
      r.lying = !r.lying
      r.under = false
      r.upT = 0
      this.sitOrLie(r)
      sfx.pop()
      return
    }
    this.cheer(r)
  }

  private sitOrLie(r: Rider) {
    const v = this.ride.v
    const pose = this.poseIn(v, r)
    const p = this.seatPos(v, r, pose)
    this.put(r, p.x, p.y, p.z, pose)
  }

  private cheer(r: Rider) {
    r.char.react('hop')
    r.char.react('wave')
    sfx.boing()
  }

  /** The camera's flash on the beach: everyone hops for the photo. */
  snap() {
    if (this.phase !== 'beach') return
    this.lastTouch = this.time
    sfx.shutter()
    this.events.onFlash()
    this.counts.photos++
    this.riders.forEach((r, i) => setTimeout(() => r.char.react('hop'), 120 + i * 90))
  }

  /** Someone hops from wherever they are to a spot on `parent` (a boat, or the world). */
  private hop(r: Rider, parent: Object3D, to: Vector3, pose: Pose3, face: number, delay: number, done?: () => void) {
    this.hops.push({ r, parent, to, pose, face, delay, t: 0, dur: 0.42, arc: 0.7, done })
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
  private glideTo(ride: Ride, to: { x: number; z: number; h: number }, dur: number, done: () => void) {
    ride.d.stop()
    this.glide = { ride, from: { x: ride.d.x, z: ride.d.z, h: ride.d.heading }, to: { ...to, h: ride.d.heading + wrap(to.h - ride.d.heading) }, t: 0, dur, done }
  }

  private updateGlide(dt: number) {
    const g = this.glide
    if (!g) return
    g.t += dt / g.dur
    const k = Math.min(1, g.t)
    const e = k * k * (3 - 2 * k)
    g.ride.d.place(g.from.x + (g.to.x - g.from.x) * e, g.from.z + (g.to.z - g.from.z) * e, g.from.h + (g.to.h - g.from.h) * e)
    if (k >= 1) {
      this.glide = null
      g.done()
    }
  }

  /** Into the little canoe at the cave's mouth. */
  private toCanoe() {
    this.phase = 'swap'
    const { longtail, canoe } = this.rides
    this.glideTo(longtail, { x: LONGTAIL_PARK.x, z: LONGTAIL_PARK.z, h: LONGTAIL_PARK.heading }, 0.9, () => {
      this.riders.forEach((r, i) => {
        r.lying = r.under = false
        this.hop(r, canoe.v.body, this.seatPos(canoe.v, r, 'sit'), 'sit', 0, i * 0.28, i === 2 ? () => this.swapped('canoe') : undefined)
      })
    })
  }

  /** Back into the longtail when the canoe comes out of the cave. */
  private toLongtail() {
    this.phase = 'swap'
    const { longtail, canoe } = this.rides
    this.glideTo(canoe, { x: CANOE_START.x, z: CANOE_START.z, h: CANOE_START.heading }, 0.8, () => {
      this.riders.forEach((r, i) => {
        r.lying = r.under = false
        const pose = this.poseIn(longtail.v, r)
        this.hop(r, longtail.v.body, this.seatPos(longtail.v, r, pose), pose, 0, i * 0.28, i === 2 ? () => this.swapped('longtail') : undefined)
      })
    })
  }

  private swapped(to: 'longtail' | 'canoe') {
    this.using = to
    this.phase = 'drive'
    this.caveArmed = false
    this.camHeading = this.ride.d.heading
    this.setSection(to === 'canoe' ? 'cave' : 'bay')
  }

  /** The longtail noses onto the Nail Island beach; everyone hops off and lines up for the photo. */
  private land() {
    this.phase = 'swap'
    const r = this.rides.longtail
    const [ox, oz] = BEACH_OUT
    const px = oz
    const pz = -ox
    const along = clamp((r.d.x - BEACH.x) * px + (r.d.z - BEACH.z) * pz, -6, 6)
    const h = Math.atan2(-ox, -oz)
    const shore = 4.3
    const x = BEACH.x + px * along + ox * (shore + r.v.bow - 1.2)
    const z = BEACH.z + pz * along + oz * (shore + r.v.bow - 1.2)
    this.beachPose = { x, z, h, along }
    this.ashore = true
    sfx.splash(0.6)
    this.glideTo(r, { x, z, h }, 0.9, () => {
      const base = (s: number, f: number) => new Vector3(BEACH.x + px * (along + s) + ox * f, 0.32, BEACH.z + pz * (along + s) + oz * f)
      // Kaylee in front, Mommy and Daddy behind her, the boat behind them (the camera stands nearer the cliffs).
      const spots: [RiderId, Vector3][] = [
        ['kaylee', base(0, 0.3)],
        ['ji', base(-1.25, 1.3)],
        ['nick', base(1.3, 1.25)],
      ]
      spots.forEach(([id, at], i) => {
        const rd = this.rider(id)
        rd.lying = rd.under = false
        this.hop(rd, this.scene, at, 'stand', h / deg, i * 0.25, i === 2 ? () => this.landed() : undefined)
      })
    })
  }

  private landed() {
    this.phase = 'beach'
    for (const r of this.riders) this.cheer(r)
    this.events.onLanded(true)
  }

  /** Back in the boat: it backs off the beach and spins round to face the bay. */
  private reboard() {
    const lt = this.rides.longtail
    const bp = this.beachPose
    if (!bp) return
    this.phase = 'swap'
    this.events.onLanded(false)
    this.riders.forEach((r, i) => {
      const pose = this.poseIn(lt.v, r)
      this.hop(r, lt.v.body, this.seatPos(lt.v, r, pose), pose, 0, i * 0.2, i !== 2 ? undefined : () => {
        this.ashore = false
        this.glideTo(lt, { x: bp.x + BEACH_OUT[0] * 8, z: bp.z + BEACH_OUT[1] * 8, h: bp.h + Math.PI }, 1.4, () => {
          this.phase = 'drive'
          this.beachArmed = false
          this.camHeading = lt.d.heading
        })
      })
    })
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

  /** In or near the tunnel (the canoe goes only along it there): 'in', 'mouth', 'inner', or null. */
  private funnel(): 'in' | 'mouth' | 'inner' | null {
    const d = this.rides.canoe.d
    const off = Math.abs(d.x - TUNNEL.x)
    if (off < TUNNEL.half + 0.6 && d.z <= TUNNEL.z0 + 0.3 && d.z >= TUNNEL.z1 - 0.3) return 'in'
    if (off < 6 && d.z > TUNNEL.z0 && d.z < TUNNEL.z0 + 7) return 'mouth'
    if (off < 6 && d.z < TUNNEL.z1 && d.z > TUNNEL.z1 - 7) return 'inner'
    return null
  }
  private where(): Where {
    if (this.using !== 'canoe') return 'open'
    const d = this.rides.canoe.d
    if (this.funnel() === 'in') return 'tunnel'
    return Math.hypot(d.x - HONG.x, d.z - HONG.z) < HONG.inner ? 'hong' : 'open'
  }

  get calm() {
    const d = this.ride.d
    return Math.abs(d.speed) < 0.05 && !d.airborne && !this.hops.length && !this.glide && !this.finger && !this.foam.busy && !this.spray.busy && !this.rig.moving && this.phase !== 'board'
  }

  update(dt: number) {
    this.time += dt
    const t = this.time
    const ride = this.ride
    const d = ride.d

    if (this.phase === 'board') this.updateBoarding(dt)
    this.updateHops(dt)
    this.updateGlide(dt)

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
        const [tx, tz] = this.steerPoint(p.x, p.z)
        d.hold(tx, tz)
      }
    }
    const before = { x: d.x, z: d.z }
    if (!this.glide) {
      const ev = d.step(dt)
      if (ev.landed !== undefined && ev.landed > 1.2) this.landSplash(ride, ev.landed)
      if (this.using === 'canoe' && this.canDrive) this.canoeRules(dt)
      this.collide(ride)
    }
    ride.travelled += Math.hypot(d.x - before.x, d.z - before.z)
    this.jumpCool -= dt
    this.bonkCool -= dt
    this.buoyCool -= dt
    if (this.using === 'longtail' && this.canDrive) {
      this.wakeJumps()
      this.stops()
    }
    if (this.using === 'canoe' && this.canDrive) this.roof(dt)

    // ---- The boats, the family in them, the bay ----
    for (const r of Object.values(this.rides)) this.poseRide(r, dt, t)
    this.trail(ride, dt)
    for (const r of this.riders) {
      const goal = d.goal
      if (goal && this.phase === 'drive') r.char.lookAt(goal.x, 1, goal.z)
      else r.char.lookAway()
      r.char.update(dt, t)
    }
    this.tour.update(t, dt, this.foam)
    this.water.update(t)
    this.foam.update(dt)
    this.spray.update(dt)
    this.dust.update(dt)
    this.marker.update(dt)
    const glowOn = this.using === 'longtail' && this.phase !== 'beach'
    this.scenery.glows.cave.visible = glowOn && this.caveArmed
    this.scenery.glows.beach.visible = glowOn && this.beachArmed
    for (const g of [this.scenery.glows.cave, this.scenery.glows.beach]) g.scale.setScalar(1 + Math.sin(t * 2.2) * 0.04)
    this.scenery.buoys.position.y = Math.sin(t * 1.6) * 0.05
    this.sounds(dt)

    // ---- Where she is (the address bar), and the camera ----
    this.updateSection()
    this.camHeading += wrap(d.heading - this.camHeading) * (1 - Math.exp(-dt / BAY_TUNE.camLag))
    this.rig.setShot(this.shot())
    this.rig.lag = this.where() === 'hong' ? 0.6 : this.where() === 'tunnel' ? 0.25 : 0.35
    this.rig.update(dt)
    // The sun stays on the camera's side (behind it, up and to the right), so what she looks at is lit.
    const cam = this.rig.camera
    const back = tmp.set(cam.position.x - d.x, 0, cam.position.z - d.z).normalize()
    this.lights.follow(d.x, 0, d.z)
    this.lights.sun.position.set(d.x + back.x * 7 - back.z * 4, 10, d.z + back.z * 7 + back.x * 4)
  }

  private updateBoarding(dt: number) {
    this.boardT += dt
    if (this.boardT < 1 || this.hops.length || this.phase !== 'board') return
    if (this.riders.some((r) => r.char.root.parent === this.rides.longtail.v.body)) return
    const lt = this.rides.longtail
    // Daddy first (the boat tips: whoa!), then Mommy, then Kaylee hops to the tiller.
    ;(['nick', 'ji', 'kaylee'] as const).forEach((id, i) => {
      const r = this.rider(id)
      const pose = this.poseIn(lt.v, r)
      this.hop(r, lt.v.body, this.seatPos(lt.v, r, pose), pose, 0, i * 0.55, () => {
        lt.roll.v += i % 2 ? -2.2 : 2.6
        lt.squash = 0
        if (i === 2) this.phase = 'drive'
      })
    })
  }

  /** The canoe's own rules: along the tunnel only, gently lined up at both ends, and back to the longtail outside. */
  private canoeRules(dt: number) {
    const d = this.rides.canoe.d
    const f = this.funnel()
    if (f === 'in') {
      if (d.lock === null) d.lock = Math.abs(wrap(d.heading - Math.PI)) < Math.PI / 2 ? Math.PI : 0
      const lim = TUNNEL.half - 0.5
      const off = d.x - TUNNEL.x
      if (Math.abs(off) > lim) {
        d.x = TUNNEL.x + Math.sign(off) * lim
        d.bounce(-Math.sign(off), 0, 0.2)
      }
    } else {
      d.lock = null
      // Lined up with the tunnel when she paddles toward it.
      const k = Math.min(1, dt * 2.5)
      const wantIn = f === 'mouth' ? Math.PI : f === 'inner' ? 0 : null
      if (wantIn !== null && Math.abs(wrap(d.heading - wantIn)) < 1.3) {
        d.x += (TUNNEL.x - d.x) * k
        d.heading += wrap(wantIn - d.heading) * k
      }
    }
    if (this.where() === 'open' && f !== 'mouth' && (d.z > TUNNEL.z0 + 7 || Math.abs(d.x - TUNNEL.x) > 7) && d.z > HONG.z) this.toLongtail()
  }

  /** The tunnel's roof: sitting up under a low roof, a unicorn's horn bonks it and they lie down. Once they've been
   *  under the low roof and it's high again, they sit back up (lying down early, they stay down until then). */
  private roof(dt: number) {
    const ride = this.rides.canoe
    const d = ride.d
    const inside = Math.abs(d.x - TUNNEL.x) < TUNNEL.half + 1.5
    for (const r of this.riders) {
      const seat = ride.v.seats[r.id]
      const z = d.z + Math.cos(d.heading) * seat.z
      const roof = inside ? tunnelRoof(z) : 99
      const top = seat.y + HORN * r.height
      const ahead = inside ? tunnelRoof(z + Math.cos(d.heading) * Math.sign(d.speed || 1) * 2.5) : 99
      r.warn = !r.lying && ahead < top
      if (r.lying && roof < top) r.under = true
      if (!r.lying && top > roof) {
        r.lying = true
        r.under = true
        r.upT = 0
        this.counts.roof[r.id]++
        r.char.react('wiggle')
        this.sitOrLie(r)
        sfx.boink()
        d.vx *= 0.4
        d.vz *= 0.4
        this.dust.burst(d.x, roof - 0.05, z, 10, 1.2, -0.5, 0.14)
        if (r.id === 'nick') this.rider('ji').char.react('hop')
      } else if (r.lying && r.under) {
        r.upT = roof > top + 0.4 ? r.upT + dt : 0
        // Out of the low part: "Ahh!" and they sit up again.
        if (r.upT > 0.9) {
          r.lying = false
          r.under = false
          this.sitOrLie(r)
          r.char.react('hop')
        }
      }
    }
  }

  /** Bumps: rocks, the hong's cliffs, Ko Tapu's buoys, the tour boat, the pier, the shore and the bay's edge. */
  private collide(ride: Ride) {
    const d = ride.d
    const v = ride.v
    const sx = Math.sin(d.heading)
    const sz = Math.cos(d.heading)
    const circles: [number, number, number][] = this.circles()
    for (const at of v.hull.at) {
      const px = d.x + sx * at
      const pz = d.z + sz * at
      for (const [cx, cz, cr] of circles) {
        const dx = px - cx
        const dz = pz - cz
        const min = cr + v.hull.r
        const dd = dx * dx + dz * dz
        if (dd >= min * min || dd < 1e-8) continue
        const dist = Math.sqrt(dd)
        const nx = dx / dist
        const nz = dz / dist
        d.x += nx * (min - dist)
        d.z += nz * (min - dist)
        const hit = d.bounce(nx, nz)
        if (hit > 1.2) this.bonk(ride, px - nx * v.hull.r, pz - nz * v.hull.r, hit)
      }
      // Ko Tapu's buoys: a soft, springy ring that pushes the boat back out.
      if (this.using === 'longtail') {
        const dx = px - NAIL.x
        const dz = pz - NAIL.z
        const dist = Math.hypot(dx, dz)
        const min = NAIL.buoys + v.hull.r
        if (dist < min) {
          d.x += (dx / dist) * (min - dist)
          d.z += (dz / dist) * (min - dist)
          const hit = d.bounce(dx / dist, dz / dist, 0.8)
          if (hit > 0.6 && this.buoyCool <= 0) {
            this.buoyCool = 0.4
            this.counts.buoys++
            sfx.boop()
            ride.squash = 0.4
            this.splashAt(ride, at, 5)
          }
        }
      }
      // The shore behind the pier.
      if (pz > SHORE_Z - 2) {
        d.z -= pz - (SHORE_Z - 2)
        const hit = d.bounce(0, -1)
        if (hit > 1.2) this.bonk(ride, px, SHORE_Z - 2, hit)
      }
    }
    // The bay's edge: a current turns her back.
    const ex = d.x - BOUNDS.x
    const ez = d.z - BOUNDS.z
    const e = Math.hypot(ex, ez)
    if (e > BOUNDS.r) {
      d.x -= (ex / e) * (e - BOUNDS.r)
      d.z -= (ez / e) * (e - BOUNDS.r)
      d.bounce(-ex / e, -ez / e, 0.6)
    }
  }

  /** Every bump circle near the boat in use. */
  private circles(): [number, number, number][] {
    const d = this.ride.d
    const near = (x: number, z: number, r: number) => Math.abs(x - d.x) < r + 12 && Math.abs(z - d.z) < r + 12
    const out: [number, number, number][] = []
    for (const r of ROCKS) if (near(r.x, r.z, r.r)) out.push([r.x, r.z, r.r])
    for (const r of RING) if (near(r.x, r.z, r.r)) out.push([r.x, r.z, r.r])
    for (const r of CLIFFS) if (near(r.x, r.z, r.r)) out.push([r.x, r.z, r.r])
    if (near(NAIL.x, NAIL.z, NAIL.r)) out.push([NAIL.x, NAIL.z, NAIL.r])
    for (let z = PIER.z0; z <= PIER.z1; z += 2) if (near(PIER.x, z, 1.7)) out.push([PIER.x, z, 1.7])
    if (this.using === 'longtail') {
      // The longtail is too big for the tunnel: the mouth stops it (the canoe goes in).
      out.push([TUNNEL.x, TUNNEL.z0 + 0.5, 2.6])
      out.push(...this.tour.circles())
    }
    return out
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
  }

  /** Crossing the tour boat's wake fast: the longtail hops off it like a ramp. */
  private wakeJumps() {
    const d = this.rides.longtail.d
    if (this.jumpCool > 0 || d.airborne) return
    const now = this.time
    for (const r of this.tour.ridges) {
      if (now - r.t > WAKE_LIFE || Math.hypot(d.x - r.x, d.z - r.z) > 2.6) continue
      const across = Math.abs(d.vx * r.dz - d.vz * r.dx)
      if (across < 3) continue
      d.jump(2.4 + Math.abs(d.speed) * 0.22)
      this.jumpCool = 1.2
      this.counts.jumps++
      sfx.vroom()
      this.splashAt(this.rides.longtail, 0, 10)
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
  }

  /** The longtail reaching a stop: the cave's raft (into the canoe), the Nail Island beach (the photo). */
  private stops() {
    const d = this.rides.longtail.d
    const v = this.rides.longtail.v
    const bx = d.x + Math.sin(d.heading) * v.bow
    const bz = d.z + Math.cos(d.heading) * v.bow
    if (!this.caveArmed && Math.hypot(d.x - CAVE_GLOW.x, d.z - CAVE_GLOW.z) > CAVE_GLOW.r + 5) this.caveArmed = true
    if (!this.beachArmed && Math.hypot(d.x - BEACH_GLOW.x, d.z - BEACH_GLOW.z) > BEACH_GLOW.r + 9) this.beachArmed = true
    if (this.caveArmed && Math.hypot(bx - CAVE_GLOW.x, bz - CAVE_GLOW.z) < CAVE_GLOW.r) return this.toCanoe()
    // The beach: the glow, or anywhere along the sand.
    const [ox, oz] = BEACH_OUT
    const out = (bx - BEACH.x) * ox + (bz - BEACH.z) * oz
    const side = (bx - BEACH.x) * oz - (bz - BEACH.z) * ox
    const onSand = out < BEACH.d / 2 + 1 && out > -BEACH.d && Math.abs(side) < BEACH.w / 2
    if (this.beachArmed && (onSand || Math.hypot(bx - BEACH_GLOW.x, bz - BEACH_GLOW.z) < BEACH_GLOW.r)) this.land()
  }

  private updateSection() {
    if (this.phase === 'swap' || this.phase === 'board') return
    if (this.using === 'canoe') return this.setSection('cave')
    const d = this.rides.longtail.d
    const nail = Math.hypot(d.x - NAIL.x, d.z - NAIL.z)
    if (this.phase === 'beach' || nail < NAIL_NEAR || (this.section === 'nail' && nail < NAIL_LEAVE)) return this.setSection('nail')
    if (this.section === 'pier' && Math.hypot(d.x - MOORED.x, d.z - MOORED.z) < 25) return
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
    const bowUp = (d.boostT > 0 ? 0.07 : 0) + 0.012 * Math.max(0, sp) + (d.airborne ? clamp(d.vy * 0.025, -0.1, 0.1) : 0)
    stepSpring(r.pitch, -bowUp, 40, 7)
    r.squash = Math.min(1, r.squash + dt / 0.45)
    const w = swell(d.x, d.z, t) * (this.using === 'canoe' && this.where() === 'tunnel' ? 0.3 : 1)
    v.root.position.set(d.x, w + d.y, d.z)
    v.root.rotation.set(0, d.heading, 0)
    v.body.rotation.set(r.pitch.x + Math.sin(t * 1.3 + d.x) * 0.012, 0, d.roll + r.roll.x * 0.12 + Math.sin(t * 1.1 + d.z) * 0.015)
    const s = r.squash < 1 ? Math.cos(r.squash * Math.PI * 3) * (1 - r.squash) ** 2 : 0
    v.body.scale.set(1 + 0.08 * s, 1 - 0.16 * s, 1 + 0.04 * s)
    v.animate(clamp(d.yawRate / d.feel.turn, -1, 1), Math.min(1, Math.abs(sp)), t, dt)
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
    const fast = Math.max(0, speed / v.feel.top - 0.4) + (d.boostT > 0 ? 0.6 : 0)
    let n = fast * 70 * dt
    while (n > 0) {
      if (n < 1 && Math.random() > n) break
      n--
      const px = d.x + sx * v.stern
      const pz = d.z + sz * v.stern
      const r = (Math.random() - 0.5) * 1.5
      this.spray.emit(px, 0.2, pz, -sx * (2 + speed * 0.25) + sz * r, 3 + fast * 4 + Math.random() * 2, -sz * (2 + speed * 0.25) - sx * r, 0.7, 0.2 + Math.random() * 0.15)
    }
    // Hard turns at speed throw spray off the bow.
    if (Math.abs(d.yawRate) > v.feel.turn * 0.6 && speed > v.feel.top * 0.5 && Math.random() < dt * 20) {
      const side = Math.sign(d.yawRate)
      this.spray.emit(d.x + sx * 2, 0.3, d.z + sz * 2, -sz * side * 3, 2.5, sx * side * 3, 0.5, 0.2)
    }
  }

  private splashAt(ride: Ride, along: number, n: number) {
    const d = ride.d
    this.spray.burst(d.x + Math.sin(d.heading) * along, 0.25, d.z + Math.cos(d.heading) * along, n, 2.2, 3.5, 0.22)
  }

  /** The longtail's putt-putt (louder and faster the faster it goes), the canoe's paddle. */
  private sounds(dt: number) {
    const d = this.ride.d
    const sp = Math.min(1.4, Math.abs(d.speed) / d.feel.top)
    if (this.using === 'longtail') {
      if (sp < 0.04 && !d.driven) return
      this.engineT += dt
      const every = 1 / (3.5 + 10 * sp)
      if (this.engineT > every) {
        this.engineT = 0
        sfx.engine(Math.min(1, sp))
      }
    } else if (sp > 0.15) {
      this.paddleT += dt * (0.8 + sp * 1.4)
      if (this.paddleT > 1) {
        this.paddleT = 0
        sfx.paddle()
      }
    }
  }

  /** The camera's goal: behind the boat on open water, from the side in the tunnel, from above into the hong, low and
   *  straight-on for the photo on the beach. */
  private shot(): Shot {
    const d = this.ride.d
    const unwrap = (yaw: number) => this.rig.yaw + wrapDeg(yaw - this.rig.yaw)
    const bp = this.beachPose
    if (this.ashore && bp) {
      const [ox, oz] = BEACH_OUT
      const cx = BEACH.x + oz * bp.along + ox * 0.8
      const cz = BEACH.z - ox * bp.along + oz * 0.8
      // Looking from the cliffs over the family straight at Ko Tapu, so it stands right behind them. Never further back
      // than the cliffs (a narrow phone screen would need more room to fit them all: they fill its width instead).
      const tall = this.w < this.h
      return { center: new Vector3(cx, tall ? 2.6 : 2.2, cz), half: new Vector3(tall ? 1.9 : 2.8, 2.2, 1), yaw: unwrap(Math.atan2(cx - NAIL.x, cz - NAIL.z) / deg), pitch: 6, minDist: 6, maxDist: 10, follow: true }
    }
    const behind = unwrap(this.camHeading / deg + 180)
    const f = this.using === 'canoe' ? this.funnel() : null
    if (f === 'in' || f === 'mouth') {
      // In the tunnel (and lining up at its mouth): close behind the canoe and as high as the roof over the camera
      // allows, looking down over Kaylee at the roof coming down. It tilts rather than sinks, so the canoe stays in the
      // same place on the screen.
      const dist = 4.6
      const camY = Math.min(tunnelRoof(d.z - Math.cos(d.heading) * dist) - 0.25, 2.4)
      const pitch = Math.asin(clamp((camY - 0.35) / dist, 0.05, 0.6)) / deg
      return { center: new Vector3(TUNNEL.x, 0.35, d.z), half: new Vector3(1, 0.5, 1), yaw: behind, pitch, minDist: dist, maxDist: dist, follow: true }
    }
    // The hong from high above: a secret room open to the sky.
    if (this.where() === 'hong') return { center: new Vector3(HONG.x + (d.x - HONG.x) * 0.3, 0, HONG.z + (d.z - HONG.z) * 0.3), half: new Vector3(13, 2, 13), yaw: behind, pitch: 76, minDist: 30, maxDist: 110, follow: true }
    const canoe = this.using === 'canoe'
    const sp = clamp(Math.abs(d.speed) / d.feel.top, 0, 1.6)
    // Faster = a little wider; a tall screen frames a narrower box (a bigger boat), the extra height goes to the towers.
    const tall = clamp((1 - this.w / this.h) / 0.4, 0, 1)
    const zoom = Math.round((canoe ? 1 : 1 + 0.18 * sp) * (1 - 0.3 * tall) * 10) / 10
    const ahead = canoe ? 2 : BAY_TUNE.camAhead * Math.min(1, 0.4 + sp)
    const board = this.phase === 'board'
    return {
      center: new Vector3(d.x + Math.sin(d.heading) * ahead - (board ? 1.2 : 0), board ? 1.2 : 1, d.z + Math.cos(d.heading) * ahead),
      half: canoe ? new Vector3(4.2 * zoom, 1.5, 4.5) : board ? new Vector3(5 * zoom, 2, 5) : new Vector3(BAY_TUNE.camWide * zoom, 2.2, BAY_TUNE.camDeep * zoom),
      yaw: behind + BAY_TUNE.camSide,
      pitch: canoe ? 26 : BAY_TUNE.camPitch,
      minDist: canoe ? 5 : 7,
      maxDist: 90,
      follow: true,
    }
  }

  render() {
    const r = this.renderer
    r.render(this.scene, this.rig.camera)
    this.stats.calls = r.info.render.calls
    this.stats.tris = r.info.render.triangles
  }

  /** The DOM tap targets over the boat, the family, the stops and the tour boat; and the "do this" finger. */
  placeAnchors() {
    const cam = this.rig.camera
    const right = tmp2.set(1, 0, 0).applyQuaternion(cam.quaternion)
    const drive = this.phase === 'drive'
    const longtail = this.using === 'longtail'
    for (const [id, el] of this.anchorEls) {
      let at: Vector3 | null = null
      let r = 1
      let warn = false
      if (id === 'boat' && (drive || this.phase === 'beach')) {
        at = this.ride.v.root.getWorldPosition(tmp).setY(0.5)
        r = longtail ? 2.2 : 1.2
        // On the beach the family stands in front of the bow: the boat's tap target is its back end, above them.
        if (this.phase === 'beach') at.addScaledVector(tmp2.set(Math.sin(this.ride.d.heading), 0, Math.cos(this.ride.d.heading)), -2.6)
      } else if (id.startsWith('family:') && ((drive && !longtail) || this.phase === 'beach')) {
        const rd = this.rider(id.slice(7) as RiderId)
        at = rd.char.root.getWorldPosition(tmp)
        at.y += rd.lying ? 0.35 : rd.height * 0.75
        r = rd.height * 0.4
        warn = rd.warn
      } else if (id === 'glow:cave' && drive && longtail && this.caveArmed) {
        at = tmp.set(CAVE_GLOW.x, 3, CAVE_GLOW.z)
        r = 4
      } else if (id === 'glow:beach' && drive && longtail && this.beachArmed) {
        at = tmp.set(BEACH_GLOW.x, 3, BEACH_GLOW.z)
        r = 4
      } else if (id === 'tour' && drive && longtail) {
        at = tmp.set(this.tour.x, 2, this.tour.z)
        r = 4
      }
      const screen = at ? this.toScreen(at, r, right, id.startsWith('family:') ? 110 : 170) : null
      if (screen) {
        el.style.transform = `translate3d(${(screen.x - screen.size / 2).toFixed(1)}px, ${(screen.y - screen.size / 2).toFixed(1)}px, 0)`
        el.style.width = el.style.height = `${screen.size.toFixed(0)}px`
        el.style.zIndex = String(screen.z)
        el.style.boxShadow = warn ? '0 0 0 6px rgba(255,79,154,.6), 0 0 24px 8px rgba(255,200,61,.7)' : ''
      }
      const want = screen ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
    this.placeHint(right)
  }

  private toScreen(at: Vector3, r: number, right: Vector3, max = 170) {
    const cam = this.rig.camera
    const center = at.clone().project(cam)
    if (center.z > 1 || Math.abs(center.x) > 1.05 || Math.abs(center.y) > 1.05) return null
    const edge = at.clone().addScaledVector(right, r).project(cam)
    return {
      x: ((center.x + 1) / 2) * this.w,
      y: ((1 - center.y) / 2) * this.h,
      size: clamp(Math.abs(edge.x - center.x) * this.w, 64, max),
      z: Math.round((1 - center.z) * 10000),
    }
  }

  /** Stopped and untouched for a while: a finger shows her what to do (press the water ahead, or the boat). */
  private placeHint(right: Vector3) {
    const el = this.hintEl
    if (!el) return
    const d = this.ride.d
    const idle = this.time - this.lastTouch > HINT_S && Math.abs(d.speed) < 0.6 && !this.finger
    let at: Vector3 | null = null
    if (idle && this.phase === 'beach') at = this.ride.v.root.getWorldPosition(new Vector3()).setY(0.6)
    else if (idle && this.phase === 'drive') {
      const ahead = this.using === 'canoe' ? 4 : 10
      at = new Vector3(d.x + Math.sin(d.heading) * ahead, 0.3, d.z + Math.cos(d.heading) * ahead)
    }
    const s = at ? this.toScreen(at, 1, right) : null
    el.style.display = s ? '' : 'none'
    if (s) el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const d = this.ride.d
    const r2 = (v: number) => Math.round(v * 100) / 100
    return {
      section: this.section,
      phase: this.phase,
      vehicle: this.using,
      where: this.where(),
      pos: [r2(d.x), r2(d.z)],
      heading: r2(wrap(d.heading)),
      speed: r2(d.speed),
      airborne: d.airborne,
      boost: d.boostT > 0,
      goal: d.goal ? [r2(d.goal.x), r2(d.goal.z)] : null,
      route: this.route.length,
      lying: Object.fromEntries(this.riders.map((r) => [r.id, r.lying])),
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

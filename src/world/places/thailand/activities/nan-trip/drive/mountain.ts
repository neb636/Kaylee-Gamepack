// The mountain road (section `drive`, plan: thailand/nan-trip.html, "The mountain road"; built: steps 1, 8 and 9, the
// road, its look and its voices). Mommy drives the big silver Pajero and Kaylee steers it: it always rolls forward
// (Mommy's foot), and she steers it like a sled: her finger goes down anywhere, a ring appears under it, and pushing
// the knob left or right slides the Pajero that way across the road (further from the middle = faster). Let go and Mommy
// eases it back into the left lane by herself (Thailand keeps left). Mommy slows for the bends (the body leans out), stops for
// a buffalo crossing (the body squats), and the road boings the car back like a pinball bumper if she steers into the
// edge (Daddy: "Whoa!"). No crashes, no leaving the road.
//
// The family rides inside, seen through the windows: Mommy at the wheel on the right, Daddy beside her (tap him: he
// hops and says something, in turn), Kaylee behind Mommy, and the pink elephant toy nodding on the back seat (tap it:
// it nods like mad and squeaks). The wipers swish by themselves in the rain; tap them and they go faster.
//
// Every drive rolls its weather (rain, sun or cloud; a link can say which) and who's on the road (roads.ts rollDrive).
// The mountains' look: soft grey-lavender skies and low cloud on the hills when it's grey, a wet road that shines with
// puddles that splash when it rains, sunshine when it's sunny. On the way: oncoming songthaews, scooters and tuk-tuks
// that pull over and toot a tune if she drifts onto their side (Mommy: "Keep left!"); chickens that flap off the road;
// on the sky road, round mirrors on the blind bends (one shows a car coming: beep the horn and it beeps back), a
// waterfall, a monkey on the rail, then the cloud (white all round, headlights on) and out above it into the sunshine
// over a sea of clouds; on the 3 road, the bends she counts with Sparkle, and from the viewpoint the road below is a
// giant 3 (section `three`): a big pink crayon waits at the top of it, and her finger pulls it along the road (one,
// two, three as it rounds each bend; a tap on the road draws on to the next bend for her). Each road ends at its stop
// (the mushroom farm, the café, the market, the viewpoint): the Pajero pulls in and the camera turns to look.
//
// Talk (lines.ts L.nan.drive): at most one line before her hands are busy (Mommy's "Steer for me!" on the first drive,
// Sparkle's "Let's count the bends!" on the 3 road); Sparkle says what's new (the first mirror, the first cloud, the
// numbers) and, after ~8 s with nothing touched, how to steer; the family react (each thing once, nothing stacked:
// a reaction is dropped while someone's talking).
//
// The screen (Drive.tsx) draws the steering wheel with its horn, the steering ring, the count's big numbers, Sparkle and
// the end card; the wheel's turn, the ring and its knob, the hint finger and the tap targets are written here every frame.
import { Color, Fog, Group, Mesh, MeshBasicMaterial, Scene, Vector3, type WebGLRenderer, BufferGeometry, BufferAttribute } from 'three'
import { clamp, sounds, speakingVoice, type Line } from '../../../../../../sdk'
import { Avatar } from '../../../characters/avatar'
import { FAMILY } from '../../../characters/family'
import { Member } from '../../../characters/member'
import type { AnchorInfo } from '../../../engine/Anchors'
import { CameraRig, type Shot } from '../../../engine/camera'
import { Bag } from '../../../engine/dispose'
import { merge, P, solid } from '../../../engine/geo'
import { setOutlineResolution } from '../../../engine/outline'
import { Particles } from '../../../engine/particles'
import { applyBands, makeLights, PAL } from '../../../engine/toon'
import type { World3D } from '../../../engine/View3D'
import { Driver, type Feel } from '../../../trip/drive'
import { put } from '../../../trip/legs/stage'
import { buildMirror, buildRoadScene, buildWet, rng, type Mirror, type Puddle, type RoadScene } from '../../../trip/road/build'
import { buildCloudLayer, buildCloudSea, buildPuffs } from '../../../trip/road/clouds'
import { Traffic, type Her, type TrafficEvents, type TrafficPlan } from '../../../trip/road/traffic'
import { buildPajero, type Pajero } from '../../../trip/vehicles/pajero'
import { L } from '../../../lines'
import { buildFalls, buildLandmark, buildMarket } from './landmarks'
import { LANE_LAT, nanRoad, rollDrive, type DriveRoll, type NanRoad, type RoadId, type Weather } from './roads'
import { roadSfx as sfx } from './sounds'

export type DrivePhase = 'drive' | 'arrive' | 'view' | 'end'

/** What the screen shows (Drive.tsx): sent when it changes. */
export interface DriveHud {
  phase: DrivePhase
  /** The 3 road's count: the bend just passed (1, 2, 3), 0 before the first; `n` changes with each pop. */
  count: { k: number; n: number }
}

export interface DriveEvents {
  onHud(hud: DriveHud): void
  /** Someone says something, in their own voice (Sparkle in the corner, the family in the car). */
  say?(l: Line): void
  /** The 3 road's viewpoint: the camera has lifted over the hill, and her finger draws the 3 (section `three`). */
  onView?(): void
}

/** Where a drive starts: rolling at the start of the road, or (the 3 road) parked at the viewpoint, the 3 below. */
export type DriveStart = 'road' | 'view'

/** The heavy, bouncy Pajero, leaning a lot. 60% quicker than it first was (top 9.5, accel 4, turn 1.15): the turn rate
 *  rises with it so it still holds the same line round the hairpins. */
const ZOOM = 1.6
const PAJERO_FEEL: Feel = { top: 9.5 * ZOOM, boost: 1.2, accel: 4 * ZOOM, coast: 0.6, turn: 1.15 * ZOOM, grip: 7, near: 2, far: 7, dead: 0.02, lean: 0.12 }
/** The steering ring (sled style): how far across the road the knob pushed all the way slides it (m/s), the middle
 *  that counts as straight (share of the ring), and how quickly Mommy eases it back into her lane after she lets go (s). */
const SLIDE = 7.5
const STICK_DEAD = 0.12
const BACK_S = 1.4

/** The road's tap targets: the Pajero (Daddy in it, the elephant toy, the wipers), then whoever is on the road this
 *  drive (`traffic`: its roll). */
export function driveAnchors(id: RoadId, traffic?: TrafficPlan, to = ''): AnchorInfo[] {
  const r = nanRoad(id)
  const t = traffic ?? r.traffic
  return [
    { id: 'car', label: 'The Pajero (beep beep!)', kind: 'thing' },
    { id: 'family:nick', label: 'Daddy', kind: 'family' },
    { id: 'elephant', label: 'The elephant toy', kind: 'thing' },
    { id: 'wipers', label: 'The wipers', kind: 'thing' },
    ...t.movers.map((m, i): AnchorInfo => ({ id: `mover:${i}`, label: m.kind === 'car' ? 'Car' : m.kind === 'tuktuk' ? 'Tuk-tuk' : m.kind === 'scooter' ? 'Scooter' : 'Songthaew', kind: 'thing' })),
    ...t.buffalo.map((_, i): AnchorInfo => ({ id: `buffalo:${i}`, label: 'Water buffalo', kind: 'thing' })),
    ...t.chickens.map((_, i): AnchorInfo => ({ id: `chickens:${i}`, label: 'Chickens', kind: 'thing' })),
    ...t.monkeys.map((_, i): AnchorInfo => ({ id: `monkey:${i}`, label: 'Monkey', kind: 'thing' })),
    ...r.blind.map((_, i): AnchorInfo => ({ id: `mirror:${i}`, label: 'Round mirror', kind: 'thing' })),
    ...(r.falls !== undefined ? [{ id: 'falls', label: 'Waterfall', kind: 'thing' } as AnchorInfo] : []),
    { id: 'landmark', label: id === 'sky' && to === 'salt' ? 'Bo Kluea salt village' : { market: 'The market', mushrooms: 'The mushroom farm', cafe: 'Stop Time Cafe', salt: 'Bo Kluea salt village', viewpoint: 'The viewpoint' }[r.landmark], kind: 'thing' },
  ]
}

const deg = Math.PI / 180
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
const wrapDeg = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
const tmp = new Vector3()
const tmp2 = new Vector3()

/** Sky and haze for the weather (and above the cloud, the sunshine): soft grey-lavender when it's grey, deeper when it
 *  rains. */
const AIR = {
  cloud: { bg: '#D8D6E8', fog: '#DDDBEB', near: 100, far: 480 },
  rain: { bg: '#C6C4D9', fog: '#CBC9DD', near: 60, far: 340 },
  sun: { bg: '#BFE3FF', fog: '#E4F3FC', near: 160, far: 620 },
  above: { bg: '#9FD6FF', fog: '#E6F5FF', near: 220, far: 760 },
  inside: { bg: '#F7F6FC', fog: '#F7F6FC', near: 3, far: 30 },
}
/** How bright the sun is in each weather (the toon bands stay; the light just softens). */
const SUNNY: Record<Weather, number> = { sun: 1, cloud: 0.86, rain: 0.74 }

/** Talk: Sparkle's stuck hints after this long with nothing touched (counted from 3 s after a line), every so often, a
 *  few times a drive at most; and no new family reaction within 8 s of the last line (the sky road was chatty). */
const STUCK_S = 8
const HINT_EVERY = 14
const HINT_MAX = 2
const GAP_S = 8
/** What Sparkle has already shown her this visit (the first mirror, the first cloud): said once, not every drive. */
const heard = new Set<string>()
/** Mommy's "Steer for me!" is for the first drive only. */
let drives = 0

export class NanDrive implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  readonly bag = new Bag()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private lights = makeLights(this.scene)
  private r: NanRoad
  private world: RoadScene
  private traffic: Traffic
  private car: Pajero
  private d = new Driver(PAJERO_FEEL)
  private mirrors: Mirror[] = []
  private landmark: Group
  private falls: Group | null = null
  private crayon: Mesh | null = null
  /** The big pink crayon at the tip of the line she draws. */
  private crayonTip: Group | null = null
  private dust: Particles
  private rain: Particles
  private sparkle: Particles
  private fog: Fog
  private air = new Color()
  private fogColor = new Color()
  private phase: DrivePhase = 'drive'
  private phaseT = 0
  time = 0
  /** Where the car is on the road. */
  private loc = { i: 0, s: 0, lat: 0 }
  /** Her finger: where it is now, and where it went down (the steering ring's middle). */
  private finger: { x: number; y: number; ox: number; oy: number; steering: boolean; t: number; id?: string } | null = null
  /** Where across the road she's steering to (m): the ring's knob slides it; let go and it eases back into her lane. */
  private steerLat = LANE_LAT
  /** The ring's knob, -1..1 across the road (+ toward +lat), for the wheel and QA. */
  private stick = 0
  private w = 1
  private h = 1
  private camHeading = 0
  private pitch = { x: 0, v: 0 }
  private roll = { x: 0, v: 0 }
  private squash = 0
  private lastSpeed = 0
  private hop = 0
  private flash = 0
  private engineT = 0
  private rainT = 0
  private boingCool = 0
  private lastTouch = 0
  private cloudK = 0
  private wasIn = false
  private wasAbove = false
  private counted = 0
  private countN = 0
  /** Drawing the 3: how far along the road the crayon has got (m), where a tap sends it on to (-1: nowhere), how long
   *  since the viewpoint began. */
  private trace = { s: 0, auto: -1, t: 0, scratch: 0 }
  /** Bends the crayon line has passed (-1: it hasn't started). */
  private drawn = -1
  private lastHud = ''
  private anchorEls = new Map<string, HTMLElement>()
  private hintEl: HTMLElement | null = null
  private wheelEl: HTMLElement | null = null
  private stickEl: HTMLElement | null = null
  private counts = { honks: 0, boings: 0, pokes: 0, steered: 0, keptLeft: 0, wipes: 0, splashes: 0 }
  private ev: TrafficEvents
  /** This drive's weather (rolled, or the link's). */
  readonly weather: Weather
  private kaylee: Avatar
  private nick: Member
  private ji: Member
  // ---- The wipers (their sweep 0..1 and how fast they go), the elephant's nod, the wet road ----
  private wipe = { a: 0, fast: 0, dry: 0, lastK: 0, up: false }
  private nod = { x: 0, v: 0, crazy: 0 }
  private puddles: Puddle[] = []
  private nextPuddle = 0
  private hissT = 0
  private sea: Group | null = null
  private lowCloud: Group | null = null
  // ---- Talk: lines said once, Sparkle's hints, Daddy's tap lines in turn, cool-downs ----
  private told = new Set<string>()
  private cool = new Map<string, number>()
  private lastLine = -99
  private quietFrom = 0
  private hintSaid = -99
  private hintN = 0
  private nickTap = 0
  private inCloudT = 0
  private yieldsSeen = 0
  private lastSteer = -99
  private aboveAt = -99

  constructor(
    private renderer: WebGLRenderer,
    road: RoadId,
    private events: DriveEvents,
    start: DriveStart = 'road',
    roll: DriveRoll = rollDrive(road),
    /** Where she's going (picked on the map): the sky road's end is the café or the salt village. */
    private to = '',
    /** Where along the road she starts (m): the sky road's second trip up starts above the cloud. */
    fromS = 4,
  ) {
    const { scene, bag } = this
    const r = (this.r = nanRoad(road))
    this.weather = roll.weather
    applyBands()
    this.rig.fov = 55
    this.rig.camera.far = 1500
    const air = AIR[this.weather]
    scene.background = this.air.set(air.bg)
    this.fog = scene.fog = new Fog(air.fog, air.near, air.far)

    // ---- The road and everything along it ----
    this.world = buildRoadScene(r.road, r.look, bag)
    scene.add(this.world.root)
    const field = this.world.field
    const half = r.road.half
    // A monkey with side 0 sits on whichever side has the rail.
    const traffic = { ...roll.traffic, monkeys: roll.traffic.monkeys.map((m) => ({ ...m, side: m.side || (this.world.railed(m.s, -1) ? -1 : 1) })) }
    this.traffic = new Traffic(r.road, field, traffic, bag)
    scene.add(this.traffic.root)
    for (const s of r.blind) {
      const m = buildMirror(r.road, field, s, -Math.sign(r.road.bendAhead(s - 10, 20)) || 1, bag)
      this.mirrors.push(m)
      scene.add(m.root)
    }
    if (r.market) scene.add(buildMarket(r.road, field, r.market[0], r.market[1], bag))
    if (r.falls !== undefined) {
      // Down the hillside on the high side of the road.
      const up = (side: number) => {
        const p = r.road.spotAt(r.falls!, side * (half + 7))
        return field.at(p.x, p.z)
      }
      const side = up(1) > up(-1) ? 1 : -1
      const p = r.road.spotAt(r.falls, side * (half + 5.5))
      const y = field.at(p.x, p.z)
      const height = clamp(up(side) - y + 6, 7, 14)
      this.falls = buildFalls(height, bag)
      this.falls.position.set(p.x, y, p.z)
      const t = r.road.sampleAt(r.falls)
      this.falls.rotation.y = Math.atan2(-side * t.lx, -side * t.lz)
      scene.add(this.falls)
    }
    // The stop at the end, on the left, facing the road.
    const end = r.road.spotAt(r.road.length - 16, half + 9)
    const et = r.road.sampleAt(r.road.length - 16)
    this.landmark = buildLandmark(r.id === 'sky' && to === 'salt' ? 'salt' : r.landmark, bag)
    this.landmark.position.set(end.x, field.at(end.x, end.z), end.z)
    this.landmark.rotation.y = Math.atan2(-et.lx, -et.lz)
    scene.add(this.landmark)
    // Clouds: the layer the sky road drives into, or puffs resting on the far hills.
    const b = r.road.bounds(220)
    if (r.cloud) {
      scene.add(buildCloudLayer(b, r.cloud.y0, r.cloud.y1, 300, r.look.seed, bag))
      // From above it: a sea of clouds out to the horizon (only once she's up there).
      this.sea = buildCloudSea(b, r.cloud.y0 + (r.cloud.y1 - r.cloud.y0) * 0.62, r.look.seed, bag)
      this.sea.visible = false
      scene.add(this.sea)
    } else {
      const top = r.road.bounds().y1
      const puffs: [number, number, number][] = [0, 1, 2, 3, 4, 5].map((i) => {
        const a = i * 1.1 + r.look.seed
        return [(b.x0 + b.x1) / 2 + Math.cos(a) * 240, top + 55 + (i % 3) * 12, (b.z0 + b.z1) / 2 + Math.sin(a) * 260]
      })
      scene.add(buildPuffs(puffs, 14, r.look.seed, bag))
    }
    // Grey or rainy: low cloud hanging on the hills either side of the road (drifting slowly).
    if (this.weather !== 'sun') {
      const rand = rng(r.look.seed * 5 + 11 + (this.weather === 'rain' ? 1 : 0))
      const low: [number, number, number][] = []
      for (let i = 0; i < 40 && low.length < 9; i++) {
        const s = rand() * r.road.length
        const side = rand() < 0.5 ? -1 : 1
        const p = r.road.spotAt(s, side * (45 + rand() * 90))
        const y = this.world.field.at(p.x, p.z)
        // (Not in the 3's view from above, nor inside the sky road's own cloud.)
        if (r.cloud && y + 10 > r.cloud.y0 - 8) continue
        if (r.road.locate(p.x, p.z).d < 42) continue
        low.push([p.x, y + 7 + rand() * 8, p.z])
      }
      if (low.length) scene.add((this.lowCloud = buildPuffs(low, 8, r.look.seed + 2, bag)))
    }
    // Rain: the road shines, with puddles.
    if (this.weather === 'rain') {
      const wet = buildWet(r.road, r.look.seed, bag)
      scene.add(wet.root)
      this.puddles = wet.puddles
    }
    if (r.id === 'three') {
      this.crayon = this.buildCrayon()
      this.crayonTip = this.buildCrayonTip()
      scene.add(this.crayon, this.crayonTip)
    }

    // ---- The Pajero and the particles ----
    this.car = buildPajero(bag)
    this.car.root.userData.pick = 'car'
    scene.add(this.car.root)
    // The family inside: Mommy at the wheel, Daddy beside her, Kaylee behind Mommy.
    this.kaylee = new Avatar(bag)
    const member = (id: string) => new Member({ ...FAMILY.find((f) => f.id === id)!, spot: null }, bag)
    this.nick = member('nick')
    this.ji = member('ji')
    for (const [c, seat] of [[this.ji, this.car.seats.driver], [this.nick, this.car.seats.nick], [this.kaylee, this.car.seats.kaylee]] as const) {
      seat.add(c.root)
      put(c, 0, 0, 0, 'sit', 0)
    }
    this.dust = new Particles({ kind: 'spray', count: 260, colors: ['#FFFFFF', '#F1E4D6', '#EDE7F7'], gravity: 3 }, bag)
    this.rain = new Particles({ kind: 'spray', count: 700, color: '#E7EEFF', gravity: 0 }, bag)
    this.sparkle = new Particles({ kind: 'spray', count: 320, colors: ['#FF4F9A', '#FFC83D', '#8FE3C8', '#A8DCFF', '#B9A6F5'], gravity: 4 }, bag)
    scene.add(this.dust.mesh, this.rain.mesh, this.sparkle.mesh)
    this.ev = {
      toot: (kind, tune) => sfx.toot(tune, kind === 'songthaew' || kind === 'tuktuk'),
      beepBack: () => {
        sfx.beepBack()
        const m = this.mirrors.find((x) => Math.abs(x.s - this.loc.s) < 80)
        if (m) this.sparkle.burst(m.at.x, m.at.y, m.at.z, 24, 3, 4, 0.22)
      },
      moo: () => sfx.moo(),
      cluck: () => sfx.cluck(),
      chatter: () => sfx.chatter(),
      puff: (x, y, z) => this.dust.burst(x, y, z, 10, 1.6, 2.4, 0.18),
    }

    // ---- Off she goes: in her lane at the start, already rolling (or, the 3 from above, parked at the viewpoint) ----
    const atView = start === 'view' && r.id === 'three'
    const p = atView ? r.road.spotAt(r.road.length - 14, half - 1.4) : r.road.spotAt(fromS, LANE_LAT)
    this.d.place(p.x, p.z, p.heading)
    if (!atView) {
      this.d.vx = Math.sin(p.heading) * 3
      this.d.vz = Math.cos(p.heading) * 3
    }
    this.camHeading = p.heading
    this.locate()
    this.poseCar(0)
    // (Starting up above the cloud: no "out of the cloud" moment, it's sunny from the start.)
    if (r.cloud && this.carY() > r.cloud.y1 + 1) this.wasAbove = true
    if (atView) {
      this.counted = r.count.length
      this.setPhase('view', true)
      this.trace.t = 99
    }
    this.rig.lag = 0.5
    this.rig.setShot(this.shot(), true)
    this.emitHud()
  }

  // ---------------------------------------------------------------- input

  setAnchorElements(els: Map<string, HTMLElement>) {
    this.anchorEls = els
  }
  setHintElement(el: HTMLElement | null) {
    this.hintEl = el
  }
  /** The steering wheel on the screen: it turns with the car, and pulses when a beep would be heard. */
  setWheelElement(el: HTMLElement | null) {
    this.wheelEl = el
  }
  /** The steering ring: it appears where her finger went down, the knob following it. */
  setStickElement(el: HTMLElement | null) {
    this.stickEl = el
  }

  pointerDown(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    // A finger on the road steers at once (the ring appears under it); one on a tap target steers too once it moves or
    // is held a moment (a quick tap there pokes it).
    this.finger = { x, y, ox: x, oy: y, steering: !id, t: this.time, id }
    this.steerLat = this.loc.lat
  }
  pointerMove(x: number, y: number, downX: number, downY: number, held: boolean) {
    const f = this.finger
    if (!held || !f) return
    f.x = x
    f.y = y
    if (!f.steering && Math.hypot(x - downX, y - downY) > 12) f.steering = true
  }
  pointerUp() {
    if (this.finger?.steering) this.d.release()
    this.finger = null
    this.stick = 0
  }

  tap(_x: number, _y: number, id?: string) {
    this.lastTouch = this.time
    if (!id && this.tracing) {
      // A tap anywhere: the crayon draws on round the next bend for her.
      const T = this.trace
      const next = this.r.count.find((s) => s > T.s + 4) ?? this.r.road.length
      T.auto = Math.min(next + 3, T.s + 90, this.r.road.length)
      this.counts.pokes++
      return
    }
    if (!id) return
    this.counts.pokes++
    if (id === 'car') return this.honk()
    if (id === 'family:nick') {
      // Daddy hops in his seat and says something (in turn); not over Sparkle.
      this.nick.react('hop')
      if (speakingVoice() === 'sparkle') return
      return this.every('nick-tap', 2.5, () => this.speak(L.nan.drive.tap[this.nickTap++ % L.nan.drive.tap.length]))
    }
    if (id === 'elephant') {
      // It nods like mad and squeaks; Kaylee wiggles.
      this.nod.crazy = 1.6
      this.nod.v += 14
      sfx.squeak()
      this.kaylee.react('wiggle')
      const p = this.car.elephant.root.getWorldPosition(new Vector3())
      this.sparkle.burst(p.x, p.y + 0.3, p.z, 10, 1.2, 1.6, 0.12)
      return
    }
    if (id === 'wipers') {
      // Faster for a while (in the dry, a few squeaky swishes).
      this.counts.wipes++
      if (this.wiping) this.wipe.fast = 4
      else this.wipe.dry = 2.6
      if (this.weather === 'rain') this.once('rain', L.nan.drive.rain, true)
      return
    }
    if (id.startsWith('mirror:')) {
      const m = this.mirrors[Number(id.slice(7))]
      sfx.chime()
      this.sparkle.burst(m.at.x, m.at.y, m.at.z, 14, 2, 3, 0.18)
      return
    }
    if (id === 'falls' && this.falls) {
      sfx.splash(1.2)
      const p = this.falls.position
      this.dust.burst(p.x, p.y + 1, p.z, 22, 3, 4, 0.24)
      return
    }
    if (id === 'landmark') {
      sfx.chime()
      const p = this.landmark.position
      this.sparkle.burst(p.x, p.y + 6, p.z, 30, 4, 5, 0.26)
      return
    }
    this.traffic.poke(id, this.ev)
  }

  /** The horn (the steering wheel's middle, or a tap on the Pajero): beep beep, the lights wink, the car hops, and
   *  whoever hears it answers. */
  honk() {
    this.lastTouch = this.time
    this.counts.honks++
    sfx.horn()
    this.flash = 0.6
    this.hop = 1
    this.traffic.honk(this.her(), this.ev)
  }

  // ---------------------------------------------------------------- per frame

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
    this.rig.setShot(this.shot(), true)
  }

  get calm() {
    return this.phase === 'end' && !this.rig.moving
  }

  /** At the viewpoint, drawing the 3. */
  private get tracing() {
    return this.phase === 'view' && this.r.id === 'three'
  }

  update(dt: number) {
    if (dt <= 0) return
    this.time += dt
    this.phaseT += dt
    const t = this.time
    if (this.finger) {
      this.lastTouch = t
      if (!this.finger.steering && t - this.finger.t > 0.25) this.finger.steering = true
    }
    this.drive(dt)
    this.d.step(dt)
    this.keepOnRoad()
    this.locate()
    this.poseCar(dt)
    this.traffic.update(dt, t, this.her(), this.ev)
    this.updateAir(dt)
    this.mirrorsFlash(t)
    this.countBends()
    this.updateTrace(dt)
    this.engine(dt)
    this.wipers(dt)
    this.wet(dt)
    this.nodding(dt)
    for (const c of [this.kaylee, this.nick, this.ji]) c.update(dt, t)
    this.talk(t)
    for (const p of [this.dust, this.rain, this.sparkle]) p.update(dt)
    if (this.lowCloud) this.lowCloud.position.x = Math.sin(t * 0.04) * 6
    // The salt pan steams.
    const steam = this.landmark.userData.steam as [number, number, number] | undefined
    if (steam && this.r.road.length - this.loc.s < 120 && Math.random() < dt * 14) {
      const p = this.landmark.localToWorld(tmp.set(...steam))
      this.dust.emit(p.x + (Math.random() - 0.5) * 2.4, p.y, p.z + (Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 0.4, 2.5 + Math.random() * 1.5, (Math.random() - 0.5) * 0.4, 1.6, 0.35)
    }
    if (this.falls && Math.abs(this.r.falls! - this.loc.s) < 90 && Math.random() < dt * 20) {
      const p = this.falls.position
      this.dust.emit(p.x + (Math.random() - 0.5) * 3, p.y + 0.5, p.z + (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 2 + Math.random() * 2, (Math.random() - 0.5) * 2, 0.8, 0.3)
    }

    // ---- The camera: behind, looking ahead along the road (higher on hairpins) ----
    const head = Math.atan2(this.r.road.sampleAt(this.loc.s + 8).tx, this.r.road.sampleAt(this.loc.s + 8).tz)
    const want = this.phase === 'drive' ? head + wrap(this.d.heading - head) * 0.5 : this.d.heading
    this.camHeading += wrap(want - this.camHeading) * (1 - Math.exp(-dt / 0.5))
    this.rig.setShot(this.shot())
    this.rig.update(dt)
    this.clearTerrain()
    const cam = this.rig.camera
    this.lights.follow(this.d.x, this.carY(), this.d.z)
    // (Softer light when it's grey or raining; full sun above the cloud.)
    const sunK = this.wasAbove ? 1 : SUNNY[this.weather]
    this.lights.sun.intensity *= sunK
    this.lights.ambient.intensity *= 0.94 + 0.06 * sunK
    const back = tmp.set(cam.position.x - this.d.x, 0, cam.position.z - this.d.z).normalize()
    this.lights.sun.position.set(this.d.x + back.x * 7 - back.z * 4, this.carY() + 10, this.d.z + back.z * 7 + back.x * 4)
    this.writeWheel()
    this.writeStick()
    this.hint(t)
    this.emitHud()
  }

  /** Mommy's foot and Kaylee's finger: where across the road it goes, and how fast. */
  private drive(dt: number) {
    const { road } = this.r
    const d = this.d
    const half = road.half
    const s = this.loc.s
    let ds = 10 + Math.abs(d.speed) * 0.9
    const f = this.finger
    if (this.phase === 'drive' && f?.steering) {
      // Sled style: the knob's push across the road slides her that way, as long as she holds it there.
      this.stick = this.stickAcross(f)
      const k = Math.abs(this.stick) < STICK_DEAD ? 0 : Math.sign(this.stick) * ((Math.abs(this.stick) - STICK_DEAD) / (1 - STICK_DEAD))
      // (A little past the edge is allowed: that's how she finds the rail's boing.)
      this.steerLat = clamp(this.steerLat + k * SLIDE * dt, -(half + 1.5), half + 1.5)
      if (k !== 0) {
        this.counts.steered += dt
        this.lastSteer = this.time
      }
    } else {
      // Let go: Mommy eases it back into the left lane.
      this.steerLat += (LANE_LAT - this.steerLat) * (1 - Math.exp(-dt / BACK_S))
    }
    let lat = this.steerLat
    // Keep left: someone coming the other way and she's over the middle: Mommy eases her back toward her lane.
    const her = this.her()
    const oncoming = this.traffic.movers.some((m) => m.state === 'go' && m.s - s > -2 && m.s - s < 34)
    if (this.phase === 'drive' && oncoming && her.lat < 1.3) {
      lat = lat + (LANE_LAT - lat) * 0.6
      this.counts.keptLeft += dt
    }
    // How fast: slower round the bends and in the cloud, stopped for a buffalo, easing in at the end of the road.
    let cap = 0.9 * (1 - clamp((Math.abs(road.bendAhead(s, 22)) - 0.35) * 0.4, 0, 0.45))
    if (this.cloudK > 0.3) cap *= 0.8
    const block = this.traffic.blockAhead(her)
    // (Quicker now, so she starts braking a little further back.)
    cap *= clamp((block - 14) / 17, 0, 1)
    const stopAt = road.length - 14
    if (this.phase === 'drive' && s > stopAt - 34) {
      this.setPhase('arrive')
      sounds.sparkle()
      const T = L.nan.drive.to
      const line = { city: T.market, valley: T.mushrooms, sky: this.to === 'salt' ? T.salt : T.rice, three: T.view }[this.r.id]
      this.told.add('arrive')
      this.speak(line)
      this.ji.react('wave')
    }
    if (this.phase !== 'drive') {
      // Into the side of the road by the stop, and stopped.
      lat = half - 1.4
      this.steerLat = lat
      ds = clamp(stopAt - s, 3, 14)
      cap = Math.min(cap, clamp((stopAt - s) / 12, 0, 0.7))
      if (this.phase === 'arrive' && Math.abs(d.speed) < 0.6 && this.phaseT > 1) this.setPhase('view')
    }
    d.cap = cap
    const p = road.spotAt(Math.min(road.length, s + ds), lat)
    d.hold(p.x, p.z)
  }

  /** The edges of the road boing her back like a pinball bumper (there's no leaving it). */
  private keepOnRoad() {
    const { road } = this.r
    const d = this.d
    const loc = road.locate(d.x, d.z, this.loc.i, 30)
    const lim = road.half - 0.95
    if (Math.abs(loc.lat) <= lim) return
    const side = Math.sign(loc.lat)
    const p = road.spotAt(loc.s, side * lim)
    d.x = p.x
    d.z = p.z
    const sm = road.sampleAt(loc.s)
    const nx = -side * sm.lx
    const nz = -side * sm.lz
    const hit = d.bounce(nx, nz, 0.9)
    if (hit > 0.5 && this.boingCool <= 0) {
      this.boingCool = 0.5
      this.counts.boings++
      // A pinball kick back toward the middle, and the whole car wobbles.
      d.vx += nx * 2.2
      d.vz += nz * 2.2
      this.roll.v += side * 3
      this.squash = 1
      sfx.rail()
      this.kaylee.react('wiggle')
      // (Daddy's "Whoa!" when she steered into it.)
      if (this.finger?.steering) this.every('whoa', 7, () => this.family(L.nan.drive.whoa))
      const at = road.spotAt(loc.s, side * (road.half + 0.4))
      this.sparkle.burst(at.x, at.y + 0.7, at.z, 12, 2.5, 3, 0.18)
    }
  }

  private locate() {
    const l = this.r.road.locate(this.d.x, this.d.z, this.loc.i || undefined, 30)
    this.loc = { i: l.i, s: l.s, lat: l.lat }
  }
  private her(): Her {
    return { s: this.loc.s, lat: this.loc.lat, speed: this.d.speed }
  }
  private carY() {
    return this.r.road.sampleAt(this.loc.s).y
  }

  /** The Pajero on the road: its slope, leaning out on bends, squatting when it brakes, bouncing. */
  private poseCar(dt: number) {
    const d = this.d
    const c = this.car
    const sm = this.r.road.sampleAt(this.loc.s)
    this.boingCool -= dt
    this.hop = Math.max(0, this.hop - dt * 3)
    this.squash = Math.max(0, this.squash - dt * 2.5)
    this.flash = Math.max(0, this.flash - dt)
    c.root.position.set(d.x, sm.y, d.z)
    c.root.rotation.y = d.heading
    c.tilt.rotation.x = -Math.atan(sm.grade)
    if (dt > 0) {
      const sp = d.speed
      const acc = clamp((sp - this.lastSpeed) / dt, -12, 12)
      this.lastSpeed = sp
      // Springs: nose down when it brakes (up when it pulls away); leaning out of the bend.
      const spring = (o: { x: number; v: number }, goal: number, k: number, damp: number) => {
        o.v += (goal - o.x) * k * dt
        o.v *= Math.exp(-damp * dt)
        o.x += o.v * dt
      }
      spring(this.pitch, -acc * 0.014, 90, 7)
      spring(this.roll, clamp(d.yawRate * sp * 0.013, -0.14, 0.14), 70, 6)
    }
    const bounce = Math.abs(Math.sin(this.time * 11)) * 0.025 * clamp(Math.abs(d.speed) / 6, 0, 1)
    c.body.position.y = bounce + Math.sin(this.hop * Math.PI) * 0.3
    c.body.rotation.x = this.pitch.x
    c.body.rotation.z = this.roll.x
    const sq = Math.sin(this.squash * Math.PI) * 0.12
    c.body.scale.set(1 + sq * 0.5, 1 - sq, 1 + sq * 0.3)
    for (const w of c.wheels) w.rotation.x += (d.speed * dt) / 0.45
    const lit = this.cloudK > 0.15 || this.weather === 'rain'
    c.beams.visible = this.cloudK > 0.15
    c.lamps.color.set(this.flash > 0 && Math.sin(this.flash * 30) > 0 ? '#FFFFFF' : lit ? '#FFF8D8' : '#E6E2EE')
  }

  /** The cloud on the sky road: the haze closes in to white as she climbs into it, then she pops out above into the
   *  sunshine. Rain below it. */
  private updateAir(dt: number) {
    const r = this.r
    const y = this.carY()
    const base = r.cloud && y > r.cloud.y1 ? AIR.above : AIR[this.weather]
    const k = r.cloud ? smooth(r.cloud.y0 - 3, r.cloud.y0 + 6, y) * (1 - smooth(r.cloud.y1 - 5, r.cloud.y1 + 3, y)) : 0
    this.cloudK += (k - this.cloudK) * (1 - Math.exp(-dt * 2))
    const c = this.cloudK
    this.air.set(base.bg).lerp(tmpColor.set(AIR.inside.bg), c)
    this.fogColor.set(base.fog).lerp(tmpColor.set(AIR.inside.fog), c)
    this.fog.color.copy(this.fogColor)
    this.fog.near = base.near + (AIR.inside.near - base.near) * c
    this.fog.far = base.far + (AIR.inside.far - base.far) * c
    // From high over the 3, no haze: the whole road shows crisp.
    if (r.id === 'three' && (this.phase === 'view' || this.phase === 'end')) {
      this.fog.near = 1500
      this.fog.far = 3000
    }
    const inside = c > 0.6
    const above = !!r.cloud && y > r.cloud.y1 + 1
    if (inside && !this.wasIn) sfx.cloudIn()
    // Into the cloud: Sparkle says so the first time (as it begins to close in), Daddy can't see a thing; out above it,
    // the sea of clouds and the sunshine.
    this.inCloudT = inside ? this.inCloudT + dt : 0
    // (Daddy only after Sparkle has said they're driving into a cloud.)
    if (this.inCloudT > 3.5 && heard.has('cloud')) this.once('foggy', L.nan.drive.foggy, true)
    if (this.sea) this.sea.visible = y > r.cloud!.y1 - 4
    if (above && !this.wasAbove) {
      sfx.cloudOut()
      const p = this.car.root.position
      this.sparkle.burst(p.x, p.y + 3, p.z, 40, 5, 6, 0.26)
      this.aboveAt = this.time
      this.nick.react('hop')
    }
    this.wasIn = inside
    this.wasAbove = above
    // Rain under the cloud, round the camera.
    if (this.weather === 'rain' && !above && c < 0.5 && !(r.id === 'three' && (this.phase === 'view' || this.phase === 'end'))) {
      const cam = this.rig.camera.position
      const n = Math.floor((this.rainT += dt * 260))
      this.rainT -= n
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2
        const rr = 2 + Math.random() * 22
        this.rain.emit(cam.x + Math.cos(a) * rr, cam.y + 6 + Math.random() * 3, cam.z + Math.sin(a) * rr, 0, -16, 0, 0.7, 0.11)
      }
      if (Math.random() < dt * 6) sfx.patter()
    }
  }

  /** A mirror shows the car coming round its blind bend: it flashes (and the wheel pulses) until she beeps. */
  private mirrorsFlash(t: number) {
    const warn = this.traffic.blindWarning(this.her())
    for (const m of this.mirrors) {
      const on = warn !== null && Math.abs(m.s - warn) < 1 && m.s - this.loc.s < 70
      m.face.color.set(on && Math.sin(t * 9) > 0 ? '#FF8FB8' : '#CFE8FF')
    }
    const pulse = warn !== null && warn - this.loc.s < 70 ? '1' : ''
    if (this.wheelEl && this.wheelEl.dataset.pulse !== pulse) this.wheelEl.dataset.pulse = pulse
  }

  /** The 3 road: one, two, three, as she rounds each bend. */
  private countBends() {
    const c = this.r.count
    if (this.counted >= c.length || this.loc.s < c[this.counted]) return
    this.counted++
    this.countN++
    sounds.note(this.counted * 2)
    this.number(this.counted)
    const p = this.car.root.position
    this.sparkle.burst(p.x, p.y + 2.5, p.z, 18, 3, 4, 0.22)
  }

  private engine(dt: number) {
    const sp = clamp(Math.abs(this.d.speed) / this.d.feel.top, 0, 1)
    if (sp < 0.05) return
    this.engineT += dt
    if (this.engineT > 1 / (2.5 + 6 * sp)) {
      this.engineT = 0
      sfx.engine(sp * 0.35)
    }
  }

  private setPhase(p: DrivePhase, fromStart = false) {
    this.phase = p
    this.phaseT = 0
    if (p === 'view') {
      this.rig.lag = this.r.id === 'three' ? 1.4 : 0.9
      if (this.r.id === 'three') {
        this.trace = { s: 0, auto: -1, t: 0, scratch: 0 }
        this.drawn = 0
        // (Once the camera has lifted over the hill.)
        window.setTimeout(() => this.tracing && this.trace.s < 1 && this.speak(L.nan.drive.draw), fromStart ? 1200 : 2000)
        if (!fromStart) this.events.onView?.()
      } else {
        sounds.correct()
        const l = this.landmark.position
        this.sparkle.burst(l.x, l.y + 5, l.z, 50, 5, 7, 0.28)
        window.setTimeout(() => this.phase === 'view' && this.setPhase('end'), 2600)
      }
    }
  }

  // ---------------------------------------------------------------- the car's life

  /** The wipers swish by themselves in the rain (and inside the cloud); faster for a while when she taps them. */
  private get wiping() {
    return (this.weather === 'rain' && !this.wasAbove) || this.cloudK > 0.4
  }
  private wipers(dt: number) {
    const W = this.wipe
    W.fast = Math.max(0, W.fast - dt)
    W.dry = Math.max(0, W.dry - dt)
    const on = this.wiping || W.dry > 0
    // Sweeps a second: about one a second and a half in the rain, three when tapped.
    const rate = W.fast > 0 || W.dry > 0 ? 2.2 : this.wiping ? 0.75 : 0
    if (on || W.a % 1 > 0.02) W.a += dt * Math.max(rate, on ? 0 : 1.2)
    if (!on && W.a % 1 > 0.97) W.a = Math.ceil(W.a)
    const k = (1 - Math.cos(W.a * Math.PI * 2)) / 2
    this.car.setWipers(k)
    // A swish at each end of the sweep.
    const up = k > W.lastK
    if (up !== W.up && (k > 0.9 || k < 0.1)) sfx.wiper(W.dry > 0 && !this.wiping)
    W.up = up
    W.lastK = k
  }

  /** The nodding elephant: its head nods on a spring with every bump, brake and bend (like mad when tapped). */
  private nodding(dt: number) {
    const n = this.nod
    n.crazy = Math.max(0, n.crazy - dt)
    // (Pushed near its own bounce, so the road's bumps rock it, harder when tapped; braking tips it forward.)
    const sp = clamp(Math.abs(this.d.speed) / 6, 0, 1)
    const kick = Math.sin(this.time * 7.7) * (3 * sp + (n.crazy > 0 ? 25 : 0)) + this.pitch.v * 8
    n.v += (kick - n.x * 60) * dt
    n.v *= Math.exp(-3 * dt)
    n.x += n.v * dt
    const e = this.car.elephant
    e.head.rotation.x = clamp(n.x, -0.5, 0.6)
    e.head.rotation.z = Math.sin(this.time * 2.2) * 0.06 + (n.crazy > 0 ? Math.sin(this.time * 9) * 0.15 : 0)
  }

  /** Rain: the tyres hiss, and the puddles splash as she drives through them. */
  private wet(dt: number) {
    if (this.weather !== 'rain' || this.wasAbove) return
    const sp = Math.abs(this.d.speed)
    this.hissT -= dt
    if (sp > 2 && this.hissT <= 0) {
      this.hissT = 0.45
      sfx.hiss(clamp(sp / 8, 0.3, 1))
    }
    while (this.nextPuddle < this.puddles.length && this.puddles[this.nextPuddle].s < this.loc.s - 3) this.nextPuddle++
    const p = this.puddles[this.nextPuddle]
    if (!p || Math.abs(p.s - this.loc.s) > p.r * 1.6 + 1 || Math.abs(p.lat - this.loc.lat) > p.r + 1) return
    this.nextPuddle++
    this.counts.splashes++
    sfx.puddle()
    this.squash = Math.max(this.squash, 0.4)
    const c = this.car.root
    const sm = this.r.road.sampleAt(this.loc.s)
    for (const side of [-1, 1]) {
      const x = c.position.x + sm.lx * side * 1.1
      const z = c.position.z + sm.lz * side * 1.1
      for (let i = 0; i < 14; i++) this.dust.emit(x, c.position.y + 0.2, z, sm.lx * side * (1 + Math.random() * 2) + (Math.random() - 0.5), 2 + Math.random() * 2.5, sm.lz * side * (1 + Math.random() * 2) + (Math.random() - 0.5), 0.7, 0.16)
    }
  }

  // ---------------------------------------------------------------- talk

  /** Says it (Sparkle in the corner, or whoever's line it is). */
  private speak(l: Line) {
    this.lastLine = this.time
    this.quietFrom = this.time + 3
    this.events.say?.(l)
    const v = typeof l === 'string' ? 'sparkle' : l.voice
    if (v === 'nick') {
      this.nick.react('hop')
      this.nick.lookAt(this.d.x + Math.sin(this.d.heading) * 12, this.carY() + 1.5, this.d.z + Math.cos(this.d.heading) * 12)
    } else if (v === 'ji') this.ji.react('wave')
  }
  /** A family reaction: dropped while someone's talking or just after a line (nothing stacks up, nothing comes late). */
  private family(l: Line) {
    if (!this.quiet()) return false
    this.speak(l)
    return true
  }
  /** Nobody talking, and a good gap since the last line. */
  private quiet() {
    return !speakingVoice() && this.time - this.lastLine >= GAP_S
  }
  /** Sparkle's first-time teaching line (once a visit): it waits for a quiet moment while it still fits. */
  private teach(key: string, l: Line) {
    if (heard.has(key) || !this.quiet()) return
    heard.add(key)
    this.speak(l)
  }
  /** Says it the first time only (a family line waits for a quiet moment: call it again while it still fits). */
  private once(key: string, l: Line, family = false) {
    if (this.told.has(key)) return
    if (family ? !this.family(l) : (this.speak(l), false)) return
    this.told.add(key)
  }
  /** Once every few seconds at most. */
  private every(key: string, s: number, f: () => void) {
    if (this.time - (this.cool.get(key) ?? -99) < s) return
    this.cool.set(key, this.time)
    f()
  }
  /** One, two, three! (Sparkle, as the big number pops.) */
  private number(k: number) {
    const D = L.nan.drive
    const l = [D.one, D.two, D.three][k - 1]
    if (l) this.speak(l)
  }

  /** What's said when, every frame: the opening line, the things seen on the way, Sparkle's stuck hints. */
  private talk(t: number) {
    const D = L.nan.drive
    const r = this.r
    const her = this.her()
    // ---- The opening: at most one line before her hands are busy ----
    if (!this.told.has('open') && t > 0.6 && this.phase === 'drive') {
      this.told.add('open')
      if (r.id === 'three') this.speak(D.count)
      else if (drives === 0) this.speak(D.go)
      else this.quietFrom = t + 1
      drives++
    }
    if (this.phase === 'drive') {
      // Sparkle's first-time lines (once a visit, in a quiet moment while they still fit): a mirror showing a car, then
      // beep!; driving into the cloud.
      const warn = this.traffic.blindWarning(her)
      if (warn !== null && warn - her.s < 60) this.teach('mirror', D.mirror)
      if (r.cloud && this.cloudK > 0.25 && !this.wasAbove) this.teach('cloud', D.cloud)
      // Out above the cloud: Daddy's sunshine (within a few seconds of popping out).
      if (this.wasAbove && this.time - this.aboveAt < 8) this.once('sun', D.sun, true)
      // Someone pulled over for her (she steered onto their side): keep left!
      if (this.traffic.counts.yields > this.yieldsSeen) {
        this.yieldsSeen = this.traffic.counts.yields
        if (t - this.lastSteer < 3) this.every('left', 12, () => this.family(D.left))
      }
      // A buffalo crossing: Mommy stops for it.
      if (this.traffic.blockAhead(her) < 40) this.once('buffalo', D.buffalo, true)
      // The first sharp bend (not on the 3 road, where Sparkle counts them).
      if (r.id !== 'three' && t > 6 && Math.abs(r.road.bendAhead(her.s, 22)) > 0.8 && this.d.speed > 3) this.once('bend', D.bend, true)
      // Things to see: the monkey on the rail, the waterfall.
      if (this.traffic.monkeys.some((m) => m.s - her.s < 24 && m.s - her.s > 2)) this.once('monkey', D.monkey, true)
      if (r.falls !== undefined && r.falls - her.s < 40 && r.falls - her.s > 0) this.once('waterfall', D.waterfall, true)
      // The rain: Daddy loves the wipers.
      if (this.weather === 'rain' && !this.wasAbove && t > 7) this.once('rain', D.rain, true)
    }
    // ---- Stuck: after ~8 s with nothing touched, Sparkle says what to do (twice a drive at most) ----
    const quiet = t - Math.max(this.lastTouch, this.quietFrom)
    if (quiet < STUCK_S || t - this.hintSaid < HINT_EVERY || this.hintN >= HINT_MAX || !this.quiet()) return
    const l = this.phase === 'drive' ? D.steer : this.tracing && this.trace.t > 3 ? D.draw : null
    if (!l) return
    this.hintSaid = t
    this.hintN++
    this.speak(l)
  }

  // ---------------------------------------------------------------- the 3, drawn

  /** A pink crayon line along the middle of the road, drawn from the start to the end once she's at the viewpoint. */
  private buildCrayon() {
    const S = this.r.road.samples
    const pos: number[] = []
    for (let i = 0; i < S.length - 1; i++) {
      const a = S[i]
      const b = S[i + 1]
      const w = 1.3
      const q = [
        [a.x - a.lx * w, a.y + 0.5, a.z - a.lz * w],
        [b.x - b.lx * w, b.y + 0.5, b.z - b.lz * w],
        [a.x + a.lx * w, a.y + 0.5, a.z + a.lz * w],
        [b.x + b.lx * w, b.y + 0.5, b.z + b.lz * w],
      ]
      for (const k of [0, 1, 2, 1, 3, 2]) pos.push(...q[k])
    }
    const g = this.bag.add(new BufferGeometry())
    g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
    g.setDrawRange(0, 0)
    const m = new Mesh(g, this.bag.add(new MeshBasicMaterial({ color: PAL.hotpink, depthTest: false })))
    m.renderOrder = 5
    m.frustumCulled = false
    return m
  }

  /** The big pink crayon: a wax stick in its paper wrapper, its point down on the road (leaning back the way it came). */
  private buildCrayonTip() {
    const g = new Group()
    const stick = solid(merge([
      P.cone(1.5, 3.2, PAL.hotpink, { at: [0, 1.6, 0], rot: [Math.PI, 0, 0] }),
      P.cyl(1.5, 1.5, 3, PAL.hotpink, { at: [0, 4.6, 0] }),
      P.cyl(1.56, 1.56, 7, '#FFD3E6', { at: [0, 9.5, 0] }),
      ...[6.4, 12.6].map((y) => P.cyl(1.6, 1.6, 0.5, PAL.hotpink, { at: [0, y, 0] })),
      P.cyl(1.5, 1.5, 1, PAL.hotpink, { at: [0, 13.5, 0] }),
    ]), this.bag, 3)
    stick.rotation.x = -0.55
    // (Big enough to see from up over the hill.)
    stick.scale.setScalar(2.4)
    g.add(stick)
    g.visible = false
    return g
  }

  /** Drawing the 3 from the viewpoint: her finger near the line pulls the crayon along the road (it only goes forward,
   *  and only along the road just ahead of it, so it can't jump to the next leg of a hairpin); a tap sends it on round
   *  the next bend. The numbers pop as it rounds each bend; at the end, the fanfare. */
  private updateTrace(dt: number) {
    const tip = this.crayonTip
    if (!this.crayon || !tip) return
    tip.visible = this.r.id === 'three' && (this.phase === 'view' || this.phase === 'end')
    if (!this.tracing) return
    const road = this.r.road
    const T = this.trace
    T.t += dt
    // (After the camera has lifted up over the hill.)
    const ready = T.t > 1.8
    let goal = T.s
    const f = this.finger
    if (ready && f) {
      const s = this.traceAt(f.x, f.y)
      if (s !== null && s > T.s) {
        goal = s
        T.auto = -1
      }
    }
    if (ready && T.auto > T.s) goal = Math.max(goal, T.auto)
    // Nearly there: the crayon finishes the last bit by itself.
    if (T.s > road.length - 8 && T.auto < 0) T.auto = road.length
    if (goal > T.s) {
      T.s = Math.min(goal, T.s + dt * (T.auto > 0 ? 75 : 170), road.length)
      T.scratch -= dt
      if (T.scratch <= 0) {
        T.scratch = 0.11
        sfx.scribble()
      }
      if (T.auto > 0 && T.s >= T.auto - 0.01) T.auto = -1
    }
    // (Samples are a meter apart: the line is drawn up to the crayon.)
    this.crayon.geometry.setDrawRange(0, Math.floor(T.s) * 6)
    const sm = road.sampleAt(T.s)
    tip.position.set(sm.x, sm.y + 0.6, sm.z)
    tip.rotation.y = Math.atan2(sm.tx, sm.tz)
    tip.scale.setScalar(1 + Math.sin(this.time * 5) * (goal > T.s ? 0 : 0.04))
    const passed = this.r.count.filter((s) => s <= T.s).length
    if (passed > this.drawn) {
      this.drawn = passed
      this.countN++
      sounds.note(passed * 2)
      this.number(passed)
      this.sparkle.burst(sm.x, sm.y + 3, sm.z, 26, 6, 7, 0.4)
    }
    if (T.s >= road.length - 0.5) {
      sounds.fanfare()
      this.speak(L.nan.drive.drew)
      for (const [k, c] of [this.kaylee, this.nick, this.ji].entries()) window.setTimeout(() => c.react('hop'), k * 120)
      const b = road.bounds()
      for (const k of [0.2, 0.5, 0.8]) {
        const q = road.sampleAt(road.length * k)
        this.sparkle.burst(q.x, q.y + 4, q.z, 40, 9, 9, 0.5)
      }
      this.sparkle.burst((b.x0 + b.x1) / 2, b.y1 + 8, (b.z0 + b.z1) / 2, 60, 12, 10, 0.55)
      this.setPhase('end')
    }
  }

  /** The stretch of road just ahead of the crayon that's nearest her finger on screen (null: she's too far from it). */
  private traceAt(fx: number, fy: number) {
    const road = this.r.road
    const from = this.trace.s
    let best: number | null = null
    let bd = 130
    for (let s = Math.max(0, from - 4); s <= Math.min(road.length, from + 48); s += 1.5) {
      const p = road.sampleAt(s)
      const c = this.project(p.x, p.y + 0.5, p.z)
      if (!c) continue
      const d = Math.hypot(c.x - fx, c.y - fy)
      if (d < bd) {
        bd = d
        best = s
      }
    }
    return best
  }

  // ---------------------------------------------------------------- camera

  private shot(): Shot {
    const d = this.d
    const road = this.r.road
    const y = this.carY()
    if (this.phase === 'view' || this.phase === 'end') {
      if (this.r.id === 'three') {
        // Up and over the hill: the whole road below, the top of the 3 at the top of the screen.
        // (The box reaches further down the screen than the road, so the end card's buttons sit under the 3.)
        const b = road.bounds(6)
        const dz = (b.z1 - b.z0) * 0.14
        return { center: new Vector3((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, (b.z0 + b.z1) / 2 + dz), half: new Vector3((b.x1 - b.x0) / 2, 4, (b.z1 - b.z0) / 2 + dz), yaw: this.unwrap(0), pitch: 64, minDist: 30, maxDist: 600 }
      }
      // Round to look at the stop, the Pajero parked in front of it.
      const l = this.landmark.position
      // (The salt village sits down the slope below the road: look down into it from higher up, over the car.)
      const down = !!this.landmark.userData.steam
      const k = down ? 0.72 : 0.5
      const c = new Vector3(d.x + (l.x - d.x) * k, l.y + 3, d.z + (l.z - d.z) * k)
      const yaw = Math.atan2(d.x - l.x, d.z - l.z) / deg + 25
      return { center: c, half: down ? new Vector3(11, 4, 11) : new Vector3(9, 5, 9), yaw: this.unwrap(yaw + Math.sin(this.time * 0.25) * 6), pitch: down ? 34 : 16, minDist: 10, maxDist: 70 }
    }
    const sp = clamp(Math.abs(d.speed) / d.feel.top, 0, 1)
    const tall = clamp((1 - this.w / this.h) / 0.4, 0, 1)
    // A hairpin coming: higher, to see round it.
    const bend = clamp(Math.abs(road.bendAhead(this.loc.s, 30)) / 2, 0, 1)
    const ahead = road.spotAt(this.loc.s + 7 + 3 * sp, 0)
    return {
      center: new Vector3((d.x + ahead.x) / 2, (y + ahead.y) / 2 + 1.1, (d.z + ahead.z) / 2),
      half: new Vector3(5.2 + 1.5 * bend, 2.2, 7 + 3 * bend + 2 * tall),
      yaw: this.unwrap(this.camHeading / deg + 180),
      pitch: 17 + 12 * bend + 8 * tall,
      minDist: 7,
      maxDist: 40,
      follow: true,
    }
  }

  private unwrap(yaw: number) {
    return this.rig.yaw + wrapDeg(yaw - this.rig.yaw)
  }

  /** The camera never sits inside a hill or looks through one: it rises over it. */
  private clearTerrain() {
    if (this.phase !== 'drive' && this.phase !== 'arrive' && this.r.id === 'three') return
    const cam = this.rig.camera
    const field = this.world.field
    const p = cam.position
    const target = tmp2.set(this.d.x, this.carY() + 1.2, this.d.z)
    let lift = Math.max(0, field.at(p.x, p.z) + 2.4 - p.y)
    for (const k of [0.25, 0.5, 0.75]) {
      const x = p.x + (target.x - p.x) * k
      const z = p.z + (target.z - p.z) * k
      const yy = p.y + lift + (target.y - p.y - lift) * k
      const g = field.at(x, z) + 0.8
      if (g > yy) lift += (g - yy) / (1 - k)
    }
    if (lift <= 0) return
    p.y += Math.min(lift, 30)
    if (this.phase === 'drive' || this.phase === 'arrive') cam.lookAt(target)
  }

  // ---------------------------------------------------------------- the screen

  render() {
    const r = this.renderer
    r.render(this.scene, this.rig.camera)
    this.stats.calls = r.info.render.calls
    this.stats.tris = r.info.render.triangles
  }

  private project(x: number, y: number, z: number) {
    const v = tmp.set(x, y, z).project(this.rig.camera)
    if (v.z > 1) return null
    return { x: ((v.x + 1) / 2) * this.w, y: ((1 - v.y) / 2) * this.h }
  }

  /** The steering ring's radius on screen (px): a good thumb's reach on an iPad, smaller on a phone. */
  private get stickR() {
    return clamp(Math.min(this.w, this.h) * 0.12, 56, 92)
  }

  /** How far the knob is pushed across the road (-1..1, + toward +lat): the ring's push, read along the way the road
   *  runs across the screen just ahead (so "right" on screen is right on the road, even round a hairpin). */
  private stickAcross(f: { x: number; y: number; ox: number; oy: number }) {
    const R = this.stickR
    let dx = (f.x - f.ox) / R
    let dy = (f.y - f.oy) / R
    const len = Math.hypot(dx, dy)
    if (len > 1) {
      dx /= len
      dy /= len
    }
    const road = this.r.road
    const s = Math.min(road.length, this.loc.s + 10)
    const m = road.spotAt(s, 0)
    const e = road.spotAt(s, road.half)
    const c = this.project(m.x, m.y, m.z)
    const l = this.project(e.x, e.y, e.z)
    if (!c || !l) return clamp(dx, -1, 1)
    const vx = l.x - c.x
    const vy = l.y - c.y
    const vl = Math.hypot(vx, vy)
    if (vl < 1) return clamp(dx, -1, 1)
    // (Mostly sideways on screen: only the left-right part of the push steers.)
    return clamp(dx * Math.sign(vx || 1) + dy * (vy / vl) * 0.3, -1, 1)
  }


  private toScreen(at: Vector3, r: number, max = 140) {
    const cam = this.rig.camera
    const center = at.clone().project(cam)
    if (center.z > 1 || Math.abs(center.x) > 1.05 || Math.abs(center.y) > 1.05) return null
    const right = tmp2.set(1, 0, 0).applyQuaternion(cam.quaternion)
    const edge = at.clone().addScaledVector(right, r).project(cam)
    return {
      x: ((center.x + 1) / 2) * this.w,
      y: ((1 - center.y) / 2) * this.h,
      size: clamp(Math.abs(edge.x - center.x) * this.w, 64, max),
      z: Math.round((1 - center.z) * 10000),
    }
  }

  private anchorAt(id: string): { at: Vector3; r: number; prio: number; max?: number } | null {
    const her = this.her()
    if (id === 'car') {
      const at = this.car.root.getWorldPosition(new Vector3())
      at.y += 1.3
      return { at, r: 1.6, prio: 2, max: 150 }
    }
    // In the car (while it's on the road, and parked by the stop): Daddy, the elephant toy, the tailgate's wiper.
    if (id === 'family:nick' || id === 'elephant' || id === 'wipers') {
      if (this.r.id === 'three' && this.phase !== 'drive' && this.phase !== 'arrive') return null
      // (Kept apart on screen: Daddy up by the roof's front, the elephant's head, the wiper low on the tailgate.)
      if (id === 'family:nick') return { at: this.nick.root.getWorldPosition(new Vector3()).add(tmp2.set(0, this.nick.height * 0.85, 0)), r: 0.3, prio: 3, max: 80 }
      if (id === 'elephant') return { at: this.car.elephant.root.getWorldPosition(new Vector3()).add(tmp2.set(0, 0.32, 0)), r: 0.2, prio: 4, max: 72 }
      return { at: this.car.body.localToWorld(new Vector3(...this.car.rearWiper).add(tmp2.set(0, -0.22, 0))), r: 0.28, prio: 4, max: 72 }
    }
    if (id.startsWith('mirror:')) {
      const m = this.mirrors[Number(id.slice(7))]
      return m && m.s - her.s > -10 && m.s - her.s < 80 ? { at: m.at, r: 0.7, prio: 1 } : null
    }
    if (id === 'falls') {
      if (!this.falls || Math.abs(this.r.falls! - her.s) > 80) return null
      return { at: this.falls.position.clone().setY(this.falls.position.y + 4), r: 2, prio: 0 }
    }
    if (id === 'landmark') {
      if (this.r.road.length - her.s > 120) return null
      return { at: this.landmark.position.clone().setY(this.landmark.position.y + 4), r: 4, prio: this.phase === 'drive' ? 0 : 3, max: 220 }
    }
    const a = this.traffic.anchorAt(id, her)
    return a ? { ...a, prio: 1 } : null
  }

  placeAnchors() {
    const overview = this.r.id === 'three' && (this.phase === 'view' || this.phase === 'end')
    for (const [id, el] of this.anchorEls) {
      // (From above, only the viewpoint, once the 3 is drawn: a finger anywhere draws.)
      const a = overview && (id !== 'landmark' || this.phase === 'view') ? null : this.anchorAt(id)
      const s = a ? this.toScreen(a.at, a.r, a.max) : null
      if (s && a) {
        el.style.transform = `translate3d(${(s.x - s.size / 2).toFixed(1)}px, ${(s.y - s.size / 2).toFixed(1)}px, 0)`
        el.style.width = el.style.height = `${s.size.toFixed(0)}px`
        el.style.zIndex = String(s.z + a.prio * 3000)
      }
      const want = s ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
  }

  /** The wheel on the screen turns the way the car is turning. */
  private writeWheel() {
    const el = this.wheelEl
    if (!el) return
    const turn = clamp(-this.d.yawRate / this.d.feel.turn, -1, 1) * 80
    el.style.setProperty('--turn', `${turn.toFixed(1)}deg`)
  }

  /** The steering ring: under her finger while she steers, the knob following it (held inside the ring). */
  private writeStick() {
    const el = this.stickEl
    if (!el) return
    const f = this.finger
    const show = this.phase === 'drive' && !!f?.steering
    const want = show ? '' : 'none'
    if (el.style.display !== want) el.style.display = want
    if (!show || !f) return
    const R = this.stickR
    let dx = f.x - f.ox
    let dy = f.y - f.oy
    const len = Math.hypot(dx, dy)
    if (len > R) {
      dx *= R / len
      dy *= R / len
    }
    el.style.setProperty('--r', `${R.toFixed(0)}px`)
    el.style.transform = `translate3d(${f.ox.toFixed(0)}px, ${f.oy.toFixed(0)}px, 0)`
    const knob = el.firstElementChild?.nextElementSibling as HTMLElement | null
    if (knob) knob.style.transform = `translate3d(${dx.toFixed(0)}px, ${dy.toFixed(0)}px, 0)`
  }

  /** Not steering for a while (or never yet): a finger sliding side to side low on the screen (the steering ring), or, drawing the 3, along the road. */
  private hint(t: number) {
    const el = this.hintEl
    if (!el) return
    const idle = t - this.lastTouch
    // Drawing the 3: the finger sweeps along the road ahead of the crayon, the way it goes.
    const T = this.trace
    const trace = this.tracing && !this.finger && T.t > 2.4 && T.auto < 0 && (T.s < 1 ? idle > 1.5 || T.t > 3.5 : idle > 5)
    const show = trace || (this.phase === 'drive' && !this.finger && ((this.counts.steered < 1 && t > 2.5 && idle > 2.5) || idle > 8))
    if (show) {
      // (Driving: low on the screen, sliding side to side the way the steering ring works.)
      const p = trace ? this.r.road.spotAt(Math.min(this.r.road.length, T.s + ((t * 18) % 30)), 0) : null
      const c = p ? this.project(p.x, p.y, p.z) : { x: this.w / 2 + Math.sin(t * 1.6) * this.stickR * 0.9, y: this.h * 0.72 }
      if (c) el.style.transform = `translate3d(${c.x.toFixed(0)}px, ${c.y.toFixed(0)}px, 0)`
      else el.style.display = 'none'
    }
    const want = show ? '' : 'none'
    if (el.style.display !== want) el.style.display = want
  }

  private emitHud() {
    const hud: DriveHud = { phase: this.phase, count: { k: this.drawn >= 0 ? this.drawn : this.counted, n: this.countN } }
    const key = JSON.stringify(hud)
    if (key === this.lastHud) return
    this.lastHud = key
    this.events.onHud(hud)
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const r2 = (v: number) => Math.round(v * 100) / 100
    return {
      road: this.r.id,
      weather: this.weather,
      phase: this.phase,
      s: r2(this.loc.s),
      lat: r2(this.loc.lat),
      length: this.r.road.length,
      progress: r2(this.loc.s / this.r.road.length),
      y: r2(this.carY()),
      speed: r2(this.d.speed),
      cloud: r2(this.cloudK),
      above: this.wasAbove,
      counted: this.counted,
      traced: r2(this.trace.s),
      drawn: this.drawn,
      // Drawing the 3: where the road is on screen, every 6 m (a robot finger follows it).
      path: this.tracing ? this.pathOnScreen() : null,
      warn: this.traffic.blindWarning(this.her()) !== null,
      ...this.counts,
      steered: r2(this.counts.steered),
      stick: r2(this.stick),
      steerLat: r2(this.steerLat),
      keptLeft: r2(this.counts.keptLeft),
      traffic: this.traffic.qa(),
    }
  }
  private pathOnScreen() {
    const road = this.r.road
    const out: [number, number][] = []
    for (let s = 0; s <= road.length; s += 6) {
      const p = road.sampleAt(s)
      const c = this.project(p.x, p.y + 0.5, p.z)
      if (c) out.push([Math.round(c.x), Math.round(c.y)])
    }
    return out
  }

  memory() {
    return { ...this.renderer.info.memory }
  }

  dispose() {
    this.scene.clear()
    this.bag.dispose()
  }
}

const tmpColor = new Color()

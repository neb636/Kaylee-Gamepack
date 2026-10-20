// The boat race (sections `race` and `podium`): through the rainbow gate in Phang Nga Bay is a secret lagoon walled in
// by rock towers, and a roped-off course round its island. Captain Kaylee races the village kids (their sky-blue
// longtail) and the cheeky macaque (his banana boat) three laps, Mario Kart style, and she always wins.
//
// The toy is the same as the bay's (drive the longtail with one finger), made into a race:
// - Hold a finger on the water: the boat goes there at full speed (only forward along the course: her finger picks
//   where across it). Let go and it keeps racing by itself, a little slower (so she can never stop or get lost).
// - The start: three lights and Sparkle's "Three! Two! One! Go!"; a finger already down at GO is a rocket start.
// - Rainbow item boxes give 🚀 a turbo, 🍌 a banana (thrown at whoever is ahead, or dropped behind) or 🌈 the
//   rainbow (fast, sparkly, unstoppable); she uses it with the big button. Gold coins make her a little faster (up to
//   ten), golden arrow pads give a burst of speed, the ramp throws her in the air (a tap there is a trick and a burst on
//   landing), holding a long hard turn builds sparks and a little turbo when it straightens (a drift's mini-turbo).
// - The macaque drops banana peels behind him: drive over one and she spins round (never stopped for long). Bump into
//   a rival and you both bounce; with the rainbow, they spin.
// - The rivals keep it close the whole way (rubber banding round a story of the race: they lead at the start, she
//   catches the macaque, the kids and she swap places, and on the last lap the kids are right beside her) and can't
//   cross the line first: she wins by a nose at the end. Slow motion, fireworks, the crowd jumps.
// - The podium: she stands on 1 and lifts the gold trophy with KAYLEE on it, the kids on 2, the macaque on 3; a photo
//   for the trip album, and the trophy goes in her Trophy Room (RaceLayer.tsx) and rides home in the boat.
// The race shows its state to the screen (onHud: the countdown, lap, place, coins, item); the minimap's dots and the
// tap targets are written here every frame.
import { Color, Fog, Group, Plane, Raycaster, Scene, Vector2, Vector3, type WebGLRenderer } from 'three'
import { clamp, sounds, type Line } from '../../../../../../sdk'
import { Avatar } from '../../../characters/avatar'
import { FAMILY } from '../../../characters/family'
import { Member } from '../../../characters/member'
import type { AnchorInfo } from '../../../engine/Anchors'
import { CameraRig, type Shot } from '../../../engine/camera'
import { Bag } from '../../../engine/dispose'
import { setOutlineResolution } from '../../../engine/outline'
import { Particles } from '../../../engine/particles'
import { photoCamera, snapPhoto } from '../../../engine/photo'
import { applyBands, makeLights, PAL } from '../../../engine/toon'
import type { World3D } from '../../../engine/View3D'
import { swell, Water } from '../../../engine/water'
import { L } from '../../../lines'
import { sfx } from '../../../sfx'
import { Driver, type Feel } from '../../../trip/drive'
import { wearing } from '../../../trip/packing'
import { buildLongtail, type Longtail } from '../../../trip/vehicles/longtail'
import type { Vehicle } from '../../../trip/vehicles/vehicle'
import { applyPose, clearPose } from '../bay/poses'
import type { PoseKind } from '../bay/part'
import { Sky } from '../bay/sky'
import { buildBananaBoat, buildKidsBoat, buildMonkeyCrew, RACE_FEEL, type Crew } from './boats'
import { buildAura, Course, type ItemKind } from './items'
import { RaceMusic } from './music'
import { buildRaceScenery, RAINBOW, type RaceScenery } from './scenery'
import { ahead, bendAhead, GRID, HALF, ITEM_ROWS, LAPS, LENGTH, locate, mapXY, PODIUM, RAMP, spotAt, STAND } from './track'
import { buildPodium, buildTrophy, type Podium } from './trophy'

export type RaceSection = 'race' | 'podium'
export type RacerId = 'kaylee' | 'kids' | 'monkey'
export type RacePhase = 'intro' | 'count' | 'race' | 'finish' | 'podium'

export interface RaceStart {
  section: RaceSection
  packed: string[]
  ribbons: string[]
  /** The lap the race starts on (a `lap=3` link starts on the last lap). */
  lap: number
  /** She has raced before this visit (a shorter start: no "race you!"). */
  again: boolean
}

/** What the screen shows (RaceLayer.tsx): sent when it changes. */
export interface RaceHud {
  phase: RacePhase
  /** The countdown: 3, 2, 1, then 0 for GO! (-1: none showing). */
  count: number
  /** Her lap, 1..LAPS. */
  lap: number
  /** Her place, 1..3, and everyone in order. */
  place: number
  order: RacerId[]
  coins: number
  item: ItemKind | null
  /** The item slot is spinning. */
  rolling: boolean
  /** A big word sweeping across: a new lap, the last lap, the win (`n` changes each time). */
  banner: { kind: 'lap2' | 'final' | 'win'; n: number } | null
  /** On the podium, the trophy is in her hands. */
  trophy: boolean
}

export interface RaceEvents {
  onSection(s: RaceSection): void
  say(line: Line): void
  onHud(hud: RaceHud): void
  /** She crossed the line first. */
  onWin(): void
  /** The podium photo, for the trip album. */
  onPhoto(src: string): void
  onFlash(): void
}

export const RACE_ANCHORS: AnchorInfo[] = [
  { id: 'boat', label: 'Boat', kind: 'thing' },
  { id: 'family:kaylee', label: 'Kaylee', kind: 'family' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'rival:kids', label: 'The village kids', kind: 'thing' },
  { id: 'rival:monkey', label: 'The macaque', kind: 'thing' },
  { id: 'stand', label: 'The fans', kind: 'thing' },
  { id: 'trophy', label: 'Trophy', kind: 'thing' },
]

interface Racer {
  id: RacerId
  v: Vehicle
  d: Driver
  feel: Feel
  /** Its usual top speed (coins and rubber banding raise it). */
  base: number
  crew: Crew | null
  roll: { x: number; v: number }
  pitch: { x: number; v: number }
  squash: number
  travelled: number
  /** Where it is on the course: the nearest sample, meters along and across. */
  i: number
  s: number
  lat: number
  /** The lap it's on (0-based; -1 on the grid, before the line), and whether it has been round the far side. */
  laps: number
  half: boolean
  progress: number
  /** When it crossed the finish line (seconds), or -1. */
  done: number
  /** Seconds of spinning round left (a banana), and of rainbow. */
  spin: number
  spinFor: number
  star: number
  aura: ReturnType<typeof buildAura>
  coins: number
  /** In the air off the ramp: a trick done (a burst of speed on landing). */
  trick: number
  tricked: boolean
  /** A hard turn held: the mini-turbo's charge (seconds). */
  drift: number
  /** Where across the course it likes to drive (the rivals), and a slow sway round it. */
  lane: number
  sway: number
  bumpCool: number
  padCool: number
}

interface Rider {
  id: 'kaylee' | 'ji' | 'nick'
  char: Avatar | Member
  pose: { kind: PoseKind; t: number; until: number } | null
}

const deg = Math.PI / 180
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
const wrapDeg = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180
const tmp = new Vector3()
const tmp2 = new Vector3()
const grip = new Vector3()
const TOTAL = LAPS * LENGTH
/** The countdown's beat (seconds per light). */
const BEAT = 0.9
/** Seconds of slow motion as she crosses the line. */
const SLOWMO = 1.3

/** Where each rival wants to be, in meters ahead of her (negative: behind), through the race (0 = the start, 1 = the
 *  line). The story: they lead off the start, she catches the macaque, swaps places with the kids, and on the last
 *  lap the kids are right beside her until she pulls ahead at the very end. */
const SCRIPT: Record<'kids' | 'monkey', [number, number][]> = {
  kids: [[0, 7], [0.18, 9], [0.36, -4], [0.5, 4], [0.64, 5], [0.76, 2.5], [0.88, 1.2], [0.95, -1.5], [1, -5]],
  monkey: [[0, 5], [0.14, 3], [0.28, -6], [0.46, 7], [0.58, -2], [0.72, -9], [1, -16]],
}
function scripted(id: 'kids' | 'monkey', f: number) {
  const k = SCRIPT[id]
  for (let i = 1; i < k.length; i++) if (f <= k[i][0]) {
    const [f0, g0] = k[i - 1]
    const [f1, g1] = k[i]
    return g0 + ((g1 - g0) * (f - f0)) / (f1 - f0)
  }
  return k[k.length - 1][1]
}

export class Race implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  readonly bag = new Bag()
  private lights = makeLights(this.scene)
  private water: Water
  private sky: Sky
  private scenery: RaceScenery
  private course: Course
  private foam: Particles
  private spray: Particles
  private sparkle: Particles
  private fireworks: Particles
  private confetti: Particles
  private music = new RaceMusic()
  readonly racers: Racer[]
  private riders: Rider[]
  private podium: Podium
  private trophy: Group
  private phase: RacePhase = 'intro'
  private phaseT = 0
  section: RaceSection
  private finger: { x: number; y: number; steering: boolean; t: number; id?: string } | null = null
  private raycaster = new Raycaster()
  private water0 = new Plane(new Vector3(0, 1, 0), 0)
  private w = 1
  private h = 1
  time = 0
  private lastTouch = 0
  private camHeading = 0
  private engineT = 0
  private herRate = 0
  private lastProgress = 0
  private slow = 0
  private item: ItemKind | null = null
  private rolling = 0
  private itemT = 0
  private itemsGot = 0
  private boostKick = 0
  private vroomCool = 0
  private told = new Set<string>()
  private said = new Map<string, number>()
  private banner: RaceHud['banner'] = null
  private lastHud = ''
  private lastPlace = 3
  private peelT = 6
  private kidsTurboT = 12
  private fireworkT = 0
  private trophyT = -1
  private photoAt = -1
  private shots: (() => void)[] = []
  private rocket = false
  private counts = { boxes: 0, items: 0, coinsTaken: 0, pads: 0, jumps: 0, tricks: 0, slips: 0, hits: 0, drifts: 0, bumps: 0 }
  private timers: number[] = []
  /** The lap the race started on (a `lap=3` link). */
  private lap0 = 1
  private anchorEls = new Map<string, HTMLElement>()
  private hintEl: HTMLElement | null = null
  private mapEls = new Map<string, SVGElement>()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }

  constructor(
    private renderer: WebGLRenderer,
    private start: RaceStart,
    private events: RaceEvents,
  ) {
    const { scene, bag } = this
    const haze = '#DCEFFB'
    scene.background = new Color(PAL.sky)
    scene.fog = new Fog(haze, 140, 430)
    applyBands()
    this.rig.fov = 54
    this.rig.camera.far = 700
    this.water = new Water({ size: 900, deep: '#5FC7B4', shallow: '#78D4C1', haze, hazeNear: 110, hazeFar: 400 }, bag)
    this.sky = new Sky(bag, scene.fog as Fog, this.water, this.lights)
    this.scenery = buildRaceScenery(bag)
    this.course = new Course(bag)
    this.foam = new Particles({ kind: 'foam', count: 600, opacity: 0.88 }, bag)
    this.spray = new Particles({ kind: 'spray', count: 420 }, bag)
    this.sparkle = new Particles({ kind: 'spray', count: 360, colors: RAINBOW, gravity: 1.5 }, bag)
    this.fireworks = new Particles({ kind: 'spray', count: 500, colors: [...RAINBOW, PAL.gold, '#FFFFFF'], gravity: 4 }, bag)
    this.confetti = new Particles({ kind: 'spray', count: 320, colors: [...RAINBOW, PAL.gold], gravity: 1.2 }, bag)
    this.podium = buildPodium(bag)
    this.podium.root.position.set(PODIUM.x, 0, PODIUM.z)
    this.podium.root.rotation.y = PODIUM.heading + Math.PI
    this.trophy = buildTrophy(bag, 0.8)
    this.trophy.visible = false
    scene.add(this.sky.root, this.water.mesh, this.scenery.root, this.course.root, this.podium.root, this.trophy, this.foam.mesh, this.spray.mesh, this.sparkle.mesh, this.fireworks.mesh, this.confetti.mesh)

    // ---- The boats ----
    const kaylee = buildLongtail(bag)
    kaylee.setRibbons(start.ribbons)
    kaylee.setGarland(true)
    const kids = buildKidsBoat(bag)
    const banana = buildBananaBoat(bag)
    const monkey = buildMonkeyCrew(banana, bag)
    const racer = (id: RacerId, v: Vehicle, crew: Crew | null, top: number): Racer => {
      const feel = { ...RACE_FEEL, top }
      const r: Racer = { id, v, d: new Driver(feel), feel, base: top, crew, roll: { x: 0, v: 0 }, pitch: { x: 0, v: 0 }, squash: 1, travelled: 0, i: 0, s: 0, lat: 0, laps: -1, half: true, progress: 0, done: -1, spin: 0, spinFor: 1, star: 0, aura: buildAura(bag), coins: 0, trick: -1, tricked: false, drift: 0, lane: 0, sway: Math.random() * 6, bumpCool: 0, padCool: 0 }
      v.root.add(r.aura.mesh)
      scene.add(v.root)
      return r
    }
    this.racers = [racer('kaylee', kaylee, null, RACE_FEEL.top), racer('kids', kids.v, kids.crew, 13), racer('monkey', banana, monkey, 12.6)]
    this.racers[0].v.root.userData.pick = 'boat'
    this.racers[1].v.root.userData.pick = 'rival:kids'
    this.racers[2].v.root.userData.pick = 'rival:monkey'
    this.racers[1].lane = 2.5
    this.racers[2].lane = -2.5

    // ---- The family in her longtail: Kaylee at the tiller in what she packed, Mommy and Daddy on the benches ----
    const avatar = new Avatar(bag)
    avatar.wear(wearing(start.packed))
    const member = (id: 'ji' | 'nick') => new Member(FAMILY.find((m) => m.id === id)!, bag)
    this.riders = [
      { id: 'kaylee', char: avatar, pose: null },
      { id: 'ji', char: member('ji'), pose: null },
      { id: 'nick', char: member('nick'), pose: null },
    ]
    for (const r of this.riders) this.seat(r)

    this.section = start.section
    if (start.section === 'podium') this.toPodium(true)
    else this.toGrid()
    this.emitHud()
  }

  private get k() {
    return this.racers[0]
  }
  private racer(id: RacerId) {
    return this.racers.find((r) => r.id === id)!
  }

  // ---------------------------------------------------------------- setting up

  /** Everyone on the grid behind the line, Sparkle's line, then the countdown. */
  private toGrid() {
    const lap0 = (this.lap0 = clamp(Math.round(this.start.lap) || 1, 1, LAPS))
    for (const r of this.racers) {
      const g = GRID[r.id]
      const p = spotAt(g.s, g.lat)
      r.d.place(p.x, p.z, p.heading)
      r.laps = lap0 - 2
      r.half = true
      const loc = locate(p.x, p.z)
      r.i = loc.i
      r.s = loc.s
      r.lat = loc.lat
      r.progress = r.laps * LENGTH + r.s
      this.poseBoat(r, 0, 0)
    }
    this.lastProgress = this.k.progress
    this.camHeading = this.k.d.heading
    this.phase = 'intro'
    this.phaseT = 0
    this.scenery.setLights(0)
    this.rig.lag = 0.9
    this.rig.setShot(this.overview(), true)
  }

  /** The longtail's riders in their places (local to the boat). */
  private seat(r: Rider) {
    const v = this.k.v
    const s = v.seats[r.id]
    v.body.add(r.char.root)
    if (r.char instanceof Avatar) {
      r.char.place(s.x, s.y, s.z, 0)
      r.char.setPose(s.stand ? 'stand' : 'sit')
    } else r.char.place(s.x, s.y - 0.1 * r.char.height, s.z, 0, 'sit')
  }

  // ---------------------------------------------------------------- input

  setAnchorElements(els: Map<string, HTMLElement>) {
    this.anchorEls = els
  }
  setHintElement(el: HTMLElement | null) {
    this.hintEl = el
  }
  /** The minimap's dots (RaceLayer.tsx), by racer id. */
  setMapElements(els: Map<string, SVGElement>) {
    this.mapEls = els
  }

  pointerDown(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    // A finger on the water steers at once (before GO it revs, and it's a rocket start if it's still there at GO); one
    // on a tap target steers too once it moves or is held a moment (a quick tap there pokes it).
    this.finger = { x, y, steering: !id, t: this.time, id }
    if (this.k.d.airborne) this.doTrick()
  }
  pointerMove(x: number, y: number, downX: number, downY: number, held: boolean) {
    const f = this.finger
    if (!held || !f) return
    f.x = x
    f.y = y
    if (!f.steering && Math.hypot(x - downX, y - downY) > 12) f.steering = true
  }
  pointerUp() {
    if (this.finger?.steering) this.k.d.release()
    this.finger = null
  }

  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    if (this.k.d.airborne) return this.doTrick()
    void x
    void y
    switch (id) {
      case 'boat':
        return this.vroom()
      case 'family:kaylee':
        sfx.giggle()
        this.riders[0].char.react('hop')
        this.strike(this.riders[0], 'cheer', 1.1)
        return
      case 'family:ji':
      case 'family:nick': {
        const r = this.riders.find((x) => x.id === id.slice(7))!
        r.char.react('hop')
        this.strike(r, 'wave', 1.4)
        sfx.boing()
        return
      }
      case 'rival:kids':
        sfx.cheer()
        this.racer('kids').crew?.react('wave', 1.4)
        return
      case 'rival:monkey':
        sfx.chatter()
        this.racer('monkey').crew?.react('wave', 1.2)
        return
      case 'stand':
        sfx.cheer()
        this.scenery.cheer(1)
        return
      case 'trophy':
        if (this.trophyT >= 1) {
          sfx.chime()
          this.trophyT = 1
          this.trophySpin = 0
          this.sparkle.burst(this.trophy.position.x, this.trophy.position.y + 0.5, this.trophy.position.z, 24, 3, 3, 0.16)
          this.strike(this.riders[0], 'cheer', 2)
        }
        return
    }
  }
  private trophySpin = -1

  /** Tap the boat: VROOM (a burst of speed, now and then; in between it's a toot). */
  private vroom() {
    if (this.phase !== 'race' || this.k.done >= 0) return sfx.toot()
    if (this.vroomCool > 0) return sfx.toot()
    this.vroomCool = 3
    this.k.d.vroom(1.4)
    sfx.vroom()
    this.k.pitch.v -= 2.4
    this.k.squash = 0.3
    this.splash(this.k, this.k.v.stern, 20)
  }

  /** The item button (RaceLayer.tsx). */
  useItem() {
    const k = this.k
    const item = this.item
    if (!item || this.phase !== 'race' || k.done >= 0) return
    this.lastTouch = this.time
    this.item = null
    this.counts.items++
    if (item === 'turbo') {
      k.d.vroom(2.4)
      sfx.zoom()
      sfx.vroom()
      this.boostKick = 1
      k.pitch.v -= 3
      this.splash(k, k.v.stern, 26)
      this.line('wheee', L.race.wheee, 14)
    } else if (item === 'rainbow') {
      k.star = 6
      k.d.vroom(6)
      sounds.sparkle()
      this.music.setStar(true)
      this.line('fast', L.race.fast, 14)
    } else {
      // A banana: thrown at whoever is just ahead (the closest, within 60 m), or dropped behind if she's in front.
      const target = this.racers.filter((r) => r !== k && r.done < 0 && r.progress > k.progress && r.progress - k.progress < 60).sort((a, b) => a.progress - b.progress)[0]
      const from = k.v.root.position.clone().setY(1.6)
      if (target) {
        sfx.whoosh(0.5)
        this.course.toss(from, () => target.v.root.position.clone().setY(0.6), () => this.hit(target))
      } else {
        const back = this.back(k, 2)
        this.course.drop(back.x, back.z)
        sfx.plop()
      }
    }
    this.emitHud()
  }

  /** A thrown banana lands on a rival: splat, round and round they go. */
  private hit(r: Racer) {
    this.counts.hits++
    sfx.splat()
    this.spinOut(r, 1.4)
    if (r.id === 'kids') this.line('hey', L.race.hey, 10)
    else sfx.chatter()
    this.scenery.cheer(0.6)
    this.strike(this.riders[1], 'cheer', 1.2)
  }

  private spinOut(r: Racer, seconds: number) {
    r.spin = seconds
    r.spinFor = seconds
    r.squash = 0.2
    r.crew?.react('whoa', seconds)
    this.spray.burst(r.d.x, 0.4, r.d.z, 18, 3, 3.5, 0.22)
  }

  /** A tap in the air off the ramp: a trick (she twirls, the boat rolls right round), and a burst of speed when it lands. */
  private doTrick() {
    const k = this.k
    if (!k.d.airborne || k.tricked) return
    k.tricked = true
    k.trick = 0
    this.counts.tricks++
    sfx.trick()
    this.riders[0].char.react('hop')
    this.strike(this.riders[0], 'cheer', 1)
    this.scenery.cheer(0.5)
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
    return false
  }

  update(rawDt: number) {
    // Slow motion as she crosses the line.
    const dt = this.slow > 0 ? rawDt * 0.35 : rawDt
    this.slow = Math.max(0, this.slow - rawDt)
    this.time += dt
    this.phaseT += dt
    const t = this.time
    this.vroomCool -= dt
    this.boostKick = Math.max(0, this.boostKick - dt * 0.8)
    if (this.finger) {
      this.lastTouch = t
      if (!this.finger.steering && t - this.finger.t > 0.25) this.finger.steering = true
    }

    this.updatePhase(dt)
    if (this.phase === 'race' || this.phase === 'finish') {
      this.driveKaylee(dt)
      this.driveRivals(dt)
      for (const r of this.racers) this.step(r, dt)
      this.bumpBoats()
      this.places()
    } else if (this.phase === 'intro' || this.phase === 'count') this.rev(dt)

    // ---- The boats, the family, the lagoon ----
    for (const r of this.racers) this.poseBoat(r, dt, t)
    this.trail(this.k, dt)
    for (const r of this.racers.slice(1)) this.trail(r, dt)
    this.updateRiders(dt, t)
    for (const r of this.racers) r.crew?.update(dt, t, clamp(r.d.yawRate / r.feel.turn, -1, 1))
    this.updateTrophy(dt, t)
    this.course.update(dt)
    this.scenery.update(dt, t, this.rig.camera.position)
    this.podium.update(t)
    this.water.update(t)
    for (const p of [this.foam, this.spray, this.sparkle, this.fireworks, this.confetti]) p.update(dt)
    this.engine(dt)
    this.celebrate(dt)
    this.idleHints()

    // ---- The camera ----
    const d = this.k.d
    this.camHeading += wrap(d.heading - this.camHeading) * (1 - Math.exp(-dt / 0.45))
    this.rig.setShot(this.shot())
    this.rig.update(rawDt)
    this.unblockCamera()
    const cam = this.rig.camera
    this.sky.update(dt, cam.position.x, cam.position.z)
    const back = tmp.set(cam.position.x - d.x, 0, cam.position.z - d.z).normalize()
    this.lights.follow(d.x, 0, d.z)
    this.lights.sun.position.set(d.x + back.x * 7 - back.z * 4, 10, d.z + back.z * 7 + back.x * 4)
    this.emitHud()
  }

  /** The intro, the countdown, GO, the finish, the podium. */
  private updatePhase(dt: number) {
    const t = this.phaseT
    if (this.phase === 'intro') {
      if (t > 0.3 && !this.told.has('start')) {
        this.told.add('start')
        this.say(L.race.start)
      }
      if (!this.start.again && t > 4 && !this.told.has('raceYou')) {
        this.told.add('raceYou')
        this.say(L.race.raceYou)
        this.racer('kids').crew?.react('tease', 1.6)
      }
      if (t > (this.start.again ? 3.6 : 5.4)) {
        this.phase = 'count'
        this.phaseT = 0
      }
    } else if (this.phase === 'count') {
      const n = Math.min(4, Math.floor(t / BEAT) + 1)
      if (!this.told.has(`count${n}`)) {
        this.told.add(`count${n}`)
        this.scenery.setLights(n)
        sfx.light(n === 4)
        this.say(L.race.count[n - 1])
        if (n === 4) this.go()
      }
    } else if (this.phase === 'finish') {
      // Everyone else across the line too, then the podium.
      if (t > 5.2) this.toPodium(false)
    }
    void dt
  }

  /** GO! The music starts; a finger already down is a rocket start. */
  private go() {
    this.phase = 'race'
    this.phaseT = 0
    this.music.start()
    this.rig.lag = 0.3
    const k = this.k
    if (this.finger) {
      this.rocket = true
      k.d.vroom(1.6)
      sfx.vroom()
      k.pitch.v -= 3
      this.splash(k, k.v.stern, 24)
      this.later(() => this.line('wheee', L.race.wheee, 14), 300)
    }
    this.later(() => this.scenery.setLights(-1), 1500)
  }

  /** Before GO, a finger down revs the engine (the boat squats, the propeller throws spray). */
  private rev(dt: number) {
    const k = this.k
    if (!this.finger || this.phaseT < 0.4) return
    k.pitch.v -= dt * 3
    if (Math.random() < dt * 30) this.spray.emit(k.d.x + Math.sin(k.d.heading) * k.v.stern, 0.2, k.d.z + Math.cos(k.d.heading) * k.v.stern, -Math.sin(k.d.heading) * 3, 4, -Math.cos(k.d.heading) * 3, 0.6, 0.22)
  }

  /** Her finger (only forward along the course: it picks where across it), or racing on by herself. */
  private driveKaylee(dt: number) {
    const k = this.k
    const d = k.d
    let target: { x: number; z: number } | null = null
    let cap = 0.86
    if (k.done >= 0) {
      // Over the line: easing down, cruising on round.
      target = spotAt(k.s + 14, 0)
      cap = 0.45
    } else if (this.finger?.steering) {
      const p = this.waterPoint(this.finger.x, this.finger.y)
      if (p) {
        const loc = locate(p.x, p.z, k.i, 45)
        const ds = clamp(ahead(k.s, loc.s), 9, 30)
        target = spotAt(k.s + ds, clamp(loc.lat, -(HALF - 1.4), HALF - 1.4))
        cap = 1
      }
    }
    if (!target) {
      // By herself: along the inside of the next bend, but straight through the middle of the item boxes and over
      // the ramp (the good bits shouldn't need her to aim).
      const toGood = Math.min(...[...ITEM_ROWS, RAMP.s].map((g) => ahead(k.s, g)).filter((a) => a > -2))
      const lat = toGood < 30 ? 0 : clamp(bendAhead(k.s, 25) * 4, -4, 4)
      target = spotAt(k.s + 12 + Math.abs(d.speed) * 0.4, lat)
      cap *= 1 - clamp((Math.abs(bendAhead(k.s, 20)) - 0.5) * 0.3, 0, 0.3)
    }
    if (k.spin > 0) cap = Math.min(cap, 0.4)
    d.cap = cap
    d.hold(target.x, target.z)
    // How fast she's getting on round the course (the rivals keep up with this).
    const rate = (k.progress - this.lastProgress) / Math.max(1e-3, dt)
    this.lastProgress = k.progress
    if (Math.abs(rate) < 60) this.herRate += (rate - this.herRate) * (1 - Math.exp(-dt / 1))
    // The item slot.
    if (this.rolling > 0) {
      this.rolling -= dt
      if (Math.random() < dt * 14) sfx.roll()
      if (this.rolling <= 0) {
        this.item = this.pickItem()
        this.itemT = 0
        sfx.item()
        if (!this.told.has('item')) {
          this.told.add('item')
          this.say(L.race.item)
        }
      }
    }
    if (this.item) this.itemT += dt
  }

  /** What comes out of an item box: her first is a turbo; behind, better things (Mario Kart's way). */
  private pickItem(): ItemKind {
    this.itemsGot++
    if (this.itemsGot === 1) return 'turbo'
    const place = this.order().indexOf('kaylee') + 1
    const roll = Math.random()
    if (place === 1) return roll < 0.55 ? 'banana' : roll < 0.9 ? 'turbo' : 'rainbow'
    if (place === 2) return roll < 0.35 ? 'banana' : roll < 0.75 ? 'turbo' : 'rainbow'
    return roll < 0.1 ? 'banana' : roll < 0.55 ? 'turbo' : 'rainbow'
  }

  /** The rivals: along their lane, as fast as the race's story wants them (rubber banding), never over the line first. */
  private driveRivals(dt: number) {
    const k = this.k
    const f = clamp(k.progress / TOTAL, 0, 1)
    const vRef = Math.max(this.herRate, 7.5)
    for (const r of this.racers.slice(1)) {
      const d = r.d
      r.sway += dt * 0.35
      let lane = r.lane + Math.sin(r.sway) * 2.2
      // Round any banana peel lying ahead in their lane.
      for (const p of this.course.peelsOut) {
        const loc = locate(p.x, p.z, r.i, 30)
        const a = ahead(r.s, loc.s)
        if (a > 0 && a < 16 && Math.abs(loc.lat - lane) < 2) lane = loc.lat + (lane > loc.lat ? 2.6 : -2.6)
      }
      lane = clamp(lane, -(HALF - 1.6), HALF - 1.6)
      const look = 10 + Math.abs(d.speed) * 0.5
      const target = spotAt(r.s + look, lane)
      d.hold(target.x, target.z)
      let vt: number
      if (k.done >= 0) vt = r.done >= 0 ? r.feel.top * 0.45 : r.feel.top * 0.95
      else {
        const want = scripted(r.id as 'kids' | 'monkey', f)
        const gap = r.progress - k.progress
        vt = vRef + 0.32 * (want - gap)
        // The end: never past her near the line (they ease off alongside), and never over it first.
        const rem = TOTAL - r.progress
        if (rem < 150 && r.progress > k.progress - 1.2) vt = Math.min(vt, this.herRate * 0.85)
        if (rem < 3) vt = 0
      }
      // Behind the story (she's flying, all boosts and coins): they find more speed, up to half as fast again.
      r.feel.top = clamp(vt, r.base, r.base * 1.5)
      let cap = clamp(vt / r.feel.top, 0, 1)
      cap *= 1 - clamp((Math.abs(bendAhead(r.s, 20)) - 0.5) * 0.3, 0, 0.3)
      if (r.spin > 0) cap = Math.min(cap, 0.35)
      d.cap = cap
      // The macaque drops a peel behind him now and then, when she's coming up behind.
      if (r.id === 'monkey' && k.done < 0) {
        this.peelT -= dt
        const lead = r.progress - k.progress
        if (this.peelT <= 0 && lead > 8 && lead < 60 && r.spin <= 0) {
          this.peelT = 7 + Math.random() * 5
          ;(r.crew as ReturnType<typeof buildMonkeyCrew>).toss()
          sfx.chatter()
          this.later(() => {
            const b = this.back(r, 1.5)
            this.course.drop(b.x, b.z)
          }, 250)
        }
      }
      // The kids hit the gas when she's right behind them: "Catch us!"
      if (r.id === 'kids' && k.done < 0) {
        this.kidsTurboT -= dt
        const lead = r.progress - k.progress
        if (this.kidsTurboT <= 0 && lead > 1 && lead < 14) {
          this.kidsTurboT = 14 + Math.random() * 8
          d.vroom(1.3)
          r.crew?.react('tease', 1.4)
          this.line('catchUs', L.race.catchUs, 18)
        }
      }
    }
  }

  /** One racer's step: drive, the ropes, the course's things, where it is now and its laps. */
  private step(r: Racer, dt: number) {
    const d = r.d
    const before = { x: d.x, z: d.z }
    const ev = d.step(dt)
    if (ev.landed !== undefined && ev.landed > 1) this.land(r, ev.landed)
    this.ropes(r)
    r.travelled += Math.hypot(d.x - before.x, d.z - before.z)
    r.bumpCool -= dt
    r.padCool -= dt
    r.spin = Math.max(0, r.spin - dt)
    r.star = Math.max(0, r.star - dt)
    if (r === this.k && r.star <= 0) this.music.setStar(false)
    // Where it is now; a lap counts once it has been round the far side.
    const prev = r.s
    const loc = locate(d.x, d.z, r.i, 14)
    r.i = loc.i
    r.s = loc.s
    r.lat = loc.lat
    if (r.s > LENGTH * 0.4 && r.s < LENGTH * 0.6) r.half = true
    if (prev > LENGTH * 0.75 && r.s < LENGTH * 0.25) {
      if (r.half) {
        r.laps++
        r.half = false
        this.lapped(r)
      }
    } else if (prev < LENGTH * 0.25 && r.s > LENGTH * 0.75 && !r.half) {
      // Back over the line the wrong way.
      r.laps--
      r.half = true
    }
    r.progress = r.laps * LENGTH + r.s
    if (r.done >= 0 || this.phase !== 'race') {
      if (r.done < 0 && r.laps >= LAPS) r.done = this.time
      return
    }
    // The course's things.
    if (this.course.onPad(r.s, r.lat) && r.padCool <= 0) {
      r.padCool = 0.8
      d.vroom(1.3)
      if (r === this.k) {
        this.counts.pads++
        sfx.zoom()
        this.boostKick = 0.8
      }
      this.splash(r, r.v.stern, 12)
    }
    const up = this.course.onRamp(r.s, r.lat)
    if (up !== null && up > 0.55 && !d.airborne && d.speed > 5) {
      d.jump(5.4 + d.speed * 0.12)
      r.tricked = false
      if (r === this.k) {
        this.counts.jumps++
        sfx.vroom()
        // A finger held (as Sparkle said) or a touch just before takeoff is the trick; slow motion while she's up.
        if (this.finger || this.time - this.lastTouch < 1) this.doTrick()
        this.slow = Math.max(this.slow, 0.5)
      } else {
        // The rivals always do a trick.
        r.tricked = true
        r.trick = 0
        r.crew?.react('cheer', 1.2)
      }
    }
    const peel = this.course.slip(d.x, d.z)
    if (peel) {
      if (r.star > 0) sfx.splat()
      else {
        this.spinOut(r, r === this.k ? 0.9 : 1.3)
        sfx.slip()
        if (r === this.k) {
          this.counts.slips++
          this.line('banana', L.race.banana, 16)
        }
      }
    }
    if (r === this.k) {
      if (!this.item && this.rolling <= 0) {
        if (this.course.takeBox(d.x, d.z)) {
          this.counts.boxes++
          this.rolling = 1.2
          sounds.sparkle()
          this.sparkle.burst(d.x, 1.4, d.z, 20, 3, 3, 0.16)
        }
      }
      for (const c of this.course.takeCoins(d.x, d.z)) {
        this.counts.coinsTaken++
        r.coins = Math.min(10, r.coins + 1)
        r.feel.top = r.base * (1 + 0.012 * r.coins)
        sounds.note(Math.min(10, r.coins))
        this.sparkle.burst(c.x, c.y, c.z, 6, 1.5, 2, 0.12, 2)
      }
      this.miniTurbo(r, dt)
      // The ramp coming up for the first time: "Tap in the air for a trick!"
      const toRamp = ahead(r.s, RAMP.s)
      if (toRamp > 40 && toRamp < 70 && !this.told.has('ramp')) {
        this.told.add('ramp')
        this.say(L.race.ramp)
      }
      if (r.laps === LAPS - 1 && TOTAL - r.progress < 90 && !this.told.has('almost')) {
        this.told.add('almost')
        this.say(L.race.almost)
      }
    }
  }

  /** Holding a long hard turn at speed builds sparks (blue, then pink); straightening out lets them go as a turbo. */
  private miniTurbo(r: Racer, dt: number) {
    const d = r.d
    const turning = Math.abs(d.yawRate) > r.feel.turn * 0.36 && d.speed > r.feel.top * 0.55 && !d.airborne
    if (turning) {
      r.drift += dt
      if (r.drift > 0.6 && Math.random() < dt * 40) {
        const side = Math.sign(d.yawRate)
        const b = this.back(r, 0)
        this.sparkle.emit(b.x - Math.cos(d.heading) * side * 0.7, 0.3, b.z + Math.sin(d.heading) * side * 0.7, (Math.random() - 0.5) * 2, 2.5, (Math.random() - 0.5) * 2, 0.35, 0.16, r.drift > 1.4 ? 0 : 4)
      }
    } else if (Math.abs(d.yawRate) < r.feel.turn * 0.18) {
      if (r.drift > 0.6) {
        d.vroom(r.drift > 1.4 ? 1.1 : 0.6)
        this.counts.drifts++
        sfx.zoom()
        this.boostKick = 0.5
      }
      r.drift = 0
    }
  }

  /** A new lap: the banner, the bell, Sparkle; the last lap speeds the music up. */
  private lapped(r: Racer) {
    if (r !== this.k) return
    if (r.laps >= LAPS) return this.won()
    if (r.laps <= 0) return
    sfx.lap()
    this.scenery.cheer(1)
    if (r.laps === LAPS - 1) {
      this.banner = { kind: 'final', n: this.time }
      this.say(L.race.final)
      this.music.setFinal(true)
    } else {
      this.banner = { kind: 'lap2', n: this.time }
      this.say(L.race.lap2)
    }
  }

  /** Over the line, first! Slow motion, fireworks, the crowd, the trophy room. */
  private won() {
    const k = this.k
    k.done = this.time
    this.phase = 'finish'
    this.phaseT = 0
    this.slow = SLOWMO
    this.banner = { kind: 'win', n: this.time }
    // A cut to the head-on shot (gliding there would sweep the camera through the arch).
    this.rig.setShot(this.shot(), true)
    this.music.stop()
    sounds.fanfare()
    this.scenery.cheer(1)
    this.fireworkT = 0
    this.say(L.race.win)
    this.later(() => this.say(L.race.won), 2400)
    for (const r of this.riders) this.strike(r, 'cheer', 4)
    this.events.onWin()
  }

  /** Everyone's place: by how far round they are (those over the line by when they crossed). */
  private order(): RacerId[] {
    return [...this.racers]
      .sort((a, b) => {
        if (a.done >= 0 || b.done >= 0) return (a.done < 0 ? Infinity : a.done) - (b.done < 0 ? Infinity : b.done)
        return b.progress - a.progress
      })
      .map((r) => r.id)
  }

  private places() {
    const place = this.order().indexOf('kaylee') + 1
    if (this.phase === 'race' && place < this.lastPlace && this.phaseT > 3) {
      // She passed someone: Daddy cheers (now and then), and whoever she passed looks back.
      this.line('go', L.race.go, 12)
      this.scenery.cheer(0.4)
      this.strike(this.riders[2], 'cheer', 1.2)
    } else if (this.phase === 'race' && place > this.lastPlace && this.phaseT > 3) {
      const by = this.racer(this.order()[place - 2])
      by.crew?.react('tease', 1.4)
    }
    this.lastPlace = place
  }

  /** Boats bounce off each other (with the rainbow, the other one spins). */
  private bumpBoats() {
    const rs = this.racers
    for (let a = 0; a < rs.length; a++)
      for (let b = a + 1; b < rs.length; b++) {
        const A = rs[a]
        const B = rs[b]
        if (Math.hypot(A.d.x - B.d.x, A.d.z - B.d.z) > 9) continue
        for (const pa of A.v.hull.at)
          for (const pb of B.v.hull.at) {
            const ax = A.d.x + Math.sin(A.d.heading) * pa
            const az = A.d.z + Math.cos(A.d.heading) * pa
            const bx = B.d.x + Math.sin(B.d.heading) * pb
            const bz = B.d.z + Math.cos(B.d.heading) * pb
            const min = A.v.hull.r + B.v.hull.r
            const dd = Math.hypot(ax - bx, az - bz)
            if (dd >= min || dd < 1e-4) continue
            const nx = (ax - bx) / dd
            const nz = (az - bz) / dd
            const push = (min - dd) / 2
            A.d.x += nx * push
            A.d.z += nz * push
            B.d.x -= nx * push
            B.d.z -= nz * push
            const hit = A.d.bounce(nx, nz, 0.5) + B.d.bounce(-nx, -nz, 0.5)
            if (hit > 1.5 && A.bumpCool <= 0) {
              A.bumpCool = B.bumpCool = 0.5
              if (A === this.k || B === this.k) this.counts.bumps++
              sfx.boing()
              A.squash = B.squash = 0.3
              A.roll.v += nz * 2
              B.roll.v -= nz * 2
              this.spray.burst((ax + bx) / 2, 0.3, (az + bz) / 2, 10, 2.5, 3, 0.2)
              if (A.star > 0 && B.spin <= 0) this.spinOut(B, 1.2)
              if (B.star > 0 && A.spin <= 0) this.spinOut(A, 1.2)
            }
          }
      }
  }

  /** The buoy ropes keep every boat on the course: a soft boop back in. */
  private ropes(r: Racer) {
    const d = r.d
    for (const at of r.v.hull.at) {
      const px = d.x + Math.sin(d.heading) * at
      const pz = d.z + Math.cos(d.heading) * at
      const loc = locate(px, pz, r.i, 12)
      const lim = HALF - r.v.hull.r
      if (Math.abs(loc.lat) <= lim) continue
      const p = spotAt(loc.s, 0)
      const side = Math.sign(loc.lat)
      // The way back in: across the course, toward the middle.
      const lx = Math.cos(p.heading)
      const lz = -Math.sin(p.heading)
      const depth = Math.abs(loc.lat) - lim
      d.x -= lx * side * depth
      d.z -= lz * side * depth
      const hit = d.bounce(-lx * side, -lz * side, 0.3)
      if (hit > 1.4 && r.bumpCool <= 0) {
        r.bumpCool = 0.4
        if (r === this.k) sfx.boop()
        r.squash = 0.5
        this.spray.burst(px, 0.3, pz, 6, 2, 2.5, 0.18)
      }
    }
  }

  /** Back down off the ramp: a splash, and a burst of speed after a trick. */
  private land(r: Racer, v: number) {
    sfx.splash(clamp(v / 5, 0.5, 1.3))
    r.squash = 0
    r.pitch.v += 1.4
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2
      this.foam.emit(r.d.x + Math.sin(a) * 1.5, 0.03, r.d.z + Math.cos(a) * 1.5, Math.sin(a) * 2.5, 0, Math.cos(a) * 2.5, 2.2, 1.6)
    }
    this.spray.burst(r.d.x, 0.2, r.d.z, 16, 3.5, 4, 0.24)
    if (r.tricked) {
      r.d.vroom(1.2)
      this.sparkle.burst(r.d.x, 1, r.d.z, 20, 3, 3, 0.16)
      if (r === this.k) {
        sfx.zoom()
        this.boostKick = 0.8
        this.line('wheee', L.race.wheee, 14)
      }
    }
    r.trick = -1
  }

  /** The point `back` meters behind a boat's stern. */
  private back(r: Racer, back: number) {
    const d = r.d
    return { x: d.x + Math.sin(d.heading) * (r.v.stern - back), z: d.z + Math.cos(d.heading) * (r.v.stern - back) }
  }

  private splash(r: Racer, along: number, n: number) {
    const d = r.d
    this.spray.burst(d.x + Math.sin(d.heading) * along, 0.25, d.z + Math.cos(d.heading) * along, n, 2.2, 3.5, 0.22)
  }

  /** Where each boat is and how it rolls, pitches, bobs, squashes, spins (a banana) and rolls over (a trick). */
  private poseBoat(r: Racer, dt: number, t: number) {
    const d = r.d
    const v = r.v
    const sp = d.speed / d.feel.top
    const spring = (s: { x: number; v: number }, target: number, k: number, damp: number) => {
      s.v += ((target - s.x) * k - s.v * damp) * dt
      s.x += s.v * dt
    }
    spring(r.roll, 0, 60, 5)
    const bowUp = (d.boostT > 0 ? 0.1 : 0) + 0.014 * Math.max(0, sp) + (d.airborne ? clamp(d.vy * 0.03, -0.12, 0.12) : 0)
    spring(r.pitch, -bowUp, 40, 7)
    r.squash = Math.min(1, r.squash + dt / 0.45)
    const spin = r.spin > 0 ? (1 - r.spin / r.spinFor) * Math.PI * 2 : 0
    if (r.trick >= 0) r.trick = Math.min(1, r.trick + dt / 0.55)
    const roll = r.trick >= 0 ? r.trick * Math.PI * 2 : 0
    v.root.position.set(d.x, swell(d.x, d.z, t) + d.y, d.z)
    v.root.rotation.set(0, d.heading + spin, 0)
    v.body.rotation.set(r.pitch.x + Math.sin(t * 1.3 + d.x) * 0.012, 0, d.roll + r.roll.x * 0.12 + Math.sin(t * 1.1 + d.z) * 0.015 + roll)
    const s = r.squash < 1 ? Math.cos(r.squash * Math.PI * 3) * (1 - r.squash) ** 2 : 0
    v.body.scale.set(1 + 0.08 * s, 1 - 0.16 * s, 1 + 0.04 * s)
    v.animate(clamp(d.yawRate / d.feel.turn, -1, 1), Math.min(1, Math.abs(sp)), t, dt)
    r.aura.update(t, r.star > 0)
  }

  /** The wake, the rooster tail, the rainbow's sparkles. */
  private trail(r: Racer, dt: number) {
    const d = r.d
    const v = r.v
    const speed = Math.abs(d.speed)
    const sx = Math.sin(d.heading)
    const sz = Math.cos(d.heading)
    if (d.airborne || speed < 0.5) return
    while (r.travelled > 0.9) {
      r.travelled -= 0.9
      for (const s of [-1, 1]) {
        const lat = 0.6 * s
        if (r !== this.k && Math.random() < 0.5) continue
        this.foam.emit(d.x + sx * -2.6 + sz * lat, 0.03, d.z + sz * -2.6 - sx * lat, sz * s * speed * 0.12, 0, -sx * s * speed * 0.12, 1.4, 0.55 + speed * 0.03)
      }
    }
    const fast = Math.max(0, speed / v.feel.top - 0.4) + (d.boostT > 0 ? 0.7 : 0)
    let n = fast * (r === this.k ? 80 : 40) * dt
    while (n > 0) {
      if (n < 1 && Math.random() > n) break
      n--
      const px = d.x + sx * v.stern
      const pz = d.z + sz * v.stern
      const q = (Math.random() - 0.5) * 1.2
      this.spray.emit(px, 0.2, pz, -sx * (2.5 + speed * 0.35) + sz * q, 4 + fast * 6 + Math.random() * 2.5, -sz * (2.5 + speed * 0.35) - sx * q, 0.8, 0.22 + Math.random() * 0.16)
    }
    if (r.star > 0 && Math.random() < dt * 60) {
      this.sparkle.emit(d.x + sx * v.stern * 0.6 + (Math.random() - 0.5), 0.4 + Math.random() * 0.8, d.z + sz * v.stern * 0.6 + (Math.random() - 0.5), (Math.random() - 0.5) * 1.5, 1.5, (Math.random() - 0.5) * 1.5, 0.9, 0.22)
    }
  }

  /** The family's life: Kaylee's hands on the tiller (or a cheer), Mommy and Daddy's poses, the wind in their manes. */
  private updateRiders(dt: number, t: number) {
    const lt = this.k.v as Longtail
    const onStage = this.phase === 'podium'
    const wind = clamp(Math.abs(this.k.d.speed) / RACE_FEEL.top, 0, 1)
    for (const r of this.riders) {
      r.char.setWind(onStage ? 0.2 : wind)
      const ahead = spotAt(this.k.s + 20, 0)
      if (!onStage) r.char.lookAt(ahead.x, 1, ahead.z)
      else r.char.lookAway()
      r.char.update(dt, t)
      const rig = r.char.rig
      if (r.pose) {
        r.pose.t += dt
        applyPose(rig, r.pose.kind, r.pose.t, Math.min(1, r.pose.t / 0.25))
        if (r.pose.t > r.pose.until) {
          clearPose(rig)
          r.pose = null
        }
      } else if (r.id === 'kaylee' && !onStage) {
        applyPose(rig, 'tiller', t, 1)
        lt.grip(grip)
        r.char.root.position.x += (grip.x * 0.55 - r.char.root.position.x) * Math.min(1, dt * 10)
      }
    }
  }

  private strike(r: Rider, kind: PoseKind, seconds: number) {
    r.pose = { kind, t: r.pose?.kind === kind ? r.pose.t : 0, until: seconds }
  }

  /** The engine: putt-putt slow, RRRAAAH fast (revving on the grid). */
  private engine(dt: number) {
    const d = this.k.d
    const rev = this.finger && (this.phase === 'count' || this.phase === 'intro') ? 0.9 : 0
    const sp = Math.max(rev, Math.min(1.4, Math.abs(d.speed) / d.feel.top))
    if (sp < 0.04 || this.phase === 'podium') return
    this.engineT += dt
    if (this.engineT > 1 / (3.5 + 11 * sp)) {
      this.engineT = 0
      sfx.engine(Math.min(1, sp + (d.boostT > 0 ? 0.3 : 0)) * 0.8)
    }
  }

  /** Fireworks after the win and over the podium. */
  private celebrate(dt: number) {
    if (this.phase !== 'finish' && this.phase !== 'podium') return
    this.fireworkT -= dt
    if (this.fireworkT > 0) return
    this.fireworkT = this.phase === 'podium' ? 1.1 : 0.55
    const c = this.phase === 'podium' ? this.podium.root.position : this.k.v.root.position
    const x = c.x + (Math.random() - 0.5) * 50
    const z = c.z + (Math.random() - 0.5) * 50
    const y = 24 + Math.random() * 12
    const color = Math.floor(Math.random() * 8)
    for (let i = 0; i < 46; i++) {
      const a = Math.random() * Math.PI * 2
      const b = Math.acos(Math.random() * 2 - 1)
      const s = 7 + Math.random() * 2
      this.fireworks.emit(x, y, z, Math.sin(b) * Math.cos(a) * s, Math.cos(b) * s, Math.sin(b) * Math.sin(a) * s, 1.6 + Math.random() * 0.5, 0.55, (color + (i % 3 === 0 ? 1 : 0)) % 8)
    }
    sfx.bang()
  }

  /** After a while with nothing touched: a finger on the water ahead (at the start, and while racing). */
  private idleHints() {
    const el = this.hintEl
    if (!el) return
    let at: Vector3 | null = null
    const idle = this.time - this.lastTouch
    if ((this.phase === 'count' && !this.finger) || (this.phase === 'race' && idle > 7 && this.k.done < 0)) {
      const p = spotAt(this.k.s + 16, 0)
      at = new Vector3(p.x, 0.3, p.z)
    }
    const s = at ? this.toScreen(at, 1) : null
    el.style.display = s ? '' : 'none'
    if (s) el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`
    if (this.phase === 'race' && idle > 12 && this.time - (this.said.get('hint') ?? -99) > 20 && this.k.done < 0) {
      this.said.set('hint', this.time)
      this.say(L.race.start)
    }
  }

  // ---------------------------------------------------------------- the podium

  /** Everyone up on the podium: she's on 1 with the trophy coming down to her, the kids on 2, the macaque on 3. */
  private toPodium(link: boolean) {
    this.phase = 'podium'
    this.phaseT = 0
    this.section = 'podium'
    if (!link) this.events.onSection('podium')
    this.events.onFlash()
    this.music.stop()
    if (link) for (const r of this.racers) r.done = r.done >= 0 ? r.done : r === this.k ? 0 : r.id === 'kids' ? 1 : 2
    const P = this.podium
    const root = P.root
    root.updateMatrixWorld()
    // The boats tie up in front of the stage.
    this.racers.forEach((r, i) => {
      const dock = P.docks[i]
      const at = root.localToWorld(tmp.set(dock.x, 0, dock.z))
      r.d.place(at.x, at.z, PODIUM.heading - Math.PI / 2)
      r.spin = r.star = 0
      r.trick = -1
      r.aura.update(0, false)
    })
    // Kaylee on top, Mommy and Daddy behind her on the deck, the kids on 2, the macaque on 3.
    const stand = (o: Group, x: number, y: number, z: number, scale = 1) => {
      root.add(o)
      o.position.set(x, y, z)
      o.rotation.set(0, Math.PI / 2, 0)
      o.scale.setScalar(scale)
    }
    const [kaylee, ji, nick] = this.riders
    for (const r of this.riders) {
      r.pose = null
      clearPose(r.char.rig)
    }
    // The winner is the biggest up there (1 > 2 > 3). The family are placed their own way (their life keeps the
    // height and the way they face from it).
    root.add(kaylee.char.root)
    ;(kaylee.char as Avatar).place(P.steps[0].x, P.steps[0].y, P.steps[0].z, 90)
    ;(kaylee.char as Avatar).setPose('stand')
    kaylee.char.root.scale.setScalar(1.5)
    // Mommy and Daddy at the ends of the stage, cheering her on.
    for (const [r, z] of [[ji, 3.9], [nick, -3.9]] as const) {
      root.add(r.char.root)
      ;(r.char as Member).place(0.6, 0.53, z, 90, 'stand')
    }
    const kids = this.racer('kids').crew!
    kids.onStage = true
    kids.roots.forEach((o, i) => stand(o, P.steps[1].x, P.steps[1].y, P.steps[1].z + (i ? -0.5 : 0.5), 1.2))
    const monkey = this.racer('monkey').crew!
    monkey.onStage = true
    stand(monkey.roots[0], P.steps[2].x, P.steps[2].y, P.steps[2].z, 1.2)
    this.trophy.visible = true
    this.trophy.scale.setScalar(1.3)
    this.trophyT = 0
    this.photoAt = this.phaseT + 4
    this.rig.lag = link ? 0.01 : 0.5
    this.rig.setShot(this.shot(), link)
    this.later(() => this.say(L.race.trophy), link ? 300 : 900)
  }

  /** The trophy floats down into her hands, spinning and sparkling; then she holds it up (and lifts it again when
   *  it's tapped). The photo is taken a moment later. */
  private updateTrophy(dt: number, t: number) {
    if (this.phase !== 'podium') return
    const kay = this.riders[0]
    const head = kay.char.root.getWorldPosition(tmp2)
    if (this.trophyT < 1) {
      this.trophyT = Math.min(1, this.trophyT + dt / 1.6)
      const e = 1 - (1 - this.trophyT) ** 3
      this.trophy.position.set(head.x, head.y + 0.98 * kay.char.root.scale.y + (1 - e) * 6, head.z)
      this.trophy.rotation.y = (1 - e) * Math.PI * 6
      if (Math.random() < dt * 30) this.sparkle.emit(this.trophy.position.x, this.trophy.position.y + 0.4, this.trophy.position.z, (Math.random() - 0.5) * 2, 1, (Math.random() - 0.5) * 2, 0.8, 0.14)
      if (this.trophyT >= 1) {
        sfx.chime()
        sounds.correct()
        this.scenery.cheer(1)
        this.strike(kay, 'cheer', Infinity)
        this.sparkle.burst(head.x, head.y + 1.6, head.z, 30, 3.5, 3, 0.18)
        this.later(() => this.say(L.race.proud), 2600)
        this.later(() => this.say(L.race.goodRace), 4600)
      }
    } else {
      // Held up high, bobbing with her cheer.
      const lift = this.trophySpin >= 0 ? Math.sin(Math.min(1, this.trophySpin) * Math.PI) * 0.5 : 0
      if (this.trophySpin >= 0) this.trophySpin = this.trophySpin + dt / 0.8 >= 1 ? -1 : this.trophySpin + dt / 0.8
      this.trophy.position.set(head.x, head.y + 0.98 * kay.char.root.scale.y + Math.abs(Math.sin(t * 9)) * 0.06 + lift, head.z)
      this.trophy.rotation.y = this.podium.root.rotation.y + Math.PI / 2 + (this.trophySpin >= 0 ? this.trophySpin * Math.PI * 2 : Math.sin(t * 1.5) * 0.25)
    }
    // Confetti over the stage.
    if (Math.random() < dt * 40) {
      const c = this.podium.root.position
      this.confetti.emit(c.x + (Math.random() - 0.5) * 12, 11, c.z + (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 1.2, 0, (Math.random() - 0.5) * 1.2, 5, 0.16)
    }
    if (this.photoAt > 0 && this.phaseT > this.photoAt) {
      this.photoAt = -1
      this.shots.push(() => this.takePhoto())
    }
    // Waiting on the podium a while: Sparkle points at the boat home.
    if (this.phaseT > 16 && !this.told.has('back')) {
      this.told.add('back')
      this.say(L.race.back)
    }
  }

  private takePhoto() {
    const P = this.podium.root
    const eye = P.localToWorld(new Vector3(13, 3.2, 0))
    const at = P.localToWorld(new Vector3(0, 2, 0))
    const cam = photoCamera(40, eye.x, eye.y, eye.z, at.x, at.y, at.z)
    this.scene.updateMatrixWorld()
    const src = snapPhoto(this.renderer, this.scene, cam)
    sfx.shutter()
    this.events.onFlash()
    this.events.onPhoto(src)
  }

  // ---------------------------------------------------------------- camera

  /** Up over the grid, the rainbow arch and the grandstand (the start's first look), then down behind her boat. */
  private overview(): Shot {
    const g = spotAt(GRID.kaylee.s + 10, 0)
    return { center: new Vector3(g.x, 2, g.z), half: new Vector3(16, 5, 12), yaw: this.unwrap(g.heading / deg + 180 - 30), pitch: 34, minDist: 16, maxDist: 60 }
  }

  private shot(): Shot {
    const d = this.k.d
    if (this.phase === 'intro' && this.phaseT < 1.6) return this.overview()
    if (this.phase === 'podium') {
      const P = this.podium.root
      const c = P.localToWorld(new Vector3(0.6, 1.9, 0))
      const yaw = P.rotation.y / deg + 90 + Math.sin(this.time * 0.3) * 8
      // (A tall screen frames it narrower: the stage bigger, less sand.)
      const tall = this.h > this.w
      return { center: tall ? P.localToWorld(new Vector3(0.6, 2.3, 0)) : c, half: tall ? new Vector3(3, 2.4, 1.8) : new Vector3(4.4, 2.2, 2.4), yaw: this.unwrap(yaw), pitch: 9, minDist: 6, maxDist: 40 }
    }
    if (this.phase === 'finish' && this.phaseT < 2.6) {
      // Head on as she crosses, from just past the line, a little to the side away from the kids.
      const side = this.k.lat > this.racer('kids').lat ? 1 : -1
      return { center: new Vector3(d.x, 1.4, d.z), half: new Vector3(3.6, 2, 3), yaw: this.unwrap(d.heading / deg + side * 14), pitch: 12, minDist: 7, maxDist: 40 }
    }
    const sp = clamp(Math.abs(d.speed) / d.feel.top, 0, 1.6)
    const tall = clamp((1 - this.w / this.h) / 0.4, 0, 1)
    const zoom = (1 + 0.2 * sp + 0.25 * this.boostKick) * (1 - 0.25 * tall)
    const ahead = 7 * Math.min(1, 0.4 + sp)
    return {
      center: new Vector3(d.x + Math.sin(d.heading) * ahead, 1, d.z + Math.cos(d.heading) * ahead),
      half: new Vector3(5.8 * zoom, 2.2, 6.4 * zoom),
      yaw: this.unwrap(this.camHeading / deg + 180 + 4),
      pitch: 15,
      minDist: 6,
      maxDist: 70,
      follow: true,
    }
  }

  private unwrap(yaw: number) {
    return this.rig.yaw + wrapDeg(yaw - this.rig.yaw)
  }

  /** The chase camera never ends up inside a rock tower: it slides in toward the boat until it's out. */
  private unblockCamera() {
    if (this.phase === 'podium') return
    const cam = this.rig.camera
    const p = cam.position
    const d = this.k.d
    const fwd = cam.getWorldDirection(tmp2)
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
      if (!this.scenery.towers.some(blocked)) return
      p.addScaledVector(fwd, 0.5)
      if (Math.hypot(p.x - d.x, p.z - d.z) < 4) return
    }
  }

  // ---------------------------------------------------------------- the screen

  render() {
    const r = this.renderer
    // A photo first (it draws the scene once from its own camera), then the screen's frame over it.
    this.shots.shift()?.()
    r.render(this.scene, this.rig.camera)
    this.stats.calls = r.info.render.calls
    this.stats.tris = r.info.render.triangles
  }

  private ndc(x: number, y: number) {
    return new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1)
  }
  private waterPoint(x: number, y: number) {
    this.raycaster.setFromCamera(this.ndc(x, y), this.rig.camera)
    const ray = this.raycaster.ray
    const hit = ray.intersectPlane(this.water0, new Vector3())
    const cam = this.rig.camera.position
    if (hit && Math.hypot(hit.x - cam.x, hit.z - cam.z) < 120) return hit
    const dir = tmp.set(ray.direction.x, 0, ray.direction.z)
    if (dir.lengthSq() < 1e-6) return null
    dir.normalize()
    return new Vector3(cam.x + dir.x * 120, 0, cam.z + dir.z * 120)
  }

  private toScreen(at: Vector3, r: number, max = 150) {
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

  /** Where each tap target sits now (null: hidden), and its priority where they overlap. */
  private anchorAt(id: string): { at: Vector3; r: number; prio: number; max?: number } | null {
    const stage = this.phase === 'podium'
    const k = this.k
    if (id === 'boat') {
      if (stage) return null
      const at = k.v.root.getWorldPosition(new Vector3()).setY(0.6)
      at.x += Math.sin(k.d.heading) * 2.2
      at.z += Math.cos(k.d.heading) * 2.2
      return { at, r: 1.5, prio: 1 }
    }
    if (id.startsWith('family:')) {
      const r = this.riders.find((x) => x.id === id.slice(7))!
      const at = r.char.root.getWorldPosition(new Vector3())
      at.y += r.char.height * 0.75
      return { at, r: r.char.height * 0.4, prio: stage ? 3 : 0, max: stage ? 120 : 76 }
    }
    if (id.startsWith('rival:')) {
      const r = this.racer(id.slice(6) as RacerId)
      if (!r.crew) return null
      return { at: r.crew.head(new Vector3()), r: 1.2, prio: 2, max: 110 }
    }
    if (id === 'stand') {
      if (Math.hypot(k.d.x - STAND.x, k.d.z - STAND.z) > 60 && !stage) return null
      return { at: new Vector3(STAND.x, 3, STAND.z), r: 5, prio: 1, max: 160 }
    }
    if (id === 'trophy') return stage && this.trophyT >= 1 ? { at: this.trophy.getWorldPosition(new Vector3()).setY(this.trophy.position.y + 0.4), r: 0.5, prio: 4, max: 120 } : null
    return null
  }

  placeAnchors() {
    for (const [id, el] of this.anchorEls) {
      const a = this.phase === 'intro' && id !== 'boat' ? null : this.anchorAt(id)
      const s = a ? this.toScreen(a.at, a.r, a.max) : null
      if (s && a) {
        el.style.transform = `translate3d(${(s.x - s.size / 2).toFixed(1)}px, ${(s.y - s.size / 2).toFixed(1)}px, 0)`
        el.style.width = el.style.height = `${s.size.toFixed(0)}px`
        el.style.zIndex = String(s.z + a.prio * 3000)
      }
      const want = s ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
    // The minimap's dots.
    for (const r of this.racers) {
      const el = this.mapEls.get(r.id)
      if (!el) continue
      const [mx, my] = mapXY(r.d.x, r.d.z)
      el.setAttribute('cx', mx.toFixed(1))
      el.setAttribute('cy', my.toFixed(1))
    }
  }

  // ---------------------------------------------------------------- talking, the screen's state

  private say(line: Line) {
    this.events.say(line)
  }
  /** A reaction line, at most every `every` seconds. */
  private line(key: string, line: Line, every: number) {
    const last = this.said.get(key) ?? -99
    if (this.time - last < every) return
    this.said.set(key, this.time)
    this.say(line)
  }

  private emitHud() {
    const order = this.order()
    const count = this.phase === 'count' ? 3 - Math.min(3, Math.floor(this.phaseT / BEAT)) : this.phase === 'race' && this.phaseT < 0.9 ? 0 : -1
    const hud: RaceHud = {
      phase: this.phase,
      count,
      lap: clamp(this.k.laps + 1, this.lap0, LAPS),
      place: order.indexOf('kaylee') + 1,
      order,
      coins: this.k.coins,
      item: this.item,
      rolling: this.rolling > 0,
      banner: this.banner,
      trophy: this.phase === 'podium' && this.trophyT >= 1,
    }
    const key = JSON.stringify(hud)
    if (key === this.lastHud) return
    this.lastHud = key
    this.events.onHud(hud)
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const r2 = (v: number) => Math.round(v * 100) / 100
    return {
      section: this.section,
      phase: this.phase,
      lap: clamp(this.k.laps + 1, this.lap0, LAPS),
      place: this.order().indexOf('kaylee') + 1,
      order: this.order(),
      item: this.item,
      coins: this.k.coins,
      finished: this.k.done >= 0,
      trophy: this.phase === 'podium' && this.trophyT >= 1,
      racers: Object.fromEntries(this.racers.map((r) => [r.id, { s: r2(r.s), lat: r2(r.lat), laps: r.laps, progress: r2(r.progress), speed: r2(r.d.speed), spin: r.spin > 0 }])),
      speed: r2(this.k.d.speed),
      airborne: this.k.d.airborne,
      rocket: this.rocket,
      ...this.counts,
    }
  }
  memory() {
    return { ...this.renderer.info.memory }
  }

  /** After `ms`, unless she has left the race by then. */
  private later(fn: () => void, ms: number) {
    this.timers.push(window.setTimeout(fn, ms))
  }

  dispose() {
    for (const t of this.timers) clearTimeout(t)
    this.music.stop()
    this.scene.clear()
    this.bag.dispose()
  }
}

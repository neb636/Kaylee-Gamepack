// Canada's hub: the toy-table map of Canada and the red Maple Leaf Train. Her finger grabs the train and pushes it along
// the track: slowly and it creeps, hard and it whooshes, chuffs, puffs and whistles, and the camera rides along. Let go
// and it rolls on and slows down. Tap a stop and it drives there by itself; tap the land and it drives to the nearest bit
// of track. At a stop the station's lamp lights up and that stop's two activities pop up over it.
//
// How it deepens: (1) push it back and forth in Quebec, whistle and smoke; (2) push it across the country: forests,
// the yellow prairies, the Rockies rising, a loop inside the Spiral Tunnel's mountain, the Pacific; (3) sometimes an
// animal sits on the track (the moose, a bison, a goose family): the train slows by itself and stops, she taps the
// animal and it ambles off. Never a crash.
//
// Maple the beaver (the chibi rig) waits on Quebec City's platform the first time, tells the story, then hops into the
// open car and rides along: she waves at every stop. Her hockey team gathers on Ottawa's frozen canal, one animal per
// stamp. Things to poke: the CN Tower's elevator, Niagara Falls' rainbow, Montmorency Falls, a polar bear on the ice in
// James Bay (Hudson Bay's south end), an orca and a beluga that jump, the ferry on the St. Lawrence, a V of geese, the
// Mountie on his horse who waves his hat, the bison that rolls in the dust, snow off a mountain, a tree, the sea.
// The world says what happened (MapEvents); the hub (activities/hub/Hub.tsx) does the talking. Nothing here comes from
// Thailand.
import { Color, Group, Mesh, Plane, Raycaster, Scene, Vector2, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp, sounds, span } from '../../../../sdk'
import { knobs, watch } from '../../../kit/knobs'
import { noise, sfx, tone } from '../../../kit/sfx'
import type { AnchorInfo } from '../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../engine3d/camera'
import { Bag } from '../../../engine3d/dispose'
import { blobShadow, merge, P, solid } from '../../../engine3d/geo'
import { setOutlineResolution } from '../../../engine3d/outline'
import { Particles } from '../../../engine3d/particles'
import { makeLights, PAL, toon } from '../../../engine3d/toon'
import type { World3D } from '../../../engine3d/View3D'
import { Water } from '../../../engine3d/water'
import { CANADA_LOOKS } from '../characters/looks'
import { Actor } from './actor'
import { proj, regionAt, SPIRAL, STOPS, unproj, type LL, type Region } from './canada'
import { beluga, bison, cnTower, ferry, goose, montmorency, mountie, niagara, orca, type Bison, type Goose, type Mountie } from './critters'
import { buildLand, buildMountains, buildPortals, buildTrees, type Peak } from './land'
import { Smoke } from './smoke'
import { CANAL, stationParts, TRACK_X } from './stations'
import { TEAMMATE } from './team'
import { LAND_TOP, RAIL_Y, Track } from './track'
import { buildTrain, CHIMNEY, turnRods } from './train'

const FILE = 'src/world/places/canada/map/map.ts'
/** How the train feels under her finger (live in the feel lab: ?feel=1 on the map's links). */
const PUSH = knobs('train', 'Push the train', FILE, {
  follow: { value: 5, min: 1, max: 15, step: 0.5, label: 'Follow', unit: '/s', note: 'how eagerly the train catches up with her finger (higher = stuck to it)' },
  top: { value: 4.5, min: 1, max: 10, step: 0.25, label: 'Top speed', unit: 'm/s', note: 'the fastest a push can make it go (the map is about 40 m of track)' },
  accel: { value: 9, min: 1, max: 30, step: 0.5, label: 'Pick-up', unit: 'm/s²', note: 'how quickly it speeds up and slows down under her finger' },
  coast: { value: 0.7, min: 0.1, max: 4, step: 0.05, label: 'Roll on', unit: '/s', note: 'how quickly it slows down after she lets go (lower = rolls further)' },
  whistle: { value: 2.8, min: 0.5, max: 8, step: 0.1, label: 'Whistle speed', unit: 'm/s', note: 'push it faster than this and the whistle blows' },
  cruise: { value: 3.2, min: 0.5, max: 8, step: 0.1, label: 'Drive-there speed', unit: 'm/s', note: 'how fast it goes by itself to a stop or a spot she tapped' },
  grab: { value: 80, min: 30, max: 200, step: 5, label: 'Grab reach', unit: 'px', note: 'how far from the train her finger can land and still grab it' },
})

export interface MapStart {
  /** Where the train is. */
  at: Region
  /** A fresh visit: show the whole country first, then glide down to the train. */
  intro: boolean
  /** Maple waits on Quebec City's platform to tell the story (the first visit); otherwise she's already in the train. */
  story?: boolean
  /** Her hockey team on Ottawa's canal: the activities she has stamps for (map/team.ts). */
  team?: string[]
}
/** Somebody on the track, a poke, or a friend she tapped. */
export type Blocker = 'moose' | 'bison' | 'geese'
export type Poke = 'cn' | 'niagara' | 'montmorency' | 'polar' | 'orca' | 'beluga' | 'ferry' | 'flock' | 'mountie'
export interface MapEvents {
  /** The train rode into another region (for the line at the bottom). */
  where(r: Region): void
  /** The train came to a stop (for the address bar). */
  stopped(r: Region): void
  /** She tapped an activity's bubble at a lit stop, and it's ready. */
  open(activity: string): void
  /** She tapped a bubble that isn't ready (still in the works, or the finale before the team is all there). */
  soon?(activity: string): void
  /** The train pulled in at a stop (its lamp lit up). */
  arrived?(stop: Region): void
  /** The train went into the Spiral Tunnel. */
  tunnel?(): void
  /** The train stopped short of an animal on the track. */
  blocked?(kind: Blocker): void
  /** She tapped something alive or a landmark: `animal:moose`, `animal:moose:off` (once it's off the track),
   *  `poke:orca`, `team:bike`, `maple`. */
  poked?(id: string): void
  /** Nothing touched for a while: what to point at (the train, or the bubbles when it's at a stop). */
  idle?(what: 'train' | 'bubble'): void
  /** Her finger grabbed the train. */
  pushed?(): void
}

export const MAP_ANCHORS: AnchorInfo[] = [
  { id: 'train', label: 'The Maple Leaf Train: push it', kind: 'thing' },
  { id: 'maple', label: 'Maple the beaver', kind: 'thing' },
  ...STOPS.map((s) => ({ id: `stop:${s.id}`, label: `The ${s.id} stop`, kind: 'thing' as const })),
  { id: 'animal:moose', label: 'A moose on the track', kind: 'thing' },
  { id: 'animal:bison', label: 'A bison on the track', kind: 'thing' },
  { id: 'animal:geese', label: 'A goose family on the track', kind: 'thing' },
  { id: 'poke:cn', label: 'The CN Tower in Toronto', kind: 'thing' },
  { id: 'poke:niagara', label: 'Niagara Falls', kind: 'thing' },
  { id: 'poke:montmorency', label: 'Montmorency Falls', kind: 'thing' },
  { id: 'poke:polar', label: 'A polar bear on the ice', kind: 'thing' },
  { id: 'poke:orca', label: 'An orca in the Pacific', kind: 'thing' },
  { id: 'poke:beluga', label: 'A beluga whale in the St. Lawrence', kind: 'thing' },
  { id: 'poke:ferry', label: 'A ferry on the St. Lawrence River', kind: 'thing' },
  { id: 'poke:flock', label: 'Canada geese flying over', kind: 'thing' },
  { id: 'poke:mountie', label: 'A Mountie on his horse', kind: 'thing' },
  // One target over the whole team (they skate close together): the friend nearest her finger answers.
  { id: 'team', label: 'Your hockey team on the frozen canal', kind: 'thing' },
]

/** Where the train waits when a link starts somewhere that isn't a stop. */
const START_AT: Partial<Record<Region, LL>> = { forest: [-86.5, 49.1], prairies: [-104.6, 50.5], rockies: [-121.0, 50.6] }
/** The train: the engine's middle at `s`, two cars behind it (toward the east). */
const CAR_GAP = 0.72
const TRAIN_LEN = CAR_GAP * 2
/** Somebody on the track: the train stops this far before them. */
const STOP_GAP = 0.6
const BRAKE = 4
/** No touch for this long: the train toots ("push me") and the hub may give a hint. */
const INVITE_S = 8
const SKY = '#E3F3FF'
/** Maple's and the moose's heights on the map. */
const MAPLE_H = 0.36
const MOOSE_H = 0.46
/** The polar bear's floe in James Bay: the camera leans north to show it as the train passes below. */
const POLAR_AT: LL = [-80.0, 51.75]

const tmp = new Vector3()
const tmp2 = new Vector3()
const tan = new Vector3()

interface Stop {
  id: Region
  s: number
  acts: string[]
  at: Vector3
  root: Group
  lamp: Mesh
  top: number
  lit: boolean
  ringT: number
}

interface OnTrack {
  kind: Blocker
  s: number
  root: Group
  /** The moose is a friend on the rig; the bison and the geese are code-built. */
  moose?: Actor
  bison?: Bison
  geese?: Goose[]
  /** Where it sits on the track, and where it wanders off to. */
  home: Vector3
  away: Vector3
  yaw: number
  state: 'on' | 'leaving' | 'off' | 'back'
  t: number
  nudge: number
  hopT: number
  /** The bison's roll in the dust (s), -1 when it isn't rolling. */
  rollT: number
  /** The train stopped for it and told the hub (once per time it's on the track). */
  told: boolean
}

interface PokeThing {
  root: Group
  at: Vector3
  r: number
  t: number
}

interface Mate {
  act: string
  actor: Actor
  /** Their spot along the canal (station-local z). */
  home: number
  lane: number
  phase: number
  cheerAt: number
}

export class CanadaMap implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private track = new Track()
  private lights = makeLights(this.scene)
  private water: Water
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private lastTouch = 0
  private touches = 0
  private anchorEls = new Map<string, HTMLElement>()
  private raycaster = new Raycaster()
  private ground = new Plane(new Vector3(0, 1, 0), -RAIL_Y)
  private unwatch: () => void

  // ---- The train: where the engine is along the track (m) and how fast it goes (m/s, + = west).
  private s = 0
  private v = 0
  private mode: 'idle' | 'push' | 'goto' = 'idle'
  private goal = 0
  private grabOffset = 0
  private finger: { x: number; y: number } | null = null
  private fingerGap = 0
  private chuffAt = 0
  private whistleT = 9
  private wheelTurn = 0
  private engine: Group
  private cars: Group[]
  private wheels: Object3D[]
  private rods: Object3D[]
  private seat: Vector3
  private hidden: readonly [number, number]
  private wasInTunnel = false
  private intro: number
  private region: Region
  private resting = true
  private inviteAt = INVITE_S
  private lookNorth = 0

  // ---- Maple: on the platform (the story), hopping in, or riding in the open car.
  private maple: Actor
  private mapleMode: 'platform' | 'boarding' | 'riding'
  private boardT = 0
  private boardFrom = new Vector3()
  private hintKind: 'train' | 'bubble' | null = null

  // ---- What's on the map.
  private stops: Stop[] = []
  private blockers: OnTrack[] = []
  private peaks: Peak[]
  private mountains: Group
  private trees: Group
  private land: Group
  private smoke: Smoke
  private puffs: Particles
  private dust: Particles
  private foam: Particles
  /** The whole country (the first look, before it glides down to the train). */
  private overview: Shot = { center: new Vector3(), half: new Vector3(), yaw: 0, pitch: 62 }
  private pokes = new Map<Poke, PokeThing>()
  private rainbow = new Group()
  private flock: Goose[] = []
  private flockT = 6
  private flockFrom = new Vector3()
  private flockTo = new Vector3()
  private polar: Actor
  private polarWaveAt = 5
  private mountie: Mountie
  private team: Mate[] = []
  private lampOn = toon(PAL.gold)
  private lampOff = toon('#8E87A8')

  constructor(
    private renderer: WebGLRenderer,
    start: MapStart,
    private events: MapEvents,
    /** Activities that are ready for her (their bubbles open them; the rest wiggle). */
    private ready: Set<string>,
  ) {
    this.scene.background = new Color(SKY)
    this.rig.fov = 34
    this.rig.lag = 0.45
    this.water = new Water({ size: 180, deep: '#9FD4F5', shallow: '#B6E2FA', haze: SKY, hazeNear: 22, hazeFar: 70 }, this.bag)
    this.scene.add(this.water.mesh)

    const land = buildLand(this.bag)
    this.land = land.group
    land.box.getCenter(this.overview.center).setY(LAND_TOP)
    land.box.getSize(this.overview.half).multiplyScalar(0.55).setY(0.5)
    this.scene.add(this.land)
    this.scene.add(solid(this.track.geometry(), this.bag, 1.5))
    const mountains = buildMountains(this.bag, this.track)
    this.mountains = mountains.group
    this.peaks = mountains.peaks
    this.scene.add(this.mountains)
    const portals = buildPortals(this.bag, this.track)
    this.hidden = portals.inside
    this.scene.add(portals.group)
    this.buildStops()
    const stopAt = this.stops.map((s) => s.at)
    this.trees = buildTrees(this.bag, this.track, (x, z) => stopAt.some((p) => Math.hypot(x - p.x, z - p.z) < 0.9) || this.peaks.some((p) => Math.hypot(x - p.x, z - p.z) < p.r * 0.9) || this.nearPoke(x, z))
    this.scene.add(this.trees)

    const train = buildTrain(this.bag)
    this.engine = train.engine
    this.cars = train.cars
    this.wheels = train.wheels
    this.rods = train.rods
    this.seat = new Vector3(...train.seat)
    this.scene.add(this.engine, ...this.cars)
    this.maple = new Actor(this.bag, CANADA_LOOKS.maple, MAPLE_H, 'maple')
    this.mapleMode = start.story ? 'platform' : 'riding'
    if (this.mapleMode === 'riding') {
      this.cars[0].add(this.maple.root)
      this.maple.root.position.copy(this.seat)
    } else this.scene.add(this.maple.root)
    this.maple.root.children[0].visible = this.mapleMode !== 'riding'

    this.buildBlockers()
    this.buildPokes()
    this.polar = this.buildPolar()
    this.mountie = this.buildMountie()
    this.buildTeam(start.team ?? [])

    this.smoke = new Smoke(70, this.bag)
    this.puffs = new Particles({ kind: 'spray', count: 60, colors: ['#FFFFFF', '#E4F1EC', '#FBEA9A'], gravity: 3 }, this.bag)
    this.dust = new Particles({ kind: 'spray', count: 40, colors: ['#E8D3A6', '#D9BE8C', '#F3E2BC'], gravity: 1.2 }, this.bag)
    this.foam = new Particles({ kind: 'foam', count: 40, opacity: 0.9 }, this.bag)
    this.scene.add(this.smoke.mesh, this.puffs.mesh, this.dust.mesh, this.foam.mesh)

    // Where the link starts.
    const stop = this.stops.find((s) => s.id === start.at)
    const ll = START_AT[start.at]
    const s0 = stop ? stop.s : ll ? this.sAt(ll) : this.stops[1].s
    this.s = this.track.clampS(Math.max(TRAIN_LEN + 0.05, s0 + CAR_GAP))
    this.region = this.regionNow()
    // Anybody the train would be sitting on (or stuck against) has already wandered off.
    for (const b of this.blockers) if (b.s > this.s - TRAIN_LEN - STOP_GAP - 0.1 && b.s < this.s + STOP_GAP + 0.1) this.wander(b)
    this.intro = start.intro ? 2.4 : 0
    this.placeTrain()
    this.placeMaple(0)

    // The feel lab's graph: how far her finger is ahead of the train, and the train's speed.
    this.unwatch = watch('train', () => ({
      'finger ahead (m)': [this.fingerGap, 4],
      'speed (m/s)': [this.v, PUSH.top],
    }))
  }

  // ---------------------------------------------------------------- the hub's handles

  /** Maple acts something out (the hub calls this as she talks). */
  mapleDoes(a: 'wave' | 'hop' | 'cheer') {
    this.maple.play(a)
  }

  /** Maple hops from the platform into the open car (after the story, or as soon as the train moves). */
  board() {
    if (this.mapleMode !== 'platform') return
    this.mapleMode = 'boarding'
    this.boardT = 0
    this.boardFrom.copy(this.maple.root.position)
    sfx.boing()
  }

  /** A hand points at the train or at the bubbles until her next touch. */
  hint(what: 'train' | 'bubble' | null) {
    this.hintKind = what
  }

  /** Her finger is on the train. */
  get pushing() {
    return this.mode === 'push'
  }

  /** Is the train standing at a stop (and which)? */
  get litStopId(): Region | null {
    return this.stops.find((s) => s.lit)?.id ?? null
  }

  // ---------------------------------------------------------------- building

  private sAt(ll: LL) {
    const [x, z] = proj(ll)
    return this.track.nearest(x, z).s
  }

  /** Something to poke stands here (the trees keep clear). */
  private nearPoke(x: number, z: number) {
    const spots: LL[] = [[-79.5, 43.85], [-79.25, 43.08], [-103.0, 49.6], MONTMORENCY]
    return spots.some((ll) => {
      const [px, pz] = proj(ll)
      return Math.hypot(x - px, z - pz) < 0.45
    })
  }

  private buildStops() {
    for (const st of STOPS) {
      const s = this.sAt(st.at)
      const p = this.track.at(s, new Vector3())
      this.track.tangent(s, tan)
      // The station stands beside the track on its north side (behind the train, as she looks at the map).
      let nx = -tan.z
      let nz = tan.x
      if (nz > 0) {
        nx = -nx
        nz = -nz
      }
      const len = Math.hypot(nx, nz) || 1
      nx /= len
      nz /= len
      const root = new Group()
      root.position.set(p.x + nx * TRACK_X, LAND_TOP, p.z + nz * TRACK_X)
      // Station-local +x points away from the track.
      root.rotation.y = Math.atan2(-nz, nx)
      const look = stationParts(st.id)
      root.add(solid(merge(look.parts), this.bag, 2))
      const lamp = new Mesh(this.bag.add(P.sphere(0.05, '#ffffff', {}, 12)), this.lampOff)
      lamp.position.set(...look.lamp)
      root.add(lamp)
      this.scene.add(root)
      this.stops.push({ id: st.id, s, acts: st.acts, at: root.position, root, lamp, top: look.top, lit: false, ringT: -1 })
    }
  }

  private buildBlockers() {
    const at: Record<Blocker, LL> = { moose: [-82.6, 47.05], bison: [-108.6, 50.6], geese: [-95.8, 49.85] }
    for (const kind of ['moose', 'bison', 'geese'] as const) {
      const s = this.sAt(at[kind])
      const p = this.track.at(s, new Vector3())
      this.track.tangent(s, tan)
      const yaw = Math.atan2(tan.x, tan.z)
      const root = new Group()
      const b: OnTrack = { kind, s, root, home: p.clone().setY(LAND_TOP), away: new Vector3(), yaw: 0, state: 'on', t: 0, nudge: -1, hopT: -1, rollT: -1, told: false }
      if (kind === 'moose') {
        b.moose = new Actor(this.bag, CANADA_LOOKS.moose, MOOSE_H, 'moose')
        root.add(b.moose.root)
      } else if (kind === 'bison') {
        b.bison = bison(this.bag)
        root.add(b.bison.root, blobShadow(0.26, this.bag))
      } else {
        b.geese = [goose(this.bag, 1.1), goose(this.bag, 0.75, true), goose(this.bag, 0.7, true)]
        b.geese[1].root.position.set(0.13, 0, -0.08)
        b.geese[2].root.position.set(-0.12, 0, -0.1)
        root.add(...b.geese.map((g) => g.root), blobShadow(0.3, this.bag))
      }
      root.position.set(p.x, LAND_TOP, p.z)
      // Facing across the track, toward her.
      b.yaw = yaw + (Math.sin(yaw) < 0 ? Math.PI / 2 : -Math.PI / 2)
      if (Math.cos(b.yaw) < 0) b.yaw += Math.PI
      root.rotation.y = b.yaw
      // It wanders off to the south side (toward the camera), off the rails.
      const side = Math.sin(yaw) < 0 ? 1 : -1
      b.away.set(p.x + Math.cos(yaw) * 0.75 * side, LAND_TOP, p.z - Math.sin(yaw) * 0.75 * side)
      this.scene.add(root)
      this.blockers.push(b)
    }
  }

  private buildPokes() {
    const place = (id: Poke, ll: LL, root: Group, r: number, y = LAND_TOP) => {
      const [x, z] = proj(ll)
      root.position.set(x, y, z)
      this.scene.add(root)
      this.pokes.set(id, { root, at: root.position.clone(), r, t: -1 })
    }
    place('cn', [-79.5, 43.85], cnTower(this.bag), 0.35)
    // Niagara Falls, with a rainbow that comes out in the mist.
    const falls = niagara(this.bag)
    const bands = ['#FF8FB8', '#FFC2A8', '#FBEA9A', '#8FE3C8', '#A8DCFF', '#B9A6F5']
    bands.forEach((c, i) => this.rainbow.add(solid(P.torus(0.42 - i * 0.035, 0.018, c, {}, Math.PI), this.bag, 0)))
    this.rainbow.position.set(0, 0.05, 0.3)
    this.rainbow.scale.setScalar(0.001)
    this.rainbow.visible = false
    falls.add(this.rainbow)
    place('niagara', [-79.25, 43.08], falls, 0.3)
    // Montmorency Falls, on the St. Lawrence's north shore just past Quebec City, facing the river.
    const mont = montmorency(this.bag)
    place('montmorency', MONTMORENCY, mont, 0.3)
    mont.rotation.y = 0.5
    // An orca off the Pacific coast and a beluga in the St. Lawrence: they rest at the surface and jump when she taps.
    place('orca', [-126.6, 48.9], orca(this.bag), 0.3, 0.02)
    place('beluga', [-68.9, 48.47], beluga(this.bag), 0.25, 0.02)
    // The ferry, crossing the St. Lawrence from shore to shore.
    place('ferry', [-68.0, 48.94], ferry(this.bag), 0.3, 0.03)
    // Five Canada geese in a V, flying over every now and then.
    const flock = new Group()
    for (let i = 0; i < 5; i++) {
      const k = Math.ceil(i / 2) * (i % 2 ? 1 : -1)
      const g = goose(this.bag, 1.25, false, true)
      g.root.position.set(k * 0.26, 0, -Math.abs(k) * 0.28)
      flock.add(g.root)
      this.flock.push(g)
    }
    flock.visible = false
    place('flock', [-71.6, 47.0], flock, 0.5, 2.2)
  }

  private buildPolar() {
    const bear = new Actor(this.bag, { species: 'polarbear', height: 1, chub: 1.12, fur: '#FFFFFF', light: '#FFF6EE', dark: '#2E2233', ear: '#FFD6E0', open: true }, 0.4)
    const floe = new Group()
    floe.add(solid(merge([P.cyl(0.3, 0.32, 0.06, '#FFFFFF', { scale: [1, 1, 0.75] }, 9), P.cyl(0.16, 0.18, 0.05, '#EAF6FF', { at: [0.17, 0.0, 0.12], scale: [1, 1, 0.8] }, 7)]), this.bag, 2))
    floe.add(bear.root)
    bear.root.position.set(0, 0.03, 0)
    bear.root.rotation.y = 0.3
    const [x, z] = proj(POLAR_AT)
    floe.position.set(x, 0.0, z)
    this.scene.add(floe)
    this.pokes.set('polar', { root: floe, at: floe.position.clone(), r: 0.3, t: -1 })
    return bear
  }

  private buildMountie() {
    const m = mountie(this.bag)
    m.root.add(blobShadow(0.22, this.bag))
    const [x, z] = proj(MOUNTIE_AT)
    m.root.position.set(x, LAND_TOP, z)
    this.scene.add(m.root)
    this.pokes.set('mountie', { root: m.root, at: m.root.position.clone(), r: 0.28, t: -1 })
    return m
  }

  /** Her hockey team on Ottawa's frozen canal: one friend per stamp, skating up and down. */
  private buildTeam(acts: string[]) {
    const ottawa = this.stops.find((s) => s.id === 'ottawa')!
    const mates = acts.filter((a, i) => TEAMMATE[a] && acts.indexOf(a) === i)
    mates.forEach((act, i) => {
      const m = TEAMMATE[act]
      const actor = new Actor(this.bag, m.look, m.height, m.voice)
      ottawa.root.add(actor.root)
      const home = CANAL.z0 + 0.12 + ((i + 0.5) / mates.length) * (CANAL.z1 - CANAL.z0 - 0.24)
      this.team.push({ act, actor, home, lane: (i % 2 ? 1 : -1) * 0.05, phase: i * 0.9, cheerAt: -1 })
    })
  }

  // ---------------------------------------------------------------- World3D

  private shot(): Shot {
    if (this.intro > 0) return this.overview
    // The story: close in on Maple on Quebec City's platform, the train beside her.
    if (this.mapleMode === 'platform') {
      const at = this.maple.root.position
      return { center: new Vector3(at.x, LAND_TOP + 0.25, at.z - 0.1), half: this.tall ? new Vector3(1.0, 0.5, 1.2) : new Vector3(1.5, 0.5, 0.9), yaw: 0, pitch: 42 }
    }
    const mid = this.track.at(this.s - CAR_GAP + clamp(this.v * 0.3, -1.2, 1.2), tmp)
    // Passing below James Bay, the camera leans north so she can see the polar bear on the ice.
    const north = this.lookNorth * (this.tall ? 1.1 : 1.3)
    return {
      center: new Vector3(mid.x, LAND_TOP + 0.25, mid.z - (this.tall ? 0.7 : 0.35) - north),
      half: this.tall ? new Vector3(2.1, 0.6, 2.6) : new Vector3(3.4, 0.6, 2.1),
      yaw: 0,
      pitch: 50,
    }
  }

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.tall = h > w
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
    this.rig.setShot(this.shot(), true)
  }

  setAnchorElements(els: Map<string, HTMLElement>) {
    this.anchorEls = els
  }

  get calm() {
    // The friends breathe and skate all the time, so the frame loop never drops to 30 while they're on screen... but
    // that's fine for a map this size; nothing else here needs 60 when still.
    return this.v === 0 && this.mode !== 'push' && this.intro <= 0 && !this.rig.moving && !this.busy()
  }

  private busy() {
    return (
      this.whistleT < 1.2 ||
      this.mapleMode === 'boarding' ||
      this.maple.busy ||
      this.smoke.busy ||
      this.stops.some((s) => s.ringT >= 0) ||
      this.blockers.some((b) => b.state === 'leaving' || b.state === 'back' || b.hopT >= 0 || b.nudge >= 0 || b.rollT >= 0) ||
      [...this.pokes.values()].some((p) => p.t >= 0)
    )
  }

  update(dt: number) {
    const t = (this.time += dt)
    if (this.intro > 0) {
      this.intro -= dt
      if (this.intro <= 0) this.rig.lag = 0.9
    } else if (this.rig.lag > 0.45 && !this.rig.moving) this.rig.lag = 0.45
    this.moveTrain(dt)
    this.placeTrain()
    this.placeMaple(dt)
    this.updateStops(dt)
    this.updateBlockers(dt, t)
    this.updatePokes(dt, t)
    this.updateTeam(dt, t)
    this.updateInvite(dt)
    this.smoke.update(dt)
    this.puffs.update(dt)
    this.dust.update(dt)
    this.foam.update(dt)
    this.water.update(t)
    const c = this.track.at(this.s - CAR_GAP, tmp)
    const [px] = proj(POLAR_AT)
    const want = this.region === 'forest' || this.region === 'ottawa' ? clamp(1 - Math.abs(c.x - px) / 4.5, 0, 1) : 0
    this.lookNorth += (smoothstep(want) - this.lookNorth) * (1 - Math.exp(-1.5 * dt))
    this.lights.follow(c.x, c.y, c.z)
    this.rig.setShot(this.shot())
    this.rig.update(dt)
  }

  // ---------------------------------------------------------------- the train

  private moveTrain(dt: number) {
    let want: number | null = null
    if (this.mode === 'push' && this.finger) {
      const hit = this.groundAt(this.finger.x, this.finger.y)
      if (hit) {
        const target = this.track.nearest(hit.x, hit.z, this.s - this.grabOffset, 2.5).s + this.grabOffset
        this.fingerGap = target - this.s
        want = clamp(this.fingerGap * PUSH.follow, -PUSH.top, PUSH.top)
      }
    } else if (this.mode === 'goto') {
      const d = this.goal - this.s
      if (Math.abs(d) < 0.03 && Math.abs(this.v) < 0.3) {
        this.mode = 'idle'
        this.v = 0
      } else want = Math.sign(d) * Math.min(PUSH.cruise, Math.abs(d) * 2.2 + 0.15)
    }
    if (want !== null) this.v += clamp(want - this.v, -PUSH.accel * dt, PUSH.accel * dt)
    else {
      this.v *= Math.exp(-PUSH.coast * dt)
      if (Math.abs(this.v) < 0.03) this.v = 0
    }
    // Somebody on the track: slow down by itself and stop short of them.
    const lo = TRAIN_LEN + 0.05
    let min = lo
    let max = this.track.length
    for (const b of this.blockers) {
      if (b.state === 'off' || b.state === 'leaving') continue
      if (b.s > this.s) max = Math.min(max, b.s - STOP_GAP)
      else if (b.s < this.s - TRAIN_LEN) min = Math.max(min, b.s + STOP_GAP + TRAIN_LEN)
    }
    if (this.v > 0) this.v = Math.min(this.v, Math.sqrt(2 * BRAKE * Math.max(0, max - this.s)))
    if (this.v < 0) this.v = Math.max(this.v, -Math.sqrt(2 * BRAKE * Math.max(0, this.s - min)))
    const before = this.s
    this.s += this.v * dt
    // The ends of the line: a soft bump.
    if (this.s <= lo || this.s >= this.track.length) {
      if (Math.abs(this.v) > 1) sfx.thump()
      this.s = clamp(this.s, lo, this.track.length)
      this.v = -this.v * 0.15
    }
    this.s = clamp(this.s, Math.min(min, before), Math.max(max, before))
    // Pressed up against an animal: it gets a nudge (and a snort). Stopped next to one: the hub hears about it once.
    for (const b of this.blockers) {
      if (b.state !== 'on') continue
      const gap = b.s > this.s ? b.s - STOP_GAP - this.s : this.s - TRAIN_LEN - STOP_GAP - b.s
      if (gap < 0.12 && !b.told && Math.abs(this.v) < 0.2) {
        b.told = true
        this.events.blocked?.(b.kind)
      }
      if (b.nudge >= 0) continue
      const pushing = this.mode === 'push' ? Math.sign(this.fingerGap) === Math.sign(b.s - this.s) && Math.abs(this.fingerGap) > 0.2 : this.mode === 'goto'
      if (gap < 0.03 && pushing) {
        b.nudge = 0
        snort(b.kind)
      }
    }
    const moved = this.s - before
    this.wheelTurn += moved
    // Chuff-chuff, quicker the faster it goes; puffs of smoke; the whistle when she pushes it fast.
    const speed = Math.abs(this.v)
    this.chuffAt += Math.abs(moved)
    if (this.chuffAt > 0.32 && speed > 0.15) {
      this.chuffAt = 0
      noise(0.08, Math.min(0.09, 0.025 + speed * 0.012), 'bandpass', 520, 260, 0, 1.6)
      this.puff(0.16 + Math.min(0.12, speed * 0.03), 1)
    }
    this.whistleT += dt
    if (speed > PUSH.whistle && this.whistleT > 2.5 && this.mode === 'push') this.whistle()
    if (this.mode !== 'push') this.fingerGap = 0
    // Maple hops in as soon as the train moves.
    if (speed > 0.05 && this.mapleMode === 'platform') this.board()
    // Into the Spiral Tunnel.
    const inside = this.inTunnel(this.s - CAR_GAP)
    if (inside && !this.wasInTunnel) this.events.tunnel?.()
    this.wasInTunnel = inside
    // Where it is now (the line at the bottom), and where it stopped (the address bar).
    const r = this.regionNow()
    if (r !== this.region) {
      this.region = r
      this.events.where(r)
    }
    const resting = this.v === 0 && this.mode !== 'push'
    if (resting && !this.resting) this.events.stopped(this.litStop()?.id ?? r)
    this.resting = resting
  }

  private regionNow(): Region {
    const p = this.track.at(this.s - CAR_GAP, tmp)
    return regionAt(unproj(p.x, p.z))
  }

  /** Inside the Spiral Tunnel's mountain (hidden). */
  private inTunnel(s: number) {
    return s > this.hidden[0] + 0.1 && s < this.hidden[1] - 0.1
  }

  private placeTrain() {
    const parts = [this.engine, ...this.cars]
    parts.forEach((g, i) => {
      const s = this.s - i * CAR_GAP
      this.track.at(s, g.position)
      g.position.y = LAND_TOP + 0.05
      this.track.tangent(s, tan)
      g.rotation.y = Math.atan2(tan.x, tan.z)
      // A little rock at speed.
      g.rotation.z = Math.sin(this.time * 9 + i) * Math.min(0.03, Math.abs(this.v) * 0.008)
      // The whole train hides inside the tunnel (the mountain is hollow only in our heads).
      g.visible = !this.inTunnel(s)
    })
    for (const w of this.wheels) w.rotation.x = this.wheelTurn / (w.userData.r ?? 0.065)
    turnRods(this.rods, this.wheelTurn / 0.085)
  }

  /** Maple: on the platform, hopping into the car in an arc, or sitting in it. */
  private placeMaple(dt: number) {
    const m = this.maple
    if (this.mapleMode === 'platform') {
      // Beside the open car, on the side nearer her, turned to face her.
      const car = this.cars[0]
      const a = car.localToWorld(tmp.set(0.36, 0, 0)).clone()
      const b = car.localToWorld(tmp.set(-0.36, 0, 0))
      m.root.position.copy(a.z > b.z ? a : b).setY(LAND_TOP)
      m.root.rotation.y = 0
      m.update(dt, this.time, { look: 0, up: 0.25 })
      return
    }
    if (this.mapleMode === 'boarding') {
      this.boardT += dt
      const p = Math.min(1, this.boardT / 0.7)
      const to = this.cars[0].localToWorld(tmp.copy(this.seat))
      m.root.position.lerpVectors(this.boardFrom, to, smoothstep(p))
      m.root.position.y += Math.sin(p * Math.PI) * 0.35
      m.update(dt, this.time, { lift: 0, sit: p > 0.85 })
      if (p >= 1) {
        this.mapleMode = 'riding'
        this.cars[0].add(m.root)
        m.root.position.copy(this.seat)
        m.root.rotation.set(0, 0, 0)
        m.root.children[0].visible = false
        sfx.thump()
      }
      return
    }
    // Riding: she faces the way they're going, and turns to look at her when the train stands still.
    const still = Math.abs(this.v) < 0.05
    m.root.rotation.y += ((still ? this.towardCamera(this.cars[0]) : 0) - m.root.rotation.y) * (1 - Math.exp(-4 * dt))
    m.update(dt, this.time, { sit: true, up: still ? 0.35 : 0.1, look: still ? 0 : Math.sin(this.time * 0.7) * 0.3 })
  }

  /** The turn (in the car's frame) that faces the camera. */
  private towardCamera(car: Group) {
    const world = Math.atan2(this.rig.camera.position.x - car.position.x, this.rig.camera.position.z - car.position.z)
    let a = world - car.rotation.y
    while (a > Math.PI) a -= Math.PI * 2
    while (a < -Math.PI) a += Math.PI * 2
    return clamp(a, -1.4, 1.4)
  }

  /** The chimney's spot (or the mountain's top while the train is in the tunnel). */
  private chimney(out: Vector3) {
    if (this.inTunnel(this.s)) {
      const [x, z] = proj(SPIRAL)
      return out.set(x, LAND_TOP + 2.0, z)
    }
    return this.engine.localToWorld(out.set(...CHIMNEY))
  }

  private puff(size: number, n: number) {
    const c = this.chimney(tmp2)
    // The smoke drifts back behind the train as it goes.
    this.track.tangent(this.s, tan)
    const back = -Math.sign(this.v || 1) * Math.min(1.2, Math.abs(this.v) * 0.35)
    for (let i = 0; i < n; i++) this.smoke.emit(c.x, c.y, c.z, tan.x * back + (Math.random() - 0.5) * 0.12, 0.5 + Math.random() * 0.25, tan.z * back + (Math.random() - 0.5) * 0.12, 1.6 + Math.random() * 0.6, size * (0.8 + Math.random() * 0.5))
  }

  private whistle() {
    this.whistleT = 0
    const echo = this.inTunnel(this.s) ? 0.4 : 1
    tone(740, 760, 0.42, 0.09 * echo, 'triangle')
    tone(932, 950, 0.42, 0.06 * echo, 'triangle')
    tone(740, 760, 0.55, 0.09 * echo, 'triangle', 0.5)
    tone(932, 950, 0.55, 0.06 * echo, 'triangle', 0.5)
    this.puff(0.3, 5)
  }

  // ---------------------------------------------------------------- the stops

  private litStop(): Stop | undefined {
    let best: Stop | undefined
    let bd = Infinity
    for (const st of this.stops) {
      const d = Math.min(...[0, 1, 2].map((i) => Math.abs(this.s - i * CAR_GAP - st.s)))
      if (d < bd) {
        bd = d
        best = st
      }
    }
    return bd < 0.75 ? best : undefined
  }

  private updateStops(dt: number) {
    const near = Math.abs(this.v) < 0.5 && this.mode !== 'push' && this.intro <= 0 ? this.litStop() : undefined
    for (const st of this.stops) {
      const lit = st === near
      if (lit && !st.lit) {
        st.ringT = 0
        tone(1320, 1320, 0.7, 0.07)
        tone(1760, 1760, 0.6, 0.04, 'sine', 0.08)
        if (this.mapleMode === 'riding') this.maple.play('wave')
        if (st.id === 'ottawa') this.team.forEach((m, i) => (m.cheerAt = this.time + 0.2 + i * 0.18))
        this.events.arrived?.(st.id)
      }
      st.lit = lit
      st.lamp.material = lit ? this.lampOn : this.lampOff
      if (st.ringT >= 0) {
        st.ringT += dt
        st.lamp.scale.setScalar(1 + 0.6 * bell(Math.min(1, st.ringT / 0.5)))
        if (st.ringT > 0.5) st.ringT = -1
      }
    }
  }

  // ---------------------------------------------------------------- her hockey team

  private updateTeam(dt: number, t: number) {
    for (const m of this.team) {
      if (m.cheerAt >= 0 && t >= m.cheerAt) {
        m.cheerAt = -1
        m.actor.play('cheer')
      }
      // Each glides back and forth around their own spot on the canal, mostly facing her, leaning into the turns.
      const k = t * 1.1 + m.phase * 3
      const z = m.home + Math.sin(k) * 0.07
      m.actor.root.position.set(CANAL.x + m.lane + Math.sin(k * 0.5) * 0.03, 0.026, z)
      m.actor.root.rotation.y = -Math.PI / 2 + Math.cos(k) * 0.55
      m.actor.update(dt, t, { skate: true, up: 0.3 })
    }
  }

  // ---------------------------------------------------------------- animals on the track

  private updateBlockers(dt: number, t: number) {
    for (const b of this.blockers) {
      let y = 0
      let sq = 0
      let walking = false
      if (b.state === 'leaving' || b.state === 'back') {
        b.t += dt
        const p = Math.min(1, b.t / 1.6)
        const from = b.state === 'leaving' ? b.home : b.away
        const to = b.state === 'leaving' ? b.away : b.home
        b.root.position.lerpVectors(from, to, smoothstep(p))
        b.root.rotation.y = Math.atan2(to.x - from.x, to.z - from.z)
        walking = true
        if (!b.moose) y = Math.abs(Math.sin(b.t * 10)) * 0.025
        if (p >= 1) {
          b.state = b.state === 'leaving' ? 'off' : 'on'
          b.t = 0
          b.told = false
          b.root.rotation.y = b.yaw
          // Off the track, the bison has a good roll in the dust.
          if (b.state === 'off' && b.bison) this.roll(b)
        }
      } else if (b.state === 'off') {
        // Back on the track after a while, once the train is far away (so she meets them again on another trip).
        b.t += dt
        if (b.t > 40 && Math.abs(b.s - (this.s - CAR_GAP)) > 7) {
          b.state = 'back'
          b.t = 0
        }
      }
      if (b.nudge >= 0) {
        b.nudge += dt
        sq = 0.15 * bell(Math.min(1, b.nudge / 0.45))
        if (b.nudge > 2.5) b.nudge = -1
      }
      if (b.hopT >= 0) {
        b.hopT += dt
        const p = b.hopT / 0.6
        if (p >= 1) b.hopT = -1
        else y += bell(span(p, 0.15, 0.8)) * 0.1
      }
      if (b.moose) {
        // The moose looks at the train when it's close, and chews.
        b.moose.update(dt, t, { walk: walking, look: b.state === 'on' ? Math.sin(t * 0.6) * 0.3 : 0 })
        b.moose.rig.body.scale.x *= 1 + sq
        b.moose.rig.mouth.scale.y = 1 + 0.25 * Math.abs(Math.sin(t * 5))
      } else if (b.bison) {
        const body = b.bison.body
        let roll = 0
        if (b.rollT >= 0) {
          b.rollT += dt
          const p = b.rollT / 2.2
          // Down onto its side, over onto its back with its legs kicking, back, and up again with a shake.
          roll = bell(span(p, 0.05, 0.85)) * 2.2 + Math.sin(p * 30) * 0.12 * bell(span(p, 0.25, 0.7))
          if (Math.random() < dt * 14 && p < 0.85) this.dust.emit(b.root.position.x + (Math.random() - 0.5) * 0.3, LAND_TOP + 0.04, b.root.position.z + (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.4, 0.4 + Math.random() * 0.3, (Math.random() - 0.5) * 0.4, 0.9, 0.12)
          if (p >= 1) b.rollT = -1
        }
        // It rolls about its middle (not its feet), so it tips onto its side and back without sinking into the ground.
        const c = 0.17
        body.rotation.z = roll
        body.position.set(c * Math.sin(roll), y + c * (1 - Math.cos(roll)) - 0.06 * Math.sin(Math.min(roll, Math.PI)), 0)
        body.scale.set(1 + sq, 1 - sq + 0.02 * Math.sin(t * 2.4), 1 + sq)
        // Grazing: the head goes down to the grass now and then.
        b.bison.head.rotation.x = walking ? Math.sin(t * 9) * 0.1 : 0.35 * Math.max(0, Math.sin(t * 0.8)) + sq
      } else if (b.geese) {
        b.geese.forEach((g, i) => {
          const tt = t + i * 1.3
          g.body.position.y = y * (i ? 0.8 : 1)
          g.body.rotation.z = walking ? Math.sin(tt * 14) * 0.18 : 0
          g.body.scale.set(1 + sq, 1 - sq, 1 + sq)
          // Pecking at the ground, and a little flap now and then.
          g.head.rotation.x = walking ? 0 : Math.max(0, Math.sin(tt * 1.7)) ** 6 * 1.1
          const flap = b.hopT >= 0 || walking ? Math.sin(tt * 22) * 0.6 : Math.max(0, Math.sin(tt * 0.9)) ** 12 * 0.8
          g.wingR.rotation.z = flap
          g.wingL.rotation.z = -flap
        })
      }
    }
  }

  private roll(b: OnTrack) {
    if (b.rollT >= 0) return
    b.rollT = 0
    noise(0.6, 0.06, 'lowpass', 600, 200, 0.2, 0.8)
  }

  /** Already off the track (no walk). */
  private wander(b: OnTrack) {
    b.state = 'off'
    b.t = 0
    b.root.position.copy(b.away)
    b.root.rotation.y = b.yaw
  }

  // ---------------------------------------------------------------- pokes

  private updatePokes(dt: number, t: number) {
    for (const [id, p] of this.pokes) {
      if (p.t >= 0) p.t += dt
      const k = p.t
      if (id === 'cn') {
        const lift = p.root.getObjectByName('lift')!
        lift.position.y = k >= 0 ? 0.1 + 0.95 * bell(Math.min(1, k / 2.4)) : 0.1
        const light = p.root.getObjectByName('light')!
        light.scale.setScalar(Math.sin(t * 3) > 0.6 ? 1.3 : 0.9)
        if (k > 2.4) p.t = -1
      } else if (id === 'niagara') {
        const show = k >= 0 && k < 5
        this.rainbow.visible = k >= 0
        this.rainbow.scale.setScalar(show ? Math.min(1, k * 2) : Math.max(0.001, 1 - (k - 5) * 2))
        if (Math.random() < dt * (k >= 0 ? 10 : 1.5)) this.puffs.emit(p.at.x + (Math.random() - 0.5) * 0.3, LAND_TOP + 0.05, p.at.z + 0.15, 0, 0.5, 0.1, 0.8, 0.06, 0)
        if (k > 5.5) p.t = -1
      } else if (id === 'montmorency') {
        // Mist at the bottom all the time; a tap makes a big splashy whoosh.
        if (Math.random() < dt * (k >= 0 ? 14 : 1.5)) {
          const fwd = new Vector3(Math.sin(p.root.rotation.y), 0, Math.cos(p.root.rotation.y))
          this.puffs.emit(p.at.x + fwd.x * 0.12 + (Math.random() - 0.5) * 0.1, LAND_TOP + 0.03, p.at.z + fwd.z * 0.12, fwd.x * 0.2, 0.6 + (k >= 0 ? 0.4 : 0), fwd.z * 0.2, 0.7, k >= 0 ? 0.09 : 0.05, 0)
        }
        if (k > 2) p.t = -1
      } else if (id === 'polar') {
        // On her floe: rocks on the water, looks about, and waves now and then (a tap: a wave and a hop).
        p.root.position.y = Math.sin(t * 1.4) * 0.012
        p.root.rotation.z = Math.sin(t * 1.1) * 0.03
        if (t > this.polarWaveAt) {
          this.polarWaveAt = t + 7 + Math.random() * 5
          this.polar.play('wave')
        }
        this.polar.update(dt, t, { look: Math.sin(t * 0.4) * 0.5, up: 0.25 })
        if (k > 1.6) p.t = -1
      } else if (id === 'orca' || id === 'beluga') {
        const j = k >= 0 ? Math.min(1, k / (id === 'orca' ? 1.3 : 1.1)) : 0
        const high = id === 'orca' ? 0.7 : 0.45
        p.root.position.y = 0.02 + Math.sin(t * 1.5 + (id === 'orca' ? 0 : 2)) * 0.02 + bell(j) * high
        p.root.rotation.x = k >= 0 ? -1.1 + 2.2 * j : 0
        p.root.rotation.y = id === 'beluga' ? 1.2 + Math.sin(t * 0.3) * 0.4 : 0
        if (k >= 0 && j >= 1) {
          sfx.splash()
          for (let i = 0; i < 6; i++) this.foam.emit(p.root.position.x, 0.03, p.root.position.z, (Math.random() - 0.5) * 1.2, 0, (Math.random() - 0.5) * 1.2, 1, 0.25)
          p.t = -1
        }
      } else if (id === 'ferry') {
        // Back and forth across the river, slowly; a toot sends it on its way faster.
        const fast = k >= 0 ? 3 : 1
        p.root.userData.x = (p.root.userData.x ?? 0) + dt * 0.05 * fast
        const swing = Math.sin(p.root.userData.x)
        const [x, z] = proj([-68.0 + swing * 0.15, 48.94 + swing * 0.12])
        p.root.position.set(x, 0.03 + Math.sin(t * 2) * 0.01, z)
        p.root.rotation.y = Math.cos(p.root.userData.x) > 0 ? 0.6 : 0.6 + Math.PI
        p.root.rotation.z = Math.sin(t * 1.7) * 0.04
        if (k > 3) p.t = -1
      } else if (id === 'flock') this.updateFlock(dt, t, p)
      else if (id === 'mountie') this.updateMountie(dt, t, p)
    }
  }

  /** The Mountie rides his horse up and down by the track; a tap: the horse stops and rears a little, and he lifts his
   *  hat and waves it. */
  private updateMountie(dt: number, t: number, p: PokeThing) {
    const m = this.mountie
    const stopped = p.t >= 0
    m.root.userData.k = (m.root.userData.k ?? 0) + dt * (stopped ? 0 : 0.35)
    const k = m.root.userData.k as number
    const x = Math.sin(k) * 0.35
    m.root.position.set(p.at.x + x, LAND_TOP, p.at.z)
    m.root.rotation.y = Math.cos(k) >= 0 ? Math.PI / 2 : -Math.PI / 2
    // A trot: bob and nod; standing, a little rear back.
    const trot = stopped ? 0 : 1
    const rear = stopped ? bell(Math.min(1, p.t / 0.9)) : 0
    m.horse.position.y = trot * Math.abs(Math.sin(t * 8)) * 0.025 + rear * 0.03
    m.horse.rotation.x = -rear * 0.35
    m.head.rotation.x = trot * Math.sin(t * 8) * 0.12 - rear * 0.3
    // The wave: his arm comes up with the hat, waves it, puts it back.
    const w = stopped ? bell(Math.min(1, p.t / 2.2)) : 0
    const a = w * 2.6
    m.arm.rotation.z = a + (w > 0.8 ? Math.sin(p.t * 14) * 0.35 : 0)
    const L = 0.085
    const tipX = m.arm.position.x + Math.sin(m.arm.rotation.z) * L
    const tipY = m.arm.position.y - Math.cos(m.arm.rotation.z) * L
    const held = smoothstep(clamp((w - 0.35) / 0.4, 0, 1))
    m.hat.position.set(m.hatOn[0] + (tipX - m.hatOn[0]) * held, m.hatOn[1] + (tipY + 0.03 - m.hatOn[1]) * held, m.hatOn[2])
    m.hat.rotation.z = held * (0.4 + Math.sin(p.t * 14) * 0.4)
    if (p.t > 2.4) p.t = -1
  }

  /** The geese fly across the view now and then, flapping and honking. */
  private updateFlock(dt: number, t: number, p: PokeThing) {
    const f = p.root
    if (!f.visible) {
      this.flockT -= dt
      if (this.flockT > 0 || this.intro > 0) return
      const c = this.track.at(this.s - CAR_GAP, tmp)
      const dir = Math.random() < 0.5 ? 1 : -1
      this.flockFrom.set(c.x + 7 * dir, LAND_TOP + 2.0, c.z - 1.5)
      this.flockTo.set(c.x - 7 * dir, LAND_TOP + 2.0, c.z - 0.5)
      f.userData.k = 0
      f.visible = true
      f.rotation.y = Math.atan2(this.flockTo.x - this.flockFrom.x, this.flockTo.z - this.flockFrom.z)
    }
    const quick = p.t >= 0 && p.t < 2 ? 2.2 : 1
    f.userData.k += (dt / 9) * quick
    f.position.lerpVectors(this.flockFrom, this.flockTo, f.userData.k)
    f.position.y += Math.sin(t * 1.3) * 0.08
    this.flock.forEach((g, i) => {
      const flap = Math.sin(t * (quick > 1 ? 16 : 8) + i * 0.7) * 0.55
      g.wingR.rotation.z = flap
      g.wingL.rotation.z = -flap
      g.body.position.y = -flap * 0.03
    })
    if (f.userData.k >= 1) {
      f.visible = false
      this.flockT = 18 + Math.random() * 10
      p.t = -1
    }
  }

  private poke(id: Poke) {
    const p = this.pokes.get(id)!
    this.events.poked?.(`poke:${id}`)
    if (id === 'flock') {
      honk()
      p.t = 0
      return
    }
    if (id === 'polar') {
      this.polar.play('wave')
      this.polar.play('hop')
      sfx.boing()
      p.t = 0
      return
    }
    if (p.t >= 0) return
    p.t = 0
    if (id === 'cn') tone(330, 990, 1.1, 0.06, 'triangle')
    else if (id === 'niagara') sounds.sparkle()
    else if (id === 'montmorency') {
      sfx.splash()
      noise(0.9, 0.06, 'highpass', 1400, 900, 0, 0.6)
    } else if (id === 'orca') tone(900, 1500, 0.25, 0.05, 'sine')
    else if (id === 'beluga') {
      // A beluga's sing-song trill.
      tone(1200, 1700, 0.18, 0.04, 'sine')
      tone(1700, 1100, 0.2, 0.04, 'sine', 0.2)
      tone(1300, 1900, 0.22, 0.035, 'sine', 0.42)
    } else if (id === 'ferry') {
      tone(220, 220, 0.6, 0.12, 'sawtooth')
      tone(277, 277, 0.6, 0.06, 'triangle')
    } else if (id === 'mountie') {
      // A whinny, and the clip-clop stops.
      tone(900, 1300, 0.12, 0.04, 'sawtooth')
      tone(1300, 700, 0.5, 0.04, 'sawtooth', 0.12)
    }
  }

  // ---------------------------------------------------------------- the nudge when nobody plays

  private updateInvite(dt: number) {
    if (this.intro > 0 || this.mode === 'push' || this.v !== 0 || this.mapleMode !== 'riding') {
      this.inviteAt = INVITE_S
      return
    }
    this.inviteAt -= dt
    if (this.inviteAt <= 0) {
      this.inviteAt = INVITE_S * 1.5
      const lit = this.stops.find((s) => s.lit)
      if (!lit) {
        // A little toot and a puff: "push me".
        tone(740, 760, 0.25, 0.05, 'triangle')
        this.puff(0.22, 2)
      }
      this.events.idle?.(lit ? 'bubble' : 'train')
    }
  }

  render() {
    this.renderer.render(this.scene, this.rig.camera)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  // ---------------------------------------------------------------- her finger

  private ray(x: number, y: number) {
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    return this.raycaster
  }

  /** Where her finger points on the rails' level. */
  private groundAt(x: number, y: number) {
    return this.ray(x, y).ray.intersectPlane(this.ground, new Vector3())
  }

  private toScreen(v: Vector3) {
    const p = tmp2.copy(v).project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }

  /** How many screen pixels a meter is at this spot. */
  private pxPerM(at: Vector3) {
    const a = this.toScreen(at)
    const b = this.toScreen(tmp.copy(at).add(new Vector3(1, 0, 0)))
    return Math.hypot(b.x - a.x, b.y - a.y)
  }

  /** Is her finger on (or near) the train? */
  private nearTrain(x: number, y: number) {
    if (this.inTunnel(this.s - CAR_GAP)) return false
    return [this.engine, ...this.cars].some((g) => {
      const p = this.toScreen(g.getWorldPosition(tmp))
      return Math.hypot(p.x - x, p.y - y) < PUSH.grab
    })
  }

  pointerDown(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.inviteAt = INVITE_S
    this.hintKind = null
    if (this.intro > 0) this.intro = 0
    if (id === 'train' || (!id && this.nearTrain(x, y))) {
      const hit = this.groundAt(x, y)
      // Where along the train she grabbed it (the engine or a car), so that spot stays under her finger.
      this.grabOffset = hit ? this.s - this.track.nearest(hit.x, hit.z, this.s - CAR_GAP, 1.6).s : CAR_GAP
      this.finger = { x, y }
      this.mode = 'push'
      sounds.pickup()
      this.events.pushed?.()
    }
  }

  pointerMove(x: number, y: number, _dx: number, _dy: number, held: boolean) {
    if (held && this.mode === 'push') this.finger = { x, y }
  }

  pointerUp() {
    if (this.mode === 'push') {
      this.mode = 'idle'
      this.finger = null
    }
  }

  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.touches++
    this.hintKind = null
    if (this.intro > 0) this.intro = 0
    if (this.mode === 'push') this.pointerUp()
    if (id?.startsWith('go:')) return this.tapBubble(id.slice(3))
    if (id === 'maple') {
      this.maple.play('hop')
      sfx.boing()
      this.events.poked?.('maple')
      return
    }
    if (id === 'train' || (!id && this.nearTrain(x, y))) return this.whistle()
    if (id?.startsWith('stop:')) {
      const st = this.stops.find((s) => s.id === id.slice(5))!
      if (st.lit) {
        st.ringT = 0
        sounds.sparkle()
      } else this.driveTo(st.s + CAR_GAP)
      return
    }
    if (id === 'team') {
      let m: Mate | undefined
      let best = Infinity
      for (const k of this.team) {
        const p = this.toScreen(k.actor.center(tmp))
        const d = Math.hypot(p.x - x, p.y - y)
        if (d < best) {
          best = d
          m = k
        }
      }
      if (m) {
        m.actor.play('hop')
        sfx.boing()
        if (m.act === 'canoe') loonCall()
        this.events.poked?.(`team:${m.act}`)
      }
      return
    }
    if (id?.startsWith('animal:')) {
      const b = this.blockers.find((k) => k.kind === id.slice(7))!
      if (b.state === 'on') {
        b.state = 'leaving'
        b.t = 0
        snort(b.kind)
        b.moose?.play('wave')
        this.events.poked?.(id)
      } else {
        b.hopT = 0
        if (b.bison) this.roll(b)
        else if (b.moose) b.moose.play('hop')
        if (b.geese) honk()
        else sfx.boing()
        this.events.poked?.(`${id}:off`)
      }
      return
    }
    if (id?.startsWith('poke:')) return this.poke(id.slice(5) as Poke)
    // Anything else: whatever her finger lands on reacts.
    const ray = this.ray(x, y)
    const hit = ray.intersectObjects([this.mountains, this.trees, this.land, this.water.mesh], true)[0]
    if (!hit) return sfx.fwip()
    const at = hit.point
    if (hit.object.parent === this.mountains || hit.object === this.mountains) {
      sfx.fwip()
      for (let i = 0; i < 8; i++) this.puffs.emit(at.x, at.y + 0.05, at.z, (Math.random() - 0.5) * 0.8, 0.6 + Math.random() * 0.6, (Math.random() - 0.5) * 0.8, 0.9, 0.09, 0)
      return
    }
    if (hit.object.parent === this.trees) {
      noise(0.25, 0.08, 'highpass', 2500, 1800, 0, 0.7)
      for (let i = 0; i < 6; i++) this.puffs.emit(at.x, at.y, at.z, (Math.random() - 0.5) * 0.6, 0.5 + Math.random() * 0.4, (Math.random() - 0.5) * 0.6, 0.7, 0.06, 1)
      return
    }
    if (hit.object === this.water.mesh) {
      sfx.splash()
      this.foam.burst(at.x, 0.02, at.z, 5, 0.6, 0, 0.2)
      return
    }
    // The land: the train drives to the nearest bit of track (if it's anywhere near).
    const near = this.track.nearest(at.x, at.z, this.s - CAR_GAP, 12)
    if (near.d < 2.5) this.driveTo(near.s + CAR_GAP)
    else sfx.fwip()
  }

  private driveTo(s: number) {
    this.goal = this.track.clampS(Math.max(TRAIN_LEN + 0.05, s))
    this.mode = 'goto'
    sounds.whoosh()
  }

  private tapBubble(act: string) {
    if (this.ready.has(act)) {
      sounds.pop()
      this.events.open(act)
      return
    }
    // Not ready: it wiggles (and the hub says why).
    sounds.sparkle()
    this.anchorEls.get(`go:${act}`)?.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-14deg)' }, { transform: 'rotate(12deg)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(0)' }], { duration: 500, composite: 'add' })
    this.events.soon?.(act)
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const lit = this.stops.find((s) => s.lit)
    let bubbleAt: { x: number; y: number } | null = null
    for (const [id, el] of this.anchorEls) {
      let spot: { x: number; y: number; size: number; h?: number; z: number; glow?: boolean } | null = null
      if (id === 'hint') continue
      if (id === 'train') {
        if (!this.inTunnel(this.s - CAR_GAP)) {
          const at = this.track.at(this.s - CAR_GAP, tmp).setY(LAND_TOP + 0.25)
          const s = this.toScreen(at)
          spot = { x: s.x, y: s.y, size: Math.max(min, this.pxPerM(at) * 1.1), z: 9000 }
        }
      } else if (id === 'maple') {
        if (this.mapleMode !== 'boarding' && !(this.mapleMode === 'riding' && this.inTunnel(this.s - CAR_GAP))) {
          const at = this.maple.center(tmp).add(new Vector3(0, 0.08, 0))
          const s = this.toScreen(at)
          // Smaller than the train's target and on top of it, so the rest of the train still grabs.
          spot = { x: s.x, y: s.y - min * 0.25, size: min * 0.8, z: 9100 }
        }
      } else if (id.startsWith('stop:')) {
        const st = this.stops.find((s) => s.id === id.slice(5))!
        const at = tmp.copy(st.at).setY(LAND_TOP + 0.2)
        const s = this.toScreen(at)
        spot = { x: s.x, y: s.y, size: Math.max(min, this.pxPerM(at) * 0.6), z: 7000 }
      } else if (id.startsWith('go:')) {
        const act = id.slice(3)
        const i = lit ? lit.acts.indexOf(act) : -1
        if (lit && i >= 0 && this.intro <= 0 && this.mapleMode === 'riding') {
          const s = this.toScreen(tmp.copy(lit.at).setY(LAND_TOP + lit.top))
          const size = min * 1.1
          const n = lit.acts.length
          spot = { x: s.x + (i - (n - 1) / 2) * size * 1.15, y: Math.max(s.y - size * 0.6, size * 0.6 + min), size, z: 9500 }
          if (i === 0) bubbleAt = spot
        }
      } else if (id.startsWith('animal:')) {
        const b = this.blockers.find((k) => k.kind === id.slice(7))!
        const at = tmp.copy(b.root.position).setY(LAND_TOP + (b.moose ? 0.22 : 0.15))
        const s = this.toScreen(at)
        spot = { x: s.x, y: s.y, size: Math.max(min, this.pxPerM(at) * 0.5), z: 8000, glow: b.state === 'on' && Math.abs(this.v) < 0.05 && Math.abs(b.s - this.s) < 1.2 + TRAIN_LEN && this.closeTo(b) }
      } else if (id === 'team') {
        if (this.team.length) {
          const ottawa = this.stops.find((s) => s.id === 'ottawa')!
          const a = this.toScreen(ottawa.root.localToWorld(tmp.set(CANAL.x, 0.12, CANAL.z0 + 0.1)))
          const b = this.toScreen(ottawa.root.localToWorld(tmp.set(CANAL.x, 0.12, CANAL.z1 - 0.1)))
          spot = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - min * 0.2, size: Math.max(min, Math.abs(b.x - a.x) + min * 0.5), h: Math.max(min, Math.abs(b.y - a.y) + min * 1.1), z: 6000 }
          el.style.borderRadius = '30px'
        }
      } else if (id.startsWith('poke:')) {
        const p = this.pokes.get(id.slice(5) as Poke)!
        if (p.root.visible) {
          const at = p.root.getWorldPosition(tmp).add(new Vector3(0, p.r * 0.6, 0))
          const s = this.toScreen(at)
          spot = { x: s.x, y: s.y, size: Math.max(min, this.pxPerM(at) * p.r * 2), z: id === 'poke:flock' ? 8500 : 5000 }
        }
      }
      const show = !!spot && this.intro <= 0 && spot.x > -spot.size / 2 && spot.x < this.w + spot.size / 2 && spot.y > -spot.size / 2 && spot.y < this.h + spot.size / 2
      if (show && spot) {
        const h = spot.h ?? spot.size
        el.style.transform = `translate3d(${(spot.x - spot.size / 2).toFixed(1)}px, ${(spot.y - h / 2).toFixed(1)}px, 0)`
        el.style.width = `${spot.size.toFixed(0)}px`
        el.style.height = `${h.toFixed(0)}px`
        el.style.zIndex = String(spot.z)
        const shadow = spot.glow ? '0 0 0 6px rgba(255,79,154,.55), 0 0 26px 10px rgba(255,200,61,.7)' : ''
        if (!id.startsWith('go:') && el.style.boxShadow !== shadow) el.style.boxShadow = shadow
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
    // The pointing hand (a hint): over the train, or over the first bubble.
    const hand = this.anchorEls.get('hint')
    if (hand) {
      let at: { x: number; y: number } | null = null
      if (this.hintKind === 'bubble' && bubbleAt) at = bubbleAt
      else if (this.hintKind === 'train' && !this.inTunnel(this.s - CAR_GAP)) at = this.toScreen(this.track.at(this.s - CAR_GAP * 0.5, tmp).setY(LAND_TOP + 0.3))
      if (at) hand.style.transform = `translate3d(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px, 0)`
      const want = at && this.intro <= 0 ? '' : 'none'
      if (hand.style.display !== want) hand.style.display = want
    }
  }

  /** The train is stopped right next to this animal. */
  private closeTo(b: OnTrack) {
    return b.s > this.s ? b.s - STOP_GAP - this.s < 0.1 : this.s - TRAIN_LEN - STOP_GAP - b.s < 0.1
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const lit = this.stops.find((s) => s.lit)
    return {
      s: +this.s.toFixed(2),
      length: +this.track.length.toFixed(1),
      speed: +this.v.toFixed(2),
      mode: this.mode,
      region: this.region,
      lit: lit?.id ?? null,
      inTunnel: this.inTunnel(this.s - CAR_GAP),
      tunnel: this.hidden.map((v) => +v.toFixed(2)),
      intro: this.intro > 0,
      maple: this.mapleMode,
      hint: this.hintKind,
      team: this.team.map((m) => m.act),
      animals: Object.fromEntries(this.blockers.map((b) => [b.kind, `${b.state} @${b.s.toFixed(1)}`])),
      stops: Object.fromEntries(this.stops.map((s) => [s.id, +s.s.toFixed(2)])),
      touches: this.touches,
      idle: +(this.time - this.lastTouch).toFixed(1),
    }
  }

  memory() {
    return { ...this.renderer.info.memory }
  }

  dispose() {
    this.unwatch()
    this.scene.clear()
    this.bag.dispose()
  }
}

/** Montmorency Falls' spot: the north shore of the St. Lawrence, just east of Quebec City's station. */
const MONTMORENCY: LL = unproj(14.33, 4.5)
/** The Mountie rides by the track on the prairies, near Regina (where Mounties learn to be Mounties). */
const MOUNTIE_AT: LL = [-103.0, 49.6]

const smoothstep = (p: number) => p * p * (3 - 2 * p)

/** A moose or bison's snort; a goose family honks. */
function snort(kind: Blocker) {
  if (kind === 'geese') return honk()
  noise(0.35, 0.22, 'lowpass', kind === 'bison' ? 380 : 520, 140, 0, 1)
  tone(kind === 'bison' ? 95 : 130, 80, 0.4, 0.08, 'sawtooth', 0.05)
}

function honk() {
  tone(340, 300, 0.13, 0.07, 'sawtooth')
  tone(340, 300, 0.13, 0.07, 'sawtooth', 0.2)
}

/** The loon's laughing call. */
function loonCall() {
  tone(600, 900, 0.25, 0.05, 'sine')
  tone(900, 700, 0.18, 0.05, 'sine', 0.27)
  tone(900, 700, 0.18, 0.05, 'sine', 0.47)
}

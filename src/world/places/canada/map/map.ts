// Canada's hub (greybox 1): the toy-table map of Canada and the red Maple Leaf Train. Her finger grabs the train and
// pushes it along the track: slowly and it creeps, hard and it whooshes, puffs and whistles, and the camera rides along.
// Let go and it rolls on and slows down. Tap a stop and it drives there by itself; tap the land and it drives to the
// nearest bit of track. At a stop the station's lamp lights up and that stop's two activities pop up over it.
//
// How it deepens: (1) push it back and forth in Quebec, whistle and smoke; (2) push it across the country: forests,
// the yellow prairies, the Rockies rising, a loop inside the Spiral Tunnel's mountain, the Pacific; (3) sometimes an
// animal sits on the track (a moose, a bison, a goose family): the train slows by itself and stops, she taps the animal
// and it ambles off with a snort. Never a crash.
//
// Things to poke: the CN Tower's elevator, a rainbow over Niagara Falls, a polar bear up by Hudson Bay, an orca off the
// Pacific coast, a ferry on the St. Lawrence, a V of geese flying over, snow puffing off any mountain, a tree rustling,
// a splash in the sea. Built for engine3d/View3D.tsx; nothing here comes from Thailand.
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
import { proj, regionAt, SPIRAL, STOPS, unproj, type LL, type Region } from './canada'
import { buildLand, buildMountains, buildPortals, buildTrees, type Peak } from './land'
import { LAND_TOP, RAIL_Y, Track } from './track'

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
}
export interface MapEvents {
  /** The train rode into another region (for the line at the bottom). */
  where(r: Region): void
  /** The train came to a stop (for the address bar). */
  stopped(r: Region): void
  /** She tapped an activity's bubble at a lit stop. */
  open(activity: string): void
}

const ANIMALS = ['moose', 'bison', 'geese'] as const
type Animal = (typeof ANIMALS)[number]
const POKES = ['cn', 'niagara', 'polar', 'orca', 'ferry', 'flock'] as const
type Poke = (typeof POKES)[number]

export const MAP_ANCHORS: AnchorInfo[] = [
  { id: 'train', label: 'The Maple Leaf Train: push it', kind: 'thing' },
  ...STOPS.map((s) => ({ id: `stop:${s.id}`, label: `The ${s.id} stop`, kind: 'thing' as const })),
  { id: 'animal:moose', label: 'A moose on the track', kind: 'thing' },
  { id: 'animal:bison', label: 'A bison on the track', kind: 'thing' },
  { id: 'animal:geese', label: 'A goose family on the track', kind: 'thing' },
  { id: 'poke:cn', label: 'The CN Tower in Toronto', kind: 'thing' },
  { id: 'poke:niagara', label: 'Niagara Falls', kind: 'thing' },
  { id: 'poke:polar', label: 'A polar bear up north', kind: 'thing' },
  { id: 'poke:orca', label: 'An orca in the Pacific', kind: 'thing' },
  { id: 'poke:ferry', label: 'A ferry on the St. Lawrence River', kind: 'thing' },
  { id: 'poke:flock', label: 'Canada geese flying over', kind: 'thing' },
]

/** Where the train waits when a link starts somewhere that isn't a stop. */
const START_AT: Partial<Record<Region, LL>> = { forest: [-86.5, 49.1], prairies: [-104.6, 50.5], rockies: [-121.0, 50.6] }
/** The train: the engine's middle at `s`, two cars behind it (toward the east). */
const CAR_GAP = 0.72
const TRAIN_LEN = CAR_GAP * 2
/** Somebody on the track: the train stops this far before them. */
const STOP_GAP = 0.6
const BRAKE = 4
/** No touch for this long: the train toots ("push me"). */
const INVITE_S = 8
const SKY = '#E3F3FF'

const tmp = new Vector3()
const tmp2 = new Vector3()
const tan = new Vector3()

interface Stop {
  id: Region
  s: number
  acts: string[]
  at: Vector3
  lamp: Mesh
  lit: boolean
  ringT: number
}

interface Blocker {
  kind: Animal
  s: number
  root: Group
  body: Group
  /** Where it sits on the track, and where it wanders off to. */
  home: Vector3
  away: Vector3
  yaw: number
  state: 'on' | 'leaving' | 'off' | 'back'
  t: number
  nudge: number
  hopT: number
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
  private engine = new Group()
  private cars: Group[] = []
  private wheels: Object3D[] = []
  private hidden: readonly [number, number]
  private intro: number
  private region: Region
  private resting = true
  private inviteAt = INVITE_S

  // ---- What's on the map.
  private stops: Stop[] = []
  private blockers: Blocker[] = []
  private peaks: Peak[]
  private mountains: Group
  private trees: Group
  private land: Group
  private smoke: Particles
  private puffs: Particles
  private foam: Particles
  /** The whole country (the first look, before it glides down to the train). */
  private overview: Shot = { center: new Vector3(), half: new Vector3(), yaw: 0, pitch: 62 }
  private pokes = new Map<Poke, { root: Group; at: Vector3; r: number; t: number }>()
  private rainbow = new Group()
  private flockT = 6
  private flockFrom = new Vector3()
  private flockTo = new Vector3()
  private lampOn = toon(PAL.gold)
  private lampOff = toon('#8E87A8')

  constructor(
    private renderer: WebGLRenderer,
    start: MapStart,
    private events: MapEvents,
    /** Activities that are ready for her (their bubbles open them; the rest wiggle: still in the works). */
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
    this.trees = buildTrees(this.bag, this.track, (x, z) => stopAt.some((p) => Math.hypot(x - p.x, z - p.z) < 0.7) || this.peaks.some((p) => Math.hypot(x - p.x, z - p.z) < p.r * 0.9))
    this.scene.add(this.trees)
    this.buildTrain()
    this.buildBlockers()
    this.buildPokes()

    this.smoke = new Particles({ kind: 'spray', count: 90, color: '#FFFFFF', gravity: -0.5 }, this.bag)
    this.puffs = new Particles({ kind: 'spray', count: 60, colors: ['#FFFFFF', '#E4F1EC', '#FBEA9A'], gravity: 3 }, this.bag)
    this.foam = new Particles({ kind: 'foam', count: 40, opacity: 0.9 }, this.bag)
    this.scene.add(this.smoke.mesh, this.puffs.mesh, this.foam.mesh)

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

    // The feel lab's graph: how far her finger is ahead of the train, and the train's speed.
    this.unwatch = watch('train', () => ({
      'finger ahead (m)': [this.fingerGap, 4],
      'speed (m/s)': [this.v, PUSH.top],
    }))
  }

  // ---------------------------------------------------------------- building

  private sAt(ll: LL) {
    const [x, z] = proj(ll)
    return this.track.nearest(x, z).s
  }

  private buildStops() {
    for (const st of STOPS) {
      const s = this.sAt(st.at)
      const p = this.track.at(s, new Vector3())
      this.track.tangent(s, tan)
      const yaw = Math.atan2(tan.x, tan.z)
      // The station stands beside the track, on the north side.
      const side = tan.x > 0 ? -1 : 1
      const nx = Math.cos(yaw) * side
      const nz = -Math.sin(yaw) * side
      const root = new Group()
      root.position.set(p.x + nx * 0.42, LAND_TOP, p.z + nz * 0.42)
      root.rotation.y = yaw
      root.add(
        solid(
          merge([
            P.rbox(0.62, 0.05, 0.3, 0.02, '#E8DCCB', { at: [0, 0.025, 0] }),
            P.rbox(0.4, 0.24, 0.2, 0.03, PAL.cream, { at: [0, 0.17, 0.02 * side] }),
            P.prism([[-0.25, 0], [0.25, 0], [0, 0.14]], 0.26, '#E8505B', { at: [0, 0.29, 0.02 * side], rot: [0, Math.PI / 2, 0] }),
            P.box(0.09, 0.13, 0.02, '#B98A6A', { at: [0, 0.115, -0.09 * side] }),
            P.cyl(0.012, 0.012, 0.42, '#5A5470', { at: [0.27, 0.23, 0] }, 6),
          ]),
          this.bag,
          2,
        ),
      )
      const lamp = new Mesh(this.bag.add(P.sphere(0.05, '#ffffff', {}, 12)), this.lampOff)
      lamp.position.set(0.27, 0.47, 0)
      root.add(lamp)
      this.scene.add(root)
      this.stops.push({ id: st.id, s, acts: st.acts, at: root.position, lamp, lit: false, ringT: -1 })
    }
  }

  private buildTrain() {
    const red = '#E8505B'
    const wheel = (x: number, z: number) => {
      const w = solid(P.cyl(0.065, 0.065, 0.04, PAL.ink, { rot: [0, 0, Math.PI / 2] }, 10), this.bag, 0)
      w.position.set(x, 0.065, z)
      this.wheels.push(w)
      return w
    }
    this.engine.add(
      solid(
        merge([
          P.rbox(0.3, 0.08, 0.66, 0.02, '#5A5470', { at: [0, 0.1, 0] }),
          P.cyl(0.12, 0.12, 0.42, red, { at: [0, 0.25, 0.08], rot: [Math.PI / 2, 0, 0] }, 16),
          P.cyl(0.125, 0.125, 0.03, PAL.gold, { at: [0, 0.25, 0.22], rot: [Math.PI / 2, 0, 0] }, 16),
          P.rbox(0.34, 0.32, 0.24, 0.04, red, { at: [0, 0.29, -0.2] }),
          P.rbox(0.38, 0.05, 0.3, 0.02, PAL.cream, { at: [0, 0.47, -0.2] }),
          P.box(0.36, 0.1, 0.12, PAL.sky, { at: [0, 0.34, -0.2] }),
          P.cyl(0.05, 0.035, 0.13, '#5A5470', { at: [0, 0.42, 0.2] }, 10),
          P.sphere(0.05, PAL.butter, { at: [0, 0.27, 0.3] }, 10),
          P.prism([[-0.16, 0], [0.16, 0], [0, 0.12]], 0.1, PAL.gold, { at: [0, 0.06, 0.37], rot: [-Math.PI / 2, 0, 0] }),
        ]),
        this.bag,
        2,
      ),
      wheel(0.16, 0.18),
      wheel(-0.16, 0.18),
      wheel(0.16, -0.18),
      wheel(-0.16, -0.18),
    )
    this.engine.add(blobShadow(0.36, this.bag))
    this.scene.add(this.engine)
    for (const color of [PAL.cream, PAL.lavender]) {
      const car = new Group()
      car.add(
        solid(
          merge([
            P.rbox(0.3, 0.06, 0.6, 0.02, '#5A5470', { at: [0, 0.09, 0] }),
            P.rbox(0.32, 0.26, 0.56, 0.04, color, { at: [0, 0.25, 0] }),
            P.rbox(0.36, 0.05, 0.6, 0.02, red, { at: [0, 0.4, 0] }),
            P.box(0.33, 0.08, 0.4, PAL.sky, { at: [0, 0.29, 0] }),
            P.box(0.34, 0.03, 0.56, red, { at: [0, 0.17, 0] }),
          ]),
          this.bag,
          2,
        ),
        wheel(0.16, 0.18),
        wheel(-0.16, 0.18),
        wheel(0.16, -0.18),
        wheel(-0.16, -0.18),
        blobShadow(0.34, this.bag),
      )
      this.cars.push(car)
      this.scene.add(car)
    }
  }

  private buildBlockers() {
    const at: Record<Animal, LL> = { moose: [-82.6, 47.05], bison: [-108.6, 50.6], geese: [-95.8, 49.85] }
    for (const kind of ANIMALS) {
      const s = this.sAt(at[kind])
      const p = this.track.at(s, new Vector3())
      this.track.tangent(s, tan)
      const yaw = Math.atan2(tan.x, tan.z)
      const root = new Group()
      const body = new Group()
      root.add(body, blobShadow(kind === 'geese' ? 0.3 : 0.26, this.bag))
      body.add(solid(merge(animalParts(kind)), this.bag, 2))
      root.position.set(p.x, LAND_TOP, p.z)
      // Facing across the track, toward her.
      root.rotation.y = yaw + Math.PI / 2
      // It wanders off to the south side (toward the camera), off the rails.
      const side = Math.sin(yaw) < 0 ? 1 : -1
      const away = new Vector3(p.x + Math.cos(yaw) * 0.75 * side, LAND_TOP, p.z - Math.sin(yaw) * 0.75 * side)
      this.scene.add(root)
      this.blockers.push({ kind, s, root, body, home: p.clone().setY(LAND_TOP), away, yaw: root.rotation.y, state: 'on', t: 0, nudge: -1, hopT: -1 })
    }
  }

  private buildPokes() {
    const place = (id: Poke, ll: LL, root: Group, r: number, y = LAND_TOP) => {
      const [x, z] = proj(ll)
      root.position.set(x, y, z)
      this.scene.add(root)
      this.pokes.set(id, { root, at: root.position, r, t: -1 })
    }
    // The CN Tower in Toronto, with a little elevator that zips up it.
    const cn = new Group()
    cn.add(
      solid(
        merge([
          P.cyl(0.035, 0.07, 1.3, '#E8DCCB', { at: [0, 0.65, 0] }, 10),
          P.cyl(0.11, 0.08, 0.1, '#E8DCCB', { at: [0, 0.95, 0] }, 14),
          P.cyl(0.012, 0.02, 0.45, '#E8DCCB', { at: [0, 1.5, 0] }, 6),
          P.sphere(0.02, '#E8505B', { at: [0, 1.73, 0] }, 8),
        ]),
        this.bag,
        2,
      ),
    )
    const lift = solid(P.box(0.04, 0.06, 0.04, PAL.gold, { at: [0, 0, 0.045] }), this.bag, 1)
    lift.position.y = 0.1
    lift.name = 'lift'
    cn.add(lift)
    place('cn', [-79.5, 43.85], cn, 0.35)
    // Niagara Falls: a little cliff with the water pouring over, and a rainbow that comes out in the mist.
    const falls = new Group()
    falls.add(
      solid(
        merge([
          P.rbox(0.5, 0.16, 0.24, 0.03, '#B98A6A', { at: [0, 0.08, 0] }),
          P.rbox(0.42, 0.04, 0.2, 0.02, PAL.sky, { at: [0, 0.17, 0] }),
          P.box(0.42, 0.18, 0.04, '#D3EEFF', { at: [0, 0.08, 0.13] }),
        ]),
        this.bag,
        1.5,
      ),
    )
    const bands = ['#FF8FB8', '#FFC2A8', '#FBEA9A', '#8FE3C8', '#A8DCFF', '#B9A6F5']
    bands.forEach((c, i) => this.rainbow.add(solid(P.torus(0.42 - i * 0.035, 0.018, c, {}, Math.PI), this.bag, 0)))
    this.rainbow.position.set(0, 0.05, 0.3)
    this.rainbow.scale.setScalar(0.001)
    this.rainbow.visible = false
    falls.add(this.rainbow)
    place('niagara', [-79.25, 43.08], falls, 0.3)
    // A polar bear up by Churchill, on Hudson Bay (the way to the Poles).
    const bear = new Group()
    bear.add(
      solid(
        merge([
          P.sphere(0.13, '#FFFFFF', { at: [0, 0.13, 0], scale: [1, 0.85, 1.35] }),
          P.sphere(0.08, '#FFFFFF', { at: [0, 0.2, 0.17] }),
          P.sphere(0.028, '#FFFFFF', { at: [0.05, 0.27, 0.15] }, 8),
          P.sphere(0.028, '#FFFFFF', { at: [-0.05, 0.27, 0.15] }, 8),
          P.sphere(0.018, PAL.ink, { at: [0, 0.2, 0.25] }, 8),
        ]),
        this.bag,
        2,
      ),
      blobShadow(0.2, this.bag),
    )
    place('polar', [-95.3, 59.0], bear, 0.25)
    // An orca off the Pacific coast: rests at the surface, jumps when she taps.
    const orca = new Group()
    orca.add(
      solid(
        merge([
          P.sphere(0.12, PAL.ink, { scale: [1, 0.8, 2.2] }),
          P.sphere(0.06, '#FFFFFF', { at: [0.07, 0.03, 0.12], scale: [0.6, 0.6, 1.2] }),
          P.sphere(0.06, '#FFFFFF', { at: [-0.07, 0.03, 0.12], scale: [0.6, 0.6, 1.2] }),
          P.cone(0.04, 0.2, PAL.ink, { at: [0, 0.16, -0.02], rot: [-0.25, 0, 0] }),
          P.box(0.24, 0.02, 0.07, PAL.ink, { at: [0, 0, -0.28] }),
        ]),
        this.bag,
        2,
      ),
    )
    place('orca', [-126.6, 48.9], orca, 0.3, 0.02)
    // A ferry on the St. Lawrence, crossing from shore to shore.
    const ferry = new Group()
    ferry.add(
      solid(
        merge([
          P.rbox(0.22, 0.08, 0.5, 0.04, '#FFFFFF', { at: [0, 0.04, 0] }),
          P.rbox(0.16, 0.1, 0.24, 0.03, PAL.sky, { at: [0, 0.13, -0.04] }),
          P.cyl(0.03, 0.03, 0.1, '#E8505B', { at: [0, 0.22, -0.04] }, 8),
        ]),
        this.bag,
        2,
      ),
    )
    place('ferry', [-68.0, 48.94], ferry, 0.3, 0.03)
    // Five Canada geese in a V, flying over every now and then.
    const flock = new Group()
    for (let i = 0; i < 5; i++) {
      const k = Math.ceil(i / 2) * (i % 2 ? 1 : -1)
      const goose = new Group()
      goose.add(solid(merge(gooseParts()), this.bag, 1.5))
      goose.position.set(k * 0.22, 0, -Math.abs(k) * 0.24)
      flock.add(goose)
    }
    flock.visible = false
    place('flock', [-71.6, 47.0], flock, 0.5, 2.2)
  }

  // ---------------------------------------------------------------- World3D

  private shot(): Shot {
    if (this.intro > 0) return this.overview
    const mid = this.track.at(this.s - CAR_GAP + clamp(this.v * 0.3, -1.2, 1.2), tmp)
    return {
      center: new Vector3(mid.x, LAND_TOP + 0.25, mid.z - (this.tall ? 0.7 : 0.35)),
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
    return this.v === 0 && this.mode !== 'push' && this.intro <= 0 && !this.rig.moving && !this.busy()
  }

  private busy() {
    return this.whistleT < 1.2 || this.stops.some((s) => s.ringT >= 0) || this.blockers.some((b) => b.state === 'leaving' || b.state === 'back' || b.hopT >= 0 || b.nudge >= 0) || [...this.pokes.values()].some((p) => p.t >= 0)
  }

  update(dt: number) {
    const t = (this.time += dt)
    if (this.intro > 0) {
      this.intro -= dt
      if (this.intro <= 0) this.rig.lag = 0.9
    } else if (this.rig.lag > 0.45 && !this.rig.moving) this.rig.lag = 0.45
    this.moveTrain(dt)
    this.placeTrain()
    this.updateStops(dt)
    this.updateBlockers(dt, t)
    this.updatePokes(dt, t)
    this.updateInvite(dt)
    this.smoke.update(dt)
    this.puffs.update(dt)
    this.foam.update(dt)
    this.water.update(t)
    const c = this.track.at(this.s - CAR_GAP, tmp)
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
    // Pressed up against an animal: it gets a nudge (and a snort).
    for (const b of this.blockers) {
      if (b.state !== 'on' || b.nudge >= 0) continue
      const gap = b.s > this.s ? b.s - STOP_GAP - this.s : this.s - TRAIN_LEN - STOP_GAP - b.s
      const pushing = this.mode === 'push' ? Math.sign(this.fingerGap) === Math.sign(b.s - this.s) && Math.abs(this.fingerGap) > 0.2 : this.mode === 'goto'
      if (gap < 0.03 && pushing) {
        b.nudge = 0
        snort(b.kind)
      }
    }
    const moved = this.s - before
    this.wheelTurn += moved / 0.065
    // Chuff-chuff, quicker the faster it goes; puffs of smoke; the whistle when she pushes it fast.
    const speed = Math.abs(this.v)
    this.chuffAt += Math.abs(moved)
    if (this.chuffAt > 0.32 && speed > 0.15) {
      this.chuffAt = 0
      noise(0.08, Math.min(0.09, 0.025 + speed * 0.012), 'bandpass', 520, 260, 0, 1.6)
      this.puff(0.08 + Math.min(0.08, speed * 0.02), 1)
    }
    this.whistleT += dt
    if (speed > PUSH.whistle && this.whistleT > 2.5 && this.mode === 'push') this.whistle()
    if (this.mode !== 'push') this.fingerGap = 0
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
      g.position.y = LAND_TOP + 0.08
      this.track.tangent(s, tan)
      g.rotation.y = Math.atan2(tan.x, tan.z)
      // A little rock at speed.
      g.rotation.z = Math.sin(this.time * 9 + i) * Math.min(0.03, Math.abs(this.v) * 0.008)
    })
    for (const w of this.wheels) w.rotation.x = this.wheelTurn
  }

  /** The chimney's spot (or the mountain's top while the train is in the tunnel). */
  private chimney(out: Vector3) {
    if (this.inTunnel(this.s)) {
      const [x, z] = proj(SPIRAL)
      return out.set(x, LAND_TOP + 2.0, z)
    }
    return this.engine.localToWorld(out.set(0, 0.5, 0.2))
  }

  private puff(size: number, n: number) {
    const c = this.chimney(tmp2)
    for (let i = 0; i < n; i++) this.smoke.emit(c.x, c.y, c.z, (Math.random() - 0.5) * 0.15, 0.35 + Math.random() * 0.2, (Math.random() - 0.5) * 0.15, 1.4 + Math.random() * 0.6, size * (0.8 + Math.random() * 0.5))
  }

  private whistle() {
    this.whistleT = 0
    const echo = this.inTunnel(this.s) ? 0.4 : 1
    tone(740, 760, 0.42, 0.09 * echo, 'triangle')
    tone(932, 950, 0.42, 0.06 * echo, 'triangle')
    tone(740, 760, 0.55, 0.09 * echo, 'triangle', 0.5)
    tone(932, 950, 0.55, 0.06 * echo, 'triangle', 0.5)
    this.puff(0.2, 6)
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
    const near = Math.abs(this.v) < 0.5 && this.mode !== 'push' ? this.litStop() : undefined
    for (const st of this.stops) {
      const lit = st === near
      if (lit && !st.lit) {
        st.ringT = 0
        tone(1320, 1320, 0.7, 0.07)
        tone(1760, 1760, 0.6, 0.04, 'sine', 0.08)
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

  // ---------------------------------------------------------------- animals on the track

  private updateBlockers(dt: number, t: number) {
    for (const b of this.blockers) {
      let y = 0
      let sq = 0
      if (b.state === 'leaving' || b.state === 'back') {
        b.t += dt
        const p = Math.min(1, b.t / 1.6)
        const from = b.state === 'leaving' ? b.home : b.away
        const to = b.state === 'leaving' ? b.away : b.home
        b.root.position.lerpVectors(from, to, smoothstep(p))
        b.root.rotation.y = Math.atan2(to.x - from.x, to.z - from.z)
        y = Math.abs(Math.sin(b.t * 10)) * 0.03
        if (p >= 1) {
          b.state = b.state === 'leaving' ? 'off' : 'on'
          b.t = 0
          b.root.rotation.y = b.state === 'on' ? b.yaw : b.yaw + Math.PI
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
      b.body.position.y = y
      b.body.scale.set(1 + sq, 1 - sq + 0.02 * Math.sin(t * 2.4 + b.s), 1 + sq)
    }
  }

  /** Already off the track (no walk). */
  private wander(b: Blocker) {
    b.state = 'off'
    b.t = 0
    b.root.position.copy(b.away)
    b.root.rotation.y = b.yaw + Math.PI
  }

  // ---------------------------------------------------------------- pokes

  private updatePokes(dt: number, t: number) {
    for (const [id, p] of this.pokes) {
      if (p.t >= 0) p.t += dt
      const k = p.t
      if (id === 'cn') {
        const lift = p.root.getObjectByName('lift')!
        lift.position.y = k >= 0 ? 0.1 + 0.85 * bell(Math.min(1, k / 2.4)) : 0.1
        if (k > 2.4) p.t = -1
      } else if (id === 'niagara') {
        const show = k >= 0 && k < 5
        this.rainbow.visible = k >= 0
        this.rainbow.scale.setScalar(show ? Math.min(1, k * 2) : Math.max(0.001, 1 - (k - 5) * 2))
        if (k >= 0 && Math.random() < dt * 8) this.puffs.emit(p.at.x + (Math.random() - 0.5) * 0.3, LAND_TOP + 0.1, p.at.z + 0.2, 0, 0.6, 0.1, 0.8, 0.07, 0)
        if (k > 5.5) p.t = -1
      } else if (id === 'polar') {
        p.root.position.y = LAND_TOP + (k >= 0 ? bell(Math.min(1, k / 0.6)) * 0.15 : 0)
        p.root.rotation.y = k >= 0 ? Math.sin(k * 12) * 0.3 * (1 - Math.min(1, k)) : 0.4 * Math.sin(t * 0.3)
        if (k > 1) p.t = -1
      } else if (id === 'orca') {
        const j = k >= 0 ? Math.min(1, k / 1.3) : 0
        p.root.position.y = 0.02 + Math.sin(t * 1.5) * 0.02 + bell(j) * 0.7
        p.root.position.x = p.at.x
        p.root.rotation.x = k >= 0 ? -1.1 + 2.2 * j : 0
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
        if (k > 3) p.t = -1
      } else if (id === 'flock') this.updateFlock(dt, t, p)
    }
  }

  /** The geese fly across the view now and then, flapping and honking. */
  private updateFlock(dt: number, t: number, p: { root: Group; t: number }) {
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
    f.children.forEach((g, i) => (g.scale.y = 1 + 0.25 * Math.sin(t * (quick > 1 ? 18 : 9) + i)))
    if (f.userData.k >= 1) {
      f.visible = false
      this.flockT = 18 + Math.random() * 10
      p.t = -1
    }
  }

  private poke(id: Poke) {
    const p = this.pokes.get(id)!
    if (id === 'flock') {
      honk()
      p.t = 0
      return
    }
    if (p.t >= 0) return
    p.t = 0
    if (id === 'cn') tone(330, 990, 1.1, 0.06, 'triangle')
    else if (id === 'niagara') sounds.sparkle()
    else if (id === 'polar') sfx.boing()
    else if (id === 'orca') tone(900, 1500, 0.25, 0.05, 'sine')
    else if (id === 'ferry') {
      tone(220, 220, 0.6, 0.12, 'sawtooth')
      tone(277, 277, 0.6, 0.06, 'triangle')
    }
  }

  // ---------------------------------------------------------------- the nudge when nobody plays

  private updateInvite(dt: number) {
    if (this.intro > 0 || this.mode === 'push' || this.v !== 0) {
      this.inviteAt = INVITE_S
      return
    }
    this.inviteAt -= dt
    if (this.inviteAt <= 0) {
      this.inviteAt = INVITE_S * 1.5
      // A little toot and a puff: "push me".
      tone(740, 760, 0.25, 0.05, 'triangle')
      this.puff(0.14, 3)
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
    if (this.intro > 0) this.intro = 0
    if (id === 'train' || (!id && this.nearTrain(x, y))) {
      const hit = this.groundAt(x, y)
      // Where along the train she grabbed it (the engine or a car), so that spot stays under her finger.
      this.grabOffset = hit ? this.s - this.track.nearest(hit.x, hit.z, this.s - CAR_GAP, 1.6).s : CAR_GAP
      this.finger = { x, y }
      this.mode = 'push'
      sounds.pickup()
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
    if (this.intro > 0) this.intro = 0
    if (this.mode === 'push') this.pointerUp()
    if (id?.startsWith('go:')) return this.tapBubble(id.slice(3))
    if (id === 'train' || (!id && this.nearTrain(x, y))) return this.whistle()
    if (id?.startsWith('stop:')) {
      const st = this.stops.find((s) => s.id === id.slice(5))!
      if (st.lit) {
        st.ringT = 0
        sounds.sparkle()
      } else this.driveTo(st.s + CAR_GAP)
      return
    }
    if (id?.startsWith('animal:')) {
      const b = this.blockers.find((k) => k.kind === id.slice(7))!
      if (b.state === 'on') {
        b.state = 'leaving'
        b.t = 0
        snort(b.kind)
      } else {
        b.hopT = 0
        sfx.boing()
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
    // Still in the works: it wiggles.
    sounds.sparkle()
    this.anchorEls.get(`go:${act}`)?.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-14deg)' }, { transform: 'rotate(12deg)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(0)' }], { duration: 500, composite: 'add' })
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const lit = this.stops.find((s) => s.lit)
    for (const [id, el] of this.anchorEls) {
      let spot: { x: number; y: number; size: number; z: number; glow?: boolean } | null = null
      if (id === 'train') {
        if (!this.inTunnel(this.s - CAR_GAP)) {
          const at = this.track.at(this.s - CAR_GAP, tmp).setY(LAND_TOP + 0.25)
          const s = this.toScreen(at)
          spot = { x: s.x, y: s.y, size: Math.max(min, this.pxPerM(at) * 1.1), z: 9000 }
        }
      } else if (id.startsWith('stop:')) {
        const st = this.stops.find((s) => s.id === id.slice(5))!
        const at = tmp.copy(st.at).setY(LAND_TOP + 0.2)
        const s = this.toScreen(at)
        spot = { x: s.x, y: s.y, size: Math.max(min, this.pxPerM(at) * 0.6), z: 7000 }
      } else if (id.startsWith('go:')) {
        const act = id.slice(3)
        const i = lit ? lit.acts.indexOf(act) : -1
        if (lit && i >= 0 && this.intro <= 0) {
          const s = this.toScreen(tmp.copy(lit.at).setY(LAND_TOP + 0.7))
          const size = min * 1.1
          const n = lit.acts.length
          spot = { x: s.x + (i - (n - 1) / 2) * size * 1.15, y: Math.max(s.y - size * 0.7, size * 0.6 + min), size, z: 9500 }
        }
      } else if (id.startsWith('animal:')) {
        const b = this.blockers.find((k) => k.kind === id.slice(7))!
        const at = tmp.copy(b.root.position).setY(LAND_TOP + 0.15)
        const s = this.toScreen(at)
        spot = { x: s.x, y: s.y, size: Math.max(min, this.pxPerM(at) * 0.5), z: 8000, glow: b.state === 'on' && Math.abs(this.v) < 0.05 && Math.abs(b.s - this.s) < 1.2 + TRAIN_LEN && this.closeTo(b) }
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
        el.style.transform = `translate3d(${(spot.x - spot.size / 2).toFixed(1)}px, ${(spot.y - spot.size / 2).toFixed(1)}px, 0)`
        el.style.width = el.style.height = `${spot.size.toFixed(0)}px`
        el.style.zIndex = String(spot.z)
        const shadow = spot.glow ? '0 0 0 6px rgba(255,79,154,.55), 0 0 26px 10px rgba(255,200,61,.7)' : ''
        if (!id.startsWith('go:') && el.style.boxShadow !== shadow) el.style.boxShadow = shadow
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
  }

  /** The train is stopped right next to this animal. */
  private closeTo(b: Blocker) {
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

const smoothstep = (p: number) => p * p * (3 - 2 * p)

/** The animals that sit on the track, as placeholder shapes facing +z. */
function animalParts(kind: Animal) {
  if (kind === 'moose') {
    const brown = '#8A5A44'
    return [
      P.rbox(0.36, 0.2, 0.18, 0.06, brown, { at: [0, 0.26, 0], rot: [0, Math.PI / 2, 0] }),
      ...[-0.1, 0.1].flatMap((x) => [-0.05, 0.05].map((z) => P.cyl(0.022, 0.02, 0.17, '#5E3D30', { at: [x, 0.085, z] }, 6))),
      P.rbox(0.1, 0.11, 0.18, 0.04, brown, { at: [0, 0.34, 0.18] }),
      P.sphere(0.012, PAL.ink, { at: [0.035, 0.37, 0.25] }, 6),
      P.sphere(0.012, PAL.ink, { at: [-0.035, 0.37, 0.25] }, 6),
      P.rbox(0.12, 0.02, 0.07, 0.01, '#E8DCCB', { at: [0.09, 0.42, 0.16], rot: [0, 0, 0.4] }),
      P.rbox(0.12, 0.02, 0.07, 0.01, '#E8DCCB', { at: [-0.09, 0.42, 0.16], rot: [0, 0, -0.4] }),
    ]
  }
  if (kind === 'bison') {
    const brown = '#6E4A3A'
    return [
      P.sphere(0.15, brown, { at: [0, 0.22, 0.02], scale: [0.85, 0.9, 1.15] }),
      P.sphere(0.11, '#5A3A2E', { at: [0, 0.28, 0.1] }),
      ...[-0.07, 0.07].flatMap((x) => [-0.08, 0.08].map((z) => P.cyl(0.022, 0.02, 0.12, '#4A3026', { at: [x, 0.06, z] }, 6))),
      P.sphere(0.065, '#5A3A2E', { at: [0, 0.2, 0.2] }),
      P.sphere(0.01, PAL.ink, { at: [0.03, 0.22, 0.26] }, 6),
      P.sphere(0.01, PAL.ink, { at: [-0.03, 0.22, 0.26] }, 6),
      P.cone(0.012, 0.05, '#E8DCCB', { at: [0.06, 0.27, 0.2], rot: [0, 0, -0.8] }, 6),
      P.cone(0.012, 0.05, '#E8DCCB', { at: [-0.06, 0.27, 0.2], rot: [0, 0, 0.8] }, 6),
    ]
  }
  // A goose and two goslings.
  return [...gooseParts([0, 0, 0], 1), ...gooseParts([0.12, 0, -0.04], 0.55, '#FBEA9A'), ...gooseParts([-0.12, 0, -0.05], 0.55, '#FBEA9A')]
}

/** One Canada goose (grey body, black neck, white chin strap), standing (the flock's fly with the same shape). */
function gooseParts(at: [number, number, number] = [0, 0, 0], k = 1, body = '#B8B0A8') {
  const [x, y, z] = at
  return [
    P.sphere(0.07 * k, body, { at: [x, y + 0.08 * k, z], scale: [0.8, 0.75, 1.25] }),
    P.cyl(0.018 * k, 0.022 * k, 0.1 * k, k < 1 ? body : PAL.ink, { at: [x, y + 0.15 * k, z + 0.06 * k], rot: [0.35, 0, 0] }, 6),
    P.sphere(0.03 * k, k < 1 ? body : PAL.ink, { at: [x, y + 0.21 * k, z + 0.08 * k] }, 8),
    P.sphere(0.016 * k, k < 1 ? body : '#FFFFFF', { at: [x, y + 0.2 * k, z + 0.1 * k], scale: [1.4, 0.8, 0.8] }, 6),
    P.cone(0.012 * k, 0.03 * k, PAL.gold, { at: [x, y + 0.21 * k, z + 0.12 * k], rot: [Math.PI / 2, 0, 0] }, 6),
  ]
}

/** A moose or bison's snort; a goose family honks. */
function snort(kind: Animal) {
  if (kind === 'geese') return honk()
  noise(0.35, 0.22, 'lowpass', kind === 'bison' ? 380 : 520, 140, 0, 1)
  tone(kind === 'bison' ? 95 : 130, 80, 0.4, 0.08, 'sawtooth', 0.05)
}

function honk() {
  tone(340, 300, 0.13, 0.07, 'sawtooth')
  tone(340, 300, 0.13, 0.07, 'sawtooth', 0.2)
}

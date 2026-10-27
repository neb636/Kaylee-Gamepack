// The Poles' hub (greybox 1): a toy globe she grabs and spins, and a sun she drags. Spin it down and the Arctic comes to
// the front: thin sea ice floating on the ocean, Pola waving. Spin it up and it's Antarctica: a thick white land with
// mountains, Pebble waving. Then the sun pops out beside the globe; drag it up and the north gets summer (daylight all
// the way round, the floes melt back, the snow line climbs) while the south goes dark (stars, southern lights), and the
// other way round. The light is real: the sun sits in the Earth's frame, tilted up to `SUN.tilt` (the Earth's 23.4°).
//
// Frames: `tilt` turns about the screen's x axis (her finger up and down: which pole faces her) and carries the sun, the
// stars and the auroras; `spin` turns inside it about the Earth's axis (her finger left and right: day and night go
// round). Spinning up or down is like the camera flying over the top or the bottom, so the seasons don't change when she
// does; only the sun does that. Built for engine3d/View3D.tsx; nothing here comes from Thailand.
import { CanvasTexture, Color, CylinderGeometry, DoubleSide, Euler, Group, LatheGeometry, Mesh, MeshBasicMaterial, Object3D, Plane, Quaternion, Raycaster, Scene, ShaderMaterial, SphereGeometry, Sprite, SpriteMaterial, Vector2, Vector3, type BufferGeometry, type WebGLRenderer } from 'three'
import { bell, clamp, smooth, sounds, span, wobble } from '../../../../sdk'
import { knobs, watch } from '../../../kit/knobs'
import { sfx, tone } from '../../../kit/sfx'
import type { AnchorInfo } from '../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../engine3d/camera'
import { Bag } from '../../../engine3d/dispose'
import { bake, merge, P } from '../../../engine3d/geo'
import { makeHull, setOutlineResolution } from '../../../engine3d/outline'
import { PAL } from '../../../engine3d/toon'
import type { World3D } from '../../../engine3d/View3D'
import { earthTexture, ll } from './earth'
import { GlobeExtras, type Lost, type PokeId } from './extras'
import { globeMaterials } from './material'

const FILE = 'src/world/places/poles/globe/globe.ts'
/** How the globe feels under her finger (live in the feel lab: ?feel=1 on the hub's links). */
const SPIN = knobs('globe', 'Spin the globe', FILE, {
  grip: { value: 1, min: 0.3, max: 2.5, step: 0.05, label: 'Grip', unit: '×', note: '1 = the spot under her finger stays under it; higher = the globe turns further than her finger' },
  coast: { value: 1.4, min: 0.2, max: 5, step: 0.1, label: 'Coast', unit: 's', note: 'how long a flick sideways keeps it spinning' },
  maxSpin: { value: 6, min: 1, max: 15, step: 0.5, label: 'Top flick speed', unit: 'rad/s', note: 'the fastest a flick can spin it' },
  flick: { value: 0.06, min: 0, max: 0.3, step: 0.01, label: 'Flick smoothing', unit: 's', note: 'how much of her last moves count toward a flick (0 = only the very last)' },
  reach: { value: 0.25, min: 0, max: 0.8, step: 0.01, label: 'Flick reach', unit: 's', note: 'how far a flick up or down carries it when picking the pole it settles on' },
  poleView: { value: 28, min: 10, max: 70, step: 1, label: 'Pole view tilt', unit: '°', note: 'how far it tips to show a pole (90 = looking straight down on it)' },
  settle: { value: 7, min: 1, max: 20, step: 0.5, label: 'Settle speed', unit: '/s', note: 'how quickly it settles on a pole or back to the middle after she lets go' },
  stretch: { value: 0.3, min: 0, max: 1, step: 0.05, label: 'Past the pole', note: 'how far she can pull past straight down on a pole (a rubber band)' },
  idle: { value: 0.06, min: 0, max: 0.5, step: 0.01, label: 'Idle spin', unit: 'rad/s', note: 'the Earth turning by itself when nobody holds it' },
})
/** How the sun feels. */
const SUN = knobs('sun', 'Drag the sun', FILE, {
  tilt: { value: 23.4, min: 10, max: 45, step: 0.1, label: "Earth's tilt", unit: '°', note: 'how far up or down the sun goes (the real Earth: 23.4°)' },
  follow: { value: 0.08, min: 0, max: 0.5, step: 0.01, label: 'Sun smoothing', unit: 's', note: 'how closely the sun follows her finger (0 = stuck to it)' },
  season: { value: 1, min: 0.2, max: 4, step: 0.1, label: 'Season change', unit: 's', note: 'how long the ice, the snow and the night take to catch up with the sun' },
})

export type Side = 'middle' | 'north' | 'south'
export interface GlobeStart {
  /** Which way the globe faces her. */
  side: Side
  /** The sun is already out (the `sun` section). */
  sun: boolean
  /** Where the sun shines. */
  summer: Side
  /** Step 3 from the start: this one is lost in the middle of the ocean (the `lost` section). */
  lost: Lost | null
}
export interface GlobeEvents {
  /** Another pole (or the middle) came to the front. */
  side(s: Side): void
  /** The sun popped out (step 2). */
  sunOut(): void
  /** Summer moved: north, south, or in between. */
  summer(s: Side): void
  /** A lost penguin or bear turned up adrift (or the last one is home: null). */
  lost(kind: Lost | null): void
  /** She put the lost one down on a pole: its own (`home`), or the other one. */
  saved(kind: Lost, home: boolean): void
}

export const GLOBE_ANCHORS: AnchorInfo[] = [
  { id: 'globe', label: 'The globe: spin it', kind: 'thing' },
  { id: 'pola', label: 'Pola the polar bear cub', kind: 'thing' },
  { id: 'pebble', label: 'Pebble the penguin chick', kind: 'thing' },
  { id: 'sun', label: 'The sun: drag it up and down', kind: 'thing' },
  { id: 'lost', label: 'The lost one: carry it home', kind: 'thing' },
  { id: 'marker', label: 'The North Pole', kind: 'thing' },
  { id: 'seal', label: 'A seal in its hole', kind: 'thing' },
  { id: 'station', label: 'The science station', kind: 'thing' },
  { id: 'whale', label: 'A whale', kind: 'thing' },
]
const POKES = new Set<string>(['lost', 'marker', 'seal', 'station', 'whale'])

const DEG = Math.PI / 180
const UP = new Vector3(0, 1, 0)
/** The sun's distance from the Earth's center (a little closer on a tall screen, so the globe can be bigger), and how
 *  far round toward her it sits (so most of what she sees is lit). */
const SUN_D = { wide: 1.75, tall: 1.42 }
const SUN_TOWARD = 30 * DEG
/** Pulled past straight down on a pole: as far as the rubber band goes. */
const PITCH_MAX = 90 * DEG
/** Antarctica's ice dome: how far from the pole it reaches, and how high it stands (the Earth is 1). */
const DOME_DEG = 22
const DOME_H = 0.085
/** The pastel sky around the globe on each side, and the night it fades into. */
const BG = { middle: new Color('#F6EEFF'), north: new Color('#D3EEFF'), south: new Color('#E4DDFF'), night: new Color('#3D3B70') }
const ICE = '#F4FBFF'
const LAND_ICE = '#FFF7F0'
/** No touch for this long: the globe or the sun gives a little nudge ("grab me"). */
const INVITE_S = 7

const tmp = new Vector3()
const tmp2 = new Vector3()
const tq = new Quaternion()
const tq2 = new Quaternion()
const toCam = new Vector3()
const skyGoal = new Color()

/** A little seeded random, so the floes are in the same places every time. */
function rng(seed: number) {
  let s = seed
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280)
}

/** Antarctica's height at this many degrees from the South Pole. */
const domeR = (deg: number) => 1 + DOME_H * Math.cos(Math.min(deg / DOME_DEG, 1) * (Math.PI / 2)) ** 2

/** A lathed cap round the +y axis: `outer(deg)` from the pole out to `maxDeg`, back along `inner`. */
function cap(maxDeg: number, outer: (deg: number) => number, inner: number) {
  const pts: Vector2[] = []
  const n = 14
  for (let i = 0; i <= n; i++) {
    const d = (maxDeg * i) / n
    pts.push(new Vector2(outer(d) * Math.sin(d * DEG), outer(d) * Math.cos(d * DEG)))
  }
  for (let i = n; i >= 0; i--) {
    const d = (maxDeg * i) / n
    pts.push(new Vector2(inner * Math.sin(d * DEG), inner * Math.cos(d * DEG)))
  }
  // (Lathe faces point outward when the outline runs from the bottom up.)
  return new LatheGeometry(pts.reverse(), 48)
}

/** Euler angles that turn +y to point along `dir` (for baking a part onto the globe's surface). */
function upTo(dir: Vector3): [number, number, number] {
  const e = new Euler().setFromQuaternion(new Quaternion().setFromUnitVectors(UP, tmp2.copy(dir).normalize()))
  return [e.x, e.y, e.z]
}

/** Stands something on the globe at a latitude and longitude, `r` from the center, feet down. */
function standOn(o: Object3D, lat: number, lon: number, r: number) {
  ll(lat, lon, r, o.position)
  o.quaternion.setFromUnitVectors(UP, tmp.copy(o.position).normalize())
}

/** Pola and Pebble, as placeholder shapes until the art gate: they turn to look at her, breathe, hop and wave. */
export class Critter {
  /** Stands on the globe (its up = away from the center). */
  readonly root = new Group()
  /** Turns to face her, hops and squashes. */
  readonly body = new Group()
  readonly arms: Group[] = []
  private hopT = -1
  private waveT = -1
  private face = 0
  private phase = Math.random() * 6

  constructor(readonly height: number) {
    this.root.add(this.body)
  }

  hop(wave = false) {
    if (this.hopT < 0 || this.hopT > HOP_S * 0.7) {
      this.hopT = 0
      sfx.boing()
    }
    if (wave) this.waveT = 0
  }
  get busy() {
    return this.hopT >= 0 || this.waveT >= 0
  }
  /** Where a finger finds it. */
  center(out: Vector3) {
    return this.root.localToWorld(out.set(0, this.height * 0.55, 0))
  }
  /** Which way is up for it, in the world (to know if it faces her). */
  up(out: Vector3) {
    return out.copy(UP).applyQuaternion(this.root.getWorldQuaternion(tq))
  }

  update(dt: number, t: number, cam: Vector3) {
    // Turn to look at her.
    this.root.worldToLocal(tmp.copy(cam))
    let d = Math.atan2(tmp.x, tmp.z) - this.face
    d = Math.atan2(Math.sin(d), Math.cos(d))
    this.face += d * (1 - Math.exp(-dt * 5))
    this.body.rotation.y = this.face
    // A hop: crouch, up, land with a squash, settle.
    let y = 0
    let sq = 0
    if (this.hopT >= 0) {
      this.hopT += dt
      const p = this.hopT / HOP_S
      if (p >= 1) this.hopT = -1
      else {
        const air = span(p, 0.18, 0.78)
        y = bell(air) * this.height * 0.5
        sq = p < 0.18 ? bell(p / 0.36) * 0.22 : p > 0.78 ? bell((p - 0.78) / 0.44) * 0.18 : -0.1 * bell(air)
      }
    }
    const breathe = 0.025 * Math.sin(t * 2.6 + this.phase)
    this.body.position.y = y
    this.body.scale.set(1 + sq * 0.6, 1 - sq + breathe, 1 + sq * 0.6)
    // Waving both arms (or flippers), then back down.
    if (this.waveT >= 0) {
      this.waveT += dt
      if (this.waveT > WAVE_S) this.waveT = -1
    }
    const w = this.waveT >= 0 ? bell(this.waveT / WAVE_S) : 0
    this.arms.forEach((a, i) => (a.rotation.z = (i ? -1 : 1) * (0.25 + w * (1.9 + 0.45 * Math.sin(this.waveT * 16)))))
  }
}
const HOP_S = 0.7
const WAVE_S = 1.6

interface Floe {
  o: Group
  dir: Vector3
  base: Quaternion
  phase: number
  /** How far into summer it melts (outer floes go first). */
  melt: number
}

export class PolesGlobe implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private mats: ReturnType<typeof globeMaterials>
  /** Turns the whole world about her line of sight: half a turn once she settles on the south, so Antarctica comes up
   *  to the top of the screen like the Arctic does (and the penguins stand up instead of hanging under the globe). */
  private roll = new Group()
  private rolled = 0
  private tilt = new Group()
  private spin = new Group()
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private lastTouch = 0
  private touches = 0
  private anchorEls = new Map<string, HTMLElement>()
  private raycaster = new Raycaster()
  private unwatch: () => void

  // ---- The globe: pitch (which pole faces her) and yaw (the Earth's own spin), in radians.
  private pitch = 0
  private pitchVel = 0
  private rest = 0
  /** While she drags: where her finger has pulled it (before the rubber band). */
  private pulled = 0
  private yaw = 0
  private spinVel = 0
  private quarter = 0
  private side: Side = 'middle'
  private visited = new Set<Side>()
  private wobbleT = -1
  private inviteAt = INVITE_S

  // ---- Her finger.
  private grab: 'globe' | 'sun' | 'lost' | null = null
  private down = { x: 0, y: 0 }
  private last = { x: 0, y: 0, t: 0 }
  private vYaw = 0
  private vPitch = 0
  private fingerVy = 0

  // ---- The sun: declination (radians, + = shining on the north), and the seasons catching up with it (-1..1).
  private sunOut = false
  private sunT = 0
  private sunJiggle = -1
  private sunDragged = false
  private decl = 0
  private declGoal = 0
  private note = -1
  private season = 0
  private summer: Side = 'middle'
  private sunGroup = new Group()
  private sunFace = new Group()
  private rays = new Group()
  private revealIn = -1
  /** 0 = the friendly front light of step 1, 1 = the sun is the light. */
  private sunLight = 0

  // ---- What's on the globe.
  private floesN: Floe[] = []
  private floesS: Floe[] = []
  private capN!: Group
  private pola: Critter
  private pebble: Critter
  private starsN: Sprite[] = []
  private starsS: Sprite[] = []
  private starMatN: SpriteMaterial
  private starMatS: SpriteMaterial
  private auroraN: ShaderMaterial
  private auroraS: ShaderMaterial
  /** A tap on the night sky: the lights flare up and ripple faster for a moment. */
  private flare = { n: 0, s: 0, tN: 0, tS: 0 }
  private bg = BG.middle.clone()
  /** Step 3 and the pokes (extras.ts). */
  private extras: GlobeExtras

  constructor(
    private renderer: WebGLRenderer,
    start: GlobeStart,
    private events: GlobeEvents,
  ) {
    this.scene.background = this.bg
    this.rig.fov = 32
    this.rig.lag = 0.55
    this.mats = this.bag.add(globeMaterials(this.bag.add(earthTexture())))
    this.scene.add(this.roll)
    this.roll.add(this.tilt)
    this.tilt.add(this.spin)

    const sphere = this.bag.add(new SphereGeometry(1, 96, 64))
    const hull = makeHull(sphere, 3)
    this.bag.add(hull.geometry)
    this.spin.add(new Mesh(sphere, this.mats.land), hull)

    this.buildNorth()
    this.buildSouth()
    this.pola = this.makePola()
    this.pebble = this.makePebble()
    standOn(this.pola.root, 85, -95, 1.022)
    standOn(this.pebble.root, -81, -60, domeR(9) - 0.002)
    this.spin.add(this.pola.root, this.pebble.root)
    ;[this.starMatN, this.starsN] = this.makeStars(1)
    ;[this.starMatS, this.starsS] = this.makeStars(-1)
    this.auroraN = this.makeAurora(1, '#8FE3C8', '#FF8FB8')
    this.auroraS = this.makeAurora(-1, '#8FE3C8', '#B9A6F5')
    this.makeSun()
    this.extras = new GlobeExtras(
      {
        bag: this.bag,
        spin: this.spin,
        world: this.scene,
        camera: this.rig.camera,
        prop: (g, px) => this.prop(g, px),
        make: (kind) => (kind === 'bear' ? this.makePola() : this.makePebble()),
        friend: (kind) => (kind === 'bear' ? this.pola : this.pebble),
        ground: (lat) => (lat < 0 ? domeR(90 + lat) : 1.022),
        show: (pole) => {
          if (this.grab !== 'globe') this.rest = this.restFor(pole ?? 'middle')
        },
        lost: (kind) => this.events.lost(kind),
        saved: (kind, home) => this.events.saved(kind, home),
      },
      start.lost,
    )

    // Where the link starts.
    this.side = start.side
    if (start.side !== 'middle') this.visited.add(start.side)
    this.rest = this.pitch = this.restFor(start.side)
    this.rolled = start.side === 'south' ? Math.PI : 0
    this.roll.rotation.z = this.rolled
    this.sunOut = start.sun
    this.sunT = start.sun ? 9 : 0
    this.sunLight = start.sun ? 1 : 0
    // (Starting with a lost one: the sun has been dragged already.)
    this.sunDragged = !!start.lost
    const tilt = SUN.tilt * DEG
    this.decl = this.declGoal = start.summer === 'north' ? tilt : start.summer === 'south' ? -tilt : 0
    this.season = this.decl / tilt
    this.summer = start.summer
    this.applySeason()

    // The feel lab's graph: her finger up and down, the tilt it makes, the spin and the sun.
    this.unwatch = watch('globe', () => ({
      'finger up/down (px/s)': [this.fingerVy, 2500],
      'tilt (°)': [this.pitch / DEG, 90],
      'spin (rad/s)': [this.grab === 'globe' ? this.vYaw : this.spinVel, SPIN.maxSpin],
      'sun (°)': [this.decl / DEG, 45],
    }))
  }

  // ---------------------------------------------------------------- building

  /** A shape in the globe's light (the shared vertex-color material), with an ink outline `px` wide. */
  private prop(geometry: BufferGeometry, px = 2) {
    const g = new Group()
    g.add(new Mesh(this.bag.add(geometry), this.mats.props))
    if (px > 0) {
      const hull = makeHull(geometry, px)
      this.bag.add(hull.geometry)
      g.add(hull)
    }
    return g
  }

  /** The Arctic: a thin sheet of sea ice floating on the ocean, broken into floes round its edge. */
  private buildNorth() {
    this.capN = this.prop(bake(cap(13, () => 1.022, 0.996), ICE), 2.5)
    this.spin.add(this.capN)
    const r = rng(7)
    const n = 18
    for (let i = 0; i < n; i++) {
      const fromPole = 14.5 + r() * 6
      const size = 0.035 + r() * 0.03
      const o = this.prop(bake(new CylinderGeometry(size, size, 0.02, 7), ICE, { scale: [1, 1, 0.65 + r() * 0.5], rot: [0, r() * 3, 0] }), 1.5)
      standOn(o, 90 - fromPole, (360 * i) / n + r() * 12, 1.004)
      this.spin.add(o)
      this.floesN.push({ o, dir: o.position.clone().normalize(), base: o.quaternion.clone(), phase: r() * 6, melt: 0.15 + 0.7 * (1 - (fromPole - 14.5) / 6) })
    }
  }

  /** Antarctica: a high dome of ice on land, with mountains and the peninsula, ringed by sea ice that comes and goes. */
  private buildSouth() {
    const south = (lat: number, lon: number) => ll(lat, lon, 1)
    const parts = [
      bake(cap(DOME_DEG, domeR, 0.99), LAND_ICE, { rot: [Math.PI, 0, 0] }),
      // East Antarctica bulges out further, and the peninsula reaches toward South America.
      bake(cap(13, (d) => 1 + 0.05 * Math.cos(Math.min(d / 13, 1) * (Math.PI / 2)) ** 2, 0.99), LAND_ICE, { rot: upTo(south(-73, 80)) }),
      bake(cap(5, (d) => 1 + 0.03 * Math.cos(Math.min(d / 5, 1) * (Math.PI / 2)) ** 2, 0.99), LAND_ICE, { rot: upTo(south(-67, -62)) }),
      bake(cap(4, (d) => 1 + 0.025 * Math.cos(Math.min(d / 4, 1) * (Math.PI / 2)) ** 2, 0.99), LAND_ICE, { rot: upTo(south(-71, -66)) }),
    ]
    // The Transantarctic Mountains, across the middle.
    for (const [lat, lon, s] of [[-84, -170, 1], [-85, 175, 1.2], [-83, 160, 0.9], [-80, 155, 1.1], [-86, -150, 0.8], [-78, 162, 0.8], [-82, -175, 0.7]] as const) {
      const fromPole = 90 + lat
      const dir = south(lat, lon)
      const at = dir.clone().multiplyScalar(domeR(fromPole) - 0.004)
      const h = 0.07 * s
      const up = upTo(dir)
      parts.push(bake(P.cone(0.032 * s, h, '#FFFFFF').translate(0, h / 2, 0), '#FFFFFF', { at: [at.x, at.y, at.z], rot: up }))
    }
    this.spin.add(this.prop(merge(parts), 2.5))
    const r = rng(11)
    const n = 24
    for (let i = 0; i < n; i++) {
      const fromPole = 23.5 + r() * 5
      const size = 0.035 + r() * 0.03
      const o = this.prop(bake(new CylinderGeometry(size, size, 0.02, 7), ICE, { scale: [1, 1, 0.65 + r() * 0.5], rot: [0, r() * 3, 0] }), 1.5)
      standOn(o, -90 + fromPole, (360 * i) / n + r() * 10, 1.004)
      this.spin.add(o)
      this.floesS.push({ o, dir: o.position.clone().normalize(), base: o.quaternion.clone(), phase: r() * 6, melt: 0.15 + 0.7 * (1 - (fromPole - 23.5) / 5) })
    }
  }

  private makePola() {
    const c = new Critter(0.17)
    const white = '#FFFFFF'
    c.body.add(
      this.prop(
        merge([
          P.sphere(0.055, white, { at: [0, 0.058, 0], scale: [1, 0.92, 1.12] }),
          P.sphere(0.042, white, { at: [0, 0.125, 0.035] }),
          P.sphere(0.014, white, { at: [0.029, 0.16, 0.028] }),
          P.sphere(0.014, white, { at: [-0.029, 0.16, 0.028] }),
          P.sphere(0.018, '#FFF7F0', { at: [0, 0.114, 0.072], scale: [1, 0.8, 1] }),
          P.sphere(0.008, PAL.ink, { at: [0, 0.121, 0.089] }),
          P.sphere(0.0065, PAL.ink, { at: [0.017, 0.137, 0.07] }),
          P.sphere(0.0065, PAL.ink, { at: [-0.017, 0.137, 0.07] }),
          P.capsule(0.016, 0.01, white, { at: [0.03, 0.018, 0.022] }),
          P.capsule(0.016, 0.01, white, { at: [-0.03, 0.018, 0.022] }),
        ]),
        2,
      ),
    )
    for (const x of [0.05, -0.05]) {
      const arm = new Group()
      arm.position.set(x, 0.085, 0.02)
      arm.add(this.prop(P.capsule(0.014, 0.03, white, { at: [0, -0.026, 0] }), 1.5))
      c.body.add(arm)
      c.arms.push(arm)
    }
    return c
  }

  private makePebble() {
    const c = new Critter(0.155)
    const dark = '#3A3550'
    c.body.add(
      this.prop(
        merge([
          P.sphere(0.05, '#B9B4C9', { at: [0, 0.06, 0], scale: [1, 1.15, 0.95] }),
          P.sphere(0.04, dark, { at: [0, 0.125, 0.005] }),
          P.sphere(0.03, '#FFFFFF', { at: [0, 0.122, 0.026], scale: [1.05, 0.85, 0.6] }),
          P.sphere(0.006, PAL.ink, { at: [0.012, 0.128, 0.05] }),
          P.sphere(0.006, PAL.ink, { at: [-0.012, 0.128, 0.05] }),
          P.cone(0.008, 0.022, dark, { at: [0, 0.115, 0.06], rot: [Math.PI / 2, 0, 0] }),
          P.sphere(0.012, '#6F6A80', { at: [0.018, 0.006, 0.02], scale: [1, 0.5, 1.5] }),
          P.sphere(0.012, '#6F6A80', { at: [-0.018, 0.006, 0.02], scale: [1, 0.5, 1.5] }),
        ]),
        2,
      ),
    )
    for (const x of [0.046, -0.046]) {
      const arm = new Group()
      arm.position.set(x, 0.088, 0)
      arm.add(this.prop(P.capsule(0.01, 0.035, '#8F8AA3', { at: [0, -0.026, 0] }), 1.5))
      c.body.add(arm)
      c.arms.push(arm)
    }
    return c
  }

  /** Stars over one pole (`y` = 1 north, -1 south), shown when it's night there. */
  private makeStars(y: 1 | -1): [SpriteMaterial, Sprite[]] {
    const mat = this.bag.add(new SpriteMaterial({ map: this.bag.add(starTexture()), transparent: true, depthWrite: false, opacity: 0 }))
    const r = rng(y > 0 ? 3 : 5)
    const out: Sprite[] = []
    for (let i = 0; i < 16; i++) {
      const s = new Sprite(mat)
      ll(y * (48 + r() * 34), r() * 360, 1.18 + r() * 0.28, s.position)
      s.userData.size = 0.045 + r() * 0.035
      s.userData.phase = r() * 6
      s.visible = false
      this.tilt.add(s)
      out.push(s)
    }
    return [mat, out]
  }

  /** The northern (or southern) lights: a ribbon round the pole that ripples, shown when it's night there. */
  private makeAurora(y: 1 | -1, low: string, high: string) {
    const mat = this.bag.add(
      new ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uLow: { value: new Color(low) }, uHigh: { value: new Color(high) } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform float uOpacity;
          uniform vec3 uLow;
          uniform vec3 uHigh;
          varying vec2 vUv;
          void main() {
            float ripple = 0.55 + 0.45 * sin(vUv.x * 31.4 + uTime * 1.7) * sin(vUv.x * 12.6 - uTime * 0.9);
            float edge = smoothstep(0.0, 0.3, vUv.y) * (1.0 - smoothstep(0.6, 1.0, vUv.y));
            gl_FragColor = vec4(mix(uLow, uHigh, vUv.y), uOpacity * ripple * edge * 0.8);
            #include <colorspace_fragment>
          }
        `,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
      }),
    )
    const ring = new Mesh(this.bag.add(new CylinderGeometry(0.52, 0.43, 0.18, 64, 1, true)), mat)
    ring.position.y = y * 0.97
    if (y < 0) ring.rotation.x = Math.PI
    this.tilt.add(ring)
    return mat
  }

  /** The sun: a big butter ball with rays, always turned to face her. */
  private makeSun() {
    const ball = this.bag.add(new SphereGeometry(0.2, 32, 20))
    const hull = makeHull(ball, 3)
    this.bag.add(hull.geometry)
    const yellow = this.bag.add(new MeshBasicMaterial({ color: '#FFD84D' }))
    const rays: BufferGeometry[] = []
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2
      rays.push(P.cone(0.045, 0.1, PAL.gold, { at: [Math.cos(a) * 0.29, Math.sin(a) * 0.29, -0.02], rot: [0, 0, a - Math.PI / 2] }))
    }
    const rayGeo = this.bag.add(merge(rays))
    const rayHull = makeHull(rayGeo, 2)
    this.bag.add(rayHull.geometry)
    this.rays.add(new Mesh(rayGeo, this.bag.add(new MeshBasicMaterial({ vertexColors: true }))), rayHull)
    const halo = new Sprite(this.bag.add(new SpriteMaterial({ map: this.bag.add(haloTexture()), transparent: true, depthWrite: false })))
    halo.scale.setScalar(1.1)
    halo.position.z = -0.05
    this.sunFace.add(halo, this.rays)
    this.sunGroup.add(this.sunFace, new Mesh(ball, yellow), hull)
    this.sunGroup.visible = false
    this.tilt.add(this.sunGroup)
  }

  // ---------------------------------------------------------------- the camera

  // (Shallow boxes: the globe's round, so only its outline has to fit. Room at the bottom for the line that says where
  // she is.) A pole is always framed at the top of the screen: the south gets there by the world's roll. `withSun` is
  // the globe and the sun's whole path beside it; set for the screen's shape in setSize.
  private shots = {
    middle: { center: new Vector3(0, -0.08, 0), half: new Vector3(1.04, 1.24, 0.2), yaw: 0, pitch: 4 },
    withSun: { center: new Vector3(0.48, -0.08, 0.2), half: new Vector3(1.5, 1.24, 0.2), yaw: 0, pitch: 4 },
    pole: { center: new Vector3(0, 0.62, 0.3), half: new Vector3(0.8, 0.46, 0.3), yaw: 0, pitch: 6 },
  } satisfies Record<string, Shot>

  private get sunD() {
    return this.tall ? SUN_D.tall : SUN_D.wide
  }

  private shot(): Shot {
    if (this.side === 'middle') return this.sunOut ? this.shots.withSun : this.shots.middle
    return this.shots.pole
  }

  /** The globe's resting tilt for a side. */
  private restFor(s: Side) {
    return s === 'north' ? SPIN.poleView * DEG : s === 'south' ? -SPIN.poleView * DEG : 0
  }

  // ---------------------------------------------------------------- World3D

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.tall = h > w
    // The sun's right edge (its rays) and the globe's left edge.
    const right = this.sunD * Math.cos(SUN_TOWARD) + 0.32
    this.shots.withSun.center.x = (right - 1.04) / 2
    this.shots.withSun.half.x = (right + 1.04) / 2
    // A tall screen gets closer to the pole (the wide box would make it tiny).
    this.shots.pole.center.y = this.tall ? 0.68 : 0.62
    this.shots.pole.half.set(this.tall ? 0.52 : 0.8, this.tall ? 0.42 : 0.46, 0.3)
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
    this.rig.setShot(this.shot(), true)
  }

  setAnchorElements(els: Map<string, HTMLElement>) {
    this.anchorEls = els
  }

  get calm() {
    return !this.grab && Math.abs(this.spinVel) < 0.02 && Math.abs(this.pitchVel) < 0.01 && Math.abs(this.roll.rotation.z - (this.side === 'south' ? Math.PI : 0)) < 0.01 && !this.pola.busy && !this.pebble.busy && !this.extras.busy && (!this.sunOut || this.sunT > 2)
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.updateGlobe(dt)
    this.updateSide()
    this.updateSun(dt)
    this.applySeason(dt)

    const cam = this.rig.camera.position
    this.pola.update(dt, t, cam)
    this.pebble.update(dt, t, cam)
    this.bobFloes(this.floesN, t)
    this.bobFloes(this.floesS, t)
    for (const [stars, mat] of [[this.starsN, this.starMatN], [this.starsS, this.starMatS]] as const) {
      for (const s of stars) {
        s.visible = mat.opacity > 0.01
        s.scale.setScalar(s.userData.size * (1 + 0.25 * Math.sin(t * 3 + s.userData.phase)))
      }
    }
    this.extras.tick(dt, t, this.side)
    const f = this.flare
    f.n = Math.max(0, f.n - dt * 0.6)
    f.s = Math.max(0, f.s - dt * 0.6)
    f.tN += dt * (1 + 3 * f.n)
    f.tS += dt * (1 + 3 * f.s)
    this.auroraN.uniforms.uTime.value = f.tN
    this.auroraS.uniforms.uTime.value = f.tS
    this.auroraN.uniforms.uOpacity.value = this.nightN * (1 + 0.8 * f.n)
    this.auroraS.uniforms.uOpacity.value = this.nightS * (1 + 0.8 * f.s)

    // The sky: the side's pastel, fading toward night when the pole in front of her is in the dark.
    const night = this.side === 'north' ? this.nightN : this.side === 'south' ? this.nightS : 0
    this.bg.lerp(skyGoal.copy(BG[this.side]).lerp(BG.night, night * 0.8), 1 - Math.exp(-dt * 3))

    this.rig.setShot(this.shot())
    this.rig.update(dt)
  }

  private updateGlobe(dt: number) {
    // The Earth's own slow turn, and a flick's spin dying away.
    if (this.grab !== 'globe') {
      this.yaw += (this.spinVel + SPIN.idle) * dt
      this.spinVel *= Math.exp(-dt / Math.max(0.05, SPIN.coast))
      // A critically damped spring to where it settles.
      const k = SPIN.settle
      this.pitchVel += (k * k * (this.rest - this.pitch) - 2 * k * this.pitchVel) * dt
      this.pitch += this.pitchVel * dt
    }
    this.pitch = clamp(this.pitch, -PITCH_MAX - 25 * DEG, PITCH_MAX + 25 * DEG)
    // A whoosh each quarter turn of a fast spin.
    const q = Math.floor(this.yaw / (Math.PI / 2))
    if (q !== this.quarter) {
      this.quarter = q
      if (Math.abs(this.spinVel) > 2.5) sfx.fwip()
    }
    // A tap: a little squash. Left alone a while: a nudge that says "grab me".
    let s = 1
    if (this.wobbleT >= 0) {
      this.wobbleT += dt
      s = 1 + 0.045 * wobble(this.wobbleT / 0.6, 2)
      if (this.wobbleT > 0.6) this.wobbleT = -1
    }
    this.spin.scale.setScalar(s)
    if (!this.grab && this.time - this.lastTouch > this.inviteAt && (!this.sunOut || this.sunDragged) && !this.extras.active) {
      this.inviteAt = this.time - this.lastTouch + INVITE_S
      this.pitchVel += (this.side === 'north' ? -1 : 1) * 1.6
    }
    // The roll waits while she holds the globe, so it never turns the other way under her finger.
    if (this.grab !== 'globe') this.rolled += ((this.side === 'south' ? Math.PI : 0) - this.rolled) * (1 - Math.exp(-dt * 5))
    this.roll.rotation.z = this.rolled
    this.tilt.rotation.x = this.pitch
    this.spin.rotation.y = this.yaw
  }

  /** Which pole faces her, with a gap between coming and going so it doesn't flicker. */
  private updateSide() {
    const pv = SPIN.poleView * DEG
    const on = pv * 0.55
    const off = pv * 0.3
    let s = this.side
    if (this.pitch > on) s = 'north'
    else if (this.pitch < -on) s = 'south'
    else if (Math.abs(this.pitch) < off) s = 'middle'
    if (s === this.side) return
    this.side = s
    sounds.whoosh()
    if (s !== 'middle') {
      this.visited.add(s)
      ;(s === 'north' ? this.pola : this.pebble).hop(true)
    }
    this.events.side(s)
  }

  private updateSun(dt: number) {
    // Step 2 starts once she has seen both poles and comes back to the middle (or after a long while anyway).
    if (!this.sunOut) {
      if (this.revealIn < 0 && ((this.visited.has('north') && this.visited.has('south') && this.side === 'middle') || this.time > 60)) this.revealIn = 0.8
      if (this.revealIn >= 0 && (this.revealIn -= dt) < 0) this.showSun()
    }
    this.sunGroup.visible = this.sunOut
    if (!this.sunOut) return
    this.sunT += dt
    this.sunLight = Math.min(1, this.sunLight + dt / 1.2)
    const tilt = SUN.tilt * DEG
    if (this.grab !== 'sun') this.declGoal = clamp(this.declGoal, -tilt, tilt)
    this.decl += (this.declGoal - this.decl) * (SUN.follow > 0 ? 1 - Math.exp(-dt / SUN.follow) : 1)
    this.sunGroup.position.set(this.sunD * Math.cos(this.decl) * Math.cos(SUN_TOWARD), this.sunD * Math.sin(this.decl), this.sunD * Math.cos(this.decl) * Math.sin(SUN_TOWARD))
    // Pops in with a wobble; jiggles when tapped; bobs to say "drag me" until she has.
    const t = this.sunT
    let s = t < 0.4 ? smooth(t / 0.4) * 1.15 : 1 + 0.15 * wobble((t - 0.4) / 0.8, 2)
    if (this.sunJiggle >= 0) {
      this.sunJiggle += dt
      s *= 1 + 0.18 * wobble(this.sunJiggle / 0.6, 2)
      if (this.sunJiggle > 0.6) this.sunJiggle = -1
    }
    if (!this.sunDragged && t > 1.2) s *= 1 + 0.06 * Math.sin(t * 4)
    this.sunGroup.scale.setScalar(Math.max(0.001, s))
    this.rays.rotation.z = this.time * 0.35
    // Its rays and glow face her (the ball looks the same from anywhere).
    this.tilt.getWorldQuaternion(tq)
    this.sunFace.quaternion.copy(tq.invert()).multiply(this.rig.camera.quaternion)
    // A happy note at each step of the sun's way up or down.
    const step = Math.round((this.decl / tilt + 1) * 4)
    if (this.grab === 'sun' && step !== this.note && this.note >= 0) sounds.note(step)
    this.note = step
  }

  private showSun() {
    this.sunOut = true
    this.sunT = 0
    sounds.sparkle()
    this.events.sunOut()
  }

  // The seasons follow the sun (slowly: `SUN.season`).
  private nightN = 0
  private nightS = 0
  private applySeason(dt = 1 / 60) {
    const tilt = SUN.tilt * DEG
    const goal = clamp(this.decl / tilt, -1, 1)
    this.season += (goal - this.season) * (1 - Math.exp(-dt / Math.max(0.05, SUN.season)))
    const s = this.season
    const meltN = clamp(s, 0, 1)
    const meltS = clamp(-s, 0, 1)
    this.nightN = this.sunOut ? smooth(clamp(-s * 1.4, 0, 1)) : 0
    this.nightS = this.sunOut ? smooth(clamp(s * 1.4, 0, 1)) : 0
    // The snow line climbs toward the pole in its summer, and comes down in its winter.
    this.mats.snow.north.value = 62 + 12 * s
    this.mats.snow.south.value = 62 - 12 * s
    this.capN.scale.set(1 - 0.18 * smooth(meltN), 1, 1 - 0.18 * smooth(meltN))
    this.melt(this.floesN, meltN)
    this.melt(this.floesS, meltS)
    this.starMatN.opacity = this.nightN
    this.starMatS.opacity = this.nightS
    this.auroraN.uniforms.uOpacity.value = this.nightN
    this.auroraS.uniforms.uOpacity.value = this.nightS
    this.auroraN.visible = this.nightN > 0.01
    this.auroraS.visible = this.nightS > 0.01
    // The light: a friendly light from her side until the sun comes out, then the sun's.
    const cam = this.rig.camera
    const front = tmp.copy(cam.position).normalize().addScaledVector(tmp2.set(1, 0, 0).applyQuaternion(cam.quaternion), 0.4).addScaledVector(UP, 0.25).normalize()
    this.sunGroup.getWorldPosition(tmp2)
    this.mats.sun.copy(front).lerp(tmp2.normalize(), this.sunOut ? smooth(this.sunLight) : 0).normalize()
    // Summer changed: say so to the screen around (with a gap so it doesn't flicker).
    const summer: Side = s > 0.4 ? 'north' : s < -0.4 ? 'south' : Math.abs(s) < 0.15 ? 'middle' : this.summer
    if (summer !== this.summer) {
      this.summer = summer
      if (summer === 'middle') tone(520, 660, 0.25, 0.06, 'triangle')
      else sounds.sparkle()
      this.events.summer(summer)
    }
  }

  private melt(floes: Floe[], melt: number) {
    for (const f of floes) {
      const k = 1 - smooth(span(melt, f.melt - 0.12, f.melt + 0.12))
      f.o.visible = k > 0.02
      f.o.scale.setScalar(Math.max(0.02, k))
      f.o.userData.k = k
    }
  }

  private bobFloes(floes: Floe[], t: number) {
    for (const f of floes) {
      if (!f.o.visible) continue
      const k = f.o.userData.k ?? 1
      f.o.position.copy(f.dir).multiplyScalar(1.004 + 0.004 * Math.sin(t * 1.4 + f.phase) - 0.012 * (1 - k))
      tq2.setFromAxisAngle(tmp.set(1, 0, 0), 0.08 * Math.sin(t * 1.1 + f.phase * 2))
      f.o.quaternion.copy(f.base).multiply(tq2)
    }
  }

  render() {
    this.renderer.render(this.scene, this.rig.camera)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  // ---------------------------------------------------------------- her finger

  /** The globe's middle on screen and its radius in pixels. */
  private globeOnScreen() {
    const cam = this.rig.camera
    const c = this.toScreen(tmp.set(0, 0, 0))
    const e = this.toScreen(tmp.set(1, 0, 0).applyQuaternion(cam.quaternion))
    return { x: c.x, y: c.y, r: Math.max(1, Math.hypot(e.x - c.x, e.y - c.y)) }
  }

  private toScreen(v: Vector3) {
    const p = v.clone().project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }

  private nearSun(x: number, y: number) {
    if (!this.sunOut) return false
    const s = this.toScreen(this.sunGroup.getWorldPosition(tmp))
    return Math.hypot(x - s.x, y - s.y) < Math.max(70, this.globeOnScreen().r * 0.4)
  }

  pointerDown(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.inviteAt = INVITE_S
    this.last = { x, y, t: performance.now() }
    this.vYaw = this.vPitch = this.fingerVy = 0
    this.down = { x, y }
    const g = this.globeOnScreen()
    if (id === 'lost' && this.extras.grab()) {
      this.grab = 'lost'
      // Back to the whole globe, so both poles are in sight while she carries it.
      this.rest = 0
      this.spinVel = 0
    } else if (id === 'sun' || (!id && this.nearSun(x, y))) {
      this.grab = 'sun'
      this.sunDragged = true
      // Back to the whole globe, so she sees both poles while she moves the sun.
      this.rest = 0
      sounds.pickup()
    } else if (id === 'globe' || id === 'pola' || id === 'pebble' || (id && POKES.has(id)) || (!id && Math.hypot(x - g.x, y - g.y) < g.r * 1.15)) {
      this.grab = 'globe'
      this.pulled = this.pitch
      this.spinVel = 0
      this.pitchVel = 0
    } else this.grab = null
  }

  pointerMove(x: number, y: number, _dx: number, _dy: number, held: boolean) {
    if (!held || !this.grab) return
    const now = performance.now()
    const dt = Math.max(1, now - this.last.t) / 1000
    const mx = x - this.last.x
    const my = y - this.last.y
    this.last = { x, y, t: now }
    const smoothing = SPIN.flick > 0 ? 1 - Math.exp(-dt / SPIN.flick) : 1
    this.fingerVy += (my / dt - this.fingerVy) * smoothing
    if (this.grab === 'sun') return this.dragSun(x, y)
    if (this.grab === 'lost') return this.extras.drag(this.inFront(x, y), Math.hypot(x - this.down.x, y - this.down.y) > 14)
    // The spot under her finger follows it (at grip 1): a move of one globe-radius turns it by one radian.
    // (Rolled upside down for the south: the same finger moves turn it the other way.)
    const k = (Math.cos(this.rolled) * SPIN.grip) / this.globeOnScreen().r
    const yawStep = mx * k
    const pitchStep = my * k
    this.yaw += yawStep
    this.pulled += pitchStep
    const before = this.pitch
    // Past straight down on a pole, a rubber band.
    const a = Math.abs(this.pulled)
    this.pitch = Math.sign(this.pulled) * (a <= PITCH_MAX ? a : PITCH_MAX + Math.min(25 * DEG, (a - PITCH_MAX) * SPIN.stretch))
    this.vYaw += (yawStep / dt - this.vYaw) * smoothing
    this.vPitch += ((this.pitch - before) / dt - this.vPitch) * smoothing
  }

  /** The sun goes where her finger is, up and down its path (the Earth's tilt at most, with a little give past it). */
  private dragSun(x: number, y: number) {
    const cam = this.rig.camera
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), cam)
    const at = this.sunGroup.getWorldPosition(new Vector3())
    const plane = new Plane().setFromNormalAndCoplanarPoint(cam.getWorldDirection(new Vector3()), at)
    const hit = this.raycaster.ray.intersectPlane(plane, new Vector3())
    if (!hit) return
    this.tilt.worldToLocal(hit)
    const tilt = SUN.tilt * DEG
    let d = Math.asin(clamp(hit.y / this.sunD, -1, 1))
    if (Math.abs(d) > tilt) d = Math.sign(d) * (tilt + Math.min(6 * DEG, (Math.abs(d) - tilt) * 0.25))
    this.declGoal = d
  }

  /** The point under her finger just in front of the globe (where a carried thing goes). */
  private inFront(x: number, y: number) {
    const cam = this.rig.camera
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), cam)
    const plane = new Plane().setFromNormalAndCoplanarPoint(cam.getWorldDirection(new Vector3()), tmp.copy(cam.position).normalize().multiplyScalar(1.1))
    return this.raycaster.ray.intersectPlane(plane, new Vector3()) ?? tmp.set(0, 0, 1.1)
  }

  pointerUp() {
    const grab = this.grab
    this.grab = null
    if (grab === 'sun') this.extras.begin()
    if (grab === 'lost') {
      // Over the top of the globe: the north. Over the bottom: the south. (Upside down when the world is rolled.)
      const g = this.globeOnScreen()
      const dy = ((this.last.y - g.y) / g.r) * Math.sign(Math.cos(this.rolled) || 1)
      this.extras.drop(dy < -0.45 ? 'north' : dy > 0.45 ? 'south' : null)
    }
    if (grab !== 'globe') return
    // A finger that stopped before letting go doesn't flick.
    if (performance.now() - this.last.t > 90) this.vYaw = this.vPitch = 0
    const max = SPIN.maxSpin
    this.spinVel = clamp(this.vYaw, -max, max)
    this.pitchVel = clamp(this.vPitch, -max, max)
    // It settles on whichever view the flick carries it nearest to.
    const ahead = this.pitch + this.pitchVel * SPIN.reach
    const pv = SPIN.poleView * DEG
    this.rest = ahead > pv / 2 ? pv : ahead < -pv / 2 ? -pv : 0
  }

  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.touches++
    const hit = id ?? (this.nearSun(x, y) ? 'sun' : Math.hypot(x - this.globeOnScreen().x, y - this.globeOnScreen().y) < this.globeOnScreen().r ? 'globe' : null)
    if (hit && POKES.has(hit)) this.extras.poke(hit as PokeId)
    else if (hit === 'pola') this.pola.hop(true)
    else if (hit === 'pebble') this.pebble.hop(true)
    else if (hit === 'sun') {
      this.sunJiggle = 0
      sounds.sparkle()
    } else if (hit === 'globe') {
      this.wobbleT = 0
      sfx.pop()
    } else this.skyTap(x, y)
  }

  /** A tap on the empty sky: snowflakes burst, and on a pole's night the lights flare up. */
  private skyTap(x: number, y: number) {
    this.extras.snow(this.inFront(x, y))
    const night = this.side === 'north' ? this.nightN : this.side === 'south' ? this.nightS : 0
    if (night > 0.4) {
      if (this.side === 'north') this.flare.n = 1
      else this.flare.s = 1
      ;[0, 0.12, 0.24].forEach((d, i) => tone(660 * 1.25 ** i, 660 * 1.25 ** i, 0.5, 0.045, 'sine', d))
    }
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const g = this.globeOnScreen()
    const cam = this.rig.camera.position
    for (const [id, el] of this.anchorEls) {
      let spot: { x: number; y: number; size: number; z: number; glow?: boolean } | null = null
      if (id === 'globe') spot = { x: g.x, y: g.y, size: Math.max(min, g.r * 2.04), z: 1 }
      else if (id === 'sun' && this.sunOut && this.sunT > 0.3) {
        const s = this.toScreen(this.sunGroup.getWorldPosition(tmp))
        if (s.z < 1) spot = { x: s.x, y: s.y, size: Math.max(min, g.r * 0.62), z: 9000, glow: !this.sunDragged }
      } else if (POKES.has(id)) {
        const s = this.extras.spot(id as PokeId, tmp)
        if (s && s.facing > 0.2) {
          const p = this.toScreen(tmp)
          // Above the globe and the friends (the lost one most of all: it's the thing to do).
          if (p.z < 1) spot = { x: p.x, y: p.y, size: Math.max(min, g.r * s.size), z: id === 'lost' ? 9500 : 6000, glow: id === 'lost' }
        }
      } else if (id === 'pola' || id === 'pebble') {
        const c = id === 'pola' ? this.pola : this.pebble
        const at = c.center(tmp)
        // Only when it stands on the side of the globe facing her.
        const facing = c.up(tmp2).dot(toCam.subVectors(cam, at).normalize())
        const s = this.toScreen(at)
        if (facing > 0.2 && s.z < 1) spot = { x: s.x, y: s.y, size: Math.max(min, g.r * 0.3), z: 5000 }
      }
      const show = !!spot && spot.x > -spot.size / 2 && spot.x < this.w + spot.size / 2 && spot.y > -spot.size / 2 && spot.y < this.h + spot.size / 2
      if (show && spot) {
        el.style.transform = `translate3d(${(spot.x - spot.size / 2).toFixed(1)}px, ${(spot.y - spot.size / 2).toFixed(1)}px, 0)`
        el.style.width = el.style.height = `${spot.size.toFixed(0)}px`
        el.style.zIndex = String(spot.z)
        const shadow = spot.glow ? '0 0 0 6px rgba(255,79,154,.55), 0 0 26px 10px rgba(255,200,61,.7)' : ''
        if (el.style.boxShadow !== shadow) el.style.boxShadow = shadow
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    return {
      side: this.side,
      tilt: Math.round(this.pitch / DEG),
      spin: +this.spinVel.toFixed(2),
      grab: this.grab,
      visited: [...this.visited],
      sunOut: this.sunOut,
      sun: Math.round(this.decl / DEG),
      summer: this.summer,
      season: +this.season.toFixed(2),
      floesNorth: this.floesN.filter((f) => f.o.visible).length,
      floesSouth: this.floesS.filter((f) => f.o.visible).length,
      touches: this.touches,
      ...this.extras.qa(),
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

/** A five-point butter star with an ink line, for the night sky. */
function starTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  g.beginPath()
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 12 : 28
    const a = (Math.PI * i) / 5 - Math.PI / 2
    g.lineTo(32 + r * Math.cos(a), 32 + r * Math.sin(a))
  }
  g.closePath()
  g.fillStyle = '#FBEA9A'
  g.fill()
  g.lineWidth = 4
  g.lineJoin = 'round'
  g.strokeStyle = PAL.ink
  g.stroke()
  return new CanvasTexture(c)
}

/** The sun's soft glow. */
function haloTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,234,154,0.9)')
  grad.addColorStop(0.45, 'rgba(255,216,77,0.45)')
  grad.addColorStop(1, 'rgba(255,216,77,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  return new CanvasTexture(c)
}

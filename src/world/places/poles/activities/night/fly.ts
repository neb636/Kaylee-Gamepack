// Act 1 of the Poles' new ending, Hold to Fly (planning/around-the-world/poles-ending.md): she's the balloon's pilot,
// flying Pola and Pebble down the world from the Arctic to the long southern night.
//
// The toy (core verb): hold a finger down anywhere (click and hold on a Mac) and the burner roars, the air heats and
// the balloon rises; let go and it sinks slowly. It's fun with no goal: whoosh up, float down, skim the sea. The trick
// is a real one: a balloon can't steer, it finds a wind going the right way. Two winds blow at two heights, drawn as
// ribbons of streaks: the pink wind up high blows south fast (Terry rides it), the blue wind down low blows back north,
// so in it the balloon only creeps south. Go up to go fast.
// The world goes by from the side, left (north) to right (south), and gets richer three times (`leg`, a link each):
//   north  the Arctic by day: floes and bergs on the sea (a tall one to rise over: boing), Nari waves.
//   warm   the warm middle: the sea turns turquoise and Pola melts, palm islands (Terry says hello to the countries in
//          her passport), the red ship below ("That's how I got lost!"), a whale spouts, a thundercloud to rise over
//          or splash through ("A cool shower!").
//   south  the cold comes back, dusk, then the long night: huge flat bergs, an albatross, the southern lights. Then the
//          blizzard: gusts push the balloon down, so she holds harder, until the storm wins (the next film).
// Silly, never "oops": hold too long and the balloon pokes into the clouds ("It's all fluffy!"); let go too long and
// the basket dips in the sea ("Don't get me wet!"); bump a berg and it boings off.
// Never fails: the balloon always drifts south, only slowly in the blue wind, and the pink wind gets wider after a slow
// stretch. The landing in the storm is the story, not her mistake.
// Short (the user, 2026-11-16: "way too long and boring, shorten it by 75%"): she only flies until she has ridden the
// pink wind for a couple of seconds (`takeover`). Then the wind takes over like a film: her finger rests, the balloon
// holds the middle of the pink wind and races south (`cruise`) past the warm middle, the ship, the whale, the southern
// night and into the storm, with only the story's lines (Terry's hellos, the second facts and the storm's "hold on" are
// left out). About 45 s in all, where it was about three minutes.
//
// Built for engine3d/View3D.tsx. The balloon's feel is feel-lab knobs (?feel=1).
import { AdditiveBlending, Color, DoubleSide, Fog, Group, Mesh, MeshBasicMaterial, PlaneGeometry, Scene, ShaderMaterial, Sprite, SpriteMaterial, Vector3, type BufferGeometry, type WebGLRenderer } from 'three'
import { bell, clamp, type Line } from '../../../../../sdk'
import { smoothstep } from '../../../../../sdk/math'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../engine3d/camera'
import { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../engine3d/geo'
import { setOutlineResolution } from '../../../../engine3d/outline'
import { Particles } from '../../../../engine3d/particles'
import { applyBands, makeLights, PAL } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import { knobs, watch } from '../../../../kit/knobs'
import { L } from '../../lines'
import { dress } from '../../look/look'
import { mixSea, PolarSea, roundSkirt, SEA, type SeaColors } from '../../look/sea'
import { MOODS, PolarSky, type Mood } from '../../look/sky'
import { glowTexture, NOTE_COLORS, noteTexture } from '../../look/sprites'
import { Actor, openBeak } from '../../story/actor'
import { Aurora, Balloon, bergGeo, floeGeo, ICE_LINE, makeShip, Narwhal, rng, tableBergGeo } from '../../story/props'
import { Humpback } from '../slide/critters'
import { sing, TUNES } from '../party/sounds'
import type { TalkKind } from './chorus'
import { flySfx } from './sounds'

const FILE = 'src/world/places/poles/activities/night/fly.ts'
/** How the balloon flies (live in the feel lab: ?feel=1). Heights are the middle of the balloon over the sea. */
const FLY = knobs('balloon', 'Hold to Fly: the balloon', FILE, {
  lift: { value: 3.6, min: 0.5, max: 10, step: 0.1, label: 'Rise', unit: 'm/s', note: 'how fast the balloon climbs while she holds', main: true },
  sink: { value: 1.5, min: 0.3, max: 6, step: 0.1, label: 'Sink', unit: 'm/s', note: 'how fast it sinks when she lets go', main: true },
  ease: { value: 2.2, min: 0.5, max: 10, step: 0.1, label: 'Response', unit: '/s', note: 'how quickly it starts rising or sinking (low = heavy and floaty)', main: true },
  pink: { value: 7.5, min: 2, max: 20, step: 0.5, label: 'Pink wind (south)', unit: 'm/s', note: 'how fast the high pink wind carries it south', main: true },
  blue: { value: 1.6, min: 0, max: 6, step: 0.1, label: 'Blue wind (north)', unit: 'm/s', note: 'how fast the low blue streaks blow back north (drawn; the balloon still creeps south)' },
  crawl: { value: 1.4, min: 0.3, max: 5, step: 0.1, label: 'Slowest drift', unit: 'm/s', note: 'out of the pink wind it still creeps south this fast (it never stops)' },
  pinkLow: { value: 11, min: 6, max: 16, step: 0.25, label: 'Pink wind from', unit: 'm', note: 'the bottom of the pink wind' },
  pinkHigh: { value: 15, min: 8, max: 18, step: 0.25, label: 'Pink wind to', unit: 'm', note: 'the top of the pink wind' },
  blueLow: { value: 4.5, min: 3.5, max: 9, step: 0.25, label: 'Blue wind from', unit: 'm' },
  blueHigh: { value: 8.5, min: 5, max: 12, step: 0.25, label: 'Blue wind to', unit: 'm' },
  widen: { value: 1, min: 0, max: 3, step: 0.1, label: 'Help: pink widens', unit: 'm', note: 'after a slow stretch the pink wind grows this much wider downward (twice at most)', main: true },
  gust: { value: 3.2, min: 0, max: 8, step: 0.1, label: 'Blizzard gusts', unit: 'm/s', note: 'how hard a gust pushes the balloon down in the storm' },
  gustEvery: { value: 2.6, min: 0.8, max: 8, step: 0.1, label: 'Gust every', unit: 's' },
  takeover: { value: 2.5, min: 0.5, max: 10, step: 0.25, label: 'Pink wind, then the film', unit: 's', note: 'how long she rides the pink wind herself before the wind takes over and the rest plays like a film' },
  cruise: { value: 18, min: 6, max: 40, step: 0.5, label: 'Film speed south', unit: 'm/s', note: 'how fast the balloon races south once the wind has taken over (the whole way is 735 m)' },
}, { sections: ['fly'] })

export type FlyLeg = 'north' | 'warm' | 'south'
export interface FlyStart {
  leg: FlyLeg
  /** Countries in her passport (Terry says hello over the warm middle). */
  visited: string[]
}
export interface FlyEvents {
  leg(l: FlyLeg): void
  /** A line: Sparkle's instruction (`cue`), her fact the first time (`fact`, keyed), or a friend's own (`friend`). */
  talk(line: Line, kind: TalkKind, key?: string): void
  /** Her hint when she's stuck (null: nothing to do). */
  hint(line: Line | null): void
  /** The storm has won: on to the next film. */
  done(): void
}

const F = L.night.fly

/** Where each leg starts along the way south (m), where the storm starts and where the act ends. */
const LEG_AT: Record<FlyLeg, number> = { north: 0, warm: 230, south: 470 }
const STORM_AT = 640
const END_AT = 735
/** The sea's level, and the lowest the balloon's middle goes (its basket a little in the water). */
const LOW = 3.55
/** Its middle is this far above the basket floor (story/props.ts Balloon). */
const MID = 3.4
/** The cloud deck: the balloon's middle can't go above this; above `CLOUD_IN` it pokes into the clouds. */
const HIGH = 18.6
const CLOUD_IN = 17.6
/** The basket dips into the sea below this. */
const WET = 3.85
/** No hold for this long: the hint. */
const HINT_S = 8

/** The sky and the sea along the way: day, the warm middle's golden day, dusk, then the long night. */
const WARM_MOOD: Mood = { top: '#57A6E8', mid: '#A2D6F6', horizon: '#FFEBD2', blush: '#FFD3B4', sun: [0.25, 0.55, -0.8], glow: '#FFF2CC', night: 0, cloud: '#FFFFFF', belly: '#F2D8EA', clouds: 1, haze: '#FFE9D6' }
const WARM_SEA: SeaColors = { deep: '#128A9E', mid: '#22B5C4', sheen: '#BFFFF2', sky: '#FFE9D6', haze: '#FFE9D6', glow: '#FFF4D8', ice: '#6FE0EE', under: '#BDF0FF' }
const KEYS: { x: number; mood: Mood; sea: SeaColors; light: [number, number]; tint: string }[] = [
  { x: 0, mood: MOODS.day, sea: SEA.day, light: [1, 1], tint: '#FAFCFF' },
  { x: 205, mood: MOODS.day, sea: SEA.day, light: [1, 1], tint: '#FAFCFF' },
  { x: 255, mood: WARM_MOOD, sea: WARM_SEA, light: [1.05, 1.05], tint: '#FFF6EC' },
  { x: 440, mood: WARM_MOOD, sea: WARM_SEA, light: [1.05, 1.05], tint: '#FFF6EC' },
  { x: 500, mood: MOODS.south, sea: SEA.south, light: [1, 1], tint: '#FAFCFF' },
  { x: 545, mood: MOODS.dusk, sea: SEA.dusk, light: [0.85, 0.75], tint: '#FFE6EE' },
  { x: 600, mood: MOODS.night, sea: SEA.night, light: [0.66, 0.52], tint: '#C9D2FF' },
]

export const FLY_ANCHORS: AnchorInfo[] = [
  { id: 'balloon', label: "Sparkle's balloon", kind: 'thing' },
  { id: 'pola', label: 'Pola', kind: 'thing' },
  { id: 'pebble', label: 'Pebble', kind: 'thing' },
  { id: 'terry', label: 'Terry the tern', kind: 'thing' },
  { id: 'ship', label: 'The red ship', kind: 'thing' },
  { id: 'whale', label: 'A whale', kind: 'thing' },
  { id: 'nari', label: 'Nari the narwhal', kind: 'thing' },
  { id: 'albatross', label: 'An albatross', kind: 'thing' },
  { id: 'berg', label: 'A flat iceberg', kind: 'thing' },
]

/** A berg in the balloon's way (it boings off its top). */
interface Block {
  x: number
  half: number
  top: number
  bumped: number
}
/** Something that comes by once (a line when the balloon gets to it). */
interface Moment {
  at: number
  done: boolean
  fn: () => void
}

const RIBBON_VS = /* glsl */ `
  varying vec2 vW;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xy;
    gl_Position = projectionMatrix * viewMatrix * w;
  }`
const RIBBON_FS = /* glsl */ `
  uniform vec3 uCol;
  uniform float uLow;
  uniform float uHigh;
  uniform float uShift;
  uniform float uA;
  uniform float uLit;
  varying vec2 vW;
  void main() {
    float h = (vW.y - uLow) / max(0.01, uHigh - uLow);
    if (h < -0.15 || h > 1.15) discard;
    // A soft band, brightest in its middle.
    float band = smoothstep(-0.15, 0.12, h) * smoothstep(1.15, 0.88, h);
    // Streaks along the wind: thin rows, each a dashed line scrolling the way it blows.
    float row = fract(h * 5.0);
    float line = smoothstep(0.36, 0.5, row) * smoothstep(0.64, 0.5, row);
    float seed = floor(h * 5.0);
    float dash = smoothstep(0.0, 0.18, fract(vW.x * 0.07 - uShift * (0.8 + 0.25 * seed) + seed * 0.37));
    dash *= smoothstep(0.62, 0.45, fract(vW.x * 0.07 - uShift * (0.8 + 0.25 * seed) + seed * 0.37));
    float a = band * (0.22 + 0.12 * uLit) + line * dash * band * (0.8 + 0.2 * uLit);
    gl_FragColor = vec4(uCol, a * uA);
    #include <colorspace_fragment>
  }`

const tmp = new Vector3()
const tmp2 = new Vector3()
const tmpC = new Color()

export class FlyWorld implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private sky: PolarSky
  private sea: PolarSea
  private aurora: Aurora
  private fog: Fog
  private stops: (() => void)[] = []
  private storm: (() => void) | null = null
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private anchorEls = new Map<string, HTMLElement>()
  private unwatch: () => void

  // ---- The balloon and the friends.
  private balloon: Balloon
  private flame: Mesh
  private flameMat: MeshBasicMaterial
  private pola: Actor
  private pebble: Actor
  private terry: Actor
  private x = 0
  private y = 7
  private vy = 0
  private vx = 0
  private tilt = 0
  private bounce = 0
  /** How much wider the pink wind is now (her help after slow stretches). */
  private wider = 0
  private slowFor = 0

  // ---- The winds.
  private pinkMat: ShaderMaterial
  private blueMat: ShaderMaterial
  private pinkShift = 0
  private blueShift = 0
  private ribbonLit = 0

  // ---- What comes by.
  private blocks: Block[] = []
  private moments: Moment[] = []
  private ship!: Group
  private whale!: Humpback
  private nari!: Narwhal
  private albatross = new Group()
  private albWings: Group[] = []
  private albT = -1
  private thunder!: Group
  private thunderX = 356
  private clouds: Group[] = []
  private bergNear: Vector3[] = []
  private shipX = 300
  private whaleX = 402
  private nariX = 95
  private spout: Particles
  private puffs: Particles
  private flakes: Particles
  private rain: Particles
  private sparkles: Particles
  private noteMats: SpriteMaterial[]
  private notes: { s: Sprite; t: number; vx: number; vy: number }[] = []
  private glow: Sprite

  // ---- The story.
  private leg: FlyLeg
  private held = false
  private holdT = 0
  private heldEver = false
  private lastHold = 0
  private inCloud = false
  private cloudSaid = -99
  private wet = false
  private wetSaid = -99
  private pinkSaid = false
  private stormOn = false
  /** The wind has taken over: the rest of the way plays like a film (her finger rests). */
  private auto = false
  private gustT = 0
  private gustK = 0
  private ended = false
  private fans = 0
  private hums = 0
  private friendTaps = 0
  private terryTaps = 0
  private poked = new Set<string>()
  private thunderHit = false
  private later: { at: number; fn: () => void }[] = []
  private counts = { holds: 0, taps: 0, pokes: 0, bumps: 0, clouds: 0, dips: 0, inPink: 0, gusts: 0 }

  constructor(
    private renderer: WebGLRenderer,
    start: FlyStart,
    private events: FlyEvents,
  ) {
    const { scene, bag } = this
    applyBands()
    this.fog = new Fog('#DCEEFB', 70, 280)
    scene.fog = this.fog
    this.rig.fov = 34
    this.rig.lag = 0.35
    this.rig.camera.near = 0.1
    this.rig.camera.far = 600

    this.sky = new PolarSky(bag, 'day')
    this.sea = new PolarSea({ hazeNear: 70, hazeFar: 300 }, bag)
    this.aurora = new Aurora(bag)
    scene.add(this.sky.root, ...this.sea.meshes, this.aurora.root)

    // ---- The winds: two ribbons of streaks across the sky, pink up high, blue down low.
    this.pinkMat = this.ribbonMaterial('#FF6FAE')
    this.blueMat = this.ribbonMaterial('#3D8DE6')
    for (const mat of [this.pinkMat, this.blueMat]) {
      const m = new Mesh(bag.add(new PlaneGeometry(260, 24)), mat)
      m.position.set(0, 12, -1.2)
      m.renderOrder = 4
      m.frustumCulled = false
      m.userData.ribbon = true
      scene.add(m)
    }

    this.buildWay()

    // ---- Sparkle's balloon, the burner's flame, Pola and Pebble in the basket, Terry out in front.
    this.balloon = new Balloon(bag)
    scene.add(this.balloon.root)
    this.flameMat = bag.add(new MeshBasicMaterial({ color: '#FFB347', transparent: true, opacity: 0.9, blending: AdditiveBlending, depthWrite: false, fog: false }))
    this.flame = new Mesh(bag.add(merge([P.cone(0.2, 0.75, '#ffffff', { at: [0, 0.38, 0] }, 10), P.cone(0.11, 0.5, '#ffffff', { at: [0, 0.6, 0] }, 8)])), this.flameMat)
    this.flame.position.set(0, 1.05, 0)
    this.flame.visible = false
    this.balloon.basket.add(this.flame)
    this.pola = new Actor('pola', bag, { height: 1.3 })
    this.pebble = new Actor('pebble', bag, { height: 0.9 })
    this.terry = new Actor('terry', bag, { height: 1.35 })
    scene.add(this.pola.root, this.pebble.root, this.terry.root)
    // (Standing tall in the basket, a little forward of the burner, so their faces show under the balloon.)
    this.pola.ride(this.balloon.basket, -0.26, 0.5, 0.3, 8)
    this.pebble.ride(this.balloon.basket, 0.27, 0.78, 0.34, -10)
    this.terry.place(LEG_AT[start.leg] + 6, 13, 0.6, 90)
    this.terry.flying = true
    const glowTex = bag.add(glowTexture())
    this.glow = new Sprite(bag.add(new SpriteMaterial({ map: glowTex, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, fog: false, color: '#FFD45E' })))
    scene.add(this.glow)

    this.spout = new Particles({ kind: 'spray', count: 90, color: '#EAF6FF', gravity: 3 }, bag)
    this.puffs = new Particles({ kind: 'spray', count: 120, color: '#FFFFFF', gravity: -0.2 }, bag)
    this.flakes = new Particles({ kind: 'spray', count: 520, color: '#FFFFFF', gravity: 0.3 }, bag)
    this.rain = new Particles({ kind: 'spray', count: 220, color: '#BFE6FF', gravity: 9 }, bag)
    this.sparkles = new Particles({ kind: 'spray', count: 140, colors: NOTE_COLORS, gravity: -0.4 }, bag)
    scene.add(this.spout.mesh, this.puffs.mesh, this.flakes.mesh, this.rain.mesh, this.sparkles.mesh)
    this.noteMats = NOTE_COLORS.map((c) => bag.add(new SpriteMaterial({ map: bag.add(noteTexture(c)), transparent: true, depthWrite: false, fog: false })))

    dress(scene)

    // ---- Where the link starts.
    this.leg = start.leg
    this.x = LEG_AT[start.leg]
    this.y = start.leg === 'north' ? 6.5 : 13
    this.planMoments(start.visited)
    for (const m of this.moments) if (m.at < this.x) m.done = true
    this.applyLook(true)
    this.stops.push(flySfx.wind())
    this.at(0.7, () => {
      this.events.hint(F.start)
      this.events.talk(F.start, 'cue')
    })
    if (start.leg === 'north') this.at(3.2, () => (this.terry.wave(), this.events.talk(F.follow, 'friend')))
    else this.at(2.6, () => this.events.talk(F.pink, 'fact', 'pink'))

    this.unwatch = watch('balloon', () => ({
      height: [this.y - 10, 9],
      'rise speed': [this.vy, FLY.lift],
      'south speed': [this.vx, FLY.pink],
      'pink wider': [this.wider, 2 * FLY.widen + 0.01],
    }))
  }

  // ---------------------------------------------------------------- building

  private ribbonMaterial(color: string) {
    return this.bag.add(
      new ShaderMaterial({
        uniforms: { uCol: { value: new Color(color) }, uLow: { value: 0 }, uHigh: { value: 1 }, uShift: { value: 0 }, uA: { value: 1 }, uLit: { value: 0 } },
        vertexShader: RIBBON_VS,
        fragmentShader: RIBBON_FS,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        fog: false,
      }),
    )
  }

  /** The way south: the Arctic's floes and bergs, Nari, the warm middle's islands, the ship and the whale, the
   *  thundercloud, the southern sea's huge flat bergs and the albatross. Things in the balloon's way stand at z = 0. */
  private buildWay() {
    const { scene, bag } = this
    const r = rng(9)
    const add = (geo: BufferGeometry, x: number, y: number, z: number, px = 2, line?: string) => {
      const o = solid(geo, bag, px, line)
      o.position.set(x, y, z)
      scene.add(o)
      return o
    }
    // The Arctic: floes on the sea, faceted bergs behind, two tall ones in the way.
    const floes: BufferGeometry[] = []
    for (let i = 0; i < 30; i++) {
      const x = -30 + i * 8 + r() * 5
      const z = -6 - r() * 40
      floes.push(floeGeo(1.4 + r() * 3, 60 + i, 0.15, 0.3).rotateY(r() * 6).translate(x, 0, z))
    }
    add(merge(floes), 0, 0, 0, 0)
    for (let i = 0; i < 12; i++) {
      const s = 2.5 + r() * 5
      const o = add(bergGeo(s, 20 + i), -20 + i * 19 + r() * 8, 0, -22 - r() * 50, 2.5, ICE_LINE)
      o.add(this.sea.skirt(roundSkirt(s * 0.95, Math.min(4, s * 0.45)), bag))
    }
    for (const [x, s, seed] of [[70, 2.6, 3], [160, 3, 7]] as const) {
      // (A berg's top is about 1.3 × its size over the water.)
      const o = add(bergGeo(s, seed), x, 0, 0, 2.5, ICE_LINE)
      o.add(this.sea.skirt(roundSkirt(s * 0.95, Math.min(4, s * 0.45)), bag))
      this.blocks.push({ x, half: s * 0.75, top: s * 1.35, bumped: 0 })
    }
    // Nari, in the sea near the start.
    this.nari = new Narwhal(bag, 1.4)
    this.nari.root.position.set(this.nariX, -0.3, -4)
    this.nari.root.rotation.y = -Math.PI / 2
    scene.add(this.nari.root)

    // The warm middle: little islands with palm trees, the red ship, a humpback, the thundercloud.
    const isl: BufferGeometry[] = []
    const palms: BufferGeometry[] = []
    for (const [x, z, s] of [[262, -26, 7], [318, -40, 9], [384, -22, 5], [430, -34, 8]] as const) {
      isl.push(P.sphere(s, '#F5DFA5', { at: [x, -s * 0.72, z], scale: [1.4, 1, 1] }, 18), P.sphere(s * 0.7, '#7CC779', { at: [x, -s * 0.38, z], scale: [1.35, 1, 1.1] }, 16))
      for (let k = 0; k < 3; k++) {
        const px = x + (k - 1) * s * 0.4
        const ph = s * 0.5 + 1.6 + k * 0.4
        palms.push(P.cyl(0.14, 0.2, ph, '#A57A4F', { at: [px, ph / 2 - 0.2, z + 1], rot: [0, 0, (k - 1) * 0.15] }, 6))
        for (let f = 0; f < 5; f++) palms.push(P.sphere(0.9, '#4DB36A', { at: [px + Math.cos(f * 1.26) * 0.8 - (k - 1) * 0.2, ph - 0.1, z + 1 + Math.sin(f * 1.26) * 0.8], scale: [1.4, 0.25, 0.6], rot: [0, -f * 1.26, Math.sin(f * 1.26) * 0.4] }, 8))
      }
    }
    add(merge(isl), 0, 0, 0, 2.5)
    add(merge(palms), 0, 0, 0, 2)
    this.ship = makeShip(bag)
    this.ship.position.set(this.shipX, 0, -7)
    scene.add(this.ship)
    this.whale = new Humpback(bag, 1)
    this.whale.root.position.set(this.whaleX, -1.6, -9)
    this.whale.root.rotation.y = Math.PI / 2
    scene.add(this.whale.root)
    // The thundercloud: a tall dark heap in the balloon's way, a little lightning glint in its belly.
    this.thunder = new Group()
    const heap: BufferGeometry[] = []
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2
      heap.push(P.sphere(2.2 + (i % 3) * 0.5, i % 2 ? '#8E86C8' : '#A49DD6', { at: [Math.cos(a) * 2.4, 13 + Math.sin(a) * 2.2, (i % 3) - 1.5] }, 14))
    }
    heap.push(P.sphere(3.3, '#B4AEE0', { at: [0, 15.5, 0] }, 16), P.sphere(2.6, '#7D75BA', { at: [0, 10.8, 0], scale: [1.5, 0.6, 1] }, 14))
    this.thunder.add(solid(merge(heap), bag, 2.5, '#5E5694'))
    this.thunder.position.set(this.thunderX, 0, -0.5)
    scene.add(this.thunder)

    // The southern sea: huge flat table bergs, some low in the way (the balloon boings off their tops).
    for (const [x, z, w, d, hh] of [[505, -30, 30, 14, 5], [560, -48, 40, 18, 6], [610, -26, 22, 12, 4], [660, -60, 46, 20, 7], [700, -24, 26, 12, 4.5]] as const) {
      const o = add(tableBergGeo(w, d, hh), x, -0.5, z, 2.5, ICE_LINE)
      o.add(this.sea.skirt(roundSkirt(w / 2, 3, 32, d / w), bag))
      this.bergNear.push(new Vector3(x, hh * 0.6, z))
    }
    for (const [x, w, hh] of [[530, 9, 4.2], [585, 11, 4.6]] as const) {
      const o = add(tableBergGeo(w, 5, hh), x, -0.5, 0.5, 2.5, ICE_LINE)
      o.add(this.sea.skirt(roundSkirt(w / 2, 2.5, 28, 5 / w), bag))
      this.blocks.push({ x, half: w / 2, top: hh - 0.5, bumped: 0 })
      this.bergNear.push(new Vector3(x, hh * 0.6, 0.5))
    }
    // The albatross: a long-winged white bird who glides alongside for a while.
    const wing = (s: number) => {
      const g = new Group()
      g.add(solid(merge([P.sphere(1, '#FFFFFF', { at: [s * 1.1, 0, 0], scale: [1.25, 0.08, 0.32] }, 10), P.sphere(0.7, '#3E3A4C', { at: [s * 2.3, 0, -0.02], scale: [0.9, 0.07, 0.24] }, 8)]), bag, 1.5))
      return g
    }
    this.albatross.add(solid(merge([P.sphere(0.45, '#FFFFFF', { scale: [1, 0.9, 2] }, 12), P.sphere(0.3, '#FFFFFF', { at: [0, 0.18, 0.75] }, 10), P.cone(0.09, 0.5, '#FFC75E', { at: [0, 0.12, 1.15], rot: [Math.PI / 2, 0, 0] }, 6), P.sphere(0.05, PAL.ink, { at: [0.16, 0.25, 0.9] }, 6), P.sphere(0.05, PAL.ink, { at: [-0.16, 0.25, 0.9] }, 6)]), bag, 1.5))
    for (const s of [1, -1]) {
      const wgt = wing(s)
      this.albWings.push(wgt)
      this.albatross.add(wgt)
    }
    this.albatross.visible = false
    scene.add(this.albatross)

    // The cloud deck: a row of puffy clouds across the top of the sky, three tiles that leapfrog along with her.
    for (let t = 0; t < 3; t++) {
      const puffs: BufferGeometry[] = []
      const R = rng(30 + t)
      for (let i = 0; i < 12; i++) {
        const s = 1.8 + R() * 1.6
        puffs.push(P.sphere(s, '#FFFFFF', { at: [i * 3.4 + R(), 21.6 + R() * 1.2, -1 - R() * 3], scale: [1.3, 0.8, 1] }, 12))
        puffs.push(P.sphere(s * 0.8, '#E6DEFA', { at: [i * 3.4 + 1.6, 20.6, -0.4 - R() * 2], scale: [1.4, 0.55, 1] }, 10))
      }
      const g = solid(merge(puffs), bag, 1.5, '#B9AEE4')
      scene.add(g)
      this.clouds.push(g)
    }
  }

  /** The lines along the way, each said once when the balloon gets there. */
  private planMoments(visited: string[]) {
    const m = (at: number, fn: () => void) => this.moments.push({ at, done: false, fn })
    m(LEG_AT.warm + 20, () => {
      this.leg = 'warm'
      this.events.leg('warm')
      this.fans = 6
      this.events.talk(F.warm, 'friend')
      if (!this.auto) this.at(2.6, () => this.events.talk(F.warmFact, 'fact', 'warmFact'))
    })
    // Hello to a country in her passport (the first two she has, over two islands).
    const hellos = visited.filter((id) => id in L.party.hello).slice(0, 2)
    hellos.forEach((id, i) => m(i ? 425 : 268, () => (this.terry.wave(), this.auto || this.events.talk(L.party.hello[id], 'friend'))))
    m(this.shipX - 8, () => {
      flySfx.horn()
      this.pebble.pull('wow')
      this.events.talk(F.ship, 'friend')
      this.at(2.8, () => (this.pola.pull('happy'), this.auto || this.events.talk(F.crates, 'friend')))
    })
    m(this.whaleX - 6, () => {
      this.whaleSpout()
      this.events.talk(F.whale, 'friend')
    })
    m(LEG_AT.south + 15, () => {
      this.leg = 'south'
      this.events.leg('south')
      this.pebble.hop()
      this.pebble.pull('happy')
      this.events.talk(F.south, 'friend')
    })
    m(538, () => {
      this.albT = 0
      this.albatross.visible = true
      flySfx.albatross()
      if (!this.auto) this.at(1.4, () => this.events.talk(F.albatross, 'friend'))
    })
    m(STORM_AT, () => {
      this.stormOn = true
      this.storm = flySfx.blizzard()
      this.gustT = 1.5
      this.terry.pull('wow')
      this.events.talk(F.storm, 'friend')
      if (!this.auto)
        this.at(2.4, () => {
          this.events.hint(F.holdOn)
          this.events.talk(F.holdOn, 'cue')
        })
    })
  }

  private at(sec: number, fn: () => void) {
    this.later.push({ at: this.time + sec, fn })
  }

  // ---------------------------------------------------------------- the winds

  /** The pink wind's bottom right now (lower after a slow stretch). */
  private pinkLow() {
    return Math.max(FLY.blueHigh + 0.5, FLY.pinkLow - this.wider)
  }
  /** The pink wind's top right now (higher after a slow stretch up in the clouds). */
  private pinkHigh() {
    return Math.min(HIGH - 0.3, FLY.pinkHigh + this.wider)
  }
  /** 0 out of it .. 1 in the middle of the pink wind. */
  private inPink(y = this.y) {
    const lo = this.pinkLow()
    const hi = this.pinkHigh()
    return smoothstep(lo - 0.6, lo + 0.4, y) * (1 - smoothstep(hi - 0.4, hi + 0.8, y))
  }
  /** How fast the balloon goes south at a height: the pink wind's speed in it, creeping anywhere else. */
  private southSpeed(y: number) {
    const cloud = smoothstep(CLOUD_IN - 0.4, HIGH, y)
    return FLY.crawl + (FLY.pink - FLY.crawl) * this.inPink(y) * (1 - cloud * 0.5)
  }

  // ---------------------------------------------------------------- the frame

  update(dt: number) {
    const t = (this.time += dt)
    if (this.later.length) {
      const due = this.later.filter((l) => l.at <= t)
      this.later = this.later.filter((l) => l.at > t)
      due.forEach((l) => l.fn())
    }
    this.updateBalloon(dt, t)
    for (const m of this.moments) if (!m.done && this.x >= m.at) (m.done = true), m.fn()
    this.updateThings(dt, t)
    this.applyLook(false)

    // The friends: Pebble's beak while he hums, Pola fanning herself in the heat, Terry out in front in the pink wind.
    this.pola.update(dt, t)
    this.pebble.update(dt, t)
    this.terry.update(dt, t)
    openBeak(this.pebble, this.humT > 0 ? 0.3 + 0.4 * Math.abs(Math.sin(t * 12)) : 0)
    this.humT = Math.max(0, this.humT - dt)
    if (this.fans > 0 && !this.pola.busy && Math.floor(t * 0.7) !== Math.floor((t - dt) * 0.7)) {
      this.fans--
      this.pola.wave()
    }
    const ty = (this.pinkLow() + this.pinkHigh()) / 2 + Math.sin(t * 0.9) * 0.4
    const tx = this.x + (this.tall ? 3.2 : 6.5) + Math.sin(t * 0.5) * 0.6
    this.terry.pos.x += (tx - this.terry.pos.x) * Math.min(1, dt * 2)
    this.terry.pos.y += (ty - this.terry.pos.y) * Math.min(1, dt * 1.5)
    this.terry.pos.z = 0.6
    this.terry.root.rotation.y = Math.PI / 2 - 0.5

    // The light follows the time of day.
    this.lights.follow(this.x, 6, 0)
    this.lights.ambient.intensity *= this.lightK[0]
    this.lights.sun.intensity *= this.lightK[1]
    this.rig.setShot(this.shot())
    this.rig.update(dt)
    this.sky.update(t, this.rig.camera, this.fog)
    this.sea.update(this.rig.camera.position.x, this.rig.camera.position.z - 40, this.sky.sun)
    this.sea.setHaze(this.sky.haze)
  }
  private humT = 0
  private lightK: [number, number] = [1, 1]

  private updateBalloon(dt: number, t: number) {
    if (this.held) this.holdT += dt
    // Up while she holds, down when she lets go; gusts in the storm push it down.
    const mid = (this.pinkLow() + this.pinkHigh()) / 2
    const want = this.ended ? -FLY.sink * 0.6 : this.auto ? clamp((mid - this.y) * 1.5, -FLY.sink, FLY.lift) : this.held ? FLY.lift : -FLY.sink
    this.vy += (want - this.vy) * Math.min(1, dt * FLY.ease)
    if (this.stormOn && !this.ended) {
      this.gustT -= dt
      if (this.gustT <= 0) {
        this.gustT = FLY.gustEvery * (0.8 + Math.random() * 0.4)
        this.gustK = 1
        this.counts.gusts++
        flySfx.gust()
        this.balloonShake = 1
      }
    }
    this.gustK = Math.max(0, this.gustK - dt * 0.9)
    // (Once the wind has taken over, a gust only shakes the balloon.)
    if (!this.auto) this.vy -= this.gustK * FLY.gust * dt * 2.2
    this.y += this.vy * dt
    // The cloud deck stops it (it pokes in, all fluffy), the sea lets the basket dip.
    if (this.y > HIGH) {
      this.y = HIGH
      this.vy = Math.min(this.vy, 0)
    }
    if (this.y < LOW) {
      this.y = LOW
      this.vy = Math.max(this.vy, 0)
    }
    // Bergs in the way: boing off the top (never through, never stuck).
    for (const b of this.blocks) {
      const basket = this.y - MID
      if (Math.abs(this.x - b.x) < b.half + 0.4 && basket < b.top + 0.1) {
        this.y = b.top + 0.15 + MID
        this.vy = Math.max(this.vy, 2.6)
        if (t - b.bumped > 1.2) {
          b.bumped = t
          this.counts.bumps++
          this.bounce = 1
          flySfx.boing()
          this.puffs.burst(this.x, b.top + 0.1, 0.3, 14, 1.4, 1.2, 0.2)
          this.pola.pull('wow')
        }
      }
    }
    // South: the wind at its height (the blue creeps, the pink flies).
    const vx = this.ended ? 0.8 : this.auto ? FLY.cruise : this.southSpeed(this.y)
    this.vx += (vx - this.vx) * Math.min(1, dt * (this.auto ? 0.8 : 1.6))
    this.x += this.vx * dt
    const pink = this.inPink()
    if (pink > 0.5) {
      this.counts.inPink += dt
      this.slowFor = 0
      if (!this.pinkSaid) {
        this.pinkSaid = true
        this.events.talk(F.pink, 'fact', 'pink')
        this.sparkles.burst(this.x, this.y, 0.5, 20, 2, 1.5, 0.15, 0)
      }
      if (!this.auto && this.counts.inPink >= FLY.takeover) this.takeOver()
    } else if (!this.stormOn) {
      // A slow stretch: the pink wind reaches out a little to meet her, down and up (twice at most).
      this.slowFor += dt
      if (this.slowFor > 9 && this.wider < FLY.widen * 2 - 0.01) {
        this.slowFor = 0
        this.wider = Math.min(FLY.widen * 2, this.wider + FLY.widen)
        this.ribbonLit = 1.5
      }
    }
    // Into the clouds: all fluffy (once a while); dipping in the sea: don't get me wet.
    const inCloud = this.y > CLOUD_IN
    if (inCloud && !this.inCloud) {
      this.counts.clouds++
      this.puffs.burst(this.x, this.y + 2, 0.5, 18, 1.6, 0.6, 0.35)
      if (t - this.cloudSaid > 14) {
        this.cloudSaid = t
        this.at(0.4, () => this.events.talk(F.cloud, 'friend'))
      }
    }
    this.inCloud = inCloud
    const wet = this.y < WET
    if (wet && !this.wet) {
      this.counts.dips++
      flySfx.splash()
      this.spout.burst(this.x, 0.2, 0.3, 26, 2.2, 3, 0.18)
      this.pebble.pull('wow')
      this.pebble.hop()
      if (t - this.wetSaid > 14) {
        this.wetSaid = t
        this.events.talk(F.wet, 'friend')
      }
    }
    this.wet = wet
    // The burner roars while she holds.
    const burning = this.held || (this.auto && !this.ended && want > 0.3)
    if (burning) flySfx.burner()
    this.flame.visible = burning
    if (burning) this.flame.scale.set(1 + 0.15 * Math.sin(t * 31), 0.9 + 0.25 * Math.abs(Math.sin(t * 23)), 1 + 0.15 * Math.sin(t * 27))
    this.flameMat.color.set(Math.sin(t * 40) > 0 ? '#FFB347' : '#FFD45E')
    if (burning && Math.random() < dt * 14) this.sparkles.emit(this.x + (Math.random() - 0.5) * 0.3, this.y - MID + 1.9, 0.2, (Math.random() - 0.5) * 0.4, 1.4, 0, 0.6, 0.06, 1)
    // The balloon: leans into its speed, shakes in a gust, boings off a berg.
    this.bounce = Math.max(0, this.bounce - dt * 2.2)
    this.balloonShake = Math.max(0, this.balloonShake - dt * 1.5)
    this.tilt += (-(this.vx - FLY.crawl) * 0.012 - this.vy * 0.01 - this.tilt) * Math.min(1, dt * 2)
    const b = this.balloon.root
    b.position.set(this.x, this.y - MID + bell(1 - this.bounce) * 0.3 * (this.bounce > 0 ? 1 : 0), 0)
    b.rotation.set(0, 0, this.tilt + Math.sin(t * 25) * 0.03 * this.balloonShake)
    this.balloon.update(dt, t)
    // The glow round the balloon while she holds (her finger's heat), the hint when she's left it a while.
    const stuck = !this.held && !this.ended && !this.auto && t - this.lastHold > HINT_S
    this.glow.position.set(this.x, this.y, 0.6)
    this.glow.scale.setScalar(6.5 + (stuck ? Math.sin(t * 5) * 0.8 : 0))
    this.glow.material.opacity = this.held && !this.auto ? 0.18 : stuck ? 0.25 + 0.15 * Math.sin(t * 5) : 0
    // The act ends when the storm has had its way.
    if (!this.ended && this.x >= END_AT) {
      this.ended = true
      this.held = false
      this.events.hint(null)
      this.at(1.2, () => this.events.done())
    }
  }
  private balloonShake = 0

  /** She has ridden the pink wind: it takes over, and the rest of the way plays like a film. */
  private takeOver() {
    this.auto = true
    this.held = false
    this.events.hint(null)
    this.sparkles.burst(this.x, this.y, 0.6, 30, 2.4, 1.8, 0.15, 0)
    this.ribbonLit = 1.5
    this.terry.wave()
    this.pebble.hop()
    this.pebble.pull('happy')
    this.pola.pull('happy')
  }

  private whaleSpout() {
    flySfx.spout()
    this.whale.sing()
    for (let i = 0; i < 3; i++) this.at(i * 0.25, () => this.spout.burst(this.whaleX + 2.4, 0.4, -9, 24, 1, 6, 0.24))
  }

  private updateThings(dt: number, t: number) {
    const x = this.x
    // The winds: their heights, their streaks scrolling the way they blow, brighter when she's in them.
    const pu = this.pinkMat.uniforms
    pu.uLow.value = this.pinkLow()
    pu.uHigh.value = this.pinkHigh()
    this.pinkShift += dt * FLY.pink * 0.07
    pu.uShift.value = this.pinkShift
    this.ribbonLit = Math.max(0, this.ribbonLit - dt)
    pu.uLit.value = Math.min(1, this.inPink() + this.ribbonLit)
    pu.uA.value = this.stormOn ? 0.5 : 1
    const bu = this.blueMat.uniforms
    bu.uLow.value = FLY.blueLow
    bu.uHigh.value = FLY.blueHigh
    this.blueShift -= dt * FLY.blue * 0.07
    bu.uShift.value = this.blueShift
    bu.uLit.value = smoothstep(FLY.blueLow - 0.5, FLY.blueLow + 0.5, this.y) * (1 - smoothstep(FLY.blueHigh - 0.5, FLY.blueHigh + 0.5, this.y)) * 0.6
    bu.uA.value = this.stormOn ? 0.5 : 1
    this.scene.traverse((o) => {
      if (o.userData.ribbon) o.position.x = x + 20
    })
    // The cloud deck's tiles leapfrog along.
    const tile = 12 * 3.4
    const base = (Math.floor((x - 30) / tile) - 1) * tile
    this.clouds.forEach((c, i) => (c.position.x = base + i * tile))
    // Nari surfaces and waves her tusk as the balloon comes over.
    const nk = 1 - smoothstep(14, 30, Math.abs(x - this.nariX))
    this.nari.root.position.y = -1.6 + nk * 1.4 + Math.sin(t * 1.6) * 0.1
    this.nari.root.rotation.z = Math.sin(t * 2.2) * 0.2 * nk
    this.nari.update(dt, t)
    this.whale.update(dt, t)
    this.whale.root.position.y = -1.8 + (1 - smoothstep(10, 26, Math.abs(x - this.whaleX))) * 1.2
    // The ship sails slowly south (the way she came).
    this.ship.position.x = this.shipX + Math.min(20, Math.max(0, x - (this.shipX - 40))) * 0.15
    this.ship.position.y = Math.sin(t * 1.1) * 0.08
    // The thundercloud rumbles; flying through it is a cool shower.
    const th = Math.abs(x - this.thunderX)
    if (th < 3.2 && this.y > 9.5 && this.y < 16.3 && !this.thunderHit) {
      this.thunderHit = true
      this.pola.pull('happy')
      flySfx.rain()
      this.events.talk(F.shower, 'friend')
    }
    if (th < 60 && Math.random() < dt * 30) this.rain.emit(this.thunderX + (Math.random() - 0.5) * 6, 10, -0.5 + (Math.random() - 0.5) * 2, 0, -6, 0, 1.2, 0.05)
    if (this.thunderHit && th < 4 && Math.random() < dt * 40) this.rain.emit(this.x + (Math.random() - 0.5) * 2, this.y + 1, 0.4, 0, -5, 0, 0.8, 0.05)
    this.thunder.scale.setScalar(1 + Math.sin(t * 1.3) * 0.02)
    // The albatross glides alongside for a while, then off ahead.
    if (this.albT >= 0) {
      this.albT += dt
      const k = this.albT
      const ax = x + 9 - Math.max(0, 8 - k * 2) + Math.max(0, k - 14) * 6
      this.albatross.position.set(ax, this.y + 2.6 + Math.sin(t * 0.8) * 0.5, 1.4)
      this.albatross.rotation.set(0, Math.PI / 2, Math.sin(t * 0.7) * 0.15)
      this.albWings.forEach((w, i) => (w.rotation.z = (i ? -1 : 1) * Math.sin(t * 1.4) * 0.12))
      if (k > 22) {
        this.albT = -1
        this.albatross.visible = false
      }
    }
    // The southern lights, and the blizzard's snow streaming past.
    this.aurora.amount = smoothstep(560, 620, x) * (this.stormOn ? 0.45 : 0.95)
    this.aurora.root.position.set(x + 10, -20, 60)
    this.aurora.update(dt, t)
    if (this.stormOn) {
      const n = Math.floor(dt * 240 + Math.random())
      for (let i = 0; i < n; i++) this.flakes.emit(x + 16 + Math.random() * 6, Math.random() * 22, -3 + Math.random() * 6, -14 - Math.random() * 6, -1.5 - this.gustK * 4, 0, 2.2, 0.08 + Math.random() * 0.06)
    } else if (x > 600 && Math.random() < dt * 20) this.flakes.emit(x + Math.random() * 20 - 4, 20, Math.random() * 4 - 2, -1, -1.2, 0, 8, 0.07)
    this.spout.update(dt)
    this.puffs.update(dt)
    this.flakes.update(dt)
    this.rain.update(dt)
    this.sparkles.update(dt)
    for (const n of this.notes) {
      if (n.t <= 0) continue
      n.t -= dt
      n.s.position.x += n.vx * dt + this.vx * dt
      n.s.position.y += n.vy * dt
      n.s.visible = n.t > 0
      n.s.scale.setScalar(0.4 * Math.min(1, n.t * 2))
    }
  }

  /** The sky, the sea, the fog and the light for where the balloon is along the way. */
  private applyLook(snap: boolean) {
    const x = this.x
    let i = 0
    while (i < KEYS.length - 2 && x > KEYS[i + 1].x) i++
    const A = KEYS[i]
    const B = KEYS[i + 1]
    const k = smoothstep(A.x, B.x, x)
    const key = `${i}:${k.toFixed(3)}`
    if (key === this.lookKey && !snap) return
    this.lookKey = key
    this.sky.blend(A.mood, B.mood, k)
    this.sea.setColors(mixSea(A.sea, B.sea, k))
    this.fog.color.copy(this.sky.haze)
    this.lightK = [A.light[0] + (B.light[0] - A.light[0]) * k, A.light[1] + (B.light[1] - A.light[1]) * k]
    this.lights.ambient.color.set(A.tint).lerp(tmpC.set(B.tint), k)
    this.lights.sun.color.copy(this.lights.ambient.color)
    // The storm closes the fog in.
    const s = smoothstep(STORM_AT, STORM_AT + 30, x)
    this.fog.near = 70 - s * 55
    this.fog.far = 280 - s * 200
    if (s > 0) this.fog.color.lerp(tmpC.set('#7C78B8'), s * 0.6)
  }
  private lookKey = ''

  /** From the side, a little below the balloon's middle: the sea along the bottom, the cloud deck along the top, more
   *  room ahead (south) than behind. */
  private shot(): Shot {
    const ahead = this.tall ? 1.4 : 4.2
    // (The camera rises and falls with the balloon, a little lazily, so the sea and the clouds come and go.)
    this.camY += (clamp(this.y + 0.6, 7.4, 13.6) - this.camY) * 0.06
    return this.tall
      ? { center: new Vector3(this.x + ahead, this.camY, 0), half: new Vector3(4.2, 8.2, 1), yaw: 0, pitch: 2 }
      : { center: new Vector3(this.x + ahead, this.camY, 0), half: new Vector3(8.6, 7.4, 1), yaw: 0, pitch: 2 }
  }
  private camY = 9

  // ---------------------------------------------------------------- World3D

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.tall = h > w * 1.05
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
    this.rig.setShot(this.shot(), true)
  }
  setAnchorElements(els: Map<string, HTMLElement>) {
    this.anchorEls = els
  }
  get calm() {
    return false
  }
  render() {
    this.renderer.render(this.scene, this.rig.camera)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  // ---------------------------------------------------------------- her finger

  /** Anywhere: the burner (hold to rise). */
  pointerDown() {
    if (this.ended || this.auto) return
    this.held = true
    this.holdT = 0
    this.lastHold = this.time
    this.counts.holds++
    if (!this.heldEver) {
      this.heldEver = true
      this.at(0.8, () => this.events.talk(F.hot, 'fact', 'hot'))
    }
    this.events.hint(this.stormOn ? F.holdOn : null)
  }
  pointerMove() {}
  pointerUp() {
    if (this.held) this.lastHold = this.time
    this.held = false
    if (!this.ended && !this.auto) this.events.hint(this.stormOn ? F.holdOn : F.stuck)
  }

  private toScreen(v: Vector3) {
    const p = tmp2.copy(v).project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }
  private minTarget() {
    return Math.min(this.w, this.h) < 500 ? 64 : 88
  }
  /** Something's spot on screen and its radius there. */
  private spotOf(id: string): { x: number; y: number; z: number; r: number } | null {
    const min = this.minTarget() / 2
    const at = (v: Vector3, r: number) => {
      const c = this.toScreen(v)
      const e = this.toScreen(tmp.copy(v).add(tmp2.set(r, 0, 0)))
      return { ...c, r: Math.max(min, Math.abs(e.x - c.x)) }
    }
    const near = (wx: number) => Math.abs(wx - this.x) < 34
    switch (id) {
      case 'balloon':
        return at(tmp.set(this.x, this.y + 0.4, 0), 1.6)
      case 'pola':
        return at(this.pola.at(0.6, new Vector3()), 0.45)
      case 'pebble':
        return at(this.pebble.at(0.6, new Vector3()), 0.38)
      case 'terry':
        return at(this.terry.at(0.4, new Vector3()), 0.6)
      case 'ship':
        return near(this.ship.position.x) ? at(tmp.set(this.ship.position.x, 1.6, -7), 3.2) : null
      case 'whale':
        return near(this.whaleX) && this.whale.root.position.y > -1.2 ? at(tmp.set(this.whaleX, 0.4, -9), 3) : null
      case 'nari':
        return near(this.nariX) && this.nari.root.position.y > -0.9 ? at(tmp.set(this.nariX, 0.3, -4), 1.6) : null
      case 'albatross':
        return this.albatross.visible ? at(this.albatross.position, 1.6) : null
      case 'berg': {
        const b = this.bergNear.filter((v) => Math.abs(v.x - this.x) < 26).sort((p, q) => Math.abs(p.x - this.x) - Math.abs(q.x - this.x))[0]
        return b ? at(b, 4) : null
      }
    }
    return null
  }

  private pickId(x: number, y: number): string | null {
    let best: string | null = null
    let bz = Infinity
    for (const a of FLY_ANCHORS) {
      const s = this.spotOf(a.id)
      if (!s || s.z >= 1) continue
      // (The friends win over the balloon they ride in.)
      const z = a.id === 'pola' || a.id === 'pebble' ? s.z - 0.1 : s.z
      if (Math.hypot(x - s.x, y - s.y) < s.r && z < bz) {
        best = a.id
        bz = z
      }
    }
    return best
  }

  tap(x: number, y: number, id?: string) {
    this.counts.taps++
    const what = id ?? this.pickId(x, y)
    const poke = (key: string, line: Line) => {
      this.counts.pokes++
      this.poked.add(key)
      this.events.talk(line, 'fact', `poke:${key}`)
    }
    switch (what) {
      case 'pebble':
        this.poked.add('pebble')
        this.pebble.hop()
        this.humT = 2.4
        if (this.hums++ === 0) this.events.talk(F.hum, 'friend')
        else sing(TUNES[0], 'chick', 0.2, 0.7)
        for (let i = 0; i < 5; i++) this.at(i * 0.35, () => this.note(this.pebble.at(1, tmp), i))
        return
      case 'pola':
        this.poked.add('pola')
        this.pola.hop()
        this.events.talk(F.friends[this.friendTaps++ % 2], 'friend')
        return
      case 'terry':
        this.poked.add('terry')
        this.terry.wave()
        flySfx.tern()
        this.events.talk(L.hub.terry[this.terryTaps++ % L.hub.terry.length], 'friend')
        return
      case 'balloon':
        this.puffs.burst(this.x, this.y - MID + 1.4, 0.4, 10, 1, 1.5, 0.18)
        return poke('balloon', F.pokes.balloon)
      case 'ship':
        flySfx.horn()
        return poke('ship', F.pokes.ship)
      case 'whale':
        this.whaleSpout()
        return void this.poked.add('whale')
      case 'nari':
        this.nari.root.rotation.z = 0.6
        flySfx.splash()
        this.spout.burst(this.nariX, 0.2, -4, 18, 1.6, 2.6, 0.18)
        return void this.poked.add('nari')
      case 'albatross':
        flySfx.albatross()
        return void this.poked.add('albatross')
      case 'berg':
        flySfx.boing()
        return poke('berg', F.pokes.berg)
    }
    // A wind ribbon (a tap on its streaks), or the night sky's lights.
    const yAt = (wy: number) => this.toScreen(tmp.set(this.x, wy, -1.2)).y
    const inBand = (lo: number, hi: number) => y < yAt(lo) && y > yAt(hi)
    if (inBand(this.pinkLow(), this.pinkHigh()) || inBand(FLY.blueLow, FLY.blueHigh)) {
      this.ribbonLit = 1.2
      flySfx.whoosh()
      return poke('ribbons', F.pokes.ribbons)
    }
    if (this.x > 570) {
      this.aurora.flare()
      flySfx.lights()
      return poke('lights', F.pokes.lights)
    }
    this.puffs.burst(this.x + (x / this.w - 0.5) * 20, 20, -1, 8, 1, 0.5, 0.25)
  }

  private note(at: Vector3, color: number) {
    let n = this.notes.find((o) => o.t <= 0)
    if (!n) {
      if (this.notes.length >= 16) return
      const s = new Sprite(this.noteMats[0])
      this.scene.add(s)
      n = { s, t: 0, vx: 0, vy: 0 }
      this.notes.push(n)
    }
    n.s.material = this.noteMats[color % this.noteMats.length]
    n.s.position.copy(at)
    n.t = 1.5
    n.vx = (Math.random() - 0.5) * 0.6
    n.vy = 1.1
    n.s.visible = true
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = this.minTarget()
    for (const [id, el] of this.anchorEls) {
      const spot = this.spotOf(id)
      const show = !!spot && spot.z < 1 && spot.x > -spot.r && spot.x < this.w + spot.r && spot.y > -spot.r && spot.y < this.h + spot.r
      if (show && spot) {
        const d = Math.max(min, spot.r * 2)
        el.style.transform = `translate3d(${(spot.x - d / 2).toFixed(1)}px, ${(spot.y - d / 2).toFixed(1)}px, 0)`
        el.style.width = `${d.toFixed(0)}px`
        el.style.height = `${d.toFixed(0)}px`
        el.style.borderRadius = '50%'
        el.style.zIndex = String(id === 'pebble' || id === 'pola' ? 1000 : Math.round((1 - spot.z) * 900))
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const scr = (id: string) => {
      const s = this.spotOf(id)
      return s ? { x: Math.round(s.x), y: Math.round(s.y) } : null
    }
    return {
      ...this.counts,
      inPink: +this.counts.inPink.toFixed(1),
      section: 'fly',
      leg: this.leg,
      x: +this.x.toFixed(1),
      of: END_AT,
      y: +this.y.toFixed(2),
      vx: +this.vx.toFixed(2),
      held: this.held,
      storm: this.stormOn,
      auto: this.auto,
      ended: this.ended,
      wider: this.wider,
      said: this.moments.filter((m) => m.done).length,
      poked: [...this.poked],
      time: +this.time.toFixed(1),
      balloon: scr('balloon'),
      pebble: scr('pebble'),
      pola: scr('pola'),
      terry: scr('terry'),
      ship: scr('ship'),
    }
  }
  memory() {
    return { ...this.renderer.info.memory }
  }
  dispose() {
    for (const s of this.stops) s()
    this.storm?.()
    this.unwatch()
    this.scene.clear()
    this.bag.dispose()
  }
}

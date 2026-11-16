// Emperor Huddle, the last chapter before the flight home (the films round it are story/films.ts `huddle-in`, where
// Papa remembers the night Pebble hatched, and `huddle-out`, the sun coming back). The game is that memory: winter
// night on the Antarctic sea ice, the emperor dads standing all winter with an egg on their feet.
//
// The toy (core verb): pick up a penguin dad and carry him. Her finger lifts him off the snow (flippers flapping, feet
// paddling), he follows her across the ice and she sets him down: the huddle squishes to make room and everyone
// shuffles together. The dads on the windy edge get cold: they shiver, a snowflake shakes over their heads, snow piles
// on their caps and shoulders and their breath puffs white. Carried into the middle, out of the wind, he warms up
// (the snow falls off, a pink heart, a happy hop). Moving one in pushes another out, so the huddle keeps turning, like
// a real one. It gets richer three times:
//   small     five dads, Papa alone on the windy edge ("Brrr! So cold!"): bring the cold ones in.
//   blizzard  three more dads waddle in out of the dark, the snow blows harder, and every so often the wind swings
//             round: they all turn their backs to it and different dads end up on the cold side.
//   hatch     Papa is out on the edge with his egg: keep him in the middle and the egg wobbles, cracks, cracks again and
//             Pebble pops out. Then gusts roll Pebble off Papa's feet across the snow; she carries him back (the same
//             verb, a smaller penguin) and he tucks in under Papa's tummy.
//   song      the payoff: the wind drops, the camera comes down low under the southern lights, and Papa sings Pebble his
//             song (the same tune the chick hums in the finale, party/sounds.ts TUNES[0]) and Pebble peeps it back.
// Silly, never "oops": one left out too long sneezes a snowball and waddles in himself; one dropped right on top of
// another pops the other out of the top like a cork. Every dad sings his own song when tapped (or shakes off his
// snow), and there's more to poke: a Weddell seal in its breathing hole, the snow, Pebble, the moon and the lights in
// the close-ups. Stuck for 8 s: the cold one's tap target glows and pink dots run from him to the warm middle.
//
// Built for engine3d/View3D.tsx. The carrying and the warmth are feel-lab knobs (?feel=1).
import { AdditiveBlending, type BufferGeometry, Fog, Group, Mesh, MeshBasicMaterial, Plane, PlaneGeometry, Raycaster, Scene, SphereGeometry, Sprite, SpriteMaterial, Vector2, Vector3, type Texture, type WebGLRenderer } from 'three'
import { bell, clamp, lineMs, smooth, type Line } from '../../../../../sdk'
import { smoothstep } from '../../../../../sdk/math'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../engine3d/camera'
import { Bag } from '../../../../engine3d/dispose'
import { bake, merge, P, solid } from '../../../../engine3d/geo'
import { setOutlineResolution } from '../../../../engine3d/outline'
import { Particles } from '../../../../engine3d/particles'
import { radialAlpha, softTexture } from '../../../../engine3d/softTexture'
import { applyBands, makeLights } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import { knobs, watch } from '../../../../kit/knobs'
import { fbm, field, noise, outside, snowColor } from '../../look/ground'
import { dress } from '../../look/look'
import { PolarSky } from '../../look/sky'
import { flakeTexture, heartTexture, NOTE_COLORS, noteTexture } from '../../look/sprites'
import { L } from '../../lines'
import { Actor, openBeak } from '../../story/actor'
import { Aurora, bergGeo, driftGeo, ICE_LINE, mountainGeo, rng, skyDisc, tableBergGeo } from '../../story/props'
import { BEAT, noteAt, sing, TUNES, tuneSeconds, type Tune } from '../party/sounds'
import { BIG, CHICK_H, DAD_H, HATCH, LATE, MAX_DADS, RADIUS, SMALL, SNUG, TALL, WIDE, type Field, type Start } from './huddle'
import type { HuddleSection } from './sections'
import { huddleSfx } from './sounds'

const FILE = 'src/world/places/poles/activities/huddle/world.ts'
/** Her finger on a penguin (live in the feel lab: ?feel=1). */
const DRAG = knobs('huddleDrag', 'Carry a penguin', FILE, {
  follow: { value: 14, min: 2, max: 40, step: 1, label: 'Follow her finger', unit: '/s', note: 'how quickly a held penguin catches up with her finger (low = floaty)' },
  lift: { value: 0.4, min: 0, max: 1.2, step: 0.02, label: 'Lift', unit: 'm', note: 'how high a held penguin is lifted off the snow' },
  grab: { value: 1.25, min: 0.8, max: 2, step: 0.05, label: 'Grab reach', unit: '×', note: 'how far outside a penguin her finger still picks him up (times his size on screen)' },
  pushHeld: { value: 0.45, min: 0, max: 1, step: 0.05, label: 'Push while held', note: 'how hard a held penguin shoves the others aside (0 = he floats over them)' },
  squish: { value: 9, min: 1, max: 30, step: 0.5, label: 'Squish', unit: '/s', note: 'how quickly the huddle makes room (low = soft and slow)' },
  snug: { value: 0.55, min: 0, max: 2, step: 0.05, label: 'Huddle together', unit: 'm/s', note: 'how fast warm penguins shuffle up to touch the huddle (cold ones are too frozen to move)' },
  drift: { value: 0.22, min: 0, max: 1, step: 0.02, label: 'Back to the middle', unit: 'm/s', note: 'how fast the whole huddle shuffles back to the middle of the ice' },
  cork: { value: 0.38, min: 0.1, max: 0.9, step: 0.02, label: 'Cork pop', note: 'squeezed this far into another when let go (0.2 is a careful drop, 0.4 a hard shove), the other pops out the top' },
})
const WARM = knobs('huddle', 'Wind and warmth', FILE, {
  warm: { value: 3, min: 0.5, max: 12, step: 0.5, label: 'Warm-up time', unit: 's', note: 'cold to warm, out of the wind in the huddle' },
  cool: { value: 15, min: 4, max: 60, step: 1, label: 'Cool-down time', unit: 's', note: 'warm to cold on the windy edge' },
  blizzard: { value: 1.4, min: 1, max: 3, step: 0.1, label: 'Blizzard is colder', unit: '×', note: 'how much faster they cool in the blizzard' },
  alone: { value: 1.8, min: 1, max: 4, step: 0.1, label: 'Alone is colder', unit: '×', note: 'how much faster one touching nobody cools' },
  shiver: { value: 0.4, min: 0.1, max: 0.8, step: 0.05, label: 'Shivers below', note: 'how cold before he shivers (warmed up from there, he counts)' },
  shelter: { value: 2.4, min: 1.2, max: 5, step: 0.1, label: 'Shelter reach', note: 'how far upwind a neighbour still blocks the wind (in penguin widths)' },
  small: { value: 5, min: 1, max: 20, step: 1, label: 'Warm-ups, small huddle', note: 'cold dads warmed up before the blizzard' },
  big: { value: 8, min: 1, max: 30, step: 1, label: 'Warm-ups, blizzard', note: 'cold dads warmed up before the egg' },
  turn: { value: 18, min: 6, max: 60, step: 1, label: 'Wind turns every', unit: 's', note: 'in the blizzard' },
  sneeze: { value: 10, min: 3, max: 30, step: 1, label: 'Sneeze after', unit: 's', note: 'frozen this long, he sneezes a snowball and waddles in himself' },
  egg: { value: 5, min: 1, max: 20, step: 0.5, label: 'Egg hatches after', unit: 's', note: "of Papa being warm" },
  gusts: { value: 3, min: 1, max: 8, step: 1, label: 'Gusts', note: "times the wind blows Pebble out before Papa's song" },
  gustEvery: { value: 7, min: 2, max: 20, step: 0.5, label: 'Gust after', unit: 's', note: 'once Pebble is tucked back in' },
  tuck: { value: 0.9, min: 0.3, max: 2, step: 0.05, label: 'Tuck reach', unit: 'm', note: "how near Papa's feet Pebble must be let go to tuck in" },
})

/** What Sparkle says to do at each moment (L.huddle): spoken when it changes, and her hint when stuck. */
export type Cue = 'small' | 'more' | 'blizzard' | 'turned' | 'hatch' | 'hatched' | 'blown' | 'song' | 'done'
/** Papa's lines and Pebble's. */
export type PapaTalk = 'cold' | 'thanks' | 'egg' | 'hatched' | 'blown' | 'tucked' | 'song' | 'always'
export type PebbleTalk = 'hi' | 'blown' | 'tucked'
export type Fact = 'egg' | 'coldest' | 'night' | 'fast' | 'seal' | 'lights' | 'song'
export type Phase = 'play' | 'end'

export interface HuddleStart {
  section: HuddleSection
  wind: 'left' | 'right'
  chick: 'egg' | 'hatched'
}
export interface HuddleEvents {
  section(s: HuddleSection, p: Record<string, string>): void
  /** Sparkle's instruction changed (spoken when `speak`); null: nothing to do right now (no hint). */
  cue(c: Cue | null, speak: boolean): void
  papa(what: PapaTalk): void
  pebble(what: PebbleTalk): void
  /** Something true about it, the first time it comes up. */
  fact(f: Fact): void
  dots(n: number, of: number): void
  phase(p: Phase): void
}

type Step = 'small' | 'more' | 'blizzard' | 'egg' | 'chick' | 'song'
type Wind = 'left' | 'right'

export const HUDDLE_ANCHORS: AnchorInfo[] = [
  { id: 'dad:0', label: "Pebble's papa: carry him into the huddle", kind: 'thing' },
  ...Array.from({ length: MAX_DADS - 1 }, (_, i) => ({ id: `dad:${i + 1}`, label: 'A penguin dad: carry him into the huddle', kind: 'thing' as const })),
  { id: 'pebble', label: 'Pebble', kind: 'thing' },
  { id: 'seal', label: 'A seal in its breathing hole', kind: 'thing' },
]

/** The night look (story/stage.ts's `night` set): the light's color and strength (ambient, sun, times the usual). */
const NIGHT_TINT = '#B4BEFF'
const NIGHT_LIGHT: [number, number] = [0.52, 0.44]
/** No touch for this long: the hint. */
const HINT_S = 8
/** In the close-ups (the hatch, the song) the lights and the moon hang low enough to show behind the penguins. */
const AURORA_AT = new Vector3(0, -26, 40)

interface Dad {
  i: number
  a: Actor
  on: boolean
  x: number
  z: number
  /** Facing (rad round y; 0 = toward the camera). */
  yaw: number
  speed: number
  warmth: number
  cold: boolean
  coldFor: number
  exposed: boolean
  alone: boolean
  snow: number
  held: boolean
  lift: number
  walk: { x: number; z: number } | null
  walkFor: number
  cork: { x0: number; z0: number; x1: number; z1: number; t: number } | null
  /** His song, while he sings it. */
  song: { tune: Tune; t: number; dots: boolean } | null
  shiverAt: number
  breathAt: number
  egg: Group
  eggTop: Group
  crack: Group
  cap: Group
  shoulders: Group
  flake: Sprite
}

interface Chick {
  state: 'egg' | 'tucked' | 'tumble' | 'out' | 'held'
  x: number
  z: number
  lift: number
  tumble: { x0: number; z0: number; x1: number; z1: number; t: number } | null
  outAt: number
  chirpAt: number
  pop: number
}

const tmp = new Vector3()
const tmp2 = new Vector3()

export class HuddleWorld implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private sky: PolarSky
  private aurora: Aurora
  private moon: Group
  private stops: (() => void)[] = []
  private blizzardBed: (() => void) | null = null
  private dads: Dad[] = []
  private pebble: Actor
  private chick: Chick = { state: 'egg', x: 0, z: 0, lift: 0, tumble: null, outAt: 0, chirpAt: 0, pop: -1 }
  private chickFlake: Sprite
  private flakes: Particles
  private puffs: Particles
  private breath: Particles
  private shell: Particles
  private glow: Mesh
  /** A soft gold glow on the snow under Papa while it's his egg (and Pebble), so she can tell which dad is him. */
  private papaGlow: Mesh
  private papaGlowMat: MeshBasicMaterial
  /** The southern lights' glow on the snow: soft green and pink patches that drift across the ice. */
  private skyLight: { m: Mesh; mat: MeshBasicMaterial; phase: number }[] = []
  private glowMat: MeshBasicMaterial
  private hintDots: Mesh[] = []
  private heartMat: SpriteMaterial
  private noteMats: SpriteMaterial[]
  private pops: { s: Sprite; t: number; life: number; vy: number; size: number }[] = []
  private seal: { root: Group; head: Group; up: number; goal: number; next: number }
  private raycaster = new Raycaster()
  private ground = new Plane(new Vector3(0, 1, 0), 0)
  private anchorEls = new Map<string, HTMLElement>()
  private unwatch: () => void
  private w = 1
  private h = 1
  private tall = false
  private field: Field = WIDE
  private time = 0

  // ---- The story.
  private section: HuddleSection
  private step: Step = 'small'
  private windFrom: Wind
  /** Where the wind blows to, as an angle on the ice (0 = toward +x, from the left). */
  private angle: number
  private angleTo: number
  private windInt = 0.55
  private windIntTo = 0.55
  private gustT = -9
  private nextTurn = 0
  private turning = false
  private turns = 0
  private warmups = 0
  private goal = 0
  private eggP = 0
  private cracks = 0
  private tucks = 0
  private gustAt = 0
  private gusts = 0
  private thanks = 0
  private later: { at: number; fn: () => void }[] = []
  /** A close-up the story asks for, until `until` (s). */
  private close: { kind: 'egg' | 'song'; until: number } | null = null
  /** 0 the play camera's night .. 1 the close-up's (the lights and the moon brought down into view). */
  private low = 0
  private lastBrrr = -9
  private ended = false
  private lastTouch = 0
  private nextWhoosh = 0

  // ---- Her finger.
  private finger: { x: number; y: number; sx: number; sy: number; moved: number; dx: number; dz: number; what: Dad | 'chick' | null } | null = null
  private counts = { carries: 0, warmed: 0, taps: 0, songs: 0, pokes: 0, corks: 0, sneezes: 0, tucked: 0, seal: 0 }
  private poked = new Set<string>()

  constructor(
    private renderer: WebGLRenderer,
    start: HuddleStart,
    private events: HuddleEvents,
  ) {
    const { scene, bag } = this
    applyBands()
    scene.fog = new Fog('#3E3C7E', 40, 180)
    this.rig.fov = 36
    this.rig.lag = 0.55
    this.rig.camera.near = 0.05

    // ---- The long night: the films' Antarctica under its night sky (story/stage.ts), the lights, the moon.
    this.sky = new PolarSky(bag, 'night')
    this.aurora = new Aurora(bag)
    this.aurora.amount = 0.9
    this.moon = skyDisc(bag, 4.5, '#FFF6D8', '#CFD6FF')
    this.moon.position.set(-38, 40, -150)
    scene.add(this.sky.root, this.aurora.root, this.moon)
    this.buildIce()

    // ---- The dads: the films' emperor (characters/looks.ts `papa`), each with an egg on his feet. Papa (the first)
    // is the only one with a voice.
    const flakeMat = bag.add(new SpriteMaterial({ map: bag.add(flakeTexture()), transparent: true, depthWrite: false, fog: false }))
    for (let i = 0; i < MAX_DADS; i++) {
      const a = new Actor('papa', bag, { height: DAD_H + ((i * 37) % 5) * 0.025, voice: i === 0 ? 'papa' : null })
      scene.add(a.root)
      const H = a.height
      const r = a.rig
      // His egg, tucked on his feet under the fold of his tummy: two halves, so Pebble's can pop open.
      const egg = new Group()
      const er = 0.075 * H
      const eggBottom = solid(bake(new SphereGeometry(er, 16, 10, 0, Math.PI * 2, Math.PI * 0.46, Math.PI * 0.54), '#FFEFC4'), bag, 1.5)
      const eggTop = new Group()
      eggTop.add(solid(bake(new SphereGeometry(er, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.46), '#FFEFC4'), bag, 1.5))
      eggTop.position.y = 0
      const crack = solid(P.torus(er * 1.01, er * 0.09, '#5A4660', { rot: [Math.PI / 2, 0, 0], at: [0, er * 0.12, 0] }), bag, 0)
      crack.visible = false
      egg.add(eggBottom, eggTop, crack)
      egg.scale.set(1, 1.25, 1)
      egg.position.set(0, er * 1.2, 0.3 * H)
      a.root.add(egg)
      // Snow that piles up on him out in the wind: a cap on his head, a drift on his shoulders.
      const R = r.face.R
      const cap = solid(P.sphere(R * 0.78, '#FFFFFF', { scale: [1, 0.42, 1] }, 14), bag, 1.5, ICE_LINE)
      cap.position.set(0, r.face.headY + R * 0.78, -R * 0.12)
      r.head.add(cap)
      const shoulders = solid(merge([P.sphere(0.2 * H, '#FFFFFF', { scale: [1.25, 0.32, 0.9] }, 14)]), bag, 1.5, ICE_LINE)
      shoulders.position.set(0, 0.62 * H, -0.1 * H)
      r.body.add(shoulders)
      const flake = new Sprite(flakeMat)
      flake.scale.setScalar(0.42)
      flake.visible = false
      scene.add(flake)
      a.hide()
      this.dads.push({ i, a, on: false, x: 0, z: 0, yaw: 0, speed: 0, warmth: 1, cold: false, coldFor: 0, exposed: false, alone: false, snow: 0, held: false, lift: 0, walk: null, walkFor: 0, cork: null, song: null, shiverAt: 0, breathAt: Math.random(), egg, eggTop, crack, cap, shoulders, flake })
    }
    this.pebble = new Actor('pebble', bag, { height: CHICK_H, voice: 'pebble' })
    scene.add(this.pebble.root)
    this.pebble.hide()
    this.chickFlake = new Sprite(flakeMat)
    this.chickFlake.scale.setScalar(0.3)
    this.chickFlake.visible = false
    scene.add(this.chickFlake)

    // ---- Snow in the air, puffs, breath, bits of shell; the warm middle's glow; the hint's dots; hearts and beads.
    this.flakes = new Particles({ kind: 'spray', count: 420, color: '#FFFFFF', gravity: 0.2 }, bag)
    this.puffs = new Particles({ kind: 'spray', count: 120, color: '#E6F0FF' }, bag)
    this.breath = new Particles({ kind: 'spray', count: 80, color: '#FFFFFF', opacity: 0.7, gravity: -0.15 }, bag)
    this.shell = new Particles({ kind: 'spray', count: 30, color: '#FFF4DC' }, bag)
    scene.add(this.flakes.mesh, this.puffs.mesh, this.breath.mesh, this.shell.mesh)
    const warmTex: Texture = bag.add(softTexture(128, 128, [255, 150, 190], (x, y) => radialAlpha(Math.hypot(x - 64, y - 64), 64, [[0, 0.9], [0.45, 0.45], [1, 0]])))
    this.glowMat = bag.add(new MeshBasicMaterial({ map: warmTex, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, fog: false }))
    this.glow = new Mesh(bag.add(new PlaneGeometry(1, 1)), this.glowMat)
    this.glow.rotation.x = -Math.PI / 2
    this.glow.position.y = 0.03
    this.glow.renderOrder = 1
    scene.add(this.glow)
    const goldTex: Texture = bag.add(softTexture(64, 64, [255, 214, 110], (x, y) => radialAlpha(Math.hypot(x - 32, y - 32), 32, [[0, 0.9], [0.55, 0.6], [1, 0]])))
    this.papaGlowMat = bag.add(new MeshBasicMaterial({ map: goldTex, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, fog: false }))
    this.papaGlow = new Mesh(bag.add(new PlaneGeometry(1.6, 1.6)), this.papaGlowMat)
    this.papaGlow.rotation.x = -Math.PI / 2
    this.papaGlow.renderOrder = 2
    scene.add(this.papaGlow)
    const dotGeo = bag.add(new SphereGeometry(0.09, 10, 8))
    const dotMat = bag.add(new MeshBasicMaterial({ color: '#FF6FA8', fog: false }))
    for (let i = 0; i < 7; i++) {
      const d = new Mesh(dotGeo, dotMat)
      d.visible = false
      this.hintDots.push(d)
      scene.add(d)
    }
    this.heartMat = bag.add(new SpriteMaterial({ map: bag.add(heartTexture()), transparent: true, depthWrite: false, fog: false }))
    this.noteMats = NOTE_COLORS.map((c) => bag.add(new SpriteMaterial({ map: bag.add(noteTexture(c)), transparent: true, depthWrite: false, fog: false })))

    for (const [i, rgb] of ([[143, 227, 200], [255, 143, 184], [184, 160, 255]] as [number, number, number][]).entries()) {
      const tex = bag.add(softTexture(64, 64, rgb, (x, y) => radialAlpha(Math.hypot(x - 32, y - 32), 32, [[0, 1], [0.5, 0.5], [1, 0]])))
      const mat = bag.add(new MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.16, blending: AdditiveBlending, depthWrite: false, fog: false }))
      const m = new Mesh(bag.add(new PlaneGeometry(1, 1)), mat)
      m.rotation.x = -Math.PI / 2
      m.scale.set(16, 9, 1)
      m.renderOrder = 1
      scene.add(m)
      this.skyLight.push({ m, mat, phase: i * 2.1 })
    }

    // ---- A Weddell seal's breathing hole at the back of the ice: he pops up now and then, and when she pokes him.
    this.seal = this.buildSeal()

    // The polar look on everything (look/look.ts).
    dress(scene)

    // ---- Where the link starts: each section as if she had played to there.
    this.section = start.section
    this.windFrom = start.wind
    this.angle = this.angleTo = start.wind === 'left' ? 0 : Math.PI
    const starts: Start[] = start.section === 'small' ? SMALL : start.section === 'blizzard' ? BIG : start.section === 'hatch' && start.chick === 'egg' ? HATCH : SNUG
    this.place(starts)
    this.stops.push(huddleSfx.night())
    if (start.section === 'small') {
      this.goal = WARM.small
      this.events.papa('cold')
    } else if (start.section === 'blizzard') {
      this.step = 'blizzard'
      this.goal = WARM.big
      this.windInt = this.windIntTo = 1
      this.nextTurn = WARM.turn
      this.blizzardBed = huddleSfx.blizzard()
    } else if (start.section === 'hatch') {
      this.windInt = this.windIntTo = 0.7
      if (start.chick === 'egg') {
        this.step = 'egg'
        this.goal = 3
      } else this.hatchNow(true)
    } else {
      this.hatchNow(true)
      this.tucks = WARM.gusts
      this.at(0.6, () => this.song())
    }
    const step = this.step as Step
    if (step !== 'song' && start.section !== 'song') this.events.dots(step === 'chick' ? this.tucks : 0, step === 'chick' ? WARM.gusts : this.goal)
    if (start.section === 'hatch' && start.chick === 'hatched') this.cue(null, false)
    else if (start.section !== 'song') this.cue(start.section, true)

    this.unwatch = watch('huddle', () => {
      const held = this.finger?.what && this.finger.what !== 'chick' ? this.finger.what : null
      const on = this.dads.filter((d) => d.on)
      return {
        coldest: [Math.min(...on.map((d) => d.warmth)), 1],
        held: [held ? held.warmth : 0, 1],
        wind: [Math.cos(this.angle), 1],
        'warm ups': [this.warmups, Math.max(1, this.goal)],
      }
    })
  }

  // ---------------------------------------------------------------- building

  /** The sea ice the colony stands on (flat, a few soft drifts), rising to snowy land and mountains far off, a couple
   *  of icebergs frozen into the ice: the films' Antarctica, at night. */
  private buildIce() {
    const { scene, bag } = this
    const r = rng(41)
    const flat = { x0: -14, x1: 14, z0: -14, z1: 10 }
    const heightAt = (x: number, z: number) => (fbm(x * 0.025 + 5, z * 0.025) - 0.3) * 12 * smoothstep(0, 60, outside(x, z, flat)) + (noise(x * 0.2, z * 0.2) - 0.5) * 0.1 * smoothstep(3, 10, outside(x, z, { x0: -6, x1: 6, z0: -4.5, z1: 4 }))
    scene.add(solid(field({ x0: -200, x1: 200, z0: -220, z1: 40, cell: 1.4, height: heightAt, color: (_x, _z, h, slope) => '#' + snowColor(h, slope, -0.1, 0.6).getHexString() }), bag, 0))
    const drifts: BufferGeometry[] = []
    for (let i = 0; i < 14; i++) {
      const x = -32 + r() * 64
      const z = -30 + r() * 22
      if (Math.abs(x) < 9 && z > -9) continue
      drifts.push(driftGeo(2 + r() * 3.5, 0.35 + r() * 0.5).translate(x, heightAt(x, z) - 0.05, z))
    }
    // Little drifts round the edge of the colony's ice, low and soft.
    for (const [x, z, s] of [[-6.4, -3.6, 1], [6.6, -3.2, 1.1], [-7, 2.2, 0.8], [7.2, 2.4, 0.8]] as const) drifts.push(driftGeo(s * 1.4, s * 0.3).translate(x, 0, z))
    scene.add(solid(merge(drifts), bag, 1.5, ICE_LINE))
    scene.add(solid(merge([[-70, -150, 26, 30, 1], [-20, -170, 34, 40, 2], [36, -160, 24, 26, 3], [-120, -130, 22, 24, 4], [84, -140, 20, 22, 5]].map(([x, z, rr, h, seed]) => mountainGeo(rr, h, seed).translate(x, heightAt(x, z) - 2, z))), bag, 2.5, ICE_LINE))
    scene.add(solid(merge([tableBergGeo(20, 10, 4).translate(30, heightAt(30, -48) - 0.6, -48), tableBergGeo(13, 8, 3).translate(-34, heightAt(-34, -40) - 0.6, -40), tableBergGeo(3.4, 2.2, 1.2).translate(-10.5, -0.2, -7.5)]), bag, 2.5, ICE_LINE))
    // Icebergs frozen into the sea ice just behind the colony (the emperors huddle in their shelter), and a few
    // broken blocks of ice: what she sees over the huddle's heads.
    const near = [tableBergGeo(7, 4, 2.4).translate(-6.5, -0.3, -10), tableBergGeo(9, 5, 3).translate(5.5, -0.3, -13), tableBergGeo(4, 3, 1.6).translate(-1.5, -0.3, -15)]
    for (const [x, z, sz, seed] of [[-3.6, -7.4, 0.7, 3], [3.1, -6.8, 0.55, 5], [8.6, -6.2, 0.8, 8], [-8.8, -5.4, 0.6, 11], [-9.6, 1.2, 0.5, 13], [9.8, 0.6, 0.6, 17]] as const) near.push(bergGeo(sz, seed).translate(x, sz * 0.25, z))
    scene.add(solid(merge(near), bag, 2, ICE_LINE))
  }

  /** The seal's hole: a ring of packed snow round dark water, and his round grey head with whiskers that pops up. */
  private buildSeal() {
    const { bag } = this
    const root = new Group()
    root.add(solid(merge([P.torus(0.5, 0.13, '#E8EEFA', { rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.7] })]), bag, 1.5, ICE_LINE))
    const water = new Mesh(bag.add(new PlaneGeometry(1, 1)), bag.add(new MeshBasicMaterial({ color: '#23295E' })))
    water.rotation.x = -Math.PI / 2
    water.scale.set(0.95, 0.95, 1)
    water.position.y = 0.01
    root.add(water)
    const head = new Group()
    head.add(
      solid(
        merge([
          P.sphere(0.3, '#8D93AE', { scale: [1, 0.95, 1.05] }, 16),
          P.sphere(0.15, '#B9BED3', { at: [0, -0.05, 0.25], scale: [1.2, 0.8, 0.8] }, 12),
          P.sphere(0.05, '#2E2233', { at: [-0.12, 0.08, 0.24] }, 8),
          P.sphere(0.05, '#2E2233', { at: [0.12, 0.08, 0.24] }, 8),
          P.sphere(0.035, '#2E2233', { at: [0, 0, 0.37] }, 8),
        ]),
        bag,
        2,
      ),
    )
    head.position.y = -0.4
    root.add(head)
    this.scene.add(root)
    return { root, head, up: 0, goal: 0, next: 9 }
  }

  /** Puts the dads at their starting spots (mirrored when the wind comes from the right) and lets them settle. */
  private place(starts: Start[]) {
    const m = this.windFrom === 'left' ? 1 : -1
    starts.forEach((s, i) => {
      const d = this.dads[i]
      d.on = true
      d.x = s.dx * RADIUS * m
      d.z = s.dz * RADIUS
      d.warmth = s.warm
      d.cold = s.warm < WARM.shiver
      d.snow = d.cold ? 0.8 : s.warm < 0.6 ? 0.35 : 0
      d.yaw = this.backToWind()
      d.a.place(d.x, 0, d.z, 0)
      if (d.cold) d.a.pull('sad', true)
    })
    for (let k = 0; k < 60; k++) this.pack(1 / 30, true)
  }

  private get papa() {
    return this.dads[0]
  }

  // ---------------------------------------------------------------- geometry

  /** Where the wind blows to, on the ice. */
  private wind(): [number, number] {
    return [Math.cos(this.angle), Math.sin(this.angle)]
  }
  /** Facing with his back to the wind: downwind, cheated toward the camera so she sees his face. */
  private backToWind() {
    const [wx] = this.wind()
    return wx >= 0 ? 0.7 : -0.7
  }
  private clampSpot(x: number, z: number) {
    const f = this.field
    return { x: clamp(x, -f.hx, f.hx), z: clamp(z, -f.hz, f.hz) }
  }
  private clampDad(d: Dad) {
    const c = this.clampSpot(d.x, d.z)
    d.x = c.x
    d.z = c.z
  }
  private onGround(d: Dad) {
    return d.on && !d.cork && !d.held
  }
  /** A free spot on the side of the huddle away from the wind (where a dad who comes in by himself goes). */
  private leeSpot(not?: Dad) {
    const ds = this.dads.filter((d) => this.onGround(d) && d !== not)
    if (!ds.length) return { x: 0, z: 0 }
    const cx = ds.reduce((s, d) => s + d.x, 0) / ds.length
    const cz = ds.reduce((s, d) => s + d.z, 0) / ds.length
    const rc = Math.max(...ds.map((d) => Math.hypot(d.x - cx, d.z - cz)))
    const [wx, wz] = this.wind()
    const side = (Math.random() - 0.5) * 2 * RADIUS
    return this.clampSpot(cx + wx * (rc + 1.4 * RADIUS) - wz * side, cz + wz * (rc + 1.4 * RADIUS) + wx * side)
  }
  /** The middle of the huddle, a bit downwind (where a cold one warms up best). */
  private middle() {
    const ds = this.dads.filter((d) => this.onGround(d) && !d.cold)
    const list = ds.length ? ds : this.dads.filter((d) => d.on)
    const cx = list.reduce((s, d) => s + d.x, 0) / list.length
    const cz = list.reduce((s, d) => s + d.z, 0) / list.length
    const [wx, wz] = this.wind()
    return { x: cx + wx * 0.2, z: cz + wz * 0.2 }
  }
  /** Where Pebble stands on Papa's feet (Papa-local). */
  private get feet() {
    return 0.36 * this.papa.a.height
  }

  // ---------------------------------------------------------------- the story

  private cue(c: Cue | null, speak = true) {
    this.events.cue(c, speak)
  }
  private at(sec: number, fn: () => void) {
    this.later.push({ at: this.time + sec, fn })
  }

  private warmedUp(d: Dad) {
    d.cold = false
    d.coldFor = 0
    d.a.cheer()
    d.a.pull('happy')
    d.a.hop()
    huddleSfx.warm()
    this.heart(d.a.at(1.15, tmp))
    if (d.snow > 0.2) {
      d.a.at(0.9, tmp)
      this.puffs.burst(tmp.x, tmp.y, tmp.z, 12, 1.4, 1.6, 0.14)
      d.snow = 0
    }
    if (this.step !== 'small' && this.step !== 'blizzard') return
    this.warmups++
    this.counts.warmed++
    // Papa says thank you when it's him (the first time, and now and then after).
    if (d === this.papa && (this.thanks === 0 || this.warmups % 2 === 0)) this.events.papa('thanks')
    if (d === this.papa) this.thanks++
    this.events.dots(this.warmups, this.goal)
    if (this.warmups < this.goal) return
    if (this.step === 'small') this.toBlizzard()
    else this.toEgg()
  }

  private toBlizzard() {
    this.step = 'more'
    huddleSfx.chime()
    this.cue('more')
    this.at(0.8, () => {
      const m = this.windFrom === 'left' ? 1 : -1
      LATE.forEach((s, j) => {
        const d = this.dads[SMALL.length + j]
        d.on = true
        d.x = m * (this.field.hx + 2.5 + j * 0.8)
        d.z = s.dz * RADIUS
        d.warmth = s.warm
        d.snow = 0
        d.cold = false
        d.yaw = -m * Math.PI * 0.5
        d.a.place(d.x, 0, d.z, 0)
        d.walk = { x: s.dx * RADIUS * m, z: d.z }
      })
      huddleSfx.shuffle()
    })
    this.at(3.6, () => {
      this.step = 'blizzard'
      this.section = 'blizzard'
      this.warmups = 0
      this.goal = WARM.big
      this.windIntTo = 1
      this.gustT = this.time
      this.nextTurn = this.time + WARM.turn
      huddleSfx.gust()
      this.blizzardBed ??= huddleSfx.blizzard()
      this.events.section('blizzard', { wind: this.windFrom })
      this.events.dots(0, this.goal)
      this.cue('blizzard')
      this.events.fact('coldest')
    })
  }

  private toEgg() {
    this.step = 'egg'
    this.section = 'hatch'
    this.windIntTo = 0.7
    this.blizzardBed?.()
    this.blizzardBed = null
    // The wind blows Papa out to the edge: whichever side it's coming from, he's there now.
    const p = this.papa
    p.warmth = Math.min(p.warmth, 0.3)
    p.cold = true
    p.a.pull('sad', true)
    const [wx, wz] = this.wind()
    p.walk = this.clampSpot(-wx * (this.field.hx - 0.4), p.z * 0.5 - wz)
    this.eggP = 0
    this.cracks = 0
    this.goal = 3
    huddleSfx.chime()
    this.events.section('hatch', { wind: this.windFrom, chick: 'egg' })
    this.events.dots(0, 3)
    this.events.papa('egg')
    this.cue('hatch')
  }

  /** Pebble is out of the egg, on Papa's feet. */
  private hatchNow(quiet = false) {
    const p = this.papa
    this.step = 'chick'
    this.section = 'hatch'
    p.egg.visible = false
    this.chick.state = 'tucked'
    this.pebble.ride(p.a.root, 0, 0, this.feet, 0)
    this.pebble.root.scale.setScalar(1)
    this.tucks = 0
    this.gustAt = this.time + (quiet ? 2.5 : 6.5)
    if (quiet) return
    p.egg.getWorldPosition(tmp)
    this.shell.burst(tmp.x, tmp.y + 0.05, tmp.z, 16, 1.4, 2.2, 0.06)
    huddleSfx.hatch()
    this.chick.pop = 0
    this.pebble.root.scale.setScalar(0.2)
    this.pebble.pull('wow')
    this.close = { kind: 'egg', until: Math.max(this.close?.until ?? 0, this.time + 4.5) }
    this.dads.forEach((o, i) => o.on && i > 0 && this.at(0.4 + i * 0.12, () => o.a.hop()))
    this.at(0.5, () => (p.a.pull('happy'), p.a.armsUp = 0.6))
    this.at(2.2, () => (p.a.armsUp = 0))
    this.events.section('hatch', { wind: this.windFrom, chick: 'hatched' })
    this.events.dots(0, WARM.gusts)
    this.events.papa('hatched')
    this.events.pebble('hi')
    // No "tuck Pebble back" yet: Pebble is still on Papa's feet until the first gust.
    this.cue(null, false)
  }

  /** A gust rolls Pebble off Papa's feet, tumbling across the snow. */
  private gust() {
    const c = this.chick
    const p = this.papa
    const [wx, wz] = this.wind()
    const far = 2.4 + Math.random() * 0.8
    const side = (Math.random() - 0.5) * 1.2
    this.pebble.root.getWorldPosition(tmp)
    let to = this.clampSpot(p.x + wx * far - wz * side, p.z + wz * far + wx * side)
    // Don't roll him right back onto Papa's feet: if the edge of the ice stops him close, roll the other way.
    if (Math.hypot(to.x - p.x, to.z - p.z) < WARM.tuck * 1.6) to = this.clampSpot(p.x - wx * far, p.z + side)
    this.pebble.release()
    c.state = 'tumble'
    c.tumble = { x0: tmp.x, z0: tmp.z, x1: to.x, z1: to.z, t: 0 }
    c.x = tmp.x
    c.z = tmp.z
    this.gustT = this.time
    huddleSfx.gust()
    huddleSfx.squeak()
    p.a.pull('wow')
    this.gusts++
    if (this.gusts % 2) this.events.pebble('blown')
    else this.events.papa('blown')
    // Sparkle says it the first time; after that the hint is to tuck him back in.
    this.cue(this.gusts === 1 ? 'blown' : 'hatched', this.gusts === 1)
  }

  private dropChick() {
    const c = this.chick
    c.state = 'out'
    c.outAt = this.time
    const p = this.papa
    const fx = p.x + Math.sin(p.yaw) * this.feet
    const fz = p.z + Math.cos(p.yaw) * this.feet
    if (Math.hypot(c.x - fx, c.z - fz) < WARM.tuck) this.tuck()
    else huddleSfx.place()
  }

  private tuck() {
    const c = this.chick
    const p = this.papa
    c.state = 'tucked'
    c.tumble = null
    c.pop = 0
    this.pebble.ride(p.a.root, 0, 0, this.feet, 0)
    this.pebble.cheer()
    this.pebble.pull('happy')
    p.walk = null
    p.a.cheer()
    p.a.hop()
    huddleSfx.tuck()
    this.timersPeep(0.15)
    this.tucks++
    this.counts.tucked++
    if (this.tucks % 2) this.events.papa('tucked')
    else this.events.pebble('tucked')
    this.cue(null, false)
    this.events.dots(this.tucks, WARM.gusts)
    if (this.tucks >= WARM.gusts) this.at(1.6, () => this.song())
    else this.gustAt = this.time + WARM.gustEvery
  }
  private timersPeep(sec: number) {
    this.at(sec, () => huddleSfx.peep())
  }

  /** The payoff: the wind drops, everyone snug, and Papa sings Pebble his song (Pebble sings it back). Timed by the
   *  lines' own lengths, like a film. */
  private song() {
    if (this.step === 'song') return
    this.step = 'song'
    this.section = 'song'
    this.windIntTo = 0.05
    this.blizzardBed?.()
    this.blizzardBed = null
    if (this.chick.state !== 'tucked') this.tuck()
    for (const d of this.dads) {
      d.held = false
      d.walk = null
    }
    this.finger = null
    const p = this.papa
    // Papa steps out to the front of the huddle, facing her, so the song is between the two of them.
    const front = Math.max(...this.dads.filter((d) => d.on && d !== p).map((d) => d.z))
    p.walk = this.clampSpot(p.x * 0.4, Math.min(this.field.hz, front + 1.3 * RADIUS))
    this.events.section('song', {})
    this.events.dots(0, 0)
    this.close = { kind: 'song', until: Infinity }
    const ms = (l: Line, min = 1.4) => Math.max(min, lineMs(l) / 1000)
    let t = 0.8
    this.at(t, () => this.cue('song'))
    t += ms(L.huddle.song) + 0.4
    this.at(t, () => this.events.papa('song'))
    t += ms(L.huddle.papa.song) + 0.3
    this.at(t, () => this.sing(p, true))
    t += tuneSeconds(TUNES[0]) + 0.6
    this.at(t, () => this.chickSing())
    t += tuneSeconds(TUNES[0]) + 0.7
    this.at(t, () => {
      this.events.papa('always')
      this.pebble.hop()
    })
    t += ms(L.huddle.papa.always) + 0.4
    this.at(t, () => {
      huddleSfx.cheer()
      this.aurora.flare()
      this.dads.forEach((d, i) => d.on && this.at(i * 0.1, () => d.a.hop()))
      this.pebble.hop()
      this.events.fact('song')
    })
    this.at(t + 2.6, () => this.cue('done'))
    this.at(t + 4.6, () => {
      this.ended = true
      this.events.phase('end')
    })
  }

  /** A dad sings his own song (Papa's is TUNES[0]): his beak opens on each note and he sways to its shape. */
  private sing(d: Dad, dots = false) {
    if (d.song) return
    d.song = { tune: TUNES[d.i % TUNES.length], t: 0, dots }
    this.counts.songs++
    const pan = clamp(d.x / Math.max(1, this.field.hx), -1, 1) * 0.6
    sing(d.song.tune, 'papa', pan)
  }
  private chickVoice: { t: number } | null = null
  /** Pebble peeps Papa's song back. */
  private chickSing() {
    this.chickVoice = { t: 0 }
    sing(TUNES[0], 'chick', 0)
  }

  // ---------------------------------------------------------------- pokes and silly moments

  private pokeDad(d: Dad) {
    this.counts.pokes++
    this.poked.add(d.i === 0 ? 'papa' : 'dad')
    if (d.snow > 0.35) {
      // He shakes his snow off.
      d.a.shake()
      d.snow = 0
      d.a.at(0.85, tmp)
      this.puffs.burst(tmp.x, tmp.y, tmp.z, 14, 1.6, 1.4, 0.14)
      huddleSfx.snow()
      return
    }
    // His own call: every emperor dad's song is his own.
    this.sing(d, this.step === 'song')
    if (this.counts.pokes > 1) this.events.fact('fast')
  }

  private pokeChick() {
    this.pebble.hop()
    this.counts.pokes++
    this.poked.add('pebble')
    huddleSfx.peep()
    if (this.step === 'song') this.chickSing()
  }

  private pokeSeal() {
    const s = this.seal
    s.goal = 1
    s.next = this.time + 4
    this.poked.add('seal')
    huddleSfx.sealPop()
    this.at(0.4, () => huddleSfx.seal())
    this.counts.seal++
    this.events.fact('seal')
  }

  /** Dropped right on top of another: the other pops out of the top like a cork. */
  private corkCheck(d: Dad) {
    for (const o of this.dads) {
      if (o === d || !this.onGround(o)) continue
      const dist = Math.hypot(o.x - d.x, o.z - d.z)
      if (dist > (1 - DRAG.cork) * 2 * RADIUS) continue
      const to = this.leeSpot(o)
      o.cork = { x0: o.x, z0: o.z, x1: to.x, z1: to.z, t: 0 }
      o.walk = null
      o.a.pull('wow')
      this.counts.corks++
      huddleSfx.cork()
      return
    }
  }

  private sneeze(d: Dad) {
    d.coldFor = -1e9
    this.counts.sneezes++
    huddleSfx.sneeze()
    d.a.nod()
    // A snowball pops off his beak and rolls away.
    d.a.head(tmp)
    const [wx] = this.wind()
    this.puffs.burst(tmp.x + Math.sin(d.yaw) * 0.3, tmp.y, tmp.z + Math.cos(d.yaw) * 0.3, 10, 2, 1.2, 0.12)
    this.shell.emit(tmp.x, tmp.y, tmp.z, wx * 2 + Math.sin(d.yaw) * 1.5, 2, Math.cos(d.yaw) * 1.5, 1, 0.16)
    this.at(0.7, () => {
      if (!d.held && d.on) d.walk = this.leeSpot(d)
    })
  }

  /** A pink heart floats up from a point. */
  private heart(at: Vector3) {
    const s = new Sprite(this.heartMat)
    s.position.copy(at)
    s.scale.setScalar(0.01)
    this.scene.add(s)
    this.pops.push({ s, t: 0, life: 1.4, vy: 0.7, size: 0.5 })
  }
  private bead(at: Vector3, semi: number) {
    const s = new Sprite(this.noteMats[Math.round(semi / 2.4) % this.noteMats.length])
    s.position.copy(at)
    s.scale.setScalar(0.01)
    this.scene.add(s)
    this.pops.push({ s, t: 0, life: 1.8, vy: 0.25, size: 0.2 })
  }

  // ---------------------------------------------------------------- every frame

  /** Pushes overlapping penguins apart (the huddle squishes to make room), and pulls the warm ones together. */
  private pack(dt: number, settle = false) {
    const ds = this.dads.filter((d) => d.on && !d.cork)
    const k = settle ? 1 : Math.min(1, dt * DRAG.squish)
    for (let a = 0; a < ds.length; a++) {
      for (let b = a + 1; b < ds.length; b++) {
        const p = ds[a]
        const q = ds[b]
        let dx = q.x - p.x
        let dz = q.z - p.z
        let d = Math.hypot(dx, dz)
        const min = 2 * RADIUS
        if (d >= min) continue
        if (d < 0.001) {
          dx = Math.random() - 0.5
          dz = Math.random() - 0.5
          d = Math.hypot(dx, dz)
        }
        const nx = dx / d
        const nz = dz / d
        const over = (min - d) * k
        // A held penguin doesn't move; he shoves the other with "push while held". One walking in pushes through.
        const wp = p.held ? 0 : q.held ? DRAG.pushHeld : p.walk && !q.walk ? 0.2 : q.walk && !p.walk ? 0.8 : 0.5
        const wq = q.held ? 0 : p.held ? DRAG.pushHeld : 1 - wp
        p.x -= nx * over * wp
        p.z -= nz * over * wp
        q.x += nx * over * wq
        q.z += nz * over * wq
      }
    }
    if (settle) {
      for (const d of ds) this.clampDad(d)
      return
    }
    // Warm ones shuffle up to touch the huddle (the cold ones are too frozen to move).
    const ground = ds.filter((d) => !d.held)
    for (const d of ground) {
      if (d.walk || d.warmth < 0.5 || ground.length < 2) continue
      const all = ground.filter((o) => o !== d)
      const snug = all.filter((o) => o.warmth >= 0.5)
      const others = snug.length ? snug : all
      const near = Math.min(...others.map((o) => Math.hypot(o.x - d.x, o.z - d.z) - 2 * RADIUS))
      if (near < 0.04) continue
      const cx = others.reduce((s, o) => s + o.x, 0) / others.length
      const cz = others.reduce((s, o) => s + o.z, 0) / others.length
      const l = Math.hypot(cx - d.x, cz - d.z) || 1
      const v = Math.min(DRAG.snug * dt, near)
      d.x += ((cx - d.x) / l) * v
      d.z += ((cz - d.z) / l) * v
    }
    // The whole huddle slowly shuffles back to the middle of the ice (it drifts downwind as she moves them in).
    const moving = ground.filter((d) => !d.cold && !d.walk)
    if (moving.length) {
      const cx = ground.reduce((s, d) => s + d.x, 0) / ground.length
      const cz = ground.reduce((s, d) => s + d.z, 0) / ground.length
      const l = Math.hypot(cx, cz)
      if (l > RADIUS) {
        const v = Math.min(DRAG.drift * dt, l - RADIUS)
        for (const d of moving) {
          d.x -= (cx / l) * v
          d.z -= (cz / l) * v
        }
      }
    }
    for (const d of ds) this.clampDad(d)
  }

  /** Who is out of the wind: a neighbour upwind, close enough and in line, blocks it. */
  private shelter() {
    const [wx, wz] = this.wind()
    const ds = this.dads.filter((d) => this.onGround(d))
    for (const d of ds) {
      let shelter = false
      let alone = true
      for (const o of ds) {
        if (o === d) continue
        const dx = o.x - d.x
        const dz = o.z - d.z
        const dist = Math.hypot(dx, dz)
        const min = 2 * RADIUS
        if (dist < min * 1.35) alone = false
        const along = -(dx * wx + dz * wz)
        const across = Math.abs(dx * wz - dz * wx)
        if (along > 0 && along < WARM.shelter * min && across < min * 0.8) shelter = true
      }
      d.exposed = !shelter || alone
      d.alone = alone
    }
  }

  update(dt: number) {
    const t = (this.time += dt)
    // The feel lab tunes the current huddle, including its dots, without restarting.
    if (this.step === 'small' || this.step === 'blizzard') {
      const goal = this.step === 'small' ? WARM.small : WARM.big
      if (goal !== this.goal) {
        this.goal = goal
        this.events.dots(this.warmups, this.goal)
        if (this.warmups >= this.goal) {
          if (this.step === 'small') this.toBlizzard()
          else this.toEgg()
        }
      }
    }
    if (this.later.length) {
      const due = this.later.filter((l) => l.at <= t)
      this.later = this.later.filter((l) => l.at > t)
      due.forEach((l) => l.fn())
    }
    // The wind: it swings round in the blizzard, gusts in the hatch, drops for the song.
    if (this.step === 'blizzard' && t >= this.nextTurn && !this.turning) {
      this.turning = true
      this.windFrom = this.windFrom === 'left' ? 'right' : 'left'
      this.angleTo = this.windFrom === 'left' ? 0 : Math.PI
      this.gustT = t
      huddleSfx.gust()
      this.at(0.9, () => huddleSfx.shuffle())
      // Said the first two times; after that the whoosh says it.
      if (++this.turns <= 2) this.events.cue('turned', true)
    }
    // (It swings round through the back of the ice, so the snow streams curve rather than stop and flip.)
    const da = this.angleTo - this.angle
    if (Math.abs(da) > 0.002) this.angle += da * Math.min(1, dt * 1.1)
    else if (this.turning) {
      this.angle = this.angleTo
      this.turning = false
      this.nextTurn = t + WARM.turn
      if (this.step === 'blizzard') this.events.section('blizzard', { wind: this.windFrom })
    }
    this.windInt += (this.windIntTo - this.windInt) * Math.min(1, dt * 0.8)
    const gust = Math.max(0, 1 - (t - this.gustT) / 1.6)
    const windNow = this.windInt + gust * 0.9
    if (t >= this.nextWhoosh && windNow > 0.3) {
      this.nextWhoosh = t + 3 + Math.random() * 3
      if (windNow > 0.9) huddleSfx.gust()
    }

    this.updateDads(dt, t)
    this.updateChick(dt, t)
    this.updateScene(dt, t, windNow)

    this.lights.follow(0, 0, 0)
    this.lights.ambient.color.set(NIGHT_TINT)
    this.lights.sun.color.set(NIGHT_TINT)
    this.lights.ambient.intensity *= NIGHT_LIGHT[0] + 0.12 * this.low
    this.lights.sun.intensity *= NIGHT_LIGHT[1] + 0.1 * this.low
    this.rig.setShot(this.shot())
    this.rig.update(dt)
  }

  private updateDads(dt: number, t: number) {
    const f = this.finger
    let ground: Vector3 | null = null
    if (f && f.what) ground = this.hitGround(f.x, f.y)
    for (const d of this.dads) {
      if (!d.on) continue
      const px = d.x
      const pz = d.z
      if (d.held && ground && f) {
        const goal = this.clampSpot(ground.x + f.dx, ground.z + f.dz)
        const k = Math.min(1, dt * DRAG.follow)
        d.x += (goal.x - d.x) * k
        d.z += (goal.z - d.z) * k
      } else if (d.cork) {
        d.cork.t += dt / 0.9
        const p = d.cork.t
        if (p >= 1) {
          d.x = d.cork.x1
          d.z = d.cork.z1
          d.cork = null
          d.a.hop()
          huddleSfx.land()
        } else {
          d.x = d.cork.x0 + (d.cork.x1 - d.cork.x0) * smooth(p)
          d.z = d.cork.z0 + (d.cork.z1 - d.cork.z0) * smooth(p)
        }
      } else if (d.walk) {
        const dx = d.walk.x - d.x
        const dz = d.walk.z - d.z
        const l = Math.hypot(dx, dz)
        const v = 1.3 * dt
        d.walkFor += dt
        if (l < 0.05 || d.walkFor > 7) {
          d.walk = null
          d.walkFor = 0
        } else {
          d.x += (dx / l) * Math.min(v, l)
          d.z += (dz / l) * Math.min(v, l)
        }
      }
      if (!d.walk) d.walkFor = 0
      d.lift += ((d.held ? 1 : 0) - d.lift) * Math.min(1, dt * 12)
      if (dt > 0) d.speed = d.speed * 0.8 + (Math.hypot(d.x - px, d.z - pz) / dt) * 0.2
    }
    if (dt > 0) this.pack(dt)
    this.shelter()

    // Warmth: out of the wind they warm up, on the windy edge they cool down.
    const coldK = this.step === 'blizzard' || this.step === 'more' ? WARM.blizzard : this.step === 'chick' ? 0.7 : 1
    for (const d of this.dads) {
      if (!d.on) continue
      const a = d.a
      if (this.step === 'song') {
        d.warmth = Math.min(1, d.warmth + dt / 2)
        if (d.cold) {
          d.cold = false
          a.cheer()
        }
      } else if (d === this.papa && this.step === 'egg' && this.cracks > 0) {
        d.warmth = 1
      } else if (!d.held && !d.cork) {
        if (!d.exposed) d.warmth += dt / WARM.warm
        else d.warmth -= (dt / WARM.cool) * coldK * (d.alone ? WARM.alone : 1)
        d.warmth = clamp(d.warmth)
        if (d.warmth < WARM.shiver && !d.cold) {
          d.cold = true
          a.pull('sad', true)
        }
        if (d.cold && d.warmth >= 0.95) this.warmedUp(d)
        if (d.warmth < 0.12 && !d.walk) d.coldFor += dt
        else if (d.warmth > 0.2) d.coldFor = Math.max(0, d.coldFor)
        if (d.coldFor > WARM.sneeze) this.sneeze(d)
      }
      d.snow = clamp(d.snow + dt * (d.exposed && !d.held && this.step !== 'song' ? 0.05 * (0.5 + this.windInt) : -0.12))
      // A cold one shivers now and then, and his breath puffs.
      if (d.cold && !d.held && t >= d.shiverAt) {
        d.shiverAt = t + 1.1 + Math.random() * 0.6
        a.shake()
        if (t - this.lastBrrr > 2.4) {
          this.lastBrrr = t
          huddleSfx.brrr()
        }
      }
      if (d.warmth < 0.6 && t >= d.breathAt) {
        d.breathAt = t + 0.9 + Math.random() * 0.5
        a.head(tmp)
        this.breath.emit(tmp.x + Math.sin(d.yaw) * 0.3, tmp.y - 0.05, tmp.z + Math.cos(d.yaw) * 0.3, Math.sin(d.yaw) * 0.4, 0.1, Math.cos(d.yaw) * 0.4, 1.1, 0.12)
      }

      // Facing: backs to the wind; held, toward her; walking, the way he goes; singing to Pebble, toward the camera.
      let want = this.backToWind()
      if (d.held) want = 0
      else if (d.walk) want = Math.atan2(d.walk.x - d.x, d.walk.z - d.z)
      else if (d === this.papa && (this.step === 'song' || (this.close && this.time < this.close.until))) want = 0
      // (While it's his egg, or Pebble on his feet, Papa keeps half turned toward her, so she sees them.)
      else if (d === this.papa && (this.step === 'egg' || this.step === 'chick')) want *= 0.45
      else if (this.step === 'song') want = Math.atan2(this.papa.x - d.x, this.papa.z + 1.5 - d.z) * 0.6
      let dy = want - d.yaw
      while (dy > Math.PI) dy -= Math.PI * 2
      while (dy < -Math.PI) dy += Math.PI * 2
      d.yaw += dy * Math.min(1, dt * (d.held ? 8 : 4))

      // Into the rig: where he stands, held up off the snow, waddling when he moves, popping like a cork.
      let y = d.lift * DRAG.lift
      let roll = 0
      if (d.cork) y += bell(d.cork.t) * 1.4
      if (d.held) {
        roll = Math.sin(t * 9 + d.i) * 0.14
        a.armsUp = 0.3 + 0.25 * Math.sin(t * 16 + d.i)
      } else {
        a.armsUp += ((d.cork ? 0.8 : 0) - a.armsUp) * Math.min(1, dt * 8)
        if (d.speed > 0.15) roll = Math.sin(t * 11 + d.i) * 0.09 * Math.min(1, d.speed)
      }
      a.root.position.set(d.x, y, d.z)
      a.root.rotation.set(0, d.yaw, roll)
      a.lean = d.cold && !d.held ? -0.08 : 0
      // Snow on him; the snowflake over a cold one's head.
      const s = smoothstep(0.08, 0.6, d.snow)
      d.cap.visible = d.shoulders.visible = s > 0.02
      d.cap.scale.setScalar(Math.max(0.01, s))
      d.shoulders.scale.setScalar(Math.max(0.01, s))
      d.flake.visible = d.cold && this.step !== 'song'
      if (d.flake.visible) {
        a.at(1.2, tmp)
        d.flake.position.set(tmp.x + Math.sin(t * 30 + d.i) * 0.03, tmp.y + 0.1 + Math.sin(t * 3) * 0.04, tmp.z)
        d.flake.material.rotation = Math.sin(t * 2 + d.i) * 0.3
      }
      a.update(dt, t)
      // His song: his beak opens on each note, and he sways to the tune's shape (high notes one way, low the other).
      const v = d.song
      if (v) {
        const before = noteAt(v.tune, v.t)[0]
        v.t += dt
        const [i, k] = noteAt(v.tune, v.t)
        if (i >= 0) {
          const semi = v.tune[i][0]
          a.root.rotation.z = ((semi - 6) / 6) * 0.22 * bell(Math.min(1, k * 1.1))
          openBeak(a, 0.35 + 0.65 * bell(Math.min(1, k * 1.2)))
          if (v.dots && i !== before) {
            let x = 0
            for (let j = 0; j < i; j++) x += v.tune[j][1]
            const width = tuneSeconds(v.tune) / BEAT
            a.at(1.1, tmp)
            this.bead(tmp.set(tmp.x + ((x + v.tune[i][1] / 2) / width - 0.5) * 0.9, tmp.y + 0.05 + semi * 0.02, tmp.z + 0.2), semi)
          }
        } else openBeak(a, 0)
        if (v.t > tuneSeconds(v.tune) + 0.1) {
          d.song = null
          openBeak(a, 0)
        }
      }
      // The egg on his feet: Papa's wobbles as it gets ready to hatch, and shows its cracks.
      if (d === this.papa && d.egg.visible) {
        const ready = this.step === 'egg' && (d.warmth > 0.7 || this.cracks > 0)
        const wob = ready ? Math.sin(t * 22) * 0.18 * (0.4 + this.eggP) : 0
        d.egg.rotation.set(0, 0, wob)
        d.crack.visible = this.cracks > 0
        d.eggTop.position.y = this.cracks > 1 ? 0.012 : 0
        d.eggTop.rotation.z = this.cracks > 1 ? 0.25 : 0
      }
    }

    // The egg hatches out of the wind: warm in the middle, it wobbles; at the first crack Papa waddles out to the front
    // of the huddle, facing her, and it cracks again and hatches there (a little scripted moment, in close-up).
    const p = this.papa
    if (this.step === 'egg' && this.cracks === 0 && p.warmth > 0.7 && !p.held) {
      this.eggP = Math.min(1 / 3, this.eggP + dt / WARM.egg)
      if (this.eggP >= 1 / 3) this.hatching()
    }
  }

  /** The first crack: Papa steps out in front, the camera comes in close, crack, crack, and out pops Pebble. */
  private hatching() {
    const p = this.papa
    this.cracks = 1
    this.events.dots(1, 3)
    huddleSfx.crack()
    this.eggBits()
    p.held = false
    if (this.finger?.what === p) this.finger = null
    const front = Math.max(...this.dads.filter((d) => d.on && d !== p).map((d) => d.z))
    p.walk = this.clampSpot(clamp(p.x, -1.2, 1.2), Math.min(this.field.hz, front + 1.6 * RADIUS))
    p.warmth = 1
    p.a.cheer()
    p.a.pull('wow')
    this.close = { kind: 'egg', until: this.time + 9 }
    this.at(2.2, () => {
      this.cracks = 2
      this.eggP = 2 / 3
      this.events.dots(2, 3)
      huddleSfx.crack()
      this.eggBits()
    })
    this.at(3.6, () => {
      this.eggP = 1
      this.hatchNow()
    })
  }
  private eggBits() {
    this.papa.egg.getWorldPosition(tmp)
    this.shell.burst(tmp.x, tmp.y + 0.05, tmp.z, 5, 0.8, 1.4, 0.04)
  }

  private updateChick(dt: number, t: number) {
    const c = this.chick
    const a = this.pebble
    if (c.state === 'egg') return
    const p = this.papa
    if (this.step === 'chick' && c.state === 'tucked' && this.tucks < WARM.gusts && t >= this.gustAt && !p.held) this.gust()
    let roll = 0
    let y = 0
    if (c.state === 'tumble' && c.tumble) {
      c.tumble.t += dt / 0.9
      const k = c.tumble.t
      if (k >= 1) {
        c.x = c.tumble.x1
        c.z = c.tumble.z1
        c.tumble = null
        c.state = 'out'
        c.outAt = t
        c.chirpAt = t + 1.5
        huddleSfx.land()
      } else {
        c.x = c.tumble.x0 + (c.tumble.x1 - c.tumble.x0) * smooth(k)
        c.z = c.tumble.z0 + (c.tumble.z1 - c.tumble.z0) * smooth(k)
        y = Math.abs(Math.sin(k * Math.PI * 2)) * 0.35
        roll = k * Math.PI * 3 * Math.sign(c.tumble.x1 - c.tumble.x0 || 1)
      }
    }
    if (c.state === 'out') {
      if (t > c.chirpAt) {
        c.chirpAt = t + 2.6
        huddleSfx.peep()
        a.hop()
      }
      // Left out a long while: Papa waddles over and scoops Pebble up himself.
      if (t - c.outAt > 14 && !p.held && this.step === 'chick') {
        p.walk = this.clampSpot(c.x - Math.sin(p.yaw) * this.feet, c.z - Math.cos(p.yaw) * this.feet)
        const fx = p.x + Math.sin(p.yaw) * this.feet
        const fz = p.z + Math.cos(p.yaw) * this.feet
        if (Math.hypot(c.x - fx, c.z - fz) < WARM.tuck * 0.7) this.tuck()
      }
    }
    if (c.state === 'held' && this.finger) {
      const g = this.hitGround(this.finger.x, this.finger.y)
      if (g) {
        const goal = this.clampSpot(g.x + this.finger.dx, g.z + this.finger.dz)
        const k = Math.min(1, dt * DRAG.follow)
        c.x += (goal.x - c.x) * k
        c.z += (goal.z - c.z) * k
      }
    }
    c.lift += ((c.state === 'held' ? 1 : 0) - c.lift) * Math.min(1, dt * 12)
    if (c.state !== 'tucked') {
      a.root.position.set(c.x, y + c.lift * DRAG.lift * 0.8, c.z)
      const face = Math.atan2(p.x - c.x, p.z - c.z)
      a.root.rotation.set(roll, c.state === 'held' ? 0 : face, c.state === 'held' ? Math.sin(t * 14) * 0.15 : 0)
      a.armsUp = c.state === 'held' || c.state === 'tumble' ? 0.5 + 0.4 * Math.sin(t * 20) : 0.15 + 0.15 * Math.sin(t * 9)
    } else {
      a.armsUp *= 1 - Math.min(1, dt * 6)
      a.root.rotation.set(0, 0, 0)
      // (Listening to Papa's song, he looks up at him.)
      a.lean += ((this.step === 'song' ? -0.3 : 0) - a.lean) * Math.min(1, dt * 3)
    }
    // Popping out of the egg (or back in): a springy grow.
    if (c.pop >= 0) {
      c.pop += dt / 0.6
      const k = Math.min(1, c.pop)
      a.root.scale.setScalar(1 - 0.8 * Math.cos(k * Math.PI * 2.5) * (1 - k))
      if (c.pop >= 1) {
        c.pop = -1
        a.root.scale.setScalar(1)
      }
    }
    // Out on the snow he's cold too.
    const out = c.state === 'out' || c.state === 'tumble'
    this.chickFlake.visible = out && c.state === 'out'
    if (this.chickFlake.visible) {
      a.at(1.25, tmp)
      this.chickFlake.position.set(tmp.x + Math.sin(t * 30) * 0.02, tmp.y + 0.1 + Math.sin(t * 3) * 0.03, tmp.z)
    }
    a.update(dt, t)
    const v = this.chickVoice
    if (v) {
      const before = noteAt(TUNES[0], v.t)[0]
      v.t += dt
      const [i, k] = noteAt(TUNES[0], v.t)
      if (i >= 0) {
        openBeak(a, 0.35 + 0.65 * bell(Math.min(1, k * 1.2)))
        if (i !== before && this.step === 'song') {
          a.at(1.2, tmp)
          let x = 0
          for (let j = 0; j < i; j++) x += TUNES[0][j][1]
          const width = tuneSeconds(TUNES[0]) / BEAT
          this.bead(tmp.set(tmp.x + ((x + TUNES[0][i][1] / 2) / width - 0.5) * 0.6, tmp.y + 0.05 + TUNES[0][i][0] * 0.015, tmp.z + 0.2), TUNES[0][i][0])
        }
      } else openBeak(a, 0)
      if (v.t > tuneSeconds(TUNES[0]) + 0.1) {
        this.chickVoice = null
        openBeak(a, 0)
      }
    }
  }

  private updateScene(dt: number, t: number, windNow: number) {
    // The close-ups bring the lights and the moon down where a low camera sees them.
    this.low += ((this.close && t < this.close.until ? 1 : 0) - this.low) * Math.min(1, dt * 1.5)
    this.aurora.root.position.copy(AURORA_AT).multiplyScalar(smooth(this.low))
    this.moon.position.set(-38 + 22 * this.low, 40 - 22 * this.low, -150 + 30 * this.low)
    this.aurora.amount = 0.9 - 0.4 * this.low
    this.sky.update(t, this.rig.camera, this.scene.fog as Fog)
    this.aurora.update(dt, t)
    for (const l of this.skyLight) {
      const k = t * 0.05 + l.phase
      l.m.position.set(Math.sin(k) * 7, 0.025 + l.phase * 0.002, -3 + Math.cos(k * 1.3) * 4)
      l.m.rotation.z = Math.sin(k * 0.7) * 0.6
      l.mat.opacity = (0.2 + 0.07 * Math.sin(t * 0.6 + l.phase)) * (this.step === 'song' ? 1.6 : 1)
    }

    // Blowing snow, streaming along the wind (falling slowly when it's calm), across the whole ice.
    const [wx, wz] = this.wind()
    const f = this.field
    const n = (8 + windNow * 110) * dt
    for (let i = 0; i < n; i++) {
      const across = (Math.random() - 0.5) * 2 * (f.hz + 3)
      const along = -(f.hx + 4) + Math.random() * 3
      const spd = 1 + windNow * 7
      this.flakes.emit(wx * along - wz * across, 0.2 + Math.random() * 2.6, wz * along + wx * across, wx * spd, -0.3 - Math.random() * 0.4, wz * spd, 2.6 + (1 - windNow) * 2, 0.035 + Math.random() * 0.04)
    }
    this.flakes.update(dt)
    this.puffs.update(dt)
    this.breath.update(dt)
    this.shell.update(dt)

    // The warm middle glows pink-gold on the snow, brighter the more of them are warm.
    const on = this.dads.filter((d) => this.onGround(d))
    if (on.length) {
      const m = this.middle()
      const warm = on.filter((d) => !d.exposed).length / on.length
      const rc = Math.max(RADIUS * 2, ...on.map((d) => Math.hypot(d.x - m.x, d.z - m.z)))
      this.glow.position.set(m.x, 0.03, m.z)
      this.glow.scale.setScalar(rc * 2.4)
      this.glowMat.opacity += ((0.25 + 0.5 * warm) * (this.step === 'song' ? 1.3 : 1) - this.glowMat.opacity) * Math.min(1, dt * 2)
    }

    const pg = this.step === 'egg' || this.step === 'chick' ? 0.55 + 0.25 * Math.sin(t * 3) : 0
    this.papaGlowMat.opacity += (pg - this.papaGlowMat.opacity) * Math.min(1, dt * 3)
    this.papaGlow.position.set(this.papa.x, 0.04, this.papa.z)

    // The seal pops up in his hole now and then (and when she pokes him), looks round, and goes back down.
    const s = this.seal
    if (t >= s.next && s.goal === 0) {
      s.goal = 1
      s.next = t + 3
    } else if (t >= s.next && s.goal === 1) {
      s.goal = 0
      s.next = t + 12 + Math.random() * 10
    }
    s.up += (s.goal - s.up) * Math.min(1, dt * 5)
    s.head.position.y = -0.42 + s.up * 0.55
    s.head.rotation.y = Math.sin(t * 0.9) * 0.6 * s.up
    s.head.visible = s.up > 0.02

    // Hearts and song beads float up and fade.
    for (let i = this.pops.length - 1; i >= 0; i--) {
      const p = this.pops[i]
      p.t += dt
      const k = p.t / p.life
      p.s.position.y += p.vy * dt
      p.s.scale.setScalar(p.size * Math.min(1, p.t * 6) * (1 - smoothstep(0.75, 1, k)) + 0.001)
      if (k >= 1) {
        this.scene.remove(p.s)
        this.pops.splice(i, 1)
      }
    }
    this.updateHint(t)
  }

  /** Stuck for 8 s: pink dots run along the snow from the one that needs it to where it should go. */
  private updateHint(t: number) {
    const target = this.hintTarget()
    const show = !!target && !this.finger && t - this.lastTouch > HINT_S
    for (let i = 0; i < this.hintDots.length; i++) {
      const d = this.hintDots[i]
      d.visible = show
      if (!show || !target) continue
      const k = (i / this.hintDots.length + (t * 0.5) % (1 / this.hintDots.length)) % 1
      d.position.set(target.from.x + (target.to.x - target.from.x) * k, 0.12 + 0.08 * Math.abs(Math.sin(t * 4 + i)), target.from.z + (target.to.z - target.from.z) * k)
      d.scale.setScalar(0.6 + 0.6 * bell(k))
    }
  }
  private hintTarget(): { who: string; from: { x: number; z: number }; to: { x: number; z: number } } | null {
    const p = this.papa
    if (this.step === 'chick' && this.chick.state === 'out') return { who: 'pebble', from: this.chick, to: { x: p.x + Math.sin(p.yaw) * this.feet, z: p.z + Math.cos(p.yaw) * this.feet } }
    if (this.step === 'egg' && p.warmth <= 0.7 && !p.walk) return { who: 'dad:0', from: p, to: this.middle() }
    if (this.step === 'small' || this.step === 'blizzard') {
      const d = this.dads.filter((o) => o.on && o.cold && !o.walk && !o.cork).sort((a, b) => a.warmth - b.warmth)[0]
      if (d) return { who: `dad:${d.i}`, from: d, to: this.middle() }
    }
    return null
  }

  /** What the camera frames: the whole huddle on its ice; in the close-ups, low on Papa (and Pebble) with the lights
   *  behind. */
  private shot(): Shot {
    const f = this.field
    const p = this.papa
    if (this.close && this.time < this.close.until) {
      const c = new Vector3(p.x, 0.75, p.z)
      if (this.close.kind === 'egg') return { center: c.setY(0.6), half: this.tall ? new Vector3(1.4, 0.8, 1.2) : new Vector3(2.2, 0.8, 1.2), yaw: 0, pitch: 22 }
      return { center: c.setY(0.95), half: this.tall ? new Vector3(1.1, 1.25, 0.8) : new Vector3(1.8, 1.15, 0.8), yaw: 0, pitch: 8 }
    }
    return { center: new Vector3(0, 0.6, 0), half: new Vector3(f.hx + 0.3, 0.9, f.hz + 0.5), yaw: 0, pitch: 34 }
  }

  // ---------------------------------------------------------------- World3D

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    const tall = h > w * 1.05
    if (tall !== this.tall || this.field !== (tall ? TALL : WIDE)) {
      this.tall = tall
      this.field = tall ? TALL : WIDE
      // The same huddle stands on the new ice (each kept inside it; the packing sorts out the rest).
      for (const d of this.dads) {
        if (!d.on) continue
        this.clampDad(d)
        if (d.walk) d.walk = this.clampSpot(d.walk.x, d.walk.z)
      }
      Object.assign(this.chick, this.clampSpot(this.chick.x, this.chick.z))
    }
    this.seal.root.position.set(this.field.hx * (tall ? 0.55 : 0.8), 0, -(this.field.hz + 1.2))
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

  private toScreen(v: Vector3) {
    const p = tmp2.copy(v).project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }
  private hitGround(x: number, y: number) {
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    return this.raycaster.ray.intersectPlane(this.ground, new Vector3())
  }
  /** Someone's middle on screen and how big a finger target they need (never under 64 px on a phone, 88 on an iPad). */
  private spot(a: Actor, up = 0.5) {
    const c = this.toScreen(a.at(up, tmp))
    const top = this.toScreen(a.at(1, tmp)).y
    const foot = this.toScreen(a.at(0, tmp)).y
    const min = Math.min(this.w, this.h) < 500 ? 32 : 44
    return { x: c.x, y: c.y, z: c.z, r: Math.max(min, Math.abs(foot - top) * 0.55) }
  }
  private sealSpot() {
    const c = this.toScreen(this.seal.root.getWorldPosition(tmp).setY(0.2))
    return { x: c.x, y: c.y, z: c.z, r: Math.max(Math.min(this.w, this.h) < 500 ? 32 : 44, 60) }
  }

  /** The penguin under her finger (the nearest the camera, when two overlap), or null. */
  private pick(x: number, y: number): Dad | 'chick' | null {
    const c = this.chick
    let best: Dad | 'chick' | null = null
    let bz = Infinity
    if (c.state === 'out' || c.state === 'tumble' || c.state === 'tucked') {
      const s = this.spot(this.pebble, 0.5)
      // (Little: a generous reach, and he wins over the dad behind him.)
      if (Math.hypot(x - s.x, y - s.y) < s.r * DRAG.grab * 1.2) {
        best = 'chick'
        bz = s.z - 0.01
      }
    }
    for (const d of this.dads) {
      if (!d.on || d.cork) continue
      const s = this.spot(d.a, 0.5)
      const dx = (x - s.x) / (s.r * 0.75)
      const dy = (y - s.y) / (s.r * 1.1)
      if (dx * dx + dy * dy < DRAG.grab * DRAG.grab && s.z < bz) {
        best = d
        bz = s.z
      }
    }
    return best
  }

  pointerDown(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    if (this.finger) return
    let what: Dad | 'chick' | null = null
    if (id === 'seal') what = null
    else if (id === 'pebble') what = 'chick'
    else if (id?.startsWith('dad:')) what = this.dads[+id.slice(4)] ?? null
    else what = this.pick(x, y)
    // Nothing to carry during Papa's song: taps only.
    if (this.step === 'song') what = null
    // (Nor Papa while his egg is hatching.)
    if (this.step === 'egg' && this.cracks > 0 && what === this.papa) what = null
    let dx = 0
    let dz = 0
    const g = this.hitGround(x, y)
    if (what === 'chick') {
      const c = this.chick
      if (c.state === 'out' || c.state === 'tumble') {
        c.state = 'held'
        c.tumble = null
        if (g) {
          dx = c.x - g.x
          dz = c.z - g.z
        }
        huddleSfx.grab()
        this.pebble.pull('wow')
      } else what = null
    } else if (what) {
      // (A dad walking in by himself can be picked up too.)
      what.held = true
      what.walk = null
      what.a.pull('wow')
      if (g) {
        dx = what.x - g.x
        dz = what.z - g.z
      }
      // Held from above the middle of him, not his feet: keep him under her finger.
      dx *= 0.3
      dz *= 0.3
      huddleSfx.grab()
      this.events.fact('egg')
    }
    this.finger = { x, y, sx: x, sy: y, moved: 0, dx, dz, what }
  }

  pointerMove(x: number, y: number, _dx: number, _dy: number, held: boolean) {
    const f = this.finger
    if (!f || !held) return
    f.x = x
    f.y = y
    f.moved = Math.max(f.moved, Math.hypot(x - f.sx, y - f.sy))
    this.lastTouch = this.time
  }

  pointerUp() {
    const f = this.finger
    this.finger = null
    this.lastTouch = this.time
    if (!f) return
    const w = f.what
    const carried = f.moved > 14
    if (w === 'chick') {
      if (this.chick.state === 'held') {
        this.dropChick()
        if (carried) this.counts.carries++
      }
    } else if (w) {
      w.held = false
      if (w.cold) w.a.pull('sad', true)
      else w.a.cheer()
      if (carried) {
        this.counts.carries++
        w.a.hop()
        huddleSfx.place()
        this.corkCheck(w)
      }
    }
  }

  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.counts.taps++
    const seal = this.sealSpot()
    if (id === 'seal' || (!id && Math.hypot(x - seal.x, y - seal.y) < seal.r)) return this.pokeSeal()
    const what = id === 'pebble' ? 'chick' : id?.startsWith('dad:') ? this.dads[+id.slice(4)] : this.pick(x, y)
    if (what === 'chick') {
      if (this.chick.state !== 'egg') this.pokeChick()
      return
    }
    if (what) return this.pokeDad(what)
    // The snow puffs where she pokes it; in a close-up, the sky's lights and the moon.
    const g = this.hitGround(x, y)
    if (g && g.distanceTo(this.rig.camera.position) < 60) {
      this.puffs.burst(g.x, 0.05, g.z, 10, 1.2, 1.6, 0.12)
      huddleSfx.snow()
      return
    }
    const m = this.toScreen(this.moon.getWorldPosition(tmp))
    if (Math.hypot(x - m.x, y - m.y) < 70) {
      huddleSfx.moon()
      this.events.fact('night')
    } else {
      this.aurora.flare()
      huddleSfx.lights()
      this.events.fact('lights')
    }
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const target = this.hintTarget()
    const stuck = !!target && !this.finger && this.time - this.lastTouch > HINT_S
    for (const [id, el] of this.anchorEls) {
      let spot: { x: number; y: number; z: number; r: number } | null = null
      if (id.startsWith('dad:')) {
        const d = this.dads[+id.slice(4)]
        if (d?.on && !d.cork) spot = this.spot(d.a, 0.5)
      } else if (id === 'pebble') {
        if (this.chick.state !== 'egg') spot = this.spot(this.pebble, 0.5)
      } else if (id === 'seal') spot = this.sealSpot()
      const show = !!spot && spot.z < 1 && spot.x > -spot.r && spot.x < this.w + spot.r && spot.y > -spot.r && spot.y < this.h + spot.r
      if (show && spot) {
        // Dads are tall: a rounded box over each, the size he looks, never smaller than her finger needs.
        const tall = id.startsWith('dad:')
        const wpx = Math.max(min, spot.r * (tall ? 1.4 : 2))
        const hpx = Math.max(min, spot.r * (tall ? 2.1 : 2))
        el.style.transform = `translate3d(${(spot.x - wpx / 2).toFixed(1)}px, ${(spot.y - hpx / 2).toFixed(1)}px, 0)`
        el.style.width = `${wpx.toFixed(0)}px`
        el.style.height = `${hpx.toFixed(0)}px`
        el.style.borderRadius = tall ? '40%' : '50%'
        // Nearer ones on top; Pebble over the dads.
        el.style.zIndex = String(id === 'pebble' ? 1000 : Math.round((1 - spot.z) * 900))
        const glow = stuck && target?.who === id ? '0 0 0 6px rgba(255,79,154,.55), 0 0 26px 10px rgba(255,200,61,.7)' : ''
        if (el.style.boxShadow !== glow) el.style.boxShadow = glow
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const scr = (a: Actor) => {
      const s = this.spot(a, 0.5)
      return { x: Math.round(s.x), y: Math.round(s.y) }
    }
    const m = this.middle()
    const mid = this.toScreen(tmp.set(m.x, 0.6, m.z))
    return {
      section: this.section,
      step: this.step,
      wind: this.windFrom,
      warmups: this.warmups,
      goal: this.goal,
      egg: +this.eggP.toFixed(2),
      chick: this.chick.state,
      tucks: this.tucks,
      close: this.close && this.time < this.close.until ? this.close.kind : null,
      ended: this.ended,
      time: +this.time.toFixed(1),
      ...this.counts,
      poked: [...this.poked],
      middle: { x: Math.round(mid.x), y: Math.round(mid.y) },
      pebble: this.chick.state === 'egg' ? null : scr(this.pebble),
      dads: this.dads.filter((d) => d.on).map((d) => ({ i: d.i, ...scr(d.a), warmth: +d.warmth.toFixed(2), cold: d.cold, exposed: d.exposed })),
    }
  }

  memory() {
    return { ...this.renderer.info.memory }
  }

  dispose() {
    for (const s of this.stops) s()
    this.blizzardBed?.()
    this.unwatch()
    this.scene.clear()
    this.bag.dispose()
  }
}

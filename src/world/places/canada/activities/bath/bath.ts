// Misty's Bubble Bath (planning/around-the-world/canada-round-2.md, "1. Misty's Bubble Bath"): the world. Misty the
// spirit bear stands in the pool at the foot of the falls on the rainforest river (the chapter's film set,
// story/sets/bath.ts), covered in mud; Maple watches from the shallows by the left bank.
//
// The toy (one verb): rub the bear. Whatever tool is in hand works on the fur under her finger (its tip just above the
// finger, so the finger doesn't hide it); a tap with a tool does a short go with it, so she never has to drag. The first
// tool is already in hand, so play starts at the first touch. The tools sit on a mossy log along the bottom of the
// screen (at most four showing), the one in hand lifted and glowing. It grows three times:
//   wash    the sponge leaves pink suds where she rubs (rub one place and they pile up: a mohawk, horns, a beard) and
//           the mud loosens under them; then the little rain cloud is hers: rain falls where her finger is, pops the
//           suds and rinses the mud away. White shows through (Sparkle: a spirit bear is a black bear with white fur).
//   fluff   the towel puffs her up where she rubs (rub a lot: a giant puffball); the comb does her hairdo, by the way
//           she strokes: up for spikes, down for bangs, sideways for a swoop.
//   colors  three berry bushes: squash one and rub, and the fur there takes the color, as much or as little as she
//           likes (on her head the hairdo takes it too); then ferns, flowers, bows and a crown come up on the log
//           one after another: drop one on her (or tap it) and it goes on the nearest spot (the side verb).
// Then the still pool in front of her glows: a tap and Misty sees herself, the camera goes close and she pulls her big
// face (characters/closeup.ts sillyFilm). Maple holds up the white team sweater; one tap and Misty presses her paw on
// it, THUMP, in whatever berries are on that paw, and pulls it on. The look is saved (looks.ts) for the films, the map
// and the big game.
//
// Silly, any time: tap her nose and she sneezes suds everywhere; tickle her tummy and she kicks the water; rub suds on
// Maple and Maple has a foam beard; tap the soap and Misty bats it clean over the cedars; when the rain is done she
// shakes like a dog and soaks Maple; tap the big cedar and she scratches her back on it. Pokeables: the salmon at the
// falls (she swings, misses, and the splash rinses her), the falls, the cedar, the banana slug, the raven, the rain
// cloud, the soap, Maple. Nothing fails: no clean meter; a muddy patch she's missed sparkles after 8 s; if she does
// nothing the rain finishes the mud and the next tool comes by itself; any amount of color is enough.
//
// Misty is the rig's spirit bear built plain (story/cast.ts Friend), her coat (characters/mistyLook.ts) changed live:
// the same code dresses her in the films, on the map and in the big game. Sparkle's lines and Misty's and Maple's
// reactions are said from here (lines.ts L.bath); the page (BubbleBath.tsx) shows them. Built for engine3d/View3D.tsx;
// nothing here comes from Thailand. The feel numbers are knobs (`bath`, ?feel=1).
import { BackSide, Box3, CanvasTexture, Color, Fog, Group, Mesh, MeshBasicMaterial, Plane, Raycaster, RingGeometry, Scene, SphereGeometry, SRGBColorSpace, Vector2, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp, lineMs, say, spendHint, Timers, type Line } from '../../../../../sdk'
import { knobs, watch } from '../../../../kit/knobs'
import { updateStickyParam } from '../../../../kit/sections'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../engine3d/camera'
import { Letterbox } from '../../../../engine3d/cinema'
import { Bag } from '../../../../engine3d/dispose'
import { FilmPlayer } from '../../../../engine3d/film'
import { automated } from '../../../../engine3d/flags'
import { merge, P, solid } from '../../../../engine3d/geo'
import { setOutlineResolution } from '../../../../engine3d/outline'
import { Particles } from '../../../../engine3d/particles'
import { applyBands, makeLights } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import { meet } from '../../book/met'
import { sillyFilm } from '../../characters/closeup'
import { mistyCoat, muddyMisty, type CoatPart, type MistyCoat } from '../../characters/mistyLook'
import { L } from '../../lines'
import { BERRY_IDS, DECOS, DECO_SPOTS, encodeMisty, MISTY_ZONES, saveMisty, type Berry, type Deco, type DecoSpot, type HairStyle, type MistyLook, type MistyZone } from '../../looks'
import { Friend } from '../../story/cast'
import { BATH as AT, buildRiver, FALLS_Z, MIRROR, RIVER_LOOK, riverSfx, SCRATCH, TALLEST, TOP, updateRiver, type RiverSet } from '../../story/sets/bath'
import { storySfx } from '../../story/sounds'
import { heldSweater, makeBerry, makeBush, makeCloud, makeComb, makeDecoProp, makeLog, makeRaven, makeSlug, makeSoap, makeSoapRock, makeSponge, makeTowel, pawPrint, type LogItem, type Prop, type ToolId } from './props'
import type { BathSection } from './sections'
import { bathSfx as fx } from './sounds'
import { Suds } from './suds'

const FILE = 'src/world/places/canada/activities/bath/bath.ts'
/** How the bath feels: Dad tunes these by hand in the feel lab (?feel=1). */
export const FEEL = knobs('bath', "Misty's bubble bath", FILE, {
  suds: { value: 1, min: 0.2, max: 3, step: 0.1, label: 'Suds per stroke', unit: '×', note: 'how many bubbles the sponge leaves as she rubs' },
  mud: { value: 0.4, min: 0.05, max: 2, step: 0.05, label: 'Mud per stroke', note: 'how much mud the sponge loosens per 100 px of rubbing (it leaves a little for the rain)' },
  rinse: { value: 1.4, min: 0.2, max: 4, step: 0.1, label: 'Rain rinse', unit: '/s', note: 'how fast the rain washes the mud off under the cloud' },
  puff: { value: 0.25, min: 0.02, max: 0.5, step: 0.01, label: 'Puff per stroke', note: 'how much fluffier the towel makes her per 100 px of rubbing' },
  paint: { value: 0.3, min: 0.05, max: 1, step: 0.05, label: 'Color per stroke', note: 'how much berry color goes on per 100 px of rubbing' },
  reach: { value: 0.15, min: 0.05, max: 0.4, step: 0.01, label: "A tool's reach", unit: 'm', note: 'how far round her finger a tool works' },
  tap: { value: 1.0, min: 0.3, max: 2.5, step: 0.1, label: "A tap's short go", unit: 's', note: 'how long a tool works by itself after a tap' },
  glow: { value: 16, min: 4, max: 40, step: 1, label: 'Strokes before the pool glows', note: 'strokes and decorations in the colors part before the mirror' },
  idle: { value: 14, min: 6, max: 40, step: 1, label: 'Moves on by itself after', unit: 's', note: 'with nothing done for this long, the next tool comes anyway' },
})

export interface BathStart {
  section: BathSection
  /** The look a colors or mirror link starts in (`?look=`), or null for the usual. */
  look: MistyLook | null
  /** The chapter's way-in film has just played: no hello, straight to Sparkle's line. */
  filmed: boolean
}
export interface BathEvents {
  /** She reached the next part (the address bar follows). */
  section(s: BathSection): void
  /** Sparkle said (or showed) a line: the bubble shows it. */
  guide(l: Line): void
  /** A line in the close-up (its words under the picture), or null. */
  film(l: Line | null): void
  /** Misty has her sweater on: the payoff is over (then the film out and the stamp). */
  done(): void
}

/** The parts of the bath, in play order. */
type Stage = 'story' | 'sponge' | 'rain' | 'towel' | 'comb' | 'berries' | 'mirror' | 'sweater' | 'done'
const SECTION_OF: Record<Stage, BathSection> = { story: 'story', sponge: 'wash', rain: 'wash', towel: 'fluff', comb: 'fluff', berries: 'colors', mirror: 'mirror', sweater: 'mirror', done: 'mirror' }
const B = L.bath

export const BATH_ANCHORS: AnchorInfo[] = [
  ...(['sponge', 'cloud', 'towel', 'comb', 'pink', 'blue', 'purple', 'deco'] as const).map((id): AnchorInfo => ({ id: `tool:${id}`, label: id === 'deco' ? 'A decoration from the mossy log' : id === 'cloud' ? 'The little rain cloud' : BERRY_IDS.includes(id as Berry) ? `The ${id} berry bush` : `The ${id}`, kind: 'thing' })),
  { id: 'nose', label: "Misty's nose", kind: 'thing' },
  { id: 'tummy', label: "Misty's tummy", kind: 'thing' },
  { id: 'pool', label: 'The pool, glowing like a mirror', kind: 'thing' },
  { id: 'sweater', label: 'The team sweater', kind: 'thing' },
  { id: 'maple', label: 'Maple', kind: 'thing' },
  { id: 'soap', label: 'The soap', kind: 'thing' },
  { id: 'cedar', label: 'The big cedar tree', kind: 'thing' },
  { id: 'salmon', label: 'The salmon in the falls', kind: 'thing' },
  { id: 'falls', label: 'The waterfall', kind: 'thing' },
  { id: 'slug', label: 'The banana slug', kind: 'thing' },
  { id: 'raven', label: 'The raven', kind: 'thing' },
  { id: 'sky-cloud', label: 'The rain cloud', kind: 'thing' },
]

/** Px a finger rubs for one stroke (the plan's counts: about 40-60 strokes and taps in all). */
const STROKE_PX = 360
/** Strokes with the towel, and with the comb, before the next tool comes (the barber's ENOUGH). */
const ENOUGH = 8
/** The sponge part is done enough when her front's mud is down to this (it never goes below SPONGE_FLOOR). */
const SPONGE_DONE = 0.58
const SPONGE_FLOOR = 0.28
/** The rain part: white shows through at this much mud. */
const WHITE_AT = 0.16
/** Strokes of color before the decorations come up on the log. */
const DECO_AT = 6
/** Misty and Maple say something at most this often (s), never after every stroke. */
const SILLY_GAP = 12
const HINT_S = 8
/** Pixels: the tool's tip sits this far above her finger. */
const LIFT_PX = 30
/** Meters from the camera to the log. */
const LOG_D = 1.6
/** The order a tapped decoration takes the spots in. */
/** Her paw out to the side and forward onto the sweater (radians round the shoulder: forward, out). */
const PRESS = { x: -0.85, z: 1.05 }
const SPOT_ORDER: DecoSpot[] = ['crown', 'earL', 'earR', 'chest', 'nose']
/** The order a berry's short go paints the zones in (the ones the camera sees best first). */
const PAINT_ORDER: MistyZone[] = ['tummy', 'earL', 'earR', 'armL', 'armR', 'head', 'chest', 'legL', 'legR', 'muzzle']
/** Where Maple stands (wide screens, tall screens), and the soap's rock, the slug, the raven's branch, the rain cloud
 *  in the sky (before it's hers), the salmon's pool and the falls. */
const MAPLE_WIDE: [number, number, number] = [-1.25, -0.06, -1.6]
const MAPLE_TALL: [number, number, number] = [-0.74, -0.06, -1.55]
const SOAP_ROCK = new Vector3(-0.92, -0.08, -0.95)
const SLUG_AT = new Vector3(-1.98, 0.34, -2.12)
const RAVEN_AT = new Vector3(SCRATCH.x - SCRATCH.r - 0.36, 1.72, SCRATCH.z + 0.1)
const SKY_CLOUD = new Vector3(-0.55, 1.72, -2.6)
const SALMON_POOL = new Vector3(0.95, 0.05, FALLS_Z + 0.8)
const FALLS_AT = new Vector3(-0.55, 1.05, FALLS_Z + 0.2)

const tmp = new Vector3()
const tmp2 = new Vector3()
const tmp3 = new Vector3()
const ndc = new Vector2()

/** What a finger is on: Misty (a part of her, the point on it in that part's space, the way out of her there, the zone)
 *  or Maple (her head, for a foam beard). */
interface Hit {
  who: 'misty' | 'maple'
  part: CoatPart | null
  pivot: Object3D
  local: Vector3
  normal: Vector3
  world: Vector3
  zone: MistyZone | null
}

/** Something Misty is busy doing (her arms and body are posed after the rig's own each frame). */
type Act = { kind: 'swing' | 'shake' | 'scratch' | 'kick' | 'sneeze' | 'press' | 'dress' | 'look'; t: number; dur: number; what?: 'salmon' | 'soap' }

export class BubbleBathWorld implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  readonly timers = new Timers()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private w = 1
  private h = 1
  private tall = false
  private t = 0
  private anchorEls = new Map<string, HTMLElement>()
  private hintEl: HTMLElement | null = null
  private river: RiverSet
  private dome: Mesh
  readonly misty: Friend
  readonly coat: MistyCoat
  readonly maple: Friend
  private suds: Suds
  private bits: Particles
  private drops: Particles
  private films: FilmPlayer
  private bars = new Letterbox()
  private ray = new Raycaster()

  // ---- the tools and the log
  private log: Group
  private props = new Map<LogItem, Prop>()
  /** What the log holds now, left to right. */
  private onLog: LogItem[] = []
  /** Each item's spot on the log this frame (world) and its size on screen (px). */
  private slots = new Map<LogItem, { at: Vector3; px: number; x: number; y: number }>()
  /** The tool in her hand (it works where she rubs). */
  private tool: ToolId = 'sponge'
  /** The decoration the log offers next. */
  private decoNext = 0
  private decoOn = false

  // ---- her finger
  private finger = new Vector2(NaN, NaN)
  private lastTip = new Vector2(NaN, NaN)
  private rubbing = false
  private held: { deco: Deco; prop: Prop } | null = null
  /** A tap's short go: the tool works round a point by itself. */
  private auto: { t: number; dur: number; x: number; y: number; dir: Vector2 } | null = null
  /** Where the tool is (world), easing to her finger and back to the log. */
  private acc = { suds: 0, stroke: 0, comb: new Vector2(), combPx: 0, combLen: 0, paint: 0, squeak: 0 }
  private flying: { prop: Prop; from: Vector3; t: number; deco: Deco; spot: DecoSpot }[] = []

  // ---- progress
  private stage: Stage = 'story'
  private stageT = 0
  private stageStrokes = 0
  /** Strokes and taps in all (QA, pacing). */
  strokes = 0
  private idle = 0
  private hintT = 0
  private lastReact = -Infinity
  private said = new Set<string>()
  private colorsSaid = new Set<Berry>()
  private paintI = 0
  private whiteT = -1
  private puffball = false
  private styleI = 0
  private autoRain: { t: number } | null = null
  private act: Act | null = null
  private kicks = 0
  private sparkleT = 0
  private soap: { g: Group; rock: Group; t: number; from: Vector3; to: Vector3; state: 'rock' | 'slip' | 'fly' | 'gone' }
  private slug: ReturnType<typeof makeSlug> & { poke: number }
  private raven: ReturnType<typeof makeRaven> & { poke: number }
  private skyCloud: Group
  private skyCloudT = -1
  private rainbow: Group
  private rainbowT = -1
  private sweater: ReturnType<typeof heldSweater> | null = null
  private print: Berry[] = []
  private pressArm: 'armL' | 'armR' = 'armL'
  private doneT = -1
  private gone = false
  private beard = 0

  constructor(
    private renderer: WebGLRenderer,
    private start: BathStart,
    private events: BathEvents,
  ) {
    const { scene, bag } = this
    applyBands()
    const [fogC, near, far] = RIVER_LOOK.fog
    scene.fog = new Fog(fogC, near, far)
    this.rig.fov = 40
    this.rig.lag = 0.6
    this.rig.camera.near = 0.05
    this.rig.camera.far = 900
    this.rig.camera.updateProjectionMatrix()
    // The sky: the set's three colors on a dome round the camera.
    const c = document.createElement('canvas')
    c.width = 4
    c.height = 256
    const g2 = c.getContext('2d')!
    const grad = g2.createLinearGradient(0, 0, 0, 256)
    grad.addColorStop(0, RIVER_LOOK.sky[0])
    grad.addColorStop(0.3, RIVER_LOOK.sky[1])
    grad.addColorStop(0.5, RIVER_LOOK.sky[2])
    grad.addColorStop(1, RIVER_LOOK.sky[2])
    g2.fillStyle = grad
    g2.fillRect(0, 0, 4, 256)
    const tex = bag.add(new CanvasTexture(c))
    tex.colorSpace = SRGBColorSpace
    this.dome = new Mesh(bag.add(new SphereGeometry(700, 24, 16)), bag.add(new MeshBasicMaterial({ map: tex, side: BackSide, fog: false, depthWrite: false })))
    this.dome.renderOrder = -10
    this.dome.frustumCulled = false
    scene.add(this.dome)
    const tint = new Color(RIVER_LOOK.tint ?? '#FFF7F0')
    this.lights.ambient.color.copy(tint)
    this.lights.sun.color.copy(tint)

    const riverRoot = new Group()
    scene.add(riverRoot)
    this.river = buildRiver(bag, riverRoot)
    // (The falls' mist stays back by the falls: in front of her it would haze her over.)
    for (const m of this.river.mist) m.position.z = Math.min(m.position.z, FALLS_Z + 0.55)

    // Misty, plain (her coat changes as she plays), and Maple.
    this.misty = new Friend('spirit', bag, { height: 1.45, voice: 'bear', plain: true })
    this.misty.place(AT.x, AT.y, AT.z, 0)
    this.coat = mistyCoat(this.misty, bag)
    this.maple = new Friend('maple', bag, { height: 0.95, voice: 'maple' })
    this.maple.place(...MAPLE_WIDE, 25)
    scene.add(this.misty.root, this.maple.root)

    this.suds = new Suds(260, scene, bag)
    this.bits = new Particles({ kind: 'spray', count: 260, colors: ['#FFFFFF', '#FFE3F0', '#FF8FB8', '#7FB2FF', '#B48CF2', '#FFD86B', '#8FD3F7', '#FFFAF0'], gravity: 4 }, bag)
    this.drops = new Particles({ kind: 'spray', count: 220, color: '#8FD3F7', gravity: 9 }, bag)
    scene.add(this.bits.mesh, this.drops.mesh)

    // The log and its things (each tool is built once; the log shows the ones in play).
    this.log = makeLog(bag)
    scene.add(this.log)
    const add = (id: LogItem, p: Prop) => {
      this.props.set(id, p)
      p.root.visible = false
      scene.add(p.root)
    }
    add('sponge', makeSponge(bag))
    add('cloud', makeCloud(bag))
    add('towel', makeTowel(bag))
    add('comb', makeComb(bag))
    for (const b of BERRY_IDS) add(b, makeBerry(b, bag))
    for (const b of BERRY_IDS) add(`bush:${b}` as LogItem, makeBush(b, bag))
    for (const d of DECOS) add(`deco:${d}`, makeDecoProp(d, bag))

    // The pokeables round the pool.
    const rock = makeSoapRock(bag)
    rock.position.copy(SOAP_ROCK)
    const soapG = makeSoap(bag)
    scene.add(rock, soapG)
    this.soap = { g: soapG, rock, t: 0, from: new Vector3(), to: new Vector3(), state: 'rock' }
    this.restSoap()
    const slug = makeSlug(bag)
    slug.root.position.copy(SLUG_AT)
    slug.root.rotation.y = 0.5
    scene.add(slug.root)
    this.slug = { ...slug, poke: -1 }
    const raven = makeRaven(bag)
    raven.root.position.copy(RAVEN_AT)
    raven.root.rotation.y = -0.5
    // Its branch: a stub off the big cedar, with a tuft of needles at the end.
    const stub = solid(merge([P.cyl(0.05, 0.08, 0.75, '#7A4434', { at: [RAVEN_AT.x + 0.2, RAVEN_AT.y - 0.03, RAVEN_AT.z - 0.05], rot: [0, 0, Math.PI / 2 - 0.12] }, 8), P.sphere(0.16, '#4C9457', { at: [RAVEN_AT.x - 0.2, RAVEN_AT.y + 0.02, RAVEN_AT.z - 0.05], scale: [1.3, 0.6, 1] }, 10)]), bag, 1.6)
    scene.add(stub, raven.root)
    this.raven = { ...raven, poke: -1 }
    this.skyCloud = new Group()
    const sc = makeCloud(bag)
    sc.root.scale.setScalar(1.6)
    this.skyCloud.add(sc.root)
    this.skyCloud.position.copy(SKY_CLOUD)
    scene.add(this.skyCloud)
    // A rainbow over the falls (a tap on the falls), five bands.
    this.rainbow = new Group()
    ;['#FF8FB8', '#FFC27A', '#FFE27A', '#8FE3C8', '#9DB8FF'].forEach((col, i) => {
      const m = new Mesh(bag.add(new RingGeometry(1.5 - i * 0.12, 1.62 - i * 0.12, 40, 1, 0, Math.PI)), bag.add(new MeshBasicMaterial({ color: col, transparent: true, opacity: 0, depthWrite: false, fog: false })))
      this.rainbow.add(m)
    })
    this.rainbow.position.set(0, TOP + 0.1, FALLS_Z - 0.4)
    this.rainbow.visible = false
    scene.add(this.rainbow)

    this.films = new FilmPlayer({ line: (l) => this.events.film(l), state: () => {} })

    // The river's sound (the falls, the stream, the rain on the leaves) is the set's bed: it's in the bag.
    this.begin()
    if (automated) (window as unknown as { __bathDev?: unknown }).__bathDev = this.devHooks()
    this.unwatch = watch('bath', () => ({ finger: [Number.isNaN(this.finger.x) ? 0 : 1, 1], mud: [this.coat.mudOf(), 1], puff: [this.coat.puff, 1] }))
  }
  private unwatch: () => void

  // ---------------------------------------------------------------- the parts

  /** Sets the bath up for where the link starts (as if she had played to there). */
  private begin() {
    const { section, look, filmed } = this.start
    const coat = this.coat
    if (section === 'story' || section === 'wash') {
      muddyMisty(this.misty, this.bag)
      coat.showHair(false)
      this.go(section === 'story' && !filmed ? 'story' : 'sponge', true)
    } else if (section === 'fluff') {
      coat.apply(null)
      coat.wet('all', 0.8)
      coat.showHair(false)
      this.skyCloud.visible = false
      this.go('towel', true)
    } else if (section === 'colors') {
      coat.apply(look ? { ...look, sweater: false, worn: [], fur: {} } : null)
      if (!look) for (const z of MISTY_ZONES) if (z !== 'muzzle') coat.zones[z].puff = 0.5
      if (!look) coat.setHair('fluff', null)
      coat.refresh(true)
      this.skyCloud.visible = false
      this.go('berries', true)
    } else {
      coat.apply(look ? { ...look, sweater: false } : null)
      if (!look) for (const z of MISTY_ZONES) if (z !== 'muzzle') coat.zones[z].puff = 0.5
      if (!look) coat.setHair('spikes', null)
      coat.refresh(true)
      this.skyCloud.visible = false
      this.decoOn = true
      this.go('mirror', true)
    }
  }

  /** On to a part: the tools it brings, Sparkle's line for it. */
  private go(stage: Stage, first = false) {
    const was = this.stage
    this.stage = stage
    this.stageT = 0
    this.stageStrokes = 0
    this.idle = 0
    this.hintT = 0
    if (SECTION_OF[stage] !== SECTION_OF[was] || first) this.events.section(SECTION_OF[stage])
    const S = (l: Line) => this.guide(l)
    if (stage === 'story') {
      this.setLog(['sponge'])
      this.tool = 'sponge'
      // Maple's hello from the bank (a touch skips it).
      this.timers.later(() => {
        if (this.stage !== 'story') return
        this.maple.hop()
        this.maple.wave()
        this.talk(B.story[0])
      }, 500)
    } else if (stage === 'sponge') {
      this.setLog(['sponge'])
      this.tool = 'sponge'
      S(B.rub)
    } else if (stage === 'rain') {
      // The cloud comes down out of the sky onto the log, and it's hers.
      this.skyCloudT = 0
      this.setLog(['sponge', 'cloud'])
      this.tool = 'cloud'
      S(B.rain)
    } else if (stage === 'towel') {
      this.setLog(['towel'])
      this.tool = 'towel'
      S(B.towel)
    } else if (stage === 'comb') {
      this.setLog(['towel', 'comb'])
      this.tool = 'comb'
      this.coat.showHair(true)
      this.coat.wet('all', 0)
      if (!this.coat.hairGroup) this.coat.setHair('fluff', null)
      fx.deco()
    } else if (stage === 'berries') {
      this.setLog(['pink', 'blue', 'purple', ...(this.decoOn ? (['deco:x'] as LogItem[]) : [])])
      this.tool = 'pink'
      S(B.berries)
    } else if (stage === 'mirror') {
      this.setLog(['pink', 'blue', 'purple', ...(this.decoOn ? (['deco:x'] as LogItem[]) : [])])
      if (!BERRY_IDS.includes(this.tool as Berry)) this.tool = 'pink'
      this.river.mirror.goal = 1
      fx.shimmer()
      S(B.pool)
      this.saveLook(false)
    } else if (stage === 'sweater') {
      this.setLog([])
      this.bringSweater()
      S(B.sweater)
    }
    if (!first && stage !== 'story' && stage !== 'mirror' && stage !== 'sweater') this.cheer()
  }

  /** Sparkle says it (after whoever's talking), and the bubble shows it. */
  private guide(l: Line, voice = true) {
    this.events.guide(l)
    if (voice) void say(l, { interrupt: false })
  }
  /** Misty or Maple says something (at most every SILLY_GAP s, unless `always`). */
  private talk(l: Line, always = false) {
    if (!always && this.t - this.lastReact < SILLY_GAP) return false
    this.lastReact = this.t
    void say(l, { interrupt: false })
    return true
  }
  /** Sparkle's fact the first time she pokes something. */
  private fact(key: string, l: Line) {
    if (this.said.has(key)) return false
    this.said.add(key)
    this.guide(l)
    return true
  }
  private cheer() {
    const lines = B.cheer
    if (this.talk(lines[Math.floor(Math.random() * lines.length)])) {
      this.maple.hop()
      this.maple.armsUp = 1
      this.timers.later(() => (this.maple.armsUp = 0), 900)
    }
  }

  /** What the log holds now (a decoration slot shows the next decoration). */
  private setLog(items: LogItem[]) {
    this.onLog = items
  }
  private logShown(): LogItem[] {
    return this.onLog.map((i) => (i === 'deco:x' ? (`deco:${DECOS[this.decoNext % DECOS.length]}` as LogItem) : BERRY_IDS.includes(i as Berry) ? (`bush:${i}` as LogItem) : i))
  }

  // ---------------------------------------------------------------- the engine's side

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.tall = h > w * 1.05
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
    this.rig.setShot(this.shot(), true)
    if (this.stage !== 'sweater' && !this.act) this.maple.place(...(this.tall ? MAPLE_TALL : MAPLE_WIDE), 25)
  }
  setAnchorElements(els: Map<string, HTMLElement>) {
    this.anchorEls = els
  }
  setHintElement(el: HTMLElement | null) {
    this.hintEl = el
  }
  get calm() {
    return false
  }

  /** The camera: Misty big in the middle, Maple beside her, room for the log below her feet. */
  private shot(): Shot {
    const close = this.act?.kind === 'scratch'
    if (this.tall) return { center: new Vector3(AT.x - 0.12 + (close ? 0.5 : 0), 0.62, AT.z), half: new Vector3(0.95, 1.12, 0.3), yaw: 0, pitch: 7, minDist: 2.5 }
    return { center: new Vector3(AT.x - 0.38 + (close ? 0.6 : 0), 0.62, AT.z), half: new Vector3(1.45, 1.06, 0.3), yaw: 0, pitch: 7, minDist: 2.5 }
  }

  update(dt: number) {
    const t = (this.t += dt)
    const cine = this.films.update(dt, this.w / this.h)
    this.stageT += dt
    this.idle += dt
    // A touch-free test browser runs at a crawl: no part's clock should jump.
    dt = Math.min(dt, 0.1)

    this.misty.update(dt, t)
    this.maple.update(dt, t)
    this.pose(dt)
    // The sweater in the air beside Maple, bobbing a little as she holds it up.
    if (this.sweater?.root.visible) this.sweater.root.position.copy(this.sweaterAt).add(tmp.set(0, Math.sin(t * 2.4) * 0.012, 0))
    this.coat.update(dt, t)
    this.tools(dt)
    this.flyDecos(dt)
    this.progress(dt)
    this.pokeables(dt, t)
    this.suds.update(dt, t)
    this.bits.update(dt)
    this.drops.update(dt)
    updateRiver(this.river, dt, t, this.rig.camera, (x, y, z, n) => this.splash(x, y, z, n))
    this.hint(dt)

    this.lights.follow(AT.x, 0.8, AT.z)
    this.lights.ambient.intensity *= RIVER_LOOK.light?.[0] ?? 1
    this.lights.sun.intensity *= RIVER_LOOK.light?.[1] ?? 1
    this.dome.position.copy(this.rig.camera.position)
    this.rig.setShot(this.shot())
    this.rig.setCine(cine)
    this.rig.update(dt)
    this.bars.update(dt, this.films.on)
    this.placeLog()
  }

  render() {
    this.bars.render(this.renderer, this.scene, this.rig.camera, this.w, this.h)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  // ---------------------------------------------------------------- screen and world

  private toScreen(v: Vector3) {
    const p = v.clone().project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }
  /** The point `d` meters from the camera along the ray through a screen point. */
  private along(x: number, y: number, d: number, out = new Vector3()) {
    ndc.set((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1)
    this.ray.setFromCamera(ndc, this.rig.camera)
    return out.copy(this.ray.ray.origin).addScaledVector(this.ray.ray.direction, d)
  }
  /** Where a screen point meets the plane z = `z` (in front of her). */
  private onPlane(x: number, y: number, z: number, out = new Vector3()) {
    ndc.set((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1)
    this.ray.setFromCamera(ndc, this.rig.camera)
    const plane = new Plane(new Vector3(0, 0, 1), -z)
    return this.ray.ray.intersectPlane(plane, out) ?? out.copy(this.ray.ray.origin)
  }
  /** What's under a screen point: Misty's fur, or Maple. */
  private hitAt(x: number, y: number): Hit | null {
    ndc.set((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1)
    this.ray.setFromCamera(ndc, this.rig.camera)
    const mapleParts = [this.maple.rig.head.children[0], this.maple.rig.body.children[0]].filter(Boolean)
    const hits = this.ray.intersectObjects([...this.coat.meshes, ...mapleParts], false)
    const h = hits[0]
    if (!h || !h.face) return null
    const part = this.coat.partOf(h.object)
    if (part) {
      const local = part.pivot.worldToLocal(h.point.clone())
      const kind = part.kind[h.face.a]
      return { who: 'misty', part: part.part, pivot: part.pivot, local, normal: h.face.normal.clone(), world: h.point.clone(), zone: this.coat.zoneAt(part.part, local, kind) }
    }
    const pivot = this.maple.rig.head
    return { who: 'maple', part: null, pivot, local: pivot.worldToLocal(h.point.clone()), normal: h.face.normal.clone(), world: h.point.clone(), zone: null }
  }
  /** A zone's middle on screen (the short goes aim there; QA rubs there). */
  zoneScreen(zone: MistyZone) {
    const w = this.zoneWorld(zone, tmp3)
    return this.toScreen(w)
  }
  private zoneMids = new Map<MistyZone, { part: CoatPart; p: Vector3 }>()
  private zoneWorld(zone: MistyZone, out: Vector3) {
    let m = this.zoneMids.get(zone)
    if (!m) {
      // The middle of the zone's front: the mean of its vertices that face the camera.
      const zi = MISTY_ZONES.indexOf(zone)
      let best: { part: CoatPart; p: Vector3; n: number } | null = null
      for (const p of this.coat.parts) {
        const s = new Vector3()
        let n = 0
        for (let i = 0; i < p.zone.length; i++) {
          if (p.zone[i] !== zi || p.nrm[i * 3 + 2] < 0.35) continue
          s.x += p.pos[i * 3]
          s.y += p.pos[i * 3 + 1]
          s.z += p.pos[i * 3 + 2]
          n++
        }
        if (n && (!best || n > best.n)) best = { part: p.part, p: s.divideScalar(n), n }
      }
      m = best ? { part: best.part, p: best.p } : { part: 'body', p: new Vector3(0, 0.4, 0.2) }
      this.zoneMids.set(zone, m)
    }
    const part = this.coat.parts.find((p) => p.part === m!.part)!
    return part.pivot.localToWorld(out.copy(m.p))
  }

  // ---------------------------------------------------------------- the log

  /** The log along the bottom of the screen, and its things on it (the one in hand lifted and glowing). */
  private placeLog() {
    const items = this.logShown()
    const n = Math.max(1, items.length)
    const left = Math.min(150, this.w * 0.2)
    const right = 14
    const px = clamp(Math.min(this.h * 0.15, (this.w - left - right) / (n + 0.35)), 66, 118)
    const y = this.h - px * 0.8
    // The log itself spans the screen (it reads as the near bank).
    const mid = this.along(this.w / 2, this.h - px * 0.3, LOG_D, tmp)
    const edge = this.along(0, this.h - px * 0.3, LOG_D, tmp2)
    this.log.position.copy(mid)
    this.log.quaternion.copy(this.rig.camera.quaternion)
    const span = mid.distanceTo(edge) * 2.3
    const perPx = this.along(this.w / 2 + 100, this.h - px * 0.3, LOG_D, tmp3).distanceTo(mid) / 100
    this.log.scale.set(span, (px * 0.62 * perPx) / 0.22, (px * 0.62 * perPx) / 0.22)
    this.slots.clear()
    const busy = this.films.on || this.stage === 'done'
    this.log.visible = !busy && this.stage !== 'sweater'
    items.forEach((id, i) => {
      const x = left + (this.w - left - right) * ((i + 0.5) / n)
      const at = this.along(x, y, LOG_D - 0.08, new Vector3())
      this.slots.set(id, { at, px, x, y })
    })
    // Each prop: on the log where it is, the tool in hand under her finger (tools() put it there).
    for (const [id, p] of this.props) {
      const slot = this.slots.get(id)
      const inHand = (this.isTool(id) && id === this.tool && (this.rubbing || this.auto)) || (id === 'cloud' && !!this.autoRain)
      const held = this.held?.prop === p
      const flying = this.flying.some((f) => f.prop === p)
      if (inHand || held || flying) continue
      const onLog = !!slot && !busy
      // A berry in hand shows as its bush on the log (the berry itself only while she paints).
      p.root.visible = onLog
      if (!onLog || !slot) continue
      // (The rain cloud is still on its way down out of the sky.)
      if (id === 'cloud' && this.skyCloud.visible) p.root.visible = false
      const lifted = this.chosen(id)
      const k = (slot.px * 0.84 * perPx) / this.sizeOf(p)
      const bob = lifted ? 0.18 * slot.px * perPx + Math.sin(this.t * 4) * 0.04 * slot.px * perPx : 0
      p.root.position.copy(slot.at).addScaledVector(this.rig.camera.up, bob)
      p.root.quaternion.copy(this.rig.camera.quaternion)
      p.squish = Math.max(0, p.squish - 0.016)
      const sq = bell(Math.min(1, p.squish * 3))
      p.root.scale.set(k * (lifted ? 1.12 : 0.92) * (1 + sq * 0.2), k * (lifted ? 1.12 : 0.92) * (1 - sq * 0.2), k)
      p.model.rotation.z = lifted ? Math.sin(this.t * 3) * 0.08 : 0
    }
  }
  /** Is this log item the tool in her hand (a bush: its berry)? */
  private chosen(id: LogItem) {
    return id === this.tool || id === `bush:${this.tool}`
  }
  private isTool(id: LogItem): id is ToolId {
    return id === 'sponge' || id === 'cloud' || id === 'towel' || id === 'comb' || BERRY_IDS.includes(id as Berry)
  }
  /** A log item from its anchor id (`tool:pink`, `tool:deco`). */
  private itemOf(anchor: string): LogItem | null {
    const id = anchor.slice(5)
    if (id === 'deco') return this.onLog.includes('deco:x') ? (`deco:${DECOS[this.decoNext % DECOS.length]}` as LogItem) : null
    if (BERRY_IDS.includes(id as Berry)) return this.onLog.includes(id as LogItem) ? (`bush:${id}` as LogItem) : null
    return this.onLog.includes(id as LogItem) ? (id as LogItem) : null
  }
  private sizes = new Map<Prop, number>()
  /** A thing's biggest side as built (so every one sits on the log at the same size). */
  private sizeOf(p: Prop) {
    let s = this.sizes.get(p)
    if (s === undefined) {
      const keep = p.root.scale.clone()
      const q = p.root.quaternion.clone()
      p.root.scale.setScalar(1)
      p.root.quaternion.identity()
      p.root.updateMatrixWorld(true)
      const size = new Box3().setFromObject(p.model).getSize(new Vector3())
      p.root.scale.copy(keep)
      p.root.quaternion.copy(q)
      s = Math.max(0.05, size.x, size.y, size.z)
      this.sizes.set(p, s)
    }
    return s
  }
  /** Picks a tool up off the log (a bush: squashed, and its berry is in her hand). */
  private choose(id: ToolId) {
    if (this.tool !== id) {
      this.tool = id
      const p = this.props.get(BERRY_IDS.includes(id as Berry) ? (`bush:${id}` as LogItem) : id)
      if (p) p.squish = 0.4
      if (BERRY_IDS.includes(id as Berry)) {
        fx.squash()
        const s = this.slots.get(`bush:${id}` as LogItem)
        if (s) this.bits.burst(s.at.x, s.at.y, s.at.z, 10, 0.6, 1.2, 0.03, 2 + BERRY_IDS.indexOf(id as Berry))
      } else storySfx.pop()
    }
    this.idle = 0
  }

  // ---------------------------------------------------------------- her finger

  pointerDown(x: number, y: number, id?: string) {
    if (this.films.on || this.stage === 'done') return
    this.finger.set(x, y)
    this.lastTip.set(NaN, NaN)
    if (this.stage === 'story') this.skipStory()
    if (id?.startsWith('tool:')) {
      const item = this.itemOf(id)
      if (!item) return
      if (item.startsWith('deco:')) {
        const deco = item.slice(5) as Deco
        this.held = { deco, prop: this.props.get(item)! }
        return
      }
      this.choose((item.startsWith('bush:') ? item.slice(5) : item) as ToolId)
      this.rubbing = true
      return
    }
    if (id && !['nose', 'tummy', 'maple'].includes(id)) return
    if (this.stage === 'sweater' || (this.act && this.act.kind === 'scratch')) return
    this.rubbing = true
    this.auto = null
  }
  pointerMove(x: number, y: number, _dx: number, _dy: number, held: boolean) {
    if (!held) return
    this.finger.set(x, y)
  }
  pointerUp() {
    if (this.held) this.dropDeco()
    this.rubbing = false
    this.finger.set(NaN, NaN)
    this.acc.comb.set(0, 0)
  }
  tap(x: number, y: number, id?: string) {
    if (this.films.on || this.stage === 'done') return
    this.idle = 0
    if (id?.startsWith('tool:')) {
      const item = this.itemOf(id)
      if (!item) return
      if (item.startsWith('deco:')) return this.tapDeco(item.slice(5) as Deco)
      // A tap on a tool: it goes and does a short go by itself, where it's needed most.
      this.shortGo(null)
      return
    }
    if (id && this.poke(id)) return
    const hit = this.hitAt(x, y - LIFT_PX) ?? this.hitAt(x, y)
    if (hit?.who === 'misty' && this.stage !== 'sweater' && this.stage !== 'story') return this.shortGo({ x, y })
    if (hit?.who === 'maple') return void this.poke('maple')
    // The water: a ripple (and in the rain, a little shower there).
    const p = this.onPlane(x, y, AT.z + 0.4, tmp)
    if (p.y < 0.4) {
      this.splash(p.x, 0.05, p.z, 6)
      riverSfx.splash()
    } else this.bits.burst(p.x, p.y, p.z, 5, 0.6, 1, 0.04, 5)
  }

  /** A tap's short go: the tool works round a point by itself for a moment (null: where it's needed most). */
  private shortGo(at: { x: number; y: number } | null) {
    if (this.stage === 'story' || this.stage === 'sweater' || this.stage === 'done') return
    const s = at ?? this.aim()
    if (!s) return
    // The comb's short go strokes in the next style's direction (so taps alone try every hairdo).
    const dir = this.tool === 'comb' ? [new Vector2(0, -1), new Vector2(0, 1), new Vector2(1, 0)][this.styleI++ % 3] : new Vector2(0, 0)
    this.auto = { t: 0, dur: FEEL.tap * (this.tool === 'cloud' ? 1.5 : 1), x: s.x, y: s.y, dir }
    this.strokes++
    this.stageStrokes++
    this.idle = 0
  }
  /** Where a tool's short go goes when she only tapped the tool: the muddiest spot, the least fluffy zone, her head,
   *  the next zone for the color. */
  private aim(): { x: number; y: number } | null {
    const t = this.tool
    let zone: MistyZone = 'tummy'
    if (t === 'sponge' || t === 'cloud') {
      const m = this.coat.muddiest()
      if (m) {
        const s = this.toScreen(m.part.pivot.localToWorld(m.local.clone()))
        return { x: s.x, y: s.y + LIFT_PX }
      }
    } else if (t === 'towel') {
      zone = MISTY_ZONES.filter((z) => z !== 'back' && z !== 'muzzle').reduce((a, b) => (this.coat.zones[b].puff < this.coat.zones[a].puff ? b : a), 'tummy' as MistyZone)
    } else if (t === 'comb') zone = 'head'
    else {
      zone = PAINT_ORDER[this.paintI++ % PAINT_ORDER.length]
    }
    const s = this.zoneScreen(zone)
    return { x: s.x, y: s.y + LIFT_PX }
  }

  /** The tool in her hand, following her finger (or its short go), working on what's under it. */
  private tools(dt: number) {
    const active = (this.rubbing && !Number.isNaN(this.finger.x)) || !!this.auto
    let tipX = this.finger.x
    let tipY = this.finger.y - LIFT_PX
    if (this.auto) {
      const a = this.auto
      a.t += dt
      const k = a.t / a.dur
      if (a.dir.lengthSq() > 0) {
        // A stroke one way and back (the comb).
        const s = Math.sin(k * Math.PI * 2) * 60
        tipX = a.x + a.dir.x * s
        tipY = a.y - LIFT_PX + a.dir.y * s
      } else {
        tipX = a.x + Math.cos(a.t * 11) * 26
        tipY = a.y - LIFT_PX + Math.sin(a.t * 11) * 18
      }
      if (k >= 1) this.auto = null
    }
    const p = this.props.get(this.tool)!
    if (!active || this.films.on || this.stage === 'sweater' || this.stage === 'done') {
      this.lastTip.set(NaN, NaN)
      if (this.tool === 'cloud' && this.autoRain) return this.rainBy(dt)
      return
    }
    const moved = Number.isNaN(this.lastTip.x) ? 0 : Math.hypot(tipX - this.lastTip.x, tipY - this.lastTip.y)
    const dx = Number.isNaN(this.lastTip.x) ? 0 : tipX - this.lastTip.x
    const dy = Number.isNaN(this.lastTip.y) ? 0 : tipY - this.lastTip.y
    this.lastTip.set(tipX, tipY)
    const hit = this.act?.kind === 'scratch' ? null : this.hitAt(tipX, tipY)
    // Where the tool shows: on her fur (a little toward the camera), or in front of her; the cloud above her finger.
    p.root.visible = true
    const scale = this.toolScale(p, 0.1)
    if (this.tool === 'cloud') {
      const at = this.onPlane(tipX, tipY, AT.z + 0.75, tmp)
      at.y += 0.42
      p.root.position.lerp(at, Math.min(1, dt * 18))
      p.root.scale.setScalar(this.toolScale(p, 0.17))
    } else {
      const at = hit ? tmp.copy(hit.world).addScaledVector(this.ray.ray.direction, -0.08) : this.onPlane(tipX, tipY, AT.z + 0.45, tmp)
      p.root.position.lerp(at, Math.min(1, dt * 25))
      p.root.scale.setScalar(scale)
    }
    p.root.quaternion.copy(this.rig.camera.quaternion)
    p.model.rotation.z = clamp(dx * 0.02, -0.5, 0.5) + Math.sin(this.t * 14) * (moved > 1 ? 0.12 : 0.02)
    p.model.rotation.x = this.tool === 'comb' ? 0.3 : 0
    this.use(dt, moved, dx, dy, hit)
  }
  /** How big a tool is in her hand (about the size of her finger and a half on screen). */
  private toolScale(p: Prop, k: number) {
    const d = this.rig.camera.position.distanceTo(tmp2.set(AT.x, 0.8, AT.z))
    const perPx = this.along(this.w / 2 + 100, this.h / 2, d, tmp2).distanceTo(this.along(this.w / 2, this.h / 2, d, tmp3)) / 100
    return (clamp(Math.min(this.w, this.h) * k, 56, 120) * perPx) / this.sizeOf(p)
  }

  /** What the tool in hand does where it is (`moved`: px since last frame). */
  private use(dt: number, moved: number, dx: number, dy: number, hit: Hit | null) {
    const tool = this.tool
    const coat = this.coat
    const onMisty = hit?.who === 'misty' && hit.part
    if (tool === 'cloud') {
      if (onMisty) this.stroke(moved)
      return this.rain(dt, hit)
    }
    if (!hit) return
    if (onMisty && tool !== 'comb') this.stroke(moved)
    if (tool === 'sponge') {
      this.acc.suds += moved * FEEL.suds
      while (this.acc.suds >= 16) {
        this.acc.suds -= 16
        const j = tmp2.set((Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05)
        const size = (hit.who === 'maple' ? 0.026 : 0.036) + Math.random() * 0.016
        this.suds.add(hit.pivot, hit.local.clone().add(j), hit.normal, size)
      }
      if (moved > 0.5 && this.beat('suds', 0.14)) fx.suds(Math.min(1, moved / 20))
      this.acc.squeak += moved
      if (this.acc.squeak > 220) ((this.acc.squeak = 0), fx.squeak())
      if (onMisty) {
        coat.wash(hit.part!, hit.local, FEEL.reach, (FEEL.mud * moved) / 100, SPONGE_FLOOR)
        if (hit.zone === 'tummy') this.tickle(moved)
      } else if (hit.who === 'maple') {
        this.beard += moved
        if (this.beard > 140 && this.suds.countOn(this.maple.rig.head) >= 5) {
          this.beard = -2000
          this.maple.pull('wow')
          this.talk(B.beard, true)
        }
      }
      return
    }
    if (!onMisty) return
    const zone = hit.zone!
    if (tool === 'towel') {
      coat.fluff(zone, (FEEL.puff * moved) / 100)
      for (const z of MISTY_ZONES) if (z !== zone && z !== 'muzzle') coat.fluff(z, (FEEL.puff * moved * 0.18) / 100)
      if (moved > 0.5 && this.beat('towel', 0.14)) fx.towel()
      if (Math.random() < moved / 60) this.bits.emit(hit.world.x, hit.world.y, hit.world.z + 0.05, (Math.random() - 0.5) * 1.2, 0.8 + Math.random(), 0.4, 0.8, 0.035, 7)
      if (coat.zones.head.puff > 0.25 && !coat.hairGroup) (coat.showHair(true), coat.setHair('fluff', null))
      if (!this.puffball && coat.puff > 0.78) {
        this.puffball = true
        this.misty.pull('happy')
        this.misty.hop()
        this.talk(B.cloud, true)
      }
      return
    }
    if (tool === 'comb') {
      this.acc.comb.x += dx
      this.acc.comb.y += dy
      this.acc.combPx += moved
      this.acc.combLen += moved
      if (this.acc.combPx > 70) ((this.acc.combPx = 0), fx.comb())
      const a = this.acc.comb
      // A stroke one way: up for spikes, down for bangs, sideways for a swoop. Round and round: all fluffy.
      if (a.length() > 64 || this.acc.combLen > 220) {
        const style: HairStyle = a.length() <= 64 ? 'fluff' : Math.abs(a.y) > Math.abs(a.x) * 0.8 ? (a.y < 0 ? 'spikes' : 'bangs') : 'swoop'
        this.acc.combLen = 0
        a.set(0, 0)
        this.stroke(STROKE_PX)
        if (coat.hair.style !== style || !coat.hairGroup) {
          coat.setHair(style, coat.hair.color)
          this.bounceHair()
          const h = coat.hairGroup
          if (h) this.sparkleAt(this.misty.rig.head.localToWorld(tmp2.set(0, coat.headY + coat.R * 1.1, 0.1)), 6)
        }
      }
      return
    }
    // A berry: the fur there takes its color.
    const berry = tool as Berry
    coat.paint(zone, berry, (FEEL.paint * moved) / 100)
    if (zone === 'head' && coat.hairGroup && coat.hair.color !== berry && coat.zones.head.color === berry && coat.zones.head.k > 0.35) coat.setHair(coat.hair.style, berry)
    this.acc.paint += moved
    if (this.acc.paint > 90) {
      this.acc.paint = 0
      fx.paint()
      this.bits.emit(hit.world.x, hit.world.y, hit.world.z + 0.06, (Math.random() - 0.5) * 0.8, 0.6, 0.6, 0.5, 0.03, 2 + BERRY_IDS.indexOf(berry))
    }
    if (!this.colorsSaid.has(berry) && coat.zones[zone].color === berry) {
      this.colorsSaid.add(berry)
      this.misty.pull('happy')
      void say(B.color[berry], { interrupt: false })
      this.lastReact = this.t
    }
  }
  private beats = new Map<string, number>()
  /** True at most every `s` seconds (a held loop's beat: its synth stand-in plays once a beat, not every frame). */
  private beat(key: string, s: number) {
    if (this.t - (this.beats.get(key) ?? -Infinity) < s) return false
    this.beats.set(key, this.t)
    return true
  }
  /** A stroke of play on her (counts toward the next tool). */
  private stroke(moved: number) {
    this.acc.stroke += moved
    this.idle = 0
    while (this.acc.stroke >= STROKE_PX) {
      this.acc.stroke -= STROKE_PX
      this.strokes++
      this.stageStrokes++
      // She likes it: a happy grumble now and then.
      if (this.strokes % 5 === 0) (fx.grumble(), this.misty.pull('happy'))
    }
  }
  /** Rubbing her tummy tickles: a giggle and a kick of the water now and then. */
  private tickle(moved: number) {
    this.kicks += moved
    if (this.kicks < 520) return
    this.kicks = 0
    if (this.act) return
    this.doAct('kick', 0.7)
    if (!this.talk(B.tickle)) this.misty.pull('happy')
  }

  /** The rain cloud in her hand: rain falls under it, popping the suds and rinsing the mud off. */
  private rain(dt: number, hit: Hit | null) {
    const cloud = this.props.get('cloud')!.root
    const coat = this.coat
    if (this.beat('rain', 0.16)) fx.rain()
    // Drops falling out of the cloud's bottom.
    const fall = clamp((cloud.position.y - AT.y - 0.3) / 4, 0.1, 0.4)
    for (let i = 0; i < 3; i++) this.drops.emit(cloud.position.x + (Math.random() - 0.5) * 0.4, cloud.position.y - 0.12, cloud.position.z + (Math.random() - 0.5) * 0.15, 0, -3.5, 0, fall * (0.8 + Math.random() * 0.4), 0.022)
    const cx = cloud.position.x
    const top = cloud.position.y
    const r = FEEL.reach * 1.6
    // Under the cloud (a column down to her feet), and round the point her finger is on.
    const near = hit?.who === 'misty' ? hit.world : null
    const k = FEEL.rinse * dt
    const off = coat.washWhere((x, y, z) => {
      const col = Math.abs(x - cx) < r && y < top ? 0.55 : 0
      const at = near ? Math.max(0, 1 - Math.hypot(x - near.x, y - near.y, z - near.z) / (r * 1.2)) : 0
      return Math.max(col, at)
    }, k)
    const popped = this.suds.pop((w) => Math.abs(w.x - cx) < r && w.y < top && Math.random() < dt * 9)
    if (popped) fx.pop()
    if (off > 0 || popped) for (const z of MISTY_ZONES) if (coat.zones[z].wet < 0.8 && Math.random() < dt * 4) coat.wet(z, 0.8)
    if (near && Math.random() < dt * 20) this.splashOn(near)
  }
  /** The cloud raining by itself (she let it be): it drifts across her and back. */
  private rainBy(dt: number) {
    const a = this.autoRain!
    a.t += dt
    const cloud = this.props.get('cloud')!
    cloud.root.visible = true
    // (Above her head, back and forth across her: the rain falls on all of her.)
    const x = AT.x + Math.sin(a.t * 1.3) * 0.5
    const y = AT.y + 1.62 + Math.sin(a.t * 2.1) * 0.03
    cloud.root.position.lerp(tmp.set(x, y, AT.z + 0.25), Math.min(1, dt * 3))
    cloud.root.quaternion.copy(this.rig.camera.quaternion)
    cloud.root.scale.setScalar(this.toolScale(cloud, 0.17))
    this.rain(dt, null)
    if (a.t > 7 || this.stage !== 'rain') this.autoRain = null
  }

  // ---------------------------------------------------------------- the parts going on

  private progress(dt: number) {
    const coat = this.coat
    const st = this.stage
    if (this.films.on) return
    if (st === 'story') {
      if (this.stageT > 2.6) this.skipStory()
      return
    }
    if (st === 'sponge') {
      if (coat.mudOf() <= SPONGE_DONE || this.stageStrokes >= 14 || this.idle > FEEL.idle) this.go('rain')
    } else if (st === 'rain') {
      if (this.whiteT < 0 && coat.mudOf() <= WHITE_AT) {
        // White shows through: Sparkle's fact, Misty pleased; the rain finishes the last bits.
        this.whiteT = 0
        this.sparkleAt(this.misty.at(0.6, tmp), 20)
        storySfx.chime()
        this.guide(B.spirit)
        this.misty.pull('happy')
        this.timers.later(() => this.talk(B.whiteAgain, true), lineMs(B.spirit) + 300)
      }
      if (this.whiteT >= 0) {
        this.whiteT += dt
        coat.wash('any', null, 0, dt * 0.6, 0)
        this.suds.pop(() => Math.random() < dt * 3)
        if (this.whiteT > 3.4 && !this.act && coat.mudOf() < 0.02) {
          // All clean, all wet: she shakes like a dog and soaks Maple.
          this.shake()
          this.timers.later(() => this.go('towel'), 1700)
          this.whiteT = -100
        }
      } else if (this.idle > 6 && !this.autoRain && !this.rubbing) this.autoRain = { t: 0 }
    } else if (st === 'towel') {
      if (this.stageStrokes >= ENOUGH || this.idle > FEEL.idle) this.go('comb')
    } else if (st === 'comb') {
      if (this.stageStrokes >= ENOUGH || this.idle > FEEL.idle) this.go('berries')
    } else if (st === 'berries' || st === 'mirror') {
      if (!this.decoOn && (this.stageStrokes >= DECO_AT || this.idle > FEEL.idle * 0.6)) {
        this.decoOn = true
        this.setLog([...this.onLog, 'deco:x'])
        fx.deco()
        const s = this.slots.get(this.logShown()[this.logShown().length - 1])
        if (s) this.bits.burst(s.at.x, s.at.y, s.at.z, 10, 0.5, 1, 0.025, 5)
        this.idle = 0
      }
      if (st === 'berries' && (this.stageStrokes >= FEEL.glow || this.stageT > 75 || (this.decoOn && this.idle > FEEL.idle))) this.go('mirror')
      // Left glowing a while: Misty sees herself anyway.
      if (st === 'mirror' && this.idle > 12 && !this.act) this.mirror()
    } else if (st === 'sweater') {
      if (this.idle > 12 && !this.act) this.press()
    } else if (st === 'done') {
      this.doneT += dt
    }
  }

  private skipStory() {
    if (this.stage !== 'story') return
    this.go('sponge')
  }

  /** Clean and wet: a wet-dog shake that soaks Maple. */
  private shake() {
    this.doAct('shake', 1.1)
    this.misty.shake()
    fx.shake()
    const c = this.misty.at(0.55, tmp)
    for (let i = 0; i < 40; i++) {
      const a = Math.random() * Math.PI * 2
      this.drops.emit(c.x + Math.cos(a) * 0.3, c.y + (Math.random() - 0.3) * 0.6, c.z + Math.sin(a) * 0.3, Math.cos(a) * 3, 1 + Math.random() * 2, Math.sin(a) * 2, 0.7, 0.03)
    }
    this.coat.wet('all', 0.5)
    this.timers.later(() => {
      this.maple.silly('soaked', 2.2)
      this.maple.shake()
      const m = this.maple.head(tmp2)
      this.splash(m.x, m.y, m.z, 14)
      this.talk(B.brrr, true)
    }, 450)
  }

  /** The pool glowing: Misty sees herself (the close-up), then Maple brings the sweater. */
  private mirror() {
    if (this.stage !== 'mirror' || this.films.on) return
    this.idle = 0
    this.saveLook(false)
    this.misty.lean = 0.12
    this.misty.headTurn = 0
    const s = this.misty.head(tmp2)
    this.sparkleAt(s, 14)
    fx.shimmer()
    this.films.play(
      sillyFilm(this.misty, 'crossed', {
        id: 'mirror',
        say: B.mirror,
        side: 0.2,
        back: 1.75,
        start: () => this.sparkleAt(this.misty.head(tmp3), 10),
        done: () => {
          this.misty.lean = 0
          this.river.mirror.goal = 0
          this.go('sweater')
        },
      }),
      undefined,
      this.rig.camera,
    )
  }

  /** Maple comes over with the white team sweater held up, on the side of the paw that has the most color on it. */
  private bringSweater() {
    const coat = this.coat
    const kl = coat.zones.armL.color ? coat.zones.armL.k : 0
    const kr = coat.zones.armR.color ? coat.zones.armR.k : 0
    this.pressArm = kr > kl ? 'armR' : 'armL'
    const s = this.pressArm === 'armL' ? -1 : 1
    if (!this.sweater) {
      this.sweater = heldSweater(0.42, this.bag)
      this.scene.add(this.sweater.root)
    }
    this.sweater.root.visible = true
    this.sweater.print.clear()
    this.maple.cheer()
    this.misty.turnTo(AT.x + s * 0.35, AT.z + 1)
    // Where her paw will be at the press (pose her as she'll be, read it, put her back): the print goes right there.
    const m = this.misty
    const arm = m.rig[this.pressArm]
    const rx = arm.rotation.x
    const rz = arm.rotation.z
    arm.rotation.x = PRESS.x
    arm.rotation.z += s * PRESS.z
    m.root.updateMatrixWorld(true)
    const H = m.height
    const paw = arm.localToWorld(new Vector3(s * 0.05 * H, -0.14 * H, 0.005 * H))
    arm.rotation.set(rx, arm.rotation.y, rz)
    this.sweaterAt.copy(paw).sub(this.sweater.front).add(tmp.set(0, 0, -0.035))
    // Maple stands just behind it, holding it up in front of her by the shoulders (she peeks round its side).
    this.maple.armsUp = 0.75
    this.maple.hopTo(paw.x + s * 0.24, -0.06, paw.z - 0.32, 0.6, -s * 15, 0.5)
  }
  private sweaterAt = new Vector3()

  /** One tap on the sweater: Misty presses her paw on it, THUMP, and pulls it on. */
  private press() {
    if (this.stage !== 'sweater' || this.act) return
    this.idle = 0
    this.print = this.coat.pawColors(this.pressArm)
    this.doAct('press', 1.2)
    this.timers.later(() => {
      if (!this.sweater) return
      fx.thump()
      storySfx.thump()
      const pp = pawPrint(this.print, 0.2, this.bag)
      this.sweater.print.add(pp)
      const w = this.sweater.root.localToWorld(this.sweater.front.clone())
      this.bits.burst(w.x, w.y, w.z + 0.05, 14, 0.8, 1, 0.03, this.print.length ? 2 + BERRY_IDS.indexOf(this.print[0]) : 0)
      this.talk(B.paw, true)
    }, 450)
    this.timers.later(() => this.dress(), 450 + Math.max(1800, lineMs(B.paw) + 500))
  }
  /** The sweater flies onto her (a puff of sparkles), and the look is saved. */
  private dress() {
    if (this.stage !== 'sweater') return
    this.sparkleAt(this.misty.at(0.4, tmp), 26)
    this.bits.burst(this.misty.pos.x, 0.6, this.misty.pos.z + 0.3, 16, 1, 1.5, 0.05, 0)
    fx.dress()
    if (this.sweater) this.sweater.root.visible = false
    this.coat.setSweater(true, this.print)
    this.misty.turnTo(AT.x, AT.z + 5)
    this.misty.hop()
    this.misty.pull('happy')
    this.maple.armsUp = 1
    this.maple.hop()
    this.doAct('dress', 0.8)
    this.saveLook(true)
    this.stage = 'done'
    this.doneT = 0
    this.timers.later(() => {
      this.cheer()
      this.maple.walkTo(...((this.tall ? [MAPLE_TALL[0], MAPLE_TALL[2]] : [MAPLE_WIDE[0], MAPLE_WIDE[2]]) as [number, number]), 0.8, 25)
    }, 900)
    this.timers.later(() => !this.gone && this.events.done(), 2600)
  }
  /** Saves the look (looks.ts), and keeps it in a link that has one. */
  private saveLook(sweater: boolean) {
    const look = { ...this.coat.look(), sweater, print: sweater ? this.print : this.coat.look().print }
    saveMisty(look)
    updateStickyParam('look', encodeMisty(look))
  }

  // ---------------------------------------------------------------- decorations

  /** Picks the next decoration up (it stays on the log's slot, she drags it). Dropped on her: the nearest spot; dropped
   *  anywhere else: back to the log. */
  private dropDeco() {
    const h = this.held!
    this.held = null
    const x = this.finger.x
    const y = this.finger.y
    const hit = Number.isNaN(x) ? null : (this.hitAt(x, y - LIFT_PX) ?? this.hitAt(x, y))
    if (hit?.who === 'misty') {
      const spot = this.coat.nearestSpot(hit.world)
      this.flyOn(h.deco, spot, h.prop)
    }
  }
  /** A tap on the decoration on the log: it flies on to the next spot. */
  private tapDeco(deco: Deco) {
    const free = SPOT_ORDER.find((s) => !this.coat.worn.some((w) => w.at === s)) ?? SPOT_ORDER[this.decoNext % SPOT_ORDER.length]
    this.flyOn(deco, free, this.props.get(`deco:${deco}`)!)
  }
  private flyOn(deco: Deco, spot: DecoSpot, prop: Prop) {
    this.flying.push({ prop, from: prop.root.position.clone(), t: 0, deco, spot })
    this.decoNext++
    this.strokes++
    this.stageStrokes++
    this.idle = 0
    storySfx.whoosh()
  }
  private flyDecos(dt: number) {
    if (this.held) {
      const p = this.held.prop
      p.root.visible = true
      const hit = Number.isNaN(this.finger.x) ? null : this.hitAt(this.finger.x, this.finger.y - LIFT_PX)
      const at = hit ? tmp.copy(hit.world).addScaledVector(this.ray.ray.direction, -0.1) : this.onPlane(this.finger.x, this.finger.y - LIFT_PX, AT.z + 0.5, tmp)
      if (!Number.isNaN(at.x)) p.root.position.lerp(at, Math.min(1, dt * 20))
      p.root.quaternion.copy(this.rig.camera.quaternion)
      p.root.scale.setScalar(this.toolScale(p, 0.1))
    }
    for (const f of [...this.flying]) {
      f.t += dt / 0.5
      const sp = this.coat.spot(f.spot)
      const to = sp.pivot.localToWorld(sp.p.clone())
      const k = Math.min(1, f.t)
      f.prop.root.visible = true
      f.prop.root.position.lerpVectors(f.from, to, k)
      f.prop.root.position.y += bell(k) * 0.35
      f.prop.root.rotation.z += dt * 8
      if (k >= 1) {
        this.flying.splice(this.flying.indexOf(f), 1)
        f.prop.root.visible = false
        f.prop.root.rotation.z = 0
        const g = this.coat.wear(f.deco, f.spot)
        if (g) this.popIn(g)
        fx.deco()
        this.sparkleAt(to, 8)
        this.misty.pull('happy')
      }
    }
    // Things that just went on pop in.
    for (const p of [...this.pops]) {
      p.t += dt / 0.35
      const s = p.t >= 1 ? 1 : 1 + Math.sin(p.t * Math.PI) * 0.35 - (1 - p.t) * 0.6
      p.g.scale.setScalar(Math.max(0.05, s))
      if (p.t >= 1) this.pops.splice(this.pops.indexOf(p), 1)
    }
  }
  private pops: { g: Group; t: number }[] = []
  private popIn(g: Group) {
    g.scale.setScalar(0.05)
    this.pops.push({ g, t: 0 })
  }
  private hairBounce = 0
  private bounceHair() {
    this.hairBounce = 1
  }

  // ---------------------------------------------------------------- Misty's moves

  private doAct(kind: Act['kind'], dur: number, what?: Act['what']) {
    this.act = { kind, t: 0, dur, what }
  }
  /** Poses her after the rig's own (an arm for a swing, a press, a scratch's shimmy), and the hair's bounce. */
  private pose(dt: number) {
    const m = this.misty
    const a = this.act
    const h = this.coat.hairGroup
    if (h) {
      this.hairBounce = Math.max(0, this.hairBounce - dt * 2.5)
      const b = this.hairBounce
      h.scale.set(1 + Math.sin(b * 14) * 0.08 * b, 1 - Math.sin(b * 14) * 0.1 * b, 1)
    }
    if (!a) return
    a.t += dt
    const k = Math.min(1, a.t / a.dur)
    const lerp = (x: number, y: number, u: number) => x + (y - x) * clamp(u)
    if (a.kind === 'swing') {
      // A big swat: the wind-up, the fast swing down, the settle.
      const t = a.t
      const at = 0.5
      const up = clamp((t - 0.05) / 0.45)
      const down = clamp((t - at) / 0.13)
      m.armsUp = t < at ? up : t < at + 0.5 ? lerp(1, 0.1, down) : lerp(0.1, 0, (t - at - 0.5) / 0.4)
      m.lean = t < at ? -0.15 * up : t < at + 0.5 ? lerp(-0.15, 0.45, down) : lerp(0.45, 0, (t - at - 0.5) / 0.5)
    } else if (a.kind === 'kick') {
      m.rig.body.rotation.x = -0.25 * bell(k)
    } else if (a.kind === 'sneeze') {
      m.lean = k < 0.5 ? -0.25 * (k / 0.5) : -0.25 + 0.6 * bell((k - 0.5) / 0.5)
    } else if (a.kind === 'scratch') {
      // Over to the cedar, her back to it, a shimmy, back to her bath.
      const t = a.t
      const toX = SCRATCH.x - SCRATCH.r - 0.27
      if (a.t <= dt && !m.busy) m.walkTo(toX, SCRATCH.z + 0.05, 1.0, -90)
      if (t > 1.05 && t < 3.3) {
        m.root.rotation.y = -Math.PI / 2
        m.rig.body.rotation.z = Math.sin(t * 12) * 0.12
        m.rig.body.position.y = Math.abs(Math.sin(t * 12)) * 0.03
        m.armsUp = 0.25
        if (Math.floor(t * 4) !== Math.floor((t - dt) * 4)) fx.scratch()
      }
      if (t > 3.3 && t - dt <= 3.3) ((m.armsUp = 0), m.walkTo(AT.x, AT.z, 1.0, 0))
    } else if (a.kind === 'press') {
      const arm = m.rig[this.pressArm]
      const reach = bell(clamp(k * 1.3))
      arm.rotation.x = PRESS.x * reach
      arm.rotation.z += (this.pressArm === 'armL' ? -1 : 1) * PRESS.z * reach
    } else if (a.kind === 'dress') {
      m.armsUp = bell(k) * 0.8
    }
    if (a.t >= a.dur) {
      if (a.kind === 'swing' || a.kind === 'sneeze' || a.kind === 'press') m.lean = 0
      if (a.kind === 'swing' || a.kind === 'dress') m.armsUp = 0
      this.act = null
    }
  }

  // ---------------------------------------------------------------- pokes

  /** A tap on one of the scene's things (true: it was one). */
  private poke(id: string): boolean {
    this.idle = 0
    if (id === 'nose') return this.sneeze(), true
    if (id === 'tummy') {
      if (!this.act) this.doAct('kick', 0.7)
      this.splash(AT.x + 0.1, 0.05, AT.z + 0.35, 12)
      riverSfx.splash()
      if (!this.talk(B.tickle)) this.misty.pull('happy')
      this.shortGo(null)
      return true
    }
    if (id === 'pool') return this.mirror(), true
    if (id === 'sweater') return this.press(), true
    if (id === 'maple') {
      if (this.tool === 'sponge' && (this.stage === 'sponge' || this.stage === 'rain')) {
        // The sponge on Maple: suds on her chin, a foam beard.
        const head = this.maple.rig.head
        for (let i = 0; i < 4; i++) this.suds.add(head, new Vector3((Math.random() - 0.5) * 0.12, this.maple.rig.face.headY - 0.16 + Math.random() * 0.05, this.maple.rig.face.R * 0.85), new Vector3(0, -0.4, 1), 0.024 + Math.random() * 0.01)
        fx.squeak()
        if (this.suds.countOn(head) >= 6 && this.beard >= 0) {
          this.beard = -2000
          this.maple.pull('wow')
          this.talk(B.beard, true)
        }
      } else {
        this.maple.hop()
        this.maple.wave()
        if (!this.talk(B.cheer[Math.floor(Math.random() * B.cheer.length)])) this.maple.pull('happy')
      }
      return true
    }
    if (id === 'soap') return this.batSoap(), true
    if (id === 'cedar') {
      if (!this.fact('cedar', B.cedar) && this.act) return true
      if (!this.act && this.stage !== 'sweater' && this.stage !== 'done') {
        this.doAct('scratch', 4.5)
        this.timers.later(() => this.talk(B.scratch), 1300)
      }
      return true
    }
    if (id === 'salmon') {
      this.fact('salmon', B.salmon)
      this.river.leap(Math.floor(Math.random() * this.river.salmon.length), [SALMON_POOL.x, 0, SALMON_POOL.z + 0.6], [SALMON_POOL.x + 0.25, TOP, FALLS_Z - 1.3], 1.1, 0.7)
      riverSfx.leap()
      this.splash(SALMON_POOL.x, 0.05, SALMON_POOL.z + 0.6, 10)
      if (!this.act && this.stage !== 'sweater' && this.stage !== 'done') {
        // She swings at it, misses, and the splash rinses her.
        this.misty.turnTo(SALMON_POOL.x, SALMON_POOL.z + 1.5)
        this.doAct('swing', 1.4, 'salmon')
        this.timers.later(() => riverSfx.swing(), 350)
        this.timers.later(() => {
          riverSfx.bigSplash()
          this.splash(AT.x - 0.4, 0.3, AT.z + 0.4, 30)
          // The splash rinses her a little (in the wash), pops some suds.
          if (this.stage === 'sponge' || this.stage === 'rain') {
            this.coat.wash('any', null, 0, 0.1, this.stage === 'sponge' ? SPONGE_FLOOR : 0)
            this.suds.pop(() => Math.random() < 0.35)
            this.coat.wet('all', 0.8)
          }
          this.misty.pull('sad')
          this.talk(B.miss)
        }, 620)
        this.timers.later(() => (this.misty.cheer(), this.misty.turnTo(AT.x, AT.z + 5)), 1800)
      }
      return true
    }
    if (id === 'falls') {
      this.rainbowT = 0
      this.rainbow.visible = true
      storySfx.chime()
      this.splash(FALLS_AT.x, 0.1, FALLS_Z + 0.5, 14)
      return true
    }
    if (id === 'slug') {
      this.slug.poke = 0
      fx.slug()
      meet('banana-slug')
      return true
    }
    if (id === 'raven') {
      this.raven.poke = 0
      riverSfx.raven()
      meet('raven')
      return true
    }
    if (id === 'sky-cloud') {
      this.fact('rain', B.rainPoke)
      this.skyCloudT = -2
      for (let i = 0; i < 30; i++) this.drops.emit(SKY_CLOUD.x + (Math.random() - 0.5) * 0.9, SKY_CLOUD.y - 0.25, SKY_CLOUD.z + (Math.random() - 0.5) * 0.3, 0, -3, 0, 0.6 + Math.random() * 0.3, 0.03)
      fx.rain()
      return true
    }
    return false
  }

  /** A tap on her nose: ah... choo! Suds fly everywhere (a few land on Maple). */
  private sneeze() {
    if (this.act) return
    this.doAct('sneeze', 0.9)
    fx.boop()
    this.timers.later(() => {
      fx.sneeze()
      const off = this.suds.clear().filter((_, i) => i % 2 === 0)
      for (const p of off.slice(0, 50)) this.bits.emit(p.x, p.y, p.z, (Math.random() - 0.5) * 3, 1 + Math.random() * 2, 1 + Math.random() * 2, 0.9, 0.04, 1)
      const nose = this.misty.head(tmp2)
      for (let i = 0; i < 24; i++) this.bits.emit(nose.x, nose.y - 0.1, nose.z + 0.3, (Math.random() - 0.5) * 3, Math.random() * 2, 2 + Math.random() * 2, 0.8, 0.045, i % 2)
      // Some of it on Maple's chin.
      const head = this.maple.rig.head
      if (off.length > 4) for (let i = 0; i < 5; i++) this.suds.add(head, new Vector3((Math.random() - 0.5) * 0.1, this.maple.rig.face.headY - 0.14, this.maple.rig.face.R * 0.85), new Vector3(0, -0.3, 1), 0.024)
    }, 420)
    if (!this.talk(B.achoo)) this.misty.pull('wow')
  }

  /** The soap slips off its rock toward her; she bats it clean over the cedars. */
  private batSoap() {
    if (this.soap.state !== 'rock') return
    const s = this.soap
    s.state = 'slip'
    s.t = 0
    s.from.copy(s.g.position)
    s.to.set(AT.x + 0.55, 0.55, AT.z + 0.55)
    fx.soap()
    if (!this.act) {
      this.misty.turnTo(AT.x + 1.5, AT.z + 1.5)
      this.doAct('swing', 1.4, 'soap')
    }
  }
  private restSoap() {
    this.soap.g.position.set(SOAP_ROCK.x, SOAP_ROCK.y + 0.3, SOAP_ROCK.z)
    this.soap.g.rotation.set(0, 0.4, 0)
    this.soap.g.visible = true
    this.soap.state = 'rock'
  }

  /** The scene's own life: the soap's flight, the slug, the raven, the sky cloud, the rainbow, the muddy sparkle. */
  private pokeables(dt: number, t: number) {
    const s = this.soap
    if (s.state === 'slip') {
      s.t += dt / 0.5
      const k = Math.min(1, s.t)
      s.g.position.lerpVectors(s.from, s.to, k)
      s.g.position.y += bell(k) * 0.4
      s.g.rotation.x += dt * 9
      if (k >= 1) {
        // WHACK: up over the tallest cedar.
        s.state = 'fly'
        s.t = 0
        s.from.copy(s.g.position)
        riverSfx.thwack()
        storySfx.slap()
        this.sparkleAt(s.g.position, 8)
        this.timers.later(() => this.talk(B.shot, true) && (this.maple.armsUp = 1), 400)
        this.timers.later(() => (this.maple.armsUp = 0, this.misty.turnTo(AT.x, AT.z + 5)), 1800)
      }
    } else if (s.state === 'fly') {
      s.t += dt / 1.6
      const k = Math.min(1, s.t)
      s.g.position.set(s.from.x + (TALLEST.x - s.from.x) * k, s.from.y + (TALLEST.h * 0.5) * Math.sin(k * Math.PI * 0.6), s.from.z + (TALLEST.z - s.from.z) * k)
      s.g.rotation.x += dt * 14
      if (k >= 1) {
        s.state = 'gone'
        s.g.visible = false
        s.t = 0
        this.sparkleAt(s.g.position, 16)
      }
    } else if (s.state === 'gone') {
      s.t += dt
      if (s.t > 2.5) {
        this.restSoap()
        this.sparkleAt(s.g.position, 8)
        storySfx.pop()
      }
    }
    // The slug: its eye stalks stretch out, it inches along and back.
    const sl = this.slug
    if (sl.poke >= 0) {
      sl.poke += dt
      const k = bell(Math.min(1, sl.poke / 1.6))
      sl.stalks.scale.set(1, 1 + k * 0.9, 1)
      sl.root.scale.set(1 + k * 0.25, 1 - k * 0.12, 1)
      if (sl.poke > 1.6) sl.poke = -1
    } else sl.stalks.rotation.z = Math.sin(t * 1.3) * 0.15
    // The raven: a hop, a flap and a look round.
    const rv = this.raven
    rv.head.rotation.y = Math.sin(t * 0.7) * 0.6
    if (rv.poke >= 0) {
      rv.poke += dt
      const k = bell(Math.min(1, rv.poke / 1.1))
      rv.wings.forEach((w, i) => (w.rotation.z = (i ? -1 : 1) * k * (0.9 + Math.sin(rv.poke * 30) * 0.4)))
      rv.root.position.y = RAVEN_AT.y + k * 0.15
      if (rv.poke > 1.1) rv.poke = -1
    }
    // The rain cloud up in the sky bobs, and comes down to the log when the rain is hers.
    if (this.skyCloud.visible) {
      if (this.skyCloudT >= 0) {
        this.skyCloudT += dt
        const slot = this.slots.get('cloud')
        const k = Math.min(1, this.skyCloudT / 0.8)
        if (slot) this.skyCloud.position.lerpVectors(SKY_CLOUD, slot.at, k * k)
        this.skyCloud.scale.setScalar(1 - k * 0.6)
        if (k >= 1) this.skyCloud.visible = false
      } else {
        if (this.skyCloudT < -1) this.skyCloudT = Math.min(-1, this.skyCloudT + dt)
        this.skyCloud.position.set(SKY_CLOUD.x + Math.sin(t * 0.4) * 0.1, SKY_CLOUD.y + Math.sin(t * 0.9) * 0.05, SKY_CLOUD.z)
      }
    }
    if (this.rainbowT >= 0) {
      this.rainbowT += dt
      const k = bell(Math.min(1, this.rainbowT / 4))
      for (const m of this.rainbow.children) ((m as Mesh).material as MeshBasicMaterial).opacity = Math.min(0.75, k * 1.5) * 0.75
      if (this.rainbowT > 4) ((this.rainbowT = -1), (this.rainbow.visible = false))
    }
  }

  // ---------------------------------------------------------------- help

  /** Stuck about 8 s: the muddy patch she's missed sparkles (and Sparkle says so, sparingly), or the hand shows what
   *  to do. */
  private hint(dt: number) {
    const el = this.hintEl
    const stuck = this.idle > HINT_S && !this.rubbing && !this.films.on && this.stage !== 'story' && this.stage !== 'done' && !this.act
    if (this.stage === 'sponge' || this.stage === 'rain') {
      this.sparkleT -= dt
      if (stuck && this.sparkleT <= 0) {
        this.sparkleT = 1.2
        const m = this.coat.muddiest()
        if (m) this.sparkleAt(m.part.pivot.localToWorld(m.local.clone()), 6)
      }
    }
    if (stuck && this.hintT === 0) {
      this.hintT = 1
      if (this.stage === 'sponge') this.guide(B.rubHint, spendHint(B.rubHint))
    }
    if (!stuck) this.hintT = 0
    if (!el) return
    if (!stuck) {
      if (el.style.display !== 'none') el.style.display = 'none'
      return
    }
    const target = this.stage === 'mirror' ? this.toScreen(tmp.set(MIRROR.x, 0.05, MIRROR.z)) : this.stage === 'sweater' && this.sweater ? this.toScreen(this.sweater.root.localToWorld(tmp.set(0, -0.2, 0))) : this.zoneScreen('tummy')
    el.dataset.kind = this.stage === 'mirror' || this.stage === 'sweater' ? 'press' : 'rub'
    el.style.display = ''
    el.style.transform = `translate3d(${target.x.toFixed(0)}px, ${target.y.toFixed(0)}px, 0)`
  }

  // ---------------------------------------------------------------- little effects

  private splash(x: number, y: number, z: number, n: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const v = 1.4 * (0.4 + Math.random() * 0.6)
      this.drops.emit(x, y, z, Math.cos(a) * v, 2.5 * (0.5 + Math.random() * 0.7), Math.sin(a) * v, 0.6, 0.035)
    }
  }
  private splashOn(p: Vector3) {
    this.drops.emit(p.x, p.y, p.z + 0.04, (Math.random() - 0.5) * 1.2, 0.6, 0.6 + Math.random() * 0.6, 0.35, 0.02)
  }
  private sparkleAt(p: Vector3, n: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      this.bits.emit(p.x, p.y, p.z + 0.05, Math.cos(a) * 0.9, 1.2 + Math.random() * 1.2, Math.sin(a) * 0.6, 0.8, 0.03, i % 2 ? 5 : 2)
    }
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const hide = this.films.on || this.stage === 'done'
    const place = (el: HTMLElement, at: Vector3 | null, size: number) => {
      let spot: { x: number; y: number; s: number } | null = null
      if (at && !hide) {
        const c = this.toScreen(at)
        if (c.z < 1) spot = { x: c.x, y: c.y, s: Math.max(min, size) }
      }
      const show = !!spot && spot.x > 0 && spot.x < this.w && spot.y > 0 && spot.y < this.h
      if (show && spot) {
        el.style.transform = `translate3d(${(spot.x - spot.s / 2).toFixed(1)}px, ${(spot.y - spot.s / 2).toFixed(1)}px, 0)`
        el.style.width = el.style.height = `${spot.s.toFixed(0)}px`
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
    /** A thing's size on screen (px) from its world size at a point. */
    const px = (at: Vector3, m: number) => {
      const a = this.toScreen(at)
      const b = this.toScreen(tmp2.copy(at).add(tmp3.set(m, 0, 0)))
      return Math.abs(b.x - a.x)
    }
    const shown = this.logShown()
    for (const [id, el] of this.anchorEls) {
      el.style.zIndex = id.startsWith('tool:') ? '4' : id === 'nose' || id === 'sweater' || id === 'pool' ? '3' : '1'
      if (id.startsWith('tool:')) {
        const item = this.itemOf(id)
        const slot = item && shown.includes(item) ? this.slots.get(item) : null
        const ok = slot && this.log.visible
        if (!ok) place(el, null, 0)
        else {
          el.style.transform = `translate3d(${(slot.x - slot.px / 2).toFixed(1)}px, ${(slot.y - slot.px / 2).toFixed(1)}px, 0)`
          el.style.width = el.style.height = `${slot.px.toFixed(0)}px`
          if (el.style.display !== '') el.style.display = ''
        }
        continue
      }
      const scratching = this.act?.kind === 'scratch'
      if (id === 'nose') place(el, this.stage === 'sweater' || scratching ? null : this.misty.rig.head.localToWorld(tmp.set(0, this.coat.headY - 0.16 * this.coat.R, 1.05 * this.coat.R)), 0)
      else if (id === 'tummy') place(el, this.stage === 'sweater' || scratching ? null : this.zoneWorld('tummy', tmp), px(this.zoneWorld('tummy', tmp), 0.18))
      else if (id === 'pool') place(el, this.stage === 'mirror' ? tmp.set(MIRROR.x, 0.05, MIRROR.z) : null, px(tmp.set(MIRROR.x, 0.05, MIRROR.z), MIRROR.r * 1.6))
      else if (id === 'sweater') place(el, this.stage === 'sweater' && this.sweater?.root.visible ? this.sweater.root.localToWorld(tmp.set(0, -0.2, 0)) : null, px(this.sweater?.root.getWorldPosition(tmp) ?? tmp.set(0, 0, 0), 0.55))
      else if (id === 'maple') place(el, this.maple.at(0.5, tmp), px(this.maple.at(0.5, tmp2), 0.7))
      else if (id === 'soap') place(el, this.soap.state === 'rock' ? this.soap.g.position.clone() : null, 0)
      else if (id === 'cedar') place(el, tmp.set(SCRATCH.x - SCRATCH.r * 0.7, 1.1, SCRATCH.z + 0.25), px(tmp2.set(SCRATCH.x, 1.1, SCRATCH.z), SCRATCH.r * 1.6))
      else if (id === 'salmon') place(el, tmp.set(SALMON_POOL.x, 0.25, SALMON_POOL.z), 0)
      else if (id === 'falls') place(el, FALLS_AT.clone(), 0)
      else if (id === 'slug') place(el, SLUG_AT.clone().setY(SLUG_AT.y + 0.06), 0)
      else if (id === 'raven') place(el, tmp.copy(RAVEN_AT).setY(RAVEN_AT.y + 0.2), 0)
      else if (id === 'sky-cloud') place(el, this.skyCloud.visible && this.skyCloudT < 0 ? this.skyCloud.position.clone() : null, px(this.skyCloud.position.clone(), 0.7))
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const scr = (v: Vector3) => (({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }))(this.toScreen(v))
    const zones = Object.fromEntries((['head', 'earL', 'earR', 'muzzle', 'chest', 'tummy', 'armL', 'armR', 'legL', 'legR'] as MistyZone[]).map((z) => [z, scr(this.zoneWorld(z, tmp.clone()))]))
    const coat = this.coat
    const look = coat.look()
    return {
      section: SECTION_OF[this.stage],
      stage: this.stage,
      tool: this.tool,
      strokes: this.strokes,
      stageStrokes: this.stageStrokes,
      mud: +coat.mudOf().toFixed(2),
      suds: this.suds.count,
      puff: +coat.puff.toFixed(2),
      hair: coat.hairGroup ? `${coat.hair.style}${coat.hair.color ? '.' + coat.hair.color : ''}` : null,
      colors: Object.keys(look.fur).length,
      worn: coat.worn.map((w) => `${w.id}@${w.at}`),
      sweater: coat.sweaterOn,
      print: this.print,
      look: encodeMisty(look),
      /** Her zones' middles on screen (a robot rubs there). */
      zones,
      log: Object.fromEntries([...this.slots].map(([id, s]) => [id, { x: Math.round(s.x), y: Math.round(s.y) }])),
      pool: this.stage === 'mirror' ? scr(tmp.set(MIRROR.x, 0.05, MIRROR.z)) : null,
      sweaterAt: this.stage === 'sweater' && this.sweater ? scr(this.sweater.root.localToWorld(tmp.set(0, -0.2, 0))) : null,
      film: this.films.now,
      films: { done: this.films.done, skipped: this.films.skipped },
      act: this.act?.kind ?? null,
      done: this.stage === 'done',
      idle: +this.idle.toFixed(1),
    }
  }
  memory() {
    return { ...this.renderer.info.memory }
  }

  /** QA only (under webdriver): put a look on her, or move the camera, to photograph her from every side. */
  private devHooks() {
    return {
      look: (text: string | null) => {
        this.coat.apply(text === null ? null : (JSON.parse(text) as MistyLook))
      },
      mud: (k: number) => (this.coat.setMud(k), this.coat.refresh(true)),
      zone: (z: MistyZone, c: Berry | null, k: number, puff: number) => {
        Object.assign(this.coat.zones[z], { color: c, k, puff })
        for (const p of this.coat.parts) p.dirty = true
        this.coat.refresh(true)
      },
      suds: (zone: MistyZone, n: number) => {
        const s = this.zoneScreen(zone)
        for (let i = 0; i < n; i++) {
          const h = this.hitAt(s.x + (Math.random() - 0.5) * 40, s.y + (Math.random() - 0.5) * 40)
          if (h) this.suds.add(h.pivot, h.local, h.normal, 0.04)
        }
      },
      sweater: (print: Berry[]) => this.coat.setSweater(true, print),
      hair: (style: HairStyle, color: Berry | null) => (this.coat.showHair(true), this.coat.setHair(style, color)),
      wear: (id: Deco, at: DecoSpot) => this.coat.wear(id, at),
      cam: (yaw: number, pitch: number, zoom: number, px = 0, py = 0) => this.rig.setOverride({ mode: "lock", yaw, pitch, zoom, fov: null, px, py }, true),
      turn: (deg: number) => (this.misty.root.rotation.y = (deg * Math.PI) / 180),
      act: (kind: Act['kind']) => (kind === 'shake' ? this.shake() : this.doAct(kind, kind === 'scratch' ? 4.5 : 1.2)),
      spots: () => DECO_SPOTS,
    }
  }

  dispose() {
    this.gone = true
    this.timers.dispose()
    this.unwatch()
    if (automated) delete (window as unknown as { __bathDev?: unknown }).__bathDev
    this.scene.clear()
    this.bag.dispose()
  }
}


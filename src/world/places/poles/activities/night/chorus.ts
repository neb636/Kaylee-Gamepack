// Act 2 of the Poles' new ending, Sing in the Dark (planning/around-the-world/poles-ending.md). The balloon is down
// in the blizzard, it's dark, and Pebble's peep is too small for Papa to hear across Antarctica. So everyone sings it.
//
// The toy (core verb): hold Pebble, riding on Pola's back, and he sings Papa's song (party/sounds.ts TUNES[0]). The
// longer she holds, the bigger the ring of song: a dashed circle on the snow shows how far it will go. Let go and the
// ring rolls out across the dark snow, lighting up whatever it passes (a pink outline and a glow). A quick tap is a
// little peep and a little ring. The dark is the level: she can't see what's out there until she sings, so every ring
// is a small reveal, and every friend it finds joins the song with their own voice and their own band of color.
// It gets richer three times (each a section with its own link):
//   whiteout  the blizzard, thick white fog. The ring finds Pola, white in the white (camouflage), Papa's woolly hat
//             half buried in the snow (Pebble puts it on: "It fits!") and Terry upside down in a drift, who joins in.
//   edge      the ice edge, the dark sea beside it, the southern lights coming out. A Weddell seal in her breathing
//             hole, the slide's Adelies in a drift, a humpback far out in the sea (it takes a big ring to reach him).
//   together  a hilltop, the colony's glow far off over the hills. "All together now!" One long, long hold: the
//             preview turns gold, and the rainbow ring rolls over the hills. Silence. A gold ring comes back: Papa.
// Pola walks on by herself once everyone at a stop has joined (the camera goes with her), so her hands only sing.
// Silly, never "oops": tap-tap-tap and Pebble hiccups; poke Pola and she sings it back the growly bear way.
// Never fails: a friend the rings keep missing glimmers brighter each time, and after a few rings answers even a peep;
// the long hold at the end gets shorter after a couple of tries.
//
// Built for engine3d/View3D.tsx. The ring's feel is feel-lab knobs (?feel=1).
import { AdditiveBlending, type BufferGeometry, Color, DoubleSide, Fog, Group, Mesh, MeshBasicMaterial, Plane, PlaneGeometry, Raycaster, Scene, ShaderMaterial, Sprite, SpriteMaterial, Vector2, Vector3, type Texture, type WebGLRenderer } from 'three'
import { bell, clamp } from '../../../../../sdk'
import { smoothstep } from '../../../../../sdk/math'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../engine3d/camera'
import { Bag } from '../../../../engine3d/dispose'
import { bake, merge, P, solid } from '../../../../engine3d/geo'
import { setHullHighlight, setOutlineResolution } from '../../../../engine3d/outline'
import { Particles } from '../../../../engine3d/particles'
import { radialAlpha, softTexture } from '../../../../engine3d/softTexture'
import { applyBands, makeLights } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import { knobs, watch } from '../../../../kit/knobs'
import { fbm, field, iceCliff, noise, outside, snowColor } from '../../look/ground'
import { dress } from '../../look/look'
import { PolarSky } from '../../look/sky'
import { glowTexture, NOTE_COLORS, noteTexture } from '../../look/sprites'
import { Actor, openBeak } from '../../story/actor'
import { Aurora, Balloon, driftGeo, ICE_LINE, mountainGeo, rng, tableBergGeo } from '../../story/props'
import { IceSeal, Humpback, hatGeo } from '../slide/critters'
import { noteAt, sing, TUNES, tuneSeconds } from '../party/sounds'
import type { NightSection } from './sections'
import { nightSfx, voice, type Singer } from './sounds'

const FILE = 'src/world/places/poles/activities/night/chorus.ts'
/** The song ring (live in the feel lab: ?feel=1). */
const RING = knobs('chorus', 'Sing in the Dark: the ring', FILE, {
  tap: { value: 0.22, min: 0.05, max: 0.6, step: 0.01, label: 'A tap, up to', unit: 's', note: 'a touch shorter than this is a peep (a little ring); longer is a hold' },
  peep: { value: 1.3, min: 0.5, max: 5, step: 0.1, label: 'Peep ring', unit: 'm', note: 'how far a quick tap reaches' },
  small: { value: 1.7, min: 0.5, max: 6, step: 0.1, label: 'Smallest hold', unit: 'm', note: 'the ring of a hold let go straight away' },
  max: { value: 8, min: 3, max: 16, step: 0.5, label: 'Biggest ring', unit: 'm', note: 'the ring of a full hold' },
  grow: { value: 2, min: 0.5, max: 6, step: 0.1, label: 'Hold to full', unit: 's', note: 'how long a hold takes to reach the biggest ring' },
  curve: { value: 0.7, min: 0.3, max: 2, step: 0.05, label: 'Growth curve', note: 'under 1: it grows fast at first, then slows; over 1: slow, then fast' },
  speed: { value: 4.5, min: 1, max: 20, step: 0.5, label: 'Ring speed', unit: 'm/s', note: 'how fast a ring rolls across the snow' },
  width: { value: 0.75, min: 0.3, max: 3, step: 0.1, label: 'Ring width', unit: 'm', note: 'how wide the band of color is' },
  glow: { value: 1.2, min: 0.3, max: 4, step: 0.1, label: 'Glow time', unit: 's', note: 'how long something stays lit after the ring passes it' },
  pity: { value: 3, min: 1, max: 8, step: 1, label: 'Answers after', note: 'rings that miss a hidden friend before it answers any ring (it glimmers brighter each miss)' },
  big: { value: 2.2, min: 0.6, max: 6, step: 0.1, label: 'The big song', unit: 's', note: 'the hold the last song needs to reach the colony (halved after two short tries)' },
})

/** What Sparkle and the friends say (L.night.chorus, and the southern lights' fact from the hub). */
export type ChorusTalk = 'start' | 'lights' | 'camo' | 'hat' | 'terry' | 'weddell' | 'adelies' | 'whale' | 'grr' | 'together' | 'long' | 'papa' | 'terryPoke' | 'pola' | 'skyFact'
/** How a line is said: Sparkle's instruction (also her hint), Sparkle's fact (once), or a friend in their own voice. */
export type TalkKind = 'cue' | 'fact' | 'friend'
export type Phase = 'play' | 'end'

export interface ChorusEvents {
  section(s: NightSection): void
  talk(what: ChorusTalk, kind: TalkKind): void
  /** Her hint when she's stuck: the current instruction (null: nothing to do, a scene is playing). */
  hint(what: 'start' | 'long' | null): void
  dots(n: number, of: number): void
  phase(p: Phase): void
}

export interface ChorusStart {
  section: NightSection
}

/** The things the rings can find (the hat is found, not a singer). */
type Find = 'hat' | 'terry' | 'seal' | 'adelies' | 'whale'
/** Each one's band of color in the ring (Pebble's pink is always the first). */
const BAND: Record<Find | 'pebble', string> = { pebble: '#FF6FA8', hat: '#FF6FA8', terry: '#7EC8F2', seal: '#7ED6A5', adelies: '#FFD84D', whale: '#B79CFF' }
const SINGER: Partial<Record<Find, Singer>> = { terry: 'terry', seal: 'seal', adelies: 'adelie', whale: 'whale' }

/** Where Pola stands at each stop (she faces -z, away from the camera, into the dark; Pebble on her back faces us). */
const STOPS = [new Vector3(0, 0, 0), new Vector3(0, 0, -14), new Vector3(0, 0, -27)] as const
const STOP_OF: Record<NightSection, number> = { whiteout: 0, edge: 1, together: 2 }
const SECTION_OF: NightSection[] = ['whiteout', 'edge', 'together']
/** Where each hidden friend is, and at which stop. */
const HIDE: Record<Find, { at: [number, number]; stop: number }> = {
  hat: { at: [1.8, -1.3], stop: 0 },
  terry: { at: [-2.5, -3.2], stop: 0 },
  seal: { at: [2.5, -17.3], stop: 1 },
  adelies: { at: [-3.2, -17.4], stop: 1 },
  whale: { at: [7, -17.4], stop: 1 },
}
/** The sea along the ice edge (east of this x, between these z). */
const EDGE_X = 4.4
/** The colony, far off over the hills, where Papa is. */
const COLONY = new Vector3(0, 0, -112)
/** The look of each stop: the fog (color, near, far), how much it snows, the southern lights. */
/** (The fog's near and far are meters past Pola, from the camera, so the camera's distance never fogs her.) */
const AIR = [
  { fog: '#9B95CF', near: -3, far: 9, snow: 1, aurora: 0 },
  { fog: '#4B4592', near: 3, far: 30, snow: 0.35, aurora: 0.55 },
  { fog: '#3E3C7E', near: 20, far: 160, snow: 0.12, aurora: 1 },
]
/** The night light (the huddle's): its color and strength. */
const NIGHT_TINT = '#B9BEFF'
const NIGHT_LIGHT: [number, number] = [0.72, 0.55]
/** Nothing sung for this long: the hint (Pebble glows and pulses). */
const HINT_S = 8
/** Seconds between the end of the song and its start again while she holds. */
const SONG_GAP = 0.35

export const CHORUS_ANCHORS: AnchorInfo[] = [
  { id: 'pebble', label: 'Pebble: hold him to sing', kind: 'thing' },
  { id: 'pola', label: 'Pola', kind: 'thing' },
  { id: 'terry', label: 'Terry the tern', kind: 'thing' },
  { id: 'seal', label: 'A Weddell seal', kind: 'thing' },
  { id: 'adelies', label: 'The Adelie penguins', kind: 'thing' },
  { id: 'whale', label: 'A humpback whale', kind: 'thing' },
  { id: 'balloon', label: "Sparkle's balloon", kind: 'thing' },
]

/** A ring of song rolling out across the snow. */
interface Ring {
  mesh: Mesh
  mat: ShaderMaterial
  ox: number
  oz: number
  r: number
  max: number
  speed: number
  fade: number
  found: number
  kind: 'song' | 'far' | 'gold'
}

interface Hidden {
  id: Find
  x: number
  z: number
  stop: number
  found: boolean
  pity: number
  lit: number
  /** The snow it hides under (or the hat itself); what lights up before it's found. */
  lump: Group
  halo: Sprite
  haloMat: SpriteMaterial
  wob: number
}

const tmp = new Vector3()
const tmp2 = new Vector3()

const RING_VS = /* glsl */ `
  varying vec2 vP;
  void main() {
    vP = (modelMatrix * vec4(position, 1.0)).xz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`
const RING_FS = /* glsl */ `
  uniform float uR;
  uniform float uW;
  uniform float uA;
  uniform vec2 uO;
  uniform float uTime;
  uniform float uPreview;
  uniform float uMark;
  uniform float uN;
  uniform vec3 uCols[6];
  varying vec2 vP;
  void main() {
    vec2 p = vP - uO;
    float d = length(p);
    float ang = atan(p.y, p.x);
    float behind = uR - d;
    vec3 col = uCols[0];
    float a = 0.0;
    if (uPreview > 0.5) {
      // The charge: a dashed circle at the radius the ring will reach, turning as it grows, and a faint fill.
      float line = exp(-pow(d - uR, 2.0) / 0.012);
      float dash = step(0.45, fract(ang * 3.8197 + uTime * 0.35));
      a = line * dash * 0.9 + (1.0 - smoothstep(0.0, uR, d)) * 0.07;
      // The last song's mark: a soft gold circle at the size that reaches the colony.
      if (uMark > 0.0) {
        float m = exp(-pow(d - uMark, 2.0) / 0.03);
        a += m * 0.55;
        col = mix(col, vec3(1.0, 0.86, 0.42), m);
      }
    } else {
      // The band: bright at its leading edge, one stripe per singer, and the snow just passed glowing behind it.
      float k = clamp(behind / uW, 0.0, 0.999);
      float idx = floor(k * uN);
      for (int i = 1; i < 6; i++) if (float(i) == idx) col = uCols[i];
      float band = step(0.0, behind) * step(behind, uW);
      a = band * (0.22 + 0.45 * (1.0 - k));
      a += step(uW, behind) * exp(-(behind - uW) / (uW * 1.2)) * 0.1;
      a += exp(-pow(d - uR, 2.0) / (0.01 * uW)) * 0.6;
      // Sparkles in the band.
      float cell = floor(ang * 38.0) * 12.9898 + floor(d * 2.5) * 78.233;
      float fleck = step(0.9, fract(sin(cell) * 43758.5453));
      a += band * fleck * 0.45 * (0.5 + 0.5 * sin(uTime * 9.0 + ang * 23.0));
    }
    gl_FragColor = vec4(col, clamp(a * uA, 0.0, 1.0));
    #include <colorspace_fragment>
  }`

export class ChorusWorld implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private sky: PolarSky
  private aurora: Aurora
  private fog: Fog
  private stops: (() => void)[] = []
  private blizzardBed: (() => void) | null = null

  private pola: Actor
  private pebble: Actor
  private terry: Actor
  private adelies: Actor[] = []
  private seal: IceSeal
  private sealHole: Group
  private whale: Humpback
  private balloon: Balloon
  private hat: Group
  private hidden: Hidden[] = []
  private found = new Set<Find>()
  /** Found and singing (a friend joins at the end of their little scene). */
  private joined = new Set<Find>()

  private rings: Ring[] = []
  private ringGeo: PlaneGeometry
  /** The snow's shape round the walk (and the sea, at the water), for the rings to roll along. */
  private songGround!: BufferGeometry
  private preview: { mesh: Mesh; mat: ShaderMaterial }
  private pebbleGlow: Sprite
  private pebbleGlowMat: SpriteMaterial
  private polaGlow: Sprite
  private polaGlowMat: SpriteMaterial
  private polaLit = 0
  private colonyGlow: Sprite
  private flakes: Particles
  private puffs: Particles
  private sparkles: Particles
  private noteMats: SpriteMaterial[]
  private notes: { s: Sprite; t: number; life: number; vx: number; vy: number; vz: number; size: number }[] = []

  private raycaster = new Raycaster()
  private ground = new Plane(new Vector3(0, 1, 0), 0)
  private anchorEls = new Map<string, HTMLElement>()
  private unwatch: () => void
  private w = 1
  private h = 1
  private tall = false
  private time = 0

  // ---- The story.
  private section: NightSection
  private stop = 0
  /** 0..2 between stops while Pola walks (the air blends). */
  private air = 0
  private walking = false
  private step: 'play' | 'walk' | 'far' | 'answer' | 'end' = 'play'
  private queue: Find[] = []
  private busyUntil = 0
  private later: { at: number; fn: () => void }[] = []
  private ringsSung = 0
  private bigTries = 0
  private camoSaid = false
  private lastSing = 0
  private farRing: Ring | null = null
  private goldRing: Ring | null = null
  /** The camera looks out over the hills (the far song and the answer). */
  private lookFar = 0
  private lookFarTo = 0
  private closeEnd = false
  private polaPokes = 0
  private terryPokes = 0
  private peeps: number[] = []

  // ---- Her finger.
  private hold: { t: number; songT: number; note: number; marked: boolean } | null = null
  private counts = { holds: 0, peeps: 0, rings: 0, taps: 0, pokes: 0, hiccups: 0, found: 0 }
  private poked = new Set<string>()

  constructor(
    private renderer: WebGLRenderer,
    start: ChorusStart,
    private events: ChorusEvents,
  ) {
    const { scene, bag } = this
    applyBands()
    this.fog = new Fog(AIR[0].fog, 10, 30)
    scene.fog = this.fog
    this.rig.fov = 38
    this.rig.lag = 0.6
    this.rig.camera.near = 0.05

    // ---- The long night: Antarctica under its night sky, the lights coming out as the storm clears.
    this.sky = new PolarSky(bag, 'night')
    this.aurora = new Aurora(bag)
    scene.add(this.sky.root, this.aurora.root)
    this.buildLand()

    // ---- The friends. Pola carries Pebble on her back (he faces us over her shoulder); the rest are hidden.
    this.pola = new Actor('pola', bag)
    this.pebble = new Actor('pebble', bag, { height: 0.62 })
    this.terry = new Actor('terry', bag)
    scene.add(this.pola.root, this.pebble.root, this.terry.root)
    for (let i = 0; i < 3; i++) {
      const a = new Actor('adelie', bag, { height: 0.72 + i * 0.04, voice: null })
      a.hide()
      scene.add(a.root)
      this.adelies.push(a)
    }
    this.balloon = new Balloon(bag)
    this.balloon.root.scale.setScalar(0.55)
    this.balloon.root.position.set(-4.4, -0.2, -1.2)
    this.balloon.root.rotation.set(0.15, 0.5, 1.15)
    scene.add(this.balloon.root)
    // The woolly hat (the one Papa found on the slide), half buried; Pebble wears it once it's found.
    this.hat = solid(bake(hatGeo(), '#ffffff'), bag, 2)
    this.hat.scale.setScalar(0.42)
    scene.add(this.hat)
    // The Weddell seal's breathing hole, and the seal under it.
    this.sealHole = this.buildHole()
    this.seal = new IceSeal(bag, 'weddell', 0.9)
    this.sealHole.add(this.seal.root)
    this.seal.root.rotation.y = 0.6
    this.seal.asleep = true
    // The humpback, out in the dark sea.
    this.whale = new Humpback(bag, 0.85)
    this.whale.root.rotation.y = -1.1
    scene.add(this.whale.root)

    // ---- The rings, the charge preview, the glows, the notes, the snow.
    this.ringGeo = bag.add(new PlaneGeometry(1, 1).rotateX(-Math.PI / 2))
    const pm = this.ringMaterial()
    this.preview = { mesh: new Mesh(this.ringGeo, pm), mat: pm }
    this.preview.mat.uniforms.uPreview.value = 1
    this.preview.mesh.visible = false
    this.preview.mesh.renderOrder = 3
    scene.add(this.preview.mesh)
    const glowTex = bag.add(glowTexture())
    this.pebbleGlowMat = bag.add(new SpriteMaterial({ map: glowTex, transparent: true, opacity: 0.5, blending: AdditiveBlending, depthWrite: false, fog: false }))
    this.pebbleGlow = new Sprite(this.pebbleGlowMat)
    this.polaGlowMat = bag.add(new SpriteMaterial({ map: glowTex, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, fog: false, color: '#E6E2FF' }))
    this.polaGlow = new Sprite(this.polaGlowMat)
    const gold: Texture = bag.add(softTexture(128, 128, [255, 214, 130], (x, y) => radialAlpha(Math.hypot(x - 64, y - 64), 64, [[0, 0.9], [0.4, 0.45], [1, 0]])))
    this.colonyGlow = new Sprite(bag.add(new SpriteMaterial({ map: gold, transparent: true, opacity: 0.5, blending: AdditiveBlending, depthWrite: false, fog: false })))
    this.colonyGlow.position.set(COLONY.x, 5, COLONY.z)
    this.colonyGlow.scale.set(44, 18, 1)
    scene.add(this.pebbleGlow, this.polaGlow, this.colonyGlow)
    this.noteMats = NOTE_COLORS.map((c) => bag.add(new SpriteMaterial({ map: bag.add(noteTexture(c)), transparent: true, depthWrite: false, fog: false })))
    this.flakes = new Particles({ kind: 'spray', count: 520, color: '#FFFFFF', gravity: 0.25 }, bag)
    this.puffs = new Particles({ kind: 'spray', count: 140, color: '#EEF2FF' }, bag)
    this.sparkles = new Particles({ kind: 'spray', count: 160, colors: NOTE_COLORS, gravity: -0.3 }, bag)
    scene.add(this.flakes.mesh, this.puffs.mesh, this.sparkles.mesh)

    // ---- The hidden friends: the snow they're under (or the hat), and a halo that glimmers when the rings miss.
    for (const id of Object.keys(HIDE) as Find[]) {
      const [x, z] = HIDE[id].at
      const lump = this.buildLump(id, x, z)
      const haloMat = bag.add(new SpriteMaterial({ map: glowTex, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, fog: false, color: BAND[id] }))
      const halo = new Sprite(haloMat)
      halo.position.set(x, id === 'whale' ? 0.5 : 0.6, z)
      scene.add(halo)
      this.hidden.push({ id, x, z, stop: HIDE[id].stop, found: false, pity: 0, lit: 0, lump, halo, haloMat, wob: 0 })
    }

    dress(scene)

    // ---- Where the link starts: the friends found before it already singing.
    this.section = start.section
    this.stop = STOP_OF[start.section]
    this.air = this.stop
    const s = STOPS[this.stop]
    this.pola.place(s.x, 0, s.z, 180)
    this.pebble.ride(this.pola.root, 0, 0.72, -0.28, 180)
    this.terry.hide()
    this.hideFriends()
    for (const h of this.hidden) if (h.stop < this.stop) this.foundNow(h.id, true)
    this.stops.push(nightSfx.night())
    if (this.stop === 0) this.blizzardBed = nightSfx.blizzard()
    this.dots()
    this.at(0.8, () => this.opening())

    this.unwatch = watch('chorus', () => ({
      hold: [this.hold ? this.charge() : 0, 1],
      'ring m': [this.rings.length ? this.rings[this.rings.length - 1].r : 0, RING.max],
      'found': [this.found.size, 5],
    }))
  }

  // ---------------------------------------------------------------- building

  /** Snow rolling away into the dark: flat where Pola walks, the ice edge and the sea on the right of the middle
   *  stretch, hills and mountains far off, and the colony's glow beyond the last hill. */
  private buildLand() {
    const { scene, bag } = this
    const r = rng(52)
    const path = { x0: -11, x1: EDGE_X, z0: -36, z1: 9 }
    const sea = (x: number, z: number) => x > EDGE_X && z < 6
    const heightAt = (x: number, z: number) => {
      if (sea(x, z)) return -2.5
      const far = smoothstep(0, 40, outside(x, z, path))
      // The hills between the last stop and the colony, low enough for the far song to roll over.
      const hills = smoothstep(-34, -50, z) * (1 - smoothstep(-80, -100, z)) * (1.4 + fbm(x * 0.05, z * 0.05) * 3)
      return (fbm(x * 0.03 + 3, z * 0.03) - 0.3) * 14 * far + hills + (noise(x * 0.25, z * 0.25) - 0.5) * 0.12 * smoothstep(2, 8, outside(x, z, path))
    }
    scene.add(solid(field({ x0: -160, x1: 40, z0: -220, z1: 40, cell: 1.2, height: heightAt, color: (_x, _z, h, slope) => '#' + snowColor(h, slope, -0.2, 0.7).getHexString() }), bag, 0))
    // The ice edge: a low cliff down to the dark sea, the sea itself out to the horizon.
    scene.add(solid(iceCliff(EDGE_X, 6, EDGE_X, -200, 0, -0.6, -0.45, 7), bag, 1.5, ICE_LINE))
    this.songGround = bag.add(field({ x0: -40, x1: 34, z0: -132, z1: 14, cell: 1.4, height: (x, z) => Math.max(heightAt(x, z), -0.44) + 0.03, color: () => '#ffffff' }))
    const water = new Mesh(bag.add(new PlaneGeometry(220, 200).rotateX(-Math.PI / 2)), bag.add(new MeshBasicMaterial({ color: '#232A66' })))
    water.position.set(EDGE_X + 110, -0.45, -60)
    scene.add(water)
    const drifts = []
    for (let i = 0; i < 26; i++) {
      const x = -14 + r() * 19
      const z = 1 - r() * 36
      if (Math.abs(x) < 2.2 || x > EDGE_X - 1.5 || Object.values(HIDE).some((hd) => Math.hypot(x - hd.at[0], z - hd.at[1]) < 2.2)) continue
      drifts.push(driftGeo(0.6 + r() * 1.1, 0.2 + r() * 0.35).translate(x, 0, z))
    }
    scene.add(solid(merge(drifts), bag, 1.5, ICE_LINE))
    // Far away: mountains behind the hills, flat bergs out at sea.
    scene.add(solid(merge([[-70, -150, 26, 30, 1], [-10, -175, 34, 40, 2], [40, -165, 24, 26, 3], [-120, -125, 22, 24, 4]].map(([x, z, rr, hh, seed]) => mountainGeo(rr, hh, seed).translate(x, heightAt(x, z) - 2, z))), bag, 2.5, ICE_LINE))
    scene.add(solid(merge([tableBergGeo(10, 6, 3).translate(26, -0.5, -34), tableBergGeo(14, 8, 3.5).translate(38, -0.5, -62), tableBergGeo(6, 4, 2).translate(24, -0.5, -16)]), bag, 2.5, ICE_LINE))
  }

  /** A breathing hole in the sea ice: a ring of packed snow round dark water (the seal comes up through it). */
  private buildHole() {
    const { bag } = this
    const root = new Group()
    root.add(solid(merge([P.torus(0.6, 0.15, '#E8EEFA', { rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.7] })]), bag, 1.5, ICE_LINE))
    const water = new Mesh(bag.add(new PlaneGeometry(1.15, 1.15).rotateX(-Math.PI / 2)), bag.add(new MeshBasicMaterial({ color: '#23295E' })))
    water.position.y = 0.01
    root.add(water)
    const [x, z] = HIDE.seal.at
    root.position.set(x, 0, z)
    this.scene.add(root)
    return root
  }

  /** What each hidden friend looks like before the ring finds them. */
  private buildLump(id: Find, x: number, z: number) {
    const { bag } = this
    const g = new Group()
    g.position.set(x, 0, z)
    if (id === 'hat') {
      // The hat, tipped over in the snow, a little snow on top.
      this.hat.position.set(x, 0.06, z)
      this.hat.rotation.set(0.5, 0.3, 0.35)
      g.add(solid(driftGeo(0.55, 0.16), bag, 1.5, ICE_LINE))
    } else if (id === 'terry') {
      // A drift with two little red feet sticking out of the top: Terry, upside down.
      g.add(solid(driftGeo(0.85, 0.5), bag, 1.5, ICE_LINE))
      g.add(solid(merge([-1, 1].map((s) => P.cone(0.05, 0.22, '#E4573D', { at: [s * 0.07, 0.6, 0], rot: [0, 0, s * 0.25] }, 6))), bag, 1.5))
    } else if (id === 'adelies') {
      // A long drift with three humps: the Adelies asleep under the snow.
      g.add(solid(merge([driftGeo(1.4, 0.55), driftGeo(0.7, 0.75).translate(-0.6, 0, 0.1), driftGeo(0.7, 0.7).translate(0.6, 0, -0.1)]), bag, 1.5, ICE_LINE))
    } else if (id === 'whale') {
      // Nothing to see out at sea but a slow ripple on the dark water.
      g.add(new Mesh(bag.add(new PlaneGeometry(3, 3).rotateX(-Math.PI / 2)), bag.add(new MeshBasicMaterial({ color: '#39418A', transparent: true, opacity: 0.6 }))))
      g.position.y = -0.43
    }
    this.scene.add(g)
    return g
  }

  private ringMaterial() {
    return this.bag.add(
      new ShaderMaterial({
        uniforms: {
          uR: { value: 0 },
          uW: { value: 1 },
          uA: { value: 1 },
          uO: { value: new Vector2() },
          uTime: { value: 0 },
          uPreview: { value: 0 },
          uMark: { value: 0 },
          uN: { value: 1 },
          uCols: { value: Array.from({ length: 6 }, () => new Color(BAND.pebble)) },
        },
        vertexShader: RING_VS,
        fragmentShader: RING_FS,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide,
        fog: false,
        // (Drawn on a copy of the snow's own shape, a hair above it.)
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -4,
      }),
    )
  }

  /** Everyone not found yet back in hiding (the hat on the snow, the seal under the water, the whale deep). */
  private hideFriends() {
    for (const a of this.adelies) a.hide()
    this.seal.root.position.y = -0.9
    this.whale.root.position.set(HIDE.whale.at[0], -3, HIDE.whale.at[1])
  }

  // ---------------------------------------------------------------- the story

  private at(sec: number, fn: () => void) {
    this.later.push({ at: this.time + sec, fn })
  }

  private opening() {
    if (this.stop < 2) {
      this.events.hint('start')
      this.events.talk('start', 'cue')
      return
    }
    this.togetherOpening()
  }

  private togetherOpening() {
    this.events.hint(null)
    this.pola.hop()
    this.events.talk('together', 'friend')
    for (const a of this.adelies) a.hop()
    this.at(1.6, () => {
      this.events.hint('long')
      this.events.talk('long', 'cue')
    })
  }

  private dots() {
    const here = this.hidden.filter((h) => h.stop === Math.min(1, this.stop) && h.id !== 'hat')
    if (this.stop === 2) return this.events.dots(0, 0)
    this.events.dots(here.filter((h) => h.found).length, here.length)
  }

  /** Found: each one's own little scene (queued, so two found by one ring take turns). */
  private find(h: Hidden) {
    if (h.found) return
    h.found = true
    this.counts.found++
    this.queue.push(h.id)
  }

  private nextReveal() {
    const id = this.queue.shift()
    if (!id) return
    this.busyUntil = this.time + this.foundNow(id, false)
    this.dots()
  }

  /** Plays one find (or sets it straight to after, for a section link); returns how long it takes. */
  private foundNow(id: Find, instant: boolean): number {
    const h = this.hidden.find((o) => o.id === id)!
    h.found = true
    this.found.add(id)
    h.haloMat.opacity = 0
    const [x, z] = HIDE[id].at
    if (!instant) this.focus = { at: new Vector3(x, 0, z), until: this.time + 4.5 }
    const puff = (y = 0.3, n = 26) => !instant && (this.puffs.burst(x, y, z, n, 2.2, 2.6, 0.2), nightSfx.poof())
    if (id === 'hat') {
      h.lump.visible = false
      this.wearHat()
      if (instant) return 0
      puff(0.2, 16)
      // The hat flips up out of the snow and lands on Pebble's head.
      this.hat.parent?.remove(this.hat)
      this.scene.add(this.hat)
      this.hat.position.set(x, 0.1, z)
      const from = new Vector3(x, 0.1, z)
      this.flight = { obj: this.hat, from, t: 0, dur: 0.8, done: () => this.wearHat() }
      nightSfx.hat()
      this.at(0.9, () => {
        this.pebble.pull('happy')
        this.pebble.hop()
        this.events.talk('hat', 'friend')
      })
      return 2.4
    }
    if (id === 'terry') {
      h.lump.visible = false
      if (instant) {
        this.terry.ride(this.pola.root, 0.16, this.pola.height - 0.04, 0.1, 160)
        this.joined.add('terry')
        return 0
      }
      puff(0.4, 30)
      // He pops out of the drift, upright, shakes the snow off, then flies up to Pola's head.
      this.terry.place(x, 0, z, 30)
      this.terry.hopTo(x + 0.3, 0, z + 0.4, 0.6, 20, 0.8)
      nightSfx.tern()
      this.at(0.8, () => this.terry.shake())
      this.at(1.2, () => this.events.talk('terry', 'friend'))
      this.at(2.6, () => {
        const top = this.pola.at(1.02, tmp)
        this.terry.flyTo(top.x, top.y, top.z, 1.1, null, 0.9, true)
      })
      this.at(3.8, () => {
        this.terry.ride(this.pola.root, 0.16, this.pola.height - 0.04, 0.1, 160)
        this.join('terry')
      })
      return 4.2
    }
    if (id === 'seal') {
      this.seal.asleep = false
      if (instant) {
        this.seal.root.position.y = -0.15
        this.joined.add('seal')
        return 0
      }
      this.sealUp = 0
      nightSfx.weddell()
      this.at(0.7, () => this.seal.act())
      this.at(1.2, () => this.events.talk('weddell', 'fact'))
      this.at(1.6, () => this.join('seal'))
      return 3.6
    }
    if (id === 'adelies') {
      h.lump.visible = false
      const spots = this.adelieSpots(this.stop)
      if (instant) {
        this.adelies.forEach((a, i) => a.place(spots[i].x, 0, spots[i].z, 0))
        this.joined.add('adelies')
        return 0
      }
      puff(0.4, 40)
      nightSfx.honk()
      this.adelies.forEach((a, i) => {
        a.place(x + (i - 1) * 0.6, 0, z + (i % 2) * 0.2, 0)
        a.hopTo(x + (i - 1) * 0.7, 0, z + 0.5, 0.6, 0, 0.7)
      })
      this.at(0.9, () => this.events.talk('adelies', 'friend'))
      this.at(1.6, () => this.adelies.forEach((a, i) => a.walkTo(spots[i].x, spots[i].z, 1.8, 0)))
      this.at(2, () => this.join('adelies'))
      return 3.8
    }
    // The whale rises out of the dark sea and sings.
    this.whaleUp = instant ? 1 : 0
    if (instant) {
      this.joined.add('whale')
      return 0
    }
    this.whaleUp = 0.001
    nightSfx.whale()
    this.at(1, () => this.whale.sing())
    this.at(1.6, () => this.events.talk('whale', 'fact'))
    this.at(2.2, () => this.join('whale'))
    return 4
  }
  private sealUp = -1
  private whaleUp = 0
  /** Something flying through the air to a spot (the hat onto Pebble's head). */
  private flight: { obj: Group; from: Vector3; t: number; dur: number; done: () => void } | null = null

  private wearHat() {
    const r = this.pebble.rig
    this.hat.parent?.remove(this.hat)
    r.head.add(this.hat)
    const R = r.face.R
    this.hat.position.set(0, r.face.headY + R * 0.62, -R * 0.05)
    this.hat.rotation.set(-0.12, 0, 0.08)
    this.hat.scale.setScalar(R * 2.05)
    this.flight = null
  }

  /** Where the Adelies stand round Pola at a stop. */
  private adelieSpots(stop: number) {
    const s = STOPS[stop]
    return [new Vector3(s.x - 1.5, 0, s.z + 0.6), new Vector3(s.x - 2.1, 0, s.z - 0.4), new Vector3(s.x + 1.6, 0, s.z + 0.3)]
  }

  /** A friend joins the song: a happy cheer, sparkles of their band's color. */
  private join(id: Find) {
    this.joined.add(id)
    const p = this.friendAt(id, tmp)
    this.sparkles.burst(p.x, p.y + 0.4, p.z, 24, 2, 2.4, 0.14, NOTE_COLORS.indexOf(BAND[id]))
    nightSfx.reveal()
  }

  /** The friends who sing with Pebble now, in the order they joined (their bands follow his pink). */
  private singers(): Find[] {
    return [...this.joined]
  }

  private friendAt(id: Find | 'pebble' | 'pola', out: Vector3) {
    if (id === 'pebble') return this.pebble.at(0.6, out)
    if (id === 'pola') return this.pola.at(0.5, out)
    if (id === 'terry') return this.terry.root.visible ? this.terry.at(0.5, out) : out.set(HIDE.terry.at[0], 0.4, HIDE.terry.at[1])
    if (id === 'seal') return this.seal.root.getWorldPosition(out).setY(0.3)
    if (id === 'adelies') return this.adelies[0].root.visible ? this.adelies[0].at(0.5, out) : out.set(HIDE.adelies.at[0], 0.4, HIDE.adelies.at[1])
    if (id === 'whale') return this.whale.root.getWorldPosition(out).setY(0.4)
    return out.set(HIDE.hat.at[0], 0.2, HIDE.hat.at[1])
  }

  /** Everyone here has joined: Pola walks on to the next stop (the camera goes with her), the friends follow. */
  private walkOn() {
    const next = this.stop + 1
    if (next > 2) return
    this.step = 'walk'
    this.walking = true
    this.events.hint(null)
    const to = STOPS[next]
    const dur = 5.5
    this.pola.walkTo(to.x, to.z, dur, 180)
    nightSfx.step()
    if (this.found.has('adelies')) {
      const spots = this.adelieSpots(next)
      this.adelies.forEach((a, i) => a.walkTo(spots[i].x, spots[i].z, dur + 0.4 + i * 0.3, 0))
    }
    if (next === 2) {
      this.blizzardBed?.()
      this.blizzardBed = null
    }
    this.at(dur + 0.2, () => {
      this.walking = false
      this.stop = next
      this.section = SECTION_OF[next]
      this.events.section(this.section)
      this.step = 'play'
      this.dots()
      if (next === 1) {
        this.blizzardBed?.()
        this.blizzardBed = null
        this.events.hint('start')
      } else this.togetherOpening()
    })
  }

  // ---------------------------------------------------------------- singing

  /** How full the hold is, 0..1 (the knobs' curve). */
  private charge() {
    if (!this.hold) return 0
    return Math.pow(clamp(this.hold.t / RING.grow), RING.curve)
  }
  private radiusFor(k: number) {
    return RING.small + (RING.max - RING.small) * k
  }
  /** The hold the last song needs (shorter after two short tries). */
  private bigHold() {
    return this.bigTries >= 2 ? RING.big * 0.5 : RING.big
  }

  private startHold() {
    if (this.step !== 'play' || this.hold) return
    this.hold = { t: 0, songT: 0, note: -1, marked: false }
    this.pebble.pull('happy', true)
    this.lastSing = this.time
  }

  private endHold() {
    const hd = this.hold
    this.hold = null
    this.pebble.cheer()
    if (!hd || hd.t < RING.tap) return
    this.counts.holds++
    const k = Math.pow(clamp(hd.t / RING.grow), RING.curve)
    if (this.stop === 2 && this.step === 'play') {
      if (hd.t >= this.bigHold()) return this.farSong()
      this.bigTries++
    }
    this.launch(this.radiusFor(k), 'song')
  }

  /** A quick tap: a little peep and a little ring (three quick ones: a hiccup). */
  private peep() {
    if (this.step !== 'play') return
    this.counts.peeps++
    this.lastSing = this.time
    this.peeps = this.peeps.filter((p) => this.time - p < 1.4)
    this.peeps.push(this.time)
    this.pebble.hop()
    if (this.peeps.length >= 3) {
      this.peeps = []
      this.counts.hiccups++
      nightSfx.hic()
      this.pebble.pull('wow')
      this.note(this.pebble.at(0.85, tmp), 0)
      return
    }
    voice('pebble', 12, 0.2, 0.9, this.pan(this.pebble.at(0.6, tmp)))
    this.beak = 0.2
    this.note(this.pebble.at(0.85, tmp), 0)
    this.launch(RING.peep, 'song')
  }
  private beak = 0

  /** A ring of song rolls out from Pebble. */
  private launch(max: number, kind: Ring['kind']) {
    const o = this.pebble.root.getWorldPosition(tmp)
    // A friend the rings keep missing answers anyway: this ring stretches to reach them.
    if (kind === 'song') {
      for (const h of this.hidden) {
        if (h.found || h.stop !== this.stop || h.pity < RING.pity) continue
        max = Math.max(max, Math.hypot(h.x - o.x, h.z - o.z) + 0.8)
      }
    }
    const ring = this.makeRing(o.x, o.z, max, kind)
    this.rings.push(ring)
    this.counts.rings++
    this.ringsSung++
    nightSfx.ring(clamp((max - RING.peep) / (RING.max - RING.peep)))
    if (this.ringsSung === 1 && this.stop === 0) this.at(0.6, () => this.events.talk('lights', 'fact'))
    return ring
  }

  private makeRing(ox: number, oz: number, max: number, kind: Ring['kind']): Ring {
    const mat = this.ringMaterial()
    // The ring is drawn on the snow's own shape, so it rolls up and over the hills (and across the sea).
    const mesh = new Mesh(this.songGround, mat)
    mesh.renderOrder = 2
    ;(mat.uniforms.uO.value as Vector2).set(ox, oz)
    const cols = kind === 'gold' ? ['#FFD45E', '#FFE79A', '#FFC23D', '#FFE79A', '#FFD45E', '#FFC23D'] : kind === 'far' ? NOTE_COLORS : ['pebble' as const, ...this.singers()].map((f) => BAND[f])
    for (let i = 0; i < 6; i++) (mat.uniforms.uCols.value as Color[])[i].set(cols[Math.min(i, cols.length - 1)])
    mat.uniforms.uN.value = kind === 'song' ? cols.length : 6
    mat.uniforms.uW.value = kind === 'song' ? RING.width * (0.7 + 0.3 * cols.length) : RING.width * 4
    this.scene.add(mesh)
    const speed = kind === 'far' ? RING.speed * 3 : kind === 'gold' ? RING.speed * 3.5 : RING.speed
    return { mesh, mat, ox, oz, r: 0.3, max, speed, fade: 1, found: 0, kind }
  }

  /** The big song: the rainbow ring rolls all the way over the hills to the colony. Then silence, then Papa. */
  private farSong() {
    this.step = 'far'
    this.events.hint(null)
    const o = this.pebble.root.getWorldPosition(tmp)
    this.farRing = this.makeRing(o.x, o.z, Math.hypot(COLONY.x - o.x, COLONY.z - o.z) + 6, 'far')
    this.rings.push(this.farRing)
    this.counts.rings++
    nightSfx.ring(1)
    nightSfx.far()
    this.lookFarTo = 1
    for (const f of this.singers()) this.friendSings(f)
  }

  /** Papa's answer: a gold ring from the colony, his song with it. */
  private answer() {
    this.step = 'answer'
    const o = this.pebble.root.getWorldPosition(tmp)
    const dist = Math.hypot(COLONY.x - o.x, COLONY.z - o.z)
    this.goldRing = this.makeRing(COLONY.x, COLONY.z, dist + 4, 'gold')
    this.rings.push(this.goldRing)
    // His song arrives with the ring.
    const arrive = dist / this.goldRing.speed
    this.at(Math.max(0, arrive - tuneSeconds(TUNES[0]) * 0.6), () => sing(TUNES[0], 'papa', 0, 0.55))
    this.at(arrive + 0.2, () => {
      this.lookFarTo = 0
      this.closeEnd = true
      this.pebble.pull('happy', true)
      this.pebble.hop()
      this.pola.hop()
      for (const a of this.adelies) a.hop()
      this.terry.hop()
      nightSfx.cheer()
      const p = this.pebble.at(1, tmp2)
      for (let i = 0; i < 12; i++) this.note(p, i % 6, 2.4)
      this.events.talk('papa', 'friend')
    })
    this.at(arrive + 3.2, () => {
      this.step = 'end'
      this.events.phase('end')
    })
  }

  /** A friend sings the song by themselves (a poke, or the big song). */
  private friendSings(f: Find | 'pola') {
    const s: Singer = f === 'pola' ? 'pola' : SINGER[f as Find] ?? 'pebble'
    const pan = this.pan(this.friendAt(f as Find, tmp))
    let at = 0
    for (const [semi, beats] of TUNES[0]) {
      const d = beats * 0.26
      this.at(at, () => voice(s, semi, d * 0.95, 1, pan))
      at += d
    }
    if (f === 'seal') this.seal.act()
    if (f === 'whale') this.whale.sing()
    this.solo = { who: f, until: this.time + at }
  }
  private solo: { who: Find | 'pola'; until: number } | null = null

  /** Where something is across the screen, -1..1 (for the stereo). */
  private pan(v: Vector3) {
    const s = this.toScreen(v)
    return clamp((s.x / this.w) * 2 - 1, -1, 1) * 0.7
  }

  /** A music note floats up from a point. */
  private note(at: Vector3, color: number, spread = 0.6) {
    let n = this.notes.find((o) => o.t >= o.life)
    if (!n) {
      if (this.notes.length >= 48) return
      const s = new Sprite(this.noteMats[0])
      this.scene.add(s)
      n = { s, t: 0, life: 0, vx: 0, vy: 0, vz: 0, size: 0 }
      this.notes.push(n)
    }
    n.s.material = this.noteMats[color % this.noteMats.length]
    n.s.position.copy(at)
    n.t = 0
    n.life = 1.4
    n.vx = (Math.random() - 0.5) * spread
    n.vy = 0.9 + Math.random() * 0.5
    n.vz = (Math.random() - 0.5) * spread * 0.5
    n.size = 0.28
    n.s.visible = true
  }

  // ---------------------------------------------------------------- the frame

  update(dt: number) {
    const t = (this.time += dt)
    if (this.later.length) {
      const due = this.later.filter((l) => l.at <= t)
      this.later = this.later.filter((l) => l.at > t)
      due.forEach((l) => l.fn())
    }
    // Finds take turns; once everyone at this stop has joined and the last scene is done, Pola walks on.
    if (this.queue.length && t >= this.busyUntil) this.nextReveal()
    if (this.step === 'play' && !this.queue.length && t >= this.busyUntil && this.stop < 2 && this.hidden.filter((h) => h.stop === this.stop).every((h) => h.found)) {
      this.busyUntil = Infinity
      this.at(1.2, () => {
        this.busyUntil = 0
        this.walkOn()
      })
    }

    this.updateHold(dt)
    this.updateRings(dt, t)
    this.updateFriends(dt, t)
    this.updateScene(dt, t)

    this.lights.follow(this.pola.pos.x, 0, this.pola.pos.z)
    const boost = Math.min(0.5, this.rings.reduce((s, r) => s + (r.kind === 'song' ? 0.18 : 0.3) * r.fade, 0) + this.charge() * 0.15)
    this.lights.ambient.color.set(NIGHT_TINT)
    this.lights.sun.color.set(NIGHT_TINT)
    this.lights.ambient.intensity *= NIGHT_LIGHT[0] + boost
    this.lights.sun.intensity *= NIGHT_LIGHT[1] + boost * 0.6
    this.rig.setShot(this.shot())
    this.rig.update(dt)
    this.sky.update(t, this.rig.camera)
  }

  private updateHold(dt: number) {
    const hd = this.hold
    const pv = this.preview
    if (!hd) {
      pv.mesh.visible = false
      return
    }
    hd.t += dt
    this.lastSing = this.time
    const k = this.charge()
    // Papa's song, over and over while she holds, louder as it grows; every friend who has joined sings along.
    hd.songT += dt
    const len = tuneSeconds(TUNES[0]) + SONG_GAP
    const [i] = noteAt(TUNES[0], hd.songT % len)
    if (i !== hd.note) {
      hd.note = i
      if (i >= 0) {
        const [semi, beats] = TUNES[0][i]
        const d = beats * 0.26 * 0.95
        const vol = 0.55 + 0.45 * k
        voice('pebble', semi, d, vol, this.pan(this.pebble.at(0.6, tmp)))
        for (const f of this.singers()) voice(SINGER[f]!, semi, d, vol * 0.9, this.pan(this.friendAt(f, tmp)))
        this.note(this.pebble.at(0.9, tmp), i)
        for (const f of this.singers()) if (Math.random() < 0.6) this.note(this.friendAt(f, tmp).setY(tmp.y + 0.5), NOTE_COLORS.indexOf(BAND[f]))
        this.beak = d
        if (i === 0) {
          if (this.found.has('seal') && this.singers().includes('seal')) this.seal.act()
          if (this.singers().includes('whale')) this.whale.sing()
        }
      }
    }
    // The preview: how far the ring will go; at the last stop, a gold mark at the size that reaches the colony.
    const r = this.radiusFor(k)
    const o = this.pebble.root.getWorldPosition(tmp)
    const size = (RING.max + 2) * 2
    pv.mesh.visible = hd.t >= RING.tap
    pv.mesh.position.set(o.x, 0.06, o.z)
    pv.mesh.scale.set(size, 1, size)
    ;(pv.mat.uniforms.uO.value as Vector2).set(o.x, o.z)
    pv.mat.uniforms.uR.value = r
    pv.mat.uniforms.uTime.value = this.time
    const big = this.stop === 2 && this.step === 'play'
    const kBig = Math.pow(clamp(this.bigHold() / RING.grow), RING.curve)
    pv.mat.uniforms.uMark.value = big ? this.radiusFor(kBig) + 0.01 : 0
    const ready = big && hd.t >= this.bigHold()
    ;(pv.mat.uniforms.uCols.value as Color[])[0].set(ready ? '#FFD45E' : BAND.pebble)
    if (ready && !hd.marked) {
      hd.marked = true
      nightSfx.glint()
      this.sparkles.burst(o.x, 1, o.z, 20, 1.6, 2, 0.12)
    }
  }

  private updateRings(dt: number, t: number) {
    for (const ring of this.rings) {
      const prev = ring.r
      ring.r = Math.min(ring.max, ring.r + ring.speed * dt)
      if (ring.r >= ring.max) ring.fade = Math.max(0, ring.fade - dt * (ring.kind === 'song' ? 1.8 : 0.8))
      const u = ring.mat.uniforms
      u.uR.value = ring.r
      u.uTime.value = t
      u.uA.value = ring.fade * (ring.kind === 'song' ? 1 - 0.35 * smoothstep(0.6, 1, ring.r / ring.max) : 1)
      // Notes ride the leading edge now and then.
      if (ring.kind !== 'gold' && Math.random() < dt * (ring.kind === 'far' ? 30 : 8) && ring.fade > 0.5) {
        const a = Math.random() * Math.PI * 2
        this.note(tmp.set(ring.ox + Math.cos(a) * ring.r, 0.3, ring.oz + Math.sin(a) * ring.r), Math.floor(Math.random() * 6), 0.3)
      }
      // What it passes lights up; a hidden friend at this stop is found.
      const passed = (x: number, z: number) => {
        const d = Math.hypot(x - ring.ox, z - ring.oz)
        return d > prev && d <= ring.r
      }
      if (ring.kind === 'song') {
        for (const h of this.hidden) {
          if (h.stop !== this.stop || !passed(h.x, h.z)) continue
          h.lit = RING.glow
          if (!h.found) {
            ring.found++
            this.find(h)
          }
        }
        if (prev < 0.9 && ring.r >= 0.9) {
          this.polaLit = RING.glow
          if (this.stop === 0 && this.ringsSung >= 2 && !this.camoSaid) {
            this.camoSaid = true
            this.events.talk('camo', 'fact')
          }
        }
        for (const a of this.adelies) if (a.root.visible && passed(a.pos.x, a.pos.z)) a.hop()
      }
      if (ring.kind === 'gold') {
        for (const a of [this.pola, ...this.adelies]) if (a.root.visible && passed(a.pos.x, a.pos.z)) a.pull('wow')
      }
    }
    // Rings that are done: a miss makes the friends still hidden here glimmer brighter.
    for (const ring of this.rings.filter((r) => r.fade <= 0)) {
      if (ring.kind === 'song' && ring.found === 0) {
        for (const h of this.hidden) if (!h.found && h.stop === this.stop) h.pity++
      }
      if (ring === this.farRing) {
        this.farRing = null
        this.at(1.4, () => this.answer())
      }
      this.scene.remove(ring.mesh)
      ring.mat.dispose()
    }
    this.rings = this.rings.filter((r) => r.fade > 0)
  }

  private updateFriends(dt: number, t: number) {
    this.pola.update(dt, t)
    this.pebble.update(dt, t)
    this.terry.update(dt, t)
    for (const a of this.adelies) a.update(dt, t)
    this.seal.update(dt, t)
    this.whale.update(dt, t)
    // Pebble's beak with each note; his glow grows with the hold (and pulses when she's been away a while).
    this.beak = Math.max(0, this.beak - dt)
    const singing = this.hold || this.beak > 0
    openBeak(this.pebble, singing ? 0.35 + 0.5 * Math.abs(Math.sin(t * 14)) * (this.beak > 0 ? 1 : 0.4) : 0)
    // The friends who have joined open their beaks with him (or on their own, when she pokes one to sing).
    const sings = (f: Find) => !!this.hold || this.step === 'far' || (!!this.solo && this.solo.who === f && t < this.solo.until)
    if (this.joined.has('terry')) openBeak(this.terry, sings('terry') ? 0.3 + 0.4 * Math.abs(Math.sin(t * 12 + 1)) : 0)
    if (this.joined.has('adelies')) this.adelies.forEach((ad, i) => openBeak(ad, sings('adelies') ? 0.3 + 0.4 * Math.abs(Math.sin(t * 11 + i)) : 0))
    if (this.solo?.who === 'pola' && t < this.solo.until) openBeak(this.pola, 0.3 + 0.4 * Math.abs(Math.sin(t * 10)))
    const k = this.charge()
    const stuck = this.step === 'play' && !this.hold && t - this.lastSing > HINT_S
    const pg = this.pebble.at(0.55, tmp)
    this.pebbleGlow.position.copy(pg).add(tmp2.set(0, 0, 0.15))
    const pulse = stuck ? 0.25 * (0.5 + 0.5 * Math.sin(t * 5)) : 0
    this.pebbleGlow.scale.setScalar(0.9 + k * 1.4 + pulse * 2)
    this.pebbleGlowMat.opacity = 0.35 + k * 0.5 + pulse
    // The hat's flight onto his head.
    if (this.flight) {
      const f = this.flight
      f.t += dt
      const u = clamp(f.t / f.dur)
      const to = this.pebble.at(1.05, tmp2)
      f.obj.position.lerpVectors(f.from, to, u).setY(f.from.y + (to.y - f.from.y) * u + bell(u) * 1.4)
      f.obj.rotation.x += dt * 9
      if (u >= 1) f.done()
    }
    // The seal comes up through her hole; the whale rises out of the sea.
    if (this.sealUp >= 0) {
      this.sealUp = Math.min(1, this.sealUp + dt * 1.2)
      this.seal.root.position.y = -0.9 + 0.75 * smoothstep(0, 1, this.sealUp)
    }
    if (this.whaleUp > 0 && this.whaleUp < 1) this.whaleUp = Math.min(1, this.whaleUp + dt * 0.5)
    this.whale.root.position.y = -3 + 2.75 * smoothstep(0, 1, this.whaleUp) + 0.12 * Math.sin(t * 0.8)
    // Lit things: a glow in their band's color, a pink outline; the hidden ones glimmer more each miss.
    for (const h of this.hidden) {
      h.lit = Math.max(0, h.lit - dt)
      const glimmer = !h.found && h.stop === this.stop ? Math.min(0.55, h.pity * 0.16) * (0.6 + 0.4 * Math.sin(t * 4 + h.x)) : 0
      const lit = h.lit / RING.glow
      h.haloMat.opacity = h.found ? 0 : Math.max(glimmer, lit * 0.8)
      h.halo.scale.setScalar((h.id === 'whale' ? 3.4 : 1.8) * (1 + 0.25 * lit + glimmer * 0.6))
      if (!h.found && glimmer > 0.2 && Math.random() < dt * 3 * h.pity) this.sparkles.emit(h.x + (Math.random() - 0.5), 0.3, h.z + (Math.random() - 0.5), 0, 0.8, 0, 0.9, 0.08)
      this.outline(h.lump, !h.found && lit > 0.05)
      if (h.wob > 0) {
        h.wob = Math.max(0, h.wob - dt)
        h.lump.rotation.z = Math.sin(h.wob * 30) * 0.08 * h.wob
      }
    }
    this.polaLit = Math.max(0, this.polaLit - dt)
    const pl = this.polaLit / RING.glow
    this.polaGlowMat.opacity = pl * (this.stop === 0 ? 0.75 : 0.35)
    this.polaGlow.position.copy(this.pola.at(0.45, tmp))
    this.polaGlow.scale.setScalar(2.2)
    this.outline(this.pola.root, pl > 0.05)
  }

  private outlined = new WeakMap<object, boolean>()
  /** A pink outline on everything under `root` while the song lights it. */
  private outline(root: Group, on: boolean) {
    if ((this.outlined.get(root) ?? false) === on) return
    this.outlined.set(root, on)
    root.traverse((o) => {
      if ((o as Mesh).isMesh && o.userData.hull !== undefined) setHullHighlight(o as Mesh, on)
    })
  }

  private updateScene(dt: number, t: number) {
    // The air blends from stop to stop as Pola walks (the whiteout clears, the lights come out).
    const target = this.walking ? this.stop + clamp(1 - Math.hypot(this.pola.pos.z - STOPS[this.stop + 1].z, 0) / Math.abs(STOPS[this.stop + 1].z - STOPS[this.stop].z)) : this.stop
    this.air += (target - this.air) * Math.min(1, dt * 1.5)
    const i = Math.min(1, Math.floor(this.air))
    const k = this.air - i
    const A = AIR[i]
    const B = AIR[i + 1]
    this.fog.color.set(A.fog).lerp(tmpC.set(B.fog), k)
    const cam = this.rig.camera.position.distanceTo(this.pola.pos)
    this.fog.near = cam + A.near + (B.near - A.near) * k
    this.fog.far = (cam + A.far + (B.far - A.far) * k) * (1 + this.lookFar * 0.8)
    const snow = A.snow + (B.snow - A.snow) * k
    this.aurora.amount = A.aurora + (B.aurora - A.aurora) * k
    this.aurora.update(dt, t)
    this.colonyGlow.material.opacity = (0.6 + 0.4 * (this.goldRing ? 1 : 0)) * smoothstep(1.4, 2, this.air)
    // Snow blows across, thick in the whiteout.
    const c = this.pola.pos
    for (let n = Math.floor(snow * 60 * dt + Math.random()); n > 0; n--) this.flakes.emit(c.x - 10 + Math.random() * 6, 0.5 + Math.random() * 5, c.z - 8 + Math.random() * 12, 3 + Math.random() * 2 * snow, -0.6, (Math.random() - 0.5) * 0.6, 4, 0.05 + Math.random() * 0.05)
    this.flakes.update(dt)
    this.puffs.update(dt)
    this.sparkles.update(dt)
    for (const n of this.notes) {
      if (n.t >= n.life) continue
      n.t += dt
      if (n.t >= n.life) {
        n.s.visible = false
        continue
      }
      n.s.position.x += n.vx * dt
      n.s.position.y += n.vy * dt
      n.s.position.z += n.vz * dt
      const u = n.t / n.life
      n.s.scale.setScalar(n.size * Math.min(1, u * 6) * (1 - smoothstep(0.7, 1, u)) + 0.001)
    }
    this.balloon.update(dt, t * 0.2)
    // The camera's look out over the hills.
    this.lookFar += (this.lookFarTo - this.lookFar) * Math.min(1, dt * 0.9)
  }

  /** A find to keep in the picture while its little scene plays (the whale far out at sea). */
  private focus: { at: Vector3; until: number } | null = null

  /** Close behind Pola, looking down at her and the snow round her (the rings fit); for the far song, out over the
   *  hills toward the colony; for the answer, in close on everyone. */
  private shot(): Shot {
    const p = this.pola.pos
    const s: Shot = this.tall
      ? { center: new Vector3(p.x, 0.6, p.z - 1.4), half: new Vector3(2.6, 0.7, 3.4), yaw: 0, pitch: 34 }
      : { center: new Vector3(p.x, 0.6, p.z - 1.5), half: new Vector3(3.6, 0.7, 2.4), yaw: 0, pitch: 30 }
    if (this.lookFar > 0.01) {
      const k = smoothstep(0, 1, this.lookFar)
      s.center.lerp(tmp.set(-6, 3, (p.z + COLONY.z) / 2), k)
      s.half.lerp(tmp2.set(this.tall ? 18 : 30, 3, 34), k)
      s.pitch += (16 - s.pitch) * k
    } else if (this.focus && this.time < this.focus.until) {
      // Widen the box to take in the find, and center it between them.
      const f = this.focus.at
      const x0 = Math.min(s.center.x - s.half.x, f.x - 1.6)
      const x1 = Math.max(s.center.x + s.half.x, f.x + 1.6)
      const z0 = Math.min(s.center.z - s.half.z, f.z - 1.6)
      const z1 = Math.max(s.center.z + s.half.z, f.z + 1.6)
      s.center.set((x0 + x1) / 2, s.center.y, (z0 + z1) / 2)
      s.half.set((x1 - x0) / 2, s.half.y, (z1 - z0) / 2)
    } else if (this.closeEnd) {
      s.center.set(p.x, 0.8, p.z + 0.1)
      s.half.set(this.tall ? 1.4 : 2, 0.9, 1.3)
      s.pitch = 14
    }
    return s
  }

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

  private toScreen(v: Vector3) {
    const p = tmp2.copy(v).project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }
  private hitGround(x: number, y: number) {
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    return this.raycaster.ray.intersectPlane(this.ground, new Vector3())
  }
  private minTarget() {
    return Math.min(this.w, this.h) < 500 ? 64 : 88
  }
  /** Something's spot on screen and its radius there (never under half her finger's target). */
  private spotOf(id: string): { x: number; y: number; z: number; r: number } | null {
    const min = this.minTarget() / 2
    const actor = (a: Actor, up = 0.5, grow = 0.6) => {
      if (!a.root.visible) return null
      const c = this.toScreen(a.at(up, tmp))
      const top = this.toScreen(a.at(1, tmp)).y
      const foot = this.toScreen(a.at(0, tmp)).y
      return { ...c, r: Math.max(min, Math.abs(foot - top) * grow) }
    }
    const at = (v: Vector3, r: number) => {
      const c = this.toScreen(v)
      const e = this.toScreen(tmp.copy(v).add(tmp2.set(r, 0, 0)))
      return { ...c, r: Math.max(min, Math.abs(e.x - c.x)) }
    }
    switch (id) {
      case 'pebble':
        return actor(this.pebble, 0.55, 0.85)
      case 'pola':
        return actor(this.pola, 0.4, 0.55)
      case 'terry':
        return this.found.has('terry') && this.terry.root.visible ? actor(this.terry, 0.5, 0.6) : null
      case 'seal':
        return this.found.has('seal') ? at(this.seal.root.getWorldPosition(new Vector3()).setY(0.2), 0.7) : null
      case 'adelies':
        return this.found.has('adelies') ? actor(this.adelies[1], 0.5, 0.9) : null
      case 'whale':
        return this.found.has('whale') ? at(this.whale.root.getWorldPosition(new Vector3()).setY(0.3), 2) : null
      case 'balloon':
        return at(this.balloon.root.getWorldPosition(new Vector3()).add(tmp2.set(0.6, 1.2, 0)), 1.4)
    }
    return null
  }

  pointerDown(x: number, y: number, id?: string) {
    // Holding Pebble (or Pola, who carries him) sings.
    const on = id ?? this.pickId(x, y)
    if (on === 'pebble' || on === 'pola') this.startHold()
  }
  pointerMove() {}
  pointerUp() {
    if (this.hold) this.endHold()
  }

  /** The thing under her finger: the nearest the camera when two overlap. */
  private pickId(x: number, y: number): string | null {
    let best: string | null = null
    let bz = Infinity
    for (const a of CHORUS_ANCHORS) {
      const s = this.spotOf(a.id)
      if (!s || s.z >= 1) continue
      // (Pebble wins over Pola: he's what she's reaching for.)
      const z = a.id === 'pebble' ? s.z - 0.05 : s.z
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
    if (what === 'pebble') return this.peep()
    if (what === 'pola') return this.pokePola()
    if (what === 'terry') return this.pokeFriend('terry')
    if (what === 'seal' || what === 'adelies' || what === 'whale') return this.pokeFriend(what)
    if (what === 'balloon') {
      this.counts.pokes++
      nightSfx.burner()
      const b = this.balloon.root.getWorldPosition(tmp).add(tmp2.set(0.9, 0.6, 0))
      this.puffs.burst(b.x, b.y, b.z, 14, 1.2, 1.6, 0.18)
      this.sparkles.burst(b.x, b.y, b.z, 10, 1, 1.8, 0.1, 1)
      return
    }
    // A hidden lump wobbles (something's in there!); the snow puffs; the sky's lights flare.
    for (const h of this.hidden) {
      if (h.found || h.stop !== this.stop) continue
      const s = this.toScreen(tmp.set(h.x, 0.3, h.z))
      if (Math.hypot(x - s.x, y - s.y) < this.minTarget() * 0.8) {
        h.wob = 1
        h.pity = Math.max(h.pity, 1)
        if (h.id === 'terry' || h.id === 'adelies') nightSfx.snore()
        else nightSfx.snow()
        this.puffs.burst(h.x, 0.3, h.z, 8, 0.8, 1.2, 0.12)
        return
      }
    }
    const g = this.hitGround(x, y)
    if (g && g.distanceTo(this.rig.camera.position) < 45) {
      this.puffs.burst(g.x, 0.05, g.z, 10, 1.2, 1.6, 0.12)
      nightSfx.snow()
      return
    }
    this.counts.pokes++
    this.aurora.flare()
    nightSfx.lights()
    this.events.talk('skyFact', 'fact')
  }

  private pokePola() {
    this.counts.pokes++
    this.poked.add('pola')
    this.pola.hop()
    // The first time (and every other time after the Adelies come): she sings it back, the growly bear way.
    const n = this.polaPokes++
    if (n === 0) this.events.talk('grr', 'friend')
    else if (this.found.has('adelies') && n % 2 === 1) return this.events.talk('pola', 'friend')
    this.friendSings('pola')
  }

  private pokeFriend(f: Find) {
    this.counts.pokes++
    this.poked.add(f)
    if (f === 'terry') {
      this.terry.hop()
      if (this.terryPokes++ === 0) return this.events.talk('terryPoke', 'friend')
    }
    if (f === 'adelies') {
      this.adelies.forEach((a) => a.hop())
      nightSfx.honk()
    }
    if (f === 'whale') nightSfx.whale()
    if (f === 'seal') nightSfx.weddell()
    this.friendSings(f)
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = this.minTarget()
    const stuck = this.step === 'play' && !this.hold && this.time - this.lastSing > HINT_S
    for (const [id, el] of this.anchorEls) {
      const spot = this.step === 'far' || this.step === 'answer' ? null : this.spotOf(id)
      const show = !!spot && spot.z < 1 && spot.x > -spot.r && spot.x < this.w + spot.r && spot.y > -spot.r && spot.y < this.h + spot.r
      if (show && spot) {
        const wpx = Math.max(min, spot.r * 2)
        const hpx = Math.max(min, spot.r * 2)
        el.style.transform = `translate3d(${(spot.x - wpx / 2).toFixed(1)}px, ${(spot.y - hpx / 2).toFixed(1)}px, 0)`
        el.style.width = `${wpx.toFixed(0)}px`
        el.style.height = `${hpx.toFixed(0)}px`
        el.style.borderRadius = '50%'
        el.style.zIndex = String(id === 'pebble' ? 1000 : Math.round((1 - spot.z) * 900))
        const glow = stuck && id === 'pebble' ? '0 0 0 6px rgba(255,79,154,.55), 0 0 26px 10px rgba(255,200,61,.7)' : ''
        if (el.style.boxShadow !== glow) el.style.boxShadow = glow
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
      finds: this.counts.found,
      ringsSung: this.counts.rings,
      section: this.section,
      stop: this.stop,
      step: this.step,
      found: [...this.found],
      hidden: this.hidden.filter((h) => !h.found).map((h) => ({ id: h.id, stop: h.stop, pity: h.pity, dist: +Math.hypot(h.x - this.pola.pos.x, h.z - this.pola.pos.z).toFixed(1) })),
      holding: !!this.hold,
      charge: +this.charge().toFixed(2),
      rings: this.rings.map((r) => ({ kind: r.kind, r: +r.r.toFixed(1), max: +r.max.toFixed(1) })),
      singers: this.singers(),
      time: +this.time.toFixed(1),
      poked: [...this.poked],
      pebble: scr('pebble'),
      pola: scr('pola'),
      terry: scr('terry'),
      seal: scr('seal'),
      adelies: scr('adelies'),
      whale: scr('whale'),
      balloon: scr('balloon'),
    }
  }

  memory() {
    return { ...this.renderer.info.memory }
  }

  dispose() {
    for (const s of this.stops) s()
    this.blizzardBed?.()
    this.unwatch()
    for (const r of this.rings) r.mat.dispose()
    this.scene.clear()
    this.bag.dispose()
  }
}

const tmpC = new Color()

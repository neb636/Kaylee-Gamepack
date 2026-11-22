// The Poles' film stage (docs/films.md; the story: planning/around-the-world/poles.md): one small 3D world that
// only plays films. It has the story's sets (the Arctic's floating ice, the autumn tundra, Antarctica by day and in
// its long night, and the little globe the red ship sails up), its whole cast as actors (story/actor.ts) and its
// props (story/props.ts). A film (story/films.ts) picks a set, puts the actors on their marks and tells them what to
// do, beat by beat. The games stay games: Place.tsx plays a film here before and after each one, so every chapter
// gets its cutscenes without a line of film code inside a game's world.
//
// Nothing here takes taps (FilmOverlay sparkles where her finger was and holds the ⏭). When the film ends or is
// skipped, `events.done()` moves on; the stage is thrown away, so a film's `finish()` has nothing to put back.
import { BufferAttribute, Color, Fog, Group, IcosahedronGeometry, InstancedMesh, Matrix4, Mesh, PerspectiveCamera, Quaternion, Scene, SphereGeometry, Vector3, type BufferGeometry, type Object3D, type WebGLRenderer } from 'three'
import { stopSpeaking, type Line } from '../../../../sdk'
import type { AnchorInfo } from '../../../engine3d/Anchors'
import { CameraRig } from '../../../engine3d/camera'
import { Letterbox } from '../../../engine3d/cinema'
import { Bag } from '../../../engine3d/dispose'
import { FilmPlayer, type Beat, type FilmState } from '../../../engine3d/film'
import { merge, P, solid, solidMix } from '../../../engine3d/geo'
import { smoothstep } from '../../../../sdk/math'
import { makeHull, setOutlineResolution } from '../../../engine3d/outline'
import { Particles } from '../../../engine3d/particles'
import { applyBands, makeLights, toon } from '../../../engine3d/toon'
import type { World3D } from '../../../engine3d/View3D'
import { swell } from '../../../engine3d/water'
import { fbm, field, iceCliff, noise, outside, snowColor } from '../look/ground'
import { dress } from '../look/look'
import { mixSea, PolarSea, roundSkirt, SEA, skirtGeo, type SeaColors } from '../look/sea'
import { MOODS, PolarSky, type Mood, type MoodName } from '../look/sky'
import { earthTexture, ll } from '../globe/earth'
import { buildNorth, buildSouth, standOn } from '../globe/globe'
import { globeMaterials } from '../globe/material'
import { Actor } from './actor'
import { Aurora, Balloon, bergGeo, driftGeo, floeGeo, floeSkirt, ICE_LINE, makeCrate, makeRamp, makeShip, mountainGeo, Narwhal, rng, skyDisc, Stars, tableBergGeo } from './props'
import { dadGeo } from '../activities/night/dads'
import { storySfx } from './sounds'

export type SetName = 'arctic' | 'tundra' | 'antarctic' | 'night' | 'globe' | 'blizzard' | 'dawn'

/** One half of the split screen: its set's look and who is in it (the rest of the cast is hidden there). */
export interface SplitHalf {
  set: SetName
  /** Another set's sky, sea and light over it (the Arctic at night). */
  look?: SetName
  show: Object3D[]
}
const HUDDLE_N = 260

/** A film for this stage: which set it opens on, and its beats (built once the stage exists; they close over it). */
export interface StoryFilm {
  id: string
  set: SetName
  beats(s: StoryStage): Beat[]
}

export interface StageEvents {
  line(l: Line | null): void
  film(s: FilmState | null): void
  /** The film is over (played to the end, or skipped). */
  done(skipped: boolean): void
}

/** The top of the sea ice, and of Antarctica's snow (m): what the actors stand on. */
export const ICE_Y = 0.18
export const SNOW_Y = 0

interface Look {
  /** The sky's mood (look/sky.ts) and the sea's colors (look/sea.ts). */
  mood: MoodName | Mood
  sea: SeaColors
  fog: [number, number]
  /** Ambient and sun, times the usual. */
  light: [number, number]
  tint: string
}
const LOOKS: Record<SetName, Look> = {
  arctic: { mood: 'day', sea: SEA.day, fog: [120, 420], light: [1, 1], tint: '#FAFCFF' },
  tundra: { mood: 'autumn', sea: SEA.day, fog: [120, 420], light: [1, 1], tint: '#FFF4E6' },
  antarctic: { mood: 'south', sea: SEA.south, fog: [120, 420], light: [1, 1], tint: '#FAFCFF' },
  night: { mood: 'night', sea: SEA.night, fog: [60, 240], light: [0.62, 0.5], tint: '#C9D2FF' },
  globe: { mood: 'globe', sea: SEA.day, fog: [400, 900], light: [1, 1], tint: '#FFF7F0' },
  // The ending's: the storm the balloon comes down in, and the colony's long night that turns to the first sunrise.
  blizzard: { mood: { ...MOODS.night, top: '#5B5797', mid: '#8E89C6', horizon: '#C9C5EC', haze: '#B4B0E2', night: 0.4, clouds: 0 }, sea: SEA.night, fog: [2, 26], light: [0.95, 0.8], tint: '#E6E6FF' },
  dawn: { mood: 'night', sea: SEA.night, fog: [60, 240], light: [0.62, 0.5], tint: '#C9D2FF' },
}
/** Sets that stand on Antarctica's snow. */
const SOUTH_SETS: SetName[] = ['antarctic', 'night', 'blizzard', 'dawn']
/** Where the little globe hangs (far above the sets, so nothing of them shows behind it). */
export const GLOBE_AT = new Vector3(0, 400, 0)

export class StoryStage implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private films: FilmPlayer
  private bars = new Letterbox()
  private w = 1
  private h = 1
  time = 0
  private sets = {} as Record<SetName, Group>
  private setNow: SetName = 'arctic'
  private sea: PolarSea
  private sky: PolarSky
  private snowing = 0
  private flakes: Particles
  private foam: Particles
  private spray: Particles
  private bobbers: { o: Group; y: number; phase: number }[] = []
  private ended = false

  // ---- The cast and the props (a film shows the ones it wants; everything starts hidden).
  readonly pola: Actor
  readonly mama: Actor
  readonly pebble: Actor
  readonly papa: Actor
  readonly terry: Actor
  readonly fox: Actor
  readonly snowfox: Actor
  /** The colony's other emperors, and two little Adélies. */
  readonly colony: Actor[] = []
  readonly adelies: Actor[] = []
  readonly nari: Narwhal
  readonly balloon: Balloon
  readonly ship: Group
  readonly ramp: Group
  readonly crate: Group
  /** A pile of pink krill (Papa's catch). */
  readonly krill: Group
  readonly stars: Stars
  readonly aurora: Aurora
  /** The ending's props: the pebble Pebble gives Pola, the first sun in months, the huddle of hundreds. */
  readonly stone: Group
  readonly sunDisc: Group
  readonly huddle: InstancedMesh
  /** The end's split screen: the top of the world above, the bottom below, each its own set, cast and camera. */
  readonly split: { cam: PerspectiveCamera; on: boolean; top: SplitHalf; bottom: SplitHalf }
  /** The tundra's two coats: autumn's brown ground and winter's snow. */
  private tundraBrown = new Group()
  private tundraSnow = new Group()
  /** The little globe and the toy ship that sails up it. */
  private globeSpin = new Group()
  private toyShip: Group
  private globeMats: ReturnType<typeof globeMaterials>
  readonly sfx = storySfx

  constructor(
    private renderer: WebGLRenderer,
    film: StoryFilm,
    private events: StageEvents,
  ) {
    const { scene, bag } = this
    applyBands()
    scene.fog = new Fog('#DCEEFB', 90, 260)
    this.rig.fov = 36
    this.rig.camera.near = 0.05

    this.sky = new PolarSky(bag)
    this.sea = new PolarSea({ hazeNear: 90, hazeFar: 300 }, bag)
    scene.add(this.sky.root, ...this.sea.meshes)
    this.flakes = new Particles({ kind: 'spray', count: 260, color: '#FFFFFF', gravity: 0.5 }, bag)
    this.foam = new Particles({ kind: 'foam', count: 60, opacity: 0.85 }, bag)
    this.spray = new Particles({ kind: 'spray', count: 120 }, bag)
    scene.add(this.flakes.mesh, this.foam.mesh, this.spray.mesh)

    for (const name of ['arctic', 'tundra', 'antarctic', 'night', 'globe', 'blizzard', 'dawn'] as const) {
      this.sets[name] = new Group()
      this.sets[name].visible = false
      scene.add(this.sets[name])
    }
    this.stars = new Stars(bag)
    this.aurora = new Aurora(bag)
    scene.add(this.stars.points, this.aurora.root)

    this.buildArctic()
    this.buildTundra()
    this.buildAntarctic()
    this.globeMats = bag.add(globeMaterials(bag.add(earthTexture(1024))))
    this.toyShip = this.buildGlobe()

    // The cast. (Film sizes: a little bigger than life next to each other, so small faces read.)
    const actor = (who: ConstructorParameters<typeof Actor>[0], height?: number, voice?: string | null) => {
      const a = new Actor(who, bag, { height, voice })
      scene.add(a.root)
      return a
    }
    this.pola = actor('pola', 1.2)
    this.mama = actor('mama', 2.0)
    this.pebble = actor('pebble', 0.8)
    this.papa = actor('papa', 1.5)
    this.terry = actor('terry', 0.62)
    this.fox = actor('fox', 0.8, null)
    this.snowfox = actor('snowfox', 0.8, null)
    for (let i = 0; i < 6; i++) this.colony.push(actor('papa', 1.38 + (i % 3) * 0.06, null))
    for (let i = 0; i < 2; i++) this.adelies.push(actor('adelie', 0.9, null))

    this.nari = new Narwhal(bag, 1.15)
    this.balloon = new Balloon(bag)
    this.ship = makeShip(bag)
    this.ramp = makeRamp(bag)
    this.crate = makeCrate(bag)
    this.krill = solid(merge([...Array(9)].map((_, i) => P.sphere(0.09, '#FF9DB8', { at: [Math.cos(i * 2.4) * 0.16 * (i % 3), 0.07 + (i % 3) * 0.07, Math.sin(i * 2.4) * 0.16 * (i % 3)], scale: [1.5, 0.8, 0.8], rot: [0, i, 0] }, 8))), bag, 2)
    this.stone = solid(P.sphere(0.09, '#A6A3BC', { scale: [1.25, 0.8, 1] }, 12), bag, 1.5)
    for (const o of [this.nari.root, this.balloon.root, this.ship, this.ramp, this.crate, this.krill, this.stone]) {
      o.visible = false
      scene.add(o)
    }
    // The ending's: the first sun in months, and a huddle of hundreds of dads (one cheap instanced shape).
    this.sunDisc = skyDisc(bag, 6, '#FFE7A8', '#FFC9B8')
    this.sunDisc.visible = false
    scene.add(this.sunDisc)
    this.huddle = bag.add(new InstancedMesh(bag.add(dadGeo(1.38, 6, true)), bag.add(toon('#ffffff', true)), HUDDLE_N))
    this.huddle.visible = false
    scene.add(this.huddle)
    this.split = { cam: new PerspectiveCamera(34, 1, 0.05, 900), on: false, top: { set: 'arctic', show: [] }, bottom: { set: 'antarctic', show: [] } }

    // The polar look on everything built so far (look/look.ts: cloud shade, snow that glints).
    dress(scene)

    this.films = new FilmPlayer({ line: (l) => this.events.line(l), state: (s) => this.events.film(s) })
    this.use(film.set)
    this.films.play({ id: film.id, beats: film.beats(this), finish: () => this.sfx.stop() }, () => this.end())
  }

  // ---------------------------------------------------------------- the sets

  private add(set: SetName, geo: BufferGeometry, x = 0, y = 0, z = 0, px = 2.5, line?: string) {
    const o = solid(geo, this.bag, px, line)
    o.position.set(x, y, z)
    this.sets[set].add(o)
    return o
  }
  /** Ice (a soft blue line, not ink), with its glow on the water as a child (`skirt`: look/sea.ts skirtGeo). */
  private ice(set: SetName, geo: BufferGeometry, skirt: BufferGeometry | null, x = 0, y = 0, z = 0, px = 2) {
    const o = this.add(set, geo, x, y, z, px, ICE_LINE)
    if (skirt) o.add(this.sea.skirt(skirt, this.bag))
    return o
  }

  /** The Arctic: floes on the sea round a big one at the middle, Mama's wide ice behind, the pack ice going off to the
   *  horizon, and faceted icebergs far off. */
  private buildArctic() {
    const r = rng(3)
    // The floe the story stands on, and Mama's ice across the water.
    this.ice('arctic', floeGeo(6.5, 11, ICE_Y), floeSkirt(6.5, 11), 0, 0, 0, 2.5)
    this.ice('arctic', floeGeo(11, 12, ICE_Y), floeSkirt(11, 12), 4, 0, -24, 2.5)
    for (let i = 0; i < 16; i++) {
      const a = r() * Math.PI * 2
      const d = 11 + r() * 34
      const x = Math.cos(a) * d
      const z = Math.sin(a) * d - 6
      if (Math.hypot(x - 4, z + 24) < 14) continue
      const rr = 1.2 + r() * 2.6
      const o = this.ice('arctic', floeGeo(rr, 20 + i, ICE_Y, 0.4), floeSkirt(rr, 20 + i), x, 0, z, 2)
      o.rotation.y = r() * 6
      this.bobbers.push({ o, y: 0, phase: r() * 6 })
    }
    // The pack ice out to the horizon: many flat floes, smaller and thinner the further off (one mesh, no outline).
    const far: BufferGeometry[] = []
    for (let i = 0; i < 70; i++) {
      const a = -Math.PI * (0.05 + r() * 0.9)
      const d = 50 + r() * r() * 120
      const x = Math.cos(a) * d * 1.3
      const z = Math.sin(a) * d - 10
      const rr = 1.6 + r() * 5 * (d / 90)
      far.push(floeGeo(rr, 300 + i, 0.14, 0.3, rr > 3).rotateY(r() * 6).translate(x, 0, z))
    }
    this.add('arctic', merge(far), 0, 0, 0, 0)
    for (const [x, z, s, seed] of [[-46, -80, 9, 1], [38, -95, 12, 2], [-12, -120, 15, 3], [74, -70, 7, 4], [-85, -60, 8, 5], [18, -62, 4, 6]] as const) this.ice('arctic', bergGeo(s, seed), roundSkirt(s * 0.95, Math.min(4, s * 0.45)), x, 0, z, 2.5)
  }

  /** The tundra beside the frozen sea: low rolling land in autumn's golds, rusts and berry reds, lichen rocks, and the
   *  same land under snow; snowy mountains far off. */
  private buildTundra() {
    const r = rng(8)
    const near = { x0: -34, x1: 34, z0: -30, z1: 4 }
    const heightAt = (x: number, z: number) => {
      const out = outside(x, z, near)
      const roll = (fbm(x * 0.03 + 4, z * 0.03) - 0.35) * 9 * smoothstep(0, 40, out) + (noise(x * 0.25, z * 0.25) - 0.5) * 0.12
      // (Down to the water at the shore.)
      return ICE_Y - 0.05 + roll * smoothstep(-1, -6, z) - smoothstep(-2.5, 0.5, z) * 0.9
    }
    const box = { x0: -150, x1: 150, z0: -190, z1: 1, cell: 1.5, height: heightAt }
    const autumn = field({
      ...box,
      color: (x, z, h) => {
        const n = fbm(x * 0.09, z * 0.09)
        const m = noise(x * 0.4 + 9, z * 0.4)
        if (z > -2.2) return h < 0 ? '#8C8597' : '#A79C8C'
        const base = n < 0.36 ? '#C9643A' : n < 0.5 ? '#E0A548' : n < 0.62 ? '#B9A04E' : n < 0.72 ? '#D98A45' : '#8FA65A'
        return '#' + tmpC.set(base).lerp(tmpD.set(m > 0.6 ? '#F0CF7A' : '#B5523A'), Math.abs(m - 0.5) * 0.5).getHexString()
      },
    })
    const winter = field({ ...box, color: (_x, z, h, slope) => (z > -2.2 && h < 0 ? '#BFD0EC' : '#' + snowColor(h, slope, ICE_Y - 0.1, ICE_Y + 2).getHexString()) })
    this.tundraBrown.add(solid(autumn, this.bag, 0))
    this.tundraSnow.add(solid(winter, this.bag, 0))
    // Autumn's tufts of grass, berry bushes and little willows; winter's drifts over them.
    const tufts: BufferGeometry[] = []
    const plain: BufferGeometry[] = []
    const drifts: BufferGeometry[] = []
    for (let i = 0; i < 70; i++) {
      const x = (r() - 0.5) * 60
      const z = -3.5 - r() * 34
      if (Math.abs(x) < 3 && z > -9) continue
      const y = heightAt(x, z)
      const kind = i % 4
      if (kind === 0) {
        // A berry bush: a round green heap dotted with red.
        const s = 0.22 + r() * 0.16
        tufts.push(P.sphere(s, '#6E9A4C', { at: [x, y + s * 0.5, z], scale: [1.3, 0.75, 1.1] }, 10))
        for (let k = 0; k < 6; k++) plain.push(P.sphere(0.045, '#E2384B', { at: [x + Math.cos(k * 2.3) * s * 0.9, y + s * (0.6 + (k % 2) * 0.25), z + Math.sin(k * 2.3) * s * 0.75] }, 6))
      } else if (kind === 1) {
        // A dwarf willow gone gold.
        const s = 0.3 + r() * 0.2
        tufts.push(P.cyl(0.03, 0.04, s * 0.8, '#7A5A44', { at: [x, y + s * 0.4, z] }, 5), P.sphere(s * 0.7, r() < 0.5 ? '#E8B547' : '#D9773F', { at: [x, y + s * 1.05, z], scale: [1.2, 0.8, 1.2] }, 9))
      } else {
        // A tuft of grass: a few blades leaning out.
        const c = r() < 0.5 ? '#D9B25C' : '#A9A65A'
        for (let k = 0; k < 4; k++) tufts.push(P.cone(0.05, 0.32 + r() * 0.2, c, { at: [x + Math.cos(k * 1.7) * 0.06, y + 0.14, z + Math.sin(k * 1.7) * 0.06], rot: [Math.sin(k * 1.7) * 0.35, 0, -Math.cos(k * 1.7) * 0.35] }, 4))
      }
      if (i % 3 === 0) drifts.push(driftGeo(1 + r() * 1.6, 0.3 + r() * 0.3).translate(x, y, z))
    }
    this.tundraBrown.add(solidMix(tufts, plain, this.bag, 1.2))
    this.tundraSnow.add(solid(merge(drifts), this.bag, 1.5, ICE_LINE))
    this.tundraSnow.visible = false
    this.sets.tundra.add(this.tundraBrown, this.tundraSnow)
    // The shore's lichen rocks (faceted, with orange and mint lichen), and a strip of sea ice in front.
    const rocks: BufferGeometry[] = []
    for (let i = 0; i < 9; i++) {
      const s = 0.3 + r() * 0.45
      const x = (i - 4) * 5 + r() * 2.5
      const z = -2 - r() * 2.4
      rocks.push(rockGeo(s, 40 + i).translate(x, heightAt(x, z) - 0.05, z))
    }
    this.add('tundra', merge(rocks), 0, 0, 0, 2)
    this.ice('tundra', floeGeo(9, 31, ICE_Y), floeSkirt(9, 31), 0, 0, 5, 2.5)
    for (const [x, z, s, seed] of [[-60, -130, 12, 7], [52, -140, 14, 8], [-5, -170, 10, 9]] as const) this.add('tundra', mountainGeo(s * 2.4, s * 2.2, seed), x, heightAt(x, z) - 2, z, 2.5, ICE_LINE)
  }

  /** Antarctica: a wide land of snow rolling up to mountains behind, drifts, and the ice cliff along its right-hand
   *  side, where the sea (and the red ship) is. The night uses the same land under a dark sky. */
  private buildAntarctic() {
    const r = rng(14)
    const EDGE = 16
    const flat = { x0: -60, x1: EDGE, z0: -32, z1: 24 }
    const heightAt = (x: number, z: number) => {
      const out = outside(x, z, flat)
      return SNOW_Y + (fbm(x * 0.025 + 2, z * 0.025) - 0.3) * 12 * smoothstep(0, 60, out) + (noise(x * 0.18, z * 0.18) - 0.5) * 0.18 * smoothstep(EDGE, EDGE - 3, x)
    }
    const land = field({ x0: -230, x1: EDGE, z0: -220, z1: 60, cell: 1.6, height: heightAt, color: (_x, _z, h, slope) => '#' + snowColor(h, slope, SNOW_Y - 0.12, SNOW_Y + 0.6).getHexString() })
    const drifts: BufferGeometry[] = []
    for (let i = 0; i < 14; i++) {
      const x = -48 + r() * 58
      const z = -34 + r() * 30
      drifts.push(driftGeo(2 + r() * 3.5, 0.35 + r() * 0.5).translate(x, heightAt(x, z) - 0.05, z))
    }
    // The ice cliff down to the sea, all along the edge, and the sea's glow along its foot.
    const cliff = iceCliff(EDGE, 60, EDGE, -220, SNOW_Y + 0.05, -2.4, -0.5, 3)
    const glow = this.sea.skirt(skirtGeo([[EDGE + 0.5, 60], [EDGE + 0.5, -220], [-230, -220], [-230, 60]].flatMap(([x, z], i, a) => {
      const [nx, nz] = a[(i + 1) % a.length]
      return [...Array(40)].map((_, k) => [x + ((nx - x) * k) / 40, z + ((nz - z) * k) / 40] as [number, number])
    }), 2.6), this.bag)
    const far = solid(merge([[-70, -150, 26, 30, 1], [-20, -170, 34, 40, 2], [36, -160, 24, 26, 3], [-120, -130, 22, 24, 4], [-48, -125, 14, 15, 5]].map(([x, z, rr, h, seed]) => mountainGeo(rr, h, seed).translate(x, heightAt(x, z) - 2, z))), this.bag, 2.5, ICE_LINE)
    const bergs = new Group()
    for (const [x, z, w, d, h] of [[60, -70, 26, 14, 5], [44, -22, 16, 10, 3.6], [96, -120, 30, 18, 6]] as const) {
      const b = solid(tableBergGeo(w, d, h), this.bag, 2.5, ICE_LINE)
      b.position.set(x, -0.5, z)
      b.add(this.sea.skirt(roundSkirt(w / 2, 3, 32, d / w), this.bag))
      bergs.add(b)
    }
    // (One land for both the day and the night sets: `use` shows it for either.)
    this.sets.antarctic.add(solid(land, this.bag, 0), solid(merge(drifts), this.bag, 0), solid(cliff, this.bag, 2, ICE_LINE), glow, far, bergs)
  }

  /** The little globe (the hub's Earth, a meter across) and a toy red ship that sails up it. */
  private buildGlobe() {
    const mats = this.globeMats
    const sphere = this.bag.add(new SphereGeometry(1, 64, 44))
    const hull = makeHull(sphere, 3)
    this.bag.add(hull.geometry)
    this.globeSpin.add(new Mesh(sphere, mats.land), hull)
    const prop = (geometry: Parameters<typeof makeHull>[0], px = 2) => {
      const g = new Group()
      g.add(new Mesh(this.bag.add(geometry), mats.props))
      if (px > 0) {
        const h = makeHull(geometry, px)
        this.bag.add(h.geometry)
        g.add(h)
      }
      return g
    }
    const kit = { spin: this.globeSpin, bag: this.bag, prop }
    buildNorth(kit)
    buildSouth(kit)
    const ship = prop(merge([P.rbox(0.19, 0.07, 0.085, 0.02, '#F0564E', { at: [0, 0.035, 0] }), P.box(0.07, 0.06, 0.06, '#FFFDF7', { at: [-0.035, 0.095, 0] }), P.cyl(0.014, 0.014, 0.05, '#FFC83D', { at: [-0.05, 0.15, 0] }, 6)]), 1.5)
    this.globeSpin.add(ship)
    const g = new Group()
    g.position.copy(GLOBE_AT)
    g.add(this.globeSpin)
    this.sets.globe.add(g)
    return ship
  }

  /** Puts the toy ship on the globe: `k` 0 at Antarctica's edge .. 1 at the Arctic's, up the Atlantic. The globe turns
   *  a little so the ship stays toward the camera (which looks at the globe from +z). */
  sail(k: number) {
    const lat = -66 + k * 142
    const lon = -28
    standOn(this.toyShip, lat, lon, 1.005)
    // Her bow points north: turn the ship round its own up until +x faces up the globe.
    const up = this.toyShip.position.clone().normalize()
    const north = ll(Math.min(89, lat + 2), lon, 1).sub(this.toyShip.position).normalize()
    const east = new Vector3().crossVectors(north, up).normalize()
    this.toyShip.quaternion.setFromRotationMatrix(M.makeBasis(north, up, east))
    // The ship's meridian faces the camera, and the globe tips so the ship is near the middle of the picture.
    const p = ll(0, lon, 1)
    this.globeSpin.rotation.y = Math.atan2(-p.x, p.z) + Math.atan2(0, 1)
    this.globeSpin.parent!.rotation.x = (lat / 90) * 0.75
  }

  /** Switches the set (under a cut or a page turn): its sky, fog and light, and everyone hidden until placed. */
  use(set: SetName, keepCast = false) {
    this.setNow = set
    for (const [name, g] of Object.entries(this.sets)) g.visible = name === set || (name === 'antarctic' && SOUTH_SETS.includes(set))
    const look = LOOKS[set]
    this.sky.set(look.mood)
    const fog = this.scene.fog as Fog
    fog.color.copy(this.sky.haze)
    fog.near = look.fog[0]
    fog.far = look.fog[1]
    const night = set === 'night' || set === 'dawn'
    this.sea.setColors(look.sea)
    this.sea.level = SOUTH_SETS.includes(set) ? -0.5 : 0
    this.sea.visible = set !== 'globe'
    this.lights.ambient.color.set(look.tint)
    this.lights.sun.color.set(look.tint)
    this.lightK = look.light
    this.stars.opacity = night ? 1 : 0
    this.aurora.amount = night ? 0.9 : 0
    this.snowing = 0
    this.sunDisc.visible = false
    this.huddle.visible = false
    if (!keepCast) this.clear()
  }
  private lightK: [number, number] = [1, 1]
  get set() {
    return this.setNow
  }
  /** Everyone and everything off the stage. */
  clear() {
    for (const a of this.cast) a.hide()
    for (const o of [this.nari.root, this.balloon.root, this.ship, this.ramp, this.crate, this.krill, this.stone]) o.visible = false
  }
  get cast() {
    return [this.pola, this.mama, this.pebble, this.papa, this.terry, this.fox, this.snowfox, ...this.colony, ...this.adelies]
  }
  /** Shows a prop at a mark (`yaw` in degrees). */
  put(o: Group, x: number, y: number, z: number, yaw = 0) {
    o.position.set(x, y, z)
    o.rotation.set(0, (yaw * Math.PI) / 180, 0)
    o.visible = true
    return o
  }
  /** The tundra goes from autumn to winter (or back). */
  winter(on: boolean) {
    this.tundraBrown.visible = !on
    this.tundraSnow.visible = on
  }
  /** Snow falls round a point (0: stops). */
  snow(amount: number, at: [number, number, number] = [0, 0, 0]) {
    this.snowing = amount
    this.snowAt.set(...at)
  }
  private snowAt = new Vector3()
  /** The night comes or goes over a few seconds (the huddle's sunrise): `k` 0 night .. 1 day. */
  dawn(k: number) {
    const a = LOOKS.night
    const b = LOOKS.antarctic
    // Night, through the pink of the first light, to day.
    if (k < 0.5) this.sky.blend('night', 'dusk', k * 2)
    else this.sky.blend('dusk', 'south', (k - 0.5) * 2)
    this.sea.setColors(k < 0.5 ? mixSea(SEA.night, SEA.dusk, k * 2) : mixSea(SEA.dusk, SEA.south, (k - 0.5) * 2))
    ;(this.scene.fog as Fog).color.copy(this.sky.haze)
    this.lightK = [a.light[0] + (b.light[0] - a.light[0]) * k, a.light[1] + (b.light[1] - a.light[1]) * k]
    this.stars.opacity = 1 - k
    this.aurora.amount = 0.9 * Math.max(0, 1 - k * 2.5)
  }
  /** The huddle of dads, standing packed round (cx, cz) out to radius r, faces toward `face` (deg); off with r = 0. */
  showHuddle(cx: number, cz: number, r: number, face = 0, hole = 0) {
    const R = rng(5)
    const gap = 0.92
    let n = 0
    for (let row = -40; row <= 40 && n < HUDDLE_N; row++) {
      for (let col = -40; col <= 40 && n < HUDDLE_N; col++) {
        const x = (col + (row % 2 ? 0.5 : 0)) * gap
        const z = row * gap * 0.87
        const d = Math.hypot(x, z)
        if (d > r || d < hole) continue
        Q.setFromAxisAngle(UPV, (face * Math.PI) / 180 + (R() - 0.5) * 0.6)
        this.huddle.setMatrixAt(n++, M.compose(V.set(cx + x + (R() - 0.5) * 0.1, 0, cz + z), Q, S.setScalar(0.95 + R() * 0.1)))
      }
    }
    this.huddle.count = n
    this.huddle.instanceMatrix.needsUpdate = true
    this.huddle.visible = r > 0
  }

  /** A splash on the water, or a puff of snow, at a point. */
  splash(x: number, z: number, big = 1) {
    this.spray.burst(x, 0.1, z, Math.round(22 * big), 2.6 * big, 4.2 * big, 0.2)
    for (let i = 0; i < 8; i++) this.foam.emit(x + (Math.random() - 0.5) * big, 0.03, z + (Math.random() - 0.5) * big, (Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2, 1.2, 0.5 * big)
    this.sfx.splash()
  }
  puff(x: number, y: number, z: number, n = 14) {
    this.spray.burst(x, y + 0.1, z, n, 1.4, 1.8, 0.16)
  }

  // ---------------------------------------------------------------- the frame

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
  }
  setAnchorElements() {}
  get calm() {
    return false
  }

  update(dt: number) {
    const t = (this.time += dt)
    const cine = this.films.update(dt, this.w / this.h)
    this.sky.update(t, this.rig.camera, this.scene.fog as Fog)
    this.sea.update(this.rig.camera.position.x, this.rig.camera.position.z - 30, this.sky.sun)
    this.sea.setHaze(this.sky.haze)
    for (const b of this.bobbers) {
      // (On the sea's own swell, so the floe and its glow ride the same waves.)
      b.o.position.y = swell(b.o.position.x, b.o.position.z, t) * 0.8
      b.o.rotation.z = Math.sin(t * 0.7 + b.phase) * 0.012
    }
    for (const a of this.cast) a.update(dt, t)
    this.nari.update(dt, t)
    this.balloon.update(dt, t)
    this.stars.update(t)
    this.aurora.update(dt, t)
    if (this.snowing > 0) {
      const n = this.snowing * dt * 60
      for (let i = 0; i < n; i++) if (Math.random() < 0.5) this.flakes.emit(this.snowAt.x + (Math.random() - 0.5) * 26, this.snowAt.y + 7 + Math.random() * 3, this.snowAt.z + (Math.random() - 0.5) * 20, 0.4, -1.2 - Math.random(), 0, 5, 0.09 + Math.random() * 0.06)
    }
    this.flakes.update(dt)
    this.foam.update(dt)
    this.spray.update(dt)
    const look = cine?.look ?? ZERO
    this.lights.follow(look.x, look.y, look.z)
    this.lights.ambient.intensity *= this.lightK[0]
    this.lights.sun.intensity *= this.lightK[1]
    this.rig.setCine(cine)
    this.rig.update(dt)
    this.bars.update(dt, this.films.on)
  }

  private end() {
    if (this.ended) return
    this.ended = true
    this.events.done(this.films.skipped.length > 0)
  }
  skipFilm() {
    this.films.skip()
  }

  render() {
    if (this.split.on) this.renderSplit()
    else this.bars.render(this.renderer, this.scene, this.rig.camera, this.w, this.h)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  /** The end: two pictures, one above the other (the film's camera on top, `split.cam` below), each half with its own
   *  set, sky, sea, light and cast. A white line between them. */
  private renderSplit() {
    const r = this.renderer
    const { w, h } = this
    const half = Math.floor(h / 2)
    const cast = this.cast.map((a) => a.root)
    const amb = this.lights.ambient.intensity / this.lightK[0]
    const sun = this.lights.sun.intensity / this.lightK[1]
    const was = this.setNow
    r.setScissorTest(false)
    r.setClearColor('#FFFFFF', 1)
    r.clear()
    r.setScissorTest(true)
    const paint = (which: SplitHalf, cam: PerspectiveCamera, y: number, hh: number) => {
      const look = LOOKS[which.look ?? which.set]
      for (const [name, g] of Object.entries(this.sets)) g.visible = name === which.set || (name === 'antarctic' && SOUTH_SETS.includes(which.set))
      for (const o of cast) o.visible = which.show.includes(o)
      for (const o of [this.stone, this.balloon.root, this.huddle, this.sunDisc]) o.visible = which.show.includes(o)
      this.sky.set(look.mood)
      this.sea.setColors(look.sea)
      this.sea.level = SOUTH_SETS.includes(which.set) ? -0.5 : 0
      const night = look.mood === 'night' || which.look === 'night'
      this.stars.opacity = night ? 1 : 0
      this.aurora.amount = night ? 0.95 : 0
      ;(this.scene.fog as Fog).color.copy(this.sky.haze)
      this.lights.ambient.color.set(look.tint)
      this.lights.sun.color.set(look.tint)
      this.lights.ambient.intensity = amb * look.light[0]
      this.lights.sun.intensity = sun * look.light[1]
      cam.aspect = w / hh
      cam.updateProjectionMatrix()
      this.sky.update(this.time, cam, this.scene.fog as Fog)
      this.sea.update(cam.position.x, cam.position.z - 30, this.sky.sun)
      r.setViewport(0, y, w, hh)
      r.setScissor(0, y, w, hh)
      r.render(this.scene, cam)
    }
    paint(this.split.top, this.rig.camera, half + 2, h - half - 2)
    paint(this.split.bottom, this.split.cam, 0, half - 2)
    // Hiding is only for each half's render pass: everyone in either half stays visible between frames, or Actor.update
    // (which skips hidden actors) would freeze the top half's cast (Pola and Mama stop blinking, Terry's last flight stops).
    const shown = new Set([...this.split.top.show, ...this.split.bottom.show])
    for (const o of cast) o.visible = shown.has(o)
    for (const o of [this.stone, this.balloon.root, this.huddle, this.sunDisc]) o.visible = shown.has(o)
    r.setScissorTest(false)
    r.setViewport(0, 0, w, h)
    this.rig.camera.aspect = w / h
    this.rig.camera.updateProjectionMatrix()
    this.setNow = was
  }

  placeAnchors() {}
  pointerDown() {}
  pointerMove() {}
  pointerUp() {}
  tap() {}

  qa() {
    return { film: this.films.now, films: { done: this.films.done, skipped: this.films.skipped }, set: this.setNow, ended: this.ended }
  }
  memory() {
    return { ...this.renderer.info.memory }
  }
  dispose() {
    // Left in the middle of a film (the top bar's back button): its line mustn't go on talking over the map.
    if (!this.ended) stopSpeaking()
    this.sfx.stop()
    this.scene.clear()
    this.bag.dispose()
  }
}

export const STORY_ANCHORS: AnchorInfo[] = []
const ZERO = new Vector3()
const tmpC = new Color()
/** A faceted rock with lichen on top. */
function rockGeo(s: number, seed: number) {
  const g = new IcosahedronGeometry(s, 1)
  const pos = g.attributes.position
  const R = rng(seed)
  for (let i = 0; i < pos.count; i++) {
    const k = 0.8 + noise(pos.getX(i) * 3 + seed, pos.getZ(i) * 3) * 0.45
    pos.setXYZ(i, pos.getX(i) * k * 1.25, Math.max(-s * 0.3, pos.getY(i) * k * 0.65), pos.getZ(i) * k)
  }
  g.computeVertexNormals()
  const rgb = new Float32Array(pos.count * 3)
  const c = new Color()
  for (let i = 0; i < pos.count; i += 3) {
    const up = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3 > s * 0.25
    const k = R()
    c.set(up && k < 0.12 ? '#E7B27A' : up && k < 0.22 ? '#C5D6A6' : k < 0.55 ? '#A39DB4' : '#B2ACC3')
    for (let j = 0; j < 3; j++) rgb.set([c.r, c.g, c.b], (i + j) * 3)
  }
  g.setAttribute('color', new BufferAttribute(rgb, 3))
  g.deleteAttribute('uv')
  return g
}
const tmpD = new Color()
const M = new Matrix4()
const Q = new Quaternion()
const V = new Vector3()
const S = new Vector3()
const UPV = new Vector3(0, 1, 0)

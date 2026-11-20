// Canada's film stage (docs/films.md; the story: planning/around-the-world/canada.md, "Maple's Team"): one small 3D
// world that only plays films. The games stay games: Place.tsx plays a film here before and after each one, so every
// chapter gets its cutscenes without film code inside a game's world, and each chapter's films and set live in files
// of their own (story/films/<chapter>.ts, story/sets/<chapter>.ts).
//
// A film (a StoryFilm) names the set it opens on and builds its beats once the stage exists:
//
//   export const BIKE_IN: StoryFilm = {
//     id: 'bike-in',
//     set: MOUNTAIN,
//     beats(s) {
//       const set = s.use(MOUNTAIN)             // the set's own things (typed): set.bike, set.pond...
//       const { maple, monty } = s.cast          // anyone in the cast (story/cast.ts), built when first asked for
//       return [{ id: 'high', shot: cam([0, 1.4, 5], [0, 0.8, 0]), say: L.bike.filmIn.high, start: () => maple.place(0, 0, 0, 10) }, ...]
//     },
//   }
//
// A set (a FilmSet) is its look (sky, fog, light) and a `build` that makes its scenery in a Group and returns whatever
// its films need to move. Sets are built the first time a film uses them; `s.show(set)` cuts to another one (under a
// page turn). The usual camera stands on +z and looks toward -z, so an actor facing 0 degrees faces it.
//
// Nothing here takes taps (FilmOverlay sparkles where her finger was and holds the skip button). When the film ends or
// is skipped, `events.done()` moves on and the stage is thrown away, so a film has nothing to put back.
import { BackSide, CanvasTexture, Color, Fog, Group, Mesh, MeshBasicMaterial, Points, PointsMaterial, Scene, SphereGeometry, SRGBColorSpace, Vector3, BufferGeometry, Float32BufferAttribute, type Object3D, type WebGLRenderer } from 'three'
import type { Line } from '../../../../sdk'
import type { AnchorInfo } from '../../../engine3d/Anchors'
import { puffCloud } from '../../../engine3d/board'
import { CameraRig } from '../../../engine3d/camera'
import { Letterbox } from '../../../engine3d/cinema'
import { Bag } from '../../../engine3d/dispose'
import { FilmPlayer, type Beat, type FilmState } from '../../../engine3d/film'
import { setOutlineResolution } from '../../../engine3d/outline'
import { Particles } from '../../../engine3d/particles'
import { applyBands, makeLights } from '../../../engine3d/toon'
import type { World3D } from '../../../engine3d/View3D'
import type { FilmId } from '../activities/story/sections'
import { Cast } from './cast'
import { storySfx, type Music } from './sounds'

/** How a set looks: its sky (top, middle, horizon), its fog, and how bright it is. */
export interface SetLook {
  sky: [top: string, mid: string, low: string]
  /** Fog color and where it starts and ends, meters. */
  fog: [color: string, near: number, far: number]
  /** Ambient and sun, times the usual (a night: about [0.6, 0.45]). */
  light?: [ambient: number, sun: number]
  /** The light's color (a warm evening, a blue night). */
  tint?: string
  /** Stars in the sky. */
  stars?: boolean
  /** Puffy clouds drifting far off (default true by day; none with stars). */
  clouds?: boolean
}

/** A set: where a film happens. `build` makes its scenery in `root` and returns what its films move. */
export interface FilmSet<T = unknown> {
  id: string
  look: SetLook
  build(s: StoryStage, root: Group): T
  /** Every frame the set is showing (water rippling, a fire flickering). */
  update?(live: T, dt: number, t: number, s: StoryStage): void
}

/** A film for this stage: the set it opens on, its music, and its beats (built once the stage exists). */
export interface StoryFilm {
  id: FilmId
  // (Any set: the film gets its own set's things, typed, from `s.use(SET)`.)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set: FilmSet<any>
  /** The music under it (story/sounds.ts): `story` for the telling, `happy` for a friend joining, `game` for the big
   *  game, null for none. Default: `story` for the way in, `happy` for the rest. */
  music?: Music | null
  beats(s: StoryStage): Beat[]
}

export interface StageEvents {
  line(l: Line | null): void
  film(s: FilmState | null): void
  /** The film is over (played to the end, or skipped). */
  done(skipped: boolean): void
}

/** Particle colors (`puff`, `sparkle`, `splash`, `confetti`). */
const COLORS = ['#FFFFFF', '#FFD86B', '#FF8FB8', '#8FD3F5', '#B9A2F0', '#8FE3C8', '#FF9A3C'] as const

export class StoryStage implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  /** Everything built for the film is disposed with the stage: add your own textures and geometry here. */
  readonly bag = new Bag()
  private lights = makeLights(this.scene)
  private films: FilmPlayer
  private bars = new Letterbox()
  private w = 1
  private h = 1
  /** Seconds since the film began. */
  time = 0
  /** Anyone in the story: `s.cast.maple`, `s.cast.monty`... built on first use, hidden until placed. */
  readonly cast: Cast
  /** The films' sounds (story/sounds.ts). */
  readonly sfx = storySfx
  /** Snow falling round the camera's subject, 0 (none) .. 1 (a flurry). */
  snow = 0
  private sets = new Map<string, { set: FilmSet; root: Group; live: unknown }>()
  private now: FilmSet | null = null
  private lightK: [number, number] = [1, 1]
  private dome: Mesh
  private domeTex: CanvasTexture
  private stars: Points
  private clouds = new Group()
  private bits: Particles
  private flakes: Particles
  private ended = false
  private lookAt = new Vector3()

  constructor(
    private renderer: WebGLRenderer,
    film: StoryFilm,
    private events: StageEvents,
  ) {
    const { scene, bag } = this
    applyBands()
    scene.fog = new Fog('#DCEEFB', 60, 240)
    this.rig.fov = 36
    this.rig.camera.near = 0.05
    this.rig.camera.far = 900
    this.rig.camera.updateProjectionMatrix()

    // The sky: a painted dome (three colors, top to horizon), puffy clouds far off, stars for a night.
    const c = document.createElement('canvas')
    c.width = 4
    c.height = 256
    this.domeTex = bag.add(new CanvasTexture(c))
    this.domeTex.colorSpace = SRGBColorSpace
    this.dome = new Mesh(bag.add(new SphereGeometry(700, 24, 16)), bag.add(new MeshBasicMaterial({ map: this.domeTex, side: BackSide, fog: false, depthWrite: false })))
    this.dome.renderOrder = -10
    this.dome.frustumCulled = false
    scene.add(this.dome)
    for (let i = 0; i < 9; i++) {
      const cloud = puffCloud(bag, 16 + (i % 3) * 7)
      const a = -Math.PI * (0.08 + (i / 9) * 0.84) + (i % 2) * 0.1
      cloud.position.set(Math.cos(a) * (150 + (i % 4) * 30), 34 + (i % 5) * 9, Math.sin(a) * (150 + (i % 4) * 30))
      cloud.rotation.y = -a + Math.PI / 2
      this.clouds.add(cloud)
    }
    scene.add(this.clouds)
    const pts: number[] = []
    for (let i = 0; i < 260; i++) {
      const a = Math.random() * Math.PI * 2
      const up = 0.08 + Math.random() * 0.9
      pts.push(Math.cos(a) * Math.cos(up) * 600, Math.sin(up) * 600, Math.sin(a) * Math.cos(up) * 600)
    }
    const g = bag.add(new BufferGeometry())
    g.setAttribute('position', new Float32BufferAttribute(pts, 3))
    this.stars = new Points(g, bag.add(new PointsMaterial({ color: '#FFF6D8', size: 2.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.95, depthWrite: false })))
    this.stars.frustumCulled = false
    this.stars.visible = false
    scene.add(this.stars)

    this.bits = new Particles({ kind: 'spray', count: 220, colors: [...COLORS], gravity: 5 }, bag)
    this.flakes = new Particles({ kind: 'spray', count: 260, color: '#FFFFFF', gravity: 0.5 }, bag)
    scene.add(this.bits.mesh, this.flakes.mesh)

    this.cast = new Cast(bag, scene)
    this.films = new FilmPlayer({ line: (l) => this.events.line(l), state: (st) => this.events.film(st) })
    this.show(film.set)
    const music = film.music === undefined ? (film.id === 'intro' ? 'story' : 'happy') : film.music
    if (music) this.sfx.music(music)
    this.films.play({ id: film.id, beats: film.beats(this), finish: () => this.sfx.stop() }, () => this.end())
  }

  // ---------------------------------------------------------------- sets

  /** A set's own things (built the first time it is asked for). It doesn't change which set is showing. */
  use<T>(set: FilmSet<T>): T {
    let made = this.sets.get(set.id)
    if (!made) {
      const root = new Group()
      root.visible = false
      this.scene.add(root)
      made = { set, root, live: set.build(this, root) }
      this.sets.set(set.id, made)
    }
    return made.live as T
  }
  /** Cuts to a set: its scenery, sky, fog and light (do it in a beat's `start`, under a page turn if it's a memory). */
  show<T>(set: FilmSet<T>): T {
    const live = this.use(set)
    for (const m of this.sets.values()) m.root.visible = m.set.id === set.id
    this.now = set
    const look = set.look
    const cv = this.domeTex.image as HTMLCanvasElement
    const g2 = cv.getContext('2d')!
    const grad = g2.createLinearGradient(0, 0, 0, 256)
    // (The dome's top half is the sky; below the horizon it keeps the horizon's color.)
    grad.addColorStop(0, look.sky[0])
    grad.addColorStop(0.3, look.sky[1])
    grad.addColorStop(0.5, look.sky[2])
    grad.addColorStop(1, look.sky[2])
    g2.fillStyle = grad
    g2.fillRect(0, 0, 4, 256)
    this.domeTex.needsUpdate = true
    const fog = this.scene.fog as Fog
    fog.color.set(look.fog[0])
    fog.near = look.fog[1]
    fog.far = look.fog[2]
    this.lightK = look.light ?? [1, 1]
    const tint = new Color(look.tint ?? '#FFF7F0')
    this.lights.ambient.color.copy(tint)
    this.lights.sun.color.copy(tint)
    this.stars.visible = !!look.stars
    this.clouds.visible = look.clouds ?? !look.stars
    return live
  }

  // ---------------------------------------------------------------- props and little effects

  /** Puts a prop (or anything) at a spot facing `face` degrees, shows it, and adds it to the scene if it's loose. */
  put<T extends Object3D>(o: T, x: number, y: number, z: number, face = 0): T {
    if (!o.parent) this.scene.add(o)
    o.position.set(x, y, z)
    o.rotation.set(0, (face * Math.PI) / 180, 0)
    o.visible = true
    return o
  }
  private burst(color: number, x: number, y: number, z: number, n: number, speed: number, up: number, life: number, size: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const v = speed * (0.4 + Math.random() * 0.6)
      this.bits.emit(x, y, z, Math.cos(a) * v, up * (0.5 + Math.random() * 0.7), Math.sin(a) * v, life * (0.6 + Math.random() * 0.5), size * (0.7 + Math.random() * 0.6), color)
    }
  }
  /** A puff of snow (or dust): something lands, pops up, skids. */
  puff(x: number, y: number, z: number, n = 10) {
    this.burst(0, x, y, z, n, 1.6, 1.6, 0.7, 0.14)
  }
  /** Gold and pink sparkles: a happy moment, a friend joining. */
  sparkle(x: number, y: number, z: number, n = 14) {
    for (let i = 0; i < n; i++) this.burst(1 + (i % 2), x, y, z, 1, 1.4, 2.6, 0.9, 0.09)
  }
  /** Drops of water. */
  splash(x: number, y: number, z: number, n = 16) {
    this.burst(3, x, y, z, n, 2.2, 3.4, 0.8, 0.1)
  }
  /** Confetti in every color (the win). */
  confetti(x: number, y: number, z: number, n = 30) {
    for (let i = 0; i < n; i++) this.burst(1 + (i % 6), x, y, z, 1, 2.4, 4.2, 1.8, 0.1)
  }

  // ---------------------------------------------------------------- the engine's side

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
    this.cast.update(dt, t)
    const m = this.now && this.sets.get(this.now.id)
    if (m && m.set.update) m.set.update(m.live, dt, t, this)
    if (cine) this.lookAt.copy(cine.look)
    const look = this.lookAt
    if (this.snow > 0) {
      const n = this.snow * dt * 70
      for (let i = 0; i < n; i++) if (Math.random() < 0.5) this.flakes.emit(look.x + (Math.random() - 0.5) * 26, look.y + 7 + Math.random() * 3, look.z + (Math.random() - 0.5) * 22, 0.3, -1.1 - Math.random(), 0, 6, 0.07 + Math.random() * 0.05)
    }
    this.bits.update(dt)
    this.flakes.update(dt)
    this.clouds.rotation.y = t * 0.004
    this.dome.position.copy(this.rig.camera.position)
    this.stars.position.copy(this.rig.camera.position)
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
    this.bars.render(this.renderer, this.scene, this.rig.camera, this.w, this.h)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  placeAnchors() {}
  pointerDown() {}
  pointerMove() {}
  pointerUp() {}
  tap() {}

  qa() {
    return { film: this.films.now, films: { done: this.films.done, skipped: this.films.skipped }, set: this.now?.id, ended: this.ended }
  }
  memory() {
    return { ...this.renderer.info.memory }
  }
  dispose() {
    this.sfx.stop()
    this.scene.clear()
    this.bag.dispose()
  }
}

export const STORY_ANCHORS: AnchorInfo[] = []

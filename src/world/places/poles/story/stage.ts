// The Poles' film stage (docs/films.md; the story: planning/around-the-world/poles.md): one small 3D world that
// only plays films. It has the story's sets (the Arctic's floating ice, the autumn tundra, Antarctica by day and in
// its long night, and the little globe the red ship sails up), its whole cast as actors (story/actor.ts) and its
// props (story/props.ts). A film (story/films.ts) picks a set, puts the actors on their marks and tells them what to
// do, beat by beat. The games stay games: Place.tsx plays a film here before and after each one, so every chapter
// gets its cutscenes without a line of film code inside a game's world.
//
// Nothing here takes taps (FilmOverlay sparkles where her finger was and holds the ⏭). When the film ends or is
// skipped, `events.done()` moves on; the stage is thrown away, so a film's `finish()` has nothing to put back.
import { CircleGeometry, Color, Fog, Group, Matrix4, Mesh, Scene, SphereGeometry, Vector3, type WebGLRenderer } from 'three'
import type { Line } from '../../../../sdk'
import type { AnchorInfo } from '../../../engine3d/Anchors'
import { CameraRig } from '../../../engine3d/camera'
import { Letterbox } from '../../../engine3d/cinema'
import { Bag } from '../../../engine3d/dispose'
import { FilmPlayer, type Beat, type FilmState } from '../../../engine3d/film'
import { bake, merge, P, solid } from '../../../engine3d/geo'
import { makeHull, setOutlineResolution } from '../../../engine3d/outline'
import { Particles } from '../../../engine3d/particles'
import { applyBands, makeLights } from '../../../engine3d/toon'
import type { World3D } from '../../../engine3d/View3D'
import { Water } from '../../../engine3d/water'
import { earthTexture, ll } from '../globe/earth'
import { buildNorth, buildSouth, standOn } from '../globe/globe'
import { globeMaterials } from '../globe/material'
import { Actor } from './actor'
import { Aurora, Balloon, bergGeo, driftGeo, floeGeo, makeCrate, makeRamp, makeShip, mountainGeo, Narwhal, rng, skyDisc, Stars, tableBergGeo } from './props'
import { storySfx } from './sounds'

export type SetName = 'arctic' | 'tundra' | 'antarctic' | 'night' | 'globe'

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
  sky: string
  fog: [number, number]
  /** Ambient and sun, times the usual. */
  light: [number, number]
  tint: string
}
const LOOKS: Record<SetName, Look> = {
  arctic: { sky: '#CFE9FF', fog: [70, 230], light: [1, 1], tint: '#FFF7F0' },
  tundra: { sky: '#D9E6FA', fog: [70, 230], light: [1, 1], tint: '#FFF4E6' },
  antarctic: { sky: '#DCEBFF', fog: [80, 260], light: [1, 1], tint: '#FFF7F0' },
  night: { sky: '#232A63', fog: [60, 240], light: [0.62, 0.5], tint: '#C9D2FF' },
  globe: { sky: '#F1E8FF', fog: [400, 900], light: [1, 1], tint: '#FFF7F0' },
}
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
  private bg = new Color()
  private setNow: SetName = 'arctic'
  private water: Water
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
  private sunDisc: Group
  private moon: Group
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
    scene.background = this.bg
    scene.fog = new Fog('#CFE9FF', 70, 230)
    this.rig.fov = 36
    this.rig.camera.near = 0.05

    this.water = new Water({ size: 900, deep: '#5FA6DE', shallow: '#78BCEA', haze: '#CFE9FF', hazeNear: 60, hazeFar: 220 }, bag)
    scene.add(this.water.mesh)
    this.flakes = new Particles({ kind: 'spray', count: 260, color: '#FFFFFF', gravity: 0.5 }, bag)
    this.foam = new Particles({ kind: 'foam', count: 60, opacity: 0.85 }, bag)
    this.spray = new Particles({ kind: 'spray', count: 120 }, bag)
    scene.add(this.flakes.mesh, this.foam.mesh, this.spray.mesh)

    for (const name of ['arctic', 'tundra', 'antarctic', 'night', 'globe'] as const) {
      this.sets[name] = new Group()
      this.sets[name].visible = false
      scene.add(this.sets[name])
    }
    this.sunDisc = skyDisc(bag, 9, '#FFF3C4', '#FFE9A8')
    this.sunDisc.position.set(-70, 26, -190)
    this.moon = skyDisc(bag, 6, '#FFF6D8', '#C9D2FF')
    this.moon.position.set(60, 70, -190)
    this.stars = new Stars(bag)
    this.aurora = new Aurora(bag)
    scene.add(this.sunDisc, this.moon, this.stars.points, this.aurora.root)

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
    for (const o of [this.nari.root, this.balloon.root, this.ship, this.ramp, this.crate, this.krill]) {
      o.visible = false
      scene.add(o)
    }

    this.films = new FilmPlayer({ line: (l) => this.events.line(l), state: (s) => this.events.film(s) })
    this.use(film.set)
    this.films.play({ id: film.id, beats: film.beats(this), finish: () => this.sfx.stop() }, () => this.end())
  }

  // ---------------------------------------------------------------- the sets

  private add(set: SetName, geo: ReturnType<typeof merge>, x = 0, y = 0, z = 0, px = 2.5) {
    const o = solid(geo, this.bag, px)
    o.position.set(x, y, z)
    this.sets[set].add(o)
    return o
  }

  /** The Arctic: floes on the sea round a big one at the middle, Mama's wide ice behind, pointy bergs far off. */
  private buildArctic() {
    const r = rng(3)
    // The floe the story stands on, and Mama's ice across the water.
    this.add('arctic', floeGeo(6.5, 11, ICE_Y), 0, 0, 0)
    this.add('arctic', floeGeo(11, 12, ICE_Y), 4, 0, -24)
    for (let i = 0; i < 16; i++) {
      const a = r() * Math.PI * 2
      const d = 11 + r() * 34
      const x = Math.cos(a) * d
      const z = Math.sin(a) * d - 6
      if (Math.hypot(x - 4, z + 24) < 14) continue
      const o = this.add('arctic', floeGeo(1.2 + r() * 2.6, 20 + i, ICE_Y, 0.4), x, 0, z, 2)
      o.rotation.y = r() * 6
      this.bobbers.push({ o, y: 0, phase: r() * 6 })
    }
    for (const [x, z, s, seed] of [[-46, -80, 9, 1], [38, -95, 12, 2], [-12, -120, 15, 3], [74, -70, 7, 4], [-85, -60, 8, 5], [18, -62, 4, 6]] as const) this.add('arctic', bergGeo(s, seed), x, -0.4, z, 3)
  }

  /** The tundra beside the frozen sea: low land in autumn's reds and golds, and the same land under snow. */
  private buildTundra() {
    const r = rng(8)
    const land = (c: string, hill: string, into: Group) => {
      const parts = [bake(new CircleGeometry(60, 40).rotateX(-Math.PI / 2), c, { at: [0, ICE_Y - 0.05, -61.5] })]
      for (const [x, z, rr, h] of [[-30, -52, 22, 5], [16, -64, 30, 7], [48, -46, 18, 4], [-58, -40, 16, 3.4]] as const) parts.push(bake(new SphereGeometry(rr, 18, 10), hill, { at: [x, ICE_Y - 0.5, z], scale: [1, h / rr, 0.6] }))
      const o = solid(merge(parts), this.bag, 2.5)
      into.add(o)
    }
    land('#D99A52', '#C9703F', this.tundraBrown)
    land('#FFFFFF', '#EEF3FF', this.tundraSnow)
    // Autumn's tufts and red bushes, and winter's drifts.
    const tufts = []
    const drifts = []
    for (let i = 0; i < 40; i++) {
      const x = (r() - 0.5) * 44
      const z = -3 - r() * 26
      tufts.push(P.cone(0.16 + r() * 0.12, 0.3 + r() * 0.25, i % 3 ? '#8DB36B' : '#E2553F', { at: [x, ICE_Y + 0.14, z] }, 5))
      if (i % 3 === 0) drifts.push(bake(driftGeo(1 + r() * 1.6, 0.3 + r() * 0.3), '#FFFFFF', { at: [x, ICE_Y, z] }))
    }
    this.tundraBrown.add(solid(merge(tufts), this.bag, 1.5))
    this.tundraSnow.add(solid(merge(drifts), this.bag, 2))
    this.tundraSnow.visible = false
    this.sets.tundra.add(this.tundraBrown, this.tundraSnow)
    // The shore's rocks and a strip of sea ice in front.
    this.add('tundra', merge([...Array(7)].map((_, i) => P.sphere(0.5 + r() * 0.6, '#9A93A8', { at: [(i - 3) * 5.5 + r() * 2, ICE_Y + 0.1, -2.2 - r() * 2], scale: [1.3, 0.6, 1] }, 8))), 0, 0, 0, 2)
    this.add('tundra', floeGeo(9, 31, ICE_Y), 0, 0, 5)
    for (const [x, z, s, seed] of [[-60, -110, 12, 7], [52, -120, 14, 8]] as const) this.add('tundra', mountainGeo(s * 2.4, s * 2.2, seed), x, 0, z, 3)
  }

  /** Antarctica: a wide land of snow with mountains behind, drifts, and the ice edge along its right-hand side, where
   *  the sea (and the red ship) is. The night uses the same land under a dark sky. */
  private buildAntarctic() {
    const r = rng(14)
    const parts = [
      // The land: a great slab whose right edge (x = 16) is the ice edge, a blue band along its foot.
      P.box(260, 3, 320, '#FFFFFF', { at: [-114, SNOW_Y - 1.5, -60] }),
      P.box(0.4, 1.2, 320, '#A9D4F5', { at: [16.1, SNOW_Y - 0.9, -60] }),
    ]
    for (let i = 0; i < 14; i++) parts.push(bake(driftGeo(2 + r() * 3.5, 0.35 + r() * 0.5), '#FFFFFF', { at: [-48 + r() * 58, SNOW_Y, -34 + r() * 30] }))
    const land = solid(merge(parts), this.bag, 2.5)
    const far = solid(merge([[-70, -130, 26, 30, 1], [-20, -150, 34, 40, 2], [36, -140, 24, 26, 3], [-120, -110, 22, 24, 4], [-48, -105, 14, 15, 5]].map(([x, z, rr, h, seed]) => mountainGeo(rr, h, seed).translate(x, 0, z))), this.bag, 3)
    const bergs = solid(merge([tableBergGeo(26, 14, 5).translate(60, -0.4, -70), tableBergGeo(16, 10, 3.6).translate(44, -0.4, -22)]), this.bag, 3)
    // (One land for both the day and the night sets: `use` shows it for either.)
    this.sets.antarctic.add(land, far, bergs)
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
    for (const [name, g] of Object.entries(this.sets)) g.visible = name === set || (name === 'antarctic' && set === 'night')
    const look = LOOKS[set]
    this.bg.set(look.sky)
    const fog = this.scene.fog as Fog
    fog.color.set(look.sky)
    fog.near = look.fog[0]
    fog.far = look.fog[1]
    const night = set === 'night'
    this.water.setColors(night ? '#2B3C8C' : '#5FA6DE', night ? '#3D54A8' : '#78BCEA', look.sky)
    this.water.mesh.position.y = set === 'antarctic' || night ? -0.5 : 0
    this.water.mesh.visible = set !== 'globe'
    this.lights.ambient.color.set(look.tint)
    this.lights.sun.color.set(look.tint)
    this.lightK = look.light
    this.sunDisc.visible = set === 'arctic' || set === 'tundra' || set === 'antarctic'
    this.moon.visible = night
    this.stars.opacity = night ? 1 : 0
    this.aurora.amount = night ? 0.9 : 0
    this.snowing = 0
    if (!keepCast) this.clear()
  }
  private lightK: [number, number] = [1, 1]
  get set() {
    return this.setNow
  }
  /** Everyone and everything off the stage. */
  clear() {
    for (const a of this.cast) a.hide()
    for (const o of [this.nari.root, this.balloon.root, this.ship, this.ramp, this.crate, this.krill]) o.visible = false
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
    this.bg.set(a.sky).lerp(tmpC.set(k < 0.6 ? '#F2B8C6' : b.sky), Math.min(1, k * 1.4))
    ;(this.scene.fog as Fog).color.copy(this.bg)
    this.lightK = [a.light[0] + (b.light[0] - a.light[0]) * k, a.light[1] + (b.light[1] - a.light[1]) * k]
    this.stars.opacity = 1 - k
    this.aurora.amount = 0.9 * (1 - k)
    this.sunDisc.visible = k > 0.05
    this.sunDisc.position.set(-70, -8 + k * 22, -190)
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
    this.water.update(t)
    for (const b of this.bobbers) {
      b.o.position.y = Math.sin(t * 0.9 + b.phase) * 0.05
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
    return { film: this.films.now, films: { done: this.films.done, skipped: this.films.skipped }, set: this.setNow, ended: this.ended }
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
const ZERO = new Vector3()
const tmpC = new Color()
const M = new Matrix4()

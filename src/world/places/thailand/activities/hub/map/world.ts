// The Thailand map in 3D (plan: planning/around-the-world/thailand/thailand-map.md): a toy board she looks down on,
// with Thailand standing up out of the sea, a little model of each place she can go (tap it and it opens), and animals,
// boats and clouds that all do something when she pokes them. She can swing the board round with a drag and pinch it
// closer, like her camera in Roblox. terrain.ts builds the still board, toys.ts the things on it; this file makes
// them move and listens to her finger.
import { CanvasTexture, Group, Raycaster, Scene, SRGBColorSpace, Vector2, Vector3, type Mesh, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp, sounds } from '../../../../../../sdk'
import type { AnchorInfo } from '../../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../../engine3d/camera'
import { Bag } from '../../../../../engine3d/dispose'
import { blobShadow, merge, solid } from '../../../../../engine3d/geo'
import { setOutlineResolution } from '../../../../../engine3d/outline'
import { Particles } from '../../../../../engine3d/particles'
import type { RoamState } from '../../../../../engine3d/roam'
import { makeLights } from '../../../../../engine3d/toon'
import type { World3D } from '../../../../../engine3d/View3D'
import { knobs } from '../../../../../kit/knobs'
import { noise, sfx, tone } from '../../../../../kit/sfx'
import { buildField, type Field } from './field'
import { BOARD, PINS, POKES, SPEEDBOAT_LOOP, toLat, toLon, toX, toZ, WATER_LOOPS, type PinId, type ToyId } from './geo'
import type { LonLat } from './land'
import { buildPin, type PinToy } from './pins'
import { buildLand, buildTray, Sea } from './terrain'
import * as T from './toys'

export interface MapEvents {
  /** She tapped a place: it opens. */
  pin(id: PinId): void
  /** She poked something. */
  poked(id: ToyId): void
  /** Any touch at all (the hint waits again). */
  touched(): void
}

export const MAP_ANCHORS: AnchorInfo[] = POKES.map((p) => ({ id: `poke:${p.id}`, label: p.label, kind: 'thing' }))

/** How high each place's pin floats over its model. */
const PIN_LIFT: Record<PinId, number> = { bangkok: 1.1, nan: 1.2, krabi: 1.1, samet: 0.7 }
/** Particle colors: water, white, pink, butter, leaf, lavender. */
const DROP = 0
const WHITE = 1
const LEAF = 4

interface Place {
  id: PinId
  at: Vector3
  model: Group
  pin: Group
  toy: PinToy
  live: boolean
  done: boolean
  /** Seconds since she tapped it (-1: not tapped). */
  t: number
  phase: number
}

interface Toy {
  id: ToyId
  root: Object3D
  /** Where it lives (its ground spot). */
  home: Vector3
  /** Where its tap target sits now, and how big it is across (units). */
  at: Vector3
  size: number
  /** Seconds since she poked it (-1: idle). */
  t: number
}

interface Drifter {
  root: Group
  shadow: Mesh
  speed: number
  /** Seconds since she poked it (-1: idle). */
  t: number
  y: number
}

const tmp = new Vector3()
const tmp2 = new Vector3()
const smoothstep = (p: number) => p * p * (3 - 2 * p)
const TAU = Math.PI * 2

/** The board's camera when she lands: turned a little, then it settles lower and closer so the map arrives instead
 *  of just sitting there (the feel lab, ?feel=1). */
export const MAP_CAM = knobs('thai-map-cam', 'Thailand map camera', 'src/world/places/thailand/activities/hub/map/world.ts', {
  yaw: { value: 8, min: -40, max: 40, step: 1, label: 'Turn', unit: '°', note: 'added to the board view, side to side (it does not animate)' },
  pitch: { value: -12, min: -30, max: 20, step: 1, label: 'Settle tilt', unit: '°', note: 'where the entrance ends: below 0 looks from lower down' },
  zoom: { value: 0.87, min: 0.6, max: 1.2, step: 0.01, label: 'Settle zoom', unit: '×', note: 'where the entrance ends: below 1 is closer' },
  intro: { value: 2.6, min: 0, max: 6, step: 0.1, label: 'Entrance', unit: 's', note: 'how long the camera takes to settle after she lands' },
  hold: { value: 0.35, min: 0, max: 1.5, step: 0.05, label: 'Entrance wait', unit: 's', note: 'a still beat after the map appears before the camera starts moving' },
})
/** Starts from rest and lands at rest: no jolt on the cut from the loading screen. */
const easeInOut = (p: number) => 0.5 - 0.5 * Math.cos(Math.PI * p)

export class ThaiMapWorld implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private field: Field
  private land: Mesh
  private sea: Sea
  private scenery: T.Scenery
  private w = 1
  private h = 1
  private top = 0
  private time = 0
  private touches = 0
  private anchorEls = new Map<string, HTMLElement>()
  private raycaster = new Raycaster()
  private overview: Shot = { center: new Vector3(0, 0.2, 0.1), half: new Vector3(5.1, 0.7, 8.3), yaw: -6, pitch: 54, maxDist: 200, roam: { yaw: [-38, 38], pitch: [-14, 22], zoom: [0.5, 1] } }
  private close: Shot = { center: new Vector3(), half: new Vector3(1.7, 0.8, 1.7), yaw: -6, pitch: 46, maxDist: 200 }
  private picked: Place | null = null
  private hint = false
  /** The overview before the entrance's change (set per screen shape in setSize). */
  private base = { yaw: -6, pitch: 47, half: new Vector3(4.5, 0.5, 7.3) }
  /** Seconds into the entrance (it runs once, when the board opens). */
  private introT = 0

  private places: Place[] = []
  private toys = new Map<ToyId, Toy>()
  private drifters: Drifter[] = []
  private under: Group[] = []
  private spray: Particles
  private foam: Particles

  // The moving toys' own parts.
  private mom!: T.Elephant
  private baby!: T.Elephant
  private buffalo!: T.Buffalo
  private gibbon!: T.Gibbon
  private bird!: T.Bird
  private tuk!: Group
  private dolphins: Group[] = []
  private boat!: Group
  private barge!: Group
  private speedboat!: Group
  private turtle!: T.Turtle
  private rainCloud!: Group
  private rainbow!: Group
  private balloon!: T.Balloon
  private palm!: Group
  private coconut!: Group
  private nextJump = 3
  /** How long the board took to build (ms), for QA. */
  private buildMs = 0

  constructor(
    private renderer: WebGLRenderer,
    private events: MapEvents,
  ) {
    const began = performance.now()
    this.scene.background = sky(this.bag)
    this.rig.fov = 30
    this.rig.lag = 0.5
    this.field = buildField()
    this.land = buildLand(this.field, this.bag)
    this.sea = new Sea(this.field, this.bag)
    this.scenery = T.buildScenery(this.field, this.bag)
    this.scene.add(this.land, this.sea.mesh, buildTray(this.bag), this.scenery.group)
    this.spray = new Particles({ kind: 'spray', count: 110, colors: ['#8FD3F7', '#FFFFFF', '#FF8FB8', '#FBEA9A', '#8BD79A', '#D9CCFF'], gravity: 3.2 }, this.bag)
    this.foam = new Particles({ kind: 'foam', count: 70, opacity: 0.92 }, this.bag)
    this.scene.add(this.spray.mesh, this.foam.mesh)
    this.buildPlaces()
    this.buildToys()
    this.buildClouds()
    this.buildMs = Math.round(performance.now() - began)
  }

  // ---------------------------------------------------------------- building

  /** The ground's height at a place (never under the sea's top). */
  private ground(lon: number, lat: number) {
    return Math.max(0, this.field.height(lon, lat))
  }

  private spot([lon, lat]: LonLat, up = 0) {
    return new Vector3(toX(lon), this.ground(lon, lat) + up, toZ(lat))
  }

  private buildPlaces() {
    const parts: Record<PinId, () => ReturnType<typeof T.bangkokParts>> = { bangkok: T.bangkokParts, nan: T.nanParts, krabi: T.krabiParts, samet: T.sametParts }
    PINS.forEach((p, i) => {
      const at = this.spot(p.at)
      const model = solid(merge(parts[p.id]()), this.bag, 1.5)
      model.position.copy(at)
      const toy = buildPin(p.id, this.bag, i * 1.7)
      this.scene.add(model, toy.root)
      this.places.push({ id: p.id, at, model, pin: toy.root, toy, live: true, done: false, t: -1, phase: i * 1.7 })
    })
    // The speedboat that goes round and round Koh Samet.
    this.speedboat = T.speedboat(this.bag)
    this.scene.add(this.speedboat)
  }

  private add(id: ToyId, root: Object3D, size: number, up = 0) {
    const home = this.spot(POKES.find((p) => p.id === id)!.at, up)
    root.position.copy(home)
    this.scene.add(root)
    this.toys.set(id, { id, root, home, at: home.clone(), size, t: -1 })
    return home
  }

  private buildToys() {
    // The elephants: a mother and her baby, up in the northern hills.
    const herd = new Group()
    this.mom = T.elephant(this.bag, 1.25)
    this.baby = T.elephant(this.bag, 0.72)
    this.baby.root.position.set(0.48, 0, 0.16)
    this.baby.root.rotation.y = -0.35
    this.mom.root.rotation.y = 0.2
    herd.add(this.mom.root, this.baby.root)
    this.add('elephant', herd, 1.0)

    this.buffalo = T.buffalo(this.bag)
    this.buffalo.root.scale.setScalar(1.15)
    this.buffalo.root.rotation.y = -0.3
    this.add('buffalo', this.buffalo.root, 0.75)

    this.gibbon = T.gibbon(this.bag)
    this.gibbon.root.scale.setScalar(1.25)
    this.add('gibbon', this.gibbon.root, 0.9)

    this.bird = T.hornbill(this.bag)
    this.bird.root.scale.setScalar(1.15)
    this.add('hornbill', this.bird.root, 0.7, 1.15)

    this.tuk = T.tuktuk(this.bag)
    this.tuk.scale.setScalar(1.3)
    this.add('tuktuk', this.tuk, 0.7)

    const pod = new Group()
    for (const k of [-1, 1]) {
      const d = T.dolphin(this.bag)
      d.scale.setScalar(1.25)
      d.position.set(k * 0.27, 0, k * 0.12)
      d.rotation.y = 0.5
      pod.add(d)
      this.dolphins.push(d)
    }
    this.add('dolphins', pod, 0.9)

    this.boat = T.longtail(this.bag)
    this.boat.scale.setScalar(1.35)
    this.add('boat', this.boat, 0.8)

    this.barge = T.barge(this.bag)
    this.barge.scale.setScalar(1.1)
    this.add('barge', this.barge, 0.6)

    this.turtle = T.turtle(this.bag)
    this.turtle.root.scale.setScalar(1.3)
    this.add('turtle', this.turtle.root, 0.6)

    // The big coconut palm, with one coconut that drops.
    this.palm = solid(merge(T.palmParts(0, 0, 0, 1.9, 0.5, false)), this.bag, 1.5)
    this.coconut = solid(merge(T.coconutParts()), this.bag, 1.5)
    const tree = new Group()
    tree.add(this.palm, this.coconut, blobShadow(0.3, this.bag))
    this.add('palm', tree, 0.85)

    // The rain cloud over Nan's mountains, and the rainbow it leaves.
    this.rainCloud = T.cloud(this.bag, 1.25, true)
    const home = this.add('clouds', this.rainCloud, 1.0, 1.55)
    this.rainbow = T.rainbow(this.bag)
    this.rainbow.position.set(home.x - 0.25, home.y - 1.5, home.z + 0.35)
    this.rainbow.visible = false
    this.scene.add(this.rainbow)

    this.balloon = T.balloon(this.bag)
    this.balloon.root.scale.setScalar(1.25)
    this.add('balloon', this.balloon.root, 1.0, 1.25)
  }

  private buildClouds() {
    // Clouds drifting high over the map, each with its shadow on the ground.
    const x0 = toX(BOARD.lon0)
    const x1 = toX(BOARD.lon1)
    const z0 = toZ(BOARD.lat1)
    const z1 = toZ(BOARD.lat0)
    const spots: [number, number, number, number][] = [[0.12, 0.2, 0.9, 2.3], [0.68, 0.44, 0.75, 2.05], [0.3, 0.72, 1.0, 2.2], [0.9, 0.86, 0.7, 2.0]]
    for (const [u, v, s, y] of spots) {
      const root = T.cloud(this.bag, s)
      root.position.set(x0 + (x1 - x0) * u, y, z0 + (z1 - z0) * v)
      const shadow = blobShadow(0.42 * s, this.bag)
      this.scene.add(root, shadow)
      this.drifters.push({ root, shadow, speed: 0.05 + s * 0.03, t: -1, y })
    }
    // Clouds below, round the tray: the map floats in the sky Sparkle's balloon flies through.
    const low: [number, number, number, number][] = [[-7.2, -1.6, -5.5, 2.6], [7.4, -1.9, -2.5, 3.0], [-7.6, -2.2, 3.5, 2.8], [7.0, -1.5, 6.5, 2.4], [-2.5, -2.4, 10.2, 3.2], [3.5, -2.0, -10.0, 2.6], [-6.0, -2.6, -9.6, 2.2], [6.2, -2.8, 10.6, 2.6]]
    for (const [x, y, z, s] of low) {
      const c = T.cloud(this.bag, s)
      c.position.set(x, y, z)
      this.scene.add(c)
      this.under.push(c)
    }
  }

  // ---------------------------------------------------------------- World3D

  /** Which places have a pin, which wear a stamp, and whether Sparkle is hinting (the pins bounce higher). */
  setPins(live: PinId[], done: PinId[], hint: boolean) {
    this.hint = hint
    for (const p of this.places) {
      p.live = live.includes(p.id)
      p.done = done.includes(p.id)
      p.pin.visible = p.model.visible = p.live
    }
  }

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.top = top
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
    // A wide screen looks from a little lower and further round, so the tall country fills more of it.
    const wide = w > h * 1.15
    this.base.yaw = wide ? -26 : -6
    this.base.pitch = wide ? 42 : 47
    this.base.half.set(wide ? 3.6 : 4.5, 0.5, wide ? 6.0 : 7.3)
    this.overview.center.set(wide ? 0.5 : 0.2, 0.2, wide ? 1.3 : 0.6)
    this.frameOverview()
    this.rig.setShot(this.picked ? this.close : this.overview, true)
  }

  setAnchorElements(els: Map<string, HTMLElement>) {
    this.anchorEls = els
  }

  /** The overview at this point of the entrance: from the plain view (turned by `yaw`) down and in to where it settles. */
  private frameOverview() {
    const k = MAP_CAM.intro > 0 ? easeInOut(clamp((this.introT - MAP_CAM.hold) / MAP_CAM.intro, 0, 1)) : 1
    this.overview.yaw = this.close.yaw = this.base.yaw + MAP_CAM.yaw
    this.overview.pitch = this.base.pitch + MAP_CAM.pitch * k
    this.overview.half.copy(this.base.half).multiplyScalar(1 + (MAP_CAM.zoom - 1) * k)
  }

  /** She may swing the board round and pinch it closer (no walking, no jumping). */
  roam(): RoamState | null {
    return this.picked ? null : { walk: false, jump: false }
  }

  get calm() {
    return this.introT >= MAP_CAM.hold + MAP_CAM.intro && !this.rig.moving && !this.picked && !this.spray.busy && ![...this.toys.values()].some((t) => t.t >= 0)
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.sea.update(t)
    this.updatePlaces(dt, t)
    this.updateToys(dt, t)
    this.updateClouds(dt, t)
    this.spray.update(dt)
    this.foam.update(dt)
    const c = this.overview.center
    this.lights.follow(c.x, c.y, c.z)
    // The entrance: the camera rides it exactly (no lag), until she picks a place.
    // (A slow frame, like the first ones uploading the board's textures, slows it a moment instead of skipping ahead.)
    const end = MAP_CAM.hold + MAP_CAM.intro
    const entering = !this.picked && this.introT < end
    if (this.picked) this.introT = end
    else if (entering) this.introT += Math.min(dt, 1 / 30)
    this.frameOverview()
    this.rig.setShot(this.picked ? this.close : this.overview, entering)
    this.rig.update(dt)
  }

  render() {
    this.renderer.render(this.scene, this.rig.camera)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  // ---------------------------------------------------------------- the places and their pins

  private updatePlaces(dt: number, t: number) {
    for (const p of this.places) {
      if (!p.live) continue
      if (p.t >= 0) p.t += dt
      // A pin without a stamp bobs (higher when Sparkle hints); a tapped one spins and jumps.
      const bob = p.done ? 0.03 * Math.sin(t * 1.5 + p.phase) : (this.hint ? 0.2 : 0.1) * Math.abs(Math.sin(t * (this.hint ? 3.2 : 2.2) + p.phase))
      const jump = p.t >= 0 ? 0.45 * bell(clamp(p.t / 0.7, 0, 1)) : 0
      p.pin.position.copy(p.at).setY(p.at.y + PIN_LIFT[p.id] + bob + jump)
      // Each one turns to look at her wherever she swings the board.
      const cam = this.rig.camera.position
      const rest = Math.atan2(cam.x - p.at.x, cam.z - p.at.z) + Math.sin(t * 0.9 + p.phase) * 0.16
      p.pin.rotation.y = p.t >= 0 ? rest + p.t * 9 : rest
      p.toy.update(t, Math.atan2(cam.y - p.pin.position.y, Math.hypot(cam.x - p.at.x, cam.z - p.at.z)))
      const squash = p.done ? 0 : 0.07 * Math.max(0, Math.cos(t * (this.hint ? 6.4 : 4.4) + p.phase * 2))
      p.pin.scale.set(1 + squash, 1 - squash, 1 + squash)
      // The model gives a happy bounce when its pin is tapped.
      const pop = p.t >= 0 ? 0.12 * bell(clamp(p.t / 0.45, 0, 1)) : 0
      p.model.scale.set(1 + pop, 1 - pop * 0.6, 1 + pop)
    }
    // The speedboat round the island.
    const a = t * 0.55
    const { lon, lat, rx, rz } = SPEEDBOAT_LOOP
    this.speedboat.position.set(toX(lon) + Math.cos(a) * rx, 0.012 + Math.sin(t * 5) * 0.006, toZ(lat) + Math.sin(a) * rz)
    this.speedboat.rotation.set(-0.08, Math.atan2(-Math.sin(a) * rx, Math.cos(a) * rz), 0)
    if (Math.random() < dt * 9) this.foam.emit(this.speedboat.position.x - Math.sin(this.speedboat.rotation.y) * 0.2, 0.012, this.speedboat.position.z - Math.cos(this.speedboat.rotation.y) * 0.2, 0, 0, 0, 0.9, 0.1)
  }

  // ---------------------------------------------------------------- the toys

  private updateToys(dt: number, t: number) {
    for (const toy of this.toys.values()) if (toy.t >= 0) toy.t += dt
    const done = (id: ToyId, after: number) => {
      const toy = this.toys.get(id)!
      if (toy.t > after) toy.t = -1
      return toy
    }

    // Elephants: ears flap, trunks sway; poked, the mother lifts her trunk, trumpets and squirts, and the baby hops.
    {
      const toy = done('elephant', 2.2)
      const k = toy.t
      const up = k >= 0 ? bell(clamp(k / 1.8, 0, 1)) : 0
      for (const [e, lag, s] of [[this.mom, 0, 1], [this.baby, 0.25, 1.6]] as const) {
        const flap = Math.sin(t * (1.6 + up * 8) * s + lag * 8) * (0.22 + up * 0.3)
        e.earL.rotation.y = -0.25 - flap
        e.earR.rotation.y = 0.25 + flap
        e.trunk.rotation.x = Math.sin(t * 1.2 * s + lag * 5) * 0.12 - up * 1.9
        const hop = k >= 0 ? bell(clamp((k - lag) / 0.5, 0, 1)) * (e === this.baby ? 0.22 : 0.08) : 0
        e.body.position.y = hop
        const breathe = 0.015 * Math.sin(t * 2 * s + lag)
        e.body.scale.set(e.body.scale.x, (e === this.mom ? 1.25 : 0.72) * (1 + breathe), e.body.scale.z)
      }
      if (k > 0.5 && k < 1.5 && Math.random() < dt * 30) {
        const p = this.mom.trunk.getWorldPosition(tmp)
        this.spray.emit(p.x, p.y + 0.25, p.z + 0.1, (Math.random() - 0.5) * 0.6, 1.5 + Math.random() * 0.5, 0.2 + Math.random() * 0.5, 0.9, 0.07, DROP)
      }
      toy.at.copy(toy.home).add(tmp.set(0.2, 0.4, 0.05))
    }

    // Buffalo: grazes, flicks; poked, shakes its head and stamps.
    {
      const toy = done('buffalo', 1.6)
      const k = toy.t
      const b = this.buffalo
      b.head.rotation.x = k >= 0 ? -0.75 : -0.6 + 0.75 * Math.max(0, Math.sin(t * 0.7)) ** 6
      b.head.rotation.y = k >= 0 ? Math.sin(k * 16) * 0.5 * (1 - k / 1.6) : Math.sin(t * 0.5) * 0.15
      b.body.position.y = k >= 0 ? 0.1 * bell(clamp(k / 0.45, 0, 1)) : 0
      b.body.scale.y = 1 + 0.015 * Math.sin(t * 1.8)
      toy.at.copy(toy.home).setY(toy.home.y + 0.35)
    }

    // Gibbon: swings from its branch; poked, swings wildly round.
    {
      const toy = done('gibbon', 2.8)
      const k = toy.t
      const wild = k >= 0 ? 1 - k / 2.8 : 0
      this.gibbon.swing.rotation.z = Math.sin(t * (2.1 + wild * 5)) * (0.4 + wild * 1.3)
      toy.at.copy(toy.home).setY(toy.home.y + 0.55)
    }

    // Hornbill: flies in a slow circle, flapping; poked, it squawks and loops the loop.
    {
      const toy = done('hornbill', 2.4)
      const k = toy.t
      const fast = k >= 0 ? 1 + 2.2 * bell(clamp(k / 2.4, 0, 1)) : 1
      const b = this.bird
      b.root.userData.a = (b.root.userData.a ?? 0) + dt * 0.55 * fast
      const a = b.root.userData.a as number
      const loop = k >= 0 ? bell(clamp(k / 1.4, 0, 1)) * 0.5 : 0
      b.root.position.set(toy.home.x + Math.cos(a) * 0.75, toy.home.y + Math.sin(t * 1.3) * 0.06 + loop, toy.home.z + Math.sin(a) * 0.55)
      b.root.rotation.set(0, Math.atan2(-Math.sin(a) * 0.75, Math.cos(a) * 0.55), -0.3)
      const flap = Math.sin(t * 9 * fast) * 0.7
      b.wingL.rotation.z = -flap
      b.wingR.rotation.z = flap
      b.body.position.y = -flap * 0.02
      toy.at.copy(b.root.position)
    }

    // Tuk-tuk: putters round its little loop; poked, it honks and zooms, puffing.
    {
      const toy = done('tuktuk', 2.6)
      const k = toy.t
      const fast = k >= 0 ? 1 + 3 * bell(clamp(k / 2.6, 0, 1)) : 1
      const g = this.tuk
      g.userData.a = (g.userData.a ?? 0) + dt * 0.6 * fast
      const a = g.userData.a as number
      const x = toy.home.x + Math.cos(a) * 0.55
      const z = toy.home.z + Math.sin(a) * 0.4
      g.position.set(x, this.ground(toLon(x), toLat(z)) + Math.abs(Math.sin(t * 22)) * 0.012 * fast, z)
      g.rotation.set(0, Math.atan2(-Math.sin(a) * 0.55, Math.cos(a) * 0.4), Math.sin(t * 22) * 0.02 - (fast - 1) * 0.04)
      if (Math.random() < dt * (k >= 0 ? 16 : 2.5)) this.spray.emit(x - Math.sin(g.rotation.y) * 0.22, g.position.y + 0.08, z - Math.cos(g.rotation.y) * 0.22, 0, 0.35, 0, 0.7, 0.07, WHITE)
      toy.at.copy(g.position).setY(g.position.y + 0.2)
    }

    // Dolphins: they bob at the surface and hop now and then; poked, both leap high with a splash.
    {
      const toy = done('dolphins', 1.5)
      const k = toy.t
      this.nextJump -= dt
      const small = this.nextJump < 0 ? clamp(-this.nextJump / 0.9, 0, 1) : 0
      if (this.nextJump < -0.9) {
        this.nextJump = 3.5 + Math.random() * 3
        this.dolphinSplash(toy.home, 0)
      }
      this.dolphins.forEach((d, i) => {
        const p = k >= 0 ? clamp((k - i * 0.22) / 1.1, 0, 1) : i === 0 ? small : 0
        const high = k >= 0 ? 0.62 : 0.26
        d.position.y = -0.03 + Math.sin(t * 1.6 + i * 2) * 0.015 + bell(p) * high
        d.rotation.x = p > 0 && p < 1 ? -1.0 + 2.0 * p : Math.sin(t * 1.6 + i * 2) * 0.1
        d.position.z = (i ? 1 : -1) * 0.12 + (p > 0 && p < 1 ? (p - 0.5) * 0.5 : 0)
        if (k >= 0 && d.userData.in !== true && p >= 1) {
          d.userData.in = true
          this.dolphinSplash(toy.home, i ? 0.27 : -0.27)
          sfx.splash()
        }
        if (k < 0) d.userData.in = false
      })
      toy.at.copy(toy.home).setY(0.15)
    }

    // The longtail: round and round on the Andaman Sea with a foamy wake; poked, it roars off faster with spray.
    this.sail('boat', this.boat, dt, t, ...WATER_LOOPS.boat, 0.42, 3.2)
    // The rice barge: slow and fat; poked, it toots and puffs.
    this.sail('barge', this.barge, dt, t, ...WATER_LOOPS.barge, 0.2, 2.4)

    // Turtle: paddles in a circle; poked, it dives and pops back up.
    {
      const toy = done('turtle', 2)
      const k = toy.t
      const g = this.turtle
      g.root.userData.a = (g.root.userData.a ?? 1) + dt * 0.3
      const a = g.root.userData.a as number
      const dive = k >= 0 ? bell(clamp(k / 1.6, 0, 1)) : 0
      const [rx, rz] = WATER_LOOPS.turtle
      g.root.position.set(toy.home.x + Math.cos(a) * rx, 0.0 + Math.sin(t * 1.4) * 0.01 - dive * 0.3, toy.home.z + Math.sin(a) * rz)
      g.root.rotation.set(k >= 0 ? Math.sin(clamp(k / 1.6, 0, 1) * TAU) * 0.9 : 0, Math.atan2(-Math.sin(a) * rx, Math.cos(a) * rz) + (k >= 0 ? k * 4 : 0), 0)
      const paddle = Math.sin(t * (k >= 0 ? 12 : 3)) * 0.5
      g.flipL.rotation.y = paddle
      g.flipR.rotation.y = -paddle
      if (k >= 0 && k < 0.1 && !g.root.userData.wet) {
        g.root.userData.wet = true
        this.foam.burst(g.root.position.x, 0.012, g.root.position.z, 6, 0.5, 0, 0.22)
      }
      if (k < 0) g.root.userData.wet = false
      toy.at.copy(g.root.position).setY(0.1)
    }

    // The coconut palm: sways; poked, it shakes and a coconut drops, bonk, and rolls.
    {
      const toy = done('palm', 3)
      const k = toy.t
      this.palm.rotation.z = Math.sin(t * 0.9) * 0.03 + (k >= 0 && k < 0.6 ? Math.sin(k * 40) * 0.07 * (1 - k / 0.6) : 0)
      const top = 0.92
      let y = top
      let x = 0.3
      if (k >= 0.25) {
        const fall = clamp((k - 0.25) / 0.45, 0, 1)
        const bounce = bell(clamp((k - 0.7) / 0.4, 0, 1)) * 0.18
        y = Math.max(0.06, top - (top - 0.06) * fall * fall) + bounce
        x = 0.3 + clamp((k - 0.7) / 0.9, 0, 1) * 0.3
        if (fall >= 1 && !this.coconut.userData.hit) {
          this.coconut.userData.hit = true
          sfx.boing()
        }
      }
      if (k < 0) this.coconut.userData.hit = false
      // It grows back as the poke ends.
      const grow = k > 2.5 ? (k - 2.5) / 0.5 : 1
      if (k > 2.5) {
        y = top
        x = 0.3
      }
      this.coconut.position.set(x, y, 0.16)
      this.coconut.scale.setScalar(Math.max(0.001, grow))
      toy.at.copy(toy.home).setY(toy.home.y + 0.6)
    }

    // The rain cloud: poked, it squashes and rains on the hills, then a rainbow comes out.
    {
      const toy = done('clouds', 7)
      const k = toy.t
      const c = this.rainCloud
      const sq = k >= 0 ? 0.18 * bell(clamp(k / 0.5, 0, 1)) : 0
      c.position.set(toy.home.x + Math.sin(t * 0.35) * 0.18, toy.home.y + Math.sin(t * 0.9) * 0.05, toy.home.z)
      c.scale.set(1 + sq, 1 - sq, 1 + sq)
      if (k >= 0.15 && k < 3.2 && Math.random() < dt * 26) this.spray.emit(c.position.x + (Math.random() - 0.5) * 0.9, c.position.y - 0.15, c.position.z + (Math.random() - 0.5) * 0.3, 0, -0.6, 0, 1.3, 0.075, DROP)
      const show = k >= 2.2 ? Math.min(1, (k - 2.2) / 0.6) * (k > 6.3 ? Math.max(0, 1 - (k - 6.3) / 0.6) : 1) : 0
      this.rainbow.visible = show > 0
      this.rainbow.scale.setScalar(Math.max(0.001, smoothstep(show)))
      toy.at.copy(c.position)
    }

    // Sparkle's balloon: drifts and bobs; poked, the burner roars, it climbs and spins, and sparkles fall.
    {
      const toy = done('balloon', 3)
      const k = toy.t
      const b = this.balloon
      const lift = k >= 0 ? bell(clamp(k / 3, 0, 1)) : 0
      b.root.position.set(toy.home.x + Math.sin(t * 0.22) * 0.35, toy.home.y + Math.sin(t * 0.8) * 0.08 + lift * 0.6, toy.home.z + Math.cos(t * 0.17) * 0.25)
      b.root.rotation.set(Math.sin(t * 0.6) * 0.04, k >= 0 ? smoothstep(clamp(k / 2.4, 0, 1)) * TAU : 0, Math.sin(t * 0.5) * 0.05)
      const roar = k >= 0 && k < 1.4 ? 1 : 0
      b.flame.scale.setScalar(0.45 + 0.1 * Math.sin(t * 20) + roar * (1.1 + 0.3 * Math.sin(t * 40)))
      if (k >= 0 && k < 2.2 && Math.random() < dt * 24) this.spray.emit(b.root.position.x + (Math.random() - 0.5) * 0.5, b.root.position.y + 0.6 + Math.random() * 0.6, b.root.position.z + (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, 0.4, (Math.random() - 0.5) * 0.5, 1.1, 0.07, 2 + Math.floor(Math.random() * 2))
      toy.at.copy(b.root.position).setY(b.root.position.y + 0.7)
    }
  }

  /** A boat going round a loop on the water, with a wake: faster for `boost` seconds after a poke. */
  private sail(id: ToyId, g: Group, dt: number, t: number, rx: number, rz: number, speed: number, boost: number) {
    const toy = this.toys.get(id)!
    if (toy.t > boost) toy.t = -1
    const k = toy.t
    const fast = k >= 0 ? 1 + 2.6 * bell(clamp(k / boost, 0, 1)) : 1
    g.userData.a = (g.userData.a ?? 0) + dt * speed * fast
    const a = g.userData.a as number
    g.position.set(toy.home.x + Math.cos(a) * rx, 0.012 + Math.sin(t * 2.2) * 0.008, toy.home.z + Math.sin(a) * rz)
    const yaw = Math.atan2(-Math.sin(a) * rx, Math.cos(a) * rz)
    g.rotation.set(-0.05 * fast, yaw, Math.sin(t * 1.7) * 0.05 - (fast - 1) * 0.08)
    const bx = g.position.x - Math.sin(yaw) * 0.42
    const bz = g.position.z - Math.cos(yaw) * 0.42
    if (Math.random() < dt * 7 * fast) this.foam.emit(bx, 0.012, bz, (Math.random() - 0.5) * 0.1, 0, (Math.random() - 0.5) * 0.1, 1.1, 0.13 * Math.sqrt(fast))
    if (fast > 1.6 && Math.random() < dt * 22) this.spray.emit(bx, 0.05, bz, (Math.random() - 0.5) * 0.4, 0.8 + Math.random() * 0.4, (Math.random() - 0.5) * 0.4, 0.6, 0.06, id === 'barge' ? WHITE : DROP)
    toy.at.copy(g.position).setY(0.18)
  }

  private dolphinSplash(home: Vector3, dx: number) {
    this.foam.burst(home.x + dx, 0.012, home.z + 0.3, 6, 0.55, 0, 0.22)
    for (let i = 0; i < 6; i++) this.spray.emit(home.x + dx, 0.05, home.z + 0.3, (Math.random() - 0.5) * 0.9, 0.9 + Math.random() * 0.6, (Math.random() - 0.5) * 0.9, 0.7, 0.07, DROP)
  }

  private poke(id: ToyId) {
    const toy = this.toys.get(id)!
    this.events.poked(id)
    // (A thing already in the middle of its trick keeps going; the tap still makes its sound.)
    if (toy.t < 0) toy.t = 0
    SOUND[id]()
  }

  // ---------------------------------------------------------------- clouds

  private updateClouds(dt: number, t: number) {
    const x0 = toX(BOARD.lon0) - 1.2
    const x1 = toX(BOARD.lon1) + 1.2
    for (const c of this.drifters) {
      if (c.t >= 0) c.t += dt
      if (c.t > 1.2) c.t = -1
      const p = c.root.position
      p.x += c.speed * dt
      if (p.x > x1) p.x = x0
      p.y = c.y + Math.sin(t * 0.7 + c.speed * 90) * 0.05
      const pop = c.t >= 0 ? 0.3 * bell(clamp(c.t / 0.6, 0, 1)) : 0
      c.root.scale.set(1 + pop, 1 - pop * 0.7, 1 + pop)
      c.shadow.position.set(p.x, this.ground(toLon(p.x), toLat(p.z)) + 0.02, p.z)
      // (Only on Thailand: a grey blot on the sea or the paper looks like a stain.)
      c.shadow.visible = this.field.thai(toLon(p.x), toLat(p.z)) > 0.08
    }
    this.under.forEach((c, i) => (c.position.y += Math.sin(t * 0.4 + i * 1.9) * 0.0012))
  }

  // ---------------------------------------------------------------- her finger

  private toScreen(v: Vector3) {
    const p = tmp2.copy(v).project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h }
  }

  /** How many screen pixels a unit of the map is at this spot. */
  private pxPerUnit(at: Vector3) {
    const a = this.toScreen(at)
    const ax = a.x
    const ay = a.y
    const b = this.toScreen(tmp.copy(at).add(this.rig.camera.getWorldDirection(new Vector3()).cross(this.rig.camera.up).normalize()))
    return Math.hypot(b.x - ax, b.y - ay)
  }

  pointerDown() {}
  pointerMove() {}
  pointerUp() {}

  tap(x: number, y: number, id?: string) {
    this.touches++
    this.events.touched()
    if (this.picked) return
    if (id?.startsWith('pin:')) {
      const p = this.places.find((k) => k.id === id.slice(4))!
      // A pin's target is big and sits over everything: if her finger is really on a toy passing by (the tuk-tuk
      // driving past Bangkok on a small screen), the toy answers instead of the place opening.
      const near = this.toyUnder(x, y, p)
      if (near) return this.poke(near)
      p.t = 0
      this.picked = p
      // The camera swoops down to the place she picked.
      this.close.center.copy(p.at).setY(p.at.y + 0.5)
      this.rig.lag = 0.3
      this.rig.resetTurn()
      this.spray.burst(p.at.x, p.at.y + PIN_LIFT[p.id] + 0.5, p.at.z, 14, 0.9, 1.4, 0.1)
      return this.events.pin(p.id)
    }
    if (id?.startsWith('poke:')) return this.poke(id.slice(5) as ToyId)
    // Anything else: whatever her finger lands on answers.
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    const drift = this.raycaster.intersectObjects(this.drifters.map((c) => c.root), true)[0]
    if (drift) {
      const c = this.drifters.find((k) => k.root === drift.object.parent)!
      c.t = 0
      sfx.fwip()
      this.spray.burst(drift.point.x, drift.point.y, drift.point.z, 7, 0.5, 0.6, 0.1, WHITE)
      return
    }
    const hit = this.raycaster.intersectObjects([this.scenery.group, this.land, this.sea.mesh], true)[0]
    if (!hit) return sfx.fwip()
    const at = hit.point
    if (hit.object !== this.land && hit.object !== this.sea.mesh) {
      // A tree, a mountain or a limestone tower: leaves fly.
      noise(0.25, 0.08, 'highpass', 2500, 1800, 0, 0.7)
      this.spray.burst(at.x, at.y + 0.05, at.z, 8, 0.6, 0.9, 0.09, LEAF)
    } else if (hit.object === this.sea.mesh) {
      sfx.splash()
      this.foam.burst(at.x, 0.012, at.z, 6, 0.5, 0, 0.2)
      this.spray.burst(at.x, 0.04, at.z, 5, 0.4, 1, 0.07, DROP)
    } else {
      // The ground: a pop of pink and butter confetti.
      sounds.pop()
      for (let i = 0; i < 7; i++) this.spray.emit(at.x, at.y + 0.05, at.z, (Math.random() - 0.5) * 0.9, 0.9 + Math.random() * 0.6, (Math.random() - 0.5) * 0.9, 0.7, 0.08, 2 + (i % 2) + (i % 3 === 0 ? 3 : 0))
    }
  }

  /** The toy her finger is on, when it is nearer to the toy than to this place's pin and model (null: the place). */
  private toyUnder(x: number, y: number, p: Place): ToyId | null {
    const head = this.toScreen(tmp.copy(p.pin.position).setY(p.pin.position.y + p.toy.head))
    const hx = head.x
    const hy = head.y
    const foot = this.toScreen(tmp.copy(p.at).setY(p.at.y + 0.2))
    // Distance to the line from the pin's head down to the model.
    const dx = foot.x - hx
    const dy = foot.y - hy
    const k = clamp(((x - hx) * dx + (y - hy) * dy) / Math.max(1, dx * dx + dy * dy), 0, 1)
    const toPin = Math.hypot(x - (hx + dx * k), y - (hy + dy * k))
    let best: ToyId | null = null
    let bestD = toPin
    for (const toy of this.toys.values()) {
      const s = this.toScreen(toy.at)
      const d = Math.hypot(x - s.x, y - s.y)
      if (d < bestD && d < Math.max(24, this.pxPerUnit(toy.at) * toy.size * 0.5)) {
        bestD = d
        best = toy.id
      }
    }
    return best
  }

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    for (const [id, el] of this.anchorEls) {
      let spot: { x: number; y: number; w: number; h: number; z: number } | null = null
      if (id.startsWith('pin:')) {
        const p = this.places.find((k) => k.id === id.slice(4))
        if (p?.live && !this.picked) {
          // One target over the place's model and its pin; its top is the pin's head (the stamp rides there).
          const head = this.toScreen(tmp.copy(p.pin.position).setY(p.pin.position.y + p.toy.head))
          const hx = head.x
          const hy = head.y
          const foot = this.toScreen(tmp.copy(p.at).setY(p.at.y + 0.1))
          const hgt = Math.max(min, foot.y - hy + min * 0.2)
          const wid = Math.max(min, this.pxPerUnit(p.at) * p.toy.wide)
          spot = { x: hx, y: hy + hgt / 2 - min * 0.1, w: wid, h: hgt, z: 9000 }
        }
      } else if (id.startsWith('poke:')) {
        const toy = this.toys.get(id.slice(5) as ToyId)
        if (toy && !this.picked) {
          const s = this.toScreen(toy.at)
          const d = Math.max(min, this.pxPerUnit(toy.at) * toy.size)
          spot = { x: s.x, y: s.y, w: d, h: d, z: 5000 }
        }
      }
      const show = !!spot && spot.x >= 0 && spot.x <= this.w && spot.y >= this.top && spot.y <= this.h
      if (show && spot) {
        el.style.transform = `translate3d(${spot.x - spot.w / 2}px, ${spot.y - spot.h / 2}px, 0)`
        el.style.width = `${spot.w}px`
        el.style.height = `${spot.h}px`
        el.style.zIndex = String(spot.z)
      }
      el.style.display = show ? '' : 'none'
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    return { touches: this.touches, buildMs: this.buildMs, picked: this.picked?.id ?? null, poking: [...this.toys.values()].filter((t) => t.t >= 0).map((t) => t.id) }
  }

  memory() {
    return { ...this.renderer.info.memory }
  }

  dispose() {
    this.scene.clear()
    this.bag.dispose()
  }
}

/** What each toy sounds like when poked. */
const SOUND: Record<ToyId, () => void> = {
  elephant: () => (tone(220, 520, 0.35, 0.08, 'sawtooth'), tone(260, 600, 0.3, 0.05, 'square', 0.05)),
  clouds: () => [0, 0.1, 0.2, 0.32, 0.45, 0.6, 0.8, 1.0, 1.25].forEach((d) => noise(0.05, 0.03, 'highpass', 3500 + Math.random() * 2000, 3000, d, 1)),
  gibbon: () => [0, 0.22, 0.44].forEach((d, i) => tone(500 + i * 120, 900 + i * 150, 0.18, 0.06, 'sine', d)),
  buffalo: () => tone(140, 110, 0.6, 0.08, 'sawtooth'),
  hornbill: () => [0, 0.15].forEach((d) => tone(900, 600, 0.1, 0.06, 'square', d)),
  tuktuk: () => [0, 0.09, 0.18, 0.27].forEach((d) => tone(180, 160, 0.06, 0.06, 'square', d)),
  dolphins: () => tone(1400, 2200, 0.12, 0.05, 'sine'),
  boat: () => (tone(300, 300, 0.25, 0.05, 'square'), noise(0.4, 0.04, 'bandpass', 600, 300)),
  palm: () => noise(0.3, 0.07, 'highpass', 2400, 1600, 0, 0.7),
  balloon: () => (noise(0.9, 0.07, 'lowpass', 900, 400, 0, 0.6), setTimeout(() => sounds.sparkle(), 500)),
  turtle: () => sfx.splash(),
  barge: () => (tone(220, 220, 0.5, 0.1, 'sawtooth'), tone(277, 277, 0.5, 0.05, 'triangle')),
}

/** The sky behind the board: soft blue up top, pink down low. */
function sky(bag: Bag) {
  const c = document.createElement('canvas')
  c.width = 4
  c.height = 256
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 0, 256)
  grad.addColorStop(0, '#BFE6FF')
  grad.addColorStop(0.55, '#E4DCFF')
  grad.addColorStop(1, '#FFD9EC')
  g.fillStyle = grad
  g.fillRect(0, 0, 4, 256)
  const tex = bag.add(new CanvasTexture(c))
  tex.colorSpace = SRGBColorSpace
  return tex
}

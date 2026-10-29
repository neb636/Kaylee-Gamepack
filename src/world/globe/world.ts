// The home screen's globe: a toy planet floating in a pastel sky, with raised clay-like continents, a landmark and a
// friend for every place she can fly to, clouds, a whale and Sparkle's balloon going round. She spins it with her finger
// (it coasts, and turns gently by itself when she lets it be); tapping a continent says its name and pops it up, tapping
// the sea splashes, and tapping a place's landmark picks it: the globe turns it to her, the balloon flies over, the
// camera swoops down onto it and the country opens. It arrives with a little spin, the landmarks popping up one by one.
//
// Frames: `root` (the whole toy: its float and the intro's grow) > `tilt` (about the screen's x axis: which way up she
// sees it) > `spin` (about the Earth's axis). Everything on the Earth lives in `spin`, in globe units (the Earth is 1);
// landmarks and the whale are built in centimeters of a 100 cm Earth and scaled down. Built for engine3d/View3D.tsx.
import { Color, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshToonMaterial, Object3D, PlaneGeometry, Quaternion, Raycaster, RingGeometry, Scene, SphereGeometry, Sprite, SpriteMaterial, Vector2, Vector3, type BufferAttribute, type Texture, type WebGLRenderer } from 'three'
import { bell, sounds } from '../../sdk'
import { knobs } from '../kit/knobs'
import { sfx, tone } from '../kit/sfx'
import { CameraRig } from '../engine3d/camera'
import { Bag } from '../engine3d/dispose'
import { merge, P, solid } from '../engine3d/geo'
import { makeHull, setOutlineResolution } from '../engine3d/outline'
import { makeLights, PAL, toonGradient } from '../engine3d/toon'
import type { World3D } from '../engine3d/View3D'
import type { FlagId } from '../kit/Flag'
import { WORLD_LINES } from '../lines'
import { CONTINENT_SPOTS, continentAt, LAND_H, LANDMASSES, type ContinentKey } from './continents'
import { balloon, cloud, CLOUDS, frame, island, ISLANDS, sailboat, scenery, standAt, whale } from './decor'
import { buildLandmark, type Landmark } from './landmarks'
import { landGeometry, latLonOf, unitAt } from './land'
import { flagTexture, landTexture, oceanTexture, sparkleTexture } from './paint'
import { Sky } from './sky'
import { rod } from './toys'

const FILE = 'src/world/globe/world.ts'
/** How the globe feels under her finger (live in the feel lab: #/world?feel=1). */
export const SPIN = knobs('homeGlobe', 'Spin the world', FILE, {
  grip: { value: 1, min: 0.3, max: 2.5, step: 0.05, label: 'Grip', unit: '×', note: '1 = the spot under her finger stays under it; higher = it turns further than her finger' },
  coast: { value: 1.6, min: 0.2, max: 5, step: 0.1, label: 'Coast', unit: 's', note: 'how long a flick keeps it spinning' },
  maxSpin: { value: 7, min: 1, max: 15, step: 0.5, label: 'Top flick speed', unit: 'rad/s', note: 'the fastest a flick can spin it' },
  flick: { value: 0.06, min: 0, max: 0.3, step: 0.01, label: 'Flick smoothing', unit: 's', note: 'how much of her last moves count toward a flick' },
  idle: { value: 0.09, min: 0, max: 0.5, step: 0.01, label: 'Idle spin', unit: 'rad/s', note: 'the Earth turning by itself when nobody holds it' },
  idleAfter: { value: 3.5, min: 0.5, max: 15, step: 0.5, label: 'Idle after', unit: 's', note: 'how long after her last touch it starts turning by itself' },
  rest: { value: 12, min: -30, max: 40, step: 1, label: 'Resting tilt', unit: '°', note: 'how far the north leans toward her when it turns by itself' },
  focus: { value: 46, min: 0, max: 70, step: 1, label: 'Picked place height', unit: '°', note: 'how far above the middle a picked place comes to rest (higher = seen more from the side)' },
  size: { value: 0.78, min: 0.4, max: 1, step: 0.01, label: 'Globe size', unit: '×', note: 'the Earth across the free space (landmarks, clouds and the balloon stick out past it)' },
})

/** One thing she can fly to, as the screen hands it in. */
export interface GlobePlace {
  /** The tap target's id: `place:<id>` (and `place:poles-north` for the Arctic end of the Poles). */
  anchor: string
  /** Where tapping it flies (a place id, or `home` for the tea party). */
  goes: string
  /** Its landmark (landmarks.ts). */
  look: string
  lat: number
  lon: number
  /** The pill over it while she flies there. */
  label: string
  flag?: FlagId
  /** She has never been: it sparkles more. */
  fresh: boolean
}

export interface GlobeStart {
  places: GlobePlace[]
  /** The place to come round to (the one she just came back from), else the Atlantic. */
  face?: string
  /** The full arrival spin (the first time this session), or a short one. */
  long: boolean
}

export interface GlobeEvents {
  /** She picked a place: the flight starts. */
  pick(goes: string): void
  /** The flight is over: open it. */
  arrive(goes: string): void
  continent(key: ContinentKey): void
  /** A tap on something else: `ocean`, `whale`, `cloud`, `balloon`, `sky`. */
  poke(what: string): void
  /** No touch at all for a while. */
  hint(): void
}

const DEG = Math.PI / 180
const CM = 0.01
/** Landmarks stand bigger than life (a toy planet's), and so do the balloon and the whale. */
const LANDMARK = 0.0145
const TRAVEL_S = 2.55
const UP = new Vector3(0, 1, 0)
const tmp = new Vector3()
const tmp2 = new Vector3()
const tq = new Quaternion()

const easeOut = (k: number) => 1 - (1 - Math.min(1, Math.max(0, k))) ** 3
const easeOutBack = (k: number) => {
  const x = Math.min(1, Math.max(0, k))
  const c = 1.9
  return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2
}
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

interface Mark {
  place: GlobePlace
  lm: Landmark
  o: Group
  /** Globe-local: which way is up there. */
  up: Vector3
  popAt: number
  popped: boolean
  hopT: number
  sparkles: Sprite[]
  flag?: { geo: PlaneGeometry; base: Float32Array }
}

interface Puff {
  o: Group
  phase: number
  base: Vector3
  squash: number
  popAt: number
}

interface Spark {
  s: Sprite
  v: Vector3
  life: number
  age: number
  size: number
}

export class HomeGlobe implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private root = new Group()
  private tilt = new Group()
  private spin = new Group()
  private sky = new Sky()
  private w = 1
  private h = 1
  private top = 0
  private slot: { x: number; y: number; w: number; h: number } | null = null
  private dist = 6
  private center = { x: 0, y: 0 }
  private time = 0
  private anchorEls = new Map<string, HTMLElement>()
  private raycaster = new Raycaster()

  // ---- How it's turned (radians) and moving.
  private yaw = 0
  private pitch = 0
  private yawVel = 0
  private pitchVel = 0
  private focus: { yaw: number; pitch: number } | null = null

  // ---- What's happening.
  private mode: 'intro' | 'idle' | 'travel' = 'intro'
  private introT = 0
  private introDur: number
  private intro = { yaw0: 0, yaw1: 0, pitch0: 0, pitch1: 0 }
  private scale = 0.55
  private glow = 0
  private lastTouch = 0
  private touches = 0
  private hinted = false
  /** She has touched it at all (a drag counts). */
  private felt = false
  private travel: { mark: Mark; t: number; done: boolean } | null = null
  private label: { text: string; at: () => Vector3; until: number } | null = null

  // ---- Her finger.
  private dragging = false
  private last = { x: 0, y: 0, t: 0 }
  private vYaw = 0
  private vPitch = 0

  // ---- What's on it.
  private marks: Mark[] = []
  private continents = new Map<ContinentKey, { group: Group; t: number }>()
  private puffs: Puff[] = []
  private whale: { o: Group; t: number; base: Quaternion }
  private isles: { o: Group; t: number; size: number }[] = []
  private boat: { o: Group; a: number; t: number }
  private balloon: { o: Group; a: number; mode: 'orbit' | 'fly'; t: number; from: Vector3; bounce: number }
  private twinkles: Sprite[] = []
  private sparks: Spark[] = []
  private sparkIdx = 0
  private ripples: { m: Mesh; mat: MeshBasicMaterial; t: number }[] = []
  private rippleIdx = 0
  private ocean: Mesh
  private lands: Mesh[] = []
  private pickables: Object3D[] = []
  /** Where on the sea her last tap landed (globe-local). */
  private lastSea: Vector3 | null = null
  /** Where her last tap on the Arctic's ice landed (world). */
  private lastIce: Vector3 | null = null
  private fadeEl: HTMLElement | null = null
  private labelEl: HTMLElement | null = null

  constructor(
    private renderer: WebGLRenderer,
    private start: GlobeStart,
    private events: GlobeEvents,
  ) {
    makeLights(this.scene)
    this.scene.background = new Color('#F6EEFF')
    this.scene.add(this.sky.mesh, this.root)
    this.root.add(this.tilt)
    this.tilt.add(this.spin)
    this.rig.fov = 28
    this.rig.camera.fov = 28
    this.rig.camera.near = 0.05
    this.rig.camera.far = 60
    this.introDur = start.long ? 2.9 : 1.5

    // ---- The sea.
    const sea = this.bag.add(new SphereGeometry(1, 128, 64))
    const oceanMat = this.bag.add(new MeshToonMaterial({ map: this.bag.add(oceanTexture()), gradientMap: toonGradient() }))
    this.ocean = new Mesh(sea, oceanMat)
    this.ocean.userData.tag = 'ocean'
    const seaHull = makeHull(sea, 3)
    this.bag.add(seaHull.geometry)
    this.spin.add(this.ocean, seaHull)

    // ---- The land: one group per continent (so it can pop up when she taps it), its slabs and its scenery.
    const landMat = this.bag.add(new MeshToonMaterial({ map: this.bag.add(landTexture()), vertexColors: true, gradientMap: toonGradient() }))
    const heights = new Map<ContinentKey, number>()
    for (const m of LANDMASSES) {
      const key: ContinentKey = m.continent
      let c = this.continents.get(key)
      if (!c) {
        c = { group: new Group(), t: -1 }
        this.continents.set(key, c)
        this.spin.add(c.group)
      }
      const { geometry: geo, walls } = landGeometry(m)
      this.bag.add(geo)
      const mesh = new Mesh(geo, landMat)
      mesh.userData.tag = `land:${key}`
      const hull = makeHull(walls, 2.5)
      walls.dispose()
      this.bag.add(hull.geometry)
      c.group.add(mesh, hull)
      this.lands.push(mesh)
      if (!heights.has(key) || m.trees) heights.set(key, 1 + m.height)
    }
    for (const [key, g] of scenery(this.bag, (c) => heights.get(c) ?? 1.03)) {
      let c = this.continents.get(key)
      if (!c) {
        c = { group: new Group(), t: -1 }
        this.continents.set(key, c)
        this.spin.add(c.group)
      }
      c.group.add(g)
    }

    // ---- The places.
    const flags = new Map<FlagId, Texture>()
    const sparkTex = this.bag.add(sparkleTexture())
    const sparkMats = [PAL.gold, '#FFFFFF', PAL.pink].map((c) => this.bag.add(new SpriteMaterial({ map: sparkTex, color: c, transparent: true, depthWrite: false })))
    for (const place of start.places) {
      const lm = buildLandmark(place.look, this.bag)
      const o = new Group()
      const landTop = this.groundAt(place.lat, place.lon)
      standAt(o, place.lat, place.lon, landTop - 0.004)
      o.scale.setScalar(0)
      lm.group.scale.setScalar(LANDMARK)
      lm.group.traverse((c) => (c.userData.tag = `mark:${place.anchor}`))
      o.add(lm.group)
      this.spin.add(o)
      const mark: Mark = { place, lm, o, up: unitAt(place.lat, place.lon), popAt: 0, popped: false, hopT: -1, sparkles: [] }
      const flagId = place.flag ?? lm.flag?.id
      if (flagId && lm.flag) {
        const [fx, , fz] = lm.flag.at
        const pole = solid(merge([rod([fx, 0, fz], [fx, 9.5, fz], 0.22, '#FFFFFF', 6), P.sphere(0.55, PAL.gold, { at: [fx, 9.8, fz] }, 8)]), this.bag, 1.5)
        let tex = flags.get(flagId)
        if (!tex) {
          tex = this.bag.add(flagTexture(flagId))
          flags.set(flagId, tex)
        }
        const geo = this.bag.add(new PlaneGeometry(5.6, 2.8, 8, 3))
        geo.translate(2.8, 0, 0)
        const flag = new Mesh(geo, this.bag.add(new MeshBasicMaterial({ map: tex, side: DoubleSide })))
        flag.position.set(fx + 0.2, 8, fz)
        flag.rotation.y = -0.5
        lm.group.add(pole, flag)
        mark.flag = { geo, base: (geo.attributes.position as BufferAttribute).array.slice() as Float32Array }
      }
      const n = place.fresh ? 3 : 1
      for (let i = 0; i < n; i++) {
        const s = new Sprite(sparkMats[place.fresh ? (i % 2 ? 2 : 0) : 1])
        s.userData.phase = (i / n) * Math.PI * 2
        lm.group.add(s)
        mark.sparkles.push(s)
      }
      this.marks.push(mark)
    }

    // ---- Clouds over the sea.
    CLOUDS.forEach(([lat, lon, size], i) => {
      const o = new Group()
      const c = cloud(this.bag, i)
      c.scale.setScalar(0.085 * size)
      c.traverse((x) => (x.userData.tag = `cloud:${i}`))
      o.add(c)
      standAt(o, lat, lon, 1.22 + (i % 3) * 0.04, i * 0.7)
      o.scale.setScalar(0)
      this.spin.add(o)
      this.puffs.push({ o, phase: i * 1.7, base: o.position.clone(), squash: -1, popAt: 0 })
    })

    // ---- The whale, out in the middle of the South Atlantic.
    const wo = new Group()
    const wm = whale(this.bag)
    wm.scale.setScalar(CM * 2.3)
    wm.traverse((x) => (x.userData.tag = 'whale'))
    wo.add(wm)
    standAt(wo, -27, -21, 0.998, 0.6)
    this.spin.add(wo)
    this.whale = { o: wo, t: -1, base: wo.quaternion.clone() }

    // ---- Islands, and a sailboat going round in the Pacific.
    ISLANDS.forEach(([lat, lon, size], i) => {
      const o = new Group()
      const m = island(this.bag, i)
      m.scale.setScalar(CM * 1.2 * size)
      m.traverse((x) => (x.userData.tag = `isle:${i}`))
      o.add(m)
      standAt(o, lat, lon, 1.004, i * 1.3)
      this.spin.add(o)
      this.isles.push({ o, t: -1, size })
    })
    const so = new Group()
    const sm = sailboat(this.bag)
    sm.scale.setScalar(CM * 1.5)
    sm.traverse((x) => (x.userData.tag = 'boat'))
    so.add(sm)
    this.spin.add(so)
    this.boat = { o: so, a: 0, t: -1 }

    // ---- Sparkle's balloon, going round.
    const bo = new Group()
    const bm = balloon(this.bag)
    bm.scale.setScalar(CM * 0.92)
    bm.traverse((x) => (x.userData.tag = 'balloon'))
    bo.add(bm)
    this.scene.add(bo)
    this.balloon = { o: bo, a: 0.6, mode: 'orbit', t: 0, from: new Vector3(), bounce: -1 }

    // ---- Twinkles round it, and a pool of sparks for taps.
    for (let i = 0; i < 14; i++) {
      const s = new Sprite(sparkMats[i % 3])
      const a = (i / 14) * Math.PI * 2 + Math.sin(i * 7.3) * 0.3
      const r = 1.3 + ((i * 37) % 11) / 11 * 0.75
      s.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.92, -0.9 - (i % 4) * 0.2)
      s.userData.phase = i * 1.37
      s.userData.size = 0.035 + (i % 3) * 0.015
      this.scene.add(s)
      this.twinkles.push(s)
    }
    const sparkPool = [PAL.gold, PAL.pink, '#FFFFFF', PAL.lavenderDark, PAL.sky].map((c) => this.bag.add(new SpriteMaterial({ map: sparkTex, color: c, transparent: true, depthWrite: false })))
    for (let i = 0; i < 40; i++) {
      const s = new Sprite(sparkPool[i % sparkPool.length])
      s.visible = false
      this.scene.add(s)
      this.sparks.push({ s, v: new Vector3(), life: 0, age: 1, size: 0 })
    }
    const ring = this.bag.add(new RingGeometry(0.62, 1, 40))
    ring.rotateX(-Math.PI / 2)
    for (let i = 0; i < 4; i++) {
      const mat = this.bag.add(new MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0, depthWrite: false }))
      const m = new Mesh(ring, mat)
      m.visible = false
      this.spin.add(m)
      this.ripples.push({ m, mat, t: -1 })
    }

    this.pickables = [...this.marks.map((m) => m.lm.group), ...this.puffs.map((p) => p.o), wo, so, ...this.isles.map((i) => i.o), bo, ...this.lands, this.ocean]
    this.setupIntro()
  }

  /** The land's top at a spot (the sea if there's none). */
  private groundAt(lat: number, lon: number) {
    // The Arctic's sea ice is the last landmass.
    if (lat > 80) return 1 + LANDMASSES[LANDMASSES.length - 1].height
    const c = continentAt(lon, lat)
    if (!c) return 1
    if (c === 'antarctica') return lat < -60 ? 1 + LANDMASSES.find((m) => m.continent === 'antarctica')!.height : 1
    return 1 + LAND_H
  }

  // ---------------------------------------------------------------- the turn that brings a place to her

  /** The globe's yaw and pitch that bring (lat, lon) round to her, `above` degrees over the middle. */
  private facing(lat: number, lon: number, above: number) {
    const v = unitAt(lat, lon)
    const yaw = -Math.atan2(v.x, v.z)
    const pitch = Math.max(-50, Math.min(72, lat - above)) * DEG
    return { yaw: this.yaw + wrap(yaw - this.yaw), pitch }
  }

  private setupIntro() {
    const face = this.start.face ? this.marks.find((m) => m.place.goes === this.start.face && !m.place.anchor.endsWith('north')) : undefined
    const end = face ? this.facing(face.place.lat, face.place.lon, SPIN.focus * 0.4) : this.facing(18, -42, SPIN.rest)
    if (!face) end.pitch = SPIN.rest * DEG
    const turns = this.start.long ? Math.PI * 2 * 0.85 : 1.1
    this.intro = { yaw0: end.yaw - turns, yaw1: end.yaw, pitch0: end.pitch - 26 * DEG, pitch1: end.pitch }
    this.yaw = this.intro.yaw0
    this.pitch = this.intro.pitch0
    // The landmarks pop up in the order they come round to the front, the clouds a little before.
    const front = (m: Mark) => m.up.clone().applyAxisAngle(UP, end.yaw).z
    const order = [...this.marks].sort((a, b) => front(b) - front(a))
    const d = this.introDur
    order.forEach((m, i) => (m.popAt = d * (0.32 + (0.52 * i) / Math.max(1, order.length - 1))))
    this.puffs.forEach((p, i) => (p.popAt = d * (0.12 + (0.4 * i) / this.puffs.length)))
  }

  private endIntro() {
    if (this.mode !== 'intro') return
    this.mode = 'idle'
    for (const m of this.marks) m.popAt = Math.min(m.popAt, this.introT)
    for (const p of this.puffs) p.popAt = Math.min(p.popAt, this.introT)
  }

  // ---------------------------------------------------------------- World3D

  /** The part of the screen the globe should sit in (px, from the top left of the view), between the bars. */
  setSlot(x: number, y: number, w: number, h: number) {
    this.slot = { x, y, w, h }
    this.fit()
  }

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.top = top
    setOutlineResolution(w, h)
    this.rig.setSize(w, h, top)
    this.fit()
  }

  private fit() {
    const cam = this.rig.camera
    const s = this.slot ?? { x: 0, y: this.top, w: this.w, h: this.h - this.top }
    const r = (SPIN.size * Math.min(s.w, s.h * 1.02)) / 2
    const tanHalf = Math.tan((cam.fov / 2) * DEG)
    const a = Math.atan((r * tanHalf) / (this.h / 2))
    this.dist = 1 / Math.sin(a)
    // A little above the middle: the shadow it floats over goes underneath.
    this.center = { x: s.x + s.w / 2, y: s.y + s.h / 2 - r * 0.05 }
    cam.aspect = this.w / this.h
    cam.setViewOffset(this.w, this.h, this.w / 2 - this.center.x, this.h / 2 - this.center.y, this.w, this.h)
    cam.updateProjectionMatrix()
    if (!this.travel) {
      cam.position.set(0, 0, this.dist)
      cam.lookAt(0, 0, 0)
    }
  }

  setAnchorElements(els: Map<string, HTMLElement>) {
    this.anchorEls = els
  }

  /** The pill that names what she tapped, and the soft fade at the end of a flight. */
  setOverlay(label: HTMLElement | null, fade: HTMLElement | null) {
    this.labelEl = label
    this.fadeEl = fade
  }

  get calm() {
    const still = Math.abs(this.yawVel) < 0.005 && Math.abs(this.pitchVel) < 0.005 && !this.focus
    return this.mode === 'idle' && !this.dragging && still && this.marks.every((m) => m.hopT < 0) && !this.label && this.sparks.every((s) => s.age >= s.life)
  }

  update(dt: number) {
    const t = (this.time += dt)
    if (this.mode === 'intro') {
      this.introT += dt
      const k = this.introT / this.introDur
      this.yaw = this.intro.yaw0 + (this.intro.yaw1 - this.intro.yaw0) * easeOut(k)
      this.pitch = this.intro.pitch0 + (this.intro.pitch1 - this.intro.pitch0) * easeOut(k * 1.15)
      this.scale = 0.55 + 0.45 * easeOutBack(k / 0.6)
      if (k >= 1) {
        this.mode = 'idle'
        this.lastTouch = t
        if (this.start.face) this.lastTouch += 2
      }
    } else {
      this.introT += dt
      this.scale += (1 - this.scale) * (1 - Math.exp(-dt * 8))
    }
    this.glow = Math.min(1, this.glow + dt * 1.4)
    this.turn(dt)
    this.root.position.y = 0.014 * Math.sin(t * 1.1)
    this.root.scale.setScalar(this.scale)
    this.tilt.rotation.x = this.pitch
    this.spin.rotation.y = this.yaw
    this.scene.updateMatrixWorld()

    const cam = this.rig.camera.position
    this.updateMarks(dt, t, cam)
    this.updatePuffs(dt, t)
    this.updateWhale(dt, t)
    this.updateSea(dt, t)
    this.updateBalloon(dt, t)
    this.updateTravel(dt)
    this.updateSparks(dt, t)

    if (!this.hinted && !this.felt && t > 10) {
      this.hinted = true
      this.events.hint()
    }
    const g = this.globeOnScreen()
    this.sky.set(this.w, this.h, g.x, g.y, g.r, t, this.glow)
    if (this.label && t > this.label.until && !this.travel) this.label = null
  }

  /** Her spin, its coast, the idle turn and the swing to a picked place. */
  private turn(dt: number) {
    if (this.mode === 'intro' || this.dragging) return
    if (this.focus) {
      const k = 1 - Math.exp(-dt * 5.5)
      this.yaw += (this.focus.yaw - this.yaw) * k
      this.pitch += (this.focus.pitch - this.pitch) * k
      this.yawVel = this.pitchVel = 0
      return
    }
    const quiet = this.time - this.lastTouch
    // Turning by itself a while after she lets go, slowing to a stop if nobody comes back for a long time.
    const idle = quiet > SPIN.idleAfter ? SPIN.idle * (1 - smoothstep(45, 55, quiet)) : 0
    const k = 1 - Math.exp(-dt / Math.max(0.05, SPIN.coast))
    this.yawVel += (idle - this.yawVel) * k * (quiet > SPIN.idleAfter ? 0.35 : 1)
    this.pitchVel *= 1 - k
    this.yaw += this.yawVel * dt
    this.pitch += this.pitchVel * dt
    if (quiet > SPIN.idleAfter) this.pitch += (SPIN.rest * DEG - this.pitch) * (1 - Math.exp(-dt * 0.6))
    this.pitch = Math.max(-72 * DEG, Math.min(75 * DEG, this.pitch))
  }

  private updateMarks(dt: number, t: number, cam: Vector3) {
    for (const [i, m] of this.marks.entries()) {
      const since = this.introT - m.popAt
      let s = since <= 0 ? 0 : easeOutBack(since / 0.42)
      if (since > 0 && !m.popped) {
        m.popped = true
        // A rising note for each one that pops up where she can see it.
        if (this.facingCam(m.o.getWorldPosition(tmp), m.up) > 0 && this.mode === 'intro') sounds.note(Math.min(10, i + 2))
      }
      if (m.hopT >= 0) {
        m.hopT += dt
        const p = m.hopT / 0.55
        if (p >= 1) m.hopT = -1
        else s *= 1 + 0.22 * bell(p) - 0.08 * bell(Math.min(1, p * 3))
      }
      m.o.scale.setScalar(Math.max(0.0001, s))
      for (const toy of m.lm.toys) toy.update(dt, t, cam)
      const top = m.lm.top
      m.sparkles.forEach((sp, k) => {
        const a = t * 0.9 + sp.userData.phase
        sp.position.set(Math.cos(a) * 7, top + 1.5 + Math.sin(a * 1.7) * 1.6, Math.sin(a) * 7)
        sp.scale.setScalar((2.2 + 1.6 * Math.max(0, Math.sin(t * 3.1 + k * 2))) * (m.place.fresh ? 1.3 : 0.9))
      })
      if (m.flag) {
        const pos = m.flag.geo.attributes.position as BufferAttribute
        const b = m.flag.base
        for (let v = 0; v < pos.count; v++) {
          const x = b[v * 3]
          pos.setZ(v, Math.sin(x * 0.9 - t * 5 + i) * 0.38 * (x / 5.6))
        }
        pos.needsUpdate = true
      }
    }
    // Now and then a friend waves at her.
    if (Math.floor(t / 5) !== Math.floor((t - dt) / 5)) {
      const front = this.marks.filter((m) => m.lm.toys.length && this.facingCam(m.o.getWorldPosition(tmp), m.up) > 0.3)
      const m = front[Math.floor(Math.random() * front.length)]
      m?.lm.toys[Math.floor(Math.random() * m.lm.toys.length)].wave()
    }
    for (const c of this.continents.values()) {
      if (c.t < 0) continue
      c.t += dt
      const p = c.t / 0.5
      if (p >= 1) c.t = -1
      c.group.scale.setScalar(1 + 0.03 * bell(Math.min(1, p)))
    }
  }

  private updatePuffs(dt: number, t: number) {
    for (const p of this.puffs) {
      const since = this.introT - p.popAt
      let s = since <= 0 ? 0 : easeOutBack(since / 0.5)
      tmp.copy(p.base).normalize()
      p.o.position.copy(p.base).addScaledVector(tmp, 0.012 * Math.sin(t * 0.9 + p.phase))
      if (p.squash >= 0) {
        p.squash += dt
        const k = p.squash / 0.6
        if (k >= 1) p.squash = -1
        else s *= 1 + 0.25 * Math.sin(k * Math.PI * 3) * (1 - k)
      }
      p.o.scale.setScalar(Math.max(0.0001, s))
    }
  }

  private updateWhale(dt: number, t: number) {
    const w = this.whale
    let lift = 0.004 * Math.sin(t * 1.3)
    let roll = 0.05 * Math.sin(t * 0.8)
    if (w.t >= 0) {
      w.t += dt
      const k = w.t / 1.1
      if (k >= 1) w.t = -1
      else {
        lift += 0.035 * bell(Math.min(1, k * 1.6))
        roll += 0.25 * Math.sin(k * Math.PI * 2) * (1 - k)
        // The spout.
        if (Math.floor(w.t * 30) !== Math.floor((w.t - dt) * 30) && k < 0.55) {
          const at = w.o.localToWorld(tmp.set(2.5 * CM * 1.8, 6 * CM * 1.8, 0))
          this.emit(at, this.upWorld(unitAt(-36, -28, new Vector3()), new Vector3()).multiplyScalar(0.5), 0.7, 0.03, 4)
        }
      }
    }
    const up = unitAt(-36, -28)
    w.o.position.copy(up).multiplyScalar(0.998 + lift)
    w.o.quaternion.copy(w.base).multiply(tq.setFromAxisAngle(tmp.set(1, 0, 0), roll))
    w.o.scale.setScalar(Math.max(0.0001, easeOutBack((this.introT - this.introDur * 0.5) / 0.5)))
  }

  /** The islands sway, the sailboat sails round its little loop of the Pacific and rocks on the waves. */
  private updateSea(dt: number, t: number) {
    for (const [i, s] of this.isles.entries()) {
      let k = 1 + 0.02 * Math.sin(t * 1.4 + i)
      if (s.t >= 0) {
        s.t += dt
        const p = s.t / 0.5
        if (p >= 1) s.t = -1
        else k *= 1 + 0.25 * bell(p)
      }
      s.o.scale.setScalar(Math.max(0.0001, k * easeOutBack((this.introT - this.introDur * (0.35 + i * 0.05)) / 0.45)))
    }
    const b = this.boat
    b.a += dt * 0.035
    let hop = 0
    if (b.t >= 0) {
      b.t += dt
      const p = b.t / 0.7
      if (p >= 1) b.t = -1
      else hop = bell(p)
    }
    const lat = -8 + 9 * Math.sin(b.a)
    const lon = -128 + 16 * Math.cos(b.a)
    standAt(b.o, lat, lon, 1.002 + hop * 0.03, Math.atan2(Math.cos(b.a) * 9, -Math.sin(b.a) * 16) + Math.PI / 2)
    b.o.rotateX(0.06 * Math.sin(t * 2.1) + hop * 0.3)
    b.o.scale.setScalar(Math.max(0.0001, easeOutBack((this.introT - this.introDur * 0.55) / 0.45)))
  }

  /** The balloon goes round on a tilted ring, rising and falling a little; when she picks a place it flies over it. */
  private orbitAt(a: number, out: Vector3) {
    const r = 1.58
    out.set(Math.cos(a) * r, 0, Math.sin(a) * r)
    out.applyAxisAngle(tmp2.set(1, 0, 0.35).normalize(), -0.42)
    out.y += 0.05 * Math.sin(this.time * 1.3)
    return out
  }

  private updateBalloon(dt: number, t: number) {
    const b = this.balloon
    const o = b.o
    if (b.mode === 'orbit') {
      b.a += dt * 0.16
      const goal = this.orbitAt(b.a, tmp)
      if (this.mode === 'intro') {
        // It sails in from the top right as the globe arrives.
        const k = easeOut(this.introT / (this.introDur * 0.9))
        o.position.set(2.8, 2.2, 1.2).lerp(goal, k)
      } else o.position.lerp(goal, 1 - Math.exp(-dt * 3))
    } else if (this.travel) {
      b.t += dt
      const m = this.travel.mark
      // Above it and a little to the east, so it never hides the landmark.
      const n = this.upWorld(m.up, tmp2)
      const above = this.markTop(m, tmp).addScaledVector(n, 0.2)
      above.x += 0.16
      const k = smoothstep(0.1, 1.45, b.t)
      o.position.lerpVectors(b.from, above, k).addScaledVector(n, Math.sin(k * Math.PI) * 0.35)
      // A trail of sparkles behind it while it flies.
      if (k > 0 && k < 1 && Math.floor(b.t * 24) !== Math.floor((b.t - dt) * 24)) this.emit(tmp.copy(o.position).setY(o.position.y - 0.12), new Vector3(0, -0.05, 0), 0.7, 0.04, 1)
    }
    let bob = 0
    if (b.bounce >= 0) {
      b.bounce += dt
      const k = b.bounce / 0.8
      if (k >= 1) b.bounce = -1
      else bob = bell(k)
    }
    o.position.y += bob * 0.12
    o.rotation.set(0.06 * Math.sin(t * 1.7), b.a * 0.4 + bob * Math.PI * 2, 0.05 * Math.sin(t * 1.2))
  }

  private latLon(v: Vector3): [number, number] {
    const { lat, lon } = latLonOf(v)
    return [lat, lon]
  }

  /** Where a landmark's top is now, in the world. */
  private markTop(m: Mark, out: Vector3) {
    return m.lm.group.localToWorld(out.set(0, m.lm.top * 0.62, 0))
  }

  private updateTravel(dt: number) {
    const cam = this.rig.camera
    const tr = this.travel
    if (!tr) {
      if (this.fadeEl && this.fadeEl.style.opacity !== '0') this.fadeEl.style.opacity = '0'
      return
    }
    tr.t += dt
    const target = this.markTop(tr.mark, new Vector3())
    const z = smoothstep(1.15, TRAVEL_S, tr.t) ** 1.6
    const home = tmp.set(0, 0, this.dist)
    const near = tmp2.copy(target).add(new Vector3(0, 0, 0.62))
    cam.position.lerpVectors(home, near, z)
    cam.lookAt(new Vector3().lerpVectors(new Vector3(), target, Math.min(1, z * 1.4)))
    if (this.fadeEl) this.fadeEl.style.opacity = smoothstep(1.9, TRAVEL_S, tr.t).toFixed(3)
    if (tr.t >= TRAVEL_S && !tr.done) {
      tr.done = true
      this.events.arrive(tr.mark.place.goes)
    }
  }

  private emit(at: Vector3, v: Vector3, life: number, size: number, n: number) {
    for (let i = 0; i < n; i++) {
      const s = this.sparks[this.sparkIdx]
      this.sparkIdx = (this.sparkIdx + 1) % this.sparks.length
      s.s.position.copy(at)
      s.v.copy(v).add(tmp.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(v.length() * 0.9 + 0.3))
      s.life = life * (0.7 + Math.random() * 0.5)
      s.age = 0
      s.size = size * (0.7 + Math.random() * 0.7)
      s.s.visible = true
    }
  }

  private updateSparks(dt: number, t: number) {
    for (const s of this.sparks) {
      if (s.age >= s.life) continue
      s.age += dt
      if (s.age >= s.life) {
        s.s.visible = false
        continue
      }
      const k = s.age / s.life
      s.v.multiplyScalar(Math.exp(-dt * 2.4))
      s.s.position.addScaledVector(s.v, dt)
      s.s.scale.setScalar(s.size * Math.sin(Math.min(1, k * 4) * Math.PI * 0.5) * (1 - k * k))
    }
    for (const s of this.twinkles) s.scale.setScalar(s.userData.size * (0.35 + 0.65 * Math.max(0, Math.sin(t * 1.8 + s.userData.phase))) * this.glow)
    for (const r of this.ripples) {
      if (r.t < 0) continue
      r.t += dt
      const k = r.t / 0.9
      if (k >= 1) {
        r.t = -1
        r.m.visible = false
        continue
      }
      const up = r.m.userData.up as Vector3
      const size = (r.m.userData.size as number) ?? 1
      r.m.position.copy(up).multiplyScalar(size > 1 ? this.groundAt(...this.latLon(up)) + 0.003 : 1.003)
      r.m.scale.setScalar((0.015 + 0.075 * easeOut(k)) * size)
      r.mat.opacity = 0.85 * (1 - k)
    }
  }

  render() {
    this.renderer.render(this.scene, this.rig.camera)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  // ---------------------------------------------------------------- where things are on screen

  private toScreen(v: Vector3) {
    const p = tmp2.copy(v).project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }

  /** The globe's middle on screen and its radius in pixels. */
  private globeOnScreen() {
    const cam = this.rig.camera
    const c = this.toScreen(this.root.getWorldPosition(tmp))
    const e = this.toScreen(tmp.copy(this.root.position).add(new Vector3(1, 0, 0).applyQuaternion(cam.quaternion).multiplyScalar(this.scale)))
    return { x: c.x, y: c.y, r: Math.max(1, Math.hypot(e.x - c.x, e.y - c.y)) }
  }

  /** A globe-local direction, turned the way the globe is now. */
  private upWorld(up: Vector3, out: Vector3) {
    return out.copy(up).applyQuaternion(this.spin.getWorldQuaternion(tq))
  }

  /** How squarely something standing at `at` (world) with globe-local `up` faces the camera (1 = straight at her). */
  private facingCam(at: Vector3, up: Vector3) {
    const n = this.upWorld(up, tmp2)
    return n.dot(new Vector3().subVectors(this.rig.camera.position, at).normalize())
  }

  // ---------------------------------------------------------------- her finger

  pointerDown(x: number, y: number) {
    this.lastTouch = this.time
    this.felt = true
    if (this.mode === 'travel') return
    // (A tap doesn't stop the arrival spin; grabbing it and turning it does, in pointerMove.)
    this.dragging = true
    this.last = { x, y, t: performance.now() }
    this.vYaw = this.vPitch = 0
  }

  pointerMove(x: number, y: number, _dx: number, _dy: number, held: boolean) {
    if (!held || !this.dragging || this.mode === 'travel') return
    this.lastTouch = this.time
    const now = performance.now()
    const dt = Math.max(1, now - this.last.t) / 1000
    const mx = x - this.last.x
    const my = y - this.last.y
    this.last = { x, y, t: now }
    if (!mx && !my) return
    this.focus = null
    this.endIntro()
    const k = SPIN.grip / this.globeOnScreen().r
    const yawStep = mx * k
    const before = this.pitch
    this.yaw += yawStep
    this.pitch = Math.max(-72 * DEG, Math.min(75 * DEG, this.pitch + my * k))
    const smoothing = SPIN.flick > 0 ? 1 - Math.exp(-dt / SPIN.flick) : 1
    this.vYaw += (yawStep / dt - this.vYaw) * smoothing
    this.vPitch += ((this.pitch - before) / dt - this.vPitch) * smoothing
  }

  pointerUp() {
    if (!this.dragging) return
    this.dragging = false
    // A finger that stopped before letting go doesn't flick.
    if (performance.now() - this.last.t > 90) this.vYaw = this.vPitch = 0
    const max = SPIN.maxSpin
    this.yawVel = Math.max(-max, Math.min(max, this.vYaw))
    this.pitchVel = Math.max(-max, Math.min(max, this.vPitch)) * 0.6
    if (Math.abs(this.yawVel) > 2.5) sfx.fwip()
  }

  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.touches++
    if (this.mode === 'travel') {
      // A tap while flying: there already.
      if (this.travel && !this.travel.done) {
        this.travel.done = true
        this.events.arrive(this.travel.mark.place.goes)
      }
      return
    }
    const hit = id ?? this.pick(x, y)
    if (!hit) return this.skyTap(x, y)
    if (hit.startsWith('place:') || hit.startsWith('mark:')) {
      const anchor = hit.replace(/^mark:/, '')
      const m = this.marks.find((mk) => mk.place.anchor === anchor)
      if (m) this.go(m)
    } else if (hit.startsWith('cont:') || hit.startsWith('land:')) this.continentTap(hit.slice(5) as ContinentKey)
    else if (hit === 'ocean') this.oceanTap()
    else if (hit === 'ice') {
      // The Arctic's sea ice: a crackle and a puff of icy sparkles.
      if (this.lastIce) this.emit(this.lastIce, new Vector3(0, 0.2, 0.15), 0.6, 0.04, 7)
      sfx.crack()
      this.events.poke('ice')
    }
    else if (hit === 'whale') this.whaleTap()
    else if (hit === 'balloon') {
      this.balloon.bounce = 0
      sounds.sparkle()
      this.events.poke('balloon')
    } else if (hit.startsWith('isle:')) {
      const s = this.isles[+hit.slice(5)]
      if (s) s.t = 0
      sfx.boing()
      this.events.poke('island')
    } else if (hit === 'boat') {
      this.boat.t = 0
      sfx.splash()
      tone(392, 392, 0.22, 0.06, 'triangle', 0.05)
      tone(523, 523, 0.3, 0.06, 'triangle', 0.25)
      this.events.poke('boat')
    } else if (hit.startsWith('cloud:')) {
      const p = this.puffs[+hit.slice(6)]
      if (p) p.squash = 0
      sfx.boing()
      this.events.poke('cloud')
    }
  }

  /** What's under a screen point: a tag (`mark:<anchor>`, `land:<continent>`, `ocean`, `cloud:<i>`, `whale`, `balloon`). */
  private pick(x: number, y: number) {
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    const hits = this.raycaster.intersectObjects(this.pickables, true)
    for (const h of hits) {
      if (h.object instanceof Sprite) continue
      const tag = h.object.userData.tag as string | undefined
      if (!tag) continue
      if (tag.startsWith('land:')) {
        const local = this.spin.worldToLocal(h.point.clone())
        const { lat, lon } = latLonOf(local)
        const c = continentAt(lon, lat)
        // The Arctic's sea ice isn't a continent (it shares Antarctica's group only for its look).
        if (!c && lat > 60) {
          this.lastIce = h.point.clone()
          return 'ice'
        }
        return `land:${c ?? tag.slice(5)}`
      }
      if (tag === 'ocean') {
        this.lastSea = this.spin.worldToLocal(h.point.clone()).normalize()
        return 'ocean'
      }
      return tag
    }
    return null
  }
  private go(m: Mark) {
    if (this.travel) return
    this.endIntro()
    this.mode = 'travel'
    this.dragging = false
    this.travel = { mark: m, t: 0, done: false }
    this.focus = this.facing(m.place.lat, m.place.lon, SPIN.focus)
    m.hopT = 0
    for (const toy of m.lm.toys) toy.hop(true)
    this.ripple(m.up, 1.5)
    this.balloon.mode = 'fly'
    this.balloon.t = 0
    this.balloon.from.copy(this.balloon.o.position)
    this.label = { text: m.place.label, at: () => m.lm.group.localToWorld(new Vector3(0, m.lm.top * 1.12, 0)), until: Infinity }
    sounds.sparkle()
    this.emit(this.markTop(m, new Vector3()), new Vector3(0, 0.25, 0.2), 0.8, 0.05, 12)
    this.events.pick(m.place.goes)
  }

  private continentTap(key: ContinentKey) {
    const group = this.continents.get(key === 'europe' ? 'asia' : key) ?? this.continents.get(key)
    // Europe's and Asia's land is one piece (and Europe's own islands are another): both pop.
    if (key === 'europe') this.continents.get('europe')!.t = 0
    if (group) group.t = 0
    sfx.pop()
    const spot = CONTINENT_SPOTS[key]
    const at = () => this.spin.localToWorld(unitAt(spot.lat, spot.lon, new Vector3()).multiplyScalar(1.05))
    this.label = { text: `${WORLD_LINES.continents[key].split('!')[0]}!`, at, until: this.time + 2.4 }
    this.events.continent(key)
  }

  /** A ring spreading over the globe from a spot (globe-local), `size` times a splash's. */
  private ripple(up: Vector3, size = 1) {
    const r = this.ripples[this.rippleIdx]
    this.rippleIdx = (this.rippleIdx + 1) % this.ripples.length
    r.t = 0
    r.m.visible = true
    r.m.userData.up = up.clone()
    r.m.userData.size = size
    r.m.quaternion.copy(frame(up))
  }

  private oceanTap() {
    const up = this.lastSea
    if (up) {
      this.ripple(up)
      const world = this.spin.localToWorld(up.clone().multiplyScalar(1.01))
      this.emit(world, this.upWorld(up, new Vector3()).multiplyScalar(0.35), 0.55, 0.025, 6)
    }
    sfx.splash()
    this.events.poke('ocean')
  }

  private whaleTap() {
    this.whale.t = 0
    sfx.splash()
    tone(520, 760, 0.25, 0.05, 'sine', 0.15)
    this.events.poke('whale')
  }

  /** The empty sky: a burst of sparkles where she tapped, and a twinkly note. */
  private skyTap(x: number, y: number) {
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    const d = this.raycaster.ray.direction
    const at = this.raycaster.ray.origin.clone().addScaledVector(d, (this.dist - 0.4) / Math.max(0.2, -d.z))
    this.emit(at, new Vector3(0, 0, 0), 0.75, 0.06, 9)
    ;[0, 0.08, 0.16].forEach((dl, i) => tone(880 * 1.26 ** i, 880 * 1.26 ** i, 0.35, 0.04, 'sine', dl))
    this.events.poke('sky')
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const g = this.globeOnScreen()
    const flying = this.mode === 'travel'
    for (const [id, el] of this.anchorEls) {
      let spot: { x: number; y: number; size: number; z: number } | null = null
      if (!flying && id.startsWith('place:')) {
        const m = this.marks.find((mk) => mk.place.anchor === id)
        if (m && m.o.scale.x > 0.5) {
          const at = m.lm.group.localToWorld(tmp.set(0, m.lm.top * 0.45, 0))
          const f = this.facingCam(at, m.up)
          const p = this.toScreen(at)
          if (f > 0.04) spot = { x: p.x, y: p.y, size: Math.max(min, g.r * 0.4), z: 6000 + Math.round(f * 100) }
        }
      } else if (!flying && id.startsWith('cont:')) {
        const s = CONTINENT_SPOTS[id.slice(5) as ContinentKey]
        const at = this.spin.localToWorld(unitAt(s.lat, s.lon, tmp).multiplyScalar(1.04))
        const f = this.facingCam(at, unitAt(s.lat, s.lon, new Vector3()))
        const p = this.toScreen(at)
        if (f > 0.15) spot = { x: p.x, y: p.y, size: Math.max(min, g.r * 0.22), z: 3000 }
      } else if (!flying && id === 'balloon') {
        const p = this.toScreen(this.balloon.o.getWorldPosition(tmp))
        const behind = this.balloon.o.position.z < 0 && Math.hypot(p.x - g.x, p.y - g.y) < g.r
        if (!behind && this.mode !== 'intro') spot = { x: p.x, y: p.y + g.r * 0.04, size: Math.max(min, g.r * 0.34), z: 7000 }
      } else if (!flying && id === 'whale') {
        const at = this.whale.o.getWorldPosition(tmp)
        const f = this.facingCam(at, unitAt(-36, -28, new Vector3()))
        const p = this.toScreen(at)
        if (f > 0.25) spot = { x: p.x, y: p.y, size: Math.max(min, g.r * 0.2), z: 5000 }
      }
      const show = !!spot && spot.x > -spot.size / 2 && spot.x < this.w + spot.size / 2 && spot.y > -spot.size / 2 && spot.y < this.h + spot.size / 2
      if (show && spot) {
        el.style.transform = `translate3d(${(spot.x - spot.size / 2).toFixed(1)}px, ${(spot.y - spot.size / 2).toFixed(1)}px, 0)`
        el.style.width = el.style.height = `${spot.size.toFixed(0)}px`
        el.style.zIndex = String(spot.z)
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
    // The name pill over whatever she tapped.
    const lab = this.labelEl
    if (lab) {
      if (this.label) {
        const p = this.toScreen(this.label.at())
        if (lab.textContent !== this.label.text) lab.textContent = this.label.text
        // Kept on screen (a continent near the edge of a phone).
        const half = lab.offsetWidth / 2 + 10
        const x = Math.max(half, Math.min(this.w - half, p.x))
        const y = Math.max(this.top + lab.offsetHeight + 8, p.y - 18)
        lab.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`
        if (lab.style.opacity !== '1') lab.style.opacity = '1'
      } else if (lab.style.opacity !== '0') lab.style.opacity = '0'
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const front = [...this.marks]
      .map((m) => ({ id: m.place.anchor, f: this.facingCam(m.o.getWorldPosition(new Vector3()), m.up) }))
      .sort((a, b) => b.f - a.f)
    return {
      mode: this.mode,
      yaw: Math.round(((this.yaw / DEG) % 360) * 10) / 10,
      pitch: Math.round(this.pitch / DEG),
      spin: +this.yawVel.toFixed(2),
      dragging: this.dragging,
      flyingTo: this.travel?.mark.place.goes ?? null,
      front: front.slice(0, 3).map((f) => f.id),
      popped: this.marks.filter((m) => m.o.scale.x > 0.9).length,
      places: this.marks.length,
      touches: this.touches,
      tris: this.weigh(),
    }
  }

  /** Triangles by part (QA: what the globe costs to draw). */
  private weigh() {
    const out: Record<string, number> = {}
    this.scene.traverse((o) => {
      const m = o as Mesh
      if (!m.isMesh || !m.geometry) return
      const g = m.geometry
      const n = (g.index ? g.index.count : g.attributes.position.count) / 3
      const k = (m as unknown as { count?: number }).count ?? 1
      let tag = 'other'
      for (let p: Object3D | null = o; p; p = p.parent) if (p.userData.tag) tag = String(p.userData.tag).split(':')[0] + (String(p.userData.tag).startsWith('mark') ? `:${String(p.userData.tag).split(':')[2]}` : '')
      if (tag === 'other' && m.parent && (m as unknown as { isInstancedMesh?: boolean }).isInstancedMesh) tag = 'scenery'
      out[tag] = Math.round((out[tag] ?? 0) + n * k)
    })
    return out
  }

  memory() {
    return { ...this.renderer.info.memory }
  }

  dispose() {
    this.scene.clear()
    this.sky.dispose()
    this.bag.dispose()
  }
}

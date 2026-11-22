// The goodbye of the Poles' new ending (planning/around-the-world/poles-ending.md): Pola has her pebble, and she flies
// home in Sparkle's balloon, up the toy globe from the bottom of the world to the top, where Mama Bear is waiting.
// Terry asks the old quiz's first question ("Where do polar bears live?") and she answers by flying there.
//
// The verb is Act 1's (fly.ts): hold anywhere and the balloon rises, let go and it sinks. Up high the pink wind carries
// it north fast along Terry's way (party/route.ts, run backwards: from Pebble's colony, over the countries in her
// passport, to the North Pole); down low it creeps. The globe turns under it, so the balloon stays at the top of the
// picture and the world goes by beneath. About forty seconds and ten holds. Over the warm middle Pola melts again
// (a joke now). Poke the pebble in Pola's paws: a fact. Never fails: it always creeps north.
// Built for engine3d/View3D.tsx; the feel shares Act 1's knobs where it can (`goodbyeFly` here, in globe units).
import { AdditiveBlending, Color, DoubleSide, Group, Matrix4, Mesh, Quaternion, RingGeometry, Scene, ShaderMaterial, SphereGeometry, Sprite, SpriteMaterial, Vector3, type BufferGeometry, type WebGLRenderer } from 'three'
import { clamp, type Line } from '../../../../../sdk'
import { DEG, smoothstep } from '../../../../../sdk/math'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import { buildAnimal } from '../../../../engine3d/characters/animal'
import { CameraRig, type Shot } from '../../../../engine3d/camera'
import { Bag } from '../../../../engine3d/dispose'
import { P } from '../../../../engine3d/geo'
import { makeHull, setOutlineResolution } from '../../../../engine3d/outline'
import { makeLights } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import { knobs, watch } from '../../../../kit/knobs'
import { POLES_LOOKS } from '../../characters/looks'
import { earthTexture } from '../../globe/earth'
import { buildNorth, buildSouth, Critter, makePola, standOn, type EarthKit, type Floe } from '../../globe/globe'
import { globeMaterials } from '../../globe/material'
import { L } from '../../lines'
import { glowTexture } from '../../look/sprites'
import { Balloon } from '../../story/props'
import { latOf, point, Route } from '../party/route'
import type { TalkKind } from './chorus'
import { flySfx } from './sounds'

const FILE = 'src/world/places/poles/activities/night/goodbye.ts'
/** The goodbye flight's feel, in the toy globe's units (it is 1 round). */
const FLY = knobs('goodbyeFly', 'Goodbye: fly Pola home', FILE, {
  lift: { value: 0.11, min: 0.02, max: 0.4, step: 0.005, label: 'Rise', unit: '/s', note: 'how fast the balloon climbs while she holds', main: true },
  sink: { value: 0.05, min: 0.01, max: 0.2, step: 0.005, label: 'Sink', unit: '/s', main: true },
  pink: { value: 5.5, min: 1, max: 20, step: 0.5, label: 'Pink wind (north)', unit: '°/s', note: 'how fast the high wind carries the balloon up the globe', main: true },
  crawl: { value: 1.6, min: 0.3, max: 6, step: 0.1, label: 'Slowest drift', unit: '°/s' },
  pinkLow: { value: 0.16, min: 0.08, max: 0.3, step: 0.005, label: 'Pink wind from', note: 'height over the globe' },
  pinkHigh: { value: 0.26, min: 0.12, max: 0.4, step: 0.005, label: 'Pink wind to' },
}, { sections: ['goodbye'] })

export interface GoodbyeStart {
  visited: string[]
}
export interface GoodbyeEvents {
  talk(line: Line, kind: TalkKind, key?: string): void
  hint(line: Line | null): void
  /** Home: Mama has her cub. On to the last film. */
  done(): void
}

const G = L.night.goodbye
const F = L.night.fly
/** The balloon on the toy globe: its size, its lowest and highest (its basket over the sea). */
const B_SCALE = 0.032
const LOW = 0.012
const HIGH = 0.33
const HINT_S = 8

export const GOODBYE_ANCHORS: AnchorInfo[] = [
  { id: 'balloon', label: "Sparkle's balloon, with Pola", kind: 'thing' },
  { id: 'pebble', label: "Pola's pebble", kind: 'thing' },
  { id: 'mama', label: 'Mama Bear', kind: 'thing' },
]

const RIBBON_FS = /* glsl */ `
  uniform vec3 uCol;
  uniform float uShift;
  uniform float uLit;
  varying vec2 vP;
  void main() {
    float r = length(vP);
    float ang = atan(vP.y, vP.x);
    float row = fract((r - 1.0) * 60.0);
    float line = smoothstep(0.35, 0.5, row) * smoothstep(0.65, 0.5, row);
    float dash = smoothstep(0.0, 0.2, fract(ang * 14.0 + uShift)) * smoothstep(0.65, 0.45, fract(ang * 14.0 + uShift));
    float a = 0.14 + 0.08 * uLit + line * dash * (0.55 + 0.4 * uLit);
    gl_FragColor = vec4(uCol, a);
    #include <colorspace_fragment>
  }`
const RIBBON_VS = /* glsl */ `
  varying vec2 vP;
  void main() {
    vP = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`

const tmp = new Vector3()
const tmp2 = new Vector3()
const tq = new Quaternion()
const tm = new Matrix4()
const rp = point()

export class GoodbyeWorld implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private earth = new Group()
  private floes: Floe[] = []
  private route: Route
  private s = 0
  private alt = 0.04
  private vy = 0
  private balloon: Balloon
  private balloonG = new Group()
  private flame: Mesh
  private pola: Critter
  private pebbleStone: Mesh
  private mama: Critter
  private terry: Critter
  private pinkMat: ShaderMaterial
  private pink: Mesh
  private glow: Sprite
  private sky = new Color('#2E2C6E')
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private anchorEls = new Map<string, HTMLElement>()
  private unwatch: () => void
  private stops: (() => void)[] = []
  private later: { at: number; fn: () => void }[] = []

  private held = false
  private lastHold = 0
  private warmSaid = false
  private home = false
  private poked = new Set<string>()
  private counts = { holds: 0, taps: 0, pokes: 0 }

  constructor(
    private renderer: WebGLRenderer,
    start: GoodbyeStart,
    private events: GoodbyeEvents,
  ) {
    makeLights(this.scene)
    this.scene.background = this.sky
    this.rig.fov = 36
    this.rig.lag = 0.4
    this.rig.camera.near = 0.01
    const { bag } = this
    const mats = bag.add(globeMaterials(bag.add(earthTexture())))
    mats.sun.set(0.25, 1, 0.55).normalize()
    this.scene.add(this.earth)
    const sphere = bag.add(new SphereGeometry(1, 96, 64))
    const hull = makeHull(sphere, 3)
    bag.add(hull.geometry)
    this.earth.add(new Mesh(sphere, mats.land), hull)
    const prop = (geometry: BufferGeometry, px = 2) => {
      const g = new Group()
      g.add(new Mesh(bag.add(geometry), mats.props))
      if (px > 0) {
        const h = makeHull(geometry, px)
        bag.add(h.geometry)
        g.add(h)
      }
      return g
    }
    const kit: EarthKit = { spin: this.earth, bag, prop }
    this.floes = buildNorth(kit).floes
    buildSouth(kit)
    this.route = new Route(start.visited)

    // Mama Bear on the ice at the top of the world, waiting.
    this.mama = new Critter(0.13)
    this.mama.dress(buildAnimal({ ...POLES_LOOKS.mama, height: 0.13 }, bag), 'mama')
    standOn(this.mama.root, 88, -20, 1.022)
    this.earth.add(this.mama.root)

    // The balloon, with Pola in the basket holding her pebble.
    this.balloon = new Balloon(bag)
    this.balloon.root.scale.setScalar(B_SCALE)
    this.balloonG.add(this.balloon.root)
    this.scene.add(this.balloonG)
    this.pola = makePola(kit, 'pola')
    this.pola.root.scale.setScalar(1.25 / this.pola.height)
    this.pola.root.position.set(0, 0.42, 0.25)
    this.balloon.basket.add(this.pola.root)
    this.pebbleStone = new Mesh(bag.add(P.sphere(0.13, '#9A98AE', { scale: [1.2, 0.8, 1] }, 12)), mats.props)
    this.pebbleStone.position.set(0, 0.75, 0.52)
    this.balloon.basket.add(this.pebbleStone)
    this.flame = new Mesh(bag.add(P.cone(0.2, 0.75, '#FFB347', { at: [0, 0.38, 0] }, 10)), mats.props)
    this.flame.position.set(0, 1.05, 0)
    this.flame.visible = false
    this.balloon.basket.add(this.flame)
    // Terry flies alongside.
    this.terry = new Critter(0.05)
    this.terry.dress(buildAnimal({ ...POLES_LOOKS.terry, height: 0.05 }, bag), 'terry')
    this.scene.add(this.terry.root)

    // The pink wind: a band of streaks round the top of the globe at its height.
    this.pinkMat = bag.add(new ShaderMaterial({ uniforms: { uCol: { value: new Color('#FF6FAE') }, uShift: { value: 0 }, uLit: { value: 0 } }, vertexShader: RIBBON_VS, fragmentShader: RIBBON_FS, transparent: true, depthWrite: false, side: DoubleSide }))
    this.pink = new Mesh(bag.add(new RingGeometry(1, 1.1, 96, 1, Math.PI * 0.2, Math.PI * 0.6)), this.pinkMat)
    this.pink.position.z = -0.06
    this.scene.add(this.pink)
    this.glow = new Sprite(bag.add(new SpriteMaterial({ map: bag.add(glowTexture()), transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, color: '#FFD45E' })))
    this.scene.add(this.glow)

    this.s = 0
    this.orient(1)
    this.stops.push(flySfx.wind())
    this.at(0.6, () => this.events.talk(G.ask, 'friend'))
    this.at(3.4, () => {
      this.events.hint(F.start)
      this.events.talk(F.start, 'cue')
    })
    this.unwatch = watch('goodbyeFly', () => ({ height: [this.alt, HIGH], 'north speed': [this.speed(), FLY.pink] }))
  }

  private at(sec: number, fn: () => void) {
    this.later.push({ at: this.time + sec, fn })
  }

  /** The Earth turned so the point `s` back along Terry's way is under the balloon and the way north runs to the
   *  right across the screen. */
  private orient(k: number) {
    this.route.at(this.route.length - this.s, rp)
    // (North is backward along the route.)
    tmp.copy(rp.t).negate()
    tm.makeBasis(tmp, rp.p, tmp2.crossVectors(tmp, rp.p).normalize())
    tq.setFromRotationMatrix(tm).invert()
    this.earth.quaternion.slerp(tq, k)
  }

  private inPink() {
    return smoothstep(FLY.pinkLow - 0.02, FLY.pinkLow + 0.015, this.alt) * (1 - smoothstep(FLY.pinkHigh - 0.015, FLY.pinkHigh + 0.03, this.alt))
  }
  private speed() {
    return FLY.crawl + (FLY.pink - FLY.crawl) * this.inPink()
  }

  update(dt: number) {
    const t = (this.time += dt)
    if (this.later.length) {
      const due = this.later.filter((l) => l.at <= t)
      this.later = this.later.filter((l) => l.at > t)
      due.forEach((l) => l.fn())
    }
    // Up while she holds, down when she lets go; north at the wind's speed.
    const want = this.home ? -FLY.sink : this.held ? FLY.lift : -FLY.sink
    this.vy += (want - this.vy) * Math.min(1, dt * 2.2)
    this.alt = clamp(this.alt + this.vy * dt, LOW, HIGH)
    if (!this.home) this.s = Math.min(this.route.length, this.s + this.speed() * DEG * dt)
    this.orient(1 - Math.exp(-dt * 3))
    const lat = latOf(this.route.at(this.route.length - this.s, rp).p)
    if (!this.warmSaid && lat > -12) {
      this.warmSaid = true
      this.pola.hop()
      this.events.talk(F.warm, 'friend')
    }
    if (!this.home && this.s >= this.route.length - 0.5 * DEG) this.arrive()
    if (this.held) flySfx.burner()
    this.flame.visible = this.held
    // The balloon at the top of the globe; the friends turn to the camera.
    this.balloonG.position.set(0, 1 + this.alt, 0)
    this.balloonG.rotation.z = -this.vy * 0.8
    this.balloon.update(dt, t)
    const cam = this.rig.camera.position
    this.pola.update(dt, t, cam)
    this.mama.update(dt, t, cam)
    this.terry.update(dt, t, cam)
    this.terry.root.position.set(0.16 + Math.sin(t * 0.7) * 0.02, 1 + (FLY.pinkLow + FLY.pinkHigh) / 2 + Math.sin(t * 1.3) * 0.01, 0.05)
    this.terry.root.rotation.set(0, 0, -0.2)
    for (const f of this.floes) f.o.position.copy(f.dir).multiplyScalar(1.004 + 0.004 * Math.sin(t * 1.4))
    // The pink wind's band.
    const g = this.pink.geometry as RingGeometry
    if (g.parameters.innerRadius !== 1 + FLY.pinkLow || g.parameters.outerRadius !== 1 + FLY.pinkHigh) {
      this.pink.geometry.dispose()
      this.pink.geometry = new RingGeometry(1 + FLY.pinkLow, 1 + FLY.pinkHigh, 96, 1, Math.PI * 0.2, Math.PI * 0.6)
    }
    this.pinkMat.uniforms.uShift.value += dt * this.speed() * 0.1
    this.pinkMat.uniforms.uLit.value = this.inPink()
    // Dark at the bottom of the world, the morning coming as she flies north.
    const k = clamp((lat + 70) / 140)
    this.sky.set('#2E2C6E').lerp(tmpC.set('#F3E6FF'), smoothstep(0, 0.5, k))
    // Stuck: the balloon glows.
    const stuck = !this.held && !this.home && t - this.lastHold > HINT_S
    this.glow.position.set(0, 1 + this.alt + 0.09, 0.02)
    this.glow.scale.setScalar(0.32)
    this.glow.material.opacity = this.held ? 0.2 : stuck ? 0.3 + 0.15 * Math.sin(t * 5) : 0
    this.rig.setShot(this.shot())
    this.rig.update(dt)
  }

  /** Home: the balloon comes down beside Mama. */
  private arrive() {
    this.home = true
    this.held = false
    this.events.hint(null)
    flySfx.hug()
    this.mama.hop(true)
    this.at(0.4, () => this.events.talk(G.back, 'friend'))
    this.at(3.2, () => (this.pola.hop(true), this.events.talk(G.home, 'friend')))
    this.at(6.4, () => this.events.done())
  }

  private shot(): Shot {
    const y = 1 + clamp(this.alt, 0.08, 0.2)
    return this.tall ? { center: new Vector3(0.05, y, 0), half: new Vector3(0.2, 0.2, 0.05), yaw: 0, pitch: 6 } : { center: new Vector3(0.06, y, 0), half: new Vector3(0.3, 0.16, 0.05), yaw: 0, pitch: 6 }
  }

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

  pointerDown() {
    if (this.home) return
    this.held = true
    this.lastHold = this.time
    this.counts.holds++
    this.events.hint(null)
  }
  pointerMove() {}
  pointerUp() {
    if (this.held) this.lastHold = this.time
    this.held = false
    if (!this.home) this.events.hint(F.stuck)
  }

  private toScreen(v: Vector3) {
    const p = tmp2.copy(v).project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }
  private spotOf(id: string) {
    const min = Math.min(this.w, this.h) < 500 ? 32 : 44
    const at = (v: Vector3, r: number) => {
      const c = this.toScreen(v)
      const e = this.toScreen(tmp.copy(v).add(tmp2.set(r, 0, 0)))
      return { ...c, r: Math.max(min, Math.abs(e.x - c.x)) }
    }
    if (id === 'balloon') return at(new Vector3(0, 1 + this.alt + 0.1, 0), 0.06)
    if (id === 'pebble') return at(this.pebbleStone.getWorldPosition(new Vector3()), 0.012)
    if (id === 'mama') {
      const p = this.mama.center(new Vector3())
      return p.y > 0.6 && p.z > -0.3 ? at(p, 0.04) : null
    }
    return null
  }

  tap(x: number, y: number, id?: string) {
    this.counts.taps++
    let what = id
    if (!what) {
      for (const a of GOODBYE_ANCHORS) {
        const s = this.spotOf(a.id)
        if (s && Math.hypot(x - s.x, y - s.y) < s.r) what = a.id
      }
    }
    if (what === 'pebble') {
      this.counts.pokes++
      this.poked.add('pebble')
      this.pola.hop()
      return this.events.talk(G.pebbleFact, 'fact', 'pebble')
    }
    if (what === 'mama') {
      this.poked.add('mama')
      this.mama.hop(true)
      return
    }
    if (what === 'balloon') {
      this.poked.add('balloon')
      this.pola.hop(true)
      return this.events.talk(L.party.balloon[0], 'friend')
    }
  }

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    for (const [id, el] of this.anchorEls) {
      const spot = this.spotOf(id)
      const show = !!spot && spot.z < 1
      if (show && spot) {
        const d = Math.max(min, spot.r * 2)
        el.style.transform = `translate3d(${(spot.x - d / 2).toFixed(1)}px, ${(spot.y - d / 2).toFixed(1)}px, 0)`
        el.style.width = el.style.height = `${d.toFixed(0)}px`
        el.style.borderRadius = '50%'
        el.style.zIndex = id === 'pebble' ? '1000' : '500'
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
  }

  qa() {
    const lat = latOf(this.route.at(this.route.length - this.s, rp).p)
    const b = this.spotOf('balloon')
    return { ...this.counts, section: 'goodbye', lat: Math.round(lat), along: +(this.s / this.route.length).toFixed(2), alt: +this.alt.toFixed(3), held: this.held, home: this.home, poked: [...this.poked], time: +this.time.toFixed(1), balloon: b && { x: Math.round(b.x), y: Math.round(b.y) } }
  }
  memory() {
    return { ...this.renderer.info.memory }
  }
  dispose() {
    for (const s of this.stops) s()
    this.unwatch()
    this.scene.clear()
    this.bag.dispose()
  }
}

const tmpC = new Color()

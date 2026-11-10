// The world board in 3D (#/world, the app's home): a toy map of the whole world on a tray. The continents are low
// pastel land in a foaming sea; her countries stand up out of them in their real shapes, each with a toy animal riding
// a pin over it. Tap an animal (or its country) and Sparkle's balloon flies there while the camera swoops down to the
// country, then it opens. Everything else answers a poke too (the whale, the orca, the turtle, the sailboat, clouds,
// trees, the sea, the continents, which say their names). North is always up: on a narrow screen she slides the board
// sideways with her finger instead of turning it. terrain.ts, pieces.ts, animals.ts and toys.ts build the still
// things; this file makes them move and listens to her finger.
import { CanvasTexture, Group, Raycaster, Scene, SRGBColorSpace, Vector2, Vector3, type Mesh, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp, sounds } from '../../sdk'
import { CameraRig, type Shot } from '../engine3d/camera'
import { Bag } from '../engine3d/dispose'
import { blobShadow } from '../engine3d/geo'
import { setOutlineResolution } from '../engine3d/outline'
import { Particles } from '../engine3d/particles'
import { makeLights } from '../engine3d/toon'
import type { World3D } from '../engine3d/View3D'
import { noise, sfx, tone } from '../kit/sfx'
import { makeAnimal, type Animal } from './animals'
import { buildField, type Field } from './field'
import { BOARD, continentAt, LEVEL, PIECES, POKES, proj, toLat, toLon, type ContinentId, type Piece, type PokeId } from './geo'
import { buildPiece } from './pieces'
import type { AnimalId } from './places'
import { buildCompass, buildLand, buildTray, Sea } from './terrain'
import * as T from './toys'

export interface BoardEvents {
  /** She picked a place: the balloon sets off for it. */
  pick(place: string): void
  /** The balloon is there: the place opens. */
  arrived(place: string): void
  /** She tapped a continent, at this spot of the screen. */
  continent(id: ContinentId, x: number, y: number): void
  /** Any touch at all (the hint waits again). */
  touched(): void
}

/** A pin on the board: an animal riding it, over one of her countries. */
export interface PinInfo {
  /** The tap target's id: `pin:<place>`, or `pin:<place>:also` for a place's second pin. */
  id: string
  place: string
  /** Read aloud by VoiceOver when the place has no name of its own to give (its second pin). */
  label?: string
}
export const PINS: PinInfo[] = PIECES.flatMap((p) => [{ id: `pin:${p.id}`, place: p.id }, ...(p.also ? [{ id: `pin:${p.id}:also`, place: p.id, label: p.also.label }] : [])])
export const POKE_ANCHORS = POKES.map((p) => ({ id: `poke:${p.id}`, label: p.label }))

/** How long the balloon's flight to a picked country takes (s), and how long it then hovers before the place opens. */
const FLIGHT = 1.55
const HOVER = 0.35
/** How tall an animal should look (px): the pins are sized to the screen, so they are as easy to see on a phone. */
const ANIMAL_PX = 48
/** The tray's rim and a little air round it, in the camera's frame. */
const RIM = 1.1
/** Particle colors: water, white, pink, butter, leaf, lavender. */
const DROP = 0
const WHITE = 1
const LEAF = 4

interface Pin extends PinInfo {
  piece: Piece
  /** Where its tip touches (the country's top, or the sea for the Arctic's). */
  at: Vector3
  root: Group
  animal: Animal
  trophy: Group
  phase: number
  /** Seconds since she picked it (-1: not picked). */
  t: number
  hover: number
}

interface Toy {
  id: PokeId
  root: Object3D
  home: Vector3
  /** Where its tap target sits now, and how big it is across (units). */
  at: Vector3
  size: number
  /** Seconds since she poked it (-1: idle). */
  t: number
  /** How far round its loop it is. */
  a: number
}

interface Drifter {
  root: Group
  shadow: Mesh
  speed: number
  t: number
  y: number
}

const tmp = new Vector3()
const tmp2 = new Vector3()
const smoothstep = (p: number) => p * p * (3 - 2 * p)
const TAU = Math.PI * 2
const deg = Math.PI / 180
const CX = (BOARD.x0 + BOARD.x1) / 2
const CZ = (BOARD.z0 + BOARD.z1) / 2

export class WorldBoard implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private field: Field
  private land: Mesh
  private sea: Sea
  private scenery: T.Scenery
  private pieces: Group[] = []
  private w = 1
  private h = 1
  private top = 0
  private inset = { right: 0, bottom: 0 }
  private time = 0
  private touches = 0
  private anchorEls = new Map<string, HTMLElement>()
  private raycaster = new Raycaster()
  private overview: Shot = { center: new Vector3(CX, 0.2, CZ), half: new Vector3(BOARD.w / 2, 0.6, BOARD.d / 2), yaw: 0, pitch: 55, maxDist: 260 }
  private close: Shot = { center: new Vector3(), half: new Vector3(2, 1, 2), yaw: 0, pitch: 58, maxDist: 260 }
  /** Where the overview's middle sits before she slides it, how far she may slide it, and how far she has. */
  private rest = { x: CX, z: CZ }
  private panMax = 0
  private pan = 0
  private panFrom: number | null = null
  private dragging = false
  private pinScale = 2
  private picked: Pin | null = null
  private opened = false
  private hint = false

  private pins: Pin[] = []
  private toys = new Map<PokeId, Toy>()
  private drifters: Drifter[] = []
  private under: Group[] = []
  private spray: Particles
  private foam: Particles

  private balloon: T.Balloon
  private balloonShadow: Mesh
  private flight: { from: Vector3; to: Vector3 } | null = null
  /** The pin the balloon is waiting beside (null: at home). */
  private balloonPin: Pin | null = null
  private whale!: T.Swimmer
  private orca!: T.Swimmer
  private turtle!: T.Turtle
  private boat!: Group
  private nextSpout = 2.5
  private nextLeap = 5
  private leap = -1
  /** How long the board took to build (ms), for QA. */
  private buildMs = 0

  constructor(
    private renderer: WebGLRenderer,
    private events: BoardEvents,
    /** The place the balloon is hovering over (where she last flew), or null: at home. */
    balloonAt: string | null,
  ) {
    const began = performance.now()
    this.scene.background = sky(this.bag)
    this.rig.fov = 30
    this.rig.lag = 0.45
    this.field = buildField()
    this.land = buildLand(this.field, this.bag)
    this.sea = new Sea(this.field, this.bag)
    this.scenery = T.buildScenery(this.field, this.bag)
    this.scene.add(this.land, this.sea.mesh, buildCompass(this.bag), buildTray(this.bag), this.scenery.group)
    PIECES.forEach((p, i) => {
      const g = buildPiece(p, i, this.field, this.bag)
      this.pieces.push(g)
      this.scene.add(g)
    })
    this.spray = new Particles({ kind: 'spray', count: 130, colors: ['#8FD3F7', '#FFFFFF', '#FF8FB8', '#FBEA9A', '#8BD79A', '#D9CCFF'], gravity: 7 }, this.bag)
    this.foam = new Particles({ kind: 'foam', count: 80, opacity: 0.92 }, this.bag)
    this.scene.add(this.spray.mesh, this.foam.mesh)
    this.buildPins()
    this.buildToys()
    this.buildClouds()

    this.balloon = T.balloon(this.bag)
    this.balloonShadow = blobShadow(0.5, this.bag)
    this.scene.add(this.balloon.root, this.balloonShadow)
    const toy = this.toys.get('balloon')!
    this.balloonPin = this.pins.find((p) => p.place === balloonAt && !p.id.endsWith(':also')) ?? null
    if (this.balloonPin) toy.home.copy(this.berth(this.balloonPin))
    this.balloon.root.position.copy(toy.home)
    this.buildMs = Math.round(performance.now() - began)
  }

  // ---------------------------------------------------------------- building

  private buildPins() {
    PIECES.forEach((piece, i) => {
      const add = (id: string, animal: AnimalId, x: number, z: number, y: number, label?: string) => {
        const root = new Group()
        const a = makeAnimal(animal, this.bag)
        a.root.position.y = T.PIN_SEAT
        const trophy = T.trophy(this.bag)
        trophy.position.set(0.36, T.PIN_SEAT, 0.26)
        trophy.visible = false
        root.add(T.pin(piece.color, this.bag), a.root, trophy)
        this.scene.add(root)
        this.pins.push({ id, place: piece.id, label, piece, at: new Vector3(x, y, z), root, animal: a, trophy, phase: this.pins.length * 1.7 + i, t: -1, hover: 0 })
      }
      add(`pin:${piece.id}`, piece.animal, piece.pin[0], piece.pin[1], LEVEL.piece)
      if (piece.also) {
        const [x, z] = proj(piece.also.at)
        add(`pin:${piece.id}:also`, piece.also.animal, x, z, 0.1, piece.also.label)
        this.scene.add(T.iceFloes([x, z], this.bag))
      }
    })
  }

  private addToy(id: PokeId, root: Object3D, size: number, up = 0) {
    const [x, z] = proj(POKES.find((p) => p.id === id)!.at)
    const home = new Vector3(x, up, z)
    root.position.copy(home)
    if (id !== 'balloon') this.scene.add(root)
    this.toys.set(id, { id, root, home, at: home.clone(), size, t: -1, a: 0 })
  }

  private buildToys() {
    this.whale = T.whale(this.bag)
    this.whale.root.scale.setScalar(2.1)
    this.addToy('whale', this.whale.root, 2)
    this.orca = T.whale(this.bag, true)
    this.orca.root.scale.setScalar(1.6)
    this.addToy('orca', this.orca.root, 1.7)
    this.turtle = T.turtle(this.bag)
    this.turtle.root.scale.setScalar(1.7)
    this.addToy('turtle', this.turtle.root, 1.5)
    this.boat = T.sailboat(this.bag)
    this.boat.scale.setScalar(1.9)
    this.addToy('sailboat', this.boat, 1.8)
    // (The balloon is built after: its toy only remembers where it hovers.)
    this.addToy('balloon', new Group(), 2.4, 2.1)
  }

  private buildClouds() {
    // Clouds drifting over the map, each with its shadow on the board.
    const spots: [number, number, number, number][] = [[0.1, 0.1, 1.9, 3.6], [0.5, 0.71, 1.7, 3.4], [0.85, 0.9, 2, 3.6]]
    for (const [u, v, s, y] of spots) {
      const root = T.cloud(this.bag, s)
      root.position.set(BOARD.x0 + BOARD.w * u, y, BOARD.z0 + BOARD.d * v)
      const shadow = blobShadow(0.42 * s, this.bag)
      this.scene.add(root, shadow)
      this.drifters.push({ root, shadow, speed: 0.1 + s * 0.04, t: -1, y })
    }
    // Clouds below, round the tray: the board floats in the sky Sparkle's balloon flies through.
    const low: [number, number, number, number][] = [[-23, -4.5, -8, 7], [24, -5.5, -3, 8], [-25, -6.5, 7, 7.5], [23, -4.5, 9, 6.5], [-8, -7, 15.5, 8.5], [11, -6, -15, 7], [-19, -7.5, -14, 6], [20, -8, 16, 7], [0, -8.5, 17.5, 6], [-14, -6, 17, 5]]
    for (const [x, y, z, s] of low) {
      const c = T.cloud(this.bag, s)
      c.position.set(CX + x, y, CZ + z)
      this.scene.add(c)
      this.under.push(c)
    }
  }

  // ---------------------------------------------------------------- World3D

  /** Which places she has finished (their pins wear a trophy), and whether Sparkle is hinting (the pins hop in turn). */
  setPlaces(done: string[], hint: boolean) {
    this.hint = hint
    for (const p of this.pins) p.trophy.visible = done.includes(p.place) && !p.id.endsWith(':also')
  }

  /** The room the screen's dock takes on the right and along the bottom (px): the board is framed beside it. */
  setInsets(right: number, bottom: number) {
    if (this.inset.right === right && this.inset.bottom === bottom) return
    this.inset = { right, bottom }
    this.layout(true)
  }

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.top = top
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
    this.layout(true)
  }

  /** Frames the board for this shape of screen: all of it when it fits, as much as reads well when the screen is
   *  narrow (she slides the rest into view). */
  private layout(snap: boolean) {
    const availW = Math.max(120, this.w - this.inset.right)
    const availH = Math.max(120, this.h - this.top - this.inset.bottom)
    const a = availW / availH
    const pitch = a > 1.2 ? 61 : 63
    const full = BOARD.w / 2 + RIM
    const hz = BOARD.d / 2 + RIM
    const hx = Math.min(full, hz * Math.sin(pitch * deg) * a * 1.5)
    this.panMax = full - hx
    this.pan = clamp(this.pan, -this.panMax, this.panMax)
    // The frame is stretched toward the dock's side, so the board itself sits clear of it.
    const kx = this.w / availW
    const kz = (this.h - this.top) / availH
    this.overview.pitch = pitch
    this.overview.half.set(hx * kx, 0.6, hz * kz)
    this.rest = { x: CX + hx * (kx - 1), z: CZ + hz * (kz - 1) * 0.9 + 0.9 }
    this.overview.center.set(this.rest.x + this.pan, 0.2, this.rest.z)
    // Pins as big on a phone as on the iPad.
    this.pinScale = clamp(ANIMAL_PX / Math.max(1, availW / (hx * 2)), 1.25, 2.7)
    if (this.balloonPin && !this.flight) this.toys.get('balloon')?.home.copy(this.berth(this.balloonPin))
    this.rig.setShot(this.picked ? this.close : this.overview, snap)
  }

  setAnchorElements(els: Map<string, HTMLElement>) {
    this.anchorEls = els
  }

  get calm() {
    return !this.rig.moving && !this.picked && !this.dragging && !this.spray.busy && this.leap < 0 && ![...this.toys.values()].some((t) => t.t >= 0)
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.sea.update(t)
    // Let go past the edge, the board springs back.
    if (!this.dragging) this.pan += (clamp(this.pan, -this.panMax, this.panMax) - this.pan) * (1 - Math.exp(-dt / 0.12))
    this.overview.center.x = this.rest.x + this.pan
    this.updatePins(dt, t)
    this.updateToys(dt, t)
    this.updateBalloon(dt, t)
    this.updateClouds(dt, t)
    this.spray.update(dt)
    this.foam.update(dt)
    const c = this.overview.center
    this.lights.follow(c.x, c.y, c.z)
    this.rig.setShot(this.picked ? this.close : this.overview)
    this.rig.update(dt)
  }

  render() {
    this.renderer.render(this.scene, this.rig.camera)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  // ---------------------------------------------------------------- the pins and their animals

  private updatePins(dt: number, t: number) {
    const S = this.pinScale
    this.pins.forEach((p, i) => {
      if (p.t >= 0) p.t += dt
      p.hover += ((this.anchorHover === p.id ? 1 : 0) - p.hover) * (1 - Math.exp(-dt / 0.08))
      // The pins bob; when Sparkle hints they hop one after another, like a wave going round the world.
      let up = 0.07 * Math.sin(t * 1.7 + p.phase)
      let squash = 0
      if (this.hint) {
        const k = ((t * 0.9 - i * 0.16) % 2.2) / 0.5
        if (k >= 0 && k < 1) {
          up += 0.5 * bell(k)
          squash = 0.12 * Math.sin(k * Math.PI * 2)
        }
      }
      const picked = p.t >= 0
      // Picked, it hops and then lifts up out of the way, so the whole country shows under it.
      const hop = picked ? bell(clamp(p.t / 0.5, 0, 1)) * 0.5 + smoothstep(clamp((p.t - 0.35) / 0.6, 0, 1)) * 0.4 : 0
      p.root.position.copy(p.at).setY(p.at.y + (0.12 + up + hop) * S)
      const s = S * (1 + p.hover * 0.1)
      p.root.scale.set(s * (1 + squash), s * (1 - squash), s * (1 + squash))
      p.root.rotation.y = picked ? smoothstep(clamp(p.t / 0.9, 0, 1)) * TAU : Math.sin(t * 0.7 + p.phase) * 0.22
      // The animal on it is alive: it breathes, looks about, and wags what it has.
      const a = p.animal
      const breathe = 1 + 0.025 * Math.sin(t * 2.1 + p.phase * 2)
      a.body.scale.set(1 / Math.sqrt(breathe), breathe, 1 / Math.sqrt(breathe))
      if (a.head) {
        a.head.rotation.z = Math.sin(t * 0.9 + p.phase) * 0.1 + (picked ? Math.sin(p.t * 14) * 0.12 : 0)
        a.head.rotation.x = Math.max(0, Math.sin(t * 0.43 + p.phase * 1.3)) ** 8 * 0.22
      }
      for (const [part, axis, far, fast] of a.wags) part.rotation[axis] = (axis === 'z' ? Math.sign(far) * 0.35 : 0) + Math.sin(t * fast * (picked ? 2.5 : 1) + p.phase) * far
      // Her trophy turns slowly, so its gold catches the eye.
      p.trophy.rotation.y = t * 1.4 + p.phase
    })
  }

  // ---------------------------------------------------------------- Sparkle's balloon

  /** Where the balloon hovers beside a pin. */
  private berth(p: Pin) {
    const S = this.pinScale
    return new Vector3(p.at.x + 1.0 * S, p.at.y + 1.5 * S, p.at.z - 0.5 * S)
  }

  private updateBalloon(dt: number, t: number) {
    const toy = this.toys.get('balloon')!
    if (toy.t >= 0) toy.t += dt
    if (toy.t > 3) toy.t = -1
    const b = this.balloon
    const k = toy.t
    const S = this.pinScale * 1.05
    b.root.scale.setScalar(S)
    const pos = b.root.position
    let roar = k >= 0 && k < 1.4 ? 1 : 0
    if (this.flight && this.picked) {
      // The flight to the country she picked: up, over and down, leaning into it, the burner roaring.
      const p = smoothstep(clamp(this.picked.t / FLIGHT, 0, 1))
      const { from, to } = this.flight
      const far = Math.hypot(to.x - from.x, to.z - from.z)
      pos.lerpVectors(from, to, p).setY(from.y + (to.y - from.y) * p + Math.sin(p * Math.PI) * Math.min(3.2, 0.8 + far * 0.16))
      const lean = Math.sin(p * Math.PI) * 0.28 * Math.sign(to.x - from.x || 1)
      b.root.rotation.set(0, 0, -lean)
      roar = p < 0.9 ? 1 : 0
      if (Math.random() < dt * 30 && p < 0.97) this.spray.emit(pos.x + (Math.random() - 0.5) * 0.4, pos.y + 0.2 * S, pos.z + (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.6, -0.5, (Math.random() - 0.5) * 0.6, 0.9, 0.2, 2 + Math.floor(Math.random() * 2) + (Math.random() < 0.3 ? 2 : 0))
      if (this.picked.t > FLIGHT + HOVER && !this.opened) {
        this.opened = true
        toy.home.copy(to)
        this.events.arrived(this.picked.place)
      }
    } else {
      // Hovering: it drifts and bobs; poked, the burner roars, it climbs and spins, and sparkles fall.
      const lift = k >= 0 ? bell(clamp(k / 3, 0, 1)) : 0
      pos.set(toy.home.x + Math.sin(t * 0.22) * 0.3, toy.home.y + Math.sin(t * 0.8) * 0.14 + lift * 1.2, toy.home.z + Math.cos(t * 0.17) * 0.2)
      b.root.rotation.set(Math.sin(t * 0.6) * 0.04, k >= 0 ? smoothstep(clamp(k / 2.4, 0, 1)) * TAU : Math.sin(t * 0.3) * 0.25, Math.sin(t * 0.5) * 0.05)
      if (k >= 0 && k < 2.2 && Math.random() < dt * 24) this.spray.emit(pos.x + (Math.random() - 0.5) * S, pos.y + (0.6 + Math.random() * 0.6) * S, pos.z + (Math.random() - 0.5) * S, (Math.random() - 0.5) * 1.2, 0.8, (Math.random() - 0.5) * 1.2, 1.1, 0.2, 2 + Math.floor(Math.random() * 2))
    }
    b.flame.scale.setScalar(0.45 + 0.1 * Math.sin(t * 20) + roar * (1.1 + 0.3 * Math.sin(t * 40)))
    // Sparkle looks about from the basket.
    b.rider.rotation.y = Math.sin(t * 0.8) * 0.5
    b.rider.position.y = 0.235 + Math.abs(Math.sin(t * 2.2)) * 0.012
    // Its shadow on the board below (not over the sea's foam or the tray: a grey blot there looks like a stain).
    const sx = pos.x
    const sz = pos.z + 0.3
    const on = this.field.piece(sx, sz) >= 0
    this.balloonShadow.visible = on || this.field.land(sx, sz) > 0.06
    this.balloonShadow.position.set(sx, (on ? LEVEL.piece : this.field.height(sx, sz)) + 0.03, sz)
    this.balloonShadow.scale.setScalar(S * 0.4)
    toy.at.copy(pos).setY(pos.y + 0.8 * S)
    toy.size = 1.1 * S
  }

  // ---------------------------------------------------------------- the toys in the sea

  private updateToys(dt: number, t: number) {
    for (const toy of this.toys.values()) if (toy.id !== 'balloon' && toy.t >= 0) toy.t += dt
    const done = (id: PokeId, after: number) => {
      const toy = this.toys.get(id)!
      if (toy.t > after) toy.t = -1
      return toy
    }

    // The whale: swims a slow loop, waving its tail, and spouts now and then; poked, a great spout and a tail slap.
    {
      const toy = done('whale', 2.6)
      const k = toy.t
      toy.a += dt * 0.16
      const g = this.whale
      const x = toy.home.x + Math.cos(toy.a) * 1.5
      const z = toy.home.z + Math.sin(toy.a) * 0.9
      const dive = k >= 1.2 ? bell(clamp((k - 1.2) / 1.4, 0, 1)) : 0
      g.root.position.set(x, 0.02 + Math.sin(t * 1.3) * 0.03 - dive * 0.5, z)
      g.root.rotation.set(dive * 0.5, Math.atan2(-Math.sin(toy.a) * 1.5, Math.cos(toy.a) * 0.9), 0)
      g.tail.rotation.x = Math.sin(t * (k >= 0 ? 9 : 2.2)) * (k >= 0 ? 0.7 : 0.3)
      this.nextSpout -= dt
      const spouting = (k >= 0 && k < 1.1) || this.nextSpout < 0
      if (this.nextSpout < -0.7) this.nextSpout = 5 + Math.random() * 4
      if (spouting && Math.random() < dt * (k >= 0 ? 60 : 30)) {
        const big = k >= 0 ? 1.6 : 1
        this.spray.emit(x, 0.5, z, (Math.random() - 0.5) * 0.9 * big, (2.6 + Math.random()) * big, (Math.random() - 0.5) * 0.9 * big, 0.9, 0.2, Math.random() < 0.5 ? DROP : WHITE)
      }
      if (k >= 1.2 && !g.root.userData.wet) {
        g.root.userData.wet = true
        this.splash(x, z, 1.4)
      }
      if (k < 0) g.root.userData.wet = false
      toy.at.set(x, 0.35, z)
    }

    // The orca: cruises, and leaps clean out of the water now and then; poked, it leaps at once, higher.
    {
      const toy = done('orca', 1.6)
      const k = toy.t
      const g = this.orca
      toy.a += dt * 0.26
      this.nextLeap -= dt
      if (this.nextLeap < 0 && this.leap < 0 && k < 0) this.leap = 0
      if (this.leap >= 0) this.leap += dt
      if (this.leap > 1.2) {
        this.leap = -1
        this.nextLeap = 6 + Math.random() * 5
      }
      const p = k >= 0 ? clamp(k / 1.3, 0, 1) : this.leap >= 0 ? clamp(this.leap / 1.1, 0, 1) : 0
      const high = k >= 0 ? 1.9 : 1.1
      const x = toy.home.x + Math.cos(toy.a) * 1.3
      const z = toy.home.z + Math.sin(toy.a) * 0.8
      g.root.position.set(x, -0.05 + Math.sin(t * 1.5) * 0.03 + bell(p) * high, z)
      g.root.rotation.set(p > 0 && p < 1 ? -1.0 + 2.0 * p : 0, Math.atan2(-Math.sin(toy.a) * 1.3, Math.cos(toy.a) * 0.8), 0)
      g.tail.rotation.x = Math.sin(t * 3) * 0.3
      const inAir = p > 0.04 && p < 0.96
      if (g.root.userData.air && !inAir) {
        this.splash(x, z, 1.1)
        if (k >= 0) sfx.splash()
      }
      if (!g.root.userData.air && inAir) this.splash(x, z, 0.7)
      g.root.userData.air = inAir
      toy.at.set(x, 0.3 + bell(p) * high, z)
    }

    // The turtle: paddles in a circle; poked, it spins, dives and pops back up.
    {
      const toy = done('turtle', 2)
      const k = toy.t
      const g = this.turtle
      toy.a += dt * 0.22
      const dive = k >= 0 ? bell(clamp(k / 1.6, 0, 1)) : 0
      const x = toy.home.x + Math.cos(toy.a) * 0.9
      const z = toy.home.z + Math.sin(toy.a) * 0.6
      g.root.position.set(x, 0.02 + Math.sin(t * 1.4) * 0.02 - dive * 0.5, z)
      g.root.rotation.set(0, Math.atan2(-Math.sin(toy.a) * 0.9, Math.cos(toy.a) * 0.6) + (k >= 0 ? smoothstep(clamp(k / 1.6, 0, 1)) * TAU * 2 : 0), 0)
      const paddle = Math.sin(t * (k >= 0 ? 12 : 3)) * 0.5
      g.flipL.rotation.y = paddle
      g.flipR.rotation.y = -paddle
      if (k >= 0 && !g.root.userData.wet) {
        g.root.userData.wet = true
        this.splash(x, z, 0.8)
      }
      if (k < 0) g.root.userData.wet = false
      toy.at.set(x, 0.2, z)
    }

    // The sailboat: round and round with a foamy wake, rocking; poked, it leans over and races.
    {
      const toy = done('sailboat', 3)
      const k = toy.t
      const fast = k >= 0 ? 1 + 2.8 * bell(clamp(k / 3, 0, 1)) : 1
      toy.a += dt * 0.2 * fast
      const g = this.boat
      const x = toy.home.x + Math.cos(toy.a) * 1.7
      const z = toy.home.z + Math.sin(toy.a) * 1.0
      const yaw = Math.atan2(-Math.sin(toy.a) * 1.7, Math.cos(toy.a) * 1.0)
      g.position.set(x, 0.03 + Math.sin(t * 2.2) * 0.02, z)
      g.rotation.set(Math.sin(t * 1.3) * 0.05, yaw, Math.sin(t * 1.7) * 0.07 - (fast - 1) * 0.12)
      const bx = x - Math.sin(yaw) * 0.7
      const bz = z - Math.cos(yaw) * 0.7
      if (Math.random() < dt * 6 * fast) this.foam.emit(bx, 0.014, bz, (Math.random() - 0.5) * 0.2, 0, (Math.random() - 0.5) * 0.2, 1.2, 0.36 * Math.sqrt(fast))
      if (fast > 1.6 && Math.random() < dt * 24) this.spray.emit(bx, 0.1, bz, (Math.random() - 0.5) * 0.9, 1.6 + Math.random() * 0.8, (Math.random() - 0.5) * 0.9, 0.6, 0.16, DROP)
      toy.at.set(x, 0.7, z)
    }
  }

  private splash(x: number, z: number, big: number) {
    this.foam.burst(x, 0.014, z, 7, 1.3 * big, 0, 0.6 * big)
    for (let i = 0; i < 9; i++) this.spray.emit(x, 0.1, z, (Math.random() - 0.5) * 2.2 * big, (1.8 + Math.random() * 1.4) * big, (Math.random() - 0.5) * 2.2 * big, 0.7, 0.2, i % 3 ? DROP : WHITE)
  }

  private poke(id: PokeId) {
    const toy = this.toys.get(id)!
    // (A thing already in the middle of its trick keeps going; the tap still makes its sound.)
    if (toy.t < 0) toy.t = 0
    SOUND[id]()
  }

  // ---------------------------------------------------------------- clouds

  private updateClouds(dt: number, t: number) {
    for (const c of this.drifters) {
      if (c.t >= 0) c.t += dt
      if (c.t > 1.2) c.t = -1
      const p = c.root.position
      p.x += c.speed * dt
      if (p.x > BOARD.x1 + 3) p.x = BOARD.x0 - 3
      p.y = c.y + Math.sin(t * 0.7 + c.speed * 90) * 0.1
      const pop = c.t >= 0 ? 0.3 * bell(clamp(c.t / 0.6, 0, 1)) : 0
      c.root.scale.set(1 + pop, 1 - pop * 0.7, 1 + pop)
      // (Its shadow only on dry land: a grey blot on the sea looks like a stain.)
      const on = this.field.piece(p.x, p.z) >= 0
      c.shadow.position.set(p.x, (on ? LEVEL.piece : this.field.height(p.x, p.z)) + 0.03, p.z)
      // (Nor on the ice: grey on white looks like dirt.)
      c.shadow.visible = (on || this.field.land(p.x, p.z) > 0.1) && toLat(p.z) > -58
    }
    this.under.forEach((c, i) => (c.position.y += Math.sin(t * 0.4 + i * 1.9) * 0.003))
  }

  // ---------------------------------------------------------------- her finger

  private toScreen(v: Vector3) {
    const p = tmp2.copy(v).project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h }
  }

  /** How many screen pixels a unit of the board is at this spot. */
  private pxPerUnit(at: Vector3) {
    const a = this.toScreen(at)
    const ax = a.x
    const ay = a.y
    const b = this.toScreen(tmp.copy(at).add(this.rig.camera.getWorldDirection(new Vector3()).cross(this.rig.camera.up).normalize()))
    return Math.hypot(b.x - ax, b.y - ay)
  }

  private anchorHover: string | null = null
  hoverAnchor(id: string | null) {
    this.anchorHover = id
  }

  pointerDown() {
    this.panFrom = null
  }

  /** A finger that drags slides the board sideways (when there is more of it than the screen shows). Past the edge
   *  it stretches a little and springs back. */
  pointerMove(x: number, _y: number, downX: number, _downY: number, held: boolean) {
    if (!held || this.picked) return
    if (this.panFrom === null) {
      if (Math.abs(x - downX) < 10) return
      this.panFrom = this.pan
      this.dragging = true
      this.events.touched()
    }
    const want = this.panFrom - (x - downX) / Math.max(1, this.pxPerUnit(tmp.set(this.overview.center.x, 0, this.rest.z)))
    const over = want - clamp(want, -this.panMax, this.panMax)
    this.pan = want - over * 0.75
  }

  pointerUp() {
    this.dragging = false
    this.panFrom = null
  }

  /** She picked this pin's place: its animal hops and spins, the balloon flies over and the camera swoops down. */
  private pick(p: Pin) {
    if (this.picked) return
    p.t = 0
    this.picked = p
    this.flight = { from: this.balloon.root.position.clone(), to: this.berth(p) }
    this.toys.get('balloon')!.t = -1
    const piece = p.piece
    const also = p.id.endsWith(':also')
    // The whole country in the frame (its pin and the balloon too); the Arctic's pin has no country under it.
    const tall = 1.25 * this.pinScale
    const hx = also ? 3.2 : Math.max(1.5, piece.half[0] * 1.15)
    const hz = also ? 2.4 : Math.max(1.2, piece.half[1] * 1.1)
    this.close.half.set(Math.min(hx, 9), tall, Math.min(hz, 6))
    this.close.center.set(also ? p.at.x : clamp(piece.center[0], p.at.x - 3, p.at.x + 3), tall + 0.2, also ? p.at.z : clamp(piece.center[1], p.at.z - 2, p.at.z + 2))
    this.rig.lag = 0.5
    this.spray.burst(p.at.x, p.at.y + 2.2 * this.pinScale, p.at.z, 16, 2.4, 3, 0.26)
    this.events.pick(p.place)
  }

  tap(x: number, y: number, id?: string) {
    this.touches++
    this.events.touched()
    if (this.picked) return
    if (id?.startsWith('pin:')) return this.pick(this.pins.find((k) => k.id === id)!)
    if (id?.startsWith('poke:')) return this.poke(id.slice(5) as PokeId)
    // Anything else: whatever her finger lands on answers.
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    const drift = this.raycaster.intersectObjects(this.drifters.map((c) => c.root), true)[0]
    if (drift) {
      const c = this.drifters.find((k) => k.root === drift.object.parent)!
      c.t = 0
      sfx.fwip()
      this.spray.burst(drift.point.x, drift.point.y, drift.point.z, 8, 1.4, 1.6, 0.26, WHITE)
      return
    }
    const hit = this.raycaster.intersectObjects([this.scenery.group, ...this.pieces, this.land, this.sea.mesh], true)[0]
    if (!hit) return sfx.fwip()
    const at = hit.point
    // One of her countries: the same as tapping its animal.
    const piece = this.pieces.find((g) => g === hit.object.parent)
    if (piece) return this.pick(this.pins.find((p) => p.id === `pin:${PIECES[piece.userData.piece as number].id}`)!)
    if (hit.object === this.sea.mesh) {
      sfx.splash()
      this.foam.burst(at.x, 0.014, at.z, 6, 1.3, 0, 0.5)
      this.spray.burst(at.x, 0.1, at.z, 6, 1.1, 2.6, 0.2, DROP)
    } else if (hit.object !== this.land) {
      // A tree or a mountain: leaves fly.
      noise(0.25, 0.08, 'highpass', 2500, 1800, 0, 0.7)
      this.spray.burst(at.x, at.y + 0.1, at.z, 9, 1.6, 2.4, 0.22, LEAF)
    } else {
      // A continent: a pop of confetti, and it says its name.
      for (let i = 0; i < 8; i++) this.spray.emit(at.x, at.y + 0.1, at.z, (Math.random() - 0.5) * 2.4, 2.4 + Math.random() * 1.6, (Math.random() - 0.5) * 2.4, 0.7, 0.22, 2 + (i % 2) + (i % 3 === 0 ? 3 : 0))
      this.events.continent(continentAt(toLon(at.x), toLat(at.z)), x, y)
    }
  }

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const S = this.pinScale
    for (const [id, el] of this.anchorEls) {
      let spot: { x: number; y: number; w: number; h: number; z: number } | null = null
      if (this.picked) {
        // (Nothing to tap while the balloon is on its way.)
      } else if (id.startsWith('pin:')) {
        const p = this.pins.find((k) => k.id === id)
        if (p) {
          // One target over the pin and its animal (a little of the country under the tip too).
          const head = this.toScreen(tmp.copy(p.root.position).setY(p.root.position.y + (T.PIN_SEAT + 1.05) * S))
          const hx = head.x
          const hy = head.y
          const foot = this.toScreen(p.at)
          const tall = Math.max(min, foot.y - hy + 6)
          const wide = Math.max(min, this.pxPerUnit(p.at) * 1.1 * S)
          spot = { x: (hx + foot.x) / 2, y: foot.y + 6 - tall / 2, w: wide, h: tall, z: 9000 + Math.round(p.at.z * 10) }
        }
      } else if (id.startsWith('poke:')) {
        const toy = this.toys.get(id.slice(5) as PokeId)
        if (toy) {
          const s = this.toScreen(toy.at)
          const d = Math.max(min, this.pxPerUnit(toy.at) * toy.size)
          spot = { x: s.x, y: s.y, w: d, h: d, z: 5000 }
        }
      }
      const show = !!spot && spot.x >= 0 && spot.x <= this.w - this.inset.right && spot.y >= this.top && spot.y <= this.h
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
    return { touches: this.touches, buildMs: this.buildMs, picked: this.picked?.place ?? null, pan: Math.round(this.pan * 100) / 100, panMax: Math.round(this.panMax * 100) / 100, poking: [...this.toys.values()].filter((t) => t.t >= 0).map((t) => t.id) }
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
const SOUND: Record<PokeId, () => void> = {
  whale: () => (tone(180, 320, 0.7, 0.07, 'sine'), tone(320, 240, 0.5, 0.05, 'sine', 0.5), noise(0.7, 0.05, 'highpass', 2500, 4000, 0, 0.7)),
  orca: () => [0, 0.14, 0.3].forEach((d, i) => tone(1200 + i * 300, 1900 + i * 200, 0.12, 0.05, 'sine', d)),
  turtle: () => sfx.splash(),
  sailboat: () => (noise(0.6, 0.05, 'bandpass', 700, 1600, 0, 0.8), [0, 0.12].forEach((d) => tone(880, 1320, 0.1, 0.05, 'triangle', d))),
  balloon: () => (noise(0.9, 0.07, 'lowpass', 900, 400, 0, 0.6), setTimeout(() => sounds.sparkle(), 500)),
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

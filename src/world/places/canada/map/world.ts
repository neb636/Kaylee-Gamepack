// The Canada map (planning/around-the-world/canada.md, "The map"): Canada as a chunky toy tray floating in the sky, the
// way the Thailand maps are. Seven places stand on it east to west, each a little diorama with its friend in it, big
// and alive: tap a place (or its friend) and it hops, the camera closes in, and the chapter opens. Ottawa's rink is the
// story's home: Maple and the Maple Cup, Gus's geese skating rings on the ice, and every friend she has brought home
// standing in a row in the team's pink scarf (their home then wears a little pink flag). With the whole team there the
// rink glows until she taps it: the big game. Everything else on the board answers a poke (the geese, a polar bear
// who waves, an orca, a bison who rolls in the dust, a beluga, Sparkle's balloon, the clouds, the ice floes, the
// Rockies, the snowy north, Hudson Bay). She can swing the board round with a drag and pinch it closer (board.ts).
//
// shape.ts has the numbers (the country's shape, where everything stands), terrain.ts the still board, places.ts the
// dioramas, critters.ts the animals to poke; this file brings them to life and listens to her finger. The page
// (activities/hub/Hub.tsx) decides what is said.
import { Group, Raycaster, Scene, Vector2, Vector3, type Mesh, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp } from '../../../../sdk'
import type { AnchorInfo } from '../../../engine3d/Anchors'
import { boardShot, Entrance, mapCamKnobs, puffCloud, skyTexture, trayBox } from '../../../engine3d/board'
import { CameraRig, type Shot } from '../../../engine3d/camera'
import type { FilmActor } from '../../../engine3d/characters/actor'
import { Bag } from '../../../engine3d/dispose'
import { blobShadow } from '../../../engine3d/geo'
import { setOutlineResolution } from '../../../engine3d/outline'
import { Particles } from '../../../engine3d/particles'
import type { RoamState } from '../../../engine3d/roam'
import { makeLights } from '../../../engine3d/toon'
import type { World3D } from '../../../engine3d/View3D'
import { Goose } from '../characters/goose'
import { Lulu } from '../characters/lulu'
import type { Performer } from '../characters/toy'
import { Tuque } from '../characters/tuque'
import { Friend } from '../story/cast'
import { CHAPTERS, type ChapterId } from '../story/chapters'
import { Balloon } from '../story/props'
import { beluga, bison, floe, orca, polarBear, type Bison, type Swimmer } from './critters'
import { buildBay, buildCamp, buildCastle, buildForest, buildLake, buildMountain, buildRink, type PlaceToy } from './places'
import { buildField, FLOES, fromRockies, PLACES, POKES, type Field, type PlaceId, type PokeId } from './shape'
import { hubSfx } from './sounds'
import { buildLand, buildScenery, buildTray, Sea, snowLine, TRAY } from './terrain'

export type { PlaceId, PokeId }
/** Something on the board that isn't a place and answers a tap with a fact (once): the Rockies, the snowy north,
 *  Hudson Bay, the prairie. */
export type Spot = 'rockies' | 'north' | 'hudson' | 'prairie'

export interface MapEvents {
  /** She tapped a place: the camera is closing in (the page opens it a moment later). */
  pick(id: PlaceId): void
  /** She tapped the rink before the team is whole. */
  locked(): void
  /** She tapped a friend already on the team, at the rink. */
  team(id: ChapterId): void
  /** She poked an animal (or the balloon). */
  poked(id: PokeId): void
  /** She poked the land or the sea somewhere that has a fact. */
  spot(id: Spot): void
  /** Any touch at all (the idle glow waits again). */
  touched(): void
  /** The camera has moved behind the loading cover long enough: it can fade. */
  revealed(): void
}

/** Each friend's name (their target's label). */
export const WHO: Record<ChapterId, string> = { snowman: 'Tuque', bike: 'Monty', campfire: 'Roxy', canoe: 'Lulu', salmon: 'Misty', whales: 'Ollie' }

/** The DOM targets the page lays over the animals and the team (the places' own targets are the page's). */
export const MAP_ANCHORS: AnchorInfo[] = [
  { id: 'poke:geese', label: 'Gus and the geese', kind: 'thing' },
  { id: 'poke:polar', label: 'The polar bear', kind: 'thing' },
  { id: 'poke:orca', label: 'The orca', kind: 'thing' },
  { id: 'poke:bison', label: 'The bison', kind: 'thing' },
  { id: 'poke:beluga', label: 'The beluga', kind: 'thing' },
  { id: 'poke:balloon', label: "Sparkle's balloon", kind: 'thing' },
  ...CHAPTERS.map((id) => ({ id: `team:${id}`, label: `On the team: ${WHO[id]}`, kind: 'thing' as const })),
]

/** The map camera's entrance, tuned in the feel lab (?feel=1). */
export const MAP_CAM = mapCamKnobs('canada-map-cam', 'Canada map camera', 'src/world/places/canada/map/world.ts', { yaw: 0, pitch: -4, zoom: 0.9 })

/** Particle colors: water, white, pink, butter, leaf, dust. */
const DROP = 0
const WHITE = 1
const PINKC = 2
const DUST = 5

interface Mate {
  id: ChapterId
  actor: Performer & { scarf(on: boolean): unknown }
  /** Turns her toward the camera (y), and tips her back when she floats (Ollie at home). */
  spot: Group
  tilt: Group
  /** On the team: at the rink. */
  team: boolean
  /** Seconds since she popped in at the rink (-1: not arriving). */
  pop: number
  size: number
}

interface Poke {
  id: PokeId
  /** Where its tap target sits now (world), and how big it is across (units). */
  at: Vector3
  size: number
  /** Seconds since she poked it (-1: idle). */
  t: number
}

const tmp = new Vector3()
const tmp2 = new Vector3()
const TAU = Math.PI * 2

export class CanadaMapWorld implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private field: Field
  private land: Mesh
  private sea: Sea
  private scenery: Group
  private peaks: { x: number; z: number }[]
  private w = 1
  private h = 1
  private top = 0
  private time = 0
  private touches = 0
  private anchorEls = new Map<string, HTMLElement>()
  private raycaster = new Raycaster()
  private box = trayBox(TRAY.w, TRAY.d, TRAY.top, 1.1, TRAY.rim, TRAY.k)
  private overview: Shot = boardShot(this.box, 0, 50)
  private close: Shot = { center: new Vector3(), half: new Vector3(1.5, 0.6, 1.1), yaw: 0, pitch: 44, maxDist: 200 }
  private base = { yaw: 0, pitch: 50 }
  private entrance: Entrance
  private picked: PlaceToy | null = null
  private pickedT = 0
  /** The places still to do pulse softly (idle), or bounce (she tapped the rink too soon). */
  private hint = false
  private nudgeT = -1
  /** The whole team is home: the rink glows until she taps it. */
  private glowing = false
  private arriving: Mate | null = null
  private arrivalT = -1
  private targets: Record<string, { x: number; y: number; w: number; h: number }> = {}

  private places = new Map<PlaceId, PlaceToy>()
  private rink: ReturnType<typeof buildRink>
  private castle: ReturnType<typeof buildCastle>
  private camp: ReturnType<typeof buildCamp>
  private lake: ReturnType<typeof buildLake>
  private forest: ReturnType<typeof buildForest>
  private bay: ReturnType<typeof buildBay>
  private maple: FilmActor
  private mapleSpot = new Group()
  private mates = new Map<ChapterId, Mate>()
  private geese: Goose[] = []
  private pokes = new Map<PokeId, Poke>()
  private bear!: FilmActor
  private bisonToy!: Bison
  private belugaToy!: Swimmer
  private orcaToy!: Swimmer
  private balloon!: Balloon
  private floes: { root: Group; x: number; z: number; ph: number; t: number }[] = []
  private clouds: { root: Group; shadow: Mesh; speed: number; y: number; t: number }[] = []
  private under: Group[] = []
  private spray: Particles
  private foam: Particles
  private buildMs = 0

  constructor(
    private renderer: WebGLRenderer,
    private events: MapEvents,
    team: ChapterId[],
    arriving: ChapterId | null,
  ) {
    const began = performance.now()
    this.scene.background = skyTexture(this.bag)
    this.rig.fov = 30
    this.rig.lag = 0.5
    this.entrance = new Entrance(MAP_CAM, () => this.events.revealed())
    this.field = buildField()
    this.land = buildLand(this.field, this.bag)
    this.sea = new Sea(this.field, this.bag)
    const sc = buildScenery(this.field, this.bag)
    this.scenery = sc.group
    this.peaks = sc.peaks
    this.scene.add(this.land, this.sea.mesh, buildTray(this.bag), this.scenery)
    this.spray = new Particles({ kind: 'spray', count: 140, colors: ['#8FD3F7', '#FFFFFF', '#FF8FB8', '#FBEA9A', '#8BD79A', '#E3C79A'], gravity: 2.6 }, this.bag)
    this.foam = new Particles({ kind: 'foam', count: 70, opacity: 0.92 }, this.bag)
    this.scene.add(this.spray.mesh, this.foam.mesh)

    // The places.
    this.rink = buildRink(this.bag)
    this.castle = buildCastle(this.bag)
    this.camp = buildCamp(this.bag)
    this.lake = buildLake(this.bag)
    this.forest = buildForest(this.bag)
    this.bay = buildBay(this.bag)
    for (const p of [this.rink.place, this.castle.place, buildMountain(this.bag), this.camp.place, this.lake.place, this.forest.place, this.bay.place]) {
      const [x, z] = PLACES[p.id]
      p.root.position.set(x, p.id === 'whales' ? 0 : this.ground(x, z), z)
      this.scene.add(p.root)
      this.places.set(p.id, p)
    }

    // Maple by the Cup, always.
    this.maple = new Friend('maple', this.bag, { height: 0.78, voice: 'maple' })
    this.mapleSpot.position.copy(this.rink.maple)
    this.mapleSpot.add(this.maple.root, blobShadow(0.2, this.bag))
    this.maple.place(0, 0, 0, 0)
    this.rink.place.root.add(this.mapleSpot)

    // The friends, at home or on the team.
    const make: Record<ChapterId, () => Mate['actor']> = {
      snowman: () => new Tuque(this.bag, { height: 0.9 }),
      bike: () => new Friend('moose', this.bag, { height: 1.15, voice: 'moose' }),
      campfire: () => new Friend('raccoon', this.bag, { height: 0.72, voice: 'raccoon' }),
      canoe: () => new Lulu(this.bag, { height: 0.6 }),
      salmon: () => new Friend('spirit', this.bag, { height: 1.05, voice: 'bear' }),
      whales: () => new Friend('otter', this.bag, { height: 0.7, voice: 'otter' }),
    }
    const size: Record<ChapterId, number> = { snowman: 0.9, bike: 1.15, campfire: 0.72, canoe: 0.6, salmon: 1.05, whales: 0.7 }
    for (const id of CHAPTERS) {
      const onTeam = team.includes(id)
      // Tuque only exists once she has built him.
      if (id === 'snowman' && !onTeam) continue
      const actor = make[id]()
      const spot = new Group()
      const tilt = new Group()
      spot.add(tilt)
      tilt.add(actor.root)
      spot.add(blobShadow(size[id] * 0.28, this.bag))
      actor.place(0, 0, 0, 0)
      const m: Mate = { id, actor, spot, tilt, team: onTeam, pop: -1, size: size[id] }
      this.mates.set(id, m)
      this.seat(m)
    }
    this.castle.heap.visible = !team.includes('snowman')
    for (const id of CHAPTERS) this.places.get(id)!.flag.visible = team.includes(id)
    const fresh = arriving ? this.mates.get(arriving) : undefined
    if (fresh?.team) {
      this.arriving = fresh
      this.arrivalT = 0
      fresh.pop = 0
      fresh.spot.scale.setScalar(0.001)
    }

    this.buildPokes()
    this.buildSky()
    this.buildMs = Math.round(performance.now() - began)
  }

  // ---------------------------------------------------------------- building

  private ground(x: number, z: number) {
    return Math.max(0, this.field.height(x, z))
  }

  /** Puts a friend where she belongs now: in her row spot at the rink, or at home. */
  private seat(m: Mate) {
    m.spot.removeFromParent()
    m.tilt.rotation.set(0, 0, 0)
    m.actor.scarf(m.team)
    if (m.team) {
      m.spot.position.copy(this.rink.row[CHAPTERS.indexOf(m.id)])
      this.rink.place.root.add(m.spot)
      return
    }
    const home = this.places.get(m.id)!
    home.root.add(m.spot)
    if (m.id === 'canoe') m.spot.position.copy(this.lake.float)
    else if (m.id === 'campfire') m.spot.position.copy(this.camp.peek.hide)
    else m.spot.position.copy(home.home ?? new Vector3())
    // Ollie floats on her back in the kelp.
    if (m.id === 'whales') m.tilt.rotation.x = -1.15
  }

  private add(id: PokeId, root: Object3D, size: number, up = 0) {
    const [x, z] = POKES[id]
    root.position.set(x, this.ground(x, z) + up, z)
    this.scene.add(root)
    this.pokes.set(id, { id, at: root.position.clone(), size, t: -1 })
  }

  private buildPokes() {
    // Gus and two of his geese skate rings on the rink's ice.
    this.geese = [new Goose(this.bag, { height: 0.58, voice: 'gus', captain: true, stick: true }), new Goose(this.bag, { height: 0.48 }), new Goose(this.bag, { height: 0.48 })]
    for (const g of this.geese) {
      this.rink.place.root.add(g.root)
      g.place(0, 0.1, 0, 0)
    }
    this.pokes.set('geese', { id: 'geese', at: new Vector3(), size: 0.6, t: -1 })

    this.bear = polarBear(this.bag, 0.85)
    const bearSpot = new Group()
    bearSpot.add(this.bear.root, blobShadow(0.2, this.bag))
    this.bear.place(0, 0, 0, 0)
    this.add('polar', bearSpot, 0.85)

    this.bisonToy = bison(this.bag)
    this.bisonToy.root.scale.setScalar(1.6)
    this.bisonToy.root.add(blobShadow(0.3, this.bag))
    this.add('bison', this.bisonToy.root, 0.85)

    this.belugaToy = beluga(this.bag)
    this.belugaToy.root.scale.setScalar(1.6)
    this.add('beluga', this.belugaToy.root, 0.6)

    this.orcaToy = orca(this.bag)
    this.orcaToy.root.scale.setScalar(1.6)
    this.add('orca', this.orcaToy.root, 0.65)

    this.balloon = new Balloon(this.bag, 0.22)
    this.balloon.root.visible = true
    this.add('balloon', this.balloon.root, 0.75, 1.45)

    FLOES.forEach(([x, z, r], i) => {
      const root = floe(this.bag, r, i)
      root.position.set(x, 0.01, z)
      this.scene.add(root)
      this.floes.push({ root, x, z, ph: i * 1.7, t: -1 })
    })
  }

  private buildSky() {
    // Clouds drifting high over the map, each with its shadow on the ground.
    // (Over the far north and the paper land to the south only: a cloud drifting over a friend's place hides who she's looking for.)
    const spots: [number, number, number, number][] = [[-5.5, -3.5, 1.0, 2.3], [1.2, -3.7, 0.9, 2.1], [4.6, 4.0, 0.9, 2.2], [-2.8, 4.1, 1.0, 2.0]]
    for (const [x, z, s, y] of spots) {
      const root = puffCloud(this.bag, s)
      root.position.set(x, y, z)
      const shadow = blobShadow(0.45 * s, this.bag)
      this.scene.add(root, shadow)
      this.clouds.push({ root, shadow, speed: 0.05 + s * 0.025, y, t: -1 })
    }
    // Clouds below, round the tray: the map floats in the sky Sparkle's balloon flies through.
    const low: [number, number, number, number][] = [[-10.2, -1.6, -3.5, 3.2], [10.4, -1.9, -1.5, 3.4], [-10.6, -2.2, 3.5, 3.0], [10.0, -1.5, 4.5, 2.8], [-4.5, -2.4, 7.0, 3.6], [4.5, -2.0, -7.0, 3.0], [-6.0, -2.6, -6.6, 2.8], [6.2, -2.8, 7.4, 3.2], [0.5, -2.7, 7.6, 2.6], [-1.0, -2.2, -7.4, 3.0]]
    for (const [x, y, z, s] of low) {
      const c = puffCloud(this.bag, s)
      c.position.set(x, y, z)
      this.scene.add(c)
      this.under.push(c)
    }
  }

  // ---------------------------------------------------------------- the page's switches

  /** The places still to do pulse softly (no touch for a while). */
  setHint(on: boolean) {
    this.hint = on
  }
  /** The whole team is home: the rink glows until she taps it. */
  setGlow(on: boolean) {
    if (on && !this.glowing) hubSfx.glow()
    this.glowing = on
    this.rink.glow.visible = on
  }
  /** The places she still has to do bounce and glow (she tapped the rink too soon). */
  nudge() {
    this.nudgeT = 0
  }
  /** A friend at the rink cheers and hops (she tapped them, or they just said something). */
  cheer(id: ChapterId | 'maple') {
    const a = id === 'maple' ? this.maple : this.mates.get(id)?.actor
    a?.hop()
    a?.wave()
  }

  // ---------------------------------------------------------------- World3D

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.top = top
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
    // A tall screen looks along the country from its south-east corner, so the long board fills it; a wide one looks
    // from the south.
    const tall = h > w * 1.05
    this.base.yaw = tall ? 90 : 0
    this.base.pitch = tall ? 60 : 58
    // Every place turns its front to the camera's side of the board (they're toys on a tray).
    for (const p of this.places.values()) p.root.rotation.y = (this.base.yaw * Math.PI) / 180
    this.frame()
    this.rig.setShot(this.shot(), true)
  }

  setAnchorElements(els: Map<string, HTMLElement>) {
    this.anchorEls = els
  }

  private frame() {
    const k = this.entrance.k
    const o = this.overview
    o.yaw = this.close.yaw = this.base.yaw + MAP_CAM.yaw
    o.pitch = this.base.pitch + MAP_CAM.pitch * k
    o.half.copy(this.box.half).multiplyScalar(1 + (MAP_CAM.zoom - 1) * k)
    this.close.pitch = o.pitch - 4
  }

  /** The close-up's box, `across` the screen and `deep` into it, whichever way the board is turned. */
  private closeHalf(across: number, up: number, deep: number) {
    const side = Math.abs(Math.sin((this.base.yaw * Math.PI) / 180)) > 0.7
    this.close.half.set(side ? deep : across, up, side ? across : deep)
  }

  /** When a new friend's arrival at the rink ends (she pops in once the loading cover has gone). */
  private get arriveEnd() {
    return MAP_CAM.cover + 2.8
  }

  /** The shot right now: the place she picked, the rink while a new friend arrives, or the board. */
  private shot(): Shot {
    if (this.picked) return this.close
    if (this.arriving && this.arrivalT < this.arriveEnd) {
      this.close.center.copy(this.rink.place.root.position).add(tmp.set(0.2, 0.35, -0.1))
      this.closeHalf(2.5, 0.9, 1.6)
      return this.close
    }
    return this.overview
  }

  roam(): RoamState | null {
    return this.picked || (this.arriving && this.arrivalT < this.arriveEnd) ? null : { walk: false, jump: false }
  }

  get calm() {
    return false
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.sea.update(t)
    if (this.picked) {
      this.pickedT += dt
      this.entrance.finish()
    }
    const arrivingNow = !!this.arriving && this.arrivalT < this.arriveEnd
    if (this.arriving && this.arrivalT >= 0) {
      this.arrivalT += dt
      if (this.arrivalT >= this.arriveEnd && this.arrivalT - dt < this.arriveEnd) {
        this.entrance.finish()
        this.rig.lag = 0.9
      }
      if (this.arrivalT >= this.arriveEnd + 2.5 && this.arrivalT - dt < this.arriveEnd + 2.5 && !this.picked) this.rig.lag = 0.5
    }
    this.entrance.step(dt)
    if (this.nudgeT >= 0 && (this.nudgeT += dt) > 2.6) this.nudgeT = -1
    this.updatePlaces(dt, t)
    this.updateMates(dt, t)
    this.updatePokes(dt, t)
    this.updateSky(dt, t)
    this.spray.update(dt)
    this.foam.update(dt)
    this.lights.follow(this.overview.center.x, 0.2, this.overview.center.z)
    this.frame()
    this.rig.setShot(this.shot(), this.entrance.running && !this.picked && !arrivingNow)
    this.rig.update(dt)
  }

  render() {
    this.renderer.render(this.scene, this.rig.camera)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  // ---------------------------------------------------------------- the places and the friends

  /** Is this chapter still to do (its friend not on the team)? */
  private todo(id: PlaceId) {
    if (id === 'party') return false
    return !this.mates.get(id as ChapterId)?.team
  }

  private updatePlaces(dt: number, t: number) {
    for (const p of this.places.values()) {
      if (p.t >= 0 && (p.t += dt) > 1.2) p.t = -1
      p.update(dt, t)
      // A happy bounce when tapped; still to do, a soft pulse when she's idle and a bigger bounce when she tapped the
      // rink too soon.
      let s = 0
      let pop = p.t >= 0 ? 0.1 * bell(clamp(p.t / 0.45, 0, 1)) : 0
      if (this.todo(p.id) && p.t < 0) {
        const phase = p.root.position.x * 0.7
        const nudge = this.nudgeT >= 0 ? 0.1 * bell(clamp((this.nudgeT - Math.abs(phase) * 0.04) / 0.6, 0, 1)) : 0
        s = nudge + (this.hint ? 0.05 * Math.max(0, Math.sin(t * 3 + phase)) : 0)
        if ((this.hint || this.nudgeT >= 0) && Math.random() < dt * (this.nudgeT >= 0 ? 6 : 1.2)) this.sparkleAt(p.root.position, 0.9, 1)
      }
      pop = Math.max(pop, 0)
      p.root.scale.set(p.k * (1 + pop + s * 0.6), p.k * (1 - pop * 0.7 + s), p.k * (1 + pop + s * 0.6))
    }
    // The rink's glow, when the whole team is home: it breathes and sparkles until she taps it.
    if (this.glowing) {
      const g = this.rink.glow
      const k = 1 + 0.06 * Math.sin(t * 3.2)
      g.scale.set(k, 1, k)
      if (Math.random() < dt * 3) {
        const at = this.rink.place.root.localToWorld(tmp.copy(this.rink.rinkAt))
        this.spray.emit(at.x + (Math.random() - 0.5) * 1.6, at.y + 0.1, at.z + (Math.random() - 0.5) * 0.6, 0, 0.7, 0, 1.0, 0.06, PINKC + (Math.random() < 0.5 ? 1 : 0))
      }
    }
    // The campfire's sparks.
    if (Math.random() < dt * 2.5) {
      const f = this.camp.flames.getWorldPosition(tmp)
      this.spray.emit(f.x, f.y + 0.2, f.z, (Math.random() - 0.5) * 0.1, 0.5, 0, 0.8, 0.03, 3)
    }
    // Mont-Sainte-Anne's waterfall foams into Monty's pond.
    if (Math.random() < dt * 4) {
      const mt = this.places.get('bike')!.root
      const at = mt.localToWorld(tmp.copy(mt.userData.foam as Vector3))
      this.foam.emit(at.x, at.y, at.z, (Math.random() - 0.5) * 0.08, 0, 0.05, 1, 0.09)
    }
    // Tofino's whale spouts now and then.
    const spout = Math.sin(t * 0.45) > 0.985 || (this.places.get('whales')!.t > 0 && this.places.get('whales')!.t < 0.6)
    if (spout && Math.random() < dt * 40) {
      const at = this.bay.place.root.localToWorld(tmp.copy(this.bay.hole))
      this.spray.emit(at.x, at.y, at.z, (Math.random() - 0.5) * 0.25, 1.4 + Math.random() * 0.4, (Math.random() - 0.5) * 0.25, 0.9, 0.05, Math.random() < 0.5 ? DROP : WHITE)
    }
  }

  private updateMates(dt: number, t: number) {
    const cam = this.rig.camera.position
    // (Each spot stands in a place that is turned toward the camera's side itself: take that turn off.)
    const turned = (this.base.yaw * Math.PI) / 180
    const face = (spot: Group, sway: number) => {
      const p = spot.getWorldPosition(tmp)
      spot.rotation.y = Math.atan2(cam.x - p.x, cam.z - p.z) - turned + Math.sin(t * 0.8 + sway) * 0.12
    }
    face(this.mapleSpot, 0)
    this.maple.update(dt, t)
    for (const m of this.mates.values()) {
      face(m.spot, m.size * 7)
      // Arriving at the rink: she pops in with sparkles and a chime.
      if (m.pop >= 0) {
        const k = (m.pop += dt) - (MAP_CAM.cover + 0.3)
        if (k >= 0 && m.spot.scale.x < 0.01) {
          hubSfx.arrive()
          hubSfx.chime()
          const at = m.spot.getWorldPosition(tmp2)
          this.spray.burst(at.x, at.y + m.size * 0.5, at.z, 22, 1.0, 1.2, 0.07, PINKC)
          this.spray.burst(at.x, at.y + m.size * 0.5, at.z, 10, 0.8, 1.0, 0.06, 3)
          m.actor.hop()
          m.actor.wave()
        }
        const s = k < 0 ? 0.001 : Math.min(1, 1 + Math.sin(k * 9) * Math.exp(-k * 5) * 0.4 - Math.exp(-k * 14))
        m.spot.scale.setScalar(Math.max(0.001, s))
        if (k > 1.5) m.pop = -1
      }
      if (!m.team) this.homeLife(m, t)
      m.actor.update(dt, t)
    }
  }

  /** What each friend does at home while she looks on. */
  private homeLife(m: Mate, t: number) {
    switch (m.id) {
      case 'bike': {
        // Monty chews, standing in his pond.
        m.actor.headTurn = Math.sin(t * 0.5) * 0.25
        m.actor.lean = 0.05 + Math.abs(Math.sin(t * 5)) * 0.05
        break
      }
      case 'campfire': {
        // Roxy peeks out round the tent, then ducks back.
        const out = clamp(Math.sin(t * 0.8) * 1.6, 0, 1)
        m.spot.position.lerpVectors(this.camp.peek.hide, this.camp.peek.out, out)
        m.actor.lean = out * 0.25
        m.actor.headTurn = Math.sin(t * 2) * 0.3 * out
        break
      }
      case 'canoe': {
        // Lulu glides little circles by the canoe.
        const a = t * 0.35
        const f = this.lake.float
        m.spot.position.set(f.x + Math.cos(a) * 0.14, f.y + Math.sin(t * 1.7) * 0.01, f.z + Math.sin(a) * 0.08)
        break
      }
      case 'whales': {
        // Ollie bobs on her back.
        m.spot.position.y = 0.0 + Math.sin(t * 1.4) * 0.025
        m.tilt.rotation.z = Math.sin(t * 0.9) * 0.15
        break
      }
      case 'salmon': {
        m.actor.headTurn = Math.sin(t * 0.7) * 0.4
        break
      }
    }
  }

  // ---------------------------------------------------------------- the pokes

  private updatePokes(dt: number, t: number) {
    for (const p of this.pokes.values()) if (p.t >= 0) p.t += dt
    const done = (id: PokeId, after: number) => {
      const p = this.pokes.get(id)!
      if (p.t > after) p.t = -1
      return p
    }

    // The geese skate rings on the rink's ice, Gus in front; poked, they hop and flap.
    {
      const p = done('geese', 1.6)
      const L = this.rink.loop
      this.geese.forEach((g, i) => {
        const a = t * 0.8 - (i * TAU) / 3
        const x = L.x + Math.cos(a) * L.rx
        const z = L.z + Math.sin(a) * L.rz
        g.root.position.set(x, 0.1, z)
        g.root.rotation.y = Math.atan2(-Math.sin(a) * L.rx, Math.cos(a) * L.rz)
        g.lean = 0.15
        g.armsUp = p.t >= 0 ? bell(clamp((p.t - i * 0.12) / 0.9, 0, 1)) : 0
        g.update(dt, t)
      })
      this.rink.place.root.localToWorld(p.at.set(L.x, 0.35, L.z))
    }

    // The polar bear on his island: poked, he waves and hops.
    {
      const p = done('polar', 1.8)
      const bear = this.bear.root.parent!
      const cam = this.rig.camera.position
      bear.rotation.y = Math.atan2(cam.x - bear.position.x, cam.z - bear.position.z) + Math.sin(t * 0.6) * 0.2
      this.bear.update(dt, t)
      p.at.copy(bear.position).setY(bear.position.y + 0.32)
    }

    // The bison grazes on the prairie; poked, it flops over and rolls in a puff of dust.
    {
      const p = done('bison', 1.6)
      const b = this.bisonToy
      const k = p.t >= 0 ? clamp(p.t / 1.2, 0, 1) : 0
      b.head.rotation.x = p.t >= 0 ? 0 : 0.25 + 0.3 * Math.max(0, Math.sin(t * 0.6)) ** 4
      b.body.rotation.z = p.t >= 0 ? -TAU * (k * k * (3 - 2 * k)) : 0
      b.body.position.y = p.t >= 0 ? 0.12 * Math.sin(k * Math.PI) : 0
      b.root.rotation.y = 0.5 + Math.sin(t * 0.15) * 0.3
      if (p.t >= 0 && p.t < 1.2 && Math.random() < dt * 30) this.spray.emit(b.root.position.x + (Math.random() - 0.5) * 0.5, b.root.position.y + 0.05, b.root.position.z + (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, 0.5, (Math.random() - 0.5) * 0.4, 0.8, 0.07, DUST)
      p.at.copy(b.root.position).setY(b.root.position.y + 0.3)
    }

    // The beluga swims round Hudson Bay; poked, it pops up, spins and chirps.
    this.swim('beluga', this.belugaToy, dt, t, 0.55, 0.38, 0.35)
    // The orca swims the Pacific; poked, it leaps.
    this.swim('orca', this.orcaToy, dt, t, 0.3, 0.42, 0.45)

    // Sparkle's balloon drifts over the north; poked, the burner roars, it climbs and spins, and sparkles fall.
    {
      const p = done('balloon', 3)
      const b = this.balloon
      const home = POKES.balloon
      const lift = p.t >= 0 ? bell(clamp(p.t / 3, 0, 1)) : 0
      b.root.position.set(home[0] + Math.sin(t * 0.13) * 1.2, 1.45 + Math.sin(t * 0.7) * 0.08 + lift * 0.6, home[1] + Math.cos(t * 0.11) * 0.6)
      b.root.rotation.y = p.t >= 0 ? clamp(p.t / 2.4, 0, 1) ** 2 * TAU : t * 0.1
      b.update(dt, t)
      if (p.t >= 0 && p.t < 2.2 && Math.random() < dt * 24) this.spray.emit(b.root.position.x + (Math.random() - 0.5) * 0.4, b.root.position.y + 0.4 + Math.random() * 0.5, b.root.position.z + (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, 0.3, (Math.random() - 0.5) * 0.4, 1.1, 0.06, 2 + Math.floor(Math.random() * 2))
      p.at.copy(b.root.position).setY(b.root.position.y + 0.5)
    }

    // The ice floes bob and turn; a tapped one bumps.
    for (const f of this.floes) {
      if (f.t >= 0 && (f.t += dt) > 0.8) f.t = -1
      const bump = f.t >= 0 ? 0.05 * bell(clamp(f.t / 0.5, 0, 1)) : 0
      f.root.position.set(f.x + Math.sin(t * 0.12 + f.ph) * 0.15, 0.01 + Math.sin(t * 1.1 + f.ph) * 0.008 + bump, f.z + Math.cos(t * 0.1 + f.ph) * 0.1)
      f.root.rotation.set(Math.sin(t * 0.9 + f.ph) * 0.03, t * 0.05 + f.ph, 0)
    }
  }

  /** A whale going round a loop, coming up to breathe; poked, it leaps (or the beluga spins up). */
  private swim(id: 'beluga' | 'orca', s: Swimmer, dt: number, t: number, rx: number, rz: number, speed: number) {
    const p = this.pokes.get(id)!
    if (p.t > 1.6) p.t = -1
    const home = POKES[id]
    s.root.userData.a = (s.root.userData.a ?? (id === 'orca' ? 1 : 0)) + dt * speed
    const a = s.root.userData.a as number
    const k = p.t >= 0 ? clamp(p.t / 1.3, 0, 1) : 0
    const leap = p.t >= 0 ? bell(k) * (id === 'orca' ? 0.6 : 0.3) : 0
    s.root.position.set(home[0] + Math.cos(a) * rx, 0.02 + Math.sin(t * 1.3) * 0.02 + leap, home[1] + Math.sin(a) * rz)
    s.root.rotation.set(id === 'orca' && p.t >= 0 ? -1.0 + 2.0 * k : 0, Math.atan2(-Math.sin(a) * rx, Math.cos(a) * rz) + (id === 'beluga' && p.t >= 0 ? k * TAU : 0), 0)
    s.tail.rotation.x = Math.sin(t * (p.t >= 0 ? 10 : 3)) * 0.35
    if (p.t >= 0 && p.t - dt < 1.25 && p.t >= 1.25) {
      this.foam.burst(s.root.position.x, 0.012, s.root.position.z, 6, 0.5, 0, 0.2)
      for (let i = 0; i < 8; i++) this.spray.emit(s.root.position.x, 0.05, s.root.position.z, (Math.random() - 0.5) * 0.9, 0.9 + Math.random() * 0.5, (Math.random() - 0.5) * 0.9, 0.7, 0.06, DROP)
      hubSfx.splash()
    }
    if (Math.random() < dt * 1.5) this.foam.emit(s.root.position.x, 0.012, s.root.position.z, 0, 0, 0, 1.1, 0.12)
    p.at.copy(s.root.position).setY(0.15)
  }

  private updateSky(dt: number, t: number) {
    for (const c of this.clouds) {
      if (c.t >= 0 && (c.t += dt) > 1.2) c.t = -1
      const p = c.root.position
      p.x += c.speed * dt
      if (p.x > 9.5) p.x = -9.5
      p.y = c.y + Math.sin(t * 0.7 + c.speed * 90) * 0.05
      const pop = c.t >= 0 ? 0.3 * bell(clamp(c.t / 0.6, 0, 1)) : 0
      c.root.scale.set(1 + pop, 1 - pop * 0.7, 1 + pop)
      c.shadow.position.set(p.x, this.ground(p.x, p.z) + 0.02, p.z)
      c.shadow.visible = this.field.canada(p.x, p.z) > 0.1
    }
    this.under.forEach((c, i) => (c.position.y += Math.sin(t * 0.4 + i * 1.9) * 0.0012))
  }

  private sparkleAt(at: Vector3, up: number, n: number) {
    for (let i = 0; i < n; i++) this.spray.emit(at.x + (Math.random() - 0.5) * 0.8, at.y + up * Math.random(), at.z + (Math.random() - 0.5) * 0.6, 0, 0.6, 0, 1.0, 0.055, PINKC + (i % 2))
  }

  // ---------------------------------------------------------------- her finger

  private toScreen(v: Vector3) {
    const p = tmp2.copy(v).project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h }
  }

  /** Screen pixels per unit at this spot. */
  private ppu(at: Vector3) {
    const a = this.toScreen(at)
    const ax = a.x
    const ay = a.y
    const right = tmp.set(1, 0, 0).applyQuaternion(this.rig.camera.quaternion)
    const b = this.toScreen(right.add(at))
    return Math.hypot(b.x - ax, b.y - ay)
  }

  pointerDown() {}
  pointerMove() {}
  pointerUp() {}

  tap(x: number, y: number, id?: string): void {
    this.touches++
    this.events.touched()
    if (this.picked) return
    if (this.arriving && this.arrivalT < this.arriveEnd) {
      // A tap during the arrival skips to the board.
      this.arrivalT = this.arriveEnd
      this.entrance.finish()
      this.rig.lag = 0.5
    }
    if (id?.startsWith('go:')) {
      // A place's target is big: if her finger is really on a friend at the rink or a goose, they answer instead.
      const near = id === 'go:party' && x + y > 0 ? this.thingUnder(x, y) : null
      if (near) return this.tap(x, y, near)
      return this.pick(id.slice(3) as PlaceId)
    }
    if (id?.startsWith('team:')) {
      const m = this.mates.get(id.slice(5) as ChapterId)
      if (!m) return
      m.actor.hop()
      m.actor.wave()
      hubSfx.hop()
      return this.events.team(m.id)
    }
    if (id?.startsWith('poke:')) return this.poke(id.slice(5) as PokeId)
    // Anything else: whatever her finger lands on answers.
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    const cloud = this.raycaster.intersectObjects(this.clouds.map((c) => c.root), true)[0]
    if (cloud) {
      const c = this.clouds.find((k) => k.root === cloud.object.parent)
      if (c) c.t = 0
      hubSfx.puff()
      this.spray.burst(cloud.point.x, cloud.point.y, cloud.point.z, 7, 0.5, 0.6, 0.1, WHITE)
      return
    }
    // A place's model or a friend (outside its target box, from a steep angle): it opens.
    for (const p of this.places.values()) {
      if (this.raycaster.intersectObject(p.root, true).length) return this.pick(p.id)
    }
    const ice = this.raycaster.intersectObjects(this.floes.map((f) => f.root), true)[0]
    if (ice) {
      const f = this.floes.find((k) => k.root === ice.object.parent)
      if (f) f.t = 0
      hubSfx.ice()
      this.foam.burst(ice.point.x, 0.012, ice.point.z, 5, 0.4, 0, 0.18)
      return
    }
    const hit = this.raycaster.intersectObjects([this.scenery, this.land, this.sea.mesh], true)[0]
    if (!hit) return hubSfx.puff()
    const at = hit.point
    if (hit.object === this.sea.mesh) {
      hubSfx.splash()
      this.foam.burst(at.x, 0.012, at.z, 6, 0.5, 0, 0.2)
      this.spray.burst(at.x, 0.04, at.z, 5, 0.4, 1, 0.07, DROP)
      if (at.x > -1.1 && at.x < 1.5 && at.z > -2.0 && at.z < 1.2) this.events.spot('hudson')
      return
    }
    const rk = fromRockies(at.x, at.z)
    if (hit.object !== this.land || rk.d < 0.4) {
      // A tree or a mountain: snow or needles fly.
      const peak = rk.d < 0.6 && this.peaks.some((p) => Math.hypot(p.x - at.x, p.z - at.z) < 0.6)
      hubSfx.puff()
      this.spray.burst(at.x, at.y + 0.05, at.z, 8, 0.6, 0.9, 0.08, peak ? WHITE : 4)
      if (peak || rk.d < 0.4) this.events.spot('rockies')
      return
    }
    // The ground: a pop of snow (up north) or pink and butter confetti.
    hubSfx.pop()
    const north = at.z < snowLine(at.x, at.z)
    for (let i = 0; i < 7; i++) this.spray.emit(at.x, at.y + 0.05, at.z, (Math.random() - 0.5) * 0.9, 0.9 + Math.random() * 0.6, (Math.random() - 0.5) * 0.9, 0.7, 0.07, north ? WHITE : 2 + (i % 2) + (i % 3 === 0 ? 1 : 0))
    if (north) this.events.spot('north')
    else if (at.x > -3.3 && at.x < -0.95 && at.z > 0.95 && at.z < 2.95) this.events.spot('prairie')
  }

  /** A friend at the rink or a goose under her finger (it answers instead of the rink opening). */
  private thingUnder(x: number, y: number): string | null {
    let best: string | null = null
    let bestD = Infinity
    const check = (id: string, at: Vector3, size: number) => {
      const s = this.toScreen(at)
      const d = Math.hypot(x - s.x, y - s.y)
      if (d < Math.max(24, this.ppu(at) * size * 0.45) && d < bestD) {
        bestD = d
        best = id
      }
    }
    for (const m of this.mates.values()) if (m.team) check(`team:${m.id}`, m.actor.at(0.5, tmp.clone()), m.size * 0.7)
    this.geese.forEach((g) => check('poke:geese', g.at(0.5, tmp.clone()), 0.4))
    return best
  }

  private pick(id: PlaceId) {
    const p = this.places.get(id)!
    p.t = 0
    hubSfx.hop()
    // The friend who lives there (or the rink's Maple) hops too.
    if (id === 'party') this.maple.hop()
    else {
      const m = this.mates.get(id as ChapterId)
      if (m && !m.team) m.actor.hop()
    }
    if (id === 'bike') hubSfx.munch()
    if (id === 'campfire') hubSfx.crackle()
    if (id === 'canoe') hubSfx.loon()
    if (id === 'whales') hubSfx.spout()
    if (id === 'salmon') hubSfx.splash()
    if (id === 'party' && !this.glowing) {
      this.nudgeT = 0
      return this.events.locked()
    }
    this.picked = p
    this.pickedT = 0
    this.setGlow(false)
    // The camera closes in on the place.
    this.close.center.copy(p.root.position).setY(p.root.position.y + 0.35)
    this.closeHalf(1.5, 0.6, 1.1)
    this.rig.lag = 0.28
    this.rig.resetTurn()
    hubSfx.zoom()
    this.sparkleAt(p.root.position, 1, 10)
    this.events.pick(id)
  }

  private poke(id: PokeId) {
    const p = this.pokes.get(id)!
    this.events.poked(id)
    const fresh = p.t < 0
    if (fresh) p.t = 0
    switch (id) {
      case 'geese':
        hubSfx.honks()
        if (fresh) this.geese.forEach((g) => g.hop())
        break
      case 'polar':
        hubSfx.bear()
        if (fresh) {
          this.bear.wave()
          this.bear.hop()
        }
        break
      case 'bison':
        hubSfx.bison()
        break
      case 'beluga':
        hubSfx.beluga()
        break
      case 'orca':
        hubSfx.orca()
        break
      case 'balloon':
        hubSfx.burner()
        break
    }
  }

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    this.targets = {}
    for (const [id, el] of this.anchorEls) {
      let spot: { x: number; y: number; w: number; h: number; z: number } | null = null
      const free = !this.picked && !(this.arriving && this.arrivalT < this.arriveEnd)
      if (id.startsWith('go:') && free) {
        const p = this.places.get(id.slice(3) as PlaceId)
        if (p) spot = this.placeBox(p, min)
      } else if (id.startsWith('team:') && free) {
        const m = this.mates.get(id.slice(5) as ChapterId)
        if (m?.team) {
          const at = m.actor.at(0.5, tmp.clone())
          const s = this.toScreen(at)
          const d = Math.max(min * 0.8, this.ppu(at) * m.size * 0.8)
          spot = { x: s.x, y: s.y, w: d * 0.8, h: d, z: 4000 }
        }
      } else if (id.startsWith('poke:') && free) {
        const p = this.pokes.get(id.slice(5) as PokeId)
        if (p) {
          const s = this.toScreen(p.at)
          const d = Math.max(id === 'poke:geese' ? 48 : min, this.ppu(p.at) * p.size)
          spot = { x: s.x, y: s.y, w: d, h: d, z: id === 'poke:geese' ? 3000 : 6000 }
        }
      }
      const show = !!spot && spot.x >= 0 && spot.x <= this.w && spot.y >= this.top && spot.y <= this.h
      if (show && spot) {
        el.style.transform = `translate3d(${spot.x - spot.w / 2}px, ${spot.y - spot.h / 2}px, 0)`
        el.style.width = `${spot.w}px`
        el.style.height = `${spot.h}px`
        el.style.zIndex = String(spot.z)
        this.targets[id] = { x: Math.round(spot.x), y: Math.round(spot.y), w: Math.round(spot.w), h: Math.round(spot.h) }
      }
      el.style.display = show ? '' : 'none'
    }
  }

  /** A place's target: the screen box round its diorama (and its friend at home). The rink's is centered on the ice's
   *  left half, so the middle of it is the rink itself, never a friend or a goose. */
  private placeBox(p: PlaceToy, min: number) {
    const { hw, hd, h } = p.size
    let x0 = Infinity
    let x1 = -Infinity
    let y0 = Infinity
    let y1 = -Infinity
    const cx = p.id === 'party' ? 0.15 : 0
    const cz = p.id === 'party' ? -0.05 : 0
    for (const sx of [-1, 1]) for (const sy of [0, 1]) for (const sz of [-1, 1]) {
      const s = this.toScreen(p.root.localToWorld(tmp.set(cx + sx * hw, sy * h, cz + sz * hd)))
      x0 = Math.min(x0, s.x)
      x1 = Math.max(x1, s.x)
      y0 = Math.min(y0, s.y)
      y1 = Math.max(y1, s.y)
    }
    let x = (x0 + x1) / 2
    let y = (y0 + y1) / 2
    let w = x1 - x0
    let hh = y1 - y0
    if (p.id === 'party') {
      // Centered on the ice: as wide and tall as it needs to reach the box's edges from there.
      const c = this.toScreen(p.root.localToWorld(tmp.copy(this.rink.aim)))
      w = 2 * Math.max(c.x - x0, x1 - c.x) * 0.85
      hh = 2 * Math.max(c.y - y0, y1 - c.y) * 0.8
      x = c.x
      y = c.y
    }
    return { x, y, w: Math.max(min, w * 0.92), h: Math.max(min, hh * 0.92), z: 5000 }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    return {
      touches: this.touches,
      yaw: Math.round(this.rig.yaw * 10) / 10,
      buildMs: this.buildMs,
      picked: this.picked?.id ?? null,
      team: [...this.mates.values()].filter((m) => m.team).map((m) => m.id),
      arriving: this.arriving && this.arrivalT < this.arriveEnd ? this.arriving.id : null,
      glowing: this.glowing,
      hint: this.hint,
      entering: this.entrance.running,
      poking: [...this.pokes.values()].filter((p) => p.t >= 0).map((p) => p.id),
      /** Where each tap target is on screen (center, size), for the robots. */
      targets: this.targets,
    }
  }

  memory() {
    return { ...this.renderer.info.memory }
  }

  dispose() {
    this.scene.clear()
    this.bag.dispose()
  }
}

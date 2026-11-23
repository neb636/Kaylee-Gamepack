// The Canada map (planning/around-the-world/canada.md, "The map"): Canada as a chunky toy tray floating in the sky, the
// way the Thailand maps are. Seven places stand on it east to west, each a little diorama with its friend in it, big
// and alive: tap a place (or its friend) and it hops, the camera closes in, and the chapter opens. Ottawa's rink is the
// story's home: Maple and the Maple Cup, Gus's geese skating rings on the ice, and every friend she has brought home
// standing in a row in the team's pink scarf (their home then wears a little pink flag). Every friend still to fetch
// has a round pink heart pin bobbing over them from the first frame (pins.ts) and waves now and then. With the whole
// team there the rink glows and wears the pin until she taps it: the big game. Everything else on the board is smaller
// and quieter than the friends and answers a poke (the geese, a snowy owl who turns her head right round, an orca, a
// bison who rolls in the dust, a beluga, Sparkle's balloon, the clouds, the ice floes, the Rockies, the snowy north,
// Hudson Bay). She can swing the board round with a drag and pinch it closer (board.ts).
//
// Round two (canada-round-2.md in git history): a new friend arriving at the rink shows their move once
// their pop-in ends (moves.ts), and a tap on a friend already on the team plays it again; Gus, skating on the ice,
// stops, turns to the newcomer and pulls a face while he says his line (the page says when). The team's skate hut
// beside the canal (hut.ts) opens the Team Cabin.
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
import { dressToy } from '../characters/dress'
import type { Performer, ToyActor } from '../characters/toy'
import { Tuque } from '../characters/tuque'
import { DRESSABLE, wornBy, type TeamId } from '../looks'
import { Friend } from '../story/cast'
import { CHAPTERS, type ChapterId } from '../story/chapters'
import { Balloon } from '../story/props'
import { beluga, bison, floe, orca, snowyOwl, type Bison, type Owl, type Swimmer } from './critters'
import { MapMoves, moveFocus, MOVE_S } from './moves'
import { heartPin, PIN_R } from './pins'
import { buildBay, buildCamp, buildCastle, buildForest, buildLake, buildMountain, buildRink, inkLift, type PlaceToy } from './places'
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
  /** A friend's move has played to its end (`arrival`: the newcomer's, as she lands back; Gus's line is next). */
  moved(id: ChapterId, arrival: boolean): void
  /** She tapped the team's skate hut: its door is open, the camera is closing in (the page opens the cabin). */
  cabin(): void
  /** Any touch at all (the idle glow waits again). */
  touched(): void
  /** The camera has moved behind the loading cover long enough: it can fade. */
  revealed(): void
}

/** Each friend's name (their target's label). */
export const WHO: Record<ChapterId, string> = { snowman: 'Tuque', bike: 'Monty', campfire: 'Roxy', canoe: 'Lulu', bath: 'Misty', whales: 'Ollie' }

/** The DOM targets the page lays over the animals and the team (the places' own targets are the page's). */
export const MAP_ANCHORS: AnchorInfo[] = [
  { id: 'poke:geese', label: 'Gus and the geese', kind: 'thing' },
  { id: 'poke:owl', label: 'The snowy owl', kind: 'thing' },
  { id: 'poke:orca', label: 'The orca', kind: 'thing' },
  { id: 'poke:bison', label: 'The bison', kind: 'thing' },
  { id: 'poke:beluga', label: 'The beluga', kind: 'thing' },
  { id: 'poke:balloon', label: "Sparkle's balloon", kind: 'thing' },
  { id: 'hut', label: "The team's skate hut: the Team Cabin", kind: 'thing' },
  ...CHAPTERS.map((id) => ({ id: `team:${id}`, label: `On the team: ${WHO[id]}`, kind: 'thing' as const })),
]

/** The map camera's entrance, tuned in the feel lab (?feel=1). */
export const MAP_CAM = mapCamKnobs('canada-map-cam', 'Canada map camera', 'src/world/places/canada/map/world.ts', { yaw: 0, pitch: -12, zoom: 0.9 }, { activity: 'hub', sections: ['map'] })

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
  /** When she next waves from home (seconds of the map's clock). */
  waveAt: number
}

/** A heart pin over a place still to do: where it floats (in the place's own space, so it rides the bounce). */
interface Pin {
  root: Group
  at: Vector3
  ph: number
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
/** A hand-built toy in what she chose for it in the Team Cabin (characters/dress.ts). */
const dressed = <T extends ToyActor>(a: T, who: TeamId, bag: Bag): T => {
  dressToy(a, who, wornBy(who), bag)
  return a
}
const tmp3 = new Vector3()
const TAU = Math.PI * 2
/** From angle `a` toward `b` by `k` (0..1), the short way round. */
const turn = (a: number, b: number, k: number) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k
/** How much bigger the friends at home stand on a tall screen. */
const HOME_TALL = 1.25
/** The smallest a heart pin's badge gets across on screen (px), however small the screen. */
const PIN_MIN_PX = 34

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
  /** The arrival's clock marks: the newcomer's move starts, it ends, and the camera may leave the rink. */
  private moveAt = Infinity
  private moveEnd = Infinity
  private holdUntil = Infinity
  /** The camera has left the rink after an arrival (it held long enough, or she tapped). */
  private leftRink = false
  private lagBackAt = Infinity
  /** The friends' moves (moves.ts), and the camera nudged in toward the rink while one plays from a tap. */
  private moves: MapMoves
  private qaShot: Shot = { center: new Vector3(), half: new Vector3(), yaw: 0, pitch: 30, maxDist: 200, objectFit: 'contain' }
  private peek: Shot = { center: new Vector3(), half: new Vector3(), yaw: 0, pitch: 50, maxDist: 200 }
  private peekT = 0
  private peekAt = new Vector3()
  /** Gus reacting to the newcomer (seconds into it, -1: skating), how many are on the team, the face he pulls. */
  private gusT = -1
  private gusN = 0
  private gusAt = new Vector3()
  /** The geese's skating ring: how far round, and how fast (they stop while Gus reacts). */
  private loopA = 0
  private loopV = 1
  private gusW = 0
  /** She tapped the skate hut: the camera is closing in on it. */
  private hutOpen = false
  /** She has put something on somebody in the Team Cabin (the hut stops asking). */
  private dressedAny = DRESSABLE.some((who) => Object.keys(wornBy(who)).length > 0)
  /** The move the arrival started (its end is Gus's cue), and the moves playing last frame. */
  private arrivalRun: ChapterId | null = null
  private wasPlaying = new Set<ChapterId>()
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
  private pins = new Map<PlaceId, Pin>()
  /** The friends at home stand bigger on a tall screen, where the far (Pacific) end of the board is small. */
  private homeK = 1
  private owl!: Owl
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
    this.maple = new Friend('maple', this.bag, { height: 0.86, voice: 'maple' })
    this.mapleSpot.position.copy(this.rink.maple)
    this.mapleSpot.add(this.maple.root, blobShadow(0.22, this.bag))
    this.maple.place(0, 0, 0, 0)
    this.rink.place.root.add(this.mapleSpot)

    // The friends, at home or on the team.
    const make: Record<ChapterId, () => Mate['actor']> = {
      snowman: () => dressed(new Tuque(this.bag, { height: 0.9 }), 'tuque', this.bag),
      bike: () => new Friend('moose', this.bag, { height: 1.15, voice: 'moose' }),
      campfire: () => new Friend('raccoon', this.bag, { height: 0.72, voice: 'raccoon' }),
      canoe: () => dressed(new Lulu(this.bag, { height: 0.85 }), 'lulu', this.bag),
      // (At home she is the plain white bear; on the team she wears the look from her bath.)
      bath: () => new Friend('spirit', this.bag, { height: 1.05, voice: 'bear', plain: !team.includes('bath') }),
      whales: () => new Friend('otter', this.bag, { height: 0.75, voice: 'otter' }),
    }
    const size: Record<ChapterId, number> = { snowman: 0.9, bike: 1.15, campfire: 0.72, canoe: 0.85, bath: 1.05, whales: 0.75 }
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
      const m: Mate = { id, actor, spot, tilt, team: onTeam, pop: -1, size: size[id], waveAt: 1.5 + CHAPTERS.indexOf(id) * 1.3 }
      this.mates.set(id, m)
      this.seat(m)
    }
    this.castle.heap.visible = !team.includes('snowman')
    for (const id of CHAPTERS) this.places.get(id)!.flag.visible = team.includes(id)
    this.moves = new MapMoves({ bag: this.bag, rink: this.rink.place.root, spray: this.spray, maple: this.maple })
    const fresh = arriving ? this.mates.get(arriving) : undefined
    if (fresh?.team) {
      this.arriving = fresh
      this.arrivalT = 0
      fresh.pop = 0
      fresh.spot.scale.setScalar(0.001)
      // (The pop-in ends about 1.5 s after it starts: then the move, then the camera holds a moment for Gus.)
      this.moveAt = MAP_CAM.cover + 2.0
      this.moveEnd = this.moveAt + MOVE_S[fresh.id]
      this.holdUntil = this.moveEnd + 3.2
    }

    this.buildPokes()
    this.buildPins()
    this.buildSky()
    // (The friends, Maple and the geese keep their own lines.)
    const actors = [this.maple.root, ...[...this.mates.values()].map((m) => m.actor.root), ...this.geese.map((g) => g.root)]
    // (Nor the heart pins: nothing stands behind them, and a lifted line shows through their thin face.)
    inkLift(this.scene, undefined, new Set([...actors, ...[...this.pins.values()].map((p) => p.root)]))
    this.buildMs = Math.round(performance.now() - began)
  }

  /** A heart pin over every place (shown while it's still to do; the rink's only once the whole team is home). Each
   *  floats over its friend's head (or Tuque's snowballs, or Roxy's tent), in the place's own space. */
  private buildPins() {
    const over = (id: PlaceId): Vector3 => {
      const top = (h: number) => h + 0.32
      switch (id) {
        case 'party':
          return new Vector3(this.rink.maple.x - 0.1, top(0.95), this.rink.maple.z - 0.05)
        case 'snowman':
          return new Vector3(0.48, top(0.66), 0.35)
        case 'campfire':
          return new Vector3(this.camp.peek.out.x - 0.08, top(0.72), this.camp.peek.out.z - 0.1)
        case 'canoe':
          return new Vector3(this.lake.float.x, top(0.85), this.lake.float.z)
        case 'whales':
          return new Vector3(0, top(0.4), 0.2)
        default: {
          const home = this.places.get(id)!.home ?? new Vector3()
          return new Vector3(home.x, top(this.mates.get(id as ChapterId)?.size ?? 1), home.z)
        }
      }
    }
    for (const id of this.places.keys()) {
      const root = heartPin(this.bag)
      root.visible = false
      this.scene.add(root)
      this.pins.set(id, { root, at: over(id), ph: (PLACES[id][0] + 8) * 0.9 })
    }
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
    this.geese = [dressed(new Goose(this.bag, { height: 0.58, voice: 'gus', captain: true, stick: true }), 'gus', this.bag), new Goose(this.bag, { height: 0.48 }), new Goose(this.bag, { height: 0.48 })]
    for (const g of this.geese) {
      this.rink.place.root.add(g.root)
      g.place(0, 0.1, 0, 0)
    }
    this.pokes.set('geese', { id: 'geese', at: new Vector3(), size: 0.6, t: -1 })

    // (Every animal here is smaller and quieter than the friends, so none is taken for one.)
    this.owl = snowyOwl(this.bag)
    this.owl.root.scale.setScalar(1.25)
    this.owl.root.add(blobShadow(0.2, this.bag))
    this.add('owl', this.owl.root, 0.7)

    this.bisonToy = bison(this.bag)
    this.bisonToy.root.scale.setScalar(1.15)
    this.bisonToy.root.add(blobShadow(0.28, this.bag))
    this.add('bison', this.bisonToy.root, 0.7)

    this.belugaToy = beluga(this.bag)
    this.belugaToy.root.scale.setScalar(1.2)
    this.add('beluga', this.belugaToy.root, 0.6)

    this.orcaToy = orca(this.bag)
    this.orcaToy.root.scale.setScalar(1.05)
    this.add('orca', this.orcaToy.root, 0.6)

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
    // (Over the far north and the paper land's far south edge only, and low there: from the camera a high cloud looks
    // further north than it is, and one drifting over a friend's place hides who she's looking for.)
    const spots: [number, number, number, number][] = [[-5.5, -3.5, 1.0, 2.3], [1.2, -3.7, 0.9, 2.1], [4.6, 4.7, 0.8, 1.2], [-2.8, 4.75, 0.85, 1.1]]
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
    // On a tall screen the far (Pacific) end is small: the friends at home stand bigger, so each stays a big target.
    this.homeK = tall ? HOME_TALL : 1
    for (const m of this.mates.values()) if (!m.team) m.spot.scale.setScalar(this.homeK)
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

  /** The camera is on the rink for a new friend's arrival (their pop-in, their move, Gus's face). */
  private get onRink() {
    return !!this.arriving && this.arrivalT >= 0 && !this.leftRink
  }
  /** The newcomer is popping in or showing their move (the board's targets wait). */
  private get showing() {
    return this.onRink && this.arrivalT < this.moveEnd
  }
  /** The camera is closing in on something she tapped (a place, the hut). */
  private get closing() {
    return !!this.picked || this.hutOpen
  }
  /** The camera leaves the rink for the board (`lag`: how slowly). */
  private leaveRink(lag: number) {
    if (this.leftRink || !this.arriving) return
    this.leftRink = true
    this.entrance.finish()
    if (!this.closing) this.rig.lag = lag
    this.lagBackAt = this.arrivalT + 2.5
  }

  /** The page: Gus starts his line (how many are on the team now): he stops, turns to the newcomer and pulls a face,
   *  and the camera stays on the rink while he says it. */
  gusSays(n: number) {
    this.gusT = 0
    this.gusN = n
    const gus = this.geese[0]
    const who = this.arriving ?? [...this.mates.values()].filter((m) => m.team).pop()
    this.gusAt.copy(who ? who.spot.position : this.rink.maple)
    // Brags at first, then less sure with every friend: wide eyes, a dizzy spin, a nervous wobble, a gulp.
    if (n <= 2) {
      gus.pull('happy')
      gus.hop()
    } else if (n === 3) gus.silly('dazzled', 2.2)
    else if (n === 4) gus.silly('dizzy', 2.4)
    else if (n === 5) {
      gus.silly('dazzled', 2.4)
      gus.shake()
    } else gus.silly('dazzled', 3.0)
    hubSfx.honk()
    if (this.onRink && this.arrivalT >= this.moveEnd) this.holdUntil = Math.max(this.moveEnd + 0.3, Math.min(this.holdUntil, this.arrivalT + 2.2))
  }
  /** The page: nobody says anything after the move (already said this visit): the camera can go. */
  release() {
    if (this.onRink) this.holdUntil = Math.max(this.arrivalT, this.moveEnd + 0.3)
  }

  /** The shot right now: the place she picked, the rink while a new friend arrives, or the board. */
  private shot(): Shot {
    // QA: `window.__canadaMapCloseup = 'hut:<yaw>:<pitch>:<size>'` (or a friend's chapter id, or 'maple') looks at
    // one thing on the board from any side, to check how it's built.
    const qaLook = (window as { __canadaMapCloseup?: string | null }).__canadaMapCloseup
    if (qaLook) {
      const [who, yaw = '0', pitch = '30', size = '0.6'] = qaLook.split(':')
      const at = who === 'hut' ? this.hutAt(tmp3) : who === 'maple' ? this.mapleSpot.getWorldPosition(tmp3) : this.mates.get(who as ChapterId)?.spot.getWorldPosition(tmp3)
      if (at) {
        const k = +size
        this.qaShot.center.copy(at).y += who === 'hut' ? 0 : 0.4 * k
        this.qaShot.half.set(k, k * 0.75, k)
        this.qaShot.yaw = +yaw
        this.qaShot.pitch = +pitch
        return this.qaShot
      }
    }
    if (this.closing) return this.close
    this.close.objectFit = undefined
    if (this.onRink) {
      // Close on the newcomer while they show their move, the whole rink round it (Gus too), framed below the top bar.
      const a = this.arriving!
      this.close.objectFit = 'contain'
      if (this.gusN && this.arrivalT >= this.moveEnd) {
        // Gus has his say: him and the newcomer, close enough to see his face.
        const g = this.geese[0].root.getWorldPosition(tmp2)
        // (From Gus's feet up to the top of the newcomer's head, so a tall friend's face stays in the shot too.)
        const top = a.actor.at(1.08, tmp3).y
        this.close.center.copy(a.spot.getWorldPosition(tmp)).lerp(g, 0.5).setY(Math.max(g.y + 0.4, (g.y + top) / 2))
        const across = Math.max(1.3, tmp.distanceTo(g) * 0.8)
        this.closeHalf(across, Math.max(across * 0.45, (top - g.y) / 2 + 0.12), across * 0.65)
        this.close.pitch = this.overview.pitch - 10
      } else if (this.arrivalT >= this.moveAt - 0.5) {
        // The newcomer's move (and, after it, waiting for Gus).
        const across = moveFocus(a.id, a.spot, this.maple, this.close.center)
        this.closeHalf(across, across * 0.45, across * 0.65)
        // (A little lower than the board's angle, so what flies stands out against the ground.)
        this.close.pitch = this.overview.pitch - 12
      } else {
        this.close.center.copy(this.rink.place.root.position).add(tmp.set(0.2, 0.35, -0.1))
        this.closeHalf(2.5, 0.9, 1.6)
      }
      return this.close
    }
    if (this.peekT > 0) return this.peek
    return this.overview
  }

  roam(): RoamState | null {
    return this.closing || this.onRink ? null : { walk: false, jump: false }
  }

  get calm() {
    return false
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.sea.update(t)
    if (this.closing) {
      this.pickedT += dt
      this.entrance.finish()
    }
    const arrivingNow = this.onRink
    if (this.arriving && this.arrivalT >= 0) {
      const was = this.arrivalT
      this.arrivalT += dt
      const a = this.arriving
      // The newcomer's pop-in has ended: their move. When it's done, the page has Gus say his line.
      if (was < this.moveAt && this.arrivalT >= this.moveAt && this.moves.play(a)) this.arrivalRun = a.id
      if (this.onRink && this.arrivalT >= this.holdUntil) this.leaveRink(0.9)
      if (was < this.lagBackAt && this.arrivalT >= this.lagBackAt && !this.closing) this.rig.lag = 0.5
    }
    if (this.peekT > 0 && (this.peekT -= dt) <= 0 && !this.closing) this.rig.lag = 0.5
    this.entrance.step(dt)
    if (this.nudgeT >= 0 && (this.nudgeT += dt) > 2.6) this.nudgeT = -1
    // The skate hut asks to be tapped (a hop, its door peeking open) until she has dressed somebody, and whenever the
    // board's hint is on.
    this.rink.hut.invite = !this.closing && !this.onRink && (this.hint || !this.dressedAny)
    this.updatePlaces(dt, t)
    this.updateMates(dt, t)
    this.updateMoves(dt, t)
    this.updatePins(t)
    this.updatePokes(dt, t)
    this.updateSky(dt, t)
    this.spray.update(dt)
    this.foam.update(dt)
    this.lights.follow(this.overview.center.x, 0.2, this.overview.center.z)
    this.frame()
    this.rig.setShot(this.shot(), this.entrance.running && !this.closing && !arrivingNow)
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
      if (!m.team) {
        this.homeLife(m, t)
        // Now and then she waves from home: over here!
        if (t >= m.waveAt && !this.closing) {
          m.actor.wave()
          m.waveAt = t + 5.5 + Math.random() * 3
        }
      }
      m.actor.update(dt, t)
    }
  }

  /** The friends' moves (after their own update: a move adds to the pose), and the camera's nudge toward the rink
   *  while one plays from a tap. A move that has ended tells the page (the arrival's is Gus's cue). */
  private updateMoves(dt: number, t: number) {
    this.moves.update(dt, t, this.rig.camera)
    for (const id of this.wasPlaying) {
      if (this.moves.playing(id)) continue
      this.wasPlaying.delete(id)
      const arrival = id === this.arrivalRun
      if (arrival) this.arrivalRun = null
      this.events.moved(id, arrival)
    }
    for (const m of this.mates.values()) if (this.moves.playing(m.id)) this.wasPlaying.add(m.id)
    if (this.peekT > 0 && !this.closing) {
      const o = this.overview
      // (Most of the way in, and a little lower, so a move replayed from the board reads: the props in their paws,
      // what flies.)
      const K = 0.85
      const m = [...this.mates.values()].find((x) => this.moves.playing(x.id))
      if (m) {
        const across = moveFocus(m.id, m.spot, this.maple, this.peekAt)
        this.closeHalf(across * 1.2, across * 0.6, across * 0.9)
      }
      this.peek.center.copy(this.peekAt).lerp(o.center, 1 - K)
      this.peek.half.copy(o.half).lerp(this.close.half, K)
      Object.assign(this.peek, { yaw: o.yaw, pitch: o.pitch - 8 * K, objectFit: o.objectFit, roam: o.roam, maxDist: o.maxDist, minDist: o.minDist })
    }
  }

  /** The heart pins: over each place still to do (and the rink once the team is whole), facing the camera, bobbing;
   *  they bounce when she's idle or tapped the rink too soon, and never shrink below a thumbnail on a small screen. */
  private updatePins(t: number) {
    const arrivingNow = this.onRink
    for (const [id, pin] of this.pins) {
      const p = this.places.get(id)!
      const on = !this.closing && (id === 'party' ? this.glowing && !arrivingNow : this.todo(id))
      pin.root.visible = on
      if (!on) continue
      const k = id === 'party' ? 1 : this.homeK
      p.root.localToWorld(tmp3.set(pin.at.x, 0.05 + (pin.at.y - 0.05) * k, pin.at.z))
      const nudge = this.nudgeT >= 0 ? bell(clamp(this.nudgeT / 0.6, 0, 1)) : 0
      const hint = this.hint ? Math.max(0, Math.sin(t * 3 + pin.ph)) : 0
      tmp3.y += 0.05 * Math.sin(t * 2.2 + pin.ph) + 0.12 * nudge + 0.08 * hint
      pin.root.position.copy(tmp3)
      pin.root.quaternion.copy(this.rig.camera.quaternion)
      const px = this.ppu(tmp3) * PIN_R * 2
      const s = Math.max(1, PIN_MIN_PX / Math.max(px, 1)) * (1 + 0.3 * nudge + 0.12 * hint)
      pin.root.scale.setScalar(s)
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
        // Roxy sidles out from beside the tent, then back.
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
      case 'bath': {
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

    // The geese skate rings on the rink's ice, Gus in front; poked, they hop and flap. While Gus has his say about the
    // newcomer they glide to a stop and all turn to look; Roxy's move borrows the last one for a moment.
    {
      const p = done('geese', 1.6)
      const L = this.rink.loop
      if (this.gusT >= 0 && (this.gusT += dt) > 3.4) this.gusT = -1
      const react = this.gusT >= 0
      this.loopV += ((react ? 0 : 1) - this.loopV) * Math.min(1, dt * (react ? 4 : 1.5))
      this.loopA += dt * 0.8 * this.loopV
      this.gusW += ((react && this.gusT < 3.0 ? 1 : 0) - this.gusW) * Math.min(1, dt * 5)
      const lent = this.moves.lent
      this.geese.forEach((g, i) => {
        const a = this.loopA - (i * TAU) / 3
        let x = L.x + Math.cos(a) * L.rx
        let z = L.z + Math.sin(a) * L.rz
        let yaw = Math.atan2(-Math.sin(a) * L.rx, Math.cos(a) * L.rz)
        // (Turned to the newcomer while Gus talks; Gus himself turns his face to the camera, glancing their way, so his
        // face shows: the team stands behind the ice, the camera in front of it.)
        if (this.gusW > 0.001) {
          const to = Math.atan2(this.gusAt.x - x, this.gusAt.z - z)
          yaw = turn(yaw, i === 0 ? turn(0, to, 0.3) : to, this.gusW)
        }
        g.headTurn = 0
        if (lent && i === 2) {
          x += (lent.at.x - x) * lent.w
          z += (lent.at.z - z) * lent.w
          yaw = turn(yaw, lent.yaw, lent.w)
          g.headTurn = lent.headTurn
        }
        g.root.position.set(x, 0.1, z)
        g.root.rotation.y = yaw
        g.lean = 0.15 * this.loopV + (i === 0 ? 0 : 0.05)
        g.armsUp = p.t >= 0 ? bell(clamp((p.t - i * 0.12) / 0.9, 0, 1)) : i === 0 && react && this.gusN <= 2 ? 0.45 * this.gusW : 0
        g.update(dt, t)
      })
      // (A whole team: a gulp, after the honk.)
      if (react && this.gusN >= 6 && this.gusT - dt < 1.5 && this.gusT >= 1.5) hubSfx.gulp()
      this.rink.place.root.localToWorld(p.at.set(L.x, 0.35, L.z))
    }

    // The snowy owl on her island looks about; poked, she turns her head right round (and back), flaps and hoots.
    {
      const p = done('owl', 1.8)
      const o = this.owl
      const cam = this.rig.camera.position
      o.root.rotation.y = Math.atan2(cam.x - o.root.position.x, cam.z - o.root.position.z)
      const k = p.t >= 0 ? clamp(p.t / 1.4, 0, 1) : 0
      o.head.rotation.y = p.t >= 0 ? TAU * (k * k * (3 - 2 * k)) : Math.sin(t * 0.5) * 0.7 * Math.max(0, Math.sin(t * 0.23)) ** 2
      o.head.rotation.z = p.t >= 0 ? Math.sin(k * Math.PI) * 0.25 : 0
      const flap = p.t >= 0 && p.t < 0.8 ? Math.abs(Math.sin(p.t * 16)) * 0.9 : 0
      o.wings.forEach((w, i) => (w.rotation.z = (i ? -1 : 1) * flap))
      o.root.position.y = this.ground(...POKES.owl) + (p.t >= 0 ? 0.08 * bell(clamp(p.t / 0.5, 0, 1)) : 0)
      p.at.copy(o.root.position).setY(o.root.position.y + 0.35)
    }

    // The bison grazes on the prairie; poked, it flops over and rolls in a puff of dust.
    {
      const p = done('bison', 1.6)
      const b = this.bisonToy
      const k = p.t >= 0 ? clamp(p.t / 1.2, 0, 1) : 0
      b.head.rotation.x = p.t >= 0 ? 0 : 0.25 + 0.3 * Math.max(0, Math.sin(t * 0.6)) ** 4
      b.body.rotation.z = p.t >= 0 ? -TAU * (k * k * (3 - 2 * k)) : 0
      b.body.position.y = p.t >= 0 ? 0.12 * Math.sin(k * Math.PI) : 0
      // (Side on to the camera, so she sees a bison's shape: the hump, the low head, the horns.)
      const cam = this.rig.camera.position
      b.root.rotation.y = Math.atan2(cam.x - b.root.position.x, cam.z - b.root.position.z) + 1.25 + Math.sin(t * 0.15) * 0.2
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
    if (this.closing) return
    // A tap during the arrival skips to the board (the move and Gus go on).
    if (this.onRink) this.leaveRink(0.5)
    if (id?.startsWith('go:')) {
      // A place's target is big: if her finger is really on a friend at the rink or a goose, they answer instead.
      const near = id === 'go:party' && x + y > 0 ? this.thingUnder(x, y) : null
      if (near) return this.tap(x, y, near)
      return this.pick(id.slice(3) as PlaceId)
    }
    if (id?.startsWith('team:')) {
      const m = this.mates.get(id.slice(5) as ChapterId)
      if (!m?.team) return
      // Their move again (not if it's still playing: a fast double tap doesn't restart it), with the camera nudged
      // in toward the rink so it reads; the page says their line.
      if (!this.moves.play(m)) return
      hubSfx.hop()
      if (!this.onRink) {
        this.peekT = MOVE_S[m.id] + 0.4
        this.rig.lag = 0.6
      }
      return this.events.team(m.id)
    }
    if (id === 'hut') return this.openHut()
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
    // The skate hut (it stands in the rink's diorama, so before the places), a heart pin, a place's model or a friend
    // (outside its target box, from a steep angle): it opens.
    if (this.raycaster.intersectObject(this.rink.hut.root, true).length) return this.openHut()
    for (const [id, pin] of this.pins) {
      if (pin.root.visible && this.raycaster.intersectObject(pin.root, true).length) return this.pick(id)
    }
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
    check('hut', this.hutAt(tmp.clone()), 0.65)
    return best
  }

  /** The middle of the skate hut, in the world. */
  private hutAt(out: Vector3) {
    const h = this.rink.hut
    return h.root.localToWorld(out.copy(h.aim))
  }

  /** She tapped the skate hut: it hops, its door swings open on the warm light, the camera closes in, and the page
   *  opens the Team Cabin. */
  private openHut() {
    if (this.closing) return
    const h = this.rink.hut
    h.tap()
    this.hutOpen = true
    this.pickedT = 0
    this.peekT = 0
    hubSfx.door()
    hubSfx.zoom()
    this.setGlow(false)
    const at = this.hutAt(new Vector3())
    this.sparkleAt(at, 0.6, 10)
    this.close.center.copy(at)
    this.closeHalf(0.75, 0.45, 0.6)
    this.rig.lag = 0.3
    this.rig.resetTurn()
    this.events.cabin()
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
    if (id === 'bath') hubSfx.splash()
    if (id === 'party' && !this.glowing) {
      this.nudgeT = 0
      return this.events.locked()
    }
    this.picked = p
    this.pickedT = 0
    this.peekT = 0
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
      case 'owl':
        hubSfx.hoot()
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
      const free = !this.closing && !this.showing
      if (id.startsWith('go:') && free) {
        const p = this.places.get(id.slice(3) as PlaceId)
        if (p) spot = this.placeBox(p, min)
      } else if (id.startsWith('team:') && free) {
        const m = this.mates.get(id.slice(5) as ChapterId)
        if (m?.team) {
          const at = m.actor.at(0.5, tmp.clone())
          const s = this.toScreen(at)
          const d = Math.max(min * 0.8, this.ppu(at) * m.size * 0.8)
          // (Above the places' boxes: Tuque stands in front of Quebec's castle, and her finger on him is for him.)
          spot = { x: s.x, y: s.y, w: d * 0.8, h: d, z: 5500 }
        }
      } else if (id === 'hut' && free) {
        // The hut's own box: its walls and roof, never much wider (it stands near Lulu and the canal).
        const at = this.hutAt(tmp3)
        const s = this.toScreen(at)
        const d = this.ppu(at) * 0.75
        spot = { x: s.x, y: s.y, w: Math.max(64, d), h: Math.max(64, d * 1.05), z: 5400 }
      } else if (id.startsWith('poke:') && free) {
        const p = this.pokes.get(id.slice(5) as PokeId)
        if (p) {
          const s = this.toScreen(p.at)
          const d = Math.max(id === 'poke:geese' ? 48 : min, this.ppu(p.at) * p.size)
          spot = { x: s.x, y: s.y, w: d, h: d, z: id === 'poke:geese' ? 3000 : 6000 }
        }
      }
      // Nothing reaches up under the top bar (its buttons win there): a box that does is cut off at the bar's edge.
      if (spot && spot.y - spot.h / 2 < this.top) {
        const bottom = spot.y + spot.h / 2
        spot.h = bottom - this.top
        spot.y = this.top + spot.h / 2
        if (spot.h < min * 0.6) spot = null
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
    } else {
      // Its heart pin is part of it: the box reaches up to take it in.
      const pin = this.pins.get(p.id)
      if (pin?.root.visible) {
        const s = pin.root.scale.x
        const badge = this.toScreen(tmp.set(0, 0.2 + PIN_R * 0.9, 0).multiplyScalar(s).applyQuaternion(pin.root.quaternion).add(pin.root.position))
        const r = this.ppu(pin.root.position) * PIN_R * s
        const top = Math.min(y0, badge.y - r * 1.1)
        hh = y1 - top
        y = (top + y1) / 2
        w = Math.max(w, r * 2.4)
      }
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
      arriving: this.onRink ? this.arriving!.id : null,
      /** The friends' moves: playing now, and every one played this visit (in order). */
      moves: this.moves.qa(),
      /** Gus's reaction to the newcomer: how many on the team when he said his line (0: not yet), and his face now. */
      gus: { n: this.gusN, reacting: this.gusT >= 0, face: this.geese[0]?.sillyFace ?? null },
      hut: this.hutOpen,
      peek: this.peekT > 0,
      /** Where the hut, Maple and each friend stand in the world (x, y, z), for close-up checks from other angles. */
      spots: Object.fromEntries(
        [['hut', this.hutAt(tmp3)] as const, ['maple', this.mapleSpot.getWorldPosition(new Vector3())] as const, ['gus', this.geese[0].head(new Vector3())] as const, ...[...this.mates.values()].map((m) => [m.id, m.spot.getWorldPosition(new Vector3())] as const)].map(([k, v]) => [k, [v.x, v.y, v.z].map((n) => Math.round(n * 1000) / 1000)]),
      ),
      glowing: this.glowing,
      hint: this.hint,
      entering: this.entrance.running,
      poking: [...this.pokes.values()].filter((p) => p.t >= 0).map((p) => p.id),
      /** Where each tap target is on screen (center, size), for the robots. */
      targets: this.targets,
      /** Each friend on screen: the middle of them and how tall they stand (px), at home or at the rink. */
      friends: Object.fromEntries(
        [...this.mates.values()].map((m) => {
          const foot = this.toScreen(m.spot.getWorldPosition(tmp3))
          const head = this.toScreen(m.actor.at(1, tmp3))
          return [m.id, { x: Math.round(foot.x), y: Math.round((foot.y + head.y) / 2), h: Math.round(Math.hypot(head.x - foot.x, head.y - foot.y)), top: Math.round(head.y) }]
        }),
      ),
      /** The heart pins showing: where each badge is (px) and how big across. */
      pins: Object.fromEntries(
        [...this.pins].filter(([, p]) => p.root.visible).map(([id, p]) => {
          const s = this.toScreen(p.root.position)
          return [id, { x: Math.round(s.x), y: Math.round(s.y), d: Math.round(this.ppu(p.root.position) * PIN_R * 2 * p.root.scale.x) }]
        }),
      ),
      top: this.top,
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


// Canada’s 3D map: activity pins open immediately; scenery and animals remain touchable.
import { Color, Group, Mesh, Raycaster, Scene, Vector2, Vector3, type WebGLRenderer } from 'three'
import { bell, clamp, sounds, span } from '../../../../sdk'
import { noise, sfx, tone } from '../../../kit/sfx'
import type { AnchorInfo } from '../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../engine3d/camera'
import { Bag } from '../../../engine3d/dispose'
import { blobShadow, merge, P, solid } from '../../../engine3d/geo'
import { setOutlineResolution } from '../../../engine3d/outline'
import { Particles } from '../../../engine3d/particles'
import { makeLights, PAL, toon } from '../../../engine3d/toon'
import type { World3D } from '../../../engine3d/View3D'
import { Water } from '../../../engine3d/water'
import { CANADA_LOOKS } from '../characters/looks'
import { Actor } from './actor'
import { proj, STOPS, unproj, type LL, type Region } from './canada'
import { beluga, bison, cnTower, ferry, goose, montmorency, mountie, niagara, orca, type Bison, type Goose, type Mountie } from './critters'
import { buildLand, buildMountains, buildPortals, buildTrees, type Peak } from './land'
import { CANAL, stationParts, TRACK_X } from './stations'
import { TEAMMATE } from './team'
import { LAND_TOP, Track } from './track'

export interface MapStart {
  at: Region
  team?: string[]
}
export type Blocker = 'moose' | 'bison' | 'geese'
export type Poke = 'cn' | 'niagara' | 'montmorency' | 'polar' | 'orca' | 'beluga' | 'ferry' | 'flock' | 'mountie'
export interface MapEvents {
  open(id: string): void
  soon?(act: string): void
  poked?(id: string): void
}

export const MAP_ANCHORS: AnchorInfo[] = [
  { id: 'maple', label: 'Maple the beaver', kind: 'thing' },
  { id: 'animal:moose', label: 'A moose on the track', kind: 'thing' },
  { id: 'animal:bison', label: 'A bison on the track', kind: 'thing' },
  { id: 'animal:geese', label: 'A goose family on the track', kind: 'thing' },
  { id: 'poke:cn', label: 'The CN Tower in Toronto', kind: 'thing' },
  { id: 'poke:niagara', label: 'Niagara Falls', kind: 'thing' },
  { id: 'poke:montmorency', label: 'Montmorency Falls', kind: 'thing' },
  { id: 'poke:polar', label: 'A polar bear on the ice', kind: 'thing' },
  { id: 'poke:orca', label: 'An orca in the Pacific', kind: 'thing' },
  { id: 'poke:beluga', label: 'A beluga whale in the St. Lawrence', kind: 'thing' },
  { id: 'poke:ferry', label: 'A ferry on the St. Lawrence River', kind: 'thing' },
  { id: 'poke:flock', label: 'Canada geese flying over', kind: 'thing' },
  { id: 'poke:mountie', label: 'A Mountie on his horse', kind: 'thing' },
  // One target over the whole team (they skate close together): the friend nearest her finger answers.
  { id: 'team', label: 'Your hockey team on the frozen canal', kind: 'thing' },
]

const SKY = '#E3F3FF'
/** Maple's and the moose's heights on the map. */
const MAPLE_H = 0.36
const MOOSE_H = 0.46
/** The polar bear's floe in James Bay. */
const POLAR_AT: LL = [-80.0, 51.75]

const tmp = new Vector3()
const tmp2 = new Vector3()
const tan = new Vector3()

interface Stop {
  id: Region
  s: number
  acts: string[]
  at: Vector3
  root: Group
  top: number
}

interface OnTrack {
  kind: Blocker
  s: number
  /** It came back onto the track once already (it only comes back once). */
  returned?: boolean
  root: Group
  /** The moose is a friend on the rig; the bison and the geese are code-built. */
  moose?: Actor
  bison?: Bison
  geese?: Goose[]
  /** Where it sits on the track, and where it wanders off to. */
  home: Vector3
  away: Vector3
  yaw: number
  state: 'on' | 'leaving' | 'off' | 'back'
  t: number
  nudge: number
  hopT: number
  /** The bison's roll in the dust (s), -1 when it isn't rolling. */
  rollT: number
}

interface PokeThing {
  root: Group
  at: Vector3
  r: number
  t: number
}

interface Mate {
  act: string
  actor: Actor
  /** Their spot along the canal (station-local z). */
  home: number
  lane: number
  phase: number
  cheerAt: number
}

export class CanadaMap implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private track = new Track()
  private lights = makeLights(this.scene)
  private water: Water
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private touches = 0
  private anchorEls = new Map<string, HTMLElement>()
  private raycaster = new Raycaster()
  private top = 0
  private region: Region

  private maple: Actor
  // ---- What's on the map.
  private stops: Stop[] = []
  private blockers: OnTrack[] = []
  private peaks: Peak[]
  private mountains: Group
  private trees: Group
  private land: Group
  private puffs: Particles
  private dust: Particles
  private foam: Particles
  /** Keep the whole country in view. */
  private overview: Shot = { center: new Vector3(), half: new Vector3(), yaw: 0, pitch: 62, maxDist: 240 }
  private pokes = new Map<Poke, PokeThing>()
  private rainbow = new Group()
  private flock: Goose[] = []
  private flockT = 6
  private flockFrom = new Vector3()
  private flockTo = new Vector3()
  private polar: Actor
  private polarWaveAt = 5
  private mountie: Mountie
  private team: Mate[] = []
  private lampOn = toon(PAL.gold)

  constructor(
    private renderer: WebGLRenderer,
    start: MapStart,
    private events: MapEvents,
    /** Activities that are ready for her (their bubbles open them; the rest wiggle). */
    private ready: Set<string>,
  ) {
    this.scene.background = new Color(SKY)
    this.rig.fov = 34
    this.rig.lag = 0.45
    this.water = new Water({ size: 180, deep: '#9FD4F5', shallow: '#B6E2FA', haze: SKY, hazeNear: 22, hazeFar: 70 }, this.bag)
    this.scene.add(this.water.mesh)

    const land = buildLand(this.bag)
    this.land = land.group
    land.box.getCenter(this.overview.center).setY(LAND_TOP)
    land.box.getSize(this.overview.half).multiplyScalar(0.55).setY(0.5)
    this.scene.add(this.land)
    this.scene.add(solid(this.track.geometry(), this.bag, 1.5))
    const mountains = buildMountains(this.bag, this.track)
    this.mountains = mountains.group
    this.peaks = mountains.peaks
    this.scene.add(this.mountains)
    const portals = buildPortals(this.bag, this.track)
    this.scene.add(portals.group)
    this.buildStops()
    const stopAt = this.stops.map((s) => s.at)
    this.trees = buildTrees(this.bag, this.track, (x, z) => stopAt.some((p) => Math.hypot(x - p.x, z - p.z) < 0.9) || this.peaks.some((p) => Math.hypot(x - p.x, z - p.z) < p.r * 0.9) || this.nearPoke(x, z))
    this.scene.add(this.trees)

    this.maple = new Actor(this.bag, CANADA_LOOKS.maple, MAPLE_H, 'maple')
    this.maple.root.position.copy(this.stops.find((s) => s.id === 'quebec')!.at).add(new Vector3(0, 0, 0.5))
    this.scene.add(this.maple.root)

    this.buildBlockers()
    this.buildPokes()
    this.polar = this.buildPolar()
    this.mountie = this.buildMountie()
    this.buildTeam(start.team ?? [])

    this.puffs = new Particles({ kind: 'spray', count: 60, colors: ['#FFFFFF', '#E4F1EC', '#FBEA9A'], gravity: 3 }, this.bag)
    this.dust = new Particles({ kind: 'spray', count: 40, colors: ['#E8D3A6', '#D9BE8C', '#F3E2BC'], gravity: 1.2 }, this.bag)
    this.foam = new Particles({ kind: 'foam', count: 40, opacity: 0.9 }, this.bag)
    this.scene.add(this.puffs.mesh, this.dust.mesh, this.foam.mesh)

    this.region = start.at
  }

  // ---------------------------------------------------------------- building

  private sAt(ll: LL) {
    const [x, z] = proj(ll)
    return this.track.nearest(x, z).s
  }

  /** Something to poke stands here (the trees keep clear). */
  private nearPoke(x: number, z: number) {
    const spots: LL[] = [[-79.5, 43.85], [-79.25, 43.08], [-103.0, 49.6], MONTMORENCY]
    return spots.some((ll) => {
      const [px, pz] = proj(ll)
      return Math.hypot(x - px, z - pz) < 0.45
    })
  }

  private buildStops() {
    for (const st of STOPS) {
      const s = this.sAt(st.at)
      const p = this.track.at(s, new Vector3())
      this.track.tangent(s, tan)
      // The station stands beside the track on its north side (behind the train, as she looks at the map).
      let nx = -tan.z
      let nz = tan.x
      if (nz > 0) {
        nx = -nx
        nz = -nz
      }
      const len = Math.hypot(nx, nz) || 1
      nx /= len
      nz /= len
      const root = new Group()
      root.position.set(p.x + nx * TRACK_X, LAND_TOP, p.z + nz * TRACK_X)
      // Station-local +x points away from the track.
      root.rotation.y = Math.atan2(-nz, nx)
      const look = stationParts(st.id)
      root.add(solid(merge(look.parts), this.bag, 2))
      const lamp = new Mesh(this.bag.add(P.sphere(0.05, '#ffffff', {}, 12)), this.lampOn)
      lamp.position.set(...look.lamp)
      root.add(lamp)
      this.scene.add(root)
      this.stops.push({ id: st.id, s, acts: st.acts, at: root.position, root, top: look.top })
    }
  }

  private buildBlockers() {
    const at: Record<Blocker, LL> = { moose: [-82.6, 47.05], bison: [-108.6, 50.6], geese: [-95.8, 49.85] }
    for (const kind of ['moose', 'bison', 'geese'] as const) {
      const s = this.sAt(at[kind])
      const p = this.track.at(s, new Vector3())
      this.track.tangent(s, tan)
      const yaw = Math.atan2(tan.x, tan.z)
      const root = new Group()
      const b: OnTrack = { kind, s, root, home: p.clone().setY(LAND_TOP), away: new Vector3(), yaw: 0, state: 'on', t: 0, nudge: -1, hopT: -1, rollT: -1 }
      if (kind === 'moose') {
        b.moose = new Actor(this.bag, CANADA_LOOKS.moose, MOOSE_H, 'moose')
        root.add(b.moose.root)
      } else if (kind === 'bison') {
        b.bison = bison(this.bag)
        root.add(b.bison.root, blobShadow(0.26, this.bag))
      } else {
        b.geese = [goose(this.bag, 1.1), goose(this.bag, 0.75, true), goose(this.bag, 0.7, true)]
        b.geese[1].root.position.set(0.13, 0, -0.08)
        b.geese[2].root.position.set(-0.12, 0, -0.1)
        root.add(...b.geese.map((g) => g.root), blobShadow(0.3, this.bag))
      }
      root.position.set(p.x, LAND_TOP, p.z)
      // Facing across the track, toward her.
      b.yaw = yaw + (Math.sin(yaw) < 0 ? Math.PI / 2 : -Math.PI / 2)
      if (Math.cos(b.yaw) < 0) b.yaw += Math.PI
      root.rotation.y = b.yaw
      // It wanders off to the south side (toward the camera), off the rails.
      const side = Math.sin(yaw) < 0 ? 1 : -1
      b.away.set(p.x + Math.cos(yaw) * 0.75 * side, LAND_TOP, p.z - Math.sin(yaw) * 0.75 * side)
      this.scene.add(root)
      this.blockers.push(b)
    }
  }

  private buildPokes() {
    const place = (id: Poke, ll: LL, root: Group, r: number, y = LAND_TOP) => {
      const [x, z] = proj(ll)
      root.position.set(x, y, z)
      this.scene.add(root)
      this.pokes.set(id, { root, at: root.position.clone(), r, t: -1 })
    }
    place('cn', [-79.5, 43.85], cnTower(this.bag), 0.35)
    // Niagara Falls, with a rainbow that comes out in the mist.
    const falls = niagara(this.bag)
    const bands = ['#FF8FB8', '#FFC2A8', '#FBEA9A', '#8FE3C8', '#A8DCFF', '#B9A6F5']
    bands.forEach((c, i) => this.rainbow.add(solid(P.torus(0.42 - i * 0.035, 0.018, c, {}, Math.PI), this.bag, 0)))
    this.rainbow.position.set(0, 0.05, 0.3)
    this.rainbow.scale.setScalar(0.001)
    this.rainbow.visible = false
    falls.add(this.rainbow)
    place('niagara', [-79.25, 43.08], falls, 0.3)
    // Montmorency Falls, on the St. Lawrence's north shore just past Quebec City, facing the river.
    const mont = montmorency(this.bag)
    place('montmorency', MONTMORENCY, mont, 0.3)
    mont.rotation.y = 0.5
    // An orca off the Pacific coast and a beluga in the St. Lawrence: they rest at the surface and jump when she taps.
    place('orca', [-126.6, 48.9], orca(this.bag), 0.3, 0.02)
    place('beluga', [-68.9, 48.47], beluga(this.bag), 0.25, 0.02)
    // The ferry, crossing the St. Lawrence from shore to shore.
    place('ferry', [-68.0, 48.94], ferry(this.bag), 0.3, 0.03)
    // Five Canada geese in a V, flying over every now and then.
    const flock = new Group()
    for (let i = 0; i < 5; i++) {
      const k = Math.ceil(i / 2) * (i % 2 ? 1 : -1)
      const g = goose(this.bag, 1.25, false, true)
      g.root.position.set(k * 0.26, 0, -Math.abs(k) * 0.28)
      flock.add(g.root)
      this.flock.push(g)
    }
    flock.visible = false
    place('flock', [-71.6, 47.0], flock, 0.5, 2.2)
  }

  private buildPolar() {
    const bear = new Actor(this.bag, { species: 'polarbear', height: 1, chub: 1.12, fur: '#FFFFFF', light: '#FFF6EE', dark: '#2E2233', ear: '#FFD6E0', open: true }, 0.4)
    const floe = new Group()
    floe.add(solid(merge([P.cyl(0.3, 0.32, 0.06, '#FFFFFF', { scale: [1, 1, 0.75] }, 9), P.cyl(0.16, 0.18, 0.05, '#EAF6FF', { at: [0.17, 0.0, 0.12], scale: [1, 1, 0.8] }, 7)]), this.bag, 2))
    floe.add(bear.root)
    bear.root.position.set(0, 0.03, 0)
    bear.root.rotation.y = 0.3
    const [x, z] = proj(POLAR_AT)
    floe.position.set(x, 0.0, z)
    this.scene.add(floe)
    this.pokes.set('polar', { root: floe, at: floe.position.clone(), r: 0.3, t: -1 })
    return bear
  }

  private buildMountie() {
    const m = mountie(this.bag)
    m.root.add(blobShadow(0.22, this.bag))
    const [x, z] = proj(MOUNTIE_AT)
    m.root.position.set(x, LAND_TOP, z)
    this.scene.add(m.root)
    this.pokes.set('mountie', { root: m.root, at: m.root.position.clone(), r: 0.28, t: -1 })
    return m
  }

  /** Her hockey team on Ottawa's frozen canal: one friend per stamp, skating up and down. */
  private buildTeam(acts: string[]) {
    const ottawa = this.stops.find((s) => s.id === 'ottawa')!
    const mates = acts.filter((a, i) => TEAMMATE[a] && acts.indexOf(a) === i)
    mates.forEach((act, i) => {
      const m = TEAMMATE[act]
      const actor = new Actor(this.bag, m.look, m.height, m.voice)
      ottawa.root.add(actor.root)
      const home = CANAL.z0 + 0.12 + ((i + 0.5) / mates.length) * (CANAL.z1 - CANAL.z0 - 0.24)
      this.team.push({ act, actor, home, lane: (i % 2 ? 1 : -1) * 0.05, phase: i * 0.9, cheerAt: -1 })
    })
  }

  // ---------------------------------------------------------------- World3D

  private shot(): Shot {
    return this.overview
  }

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.tall = h > w
    this.top = top
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
    this.rig.setShot(this.shot(), true)
  }

  setAnchorElements(els: Map<string, HTMLElement>) {
    this.anchorEls = els
  }

  get calm() {
    return !this.rig.moving && !this.maple.busy && !this.blockers.some((b) => b.state === 'leaving' || b.state === 'back' || b.rollT >= 0) && ![...this.pokes.values()].some((p) => p.t >= 0)
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.maple.update(dt, t, { up: 0.25 })
    this.updateBlockers(dt, t)
    this.updatePokes(dt, t)
    this.updateTeam(dt, t)
    this.puffs.update(dt)
    this.dust.update(dt)
    this.foam.update(dt)
    this.water.update(t)
    const c = this.overview.center
    this.lights.follow(c.x, c.y, c.z)
    this.rig.setShot(this.shot())
    this.rig.update(dt)
  }

  // ---------------------------------------------------------------- her hockey team

  private updateTeam(dt: number, t: number) {
    for (const m of this.team) {
      if (m.cheerAt >= 0 && t >= m.cheerAt) {
        m.cheerAt = -1
        m.actor.play('cheer')
      }
      // Each glides back and forth around their own spot on the canal, mostly facing her, leaning into the turns.
      const k = t * 1.1 + m.phase * 3
      const z = m.home + Math.sin(k) * 0.07
      m.actor.root.position.set(CANAL.x + m.lane + Math.sin(k * 0.5) * 0.03, 0.026, z)
      m.actor.root.rotation.y = -Math.PI / 2 + Math.cos(k) * 0.55
      m.actor.update(dt, t, { skate: true, up: 0.3 })
    }
  }

  // ---------------------------------------------------------------- animals on the track

  private updateBlockers(dt: number, t: number) {
    for (const b of this.blockers) {
      let y = 0
      let sq = 0
      let walking = false
      if (b.state === 'leaving' || b.state === 'back') {
        b.t += dt
        const p = Math.min(1, b.t / 1.6)
        const from = b.state === 'leaving' ? b.home : b.away
        const to = b.state === 'leaving' ? b.away : b.home
        b.root.position.lerpVectors(from, to, smoothstep(p))
        b.root.rotation.y = Math.atan2(to.x - from.x, to.z - from.z)
        walking = true
        if (!b.moose) y = Math.abs(Math.sin(b.t * 10)) * 0.025
        if (p >= 1) {
          b.state = b.state === 'leaving' ? 'off' : 'on'
          b.t = 0
          b.root.rotation.y = b.yaw
          // Off the track, the bison has a good roll in the dust.
          if (b.state === 'off' && b.bison) this.roll(b)
        }
      } else if (b.state === 'off') {
        // Wander back once after a while, ready for another hello.
        b.t += dt
        if (!b.returned && b.t > 40) {
          b.state = 'back'
          b.t = 0
          b.returned = true
        }
      }
      if (b.nudge >= 0) {
        b.nudge += dt
        sq = 0.15 * bell(Math.min(1, b.nudge / 0.45))
        if (b.nudge > 2.5) b.nudge = -1
      }
      if (b.hopT >= 0) {
        b.hopT += dt
        const p = b.hopT / 0.6
        if (p >= 1) b.hopT = -1
        else y += bell(span(p, 0.15, 0.8)) * 0.1
      }
      if (b.moose) {
        // The moose looks around and chews.
        b.moose.update(dt, t, { walk: walking, look: b.state === 'on' ? Math.sin(t * 0.6) * 0.3 : 0 })
        b.moose.rig.body.scale.x *= 1 + sq
        b.moose.rig.mouth.scale.y = 1 + 0.25 * Math.abs(Math.sin(t * 5))
      } else if (b.bison) {
        const body = b.bison.body
        let roll = 0
        if (b.rollT >= 0) {
          b.rollT += dt
          const p = b.rollT / 2.2
          // Down onto its side, over onto its back with its legs kicking, back, and up again with a shake.
          roll = bell(span(p, 0.05, 0.85)) * 2.2 + Math.sin(p * 30) * 0.12 * bell(span(p, 0.25, 0.7))
          if (Math.random() < dt * 14 && p < 0.85) this.dust.emit(b.root.position.x + (Math.random() - 0.5) * 0.3, LAND_TOP + 0.04, b.root.position.z + (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.4, 0.4 + Math.random() * 0.3, (Math.random() - 0.5) * 0.4, 0.9, 0.12)
          if (p >= 1) b.rollT = -1
        }
        // It rolls about its middle (not its feet), so it tips onto its side and back without sinking into the ground.
        const c = 0.17
        body.rotation.z = roll
        body.position.set(c * Math.sin(roll), y + c * (1 - Math.cos(roll)) - 0.06 * Math.sin(Math.min(roll, Math.PI)), 0)
        body.scale.set(1 + sq, 1 - sq + 0.02 * Math.sin(t * 2.4), 1 + sq)
        // Grazing: the head goes down to the grass now and then.
        b.bison.head.rotation.x = walking ? Math.sin(t * 9) * 0.1 : 0.35 * Math.max(0, Math.sin(t * 0.8)) + sq
      } else if (b.geese) {
        b.geese.forEach((g, i) => {
          const tt = t + i * 1.3
          g.body.position.y = y * (i ? 0.8 : 1)
          g.body.rotation.z = walking ? Math.sin(tt * 14) * 0.18 : 0
          g.body.scale.set(1 + sq, 1 - sq, 1 + sq)
          // Pecking at the ground, and a little flap now and then.
          g.head.rotation.x = walking ? 0 : Math.max(0, Math.sin(tt * 1.7)) ** 6 * 1.1
          const flap = b.hopT >= 0 || walking ? Math.sin(tt * 22) * 0.6 : Math.max(0, Math.sin(tt * 0.9)) ** 12 * 0.8
          g.wingR.rotation.z = flap
          g.wingL.rotation.z = -flap
        })
      }
    }
  }

  private roll(b: OnTrack) {
    if (b.rollT >= 0) return
    b.rollT = 0
    noise(0.6, 0.06, 'lowpass', 600, 200, 0.2, 0.8)
  }

  // ---------------------------------------------------------------- pokes

  private updatePokes(dt: number, t: number) {
    for (const [id, p] of this.pokes) {
      if (p.t >= 0) p.t += dt
      const k = p.t
      if (id === 'cn') {
        const lift = p.root.getObjectByName('lift')!
        lift.position.y = k >= 0 ? 0.1 + 0.95 * bell(Math.min(1, k / 2.4)) : 0.1
        const light = p.root.getObjectByName('light')!
        light.scale.setScalar(Math.sin(t * 3) > 0.6 ? 1.3 : 0.9)
        if (k > 2.4) p.t = -1
      } else if (id === 'niagara') {
        const show = k >= 0 && k < 5
        this.rainbow.visible = k >= 0
        this.rainbow.scale.setScalar(show ? Math.min(1, k * 2) : Math.max(0.001, 1 - (k - 5) * 2))
        if (Math.random() < dt * (k >= 0 ? 10 : 1.5)) this.puffs.emit(p.at.x + (Math.random() - 0.5) * 0.3, LAND_TOP + 0.05, p.at.z + 0.15, 0, 0.5, 0.1, 0.8, 0.06, 0)
        if (k > 5.5) p.t = -1
      } else if (id === 'montmorency') {
        // Mist at the bottom all the time; a tap makes a big splashy whoosh.
        if (Math.random() < dt * (k >= 0 ? 14 : 1.5)) {
          const fwd = new Vector3(Math.sin(p.root.rotation.y), 0, Math.cos(p.root.rotation.y))
          this.puffs.emit(p.at.x + fwd.x * 0.12 + (Math.random() - 0.5) * 0.1, LAND_TOP + 0.03, p.at.z + fwd.z * 0.12, fwd.x * 0.2, 0.6 + (k >= 0 ? 0.4 : 0), fwd.z * 0.2, 0.7, k >= 0 ? 0.09 : 0.05, 0)
        }
        if (k > 2) p.t = -1
      } else if (id === 'polar') {
        // On her floe: rocks on the water, looks about, and waves now and then (a tap: a wave and a hop).
        p.root.position.y = Math.sin(t * 1.4) * 0.012
        p.root.rotation.z = Math.sin(t * 1.1) * 0.03
        if (t > this.polarWaveAt) {
          this.polarWaveAt = t + 7 + Math.random() * 5
          this.polar.play('wave')
        }
        this.polar.update(dt, t, { look: Math.sin(t * 0.4) * 0.5, up: 0.25 })
        if (k > 1.6) p.t = -1
      } else if (id === 'orca' || id === 'beluga') {
        const j = k >= 0 ? Math.min(1, k / (id === 'orca' ? 1.3 : 1.1)) : 0
        const high = id === 'orca' ? 0.7 : 0.45
        p.root.position.y = 0.02 + Math.sin(t * 1.5 + (id === 'orca' ? 0 : 2)) * 0.02 + bell(j) * high
        p.root.rotation.x = k >= 0 ? -1.1 + 2.2 * j : 0
        p.root.rotation.y = id === 'beluga' ? 1.2 + Math.sin(t * 0.3) * 0.4 : 0
        if (k >= 0 && j >= 1) {
          sfx.splash()
          for (let i = 0; i < 6; i++) this.foam.emit(p.root.position.x, 0.03, p.root.position.z, (Math.random() - 0.5) * 1.2, 0, (Math.random() - 0.5) * 1.2, 1, 0.25)
          p.t = -1
        }
      } else if (id === 'ferry') {
        // Back and forth across the river, slowly; a toot sends it on its way faster.
        const fast = k >= 0 ? 3 : 1
        p.root.userData.x = (p.root.userData.x ?? 0) + dt * 0.05 * fast
        const swing = Math.sin(p.root.userData.x)
        const [x, z] = proj([-68.0 + swing * 0.15, 48.94 + swing * 0.12])
        p.root.position.set(x, 0.03 + Math.sin(t * 2) * 0.01, z)
        p.root.rotation.y = Math.cos(p.root.userData.x) > 0 ? 0.6 : 0.6 + Math.PI
        p.root.rotation.z = Math.sin(t * 1.7) * 0.04
        if (k > 3) p.t = -1
      } else if (id === 'flock') this.updateFlock(dt, t, p)
      else if (id === 'mountie') this.updateMountie(dt, t, p)
    }
  }

  /** The Mountie rides his horse up and down by the track; a tap: the horse stops and rears a little, and he lifts his
   *  hat and waves it. */
  private updateMountie(dt: number, t: number, p: PokeThing) {
    const m = this.mountie
    const stopped = p.t >= 0
    m.root.userData.k = (m.root.userData.k ?? 0) + dt * (stopped ? 0 : 0.35)
    const k = m.root.userData.k as number
    const x = Math.sin(k) * 0.35
    m.root.position.set(p.at.x + x, LAND_TOP, p.at.z)
    m.root.rotation.y = Math.cos(k) >= 0 ? Math.PI / 2 : -Math.PI / 2
    // A trot: bob and nod; standing, a little rear back.
    const trot = stopped ? 0 : 1
    const rear = stopped ? bell(Math.min(1, p.t / 0.9)) : 0
    m.horse.position.y = trot * Math.abs(Math.sin(t * 8)) * 0.025 + rear * 0.03
    m.horse.rotation.x = -rear * 0.35
    m.head.rotation.x = trot * Math.sin(t * 8) * 0.12 - rear * 0.3
    // The wave: his arm comes up with the hat, waves it, puts it back.
    const w = stopped ? bell(Math.min(1, p.t / 2.2)) : 0
    const a = w * 2.6
    m.arm.rotation.z = a + (w > 0.8 ? Math.sin(p.t * 14) * 0.35 : 0)
    const L = 0.085
    const tipX = m.arm.position.x + Math.sin(m.arm.rotation.z) * L
    const tipY = m.arm.position.y - Math.cos(m.arm.rotation.z) * L
    const held = smoothstep(clamp((w - 0.35) / 0.4, 0, 1))
    m.hat.position.set(m.hatOn[0] + (tipX - m.hatOn[0]) * held, m.hatOn[1] + (tipY + 0.03 - m.hatOn[1]) * held, m.hatOn[2])
    m.hat.rotation.z = held * (0.4 + Math.sin(p.t * 14) * 0.4)
    if (p.t > 2.4) p.t = -1
  }

  /** The geese fly across the view now and then, flapping and honking. */
  private updateFlock(dt: number, t: number, p: PokeThing) {
    const f = p.root
    if (!f.visible) {
      this.flockT -= dt
      if (this.flockT > 0) return
      const c = this.overview.center
      const dir = Math.random() < 0.5 ? 1 : -1
      this.flockFrom.set(c.x + 7 * dir, LAND_TOP + 2.0, c.z - 1.5)
      this.flockTo.set(c.x - 7 * dir, LAND_TOP + 2.0, c.z - 0.5)
      f.userData.k = 0
      f.visible = true
      f.rotation.y = Math.atan2(this.flockTo.x - this.flockFrom.x, this.flockTo.z - this.flockFrom.z)
    }
    const quick = p.t >= 0 && p.t < 2 ? 2.2 : 1
    f.userData.k += (dt / 9) * quick
    f.position.lerpVectors(this.flockFrom, this.flockTo, f.userData.k)
    f.position.y += Math.sin(t * 1.3) * 0.08
    this.flock.forEach((g, i) => {
      const flap = Math.sin(t * (quick > 1 ? 16 : 8) + i * 0.7) * 0.55
      g.wingR.rotation.z = flap
      g.wingL.rotation.z = -flap
      g.body.position.y = -flap * 0.03
    })
    if (f.userData.k >= 1) {
      f.visible = false
      this.flockT = 18 + Math.random() * 10
      p.t = -1
    }
  }

  private poke(id: Poke) {
    const p = this.pokes.get(id)!
    this.events.poked?.(`poke:${id}`)
    if (id === 'flock') {
      honk()
      p.t = 0
      return
    }
    if (id === 'polar') {
      this.polar.play('wave')
      this.polar.play('hop')
      sfx.boing()
      p.t = 0
      return
    }
    if (p.t >= 0) return
    p.t = 0
    if (id === 'cn') tone(330, 990, 1.1, 0.06, 'triangle')
    else if (id === 'niagara') sounds.sparkle()
    else if (id === 'montmorency') {
      sfx.splash()
      noise(0.9, 0.06, 'highpass', 1400, 900, 0, 0.6)
    } else if (id === 'orca') tone(900, 1500, 0.25, 0.05, 'sine')
    else if (id === 'beluga') {
      // A beluga's sing-song trill.
      tone(1200, 1700, 0.18, 0.04, 'sine')
      tone(1700, 1100, 0.2, 0.04, 'sine', 0.2)
      tone(1300, 1900, 0.22, 0.035, 'sine', 0.42)
    } else if (id === 'ferry') {
      tone(220, 220, 0.6, 0.12, 'sawtooth')
      tone(277, 277, 0.6, 0.06, 'triangle')
    } else if (id === 'mountie') {
      // A whinny, and the clip-clop stops.
      tone(900, 1300, 0.12, 0.04, 'sawtooth')
      tone(1300, 700, 0.5, 0.04, 'sawtooth', 0.12)
    }
  }

  render() {
    this.renderer.render(this.scene, this.rig.camera)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  // ---------------------------------------------------------------- her finger

  private ray(x: number, y: number) {
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    return this.raycaster
  }

  private toScreen(v: Vector3) {
    const p = tmp2.copy(v).project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }

  /** How many screen pixels a meter is at this spot. */
  private pxPerM(at: Vector3) {
    const a = this.toScreen(at)
    const b = this.toScreen(tmp.copy(at).add(new Vector3(1, 0, 0)))
    return Math.hypot(b.x - a.x, b.y - a.y)
  }

  pointerDown() {}
  pointerMove() {}
  pointerUp() {}

  tap(x: number, y: number, id?: string) {
    this.touches++
    if (id?.startsWith('go:')) return this.tapBubble(id.slice(3))
    if (id === 'maple') {
      this.maple.play('hop')
      sfx.boing()
      this.events.poked?.('maple')
      return
    }
    if (id === 'team') {
      let m: Mate | undefined
      let best = Infinity
      for (const k of this.team) {
        const p = this.toScreen(k.actor.center(tmp))
        const d = Math.hypot(p.x - x, p.y - y)
        if (d < best) {
          best = d
          m = k
        }
      }
      if (m) {
        m.actor.play('hop')
        sfx.boing()
        if (m.act === 'canoe') loonCall()
        this.events.poked?.(`team:${m.act}`)
      }
      return
    }
    if (id?.startsWith('animal:')) {
      const b = this.blockers.find((k) => k.kind === id.slice(7))!
      if (b.state === 'on') {
        b.state = 'leaving'
        b.t = 0
        snort(b.kind)
        b.moose?.play('wave')
        this.events.poked?.(id)
      } else {
        b.hopT = 0
        if (b.bison) this.roll(b)
        else if (b.moose) b.moose.play('hop')
        if (b.geese) honk()
        else sfx.boing()
        this.events.poked?.(`${id}:off`)
      }
      return
    }
    if (id?.startsWith('poke:')) return this.poke(id.slice(5) as Poke)
    // Anything else: whatever her finger lands on reacts.
    const ray = this.ray(x, y)
    const hit = ray.intersectObjects([this.mountains, this.trees, this.land, this.water.mesh], true)[0]
    if (!hit) return sfx.fwip()
    const at = hit.point
    if (hit.object.parent === this.mountains || hit.object === this.mountains) {
      sfx.fwip()
      for (let i = 0; i < 8; i++) this.puffs.emit(at.x, at.y + 0.05, at.z, (Math.random() - 0.5) * 0.8, 0.6 + Math.random() * 0.6, (Math.random() - 0.5) * 0.8, 0.9, 0.09, 0)
      return
    }
    if (hit.object.parent === this.trees) {
      noise(0.25, 0.08, 'highpass', 2500, 1800, 0, 0.7)
      for (let i = 0; i < 6; i++) this.puffs.emit(at.x, at.y, at.z, (Math.random() - 0.5) * 0.6, 0.5 + Math.random() * 0.4, (Math.random() - 0.5) * 0.6, 0.7, 0.06, 1)
      return
    }
    if (hit.object === this.water.mesh) {
      sfx.splash()
      this.foam.burst(at.x, 0.02, at.z, 5, 0.6, 0, 0.2)
      return
    }
    sfx.fwip()
  }

  private tapBubble(act: string) {
    if (this.ready.has(act)) {
      sounds.pop()
      this.events.open(act)
      return
    }
    // Not ready: it wiggles (and the hub says why).
    sounds.sparkle()
    this.anchorEls.get(`go:${act}`)?.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-14deg)' }, { transform: 'rotate(12deg)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(0)' }], { duration: 500, composite: 'add' })
    this.events.soon?.(act)
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    // A pair of pins per destination, west to east. Leader lines keep nearby Quebec destinations distinct.
    // Lay them out in screen space so every activity stays visible and targets never overlap.
    const order = ['bc', 'banff', 'ottawa', 'quebec', 'msa']
    const left = min / 2 + (this.w < 500 ? 10 : 24)
    const right = this.w - left
    const top = Math.max(this.top + min / 2 + 28, this.h * (this.tall ? 0.38 : 0.34))
    const bottom = Math.max(top + min + 32, Math.min(this.h * 0.76, this.h - (min === 64 ? 140 : 190)))
    for (const [id, el] of this.anchorEls) {
      let spot: { x: number; y: number; size: number; h?: number; z: number } | null = null
      if (id.startsWith('line:')) continue
      if (id.startsWith('go:')) {
        const act = id.slice(3)
        const stop = this.stops.find((s) => s.acts.includes(act))!
        const col = order.indexOf(stop.id)
        const row = stop.acts.indexOf(act)
        const x = left + (right - left) * col / 4
        const y = stop.acts.length === 1 ? (top + bottom) / 2 : row ? bottom : top
        spot = { x, y, size: min, z: 9500 }
        const origin = this.toScreen(tmp.copy(stop.at).setY(LAND_TOP + stop.top))
        const line = this.anchorEls.get(`line:${act}`)
        if (line) {
          line.style.transform = `translate3d(${origin.x}px, ${origin.y}px, 0) rotate(${Math.atan2(y - origin.y, x - origin.x)}rad)`
          line.style.width = `${Math.hypot(y - origin.y, x - origin.x)}px`
        }
      } else if (id === 'maple') {
        const p = this.toScreen(this.maple.center(tmp))
        spot = { x: p.x, y: p.y, size: min, z: 4000 }
      } else if (id.startsWith('animal:')) {
        const b = this.blockers.find((k) => k.kind === id.slice(7))!
        const at = tmp.copy(b.root.position).setY(LAND_TOP + (b.moose ? 0.22 : 0.15))
        const s = this.toScreen(at)
        spot = { x: s.x, y: s.y, size: Math.max(min, this.pxPerM(at) * 0.5), z: 8000 }
      } else if (id === 'team') {
        if (this.team.length) {
          const ottawa = this.stops.find((s) => s.id === 'ottawa')!
          const a = this.toScreen(ottawa.root.localToWorld(tmp.set(CANAL.x, 0.12, CANAL.z0 + 0.1)))
          const b = this.toScreen(ottawa.root.localToWorld(tmp.set(CANAL.x, 0.12, CANAL.z1 - 0.1)))
          spot = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - min * 0.2, size: Math.max(min, Math.abs(b.x - a.x) + min * 0.5), h: Math.max(min, Math.abs(b.y - a.y) + min * 1.1), z: 6000 }
          el.style.borderRadius = '30px'
        }
      } else if (id.startsWith('poke:')) {
        const p = this.pokes.get(id.slice(5) as Poke)!
        if (p.root.visible) {
          const at = p.root.getWorldPosition(tmp).add(new Vector3(0, p.r * 0.6, 0))
          const s = this.toScreen(at)
          spot = { x: s.x, y: s.y, size: Math.max(min, this.pxPerM(at) * p.r * 2), z: id === 'poke:flock' ? 8500 : 5000 }
        }
      }
      const show = !!spot && spot.x >= 0 && spot.x <= this.w && spot.y >= this.top && spot.y <= this.h
      if (show && spot) {
        const h = spot.h ?? spot.size
        el.style.transform = `translate3d(${spot.x - spot.size / 2}px, ${spot.y - h / 2}px, 0)`
        el.style.width = `${spot.size}px`
        el.style.height = `${h}px`
        el.style.zIndex = String(spot.z)
      }
      el.style.display = show ? '' : 'none'
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    return {
      mode: 'pins',
      region: this.region,
      team: this.team.map((m) => m.act),
      touches: this.touches,
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

/** Montmorency Falls' spot: the north shore of the St. Lawrence, just east of Quebec City's station. */
const MONTMORENCY: LL = unproj(14.33, 4.5)
/** The Mountie rides by the track on the prairies, near Regina (where Mounties learn to be Mounties). */
const MOUNTIE_AT: LL = [-103.0, 49.6]

const smoothstep = (p: number) => p * p * (3 - 2 * p)

/** A moose or bison's snort; a goose family honks. */
function snort(kind: Blocker) {
  if (kind === 'geese') return honk()
  noise(0.35, 0.22, 'lowpass', kind === 'bison' ? 380 : 520, 140, 0, 1)
  tone(kind === 'bison' ? 95 : 130, 80, 0.4, 0.08, 'sawtooth', 0.05)
}

function honk() {
  tone(340, 300, 0.13, 0.07, 'sawtooth')
  tone(340, 300, 0.13, 0.07, 'sawtooth', 0.2)
}

/** The loon's laughing call. */
function loonCall() {
  tone(600, 900, 0.25, 0.05, 'sine')
  tone(900, 700, 0.18, 0.05, 'sine', 0.27)
  tone(900, 700, 0.18, 0.05, 'sine', 0.47)
}

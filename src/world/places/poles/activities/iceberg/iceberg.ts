// Iceberg Maker (greybox 4, plan: planning/around-the-world/poles.html): where icebergs come from, why most of one is
// hidden, and how the north's and the south's are different.
//
// The toy (core verb): tap a crack in the ice cliff. It creaks, the crack grows round a chunk, the chunk shakes and
// leans out, and on the last tap it tips off and SPLASH: a wave rings out and everything floating rides it. The verb
// deepens three ways:
//   bits:  little chunks all over the face (a few at a time, new cracks keep coming); they plop in and bob, and she can
//          poke them under or slide them about;
//   giant: one long crack round a whole section: several taps, a groan, and a huge berg drops off, rocks and settles.
//          The camera sinks under the waterline to show the hidden part (about 9 parts out of 10), and her finger pushes
//          the berg down: it pops back up and bobs;
//   sail:  the camera turns round to look out to sea from the top of the cliff; she flicks her bergs away (the friends
//          ride on the giant one) until a little fleet sails off.
// She picks the pole first (pick): Greenland's tall glacier with Pola on top, or Antarctica's flat shelf with penguins.
// Both play the same; the bergs come out the shape of their pole (ice.ts).
//
// Built for engine3d/View3D.tsx. The cracking and the floating are feel-lab knobs (?feel=1).
import { BackSide, BoxGeometry, Color, Fog, Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, Plane, PlaneGeometry, Quaternion, Raycaster, RingGeometry, Scene, SphereGeometry, Vector2, Vector3, type BufferGeometry, type WebGLRenderer } from 'three'
import { clamp, sounds } from '../../../../../sdk'
import { knobs, watch } from '../../../../kit/knobs'
import { noise, sfx, tone } from '../../../../kit/sfx'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../engine3d/camera'
import { Bag } from '../../../../engine3d/dispose'
import { P, merge, solid } from '../../../../engine3d/geo'
import { setOutlineResolution } from '../../../../engine3d/outline'
import { Particles } from '../../../../engine3d/particles'
import { applyBands, makeLights, toon } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import { swell, Water } from '../../../../engine3d/water'
import { Bear } from '../floe/bear'
import { Penguin, Seal } from '../slide/penguin'
import { bitGeo, buildCliff, buildOrca, giantGeo, growlerGeo, rng, SHAPES, type PoleShape } from './ice'
import type { IcebergSection, Pole } from './sections'

const FILE = 'src/world/places/poles/activities/iceberg/iceberg.ts'
/** The cracking: how many taps a chunk takes and how it comes off (live in the feel lab: ?feel=1). */
const CRACK = knobs('crack', 'Cracking the ice', FILE, {
  bitTaps: { value: 2, min: 1, max: 6, step: 1, label: 'Taps for a bit', note: 'taps on a little crack before its chunk falls off' },
  giantTaps: { value: 5, min: 2, max: 12, step: 1, label: 'Taps for the giant', note: 'taps on the long crack before the giant berg breaks off' },
  bits: { value: 5, min: 1, max: 12, step: 1, label: 'Bits before the giant', note: 'little chunks she breaks off before the long crack appears' },
  loose: { value: 3, min: 1, max: 6, step: 1, label: 'Cracks at once', note: 'how many little cracks wait on the face at a time' },
  regrow: { value: 1.2, min: 0, max: 6, step: 0.1, label: 'New crack after', unit: 's', note: 'how soon a new crack opens after a chunk falls' },
  grow: { value: 0.35, min: 0.05, max: 1.5, step: 0.05, label: 'Crack grows in', unit: 's', note: 'how long the crack takes to creep after a tap' },
  shake: { value: 0.07, min: 0, max: 0.3, step: 0.01, label: 'Shake', unit: 'm', note: 'how hard the chunk shakes when she taps it' },
  lean: { value: 4, min: 0, max: 12, step: 0.5, label: 'Lean per tap', unit: '°', note: 'how far a cracked chunk leans out with each tap' },
  fall: { value: 14, min: 4, max: 30, step: 0.5, label: 'Fall', unit: 'm/s²', note: 'how fast the ice drops (real: 9.8; a bit faster reads better)' },
  splash: { value: 1, min: 0.2, max: 2.5, step: 0.05, label: 'Splash', unit: '×', note: 'how big the splash and the wave are' },
  wave: { value: 6, min: 1, max: 15, step: 0.5, label: 'Wave speed', unit: 'm/s', note: 'how fast the wave rolls out from a splash' },
})
/** The floating ice: buoyancy, and her finger pushing it. */
const FLOAT = knobs('float', 'Floating ice', FILE, {
  hidden: { value: 0.88, min: 0.5, max: 0.95, step: 0.01, label: 'Hidden share', note: 'how much of a little bit sits under the water (real ice: about 0.9; the giant is built that way)' },
  bob: { value: 0.5, min: 0.15, max: 2, step: 0.05, label: 'Bob speed', unit: 'Hz', note: 'how quickly floating ice bobs up and down' },
  damp: { value: 0.16, min: 0.02, max: 1, step: 0.01, label: 'Bob damping', note: 'how soon the bobbing dies away (1 = no bounce)' },
  plunge: { value: 0.55, min: 0, max: 1, step: 0.05, label: 'Plunge', note: 'how much of its fall speed a chunk keeps going into the water (it sinks, then pops up)' },
  rock: { value: 0.35, min: 0.1, max: 1.5, step: 0.05, label: 'Rock speed', unit: 'Hz', note: 'how quickly a berg rocks back upright after it drops' },
  rockDamp: { value: 0.12, min: 0.02, max: 1, step: 0.01, label: 'Rock damping', note: 'how soon the rocking stops' },
  deep: { value: 7, min: 1, max: 14, step: 0.5, label: 'Push depth', unit: 'm', note: 'how far down her finger can push the giant' },
  pushK: { value: 1, min: 0.3, max: 3, step: 0.05, label: 'Push per finger', unit: '×', note: 'meters down for each meter her finger moves on the screen' },
  grip: { value: 6, min: 1, max: 20, step: 0.5, label: 'Grip', unit: '/s', note: 'how closely a berg she holds follows her finger' },
  glide: { value: 0.45, min: 0.05, max: 3, step: 0.05, label: 'Glide drag', unit: '/s', note: 'how soon a flicked berg slows down (lower glides further)' },
  flick: { value: 1, min: 0.2, max: 2.5, step: 0.05, label: 'Flick', unit: '×', note: 'how much of her flick the berg keeps when she lets go' },
})

export interface IcebergStart {
  section: IcebergSection
  pole: Pole
}
export interface IcebergEvents {
  /** A new stretch (the address bar follows). */
  section(s: IcebergSection): void
  /** She picked a pole. */
  pick(pole: Pole): void
  /** The giant hit the water: a wave rolls across the screen. */
  bigSplash(): void
  /** The camera went under the waterline (or came back up). */
  under(on: boolean): void
  /** Her fleet sailed off. */
  done(): void
  /** Something worth a word happened (IcebergMaker.tsx decides who says what, and how often). */
  moment(m: IcebergMoment): void
}
/** The moments the voices react to: a bit splashed in, the giant let go (a groan), its splash soaked the friends on the
 *  cliff, she pushed the giant under, the friends hopped on to ride it, a berg sailed away (the giant: `giantAway`), and
 *  the pokes (a berg fizzing, a blue scar, the seal, the orca, the friends). */
export type IcebergMoment = 'bit' | 'groan' | 'soak' | 'push' | 'ride' | 'away' | 'giantAway' | 'fizz' | 'blue' | 'seal' | 'orca' | 'friends'

export const ICEBERG_ANCHORS: AnchorInfo[] = [
  { id: 'north', label: 'The North Pole: a tall glacier', kind: 'thing' },
  { id: 'south', label: 'The South Pole: a flat ice shelf', kind: 'thing' },
  { id: 'crack0', label: 'A crack in the ice', kind: 'thing' },
  { id: 'crack1', label: 'A crack in the ice', kind: 'thing' },
  { id: 'crack2', label: 'A crack in the ice', kind: 'thing' },
  { id: 'giant', label: 'The long crack', kind: 'thing' },
  { id: 'berg', label: 'The giant iceberg: push it', kind: 'thing' },
  { id: 'friend', label: 'Friends on the ice', kind: 'thing' },
  { id: 'seal', label: 'A seal on a growler', kind: 'thing' },
  { id: 'orca', label: 'An orca', kind: 'thing' },
]

const SKY = '#C4E4FA'
const DEEP = '#3F86C8'
const CRACK_INK = '#2E4F96'
const CRACK_GLOW = '#5FD0FF'
const SCAR = '#8EC5F0'
/** No touch for this long: the next thing to tap glows. */
const HINT_S = 8
/** Past this far from the cliff, a berg has sailed away. */
const AWAY_Z = 22
/** Where a link to the later sections finds the bits that already fell. */
const FLOATING: [number, number][] = [
  [-6.5, 5],
  [5.5, 4],
  [-3.5, 9.5],
  [7, 9],
]
const DEG = Math.PI / 180
const ORDER: IcebergSection[] = ['pick', 'bits', 'giant', 'sail']

type State = 'stuck' | 'fall' | 'float' | 'away'

interface Crack {
  group: Group
  segs: Mesh[]
  lens: number[]
  total: number
  mat: MeshBasicMaterial
  /** Shown (0..1, creeps after a tap) and where it's creeping to; where it started. */
  shown: number
  goal: number
  start: number
  taps: number
}

interface Floater {
  kind: 'bit' | 'giant' | 'growler'
  group: Group
  /** The ice (shakes on its own while she taps it). */
  body: Group
  /** Riders stand on this. */
  deck: Group
  /** Height and footprint (m). */
  size: number
  r: number
  state: State
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  rx: number
  rxv: number
  rz: number
  rzv: number
  yaw: number
  /** Which way up it comes to rest (a little bit rolls to its nearest side). */
  restRx: number
  /** Stuck on the face: its slot, its crack, its taps, its shake and lean. */
  slot: number
  /** Stuck: the height of its middle on the face. */
  cy: number
  crack: Crack | null
  shakeT: number
  lean: number
  /** Seconds holding on the face before it lets go (the giant groans and leans first). */
  hold: number
  awayT: number
  /** Where it parks out at sea. */
  park: Vector2
}

interface Wave {
  x: number
  z: number
  age: number
  amp: number
  ring: Mesh
}

interface Rider {
  obj: Group
  bear?: Bear
  penguin?: Penguin
  /** Hopping across (s), from where, to which spot on which berg. */
  hopT: number
  from: Vector3
  to: Vector3
  on: Floater | null
}

const tmp = new Vector3()
const tmp2 = new Vector3()
const mtx = new Matrix4()
const quat = new Quaternion()
const scl = new Vector3()

export class IcebergMaker implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private fogAir = new Fog(SKY, 70, 230)
  private fogSea = new Fog(DEEP, 16, 75)
  private skyColor = new Color(SKY)
  private seaColor = new Color(DEEP)
  private water: Water
  private shape: PoleShape
  private pole: Pole
  private section: IcebergSection
  private raycaster = new Raycaster()
  private plane = new Plane(new Vector3(0, 1, 0), 0)
  private anchorEls = new Map<string, HTMLElement>()
  private unwatch: () => void
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private rand = rng(17)

  // ---- The ice.
  private floaters: Floater[] = []
  private giant: Floater | null = null
  private giantCrack: Crack | null = null
  private scars: Mesh[] = []
  private scarMat: MeshBasicMaterial
  private used = new Set<number>()
  private nextCrack = 0
  private broken = 0
  private waves: Wave[] = []
  private ringGeo: BufferGeometry
  /** One crack segment: a thin bar from its start along +x (scaled to length). */
  private segGeo: BufferGeometry
  private spray: Particles
  private foam: Particles
  private bubbles: InstancedMesh
  private bubblePool: { x: number; y: number; z: number; vy: number; age: number; life: number; size: number }[] = []
  private nextBubble = 0

  // ---- The pick: two little pieces of each pole, floating side by side.
  private picks: { pole: Pole; group: Group; y: number; vy: number; x: number; bear?: Bear; penguins: Penguin[] }[] = []
  private picked: Pole | null = null
  private pickT = 0

  // ---- The giant, from the drop to the hidden part.
  private splashT = -1
  private underT = -1
  private pushes = 0
  private releasedT = -1
  private sailT = -1
  private doneT = -1

  // ---- Everyone else.
  private riders: Rider[] = []
  private seal: Seal | null = null
  private growler: Floater | null = null
  private orca: Group
  private orcaRoll = -1
  private soakT = -1

  // ---- Her finger.
  private grab: { f: Floater; mode: 'push' | 'drag'; offset: Vector2; goal: Vector2; downY: number; push: number; trail: { t: number; x: number; z: number }[] } | null = null
  private lastTouch = 0

  private counts = { taps: 0, cracks: 0, bits: 0, giants: 0, pushes: 0, drags: 0, sailed: 0, pokes: 0, splashes: 0 }

  constructor(
    private renderer: WebGLRenderer,
    start: IcebergStart,
    private events: IcebergEvents,
  ) {
    const { scene, bag } = this
    scene.background = this.skyColor.clone()
    scene.fog = this.fogAir
    applyBands()
    this.rig.fov = 38
    this.rig.lag = 0.5
    this.section = start.section
    this.pole = start.pole
    this.shape = SHAPES[start.pole]

    // ---- The sea from above and from below (see-through, so the tip shows above the hidden part), and its floor ----
    this.water = new Water({ size: 600, deep: '#5FA6DE', shallow: '#78BCEA', haze: SKY, hazeNear: 60, hazeFar: 200 }, bag)
    this.water.mesh.position.set(0, 0, 120)
    scene.add(this.water.mesh)
    const under = new Mesh(bag.add(new PlaneGeometry(600, 600)), bag.add(new MeshBasicMaterial({ color: '#BFE6FF', side: BackSide, transparent: true, opacity: 0.45, depthWrite: false })))
    under.rotation.x = -Math.PI / 2
    under.position.set(0, -0.03, 120)
    under.renderOrder = 3
    scene.add(under)
    const floor = new Mesh(bag.add(new PlaneGeometry(240, 240)), toon('#7E9CC4'))
    floor.rotation.x = -Math.PI / 2
    floor.position.set(0, -20, 60)
    scene.add(floor)
    const r0 = rng(23)
    const rocks = []
    for (let i = 0; i < 30; i++) {
      const r = 0.8 + r0() * 2
      rocks.push(P.sphere(r, r0() < 0.5 ? '#8B97B3' : '#717D9C', { at: [(r0() - 0.5) * 60, -20 + r * 0.3, 2 + r0() * 50], scale: [1.3, 0.7, 1] }, 10))
    }
    scene.add(solid(merge(rocks), bag, 2))

    this.spray = new Particles({ kind: 'spray', count: 260 }, bag)
    this.foam = new Particles({ kind: 'foam', count: 90, opacity: 0.85 }, bag)
    scene.add(this.spray.mesh, this.foam.mesh)
    this.ringGeo = bag.add(new RingGeometry(0.9, 1, 64))
    this.segGeo = bag.add(new BoxGeometry(1, 0.2, 0.05).translate(0.5, 0, 0))
    this.bubbles = bag.add(new InstancedMesh(bag.add(new SphereGeometry(0.5, 8, 6)), bag.add(new MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.7 })), 90))
    this.bubbles.frustumCulled = false
    this.bubbles.count = 0
    scene.add(this.bubbles)
    for (let i = 0; i < 90; i++) this.bubblePool.push({ x: 0, y: 0, z: 0, vy: 0, age: 1, life: 0, size: 0 })
    this.scarMat = bag.add(new MeshBasicMaterial({ color: SCAR, polygonOffset: true, polygonOffsetFactor: -2 }))

    this.orca = buildOrca(bag)
    scene.add(this.orca)

    if (start.section === 'pick') this.buildPick()
    else this.buildPole(start.section)

    this.unwatch = watch('iceberg', () => {
      const g = this.giant
      const c = g?.state === 'stuck' ? this.giantCrack : this.floaters.find((f) => f.state === 'stuck')?.crack
      return {
        'crack': [c?.shown ?? 0, 1],
        'giant height (m)': [g && g.state !== 'stuck' ? g.y : 0, FLOAT.deep],
        'her push (m)': [this.grab?.mode === 'push' ? this.grab.push : 0, FLOAT.deep],
        'wave (m)': [this.waves.reduce((a, w) => Math.max(a, w.amp * Math.exp(-w.age / 1.6)), 0), 1.5],
      }
    })
  }

  // ---------------------------------------------------------------- building

  private buildPick() {
    for (const pole of ['north', 'south'] as Pole[]) {
      const s = SHAPES[pole]
      const group = new Group()
      const k = pole === 'north' ? 0.5 : 0.42
      const berg = solid(giantGeo(s), this.bag, 2.5)
      berg.scale.setScalar(k)
      group.add(berg)
      const x = pole === 'north' ? -4.2 : 4.2
      group.position.set(x, 0, 0)
      this.scene.add(group)
      const pick: (typeof this.picks)[number] = { pole, group, x, y: 0, vy: 0, penguins: [] }
      if (pole === 'north') {
        const b = new Bear(this.bag, 'pola', 0.8)
        b.root.position.set(s.giant.deck[0][0] * k, s.giant.deck[0][1] * k, s.giant.deck[0][2] * k)
        group.add(b.root)
        pick.bear = b
      } else {
        for (const [dx, dy, dz] of s.giant.deck) {
          const p = new Penguin(this.bag, 'adelie', 0.75)
          p.root.position.set(dx * k, dy * k, dz * k)
          group.add(p.root)
          pick.penguins.push(p)
        }
      }
      this.picks.push(pick)
    }
    this.orca.visible = false
  }

  private buildPole(section: IcebergSection) {
    const s = this.shape
    this.scene.add(buildCliff(s, this.bag))

    // The friends on the cliff top: Pola up north; Pebble's colony down south (the Adélies ride the giant later).
    if (s.pole === 'north') {
      const b = new Bear(this.bag, 'pola', 1.2)
      b.root.position.set(s.friends[0][0], s.h, s.friends[0][1])
      this.scene.add(b.root)
      this.riders.push({ obj: b.root, bear: b, hopT: -1, from: new Vector3(), to: new Vector3(), on: null })
    } else {
      s.friends.forEach(([x, z], i) => {
        const p = new Penguin(this.bag, i < 3 ? 'adelie' : 'emperor', i < 3 ? 0.8 : 1)
        p.root.position.set(x, s.h + 0.2, z)
        this.scene.add(p.root)
        this.riders.push({ obj: p.root, penguin: p, hopT: -1, from: new Vector3(), to: new Vector3(), on: null })
      })
    }

    // The seal sunbathing on a growler.
    const growler = this.makeFloater('growler', solid(growlerGeo(), this.bag, 2.5), 1.2, 1.4)
    this.placeFloating(growler, 8.5, 6.5)
    this.growler = growler
    this.seal = new Seal(this.bag)
    this.seal.root.scale.setScalar(0.55)
    this.seal.root.position.set(0, 0.55, 0)
    this.seal.root.rotation.y = -0.6
    growler.deck.add(this.seal.root)

    // The giant: part of the cliff until the long crack goes all the way.
    const g = this.makeFloater('giant', solid(giantGeo(s), this.bag, 2.5), s.giant.tip, s.giant.r)
    this.giant = g
    g.state = 'stuck'
    g.x = 0
    g.y = s.h - 1.2 - s.giant.tip
    g.z = 0.5 - s.giant.hd
    this.giantCrack = this.makeCrack(this.archPoints(), 0.6, 0.12)
    this.giantCrack.group.visible = section === 'giant'

    if (section === 'bits') {
      for (let i = 0; i < CRACK.loose; i++) this.addLoose()
      return
    }
    // Later sections: the bits she'd have broken off are already floating, with their scars on the face.
    for (const [x, z] of FLOATING) {
      const slot = this.freeSlot()
      if (slot >= 0) this.addScar(this.shape.slots[slot][0], this.shape.slots[slot][1], 1.4)
      const f = this.makeBit()
      this.placeFloating(f, x, z)
    }
    this.broken = FLOATING.length
    if (section === 'sail') {
      this.dropGiantAt(0, 9)
      this.addScar(0, g.y + s.giant.tip / 2, s.giant.hw * 2, s.giant.tip + 2)
      this.startSail(true)
    }
  }

  private makeFloater(kind: Floater['kind'], body: Group, size: number, r: number): Floater {
    const group = new Group()
    const deck = new Group()
    group.add(body, deck)
    this.scene.add(group)
    const f: Floater = { kind, group, body, deck, size, r, state: 'float', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, rx: 0, rxv: 0, rz: 0, rzv: 0, yaw: 0, restRx: 0, slot: -1, cy: 0, crack: null, shakeT: 0, lean: 0, hold: 0, awayT: 0, park: new Vector2() }
    this.floaters.push(f)
    return f
  }

  /** A little chunk, its middle `size * (0.5 - hidden)` above its waterline (so it floats with most of it under). */
  private makeBit() {
    const size = 1.3 + this.rand() * 0.5
    const body = solid(bitGeo(this.pole, size, this.rand), this.bag, 2.5)
    return this.makeFloater('bit', body, size, size * 0.6)
  }

  private placeFloating(f: Floater, x: number, z: number) {
    f.state = 'float'
    f.x = x
    f.z = z
    f.yaw = this.rand() * Math.PI * 2
    this.place(f, 0)
  }

  private freeSlot() {
    const free = this.shape.slots.map((_, i) => i).filter((i) => !this.used.has(i))
    if (!free.length) {
      // Every spot has fallen: the face is fresh again.
      this.used.clear()
      for (const m of this.scars) m.visible = false
      return Math.floor(this.rand() * this.shape.slots.length)
    }
    const i = free[Math.floor(this.rand() * free.length)]
    this.used.add(i)
    return i
  }

  /** A new loose chunk on the face, with its crack. */
  private addLoose() {
    const slot = this.freeSlot()
    const [x, y] = this.shape.slots[slot]
    const f = this.makeBit()
    f.state = 'stuck'
    f.slot = slot
    f.x = x
    f.z = 0.1 - f.size * 0.3
    f.cy = y
    // The crack: a jagged loop round the chunk, on the face.
    const hw = f.size * 0.62
    const hh = f.size * 0.6
    const pts: [number, number][] = []
    const n = 10
    for (let i = 0; i <= n; i++) {
      const a = Math.PI / 2 - (i / n) * Math.PI * 2
      const j = i === n ? 0 : (this.rand() - 0.5) * 0.22
      pts.push([x + Math.cos(a) * hw * (1 + j), y + Math.sin(a) * hh * (1 - j)])
    }
    pts[n] = pts[0]
    f.crack = this.makeCrack(pts, 0, 0.3)
    this.place(f, 0)
  }

  /** The long crack over the giant: up its left side, across above its tip, down its right. */
  private archPoints(): [number, number][] {
    const s = this.shape
    const g = s.giant
    const top = s.h - 1.2 + 0.35
    const x0 = g.hw + 0.25
    const pts: [number, number][] = [[-x0, 0.1]]
    for (let i = 1; i <= 3; i++) pts.push([-x0 + (i % 2 ? 0.18 : -0.12), (top * i) / 4])
    for (let i = 0; i <= 8; i++) pts.push([-x0 + (2 * x0 * i) / 8, top + (i % 2 ? 0.25 : -0.05)])
    for (let i = 3; i >= 1; i--) pts.push([x0 + (i % 2 ? -0.18 : 0.12), (top * i) / 4])
    pts.push([x0, 0.1])
    return pts
  }

  /** A crack starts this far along (so she sees it before she taps), then each tap grows it the rest of the way. */
  private makeCrack(pts: [number, number][], thick: number, start: number): Crack {
    const group = new Group()
    const mat = this.bag.add(new MeshBasicMaterial({ color: CRACK_INK, polygonOffset: true, polygonOffsetFactor: -4 }))
    const segs: Mesh[] = []
    const lens: number[] = []
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1]
      const [bx, by] = pts[i]
      const m = new Mesh(this.segGeo, mat)
      m.position.set(ax, ay, 0.04)
      m.rotation.z = Math.atan2(by - ay, bx - ax)
      m.scale.set(0.0001, 1 + thick, 1)
      group.add(m)
      segs.push(m)
      lens.push(Math.hypot(bx - ax, by - ay))
    }
    this.scene.add(group)
    return { group, segs, lens, total: lens.reduce((a, b) => a + b, 0), mat, shown: start, goal: start, start, taps: 0 }
  }

  private addScar(x: number, y: number, w: number, h = w) {
    const m = this.scars.find((s) => !s.visible) ?? new Mesh(this.bag.add(new PlaneGeometry(1, 1)), this.scarMat)
    if (!this.scars.includes(m)) {
      this.scars.push(m)
      this.scene.add(m)
    }
    m.visible = true
    m.position.set(x, y, 0.025)
    m.scale.set(w * 0.85, h * 0.8, 1)
  }

  // ---------------------------------------------------------------- cracking

  private tapCrack(f: Floater) {
    const c = f.kind === 'giant' ? this.giantCrack : f.crack
    if (!c || f.state !== 'stuck' || c.goal >= 1) return
    const big = f.kind === 'giant'
    const need = Math.max(1, Math.round(big ? CRACK.giantTaps : CRACK.bitTaps))
    c.taps++
    // (Counted, not summed: five fifths can come out a hair under 1.)
    c.goal = c.taps >= need ? 1 : c.start + ((1 - c.start) * c.taps) / need
    f.shakeT = big ? 0.6 : 0.4
    f.lean += CRACK.lean * DEG * (big ? 0.6 : 1)
    this.counts.cracks++
    // Creak (a groan for the giant), and crumbs of snow off the crack.
    if (big) {
      tone(62, 40, 1.1, 0.2, 'sawtooth')
      noise(0.9, 0.08, 'lowpass', 400, 120)
    } else {
      tone(150 + this.rand() * 40, 90, 0.35, 0.1, 'sawtooth')
      noise(0.25, 0.06, 'bandpass', 700, 300, 0, 3)
    }
    if (c.goal >= 1) sfx.crack()
    const p = f.group.position
    this.spray.burst(p.x, p.y + f.size * 0.5 + (big ? this.shape.giant.tip * 0.5 : 0), Math.max(p.z, 0) + 0.4, big ? 14 : 6, 1.2, 1.5, 0.1)
  }

  /** The crack went all the way round: it lets go. */
  private breakOff(f: Floater) {
    const c = f.kind === 'giant' ? this.giantCrack : f.crack
    if (c) c.group.visible = false
    f.state = 'fall'
    f.vy = 0
    f.vz = f.kind === 'giant' ? 3.2 : 1.2 + this.rand() * 0.8
    f.vx = (this.rand() - 0.5) * 0.6
    f.rx = f.lean
    f.rxv = f.kind === 'giant' ? 0.35 : 2 + this.rand() * 2
    f.rzv = (this.rand() - 0.5) * (f.kind === 'giant' ? 0.1 : 1.5)
    // The giant hangs on a moment, groaning and leaning out, before it drops.
    f.hold = f.kind === 'giant' ? 0.8 : 0
    if (f.kind === 'giant') {
      tone(50, 30, 1.6, 0.26, 'sawtooth')
      noise(1.4, 0.12, 'lowpass', 300, 80)
      noise(0.12, 0.4, 'highpass', 1200, 2400, 0.2)
      this.addScar(0, f.y + this.shape.giant.tip / 2, this.shape.giant.hw * 2, this.shape.giant.tip + 2)
      this.events.moment('groan')
    } else {
      noise(0.08, 0.35, 'highpass', 1500, 2500)
      if (f.slot >= 0) this.addScar(this.shape.slots[f.slot][0], this.shape.slots[f.slot][1], f.size)
      this.used.delete(f.slot)
    }
  }

  /** It hits the water. */
  private impact(f: Floater) {
    f.state = 'float'
    f.vy *= FLOAT.plunge
    f.vz *= 0.6
    const big = f.kind === 'giant'
    if (!big) f.restRx = Math.round(f.rx / (Math.PI / 2)) * (Math.PI / 2)
    const k = CRACK.splash * (big ? 3 : clamp(f.size / 1.5, 0.6, 1.3))
    this.counts.splashes++
    sfx.splash()
    if (big) {
      noise(1.6, 0.25, 'lowpass', 900, 120)
      tone(90, 40, 0.8, 0.25)
      this.splashT = 0
      this.soakT = 0.35
      this.events.bigSplash()
      this.counts.giants++
      // Water everywhere along its front.
      for (let i = -2; i <= 2; i++) this.spray.burst(f.x + i * this.shape.giant.hw * 0.45, 0.2, f.z + this.shape.giant.hd, 18, 4.5, 9, 0.45)
    } else {
      this.counts.bits++
      this.broken++
      this.events.moment('bit')
    }
    this.spray.burst(f.x, 0.15, f.z, Math.round(16 * k), 2.4 * Math.sqrt(k), 4.5 * Math.sqrt(k), 0.22 * Math.sqrt(k))
    for (let i = 0; i < 3; i++) this.foam.emit(f.x, 0.02, f.z, 0, 0, 0, 1.2 + i * 0.4, (1.6 + i) * k)
    this.addWave(f.x, f.z, (big ? 0.9 : 0.25) * CRACK.splash)
    for (let i = 0; i < (big ? 30 : 8); i++) this.bubble(f.x + (this.rand() - 0.5) * f.r * 2, -0.5 - this.rand() * (big ? 8 : 2), f.z + (this.rand() - 0.5) * f.r * 2)
    if (!big && this.section === 'bits') {
      this.nextCrack = this.time + CRACK.regrow
      if (this.broken >= CRACK.bits) this.startGiant()
    }
  }

  private addWave(x: number, z: number, amp: number) {
    let w = this.waves.find((v) => v.age > 4)
    if (!w) {
      const ring = new Mesh(this.ringGeo, this.bag.add(new MeshBasicMaterial({ color: '#FFFFFF', transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 })))
      ring.rotation.x = -Math.PI / 2
      ring.renderOrder = 2
      this.scene.add(ring)
      w = { x, z, age: 0, amp, ring }
      this.waves.push(w)
    }
    w.x = x
    w.z = z
    w.age = 0
    w.amp = amp
  }

  /** The wave's height where a floater is (m), and it nudges the floater outward. */
  private waveAt(x: number, z: number) {
    let h = 0
    for (const w of this.waves) {
      if (w.age > 4) continue
      const d = Math.hypot(x - w.x, z - w.z)
      const front = CRACK.wave * w.age
      h += w.amp * Math.exp(-w.age / 1.6) * Math.exp(-(((d - front) / 1.4) ** 2))
    }
    return h
  }

  // ---------------------------------------------------------------- the stages

  private startGiant() {
    if (this.section !== 'bits') return
    this.goSection('giant')
    // The little cracks close up; the long one opens with a groan, and the whole cliff shudders.
    for (const f of this.looseBits()) {
      this.scene.remove(f.group)
      if (f.crack) this.scene.remove(f.crack.group)
      this.floaters.splice(this.floaters.indexOf(f), 1)
      this.used.delete(f.slot)
    }
    if (this.giantCrack) this.giantCrack.group.visible = true
    if (this.giant) this.giant.shakeT = 0.8
    tone(55, 38, 1.4, 0.18, 'sawtooth')
    noise(1.2, 0.07, 'lowpass', 350, 100)
  }

  /** Straight to a settled giant (a link to `sail`). */
  private dropGiantAt(x: number, z: number) {
    const g = this.giant!
    g.state = 'float'
    g.x = x
    g.z = z
    g.y = g.rx = g.vy = g.rxv = 0
    if (this.giantCrack) this.giantCrack.group.visible = false
    this.splashT = 99
    this.underT = -1
  }

  private startSail(snap = false) {
    if (this.sailT >= 0) return
    this.sailT = 0
    if (this.underT >= 0) this.events.under(false)
    this.underT = -1
    this.goSection('sail')
    // The friends hop onto the giant to ride it out to sea (one Adélie per spot down south).
    const g = this.giant!
    const spots = this.shape.giant.deck
    let i = 0
    for (const r of this.riders) {
      if (r.penguin && r.penguin.kind !== 'adelie') continue
      if (i >= spots.length) break
      const [x, y, z] = spots[i++]
      r.on = g
      r.to.set(x, y, z)
      if (snap) {
        g.deck.add(r.obj)
        r.obj.position.copy(r.to)
        r.obj.rotation.y = Math.PI
      } else {
        r.obj.getWorldPosition(r.from)
        // One after another (each counts up to 0.8, then hops).
        r.hopT = 1.1 - i * 0.3
      }
    }
    if (!snap) this.events.moment('ride')
    if (this.growler) {
      // The seal's growler drifts out to sea by itself.
      this.growler.vz = 0.5
    }
  }

  private goSection(s: IcebergSection) {
    if (ORDER.indexOf(s) <= ORDER.indexOf(this.section)) return
    this.section = s
    this.events.section(s)
    sounds.sparkle()
  }

  // ---------------------------------------------------------------- World3D

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.tall = h > w
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
    this.rig.setShot(this.shot(), true)
  }

  setAnchorElements(els: Map<string, HTMLElement>) {
    this.anchorEls = els
  }

  get calm() {
    if (this.section === 'pick') return !this.picked && !this.spray.busy && !this.rig.moving
    const still = (f: Floater) => f.state === 'stuck' || (Math.abs(f.vy) < 0.03 && Math.hypot(f.vx, f.vz) < 0.03 && Math.abs(f.rxv) < 0.01)
    return !this.grab && !this.spray.busy && !this.foam.busy && !this.rig.moving && this.waves.every((w) => w.age > 3.5) && this.floaters.every(still) && this.riders.every((r) => r.hopT < 0)
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.water.update(t)
    if (this.section === 'pick') this.updatePick(dt, t)
    else {
      if (this.section === 'bits' && this.nextCrack && t > this.nextCrack) {
        this.nextCrack = 0
        const loose = this.floaters.filter((f) => f.state === 'stuck' && f.kind === 'bit').length
        for (let i = loose; i < CRACK.loose; i++) this.addLoose()
      }
      this.updateCracks(dt)
      // (A copy: the last little bit's splash opens the giant, which takes the other loose chunks off the face.)
      for (const f of [...this.floaters]) this.updateFloater(f, dt, t)
      this.bump()
      this.updateGiantStory(dt)
      this.updateRiders(dt, t)
      this.updateOrca(dt, t)
      this.seal?.update(dt, t)
    }
    for (const w of this.waves) {
      w.age += dt
      const r = Math.max(0.1, CRACK.wave * w.age)
      w.ring.visible = w.age < 3.5
      w.ring.position.set(w.x, 0.03 + swell(w.x, w.z, t) * 0.5, w.z)
      w.ring.scale.set(r, r, 1)
      ;(w.ring.material as MeshBasicMaterial).opacity = 0.8 * Math.max(0, 1 - w.age / 3.5)
    }
    this.spray.update(dt)
    this.foam.update(dt)
    this.updateBubbles(dt)

    // Under the sea, the world turns blue.
    const underSea = this.rig.camera.position.y < 0
    this.scene.fog = underSea ? this.fogSea : this.fogAir
    ;(this.scene.background as Color).copy(underSea ? this.seaColor : this.skyColor)

    const shot = this.shot()
    this.lights.follow(shot.center.x, Math.max(0, shot.center.y), shot.center.z)
    this.rig.setShot(shot)
    this.rig.update(dt)
  }

  private updatePick(dt: number, t: number) {
    const w = FLOAT.bob * Math.PI * 2
    for (const p of this.picks) {
      p.vy += (-w * w * p.y - 2 * FLOAT.damp * w * p.vy) * dt
      p.y += p.vy * dt
      // The one she didn't pick drifts off; the picked one wobbles.
      if (this.picked && this.picked !== p.pole) p.x += (p.pole === 'north' ? -1 : 1) * 4 * dt
      p.group.position.set(p.x, p.y + swell(p.x, 0, t) * 0.6, 0)
      p.group.rotation.set(swell(p.x, 1, t) * 0.1, 0, swell(p.x + 1, 0, t) * 0.1)
      p.bear?.update(dt, t)
      for (const q of p.penguins) q.update(dt, t)
    }
    if (this.picked && (this.pickT += dt) > 1.1) {
      const pole = this.picked
      this.picked = null
      this.events.pick(pole)
    }
  }

  private updateCracks(dt: number) {
    for (const f of this.floaters) {
      if (f.state !== 'stuck') continue
      const c = f.kind === 'giant' ? this.giantCrack : f.crack
      if (!c || !c.group.visible) continue
      const taps = Math.max(1, Math.round(f.kind === 'giant' ? CRACK.giantTaps : CRACK.bitTaps))
      if (c.shown < c.goal) c.shown = Math.min(c.goal, c.shown + (1 - c.start) / Math.max(0.01, CRACK.grow * taps) * dt)
      let acc = 0
      c.segs.forEach((m, i) => {
        const k = clamp((c.shown * c.total - acc) / c.lens[i])
        m.scale.x = Math.max(0.0001, c.lens[i] * k)
        acc += c.lens[i]
      })
      // Glows when it's the thing to tap and she's been still a while.
      const glow = this.stuck() && (f === this.giant || f === this.floaters.find((o) => o.state === 'stuck' && o.kind === 'bit'))
      c.mat.color.set(glow && Math.sin(this.time * 6) > 0 ? CRACK_GLOW : CRACK_INK)
      if (c.goal >= 1 && c.shown >= 1) this.breakOff(f)
    }
  }

  private stuck() {
    return this.time - this.lastTouch > HINT_S && this.doneT < 0
  }

  private updateFloater(f: Floater, dt: number, t: number) {
    const w = FLOAT.bob * Math.PI * 2
    const wr = FLOAT.rock * Math.PI * 2
    if (f.shakeT > 0) f.shakeT = Math.max(0, f.shakeT - dt)
    const sh = f.shakeT > 0 ? CRACK.shake * (f.kind === 'giant' ? 2 : 1) * Math.min(1, f.shakeT * 4) : 0
    f.body.position.x = sh * Math.sin(t * 61)
    f.body.position.z = sh * Math.sin(t * 47 + 1)
    switch (f.state) {
      case 'stuck': {
        if (f.kind === 'bit') f.y = f.cy - f.size * (0.5 - FLOAT.hidden)
        // It leans out a little more with every tap.
        f.rx += (f.lean - f.rx) * (1 - Math.exp(-dt * 8))
        break
      }
      case 'fall': {
        if (f.hold > 0) {
          f.hold -= dt
          f.rxv += 0.6 * dt
          f.rx += f.rxv * dt
          f.shakeT = 0.3
          break
        }
        f.vy -= CRACK.fall * dt
        f.y += f.vy * dt
        f.x += f.vx * dt
        f.z += f.vz * dt
        f.rx += f.rxv * dt
        f.rz += f.rzv * dt
        if (f.y <= 0) this.impact(f)
        break
      }
      case 'float':
      case 'away': {
        // Buoyancy: a spring to its waterline, riding the swell and any wave going by.
        const held = this.grab?.f === f ? this.grab : null
        if (held?.mode === 'push') {
          // Her finger holds it down.
          const y = f.y + (-held.push - f.y) * (1 - Math.exp(-FLOAT.grip * dt))
          f.vy = (y - f.y) / Math.max(dt, 1e-3)
          f.y = y
        } else {
          f.vy += (-w * w * (f.y - this.waveAt(f.x, f.z)) - 2 * FLOAT.damp * w * f.vy) * dt
          f.y += f.vy * dt
        }
        // Rocks back to its resting side.
        f.rxv += (-wr * wr * (f.rx - f.restRx) - 2 * FLOAT.rockDamp * wr * f.rxv) * dt
        f.rx += f.rxv * dt
        f.rzv += (-wr * wr * f.rz - 2 * FLOAT.rockDamp * wr * f.rzv) * dt
        f.rz += f.rzv * dt
        // Sliding about on the water.
        if (held?.mode === 'drag') {
          f.vx = clamp((held.goal.x - f.x) * FLOAT.grip, -9, 9)
          f.vz = clamp((held.goal.y - f.z) * FLOAT.grip, -9, 9)
        } else if (f.state === 'away') {
          // Out at sea it sails on by itself to its spot in the fleet.
          f.awayT += dt
          const dx = f.park.x - f.x
          const dz = f.park.y - f.z
          const d = Math.hypot(dx, dz)
          const sp = Math.min(1.6, d * 0.4)
          f.vx += ((dx / (d || 1)) * sp - f.vx) * (1 - Math.exp(-dt))
          f.vz += ((dz / (d || 1)) * sp - f.vz) * (1 - Math.exp(-dt))
        } else {
          const drag = Math.exp(-FLOAT.glide * dt)
          f.vx *= drag
          f.vz *= drag
          // A wave going by pushes it outward a little.
          for (const wv of this.waves) {
            if (wv.age > 3) continue
            const dx = f.x - wv.x
            const dz = f.z - wv.z
            const d = Math.hypot(dx, dz) || 1
            const front = CRACK.wave * wv.age
            const hit = wv.amp * Math.exp(-wv.age / 1.6) * Math.exp(-(((d - front) / 1.4) ** 2))
            f.vx += (dx / d) * hit * 3 * dt
            f.vz += (dz / d) * hit * 3 * dt
          }
        }
        f.x += f.vx * dt
        f.z += f.vz * dt
        f.yaw += f.vx * 0.04 * dt
        // Off the cliff, never into it.
        // (A soft push, so the giant eases out from where it dropped.)
        const front = f.r * 0.8 + 0.3
        if (f.z < front) {
          if (f.vz < -1.5) {
            sfx.thump()
            this.foam.emit(f.x, 0.02, f.z, 0, 0, 0, 1, 1.4)
            f.vz = Math.abs(f.vz) * 0.3
          }
          f.vz = Math.max(f.vz, Math.min(3, (front - f.z) * 1.5))
        }
        // Never off the sides of the screen: a soft wall turns it back (so a sideways flick can't lose it).
        if (f.state === 'float' && !held) {
          const side = this.tall ? 6.5 : 10
          const over = Math.abs(f.x) - side
          if (over > 0) {
            const k = Math.sign(f.x)
            if (f.vx * k > 0) f.vx *= -0.4
            f.vx -= k * Math.min(4, over * 3) * dt
          }
        }
        // Far enough out (sail): it's away.
        if (f.state === 'float' && this.section === 'sail' && f.z > AWAY_Z && f.kind !== 'growler') this.sailAway(f)
        break
      }
    }
    this.place(f, t)
  }

  private place(f: Floater, t: number) {
    // A bit floats with most of it under: its middle sits below its waterline.
    if (f.kind === 'bit') {
      f.body.position.y = f.size * (0.5 - FLOAT.hidden)
      f.deck.position.y = f.size * (1 - FLOAT.hidden)
    }
    const floating = f.state === 'float' || f.state === 'away'
    const sw = floating ? swell(f.x, f.z, t) * 0.8 : 0
    f.group.position.set(f.x, f.y + sw, f.z)
    f.group.rotation.set(f.rx + (floating ? swell(f.x, f.z + 1, t) * 0.06 : 0), f.yaw, f.rz + (floating ? swell(f.x + 1, f.z, t) * 0.06 : 0), 'YXZ')
    if (f.kind === 'bit' && f.state === 'stuck') f.group.rotation.y = 0
  }

  /** Floating ice bumps instead of going through each other. */
  private bump() {
    const fl = this.floaters.filter((f) => f.state === 'float')
    for (let i = 0; i < fl.length; i++)
      for (let j = i + 1; j < fl.length; j++) {
        const a = fl[i]
        const b = fl[j]
        const dx = a.x - b.x
        const dz = a.z - b.z
        const min = (a.r + b.r) * 0.85
        const d = Math.hypot(dx, dz)
        if (d >= min || d < 1e-4) continue
        // The giant shoves the little ones.
        const wa = a.kind === 'giant' ? 0.1 : b.kind === 'giant' ? 0.9 : 0.5
        const push = (min - d) / d
        a.x += dx * push * wa
        a.z += dz * push * wa
        b.x -= dx * push * (1 - wa)
        b.z -= dz * push * (1 - wa)
        const rel = (a.vx - b.vx) * dx + (a.vz - b.vz) * dz
        if (rel < 0) {
          const k = rel / (d * d)
          a.vx -= dx * k * wa
          a.vz -= dz * k * wa
          b.vx += dx * k * (1 - wa)
          b.vz += dz * k * (1 - wa)
          if (rel / d < -1.5) sfx.thump()
        }
      }
  }

  /** The giant's story after the drop: the camera dips under, she pushes it down, then up we go to send it sailing. */
  private updateGiantStory(dt: number) {
    if (this.splashT >= 0 && this.splashT < 50) this.splashT += dt
    if (this.section === 'giant' && this.splashT > 3 && this.underT < 0) {
      this.underT = 0
      this.events.under(true)
      noise(0.8, 0.06, 'lowpass', 600, 150)
    }
    if (this.underT >= 0) {
      this.underT += dt
      if (this.releasedT >= 0) this.releasedT += dt
      if ((this.pushes >= 3 && this.releasedT > 2.5 && !this.grab) || this.underT > 30) this.startSail()
    }
    if (this.soakT > 0) {
      this.soakT -= dt
      if (this.soakT <= 0) this.soak()
    }
    if (this.sailT >= 0) {
      this.sailT += dt
      const g = this.giant!
      const bits = this.floaters.filter((f) => f.kind === 'bit' && f.state !== 'stuck')
      const away = bits.filter((f) => f.state === 'away').length
      if (this.doneT < 0 && g.state === 'away' && away >= Math.min(3, bits.length)) {
        this.doneT = 0
        sounds.fanfare()
        this.events.done()
      }
      if (this.doneT >= 0) this.doneT += dt
    }
  }

  private sailAway(f: Floater) {
    f.state = 'away'
    this.counts.sailed++
    const n = this.floaters.filter((o) => o.state === 'away' && o.group.visible).length
    // Spread out in a loose fleet toward the horizon.
    f.park.set(clamp(f.x * 0.5, -8, 8) + (n % 2 ? 3.5 : -3.5) * Math.ceil(n / 2) * 0.8, 32 + (n % 3) * 4 + this.rand() * 3)
    sounds.note(Math.min(10, 3 + n))
    for (const r of this.riders) if (r.on === f) r.bear ? r.bear.wave() : r.penguin?.hop()
    this.events.moment(f === this.giant ? 'giantAway' : 'away')
  }

  /** The giant's splash soaks the friends on the cliff top: they shake it off. */
  private soak() {
    for (const r of this.riders) {
      if (r.on) continue
      r.obj.getWorldPosition(tmp)
      this.spray.burst(tmp.x, tmp.y + 1.6, tmp.z, 16, 1.4, 1, 0.16)
      if (r.bear) r.bear.shake()
      else if (r.penguin?.kind === 'adelie') r.penguin.spin()
      else r.penguin?.hop()
    }
    sfx.splash()
    this.events.moment('soak')
  }

  private updateRiders(dt: number, t: number) {
    for (const r of this.riders) {
      if (r.hopT >= 0 && r.on) {
        r.hopT += dt
        // (A wait in line first: hopT starts below 0.8.)
        const k = clamp((r.hopT - 0.8) / 0.9)
        if (k > 0) {
          r.on.deck.localToWorld(tmp.copy(r.to))
          if (r.obj.parent !== this.scene) this.scene.attach(r.obj)
          r.obj.position.set(r.from.x + (tmp.x - r.from.x) * k, r.from.y + (tmp.y - r.from.y) * k + 3 * k * (1 - k) * 2, r.from.z + (tmp.z - r.from.z) * k)
          r.obj.rotation.y = Math.atan2(tmp.x - r.from.x, tmp.z - r.from.z)
          if (r.hopT - dt <= 0.8) sfx.boing()
          if (k >= 1) {
            r.hopT = -1
            r.on.deck.attach(r.obj)
            r.obj.position.copy(r.to)
            r.obj.rotation.set(0, Math.PI, 0)
            sfx.thump()
            r.bear ? r.bear.hop() : r.penguin?.hop()
          }
        }
      }
      // Out at sea, they wave now and then.
      if (r.on?.state === 'away' && Math.floor(t / 2.6) !== Math.floor((t - dt) / 2.6)) r.bear ? r.bear.wave() : r.penguin?.hop()
      r.bear?.update(dt, t, r.hopT > 0.8 ? { flail: 0.6, stretch: 0.1 } : {})
      r.penguin?.update(dt, t, r.hopT > 0.8 ? { flail: 0.8 } : {})
    }
  }

  /** The orca loops slowly round under the bergs (orcas live at both poles). */
  private updateOrca(dt: number, t: number) {
    const a = t * 0.18
    const cx = this.giant && this.giant.state !== 'stuck' ? this.giant.x : 0
    const cz = this.giant && this.giant.state !== 'stuck' ? this.giant.z : 10
    this.orca.position.set(cx + Math.cos(a) * 11, -7 + Math.sin(t * 0.7) * 0.8, cz + Math.sin(a) * 9)
    // Facing the way it swims (round the loop).
    this.orca.rotation.set(0.1 * Math.cos(t * 0.7), Math.atan2(-Math.sin(a) * 11, Math.cos(a) * 9), 0)
    if (this.orcaRoll >= 0) {
      this.orcaRoll += dt
      this.orca.rotation.z = Math.PI * 2 * Math.min(1, this.orcaRoll / 1.2)
      if (this.orcaRoll > 1.2) this.orcaRoll = -1
    }
  }

  private bubble(x: number, y: number, z: number) {
    const b = this.bubblePool[this.nextBubble]
    this.nextBubble = (this.nextBubble + 1) % this.bubblePool.length
    Object.assign(b, { x, y, z, vy: 1.2 + Math.random() * 1.4, age: 0, life: 4, size: 0.12 + Math.random() * 0.16 })
  }

  private updateBubbles(dt: number) {
    let n = 0
    for (const b of this.bubblePool) {
      if (b.age >= b.life) continue
      b.age += dt
      b.y += b.vy * dt
      b.x += Math.sin(b.age * 8 + b.z) * 0.2 * dt
      if (b.y > -0.05) b.age = b.life
      if (b.age >= b.life) continue
      const s = b.size * (1 + b.age * 0.5)
      mtx.compose(tmp.set(b.x, b.y, b.z), quat.identity(), scl.set(s, s, s))
      this.bubbles.setMatrixAt(n++, mtx)
    }
    this.bubbles.count = n
    this.bubbles.instanceMatrix.needsUpdate = true
  }

  /** "Bergy seltzer": air trapped in the ice for a very long time fizzes out. */
  private fizz(f: Floater) {
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2
      this.spray.emit(f.x + Math.cos(a) * f.r * 0.8, 0.05, f.z + Math.sin(a) * f.r * 0.8, 0, 0.6 + Math.random() * 0.8, 0, 0.5, 0.07)
      this.bubble(f.x + Math.cos(a) * f.r * 0.7, -0.4 - Math.random() * f.size, f.z + Math.sin(a) * f.r * 0.7)
    }
    for (let i = 0; i < 6; i++) noise(0.03, 0.12, 'highpass', 4000 + Math.random() * 3000, 6000, i * 0.06 + Math.random() * 0.04, 4)
    this.events.moment('fizz')
  }

  // ---------------------------------------------------------------- the camera

  private shot(): Shot {
    const s = this.shape
    const tall = this.tall
    if (this.section === 'pick') return { center: new Vector3(0, 1.2, 0), half: tall ? new Vector3(6.6, 3.5, 2.6) : new Vector3(8, 2.4, 2.6), yaw: 0, pitch: 16 }
    const g = this.giant!
    if (this.doneT >= 0 && this.doneT < 9) {
      // The fleet sailing off, the friends waving.
      return { center: new Vector3(0, 1, 38), half: tall ? new Vector3(12, 3, 18) : new Vector3(18, 3, 13), yaw: 180, pitch: 18 }
    }
    if (this.sailT >= 0) {
      // From the top of the cliff, out to sea: she flicks the bergs away from her, up the screen.
      return { center: new Vector3(0, 0, 13), half: tall ? new Vector3(8, 1.5, 11) : new Vector3(12, 1.5, 9), yaw: 180, pitch: this.sailT < 1.2 ? 70 : 54 }
    }
    if (this.underT >= 0) {
      // Under the waterline: the whole berg, tip and all the hidden part.
      const mid = (s.giant.tip + s.giant.keel) / 2
      const lean = this.underT < 0.8 ? 6 : 2
      return { center: new Vector3(g.x, Math.min(-1.5, g.y + mid), g.z), half: new Vector3(s.giant.hw * 1.25, (s.giant.tip - s.giant.keel) / 2 + 0.6, s.giant.hd * 1.2), yaw: 22, pitch: lean, maxDist: 60 }
    }
    if (g.state === 'fall' || (g.state === 'float' && this.section === 'giant')) {
      return { center: new Vector3(g.x, s.giant.tip * 0.3, Math.max(3, g.z)), half: tall ? new Vector3(s.giant.hw + 3, 3, 6) : new Vector3(s.giant.hw + 5, 3, 5), yaw: 8, pitch: 16 }
    }
    if (this.section === 'giant') {
      return { center: new Vector3(0, s.h * 0.45, 2.5), half: tall ? new Vector3(s.giant.hw + 2.2, s.h * 0.55, 4) : new Vector3(s.giant.hw + 4, s.h * 0.55, 3.5), yaw: 0, pitch: 12 }
    }
    // The face with its cracks, and the water in front where the bits float.
    return { center: new Vector3(0, s.h * 0.42, 3.5), half: tall ? new Vector3(8.8, s.h * 0.6, 4.5) : new Vector3(9.4, s.h * 0.55, 4), yaw: 0, pitch: 13 }
  }

  render() {
    this.renderer.render(this.scene, this.rig.camera)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  // ---------------------------------------------------------------- her finger

  private toScreen(v: Vector3) {
    const p = v.clone().project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }

  private hitPlane(x: number, y: number, height: number) {
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    this.plane.constant = -height
    return this.raycaster.ray.intersectPlane(this.plane, new Vector3())
  }

  /** A floater's middle on screen and how big a finger target it needs. */
  private onScreen(f: Floater) {
    const g = f === this.giant
    const under = this.underT >= 0 && g
    const mid = under ? (this.shape.giant.tip + this.shape.giant.keel) / 2 : g ? this.shape.giant.tip * 0.4 : f.state === 'stuck' ? f.size * (0.5 - FLOAT.hidden) : f.size * 0.1
    const c = this.toScreen(f.group.localToWorld(tmp.set(0, mid, 0)))
    const reach = under ? (this.shape.giant.tip - this.shape.giant.keel) / 2 : g ? this.shape.giant.hw : f.r
    const e = this.toScreen(f.group.localToWorld(tmp2.set(0, mid + reach, 0)))
    const e2 = this.toScreen(tmp2.set(f.group.position.x + reach, f.group.position.y + mid, f.group.position.z))
    return { x: c.x, y: c.y, z: c.z, r: Math.max(Math.hypot(e.x - c.x, e.y - c.y), Math.hypot(e2.x - c.x, e2.y - c.y) * (g ? 0.9 : 1)) }
  }

  /** The floating (or stuck) ice under a screen point. */
  private floaterAt(x: number, y: number, stuck: boolean) {
    let best: Floater | null = null
    let bd = Infinity
    for (const f of this.floaters) {
      if (!f.group.visible || (stuck ? f.state !== 'stuck' : f.state !== 'float' && f.state !== 'away')) continue
      if (!stuck && f === this.giant && this.underT < 0 && this.section === 'giant' && this.splashT < 3) continue
      const p = this.onScreen(f)
      if (p.z > 1) continue
      const d = Math.hypot(x - p.x, y - p.y)
      const reach = Math.max(p.r * 1.15, 36)
      if (d < reach && d / reach < bd) {
        bd = d / reach
        best = f
      }
    }
    return best
  }

  /** Meters a pixel moves at the giant (for her push). */
  private metersPerPixel(f: Floater) {
    const a = this.toScreen(f.group.localToWorld(tmp.set(0, 0, 0)))
    const b = this.toScreen(f.group.localToWorld(tmp2.set(0, 1, 0)))
    return 1 / Math.max(1, Math.hypot(a.x - b.x, a.y - b.y))
  }

  pointerDown(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.grab = null
    if (this.section === 'pick') return
    let f: Floater | null = null
    if (id === 'berg') f = this.giant
    else if (!id) f = this.floaterAt(x, y, false)
    if (!f || (f.state !== 'float' && f.state !== 'away')) return
    if (f === this.giant && this.underT >= 0) {
      this.grab = { f, mode: 'push', offset: new Vector2(), goal: new Vector2(), downY: y, push: Math.max(0, -f.y), trail: [] }
      sounds.pickup()
      return
    }
    const hit = this.hitPlane(x, y, 0)
    if (!hit) return
    this.grab = { f, mode: 'drag', offset: new Vector2(hit.x - f.x, hit.z - f.z), goal: new Vector2(f.x, f.z), downY: y, push: 0, trail: [{ t: performance.now() / 1000, x: f.x, z: f.z }] }
    if (f.state === 'away') f.state = 'float'
  }

  pointerMove(x: number, y: number, _dx: number, _dy: number, held: boolean) {
    const g = this.grab
    if (!held || !g) return
    this.lastTouch = this.time
    if (g.mode === 'push') {
      const was = g.push
      g.push = clamp((y - g.downY) * this.metersPerPixel(g.f) * FLOAT.pushK, 0, FLOAT.deep)
      // Bubbles stream off it as it goes down.
      if (g.push > was + 0.15) this.bubble(g.f.x + (Math.random() - 0.5) * this.shape.giant.hw * 2, -1 - Math.random() * 4, g.f.z + this.shape.giant.hd)
      return
    }
    const hit = this.hitPlane(x, y, 0)
    if (!hit) return
    g.goal.set(hit.x - g.offset.x, hit.z - g.offset.y)
    // Where her finger was lately, for the flick when she lets go.
    const now = performance.now() / 1000
    g.trail.push({ t: now, x: g.goal.x, z: g.goal.y })
    while (g.trail.length > 2 && now - g.trail[1].t > 0.12) g.trail.shift()
  }

  pointerUp() {
    const g = this.grab
    this.grab = null
    if (!g) return
    if (g.mode === 'push') {
      if (g.push > 0.6) {
        this.pushes++
        this.counts.pushes++
        this.releasedT = 0
        // Let go: up it shoots (the water pushes it), and bobs.
        sfx.boing()
        this.events.moment('push')
      }
      return
    }
    // The flick: her finger's speed over its last moment (a quick flick can end between two frames).
    const f = g.f
    const a = g.trail[0]
    const b = g.trail[g.trail.length - 1]
    // (At least a frame long: a robot's flick can be a few milliseconds.)
    const dt = Math.max(1 / 60, b.t - a.t)
    if (b !== a) {
      f.vx = clamp(((b.x - a.x) / dt) * FLOAT.flick, -12, 12)
      f.vz = clamp(((b.z - a.z) / dt) * FLOAT.flick, -12, 12)
    }
    if (Math.hypot(f.vx, f.vz) > 0.8) {
      this.counts.drags++
      sfx.fwip()
      this.foam.emit(f.x, 0.02, f.z, f.vx * 0.3, 0, f.vz * 0.3, 1, f.r * 1.2)
    }
  }

  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.counts.taps++
    if (this.section === 'pick') {
      const pole = id === 'north' || id === 'south' ? id : this.pickAt(x, y)
      if (pole && !this.picked) this.pick(pole)
      return
    }
    if (id?.startsWith('crack')) {
      const f = this.looseBits()[+id.slice(5)]
      if (f) this.tapCrack(f)
      return
    }
    if (id === 'giant') {
      if (this.giant?.state === 'stuck' && this.section === 'giant') this.tapCrack(this.giant)
      return
    }
    if (id === 'friend') return this.pokeFriends()
    if (id === 'seal') {
      this.seal?.spin()
      tone(320, 200, 0.14, 0.12, 'square')
      tone(300, 180, 0.16, 0.12, 'square', 0.18)
      this.counts.pokes++
      this.events.moment('seal')
      return
    }
    if (id === 'orca') {
      if (this.orcaRoll < 0) this.orcaRoll = 0
      tone(1800, 2600, 0.25, 0.08, 'sine')
      tone(2400, 1500, 0.3, 0.08, 'sine', 0.25)
      this.counts.pokes++
      this.events.moment('orca')
      return
    }
    // A stuck chunk (missed its target), a floating one, the face, or the water.
    const stuck = this.floaterAt(x, y, true)
    if (stuck && (stuck.kind === 'bit' || this.section === 'giant')) return this.tapCrack(stuck)
    const f = id === 'berg' ? this.giant : this.floaterAt(x, y, false)
    if (f && (f.state === 'float' || f.state === 'away')) {
      // Poke it under: it bobs back up, fizzing. Out at sea (sail), a tap also pushes it away from the cliff.
      f.vy -= f === this.giant ? 1.4 : 2
      this.fizz(f)
      this.counts.pokes++
      if (this.sailT >= 0 && f.state === 'float') {
        f.vz += f === this.giant ? 2.6 : 3.4
        f.vx += f.x * 0.06
        sfx.fwip()
      }
      if (f === this.giant && this.underT >= 0) {
        this.pushes++
        this.releasedT = 0
        this.events.moment('push')
      }
      return
    }
    const wall = this.hitWall(x, y)
    if (wall) {
      // A puff of snow off the face (a scar glows blue).
      const scar = this.scars.find((m) => m.visible && Math.abs(m.position.x - wall.x) < m.scale.x / 2 && Math.abs(m.position.y - wall.y) < m.scale.y / 2)
      if (scar) {
        this.scarMat.color.set(CRACK_GLOW)
        sounds.note(6)
        this.events.moment('blue')
        window.setTimeout(() => this.scarMat.color.set(SCAR), 500)
      } else {
        this.spray.burst(wall.x, wall.y, 0.3, 8, 1, 1.2, 0.1)
        noise(0.08, 0.1, 'bandpass', 2000, 900, 0, 2)
      }
      this.counts.pokes++
      return
    }
    const hit = this.hitPlane(x, y, 0)
    if (hit) {
      this.spray.burst(hit.x, 0.1, hit.z, 10, 1.5, 3, 0.16)
      this.foam.emit(hit.x, 0.02, hit.z, 0, 0, 0, 1, 1.2)
      this.addWave(hit.x, hit.z, 0.12)
      sfx.splash()
    }
  }

  private looseBits() {
    return this.floaters.filter((f) => f.state === 'stuck' && f.kind === 'bit')
  }

  private hitWall(x: number, y: number) {
    if (this.sailT >= 0 || this.underT >= 0) return null
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    const p = this.raycaster.ray.intersectPlane(new Plane(new Vector3(0, 0, 1), 0), new Vector3())
    return p && p.y > 0 && p.y < this.shape.h ? p : null
  }

  private pickAt(x: number, y: number): Pole | null {
    for (const p of this.picks) {
      const c = this.toScreen(p.group.localToWorld(tmp.set(0, 1.2, 0)))
      if (Math.hypot(x - c.x, y - c.y) < Math.min(this.w, this.h) * 0.22) return p.pole
    }
    return null
  }

  private pick(pole: Pole) {
    this.picked = pole
    this.pickT = 0
    const p = this.picks.find((q) => q.pole === pole)!
    p.vy -= 1.2
    this.spray.burst(p.x, 0.2, 0.5, 18, 2.5, 4, 0.2)
    sfx.splash()
    sounds.sparkle()
    p.bear?.hop()
    p.bear?.wave()
    for (const q of p.penguins) q.hop()
  }

  private pokeFriends() {
    this.counts.pokes++
    this.events.moment('friends')
    this.riders.forEach((r, i) => {
      if (r.bear) {
        r.bear.hop()
        r.bear.wave()
        sfx.chirp()
      } else if (r.penguin) {
        window.setTimeout(() => r.penguin?.hop(), i * 90)
        tone(500 + i * 60, 380, 0.16, 0.08, 'square', i * 0.09)
      }
    })
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const loose = this.looseBits()
    const hint = this.stuck()
    for (const [id, el] of this.anchorEls) {
      let spot: { x: number; y: number; size: number; glow?: boolean } | null = null
      if (this.section === 'pick') {
        const p = this.picks.find((q) => q.pole === id)
        if (p && !this.picked) {
          const c = this.toScreen(p.group.localToWorld(tmp.set(0, 1, 0)))
          spot = { x: c.x, y: c.y, size: Math.max(min, Math.min(this.w, this.h) * 0.3), glow: hint }
        }
      } else if (id.startsWith('crack')) {
        const f = loose[+id.slice(5)]
        if (f && this.section === 'bits') {
          const p = this.onScreen(f)
          spot = { x: p.x, y: p.y, size: Math.max(min, p.r * 2.2), glow: hint && f === loose[0] }
        }
      } else if (id === 'giant') {
        const g = this.giant
        if (g?.state === 'stuck' && this.section === 'giant') {
          const p = this.onScreen(g)
          const c = this.toScreen(tmp.set(0, g.y + this.shape.giant.tip * 0.5, 0.5))
          spot = { x: c.x, y: c.y, size: Math.max(min, p.r * 1.6), glow: hint }
        }
      } else if (id === 'berg') {
        const g = this.giant
        if (g && (g.state === 'float' || g.state === 'away') && (this.underT >= 0 || this.sailT >= 0)) {
          const p = this.onScreen(g)
          spot = { x: p.x, y: p.y, size: Math.max(min, Math.min(p.r * 1.6, Math.min(this.w, this.h) * 0.5)), glow: hint && g.state === 'float' }
        }
      } else if (id === 'friend') {
        const r = this.riders.find((q) => !q.on) ?? this.riders[0]
        if (r && this.underT < 0) {
          const c = this.toScreen(r.obj.localToWorld(tmp.set(0, 0.5, 0)))
          spot = { x: c.x, y: c.y, size: min }
        }
      } else if (id === 'seal') {
        if (this.seal && this.underT < 0 && this.growler?.group.visible) {
          const c = this.toScreen(this.seal.root.localToWorld(tmp.set(0, 0.3, 0)))
          spot = { x: c.x, y: c.y, size: min }
        }
      } else if (id === 'orca') {
        if (this.underT >= 0 && this.rig.camera.position.y < 0) {
          const c = this.toScreen(tmp.copy(this.orca.position))
          if (c.z < 1) spot = { x: c.x, y: c.y, size: min * 1.2 }
        }
      }
      const show = !!spot && spot.x > 0 && spot.x < this.w && spot.y > 0 && spot.y < this.h
      if (show && spot) {
        el.style.transform = `translate3d(${(spot.x - spot.size / 2).toFixed(1)}px, ${(spot.y - spot.size / 2).toFixed(1)}px, 0)`
        el.style.width = el.style.height = `${spot.size.toFixed(0)}px`
        // The cracks and the berg (the verb) over the friends; the friends over the seal.
        el.style.zIndex = id.startsWith('crack') || id === 'giant' || id === 'berg' ? '3' : id === 'friend' ? '2' : '1'
        const shadow = spot.glow ? '0 0 0 6px rgba(255,79,154,.55), 0 0 26px 10px rgba(255,200,61,.7)' : ''
        if (el.style.boxShadow !== shadow) el.style.boxShadow = shadow
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const g = this.giant
    return {
      section: this.section,
      pole: this.pole,
      giant: g ? g.state : null,
      under: this.underT >= 0,
      done: this.doneT >= 0,
      broken: this.broken,
      loose: this.looseBits().length,
      ...this.counts,
      // The floating ice on screen (pixels), for QA's finger.
      onScreen: this.floaters.flatMap((f) => {
        if (!f.group.visible || f.state === 'stuck' || f.state === 'fall') return []
        const p = this.onScreen(f)
        return p.z < 1 && p.x > 0 && p.x < this.w && p.y > 0 && p.y < this.h ? [{ kind: f.kind, state: f.state, x: Math.round(p.x), y: Math.round(p.y) }] : []
      }),
    }
  }

  memory() {
    return { ...this.renderer.info.memory }
  }

  dispose() {
    this.unwatch()
    this.scene.clear()
    this.bag.dispose()
  }
}

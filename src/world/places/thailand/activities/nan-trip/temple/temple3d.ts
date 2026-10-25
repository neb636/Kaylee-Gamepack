// Wat Phumin (plan: planning/around-the-world/thailand/nan-temple.md), in shapes and sounds (the greybox: no voices).
// One world: the courtyard outside the east door, and the cross-shaped hall with its murals and four golden Buddhas.
//
// Arriving (round 1 starts here): at the foot of the naga stairs three pairs of shoes lie in front of the family; each
// tap pops the next pair onto the rack. Then the east door opens, everyone hops up the stairs and walks in, the hall
// goes dim and the lantern lights up over Kaylee's head.
//
// The toy, one verb all the way through: her finger is the lantern's glow. Held anywhere on the hall, the lantern
// floats there on its string (a hand's width off a wall, above the floor, in front of a Buddha) and Kaylee trots along
// under it. Where its pool of light falls on a mural, the painting wakes (murals.ts). Holding it near the screen's side
// turns the view to the next panel round the hall (the camera glides round the Buddhas).
//   1: wake any 8 of the 13 scenes. Awake scenes go on moving; a tap pokes one (the elephant trumpets, the boats race
//      off along the river round the whole hall, the birds fly along the walls); lit three more times, they dance.
//   2: find the whispering lovers: a whisper, louder the nearer the lantern (hearts leak out when it's close). Lit,
//      they giggle and fly off as a heart to the next spot; the third spot is home, where he whispers in her ear and
//      hearts float up out of the wall.
//   3: the four Buddhas, east, south, west, north: the door opens and light floods in, her lantern on the Buddha and it
//      glows, Kaylee does a wai on the mat, the candle lights, the bell rings. After the fourth the whole hall wakes and
//      turns gold, then the family stands under the lovers for Mommy's photo, which goes on the wall under them.
// Silly instead of wrong: light Daddy and a painted Daddy appears in the mural, waving. Things to poke: the shoes, the
// nagas (they blink), the pigeons, the bells, the lovers' statues, the doors (light through the crack), the Buddhas (they
// glow; sacred things never wobble), Daddy, Mommy, Kaylee, and every awake scene.
import { BufferAttribute, BufferGeometry, Color, DoubleSide, Frustum, Group, IcosahedronGeometry, Matrix4, Mesh, MeshBasicMaterial, OctahedronGeometry, PlaneGeometry, Raycaster, Texture, TorusGeometry, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { bell as bellCurve, clamp } from '../../../../../../sdk'
import type { Avatar } from '../../../characters/avatar'
import type { Member } from '../../../characters/member'
import type { XZ } from '../../../engine/nav'
import type { AnchorInfo } from '../../../engine/Anchors'
import type { Shot } from '../../../engine/camera'
import { merge, P, solid } from '../../../engine/geo'
import { photoCamera, snapPhoto } from '../../../engine/photo'
import { PAL } from '../../../engine/toon'
import { TUNE } from '../../../engine/tune'
import { Stage, type AnchorSpot, type LegEvents, type Pose3 } from '../../../trip/legs/stage'
import { Floaters } from '../mushrooms/fx'
import { buildHall, buildLantern, buildPigeon, glowSprite, type Hall, type Lantern, type Pigeon } from './hall'
import {
  AWAKE_SEED,
  BAND0,
  BAND_H,
  BUDDHA_LIT_S,
  BUDDHAS,
  C,
  DADDY_OFF,
  DANCE_AFTER,
  DOOR_AT,
  EDGE,
  EDGE_EVERY,
  EDGE_S,
  FAMILY_OUT,
  FIND_S,
  GROUND,
  inHall,
  KAYLEE_OFF,
  LANTERN_OFF,
  LANTERN_Y,
  LOOP,
  LOVER_SPOTS,
  MAT_OUT,
  MOMMY_AT,
  onPanel,
  PANEL_W,
  PANELS,
  PIGEONS_IN,
  PIGEONS_OUT,
  POOL_REACH,
  RING,
  SCENES,
  SHOES,
  STAIRS,
  STATUES,
  TROT,
  WAKE_GOAL,
  WAKE_S,
  WALL_H,
  type Panel,
  type Round,
  type Scene,
  type V3,
} from './layout'
import type { LoversLook, SceneLook, Traveller } from './murals'
import { templeSfx as sfx } from './sounds'

export interface TempleEvents extends LegEvents {
  /** A new round began (the address bar follows). */
  round(r: Round): void
  /** Mommy took the photo under the lovers. */
  photo(src: string): void
  /** The photo's on the wall: the end card. */
  allDone(): void
}

export const TEMPLE_ANCHORS: AnchorInfo[] = [
  ...SHOES.map((_, k): AnchorInfo => ({ id: `shoe:${k}`, label: ['Kaylee’s shoes', 'Daddy’s shoes', 'Mommy’s shoes'][k], kind: 'thing' })),
  { id: 'rack', label: 'Shoe rack', kind: 'thing' },
  { id: 'naga:0', label: 'Naga', kind: 'thing' },
  { id: 'naga:1', label: 'Naga', kind: 'thing' },
  { id: 'bell', label: 'Temple bell', kind: 'thing' },
  { id: 'statues', label: 'The whispering lovers statue', kind: 'thing' },
  ...[...PIGEONS_OUT, ...PIGEONS_IN].map((_, k): AnchorInfo => ({ id: `pigeon:${k}`, label: 'Pigeon', kind: 'thing' })),
  ...BUDDHAS.map((b, k): AnchorInfo => ({ id: `buddha:${k}`, label: `Golden Buddha (${b.name})`, kind: 'thing' })),
  ...BUDDHAS.map((b, k): AnchorInfo => ({ id: `altarbell:${k}`, label: `Bell (${b.name})`, kind: 'thing' })),
  ...BUDDHAS.map((b, k): AnchorInfo => ({ id: `door:${k}`, label: `Door (${b.name})`, kind: 'thing' })),
  { id: 'family:kaylee', label: 'Kaylee', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
]

type Phase = 'arrive' | 'enter' | 'hall' | 'buddha' | 'gold' | 'photo' | 'done'
type View = 'arrive' | 'enter' | 'panel' | 'buddha' | 'gold' | 'photo'

interface SceneState extends SceneLook {
  sc: Scene
  /** Wake progress (0..1) while the light's on it asleep; whether the light's on it now; times lit again awake. */
  prog: number
  under: boolean
  again: number
}
interface Walker {
  m: Member
  path: XZ[]
  /** What they do when they get there (and which way they face). */
  pose: Pose3
  face: number
  phase: number
}
interface Bird {
  p: Pigeon
  spots: Vector3[]
  at: number
  fly: number
  from: Vector3
  to: Vector3
  peck: number
  nextPeck: number
  inside: boolean
}

const PHOTO_PANEL = PANELS[LOVER_SPOTS[2].panel]
const tmp = new Vector3()
const tmp2 = new Vector3()
const smooth = (k: number) => k * k * (3 - 2 * k)
const deg = 180 / Math.PI
const mod = (a: number, n: number) => ((a % n) + n) % n
const STUCK_S = 5
/** The lantern's light inside, and the hall's light: dim, then gold. */
const LANTERN_LUX = 2.6
const DIM = { ambient: 0.26, sun: 0.12, color: new Color('#B3A4E6') }
const GOLDEN = { ambient: 1.05, sun: 0.7, color: new Color('#FFE6BA') }
const HUE = new Color()

export class WatPhumin extends Stage {
  private hall: Hall
  private lantern: Lantern
  private kaylee: Avatar
  private nick: Member
  private ji: Member
  private phase: Phase = 'arrive'
  private view: View = 'arrive'
  private round: Round
  private later: { t: number; f: () => void }[] = []
  private cool = new Map<string, number>()
  private ray = new Raycaster()
  private frustum = new Frustum()
  // ---- The hall ----
  private inside = 0
  private insideGoal = 0
  private gold = 0
  private goldGoal = 0
  private station = 1
  private scenes: SceneState[]
  private travellers: Traveller[] = []
  private travHome: { s: number; v: number; next: number }[] = []
  private painted = 0
  private daddyAt: number[] = PANELS.map(() => -1)
  private doors = BUDDHAS.map(() => ({ k: 0, goal: 0, knock: 1 }))
  // ---- The lantern ----
  private lit = 0
  private lpos = new Vector3()
  private lvel = new Vector3()
  private lgoal = new Vector3()
  /** Where she left it (it stays there until the view changes). */
  private parked: Vector3 | null = null
  private finger = { held: false, x: 0, y: 0, edge: 0, side: 0 }
  /** Times she's taken hold of the lantern (QA: touches counts taps). */
  private holds = 0
  private string: Mesh
  private stringPts = Array.from({ length: 16 }, () => new Vector3())
  // ---- The family ----
  private walkers: Walker[] = []
  private kTarget = new Vector3()
  private kLong = false
  private wai = -1
  private waiK = 0
  // ---- Arriving ----
  private shoesOn = SHOES.map(() => ({ moved: false, t: 1, from: new Vector3() }))
  private shoeCount = 0
  // ---- The lovers ----
  private lovers = { spot: 0, found: 0, state: 'hidden' as 'hidden' | 'asleep' | 'giggle' | 'flying' | 'whisper' | 'awake', t: 0, prog: 0, light: 0, whisperT: 1, leakT: 0 }
  private messenger: Group
  private flight = { t: 1, from: new Vector3(), to: new Vector3() }
  // ---- The Buddhas ----
  private bud = { i: 0, prog: 0, state: 'wait' as 'wait' | 'lit' | 'done', t: 0 }
  private halos = BUDDHAS.map(() => ({ k: 0, goal: 0, pulse: 0 }))
  private budDone = 0
  // ---- The photo ----
  private photoReady = false
  private photoFace = 0
  private photos = 0
  private snapAt = -1
  private photoWanted = false
  private frame: Group | null = null
  private frameK = 0
  private phone: Group
  // ---- Effects, pokes ----
  private sparkles: Floaters
  private hearts: Floaters
  private motes: Floaters
  private rings: { m: Mesh; t: number }[] = []
  private birds: Bird[] = []
  private nagaBlink = [1, 1]
  private nagaNext = [2, 3.5]
  private statueLean = 1
  private bellGlow = 1
  private hintNow: { at: Vector3; id?: string } | null = null
  private seen = new Map<string, { t: number; ok: boolean }>()

  constructor(renderer: WebGLRenderer, private ev: TempleEvents, start: { round: Round }) {
    super(renderer, ev)
    const { scene, bag } = this
    scene.background = new Color('#CFE6F5')
    this.rig.fov = 46
    this.rig.lag = 0.6
    this.hall = buildHall(bag)
    scene.add(this.hall.root)
    this.lantern = buildLantern(bag, this.hall.glowMap)
    scene.add(this.lantern.root)
    // The string, a thin ribbon from her hand to the lantern (rebuilt each frame).
    const sg = new BufferGeometry()
    sg.setAttribute('position', new BufferAttribute(new Float32Array(this.stringPts.length * 2 * 3), 3))
    const idx: number[] = []
    for (let i = 0; i < this.stringPts.length - 1; i++) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2)
    sg.setIndex(idx)
    this.string = new Mesh(bag.add(sg), bag.add(new MeshBasicMaterial({ color: PAL.ink, side: DoubleSide })))
    this.string.frustumCulled = false
    scene.add(this.string)
    // ---- The family ----
    const { kaylee, members } = this.makeFamily(['ji', 'nick'])
    this.kaylee = kaylee
    this.nick = members.get('nick')!
    this.ji = members.get('ji')!
    scene.add(kaylee.root, this.nick.root, this.ji.root)
    this.nick.root.userData.pick = 'family:nick'
    this.ji.root.userData.pick = 'family:ji'
    this.kaylee.pace = TROT / TUNE.walkSpeed
    this.phone = solid(merge([P.rbox(0.09, 0.15, 0.015, 0.012, PAL.hotpink, {}), P.box(0.075, 0.12, 0.004, '#3A3350', { at: [0, 0, -0.009] })]), bag, 1)
    this.phone.visible = false
    this.ji.rig.armR.add(this.phone)
    this.phone.position.set(0.02, -0.26, 0.08)
    this.walkers = [this.nick, this.ji].map((m) => ({ m, path: [], pose: 'stand', face: 0, phase: 0 }))
    // ---- The murals' scenes and their travellers (boats on the river, birds in the trees) ----
    this.scenes = SCENES.map((sc) => ({ sc, awake: false, light: 0, t: 0, dance: 0, poke: 99, prog: 0, under: false, again: 0 }))
    const travel = (sceneId: string, kind: 'boat' | 'bird', u: number, v: number, color: string, rowers = 0) => {
      const i = SCENES.findIndex((s) => s.id === sceneId)
      const s = SCENES[i].panel * PANEL_W + u
      this.travellers.push({ kind, scene: i, s, v, color, rowers, awake: false, go: -1, dance: 0, phase: Math.random() * 6 })
      this.travHome.push({ s, v, next: 3 + Math.random() * 5 })
    }
    travel('boats-a', 'boat', 0.45, 0.16, '#C8506A', 4)
    travel('boats-a', 'boat', 1.15, 0.18, '#E8B84A', 3)
    travel('boats-b', 'boat', 0.5, 0.17, '#4F8FA8', 4)
    travel('boats-b', 'boat', 1.2, 0.16, '#7E5AA8', 3)
    for (const id of ['birds-a', 'birds-b']) {
      const sc = SCENES.find((s) => s.id === id)!
      const cx = (sc.u0 + sc.u1) / 2
      ;[[-0.3, 1.0, '#FF8FB8'], [0.05, 1.22, '#8FE3C8'], [0.32, 0.98, '#FBE27A']].forEach(([du, dv, c]) => travel(id, 'bird', cx + (du as number), sc.v0 + (dv as number), c as string))
    }
    // ---- The messenger heart (the lovers flying off), the effects ----
    this.messenger = new Group()
    this.messenger.add(solid(merge(heartParts('#FF6FAE')), bag, 2))
    const mg = glowSprite(this.hall.glowMap, '#FF8FB8', bag, 0.8)
    mg.scale.setScalar(0.9)
    this.messenger.add(mg)
    this.messenger.scale.setScalar(0.32)
    this.messenger.visible = false
    scene.add(this.messenger)
    this.sparkles = new Floaters(new OctahedronGeometry(0.5), [PAL.gold, PAL.hotpink, '#FFFFFF', PAL.mint], 200, bag, 1.0, 1.2)
    this.hearts = new Floaters(merge(heartParts('#FFFFFF')), ['#FF6FAE', '#FF8FB8', '#FFB3CF'], 80, bag, -0.4, 1.0)
    this.motes = new Floaters(new IcosahedronGeometry(0.5, 0), ['#FFD36A', '#FFF1C2', '#F2C14E'], 160, bag, -0.05, 0.6)
    for (const f of [this.sparkles, this.hearts, this.motes]) scene.add(f.mesh)
    for (let k = 0; k < 4; k++) {
      const m = new Mesh(bag.add(new TorusGeometry(1, 0.03, 6, 32)), bag.add(new MeshBasicMaterial({ color: '#FFD36A', transparent: true, opacity: 0, depthWrite: false })))
      m.visible = false
      scene.add(m)
      this.rings.push({ m, t: 1 })
    }
    // ---- Pigeons: three in the courtyard, three that wandered into the hall ----
    const pigeon = (spots: Vector3[], at: number, inside: boolean) => {
      const p = buildPigeon(bag)
      p.root.position.copy(spots[at])
      p.root.rotation.y = Math.random() * 6
      scene.add(p.root)
      this.birds.push({ p, spots, at, fly: -1, from: new Vector3(), to: new Vector3(), peck: 1, nextPeck: Math.random() * 2, inside })
    }
    const outSpots = PIGEONS_OUT.map((v) => new Vector3(...v))
    const inSpots = PIGEONS_IN.map((s) => new Vector3(...onPanel(PANELS[s.panel], s.u, -BAND0, s.off)))
    outSpots.forEach((_, k) => pigeon(outSpots, k, false))
    inSpots.forEach((_, k) => pigeon(inSpots, k, true))

    // ---- Where the link starts ----
    this.round = start.round
    const r = start.round
    if (r === '1') {
      this.put(kaylee, ...FAMILY_OUT.kaylee, 'stand', -60)
      this.put(this.nick, ...FAMILY_OUT.nick, 'stand', -75)
      this.put(this.ji, ...FAMILY_OUT.ji, 'stand', -65)
      SHOES.forEach((s, k) => this.hall.shoes[k].position.set(...s))
      this.hall.shoes.forEach((s, k) => (s.rotation.y = [-1.0, -1.3, -1.1][k]))
      this.lantern.root.visible = this.string.visible = false
    } else {
      for (const id of AWAKE_SEED) this.wakeScene(this.scenes.find((s) => s.sc.id === id)!, true)
      this.shoesOn.forEach((s) => (s.moved = true))
      this.shoeCount = SHOES.length
      this.hall.shoes.forEach((s, k) => s.position.copy(this.hall.rackSlots[k]))
      this.inside = this.insideGoal = 1
      this.lit = 1
      this.station = 1
      const p = this.panel
      const [kx, , kz] = onPanel(p, 1.6, 0, KAYLEE_OFF)
      this.put(kaylee, kx, 0, kz, 'stand', this.faceWall(p))
      this.sitDaddy(true)
      this.put(this.ji, MOMMY_AT[0], 0, MOMMY_AT[2], 'sit', this.faceBuddha())
      if (r === '2') {
        this.phase = 'hall'
        this.view = 'panel'
        this.lovers.state = 'asleep'
      } else {
        this.lovers = { ...this.lovers, spot: 2, found: 3, state: 'awake', light: 1 }
        this.toBuddha(0, true)
      }
      this.lpos.copy(this.lanternRest())
    }
    this.kTarget.copy(kaylee.root.position)
    this.rig.setShot(this.shot(), true)
  }

  /** A wider lens on a tall screen, so a whole panel fits without backing into the Buddhas. */
  setSize(w: number, h: number, top: number) {
    this.rig.fov = w < h ? 54 : 46
    super.setSize(w, h, top)
  }

  // ---------------------------------------------------------------- helpers

  private get panel(): Panel {
    return PANELS[mod(this.station, PANELS.length)]
  }
  private faceWall(p: Panel) {
    return Math.atan2(-p.nx, -p.nz) * deg
  }
  private faceBuddha() {
    return Math.atan2(0.55 - MOMMY_AT[0], 0.2 - MOMMY_AT[2]) * deg
  }
  private after(s: number, f: () => void) {
    this.later.push({ t: this.time + s, f })
  }
  /** Once every few seconds at most (a quick run of the same thing gets one answer). */
  private talkTo(key: string, f: () => void, every = 2.5) {
    if (this.time - (this.cool.get(key) ?? -99) < every) return
    this.cool.set(key, this.time)
    f()
  }
  private setRound(r: Round) {
    this.round = r
    this.ev.round(r)
  }
  /** A walk round the dais (it keeps out on the ring) from where someone is to (x, z). */
  private ringPath(fx: number, fz: number, tx: number, tz: number): XZ[] {
    const dx = tx - fx
    const dz = tz - fz
    const l2 = dx * dx + dz * dz
    const k = l2 > 1e-6 ? clamp(-(fx * dx + fz * dz) / l2, 0, 1) : 0
    if (Math.hypot(fx + dx * k, fz + dz * k) > 2.8) return [[tx, tz]]
    const a0 = Math.atan2(fz, fx)
    let d = Math.atan2(tz, tx) - a0
    d = Math.atan2(Math.sin(d), Math.cos(d))
    const n = Math.max(1, Math.ceil(Math.abs(d) / (Math.PI / 8)))
    const pts: XZ[] = []
    for (let i = 0; i <= n; i++) pts.push([Math.cos(a0 + (d * i) / n) * RING, Math.sin(a0 + (d * i) / n) * RING])
    pts.push([tx, tz])
    return pts
  }
  private walkKaylee(x: number, z: number, long: boolean) {
    const k = this.kaylee.root.position
    this.kTarget.set(x, 0, z)
    this.kLong = long
    this.kaylee.walk(long ? this.ringPath(k.x, k.z, x, z) : [[x, z]], () => (this.kLong = false))
  }
  private walkMember(m: Member, x: number, z: number, pose: Pose3, face: number) {
    const w = this.walkers.find((v) => v.m === m)!
    const p = m.root.position
    w.path = this.ringPath(p.x, p.z, x, z)
    w.pose = pose
    w.face = face
  }
  private sitDaddy(now = false) {
    const p = this.panel
    const [x, , z] = onPanel(p, p.daddyU, 0, DADDY_OFF)
    const [mx, , mz] = onPanel(p, PANEL_W / 2, 0, 0)
    const face = Math.atan2(mx - x, mz - z) * deg
    if (now) this.put(this.nick, x, 0, z, 'sit', face)
    else this.walkMember(this.nick, x, z, 'sit', face)
  }

  // ---------------------------------------------------------------- arriving

  private moveShoe(k: number) {
    const s = this.shoesOn[k]
    if (s.moved) return
    s.moved = true
    s.t = 0
    s.from.copy(this.hall.shoes[k].position)
    this.shoeCount++
    sfx.boing()
    ;[this.kaylee, this.nick, this.ji][k].react('hop')
    if (this.shoeCount === SHOES.length) this.after(0.9, () => this.enter())
  }

  /** All shoes off: the east door opens, up the naga stairs and in. */
  private enter() {
    if (this.phase !== 'arrive') return
    this.phase = 'enter'
    this.doors[0].goal = 1
    sfx.door()
    // Inside, looking out through the open door at them coming up the stairs.
    this.after(0.9, () => {
      this.view = 'enter'
      this.rig.setShot(this.shot(), true)
    })
    const steps = (z: number) => [new Vector3(STAIRS.x1 - 0.3, GROUND + 0.55, z), new Vector3(STAIRS.x0 + 0.4, -0.15, z), new Vector3(DOOR_AT + 0.3, 0, z)]
    const hopUp = (c: Avatar | Member, z: number, delay: number, then: () => void) => {
      const [a, b, top] = steps(z)
      this.after(delay, () => this.hop(c, this.scene, a, { dur: 0.42, arc: 0.45, face: -90, done: () => this.hop(c, this.scene, b, { dur: 0.42, arc: 0.45, face: -90, done: () => this.hop(c, this.scene, top, { dur: 0.42, arc: 0.4, face: -90, done: then }) }) }))
    }
    hopUp(this.kaylee, 0.1, 0.7, () => {
      this.station = 1
      const [x, , z] = onPanel(this.panel, 1.6, 0, KAYLEE_OFF)
      this.kaylee.walk([[DOOR_AT - 1.2, 0.1], [x, z]], () => (this.kLong = false))
      this.kTarget.set(x, 0, z)
      this.kLong = true
      this.after(0.7, () => this.inHall())
    })
    hopUp(this.nick, -0.5, 1.0, () => {
      this.walkers[0].path = [[DOOR_AT - 1.2, -0.5]]
      this.after(0.2, () => this.sitDaddy())
    })
    hopUp(this.ji, 0.6, 1.3, () => {
      const w = this.walkers[1]
      w.path = [[DOOR_AT - 1.2, 0.8], [MOMMY_AT[0], MOMMY_AT[2]]]
      w.pose = 'sit'
      w.face = this.faceBuddha()
    })
  }

  /** In: the hall goes dim and the lantern lights up over her head. */
  private inHall() {
    this.phase = 'hall'
    this.view = 'panel'
    this.insideGoal = 1
    this.after(1.4, () => {
      this.doors[0].goal = 0
      sfx.knock()
    })
    this.after(0.4, () => {
      this.lantern.root.visible = this.string.visible = true
      this.lpos.copy(this.lanternRest())
      this.lit = 0
      sfx.fwoomp()
      this.sparkles.burst(this.lpos, 12, 1, 1, 0.7, 0.04)
    })
  }

  // ---------------------------------------------------------------- the murals

  private wakeScene(s: SceneState, quiet = false) {
    if (s.awake) return
    s.awake = true
    s.light = 1
    s.prog = 1
    s.t = quiet ? Math.random() * 5 : 0
    for (const tr of this.travellers) if (tr.scene === this.scenes.indexOf(s)) tr.awake = true
    if (quiet) return
    const n = this.scenes.filter((x) => x.awake).length
    sfx.wake(n - 1)
    const [x, y, z] = onPanel(PANELS[s.sc.panel], (s.sc.u0 + s.sc.u1) / 2, (s.sc.v0 + s.sc.v1) / 2, 0.15)
    this.sparkles.burst(tmp.set(x, y, z), 14, 1.2, 0.8, 0.8, 0.045)
    if (this.round === '1' && this.phase === 'hall' && n >= WAKE_GOAL && !this.cool.has('round1')) {
      this.cool.set('round1', this.time)
      this.after(1.0, () => {
        sfx.run()
        this.setRound('2')
        this.after(1.2, () => {
          this.lovers.state = 'asleep'
          this.lovers.whisperT = 0.2
        })
      })
    }
  }

  private poke(s: SceneState) {
    s.poke = 0
    const i = this.scenes.indexOf(s)
    switch (s.sc.kind) {
      case 'elephant':
      case 'procession':
        return sfx.trumpet()
      case 'boats':
        for (const tr of this.travellers) if (tr.scene === i && tr.go < 0) tr.go = 0
        return sfx.race()
      case 'birds':
        for (const tr of this.travellers) if (tr.scene === i && tr.go < 0) tr.go = 0
        return sfx.chirp()
      case 'house':
        return sfx.mew()
      case 'buffalo':
        return sfx.moo()
      default:
        return sfx.giggle()
    }
  }

  /** Where the lantern's light is on a panel: (u, v, strength), or null. */
  private poolOn(p: Panel) {
    if (!this.lantern.root.visible) return null
    const lx = this.lpos.x - p.ox
    const lz = this.lpos.z - p.oz
    const off = lx * p.nx + lz * p.nz
    const u = lx * p.rx + lz * p.rz
    if (off < 0.02 || off > POOL_REACH || u < -0.9 || u > PANEL_W + 0.9) return null
    const k = clamp(1 - (off - LANTERN_OFF) / (POOL_REACH - LANTERN_OFF), 0, 1) * this.lit * this.inside
    return k > 0.02 ? { u, v: this.lpos.y - BAND0, k } : null
  }

  private stepMurals(dt: number, t: number) {
    const pools = PANELS.map((p) => this.poolOn(p))
    const inBox = (pool: { u: number; v: number } | null, b: { u0: number; u1: number; v0: number; v1: number }, pad = 0.12) => !!pool && pool.u > b.u0 - pad && pool.u < b.u1 + pad && pool.v > b.v0 - pad && pool.v < b.v1 + pad
    for (const s of this.scenes) {
      const pool = pools[s.sc.panel]
      const under = !!pool && pool.k > 0.5 && inBox(pool, s.sc)
      if (s.awake) {
        s.t += dt
        if (under && !s.under) {
          s.again++
          if (s.again >= DANCE_AFTER) {
            s.again = 0
            s.dance = 4.5
            sfx.dance()
            for (const tr of this.travellers) if (tr.scene === this.scenes.indexOf(s)) tr.dance = 4.5
          }
        }
      } else if (this.inside > 0.5) {
        s.prog = under ? s.prog + dt / WAKE_S : Math.max(0, s.prog - dt * 0.6)
        s.light = s.prog * 0.75
        if (s.prog >= 1) this.wakeScene(s)
      }
      s.under = under
      s.dance = Math.max(0, s.dance - dt)
      s.poke += dt
    }
    // ---- Travellers: the boats paddle (and race round the hall), the birds flit from tree to tree ----
    for (const [k, tr] of this.travellers.entries()) {
      const home = this.travHome[k]
      tr.dance = Math.max(0, tr.dance - dt)
      if (tr.kind === 'boat') {
        if (tr.go >= 0) {
          tr.go += (dt * 2.6) / LOOP
          tr.s = home.s + tr.go * LOOP
          if (tr.go >= 1) {
            tr.go = -1
            tr.s = home.s
          }
        } else tr.s = home.s + (tr.awake ? Math.sin(t * 0.4 + tr.phase) * 0.12 : 0)
      } else {
        if (tr.awake && tr.go < 0 && tr.dance <= 0) {
          home.next -= dt
          if (home.next <= 0) {
            home.next = 5 + Math.random() * 6
            tr.go = 0
          }
        }
        if (tr.go >= 0) {
          tr.go += dt / 4.2
          const b = Math.sin(Math.PI * Math.min(1, tr.go))
          tr.s = home.s + b * 3.0
          tr.v = home.v + b * 0.35 + Math.sin(Math.PI * 2 * tr.go) * 0.15
          if (tr.go >= 1) {
            tr.go = -1
            tr.s = home.s
            tr.v = home.v
          }
        } else if (tr.dance > 0) {
          tr.s = home.s + Math.cos(t * 4 + tr.phase) * 0.22
          tr.v = home.v + 0.2 + Math.sin(t * 4 + tr.phase) * 0.2
        } else {
          tr.s = home.s
          tr.v = home.v
        }
      }
    }
    // ---- The lovers ----
    const L = this.lovers
    L.t += dt
    if (L.state === 'asleep') {
      const spot = LOVER_SPOTS[L.spot]
      const pool = pools[spot.panel]
      const c = this.spotCenter(L.spot)
      const near = clamp(1 - this.lpos.distanceTo(c) / 7.5, 0, 1)
      L.whisperT -= dt
      if (L.whisperT <= 0 && this.inside > 0.5) {
        L.whisperT = 2.3
        sfx.whisper(near * near)
      }
      L.leakT -= dt
      if (near > 0.62 && L.leakT <= 0) {
        L.leakT = 0.45
        this.hearts.emit(c, tmp.set((Math.random() - 0.5) * 0.3, 0.4, (Math.random() - 0.5) * 0.3), 1.4, 0.07)
      }
      const under = !!pool && pool.k > 0.5 && inBox(pool, spot, 0.1)
      L.prog = under ? L.prog + dt / FIND_S : Math.max(0, L.prog - dt)
      L.light = Math.min(0.85, L.prog)
      if (L.prog >= 1) this.foundLovers()
    } else if (L.state === 'giggle' && L.t > 1.1) {
      if (L.found < LOVER_SPOTS.length) {
        L.state = 'flying'
        this.flight.t = 0
        this.flight.from.copy(this.spotCenter(L.spot))
        this.flight.to.copy(this.spotCenter(L.spot + 1))
        this.messenger.visible = true
        sfx.flyHeart()
      }
    } else if (L.state === 'whisper') {
      if (Math.random() < dt * 9) this.hearts.emit(tmp.copy(this.spotCenter(L.spot)).add(tmp2.set((Math.random() - 0.5) * 0.6, 0.4, (Math.random() - 0.5) * 0.6)), tmp2.set((Math.random() - 0.5) * 0.3, 0.5 + Math.random() * 0.4, (Math.random() - 0.5) * 0.3), 2.2, 0.08)
      if (L.t > 3.6) {
        L.state = 'awake'
        this.setRound('3')
        this.after(0.6, () => this.toBuddha(0, false))
      }
    }
    if (L.state === 'flying') {
      const f = this.flight
      f.t = Math.min(1, f.t + dt / 2.0)
      this.messenger.position.lerpVectors(f.from, f.to, smooth(f.t))
      this.messenger.position.y += bellCurve(f.t) * 1.0
      this.messenger.rotation.y += dt * 3
      if (Math.random() < dt * 20) this.sparkles.emit(this.messenger.position, tmp.set(0, -0.2, 0), 0.6, 0.03, 1)
      if (f.t >= 1) {
        this.messenger.visible = false
        L.spot++
        L.state = 'asleep'
        L.prog = 0
        L.light = 0
        L.whisperT = 0.6
      }
    }
    if (L.state === 'awake' || L.state === 'giggle' || L.state === 'whisper') L.light = Math.min(1, L.light + dt * 3)
    // ---- Paint the panels in view (and each once at the start), 30 times a second at most ----
    this.painted -= dt
    if (this.painted > 0 && this.time > 0.2) return
    this.painted = 1 / 30
    const cam = this.rig.camera
    cam.updateMatrixWorld()
    this.frustum.setFromProjectionMatrix(new Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse))
    for (const [i, m] of this.hall.murals.entries()) {
      if (m.painted && !this.frustum.intersectsObject(m.mesh)) continue
      const spot = LOVER_SPOTS[L.spot]
      const lovers: LoversLook | null = spot.panel === i && L.state !== 'hidden' && L.state !== 'flying' ? { box: spot, state: L.state === 'asleep' ? 'asleep' : L.state === 'giggle' ? 'giggle' : L.state === 'whisper' ? 'whisper' : 'awake', t: L.t, light: L.light } : null
      m.paint({
        t,
        pool: pools[i],
        gold: this.gold,
        daddy: this.daddyAt[i] >= 0 ? this.time - this.daddyAt[i] : -1,
        lovers,
        scenes: this.scenes.filter((s) => s.sc.panel === i).map((s) => ({ sc: s.sc, look: s })),
        travellers: this.travellers,
      })
    }
  }

  private spotCenter(k: number) {
    const s = LOVER_SPOTS[Math.min(k, LOVER_SPOTS.length - 1)]
    return new Vector3(...onPanel(PANELS[s.panel], (s.u0 + s.u1) / 2, (s.v0 + s.v1) / 2, 0.2))
  }

  private foundLovers() {
    const L = this.lovers
    L.found++
    L.prog = 0
    L.light = 1
    L.t = 0
    const c = this.spotCenter(L.spot)
    this.sparkles.burst(c, 16, 1.3, 0.8, 0.8, 0.045)
    for (let k = 0; k < 6; k++) this.hearts.emit(c, tmp.set((Math.random() - 0.5) * 0.8, 0.6 + Math.random() * 0.5, (Math.random() - 0.5) * 0.8), 1.6, 0.09)
    if (L.found >= LOVER_SPOTS.length) {
      L.state = 'whisper'
      sfx.found()
      this.after(0.4, () => sfx.sigh())
      this.after(1.2, () => sfx.run())
    } else {
      L.state = 'giggle'
      sfx.found()
    }
  }

  // ---------------------------------------------------------------- the Buddhas, the gold hall, the photo

  private toBuddha(i: number, now: boolean) {
    this.phase = 'buddha'
    this.view = 'buddha'
    this.bud = { i, prog: 0, state: 'wait', t: 0 }
    this.parked = null
    const b = BUDDHAS[i]
    if (now) {
      this.doors[i].goal = this.doors[i].k = 1
      this.put(this.kaylee, b.dx * MAT_OUT, 0, b.dz * MAT_OUT, 'stand', Math.atan2(-b.dx, -b.dz) * deg)
      this.kTarget.copy(this.kaylee.root.position)
    } else {
      this.after(0.5, () => {
        this.doors[i].goal = 1
        sfx.door()
      })
      this.walkKaylee(b.dx * MAT_OUT, b.dz * MAT_OUT, true)
    }
  }

  private stepBuddha(dt: number) {
    const B = this.bud
    const b = BUDDHAS[B.i]
    const face = this.hall.buddhas[B.i].face
    B.t += dt
    if (B.state === 'wait') {
      const on = this.lpos.distanceTo(face) < 1.0 && this.lantern.root.visible
      B.prog = on ? B.prog + dt / BUDDHA_LIT_S : Math.max(0, B.prog - dt)
      if (B.prog >= 1) {
        B.state = 'lit'
        B.t = 0
        this.halos[B.i].goal = 1
        sfx.glow()
        this.sparkles.burst(face, 18, 1.2, 0.6, 0.9, 0.045, 0)
      }
    } else if (B.state === 'lit') {
      // Kaylee on her mat, facing the Buddha: the wai, the candle, the bell.
      const k = this.kaylee.root.position
      const onMat = !this.kaylee.walking && Math.hypot(k.x - b.dx * MAT_OUT, k.z - b.dz * MAT_OUT) < 0.4
      if (this.wai < 0 && onMat) {
        this.wai = 0
        this.kaylee.face(Math.atan2(-b.dx, -b.dz))
        this.kaylee.setPose('wai')
      }
      if (this.wai >= 0) {
        const w0 = this.wai
        this.wai += dt
        const al = this.hall.altars[B.i]
        if (w0 < 0.8 && this.wai >= 0.8) {
          al.flame.visible = true
          sfx.candle()
          this.sparkles.burst(al.flame.getWorldPosition(tmp), 8, 0.6, 0.6, 0.5, 0.03, 0)
        }
        if (w0 < 1.5 && this.wai >= 1.5) {
          sfx.ding(B.i)
          this.ringAt(al.bellAt, 0)
        }
        if (w0 < 2.8 && this.wai >= 2.8) this.kaylee.setPose('stand')
        if (this.wai >= 3.4) {
          this.wai = -1
          B.state = 'done'
          this.budDone++
          if (B.i < BUDDHAS.length - 1) this.toBuddha(B.i + 1, false)
          else this.toGold()
        }
      }
    }
  }

  private toGold() {
    this.phase = 'gold'
    this.view = 'gold'
    this.parked = null
    this.goldGoal = 1
    for (const d of this.doors) d.goal = 1
    sfx.gold()
    const sleeping = this.scenes.filter((s) => !s.awake)
    sleeping.forEach((s, k) => this.after(0.3 + k * 0.2, () => this.wakeScene(s)))
    this.lovers.state = 'awake'
    this.halos.forEach((h) => (h.goal = 1))
    this.altarsLit()
    this.after(6.5, () => this.toPhoto())
  }
  private altarsLit() {
    for (const a of this.hall.altars) a.flame.visible = true
  }

  private toPhoto() {
    this.phase = 'photo'
    this.view = 'photo'
    const p = PHOTO_PANEL
    const face = this.faceWall(p) + 180
    const at = (u: number) => onPanel(p, u, 0, 0.8)
    const [kx, , kz] = at(0.95)
    this.walkKaylee(kx, kz, true)
    const [nx, , nz] = at(0.35)
    this.walkMember(this.nick, nx, nz, 'stand', face)
    const [jx, , jz] = at(1.6)
    this.walkMember(this.ji, jx, jz, 'stand', face)
    this.photoFace = face
  }

  /** Everyone's there: Mommy holds up her phone (it glows) for the photo. */
  private readyForPhoto() {
    if (this.photoReady || this.photos || this.kaylee.walking || this.walkers.some((w) => w.path.length)) return
    this.photoReady = true
    this.phone.visible = true
    this.kaylee.face(this.photoFace / deg)
  }

  private takePhoto() {
    if (!this.photoReady || this.snapAt > 0 || this.photos) return
    this.photoReady = false
    this.snapAt = this.time + 0.35
    sfx.shutter()
  }

  render() {
    if (this.photoWanted) {
      this.photoWanted = false
      const p = PHOTO_PANEL
      const from = onPanel(p, 0.95, 0.85, 3.7)
      const to = onPanel(p, 0.95, 0.65, 0)
      const cam = photoCamera(46, from[0], from[1], from[2], to[0], to[1], to[2])
      const src = snapPhoto(this.renderer, this.scene, cam)
      this.photos++
      this.ev.photo(src)
      this.hangPhoto(src)
    }
    super.render()
  }

  /** The print goes on the wall under the lovers, and everyone steps back to look. */
  private hangPhoto(src: string) {
    const p = PHOTO_PANEL
    const img = new Image()
    const tex = this.bag.add(new Texture(img))
    img.onload = () => (tex.needsUpdate = true)
    img.src = src
    const g = new Group()
    g.add(solid(merge([P.rbox(0.74, 0.58, 0.04, 0.02, PAL.gold, {})]), this.bag, 2))
    const pic = new Mesh(this.bag.add(new PlaneGeometry(0.64, 0.48)), this.bag.add(new MeshBasicMaterial({ map: tex })))
    pic.position.z = 0.025
    g.add(pic)
    const [x, y, z] = onPanel(p, 0.95, 0.62, 0.05)
    g.position.set(x, y, z)
    g.rotation.y = Math.atan2(p.nx, p.nz)
    g.scale.setScalar(0.01)
    this.scene.add(g)
    this.frame = g
    this.frameK = 0
    this.phone.visible = false
    const step = (u: number, m: Member | null) => {
      const [sx, , sz] = onPanel(p, u, 0, 1.9)
      if (m) this.walkMember(m, sx, sz, 'stand', this.faceWall(p))
      else this.walkKaylee(sx, sz, false)
    }
    this.after(0.5, () => {
      step(0.2, this.nick)
      step(1.0, null)
      step(1.85, this.ji)
    })
    this.after(1.1, () => {
      this.frameK = 0.001
      sfx.magic()
    })
    this.after(3.2, () => {
      this.phase = 'done'
      this.ev.allDone()
    })
  }

  private ringAt(at: Vector3, color: number) {
    const r = this.rings.find((x) => x.t >= 1) ?? this.rings[0]
    r.t = 0
    r.m.position.copy(at)
    r.m.rotation.set(Math.PI / 2, 0, 0)
    r.m.visible = true
    ;(r.m.material as MeshBasicMaterial).color.set(color ? '#FF8FB8' : '#FFD36A')
  }

  // ---------------------------------------------------------------- the lantern

  /** Where the lantern floats when she isn't holding it: above Kaylee, toward what she's looking at. */
  private lanternRest() {
    const k = this.kaylee.root.position
    if (this.view === 'buddha') {
      const b = BUDDHAS[this.bud.i]
      // Beside her, low: she lifts it onto the Buddha herself.
      return new Vector3(k.x - b.dz * 0.55 + b.dx * 0.2, 1.4, k.z + b.dx * 0.55 + b.dz * 0.2)
    }
    if (this.view === 'panel') {
      const p = this.panel
      return new Vector3(k.x + p.nx * -0.25, 1.85, k.z + p.nz * -0.25)
    }
    if (this.view === 'photo') {
      // Up beside the lovers, out of the photo's way.
      const p = PHOTO_PANEL
      return new Vector3(...onPanel(p, 2.1, 1.7, 0.6))
    }
    return new Vector3(k.x, 1.8, k.z)
  }

  /** The finger on the screen: where the lantern goes (off the wall it lands on, above the floor, before a face). */
  private aim(x: number, y: number) {
    this.ray.setFromCamera(this.ndc(x, y), this.rig.camera)
    const hits = this.ray.intersectObjects([...this.hall.catchers, this.nick.root, this.ji.root], true)
    const h = hits.find((x) => x.object.visible)
    if (!h) return
    const p = h.point.clone()
    let o: Object3D | null = h.object
    while (o && o.userData.pick === undefined) o = o.parent
    if (o) {
      // A family member: in front of their face.
      p.add(tmp.copy(this.rig.camera.position).sub(p).normalize().multiplyScalar(0.45))
    } else {
      const n = h.face ? tmp.copy(h.face.normal).transformDirection(h.object.matrixWorld) : tmp.set(0, 0, 0)
      if (n.y > 0.7) p.y = 1.45
      else if (n.y < -0.7) p.y = WALL_H - 0.7
      else p.addScaledVector(n.setY(0).normalize(), LANTERN_OFF)
    }
    this.lgoal.copy(this.keepIn(p))
  }

  /** Kept inside the hall, out of the Buddhas, not too low or high. */
  private keepIn(p: Vector3) {
    p.y = clamp(p.y, LANTERN_Y[0], LANTERN_Y[1])
    if (!inHall(p.x, p.z, 0.25)) {
      let best = p.clone()
      let bd = Infinity
      for (const [hx, hz] of [[C - 0.25, C - 0.25], [DOOR_AT - 0.25, 1.8 - 0.25], [1.8 - 0.25, DOOR_AT - 0.25]]) {
        const q = new Vector3(clamp(p.x, -hx, hx), p.y, clamp(p.z, -hz, hz))
        const d = q.distanceToSquared(p)
        if (d < bd) {
          bd = d
          best = q
        }
      }
      p.copy(best)
    }
    const r = Math.hypot(p.x, p.z)
    if (r < 1.5 && p.y < 2.7 && r > 1e-3) {
      p.x *= 1.5 / r
      p.z *= 1.5 / r
    }
    return p
  }

  private stepLantern(dt: number, t: number) {
    const L = this.lantern
    if (!L.root.visible) return
    if (this.finger.held && (this.phase === 'hall' || this.phase === 'buddha' || this.phase === 'gold')) {
      this.aim(this.finger.x, this.finger.y)
      this.parked = this.lgoal.clone()
    } else this.lgoal.copy(this.parked ?? this.lanternRest())
    // A soft spring: it swings after her finger and sways when it stops.
    const k = 38
    const c = 8.5
    this.lvel.addScaledVector(tmp.copy(this.lgoal).sub(this.lpos), k * dt).multiplyScalar(Math.exp(-c * dt))
    this.lpos.addScaledVector(this.lvel, dt)
    this.lit = Math.min(1, this.lit + dt * 2)
    L.root.position.copy(this.lpos)
    L.root.position.y += Math.sin(t * 2.1) * 0.025
    L.body.rotation.z = clamp(-this.lvel.x * 0.12, -0.5, 0.5) + Math.sin(t * 1.7) * 0.05
    L.body.rotation.x = clamp(this.lvel.z * 0.12, -0.5, 0.5)
    const pop = Math.min(1, this.lit * 1.4)
    L.root.scale.setScalar(0.3 + 0.7 * pop + bellCurve(Math.min(1, this.lit)) * 0.15)
    L.light.intensity = LANTERN_LUX * this.inside * this.lit
    L.glow.material.opacity = 0.35 + 0.4 * this.inside
    L.glow.scale.setScalar(1.2 + Math.sin(t * 3) * 0.05)
    // ---- The string from her hand ----
    const hand = this.kaylee.rig.armR.localToWorld(tmp2.set(0.02, -0.19, 0.02))
    const knot = L.root.localToWorld(tmp.copy(L.knot))
    const dist = hand.distanceTo(knot)
    const sag = clamp(0.32 - dist * 0.08, 0.03, 0.3)
    const n = this.stringPts.length
    for (let i = 0; i < n; i++) {
      const f = i / (n - 1)
      this.stringPts[i].lerpVectors(hand, knot, f).y -= sag * 4 * f * (1 - f)
    }
    const pos = this.string.geometry.getAttribute('position') as BufferAttribute
    const cam = this.rig.camera.position
    const side = new Vector3()
    for (let i = 0; i < n; i++) {
      const a = this.stringPts[Math.max(0, i - 1)]
      const b = this.stringPts[Math.min(n - 1, i + 1)]
      side.subVectors(b, a).cross(tmp.subVectors(cam, this.stringPts[i])).normalize().multiplyScalar(0.007)
      const p = this.stringPts[i]
      pos.setXYZ(i * 2, p.x + side.x, p.y + side.y, p.z + side.z)
      pos.setXYZ(i * 2 + 1, p.x - side.x, p.y - side.y, p.z - side.z)
    }
    pos.needsUpdate = true
    // ---- Lit Daddy: a painted Daddy appears in the mural; lit Mommy waves ----
    if (this.phase !== 'hall' || !this.finger.held) return
    const head = (m: Member) => m.rig.head.localToWorld(tmp.set(0, m.rig.face.headY, 0))
    const w = this.walkers[0]
    const pi = this.panel.i
    if (!w.path.length && this.view === 'panel' && this.daddyAt[pi] < 0 && head(this.nick).distanceTo(this.lpos) < 1.0) {
      this.daddyAt[pi] = this.time
      sfx.magic()
      sfx.haha()
      this.nick.react('hop')
      const [x, y, z] = onPanel(this.panel, this.panel.cameo[0], this.panel.cameo[1], 0.15)
      this.sparkles.burst(tmp.set(x, y, z), 18, 1.3, 0.7, 0.8, 0.045)
    }
    if (head(this.ji).distanceTo(this.lpos) < 0.75) this.talkTo('ji-lit', () => this.ji.react('wave'), 3)
  }

  // ---------------------------------------------------------------- input

  protected pickRoots(): Object3D[] {
    return []
  }

  pointerDown(x?: number, y?: number) {
    super.pointerDown()
    if (x === undefined || y === undefined) return
    if (this.phase !== 'hall' && this.phase !== 'buddha' && this.phase !== 'gold') return
    this.finger.held = true
    this.holds++
    this.finger.x = x
    this.finger.y = y
    this.finger.edge = 0
    this.aim(x, y)
    this.parked = this.lgoal.clone()
  }

  pointerMove(x: number, y: number, _dx: number, _dy: number, isHeld: boolean) {
    if (!isHeld || !this.finger.held) return
    this.lastTouch = this.time
    this.finger.x = x
    this.finger.y = y
  }

  pointerUp() {
    this.finger.held = false
    this.finger.edge = 0
  }

  /** Holding the lantern at the screen's side turns to the next panel round the hall. */
  private stepEdge(dt: number) {
    if (!this.finger.held || this.view !== 'panel' || this.phase !== 'hall') return
    const f = this.finger
    const side = f.x < this.w * EDGE ? -1 : f.x > this.w * (1 - EDGE) ? 1 : 0
    if (side !== f.side) {
      f.side = side
      f.edge = 0
    }
    if (!side) return
    f.edge += dt
    if (f.edge >= EDGE_S) {
      f.edge = EDGE_S - EDGE_EVERY
      this.turn(side)
    }
  }

  private turn(side: number) {
    this.station += side
    if (!this.finger.held) this.parked = null
    sfx.whoosh(0.6)
    const p = this.panel
    const [x, , z] = onPanel(p, side > 0 ? 1.0 : 2.2, 0, KAYLEE_OFF)
    this.walkKaylee(x, z, true)
    this.sitDaddy()
  }

  protected onTap(id: string | null, x: number, y: number) {
    if (this.phase === 'photo') return this.takePhoto()
    if (id?.startsWith('shoe:')) return this.moveShoe(Number(id.slice(5)))
    if (id?.startsWith('naga:')) {
      const k = Number(id.slice(5))
      this.nagaBlink[k] = 0
      sfx.blink()
      return this.sparkles.burst(this.hall.nagas[k].head.getWorldPosition(tmp).add(tmp2.set(0.2, 0.15, 0)), 6, 0.5, 0.5, 0.5, 0.03, 0)
    }
    if (id?.startsWith('pigeon:')) return this.flyPigeon(this.birds[Number(id.slice(7))])
    if (id?.startsWith('buddha:')) {
      const k = Number(id.slice(7))
      this.halos[k].pulse = 1
      return this.talkTo(`buddha${k}`, () => sfx.ding(k), 1.2)
    }
    if (id?.startsWith('altarbell:')) {
      const k = Number(id.slice(10))
      this.ringAt(this.hall.altars[k].bellAt, 0)
      return this.talkTo(`abell${k}`, () => sfx.ding(k), 0.8)
    }
    if (id?.startsWith('door:')) {
      const d = this.doors[Number(id.slice(5))]
      if (d.k > 0.5) return sfx.glow()
      d.knock = 0
      return sfx.knock()
    }
    switch (id) {
      case 'rack': {
        const k = this.shoesOn.findIndex((s) => !s.moved)
        if (k >= 0) this.moveShoe(k)
        return
      }
      case 'bell':
        this.bellGlow = 0
        this.ringAt(this.hall.bell.getWorldPosition(tmp).add(tmp2.set(0, -0.45, 0)), 0)
        return this.talkTo('bong', () => sfx.bong(), 1.5)
      case 'statues':
        this.statueLean = 0
        sfx.whisper(0.8)
        return this.hearts.emit(tmp.set(...STATUE_TOP), tmp2.set(0, 0.6, 0), 1.6, 0.1)
      case 'family:kaylee':
        this.kaylee.react('hop')
        return sfx.boop()
      case 'family:nick':
        this.nick.react('hop')
        return this.talkTo('haha', () => sfx.haha(), 1.5)
      case 'family:ji':
        this.ji.react('wave')
        return sfx.giggle()
    }
    // A tap on the wall: the lantern's already there; an awake scene gets poked.
    if (this.phase !== 'hall' && this.phase !== 'gold' && this.phase !== 'buddha') return
    this.ray.setFromCamera(this.ndc(x, y), this.rig.camera)
    const h = this.ray.intersectObjects(this.hall.catchers, false)[0]
    const pi = h?.object.userData.panel as number | undefined
    if (pi === undefined || !h.uv) return
    const u = h.uv.x * PANEL_W
    const v = h.uv.y * BAND_H
    const s = this.scenes.find((s) => s.awake && s.sc.panel === pi && u > s.sc.u0 - 0.1 && u < s.sc.u1 + 0.1 && v > s.sc.v0 - 0.1 && v < s.sc.v1 + 0.1)
    if (s) this.poke(s)
  }

  private flyPigeon(b: Bird) {
    if (b.fly >= 0) return
    b.fly = 0
    b.from.copy(b.p.root.position)
    b.at = (b.at + 1 + Math.floor(Math.random() * (b.spots.length - 1))) % b.spots.length
    b.to.copy(b.spots[b.at]).add(tmp.set((Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.5))
    sfx.flap()
    this.after(0.3, () => sfx.coo())
  }

  // ---------------------------------------------------------------- the frame

  protected step(dt: number, t: number) {
    for (const l of this.later.filter((x) => x.t <= this.time)) {
      this.later.splice(this.later.indexOf(l), 1)
      if (!this.disposed) l.f()
    }
    // ---- The light: outdoors, the dim hall, the gold ----
    this.inside += clamp(this.insideGoal - this.inside, -dt / 1.2, dt / 1.2)
    this.gold += clamp(this.goldGoal - this.gold, -dt / 3, dt / 3)
    const amb = this.lights.ambient
    const sun = this.lights.sun
    const a = 1 - this.inside + this.inside * (DIM.ambient + (GOLDEN.ambient - DIM.ambient) * this.gold)
    const s = 1 - this.inside + this.inside * (DIM.sun + (GOLDEN.sun - DIM.sun) * this.gold)
    amb.intensity = TUNE.ambient * Math.PI * a
    sun.intensity = TUNE.sun * Math.PI * s
    amb.color.set('#FFF7F0').lerp(HUE.copy(DIM.color).lerp(GOLDEN.color, this.gold), this.inside)
    if (this.gold > 0.2 && Math.random() < dt * 30 * this.gold) this.motes.emit(tmp.set((Math.random() - 0.5) * 9, 3.6, (Math.random() - 0.5) * 9), tmp2.set(0, -0.15, 0), 5, 0.035)
    // ---- Arriving: shoes hopping onto the rack, the nagas blinking, the statues ----
    for (const [k, s] of this.shoesOn.entries()) {
      if (s.t >= 1) continue
      s.t = Math.min(1, s.t + dt / 0.55)
      const g = this.hall.shoes[k]
      g.position.lerpVectors(s.from, this.hall.rackSlots[k], smooth(s.t))
      g.position.y += bellCurve(s.t) * 0.8
      g.rotation.y += dt * 8 * (1 - s.t)
      if (s.t >= 1) {
        g.rotation.y = Math.PI / 2
        sfx.thump()
        this.sparkles.burst(g.position, 6, 0.5, 0.6, 0.5, 0.03)
      }
    }
    for (let k = 0; k < 2; k++) {
      this.nagaNext[k] -= dt
      if (this.nagaNext[k] <= 0) {
        this.nagaNext[k] = 3 + Math.random() * 4
        this.nagaBlink[k] = 0
      }
      this.nagaBlink[k] = Math.min(1, this.nagaBlink[k] + dt / 0.28)
      this.hall.nagas[k].lids.scale.y = Math.max(0.05, bellCurve(this.nagaBlink[k]))
    }
    this.statueLean = Math.min(1, this.statueLean + dt / 1.6)
    this.hall.statues.man.rotation.z = -0.15 - bellCurve(this.statueLean) * 0.25
    this.bellGlow = Math.min(1, this.bellGlow + dt / 1.2)
    // ---- The doors ----
    for (const [i, d] of this.doors.entries()) {
      d.k += clamp(d.goal - d.k, -dt / 1.1, dt / 1.1)
      d.knock = Math.min(1, d.knock + dt / 0.6)
      const e = smooth(d.k)
      const door = this.hall.doors[i]
      door.leaves[0].rotation.y = -e * 1.75
      door.leaves[1].rotation.y = e * 1.75
      door.day.visible = this.inside > 0.3 && d.k > 0.02
      ;(door.beam.material as MeshBasicMaterial).opacity = 0.42 * e * this.inside
      door.crack.visible = d.k < 0.05 && this.inside > 0.3
      door.crack.scale.x = 1 + bellCurve(d.knock) * 2
    }
    // ---- The halos ----
    for (const [i, h] of this.halos.entries()) {
      h.k += (h.goal - h.k) * Math.min(1, dt * 2.5)
      h.pulse = Math.max(0, h.pulse - dt / 1.2)
      const halo = this.hall.buddhas[i].halo
      halo.material.opacity = Math.min(1, h.k * 0.8 + h.pulse * 0.7 + this.gold * 0.3)
      halo.scale.setScalar(1.4 + Math.sin(this.time * 2 + i) * 0.05 + h.pulse * 0.3)
    }
    // Candle flames flicker.
    for (const al of this.hall.altars) if (al.flame.visible) al.flame.scale.set(1, 1 + Math.sin(t * 17 + al.bellAt.x) * 0.12, 1)
    // ---- The play ----
    this.stepEdge(dt)
    this.stepLantern(dt, t)
    this.stepFamily(dt, t)
    if (this.phase === 'buddha') this.stepBuddha(dt)
    if (this.phase === 'photo') this.readyForPhoto()
    this.stepMurals(dt, t)
    this.stepBirds(dt, t)
    for (const r of this.rings) {
      if (r.t >= 1) continue
      r.t = Math.min(1, r.t + dt / 1.0)
      r.m.scale.setScalar(0.1 + r.t * 0.8)
      ;(r.m.material as MeshBasicMaterial).opacity = 0.8 * (1 - r.t)
      r.m.visible = r.t < 1
    }
    if (this.frame && this.frameK > 0) {
      this.frameK = Math.min(1, this.frameK + dt / 0.45)
      this.frame.scale.setScalar(Math.max(0.01, this.frameK + Math.sin(this.frameK * Math.PI) * 0.25))
    }
    if (this.snapAt > 0 && this.time >= this.snapAt) {
      this.snapAt = -1
      this.photoWanted = true
    }
    for (const f of [this.sparkles, this.hearts, this.motes]) f.update(dt)
    this.hintNow = this.time - this.lastTouch > STUCK_S - 0.1 ? this.hint() : null
  }

  private stepFamily(dt: number, t: number) {
    // ---- Kaylee: under the lantern in front of the panel, on her mat at a Buddha ----
    const k = this.kaylee.root.position
    if (this.phase === 'hall' && this.view === 'panel' && !this.kLong && !this.hopping) {
      const p = this.panel
      const lu = clamp((this.lpos.x - p.ox) * p.rx + (this.lpos.z - p.oz) * p.rz, 0.55, PANEL_W - 0.45)
      const [x, , z] = onPanel(p, lu, 0, KAYLEE_OFF)
      if (Math.hypot(x - this.kTarget.x, z - this.kTarget.z) > 0.22 && Math.hypot(x - k.x, z - k.z) > 0.3) {
        this.kTarget.set(x, 0, z)
        this.kaylee.walk([[x, z]], () => this.kaylee.face(this.faceWall(p) / deg))
      }
    }
    if (this.lantern.root.visible && this.wai < 0) this.kaylee.lookAt(this.lpos.x, this.lpos.y, this.lpos.z)
    else if (this.phase === 'arrive') this.kaylee.lookAt(this.hall.shoes[0].position.x, 0, this.hall.shoes[0].position.z)
    this.kaylee.update(dt, t)
    // Her arms: up holding the string, or together for the wai.
    const r = this.kaylee.rig
    this.waiK += ((this.wai >= 0 && this.wai < 2.8 ? 1 : 0) - this.waiK) * Math.min(1, dt * 6)
    if (this.lantern.root.visible) {
      const wk = this.waiK
      r.armR.rotation.set(-0.4 * (1 - wk) - 1.65 * wk, 0, 2.2 * (1 - wk) - 0.5 * wk)
      r.armL.rotation.set(-1.65 * wk, 0, 0.5 * wk)
    }
    // ---- Daddy and Mommy: walking on the ring, sitting where they get to ----
    for (const w of this.walkers) {
      const p = w.m.root.position
      if (w.path.length) {
        const [tx, tz] = w.path[0]
        const dx = tx - p.x
        const dz = tz - p.z
        const d = Math.hypot(dx, dz)
        const move = (w.path.length > 1 ? 2.3 : 1.5) * dt
        w.phase += dt * 9
        if (d <= move) {
          w.path.shift()
          if (!w.path.length) this.put(w.m, tx, 0, tz, w.pose, w.face)
          else this.put(w.m, tx, 0, tz, 'stand', Math.atan2(dx, dz) * deg)
        } else this.put(w.m, p.x + (dx / d) * move, Math.abs(Math.sin(w.phase)) * 0.06, p.z + (dz / d) * move, 'stand', Math.atan2(dx, dz) * deg)
      }
    }
    if (this.lantern.root.visible) {
      this.nick.lookAt(this.lpos.x, this.lpos.y, this.lpos.z)
      this.ji.lookAt(this.lpos.x, this.lpos.y, this.lpos.z)
    } else {
      this.nick.lookAt(k.x, 0.8 + k.y, k.z)
      this.ji.lookAt(k.x, 0.8 + k.y, k.z)
    }
    this.nick.update(dt, t)
    this.ji.update(dt, t)
    if (this.phone.visible) {
      // Mommy's selfie: the phone held up in front of them all.
      this.ji.rig.armR.rotation.set(-2.1, 0, 0.55)
    }
  }

  private stepBirds(dt: number, t: number) {
    for (const b of this.birds) {
      const root = b.p.root
      root.visible = b.inside ? this.inside > 0.3 || this.phase !== 'arrive' : this.phase === 'arrive' || this.phase === 'enter'
      if (b.fly >= 0) {
        b.fly = Math.min(1, b.fly + dt / 1.4)
        root.position.lerpVectors(b.from, b.to, smooth(b.fly))
        root.position.y += bellCurve(b.fly) * 1.6
        root.rotation.y = Math.atan2(b.to.x - b.from.x, b.to.z - b.from.z)
        const f = Math.sin(t * 30) * 1.1
        b.p.wings[0].rotation.z = f
        b.p.wings[1].rotation.z = -f
        if (b.fly >= 1) {
          b.fly = -1
          b.p.wings[0].rotation.z = b.p.wings[1].rotation.z = 0
        }
        continue
      }
      b.nextPeck -= dt
      if (b.nextPeck <= 0) {
        b.nextPeck = 0.8 + Math.random() * 2.2
        b.peck = 0
        if (Math.random() < 0.3) root.rotation.y += (Math.random() - 0.5) * 1.6
      }
      b.peck = Math.min(1, b.peck + dt / 0.35)
      b.p.head.rotation.x = bellCurve(b.peck) * 0.9
      b.p.head.position.z = 0.1 + bellCurve(b.peck) * 0.04
      // Kaylee trotting up close: off it goes.
      if (b.inside && this.kaylee.walking && this.kaylee.root.position.distanceTo(root.position) < 0.55) this.flyPigeon(b)
    }
  }

  // ---------------------------------------------------------------- camera, tap targets, hints

  private unwrap(deg0: number) {
    return deg0 + 360 * Math.round((this.rig.yaw - deg0) / 360)
  }

  protected shot(): Shot {
    switch (this.view) {
      case 'arrive':
        return { center: new Vector3(STAIRS.x1 + 0.6, GROUND + 0.75, -0.3), half: new Vector3(2.2, 1.1, 2.0), yaw: 48, pitch: 24, minDist: 4 }
      case 'enter':
        return { center: new Vector3(DOOR_AT - 0.4, 1.25, 0), half: new Vector3(1.4, 1.35, 0.4), yaw: this.unwrap(-90), pitch: 4, minDist: 3, maxDist: 5, follow: true }
      case 'panel': {
        const p = this.panel
        const yaw = p.yaw - 360 * Math.floor(this.station / PANELS.length) + Math.sin(this.time * 0.25) * 1.2
        return { center: new Vector3(...onPanel(p, PANEL_W / 2, 1.12, 0)), half: new Vector3(1.72, 1.24, 0.2), yaw, pitch: 1, minDist: 2.4, maxDist: 6 }
      }
      case 'buddha': {
        const b = BUDDHAS[this.bud.i]
        return { center: new Vector3(b.dx * 1.7, 1.25, b.dz * 1.7), half: new Vector3(1.45, 1.15, 1.6), yaw: this.unwrap(Math.atan2(b.dx, b.dz) * deg), pitch: 9, minDist: 2, maxDist: 5.3, follow: true }
      }
      case 'gold':
        return { center: new Vector3(-0.8, 1.8, -0.8), half: new Vector3(4, 1.6, 4), yaw: this.unwrap(45), pitch: 13, minDist: 6.3, maxDist: 6.3 }
      case 'photo': {
        const p = PHOTO_PANEL
        return { center: new Vector3(...onPanel(p, 1.2, 0.5, 0.7)), half: new Vector3(1.5, 1.55, 0.6), yaw: this.unwrap(p.yaw), pitch: 5, minDist: 2.2, maxDist: 4.8, follow: true }
      }
    }
  }

  /** What the hint finger points at now (a place, or a tap target's id). */
  private hint(): { at: Vector3; id?: string } | null {
    if (this.phase === 'arrive') {
      const k = this.shoesOn.findIndex((s) => !s.moved)
      return k >= 0 ? { at: this.hall.shoes[k].position.clone().add(tmp.set(0, 0.1, 0)), id: `shoe:${k}` } : null
    }
    if (this.phase === 'photo') return this.photoReady ? { at: this.ji.rig.head.localToWorld(new Vector3(0, this.ji.rig.face.headY, 0)), id: 'family:ji' } : null
    if (this.phase === 'buddha') return this.bud.state === 'wait' ? { at: this.hall.buddhas[this.bud.i].face.clone(), id: `buddha:${this.bud.i}` } : null
    if (this.phase !== 'hall' || this.finger.held) return null
    const here = this.panel.i
    // What she's looking for: a sleeping scene (round 1), the lovers (round 2).
    const goals: { panel: number; u: number; v: number }[] =
      this.round === '2' || this.lovers.state === 'asleep'
        ? this.lovers.state === 'asleep'
          ? [{ panel: LOVER_SPOTS[this.lovers.spot].panel, u: (LOVER_SPOTS[this.lovers.spot].u0 + LOVER_SPOTS[this.lovers.spot].u1) / 2, v: (LOVER_SPOTS[this.lovers.spot].v0 + LOVER_SPOTS[this.lovers.spot].v1) / 2 }]
          : []
        : this.scenes.filter((s) => !s.awake).map((s) => ({ panel: s.sc.panel, u: (s.sc.u0 + s.sc.u1) / 2, v: (s.sc.v0 + s.sc.v1) / 2 }))
    if (!goals.length) return null
    const n = PANELS.length
    const steps = (g: { panel: number }) => {
      const f = mod(g.panel - here, n)
      return f <= n / 2 ? f : f - n
    }
    const g = goals.sort((a, b) => Math.abs(steps(a)) - Math.abs(steps(b)))[0]
    const st = steps(g)
    if (st === 0) return { at: new Vector3(...onPanel(this.panel, g.u, g.v, 0.1)) }
    return { at: new Vector3(...onPanel(this.panel, st > 0 ? PANEL_W - 0.12 : 0.12, 1.25, 0.1)) }
  }

  protected hintAt() {
    return this.hintNow?.at ?? null
  }

  /** Is this point in the hall in plain view (not behind a wall)? Checked a few times a second. */
  private inView(id: string, at: Vector3) {
    const c = this.seen.get(id)
    if (c && this.time - c.t < 0.3) return c.ok
    const cam = this.rig.camera.position
    const d = at.distanceTo(cam)
    this.ray.set(cam, tmp.copy(at).sub(cam).normalize())
    this.ray.far = d - 0.35
    const ok = this.ray.intersectObjects(this.hall.catchers, false).length === 0
    this.ray.far = Infinity
    this.seen.set(id, { t: this.time, ok })
    return ok
  }

  protected anchorAt(id: string): AnchorSpot | null {
    const idle = this.time - this.lastTouch > STUCK_S
    const hinted = idle && this.hintNow?.id === id
    const out = this.phase === 'arrive'
    const hall = !out && this.phase !== 'enter'
    if (id.startsWith('shoe:')) {
      const k = Number(id.slice(5))
      return out && !this.shoesOn[k].moved ? { at: this.hall.shoes[k].position.clone().add(tmp.set(0, 0.08, 0)), r: 0.22, prio: 3, max: 120, glow: hinted || this.shoeCount === 0 } : null
    }
    if (id.startsWith('naga:')) return out ? { at: this.hall.nagas[Number(id.slice(5))].head.getWorldPosition(new Vector3()), r: 0.35, prio: 2, max: 130 } : null
    if (id.startsWith('pigeon:')) {
      const b = this.birds[Number(id.slice(7))]
      if (!b.p.root.visible || b.fly >= 0 || (b.inside ? !hall : !out)) return null
      const at = b.p.root.position.clone().add(tmp.set(0, 0.15, 0))
      return !b.inside || this.inView(id, at) ? { at, r: 0.18, prio: 3, max: 90 } : null
    }
    if (id.startsWith('buddha:') || id.startsWith('altarbell:') || id.startsWith('door:')) {
      if (!hall) return null
      const k = Number(id.slice(id.indexOf(':') + 1))
      const b = BUDDHAS[k]
      const at = id.startsWith('buddha:') ? this.hall.buddhas[k].face.clone().add(tmp.set(0, -0.35, 0)) : id.startsWith('door:') ? new Vector3(b.dx * (DOOR_AT - 0.3), 1.3, b.dz * (DOOR_AT - 0.3)) : this.hall.altars[k].bellAt.clone()
      if (!this.inView(id, at)) return null
      if (id.startsWith('buddha:')) return { at, r: 0.5, prio: 1, max: 160, glow: hinted || (this.phase === 'buddha' && this.bud.i === k && this.bud.state === 'wait' && this.bud.t > 2.5) }
      if (id.startsWith('door:')) return { at, r: 0.55, prio: 0, max: 130 }
      return { at, r: 0.15, prio: 3, max: 90 }
    }
    switch (id) {
      case 'rack':
        return out ? { at: this.hall.rack.position.clone().add(tmp.set(0, 0.45, 0)), r: 0.5, prio: 1, max: 140 } : null
      case 'bell':
        return out ? { at: this.hall.bell.getWorldPosition(new Vector3()).add(tmp.set(0, -0.3, 0)), r: 0.3, prio: 2, max: 110 } : null
      case 'statues':
        return out ? { at: new Vector3(...STATUE_TOP).add(tmp.set(0, -0.4, 0)), r: 0.4, prio: 1, max: 120 } : null
    }
    if (id.startsWith('family:')) {
      const c = id === 'family:kaylee' ? this.kaylee : id === 'family:nick' ? this.nick : this.ji
      if (this.phase === 'enter') return null
      const at = c.rig.head.localToWorld(new Vector3(0, c.rig.face.headY, 0))
      if (hall && !this.inView(id, at)) return null
      return { at, r: c.rig.face.R * 1.1, prio: id === 'family:ji' && this.phase === 'photo' ? 3 : 0, max: 120, glow: id === 'family:ji' && this.photoReady && (hinted || this.time % 2 < 1) }
    }
    return null
  }

  private screen(world: Vector3) {
    const c = world.clone().project(this.rig.camera)
    if (c.z > 1 || Math.abs(c.x) > 1 || Math.abs(c.y) > 1) return null
    return { x: ((c.x + 1) / 2) * this.w, y: ((1 - c.y) / 2) * this.h }
  }

  qa() {
    const pt = (v: Vector3) => {
      const s = this.screen(v)
      return s ? [Math.round(s.x), Math.round(s.y)] : null
    }
    const cam = this.rig.camera.position
    /** A point on a panel, if that panel faces the camera and it's on screen. */
    const onWall = (panel: number, u: number, v: number) => {
      const p = PANELS[panel]
      const at = new Vector3(...onPanel(p, u, v, 0.05))
      if ((cam.x - at.x) * p.nx + (cam.z - at.z) * p.nz < 0.3) return null
      return this.inView(`qa:${panel}:${u.toFixed(2)}:${v.toFixed(2)}`, at) ? pt(at) : null
    }
    const L = this.lovers
    const spot = LOVER_SPOTS[Math.min(L.spot, LOVER_SPOTS.length - 1)]
    return {
      game: 'temple',
      phase: this.phase,
      round: this.round,
      view: this.view,
      station: this.panel.i,
      awake: this.scenes.filter((s) => s.awake).length,
      goal: WAKE_GOAL,
      scenes: this.scenes.map((s) => ({ id: s.sc.id, panel: s.sc.panel, awake: s.awake, dancing: s.dance > 0, at: onWall(s.sc.panel, (s.sc.u0 + s.sc.u1) / 2, (s.sc.v0 + s.sc.v1) / 2) })),
      lovers: { spot: L.spot, found: L.found, state: L.state, at: onWall(spot.panel, (spot.u0 + spot.u1) / 2, (spot.v0 + spot.v1) / 2) },
      buddhas: { at: this.bud.i, state: this.bud.state, done: this.budDone, face: this.phase === 'buddha' ? pt(this.hall.buddhas[this.bud.i].face) : null },
      doors: this.doors.map((d) => Math.round(d.k * 100) / 100),
      gold: Math.round(this.gold * 100) / 100,
      lantern: { at: this.lantern.root.visible ? pt(this.lpos) : null, held: this.finger.held },
      daddies: this.daddyAt.filter((x) => x >= 0).length,
      shoes: this.shoeCount,
      photos: this.photos,
      photoReady: this.photoReady,
      touches: this.touches,
      holds: this.holds,
      // Where a held finger turns the view (the screen's sides, halfway down).
      edges: { left: [Math.round(this.w * EDGE * 0.5), Math.round(this.h * 0.5)], right: [Math.round(this.w * (1 - EDGE * 0.5)), Math.round(this.h * 0.5)] },
      points: {
        shoes: this.hall.shoes.map((s, k) => (this.shoesOn[k].moved ? null : pt(s.position))),
        nick: pt(this.nick.rig.head.localToWorld(new Vector3(0, this.nick.rig.face.headY, 0))),
        mommy: pt(this.ji.rig.head.localToWorld(new Vector3(0, this.ji.rig.face.headY, 0))),
        kaylee: pt(this.kaylee.root.getWorldPosition(new Vector3())),
      },
    }
  }
}

/** A heart (two round lobes and a point), about a meter tall: scaled down where it's used. */
function heartParts(c: string) {
  return [P.sphere(0.32, c, { at: [-0.22, 0.12, 0] }, 12), P.sphere(0.32, c, { at: [0.22, 0.12, 0] }, 12), P.cone(0.47, 0.62, c, { at: [0, -0.3, 0], rot: [Math.PI, 0, 0] }, 14)]
}

const STATUE_TOP: V3 = [STATUES[0], STATUES[1] + 1.5, STATUES[2]]

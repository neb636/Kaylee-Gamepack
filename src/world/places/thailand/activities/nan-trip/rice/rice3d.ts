// Stop Time Cafe and Sapan's rice steps (plan: planning/around-the-world/thailand/nan-trip.md, "3. Stop Time Cafe,
// Sapan"), greybox: shapes and sounds, no voices yet. Two places in one world: the valley (the camera looks across the
// valley floor at the terraced spur; Kaylee and Daddy stand by the stream at the bottom) and the café's deck up on the
// hill, where the camera glides at the end.
//
// The toy, one verb all the way through: her finger says where the water lands.
//   1. Fill the steps: a long bamboo pipe brings the stream's water from the pool at the top. Held anywhere on the
//      steps, her finger is where the water pours (the pipe's end swings over there). A paddy fills, turns from muddy
//      to shiny sky, then spills over the notch in its front bank into the paddy below, and the next, all the way down
//      to the stream. Frogs hop in, ducks paddle. The last dry paddies glow so she finds them. All full: a run of
//      bells, and planting time.
//   2. Plant: her finger drawn across a shiny paddy pushes rice seedlings into the mud in neat rows wherever it goes
//      (plip, plip, plip); a tap plants a little patch. A paddy over half planted fills in the rest by itself and turns
//      green. All planted: the clouds roll in.
//   3. Clouds: big soft clouds sit down on the valley and hide it. Her finger takes a cloud and it rides just above it,
//      raining where her finger is (the same "water lands where my finger is"): the rain grows the rice tall and green
//      and the paddies under it overflow, and the cloud shrinks as it rains until it puffs away and the green steps show
//      again. A tap rains a little where the cloud is. All rained out: the sun, a rainbow over the valley.
//   deck: the camera glides up to the café's deck. Kaylee and Daddy on the tall stools at the railing (Dad's photo 5),
//      her pink milk and his coffee on the high table: tap the glass and she sips (a hiccup when it's empty; tap again
//      for more). Tap Mommy and she takes the photo: three beeps, the shutter, the photo pops up. Then the end card.
// Silly instead of wrong: pour (or rain) on the buffalo and it has a happy bath; on Daddy and he shakes like a dog (in
// the rain an umbrella pops open over him); on Kaylee and she giggles. Things to poke: the frogs, the ducks, the
// buffalo, the farmer's hat on its post, Sapan's houses (a rooster), the café up on the hill (its wind chime), and on
// the deck the chime, the cup, the view, Kaylee, Daddy and Mommy.
import { Color, CylinderGeometry, Group, IcosahedronGeometry, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, OctahedronGeometry, Quaternion, TorusGeometry, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp } from '../../../../../../sdk'
import type { Avatar } from '../../../characters/avatar'
import type { Member } from '../../../characters/member'
import type { AnchorInfo } from '../../../engine/Anchors'
import type { Shot } from '../../../engine/camera'
import { merge, P, solid } from '../../../engine/geo'
import { photoCamera, snapPhoto } from '../../../engine/photo'
import { PAL, toon } from '../../../engine/toon'
import { Stage, type AnchorSpot, type LegEvents } from '../../../trip/legs/stage'
import { Floaters } from '../mushrooms/fx'
import {
  BRUSH,
  BUFFALO_AT,
  BURST_S,
  CHIME,
  CLOUD_S,
  CLOUD_TAP_S,
  CLOUD_UP,
  CLOUDS,
  DECK,
  DUCKS,
  FROGS,
  HAT_POST,
  HIGH_TABLE,
  KAYLEE_AT,
  LEVELS,
  MOMMY_AT,
  NICK_AT,
  PADDIES,
  paddyAt,
  PHOTO_FROM,
  PIPE_REST,
  PLANTED_AT,
  POUR_RATE,
  RAIN_GROW,
  RAIN_R,
  ROW_GAP,
  ROWS_PER_STEP,
  SIPS,
  SPAN,
  SPOUT_BACK,
  SPOUT_UP,
  SPRING,
  SPUR,
  spurXZ,
  STOOLS,
  TALL,
  TAP_BRUSH,
  TOP,
  VILLAGE,
  WATER_Y,
  type Paddy,
  type Round,
} from './layout'
import { riceSfx as sfx } from './sounds'
import { buildDeck, buildValley, type Deck, type PaddyParts, type Valley } from './valley'

export interface RiceEvents extends LegEvents {
  /** A new round began (the address bar follows). */
  round(r: Round): void
  /** Mommy took the photo on the deck. */
  photo(src: string): void
  /** The photo's taken: the end card. */
  allDone(): void
}

export const RICE_ANCHORS: AnchorInfo[] = [
  ...PADDIES.map((p): AnchorInfo => ({ id: `paddy:${p.i}`, label: `Rice paddy ${p.i + 1}`, kind: 'thing' })),
  ...CLOUDS.map((_, i): AnchorInfo => ({ id: `cloud:${i}`, label: `Cloud ${i + 1}`, kind: 'thing' })),
  ...Array.from({ length: FROGS }, (_, i): AnchorInfo => ({ id: `frog:${i}`, label: 'Frog', kind: 'thing' })),
  ...Array.from({ length: DUCKS }, (_, i): AnchorInfo => ({ id: `duck:${i}`, label: 'Duck', kind: 'thing' })),
  { id: 'buffalo', label: 'Water buffalo', kind: 'thing' },
  { id: 'hat', label: "Farmer's hat", kind: 'thing' },
  { id: 'village', label: 'Sapan village', kind: 'thing' },
  { id: 'cafe', label: 'Stop Time Cafe', kind: 'thing' },
  { id: 'glass', label: 'Pink milk', kind: 'thing' },
  { id: 'cup', label: "Daddy's coffee", kind: 'thing' },
  { id: 'chime', label: 'Wind chime', kind: 'thing' },
  { id: 'view', label: 'Rice steps', kind: 'thing' },
  { id: 'family:kaylee', label: 'Kaylee', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
]

type Phase = 'valley' | 'deck'
type Who = 'buffalo' | 'nick' | 'kaylee'

interface PaddyState {
  p: Paddy
  parts: PaddyParts
  water: number
  full: boolean
  /** Spilling over its notch now (eased, for the waterfall), and whether it is this frame. */
  spill: number
  spillNow: boolean
  /** 0..1, the sparkle when it fills. */
  shine: number
  /** Its seedlings (indexes into seeds), how many are in, whether it's all planted, and how tall the rice is. */
  spots: number[]
  planted: number
  done: boolean
  tall: number
}

interface Seed {
  at: Vector3
  paddy: number
  on: boolean
  /** 0..1 popping in. */
  k: number
  /** Seconds until it pops in (planted in a row, one after another). */
  wait: number
  phase: number
  shade: Color
}

interface Cloud {
  i: number
  root: Group
  home: Vector3
  pos: Vector3
  goal: Vector3
  /** Rain left in it (1 full, 0 rained out). */
  water: number
  state: 'off' | 'in' | 'sit' | 'gone'
  t: number
  rainUntil: number
  boing: number
}

interface Frog {
  root: Group
  throat: Mesh
  on: boolean
  paddy: number
  from: Vector3
  to: Vector3
  /** 0..1 a hop (1 = sitting). */
  hop: number
  croak: number
}

interface Duck {
  root: Group
  on: boolean
  paddy: number
  a: number
  dir: number
  dash: number
}

const STUCK_S = 5
const tmp = new Vector3()
const tmp2 = new Vector3()
const tmp3 = new Color()
const axis = new Vector3()
const m4 = new Matrix4()
const q = new Quaternion()
const UP = new Vector3(0, 1, 0)
const SKY = { soft: new Color('#D6E3EE'), grey: new Color('#C9C8DA'), sun: new Color('#BDE3F7') }
const MUDDY = new Color('#9C8A78')
const SHINY = new Color('#CDEBFA')
const YOUNG = new Color('#A6E383')
const GROWN = new Color('#4FAE5E')

const angleOf = (x: number, z: number) => Math.atan2(x - SPUR.x, z - SPUR.z)
const radiusOf = (x: number, z: number) => Math.hypot(x - SPUR.x, z - SPUR.z)

export class StopTimeCafe extends Stage {
  private valley: Valley
  private deck: Deck
  private kaylee: Avatar
  private nick: Member
  private ji: Member
  private phase: Phase
  private round: Round
  private paddies: PaddyState[]
  private seeds: Seed[] = []
  private seedMesh: InstancedMesh
  private clouds: Cloud[] = []
  private frogs: Frog[]
  private ducks: Duck[]
  private later: { t: number; f: () => void }[] = []
  private cool = new Map<string, number>()
  // ---- Pouring ----
  private pour = { on: false, until: -1, x: 0, y: 0, k: 0, gurgle: 0, splash: 0 }
  private pressT = 0
  private aim = { at: new Vector3(...PIPE_REST), paddy: -1, who: null as Who | null }
  private spoutAt = new Vector3(...PIPE_REST)
  private pipe: Group
  private spout: Group
  private rope: Mesh
  private ripple: Mesh
  private drops: Floaters
  private splash: Floaters
  private rain: Floaters
  private sparkles: Floaters
  private puffs: Floaters
  private fulls = 0
  private trickleT = 0
  // ---- Planting ----
  private planting: { last: Vector3 | null } | null = null
  private plips = 0
  private plipT = 0
  // ---- Clouds ----
  private held: Cloud | null = null
  private rainT = 0
  private sunny = 0
  private rainbow: Mesh
  // ---- The deck ----
  private sips = 0
  private milk = 1
  private milkShown = 1
  private photos = 0
  private snapAt = -1
  private photoWanted = false
  private phone: Group
  private doneSaid = false
  // ---- Silly and pokes ----
  private umbrella: Group
  private umbrellaK = 0
  private umbrellaShown = 0
  private bath = 1
  private buffaloLook = 1
  private hatSpin = 1
  private chimeSwing = 1
  private nickShake = 1

  constructor(renderer: WebGLRenderer, private ev: RiceEvents, start: { round: Round }) {
    super(renderer, ev)
    const { scene, bag } = this
    scene.background = SKY.soft.clone()
    this.rig.fov = 34
    this.rig.lag = 0.45
    this.valley = buildValley(bag)
    scene.add(this.valley.root)
    this.deck = buildDeck(bag)
    scene.add(this.deck.root)
    // ---- The family: Kaylee and Daddy down by the stream, Mommy waiting on the deck ----
    const { kaylee, members } = this.makeFamily(['ji', 'nick'])
    this.kaylee = kaylee
    this.nick = members.get('nick')!
    this.ji = members.get('ji')!
    for (const c of [kaylee, this.nick, this.ji]) scene.add(c.root)
    this.deck.root.add(this.ji.root)
    kaylee.root.userData.pick = 'family:kaylee'
    this.nick.root.userData.pick = 'family:nick'
    this.ji.root.userData.pick = 'family:ji'
    this.valley.frogs.forEach((f, i) => (f.root.userData.pick = `frog:${i}`))
    this.put(this.ji, 0.9, 0, -1.0, 'stand', 180)
    // Mommy's phone, for the photo (held up in front of her face once she's taking it).
    this.phone = solid(merge([P.rbox(0.09, 0.15, 0.015, 0.012, PAL.hotpink, {}), P.box(0.075, 0.12, 0.004, '#3A3350', { at: [0, 0, -0.009] })]), bag, 1)
    this.phone.position.set(0.1, this.ji.height * 0.66, 0.3)
    this.phone.visible = false
    this.ji.root.add(this.phone)
    // Daddy's umbrella (it pops open in the rain).
    this.umbrella = solid(merge([P.cone(0.52, 0.26, PAL.pink, { at: [0, 0.13, 0] }, 16), P.cyl(0.012, 0.012, 0.75, PAL.ink, { at: [0, -0.3, 0] }, 6), P.sphere(0.03, PAL.hotpink, { at: [0, 0.27, 0] }, 8)]), bag, 2)
    this.umbrella.position.set(0.12, this.nick.height + 0.35, 0.05)
    this.umbrella.scale.setScalar(0.001)
    this.umbrella.visible = false
    this.nick.root.add(this.umbrella)
    // ---- The paddies and their seedling spots ----
    this.paddies = PADDIES.map((p) => ({ p, parts: this.valley.paddies[p.i], water: 0, full: false, spill: 0, spillNow: false, shine: 1, spots: [], planted: 0, done: false, tall: 0 }))
    for (const s of this.paddies) {
      const L = LEVELS[s.p.level]
      for (let r = 0; r < ROWS_PER_STEP; r++) {
        const R = L.rIn + 0.3 + r * ROW_GAP
        const margin = 0.12 / R
        const span = s.p.a1 - s.p.a0 - 2 * margin
        const n = Math.max(2, Math.floor((span * R) / ROW_GAP))
        for (let k = 0; k < n; k++) {
          const a = s.p.a0 + margin + ((k + 0.5) * span) / n
          const [x, z] = spurXZ(R, a)
          s.spots.push(this.seeds.length)
          this.seeds.push({ at: new Vector3(x, L.y + WATER_Y, z), paddy: s.p.i, on: false, k: 0, wait: 0, phase: Math.random() * 6, shade: YOUNG.clone().offsetHSL((Math.random() - 0.5) * 0.04, 0, (Math.random() - 0.5) * 0.06) })
        }
      }
    }
    const blade = (h: number, tilt: number, turn: number) => P.cone(0.014, h, '#ffffff', { at: [Math.sin(turn) * Math.sin(tilt) * h * 0.5, h / 2, Math.cos(turn) * Math.sin(tilt) * h * 0.5], rot: [Math.cos(turn) * tilt, 0, -Math.sin(turn) * tilt] }, 5)
    this.seedMesh = new InstancedMesh(bag.add(merge([blade(0.17, 0.08, 0), blade(0.14, 0.4, 2.1), blade(0.13, 0.42, 4.2), blade(0.12, 0.35, 1.0)])), toon('#ffffff', true), this.seeds.length)
    this.seedMesh.frustumCulled = false
    this.seeds.forEach((s, i) => this.seedMesh.setColorAt(i, s.shade))
    scene.add(this.seedMesh)
    // ---- The bamboo pipe, the water running out of it, the ripple where it lands ----
    this.pipe = solid(P.cyl(0.095, 0.095, 1, '#B5D27E', { at: [0, 0.5, 0] }, 10), bag, 2)
    scene.add(this.pipe)
    this.spout = solid(merge([P.cyl(0.11, 0.11, 0.14, '#8DB35A', { at: [0, 0, 0] }, 10), P.torus(0.1, 0.022, '#7FA24E', { at: [0, -0.06, 0], rot: [Math.PI / 2, 0, 0] })]), bag, 2)
    scene.add(this.spout)
    this.rope = new Mesh(bag.add(new CylinderGeometry(0.03, 0.05, 1, 8, 1, true).translate(0, 0.5, 0)), bag.add(new MeshBasicMaterial({ color: '#CDEBFA', transparent: true, opacity: 0.8, depthWrite: false })))
    this.rope.renderOrder = 2
    this.rope.visible = false
    scene.add(this.rope)
    this.ripple = new Mesh(bag.add(new TorusGeometry(0.2, 0.015, 6, 28)), bag.add(new MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0, depthWrite: false })))
    this.ripple.rotation.x = -Math.PI / 2
    this.ripple.renderOrder = 3
    scene.add(this.ripple)
    this.drops = new Floaters(new IcosahedronGeometry(0.5, 0), ['#BFE6FA', '#E3F3FF', '#A9D8F2'], 220, bag, 9.8, 0)
    this.splash = new Floaters(new IcosahedronGeometry(0.5, 0), ['#CDEBFA', '#FFFFFF'], 90, bag, 6, 0.4)
    this.rain = new Floaters(new CylinderGeometry(0.1, 0.1, 1, 5), ['#A9D8F2', '#CDEBFA'], 260, bag, 0, 0)
    this.sparkles = new Floaters(new OctahedronGeometry(0.5), [PAL.gold, PAL.hotpink, '#FFFFFF', PAL.mint], 140, bag, 1.0, 1.2)
    this.puffs = new Floaters(new IcosahedronGeometry(0.5, 1), ['#FFFFFF', '#F2F0F8'], 70, bag, -0.4, 1.2, 0.7, 2)
    for (const f of [this.drops, this.splash, this.rain, this.sparkles, this.puffs]) scene.add(f.mesh)
    // ---- The clouds (they roll in for round 3) ----
    CLOUDS.forEach((c, i) => {
      const s = 1 + (i % 2) * 0.12
      const root = solid(merge([P.sphere(0.85 * s, '#FFFFFF', { scale: [1.7, 0.62, 0.9] }), P.sphere(0.62 * s, '#FFFFFF', { at: [0.75 * s, 0.25, 0.1], scale: [1.4, 0.8, 0.85] }), P.sphere(0.58 * s, '#FFFFFF', { at: [-0.8 * s, 0.12, 0.05], scale: [1.3, 0.75, 0.85] }), P.sphere(0.5 * s, '#F4F2FA', { at: [0.1, 0.45, -0.1], scale: [1.4, 0.8, 0.8] })]), bag, 2)
      const home = new Vector3(...c)
      const off = home.clone().add(new Vector3(i % 2 ? 13 : -13, 0.6, 0))
      root.position.copy(off)
      root.visible = false
      root.userData.pick = `cloud:${i}`
      scene.add(root)
      this.clouds.push({ i, root, home, pos: off.clone(), goal: home.clone(), water: 1, state: 'off', t: 0, rainUntil: -1, boing: 1 })
    })
    // ---- The rainbow over the valley (after the rain) ----
    const bow = merge(['#FF8FB8', '#FFE27A', '#8FE3C8', '#A8DCFF'].map((c, k) => P.torus(6.6 - k * 0.36, 0.17, c, {}, Math.PI)))
    this.rainbow = new Mesh(bag.add(bow), bag.add(new MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, depthWrite: false })))
    this.rainbow.position.set(0.6, 2.4, -16.5)
    this.rainbow.visible = false
    this.rainbow.renderOrder = -0.5
    scene.add(this.rainbow)
    // ---- The frogs and ducks ----
    this.frogs = this.valley.frogs.map((f) => ({ ...f, on: false, paddy: -1, from: new Vector3(), to: new Vector3(), hop: 1, croak: 1 }))
    this.ducks = this.valley.ducks.map((root) => ({ root, on: false, paddy: -1, a: 0, dir: 1, dash: 0 }))
    this.valley.buffalo.root.position.set(...BUFFALO_AT)
    this.valley.buffalo.root.rotation.y = -2.2

    // ---- Where the link starts ----
    this.round = start.round
    const r = start.round
    if (r !== '1') for (const s of this.paddies) this.fill(s, 1, true)
    if (r === '3' || r === 'deck') for (const s of this.paddies) this.plantAll(s, true)
    if (r === 'deck') {
      for (const s of this.paddies) s.tall = 1
      this.sunny = 1
      this.phase = 'deck'
      this.seatOnDeck(true)
    } else {
      this.phase = 'valley'
      this.put(kaylee, ...KAYLEE_AT, 'stand', 35)
      this.put(this.nick, ...NICK_AT, 'stand', -35)
      if (r === '3') this.rollIn(true)
    }
    if (r !== '1') {
      // Something living in the full paddies already.
      for (const s of this.paddies.filter((x) => x.p.level === 0)) this.addDuck(s.p.i, true)
      for (const i of [0, 4, 7]) this.addFrog(i, true)
    }
  }

  // ---------------------------------------------------------------- the water

  /** Water into a paddy (it fills, then shines). */
  private fill(s: PaddyState, w: number, quiet = false) {
    s.water = Math.min(1, w)
    if (s.water >= 1 && !s.full) {
      s.full = true
      s.shine = 0
      if (quiet) return
      sfx.shine(this.fulls++)
      this.sparkles.burst(tmp.set(...s.p.mid).add(new Vector3(0, 0.15, 0)), 10, 1.1, 1.2, 0.8, 0.07)
      if (this.fulls % 3 === 1) this.talkTo('kaylee', () => this.kaylee.react('hop'), 2)
      // Something comes to live in it: a duck on the bottom step, a frog higher up.
      if (s.p.level === 0) this.addDuck(s.p.i)
      else if (this.fulls % 2 === 0) this.addFrog(s.p.i)
      this.checkFull()
    }
  }

  private fullCount() {
    return this.paddies.filter((s) => s.full).length
  }

  private checkFull() {
    if (this.round !== '1' || this.fullCount() < this.paddies.length) return
    this.round = '2'
    this.pour.on = false
    this.pour.until = -1
    this.after(0.8, () => {
      sfx.allFull()
      this.cheer()
      for (const s of this.paddies) this.sparkles.burst(tmp.set(...s.p.mid).add(new Vector3(0, 0.2, 0)), 4, 0.9, 1.2, 0.9, 0.06)
      this.ev.round('2')
    })
  }

  /** Where the water (or the rain) lands for a finger at (x, y): the step under it (the nearest paddy if it's between
   *  steps or off the side), or someone silly to splash. */
  private landing(x: number, y: number) {
    const near = (w: Vector3, px: number) => {
      const s = this.screen(w)
      return !!s && Math.hypot(s.x - x, s.y - y) < px
    }
    const head = (c: Avatar | Member) => c.rig.head.localToWorld(new Vector3(0, c.rig.face.headY, 0))
    const b = this.valley.buffalo.root
    if (near(tmp.copy(b.position).add(new Vector3(0, 0.9, 0)), 80)) return { at: b.position.clone().add(new Vector3(0, 1.2, 0)), paddy: -1, who: 'buffalo' as Who }
    for (const [who, c] of [['nick', this.nick], ['kaylee', this.kaylee]] as const) {
      const h = head(c)
      if (near(h, 70)) return { at: h.add(new Vector3(0, 0.3, 0)), paddy: -1, who: who as Who }
    }
    const cam = this.rig.camera
    const n = this.ndc(x, y)
    const from = new Vector3(n.x, n.y, -1).unproject(cam)
    const dir = new Vector3(n.x, n.y, 1).unproject(cam).sub(from).normalize()
    let best = { d: Infinity, level: TOP, r: LEVELS[TOP].rIn + 0.5, a: 0 }
    for (const [l, L] of LEVELS.entries()) {
      if (dir.y >= -1e-4) break
      const t = (L.y - from.y) / dir.y
      if (t <= 0) continue
      const px = from.x + dir.x * t
      const pz = from.z + dir.z * t
      const r = radiusOf(px, pz)
      const a = angleOf(px, pz)
      const dr = Math.max(0, L.rIn - r, r - L.rOut)
      const da = Math.max(0, Math.abs(a) - SPAN) * r
      const d = Math.hypot(dr, da) + t * 1e-4
      if (d < best.d) best = { d, level: l, r, a }
    }
    const L = LEVELS[best.level]
    const r = clamp(best.r, L.rIn + 0.12, L.rOut - 0.12)
    const a = clamp(best.a, -SPAN + 0.15 / r, SPAN - 0.15 / r)
    const [px, pz] = spurXZ(r, a)
    return { at: new Vector3(px, L.y + WATER_Y, pz), paddy: paddyAt(best.level, a)?.i ?? -1, who: null }
  }

  private startPour(x: number, y: number) {
    this.pour.on = true
    this.pour.x = x
    this.pour.y = y
    this.pressT = this.time
    this.aim = this.landing(x, y)
  }

  /** The water this frame: in through the pipe, down from paddy to paddy, over the bottom notches into the stream. */
  private stepWater(dt: number, t: number) {
    const pouring = this.round === '1' && this.phase === 'valley' && (this.pour.on || this.time < this.pour.until)
    this.pour.k += ((pouring ? 1 : 0) - this.pour.k) * Math.min(1, dt * 10)
    const inflow = new Array<number>(this.paddies.length).fill(0)
    if (pouring && this.aim.paddy >= 0) inflow[this.aim.paddy] += POUR_RATE * dt
    for (const s of this.paddies) {
      s.spillNow = false
      if (inflow[s.p.i] <= 0) continue
      const w = s.water + inflow[s.p.i]
      if (w > 1) {
        s.spillNow = true
        if (s.p.down >= 0) inflow[s.p.down] += w - 1
      }
      this.fill(s, w)
    }
    // (The rain makes the paddies under it overflow too: stepClouds marks them.)
    for (const c of this.clouds) if (this.raining(c)) for (const s of this.under(c)) s.spillNow = true
    // ---- The pipe swings to pour where her finger is (or hangs back, resting) ----
    const goal = pouring ? tmp.copy(this.aim.at).add(new Vector3(0, SPOUT_UP, -SPOUT_BACK)) : tmp.set(...PIPE_REST)
    if (this.round === '1' && this.phase === 'valley') this.spoutAt.lerp(goal, 1 - Math.exp(-dt * 7))
    else this.spoutAt.lerp(tmp.set(PIPE_REST[0], PIPE_REST[1] + 0.25, PIPE_REST[2] - 0.6), 1 - Math.exp(-dt * 3))
    const from = tmp2.set(...SPRING).add(new Vector3(0, 0.08, 0))
    const len = from.distanceTo(this.spoutAt)
    this.pipe.position.copy(from)
    this.pipe.quaternion.setFromUnitVectors(UP, axis.copy(this.spoutAt).sub(from).normalize())
    this.pipe.scale.set(1, len, 1)
    this.spout.position.copy(this.spoutAt)
    this.spout.quaternion.copy(this.pipe.quaternion)
    // ---- The water falling out of the end ----
    this.rope.visible = this.pour.k > 0.05
    if (this.rope.visible) {
      const land = this.aim.at
      const d = land.distanceTo(this.spoutAt)
      this.rope.position.copy(this.spoutAt)
      this.rope.quaternion.setFromUnitVectors(UP, axis.copy(land).sub(this.spoutAt).normalize())
      this.rope.scale.set(this.pour.k, d * Math.min(1, this.pour.k * 1.4), this.pour.k)
    }
    if (pouring) {
      const T = 0.3
      const v = new Vector3().subVectors(this.aim.at, this.spoutAt).divideScalar(T)
      v.y += 0.5 * 9.8 * T
      for (let k = 0; k < 4; k++) this.drops.emit(this.spoutAt.clone().add(new Vector3((Math.random() - 0.5) * 0.06, 0, (Math.random() - 0.5) * 0.06)), v.clone().add(new Vector3((Math.random() - 0.5) * 0.3, 0, (Math.random() - 0.5) * 0.3)), T, 0.045 + Math.random() * 0.03)
      this.pour.gurgle -= dt
      if (this.pour.gurgle <= 0) {
        this.pour.gurgle = 0.22
        sfx.gurgle()
      }
      this.pour.splash -= dt
      if (this.pour.splash <= 0) {
        this.pour.splash = 0.07
        this.splash.burst(this.aim.at.clone().add(new Vector3(0, 0.02, 0)), 3, 0.9, 1.6, 0.45, 0.04)
      }
      if (this.aim.who) this.splashWho(this.aim.who)
    }
    const rk = (t * 1.8) % 1
    this.ripple.visible = pouring && !this.aim.who
    this.ripple.position.copy(this.aim.at).add(new Vector3(0, 0.01, 0))
    this.ripple.scale.setScalar(0.4 + rk * 2.2)
    ;(this.ripple.material as MeshBasicMaterial).opacity = 0.8 * (1 - rk)
    // ---- Each paddy: the water rises and shines, the waterfall over its notch ----
    let spilling = 0
    for (const s of this.paddies) {
      const L = LEVELS[s.p.level]
      const { water, glint, fall } = s.parts
      water.visible = s.water > 0.003
      const e = Math.pow(s.water, 0.7)
      water.position.y = L.y - 0.02 + (WATER_Y + 0.02) * e
      ;(water.material as MeshBasicMaterial).color.copy(MUDDY).lerp(SHINY, clamp((s.water - 0.2) / 0.8, 0, 1))
      s.shine = Math.min(1, s.shine + dt / 0.6)
      ;(glint.material as MeshBasicMaterial).opacity = s.full ? (0.55 + 0.25 * Math.sin(t * 2.4 + s.p.i)) * (s.tall > 0.5 ? 0.5 : 1) + 0.4 * bell(s.shine) : 0
      s.spill += ((s.spillNow ? 1 : 0) - s.spill) * Math.min(1, dt * (s.spillNow ? 10 : 2.5))
      fall.visible = s.spill > 0.02
      ;(fall.material as MeshBasicMaterial).opacity = 0.85 * s.spill
      if (s.spillNow) {
        spilling++
        if (Math.random() < dt * 10) {
          const [x, z] = spurXZ(L.rOut + 0.1, s.p.notch)
          this.splash.emit(new Vector3(x, s.p.level ? LEVELS[s.p.level - 1].y + WATER_Y : 0.02, z), new Vector3((Math.random() - 0.5) * 0.4, 0.9, 0.3), 0.4, 0.035)
        }
      }
    }
    this.trickleT -= dt
    if (spilling && this.trickleT <= 0) {
      this.trickleT = 0.35
      sfx.trickle()
    }
  }

  /** Pour or rain on someone: the buffalo's happy bath, Daddy shaking like a dog (or his umbrella in the rain), Kaylee's
   *  giggle. */
  private splashWho(who: Who, rain = false) {
    if (who === 'buffalo')
      return this.talkTo('bath', () => {
        this.bath = 0
        sfx.wet()
        this.after(0.25, () => sfx.moo())
        const b = this.valley.buffalo.root.position
        this.sparkles.burst(tmp.copy(b).add(new Vector3(0, 1.3, 0)), 12, 0.9, 1.4, 1.1, 0.07, 1)
      }, 2.2)
    if (who === 'nick') {
      if (rain) {
        if (this.umbrellaK === 0) {
          this.umbrellaK = 1
          sfx.umbrella()
          this.nick.react('hop')
          this.after(0.3, () => sfx.haha())
        }
        return
      }
      return this.talkTo('nick', () => {
        this.nickShake = 0
        this.nick.react('wiggle')
        sfx.wet()
        this.after(0.3, () => sfx.haha())
      }, 2)
    }
    this.talkTo('kaylee-wet', () => {
      this.kaylee.react('wiggle')
      sfx.giggle()
    }, 2)
  }

  // ---------------------------------------------------------------- planting

  private plantAll(s: PaddyState, now: boolean) {
    s.done = true
    let n = 0
    for (const i of s.spots) {
      const seed = this.seeds[i]
      if (seed.on) continue
      seed.on = true
      seed.k = now ? 1 : 0
      seed.wait = now ? 0 : 0.03 * n++
    }
    s.planted = s.spots.length
  }

  /** Seedlings into every free spot near `at` (on the step there), one after another. */
  private plantNear(at: Vector3, r: number) {
    let n = 0
    const level = LEVELS.findIndex((L) => Math.abs(L.y + WATER_Y - at.y) < 0.01)
    for (const s of this.paddies) {
      if (s.done || s.p.level !== level) continue
      let added = 0
      for (const i of s.spots) {
        const seed = this.seeds[i]
        if (seed.on || Math.hypot(seed.at.x - at.x, seed.at.z - at.z) > r) continue
        seed.on = true
        seed.k = 0
        seed.wait = 0.035 * n++
        added++
      }
      if (!added) continue
      s.planted += added
      if (s.planted >= s.spots.length * PLANTED_AT) {
        // Over half: the rest fill in by themselves, a wave of plips, and it's green.
        this.plantAll(s, false)
        this.after(0.35, () => {
          sfx.planted()
          this.sparkles.burst(tmp.set(...s.p.mid).add(new Vector3(0, 0.25, 0)), 10, 1, 1.2, 0.8, 0.06, 3)
          this.talkTo('kaylee', () => this.kaylee.react('hop'), 2)
          const f = this.frogs.find((x) => x.on && x.hop >= 1)
          if (f) this.frogHop(f, s.p.i)
        })
        this.checkPlanted()
      }
    }
  }

  private plantAlong(at: Vector3) {
    const p = this.planting
    if (!p) return
    const last = p.last
    if (last && Math.abs(last.y - at.y) < 0.01) {
      const d = Math.hypot(at.x - last.x, at.z - last.z)
      const n = Math.min(12, Math.ceil(d / 0.14))
      for (let k = 1; k <= n; k++) this.plantNear(last.clone().lerp(at, k / n), BRUSH)
    } else this.plantNear(at, BRUSH)
    p.last = at.clone()
  }

  private doneCount() {
    return this.paddies.filter((s) => s.done).length
  }

  private checkPlanted() {
    if (this.round !== '2' || this.doneCount() < this.paddies.length) return
    this.round = '3'
    this.planting = null
    this.after(1.0, () => {
      sfx.allFull()
      this.cheer()
    })
    this.after(2.4, () => {
      this.rollIn(false)
      this.ev.round('3')
    })
  }

  // ---------------------------------------------------------------- the clouds

  private rollIn(now: boolean) {
    this.round = '3'
    if (!now) sfx.rollIn()
    for (const c of this.clouds) {
      c.root.visible = true
      c.state = now ? 'sit' : 'in'
      c.t = now ? 1 : -c.i * 0.35
      if (now) c.pos.copy(c.home)
      c.goal.copy(c.home)
    }
  }

  private raining(c: Cloud) {
    return c.state === 'sit' && (this.held === c || this.time < c.rainUntil)
  }
  /** The paddies under a cloud's rain. */
  private under(c: Cloud) {
    const below = c.pos.clone()
    return this.paddies.filter((s) => Math.hypot(s.p.mid[0] - below.x, s.p.mid[2] - below.z) < RAIN_R + (LEVELS[s.p.level].rOut - LEVELS[s.p.level].rIn) * 0.3)
  }

  private cloudsLeft() {
    return this.clouds.filter((c) => c.state !== 'gone')
  }

  private stepClouds(dt: number, t: number) {
    let anyRain = false
    for (const c of this.clouds) {
      if (c.state === 'off' || c.state === 'gone') continue
      if (c.state === 'in') {
        c.t += dt / 2.2
        const k = clamp(c.t, 0, 1)
        const e = k * k * (3 - 2 * k)
        c.pos.lerpVectors(c.home.clone().add(new Vector3(c.i % 2 ? 13 : -13, 0.6, 0)), c.home, e)
        if (k >= 1) c.state = 'sit'
      } else if (this.held === c) c.pos.lerp(c.goal, 1 - Math.exp(-dt * 9))
      else c.pos.y += (c.home.y + Math.sin(t * 0.8 + c.i) * 0.06 - c.pos.y) * Math.min(1, dt * 0.8)
      c.boing = Math.min(1, c.boing + dt / 0.5)
      const raining = this.raining(c)
      if (raining) {
        anyRain = true
        c.water -= dt / CLOUD_S
        const s = 0.5 + 0.5 * c.water
        for (let k = 0; k < 5; k++) this.rain.emit(c.pos.clone().add(new Vector3((Math.random() - 0.5) * 2.2 * s, -0.35, (Math.random() - 0.5) * 0.9 * s)), new Vector3(0, -6, 0), (CLOUD_UP - 0.2) / 6, 0.15)
        for (const p of this.under(c)) p.tall = Math.min(1, p.tall + dt * RAIN_GROW)
        if (this.held === c && this.aim.who) this.splashWho(this.aim.who, true)
        if (c.water <= 0) this.rainedOut(c)
      }
      const s = (0.5 + 0.5 * Math.max(0, c.water)) * (1 + 0.12 * bell(c.boing))
      c.root.position.copy(c.pos)
      c.root.scale.set(s * (1 + 0.04 * Math.sin(t * 1.3 + c.i)), s * (1 - 0.1 * bell(c.boing)), s)
    }
    if (anyRain) {
      this.rainT -= dt
      if (this.rainT <= 0) {
        this.rainT = 0.24
        sfx.rain()
      }
    }
    // The sky greys while the clouds are in, and brightens with the sun.
    const want = this.sunny > 0 ? SKY.sun : this.round === '3' ? SKY.grey : SKY.soft
    ;(this.scene.background as Color).lerp(want, Math.min(1, dt * 1.5))
    // The sun out: the rice grows the rest of the way, the rainbow comes up.
    if (this.sunny > 0) {
      this.sunny = Math.min(1, this.sunny + dt / 1.6)
      for (const s of this.paddies) s.tall = Math.min(1, s.tall + dt * 0.7)
    }
    this.rainbow.visible = this.sunny > 0
    if (this.rainbow.visible) {
      ;(this.rainbow.material as MeshBasicMaterial).opacity = 0.75 * this.sunny
      this.rainbow.scale.setScalar(0.7 + 0.3 * this.sunny)
    }
  }

  private rainedOut(c: Cloud) {
    c.state = 'gone'
    c.root.visible = false
    if (this.held === c) this.held = null
    sfx.puffAway()
    this.puffs.burst(c.pos, 10, 1.2, 0.6, 1.2, 0.5)
    this.sparkles.burst(c.pos, 14, 1.4, 1.2, 1, 0.07)
    if (!this.cloudsLeft().length) this.sunOut()
  }

  private sunOut() {
    this.sunny = 0.001
    this.umbrellaK = 0
    sfx.rainbow()
    this.after(0.6, () => this.cheer())
    for (const s of this.paddies) this.after(Math.random() * 0.8, () => this.sparkles.burst(tmp.set(...s.p.mid).add(new Vector3(0, 0.35, 0)), 5, 0.8, 1.2, 0.9, 0.06))
    this.after(3.4, () => this.toDeck())
  }

  // ---------------------------------------------------------------- the deck

  private toDeck() {
    this.phase = 'deck'
    this.round = 'deck'
    this.held = null
    this.rig.lag = 0.9
    this.after(0.7, () => this.seatOnDeck(false))
    this.after(2.2, () => (this.rig.lag = 0.45))
    this.ev.round('deck')
  }

  /** Kaylee and Daddy on the tall stools at the railing, Mommy across the deck with her phone. */
  private seatOnDeck(now: boolean) {
    const d = this.deck.root
    d.add(this.kaylee.root)
    d.add(this.nick.root)
    this.put(this.kaylee, STOOLS.kaylee[0], STOOLS.kaylee[1], STOOLS.kaylee[2], 'sit', 0)
    this.put(this.nick, STOOLS.nick[0], STOOLS.nick[1], STOOLS.nick[2], 'sit', 0)
    const face = (Math.atan2(-MOMMY_AT[0], -0.95 - MOMMY_AT[2]) * 180) / Math.PI
    this.put(this.ji, MOMMY_AT[0], MOMMY_AT[1], MOMMY_AT[2], 'stand', face)
    this.umbrellaK = 0
    if (!now) {
      sfx.thump()
      this.kaylee.react('wiggle')
    }
  }

  private sip() {
    if (this.milk <= 0.01) {
      // Empty: tap again and the glass fills up.
      this.milk = 1
      sfx.pourMilk()
      this.sparkles.burst(this.deck.glass.root.getWorldPosition(new Vector3()).add(new Vector3(0, 0.25, 0)), 6, 0.5, 0.8, 0.6, 0.03, 1)
      return
    }
    this.sips++
    this.milk = Math.max(0, this.milk - 1 / SIPS)
    this.kaylee.react('wiggle')
    sfx.slurp()
    if (this.milk <= 0.01) this.after(0.6, () => {
      sfx.hiccup()
      this.kaylee.react('hop')
    })
  }

  private smile() {
    if (this.snapAt > 0) return
    this.snapAt = this.time + 1.1
    this.phone.visible = true
    sfx.countdown()
    this.ji.react('wiggle')
    this.after(0.55, () => {
      this.kaylee.react('wave')
      this.nick.react('wave')
    })
  }

  private takePhoto() {
    const d = this.deck.root
    d.updateMatrixWorld(true)
    const from = d.localToWorld(new Vector3(...PHOTO_FROM))
    const at = d.localToWorld(new Vector3(0, 0.95, -0.95))
    const cam = photoCamera(44, from.x, from.y, from.z, at.x, at.y, at.z)
    this.ji.root.visible = false
    const src = snapPhoto(this.renderer, this.scene, cam)
    this.ji.root.visible = true
    this.photos++
    sfx.shutter()
    this.ev.photo(src)
    this.after(0.4, () => this.cheer())
    if (!this.doneSaid) {
      this.doneSaid = true
      this.after(1.6, () => this.ev.allDone())
    }
  }

  render() {
    if (this.photoWanted) {
      this.photoWanted = false
      this.takePhoto()
    }
    super.render()
  }

  // ---------------------------------------------------------------- frogs and ducks

  private frogSpot(paddy: number) {
    const p = PADDIES[paddy]
    const L = LEVELS[p.level]
    const a = p.a0 + (p.a1 - p.a0) * (0.2 + Math.random() * 0.6)
    const [x, z] = spurXZ(L.rOut - 0.05, a)
    return new Vector3(x, L.y + 0.08, z)
  }
  private addFrog(paddy: number, now = false) {
    const f = this.frogs.find((x) => !x.on)
    if (!f) return
    f.on = true
    f.root.visible = true
    f.paddy = paddy
    f.to.copy(this.frogSpot(paddy))
    f.from.copy(f.to).add(new Vector3(0, 0, 0.9))
    f.hop = now ? 1 : 0
    f.root.position.copy(f.to)
    f.root.rotation.y = angleOf(f.to.x, f.to.z)
    if (!now) sfx.croak()
  }
  private frogHop(f: Frog, paddy?: number) {
    const full = this.paddies.filter((s) => s.full && s.p.i !== f.paddy)
    const to = paddy ?? full[Math.floor(Math.random() * full.length)]?.p.i ?? f.paddy
    f.from.copy(f.root.position)
    f.paddy = to
    f.to.copy(this.frogSpot(to))
    f.hop = 0
    sfx.croak()
  }
  private addDuck(paddy: number, now = false) {
    if (this.ducks.some((d) => d.on && d.paddy === paddy)) return
    const d = this.ducks.find((x) => !x.on)
    if (!d) return
    const p = PADDIES[paddy]
    d.on = true
    d.root.visible = true
    d.paddy = paddy
    d.a = (p.a0 + p.a1) / 2
    d.dir = Math.random() < 0.5 ? -1 : 1
    if (!now) {
      sfx.quack()
      this.splash.burst(tmp.set(...p.mid), 6, 0.8, 1.2, 0.5, 0.04)
    }
  }

  private stepCritters(dt: number, t: number) {
    for (const f of this.frogs) {
      if (!f.on) continue
      if (f.hop < 1) {
        f.hop = Math.min(1, f.hop + dt / 0.5)
        f.root.position.lerpVectors(f.from, f.to, f.hop).y += bell(f.hop) * 0.45
        if (f.hop >= 1) this.splash.burst(f.to, 4, 0.6, 1, 0.4, 0.03)
      }
      f.root.rotation.y = angleOf(f.root.position.x, f.root.position.z) + Math.sin(t * 0.4 + f.paddy) * 0.4
      f.croak = Math.min(1, f.croak + dt / 0.5)
      const puff = Math.max(bell(f.croak), Math.sin(t * 1.7 + f.paddy) > 0.97 ? 0.6 : 0)
      f.throat.scale.set(1 + puff * 0.8, 0.6 + puff * 0.8, 0.6 + puff * 0.8)
    }
    for (const d of this.ducks) {
      if (!d.on) continue
      const p = PADDIES[d.paddy]
      const L = LEVELS[p.level]
      const R = (L.rIn + L.rOut) / 2 + Math.sin(t * 0.5 + d.paddy) * 0.25
      const sp = (0.12 + d.dash * 0.9) / R
      d.dash = Math.max(0, d.dash - dt * 0.8)
      d.a += d.dir * sp * dt
      const m = 0.25 / R
      if (d.a > p.a1 - m) d.dir = -1
      if (d.a < p.a0 + m) d.dir = 1
      const [x, z] = spurXZ(R, d.a)
      d.root.position.set(x, L.y + WATER_Y + Math.sin(t * 3 + d.paddy) * 0.008, z)
      d.root.rotation.y = d.a + (d.dir > 0 ? Math.PI / 2 : -Math.PI / 2)
      d.root.rotation.z = Math.sin(t * 4 + d.paddy) * 0.06
    }
  }

  // ---------------------------------------------------------------- helpers

  private after(s: number, f: () => void) {
    this.later.push({ t: this.time + s, f })
  }
  /** Once every few seconds at most (a quick run of taps gets one answer). */
  private talkTo(key: string, f: () => void, every = 2.5) {
    if (this.time - (this.cool.get(key) ?? -99) < every) return
    this.cool.set(key, this.time)
    f()
  }
  private cheer() {
    for (const [k, c] of [this.kaylee, this.nick, this.ji].entries()) this.after(k * 0.12, () => c.react('hop'))
    sfx.cheer()
  }
  private screen(world: Vector3) {
    const c = world.clone().project(this.rig.camera)
    if (c.z > 1) return null
    return { x: ((c.x + 1) / 2) * this.w, y: ((1 - c.y) / 2) * this.h }
  }
  private deckAt(x: number, y: number, z: number) {
    this.deck.root.updateMatrixWorld()
    return this.deck.root.localToWorld(new Vector3(x, y, z))
  }
  private nearestCloud(x: number, y: number) {
    let best: Cloud | null = null
    let d = Infinity
    for (const c of this.clouds) {
      if (c.state !== 'sit') continue
      const s = this.screen(c.pos)
      if (!s) continue
      const dd = Math.hypot(s.x - x, s.y - y)
      if (dd < d) {
        d = dd
        best = c
      }
    }
    return best
  }

  // ---------------------------------------------------------------- touch

  /** Taps on the canvas (between the tap targets): the people's whole bodies, the critters, the deck's things. */
  protected pickRoots(): Object3D[] {
    const people = [this.kaylee.root, this.nick.root]
    if (this.phase === 'deck') return [...people, this.ji.root, this.deck.glass.root, this.deck.cup, this.deck.chime]
    return [...people, this.valley.buffalo.root, this.valley.hat, this.valley.village, ...this.frogs.filter((f) => f.on).map((f) => f.root)]
  }

  pointerDown(x?: number, y?: number, id?: string) {
    super.pointerDown()
    if (x === undefined || y === undefined || this.phase !== 'valley') return
    // A poke (a frog, the buffalo...) is a tap, not a pour.
    if (id && !id.startsWith('paddy:') && !id.startsWith('cloud:')) return
    if (this.round === '1') return this.startPour(x, y)
    if (this.round === '2') {
      this.planting = { last: null }
      this.aim = this.landing(x, y)
      if (!this.aim.who) this.plantAlong(this.aim.at)
      return
    }
    if (this.round === '3') {
      const c = id?.startsWith('cloud:') ? this.clouds[Number(id.slice(6))] : this.nearestCloud(x, y)
      if (!c || c.state !== 'sit') return
      this.held = c
      c.boing = 0
      this.aim = this.landing(x, y)
      c.goal.copy(this.aim.at).add(new Vector3(0, CLOUD_UP, 0))
    }
  }

  pointerMove(x: number, y: number, _dx: number, _dy: number, isHeld: boolean) {
    if (!isHeld || this.phase !== 'valley') return
    if (this.round === '1' && this.pour.on) {
      this.lastTouch = this.time
      this.aim = this.landing(x, y)
      return
    }
    if (this.round === '2' && this.planting) {
      this.lastTouch = this.time
      this.aim = this.landing(x, y)
      if (!this.aim.who) this.plantAlong(this.aim.at)
      return
    }
    if (this.held) {
      this.lastTouch = this.time
      this.aim = this.landing(x, y)
      this.held.goal.copy(this.aim.at).add(new Vector3(0, CLOUD_UP * (this.aim.who ? 0.7 : 1), 0))
    }
  }

  pointerUp() {
    if (this.pour.on) {
      this.pour.on = false
      this.pour.until = Math.max(this.time + 0.15, this.pressT + BURST_S)
    }
    this.planting = null
    this.held = null
  }

  protected onTap(id: string | null, x: number, y: number) {
    if (this.phase === 'deck') return this.tapDeck(id)
    if (id === null || id.startsWith('paddy:')) {
      // (The press already poured or planted there.) A tap while planting plants a little patch.
      if (this.round === '2') {
        const l = this.landing(x, y)
        if (!l.who) this.plantNear(l.at, TAP_BRUSH)
      }
      return
    }
    if (id.startsWith('cloud:')) {
      const c = this.nearestCloud(x, y) ?? this.clouds[Number(id.slice(6))]
      if (c?.state === 'sit') {
        c.rainUntil = this.time + CLOUD_TAP_S
        c.boing = 0
      }
      return
    }
    if (id.startsWith('frog:')) {
      const f = this.frogs[Number(id.slice(5))]
      f.croak = 0
      return this.frogHop(f)
    }
    if (id.startsWith('duck:')) {
      const d = this.ducks[Number(id.slice(5))]
      d.dash = 1
      d.dir = -d.dir
      sfx.quack()
      return this.splash.burst(d.root.position, 5, 0.7, 1, 0.4, 0.035)
    }
    switch (id) {
      case 'buffalo':
        this.buffaloLook = 0
        return this.talkTo('moo', () => sfx.moo(), 1.2)
      case 'hat':
        this.hatSpin = 0
        sfx.spin()
        return this.after(0.85, () => sfx.thump())
      case 'village':
        this.puffs.burst(this.valley.chimney.getWorldPosition(new Vector3()), 4, 0.3, 0.6, 1.2, 0.18)
        return this.talkTo('rooster', () => sfx.rooster(), 1.5)
      case 'cafe':
        this.chimeSwing = 0
        return sfx.windChime()
      case 'family:kaylee':
        this.kaylee.react('wiggle')
        return sfx.giggle()
      case 'family:nick':
        this.nick.react('hop')
        return sfx.haha()
    }
  }

  private tapDeck(id: string | null) {
    switch (id) {
      case 'glass':
      case 'family:kaylee':
        return this.sip()
      case 'cup':
        this.nick.react('wiggle')
        sfx.slurp()
        return this.after(0.45, () => sfx.ahh())
      case 'family:nick':
        this.nick.react('hop')
        return sfx.haha()
      case 'family:ji':
        return this.smile()
      case 'chime':
        this.chimeSwing = 0
        return sfx.windChime()
      case 'view': {
        sfx.chime()
        const f = this.frogs.find((x) => x.on)
        if (f) this.frogHop(f)
        return this.sparkles.burst(new Vector3(0, 2.4, -8), 16, 1.4, 1.2, 1.1, 0.12)
      }
    }
  }

  // ---------------------------------------------------------------- the frame

  protected step(dt: number, t: number) {
    for (const l of this.later.filter((x) => x.t <= this.time)) {
      this.later.splice(this.later.indexOf(l), 1)
      if (!this.disposed) l.f()
    }
    this.stepWater(dt, t)
    this.stepClouds(dt, t)
    this.stepCritters(dt, t)
    // ---- The seedlings: popping in, growing tall in the rain, swaying ----
    this.plipT -= dt
    for (const [i, s] of this.seeds.entries()) {
      const p = this.paddies[s.paddy]
      if (s.on && s.k < 1) {
        if (s.wait > 0) s.wait -= dt
        else {
          if (s.k === 0 && this.plipT <= 0) {
            this.plipT = 0.06
            sfx.plip(this.plips++)
          }
          s.k = Math.min(1, s.k + dt / 0.3)
        }
      }
      const pop = s.on && s.wait <= 0 ? s.k * (1 + 0.4 * bell(s.k)) : 0
      const tall = p.tall
      const sc = Math.max(0.0001, pop * (1 + tall * 1.7))
      const sway = Math.sin(t * 1.6 + s.phase) * (0.05 + tall * 0.1)
      q.setFromAxisAngle(tmp.set(Math.cos(s.phase), 0, Math.sin(s.phase)), sway)
      m4.compose(s.at, q, tmp2.set(sc, sc, sc))
      this.seedMesh.setMatrixAt(i, m4)
      if (tall > 0) this.seedMesh.setColorAt(i, tmp3.copy(s.shade).lerp(GROWN, tall))
    }
    this.seedMesh.instanceMatrix.needsUpdate = true
    if (this.seedMesh.instanceColor) this.seedMesh.instanceColor.needsUpdate = true
    // ---- The buffalo: grazing, head up when poked, a happy wiggle in its bath ----
    const bf = this.valley.buffalo
    this.buffaloLook = Math.min(1, this.buffaloLook + dt / 1.4)
    this.bath = Math.min(1, this.bath + dt / 1.6)
    bf.head.rotation.x = 0.45 + Math.sin(t * 1.1) * 0.12 - bell(this.buffaloLook) * 0.6 - bell(this.bath) * 0.4
    bf.tail.rotation.z = Math.sin(t * (this.bath < 1 ? 14 : 2.2)) * (this.bath < 1 ? 0.7 : 0.3)
    bf.root.rotation.z = Math.sin(t * 12) * 0.06 * bell(this.bath)
    bf.root.position.y = bell(this.bath) * 0.12
    // ---- The hat spins up off its post; the café's chime swings ----
    this.hatSpin = Math.min(1, this.hatSpin + dt / 0.85)
    const hat = this.valley.hat
    hat.position.y = 1.05 + bell(this.hatSpin) * 0.7
    hat.rotation.y = this.hatSpin < 1 ? this.hatSpin * Math.PI * 4 : 0
    this.chimeSwing = Math.min(1, this.chimeSwing + dt / 2.4)
    this.deck.chime.rotation.z = Math.sin(t * 6) * 0.35 * (1 - this.chimeSwing) + Math.sin(t * 1.3) * 0.04
    // ---- Daddy: a shake when he's poured on, his umbrella in the rain ----
    this.nickShake = Math.min(1, this.nickShake + dt / 0.8)
    this.nick.root.rotation.z = Math.sin(t * 30) * 0.08 * bell(this.nickShake)
    this.umbrellaShown += (this.umbrellaK - this.umbrellaShown) * Math.min(1, dt * 7)
    this.umbrella.visible = this.umbrellaShown > 0.02
    this.umbrella.scale.setScalar(Math.max(0.001, this.umbrellaShown))
    // ---- The pink milk going down ----
    this.milkShown += (this.milk - this.milkShown) * Math.min(1, dt * 5)
    this.deck.glass.milk.scale.y = Math.max(0.001, 0.17 * this.milkShown)
    if (this.snapAt > 0 && this.time >= this.snapAt) {
      this.snapAt = -1
      this.photoWanted = true
      this.after(0.6, () => (this.phone.visible = false))
    }
    // ---- The family ----
    if (this.phase === 'valley') {
      const look = this.held ? this.held.pos : this.pour.k > 0.1 || this.planting ? this.aim.at : null
      for (const c of [this.kaylee, this.nick]) {
        if (look) c.lookAt(look.x, look.y, look.z)
        else c.lookAt(0, 1.6, -8)
      }
    } else {
      const ph = this.phone.visible ? this.phone.getWorldPosition(new Vector3()) : this.deckAt(MOMMY_AT[0], 1.2, MOMMY_AT[2])
      this.kaylee.lookAt(ph.x, ph.y, ph.z)
      this.nick.lookAt(ph.x, ph.y, ph.z)
      const k = this.deckAt(0, 1.0, -0.95)
      this.ji.lookAt(k.x, k.y, k.z)
    }
    for (const c of [this.kaylee, this.nick, this.ji]) c.update(dt, t)
    for (const f of [this.drops, this.splash, this.rain, this.sparkles, this.puffs]) f.update(dt)
  }

  // ---------------------------------------------------------------- camera, tap targets, hints

  private tallNow: boolean | null = null
  setSize(w: number, h: number, top: number) {
    const tall = w < h
    if (tall !== this.tallNow && this.phase === 'valley') {
      this.tallNow = tall
      this.kaylee.root.position.set(...(tall ? TALL.kaylee : KAYLEE_AT))
      this.nick.root.position.set(...(tall ? TALL.nick : NICK_AT))
      this.valley.buffalo.root.position.set(...(tall ? TALL.buffalo : BUFFALO_AT))
    }
    super.setSize(w, h, top)
  }

  protected shot(): Shot {
    const tall = this.w < this.h
    if (this.phase === 'valley') {
      if (tall) return { center: new Vector3(0, 1.9, -5.9), half: new Vector3(3.4, 2.2, 4.7), yaw: 0, pitch: 30, minDist: 6 }
      return { center: new Vector3(0, 1.75, -6.2), half: new Vector3(4.6, 1.85, 4.6), yaw: 0, pitch: 21, minDist: 6 }
    }
    const c = this.deckAt(0.45, 0.95, -0.8)
    const yaw = (DECK.yaw * 180) / Math.PI
    if (tall) return { center: c, half: new Vector3(1.45, 1.05, 0.8), yaw, pitch: 12, minDist: 2.2, follow: true }
    return { center: c, half: new Vector3(2.3, 0.95, 0.8), yaw, pitch: 10, minDist: 2.2, follow: true }
  }

  /** What the hint finger (and the glow) points at now. */
  private hintTarget(): string | null {
    if (this.phase === 'valley') {
      if (this.pour.on || this.planting || this.held) return null
      if (this.round === '1') {
        const dry = this.paddies.filter((s) => !s.full).sort((a, b) => a.water - b.water)[0]
        return dry ? `paddy:${dry.p.i}` : null
      }
      if (this.round === '2') {
        const left = this.paddies.filter((s) => !s.done).sort((a, b) => a.planted / a.spots.length - b.planted / b.spots.length)[0]
        return left ? `paddy:${left.p.i}` : null
      }
      const c = this.cloudsLeft().find((x) => x.state === 'sit')
      return c ? `cloud:${c.i}` : null
    }
    if (this.snapAt > 0) return null
    if (!this.sips) return 'glass'
    return this.photos ? null : 'family:ji'
  }

  protected anchorAt(id: string): AnchorSpot | null {
    const idle = this.time - this.lastTouch > STUCK_S
    const hinted = idle && this.hintTarget() === id
    if (id.startsWith('family:')) {
      const e = id.slice(7)
      if (e === 'ji' && this.phase !== 'deck') return null
      const c = e === 'kaylee' ? this.kaylee : e === 'ji' ? this.ji : this.nick
      const r = c.rig
      return { at: r.head.localToWorld(new Vector3(0, r.face.headY, 0)), r: r.face.R * 1.1, prio: e === 'ji' ? 2 : 0, max: 120, glow: e === 'ji' && (hinted || (this.sips > 0 && !this.photos && this.snapAt < 0)) }
    }
    if (this.phase === 'valley') {
      if (id.startsWith('paddy:')) {
        if (this.round !== '1' && this.round !== '2') return null
        const s = this.paddies[Number(id.slice(6))]
        const last = this.round === '1' ? !s.full && this.fullCount() >= 9 : !s.done && this.doneCount() >= 9
        return { at: new Vector3(...s.p.mid).setY(s.p.mid[1] + WATER_Y), r: 0.5, prio: 2, max: 130, glow: hinted || last }
      }
      if (id.startsWith('cloud:')) {
        const c = this.clouds[Number(id.slice(6))]
        if (c.state !== 'sit' || this.round !== '3') return null
        return { at: c.pos.clone(), r: 1.1 * (0.5 + 0.5 * c.water), prio: 3, max: 220, glow: hinted }
      }
      if (id.startsWith('frog:')) {
        const f = this.frogs[Number(id.slice(5))]
        return f.on && this.round !== '3' ? { at: f.root.position.clone().add(new Vector3(0, 0.08, 0)), r: 0.12, prio: 3, max: 90 } : null
      }
      if (id.startsWith('duck:')) {
        const d = this.ducks[Number(id.slice(5))]
        return d.on && this.round !== '3' ? { at: d.root.position.clone().add(new Vector3(0, 0.12, 0)), r: 0.16, prio: 3, max: 90 } : null
      }
      switch (id) {
        case 'buffalo':
          return { at: this.valley.buffalo.root.position.clone().add(new Vector3(0, 0.9, 0)), r: 0.65, prio: 1, max: 140 }
        case 'hat':
          return { at: this.valley.hat.position.clone(), r: 0.3, max: 100 }
        case 'village':
          return { at: new Vector3(VILLAGE[0] - 0.4, 0.75, VILLAGE[2]), r: 0.9, prio: 0, max: 130 }
        case 'cafe':
          return { at: this.deckAt(0, 1.5, 0), r: 1.4, prio: 0, max: 130 }
      }
      return null
    }
    switch (id) {
      case 'glass':
        return { at: this.deck.glass.root.getWorldPosition(new Vector3()).add(new Vector3(0, 0.12, 0)), r: 0.1, prio: 3, max: 110, glow: hinted }
      case 'cup':
        return { at: this.deck.cup.getWorldPosition(new Vector3()).add(new Vector3(0, 0.05, 0)), r: 0.08, prio: 3, max: 100 }
      case 'chime':
        return { at: this.deckAt(CHIME[0], CHIME[1] - 0.1, CHIME[2]), r: 0.15, prio: 1, max: 100 }
      case 'view':
        return { at: new Vector3(0, 1.8, -7.5), r: 1.5, prio: 0, max: 160 }
    }
    return null
  }

  protected hintAt() {
    const id = this.hintTarget()
    if (!id) return null
    if (id.startsWith('paddy:')) return new Vector3(...PADDIES[Number(id.slice(6))].mid).add(new Vector3(0, WATER_Y, 0))
    if (id.startsWith('cloud:')) return this.clouds[Number(id.slice(6))].pos.clone()
    if (id === 'glass') return this.deck.glass.root.getWorldPosition(new Vector3()).add(new Vector3(0, 0.1, 0))
    if (id === 'family:ji') return this.ji.rig.head.localToWorld(new Vector3(0, this.ji.rig.face.headY, 0))
    return null
  }

  qa() {
    const pt = (v: Vector3) => {
      const s = this.screen(v)
      return s ? [Math.round(s.x), Math.round(s.y)] : null
    }
    return {
      game: 'rice',
      phase: this.phase,
      round: this.round,
      full: this.fullCount(),
      planted: this.doneCount(),
      paddies: this.paddies.map((s) => ({ at: pt(new Vector3(...s.p.mid).setY(s.p.mid[1] + WATER_Y)), level: s.p.level, water: Math.round(s.water * 100) / 100, seeds: `${this.seeds.filter((x) => x.paddy === s.p.i && x.on).length}/${s.spots.length}`, done: s.done, tall: Math.round(s.tall * 100) / 100, spilling: s.spillNow })),
      clouds: this.clouds.map((c) => ({ at: pt(c.pos), state: c.state, water: Math.round(c.water * 100) / 100 })),
      pouring: this.pour.on || this.time < this.pour.until,
      aim: { at: pt(this.aim.at), paddy: this.aim.paddy, who: this.aim.who },
      frogs: this.frogs.filter((f) => f.on).length,
      ducks: this.ducks.filter((d) => d.on).length,
      umbrella: this.umbrellaK > 0,
      sunny: this.sunny > 0,
      sips: this.sips,
      photos: this.photos,
      people: [this.kaylee, this.nick, this.ji].map((c) => [c.pose, pt(c.rig.head.getWorldPosition(new Vector3()))]),
      touches: this.touches,
      points: {
        buffalo: pt(this.valley.buffalo.root.position.clone().add(new Vector3(0, 0.9, 0))),
        nick: pt(this.nick.rig.head.getWorldPosition(new Vector3())),
        glass: this.phase === 'deck' ? pt(this.deck.glass.root.getWorldPosition(new Vector3())) : null,
        mommy: this.phase === 'deck' ? pt(this.ji.rig.head.localToWorld(new Vector3(0, this.ji.rig.face.headY, 0))) : null,
        spring: pt(new Vector3(...SPRING)),
        hat: pt(new Vector3(HAT_POST[0], 1.05, HAT_POST[2])),
        table: this.phase === 'deck' ? pt(this.deckAt(...HIGH_TABLE)) : null,
      },
    }
  }

  dispose() {
    this.seedMesh.dispose()
    super.dispose()
  }
}


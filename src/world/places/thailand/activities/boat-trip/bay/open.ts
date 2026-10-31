// The open water between the stops (sections `bay` and `sunset`): just the toy, plus things to drive up to and poke.
// - Needlefish skip across the water now and then, near the boat. The sea eagle circles and swoops down for a fish.
// - A coconut floats: bump it along fast, or come up to it slowly and Mommy scoops it into the boat.
// - Macaques sit on a ledge of a rock tower (tap: they chatter, one somersaults). Drive close and one jumps into the
//   boat and steals Daddy's mango (his banana if she didn't pack one): "Hey! My mango!"
// - A fisherman pulls up his net (tap: he waves, and up it comes with fish flopping).
// - Bonk a rock tower: a little crab scuttles out of the notch the sea nibbled round its bottom.
// - Silly moments: a big bonk sends Daddy's sunglasses flying (drive over them and they're back on his face, upside
//   down); a high jump off a wake blows Mommy's hat off (drive over it to scoop it back).
// - What she packed rides along: the duck on its string behind the boat, the teddy on Mommy's lap, her bucket.
import { BufferGeometry, Float32BufferAttribute, Group, Line, LineBasicMaterial, Vector3 } from 'three'
import { bell, clamp } from '../../../../../../sdk'
import { buildAnimal, type Rig } from '../../../../../engine3d/characters/animal'
import type { Look } from '../../../characters/looks'
import type { AnchorInfo } from '../../../../../engine3d/Anchors'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { swell } from '../../../../../engine3d/water'
import { L } from '../../../lines'
import { sfx } from '../../../sfx'
import { buildItem } from '../../../trip/props'
import { CARGO } from '../../../trip/vehicles/longtail'
import type { Bay } from './bay'
import { buildBird, buildCrab, buildMacaque, buildNeedlefish, type Bird, type Crab, type Fish, type Monkey } from './critters'
import { CLIFFS, COCONUT, FIELD, FISHING, HOUSES, MACAQUE_ROCK, NAIL, RING, ROCKS, VILLAGE } from './layout'
import type { BayPart, Box, Circle, Spot } from './part'

export const OPEN_ANCHORS: AnchorInfo[] = [
  { id: 'needlefish', label: 'Needlefish', kind: 'thing' },
  { id: 'eagle', label: 'Sea eagle', kind: 'thing' },
  { id: 'coconut', label: 'Coconut', kind: 'thing' },
  { id: 'macaque', label: 'Macaques', kind: 'thing' },
  { id: 'fisher', label: 'Fisherman', kind: 'thing' },
  { id: 'notch-crab', label: 'Crab', kind: 'thing' },
  { id: 'sunglasses', label: "Daddy's sunglasses", kind: 'thing' },
  { id: 'hat', label: "Mommy's hat", kind: 'thing' },
  { id: 'duck', label: 'Rubber duck', kind: 'thing' },
]

const tmp = new Vector3()
export const FISHER: Look = { species: 'buffalo', height: 1.5, fur: '#A79A8A', light: '#E8DFD2', dark: '#5E5468', ear: '#FFB8CC', outfit: { kind: 'shirt', color: '#8EC9F5' } }
/** The macaques' ledge on their rock, facing the open water toward the pier. */
const LEDGE_DIR = new Vector3(-0.85, 0, 0.53).normalize()
const LEDGE = new Vector3(MACAQUE_ROCK.x + LEDGE_DIR.x * (MACAQUE_ROCK.r + 0.5), 3.2, MACAQUE_ROCK.z + LEDGE_DIR.z * (MACAQUE_ROCK.r + 0.5))
const ROPE = 3
/** Where the duck's string is tied: the stern's left corner (so it bobs beside the wake, not in the camera's way). */
const TIE: [number, number, number] = [-0.55, 0.55, -2.9]

/** Something floating that went overboard (Daddy's sunglasses, Mommy's hat). */
interface Floater {
  g: Group
  /** Flying off (0..1), then floating. */
  t: number
  from: Vector3
  to: Vector3
}

export class OpenWater implements BayPart {
  // Needlefish.
  private fish: Fish[]
  private skip: { t: number; x: number; z: number; dx: number; dz: number } | null = null
  private nextSkip = 6
  // The sea eagle.
  private eagle: Bird
  private eagleFish: Group
  private eagleT = 0
  private swoop: { t: number; x: number; z: number; from: Vector3 } | null = null
  private nextSwoop = 14
  private orbit = new Vector3(0, 0, 40)
  // The coconut.
  private coconut: Group
  private nut = { x: COCONUT.x, z: COCONUT.z, vx: 0, vz: 0, spin: 0, in: false }
  private scoop: { t: number; from: Vector3 } | null = null
  // The macaques.
  private monkeys: Monkey[]
  private flips = [-1, -1, -1]
  private heist: { t: number; phase: 'out' | 'back' | 'eat'; from: Vector3 } | null = null
  private snack: Group
  private snackGone = false
  // The fisherman.
  private fisher: Rig
  private fishingBoat = new Group()
  private net: Group
  private netT = -1
  private nextNet = 8
  private waveT = -1
  // The crab in a rock's notch.
  private crab: Crab
  private crabT = -1
  private crabAt = new Vector3()
  private crabOut = new Vector3()
  // Silly things overboard.
  private shades: Group
  private shadesUp = true
  private hat: Group
  private floaters = new Map<'sunglasses' | 'hat', Floater>()
  // What she packed.
  private duck: Group | null = null
  private duckPos = new Vector3()
  private duckVel = new Vector3()
  private duckSpin = 0
  private duckSet = false
  private rope: Line | null = null

  constructor(private bay: Bay) {
    const { bag, scene } = bay
    // ---- Needlefish (three, skipping together) ----
    this.fish = [0, 1, 2].map(() => {
      const f = buildNeedlefish(bag)
      f.root.scale.setScalar(1.4)
      f.root.visible = false
      scene.add(f.root)
      return f
    })
    // ---- The sea eagle, and the fish it catches ----
    this.eagle = buildBird(bag, 'eagle')
    this.eagle.root.scale.setScalar(1.5)
    scene.add(this.eagle.root)
    this.eagleFish = new Group()
    this.eagleFish.add(solid(merge([P.capsule(0.07, 0.25, '#B8E6D8', { rot: [Math.PI / 2, 0, 0] }), P.cone(0.08, 0.12, '#7FCDB5', { at: [0, 0, -0.22], rot: [-Math.PI / 2, 0, 0], scale: [0.2, 1, 1] }, 6)]), bag, 1.5))
    this.eagleFish.position.set(0, -0.3, 0.1)
    this.eagleFish.visible = false
    this.eagle.root.add(this.eagleFish)
    // ---- The coconut ----
    this.coconut = new Group()
    this.coconut.add(solid(merge([P.sphere(0.32, '#8C5E3C', { scale: [1, 0.9, 1.05] }, 14), ...[0, 1, 2].map((i) => P.sphere(0.05, '#5A3A26', { at: [Math.sin(i * 2.1) * 0.12, 0.27, Math.cos(i * 2.1) * 0.12] }, 6))]), bag, 2))
    scene.add(this.coconut)
    // ---- The macaques on their ledge ----
    const ledge = solid(P.cyl(1.9, 1.5, 0.5, '#B3A8C6', { at: [LEDGE.x, LEDGE.y - 0.25, LEDGE.z], scale: [1, 1, 0.75] }, 12), bag, 2)
    scene.add(ledge)
    this.monkeys = [0, 1, 2].map((i) => {
      const m = buildMacaque(bag)
      const side = new Vector3(-LEDGE_DIR.z, 0, LEDGE_DIR.x)
      m.root.position.copy(LEDGE).addScaledVector(side, (i - 1) * 0.9).addScaledVector(LEDGE_DIR, i === 1 ? 0.4 : 0)
      m.root.rotation.y = Math.atan2(LEDGE_DIR.x, LEDGE_DIR.z) + (i - 1) * 0.3
      m.root.scale.setScalar(i === 1 ? 1.3 : 1.1)
      scene.add(m.root)
      return m
    })
    // ---- Daddy's snack (her mango, or his banana) ----
    const mango = bay.packed.includes('mango')
    this.snack = mango ? buildItem('mango', bag) : this.banana()
    this.snack.scale.setScalar(1.6)
    this.snack.position.set(...CARGO.mango)
    bay.rides.longtail.v.cargo.add(this.snack)
    // ---- The fisherman in his little boat, and his net ----
    this.fishingBoat.add(solid(merge([P.rbox(1.3, 0.5, 3.8, 0.2, '#7FB2E8', { at: [0, 0.15, 0] }), P.box(1.34, 0.08, 3.3, PAL.butter, { at: [0, 0.38, 0] }), P.box(1.1, 0.06, 3, '#F6D3AE', { at: [0, 0.42, 0] }), P.rbox(0.36, 0.5, 0.36, 0.08, '#FFFFFF', { at: [0, 0.5, -1.2] })]), bag, 2))
    this.fisher = buildAnimal(FISHER, bag)
    this.fisher.root.position.set(0.1, 0.45, 0.6)
    this.fisher.root.rotation.y = Math.PI / 2
    // His straw hat (a flat cone).
    this.fisher.head.add(solid(P.cone(0.55, 0.32, '#F2D38B', { at: [0, 0.75, 0] }, 16), bag, 2))
    this.fishingBoat.add(this.fisher.root)
    this.net = new Group()
    const mesh = []
    for (let i = 0; i <= 4; i++) mesh.push(P.box(1.4, 0.03, 0.03, '#E8E0F4', { at: [0, i * 0.3, 0] }), P.box(0.03, 1.2, 0.03, '#E8E0F4', { at: [-0.7 + i * 0.35, 0.6, 0] }))
    mesh.push(...[-0.3, 0.1, 0.4].map((x, i) => P.capsule(0.08, 0.25, ['#FFB3C7', '#B8E6D8', '#FFD27A'][i], { at: [x, 0.25, 0.08], rot: [0, 0, Math.PI / 2] })))
    this.net.add(solid(merge(mesh), bag, 1.5))
    this.net.position.set(1.2, -1.4, 0.4)
    this.fishingBoat.add(this.net)
    this.fishingBoat.position.set(FISHING.x, 0, FISHING.z)
    this.fishingBoat.rotation.y = FISHING.heading
    scene.add(this.fishingBoat)
    // ---- The crab that lives in the notches ----
    this.crab = buildCrab(bag, '#FF8A5C', false)
    this.crab.root.scale.setScalar(2.2)
    this.crab.root.visible = false
    scene.add(this.crab.root)
    // ---- Daddy's sunglasses and Mommy's sun hat, on their heads ----
    const nick = bay.rider('nick').char
    const R = 0.24 * nick.height
    this.shades = new Group()
    this.shades.add(solid(merge([...[-1, 1].flatMap((s) => [P.rbox(0.19, 0.13, 0.04, 0.04, '#3A3350', { at: [s * 0.37 * R, 0, 0], rot: [0, s * 0.35, 0] }), P.box(0.05, 0.03, 0.03, PAL.hotpink, { at: [s * 0.48 * R, 0.05, -0.02] })]), P.box(0.1, 0.03, 0.03, PAL.hotpink, { at: [0, 0.03, 0.01] })]), bag, 1.5))
    this.shades.position.set(0, R * 0.92 + 0.12 * R, R * 0.93)
    nick.rig.head.add(this.shades)
    const ji = bay.rider('ji').char
    const Rj = 0.24 * ji.height
    this.hat = new Group()
    this.hat.add(solid(merge([P.cyl(Rj * 1.4, Rj * 1.4, 0.03, PAL.butter, {}, 24), P.cyl(Rj * 0.7, Rj * 0.78, 0.2, PAL.butter, { at: [0, 0.1, 0] }, 20), P.cyl(Rj * 0.79, Rj * 0.79, 0.05, PAL.hotpink, { at: [0, 0.04, 0] }, 20), P.sphere(0.07, '#FFFFFF', { at: [Rj * 0.7, 0.1, 0.1] }, 8)]), bag, 1.5))
    this.hat.position.set(0, Rj * 0.92 + 0.6 * Rj, -0.04 * Rj)
    this.hat.rotation.x = -0.12
    ji.rig.head.add(this.hat)
    // ---- What she packed ----
    const cargo = bay.rides.longtail.v.cargo
    if (bay.packed.includes('teddy')) {
      const t = buildItem('teddy', bag)
      t.scale.setScalar(1.3)
      t.position.set(...CARGO.teddy)
      cargo.add(t)
    }
    if (bay.packed.includes('bucket')) {
      const b = buildItem('bucket', bag)
      b.scale.setScalar(1.5)
      b.position.set(...CARGO.bucket)
      b.name = 'bucket'
      cargo.add(b)
    }
    if (bay.packed.includes('duck')) {
      this.duck = buildItem('duck', bag)
      this.duck.scale.setScalar(2)
      scene.add(this.duck)
      const geo = bag.add(new BufferGeometry())
      geo.setAttribute('position', new Float32BufferAttribute(new Float32Array(6), 3))
      this.rope = new Line(geo, bag.add(new LineBasicMaterial({ color: PAL.ink })))
      this.rope.frustumCulled = false
      scene.add(this.rope)
    }
  }

  private banana() {
    const g = new Group()
    g.add(solid(merge([P.torus(0.12, 0.035, '#FFD84D', { at: [0, 0.05, 0], rot: [Math.PI / 2, 0, 0.4] }, Math.PI * 0.8), P.cyl(0.012, 0.012, 0.05, '#7A5A3A', { at: [0.11, 0.06, 0.05] }, 5)]), this.bay.bag, 1.5))
    return g
  }

  private get lt() {
    return this.bay.rides.longtail
  }
  /** Out in the open (not in the canoe, not on a beach). */
  private get out() {
    return this.bay.using === 'longtail' && this.bay.phase === 'drive'
  }

  // ---------------------------------------------------------------- taps

  anchorAt(id: string): Spot | null {
    const drive = this.bay.phase === 'drive' || this.bay.phase === 'beach'
    switch (id) {
      case 'needlefish':
        return this.skip && this.fish[1].root.visible ? { at: this.fish[1].root.position.clone(), r: 1.2, prio: 3 } : null
      case 'eagle':
        return drive && this.bay.using === 'longtail' ? { at: this.eagle.root.position.clone(), r: 1.4, prio: 3, max: 120 } : null
      case 'coconut':
        return !this.nut.in && this.out ? { at: this.coconut.position.clone().setY(0.4), r: 0.6, prio: 3, max: 110 } : null
      case 'macaque':
        return drive ? { at: LEDGE.clone().setY(LEDGE.y + 0.9), r: 1.6, prio: 3 } : null
      case 'fisher':
        return drive ? { at: tmp.set(0, 1.2, 0.4).applyMatrix4(this.fishingBoat.matrixWorld).clone(), r: 1.4, prio: 3 } : null
      case 'notch-crab':
        return this.crabT >= 0 ? { at: this.crab.root.position.clone().setY(this.crab.root.position.y + 0.4), r: 0.6, prio: 3 } : null
      case 'sunglasses':
      case 'hat': {
        const f = this.floaters.get(id)
        return f && f.t >= 1 && this.out ? { at: f.g.position.clone().setY(0.4), r: 0.6, prio: 3, glow: true } : null
      }
      case 'duck':
        return this.duck && this.bay.using === 'longtail' ? { at: this.duck.position.clone().setY(0.5), r: 0.5, prio: 3, max: 100 } : null
    }
    return null
  }

  tap(id: string): boolean {
    const bay = this.bay
    switch (id) {
      case 'needlefish':
        bay.found('needlefish', this.fish[1].root.position)
        sfx.splash(0.4)
        return true
      case 'eagle':
        if (!this.swoop) this.startSwoop()
        sfx.peep()
        bay.found('eagle', this.eagle.root.position)
        return true
      case 'coconut':
        bay.driveTo(this.nut.x, this.nut.z)
        this.nut.spin += 2
        sfx.boop()
        return true
      case 'macaque': {
        sfx.chatter()
        const i = Math.floor(Math.random() * 3)
        if (this.flips[i] < 0) this.flips[i] = 0
        bay.found('macaque', LEDGE)
        return true
      }
      case 'fisher':
        this.waveT = 0
        if (this.netT < 0) this.netT = 0
        sfx.toot()
        return true
      case 'notch-crab':
        this.crabT = Math.min(this.crabT, 0.5)
        this.crab.claw.rotation.z = 1
        sfx.pop()
        return true
      case 'sunglasses':
      case 'hat': {
        const f = this.floaters.get(id)
        if (f) bay.driveTo(f.g.position.x, f.g.position.z)
        return true
      }
      case 'duck':
        this.duckSpin = 1
        sfx.chirp()
        return true
    }
    return false
  }

  // ---------------------------------------------------------------- what the core tells it

  bonked(x: number, z: number, hit: number) {
    const bay = this.bay
    if (bay.using !== 'longtail') return
    // A rock tower: the crab in its notch comes out to see.
    // A big bonk: Daddy's sunglasses fly off (first, so his "My sunglasses!" isn't kept waiting behind a fact).
    if (hit > 3.2 && !this.floaters.has('sunglasses') && this.shades.parent && bay.phase === 'drive') this.overboard('sunglasses')
    const rock = ROCKS.find((r) => Math.abs(Math.hypot(x - r.x, z - r.z) - r.r) < 2.5)
    if (rock && this.crabT < 0) {
      const a = Math.atan2(x - rock.x, z - rock.z)
      this.crabAt.set(rock.x + Math.sin(a) * rock.r * 0.82, 0.55, rock.z + Math.cos(a) * rock.r * 0.82)
      this.crabOut.set(rock.x + Math.sin(a) * (rock.r * 0.82 + 0.6), 0.55, rock.z + Math.cos(a) * (rock.r * 0.82 + 0.6))
      this.crab.root.rotation.y = a
      this.crabT = 0
      bay.once('notch', L.bay.facts.notch)
    }
  }

  /** A jump off the tour boat's wake: a really high one blows Mommy's hat off. */
  jumped(vy: number) {
    if (vy > 4.3 && !this.floaters.has('hat') && this.hat.parent) this.overboard('hat')
  }

  private overboard(which: 'sunglasses' | 'hat') {
    const bay = this.bay
    const prop = which === 'sunglasses' ? this.shades : this.hat
    const from = prop.getWorldPosition(new Vector3())
    const g = prop.clone()
    g.rotation.set(0, 0, which === 'sunglasses' ? 0 : 0)
    g.scale.setScalar(which === 'sunglasses' ? 1.6 : 1.3)
    prop.removeFromParent()
    bay.scene.add(g)
    const d = this.lt.d
    const side = Math.random() < 0.5 ? -1 : 1
    const back = which === 'hat' ? -6 : -1.5
    const at = (s: number) => new Vector3(d.x + Math.sin(d.heading) * back + Math.cos(d.heading) * s * 3.5, 0.05, d.z + Math.cos(d.heading) * back - Math.sin(d.heading) * s * 3.5)
    // It lands on open water she can reach: the side away from the rock (or anything else) it would land in.
    const inRock = (p: Vector3) =>
      [...ROCKS, ...RING, ...CLIFFS, VILLAGE.rock].some((r) => Math.hypot(p.x - r.x, p.z - r.z) < r.r + 2) ||
      HOUSES.some((h) => Math.abs(p.x - h.x) < h.hx + 1.5 && Math.abs(p.z - h.z) < h.hz + 1.5) ||
      Math.hypot(p.x - NAIL.x, p.z - NAIL.z) < NAIL.buoys + 2 ||
      (Math.abs(p.x - FIELD.x) < FIELD.hx + 1.5 && Math.abs(p.z - FIELD.z) < FIELD.hz + 1.5)
    let to = at(side)
    if (inRock(to)) to = at(-side)
    if (inRock(to)) to = at(0).setX(d.x - Math.sin(d.heading) * 5).setZ(d.z - Math.cos(d.heading) * 5)
    this.floaters.set(which, { g, t: 0, from, to })
    bay.say(which === 'sunglasses' ? L.bay.sunglasses : L.bay.hat)
    sfx.whoosh(0.5)
  }

  /** Something nice for Daddy to point at: an animal she hasn't found yet, nearby. */
  somethingToSee(): Vector3 | null {
    const d = this.lt.d
    const opts: [string, Vector3][] = [
      ['eagle', this.eagle.root.position],
      ['macaque', LEDGE],
      ['needlefish', this.fish[1].root.position],
    ]
    const left = opts.filter(([id]) => !this.bay.has(id as never))
    const pick = (left.length ? left : opts).sort((a, b) => a[1].distanceTo(tmp.set(d.x, 0, d.z)) - b[1].distanceTo(tmp.set(d.x, 0, d.z)))[0]
    return pick?.[1] ?? null
  }

  bumps(x: number, z: number, circles: Circle[], _boxes: Box[]) {
    if (Math.abs(FISHING.x - x) < 14 && Math.abs(FISHING.z - z) < 14) {
      const sx = Math.sin(FISHING.heading)
      const sz = Math.cos(FISHING.heading)
      for (const a of [-1.2, 0, 1.2]) circles.push([FISHING.x + sx * a, FISHING.z + sz * a, 0.8])
    }
  }

  // ---------------------------------------------------------------- per frame

  update(dt: number, t: number) {
    const bay = this.bay
    const d = this.lt.d
    // Far away, the ledge's monkeys and the fisherman aren't drawn (fewer draw calls); in the canoe Mommy tucks her hat
    // away (it would block the view under the low roof).
    const cam = bay.rig.camera.position
    const seeLedge = Math.hypot(cam.x - LEDGE.x, cam.z - LEDGE.z) < 160
    for (const m of this.monkeys) m.root.visible = seeLedge || this.heist !== null
    this.fisher.root.visible = Math.hypot(cam.x - FISHING.x, cam.z - FISHING.z) < 160
    this.hat.visible = bay.using === 'longtail'
    this.updateNeedlefish(dt, t)
    this.updateEagle(dt, t)
    this.updateCoconut(dt, t)
    this.updateMonkeys(dt, t)
    this.updateFisher(dt, t)
    this.updateCrab(dt)
    this.updateFloaters(dt, t)
    this.updateDuck(dt, t)
    // Driving close to an animal finds its sticker.
    if (bay.using === 'longtail') {
      if (Math.hypot(d.x - LEDGE.x, d.z - LEDGE.z) < 20) bay.found('macaque', LEDGE)
    }
  }

  private updateNeedlefish(dt: number, t: number) {
    const bay = this.bay
    const d = this.lt.d
    this.nextSkip -= dt
    if (!this.skip && this.nextSkip <= 0 && this.out && !bay.section.startsWith('village')) {
      this.nextSkip = 8 + Math.random() * 6
      // Across her path, 12-18 m ahead, from one side to the other.
      const ahead = 12 + Math.random() * 6
      const side = Math.random() < 0.5 ? -1 : 1
      const fx = Math.sin(d.heading)
      const fz = Math.cos(d.heading)
      this.skip = { t: 0, x: d.x + fx * ahead + fz * side * 6, z: d.z + fz * ahead - fx * side * 6, dx: -fz * side, dz: fx * side }
    }
    const s = this.skip
    if (!s) return
    s.t += dt
    const HOP = 0.55
    let up = false
    this.fish.forEach((f, i) => {
      const local = s.t - i * 0.18
      const hop = Math.floor(local / HOP)
      const k = (local % HOP) / HOP
      const visible = local > 0 && hop < 5
      f.root.visible = visible
      if (!visible) return
      up = true
      const along = (hop + k) * 2.6
      f.root.position.set(s.x + s.dx * along + s.dz * (i - 1) * 0.7, Math.sin(k * Math.PI) * 0.8 - 0.05, s.z + s.dz * along - s.dx * (i - 1) * 0.7)
      f.root.rotation.set(-Math.cos(k * Math.PI) * 0.6, Math.atan2(s.dx, s.dz), 0)
      f.blink.update(dt)
      if (k < 0.1 && hop > 0 && Math.random() < 0.5) this.bay.foam.emit(f.root.position.x, 0.03, f.root.position.z, 0, 0, 0, 1, 0.7)
    })
    if (s.t < 0.1) sfx.splash(0.25)
    if (Math.hypot(this.fish[1].root.position.x - d.x, this.fish[1].root.position.z - d.z) < 22 && this.fish[1].root.visible) bay.found('needlefish', this.fish[1].root.position)
    if (!up && s.t > 1) this.skip = null
    void t
  }

  private startSwoop() {
    const d = this.lt.d
    const side = Math.random() < 0.5 ? -1 : 1
    const ahead = 9 + Math.random() * 4
    const x = d.x + Math.sin(d.heading) * ahead + Math.cos(d.heading) * side * 5
    const z = d.z + Math.cos(d.heading) * ahead - Math.sin(d.heading) * side * 5
    this.swoop = { t: 0, x, z, from: this.eagle.root.position.clone() }
  }

  private updateEagle(dt: number, t: number) {
    const bay = this.bay
    const d = this.lt.d
    const e = this.eagle
    e.blink.update(dt)
    // It circles over the water a little ahead of the boat.
    const want = tmp.set(d.x + Math.sin(d.heading) * 22, 0, d.z + Math.cos(d.heading) * 22)
    this.orbit.lerp(want, 1 - Math.exp(-dt * 0.25))
    this.nextSwoop -= dt
    if (!this.swoop && this.nextSwoop <= 0 && this.out) {
      this.nextSwoop = 18 + Math.random() * 8
      this.startSwoop()
    }
    const sw = this.swoop
    if (sw) {
      sw.t += dt / 3.2
      const k = Math.min(1, sw.t)
      // Down to the water (0..0.45), a splash and a fish, back up (0.45..1).
      const to = tmp.set(sw.x, 0.4, sw.z)
      if (k < 0.45) {
        const a = k / 0.45
        e.root.position.lerpVectors(sw.from, to, a * a)
        e.wingL.rotation.z = e.wingR.rotation.z = 0
        e.wingL.rotation.z = 0.9 * a
        e.wingR.rotation.z = -0.9 * a
      } else {
        if (!this.eagleFish.visible) {
          this.eagleFish.visible = true
          sfx.splash(0.6)
          bay.spray.burst(sw.x, 0.2, sw.z, 12, 2.5, 3.5, 0.2)
          if (Math.hypot(sw.x - d.x, sw.z - d.z) < 25) bay.found('eagle', e.root.position)
        }
        const a = (k - 0.45) / 0.55
        const up = tmp.set(sw.x + (sw.x - sw.from.x) * 0.4 * a, 0.4 + a * 13, sw.z + (sw.z - sw.from.z) * 0.4 * a)
        e.root.position.lerp(up, 0.2)
        const flap = Math.sin(t * 14) * 0.7
        e.wingL.rotation.z = flap
        e.wingR.rotation.z = -flap
      }
      const v = tmp.copy(to).sub(e.root.position)
      e.root.rotation.set(0, Math.atan2(v.x, v.z) + (k > 0.45 ? Math.PI : 0), 0)
      if (k >= 1) {
        this.swoop = null
        setTimeout(() => (this.eagleFish.visible = false), 2500)
      }
      return
    }
    // Circling: a slow glide with a flap now and then.
    this.eagleT += dt * 0.35
    const a = this.eagleT
    const x = this.orbit.x + Math.sin(a) * 16
    const z = this.orbit.z + Math.cos(a) * 16
    const y = 13 + Math.sin(a * 2) * 1.5
    e.root.position.lerp(tmp.set(x, y, z), 1 - Math.exp(-dt * 2))
    e.root.rotation.set(0, a + Math.PI / 2, -0.35)
    const flap = Math.sin(t * 6) > 0.7 ? Math.sin(t * 16) * 0.5 : 0.08
    e.wingL.rotation.z = flap
    e.wingR.rotation.z = -flap
  }

  private updateCoconut(dt: number, t: number) {
    const bay = this.bay
    const n = this.nut
    const c = this.coconut
    if (this.scoop) {
      // Up into the boat, into Mommy's arms, then down by the bow.
      this.scoop.t += dt / 0.6
      const k = Math.min(1, this.scoop.t)
      const to = this.lt.v.body.localToWorld(tmp.set(...CARGO.coconut))
      c.position.lerpVectors(this.scoop.from, to, k)
      c.position.y += bell(k) * 1.2
      if (k >= 1) {
        this.scoop = null
        c.removeFromParent()
        c.position.set(...CARGO.coconut)
        c.rotation.set(0, 0, 0)
        c.scale.setScalar(0.8)
        this.lt.v.cargo.add(c)
      }
      return
    }
    if (n.in) return
    // It drifts, slows in the water and bobs; the boat bumps it along, or (slowly) Mommy scoops it up.
    n.x += n.vx * dt
    n.z += n.vz * dt
    n.vx *= Math.exp(-dt * 0.8)
    n.vz *= Math.exp(-dt * 0.8)
    n.spin *= Math.exp(-dt)
    const d = this.lt.d
    if (bay.using === 'longtail' && bay.phase === 'drive') {
      for (const at of this.lt.v.hull.at) {
        const px = d.x + Math.sin(d.heading) * at
        const pz = d.z + Math.cos(d.heading) * at
        const dx = n.x - px
        const dz = n.z - pz
        const dist = Math.hypot(dx, dz)
        const min = this.lt.v.hull.r + 0.35
        if (dist < min && dist > 1e-4) {
          if (Math.abs(d.speed) < 4.2) {
            n.in = true
            this.scoop = { t: 0, from: c.position.clone() }
            sfx.scoop()
            bay.strike(bay.rider('ji'), 'point', 0.8)
            bay.say(L.bay.coconut)
            return
          }
          const nx = dx / dist
          const nz = dz / dist
          n.x = px + nx * min
          n.z = pz + nz * min
          const push = Math.max(2, Math.abs(d.speed) * 1.1)
          n.vx = nx * push + d.vx * 0.5
          n.vz = nz * push + d.vz * 0.5
          n.spin = 6
          sfx.boop()
          bay.spray.burst(n.x, 0.2, n.z, 6, 2, 2.5, 0.16)
        }
      }
    }
    c.position.set(n.x, swell(n.x, n.z, t) + 0.12, n.z)
    c.rotation.y += n.spin * dt
    c.rotation.z = Math.sin(t * 1.7) * 0.15
  }

  private updateMonkeys(dt: number, t: number) {
    const bay = this.bay
    const d = this.lt.d
    this.monkeys.forEach((m, i) => {
      m.blink.update(dt)
      m.root.lookAt(d.x, m.root.position.y, d.z)
      // Scratching, looking about.
      m.armR.rotation.x = Math.sin(t * 2 + i * 2) * 0.3 - 0.3
      if (this.flips[i] >= 0) {
        this.flips[i] += dt / 0.8
        const k = Math.min(1, this.flips[i])
        m.body.rotation.x = -k * Math.PI * 2
        m.body.position.y = bell(k) * 0.8
        if (k >= 1) {
          this.flips[i] = -1
          m.body.rotation.x = 0
          m.body.position.y = 0
        }
      }
    })
    // The mango heist: drive close and the big one jumps into the boat, grabs Daddy's snack and jumps back.
    const near = Math.hypot(d.x - LEDGE.x, d.z - LEDGE.z) < 22
    if (!this.heist && !this.snackGone && near && bay.using === 'longtail' && bay.phase === 'drive') {
      this.heist = { t: 0, phase: 'out', from: this.monkeys[1].root.position.clone() }
      sfx.chatter()
    }
    const h = this.heist
    if (!h) return
    const m = this.monkeys[1]
    h.t += dt / (h.phase === 'eat' ? 4 : 0.9)
    const k = Math.min(1, h.t)
    if (h.phase === 'out') {
      const to = this.lt.v.body.localToWorld(tmp.set(CARGO.mango[0], CARGO.mango[1] + 0.1, CARGO.mango[2]))
      m.root.position.lerpVectors(h.from, to, k)
      m.root.position.y += bell(k) * 2.5
      if (k >= 1) {
        // Got it!
        m.root.position.copy(to)
        m.armR.add(this.snack)
        this.snack.position.set(0, -0.3, 0.1)
        this.snack.scale.setScalar(1.2)
        bay.say(this.bay.packed.includes('mango') ? L.bay.mango : L.bay.banana)
        bay.rider('nick').char.react('hop')
        bay.strike(bay.rider('nick'), 'point', 1.6)
        sfx.chatter()
        h.phase = 'back'
        h.t = 0
        h.from = to.clone()
      }
    } else if (h.phase === 'back') {
      const home = LEDGE.clone().addScaledVector(LEDGE_DIR, 0.4)
      m.root.position.lerpVectors(h.from, home, k)
      m.root.position.y += bell(k) * 2.5
      if (k >= 1) {
        h.phase = 'eat'
        h.t = 0
        this.snackGone = true
        bay.found('macaque', LEDGE)
      }
    } else {
      // Munch munch: the snack gets smaller.
      this.snack.scale.setScalar(1.2 * (1 - k))
      m.armR.rotation.x = -1.8 + Math.sin(t * 10) * 0.2
      if (Math.floor(h.t * 8) !== Math.floor((h.t - dt / 4) * 8)) sfx.crunch()
      if (k >= 1) {
        this.snack.removeFromParent()
        this.heist = null
      }
    }
  }

  private updateFisher(dt: number, t: number) {
    const bay = this.bay
    // His boat bobs; now and then he pulls up the net: fish flop in it.
    this.fishingBoat.position.y = swell(FISHING.x, FISHING.z, t)
    this.fishingBoat.rotation.z = Math.sin(t * 1.2) * 0.03
    this.nextNet -= dt
    if (this.netT < 0 && this.nextNet <= 0) {
      this.nextNet = 11 + Math.random() * 5
      this.netT = 0
    }
    if (this.netT >= 0) {
      this.netT += dt / 3.2
      const k = Math.min(1, this.netT)
      const up = bell(Math.min(1, k * 1.25))
      this.net.position.y = -1.4 + up * 1.9
      this.fisher.armR.rotation.x = -1.2 * up
      this.fisher.armL.rotation.x = -1.2 * up
      if (up > 0.9 && Math.random() < dt * 4) {
        sfx.flop()
        const w = this.net.getWorldPosition(tmp)
        bay.spray.burst(w.x, 0.8, w.z, 3, 1.5, 2, 0.12)
      }
      if (k >= 1) this.netT = -1
    }
    if (this.waveT >= 0) {
      this.waveT += dt / 1.4
      const k = Math.min(1, this.waveT)
      this.fisher.armL.rotation.z = -(2.4 + Math.sin(k * 30) * 0.3) * bell(k)
      if (k >= 1) {
        this.waveT = -1
        this.fisher.armL.rotation.z = 0
      }
    }
  }

  private updateCrab(dt: number) {
    if (this.crabT < 0) return
    this.crabT += dt
    const c = this.crab
    c.blink.update(dt)
    const out = clamp(this.crabT / 0.4, 0, 1) * (1 - clamp((this.crabT - 2.6) / 0.4, 0, 1))
    c.root.visible = out > 0.01
    c.root.position.lerpVectors(this.crabAt, this.crabOut, out)
    c.root.scale.setScalar(2.2 * Math.max(0.01, out))
    c.claw.rotation.z = Math.sin(this.crabT * 14) * 0.5 * out
    if (this.crabT > 3.0) {
      this.crabT = -1
      c.root.visible = false
    }
  }

  private updateFloaters(dt: number, t: number) {
    const bay = this.bay
    const d = this.lt.d
    for (const [which, f] of this.floaters) {
      if (f.t < 1) {
        f.t += dt / 0.8
        const k = Math.min(1, f.t)
        f.g.position.lerpVectors(f.from, f.to, k)
        f.g.position.y += bell(k) * 2.2
        f.g.rotation.x += dt * 8
        if (k >= 1) {
          sfx.plop()
          bay.foam.emit(f.to.x, 0.03, f.to.z, 0, 0, 0, 1.4, 1.2)
          f.g.rotation.set(which === 'hat' ? 0 : -Math.PI / 2, 0, 0)
        }
        continue
      }
      // Floating, bobbing; drive over it to scoop it back up.
      f.g.position.y = swell(f.to.x, f.to.z, t) + 0.05
      f.g.rotation.y += dt * 0.4
      if (bay.using !== 'longtail' || bay.phase !== 'drive') continue
      const close = this.lt.v.hull.at.some((a) => Math.hypot(d.x + Math.sin(d.heading) * a - f.to.x, d.z + Math.cos(d.heading) * a - f.to.z) < 1.8)
      if (!close) continue
      this.floaters.delete(which)
      f.g.removeFromParent()
      sfx.scoop()
      sfx.giggle()
      if (which === 'sunglasses') {
        // Back on Daddy's face: upside down (and the next time, the right way up again).
        this.shadesUp = !this.shadesUp
        this.shades.rotation.z = this.shadesUp ? 0 : Math.PI
        bay.rider('nick').char.rig.head.add(this.shades)
        bay.rider('nick').char.react('hop')
      } else {
        bay.rider('ji').char.rig.head.add(this.hat)
        bay.rider('ji').char.react('hop')
      }
    }
  }

  private updateDuck(dt: number, t: number) {
    const duck = this.duck
    if (!duck || !this.rope) return
    const lt = this.lt
    const show = this.bay.using === 'longtail'
    duck.visible = this.rope.visible = show
    if (!show) return
    // Tied to the stern: it follows on its string, swings round in doughnuts, bobs on the water.
    const a = lt.v.body.localToWorld(tmp.set(...TIE)).clone()
    const p = this.duckPos
    if (!this.duckSet) {
      // The first frame: floating right behind the boat.
      this.duckSet = true
      p.set(a.x - Math.sin(lt.d.heading + 0.5) * ROPE, 0, a.z - Math.cos(lt.d.heading + 0.5) * ROPE)
    }
    this.duckVel.multiplyScalar(Math.exp(-dt * 1.5))
    p.addScaledVector(this.duckVel, dt)
    const dx = p.x - a.x
    const dz = p.z - a.z
    const dist = Math.hypot(dx, dz)
    if (dist > ROPE) {
      const nx = dx / dist
      const nz = dz / dist
      const nxp = a.x + nx * ROPE
      const nzp = a.z + nz * ROPE
      this.duckVel.x = (nxp - p.x) / Math.max(dt, 1e-3) * 0.6
      this.duckVel.z = (nzp - p.z) / Math.max(dt, 1e-3) * 0.6
      p.x = nxp
      p.z = nzp
    }
    this.duckSpin = Math.max(0, this.duckSpin - dt)
    duck.position.set(p.x, swell(p.x, p.z, t) + 0.02 + bell(Math.min(1, this.duckSpin)) * 0.5, p.z)
    duck.rotation.set(0, Math.atan2(a.x - p.x, a.z - p.z) - Math.PI / 2 + this.duckSpin * 12, Math.sin(t * 2.3) * 0.12)
    const pos = this.rope.geometry.attributes.position
    pos.setXYZ(0, a.x, a.y, a.z)
    pos.setXYZ(1, p.x, duck.position.y + 0.3, p.z)
    pos.needsUpdate = true
  }

  qa() {
    return { coconut: this.nut.in, snack: this.snackGone ? 'stolen' : 'in the boat', shades: this.floaters.has('sunglasses') ? 'floating' : this.shadesUp ? 'on' : 'upside down', hat: this.floaters.has('hat') ? 'floating' : 'on' }
  }
}

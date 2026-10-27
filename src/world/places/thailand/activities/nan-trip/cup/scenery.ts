// Each track's scenery (plan: thailand/nan-cup.html, "The three tracks"; the look step), built in the toon look from
// simple shapes along the track's road (track.ts says where):
// - 🍄 The Mushroom Forest: a giant hollow log lying across the road (she drives right through it: bark outside, pale
//   wood inside, tree rings at its ends, moss and little mushrooms on top); a stream winding through the trees and across
//   the road (every kart splashes through: the race does the splash); and a dark stretch under huge old trees whose
//   crowns meet over the road, where fireflies blink in the shade (the race dims the light there: Track.shadeAt).
// - 🌾 The Rice Steps Rally: Stop Time Cafe's deck on stilts up on the high side near the top, full of people who jump
//   and wave as she passes; a mother duck and her ducklings who waddle across the road in a line just as she gets there
//   (every kart waits a moment: `hold`), hurry when she's waiting, and peck on the far side after; a wobbly bamboo bridge
//   over a stream (it bounces under the karts); scarecrows in the paddies in farmer's hats that wave when she goes by;
//   and water buffalo grazing in the next fields, who look up and moo.
// - ☁️ The Cloud Top Climb: a ring of pennant flags on tall poles round the summit, just past the finish, flying in
//   the wind (the cloud, the lanterns, the blossom trees and the mirrors are the race's own, race.ts).
import { BufferAttribute, BufferGeometry, CanvasTexture, Color, CylinderGeometry, DoubleSide, Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, RepeatWrapping } from 'three'
import { bell, clamp } from '../../../../../../sdk'
import { buildAnimal, type Rig } from '../../../../../engine3d/characters/animal'
import type { Look } from '../../../../../engine3d/characters/look'
import type { Bag } from '../../../../../engine3d/dispose'
import { bake, blobShadow, merge, P, solid, type V3 } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { applyPose, clearPose } from '../../boat-trip/bay/poses'
import { rng, type HeightField } from '../../../trip/road/build'
import { buildBuffaloToy } from '../../../trip/road/traffic'
import { BRIDGE_LEN, LOG_LEN, LOG_R, type Track } from './track'

/** Where a kart is (meters along the road and across it). */
export interface KartAt {
  s: number
  lat: number
}

export interface SceneryEvents {
  quack(): void
  moo(): void
  cheer(): void
  creak(): void
}

/** The people on Stop Time Cafe's deck (and the crowd at the race ground): Nan folk out for the race, as toy animals
 *  (not family). */
export const CROWD: Look[] = [
  { species: 'puppy', height: 1.1, fur: '#F4C47E', light: '#FFF1DC', dark: '#4A3640', ear: '#D99A55', outfit: { kind: 'tee', color: '#8FC9F5' }, open: true },
  { species: 'fox', height: 1.25, fur: '#FFB07A', light: '#FFF1E2', dark: '#2B2330', ear: '#FFE6CC', outfit: { kind: 'blouse', color: '#C9B5F7' }, lashes: true, open: true },
  { species: 'monkey', height: 1.0, fur: '#C08A5E', light: '#FFE6CC', dark: '#7A5340', ear: '#FFC2B0', outfit: { kind: 'tee', color: '#FBE78A' }, open: true },
  { species: 'panda', height: 1.3, fur: '#FFF6EE', light: '#FFFDF8', dark: '#4A3F4F', ear: '#FFB3C7', outfit: { kind: 'shirt', color: '#A7EBD0' }, extras: ['sunhat'], open: true },
  { species: 'pony', height: 1.05, fur: '#E9B486', light: '#FFF0E0', dark: '#8A5A4A', ear: '#FFC2C8', mane: ['#9A5E4E', '#B87A62'], hair: 'medium', outfit: { kind: 'dress', color: '#FF9CC8' }, lashes: true, open: true },
]

const m4 = new Matrix4()
const tmpColor = new Color()

/** Moving water (a canvas of soft ripples that scrolls): the forest's stream and the one under the bamboo bridge. */
function waterTexture(bag: Bag) {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 128
  const x = c.getContext('2d')!
  x.fillStyle = '#8FD0EC'
  x.fillRect(0, 0, 64, 128)
  const rand = rng(5)
  for (let i = 0; i < 26; i++) {
    x.fillStyle = i % 3 ? 'rgba(255,255,255,0.55)' : 'rgba(111,182,222,0.7)'
    const w = 10 + rand() * 20
    x.beginPath()
    x.ellipse(rand() * 64, rand() * 128, w / 2, 2 + rand() * 2, 0, 0, Math.PI * 2)
    x.fill()
  }
  const tex = bag.add(new CanvasTexture(c))
  tex.wrapS = tex.wrapT = RepeatWrapping
  return tex
}

interface Duck {
  g: Group
  i: number
}

interface Scarecrow {
  arms: Group
  s: number
  wave: number
  waved: boolean
}

interface Grazer {
  head: Group
  s: number
  look: number
  mooed: boolean
}

export class Scenery {
  readonly root = new Group()
  private water: CanvasTexture[] = []
  private flies: { mesh: InstancedMesh; halo: InstancedMesh; at: V3[]; phase: number[] } | null = null
  private bridge: { deck: Group; rails: Group; load: number; wobble: number; creak: number } | null = null
  private ducks: { list: Duck[]; state: 'wait' | 'cross' | 'done'; lat: number; dir: number; held: number; s: number; flap: number } | null = null
  private scarecrows: Scarecrow[] = []
  private grazers: Grazer[] = []
  private crowd: { rigs: Rig[]; s: number; cheer: number; cheered: boolean } | null = null
  /** QA: seconds the karts waited for the ducks, and how many waved, mooed or cheered. */
  counts = { duckWait: 0, waves: 0, moos: 0, cheers: 0 }
  /** QA: where the ducks are (their state, and the mother's place across the road). */
  get duckState() {
    return this.ducks ? { state: this.ducks.state, lat: Math.round(this.ducks.lat * 10) / 10 } : null
  }

  constructor(
    private track: Track,
    private field: HeightField,
    private bag: Bag,
  ) {
    const def = track.def
    if (track.log !== null) this.root.add(this.log(track.log))
    if (track.ford !== null) this.root.add(this.stream(track.ford, 3, 0.6))
    if (track.dark) this.root.add(this.bigTrees(track.dark.s0, track.dark.s1))
    if (def.deck) this.root.add(this.deck(track.at(def.deck.f)))
    if (track.ducks) this.root.add(this.buildDucks(track.ducks.s, track.ducks.side))
    if (track.bridge !== null) this.root.add(this.stream(track.bridge, 4.5, 0.2), this.buildBridge(track.bridge))
    for (const c of def.scarecrows ?? []) this.root.add(this.scarecrow(track.at(c.f), c.side))
    for (const b of def.buffalo ?? []) this.root.add(this.grazer(track.at(b.f), b.side))
    if (def.id === 'cloud') this.root.add(this.summitFlags(def.finish + 14))
  }

  /** The ring of flags round the summit (each flag flies: `summit`). */
  private summit: Group[] = []
  private summitFlags(s: number) {
    const g = new Group()
    const c = this.road.sampleAt(Math.min(s, this.road.length - 1))
    const COLORS = [PAL.hotpink, PAL.butter, PAL.mint, PAL.sky, PAL.lavenderDark, '#FFB07A']
    const poles: BufferGeometry[] = []
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      const r = this.track.def.half + 6
      const x = c.x + Math.cos(a) * r
      const z = c.z + Math.sin(a) * r
      const y = Math.max(this.field.at(x, z), c.y - 1)
      poles.push(P.cyl(0.07, 0.09, 5.5, PAL.cream, { at: [x, y + 2.75, z] }, 7), P.sphere(0.14, PAL.gold, { at: [x, y + 5.55, z] }, 8))
      const flag = new Group()
      flag.position.set(x, y + 5.1, z)
      flag.add(solid(merge([P.prism([[0, 0.38], [0, -0.38], [1.4, 0]], 0.04, COLORS[i % COLORS.length])]), this.bag, 1.5))
      g.add(flag)
      this.summit.push(flag)
    }
    g.add(solid(merge(poles), this.bag, 1.5))
    return g
  }

  private get road() {
    return this.track.road
  }
  /** The ground's height beside the road (at least the road's, so nothing sinks below it). */
  private groundAt(s: number, lat: number) {
    const p = this.road.spotAt(s, lat)
    const y = Math.abs(lat) < this.track.def.half + 0.5 ? this.road.sampleAt(s).y : this.field.at(p.x, p.z)
    return { x: p.x, y, z: p.z, heading: p.heading }
  }

  // ---------------------------------------------------------------- the forest

  /** The hollow log: a giant half-buried trunk lying along the road, which runs through it. It's built in slices that
   *  follow the road, so the road never cuts through its wall. */
  private log(s: number) {
    const R = LOG_R
    const T = 0.9
    const parts: BufferGeometry[] = []
    const top: BufferGeometry[] = []
    const rand = rng(77)
    // Places a part built along +z (x across, y up) at `a` meters along the log.
    const at = (geo: BufferGeometry, a: number) => {
      const p = this.road.sampleAt(s + a)
      geo.applyMatrix4(m4.makeRotationY(Math.atan2(p.tx, p.tz)))
      geo.translate(p.x, p.y - 0.4, p.z)
      return geo
    }
    // A slice of an upper half cylinder (bark outside; inside a pale one facing in: mirrored, so it shows from inside).
    const half = (r: number, len: number, c: string, flip: boolean) => bake(new CylinderGeometry(r, r, len, 30, 1, true, Math.PI / 2, Math.PI), c, { rot: [Math.PI / 2, 0, 0], scale: [flip ? -1 : 1, 1, 1] })
    const STEP = 1
    for (let a = -LOG_LEN / 2 + STEP / 2; a < LOG_LEN / 2; a += STEP) {
      parts.push(at(half(R + T, STEP + 0.12, '#9C6B4E', false), a), at(half(R, STEP + 0.12, '#EBCB9C', true), a))
      // Bark ridges along the outside.
      for (let i = 0; i < 9; i++) {
        const ang = 0.25 + (i / 8) * (Math.PI - 0.5)
        parts.push(at(P.rbox(0.35, 0.3, STEP + 0.14, 0.12, i % 2 ? '#8A5C42' : '#7E5239', { at: [Math.cos(ang) * (R + T), Math.sin(ang) * (R + T), 0], rot: [0, 0, ang] }), a))
      }
      // Moss on top, and now and then a little pink mushroom growing out of it.
      if (rand() < 0.8) {
        const ang = Math.PI / 2 + (rand() - 0.5) * 1.6
        top.push(at(P.sphere(1.0 + rand() * 0.8, rand() < 0.6 ? '#7FBF6E' : '#9BD37E', { at: [Math.cos(ang) * (R + T), Math.sin(ang) * (R + T), 0], scale: [1.4, 0.35, 1.2] }, 9), a))
      }
      if (rand() < 0.35) {
        const ang = Math.PI / 2 + (rand() - 0.5) * 1.2
        const k = 0.7 + rand() * 0.6
        const r = R + T + 0.2
        top.push(at(P.cyl(0.18 * k, 0.24 * k, 0.8 * k, PAL.cream, { at: [Math.cos(ang) * r, Math.sin(ang) * r + 0.4 * k, 0] }, 8), a), at(P.sphere(0.6 * k, rand() < 0.5 ? PAL.pink : PAL.hotpink, { at: [Math.cos(ang) * r, Math.sin(ang) * r + 0.85 * k, 0], scale: [1, 0.55, 1] }, 10), a))
      }
    }
    // The rings at each end: a pale face with darker growth rings.
    for (const z of [-1, 1]) {
      parts.push(at(P.torus(R + T / 2, T / 2 + 0.06, '#F2D6A8', {}, Math.PI), (z * LOG_LEN) / 2))
      parts.push(at(P.torus(R + T / 2, 0.08, '#D9A86E', { at: [0, 0, z * 0.5] }, Math.PI), (z * LOG_LEN) / 2))
    }
    const g = new Group()
    g.add(solid(merge(parts), this.bag, 2), solid(merge(top), this.bag, 2))
    return g
  }

  /** A stream winding through the ground and across the road at `s` (`w` meters wide), with pebbles and reeds on its
   *  banks (and, by the forest's, a frog on a stone). */
  private stream(s: number, w: number, wiggle: number) {
    const g = new Group()
    const tex = waterTexture(this.bag)
    tex.repeat.set(1, 6)
    this.water.push(tex)
    const pos: number[] = []
    const uv: number[] = []
    const idx: number[] = []
    const reach = 46
    const t = this.road.sampleAt(s)
    const bend = (u: number) => Math.sin(u * 0.09) * 6 * wiggle + Math.sin(u * 0.23 + 1) * 2 * wiggle
    let n = 0
    for (let u = -reach; u <= reach; u += 1.5) {
      // (Straight across the road, easing into its bends beyond the bales.)
      const along = bend(u) * clamp((Math.abs(u) - this.track.edge - 1) / 8, 0, 1)
      const c = this.groundAt(s + along, u)
      for (const k of [-1, 1]) {
        pos.push(c.x + t.tx * k * w / 2, c.y + (Math.abs(u) < this.track.def.half + 0.5 ? 0.09 : 0.07), c.z + t.tz * k * w / 2)
        uv.push((k + 1) / 2, (u + reach) / (reach * 2))
      }
      if (n > 0) idx.push(2 * n - 2, 2 * n - 1, 2 * n, 2 * n - 1, 2 * n + 1, 2 * n)
      n++
    }
    const geo = this.bag.add(new BufferGeometry())
    geo.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
    geo.setAttribute('uv', new BufferAttribute(new Float32Array(uv), 2))
    geo.setIndex(idx)
    const water = new Mesh(geo, this.bag.add(new MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.9, side: DoubleSide, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 })))
    water.renderOrder = 4
    g.add(water)
    // The banks (off the road): pebbles and reeds.
    const rand = rng(Math.round(s))
    const bank: BufferGeometry[] = []
    for (let u = -reach + 2; u < reach - 2; u += 2.2) {
      if (Math.abs(u) < this.track.edge + 1.5) continue
      for (const k of [-1, 1]) {
        const c = this.groundAt(s + bend(u) * clamp((Math.abs(u) - this.track.edge - 1) / 8, 0, 1) + k * (w / 2 + 0.3), u)
        if (rand() < 0.65) bank.push(P.sphere(0.25 + rand() * 0.3, ['#B9B3CC', '#C9C3D8', '#A7A1BD'][Math.floor(rand() * 3)], { at: [c.x, c.y + 0.08, c.z], scale: [1.2, 0.6, 1] }, 7))
        if (rand() < 0.35) for (let j = 0; j < 3; j++) bank.push(P.cone(0.06, 1.0 + rand() * 0.6, '#6FAE6A', { at: [c.x + (rand() - 0.5) * 0.5, c.y + 0.5, c.z + (rand() - 0.5) * 0.5], rot: [(rand() - 0.5) * 0.3, 0, (rand() - 0.5) * 0.3] }, 5))
      }
    }
    if (this.track.def.id === 'forest') {
      // A frog on a stone in the stream, just off the road.
      const u = -(this.track.edge + 4)
      const c = this.groundAt(s + bend(u) * clamp((Math.abs(u) - this.track.edge - 1) / 8, 0, 1), u)
      bank.push(P.sphere(0.6, '#A7A1BD', { at: [c.x, c.y + 0.1, c.z], scale: [1.3, 0.55, 1.1] }, 9))
      bank.push(P.sphere(0.26, '#8CCB6A', { at: [c.x, c.y + 0.5, c.z], scale: [1.2, 0.8, 1] }, 10))
      for (const k of [-1, 1]) bank.push(P.sphere(0.09, '#8CCB6A', { at: [c.x + k * 0.12, c.y + 0.72, c.z + 0.08] }, 8), P.sphere(0.045, PAL.ink, { at: [c.x + k * 0.12, c.y + 0.76, c.z + 0.15] }, 6))
    }
    if (bank.length) g.add(solid(merge(bank), this.bag, 1.5))
    return g
  }

  /** The big old trees whose crowns meet over the road (the dark stretch), and the fireflies in their shade. */
  private bigTrees(s0: number, s1: number) {
    const g = new Group()
    const rand = rng(99)
    const parts: BufferGeometry[] = []
    const GREENS = ['#3E7B5E', '#4C8A66', '#2F6B52', '#5A9870']
    let side = 1
    for (let s = s0 - 6; s < s1 + 6; s += 7 + rand() * 4) {
      side = -side
      const lat = side * (this.track.edge + 2.4 + rand() * 2)
      const c = this.groundAt(s, lat)
      const H = 11 + rand() * 3
      const r = 0.75 + rand() * 0.3
      parts.push(P.cyl(r * 0.75, r, H, '#7A5A4E', { at: [c.x, c.y + H / 2, c.z] }, 9))
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + rand()
        parts.push(P.sphere(r * 0.9, '#7A5A4E', { at: [c.x + Math.cos(a) * r, c.y + 0.15, c.z + Math.sin(a) * r], scale: [1.4, 0.4, 1.4] }, 7))
      }
      // The crown reaches in over the road.
      for (let i = 0; i < 5; i++) {
        const inward = -side * (i * 1.9 + rand() * 1.5)
        const cc = this.groundAt(s + (rand() - 0.5) * 5, lat + inward)
        parts.push(P.sphere(3.2 + rand() * 1.8, GREENS[i % 4], { at: [cc.x, c.y + H + (rand() - 0.3) * 1.5, cc.z], scale: [1, 0.7, 1] }, 10))
      }
    }
    g.add(solid(merge(parts), this.bag, 2))
    // The fireflies: little glowing dots with a soft glow round them, in the shade either side of the road (and high
    // over it, out of the camera's way), blinking on and off.
    const N = 200
    const at: V3[] = []
    const phase: number[] = []
    for (let i = 0; i < N; i++) {
      const s = s0 + rand() * (s1 - s0)
      const over = rand() < 0.25
      const lat = over ? (rand() * 2 - 1) * this.track.def.half : (rand() < 0.5 ? 1 : -1) * (this.track.def.half + 2.5 + rand() * (this.track.def.grass + 5))
      const c = this.groundAt(s, lat)
      at.push([c.x, c.y + (over ? 5 + rand() * 3 : 0.4 + rand() * 3), c.z])
      phase.push(rand() * 20)
    }
    const dot = this.bag.add(merge([P.sphere(0.08, '#FFFFFF', {}, 6)]))
    const mesh = this.bag.add(new InstancedMesh(dot, this.bag.add(new MeshBasicMaterial({ color: '#F4FF8A', fog: false })), N))
    const glow = this.bag.add(merge([P.sphere(0.24, '#FFFFFF', {}, 8)]))
    const halo = this.bag.add(new InstancedMesh(glow, this.bag.add(new MeshBasicMaterial({ color: '#E9FF6A', fog: false, transparent: true, opacity: 0.3, depthWrite: false })), N))
    for (const m of [mesh, halo]) {
      m.frustumCulled = false
      g.add(m)
    }
    this.flies = { mesh, halo, at, phase }
    return g
  }

  // ---------------------------------------------------------------- the rice steps

  /** Stop Time Cafe's deck: up on stilts on the high side of the road, a pink-and-white striped awning, and people at
   *  the rail who jump and wave as she passes. */
  private deck(s: number) {
    const out = this.track.edge + 3.5
    // On whichever side the hill rises.
    const hi = [1, -1].map((k) => this.groundAt(s, k * (out + 3)).y)
    const side = hi[0] >= hi[1] ? 1 : -1
    const c = this.groundAt(s, side * (out + 2))
    const roadY = this.road.sampleAt(s).y
    const floor = Math.max(roadY + 3.2, c.y + 1.6)
    const g = new Group()
    g.position.set(c.x, floor, c.z)
    // Facing the road (local +z toward it).
    const t = this.road.sampleAt(s)
    g.rotation.y = Math.atan2(-side * t.lx, -side * t.lz)
    const W = 9
    const D = 4
    const parts: BufferGeometry[] = [P.rbox(W, 0.3, D, 0.08, '#C98A55', { at: [0, -0.15, 0] })]
    for (const x of [-W / 2 + 0.4, 0, W / 2 - 0.4])
      for (const z of [-D / 2 + 0.4, D / 2 - 0.4]) {
        const h = floor - Math.min(c.y, roadY) + 1
        parts.push(P.cyl(0.16, 0.18, h, '#9C653E', { at: [x, -h / 2, z] }, 7))
      }
    // The rail along the front and the sides, white.
    for (let x = -W / 2 + 0.3; x <= W / 2 - 0.2; x += 0.9) parts.push(P.cyl(0.05, 0.05, 0.9, '#FFFFFF', { at: [x, 0.45, D / 2 - 0.15] }, 5))
    parts.push(P.rbox(W, 0.1, 0.12, 0.04, '#FFFFFF', { at: [0, 0.92, D / 2 - 0.15] }))
    for (const k of [-1, 1]) parts.push(P.rbox(0.12, 0.1, D, 0.04, '#FFFFFF', { at: [k * (W / 2 - 0.1), 0.92, 0] }))
    // The awning over the back half, on four posts: pink and white stripes, a scalloped edge.
    for (const x of [-W / 2 + 0.3, W / 2 - 0.3]) for (const z of [-D / 2 + 0.2, 0.3]) parts.push(P.cyl(0.06, 0.06, 2.6, '#FFFFFF', { at: [x, 1.3, z] }, 6))
    for (let i = 0; i < 9; i++) parts.push(P.box(W / 9, 0.12, D * 0.75, i % 2 ? '#FFFFFF' : PAL.hotpink, { at: [-W / 2 + (i + 0.5) * (W / 9), 2.7, -D * 0.12], rot: [0.2, 0, 0] }))
    for (let i = 0; i < 18; i++) parts.push(P.sphere(0.22, i % 2 ? '#FFFFFF' : PAL.hotpink, { at: [-W / 2 + (i + 0.5) * (W / 18), 2.5, D * 0.26], scale: [1, 0.8, 0.4] }, 8))
    // A table with two coffee cups, behind the people.
    parts.push(P.cyl(0.5, 0.5, 0.06, '#FFFFFF', { at: [2.6, 0.75, -0.9] }, 14), P.cyl(0.06, 0.06, 0.75, '#FFFFFF', { at: [2.6, 0.37, -0.9] }, 6))
    for (const x of [2.4, 2.8]) parts.push(P.cyl(0.08, 0.07, 0.14, '#FFF3DC', { at: [x, 0.85, -0.85] }, 8))
    g.add(solid(merge(parts), this.bag, 2))
    // The people at the rail.
    const rigs = CROWD.map((look, i) => {
      const rig = buildAnimal(look, this.bag)
      rig.root.position.set(-3.4 + i * 1.6, 0, D / 2 - 0.75)
      g.add(rig.root)
      return rig
    })
    this.crowd = { rigs, s, cheer: 0, cheered: false }
    return g
  }

  /** A mother duck and her four ducklings waiting by the road for their moment to cross. */
  private buildDucks(s: number, side: number) {
    const g = new Group()
    const list: Duck[] = []
    for (let i = 0; i < 5; i++) {
      const big = i === 0
      const k = big ? 1.4 : 0.8
      const body = big ? '#FFFFFF' : '#FFE36A'
      const d = new Group()
      d.add(solid(merge([
        P.sphere(0.32 * k, body, { at: [0, 0.32 * k, 0], scale: [0.9, 0.8, 1.25] }, 12),
        P.sphere(0.2 * k, body, { at: [0, 0.68 * k, 0.24 * k] }, 10),
        P.cone(0.09 * k, 0.24 * k, '#FF9A3C', { at: [0, 0.64 * k, 0.46 * k], rot: [Math.PI / 2, 0, 0], scale: [1.3, 1, 0.5] }, 8),
        P.cone(0.12 * k, 0.22 * k, body, { at: [0, 0.4 * k, -0.4 * k], rot: [-1.0, 0, 0] }, 8),
        ...[-1, 1].map((x) => P.cyl(0.03 * k, 0.03 * k, 0.16 * k, '#FF9A3C', { at: [x * 0.1 * k, 0.07 * k, 0] }, 5)),
      ]), this.bag, 1.2))
      d.add(solid(merge([-1, 1].map((x) => P.sphere(0.035 * k, PAL.ink, { at: [x * 0.13 * k, 0.74 * k, 0.37 * k] }, 6))), this.bag, 0))
      d.add(blobShadow(0.35 * k, this.bag))
      g.add(d)
      list.push({ g: d, i })
    }
    const start = side * (this.track.edge + 2.5)
    this.ducks = { list, state: 'wait', lat: start, dir: -side, held: 0, s, flap: 0 }
    this.placeDucks(0, 0)
    return g
  }

  private placeDucks(t: number, hurry: number) {
    const D = this.ducks!
    const moving = D.state === 'cross'
    for (const d of D.list) {
      // In a line behind their mother (behind is back toward where they came from).
      const lat = D.lat - D.dir * d.i * 0.9 - (d.i > 0 ? D.dir * 0.4 : 0)
      const c = this.groundAt(D.s + (d.i % 2 ? 0.25 : -0.15), lat)
      const p = this.road.sampleAt(D.s)
      d.g.position.set(c.x, c.y + (moving ? Math.abs(Math.sin(t * (14 + hurry * 10) + d.i)) * 0.06 : 0), c.z)
      d.g.rotation.y = Math.atan2(D.dir * p.lx, D.dir * p.lz) + (D.state === 'done' ? Math.sin(t * 0.7 + d.i) * 0.8 : 0)
      d.g.rotation.z = moving ? Math.sin(t * (14 + hurry * 10) + d.i) * 0.16 : 0
      // Pecking when they're not walking.
      d.g.rotation.x = moving ? 0 : Math.max(0, Math.sin(t * 2.5 + d.i * 1.7)) * 0.35
      // Tapped: the mother flaps up, the ducklings hop.
      if (D.flap > 0) {
        const k = Math.sin((1 - D.flap) * Math.PI)
        d.g.position.y += k * (d.i === 0 ? 0.5 : 0.3) * Math.abs(Math.sin(t * 18 + d.i))
        d.g.scale.set(1 + 0.15 * k, 1 - 0.1 * k, 1)
      } else d.g.scale.set(1, 1, 1)
    }
  }

  /** Where the mother duck is (for her tap target), when the ducks are near the road. */
  duckAt() {
    const D = this.ducks
    return D ? D.list[0].g.position : null
  }
  /** A tap on the ducks: the mother flaps and quacks, the ducklings hop. */
  pokeDucks(ev: SceneryEvents) {
    if (!this.ducks) return
    this.ducks.flap = 1
    ev.quack()
  }

  /** The wobbly bamboo bridge: a deck of bamboo poles across the road over the stream, bamboo rails tied with twine. */
  private buildBridge(s: number) {
    const g = new Group()
    const c = this.road.sampleAt(s)
    g.position.set(c.x, c.y, c.z)
    const half = this.track.def.half + 0.4
    const local = (a: number, lat: number, y: number): V3 => {
      const p = this.road.sampleAt(s + a)
      return [p.x + p.lx * lat - c.x, p.y + y - c.y, p.z + p.lz * lat - c.z]
    }
    const deck: BufferGeometry[] = []
    const COLORS = ['#D8C77A', '#C9B865', '#E2D48C']
    let i = 0
    for (let a = -BRIDGE_LEN / 2; a <= BRIDGE_LEN / 2; a += 0.26) {
      const p = this.road.sampleAt(s + a)
      deck.push(P.cyl(0.11, 0.11, half * 2, COLORS[i++ % 3], { at: local(a, 0, 0.08), rot: [0, Math.atan2(p.tx, p.tz), Math.PI / 2] }, 8))
    }
    // Two long poles under the ends of the slats, along each side.
    for (const k of [-1, 1]) deck.push(this.pole(local(-BRIDGE_LEN / 2, k * (half - 0.3), -0.02), local(BRIDGE_LEN / 2, k * (half - 0.3), -0.02), 0.13, '#B9A55A'))
    const rails: BufferGeometry[] = []
    for (const k of [-1, 1]) {
      const posts: V3[] = []
      for (let a = -BRIDGE_LEN / 2; a <= BRIDGE_LEN / 2 + 0.01; a += BRIDGE_LEN / 6) {
        const foot = local(a, k * half, 0)
        posts.push(foot)
        rails.push(P.cyl(0.08, 0.09, 1.25, '#C9B865', { at: [foot[0], foot[1] + 0.62, foot[2]] }, 7))
        rails.push(P.sphere(0.1, '#9C7A4E', { at: [foot[0], foot[1] + 1.05, foot[2]], scale: [1, 0.6, 1] }, 6))
      }
      for (let j = 1; j < posts.length; j++)
        for (const y of [0.55, 1.05]) {
          const a = posts[j - 1]
          const b = posts[j]
          rails.push(this.pole([a[0], a[1] + y, a[2]], [b[0], b[1] + y, b[2]], 0.06, '#D8C77A'))
        }
    }
    const deckG = new Group()
    deckG.add(solid(merge(deck), this.bag, 1.5))
    const railG = new Group()
    railG.add(solid(merge(rails), this.bag, 1.5))
    g.add(deckG, railG)
    this.bridge = { deck: deckG, rails: railG, load: 0, wobble: 0, creak: 0 }
    return g
  }

  /** A pole (a cylinder) from a to b. */
  private pole(a: V3, b: V3, r: number, color: string) {
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const dz = b[2] - a[2]
    const len = Math.hypot(dx, dy, dz)
    const geo = P.cyl(r, r, len, color, {}, 7)
    const dir = [dx / len, dy / len, dz / len]
    // (Turn the cylinder's +y onto the direction.)
    const yaw = Math.atan2(dir[0], dir[2])
    const pitch = Math.acos(clamp(dir[1], -1, 1))
    geo.applyMatrix4(new Matrix4().makeRotationX(pitch))
    geo.applyMatrix4(new Matrix4().makeRotationY(yaw))
    geo.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2)
    return geo
  }

  /** A scarecrow out in a paddy: a pole, a straw-stuffed sack head with a stitched smile under a farmer's hat, a shirt
   *  on a crossbar whose arms wave when she goes by. */
  private scarecrow(s: number, side: number) {
    const lat = side * (this.track.edge + 2.4 + (Math.abs(Math.round(s)) % 2))
    const c = this.groundAt(s, lat)
    const g = new Group()
    g.position.set(c.x, c.y, c.z)
    g.scale.setScalar(1.4)
    const t = this.road.sampleAt(s)
    g.rotation.y = Math.atan2(-side * t.lx, -side * t.lz) + side * 0.5
    const shirt = [PAL.sky, PAL.pink, PAL.mint, PAL.butter, PAL.lavender][Math.abs(Math.round(s)) % 5]
    g.add(solid(merge([
      P.cyl(0.06, 0.07, 2.4, '#9C653E', { at: [0, 1.2, 0] }, 6),
      P.rbox(0.62, 0.7, 0.34, 0.12, shirt, { at: [0, 1.55, 0] }),
      P.sphere(0.3, '#E9D3A6', { at: [0, 2.15, 0] }, 12),
      P.cone(0.62, 0.32, '#E8C46A', { at: [0, 2.5, 0] }, 14),
      P.cone(0.14, 0.32, '#F2D27A', { at: [0, 1.06, 0], rot: [Math.PI, 0, 0] }, 7),
    ]), this.bag, 1.5))
    g.add(solid(merge([
      ...[-1, 1].map((x) => P.sphere(0.045, PAL.ink, { at: [x * 0.1, 2.2, 0.27] }, 6)),
      P.torus(0.1, 0.018, PAL.ink, { at: [0, 2.07, 0.27], rot: [0, 0, Math.PI] }, Math.PI),
      ...[-1, 1].map((x) => P.sphere(0.07, PAL.pink, { at: [x * 0.17, 2.08, 0.24], scale: [1, 0.6, 0.4] }, 6)),
    ]), this.bag, 0))
    const arms = new Group()
    arms.position.set(0, 1.75, 0)
    arms.add(solid(merge([
      P.cyl(0.04, 0.04, 1.9, '#9C653E', { rot: [0, 0, Math.PI / 2] }, 6),
      ...[-1, 1].map((x) => P.rbox(0.5, 0.26, 0.28, 0.1, shirt, { at: [x * 0.5, 0, 0] })),
      ...[-1, 1].map((x) => P.cone(0.1, 0.26, '#F2D27A', { at: [x * 0.96, 0, 0], rot: [0, 0, -x * Math.PI / 2] }, 6)),
    ]), this.bag, 1.5))
    g.add(arms)
    this.scarecrows.push({ arms, s, wave: 0, waved: false })
    return g
  }

  /** A water buffalo grazing in the next field: it looks up and moos as she goes by. */
  private grazer(s: number, side: number) {
    const lat = side * (this.track.edge + 5.5)
    const c = this.groundAt(s, lat)
    const b = buildBuffaloToy(this.bag)
    b.root.position.set(c.x, c.y, c.z)
    b.root.scale.setScalar(1.3)
    const t = this.road.sampleAt(s)
    b.root.rotation.y = Math.atan2(t.tx, t.tz) + side * 0.9
    this.grazers.push({ head: b.head, s, look: 0, mooed: false })
    return b.root
  }

  // ---------------------------------------------------------------- per frame

  /** The fastest a kart at `s` may go (m/s): slow while the ducks are crossing just ahead of it (Infinity: no limit). */
  hold(s: number) {
    const D = this.ducks
    if (!D || D.state !== 'cross' || D.held > 2.8) return Infinity
    const onRoad = D.list.some((d) => Math.abs(D.lat - D.dir * d.i * 0.9) < this.track.def.half + 1)
    return onRoad && s > D.s - 13 && s < D.s - 1.5 ? 1.5 : Infinity
  }

  update(dt: number, t: number, her: KartAt, karts: KartAt[], ev: SceneryEvents) {
    for (const w of this.water) w.offset.y -= dt * 0.5
    // The summit's flags fly in the wind (all one way, fluttering).
    this.summit.forEach((f, i) => (f.rotation.y = 0.6 + Math.sin(t * 3.3 + i * 0.8) * 0.22 + Math.sin(t * 8 + i) * 0.05))
    // ---- The fireflies blink and drift ----
    if (this.flies) {
      const { mesh, halo, at, phase } = this.flies
      for (let i = 0; i < at.length; i++) {
        const p = phase[i]
        const on = Math.max(0, Math.sin(t * (1.3 + (p % 1)) + p)) ** 2
        const sc = 0.25 + on * 1.1
        m4.makeScale(sc, sc, sc)
        m4.setPosition(at[i][0] + Math.sin(t * 0.6 + p) * 0.6, at[i][1] + Math.sin(t * 0.9 + p * 2) * 0.4, at[i][2] + Math.cos(t * 0.5 + p) * 0.6)
        mesh.setMatrixAt(i, m4)
        halo.setMatrixAt(i, m4)
      }
      mesh.instanceMatrix.needsUpdate = true
      halo.instanceMatrix.needsUpdate = true
    }
    // ---- The cafe's people jump and wave as she goes by ----
    if (this.crowd) {
      const C = this.crowd
      if (!C.cheered && her.s > C.s - 30) {
        C.cheered = true
        C.cheer = 4
        this.counts.cheers++
        ev.cheer()
      }
      C.cheer = Math.max(0, C.cheer - dt)
      C.rigs.forEach((rig, i) => {
        clearPose(rig)
        if (C.cheer > 0) {
          applyPose(rig, i % 2 ? 'cheer' : 'wave', t + i, Math.min(1, (4 - C.cheer) / 0.3))
          rig.root.position.y = Math.abs(Math.sin(t * 7 + i * 1.3)) * 0.25
        } else {
          rig.root.position.y = 0
          rig.head.rotation.y = Math.sin(t * 0.5 + i) * 0.4
        }
      })
    }
    // ---- The ducks ----
    if (this.ducks) {
      const D = this.ducks
      // (The far bank, across the road from where they started.)
      const far = D.dir * (this.track.edge + 2.5)
      let hurry = 0
      if (D.state === 'wait' && her.s > D.s - 40) {
        D.state = 'cross'
        ev.quack()
      }
      if (D.state === 'cross') {
        const waiting = karts.some((k) => this.hold(k.s) < Infinity)
        if (waiting) {
          if (D.held === 0) ev.quack()
          D.held += dt
          this.counts.duckWait += dt
          hurry = 1
        }
        D.lat += D.dir * dt * (hurry ? 7.5 : 3)
        // Across when the last duckling is on the far side.
        if (D.dir * (D.lat - D.dir * (D.list.length - 1) * 0.9 - far) > 0) {
          D.state = 'done'
          ev.quack()
        }
      }
      D.flap = Math.max(0, D.flap - dt / 0.6)
      this.placeDucks(t, hurry)
    }
    // ---- The bamboo bridge bounces under the karts ----
    if (this.bridge) {
      const B = this.bridge
      const n = karts.filter((k) => this.track.onBridge(k.s)).length
      if (n > B.load && n > 0) {
        B.wobble = 1
        if (this.track.onBridge(her.s) && B.creak <= 0) {
          ev.creak()
          B.creak = 0.6
        }
      }
      B.load = n
      B.creak -= dt
      B.wobble = Math.max(n ? 0.35 : 0, B.wobble - dt * 1.2)
      const w = Math.sin(t * 13) * 0.05 * B.wobble
      B.deck.position.y = w - 0.03 * Math.min(n, 2)
      B.rails.position.y = w * 1.6
      B.rails.rotation.z = Math.sin(t * 9) * 0.006 * B.wobble
    }
    // ---- The scarecrows wave at her ----
    for (const sc of this.scarecrows) {
      if (!sc.waved && her.s > sc.s - 28) {
        sc.waved = true
        sc.wave = 3
        this.counts.waves++
      }
      sc.wave = Math.max(0, sc.wave - dt)
      sc.arms.rotation.z = Math.sin(t * 9) * 0.35 * bell(sc.wave / 3) + Math.sin(t * 0.8 + sc.s) * 0.04
    }
    // ---- The buffalo graze, look up at her and moo ----
    for (const g of this.grazers) {
      const near = Math.abs(her.s - g.s) < 25
      if (near && !g.mooed) {
        g.mooed = true
        this.counts.moos++
        ev.moo()
      }
      g.look += ((near ? 1 : 0) - g.look) * Math.min(1, dt * 3)
      g.head.rotation.x = (1 - g.look) * (0.7 + Math.sin(t * 2.2 + g.s) * 0.08) - g.look * 0.15
    }
  }

  /** The forest's dark stretch dims everything but the fireflies (they stay bright: no fog, no light). */
  fireflyGlow(k: number) {
    if (!this.flies) return
    ;(this.flies.mesh.material as MeshBasicMaterial).color.copy(tmpColor.set('#F4FF8A').multiplyScalar(0.75 + 0.25 * k))
    ;(this.flies.halo.material as MeshBasicMaterial).opacity = 0.12 + 0.3 * k
  }
}

// The race lagoon's animals (race.ts), from simple shapes in the bay's toon look:
// - Elephant Beach: two elephants on the sand outside the right lobe (slate blue, pink ears, a gold and pink headdress
//   like the elephants at a Thai festival). As she comes up to them they curl their trunks up and spray a long arc of
//   water right over the course, with a rainbow in the mist; drive under it for a shower (race.ts gives her a sparkly
//   little boost). Tap one: it trumpets, hops and sprays at once.
// - Dolphin Run: three pink dolphins (Thailand has real ones) wait at the start of the long left side, leaping, then
//   race along beside her boat outside the rope, jumping in arcs and splashing down. Tap one: a big flip and a chirp.
import { DoubleSide, Group, Mesh, MeshBasicMaterial, Object3D, TorusGeometry, Vector3, type BufferGeometry } from 'three'
import { clamp } from '../../../../../../sdk'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { swell } from '../../../../../engine3d/water'
import { sfx } from '../../../sfx'
import { palm, RAINBOW } from './scenery'
import { ahead, DOLPHIN_RUN, ELEPHANTS, halfAt, spotAt } from './track'

const tmp = new Vector3()
/** The spray's fall (the race's spray particles, Particles' default). */
const G = 14

/** What the animals throw on the water: the race's own particles. */
export interface Splasher {
  /** One drop of water flying (x, y, z), moving (vx, vy, vz). */
  drop(x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number, size: number): void
  /** A splash ring on the water. */
  ring(x: number, z: number, r: number): void
}

// ---------------------------------------------------------------- the elephants

const HIDE = '#9FB0D3'
const HIDE_DARK = '#8496BE'
const EAR = '#FFB3CF'
const SEGS = 4
const SEG_LEN = 0.62

interface Elephant {
  root: Group
  body: Group
  head: Group
  ears: Group[]
  trunk: Group[]
  tip: Object3D
  s: number
  /** 0..1: the trunk curled up (spraying). */
  up: number
  /** Seconds left of a tapped spray, and of the hop. */
  poked: number
  hop: number
  /** Spraying now, and how long it has been. */
  on: boolean
  onT: number
  /** The rainbow in its mist, and its bands' materials (they fade). */
  rainbow: Group
  bands: MeshBasicMaterial[]
  /** Where its spray comes down (world). */
  land: Vector3
  phase: number
}

function buildElephant(bag: Bag, k: number): Omit<Elephant, 's' | 'rainbow' | 'bands' | 'land'> {
  const root = new Group()
  const body = new Group()
  root.add(body)
  // The body, the legs, the little tail (facing +z, the course).
  body.add(
    solid(
      merge([
        P.sphere(1.7, HIDE, { at: [0, 2.3, 0], scale: [1, 0.92, 1.25] }, 16),
        ...[-1, 1].flatMap((x) => [-1, 1].map((z) => P.cyl(0.5, 0.55, 1.7, HIDE, { at: [x * 0.85, 0.85, z * 0.95] }, 10))),
        ...[-1, 1].flatMap((x) => [-1, 1].map((z) => P.cyl(0.56, 0.56, 0.18, '#F4EDE4', { at: [x * 0.85, 0.08, z * 0.95 + 0.06] }, 10))),
        P.cyl(0.06, 0.05, 1, HIDE_DARK, { at: [0, 2.2, -2.1], rot: [-0.5, 0, 0] }, 5),
        P.sphere(0.16, HIDE_DARK, { at: [0, 1.75, -2.35] }, 6),
        // A blanket on its back: pink with a gold edge.
        P.cyl(1.25, 1.35, 0.14, k ? PAL.mint : PAL.hotpink, { at: [0, 3.75, -0.2], scale: [1, 1, 1.1] }, 16),
        P.cyl(1.38, 1.38, 0.08, PAL.gold, { at: [0, 3.68, -0.2], scale: [1, 1, 1.1] }, 16),
      ]),
      bag,
      2,
    ),
  )
  // The head (it nods), its headdress, its face.
  const head = new Group()
  head.position.set(0, 3.1, 1.85)
  body.add(head)
  head.add(
    solid(
      merge([
        P.sphere(1.2, HIDE, { scale: [1, 0.95, 0.95] }, 16),
        // The festival headdress on its forehead: a gold and pink cloth with a tassel.
        P.sphere(0.62, PAL.gold, { at: [0, 0.55, 0.78], scale: [1, 1.1, 0.35] }, 12),
        P.sphere(0.42, k ? PAL.mint : PAL.hotpink, { at: [0, 0.55, 0.92], scale: [1, 1.1, 0.3] }, 10),
        P.sphere(0.16, PAL.gold, { at: [0, -0.05, 1.02] }, 6),
        ...[-1, 1].map((s) => P.sphere(0.15, PAL.ink, { at: [s * 0.46, 0.18, 0.98] }, 8)),
        ...[-1, 1].map((s) => P.sphere(0.05, '#FFFFFF', { at: [s * 0.42, 0.24, 1.11] }, 5)),
        ...[-1, 1].map((s) => P.sphere(0.16, '#FF9DB8', { at: [s * 0.72, -0.12, 0.84], scale: [1, 0.6, 0.4] }, 6)),
      ]),
      bag,
      2,
    ),
  )
  // Big ears on their own pivots (they flap), pink inside.
  const ears = [-1, 1].map((s) => {
    const g = new Group()
    g.position.set(s * 0.95, 0.15, -0.1)
    g.add(solid(merge([P.sphere(1, HIDE, { at: [s * 0.55, 0, 0], scale: [1, 1.1, 0.2] }, 12), P.sphere(0.72, EAR, { at: [s * 0.58, -0.02, 0.14], scale: [1, 1.05, 0.12] }, 10)]), bag, 2))
    head.add(g)
    return g
  })
  // The trunk: a chain of joints from the face down (each on its own pivot, so it curls up to spray).
  const trunk: Group[] = []
  let parent: Object3D = head
  for (let i = 0; i < SEGS; i++) {
    const g = new Group()
    if (i === 0) g.position.set(0, -0.3, 1.05)
    else g.position.set(0, -SEG_LEN, 0)
    const r0 = 0.36 - i * 0.05
    g.add(solid(merge([P.cyl(r0 - 0.04, r0, SEG_LEN + 0.12, HIDE, { at: [0, -SEG_LEN / 2, 0] }, 10), ...(i === SEGS - 1 ? [P.cyl(r0 - 0.02, r0 - 0.04, 0.12, HIDE_DARK, { at: [0, -SEG_LEN - 0.02, 0] }, 10)] : [])]), bag, 1.5))
    parent.add(g)
    trunk.push(g)
    parent = g
  }
  const tip = new Object3D()
  tip.position.set(0, -SEG_LEN - 0.1, 0)
  parent.add(tip)
  return { root, body, head, ears, trunk, tip, up: 0, poked: 0, hop: 0, on: false, onT: 0, phase: k * 2.7 }
}

export class Elephants {
  readonly root = new Group()
  readonly list: Elephant[] = []

  constructor(bag: Bag) {
    ELEPHANTS.forEach((e, k) => {
      const p = spotAt(e.s, e.lat)
      const el = buildElephant(bag, k)
      // Facing the course (its left, the island's way).
      el.root.position.set(p.x, 0.5, p.z)
      el.root.rotation.y = p.heading + Math.PI / 2
      this.root.add(el.root)
      // Its beach: a sandy spit with palms and a few shells.
      const beach: BufferGeometry[] = [P.cyl(7.5, 8.2, 1, '#FBE7B8', { at: [p.x, 0, p.z], scale: [1, 1, 1] }, 18)]
      const out = spotAt(e.s, e.lat - 4.5)
      beach.push(...palm(out.x + 2, out.z - 2, 7, 1 + k, 0.5), ...palm(out.x - 3, out.z + 2.5, 6, 3 + k, 0.5))
      for (let i = 0; i < 4; i++) beach.push(P.sphere(0.25, i % 2 ? '#FFC2A8' : '#FFFFFF', { at: [p.x + Math.cos(i * 1.7) * 5.5, 0.5, p.z + Math.sin(i * 1.7) * 5.5], scale: [1, 0.5, 1] }, 6))
      this.root.add(solid(merge(beach), bag, 2))
      // The rainbow in the mist over its spray: six thin bands, see-through, only while it sprays. (Its arc stands
      // across the course, from the beach to where the water comes down.)
      const land = spotAt(e.s, 4)
      const span = Math.hypot(land.x - p.x, land.z - p.z)
      const rainbow = new Group()
      rainbow.position.set((land.x + p.x) / 2, 0, (land.z + p.z) / 2)
      rainbow.rotation.y = p.heading
      rainbow.visible = false
      const bands = RAINBOW.map((c) => bag.add(new MeshBasicMaterial({ color: c, transparent: true, opacity: 0, depthWrite: false, side: DoubleSide })))
      bands.forEach((m, i) => rainbow.add(new Mesh(bag.add(new TorusGeometry(span * 0.52 - i * 0.45, 0.22, 4, 40, Math.PI)), m)))
      this.root.add(rainbow)
      this.list.push({ ...el, s: e.s, rainbow, bands, land: new Vector3(land.x, 0, land.z) })
    })
  }

  /** Tapped: a trumpet, a hop and a big spray at once. */
  poke(i: number) {
    const e = this.list[i]
    if (!e) return
    sfx.trumpet()
    e.poked = 3
    e.hop = 0.6
  }

  /** Is an elephant's spray coming down on (s, lat) now? */
  showering(s: number, lat: number) {
    return this.list.some((e) => e.on && e.onT > 0.8 && Math.abs(ahead(e.s, s)) < 3.6 && lat > -halfAt(s) - 1 && lat < 7)
  }

  /** Where its tap target sits (world). */
  head(i: number, out: Vector3) {
    return this.list[i].head.getWorldPosition(out)
  }

  /** `her`: how far along the course she is (they spray as she comes up to them). */
  update(dt: number, t: number, her: number, water: Splasher) {
    for (const e of this.list) {
      const toHer = ahead(her, e.s)
      // Spraying while she's coming up to it and passing under (and now and then anyway, and when tapped).
      const near = toHer > -10 && toHer < 55
      const idle = Math.sin(t * 0.9 + e.phase) > 0.75
      const was = e.on
      e.poked = Math.max(0, e.poked - dt)
      e.on = near || idle || e.poked > 0
      if (e.on && !was) {
        e.onT = 0
        if (near) sfx.trumpet()
      }
      e.onT += dt
      e.up += ((e.on ? 1 : 0) - e.up) * (1 - Math.exp(-dt / 0.35))
      // The trunk: hanging and swaying, or curled up to point over the course.
      const sway = Math.sin(t * 1.6 + e.phase) * 0.12
      e.trunk.forEach((g, i) => (g.rotation.x = -(0.1 + i * 0.05) * (1 - e.up) - 0.62 * e.up + sway * (1 - e.up) * (i + 1) * 0.3))
      e.ears.forEach((g, i) => (g.rotation.y = (i ? -1 : 1) * (0.15 + Math.sin(t * (e.on ? 7 : 2.2) + e.phase) * (e.on ? 0.35 : 0.18))))
      e.head.rotation.x = -0.12 * e.up + Math.sin(t * 1.1 + e.phase) * 0.04
      e.hop = Math.max(0, e.hop - dt)
      const hop = e.hop > 0 ? Math.sin((1 - e.hop / 0.6) * Math.PI) : 0
      e.root.position.y = 0.5 + hop * 0.9
      e.body.scale.set(1 + Math.sin(t * 2 + e.phase) * 0.015, 1 - Math.sin(t * 2 + e.phase) * 0.015 + hop * 0.06, 1)
      // The water: drops from the trunk's tip, thrown so they come down across the course (a little spread).
      if (e.on && e.up > 0.7) {
        e.tip.getWorldPosition(tmp)
        const n = dt * (e.poked > 0 ? 110 : 75)
        for (let k = 0; k < n || (k === 0 && Math.random() < n); k++) {
          const T = 1.25 + (Math.random() - 0.5) * 0.35
          const lx = e.land.x + (Math.random() - 0.5) * 5
          const lz = e.land.z + (Math.random() - 0.5) * 5
          water.drop(tmp.x, tmp.y, tmp.z, (lx - tmp.x) / T, (0 - tmp.y + 0.5 * G * T * T) / T, (lz - tmp.z) / T, T + 0.1, 0.26 + Math.random() * 0.2)
        }
        if (Math.random() < dt * 8) water.ring(e.land.x + (Math.random() - 0.5) * 4, e.land.z + (Math.random() - 0.5) * 4, 1.6)
      }
      // Its rainbow fades in and out with the spray.
      const want = e.on && e.onT > 0.6 ? 0.42 : 0
      const cur = e.bands[0].opacity
      const next = cur + (want - cur) * (1 - Math.exp(-dt / 0.5))
      for (const m of e.bands) m.opacity = next
      e.rainbow.visible = next > 0.01
    }
  }
}

// ---------------------------------------------------------------- the pink dolphins

const PINK = '#FFA8C6'
const BELLY = '#FFE3EC'

function buildDolphin(bag: Bag) {
  const root = new Group()
  const body = new Group()
  root.add(body)
  // Along +z: the body, the beak, the fin, the flippers; the tail (flukes) on its own pivot.
  body.add(
    solid(
      merge([
        P.capsule(0.52, 1.5, PINK, { rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.92] }),
        P.capsule(0.4, 1.2, BELLY, { at: [0, -0.18, 0.1], rot: [Math.PI / 2, 0, 0], scale: [1, 0.8, 0.9] }),
        P.sphere(0.46, PINK, { at: [0, 0.12, 1.05], scale: [1, 0.95, 1] }, 12),
        P.capsule(0.15, 0.4, PINK, { at: [0, -0.05, 1.62], rot: [Math.PI / 2, 0, 0] }),
        P.prism([[0, 0], [0.7, 0], [0.15, 0.75]], 0.12, '#FF8FB6', { at: [0, 0.42, -0.3], rot: [0, -Math.PI / 2, 0] }),
        ...[-1, 1].map((s) => P.capsule(0.1, 0.42, '#FF8FB6', { at: [s * 0.52, -0.25, 0.55], rot: [0.9, 0, s * 1.05] })),
        ...[-1, 1].map((s) => P.sphere(0.09, PAL.ink, { at: [s * 0.32, 0.22, 1.32] }, 6)),
        ...[-1, 1].map((s) => P.sphere(0.03, '#FFFFFF', { at: [s * 0.33, 0.26, 1.39] }, 4)),
        ...[-1, 1].map((s) => P.sphere(0.09, '#FF7FA8', { at: [s * 0.36, 0.02, 1.36], scale: [1, 0.6, 0.6] }, 5)),
      ]),
      bag,
      2,
    ),
  )
  const tail = new Group()
  tail.position.set(0, 0, -1.2)
  tail.add(solid(merge([P.cone(0.32, 0.9, PINK, { at: [0, 0, -0.35], rot: [-Math.PI / 2, 0, 0] }, 10), P.prism([[0, 0], [0.75, -0.45], [0.55, 0.05], [0, -0.1], [-0.55, 0.05], [-0.75, -0.45]], 0.1, '#FF8FB6', { at: [0, 0, -0.75], rot: [-Math.PI / 2, 0, 0] })]), bag, 2))
  body.add(tail)
  root.scale.setScalar(1.15)
  return { root, body, tail }
}

interface Dolphin {
  root: Group
  body: Group
  tail: Group
  /** Where it is along the course and across it, and its own place round her. */
  s: number
  lat: number
  off: number
  /** Its jump: 0..1 through one leap (the first part under the water), and how long a leap lasts. */
  leap: number
  period: number
  /** A tapped flip on its next leap. */
  flip: boolean
  flipping: boolean
  was: boolean
}

export class Dolphins {
  readonly root = new Group()
  readonly list: Dolphin[] = []
  /** She has met them this lap (race.ts cheers the first time). */
  met = false

  constructor(bag: Bag) {
    ;[
      { off: 7, lat: 3.5, period: 1.5 },
      { off: 1, lat: 6, period: 1.7 },
      { off: -5, lat: 4.5, period: 1.6 },
    ].forEach((d, i) => {
      const b = buildDolphin(bag)
      this.root.add(b.root)
      this.list.push({ ...b, s: DOLPHIN_RUN.from + 6 - i * 4, lat: -(halfAt(DOLPHIN_RUN.from) + d.lat), off: d.off, leap: i * 0.33, period: d.period, flip: false, flipping: false, was: false })
    })
  }

  /** Tapped: a big flip on its next leap, and a chirp. */
  poke(i: number) {
    const d = this.list[i]
    if (!d) return
    sfx.dolphin()
    d.flip = true
  }

  /** Where its tap target sits (world). */
  at(i: number, out: Vector3) {
    return this.list[i].root.getWorldPosition(out)
  }

  /** Is she alongside them now (on Dolphin Run)? */
  alongside(her: number) {
    const a = ahead(DOLPHIN_RUN.from, her)
    return a > 0 && a < DOLPHIN_RUN.to - DOLPHIN_RUN.from
  }

  /** `her`: how far along she is, and how fast she's going (they keep up with her, a little faster). */
  update(dt: number, t: number, her: number, speed: number, water: Splasher) {
    const run = DOLPHIN_RUN.to - DOLPHIN_RUN.from
    const along = ahead(DOLPHIN_RUN.from, her)
    for (const d of this.list) {
      // Beside her while she's on the run; waiting at its start before (and at its end after, until she's far away).
      const want = along < -60 || along > run + 80 ? 4 + d.off : clamp(along + d.off + Math.sin(t * 0.4 + d.off) * 3, 2, run + 12)
      const cur = ahead(DOLPHIN_RUN.from, d.s)
      const step = clamp(want - cur, -30 * dt, Math.max(speed * 1.25, 8) * dt)
      d.s = DOLPHIN_RUN.from + cur + step
      const lane = -(halfAt(d.s) + 3.5 + Math.abs(d.off) * 0.35)
      d.lat += (lane - d.lat) * (1 - Math.exp(-dt / 0.6))
      // One leap: a while under the water, then up in an arc and back in (a flip leaps higher and rolls right over).
      d.leap += dt / (d.flipping ? d.period * 1.5 : d.period)
      if (d.leap >= 1) {
        d.leap -= 1
        d.flipping = d.flip
        d.flip = false
      }
      const under = 0.35
      const up = d.leap > under ? (d.leap - under) / (1 - under) : -1
      const high = d.flipping ? 4.2 : 1.8
      const p = spotAt(d.s, d.lat)
      const sw = swell(p.x, p.z, t)
      const y = up >= 0 ? sw - 0.3 + Math.sin(up * Math.PI) * high : sw - 1.6
      d.root.position.set(p.x, y, p.z)
      d.root.rotation.y = p.heading
      // Nose up going up, nose down coming down (a flip turns right over).
      d.body.rotation.x = up >= 0 ? (d.flipping ? -up * Math.PI * 2 : 0) - Math.cos(up * Math.PI) * 0.75 : 0
      d.tail.rotation.x = Math.sin(t * 9 + d.off) * 0.35
      d.root.visible = up >= 0 || y > -1.2
      // Splashes in and out.
      const out = up >= 0 && up < 0.95
      if (out !== d.was) {
        water.ring(p.x, p.z, 1.4)
        for (let i = 0; i < 8; i++) water.drop(p.x, 0.2, p.z, (Math.random() - 0.5) * 3, 2 + Math.random() * 2.5, (Math.random() - 0.5) * 3, 0.7, 0.24)
        if (Math.abs(ahead(her, d.s)) < 25 && Math.random() < 0.5) sfx.plop()
      }
      d.was = out
    }
  }
}

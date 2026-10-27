// The cave and the hong (sections `cave` and `hong`). The longtail is too big for the cave, so at the raft by its mouth
// the family climbs into a little yellow sea canoe (real: Phang Nga's hidden lagoons are reached by canoe through low
// caves, lying flat). Kaylee steers from the back, Daddy paddles in front.
// - In the tunnel it's dark and dripping: bats hang from the roof (tap: they squeak and swirl), stalactites drip
//   (tap: plink, and the cave answers with an echo). The roof comes lower and lower: tap the family to lie them back
//   in the canoe. If she doesn't, Daddy's horn bonks the roof first (he's the tallest): boink! "My horn!"
// - Then light, and they slide out into the hong ("room" in Thai): a lagoon open to the sky inside the island, ringed by
//   cliffs and mangroves on their roots. Fiddler crabs wave their big claw (tap: they wave back), mudskippers hop on
//   the mud, a monitor lizard swims past like a little crocodile, a kingfisher flashes blue. Daddy snaps a photo.
// - Paddle back out and everyone hops back into the longtail.
import { Group, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3, type BufferGeometry, type PerspectiveCamera } from 'three'
import { bell, clamp } from '../../../../../../sdk'
import type { AnchorInfo } from '../../../../../engine3d/Anchors'
import type { Shot } from '../../../../../engine3d/camera'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { photoCamera } from '../../../../../engine3d/photo'
import { swell } from '../../../../../engine3d/water'
import { L } from '../../../lines'
import { sfx } from '../../../sfx'
import type { BoatSection } from '../sections'
import type { Bay } from './bay'
import { buildBird, buildCrab, buildLizard, buildMudskipper, type Bird, type Crab, type Fish, type Lizard } from './critters'
import { CANOE_START, CAVE_GLOW, EXIT_GLOW, HONG, LONGTAIL_PARK, RING, TUNNEL, tunnelRoof } from './layout'
import type { BayPart, Box, Circle, PhotoKind, Rider, Spot } from './part'
import { JUNGLE, JUNGLE_DARK, NOTCH, ROCK, tower } from './scenery'

export const CAVE_ANCHORS: AnchorInfo[] = [
  { id: 'bats', label: 'Bats', kind: 'thing' },
  ...[0, 1, 2].map((i): AnchorInfo => ({ id: `drip:${i}`, label: 'Dripping stalactite', kind: 'thing' })),
  { id: 'crab', label: 'Fiddler crabs', kind: 'thing' },
  { id: 'mudskipper', label: 'Mudskippers', kind: 'thing' },
  { id: 'lizard', label: 'Monitor lizard', kind: 'thing' },
  { id: 'kingfisher', label: 'Kingfisher', kind: 'thing' },
  { id: 'mangrove', label: 'Mangrove tree', kind: 'thing' },
]

const CAVE = '#6A5F7C'
/** Where a unicorn's horn tip is above their seat, sitting (a fraction of their height). */
const HORN = 1.09
const deg = Math.PI / 180
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
const tmp = new Vector3()

/** The mud bank in the hong, where the crabs and mudskippers live. */
const BANK = { x: HONG.x - 7, z: HONG.z - 6 }
/** The stalactites she can tap (z along the tunnel, x across it). */
const DRIPS = [
  { z: TUNNEL.z0 - (TUNNEL.z0 - TUNNEL.z1) * 0.1, x: -0.7 },
  { z: TUNNEL.z0 - (TUNNEL.z0 - TUNNEL.z1) * 0.3, x: 0.75 },
  { z: TUNNEL.z0 - (TUNNEL.z0 - TUNNEL.z1) * 0.9, x: -0.6 },
]
const BATS_Z = TUNNEL.z0 - (TUNNEL.z0 - TUNNEL.z1) * 0.2
/** The way out of the hong: the tunnel's inner mouth (its glow, layout's EXIT_GLOW). */
const EXIT = new Vector3(EXIT_GLOW.x, 0, EXIT_GLOW.z)
/** Where the hong's camera stands (up on the north side of the lagoon). */
const HONG_CAM = new Vector3(HONG.x + 2, 8, HONG.z - 11)
/** A mangrove to tap (on the far side, facing the tunnel's opening). */
const MANGROVE = new Vector3(HONG.x + Math.sin(Math.PI + 0.3) * (HONG.inner - 1.5), 2.2, HONG.z + Math.cos(Math.PI + 0.3) * (HONG.inner - 1.5))
const PERCH = new Vector3(HONG.x + Math.sin(2.2) * (HONG.inner - 1.6), 2.4, HONG.z + Math.cos(2.2) * (HONG.inner - 1.6))

type Where = 'open' | 'tunnel' | 'hong'

export class CaveStop implements BayPart {
  /** The cave's glow only takes her once she has driven away from it again. */
  armed = true
  private bats: Group[] = []
  private batT = -1
  private batsSeen = false
  private drips: { g: Group; drop: Group; t: number; next: number }[] = []
  private crabs: Crab[]
  private crabWave = -1
  private skippers: Fish[]
  private skipT = [-1, -1]
  private lizard: Lizard
  private lizardA = 1
  private tongueT = -1
  private kingfisher: Bird
  private kingT = -1
  private hongT = -1
  /** Which way the hong's camera faces (degrees), kept while the canoe passes right under it. */
  private hongYaw = 180
  private factAt = -99
  private paddleT = 0

  constructor(private bay: Bay) {
    const { bag, scene } = bay
    // ---- The hong's ring of cliffs ----
    scene.add(solid(merge(RING.flatMap((r) => tower(r))), bag, 2.5))
    // ---- The tunnel: a ceiling that comes down low (drips hang from it), dark walls, dark water ----
    const ceiling: BufferGeometry[] = []
    const w = TUNNEL.half * 2 + 0.8
    const top = HONG.h - 2
    for (let z = TUNNEL.z1; z < TUNNEL.z0; z += 0.8) {
      const low = tunnelRoof(z + 0.4)
      // Dark underneath (what she sees from inside), rock above, jungle on top.
      // Bands of darker and lighter rock along the underside.
      ceiling.push(P.box(w, 0.6, 0.82, Math.round(z / 0.8) % 3 ? CAVE : '#7D7090', { at: [TUNNEL.x, low + 0.3, z + 0.4] }))
      ceiling.push(P.box(w, top - low - 0.6, 0.82, ROCK, { at: [TUNNEL.x, low + 0.6 + (top - low - 0.6) / 2, z + 0.4] }))
      if (Math.round(z / 0.8) % 2 === 0) ceiling.push(P.cone(0.12, 0.45, NOTCH, { at: [TUNNEL.x + ((z * 7) % 1.6) - 0.8, low - 0.2, z + 0.4], rot: [Math.PI, 0, 0] }, 6))
    }
    // Jungle on top: round bushes, like the towers' caps (a flat green slab showed from the hong's camera).
    for (let z = TUNNEL.z1 + 1.5; z < TUNNEL.z0; z += 3) ceiling.push(P.sphere(2.6, Math.round(z) % 2 ? JUNGLE : JUNGLE_DARK, { at: [TUNNEL.x + Math.sin(z) * 0.8, top + 0.4, z], scale: [1.3, 0.55, 1] }, 10))
    // Smooth dark walls (the columns behind them are lumpy).
    for (const s of [-1, 1]) ceiling.push(P.box(0.4, HONG.h - 2, TUNNEL.z0 - TUNNEL.z1, CAVE, { at: [TUNNEL.x + s * (TUNNEL.half + 0.2), (HONG.h - 2) / 2, (TUNNEL.z0 + TUNNEL.z1) / 2] }))
    scene.add(solid(merge(ceiling), bag, 2))
    const dark = new Mesh(bag.add(new PlaneGeometry(TUNNEL.half * 2, TUNNEL.z0 - TUNNEL.z1)), bag.add(new MeshBasicMaterial({ color: '#3F5E66', polygonOffset: true, polygonOffsetFactor: -2 })))
    dark.rotation.x = -Math.PI / 2
    dark.position.set(TUNNEL.x, 0.01, (TUNNEL.z0 + TUNNEL.z1) / 2)
    scene.add(dark)
    // ---- The stalactites she can tap, each with its drop ----
    for (const s of DRIPS) {
      const g = new Group()
      const roof = tunnelRoof(s.z)
      g.position.set(TUNNEL.x + s.x, roof, s.z)
      g.add(solid(merge([P.cone(0.2, 0.75, '#8E829F', { at: [0, -0.37, 0], rot: [Math.PI, 0, 0] }, 8), P.cone(0.1, 0.3, '#B9AEC9', { at: [0.18, -0.15, 0.05], rot: [Math.PI, 0, 0] }, 6)]), bag, 1.5))
      const drop = new Group()
      drop.add(solid(P.sphere(0.07, '#BFE9FF', { scale: [1, 1.4, 1] }, 8), bag, 1))
      drop.visible = false
      scene.add(g, drop)
      this.drips.push({ g, drop, t: -1, next: 2 + Math.random() * 4 })
    }
    // ---- Bats hanging from the roof ----
    for (let i = 0; i < 5; i++) {
      const g = new Group()
      g.scale.setScalar(0.8)
      g.add(
        solid(
          merge([
            P.sphere(0.13, '#5E5470', { scale: [1, 1.3, 0.9] }, 10),
            ...[-1, 1].map((s) => P.cone(0.05, 0.1, '#5E5470', { at: [s * 0.06, -0.17, 0], rot: [Math.PI, 0, 0] }, 6)),
            ...[-1, 1].map((s) => P.sphere(0.12, '#7A6E8E', { at: [s * 0.13, 0.02, 0], scale: [0.5, 1.2, 0.3] }, 8)),
            ...[-1, 1].map((s) => P.sphere(0.025, '#FFFFFF', { at: [s * 0.045, -0.06, 0.11] }, 6)),
            ...[-1, 1].map((s) => P.sphere(0.022, '#FF9DB8', { at: [s * 0.08, -0.1, 0.09] }, 6)),
          ]),
          bag,
          1.5,
        ),
      )
      this.bats.push(g)
      scene.add(g)
    }
    this.restBats()

    // ---- Inside the hong: mangroves standing on their roots round the edge, and the mud bank ----
    const mangroves: BufferGeometry[] = []
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + 0.3
      if (Math.abs(Math.sin(a)) < 0.3 && Math.cos(a) > 0) continue // keep the tunnel's opening clear
      const x = HONG.x + Math.sin(a) * (HONG.inner - 1.5)
      const z = HONG.z + Math.cos(a) * (HONG.inner - 1.5)
      // Arching roots down into the water, a trunk, a round green crown.
      for (const s of [-1, -0.35, 0.35, 1]) mangroves.push(P.cyl(0.06, 0.08, 1.5, '#8C6A55', { at: [x + s * 0.45, 0.55, z + s * 0.1], rot: [s * 0.2, 0, s * 0.45] }, 5))
      mangroves.push(P.cyl(0.12, 0.15, 1.2, '#8C6A55', { at: [x, 1.6, z] }, 6))
      mangroves.push(P.sphere(1.6, i % 2 ? JUNGLE : JUNGLE_DARK, { at: [x, 2.7, z], scale: [1, 0.7, 1] }, 9))
    }
    mangroves.push(P.cyl(5, 5.5, 0.4, '#B98E6E', { at: [BANK.x, 0.05, BANK.z], scale: [1, 1, 0.6] }, 14))
    scene.add(solid(merge(mangroves), bag, 2))
    // ---- Its animals ----
    this.crabs = [0, 1, 2].map((i) => {
      const c = buildCrab(bag)
      c.root.position.set(BANK.x - 2 + i * 1.8, 0.25, BANK.z + 1.4 - (i % 2) * 0.8)
      c.root.rotation.y = 0.6
      c.root.scale.setScalar(2)
      scene.add(c.root)
      return c
    })
    this.skippers = [0, 1].map((i) => {
      const m = buildMudskipper(bag)
      m.root.position.set(BANK.x + 1.5 + i * 1.6, 0.25, BANK.z - 1 + i * 0.6)
      m.root.rotation.y = 1.2 + i
      m.root.scale.setScalar(2.2)
      scene.add(m.root)
      return m
    })
    this.lizard = buildLizard(bag)
    this.lizard.root.scale.setScalar(1.6)
    scene.add(this.lizard.root)
    this.kingfisher = buildBird(bag, 'kingfisher')
    this.kingfisher.root.scale.setScalar(2.4)
    this.kingfisher.root.position.copy(PERCH)
    scene.add(this.kingfisher.root)
  }

  private get canoe() {
    return this.bay.rides.canoe
  }

  /** A link straight into the canoe: at the cave's mouth, or already in the hong. */
  begin(s: 'cave' | 'hong') {
    const bay = this.bay
    const { longtail, canoe } = bay.rides
    longtail.d.place(LONGTAIL_PARK.x, LONGTAIL_PARK.z, LONGTAIL_PARK.heading)
    if (s === 'hong') canoe.d.place(HONG.x, HONG.z + 4, Math.PI)
    else canoe.d.place(CANOE_START.x, CANOE_START.z, CANOE_START.heading)
    bay.setUsing('canoe')
    this.armed = false
    bay.seatAll(canoe)
  }

  // ---------------------------------------------------------------- where the canoe is

  /** In or near the tunnel (the canoe goes only along it there): 'in', 'mouth', 'inner', or null. */
  private funnel(): 'in' | 'mouth' | 'inner' | null {
    const d = this.canoe.d
    const off = Math.abs(d.x - TUNNEL.x)
    if (off < TUNNEL.half + 0.6 && d.z <= TUNNEL.z0 + 0.3 && d.z >= TUNNEL.z1 - 0.3) return 'in'
    if (off < 6 && d.z > TUNNEL.z0 && d.z < TUNNEL.z0 + 7) return 'mouth'
    if (off < 6 && d.z < TUNNEL.z1 && d.z > TUNNEL.z1 - 7) return 'inner'
    return null
  }
  where(): Where {
    if (this.bay.using !== 'canoe') return 'open'
    const d = this.canoe.d
    if (this.funnel() === 'in') return 'tunnel'
    return Math.hypot(d.x - HONG.x, d.z - HONG.z) < HONG.inner ? 'hong' : 'open'
  }
  get inTunnel() {
    return this.where() === 'tunnel'
  }

  /** In the tunnel her finger counts by where it is on the screen next to the canoe: above it = paddle on (further up =
   *  faster), below it = back up. Elsewhere null (the spot on the water under her finger). */
  aim(x: number, y: number, _w: number, h: number) {
    void x
    if (this.bay.using !== 'canoe' || this.funnel() !== 'in') return null
    const d = this.canoe.d
    const at = tmp.set(d.x, 0.3, d.z).project(this.bay.rig.camera)
    const up = ((1 - at.y) / 2) * h - y
    return new Vector3(TUNNEL.x, 0, d.z + Math.cos(d.lock ?? d.heading) * (up / h) * 40)
  }
  /** In the tunnel (and at its two ends) the canoe can only go along it: aim at the point on its middle line. */
  steerPoint(x: number, z: number): [number, number] {
    if (this.bay.using === 'canoe' && this.funnel() !== null) return [TUNNEL.x, z]
    return [x, z]
  }
  camLag() {
    const w = this.where()
    return w === 'hong' ? 0.6 : w === 'tunnel' ? 0.25 : null
  }

  // ---------------------------------------------------------------- the swaps

  /** The longtail's bow at (bx, bz): at the cave's raft, into the canoe. */
  arrive(bx: number, bz: number) {
    const d = this.bay.rides.longtail.d
    if (!this.armed && Math.hypot(d.x - CAVE_GLOW.x, d.z - CAVE_GLOW.z) > CAVE_GLOW.r + 5) this.armed = true
    if (!this.armed || Math.hypot(bx - CAVE_GLOW.x, bz - CAVE_GLOW.z) >= CAVE_GLOW.r) return false
    this.toCanoe()
    return true
  }

  private toCanoe() {
    const bay = this.bay
    bay.setPhase('swap')
    const { longtail, canoe } = bay.rides
    bay.glide(longtail, { x: LONGTAIL_PARK.x, z: LONGTAIL_PARK.z, h: LONGTAIL_PARK.heading }, 0.9, () => {
      bay.riders.forEach((r, i) => {
        r.lying = r.under = false
        bay.strike(r, null)
        bay.hop(r, canoe.v.body, bay.seatPos(canoe.v, r, 'sit'), 'sit', 0, i * 0.28, i === 2 ? () => this.swapped('canoe') : undefined)
      })
    })
  }

  /** Back into the longtail when the canoe comes out of the cave. */
  private toLongtail() {
    const bay = this.bay
    bay.setPhase('swap')
    const { longtail, canoe } = bay.rides
    bay.glide(canoe, { x: CANOE_START.x, z: CANOE_START.z, h: CANOE_START.heading }, 0.8, () => {
      bay.riders.forEach((r, i) => {
        r.lying = r.under = false
        const pose = bay.poseIn(longtail.v, r)
        bay.hop(r, longtail.v.body, bay.seatPos(longtail.v, r, pose), pose, 0, i * 0.28, i === 2 ? () => this.swapped('longtail') : undefined)
      })
    })
  }

  private swapped(to: 'longtail' | 'canoe') {
    const bay = this.bay
    bay.setUsing(to)
    bay.setPhase('drive')
    this.armed = false
    bay.refreshSection()
  }

  /** The canoe's own rules: along the tunnel only, gently lined up at both ends, and back to the longtail outside. */
  rules(dt: number) {
    const bay = this.bay
    if (bay.using !== 'canoe') return
    const d = this.canoe.d
    const f = this.funnel()
    if (f === 'in') {
      if (d.lock === null) d.lock = Math.abs(wrap(d.heading - Math.PI)) < Math.PI / 2 ? Math.PI : 0
      const lim = TUNNEL.half - 0.5
      const off = d.x - TUNNEL.x
      if (Math.abs(off) > lim) {
        d.x = TUNNEL.x + Math.sign(off) * lim
        d.bounce(-Math.sign(off), 0, 0.2)
      }
    } else {
      d.lock = null
      // Lined up with the tunnel when she paddles toward it.
      const k = Math.min(1, dt * 2.5)
      const wantIn = f === 'mouth' ? Math.PI : f === 'inner' ? 0 : null
      if (wantIn !== null && Math.abs(wrap(d.heading - wantIn)) < 1.3) {
        d.x += (TUNNEL.x - d.x) * k
        d.heading += wrap(wantIn - d.heading) * k
      }
    }
    if (this.where() === 'open' && f !== 'mouth' && (d.z > TUNNEL.z0 + 7 || Math.abs(d.x - TUNNEL.x) > 7) && d.z > HONG.z) this.toLongtail()
    this.roof(dt)
  }

  /** Tapping someone in the canoe: they lie back (or sit up). */
  lieDown(r: Rider) {
    r.lying = !r.lying
    r.under = false
    r.upT = 0
    this.bay.reseat(r)
    sfx.pop()
  }

  /** The tunnel's roof: sitting up under a low roof, a unicorn's horn bonks it and they lie down. Once they've been
   *  under the low roof and it's high again, they sit back up (lying down early, they stay down until then). */
  private roof(dt: number) {
    const bay = this.bay
    const ride = this.canoe
    const d = ride.d
    const inside = Math.abs(d.x - TUNNEL.x) < TUNNEL.half + 1.5
    for (const r of bay.riders) {
      const seat = ride.v.seats[r.id]
      const z = d.z + Math.cos(d.heading) * seat.z
      const roof = inside ? tunnelRoof(z) : 99
      const top = seat.y + HORN * r.height
      const ahead = inside ? tunnelRoof(z + Math.cos(d.heading) * Math.sign(d.speed || 1) * 2.5) : 99
      r.warn = !r.lying && ahead < top
      if (r.warn) bay.once('lie', L.bay.hint.lie)
      if (r.lying && roof < top) r.under = true
      if (!r.lying && top > roof) {
        r.lying = true
        r.under = true
        r.upT = 0
        bay.countRoof(r.id)
        r.char.react('wiggle')
        bay.reseat(r)
        sfx.boink()
        d.vx *= 0.4
        d.vz *= 0.4
        bay.dust.burst(d.x, roof - 0.05, z, 10, 1.2, -0.5, 0.14)
        if (r.id === 'nick') {
          bay.rider('ji').char.react('hop')
          bay.once('horn', L.bay.horn)
        }
      } else if (r.lying && r.under) {
        r.upT = roof > top + 0.4 ? r.upT + dt : 0
        // Out of the low part: "Ahh!" and they sit up again.
        if (r.upT > 0.9) {
          r.lying = false
          r.under = false
          bay.reseat(r)
          r.char.react('hop')
        }
      }
    }
  }

  // ---------------------------------------------------------------- taps

  anchorAt(id: string): Spot | null {
    const bay = this.bay
    if (bay.using !== 'canoe' || bay.phase !== 'drive') return null
    const w = this.where()
    const near = (p: Vector3, r: number) => (Math.hypot(p.x - this.canoe.d.x, p.z - this.canoe.d.z) < r ? p : null)
    if (id === 'bats') {
      const at = near(this.batSpot(2).setY(tunnelRoof(BATS_Z) - 0.4), 12)
      return at ? { at, r: 0.6, prio: 3, max: 110 } : null
    }
    if (id.startsWith('drip:')) {
      const s = DRIPS[Number(id.slice(5))]
      const at = near(new Vector3(TUNNEL.x + s.x, tunnelRoof(s.z) - 0.4, s.z), 9)
      return at && this.funnel() ? { at, r: 0.35, prio: 3, max: 100 } : null
    }
    if (w !== 'hong') return null
    switch (id) {
      case 'crab':
        return { at: new Vector3(BANK.x, 0.8, BANK.z + 1), r: 1.6, prio: 3 }
      case 'mudskipper':
        return { at: this.skippers[0].root.position.clone().setY(0.7), r: 0.9, prio: 3 }
      case 'lizard':
        return { at: this.lizard.root.position.clone().setY(0.5), r: 1.2, prio: 3 }
      case 'kingfisher':
        return { at: this.kingfisher.root.position.clone(), r: 0.6, prio: 3, max: 110 }
      case 'mangrove':
        return { at: MANGROVE.clone(), r: 1.6, prio: 2 }
    }
    return null
  }

  tap(id: string): boolean {
    const bay = this.bay
    if (id === 'bats') {
      this.swirl()
      return true
    }
    if (id.startsWith('drip:')) {
      const dr = this.drips[Number(id.slice(5))]
      if (dr) this.drip(dr, true)
      return true
    }
    switch (id) {
      case 'crab':
        this.crabWave = 0
        sfx.pop()
        bay.found('crab', this.crabs[1].root.position)
        return true
      case 'mudskipper':
        this.skipT = [0, -0.2]
        sfx.boing()
        bay.found('mudskipper', this.skippers[0].root.position)
        return true
      case 'lizard':
        this.tongueT = 0
        sfx.plop()
        bay.found('lizard', this.lizard.root.position)
        return true
      case 'kingfisher':
        if (this.kingT < 0) this.kingT = 0
        sfx.peep()
        bay.found('kingfisher', this.kingfisher.root.position)
        return true
      case 'mangrove':
        sfx.flap()
        if (bay.time - this.factAt > 15) {
          this.factAt = bay.time
          bay.say(L.bay.facts.mangrove)
        }
        bay.spray.burst(MANGROVE.x, 2.2, MANGROVE.z, 6, 1, 1, 0.12)
        return true
    }
    return false
  }

  private swirl() {
    if (this.batT < 0) this.batT = 0
    sfx.squeak()
  }

  private drip(dr: { g: Group; drop: Group; t: number }, loud: boolean) {
    if (dr.t >= 0) return
    dr.t = 0
    dr.drop.visible = true
    dr.drop.position.copy(dr.g.position).setY(dr.g.position.y - 0.75)
    if (loud) {
      dr.g.scale.setScalar(1.15)
      setTimeout(sfx.plink, 260)
    }
  }

  /** Hanging upside down along the walls, up under the roof (never in the middle, where the camera passes). */
  private batSpot(i: number) {
    const side = i % 2 ? 1 : -1
    const z = BATS_Z + (i - 2) * 0.7
    return new Vector3(TUNNEL.x + side * (TUNNEL.half - 0.3), tunnelRoof(z) - 0.2, z)
  }
  private restBats() {
    this.bats.forEach((b, i) => {
      b.position.copy(this.batSpot(i))
      b.rotation.set(Math.PI, i * 0.7, 0)
    })
  }

  // ---------------------------------------------------------------- per frame

  update(dt: number, t: number) {
    const bay = this.bay
    const d = this.canoe.d
    const w = this.where()
    // The hong's animals are only drawn when she can see into it (from the canoe, or close by); the tunnel's bats and
    // drips only near the tunnel.
    const cam = bay.rig.camera.position
    const inHong = bay.using === 'canoe' && Math.hypot(cam.x - HONG.x, cam.z - HONG.z) < 80
    for (const c of this.crabs) c.root.visible = inHong
    for (const m of this.skippers) m.root.visible = inHong
    this.lizard.root.visible = this.kingfisher.root.visible = inHong
    const nearTunnel = Math.hypot(cam.x - TUNNEL.x, cam.z - (TUNNEL.z0 + TUNNEL.z1) / 2) < 45
    for (const b of this.bats) b.visible = nearTunnel
    for (const dr of this.drips) dr.g.visible = nearTunnel
    // The paddle dips in time with the canoe.
    if (bay.using === 'canoe') {
      const sp = Math.min(1.4, Math.abs(d.speed) / d.feel.top)
      if (sp > 0.15) {
        this.paddleT += dt * (0.8 + sp * 1.4)
        if (this.paddleT > 1) {
          this.paddleT = 0
          sfx.paddle()
        }
      }
    }
    // Bats: swirl when she taps them or first paddles under them.
    if (!this.batsSeen && bay.using === 'canoe' && Math.abs(d.z - BATS_Z) < 2 && w === 'tunnel') {
      this.batsSeen = true
      this.swirl()
    }
    if (this.batT >= 0) {
      this.batT += dt / 2.6
      const k = Math.min(1, this.batT)
      // Little loops by their own wall, flapping, then back to hang upside down.
      this.bats.forEach((b, i) => {
        const a = t * 7 + i * 1.3
        const fly = bell(k)
        const rest = this.batSpot(i)
        const side = Math.sign(rest.x - TUNNEL.x)
        b.position.set(rest.x - side * (0.25 + Math.sin(a) * 0.2) * fly, rest.y - (0.3 + Math.cos(a) * 0.15) * fly, rest.z + Math.sin(a * 0.7) * 0.6 * fly)
        b.rotation.set(Math.PI * (1 - fly), a + Math.PI / 2, Math.sin(t * 30) * 0.5 * fly)
      })
      if (k >= 1) {
        this.batT = -1
        this.restBats()
      }
    } else this.bats.forEach((b, i) => (b.rotation.z = Math.sin(t * 1.5 + i) * 0.08))
    // Drips: one falls now and then by itself (and plinks if she's close), or when she taps a stalactite.
    for (const dr of this.drips) {
      dr.next -= dt
      if (dr.next <= 0) {
        dr.next = 3 + Math.random() * 4
        this.drip(dr, bay.using === 'canoe' && Math.abs(d.z - dr.g.position.z) < 5)
      }
      dr.g.scale.setScalar(1 + (dr.g.scale.x - 1) * Math.exp(-dt * 6))
      if (dr.t >= 0) {
        dr.t += dt
        dr.drop.position.y -= dt * (2 + dr.t * 14)
        if (dr.drop.position.y <= 0.05) {
          dr.t = -1
          dr.drop.visible = false
          bay.foam.emit(dr.drop.position.x, 0.03, dr.drop.position.z, 0, 0, 0, 1.2, 0.5)
        }
      }
    }
    // ---- The hong ----
    for (const [i, c] of this.crabs.entries()) {
      c.blink.update(dt)
      // They wave their big claw now and then; a tap and they all wave back, fast.
      const wave = this.crabWave >= 0 ? Math.sin(this.crabWave * 18 + i) * 0.9 : Math.max(0, Math.sin(t * 1.4 + i * 2.1)) ** 6 * 0.9
      c.claw.rotation.z = wave
      c.root.position.y = 0.25 + Math.abs(wave) * 0.03
    }
    if (this.crabWave >= 0) {
      this.crabWave += dt
      if (this.crabWave > 1.6) this.crabWave = -1
    }
    for (const [i, m] of this.skippers.entries()) {
      m.blink.update(dt)
      if (this.skipT[i] < 0 && Math.random() < dt * 0.15) this.skipT[i] = 0
      if (this.skipT[i] >= 0) {
        this.skipT[i] += dt / 0.6
        const k = Math.min(1, this.skipT[i])
        m.root.position.y = 0.25 + bell(Math.max(0, k)) * 0.7
        m.root.rotation.y += dt * 2
        if (k >= 1) this.skipT[i] = -1
      }
    }
    // The lizard swims slowly round the lagoon, its tail swishing.
    const lz = this.lizard
    lz.blink.update(dt)
    this.lizardA += dt * 0.12
    const lx = HONG.x + Math.sin(this.lizardA) * 9
    const lzz = HONG.z + Math.cos(this.lizardA) * 9
    lz.root.position.set(lx, swell(lx, lzz, t) * 0.5 - 0.08, lzz)
    lz.root.rotation.y = this.lizardA + Math.PI / 2
    lz.tail.rotation.y = Math.sin(t * 3) * 0.4
    if (this.tongueT >= 0) {
      this.tongueT += dt / 0.9
      const k = Math.min(1, this.tongueT)
      lz.head.rotation.x = -0.4 * bell(k)
      lz.tongue.scale.z = Math.max(0.01, Math.abs(Math.sin(k * Math.PI * 3)))
      if (k >= 1) {
        this.tongueT = -1
        lz.tongue.scale.z = 0.01
      }
    }
    // The kingfisher: on its perch, or a quick blue loop across the lagoon and back.
    const kf = this.kingfisher
    kf.blink.update(dt)
    if (this.kingT >= 0) {
      this.kingT += dt / 2.2
      const k = Math.min(1, this.kingT)
      const a = k * Math.PI * 2
      kf.root.position.set(PERCH.x + (HONG.x - PERCH.x) * Math.sin(a / 2) * 1.2 + Math.sin(a) * 3, PERCH.y + Math.sin(a / 2) * 2, PERCH.z + (HONG.z - PERCH.z) * Math.sin(a / 2) * 1.2 + Math.cos(a) * 3 - 3)
      kf.root.rotation.y = a + Math.PI
      const flap = Math.sin(t * 30) * 0.8
      kf.wingL.rotation.z = flap
      kf.wingR.rotation.z = -flap
      if (k >= 1) {
        this.kingT = -1
        kf.root.position.copy(PERCH)
      }
    } else {
      kf.wingL.rotation.z = kf.wingR.rotation.z = 0
      kf.root.rotation.y = Math.atan2(HONG.x - PERCH.x, HONG.z - PERCH.z) + Math.sin(t * 0.7) * 0.3
    }
    // In the hong: the first time, Sparkle's fact, and a photo; driving close finds the animals.
    if (w === 'hong') {
      if (this.hongT < 0) {
        this.hongT = 0
        bay.once('hong', L.bay.facts.hong)
        bay.visit('cave')
      }
      this.hongT += dt
      if (this.hongT > 4.8 && this.hongT - dt <= 4.8 && !bay.hasPhoto('hong')) {
        sfx.shutter()
        bay.flash()
        bay.photo('hong')
      }
      const close = (p: Vector3, r: number) => Math.hypot(p.x - d.x, p.z - d.z) < r
      if (close(lz.root.position, 7)) bay.found('lizard', lz.root.position)
      if (close(new Vector3(BANK.x, 0, BANK.z), 9)) {
        bay.found('crab', this.crabs[1].root.position)
        bay.found('mudskipper', this.skippers[0].root.position)
      }
      if (close(PERCH, 8) && this.kingT < 0) {
        this.kingT = 0
        sfx.peep()
        bay.found('kingfisher', kf.root.position)
      }
    }
  }

  bumps(x: number, z: number, circles: Circle[], _boxes: Box[]) {
    const near = (cx: number, cz: number, r: number) => Math.abs(cx - x) < r + 12 && Math.abs(cz - z) < r + 12
    for (const r of RING) if (near(r.x, r.z, r.r)) circles.push([r.x, r.z, r.r])
    if (near(BANK.x, BANK.z, 4)) circles.push([BANK.x, BANK.z, 3.2])
  }

  hint(): Vector3 | null {
    const bay = this.bay
    if (bay.using !== 'canoe' || bay.phase !== 'drive') return null
    // A family member whose horn is about to bonk: tap them. In the hong after a while: the way out.
    const r = bay.riders.find((r) => r.warn)
    if (r) return r.char.root.getWorldPosition(new Vector3()).setY(1.2)
    return this.showExit ? EXIT.clone().setY(0.6) : null
  }
  stuckLine() {
    if (this.bay.riders.some((r) => r.warn)) return L.bay.hint.lie
    return this.showExit ? L.bay.hint.out : null
  }
  /** In the hong a while (after its photo): a glow shows the way back out through the cave. */
  get showExit() {
    return this.bay.using === 'canoe' && this.where() === 'hong' && this.hongT > 6.5
  }
  /** Paddle home: along the tunnel from its inner mouth, out to the raft. */
  paddleOut() {
    const d = this.canoe.d
    d.goto(EXIT.x, EXIT.z, true)
    // Past the mouth (z0 + 7), where everyone hops back into the longtail.
    return [{ x: TUNNEL.x, z: TUNNEL.z0 + 9.5 }]
  }

  sectionNow(): BoatSection | null {
    if (this.bay.using !== 'canoe') return null
    return this.where() === 'hong' ? 'hong' : 'cave'
  }

  /** The tunnel: low behind the canoe; the hong: from up on the cliffs, looking down into the room. */
  shot(): Shot | null {
    const bay = this.bay
    if (bay.using !== 'canoe') return null
    const d = this.canoe.d
    const behind = bay.unwrap(bay.camHeadingDeg + 180)
    const f = this.funnel()
    if (f === 'in' || f === 'mouth') {
      // Close behind the canoe and as high as the roof over the camera allows, looking down over Kaylee at the roof
      // coming down. It tilts rather than sinks, so the canoe stays in the same place on the screen.
      // It looks a few meters ahead of the canoe, over the family's heads, so the roof coming down shows.
      const back = 4.6
      const ahead = 2.6
      const fwd = Math.cos(d.heading)
      const camY = Math.min(tunnelRoof(d.z - fwd * back) - 0.25, 2.4)
      const dist = back + ahead
      // Under the lowest roof the camera is low too: it looks a little lower, so it never rises into the rock.
      const lookY = clamp(camY - 0.35, 0.3, 0.9)
      const pitch = Math.asin(clamp((camY - lookY) / dist, 0.02, 0.6)) / deg
      return { center: new Vector3(TUNNEL.x, lookY, d.z + fwd * ahead), half: new Vector3(1, 0.5, 1), yaw: behind, pitch, minDist: dist, maxDist: dist, follow: true }
    }
    // Inside the room: the camera stands still up on the lagoon's north side, turning to watch the canoe, so the whole
    // room shows (the mud bank, the mangroves, the way she came in) and it never spins round. Closer to it, it looks
    // down more steeply.
    if (this.where() === 'hong') {
      const D = Math.hypot(HONG_CAM.x - d.x, HONG_CAM.z - d.z)
      if (D > 1.5) this.hongYaw = Math.atan2(HONG_CAM.x - d.x, HONG_CAM.z - d.z) / deg
      const H = HONG_CAM.y + Math.max(0, 10 - D) * 0.7
      const R = Math.max(D, 1.5)
      return { center: new Vector3(d.x, 0.6, d.z), half: new Vector3(0.6, 0.4, 0.6), yaw: bay.unwrap(this.hongYaw), pitch: Math.atan2(H - 0.6, R) / deg, minDist: Math.hypot(R, H - 0.6), maxDist: Math.hypot(R, H - 0.6) }
    }
    return null
  }

  photoCamera(kind: PhotoKind, staged: boolean): PerspectiveCamera | null {
    if (kind !== 'hong') return null
    const bay = this.bay
    const canoe = this.canoe
    if (staged) {
      canoe.d.place(HONG.x - 1, HONG.z + 3, Math.PI * 0.85)
      bay.seatAll(canoe)
    }
    // Daddy holds the camera out ahead and to the side: all three faces in a row (kept inside the lagoon), the cliffs
    // and mangroves behind.
    const d = canoe.d
    let cx = d.x + Math.sin(d.heading) * 4.5 + Math.cos(d.heading) * 3
    let cz = d.z + Math.cos(d.heading) * 4.5 - Math.sin(d.heading) * 3
    const off = Math.hypot(cx - HONG.x, cz - HONG.z)
    if (off > HONG.inner - 3) {
      cx = HONG.x + ((cx - HONG.x) / off) * (HONG.inner - 3)
      cz = HONG.z + ((cz - HONG.z) / off) * (HONG.inner - 3)
    }
    return photoCamera(50, cx, 2.6, cz, d.x, 0.7, d.z)
  }
}

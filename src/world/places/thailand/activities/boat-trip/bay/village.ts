// Koh Panyee, the village on stilts (section `village`). About 200 years ago fishing families from Java built their
// homes on stilts over the sea, and the kids, with no land to play football on, built a football field that floats.
// - Two rows of stilt houses with a lane of water between them: boats slow down here by themselves (real ones do), and
//   she steers under the laundry lines, past squid drying on a rack and the cat on its fishing boat.
// - The golden dome stands behind the houses. Like the house's sacred things it never wobbles: a soft bell.
// - The ball rolled off the floating field into the sea: she pushes it back with the boat (bumper-boat football), the
//   kids kick it in: GOAL! "Khob khun ka!", and they toss her a football to keep (it rides in the boat from then on).
//   Daddy snaps a photo with the kids cheering behind (it drops into the album).
// - Drive straight at a house and a grandma comes out on her porch, waving her broom.
import { Group, Vector3, type BufferGeometry, type PerspectiveCamera } from 'three'
import { bell, clamp } from '../../../../../../sdk'
import { buildAnimal, type Rig } from '../../../characters/animal'
import { FaceLife } from '../../../characters/face'
import type { Look } from '../../../characters/looks'
import type { AnchorInfo } from '../../../engine/Anchors'
import { merge, P, solid } from '../../../engine/geo'
import { photoCamera } from '../../../engine/photo'
import { PAL } from '../../../engine/toon'
import { swell } from '../../../engine/water'
import { L } from '../../../lines'
import { sfx } from '../../../sfx'
import { CARGO } from '../../../trip/vehicles/longtail'
import type { BoatSection } from '../sections'
import type { Bay } from './bay'
import { buildCat, type Cat } from './critters'
import { BALL_START, FIELD, HOUSES, SLOW, VILLAGE, VILLAGE_START } from './layout'
import type { BayPart, Box, Circle, PhotoKind, Spot } from './part'
import { applyPose, clearPose } from './poses'
import { POST, tower } from './scenery'

export const VILLAGE_ANCHORS: AnchorInfo[] = [
  { id: 'ball', label: 'Football', kind: 'thing' },
  { id: 'kids', label: 'The village kids', kind: 'thing' },
  { id: 'cat', label: 'Cat', kind: 'thing' },
  { id: 'laundry:0', label: 'Laundry', kind: 'thing' },
  { id: 'laundry:1', label: 'Laundry', kind: 'thing' },
  { id: 'squid', label: 'Squid drying', kind: 'thing' },
  { id: 'dome', label: 'Golden dome', kind: 'thing' },
  { id: 'grandma', label: 'Grandma', kind: 'thing' },
]

const WALLS = ['#FFC2A8', '#D9CCFF', '#BDE8D8', '#FFE7A6', '#FFD1E3', '#BFE0FF']
const ROOFS = ['#E07A8F', '#7FB2E8', '#9AD6B0', '#B9A6F5', '#F2A65A']
export const KIDS: Look[] = [
  { species: 'buffalo', height: 0.95, fur: '#C49A7A', light: '#F2E2D0', dark: '#6E5A4E', ear: '#FFB8CC', outfit: { kind: 'tee', color: '#FFD27A', shorts: '#7FB2E8' } },
  { species: 'fox', height: 0.9, fur: '#F2B36B', light: '#FFF1E2', dark: '#2B2330', ear: '#FFE6CC', outfit: { kind: 'tee', color: '#FF8FB8', shorts: '#8FE3C8' }, lashes: true },
  { species: 'elephant', height: 0.92, fur: '#B8C4E8', light: '#E3E8F8', dark: '#8E9BCB', ear: '#FFB8CC', outfit: { kind: 'tee', color: '#8FE3C8', shorts: '#B9A6F5' } },
]
export const GRANDMA: Look = { species: 'elephant', height: 1.35, fur: '#C9C2DA', light: '#ECE8F4', dark: '#A79FC2', ear: '#FFC2D4', outfit: { kind: 'blouse', color: '#FFB3CF' }, extras: ['glasses'], lashes: true }
/** The laundry lines across the lane (z), and the squid rack on a porch. */
const LINES = [-10, 6]
const LINE_Y = 4.3
const SQUID = new Vector3(VILLAGE.lane + VILLAGE.laneHalf + 0.6, 2.35, 10)
const CAT_BOAT = { x: VILLAGE.lane + 3.3, z: 1.6 }
const BALL_R = 0.38
const tmp = new Vector3()

type Goal = 'loose' | 'hop' | 'kick' | 'goal' | 'gift' | 'done' | 'kickout'

interface Kid {
  rig: Rig
  life: FaceLife
  home: Vector3
  pos: Vector3
  cheer: number
  jump: number
}

export class VillageStop implements BayPart {
  readonly start = VILLAGE_START
  /** She's in the village (the section, the glow goes out). */
  here = false
  private kids: Kid[]
  private ball: Group
  private b = { x: BALL_START.x, z: BALL_START.z, y: 0, vx: 0, vz: 0, spin: 0 }
  private goal: Goal = 'loose'
  private goalT = 0
  private hopFrom = new Vector3()
  private hopTo = new Vector3()
  private gift: Group
  private lines: Group[] = []
  private flapT = [-1, -1]
  private squid: Group
  private squidT = -1
  private cat: Cat
  private catT = -1
  private catBoat = new Group()
  private grandma: Rig
  private grandmaT = -1
  private domeT = -1
  private play = { t: 0, from: 0, to: 1 }
  /** Goals scored, and how long they've played since the last one (then they kick it out to her again). */
  private goals = 0
  private playT = 0
  /** She's bumped the loose ball at least once: from then on the kids' call pulls it all the way home. */
  private bumped = false
  private hereT = 0
  private called = false

  constructor(private bay: Bay) {
    const { bag, scene } = bay
    // ---- The houses on their stilts, their porches on the lane, the big rock behind, the golden dome ----
    const parts: BufferGeometry[] = [...tower(VILLAGE.rock)]
    HOUSES.forEach((h, i) => {
      const toLane = -h.side
      const wallX = h.x + toLane * 0.7
      const wallW = h.hx * 2 - 1.4
      const wall = WALLS[i % WALLS.length]
      const roof = ROOFS[(i * 3) % ROOFS.length]
      const FLOOR = 2.2
      // Stilts, the floor deck (with the porch along the lane), the walls, a door and windows facing the lane.
      for (const sx of [-1, 0, 1]) for (const sz of [-1, 1]) parts.push(P.cyl(0.14, 0.16, FLOOR + 0.6, POST, { at: [h.x + sx * (h.hx - 0.3), FLOOR / 2 - 0.3, h.z + sz * (h.hz - 0.3)] }, 6))
      parts.push(P.box(h.hx * 2, 0.22, h.hz * 2, '#C9875C', { at: [h.x, FLOOR, h.z] }))
      parts.push(P.box(wallW, 2.4, h.hz * 2 - 0.4, wall, { at: [wallX, FLOOR + 1.3, h.z] }))
      const face = wallX + toLane * (wallW / 2 + 0.02)
      parts.push(P.box(0.06, 1.6, 0.9, '#B07A4A', { at: [face, FLOOR + 0.9, h.z - 1.1] }))
      parts.push(P.box(0.06, 0.7, 0.9, '#8EC9F5', { at: [face, FLOOR + 1.5, h.z + 1.2] }), P.box(0.08, 0.1, 1.1, '#FFFFFF', { at: [face, FLOOR + 1.12, h.z + 1.2] }))
      // The porch rail along the lane.
      const railX = h.x + toLane * (h.hx - 0.15)
      parts.push(P.box(0.08, 0.08, h.hz * 2 - 0.2, '#FFFFFF', { at: [railX, FLOOR + 0.85, h.z] }))
      for (let k = -2; k <= 2; k++) parts.push(P.box(0.07, 0.75, 0.07, '#FFFFFF', { at: [railX, FLOOR + 0.48, h.z + k * (h.hz - 0.3) * 0.5] }))
      // A tin roof: two pastel slopes meeting along the house's length.
      for (const s of [-1, 1]) parts.push(P.box(wallW / 2 + 0.7, 0.12, h.hz * 2 + 0.3, roof, { at: [wallX + s * (wallW / 4 + 0.25), FLOOR + 2.95, h.z], rot: [0, 0, -s * 0.42] }))
    })
    // The golden dome: on its white drum, on stilts at the foot of the rock, with a little golden spire.
    const dm = VILLAGE.dome
    parts.push(P.cyl(4.2, 4.2, 0.3, '#C9875C', { at: [dm.x, 2.2, dm.z] }, 20))
    for (let k = 0; k < 8; k++) parts.push(P.cyl(0.18, 0.2, 2.8, POST, { at: [dm.x + Math.sin(k * 0.785) * 3.8, 0.9, dm.z + Math.cos(k * 0.785) * 3.8] }, 6))
    parts.push(P.cyl(3, 3.1, 4.2, '#FFF7F0', { at: [dm.x, 4.4, dm.z] }, 20))
    parts.push(...Array.from({ length: 8 }, (_, k) => P.box(0.5, 1.4, 0.08, '#8EC9F5', { at: [dm.x + Math.sin(k * 0.785) * 3.06, 4.6, dm.z + Math.cos(k * 0.785) * 3.06], rot: [0, k * 0.785, 0] })))
    parts.push(P.sphere(3.1, PAL.gold, { at: [dm.x, 6.5, dm.z], scale: [1, 1.2, 1] }, 22), P.cyl(0.08, 0.16, 2.4, PAL.gold, { at: [dm.x, 11, dm.z] }, 8), P.sphere(0.3, PAL.gold, { at: [dm.x, 10.2, dm.z] }, 10))
    // ---- The floating football field: a raft on blue barrels, green turf with white lines, a goal at each end ----
    const F = FIELD
    parts.push(P.box(F.hx * 2, 0.35, F.hz * 2, '#C9875C', { at: [F.x, 0.25, F.z] }))
    for (let i = 0; i < 6; i++) for (const s of [-1, 1]) parts.push(P.cyl(0.4, 0.4, 0.9, '#5FA7E8', { at: [F.x + s * (F.hx - 0.5), 0.05, F.z - F.hz + 1.2 + i * ((F.hz * 2 - 2.4) / 5)], rot: [Math.PI / 2, 0, 0] }, 10))
    parts.push(P.box(F.hx * 2 - 0.3, 0.05, F.hz * 2 - 0.3, '#8EDB8C', { at: [F.x, 0.45, F.z] }))
    const line = (w: number, d: number, x: number, z: number) => P.box(w, 0.02, d, '#FFFFFF', { at: [x, 0.48, z] })
    parts.push(line(F.hx * 2 - 0.8, 0.08, F.x, F.z), P.torus(1.3, 0.04, '#FFFFFF', { at: [F.x, 0.48, F.z], rot: [Math.PI / 2, 0, 0] }))
    for (const s of [-1, 1]) {
      parts.push(line(F.hx * 2 - 0.8, 0.08, F.x, F.z + s * (F.hz - 0.4)), line(0.08, F.hz * 2 - 0.8, F.x + s * (F.hx - 0.4), F.z))
      // The goal: white posts, a crossbar, a pastel net behind.
      const gz = F.z + s * (F.hz - 0.4)
      parts.push(...[-1, 1].map((k) => P.cyl(0.07, 0.07, 1.3, '#FFFFFF', { at: [F.x + k * 1.4, 1.1, gz] }, 8)), P.cyl(0.07, 0.07, 2.9, '#FFFFFF', { at: [F.x, 1.75, gz], rot: [0, 0, Math.PI / 2] }, 8))
      parts.push(P.box(2.8, 1.25, 0.04, '#E5DDFB', { at: [F.x, 1.1, gz + s * 0.55] }), P.box(2.8, 0.04, 0.6, '#E5DDFB', { at: [F.x, 1.72, gz + s * 0.28] }))
    }
    scene.add(solid(merge(parts), bag, 2))

    // ---- Laundry lines across the lane (they flap) ----
    LINES.forEach((z, li) => {
      const pivot = new Group()
      pivot.position.set(VILLAGE.lane, LINE_Y, z)
      const clothes: BufferGeometry[] = [P.cyl(0.02, 0.02, VILLAGE.laneHalf * 2 + 2, PAL.ink, { rot: [0, 0, Math.PI / 2] }, 4)]
      for (let k = 0; k < 6; k++) {
        const x = -VILLAGE.laneHalf + 0.6 + k * ((VILLAGE.laneHalf * 2 - 1.2) / 5)
        const c = [PAL.pink, PAL.sky, PAL.butter, PAL.mint, PAL.lavender, '#FFFFFF'][(k + li * 2) % 6]
        if (k % 2) clothes.push(P.cone(0.4, 0.9, c, { at: [x, -0.5, 0] }, 10))
        else clothes.push(P.box(0.8, 0.7, 0.05, c, { at: [x, -0.4, 0] }), P.box(0.24, 0.3, 0.05, c, { at: [x - 0.45, -0.18, 0], rot: [0, 0, 0.5] }), P.box(0.24, 0.3, 0.05, c, { at: [x + 0.45, -0.18, 0], rot: [0, 0, -0.5] }))
      }
      pivot.add(solid(merge(clothes), bag, 1.5))
      scene.add(pivot)
      this.lines.push(pivot)
      // The poles holding it, on the porches either side.
      scene.add(solid(merge([-1, 1].map((s) => P.cyl(0.07, 0.07, 2.4, POST, { at: [VILLAGE.lane + s * (VILLAGE.laneHalf + 0.25), 3.4, z] }, 6))), bag, 1.5))
    })
    // ---- Squid drying on a rack on a porch ----
    this.squid = new Group()
    this.squid.position.copy(SQUID).setY(SQUID.y + 1.6)
    const sq: BufferGeometry[] = [P.cyl(0.04, 0.04, 2.6, POST, { rot: [Math.PI / 2, 0, 0] }, 6)]
    for (let k = 0; k < 7; k++) {
      const z = -1.1 + k * 0.37
      sq.push(P.capsule(0.09, 0.3, '#FFF1F4', { at: [0, -0.35, z] }), P.cone(0.12, 0.16, '#FFE1EA', { at: [0, -0.1, z] }, 8), ...[-1, 0, 1].map((t) => P.box(0.02, 0.28, 0.02, '#FFD6E0', { at: [t * 0.05, -0.72, z] })))
    }
    this.squid.add(solid(merge(sq), bag, 1.5))
    scene.add(this.squid, solid(merge([-1, 1].map((s) => P.cyl(0.05, 0.05, 1.7, POST, { at: [SQUID.x, SQUID.y + 0.8, SQUID.z + s * 1.3] }, 6))), bag, 1.5))
    // ---- The cat's fishing boat, moored in the lane ----
    this.catBoat.add(solid(merge([P.rbox(1.1, 0.45, 3.4, 0.18, '#7FB2E8', { at: [0, 0.12, 0] }), P.box(1.14, 0.08, 3, PAL.butter, { at: [0, 0.32, 0] }), P.box(0.9, 0.05, 2.7, '#F6D3AE', { at: [0, 0.36, 0] }), P.rbox(0.9, 0.3, 0.6, 0.1, '#FFFFFF', { at: [0, 0.5, -0.6] })]), bag, 2))
    this.catBoat.position.set(CAT_BOAT.x, 0, CAT_BOAT.z)
    this.cat = buildCat(bag)
    this.cat.root.position.set(0, 0.4, 1.1)
    this.cat.root.rotation.y = -Math.PI / 2
    this.cat.root.scale.setScalar(1.5)
    this.catBoat.add(this.cat.root)
    scene.add(this.catBoat)
    // ---- The kids on the field, and the ball ----
    const spots = [new Vector3(F.x + 2.2, 0.47, F.z + 1.5), new Vector3(F.x + 0.5, 0.47, F.z + 4.5), new Vector3(F.x, 0.47, F.z - F.hz + 1.4)]
    this.kids = KIDS.map((look, i) => {
      const rig = buildAnimal(look, bag)
      rig.root.position.copy(spots[i])
      scene.add(rig.root)
      return { rig, life: new FaceLife(rig, 'kids'), home: spots[i].clone(), pos: spots[i].clone(), cheer: 0, jump: -1 }
    })
    this.ball = this.makeBall()
    scene.add(this.ball)
    this.gift = this.makeBall()
    this.gift.visible = false
    scene.add(this.gift)
    // ---- The grandma (inside until a boat bumps her house) ----
    this.grandma = buildAnimal(GRANDMA, bag)
    this.grandma.armR.add(solid(merge([P.cyl(0.03, 0.03, 1.1, '#B07A4A', { at: [0, -0.1, 0.2], rot: [1.2, 0, 0] }, 6), P.cone(0.16, 0.36, '#F2D38B', { at: [0, -0.38, 0.65], rot: [1.2 + Math.PI, 0, 0] }, 10)]), bag, 1.5))
    this.grandma.root.visible = false
    scene.add(this.grandma.root)
    // She's been here before (a link with stops=village): the football is hers already, the kids play on.
    if (bay.stops.has('village')) this.finish()
  }

  private makeBall() {
    const g = new Group()
    g.add(solid(merge([P.sphere(BALL_R, '#FFFFFF', {}, 16), ...[0, 1, 2, 3, 4].map((i) => P.sphere(BALL_R * 0.32, i % 2 ? PAL.hotpink : PAL.ink, { at: [Math.sin(i * 1.26) * BALL_R * 0.85, Math.cos(i * 2.1) * BALL_R * 0.5, Math.cos(i * 1.26) * BALL_R * 0.85], scale: [1, 1, 0.5] }, 8))]), this.bay.bag, 1.5))
    return g
  }

  /** The goal already scored: the football rides in the boat, and the ball is back on the field. */
  private finish() {
    this.goal = 'done'
    this.goals = 1
    this.b.x = FIELD.x
    this.b.z = FIELD.z
    this.b.y = 0.47 + BALL_R
    this.giveFootball()
  }
  private giveFootball() {
    const lt = this.bay.rides.longtail
    this.gift.removeFromParent()
    this.gift.visible = true
    this.gift.position.set(...CARGO.football)
    this.gift.scale.setScalar(0.75)
    lt.v.cargo.add(this.gift)
  }

  // ---------------------------------------------------------------- what the core asks

  /** Boats go slowly between the houses: the speed limit at (x, z), as a share of top speed. */
  speedCap(x: number, z: number) {
    return 1 - (1 - SLOW.cap) * this.closeness(x, z)
  }
  /** 0 = out in the open, 1 = among the houses (softened at the edge). */
  closeness(x: number, z: number) {
    const dx = Math.max(SLOW.x0 - x, 0, x - SLOW.x1)
    const dz = Math.max(SLOW.z0 - z, 0, z - SLOW.z1)
    return 1 - clamp(Math.hypot(dx, dz) / SLOW.soft, 0, 1)
  }

  /** The longtail's bow is at (bx, bz): arriving at the village. */
  arrive(bx: number, bz: number) {
    const was = this.here
    const d = this.bay.rides.longtail.d
    this.here = Math.hypot(d.x - (FIELD.x - 8), d.z - FIELD.z) < 52
    if (this.here && !was) {
      this.bay.visit('village')
      this.bay.once('village', L.bay.facts.village)
    }
    void bx
    void bz
  }

  sectionNow(): BoatSection | null {
    return this.bay.using === 'longtail' && this.here && this.bay.phase === 'drive' ? 'village' : null
  }

  anchorAt(id: string): Spot | null {
    const near = this.here || this.dist() < 90
    if (!near || this.bay.using !== 'longtail') return null
    switch (id) {
      case 'ball':
        return this.goal === 'loose' || this.goal === 'done' ? { at: this.ball.position.clone(), r: 0.7, prio: 3, glow: this.goal === 'loose' && this.here, max: 120 } : null
      case 'kids':
        return { at: this.kids[0].rig.root.position.clone().lerp(this.kids[1].rig.root.position, 0.5).setY(1.3), r: 1.4, prio: 2 }
      case 'cat':
        return { at: this.cat.root.getWorldPosition(new Vector3()).setY(1.2), r: 0.5, prio: 3 }
      case 'laundry:0':
      case 'laundry:1':
        return { at: this.lines[Number(id.slice(8))].position.clone().setY(LINE_Y - 0.5), r: 1.4, prio: 2 }
      case 'squid':
        return { at: this.squid.position.clone().setY(SQUID.y + 1.1), r: 0.9, prio: 3 }
      case 'dome':
        return { at: new Vector3(VILLAGE.dome.x, 7, VILLAGE.dome.z), r: 3, prio: 2 }
      case 'grandma':
        return this.grandma.root.visible ? { at: this.grandma.root.position.clone().setY(this.grandma.root.position.y + 1), r: 0.7, prio: 3 } : null
    }
    return null
  }

  /** The loose ball while she's here (its edge badge when it's off screen). */
  ballToFind(): Vector3 | null {
    return this.here && this.goal === 'loose' && this.bay.using === 'longtail' ? this.ball.position.clone().setY(0.8) : null
  }

  private dist() {
    const d = this.bay.rides.longtail.d
    return Math.hypot(d.x - (FIELD.x - 8), d.z - FIELD.z)
  }

  tap(id: string): boolean {
    const bay = this.bay
    switch (id) {
      case 'ball':
        if (this.goal === 'loose') bay.driveTo(this.b.x, this.b.z)
        else this.kickAround()
        sfx.boop()
        return true
      case 'kids':
        sfx.cheer()
        this.kids.forEach((k, i) => (k.jump = -i * 0.12))
        return true
      case 'cat':
        sfx.mrrp()
        this.catT = 0
        bay.found('cat', this.cat.root.getWorldPosition(new Vector3()))
        return true
      case 'laundry:0':
      case 'laundry:1':
        this.flapT[Number(id.slice(8))] = 0
        sfx.flap()
        return true
      case 'squid':
        this.squidT = 0
        sfx.flap()
        return true
      case 'dome':
        // Sacred: it never wobbles. A soft bell, and Kaylee bows her head.
        if (this.domeT < 0) {
          this.domeT = 0
          sfx.ding()
        }
        return true
      case 'grandma':
        this.grandmaT = Math.min(this.grandmaT, 0.4)
        sfx.swish()
        return true
    }
    return false
  }

  bumps(x: number, z: number, circles: Circle[], boxes: Box[]) {
    if (x > -80 + 30 || Math.abs(z - 4) > 70) return
    for (const h of HOUSES) boxes.push([h.x, h.z, h.hx, h.hz])
    boxes.push([FIELD.x, FIELD.z, FIELD.hx, FIELD.hz])
    boxes.push([CAT_BOAT.x, CAT_BOAT.z, 0.6, 1.7])
    boxes.push([VILLAGE.dome.x, VILLAGE.dome.z, 4.2, 4.2])
    circles.push([VILLAGE.rock.x, VILLAGE.rock.z, VILLAGE.rock.r])
  }

  bonked(x: number, z: number) {
    // A house: grandma comes out on her porch with her broom.
    const h = HOUSES.find((h) => Math.abs(x - h.x) < h.hx + 1.2 && Math.abs(z - h.z) < h.hz + 1.2)
    if (!h || this.grandmaT >= 0) return
    const g = this.grandma.root
    g.position.set(h.x - h.side * (h.hx - 0.7), 2.32, h.z)
    g.rotation.y = h.side > 0 ? -Math.PI / 2 : Math.PI / 2
    g.visible = true
    this.grandmaT = 0
    sfx.swish()
  }

  hint(): Vector3 | null {
    return this.here && this.goal === 'loose' ? this.ball.position.clone().setY(0.6) : null
  }
  stuckLine() {
    return this.here && this.goal === 'loose' && this.bay.phase === 'drive' ? L.bay.hint.ball : null
  }

  // ---------------------------------------------------------------- per frame

  update(dt: number, t: number) {
    const bay = this.bay
    const d = bay.rides.longtail.d
    // A few seconds after she arrives (after Sparkle's fact): the kids call her over to the ball.
    this.hereT = this.here ? this.hereT + dt : 0
    if (!this.called && this.hereT > 4.5 && this.goal === 'loose') {
      this.called = true
      bay.say(L.bay.ball)
      this.kids.forEach((k) => (k.cheer = 1.2))
    }
    // From far away (the look over the bay, the Nail Island) the kids and the cat aren't drawn: fewer draw calls.
    const cam = bay.rig.camera.position
    const see = Math.hypot(cam.x - FIELD.x, cam.z - FIELD.z) < 150
    for (const k of this.kids) k.rig.root.visible = see
    this.catBoat.visible = see
    this.updateBall(dt, t)
    this.updateKids(dt, t)
    // Laundry flaps on a tap, or in the wind of a boat going under it.
    this.lines.forEach((l, i) => {
      if (this.flapT[i] < 0 && bay.using === 'longtail' && Math.abs(d.z - l.position.z) < 2 && Math.abs(d.x - l.position.x) < VILLAGE.laneHalf) {
        this.flapT[i] = 0
        sfx.flap()
      }
      if (this.flapT[i] >= 0) {
        this.flapT[i] += dt / 1.6
        const k = Math.min(1, this.flapT[i])
        l.rotation.x = Math.sin(k * 24) * 0.5 * (1 - k)
        if (k >= 1) this.flapT[i] = -1
      } else l.rotation.x = Math.sin(t * 1.3 + i) * 0.05
    })
    if (this.squidT >= 0) {
      this.squidT += dt / 1.4
      const k = Math.min(1, this.squidT)
      this.squid.rotation.z = Math.sin(k * 20) * 0.35 * (1 - k)
      if (k >= 1) this.squidT = -1
    }
    // The cat: blinks, watches the boat, swishes its tail; a tap and it stretches and mrrps.
    const c = this.cat
    c.blink.update(dt)
    this.catBoat.position.y = swell(CAT_BOAT.x, CAT_BOAT.z, t) * 0.6
    c.tail.rotation.z = Math.sin(t * 2.4) * 0.4
    c.head.lookAt(d.x, 1.4, d.z)
    if (this.catT >= 0) {
      this.catT += dt / 1.2
      const k = Math.min(1, this.catT)
      c.root.scale.set(1.5 * (1 + 0.15 * bell(k)), 1.5 * (1 + 0.25 * bell(k)), 1.5)
      c.tail.rotation.x = -bell(k) * 1.2
      if (k >= 1) this.catT = -1
    }
    if (bay.using === 'longtail' && Math.hypot(d.x - CAT_BOAT.x, d.z - CAT_BOAT.z) < 12) bay.found('cat', c.root.getWorldPosition(tmp))
    // Grandma and her broom.
    if (this.grandmaT >= 0) {
      this.grandmaT += dt
      const g = this.grandma
      const k = clamp(this.grandmaT / 0.3, 0, 1) * (1 - clamp((this.grandmaT - 2.8) / 0.3, 0, 1))
      g.root.scale.setScalar(Math.max(0.01, k))
      applyPose(g, 'broom', this.grandmaT, Math.min(1, this.grandmaT / 0.25))
      if (Math.floor(this.grandmaT * 2.2) !== Math.floor((this.grandmaT - dt) * 2.2) && this.grandmaT < 2.6) sfx.swish()
      if (this.grandmaT > 3.1) {
        this.grandmaT = -1
        g.root.visible = false
        clearPose(g)
      }
    }
    // The dome: Kaylee bows her head (it never moves).
    if (this.domeT >= 0) {
      this.domeT += dt
      const kaylee = bay.rider('kaylee').char
      kaylee.rig.head.rotation.x = 0.45 * bell(Math.min(1, this.domeT / 1.4))
      if (this.domeT > 1.4) this.domeT = -1
    }
  }

  private updateBall(dt: number, t: number) {
    const bay = this.bay
    const b = this.b
    const F = FIELD
    const lt = bay.rides.longtail
    const d = lt.d
    if (this.goal === 'loose') {
      // Floating: it drifts and slows, the boat bumps it along, a gentle current brings it back if it gets far.
      b.x += b.vx * dt
      b.z += b.vz * dt
      b.vx *= Math.exp(-dt * 0.35)
      b.vz *= Math.exp(-dt * 0.35)
      b.spin *= Math.exp(-dt)
      // Once she's bumped it, the kids call for it and it rolls their way: one bump in any direction is enough.
      const toField = Math.hypot(FIELD.x - b.x, FIELD.z - b.z)
      if (this.bumped && toField < 32) {
        b.vx += ((FIELD.x - b.x) / toField) * dt * 1.6
        b.vz += ((FIELD.z - b.z) / toField) * dt * 1.6
      }
      const far = Math.hypot(b.x - BALL_START.x, b.z - BALL_START.z)
      if (far > 30) {
        b.vx += ((BALL_START.x - b.x) / far) * dt * 0.8
        b.vz += ((BALL_START.z - b.z) / far) * dt * 0.8
      }
      if (bay.using === 'longtail' && bay.phase === 'drive') {
        for (const at of lt.v.hull.at) {
          const px = d.x + Math.sin(d.heading) * at
          const pz = d.z + Math.cos(d.heading) * at
          const dx = b.x - px
          const dz = b.z - pz
          const dist = Math.hypot(dx, dz)
          const min = lt.v.hull.r + BALL_R
          if (dist < min && dist > 1e-4) {
            const nx = dx / dist
            const nz = dz / dist
            b.x = px + nx * min
            b.z = pz + nz * min
            // Aimed for her: mostly toward the field, a little the way the hull hit it.
            const ax = nx + ((FIELD.x - b.x) / toField) * 2
            const az = nz + ((FIELD.z - b.z) / toField) * 2
            const al = Math.hypot(ax, az) || 1
            const push = Math.max(3.5, Math.abs(d.speed) * 1.3)
            b.vx = (ax / al) * push
            b.vz = (az / al) * push
            this.bumped = true
            b.spin = 8
            sfx.boop()
            bay.spray.burst(b.x, 0.2, b.z, 5, 1.8, 2.2, 0.14)
            this.kids.forEach((k) => (k.cheer = 0.8))
          }
        }
      }
      // Bounce off the houses.
      for (const h of HOUSES) {
        const qx = clamp(b.x, h.x - h.hx, h.x + h.hx)
        const qz = clamp(b.z, h.z - h.hz, h.z + h.hz)
        const dist = Math.hypot(b.x - qx, b.z - qz)
        if (dist < BALL_R) {
          // Bounce, and out of the wall (never stuck inside a house).
          const nx = dist > 1e-4 ? (b.x - qx) / dist : Math.sign(b.x - h.x) || 1
          const nz = dist > 1e-4 ? (b.z - qz) / dist : 0
          b.x = qx + nx * BALL_R * 1.05
          b.z = qz + nz * BALL_R * 1.05
          const vn = b.vx * nx + b.vz * nz
          if (vn < 0) {
            b.vx -= 1.6 * vn * nx
            b.vz -= 1.6 * vn * nz
          }
        }
      }
      // Back at the field's edge: it hops up onto the field.
      const inX = Math.abs(b.x - F.x) < F.hx + 2.5
      const inZ = Math.abs(b.z - F.z) < F.hz + 2.5
      if (inX && inZ) {
        this.goal = 'hop'
        this.goalT = 0
        this.hopFrom.set(b.x, 0, b.z)
        this.hopTo.set(clamp(b.x, F.x - F.hx + 1.2, F.x + F.hx - 1.2), 0.47 + BALL_R, clamp(b.z, F.z - F.hz + 1.5, F.z + F.hz - 1.5))
        sfx.boing()
        this.kids.forEach((k) => (k.cheer = 1.2))
      }
      this.ball.position.set(b.x, swell(b.x, b.z, t) + BALL_R * 0.55, b.z)
      this.ball.rotation.x += b.spin * dt
      this.ball.rotation.z += b.vx * dt
      return
    }
    this.goalT += dt
    const kicker = this.kids[0]
    const goalAt = new Vector3(F.x, 0.47 + BALL_R, F.z - F.hz + 0.2)
    if (this.goal === 'hop') {
      const k = Math.min(1, this.goalT / 0.55)
      this.ball.position.lerpVectors(this.hopFrom, this.hopTo, k)
      this.ball.position.y = this.hopFrom.y + (this.hopTo.y - this.hopFrom.y) * k + bell(k) * 1.4
      // The kicker runs to the ball.
      kicker.pos.lerp(tmp.copy(this.hopTo).setY(0.47).add(new Vector3(0, 0, 0.8)), Math.min(1, dt * 3))
      if (this.goalT > 1.3) {
        this.goal = 'kick'
        this.goalT = 0
        sfx.kick()
        kicker.jump = 0
      }
    } else if (this.goal === 'kick') {
      const k = Math.min(1, this.goalT / 0.8)
      this.ball.position.lerpVectors(this.hopTo, goalAt, k)
      this.ball.position.y += bell(k) * 1.2
      this.ball.rotation.x -= dt * 16
      if (k >= 1) {
        this.goal = 'goal'
        this.goalT = 0
        sfx.whistle()
        sfx.cheer()
        bay.say(L.bay.goal)
        this.goals++
        this.kids.forEach((k, i) => {
          k.cheer = 3.5
          k.jump = -i * 0.15
        })
        bay.spray.burst(goalAt.x, 1.4, goalAt.z, 18, 2.5, 4, 0.18)
        for (const r of bay.riders) bay.strike(r, 'cheer', 1.8)
      }
    } else if (this.goal === 'goal') {
      // The ball drops in the net; then "Khob khun ka!" and a football for her.
      this.ball.position.y = Math.max(0.47 + BALL_R, this.ball.position.y - dt * 2)
      // Another goal (she's played again): just the cheering.
      if (this.goals > 1 && this.goalT > 1.7) {
        this.goal = 'done'
        this.goalT = 0
        this.playT = 0
      } else if (this.goalT > 1.7 && !this.gift.visible) {
        bay.say(L.bay.thanks)
        setTimeout(() => bay.once('khobkhun', L.bay.facts.khobkhun), 2000)
        this.kids.forEach((k) => (k.cheer = 2))
        this.gift.visible = true
        this.gift.position.copy(this.kids[1].rig.root.position).setY(1.2)
        this.gift.scale.setScalar(1)
        this.goal = 'gift'
        this.goalT = 0
        this.hopFrom.copy(this.gift.position)
      }
    } else if (this.goal === 'gift') {
      // Tossed in an arc into the boat, wherever it is.
      const k = Math.min(1, this.goalT / 1.0)
      const to = lt.v.body.localToWorld(tmp.set(...CARGO.football))
      this.gift.position.lerpVectors(this.hopFrom, to, k)
      this.gift.position.y += bell(k) * 3
      this.gift.rotation.x += dt * 10
      if (k >= 1) {
        this.giveFootball()
        sfx.thump()
        bay.cheer(bay.rider('kaylee'))
        this.goal = 'done'
        this.goalT = 0
        this.playT = 0
        // Daddy snaps the photo with the kids cheering behind.
        setTimeout(() => {
          sfx.shutter()
          bay.flash()
          bay.photo('village')
        }, 700)
      }
    } else if (this.goal === 'kickout') {
      // A big kick out into the water: again, Kaylee!
      const k = Math.min(1, this.goalT / 1.1)
      this.ball.position.lerpVectors(this.hopFrom, this.hopTo, k)
      this.ball.position.y += bell(k) * 2.4
      if (k >= 1) {
        b.x = this.hopTo.x
        b.z = this.hopTo.z
        b.vx = b.vz = 0
        this.bumped = false
        this.goal = 'loose'
        sfx.splash(0.5)
        bay.foam.emit(b.x, 0.03, b.z, 0, 0, 0, 1.4, 1.2)
      }
    } else {
      // The kids play on: the ball goes from one to the other. While she's here, after a while they kick it back out
      // to her for another goal (two more).
      this.playT += dt
      if (this.here && this.goals < 3 && this.playT > 7 && bay.phase === 'drive' && bay.using === 'longtail') {
        const out = this.goals % 2 ? new Vector3(FIELD.x + FIELD.hx + 7, 0, FIELD.z + 4) : new Vector3(FIELD.x + 3, 0, FIELD.z + FIELD.hz + 7)
        this.hopFrom.copy(this.ball.position)
        this.hopTo.copy(out).setY(BALL_R * 0.55)
        this.goal = 'kickout'
        this.goalT = 0
        sfx.kick()
        sfx.cheer()
        this.kids.forEach((k) => (k.cheer = 1))
        return
      }
      this.play.t += dt / 1.6
      if (this.play.t >= 1) this.kickAround()
      const a = this.kids[this.play.from].pos
      const c = this.kids[this.play.to].pos
      const k = Math.min(1, this.play.t)
      this.ball.position.lerpVectors(a, c, k)
      this.ball.position.y = 0.47 + BALL_R + bell(k) * 0.6
    }
  }

  private kickAround() {
    this.play.from = this.play.to
    this.play.to = (this.play.to + 1 + Math.floor(Math.random() * 2)) % 3
    this.play.t = 0
    if (this.here) sfx.kick()
  }

  private updateKids(dt: number, t: number) {
    const d = this.bay.rides.longtail.d
    for (const [i, k] of this.kids.entries()) {
      const { rig } = k
      k.life.update(dt)
      if (this.goal !== 'hop' || i !== 0) k.pos.lerp(k.home, Math.min(1, dt * 1.5))
      rig.root.position.copy(k.pos)
      // They watch the boat (or the ball), cheer with their arms up, jump.
      const look = this.goal === 'loose' ? new Vector3(d.x, 0, d.z) : this.ball.position
      rig.root.rotation.y = Math.atan2(look.x - k.pos.x, look.z - k.pos.z)
      k.cheer = Math.max(0, k.cheer - dt)
      const up = Math.min(1, k.cheer * 2)
      rig.armL.rotation.z = -(0.3 + 1.9 * up) + Math.sin(t * 10 + i) * 0.2 * up
      rig.armR.rotation.z = 0.3 + 1.9 * up - Math.sin(t * 10 + i) * 0.2 * up
      if (k.jump > -1) {
        k.jump += dt / 0.5
        if (k.jump >= 0) {
          const j = Math.min(1, k.jump)
          rig.root.position.y = k.pos.y + bell(j) * 0.5
          if (j >= 1) k.jump = this.goal === 'goal' && this.goalT < 1.5 ? -0.2 : -1
        }
      }
      // A little bounce on their toes while the ball is loose (come on, push it back!).
      if (this.goal === 'loose') rig.body.position.y = Math.abs(Math.sin(t * 5 + i)) * 0.05
    }
  }

  // ---------------------------------------------------------------- the photo

  photoCamera(kind: PhotoKind, staged: boolean): PerspectiveCamera | null {
    if (kind !== 'village') return null
    const F = FIELD
    if (staged) {
      // The boat by the field's edge, everyone cheering (a deep link's album).
      const lt = this.bay.rides.longtail
      lt.d.place(F.x + F.hx + 3.2, F.z + 2.5, -Math.PI / 2)
      this.bay.seatAll(lt)
      for (const r of this.bay.riders) {
        applyPose(r.char.rig, 'cheer', 0.3, 1)
      }
      for (const k of this.kids) {
        k.rig.armL.rotation.z = -2.2
        k.rig.armR.rotation.z = 2.2
      }
    }
    // From out on the water past the boat, looking back at it with the field and the cheering kids behind.
    const d = this.bay.rides.longtail.d
    let ox = d.x - F.x
    let oz = d.z - F.z
    const len = Math.hypot(ox, oz) || 1
    ox /= len
    oz /= len
    const near = Math.min(len, 16)
    const bx = F.x + ox * near
    const bz = F.z + oz * near
    const sx = -oz * 2.5
    const sz = ox * 2.5
    return photoCamera(46, bx + ox * 9 + sx, 3.6, bz + oz * 9 + sz, (bx + F.x) / 2, 1.1, (bz + F.z) / 2)
  }

  qa() {
    return { ball: this.goal }
  }
}

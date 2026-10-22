// Arriving at ICONSIAM (plan: thailand/mall-trip.md, "Arrive at ICONSIAM"), a Stage like the airport (trip/legs/
// airport.ts): one 3D world with three sets far apart, and the camera cuts between them behind a white flash.
//
// 1. The glimpse (about 3 s, a tap skips it): Mommy's grey Veloz pulls up at the drop-off in front of the zig-zag
//    glass front (folded panels, like baisri) with the river beside it; they hop out and head for the doors.
// 2. The lift: she taps the big button and it dings up 1 to 6 (the screen shows the floor number big, in HTML), and the
//    doors open onto HarborLand's colors.
// 3. The HarborLand counter, tiny toys (any order): tap the rack and Kaylee's shoes hop into a cubby (Daddy's big ones
//    don't fit: he squashes them in); tap a pair of grip socks (pink, lavender, mint) and she wears them (her pick is
//    `socks`; tap another pair to swap), and Daddy's pair stretches up to his knees; tap the height chart and she
//    stands against it: her horn counts ("Wow, so tall!"), then Daddy's horn goes off the top. A HarborLand staff
//    member (the hall's buffalo in a red polo) stands behind the counter. Once her socks are on, the gate into the hall
//    glows: tap it and in they go (`hall?from=in`).
// No voices yet: the lines (words.ts) show in the guide's bubble.
import { Color, Group, Mesh, MeshBasicMaterial, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp, sounds, wobble } from '../../../../../sdk'
import type { Avatar } from '../../characters/avatar'
import { buildAnimal, type Rig } from '../../characters/animal'
import { FaceLife } from '../../characters/face'
import type { Member } from '../../characters/member'
import type { AnchorInfo } from '../../engine/Anchors'
import type { Shot } from '../../engine/camera'
import { merge, P, solid } from '../../engine/geo'
import { Particles } from '../../engine/particles'
import { PAL } from '../../engine/toon'
import { sfx } from '../../sfx'
import { Stage, type AnchorSpot, type LegEvents } from '../../trip/legs/stage'
import { buildVeloz, type Veloz } from '../../trip/vehicles/veloz'
import { STAFF_LOOKS } from './hall/kids'
import { SOCK_COLORS, wearSocks } from './socks'
import { W } from './words'

export interface ArriveEvents extends LegEvents {
  /** The lift's floor (the screen shows it big), or 0 when the lift isn't on screen. */
  floor(n: number): void
  /** She picked her grip socks. */
  socks(id: string): void
  /** A white flash over the screen (the cuts between the sets). */
  flash(): void
}

export const SOCK_IDS = ['pink', 'lavender', 'mint'] as const
export type SockId = (typeof SOCK_IDS)[number]

export const ARRIVE_ANCHORS: AnchorInfo[] = [
  { id: 'veloz', label: "Mommy's car", kind: 'thing' },
  { id: 'mall', label: 'ICONSIAM', kind: 'thing' },
  { id: 'lift-button', label: 'The lift button', kind: 'thing' },
  { id: 'rack', label: 'The shoe rack', kind: 'thing' },
  ...SOCK_IDS.map((id): AnchorInfo => ({ id: `socks:${id}`, label: `${id[0].toUpperCase()}${id.slice(1)} socks`, kind: 'thing' })),
  { id: 'chart', label: 'The height chart', kind: 'thing' },
  { id: 'gate', label: 'Into HarborLand', kind: 'thing' },
  { id: 'staff', label: 'HarborLand staff', kind: 'thing' },
  { id: 'bell', label: 'The counter bell', kind: 'thing' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'family:kaylee', label: 'Kaylee', kind: 'family' },
]

type Phase = 'glimpse' | 'lift' | 'up' | 'open' | 'counter' | 'in'
type Who = 'kaylee' | 'ji' | 'nick'

// The three sets (meters), far apart along x so a cut never shows the others.
const LX = 100
const CX = 200
/** The drop-off: the car stops at STOP; the glass front runs along FRONT_Z. */
const STOP = 0.6
const ROAD_Z = 1.3
const FRONT_Z = -5.2
/** In the lift: where they stand, the button panel by the doors. */
const LIFT = { w: 2.6, d: 2.0, h: 2.7, button: new Vector3(LX + 0.95, 1.15, -0.93) }
const LIFT_AT: Record<Who, [number, number]> = { kaylee: [LX + 0.38, 0.3], ji: [LX - 0.8, 0.0], nick: [LX - 0.15, -0.35] }
/** At the counter: where they stand, the counter, the rack, the chart and the gate. */
const AT: Record<Who, [number, number]> = { kaylee: [CX - 1.95, 0.45], ji: [CX - 1.15, 0.95], nick: [CX + 1.8, 0.55] }
const DESK = { x: CX + 0.3, z: -1.55, w: 2.4, h: 0.82, d: 0.7 }
const SOCK_X: Record<SockId, number> = { pink: CX - 0.35, lavender: CX + 0.3, mint: CX + 0.95 }
const RACK = { x: CX - 3.3, z: -2.55, w: 1.5, h: 1.2, cols: 3, rows: 2 }
const CHART = { x: CX + 2.55, z: -2.82, top: 1.62 }
const GATE = { x: CX + 4.3, z: -2.4 }

const tmp = new Vector3()

export class Arrive extends Stage {
  private phase: Phase = 'glimpse'
  private phaseT = 0
  private car: Veloz
  private carX = -22
  private doorK = 0
  private doorGoal = 0
  private riders: Record<Who, Avatar | Member>
  private kaylee: Avatar
  private staff: Rig
  private staffLife: FaceLife
  private staffHop = 1
  private mall: Group
  private liftBox: Group
  private liftDoors: Group[]
  private liftK = 0
  private button: Group
  private buttonPress = 1
  private floorN = 1
  private floorT = 0
  private bell: Group
  private bellK = 1
  private rack: Group
  private rackK = 1
  private chart: Group
  private marker: Group
  private markerY = CHART.top
  private markerGoal = CHART.top
  private markerOff = 0
  private gate: Group
  private gateK = 0
  private sockPairs: Record<SockId, Group>
  private sockHop: { id: SockId; t: number } | null = null
  private worn: { id: SockId; kaylee: Group; nick: Group; stretch: number } | null = null
  /** Kaylee's shoes and Daddy's: at their feet, flying, or in the rack (Daddy's squashed in). */
  private shoes: { g: Group; owner: Who; from: Vector3; to: Vector3; t: number; state: 'feet' | 'fly' | 'in' | 'stuck' }[] = []
  private squash = 1
  private done = { shoes: false, socks: false, chart: false }
  private chartBusy = false
  private confetti: Particles
  private hinted = new Set<string>()

  constructor(renderer: WebGLRenderer, private ev: ArriveEvents, start: { socks?: string; skipGlimpse?: boolean } = {}) {
    super(renderer, ev)
    const { scene, bag } = this
    scene.background = new Color('#BFE6FF')
    this.rig.fov = 34
    // ---------------------------------------------------------------- the glimpse
    scene.add(
      solid(merge([
        // The drop-off road, the kerb and the plaza in front of the glass.
        P.box(40, 0.1, 30, '#C9C4DE', { at: [-4, -0.05, 14.4] }),
        ...Array.from({ length: 8 }, (_, i) => P.box(1.4, 0.01, 0.14, PAL.butter, { at: [-14 + i * 4, 0.002, 3.6] })),
        P.box(34, 0.16, 0.4, '#E6E0F2', { at: [0, 0.08, -0.6] }),
        P.box(34, 0.1, 4.6, '#FFF7F0', { at: [0, -0.04, -3.0] }),
        // The canopy over the doors, on two white posts.
        P.rbox(7, 0.22, 2.4, 0.08, '#FFFFFF', { at: [0, 3.4, -3.9] }),
        ...[-3.2, 3.2].map((x) => P.cyl(0.09, 0.09, 3.4, '#FFFFFF', { at: [x, 1.7, -2.9] })),
        // The river on the right (the Chao Phraya), its far bank, and a little longtail on it.
        P.box(30, 0.06, 34, '#7CC7F0', { at: [31, -0.08, 0] }),
        P.box(30, 0.6, 3, '#8FD49A', { at: [31, 0.2, -18] }),
        P.rbox(2.2, 0.35, 0.6, 0.15, '#E8434F', { at: [20.5, 0.12, 1.5] }),
        P.box(0.08, 0.7, 0.08, PAL.ink, { at: [19.6, 0.5, 1.5] }),
        // A railing along the river walk.
        ...Array.from({ length: 11 }, (_, i) => P.box(0.06, 0.8, 0.06, '#FFFFFF', { at: [16.2, 0.4, -9 + i * 1.6] })),
        P.box(0.08, 0.06, 16.2, '#FFFFFF', { at: [16.2, 0.8, -1] }),
      ]), bag, 1.5),
    )
    // Palms: a trunk and a fan of leaves.
    for (const [x, z] of [[-11, -1.8], [11.5, -1.6], [15.5, 1.2]]) {
      const p = solid(merge([P.cyl(0.13, 0.18, 4.2, '#C99A6E', { at: [0, 2.1, 0], rot: [0, 0, 0.08] }), ...Array.from({ length: 7 }, (_, i) => P.capsule(0.16, 1.5, '#5FCB8F', { at: [0.17 + Math.cos((i * Math.PI * 2) / 7) * 0.7, 4.15, Math.sin((i * Math.PI * 2) / 7) * 0.7], rot: [Math.sin((i * Math.PI * 2) / 7) * 1.1, 0, -Math.cos((i * Math.PI * 2) / 7) * 1.1], scale: [1, 1, 0.5] }))]), bag, 1.5)
      p.position.set(x, 0, z)
      scene.add(p)
    }
    // The glass front: tall panels folded in and out along it, like baisri (banana leaves folded into offerings),
    // white edges, a gold band at the top; it steps back as it goes up.
    this.mall = new Group()
    this.mall.userData.pick = 'mall'
    const glassA = bag.add(new MeshBasicMaterial({ color: '#8FCDEE' }))
    const glassB = bag.add(new MeshBasicMaterial({ color: '#E3F4FF' }))
    const frames: ReturnType<typeof P.box>[] = []
    const PW = 1.5
    for (let row = 0; row < 3; row++) {
      const h = 3.4
      const y = 1.7 + row * h
      const back = row * 0.9
      for (let i = -9; i < 9; i++) {
        const x = (i + 0.5) * PW
        const out = i % 2 === 0 ? 1 : -1
        const panel = new Mesh(bag.add(P.box(PW * 1.04, h, 0.04, '#FFFFFF')), (i + row) % 2 ? glassA : glassB)
        panel.position.set(x, y, FRONT_Z - back)
        panel.rotation.y = out * 0.42
        this.mall.add(panel)
        frames.push(P.box(0.06, h, 0.08, '#FFFFFF', { at: [i * PW, y, FRONT_Z - back + 0.3] }))
      }
      frames.push(P.box(27.5, 0.18, 0.4, row === 2 ? PAL.gold : '#FFFFFF', { at: [0, y + h / 2, FRONT_Z - back + 0.2] }))
    }
    // The folded tips along the top, like the points of a baisri, in gold.
    for (let i = -9; i < 9; i++) frames.push(P.prism([[-PW / 2, 0], [PW / 2, 0], [0, 1.1]], 0.12, i % 2 ? PAL.gold : '#FFE08A', { at: [(i + 0.5) * PW, 10.25, FRONT_Z - 1.8 + 0.2] }))
    this.mall.add(solid(merge(frames), bag, 1.5))
    scene.add(this.mall)
    this.car = buildVeloz(bag)
    this.car.root.position.set(this.carX, 0, ROAD_Z)
    this.car.root.rotation.y = Math.PI / 2
    this.car.root.userData.pick = 'veloz'
    scene.add(this.car.root)

    // ---------------------------------------------------------------- the lift
    this.liftBox = new Group()
    this.liftBox.position.set(LX, 0, 0)
    const { w, d, h } = LIFT
    this.liftBox.add(
      solid(merge([
        P.box(w + 0.3, 0.12, d + 0.3, '#B9B2CC', { at: [0, -0.06, 0] }),
        P.box(w + 0.3, 0.12, d + 0.3, '#E8E4F6', { at: [0, h + 0.06, 0] }),
        // The back wall either side of the doors, the side walls, the handrail, a soft light.
        ...[-1, 1].map((s) => P.box(0.66, h, 0.1, '#D8D2E6', { at: [s * (w / 2 - 0.33), h / 2, -d / 2] })),
        P.box(1.3, 0.5, 0.1, '#D8D2E6', { at: [0, h - 0.25, -d / 2] }),
        ...[-1, 1].map((s) => P.box(0.1, h, d, '#CFC8E2', { at: [s * (w / 2), h / 2, 0] })),
        ...[-1, 1].map((s) => P.box(0.05, 0.05, d - 0.3, '#FFFFFF', { at: [s * (w / 2 - 0.08), 0.95, 0] })),
        P.box(0.9, 0.04, 0.5, '#FFFBE6', { at: [0, h - 0.01, 0] }),
        // The floor indicator over the doors (the number itself is HTML), and the button panel by them.
        P.rbox(0.62, 0.32, 0.06, 0.04, PAL.ink, { at: [0, h - 0.27, -d / 2 + 0.07] }),
        P.rbox(0.38, 0.62, 0.05, 0.04, '#B9B2CC', { at: [0.95, 1.15, -d / 2 + 0.06] }),
      ]), bag, 1.5),
    )
    // What's waiting beyond the doors: HarborLand's colors.
    this.liftBox.add(solid(merge([P.box(3, h, 0.1, PAL.sky, { at: [0, h / 2, -d / 2 - 1.4] }), ...[PAL.hotpink, PAL.butter, PAL.mint, '#FF9A4D'].map((c, i) => P.box(3, 0.32, 0.12, c, { at: [0, 0.5 + i * 0.5, -d / 2 - 1.34] }))]), bag, 0))
    this.liftDoors = [-1, 1].map((s) => {
      const g = new Group()
      g.position.set(s * 0.33, 0, -d / 2 + 0.01)
      g.add(solid(merge([P.box(0.66, h - 0.5, 0.06, '#E8E4F6', { at: [0, (h - 0.5) / 2, 0] }), P.box(0.02, h - 0.6, 0.065, '#B9B2CC', { at: [-s * 0.32, (h - 0.5) / 2, 0] })]), bag, 1.5))
      this.liftBox.add(g)
      return g
    })
    this.button = solid(merge([P.cyl(0.13, 0.13, 0.06, PAL.hotpink, { rot: [Math.PI / 2, 0, 0] }, 24), P.torus(0.14, 0.02, '#FFFFFF')]), bag, 1.5)
    this.button.position.set(0.95, 1.18, -d / 2 + 0.1)
    this.button.userData.pick = 'lift-button'
    this.liftBox.add(this.button)
    scene.add(this.liftBox)

    // ---------------------------------------------------------------- the counter
    const counter = new Group()
    counter.add(
      solid(merge([
        // The mats (flowers on pink), the back wall in HarborLand's sky blue with stripes and dots.
        P.box(13, 0.1, 7, '#FFD6E7', { at: [CX, -0.05, 0] }),
        ...Array.from({ length: 12 }, (_, i) => P.sphere(0.32, i % 2 ? '#FFFFFF' : '#FFE27A', { at: [CX - 5.5 + i * 1.0, 0.0, 1.6 + (i % 3) * 0.7], scale: [1, 0.05, 0.7] })),
        P.box(16, 9, 0.2, PAL.sky, { at: [CX, 4.5, -3.1] }),
        P.box(1.2, 0.22, 0.6, '#E6E0F2', { at: [DESK.x + 0.15, 0.11, DESK.z - 0.65] }),
        ...[PAL.hotpink, PAL.butter, PAL.mint].map((c, i) => P.box(13, 0.2, 0.22, c, { at: [CX, 3.0 + i * 0.3, -3.08] })),
        // The counter: red with a yellow top and a stripe.
        P.rbox(DESK.w, DESK.h, DESK.d, 0.08, '#FF6F6F', { at: [DESK.x, DESK.h / 2, DESK.z] }),
        P.rbox(DESK.w + 0.12, 0.08, DESK.d + 0.12, 0.04, PAL.butter, { at: [DESK.x, DESK.h + 0.04, DESK.z] }),
        P.box(DESK.w + 0.01, 0.1, DESK.d + 0.01, '#FFFFFF', { at: [DESK.x, DESK.h * 0.55, DESK.z] }),
        // The height chart's board on the wall: rainbow bands, tick marks, a star at the top.
        ...['#FF8FB8', '#FFC2A8', '#FBEA9A', '#8FE3C8', '#A8DCFF', '#C9B5F7'].map((c, i) => P.box(0.5, CHART.top / 6, 0.05, c, { at: [CHART.x, (CHART.top / 6) * (i + 0.5), CHART.z] })),
        ...Array.from({ length: 9 }, (_, i) => P.box(i % 2 ? 0.12 : 0.22, 0.02, 0.06, PAL.ink, { at: [CHART.x - 0.2, 0.18 * (i + 1), CHART.z + 0.01] })),
      ]), bag, 1.5),
    )
    scene.add(counter)
    this.chart = solid(merge([P.box(0.62, CHART.top, 0.06, '#FFFFFF', { at: [0, CHART.top / 2, -0.03] })]), bag, 0)
    this.chart.position.set(CHART.x, 0, CHART.z - 0.04)
    this.chart.userData.pick = 'chart'
    scene.add(this.chart)
    this.marker = solid(merge([P.rbox(0.66, 0.06, 0.12, 0.03, PAL.hotpink, {}), P.sphere(0.08, PAL.gold, { at: [0.36, 0, 0.02] })]), bag, 1.5)
    this.marker.position.set(CHART.x, CHART.top, CHART.z + 0.1)
    scene.add(this.marker)
    // The shoe rack: cubbies in a frame.
    this.rack = new Group()
    this.rack.position.set(RACK.x, 0, RACK.z)
    const cw = RACK.w / RACK.cols
    const ch = RACK.h / RACK.rows
    this.rack.add(solid(merge([
      P.box(RACK.w + 0.1, RACK.h + 0.1, 0.5, '#C99A6E', { at: [0, RACK.h / 2 + 0.05, -0.05] }),
      ...Array.from({ length: RACK.cols * RACK.rows }, (_, i) => P.box(cw - 0.08, ch - 0.08, 0.1, ['#FFF7F0', '#FFE3EF', '#E3F7EE'][i % 3], { at: [-RACK.w / 2 + cw * ((i % RACK.cols) + 0.5), ch * (Math.floor(i / RACK.cols) + 0.5) + 0.05, 0.16] })),
    ]), bag, 1.5))
    this.rack.userData.pick = 'rack'
    scene.add(this.rack)
    // The bell on the counter.
    this.bell = solid(merge([P.sphere(0.09, PAL.gold, { scale: [1, 0.7, 1] }), P.cyl(0.11, 0.11, 0.02, '#D8D2E6', { at: [0, -0.04, 0] }), P.sphere(0.025, '#FFFFFF', { at: [0, 0.07, 0] })]), bag, 1.5)
    this.bell.position.set(DESK.x - 0.95, DESK.h + 0.12, DESK.z + 0.1)
    this.bell.userData.pick = 'bell'
    scene.add(this.bell)
    // Three pairs of grip socks on the counter: white tops, colored feet with dots on the soles.
    this.sockPairs = Object.fromEntries(SOCK_IDS.map((id) => {
      const g = new Group()
      g.add(solid(merge([-1, 1].flatMap((s) => [P.capsule(0.06, 0.16, '#FFFFFF', { at: [s * 0.08, 0.12, 0] }), P.sphere(0.075, SOCK_COLORS[id], { at: [s * 0.08, 0.03, 0.05], scale: [1, 0.7, 1.4] }), P.cyl(0.062, 0.062, 0.05, SOCK_COLORS[id], { at: [s * 0.08, 0.24, 0] })])), bag, 1.5))
      g.position.set(SOCK_X[id], DESK.h + 0.1, DESK.z + 0.12)
      g.userData.pick = `socks:${id}`
      scene.add(g)
      return [id, g]
    })) as Record<SockId, Group>
    // The gate into the hall: two posts, a rainbow arch, balloons, and the hall's light through it.
    this.gate = new Group()
    this.gate.position.set(GATE.x, 0, GATE.z)
    this.gate.add(solid(merge([
      ...[-1, 1].map((s) => P.cyl(0.12, 0.12, 2.6, '#FFFFFF', { at: [s * 0.85, 1.3, 0] })),
      ...[PAL.hotpink, PAL.butter, PAL.mint, PAL.sky].map((c, i) => P.torus(0.85 - i * 0.1, 0.06, c, { at: [0, 2.6, 0], scale: [1, 0.8, 1] }, Math.PI)),
      P.box(1.6, 2.4, 0.06, '#FFF6D8', { at: [0, 1.2, -0.25] }),
      ...[[-1.05, 2.9, PAL.hotpink], [1.05, 2.9, PAL.mint], [-1.0, 2.5, PAL.butter], [1.1, 2.5, PAL.lavenderDark]].map(([x, y, c]) => P.sphere(0.18, c as string, { at: [x as number, y as number, 0.1], scale: [1, 1.2, 1] })),
    ]), bag, 1.5))
    this.gate.userData.pick = 'gate'
    scene.add(this.gate)
    // The staff member behind the counter.
    this.staff = buildAnimal(STAFF_LOOKS[0], bag)
    this.staff.root.position.set(DESK.x + 0.15, 0, DESK.z - 0.65)
    this.staff.root.userData.pick = 'staff'
    scene.add(this.staff.root)
    this.staffLife = new FaceLife(this.staff, 'staff')
    this.confetti = new Particles({ kind: 'spray', count: 140, colors: [PAL.hotpink, PAL.gold, PAL.mint, PAL.sky, '#FFFFFF'], gravity: 4 }, bag)
    scene.add(this.confetti.mesh)

    // ---------------------------------------------------------------- the family
    const { kaylee, members } = this.makeFamily(['ji', 'nick'])
    this.kaylee = kaylee
    this.riders = { kaylee, ji: members.get('ji')!, nick: members.get('nick')! }
    for (const id of ['kaylee', 'ji', 'nick'] as const) scene.add(this.riders[id].root)
    // Their shoes (Kaylee's pink, Daddy's big blue ones), on their feet until the rack.
    for (const owner of ['kaylee', 'nick'] as const) {
      const c = this.riders[owner]
      const k = c.height
      for (const s of [-1, 1]) {
        const g = solid(merge([P.rbox(0.15 * k, 0.08 * k, 0.24 * k, 0.04 * k, owner === 'kaylee' ? PAL.hotpink : '#5D7BB0', { at: [0, 0.04 * k, 0.03 * k] }), P.box(0.1 * k, 0.02 * k, 0.04 * k, '#FFFFFF', { at: [0, 0.085 * k, 0.07 * k] })]), bag, 1.5)
        g.userData.side = s
        scene.add(g)
        this.shoes.push({ g, owner, from: new Vector3(), to: new Vector3(), t: 1, state: 'feet' })
      }
    }
    if (start.socks && (SOCK_IDS as readonly string[]).includes(start.socks) && start.skipGlimpse) this.wear(start.socks as SockId, true)
    this.toGlimpse()
    if (start.skipGlimpse) this.toLift()
  }

  // ---------------------------------------------------------------- the sets

  private setPhase(p: Phase) {
    this.phase = p
    this.phaseT = 0
  }

  private toGlimpse() {
    this.setPhase('glimpse')
    this.carX = -22
    this.doorK = this.doorGoal = 0
    for (const id of ['kaylee', 'ji', 'nick'] as const) {
      const c = this.riders[id]
      const seat = id === 'ji' ? this.car.seats.driver : id === 'nick' ? this.car.seats.nick : this.car.seats.kaylee
      seat.add(c.root)
      this.put(c, 0, 0, 0, 'sit', 0)
    }
    sfx.vroom()
    setTimeout(() => this.phase === 'glimpse' && this.events.say(W.arrive.here), 1200)
  }

  /** The car is at the doors: out they hop, and head in. */
  private hopOut() {
    if (this.phase !== 'glimpse') return
    this.doorGoal = 1
    sfx.creak()
    const order: Who[] = ['kaylee', 'ji', 'nick']
    order.forEach((id, i) => {
      const to = new Vector3(STOP - 1.0 + i * 1.0, 0, -1.6 - (i % 2) * 0.4)
      this.hop(this.riders[id], this.scene, to, { face: 180, delay: 0.25 + i * 0.25, arc: 0.5, dur: 0.5, done: () => {
        if (i === 2) setTimeout(() => this.cutToLift(), 900)
      } })
    })
  }

  private cutToLift() {
    if (this.phase !== 'glimpse' || this.disposed) return
    this.ev.flash()
    this.toLift()
  }

  private toLift() {
    this.setPhase('lift')
    this.liftK = 0
    this.floorN = 1
    this.ev.floor(1)
    for (const id of ['kaylee', 'ji', 'nick'] as const) {
      const c = this.riders[id]
      // (Out of the car seat; attach() can leave a half turn in x and z, so the whole rotation is set again.)
      if (c.root.parent !== this.scene) this.scene.attach(c.root)
      c.root.rotation.set(0, 0, 0)
      const [x, z] = LIFT_AT[id]
      this.put(c, x, 0, z, 'stand', id === 'kaylee' ? 0 : id === 'ji' ? 20 : -20)
    }
    this.placeShoes()
    this.lastTouch = this.time
    this.rig.setShot(this.shot(), true)
  }

  /** She pressed the big button: up it goes, a ding a floor. */
  private goUp() {
    if (this.phase !== 'lift') return
    this.setPhase('up')
    this.buttonPress = 0
    this.floorT = 0
    sfx.callDing()
    this.kaylee.react('hop')
  }

  private toCounter() {
    if (this.disposed) return
    this.ev.flash()
    this.ev.floor(0)
    this.setPhase('counter')
    for (const id of ['kaylee', 'ji', 'nick'] as const) {
      const [x, z] = AT[id]
      this.riders[id].root.rotation.set(0, 0, 0)
      this.put(this.riders[id], x, 0, z, 'stand', id === 'ji' ? 15 : id === 'nick' ? -20 : 0)
    }
    this.placeShoes()
    this.lastTouch = this.time
    this.rig.setShot(this.shot(), true)
    setTimeout(() => {
      if (this.phase !== 'counter') return
      this.staffHop = 0
      this.events.say(W.arrive.counter)
    }, 600)
  }

  // ---------------------------------------------------------------- touch

  protected pickRoots(): Object3D[] {
    return [this.car.root, this.mall, this.button, this.rack, this.chart, this.gate, this.bell, this.staff.root, ...Object.values(this.sockPairs), ...Object.values(this.riders).map((r) => r.root)]
  }

  protected onTap(id: string | null) {
    const ph = this.phase
    if (ph === 'glimpse') {
      // A tap skips the glimpse.
      if (id === 'veloz') sfx.beep()
      this.cutToLift()
      return
    }
    if (id?.startsWith('family:')) {
      const c = this.riders[id.slice(7) as Who]
      c?.react('hop')
      sfx.boing()
      return
    }
    switch (id) {
      case 'lift-button':
        if (ph === 'lift') this.goUp()
        else {
          this.buttonPress = 0
          sfx.boop()
        }
        return
      case 'rack':
        return this.shoesOff()
      case 'chart':
        return this.measure()
      case 'gate':
        return this.goIn()
      case 'staff':
        this.staffHop = 0
        sfx.haha()
        return
      case 'bell':
        this.bellK = 0
        sfx.callDing()
        this.staffHop = 0
        return
    }
    if (id?.startsWith('socks:')) return this.pickSocks(id.slice(6) as SockId)
    if (ph === 'lift' || ph === 'up') sfx.boop()
  }

  /** Shoes off: Kaylee's hop into a cubby, one, two; Daddy's big ones don't fit, so he squashes them in. */
  private shoesOff() {
    if (this.phase !== 'counter') return
    this.rackK = 0
    if (this.done.shoes) {
      sfx.boop()
      return
    }
    this.done.shoes = true
    this.kaylee.react('hop')
    const cubby = (i: number) => new Vector3(RACK.x - RACK.w / 2 + (RACK.w / RACK.cols) * ((i % RACK.cols) + 0.5), (RACK.h / RACK.rows) * (Math.floor(i / RACK.cols) + 0.5) + 0.0, RACK.z + 0.15)
    this.shoes.forEach((s, i) => {
      setTimeout(() => {
        s.from.copy(s.g.position)
        const slot = s.owner === 'kaylee' ? cubby(0) : cubby(1)
        s.to.copy(slot).add(new Vector3(((i % 2) - 0.5) * 0.18, 0, 0))
        s.t = 0
        s.state = 'fly'
        sfx.boing()
      }, i * 380)
    })
    setTimeout(() => {
      this.riders.nick.react('wiggle')
      this.events.say(W.arrive.shoes)
    }, 1900)
  }

  /** Her pick: the pair hops onto her feet; Daddy's pair (the same color, much too small) stretches to his knees. */
  private pickSocks(id: SockId) {
    if (this.phase !== 'counter' || this.sockHop || this.worn?.id === id) {
      if (this.worn?.id === id) this.kaylee.react('wiggle')
      return
    }
    const first = !this.worn
    this.sockHop = { id, t: 0 }
    sfx.fwip()
    if (first) setTimeout(() => this.phase === 'counter' && this.events.say(W.arrive.stretch), 1500)
  }

  private wear(id: SockId, instant = false) {
    const k = this.kaylee
    const n = this.riders.nick
    if (this.worn) {
      k.rig.body.remove(this.worn.kaylee)
      n.rig.body.remove(this.worn.nick)
      this.sockPairs[this.worn.id].visible = true
    }
    const kg = wearSocks(k, SOCK_COLORS[id], this.bag)
    // Daddy's: up to his knees (they stretch up from his feet).
    const H = n.height
    const ng = solid(merge([-1, 1].flatMap((s) => [P.sphere(0.075 * H, SOCK_COLORS[id], { at: [s * 0.085 * H, 0.03 * H, 0.02 * H], scale: [1, 0.66, 1.32] }), P.cyl(0.066 * H, 0.07 * H, 0.26 * H, '#FFFFFF', { at: [s * 0.085 * H, 0.13 * H, 0] }), P.cyl(0.069 * H, 0.069 * H, 0.03 * H, SOCK_COLORS[id], { at: [s * 0.085 * H, 0.25 * H, 0] })])), this.bag, 1.5)
    n.rig.body.add(ng)
    this.worn = { id, kaylee: kg, nick: ng, stretch: instant ? 1 : 0 }
    ng.scale.y = instant ? 1 : 0.2
    this.sockPairs[id].visible = false
    this.done.socks = true
    if (!instant) {
      this.ev.socks(id)
      this.kaylee.react('wiggle')
      sfx.giggle()
      this.confetti.burst(this.kaylee.root.position.x, 0.3, this.kaylee.root.position.z, 14, 1.2, 1.6, 0.06)
    }
  }

  /** The height chart: Kaylee stands against it and the marker comes down to her horn ("Wow, so tall!"); then Daddy,
   *  and his horn sends it off the top. */
  private measure() {
    if (this.phase !== 'counter' || this.chartBusy) {
      sfx.boop()
      return
    }
    this.chartBusy = true
    const k = this.kaylee
    const n = this.riders.nick
    const spot = new Vector3(CHART.x, 0, CHART.z + 0.42)
    const back = (c: Who) => new Vector3(AT[c][0], 0, AT[c][1])
    this.hop(k, this.scene, spot, { face: 0, dur: 0.85, arc: 0.6, done: () => {
      // Her horn counts.
      this.markerGoal = Math.min(CHART.top, k.height * 1.22)
      sfx.boop()
      setTimeout(() => {
        if (this.disposed) return
        sounds.sparkle()
        this.confetti.burst(CHART.x, this.markerGoal + 0.1, CHART.z + 0.3, 20, 1.4, 1.8, 0.06)
        this.staffHop = 0
        this.events.say(W.arrive.tall)
        k.react('wiggle')
      }, 650)
      setTimeout(() => {
        if (this.disposed) return
        this.hop(k, this.scene, back('kaylee'), { face: 0, dur: 0.5, arc: 0.4 })
        this.hop(n, this.scene, spot, { face: 0, delay: 0.3, dur: 0.6, arc: 0.45, done: () => {
          this.markerGoal = CHART.top
          setTimeout(() => {
            if (this.disposed) return
            // Off the top: it pops up and away, boing, and comes back down.
            this.markerOff = 0.001
            sfx.boink()
            sfx.haha()
            this.staffHop = 0
            this.events.say(W.arrive.horn)
            setTimeout(() => {
              if (this.disposed) return
              this.hop(n, this.scene, back('nick'), { face: -20, dur: 0.55, arc: 0.4, done: () => {
                this.done.chart = true
                this.chartBusy = false
              } })
            }, 1500)
          }, 500)
        } })
      }, 2300)
    } })
  }

  /** Through the gate into the hall (once her socks are on; before that the staff points at them). */
  private goIn() {
    if (this.phase !== 'counter') return
    if (!this.done.socks) {
      this.staffHop = 0
      sfx.boop()
      this.events.say(W.arrive.socks)
      return
    }
    this.setPhase('in')
    sounds.sparkle()
    this.events.say(W.arrive.gate)
    const order: Who[] = ['kaylee', 'nick', 'ji']
    order.forEach((id, i) => this.hop(this.riders[id], this.scene, new Vector3(GATE.x - 0.3 + i * 0.3, 0, GATE.z - 0.1), { face: 180, delay: i * 0.25, dur: 0.7, arc: 0.5, done: () => {
      if (i === 2) setTimeout(() => this.events.done('hall'), 400)
    } }))
  }

  // ---------------------------------------------------------------- per frame

  /** The shoes on their owners' feet (until they hop into the rack). */
  private placeShoes() {
    for (const s of this.shoes) {
      if (s.state !== 'feet') continue
      const c = this.riders[s.owner]
      const p = c.root.position
      const yaw = c.root.rotation.y
      const side = s.g.userData.side as number
      const off = 0.085 * c.height * side
      s.g.position.set(p.x + Math.cos(yaw) * off, p.y, p.z - Math.sin(yaw) * off)
      s.g.rotation.y = yaw
    }
  }

  protected step(dt: number, t: number) {
    this.phaseT += dt
    const ph = this.phase
    // The glimpse: the car rolls up to the doors and stops, then they hop out.
    if (ph === 'glimpse') {
      const k = clamp(this.phaseT / 1.8)
      this.carX = -22 + (STOP + 22) * (1 - (1 - k) ** 3)
      if (k >= 1 && this.doorGoal === 0) this.hopOut()
    }
    this.car.root.position.x = this.carX
    for (const w of this.car.wheels) w.rotation.x = this.carX / 0.4
    this.car.body.position.y = ph === 'glimpse' && this.phaseT < 1.8 ? Math.abs(Math.sin(this.carX * 2.2)) * 0.012 : 0
    this.doorK += (this.doorGoal - this.doorK) * (1 - Math.exp(-dt * 8))
    this.car.setDoors(this.doorK)
    // The lift: a ding a floor up to 6, then the doors open and they're at the counter.
    if (ph === 'up') {
      this.floorT += dt
      if (this.floorT > 0.75 && this.floorN < 6) {
        this.floorT = 0
        this.floorN++
        this.ev.floor(this.floorN)
        sounds.note(this.floorN + 1)
        if (this.floorN === 6) {
          sfx.callDing()
          this.events.say(W.arrive.six)
          this.setPhase('open')
        }
      }
    }
    if (ph === 'open' && this.phaseT > 1.9 && this.phaseT - dt <= 1.9) this.toCounter()
    this.liftK = clamp(this.liftK + (ph === 'open' ? dt / 0.7 : -dt / 0.5))
    for (const [i, g] of this.liftDoors.entries()) g.position.x = (i ? 1 : -1) * (0.33 + 0.62 * this.liftK)
    // The lift hums: a little shiver going up.
    this.liftBox.position.y = ph === 'up' ? Math.sin(t * 40) * 0.004 : 0
    this.buttonPress = Math.min(1, this.buttonPress + dt / 0.35)
    this.button.position.z = -LIFT.d / 2 + 0.1 - bell(this.buttonPress) * 0.04
    this.button.scale.setScalar(1 + (ph === 'lift' ? Math.abs(Math.sin(t * 3)) * 0.12 : 0))
    // The counter's toys.
    this.bellK = Math.min(1, this.bellK + dt / 0.6)
    this.bell.rotation.z = wobble(this.bellK, 4) * 0.3
    this.rackK = Math.min(1, this.rackK + dt / 0.5)
    this.rack.scale.set(1 + wobble(this.rackK, 3) * 0.04, 1 - wobble(this.rackK, 3) * 0.04, 1)
    this.placeShoes()
    for (const s of this.shoes) {
      // (In the car they'd be at the seat's feet: they show from the lift on.)
      s.g.visible = ph !== 'glimpse'
      if (s.state !== 'fly') continue
      s.t = Math.min(1, s.t + dt / 0.55)
      s.g.position.lerpVectors(s.from, s.to, s.t)
      s.g.position.y += bell(s.t) * 1.0
      s.g.rotation.x = s.t * Math.PI * 2
      if (s.t >= 1) {
        s.g.rotation.x = 0
        sfx.thump()
        // Daddy's are too big: they stick out of the cubby until he squashes them in.
        s.state = s.owner === 'nick' ? 'stuck' : 'in'
        if (s.owner === 'nick' && this.shoes.every((x) => x.owner !== 'nick' || x.state === 'stuck')) {
          this.riders.nick.react('hop')
          setTimeout(() => {
            if (this.disposed) return
            this.squash = 0
            sfx.thump()
            setTimeout(() => sfx.thump(), 200)
            for (const x of this.shoes) if (x.owner === 'nick') x.state = 'in'
          }, 900)
        }
      }
    }
    this.squash = Math.min(1, this.squash + dt / 0.6)
    for (const s of this.shoes) {
      if (s.owner !== 'nick' || (s.state !== 'stuck' && s.state !== 'in')) continue
      // Sticking out (big, poking forward), then squashed in with a squish.
      const stuck = s.state === 'stuck'
      s.g.scale.set(stuck ? 1 : 0.8, stuck ? 1 : 0.62 + wobble(this.squash, 3) * 0.2, stuck ? 1 : 0.7)
      s.g.position.z = s.to.z + (stuck ? 0.22 + Math.sin(t * 9) * 0.02 : 0)
    }
    // Socks: the pair hops from the counter to her feet, then they're on (and Daddy's stretch up to his knees).
    const sh = this.sockHop
    if (sh) {
      sh.t = Math.min(1, sh.t + dt / 0.55)
      const g = this.sockPairs[sh.id]
      const from = new Vector3(SOCK_X[sh.id], DESK.h + 0.1, DESK.z + 0.12)
      tmp.copy(this.kaylee.root.position)
      g.position.lerpVectors(from, tmp, sh.t)
      g.position.y += bell(sh.t) * 0.8
      if (sh.t >= 1) {
        this.sockHop = null
        g.position.copy(from)
        sfx.pop()
        this.wear(sh.id)
      }
    }
    if (this.worn && this.worn.stretch < 1) {
      this.worn.stretch = Math.min(1, this.worn.stretch + dt / 1.1)
      const k = this.worn.stretch
      // Pulled up in two tugs, then a boing.
      this.worn.nick.scale.y = 0.2 + 0.8 * Math.min(1, k * 1.25) + wobble(Math.max(0, k * 1.25 - 0.25), 3) * 0.12
      if (k > 0.3 && k - dt / 1.1 <= 0.3) this.riders.nick.react('hop')
    }
    // The height chart's marker eases to her horn, or flies off the top and comes back.
    if (this.markerOff > 0) {
      this.markerOff = Math.min(1, this.markerOff + dt / 1.4)
      this.markerY = CHART.top + bell(this.markerOff) * 1.6
      this.marker.rotation.z = this.markerOff * Math.PI * 4
      if (this.markerOff >= 1) {
        this.markerOff = 0
        this.marker.rotation.z = 0
        sfx.thump()
      }
    } else this.markerY += (this.markerGoal - this.markerY) * (1 - Math.exp(-dt * 5))
    this.marker.position.y = this.markerY
    // The gate glows once her socks are on.
    this.gateK = Math.min(1, this.gateK + dt * (this.done.socks ? 1 : -1))
    this.gate.scale.setScalar(1 + (this.done.socks && ph === 'counter' ? Math.abs(Math.sin(t * 2.6)) * 0.04 : 0))
    // The staff breathes and hops; everyone looks at what's happening.
    this.staffHop = Math.min(1, this.staffHop + dt / 0.55)
    this.staffLife.update(dt)
    const b = 1 + Math.sin(t * 2.6) * 0.018
    this.staff.body.scale.set(1 / Math.sqrt(b), b, 1 / Math.sqrt(b))
    // (On a step behind the counter, so she shows over it.)
    this.staff.root.position.y = 0.22 + bell(this.staffHop) * 0.2
    this.staff.armR.rotation.z = 0.4 + bell(this.staffHop) * 1.6
    const look = ph === 'counter' || ph === 'in' ? (this.chartBusy ? tmp.set(CHART.x, 1.2, CHART.z) : tmp.copy(this.kaylee.root.position).setY(0.8)) : ph === 'glimpse' ? tmp.set(0, 4, FRONT_Z) : tmp.set(LX, LIFT.h - 0.3, -LIFT.d / 2)
    for (const [id, c] of Object.entries(this.riders)) {
      if (id !== 'kaylee' || ph !== 'counter') c.lookAt(look.x, look.y, look.z)
      else c.lookAt(this.staff.root.position.x, 1.2, this.staff.root.position.z)
      c.update(dt, t)
    }
    this.confetti.update(dt)
    // A hint once in each wait, after a while with nothing done.
    const idle = this.time - this.lastTouch
    if (idle > 7 && ph === 'lift' && !this.hinted.has('lift')) {
      this.hinted.add('lift')
      this.events.say(W.arrive.lift)
    }
  }

  // ---------------------------------------------------------------- camera, anchors

  protected shot(): Shot {
    const tall = this.w < this.h
    const ph = this.phase
    if (ph === 'glimpse') return tall ? { center: new Vector3(1.5, 3.4, -1.5), half: new Vector3(5.5, 4.4, 3), yaw: 12, pitch: 8, minDist: 8 } : { center: new Vector3(4.5, 3.4, -1.5), half: new Vector3(12.5, 3.8, 3), yaw: 12, pitch: 8, minDist: 8 }
    if (ph === 'lift' || ph === 'up' || ph === 'open') return { center: new Vector3(LX, 1.3, -0.1), half: tall ? new Vector3(1.4, 1.35, 1) : new Vector3(1.55, 1.25, 1), yaw: 0, pitch: 8, minDist: 3 }
    // The counter: the rack on the left, the counter and the socks, the chart, the gate on the right.
    if (tall) return { center: new Vector3(CX + 0.4, 1.2, -0.9), half: new Vector3(3.6, 1.3, 1.8), yaw: 0, pitch: 16, minDist: 4 }
    return { center: new Vector3(CX + 0.5, 1.25, -0.9), half: new Vector3(4.6, 1.35, 1.8), yaw: 0, pitch: 16, minDist: 4 }
  }

  protected anchorAt(id: string): AnchorSpot | null {
    const ph = this.phase
    const counter = ph === 'counter' || ph === 'in'
    switch (id) {
      case 'veloz':
        return ph === 'glimpse' ? { at: this.car.root.getWorldPosition(new Vector3()).setY(1.2), r: 1.4 } : null
      case 'mall':
        return ph === 'glimpse' ? { at: new Vector3(-6, 4.5, FRONT_Z), r: 1.2 } : null
      case 'lift-button':
        return ph === 'lift' || ph === 'up' || ph === 'open' ? { at: LIFT.button.clone(), r: 0.2, glow: ph === 'lift', prio: 3 } : null
      case 'rack':
        return counter ? { at: new Vector3(RACK.x, RACK.h * 0.6, RACK.z + 0.25), r: 0.6, glow: ph === 'counter' && !this.done.shoes && this.done.socks } : null
      case 'chart':
        return counter ? { at: new Vector3(CHART.x, 1.1, CHART.z + 0.1), r: 0.32, glow: ph === 'counter' && !this.done.chart && this.done.socks && !this.chartBusy } : null
      case 'gate':
        return counter ? { at: new Vector3(GATE.x, 1.3, GATE.z), r: 0.8, glow: ph === 'counter' && this.done.socks } : null
      case 'staff':
        return counter ? { at: this.staff.root.getWorldPosition(new Vector3()).setY(1.25), r: 0.3, max: 110 } : null
      case 'bell':
        return counter ? { at: this.bell.getWorldPosition(new Vector3()), r: 0.12, prio: 3 } : null
    }
    if (id.startsWith('socks:')) {
      const g = this.sockPairs[id.slice(6) as SockId]
      if (!counter || !g || !g.visible || this.sockHop?.id === id.slice(6)) return null
      return { at: g.getWorldPosition(new Vector3()).add(new Vector3(0, 0.12, 0)), r: 0.2, glow: ph === 'counter' && !this.done.socks, prio: 3 }
    }
    if (id.startsWith('family:')) {
      const c = this.riders[id.slice(7) as Who]
      if (!c || ph === 'glimpse' || ph === 'in') return null
      return { at: c.root.getWorldPosition(new Vector3()).setY(c.height * 0.55), r: c.height * 0.28, max: 120, prio: 0 }
    }
    return null
  }

  protected hintAt() {
    const ph = this.phase
    if (ph === 'lift') return LIFT.button.clone()
    if (ph !== 'counter' || this.chartBusy || this.sockHop) return null
    if (!this.done.socks) return this.sockPairs.pink.getWorldPosition(new Vector3()).add(new Vector3(0, 0.15, 0))
    if (!this.done.shoes) return new Vector3(RACK.x, RACK.h * 0.6, RACK.z + 0.25)
    if (!this.done.chart) return new Vector3(CHART.x, 1.1, CHART.z + 0.1)
    return new Vector3(GATE.x, 1.3, GATE.z)
  }

  qa() {
    return { leg: 'arrive', phase: this.phase, floor: this.floorN, socks: this.worn?.id ?? null, shoes: this.done.shoes, chart: this.done.chart, touches: this.touches }
  }
}

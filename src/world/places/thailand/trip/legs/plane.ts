// The window seat (plan: thailand/boat-trip.md, "The window seat"): Kaylee rides by the window, Mommy in the middle,
// Daddy on the aisle (asleep, mouth open). The pilot flies; she plays with the cabin, Toca style. The camera stands in
// the aisle in front of their row, so all three faces show and the round windows run along the wall beside them; the
// cabin is a whole little toy cabin (rows of seats, the overhead bins, the galley curtain at the back), and what's
// outside the windows is a real little world: the airport and the runway, fat toon clouds, Sparkle's balloon floating
// past, a V of storks, Thailand far below (the real outline), Krabi's sea and rock towers.
//
// - takeoff: seatbelt click, the plane rolls faster and faster (the runway streaks past), everyone presses back into
//   their seats, and up: whee!
// - fly: fold the tray down and press the call button (ding: the flight attendant rolls her trolley up and hands over
//   juice and a cookie; again and again, they pile up), the shade, the reading light ("Night night!", and Kaylee
//   pretends to snore), the air vent (it blows her mane), the seat-back screen (the little plane going down the
//   elephant's trunk; again: cartoons), Daddy (snorts awake), Mommy (shares her snack). Then the clouds part and the
//   camera leans out: all of Thailand below, an elephant's head with a long trunk, Kaylee's crayon ear and eye on it.
// - land: seatbelts on, the sea and the first rock islands come up, bump bump roll, and everyone claps. Then a white
//   flash and Krabi: the Thai-roofed arrivals arch and the songthaew, which drives them off to the pier (3 seconds).
//   On the boat trip with Baan Chang open (`fork`), it stops at the signpost down the road instead and Daddy asks
//   "Where to?": a tap on the elephant board turns it up the side road (to Baan Chang), the longtail board drives on
//   to the pier.
// Every part moves on by itself (about 35 s in all), whatever she does, and the ⏩ button skips ahead (`skip`).
import { CanvasTexture, CatmullRomCurve3, Color, ConeGeometry, ExtrudeGeometry, Fog, Group, Matrix4, Mesh, MeshBasicMaterial, Path, PlaneGeometry, Shape, ShapeGeometry, Sprite, SpriteMaterial, SRGBColorSpace, TextureLoader, TubeGeometry, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp, sounds } from '../../../../../sdk'
import type { Avatar } from '../../characters/avatar'
import { buildAnimal, type Rig } from '../../characters/animal'
import { FaceLife } from '../../characters/face'
import type { Look } from '../../characters/looks'
import type { Member } from '../../characters/member'
import type { AnchorInfo } from '../../engine/Anchors'
import type { Shot } from '../../engine/camera'
import { merge, P, solid } from '../../engine/geo'
import { makeHull } from '../../engine/outline'
import { PAL, toon } from '../../engine/toon'
import { L } from '../../lines'
import { sfx } from '../../sfx'
import { art } from '../../art'
import { drawSeatback } from '../drawings'
import { ELEPHANT, flat, PHUKET, PLACES, THAILAND, type LonLat } from '../outline'
import { wearing } from '../packing'
import { buildItem, buildSuitcase } from '../props'
import { buildArrival, type Arrival } from './krabi'
import { Stage, type AnchorSpot, type LegEvents } from './stage'

export type FlySection = 'takeoff' | 'fly' | 'land'

export const PLANE_ANCHORS: AnchorInfo[] = [
  { id: 'belt', label: 'Seatbelt', kind: 'thing' },
  { id: 'window', label: 'Window shade', kind: 'thing' },
  { id: 'tray', label: 'Tray', kind: 'thing' },
  { id: 'call', label: 'Call button', kind: 'thing' },
  { id: 'light', label: 'Reading light', kind: 'thing' },
  { id: 'vent', label: 'Air vent', kind: 'thing' },
  { id: 'screen', label: 'Seat-back screen', kind: 'thing' },
  { id: 'teddy', label: 'Teddy', kind: 'thing' },
  { id: 'attendant', label: 'Flight attendant', kind: 'thing' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'family:kaylee', label: 'Kaylee', kind: 'family' },
  { id: 'balloon', label: "Sparkle's balloon", kind: 'thing' },
  { id: 'songthaew', label: 'Songthaew', kind: 'thing' },
  { id: 'sign-chang', label: 'To the elephants', kind: 'thing' },
  { id: 'sign-pier', label: 'To the boat', kind: 'thing' },
]

/** Where the songthaew goes at Krabi: straight to the pier or to Baan Chang, or it stops at the signpost and she picks. */
export type KrabiFork = 'pier' | 'chang' | 'ask'

/** The flight attendant (a background figure with a line or two): a navy penguin in a pink scarf. */
export const ATTENDANT: Look = { species: 'penguin', height: 1.32, fur: '#4F5F9E', light: '#FFF6EC', dark: '#FFA640', extras: ['scarf'], lashes: true }

// The cabin (meters; the plane flies toward -x, the window wall is on Kaylee's side at -z, the aisle at +z).
const WALL_Z = -1.25
/** Round windows along the wall, one per row; Kaylee's (the one with the shade) is WINDOW. */
const WINDOW = { x: -0.62, y: 1.22, w: 0.7, h: 0.86 }
const WINDOWS = [-5.37, -4.42, -3.47, -2.52, -1.57, -0.62, 0.33, 1.28, 2.23]
const SEATS = { kaylee: -0.8, ji: 0.0, nick: 0.72 }
/** The aisle, and the two seats across it. */
const AISLE_Z = 1.38
const ACROSS = [2.05, 2.72]
const FAR_Z = 3.15
/** The rows behind theirs, and the galley curtain at the back. */
const ROWS_BEHIND = [0.98, 1.96]
const GALLEY_X = 2.75
const FRONT_X = -0.68
const TRAY_Y = 0.6
/** The top of their seat cushions. */
const SEAT_Y = 0.48
/** The cabin's height (tall for a toy plane, so the camera always stands under the ceiling). */
const CEIL = 3.6
/** The overhead bins' underside, where the call button, the reading light and the air vent are. */
const PSU_Y = 2.02
/** Thailand below: map units (flat degrees) to meters, and how far below the plane it is at cruising height. */
const MAP_S = 3
const CRUISE = 60
const TAKEOFF_ROLL = 4.5
const CLIMB_S = 4.5
const FLY_S = 18
/** Down from cruising height to the runway. */
const DESCEND_S = 6
/** The whole flight as built, takeoff to the cheer at Krabi (a trip can ask for a shorter or longer one). */
const FLIGHT_S = 35
/** Krabi: the arrival set, far from the cabin (shown behind a white flash), and how long the songthaew takes. */
const ARRIVAL_AT = new Vector3(0, 0, 420)
const SONGTHAEW_S = 3.1
/** Down the road to the signpost (s), and how long the turn up the side road or the drive on to the pier takes. */
const TO_FORK_S = 2.1
const FORK_AWAY_S = 1.9
/** Snacks on the tray, at most (the pile wobbles after that). */
const MAX_SNACKS = 14

type Ev = LegEvents & { flash?(): void }
type Who = 'kaylee' | 'ji' | 'nick'
const WHO: Who[] = ['kaylee', 'ji', 'nick']

const tmp = new Vector3()

export class PlaneRide extends Stage {
  private cabin = new Group()
  private seats: Record<Who, Group> = { kaylee: new Group(), ji: new Group(), nick: new Group() }
  private riders: { kaylee: Avatar; ji: Member; nick: Member }
  private haze = new Fog('#DCEFFB', 40, 210)
  private outside = new Group()
  private runway = new Group()
  private runwayDashes = new Group()
  private krabi = new Group()
  private thailand = new Group()
  private arrival: Arrival
  private clouds: { g: Object3D; speed: number }[] = []
  private storks = new Group()
  /** Their own little plane over the map below (the view of all of Thailand), and its dotted route. */
  private mini = new Group()
  private balloon: Sprite | null = null
  private parts: Record<'belt' | 'buckle' | 'shade' | 'tray' | 'call' | 'light' | 'vent' | 'cone' | 'screen', Object3D>
  private screen: { canvas: HTMLCanvasElement; tex: CanvasTexture; mode: 'map' | 'cartoon'; drawn: number }
  private teddy: Group | null = null
  private snacks: Group[] = []
  private attendant: { rig: Rig; life: FaceLife; root: Group; x: number; queue: number; wait: number; hand: number; served: number }
  /** Little Zs floating up from whoever is asleep (Daddy; Kaylee pretending). */
  private zs: { g: Group; t: number; who: Who }[] = []
  private zMesh: Group | null = null
  private sec: FlySection
  private secT = 0
  private belt = false
  private beltT = 0
  /** Takeoff: seconds rolling (-1 = waiting for the belt). */
  private roll = -1
  private alt = 2.2
  private progress = 0
  private shade = { down: false, k: 0 }
  private trayK = 0
  private trayOpen = false
  private lightOn = false
  private callGlow = 1
  private ventT = -1
  private turb = 1
  private dad = { asleep: true, t: 0 }
  /** Kaylee pretending to snore (the shade down and the reading light on). */
  private napping = false
  private clap = -1
  private view: 'cabin' | 'screen' | 'elephant' | 'krabi' = 'cabin'
  private viewT = 0
  private elephantDone = false
  private touchdown = -1
  private cheered = false
  /** Seconds into the songthaew ride at Krabi (-1: still on the plane). */
  private drive = -1
  /** At the signpost: seconds waiting there (-1: not there yet), which way she picked, and seconds since it set off. */
  private forkWait = -1
  private forkGo: 'chang' | 'pier' | null = null
  private forkT = 0
  private told = new Set<string>()
  private counts = { snacks: 0, shades: 0, lights: 0, screens: 0, belts: 0, vents: 0 }
  /** Flight seconds per real second (the trip's cap). */
  private pace = 1

  constructor(renderer: WebGLRenderer, protected events: Ev, start: FlySection, private packed: string[], private route: { from: LonLat; to: LonLat } = { from: PLACES.bangkok, to: PLACES.krabi }, cap = FLIGHT_S, private fork: KrabiFork = 'pier') {
    super(renderer, events)
    this.pace = FLIGHT_S / cap
    const { scene, bag } = this
    scene.background = new Color('#BFE6FF')
    scene.fog = this.haze
    this.rig.fov = 38
    this.rig.camera.far = 600
    scene.add(this.outside, this.cabin)
    this.parts = this.buildCabin()
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 176
    const tex = bag.add(new CanvasTexture(canvas))
    tex.colorSpace = SRGBColorSpace
    ;(this.parts.screen as Mesh).material = bag.add(new MeshBasicMaterial({ map: tex }))
    this.screen = { canvas, tex, mode: 'map', drawn: -1 }
    this.attendant = this.buildAttendant()
    this.buildOutside()
    this.arrival = buildArrival(bag)
    this.arrival.root.position.copy(ARRIVAL_AT)
    this.arrival.root.visible = false
    this.arrival.songthaew.root.userData.pick = 'songthaew'
    scene.add(this.arrival.root)
    const { kaylee, members } = this.makeFamily(['ji', 'nick'])
    kaylee.wear(wearing(packed))
    kaylee.glassesUp(true)
    this.riders = { kaylee, ji: members.get('ji')!, nick: members.get('nick')! }
    for (const id of WHO) {
      this.seats[id].add(this.riders[id].root)
      this.put(this.riders[id], 0, SEAT_Y, 0, 'sit', -90)
    }
    // Starting from a section link: the plane already where that part begins.
    this.sec = start
    if (start !== 'takeoff') {
      this.belt = true
      this.roll = 99
      this.alt = CRUISE
      this.progress = start === 'land' ? 1 : 0
      this.parts.belt.visible = true
    }
    this.place()
    setTimeout(() => this.events.say(start === 'land' ? L.trip.plane.land : start === 'fly' ? L.trip.plane.tray : L.trip.plane.belt), 400)
  }

  // ---------------------------------------------------------------- the cabin

  private buildCabin() {
    const { bag, cabin } = this
    const span = (WINDOWS[WINDOWS.length - 1] - WINDOWS[0]) / 2 + 1.6
    const mid = (WINDOWS[WINDOWS.length - 1] + WINDOWS[0]) / 2
    // The floor, the aisle's runner with little dots, the ceiling with its light strip, the far wall (its windows
    // painted on: only Kaylee's side looks out) and the galley at the back with its pink curtain. The big surfaces have
    // no ink line (the camera stands inside them); the curtain does.
    cabin.add(
      solid(
        merge([
          P.box(span * 2, 0.12, FAR_Z - WALL_Z + 0.4, '#D9D2EE', { at: [mid, -0.06, (FAR_Z + WALL_Z) / 2] }),
          P.box(span * 2, 0.02, 0.62, '#FFB8D4', { at: [mid, 0.005, AISLE_Z] }),
          ...Array.from({ length: 12 }, (_, i) => P.sphere(0.05, PAL.cream, { at: [-4.4 + i * 0.75, 0.02, AISLE_Z], scale: [1, 0.2, 1] })),
          P.box(span * 2, 0.1, FAR_Z - WALL_Z + 0.4, '#FBF8FF', { at: [mid, CEIL + 0.05, (FAR_Z + WALL_Z) / 2] }),
          P.box(span * 2, 0.04, 0.18, PAL.butter, { at: [mid, CEIL - 0.02, AISLE_Z] }),
          P.box(span * 2, CEIL, 0.14, '#F7F4FF', { at: [mid, CEIL / 2, FAR_Z + 0.07] }),
          ...WINDOWS.map((x) => P.cyl(WINDOW.w * 0.4, WINDOW.w * 0.4, 0.03, '#A8DCFF', { at: [x, WINDOW.y, FAR_Z - 0.01], rot: [Math.PI / 2, 0, 0], scale: [1, 1, WINDOW.h / WINDOW.w] }, 20)),
          P.box(0.14, CEIL, FAR_Z - WALL_Z, '#EFEAFB', { at: [GALLEY_X + 0.6, CEIL / 2, (FAR_Z + WALL_Z) / 2] }),
          // The galley's own wall either side of the curtain.
          P.box(0.14, CEIL, AISLE_Z - 0.85 - WALL_Z, '#EFEAFB', { at: [GALLEY_X + 0.05, CEIL / 2, (WALL_Z + AISLE_Z - 0.85) / 2] }),
          P.box(0.14, CEIL, FAR_Z - AISLE_Z - 0.85, '#EFEAFB', { at: [GALLEY_X + 0.05, CEIL / 2, (FAR_Z + AISLE_Z + 0.85) / 2] }),
        ]),
        bag,
        0,
      ),
      solid(
        merge([
          ...Array.from({ length: 6 }, (_, i) => P.rbox(0.08, 2.2, 0.36, 0.04, i % 2 ? '#FF9CC8' : '#FF8FB8', { at: [GALLEY_X, 1.12, AISLE_Z - 0.75 + i * 0.3], rot: [0, 0.25 * (i % 2 ? 1 : -1), 0] })),
          P.box(0.12, 0.12, 2.2, PAL.lavenderDark, { at: [GALLEY_X, 2.28, AISLE_Z] }),
        ]),
        bag,
        2,
      ),
    )
    // The window wall, with a real hole for every window: what's outside is outside.
    const wall = new Shape()
    wall.moveTo(mid - span, 0)
    wall.lineTo(mid + span, 0)
    wall.lineTo(mid + span, CEIL)
    wall.lineTo(mid - span, CEIL)
    wall.closePath()
    for (const x of WINDOWS) {
      const hole = new Path()
      hole.absellipse(x, WINDOW.y, WINDOW.w / 2, WINDOW.h / 2, 0, Math.PI * 2, false, 0)
      wall.holes.push(hole)
    }
    const wallGeo = bag.add(new ExtrudeGeometry(wall, { depth: 0.14, bevelEnabled: false, curveSegments: 24 }))
    const wallMesh = new Mesh(wallGeo, toon('#F7F4FF'))
    wallMesh.position.z = WALL_Z - 0.14
    cabin.add(wallMesh)
    // Seats: chubby lavender airline seats with pink-edged headrest covers and armrests. Theirs tilt (pressing back
    // at takeoff, Daddy dozing); the others are scenery.
    const seat = (x: number, z: number, c = '#B9A6F5') => [
      P.rbox(0.62, 0.18, 0.58, 0.07, c, { at: [x, 0.39, z] }),
      P.rbox(0.18, 1.02, 0.6, 0.07, c, { at: [x + 0.34, 0.86, z], rot: [0, 0, -0.12] }),
      P.rbox(0.2, 0.26, 0.5, 0.08, PAL.cream, { at: [x + 0.42, 1.28, z], rot: [0, 0, -0.12] }),
      P.rbox(0.21, 0.07, 0.5, 0.03, PAL.pink, { at: [x + 0.41, 1.2, z], rot: [0, 0, -0.12] }),
      P.box(0.08, 0.3, 0.5, '#8E7FC9', { at: [x + 0.05, 0.15, z] }),
    ]
    const armrest = (x: number, z: number) => [P.rbox(0.5, 0.07, 0.07, 0.03, '#9C8BD9', { at: [x - 0.02, 0.62, z] }), P.box(0.06, 0.2, 0.06, '#9C8BD9', { at: [x + 0.2, 0.5, z] }), P.box(0.1, 0.05, 0.08, PAL.ink, { at: [x - 0.24, 0.66, z] })]
    const scenery = []
    for (const x of ROWS_BEHIND) {
      for (const z of Object.values(SEATS)) scenery.push(...seat(x, z))
      for (const z of [-1.1, -0.4, 0.36, 1.04]) scenery.push(...armrest(x, z))
    }
    for (const x of [0, ...ROWS_BEHIND]) {
      for (const z of ACROSS) scenery.push(...seat(x, z))
      for (const z of [1.72, 2.38, 3.04]) scenery.push(...armrest(x, z))
    }
    for (const z of [-1.1, -0.4, 0.36, 1.04]) scenery.push(...armrest(0, z))
    cabin.add(solid(merge(scenery), bag, 2))
    for (const id of WHO) {
      const g = this.seats[id]
      g.position.set(0, 0, SEATS[id])
      g.add(solid(merge(seat(0, 0)), bag, 2))
      cabin.add(g)
    }
    // The row in front, cut low like the house's walls so the camera sees in: their seat backs with the trays and
    // the seat-back screens on top.
    cabin.add(solid(merge(Object.values(SEATS).flatMap((z) => [P.rbox(0.2, TRAY_Y + 0.02, 0.6, 0.07, '#A792EE', { at: [FRONT_X - 0.1, (TRAY_Y + 0.02) / 2, z] }), P.box(0.03, 0.12, 0.4, '#8E7FC9', { at: [FRONT_X + 0.005, TRAY_Y - 0.15, z] })])), bag, 2))
    cabin.add(solid(merge([P.rbox(span * 2, 0.5, 0.72, 0.1, '#EFEAFB', { at: [mid, 2.32, WALL_Z + 0.36] })]), bag, 0))
    // The overhead bins along the window wall, their latches, the panel above Kaylee, the stripe and the window frames.
    cabin.add(
      solid(
        merge([
          P.box(span * 2, 0.04, 0.04, PAL.lavenderDark, { at: [mid, 2.07, WALL_Z + 0.72] }),
          ...WINDOWS.map((x) => P.box(0.24, 0.05, 0.03, PAL.lavenderDark, { at: [x + 0.47, 2.22, WALL_Z + 0.73] })),
          P.rbox(1.12, 0.05, 0.4, 0.02, '#D9D2EE', { at: [0, PSU_Y + 0.03, SEATS.kaylee + 0.15] }),
          P.box(span * 2, 0.08, 0.035, PAL.pink, { at: [mid, 0.5, WALL_Z + 0.02] }),
          ...WINDOWS.map((x) => P.torus(0.5, 0.05, '#D9CCFF', { at: [x, WINDOW.y, WALL_Z + 0.01], scale: [WINDOW.w / 1.0, WINDOW.h / 1.0, 1] })),
        ]),
        bag,
        2,
      ),
    )
    // Seatbelt: a strap over each lap (Kaylee's shows once it's buckled), and her buckle.
    const strap = () => solid(merge([P.box(0.08, 0.04, 0.5, '#5E5468', { at: [-0.12, 0.56, 0] }), P.box(0.1, 0.05, 0.1, '#D8D2E6', { at: [-0.13, 0.57, 0] })]), bag, 1)
    const belt = strap()
    belt.visible = false
    this.seats.kaylee.add(belt)
    for (const id of ['ji', 'nick'] as const) this.seats[id].add(strap())
    const buckle = new Group()
    buckle.position.set(-0.16, 0.6, 0)
    buckle.add(solid(merge([P.rbox(0.1, 0.06, 0.12, 0.02, PAL.gold)]), bag, 1.5))
    this.seats.kaylee.add(buckle)
    // The shade (slides down over her window).
    const shade = new Group()
    shade.position.set(WINDOW.x, WINDOW.y + WINDOW.h / 2, WALL_Z + 0.03)
    shade.add(solid(merge([P.box(WINDOW.w + 0.06, WINDOW.h + 0.04, 0.02, '#E8E2F4', { at: [0, -(WINDOW.h + 0.04) / 2, 0] }), P.box(0.16, 0.04, 0.03, PAL.lavenderDark, { at: [0, -WINDOW.h - 0.02, 0.01] })]), bag, 1.5))
    shade.scale.y = 0.05
    cabin.add(shade)
    // Her tray, hinged on the seat in front (stowed: up against it; open: flat in front of her).
    const tray = new Group()
    tray.position.set(FRONT_X, TRAY_Y, SEATS.kaylee)
    tray.add(solid(merge([P.rbox(0.42, 0.03, 0.5, 0.02, '#E8E2F4', { at: [0.21, 0, 0] }), P.torus(0.05, 0.008, '#C9C1E6', { at: [0.3, 0.017, 0.12], rot: [Math.PI / 2, 0, 0] })]), bag, 1.5))
    tray.rotation.z = -Math.PI / 2
    cabin.add(tray)
    // The seat-back screen, standing up from the seat in front of her, facing her.
    const screenFrame = new Group()
    screenFrame.position.set(FRONT_X - 0.07, TRAY_Y + 0.13, SEATS.kaylee)
    screenFrame.rotation.z = 0.42
    screenFrame.add(solid(merge([P.rbox(0.06, 0.3, 0.42, 0.03, PAL.ink, { at: [0, 0, 0] })]), bag, 1.5))
    const screen = new Mesh(bag.add(new PlaneGeometry(0.37, 0.26)), bag.add(new MeshBasicMaterial({ color: '#1F2A55' })))
    screen.position.set(0.035, 0, 0)
    screen.rotation.y = Math.PI / 2
    screenFrame.add(screen)
    cabin.add(screenFrame)
    // Under the bin above Kaylee: the call button (with a little figure on it), the reading light and the air vent.
    const knob = (x: number, parts: Parameters<typeof merge>[0]) => {
      const g = new Group()
      g.position.set(x, PSU_Y, SEATS.kaylee + 0.15)
      g.add(solid(merge(parts), bag, 1.5))
      cabin.add(g)
      return g
    }
    const call = knob(0.42, [P.cyl(0.055, 0.055, 0.03, PAL.hotpink), P.sphere(0.012, PAL.cream, { at: [0, -0.018, 0.012] }), P.box(0.008, 0.004, 0.025, PAL.cream, { at: [0, -0.016, -0.006] })])
    const light = knob(0.0, [P.cyl(0.055, 0.045, 0.05, PAL.butter), P.cyl(0.035, 0.035, 0.01, '#FFFFFF', { at: [0, -0.03, 0] })])
    const vent = knob(-0.42, [P.cyl(0.05, 0.06, 0.04, '#D8D2E6'), P.sphere(0.035, '#B9B2CC', { at: [0, -0.03, 0], scale: [1, 0.7, 1] }), P.cyl(0.012, 0.012, 0.02, PAL.ink, { at: [0, -0.055, 0] })])
    const cone = new Mesh(bag.add(new ConeGeometry(0.45, 1.25, 20, 1, true)), bag.add(new MeshBasicMaterial({ color: PAL.butter, transparent: true, opacity: 0.25, depthWrite: false })))
    cone.position.set(0.0, PSU_Y - 0.64, SEATS.kaylee + 0.1)
    cone.visible = false
    cabin.add(cone)
    // Her teddy came along (if she packed it): on the armrest by the window.
    if (this.packed.includes('teddy')) {
      this.teddy = buildItem('teddy', bag)
      this.teddy.position.set(0.0, 0.62, SEATS.kaylee - 0.36)
      this.teddy.rotation.y = -Math.PI / 2
      this.teddy.scale.setScalar(0.8)
      this.cabin.add(this.teddy)
    }
    return { belt, buckle, shade, tray, call, light, vent, cone, screen }
  }

  /** The flight attendant and her trolley, waiting behind the galley curtain until the call button dings. */
  private buildAttendant() {
    const { bag } = this
    const root = new Group()
    const rig = buildAnimal(ATTENDANT, bag)
    rig.root.position.set(0.45, 0, 0)
    rig.root.rotation.y = -Math.PI / 2
    root.add(rig.root)
    const cart = new Group()
    cart.add(
      solid(
        merge([
          P.rbox(0.55, 0.82, 0.42, 0.05, '#E3DCF2', { at: [0, 0.5, 0] }),
          ...[0.3, 0.55, 0.8].map((y) => P.box(0.56, 0.02, 0.43, '#C9C1E6', { at: [0, y, 0] })),
          P.box(0.03, 0.05, 0.18, PAL.lavenderDark, { at: [-0.28, 0.68, 0] }),
          ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => P.sphere(0.045, PAL.ink, { at: [sx * 0.2, 0.05, sz * 0.15] }))),
          // Juice, cups and a tin of cookies on top.
          P.cyl(0.06, 0.06, 0.2, '#FF9F45', { at: [0.12, 1.02, -0.08] }),
          P.cyl(0.03, 0.03, 0.04, PAL.cream, { at: [0.12, 1.14, -0.08] }),
          ...[0, 1, 2].map((i) => P.cyl(0.04, 0.03, 0.07, '#FFFFFF', { at: [-0.12 + i * 0.03, 0.95 + i * 0.07, 0.1] })),
          P.cyl(0.09, 0.09, 0.08, PAL.mint, { at: [-0.1, 0.96, -0.08] }),
        ]),
        bag,
        2,
      ),
    )
    root.add(cart)
    root.position.set(GALLEY_X + 1.0, 0, AISLE_Z)
    root.userData.pick = 'attendant'
    this.cabin.add(root)
    return { rig, life: new FaceLife(rig, 'attendant'), root, x: GALLEY_X + 1.0, queue: 0, wait: 0, hand: 1, served: 0 }
  }

  // ---------------------------------------------------------------- outside

  private buildOutside() {
    const { bag, outside } = this
    // The airport at home (takeoff): grass, the runway and its dashes, and across it the terminal with its orange roof,
    // the control tower and a hangar, so the window has something to stream past.
    const ground = solid(
      merge([
        P.box(600, 0.1, 400, '#A9E3B8', { at: [0, -0.06, -150] }),
        P.box(600, 0.12, 14, '#B9B4CC', { at: [0, 0, -2] }),
        P.box(600, 0.04, 0.4, PAL.cream, { at: [0, 0.07, -8.4] }),
        ...Array.from({ length: 30 }, (_, i) => P.sphere(0.5, i % 3 ? '#FFB3D1' : PAL.butter, { at: [-90 + i * 6, 0.1, -12.5 - (i % 4)], scale: [1, 0.4, 1] }, 8)),
        P.box(46, 5, 9, '#FFF7F0', { at: [-6, 2.5, -40] }),
        P.box(46.4, 0.4, 9.4, PAL.gold, { at: [-6, 5.1, -40] }),
        ...[-1, 1].map((s) => P.box(47, 0.3, 6.6, '#FF8A4D', { at: [-6, 6.4, -40 + s * 2.4], rot: [s * 0.62, 0, 0] })),
        ...Array.from({ length: 10 }, (_, i) => P.box(3.2, 2.4, 0.1, '#A8DCFF', { at: [-26 + i * 4.4, 2.6, -35.45] })),
        P.cyl(1.2, 1.6, 16, '#F4EFF8', { at: [30, 8, -48] }),
        P.cyl(3.0, 2.4, 2.4, '#A8DCFF', { at: [30, 17.2, -48] }),
        P.cyl(3.3, 3.3, 0.6, PAL.hotpink, { at: [30, 18.7, -48] }),
        P.box(20, 7, 14, '#D9D2EE', { at: [60, 3.5, -46] }),
        P.cyl(7, 7, 20, '#C9C1E6', { at: [60, 7, -46], rot: [0, 0, Math.PI / 2], scale: [1, 0.5, 1] }),
      ]),
      bag,
      0,
    )
    this.runway.add(ground)
    for (let x = -60; x <= 60; x += 6) this.runwayDashes.add(solid(merge([P.box(3, 0.02, 0.3, PAL.cream, { at: [x, 0.07, -2] })]), bag, 0))
    this.runway.add(this.runwayDashes)
    outside.add(this.runway)
    // Krabi: the sea, the first rock islands standing straight out of it, a strip of beach and the runway.
    this.krabi.add(solid(merge([P.box(800, 0.1, 500, '#5FC7B4', { at: [0, -0.06, -260] }), P.box(800, 0.12, 30, '#A9E3B8', { at: [0, 0, 12] }), P.box(800, 0.14, 14, '#B9B4CC', { at: [0, 0.02, 2] }), P.box(800, 0.13, 3, '#FBE3B8', { at: [0, 0.01, -4.5] })]), bag, 0))
    const karsts = []
    for (let i = 0; i < 14; i++) {
      // The first ones close by, so they rise past the window as the plane comes down: lumpy towers with a dark notch
      // where the sea nibbles them and a cap of jungle.
      const x = -70 + i * 11 + (i % 3) * 4
      const z = -12 - (i % 4) * 9 - (i > 9 ? 30 : 0)
      const h = 6 + (i % 5) * 3
      const r = 4 + (i % 3)
      karsts.push(
        P.cyl(r * 0.85, r, h * 0.55, '#C9C1D9', { at: [x, h * 0.275, z] }, 12),
        P.cyl(r * 0.72, r * 0.86, h * 0.5, '#D3CBE2', { at: [x + 0.4, h * 0.77, z] }, 12),
        P.cyl(r * 1.04, r * 1.06, 0.8, '#A79FC2', { at: [x, 0.4, z] }, 12),
        P.sphere(r * 0.95, '#6FBF7F', { at: [x, h, z], scale: [1, 0.55, 1] }, 14),
      )
    }
    this.krabi.add(solid(merge(karsts), bag, 2))
    this.krabi.visible = false
    outside.add(this.krabi)
    // Thailand far below: the real outline, flat and green, with the mountains of the north as bumps, and Kaylee's
    // crayon ear and eye drawn on it, like on her map.
    this.buildThailand()
    outside.add(this.thailand)
    // Fat toon clouds all around, flat underneath (they drift past the window as the plane flies).
    for (let i = 0; i < 16; i++) {
      const puffs = [0, 1, 2, 3, 4].map((k) => P.sphere(1.3 + ((i + k) % 3) * 0.55, '#FFFFFF', { at: [k * 1.4 - 2.8, Math.sin(k * 2 + i) * 0.35 + (k % 2) * 0.5, (k % 2) * 0.8 - 0.4], scale: [1, 0.78, 1] }, 9))
      const g = solid(merge([...puffs, P.cyl(3.6, 3.6, 0.6, '#F4F0FF', { at: [0, -0.9, 0], scale: [1.3, 1, 0.55] }, 14)]), bag, 1.5)
      g.position.set(-70 + i * 9.5, -6 + (i % 5) * 3.2, -9 - (i % 4) * 8)
      outside.add(g)
      this.clouds.push({ g, speed: 9 + (i % 3) * 3 })
    }
    // A V of storks: white with black wing tips, long red beaks and legs trailing, wings that flap.
    for (let i = 0; i < 5; i++) {
      const s = new Group()
      s.add(solid(merge([P.sphere(0.25, '#FFFFFF', { scale: [1.6, 0.8, 0.8] }), P.capsule(0.06, 0.3, '#FFFFFF', { at: [-0.45, 0.06, 0], rot: [0, 0, Math.PI / 2] }), P.sphere(0.09, '#FFFFFF', { at: [-0.68, 0.08, 0] }), P.cone(0.04, 0.34, '#FF6F5E', { at: [-0.9, 0.06, 0], rot: [0, 0, Math.PI / 2] }), ...[-1, 1].map((sz) => P.cyl(0.015, 0.015, 0.5, '#FF6F5E', { at: [0.55, -0.04, sz * 0.05], rot: [0, 0, Math.PI / 2] })), P.sphere(0.02, PAL.ink, { at: [-0.72, 0.12, 0.07] })]), bag, 1.5))
      for (const sz of [-1, 1]) {
        const wing = new Group()
        wing.add(solid(merge([P.box(0.42, 0.04, 0.85, '#FFFFFF', { at: [0, 0, sz * 0.42] }), P.box(0.3, 0.045, 0.3, PAL.ink, { at: [0.05, 0, sz * 0.75] })]), bag, 1.5))
        wing.name = sz < 0 ? 'wingL' : 'wingR'
        s.add(wing)
      }
      s.position.set(Math.abs(i - 2) * 1.6, 0, (i - 2) * 1.6)
      this.storks.add(s)
    }
    this.storks.position.set(-30, 2, -12)
    this.storks.visible = false
    outside.add(this.storks)
    // Sparkle's hot-air balloon from the world map, Sparkle waving from its basket.
    const mat = bag.add(new SpriteMaterial({ transparent: true, depthWrite: false }))
    new TextureLoader().load(art.balloon, (t) => {
      if (this.disposed) return t.dispose()
      t.colorSpace = SRGBColorSpace
      mat.map = bag.add(t)
      mat.needsUpdate = true
    })
    this.balloon = new Sprite(mat)
    this.balloon.scale.set(3.4, 3.7, 1)
    this.balloon.visible = false
    this.balloon.userData.pick = 'balloon'
    outside.add(this.balloon)
  }

  /** A point on Thailand below (local to the thailand group: map east is +z, map north is +x). */
  private below(ll: LonLat, y: number) {
    const [x, n] = flat(ll)
    return new Vector3(n * MAP_S, y, x * MAP_S)
  }

  private buildThailand() {
    const { bag } = this
    const shape = (ring: LonLat[]) => {
      const s = new Shape()
      ring.forEach((ll, i) => {
        const [x, y] = flat(ll)
        if (i === 0) s.moveTo(x * MAP_S, y * MAP_S)
        else s.lineTo(x * MAP_S, y * MAP_S)
      })
      return s
    }
    const geo = bag.add(new ShapeGeometry([shape(THAILAND), shape(PHUKET)]))
    // Lie it flat: map east is +z, map north is +x (the plane flies toward -x: south, down the trunk).
    geo.applyMatrix4(new Matrix4().makeBasis(new Vector3(0, 0, 1), new Vector3(1, 0, 0), new Vector3(0, 1, 0)))
    const land = new Mesh(geo, toon('#8FD58F'))
    land.position.y = 0.3
    const hull = makeHull(geo, 3)
    bag.add(hull.geometry)
    land.add(hull)
    this.thailand.add(land)
    this.thailand.add(solid(merge([P.box(2000, 0.1, 2000, '#7FD3E6', { at: [0, -0.05, 0] }), ...PLACES.north.map((ll, i) => {
      const p = this.below(ll, 1.0)
      return P.cone(1.2 + (i % 2) * 0.4, 1.6 + (i % 3) * 0.5, '#B5E6A6', { at: [p.x, p.y, p.z] }, 8)
    })]), bag, 1.5))
    // Kaylee's crayon: the ear round the northeast bulge, and the eye.
    const ear = new CatmullRomCurve3(ELEPHANT.ear.map((ll) => this.below(ll, 0.55)), true)
    this.thailand.add(new Mesh(bag.add(new TubeGeometry(ear, 64, 0.18, 6, true)), toon('#FF5FA2')))
    const eye = this.below(ELEPHANT.eye, 0.5)
    this.thailand.add(solid(merge([P.cyl(0.6, 0.6, 0.12, PAL.ink, { at: [eye.x, eye.y, eye.z] }, 18), P.cyl(0.2, 0.2, 0.14, '#FFFFFF', { at: [eye.x + 0.2, eye.y + 0.02, eye.z + 0.2] }, 12)]), bag, 0))
    // Their route down the trunk, dotted, and the two pins.
    const a = this.below(this.route.from, 0.6)
    const b = this.below(this.route.to, 0.6)
    const dots = Array.from({ length: 22 }, (_, i) => P.sphere(0.32, PAL.butter, { at: [a.x + (b.x - a.x) * (i / 21), 0.6, a.z + (b.z - a.z) * (i / 21)], scale: [1, 0.4, 1] }, 8))
    this.thailand.add(solid(merge([...dots, ...[a, b].map((p) => P.cyl(0.9, 0.9, 0.3, PAL.hotpink, { at: [p.x, 0.7, p.z] }, 16))]), bag, 1.5))
    // Their little plane, flying over it (it stays above the camera's point; the map slides under it).
    this.mini.add(solid(merge([P.capsule(0.55, 2.6, '#FFFFFF', { rot: [0, 0, Math.PI / 2] }), P.box(1.0, 0.16, 4.2, '#E3DAFF'), P.box(0.6, 0.9, 0.12, PAL.hotpink, { at: [1.7, 0.6, 0] }), P.box(0.5, 0.12, 1.6, '#E3DAFF', { at: [1.7, 0.1, 0] })]), bag, 2))
    this.mini.visible = false
    this.outside.add(this.mini)
  }

  // ---------------------------------------------------------------- touch

  protected pickRoots(): Object3D[] {
    return [this.cabin, this.arrival.root, ...(this.balloon ? [this.balloon] : [])]
  }

  protected onTap(id: string | null) {
    // A tap anywhere brings the camera back from the screen.
    if (this.view === 'screen' && id !== 'screen') this.setView('cabin')
    const k = this.riders.kaylee
    switch (id) {
      case 'belt':
        this.setBelt(!this.belt || this.sec !== 'fly' ? true : false)
        return
      case 'window':
        this.shade.down = !this.shade.down
        this.counts.shades++
        sfx.fwip()
        this.checkNap()
        return
      case 'tray':
        this.trayOpen = !this.trayOpen
        sfx.thump()
        return
      case 'call':
        this.call()
        return
      case 'light':
        this.lightOn = !this.lightOn
        this.counts.lights++
        sfx.pop()
        this.checkNap()
        return
      case 'vent':
        // Whoosh: the air blows her mane back.
        this.ventT = 0
        this.counts.vents++
        sfx.whir()
        k.react('wiggle')
        return
      case 'screen':
        this.counts.screens++
        sounds.pop()
        if (this.view !== 'screen') {
          this.screen.mode = 'map'
          this.setView('screen')
        } else this.screen.mode = this.screen.mode === 'map' ? 'cartoon' : 'map'
        this.viewT = 0
        return
      case 'teddy':
        if (this.teddy) this.teddy.userData.hop = 0
        sfx.boop()
        return
      case 'attendant':
        // She gives a little wave with her flipper (and, standing at their row, one more snack).
        this.attendant.hand = 0
        sounds.pop()
        if (Math.abs(this.attendant.x) < 0.2) this.attendant.queue++
        return
      case 'family:nick':
        if (this.dad.asleep) {
          this.dad = { asleep: false, t: 0 }
          sfx.snort()
          this.riders.nick.react('hop')
          this.events.say(L.trip.plane.dad)
        } else this.riders.nick.react('wave')
        return
      case 'family:ji':
        // Mommy shares her snack.
        this.riders.ji.react('hop')
        if (this.trayOpen && this.snacks.length < MAX_SNACKS) {
          this.addSnack('cookie', this.seats.ji.getWorldPosition(new Vector3()).setY(1.2))
          if (!this.told.has('share')) {
            this.told.add('share')
            this.events.say(L.trip.plane.share)
          }
        } else sounds.sparkle()
        return
      case 'family:kaylee':
        this.napping = false
        k.react('hop')
        sfx.boing()
        return
      case 'balloon':
        sounds.sparkle()
        k.react('wave')
        return
      case 'songthaew':
        sfx.toot()
        return
      case 'sign-chang':
      case 'sign-pier':
        this.pickFork(id === 'sign-chang' ? 'chang' : 'pier')
        return
    }
  }

  private setBelt(on: boolean) {
    this.belt = on
    this.parts.belt.visible = on
    this.counts.belts++
    sfx.latch()
    this.riders.kaylee.react('wiggle')
  }

  /** Ding: the flight attendant rolls her trolley up the aisle with juice and a cookie (more and more). */
  private call() {
    this.callGlow = 0
    sfx.callDing()
    if (!this.trayOpen) {
      this.trayOpen = true
      sfx.thump()
    }
    this.attendant.queue++
  }

  /** Something to eat lands on her tray (more and more pile up). */
  private addSnack(kind: 'juice' | 'cookie', from: Vector3) {
    if (this.disposed) return
    if (this.snacks.length >= MAX_SNACKS) {
      // The pile is as high as it goes: it wobbles.
      this.turb = 0.7
      return
    }
    const g = new Group()
    g.add(
      kind === 'juice'
        ? solid(merge([P.cyl(0.05, 0.04, 0.12, '#FFFFFF', { at: [0, 0.06, 0] }), P.cyl(0.045, 0.045, 0.02, '#FF9F45', { at: [0, 0.1, 0] }), P.cyl(0.006, 0.006, 0.12, PAL.hotpink, { at: [0.02, 0.16, 0], rot: [0, 0, 0.2] })]), this.bag, 1.5)
        : solid(merge([P.cyl(0.06, 0.06, 0.025, '#E8B067', { at: [0, 0.013, 0] }), ...[0, 2.1, 4.2].map((a) => P.sphere(0.012, '#7A4A2A', { at: [Math.cos(a) * 0.03, 0.028, Math.sin(a) * 0.03] }))]), this.bag, 1.5),
    )
    const i = this.snacks.length
    const to = new Vector3(FRONT_X + 0.12 + (i % 2) * 0.17, TRAY_Y + 0.02 + Math.floor(i / 4) * 0.1, SEATS.kaylee - 0.12 + (Math.floor(i / 2) % 2) * 0.22)
    g.userData.fly = { from: this.cabin.worldToLocal(from.clone()), to, t: 0 }
    g.position.copy(g.userData.fly.from)
    this.cabin.add(g)
    this.snacks.push(g)
    this.counts.snacks++
    if (this.snacks.length === 1) this.riders.kaylee.react('hop')
  }

  /** The shade down and the reading light on: "Night night!", and Kaylee pretends to snore. */
  private checkNap() {
    const nap = this.shade.down && this.lightOn
    if (nap && !this.napping) {
      this.napping = true
      if (!this.told.has('night')) {
        this.told.add('night')
        this.events.say(L.trip.plane.snore)
      }
      setTimeout(() => this.napping && sfx.snort(), 900)
    } else if (!nap) this.napping = false
  }

  private setView(v: PlaneRide['view']) {
    const was = this.view
    this.view = v
    this.viewT = 0
    this.cabin.visible = v === 'cabin' || v === 'screen'
    this.outside.visible = v !== 'krabi'
    this.arrival.root.visible = v === 'krabi'
    // No haze on the view below (all of Thailand, crisp), nor in Krabi.
    this.scene.fog = v === 'elephant' || v === 'krabi' ? null : this.haze
    this.rig.lag = v === 'screen' ? 0.35 : 0.5
    // In and out of the view below happen behind a white flash: cut, don't fly through the wall.
    if (v === 'elephant' || was === 'elephant' || v === 'krabi') this.rig.setShot(this.shot(), true)
  }

  // ---------------------------------------------------------------- per frame

  private place() {
    // Where the plane is over Thailand: the map slides under it, down the trunk.
    const a = flat(this.route.from)
    const b = flat(this.route.to)
    const p = this.progress
    const east = a[0] + (b[0] - a[0]) * p
    const north = a[1] + (b[1] - a[1]) * p
    this.thailand.position.set(-north * MAP_S, -CRUISE, -east * MAP_S)
    this.mini.position.set(0, -CRUISE + 6, 0)
    this.mini.visible = this.view === 'elephant'
    this.runway.position.y = -this.alt
    this.krabi.position.y = -this.alt
    this.runway.visible = this.sec === 'takeoff' && this.alt < 40
    this.krabi.visible = this.sec === 'land' && this.alt < 50
  }

  protected step(dt: number, t: number) {
    const fdt = dt * this.pace
    this.secT += fdt
    const k = this.riders.kaylee
    const sec = this.sec
    let tilt = 0
    let lean = 0
    if (sec === 'takeoff') {
      // Waits for her seatbelt (or Mommy clicks it), then rolls faster and faster, and up.
      if (this.roll < 0) {
        this.beltT += dt
        if (this.belt && this.beltT > 0.8) this.roll = 0
        else if (!this.belt && this.beltT > 3) {
          this.riders.ji.react('wiggle')
          this.setBelt(true)
        }
      } else this.roll += fdt
      const r = Math.max(0, this.roll)
      const speed = Math.min(1, r / TAKEOFF_ROLL)
      this.runwayDashes.position.x = (r * r * 4) % 6
      // The airport across the runway slides back too (it wraps far off, out of sight).
      this.runway.children[0].position.x = (r * r * 2.2) % 120
      if (this.roll >= 0 && Math.floor((this.roll - dt) * 3) !== Math.floor(this.roll * 3)) sfx.jet(speed)
      lean = r > 0 ? -0.16 * Math.min(1, r / 2) : 0
      if (r > TAKEOFF_ROLL) {
        const c = Math.min(1, (r - TAKEOFF_ROLL) / CLIMB_S)
        this.alt = 2.2 + (CRUISE - 2.2) * (c * c * (3 - 2 * c))
        tilt = -0.1 * bell(Math.min(1, c * 1.4))
        if (!this.told.has('wheee')) {
          this.told.add('wheee')
          this.events.say(L.trip.plane.wheee)
          for (const id of WHO) this.riders[id].react('wave')
        }
        if (c >= 1) this.enterSection('fly')
      }
    } else if (sec === 'fly') {
      this.progress = clamp(this.secT / FLY_S)
      // Bumpy air, twice.
      if (Math.abs(this.secT - 8) < fdt || Math.abs(this.secT - 14) < fdt) this.turb = 0
      // Sparkle's balloon floats past the window; then the storks.
      this.passBalloon(this.secT - 2)
      this.storks.visible = this.secT > 6 && this.secT < 17
      if (this.storks.visible) {
        this.storks.position.x = -28 + (this.secT - 6) * 4.6
        for (const [i, s] of this.storks.children.entries()) {
          const flap = Math.sin(t * 7 + i * 0.8) * 0.6
          s.getObjectByName('wingL')!.rotation.x = flap
          s.getObjectByName('wingR')!.rotation.x = -flap
          s.position.y = Math.sin(t * 7 + i * 0.8 - 1) * 0.08
        }
      }
      // A hint once, if she hasn't found the tray.
      if (!this.trayOpen && this.time - this.lastTouch > 8 && this.secT > 4 && !this.told.has('hint')) {
        this.told.add('hint')
        this.events.say(L.trip.hint.tray)
      }
      // The clouds part, and the camera leans out of the window: Thailand, an elephant's head with a long trunk.
      // (It doesn't wait for the seat-back screen: she'd miss it playing with the cartoons.)
      if (!this.elephantDone && this.secT > 10) {
        this.elephantDone = true
        this.events.flash?.()
        this.setView('elephant')
        this.events.say(L.trip.elephant)
      }
      if (this.view === 'elephant' && this.viewT > 4.2) {
        this.events.flash?.()
        this.setView('cabin')
      }
      if (this.secT > FLY_S) this.enterSection('land')
    } else {
      // Seatbelts on, down to Krabi: the sea and the first rock islands, bump, bump, roll, and everyone claps.
      if (!this.belt && this.secT > 1.5) {
        this.riders.ji.react('wiggle')
        this.setBelt(true)
      }
      const c = clamp(this.secT / DESCEND_S)
      this.alt = CRUISE - (CRUISE - 2.2) * (1 - (1 - c) ** 2)
      tilt = 0.06 * bell(c)
      this.runwayDashes.position.x = 0
      if (c >= 1 && this.touchdown < 0) this.touchdown = 0
      if (this.touchdown >= 0) {
        this.touchdown += fdt
        const b = this.touchdown
        if ((b < 0.05 || Math.abs(b - 0.45) < fdt) && b < 0.5) {
          sfx.thump()
          this.turb = 0.6
        }
        lean = 0.1 * clamp(1 - b / 2.5)
        if (b > 1.6 && !this.cheered) {
          this.cheered = true
          sounds.sparkle()
          this.clap = 0
          for (const id of WHO) this.riders[id].react('hop')
          this.events.say(L.trip.plane.krabi)
        }
        // Krabi: a white flash, the arrivals arch, and off they go in the songthaew.
        if (b > 3.8 && this.drive < 0) this.toKrabi()
      }
    }
    if (this.drive >= 0) this.stepKrabi(dt)
    // Clouds stream past (fast on the ground they're far, up high they're all around).
    for (const c of this.clouds) {
      c.g.position.x += c.speed * dt * (sec === 'takeoff' ? clamp(this.roll / TAKEOFF_ROLL) : 1)
      if (c.g.position.x > 80) c.g.position.x -= 160
      c.g.visible = this.alt > 15
    }
    this.place()

    // ---- The cabin: tilt at takeoff, bumps, everyone pressing back ----
    this.turb = Math.min(1, this.turb + dt / 1.4)
    const shake = bell(this.turb) * (this.turb < 1 ? 1 : 0)
    this.cabin.rotation.z += (tilt - this.cabin.rotation.z) * (1 - Math.exp(-dt * 4))
    this.cabin.position.y = Math.sin(t * 31) * 0.02 * shake + Math.sin(t * 1.3) * 0.01
    this.cabin.rotation.x = Math.sin(t * 23) * 0.012 * shake
    if (this.drive < 0)
      for (const id of WHO) {
        const seat = this.seats[id]
        const doze = id === 'nick' && this.dad.asleep ? -0.22 : 0
        seat.rotation.z += (lean + doze - seat.rotation.z) * (1 - Math.exp(-dt * 6))
      }
    if (!this.dad.asleep) {
      this.dad.t += dt
      if (this.dad.t > 9) this.dad.asleep = true
    } else if (Math.floor(t / 6.4) !== Math.floor((t - dt) / 6.4) && sec === 'fly') sfx.snort()
    // The shade, the tray, the call button's glow, the reading light, the air vent's breeze.
    this.shade.k = clamp(this.shade.k + (this.shade.down ? dt : -dt) / 0.4)
    this.parts.shade.scale.y = 0.05 + 0.95 * this.shade.k
    this.trayK = clamp(this.trayK + (this.trayOpen ? dt : -dt) / 0.35)
    this.parts.tray.rotation.z = (-Math.PI / 2) * (1 - this.trayK)
    this.callGlow = Math.min(1, this.callGlow + dt / 1.2)
    this.parts.call.scale.setScalar(1 + bell(this.callGlow) * 0.6)
    this.parts.cone.visible = this.lightOn
    if (this.ventT >= 0) {
      this.ventT += dt
      this.parts.vent.rotation.y += dt * 9
      if (this.ventT > 2.6) this.ventT = -1
    }
    if (this.drive < 0) k.setWind(this.ventT >= 0 ? 0.85 : 0)
    this.stepAttendant(dt, t)
    for (const g of this.snacks) {
      const f = g.userData.fly as { from: Vector3; to: Vector3; t: number }
      if (f.t < 1) {
        f.t = Math.min(1, f.t + dt / 0.6)
        g.position.lerpVectors(f.from, f.to, f.t)
        g.position.y += bell(f.t) * 0.5
        if (f.t >= 1) sfx.thump()
      } else {
        // On the tray: they ride along with it, and slosh in bumpy air.
        g.position.set(f.to.x, f.to.y - (1 - this.trayK) * 2, f.to.z)
        g.visible = this.trayK > 0.6
        g.rotation.z = Math.sin(t * 20) * 0.15 * shake
      }
    }
    if (this.teddy) {
      const h = (this.teddy.userData.hop ?? 1) as number
      this.teddy.userData.hop = Math.min(1, h + dt / 0.5)
      this.teddy.position.y = 0.62 + bell(Math.min(1, h)) * 0.15
    }
    // The seat-back screen redraws a few times a second.
    const scr = this.screen
    if (t - scr.drawn > 0.2) {
      scr.drawn = t
      drawSeatback(scr.canvas, this.progress, scr.mode, t, this.route.from, this.route.to)
      scr.tex.needsUpdate = true
    }
    this.viewT += dt
    if (this.view === 'screen' && this.viewT > 6) this.setView('cabin')
    // She looks out of her window when there's something to see (the balloon, the storks, the runway going by, the
    // islands coming up), and now and then anyway; otherwise ahead, at her tray and her screen.
    if (this.view === 'cabin' && this.drive < 0) {
      const sights = this.balloon?.visible || this.storks.visible || (sec === 'takeoff' && this.roll > 0) || (sec === 'land' && this.alt < 30 && this.touchdown < 0)
      if ((sights && !this.shade.down) || t % 9 < 2.2) k.lookAt(WINDOW.x, WINDOW.y, WALL_Z - 3)
      else k.lookAt(FRONT_X - 1.5, 1.1, SEATS.kaylee + 0.6)
    }
    for (const c of Object.values(this.riders)) c.update(dt, t)
    this.stepFaces(dt, t)
  }

  /** On top of the usual life: Daddy asleep with his mouth open (and Kaylee pretending), the Zs, the claps at Krabi. */
  private stepFaces(dt: number, t: number) {
    const dad = this.riders.nick.rig
    const dozing = this.dad.asleep && this.drive < 0
    if (dozing) {
      dad.eyes.scale.y = 0.08
      dad.head.rotation.x = -0.32
      dad.head.rotation.z = 0.12
      dad.mouth.scale.set(1.25, 1.5 + Math.sin(t * 1.6) * 0.25, 1)
    } else dad.head.rotation.set(0, dad.head.rotation.y, 0)
    const kay = this.riders.kaylee.rig
    if (this.napping) {
      kay.eyes.scale.y = 0.08
      kay.head.rotation.z = -0.25
    } else kay.head.rotation.z = 0
    // A little Z floats up from each sleeper every so often.
    for (const [who, asleep, off] of [['nick', dozing, 0], ['kaylee', this.napping, 0.5]] as const) {
      if (asleep && Math.floor(t / 1.3 + off) !== Math.floor((t - dt) / 1.3 + off)) this.addZ(who)
    }
    for (const z of [...this.zs]) {
      z.t += dt / 2.2
      const r = this.riders[z.who]
      const head = r.root.getWorldPosition(tmp)
      z.g.position.set(head.x + 0.1 + z.t * 0.2, head.y + r.height * 1.05 + z.t * 0.7, head.z + Math.sin(z.t * 6) * 0.08)
      z.g.scale.setScalar(0.5 + z.t * 0.8)
      if (z.t >= 1) {
        z.g.removeFromParent()
        this.zs.splice(this.zs.indexOf(z), 1)
      }
    }
    // Claps at Krabi: hands together in front, quickly, for a second and a half.
    if (this.clap >= 0) {
      this.clap += dt
      const on = this.clap < 1.6
      for (const id of WHO) {
        const r = this.riders[id].rig
        if (!on) {
          r.armL.rotation.set(0, 0, 0)
          r.armR.rotation.set(0, 0, 0)
          continue
        }
        const k = Math.abs(Math.sin(this.clap * 14))
        r.armL.rotation.set(-1.15, 0, -0.25 - 0.35 * k)
        r.armR.rotation.set(-1.15, 0, 0.25 + 0.35 * k)
      }
      if (on && Math.floor((this.clap * 14) / Math.PI) !== Math.floor(((this.clap - dt) * 14) / Math.PI)) sounds.pop()
      if (!on) this.clap = -1
    }
  }

  private addZ(who: Who) {
    if (this.zs.length > 6) return
    this.zMesh ??= solid(merge([P.box(0.16, 0.035, 0.03, PAL.cream, { at: [0, 0.07, 0] }), P.box(0.035, 0.19, 0.03, PAL.cream, { rot: [0, 0, -0.95] }), P.box(0.16, 0.035, 0.03, PAL.cream, { at: [0, -0.07, 0] })]), this.bag, 1.5)
    const g = this.zMesh.clone()
    g.rotation.y = -Math.PI / 2 + 0.6
    this.scene.add(g)
    this.zs.push({ g, t: 0, who })
  }

  /** The flight attendant: up the aisle when there's something to bring, a snack over each time, then back. */
  private stepAttendant(dt: number, t: number) {
    const a = this.attendant
    const stop = -0.05
    const home = GALLEY_X + 1.0
    const goal = a.queue > 0 || a.wait > 0 ? stop : home
    const before = a.x
    a.x += clamp(goal - a.x, -dt * 1.8, dt * 1.8)
    const moving = Math.abs(a.x - before) > 1e-4
    a.root.position.set(a.x, 0, AISLE_Z)
    a.root.visible = a.x < GALLEY_X + 0.2
    // A waddle while she walks; at the row she turns to them and hands it over.
    const rig = a.rig
    rig.body.rotation.z = moving ? Math.sin(t * 12) * 0.08 : 0
    rig.root.position.y = moving ? Math.abs(Math.sin(t * 12)) * 0.03 : 0
    const here = Math.abs(a.x - stop) < 0.02
    rig.root.rotation.y += ((here ? Math.PI : -Math.PI / 2) - rig.root.rotation.y) * (1 - Math.exp(-dt * 8))
    if (here && a.queue > 0) {
      a.wait -= dt
      if (a.wait <= 0) {
        a.queue--
        a.hand = 0
        a.served++
        this.addSnack(a.served % 2 ? 'juice' : 'cookie', rig.root.getWorldPosition(new Vector3()).setY(1.2))
        if (a.served === 1) this.events.say(L.trip.plane.snack)
        else if (a.served === 4) this.events.say(L.trip.plane.more)
        // The next one soon; after the last, she waits a moment before going back.
        a.wait = a.queue > 0 ? 0.75 : 2.2
      }
    } else if (here && a.wait > 0) a.wait = Math.max(0, a.wait - dt)
    a.hand = Math.min(1, a.hand + dt / 0.5)
    rig.armR.rotation.x = -bell(a.hand) * 1.4
    const b = 1 + Math.sin(t * 2.6) * 0.018
    rig.body.scale.set(1 / Math.sqrt(b), b, 1 / Math.sqrt(b))
    a.life.update(dt)
  }

  private passBalloon(u: number) {
    const b = this.balloon
    if (!b) return
    b.visible = u > 0 && u < 11 && this.alt > 30
    if (!b.visible) return
    b.position.set(-14 + u * 2.6, 1.8 + Math.sin(u * 1.4) * 0.3, -6.5)
  }

  private enterSection(s: FlySection) {
    if (this.sec === s) return
    this.sec = s
    this.secT = 0
    this.events.section(s)
    if (s === 'land') {
      this.events.say(L.trip.plane.land)
      if (this.view !== 'cabin') this.setView('cabin')
    }
    if (s === 'fly') setTimeout(() => this.sec === 'fly' && this.events.say(L.trip.plane.tray), 1500)
  }

  /** The ⏩ button: from the takeoff or the cabin straight to the landing; from the landing to Krabi; then the pier. */
  skip() {
    if (this.drive >= 0) {
      if (this.fork === 'pier') {
        this.drive = SONGTHAEW_S + 1
        this.events.done('pier')
        return
      }
      // (It waits at the signpost for her pick: ⏩ only gets it there, and the boards glow.)
      const go = this.forkGo ?? (this.fork === 'chang' ? 'chang' : null)
      if (go) {
        this.forkGo = go
        this.forkT = FORK_AWAY_S + 1
        this.events.done(go)
      } else if (this.forkWait < 0) this.drive = 0.7 + TO_FORK_S
      else this.forkWait = Math.max(this.forkWait, 3)
    } else if (this.sec !== 'land') {
      if (!this.belt) this.setBelt(true)
      this.storks.visible = false
      if (this.balloon) this.balloon.visible = false
      this.enterSection('land')
    } else {
      this.cheered = true
      this.toKrabi()
    }
  }

  /** Off the plane: the family on the songthaew's bench at the arrivals arch, the suitcase across from them. */
  private toKrabi() {
    this.drive = 0
    this.events.flash?.()
    const st = this.arrival.songthaew
    for (const id of WHO) {
      const c = this.riders[id]
      st.seats[id].add(c.root)
      this.put(c, 0, 0, 0, 'sit', 0)
      c.rig.armL.rotation.set(0, 0, 0)
      c.rig.armR.rotation.set(0, 0, 0)
      c.rig.head.rotation.set(0, 0, 0)
    }
    this.clap = -1
    this.napping = false
    for (const z of this.zs) z.g.removeFromParent()
    this.zs = []
    const bag = buildSuitcase(this.bag)
    bag.root.scale.setScalar(0.75)
    bag.root.rotation.y = Math.PI
    st.luggage.add(bag.root)
    this.riders.kaylee.glassesUp(false)
    this.setView('krabi')
  }

  private stepKrabi(dt: number) {
    this.drive += dt
    const d = this.drive
    const st = this.arrival.songthaew
    // A moment at the curb, a toot, then off along the road toward the pier, everyone's mane in the wind.
    const go = Math.max(0, d - 0.7)
    if (this.fork !== 'pier') return this.stepFork(dt, go)
    st.root.position.x = this.arrival.curbX + go * go * 1.6
    for (const w of st.wheels) w.rotation.z = (-go * go * 1.6) / 0.3
    st.body.position.y = go > 0 ? Math.abs(Math.sin(go * 9)) * 0.03 : 0
    if (d > 0.7 && d - dt <= 0.7) {
      sfx.toot()
      sfx.putt()
      this.riders.nick.react('wave')
      this.riders.kaylee.react('wave')
    }
    const wind = clamp(go / 1.2)
    this.riders.kaylee.setWind(wind)
    this.riders.ji.setWind(wind)
    if (d > SONGTHAEW_S && d - dt <= SONGTHAEW_S) this.events.done('pier')
  }

  /** The boat trip with Baan Chang: down the road to the signpost, a stop ("Where to?"), then her pick. */
  private stepFork(dt: number, go: number) {
    const st = this.arrival.songthaew
    const a = this.arrival
    const d = this.drive
    if (d > 0.7 && d - dt <= 0.7) {
      sfx.toot()
      sfx.putt()
      this.riders.kaylee.react('wave')
    }
    // Down the road, slowing to a stop where the side road turns off.
    const k = clamp(go / TO_FORK_S)
    const x = a.curbX + (a.forkX - a.curbX) * k * k * (3 - 2 * k)
    let rolled = x - a.curbX
    // (Also on the frame it gets there: ⏩ jumps the drive straight to its end.)
    if (k < 1 || this.forkWait < 0) st.root.position.x = x
    if (k >= 1 && this.forkWait < 0) {
      this.forkWait = 0
      if (this.fork === 'chang') this.forkGo = 'chang'
      else if (!this.forkGo) {
        this.events.say(L.bay.whereTo)
        this.riders.nick.react('wave')
      }
    }
    const moving = k > 0 && k < 1
    if (this.forkWait >= 0) {
      if (!this.forkGo) {
        this.forkWait += dt
        // Still deciding a while later: Sparkle says it's her pick (once).
        if (this.forkWait > 9 && this.forkWait - dt <= 9 && this.time - this.lastTouch > 6) this.events.say(L.chang.hint.fork)
      } else {
        this.forkT += dt
        const t = this.forkT
        if (this.forkGo === 'chang') {
          // A turn up the side road, then away into the palms.
          const turn = clamp(t / 0.55)
          st.root.rotation.y = (Math.PI / 2) * turn * turn * (3 - 2 * turn)
          const away = Math.max(0, t - 0.45)
          st.root.position.z = a.roadZ - 0.6 - away * away * 2.2
          rolled += away * away * 2.2 + turn * 0.8
        } else {
          st.root.position.x = a.forkX + t * t * 1.8
          rolled += t * t * 1.8
        }
        if (t > FORK_AWAY_S && t - dt <= FORK_AWAY_S) this.events.done(this.forkGo)
      }
    }
    for (const w of st.wheels) w.rotation.z = -rolled / 0.3
    const going = moving || (this.forkGo !== null && this.forkT > 0)
    st.body.position.y = going ? Math.abs(Math.sin(d * 9)) * 0.03 : 0
    const wind = going ? 0.8 : 0
    this.riders.kaylee.setWind(wind)
    this.riders.ji.setWind(wind)
  }

  /** She tapped a board on the signpost (before it gets there: it turns that way when it does). */
  private pickFork(go: 'chang' | 'pier') {
    if (this.fork !== 'ask' || this.forkGo) return
    this.forkGo = go
    this.forkT = 0
    sfx.toot()
    this.riders.kaylee.react('hop')
    this.riders.nick.react('wave')
    this.events.say(L.bay.pai)
  }

  // ---------------------------------------------------------------- camera, anchors

  protected shot(): Shot {
    const tall = this.w < this.h
    // Just over Kaylee's head (under the overhead bin), looking down at the screen in front of her.
    if (this.view === 'screen') return { center: this.parts.screen.getWorldPosition(new Vector3()), half: new Vector3(0.1, 0.16, 0.26), yaw: 90, pitch: 45, minDist: 1.25, maxDist: 1.3 }
    if (this.view === 'elephant') {
      // From high over the sea west of the country, looking down at all of it, north up.
      const c = this.thailand.position
      const [cx, cy] = flat([100.9, 13.0])
      return { center: new Vector3(c.x + cy * MAP_S, c.y, c.z + cx * MAP_S), half: new Vector3(24, 1, tall ? 14 : 16), yaw: -90, pitch: 62, minDist: 20, maxDist: 400 }
    }
    if (this.view === 'krabi') {
      // (Outdoors again: sunglasses back on.)
      // From across the road: the arch, and the songthaew pulling away with them.
      const x = this.arrival.songthaew.root.position.x
      // (At the fork: the songthaew and the signpost, the side road between them.)
      if (this.fork !== 'pier') {
        const cx = ARRIVAL_AT.x + (tall ? Math.min(x, this.arrival.forkX) + 1.3 : Math.min(x, this.arrival.forkX) * 0.75 + 1.0)
        return { center: new Vector3(cx, tall ? 2.0 : 1.8, ARRIVAL_AT.z - 0.6), half: new Vector3(tall ? 2.9 : 4.6, tall ? 2.4 : 2.0, 1.8), yaw: 4, pitch: 9, minDist: 5 }
      }
      // (Tall screens: centred on the songthaew, following it as it pulls away.)
      if (tall) return { center: new Vector3(ARRIVAL_AT.x + Math.min(x, 4) + 0.2, 2.0, ARRIVAL_AT.z - 0.6), half: new Vector3(2.8, 2.4, 1.8), yaw: 4, pitch: 9, minDist: 5 }
      return { center: new Vector3(ARRIVAL_AT.x + Math.min(x + 1.2, 2.5) * 0.6, 2.0, ARRIVAL_AT.z - 0.6), half: new Vector3(4.6, 2.0, 1.8), yaw: 4, pitch: 9, minDist: 5 }
    }
    // In the aisle in front of their row: all three faces, Kaylee's window beside her and the windows in front of it.
    if (tall) return { center: new Vector3(-0.3, 1.0, -0.22), half: new Vector3(0.8, 0.8, 1.12), yaw: -64, pitch: 23, minDist: 3, maxDist: 5.2 }
    return { center: new Vector3(-0.3, 1.0, -0.42), half: new Vector3(1.0, 0.72, 0.95), yaw: -64, pitch: 23, minDist: 3, maxDist: 5.2 }
  }

  protected anchorAt(id: string): AnchorSpot | null {
    if (this.view === 'elephant') return null
    if (this.view === 'krabi') {
      if (id === 'songthaew') return { at: this.arrival.songthaew.root.getWorldPosition(new Vector3()).setY(1.4), r: 1.4 }
      if ((id === 'sign-chang' || id === 'sign-pier') && this.fork === 'ask' && !this.forkGo) {
        const b = this.arrival.boards[id === 'sign-chang' ? 'chang' : 'pier']
        return { at: this.arrival.root.localToWorld(new Vector3(...b)), r: 0.62, glow: this.forkWait > 1.2, prio: 3 }
      }
      return null
    }
    const at = (o: Object3D, dy = 0) => {
      const p = o.getWorldPosition(new Vector3())
      p.y += dy
      return p
    }
    switch (id) {
      case 'belt':
        return { at: at(this.parts.buckle), r: 0.12, glow: !this.belt && this.sec !== 'fly', prio: 3 }
      case 'window':
        return { at: this.cabin.localToWorld(new Vector3(WINDOW.x, WINDOW.y, WALL_Z + 0.05)), r: 0.34 }
      case 'tray':
        return { at: this.cabin.localToWorld(new Vector3(FRONT_X + 0.2 * this.trayK, TRAY_Y - 0.15 * (1 - this.trayK), SEATS.kaylee)), r: 0.2, glow: this.sec === 'fly' && !this.trayOpen && this.secT > 2 && this.secT < 10, prio: 3 }
      case 'call':
        return { at: at(this.parts.call), r: 0.08, glow: this.sec === 'fly' && this.trayOpen && this.snacks.length === 0, prio: 4 }
      case 'light':
        return { at: at(this.parts.light), r: 0.08, prio: 3 }
      case 'vent':
        return { at: at(this.parts.vent), r: 0.08, prio: 3 }
      case 'screen':
        return { at: at(this.parts.screen, 0.05), r: 0.18, prio: 3 }
      case 'teddy':
        return this.teddy ? { at: at(this.teddy, 0.15), r: 0.14, prio: 3 } : null
      case 'attendant':
        return this.attendant.root.visible ? { at: at(this.attendant.rig.root, 0.7), r: 0.35, max: 120 } : null
      case 'balloon':
        return this.balloon?.visible && !this.shade.down ? { at: at(this.balloon), r: 1.5 } : null
    }
    if (id.startsWith('family:')) {
      const c = this.riders[id.slice(7) as Who]
      if (!c) return null
      return { at: at(c.root, c.height * 0.62), r: c.height * 0.24, max: 120 }
    }
    return null
  }

  protected hintAt() {
    if (this.view === 'krabi' && this.fork === 'ask' && !this.forkGo && this.forkWait >= 0) return this.arrival.root.localToWorld(new Vector3(...this.arrival.boards.chang))
    if (this.view !== 'cabin') return null
    if (!this.belt) return this.parts.buckle.getWorldPosition(new Vector3())
    if (this.sec === 'fly' && !this.trayOpen) return this.cabin.localToWorld(new Vector3(FRONT_X, TRAY_Y - 0.15, SEATS.kaylee))
    if (this.sec === 'fly' && this.snacks.length < MAX_SNACKS) return this.parts.call.getWorldPosition(tmp).clone()
    return null
  }

  qa() {
    return {
      leg: 'plane',
      section: this.sec,
      t: Math.round(this.secT * 10) / 10,
      belt: this.belt,
      rolling: this.roll >= 0,
      alt: Math.round(this.alt),
      progress: Math.round(this.progress * 100) / 100,
      tray: this.trayOpen,
      shade: this.shade.down,
      light: this.lightOn,
      view: this.view,
      touchdown: this.touchdown >= 0,
      dadAsleep: this.dad.asleep,
      napping: this.napping,
      attendant: Math.round(this.attendant.x * 10) / 10,
      krabi: this.drive >= 0,
      fork: this.fork,
      atFork: this.forkWait >= 0,
      forkGo: this.forkGo,
      touches: this.touches,
      ...this.counts,
    }
  }
}

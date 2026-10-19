// The window seat (plan: thailand/boat-trip.md, "The window seat"): Kaylee rides by the window, Mommy in the middle,
// Daddy on the aisle (asleep, mouth open). The pilot flies; she plays with the cabin, Toca style. The camera looks at
// their row from the aisle, the round window beside Kaylee; what's outside is a real little world: the runway, fat toon
// clouds, Sparkle's balloon floating past, a V of storks, Thailand far below (the real outline), and Krabi's sea.
//
// - takeoff: seatbelt click, the plane rolls faster and faster (the runway streaks past), everyone presses back into
//   their seats, and up: wheee!
// - fly: fold the tray down and press the call button (ding: juice and a snack; again and again, they pile up), the
//   shade, the reading light, the seat-back screen (the little plane going down the elephant's trunk; again:
//   cartoons), Daddy (snorts awake), Mommy (shares her snack). Then the clouds part and the camera leans out: all of
//   Thailand below, an elephant's head with a long trunk.
// - land: seatbelts on, the sea and the first rock islands come up, bump bump roll, and everyone cheers.
// Every part moves on by itself (about 70 s in all), whatever she does.
import { CanvasTexture, Color, ConeGeometry, ExtrudeGeometry, Fog, Group, Matrix4, Mesh, MeshBasicMaterial, Path, PlaneGeometry, Shape, ShapeGeometry, Sprite, SpriteMaterial, SRGBColorSpace, TextureLoader, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp, sounds } from '../../../../../sdk'
import type { AnchorInfo } from '../../engine/Anchors'
import type { Shot } from '../../engine/camera'
import { merge, P, solid } from '../../engine/geo'
import { makeHull } from '../../engine/outline'
import { PAL, toon } from '../../engine/toon'
import { sfx } from '../../sfx'
import { art } from '../../art'
import { drawSeatback } from '../drawings'
import { flat, PHUKET, PLACES, THAILAND, type LonLat } from '../outline'
import { buildItem } from '../props'
import { TALK } from '../talk'
import { Stage, type AnchorSpot, type LegEvents, type Rider } from './stage'

export type FlySection = 'takeoff' | 'fly' | 'land'

export const PLANE_ANCHORS: AnchorInfo[] = [
  { id: 'belt', label: 'Seatbelt', kind: 'thing' },
  { id: 'window', label: 'Window shade', kind: 'thing' },
  { id: 'tray', label: 'Tray', kind: 'thing' },
  { id: 'call', label: 'Call button', kind: 'thing' },
  { id: 'light', label: 'Reading light', kind: 'thing' },
  { id: 'screen', label: 'Seat-back screen', kind: 'thing' },
  { id: 'teddy', label: 'Teddy', kind: 'thing' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'family:kaylee', label: 'Kaylee', kind: 'family' },
  { id: 'balloon', label: "Sparkle's balloon", kind: 'thing' },
]

// The cabin (meters; the plane flies toward -x, the window wall is on Kaylee's side at -z, the aisle at +z).
const WALL_Z = -1.25
const WINDOW = { x: -0.22, y: 1.22, w: 0.62, h: 0.78 }
const SEATS = { kaylee: -0.8, ji: 0.0, nick: 0.72 }
const FRONT_X = -0.68
const TRAY_Y = 0.6
/** The top of their seat cushions. */
const SEAT_Y = 0.48
/** Thailand below: map units (flat degrees) to meters, and how far below the plane it is at cruising height. */
const MAP_S = 3
const CRUISE = 60
const TAKEOFF_ROLL = 6.5
const CLIMB_S = 7
const FLY_S = 44
/** The whole flight as built, takeoff to the cheer at Krabi (a trip can ask for a shorter or longer one). */
const FLIGHT_S = 70

type Ev = LegEvents & { flash?(): void }

const tmp = new Vector3()

export class PlaneRide extends Stage {
  private cabin = new Group()
  private seats: Record<'kaylee' | 'ji' | 'nick', Group> = { kaylee: new Group(), ji: new Group(), nick: new Group() }
  private riders: Record<'kaylee' | 'ji' | 'nick', Rider>
  private haze = new Fog('#DCEFFB', 40, 210)
  private outside = new Group()
  private runway = new Group()
  private runwayDashes = new Group()
  private krabi = new Group()
  private thailand = new Group()
  private clouds: { g: Object3D; speed: number }[] = []
  private storks = new Group()
  private balloon: Sprite | null = null
  private parts: Record<'belt' | 'buckle' | 'shade' | 'tray' | 'call' | 'light' | 'cone' | 'screen', Object3D>
  private screen: { canvas: HTMLCanvasElement; tex: CanvasTexture; mode: 'map' | 'cartoon'; drawn: number }
  private teddy: Group | null = null
  private snacks: Group[] = []
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
  private turb = 1
  private dad = { asleep: true, t: 0 }
  private view: 'cabin' | 'screen' | 'elephant' = 'cabin'
  private viewT = 0
  private elephantDone = false
  private touchdown = -1
  private cheered = false
  private told = new Set<string>()
  private counts = { snacks: 0, shades: 0, lights: 0, screens: 0, belts: 0 }
  /** Flight seconds per real second (the trip's cap). */
  private pace = 1

  constructor(renderer: WebGLRenderer, protected events: Ev, start: FlySection, private packed: string[], private route: { from: LonLat; to: LonLat } = { from: PLACES.bangkok, to: PLACES.krabi }, cap = FLIGHT_S) {
    super(renderer, events)
    this.pace = FLIGHT_S / cap
    const { scene, bag } = this
    scene.background = new Color('#BFE6FF')
    scene.fog = this.haze
    this.rig.fov = 36
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
    this.buildOutside()
    const { kaylee, members } = this.makeFamily(['ji', 'nick'])
    this.riders = { kaylee, ji: members.get('ji')!, nick: members.get('nick')! }
    for (const id of ['kaylee', 'ji', 'nick'] as const) {
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
    setTimeout(() => this.events.say(start === 'land' ? TALK.plane.land : start === 'fly' ? TALK.plane.tray : TALK.plane.belt), 400)
  }

  // ---------------------------------------------------------------- the cabin

  private buildCabin() {
    const { bag, cabin } = this
    // Floor and the window wall (a real hole for the window: what's outside is outside).
    cabin.add(solid(merge([P.box(6.4, 0.12, 3.4, '#D9D2EE', { at: [0, -0.06, 0.4] }), P.box(6.4, 0.02, 0.6, '#C9C1E6', { at: [0, 0.005, 1.45] })]), bag, 0))
    const wall = new Shape()
    wall.moveTo(-3.2, 0)
    wall.lineTo(3.2, 0)
    wall.lineTo(3.2, 2.35)
    wall.lineTo(-3.2, 2.35)
    wall.closePath()
    const hole = new Path()
    hole.absellipse(WINDOW.x, WINDOW.y, WINDOW.w / 2, WINDOW.h / 2, 0, Math.PI * 2, false, 0)
    wall.holes.push(hole)
    const wallGeo = bag.add(new ExtrudeGeometry(wall, { depth: 0.14, bevelEnabled: false, curveSegments: 28 }))
    const wallMesh = new Mesh(wallGeo, toon('#F7F4FF'))
    wallMesh.position.z = WALL_Z - 0.14
    const hull = makeHull(wallGeo, 1.5)
    bag.add(hull.geometry)
    wallMesh.add(hull)
    cabin.add(wallMesh)
    cabin.add(
      solid(
        merge([
          // The window's frame, a stripe along the wall, the overhead bin with its little panel above Kaylee.
          P.torus(0.5, 0.045, '#D9CCFF', { at: [WINDOW.x, WINDOW.y, WALL_Z + 0.01], scale: [WINDOW.w / 1.0, WINDOW.h / 1.0, 1] }),
          P.box(6.4, 0.12, 0.03, PAL.pink, { at: [0, 0.5, WALL_Z + 0.015] }),
          P.rbox(6.4, 0.34, 0.6, 0.08, '#EFEAFB', { at: [0, 2.15, WALL_Z + 0.3] }),
          P.box(0.9, 0.04, 0.34, '#D9D2EE', { at: [0.05, 1.97, WALL_Z + 0.42] }),
        ]),
        bag,
        2,
      ),
    )
    // Their three seats (each in a group that tilts: pressing back at takeoff, Daddy dozing) and the stubs of the row
    // in front, cut low like the house's walls so the camera sees in.
    const seatParts = (c: string) => [P.rbox(0.62, 0.16, 0.58, 0.06, c, { at: [0, 0.4, 0] }), P.rbox(0.16, 1.0, 0.6, 0.06, c, { at: [0.34, 0.86, 0], rot: [0, 0, -0.12] }), P.rbox(0.18, 0.12, 0.5, 0.05, PAL.pink, { at: [0.4, 1.3, 0], rot: [0, 0, -0.12] }), P.box(0.5, 0.05, 0.06, '#B9A6F5', { at: [0, 0.6, 0.31] })]
    for (const id of ['kaylee', 'ji', 'nick'] as const) {
      const g = this.seats[id]
      g.position.set(0, 0, SEATS[id])
      g.add(solid(merge(seatParts('#B9A6F5')), bag, 2))
      cabin.add(g)
    }
    for (const z of Object.values(SEATS)) cabin.add(solid(merge([P.rbox(0.18, TRAY_Y + 0.02, 0.6, 0.06, '#A792EE', { at: [FRONT_X - 0.09, (TRAY_Y + 0.02) / 2, z] })]), bag, 2))
    // Seatbelt: a strap over each lap (Kaylee's shows once it's buckled), and her buckle.
    const belt = solid(merge([P.box(0.08, 0.04, 0.5, '#5E5468', { at: [-0.12, 0.56, 0] })]), bag, 1)
    belt.visible = false
    this.seats.kaylee.add(belt)
    for (const id of ['ji', 'nick'] as const) this.seats[id].add(solid(merge([P.box(0.08, 0.04, 0.5, '#5E5468', { at: [-0.12, 0.56, 0] })]), bag, 1))
    const buckle = new Group()
    buckle.position.set(-0.16, 0.6, 0)
    buckle.add(solid(merge([P.rbox(0.1, 0.06, 0.12, 0.02, PAL.gold)]), bag, 1.5))
    this.seats.kaylee.add(buckle)
    // The shade (slides down over the window).
    const shade = new Group()
    shade.position.set(WINDOW.x, WINDOW.y + WINDOW.h / 2, WALL_Z + 0.03)
    shade.add(solid(merge([P.box(WINDOW.w + 0.06, WINDOW.h + 0.04, 0.02, '#E8E2F4', { at: [0, -(WINDOW.h + 0.04) / 2, 0] }), P.box(0.16, 0.04, 0.03, PAL.lavenderDark, { at: [0, -WINDOW.h - 0.02, 0.01] })]), bag, 1.5))
    shade.scale.y = 0.05
    cabin.add(shade)
    // Her tray, hinged on the stub in front (stowed: hanging down; open: flat in front of her).
    const tray = new Group()
    tray.position.set(FRONT_X, TRAY_Y, SEATS.kaylee)
    tray.add(solid(merge([P.rbox(0.42, 0.03, 0.5, 0.02, '#E8E2F4', { at: [0.21, 0, 0] })]), bag, 1.5))
    tray.rotation.z = -Math.PI / 2
    cabin.add(tray)
    // The seat-back screen, standing up from the stub in front of her, facing her.
    const screenFrame = new Group()
    screenFrame.position.set(FRONT_X - 0.06, TRAY_Y + 0.22, SEATS.kaylee)
    screenFrame.rotation.z = 0.2
    screenFrame.add(solid(merge([P.rbox(0.06, 0.32, 0.44, 0.02, PAL.ink, { at: [0, 0, 0] })]), bag, 1.5))
    const screen = new Mesh(bag.add(new PlaneGeometry(0.4, 0.28)), bag.add(new MeshBasicMaterial({ color: '#1F2A55' })))
    screen.position.set(0.035, 0, 0)
    screen.rotation.y = Math.PI / 2
    screenFrame.add(screen)
    cabin.add(screenFrame)
    // The call button and the reading light under the bin, above Kaylee.
    const call = new Group()
    call.position.set(0.1, 1.94, SEATS.kaylee + 0.12)
    call.add(solid(merge([P.cyl(0.05, 0.05, 0.03, PAL.hotpink)]), bag, 1.5))
    cabin.add(call)
    const light = new Group()
    light.position.set(-0.1, 1.94, SEATS.kaylee + 0.12)
    light.add(solid(merge([P.cyl(0.05, 0.04, 0.05, PAL.butter)]), bag, 1.5))
    cabin.add(light)
    const cone = new Mesh(bag.add(new ConeGeometry(0.45, 1.25, 20, 1, true)), bag.add(new MeshBasicMaterial({ color: PAL.butter, transparent: true, opacity: 0.25, depthWrite: false })))
    cone.position.set(-0.1, 1.3, SEATS.kaylee + 0.12)
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
    return { belt, buckle, shade, tray, call, light, cone, screen }
  }

  // ---------------------------------------------------------------- outside

  private buildOutside() {
    const { bag, outside } = this
    // The runway at home (takeoff) and at Krabi (landing): grass, the strip and its dashes.
    this.runway.add(solid(merge([P.box(600, 0.1, 400, '#A9E3B8', { at: [0, -0.06, -150] }), P.box(600, 0.12, 14, '#B9B4CC', { at: [0, 0, 0] })]), bag, 0))
    for (let x = -60; x <= 60; x += 6) this.runwayDashes.add(solid(merge([P.box(3, 0.02, 0.3, PAL.cream, { at: [x, 0.07, 0] })]), bag, 0))
    this.runway.add(this.runwayDashes)
    outside.add(this.runway)
    // Krabi: the sea, the first rock islands standing straight out of it, a strip of beach.
    this.krabi.add(solid(merge([P.box(800, 0.1, 500, '#5FC7B4', { at: [0, -0.06, -260] }), P.box(800, 0.12, 30, '#A9E3B8', { at: [0, 0, 12] }), P.box(800, 0.14, 14, '#B9B4CC', { at: [0, 0.02, 2] })]), bag, 0))
    const karsts = []
    for (let i = 0; i < 14; i++) {
      // The first ones close by, so they rise past the window as the plane comes down.
      const x = -70 + i * 11 + (i % 3) * 4
      const z = -12 - (i % 4) * 9 - (i > 9 ? 30 : 0)
      const h = 6 + (i % 5) * 3
      karsts.push(P.cyl(4 + (i % 3), 6 + (i % 2) * 2, h, '#C9C1D9', { at: [x, h / 2, z] }, 10), P.sphere(5 + (i % 3), '#6FBF7F', { at: [x, h, z], scale: [1, 0.6, 1] }))
    }
    this.krabi.add(solid(merge(karsts), bag, 2))
    this.krabi.visible = false
    outside.add(this.krabi)
    // Thailand far below: the real outline, flat and green, with the mountains of the north as bumps.
    this.buildThailand()
    outside.add(this.thailand)
    // Fat toon clouds all around (they drift past the window as the plane flies).
    for (let i = 0; i < 16; i++) {
      const g = solid(merge([0, 1, 2, 3].map((k) => P.sphere(1.4 + ((i + k) % 3) * 0.6, '#FFFFFF', { at: [k * 1.6 - 2.4, Math.sin(k * 2 + i) * 0.5, (k % 2) * 0.8] }))), bag, 1.5)
      g.position.set(-70 + i * 9.5, -6 + (i % 5) * 3.2, -9 - (i % 4) * 8)
      outside.add(g)
      this.clouds.push({ g, speed: 9 + (i % 3) * 3 })
    }
    // A V of storks.
    for (let i = 0; i < 5; i++) {
      const s = solid(merge([P.sphere(0.25, '#FFFFFF', { scale: [1.6, 0.8, 0.8] }), P.box(0.1, 0.04, 1.6, '#FFFFFF', { at: [0, 0.05, 0] }), P.cone(0.06, 0.4, PAL.peach, { at: [-0.5, 0.0, 0], rot: [0, 0, Math.PI / 2] })]), bag, 1.5)
      s.position.set(Math.abs(i - 2) * 1.6, 0, (i - 2) * 1.6)
      this.storks.add(s)
    }
    this.storks.position.set(60, 2, -12)
    this.storks.visible = false
    outside.add(this.storks)
    // Sparkle's hot-air balloon from the world map, Sparkle waving from its basket.
    const mat = bag.add(new SpriteMaterial({ transparent: true, depthWrite: false }))
    new TextureLoader().load(art.balloon, (t) => {
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
      const [x, y] = flat(ll)
      return P.cone(1.2 + (i % 2) * 0.4, 1.6 + (i % 3) * 0.5, '#B5E6A6', { at: [y * MAP_S, 1.0, x * MAP_S] }, 8)
    })]), bag, 1.5))
  }

  // ---------------------------------------------------------------- touch

  protected pickRoots(): Object3D[] {
    return [this.cabin, ...(this.balloon ? [this.balloon] : [])]
  }

  protected onTap(id: string | null) {
    // A tap anywhere brings the camera back from the screen or the view.
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
        if (this.shade.down && this.lightOn) this.night()
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
        if (this.shade.down && this.lightOn) this.night()
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
      case 'family:nick':
        if (this.dad.asleep) {
          this.dad = { asleep: false, t: 0 }
          sfx.snort()
          this.riders.nick.react('hop')
          this.events.say(TALK.plane.dad)
        } else this.riders.nick.react('wave')
        return
      case 'family:ji':
        // Mommy shares her snack.
        this.riders.ji.react('hop')
        if (this.trayOpen) this.addSnack('cookie', this.seats.ji.getWorldPosition(new Vector3()).setY(1.2))
        else sounds.sparkle()
        return
      case 'family:kaylee':
        k.react('hop')
        sfx.boing()
        return
      case 'balloon':
        sounds.sparkle()
        k.react('wave')
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

  private call() {
    this.callGlow = 0
    sfx.callDing()
    if (!this.trayOpen) {
      this.trayOpen = true
      sfx.thump()
    }
    setTimeout(() => this.addSnack(this.snacks.length % 2 ? 'cookie' : 'juice', new Vector3(-1.4, 1.8, 1.6)), 700)
  }

  /** Something to eat lands on her tray (more and more pile up). */
  private addSnack(kind: 'juice' | 'cookie', from: Vector3) {
    if (this.disposed) return
    const g = new Group()
    g.add(kind === 'juice' ? solid(merge([P.cyl(0.05, 0.04, 0.12, '#FFFFFF', { at: [0, 0.06, 0] }), P.cyl(0.045, 0.045, 0.02, '#FF9F45', { at: [0, 0.1, 0] }), P.cyl(0.006, 0.006, 0.12, PAL.hotpink, { at: [0.02, 0.16, 0], rot: [0, 0, 0.2] })]), this.bag, 1.5) : solid(merge([P.rbox(0.12, 0.05, 0.09, 0.02, PAL.butter, { at: [0, 0.025, 0] }), P.box(0.1, 0.01, 0.07, '#C99A6E', { at: [0, 0.052, 0] })]), this.bag, 1.5))
    const i = this.snacks.length
    const to = new Vector3(FRONT_X + 0.12 + (i % 2) * 0.17, TRAY_Y + 0.02 + Math.floor(i / 4) * 0.1, SEATS.kaylee - 0.12 + (Math.floor(i / 2) % 2) * 0.22)
    g.userData.fly = { from: this.cabin.worldToLocal(from.clone()), to, t: 0 }
    g.position.copy(g.userData.fly.from)
    this.cabin.add(g)
    this.snacks.push(g)
    this.counts.snacks++
    if (this.snacks.length === 1) this.riders.kaylee.react('hop')
  }

  private night() {
    if (this.told.has('night')) return
    this.told.add('night')
    this.events.say(TALK.plane.snore)
    setTimeout(() => sfx.snort(), 900)
  }

  private setView(v: 'cabin' | 'screen' | 'elephant') {
    const was = this.view
    this.view = v
    this.viewT = 0
    this.cabin.visible = v !== 'elephant'
    // No haze on the view below: all of Thailand, crisp.
    this.scene.fog = v === 'elephant' ? null : this.haze
    this.rig.lag = v === 'screen' ? 0.35 : 0.5
    // In and out of the view below happen behind a white flash: cut, don't fly through the wall.
    if (v === 'elephant' || was === 'elephant') this.rig.setShot(this.shot(), true)
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
        else if (!this.belt && this.beltT > 4.5) {
          this.riders.ji.react('wiggle')
          this.setBelt(true)
        }
      } else this.roll += fdt
      const r = Math.max(0, this.roll)
      const speed = Math.min(1, r / TAKEOFF_ROLL)
      this.runwayDashes.position.x = (r * r * 4) % 6
      if (this.roll >= 0 && Math.floor((this.roll - dt) * 3) !== Math.floor(this.roll * 3)) sfx.jet(speed)
      lean = r > 0 ? -0.16 * Math.min(1, r / 2) : 0
      if (r > TAKEOFF_ROLL) {
        const c = Math.min(1, (r - TAKEOFF_ROLL) / CLIMB_S)
        this.alt = 2.2 + (CRUISE - 2.2) * (c * c * (3 - 2 * c))
        tilt = -0.1 * bell(Math.min(1, c * 1.4))
        if (!this.told.has('wheee')) {
          this.told.add('wheee')
          this.events.say(TALK.plane.wheee)
          for (const id of ['kaylee', 'ji', 'nick'] as const) this.riders[id].react('wave')
        }
        if (c >= 1) this.enterSection('fly')
      }
    } else if (sec === 'fly') {
      this.progress = clamp(this.secT / FLY_S)
      // Bumpy air, twice.
      if (Math.abs(this.secT - 20) < fdt || Math.abs(this.secT - 34) < fdt) this.turb = 0
      // Sparkle's balloon floats past the window; then the storks.
      this.passBalloon(this.secT - 9)
      this.storks.visible = this.secT > 16 && this.secT < 28
      if (this.storks.visible) {
        this.storks.position.x = 50 - (this.secT - 16) * 9
        for (const [i, s] of this.storks.children.entries()) s.scale.z = 1 - 0.35 * Math.abs(Math.sin(t * 6 + i))
      }
      // The clouds part, and the camera leans out of the window: Thailand, an elephant's head with a long trunk.
      if (!this.elephantDone && this.secT > 24 && this.view !== 'screen') {
        this.elephantDone = true
        this.events.flash?.()
        this.setView('elephant')
        this.events.say(TALK.plane.elephant)
      }
      if (this.view === 'elephant' && this.viewT > 4.2) {
        this.events.flash?.()
        this.setView('cabin')
      }
      if (this.secT > FLY_S) this.enterSection('land')
    } else {
      // Seatbelts on, down to Krabi: the sea and the first rock islands, bump, bump, roll, and everyone claps.
      if (!this.belt && this.secT > 3) {
        this.riders.ji.react('wiggle')
        this.setBelt(true)
      }
      const c = clamp(this.secT / 9)
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
          for (const id of ['kaylee', 'ji', 'nick'] as const) {
            this.riders[id].react('hop')
            this.riders[id].react('wave')
          }
          this.events.say(TALK.plane.krabi)
        }
        if (b > 3.6 && this.touchdown - fdt <= 3.6) this.events.done('pier')
      }
    }
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
    for (const id of ['kaylee', 'ji', 'nick'] as const) {
      const seat = this.seats[id]
      const doze = id === 'nick' && this.dad.asleep ? -0.22 : 0
      seat.rotation.z += (lean + doze - seat.rotation.z) * (1 - Math.exp(-dt * 6))
    }
    if (!this.dad.asleep) {
      this.dad.t += dt
      if (this.dad.t > 9) this.dad.asleep = true
    } else if (Math.floor(t / 6.4) !== Math.floor((t - dt) / 6.4) && sec === 'fly') sfx.snort()
    // The shade, the tray, the call button's glow, the reading light.
    this.shade.k = clamp(this.shade.k + (this.shade.down ? dt : -dt) / 0.4)
    this.parts.shade.scale.y = 0.05 + 0.95 * this.shade.k
    this.trayK = clamp(this.trayK + (this.trayOpen ? dt : -dt) / 0.35)
    this.parts.tray.rotation.z = -Math.PI / 2 * (1 - this.trayK)
    this.callGlow = Math.min(1, this.callGlow + dt / 1.2)
    this.parts.call.scale.setScalar(1 + bell(this.callGlow) * 0.6)
    this.parts.cone.visible = this.lightOn
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
    if (this.view !== 'elephant') k.lookAt(WINDOW.x, WINDOW.y, WALL_Z - 3)
    for (const c of Object.values(this.riders)) c.update(dt, t)
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
      this.events.say(TALK.plane.land)
      if (this.view !== 'cabin') this.setView('cabin')
    }
    if (s === 'fly') setTimeout(() => this.sec === 'fly' && this.events.say(TALK.plane.tray), 1500)
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
    return { center: new Vector3(-0.2, 1.05, -0.3), half: tall ? new Vector3(1.05, 0.9, 0.95) : new Vector3(1.35, 0.85, 0.95), yaw: -56, pitch: 27, minDist: 3 }
  }

  protected anchorAt(id: string): AnchorSpot | null {
    if (this.view === 'elephant') return null
    const at = (o: Object3D, dy = 0) => {
      const p = o.getWorldPosition(new Vector3())
      p.y += dy
      return p
    }
    switch (id) {
      case 'belt':
        return { at: at(this.parts.buckle), r: 0.12, glow: !this.belt && this.sec !== 'fly', prio: 3 }
      case 'window':
        return { at: this.cabin.localToWorld(new Vector3(WINDOW.x, WINDOW.y, WALL_Z + 0.05)), r: 0.32 }
      case 'tray':
        return { at: this.cabin.localToWorld(new Vector3(FRONT_X + 0.2 * this.trayK, TRAY_Y - 0.15 * (1 - this.trayK), SEATS.kaylee)), r: 0.2, glow: this.sec === 'fly' && !this.trayOpen && this.secT > 2 && this.secT < 14, prio: 3 }
      case 'call':
        return { at: at(this.parts.call), r: 0.08, glow: this.sec === 'fly' && this.trayOpen && this.snacks.length === 0, prio: 3 }
      case 'light':
        return { at: at(this.parts.light), r: 0.08, prio: 3 }
      case 'screen':
        return { at: at(this.parts.screen, 0.05), r: 0.18, prio: 3 }
      case 'teddy':
        return this.teddy ? { at: at(this.teddy, 0.15), r: 0.14, prio: 3 } : null
      case 'balloon':
        return this.balloon?.visible && !this.shade.down ? { at: at(this.balloon), r: 1.5 } : null
    }
    if (id.startsWith('family:')) {
      const c = this.riders[id.slice(7) as 'ji']
      if (!c) return null
      return { at: at(c.root, c.height * 0.62), r: c.height * 0.24, max: 120 }
    }
    return null
  }

  protected hintAt() {
    if (!this.belt) return this.parts.buckle.getWorldPosition(new Vector3())
    if (this.sec === 'fly' && !this.trayOpen) return this.cabin.localToWorld(new Vector3(FRONT_X, TRAY_Y - 0.15, SEATS.kaylee))
    if (this.sec === 'fly') return this.parts.call.getWorldPosition(tmp).clone()
    return null
  }

  qa() {
    return { leg: 'plane', section: this.sec, t: Math.round(this.secT * 10) / 10, belt: this.belt, rolling: this.roll >= 0, alt: Math.round(this.alt), progress: Math.round(this.progress * 100) / 100, tray: this.trayOpen, shade: this.shade.down, light: this.lightOn, view: this.view, touchdown: this.touchdown >= 0, touches: this.touches, ...this.counts }
  }
}

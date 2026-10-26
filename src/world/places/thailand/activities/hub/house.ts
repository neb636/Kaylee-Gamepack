// Agong's house, running: builds the world, then each frame moves Kaylee and the family, keeps the camera on her,
// cuts the walls away so the camera can see in, and places the DOM tap targets (Anchors.tsx) over what they mark.
//
// What a tap does:
// - on a thing: it reacts at once (wobble, sound), then Kaylee walks over and uses it (sits, bounces, does a wai)
// - on someone in the family: they hop and say hi, she walks up to them, and they hop together
// - on the floor: she walks there (around the furniture)
// - on the stairs: she walks to them and hops up (or down), and the camera follows her to the other floor
// Holding a finger down and moving it leads her around like on a string.
//
// A trip (thailand/trip/legs/house-plugin.ts) mounts the house with a plugin: it gets the scene, the pokes, the
// avatar and the family, sees every touch first, can move the family, take the camera, and add tap targets of its own
// (ids starting with "trip:"). The house stays the house.
import { Color, Group, Plane, Raycaster, Scene, Vector2, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { Avatar } from '../../characters/avatar'
import { FAMILY, type FamilyMember } from '../../characters/family'
import { Member } from '../../characters/member'
import type { AnchorInfo } from '../../engine/Anchors'
import { CameraRig, type Shot } from '../../engine/camera'
import { Bag } from '../../engine/dispose'
import { NavGrid, type XZ } from '../../engine/nav'
import { TapMarker } from '../../engine/marker'
import { setHullHighlight, setOutlineResolution } from '../../engine/outline'
import { applyBands, makeLights, PAL } from '../../engine/toon'
import { TUNE } from '../../engine/tune'
import type { World3D } from '../../engine/View3D'
import { say } from '../../../../../sdk'
import { L } from '../../lines'
import { sfx } from '../../sfx'
import { Gecko } from './build/gecko'
import { buildDivider, DIVIDER_BASE } from './build/divider'
import { buildGround } from './build/ground'
import type { Kit } from './build/kit'
import { Reactor, rememberRest } from './build/pokes'
import { buildStairs } from './build/stairs'
import { buildStreet, TUK_SEAT } from './build/street'
import { Traffic } from './build/traffic'
import { buildUpper } from './build/upper'
import { DIM, NAV, PHOTO, PICKABLES, SHUTTER_RECT, STAIRS_FOOT, STAIRS_TOP, STARTS, stairSteps, type Pickable } from './layout'
import type { HubSection } from './sections'

export type Spot = 'street' | 'downstairs' | 'upstairs'
export interface Start {
  section: HubSection
  /** A use-spot (pickable id) to start in, e.g. 'table' or 'mattress'. */
  at?: string
  /** The family photo: one person alone, turning slowly (an id from looks.ts), or everyone. */
  who?: string
}

export interface HouseEvents {
  /** Kaylee moved to another spot (the address bar and tests follow it). `at` = the thing she's using. */
  onSpot(spot: Spot, at?: string): void
  /** The arrival finished (or was skipped). */
  onArrived(): void
  /** She tapped a thing (Sparkle may tell her about it). */
  onPoke?(id: string): void
  /** She tapped someone in the family, who waved (and said hi, unless this returns true: they speak up instead). */
  onGreet?(id: string): boolean | void
}

/** Where a family member is (a spot like the ones in family.ts), or hidden (packed in a suitcase!). */
export type FamilySpot = NonNullable<FamilyMember['spot']> | 'hidden'

/** A trip running in the house (see the top of this file). Every hook is optional except update. */
export interface HousePlugin {
  /** Called once, after the house is built and its start section set up. */
  attach(house: House): void
  update(dt: number, t: number): void
  /** The camera's goal while the plugin wants it (null: the house's own follow camera). */
  shot?(): Shot | null
  /** First refusal on every touch: return true when the plugin used it. */
  pointerDown?(x: number, y: number, id?: string): boolean
  pointerMove?(x: number, y: number, downX: number, downY: number): boolean
  pointerUp?(): boolean
  tap?(x: number, y: number, id?: string): boolean
  /** Where its own tap targets ("trip:..." ids) are now (null: hidden). */
  anchor?(id: string): { at: Vector3; r: number; glow?: boolean } | null
  /** The house's own tap target `id` is off while the plugin says so (e.g. the house's suitcase, replaced by the trip's). */
  hides?(id: string): boolean
  /** Its own pickable objects, for the tap raycast. */
  readonly roots?: Object3D[]
  /** Someone in the family glows ("tap me!"), e.g. Agong while she has his photo to give him. */
  glows?(id: string): boolean
  readonly busy?: boolean
  qa?(): Record<string, unknown>
}

const deg = Math.PI / 180
/** Where the tuk-tuk stops to let her out, and where it parks after (out of the way, past the spirit house). */
const DROP_X = 0.9
const PARK_X = 9.8
const tmp = new Vector3()
const tmp2 = new Vector3()

export const ANCHORS: AnchorInfo[] = [
  ...PICKABLES.map((p) => ({ id: p.id, label: p.label, kind: 'thing' as const })),
  ...FAMILY.map((m) => ({ id: `family:${m.id}`, label: m.name, name: m.name, thai: m.thai, kind: 'family' as const })),
  { id: 'family:kaylee', label: 'Kaylee', name: 'Kaylee', kind: 'family' },
]

export class House implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  private bag = new Bag()
  readonly kit: Kit = { bag: this.bag, pokes: new Map(), parts: new Map() }
  private reactor: Reactor
  private lights = makeLights(this.scene)
  readonly kaylee: Avatar
  readonly family = new Map<string, Member>()
  /** Where a plugin has moved someone (the goodbye at the shutter, Gan in the suitcase). */
  private moved = new Map<string, FamilySpot>()
  /** The family photo (section `family`): everyone lined up on the sidewalk, or one person turning slowly. */
  private photo: { who: string | null } | null = null
  private nav: Record<0 | 1, NavGrid>
  private marker: TapMarker
  private gecko: Gecko
  private traffic: Traffic
  private raycaster = new Raycaster()
  private groups: Record<'tall' | 'props' | 'roof' | 'upper' | 'upperRoom' | 'upperFront' | 'front' | 'groundRoom' | 'stairs', Group>
  private cuts: { obj: Object3D; low: number; when: (m: Mode) => boolean; value: number }[] = []
  /** Where she is: outside, downstairs or upstairs (drives the cutaway and the camera). */
  private mode: Mode = 'street'
  private spot: Spot = 'street'
  private using: string | undefined
  private climbing = false
  private arrival: { t: number; done: boolean; hopped?: boolean } | null = null
  private tuk: Group | null = null
  /** After dropping her off, the tuk-tuk drives on to its parking spot. */
  private tukDrive: { t: number } | null = null
  private w = 1
  private h = 1
  /** The view's size in px (a plugin places its own overlays with it). */
  get size() {
    return { w: this.w, h: this.h }
  }
  private time = 0
  /** Kaylee's smoothed velocity: the camera looks a little ahead of where she's going. */
  private vel = new Vector3()
  private lastPos = new Vector3()
  private anchorEls = new Map<string, HTMLElement>()
  private hovered: string | null = null
  /** How many times she's said hi to each of them (their first hello is Sawasdee). */
  private greeted = new Map<string, number>()
  private lead: { x: number; y: number; last: number } | null = null
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  /** While setting up a deep link: the Hub has already announced the section, so no events. */
  private quiet = true

  constructor(
    private renderer: WebGLRenderer,
    start: Start,
    private events: HouseEvents,
    private plugin: HousePlugin | null = null,
  ) {
    const { scene, kit } = this
    scene.background = new Color(PAL.sky)
    applyBands()

    const street = buildStreet(kit)
    const ground = buildGround(kit)
    const divider = buildDivider(kit)
    const upper = buildUpper(kit)
    const stairs = buildStairs(kit)
    this.gecko = new Gecko(kit)
    upper.room.add(this.gecko.root)
    this.traffic = new Traffic(kit)
    scene.add(this.traffic.root)
    // Grouped by when they show (applyVisibility): the upstairs room only from upstairs, the downstairs room from the
    // street only once the shutter is up, and so on.
    const upperRoom = new Group()
    upperRoom.add(upper.room, upper.rightWall)
    const upperAll = new Group()
    const upperFront = street.upperFront
    upperAll.add(upperRoom, street.balcony, upperFront)
    const groundRoom = new Group()
    groundRoom.add(ground.room, ground.rightWall, ground.stairWall, divider.low, divider.high)
    scene.add(street.ground, street.tall, street.props, street.front, street.frontRight, street.roof, groundRoom, stairs, upperAll)
    this.groups = { tall: street.tall, props: street.props, roof: street.roof, upper: upperAll, upperRoom, upperFront, front: street.front, groundRoom, stairs }
    // Walls that lower so the camera can see in: the right walls (to 1 m), the front pillar and the upper front.
    this.cuts.push(
      { obj: ground.rightWall, low: 1.0 / DIM.g0, when: (m) => m !== 'street', value: 1 },
      { obj: street.frontRight, low: 1.0 / DIM.g0, when: (m) => m !== 'street', value: 1 },
      { obj: upper.rightWall, low: 1.0 / DIM.g1, when: (m) => m === 'inside1', value: 1 },
      { obj: upperFront, low: 0.12, when: (m) => m === 'inside1', value: 1 },
      // Upstairs the glass wall stands between the camera and her room once she's in it.
      { obj: upper.glassWall, low: 0.12, when: (m) => m === 'inside1' && this.kaylee.position.z < DIM.hall.zGlass - 0.1, value: 1 },
      // Downstairs the divider's cabinets would hide her once she walks through its doorway (the cupboards stay).
      { obj: divider.high, low: 0.02, when: (m) => m === 'inside0' && this.kaylee.position.z < DIM.divider.z + DIM.divider.d / 2, value: 1 },
      // And the wall behind the stairs, once she's in the kitchen.
      { obj: ground.stairWall, low: 1.0 / DIM.g0, when: (m) => m === 'inside0' && this.kaylee.position.z < DIM.stairs.zBack - DIM.stairWall.t, value: 1 },
    )
    // The upper wall pieces scale from the upstairs floor, not from the street.
    const upperCuts: Object3D[] = [upper.rightWall, upperFront, upper.glassWall]
    for (const c of this.cuts) c.obj.userData.cutBase = upperCuts.includes(c.obj) ? DIM.g0 : c.obj === divider.high ? DIVIDER_BASE : 0

    this.reactor = new Reactor(kit, this.bag)
    scene.add(this.reactor.root)
    this.tuk = kit.pokes.get('tuk-tuk') ?? null
    rememberRest(kit)

    // The family: everyone at their spot (the ones who don't live here only come for the family photo).
    for (const m of FAMILY) {
      const p = new Member(m, this.bag)
      this.family.set(m.id, p)
      scene.add(p.root)
    }
    this.kaylee = new Avatar(this.bag)
    scene.add(this.kaylee.root)
    this.marker = new TapMarker(this.bag)
    scene.add(this.marker.root)

    this.nav = { 0: this.buildNav(0), 1: this.buildNav(1) }
    this.begin(start)
    this.plugin?.attach(this)
    this.quiet = false
  }

  private buildNav(floor: 0 | 1) {
    const n = NAV[floor]
    const grid = new NavGrid(n.bounds[0], n.bounds[2], n.bounds[1], n.bounds[3], 0.2, 0.22)
    for (const r of n.carve) grid.carve(...r)
    for (const r of n.block) grid.block(...r)
    for (const [x, z, r] of n.circles) grid.blockCircle(x, z, r)
    for (const m of FAMILY) if (m.spot && m.spot.floor === floor && m.spot.pose === 'stand') grid.blockCircle(m.spot.x, m.spot.z, 0.19 * m.height)
    grid.commit()
    return grid
  }

  // ---------------------------------------------------------------- start / sections

  private begin(start: Start) {
    if (start.section === 'family') return this.beginPhoto(start.who)
    const s = STARTS[start.section]
    this.kaylee.floor = s.floor
    this.kaylee.place(s.x, s.floor * DIM.g0, s.z, s.face)
    this.reactor.setShutter(start.section === 'downstairs' || start.section === 'upstairs', true)
    this.spot = start.section === 'arrive' ? 'street' : start.section
    this.mode = start.section === 'upstairs' ? 'inside1' : start.section === 'downstairs' ? 'inside0' : 'street'
    this.applyShutterNav()
    if (start.section === 'arrive') this.arrival = { t: 0, done: false }
    else if (this.tuk) this.parkTuk()
    // A deep link to a use-spot: start already using it (sitting at the table, bouncing on the mattress).
    const p = start.at ? PICKABLES.find((q) => q.id === start.at) : undefined
    if (p?.use && p.floor === s.floor && (p.area === 'inside') === (start.section !== 'street' && start.section !== 'arrive')) {
      this.kaylee.place(p.use.x, s.floor * DIM.g0, p.use.z, p.use.face)
      this.useSpot(p, true)
    }
    for (const c of this.cuts) c.value = c.when(this.mode) ? c.low : 1
    this.applyVisibility()
    this.rig.setShot(this.shot(), true)
  }

  /** Everyone lined up in front of Agong's house, smiling at the camera; or one of them alone, turning slowly. */
  private beginPhoto(who?: string) {
    const one = who && (who === 'kaylee' || this.family.has(who)) ? who : null
    this.photo = { who: one }
    this.mode = 'street'
    this.spot = 'street'
    this.reactor.setShutter(false, true)
    this.applyShutterNav()
    this.parkTuk()
    this.layoutPhoto()
    if (one === 'kaylee') this.kaylee.place(0, 0, 1.3, 0)
    else if (one) this.family.get(one)?.place(0, 0, 1.3, 0)
    this.kaylee.root.visible = !one || one === 'kaylee'
    for (const c of this.cuts) c.value = 1
    this.applyVisibility()
    this.rig.setShot(this.shot(), true)
  }

  /** Everyone in their row; on a tall screen they squeeze together (a crowded family photo) so nobody is tiny. */
  private layoutPhoto() {
    if (!this.photo || this.photo.who) return
    const squeeze = this.w < this.h ? 0.68 : 1
    PHOTO.back.forEach((id, i) => this.family.get(id)?.place((i - (PHOTO.back.length - 1) / 2) * PHOTO.spacing * squeeze, 0, PHOTO.backZ, 0))
    for (const [id, x] of PHOTO.front) {
      if (id === 'kaylee') this.kaylee.place(x * squeeze, 0, PHOTO.frontZ, 0)
      else this.family.get(id)?.place(x * squeeze, 0, PHOTO.frontZ, 0)
    }
  }

  /** Skips the tuk-tuk arrival: she's on the sidewalk, the camera at the street. */
  skipArrival() {
    if (!this.arrival || this.arrival.done) return
    this.arrival.t = 99
  }
  get arriving() {
    return !!this.arrival && !this.arrival.done
  }

  private parkTuk() {
    if (!this.tuk) return
    this.tuk.position.set(PARK_X, 0, 3.95)
    this.tuk.userData.baseY = 0
    this.tukDrive = null
  }

  // ---------------------------------------------------------------- input

  setAnchorElements(els: Map<string, HTMLElement>) {
    this.anchorEls = els
  }

  /** A finger (or mouse) went down, on the canvas or on an anchor button. */
  pointerDown(x: number, y: number, id?: string) {
    if (this.plugin?.pointerDown?.(x, y, id)) return
    this.lead = { x, y, last: performance.now() }
  }
  /** While held: past 12 px she follows the finger (re-aimed every 150 ms). */
  pointerMove(x: number, y: number, downX: number, downY: number, held: boolean) {
    if (!held) {
      this.hover(x, y)
      return
    }
    if (this.plugin?.pointerMove?.(x, y, downX, downY)) return
    if (!this.lead || this.arriving || this.climbing || this.photo) return
    if (Math.hypot(x - downX, y - downY) < 12) return
    const now = performance.now()
    if (now - this.lead.last < 150) return
    this.lead.last = now
    const hit = this.floorPoint(x, y)
    if (hit) this.walkTo([hit.x, hit.z], undefined, false)
  }
  pointerUp() {
    this.plugin?.pointerUp?.()
    this.lead = null
  }

  /** A tap: on an anchor (id given) or at a screen point (raycast). */
  tap(x: number, y: number, id?: string) {
    if (this.arriving) {
      this.skipArrival()
      return
    }
    const target = id ?? this.pick(x, y)
    if (this.plugin?.tap?.(x, y, target ?? undefined)) return
    if (target === 'kaylee' || target === 'family:kaylee') {
      this.kaylee.react('hop')
      sfx.boing()
      return
    }
    if (target?.startsWith('family:')) return this.photo ? this.cheer(target.slice(7)) : this.greet(target.slice(7))
    // In the family photo only people react; nobody walks off.
    if (this.photo) return
    const p = target ? PICKABLES.find((q) => q.id === target) : undefined
    if (p && this.allowed(p)) return this.usePickable(p)
    const hit = this.floorPoint(x, y)
    if (hit) this.walkTo([hit.x, hit.z], undefined, true)
  }

  private hover(x: number, y: number) {
    if (!matchMedia('(hover: hover)').matches) return
    const id = this.pick(x, y)
    if (id === this.hovered) return
    this.highlight(this.hovered, false)
    this.hovered = id
    this.highlight(id, true)
    this.renderer.domElement.style.cursor = id ? 'pointer' : 'default'
  }
  /** Desktop: a hot-pink outline on whatever the mouse is over. */
  hoverAnchor(id: string | null) {
    if (id === this.hovered) return
    this.highlight(this.hovered, false)
    this.hovered = id
    this.highlight(id, true)
  }
  private highlight(id: string | null, on: boolean) {
    if (!id) return
    const obj = id.startsWith('family:') ? this.family.get(id.slice(7))?.root : this.kit.pokes.get(id)
    obj?.traverse((o) => {
      if ((o as { isMesh?: boolean }).isMesh && o.userData.hull !== undefined) setHullHighlight(o as never, on)
    })
  }

  private ndc(x: number, y: number) {
    return new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1)
  }

  /** What's under a screen point: a pickable id, 'family:<id>', 'kaylee', or null. */
  private pick(x: number, y: number): string | null {
    this.raycaster.setFromCamera(this.ndc(x, y), this.rig.camera)
    const targets: Object3D[] = [this.kaylee.root, ...[...this.family.values()].map((f) => f.root), ...[...this.kit.pokes.values()], ...(this.plugin?.roots ?? [])]
    for (const hit of this.raycaster.intersectObjects(targets, true)) {
      if (!visibleChain(hit.object)) continue
      let o: Object3D | null = hit.object
      while (o && o.userData.pick === undefined) o = o.parent
      const id = o?.userData.pick as string | undefined
      if (!id) continue
      if (id === 'kaylee' || id.startsWith('family:')) return this.familyVisible(id) ? id : null
      if (id.startsWith('trip:')) return this.plugin ? id : null
      const p = PICKABLES.find((q) => q.id === id)
      if (p && this.allowed(p)) return id
      // Something we can't use from here (behind a wall, another floor): keep looking.
    }
    return null
  }

  /** Where a screen point lands on the floor she's on. */
  private floorPoint(x: number, y: number) {
    this.raycaster.setFromCamera(this.ndc(x, y), this.rig.camera)
    const plane = new Plane(new Vector3(0, 1, 0), -this.kaylee.floor * DIM.g0)
    return this.raycaster.ray.intersectPlane(plane, new Vector3())
  }

  /** Can she use this from where she is (her floor, inside or outside)? */
  private allowed(p: Pickable) {
    if (p.floor !== this.kaylee.floor || this.plugin?.hides?.(p.id)) return false
    if (p.floor === 1) return true
    return p.area === 'street' ? this.mode === 'street' : this.mode === 'inside0'
  }
  /** Can she see (and so greet) this family member from where she is? */
  private familyShown(m: (typeof FAMILY)[number]) {
    if (this.photo) return !this.photo.who || this.photo.who === m.id
    const s = this.spotOf(m)
    if (!s) return false
    if (s.floor === 1) return this.mode === 'inside1'
    if (s.z > 0) return this.mode === 'street'
    // From upstairs she looks down into the shop over the balcony (they're there, but on the other floor).
    return this.mode !== 'street' || this.reactor.shutterOpen
  }
  /** Can she tap (and greet) them from here? From the street, the family inside is behind the shop front. */
  private familyVisible(id: string) {
    if (id === 'kaylee' || id === 'family:kaylee') return !this.photo || !this.photo.who || this.photo.who === 'kaylee'
    const m = FAMILY.find((f) => `family:${f.id}` === id)
    if (m && this.photo) return this.familyShown(m)
    const s = m && this.spotOf(m)
    if (!s || s.floor !== this.kaylee.floor || !this.familyShown(m)) return false
    return !(this.mode === 'street' && s.z < 0)
  }
  /** Where they are now: moved by a plugin, or their usual spot. */
  private spotOf(m: FamilyMember) {
    const s = this.moved.get(m.id)
    return s === 'hidden' ? null : (s ?? m.spot)
  }

  // ---------------------------------------------------------------- doing things

  /** Walks her there around the furniture (then calls `then`). False when she can't go there (`then` never runs). */
  walkTo(to: XZ, then?: () => void, mark = true) {
    if (this.climbing) return false
    const k = this.kaylee
    const floor = k.floor
    const path = this.nav[floor].path([k.position.x, k.position.z], to)
    this.using = undefined
    if (!path) return false
    if (mark) {
      const end = path[path.length - 1]
      this.marker.show(end[0], floor * DIM.g0, end[1])
    }
    k.walk(path, then)
    return true
  }

  private usePickable(p: Pickable) {
    this.reactor.poke(p)
    this.events.onPoke?.(p.id)
    const k = this.kaylee
    if (p.react === 'stairs') return this.climb(p.floor === 0)
    if (p.id === 'gecko') this.gecko.scare()
    if (p.id === 'shutter' && p.use) {
      // The front door: roll it up and go in (or out).
      this.applyShutterNav()
      this.applyVisibility()
      const inside = this.mode !== 'street'
      if (inside) this.walkTo([0.2, 1.4])
      else this.walkTo([p.use.x, p.use.z])
      return
    }
    // Already doing it? Do it again (bounce higher, sit tighter), no walking.
    if (this.using === p.id && p.use) {
      if (p.use.pose === 'bounce') {
        sfx.boingAt(k.bounceHigher())
        // After the biggest bounce she flops down along the mattress, head on the pillows at the left wall.
        k.face(k.pose === 'lie' ? 90 : p.use.face * deg)
      } else k.react('wiggle')
      return
    }
    if (!p.use) {
      const at = this.atOf(p)
      k.lookAt(at.x, at.y, at.z)
      k.faceToward(at.x, at.z)
      return
    }
    const use = p.use
    this.walkTo([use.x, use.z], () => this.useSpot(p))
    k.lookAt(...p.at)
  }

  /** At the spot: face it, hop onto the seat or the mattress if there is one, and do the pose. */
  private useSpot(p: Pickable, instant = false) {
    const use = p.use!
    const k = this.kaylee
    const fy = k.floor * DIM.g0
    this.using = p.id
    k.face(use.face * deg)
    if (p.gentle) k.lookAt(...p.at)
    const pose = () => {
      if (use.pose === 'bounce') sfx.boingAt(k.bounceHigher())
      else k.setPose(use.pose)
      if (!this.quiet) this.events.onSpot(this.spot, p.id)
    }
    if (use.snap) {
      k.standPoint = new Vector3(use.x, fy, use.z)
      const to = new Vector3(use.snap.x, fy + use.snap.y, use.snap.z)
      if (instant) {
        k.position.copy(to)
        pose()
      } else k.hopTo(to, 0.32, 0.25, () => {
        k.face(use.face * deg)
        pose()
      })
    } else pose()
  }

  private greet(id: string) {
    const m = FAMILY.find((f) => f.id === id)
    const who = this.family.get(id)
    const s = m && this.spotOf(m)
    if (!m || !s || !who || !this.familyVisible(`family:${id}`)) return
    who.react('wave')
    if (!this.events.onGreet?.(id)) this.hello(m, who)
    const face = s.face * deg
    // Stand in front of them (or as close as there's room), then they hop together.
    const front: XZ = [s.x + Math.sin(face) * 0.95, s.z + Math.cos(face) * 0.95]
    this.walkTo(front, () => {
      const k = this.kaylee
      k.faceToward(s.x, s.z)
      k.react('hop')
      who.react('hop')
      sfx.boing()
      setTimeout(() => k.react('wave'), 450)
    })
  }

  /** In the family photo: a happy hop and a hello, right where they stand. */
  private cheer(id: string) {
    const m = FAMILY.find((f) => f.id === id)
    const who = this.family.get(id)
    if (!m || !who || !this.familyShown(m)) return
    who.react('hop')
    who.react('wave')
    this.hello(m, who)
  }

  /** They say hi in their own voice: Sawasdee the first time, then something else each time (the big cousins mumble
   *  it over the tap-tap of their phones). */
  private hello(m: (typeof FAMILY)[number], who: Member) {
    const n = this.greeted.get(m.id) ?? 0
    this.greeted.set(m.id, n + 1)
    const lines = L.family[m.id]
    if (who.onPhone) sfx.phone()
    if (lines) void say(n === 0 ? lines.hi : lines.again[(n - 1) % lines.again.length])
    else sfx.babble(m.pitch)
  }

  /** Up or down the stairs: walk to the foot (or the landing), then hop step by step (`onStep` after each). */
  climb(up: boolean, done?: () => void, onStep?: (i: number, n: number) => void) {
    const k = this.kaylee
    const steps = stairSteps()
    const start = up ? STAIRS_FOOT : STAIRS_TOP
    const end = up ? STAIRS_TOP : STAIRS_FOOT
    const seq = up ? steps : [...steps].reverse()
    this.walkTo([start.x, start.z], () => {
      this.climbing = true
      seq.forEach(([x, y, z], i) => {
        k.hopTo(new Vector3(x, y, z), 0.13, 0.07, () => {
          if (i % 2 === 0) sfx.pop()
          onStep?.(i, seq.length)
          // Halfway: the other floor appears and the camera starts following her there.
          if (i === Math.floor(seq.length / 2)) {
            k.floor = up ? 1 : 0
            this.mode = up ? 'inside1' : 'inside0'
            this.applyVisibility()
          }
        })
      })
      k.hopTo(new Vector3(end.x, up ? DIM.g0 : 0, end.z), 0.25, 0.1, () => {
        this.climbing = false
        // Up, she steps off facing the front of the house (flight 2 climbs toward it); down, facing the right wall.
        k.face(up ? 0 : Math.PI / 2)
        this.setSpot(up ? 'upstairs' : 'downstairs')
        done?.()
      })
    })
  }

  private setSpot(spot: Spot) {
    if (spot === this.spot) return
    this.spot = spot
    if (!this.quiet) this.events.onSpot(spot)
  }

  // ---------------------------------------------------------------- for plugins

  /** Moves someone in the family (null: back to their usual spot). */
  placeFamily(id: string, spot: FamilySpot | null) {
    const m = FAMILY.find((f) => f.id === id)
    const who = this.family.get(id)
    if (!m || !who) return
    if (spot) this.moved.set(id, spot)
    else this.moved.delete(id)
    const s = this.spotOf(m)
    if (s) who.place(s.x, (s.floor ? DIM.g0 : 0) + (s.pose === 'sit' ? (s.seat ?? 0.45) - 0.1 * who.height : s.pose === 'lie' ? 0.2 : 0), s.z, s.face, s.pose)
    this.applyVisibility()
  }

  /** Puts her somewhere at once and shows that part of the house (a trip's section link, a cut behind a card). */
  teleport(spot: Spot, x: number, z: number, faceDeg: number) {
    const floor = spot === 'upstairs' ? 1 : 0
    this.kaylee.floor = floor
    this.kaylee.place(x, floor * DIM.g0, z, faceDeg)
    this.kaylee.setPose('stand')
    this.using = undefined
    this.climbing = false
    this.mode = spot === 'upstairs' ? 'inside1' : spot === 'downstairs' ? 'inside0' : 'street'
    this.spot = spot
    if (spot !== 'upstairs') this.reactor.setShutter(true, true)
    this.applyShutterNav()
    for (const c of this.cuts) c.value = c.when(this.mode) ? c.low : 1
    this.applyVisibility()
    this.lastPos.copy(this.kaylee.position)
    this.vel.set(0, 0, 0)
    this.rig.setShot(this.shot(), true)
  }

  /** A pickable thing reacts as if tapped (sound and wobble), without her walking over. */
  pokeThing(id: string) {
    const p = PICKABLES.find((q) => q.id === id)
    if (p) this.reactor.poke(p)
  }

  /** Where a screen point lands on a level plane at height `y` (a plugin dragging something across the room). */
  pointAt(x: number, y: number, planeY: number) {
    this.raycaster.setFromCamera(this.ndc(x, y), this.rig.camera)
    return this.raycaster.ray.intersectPlane(new Plane(new Vector3(0, 1, 0), -planeY), new Vector3())
  }

  /** Things a plugin put on the upstairs floor that she walks round (rects [x0, x1, z0, z1]). */
  blockUpstairs(rects: [number, number, number, number][]) {
    this.nav[1].setDynamic(rects)
  }

  /** Point the camera at its goal at once (after the plugin changed its shot). */
  snapCamera() {
    this.rig.setShot(this.shot(), true)
  }

  get view(): Spot {
    return this.spot
  }

  private applyShutterNav() {
    this.nav[0].setDynamic(this.reactor.shutterOpen ? [] : [SHUTTER_RECT])
  }

  /** What's shown for where she is: outside everything; inside, the tall street things, the roof and the floor above
   *  disappear (a dollhouse with its lid off). */
  private applyVisibility() {
    const m = this.mode
    this.groups.tall.visible = m === 'street'
    // Inside, the sidewalk things (and the people out there) would stand between the camera and the room; in the
    // family photo they'd stand among the family.
    this.groups.props.visible = m === 'street' && !this.photo
    this.groups.roof.visible = m === 'street'
    // Cars go by on the road between the camera and the family photo: not then.
    this.traffic.root.visible = m === 'street' && !this.photo
    this.groups.upper.visible = m !== 'inside0'
    this.groups.upperRoom.visible = m === 'inside1'
    // Inside, the sign board and the folded gates would hide the room.
    this.groups.front.visible = m === 'street'
    // From the street, the room only shows once the gates are open; from upstairs she looks down into it over the
    // balcony.
    this.groups.groundRoom.visible = m !== 'street' || this.reactor.shutterOpen
    this.groups.stairs.visible = m !== 'street' || this.reactor.shutterOpen
    for (const [id, f] of this.family) f.root.visible = this.familyShown(FAMILY.find((x) => x.id === id)!)
  }

  // ---------------------------------------------------------------- per frame

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
    this.layoutPhoto()
    this.rig.setShot(this.shot(), true)
  }

  /** The ?debug panel changed TUNE: re-apply the light bands, the outline width and the camera fit. */
  retune() {
    applyBands()
    setOutlineResolution(this.w, this.h)
    this.rig.refit()
  }

  /** The camera's goal for where she is. */
  private shot(): Shot {
    const own = this.plugin?.shot?.()
    if (own) return own
    if (this.photo) {
      const who = this.photo.who
      if (who) {
        const h = who === 'kaylee' ? this.kaylee.height : (this.family.get(who)?.height ?? 1.5)
        return { center: new Vector3(0, h * 0.58, 1.3), half: new Vector3(h * 0.5, h * 0.66, 0.45), yaw: 0, pitch: -9, minDist: 1.5 }
      }
      // On a tall screen the row fits the width with room to spare above and below: aim higher (more house, less road).
      const tall = this.w < this.h
      return { center: new Vector3(0, tall ? 1.7 : 0.95, 1.3), half: new Vector3(tall ? 3.5 : 5.0, 1.05, 0.7), yaw: 0, pitch: 0, minDist: 5 }
    }
    const k = this.kaylee.position
    const aspect = this.w / Math.max(1, this.h)
    const wide = clamp01((aspect - 0.6) / (1.6 - 0.6))
    if (this.mode === 'street') {
      return {
        center: new Vector3(clamp(k.x * 0.6, -5, 5), 2.3 - 0.6 * wide, 0.9),
        half: new Vector3(2.6 + 3.2 * wide, 2.0, 1.4),
        yaw: TUNE.streetYaw,
        pitch: TUNE.streetPitch,
        minDist: 6,
      }
    }
    const fy = this.kaylee.floor * DIM.g0
    const D = TUNE.insideFitD
    const ahead = this.climbing ? 0 : 0.7
    const cz = clamp(k.z - 0.4 + this.vel.z * ahead, DIM.back + D / 2 - 0.4, -D / 2 + 0.6)
    return {
      center: new Vector3(clamp(k.x * 0.3 + this.vel.x * ahead * 0.3, -0.7, 0.7), fy + 0.8, cz),
      half: new Vector3(TUNE.insideFitW / 2, 0.9, D / 2),
      yaw: TUNE.insideYawTall + (TUNE.insideYawWide - TUNE.insideYawTall) * wide,
      pitch: TUNE.insidePitch,
      minDist: 6,
    }
  }

  /** Nothing is moving: the frame loop may drop to 30 fps. */
  get calm() {
    return !this.kaylee.busy && !this.reactor.busy && !this.rig.moving && !this.arriving && !this.plugin?.busy
  }

  update(dt: number) {
    this.time += dt
    const t = this.time
    const k = this.kaylee
    if (this.arrival && !this.arrival.done) this.updateArrival(dt)
    this.driveTuk(dt)
    k.update(dt, t)
    if (dt > 0) {
      tmp.copy(k.position).sub(this.lastPos).divideScalar(dt)
      if (tmp.lengthSq() > 25) tmp.set(0, 0, 0) // a jump (deep link, stairs): not a walk
      this.vel.lerp(tmp, 1 - Math.exp(-dt / 0.4))
      this.lastPos.copy(k.position)
    }
    for (const f of this.family.values()) {
      const near = !this.photo && f.root.position.distanceTo(k.position) < 3 && f.root.visible
      if (near) f.lookAt(k.position.x, k.position.y + 0.6, k.position.z)
      else f.lookAway()
      f.update(dt, t)
    }
    this.reactor.update(dt, t)
    if (this.gecko.update(dt, t) && this.mode === 'inside1') sfx.tukkae()
    this.traffic.update(dt, this.mode === 'street' && !this.arriving && !this.photo)
    this.marker.update(dt)
    // Inside or outside? (with a little dead band so she doesn't flicker on the doorstep)
    if (this.photo?.who) {
      // One of them alone, like on a turntable: the front for a few seconds, then a quarter turn at a time, pausing at
      // each side and the back.
      const yaw = turntable(t)
      if (this.photo.who === 'kaylee') k.place(0, 0, 1.3, yaw)
      else this.family.get(this.photo.who)?.place(0, 0, 1.3, yaw)
    }
    // (Not while she rides in something a trip put her in, like Aunty Sri's van: her position is the seat's then.)
    if (!this.arriving && k.floor === 0 && !this.climbing && !this.photo && k.root.parent === this.scene) {
      if (this.mode === 'street' && k.position.z < -0.3) {
        this.mode = 'inside0'
        this.applyVisibility()
        this.setSpot('downstairs')
      } else if (this.mode === 'inside0' && k.position.z > 0.25) {
        this.mode = 'street'
        this.applyVisibility()
        this.setSpot('street')
      }
    }
    // Walls glide down and up.
    for (const c of this.cuts) {
      const target = c.when(this.mode) ? c.low : 1
      c.value += clamp(target - c.value, -dt / 0.3, dt / 0.3)
      const base = c.obj.userData.cutBase as number
      c.obj.scale.y = c.value
      c.obj.position.y = base * (1 - c.value)
    }
    this.plugin?.update(dt, t)
    if (!this.arriving) this.rig.setShot(this.shot())
    this.rig.lag = this.climbing ? 0.25 : 0.35
    this.rig.update(dt)
    const c = this.rig.camera.position
    this.lights.follow(c.x * 0.2, k.position.y, k.position.z)
  }

  render() {
    const r = this.renderer
    r.render(this.scene, this.rig.camera)
    this.stats.calls = r.info.render.calls
    this.stats.tris = r.info.render.triangles
  }

  /** Positions the DOM tap targets over their things (style writes only). */
  placeAnchors() {
    const cam = this.rig.camera
    const right = tmp2.set(1, 0, 0).applyQuaternion(cam.quaternion)
    for (const [id, el] of this.anchorEls) {
      let at: Vector3 | null = null
      let top: Vector3 | null = null
      let r = 0.5
      let show = false
      let glow = false
      if (id.startsWith('trip:')) {
        const a = this.plugin?.anchor?.(id)
        if (a) {
          at = tmp.copy(a.at)
          r = a.r
          glow = !!a.glow
          show = true
        }
      } else if (id === 'family:kaylee') {
        if (this.photo && this.familyVisible(id)) {
          at = tmp.copy(this.kaylee.position)
          top = at.clone().setY(at.y + this.kaylee.height * 1.12)
          at.y += this.kaylee.height * 0.5
          r = this.kaylee.height * 0.42
          show = true
        }
      } else if (id.startsWith('family:')) {
        const f = this.family.get(id.slice(7))
        if (f && f.root.visible && this.familyVisible(id)) {
          // World position: a trip may have sat them in a car.
          at = f.root.getWorldPosition(tmp)
          top = at.clone().setY(at.y + f.height * (f.pose === 'lie' ? 0.45 : 1.12))
          at.y += f.height * (f.pose === 'lie' ? 0.2 : 0.5)
          r = f.height * 0.42
          show = true
          glow = !!this.plugin?.glows?.(id)
        }
      } else {
        const p = PICKABLES.find((q) => q.id === id)
        if (p && this.allowed(p) && visibleChain(this.kit.pokes.get(id) ?? null)) {
          at = this.atOf(p)
          r = p.r
          show = true
        }
      }
      if (show && at) {
        const center = at.clone().project(cam)
        const edge = at.clone().addScaledVector(right, r).project(cam)
        if (center.z > 1 || Math.abs(center.x) > 1.05 || Math.abs(center.y) > 1.05) show = false
        else {
          const sx = ((center.x + 1) / 2) * this.w
          const sy = ((1 - center.y) / 2) * this.h
          const size = clamp(Math.abs(edge.x - center.x) * this.w, 64, 170)
          el.style.transform = `translate3d(${(sx - size / 2).toFixed(1)}px, ${(sy - size / 2).toFixed(1)}px, 0)`
          el.style.width = el.style.height = `${size.toFixed(0)}px`
          // A trip's toys sit on top of the house's own targets and the family's (they're what she's playing with).
          el.style.zIndex = String(Math.round((1 - center.z) * 10000) + (id.startsWith('trip:') ? 3000 : 0))
          // Name pills sit on top of the head, wherever the button's own top is.
          if (top) el.style.setProperty('--pill', `${(((1 - top.project(cam).y) / 2) * this.h - (sy - size / 2)).toFixed(1)}px`)
          const shadow = glow ? '0 0 0 6px rgba(255,79,154,.55), 0 0 26px 10px rgba(255,200,61,.7)' : ''
          if (el.style.boxShadow !== shadow) el.style.boxShadow = shadow
        }
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
  }

  /** Where a thing is now: things that move (the gecko) are wherever they've got to. */
  private atOf(p: Pickable) {
    const g = p.moves ? this.kit.pokes.get(p.id) : undefined
    return g ? g.getWorldPosition(new Vector3()) : new Vector3(...p.at)
  }

  // ---------------------------------------------------------------- the arrival

  /** The tuk-tuk rolls in from the right and stops at Agong's door; Kaylee hops out onto the sidewalk; it toots and
   *  drives on to park. */
  private updateArrival(dt: number) {
    const a = this.arrival!
    a.t += dt
    const k = this.kaylee
    const STOP = 2.8
    if (a.t >= 99) {
      // Skipped.
      this.parkTuk()
      k.setPose('stand')
      k.place(STARTS.arrive.x, 0, STARTS.arrive.z, STARTS.arrive.face)
      this.finishArrival(true)
      return
    }
    if (a.t < STOP) {
      const p = a.t / STOP
      const x = DROP_X + (16 - DROP_X) * (1 - p) ** 3
      const bump = Math.abs(Math.sin(a.t * 18)) * 0.025 * (1 - p)
      this.tuk?.position.set(x, bump, 3.95)
      k.place(x + TUK_SEAT.x, TUK_SEAT.y + bump, 3.95, 90)
      k.setPose('sit')
    } else if (!a.hopped) {
      a.hopped = true
      k.setPose('stand')
      k.hopTo(new Vector3(STARTS.arrive.x, 0, STARTS.arrive.z), 0.5, 0.65, () => {
        k.face(STARTS.arrive.face * deg)
        sfx.thump()
      })
    } else if (!k.walking) this.finishArrival(false)
    const far: Shot = { center: new Vector3(2, 2.6, 2.2), half: new Vector3(7, 3.5, 3), yaw: -12, pitch: 13, minDist: 22 }
    this.rig.lag = 0.9
    this.rig.setShot(a.t < 1.0 ? far : this.shot(), a.t < dt * 1.5)
  }
  private finishArrival(snap: boolean) {
    if (!this.arrival || this.arrival.done) return
    this.arrival.done = true
    if (!snap && this.tuk) {
      this.tukDrive = { t: 0 }
      sfx.toot()
    }
    this.rig.setShot(this.shot(), snap)
    this.events.onArrived()
    this.events.onSpot('street')
  }
  private driveTuk(dt: number) {
    const d = this.tukDrive
    if (!d || !this.tuk) return
    d.t += dt / 1.8
    const p = Math.min(1, d.t)
    const ease = p * p * (3 - 2 * p)
    this.tuk.position.set(DROP_X + (PARK_X - DROP_X) * ease, 0, 3.95)
    if (p >= 1) this.parkTuk()
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const k = this.kaylee
    return {
      floor: k.floor,
      view: this.mode,
      spot: this.spot,
      pose: k.pose,
      using: this.using ?? null,
      walking: k.walking,
      arriving: this.arriving,
      shutterOpen: this.reactor.shutterOpen,
      pos: [k.position.x, k.position.y, k.position.z].map((v) => Math.round(v * 100) / 100),
      ...this.plugin?.qa?.(),
    }
  }
  memory() {
    return { ...this.renderer.info.memory }
  }
  navCells(floor: 0 | 1) {
    return { grid: this.nav[floor], cells: this.nav[floor].cells() }
  }

  dispose() {
    this.scene.clear()
    this.bag.dispose()
  }
}

type Mode = 'street' | 'inside0' | 'inside1'

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
/** Degrees: hold a three-quarter view (like the concept pictures) for 3 s, then turn 90° in 1 s and hold 1.2 s, four
 *  times (an 11.8 s loop). */
function turntable(t: number) {
  const front = 3
  const quarter = 2.2
  const loop = front + quarter * 4
  const u = t % loop
  if (u < front) return -25
  const k = Math.floor((u - front) / quarter)
  const p = Math.min(1, ((u - front) % quarter) / 1.0)
  return -25 + (k + p * p * (3 - 2 * p)) * 90
}
const clamp01 = (v: number) => clamp(v, 0, 1)
function visibleChain(o: Object3D | null): boolean {
  if (!o) return false
  for (let x: Object3D | null = o; x; x = x.parent) if (!x.visible) return false
  return true
}

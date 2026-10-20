// The start of a trip, in Agong's own house (activities/hub/house.ts, mounted with this plugin, not copied):
//
// - invite: in Kaylee's room, Mommy asks if she's ready to go on a trip (the screen shows the 👍 / ✋ card, Ask.tsx).
//   Yes: the suitcase hops out into the room and springs open, and the camera drops to it.
// - pack (the toy): tap anything in her room and it hops into the suitcase in a big arc (or drag it there); tap
//   something inside and it hops back out. Nothing is wrong: the pillow, the fan, a mango, even Gan asleep on the
//   mattress ("Five more minutes..."). So she always knows what to do: the things she can pack hop now and then, a
//   finger points at one (then, once a few are in, at the suitcase), the screen counts what's in it, and Mommy says when
//   to close it. After a little while Mommy's one hint makes the sun things glint. To close it, tap the suitcase (or
//   the screen's ✅ button): once it holds a few things Kaylee hops on top and sits on it (squash, click); past five
//   things it's too full and takes three hops. Mommy tucks in sunscreen whatever she packed. Click! Her sun hat drops
//   onto her head (or Mommy's spare one, if she packed none), her sunglasses slide on, her floaties pop on: she wears
//   them for the rest of the trip. Then she walks down the stairs with the suitcase bonking on every step.
// - goodbye: on the sidewalk by the open shutter the family who live here wave her off (tap anyone for a hug). Agong
//   asks for a photo of the Nail Island; Jum gives her a little bag of snacks (tap her, or she brings it when the van
//   comes); the big cousins wave and say "Bye..." without looking up from their phones. Aunty Sri's white electric van
//   hums up quickly; tap it (or wait a moment), the side door slides open, everyone hops in, and it glides off.
// - home: the flight home is a 4-second picture (their plane over a pink sunset, home-flight.ts; a tap skips it), then
//   a white flash and Aunty Sri's van pulls up at Agong's door. Everyone hops out, the family come out of the shop to
//   meet them, and Agong asks for his photo. Her photos fan out on the screen (BoatTrip.tsx) and she picks one: it's in
//   her hands, in a pink frame. She taps Agong: she gives it to him, he holds it up ("Beautiful! Thank you, Kaylee!"),
//   walks in and hangs it on the wall by the old photos (trip/wall.ts). Everyone gathers round, and the big cousins put
//   their phones down for the first time: "Whoa! Cool!" Then the screen gives her the stamp.
import { Group, Vector3, type Object3D } from 'three'
import { bell, clamp, sounds, wobble, type Line } from '../../../../../sdk'
import type { AnchorInfo } from '../../engine/Anchors'
import type { Shot } from '../../engine/camera'
import { DIM } from '../../activities/hub/layout'
import type { House, HousePlugin } from '../../activities/hub/house'
import { sfx } from '../../sfx'
import { ITEMS, mommyTucksIn, wearing } from '../packing'
import { buildItem, buildSuitcase, type Suitcase } from '../props'
import { L } from '../../lines'
import { buildVan, type Van } from '../vehicles/van'
import { buildTripFrame, hang, WALL_SLOTS, type TripFrame } from '../wall'
import { buildHomeFlight, FLIGHT_S, type HomeFlight } from './home-flight'
import { Hopper, put } from './stage'

export type HouseLeg = 'invite' | 'pack' | 'goodbye' | 'home'

export interface TripHouseEvents {
  say(l: Line): void
  section(id: HouseLeg): void
  /** Where the trip is in the house (the screen shows the packing helpers while she packs). */
  phase?(p: Phase): void
  done(next: string): void
  packed(ids: string[]): void
  /** A white flash over the screen (the cut from the flight home to Agong's door). */
  flash?(): void
}

/** The trip's own tap targets in the house (the house's own come from house.ts). */
export const TRIP_HOUSE_ANCHORS: AnchorInfo[] = [
  { id: 'trip:suitcase', label: 'Suitcase', kind: 'thing' },
  ...ITEMS.filter((i) => i.id !== 'gan').map((i) => ({ id: `trip:item:${i.id}`, label: i.label, kind: 'thing' as const })),
  { id: 'trip:van', label: "Aunty Sri's van", kind: 'thing' },
]

const U = DIM.g0
const deg = Math.PI / 180
/** Where everything is in her room for packing (meters; y above her floor). */
const ROOM = {
  wall: { x: 0.3, z: -20.45 },
  suitcase: { x: -0.3, z: -19.45 },
  kaylee: { x: 0.35, z: -19.3, face: -95 },
  ji: { floor: 1 as const, x: 1.55, z: -20.1, face: -25, pose: 'stand' as const },
  gan: { floor: 1 as const, x: -1.775, z: -20.37, face: 90, pose: 'lie' as const },
  items: {
    sunhat: [-1.05, 0, -18.3],
    sunglasses: [-0.45, 0, -18.0],
    sunscreen: [0.1, 0, -18.3],
    floaties: [0.72, 0, -18.05],
    swimsuit: [1.2, 0, -18.4],
    duck: [0.75, 0, -18.95],
    camera: [0.85, 0, -19.75],
    bucket: [1.45, 0, -19.2],
    pillow: [-1.0, 0.22, -19.55],
    teddy: [-1.55, 0.22, -19.2],
    fan: [-0.95, 0.22, -20.35],
    mango: [-0.2, 0, -17.65],
  } as Record<string, [number, number, number]>,
}
/** Where Kaylee stands while Mommy asks (between her and the suitcase by the wall). */
const INVITE = { x: 0.55, z: -19.5 }
/** The sidewalk at the goodbye (street floor, +z toward the road). */
const STREET = {
  kaylee: { x: 0.25, z: 1.85, face: 0 },
  suitcase: { x: 0.95, z: 1.95 },
  ji: { floor: 0 as const, x: -0.75, z: 1.4, face: 10, pose: 'stand' as const },
  nick: { floor: 0 as const, x: 1.55, z: 1.35, face: -10, pose: 'stand' as const },
  // The family who live here, either side of the shutter (the cousins together, on their phones).
  row: [['bb', -2.75], ['gan', -2.05], ['ken', -1.35], ['joy', -0.6], ['agong', 0.95], ['jum', 1.95]] as [string, number][],
  rowZ: 0.8,
  carZ: 3.95,
  // Beside the family, past Jum: in front of them the van would hide everyone on the sidewalk.
  carStop: 5.1,
}
/** Coming home: where the family wait inside the shop before they come out, where Agong hangs the photo (in front of the
 *  table, below his wall), and where everyone gathers round to look at it. */
const HOME = {
  insideZ: -1.0,
  // Out of the van: Mommy and Daddy either side, so nobody stands in front of Agong.
  out: { kaylee: { x: 0.25, z: 1.85, face: 0 }, ji: { x: -0.85, z: 1.55, face: 15 }, nick: { x: 2.75, z: 1.6, face: -20 } } as Record<string, { x: number; z: number; face: number }>,
  agong: { x: -1.85, z: -0.8, face: -90 },
  kaylee: { x: -1.2, z: -0.5 },
  // Round the new photo like for a family picture: in an arc on the floor below it (clear of the table), turned toward
  // the camera, looking up at it.
  gather: [
    ['jum', -0.65, -3.45, 25],
    ['ji', -0.95, -2.35, 30],
    ['nick', -0.3, -2.95, 25],
    ['joy', 0.25, -3.3, 20],
    ['sri', 0.9, -3.55, 15],
    ['gan', 0.15, -2.1, 25],
    ['ken', 1.25, -1.35, 30],
    ['bb', 1.45, -2.45, 20],
] as [string, number, number, number][],
}
const COUSINS = ['gan', 'ken', 'bb'] as const
const HOME_PHASES: Phase[] = ['arrive', 'pick', 'give', 'hang', 'gather', 'home']

interface Thing {
  id: string
  g: Group
  home: Vector3
  packed: boolean
  tween: { from: Vector3; to: Vector3; t: number; dur: number; arc: number; done?: () => void } | null
  /** 0 = just landed (squash), 1 = settled. */
  land: number
  /** Seconds of glint left (Mommy's hint). */
  glint: number
  dragged: boolean
}

export type Phase = 'invite' | 'opening' | 'pack' | 'sitting' | 'closed' | 'leaving' | 'goodbye' | 'boarding' | 'gone' | 'flight' | 'arrive' | 'pick' | 'give' | 'hang' | 'gather' | 'home'

const tmp = new Vector3()
const tmp2 = new Vector3()

export class TripHouse implements HousePlugin {
  private house!: House
  private root = new Group()
  private suitcase!: Suitcase
  private van!: Van
  private things = new Map<string, Thing>()
  private order: string[] = []
  private hopper!: Hopper
  private phase: Phase
  private t = 0
  private phaseT = 0
  private lid = { angle: 0, goal: 0, flap: 1 }
  private squash = 1
  private door = { open: 0, goal: 0 }
  private lastTouch = 0
  /** The "do this" finger (the screen draws it after the house, so it's looked up each frame). */
  private hintEl: () => HTMLElement | null = () => null
  private hinted = false
  private lastHungry = -9
  private hopsDone = 0
  private hopsNeeded = 1
  private fanBlew = false
  private ganPacked = false
  private ganTween: { from: Vector3; to: Vector3; t: number; done: () => void } | null = null
  private drag: { id: string; x: number; y: number; on: boolean } | null = null
  private follow = false
  private bump = 0
  private carT = -1
  private carX = -18
  private carWait = 0
  private carTotal = 0
  private told = new Set<string>()
  private counts = { packs: 0, unpacks: 0, drags: 0, hugs: 0 }
  /** Mommy's yawn (the pillow): her arms stretch up. */
  private yawn = 1
  /** Jum's little bag of snacks, in Kaylee's hand once Jum gives it to her. */
  private snackBag!: Group
  private snackFly: { from: Vector3; t: number } | null = null
  /** Coming home: the flight picture, the photo she picked (in its frame), and the one already on the wall. */
  private flight: HomeFlight | null = null
  private flightT = 0
  private frame: TripFrame | null = null
  private wall: TripFrame | null = null
  private wallSrc: string | null = null
  /** Who holds the frame (Kaylee, then Agong), or where it's flying (onto the wall). */
  private held: 'kaylee' | 'agong' | 'flying' | 'wall' | null = null
  private frameFly: { from: Vector3; yaw: number; t: number } | null = null
  /** Her frame on the wall swinging on its nail after a tap (0 → 1, still). */
  private frameWob = 1
  /** Agong walking in with the photo, a point at a time. */
  private stroll: { path: Vector3[]; i: number; done: () => void } | null = null
  /** Agong's arms up, holding the photo high (0 down .. 1 up). */
  private holdUp = 0
  private holdGoal = 0
  /** The gather: the big cousins glow once everyone is in, and each tap puts one phone down (they do it themselves if
   *  she waits). */
  private phonesReady = false
  private readonly phonesDown = new Set<string>()
  private phoneTimer: ReturnType<typeof setTimeout> | undefined

  constructor(
    private start: HouseLeg,
    initialPacked: string[],
    private events: TripHouseEvents,
    /** Things in the suitcase before she has to sit on it three times to close it. */
    private fits = 5,
    /** A trip she has done before: the goodbye is quicker (Agong already asked for his photo; the van comes at once). */
    private quick = false,
  ) {
    this.phase = start
    this.order = [...initialPacked]
  }

  // ---------------------------------------------------------------- set up

  attach(house: House) {
    this.house = house
    const bag = house.kit.bag
    this.hopper = new Hopper(house.scene)
    house.scene.add(this.root)
    // The house's own little suitcase makes way for the trip's big one.
    const own = house.kit.pokes.get('suitcase')
    if (own) own.visible = false
    this.suitcase = buildSuitcase(bag)
    this.suitcase.root.userData.pick = 'trip:suitcase'
    this.root.add(this.suitcase.root)
    for (const it of ITEMS) {
      if (it.id === 'gan') continue
      const g = buildItem(it.id, bag)
      g.userData.pick = `trip:item:${it.id}`
      const [x, y, z] = ROOM.items[it.id] ?? [0, 0, -18.5]
      const home = new Vector3(x, U + y, z)
      g.position.copy(home)
      g.rotation.y = (it.id.length % 5) * 0.5 - 1
      this.root.add(g)
      this.things.set(it.id, { id: it.id, g, home, packed: false, tween: null, land: 1, glint: 0, dragged: false })
    }
    this.snackBag = buildItem('snacks', bag)
    this.snackBag.visible = false
    this.root.add(this.snackBag)
    this.van = buildVan(bag)
    this.van.root.userData.pick = 'trip:van'
    this.van.root.visible = false
    this.root.add(this.van.root)
    this.goTo(this.start)
  }

  get roots(): Object3D[] {
    return [this.suitcase.root, this.van.root, ...[...this.things.values()].map((t) => t.g), ...(this.frame ? [this.frame.root] : [])]
  }

  /** The photo already on the wall from her last boat trip (it hangs there until Agong hangs the new one). */
  setWall(src: string | null) {
    this.wallSrc = src
    this.wall?.set(src)
    if (this.wall) this.wall.root.visible = !!src
  }

  /** Sets up a leg at once (a section link, or behind the boarding pass). */
  goTo(leg: HouseLeg) {
    const h = this.house
    this.setPhase(leg)
    this.lastTouch = this.t
    this.follow = false
    if (leg === 'goodbye') return this.setUpGoodbye()
    if (leg === 'home') return this.setUpHome()
    // Her room: Mommy beside the suitcase spot, Gan asleep on the far side of the mattress.
    h.placeFamily('ji', ROOM.ji)
    h.placeFamily('gan', ROOM.gan)
    this.ganPacked = false
    this.van.root.visible = false
    const packed = new Set(this.order)
    for (const th of this.things.values()) {
      th.g.visible = true
      th.packed = packed.has(th.id)
      th.tween = null
      if (!th.packed) th.g.position.copy(th.home)
    }
    if (leg === 'invite') {
      // Kaylee by Mommy, who asks (the screen's card); her suitcase waits shut by the wall.
      h.teleport('upstairs', INVITE.x, INVITE.z, 0)
      h.kaylee.faceToward(ROOM.ji.x, ROOM.ji.z)
      this.placeSuitcase(ROOM.wall.x, ROOM.wall.z)
      this.lid.angle = this.lid.goal = 0
      setTimeout(() => this.phase === 'invite' && h.family.get('ji')?.react('wave'), 500)
    } else {
      h.teleport('upstairs', ROOM.kaylee.x, ROOM.kaylee.z, ROOM.kaylee.face)
      this.placeSuitcase(ROOM.suitcase.x, ROOM.suitcase.z)
      this.lid.angle = this.lid.goal = -1.9
      setTimeout(() => this.phase === 'pack' && this.events.say(L.trip.pack.start), 500)
    }
    // (Gan goes in once the suitcase is where it'll be.)
    if (packed.has('gan')) this.packGan(true)
    this.blockSuitcase()
    h.snapCamera()
  }

  private placeSuitcase(x: number, z: number) {
    this.suitcase.root.position.set(x, U, z)
    this.suitcase.root.rotation.set(0, 0, 0)
    this.suitcase.root.visible = true
  }
  private blockSuitcase() {
    const p = this.suitcase.root.position
    const { w, d } = this.suitcase
    this.house.blockUpstairs(this.phase === 'goodbye' ? [] : [[p.x - w / 2 - 0.05, p.x + w / 2 + 0.05, p.z - d / 2 - 0.05, p.z + d / 2 + 0.05]])
  }

  /** She said yes (or the screen chose "a new trip"): the suitcase hops out and opens, the camera drops to it. */
  startPack() {
    if (this.phase !== 'invite') return
    this.setPhase('opening')
    this.house.family.get('ji')?.react('hop')
    const s = this.suitcase.root
    const from = s.position.clone()
    const to = new Vector3(ROOM.suitcase.x, U, ROOM.suitcase.z)
    this.lid.goal = -1.9
    sfx.boing()
    this.tweenObject(s, from, to, 0.55, 0.45, () => {
      sfx.thump()
      this.squash = 0
      this.blockSuitcase()
    })
    this.house.walkTo([ROOM.kaylee.x, ROOM.kaylee.z], () => this.house.kaylee.face(ROOM.kaylee.face * deg), false)
    setTimeout(() => {
      if (this.phase !== 'opening') return
      this.setPhase('pack')
      this.lastTouch = this.t
      this.events.section('pack')
      this.events.say(L.trip.pack.start)
    }, 900)
  }

  // ---------------------------------------------------------------- touch

  hides(id: string) {
    return id === 'suitcase'
  }

  private setPhase(p: Phase) {
    this.phase = p
    this.phaseT = 0
    this.events.phase?.(p)
  }

  /** The screen's ✅ button: the same as tapping the suitcase. */
  closeTap() {
    this.lastTouch = this.t
    if (this.phase === 'pack' || this.phase === 'sitting') this.sit()
  }

  setHintElement(el: () => HTMLElement | null) {
    this.hintEl = el
  }

  pointerDown(x: number, y: number, id?: string) {
    this.lastTouch = this.t
    if (this.phase === 'pack' && id?.startsWith('trip:item:')) {
      this.drag = { id: id.slice(10), x, y, on: false }
      return true
    }
    return false
  }
  pointerMove(x: number, y: number) {
    const d = this.drag
    if (!d) return false
    const th = this.things.get(d.id)
    if (!th) return true
    if (!d.on && Math.hypot(x - d.x, y - d.y) > 12) {
      d.on = true
      th.dragged = true
      th.tween = null
      sfx.pop()
    }
    if (d.on) {
      const p = this.house.pointAt(x, y, U + 0.45)
      if (p) th.g.position.set(clamp(p.x, DIM.left + 0.2, DIM.right - 0.2), U + 0.45, clamp(p.z, DIM.back + 0.25, -17.0))
    }
    return true
  }
  pointerUp() {
    const d = this.drag
    this.drag = null
    if (!d?.on) return false
    const th = this.things.get(d.id)
    if (!th) return true
    th.dragged = false
    this.counts.drags++
    const s = this.suitcase.root.position
    const near = Math.hypot(th.g.position.x - s.x, th.g.position.z - s.z) < 0.85
    if (near && !th.packed) this.pack(th)
    else if (!near && th.packed) this.unpack(th)
    else this.settle(th)
    return true
  }

  tap(_x: number, _y: number, id?: string) {
    const ph = this.phase
    if (ph === 'invite') {
      // Mommy's card is the thing to answer, so Kaylee stays put; but whatever she taps still answers: Mommy waves,
      // Kaylee hops, someone else hops, a thing wobbles with its sound.
      if (id === 'family:ji') this.house.family.get('ji')?.react('wave')
      else if (id === 'kaylee' || id === 'family:kaylee') this.house.kaylee.react('hop')
      else if (id?.startsWith('family:')) this.house.family.get(id.slice(7))?.react('hop')
      else if (id && !id.startsWith('trip:')) this.house.pokeThing(id)
      else sfx.boop()
      return true
    }
    if (ph === 'leaving') {
      // A tap while she walks down: skip to the goodbye.
      this.leave()
      return true
    }
    if (ph === 'pack' || ph === 'sitting') {
      if (id?.startsWith('trip:item:') && ph === 'pack') {
        const th = this.things.get(id.slice(10))
        if (th) th.packed ? this.unpack(th) : this.pack(th)
        return true
      }
      if (id === 'family:gan' && ph === 'pack') {
        if (this.ganPacked) this.unpackGan()
        else this.packGan(false)
        return true
      }
      if (id === 'trip:suitcase' || ((id === 'kaylee' || id === 'family:kaylee') && (ph === 'sitting' || this.count >= 3))) {
        this.sit()
        return true
      }
      if (id === 'family:ji' && this.order.includes('pillow')) this.mommyYawns()
      return ph === 'sitting'
    }
    if (ph === 'goodbye') {
      this.carWait = 0
      if (id === 'trip:van' && this.carT >= 1) {
        this.board()
        return true
      }
      if (id === 'trip:suitcase') {
        this.squash = 0
        sfx.boing()
        return true
      }
      if (id === 'family:sri') {
        // Aunty Sri, at the wheel: beep beep! (and in they get)
        sfx.beep()
        this.house.family.get('sri')?.react('hop')
        if (this.carT >= 1) this.board()
        else this.events.say(L.trip.goodbye.horn)
        return true
      }
      if (id?.startsWith('family:')) {
        const who = id.slice(7)
        this.counts.hugs++
        if (who === 'jum' && !this.told.has('jum')) this.snacks(true)
        else if (who === 'agong') this.events.say(L.trip.goodbye.agong)
        else if (who === 'gan' || who === 'ken' || who === 'bb') {
          // A wave without looking up from the phone (and "Bye...", once each).
          this.house.family.get(who)?.phoneWave()
          if (!this.told.has(who)) {
            this.told.add(who)
            this.events.say(L.trip.goodbye[who])
          }
          return true
        }
      }
      return false
    }
    if (ph === 'flight') {
      // A tap skips the picture.
      this.landHome()
      return true
    }
    if (ph === 'give' && (id === 'family:agong' || id === 'trip:frame')) {
      this.give()
      return true
    }
    if (ph === 'gather' && id && this.glows(id)) {
      this.phoneDown(id.slice(7))
      this.autoPhones(4500)
      return true
    }
    if (HOME_PHASES.includes(ph)) {
      // Her photo on the wall swings on its nail, and Agong hops, proud.
      if (id === 'trip:frame' && this.held === 'wall') {
        this.frameWob = 0
        sounds.sparkle()
        this.house.family.get('agong')?.react('hop')
        return true
      }
      // Coming home everyone is busy with the photo: a tap gets a happy hop where they stand.
      if (id === 'kaylee' || id === 'family:kaylee') this.house.kaylee.react('hop')
      else if (id?.startsWith('family:')) {
        const m = this.house.family.get(id.slice(7))
        m?.react('hop')
        if (m?.onPhone) sfx.phone()
        else sfx.boing()
      } else if (id && !id.startsWith('trip:')) this.house.pokeThing(id)
      else sfx.boop()
      return true
    }
    // Boarding, gone: the car is leaving.
    return ph === 'boarding' || ph === 'gone'
  }

  /** Agong glows while she has the photo to give him; then the cousins, still on their phones, at the gather. */
  glows(id: string) {
    if (this.phase === 'gather') return this.phonesReady && COUSINS.some((c) => id === `family:${c}` && !this.phonesDown.has(c))
    return this.phase === 'give' && id === 'family:agong'
  }

  // ---------------------------------------------------------------- packing

  private get count() {
    return this.order.length
  }

  private pack(th: Thing) {
    th.packed = true
    this.order = [...this.order.filter((x) => x !== th.id), th.id]
    this.counts.packs++
    this.house.kaylee.lookAt(th.g.position.x, th.g.position.y, th.g.position.z)
    this.house.kaylee.react('hop')
    const i = this.order.indexOf(th.id)
    this.flyTo(th, this.slotWorld(i, this.count), () => {
      this.lid.flap = 0
      this.squash = 0
      sfx.thump()
      if (th.id === 'fan') sfx.whir()
      if (th.id === 'pillow') this.mommyYawns()
    })
    this.changed()
  }

  private unpack(th: Thing) {
    th.packed = false
    this.order = this.order.filter((x) => x !== th.id)
    this.counts.unpacks++
    this.lid.flap = 0
    this.flyTo(th, th.home, () => sfx.thump())
    this.changed()
  }

  /** Back where it was dropped from (a drag that didn't change anything). */
  private settle(th: Thing) {
    const to = th.packed ? this.slotWorld(this.order.indexOf(th.id), this.count) : th.home
    this.flyTo(th, to, () => sfx.thump(), 0.3)
  }

  private flyTo(th: Thing, to: Vector3, done?: () => void, arc = 0.75) {
    sfx.boing()
    th.tween = { from: th.g.position.clone(), to: to.clone(), t: 0, dur: 0.5, arc, done }
  }

  private slotWorld(i: number, n: number) {
    const [x, y, z] = this.suitcase.slot(i, n)
    return this.suitcase.body.localToWorld(new Vector3(x, y, z))
  }

  private changed() {
    this.events.packed([...this.order])
    // Mommy's one hint, once a couple of things are in; at three, how to close it.
    if (!this.hinted && this.count >= 2) this.hint()

  }

  private hint() {
    this.hinted = true
    setTimeout(() => {
      if (this.phase !== 'pack') return
      this.events.say(L.trip.pack.hint)
      for (const it of ITEMS) if (it.sun) {
        const th = this.things.get(it.id)
        if (th && !th.packed) th.glint = 2.6
      }
    }, 700)
  }

  /** Gan, asleep on the mattress, goes in too (he doesn't wake up). */
  private packGan(instant: boolean) {
    const gan = this.house.family.get('gan')
    if (!gan) return
    this.ganPacked = true
    if (!this.order.includes('gan')) this.order = [...this.order, 'gan']
    const s = this.suitcase.root.position
    const to = new Vector3(s.x, U + 0.36, s.z)
    const done = () => {
      this.house.placeFamily('gan', { floor: 1, x: s.x, z: s.z, face: 90, pose: 'lie' })
      gan.place(to.x, to.y, to.z, 90, 'lie')
      this.squash = 0
      this.lid.flap = 0
    }
    if (instant) return done()
    this.counts.packs++
    sfx.boing()
    this.ganTween = { from: gan.root.position.clone(), to, t: 0, done: () => {
      done()
      sfx.thump()
      this.events.say(L.trip.pack.gan)
    } }
    this.changed()
  }
  private unpackGan() {
    const gan = this.house.family.get('gan')
    if (!gan) return
    this.ganPacked = false
    this.order = this.order.filter((x) => x !== 'gan')
    this.counts.unpacks++
    sfx.boing()
    this.ganTween = { from: gan.root.position.clone(), to: new Vector3(ROOM.gan.x, U + 0.2, ROOM.gan.z), t: 0, done: () => {
      this.house.placeFamily('gan', ROOM.gan)
      sfx.thump()
    } }
    this.changed()
  }

  /** Tap the suitcase: too empty, it gulps for more; otherwise Kaylee hops on top and sits on it to close it. */
  private sit() {
    if (this.phase === 'pack' && this.count < 3) {
      this.lid.flap = 0
      sfx.boing()
      if (this.t - this.lastHungry > 4) {
        this.lastHungry = this.t
        this.events.say(L.trip.pack.hungry)
      }
      return
    }
    const k = this.house.kaylee
    const s = this.suitcase.root.position
    const top = new Vector3(s.x, U + this.suitcase.h * (1 + 0.05 * Math.max(0, this.count - 3)) + 0.12, s.z)
    if (this.phase === 'pack') {
      this.setPhase('sitting')
      this.hopsDone = 0
      this.hopsNeeded = this.count > this.fits ? 3 : 1
      this.lid.goal = -0.55
      if (this.count > this.fits) this.events.say(L.trip.pack.full)
      // She walks up beside it, then hops on top.
      this.house.walkTo([s.x + 0.75, s.z + 0.2], () => {
        k.standPoint = new Vector3(s.x + 0.75, U, s.z + 0.2)
        k.hopTo(top, 0.4, 0.4, () => {
          k.setPose('sit')
          k.face(0)
          this.squashHop()
        })
      }, false)
      return
    }
    if (k.walking || k.pose !== 'sit') return
    k.hopTo(top, 0.36, 0.28, () => {
      k.setPose('sit')
      this.squashHop()
    })
  }

  private squashHop() {
    this.hopsDone++
    this.squash = 0
    sfx.boingAt(this.hopsDone)
    // The fan whirs inside and blows the lid open again, once: one more hop.
    if (this.order.includes('fan') && !this.fanBlew && this.hopsDone >= this.hopsNeeded) {
      this.fanBlew = true
      this.hopsNeeded++
      this.lid.goal = -0.7
      this.lid.flap = 0
      sfx.whir()
      this.events.say(L.trip.pack.fan)
      return
    }
    const left = this.hopsNeeded - this.hopsDone
    this.lid.goal = left <= 0 ? 0 : -0.12 - 0.15 * left
    if (left <= 0) this.close()
  }

  /** Click! Mommy tucks in what a sunny trip needs, then it's shut, and Kaylee puts on her hat, sunglasses and
   *  floaties (or Mommy pops her spare sun hat on her head). */
  private close() {
    const before = [...this.order]
    const after = mommyTucksIn(before.filter((x) => x !== 'gan'))
    const added = after.filter((x) => !before.includes(x))
    const ji = this.house.family.get('ji')
    for (const id of added) {
      const th = this.things.get(id)
      if (!th) continue
      th.packed = true
      this.order.push(id)
      if (ji) th.g.position.copy(ji.root.position).setY(U + 1.0)
      this.flyTo(th, this.slotWorld(this.order.length - 1, this.order.length), undefined, 0.4)
    }
    const spare = !this.order.includes('sunhat')
    if (spare) this.events.say(L.trip.pack.hat)
    else if (added.includes('sunscreen')) this.events.say(L.trip.pack.sunscreen)
    if (added.length || spare) ji?.react('wiggle')
    this.events.packed([...this.order])
    this.setPhase('closed')
    setTimeout(() => {
      sfx.latch()
      this.lid.goal = 0
      for (const th of this.things.values()) if (th.packed) th.g.visible = false
      if (this.ganPacked) this.house.placeFamily('gan', 'hidden')
      this.house.kaylee.react('wave')
    }, added.length ? 650 : 150)
    // Her things on: the hat drops onto her head, the sunglasses slide down, the floaties pop on.
    setTimeout(() => {
      if (this.phase !== 'closed') return
      this.house.kaylee.putOn(wearing(this.order))
      this.house.kaylee.glassesUp(false)
      sfx.pop()
      sfx.giggle()
    }, added.length ? 1000 : 500)
  }

  /** Off the suitcase and down the stairs, the suitcase bumping behind her. */
  private walkDown() {
    const k = this.house.kaylee
    this.setPhase('leaving')
    this.follow = true
    this.house.blockUpstairs([])
    k.setPose('stand')
    const s = this.suitcase.root.position
    k.hopTo(new Vector3(s.x + 0.7, U, s.z + 0.3), 0.35, 0.3, () => {
      // Bonk, bonk, bonk: the suitcase on every stair.
      this.house.climb(false, () => this.leave(), (i) => {
        sfx.thump()
        if (i % 2 === 0) sfx.boop()
        this.bump = 0
      })
    })
  }

  private leave() {
    if (this.phase !== 'leaving') return
    this.setPhase('gone')
    this.events.done('goodbye')
  }

  // ---------------------------------------------------------------- the goodbye

  private setUpGoodbye() {
    const h = this.house
    this.setPhase('goodbye')
    this.carT = -1
    this.carX = -18
    this.carWait = 0
    this.carTotal = 0
    for (const th of this.things.values()) th.g.visible = false
    h.teleport('street', STREET.kaylee.x, STREET.kaylee.z, STREET.kaylee.face)
    h.kaylee.wear(wearing(this.order))
    h.kaylee.glassesUp(false)
    this.snackBag.visible = false
    this.snackFly = null
    h.placeFamily('ji', STREET.ji)
    h.placeFamily('nick', STREET.nick)
    for (const [id, x] of STREET.row) h.placeFamily(id, id === 'gan' && this.order.includes('gan') ? 'hidden' : { floor: 0, x, z: STREET.rowZ, face: 0, pose: 'stand' })
    this.placeSuitcase(STREET.suitcase.x, STREET.suitcase.z)
    this.suitcase.root.position.y = 0
    this.lid.angle = this.lid.goal = 0
    const van = this.van
    van.root.visible = true
    van.root.position.set(this.carX, 0, STREET.carZ)
    van.root.rotation.set(0, Math.PI / 2, 0)
    this.door.open = this.door.goal = 0
    // Aunty Sri at the wheel (on the right, the side the camera sees).
    const sri = h.family.get('sri')
    if (sri) {
      // She counts as out on the street (so she shows and can be tapped), but sits in the van.
      h.placeFamily('sri', { floor: 0, x: this.carX, z: STREET.carZ, face: 90, pose: 'sit' })
      van.seats.sri.add(sri.root)
      put(sri, 0, 0, 0, 'sit', 0)
    }
    h.snapCamera()
    if (!this.quick) setTimeout(() => this.phase === 'goodbye' && this.events.say(L.trip.goodbye.agong), 700)
  }

  /** Jum gives her a little bag of snacks for the trip: it hops from Jum's hands into Kaylee's. */
  private snacks(say: boolean) {
    if (this.told.has('jum')) return
    this.told.add('jum')
    if (say) this.events.say(L.trip.goodbye.jum)
    const jum = this.house.family.get('jum')
    jum?.react('hop')
    if (!jum) return
    this.snackBag.visible = true
    this.snackBag.scale.setScalar(0.8)
    this.snackFly = { from: jum.root.position.clone().setY(0.75), t: 0 }
    sfx.boing()
  }

  /** The side door slides open, Daddy loads the suitcase, everyone hops in, the door shuts and off they go. */
  private board() {
    if (this.phase !== 'goodbye') return
    this.setPhase('boarding')
    const h = this.house
    const van = this.van
    this.door.goal = 1
    sfx.whoosh(0.5)
    const s = this.suitcase.root
    const trunk = van.body.localToWorld(new Vector3(...van.trunk))
    this.tweenObject(s, s.position.clone(), trunk, 0.45, 0.8, () => {
      s.visible = false
      sfx.thump()
    })
    const riders: [string, Group][] = [['nick', van.seats.nick], ['ji', van.seats.ji], ['kaylee', van.seats.kaylee]]
    riders.forEach(([id, seat], i) => {
      const c = id === 'kaylee' ? h.kaylee : h.family.get(id)
      if (!c) return
      this.hopper.hop(c, seat, new Vector3(0, 0, 0), { pose: 'sit', face: 0, delay: 0.35 + i * 0.25, arc: 1.7, dur: 0.5, done: i === 2 ? () => this.driveOff() : undefined })
    })
    h.family.get('nick')?.react('wave')
    if (!['gan', 'ken', 'bb'].some((id) => this.told.has(id))) {
      this.told.add('ken')
      setTimeout(() => this.events.say(L.trip.goodbye.ken), 900)
    }
  }

  /** The door slides shut, a beep, and the van glides away (quietly: it's electric). Then the airport. */
  private driveOff() {
    this.door.goal = 0
    sfx.latch()
    setTimeout(() => {
      if (this.phase !== 'boarding') return
      sfx.beep()
      sfx.whir()
      this.setPhase('gone')
      for (const id of ['agong', 'jum', 'joy']) this.house.family.get(id)?.react('wave')
      setTimeout(() => this.events.done('airport'), 1500)
    }, 350)
  }

  // ---------------------------------------------------------------- coming home

  private setUpHome() {
    const h = this.house
    const bag = h.kit.bag
    for (const th of this.things.values()) th.g.visible = false
    this.snackBag.visible = false
    this.snackFly = null
    // The flight home, far under the street.
    if (!this.flight) {
      this.flight = buildHomeFlight(bag)
      this.root.add(this.flight.root)
    }
    this.flight.root.visible = true
    this.flightT = 0
    this.flight.update(0)
    // The photo she'll pick (in her hands later), and the frame already on the wall from a trip before.
    if (!this.frame) {
      this.frame = buildTripFrame(bag)
      this.frame.root.userData.pick = 'trip:frame'
      this.frame.root.visible = false
      this.root.add(this.frame.root)
      this.wall = buildTripFrame(bag)
      hang(this.wall, 'boat-trip')
      this.root.add(this.wall.root)
      this.setWall(this.wallSrc)
    }
    // Everyone rides in the van, the family who live here wait inside the shop, and Aunty Sri is at the wheel.
    h.teleport('street', STREET.kaylee.x, STREET.kaylee.z, STREET.kaylee.face)
    h.kaylee.wear(wearing(this.order))
    h.kaylee.glassesUp(false)
    for (const [id, x] of STREET.row) h.placeFamily(id, { floor: 0, x: x * 0.8, z: HOME.insideZ, face: 0, pose: 'stand' })
    const van = this.van
    this.carT = -1
    this.carX = -18
    van.root.visible = true
    van.root.position.set(this.carX, 0, STREET.carZ)
    van.root.rotation.set(0, Math.PI / 2, 0)
    this.door.open = this.door.goal = 0
    const sri = h.family.get('sri')
    if (sri) {
      h.placeFamily('sri', { floor: 0, x: this.carX, z: STREET.carZ, face: 90, pose: 'sit' })
      van.seats.sri.add(sri.root)
      put(sri, 0, 0, 0, 'sit', 0)
    }
    const riders: [string, Group][] = [['nick', van.seats.nick], ['ji', van.seats.ji], ['kaylee', van.seats.kaylee]]
    for (const [id, seat] of riders) {
      const c = id === 'kaylee' ? h.kaylee : h.family.get(id)
      if (!c) continue
      if (id !== 'kaylee') h.placeFamily(id, { floor: 0, x: this.carX, z: STREET.carZ, face: 90, pose: 'sit' })
      seat.add(c.root)
      put(c, 0, 0, 0, 'sit', 0)
    }
    this.suitcase.root.visible = false
    this.lid.angle = this.lid.goal = 0
    this.setPhase('flight')
    h.snapCamera()
  }

  /** The flight home is over (or skipped): a white flash, and the van hums up to Agong's door. */
  private landHome() {
    if (this.phase !== 'flight') return
    this.events.flash?.()
    if (this.flight) this.flight.root.visible = false
    this.setPhase('arrive')
    this.carT = 0
    sfx.whir()
    this.house.snapCamera()
  }

  /** The van has stopped: the door slides open, everyone hops out, and the family come out of the shop. */
  private hopOut() {
    const h = this.house
    this.door.goal = 1
    sfx.whoosh(0.5)
    sfx.beep()
    this.events.say(L.home.sri)
    h.family.get('sri')?.react('wave')
    const out = (['kaylee', 'ji', 'nick'] as const).map((id) => [id, HOME.out[id]] as const)
    out.forEach(([id, at], i) => {
      const c = id === 'kaylee' ? h.kaylee : h.family.get(id)
      if (!c) return
      this.hopper.hop(c, h.scene, new Vector3(at.x, 0, at.z), { face: at.face, delay: 0.35 + i * 0.3, arc: 1.2, dur: 0.5, done: () => {
        if (id !== 'kaylee') h.placeFamily(id, { floor: 0, x: at.x, z: at.z, face: at.face, pose: 'stand' })
        if (i === 2) setTimeout(() => this.comeOut(), 200)
      } })
    })
    // The suitcase comes out after them.
    const s = this.suitcase.root
    s.visible = true
    const from = this.van.body.localToWorld(new Vector3(...this.van.trunk))
    s.position.copy(from)
    setTimeout(() => this.tweenObject(s, from, new Vector3(STREET.suitcase.x, 0, STREET.suitcase.z), 0.45, 0.8, () => sfx.thump()), 1300)
  }

  /** The family who live here hop out of the shop to meet them, and Agong asks for his photo. */
  private comeOut() {
    const h = this.house
    // Once the last of them has landed on the sidewalk (so Agong is there to tap), he asks for his photo.
    let out = STREET.row.length
    const landed = () => {
      if (--out > 0) return
      setTimeout(() => {
        if (this.phase !== 'arrive') return
        h.family.get('agong')?.react('hop')
        this.events.say(L.home.agong)
        this.setPhase('pick')
        this.lastTouch = this.t
      }, 400)
    }
    STREET.row.forEach(([id, x], i) => {
      const m = h.family.get(id)
      if (!m) return landed()
      this.hopper.hop(m, h.scene, new Vector3(x, 0, STREET.rowZ), { delay: i * 0.18, arc: 0.5, dur: 0.45, done: () => {
        h.placeFamily(id, { floor: 0, x, z: STREET.rowZ, face: 0, pose: 'stand' })
        if (!m.onPhone) m.react('wave')
        else m.phoneWave()
        landed()
      } })
    })
    this.door.goal = 0
  }

  /** She picked a photo (the screen's fan of her photos): it's in her hands, in a pink frame. */
  choose(src: string) {
    if (this.phase !== 'pick' || !this.frame) return
    this.frame.set(src)
    this.frame.root.visible = true
    this.held = 'kaylee'
    this.frameFly = { from: this.house.kaylee.root.position.clone().setY(1.6), yaw: 0, t: 0 }
    this.house.kaylee.react('hop')
    this.house.kaylee.faceToward(this.agongAt.x, this.agongAt.z)
    sounds.sparkle()
    this.setPhase('give')
    this.lastTouch = this.t
  }

  private get agongAt() {
    return this.house.family.get('agong')?.root.position ?? new Vector3()
  }

  /** She taps Agong: she walks up and gives him the photo, and he holds it up high. */
  private give() {
    if (this.phase !== 'give') return
    const h = this.house
    const agong = h.family.get('agong')
    if (!agong) return
    this.setPhase('hang')
    const a = this.agongAt.clone()
    let handed = false
    const hand = () => {
      if (handed) return
      handed = true
      h.kaylee.faceToward(a.x, a.z)
      h.kaylee.react('hop')
      this.held = 'agong'
      this.frameFly = { from: this.frame!.root.position.clone(), yaw: this.frame!.root.rotation.y, t: 0 }
      agong.react('hop')
      this.holdGoal = 1
      sfx.boing()
      this.events.say(L.home.thanks)
      for (const id of ['ji', 'nick', 'jum', 'joy', 'sri']) setTimeout(() => h.family.get(id)?.react('hop'), 300 + Math.random() * 500)
      // Then he walks in with it, and she follows him.
      setTimeout(() => this.walkIn(), 1900)
    }
    h.walkTo([a.x + 0.15, a.z + 0.85], hand, false)
    // If she can't get to him (no path), he takes it where she stands.
    setTimeout(hand, 3500)
  }

  /** Agong walks in to his wall with the photo held up; Kaylee follows; he hangs it by the old photos. */
  private walkIn() {
    const h = this.house
    const agong = h.family.get('agong')
    if (!agong) return
    const from = agong.root.position.clone()
    h.placeFamily('agong', { floor: 0, x: HOME.agong.x, z: HOME.agong.z, face: HOME.agong.face, pose: 'stand' })
    agong.place(from.x, 0, from.z, 0)
    this.stroll = {
      path: [new Vector3(0.1, 0, 0.6), new Vector3(-0.6, 0, -0.35), new Vector3(HOME.agong.x, 0, HOME.agong.z)],
      i: 0,
      done: () => this.hangIt(),
    }
    setTimeout(() => h.walkTo([HOME.kaylee.x, HOME.kaylee.z], () => {
      h.kaylee.face(-Math.PI / 2 + 0.25)
      const at = WALL_SLOTS['boat-trip']
      h.kaylee.lookAt(at[0], at[1], at[2])
    }, false), 500)
  }

  private hangIt() {
    const h = this.house
    const agong = h.family.get('agong')
    agong?.react('hop')
    this.held = 'flying'
    this.frameFly = { from: this.frame!.root.position.clone(), yaw: this.frame!.root.rotation.y, t: 0 }
    sfx.boing()
  }

  /** It's on the wall: everyone comes in to look, and the big cousins put their phones down. */
  private gather() {
    const h = this.house
    this.setPhase('gather')
    this.holdGoal = 0
    sounds.sparkle()
    // Aunty Sri has come in too: her van (parked out front) would fill the bottom of a tall screen's shot.
    this.van.root.visible = false
    const at = WALL_SLOTS['boat-trip']
    // The big cousins, still on their phones: once everyone is in they glow, and she gets them to look up (or they do
    // by themselves).
    this.phonesDown.clear()
    this.phonesReady = false
    let landed = 0
    const ready = () => {
      if (++landed < HOME.gather.length) return
      setTimeout(() => {
        if (this.phase !== 'gather') return
        this.phonesReady = true
        this.autoPhones(5000)
      }, 300)
    }
    HOME.gather.forEach(([id, x, z, face], i) => {
      const m = h.family.get(id)
      if (!m) return ready()
      // In from the right of the room, not too near the camera (Aunty Sri out of the driver's seat first).
      const door = new Vector3(1.3 + (i % 3) * 0.35, 0, -1.2)
      if (m.root.parent !== h.scene) h.scene.attach(m.root)
      h.placeFamily(id, { floor: 0, x, z, face, pose: 'stand' })
      m.place(door.x, 0, door.z, 180)
      this.hopper.hop(m, h.scene, new Vector3(x, 0, z), { face, delay: 0.2 + i * 0.22, arc: 0.45, dur: 0.45, done: () => {
        m.lookAt(at[0], at[1], at[2])
        ready()
      } })
    })
    // Agong and Kaylee turn round to the others, proud.
    setTimeout(() => {
      h.family.get('agong')?.place(HOME.agong.x, 0, HOME.agong.z, 40)
      h.placeFamily('agong', { floor: 0, x: HOME.agong.x, z: HOME.agong.z, face: 40, pose: 'stand' })
      h.kaylee.face((40 * Math.PI) / 180)
      h.kaylee.react('hop')
    }, 900)
  }

  /** Phones down for the first time: "Whoa! Cool!". After the last one, everyone cheers and it's done. */
  private phoneDown(id: string) {
    const h = this.house
    const m = h.family.get(id)
    if (!m || this.phonesDown.has(id) || this.phase !== 'gather') return
    this.phonesDown.add(id)
    m.putPhoneDown()
    sfx.pop()
    setTimeout(() => m.react('hop'), 450)
    this.events.say(L.home[id as (typeof COUSINS)[number]])
    if (this.phonesDown.size < COUSINS.length) return
    clearTimeout(this.phoneTimer)
    setTimeout(() => {
      if (this.phase !== 'gather') return
      for (const f of h.family.values()) if (f.root.visible) f.react('hop')
      h.kaylee.react('hop')
      sounds.sparkle()
      this.setPhase('home')
    }, 1600)
  }

  /** If she leaves them be, the next cousin looks up by themselves after a while. */
  private autoPhones(ms: number) {
    clearTimeout(this.phoneTimer)
    this.phoneTimer = setTimeout(() => {
      const next = COUSINS.find((c) => !this.phonesDown.has(c))
      if (!next || this.phase !== 'gather') return
      this.phoneDown(next)
      this.autoPhones(1300)
    }, ms)
  }

  private updateHome(dt: number) {
    const h = this.house
    if (this.phase === 'flight' && this.flight) {
      this.flightT += dt
      this.flight.update(this.flightT)
      if (this.flightT > FLIGHT_S) this.landHome()
    }
    if (this.phase === 'arrive' && this.carT >= 0 && this.carT < 1) {
      this.carT = Math.min(1, this.carT + dt / 2.0)
      this.carX = -18 + (STREET.carStop + 18) * (1 - (1 - this.carT) ** 3)
      if (this.carT >= 1) this.hopOut()
    }
    // Agong walks in, a little waddle with each step, the photo held up.
    const st = this.stroll
    const agong = h.family.get('agong')
    if (st && agong) {
      const to = st.path[st.i]
      const p = agong.root.position
      const d = Math.hypot(to.x - p.x, to.z - p.z)
      const step = Math.min(d, dt * 1.3)
      const yaw = Math.atan2(to.x - p.x, to.z - p.z)
      const x = p.x + (d > 0 ? ((to.x - p.x) / d) * step : 0)
      const z = p.z + (d > 0 ? ((to.z - p.z) / d) * step : 0)
      agong.place(x, Math.abs(Math.sin(this.t * 9)) * 0.04, z, (yaw * 180) / Math.PI)
      agong.root.rotation.z = Math.sin(this.t * 9) * 0.06
      if (d < 0.02) {
        st.i++
        if (st.i >= st.path.length) {
          this.stroll = null
          agong.root.rotation.z = 0
          agong.place(to.x, 0, to.z, HOME.agong.face)
          st.done()
        }
      }
    }
    // Agong's arms: up high holding the photo, or down.
    if (agong) {
      this.holdUp += (this.holdGoal - this.holdUp) * (1 - Math.exp(-dt * 8))
      if (this.holdUp > 0.01) {
        agong.rig.armL.rotation.set(-0.4 * this.holdUp, 0, -2.1 * this.holdUp)
        agong.rig.armR.rotation.set(-0.4 * this.holdUp, 0, 2.1 * this.holdUp)
      }
    }
    // The frame: in Kaylee's hands, in Agong's (over his head), or flying up onto the wall.
    const fr = this.frame
    if (fr && this.held) {
      const fly = this.frameFly
      if (fly) fly.t = Math.min(1, fly.t + dt / (this.held === 'flying' ? 0.8 : 0.5))
      const k = fly ? fly.t : 1
      if (this.held === 'kaylee') {
        // Held up in front of her, so everyone can see it.
        const hand = h.kaylee.rig.armR.localToWorld(tmp2.set(0.0, -0.12, 0.14))
        const ky = h.kaylee.root.rotation.y
        tmp.copy(hand).add(tmp2.set(Math.sin(ky) * 0.12, 0.2, Math.cos(ky) * 0.12))
        fr.root.scale.setScalar(0.55)
        fr.root.rotation.set(0, h.kaylee.root.rotation.y, 0)
      } else if (this.held === 'agong' && agong) {
        tmp.copy(agong.root.position).setY(agong.height * 1.12 + agong.root.position.y)
        tmp.addScaledVector(tmp2.set(Math.sin(agong.root.rotation.y), 0, Math.cos(agong.root.rotation.y)), 0.18)
        fr.root.scale.setScalar(0.62 + 0.1 * k)
        // Shown to everyone: toward the street while he holds it up, back toward Kaylee while he walks in.
        fr.root.rotation.set(0, agong.root.rotation.y + (this.stroll ? Math.PI : 0), 0)
      } else if (this.held === 'flying' || this.held === 'wall') {
        const at = WALL_SLOTS['boat-trip']
        tmp.set(at[0], at[1], at[2])
        fr.root.scale.setScalar(0.72 + 0.28 * k)
        const from = fly?.yaw ?? Math.PI / 2
        fr.root.rotation.set(0.07 * k, from + (Math.PI / 2 - from) * k, 0, 'YXZ')
      }
      if (fly && k < 1) {
        fr.root.position.lerpVectors(fly.from, tmp, k)
        fr.root.position.y += bell(k) * 0.5
      } else {
        fr.root.position.copy(tmp)
        if (fly) {
          this.frameFly = null
          if (this.held === 'flying') {
            this.held = 'wall'
            if (this.wall) this.wall.root.visible = false
            sfx.thump()
            this.gather()
          }
        }
      }
      // Swinging on its nail after a tap, from still: side to side, smaller each time (like the house's frames).
      this.frameWob = Math.min(1, this.frameWob + dt / 0.9)
      fr.swing.rotation.z = this.held === 'wall' ? Math.sin(this.frameWob * Math.PI * 6) * (1 - this.frameWob) ** 2 * 0.14 : 0
    }
  }

  // ---------------------------------------------------------------- Mommy's yawn, Jum's snacks

  /** The pillow makes Mommy sleepy: a big yawn and a stretch. */
  private mommyYawns() {
    this.yawn = 0
    this.events.say(L.trip.pack.pillow)
  }

  private updateToys(dt: number) {
    // Mommy's yawn: both arms up in a big stretch, her head back.
    if (this.yawn < 1) {
      this.yawn = Math.min(1, this.yawn + dt / 1.6)
      const ji = this.house.family.get('ji')
      if (ji) {
        const up = bell(this.yawn)
        ji.rig.armL.rotation.z = -2.4 * up
        ji.rig.armR.rotation.z = 2.4 * up
        ji.rig.head.rotation.x = -0.3 * up
      }
    }
    // Jum's snack bag hops into Kaylee's hand, and rides there.
    if (this.snackBag.visible) {
      const k = this.house.kaylee
      const hand = k.rig.armR.localToWorld(tmp2.set(0.05, -0.17, 0.06))
      const f = this.snackFly
      if (f) {
        f.t = Math.min(1, f.t + dt / 0.6)
        this.snackBag.position.lerpVectors(f.from, hand, f.t)
        this.snackBag.position.y += bell(f.t) * 0.6
        if (f.t >= 1) {
          this.snackFly = null
          sfx.thump()
          k.react('wiggle')
        }
      } else this.snackBag.position.copy(hand).setY(hand.y - 0.12)
      this.snackBag.rotation.y = k.root.rotation.y
    }
  }

  // ---------------------------------------------------------------- per frame

  update(dt: number, t: number) {
    this.t += dt
    this.phaseT += dt
    const s = this.suitcase
    this.hopper.update(dt)
    this.updateObjects(dt)
    this.updateToys(dt)
    // The lid eases to where it's going and flaps when something lands.
    this.lid.flap = Math.min(1, this.lid.flap + dt / 0.5)
    this.lid.angle += (this.lid.goal - this.lid.angle) * (1 - Math.exp(-dt * 10))
    s.lid.rotation.x = this.lid.angle - (this.lid.goal < -0.3 ? wobble(this.lid.flap, 3) * 0.3 : wobble(this.lid.flap, 3) * 0.12)
    // It bulges the fuller it gets, and squashes when something lands (or someone sits on it).
    this.squash = Math.min(1, this.squash + dt / 0.45)
    const n = Math.max(0, this.count - 3)
    const sq = 1 - wobble(this.squash, 2) * 0.12
    s.body.scale.set(1 + 0.03 * n, (1 + 0.05 * n) * sq, 1 + 0.03 * n)
    // The fan whirs inside it.
    const fan = this.things.get('fan')
    const blades = fan?.g.getObjectByName('blades')
    if (blades) blades.rotation.z -= dt * (fan!.packed ? 30 : 4)
    // Mommy's hint after a while with nothing packed.
    if (this.phase === 'pack' && !this.hinted && this.phaseT > 9) this.hint()
    // Once a few things are in and she's stopped packing for a while: how to close it (once).
    if (this.phase === 'pack' && this.count >= 3 && this.t - this.lastTouch > 6 && !this.told.has('close')) {
      this.told.add('close')
      this.events.say(L.trip.pack.close)
    }
    if (this.phase === 'closed' && this.phaseT > 2.0) this.walkDown()
    // Coming home: Sparkle helps once if she waits a while.
    if ((this.phase === 'pick' || this.phase === 'give') && this.t - this.lastTouch > 8 && !this.told.has(this.phase)) {
      this.told.add(this.phase)
      this.events.say(this.phase === 'pick' ? L.home.pick : L.home.give)
    }
    if (this.follow) this.followHer(dt, t)
    if (this.phase === 'goodbye' || this.phase === 'boarding' || this.phase === 'gone' || HOME_PHASES.includes(this.phase)) this.updateVan(dt)
    this.updateHome(dt)
    this.placeHint()
    if (this.ganTween) {
      const g = this.ganTween
      g.t += dt / 0.55
      const k = Math.min(1, g.t)
      tmp.lerpVectors(g.from, g.to, k)
      tmp.y += bell(k) * 0.7
      this.house.family.get('gan')?.place(tmp.x, tmp.y, tmp.z, 90, 'lie')
      if (k >= 1) {
        this.ganTween = null
        g.done()
      }
    }
  }

  private updateObjects(dt: number) {
    for (const th of this.things.values()) {
      if (th.dragged) continue
      const tw = th.tween
      if (tw) {
        tw.t += dt / tw.dur
        const k = Math.min(1, tw.t)
        th.g.position.lerpVectors(tw.from, tw.to, k)
        th.g.position.y += bell(k) * tw.arc
        th.g.rotation.x = Math.sin(k * Math.PI) * 0.6
        if (k >= 1) {
          th.tween = null
          th.land = 0
          th.g.rotation.x = 0
          tw.done?.()
        }
      } else if (th.packed && th.g.visible) th.g.position.copy(this.slotWorld(this.order.indexOf(th.id), this.count))
      else if (!th.packed) {
        // "Pick me!": while the suitcase still wants things, what's left hops now and then, one after another.
        const want = this.phase === 'pack' && this.count < 5
        const k = ((this.t + (ITEMS.findIndex((i) => i.id === th.id) % 6) * 0.45) % 2.7) / 0.45
        th.g.position.y = th.home.y + (want && k < 1 ? bell(k) * 0.14 : 0)
      }
      th.land = Math.min(1, th.land + dt / 0.4)
      th.glint = Math.max(0, th.glint - dt)
      const sq = 1 - wobble(th.land, 2) * 0.2 + (th.glint > 0 ? Math.abs(Math.sin(th.glint * 8)) * 0.18 : 0)
      // A little bigger on the floor than in the suitcase, so they're easy to tap.
      const small = th.packed ? 0.82 : 1.15
      th.g.scale.set(small / Math.sqrt(sq), small * sq, small / Math.sqrt(sq))
    }
    if (this.objTween) {
      const o = this.objTween
      o.t += dt / o.dur
      const k = Math.min(1, o.t)
      o.obj.position.lerpVectors(o.from, o.to, k)
      o.obj.position.y += bell(k) * o.arc
      if (k >= 1) {
        this.objTween = null
        o.done?.()
      }
    }
  }

  private objTween: { obj: Object3D; from: Vector3; to: Vector3; t: number; dur: number; arc: number; done?: () => void } | null = null
  private tweenObject(obj: Object3D, from: Vector3, to: Vector3, dur: number, arc: number, done?: () => void) {
    this.objTween = { obj, from, to, t: 0, dur, arc, done }
  }

  /** The suitcase trundles after her, bumping down each stair. */
  private followHer(dt: number, t: number) {
    const k = this.house.kaylee
    const s = this.suitcase.root
    const kp = k.root.getWorldPosition(tmp)
    const yaw = k.root.rotation.y
    tmp2.set(kp.x - Math.sin(yaw) * 0.55, kp.y, kp.z - Math.cos(yaw) * 0.55)
    s.position.lerp(tmp2, 1 - Math.exp(-dt * 7))
    this.bump = Math.min(1, this.bump + dt / 0.18)
    s.position.y = tmp2.y + bell(this.bump) * 0.12 + Math.abs(Math.sin(t * 9)) * 0.015
    s.rotation.y += (yaw - s.rotation.y) * (1 - Math.exp(-dt * 5))
  }

  private updateVan(dt: number) {
    const van = this.van
    if (this.phase === 'goodbye') {
      // It hums up quickly, beeps, and waits a moment; then everyone gets in anyway.
      // (After Agong's line, so Daddy's "Aunty Sri is here!" doesn't cut it off.)
      if (this.carT < 0 && this.phaseT > (this.quick ? 1.2 : 4.0)) {
        this.carT = 0
        sfx.whir()
      }
      if (this.carT >= 0 && this.carT < 1) {
        this.carT = Math.min(1, this.carT + dt / 2.0)
        const e = 1 - (1 - this.carT) ** 3
        this.carX = -18 + (STREET.carStop + 18) * e
        if (this.carT >= 1) {
          sfx.beep()
          this.events.say(L.trip.goodbye.van)
          this.house.family.get('sri')?.react('wave')
          this.snacks(false)
          for (const [i, id] of ['gan', 'ken', 'bb'].entries()) setTimeout(() => this.phase === 'goodbye' && this.house.family.get(id)?.phoneWave(), 300 + i * 350)
        }
      } else if (this.carT >= 1) {
        // Everyone gets in by themselves after a while with nothing tapped (at most 15 s, even if she keeps playing).
        this.carWait += dt
        this.carTotal += dt
        if (this.carWait > (this.quick ? 4 : 7) || this.carTotal > (this.quick ? 9 : 15)) this.board()
      }
    } else if (this.phase === 'gone') {
      this.carX += dt * Math.min(14, this.phaseT * 8)
    }
    van.root.position.x = this.carX
    const moving = this.phase === 'gone' || (this.carT >= 0 && this.carT < 1)
    van.body.position.y = moving ? Math.abs(Math.sin(this.carX * 2.2)) * 0.012 : 0
    for (const w of van.wheels) w.rotation.x = this.carX / 0.3
    this.door.open += (this.door.goal - this.door.open) * (1 - Math.exp(-dt * 9))
    // Out a little, then back along the van.
    const [dx, , dz] = van.doorAt
    van.door.position.set(dx + Math.min(1, this.door.open * 4) * 0.08, 0, dz - this.door.open * van.doorTravel)
  }

  /** The "do this" finger while she packs: at something to pack while it wants more, then at the suitcase. */
  private placeHint() {
    const el = this.hintEl()
    if (!el) return
    const idle = this.t - this.lastTouch
    let at: Vector3 | null = null
    if (this.phase === 'pack') {
      if (this.count < 3 && idle > 2.5) {
        // A sun thing once Mommy has hinted, else whatever is nearest the suitcase.
        const left = [...this.things.values()].filter((th) => !th.packed && !th.tween)
        const sun = this.hinted ? left.filter((th) => ITEMS.find((i) => i.id === th.id)?.sun) : []
        const s = this.suitcase.root.position
        const pickFrom = sun.length ? sun : left
        const th = pickFrom.sort((a, b) => a.home.distanceTo(s) - b.home.distanceTo(s))[0]
        if (th) at = tmp.copy(th.home).setY(th.home.y + 0.12)
      } else if (this.count >= 3 && idle > 8) at = this.suitcase.root.localToWorld(tmp.set(0, this.suitcase.h * 0.45, this.suitcase.d * 0.5))
    } else if (this.phase === 'sitting' && idle > 2.5 && this.house.kaylee.pose === 'sit') {
      at = this.suitcase.root.localToWorld(tmp.set(0, this.suitcase.h * 0.45, this.suitcase.d * 0.5))
    } else if (this.phase === 'give' && idle > 2.5 && !this.house.kaylee.walking) {
      at = this.agongAt.clone().setY(1.0)
    } else if (this.phase === 'goodbye' && this.carT >= 1 && this.carWait > 2.5) {
      at = this.van.root.getWorldPosition(tmp).add(tmp2.set(-0.7, 1.0, -0.4))
    }
    let shown = false
    if (at) {
      const c = at.project(this.house.rig.camera)
      const { w, h } = this.house.size
      if (c.z < 1 && Math.abs(c.x) < 1 && Math.abs(c.y) < 1) {
        shown = true
        el.style.transform = `translate3d(${(((c.x + 1) / 2) * w).toFixed(1)}px, ${(((1 - c.y) / 2) * h).toFixed(1)}px, 0)`
      }
    }
    const want = shown ? '' : 'none'
    if (el.style.display !== want) el.style.display = want
  }

  // ---------------------------------------------------------------- camera, anchors

  shot(): Shot | null {
    // The house sets its first shot before it hands itself over (attach).
    if (!this.house) return null
    const ph = this.phase
    const tall = this.house.rig.camera.aspect < 0.9
    if (ph === 'invite') {
      // Kaylee and Mommy up top, the card with the two buttons below them (on a short phone screen the card is most of
      // it, so the camera looks lower and they sit higher).
      const short = this.house.size.h < 500
      return { center: new Vector3(0.65, U + (short ? -0.05 : 0.35), -19.7), half: tall ? new Vector3(1.3, 1.6, 0.8) : new Vector3(1.6, short ? 1.65 : 1.25, 0.8), yaw: 14, pitch: 14, minDist: 2.5 }
    }
    if (ph === 'opening' || ph === 'pack' || ph === 'sitting' || ph === 'closed') {
      return { center: new Vector3(tall ? -0.45 : -0.2, U + 0.35, tall ? -19.05 : -18.95), half: tall ? new Vector3(2.0, 0.55, 1.35) : new Vector3(2.45, 0.55, 1.4), yaw: tall ? 6 : 16, pitch: tall ? 50 : 46, minDist: 3 }
    }
    if (ph === 'flight' && this.flight) return this.flight.shot(tall)
    if (ph === 'arrive' || ph === 'pick' || ph === 'give' || (ph === 'hang' && this.held === 'agong' && !this.stroll)) {
      // The sidewalk from a little above: the van pulling up, the family coming out; while she picks, everyone a bit
      // higher on the screen (her photos fan out below them).
      const pick = ph === 'pick'
      if (tall) return { center: new Vector3(pick ? 0.6 : 1.6, pick ? 0.6 : 1.4, 2.0), half: new Vector3(3.4, 1.3, 2.0), yaw: 6, pitch: 26, minDist: 5 }
      return { center: new Vector3(pick ? 0.6 : 2.0, pick ? 0.3 : 1.2, 2.2), half: new Vector3(pick ? 4.2 : 5.6, 1.3, 2.0), yaw: 6, pitch: 26, minDist: 5 }
    }
    if (ph === 'hang' || ph === 'gather' || ph === 'home') {
      // Inside: the left wall with Agong's old photos and her new one, and everyone gathered round.
      const all = ph !== 'hang'
      if (tall) return { center: new Vector3(all ? -0.4 : -1.2, 1.5, -1.8), half: new Vector3(all ? 3.2 : 1.9, 1.3, 1.6), yaw: 38, pitch: 18, minDist: 3, maxDist: 17 }
      return { center: new Vector3(all ? -0.9 : -1.2, 1.35, -1.5), half: new Vector3(all ? 2.7 : 2.4, 1.25, 1.7), yaw: 38, pitch: 18, minDist: 3, maxDist: 12 }
    }
    if (ph === 'goodbye' || ph === 'boarding' || ph === 'gone') {
      // A little from above: the family on the sidewalk, and once it's here the van parked beside them (its door at
      // their end, so they can all hop in).
      const van = this.carT >= 0.6 || ph !== 'goodbye'
      if (tall) return { center: new Vector3(van ? 3.0 : 1.0, 1.6, 2.6), half: new Vector3(3.4, 1.3, 2.3), yaw: 6, pitch: 30, minDist: 5 }
      return { center: new Vector3(van ? 2.0 : 0.9, 1.2, 2.4), half: new Vector3(van ? 5.6 : 4.9, 1.2, 2.3), yaw: 6, pitch: 30, minDist: 5 }
    }
    return null
  }

  anchor(id: string) {
    const ph = this.phase
    if (id === 'trip:suitcase') {
      // Its front, below the heap of things in it (each of those is its own target: tap one and it hops out).
      const on = ph === 'pack' || ph === 'sitting' || ph === 'goodbye'
      const at = this.suitcase.root.localToWorld(new Vector3(0, this.suitcase.h * 0.45, this.suitcase.d * 0.5))
      return on ? { at, r: 0.42, glow: (ph === 'pack' && this.count >= 3 && this.t - this.lastTouch > 6) || ph === 'sitting' } : null
    }
    if (id === 'trip:van') {
      if (ph !== 'goodbye' || this.carT < 1) return null
      // On its sliding door (the end nearer the family).
      return { at: this.van.root.getWorldPosition(new Vector3()).add(new Vector3(-0.7, 1.0, -0.4)), r: 1.3, glow: this.carWait > 2.5 }
    }
    if (id.startsWith('trip:item:') && ph === 'pack') {
      const th = this.things.get(id.slice(10))
      if (!th || !th.g.visible) return null
      return { at: th.g.position.clone().setY(th.g.position.y + 0.12), r: th.packed ? 0.15 : 0.3, glow: th.glint > 0 }
    }
    return null
  }

  get busy() {
    return this.phase !== 'invite' && this.phase !== 'pack' && this.phase !== 'goodbye'
  }

  qa() {
    return {
      leg: 'house',
      trip: this.phase,
      packed: [...this.order],
      closed: this.phase === 'closed' || this.phase === 'leaving' || this.phase === 'gone',
      hops: this.hopsDone,
      hopsNeeded: this.hopsNeeded,
      vanHere: this.carT >= 1,
      held: this.held,
      wearing: this.house.kaylee.wearing,
      snacks: this.snackBag.visible,
      ...this.counts,
    }
  }
}

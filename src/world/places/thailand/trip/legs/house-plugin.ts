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
//   things it's too full and takes three hops. Mommy tucks in sunscreen (and her spare sun hat) whatever she packed.
//   Then Kaylee walks down the stairs with the suitcase bumping behind her.
// - goodbye: on the sidewalk by the open shutter the family who live here wave her off (tap anyone for a hug; Jum
//   gives her snacks; the big cousins say "Bye..." without looking up). Aunty Sri's white electric van hums up quickly;
//   tap it (or wait a moment), the side door slides open, everyone hops in, and it glides off to the airport.
import { Group, Vector3, type Object3D } from 'three'
import { bell, clamp, wobble } from '../../../../../sdk'
import type { AnchorInfo } from '../../engine/Anchors'
import type { Shot } from '../../engine/camera'
import { DIM } from '../../activities/hub/layout'
import type { House, HousePlugin } from '../../activities/hub/house'
import { sfx } from '../../sfx'
import { ITEMS, mommyTucksIn } from '../packing'
import { buildItem, buildSuitcase, type Suitcase } from '../props'
import { TALK, type Said } from '../talk'
import { buildVan, type Van } from '../vehicles/van'
import { Hopper, put } from './stage'

export type HouseLeg = 'invite' | 'pack' | 'goodbye'

export interface TripHouseEvents {
  say(s: Said): void
  section(id: HouseLeg): void
  /** Where the trip is in the house (the screen shows the packing helpers while she packs). */
  phase?(p: Phase): void
  done(next: string): void
  packed(ids: string[]): void
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
  wall: { x: -0.9, z: -20.45 },
  suitcase: { x: -0.5, z: -19.45 },
  kaylee: { x: 0.2, z: -19.3, face: -95 },
  ji: { floor: 1 as const, x: 1.55, z: -20.1, face: -25, pose: 'stand' as const },
  gan: { floor: 1 as const, x: -2.65, z: -19.3, face: 0, pose: 'lie' as const },
  items: {
    sunhat: [-1.05, 0, -18.3],
    sunglasses: [-0.45, 0, -18.0],
    sunscreen: [0.1, 0, -18.3],
    floaties: [0.72, 0, -18.05],
    swimsuit: [1.2, 0, -18.4],
    duck: [0.75, 0, -18.95],
    camera: [0.85, 0, -19.75],
    bucket: [1.45, 0, -19.2],
    pillow: [-2.25, 0.22, -19.75],
    teddy: [-1.32, 0, -19.0],
    fan: [-1.22, 0, -20.3],
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
  // Past Daddy, so the van doesn't hide anyone on the sidewalk.
  carStop: 3.4,
}

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

export type Phase = 'invite' | 'opening' | 'pack' | 'sitting' | 'closed' | 'leaving' | 'goodbye' | 'boarding' | 'gone'

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
  private told = new Set<string>()
  private counts = { packs: 0, unpacks: 0, drags: 0, hugs: 0 }

  constructor(
    private start: HouseLeg,
    initialPacked: string[],
    private events: TripHouseEvents,
    /** Things in the suitcase before she has to sit on it three times to close it. */
    private fits = 5,
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
    this.van = buildVan(bag)
    this.van.root.userData.pick = 'trip:van'
    this.van.root.visible = false
    this.root.add(this.van.root)
    this.goTo(this.start)
  }

  get roots(): Object3D[] {
    return [this.suitcase.root, this.van.root, ...[...this.things.values()].map((t) => t.g)]
  }

  /** Sets up a leg at once (a section link, or behind the boarding pass). */
  goTo(leg: HouseLeg) {
    const h = this.house
    this.setPhase(leg)
    this.lastTouch = this.t
    this.follow = false
    if (leg === 'goodbye') return this.setUpGoodbye()
    // Her room: Mommy beside the suitcase spot, Gan asleep at the near end of the mattress.
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
    if (packed.has('gan')) this.packGan(true)
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
      setTimeout(() => this.phase === 'pack' && this.events.say(TALK.pack.start), 500)
    }
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
      this.events.say(TALK.pack.start)
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
      // Mommy's card is the thing to answer: a tap on her gets a wave, on Kaylee a hop, and she stays put.
      if (id === 'family:ji') this.house.family.get('ji')?.react('wave')
      else if (id === 'kaylee' || id === 'family:kaylee') this.house.kaylee.react('hop')
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
      if (id === 'family:ji' && this.order.includes('pillow')) {
        this.house.family.get('ji')?.react('wiggle')
        this.events.say(TALK.pack.pillow)
      }
      return ph === 'sitting'
    }
    if (ph === 'goodbye') {
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
        else this.events.say(TALK.goodbye.horn)
        return true
      }
      if (id?.startsWith('family:')) {
        const who = id.slice(7)
        this.counts.hugs++
        if (who === 'jum' && !this.told.has('jum')) this.snacks()
        else if (who === 'agong') this.events.say(TALK.goodbye.agong)
        else if ((who === 'gan' || who === 'ken' || who === 'bb') && !this.told.has(who)) {
          this.told.add(who)
          this.events.say({ ...TALK.goodbye.cousins, who })
        }
      }
      return false
    }
    // Boarding, gone: the car is leaving.
    return ph === 'boarding' || ph === 'gone'
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
      if (th.id === 'pillow') {
        this.house.family.get('ji')?.react('wiggle')
        this.events.say(TALK.pack.pillow)
      }
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
    if (this.count >= 3 && !this.told.has('close')) {
      this.told.add('close')
      setTimeout(() => this.phase === 'pack' && this.events.say(TALK.pack.close), 3200)
    }
  }

  private hint() {
    this.hinted = true
    setTimeout(() => {
      if (this.phase !== 'pack') return
      this.events.say(TALK.pack.hint)
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
      this.events.say(TALK.pack.gan)
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
        this.events.say(TALK.pack.hungry)
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
      if (this.count > this.fits) this.events.say(TALK.pack.full)
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
      this.events.say(TALK.pack.fan)
      return
    }
    const left = this.hopsNeeded - this.hopsDone
    this.lid.goal = left <= 0 ? 0 : -0.12 - 0.15 * left
    if (left <= 0) this.close()
  }

  /** Click! Mommy tucks in what a sunny trip needs, then it's shut. */
  private close() {
    const before = [...this.order]
    const after = mommyTucksIn(before.filter((x) => x !== 'gan'))
    const added = after.filter((x) => !before.includes(x))
    for (const id of added) {
      const th = this.things.get(id)
      if (!th) continue
      th.packed = true
      this.order.push(id)
      const ji = this.house.family.get('ji')
      if (ji) th.g.position.copy(ji.root.position).setY(U + 1.0)
      this.flyTo(th, this.slotWorld(this.order.length - 1, this.order.length), undefined, 0.4)
    }
    if (added.includes('sunscreen')) this.events.say(TALK.pack.sunscreen)
    else if (added.includes('sunhat')) this.events.say(TALK.pack.hat)
    if (added.length) this.house.family.get('ji')?.react('wiggle')
    this.events.packed([...this.order])
    this.setPhase('closed')
    setTimeout(() => {
      sfx.latch()
      this.lid.goal = 0
      for (const th of this.things.values()) if (th.packed) th.g.visible = false
      if (this.ganPacked) this.house.placeFamily('gan', 'hidden')
      this.house.kaylee.react('wave')
    }, added.length ? 650 : 150)
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
      this.house.climb(false, () => this.leave(), (i) => {
        if (i % 2 === 0) {
          sfx.thump()
          this.bump = 0
        }
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
    for (const th of this.things.values()) th.g.visible = false
    h.teleport('street', STREET.kaylee.x, STREET.kaylee.z, STREET.kaylee.face)
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
    setTimeout(() => this.phase === 'goodbye' && this.events.say(TALK.goodbye.agong), 700)
  }

  private snacks() {
    this.told.add('jum')
    this.events.say(TALK.goodbye.jum)
    const jum = this.house.family.get('jum')
    jum?.react('hop')
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

  // ---------------------------------------------------------------- per frame

  update(dt: number, t: number) {
    this.t += dt
    this.phaseT += dt
    const s = this.suitcase
    this.hopper.update(dt)
    this.updateObjects(dt)
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
    if (this.phase === 'closed' && this.phaseT > 1.6) this.walkDown()
    if (this.follow) this.followHer(dt, t)
    if (this.phase === 'goodbye' || this.phase === 'boarding' || this.phase === 'gone') this.updateVan(dt)
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
        const want = this.phase === 'pack' && this.count < 3
        const k = ((this.t + (ITEMS.findIndex((i) => i.id === th.id) % 6) * 0.45) % 2.7) / 0.45
        th.g.position.y = th.home.y + (want && k < 1 ? bell(k) * 0.14 : 0)
      }
      th.land = Math.min(1, th.land + dt / 0.4)
      th.glint = Math.max(0, th.glint - dt)
      const sq = 1 - wobble(th.land, 2) * 0.2 + (th.glint > 0 ? Math.abs(Math.sin(th.glint * 8)) * 0.18 : 0)
      const small = th.packed ? 0.82 : 1
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
      if (this.carT < 0 && this.phaseT > 1.2) {
        this.carT = 0
        sfx.whir()
      }
      if (this.carT >= 0 && this.carT < 1) {
        this.carT = Math.min(1, this.carT + dt / 2.0)
        const e = 1 - (1 - this.carT) ** 3
        this.carX = -18 + (STREET.carStop + 18) * e
        if (this.carT >= 1) {
          sfx.beep()
          this.events.say(TALK.goodbye.van)
        }
      } else if (this.carT >= 1) {
        this.carWait += dt
        if (this.carWait > 7) this.board()
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
      } else if (this.count >= 3 && idle > 5) at = this.suitcase.root.localToWorld(tmp.set(0, this.suitcase.h * 0.45, this.suitcase.d * 0.5))
    } else if (this.phase === 'sitting' && idle > 2.5 && this.house.kaylee.pose === 'sit') {
      at = this.suitcase.root.localToWorld(tmp.set(0, this.suitcase.h * 0.45, this.suitcase.d * 0.5))
    } else if (this.phase === 'goodbye' && this.carT >= 1 && this.carWait > 2.5) {
      at = this.van.root.getWorldPosition(tmp).setY(1.0)
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
      // Kaylee and Mommy up top, the card with the two buttons below them.
      return { center: new Vector3(0.65, U + 0.35, -19.7), half: tall ? new Vector3(1.3, 1.6, 0.8) : new Vector3(1.6, 1.25, 0.8), yaw: 14, pitch: 14, minDist: 2.5 }
    }
    if (ph === 'opening' || ph === 'pack' || ph === 'sitting' || ph === 'closed') {
      return { center: new Vector3(tall ? -0.45 : -0.2, U + 0.35, tall ? -19.05 : -18.95), half: tall ? new Vector3(2.0, 0.55, 1.35) : new Vector3(2.45, 0.55, 1.4), yaw: tall ? 6 : 16, pitch: tall ? 50 : 46, minDist: 3 }
    }
    if (ph === 'goodbye' || ph === 'boarding' || ph === 'gone') {
      // A little from above, so the family on the sidewalk shows over the van.
      return { center: new Vector3(tall ? 1.3 : 0.9, tall ? 1.6 : 1.2, 2.3), half: tall ? new Vector3(3.6, 1.3, 2.3) : new Vector3(4.9, 1.2, 2.3), yaw: 6, pitch: 30, minDist: 5 }
    }
    return null
  }

  anchor(id: string) {
    const ph = this.phase
    if (id === 'trip:suitcase') {
      // Its front, below the heap of things in it (each of those is its own target: tap one and it hops out).
      const on = ph === 'pack' || ph === 'sitting' || ph === 'goodbye'
      const at = this.suitcase.root.localToWorld(new Vector3(0, this.suitcase.h * 0.45, this.suitcase.d * 0.5))
      return on ? { at, r: 0.42, glow: (ph === 'pack' && this.count >= 3) || ph === 'sitting' } : null
    }
    if (id === 'trip:van') {
      if (ph !== 'goodbye' || this.carT < 1) return null
      return { at: this.van.root.getWorldPosition(new Vector3()).setY(1.0), r: 1.6, glow: this.carWait > 2.5 }
    }
    if (id.startsWith('trip:item:') && ph === 'pack') {
      const th = this.things.get(id.slice(10))
      if (!th || !th.g.visible) return null
      return { at: th.g.position.clone().setY(th.g.position.y + 0.12), r: th.packed ? 0.15 : 0.24, glow: th.glint > 0 }
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
      ...this.counts,
    }
  }
}

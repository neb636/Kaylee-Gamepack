// MEGA HarborLand's hall (plan: planning/around-the-world/thailand/mall-trip.md, "The hall"), greybox: the place she
// walks around between the mini games. One long side view that scrolls with her:
//   - She walks the way she does in Agong's house: tap the mats and she goes, hold a finger and she follows it.
//   - Tap a way in (the vet's door, the cafe's door, the Big Frame's tunnel, the racing slide's steps) and she walks
//     there, the door swings open, the camera moves in, and she goes in: that mini game opens (`enter`). Coming back
//     out, she steps out of the same door and it shuts behind her.
//   - The ways in that come later are toys for now: the barber's door puffs out hair, the Golden Mountain gets a climb
//     up its first hold, Little Land's bricks tumble and hop home, the bags swing, the Sky Pod lights up.
//   - Life everywhere: kids climb the frame and go down the mask's nose, race down the lanes and slide off the
//     mountain; the staff wave; Mommy sits on the bench; Daddy follows her round; a plush crocodile snaps.
//   - When she's played enough, Daddy's tummy rumbles (`hungry`): the screen around asks about pizza.
// No voices yet: sounds only.
import { Color, Group, Raycaster, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { clamp, sounds, wobble } from '../../../../../../sdk'
import type { Avatar } from '../../../characters/avatar'
import type { Member } from '../../../characters/member'
import type { AnchorInfo } from '../../../engine/Anchors'
import type { Shot } from '../../../engine/camera'
import { merge, P, solid } from '../../../engine/geo'
import { TapMarker } from '../../../engine/marker'
import { NavGrid } from '../../../engine/nav'
import { PAL, toon } from '../../../engine/toon'
import { Stage, type AnchorSpot, type LegEvents } from '../../../trip/legs/stage'
import { Walker } from '../../../trip/walk'
import { Racer } from '../games/race/racer'
import { FRAME_BLOCKED, SIGN } from '../harborland/layout'
import { chaseSign, placeSign } from '../harborland/sign'
import { SOCK_COLORS, wearSocks } from '../socks'
import { buildHall, DIM, laneY, LIT, type HallBuilt } from './build'
import { Kid, KID_LOOK_LIST, STAFF_LOOKS, type Move } from './kids'
import { BACK_Z, BENCH, BLOCKED, SIGN_H, ZONE_SIGNS, BLOCKS, BOXING, CIRCLES, CROC, DOOR, DOORS, FRAME, FRAME_DOOR, FRAME_LOOP, HALL, LANES, MOUNTAIN, NOSE, OPEN_DOORS, SHOPS, SKYPOD, STAFF, START, STEPS, TAP_RECTS, TOWN, type DoorId, type GameDoor, type ShopId, type XZ } from './layout'
import { hallSfx as sfx } from './sounds'

const V = (x: number, y: number, z: number) => new Vector3(x, y, z)

export interface HallEvents extends LegEvents {
  /** She's going in through a way in (the screen fades as she steps through). */
  going(door: GameDoor): void
  /** She went in: that mini game opens. */
  enter(door: GameDoor): void
  /** Daddy's tummy rumbled: the screen around asks "Pizza time?". */
  hungry(): void
}
export interface HallStart {
  socks: string
  /** The mini games she has played (their ways in stop glowing). */
  done: GameDoor[]
  /** The door she comes out of ('' = she just came in). */
  from: DoorId | ''
  /** Daddy's tummy rumbles soon after she comes out. */
  hungry: boolean
}

/** The signs' words, drawn as HTML over them (crisp, and never in a generated picture): where, and how wide (m). */
export const LABELS = [
  { id: 'town', text: 'Harbor Town', at: V((TOWN.x0 + TOWN.x1) / 2, TOWN.sign, BACK_Z + 1.12), w: 4.2, h: 0.62 },
  ...ZONE_SIGNS.map((z) => ({ id: z.id, text: z.text, at: V(z.x, z.y, z.z + 0.12), w: z.w - 0.4, h: SIGN_H - 0.3 })),
]

export const HALL_ANCHORS: AnchorInfo[] = [
  { id: 'family:kaylee', label: 'Kaylee', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
  { id: 'door:vet', label: 'The Vet Clinic', kind: 'thing' },
  { id: 'door:cafe', label: 'Cafe & Cake', kind: 'thing' },
  { id: 'door:barber', label: 'The Barber Salon', kind: 'thing' },
  { id: 'frame', label: 'The Big Frame', kind: 'thing' },
  { id: 'race', label: 'The Racing Slide', kind: 'thing' },
  { id: 'mountain', label: 'The Golden Mountain', kind: 'thing' },
  { id: 'blocks', label: 'Little Land: foam blocks', kind: 'thing' },
  { id: 'bag:0', label: 'Punching bag', kind: 'thing' },
  { id: 'bag:1', label: 'Punching bag', kind: 'thing' },
  { id: 'skypod', label: 'Sky Pod buttons', kind: 'thing' },
  { id: 'croc', label: 'Crocodile', kind: 'thing' },
  { id: 'sign', label: 'MEGA HarborLand sign', kind: 'thing' },
  { id: 'pole', label: "Barber's pole", kind: 'thing' },
  ...[0, 1, 2].map((i): AnchorInfo => ({ id: `kid:${i}`, label: 'A kid playing', kind: 'thing' })),
  ...[0, 1].map((i): AnchorInfo => ({ id: `staff:${i}`, label: 'HarborLand staff', kind: 'thing' })),
]

/** The tap target of each way in. */
const DOOR_OF: Record<string, DoorId> = { 'door:vet': 'vet', 'door:cafe': 'cafe', 'door:barber': 'barber', frame: 'frame', race: 'race' }
const isGame = (d: DoorId): d is GameDoor => (OPEN_DOORS as readonly string[]).includes(d)
const SHOP_IDS = SHOPS.map((s) => s.id) as ShopId[]
const isShop = (d: DoorId): d is ShopId => (SHOP_IDS as string[]).includes(d)

const tmp = new Vector3()
/** How long going in takes: walk up, the door opens, she steps through. */
const ENTER_S = 1.5

export class Hall extends Stage {
  private built: HallBuilt
  private kaylee: Avatar
  private ji: Member
  private daddy: Racer
  private kids: Kid[]
  private staff: Racer[]
  private walker: Walker
  private nav: NavGrid
  private marker: TapMarker
  private done: Set<GameDoor>
  private lead: { last: number } | null = null
  private vel = new Vector3()
  private lastPos = new Vector3()
  private ray = new Raycaster()
  /** Going in through a way in (the camera moves in; the mini game opens at the end). */
  private entering: { door: DoorId; t: number; game: boolean } | null = null
  /** Each shop door: how open it is now, and how open it wants to be. */
  private doorOpen = Object.fromEntries(SHOP_IDS.map((id) => [id, { k: 0, goal: 0 }])) as Record<ShopId, { k: number; goal: number }>
  /** Timed happenings (the door shutting behind her, Daddy's tummy, the bricks hopping home). */
  private timers: { at: number; run: () => void }[] = []
  private poleSpin = 0
  private chase = 0
  private bulbT = 0
  private bulbOn = 0
  private croc = { t: 1 }
  private bags = BOXING.bags.map(() => ({ a: 0, v: 0 }))
  private bricks: { t: number; dir: number; spin: number; from: Vector3; land: Vector3; back: number }[] = []
  private pod = { lit: [] as number[], t: 0, notes: 0 }
  private tufts: { g: Group; v: Vector3; t: number }[] = []
  private hungry: 'no' | 'soon' | 'asked'
  private daddyGoal = new Vector3()
  private labelEls: HTMLElement[] = []
  private signEl: HTMLElement | null = null

  constructor(
    renderer: WebGLRenderer,
    private hev: HallEvents,
    start: HallStart,
  ) {
    super(renderer, hev)
    const { scene, bag } = this
    scene.background = new Color('#2E2748')
    this.rig.fov = 32
    this.done = new Set(start.done)
    this.hungry = start.hungry ? 'soon' : 'no'
    this.built = buildHall(bag)
    scene.add(this.built.root)

    // ---- The family: Kaylee in her grip socks, Mommy on the bench, Daddy following her round ----
    const { kaylee, members } = this.makeFamily(['ji'])
    this.kaylee = kaylee
    this.ji = members.get('ji')!
    scene.add(kaylee.root, this.ji.root)
    wearSocks(kaylee, SOCK_COLORS[start.socks] ?? SOCK_COLORS.pink, bag)
    this.put(this.ji, BENCH.at[0] - 0.3, 0.5, BENCH.at[1], 'sit', BENCH.face)
    this.daddy = new Racer('nick', bag)
    this.daddy.root.userData.pick = 'family:nick'
    scene.add(this.daddy.root)

    // ---- Where she can walk: the mats, round the shops, the frame and the rides ----
    const g = new NavGrid(HALL[0], HALL[2], HALL[1], HALL[3], 0.2, 0.22)
    g.carve(...HALL)
    for (const r of BLOCKED) g.block(...r)
    for (const r of FRAME_BLOCKED) g.block(...r)
    for (const [x, z, r] of CIRCLES) g.blockCircle(x, z, r)
    g.commit()
    this.nav = g
    this.walker = new Walker(kaylee, [{ id: 'hall', y: 0, nav: g, rects: TAP_RECTS }], [], 'hall')
    this.marker = new TapMarker(bag)
    scene.add(this.marker.root)

    // ---- The kids playing, and the staff ----
    const c = this.built.curves
    const frameLoop: Move[] = [
      { walk: [-3.1, 0, -0.55] },
      { hop: [-3.1, 0.75, -0.95], dur: 0.4 },
      { hop: [-3.0, 1.5, -1.6], dur: 0.4 },
      ...FRAME_LOOP.slice(2).map((p, i): Move => (i % 2 ? { hop: p, dur: 0.55, arc: 0.6 } : { walk: p })),
      { hop: NOSE[0], dur: 0.5, arc: 0.4 },
      { slide: c.nose, speed: 4.2 },
      { hop: [-0.4, 0, 2.1], dur: 0.35, arc: 0.3 },
      { cheer: 0.9 },
    ]
    const steps: Move[] = Array.from({ length: STEPS.n }, (_, i): Move => ({ hop: [(STEPS.x0 + STEPS.x1) / 2, (LANES.y0 * (i + 1)) / STEPS.n, STEPS.z1 - ((STEPS.z1 - STEPS.z0) * (i + 0.5)) / STEPS.n], dur: 0.32, arc: 0.3 }))
    const raceLoop = (lane: number): Move[] => [
      { walk: [(STEPS.x0 + STEPS.x1) / 2, 0, -0.45] },
      ...steps,
      { walk: [LANES.x0 + 0.1, LANES.y0, LANES.z[lane]] },
      { wait: 0.5 },
      { slide: c.lanes[lane], speed: 3.6 },
      { hop: [11.2, 0, -0.5], dur: 0.45, arc: 0.6 },
      { cheer: 1.1 },
    ]
    const M = MOUNTAIN
    const hold = (y: number, a: number): [number, number, number] => {
      const r = M.r * (1 - y / (M.h + 0.9)) + 0.12
      return [M.x + Math.sin(a) * r, y, M.z + Math.cos(a) * r]
    }
    const mountainLoop: Move[] = [
      { walk: [M.x - 1.9, 0, -0.6] },
      { hop: hold(0.9, -0.95) },
      { hop: hold(1.8, -0.65) },
      { hop: hold(2.7, -0.35) },
      { hop: [M.x, M.h + 0.02, M.z + 0.2] },
      { cheer: 0.8 },
      { hop: M.slide[0], dur: 0.35, arc: 0.25 },
      { slide: c.steel, speed: 3.8 },
      { hop: [M.x + 0.4, 0, 1.7], dur: 0.35, arc: 0.3 },
      { walk: [M.x - 1.0, 0, 1.3] },
    ]
    this.kids = [new Kid(KID_LOOK_LIST[0], bag, frameLoop, 'kid:0', 0), new Kid(KID_LOOK_LIST[1], bag, [...raceLoop(3), ...raceLoop(2)], 'kid:1', 4), new Kid(KID_LOOK_LIST[2], bag, mountainLoop, 'kid:2', 2)]
    for (const k of this.kids) scene.add(k.r.root)
    this.staff = STAFF.map((s, i) => {
      const r = new Racer('kidA', bag, STAFF_LOOKS[i])
      r.root.userData.pick = `staff:${i}`
      r.place(s.at[0], 0, s.at[1], (s.face * Math.PI) / 180)
      scene.add(r.root)
      return r
    })

    // ---- Where she starts: just in by the bench, or stepping out of the door she went in by ----
    const from = start.from
    if (from) {
      const d = DOORS[from]
      this.walker.place('hall', d.in[0], d.in[1], 0)
      if (isShop(from)) this.doorOpen[from] = { k: 1, goal: 1 }
      kaylee.walk([d.at], () => {
        if (isShop(from)) {
          this.doorOpen[from].goal = 0
          this.after(0.35, () => sfx.latch())
        }
      })
      this.daddy.place(d.at[0] + 1.3, 0, d.at[1] - 0.2, -0.6)
      this.daddy.arms = 'cheer'
      this.after(1.2, () => (this.daddy.arms = 'down'))
    } else {
      this.walker.place('hall', START.at[0], START.at[1], START.face)
      this.daddy.place(START.at[0] + 1.3, 0, START.at[1] - 0.4, -0.5)
    }
    this.lastPos.copy(kaylee.position)
    if (this.hungry === 'soon') this.after(from ? 2.2 : 1.4, () => this.tummy())
  }

  private after(s: number, run: () => void) {
    this.timers.push({ at: this.time + s, run })
  }

  /** Daddy's tummy: a rumble, a wobble, and he pats it; again; then the question. */
  private tummy() {
    if (this.hungry !== 'soon' || this.entering) return
    this.hungry = 'asked'
    const d = this.daddy
    d.lookAt(this.kaylee.position.clone().setY(0.6))
    sfx.rumble()
    d.wiggle()
    this.after(0.9, () => {
      sfx.rumble()
      d.wiggle()
      sfx.haha()
    })
    this.after(1.7, () => this.hev.hungry())
  }

  // ---------------------------------------------------------------- ways in

  private go(door: DoorId) {
    if (this.entering) return
    const d = DOORS[door]
    sfx.pop()
    this.walker.goTo('hall', d.at, () => {
      this.kaylee.faceToward(d.in[0], d.in[1])
      if (isGame(door)) this.goIn(door)
      else this.barber()
    })
  }

  /** At a way in: the door swings open, the camera moves in, she steps through, and the mini game opens. */
  private goIn(door: GameDoor) {
    const d = DOORS[door]
    this.entering = { door, t: 0, game: true }
    this.hev.going(door)
    if (isShop(door)) {
      this.doorOpen[door].goal = 1
      sfx.shopBell()
    } else sfx.whoosh()
    this.daddy.arms = 'cheer'
    this.daddy.lookAt(this.kaylee.position.clone().setY(0.6))
    this.after(0.45, () => this.kaylee.walk([d.in]))
    this.after(ENTER_S, () => {
      if (this.disposed) return
      if (!this.done.has(door)) sounds.sparkle()
      this.hev.enter(door)
    })
  }

  /** The barber's door (its mini game comes later): it opens a crack, a puff of hair tufts, the pole spins, haha. */
  private barber() {
    const o = this.doorOpen.barber
    o.goal = 0.35
    sfx.shopBell()
    this.poleSpin = 1
    this.after(0.3, () => {
      sfx.poof()
      const s = SHOPS[2]
      for (let i = 0; i < 14; i++) {
        const g = solid(merge([P.sphere(0.15, ['#C9B5F7', '#FF8FB8', '#FBEA9A', '#8EC9F5'][i % 4], { scale: [1.3, 0.6, 1] }, 10), P.sphere(0.1, ['#FF8FB8', '#FBEA9A', '#8EC9F5', '#C9B5F7'][i % 4], { at: [0.12, 0.05, 0], scale: [1.2, 0.6, 1] }, 8)]), this.bag, 1.5)
        g.position.set(s.x + (Math.random() - 0.5) * 0.6, 1.0 + Math.random() * 0.8, TOWN.front + 0.25)
        g.rotation.z = Math.random() * 3
        this.scene.add(g)
        this.tufts.push({ g, v: V((Math.random() - 0.5) * 3.2, 1.6 + Math.random() * 1.8, 1.2 + Math.random() * 1.6), t: 0 })
      }
      this.kaylee.react('hop')
    })
    this.after(0.9, () => {
      o.goal = 0
      sfx.latch()
      sfx.haha()
    })
  }

  // ---------------------------------------------------------------- the toys

  private mountain() {
    const M = MOUNTAIN
    const foot: XZ = [M.x - 0.4, M.z + M.r + 0.35]
    sfx.pop()
    this.walker.goTo('hall', foot, () => {
      const k = this.kaylee
      k.faceToward(M.x, M.z)
      // Up onto the first hold, a look round, and back down.
      const r = M.r * (1 - 0.55 / (M.h + 0.9)) + 0.15
      const a = -0.2
      k.hopTo(V(M.x + Math.sin(a) * r, 0.55, M.z + Math.cos(a) * r), 0.4, 0.35, () => {
        sfx.giggle()
        this.after(0.5, () => k.hopTo(V(foot[0], 0, foot[1]), 0.4, 0.3))
      })
    })
  }

  private tumble() {
    if (this.bricks.length) return
    sfx.whoosh(0.5)
    this.bricks = this.built.bricks.map((b, i) => {
      const dir = i % 2 ? 1 : -1
      const land = b.home.clone().add(V(dir * (0.4 + Math.random() * 0.6), 0, 0.9 + Math.random() * 0.9))
      land.y = BLOCKS.brick[1] / 2
      return { t: -i * 0.06 - (b.home.y > 0.5 ? 0 : 0.12), dir, spin: (Math.random() - 0.5) * 2, from: b.home.clone(), land, back: 0 }
    })
    // Then they hop home one by one, up the scale, from the bottom row.
    this.after(2.4, () => {
      this.bricks.forEach((b, i) => (b.back = 2.4 + i * 0.22))
    })
    const k = this.kaylee
    const at: XZ = [(BLOCKS.x0 + BLOCKS.x1) / 2 - 1.4, BLOCKS.front + 1.6]
    this.walker.goTo('hall', at, () => {
      k.faceToward((BLOCKS.x0 + BLOCKS.x1) / 2, BLOCKS.front)
      k.react('hop')
      sfx.giggle()
    })
  }

  private punch(i: number) {
    const b = this.bags[i]
    const x = BOXING.bags[i]
    const k = this.kaylee
    const near = Math.abs(k.position.x - x) < 1.2 && k.position.z < BOXING.z + 1.4
    const hit = (dir: number) => {
      b.v += dir * 2.6
      sfx.punch()
      k.react('hop')
    }
    if (near) {
      k.faceToward(x, BOXING.z)
      hit(k.position.x < x ? 1 : -1)
    } else {
      sfx.pop()
      this.walker.goTo('hall', [x - 0.75, BOXING.z + 0.3], () => {
        k.faceToward(x, BOXING.z)
        hit(1)
      })
    }
  }

  private skypod() {
    const n = SKYPOD.cols * SKYPOD.rows
    const free = [...Array(n).keys()].filter((i) => !this.pod.lit.includes(i))
    const i = free[Math.floor(Math.random() * free.length)] ?? 0
    this.pod.lit.push(i)
    this.pod.t = 0
    sfx.note(this.pod.notes++ % 12)
    if (this.pod.lit.length >= n) {
      sounds.fanfare()
      this.after(1.2, () => (this.pod.lit = []))
    }
    const k = this.kaylee
    if (!this.walker.busy && Math.abs(k.position.x - SKYPOD.x) > 1.5) this.walker.goTo('hall', [SKYPOD.x, -3.0])
  }

  // ---------------------------------------------------------------- touch

  protected pickRoots(): Object3D[] {
    return [this.kaylee.root, this.ji.root, this.daddy.root, ...this.kids.map((k) => k.r.root), ...this.staff.map((s) => s.root), ...this.built.picks]
  }

  pointerDown() {
    super.pointerDown()
    this.lead = { last: 0 }
  }
  /** Held and moved: she follows the finger (re-aimed every 150 ms). */
  pointerMove(x: number, y: number, downX: number, downY: number, held: boolean) {
    if (!held || !this.lead || this.entering || Math.hypot(x - downX, y - downY) < 12) return
    this.lastTouch = this.time
    const now = performance.now()
    if (now - this.lead.last < 150) return
    this.lead.last = now
    const hit = this.floorHit(x, y)
    if (hit) this.walker.goTo('hall', hit.at, undefined, true)
  }
  pointerUp() {
    this.lead = null
  }

  private floorHit(x: number, y: number) {
    this.ray.setFromCamera(this.ndc(x, y), this.rig.camera)
    return this.walker.hit(this.ray.ray)
  }

  protected onTap(id: string | null, x: number, y: number) {
    if (this.entering) return
    const k = this.kaylee
    if (id && DOOR_OF[id]) return this.go(DOOR_OF[id])
    if (id?.startsWith('door:')) return
    if (id?.startsWith('kid:')) {
      this.kids[Number(id.slice(4))]?.poke()
      sfx.giggle()
      return
    }
    if (id?.startsWith('staff:')) {
      const s = this.staff[Number(id.slice(6))]
      s.hop()
      s.arms = 'cheer'
      this.after(1.0, () => (s.arms = 'down'))
      sfx.babble(240)
      return
    }
    if (id?.startsWith('bag:')) return this.punch(Number(id.slice(4)))
    switch (id) {
      case 'kaylee':
      case 'family:kaylee':
        k.react('hop')
        sfx.giggle()
        return
      case 'family:nick':
        this.daddy.hop()
        if (this.hungry === 'asked') sfx.rumble()
        else sfx.haha()
        return
      case 'family:ji':
        this.ji.react('wave')
        sfx.babble(300)
        return
      case 'mountain':
        return this.mountain()
      case 'blocks':
        return this.tumble()
      case 'skypod':
        return this.skypod()
      case 'croc':
        this.croc.t = 0
        sfx.chomp()
        this.after(0.25, () => sfx.chomp())
        this.after(0.5, () => sfx.chomp())
        if (Math.hypot(k.position.x - CROC.at[0], k.position.z - CROC.at[1]) < 2.2) {
          k.react('hop')
          sfx.giggle()
        }
        return
      case 'sign':
        this.chase = 2.2
        chaseSign(this.signEl)
        sfx.jangle()
        sounds.sparkle()
        return
      case 'pole':
        this.poleSpin = 1
        sfx.squeak()
        return
    }
    // The mats: she walks there, round things.
    const hit = this.floorHit(x, y)
    if (!hit) return
    if (this.walker.goTo('hall', hit.at)) this.marker.show(hit.at[0], 0, hit.at[1])
  }

  // ---------------------------------------------------------------- per frame

  protected step(dt: number, t: number) {
    const k = this.kaylee
    for (const tm of [...this.timers]) {
      if (this.time < tm.at) continue
      this.timers.splice(this.timers.indexOf(tm), 1)
      tm.run()
    }
    this.walker.update()
    k.update(dt, t)
    if (dt > 0) {
      tmp.copy(k.position).sub(this.lastPos).divideScalar(dt)
      if (tmp.lengthSq() > 100) tmp.set(0, 0, 0)
      this.vel.lerp(tmp, 1 - Math.exp(-dt / 0.4))
      this.lastPos.copy(k.position)
    }
    if (this.entering) this.entering.t += dt
    const kp = k.position

    // ---- Daddy keeps up with her: beside her and a step further back (so he faces us when he looks at her) ----
    const d = this.daddy
    if (!this.entering) {
      const side = this.vel.x > 0.2 ? -1 : this.vel.x < -0.2 ? 1 : Math.sign(d.pos.x - kp.x) || 1
      const gx = clamp(kp.x + side * 1.2, HALL[0] + 0.5, HALL[1] - 0.5)
      const gz = clamp(kp.z - 0.35, -0.2, HALL[3] - 0.6)
      if (Math.hypot(d.pos.x - gx, d.pos.z - gz) > 1.5 && (!d.busy || this.daddyGoal.distanceTo(V(gx, 0, gz)) > 2.5)) {
        const to = this.nav.nearestFree(gx, gz) ?? [gx, gz]
        const path = this.nav.path([d.pos.x, d.pos.z], to)
        if (path) {
          d.stop()
          this.daddyGoal.set(to[0], 0, to[1])
          const fast = Math.hypot(d.pos.x - kp.x, d.pos.z - kp.z) > 4 ? 3.2 : 2.2
          for (const p of path) d.walkTo(V(p[0], 0, p[1]), fast)
        }
      }
      if (!d.busy) {
        // Turned to her, but never with his back to us: when she's behind him he looks out at us instead.
        const to = Math.atan2(kp.x - d.pos.x, kp.z - d.pos.z)
        d.face(clamp(to, -1.0, 1.0))
        d.lookAt(Math.abs(to) < 1.3 ? tmp.copy(kp).setY(kp.y + 0.6) : null)
      }
    }
    d.update(dt, t)
    this.ji.lookAt(kp.x, kp.y + 0.6, kp.z)
    this.ji.update(dt, t)
    for (const kid of this.kids) kid.update(dt, t)
    for (const [i, s] of this.staff.entries()) {
      // They wave at her when she comes near.
      const near = Math.hypot(s.pos.x - kp.x, s.pos.z - kp.z) < 2.4
      s.lookAt(near ? tmp.copy(kp).setY(0.6) : null)
      if (near && s.arms === 'down' && Math.sin(t * 0.9 + i * 2) > 0.96) {
        s.arms = 'cheer'
        this.after(0.9, () => (s.arms = 'down'))
      }
      s.update(dt, t)
    }

    // ---- The doors, the pole, the signs' bulbs ----
    for (const id of SHOP_IDS) {
      const o = this.doorOpen[id]
      o.k += (o.goal - o.k) * (1 - Math.exp(-dt * 7))
      this.built.doors[id].rotation.y = -1.45 * o.k
    }
    this.poleSpin = Math.max(0, this.poleSpin - dt * 0.4)
    this.built.pole.rotation.y += dt * (1.2 + this.poleSpin * 14)
    this.chase = Math.max(0, this.chase - dt)
    this.bulbT += dt
    if (this.bulbT > (this.chase > 0 ? 0.1 : 0.6)) {
      this.bulbT = 0
      this.bulbOn = 1 - this.bulbOn
      this.built.bulbs.forEach((set, i) => set.forEach((m) => (m.material = toon(i === this.bulbOn ? LIT : DIM))))
    }

    // ---- The crocodile's chomps, the bags swinging, the bricks tumbling and hopping home ----
    this.croc.t = Math.min(1, this.croc.t + dt / 0.75)
    this.built.croc.jaw.rotation.z = this.croc.t < 1 ? Math.abs(Math.sin(this.croc.t * Math.PI * 3)) * 0.6 : 0
    this.bags.forEach((b, i) => {
      b.v += (-b.a * 14 - b.v * 1.6) * dt
      b.a += b.v * dt
      this.built.bags[i].rotation.z = b.a * 0.5
    })
    this.updateBricks(dt)
    for (const tf of [...this.tufts]) {
      tf.t += dt
      tf.v.y -= 4 * dt
      tf.g.position.addScaledVector(tf.v, dt)
      tf.g.rotation.z += dt * 4
      tf.g.scale.setScalar(Math.max(0.01, Math.min(1, tf.t * 6) * (1 - Math.max(0, tf.t - 1.0) / 0.8)))
      if (tf.t > 1.8) {
        this.scene.remove(tf.g)
        this.tufts.splice(this.tufts.indexOf(tf), 1)
      }
    }
    this.pod.t += dt
    if (this.pod.t > 6) this.pod.lit = []
    this.built.skypod.forEach((m, i) => {
      const mat = this.pod.lit.includes(i) ? toon(['#FF4F9A', '#FFC83D', '#8FE3C8', '#8EC9F5'][i % 4]) : toon(PAL.lavenderDark)
      if (m.material !== mat) m.material = mat
    })

    this.marker.update(dt)
    this.lights.follow(kp.x, kp.y, kp.z)
  }

  private updateBricks(dt: number) {
    if (!this.bricks.length) return
    let home = 0
    this.bricks.forEach((b, i) => {
      const g = this.built.bricks[i].g
      if (b.back > 0) {
        b.back -= dt
        if (b.back > 0.45) return
        // Hop home (0.45 s), a note up the scale as each one lands.
        const k = clamp(1 - b.back / 0.45)
        g.position.lerpVectors(b.land, b.from, k)
        g.position.y += Math.sin(Math.PI * k) * 1.0
        g.rotation.set(0, 0, b.spin * (1 - k) * 3)
        if (b.back <= 0) {
          g.position.copy(b.from)
          g.rotation.set(0, 0, 0)
          g.scale.set(1.12, 0.88, 1.12)
          sfx.note(i + 2)
          b.back = -1
        }
        return
      }
      if (b.back < 0) {
        g.scale.lerp(V(1, 1, 1), 1 - Math.exp(-dt * 10))
        home++
        return
      }
      b.t += dt
      if (b.t <= 0) return
      // Falling forward off the stack, turning over, a soft bounce on the mats.
      const k = clamp(b.t / 0.7)
      g.position.lerpVectors(b.from, b.land, k)
      g.position.y += Math.sin(Math.PI * k) * 0.5 * (1 - k) + (b.t > 0.7 ? wobble(clamp((b.t - 0.7) / 0.5), 2) * 0.05 : 0)
      g.rotation.set(k * 1.4, 0, b.dir * k * (1.57 + b.spin * 0.3))
      if (b.t - dt < 0.7 && b.t >= 0.7) sfx.whump(i)
    })
    if (home === this.bricks.length) this.bricks = []
  }

  // ---------------------------------------------------------------- camera, anchors

  protected shot(): Shot {
    const k = this.kaylee.position
    const tall = this.w < this.h
    const e = this.entering
    if (e) {
      // Moving in on the way in.
      const d = DOORS[e.door]
      const z = isShop(e.door) ? TOWN.front : e.door === 'frame' ? FRAME.z1 : -1.0
      const y = isShop(e.door) ? 1.4 : e.door === 'frame' ? 1.6 : 1.7
      return { center: V(d.at[0], y, z + 0.6), half: tall ? V(1.9, 2.1, 1.2) : V(2.7, 1.7, 1.2), yaw: 0, pitch: 10, minDist: 5 }
    }
    const ahead = clamp(this.vel.x * 0.5, -1.6, 1.6)
    if (tall) return { center: V(clamp(k.x + ahead, HALL[0] + 2.2, HALL[1] - 2.2), 2.5, 0.4), half: V(2.2, 2.9, 2.2), yaw: 0, pitch: 14, minDist: 7 }
    // A short wide screen (an iPhone on its side): closer in, so she isn't tiny.
    if (this.w > this.h * 1.7) return { center: V(clamp(k.x + ahead, HALL[0] + 4, HALL[1] - 4), 1.75, 0.6), half: V(3.4, 1.55, 1.8), yaw: 0, pitch: 14, minDist: 6 }
    return { center: V(clamp(k.x + ahead, HALL[0] + 4.6, HALL[1] - 4.6), 2.15, 0.4), half: V(4.2, 2.2, 2.4), yaw: 0, pitch: 14, minDist: 7 }
  }

  protected anchorAt(id: string): AnchorSpot | null {
    if (this.entering) return null
    const door = DOOR_OF[id]
    const glow = !!door && isGame(door) && !this.done.has(door)
    const k = this.kaylee
    if (id.startsWith('door:')) {
      const s = SHOPS.find((x) => `door:${x.id}` === id)
      return s ? { at: V(s.x, DOOR.h / 2, TOWN.front + 0.1), r: 0.62, glow, max: 150 } : null
    }
    if (id.startsWith('kid:')) {
      const r = this.kids[Number(id.slice(4))]?.r
      return r ? { at: r.root.position.clone().setY(r.root.position.y + 0.55), r: 0.3, max: 110, prio: 1 } : null
    }
    if (id.startsWith('staff:')) {
      const r = this.staff[Number(id.slice(6))]
      return r ? { at: r.root.position.clone().setY(0.8), r: 0.36, max: 120, prio: 1 } : null
    }
    if (id.startsWith('bag:')) {
      const i = Number(id.slice(4))
      return { at: this.built.bags[i].localToWorld(V(0, -1.15, 0)), r: 0.42, prio: 3 }
    }
    switch (id) {
      case 'family:kaylee':
        return { at: tmp.copy(k.position).setY(k.position.y + 0.5).clone(), r: 0.32, max: 120, prio: 1 }
      case 'family:nick':
        return { at: this.daddy.root.position.clone().setY(this.daddy.root.position.y + 0.9), r: 0.38, max: 130, prio: 1 }
      case 'family:ji':
        return { at: this.ji.root.getWorldPosition(new Vector3()).setY(0.85), r: 0.34, max: 120, prio: 1 }
      case 'frame':
        return { at: V(FRAME_DOOR.x, FRAME_DOOR.y + 0.1, FRAME.z1 + 0.1), r: 0.7, glow, max: 160 }
      case 'race':
        return { at: V(7.9, laneY(0.5) + 0.25, LANES.z[3] + 0.2), r: 0.7, glow, max: 160 }
      case 'mountain':
        return { at: V(MOUNTAIN.x - 0.6, 1.4, MOUNTAIN.z + 1.2), r: 0.8, max: 160 }
      case 'blocks':
        return { at: V((BLOCKS.x0 + BLOCKS.x1) / 2, 0.75, BLOCKS.front), r: 0.7, max: 150 }
      case 'skypod':
        return { at: V(SKYPOD.x, SKYPOD.y, SKYPOD.z + 0.1), r: 0.62, max: 140 }
      case 'croc':
        return { at: V(CROC.at[0], 0.35, CROC.at[1]), r: 0.6, max: 140 }
      case 'sign':
        return { at: V(SIGN.at[0], SIGN.at[1], SIGN.at[2] + 0.1), r: 0.9, max: 150 }
      case 'pole':
        return { at: this.built.pole.position.clone(), r: 0.3, prio: 3 }
    }
    return null
  }

  /** The Big Frame's lit sign (its letters are HTML: harborland/sign.tsx). */
  setSign(el: HTMLElement | null) {
    this.signEl = el
  }

  /** The signs' words (one element per LABELS entry, in order, inside `box`). */
  setLabelBox(box: HTMLElement | null) {
    this.labelEls = box ? [...box.children].filter((c): c is HTMLElement => c instanceof HTMLElement) : []
  }

  placeAnchors() {
    super.placeAnchors()
    const cam = this.rig.camera
    placeSign(this.signEl, cam, this.w, this.h)
    LABELS.forEach((l, i) => {
      const el = this.labelEls[i]
      if (!el) return
      const a = l.at.clone().project(cam)
      const b = l.at.clone().add(V(l.w / 2, 0, 0)).project(cam)
      const show = a.z < 1 && Math.abs(a.x) < 1.3 && Math.abs(a.y) < 1.2 && !this.entering
      if (el.style.display !== (show ? '' : 'none')) el.style.display = show ? '' : 'none'
      if (!show) return
      const x = ((a.x + 1) / 2) * this.w
      const y = ((1 - a.y) / 2) * this.h
      const px = (Math.abs(b.x - a.x) * this.w) / 2
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`
      // As big as fits on the board: its width (about 0.6 em a bold letter) or its height.
      const perM = px / (l.w / 2)
      el.style.fontSize = `${Math.min((perM * l.w) / (0.6 * l.text.length), perM * l.h * 0.95).toFixed(1)}px`
    })
  }

  /** After a while with nothing touched: the nearest way in she hasn't been through yet. */
  protected hintAt() {
    if (this.walker.busy || this.entering) return null
    let best: Vector3 | null = null
    let bestD = Infinity
    for (const [anchor, door] of Object.entries(DOOR_OF)) {
      if (!isGame(door) || this.done.has(door)) continue
      const a = this.anchorAt(anchor)
      const dd = a ? Math.abs(a.at.x - this.kaylee.position.x) : Infinity
      if (a && dd < bestD) {
        bestD = dd
        best = a.at
      }
    }
    return best
  }

  qa() {
    const p = this.kaylee.position
    return {
      world: 'hall',
      pos: [p.x, p.y, p.z].map((n) => Math.round(n * 100) / 100),
      plan: this.walker.plan.join(' '),
      entering: this.entering?.door ?? null,
      done: [...this.done],
      hungry: this.hungry,
      daddy: [this.daddy.pos.x, this.daddy.pos.z, this.daddy.yaw].map((n) => Math.round(n * 100) / 100),
      kids: this.kids.map((k) => ({ at: [k.r.pos.x, k.r.pos.y, k.r.pos.z].map((n) => Math.round(n * 10) / 10), sliding: k.sliding })),
      touches: this.touches,
    }
  }

  dispose() {
    for (const tf of this.tufts) this.scene.remove(tf.g)
    super.dispose()
  }
}

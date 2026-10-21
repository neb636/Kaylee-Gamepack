// MEGA HarborLand ICONSIAM, "Little Thailand" (plan: planning/around-the-world/thailand/mall-trip.md), greybox 1: the
// playground as a toy with no goal. Climb up, slide down:
//   - She walks Kaylee round the way she does in Agong's house: tap a spot and she goes, hold a finger and she follows
//     it. A tap on another floor finds the way there (trip/walk.ts): she climbs the Golden Mountain or a net by herself,
//     and takes a slide down whenever there is one.
//   - The ground floor: the ball pool (dive in, the balls part round her; tap them to toss), the little slide off the
//     perch, the Lopburi monkeys on the mountain (they steal Daddy's socks), the Sky Pod buttons, the bike race, the
//     Phi Ta Khon figures, and the cannon: Daddy, in the pool, is the target.
//   - The first deck (the mountain's top): the rope bridge (it sags and bounces), the Boomerang Donut, the zip line.
//   - The top: the Ta-Khon roller slide (long and bumpy, the masks pull faces) and the twin-dragon spiral (round and
//     round into the pool, the camera turning with her).
// Each big ride is a sticker on her sock band the first time. No voices yet: sounds only. The camera is a dollhouse
// view from the front, a little above, following her; on a tall screen it shows the whole tower.
import { Color, Raycaster, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { clamp, sounds } from '../../../../../../sdk'
import type { Avatar } from '../../../characters/avatar'
import type { Member } from '../../../characters/member'
import type { AnchorInfo } from '../../../engine/Anchors'
import type { Shot } from '../../../engine/camera'
import { merge, P, solid } from '../../../engine/geo'
import { TapMarker } from '../../../engine/marker'
import { NavGrid } from '../../../engine/nav'
import { sfx } from '../../../sfx'
import { Stage, type AnchorSpot, type LegEvents } from '../../../trip/legs/stage'
import { Walker, type Floor, type Link } from '../../../trip/walk'
import { buildHarborLand, type Built } from './build'
import { BRIDGE, CANNON, DADDY, GROUND_BLOCKS, GROUND_CIRCLES, HALL, L1A, L1B, LINKS, LV, MOMMY, MOUNTAIN, PERCH, POOL, SKYPOD, SKYWALK, STARTS, TAP_RECTS, TOP, TOWER, TOWER_DECK, BIKE, type LinkId, type Rect, type RideId, type XZ } from './layout'
import { BallPool } from './pool'
import { Rides } from './rides'
import { Toys } from './toys'

export type HarborSection = keyof typeof STARTS
export interface HarborEvents extends LegEvents {
  /** A big ride for the first time: its sticker on her sock band. */
  ride(id: RideId): void
}
export interface HarborStart {
  section: HarborSection
  socks: string
  rides: RideId[]
}

export const HARBOR_ANCHORS: AnchorInfo[] = [
  { id: 'family:kaylee', label: 'Kaylee', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
  { id: 'pool', label: 'Ball pool', kind: 'thing' },
  { id: 'cannon', label: 'Ball cannon', kind: 'thing' },
  { id: 'climb:mountain', label: 'Golden Mountain', kind: 'thing' },
  { id: 'climb:net-l1', label: 'Climbing net', kind: 'thing' },
  { id: 'climb:net-top', label: 'Climbing net to the top', kind: 'thing' },
  { id: 'climb:steps', label: 'Little steps', kind: 'thing' },
  { id: 'ride:slide-little', label: 'Little slide', kind: 'thing' },
  { id: 'ride:donut', label: 'Boomerang Donut', kind: 'thing' },
  { id: 'ride:zip', label: 'Zip line', kind: 'thing' },
  { id: 'ride:roller', label: 'Ta-Khon roller slide', kind: 'thing' },
  { id: 'ride:dragon', label: 'Dragon spiral slide', kind: 'thing' },
  { id: 'bridge', label: 'Rope bridge', kind: 'thing' },
  { id: 'chedi', label: 'Golden chedi', kind: 'thing' },
  { id: 'skypod', label: 'Sky Pod buttons', kind: 'thing' },
  { id: 'bike', label: 'Bike race', kind: 'thing' },
  ...[0, 1, 2].map((i): AnchorInfo => ({ id: `monkey:${i}`, label: 'Monkey', kind: 'thing' })),
  ...[0, 1, 2].map((i): AnchorInfo => ({ id: `mask:${i}`, label: 'Phi Ta Khon', kind: 'thing' })),
]

export const SOCK_COLORS: Record<string, string> = { pink: '#FF8FB8', lavender: '#C9B5F7', mint: '#8FE3C8' }

/** Which section each floor is (the address bar follows her). */
const SECTION_OF: Record<string, HarborSection> = { ground: 'play', pool: 'play', perch: 'play', l1: 'mountain', top: 'dragon' }
/** What each tap target rides (or climbs). */
const LINK_OF: Record<string, LinkId> = {
  'climb:mountain': 'mountain',
  'climb:net-l1': 'netL1',
  'climb:net-top': 'netTop',
  'climb:steps': 'steps',
  'ride:slide-little': 'slideLittle',
  'ride:donut': 'donut',
  'ride:zip': 'zip',
  'ride:roller': 'roller',
  'ride:dragon': 'dragon',
}
/** The sticker each glowing ride gives. */
const STICKER_OF: Partial<Record<string, RideId>> = { pool: 'pool', 'climb:mountain': 'mountain', 'ride:donut': 'donut', 'ride:zip': 'zip', 'ride:roller': 'roller', 'ride:dragon': 'dragon' }

const V = (x: number, y: number, z: number) => new Vector3(x, y, z)
const tmp = new Vector3()

function grid(bounds: Rect, carve: Rect[], blocks: Rect[] = [], circles: [number, number, number][] = []) {
  const g = new NavGrid(bounds[0], bounds[2], bounds[1], bounds[3], 0.2, 0.22)
  for (const r of carve) g.carve(...r)
  for (const r of blocks) g.block(...r)
  for (const [x, z, r] of circles) g.blockCircle(x, z, r)
  g.commit()
  return g
}

export class HarborLand extends Stage {
  private built: Built
  private pool: BallPool
  private kaylee: Avatar
  private ji: Member
  private nick: Member
  private toys: Toys
  private rides: Rides
  private walker: Walker
  private links: Record<LinkId, Link>
  private marker: TapMarker
  private done: Set<RideId>
  private section: HarborSection
  private lead: { last: number } | null = null
  private vel = new Vector3()
  private lastPos = new Vector3()
  private ray = new Raycaster()

  constructor(
    renderer: WebGLRenderer,
    private hev: HarborEvents,
    start: HarborStart,
  ) {
    super(renderer, hev)
    const { scene, bag } = this
    scene.background = new Color('#F1E8FF')
    this.rig.fov = 32
    this.section = start.section
    this.done = new Set(start.rides)
    this.built = buildHarborLand(bag)
    scene.add(this.built.root)
    this.pool = new BallPool(POOL.inner, POOL.balls, (x, z) => Math.hypot(x - TOWER.x, z - TOWER.z) < TOWER.post + 0.1, bag)
    scene.add(this.pool.root)

    // ---- The family: Kaylee in her grip socks, Daddy in the pool (the cannon's target), Mommy on the parents' bench ----
    const { kaylee, members } = this.makeFamily(['ji', 'nick'])
    this.kaylee = kaylee
    this.ji = members.get('ji')!
    this.nick = members.get('nick')!
    scene.add(kaylee.root, this.ji.root)
    this.wearSocks(SOCK_COLORS[start.socks] ?? SOCK_COLORS.pink)
    this.put(this.ji, MOMMY.bench[0], 0.5, MOMMY.bench[1], 'sit', MOMMY.face)
    this.toys = new Toys(this.built, this.pool, this.nick, scene, bag, { giggle: () => sfx.giggle() })
    this.marker = new TapMarker(bag)
    scene.add(this.marker.root)

    // ---- Where she can walk: one grid per floor, and the links between them ----
    const onBridge = (x: number, z: number) => x > BRIDGE.rect[0] && x < BRIDGE.rect[1] && z > BRIDGE.rect[2] - 0.1 && z < BRIDGE.rect[3] + 0.1
    const floors: Floor[] = [
      { id: 'ground', y: LV.ground, nav: grid(HALL, [HALL], GROUND_BLOCKS, GROUND_CIRCLES), rects: TAP_RECTS.ground },
      { id: 'pool', y: -0.04, nav: grid(POOL.rect, [POOL.inner], [], [[TOWER.x, TOWER.z, TOWER.r + 0.45], [DADDY.at[0], DADDY.at[1], 0.4]]), rects: TAP_RECTS.pool },
      { id: 'perch', y: LV.perch, nav: grid([PERCH[0] - 0.2, PERCH[1] + 0.2, PERCH[2] - 0.2, PERCH[3] + 0.2], [PERCH]), rects: TAP_RECTS.perch },
      {
        id: 'l1',
        y: LV.l1,
        // (The bridge's walkable strip reaches onto both decks, so the three join up.)
        nav: grid([-6.2, 3.2, -3.6, 0.2], [[L1A[0], L1A[1], -1.6, 0], [BRIDGE.rect[0] - 0.6, BRIDGE.rect[1] + 0.6, BRIDGE.rect[2], BRIDGE.rect[3]], [L1B[0], L1B[1], -2.4, 0]]),
        rects: TAP_RECTS.l1,
        lift: (x, z) => (onBridge(x, z) ? this.toys.bridgeLift(x) : 0),
      },
      { id: 'top', y: LV.top, nav: grid([-14.2, -2.3, -3.6, -0.4], [TOP, [SKYWALK[0] - 0.5, SKYWALK[1] + 0.6, SKYWALK[2], SKYWALK[3]], TOWER_DECK]), rects: TAP_RECTS.top },
    ]
    this.rides = new Rides(kaylee, this.built, {
      splash: (x, z, power) => {
        this.pool.splash(x, z, Math.round(16 * power), power)
        sfx.splash(power)
      },
      passing: (p) => this.toys.passing(p),
    })
    this.links = this.makeLinks()
    this.walker = new Walker(kaylee, floors, Object.values(this.links), STARTS[start.section].floor)
    this.walker.onFloor = (f) => {
      const s = SECTION_OF[f.id]
      if (s && s !== this.section) {
        this.section = s
        this.hev.section(s)
      }
    }
    const s = STARTS[start.section]
    this.walker.place(s.floor, s.at[0], s.at[1], s.face)
    this.lastPos.copy(kaylee.position)
  }

  /** Her grip socks (HarborLand's must-have): a sock over each foot, a band round each ankle. */
  private wearSocks(color: string) {
    const H = this.kaylee.height
    const socks = solid(merge([-1, 1].flatMap((s) => [P.sphere(0.083 * H, color, { at: [s * 0.085 * H, 0.036 * H, 0.022 * H], scale: [1, 0.66, 1.32] }), P.cyl(0.074 * H, 0.074 * H, 0.04 * H, '#FFFFFF', { at: [s * 0.085 * H, 0.085 * H, 0] })])), this.bag, 1.5)
    this.kaylee.rig.body.add(socks)
  }

  /** Every climb and ride as a link for the walker, played by rides.ts. */
  private makeLinks(): Record<LinkId, Link> {
    const r = this.rides
    const c = this.built.curves
    const xz = (p: XZ, y: number) => V(p[0], y, p[1])
    const L = LINKS
    const award = (id: RideId) => this.award(id)
    const dive = (l: typeof L.diveA): Link => ({
      id: l === L.diveA ? 'diveA' : 'diveB',
      ...l,
      twoWay: true,
      cost: 1.5,
      run: (back, done) =>
        back
          ? r.hops([xz(l.at, 0)], done, 0.5, 0.75)
          : r.hops(
              [xz(l.end, -0.04)],
              () => {
                this.pool.splash(l.end[0], l.end[1], 14, 1)
                sfx.splash(1)
                award('pool')
                done()
              },
              0.55,
              0.85,
            ),
    })
    return {
      mountain: {
        id: 'mountain',
        ...L.mountain,
        twoWay: true,
        cost: 3,
        run: (back, done) => {
          const pts = MOUNTAIN.climb.map((p) => V(...p))
          if (back) r.hops([...pts.reverse(), xz(L.mountain.at, 0)], done)
          else
            r.hops([...pts, xz(L.mountain.end, LV.l1)], () => {
              award('mountain')
              done()
            })
        },
      },
      netL1: { id: 'netL1', ...L.netL1, twoWay: true, cost: 3, run: (back, done) => r.net(xz(L.netL1.at, 0), xz(L.netL1.end, LV.l1), L.netL1.z, !back, done) },
      netTop: { id: 'netTop', ...L.netTop, twoWay: true, cost: 3, run: (back, done) => r.net(xz(L.netTop.at, LV.l1), xz(L.netTop.end, LV.top), L.netTop.z, !back, done) },
      steps: {
        id: 'steps',
        ...L.steps,
        twoWay: true,
        cost: 1,
        run: (back, done) => {
          const pts = [V(-7.8, 0.3, 1.9), V(-8.1, 0.6, 1.9)]
          r.hops(back ? [...pts.reverse(), xz(L.steps.at, 0)] : [...pts, xz(L.steps.end, LV.perch)], done, 0.28, 0.2)
        },
      },
      diveA: dive(L.diveA),
      diveB: dive(L.diveB),
      slideLittle: {
        id: 'slideLittle',
        ...L.slideLittle,
        cost: 1,
        run: (_b, done) =>
          r.slide(c.slideLittle, { max: 3.6, accel: 2, land: xz(L.slideLittle.end, -0.04), balls: true }, () => {
            award('pool')
            done()
          }),
      },
      donut: {
        id: 'donut',
        ...L.donut,
        cost: 1,
        run: (_b, done) =>
          r.donut(() => {
            award('donut')
            done()
          }),
      },
      zip: {
        id: 'zip',
        ...L.zip,
        cost: 1,
        run: (_b, done) =>
          r.zip(() => {
            award('zip')
            done()
          }),
      },
      roller: {
        id: 'roller',
        ...L.roller,
        cost: 1,
        run: (_b, done) =>
          r.slide(c.roller, { max: 4.2, accel: 1.4, rattle: true, land: xz(L.roller.end, 0) }, () => {
            award('roller')
            done()
          }),
      },
      dragon: {
        id: 'dragon',
        ...L.dragon,
        cost: 1,
        run: (_b, done) =>
          r.slide(c.dragon, { max: 5.5, accel: 2.2, land: xz(L.dragon.end, -0.04), balls: true }, () => {
            award('dragon')
            award('pool')
            sfx.cheer()
            this.nick.react('wave')
            this.ji.react('wave')
            done()
          }),
      },
    }
  }

  /** A big ride for the first time: a sticker. */
  private award(id: RideId) {
    if (this.done.has(id)) return
    this.done.add(id)
    sfx.chime()
    sounds.sparkle()
    this.hev.ride(id)
  }

  // ---------------------------------------------------------------- touch

  protected pickRoots(): Object3D[] {
    return [this.kaylee.root, this.ji.root, ...this.toys.pickRoots, ...this.built.picks, this.pool.root]
  }

  pointerDown() {
    super.pointerDown()
    this.lead = { last: 0 }
  }
  /** Held and moved: she follows the finger (re-aimed every 150 ms), onto whatever floor it's over. */
  pointerMove(x: number, y: number, downX: number, downY: number, held: boolean) {
    if (!held || !this.lead || Math.hypot(x - downX, y - downY) < 12) return
    this.lastTouch = this.time
    const now = performance.now()
    if (now - this.lead.last < 150) return
    this.lead.last = now
    const hit = this.floorHit(x, y)
    if (hit) this.walker.goTo(hit.floor.id, hit.at, undefined, true)
  }
  pointerUp() {
    this.lead = null
  }

  private floorHit(x: number, y: number) {
    this.ray.setFromCamera(this.ndc(x, y), this.rig.camera)
    return this.walker.hit(this.ray.ray)
  }

  protected onTap(id: string | null, x: number, y: number) {
    const k = this.kaylee
    if (id && LINK_OF[id]) {
      sfx.pop()
      this.walker.ride(this.links[LINK_OF[id]])
      return
    }
    if (id?.startsWith('monkey:')) return this.toys.monkey(Number(id.slice(7)))
    if (id?.startsWith('mask:')) return this.toys.mask(Number(id.slice(5)))
    switch (id) {
      case 'kaylee':
      case 'family:kaylee':
        k.react('hop')
        sfx.giggle()
        if (this.walker.floor.id === 'pool') this.pool.splash(k.position.x, k.position.z, 8, 0.7)
        return
      case 'family:nick':
        return this.toys.daddyTap()
      case 'family:ji':
        this.ji.react('wave')
        sfx.babble(300)
        return
      case 'pool': {
        // Toss the balls where she tapped, and wade (or dive) over there.
        const hit = this.floorHit(x, y)
        const at: XZ = hit?.floor.id === 'pool' ? hit.at : [-12.2, 1.4]
        if (hit?.floor.id === 'pool' || this.walker.floor.id === 'pool') {
          this.pool.splash(at[0], at[1], 10, 0.8)
          sfx.pop()
        }
        this.walker.goTo('pool', at)
        return
      }
      case 'cannon': {
        const [cx, cz] = CANNON.at
        const near = this.walker.floor.id === 'ground' && Math.hypot(k.position.x - cx, k.position.z - cz) < 2.6
        if (near) {
          k.faceToward(cx, cz)
          this.toys.fire()
        } else {
          sfx.pop()
          this.walker.goTo('ground', [cx + 0.85, cz + 0.05], () => {
            k.faceToward(cx, cz)
            this.toys.fire()
          })
        }
        return
      }
      case 'bridge':
        return this.toys.bridge()
      case 'chedi':
        return this.toys.chedi()
      case 'skypod':
        this.toys.skypod()
        if (this.walker.floor.id === 'ground' && !this.walker.busy) this.walker.goTo('ground', [SKYPOD.x, SKYPOD.z + 0.75])
        return
      case 'bike':
        this.toys.bike()
        if (this.walker.floor.id === 'ground' && !this.walker.busy) this.walker.goTo('ground', [BIKE.at[0], BIKE.at[1] + 0.75])
        return
    }
    // The floor (or a wall in front of one): she walks there, round things and through the links.
    const hit = this.floorHit(x, y)
    if (!hit) return
    if (this.walker.goTo(hit.floor.id, hit.at)) this.marker.show(hit.at[0], hit.floor.y, hit.at[1])
    if (hit.floor.id === 'pool' && this.walker.floor.id === 'pool') this.pool.splash(hit.at[0], hit.at[1], 8, 0.7)
  }

  // ---------------------------------------------------------------- per frame

  protected step(dt: number, t: number) {
    const k = this.kaylee
    this.walker.update()
    k.update(dt, t)
    this.rides.update(dt, t)
    if (dt > 0) {
      tmp.copy(k.position).sub(this.lastPos).divideScalar(dt)
      if (tmp.lengthSq() > 100) tmp.set(0, 0, 0)
      this.vel.lerp(tmp, 1 - Math.exp(-dt / 0.4))
      this.lastPos.copy(k.position)
    }
    const kp = k.position
    const onBridge = !this.walker.riding && this.walker.floor.id === 'l1' && kp.x > BRIDGE.rect[0] && kp.x < BRIDGE.rect[1]
    this.toys.update(dt, t, kp, onBridge)
    this.ji.lookAt(kp.x, kp.y + 0.6, kp.z)
    this.ji.update(dt, t)
    this.nick.update(dt, t)
    const d = this.toys.daddy.position
    const wading = this.walker.floor.id === 'pool' || (this.pool.inside(kp.x, kp.z) && kp.y < 0.6)
    this.pool.update(dt, [
      { x: kp.x, z: kp.z, r: 0.5, depth: wading ? 1 : 0 },
      { x: d.x, z: d.z, r: 0.6, depth: 1 },
    ])
    this.marker.update(dt)
    this.rig.lag = this.rides.kind === 'slide' || this.rides.kind === 'zip' ? 0.2 : 0.35
    this.lights.follow(kp.x, kp.y, kp.z)
  }

  // ---------------------------------------------------------------- camera, anchors

  protected shot(): Shot {
    const k = this.kaylee.position
    const tall = this.w < this.h
    // On the dragon's spiral the camera turns round with her (a little).
    let yaw = 4
    if (this.walker.riding?.id === 'dragon' && this.rides.kind === 'slide' && k.y > 0.8) yaw = clamp(Math.sin(Math.atan2(k.x - TOWER.x, k.z - TOWER.z)) * 28, -28, 28)
    let ahead = this.vel.x * 0.35
    // The cannon or a monkey after his sock: Daddy comes into the picture too.
    if (this.toys.daddyShow && this.walker.floor.id === 'ground' && !this.walker.riding) ahead = (DADDY.at[0] - k.x) / 2
    const cz = clamp(k.z - 0.6, -1.4, 1.6)
    if (tall) return { center: V(clamp(k.x + ahead, -13.0, 12.4), 2.7, cz), half: V(2.6, 2.9, 1.9), yaw, pitch: 22, minDist: 6 }
    return { center: V(clamp(k.x + ahead, -11.0, 10.4), clamp(k.y + 0.7, 1.4, 4.0), cz), half: V(4.8, 1.9, 1.9), yaw, pitch: 22, minDist: 6 }
  }

  protected anchorAt(id: string): AnchorSpot | null {
    const sticker = STICKER_OF[id]
    const glow = !!sticker && !this.done.has(sticker)
    const k = this.kaylee
    switch (id) {
      case 'family:kaylee':
        return { at: tmp.copy(k.position).setY(k.position.y + 0.5).clone(), r: 0.32, max: 120, prio: 1 }
      case 'family:nick':
        return { at: this.toys.daddyHead.setY(this.toys.daddyHead.y - 0.25), r: 0.36, max: 130, prio: 1 }
      case 'family:ji':
        return { at: this.ji.root.getWorldPosition(new Vector3()).setY(0.85), r: 0.34, max: 120, prio: 1 }
      case 'pool':
        return { at: V(-11.6, POOL.balls, 0.9), r: 0.6, glow, max: 130 }
      case 'cannon':
        return { at: V(CANNON.at[0], 0.75, CANNON.at[1]), r: 0.45, prio: 3 }
      case 'climb:mountain':
        return { at: V(-7.6, 1.15, -0.1), r: 0.6, glow }
      case 'climb:net-l1':
        return { at: V(LINKS.netL1.x, 1.1, 0.12), r: 0.55 }
      case 'climb:net-top':
        return { at: V(LINKS.netTop.x, 3.3, LINKS.netTop.z + 0.12), r: 0.55 }
      case 'climb:steps':
        return { at: V(-7.9, 0.45, 1.9), r: 0.3 }
      case 'ride:slide-little':
        return { at: V(-10.1, 0.7, 1.9), r: 0.35 }
      case 'ride:donut':
        return { at: this.built.ring.getWorldPosition(new Vector3()), r: 0.5, glow, prio: 3 }
      case 'ride:zip':
        return { at: this.built.handle.getWorldPosition(new Vector3()).add(V(0, -0.3, 0)), r: 0.35, glow, prio: 3 }
      case 'ride:roller':
        return { at: V(-2.3, 4.6, -3.0), r: 0.45, glow, prio: 3 }
      case 'ride:dragon':
        return { at: V(TOWER.x, LV.top + 0.15, TOWER.z + TOWER.r), r: 0.5, glow, prio: 3 }
      case 'bridge':
        return { at: V((BRIDGE.rect[0] + BRIDGE.rect[1]) / 2, LV.l1 + 0.1, -1.0), r: 0.4 }
      case 'chedi':
        return { at: this.built.chedi.getWorldPosition(new Vector3()).add(V(0, 0.8, 0)), r: 0.45 }
      case 'skypod':
        return { at: V(SKYPOD.x, 0.95, SKYPOD.z + 0.1), r: 0.6 }
      case 'bike':
        return { at: V(BIKE.at[0], 0.6, BIKE.at[1]), r: 0.45 }
    }
    if (id.startsWith('monkey:')) {
      const m = this.toys.monkeys[Number(id.slice(7))]
      return m ? { at: m.root.getWorldPosition(new Vector3()).add(V(0, 0.35, 0)), r: 0.3, prio: 3 } : null
    }
    if (id.startsWith('mask:')) {
      const m = this.built.masks[Number(id.slice(5))]
      return m ? { at: m.head.getWorldPosition(new Vector3()), r: 0.36 } : null
    }
    return null
  }

  /** After a while with nothing touched: the nearest big ride she hasn't had yet. */
  protected hintAt() {
    if (this.walker.busy) return null
    let best: Vector3 | null = null
    let bestD = Infinity
    for (const [anchor, ride] of Object.entries(STICKER_OF)) {
      if (!ride || this.done.has(ride)) continue
      const a = this.anchorAt(anchor)
      const d = a ? a.at.distanceTo(this.kaylee.position) : Infinity
      if (a && d < bestD) {
        bestD = d
        best = a.at
      }
    }
    return best
  }

  qa() {
    const p = this.kaylee.position
    return {
      world: 'harborland',
      section: this.section,
      floor: this.walker.floor.id,
      riding: this.walker.riding?.id ?? null,
      plan: this.walker.plan.join(' '),
      rides: [...this.done],
      pos: [p.x, p.y, p.z].map((n) => Math.round(n * 100) / 100),
      daddyHits: this.toys.hits,
      touches: this.touches,
    }
  }
}

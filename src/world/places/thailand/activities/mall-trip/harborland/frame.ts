// MEGA HarborLand's Big Frame (plan: planning/around-the-world/thailand/mall-trip.md, "The Big Frame"), greybox: the
// frame she walked up to in the hall, at its real size, as a toy with no goal. Climb up, slide down:
//   - It stands in the hall itself (hall/build.ts builds the hall round it, with the same frame model), so she plays in
//     the very frame she saw from the mats: Mommy on her bench, the racing slide next door.
//   - She walks the way she does in Agong's house: tap a spot and she goes, hold a finger and she follows it. A tap on
//     another level finds the way there (trip/walk.ts): she climbs the red wall or a cargo net by herself, crawls the
//     tunnel, and takes a slide down whenever there is one.
//   - Inside: the ball pit with Daddy in it and the cannon (the side game: bonk, the ball on his horn, his big flop),
//     the net bridge (it sags), the net tunnel, the rope course (its logs swing) over the Boomerang Donut's bowl.
//   - The slides: the giant mask's pink nose, the twin-dragon spiral (its rails are two nagas) into the ball pit, the
//     Ta-Khon roller slide over the racing lanes into their balls, the Boomerang Donut, the zip line along the front.
//   - On top: the gold spires and the boxer boy, who watch her; the lit sign on the front (it fades while she climbs
//     behind it).
// Any big ride fills the frame's sticker on her sock band. No voices yet: sounds only. The camera is a dollhouse view
// from the front, a little above, following her up and down; on a tall screen it shows more of the tower.
import { Color, Raycaster, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { clamp, sounds } from '../../../../../../sdk'
import type { Avatar } from '../../../characters/avatar'
import type { Member } from '../../../characters/member'
import type { AnchorInfo } from '../../../engine/Anchors'
import type { Shot } from '../../../engine/camera'
import { TapMarker } from '../../../engine/marker'
import { NavGrid } from '../../../engine/nav'
import { Stage, type AnchorSpot, type LegEvents } from '../../../trip/legs/stage'
import { Walker, type Floor, type Link } from '../../../trip/walk'
import { buildHall } from '../hall/build'
import { Kid, KID_LOOK_LIST, type Move } from '../hall/kids'
import { SOCK_COLORS, wearSocks } from '../socks'
import type { FrameBuilt } from './build'
import { AT_OF, BOXER, BRIDGE, bx, CANNON, DADDY, FLOORS, LINKS, LV, MASK, MASK_BASE, MOMMY, NET_FACE, NET_TUNNEL, NETS, NOSE, NOSE_LAND, NOSE_STEP, OUT_GRID, PIT, RACE_PIT, ROLLER, ROPE, SIGN, SPIRES, STARTS, TOWER, TUNNEL, WALL, ZB, ZF, ZIP_DECK, type At, type FloorId, type LinkId, type Rect, type RideId, type XZ } from './layout'
import { BallPool } from './pool'
import { Rides } from './rides'
import { chaseSign, placeSign } from './sign'
import { frameSfx as sfx } from './sounds'
import { FrameToys } from './toys'

export interface FrameEvents extends LegEvents {
  /** A big ride for the first time: the frame's sticker on her sock band. */
  ride(id: RideId): void
}
export interface FrameStart {
  /** Where she starts (STARTS). */
  at: At
  socks: string
}

export const FRAME_ANCHORS: AnchorInfo[] = [
  { id: 'family:kaylee', label: 'Kaylee', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
  { id: 'pool', label: 'Ball pit', kind: 'thing' },
  { id: 'cannon', label: 'Ball cannon', kind: 'thing' },
  { id: 'climb:wall', label: 'Red climbing wall', kind: 'thing' },
  { id: 'climb:net-a', label: 'Climbing net', kind: 'thing' },
  { id: 'climb:net-b', label: 'Climbing net', kind: 'thing' },
  { id: 'climb:net-c', label: 'Climbing net to the top', kind: 'thing' },
  { id: 'tunnel', label: 'Tunnel', kind: 'thing' },
  { id: 'ride:nose', label: 'The mask nose slide', kind: 'thing' },
  { id: 'ride:dragon', label: 'Twin-dragon spiral slide', kind: 'thing' },
  { id: 'ride:roller', label: 'Ta-Khon roller slide', kind: 'thing' },
  { id: 'ride:donut', label: 'Boomerang Donut', kind: 'thing' },
  { id: 'ride:zip', label: 'Zip line', kind: 'thing' },
  { id: 'bridge', label: 'Net bridge', kind: 'thing' },
  { id: 'rope', label: 'Rope course', kind: 'thing' },
  { id: 'mask', label: 'Giant Phi Ta Khon mask', kind: 'thing' },
  { id: 'boxer', label: 'Muay Thai boxer', kind: 'thing' },
  { id: 'sign', label: 'MEGA HarborLand sign', kind: 'thing' },
  ...[0, 1].map((i): AnchorInfo => ({ id: `naga:${i}`, label: 'Dragon', kind: 'thing' })),
  ...SPIRES.map((_, i): AnchorInfo => ({ id: `spire:${i}`, label: 'Gold spire', kind: 'thing' })),
  ...ROLLER.posts.map((_, i): AnchorInfo => ({ id: `takhon:${i}`, label: 'Phi Ta Khon', kind: 'thing' })),
  ...[0, 1].map((i): AnchorInfo => ({ id: `kid:${i}`, label: 'A kid playing', kind: 'thing' })),
]

/** What each tap target climbs or rides. */
const LINK_OF: Record<string, LinkId> = {
  'climb:wall': 'wall',
  'climb:net-a': 'netA',
  'climb:net-b': 'netB',
  'climb:net-c': 'netC',
  tunnel: 'tunnel',
  'ride:nose': 'nose',
  'ride:dragon': 'dragon',
  'ride:roller': 'roller',
  'ride:donut': 'donut',
  'ride:zip': 'zip',
}
/** The big rides' tap targets (they glow until she's had a go). */
const RIDE_OF: Partial<Record<string, RideId>> = { 'ride:nose': 'nose', 'ride:dragon': 'dragon', 'ride:roller': 'roller', 'ride:donut': 'donut', 'ride:zip': 'zip' }

/** Where the mask's nose slide comes down in front of the frame (x): playing inside behind it, the camera peeks round. */
const NOSE_BAND = [-2.7, 0.6]
const V = (x: number, y: number, z: number) => new Vector3(x, y, z)
const xz = (p: XZ, y: number) => V(p[0], y, p[1])
const tmp = new Vector3()
const inRect = (x: number, z: number, [x0, x1, z0, z1]: Rect, pad = 0) => x > x0 - pad && x < x1 + pad && z > z0 - pad && z < z1 + pad

function grid([x0, x1, z0, z1]: Rect, carve: Rect[], blocks: Rect[] = [], circles: [number, number, number][] = []) {
  const g = new NavGrid(x0, z0, x1, z1, 0.2, 0.22)
  for (const r of carve) g.carve(...r)
  for (const r of blocks) g.block(...r)
  for (const [x, z, r] of circles) g.blockCircle(x, z, r)
  g.commit()
  return g
}

export class BigFrame extends Stage {
  private f: FrameBuilt
  private pool: BallPool
  private racePit: BallPool
  private kaylee: Avatar
  private ji: Member
  private nick: Member
  private toys: FrameToys
  private rides: Rides
  private walker: Walker
  private links: Record<LinkId, Link>
  private marker: TapMarker
  private kids: Kid[]
  /** The big rides she's had this time in (their tap targets stop glowing). */
  private done = new Set<RideId>()
  private at: At
  private lead: { last: number } | null = null
  private vel = new Vector3()
  private lastPos = new Vector3()
  private ray = new Raycaster()
  private signEl: HTMLElement | null = null
  /** The sign fades while she climbs behind it; the nose slide while she plays inside, below the top. */
  private signDim = 1
  private noseGhost = 0
  /** How far the camera has gone down to the ground floor's level view, and round past the nose slide (eased). */
  private low = 0
  private peek = 0
  private signOn = false

  constructor(
    renderer: WebGLRenderer,
    private fev: FrameEvents,
    start: FrameStart,
  ) {
    super(renderer, fev)
    const { scene, bag } = this
    scene.background = new Color('#2E2748')
    this.rig.fov = 32
    this.at = start.at
    // The hall round it, and the frame in it (the frame's own taps, not the hall's "go in").
    const hall = buildHall(bag, true)
    scene.add(hall.root)
    this.f = hall.frame
    this.pool = this.f.pool
    this.racePit = new BallPool(RACE_PIT, 0.3, () => false, bag, { layer: false })
    scene.add(this.racePit.root)

    // ---- The family: Kaylee in her grip socks, Daddy in the ball pit (the cannon's target), Mommy on her bench ----
    const { kaylee, members } = this.makeFamily(['ji', 'nick'])
    this.kaylee = kaylee
    this.ji = members.get('ji')!
    this.nick = members.get('nick')!
    scene.add(kaylee.root, this.ji.root)
    wearSocks(kaylee, SOCK_COLORS[start.socks] ?? SOCK_COLORS.pink, bag)
    this.put(this.ji, MOMMY.at[0], 0.5, MOMMY.at[1], 'sit', MOMMY.face)
    this.toys = new FrameToys(this.f, this.pool, this.nick, scene, bag, { giggle: () => sfx.giggle() })
    this.marker = new TapMarker(bag)
    scene.add(this.marker.root)

    // ---- Where she can walk: one grid per level, and the links between them ----
    const onBridge = (x: number, z: number) => inRect(x, z, BRIDGE.rect, 0.05)
    const onRope = (x: number, z: number) => inRect(x, z, ROPE.rect, 0.02)
    const deck = (i: number, j: number): Rect => [bx(i), bx(j), ZB + 0.08, ZF - 0.08]
    const [bx0, bx1, bz0, bz1] = BRIDGE.rect
    const [rx0, rx1, rz0, rz1] = ROPE.rect
    const T = NET_TUNNEL
    const floors: Floor[] = [
      { id: 'out', y: 0, nav: grid(OUT_GRID.bounds, [OUT_GRID.bounds], OUT_GRID.blocked, OUT_GRID.circles), rects: [FLOORS.out.rect] },
      { id: 'in', y: 0, nav: grid(FLOORS.in.rect, [FLOORS.in.rect], [[TUNNEL.x - TUNNEL.r - 0.05, TUNNEL.x + TUNNEL.r + 0.05, TUNNEL.z1, ZF]], [[CANNON.at[0], CANNON.at[1], 0.36]]), rects: [FLOORS.in.rect] },
      { id: 'pit', y: -0.04, nav: grid(PIT.rect, [PIT.inner], [], [[DADDY.at[0], DADDY.at[1], 0.42]]), rects: [FLOORS.pit.rect] },
      {
        id: 'l1',
        y: LV.l1,
        // (The bridge's strip reaches onto both decks, so the three join up.)
        nav: grid([bx(0), bx(4), ZB, ZF], [deck(0, 1), [bx0 - 0.6, bx1 + 0.6, bz0, bz1], deck(3, 4)]),
        rects: FLOORS.l1.rects,
        lift: (x, z) => (onBridge(x, z) ? this.toys.bridgeLift(x) : 0),
      },
      {
        id: 'l2',
        y: LV.l2,
        nav: grid([bx(0), bx(6), ZB, ZF + 0.6], [deck(0, 1), [T.x0 - 0.6, T.x1 + 0.6, T.z - 0.5, T.z + 0.5], deck(3, 4), [rx0 - 0.6, rx1 + 0.6, rz0, rz1], deck(5, 6), [ZIP_DECK[0], ZIP_DECK[1], ZF - 0.7, ZIP_DECK[3]]]),
        rects: FLOORS.l2.rects,
        lift: (x, z) => (onRope(x, z) ? this.toys.ropeLift(x) : 0),
      },
      {
        id: 'l3',
        y: LV.l3,
        nav: grid([bx(0), bx(6), ZB, ZF], [deck(0, 6)], [MASK_BASE, [NOSE[0][0] - 0.45, NOSE[0][0] + 0.45, NOSE[0][2] - 0.35, ZF], [NOSE_STEP[0] - 0.25, NOSE_STEP[0] + 0.25, NOSE_STEP[2] - 0.28, NOSE_STEP[2] + 0.28]], [[BOXER.x, BOXER.z, 0.36]]),
        rects: FLOORS.l3.rects,
      },
    ]
    this.rides = new Rides(kaylee, this.f, {
      splash: (x, z, power) => {
        const pit = this.racePit.inside(x, z) ? this.racePit : this.pool
        pit.splash(x, z, Math.round(16 * power), power)
        sfx.splash(power)
      },
      passing: (p) => this.toys.passing(p),
    })
    this.links = this.makeLinks()
    const s = STARTS[start.at] ?? STARTS.in
    this.walker = new Walker(kaylee, floors, Object.values(this.links), s.floor)
    this.walker.onFloor = (fl) => {
      const at = AT_OF[fl.id as FloorId]
      if (at && at !== this.at) {
        this.at = at
        this.fev.section(at)
      }
    }
    this.walker.place(s.floor, s.at[0], s.at[1], s.face)
    this.lastPos.copy(kaylee.position)

    // ---- Life: a kid climbing all the way up and down the mask's nose; another going round from the ball pit, up
    //      and across, and down the dragons back into it ----
    const c = this.f.curves
    const up: Move[] = [
      { walk: [-3.1, 0, -0.45] },
      { hop: [-3.1, 0.7, -0.76], dur: 0.45 },
      { hop: [-3.0, LV.l1, -1.7], dur: 0.45 },
      { walk: [NETS.netB.x, LV.l1, -3.45] },
      { hop: [NETS.netB.x, LV.l2, -3.3], dur: 0.7, arc: 0.4 },
      { walk: [bx(1) - 0.1, LV.l2, T.z] },
      { walk: [bx(3) + 0.1, LV.l2, T.z] },
      { walk: [NETS.netC.x, LV.l2, -3.45] },
      { hop: [NETS.netC.x, LV.l3, -3.3], dur: 0.7, arc: 0.4 },
      { walk: [LINKS.nose.at[0], LV.l3, LINKS.nose.at[1]] },
      { hop: NOSE_STEP, dur: 0.35, arc: 0.25 },
      { hop: [NOSE[0][0], NOSE[0][1] + 0.05, NOSE[0][2]], dur: 0.4, arc: 0.3 },
      { slide: c.nose, speed: 4.2 },
      { hop: [0.35, 0, 2.05], dur: 0.4, arc: 0.35 },
      { cheer: 0.9 },
      { walk: [-2.4, 0, 1.0] },
    ]
    const round: Move[] = [
      { walk: [-0.5, -0.04, -3.4] },
      { wait: 0.6 },
      { hop: [bx(3) + 0.2, 0.0, -3.0], dur: 0.45, arc: 0.45 },
      { walk: [NETS.netA.x, 0, -3.45] },
      { hop: [NETS.netA.x, LV.l1, -3.3], dur: 0.7, arc: 0.4 },
      { walk: [bx(3) + 0.3, LV.l1, -2.6] },
      { walk: [bx(1) - 0.3, LV.l1, -2.6] },
      { walk: [NETS.netB.x + 0.3, LV.l1, -3.45] },
      { hop: [NETS.netB.x + 0.3, LV.l2, -3.3], dur: 0.7, arc: 0.4 },
      { walk: [bx(0) + 0.5, LV.l2, -2.4] },
      { wait: 0.4 },
      { walk: [bx(1) - 0.1, LV.l2, T.z] },
      { walk: [bx(3) + 0.1, LV.l2, T.z] },
      { walk: [NETS.netC.x + 0.3, LV.l2, -3.45] },
      { hop: [NETS.netC.x + 0.3, LV.l3, -3.3], dur: 0.7, arc: 0.4 },
      { walk: [LINKS.dragon.at[0], LV.l3, LINKS.dragon.at[1]] },
      { hop: c.dragon.getPointAt(0).toArray() as [number, number, number], dur: 0.4, arc: 0.3 },
      { slide: c.dragon, speed: 4.4 },
      { hop: [-1.6, -0.04, -2.0], dur: 0.4, arc: 0.4 },
      { cheer: 0.8 },
    ]
    this.kids = [new Kid(KID_LOOK_LIST[1], bag, up, 'kid:0', 6), new Kid(KID_LOOK_LIST[2], bag, round, 'kid:1', 0)]
    for (const k of this.kids) scene.add(k.r.root)
  }

  /** Every climb and ride as a link for the walker, played by rides.ts. */
  private makeLinks(): Record<LinkId, Link> {
    const r = this.rides
    const c = this.f.curves
    const L = LINKS
    const award = (id: RideId) => this.award(id)
    const net = (id: 'netA' | 'netB' | 'netC'): Link => {
      const n = NETS[id]
      return { id, ...L[id], twoWay: true, cost: 3, run: (back, done) => r.net(xz(L[id].at, n.from), xz(L[id].end, n.to), NET_FACE, !back, done) }
    }
    const tunnel = [xz(L.tunnel.at, 0), V(TUNNEL.x, 0.04, TUNNEL.z0 - 0.15), V(TUNNEL.x, 0.04, TUNNEL.z1 + 0.05), xz(L.tunnel.end, 0)]
    return {
      wall: { id: 'wall', ...L.wall, twoWay: true, cost: 3, run: (back, done) => r.net(xz(L.wall.at, 0), xz(L.wall.end, LV.l1), WALL.z + 0.08, !back, done) },
      tunnel: {
        id: 'tunnel',
        ...L.tunnel,
        twoWay: true,
        cost: 2.5,
        run: (back, done) => {
          sfx.whoosh(0.5)
          r.crawl(back ? [...tunnel].reverse() : tunnel, done)
        },
      },
      rim: {
        id: 'rim',
        ...L.rim,
        twoWay: true,
        cost: 1.5,
        run: (back, done) => {
          const over = V(PIT.rect[1] - 0.05, PIT.rim + 0.08, (L.rim.at[1] + L.rim.end[1]) / 2)
          if (back) r.hops([over, xz(L.rim.at, 0)], done, 0.32, 0.25)
          else
            r.hops([over, xz(L.rim.end, -0.04)], () => {
              this.pool.splash(L.rim.end[0], L.rim.end[1], 12, 0.9)
              sfx.splash(0.8)
              done()
            }, 0.32, 0.3)
        },
      },
      netA: net('netA'),
      netB: net('netB'),
      netC: net('netC'),
      nose: {
        id: 'nose',
        ...L.nose,
        cost: 1,
        run: (_b, done) =>
          r.hops([V(...NOSE_STEP)], () =>
            r.slide(c.nose, { max: 4.4, accel: 2, land: xz(NOSE_LAND, 0) }, () => {
              award('nose')
              this.ji.react('wave')
              done()
            }),
          ),
      },
      dragon: {
        id: 'dragon',
        ...L.dragon,
        cost: 1,
        run: (_b, done) =>
          r.slide(c.dragon, { max: 4.8, accel: 2.4, land: xz(L.dragon.end, -0.04), balls: true }, () => {
            award('dragon')
            sfx.cheer()
            this.nick.react('wave')
            done()
          }),
      },
      roller: {
        id: 'roller',
        ...L.roller,
        cost: 1,
        run: (_b, done) =>
          r.slide(c.roller, { max: 4.2, accel: 1.4, rattle: true, land: V(...ROLLER.land), balls: true }, () => {
            award('roller')
            r.hops([xz(ROLLER.out, 0)], done, 0.5, 0.55)
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
            this.ji.react('wave')
            done()
          }),
      },
    }
  }

  /** A big ride for the first time this visit: a chime, and the sticker. */
  private award(id: RideId) {
    if (this.done.has(id)) return
    this.done.add(id)
    sfx.chime()
    sounds.sparkle()
    this.fev.ride(id)
  }

  /** The lit sign's letters (HTML: sign.tsx). */
  setSign(el: HTMLElement | null) {
    this.signEl = el
  }

  // ---------------------------------------------------------------- touch

  protected pickRoots(): Object3D[] {
    return [this.kaylee.root, this.ji.root, ...this.toys.pickRoots, ...this.kids.map((k) => k.r.root), ...this.f.picks, this.pool.root]
  }

  pointerDown() {
    super.pointerDown()
    this.lead = { last: 0 }
  }
  /** Held and moved: she follows the finger (re-aimed every 150 ms), onto whatever level it's over. */
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

  /** Walks her over to something (on its own level) and does it there. */
  private goDo(floor: FloorId, at: XZ, then: () => void) {
    const k = this.kaylee.position
    if (this.walker.floor.id === floor && Math.hypot(k.x - at[0], k.z - at[1]) < 1.2 && !this.walker.busy) return then()
    sfx.pop()
    this.walker.goTo(floor, at, then)
  }

  protected onTap(id: string | null, x: number, y: number) {
    const k = this.kaylee
    if (id && LINK_OF[id]) {
      sfx.pop()
      this.walker.ride(this.links[LINK_OF[id]])
      return
    }
    if (id?.startsWith('kid:')) {
      this.kids[Number(id.slice(4))]?.poke()
      sfx.giggle()
      return
    }
    if (id?.startsWith('naga:')) return this.toys.naga(Number(id.slice(5)))
    if (id?.startsWith('spire:')) return this.toys.spire(Number(id.slice(6)))
    if (id?.startsWith('takhon:')) return this.toys.takhonTap(Number(id.slice(7)))
    switch (id) {
      case 'kaylee':
      case 'family:kaylee':
        k.react('hop')
        sfx.giggle()
        if (this.walker.floor.id === 'pit') this.pool.splash(k.position.x, k.position.z, 8, 0.7)
        return
      case 'family:nick':
        return this.toys.daddyTap()
      case 'family:ji':
        this.ji.react('wave')
        sfx.babble(300)
        return
      case 'pool': {
        // Toss the balls where she tapped, and wade (or hop in) over there.
        const hit = this.floorHit(x, y)
        const at: XZ = hit?.floor.id === 'pit' ? hit.at : [-0.6, -2.0]
        if (hit?.floor.id === 'pit' || this.walker.floor.id === 'pit') {
          this.pool.splash(at[0], at[1], 10, 0.8)
          sfx.pop()
        }
        this.walker.goTo('pit', at)
        return
      }
      case 'cannon':
        return this.goDo('in', [CANNON.at[0] + 0.5, CANNON.at[1] + 0.55], () => {
          k.faceToward(CANNON.at[0], CANNON.at[1])
          this.toys.fire()
        })
      case 'bridge':
        return this.toys.bridge()
      case 'rope':
        return this.toys.rope()
      case 'mask':
        return this.toys.mask()
      case 'boxer':
        return this.toys.boxer()
      case 'sign':
        chaseSign(this.signEl)
        sfx.jangle()
        sounds.sparkle()
        return
    }
    // The floor (or a wall in front of one): she walks there, round things and through the links.
    const hit = this.floorHit(x, y)
    if (!hit) return
    if (this.walker.goTo(hit.floor.id, hit.at)) this.marker.show(hit.at[0], hit.floor.y, hit.at[1])
    if (hit.floor.id === 'pit' && this.walker.floor.id === 'pit') this.pool.splash(hit.at[0], hit.at[1], 8, 0.7)
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
    const walking = !this.walker.riding
    this.toys.update(dt, t, kp, { bridge: walking && this.walker.floor.id === 'l1' && inRect(kp.x, kp.z, BRIDGE.rect, 0.05), rope: walking && this.walker.floor.id === 'l2' && inRect(kp.x, kp.z, ROPE.rect, 0.02) })
    for (const kid of this.kids) kid.update(dt, t)
    this.ji.lookAt(kp.x, kp.y + 0.6, kp.z)
    this.ji.update(dt, t)
    this.nick.update(dt, t)
    const d = this.toys.daddy.position
    const wading = this.walker.floor.id === 'pit' || (this.pool.inside(kp.x, kp.z) && kp.y < 0.6)
    const kid = this.kids[1].r.pos
    this.pool.update(dt, [
      { x: kp.x, z: kp.z, r: 0.5, depth: wading ? 1 : 0 },
      { x: d.x, z: d.z, r: 0.6, depth: 1 },
      { x: kid.x, z: kid.z, r: 0.45, depth: kid.y < 0.3 ? 1 : 0 },
    ])
    this.racePit.update(dt, [])
    this.marker.update(dt)
    this.rig.lag = this.rides.kind === 'slide' || this.rides.kind === 'zip' ? 0.22 : 0.35
    this.lights.follow(kp.x, kp.y, kp.z)
    // The sign fades while she's behind it (climbing on the top levels, under its letters).
    const behind = kp.z < ZF - 0.1 && kp.y > SIGN.at[1] - 1.75 && kp.y < SIGN.at[1] + 0.7 && Math.abs(kp.x - SIGN.at[0]) < SIGN.w / 2 + 0.35
    this.signDim += ((behind ? 0.28 : 1) - this.signDim) * (1 - Math.exp(-dt * 6))
    const halo = this.f.halo.material as { opacity: number }
    halo.opacity = 0.6 * this.signDim
    const fl = this.walker.floor.id
    const inside = this.walker.riding?.id !== 'nose' && (fl === 'in' || fl === 'pit' || fl === 'l1' || fl === 'l2' || this.toys.daddyShow)
    this.noseGhost += ((inside ? 1 : 0) - this.noseGhost) * (1 - Math.exp(-dt * 5))
    this.f.noseFade(this.noseGhost)
  }

  // ---------------------------------------------------------------- camera, anchors

  protected shot(): Shot {
    const k = this.kaylee.position
    const tall = this.w < this.h
    // Playing inside, behind the mask's nose slide: the camera leans round to the right to see past it (a peek into
    // the dollhouse). On the dragons' spiral it turns round with her (a little).
    const fl = this.walker.floor.id
    const behindNose = !this.walker.riding && fl !== 'out' && fl !== 'l3' && k.x > NOSE_BAND[0] && k.x < NOSE_BAND[1]
    this.peek += ((behindNose || (this.toys.daddyShow && fl === 'in') ? 1 : 0) - this.peek) * 0.05
    let yaw = 24 * this.peek
    if (this.walker.riding?.id === 'dragon' && this.rides.kind === 'slide' && k.y > 0.8) yaw = clamp(Math.sin(Math.atan2(k.x - TOWER.x, k.z - TOWER.z)) * 22, -22, 22)
    let ahead = clamp(this.vel.x * 0.35, -1.4, 1.4)
    // The cannon: Daddy comes into the picture too.
    if (this.toys.daddyShow && this.walker.floor.id === 'in' && !this.walker.riding) ahead = (this.toys.daddy.position.x - k.x) / 2
    const x = k.x + ahead
    // A little above her on the mats, flatter as she climbs (so the camera stays under the hall's dark ceiling).
    const up = clamp(k.y / LV.l3)
    // (Inside on the ground floor it looks in level, under L1, to see her and Daddy in the balls.)
    const low = !this.walker.riding && (fl === 'in' || fl === 'pit') ? 1 : 0
    this.low += (low - this.low) * 0.06
    const pitch = 18 - 8 * up - 9 * this.low
    if (tall) return { center: V(clamp(x, -2.2, 10.4), clamp(k.y * 0.6 + 1.9, 2.0, 4.8), -1.7), half: V(2.3, 2.5 - 0.3 * up, 1.5), yaw, pitch, minDist: 6 }
    return { center: V(clamp(x, -2.6, 10.0), clamp(k.y + 0.95, 1.35, 5.25) - 0.25 * this.low, -1.8 - 0.4 * this.low), half: V(3.6 - 0.5 * up - 0.7 * this.low, 1.75 - 0.3 * up - 0.3 * this.low, 1.5), yaw, pitch, minDist: 5 }
  }

  protected anchorAt(id: string): AnchorSpot | null {
    const ride = RIDE_OF[id]
    const glow = !!ride && !this.done.has(ride)
    const k = this.kaylee
    const f = this.f
    const world = (o: Object3D, dy = 0) => o.getWorldPosition(new Vector3()).add(V(0, dy, 0))
    switch (id) {
      case 'family:kaylee':
        return { at: tmp.copy(k.position).setY(k.position.y + 0.5).clone(), r: 0.3, max: 120, prio: 1 }
      case 'family:nick':
        return { at: this.toys.daddyHead.add(V(0, -0.2, 0)), r: 0.34, max: 120, prio: 1 }
      case 'family:ji':
        return { at: world(this.ji.root, 0.75), r: 0.34, max: 120, prio: 1 }
      case 'pool':
        return { at: V(-0.55, PIT.balls, -1.7), r: 0.45, max: 120 }
      case 'cannon':
        return { at: V(CANNON.at[0], 0.75, CANNON.at[1]), r: 0.4, prio: 3 }
      case 'climb:wall':
        return { at: V((WALL.x0 + WALL.x1) / 2, 0.75, ZF + 0.15), r: 0.55 }
      case 'climb:net-a':
        return { at: V(NETS.netA.x, 0.75, NET_FACE + 0.1), r: 0.38 }
      case 'climb:net-b':
        return { at: V(NETS.netB.x, LV.l1 + 0.75, NET_FACE + 0.1), r: 0.38 }
      case 'climb:net-c':
        return { at: V(NETS.netC.x, LV.l2 + 0.75, NET_FACE + 0.1), r: 0.38 }
      case 'tunnel':
        return { at: V(TUNNEL.x, TUNNEL.y, TUNNEL.z0 + 0.05), r: 0.5, prio: 2 }
      case 'ride:nose':
        return { at: V(NOSE[1][0], NOSE[1][1], NOSE[1][2]), r: 0.42, glow, prio: 3 }
      case 'ride:dragon':
        return { at: f.curves.dragon.getPointAt(0.04).add(V(0, 0.2, 0)), r: 0.42, glow, prio: 3 }
      case 'ride:roller':
        return { at: f.curves.roller.getPointAt(0.06).add(V(0, 0.2, 0)), r: 0.42, glow, prio: 3 }
      case 'ride:donut':
        return { at: world(f.ring, 0.1), r: 0.45, glow, prio: 3 }
      case 'ride:zip':
        return { at: world(f.handle, -0.25), r: 0.34, glow, prio: 3 }
      case 'bridge':
        return { at: V((BRIDGE.rect[0] + BRIDGE.rect[1]) / 2, LV.l1 + 0.05, BRIDGE.rect[3]), r: 0.4 }
      case 'rope':
        return { at: V((ROPE.rect[0] + ROPE.rect[1]) / 2, LV.l2 + 0.2, ROPE.rect[3]), r: 0.4 }
      case 'mask':
        return { at: V(MASK.x, MASK.y + 0.25, MASK.z + 0.8), r: 0.6, max: 140 }
      case 'boxer':
        return { at: world(f.boxer.head), r: 0.32, prio: 3 }
      case 'sign':
        return this.signOn ? { at: V(SIGN.at[0] + 1.2, SIGN.at[1], SIGN.at[2] + 0.1), r: 0.5, max: 110, prio: 1 } : null
    }
    if (id.startsWith('naga:')) {
      const g = f.nagas[Number(id.slice(5))]
      return g ? { at: world(g, 0.72), r: 0.22, prio: 3 } : null
    }
    if (id.startsWith('spire:')) {
      const g = f.spires[Number(id.slice(6))]
      return g ? { at: world(g, 0.55), r: 0.25 } : null
    }
    if (id.startsWith('takhon:')) {
      const m = f.takhon[Number(id.slice(7))]
      return m ? { at: world(m.head), r: 0.28, prio: 3 } : null
    }
    if (id.startsWith('kid:')) {
      const kid = this.kids[Number(id.slice(4))]
      return kid ? { at: kid.r.pos.clone().setY(kid.r.pos.y + 0.5), r: 0.28, max: 100, prio: 0 } : null
    }
    return null
  }

  placeAnchors() {
    super.placeAnchors()
    placeSign(this.signEl, this.rig.camera, this.w, this.h, true, this.signDim)
    this.signOn = !!this.signEl && this.signEl.style.display !== 'none' && this.signDim > 0.6
  }

  /** After a while with nothing touched: the nearest big ride she hasn't had yet. */
  protected hintAt() {
    if (this.walker.busy) return null
    let best: Vector3 | null = null
    let bestD = Infinity
    for (const [anchor, ride] of Object.entries(RIDE_OF)) {
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

  /** Link ends with no walking path to the level's middle (should be none). */
  private cutOff() {
    const hub: Record<string, XZ> = { out: [2.3, 0.6], in: STARTS.in.at, pit: STARTS.pit.at, l1: [-3.0, -2.0], l2: [1.1, -2.2], l3: [0.6, -2.2] }
    const bad: string[] = []
    for (const l of this.walker.links) {
      for (const [floor, at] of [[l.from, l.at], [l.to, l.end]] as [string, XZ][]) {
        const nav = this.walker.get(floor).nav
        if (!nav.path(hub[floor], at)) bad.push(`${l.id}@${floor}`)
      }
    }
    return bad
  }

  qa() {
    const p = this.kaylee.position
    return {
      world: 'frame',
      at: this.at,
      floor: this.walker.floor.id,
      riding: this.walker.riding?.id ?? null,
      plan: this.walker.plan.join(' '),
      rides: [...this.done],
      pos: [p.x, p.y, p.z].map((n) => Math.round(n * 100) / 100),
      daddyHits: this.toys.hits,
      daddy: this.toys.daddyHead.toArray().map((n) => Math.round(n * 100) / 100),
      cam: this.rig.camera.position.toArray().map((n) => Math.round(n * 10) / 10),
      sign: Math.round(this.signDim * 100) / 100,
      kids: this.kids.map((kid) => [kid.r.pos.x, kid.r.pos.y, kid.r.pos.z].map((n) => Math.round(n * 10) / 10)),
      // Every climb's and ride's ends are on free ground, and each level is one piece (a check for the layout).
      cutOff: this.cutOff(),
      touches: this.touches,
    }
  }
}

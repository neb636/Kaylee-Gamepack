// Koh Samet's green taxi: a songthaew (trip/vehicles/songthaew.ts, painted island green) that drives the concrete
// road round its four stops (layout.ts TAXI_STOPS: Na Dan pier, Sai Kaew, over the spine to Ao Prao, down the middle
// to Ao Wong Duan and back up to the pier), bouncing along, its driver waving each lap. It waits at each stop; the
// island (island.ts) decides who climbs in and out. Called (`driveTo`), it drives straight to any stop: the beach puppy
// calls it to the stop nearest Kaylee, and it takes her straight to the stop nearest his beach (#357 way-finding). Faces +x in its own frame, so its heading turns it by -90°.
import { Group, Vector3 } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { buildAnimal, type Rig } from '../../../../../engine3d/characters/animal'
import { FaceLife } from '../../../../../engine3d/characters/face'
import { TAXI_DRIVER } from '../cast'
import { SAMET_GREEN, buildSongthaew, type Songthaew } from '../../../trip/vehicles/songthaew'
import { TAXI_STOPS, WAYS, type XZ } from './layout'

/** The driver: a sun bear in an island-green shirt (cast.ts). */
const DRIVER_LOOK = TAXI_DRIVER

const road = (id: string) => WAYS.find((w) => w.id === id)!.pts
const nearest = (pts: XZ[], p: XZ) => {
  let best = 0
  let bd = Infinity
  pts.forEach((q, i) => {
    const d = Math.hypot(q.x - p.x, q.z - p.z)
    if (d < bd) {
      bd = d
      best = i
    }
  })
  return best
}
/** The part of a road between the points nearest `a` and `b`, in that order. */
const part = (pts: XZ[], a: XZ, b: XZ) => {
  const i = nearest(pts, a)
  const j = nearest(pts, b)
  return i <= j ? pts.slice(i, j + 1) : pts.slice(j, i + 1).reverse()
}
const N = road('road-nadan')
const W = road('road-prao')
const S = road('road-wongduan')
const north = N[nearest(N, W[0])]
const spine = W[nearest(W, S[0])]
const [nadan, saikaew, prao, wongduan] = TAXI_STOPS.map((s) => s.at)
/** The four legs of its loop when nobody's riding, stop to stop. */
const LEGS: XZ[][] = [
  part(N, nadan, saikaew),
  [...part(N, saikaew, north), ...part(W, north, prao)],
  [...part(W, prao, spine), ...part(S, spine, wongduan)],
  [...part(S, wongduan, spine), ...part(W, spine, north), ...part(N, north, nadan)],
]
/** Each stop's way to the road's north corner (the roads make a tree, so any stop to any other is one up and one
 *  down, with the shared bit cut off). */
const UP: XZ[][] = [part(N, nadan, north), part(N, saikaew, north), part(W, prao, north), [...part(S, wongduan, spine), ...part(W, spine, north)]]
const same = (a: XZ, b: XZ) => Math.hypot(a.x - b.x, a.z - b.z) < 0.5
/** The road from stop `a` straight to stop `b`. */
export function roadBetween(a: number, b: number): XZ[] {
  const up = [...UP[a]]
  const down = [...UP[b]]
  // (Both go up the same way for a while: Ao Prao and Ao Wong Duan share the road from the spine.)
  while (up.length > 1 && down.length > 1 && same(up[up.length - 2], down[down.length - 2])) {
    up.pop()
    down.pop()
  }
  return [...up, ...down.reverse().slice(1)]
}
const lengthOf = (l: XZ[]) => {
  let s = 0
  for (let i = 1; i < l.length; i++) s += Math.hypot(l[i].x - l[i - 1].x, l[i].z - l[i - 1].z)
  return s
}
/** How far the taxi drives from stop `a` to stop `b` (m). */
export const roadLength = (a: number, b: number) => (a === b ? 0 : lengthOf(roadBetween(a, b)))

export type TaxiState = 'wait' | 'drive'

export class Taxi {
  readonly root: Group
  readonly st: Songthaew
  readonly driver: Rig
  /** Which stop it's at (or driving to), and the state. */
  stop = 0
  /** Where it's going next, when someone called it there or it's taking her somewhere (-1: round its loop). */
  next = -1
  /** It just pulled in at a stop (the island reads and clears it). */
  arrived = false
  private leg: XZ[] = []
  private legLen = 0
  state: TaxiState = 'wait'
  /** Meters along the leg, and the speed. */
  s = 0
  speed = 0
  /** Seconds left at the stop (it waits longer while someone is near or aboard; the island sets `hold`). */
  waitT = 6
  hold = false
  heading = 0
  laps = 0
  private bounce = 0
  private bounceV = 0
  private wave = -1
  private last = new Vector3()
  /** His blinks, and his mouth with his own voice ('sunbear'). */
  private life: FaceLife

  constructor(bag: Bag, start = 0) {
    this.st = buildSongthaew(bag, SAMET_GREEN)
    this.root = this.st.root
    this.driver = buildAnimal(DRIVER_LOOK, bag)
    this.driver.root.position.set(this.st.length / 2 - 1.0, 0.55, 0.42)
    this.driver.root.rotation.y = Math.PI / 2
    this.st.body.add(this.driver.root)
    this.life = new FaceLife(this.driver, 'sunbear')
    this.root.userData.pick = 'taxi'
    this.stop = start
    this.leg = [TAXI_STOPS[start].at]
    this.place(this.leg, 0, 0)
  }

  /** Where it waits at stop `i`. */
  static stopAt(i: number) {
    return TAXI_STOPS[i]
  }
  get stopId() {
    return TAXI_STOPS[this.stop].id
  }
  get moving() {
    return this.state === 'drive'
  }
  /** Off it goes: to the stop it was asked to (`next`), or round its loop to the next one. */
  go() {
    if (this.state === 'drive') return
    const to = this.next >= 0 ? this.next : (this.stop + 1) % TAXI_STOPS.length
    this.next = -1
    if (to === this.stop) {
      this.waitT = 6
      return
    }
    this.leg = to === (this.stop + 1) % TAXI_STOPS.length ? LEGS[this.stop] : roadBetween(this.stop, to)
    this.legLen = lengthOf(this.leg)
    this.stop = to
    this.state = 'drive'
    this.s = 0
  }
  /** Drive to stop `i` now (or next, if it's on its way somewhere). */
  driveTo(i: number) {
    this.next = i
    if (this.state === 'wait') this.go()
  }
  honk() {
    this.bounceV += 1.6
  }
  waveHello() {
    this.wave = 0
  }

  update(dt: number, ground: (x: number, z: number) => number, speed: number) {
    this.life.update(dt)
    if (this.state === 'wait') {
      this.speed = 0
      if (!this.hold) this.waitT -= dt
      if (this.waitT <= 0) this.go()
    } else {
      const leg = this.leg
      const len = this.legLen
      // Speed: up to `speed`, slower round the bends and into the stop.
      const ahead = this.pointAt(leg, Math.min(len, this.s + 6))
      const here = this.pointAt(leg, this.s)
      const turn = Math.abs(Math.atan2(Math.sin(Math.atan2(ahead.x - here.x, ahead.z - here.z) - this.heading), Math.cos(Math.atan2(ahead.x - here.x, ahead.z - here.z) - this.heading)))
      const want = Math.min(speed * (1 - Math.min(0.6, turn * 0.9)), Math.max(1.2, (len - this.s) * 0.8))
      this.speed += Math.max(-4 * dt, Math.min(2.5 * dt, want - this.speed))
      this.s += this.speed * dt
      if (this.s >= len) {
        if (this.stop === 0) {
          this.laps++
          this.waveHello()
        }
        this.state = 'wait'
        this.arrived = true
        this.waitT = 7
        this.s = len
      }
    }
    this.place(this.leg, this.s, dt, ground)
    // The bouncy road: a little spring under the body, kicked by the bumps.
    this.bounceV += (-this.bounce * 90 - this.bounceV * 9) * dt + (this.speed > 1 ? (Math.random() - 0.5) * this.speed * 0.9 * dt * 10 : 0)
    this.bounce += this.bounceV * dt
    this.st.body.position.y = this.bounce * 0.06
    this.st.body.rotation.x = this.bounce * 0.02
    for (const w of this.st.wheels) w.rotation.z -= (this.speed * dt) / 0.34
    if (this.wave >= 0) {
      this.wave += dt / 1.4
      const p = Math.min(1, this.wave)
      this.driver.armR.rotation.z = Math.sin(Math.PI * p) * (2.4 + Math.sin(p * Math.PI * 6) * 0.3)
      if (p >= 1) this.wave = -1
    }
  }

  private pointAt(leg: XZ[], s: number): XZ {
    let left = s
    for (let i = 1; i < leg.length; i++) {
      const a = leg[i - 1]
      const b = leg[i]
      const l = Math.hypot(b.x - a.x, b.z - a.z)
      if (left <= l) return { x: a.x + ((b.x - a.x) * left) / (l || 1), z: a.z + ((b.z - a.z) * left) / (l || 1) }
      left -= l
    }
    return leg[leg.length - 1]
  }

  private place(leg: XZ[], s: number, dt: number, ground?: (x: number, z: number) => number) {
    const p = this.pointAt(leg, s)
    const q = this.pointAt(leg, s + 2.2)
    const b = this.pointAt(leg, Math.max(0, s - 2.2))
    const goal = Math.atan2(q.x - b.x, q.z - b.z)
    if (dt === 0 || !ground) this.heading = goal
    else this.heading += Math.atan2(Math.sin(goal - this.heading), Math.cos(goal - this.heading)) * Math.min(1, dt * 5)
    const y = ground ? ground(p.x, p.z) : 0
    this.root.position.set(p.x, y, p.z)
    this.root.rotation.y = this.heading - Math.PI / 2
    if (ground) {
      const f = ground(p.x + Math.sin(this.heading) * 2, p.z + Math.cos(this.heading) * 2)
      const r = ground(p.x - Math.sin(this.heading) * 2, p.z - Math.cos(this.heading) * 2)
      this.root.rotation.z = Math.atan2(f - r, 4)
    }
    this.last.set(p.x, y, p.z)
  }
}

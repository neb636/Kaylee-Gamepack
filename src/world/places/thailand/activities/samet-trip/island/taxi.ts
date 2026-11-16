// Koh Samet's green taxi: a songthaew (trip/vehicles/songthaew.ts, painted island green) waiting by the road at one
// of its four stops (layout.ts TAXI_STOPS: Na Dan pier, Sai Kaew, Ao Prao, Ao Wong Duan), its driver (a sun bear)
// blinking and waving. A picture picked on the board (Board.tsx) and it drives the family up the
// road and in at the stop nearest that beach (island.ts ride(), a little film: drive()); then it waits there. A tap honks it (it bounces on its springs). Faces +x
// in its own frame, so it is turned by -90°.
import type { Group } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { buildAnimal, type Rig } from '../../../../../engine3d/characters/animal'
import { FaceLife } from '../../../../../engine3d/characters/face'
import { TAXI_DRIVER } from '../cast'
import { SAMET_GREEN, buildSongthaew, type Songthaew } from '../../../trip/vehicles/songthaew'
import { TAXI_STOPS } from './layout'
import { pointAt, type Route } from './route'

/** The driver: a sun bear in an island-green shirt (cast.ts). */
const DRIVER_LOOK = TAXI_DRIVER

export class Taxi {
  readonly root: Group
  readonly st: Songthaew
  readonly driver: Rig
  /** Which stop it waits at. */
  stop = 0
  private bounce = 0
  private bounceV = 0
  private wave = -1
  /** His blinks, and his mouth with his own voice ('sunbear'). */
  private life: FaceLife

  constructor(bag: Bag, start = 0) {
    this.st = buildSongthaew(bag, SAMET_GREEN)
    this.root = this.st.root
    this.driver = buildAnimal(DRIVER_LOOK, bag)
    this.driver.root.position.set(this.st.length / 2 - 1.0, 0.3, 0.42)
    this.driver.root.rotation.y = Math.PI / 2
    this.st.body.add(this.driver.root)
    this.life = new FaceLife(this.driver, 'sunbear')
    this.root.userData.pick = 'taxi'
    this.park(start)
  }

  /** Where it waits at stop `i`. */
  static stopAt(i: number) {
    return TAXI_STOPS[i]
  }
  get stopId() {
    return TAXI_STOPS[this.stop].id
  }
  /** Parked at stop `i` at once (the end of a ride, or a link), nose along
   *  +z, tipped to the slope of the road. */
  park(i: number, ground?: (x: number, z: number) => number) {
    this.stop = i
    const p = TAXI_STOPS[i].at
    this.root.position.set(p.x, ground ? ground(p.x, p.z) : 0, p.z)
    this.root.rotation.set(0, -Math.PI / 2, ground ? Math.atan2(ground(p.x, p.z + 2) - ground(p.x, p.z - 2), 4) : 0)
  }
  /** Driving: at `s` m along `road` (from its stop inland), heading inland (`dir` 1) or toward the stop (-1), tipped
   *  to the slope; the wheels turn with the distance. */
  drive(road: Route, s: number, dir: 1 | -1, ground: (x: number, z: number) => number) {
    const p = pointAt(road, s)
    const q = pointAt(road, s + dir * 1.5)
    const dx = q.x - p.x
    const dz = q.z - p.z
    const y = ground(p.x, p.z)
    const run = Math.hypot(dx, dz) || 1
    this.root.position.set(p.x, y, p.z)
    this.root.rotation.set(0, Math.atan2(dx, dz) - Math.PI / 2, Math.atan2(ground(q.x, q.z) - y, run))
    for (const w of this.st.wheels) w.rotation.z = -s * dir / 0.34
  }
  honk() {
    this.bounceV += 1.6
  }
  waveHello() {
    this.wave = 0
  }

  update(dt: number) {
    this.life.update(dt)
    // A little spring under the body, kicked by a honk.
    this.bounceV += (-this.bounce * 90 - this.bounceV * 9) * dt
    this.bounce += this.bounceV * dt
    this.st.body.position.y = this.bounce * 0.06
    this.st.body.rotation.x = this.bounce * 0.02
    if (this.wave >= 0) {
      this.wave += dt / 1.4
      const p = Math.min(1, this.wave)
      this.driver.armR.rotation.z = Math.sin(Math.PI * p) * (2.4 + Math.sin(p * Math.PI * 6) * 0.3)
      if (p >= 1) this.wave = -1
    }
  }
}

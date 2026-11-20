// The film set for the bike chapter (story/films/bike.ts): Mont-Sainte-Anne, the very mountain the game rides down
// (activities/bike/mountain.ts builds it for both), on a sunny fall day. Two spots on it:
//
// - `top`: the top of the trail, just below the gondola's top station, where Maple waits with her bike. Its -z runs
//   down the trail, so the usual camera (on +z, looking toward -z) has the whole mountain falling away behind her:
//   the forest, the river, and far, far below, the waterfall's pool with a tiny moose in it.
// - `pool`: the pool under the waterfall at the bottom. Its middle is the pool's middle and its -z runs toward the
//   falls, so the usual camera stands in the meadow with the falls behind whoever is in the water. A spruce on the
//   bank reaches a bough out over the water (a pinecone hangs on it).
//
// A spot turns its own x, y (meters above its ground) and z into the world: `top.p(x, y, z)` for a shot's point,
// `top.place(actor, x, z, face)` to stand someone on the ground there, facing `face` degrees (0: toward the camera).
// Maple's bike (activities/bike/rider.ts) is here too: parked with nobody on it, or ridden down the trail (`ride`).
import { Group, Vector3 } from 'three'
import type { V3 } from '../../../../engine3d/film'
import { merge, P, solid } from '../../../../engine3d/geo'
import { Mountain } from '../../activities/bike/mountain'
import { pinecone } from '../../activities/bike/monty'
import { Rider } from '../../activities/bike/rider'
import { FALL, SKY } from '../../activities/bike/scenery'
import { Course, half, phi, POOL } from '../../activities/bike/trail'
import type { Performer } from '../../characters/toy'
import type { FilmSet } from '../stage'

const DEG = Math.PI / 180

/** A spot on the mountain with its own directions: x to the right and -z away, as the usual camera sees it. */
export class Spot {
  private c: number
  private s: number
  constructor(
    readonly o: Vector3,
    /** How far its -z is turned from the world's (radians). */
    readonly yaw: number,
    private ground: (x: number, z: number) => number,
  ) {
    this.c = Math.cos(yaw)
    this.s = Math.sin(yaw)
  }
  /** World x, z of a point here. */
  xz(x: number, z: number): [number, number] {
    return [this.o.x + x * this.c + z * this.s, this.o.z - x * this.s + z * this.c]
  }
  /** The ground's height at a point here, in the world. */
  y(x: number, z: number) {
    const [wx, wz] = this.xz(x, z)
    return this.ground(wx, wz)
  }
  /** A point `y` meters above the ground here (or at the spot's own height with `abs`), in the world. */
  p(x: number, y: number, z: number, abs = false): V3 {
    const [wx, wz] = this.xz(x, z)
    return [wx, (abs ? this.o.y : this.ground(wx, wz)) + y, wz]
  }
  v(x: number, y: number, z: number, abs = false) {
    return new Vector3(...this.p(x, y, z, abs))
  }
  /** World degrees for a facing here (0: toward the usual camera). */
  face(deg: number) {
    return deg + this.yaw / DEG
  }
  /** Stands someone on the ground here (or `dy` above or below it). */
  place(a: Performer, x: number, z: number, face = 0, dy = 0) {
    const [wx, wz] = this.xz(x, z)
    return a.place(wx, this.ground(wx, wz) + dy, wz, this.face(face))
  }
}

export interface MountainSet {
  mtn: Mountain
  course: Course
  top: Spot
  pool: Spot
  /** Maple's bike: parked (`bike.alone(true)`), or Maple riding it. */
  bike: Rider
  /** Riding down the trail: `s` along it (m), `v` how fast (m/s). Null: the bike stands where it was put. */
  ride: { s: number; v: number; lat: number } | null
  /** The spruce bough over the pool, and its pinecone (the films drop it). */
  cone: Group
  /** Where the pinecone hangs. */
  coneAt: Vector3
  /** High over the top of the trail, behind where Maple stands: the lowest point from which the line of sight clears
   *  the trees all the way down to the pool (the look down the mountain), and the pool's middle. */
  lookout: Vector3
  poolAt: Vector3
  /** Monty, once a film has put him in his bath (he chews, the set keeps his jaw going). */
  monty: { chew(t: number): void } | null
}

/** Where the top spot is: a little way down the trail from the station's door. */
const TOP_S = 6
/** The pool's own directions: -z toward the falls. */
const POOL_YAW = (s: number) => -phi(s)

export const MOUNTAIN: FilmSet<MountainSet> = {
  id: 'bike',
  look: { sky: ['#8CC8F2', '#B9DBF5', SKY], fog: [SKY, 260, 2400], clouds: false },
  build(s, root) {
    const course = new Course()
    const mtn = new Mountain(course, s.bag)
    root.add(mtn.group)
    // (The far hills and the river are well past the stage's usual far plane.)
    s.rig.camera.far = 3200
    s.rig.camera.updateProjectionMatrix()
    const t = course.trail
    const land = (x: number, z: number) => course.land(x, z)
    const tp = t.spot(TOP_S, 0)
    const top = new Spot(new Vector3(tp.x, course.ground(TOP_S, 0), tp.z), POOL_YAW(TOP_S), (x, z) => {
      const l = t.locate(x, z)
      return Math.abs(l.lat) < half(l.s) + 2 ? course.ground(l.s, l.lat) : course.land(x, z)
    })
    const pool = new Spot(new Vector3(course.pool.x, course.poolY, course.pool.z), POOL_YAW(POOL.s), land)
    const poolAt = new Vector3(course.pool.x, course.poolY + 1, course.pool.z)
    // Up and up until nothing stands between the camera and the pool (the trees are up to about 12 m tall).
    const lookout = top.v(2.2, 3, 4)
    for (let h = 3; h < 90; h += 1.5) {
      lookout.copy(top.v(2.2, h, 4))
      let clear = true
      for (let i = 1; i < 240 && clear; i++) {
        const k = i / 240
        const x = lookout.x + (poolAt.x - lookout.x) * k
        const z = lookout.z + (poolAt.z - lookout.z) * k
        const y = lookout.y + (poolAt.y - lookout.y) * k
        // (The last stretch is the open meadow and the pool itself.)
        if (k < 0.93 && course.land(x, z) + 13 > y) clear = false
      }
      if (clear) break
    }

    const bike = new Rider(s.bag)
    bike.alone(true)
    bike.root.visible = false
    root.add(bike.root)

    // The spruce on the pool's right bank, one long bough reaching out over the water, a pinecone hanging off it.
    const tree = new Group()
    const [bx, bz] = pool.xz(6.6, 9.4)
    const by = course.land(bx, bz)
    const parts = [P.cyl(0.24, 0.32, 3.4, '#7E553E', { at: [0, 1.7, 0] }, 8)]
    for (let i = 0; i < 4; i++) parts.push(P.cone(2.1 - i * 0.42, 2.2, i % 2 ? '#4FA474' : '#3F8F63', { at: [0, 2.6 + i * 1.25, 0] }, 9))
    // The bough: toward the pool's middle (local -x), a little down, needles along it.
    const reach = 4.6
    parts.push(P.cyl(0.07, 0.12, reach, '#7E553E', { at: [-reach / 2, 4.1, 0], rot: [0, 0, Math.PI / 2 + 0.08] }, 6))
    for (let i = 0; i < 6; i++) parts.push(P.cone(0.55 - i * 0.05, 0.9, i % 2 ? '#4FA474' : '#46986A', { at: [-0.7 - i * 0.68, 3.95 - i * 0.03, (i % 2 ? 0.18 : -0.18)], rot: [0, 0, Math.PI / 2 + 0.25] }, 7))
    tree.add(solid(merge(parts), s.bag, 1.8))
    tree.position.set(bx, by, bz)
    // (Its local -x points at the middle of the pool's near water.)
    const [mx, mz] = pool.xz(1.4, 9.6)
    tree.rotation.y = Math.atan2(mz - bz, -(mx - bx))
    root.add(tree)
    tree.updateMatrixWorld(true)
    const coneAt = tree.localToWorld(new Vector3(-reach + 0.35, 3.82, 0))
    const cone = pinecone(s.bag, 0.2)
    cone.position.copy(coneAt)
    root.add(cone)

    // Fall leaves in the pool, drifting: a few red and gold ones on the water.
    const leaves = []
    for (let i = 0; i < 9; i++) {
      const [lx, lz] = pool.xz(-6 + ((i * 3.7) % 11), 2 + ((i * 2.3) % 8))
      leaves.push(P.cyl(0.16, 0.16, 0.02, [FALL.red, FALL.gold, FALL.orange][i % 3], { at: [lx, course.poolY + 0.02, lz], scale: [1.3, 1, 0.8], rot: [0, i, 0] }, 7))
    }
    root.add(solid(merge(leaves), s.bag, 0))

    return { mtn, course, top, pool, bike, ride: null, cone, coneAt, lookout, poolAt, monty: null }
  },
  update(set, dt, t, s) {
    set.mtn.update(dt, t, s.rig.camera.position)
    const r = set.ride
    const b = set.bike
    if (r && b.root.visible) {
      // Down the trail, leaning into the bends like the game's bike (only simpler: on the line she's given).
      const c = set.course
      r.s += r.v * dt
      const p = c.trail.spot(r.s, r.lat)
      b.root.position.set(p.x, c.ground(r.s, r.lat), p.z)
      b.root.rotation.y = Math.PI - phi(r.s)
      const pitch = Math.atan((c.ground(r.s - 0.6, r.lat) - c.ground(r.s + 0.6, r.lat)) / 1.2)
      b.lean.rotation.set(pitch, 0, 0)
    }
    if (b.root.visible) b.update(dt, t, { speed: r?.v ?? 0, pedal: r && r.v > 0.5 ? 1 : 0, squash: 0, air: 0, steer: 0 })
    set.monty?.chew(t)
  },
}

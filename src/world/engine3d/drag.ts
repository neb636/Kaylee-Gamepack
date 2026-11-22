// Drag-to-place in a 3D world, shared: a finger carries a thing over the scene on an upright plane facing the camera
// (so it passes in front of whoever it is going to, never into them), lets go near one of a few slots (a friend's head,
// a friend's chest) and the thing snaps there, or a tap sends it flying along a little arc (the Thailand wardrobe's
// fly-on, which keeps its own private copy for now). Canada's Team Cabin is the first to use it.
//
//   const plane = new DragPlane()
//   plane.through(camera, friend.head())                // the plane the dragged hat rides on
//   plane.at(camera, x, y, w, h, hat.position)          // where the finger is on it
//   const near = nearestSlot(slots, x, y, 90)            // the slot under her finger, on screen
//   flights.add(hat, from, to, { dur: 0.45, arc: 0.3, then: () => wear() })
import { Plane, Raycaster, Vector2, Vector3, type Camera, type Object3D } from 'three'

const ndc = new Vector2()
const n = new Vector3()

/** Where a screen point (CSS px from the canvas's top left) is in normalized device coordinates. */
export function toNdc(x: number, y: number, w: number, h: number, out = ndc) {
  return out.set((x / w) * 2 - 1, -(y / h) * 2 + 1)
}

/** Where a world point is on screen (CSS px), and its depth (z > 1: behind the camera). */
export function toScreen(p: Vector3, camera: Camera, w: number, h: number) {
  const v = p.clone().project(camera)
  return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, z: v.z }
}

/** An upright plane facing the camera through a point: a dragged thing rides on it under her finger. */
export class DragPlane {
  readonly plane = new Plane()
  private ray = new Raycaster()
  /** Faces the camera (level: its normal is the camera's facing, flat on the floor) through `p`. */
  through(camera: Camera, p: Vector3) {
    camera.getWorldDirection(n).setY(0)
    if (n.lengthSq() < 1e-6) n.set(0, 0, -1)
    n.normalize()
    this.plane.setFromNormalAndCoplanarPoint(n, p)
    return this
  }
  /** Where the finger at (x, y) is on the plane (null: the ray runs alongside it). */
  at(camera: Camera, x: number, y: number, w: number, h: number, out = new Vector3()) {
    this.ray.setFromCamera(toNdc(x, y, w, h), camera)
    return this.ray.ray.intersectPlane(this.plane, out)
  }
}

export interface Slot<K> {
  key: K
  /** On screen, CSS px. */
  x: number
  y: number
  /** A slot of its own size: within this many px it counts whatever the snap radius is. */
  r?: number
}

/** The slot nearest a screen point, if one is within `radius` px (or its own `r`). */
export function nearestSlot<K>(slots: Slot<K>[], x: number, y: number, radius: number): { key: K; d: number } | null {
  let best: { key: K; d: number } | null = null
  for (const s of slots) {
    const d = Math.hypot(s.x - x, s.y - y)
    if (d > Math.max(radius, s.r ?? 0)) continue
    if (!best || d < best.d) best = { key: s.key, d }
  }
  return best
}

export interface FlightOpts {
  /** Seconds. */
  dur?: number
  /** How high the middle of the flight lifts (meters). */
  arc?: number
  /** Its scale at the start and at the end (it grows or shrinks on the way). */
  scaleFrom?: number
  scaleTo?: number
  /** Turns round once on the way (radians about y). */
  spin?: number
  /** Called when it lands. */
  then?: () => void
}

interface Flight {
  obj: Object3D
  from: Vector3
  to: Vector3
  t: number
  dur: number
  arc: number
  s0: number
  s1: number
  spin: number
  yaw: number
  then?: () => void
}

/** Things flying from one point to another along an eased arc (in world space: fly things that sit in the scene). */
export class Flights {
  private list: Flight[] = []
  /** Sends `obj` from `from` to `to` (world points; `obj` should be a child of the scene). One flight per thing: a new one
   *  replaces the old. */
  add(obj: Object3D, from: Vector3, to: Vector3, o: FlightOpts = {}) {
    this.cancel(obj)
    obj.position.copy(from)
    obj.visible = true
    this.list.push({ obj, from: from.clone(), to: to.clone(), t: 0, dur: Math.max(0.05, o.dur ?? 0.45), arc: o.arc ?? 0.3, s0: o.scaleFrom ?? obj.scale.x, s1: o.scaleTo ?? o.scaleFrom ?? obj.scale.x, spin: o.spin ?? 0, yaw: obj.rotation.y, then: o.then })
  }
  cancel(obj: Object3D) {
    this.list = this.list.filter((f) => f.obj !== obj)
  }
  has(obj: Object3D) {
    return this.list.some((f) => f.obj === obj)
  }
  get busy() {
    return this.list.length > 0
  }
  update(dt: number) {
    for (const f of [...this.list]) {
      f.t = Math.min(1, f.t + dt / f.dur)
      const e = f.t * f.t * (3 - 2 * f.t)
      f.obj.position.lerpVectors(f.from, f.to, e).y += Math.sin(Math.PI * f.t) * f.arc
      f.obj.scale.setScalar(f.s0 + (f.s1 - f.s0) * e)
      if (f.spin) f.obj.rotation.y = f.yaw + f.spin * e
      if (f.t >= 1) {
        this.list.splice(this.list.indexOf(f), 1)
        f.then?.()
      }
    }
  }
  clear() {
    this.list = []
  }
}

// The story's trail on the globe: a dotted line down the Atlantic from the North Pole to the South Pole (the way the
// red ship came up, story/stage.ts `sail`), a little flag at each stop, and Sparkle's balloon (story/props.ts, the one
// in the films) floating over the next stop. The dots she has already travelled are gold, like a finished stop's flag;
// the way ahead is pink. As stamps come in the balloon is further down the world.
import { Euler, Group, Quaternion, Vector3, type BufferGeometry } from 'three'
import { bell, wobble } from '../../../../sdk'
import { merge, P } from '../../../engine3d/geo'
import { PAL } from '../../../engine3d/toon'
import { Balloon } from '../story/props'
import { ll } from './earth'
import type { GlobeHost } from './extras'
import { hubSfx } from './sounds'

/** The trail's meridian. */
export const TRAIL_LON = -28
/** The line runs between these latitudes (just short of each pole). */
const TOP = 80
const BOTTOM = -80
/** The balloon's size on the globe (story/props.ts builds it about 6 m tall), and how high it floats over a stop. */
const BALLOON = { scale: 0.034, lift: 0.075, bob: 0.012 }
/** The balloon's envelope stays at least this far from the Earth's center (so it never dips into the globe when its
 *  stop is on the globe's edge). */
const CLEAR = 1.17

export interface TrailStop {
  lat: number
  done: boolean
  /** The last stop: home, near the South Pole. */
  home?: boolean
}

const UP = new Vector3(0, 1, 0)
const tmp = new Vector3()
const tmp2 = new Vector3()
const tq = new Quaternion()

/** Euler angles that turn +y to point along `dir`. */
function upTo(dir: Vector3): [number, number, number] {
  const e = new Euler().setFromQuaternion(new Quaternion().setFromUnitVectors(UP, tmp2.copy(dir).normalize()))
  return [e.x, e.y, e.z]
}

export class GlobeTrail {
  private balloon: Balloon
  private holder = new Group()
  private pokeT = -1
  private at: number

  constructor(
    private host: GlobeHost,
    stops: TrailStop[],
    /** The stop the balloon floats over. */
    next: number,
  ) {
    const nextLat = stops[next]?.lat ?? TOP
    this.at = nextLat
    // The dotted line: flat round dots lying on the sea and the ice.
    const dots: BufferGeometry[] = []
    for (let lat = TOP; lat >= BOTTOM; lat -= 3.4) {
      // (Not under a flag.)
      if (stops.some((s) => Math.abs(s.lat - lat) < 1.6)) continue
      const p = ll(lat, TRAIL_LON, this.top(lat))
      dots.push(P.cyl(0.0115, 0.0115, 0.006, lat > nextLat ? PAL.gold : PAL.hotpink, { at: [p.x, p.y, p.z], rot: upTo(p) }, 10))
    }
    host.spin.add(host.prop(merge(dots), 1.2))

    // A flag at each stop: on a little cake of ice, gold once its stamp is in, pink until then; home's is taller, with
    // a heart on top.
    const flags: BufferGeometry[] = []
    stops.forEach((s) => {
      const h = s.home ? 0.105 : 0.075
      const color = s.done ? PAL.gold : s.home ? '#FF6B8A' : PAL.hotpink
      const parts = [
        P.cyl(0.03, 0.034, 0.012, '#F4FBFF', { at: [0, 0.006, 0] }, 9),
        P.cyl(0.0045, 0.0045, h, '#FFFFFF', { at: [0, 0.012 + h / 2, 0] }, 6),
        P.prism([[0, 0], [0.05, -0.015], [0, -0.03]], 0.005, color, { at: [0.004, 0.012 + h, 0] }),
      ]
      if (s.home) parts.push(P.sphere(0.012, '#FF4F7B', { at: [-0.007, h + 0.026, 0] }), P.sphere(0.012, '#FF4F7B', { at: [0.007, h + 0.026, 0] }), P.cone(0.0165, 0.02, '#FF4F7B', { at: [0, h + 0.012, 0], rot: [Math.PI, 0, 0] }, 8))
      else parts.push(P.sphere(0.009, s.done ? PAL.gold : '#FFFFFF', { at: [0, 0.012 + h + 0.006, 0] }))
      const p = ll(s.lat, TRAIL_LON, this.top(s.lat) - 0.004)
      const flag = merge(parts)
      // Its flag flies along the screen when the trail faces her (the pennant points east).
      flag.rotateY(-Math.PI / 2)
      const [x, y, z] = upTo(p)
      flag.applyQuaternion(new Quaternion().setFromEuler(new Euler(x, y, z)))
      flag.translate(p.x, p.y, p.z)
      flags.push(flag)
    })
    if (flags.length) host.spin.add(host.prop(merge(flags), 1.5))

    this.balloon = new Balloon(host.bag)
    this.balloon.root.scale.setScalar(BALLOON.scale)
    this.holder.add(this.balloon.root)
    host.spin.add(this.holder)
  }

  /** The top of whatever is at this latitude on the trail (the sea, the floes round each pole, Antarctica's dome). */
  private top(lat: number) {
    const ice = (lat > 67 && lat <= 77) || (lat < -60 && lat >= -68)
    return (ice ? 1.026 : this.host.ground(lat)) + 0.006
  }

  /** A tap on the balloon: its burner puffs and it jumps. */
  poke() {
    this.pokeT = 0
    hubSfx.burner()
  }
  get busy() {
    return this.pokeT >= 0
  }

  tick(dt: number, t: number) {
    this.balloon.update(dt, t)
    let jump = 0
    let puff = 1
    if (this.pokeT >= 0) {
      this.pokeT += dt
      jump = 0.05 * bell(Math.min(1, this.pokeT / 0.7))
      puff = 1 + 0.16 * wobble(this.pokeT / 0.8, 2)
      if (this.pokeT > 0.8) this.pokeT = -1
    }
    this.balloon.root.scale.setScalar(BALLOON.scale * puff)
    const { spin, camera } = this.host
    const pos = ll(this.at, TRAIL_LON, this.top(this.at) + BALLOON.lift + jump + BALLOON.bob * Math.sin(t * 1.3), this.holder.position)
    // It hangs upright on the screen wherever the globe is turned (not out along the ground: at a pole seen from the
    // side it would lie flat), and floats a little toward her when its stop is on the globe's edge.
    const up = tmp.set(0, 1, 0).applyQuaternion(spin.getWorldQuaternion(tq).invert())
    this.holder.quaternion.setFromUnitVectors(UP, up)
    const c = tmp2.copy(pos).addScaledVector(up, 3.6 * BALLOON.scale)
    const d = spin.worldToLocal(tmp.copy(camera.position)).normalize()
    const b = c.dot(d)
    const gap = c.lengthSq() - CLEAR * CLEAR
    if (gap < 0) pos.addScaledVector(d, -b + Math.sqrt(b * b - gap))
  }

  /** Where the balloon's tap target goes (the middle of its envelope), and whether it's on her side of the globe. */
  spot(out: Vector3): { facing: number; size: number } {
    this.holder.localToWorld(out.set(0, 3.2 * BALLOON.scale, 0))
    return { facing: tmp.copy(out).normalize().dot(tmp2.subVectors(this.host.camera.position, out).normalize()), size: 0.3 }
  }

  qa() {
    return { balloonLat: this.at }
  }
}

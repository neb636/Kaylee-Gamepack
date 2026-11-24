// A unicorn sculpted in more detail for the shared chibi rig (`Look.sculpted` on a unicorn: Dad), so he sits beside
// the modelled Kaylee and Mom (vinyl toys, places/thailand/characters/model.ts) as one family. The plain unicorn is a
// ball with two cones, a cream muzzle and a cap of balls; this one has a round face with full cheeks and no muzzle (a
// little pink nose instead), cupped ears with a soft tip like Kaylee's and Mom's, one smooth mane swept into chunky
// locks over the forehead with a lavender streak, a twisted gold horn, and a tail that curls up like theirs. His eyes
// and open smile stay the rig's (animal.ts draws them). Head coordinates are in head radii R, the tail's in body
// heights H.
import { Vector3, type BufferGeometry } from 'three'
import { smoothstep as smooth } from '../../../sdk/math'
import { P, placeMatrix, sculpt, type V3 } from '../geo'
import type { Frame } from './animal'
import { painted } from './fox'
import type { Look } from './look'

const NOSE = '#F58FAE'
const HORN = '#FFC23D'
const HORN_GROOVE = '#E0881C'

/** How the head ball is squashed: full cheeks low down (a little wider below the eyes), a touch shorter. */
const headShape = (p: Vector3) => {
  const low = smooth(0.2, -0.6, p.y)
  p.x *= 1.02 + 0.07 * low
  p.z *= 1 + 0.03 * low
  p.y *= 0.98
}

/** An ear's shape from a ball: wide low down, a soft rounded tip, thin, and cupped (its edges come forward). */
const earShape = (p: Vector3) => {
  const t = (p.y + 1) / 2
  p.x *= 1.1 - 0.55 * t ** 1.5
  p.z = p.z * 0.3 * (1 - 0.4 * t) + 0.26 * p.x * p.x
}

/** How far down the mane comes at each angle round the head (0 = the middle of the forehead, π = the back), as a
 *  height on the unit head: a fringe over the brow, swept to one side, up round the ears, then down to the nape. */
const HAIRLINE: [number, number][] = [[0, 0.44], [0.5, 0.5], [0.95, 0.36], [1.3, 0.05], [1.8, -0.2], [2.4, -0.45], [Math.PI, -0.52]]
function hairline(phi: number) {
  for (let i = 1; i < HAIRLINE.length; i++) {
    const [a0, y0] = HAIRLINE[i - 1]
    const [a1, y1] = HAIRLINE[i]
    if (phi <= a1) return y0 + (y1 - y0) * smooth(a0, a1, phi)
  }
  return HAIRLINE[HAIRLINE.length - 1][1]
}

/** Where on the mane (turn round the head, height) the lavender streak runs: one band over his right brow, up and back. */
const streak = (turn: number, y: number) => turn > 0.3 && turn < 0.62 + 0.25 * Math.max(0, -y)

/** The mane's surface, in head radii from the middle of the head, in direction `d` (a unit vector): under the skin
 *  below the hairline, a smooth thick mane above it in chunky locks, fuller on top, the fringe ending in soft points
 *  that all sweep the same way. */
function maneRadius(d: Vector3) {
  const turn = Math.atan2(d.x, d.z)
  const phi = Math.abs(turn)
  const front = 1 - smooth(0.9, 1.25, phi)
  // (The fringe comes a little lower on his left and ends in four rounded points leaning right.)
  const saw = (((turn * 1.55 + 0.2) % 1) + 1) % 1
  const point = Math.sin(Math.PI * saw ** 0.7)
  const line = hairline(phi) - 0.06 * turn * front - 0.13 * point * front
  const h = smooth(line - 0.04, line + 0.12, d.y)
  const top = Math.max(0, d.y)
  // Chunky locks: soft ridges running from the crown down.
  const locks = 0.026 * Math.abs(Math.sin(turn * 4.5 + d.y * 1.2))
  return 0.96 + h * (0.11 + 0.04 * top * top + locks)
}

/** The twisted horn, standing on its base at the origin pointing up (`R` the head radius): a cone of gold with a
 *  groove spiraling round it three times, rounded at the tip. The salon's snippable horn is the same one. */
export function unicornHorn(R: number) {
  const groove: boolean[] = []
  return painted(HORN, 36, (p) => {
    const t = (p.y + 1) / 2
    const ring = Math.hypot(p.x, p.z)
    const a = Math.atan2(p.z, p.x)
    const twist = Math.cos(a - t * Math.PI * 2 * 3)
    groove.push(twist > 0.35)
    const r = Math.sqrt(Math.min(1, t * 10)) * (1 - t) ** 0.85 * (1 + 0.2 * twist * (1 - t) ** 0.5)
    if (ring > 1e-6) {
      p.x *= r / ring
      p.z *= r / ring
    }
    p.y = t
  }, (_, i) => (groove[i] ? HORN_GROOVE : null), { scale: [0.19 * R, 0.95 * R, 0.19 * R] })
}

export function unicornHead(look: Look, f: Frame) {
  const { R, headY } = f
  const at = (x: number, y: number, z: number): V3 => [R * x, headY + R * y, R * z]
  const mane = look.mane ?? [look.fur]
  const outlined: BufferGeometry[] = [sculpt(look.fur, 48, headShape, { at: at(0, 0, 0), scale: [R, R, R] })]
  const plain: BufferGeometry[] = []
  /** The locks at the nape: the rig's mane group, so the wind swings them and the barber's strands can take their place. */
  const locks: BufferGeometry[] = []

  // A little pink nose, rounded, a shade wider than tall.
  outlined.push(sculpt(NOSE, 20, (p) => {
    p.x *= 1 + 0.2 * p.y
  }, { at: at(0, -0.22, 0.965), scale: [0.085 * R, 0.06 * R, 0.05 * R] }))
  plain.push(P.sphere(0.02 * R, '#FFFFFF', { at: at(-0.03, -0.195, 1.01), scale: [1.4, 0.7, 0.4] }))

  for (const s of [-1, 1]) {
    // Upright ears with a soft tip, set wide on top of the head and leaning out: fur outside, pink inside.
    const lean: V3 = [-0.12, s * 0.32, -s * 0.4]
    outlined.push(sculpt(look.fur, 32, earShape, { at: at(s * 0.68, 0.84, -0.06), rot: lean, scale: [0.38 * R, 0.5 * R, 0.38 * R] }))
    plain.push(sculpt(look.ear ?? look.light, 24, earShape, { at: at(s * 0.672, 0.8, 0.02), rot: lean, scale: [0.24 * R, 0.34 * R, 0.24 * R] }))
  }

  // The horn, set into the mane at the top of the forehead.
  outlined.push(unicornHorn(R).applyMatrix4(placeMatrix({ at: at(0, 0.72, 0.14), rot: [0.28, 0, 0] })))

  // ---- The mane: one smooth shell over the head, a lavender streak through it ----
  const dir = new Vector3()
  outlined.push(painted(mane[0], 96, (p) => p.multiplyScalar(maneRadius(p)), (p) => {
    dir.copy(p).normalize()
    return mane.length > 1 && streak(Math.atan2(dir.x, dir.z), dir.y) ? mane[1] : null
  }, { at: at(0, 0, 0), scale: [R, R, R] }))
  // Three short locks at the nape that flick out (they swing in the wind).
  for (const [x, i] of [[-0.3, 0], [0, 1], [0.3, 0]] as const) {
    locks.push(sculpt(mane[i % mane.length], 24, (p) => {
      const t = (1 - p.y) / 2
      p.x *= 1 - 0.75 * t
      p.z = p.z * (1 - 0.7 * t) - 0.35 * t * t
    }, { at: at(x, -0.5, -0.78), rot: [-0.35, 0, -x * 0.6], scale: [0.2 * R, 0.3 * R, 0.16 * R] }))
  }

  return { outlined, plain, locks, mouth: at(0, -0.47, 0.875) }
}

/** The tail: a smooth tube from his back that hangs down and curls up at the end, thick in the middle, a point at the
 *  tip, in his mane's colors (the streak at the tip). `root` is body-local. */
export function unicornTail(look: Look, root: V3) {
  const H = look.height
  const mane = look.mane ?? [look.fur]
  // Round a circle behind the root: down, back and up again in a hook (like Kaylee's and Mom's), swung out to one side
  // so it shows from the front.
  const r = 0.085
  const a0 = -Math.PI / 2 + 0.3
  const middle = (t: number, out = new Vector3()) => {
    const a = a0 - t * 3.7
    const y = r * (Math.cos(a) - Math.cos(a0))
    const back = r * (Math.sin(a0) - Math.sin(a))
    return out.set(back * 0.6, y, -back * 0.8)
  }
  const c = new Vector3()
  const ahead = new Vector3()
  const a = new Vector3()
  const b = new Vector3()
  const side = new Vector3(1, 0, 0)
  const along: number[] = []
  return painted(mane[0], 32, (p) => {
    const t = (p.y + 1) / 2
    middle(t, c)
    ahead.copy(middle(Math.min(1, t + 0.02), a)).sub(middle(Math.max(0, t - 0.02), b)).normalize()
    a.crossVectors(ahead, side).normalize()
    b.crossVectors(a, ahead).normalize()
    const round = Math.max(1e-4, 1 - p.y * p.y) ** -0.12
    const k = (0.024 + 0.046 * Math.sin(Math.PI * t ** 0.75) ** 0.9) * round
    const x = p.x * k, z = p.z * k
    along.push(t)
    p.set(c.x + a.x * x + b.x * z, c.y + a.y * x + b.y * z, c.z + a.z * x + b.z * z)
  }, (_, i) => (mane.length > 1 && along[i] > 0.78 ? mane[1] : null), { at: root, scale: [H, H, H] })
}

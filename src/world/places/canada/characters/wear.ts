// The Team Cabin's things to wear, as toy shapes (engine3d/geo.ts parts): the six hats, a jersey's crest, the cheek
// stamps. worn.ts fits them onto each friend (eight very different heads: a beaver, a moose with antlers, a raccoon,
// a bear, an otter, a snowman in his own tuque, a loon, a goose).
//
// A hat is built in "crown units": the circle where it sits on the head has radius 1 and lies at y = 0, the hat's axis
// is +y and its front faces +z. The head under it is a ball of radius `k` whose middle is `d` below that circle
// (k² = 1 + d²), so a beanie or a helmet can be a shell that hugs that ball, never a cap that floats over it or one the
// head pokes through. worn.ts turns a friend's head into (k, d), then places and scales the hat.
import { Euler, Matrix4, Quaternion, SphereGeometry, Vector3, type BufferGeometry } from 'three'
import { bake, P, type V3 } from '../../../engine3d/geo'
import type { CHEEKS, HATS } from '../looks'
import { leafGeo } from '../story/props'

export type HatId = (typeof HATS)[number]
export type CheekId = (typeof CHEEKS)[number]

export const WHITE = '#FFFFFF'
const PINK = '#FF8FB8'
const HOT = '#FF5C9A'
const LAV = '#B48CF2'
const LAV_LIGHT = '#D9CCFF'
const GOLD = '#FFC83D'
const GOLD_DARK = '#E8A52E'
const LEAF_GREEN = '#5FBF8A'
const BUTTER = '#FFE9A8'
const FELT = '#C99A6E'
const FELT_LIGHT = '#E9C9A0'

export interface Parts {
  lined: BufferGeometry[]
  plain: BufferGeometry[]
}

/** The head under a hat, in crown units: a ball of radius k, its middle d below the crown circle. */
export interface HeadBall {
  k: number
  d: number
}

/** A slice of a ball from its top down (`theta` radians from the top), centered at `at`. */
function shell(r: number, theta: number, c: string, at: V3, seg = 24) {
  return bake(new SphereGeometry(r, seg, Math.round(seg * 0.55), 0, Math.PI * 2, 0, theta), c, { at }, true)
}

/** Turns +y to point along `dir` (for a capsule or cone along a direction). */
function along(dir: Vector3): V3 {
  const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.clone().normalize())
  const e = new Euler().setFromQuaternion(q)
  return [e.x, e.y, e.z]
}

/** Turns +z to point along `dir` (a flat thing lying on a surface whose normal is `dir`). */
function facing(dir: Vector3): V3 {
  const q = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), dir.clone().normalize())
  const e = new Euler().setFromQuaternion(q)
  return [e.x, e.y, e.z]
}

/** A five-petal flower on a surface at `at`, its face toward `n`. */
function flower(out: BufferGeometry[], at: Vector3, n: Vector3, r: number, color: string, spin: number) {
  const z = n.clone().normalize()
  const x = new Vector3(0, 1, 0).cross(z)
  if (x.lengthSq() < 1e-6) x.set(1, 0, 0)
  x.normalize()
  const y = z.clone().cross(x)
  const m = new Matrix4().makeBasis(x, y, z).setPosition(at)
  const rot = new Euler().setFromRotationMatrix(m)
  const p = (u: number, v: number, w: number): V3 => {
    const q = new Vector3(u, v, w).applyMatrix4(m)
    return [q.x, q.y, q.z]
  }
  for (let i = 0; i < 5; i++) {
    const a = spin + (i / 5) * Math.PI * 2
    out.push(P.sphere(r * 0.62, color, { at: p(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62, 0), rot: [rot.x, rot.y, rot.z], scale: [1, 1, 0.42] }, 10))
  }
  out.push(P.sphere(r * 0.34, BUTTER, { at: p(0, 0, r * 0.12), rot: [rot.x, rot.y, rot.z], scale: [1, 1, 0.5] }, 8))
}

/** A hat in crown units for a head ball (k, d). */
export function hatParts(id: HatId, head: HeadBall): Parts {
  const { k, d } = head
  const lined: BufferGeometry[] = []
  const plain: BufferGeometry[] = []
  /** The angle from the top of the head ball down to height y (crown units). */
  const down = (r: number, y: number) => Math.acos(Math.max(-1, Math.min(1, (y + d) / r)))
  /** The head ball's radius across at height y. */
  const across = (r: number, y: number) => Math.sqrt(Math.max(0, r * r - (y + d) * (y + d)))
  if (id === 'pompom') {
    // A pink knitted beanie: a shell round the head down to a thick white turned-up cuff, stretched up so it stands
    // taller than the head (a beanie, not a swim cap), a lavender knit stripe round it, a big white pom-pom on top.
    const r = k * 1.07
    const tall = Math.max(1.3, 0.95 / Math.max(0.2, r - d))
    lined.push(shell(r, down(r, 0.04), PINK, [0, -d, 0]).scale(1, tall, 1))
    const stripeY = (r - d) * 0.42
    plain.push(P.torus(across(r, stripeY) + 0.006, 0.07, LAV_LIGHT, { at: [0, stripeY * tall, 0], rot: [Math.PI / 2, 0, 0] }))
    lined.push(P.torus(across(r, 0.06) + 0.02, 0.17, WHITE, { at: [0, 0.06, 0], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 1.35] }))
    const top = (r - d) * tall
    lined.push(P.sphere(0.32, WHITE, { at: [0, top + 0.18, 0] }, 14))
  } else if (id === 'helmet') {
    // A hockey helmet: a lavender shell a little bigger than the head, a white stripe from front to back over the top,
    // a white rim round its edge and a dark vent on each side.
    const r = k * 1.1
    const bottom = -0.28
    lined.push(shell(r, down(r, bottom), LAV, [0, -d, 0]))
    lined.push(P.torus(across(r, bottom), 0.08, WHITE, { at: [0, bottom, 0], rot: [Math.PI / 2, 0, 0] }))
    // The stripe: an arc of a ring a little outside the shell, in the plane across front and back.
    const lift = r + 0.03
    const a0 = Math.asin(Math.max(-1, Math.min(1, (bottom + d) / lift)))
    plain.push(P.torus(lift, 0.09, WHITE, { at: [0, -d, 0], rot: [0, Math.PI / 2, a0], scale: [1, 1, 0.5] }, Math.PI - 2 * a0))
    for (const s of [-1, 1]) {
      const v = new Vector3(s * 0.55, 0.62, -0.2).normalize()
      const at = v.clone().multiplyScalar(r + 0.005).add(new Vector3(0, -d, 0))
      plain.push(P.sphere(0.1, '#5A4878', { at: [at.x, at.y, at.z], rot: facing(v), scale: [1.7, 0.6, 0.3] }, 10))
    }
  } else if (id === 'crown') {
    // A golden crown: a tall band with five points, a pink gem on each tip and a big one at the front.
    lined.push(P.torus(1.0, 0.1, GOLD, { at: [0, 0.12, 0], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 2.4] }))
    lined.push(P.torus(1.0, 0.045, GOLD_DARK, { at: [0, -0.1, 0], rot: [Math.PI / 2, 0, 0], scale: [1.04, 1.04, 1] }))
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2
      const x = Math.sin(a)
      const z = Math.cos(a)
      lined.push(P.cone(0.2, 0.46, GOLD, { at: [x * 1.0, 0.56, z * 1.0], rot: [z * 0.16, 0, -x * 0.16] }, 10))
      plain.push(P.sphere(0.085, i ? PINK : HOT, { at: [x * 1.06, 0.82, z * 1.06] }, 8))
    }
    plain.push(P.sphere(0.13, HOT, { at: [0, 0.14, 1.1], scale: [1, 1.2, 0.45] }, 10))
    for (const s of [-1, 1]) plain.push(P.sphere(0.08, LAV, { at: [Math.sin(s * 0.7) * 1.1, 0.14, Math.cos(s * 0.7) * 1.1], rot: [0, s * 0.7, 0], scale: [1, 1, 0.45] }, 8))
  } else if (id === 'flowers') {
    // A flower crown: a green ring of stems with eight flowers (pink, white, lavender, butter) and little leaves.
    lined.push(P.torus(1.0, 0.075, LEAF_GREEN, { at: [0, 0.04, 0], rot: [Math.PI / 2, 0, 0] }))
    const cols = [PINK, WHITE, LAV_LIGHT, '#FFD86B', HOT, WHITE, LAV_LIGHT, PINK]
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2
      const at = new Vector3(Math.sin(a) * 1.04, 0.1, Math.cos(a) * 1.04)
      flower(lined, at, new Vector3(Math.sin(a), 0.55, Math.cos(a)), i % 2 ? 0.2 : 0.26, cols[i], i * 1.3)
      const b = a + Math.PI / 8
      plain.push(P.sphere(0.12, LEAF_GREEN, { at: [Math.sin(b) * 1.06, 0.02, Math.cos(b) * 1.06], rot: [0, b, 0.6], scale: [1.4, 0.45, 0.35] }, 8))
    }
  } else if (id === 'antlers') {
    // A pink headband over the top from side to side, and two soft felt antlers on it (pretend you're a moose).
    const r = k * 1.04
    const a0 = Math.asin(Math.max(-1, Math.min(1, (d - 0.05) / r)))
    lined.push(P.torus(r, 0.075, PINK, { at: [0, -d, 0], rot: [0, 0, a0], scale: [1, 1, 1.6] }, Math.PI - 2 * a0))
    for (const s of [-1, 1]) {
      const phi = Math.PI / 2 - s * 0.62
      const u = new Vector3(Math.cos(phi), Math.sin(phi), 0)
      const base = u.clone().multiplyScalar(r).add(new Vector3(0, -d, 0))
      // A short thick stalk leaning out, a tine off its outer side and a fork at its top: plush felt antlers.
      const dir = u.clone().add(new Vector3(0, 1.3, 0)).normalize()
      const L = 0.34
      const mid = base.clone().addScaledVector(dir, L * 0.5 + 0.05)
      lined.push(P.capsule(0.14, L, FELT, { at: [mid.x, mid.y, mid.z], rot: along(dir) }))
      const top = base.clone().addScaledVector(dir, L + 0.2)
      for (const [from, ang, len] of [
        [0.45, 0.95, 0.3],
        [1, 0.35, 0.3],
        [1, -0.45, 0.24],
      ] as const) {
        const at = from === 1 ? top.clone() : base.clone().addScaledVector(dir, L * from + 0.12)
        const side = new Vector3(s * Math.sin(ang), Math.cos(ang), 0).normalize()
        const tip = at.clone().addScaledVector(side, len * 0.5 + 0.06)
        lined.push(P.capsule(0.1, len, FELT, { at: [tip.x, tip.y, tip.z], rot: along(side) }))
      }
      plain.push(P.sphere(0.06, FELT_LIGHT, { at: [base.x + dir.x * 0.2, base.y + dir.y * 0.2, 0.09], scale: [1, 1.4, 0.4] }, 8))
    }
  } else {
    // A tall white chef's hat, puffy on top, with a pink band.
    lined.push(P.cyl(1.0, 1.02, 0.62, WHITE, { at: [0, 0.26, 0] }, 24))
    lined.push(P.sphere(0.62, WHITE, { at: [0, 0.95, 0] }, 16))
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3
      lined.push(P.sphere(0.46, WHITE, { at: [Math.sin(a) * 0.55, 0.8, Math.cos(a) * 0.55] }, 14))
    }
    plain.push(P.torus(1.03, 0.07, PINK, { at: [0, 0.04, 0], rot: [Math.PI / 2, 0, 0] }))
  }
  return { lined, plain }
}

/** How tall a hat stands over its crown circle (crown units): where a dropped hat's top is, for a bump. */
export const HAT_TOP: Record<HatId, number> = { pompom: 1.2, helmet: 0.8, crown: 0.9, flowers: 0.35, antlers: 1.1, chef: 1.4 }

/** A cheek stamp, flat in the xy plane facing +z, about `s` across. */
export function cheekParts(id: CheekId, s: number): BufferGeometry[] {
  if (id === 'leaf') return [leafGeo(s * 1.1, '#E8443F')]
  if (id === 'heart') {
    const pts: [number, number][] = []
    for (let i = 0; i <= 28; i++) {
      const t = (i / 28) * Math.PI * 2
      // The classic heart curve, scaled to about s across.
      const x = 16 * Math.sin(t) ** 3
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
      pts.push([(x / 34) * s, (y / 34) * s + 0.04 * s])
    }
    return [P.prism(pts, s * 0.06, HOT)]
  }
  const pts: [number, number][] = []
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2
    const r = (i % 2 ? 0.24 : 0.55) * s
    pts.push([Math.sin(a) * r, Math.cos(a) * r])
  }
  return [P.prism(pts, s * 0.06, GOLD)]
}

/** The white maple leaf on a jersey's front, about `s` tall, facing +z. */
export const crestGeo = (s: number) => leafGeo(s, WHITE)

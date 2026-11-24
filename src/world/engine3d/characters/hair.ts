// A real person's long straight hair on their animal's head (Joy): one smooth sheet instead of balls. It is parted in
// the middle, sweeps off the forehead to either side like curtains, lies close on the temples and falls straight past
// the shoulders, a little longer at the back. Lighter strands run through it and frame the face, and the roots are a
// shade darker. The ears poke up through it.
//
// The sheet is a grid wrapped round the head: across it goes from one edge of the face round the back to the other
// edge, and down it goes from the crown to the tips. It has an outside and an inside (you see the inside behind the
// neck), which meet in a thin rounded edge.
import { BufferAttribute, BufferGeometry, Color } from 'three'
import type { Frame } from './animal'

const ACROSS = 76
const DOWN = 30
/** How far down the grid the hair leaves the head and hangs (the head's widest point). */
const HANG = 0.4
/** The parting runs from the crown this far down the forehead (radians from the top of the head). */
const PART = 0.74
/** Half the gap the face shows through at eye height (radians round the head from straight ahead). */
const OPEN = 0.98
/** The hair's size over the head, in head radii (the fox's head is 1.1 wide), and how far back its middle sits. */
const SIZE = [1.25, 1.16, 1.14]
const BACK = -0.05
/** How close the edge lies to the head (1 = the hair's full size). */
const LIE = 0.915

const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Long straight hair in `color`, on the head of `f` (head-local, like every part of the head). */
export function longHair(color: string, { R, headY }: Frame): BufferGeometry {
  const base = new Color(color)
  const root = base.clone().multiplyScalar(0.8)
  const streak = base.clone().lerp(new Color('#E2AE84'), 0.5)
  const under = base.clone().multiplyScalar(0.66)
  const n = (ACROSS + 1) * (DOWN + 1)
  const pos = new Float32Array(n * 2 * 3)
  const rgb = new Float32Array(n * 2 * 3)
  const c = new Color()
  for (let side = 0; side < 2; side++) {
    for (let j = 0; j <= DOWN; j++) {
      for (let i = 0; i <= ACROSS; i++) {
        const u = i / ACROSS
        const v = j / DOWN
        const phi = Math.min(1, v / HANG) * (Math.PI / 2)
        /** 0 at the head's widest point .. 1 at the tips. */
        const w = Math.max(0, (v - HANG) / (1 - HANG))
        const opening = ease((phi - PART) / (Math.PI / 2 - PART)) ** 0.8
        const gap = OPEN * opening + 0.5 * w ** 1.3
        const az = gap + u * (Math.PI * 2 - gap * 2)
        const fromEdge = Math.min(az - gap, Math.PI * 2 - gap - az)
        const edge = Math.sqrt(Math.min(1, fromEdge / 0.42))
        // Near an edge the hair thins and lies down on the head (on top, the two edges meet: the parting's groove).
        const e = lerp(1, edge, ease(phi / 0.3))
        const behind = Math.max(0, -Math.cos(az))
        const tip = Math.sqrt(1 - w ** 4)
        // The curtains swell a little just under the parting, where they sweep off the forehead.
        const swell = 1 + 0.035 * Math.exp(-(((phi - 1.05) / 0.3) ** 2) - ((fromEdge - 0.45) / 0.35) ** 2)
        let k = lerp(lerp(0.955, LIE, opening), 1, e) * swell
        if (side) k *= 1 - 0.1 * e * tip
        // Hanging, it comes in toward the neck and the back, and the tips turn under a little.
        const fall = 1 - w * (0.08 + 0.26 * behind) - 0.05 * w ** 4
        const length = 1.3 + 0.22 * behind + 0.035 * Math.sin(az * 9)
        const x = SIZE[0] * k * fall * Math.sin(phi) * Math.sin(az)
        const z = BACK + SIZE[2] * k * fall * Math.sin(phi) * Math.cos(az)
        const y = w > 0 ? -w * length : SIZE[1] * k * Math.cos(phi)
        const at = (side * n + j * (ACROSS + 1) + i) * 3
        pos[at] = x * R
        pos[at + 1] = headY + y * R
        pos[at + 2] = z * R
        if (side) c.copy(under)
        else {
          c.copy(root).lerp(base, ease(v / 0.45))
          // Lighter strands: one down each edge (they frame the face) and thin ones through the rest.
          let s = Math.exp(-(((fromEdge - 0.2) / 0.11) ** 2))
          for (const a of [1.55, 2.2, 2.75, 3.6, 4.15, 4.8]) s = Math.max(s, 0.7 * Math.exp(-(((az - a) / 0.07) ** 2)))
          c.lerp(streak, s * ease((v - 0.12) / 0.4) * 0.85)
        }
        rgb[at] = c.r
        rgb[at + 1] = c.g
        rgb[at + 2] = c.b
      }
    }
  }
  const index: number[] = []
  for (let side = 0; side < 2; side++) {
    const at = (i: number, j: number) => side * n + j * (ACROSS + 1) + i
    for (let j = 0; j < DOWN; j++) {
      for (let i = 0; i < ACROSS; i++) {
        const a = at(i, j), b = at(i, j + 1), d = at(i + 1, j + 1), e = at(i + 1, j)
        if (side) index.push(a, d, b, a, e, d)
        else index.push(a, b, d, a, d, e)
      }
    }
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(pos, 3))
  g.setAttribute('color', new BufferAttribute(rgb, 3))
  g.setIndex(index)
  g.computeVertexNormals()
  return g
}

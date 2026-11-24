// Props the films, the map and the big game share: the Maple Cup, a puck, a hockey stick for a rig friend's hand (and
// the geese's wings, and the map), and
// Sparkle's balloon. Each is a toy shape from engine3d/geo.ts parts (one mesh and one outline each).
import { Group, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../engine3d/dispose'
import { merge, P, solid, type V3 } from '../../../engine3d/geo'
import { PAL } from '../../../engine3d/toon'
import { CANADA_COLORS } from '../characters/looks'

const GOLD = '#FFC83D'
const GOLD_DARK = '#E8A52E'
const LEAF = '#E8443F'

/** A red maple leaf, flat in the xy plane, about `s` meters tall, facing +z. */
export function leafGeo(s: number, color = LEAF) {
  const pts: [number, number][] = [[0, 1], [0.14, 0.72], [0.3, 0.8], [0.26, 0.56], [0.62, 0.62], [0.5, 0.42], [0.72, 0.3], [0.36, 0.14], [0.42, -0.02], [0.08, 0.06], [0.04, -0.3], [-0.04, -0.3], [-0.08, 0.06], [-0.42, -0.02], [-0.36, 0.14], [-0.72, 0.3], [-0.5, 0.42], [-0.62, 0.62], [-0.26, 0.56], [-0.3, 0.8], [-0.14, 0.72]]
  return P.prism(pts.map(([x, y]) => [x * s * 0.62, (y - 0.35) * s * 0.77] as [number, number]), s * 0.05, color)
}

/** The Maple Cup: a golden bowl with two handles on a stem, a red maple leaf on its front. About `h` meters tall,
 *  standing on y = 0. `stand: true` puts it on a little table with a red cloth (the cup's foot is then at 0.62 m). */
export function makeCup(bag: Bag, h = 0.7, stand = false) {
  const g = new Group()
  const y0 = stand ? 0.62 : 0
  const cup = [
    P.cyl(0.2 * h, 0.26 * h, 0.1 * h, GOLD_DARK, { at: [0, y0 + 0.05 * h, 0] }, 16),
    P.cyl(0.07 * h, 0.1 * h, 0.26 * h, GOLD, { at: [0, y0 + 0.22 * h, 0] }, 12),
    P.sphere(0.1 * h, GOLD, { at: [0, y0 + 0.34 * h, 0], scale: [1, 0.7, 1] }, 12),
    P.cyl(0.3 * h, 0.14 * h, 0.44 * h, GOLD, { at: [0, y0 + 0.6 * h, 0] }, 20),
    P.torus(0.3 * h, 0.035 * h, GOLD_DARK, { at: [0, y0 + 0.82 * h, 0], rot: [Math.PI / 2, 0, 0] }),
    ...[-1, 1].map((s) => P.torus(0.13 * h, 0.03 * h, GOLD, { at: [s * 0.33 * h, y0 + 0.6 * h, 0], rot: [0, 0, 0] }, Math.PI * 2)),
    leafGeo(0.3 * h).translate(0, y0 + 0.62 * h, 0.235 * h),
  ]
  if (stand) {
    cup.push(P.cyl(0.42, 0.42, 0.06, '#C98A55', { at: [0, 0.56, 0] }, 20), P.cyl(0.07, 0.1, 0.56, '#B07A4A', { at: [0, 0.28, 0] }, 10), P.cyl(0.3, 0.34, 0.05, '#B07A4A', { at: [0, 0.025, 0] }, 16))
    cup.push(P.cyl(0.44, 0.46, 0.035, LEAF, { at: [0, 0.6, 0] }, 20))
  }
  g.add(solid(merge(cup), bag, 2.2))
  return g
}

/** A hockey puck, lying on y = 0. */
export const makePuck = (bag: Bag, r = 0.12) => solid(P.cyl(r, r, r * 0.55, '#2E2A3A', { at: [0, r * 0.28, 0] }, 16), bag, 1.6)

/** How a hockey stick sits in a hand (all in the holder's arm space): the shaft runs from the heel on the ice up
 *  through the paw at `hand`, `len` long; the blade goes forward (+z) from the heel along the ice, `blade` long. */
export interface StickFit {
  hand: V3
  heel: V3
  len: number
  /** The shaft's thickness (the blade, the tape and the knob follow it). */
  w: number
  blade: number
  shaft: string
  color: string
}

const TAPE = '#2E2A3A'
const TAPE_WHITE = '#FFFFFF'

/** A real-looking toy hockey stick: a flat rectangular shaft with a black tape knob at the top, a rounded heel, and a
 *  wide, flat blade standing on its edge that curves a little toward the toe, white tape wrapped round its middle. */
export function stickParts(f: StickFit): BufferGeometry[] {
  const [hx, hy, hz] = f.heel
  const up = new Vector3(f.hand[0] - hx, f.hand[1] - hy, f.hand[2] - hz).normalize()
  // (The shaft only tips forward or back: a turn round x takes +y to `up`.)
  const tilt = Math.atan2(up.z, up.y)
  const w = f.w
  const at = (d: number): V3 => [hx + up.x * d, hy + up.y * d, hz + up.z * d]
  const parts = [
    P.rbox(w, f.len, w * 0.7, w * 0.25, f.shaft, { at: at(f.len / 2 + w * 0.3), rot: [tilt, 0, 0] }),
    // The knob: black tape round the top of the shaft, a little fatter.
    P.rbox(w * 1.22, w * 2.6, w * 0.92, w * 0.4, TAPE, { at: at(f.len - w * 1.1), rot: [tilt, 0, 0] }),
    // The heel: where the shaft bends into the blade.
    P.rbox(w * 0.75, w * 1.6, w * 1.5, w * 0.35, f.color, { at: [hx, hy + w * 0.75, hz + w * 0.25], rot: [tilt * 0.5, 0, 0] }),
  ]
  // The blade: three flat pieces on edge, each turned a little more (the curve), its bottom on the ice.
  const bh = w * 2.2
  const seg = f.blade / 3
  let x = hx
  let z = hz + w * 0.5
  for (let i = 0; i < 3; i++) {
    const yaw = -0.1 - i * 0.14
    const cx = x + Math.sin(yaw) * seg * 0.5
    const cz = z + Math.cos(yaw) * seg * 0.5
    const h = bh * (i === 2 ? 0.92 : 1)
    parts.push(P.rbox(w * 0.5, h, seg * 1.12, w * 0.22, f.color, { at: [cx, hy + h / 2, cz], rot: [0, yaw, 0] }))
    // White tape wrapped round the middle of the blade.
    if (i === 1) parts.push(P.rbox(w * 0.62, h * 1.04, seg * 0.7, w * 0.2, TAPE_WHITE, { at: [cx, hy + h / 2, cz], rot: [0, yaw, 0] }))
    x += Math.sin(yaw) * seg
    z += Math.cos(yaw) * seg
  }
  return parts
}

/** How the team's stick sits in a rig friend's right paw (`rig.armR`), for one `H` meters tall. */
export const stickFit = (H: number, color: string = CANADA_COLORS.scarf, thick = 1, shaft = '#E9C99A'): StickFit => ({
  hand: [0.09 * H, -0.25 * H, 0.1 * H],
  heel: [0.09 * H, -0.47 * H, 0.21 * H],
  len: 0.5 * H,
  w: 0.03 * H * thick,
  blade: 0.21 * H,
  shaft,
  color,
})

/** The middle of the blade's toe half (arm space): where a puck or a pinecone sits to be hit. */
export function stickBlade(f: StickFit, out = new Vector3()) {
  return out.set(f.heel[0] - f.blade * 0.12, f.heel[1] + f.w, f.heel[2] + f.blade * 0.6)
}

/** A hockey stick for a rig friend `H` meters tall: add it to `rig.armR` (the blade rests on the ice by their right
 *  foot, pointing forward). The team's are pink; the geese's are blue (characters/goose.ts builds its own). */
export function makeStick(H: number, bag: Bag, color: string = CANADA_COLORS.scarf) {
  return solid(merge(stickParts(stickFit(H, color))), bag, 1.8)
}

/** Sparkle's hot-air balloon: pink, lavender and cream stripes over a little basket. `root` is at the basket's floor. */
export class Balloon {
  readonly root = new Group()
  private sway = new Group()
  constructor(bag: Bag, s = 1) {
    const parts = []
    const cols = ['#FF8FB8', '#FFF7F0', '#CDBBF7', '#FFF7F0']
    // The envelope: eight gores round, each a slice of a squashed ball in its own color.
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      parts.push(P.sphere(1.5 * s, cols[i % 4], { at: [Math.cos(a) * 0.42 * s, 4.1 * s, Math.sin(a) * 0.42 * s], scale: [0.78, 1.05, 0.78] }, 14))
    }
    parts.push(P.cone(1.25 * s, 1.5 * s, '#FF8FB8', { at: [0, 2.55 * s, 0], rot: [Math.PI, 0, 0] }, 16))
    parts.push(P.torus(0.5 * s, 0.07 * s, '#CDBBF7', { at: [0, 1.85 * s, 0], rot: [Math.PI / 2, 0, 0] }))
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4
      parts.push(P.cyl(0.015 * s, 0.015 * s, 1.25 * s, PAL.ink, { at: [Math.cos(a) * 0.42 * s, 1.25 * s, Math.sin(a) * 0.42 * s], rot: [Math.sin(a) * 0.1, 0, -Math.cos(a) * 0.1] }, 5))
    }
    parts.push(P.rbox(0.8 * s, 0.6 * s, 0.8 * s, 0.1 * s, '#D9A066', { at: [0, 0.3 * s, 0] }), P.rbox(0.9 * s, 0.1 * s, 0.9 * s, 0.05 * s, '#B07A4A', { at: [0, 0.62 * s, 0] }))
    this.sway.add(solid(merge(parts), bag, 2.4))
    this.root.add(this.sway)
    this.root.visible = false
  }
  update(_dt: number, t: number) {
    this.sway.rotation.z = Math.sin(t * 0.9) * 0.035
    this.sway.rotation.x = Math.sin(t * 0.7 + 1) * 0.025
    this.sway.position.y = Math.sin(t * 1.3) * 0.08
  }
}

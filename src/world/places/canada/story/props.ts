// Props the films, the map and the big game share: the Maple Cup, a puck, a hockey stick for a rig friend's hand, and
// Sparkle's balloon. Each is a toy shape from engine3d/geo.ts parts (one mesh and one outline each).
import { Group } from 'three'
import type { Bag } from '../../../engine3d/dispose'
import { merge, P, solid } from '../../../engine3d/geo'
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

/** A hockey stick for a rig friend `H` meters tall: add it to `rig.armR` (the blade rests on the ice by their right
 *  foot, pointing forward). The team's are pink; the geese's are blue (characters/goose.ts builds its own). */
export function makeStick(H: number, bag: Bag, color: string = CANADA_COLORS.scarf) {
  return solid(merge([P.cyl(0.016 * H, 0.016 * H, 0.5 * H, '#E9D3A6', { at: [0.09 * H, -0.25 * H, 0.1 * H], rot: [0.42, 0, 0] }, 6), P.rbox(0.04 * H, 0.035 * H, 0.2 * H, 0.01 * H, color, { at: [0.09 * H, -0.455 * H, 0.27 * H] })]), bag, 1.8)
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

// The jet ski from Dad's photo, built from code: a big white sit-down jet ski with red and yellow stripes and a black
// seat (no logos), Kaylee up front at the handlebars and Daddy behind her. The jet ski man's has blue stripes.
//
// root (where it is, which way it faces) > tilt (pitch on the waves, roll into turns, a spin in the air) > body (the
// squash on landing). The riders sit on their own seat groups, so they can tumble off (a beaching) and hop back on.
// Faces +z.
import { CylinderGeometry, Group, Mesh } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { bake, merge, P, solid } from '../../../../../engine3d/geo'
import { makeHull } from '../../../../../engine3d/outline'
import { PAL, toon } from '../../../../../engine3d/toon'

export const SKI_LEN = 3.1
/** Where the spray and the wake come out (local z) and how high the handlebars are. */
export const STERN = -1.5
export const BARS_Y = 1.05

export interface SkiColors {
  hull: string
  stripe: string
  stripe2: string
}
export const HERS: SkiColors = { hull: '#FFFFFF', stripe: '#F0465A', stripe2: PAL.gold }
export const HIS: SkiColors = { hull: '#FFFFFF', stripe: '#3F8FE8', stripe2: '#8FE3C8' }

export interface Ski {
  root: Group
  tilt: Group
  body: Group
  /** Kaylee's seat (front) and the one behind (Daddy, or the jet ski man alone). */
  front: Group
  back: Group
  bars: Group
}

export function buildSki(bag: Bag, c: SkiColors = HERS): Ski {
  const root = new Group()
  const tilt = new Group()
  const body = new Group()
  root.add(tilt)
  tilt.add(body)
  // Side profile (z along the ski, y up), pushed across the ski.
  const prof = (pts: [number, number][], w: number, col: string, x = 0) => P.prism(pts, w, col, { at: [x, 0, 0], rot: [0, -Math.PI / 2, 0] })
  const hull = [
    prof([[-1.5, -0.16], [0.85, -0.16], [1.62, 0.32], [1.42, 0.5], [0.3, 0.52], [-1.5, 0.48]], 1.08, c.hull),
    // The deck: a little narrower, rounded on top.
    P.rbox(0.96, 0.22, 2.4, 0.1, c.hull, { at: [0, 0.52, -0.25] }),
    // The cowl in front of the handlebars, and its windscreen.
    P.rbox(0.86, 0.34, 0.86, 0.16, c.hull, { at: [0, 0.68, 0.9], rot: [-0.25, 0, 0] }),
    P.rbox(0.62, 0.05, 0.32, 0.03, '#6FC4E6', { at: [0, 0.9, 1.02], rot: [-0.75, 0, 0] }),
    // The black seat (Kaylee in front, Daddy behind).
    P.capsule(0.19, 1.15, '#3A3140', { at: [0, 0.74, -0.35], rot: [Math.PI / 2, 0, 0], scale: [1.35, 1, 0.8] }),
    // The stripes down both sides, and a rub rail.
    ...[-1, 1].flatMap((s) => [
      prof([[-1.45, 0.16], [1.0, 0.16], [1.32, 0.3], [1.1, 0.34], [-1.45, 0.3]], 0.03, c.stripe, s * 0.545),
      prof([[-1.45, 0.05], [0.75, 0.05], [0.95, 0.12], [-1.45, 0.12]], 0.03, c.stripe2, s * 0.545),
      P.box(0.06, 0.08, 2.3, '#3A3140', { at: [s * 0.52, 0.47, -0.25] }),
    ]),
    // Footwells, the back step.
    P.box(1.02, 0.05, 0.5, '#E4E0EC', { at: [0, 0.43, -1.25] }),
  ]
  body.add(solid(merge(hull), bag, 2.5))
  const bars = new Group()
  bars.add(
    solid(
      merge([
        P.cyl(0.07, 0.09, 0.32, '#3A3140', { at: [0, -0.12, 0] }, 8),
        P.cyl(0.035, 0.035, 0.95, '#3A3140', { rot: [0, 0, Math.PI / 2] }, 8),
        P.cyl(0.055, 0.055, 0.2, '#2B2330', { at: [0.48, 0, 0], rot: [0, 0, Math.PI / 2] }, 8),
        P.cyl(0.055, 0.055, 0.2, '#2B2330', { at: [-0.48, 0, 0], rot: [0, 0, Math.PI / 2] }, 8),
        P.sphere(0.07, c.stripe, { at: [0.36, 0.2, 0.05] }, 8),
        P.sphere(0.07, c.stripe, { at: [-0.36, 0.2, 0.05] }, 8),
      ]),
      bag,
      2,
    ),
  )
  bars.position.set(0, BARS_Y, 0.5)
  body.add(bars)
  const front = new Group()
  front.position.set(0, 0.8, 0.05)
  const back = new Group()
  back.position.set(0, 0.84, -0.72)
  body.add(front, back)
  return { root, tilt, body, front, back, bars }
}

/** A life jacket around someone's middle (pink and white for Kaylee, like the photo; orange for the grown-ups), with
 *  its buckles. `r` is their body's radius, `y` the middle of the jacket, `h` its height. */
export function lifeJacket(bag: Bag, r: number, y: number, h: number, color: string, trim = '#FFFFFF') {
  const g = new Group()
  const vest = bake(new CylinderGeometry(r, r * 1.06, h, 18, 1, true), color)
  const collar = P.torus(r * 0.92, h * 0.1, trim, { at: [0, h / 2, 0], rot: [Math.PI / 2, 0, 0] })
  const hem = P.torus(r * 1.04, h * 0.08, trim, { at: [0, -h / 2, 0], rot: [Math.PI / 2, 0, 0] })
  const buckles = [0.3, -0.05].map((k) => P.box(r * 0.5, h * 0.12, r * 0.18, '#3A3140', { at: [0, k * h, r * 1.02] }))
  const geo = merge([vest, collar, hem, ...buckles])
  const mesh = new Mesh(bag.add(geo), toon('#ffffff', true))
  // (Both sides drawn: the jacket is open at the top and bottom.)
  const hull = makeHull(geo, 2)
  bag.add(hull.geometry)
  g.add(mesh, hull)
  g.position.y = y
  return g
}

/** Kaylee's life jacket before it's on: a real vest on its own, front panels with a zip gap and three buckles, an open
 *  neck, wide shoulders and a white hem. Its front faces +z. (A plain tube, the worn one's shape, reads as a bucket.) */
export function loneVest(bag: Bag, color: string, trim = '#FFFFFF') {
  const g = new Group()
  const panel = (x: number) => P.rbox(0.3, 0.68, 0.17, 0.07, color, { at: [x, -0.02, 0.17] })
  g.add(
    solid(
      merge([
        // The two front panels with the gap between, the back, the sides joining them.
        panel(-0.2),
        panel(0.2),
        P.rbox(0.72, 0.72, 0.15, 0.07, color, { at: [0, 0, -0.17] }),
        ...[-1, 1].map((s) => P.rbox(0.14, 0.6, 0.34, 0.06, color, { at: [s * 0.36, -0.06, 0] })),
        // Shoulder straps over an open neck.
        ...[-1, 1].map((s) => P.rbox(0.2, 0.1, 0.46, 0.04, color, { at: [s * 0.24, 0.36, 0] })),
        // The white collar and hem, and the buckles across the zip gap.
        ...[-1, 1].map((s) => P.rbox(0.31, 0.08, 0.19, 0.03, trim, { at: [s * 0.2, -0.33, 0.17] })),
        P.rbox(0.74, 0.08, 0.17, 0.03, trim, { at: [0, -0.33, -0.17] }),
        ...[0.2, 0, -0.2].map((y) => P.box(0.46, 0.07, 0.05, '#3A3140', { at: [0, y, 0.27] })),
        ...[0.2, 0, -0.2].map((y) => P.box(0.13, 0.11, 0.06, trim, { at: [0, y, 0.285] })),
      ]),
      bag,
      2.5,
    ),
  )
  return g
}

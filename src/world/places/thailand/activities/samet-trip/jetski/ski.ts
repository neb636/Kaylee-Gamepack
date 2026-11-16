// The jet ski from Dad's photo, built from code: a big white sit-down jet ski with red and yellow stripes and a black
// seat (no logos), Kaylee up front at the handlebars and Dad behind her. The jet ski man's has blue stripes.
//
// root (where it is, which way it faces) > tilt (pitch on the waves, roll into turns, a spin in the air) > body (the
// squash on landing). The riders sit on their own seat groups, so they can tumble off (a beaching) and hop back on.
// Faces +z.
import { CylinderGeometry, Group, Mesh } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { bake, loft, merge, P, solid } from '../../../../../engine3d/geo'
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
  /** Kaylee's seat (front) and the one behind (Dad, or the jet ski man alone). */
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
  // The hull, lofted through its sections from the swim platform to the bow: a deep V underneath that rises and
  // narrows to a pointed bow, wide sponsons at the back, a colored lower hull under a pinstripe, a dark rub rail all the
  // way round, and a white deck. Each section: keel, then up the right side to the deck's middle and down the left.
  const ring = (z: number, w: number, keel: number, chine: number, stripe: number, rail: number, deck: number) => {
    const half: [number, number][] = [
      [w * 0.86, chine],
      [w * 0.97, stripe],
      [w, stripe + 0.06],
      [w, rail],
      [w * 0.98, rail + 0.06],
      [w * 0.8, deck],
    ]
    return { z, pts: [[0, keel], ...half, [0, deck + 0.04], ...half.reverse().map(([x, y]) => [-x, y] as [number, number])] as [number, number][] }
  }
  const bands = [c.stripe, c.stripe, c.stripe2, c.hull, '#3A3140', c.hull, c.hull, c.hull, c.hull, '#3A3140', c.hull, c.stripe2, c.stripe, c.stripe]
  const hullGeo = loft(
    [
      ring(-1.55, 0.5, -0.04, 0.0, 0.1, 0.24, 0.3),
      ring(-1.25, 0.56, -0.1, -0.02, 0.12, 0.3, 0.36),
      ring(-0.7, 0.58, -0.16, -0.04, 0.14, 0.34, 0.42),
      ring(0.1, 0.57, -0.18, -0.04, 0.16, 0.36, 0.46),
      ring(0.75, 0.5, -0.13, 0.0, 0.2, 0.38, 0.5),
      ring(1.2, 0.36, -0.02, 0.08, 0.25, 0.4, 0.52),
      ring(1.5, 0.18, 0.14, 0.2, 0.3, 0.42, 0.5),
      ring(1.66, 0.04, 0.34, 0.36, 0.4, 0.44, 0.47),
    ],
    bands,
  )
  // The hood: a smooth hump from the bow up to the handlebars, with a dark visor and the steering pod.
  const hood = (z: number, w: number, base: number, top: number) => ({
    z,
    pts: [[w, base], [w * 0.92, base + (top - base) * 0.55], [w * 0.6, top - 0.02], [0, top], [-w * 0.6, top - 0.02], [-w * 0.92, base + (top - base) * 0.55], [-w, base]] as [number, number][],
  })
  const hoodGeo = loft([hood(0.32, 0.36, 0.44, 0.76), hood(0.55, 0.42, 0.46, 0.84), hood(0.85, 0.4, 0.48, 0.8), hood(1.15, 0.3, 0.5, 0.68), hood(1.45, 0.12, 0.5, 0.56)], [c.hull, c.stripe, c.hull, c.hull, c.stripe, c.hull, c.hull])
  const hull = [
    hullGeo,
    hoodGeo,
    // The tinted visor in front of the bars, and the round gauge pod under them.
    P.rbox(0.56, 0.05, 0.3, 0.025, '#6FC4E6', { at: [0, 0.88, 0.66], rot: [-0.55, 0, 0] }),
    P.cyl(0.13, 0.15, 0.12, '#3A3140', { at: [0, 0.86, 0.42], rot: [-0.4, 0, 0] }, 12),
    // Mirrors on little stalks either side of the hood.
    ...[-1, 1].flatMap((sd) => [
      P.cyl(0.02, 0.02, 0.18, '#3A3140', { at: [sd * 0.34, 0.86, 0.6], rot: [0, 0, -sd * 0.6] }, 5),
      P.sphere(0.07, '#3A3140', { at: [sd * 0.42, 0.94, 0.6], scale: [1.3, 0.8, 0.5] }, 8),
    ]),
    // The seat on its raised white base: a long saddle, a step up for the back rider, colored piping down the middle.
    P.rbox(0.6, 0.2, 1.75, 0.08, c.hull, { at: [0, 0.54, -0.42] }),
    P.rbox(0.5, 0.18, 0.95, 0.09, '#3A3140', { at: [0, 0.71, 0.0] }),
    P.rbox(0.5, 0.22, 0.85, 0.1, '#3A3140', { at: [0, 0.73, -0.86] }),
    P.box(0.05, 0.02, 1.7, c.stripe, { at: [0, 0.83, -0.43] }),
    // The grab handle behind the seat, the swim platform's grippy mat, the jet nozzle at the back.
    P.torus(0.17, 0.035, '#3A3140', { at: [0, 0.7, -1.33], rot: [0, Math.PI / 2, 0] }, Math.PI),
    P.box(0.7, 0.02, 0.24, '#5C5468', { at: [0, 0.31, -1.42] }),
    P.cyl(0.1, 0.12, 0.16, '#5C5468', { at: [0, 0.02, -1.58], rot: [Math.PI / 2, 0, 0] }, 10),
    // Sponson fins low on both sides at the back, and a bow eye.
    ...[-1, 1].map((sd) => P.rbox(0.06, 0.08, 0.5, 0.02, '#3A3140', { at: [sd * 0.58, 0.04, -1.1] })),
    P.torus(0.04, 0.012, '#C8CCD2', { at: [0, 0.4, 1.63], rot: [0, Math.PI / 2, 0] }),
  ]
  body.add(solid(merge(hull), bag, 2.5))
  const bars = new Group()
  bars.add(
    solid(
      merge([
        P.cyl(0.06, 0.08, 0.22, '#3A3140', { at: [0, -0.08, 0] }, 8),
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

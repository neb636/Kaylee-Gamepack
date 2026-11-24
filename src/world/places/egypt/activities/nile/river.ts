// The Nile's numbers. One river unit (u) is a slice of the screen (layoutFor): everything on the water is measured in
// units, x from the left edge of the screen (or of the world, for things that float by) and y down from the waterline.
import { clamp } from '../../../../../sdk/math'
import { knobs } from '../../../../kit/knobs'

const FILE = 'src/world/places/egypt/activities/nile/river.ts'

/** How the felucca feels under her finger (tune it in the feel lab: ?feel=1 on a section link). */
export const FEEL = knobs(
  'nileBoat',
  'Steering the felucca',
  FILE,
  {
    chase: { value: 4.4, min: 1, max: 10, step: 0.1, label: 'Chase', unit: '/s', note: 'how eagerly the boat follows her finger', main: true },
    top: { value: 78, min: 20, max: 160, step: 1, label: 'Top speed', unit: 'u/s', note: 'the fastest the boat slides', main: true },
    cruise: { value: 14, min: 4, max: 30, step: 0.5, label: 'River speed', unit: 'u/s', note: 'how fast the flowers float by', main: true },
    reach: { value: 9, min: 4, max: 18, step: 0.5, label: 'Catch reach', unit: 'u', note: 'how close a flower has to be to hop aboard', main: true },
    pull: { value: 9, min: 0, max: 30, step: 0.5, label: 'Flower pull', unit: 'u/s', note: 'how fast a near flower drifts to the boat' },
    lean: { value: 0.22, min: 0, max: 0.6, step: 0.01, label: 'Lean', unit: 'deg per u/s', note: 'how much the boat tips as it climbs or dives' },
    reeds: { value: 0.4, min: 0.1, max: 1, step: 0.05, label: 'Reed drag', note: 'boat speed inside the reeds (1 = no drag)' },
  },
  { sections: ['sail-1', 'farm-1', 'sail-2', 'farm-2'] },
)

/** Flowers on each strand of the garland (one strand per sail). */
export const PER_LEG = 6
export const LEGS = 2

/** The boat's box in units, and where its hull sits in that box (the point that follows her finger). */
export const BOAT = { w: 34, h: 36, ax: 0.5, ay: 300 / 360 }
/** Strip widths in units: each layer is drawn once and repeats. */
export const TILE = { far: 200, mid: 240, bank: 240, ripple: 160, fore: 200 }
/** How fast each layer slides by, as a share of the river's speed. */
export const PARALLAX = { cloud: 0.04, far: 0.14, mid: 0.4, fore: 1.5 }
/** The farm: its water wheel stands in the shallows, its field lies on the bank to the left of the wheel. */
export const FARM = { fieldW: 48, gap: 5, wheelY: 5.5, touch: 13, fill: 0.42 }

export interface Layout {
  W: number
  H: number
  /** One river unit in CSS px. */
  u: number
  /** Screen width in units. */
  viewW: number
  /** Screen y (px) of the waterline. */
  waterTop: number
  /** Depth of the water on screen, in units. */
  depth: number
}

/** The river fits any screen: the waterline sits under the prompt, sky fills what's above and water what's below. */
export function layoutFor(W: number, H: number): Layout {
  const u = clamp(Math.min(W, H * 0.75) / 86, 3, 9.5)
  const waterTop = Math.min(H * 0.52, Math.max(H * 0.42, 150 + 30 * u))
  return { W, H, u, viewW: W / u, waterTop, depth: (H - waterTop) / u }
}

/** Where the boat may go (its hull point), in units. */
export const bounds = (l: Layout) => ({ x0: 18, x1: l.viewW - 19, y0: 7, y1: Math.max(12, l.depth - 9) })

/** The garland's twelve hooks in the boat's own drawing (340 x 360): the bow strand first, then the stern strand. */
export const HOOKS: [number, number][] = (() => {
  const top: [number, number] = [206, 36]
  const strand = (end: [number, number], sag: [number, number]) =>
    [0.16, 0.3, 0.44, 0.58, 0.72, 0.86].map((t): [number, number] => {
      const a = (1 - t) * (1 - t)
      const b = 2 * (1 - t) * t
      const c = t * t
      return [a * top[0] + b * sag[0] + c * end[0], a * top[1] + b * sag[1] + c * end[1]]
    })
  return [...strand([324, 240], [246, 176]), ...strand([24, 252], [112, 196])]
})()

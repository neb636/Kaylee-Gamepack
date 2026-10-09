// Venice's own sprites (generated with Codex, style per art/STYLE.md + ../../STYLE.md, cut out by `npm run art -- venice-`).
// Kept here rather than in ../../art.ts so only this activity imports them.
import boatBathtub from '../../assets/venice-boat-bathtub-hd.webp'
import boatGondola from '../../assets/venice-boat-gondola-hd.webp'
import boatPizza from '../../assets/venice-boat-pizza-hd.webp'
import boatSwan from '../../assets/venice-boat-swan-hd.webp'
import bridgeHigh from '../../assets/venice-bridge-high-hd.webp'
import bridgeLow from '../../assets/venice-bridge-low-hd.webp'
import bridgeMid from '../../assets/venice-bridge-mid-hd.webp'
import cloud1 from '../../assets/venice-cloud-1.webp'
import cloud2 from '../../assets/venice-cloud-2.webp'
import farBelltower from '../../assets/venice-far-belltower-hd.webp'
import farDome from '../../assets/venice-far-dome-hd.webp'
import farRooftops from '../../assets/venice-far-rooftops-hd.webp'
import butter from '../../assets/venice-house-butter-hd.webp'
import coral from '../../assets/venice-house-coral-hd.webp'
import lavender from '../../assets/venice-house-lavender-hd.webp'
import maskshop from '../../assets/venice-house-maskshop-hd.webp'
import mint from '../../assets/venice-house-mint-hd.webp'
import peach from '../../assets/venice-house-peach-hd.webp'
import pink from '../../assets/venice-house-pink-hd.webp'
import sky from '../../assets/venice-house-sky-hd.webp'
import postBlue from '../../assets/venice-post-blue.webp'
import postPink from '../../assets/venice-post-pink.webp'
import type { Facade } from './canal'

export const houses: Record<Facade, string> = { butter, coral, lavender, maskshop, mint, peach, pink, sky }

/** Boats, all side view facing right. aspect = width / height of the picture; waterline = where the hull meets the water
 *  (share of the height from the top); gino / sparkle = where each rider stands (share of the width from the left, share
 *  of the height from the bottom). */
export const BOATS = {
  gondola: { img: boatGondola, aspect: 2.709, waterline: 0.8, gino: [0.05, 0.4], sparkle: [0.6, 0.36] },
  swan: { img: boatSwan, aspect: 1.862, waterline: 0.84, gino: [0.04, 0.34], sparkle: [0.5, 0.3] },
  bathtub: { img: boatBathtub, aspect: 2.188, waterline: 0.72, gino: [0.08, 0.5], sparkle: [0.6, 0.48] },
  pizza: { img: boatPizza, aspect: 2.695, waterline: 0.82, gino: [0.12, 0.44], sparkle: [0.6, 0.36] },
} as const
export type BoatKind = keyof typeof BOATS
export const BOAT_ORDER: BoatKind[] = ['gondola', 'swan', 'bathtub', 'pizza']

/** Bridges, side view. opening = how high the arch opening reaches (share of the height from the bottom). */
export const BRIDGES = {
  low: { img: bridgeLow, aspect: 2.943, opening: 0.3 },
  mid: { img: bridgeMid, aspect: 1.835, opening: 0.5 },
  high: { img: bridgeHigh, aspect: 1.501, opening: 0.7 },
} as const

export const skyline = { belltower: { img: farBelltower, aspect: 0.174 }, dome: { img: farDome, aspect: 1.524 }, rooftops: { img: farRooftops, aspect: 2.829 } } as const
export const clouds = { 1: { img: cloud1, aspect: 2.51 }, 2: { img: cloud2, aspect: 1.501 } } as const
export const posts = { near: postBlue, front: postPink, aspect: 0.148 } as const

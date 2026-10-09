// Venice's own sprites (generated with Codex, style per art/STYLE.md + ../../STYLE.md, cut out by `npm run art -- venice-`).
// Kept here rather than in ../../art.ts so only this activity imports them.
import ambulance from '../../assets/venice-ambulance-hd.webp'
import babypigeonWindow from '../../assets/venice-babypigeon-window.webp'
import catWindow from '../../assets/venice-cat-window.webp'
import duck from '../../assets/venice-duck.webp'
import duckling from '../../assets/venice-duckling.webp'
import fireboat from '../../assets/venice-fireboat-hd.webp'
import hand from '../../assets/venice-hand.webp'
import lantern from '../../assets/venice-lantern.webp'
import laundry from '../../assets/venice-laundry-hd.webp'
import lion from '../../assets/venice-lion.webp'
import nonnaWindow from '../../assets/venice-nonna-window.webp'
import passerella from '../../assets/venice-passerella-hd.webp'
import pigeonBoots from '../../assets/venice-pigeon-boots.webp'
import pigeonFly from '../../assets/venice-pigeon-fly.webp'
import pigeon from '../../assets/venice-pigeon.webp'
import vaporetto from '../../assets/venice-vaporetto-hd.webp'
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
/** Each boat handles a little differently: top speed, how fast it slows when let go, how much it rocks. */
export const BOAT_FEEL: Record<BoatKind, { speed: number; drag: number; rock: number }> = {
  gondola: { speed: 1, drag: 1, rock: 1 },
  swan: { speed: 0.95, drag: 0.75, rock: 0.8 },
  bathtub: { speed: 0.9, drag: 1.15, rock: 1.9 },
  pizza: { speed: 1.15, drag: 1, rock: 1.1 },
}

/** Bridges, side view. opening = how high the arch opening reaches (share of the height from the bottom). */
export const BRIDGES = {
  low: { img: bridgeLow, aspect: 2.943, opening: 0.3 },
  mid: { img: bridgeMid, aspect: 1.835, opening: 0.5 },
  high: { img: bridgeHigh, aspect: 1.501, opening: 0.7 },
} as const

export const skyline = { belltower: { img: farBelltower, aspect: 0.174 }, dome: { img: farDome, aspect: 1.524 }, rooftops: { img: farRooftops, aspect: 2.829 } } as const
export const clouds = { 1: { img: cloud1, aspect: 2.51 }, 2: { img: cloud2, aspect: 1.501 } } as const
export const posts = { near: postBlue, front: postPink, aspect: 0.148 } as const

/** Things to poke and passers-by. aspect = width / height. */
export const critters = {
  pigeon: { img: pigeon, aspect: 0.969 },
  pigeonFly: { img: pigeonFly, aspect: 1.145 },
  pigeonBoots: { img: pigeonBoots, aspect: 0.906 },
  duck: { img: duck, aspect: 1.43 },
  duckling: { img: duckling, aspect: 1.151 },
  lion: { img: lion, aspect: 0.604 },
} as const
/** Who pops up in a window when she taps a house. */
export const windowFriends = [
  { img: catWindow, aspect: 1.164 },
  { img: nonnaWindow, aspect: 1.169 },
  { img: babypigeonWindow, aspect: 1.202 },
] as const
export const TRAFFIC = {
  vaporetto: { img: vaporetto, aspect: 3.593, length: 420 },
  ambulance: { img: ambulance, aspect: 3.22, length: 300 },
  fireboat: { img: fireboat, aspect: 2.246, length: 300 },
} as const
export type TrafficKind = keyof typeof TRAFFIC
export const ui = { hand: { img: hand, aspect: 0.811 }, lantern: { img: lantern, aspect: 0.803 } } as const
export const props = { laundry: { img: laundry, aspect: 3.821 }, passerella: { img: passerella, aspect: 8.678 } } as const

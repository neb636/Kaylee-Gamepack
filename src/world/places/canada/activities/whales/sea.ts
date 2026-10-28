// Whale Watch's sea off Tofino as data in meters (the build, the boat's bumps, the animals and the tap targets all read
// it). The town and its harbour are on the south shore (+z); the boat sets off from the dock facing north (-z), out
// past the lighthouse point and the sea lions' rock to the kelp bed where the otters float, then the open Pacific to
// the north, where the whales spout and the orca family swims. Islands with dark rainforest stand here and there.
//
// Heading: like engine3d/drive.ts, 0 faces +z and π/2 faces +x.

/** The south shore (the town) runs along this z; the land is beyond it. */
export const SHORE_Z = 86

/** The dock, sticking out from the town into the harbour. */
export const DOCK = { x: 8, z0: SHORE_Z, z1: 70, w: 3 }

/** Rocks and islands the boat bumps softly off: `r` at the waterline, `h` how tall. `trees` for the rainforest. */
export interface Isle {
  x: number
  z: number
  r: number
  h: number
  trees: number
}
export const LIGHTHOUSE_PT: Isle = { x: -36, z: 60, r: 11, h: 4.5, trees: 4 }
export const EAGLE_PT: Isle = { x: 44, z: 66, r: 13, h: 5, trees: 7 }
export const SEALION_ROCK: Isle = { x: 24, z: 36, r: 4.6, h: 1.4, trees: 0 }
export const PUFFIN_ROCK: Isle = { x: -44, z: -6, r: 5, h: 5.5, trees: 0 }
export const BIG_ISLE: Isle = { x: 60, z: -6, r: 19, h: 9, trees: 22 }
export const WEST_ISLE: Isle = { x: -78, z: -60, r: 16, h: 8, trees: 16 }
/** The tide pool's flat shelf at the foot of the sea lions' rock (the sea stars and anemones), and the harbour seals'
 *  low rock by the town, where they nap. */
export const TIDE_SHELF: Isle = { x: SEALION_ROCK.x - 4.2, z: SEALION_ROCK.z - 2.6, r: 2.8, h: 1, trees: 0 }
export const SEAL_ROCK: Isle = { x: -10, z: 64, r: 3.4, h: 0.9, trees: 0 }
export const ISLES: Isle[] = [LIGHTHOUSE_PT, EAGLE_PT, SEALION_ROCK, PUFFIN_ROCK, BIG_ISLE, WEST_ISLE, TIDE_SHELF, SEAL_ROCK]

/** The lighthouse on its point, and the eagle's dead tree on the other point. */
export const LIGHTHOUSE = { x: LIGHTHOUSE_PT.x + 2, z: LIGHTHOUSE_PT.z - 3 }
export const EAGLE_TREE = { x: EAGLE_PT.x - 5, z: EAGLE_PT.z - 6 }
/** The surfer rides the waves breaking on the big island's beach (its west side). */
export const SURF = { x: BIG_ISLE.x - BIG_ISLE.r - 4, z: BIG_ISLE.z + 4, len: 14 }

/** The kelp bed, the otters' raft in it, and where the sleepy ones drift off to (in order). */
export const KELP = { x: -14, z: 22, r: 14 }
export const RAFT = { x: -14, z: 20 }
export const DRIFTS = [
  { x: 6, z: 12 },
  { x: -30, z: 2 },
]

/** The boat's start for each section link. */
export const STARTS = {
  story: { x: DOCK.x - 3.2, z: 76, h: Math.PI },
  harbour: { x: DOCK.x - 3.2, z: 76, h: Math.PI },
  otters: { x: 2, z: 42, h: Math.PI + 0.35 },
  spouts: { x: -2, z: -6, h: Math.PI },
  orcas: { x: 0, z: -66, h: Math.PI - 0.3 },
  listen: { x: 0, z: -66, h: Math.PI - 0.3 },
} as const

/** The harbour gives way to the otters past this z; the open sea (the spouts) starts north of this. */
export const HARBOUR_END_Z = 52
/** Where the whales spout: inside this box, north of the kelp. */
export const SPOUT_BOX = { x0: -60, x1: 40, z0: -120, z1: -6 }
/** How far the boat may go from the middle of the sea (it turns gently back past it). */
export const SEA = { x: -6, z: -30, r: 150 }

/** Moves a point out of the islands and back onto the sea; returns the push-out normal of what it hit, if anything. */
export function keepOff(p: { x: number; z: number }, pad = 1.6): { nx: number; nz: number } | null {
  let hit: { nx: number; nz: number } | null = null
  for (const s of ISLES) {
    const dx = p.x - s.x
    const dz = p.z - s.z
    const d = Math.hypot(dx, dz)
    const r = s.r + pad
    if (d < r) {
      const nx = d > 1e-3 ? dx / d : 1
      const nz = d > 1e-3 ? dz / d : 0
      p.x = s.x + nx * r
      p.z = s.z + nz * r
      hit = { nx, nz }
    }
  }
  // The town's shore and the dock.
  if (p.z > SHORE_Z - pad) {
    p.z = SHORE_Z - pad
    hit = { nx: 0, nz: -1 }
  }
  // (Out the nearest way: off its end, or off one side.)
  const half = DOCK.w / 2 + pad
  if (p.z > DOCK.z1 - pad && Math.abs(p.x - DOCK.x) < half) {
    const side = p.x < DOCK.x ? -1 : 1
    const toSide = half - Math.abs(p.x - DOCK.x)
    const toEnd = p.z - (DOCK.z1 - pad)
    if (toEnd < toSide) {
      p.z = DOCK.z1 - pad
      hit = { nx: 0, nz: -1 }
    } else {
      p.x = DOCK.x + side * half
      hit = { nx: side, nz: 0 }
    }
  }
  return hit
}

/** True when a spot is open water, at least `pad` m from any island and the shore. */
export function open(x: number, z: number, pad: number) {
  if (z > SHORE_Z - pad) return false
  if (Math.hypot(x - SEA.x, z - SEA.z) > SEA.r - pad) return false
  return ISLES.every((s) => Math.hypot(x - s.x, z - s.z) > s.r + pad)
}

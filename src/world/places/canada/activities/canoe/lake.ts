// Red Canoe's lake as data in meters (the build, the canoe's shore and the tap targets all read it): an oval glacier
// lake in the Rockies, about 56 m across and 104 m long, lying south to north. The dock is at the south end (+z), the
// glacier comes down to the water at the north end (-z), and the glacier stream runs into the lake in the north-west
// corner, where its milky "rock flour" spreads out on the water. The mountains stand all round.
//
// Heading: like engine3d/drive.ts, 0 faces +z and π/2 faces +x; the canoe sets off from the dock facing north (π).

/** Half the lake's width (x) and length (z), before the shore's wobble. */
export const A = 28
export const B = 52

/** The shore's wobble round the oval (1 = on the oval), so it isn't a perfect ellipse. */
export function wob(theta: number) {
  return 1 + 0.06 * Math.sin(3 * theta + 0.4) + 0.035 * Math.sin(5 * theta + 1.3) + 0.02 * Math.sin(9 * theta)
}

/** How far out a point is: below 1 on the water, 1 on the shoreline, above 1 on land. */
export function shoreK(x: number, z: number) {
  const u = x / A
  const v = z / B
  return Math.hypot(u, v) / wob(Math.atan2(v, u))
}

/** The point at `k` times the shoreline's distance from the middle, in the direction `theta` (of the oval's angle). */
export function ringPoint(theta: number, k: number) {
  const r = wob(theta) * k
  return { x: Math.cos(theta) * A * r, z: Math.sin(theta) * B * r }
}

/** The land's height (m) at k: a pebble beach, a meadow, the forest, then up into the mountains. */
export const LAND: [k: number, y: number, color: string][] = [
  [0.93, -1.6, '#BDE6DA'],
  [1.0, 0.12, '#D9D1E2'],
  [1.035, 0.35, '#CFC6D6'],
  [1.08, 0.75, '#A6DDA4'],
  [1.2, 1.9, '#8CCF92'],
  [1.45, 5, '#6FB98B'],
  [1.85, 12, '#7FAE8E'],
  [2.5, 24, '#A9A1BA'],
  [4, 36, '#B9B2C9'],
]

/** The ground's height at a point (0 on the water: the lake's surface is y = 0). */
export function landY(x: number, z: number) {
  const k = shoreK(x, z)
  if (k <= LAND[0][0]) return LAND[0][1]
  for (let i = 1; i < LAND.length; i++) {
    const [k1, y1] = LAND[i]
    const [k0, y0] = LAND[i - 1]
    if (k <= k1) return y0 + ((y1 - y0) * (k - k0)) / (k1 - k0)
  }
  return LAND[LAND.length - 1][1]
}

/** How far out the canoe may go (shoreK of its middle): its bow and stern stay off the pebbles. */
export const PADDLE_K = 0.9

/** The canoe's start at the dock, and where each section link puts it. */
export const DOCK = { x: 5, z: 50 }
export const STARTS = {
  story: { x: 2.4, z: 45.4, h: Math.PI },
  glide: { x: 2.4, z: 45.4, h: Math.PI },
  stream: { x: -2, z: 4, h: Math.PI + 0.42 },
  loon: { x: -10, z: -20, h: Math.PI - 0.5 },
  glacier: { x: 2, z: -33, h: Math.PI },
} as const

/** The glacier: its tongue reaches the water along the north shore. */
export const GLACIER = { x: 2, z: -54, halfWidth: 12 }
/** The glacier stream's mouth, and the milky patch of rock flour spreading from it. */
export const MOUTH = { x: -21, z: -38 }
export const FLOUR = { x: -15.5, z: -30.5, r: 8.5 }
/** Where the loon family waits at the end, by the glacier. */
export const FAMILY = { x: 2, z: -40 }

/** Everyone round the shore. */
export const LODGE = { x: -25.5, z: 6 }
export const MOOSE = { x: 25, z: 13, h: -Math.PI / 2 - 0.5 }
/** Moraine Lake's famous rock pile at the outlet (south-east, beside the dock), the log jam in the outlet in front of
 *  it, the pika among its lower boulders and the marmot on top. */
export const ROCKPILE = { x: 20.5, z: 45, r: 6.5, top: 6 }
export const LOGJAM = { x: 15, z: 40.5 }
export const PIKA = { x: 16.6, z: 42.6 }
export const MARMOT = { x: 20.5, z: 44.2 }
export const SQUIRREL = { x: -6, z: 50 }
export const DUCKS = { x: -7, z: 28 }
/** A grey crag on the north-east shore under the Ten Peaks, with the mountain goat on its ledge. */
export const CLIFF = { x: 28.5, z: -31, h: 9 }
/** The bald eagle circles this high over the lake. */
export const EAGLE_Y = 16

/** Glide becomes "where the blue comes from" after she has paddled this far (m), or reached the milky water. */
export const GLIDE_M = 32

/** Moves a point (x, z) back onto the water, at most `k` out; returns how far it had to move it. */
export function keepOn(p: { x: number; z: number }, k = PADDLE_K) {
  const now = shoreK(p.x, p.z)
  if (now <= k) return 0
  const f = k / now
  const ox = p.x
  const oz = p.z
  p.x *= f
  p.z *= f
  return Math.hypot(p.x - ox, p.z - oz)
}

/** The way back toward the middle at a point (unit, on the water). */
export function inward(x: number, z: number) {
  // The oval's normal: the gradient of (x/A)² + (z/B)².
  const nx = x / (A * A)
  const nz = z / (B * B)
  const l = Math.hypot(nx, nz) || 1
  return { x: -nx / l, z: -nz / l }
}

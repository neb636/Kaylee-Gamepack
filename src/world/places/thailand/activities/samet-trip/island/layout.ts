// Koh Samet in game meters (plan: planning/around-the-world/thailand/samet-trip.md, "The island, from the real map").
// One source of truth for every piece of the trip: the jet ski bay now (greybox 1), the island to roam next.
//
// Real positions from OpenStreetMap (© OpenStreetMap contributors, ODbL), shrunk to 1:10 so walking between two
// beaches takes 10-30 seconds. Meters are game meters: x east, z south, from the middle of Hat Sai Kaew. The jet ski
// and the people stay full size; only the distances shrink.
//
// Plain data and math, no three.js: the sections file and the QA scripts may read it.

/** 1° of latitude and of longitude at 12.57° N, in meters, and the shrink. */
const LAT_M = 110_600
const LON_M = 108_600
export const SCALE = 1 / 10
/** The middle of Hat Sai Kaew (game 0, 0). */
export const ORIGIN = { lat: 12.5669, lon: 101.4651 }

export interface XZ {
  x: number
  z: number
}

/** A real place (lat, lon) in game meters. */
export function toGame(lat: number, lon: number): XZ {
  return { x: (lon - ORIGIN.lon) * LON_M * SCALE, z: -(lat - ORIGIN.lat) * LAT_M * SCALE }
}

export type PlaceId = 'nadan' | 'aonoina' | 'saikaew' | 'mermaid' | 'hinkhok' | 'phai' | 'wongduan' | 'prao' | 'deck' | 'viewpoint'

/** The places in the plan's table, from their real coordinates. */
export const PLACES: Record<PlaceId, { name: string; lat: number; lon: number } & XZ> = Object.fromEntries(
  (
    [
      ['nadan', 'Na Dan pier', 12.5749, 101.4635],
      ['aonoina', 'Ao Noi Na', 12.5747, 101.458],
      ['saikaew', 'Hat Sai Kaew', 12.5669, 101.4651],
      ['mermaid', 'The mermaid statue', 12.5658, 101.4618],
      ['hinkhok', 'Ao Hin Khok', 12.5655, 101.46],
      ['phai', 'Ao Phai', 12.5638, 101.4576],
      ['wongduan', 'Ao Wong Duan', 12.5538, 101.4512],
      ['prao', 'Ao Prao', 12.57, 101.4491],
      ['deck', 'The resort deck at Ao Prao', 12.5707, 101.4494],
      ['viewpoint', 'The sunset viewpoint', 12.5548, 101.4468],
    ] as const
  ).map(([id, name, lat, lon]) => [id, { name, lat, lon, ...toGame(lat, lon) }]),
) as Record<PlaceId, { name: string; lat: number; lon: number } & XZ>

/** The island's coastline (OSM way 26609854, natural=coastline "Ko Samet": land on its left) at 1:10, simplified to
 *  within 0.5 m: x, z pairs going round once. The south half is there too (green hills on the horizon). */
// prettier-ignore
const COAST_XZ = [
  -202.9, 200.0, -213.5, 229.0, -214.0, 240.4, -209.2, 249.2, -207.8, 260.0, -209.8, 262.9, -210.3, 269.1, -209.3,
  275.5, -212.9, 278.4, -215.3, 284.7, -216.0, 290.1, -214.2, 320.6, -213.1, 321.5, -213.0, 326.4, -214.3, 328.5,
  -212.9, 346.6, -213.7, 350.4, -217.5, 357.4, -219.9, 366.1, -219.8, 370.7, -222.7, 377.2, -221.7, 385.0, -224.1,
  388.5, -229.1, 391.8, -233.4, 392.4, -236.3, 394.2, -237.5, 394.1, -238.1, 395.0, -239.0, 394.5, -239.0, 396.1,
  -239.7, 395.9, -240.2, 397.1, -241.0, 400.5, -239.6, 400.8, -238.8, 403.9, -237.6, 404.0, -237.4, 406.8, -236.7,
  407.5, -238.6, 409.1, -238.6, 416.9, -237.9, 417.0, -237.8, 419.8, -238.9, 420.8, -239.1, 425.1, -240.2, 426.6,
  -241.9, 426.3, -244.6, 428.5, -245.1, 430.6, -247.5, 432.2, -248.4, 431.7, -249.7, 433.3, -251.8, 433.6, -252.7,
  436.3, -247.9, 441.2, -247.2, 446.9, -246.2, 447.1, -246.3, 448.0, -245.3, 448.9, -245.8, 450.9, -244.4, 451.6,
  -244.7, 452.7, -243.8, 452.8, -243.8, 456.1, -241.2, 460.0, -239.6, 460.5, -237.8, 464.5, -237.4, 463.8, -237.1,
  465.0, -236.8, 464.0, -235.6, 466.3, -234.6, 465.8, -235.0, 468.2, -234.2, 468.0, -233.4, 469.3, -237.1, 478.1,
  -241.7, 481.9, -242.2, 485.2, -243.4, 485.6, -243.7, 486.7, -243.7, 492.0, -241.9, 492.3, -241.3, 495.2, -240.6,
  494.4, -240.1, 498.9, -238.8, 497.5, -238.1, 498.8, -237.6, 498.1, -237.3, 498.8, -235.7, 498.5, -234.4, 497.0,
  -234.6, 495.8, -233.8, 495.9, -232.2, 489.8, -230.3, 489.1, -227.9, 489.4, -225.6, 493.1, -222.3, 493.6, -221.8,
  497.3, -219.7, 499.8, -218.1, 497.9, -218.6, 494.2, -218.1, 492.8, -219.6, 486.2, -219.5, 484.0, -221.7, 477.4,
  -221.2, 473.3, -216.9, 469.3, -216.5, 465.1, -212.5, 461.1, -202.2, 467.2, -195.0, 467.6, -213.3, 455.8, -214.6,
  450.6, -214.7, 446.4, -211.1, 437.7, -212.3, 424.6, -208.9, 414.9, -210.3, 411.1, -207.2, 400.3, -203.8, 394.9,
  -198.1, 390.4, -194.5, 392.7, -182.2, 388.0, -180.1, 381.9, -180.8, 378.7, -179.6, 375.0, -176.9, 372.6, -175.4,
  366.2, -174.1, 365.5, -174.8, 355.8, -177.1, 348.6, -180.7, 344.1, -180.4, 335.2, -178.8, 333.1, -178.4, 328.1,
  -179.1, 323.6, -181.5, 322.0, -182.4, 318.9, -183.9, 318.3, -183.4, 313.8, -180.1, 305.0, -173.7, 298.9, -167.3,
  296.5, -158.3, 303.1, -157.5, 301.6, -158.6, 297.5, -166.4, 291.2, -166.0, 287.3, -163.1, 285.5, -162.6, 284.4,
  -160.7, 284.2, -163.0, 280.0, -169.4, 272.5, -175.2, 261.4, -176.6, 254.7, -180.0, 246.8, -183.2, 244.8, -187.0,
  244.0, -188.2, 242.4, -190.1, 234.3, -190.3, 228.3, -186.1, 220.9, -185.1, 213.4, -183.9, 212.9, -179.6, 206.2,
  -169.9, 194.6, -166.3, 190.7, -161.7, 191.3, -158.2, 189.1, -155.0, 188.6, -152.6, 185.7, -152.0, 182.4, -153.1,
  178.9, -149.9, 175.7, -149.6, 172.2, -158.7, 160.8, -160.4, 160.8, -161.0, 162.4, -163.1, 162.5, -164.7, 157.5,
  -164.2, 152.6, -158.9, 141.2, -152.1, 133.8, -143.2, 130.0, -135.8, 129.2, -135.2, 132.0, -129.7, 136.4, -123.3,
  143.5, -121.5, 143.8, -120.0, 142.1, -124.6, 133.7, -127.3, 125.4, -129.0, 123.9, -127.1, 113.0, -125.3, 109.4,
  -119.3, 104.3, -112.7, 106.2, -110.0, 102.8, -109.2, 99.9, -109.9, 96.7, -109.1, 95.5, -109.4, 92.5, -108.4, 91.9,
  -109.2, 90.7, -109.3, 87.5, -103.8, 81.7, -101.5, 82.6, -99.1, 81.7, -97.9, 79.8, -96.0, 81.2, -96.7, 77.6, -95.4,
  76.6, -98.0, 73.4, -100.4, 66.8, -100.5, 63.9, -98.8, 60.1, -92.4, 54.3, -91.0, 55.4, -87.7, 53.4, -86.8, 54.7,
  -86.2, 54.4, -86.7, 53.6, -84.5, 51.2, -83.0, 46.0, -84.8, 41.2, -80.4, 34.1, -75.2, 28.9, -73.7, 28.9, -71.3, 26.4,
  -65.5, 22.8, -49.8, 15.6, -39.2, 12.1, -36.9, 11.6, -36.3, 12.8, -23.6, 9.4, -9.8, 4.0, 13.9, -6.9, 26.6, -10.3,
  30.3, -10.8, 36.3, -10.3, 38.3, -9.3, 37.3, -8.5, 38.2, -7.4, 38.1, -4.1, 37.1, -1.8, 40.5, 0.8, 42.1, 0.2, 41.1,
  3.2, 42.1, 3.6, 43.3, 2.5, 43.8, 3.4, 44.6, 3.1, 44.4, 4.8, 45.3, 5.5, 48.8, 2.3, 55.2, -7.4, 55.5, -9.6, 54.1,
  -14.5, 51.9, -17.7, 41.4, -26.9, 38.8, -37.3, 35.6, -39.6, 34.9, -47.7, 38.7, -56.0, 36.5, -58.2, 33.3, -59.8, 19.2,
  -60.9, 14.8, -63.0, 12.2, -63.4, 8.6, -65.8, 0.1, -76.5, -0.1, -84.7, -1.7, -89.4, -3.3, -91.4, -4.2, -91.5, -5.3,
  -90.0, -4.3, -87.8, -5.5, -85.6, -5.9, -81.7, -11.4, -79.6, -23.0, -81.3, -27.7, -84.2, -32.3, -88.3, -37.0, -88.2,
  -37.2, -87.2, -40.8, -83.6, -43.8, -81.7, -47.4, -80.9, -59.0, -80.5, -65.1, -81.6, -69.5, -83.3, -77.4, -90.0,
  -94.1, -109.5, -98.1, -110.2, -98.0, -111.9, -99.9, -112.0, -100.2, -108.8, -102.3, -107.0, -106.2, -107.9, -123.0,
  -120.8, -129.5, -126.8, -135.2, -135.5, -142.9, -152.3, -148.3, -167.6, -149.9, -177.6, -154.9, -175.5, -158.8,
  -175.6, -159.0, -174.7, -164.5, -176.1, -165.9, -175.5, -169.1, -170.5, -170.8, -166.0, -180.2, -162.0, -187.3,
  -152.1, -193.5, -148.4, -196.3, -148.4, -202.5, -153.3, -204.2, -153.9, -210.9, -147.6, -213.1, -139.9, -212.0,
  -138.9, -210.6, -140.3, -209.7, -140.1, -210.2, -137.7, -208.1, -134.7, -205.4, -133.7, -203.7, -130.6, -203.9,
  -124.5, -201.8, -121.0, -198.2, -111.1, -197.7, -107.8, -201.9, -96.3, -201.5, -91.5, -198.6, -83.3, -199.5, -71.7,
  -201.0, -66.6, -199.7, -62.8, -194.4, -60.1, -179.6, -54.8, -172.1, -39.6, -170.0, -26.6, -170.3, -23.3, -173.3,
  -15.9, -177.3, -12.3, -179.6, -13.8, -184.0, -13.8, -186.5, -12.6, -186.6, -11.3, -190.4, -8.9, -195.7, -9.2,
  -199.2, -7.1, -199.3, -4.8, -195.9, 2.0, -194.8, 2.4, -195.3, 3.5, -192.5, 8.0, -187.3, 12.4, -188.1, 17.2, -191.0,
  20.4, -191.1, 23.3, -193.2, 23.4, -193.9, 27.3, -195.3, 27.7, -194.6, 31.4, -188.4, 36.9, -187.2, 40.0, -184.9,
  40.6, -185.2, 43.4, -183.9, 45.9, -181.9, 48.0, -179.8, 48.0, -181.2, 53.7, -180.3, 60.0, -181.7, 62.0, -182.8,
  67.6, -187.6, 73.0, -190.7, 74.7, -195.6, 80.2, -197.9, 84.6, -198.6, 87.7, -198.5, 92.9, -196.3, 99.3, -193.3,
  99.8, -192.5, 116.7, -195.9, 121.5, -198.5, 123.0, -199.6, 125.8, -198.0, 128.3, -199.7, 134.5, -198.8, 142.5,
  -203.8, 148.9, -201.6, 160.0, -202.8, 169.2, -207.1, 178.7
]
export const COAST: XZ[] = Array.from({ length: COAST_XZ.length / 2 }, (_, i) => ({ x: COAST_XZ[i * 2], z: COAST_XZ[i * 2 + 1] }))

/** The beaches' sand (OSM natural=beach), x, z pairs round each. On land near one, the sand is wide and flat; elsewhere
 *  the shore is granite rocks and the hill rises quickly. */
// prettier-ignore
const BEACH_XZ: { name: string; osm: number; xz: number[] }[] = [
  { name: "Had Sai Kaew", osm: 96477683, xz: [37.0, -11.3, 32.0, -12.6, 27.3, -12.8, 21.3, -12.3, 15.6, -10.9, 6.9, -7.5, 5.7, -5.6, 2.8, -5.1, -16.4, 3.9, -37.9, 9.3, -36.3, 12.8, -27.3, 10.4, -9.8, 4.0, 13.9, -6.9, 30.3, -10.8, 36.3, -10.3, 38.3, -9.3, 38.8, -9.8] },
  { name: "a little beach", osm: 172879380, xz: [35.7, -38.8, 35.0, -38.3, 37.1, -36.6, 39.7, -28.3, 41.4, -26.9, 39.3, -35.8, 38.6, -36.6, 37.4, -36.5, 37.4, -37.8, 36.0, -39.1] },
  { name: "Ao Phai Beach", osm: 211483783, xz: [-75.9, 29.3, -76.7, 27.4, -84.0, 34.1, -86.3, 38.0, -86.3, 40.6, -85.8, 41.2, -84.8, 41.2, -80.4, 34.1] },
  { name: "a little beach", osm: 211483784, xz: [-69.6, 22.6, -65.4, 18.9, -43.5, 10.7, -37.9, 9.3, -36.9, 11.6, -43.5, 13.3, -56.5, 18.4, -65.5, 22.8, -68.6, 25.3] },
  { name: "Phutsa Beach", osm: 211484470, xz: [-93.5, 52.8, -92.4, 54.3, -98.8, 60.1, -100.5, 63.9, -100.6, 66.8, -102.0, 67.3, -103.2, 65.1, -102.5, 61.1, -99.7, 57.3] },
  { name: "Luk Yon", osm: 240058000, xz: [0.0, -75.5, 6.4, -66.9, 8.8, -65.7, 1.3, -75.3, 0.1, -76.5] },
  { name: "Cho Beach", osm: 240058003, xz: [-129.9, 123.4, -131.2, 122.3, -131.0, 118.5, -130.6, 116.2, -128.8, 112.5, -121.5, 103.3, -119.1, 103.5, -119.3, 104.3, -122.3, 106.2, -125.3, 109.4, -127.1, 113.0, -129.0, 123.9] },
  { name: "Wong Duean Beach", osm: 240058005, xz: [-163.7, 162.2, -166.1, 157.3, -166.4, 155.5, -163.8, 146.4, -159.8, 138.2, -149.2, 130.4, -144.6, 128.7, -136.2, 128.2, -135.8, 129.2, -143.2, 130.0, -152.1, 133.8, -157.5, 139.2, -158.9, 141.2, -164.2, 152.6, -164.7, 157.5, -163.1, 162.5] },
  { name: "Nuan Beach", osm: 240058006, xz: [-110.4, 85.4, -106.4, 81.6, -103.8, 81.7, -109.3, 87.5] },
  { name: "a little beach", osm: 475711102, xz: [-16.7, -80.6, -16.5, -79.6, -11.4, -79.0, -5.7, -81.1, -5.9, -81.7, -11.4, -79.6] },
  { name: "Wiang Wan Beach", osm: 475711103, xz: [-149.0, -174.2, -150.1, -172.0, -147.8, -161.3, -144.3, -152.6, -134.3, -132.7, -128.0, -124.1, -127.5, -124.6, -129.7, -126.9, -135.2, -135.5, -142.9, -152.3, -148.3, -167.6] },
  // Not in OSM's beaches: drawn along the coast here so Ao Noi Na (a deep-link spot, the hammock) has sand to stand on.
  { name: "Ao Noi Na", osm: 0, xz: [-66.0, -81.8, -69.5, -83.3, -77.4, -90.0, -84.0, -97.7] },
  { name: "Ao Prao Beach", osm: 475711104, xz: [-174.3, -14.4, -173.3, -14.0, -168.5, -24.8, -168.8, -30.4, -169.9, -37.2, -175.2, -49.5, -178.5, -55.6, -179.6, -54.8, -173.2, -42.5, -171.6, -38.1, -170.0, -26.6, -170.3, -23.3] },
]
export const BEACHES = BEACH_XZ.map((b) => ({ name: b.name, osm: b.osm, pts: Array.from({ length: b.xz.length / 2 }, (_, i) => ({ x: b.xz[i * 2], z: b.xz[i * 2 + 1] })) }))

/** Inside the island's outline? */
export function onLand(x: number, z: number, poly: XZ[] = COAST) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]
    const b = poly[j]
    if (a.z > z !== b.z > z && x < ((b.x - a.x) * (z - a.z)) / (b.z - a.z) + a.x) inside = !inside
  }
  return inside
}

/** Meters from (x, z) to the coastline: positive out at sea, negative on land. */
export function shoreDistance(x: number, z: number, poly: XZ[] = COAST) {
  let best = Infinity
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[j]
    const b = poly[i]
    const dx = b.x - a.x
    const dz = b.z - a.z
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz || 1)))
    best = Math.min(best, Math.hypot(x - a.x - dx * t, z - a.z - dz * t))
  }
  return onLand(x, z, poly) ? -best : best
}


// ---------------------------------------------------------------- Sai Kaew: the jet ski bay (greybox 1)
//
// Hat Sai Kaew's sand (OSM's beach polygon) runs west-north-west to east-south-east, from the mermaid's rocks to the
// little headland at its east end, and faces the open sea to the south-south-east. Everything in the bay is laid out
// in the beach's own frame: `u` meters along the sand (east is +), `v` meters out to sea from the waterline in the
// middle of the beach. The jet skis wait at the water's edge in front of the hut, like in Dad's photo; a rope of buoys
// keeps them in a safe square, and in the race the rope opens out to the big orange buoy.

/** The waterline in the middle of the beach, and the beach's frame there. */
export const BAY = {
  x: 8,
  z: -4.3,
  /** Along the sand (unit, toward the headland). */
  t: { x: 0.951, z: -0.309 },
  /** Out to sea (unit). */
  n: { x: 0.309, z: 0.951 },
}
/** A point in the beach's frame (u along the sand, v out to sea) in game meters. */
export function bay(u: number, v: number): XZ {
  return { x: BAY.x + BAY.t.x * u + BAY.n.x * v, z: BAY.z + BAY.t.z * u + BAY.n.z * v }
}
/** And back: a game point in the beach's frame. */
export function toBay(x: number, z: number) {
  const dx = x - BAY.x
  const dz = z - BAY.z
  return { u: dx * BAY.t.x + dz * BAY.t.z, v: dx * BAY.n.x + dz * BAY.n.z }
}
/** Heading out to sea (0 = +z, toward +x as it grows: atan2(dx, dz)). */
export const SEAWARD = Math.atan2(BAY.n.x, BAY.n.z)

/** The jet ski hut on the sand (its bell hangs on the front post), facing the sea. */
export const HUT = bay(-3, -9)
/** Where the jet ski waits at the water's edge, nose to the sea. */
export const LAUNCH = bay(0, 1.2)
/** Mommy watching at the water's edge (she gets splashed). */
export const MOMMY = bay(-9, -1.2)
/** The rope square, per round, in the beach's frame: u from `w` to `e` along the sand, out to `out` meters. Its beach
 *  side is the sand, so the rope only shows where it's in the water. Bigger waves need more room; the race opens it
 *  out to the far buoy. */
export const ROPE = {
  ride: { w: -36, e: 40, out: 70 },
  waves: { w: -40, e: 44, out: 92 },
  race: { w: -40, e: 44, out: 136 },
} as const
export type RoundId = keyof typeof ROPE
/** The big orange buoy the race goes round. */
export const FAR_BUOY = bay(0, 118)
/** The race: start side by side off the hut, round the far buoy, back between the two flag buoys at the beach. */
export const RACE = {
  start: [bay(-4.5, 5), bay(4.5, 5)],
  /** The finish: back inside `v` meters of the sand between the flags (u from w to e). */
  finish: { v: 10, w: -13, e: 13 },
  /** Round the buoy this close. */
  round: 12,
}
/** Swimmers by the beach (inside the rope, near the sand). */
export const SWIMMERS: XZ[] = [bay(-15, 5), bay(16, 6), bay(25, 4), bay(-27, 8)]
/** Umbrellas and chairs along the sand (u, v: v is negative up the beach). */
export const UMBRELLAS: { u: number; v: number }[] = [-30, -24, -18, 10, 16, 22, 28, 34].map((u, i) => ({ u, v: -6 - (i % 2) * 2.5 }))
/** The banana boat's loop, out past the ride's rope (it whooshes past): a center and radii in the beach's frame. */
export const BANANA = { u: 0, v: 104, ru: 62, rv: 18 }
/** The way the waves roll (toward the beach, a little slanted). */
export const WAVE_DIR = { x: -BAY.n.x * 0.97 - BAY.t.x * 0.24, z: -BAY.n.z * 0.97 - BAY.t.z * 0.24 }
/** Far islands on the horizon (Ko Kudi and its neighbors, 5 km east, so 520 game meters) and the mainland's hills. */
export const KO_KUDI = toGame(12.5842, 101.5096)
export const BAN_PHE = toGame(12.6266, 101.4424)


// ---------------------------------------------------------------- the island to roam (greybox 2)
//
// The ways across the island (in OSM's spirit, not traced: the real roads are a tangle of concrete and dirt): the
// concrete road from Na Dan pier down to Sai Kaew, over the spine to Ao Prao and down the middle to Ao Wong Duan (the
// green taxi's), and the sandy paths over the rocks between the east coast's beaches, along the north shore to Ao Noi
// Na and out to the sunset viewpoint. Control points are rough; `inland()` pushes any that fall in the sea (or on the
// sand's front edge) back onto the land, and the ways are smoothed and sampled every 2 m at load.

export type WayKind = 'road' | 'path'
export interface Way {
  id: string
  kind: WayKind
  /** Meters wide (the walkable strip; the ground is flattened a little wider). */
  width: number
  pts: XZ[]
}

/** Moves a point along the shore's slope until it's `depth` meters inland (if it isn't already). */
export function inland(p: XZ, depth: number): XZ {
  let { x, z } = p
  for (let i = 0; i < 6; i++) {
    const s = shoreDistance(x, z)
    if (s <= -depth + 0.25) break
    const gx = (shoreDistance(x + 0.5, z) - shoreDistance(x - 0.5, z)) / 1
    const gz = (shoreDistance(x, z + 0.5) - shoreDistance(x, z - 0.5)) / 1
    const l = Math.hypot(gx, gz) || 1
    const k = s + depth
    x -= (gx / l) * k
    z -= (gz / l) * k
  }
  return { x, z }
}

/** Catmull-Rom through the points, sampled about every `step` meters. */
function smoothLine(pts: XZ[], step = 2): XZ[] {
  const out: XZ[] = []
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const n = Math.max(1, Math.round(Math.hypot(p2.x - p1.x, p2.z - p1.z) / step))
    for (let k = 0; k < n; k++) {
      const t = k / n
      const t2 = t * t
      const t3 = t2 * t
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
      out.push({ x: f(p0.x, p1.x, p2.x, p3.x), z: f(p0.z, p1.z, p2.z, p3.z) })
    }
  }
  out.push(pts[pts.length - 1])
  return out
}

const way = (id: string, kind: WayKind, width: number, depth: number, raw: [number, number][]): Way => ({ id, kind, width, pts: smoothLine(raw.map(([x, z]) => inland({ x, z }, depth))) })

/** The road's ends and corners, shared by the taxi's route. */
const J = { nadan: [-14, -74], saikaew: [-6, -17], north: [-14, -40], spine: [-85, -46], prao: [-153, -37], wongduan: [-146, 121] } as const

export const WAYS: Way[] = [
  way('road-nadan', 'road', 3.4, 3, [[...J.nadan], [-13, -62], [-12, -52], [...J.north], [-11, -27], [...J.saikaew]]),
  way('road-prao', 'road', 3.4, 3, [[...J.north], [-36, -43], [-60, -45], [...J.spine], [-110, -44], [-134, -40], [...J.prao]]),
  way('road-wongduan', 'road', 3.4, 3, [[...J.spine], [-95, -20], [-104, 10], [-111, 40], [-121, 70], [-134, 100], [...J.wongduan]]),
  way('path-east', 'path', 2.4, 6, [[-30, 9], [-46, 16], [-60, 20], [-72, 27], [-80, 36], [-90, 50], [-98, 62], [-104, 74], [-108, 86], [-116, 98], [-124, 108], [-130, 120], [-138, 130]]),
  way('path-noina', 'path', 2.4, 5, [[-12, -80], [-30, -80], [-45, -80], [-60, -82], [-74, -84]]),
  way('path-view', 'path', 2.4, 4, [[-134, 100], [-160, 112], [-180, 124], [-194, 131]]),
  way('path-prao', 'path', 2.4, 7, [[-153, -37], [-160, -40], [-166, -46]]),
]

/** Open grass the forest keeps clear of (a beach bar's yard, the resort, the village by the pier): center and radius. */
export const CLEARINGS: (XZ & { r: number })[] = [
  { ...inland({ x: -14, z: -72 }, 6), r: 9 },
  { x: -6, z: -22, r: 7 },
  { x: -152, z: -38, r: 7 },
  { x: -146, z: 120, r: 7 },
  { x: -194, z: 131, r: 5 },
]

/** The stops (any order), each with its pink flag's beach and the thing that opens it. */
export type StopId = 'jetski' | 'sandcastle' | 'snorkel' | 'hideseek'
export const STOPS: Record<StopId, { place: PlaceId; at: XZ; name: string }> = {
  jetski: { place: 'saikaew', at: bay(0, 1.2), name: 'The jet ski at Hat Sai Kaew' },
  sandcastle: { place: 'hinkhok', at: inland({ x: -55, z: 17 }, 5), name: 'The sandcastle at Ao Hin Khok' },
  snorkel: { place: 'wongduan', at: { x: -150, z: 136 }, name: 'The snorkel boat at Ao Wong Duan' },
  hideseek: { place: 'prao', at: inland({ x: -172, z: -28 }, 6), name: 'The driftwood tree at Ao Prao' },
}
export const STOP_IDS = Object.keys(STOPS) as StopId[]

/** A beach's frame where it meets the sea: a waterline point, along the sand and out to sea. */
export interface Frame extends XZ {
  t: XZ
  n: XZ
}
/** The frame at the coast nearest a point. */
export function frameNear(p: XZ): Frame {
  const g = (x: number, z: number) => shoreDistance(x, z)
  let q = { ...p }
  for (let i = 0; i < 5; i++) {
    const s = g(q.x, q.z)
    const gx = g(q.x + 0.5, q.z) - g(q.x - 0.5, q.z)
    const gz = g(q.x, q.z + 0.5) - g(q.x, q.z - 0.5)
    const l = Math.hypot(gx, gz) || 1
    q = { x: q.x - (gx / l) * s, z: q.z - (gz / l) * s }
  }
  const gx = g(q.x + 2, q.z) - g(q.x - 2, q.z)
  const gz = g(q.x, q.z + 2) - g(q.x, q.z - 2)
  const l = Math.hypot(gx, gz) || 1
  const n = { x: gx / l, z: gz / l }
  return { x: q.x, z: q.z, n, t: { x: n.z, z: -n.x } }
}
/** A point in a frame: `u` along the sand, `v` out to sea (negative: up the beach). */
export function at(f: Frame, u: number, v: number): XZ {
  return { x: f.x + f.t.x * u + f.n.x * v, z: f.z + f.t.z * u + f.n.z * v }
}

/** Where she can land on a deep link (`at`), and the beaches' frames (the camera looks out to sea from each). */
export type SpotId = 'nadan' | 'saikaew' | 'hinkhok' | 'phai' | 'wongduan' | 'prao' | 'deck' | 'aonoina'
export const SPOT_IDS: SpotId[] = ['nadan', 'saikaew', 'hinkhok', 'phai', 'wongduan', 'prao', 'deck', 'aonoina']
export const FRAMES: Record<Exclude<SpotId, 'deck'>, Frame> = {
  nadan: frameNear({ x: -11, z: -80 }),
  saikaew: { x: BAY.x, z: BAY.z, t: BAY.t, n: BAY.n },
  hinkhok: frameNear({ x: -55, z: 16 }),
  phai: frameNear({ x: -80, z: 33 }),
  wongduan: frameNear({ x: -150, z: 140 }),
  prao: frameNear({ x: -171, z: -32 }),
  aonoina: frameNear({ x: -76, z: -85 }),
}

/** The resort deck above Ao Prao (lunch: a place, not a stop yet), up the slope behind the sand. Its steps (`steps`
 *  wide, in the middle of the sea side) come down to the sand: behind it the slope is forest. */
export const DECK = { ...at(FRAMES.prao, 10, -16.5), t: FRAMES.prao.t, n: FRAMES.prao.n, face: Math.atan2(FRAMES.prao.n.x, FRAMES.prao.n.z), w: 9, d: 6, y: 2.2, steps: 2.8 }
/** Na Dan pier: from the sand out into the bay (where the speedboat ties up). */
export const PIER = { from: at(FRAMES.nadan, -4, -1), to: at(FRAMES.nadan, -4, 26), w: 3.2, y: 1.1 }

/** Where she stands on arrival at each spot (a few meters up the sand, looking out to sea). */
export function spotStart(id: SpotId): XZ & { face: number } {
  if (id === 'deck') return { x: DECK.x, z: DECK.z, face: DECK.face }
  if (id === 'nadan') {
    const p = at(FRAMES.nadan, -4, 18)
    return { ...p, face: Math.atan2(-FRAMES.nadan.n.x, -FRAMES.nadan.n.z) }
  }
  const f = FRAMES[id]
  const p = at(f, id === 'saikaew' ? -6 : id === 'hinkhok' ? -7 : id === 'prao' ? -4 : 0, -3)
  return { ...p, face: Math.atan2(f.n.x, f.n.z) }
}

/** The green taxi's stops, in the order it drives round, and the road it takes between them. */
export const TAXI_STOPS: { id: SpotId; at: XZ }[] = [
  { id: 'nadan', at: { x: J.nadan[0], z: J.nadan[1] } },
  { id: 'saikaew', at: { x: J.saikaew[0], z: J.saikaew[1] } },
  { id: 'prao', at: { x: J.prao[0], z: J.prao[1] } },
  { id: 'wongduan', at: { x: J.wongduan[0], z: J.wongduan[1] } },
]

/** Jet skis waiting at the water's edge on every beach once the jet ski is hers. */
export const PARKED: { id: SpotId; at: XZ; face: number }[] = (['saikaew', 'hinkhok', 'phai', 'wongduan', 'prao', 'nadan'] as const).map((id) => {
  const f = FRAMES[id]
  const p = id === 'saikaew' ? bay(-3, 1.4) : at(f, id === 'nadan' ? 6 : 4, id === 'nadan' ? 3 : 1.2)
  return { id, at: p, face: Math.atan2(f.n.x, f.n.z) }
})

/** The things to poke, island-wide (each a tap target when she's near). `at` is on the ground. */
export type PokeKind = 'palm' | 'samet' | 'umbrella' | 'chair' | 'ball' | 'icecream' | 'beads' | 'crab' | 'bush' | 'longtail' | 'speedboat' | 'hammock' | 'telescope' | 'tamarind' | 'deckbrella' | 'lantern'
export interface Poke {
  id: string
  kind: PokeKind
  at: XZ
}
const pokes: Poke[] = []
const add = (kind: PokeKind, p: XZ) => pokes.push({ id: `${kind}:${pokes.filter((q) => q.kind === kind).length}`, kind, at: p })
// Coconut palms (bonk: a coconut drops) and samet trees (the papery bark peels), at the back of the sand on each beach.
for (const [id, us] of [['saikaew', [-20, 4, 26]], ['hinkhok', [-6, 6]], ['phai', [-3, 5]], ['wongduan', [-8, 6]], ['prao', [-4, 6]], ['nadan', [8]], ['aonoina', [-3, 4]]] as const)
  for (const u of us) add('palm', at(FRAMES[id], u, id === 'saikaew' ? -12.5 : -11.5))
// (Ao Prao's stands beside the resort deck's end, clear of its steps.)
for (const [id, u] of [['saikaew', -10], ['hinkhok', 0], ['prao', 15.5], ['wongduan', 1]] as const) add('samet', at(FRAMES[id], u, -13.5))
// Pink umbrellas (spin; poke one three times and it takes off like a kite with Kaylee holding on) and red chairs (fold up).
// (Ao Prao's third stands beside the foot of the resort deck's steps, its loungers clear of them.)
for (const [id, us] of [['hinkhok', [-4, 3]], ['phai', [0]], ['wongduan', [-4, 4]], ['prao', [-7, -1, 14]]] as const) for (const u of us) add('umbrella', at(FRAMES[id], u, -6))
for (const u of [-6, -2, 3, 7]) add('chair', at(FRAMES.prao, u, -3.6))
add('ball', at(FRAMES.hinkhok, 3, -2.5))
add('icecream', bay(-14, -10))
add('beads', bay(12, -3.5))
for (const [id, u, v] of [['saikaew', -24, -3], ['saikaew', 30, -2.5], ['hinkhok', -3, -1.5], ['phai', 2, -2], ['wongduan', 2, -2], ['prao', 0, -2.5], ['aonoina', 0, -2]] as const) add('crab', at(FRAMES[id], u, v))
// Pink bougainvillea along the paths (petals burst).
for (const p of [{ x: -9, z: -36 }, { x: -60, z: -48 }, { x: -120, z: 64 }, { x: -136, z: -44 }, { x: -86, z: 44 }]) add('bush', inland(p, 4))
add('longtail', at(FRAMES.nadan, 4, 7))
add('longtail', at(FRAMES.wongduan, -9, 7))
add('speedboat', at(FRAMES.nadan, -7.5, 22))
add('hammock', at(FRAMES.aonoina, 0, -9))
add('telescope', { x: -193, z: 132 })
add('tamarind', at(FRAMES.wongduan, -2, -16))
add('deckbrella', at(DECK, -2.5, 0))
add('deckbrella', at(DECK, 2.5, 0))
export const POKES: Poke[] = pokes

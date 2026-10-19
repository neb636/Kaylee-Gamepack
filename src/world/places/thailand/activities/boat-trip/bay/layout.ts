// Phang Nga Bay: the one source of truth in meters (pure data, no three.js). The scene, the bumps, the cameras and the
// starting spots all read it. Top view, north is -z, heading 0 faces +z (south):
//
//            (Ko Tapu + buoys)                         ( hong )
//      [Khao Phing Kan beach]          karsts       ring of cliffs, tunnel on its south side
//                       karsts   open water, the tour boat's loop      [canoe raft]
//  (village rock)                 [macaques]                    karsts
//   [Koh Panyee: stilt houses, the floating field]   [pier]  ← start
//                         ~~~~~~~~ the south shore ~~~~~~~~
//
// About 15-25 s of driving between stops at cruising speed: long enough to play on the way, short enough that she
// gets somewhere new every half minute.

export type XZ = [number, number]
/** A rock in the water: center, radius at the waterline, height. */
export type Rock = { x: number; z: number; r: number; h: number }

export const SHORE_Z = 108
export const PIER = { x: -2.2, z0: 86, z1: SHORE_Z + 2, w: 3 }
/** Where the longtail waits at the pier, and where it starts in open water. */
export const MOORED = { x: 1.1, z: 90, heading: Math.PI }
export const BAY_START = { x: 0, z: 62, heading: Math.PI }

/** The hong: a ring of cliffs around a hidden lagoon, the tunnel through its south side. */
export const HONG = { x: 95, z: -40, inner: 16, outer: 34, h: 30 }
export const TUNNEL = {
  x: HONG.x,
  /** Half its width. */
  half: 1.55,
  /** From the outside mouth (south) to where it opens into the lagoon. */
  z0: HONG.z + 37,
  z1: HONG.z + 15,
}
/** The roof over the canoe along the tunnel (meters above the water): low enough in the middle that everyone has to
 *  lie down (Daddy's horn bonks first, he's the tallest). */
export function tunnelRoof(z: number) {
  const s = (TUNNEL.z0 - z) / (TUNNEL.z0 - TUNNEL.z1)
  if (s <= 0) return 3.4
  if (s >= 1) return 3.2
  // Down slowly (about a canoe length between Daddy's bonk, Mommy's and Kaylee's), low for a while, then up to the
  // light.
  if (s < 0.45) return 3.4 - (3.4 - 1.15) * (s / 0.45)
  if (s < 0.8) return 1.15
  return 1.15 + (3.2 - 1.15) * ((s - 0.8) / 0.2)
}
/** Out of the hong: a glow at the tunnel's inner mouth. */
export const EXIT_GLOW = { x: TUNNEL.x, z: TUNNEL.z1 - 3, r: 2.4 }
/** The canoe waits at a little raft by the mouth; the longtail parks beside it. */
export const RAFT = { x: TUNNEL.x, z: TUNNEL.z0 + 3.6 }
export const CANOE_START = { x: TUNNEL.x, z: TUNNEL.z0 + 2.2, heading: Math.PI }
export const LONGTAIL_PARK = { x: TUNNEL.x + 4.6, z: TUNNEL.z0 + 6.5, heading: 0.15 }
/** Drive the longtail into this glow to swap into the canoe. */
export const CAVE_GLOW = { x: TUNNEL.x + 1.5, z: TUNNEL.z0 + 7.5, r: 6 }

/** Ko Tapu, the Nail Island: thin at the waterline, wider at the top; the buoys keep boats back. */
export const NAIL = { x: -85, z: -110, r: 2.6, top: 5.2, h: 21, buoys: 14 }
/** Khao Phing Kan: the beach the family lands on, and the two leaning cliffs behind it. */
export const BEACH = { x: -112, z: -140, w: 26, d: 9 }
/** From the beach toward Ko Tapu (the way the family looks out to sea). */
export const BEACH_OUT: XZ = norm([NAIL.x - BEACH.x, NAIL.z - BEACH.z])
export const BEACH_GLOW = { x: BEACH.x + BEACH_OUT[0] * 7, z: BEACH.z + BEACH_OUT[1] * 7, r: 6 }
export const NAIL_START = { x: -58, z: -80, heading: Math.atan2(NAIL.x + 58, NAIL.z + 80) }
/** The two leaning cliffs, behind the beach. */
export const CLIFFS: Rock[] = [-1, 1].map((s) => {
  const back = 25
  const side = 8
  return { x: BEACH.x - BEACH_OUT[0] * back + BEACH_OUT[1] * side * s, z: BEACH.z - BEACH_OUT[1] * back - BEACH_OUT[0] * side * s, r: 9, h: 46 }
})

/** Koh Panyee, the village on stilts: two rows of houses with a lane of water between them (boats go slowly here), a
 *  big rock behind it, the golden dome, and the floating football field off its east side. */
export const VILLAGE = {
  /** The lane between the two rows (x), and where the rows run (z). */
  lane: -118,
  laneHalf: 5,
  z0: -18,
  z1: 24,
  /** Each house: how far it reaches from the lane (x) and along it (z). */
  houseW: 7,
  houseD: 7,
  rock: { x: -154, z: 2, r: 22, h: 72 } as Rock,
  dome: { x: -140, z: 6 },
}
/** The houses (centers and half sizes): each a soft wall the boat bumps along. */
export const HOUSES: { x: number; z: number; hx: number; hz: number; side: -1 | 1 }[] = [-1, 1].flatMap((side) =>
  [-14, -6, 2, 10, 18].map((z) => ({ x: VILLAGE.lane + side * (VILLAGE.laneHalf + VILLAGE.houseW / 2), z, hx: VILLAGE.houseW / 2, hz: VILLAGE.houseD / 2 - 0.4, side: side as -1 | 1 })),
)
/** Where boats slow down by themselves (a box round the houses, softened over `soft` meters). */
export const SLOW = { x0: -136, x1: -100, z0: -24, z1: 30, soft: 10, cap: 0.42 }
/** The floating football field: a raft off the east row, its goals at the north and south ends. */
export const FIELD = { x: -92, z: 14, hx: 5.5, hz: 8 }
/** The ball rolled off the field into the sea, out east where she arrives. */
export const BALL_START = { x: -74, z: 20 }
export const VILLAGE_GLOW = { x: -68, z: 30, r: 6 }
/** The section starts here: coming in from the east, the ball ahead. */
export const VILLAGE_START = { x: -62, z: 34, heading: Math.atan2(-1, -0.4) }

/** The rock with the macaques' ledge (on the way to the cave), and the fishing boat pulling up its net. */
export const MACAQUE_ROCK: Rock = { x: 60, z: 32, r: 7, h: 34 }
export const FISHING = { x: -38, z: 40, heading: 0.6 }
/** A coconut floating in the open water near the start. */
export const COCONUT = { x: -14, z: 44 }

/** Back at the pier at sunset: the glow to drive into, and where a sunset link starts (leaving the Nail Island). */
export const PIER_GLOW = { x: MOORED.x + 1, z: MOORED.z - 8, r: 6 }
export const SUNSET_START = { x: -50, z: -60, heading: Math.atan2(50, 150) }

/** The big white tour boat's loop around the middle of the bay (its wake makes ramps). */
export const TOUR = { x: -6, z: -20, rx: 54, rz: 40, period: 56 }

/** Where she can drive: a soft edge (a current turns her back) and the shore. */
export const BOUNDS = { x: 0, z: -40, r: 205 }

/** The sections' starting spots, and where a section begins while driving (the URL follows her). */
export const NAIL_NEAR = 52
export const NAIL_LEAVE = 80

/** The rock towers out in the bay: placed once, the same every time (a seeded shuffle, kept clear of the stops, the
 *  lanes between them and the tour boat's loop). */
export const ROCKS: Rock[] = [...scatter(), MACAQUE_ROCK]
/** The cliffs of the hong's ring: lumpy columns all round it, leaving the tunnel's gap on the south side. */
export const RING: Rock[] = ringRocks()
/** Far towers on the horizon (no bumps, only scenery). */
export const FAR: Rock[] = farRocks()

function norm([x, z]: XZ): XZ {
  const l = Math.hypot(x, z) || 1
  return [x / l, z / l]
}

function rng(seed: number) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}

function segDist(px: number, pz: number, ax: number, az: number, bx: number, bz: number) {
  const dx = bx - ax
  const dz = bz - az
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz || 1)))
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t))
}

function scatter(): Rock[] {
  const r = rng(20261018)
  const out: Rock[] = []
  const keep: [number, number, number][] = [
    [BAY_START.x, BAY_START.z, 22],
    [PIER.x, PIER.z0, 18],
    [HONG.x, HONG.z, HONG.outer + 16],
    [RAFT.x, RAFT.z, 22],
    [NAIL.x, NAIL.z, NAIL.buoys + 14],
    [BEACH.x, BEACH.z, 26],
    [BEACH_GLOW.x, BEACH_GLOW.z, 14],
    [VILLAGE.lane, (VILLAGE.z0 + VILLAGE.z1) / 2, 40],
    [VILLAGE.rock.x, VILLAGE.rock.z, VILLAGE.rock.r + 12],
    [FIELD.x, FIELD.z, 22],
    [BALL_START.x, BALL_START.z, 16],
    [VILLAGE_GLOW.x, VILLAGE_GLOW.z, 14],
    [MACAQUE_ROCK.x, MACAQUE_ROCK.z, MACAQUE_ROCK.r + 14],
    [FISHING.x, FISHING.z, 14],
    [COCONUT.x, COCONUT.z, 10],
    [SUNSET_START.x, SUNSET_START.z, 14],
    [VILLAGE_START.x, VILLAGE_START.z, 12],
  ]
  // Open lanes from the start to each stop (rocks beside them, not in them).
  const lanes: [XZ, XZ][] = [
    [[BAY_START.x, BAY_START.z], [RAFT.x, RAFT.z + 6]],
    [[BAY_START.x, BAY_START.z], [BEACH_GLOW.x, BEACH_GLOW.z]],
    [[RAFT.x, RAFT.z], [BEACH_GLOW.x, BEACH_GLOW.z]],
    [[BAY_START.x, BAY_START.z], [VILLAGE_GLOW.x, VILLAGE_GLOW.z]],
    [[VILLAGE_GLOW.x, VILLAGE_GLOW.z], [BEACH_GLOW.x, BEACH_GLOW.z]],
    [[VILLAGE_GLOW.x, VILLAGE_GLOW.z], [RAFT.x, RAFT.z + 6]],
    [[SUNSET_START.x, SUNSET_START.z], [PIER_GLOW.x, PIER_GLOW.z]],
  ]
  for (let tries = 0; out.length < 26 && tries < 4000; tries++) {
    const x = (r() * 2 - 1) * 180
    const z = -200 + r() * 260
    const rad = 5 + r() * 8
    if (Math.hypot(x - BOUNDS.x, z - BOUNDS.z) > BOUNDS.r - rad - 12 || z > SHORE_Z - 30) continue
    if (keep.some(([kx, kz, kr]) => Math.hypot(x - kx, z - kz) < kr + rad)) continue
    if (lanes.some(([a, b]) => segDist(x, z, a[0], a[1], b[0], b[1]) < rad + 9)) continue
    // Off the tour boat's loop (an ellipse), so its wake stays out in the open.
    const e = Math.hypot((x - TOUR.x) / TOUR.rx, (z - TOUR.z) / TOUR.rz)
    if (Math.abs(e - 1) < (rad + 10) / Math.min(TOUR.rx, TOUR.rz)) continue
    if (out.some((o) => Math.hypot(x - o.x, z - o.z) < rad + o.r + 10)) continue
    out.push({ x, z, r: rad, h: 22 + r() * 34 + rad })
  }
  return out
}

function ringRocks(): Rock[] {
  const out: Rock[] = []
  // Two rows of lumpy columns that overlap into one solid band of cliff.
  for (const [mid, n] of [[21, 17], [29, 23]] as const)
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const x = HONG.x + Math.sin(a) * mid
      const z = HONG.z + Math.cos(a) * mid
      const rad = 5.5
      // Leave the tunnel's gap: no column may reach into it.
      if (Math.abs(x - TUNNEL.x) < rad + TUNNEL.half + 0.3 && z > HONG.z) continue
      out.push({ x, z, r: rad, h: HONG.h + ((i * 7) % 5) * 1.6 })
    }
  // Slimmer columns all along the tunnel that stop exactly at its walls (the cliff above it).
  for (const s of [-1, 1])
    for (let z = TUNNEL.z1 + 1; z <= TUNNEL.z0 - 0.5; z += 3.5) {
      const rad = 3
      out.push({ x: TUNNEL.x + s * (TUNNEL.half + 0.3 + rad), z, r: rad, h: HONG.h - 1 })
    }
  return out
}

function farRocks(): Rock[] {
  const r = rng(77)
  const out: Rock[] = []
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * Math.PI * 2 + r() * 0.1
    const d = 270 + r() * 220
    // Not over the shore behind the pier.
    const x = BOUNDS.x + Math.sin(a) * d
    const z = BOUNDS.z + Math.cos(a) * d
    if (z > SHORE_Z + 10) continue
    out.push({ x, z, r: 14 + r() * 26, h: 50 + r() * 90 })
  }
  return out
}

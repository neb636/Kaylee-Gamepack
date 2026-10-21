// MEGA HarborLand's Big Frame (plan: planning/around-the-world/thailand/mall-trip.md, "The Big Frame"), in meters: the
// one source of truth for its build, the walk grids, the links between levels and the tap targets. It stands in the
// hall where the hall puts it (hall/layout.ts FRAME, in the hall's own meters), so the frame she plays in is the frame
// she walked up to. Pure data (no three.js).
//
// Seen from the front like a dollhouse (the camera looks toward -z), six bays (B0..B5) and four levels:
//
//   roof 5.3   ⛩ spire   [ the giant mask ]   ✦ MEGA ✦                              boxer on his tower
//   L3   4.5 ═ bridge ═ top deck, all the way across ......... HARBOR⛵AND ........ roller ═══╗ (the Ta-Khon roller
//   L2   3.0  [B0]  ((( net tunnel )))  [B3]  ~rope course~  [zip] ─╮              LITTLE THAILAND  over the racing
//   L1   1.5  [B0]  ≈≈ net bridge ≈≈   [B3 donut lip]   ╲      │  zip line           lanes, into their balls)
//   G    0    ▓ red wall   ball pit, Daddy   tunnel 💥  ╲_donut_╱                     ╲
//           🐉 the twin-dragon spiral (behind Mommy's bench)            the nose slide (from the mask, to a mat)
//
// x runs left (-) to right (+), z toward the camera (+). The hall's back wall is at z = -4.6.
import { BACK_Z, BENCH, BLOCKED, CIRCLES, FRAME, FRAME_DOOR, HALL, LANES, MASK, NOSE, NOSE_MAT, PIT as RACE_PIT, TOWN } from '../hall/layout'

export type XZ = [number, number]
export type Rect = [number, number, number, number]
export type V3 = [number, number, number]

export { BACK_Z, FRAME, MASK, NOSE, NOSE_MAT, RACE_PIT }

/** The levels (deck tops) and the roof rail. */
export const LV = { g: 0, l1: FRAME.levels[0], l2: FRAME.levels[1], l3: FRAME.levels[2], roof: FRAME.top } as const
/** A bay's width, and the left edge of bay `i` (0..5; 6 is the right end). */
export const BAY = (FRAME.x1 - FRAME.x0) / (FRAME.cols - 1)
export const bx = (i: number) => FRAME.x0 + i * BAY
/** The front and back faces, and a little inside them (where the decks' walkable tops stop). */
export const ZF = FRAME.z1
export const ZB = FRAME.z0
const IN = 0.08

/** What fills each bay on each level: a padded deck, the net bridge, the net tunnel, the rope course, or nothing (the
 *  donut's bowl). Colors are the deck's padded top. */
export type DeckKind = 'deck' | 'bridge' | 'tunnel' | 'rope'
export const DECKS: { y: number; from: number; to: number; kind: DeckKind; color: string }[] = [
  { y: LV.l1, from: 0, to: 1, kind: 'deck', color: '#FF8FB8' },
  { y: LV.l1, from: 1, to: 3, kind: 'bridge', color: '#F4C98A' },
  { y: LV.l1, from: 3, to: 4, kind: 'deck', color: '#FF8FB8' },
  { y: LV.l2, from: 0, to: 1, kind: 'deck', color: '#8EC9F5' },
  { y: LV.l2, from: 1, to: 3, kind: 'tunnel', color: '#8EC9F5' },
  { y: LV.l2, from: 3, to: 4, kind: 'deck', color: '#8EC9F5' },
  { y: LV.l2, from: 4, to: 5, kind: 'rope', color: '#F4C98A' },
  { y: LV.l2, from: 5, to: 6, kind: 'deck', color: '#8EC9F5' },
  { y: LV.l3, from: 0, to: 6, kind: 'deck', color: '#8FE3C8' },
]

/** The net bridge on L1 (B1-B2) and the rope course on L2 (B4): a strip across the middle of the bays that sags under
 *  her, its planks (or hanging logs) each on their own. */
export const BRIDGE = { rect: [bx(1), bx(3), -3.05, -2.15] as Rect, sag: 0.16, planks: 9 }
export const ROPE = { rect: [bx(4), bx(5), -3.08, -2.12] as Rect, sag: 0.22, logs: 4 }
/** The net tunnel on L2 (B1-B2): a round tube of black net she walks through. */
export const NET_TUNNEL = { x0: bx(1), x1: bx(3), z: -2.6, r: 0.66, y: LV.l2 + 0.62 }

/** The red climbing wall on B0's front, from the mats to L1. */
export const WALL = { x0: bx(0) + 0.06, x1: bx(1) - 0.06, top: LV.l1, z: ZF }

/** The ball pit on the ground floor (B1-B2): a padded rim, a lot of balls, Daddy sitting in them (the cannon's
 *  target). The cannon stands on the mats in B3, beside the tunnel's end, aimed at him. */
export const PIT = { rect: [bx(1) + 0.04, bx(3) - 0.04, ZB + 0.05, ZF - 0.05] as Rect, inner: [bx(1) + 0.16, bx(3) - 0.16, ZB + 0.15, ZF - 0.17] as Rect, rim: 0.5, front: 0.42, balls: 0.42 }
export const DADDY = { at: [-0.75, -1.85] as XZ, face: 40 }
export const CANNON = { at: [0.78, -3.45] as XZ }

/** The tunnel she comes in by, from the hall (hall/layout.ts FRAME_DOOR): a short, low padded tube through B3's front
 *  (low enough that she's seen over it once she's in). */
export const TUNNEL = { x: FRAME_DOOR.x, y: FRAME_DOOR.y, r: 0.33, z0: ZF + 0.14, z1: ZF - 0.5 }

/** The Boomerang Donut: a half-pipe in B4-B5 under L2. Its ring parks at the left lip (L1's B3 edge), swings along an
 *  arc round (x, bottom + r), and she hops out at the bottom, through the open front, onto the mats. */
export const DONUT = { x: 3.2, bottom: 0.15, r: 1.45, z: -2.15, width: 1.1, from: -1.45, to: 1.25, out: [2.75, -0.45] as XZ }

/** The zip line: from a little platform at L2's front-right corner, along the front and down to a mat in front of B2,
 *  where its cable ends on a bracket off the frame's post (`post`). */
export const ZIP = { a: [4.3, 4.18, -0.62] as V3, b: [-0.55, 1.55, -0.62] as V3, sag: 0.26, hang: 1.3, mat: [-0.25, -0.3] as XZ, post: [bx(2), -0.62] as XZ }
export const ZIP_DECK: Rect = [bx(5) + 0.3, bx(6), ZF, ZF + 0.55]

/** The twin-dragon spiral tower, in the gap between Harbor Town and the frame (behind Mommy's bench): its mouth right
 *  at L3's left edge, the slide winding round the post nearly twice, out through B0's side into the ball pit. */
export const TOWER = { x: -4.72, z: -2.72, r: 0.52, post: 0.13, turns: 1.75, top: LV.l3, bottom: 0.62, trough: 0.25 }

/** The Ta-Khon roller slide: from L3's right end, out along the back over the racing lanes, down into their pit of
 *  pink and white balls. Phi Ta Khon masks watch from its posts. */
export const ROLLER = {
  path: [
    [bx(6) - 0.3, LV.l3 + 0.04, -3.75],
    [5.5, 4.1, -3.85],
    [7.1, 3.12, -3.92],
    [8.8, 2.05, -3.92],
    [10.2, 1.18, -3.85],
    [11.15, 0.66, -3.45],
  ] as V3[],
  width: 0.72,
  posts: [6.3, 7.95, 9.55],
  postZ: -4.36,
  land: [11.35, 0.22, -2.6] as V3,
  out: [11.4, -0.45] as XZ,
}

/** The giant Phi Ta Khon mask on the roof (hall/layout.ts MASK), its nose the slide; the padded step up to the slide's
 *  mouth from L3, and where she lands on the mat. */
export const NOSE_STEP: V3 = [-0.98, LV.l3 + 0.3, -1.85]
export const NOSE_LAND: XZ = [-0.45, 1.65]
/** The mask's pedestal on L3 (she walks round it). */
export const MASK_BASE: Rect = [MASK.x - 0.7, MASK.x + 0.7, MASK.z - 0.45, MASK.z + 0.42]

/** On the roof: gold temple spires, and the boxer kid (Muay Thai, a red headband) sitting on his little tower. */
export const SPIRES: V3[] = [
  [bx(0), LV.roof, ZF],
  [bx(0), LV.roof, ZB],
  [bx(6), LV.roof, ZB],
  [bx(3), LV.roof, ZB],
]
export const BOXER = { x: bx(6) - 0.42, z: ZF - 0.52, base: LV.l3, h: 1.35 }

/** The lit sign on the frame's front, over L3's rail (its words are HTML, laid over it: sign.tsx). `at` is the middle of
 *  HARBORLAND's line; `w` how wide that line is (m). */
export const SIGN = { at: [2.05, 4.92, ZF + 0.07] as V3, w: 4.6, h: 1.55 }

/** The climbing nets up the back of a bay (from the level below to the one above). */
export const NETS = {
  netA: { x: bx(3) + 1.0, from: LV.g, to: LV.l1 },
  netB: { x: bx(0) + 0.7, from: LV.l1, to: LV.l2 },
  netC: { x: bx(3) + 0.7, from: LV.l2, to: LV.l3 },
}
export const NET_FACE = ZB + 0.1

/** The floors she walks on: their height, their walkable rectangles, and where a tap lands on them. */
export const FLOORS = {
  out: { y: 0, rect: [-5.6, 12.9, ZF, 2.9] as Rect },
  in: { y: 0, rect: [bx(3), bx(4), ZB + IN, ZF - IN] as Rect },
  pit: { y: -0.04, rect: PIT.inner },
  l1: { y: LV.l1, rects: [[bx(0), bx(1), ZB + IN, ZF - IN], BRIDGE.rect, [bx(3), bx(4), ZB + IN, ZF - IN]] as Rect[] },
  l2: { y: LV.l2, rects: [[bx(0), bx(1), ZB + IN, ZF - IN], [bx(1), bx(3), NET_TUNNEL.z - 0.55, NET_TUNNEL.z + 0.55], [bx(3), bx(4), ZB + IN, ZF - IN], ROPE.rect, [bx(5), bx(6), ZB + IN, ZF - IN], ZIP_DECK] as Rect[] },
  l3: { y: LV.l3, rects: [[bx(0), bx(6), ZB + IN, ZF - IN]] as Rect[] },
}
export type FloorId = keyof typeof FLOORS

/** What blocks the mats outside (besides the hall's own): the dragon tower. The hall blocks it too (hall.ts), so
 *  nobody walks through it there either. */
export const FRAME_BLOCKED: Rect[] = [[TOWN.x1 + 0.1, bx(0), BACK_Z, TOWER.z + TOWER.r + TOWER.trough + 0.1]]

/** Where she starts (`at`): just through the tunnel, in the ball pit, on a level, or out on the mats. */
export const STARTS: Record<string, { floor: FloorId; at: XZ; face: number }> = {
  in: { floor: 'in', at: [TUNNEL.x + 0.15, -2.5], face: -20 },
  pit: { floor: 'pit', at: [-1.75, -2.5], face: 30 },
  l1: { floor: 'l1', at: [-3.0, -2.0], face: 20 },
  l2: { floor: 'l2', at: [1.1, -2.2], face: 10 },
  top: { floor: 'l3', at: [0.6, -2.2], face: 10 },
  out: { floor: 'out', at: [2.3, 0.6], face: 0 },
}
export const AT = ['in', 'pit', 'l1', 'l2', 'top', 'out'] as const
export type At = (typeof AT)[number]
/** Which `at` each floor is (the address bar follows her). */
export const AT_OF: Record<FloorId, At> = { out: 'out', in: 'in', pit: 'pit', l1: 'l1', l2: 'l2', l3: 'top' }

/** The links between floors: climbs (both ways) and rides (down only). Their motions live in rides.ts; here, only
 *  where each starts (`at`, on `from`) and where she stands when it's done (`end`, on `to`). */
export const LINKS = {
  wall: { from: 'out', at: [-3.1, -0.42] as XZ, to: 'l1', end: [-3.1, -1.6] as XZ },
  tunnel: { from: 'out', at: [TUNNEL.x, -0.32] as XZ, to: 'in', end: [TUNNEL.x, -2.45] as XZ },
  rim: { from: 'in', at: [bx(3) + 0.3, -2.55] as XZ, to: 'pit', end: [bx(3) - 0.6, -2.4] as XZ },
  netA: { from: 'in', at: [NETS.netA.x, -3.62] as XZ, to: 'l1', end: [NETS.netA.x, -3.35] as XZ },
  netB: { from: 'l1', at: [NETS.netB.x, -3.62] as XZ, to: 'l2', end: [NETS.netB.x, -3.35] as XZ },
  netC: { from: 'l2', at: [NETS.netC.x, -3.62] as XZ, to: 'l3', end: [NETS.netC.x, -3.35] as XZ },
  nose: { from: 'l3', at: [-0.62, -1.72] as XZ, to: 'out', end: NOSE_LAND },
  dragon: { from: 'l3', at: [bx(0) + 0.25, TOWER.z] as XZ, to: 'pit', end: [bx(1) + 0.55, -2.2] as XZ },
  roller: { from: 'l3', at: [bx(6) - 0.45, -3.4] as XZ, to: 'out', end: ROLLER.out },
  donut: { from: 'l1', at: [bx(4) - 0.3, DONUT.z] as XZ, to: 'out', end: DONUT.out },
  zip: { from: 'l2', at: [ZIP.a[0] - 0.05, ZF + 0.25] as XZ, to: 'out', end: ZIP.mat },
}
export type LinkId = keyof typeof LINKS

/** The big rides: any of them fills the frame's 🛝 sticker on her sock band. */
export const RIDES = ['nose', 'dragon', 'roller', 'donut', 'zip'] as const
export type RideId = (typeof RIDES)[number]

/** The kids playing in the frame: one goes up the red wall and all the way up, and down the nose. */
export const KID_LOOP_UP: V3[] = [
  [-3.1, 0, -0.5],
  [-3.1, 0.7, -0.78],
  [-3.0, LV.l1, -1.7],
  [NETS.netB.x, LV.l1, -3.4],
  [NETS.netB.x, LV.l2, -3.35],
  [bx(1) + 0.3, LV.l2, NET_TUNNEL.z],
  [bx(3) - 0.2, LV.l2, NET_TUNNEL.z],
  [NETS.netC.x, LV.l2, -3.5],
  [NETS.netC.x, LV.l3, -3.35],
  [-0.4, LV.l3, -1.7],
  NOSE_STEP,
]

/** Mommy on the parents' bench (the hall's), watching. */
export const MOMMY = { at: [BENCH.at[0] - 0.3, BENCH.at[1]] as XZ, face: BENCH.face }

/** The mats outside, for her walk grid: the hall's floor near the frame, round the hall's own things and the frame's.
 *  (Not the nose slide's mat: the hall keeps walkers off it, but here she lands on it.) */
const onNoseMat = (r: Rect) => r[0] >= NOSE_MAT[0] - 0.2 && r[1] <= NOSE_MAT[1] + 0.2 && r[2] >= NOSE_MAT[2] - 0.7 && r[3] <= NOSE_MAT[3] + 0.1
export const OUT_GRID = { bounds: [FLOORS.out.rect[0], FLOORS.out.rect[1], HALL[2], FLOORS.out.rect[3]] as Rect, blocked: [...BLOCKED.filter((r) => !onNoseMat(r)), ...FRAME_BLOCKED], circles: CIRCLES }

/** Where the racing lanes are (the roller passes over them): the hall's. */
export { LANES }

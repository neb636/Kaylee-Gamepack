// Wat Phumin's hall (plan: planning/around-the-world/thailand/nan-temple.md), in meters: the cross-shaped hall, its four
// doors, the four Buddhas back to back, the eight mural panels and their scenes, where the lovers hide, the camera's
// stations, and the courtyard outside the east door. Pure data (no three.js): sections.ts reads it at startup.
//
// Origin in the middle of the hall, its floor at y = 0 (the hall stands on a plinth 1 m above the courtyard). x east,
// z south. The panels go clockwise round the hall seen from above, starting with the north wall's east half:
//
//                  north door
//                   ┌──────┐
//   NW  P7 ─────────┘      └───────── P0  NE
//   P6 │            the Buddhas            │ P1
//  ────┘           (four, back to back)    └────   east door: the way in, up the naga stairs
//  ────┐                                   ┌────
//   P5 │  (the lovers' home)               │ P2
//   SW  P4 ─────────┐      ┌───────── P3  SE
//                   └──────┘
//                  south door

export type V3 = [number, number, number]

// ---------------------------------------------------------------- the rounds

export const ROUNDS = ['1', '2', '3'] as const
export type Round = (typeof ROUNDS)[number]

// ---------------------------------------------------------------- the hall

/** Half the central square, half an arm's width, how far an arm reaches past the square (its door wall is at C + ARM). */
export const C = 5
export const A = 1.8
export const ARM = 2.4
export const DOOR_AT = C + ARM
/** The walls inside: their height, the red dado's top, the mural band (bottom and height). */
export const WALL_H = 4.4
export const DADO = 0.9
export const BAND0 = 0.9
export const BAND_H = 2.4
/** The doorway in each door wall. */
export const DOOR_W = 1.5
export const DOOR_H = 2.7
/** The courtyard outside, below the hall's floor. */
export const GROUND = -1

/** Is this floor point inside the hall (the cross), `pad` in from its walls? */
export const inHall = (x: number, z: number, pad = 0) => (Math.abs(x) < C - pad && Math.abs(z) < C - pad) || (Math.abs(x) < A - pad && Math.abs(z) < DOOR_AT - pad) || (Math.abs(z) < A - pad && Math.abs(x) < DOOR_AT - pad)

// ---------------------------------------------------------------- the mural panels

export interface Panel {
  i: number
  name: string
  /** The band's left end at the floor (x, z), and which way along the wall is "right" for someone facing it. */
  ox: number
  oz: number
  rx: number
  rz: number
  /** Into the hall. */
  nx: number
  nz: number
  /** The camera's yaw facing it (degrees), unwrapped clockwise from P0. */
  yaw: number
  /** Where Daddy sits, just past its end by the arm (meters along it: its other end is a corner). */
  daddyU: number
  /** Where the painted Daddy appears (along it, up it). */
  cameo: [number, number]
}

export const PANEL_W = 3.2
function panel(i: number, name: string, ox: number, oz: number, rx: number, rz: number, yaw: number, cameo: [number, number]): Panel {
  return { i, name, ox, oz, rx, rz, nx: -rz, nz: rx, yaw, daddyU: i % 2 ? PANEL_W + 0.3 : -0.3, cameo }
}
export const PANELS: Panel[] = [
  panel(0, 'P0 north wall, east half', A, -C, 1, 0, 0, [1.62, 1.55]),
  panel(1, 'P1 east wall, north half', C, -C, 0, 1, -90, [1.55, 1.6]),
  panel(2, 'P2 east wall, south half', C, A, 0, 1, -90, [0.45, 0.55]),
  panel(3, 'P3 south wall, east half', C, C, -1, 0, -180, [1.6, 1.75]),
  panel(4, 'P4 south wall, west half', -A, C, -1, 0, -180, [1.6, 1.6]),
  panel(5, 'P5 west wall, south half', -C, C, 0, -1, -270, [2.35, 1.85]),
  panel(6, 'P6 west wall, north half', -C, -A, 0, -1, -270, [1.6, 1.65]),
  panel(7, 'P7 north wall, west half', -C, -C, 1, 0, -360, [0.75, 0.5]),
]
/** A point on a panel: `u` along it, `v` up from the band's bottom, `off` out from the wall. */
export function onPanel(p: Panel, u: number, v: number, off = 0): V3 {
  return [p.ox + p.rx * u + p.nx * off, BAND0 + v, p.oz + p.rz * u + p.nz * off]
}
/** Where the boats and birds that travel along the walls are: the panels laid end to end (25.6 m round the hall). */
export const LOOP = PANEL_W * PANELS.length

// ---------------------------------------------------------------- the scenes

export type SceneKind = 'boats' | 'elephant' | 'house' | 'birds' | 'dancers' | 'market' | 'fish' | 'buffalo' | 'music' | 'procession' | 'kite'

export interface Scene {
  id: string
  panel: number
  kind: SceneKind
  /** Its box on the panel (meters along, up). */
  u0: number
  u1: number
  v0: number
  v1: number
}

const scene = (id: string, panel: number, kind: SceneKind, u0: number, u1: number, v0: number, v1: number): Scene => ({ id, panel, kind, u0, u1, v0, v1 })
export const SCENES: Scene[] = [
  scene('boats-a', 0, 'boats', 0.1, 1.5, 0, 0.95),
  scene('elephant-a', 0, 'elephant', 1.75, 3.1, 0.35, 2.1),
  scene('house', 1, 'house', 0.15, 1.45, 0.3, 2.2),
  scene('birds-a', 1, 'birds', 1.85, 3.05, 0.4, 2.25),
  scene('dancers', 2, 'dancers', 1.35, 3.05, 0.25, 1.4),
  scene('market', 3, 'market', 0.15, 1.45, 0.3, 1.55),
  scene('fish', 3, 'fish', 1.75, 3.1, 0, 1.25),
  scene('boats-b', 4, 'boats', 0.15, 1.5, 0, 0.95),
  scene('buffalo', 4, 'buffalo', 1.75, 3.05, 0.35, 1.5),
  scene('music', 5, 'music', 1.65, 3.05, 0.3, 1.45),
  scene('procession', 6, 'procession', 0.15, 1.5, 0.35, 2.15),
  scene('birds-b', 6, 'birds', 1.85, 3.05, 0.4, 2.25),
  scene('kite', 7, 'kite', 1.6, 3.05, 0.3, 2.1),
]
/** Awake scenes that end round 1. */
export const WAKE_GOAL = 8
/** What a deep link to round 2 or 3 starts with awake (as if she had woken these). */
export const AWAKE_SEED = ['boats-a', 'elephant-a', 'house', 'birds-a', 'market', 'fish', 'boats-b', 'kite']
/** Seconds of light a sleeping scene needs to wake. */
export const WAKE_S = 0.45
/** The lantern's pool of light on the wall (radius), and how near the wall it must be to light it. */
export const POOL_R = 0.78
export const POOL_REACH = 1.4
/** Lit again this many times (the light going away and coming back), an awake scene dances. */
export const DANCE_AFTER = 3

// ---------------------------------------------------------------- the whispering lovers

/** Their three hiding spots (panel, box): the first two, then their home on the west wall, high above the family. */
export const LOVER_SPOTS = [
  { panel: 2, u0: 0.1, u1: 1.25, v0: 1.05, v1: 2.3 },
  { panel: 7, u0: 0.15, u1: 1.4, v0: 1.05, v1: 2.3 },
  { panel: 5, u0: 0.3, u1: 1.55, v0: 1.05, v1: 2.3 },
] as const
/** Seconds of light that find them. */
export const FIND_S = 0.6

// ---------------------------------------------------------------- the Buddhas

/** The four, facing the four doors, in the order round 3 visits them: east (the way in), south, west, north. */
export const BUDDHAS = [
  { name: 'east', dx: 1, dz: 0 },
  { name: 'south', dx: 0, dz: 1 },
  { name: 'west', dx: -1, dz: 0 },
  { name: 'north', dx: 0, dz: -1 },
] as const
/** The dais (half its width, its two steps' height), each Buddha's distance out from the middle, their head height. */
export const DAIS = { half: 1.2, step: 0.32 }
export const BUDDHA_OUT = 0.55
export const BUDDHA_FACE_Y = 2.03
/** Out from the middle: each altar table (candle, lotus, bell), and the mat where Kaylee does her wai. */
export const ALTAR_OUT = 2.25
export const MAT_OUT = 3.0
/** Seconds of lantern light a Buddha needs. */
export const BUDDHA_LIT_S = 0.4
/** Mommy sits on a mat beside the east Buddha. */
export const MOMMY_AT: V3 = [3.15, 0, 1.25]

// ---------------------------------------------------------------- Kaylee and the lantern

/** Kaylee stands this far out from a panel, Daddy sits this far out. */
export const KAYLEE_OFF = 1.15
export const DADDY_OFF = 0.95
/** The lantern hangs this far off whatever it lights, no lower or higher than this. */
export const LANTERN_OFF = 0.35
export const LANTERN_Y = [0.75, 3.6] as const
/** Her trot behind the lantern (m/s). */
export const TROT = 2.2
/** The finger this near the screen's side (a share of its width) for EDGE_S turns to the next panel (then every
 *  EDGE_EVERY while it stays). */
export const EDGE = 0.1
export const EDGE_S = 0.35
export const EDGE_EVERY = 1.3
/** The walk round the dais between stations keeps this far out. */
export const RING = 3.6

// ---------------------------------------------------------------- outside the east door

/** The plinth reaches this far past the door walls' inner face (the walls are WALL_T thick). */
export const WALL_T = 0.3
export const LEDGE = 0.65
/** The stairs down from the ledge outside the east door to the courtyard, the nagas' heads at their foot. */
export const STAIRS = { x0: DOOR_AT + LEDGE, x1: DOOR_AT + LEDGE + 2.0, half: 0.85, steps: 5 }
export const NAGA_HEAD_X = STAIRS.x1 + 0.3
export const NAGA_Z = STAIRS.half + 0.28
export const RACK: V3 = [10.75, GROUND, -2.45]
export const BELL_POST: V3 = [10.7, GROUND, 2.35]
export const STATUES: V3 = [13.6, GROUND, -3.4]
/** Where the family stands at the foot of the stairs (in a row, so the camera sees all three), and their shoes, just
 *  stepped out of (Kaylee, Daddy, Mommy). */
export const FAMILY_OUT = { kaylee: [11.9, GROUND, 0.1] as V3, nick: [13.2, GROUND, -1.35] as V3, ji: [12.55, GROUND, -0.6] as V3 }
export const SHOES: V3[] = [
  [11.55, GROUND, 0.65],
  [12.85, GROUND, -0.8],
  [12.2, GROUND, -0.05],
]
export const PIGEONS_OUT: V3[] = [
  [12.0, GROUND, -2.6],
  [13.6, GROUND, 0.9],
  [12.4, GROUND, 1.9],
]
/** The pigeons that wandered inside, in front of P1, P4 and P7. */
export const PIGEONS_IN = [
  { panel: 1, u: 2.75, off: 0.75 },
  { panel: 4, u: 2.8, off: 0.7 },
  { panel: 7, u: 2.7, off: 0.75 },
]

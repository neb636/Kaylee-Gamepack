// Chef Fu's dumpling counter, in meters (plan: planning/around-the-world/china/dumpling-house.html). Pure data, no
// three.js. The camera stands on Kaylee's side of the counter (+z) and looks toward -z, down onto the board:
//
//   back wall:      [ the shop window: the old-town lane, the Pearl Tower far off ]       (z = -2.6)
//   stools:     Grandpa      Bunny Twins      Mrs Goose       Bao Bao        Dou Dou      (z = -0.95)
//   counter:  teapot  [serving spots in front of each friend]               goldfish     (z = -0.42)
//   her side: flour  bowls   [ the board with the dough ]   [ wok + steamers ]  chopsticks (z ~ 0)
//   Chef Fu stands at her left end of the counter.

export type V3 = [number, number, number]

/** The counter top is y = 0; the floor is below it. */
export const FLOOR_Y = -0.92
// Her side runs right up to the camera, so the counter (not the floor) fills the bottom of a tall screen.
export const COUNTER = { x0: -2.3, x1: 2.3, z0: -0.66, z1: 1.6 }
/** The floury board, and the spot on it where each dumpling is made. */
export const BOARD = { x: -0.06, z: 0.08, w: 0.86, d: 0.66, y: 0.035 }
export const WORK: V3 = [-0.06, BOARD.y, 0.1]
/** A fresh dough ball's radius (round 3 makes them bigger or smaller). */
export const BALL_R = 0.14

/** Her bowls, at the left of the board: the filling, and (round 2) the three colored doughs; (round 3) the big lump. */
export const FILLING: V3 = [-0.66, 0, 0.24]
export const COLOR_BOWLS: V3[] = [
  [-0.68, 0, -0.08],
  [-0.56, 0, -0.32],
  [-0.84, 0, -0.3],
]
export const LUMP: V3 = [-0.68, 0, -0.16]

/** The wok on its stove at the right, where the steamers stack. */
export const WOK: V3 = [0.72, 0, 0.04]
export const BASKET_H = 0.12

/** The stools across the counter, and where each friend's basket lands in front of them. */
export const SEATS = {
  grandpa: { x: -0.9, z: -0.98 },
  bunnies: { x: -0.3, z: -0.98 },
  goose: { x: 0.3, z: -0.98 },
  baobao: { x: 0.88, z: -0.98 },
  doudou: { x: 1.32, z: -0.92 },
} as const
export type Seat = keyof typeof SEATS
export const SERVE_Z = -0.44

/** Chef Fu, at her left end of the counter, turned toward the board. */
export const CHEF = { x: -1.28, z: -0.3, yaw: 0.65 }
/** On a tall screen he steps in a little, so he's in the picture. */
export const CHEF_TALL = { x: -1.12, z: -0.18, yaw: 0.55 }

/** Things to poke. */
export const TEAPOT: V3 = [1.18, 0, -0.46]
export const FISH: V3 = [1.38, 0, 0.12]
export const FLOUR: V3 = [-0.98, 0, 0.36]
export const CHOPSTICKS: V3 = [1.1, 0, 0.36]
export const LANTERNS: V3[] = [
  [-1.3, 1.25, -2.0],
  [0, 1.32, -2.1],
  [1.3, 1.25, -2.0],
]
export const WINDOW = { x: 0, y: 0.62, z: -2.6, w: 3.4, h: 1.3 }
export const BELL: V3 = [-2.05, 1.05, -1.6]

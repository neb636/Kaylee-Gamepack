// The Sky Pod at HarborLand (plan: planning/around-the-world/thailand/mall-trip.md, "8. The Sky Pod"), in meters: the
// wall of light-up pods, the scoreboard, the springy mat she bounces on, where Kaylee and Daddy stand, the toys around.
// Pure data (no three.js).
//
// Seen straight on (the camera looks toward -z at the wall). On a wide screen the nine pods make an arch, like a
// rainbow, with the scoreboard under it; on a tall one they make a three-by-three wall with the board on top:
//
//   wide:            ● ● ●                          tall:     [ 0 0 ]   the board
//              ●   [ 0 0 ]   ●      🚀                        ● ● ●     row 3 (the highest notes)
//    🔊      ●                 ●     Daddy                    ● ● ●     row 2
//           ●                    ●                          ● ● ●     row 1 (the lowest notes)
//   ═══════ the springy mat, Kaylee on it ═══════          🔊 Kaylee  Daddy
//
// Each pod is a note: left to right (and up the rows) they climb a major scale, C D E F G A B C D, so she can play
// tunes on the wall.

export type V3 = [number, number, number]
export type Round = 1 | 2 | 3

export const PODS = 9
/** The glowing dome, and the ring round it (what she sees as the button). */
export const DOME_R = 0.22
export const BEZEL_R = 0.31
/** The tap target round each pod (its diameter is about the space between pods). */
export const TAP_R = 0.33
/** The wall's face, and how far the pods stick out of it. */
export const WALL_Z = 0
export const POD_Z = 0.07

/** Where each pod is: an arch of nine on a wide screen, a three-by-three wall on a tall one. */
export function podSpots(tall: boolean): V3[] {
  if (tall) return Array.from({ length: PODS }, (_, i): V3 => [((i % 3) - 1) * 0.76, 1.34 + Math.floor(i / 3) * 0.68, POD_Z])
  return Array.from({ length: PODS }, (_, i): V3 => [(i - 4) * 0.66, 1.12 + 1.1 * Math.sin((Math.PI * i) / 8), POD_Z])
}

/** Each pod's own color (unlit it's a dark version of it), round the rainbow with the notes. */
export const POD_COLORS = ['#FF5C8A', '#FF9A4D', '#FFD23D', '#7FE07A', '#4FD6C8', '#5FB4FF', '#8F86FF', '#D77BFF', '#FF6FD0']
/** Round 3: her lights and Daddy's. */
export const PINK = '#FF4F9A'
export const BLUE = '#3FA8FF'
/** The pattern's lights while the wall plays it (round 2), and the soft "this one next" glow. */
export const SHOW = '#FFF3B0'

/** The scoreboard: a dark screen with big HTML numbers laid over it (never in a picture). */
export function boardSpot(tall: boolean): { at: V3; w: number; h: number } {
  return tall ? { at: [0, 3.42, 0.04], w: 1.5, h: 0.62 } : { at: [0, 1.27, 0.04], w: 1.34, h: 0.62 }
}

/** The wall panel (dark night sky, stars and a moon on it). */
export function wallSize(tall: boolean) {
  return tall ? { w: 3.0, h: 3.9 } : { w: 6.6, h: 2.8 }
}

/** She stands on the springy mat this far in front of the wall; standing, her hand reaches this high. */
export const KAYLEE_Z = 0.42
export const REACH = 0.98
/** She stands this far to the side of the pod she slaps (so she doesn't hide it, and we see her face). */
export const BESIDE = 0.3
/** Daddy watches from the side (rounds 1 and 2), then plays on the same wall (round 3). He reaches this high. */
export const DADDY_Z = 0.5
export const DADDY_REACH = 1.95
export function daddyHome(tall: boolean): V3 {
  return tall ? [1.95, 0, 0.72] : [3.45, 0, 0.6]
}
export function kayleeHome(tall: boolean): V3 {
  return tall ? [-0.36, 0, KAYLEE_Z] : [-1.1, 0, KAYLEE_Z]
}
/** How far left and right she can go on the mat. */
export function matX(tall: boolean): [number, number] {
  return tall ? [-1.25, 1.25] : [-3.0, 3.0]
}

/** The toys round the wall: the big speaker (a beat to play along to), the rocket on top, the moon on the wall. */
export function speakerSpot(tall: boolean): V3 {
  return tall ? [-1.98, 0, 0.6] : [-3.78, 0, 0.35]
}
export function rocketSpot(tall: boolean): V3 {
  const w = wallSize(tall)
  return tall ? [w.w / 2 - 0.4, w.h + 0.02, 0.05] : [0.4, w.h + 0.02, 0.05]
}
export function moonSpot(tall: boolean): V3 {
  return tall ? [-1.18, 3.5, 0.03] : [-2.7, 2.3, 0.03]
}

/** The notes: a major scale from C5, one per pod. */
export const SCALE = [523.25, 587.33, 659.25, 698.46, 783.99, 880.0, 987.77, 1046.5, 1174.66]

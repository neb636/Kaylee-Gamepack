// Little Land at HarborLand (plan: planning/around-the-world/thailand/mall-trip.md, "6. Little Land"), in meters: the
// mat she builds on, the brick box, the easel with the picture card, where Kaylee and Daddy stand, the toys around.
// Pure data (no three.js).
//
// Seen straight on (the camera looks toward -z), left to right:
//
//   back:   [easel: the card, three stars]   ▦▦▦▦▦ the low foam wall ▦▦▦▦▦▦       [rocking elephant]
//   mat:          Kaylee   ┊ the build: 8 half-brick columns, up to 6 rows ┊   Daddy
//   front:  [brick box]    ┊   (his ribbon across it in round 3)           ┊          (foam ball)
import { BLOCKS } from '../../hall/layout'

export type V3 = [number, number, number]
export type Round = 1 | 2 | 3

/** The bricks are the hall's (Little Land's wall and front stack): the same size. */
export const [BW, BH, BD] = BLOCKS.brick
/** The hall's five foam colors (harborland/build.ts `HL.pad1`..`pad5`), copied so this folder stands on its own. */
export const BRICK_COLORS = ['#FF8FB8', '#8EC9F5', '#8FE3C8', '#FBEA9A', '#C9B5F7']

/** The build: the mat is cut into half-brick columns; a brick covers two side by side. */
export const HALF = BW / 2
export const COLS = 8
export const ROWS = 6
/** The left edge of column 0 (the build is centered on x = 0). */
export const X0 = -(COLS / 2) * HALF
/** A held brick moves on this plane, in front of the stack (so it never cuts into it). */
export const HOLD_Z = 0.4
/** Pixels: the brick hangs this far above her finger, so her finger doesn't hide it. */
export const LIFT_PX = 40

/** Kaylee stands at the build's left, Daddy at its right: a step back watching in rounds 1 and 2, then (round 3) right
 *  beside the stack. */
export const KAYLEE_AT = { x: -2.3, z: 0.3, face: 50 }
export const DADDY_BACK = { x: 2.75, z: -0.55, face: -35 }
export const DADDY_STAND = { x: 2.35, z: 0.1, face: -55 }
/** On a tall screen the camera comes in closer (so the columns aren't too thin for a finger): Daddy stands nearer. */
export const DADDY_BACK_TALL = { x: 2.15, z: -0.75, face: -30 }
export const DADDY_STAND_TALL = { x: 2.1, z: 0.2, face: -55 }
/** Round 3's ribbon at Daddy's horn: a tower whose top passes it is taller than Daddy (four rows do it). */
export const MARK_Y = 1.74

/** The brick box: a big open foam bin, bricks come out of its mouth and hop back in. */
export const BOX = { x: -3.05, z: 1.0, w: 1.0, d: 0.8, h: 0.55 }
/** On a tall screen the box sits on the mat in front, below the build. */
export const BOX_TALL = { x: -1.45, z: 2.0 }
/** The easel at the back left: the picture card, and a star on top for each round. */
export const EASEL = { x: -2.75, z: -1.3, y: 1.2, w: 1.2, h: 0.92 }
export const STAR_Y = EASEL.y + EASEL.h / 2 + 0.24
/** The low foam wall along the back (lighter than the bricks she plays with, and only two rows). */
export const WALL = { z: -2.2, rows: 2, x0: -4.6, x1: 4.6 }
export const BALL = { x: 3.0, z: 1.35, r: 0.3 }
export const ROCKER = { x: 3.25, z: -1.35 }
/** The mats: where flying bricks can land (they bounce off the edges). */
export const FLOOR = { x0: -4.0, x1: 4.0, z0: -1.9, z1: 2.3 }

export type CardId = 'chedi' | 'elephant'
export const CARD_IDS: CardId[] = ['chedi', 'elephant']

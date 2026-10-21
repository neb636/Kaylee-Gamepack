// The Barber Salon in Harbor Town (plan: planning/around-the-world/thailand/mall-trip.md, "★ 2. The Barber Salon"), in
// meters: where everything stands, the tools on the trolley each round, and the kids who come in round 3. Pure data
// (no three.js).
//
// Seen straight on (the camera looks toward -z, at Daddy's head), left to right:
//
//   back wall:   [pole]   [jar shelf]      [   the big mirror   ]        [waiting bench: Mommy, her phone]
//   floor:          Kaylee on her           Daddy in the big chair
//                   step stool                (a cape round him)
//   front:                  ═══════ the tool trolley along the bottom ═══════
//   (checkered floor)
import type { Look } from '../../../../characters/looks'

export type V3 = [number, number, number]
export type Round = 1 | 2 | 3

export const ROOM = { x0: -2.6, x1: 2.8, back: -1.5, front: 2.4, height: 3.2 }
/** The big chair: Daddy (or a kid on a booster) sits in it facing her; it spins round to the mirror for the reveal. */
export const CHAIR = { x: 0, z: 0, seat: 0.62, booster: 0.3 }
export const MIRROR = { x: 0, y0: 0.95, y1: 2.85, w: 1.7, z: ROOM.back + 0.04 }
/** Kaylee stands on a step stool beside the chair, so she can reach his head. */
export const STOOL = { x: -0.92, z: -0.1, top: 0.32 }
export const KAYLEE_FACE = 58
/** Mommy waits on the bench, her phone ready for the photo. */
export const MOMMY = { x: 2.25, z: -1.0, face: -20 }
/** The waiting bench at the back on the right: Mommy waits here, and Daddy sits beside her in round 3. */
export const BENCH = { x: 1.75, z: -1.0, seat: 0.45, spots: [1.65, 1.95, 2.25] }
export const POLE = { x: -2.05, y: 1.6, z: -1.2 }
/** The shelf beside the mirror with a jar of blue comb water (it bubbles) and a spray of flowers. */
export const SHELF = { x: -1.45, y: 1.05, z: -1.25 }
/** The door the kids come in by (off to the right). */
export const DOOR: V3 = [3.4, 0, 0.6]

/** Held tools move on a plane just in front of his face, with their working end a little above her finger. */
export const LIFT_PX = 30

export type ToolId = 'tonic' | 'scissors' | 'comb' | 'spray' | 'dryer' | 'bow' | 'clip'
export interface TrayItem {
  key: string
  tool: ToolId
  /** A bow or clip's color (hair.ts BOW_COLORS). */
  color?: 'p' | 'v' | 'y'
}
const ROUND1: TrayItem[] = [
  { key: 'tonic', tool: 'tonic' },
  { key: 'scissors', tool: 'scissors' },
  { key: 'comb', tool: 'comb' },
]
const ROUND2: TrayItem[] = [
  ...ROUND1,
  { key: 'spray', tool: 'spray' },
  { key: 'dryer', tool: 'dryer' },
  { key: 'bow-p', tool: 'bow', color: 'p' },
  { key: 'bow-v', tool: 'bow', color: 'v' },
  { key: 'clip-y', tool: 'clip', color: 'y' },
]
export const TRAYS: Record<Round, TrayItem[]> = { 1: ROUND1, 2: ROUND2, 3: ROUND2 }
export const ALL_ITEMS = ROUND2

export const TOOL_ICONS: Record<ToolId, string> = { tonic: '🧴', scissors: '✂️', comb: '🪮', spray: '🌈', dryer: '💨', bow: '🎀', clip: '⭐' }

/** Strokes of hair work (a drag through it, a tap's go) before the mirror glows: on Daddy each round, on each kid. */
export const ENOUGH = 8
export const ENOUGH_KID = 5

/** Round 3: kids come in with a picture card of the hair they want. Placeholders (a puppy, a pony, a panda) until the
 *  art gate. Whatever she makes: "close enough!". */
export type Card = 'spiky' | 'pigtails' | 'curly'
export const CUSTOMERS: { card: Card; look: Look }[] = [
  { card: 'spiky', look: { species: 'puppy', height: 1.0, fur: '#F2D3A8', light: '#FFF4E4', dark: '#6B4C52', ear: '#D9A877', outfit: { kind: 'tee', color: '#8FE3C8', shorts: '#5D7BB0' }, open: true } },
  { card: 'pigtails', look: { species: 'pony', height: 1.05, fur: '#FFE0EC', light: '#FFF6FA', dark: '#B07A8A', ear: '#FFB8CC', mane: ['#B9A6F5', '#FF8FB8'], hair: 'medium', outfit: { kind: 'dress', color: '#FBEA9A' }, lashes: true } },
  { card: 'curly', look: { species: 'panda', height: 1.0, fur: '#FFF6EE', light: '#FFFDF8', dark: '#4A3F4F', ear: '#FFB3C7', outfit: { kind: 'tee', color: '#FF8FB8' } } },
]

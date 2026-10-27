// The Nan Mountain Cup's racers (plan: thailand/nan-cup.html, "The rivals"), pure data: Kaylee in her pink kart and three
// Nan locals in theirs, toy animals on the chibi rig (riders.ts builds them from RIVAL_LOOKS). Each drives its own way, and each track tells its own story through the scripts: where each rival wants
// to be against her (meters ahead of her) from the start line (0) to the finish (1), for a race she wins and for the
// one she loses, when the home rival edges past on the last stretch and wins by a nose.
import type { Look } from '../../../../../engine3d/characters/look'
import type { Script } from '../../../trip/race/rubber'
import type { TrackId } from './track'

export type RivalId = 'taeng' | 'pao' | 'moon'
export type RacerId = 'kaylee' | RivalId
export const RIVAL_IDS: RivalId[] = ['taeng', 'pao', 'moon']
export type Result = 'win' | 'lose'
export const RESULTS: Result[] = ['win', 'lose']

export interface Rival {
  id: RivalId
  label: string
  icon: string
  /** The block's color, its kart's, and the face on the standings. */
  color: string
  kart: { body: string; trim: string; seat: string }
  /** Its usual top speed, times hers. */
  pace: number
  /** Where across the road it likes to drive (meters left of the middle). */
  lane: number
  /** How much it slows for a bend (1 = like her by herself; Pao takes the hairpins fast, Moon brakes hard). */
  bends: number
}

export const RIVALS: Record<RivalId, Rival> = {
  // Grandma Taeng, the tortoise: three Cups in a row. Slow off the start, steady, catches up on the bends.
  taeng: { id: 'taeng', label: 'Grandma Taeng', icon: '🐢', color: '#7BBF8E', kart: { body: '#C9875C', trim: '#F6D3AE', seat: '#7BBF8E' }, pace: 0.98, lane: 0, bends: 0.55 },
  // Pao, the hornbill postman: knows every bend by heart, takes the inside line.
  pao: { id: 'pao', label: 'Pao', icon: '🐦', color: '#FF9A3C', kart: { body: '#FF9A3C', trim: '#FFFFFF', seat: '#5E5468' }, pace: 1.04, lane: 2.6, bends: 0.5 },
  // Moon, the sun bear honey seller: very fast on the straights, slow in the bends.
  moon: { id: 'moon', label: 'Moon', icon: '🐻', color: '#8A6450', kart: { body: '#FFC83D', trim: '#FFFFFF', seat: '#8A6450' }, pace: 1.06, lane: -2.4, bends: 1.7 },
}

/** The rivals as toy animals (the shared chibi rig, engine3d/characters/animal.ts). Grandma Taeng: a soft green tortoise
 *  with a caramel shell, white hair in a bun, gold glasses and a pink blouse. Pao: a black-and-white hornbill with an
 *  orange beak, the postman's navy cap and his mailbag. Moon: a big, round chocolate sun bear with a honey-colored face
 *  and the cream crescent on her chest, beaming. */
export const RIVAL_LOOKS: Record<RivalId, Look> = {
  taeng: { species: 'tortoise', height: 1.1, chub: 1.25, fur: '#AFD9A2', light: '#FFF2D2', dark: '#C98B5C', ear: '#E8B987', outfit: { kind: 'blouse', color: '#FFB8D0' }, extras: ['bun', 'glasses'], lashes: true },
  pao: { species: 'hornbill', height: 1.18, fur: '#3F3A52', light: '#FFF4E4', dark: '#FF9A3C', extras: ['officer-cap', 'mailbag'], open: true },
  moon: { species: 'bear', height: 1.3, chub: 1.25, fur: '#6E4F4A', light: '#FFD48A', dark: '#3A2A30', ear: '#FFB8A8', lashes: true, open: true },
}

/** Whose home track it is: on the race she loses, this rival wins. */
export const HOME: Record<TrackId, RivalId> = { forest: 'moon', steps: 'taeng', cloud: 'pao' }

/** Where everyone lines up, meters behind the start line and across: the rivals ahead of her (they lead off the
 *  start), Grandma Taeng beside her (napping till GO). */
export const GRID: Record<RacerId, { back: number; lat: number }> = {
  pao: { back: 5, lat: 3 },
  moon: { back: 5, lat: -3 },
  taeng: { back: 11, lat: 2.6 },
  kaylee: { back: 11, lat: -2.6 },
}

/** The story of each race she wins: they lead off the start; Taeng drops back and hangs on; Pao and she swap places in
 *  the middle; the home rival is right beside her at the end until she pulls ahead by a nose. */
const WIN: Record<TrackId, Record<RivalId, Script>> = {
  forest: {
    moon: [[0, 6], [0.15, 9], [0.32, -3], [0.5, 5], [0.66, 3], [0.8, 1.5], [0.92, 0.5], [0.97, -1.5], [1, -4]],
    pao: [[0, 6], [0.12, 4], [0.28, -6], [0.45, 6], [0.58, -3], [0.75, -10], [1, -16]],
    taeng: [[0, 0], [0.08, -6], [0.3, -12], [0.5, -5], [0.7, -3], [0.85, -9], [1, -12]],
  },
  // Grandma Taeng's own rice steps: slow off the start (she naps), then steady down the terraces, catching up on every
  // bend until she's beside her at the waterfall. Moon splashes off ahead and fades; Pao is near the middle.
  steps: {
    taeng: [[0, 0], [0.1, -8], [0.25, -5], [0.4, -2], [0.55, 2], [0.7, 1], [0.8, 1.5], [0.92, 0.5], [0.97, -1.5], [1, -4]],
    moon: [[0, 6], [0.12, 10], [0.3, 4], [0.45, -6], [0.6, -10], [1, -16]],
    pao: [[0, 6], [0.15, 7], [0.35, -4], [0.55, 4], [0.7, -6], [1, -14]],
  },
  // Pao's own mountain: he knows every hairpin, so he leads most of the way up and is still beside her at the top. Moon
  // brakes hard for the bends and drops back; Grandma Taeng hangs on through the cloud.
  cloud: {
    pao: [[0, 6], [0.15, 5], [0.3, 8], [0.45, 3], [0.6, 5], [0.72, 2.5], [0.8, 1.5], [0.92, 0.5], [0.97, -1.5], [1, -4]],
    moon: [[0, 6], [0.12, 8], [0.25, -4], [0.4, -10], [0.6, -14], [1, -20]],
    taeng: [[0, 0], [0.1, -6], [0.3, -3], [0.5, 3], [0.65, -4], [0.8, -8], [1, -12]],
  },
}
/** The race she loses: the same until the last stretch, where she's just ahead, then the home rival edges past and
 *  crosses a nose in front (a meter and a half). */
const LOSE_END: Script = [[0.8, 1.5], [0.9, -0.8], [0.96, 0], [1, 1.5]]

/** Each rival's script for this track and result. */
export function scripts(track: TrackId, result: Result): Record<RivalId, Script> {
  const win = WIN[track] ?? WIN.forest
  if (result === 'win') return win
  const home = HOME[track] ?? 'moon'
  return { ...win, [home]: [...win[home].filter(([f]) => f < LOSE_END[0][0]), ...LOSE_END] }
}

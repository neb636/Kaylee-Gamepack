// Chutes and Ladders at the game table (our own small board for short games; game-table.md).
// - A 6 by 6 board numbered 1-36 like a snake: 1-6 left to right along the bottom row, 7-12 right to left above it,
//   and so on up to 36 at the top left. Both pieces start before space 1 (position 0); Kaylee starts.
// - Roll one die and move forward that many spaces.
// - Land on the bottom of a ladder: climb to its top. Land on the top of a slide: slide to its bottom. Only the space
//   the die move lands on counts: never a second ladder or slide after the first.
// - Reach or pass 36 to win; the piece stops on 36 (no exact roll). No extra turns, nothing else.
import { other, type Step, type Turns } from './turns'

export const CHUTES_END = 36
export const SIDE = 6
/** Bottom -> top. Straight up a column each, never sharing a start or end with anything else. */
export const LADDERS: Readonly<Record<number, number>> = { 2: 14, 8: 20, 18: 30 }
/** Top -> bottom. */
export const CHUTES: Readonly<Record<number, number>> = { 15: 3, 33: 22, 35: 24 }

/** Where square `n` (1..36) is: row 0 at the bottom (near the camera), col 0 on the left. */
export function square(n: number): { row: number; col: number } {
  const k = Math.min(CHUTES_END, Math.max(1, n)) - 1
  const row = Math.floor(k / SIDE)
  const col = row % 2 === 0 ? k % SIDE : SIDE - 1 - (k % SIDE)
  return { row, col }
}

/** One roll of `n` for whoever's turn it is: the new state and what to show. */
export function chutesRoll(s: Turns, n: number): { state: Turns; steps: Step[] } {
  if (s.winner !== null) return { state: s, steps: [] }
  const who = s.turn
  const steps: Step[] = [{ kind: 'roll', who, n }]
  const pos: [number, number] = [s.pos[0], s.pos[1]]
  const from = pos[who]
  let at = Math.min(CHUTES_END, from + n)
  steps.push({ kind: 'move', who, from, to: at })
  // Only the space the die landed on: one ladder or one slide at most.
  if (LADDERS[at]) {
    steps.push({ kind: 'ladder', who, from: at, to: LADDERS[at] })
    at = LADDERS[at]
  } else if (CHUTES[at]) {
    steps.push({ kind: 'chute', who, from: at, to: CHUTES[at] })
    at = CHUTES[at]
  }
  pos[who] = at
  if (at >= CHUTES_END) {
    steps.push({ kind: 'win', who })
    return { state: { pos, turn: who, winner: who }, steps }
  }
  const next = other(who)
  steps.push({ kind: 'pass', to: next })
  return { state: { pos, turn: next, winner: null }, steps }
}

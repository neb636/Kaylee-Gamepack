// Kaylee's Unicorn Dice Game: her own rules, exactly as she said yes to them (2026-11-06, game-table.html).
// - Two players, Kaylee and the cousin. Both start before space 1 (position 0). Kaylee goes first.
// - Roll one die (1-6). On 1, 2, 3, 5 or 6: move forward that many spaces.
// - On 4: stay where you are; this turn is over. (Just this turn: no extra skipped turn later.)
// - Then the other player rolls.
// - First to reach or pass 25 wins; the piece stops at the castle (no exact roll needed).
import { other, type Step, type Turns } from './turns'

export const UNICORN_END = 25
/** The number that means a rest. */
export const REST = 4

/** One roll of `n` for whoever's turn it is: the new state and what to show. */
export function unicornRoll(s: Turns, n: number): { state: Turns; steps: Step[] } {
  if (s.winner !== null) return { state: s, steps: [] }
  const who = s.turn
  const steps: Step[] = [{ kind: 'roll', who, n }]
  const pos: [number, number] = [s.pos[0], s.pos[1]]
  if (n === REST) steps.push({ kind: 'rest', who })
  else {
    const from = pos[who]
    pos[who] = Math.min(UNICORN_END, from + n)
    steps.push({ kind: 'move', who, from, to: pos[who] })
  }
  if (pos[who] >= UNICORN_END) {
    steps.push({ kind: 'win', who })
    return { state: { pos, turn: who, winner: who }, steps }
  }
  const next = other(who)
  steps.push({ kind: 'pass', to: next })
  return { state: { pos, turn: next, winner: null }, steps }
}

// What every game at the table shares: two players taking turns, Kaylee first, and the steps a move shows. Pure
// TypeScript (no three.js, no DOM, no timers): a move returns the new state at once and the steps for the table to play
// back, so the state is always right, even while a piece is still hopping. Tested in tests/thailand-board-games.spec.ts.

/** 0 = Kaylee, 1 = the cousin. */
export type Who = 0 | 1
export const other = (w: Who): Who => (w === 0 ? 1 : 0)

/** What the table shows for one move, in order. */
export type Step =
  | { kind: 'roll'; who: Who; n: number }
  | { kind: 'draw'; who: Who; card: string }
  | { kind: 'move'; who: Who; from: number; to: number }
  | { kind: 'rest'; who: Who }
  | { kind: 'ladder'; who: Who; from: number; to: number }
  | { kind: 'chute'; who: Who; from: number; to: number }
  | { kind: 'reshuffle' }
  | { kind: 'win'; who: Who }
  | { kind: 'pass'; to: Who }

/** Where both pieces are, whose turn it is, and who won (null: still playing). */
export interface Turns {
  pos: [number, number]
  turn: Who
  winner: Who | null
}

export function startTurns(me = 0, them = 0, turn: Who = 0): Turns {
  return { pos: [me, them], turn, winner: null }
}

/**
 * A six-sided die. `scripted` results come first, in order (a section link's `rolls=4,3,2`, so QA can open a fresh
 * link and see a 4 or a ladder), then fair random rolls. Nothing ever changes a roll to help anyone win.
 */
export function makeDie(scripted: readonly number[] = [], random: () => number = Math.random) {
  const queue = scripted.filter((n) => Number.isInteger(n) && n >= 1 && n <= 6)
  return () => queue.shift() ?? 1 + Math.floor(random() * 6)
}

/** A comma list from a link (`4,3,2`) as numbers; anything else is dropped. */
export function parseRolls(s: string): number[] {
  return s
    .split(',')
    .map((x) => Number(x.trim()))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 6)
}

/** A whole number from a link, kept inside 0..max (anything else: 0). */
export function clampPos(s: string, max: number): number {
  const n = Math.floor(Number(s))
  return Number.isFinite(n) ? Math.min(max, Math.max(0, n)) : 0
}

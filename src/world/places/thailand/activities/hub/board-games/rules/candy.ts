// Candy Land at the game table (our own version: Kaylee asked for the game, not an edition; game-table.md).
// - A path of 36 spaces in six colors that repeat in order (pink, orange, yellow, green, blue, purple); a gate before
//   space 1 (position 0) and the finish after space 36 (position 37).
// - Kaylee starts, then turns alternate. Draw one card: one color goes to the next space of that color; two of a color
//   go to the second one. If the path doesn't have that many of the color left, go all the way to the finish.
// - First to the finish wins.
// - The deck is 28 cards (each color 3 singles and 1 double, plus four pictures), shuffled fresh for each game; drawn cards go on a discard
//   pile, and when the deck runs out the discards are shuffled into a new one.
// - Four picture cards go to their candy landmark, forward or backward. No lost turns.
import { other, type Step, type Turns } from './turns'

export const CANDY_COLORS = ['pink', 'orange', 'yellow', 'green', 'blue', 'purple'] as const
export type CandyColor = (typeof CANDY_COLORS)[number]
export const CANDY_SPACES = 36
/** The finish: one past the last space. */
export const CANDY_FINISH = CANDY_SPACES + 1

export const LANDMARKS = {
  gumdrop: { space: 6, name: 'Gumdrop garden', color: 'green' },
  lollipop: { space: 23, name: 'Lollipop grove', color: 'pink' },
  icecream: { space: 30, name: 'Ice cream peaks', color: 'blue' },
  chocolate: { space: 14, name: 'Chocolate falls', color: 'orange' },
} as const
export type Landmark = keyof typeof LANDMARKS

export interface Card {
  color: CandyColor
  double: boolean
  landmark?: Landmark
}
export interface Deck {
  /** Top of the deck first. */
  draw: Card[]
  discard: Card[]
}

/** The color of space `i` (1..36). */
export const colorOf = (i: number): CandyColor => CANDY_COLORS[(i - 1) % CANDY_COLORS.length]

/** A card as a link writes it: `green` (one) or `green2` (two). */
export const cardToken = (c: Card) => c.landmark ?? `${c.color}${c.double ? '2' : ''}`
export function parseCard(s: string): Card | null {
  const t = s.trim().toLowerCase()
  if (Object.hasOwn(LANDMARKS, t)) return { color: LANDMARKS[t as Landmark].color, double: false, landmark: t as Landmark }
  const double = t.endsWith('2')
  const color = (double ? t.slice(0, -1) : t) as CandyColor
  return CANDY_COLORS.includes(color) ? { color, double } : null
}
/** A link's `deck=green,blue2`: the draw pile exactly, top first. */
export function parseDeck(s: string): Card[] {
  return s
    .split(',')
    .map(parseCard)
    .filter((c): c is Card => !!c)
}

export function shuffle<T>(list: readonly T[], random: () => number = Math.random): T[] {
  const a = list.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Six colors (three singles and a double each), plus four landmark pictures. */
export function fullDeck(): Card[] {
  return [...CANDY_COLORS.flatMap((color) => [...Array.from({ length: 3 }, () => ({ color, double: false })), { color, double: true }]), ...Object.keys(LANDMARKS).map((key) => parseCard(key)!)]
}

/** A new game's deck: the link's cards exactly (then their discards), or all 28 shuffled. */
export function newDeck(scripted: readonly Card[] = [], random: () => number = Math.random): Deck {
  return { draw: scripted.length ? scripted.slice() : shuffle(fullDeck(), random), discard: [] }
}

/** Where a card sends a piece standing on `from`: the next (or second) space of its color, else the finish. */
export function destination(from: number, card: Card): number {
  if (card.landmark) return LANDMARKS[card.landmark].space
  let need = card.double ? 2 : 1
  for (let i = from + 1; i <= CANDY_SPACES; i++) if (colorOf(i) === card.color && --need === 0) return i
  return CANDY_FINISH
}

/** Whoever's turn it is draws a card: the new state and deck, and what to show. */
export function candyDraw(s: Turns, deck: Deck, random: () => number = Math.random): { state: Turns; deck: Deck; steps: Step[]; card: Card | null } {
  if (s.winner !== null) return { state: s, deck, steps: [], card: null }
  const steps: Step[] = []
  let draw = deck.draw.slice()
  let discard = deck.discard.slice()
  if (!draw.length) {
    draw = shuffle(discard, random)
    discard = []
    steps.push({ kind: 'reshuffle' })
  }
  const card = draw.shift()!
  discard.push(card)
  const who = s.turn
  steps.push({ kind: 'draw', who, card: cardToken(card) })
  const pos: [number, number] = [s.pos[0], s.pos[1]]
  const from = pos[who]
  pos[who] = destination(from, card)
  steps.push({ kind: 'move', who, from, to: pos[who] })
  if (pos[who] === CANDY_FINISH) {
    steps.push({ kind: 'win', who })
    return { state: { pos, turn: who, winner: who }, deck: { draw, discard }, steps, card }
  }
  const next = other(who)
  steps.push({ kind: 'pass', to: next })
  return { state: { pos, turn: next, winner: null }, deck: { draw, discard }, steps, card }
}

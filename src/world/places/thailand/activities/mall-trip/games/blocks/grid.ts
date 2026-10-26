// Little Land's stacking, with no physics engine (pure, no three.js). The mat is cut
// into half-brick columns and the bricks into rows: a brick covers two columns side by side, and it rests on whatever
// is highest under either half (so a brick half over the edge still rests on the half that's held). The spots she can
// put a brick on are those resting places; the cards are shapes of spots, filled row by row.
import { COLS, ROWS, type CardId, type Round } from './layout'

/** A brick's place: `s` the left one of its two columns, `r` its row (0 on the mat). */
export interface Cell {
  s: number
  r: number
}

/** The picture cards (round 2), each a shape in the middle of the mat, bottom row first.
 *  chedi:      [4]          elephant:    [3][5]    (the back, the head)
 *           [2]  [4]                  [2][4]       (the body)
 *         [1][3][5]                 [1]    [5]     (the legs)
 *  The chedi's gold spire and the elephant's face go on by themselves when the last brick is in. */
export const CARDS: Record<CardId, Cell[]> = {
  chedi: [
    { s: 1, r: 0 },
    { s: 3, r: 0 },
    { s: 5, r: 0 },
    { s: 2, r: 1 },
    { s: 4, r: 1 },
    { s: 3, r: 2 },
  ],
  elephant: [
    { s: 1, r: 0 },
    { s: 5, r: 0 },
    { s: 2, r: 1 },
    { s: 4, r: 1 },
    { s: 3, r: 2 },
    { s: 5, r: 2 },
  ],
}

const same = (a: Cell, b: Cell) => a.s === b.s && a.r === b.r

export class Grid {
  /** Which brick is in each row and column (-1: none). */
  private cells: number[][] = Array.from({ length: ROWS + 1 }, () => Array(COLS).fill(-1))
  readonly at = new Map<number, Cell>()

  get count() {
    return this.at.size
  }

  /** How high column h is built (rows). */
  height(h: number) {
    for (let r = ROWS; r >= 0; r--) if (this.cells[r][h] >= 0) return r + 1
    return 0
  }
  /** The row a brick over columns s and s+1 comes to rest on. */
  rest(s: number) {
    return Math.max(this.height(s), this.height(s + 1))
  }
  /** Every place a brick can go now (one per column pair, below the top row). */
  spots(): Cell[] {
    const out: Cell[] = []
    for (let s = 0; s <= COLS - 2; s++) {
      const r = this.rest(s)
      if (r < ROWS) out.push({ s, r })
    }
    return out
  }
  place(id: number, c: Cell) {
    this.cells[c.r][c.s] = this.cells[c.r][c.s + 1] = id
    this.at.set(id, { ...c })
  }
  remove(id: number) {
    const c = this.at.get(id)
    if (!c) return
    this.cells[c.r][c.s] = this.cells[c.r][c.s + 1] = -1
    this.at.delete(id)
  }
  clear() {
    for (const row of this.cells) row.fill(-1)
    this.at.clear()
  }
  /** Nothing on top: she can lift it off. */
  free(id: number) {
    const c = this.at.get(id)
    if (!c) return false
    const up = this.cells[c.r + 1]
    return !up || (up[c.s] < 0 && up[c.s + 1] < 0)
  }
  /** How many halves hold it up: 2 on the mat or on two, 1 when it's half over the edge. And which side hangs out. */
  support(c: Cell): { n: number; side: number } {
    if (c.r === 0) return { n: 2, side: 0 }
    const below = this.cells[c.r - 1]
    const l = below[c.s] >= 0
    const rr = below[c.s + 1] >= 0
    return { n: (l ? 1 : 0) + (rr ? 1 : 0), side: l && !rr ? 1 : rr && !l ? -1 : 0 }
  }
  /** The tower's height (rows). */
  top() {
    let t = 0
    for (const c of this.at.values()) t = Math.max(t, c.r + 1)
    return t
  }
  /** The brick at the very top (the tallest, nearest the middle). */
  topBrick(): number | null {
    let best: number | null = null
    let score = -Infinity
    for (const [id, c] of this.at) {
      const sc = c.r * 10 - Math.abs(c.s + 1 - COLS / 2)
      if (sc > score) {
        score = sc
        best = id
      }
    }
    return best
  }

  // ---------------------------------------------------------------- the picture cards

  /** The card's places with a brick in them. */
  filled(card: CardId) {
    return CARDS[card].filter((c) => [...this.at.values()].some((b) => same(b, c)))
  }
  done(card: CardId) {
    return this.filled(card).length === CARDS[card].length
  }
  /** The card's places she can fill now: the lowest row not finished yet, where a brick would rest right there. */
  ghostSpots(card: CardId): Cell[] {
    const open = CARDS[card].filter((c) => ![...this.at.values()].some((b) => same(b, c)))
    if (!open.length) return []
    const row = Math.min(...open.map((c) => c.r))
    return open.filter((c) => c.r === row && this.rest(c.s) === c.r && !this.blocked(c))
  }
  /** Something already sits where this card place would go. */
  private blocked(c: Cell) {
    return this.cells[c.r][c.s] >= 0 || this.cells[c.r][c.s + 1] >= 0
  }

  /** Where she may put a brick in this round: anywhere, or (round 2) the card's next places. */
  allowed(round: Round, card: CardId): Cell[] {
    return round === 2 ? this.ghostSpots(card) : this.spots()
  }

  /** Where a tap on the box sends the next brick: a little pyramid in the middle (round 1), the card's next place
   *  (round 2), straight up the middle (round 3: it gets taller than Daddy fastest). Never half over an edge. */
  tapSpot(round: Round, card: CardId): Cell | null {
    if (round === 2) return this.ghostSpots(card)[0] ?? null
    const mid = (COLS - 2) / 2
    let best: Cell | null = null
    let score = Infinity
    for (const c of this.spots()) {
      const off = Math.abs(c.s - mid)
      if (off > 2) continue
      const edge = this.support(c).n < 2 ? 30 : 0
      const sc = edge + (round === 3 ? off - c.r * 10 : c.r * 4 + off)
      if (sc < score) {
        score = sc
        best = c
      }
    }
    return best
  }
}

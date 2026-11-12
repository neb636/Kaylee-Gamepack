import { expect, test, type Page } from '@playwright/test'
import { makeDie, parseRolls, startTurns } from '../src/world/places/thailand/activities/hub/board-games/rules/turns'
import { UNICORN_END, unicornRoll } from '../src/world/places/thailand/activities/hub/board-games/rules/unicorn'
import { CHUTES, CHUTES_END, chutesRoll, LADDERS, square } from '../src/world/places/thailand/activities/hub/board-games/rules/chutes'
import { CANDY_FINISH, candyDraw, colorOf, destination, fullDeck, newDeck, parseDeck } from '../src/world/places/thailand/activities/hub/board-games/rules/candy'

// The game table in Kaylee's room (planning/around-the-world/thailand/game-table.md). The rules are pure, so most of
// this runs without a page: Kaylee's Unicorn Dice Game exactly as she agreed to it. The page tests check that a turn
// can't be taken twice and that leaving or starting over mid-move leaves nothing behind, through section links and
// window.__thaiHouseQA() (no jump hooks).

test.describe("Kaylee's Unicorn Dice Game rules", () => {
  test('a 4 keeps the piece where it is and passes the turn, with no extra skipped turn later', () => {
    let s = startTurns(7, 9, 0)
    const rest = unicornRoll(s, 4)
    expect(rest.state.pos).toEqual([7, 9])
    expect(rest.state.turn).toBe(1)
    expect(rest.steps.map((x) => x.kind)).toEqual(['roll', 'rest', 'pass'])
    s = unicornRoll(rest.state, 3).state // the cousin moves 9 -> 12
    expect(s.pos).toEqual([7, 12])
    expect(s.turn).toBe(0) // straight back to Kaylee: her next turn is normal
    s = unicornRoll(s, 2).state
    expect(s.pos).toEqual([9, 12])
  })

  test('1, 2, 3, 5 and 6 move that many spaces', () => {
    for (const n of [1, 2, 3, 5, 6]) {
      const r = unicornRoll(startTurns(10, 0, 0), n)
      expect(r.state.pos[0]).toBe(10 + n)
      expect(r.steps).toContainEqual({ kind: 'move', who: 0, from: 10, to: 10 + n })
    }
  })

  test('reaching or passing 25 wins, clamped to the castle, and nobody moves after', () => {
    const exact = unicornRoll(startTurns(22, 0, 0), 3)
    expect(exact.state.pos[0]).toBe(UNICORN_END)
    expect(exact.state.winner).toBe(0)
    const over = unicornRoll(startTurns(22, 20, 0), 6)
    expect(over.state.pos[0]).toBe(UNICORN_END)
    expect(over.state.winner).toBe(0)
    expect(over.steps.at(-1)).toEqual({ kind: 'win', who: 0 })
    // A finished game ignores further rolls: one winner.
    const after = unicornRoll(over.state, 5)
    expect(after.state).toEqual(over.state)
    expect(after.steps).toEqual([])
    // The cousin can win too.
    const cousin = unicornRoll(startTurns(20, 23, 1), 2)
    expect(cousin.state.winner).toBe(1)
    expect(cousin.state.pos).toEqual([20, 25])
  })

  test('a 4 never wins and never moves, even near the castle', () => {
    const r = unicornRoll(startTurns(24, 0, 0), 4)
    expect(r.state.pos[0]).toBe(24)
    expect(r.state.winner).toBeNull()
  })

  test('a whole game always ends with exactly one winner, Kaylee first', () => {
    for (let g = 0; g < 300; g++) {
      const roll = makeDie()
      let s = startTurns()
      expect(s.turn).toBe(0)
      let turns = 0
      while (s.winner === null && turns < 500) {
        s = unicornRoll(s, roll()).state
        turns++
      }
      expect(s.winner).not.toBeNull()
      expect(s.pos.filter((p) => p >= UNICORN_END)).toHaveLength(1)
    }
  })

  test("the link's scripted rolls come first, in order, then fair rolls 1-6", () => {
    const roll = makeDie(parseRolls('4,3,x,9,2'), () => 0.99)
    expect([roll(), roll(), roll(), roll()]).toEqual([4, 3, 2, 6])
    const fair = makeDie([], Math.random)
    for (let i = 0; i < 200; i++) expect(fair()).toBeGreaterThanOrEqual(1)
  })
})

test.describe('Candy Land rules', () => {
  test('the path repeats six colors in order, and the deck has 24 cards: 3 singles and 1 double of each', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 36].map(colorOf)).toEqual(['pink', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'purple'])
    const deck = fullDeck()
    expect(deck).toHaveLength(24)
    for (const c of ['pink', 'orange', 'yellow', 'green', 'blue', 'purple']) {
      expect(deck.filter((d) => d.color === c && !d.double)).toHaveLength(3)
      expect(deck.filter((d) => d.color === c && d.double)).toHaveLength(1)
    }
  })

  test('one color goes to the next space of it, two to the second, from the start too', () => {
    expect(destination(10, { color: 'green', double: false })).toBe(16)
    expect(destination(10, { color: 'blue', double: true })).toBe(17)
    expect(destination(0, { color: 'pink', double: false })).toBe(1)
    expect(destination(0, { color: 'pink', double: true })).toBe(7)
    // The same color as the space it's on: the next one along, never staying put.
    expect(destination(4, { color: 'green', double: false })).toBe(10)
  })

  test('too few of the color left goes all the way to the finish, and that wins', () => {
    expect(destination(31, { color: 'orange', double: true })).toBe(CANDY_FINISH)
    expect(destination(35, { color: 'pink', double: false })).toBe(CANDY_FINISH)
    const r = candyDraw(startTurns(31, 28, 0), newDeck(parseDeck('orange2')))
    expect(r.state.pos[0]).toBe(CANDY_FINISH)
    expect(r.state.winner).toBe(0)
    expect(r.steps.map((x) => x.kind)).toEqual(['draw', 'move', 'win'])
    expect(candyDraw(r.state, r.deck).steps).toEqual([])
  })

  test('turns alternate, and a deck that runs out shuffles its discards back in', () => {
    let s = startTurns(4, 4, 0)
    let deck = newDeck(parseDeck('pink,yellow'))
    let r = candyDraw(s, deck)
    expect(r.state.pos).toEqual([7, 4])
    expect(r.state.turn).toBe(1)
    r = candyDraw(r.state, r.deck)
    expect(r.state.pos).toEqual([7, 9])
    expect(r.deck).toEqual({ draw: [], discard: [{ color: 'pink', double: false }, { color: 'yellow', double: false }] })
    r = candyDraw(r.state, r.deck, () => 0)
    expect(r.steps[0]).toEqual({ kind: 'reshuffle' })
    expect(r.deck.draw.length + r.deck.discard.length).toBe(2)
    expect(r.deck.discard).toHaveLength(1)
    // A whole game with a real deck always ends with one winner, the cards never lost.
    for (let g = 0; g < 200; g++) {
      s = startTurns()
      deck = newDeck()
      let n = 0
      while (s.winner === null && n++ < 400) {
        const m = candyDraw(s, deck)
        s = m.state
        deck = m.deck
        expect(deck.draw.length + deck.discard.length).toBe(24)
      }
      expect(s.winner).not.toBeNull()
    }
  })
})

test.describe('Chutes and Ladders rules', () => {
  test('the 6 by 6 board is numbered like a snake', () => {
    expect([1, 6, 7, 12, 13, 18, 31, 36].map(square)).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 5 },
      { row: 1, col: 5 },
      { row: 1, col: 0 },
      { row: 2, col: 0 },
      { row: 2, col: 5 },
      { row: 5, col: 5 },
      { row: 5, col: 0 },
    ])
    // Every square once.
    const seen = new Set(Array.from({ length: 36 }, (_, i) => { const q = square(i + 1); return q.row * 6 + q.col }))
    expect(seen.size).toBe(36)
  })

  test('ladders go up and slides go down, no two share an end, and the ladders run straight up a column', () => {
    const ends = [...Object.entries(LADDERS), ...Object.entries(CHUTES)].flatMap(([a, b]) => [+a, +b])
    expect(new Set(ends).size).toBe(ends.length)
    for (const [a, b] of Object.entries(LADDERS)) {
      expect(b).toBeGreaterThan(+a)
      expect(square(b).col).toBe(square(+a).col)
    }
    for (const [a, b] of Object.entries(CHUTES)) expect(b).toBeLessThan(+a)
    expect(ends).not.toContain(CHUTES_END)
  })

  test('landing on a ladder climbs, on a slide slides, and only once', () => {
    let r = chutesRoll(startTurns(0, 0, 0), 2)
    expect(r.state.pos[0]).toBe(14)
    expect(r.steps.map((x) => x.kind)).toEqual(['roll', 'move', 'ladder', 'pass'])
    r = chutesRoll(startTurns(31, 25, 0), 2)
    expect(r.state.pos[0]).toBe(22)
    expect(r.steps).toContainEqual({ kind: 'chute', who: 0, from: 33, to: 22 })
    // The cousin climbs too.
    r = chutesRoll(startTurns(10, 12, 1), 6)
    expect(r.state.pos).toEqual([10, 30])
    // Passing over a ladder or slide does nothing: only the landing space counts.
    r = chutesRoll(startTurns(13, 0, 0), 3)
    expect(r.state.pos[0]).toBe(16)
    // No chaining: a ladder top (14) next to a slide top (15) is never followed on.
    expect(chutesRoll(startTurns(12, 0, 0), 2).state.pos[0]).toBe(14)
  })

  test('reach or pass 36 to win, clamped, one winner', () => {
    const r = chutesRoll(startTurns(33, 30, 0), 5)
    expect(r.state.pos[0]).toBe(CHUTES_END)
    expect(r.state.winner).toBe(0)
    expect(chutesRoll(r.state, 3).steps).toEqual([])
    for (let g = 0; g < 200; g++) {
      const roll = makeDie()
      let s = startTurns()
      let n = 0
      while (s.winner === null && n++ < 2000) s = chutesRoll(s, roll()).state
      expect(s.winner).not.toBeNull()
      expect(s.pos.filter((p) => p >= CHUTES_END)).toHaveLength(1)
    }
  })
})

async function open(page: Page, hash: string) {
  await page.goto(`./${hash}`)
  await page.getByRole('button', { name: /let's play/i }).click()
  await page.waitForFunction(() => !!window.__thaiHouseQA?.()?.table, null, { timeout: 15000 })
}
const table = (page: Page) => page.evaluate(() => (window.__thaiHouseQA?.() as { table: Record<string, unknown> }).table)

test.describe('the game table', () => {
  test('Candy Land: a tap draws one card, it shows big, and the piece goes to that color', async ({ page }) => {
    test.setTimeout(90000)
    await open(page, '#/world/thailand/hub/candy?me=10&them=8&deck=green,blue2')
    const deck = page.getByRole('button', { name: 'Cards', exact: true })
    for (let i = 0; i < 3; i++) await deck.click({ force: true })
    await expect(page.getByRole('img', { name: 'green card' })).toBeVisible({ timeout: 20000 })
    await expect.poll(() => table(page), { timeout: 60000 }).toMatchObject({ phase: 'awaiting', turn: 'kaylee', me: 16, them: 17 })
  })

  test('Again during the cousin turn starts a clean game, and leaving mid-move puts everyone back', async ({ page }) => {
    test.setTimeout(60000)
    await open(page, '#/world/thailand/hub/unicorn?vs=gan&me=3&them=4&turn=cousin&rolls=6,6,6')
    await page.getByRole('button', { name: 'Games' }).click()
    await page.getByRole('button', { name: 'Play', exact: true }).click({ force: true })
    // The Unicorn game asks her unicorn's color first (its own step, with its own Play).
    await expect.poll(() => table(page)).toMatchObject({ picking: true, step: 'color' })
    await page.getByRole('button', { name: 'lavender unicorn' }).click({ force: true })
    await expect.poll(() => table(page)).toMatchObject({ piece: 'lavender' })
    await page.getByRole('button', { name: 'Play', exact: true }).click({ force: true })
    // The old cousin turn can't move anything in the new game.
    await page.waitForTimeout(3000)
    expect(await table(page)).toMatchObject({ phase: 'awaiting', me: 0, them: 0, turn: 'kaylee', seated: 'gan' })
    await page.getByRole('button', { name: 'Die', exact: true }).click({ force: true })
    await page.waitForTimeout(500)
    await page.getByRole('button', { name: 'Leave the table' }).click()
    await expect.poll(() => table(page)).toMatchObject({ open: false, seated: null, phase: 'off', stage: false, curtain: false })
    await expect(page).toHaveURL(/hub\/upstairs/)
  })

  test('from her room: she sits at the table, the screen fades, and the picker opens on the floating board', async ({ page }) => {
    test.setTimeout(90000)
    await open(page, '#/world/thailand/hub/upstairs?at=couch')
    expect(await table(page)).toMatchObject({ open: false, stage: false })
    // (The table's own tap target: Enter on it, like a keyboard tap.)
    await page.getByRole('button', { name: 'Game table', exact: true }).evaluate((el: HTMLElement) => el.click())
    await expect.poll(() => table(page), { timeout: 60000 }).toMatchObject({ open: true, stage: true, curtain: false, picking: true })
  })
})

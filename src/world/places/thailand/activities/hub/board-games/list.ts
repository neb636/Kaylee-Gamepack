// The game table's games and cousins (planning/around-the-world/thailand/game-table.html). Pure data, loaded at startup
// by the hub's sections.ts: no three.js, and nothing about the house (the table's place is in layout.ts).
//
// `built`: the game is in the code (the picker shows it on Dad's links). `ready`: Dad played its full loop on the iPad,
// so it opens from the table in Kaylee's own house too. Until then a game is reached only from a board-game section
// link (#/world/thailand/hub/table, .../unicorn, ...), like an activity in meta.ts's inTheWorks.

export type GameId = 'unicorn' | 'candy' | 'chutes'
export type CousinId = 'bb' | 'gan' | 'ken'

export interface GameInfo {
  id: GameId
  name: string
  icon: string
  built: boolean
  ready: boolean
}

export const GAMES: readonly GameInfo[] = [
  { id: 'unicorn', name: "Kaylee's Unicorn Dice Game", icon: '🦄', built: true, ready: false },
  { id: 'candy', name: 'Candy Land', icon: '🍭', built: false, ready: false },
  { id: 'chutes', name: 'Chutes and Ladders', icon: '🪜', built: false, ready: false },
]

/** BB first: Kaylee picked her (2026-11-06). */
export const COUSINS: readonly CousinId[] = ['bb', 'gan', 'ken']

/** The Unicorn game's pieces, in the picker's order. */
export const UNICORNS = ['pink', 'lavender', 'mint', 'sunny'] as const
export type UnicornColor = (typeof UNICORNS)[number]
/** Each cousin's favorite unicorn, then the next free one. */
export const FAVORITE: Record<CousinId, UnicornColor> = { bb: 'pink', gan: 'sunny', ken: 'mint' }
export function cousinUnicorn(vs: CousinId, mine: UnicornColor): UnicornColor {
  if (FAVORITE[vs] !== mine) return FAVORITE[vs]
  return UNICORNS.find((c) => c !== mine && c !== FAVORITE[vs]) ?? 'lavender'
}

/** The hub sections that are the table (a house opened from one shows every built game). */
export const TABLE_SECTIONS = ['table', 'unicorn', 'candy', 'chutes'] as const
export type TableSection = (typeof TABLE_SECTIONS)[number]
export const isTableSection = (s: string): s is TableSection => (TABLE_SECTIONS as readonly string[]).includes(s)

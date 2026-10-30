// The game shelf: every game as an icon, a card per place (Thailand's trips are split into their games), so Kaylee
// can pick a bunch of different things fast, the way she does in Roblox. The world map's list view (Shelf.tsx).
// A card opens its activity, or one section of it (#/world/<place>/<activity>/<section>), skipping the flight and the
// country map. The pictures are SVG drawn by hand, not generated (Dad, 2026-10-30): a banner per place in
// shelf/banners/<row>.svg and an icon per game in shelf/icons/<place>/<card>.svg (style: shelf/STYLE.md).
import { HUB } from './kit/sections'
import type { FlagId } from './kit/Flag'
import { WORLD_LINES } from './lines'
import { places } from './registry'

/** A card's or a row's spoken name (a new country's or activity's line is added to lines.ts with its card). */
export const nameLine = (key: string): string | undefined => (WORLD_LINES.shelf.games as Record<string, string>)[key] ?? (WORLD_LINES.shelf.rows as Record<string, string>)[key]

export interface ShelfGame {
  /** `<place>/<card>`: its spoken name is WORLD_LINES.shelf.games[key]; favorites and "played" remember it. */
  key: string
  /** Short name under the card, for Dad. */
  name: string
  /** Its picture (shelf/icons/), or none yet: then `emoji` on a pastel tile. */
  icon?: string
  emoji: string
  /** Where it opens: a country's activity (or one section of it), or a game from src/games/ (the tea party). */
  place?: string
  activity?: string
  section?: string
  game?: string
}

export interface ShelfRow {
  /** Its spoken name is WORLD_LINES.shelf.rows[id]. */
  id: string
  title: string
  flag?: FlagId
  emoji?: string
  /** The picture across the top of its card (shelf/banners/<id>.svg). */
  banner?: string
  games: ShelfGame[]
}

// The pictures, found by name. Their URLs, never inlined: inlined they would all ride in the startup bundle; as files
// they load when the shelf shows them and the offline cache keeps them.
const icons = import.meta.glob<string>('./shelf/icons/**/*.svg', { eager: true, import: 'default', query: '?no-inline' })
const banners = import.meta.glob<string>('./shelf/banners/*.svg', { eager: true, import: 'default', query: '?no-inline' })
/** A game's icon: `icon('thailand/vet')` is shelf/icons/thailand/vet.svg. */
const icon = (path: string): string | undefined => icons[`./shelf/icons/${path}.svg`]
export const banner = (row: string): string | undefined => banners[`./shelf/banners/${row}.svg`]

export const TEA_PARTY: ShelfGame = { key: 'teaParty', name: 'Tea party', icon: icon('tea-party'), emoji: '🫖', game: 'unicorn-tea-party' }
export const SURPRISE_ICON = icon('surprise')

/** One Thailand card: a section of a trip (or of the house, `hub`). */
const th = (card: string, name: string, activity: string, section: string, emoji: string): ShelfGame => ({
  key: `thailand/${card}`,
  name,
  icon: icon(`thailand/${card}`),
  emoji,
  place: 'thailand',
  activity,
  section,
})

// Thailand: the house and its three trips, each game its own card. (The Nan Mountain Cup joins when it's out of greybox.)
const THAILAND: ShelfRow[] = [
  {
    id: 'house',
    banner: banner('house'),
    title: "Agong's house",
    flag: 'thailand',
    emoji: '🏠',
    games: [th('street', "Agong's house", HUB, 'street', '🏠'), th('upstairs', 'My room', HUB, 'upstairs', '🛏️'), th('wardrobe', 'Wardrobe', HUB, 'wardrobe', '👗'), th('map', 'Thailand map', HUB, 'map', '🗺️')],
  },
  {
    id: 'mall',
    banner: banner('mall'),
    title: 'Mall day',
    flag: 'thailand',
    emoji: '🛝',
    games: [
      th('hall', 'HarborLand', 'mall-trip', 'hall', '🛝'),
      th('vet', 'Vet', 'mall-trip', 'vet', '🐶'),
      th('cafe', 'Cafe', 'mall-trip', 'cafe', '🍓'),
      th('barber', 'Barber', 'mall-trip', 'barber', '✂️'),
      th('race', 'Racing slide', 'mall-trip', 'race', '🏁'),
      th('blocks', 'Giant blocks', 'mall-trip', 'blocks', '🧱'),
      th('mountain', 'Climbing wall', 'mall-trip', 'mountain', '🧗'),
      th('boxing', 'Muay Thai', 'mall-trip', 'boxing', '🥊'),
      th('skypod', 'Sky pod', 'mall-trip', 'skypod', '💡'),
      th('frame', 'Big frame', 'mall-trip', 'frame', '🎪'),
      th('pizza', 'Pizza', 'mall-trip', 'menu', '🍕'),
    ],
  },
  {
    id: 'krabi',
    banner: banner('krabi'),
    title: 'Krabi',
    flag: 'thailand',
    emoji: '🐘',
    games: [
      th('feed', 'Elephants', 'boat-trip', 'feed', '🐘'),
      th('drinks', 'Elephant cafe', 'boat-trip', 'drinks', '🥤'),
      th('pier', 'Boat ribbons', 'boat-trip', 'pier', '🎀'),
      th('bay', 'Boat ride', 'boat-trip', 'bay', '🚤'),
      th('village', 'Floating football', 'boat-trip', 'village', '⚽'),
      th('boatrace', 'Boat race', 'boat-trip', 'race', '🏆'),
    ],
  },
  {
    id: 'nan',
    banner: banner('nan'),
    title: 'Nan',
    flag: 'thailand',
    emoji: '🏔️',
    games: [th('drive', 'Mountain road', 'nan-trip', 'drive', '🚙'), th('mushrooms', 'Mushrooms', 'nan-trip', 'mushrooms', '🍄'), th('rice', 'Rice farm', 'nan-trip', 'rice', '🌾'), th('salt', 'Salt wells', 'nan-trip', 'salt', '🧂')],
  },
]

/** Every row in order: Thailand first (the family's country), then the others as they were added. A country's row
 *  is its ready activities (not `inTheWorks`), each with its icon, or the activity's emoji until it has one. */
export const SHELF: ShelfRow[] = [
  ...THAILAND.filter(() => places.some((p) => p.meta.id === 'thailand')),
  ...places
    .filter(({ meta }) => meta.id !== 'thailand' && meta.activities.length > 0)
    .map(({ meta }) => ({
      id: meta.id,
      title: meta.name,
      flag: meta.flag,
      banner: banner(meta.id),
      games: meta.activities.map((a) => ({ key: `${meta.id}/${a.id}`, name: a.name, icon: icon(`${meta.id}/${a.id}`), emoji: a.icon, place: meta.id, activity: a.id })),
    })),
]

export const ALL_GAMES: ShelfGame[] = [TEA_PARTY, ...SHELF.flatMap((r) => r.games)]

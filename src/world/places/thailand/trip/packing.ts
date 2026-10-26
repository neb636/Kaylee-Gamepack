// What Kaylee can pack for a trip, and the `packed` list that carries through every leg (the URL param, what she
// saved, the x-ray screen). Pure data (no three.js): sections.ts reads it too.
import type { Wearable } from '../characters/looks'

export interface PackItem {
  id: string
  /** What it's called (tap target label, for Dad and for tests). */
  label: string
  /** For the packing card and the boarding pass. */
  icon: string
  /** Mommy's hint ("It's hot and sunny at the sea!") makes these glint. */
  sun?: boolean
  /** For the mountains: only in her room on a cool trip (the Nan road trip), where Mommy's hint ("It's cool and rainy
   *  in the mountains!") makes them glint. */
  cool?: boolean
}

/** What the weather is like where a trip goes (trip/types.ts `pack.hint`). */
export type Weather = 'sun' | 'cool'

export const ITEMS: PackItem[] = [
  { id: 'sunhat', label: 'Sun hat', icon: '👒', sun: true },
  { id: 'sunglasses', label: 'Sunglasses', icon: '🕶️', sun: true },
  { id: 'sunscreen', label: 'Sunscreen', icon: '🧴', sun: true },
  { id: 'floaties', label: 'Floaties', icon: '🛟' },
  { id: 'swimsuit', label: 'Swimsuit', icon: '👙' },
  { id: 'duck', label: 'Rubber duck', icon: '🦆' },
  { id: 'teddy', label: 'Teddy', icon: '🧸' },
  { id: 'bucket', label: 'Bucket and spade', icon: '🪣' },
  { id: 'camera', label: "Daddy's camera", icon: '📷' },
  { id: 'raincoat', label: 'Raincoat', icon: '🧥', cool: true },
  { id: 'boots', label: 'Rain boots', icon: '🥾', cool: true },
  { id: 'umbrella', label: 'Umbrella', icon: '☂️', cool: true },
  // The silly ones.
  { id: 'pillow', label: 'Pillow', icon: '🛏️' },
  { id: 'fan', label: 'Little fan', icon: '🌀' },
  { id: 'mango', label: 'Mango', icon: '🥭' },
  // A cousin, asleep on the mattress ("Five more minutes...").
  { id: 'gan', label: 'Gan', icon: '🦊' },
]

export const DEFAULT_PACKED = 'sunhat,sunglasses,floaties,duck,teddy'

/** The `packed` param or saved value as a list of known item ids, in a stable order, no repeats. */
export function parsePacked(s: string): string[] {
  const want = new Set(s.split(',').map((x) => x.trim()))
  return ITEMS.filter((i) => want.has(i.id)).map((i) => i.id)
}
export const formatPacked = (ids: string[]) => parsePacked(ids.join(',')).join(',')

/** The things in her room for a trip: everything but the mountain things, which come out only for a cool trip. */
export const itemsFor = (weather: Weather) => ITEMS.filter((i) => weather === 'cool' || !i.cool)

/** At the end, Mommy tucks in what the trip needs, whatever Kaylee chose: sunscreen always (with no hat in it, Mommy
 *  puts her spare sun hat straight on Kaylee's head instead: see `wearing`); for the mountains, the umbrella. */
export function mommyTucksIn(ids: string[], weather: Weather = 'sun'): string[] {
  const must = weather === 'cool' ? 'umbrella' : 'sunscreen'
  return ids.includes(must) ? ids : parsePacked([...ids, must].join(','))
}

/** What Kaylee wears from the moment the suitcase clicks shut (the goodbye, the airport, the plane, the bay): her sun hat,
 *  sunglasses and floaties if she packed them, and Mommy's spare sun hat if she packed no hat (not on a cool trip: its
 *  suitcase always has the umbrella Mommy tucks in). */
export function wearing(ids: string[]): Wearable[] {
  const cool = ids.includes('umbrella')
  const on: Wearable[] = ids.includes('sunhat') ? ['sunhat'] : cool ? [] : ['spare-hat']
  if (ids.includes('sunglasses')) on.push('sunglasses')
  if (ids.includes('floaties')) on.push('floaties')
  return on
}

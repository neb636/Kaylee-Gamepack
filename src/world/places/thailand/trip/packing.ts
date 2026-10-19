// What Kaylee can pack for a trip, and the `packed` list that carries through every leg (the URL param, what she
// saved, the x-ray screen). Pure data (no three.js): sections.ts and the flat version read it too.

export interface PackItem {
  id: string
  /** What it's called (tap target label, for Dad and for tests). */
  label: string
  /** For the flat version and the boarding pass. */
  icon: string
  /** Mommy's hint ("It's hot and sunny at the sea!") makes these glint. */
  sun?: boolean
}

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

/** At the end, Mommy tucks in what a sunny trip needs, whatever Kaylee chose: sunscreen always, and her spare sun hat
 *  if there's no hat. */
export function mommyTucksIn(ids: string[]): string[] {
  const add = ['sunscreen', 'sunhat'].filter((x) => !ids.includes(x))
  return parsePacked([...ids, ...add].join(','))
}

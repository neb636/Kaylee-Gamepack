// A family trip is data (plan: planning/around-the-world/thailand/boat-trip.md, "The trip kit"); the legs in trip/legs/
// are generic and read it. Pure data, no three.js.
import type { LonLat } from './outline'

export type LegKind = 'invite' | 'pack' | 'goodbye' | 'airport' | 'fly'

export interface TripDef {
  id: string
  /** Who comes along with Kaylee (cast ids). */
  who: ('ji' | 'nick')[]
  /** What Mommy hints at, and how many things fit before she has to sit on the suitcase. */
  pack: { hint: 'sun'; fits: number }
  /** How she gets there: Aunty Sri's van picks them up at the goodbye (no ride: it pulls away and they're at the
   *  airport), the pilot flies (she rides and plays). */
  legs: ({ kind: 'van'; driver: 'sri' } | { kind: 'airport' } | { kind: 'fly'; from: LonLat; to: LonLat; seat: 'window' })[]
  /** Seconds each ride takes, whatever she does (the hard caps). */
  caps: { fly: number }
  /** The trip's own activity starts at this section. */
  arrive: string
}

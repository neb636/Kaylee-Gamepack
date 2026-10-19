// A family trip is data (plan: planning/around-the-world/thailand/boat-trip.md, "The trip kit"); the legs in trip/legs/
// are generic and read it. Pure data, no three.js.
import type { LonLat } from './outline'

export type LegKind = 'invite' | 'pack' | 'goodbye' | 'car' | 'airport' | 'fly'

export interface TripDef {
  id: string
  /** Who comes along with Kaylee (cast ids). */
  who: ('ji' | 'nick')[]
  /** The trip's pin on the elephant map in her room. */
  pin: { at: LonLat; icon: 'boat' }
  /** What Mommy hints at, and how many things fit before she has to sit on the suitcase. */
  pack: { hint: 'sun'; fits: number }
  /** How she gets there: Aunty Sri drives to the airport, the pilot flies (she rides and plays). */
  legs: ({ kind: 'car'; driver: 'sri'; road: 'bangkok' } | { kind: 'airport' } | { kind: 'fly'; from: LonLat; to: LonLat; seat: 'window' })[]
  /** Seconds each ride takes, whatever she does (the hard caps). */
  caps: { car: number; fly: number }
  /** The trip's own activity starts at this section. */
  arrive: string
}

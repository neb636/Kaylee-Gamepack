// The boat trip as a trip (trip/types.ts): Mommy, Daddy and Kaylee, Aunty Sri's van to the airport, a window seat to Krabi, then the longtail at the pier. Pure data.
import { PLACES } from '../../trip/outline'
import type { TripDef } from '../../trip/types'
import type { BoatSection } from './sections'

export const BOAT_TRIP: TripDef = {
  id: 'boat-trip',
  who: ['ji', 'nick'],
  pack: { hint: 'sun', fits: 5 },
  legs: [
    { kind: 'van', driver: 'sri' },
    { kind: 'airport' },
    { kind: 'fly', from: PLACES.bangkok, to: PLACES.krabi, seat: 'window' },
  ],
  caps: { fly: 70 },
  arrive: 'pier',
}

/** Which 3D world each section runs in (one mount each; switching worlds goes behind the boarding pass). */
export type TripWorld = 'house' | 'airport' | 'plane' | 'bay'
export const WORLD_OF: Record<BoatSection, TripWorld> = {
  invite: 'house',
  pack: 'house',
  goodbye: 'house',
  airport: 'airport',
  takeoff: 'plane',
  fly: 'plane',
  land: 'plane',
  pier: 'bay',
  bay: 'bay',
  village: 'bay',
  cave: 'bay',
  hong: 'bay',
  nail: 'bay',
  sunset: 'bay',
}

/** The legs on the boarding pass, each punched when she finishes it. */
export const PASS: { id: BoatSection; icon: string; label: string }[] = [
  { id: 'pack', icon: '🧳', label: 'Pack' },
  { id: 'goodbye', icon: '🚐', label: 'Goodbye' },
  { id: 'airport', icon: '🛄', label: 'Airport' },
  { id: 'fly', icon: '✈️', label: 'Fly' },
  { id: 'pier', icon: '🚤', label: 'Boat' },
]
/** A punch on the boarding pass for the leg a section belongs to. */
export const PUNCH: Partial<Record<BoatSection, BoatSection>> = { pack: 'pack', goodbye: 'goodbye', airport: 'airport', takeoff: 'fly', fly: 'fly', land: 'fly' }

// The boat trip as a trip (trip/types.ts): Mommy, Daddy and Kaylee, a boat pin on Phang Nga Bay, Aunty Sri's car to
// the airport, a window seat to Krabi, then the longtail at the pier. Pure data.
import { PLACES } from '../../trip/outline'
import type { TripDef } from '../../trip/types'
import type { BoatSection } from './sections'

export const BOAT_TRIP: TripDef = {
  id: 'boat-trip',
  who: ['ji', 'nick'],
  pin: { at: PLACES.phangNga, icon: 'boat' },
  pack: { hint: 'sun', fits: 5 },
  legs: [
    { kind: 'car', driver: 'sri', road: 'bangkok' },
    { kind: 'airport' },
    { kind: 'fly', from: PLACES.bangkok, to: PLACES.krabi, seat: 'window' },
  ],
  caps: { car: 40, fly: 70 },
  arrive: 'pier',
}

/** Which 3D world each section runs in (one mount each; switching worlds goes behind the boarding pass). */
export type TripWorld = 'house' | 'car' | 'airport' | 'plane' | 'bay'
export const WORLD_OF: Record<BoatSection, TripWorld> = {
  invite: 'house',
  pack: 'house',
  goodbye: 'house',
  car: 'car',
  airport: 'airport',
  takeoff: 'plane',
  fly: 'plane',
  land: 'plane',
  pier: 'bay',
  bay: 'bay',
  cave: 'bay',
  nail: 'bay',
}

/** The legs on the boarding pass, each punched when she finishes it. */
export const PASS: { id: BoatSection; icon: string; label: string }[] = [
  { id: 'pack', icon: '🧳', label: 'Pack' },
  { id: 'goodbye', icon: '👋', label: 'Goodbye' },
  { id: 'car', icon: '🚗', label: 'Car' },
  { id: 'airport', icon: '🛄', label: 'Airport' },
  { id: 'fly', icon: '✈️', label: 'Fly' },
  { id: 'pier', icon: '🚤', label: 'Boat' },
]
/** A punch on the boarding pass for the leg a section belongs to. */
export const PUNCH: Partial<Record<BoatSection, BoatSection>> = { pack: 'pack', goodbye: 'goodbye', car: 'car', airport: 'airport', takeoff: 'fly', fly: 'fly', land: 'fly' }

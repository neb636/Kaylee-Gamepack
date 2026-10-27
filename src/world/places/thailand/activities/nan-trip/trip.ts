// The Nan road trip as a trip (trip/types.ts): Mommy, Daddy and Kaylee pack for the mountains, Aunty Sri's van to the
// airport, a window seat north to Nan, then straight to the Nan map and the Pajero. Coming home, the photo she picks
// goes on Agong's wall (no gift this time, Dad). Pure data.
import { L } from '../../lines'
import { PLACES } from '../../trip/outline'
import type { TripDef } from '../../trip/types'
import type { NanSection } from './sections'

export const NAN_TRIP: TripDef = {
  id: 'nan-trip',
  who: ['ji', 'nick'],
  pack: { hint: 'cool', fits: 5 },
  legs: [
    { kind: 'van', driver: 'sri' },
    { kind: 'airport' },
    { kind: 'fly', from: PLACES.bangkok, to: PLACES.nan, seat: 'window' },
  ],
  caps: { fly: 35, replayFly: 24 },
  arrive: 'map',
  goodbye: 'parents',
  // (The photo she picks is all she brings: Agong asks for it as on the boat trip.)
  gift: 'photo',
  lines: {
    ready: L.trip.goodbye.van,
    horn: L.trip.goodbye.horn,
    home: L.home.sri,
    agong: L.home.agong,
    thanks: L.home.thanks,
    cousins: { gan: L.home.gan, ken: L.home.ken, bb: L.home.bb },
    pick: L.home.pick,
    give: L.home.give,
    wall: L.nan.trip.wall,
  },
}

/** The trip's flight (the plane leg flies its route). */
export const FLIGHT = NAN_TRIP.legs.find((l) => l.kind === 'fly') as { from: [number, number]; to: [number, number] }

/** The trip's legs around the stops (Loop.tsx): Agong's house, the airport and the window seat. */
export const LOOP = ['invite', 'pack', 'goodbye', 'airport', 'takeoff', 'fly', 'land', 'home'] as const
export type LoopSection = (typeof LOOP)[number]
export const isLoop = (s: string): s is LoopSection => (LOOP as readonly string[]).includes(s)
export type LoopWorld = 'house' | 'airport' | 'plane'
export const WORLD_OF: Record<LoopSection, LoopWorld> = { invite: 'house', pack: 'house', goodbye: 'house', airport: 'airport', takeoff: 'plane', fly: 'plane', land: 'plane', home: 'house' }

/** The legs on the boarding pass, each punched when she finishes it (the stops in any order). */
export const PASS: { id: string; icon: string; label: string }[] = [
  { id: 'pack', icon: '🧳', label: 'Pack' },
  { id: 'fly', icon: '✈️', label: 'Fly' },
  { id: 'mushrooms', icon: '🍄', label: 'Mushrooms' },
  { id: 'rice', icon: '🌾', label: 'Rice' },
  { id: 'salt', icon: '🧂', label: 'Salt' },
  { id: 'cup', icon: '🏁', label: 'The Cup' },
  { id: 'home', icon: '🏠', label: 'Home' },
]
/** The boarding pass's legs on this trip (🏁 only with the Cup on). */
export const passFor = (cup: boolean) => (cup ? PASS : PASS.filter((p) => p.id !== 'cup'))
/** The boarding pass's leg for a section (the goodbye, the airport and the plane are all the flight). */
export function legOf(s: NanSection): string | null {
  if (s === 'invite') return null
  if (s === 'pack') return 'pack'
  if (s === 'goodbye' || s === 'airport' || s === 'takeoff' || s === 'fly' || s === 'land') return 'fly'
  if (s === 'mushrooms' || s === 'rice' || s === 'salt' || s === 'home') return s
  if (s === 'cup' || s === 'race' || s === 'podium' || s === 'cup-win') return 'cup'
  return null
}
/** Where the trip picks up next time she says yes to the mountains (the start of a leg). */
export const RESUME: NanSection[] = ['goodbye', 'airport', 'takeoff', 'map']
export const RESUME_AT: Partial<Record<NanSection, NanSection>> = { fly: 'takeoff', land: 'takeoff', drive: 'map', mushrooms: 'map', rice: 'map', salt: 'map', cup: 'map', race: 'map', podium: 'map', 'cup-win': 'map', three: 'map' }

// The Koh Samet trip as a trip (trip/types.ts): Mommy, Daddy and Kaylee pack for the sea (the swimsuit, the sun hat,
// the floaties, the bucket), Mommy drives them to Ban Phe pier in her Veloz, and the speedboat takes them over to Na
// Dan pier. Coming home, a photo of the island goes on Agong's wall by itself (the trips end on the Thailand map). Pure
// data, and what the trip saves (no three.js: sections.ts and the map read it).
import { savedKey } from '../../../../../sdk/hooks'
import { L } from '../../lines'
import type { TripDef } from '../../trip/types'

export const SAMET_TRIP: TripDef = {
  id: 'samet-trip',
  who: ['ji', 'nick'],
  pack: { hint: 'sun', fits: 5 },
  // (Mommy drives to Ban Phe: no ride, the car pulls away and they're at the pier, like the mall day.)
  legs: [{ kind: 'car', driver: 'ji', car: 'veloz' }],
  caps: { fly: 0 },
  arrive: 'speedboat',
  // Down the stairs with the suitcase, straight onto the speedboat (the trips start on the Thailand map).
  afterPack: 'speedboat',
  goodbye: 'parents',
  gift: 'photo',
  lines: {
    // (No goodbye at the shutter: the trips start on the Thailand map, so this is only for its link, if it gets one.)
    ready: L.trip.goodbye.van,
    home: L.home.sri,
    agong: L.home.agong,
    thanks: L.home.thanks,
    cousins: { gan: L.home.gan, ken: L.home.ken, bb: L.home.bb },
    pick: L.home.pick,
    give: L.home.give,
    wall: L.samet.trip.wall,
  },
}

/** What a packing for the island puts in the suitcase when a link starts later on (the `packed` param's default). */
export const SAMET_PACKED = 'sunhat,floaties,swimsuit,bucket'

/** What the iPad remembers between visits (useSaved 'thailand-samet-trip'): where she was on the island, the pink
 *  flags, the animals in her book, what she packed, and how many whole trips she has done. Her photos stay for the
 *  visit only (they're big). */
export interface SametProgress {
  /** Her last beach (the next visit lands her there), or null: a new trip, she lands at Na Dan pier. */
  at: string | null
  flags: string
  book: string
  packed: string
  trips?: number
}
export const SAMET_SAVE_KEY = 'thailand-samet-trip'
export const NEW_TRIP: SametProgress = { at: null, flags: '', book: '', packed: SAMET_PACKED }

/** The saved trip, read outside React (the Thailand map's pin: a trip half done goes straight back to the island). */
export function readSametSave(): SametProgress | null {
  try {
    const raw = localStorage.getItem(savedKey(SAMET_SAVE_KEY))
    return raw ? (JSON.parse(raw) as SametProgress) : null
  } catch {
    return null
  }
}

// A family trip is data (plan: planning/around-the-world/thailand/boat-trip.md, "The trip kit"); the legs in trip/legs/
// are generic and read it. Pure data, no three.js.
import type { Line } from '../../../../sdk'
import type { LonLat } from './outline'
import type { Weather } from './packing'

export type LegKind = 'invite' | 'pack' | 'goodbye' | 'airport' | 'fly' | 'car' | 'arrive' | 'home'

/** What the people at the house say at the goodbye and coming home (lines.ts). */
export interface TripLines {
  /** The goodbye: the car is here, hop in; a tap on the driver at the wheel (Aunty Sri). */
  ready: Line
  horn?: Line
  /** The goodbye with the whole family at the shutter: Agong's wish (the trip's goal), and the big cousins' "Bye...". */
  wish?: Line
  bye?: Partial<Record<'gan' | 'ken' | 'bb', Line>>
  /** Coming home: the driver at Agong's door, Agong asking for his gift and thanking her for it. */
  home: Line
  agong: Line
  thanks: Line
  /** The big cousins putting their phones down, for the first time. */
  cousins: Record<'gan' | 'ken' | 'bb', Line>
  /** Agong laughing at Daddy's new hairdo (the mall's barber). */
  hair?: Line
  /** Sparkle, after a while with nothing done: pick the photo, give Agong his gift. */
  pick?: Line
  give: Line
  /** The new photo on Agong's wall, tapped (the mall day: Mommy's "Our mall day!"). */
  wall?: Line
}

export interface TripDef {
  id: string
  /** Who comes along with Kaylee (cast ids). */
  who: ('ji' | 'nick')[]
  /** What Mommy hints at (the sea's sun, or the mountains' cool and rain), and how many things fit before she has to
   *  sit on the suitcase. No packing on a day out. */
  pack?: { hint: Weather; fits: number }
  /** How she gets there: Aunty Sri's van picks them up at the goodbye (no ride: it pulls away and they're at the
   *  airport), the pilot flies (she rides and plays); or Mommy drives the family's rental car (it pulls away and
   *  they're there). */
  legs: ({ kind: 'van'; driver: 'sri' } | { kind: 'car'; driver: 'ji'; car: 'veloz' } | { kind: 'airport' } | { kind: 'fly'; from: LonLat; to: LonLat; seat: 'window' })[]
  /** Seconds each ride takes, whatever she does (the hard caps), and the flight's on a replay. */
  caps: { fly: number; replayFly?: number }
  /** The trip's own activity starts at this section. */
  arrive: string
  /** Who sees them off at the shutter: just Mommy, Daddy and Kaylee wait there (the boat trip), or the whole family
   *  who live here gather to wave goodbye (the mall day). */
  goodbye: 'parents' | 'family'
  /** What she brings Agong: a photo she picks (it goes on his wall), or a take-away box (and a photo of the day goes
   *  on the wall after). */
  gift: 'photo' | 'box'
  lines: TripLines
}

/** The section after the goodbye: the next leg that has its own place (the airport), else the trip's arrival. */
export function afterGoodbye(t: TripDef): string {
  const next = t.legs.find((l) => l.kind === 'airport')
  return next ? next.kind : t.arrive
}

/** The vehicle at the curb for the goodbye (and coming home). */
export function carOf(t: TripDef): 'van' | 'veloz' {
  return t.legs.some((l) => l.kind === 'car') ? 'veloz' : 'van'
}

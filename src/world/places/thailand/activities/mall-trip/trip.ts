// The mall day as a trip (trip/types.ts): Mommy, Daddy and Kaylee in Mommy's silver Veloz (she drives) to ICONSIAM, a
// day out with no packing. The whole family waves them off at the shutter, and the pizza box comes home for Agong.
// Its day pass (the cover between legs, like the boat trip's boarding pass). Pure data.
import type { TripDef } from '../../trip/types'
import type { MallSection } from './sections'
import { MALL_LINES } from './words'

export const MALL_TRIP: TripDef = {
  id: 'mall-trip',
  who: ['ji', 'nick'],
  legs: [{ kind: 'car', driver: 'ji', car: 'veloz' }],
  caps: { fly: 0 },
  arrive: 'arrive',
  goodbye: 'family',
  gift: 'box',
  lines: MALL_LINES,
}

/** The legs on the day pass, each punched when she finishes it. */
export const DAY_PASS: { id: MallSection; icon: string; label: string }[] = [
  { id: 'goodbye', icon: '🚗', label: 'Goodbye' },
  { id: 'arrive', icon: '🏬', label: 'ICONSIAM' },
  { id: 'hall', icon: '🛝', label: 'HarborLand' },
  { id: 'menu', icon: '🍕', label: 'Pizza' },
  { id: 'home', icon: '🏠', label: 'Home' },
]

/** The day pass's leg for a section (every mini game is HarborLand). */
export function legOf(s: MallSection): MallSection | null {
  if (s === 'invite') return null
  if (s === 'goodbye' || s === 'arrive' || s === 'home') return s
  if (s === 'menu' || s === 'share') return 'menu'
  return 'hall'
}

/** Where the trip picks up next time she says yes to the mall: the start of the leg she stopped in. */
export const RESUME: MallSection[] = ['goodbye', 'arrive', 'hall', 'menu', 'home']

// The trip loop's lines (lines.ts `L.mall.trip`), as the house legs and the ICONSIAM leg read them. Pure data (no
// three.js).
import { L } from '../../lines'
import type { TripLines } from '../../trip/types'

const T = L.mall.trip
export const W = { trip: T, arrive: T.arrive }

/** The mall day's lines for the house legs (trip/types.ts). */
export const MALL_LINES: TripLines = {
  ready: W.trip.ready,
  wish: W.trip.wish,
  bye: { gan: L.trip.goodbye.gan, ken: L.trip.goodbye.ken, bb: L.trip.goodbye.bb },
  home: W.trip.home,
  agong: W.trip.agong,
  thanks: W.trip.thanks,
  cousins: W.trip.pizza,
  hair: W.trip.hair,
  give: W.trip.give,
  wall: W.trip.wall,
}

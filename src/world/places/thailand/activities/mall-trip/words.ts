// The trip loop's words in the greybox (plan: thailand/mall-trip.md, build plan step 7): each tagged by who says it, as
// lines.ts will have them, but not recorded yet. The screen shows them in the guide's bubble without a sound
// (`unvoiced`), so no line plays without its clip. The voice pass (step 9) moves them into lines.ts (`L.mall`), casts
// the staff, and records them. Lines already in lines.ts (the cousins' "Bye...") play in their own voices.
// Pure data (no three.js).
import type { Line } from '../../../../../sdk'
import { L } from '../../lines'
import type { TripLines } from '../../trip/types'

const made = new Set<Line>()
const by = (voice: string) => (text: string): Line => {
  const l = voice === 'sparkle' ? text : { text, voice }
  made.add(l)
  return l
}
const ji = by('ji')
const nick = by('nick')
const agong = by('agong')
const staff = by('staff')
const sparkle = by('sparkle')

/** A greybox line with no clip yet: show it, don't play it. */
export const unvoiced = (l: Line) => made.has(l)

export const W = {
  // The goodbye and home, at Agong's house (TripHouse reads them from the TripDef).
  trip: {
    wish: agong('Bring Agong something yummy!'),
    ready: nick('Mommy is driving! Hop in, Kaylee!'),
    home: ji("We're home!"),
    agong: agong('Ho ho! What is that, Kaylee?'),
    thanks: agong('Pizza! Thank you, Kaylee!'),
    pizza: { gan: by('gan')('Pizza?!'), ken: by('ken')('Pizza?!'), bb: by('bb')('Pizza?!') },
    hair: agong('Ho ho ho! Look at Daddy\'s hair!'),
    give: sparkle('Tap Agong to give him the box!'),
    wall: ji('Our mall day!'),
  },
  // ICONSIAM: the glimpse, the lift and the HarborLand counter (arrive.ts).
  arrive: {
    here: ji('ICONSIAM! By the river!'),
    lift: sparkle('Press the big button!'),
    six: nick('Floor six! HarborLand!'),
    counter: staff('Welcome to HarborLand! Socks on, please!'),
    shoes: nick('My shoes are too big!'),
    socks: staff('Pick your socks!'),
    stretch: nick('My socks are too small!'),
    tall: staff('Wow, so tall!'),
    horn: staff('Ha ha! Off the top!'),
    gate: sparkle('In you go!'),
  },
}

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

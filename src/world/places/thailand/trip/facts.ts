// The boat trip's tap-to-hear facts (plan: "Tap-to-hear facts"), for the stamp screen and the passport: never
// required, each a short line in Sparkle's voice (lines.ts). Ten, so they fit on the stamp screen (the fiddler crab is the
// stamp's own sticker line, and the mudskipper's is in the album). Pure data (meta.ts loads it at startup).
import { L } from '../lines'

export const TRIP_FACTS = [
  { icon: '🐘', label: 'Elephant shape', say: L.trip.elephant },
  { icon: '🎀', label: 'Lucky ribbons', say: L.bay.facts.ribbons },
  { icon: '🚤', label: 'Longtail boat', say: L.bay.facts.longtail },
  { icon: '🏘️', label: 'Stilt village', say: L.bay.facts.village },
  { icon: '⚽', label: 'Floating field', say: L.bay.facts.football },
  { icon: '🛶', label: 'Hong', say: L.bay.facts.hong },
  { icon: '🍌', label: 'Hungry elephants', say: L.chang.facts.eat },
  { icon: '🌼', label: 'Nicknames', say: L.chang.facts.nickname },
  { icon: '🏝️', label: 'Ko Tapu', say: L.bay.facts.nail },
  { icon: '🚐', label: 'Drive on the left', say: L.facts.left },
]

// The mall day's tap-to-hear facts (plan: thailand/mall-trip.md, "Facts"), for its stamp screen and the passport.
export const MALL_FACTS = [
  { icon: '🏬', label: 'ICONSIAM', say: L.mall.trip.facts.iconsiam },
  { icon: '🧦', label: 'Grip socks', say: L.mall.trip.facts.socks },
  { icon: '👺', label: 'Phi Ta Khon', say: L.mall.trip.facts.phiTaKhon },
  { icon: '🐒', label: 'Lopburi', say: L.mall.trip.facts.lopburi },
  { icon: '⛰️', label: 'Golden Mount', say: L.mall.trip.facts.goldenMount },
  { icon: '🍕', label: 'Sharing fairly', say: L.mall.trip.facts.sharing },
  { icon: '🥊', label: 'Wai kru', say: L.mall.trip.facts.waiKru },
  { icon: '🧡', label: 'Cha yen', say: L.mall.trip.facts.chaYen },
  { icon: '🐘', label: 'Elephants', say: L.mall.trip.facts.elephant },
]

// The Nan road trip's tap-to-hear facts (plan: thailand/nan-trip.html, "Facts"), for its stamp screen and the passport.
export const NAN_FACTS = [
  { icon: '🏔️', label: 'Nan', say: L.nan.trip.facts.nan },
  { icon: '🚙', label: 'Made in Thailand', say: L.nan.trip.facts.pajero },
  { icon: '🚗', label: 'Drive on the left', say: L.facts.left },
  { icon: '🍄', label: 'Mushrooms', say: L.nan.trip.facts.mushrooms },
  { icon: '🌾', label: 'Rice in water', say: L.nan.trip.facts.rice },
  { icon: '⛰️', label: 'Rice steps', say: L.nan.rice.steps },
  { icon: '🧂', label: 'Salt well', say: L.nan.trip.facts.salt },
  { icon: '🌊', label: 'An old sea', say: L.nan.trip.facts.sea },
]

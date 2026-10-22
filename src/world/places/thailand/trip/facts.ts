// The boat trip's tap-to-hear facts (plan: "Tap-to-hear facts"), for the stamp screen and the passport: never
// required, each a short line in Sparkle's voice (lines.ts). Ten, so they fit on the stamp screen. Pure data (meta.ts loads it at startup).
import { L } from '../lines'

export const TRIP_FACTS = [
  { icon: '🐘', label: 'Elephant shape', say: L.trip.elephant },
  { icon: '🎀', label: 'Lucky ribbons', say: L.bay.facts.ribbons },
  { icon: '🚤', label: 'Longtail boat', say: L.bay.facts.longtail },
  { icon: '🏘️', label: 'Stilt village', say: L.bay.facts.village },
  { icon: '⚽', label: 'Floating field', say: L.bay.facts.football },
  { icon: '🛶', label: 'Hong', say: L.bay.facts.hong },
  { icon: '🐟', label: 'Mudskipper', say: L.bay.stickers.mudskipper },
  { icon: '🦀', label: 'Fiddler crab', say: L.bay.stickers.crab },
  { icon: '🏝️', label: 'Ko Tapu', say: L.bay.facts.nail },
  { icon: '🚐', label: 'Drive on the left', say: L.facts.left },
]

// The mall day's tap-to-hear facts (plan: thailand/mall-trip.md, "Facts"), for its stamp screen and later the passport.
// Not recorded yet: the voice pass moves them into lines.ts (and the stamp screen shows them once they are), so they're
// plain text here, in Sparkle's voice. (Not in meta.ts yet.)
export const MALL_FACTS = [
  { icon: '🏬', label: 'ICONSIAM', say: 'ICONSIAM is by the Chao Phraya river!' },
  { icon: '🧦', label: 'Grip socks', say: 'At HarborLand, everyone wears grip socks!' },
  { icon: '👺', label: 'Phi Ta Khon', say: 'Phi Ta Khon is a festival with big funny masks!' },
  { icon: '🐒', label: 'Lopburi', say: 'Lopburi is a town full of monkeys!' },
  { icon: '⛰️', label: 'Golden Mount', say: 'The Golden Mount is a temple on a hill in Bangkok!' },
  { icon: '🍕', label: 'Sharing fairly', say: 'Sharing fairly means everyone gets the same!' },
  { icon: '🥊', label: 'Wai kru', say: 'Muay Thai boxers dance the wai kru to thank their teacher!' },
  { icon: '🧡', label: 'Cha yen', say: "Cha yen is Thai iced tea. It's orange!" },
  { icon: '🐘', label: 'Elephants', say: "The elephant is Thailand's animal!" },
]

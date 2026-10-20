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

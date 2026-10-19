import type { PlaceMeta } from '../../types'
import { art } from './art'
import { L } from './lines'

// Thailand is Kaylee's family's country, built in 3D (plan: planning/around-the-world/thailand.md). Its home base is
// Agong's shophouse, where she walks around; the places the family loves become activities, one per PR. The boat trip
// is greybox 1 (only the boat toy in the bay, thailand/boat-trip.md): its sticker borrows the balloon and its line has
// no voice until the full loop.
const meta: PlaceMeta = {
  id: 'thailand',
  name: 'Thailand',
  emoji: '🐘',
  flag: 'thailand',
  mapPos: { x: 74, y: 49 },
  friend: { name: 'Agong', img: art.balloon },
  trophyTitle: 'Thailand Explorer',
  activities: [
    { id: 'boat-trip', name: "Captain Kaylee's Boat Trip", icon: '🚤', pos: { x: 50, y: 70 }, sticker: { name: 'Fiddler crab', img: art.balloon, fact: 'Fiddler crab sticker! It waves its one big claw!' } },
  ],
  facts: [
    { icon: '👋', label: 'Sawasdee!', say: L.facts.hello },
    { icon: '🐘', label: 'Elephants', say: L.facts.elephant },
    { icon: '💬', label: 'Chang', say: L.facts.chang },
    { icon: '🚩', label: 'Flag', say: L.facts.flag },
  ],
  coloringPages: [],
  passportLine: L.passport,
  createdAt: '2026-10-17',
}
export default meta

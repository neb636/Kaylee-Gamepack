import type { PlaceMeta } from '../../types'
import { art } from './art'
import { L } from './lines'
import { TRIP_FACTS } from './trip/facts'

// Thailand is Kaylee's family's country, built in 3D (plan: planning/around-the-world/thailand.md). Its home base is
// Agong's shophouse, where she walks around; the places the family loves become activities, one per PR. The first is
// the boat trip (thailand/boat-trip.md), the whole loop from Mommy's question to her photo on Agong's wall: it earns
// the fiddler crab sticker, and its tap-to-hear facts are on the stamp screen and the passport.
const meta: PlaceMeta = {
  id: 'thailand',
  name: 'Thailand',
  emoji: '🐘',
  flag: 'thailand',
  mapPos: { x: 74, y: 49 },
  friend: { name: 'Agong', img: art.balloon },
  trophyTitle: 'Thailand Explorer',
  activities: [
    { id: 'boat-trip', name: "Captain Kaylee's Boat Trip", icon: '🚤', pos: { x: 50, y: 70 }, sticker: { name: 'Fiddler crab', img: art.crab, fact: L.home.sticker } },
  ],
  facts: [
    { icon: '👋', label: 'Sawasdee!', say: L.facts.hello },
    { icon: '🐘', label: 'Elephants', say: L.facts.elephant },
    { icon: '💬', label: 'Chang', say: L.facts.chang },
    { icon: '🚩', label: 'Flag', say: L.facts.flag },
    ...TRIP_FACTS,
  ],
  coloringPages: [],
  passportLine: L.passport,
  createdAt: '2026-10-17',
}
export default meta

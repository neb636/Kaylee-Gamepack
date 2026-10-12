import type { PlaceMeta } from '../../types'
import { art } from './art'
import { L } from './lines'

// Thailand is built one activity per PR (plan: planning/around-the-world/thailand.md). It's a special one: Kaylee's
// family lives there, and later each family member becomes an animal friend. Baan Chang Cafe (Krabi) is first, as a
// greybox (gate 1): placeholder shapes, Sparkle's voice only.
const meta: PlaceMeta = {
  id: 'thailand',
  name: 'Thailand',
  emoji: '🐘',
  flag: 'thailand',
  mapPos: { x: 74, y: 49 },
  friend: { name: 'Sparkle', img: art.balloon },
  trophyTitle: 'Thailand Explorer',
  activities: [
    { id: 'baan-chang', name: 'Baan Chang Cafe', icon: '🐘', pos: { x: 30.9, y: 79.9 }, sticker: { name: 'Asian elephant', img: art.balloon, fact: L.sticker } },
  ],
  facts: [
    { icon: '👋', label: 'Sawasdee!', say: L.facts.hello },
    { icon: '🐘', label: 'Elephants', say: L.facts.elephant },
    { icon: '💬', label: 'Chang', say: L.facts.chang },
    { icon: '🚩', label: 'Flag', say: L.facts.flag },
  ],
  coloringPages: [],
  passportLine: L.passport,
  createdAt: '2026-10-11',
}
export default meta

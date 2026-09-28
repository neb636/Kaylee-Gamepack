import type { PlaceMeta } from '../../types'
import { art } from './art'
import { L } from './lines'

// China is being built in stages: the Shanghai Dumpling House is the first activity. The other six lanterns on the
// scroll map (see LANTERNS in Place.tsx) are "coming soon" until their activities exist, so they aren't listed here.
const meta: PlaceMeta = {
  id: 'china',
  name: 'China',
  emoji: '🐼',
  flag: 'china',
  mapPos: { x: 77, y: 36 },
  friend: { name: 'Dou Dou the puppy', img: art.doudou },
  trophyTitle: 'China Explorer',
  activities: [{ id: 'dumplings', name: 'Dumpling House', icon: '🥟', pos: { x: 84.4, y: 47.6 }, sticker: { name: 'Pekingese puppy', img: art.doudou, fact: L.stickers.dumplings } }],
  facts: [
    { icon: '💬', label: 'Nǐ hǎo!', say: L.facts.hello },
    { icon: '🏙️', label: 'Shanghai', say: L.facts.shanghai },
    { icon: '🥟', label: 'Dumplings', say: L.facts.dumplings },
    { icon: '🍵', label: 'Dim sum', say: L.facts.dimsum },
    { icon: '🏮', label: 'New Year', say: L.facts.newYear },
    { icon: '🐼', label: 'Pandas', say: L.facts.pandas },
    { icon: '🧱', label: 'Great Wall', say: L.facts.wall },
    { icon: '🗺️', label: 'Big country', say: L.facts.big },
  ],
  coloringPages: [],
  passportLine: L.passport,
  createdAt: '2026-09-27',
}
export default meta

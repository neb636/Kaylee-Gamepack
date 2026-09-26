import type { PlaceMeta } from '../../types'
import { art } from './art'
import { L } from './lines'

const meta: PlaceMeta = {
  id: 'australia',
  name: 'Australia',
  emoji: '🦘',
  flag: 'australia',
  mapPos: { x: 87, y: 67 },
  friend: { name: 'Pip the joey', img: art.pip },
  trophyTitle: 'Australia Explorer',
  // Spots sit where the real places are on the map picture.
  activities: [
    { id: 'outback', name: 'Red Outback', icon: '🏜️', pos: { x: 37, y: 38 }, sticker: { name: 'kangaroo', img: art.mama, fact: L.stickers.kangaroo } },
    { id: 'forest', name: 'Gum Tree Forest', icon: '🌿', pos: { x: 76, y: 50 }, sticker: { name: 'koala', img: art.koalaAwake, fact: L.stickers.koala } },
    { id: 'reef', name: 'Great Barrier Reef', icon: '🐠', pos: { x: 84, y: 24 }, sticker: { name: 'sea turtle', img: art.turtle, fact: L.stickers.turtle } },
    { id: 'stars', name: 'Starry Night', icon: '✨', pos: { x: 20, y: 50 }, sticker: { name: 'kookaburra', img: art.kookaburra, fact: L.stickers.kookaburra } },
    { id: 'postcard', name: 'Beach Postcard', icon: '🏖️', pos: { x: 72, y: 76 }, sticker: { name: 'platypus', img: art.platypus, fact: L.stickers.platypus } },
  ],
  facts: [
    { icon: '☀️', label: 'Weather', say: L.facts.weather },
    { icon: '💬', label: "G'day!", say: L.facts.hello },
    { icon: '🎄', label: 'Christmas', say: L.facts.christmas },
    { icon: '🐨', label: 'Animals', say: L.facts.animals },
    { icon: '🎭', label: 'Opera House', say: L.facts.opera },
    { icon: '🌏', label: 'Continent', say: L.facts.continent },
  ],
  coloringPages: [
    { id: 'australia-pip', img: art.colorPip },
    { id: 'australia-koala', img: art.colorKoala },
    { id: 'australia-opera', img: art.colorOpera },
  ],
  passportLine: L.passport,
  createdAt: '2026-09-25',
}
export default meta

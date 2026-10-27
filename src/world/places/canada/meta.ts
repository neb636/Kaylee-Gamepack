import globe from '../../assets/globe.webp'
import type { PlaceMeta } from '../../types'
import { L } from './lines'

// Canada, ocean to ocean (plan: planning/around-the-world/canada.html). The hub is a 3D toy-table map of the country:
// Kaylee pushes the red Maple Leaf Train along the track from Quebec to the Pacific, and each of the four stops has one
// 3D and one 2D activity. Built one greybox at a time: every activity is still in the works, so none is in the game yet.
// No art yet: the stickers and the friend show the world's globe until the art gate.
const meta: PlaceMeta = {
  id: 'canada',
  name: 'Canada',
  emoji: '🍁',
  flag: 'canada',
  // East of the bear on the world map, toward Quebec.
  mapPos: { x: 27, y: 25 },
  friend: { name: 'Maple the beaver', img: globe },
  trophyTitle: 'Canada Champion',
  // Hidden from the world map until every activity is finished (Dad, 2026-10-27).
  inTheWorksPlace: true,
  activities: [],
  // In play order along the track, east to west (`pos` is unused: the hub is the 3D map, map/track.ts places the stops).
  inTheWorks: [
    { id: 'taffy', name: 'Sugar Snow', icon: '🍁', pos: { x: 85, y: 60 }, sticker: { name: 'Red squirrel', img: globe, fact: L.stickers.squirrel } },
    { id: 'snowman', name: 'Carnival Snowballs', icon: '⛄', pos: { x: 85, y: 65 }, sticker: { name: 'Snowy owl', img: globe, fact: L.stickers.owl } },
    { id: 'bike', name: 'Mountain Bike', icon: '🚵', pos: { x: 90, y: 58 }, sticker: { name: 'Moose', img: globe, fact: L.stickers.moose } },
    { id: 'campfire', name: 'Campfire Night', icon: '⛺', pos: { x: 90, y: 62 }, sticker: { name: 'Raccoon', img: globe, fact: L.stickers.raccoon } },
    { id: 'canoe', name: 'Red Canoe', icon: '🛶', pos: { x: 25, y: 60 }, sticker: { name: 'Loon', img: globe, fact: L.stickers.loon } },
    { id: 'bridge', name: 'Animal Bridge', icon: '🦌', pos: { x: 25, y: 65 }, sticker: { name: 'Grizzly cub', img: globe, fact: L.stickers.grizzly } },
    { id: 'whales', name: 'Whale Watch', icon: '🐋', pos: { x: 10, y: 62 }, sticker: { name: 'Sea otter', img: globe, fact: L.stickers.otter } },
    { id: 'salmon', name: 'Salmon Leap', icon: '🐟', pos: { x: 12, y: 55 }, sticker: { name: 'Spirit bear', img: globe, fact: L.stickers.spirit } },
  ],
  facts: [
    { icon: '🍁', label: 'The flag', say: L.facts.flag },
    { icon: '👋', label: 'Bonjour!', say: L.facts.bonjour },
    { icon: '🗺️', label: 'Huge', say: L.facts.huge },
    { icon: '❄️', label: 'Snowy winters', say: L.facts.winter },
    { icon: '🦫', label: 'Beaver', say: L.facts.beaver },
    { icon: '🍯', label: 'Maple syrup', say: L.facts.syrup },
  ],
  coloringPages: [],
  passportLine: L.passport,
  createdAt: '2026-10-27',
}
export default meta

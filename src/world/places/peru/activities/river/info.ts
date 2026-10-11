// Rosa's Rainy River: what the shared code needs to know about this activity (found automatically by Place.tsx and meta.ts).
import type { ActivityManifest } from '../../../../types'
import { art } from './art'
import { L } from './lines'

const info: ActivityManifest = {
  id: 'river',
  order: 5,
  name: "Rosa's Rainy River",
  icon: '🌧️',
  pos: { x: 61, y: 28 },
  sticker: { name: 'Pink dolphin', img: art.rosa, fact: L.river.sticker },
  // The friend's face on the country map pin, and what they say when their journal window is tapped.
  pin: art.rosa,
  window: L.riverWindow,
}
export default info

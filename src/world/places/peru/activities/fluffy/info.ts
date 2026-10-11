// Luna's Fluffy Day: what the shared code needs to know about this activity (found automatically by Place.tsx and meta.ts).
import type { ActivityManifest } from '../../../../types'
import { art } from './art'
import { L } from './lines'

const info: ActivityManifest = {
  id: 'alpaca',
  order: 1,
  name: "Luna's Fluffy Day",
  icon: '✂️',
  pos: { x: 70, y: 74 },
  sticker: { name: 'Alpaca', img: art.luna, fact: L.sticker },
  // The friend's face on the country map pin, and what they say when their journal window is tapped.
  pin: art.luna,
  window: L.alpacaWindow,
}
export default info

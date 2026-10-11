// Tika's Mountain Terraces: what the shared code needs to know about this activity (found automatically by Place.tsx and meta.ts).
import type { ActivityManifest } from '../../../../types'
import { art } from './art'
import { L } from './lines'

const info: ActivityManifest = {
  id: 'machu-picchu',
  order: 2,
  name: "Tika's Mountain Terraces",
  icon: '⛰️',
  pos: { x: 51.5, y: 60 },
  sticker: { name: 'Llama', img: art.tika, fact: L.terracesSticker },
  // The friend's face on the country map pin, and what they say when their journal window is tapped.
  pin: art.tika,
  window: L.terracesWindow,
}
export default info

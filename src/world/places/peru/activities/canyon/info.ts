// Coco's Canyon Glide: what the shared code needs to know about this activity (found automatically by Place.tsx and meta.ts).
import type { ActivityManifest } from '../../../../types'
import { art } from './art'
import { L } from './lines'

const info: ActivityManifest = {
  id: 'condor',
  order: 4,
  name: "Coco's Canyon Glide",
  icon: '🦅',
  pos: { x: 57.5, y: 88 },
  sticker: { name: 'Condor', img: art.canyonPerched, fact: L.condorSticker },
  // The friend's face on the country map pin, and what they say when their journal window is tapped.
  pin: art.coco,
  window: L.condorWindow,
}
export default info

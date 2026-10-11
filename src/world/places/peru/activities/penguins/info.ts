// Pepa's Penguin Cliff: what the shared code needs to know about this activity (found automatically by Place.tsx and meta.ts).
import type { ActivityManifest } from '../../../../types'
import { art } from './art'
import { L } from './lines'

const info: ActivityManifest = {
  id: 'penguins',
  order: 3,
  name: "Pepa's Penguin Cliff",
  icon: '🐧',
  pos: { x: 38.75, y: 75 },
  sticker: { name: 'Humboldt penguin', img: art.pepa, fact: L.penguinSticker },
  // The friend's face on the country map pin, and what they say when their journal window is tapped.
  pin: art.pepa,
  window: L.penguinWindow,
}
export default info

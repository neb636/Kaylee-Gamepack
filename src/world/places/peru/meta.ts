import type { PlaceMeta } from '../../types'
import { art } from './art'
import { L } from './lines'
const meta: PlaceMeta = {
  id: 'peru',
  name: 'Peru',
  emoji: '🦙',
  flag: 'peru',
  mapPos: { x: 23, y: 61 },
  friend: { name: 'Luna the alpaca', img: art.luna },
  trophyTitle: 'Peru Explorer',
  activities: [
    { id: 'cozy-andes', name: 'Cozy Andes', icon: '🧣', pos: { x: 67.3, y: 70.9 }, sticker: { name: 'alpaca', img: art.luna, fact: L.sticker } },
  ],
  facts: [
    { icon: '🌎', label: 'South America', say: L.facts.location },
    { icon: '👋', label: 'Hola!', say: L.facts.hello },
    { icon: '💬', label: 'Languages', say: L.facts.languages },
    { icon: '⛰️', label: 'Weather', say: L.facts.weather },
    { icon: '🦙', label: 'Alpacas', say: L.facts.alpaca },
    { icon: '🚩', label: 'Flag', say: L.facts.flag },
  ],
  coloringPages: [],
  passportLine: L.passport,
  createdAt: '2026-10-05',
}
export default meta

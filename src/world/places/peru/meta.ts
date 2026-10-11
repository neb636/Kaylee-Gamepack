import { toActivities, type ActivityManifest, type PlaceMeta } from '../../types'
import { art } from './art'
import { L } from './lines'

// Each activity describes itself in activities/<id>/info.ts, so adding one never edits this file.
const manifests = import.meta.glob<{ default: ActivityManifest }>('./activities/*/info.ts', { eager: true })

// Peru is built one activity at a time (plan: planning/around-the-world/peru.md). Luna's Fluffy Day, Pepa's Penguin
// Cliff, Tika's Mountain Terraces, Coco's Canyon Glide and Rosa's Rainy River are all built; the balloon finale comes next.
const meta: PlaceMeta = {
  id: 'peru',
  name: 'Peru',
  emoji: '🦙',
  flag: 'peru',
  mapPos: { x: 25.5, y: 61 },
  friend: { name: 'Luna the alpaca', img: art.luna },
  trophyTitle: 'Peru Explorer',
  activities: toActivities(Object.values(manifests).map((m) => m.default)),
  facts: [
    { icon: '🌎', label: 'South America', say: L.facts.location },
    { icon: '🏜️', label: 'Three worlds', say: L.facts.worlds },
    { icon: '👋', label: 'Hola!', say: L.facts.hello },
    { icon: '💬', label: 'Languages', say: L.facts.languages },
    { icon: '🐧', label: 'Penguins', say: L.facts.penguins },
    { icon: '🦙', label: 'Alpacas', say: L.facts.alpacas },
    { icon: '⛰️', label: 'Machu Picchu', say: L.facts.machuPicchu },
    { icon: '🥔', label: 'Potatoes', say: L.facts.potatoes },
    { icon: '🚩', label: 'Flag', say: L.facts.flag },
    { icon: '🐦', label: 'National bird', say: L.facts.bird },
  ],
  coloringPages: [],
  passportLine: L.passport,
  createdAt: '2026-10-10',
}
export default meta

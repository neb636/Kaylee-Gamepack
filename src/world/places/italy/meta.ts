import type { PlaceMeta } from '../../types'
import { art } from './art'
import { L } from './lines'

// Italy is being built in stages (plan: planning/around-the-world/italy.md). The Pizzeria in Naples came first; the
// unfinished arches on the boot map (see SPOTS in Place.tsx) say "coming soon" until their activities exist.
const meta: PlaceMeta = {
  id: 'italy',
  name: 'Italy',
  emoji: '🍕',
  flag: 'italy',
  mapPos: { x: 48.5, y: 31 },
  friend: { name: 'Lupa the wolf cub', img: art.lupa },
  trophyTitle: 'Italy Explorer',
  activities: [
    { id: 'trevi', name: 'Trevi Fountain', icon: '⛲', pos: { x: 58.5, y: 45 }, sticker: { name: 'Italian wolf', img: art.lupa, fact: L.stickers.trevi } },
    { id: 'pizzeria', name: 'Pizzeria in Naples', icon: '🍕', pos: { x: 65.4, y: 61.5 }, sticker: { name: 'Marsican brown bear', img: art.bruno, fact: L.stickers.pizzeria } },
  ],
  facts: [
    { icon: '👋', label: 'Ciao!', say: L.facts.hello },
    { icon: '💖', label: 'Grazie!', say: L.facts.thanks },
    { icon: '🔢', label: 'Uno, due, tre', say: L.facts.count },
    { icon: '👢', label: 'The boot', say: L.facts.boot },
    { icon: '☀️', label: 'Weather', say: L.facts.weather },
    { icon: '🍕', label: 'Pizza', say: L.facts.pizza },
    { icon: '🌿', label: 'Margherita', say: L.facts.margherita },
    { icon: '⛲', label: 'Trevi Fountain', say: L.facts.trevi },
    { icon: '🏛️', label: 'Romans', say: L.facts.romans },
    { icon: '🌋', label: 'Volcanoes', say: L.facts.volcano },
    { icon: '🚩', label: 'Flag', say: L.facts.flag },
  ],
  coloringPages: [],
  passportLine: L.passport,
  createdAt: '2026-09-28',
}
export default meta

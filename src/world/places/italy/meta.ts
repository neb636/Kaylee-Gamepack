import type { PlaceMeta } from '../../types'
import { art } from './art'
import { L } from './lines'

// Italy is being built in stages (plan: planning/around-the-world/italy.md). The Pizzeria, the Olive Grove and the Trevi
// Fountain are built; the other four arches on the boot map (see SPOTS in Place.tsx) say "coming soon" until their activities exist.
const meta: PlaceMeta = {
  id: 'italy',
  name: 'Italy',
  emoji: '🍕',
  flag: 'italy',
  mapPos: { x: 48.5, y: 31 },
  friend: { name: 'Lupa the wolf cub', img: art.lupa },
  trophyTitle: 'Italy Explorer',
  activities: [
    { id: 'pizzeria', name: 'Pizzeria in Naples', icon: '🍕', pos: { x: 65.4, y: 61.5 }, sticker: { name: 'Marsican brown bear', img: art.bruno, fact: L.stickers.pizzeria } },
    { id: 'olives', name: 'Olive Grove', icon: '🫒', pos: { x: 83, y: 57 }, sticker: { name: 'Crested porcupine', img: art.spina, fact: L.stickers.olives } },
    { id: 'trevi', name: 'Trevi Fountain', icon: '⛲', pos: { x: 58.5, y: 45 }, sticker: { name: 'Italian wolf', img: art.lupa, fact: L.stickers.trevi } },
  ],
  facts: [
    { icon: '👋', label: 'Ciao!', say: L.facts.hello },
    { icon: '💖', label: 'Grazie!', say: L.facts.thanks },
    { icon: '🔢', label: 'Uno, due, tre', say: L.facts.count },
    { icon: '👢', label: 'The boot', say: L.facts.boot },
    { icon: '☀️', label: 'Weather', say: L.facts.weather },
    { icon: '🍕', label: 'Pizza', say: L.facts.pizza },
    { icon: '🌿', label: 'Margherita', say: L.facts.margherita },
    { icon: '🫒', label: 'Olives', say: L.facts.olives },
    { icon: '🏛️', label: 'Romans', say: L.facts.romans },
    { icon: '🐺', label: "Rome's wolf", say: L.facts.wolf },
    { icon: '🌋', label: 'Volcanoes', say: L.facts.volcano },
    { icon: '🚩', label: 'Flag', say: L.facts.flag },
  ],
  coloringPages: [],
  // Real-world videos for the Theater. `after` offers one when that activity is done.
  videos: [
    { id: 'olive-oil', youtubeId: 'JO7Jc3D2ijc', icon: '🫒', title: 'How Olive Oil Is Made', say: L.videos.olives, after: 'olives' },
    { id: 'trevi', youtubeId: 'D0kM_OXvtog', icon: '⛲', title: 'Toss a Coin in the Trevi Fountain', say: L.videos.trevi, after: 'trevi' },
    { id: 'aqueduct', youtubeId: 'u8aGuJowIwo', icon: '🏛️', title: 'Roman Aqueducts in Italy', say: L.videos.aqueduct },
  ],
  passportLine: L.passport,
  createdAt: '2026-09-28',
}
export default meta

import type { PlaceMeta } from '../../types'
import { art } from './art'
import { L } from './lines'

// Italy (plan: planning/around-the-world/italy.md): seven activities on the boot map (see SPOTS in Place.tsx), then opera
// night in Verona as the finale.
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
    { id: 'colosseum', name: 'The Colosseum', icon: '🏛️', pos: { x: 48, y: 41 }, sticker: { name: 'Roman cat', img: art.cesare, fact: L.stickers.colosseum } },
    { id: 'pisa', name: 'Leaning Tower', icon: '🗼', pos: { x: 39.5, y: 27 }, sticker: { name: 'Little owl', img: art.civetta, fact: L.stickers.pisa } },
    { id: 'trevi', name: 'Trevi Fountain', icon: '⛲', pos: { x: 58.5, y: 45 }, sticker: { name: 'Italian wolf', img: art.lupa, fact: L.stickers.trevi } },
    { id: 'venice', name: 'Venice', icon: '🛶', pos: { x: 59, y: 19 }, sticker: { name: 'Venetian pigeon', img: art.gino, fact: L.stickers.venice } },
    { id: 'etna', name: 'Snow on a Volcano', icon: '🌋', pos: { x: 51.5, y: 84 }, sticker: { name: 'Sicilian donkey', img: art.nino, fact: L.stickers.etna } },
  ],
  facts: [
    { icon: '👋', label: 'Ciao!', say: L.facts.hello },
    { icon: '☀️', label: 'Buongiorno!', say: L.facts.morning },
    { icon: '💖', label: 'Grazie!', say: L.facts.thanks },
    { icon: '🔢', label: 'Uno, due, tre', say: L.facts.count },
    { icon: '👢', label: 'The boot', say: L.facts.boot },
    { icon: '🌦️', label: 'Weather', say: L.facts.weather },
    { icon: '🍕', label: 'Pizza', say: L.facts.pizza },
    { icon: '🌿', label: 'Margherita', say: L.facts.margherita },
    { icon: '🫒', label: 'Olives', say: L.facts.olives },
    { icon: '🏛️', label: 'Romans', say: L.facts.romans },
    { icon: 'Ⅴ', label: 'Numbers', say: L.facts.numbers },
    { icon: '🗼', label: 'Pisa', say: L.facts.pisa },
    { icon: '🐺', label: "Rome's wolf", say: L.facts.wolf },
    { icon: '🛶', label: 'Venice', say: L.facts.venice },
    { icon: '🌋', label: 'Volcanoes', say: L.facts.volcano },
    { icon: '🏔️', label: 'Etna', say: L.facts.etna },
    { icon: '🎹', label: 'Music', say: L.facts.music },
    { icon: '🍨', label: 'Gelato', say: L.facts.gelato },
    { icon: '⛪', label: 'Pantheon', say: L.facts.pantheon },
    { icon: '🚩', label: 'Flag', say: L.facts.flag },
  ],
  coloringPages: [
    { id: 'italy-lupa', img: art.colorLupa },
    { id: 'italy-bruno', img: art.colorBruno },
    { id: 'italy-colosseum', img: art.colorColosseum },
    { id: 'italy-pisa', img: art.colorPisa },
    { id: 'italy-gondola', img: art.colorGondola },
    { id: 'italy-mask', img: art.colorMask },
    { id: 'italy-trevi', img: art.colorTrevi },
  ],
  puzzles: [
    { id: 'italy-colosseum', name: 'The Colosseum at Sunset', img: art.puzzleColosseum },
    { id: 'italy-venice', name: "Gino's Gondola", img: art.puzzleVenice },
    { id: 'italy-cinque-terre', name: 'Picnic by the Sea', img: art.puzzleCinqueTerre },
  ],
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

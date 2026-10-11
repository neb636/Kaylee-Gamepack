import type { PlaceMeta } from '../../types'
import { art } from './art'
import { L } from './lines'

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
  activities: [
    { id: 'alpaca', name: "Luna's Fluffy Day", icon: '✂️', pos: { x: 70, y: 74 }, sticker: { name: 'Alpaca', img: art.luna, fact: L.sticker } },
    { id: 'machu-picchu', name: "Tika's Mountain Terraces", icon: '⛰️', pos: { x: 51.5, y: 60 }, sticker: { name: 'Llama', img: art.tika, fact: L.terracesSticker } },
    { id: 'penguins', name: "Pepa's Penguin Cliff", icon: '🐧', pos: { x: 38.75, y: 75 }, sticker: { name: 'Humboldt penguin', img: art.pepa, fact: L.penguinSticker } },
    { id: 'condor', name: "Coco's Canyon Glide", icon: '🦅', pos: { x: 57.5, y: 88 }, sticker: { name: 'Condor', img: art.canyonPerched, fact: L.condorSticker } },
    { id: 'river', name: "Rosa's Rainy River", icon: '🌧️', pos: { x: 61, y: 28 }, sticker: { name: 'Pink dolphin', img: art.rosa, fact: L.river.sticker } },
  ],
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
  // Offered after the matching activity's stamp, and available anytime in the Theater.
  videos: [
    { id: 'condor', youtubeId: 'ErDB-fIKoa0', icon: '🦅', title: 'Real condors', say: L.videos.condor, after: 'condor' },
    { id: 'machu-picchu', youtubeId: '4OXaQuMpdN8', icon: '⛰️', title: 'Machu Picchu', say: L.videos.machuPicchu, after: 'machu-picchu' },
    { id: 'penguins', youtubeId: 'O8qilxaBR20', icon: '🐧', title: 'Real penguins', say: L.videos.penguins, after: 'penguins' },
    { id: 'alpacas', youtubeId: 'BVl_Y9heRyk', icon: '🦙', title: 'Real alpacas', say: L.videos.alpacas, after: 'alpaca' },
    { id: 'dolphin', youtubeId: 'izl38tb7z5E', icon: '🐬', title: 'River dolphins', say: L.videos.dolphin, after: 'river' },
  ],
  passportLine: L.passport,
  createdAt: '2026-10-10',
}
export default meta

import type { PlaceMeta } from '../../types'
import { art } from './art'
import { L } from './lines'

// Peru is built one activity at a time (plan: planning/around-the-world/peru.md). Luna's Fluffy Day and Rosa's Rainy
// River are built; the other places on Luna's map say "coming soon", and the balloon finale comes once all five exist.
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
  passportLine: L.passport,
  createdAt: '2026-10-10',
}
export default meta

import type { PlaceMeta } from '../../types'
import { art } from './art'
import { L } from './lines'

const meta: PlaceMeta = {
  id: 'egypt',
  name: 'Egypt',
  emoji: '🐪',
  flag: 'egypt',
  mapPos: { x: 53, y: 42 },
  friend: { name: 'Miu the kitten', img: art.miu },
  trophyTitle: 'Egypt Explorer',
  // Spots sit by the landmarks on the map picture: the pyramids and Sphinx at Giza, Cairo, the Nile, a temple.
  activities: [
    { id: 'pyramid', name: 'Pyramid Builders', icon: '🔺', pos: { x: 18, y: 26 }, sticker: { name: 'camel', img: art.jamal, fact: L.stickers.camel } },
    { id: 'passage', name: 'Secret Passage', icon: '🔦', pos: { x: 46, y: 24 }, sticker: { name: 'scarab', img: art.scarab, fact: L.stickers.scarab } },
    { id: 'sphinx', name: 'Wake the Sphinx', icon: '🦁', pos: { x: 36, y: 42 }, sticker: { name: 'fennec fox', img: art.fennec, fact: L.stickers.fennec } },
    { id: 'nile', name: 'Sail the Nile', icon: '⛵', pos: { x: 50, y: 56 }, sticker: { name: 'hippo', img: art.hippo, fact: L.stickers.hippo } },
    { id: 'scribe', name: 'Write Like a Pharaoh', icon: '📜', pos: { x: 67, y: 66 }, sticker: { name: 'ibis', img: art.ibis, fact: L.stickers.ibis } },
    { id: 'market', name: "Miu's Market", icon: '🏮', pos: { x: 64, y: 22 }, sticker: { name: 'kitty', img: art.miu, fact: L.stickers.cat } },
  ],
  facts: [
    { icon: '☀️', label: 'Weather', say: L.facts.weather },
    { icon: '👋', label: 'Ahlan!', say: L.facts.hello },
    { icon: '💖', label: 'Shukran!', say: L.facts.thanks },
    { icon: '🔺', label: 'Pyramids', say: L.facts.pyramids },
    { icon: '🌊', label: 'The Nile', say: L.facts.nile },
    { icon: '📜', label: 'Hieroglyphs', say: L.facts.writing },
    { icon: '🐈', label: 'Cats', say: L.facts.cats },
    { icon: '🍲', label: 'Koshari', say: L.facts.food },
    { icon: '🚩', label: 'Flag', say: L.facts.flag },
  ],
  coloringPages: [
    { id: 'egypt-miu', img: art.colorMiu },
    { id: 'egypt-sphinx', img: art.colorSphinx },
    { id: 'egypt-felucca', img: art.colorFelucca },
    { id: 'egypt-tutu', img: art.colorTutu },
  ],
  // Real-world videos for the Theater (button in the country's top bar). `after` offers one when that activity is done.
  videos: [
    { id: 'pyramids', youtubeId: 'dGCAYIPo1Nw', icon: '🔺', title: 'The real pyramids', say: L.videos.pyramids, after: 'pyramid' },
    { id: 'sphinx', youtubeId: 'ExM6MiWDlnk', icon: '🦁', title: 'The Great Sphinx', say: L.videos.sphinx, after: 'sphinx' },
    { id: 'nile', youtubeId: 'Emh7nLLSz_k', icon: '🌊', title: 'The River Nile', say: L.videos.nile, after: 'nile' },
    { id: 'camels', youtubeId: 'puvcUA7-Vfk', icon: '🐪', title: 'Real camels', say: L.videos.camels },
  ],
  passportLine: L.passport,
  createdAt: '2026-09-27',
}
export default meta

import globe from '../../assets/globe.webp'
import type { PlaceMeta } from '../../types'
import { L } from './lines'

// The Poles: the top and the bottom of the world in one place (plan: planning/around-the-world/poles.html). The hub is a
// 3D globe she spins (top = the Arctic's sea ice, bottom = Antarctica's land) and a sun she drags, so day and night swap
// between the poles. Built one greybox at a time: every activity is still in the works, so none is in the game yet.
// No art yet: the stickers and the friend show the world's globe until the art gate.
const meta: PlaceMeta = {
  id: 'poles',
  name: 'The Poles',
  emoji: '🐧',
  flag: 'poles',
  // On Antarctica, the white strip along the bottom of the map.
  mapPos: { x: 50, y: 91 },
  friend: { name: 'Pola the polar bear cub', img: globe },
  trophyTitle: 'Polar Explorer',
  activities: [],
  inTheWorks: [
    { id: 'floe', name: 'Ice Floe Hop', icon: '🐻‍❄️', pos: { x: 50, y: 20 }, sticker: { name: 'Polar bear', img: globe, fact: L.stickers.bear } },
    { id: 'coats', name: 'Snow Coats', icon: '🦊', pos: { x: 30, y: 25 }, sticker: { name: 'Arctic fox', img: globe, fact: L.stickers.fox } },
    { id: 'slide', name: 'Penguin Slide', icon: '🐧', pos: { x: 50, y: 80 }, sticker: { name: 'Adelie penguin', img: globe, fact: L.stickers.adelie } },
    { id: 'huddle', name: 'Emperor Huddle', icon: '🥚', pos: { x: 70, y: 75 }, sticker: { name: 'Emperor chick', img: globe, fact: L.stickers.chick } },
    { id: 'iceberg', name: 'Iceberg Maker', icon: '🧊', pos: { x: 75, y: 50 }, sticker: { name: 'Narwhal', img: globe, fact: L.stickers.narwhal } },
  ],
  facts: [
    { icon: '🌊', label: 'Ocean or land', say: L.facts.ocean },
    { icon: '🐻‍❄️', label: 'Never meet', say: L.facts.neverMeet },
    { icon: '☀️', label: 'Opposite seasons', say: L.facts.seasons },
    { icon: '🌙', label: 'Long nights', say: L.facts.nights },
  ],
  coloringPages: [],
  // Real-world videos for the Theater (button in the place's top bar). `after` offers one when that activity is done.
  videos: [
    { id: 'bears', youtubeId: 'mIGpzhADMC4', icon: '🐻‍❄️', title: 'Polar bear cubs on the ice', say: L.videos.bears, after: 'floe' },
    { id: 'fox', youtubeId: '5FnJ70WwCXw', icon: '🦊', title: 'White for winter', say: L.videos.fox, after: 'coats' },
    { id: 'penguins', youtubeId: 'A9mbCNs47FI', icon: '🐧', title: 'Penguins zoom out of the sea', say: L.videos.penguins, after: 'slide' },
    { id: 'huddle', youtubeId: 'OL7O5O7U4Gs', icon: '🥚', title: 'The emperor huddle', say: L.videos.huddle, after: 'huddle' },
    { id: 'iceberg', youtubeId: '00_-JlbIftg', icon: '🧊', title: 'An iceberg breaks off', say: L.videos.iceberg, after: 'iceberg' },
    { id: 'narwhal', youtubeId: 'MXsZg1sQYvA', icon: '🦄', title: 'Narwhals', say: L.videos.narwhal },
  ],
  passportLine: L.passport,
  createdAt: '2026-10-27',
}
export default meta

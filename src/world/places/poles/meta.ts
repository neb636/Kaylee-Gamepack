import type { ActivityInfo, PlaceMeta } from '../../types'
import coats, { POLE as coatsPole, READY as coatsReady } from './activities/coats/info'
import floe, { POLE as floePole, READY as floeReady } from './activities/floe/info'
import huddle, { POLE as huddlePole, READY as huddleReady } from './activities/huddle/info'
import iceberg, { POLE as icebergPole, READY as icebergReady } from './activities/iceberg/info'
import slide, { POLE as slidePole, READY as slideReady } from './activities/slide/info'
import { art } from './art'
import { L } from './lines'

// Each activity says in its own info.ts whether it's ready for Kaylee, so one can go into the game without touching
// the others. The rest stay in the works: their links open them, but there's no spot on the globe for them yet.
const ALL: [ActivityInfo, boolean][] = [
  [floe, floeReady],
  [coats, coatsReady],
  [slide, slideReady],
  [huddle, huddleReady],
  [iceberg, icebergReady],
]
/** Which side of the globe each activity's spot shows on (the hub reads it). */
export const ACTIVITY_POLE: Record<string, 'north' | 'south' | 'both'> = { floe: floePole, coats: coatsPole, slide: slidePole, huddle: huddlePole, iceberg: icebergPole }

// The Poles: the top and the bottom of the world in one place (plan: planning/around-the-world/poles.html). The hub is a
// 3D globe she spins (top = the Arctic's sea ice, bottom = Antarctica's land) and a sun she drags, so day and night swap
// between the poles. Its activities' spots show on the globe's sides (floes and coats up north, the slide and the
// huddle down south, the icebergs on both).
const meta: PlaceMeta = {
  id: 'poles',
  name: 'The Poles',
  emoji: '🐧',
  flag: 'poles',
  // On Antarctica, the white strip along the bottom of the map.
  mapPos: { x: 50, y: 91 },
  friend: { name: 'Pola the polar bear cub', img: art.friend },
  trophyTitle: 'Polar Explorer',
  activities: ALL.filter(([, ready]) => ready).map(([a]) => a),
  inTheWorks: ALL.filter(([, ready]) => !ready).map(([a]) => a),
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

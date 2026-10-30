import colorMaple from './assets/bg-color-maple.webp'
import colorMoose from './assets/bg-color-moose.webp'
import colorParade from './assets/bg-color-parade.webp'
import colorSpiritBear from './assets/bg-color-spirit-bear.webp'
import loon from './assets/animal-loon.webp'
import moose from './assets/animal-moose.webp'
import otter from './assets/animal-sea-otter.webp'
import owl from './assets/animal-snowy-owl.webp'
import grizzly from './assets/animal-grizzly.webp'
import raccoon from './assets/animal-raccoon.webp'
import spirit from './assets/animal-spirit-bear.webp'
import squirrel from './assets/animal-red-squirrel.webp'
import maple from './assets/maple.webp'
import puzzleCampfire from './assets/scene-puzzle-campfire.webp'
import puzzleLake from './assets/scene-puzzle-lake.webp'
import puzzleOrcas from './assets/scene-puzzle-orcas.webp'
import type { PlaceMeta } from '../../types'
import { L } from './lines'

// Canada, ocean to ocean (plan: planning/around-the-world/canada.html). The hub is a 3D toy-table map of the country:
// Kaylee taps activity pins from Quebec to the Pacific, and each of the four destinations has one
// 3D and one 2D activity. Collecting all eight stamps opens the finale in Ottawa (Animal Homes, then pond hockey on the
// frozen canal), and the hockey win is the Canada Champion trophy.
const meta: PlaceMeta = {
  id: 'canada',
  name: 'Canada',
  emoji: '🍁',
  flag: 'canada',
  // East of the bear on the world map, toward Quebec.
  mapPos: { x: 27, y: 25 },
  friend: { name: 'Maple the beaver', img: maple },
  trophyTitle: 'Canada Champion',
  // In play order along the track, east to west (`pos` is unused: the hub is the 3D map, map/track.ts places the stops).
  activities: [
    { id: 'taffy', name: 'Sugar Snow', icon: '🍁', pos: { x: 85, y: 60 }, sticker: { name: 'Red squirrel', img: squirrel, fact: L.stickers.squirrel } },
    { id: 'snowman', name: 'Carnival Snowballs', icon: '⛄', pos: { x: 85, y: 65 }, sticker: { name: 'Snowy owl', img: owl, fact: L.stickers.owl } },
    { id: 'bike', name: 'Mountain Bike', icon: '🚵', pos: { x: 90, y: 58 }, sticker: { name: 'Moose', img: moose, fact: L.stickers.moose } },
    { id: 'campfire', name: 'Campfire Night', icon: '⛺', pos: { x: 90, y: 62 }, sticker: { name: 'Raccoon', img: raccoon, fact: L.stickers.raccoon } },
    { id: 'canoe', name: 'Red Canoe', icon: '🛶', pos: { x: 25, y: 60 }, sticker: { name: 'Loon', img: loon, fact: L.stickers.loon } },
    { id: 'bridge', name: 'Animal Bridge', icon: '🦌', pos: { x: 25, y: 65 }, sticker: { name: 'Grizzly cub', img: grizzly, fact: L.stickers.grizzly } },
    { id: 'whales', name: 'Whale Watch', icon: '🐋', pos: { x: 10, y: 62 }, sticker: { name: 'Sea otter', img: otter, fact: L.stickers.otter } },
    { id: 'salmon', name: 'Salmon Leap', icon: '🐟', pos: { x: 12, y: 55 }, sticker: { name: 'Spirit bear', img: spirit, fact: L.stickers.spirit } },
  ],
  facts: [
    { icon: '🍁', label: 'The flag', say: L.facts.flag },
    { icon: '👋', label: 'Bonjour!', say: L.facts.bonjour },
    { icon: '🗺️', label: 'Huge', say: L.facts.huge },
    { icon: '❄️', label: 'Snowy winters', say: L.facts.winter },
    { icon: '🦫', label: 'Beaver', say: L.facts.beaver },
    { icon: '🍯', label: 'Maple syrup', say: L.facts.syrup },
    { icon: '🏰', label: 'A castle hotel', say: L.facts.castle },
    { icon: '🏒', label: 'Hockey', say: L.facts.hockey },
    { icon: '🌉', label: 'Animal bridges', say: L.facts.bridges },
  ],
  coloringPages: [
    { id: 'canada-maple', img: colorMaple },
    { id: 'canada-parade', img: colorParade },
    { id: 'canada-moose', img: colorMoose },
    { id: 'canada-spirit-bear', img: colorSpiritBear },
  ],
  puzzles: [
    { id: 'canada-lake', name: 'The red canoe', img: puzzleLake },
    { id: 'canada-orcas', name: 'The orca family', img: puzzleOrcas },
    { id: 'canada-campfire', name: 'The campfire', img: puzzleCampfire },
  ],
  // Real-world videos for the Theater (button in the place's top bar). `after` offers one when that activity is done.
  // Picked 2026-10-28 by title, channel and description (each passed YouTube's embed check); a grown-up should skim them.
  videos: [
    { id: 'taffy', youtubeId: 'cFcl41H7Acw', icon: '🍁', title: 'Making maple taffy (CBC Kids)', say: L.videos.taffy, after: 'taffy' },
    { id: 'snowman', youtubeId: 'wxp-8oZxRpU', icon: '⛄', title: 'Quebec Winter Carnival', say: L.videos.snowman, after: 'snowman' },
    { id: 'bike', youtubeId: 'ixtDTI8AYX4', icon: '🚵', title: 'Biking at Mont-Sainte-Anne', say: L.videos.bike, after: 'bike' },
    { id: 'campfire', youtubeId: '0nuTJNiLWXs', icon: '🦉', title: 'Animals that see at night (Nat Geo)', say: L.videos.campfire, after: 'campfire' },
    { id: 'canoe', youtubeId: '2esc6v-mG5A', icon: '🛶', title: 'A canoe on Moraine Lake', say: L.videos.canoe, after: 'canoe' },
    { id: 'bridge', youtubeId: 'jfS6LDqadpg', icon: '🌉', title: "Banff's animal bridges (Parks Canada)", say: L.videos.bridge, after: 'bridge' },
    { id: 'whales', youtubeId: 'mmtChp_89ck', icon: '🦦', title: 'Sea otters holding paws', say: L.videos.whales, after: 'whales' },
    { id: 'salmon', youtubeId: '-xfs9qKg16E', icon: '🐻', title: 'Spirit bears and salmon', say: L.videos.salmon, after: 'salmon' },
    { id: 'hockey', youtubeId: 'IEFY8m6h5SY', icon: '⛸️', title: 'Skating on the Rideau Canal (Nat Geo)', say: L.videos.hockey },
  ],
  passportLine: L.passport,
  createdAt: '2026-10-27',
}
export default meta

import { FLAGS } from '../../../flags'
import colorMaple from './assets/bg-color-maple.webp'
import colorMoose from './assets/bg-color-moose.webp'
import colorParade from './assets/bg-color-parade.webp'
import colorSpiritBear from './assets/bg-color-spirit-bear.webp'
import loon from './assets/animal-loon.webp'
import moose from './assets/animal-moose.webp'
import otter from './assets/animal-sea-otter.webp'
import owl from './assets/animal-snowy-owl.webp'
import raccoon from './assets/animal-raccoon.webp'
import spirit from './assets/animal-spirit-bear.webp'
import maple from './assets/maple.webp'
import puzzleCampfire from './assets/scene-puzzle-campfire.webp'
import puzzleLake from './assets/scene-puzzle-lake.webp'
import puzzleOrcas from './assets/scene-puzzle-orcas.webp'
import type { PlaceMeta } from '../../types'
import { L } from './lines'

// Canada is one story, "Maple's Team" (planning/around-the-world/canada.md): Maple the beaver wants to win the Maple
// Cup, the hockey game on Ottawa's frozen canal, and her friends live all across Canada. The hub is a 3D toy map of
// the country with each friend standing where they live; each of the six chapters (a film, the game, a film) brings
// one friend home to the team, and with all six stamps the big game opens in Ottawa: its win is the Canada Champion
// trophy.
const meta: PlaceMeta = {
  id: 'canada',
  name: 'Canada',
  // A moose on its world-map pin (the user asked for it instead of the maple leaf, 2026-11-20).
  emoji: '🫎',
  flag: 'canada',
  // East of the bear on the world map, toward Quebec.
  mapPos: { x: 27, y: 25 },
  friend: { name: 'Maple the beaver', img: maple },
  trophyTitle: 'Canada Champion',
  // The chapters, east to west across the map (story/chapters.ts; `pos` is unused: the hub is the 3D map).
  activities: [
    { id: 'snowman', name: 'Carnival Snowballs', icon: '⛄', pos: { x: 85, y: 65 }, sticker: { name: 'Snowy owl', img: owl, fact: L.stickers.owl } },
    { id: 'bike', name: 'Mountain Bike', icon: '🚵', pos: { x: 90, y: 58 }, sticker: { name: 'Moose', img: moose, fact: L.stickers.moose } },
    { id: 'campfire', name: 'Campfire Night', icon: '⛺', pos: { x: 90, y: 62 }, sticker: { name: 'Raccoon', img: raccoon, fact: L.stickers.raccoon } },
    { id: 'canoe', name: 'Red Canoe', icon: '🛶', pos: { x: 25, y: 60 }, sticker: { name: 'Loon', img: loon, fact: L.stickers.loon } },
    { id: 'bath', name: "Misty's Bubble Bath", icon: '🛁', pos: { x: 12, y: 55 }, sticker: { name: 'Spirit bear', img: spirit, fact: L.stickers.spirit } },
    { id: 'whales', name: 'Whale Peek-a-Boo', icon: '🐋', pos: { x: 10, y: 62 }, sticker: { name: 'Sea otter', img: otter, fact: L.stickers.otter } },
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
  // Real-world videos for the Theater (button in the place's top bar). None is offered after a chapter: a video there
  // broke up the story (the Poles, 2026-11-16), so they wait in the Theater.
  // Picked 2026-10-28 by title, channel and description (each passed YouTube's embed check); a grown-up should skim them.
  videos: [
    { id: 'taffy', youtubeId: 'cFcl41H7Acw', icon: '🍁', title: 'Making maple taffy (CBC Kids)', say: L.videos.taffy },
    { id: 'snowman', youtubeId: 'wxp-8oZxRpU', icon: '⛄', title: 'Quebec Winter Carnival', say: L.videos.snowman },
    { id: 'bike', youtubeId: 'ixtDTI8AYX4', icon: '🚵', title: 'Biking at Mont-Sainte-Anne', say: L.videos.bike },
    { id: 'campfire', youtubeId: '0nuTJNiLWXs', icon: '🦉', title: 'Animals that see at night (Nat Geo)', say: L.videos.campfire },
    { id: 'canoe', youtubeId: '2esc6v-mG5A', icon: '🛶', title: 'A canoe on Moraine Lake', say: L.videos.canoe },
    { id: 'bridge', youtubeId: 'jfS6LDqadpg', icon: '🌉', title: "Banff's animal bridges (Parks Canada)", say: L.videos.bridge },
    { id: 'whales', youtubeId: 'mmtChp_89ck', icon: '🦦', title: 'Sea otters holding paws', say: L.videos.whales },
    { id: 'salmon', youtubeId: '-xfs9qKg16E', icon: '🐻', title: 'Spirit bears and salmon', say: L.videos.salmon },
    { id: 'hockey', youtubeId: 'IEFY8m6h5SY', icon: '⛸️', title: 'Skating on the Rideau Canal (Nat Geo)', say: L.videos.hockey },
  ],
  passportLine: L.passport,
  createdAt: '2026-10-27',
  // Maple's Team is on her map only when this PostHog flag is on: testers only until it's played (src/flags.ts).
  featureFlag: FLAGS.newCanadaPin,
}
export default meta

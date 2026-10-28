// Maple's animal book: every animal Kaylee can meet in Canada, by stop (the plan's "Every animal, by stop"). The first
// time she pokes one anywhere, the activity calls meet(id) (met.ts): Sparkle names it with one short fact and it pops
// into the book. Its picture comes from assets/animal-<id>.webp; the emoji is a fallback and the grey shape. No
// three.js, so the 2D activities and the hub can all import it.
import { L } from '../lines'

export type Stop = 'quebec' | 'msa' | 'banff' | 'bc' | 'train'

export const STOP_PAGES: { id: Stop; name: string; icon: string }[] = [
  { id: 'quebec', name: 'Quebec City', icon: '🏰' },
  { id: 'msa', name: 'Mont-Sainte-Anne', icon: '⛰️' },
  { id: 'banff', name: 'Banff', icon: '🏔️' },
  { id: 'bc', name: 'British Columbia', icon: '🌊' },
  { id: 'train', name: 'Along the train', icon: '🚂' },
]

export type AnimalId = Exclude<keyof typeof L.book, 'open'>

export interface Animal {
  id: AnimalId
  name: string
  stop: Stop
  icon: string
}

const a = (stop: Stop, list: [AnimalId, string, string][]): Animal[] => list.map(([id, name, icon]) => ({ id, name, icon, stop }))

export const ANIMALS: Animal[] = [
  ...a('quebec', [
    ['snowy-owl', 'Snowy owl', '🦉'],
    ['red-squirrel', 'Red squirrel', '🐿️'],
    ['chickadee', 'Chickadee', '🐦'],
    ['canada-goose', 'Canada goose', '🪿'],
    ['beluga', 'Beluga whale', '🐳'],
    ['red-fox', 'Red fox', '🦊'],
  ]),
  ...a('msa', [
    ['moose', 'Moose', '🫎'],
    ['beaver', 'Beaver', '🦫'],
    ['black-bear', 'Black bear', '🐻'],
    ['chipmunk', 'Chipmunk', '🐿️'],
    ['porcupine', 'Porcupine', '🦔'],
    ['raccoon', 'Raccoon', '🦝'],
    ['deer', 'White-tailed deer', '🦌'],
    ['barred-owl', 'Barred owl', '🦉'],
    ['woodpecker', 'Woodpecker', '🪶'],
    ['bat', 'Bat', '🦇'],
    ['firefly', 'Firefly', '✨'],
    ['peeper', 'Spring peeper', '🐸'],
    ['hare', 'Snowshoe hare', '🐇'],
  ]),
  ...a('banff', [
    ['elk', 'Elk', '🦌'],
    ['grizzly', 'Grizzly bear', '🐻'],
    ['bighorn', 'Bighorn sheep', '🐏'],
    ['mountain-goat', 'Mountain goat', '🐐'],
    ['wolf', 'Wolf', '🐺'],
    ['pika', 'Pika', '🐭'],
    ['marmot', 'Marmot', '🦫'],
    ['ground-squirrel', 'Ground squirrel', '🐿️'],
    ['loon', 'Loon', '🦆'],
    ['bald-eagle', 'Bald eagle', '🦅'],
    ['trout', 'Trout', '🐟'],
  ]),
  ...a('bc', [
    ['orca', 'Orca', '🐋'],
    ['humpback', 'Humpback whale', '🐋'],
    ['grey-whale', 'Grey whale', '🐳'],
    ['sea-otter', 'Sea otter', '🦦'],
    ['sea-lion', 'Sea lion', '🦭'],
    ['harbour-seal', 'Harbour seal', '🦭'],
    ['puffin', 'Puffin', '🐧'],
    ['sea-star', 'Sea star', '⭐'],
    ['salmon', 'Salmon', '🐟'],
    ['spirit-bear', 'Spirit bear', '🐻‍❄️'],
    ['banana-slug', 'Banana slug', '🐌'],
    ['raven', 'Raven', '🐦‍⬛'],
  ]),
  ...a('train', [
    ['bison', 'Bison', '🦬'],
    ['mountie-horse', 'Mountie horse', '🐴'],
    ['polar-bear', 'Polar bear', '🐻‍❄️'],
  ]),
]

export const ANIMAL = Object.fromEntries(ANIMALS.map((x) => [x.id, x])) as Record<AnimalId, Animal>

// The pictures (art/source/world/canada/animal-<id>.png, `npm run art -- canada`). Missing ones show the emoji.
const PICS = import.meta.glob<string>('../assets/animal-*.webp', { eager: true, import: 'default' })
export const picOf = (id: AnimalId): string | undefined => PICS[`../assets/animal-${id}.webp`]

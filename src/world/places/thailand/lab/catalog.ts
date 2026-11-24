// Everyone the character lab (#/world/characters) can show, in every 3D country: Kaylee, the family, the trips'
// extras, the crowds, the bay's critters, the Poles and Canada's friends and the wildlife she pokes, with the look each
// one is built from (or the hand-built toy, toys.ts), the voice they talk in, the file their look lives in, and their
// variations (Kaylee's outfits, a group of kids). Lines come straight from each country's lines.ts: whatever a voice can
// say, the lab can play.
import type { Line } from '../../../../sdk'
import { CRITTERS, type CritterId } from '../activities/boat-trip/bay/critters'
import { FISHER } from '../activities/boat-trip/bay/open'
import { GRANDMA, KIDS } from '../activities/boat-trip/bay/village'
import { CUSTOMERS } from '../activities/mall-trip/games/barber/layout'
import { CROWD } from '../activities/nan-trip/cup/scenery'
import { FARMER } from '../activities/nan-trip/mushrooms/farm'
import { SALT_AUNTY } from '../activities/nan-trip/salt/hut'
import { FILLY, GRANDMA as SALT_GRANDMA, KAI, KWAI, NAK } from '../activities/nan-trip/salt/story'
import { SEA_FOLK } from '../activities/samet-trip/speedboat/boats'
import { FOLK as ROAD_FOLK, KIDS as ROAD_KIDS } from '../trip/vehicles/locals'
import { L as polesLines } from '../../poles/lines'
import polesCast from '../../poles/cast.json'
import type { ToyId } from './toys'
import { KID_LOOKS } from '../activities/mall-trip/games/race/racer'
import { KID_C, STAFF_LOOKS } from '../activities/mall-trip/hall/kids'
import { SERVER } from '../activities/mall-trip/pizza/room'
import { RIVAL_LOOKS } from '../activities/nan-trip/cup/rivals'
import { LUNG } from '../activities/nan-trip/rice/farm'
import { CAPTAIN, FIRE_DANCERS, JETSKI_MAN, PUPPY, TAXI_DRIVER } from '../activities/samet-trip/cast'
import { FAMILY } from '../characters/family'
import { POLES_LOOKS } from '../../poles/characters/looks'
import { L as canadaLines } from '../../canada/lines'
import canadaCast from '../../canada/cast.json'
import { CANADA_LOOKS } from '../../canada/characters/looks'
import { COACH_LOOK, LOOKS, PATIENT_LOOKS, type Look, type Wearable } from '../characters/looks'
import cast from '../cast.json'
import { L } from '../lines'
import { ATTENDANT } from '../trip/legs/plane'
import { OFFICER } from '../trip/legs/airport'
import type { DadCandidate } from '../characters/dad-candidates'

export type Country = 'thailand' | 'poles' | 'canada'
/** The country switcher's choices (`all`: everyone, the way the list always was). */
export const COUNTRIES: { id: Country | 'all'; name: string }[] = [
  { id: 'all', name: 'All' },
  { id: 'thailand', name: 'Thailand' },
  { id: 'poles', name: 'The Poles' },
  { id: 'canada', name: 'Canada' },
]

export type CastGroup = 'family' | 'trip' | 'mall' | 'nan' | 'samet' | 'critters' | 'folk' | 'poles' | 'poles-wild' | 'canada' | 'canada-wild'
export const GROUPS: { id: CastGroup; name: string; country: Country }[] = [
  { id: 'family', name: 'You & family', country: 'thailand' },
  { id: 'trip', name: 'Boat trip', country: 'thailand' },
  { id: 'mall', name: 'Mall day', country: 'thailand' },
  { id: 'nan', name: 'Nan trip', country: 'thailand' },
  { id: 'samet', name: 'Koh Samet', country: 'thailand' },
  { id: 'critters', name: 'Bay critters', country: 'thailand' },
  { id: 'folk', name: 'Crowds & passers-by', country: 'thailand' },
  { id: 'poles', name: 'The Poles', country: 'poles' },
  { id: 'poles-wild', name: 'Polar wildlife', country: 'poles' },
  { id: 'canada', name: 'Canada', country: 'canada' },
  { id: 'canada-wild', name: 'Canada wildlife', country: 'canada' },
]
export const countryOf = (e: CastEntry): Country => GROUPS.find((g) => g.id === e.group)!.country

/** One choice in a character's variations popover: another look in their group, or an outfit for Kaylee. */
export interface Variant {
  label: string
  /** Switch to this cast entry. */
  entry?: string
  /** Kaylee wears exactly these. */
  wear?: Wearable[]
}

export interface CastEntry {
  id: string
  name: string
  who: string
  group: CastGroup
  kind: 'kaylee' | 'member' | 'critter'
  /** What they're built from (people and their pets). */
  look?: Look
  critter?: CritterId
  /** Hand-built by their own game (toys.ts): no look, no poses, their own moves. */
  toy?: ToyId
  /** Their cast.json speaker (none: they don't talk). */
  voice?: string
  /** Where their look is defined (for Dad and the next agent). */
  src: string
  /** Swatch color in the list. */
  color: string
  /** Entries that are variations of each other share this. */
  set?: string
  /** Dad 5’s skinned model and Blender wave. */
  candidate?: DadCandidate
}

const family: CastEntry[] = [
  // Kaylee and Mom are modelled vinyl toys from Tripo3D (characters/model.ts, characters/mom-model.ts), so they have no
  // look of their own here.
  { id: 'kaylee', name: 'Your unicorn', who: 'Her, a lilac unicorn (the vinyl toy, modelled in Tripo3D)', group: 'family', kind: 'kaylee', src: 'characters/model.ts', color: '#C9B6F0' },
  ...FAMILY.map((m): CastEntry =>
    m.id === 'ji'
      ? { id: m.id, name: m.name, who: 'Your mom, a cream unicorn (the vinyl toy, modelled in Tripo3D)', group: 'family', kind: 'member', voice: 'ji', src: 'characters/mom-model.ts', color: '#FACCA2' }

      : { id: m.id, name: m.name, who: m.who, group: 'family', kind: 'member', look: LOOKS[m.id], voice: m.id, src: 'characters/looks.ts', color: LOOKS[m.id].fur, set: m.id === 'nick' ? 'dads' : undefined },
  ),
  { id: 'dad-5', name: 'New Dad 5', who: 'Mint unicorn with a Blender wave', group: 'family', kind: 'member', voice: 'nick', src: 'characters/dad-candidates.ts', color: '#A9EBD6', set: 'dads', candidate: 'dad-5' },
]

const toy = (id: string, name: string, who: string, group: CastGroup, src: string, color: string, voice?: string, set?: string): CastEntry => ({ id, name, who, group, kind: 'critter', toy: id as ToyId, voice, src, color, set })

const person = (id: string, name: string, who: string, group: CastGroup, look: Look, src: string, voice?: string, set?: string): CastEntry => ({ id, name, who, group, kind: 'member', look, voice, src, color: look.fur, set })

// For you to choose (PR #573): Joy with pink puffy cheeks beside the game's Joy, whose cheeks are white. The one not
// picked goes, and this entry with it.
const joyPink = person('joy-pink', 'Joy (pink cheeks)', 'To choose: pink puffy cheeks instead of white', 'family', { ...LOOKS.joy, cheeks: 'pink' }, 'characters/looks.ts', 'joy')

const trip: CastEntry[] = [
  person('officer', 'Officer', 'Airport passport check', 'trip', OFFICER, 'trip/legs/airport.ts', 'officer'),
  person('attendant', 'Attendant', 'Flight attendant', 'trip', ATTENDANT, 'trip/legs/plane.ts', 'attendant'),
  person('fisher', 'Fisher', 'Fisherman in the bay', 'trip', FISHER, 'activities/boat-trip/bay/open.ts'),
  person('grandma', 'Village grandma', 'Koh Panyee', 'trip', GRANDMA, 'activities/boat-trip/bay/village.ts'),
  ...KIDS.map((look, i) => person(`village-kid-${i + 1}`, `Village kid ${i + 1}`, 'Koh Panyee', 'trip', look, 'activities/boat-trip/bay/village.ts', 'kids', 'village-kids')),
  toy('mali', 'Mali', 'Baan Chang: the big elephant, with little tusks', 'trip', 'activities/boat-trip/chang/elephant.ts', '#B5AEB8', undefined, 'chang'),
  toy('khanom', 'Khanom', 'Baan Chang: the young elephant who loves chocolate milk', 'trip', 'activities/boat-trip/chang/elephant.ts', '#C2B8C4', undefined, 'chang'),
  toy('lamyai', 'Lamyai', 'Baan Chang: the elephant with the pinkest ears', 'trip', 'activities/boat-trip/chang/elephant.ts', '#BDB0BE', undefined, 'chang'),
]

const mall: CastEntry[] = [
  person('coach', 'Coach', 'Muay Thai coach', 'mall', COACH_LOOK, 'characters/looks.ts', 'coach'),
  person('server', 'Server', 'Pizza Co. server', 'mall', SERVER, 'activities/mall-trip/pizza/room.ts', 'server'),
  ...STAFF_LOOKS.map((look, i) => person(`staff-${i + 1}`, `Staff ${i + 1}`, 'HarborLand staff', 'mall', look, 'activities/mall-trip/hall/kids.ts', 'staff', 'staff')),
  ...[KID_LOOKS.kidA, KID_LOOKS.kidB, KID_C].map((look, i) => person(`hall-kid-${i + 1}`, `Hall kid ${i + 1}`, 'HarborLand racer', 'mall', look, i < 2 ? 'activities/mall-trip/games/race/racer.ts' : 'activities/mall-trip/hall/kids.ts', 'kid', 'hall-kids')),
  ...(Object.keys(PATIENT_LOOKS) as (keyof typeof PATIENT_LOOKS)[]).map((id) => person(`patient-${id}`, `${id[0].toUpperCase()}${id.slice(1)} patient`, 'Vet clinic patient', 'mall', PATIENT_LOOKS[id], 'characters/looks.ts', undefined, 'patients')),
  ...CUSTOMERS.map(({ card, look }) => person(`barber-${card}`, `${look.species[0].toUpperCase()}${look.species.slice(1)} customer`, `Barber shop: wants ${card} hair`, 'mall', look, 'activities/mall-trip/games/barber/layout.ts', undefined, 'barber-kids')),
]

const nan: CastEntry[] = [
  person('lung', 'Lung Kham', 'Rice farmer', 'nan', LUNG, 'activities/nan-trip/rice/farm.ts', 'lung'),
  person('taeng', 'Grandma Taeng', 'Nan Mountain Cup: the champion, a tortoise', 'nan', RIVAL_LOOKS.taeng, 'activities/nan-trip/cup/rivals.ts', 'taeng', 'cup-rivals'),
  person('pao', 'Pao', 'Nan Mountain Cup: the hornbill postman', 'nan', RIVAL_LOOKS.pao, 'activities/nan-trip/cup/rivals.ts', 'pao', 'cup-rivals'),
  person('moon', 'Moon', 'Nan Mountain Cup: the sun bear honey seller', 'nan', RIVAL_LOOKS.moon, 'activities/nan-trip/cup/rivals.ts', 'moon', 'cup-rivals'),
  toy('jip', 'Jip', 'Rice farm: the sparrow who lost the hat (the story film)', 'nan', 'activities/nan-trip/rice/jip.ts', '#B98A5E'),
  person('mushroom-farmer', 'The mushroom farmer', 'Mushroom farm: a buffalo aunty in a sun hat', 'nan', FARMER, 'activities/nan-trip/mushrooms/farm.ts', 'farmer'),
  person('pa-kluea', 'Pa Kluea', 'Bo Kluea: the salt aunty, a pony', 'nan', SALT_AUNTY, 'activities/nan-trip/salt/hut.ts', 'saltaunty', 'salt'),
  person('little-pa-kluea', 'Little Pa Kluea', 'Bo Kluea: Pa Kluea as a filly, in the memory', 'nan', FILLY, 'activities/nan-trip/salt/story.ts', undefined, 'salt'),
  person('salt-grandma', "Pa Kluea's grandma", 'Bo Kluea: in the memory, in the sun hat that is Pa Kluea\'s now', 'nan', SALT_GRANDMA, 'activities/nan-trip/salt/story.ts', undefined, 'salt'),
  person('kwai', 'Lung Kwai', 'Bo Kluea: the noodle soup cook, a water buffalo', 'nan', KWAI, 'activities/nan-trip/salt/story.ts', 'kwai', 'salt-cooks'),
  person('kai', 'Pa Kai', 'Bo Kluea: the salty eggs cook, a hen', 'nan', KAI, 'activities/nan-trip/salt/story.ts', 'kai', 'salt-cooks'),
  person('nak', 'Yai Nak', 'Bo Kluea: the grilled fish cook, an otter grandma', 'nan', NAK, 'activities/nan-trip/salt/story.ts', 'nak', 'salt-cooks'),
]

const samet: CastEntry[] = [
  person('jetski-man', 'The jet ski man', 'Koh Samet: runs the jet skis on Sai Kaew, an otter', 'samet', JETSKI_MAN, 'activities/samet-trip/cast.ts', 'otter'),
  person('samet-captain', 'The captain', 'Koh Samet: drives the speedboat and the snorkel boat, a pelican', 'samet', CAPTAIN, 'activities/samet-trip/cast.ts', 'pelican'),
  person('taxi-driver', 'The taxi driver', 'Koh Samet: drives the green taxi, a sun bear', 'samet', TAXI_DRIVER, 'activities/samet-trip/cast.ts', 'sunbear'),
  person('beach-puppy', 'The beach puppy', 'Koh Samet: knows the way round the island, a cream beach dog in a pink bandana', 'samet', PUPPY, 'activities/samet-trip/cast.ts'),
  ...FIRE_DANCERS.map((look, i) => person(`fire-dancer-${i + 1}`, i ? 'Kae' : 'Tuk', i ? 'Koh Samet: a fire dancer on Sai Kaew, Tuk\'s little sister, a mint tokay gecko' : 'Koh Samet: a fire dancer on Sai Kaew, Kae\'s big brother, a blue tokay gecko', 'samet', look, 'activities/samet-trip/cast.ts', i ? 'kae' : 'tuk', 'fire-dancers')),
]

const poles: CastEntry[] = [
  person('pola', 'Pola', 'The Poles: the polar bear cub (north)', 'poles', POLES_LOOKS.pola, '../poles/characters/looks.ts', 'pola', 'polar-bears'),
  person('mama-bear', 'Mama Bear', 'The Poles: Pola\'s mama', 'poles', POLES_LOOKS.mama, '../poles/characters/looks.ts', 'mama', 'polar-bears'),
  person('pebble', 'Pebble', 'The Poles: the emperor penguin chick (south)', 'poles', POLES_LOOKS.pebble, '../poles/characters/looks.ts', 'pebble', 'emperors'),
  person('papa', 'Papa', 'The Poles: Pebble\'s papa, an emperor penguin', 'poles', POLES_LOOKS.papa, '../poles/characters/looks.ts', 'papa', 'emperors'),
  person('terry', 'Terry', 'The Poles: the Arctic tern who flies pole to pole', 'poles', POLES_LOOKS.terry, '../poles/characters/looks.ts', 'terry'),
  toy('nari', 'Nari', 'The Poles: the narwhal, the unicorn of the sea', 'poles', '../poles/story/props.ts', '#A9BCD8', 'nari'),
  person('adelie', 'Adélie penguin', 'The Poles: the little penguins on Penguin Slide', 'poles', POLES_LOOKS.adelie, '../poles/characters/looks.ts'),
  person('arctic-fox', 'Arctic fox', 'The Poles: the fox in the story films, brown for summer', 'poles', POLES_LOOKS.fox, '../poles/characters/looks.ts', undefined, 'arctic-fox'),
  person('snow-fox', 'Arctic fox (winter)', 'The Poles: the same fox, white once the snow comes', 'poles', POLES_LOOKS.snowfox, '../poles/characters/looks.ts', undefined, 'arctic-fox'),
]

const polesWild: CastEntry[] = [
  toy('leopard-seal', 'Leopard seal', 'Penguin Slide: the spotty seal who only wants to play', 'poles-wild', '../poles/activities/slide/penguin.ts', '#9AA3B5'),
  toy('weddell-seal', 'Weddell seal', 'Penguin Slide: dozing on the ice', 'poles-wild', '../poles/activities/slide/critters.ts', '#7D8AA6', undefined, 'ice-seals'),
  toy('elephant-seal', 'Elephant seal', 'Penguin Slide: the big-nosed one', 'poles-wild', '../poles/activities/slide/critters.ts', '#9C8C84', undefined, 'ice-seals'),
  toy('skua', 'Skua', 'Penguin Slide: the brown seabird', 'poles-wild', '../poles/activities/slide/critters.ts', '#8A7464', undefined, 'skuas'),
  toy('skua-chick', 'Skua chick', 'Penguin Slide: a fluffy skua chick', 'poles-wild', '../poles/activities/slide/critters.ts', '#B8A898', undefined, 'skuas'),
  toy('humpback', 'Humpback whale', 'Penguin Slide: the whale who sings', 'poles-wild', '../poles/activities/slide/critters.ts', '#5E6A8A'),
]

const CRITTER_INFO: Record<CritterId, { name: string; color: string }> = {
  needlefish: { name: 'Needlefish', color: '#B8E6D8' },
  eagle: { name: 'Sea eagle', color: '#8E8AA8' },
  macaque: { name: 'Macaque', color: '#B9A28E' },
  cat: { name: 'Village cat', color: '#FFB66E' },
  crab: { name: 'Fiddler crab', color: '#FF7F6E' },
  mudskipper: { name: 'Mudskipper', color: '#9C8FA8' },
  lizard: { name: 'Monitor lizard', color: '#6F7A8E' },
  kingfisher: { name: 'Kingfisher', color: '#3FA8F0' },
  porpoise: { name: 'Porpoise', color: '#A9B4CC' },
}
const critters: CastEntry[] = CRITTERS.map((id) => ({ id, name: CRITTER_INFO[id].name, who: 'Phang Nga Bay sticker', group: 'critters', kind: 'critter', critter: id, src: 'activities/boat-trip/bay/critters.ts', color: CRITTER_INFO[id].color }))

const canada: CastEntry[] = [
  person('maple', 'Maple', "Canada: the beaver who captains Maple's Team", 'canada', CANADA_LOOKS.maple, '../canada/characters/looks.ts', 'maple', 'beavers'),
  person('moose', 'Monty', 'Canada: the moose, the goalie who fills the whole net', 'canada', CANADA_LOOKS.moose, '../canada/characters/looks.ts', 'moose'),
  person('raccoon', 'Roxy', 'Canada: the raccoon with the quickest paws', 'canada', CANADA_LOOKS.raccoon, '../canada/characters/looks.ts', 'raccoon', 'raccoons'),
  person('kit', "Roxy's kit", "Canada: one of Roxy's three babies, the team's fans", 'canada', CANADA_LOOKS.kit, '../canada/characters/looks.ts', undefined, 'raccoons'),
  person('otter', 'Ollie', 'Canada: the sea otter who spins like a top', 'canada', CANADA_LOOKS.otter, '../canada/characters/looks.ts', 'otter'),
  person('spirit', 'Misty', 'Canada: the spirit bear with the biggest slap shot', 'canada', CANADA_LOOKS.spirit, '../canada/characters/looks.ts', 'bear'),
  toy('tuque', 'Tuque', 'Canada: the snowman', 'canada', '../canada/characters/tuque.ts', '#F4F6FF', 'snowman'),
  toy('lulu', 'Lulu', 'Canada: the loon on the Red Canoe lake', 'canada', '../canada/characters/lulu.ts', '#3A3A4A', 'loon', 'loons'),
  toy('loon-chick', "Lulu's chick", 'Canada: her fluffy grey baby', 'canada', '../canada/characters/lulu.ts', '#B9B9C4', undefined, 'loons'),
  toy('gus', 'Gus', "Canada: captain of the geese, the other team", 'canada', '../canada/characters/goose.ts', '#6FA8FF', 'gus', 'geese'),
  toy('goose', 'A goose', "Canada: one of Gus's team", 'canada', '../canada/characters/goose.ts', '#8A7A6A', undefined, 'geese'),
]

const canadaWild: CastEntry[] = [
  toy('porcupine', 'Porcupine', 'Canada: sleepy on a branch; poked, he puffs up', 'canada-wild', '../canada/characters/critters.ts', '#8A6A55'),
  toy('peeper', 'Spring peeper', 'Canada: the little frog who peeps', 'canada-wild', '../canada/characters/critters.ts', '#C9A878'),
  toy('deer', 'White-tailed deer', 'Canada: grazing among the trees', 'canada-wild', '../canada/characters/critters.ts', '#B5895E'),
  toy('barred-owl', 'Barred owl', 'Canada: turns his head right round', 'canada-wild', '../canada/characters/critters.ts', '#9A8878'),
  toy('bat', 'Little brown bat', 'Canada: hangs upside down and yawns', 'canada-wild', '../canada/characters/critters.ts', '#6E5A50'),
  toy('snowy-owl', 'Snowy owl', 'Canada map: poke it and it turns round', 'canada-wild', '../canada/map/critters.ts', '#F4F2EE'),
  toy('bison', 'Bison', 'Canada map: rolls in the dust', 'canada-wild', '../canada/map/critters.ts', '#6E5040'),
  toy('beluga', 'Beluga', 'Canada map: the white whale with a smile', 'canada-wild', '../canada/map/critters.ts', '#F2F4F8'),
  toy('orca', 'Orca', 'Canada map: black and white, leaps', 'canada-wild', '../canada/map/critters.ts', '#2E2E3A'),
]

const folk: CastEntry[] = [
  ...CROWD.map((look, i) => person(`cup-crowd-${i + 1}`, `Race crowd ${i + 1}`, `Nan: Stop Time Cafe and the race ground, a ${look.species}`, 'folk', look, 'activities/nan-trip/cup/scenery.ts', undefined, 'cup-crowd')),
  ...ROAD_FOLK.map((look, i) => person(`road-rider-${i + 1}`, `Scooter rider ${i + 1}`, `On the road: a ${look.species} on a scooter`, 'folk', look, 'trip/vehicles/locals.ts', undefined, 'road-folk')),
  ...ROAD_KIDS.map((look, i) => person(`road-kid-${i + 1}`, `Pillion kid ${i + 1}`, `On the road: a little ${look.species} riding pillion`, 'folk', look, 'trip/vehicles/locals.ts', undefined, 'road-folk')),
  ...SEA_FOLK.map((look, i) => person(`sea-folk-${i + 1}`, `Out on the water ${i + 1}`, `Koh Samet: a ${look.species} on a ferry, longtail or jet ski`, 'folk', look, 'activities/samet-trip/speedboat/boats.ts', undefined, 'sea-folk')),
]

export const CAST: CastEntry[] = [...family, joyPink, ...trip, ...mall, ...nan, ...samet, ...critters, ...folk, ...poles, ...polesWild, ...canada, ...canadaWild]
/** Everyone in a country (`all`: everyone). */
export const castIn = (country: Country | 'all') => (country === 'all' ? CAST : CAST.filter((c) => countryOf(c) === country))
export const castById = (id: string | undefined) => CAST.find((c) => c.id === id)

/** Kaylee's outfits (what she wears on each trip and at each HarborLand game). */
export const OUTFITS: Variant[] = [
  { label: 'Everyday', wear: [] },
  { label: 'Boat day', wear: ['sunhat', 'sunglasses', 'floaties'] },
  { label: 'Vet', wear: ['scrubs', 'scrub-cap'] },
  { label: 'Chef', wear: ['apron', 'chef-hat'] },
  { label: 'Barber', wear: ['smock'] },
  { label: 'Muay Thai', wear: ['gloves', 'mongkhon'] },
]

/** The variations popover's choices for a character (none: no popover). */
export function variantsFor(e: CastEntry): Variant[] {
  if (e.kind === 'kaylee') return OUTFITS
  if (!e.set) return []
  return CAST.filter((c) => c.set === e.set).map((c) => ({ label: c.name, entry: c.id }))
}

const LINES: Record<Country, unknown> = { thailand: L, poles: polesLines, canada: canadaLines }
const SPEAKERS: Record<Country, unknown> = { thailand: cast.speakers, poles: polesCast.speakers, canada: canadaCast.speakers }

/** Every phrase in their country's lines.ts said in their voice (deduplicated, in file order). */
export function linesFor(e: CastEntry): Line[] {
  const voice = e.voice
  if (!voice) return []
  const out: Line[] = []
  const seen = new Set<string>()
  const walk = (v: unknown) => {
    if (!v || typeof v !== 'object') return
    const o = v as Record<string, unknown>
    if (typeof o.text === 'string' && o.voice === voice) {
      if (!seen.has(o.text)) out.push({ text: o.text, voice })
      seen.add(o.text)
      return
    }
    for (const k of Object.keys(o)) walk(o[k])
  }
  walk(LINES[countryOf(e)])
  return out
}

/** Their OpenAI voice and pitch (cast.json), for the line bar's label. */
export function voiceLabel(e: CastEntry): string | null {
  const s = e.voice ? (SPEAKERS[countryOf(e)] as Record<string, { voice: string; pitch?: number }>)[e.voice] : undefined
  if (!s) return null
  const p = s.pitch ?? 0
  return `${s.voice}${p ? ` · ${p > 0 ? '+' : ''}${p} st` : ''}`
}

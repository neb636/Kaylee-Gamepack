// Everyone the character lab (#/world/characters) can show: Kaylee, the family, the trips' extras and the bay's critters,
// with the look each one is built from, the voice they talk in, the file their look lives in, and their variations
// (Kaylee's outfits, a group of kids). Lines come straight from lines.ts: whatever a voice can say, the lab can play.
import type { Line } from '../../../../sdk'
import { CRITTERS, type CritterId } from '../activities/boat-trip/bay/critters'
import { FISHER } from '../activities/boat-trip/bay/open'
import { GRANDMA, KIDS } from '../activities/boat-trip/bay/village'
import { KID_LOOKS } from '../activities/mall-trip/games/race/racer'
import { KID_C, STAFF_LOOKS } from '../activities/mall-trip/hall/kids'
import { SERVER } from '../activities/mall-trip/pizza/room'
import { RIVAL_LOOKS } from '../activities/nan-trip/cup/rivals'
import { LUNG } from '../activities/nan-trip/rice/farm'
import { FAMILY } from '../characters/family'
import { POLES_LOOKS } from '../../poles/characters/looks'
import { COACH_LOOK, LOOKS, PATIENT_LOOKS, type Look, type Wearable } from '../characters/looks'
import cast from '../cast.json'
import { L } from '../lines'
import { ATTENDANT } from '../trip/legs/plane'
import { OFFICER } from '../trip/legs/airport'

export type CastGroup = 'family' | 'trip' | 'mall' | 'nan' | 'critters' | 'poles'
export const GROUPS: { id: CastGroup; name: string }[] = [
  { id: 'family', name: 'Kaylee & family' },
  { id: 'trip', name: 'Boat trip' },
  { id: 'mall', name: 'Mall day' },
  { id: 'nan', name: 'Nan trip' },
  { id: 'critters', name: 'Bay critters' },
  { id: 'poles', name: 'The Poles' },
]

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
  /** Their cast.json speaker (none: they don't talk). */
  voice?: string
  /** Where their look is defined (for Dad and the next agent). */
  src: string
  /** Swatch color in the list. */
  color: string
  /** Entries that are variations of each other share this. */
  set?: string
  /** Kaylee as the modelled vinyl toy (characters/model.ts, the game's Kaylee) instead of the code-built one. */
  model?: boolean
}

const family: CastEntry[] = [
  { id: 'kaylee', name: 'Kaylee', who: 'Her, a lilac unicorn (the vinyl toy, modelled in Tripo3D)', group: 'family', kind: 'kaylee', look: LOOKS.kaylee, src: 'characters/model.ts', color: '#C9B6F0', model: true },
  { id: 'kaylee-code', name: 'Kaylee (code-built)', who: 'The code-built unicorn she used to be (kept to compare)', group: 'family', kind: 'kaylee', look: LOOKS.kaylee, src: 'characters/looks.ts', color: LOOKS.kaylee.fur },
  ...FAMILY.map((m): CastEntry => ({ id: m.id, name: m.name, who: m.who, group: 'family', kind: 'member', look: LOOKS[m.id], voice: m.id, src: 'characters/looks.ts', color: LOOKS[m.id].fur })),
]

const person = (id: string, name: string, who: string, group: CastGroup, look: Look, src: string, voice?: string, set?: string): CastEntry => ({ id, name, who, group, kind: 'member', look, voice, src, color: look.fur, set })

const trip: CastEntry[] = [
  person('officer', 'Officer', 'Airport passport check', 'trip', OFFICER, 'trip/legs/airport.ts', 'officer'),
  person('attendant', 'Attendant', 'Flight attendant', 'trip', ATTENDANT, 'trip/legs/plane.ts', 'attendant'),
  person('fisher', 'Fisher', 'Fisherman in the bay', 'trip', FISHER, 'activities/boat-trip/bay/open.ts'),
  person('grandma', 'Village grandma', 'Koh Panyee', 'trip', GRANDMA, 'activities/boat-trip/bay/village.ts'),
  ...KIDS.map((look, i) => person(`village-kid-${i + 1}`, `Village kid ${i + 1}`, 'Koh Panyee', 'trip', look, 'activities/boat-trip/bay/village.ts', 'kids', 'village-kids')),
]

const mall: CastEntry[] = [
  person('coach', 'Coach', 'Muay Thai coach', 'mall', COACH_LOOK, 'characters/looks.ts', 'coach'),
  person('server', 'Server', 'Pizza Co. server', 'mall', SERVER, 'activities/mall-trip/pizza/room.ts', 'server'),
  ...STAFF_LOOKS.map((look, i) => person(`staff-${i + 1}`, `Staff ${i + 1}`, 'HarborLand staff', 'mall', look, 'activities/mall-trip/hall/kids.ts', 'staff', 'staff')),
  ...[KID_LOOKS.kidA, KID_LOOKS.kidB, KID_C].map((look, i) => person(`hall-kid-${i + 1}`, `Hall kid ${i + 1}`, 'HarborLand racer', 'mall', look, i < 2 ? 'activities/mall-trip/games/race/racer.ts' : 'activities/mall-trip/hall/kids.ts', 'kid', 'hall-kids')),
  ...(Object.keys(PATIENT_LOOKS) as (keyof typeof PATIENT_LOOKS)[]).map((id) => person(`patient-${id}`, `${id[0].toUpperCase()}${id.slice(1)} patient`, 'Vet clinic patient', 'mall', PATIENT_LOOKS[id], 'characters/looks.ts', undefined, 'patients')),
]

const nan: CastEntry[] = [
  person('lung', 'Lung Kham', 'Rice farmer', 'nan', LUNG, 'activities/nan-trip/rice/farm.ts', 'lung'),
  person('taeng', 'Grandma Taeng', 'Nan Mountain Cup: the champion, a tortoise', 'nan', RIVAL_LOOKS.taeng, 'activities/nan-trip/cup/rivals.ts', 'taeng', 'cup-rivals'),
  person('pao', 'Pao', 'Nan Mountain Cup: the hornbill postman', 'nan', RIVAL_LOOKS.pao, 'activities/nan-trip/cup/rivals.ts', 'pao', 'cup-rivals'),
  person('moon', 'Moon', 'Nan Mountain Cup: the sun bear honey seller', 'nan', RIVAL_LOOKS.moon, 'activities/nan-trip/cup/rivals.ts', 'moon', 'cup-rivals'),
]

const poles: CastEntry[] = [
  person('pola', 'Pola', 'The Poles: the polar bear cub (north)', 'poles', POLES_LOOKS.pola, '../poles/characters/looks.ts', undefined, 'polar-bears'),
  person('mama-bear', 'Mama Bear', 'The Poles: Pola\'s mama', 'poles', POLES_LOOKS.mama, '../poles/characters/looks.ts', undefined, 'polar-bears'),
  person('pebble', 'Pebble', 'The Poles: the emperor penguin chick (south)', 'poles', POLES_LOOKS.pebble, '../poles/characters/looks.ts', undefined, 'emperors'),
  person('papa', 'Papa', 'The Poles: Pebble\'s papa, an emperor penguin', 'poles', POLES_LOOKS.papa, '../poles/characters/looks.ts', undefined, 'emperors'),
  person('terry', 'Terry', 'The Poles: the Arctic tern who flies pole to pole', 'poles', POLES_LOOKS.terry, '../poles/characters/looks.ts'),
  person('adelie', 'Adélie penguin', 'The Poles: the little penguins on Penguin Slide', 'poles', POLES_LOOKS.adelie, '../poles/characters/looks.ts'),
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

export const CAST: CastEntry[] = [...family, ...trip, ...mall, ...nan, ...critters, ...poles]
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

/** Every phrase in lines.ts said in `voice` (deduplicated, in file order). */
export function linesFor(voice: string | undefined): Line[] {
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
  walk(L)
  return out
}

/** Their OpenAI voice and pitch (cast.json), for the line bar's label. */
export function voiceLabel(voice: string | undefined): string | null {
  const s = voice ? (cast.speakers as Record<string, { voice: string; pitch?: number }>)[voice] : undefined
  if (!s) return null
  const p = s.pitch ?? 0
  return `${s.voice}${p ? ` · ${p > 0 ? '+' : ''}${p} st` : ''}`
}

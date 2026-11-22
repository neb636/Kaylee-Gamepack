// What she made that stays (planning/around-the-world/canada-round-2.md, "Looks that stay"): the look she gave Misty
// in her bubble bath (fur colors, fluff, hairdo, decorations, the paw print on her team sweater) and what she put on
// each friend in the Team Cabin. Saved on this iPad and read by everyone who shows the team: the film cast
// (story/cast.ts), the map (map/world.ts), the rink and the big game (activities/party/), through
// characters/dress.ts. Pure data: no three.js, so sections and 2D code can import it.
//
// A link can carry Misty's look (`?look=`, sticky: kit/sections.ts keeps it from section to section), which wins over
// the saved one; test browsers start with nothing saved and get DEFAULT_MISTY where a look is needed.
import { savedKey } from '../../../sdk/hooks'

/** The three berry bushes: her paints. */
export const BERRIES = { pink: '#FF8FB8', blue: '#7FB2FF', purple: '#B48CF2' } as const
export type Berry = keyof typeof BERRIES
export const BERRY_IDS = Object.keys(BERRIES) as Berry[]

/** The parts of Misty she can rub (each holds its own mud, fluff and color). */
export const MISTY_ZONES = ['head', 'earL', 'earR', 'muzzle', 'chest', 'tummy', 'back', 'armL', 'armR', 'legL', 'legR'] as const
export type MistyZone = (typeof MISTY_ZONES)[number]

/** Her hairdo (the topknot and cheek tufts): how the comb left it. */
export const HAIR_STYLES = ['fluff', 'spikes', 'bangs', 'swoop'] as const
export type HairStyle = (typeof HAIR_STYLES)[number]

/** The things from the mossy log (the bath's one side verb), and where one can sit on her. */
export const DECOS = ['fern', 'flower', 'bow', 'crown'] as const
export type Deco = (typeof DECOS)[number]
export const DECO_SPOTS = ['crown', 'earL', 'earR', 'nose', 'chest'] as const
export type DecoSpot = (typeof DECO_SPOTS)[number]

export interface MistyLook {
  /** Berry color on each zone she painted: which berry, and how much (0..1). */
  fur: Partial<Record<MistyZone, { c: Berry; k: number }>>
  /** How fluffed up she is, 0 (sleek) .. 1 (a giant puffball). */
  puff: number
  hair: { style: HairStyle; color: Berry | null }
  /** What she wears from the mossy log, and where. */
  worn: { id: Deco; at: DecoSpot }[]
  /** The berry colors on the paw she pressed onto the sweater (none: a plain white print). */
  print: Berry[]
  /** She has her team sweater on (after the mirror). */
  sweater: boolean
}

/** The look for a link with a bare `look=`, a test browser and the review page: a little of everything. */
export const DEFAULT_MISTY: MistyLook = {
  fur: { earL: { c: 'pink', k: 1 }, earR: { c: 'pink', k: 1 }, tummy: { c: 'blue', k: 0.7 }, armR: { c: 'purple', k: 0.8 } },
  puff: 0.5,
  hair: { style: 'spikes', color: 'pink' },
  worn: [{ id: 'flower', at: 'earL' }],
  print: ['purple'],
  sweater: true,
}

/** The team in the cabin: Maple, the six friends, and Gus at the window. */
export const DRESSABLE = ['maple', 'tuque', 'monty', 'roxy', 'lulu', 'misty', 'ollie', 'gus'] as const
export type TeamId = (typeof DRESSABLE)[number]

export const JERSEYS = ['pink', 'red', 'blue', 'purple', 'mint'] as const
export const HATS = ['pompom', 'helmet', 'crown', 'flowers', 'antlers', 'chef'] as const
export const SCARVES = ['pink', 'red', 'blue', 'purple', 'mint'] as const
export const CHEEKS = ['leaf', 'heart', 'star'] as const
/** The cabin's colors (jerseys and scarves share them). */
export const WEAR_COLORS: Record<(typeof JERSEYS)[number], string> = { pink: '#FF8FB8', red: '#E8443F', blue: '#6FA8FF', purple: '#B48CF2', mint: '#8FE0C2' }

/** What one friend wears from the cabin (anything left out: nothing there; no scarf picked: the team's pink one). */
export interface Worn {
  jersey?: (typeof JERSEYS)[number]
  hat?: (typeof HATS)[number]
  scarf?: (typeof SCARVES)[number]
  cheek?: (typeof CHEEKS)[number]
}

export interface CanadaLooks {
  misty?: MistyLook
  team?: Partial<Record<TeamId, Worn>>
}

const KEY = 'canada-looks'

// ---- Misty's look in a link: `fur~puff~hair~worn~print~sweater`, e.g.
// `head.pink.8,tummy.blue.5~6~spikes.pink~fern.crown,bow.earL~pink.blue~1`. Anything it can't read is left out.
const has = <T extends string>(list: readonly T[], v: string | undefined): v is T => !!v && (list as readonly string[]).includes(v)

export function encodeMisty(l: MistyLook): string {
  const fur = MISTY_ZONES.filter((z) => l.fur[z])
    .map((z) => `${z}.${l.fur[z]!.c}.${Math.round(l.fur[z]!.k * 9)}`)
    .join(',')
  const hair = `${l.hair.style}${l.hair.color ? `.${l.hair.color}` : ''}`
  return [fur, Math.round(l.puff * 9), hair, l.worn.map((w) => `${w.id}.${w.at}`).join(','), l.print.join('.'), l.sweater ? 1 : 0].join('~')
}

export function parseMisty(text: string | null | undefined): MistyLook {
  if (!text) return DEFAULT_MISTY
  const [fur = '', puff = '0', hair = '', worn = '', print = '', sweater = '1'] = text.split('~')
  const look: MistyLook = { fur: {}, puff: Math.min(1, Math.max(0, (+puff || 0) / 9)), hair: { style: 'fluff', color: null }, worn: [], print: [], sweater: sweater !== '0' }
  for (const part of fur.split(',')) {
    const [z, c, k] = part.split('.')
    if (has(MISTY_ZONES, z) && has(BERRY_IDS, c)) look.fur[z] = { c, k: Math.min(1, Math.max(0.1, (+k || 9) / 9)) }
  }
  const [style, color] = hair.split('.')
  if (has(HAIR_STYLES, style)) look.hair = { style, color: has(BERRY_IDS, color) ? color : null }
  for (const part of worn.split(',')) {
    const [id, at] = part.split('.')
    if (has(DECOS, id) && has(DECO_SPOTS, at)) look.worn.push({ id, at })
  }
  for (const c of print.split('.')) if (has(BERRY_IDS, c) && look.print.length < 3) look.print.push(c)
  return look
}

// ---- The store.
let cache: CanadaLooks | null = null
const listeners = new Set<() => void>()

export function loadLooks(): CanadaLooks {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(savedKey(KEY))
    cache = raw ? (JSON.parse(raw) as CanadaLooks) : {}
  } catch {
    cache = {}
  }
  return cache
}
function store(next: CanadaLooks) {
  cache = next
  try {
    localStorage.setItem(savedKey(KEY), JSON.stringify(next))
  } catch {
    // Private mode or full storage: the look lasts until the app closes.
  }
  for (const f of listeners) f()
}
/** Hear about every change (a world that shows the team while the cabin is open). Returns the unsubscribe. */
export function onLooks(f: () => void) {
  listeners.add(f)
  return () => void listeners.delete(f)
}

/** The link's `look` param, if the address has one (a bare `look=` is DEFAULT_MISTY). */
function linkLook(): MistyLook | null {
  const q = new URLSearchParams(location.hash.split('?')[1] ?? '')
  return q.has('look') ? parseMisty(q.get('look')) : null
}

/** The look Misty wears everywhere outside her bath: the link's, else the saved one, else none yet (null: the plain
 *  white bear she is before her first bath). */
export const mistyLook = (): MistyLook | null => linkLook() ?? loadLooks().misty ?? null
/** Saves the look she was given (the bath, at the mirror and again at the sweater). */
export const saveMisty = (look: MistyLook) => store({ ...loadLooks(), misty: look })

/** What a friend wears from the cabin. */
export const wornBy = (who: TeamId): Worn => loadLooks().team?.[who] ?? {}
export const saveWorn = (who: TeamId, worn: Worn) => store({ ...loadLooks(), team: { ...loadLooks().team, [who]: worn } })

/** For QA and the start-over pill: nothing saved. */
export const forgetLooks = () => store({})

// Kaylee's own look (planning/around-the-world/thailand/wardrobe.html): what she picked in her wardrobe at Agong's, one
// thing per spot on her (a hat, glasses, wings or a cape, an outfit, shoes) and the color of her dress, her hair and her
// fur. Saved on the iPad (the wardrobe writes it with useSaved('thailand-look')), and any link can set it with
// `?look=crown,hearts,fairy,tutu,sneakers,dress-mint,hair-pink,fur-sky` (a sticky param, kit/sections.ts).
//
// Her look is a layer of its own: the game's costumes (Avatar.wear: the vet's scrubs, the packed sun hat) are another,
// and a costume takes only the spots it needs (avatar.ts's Dress).
//
// Pure data (no three.js): the closet (closet/) builds the things, model.ts paints the colors.
import { isHalloweenDay } from '../../../../shell/season'
import { savedKey } from '../../../../sdk/hooks'
import type { PaintColor, PaintPart } from '../../../engine3d/characters/look'
import { flag } from '../../../engine3d/flags'

export type { PaintColor, PaintPart } from '../../../engine3d/characters/look'

/** The spots on her a thing can take (one thing each). */
export type Slot = 'head' | 'face' | 'back' | 'outfit' | 'feet'
export const SLOTS: readonly Slot[] = ['head', 'face', 'back', 'outfit', 'feet']
/** What a pot of paint can change: where it's dropped decides which. */
export const PAINT_PARTS: readonly PaintPart[] = ['dress', 'hair', 'fur']

/** How she shows a thing off when it pops on (Avatar.showOff): a curtsy for the crown, a flutter hop for wings, a cool
 *  lean for sunglasses... */
export type ShowPose = 'curtsy' | 'wave' | 'twirl' | 'cute' | 'bunny' | 'paw' | 'cheer' | 'yeehaw' | 'peek' | 'cool' | 'flutter' | 'stomp'

export interface Item {
  id: string
  slot: Slot
  /** What it's called (button label, for Dad and for tests). */
  name: string
  /** Its main color (the drawer's swatch, the shelf). */
  color: string
  /** Her little show when it goes on. */
  pose: ShowPose
  /** A shady hat: it counts as a sun hat on a sunny trip (greybox 2's sun smarts). */
  shade?: boolean
  /** Available in the costume box on October 31. */
  halloween?: boolean
  /** Tinted glasses: they count as sunglasses. */
  tinted?: boolean
}

/** Everything in her wardrobe, drawer by drawer in the order they stand on the shelves (closet/ builds them). Ids are
 *  unique across slots, so a look is just a list of ids. Her striped dress isn't a thing: it's what she wears under
 *  everything (the paint changes its color). */
export const ITEMS: readonly Item[] = [
  { id: 'crown', slot: 'head', name: 'Crown', color: '#FFC83D', pose: 'curtsy' },
  { id: 'tiara', slot: 'head', name: 'Tiara', color: '#E9E4FF', pose: 'wave' },
  { id: 'orchid', slot: 'head', name: 'Orchid crown', color: '#C86BE0', pose: 'twirl' },
  { id: 'bow', slot: 'head', name: 'Big bow', color: '#FF4F9A', pose: 'cute' },
  { id: 'bunny', slot: 'head', name: 'Bunny ears', color: '#FFFFFF', pose: 'bunny' },
  { id: 'kitty', slot: 'head', name: 'Cat ears', color: '#5A4A66', pose: 'paw' },
  { id: 'cap', slot: 'head', name: 'Cap', color: '#8EC9F5', pose: 'cheer', shade: true },
  { id: 'cowboy', slot: 'head', name: 'Cowboy hat', color: '#FF8FB8', pose: 'yeehaw', shade: true },
  { id: 'bucket', slot: 'head', name: 'Bucket hat', color: '#FBE27A', pose: 'peek', shade: true },
  { id: 'sunhat', slot: 'head', name: 'Sun hat', color: '#FFE3A8', pose: 'cute', shade: true },
  { id: 'hearts', slot: 'face', name: 'Heart sunglasses', color: '#FF4F9A', pose: 'cool', tinted: true },
  { id: 'stars', slot: 'face', name: 'Star sunglasses', color: '#FFC83D', pose: 'cool', tinted: true },
  { id: 'round', slot: 'face', name: 'Round glasses', color: '#B9A6F5', pose: 'peek' },
  { id: 'fairy', slot: 'back', name: 'Fairy wings', color: '#C9F2E4', pose: 'flutter' },
  { id: 'wings', slot: 'back', name: 'Unicorn wings', color: '#FFC2DD', pose: 'flutter' },
  { id: 'cape', slot: 'back', name: 'Princess cape', color: '#B48CF0', pose: 'twirl' },
  { id: 'backpack', slot: 'back', name: 'Bunny backpack', color: '#FFD3E5', pose: 'bunny' },
  { id: 'tutu', slot: 'outfit', name: 'Tutu', color: '#D9CCFF', pose: 'twirl' },
  { id: 'gown', slot: 'outfit', name: 'Princess gown', color: '#FBEA9A', pose: 'curtsy' },
  { id: 'overalls', slot: 'outfit', name: 'Overalls', color: '#7FB2EE', pose: 'cheer' },
  { id: 'chut-thai', slot: 'outfit', name: 'Chut thai', color: '#C04FB0', pose: 'wave' },
  { id: 'sneakers', slot: 'feet', name: 'Light-up sneakers', color: '#FFFFFF', pose: 'stomp' },
  { id: 'party', slot: 'feet', name: 'Party shoes', color: '#C9B5F7', pose: 'twirl' },
  { id: 'boots', slot: 'feet', name: 'Rain boots', color: '#FF8FB8', pose: 'stomp' },
  { id: 'sandals', slot: 'feet', name: 'Sandals', color: '#8FE3C8', pose: 'bunny' },
]
/** A seasonal drawer of real 3D costumes, not replacements for her ordinary clothes. */
export const HALLOWEEN_ITEMS: readonly Item[] = [
  { id: 'halloween-witch-hat', slot: 'head', name: 'Witch hat', color: '#9670C7', pose: 'twirl', halloween: true },
  { id: 'halloween-leaf', slot: 'head', name: 'Pumpkin leaf hat', color: '#9DD58F', pose: 'cute', halloween: true },
  { id: 'halloween-antennae', slot: 'head', name: 'Bumblebee antennae', color: '#FBE27A', pose: 'bunny', halloween: true },
  { id: 'halloween-mask', slot: 'face', name: 'Superhero mask', color: '#8FE3C8', pose: 'cool', halloween: true },
  { id: 'halloween-bat-wings', slot: 'back', name: 'Bat wings', color: '#9B80C8', pose: 'flutter', halloween: true },
  { id: 'halloween-witch', slot: 'outfit', name: 'Witch costume', color: '#9670C7', pose: 'twirl', halloween: true },
  { id: 'halloween-pumpkin', slot: 'outfit', name: 'Pumpkin costume', color: '#FFAB67', pose: 'cute', halloween: true },
  { id: 'halloween-ghost', slot: 'outfit', name: 'Friendly ghost costume', color: '#FFF7EC', pose: 'peek', halloween: true },
  { id: 'halloween-skeleton', slot: 'outfit', name: 'Skeleton costume', color: '#68568D', pose: 'stomp', halloween: true },
  { id: 'halloween-hero', slot: 'outfit', name: 'Superhero costume', color: '#8EC9F5', pose: 'cheer', halloween: true },
  { id: 'halloween-bee', slot: 'outfit', name: 'Bumblebee costume', color: '#FBE27A', pose: 'flutter', halloween: true },
]
/** Tap an outfit for a complete costume, then mix accessories freely. The wand picks from the same sets. */
export const HALLOWEEN_LOOKS: Record<string, string> = {
  'halloween-witch': 'halloween-witch-hat,halloween-witch,party',
  'halloween-pumpkin': 'halloween-leaf,halloween-pumpkin,boots',
  'halloween-ghost': 'bow,halloween-ghost,party',
  'halloween-skeleton': 'halloween-bat-wings,halloween-skeleton,boots',
  'halloween-hero': 'halloween-mask,cape,halloween-hero,sneakers',
  'halloween-bee': 'halloween-antennae,fairy,halloween-bee,sandals',
}
/** Keep every item registered for saved photos and anchors, regardless of today's drawer. */
export const ALL_ITEMS = [...ITEMS, ...HALLOWEEN_ITEMS]
export function wardrobeItems(halloween = isHalloweenDay()): readonly Item[] {
  if (!halloween) return ITEMS
  return [...ITEMS.filter((i) => i.slot !== 'outfit' && (i.slot !== 'head' || ['kitty', 'crown', 'bow'].includes(i.id))), ...HALLOWEEN_ITEMS]
}
export const itemById = (id: string) => ALL_ITEMS.find((i) => i.id === id)

/** The pots of paint, in the order they stand in the paint drawer. Any pot works anywhere (brown fur is silly, and
 *  fine). `hsl` is what the recolor aims for: hue in degrees, saturation and lightness 0..1. */
export const PAINTS: Record<PaintColor, { name: string; hex: string; hsl: [number, number, number] }> = {
  pink: { name: 'Pink', hex: '#FF6FAE', hsl: [328, 0.84, 0.74] },
  lilac: { name: 'Lilac', hex: '#B79AF0', hsl: [268, 0.61, 0.71] },
  mint: { name: 'Mint', hex: '#8FE3C8', hsl: [160, 0.6, 0.7] },
  sky: { name: 'Sky', hex: '#8EC9F5', hsl: [206, 0.8, 0.74] },
  butter: { name: 'Butter', hex: '#FBE27A', hsl: [48, 0.92, 0.72] },
  peach: { name: 'Peach', hex: '#FFB08A', hsl: [20, 0.95, 0.77] },
  brown: { name: 'Brown', hex: '#7A4A2E', hsl: [22, 0.53, 0.3] },
  cream: { name: 'Cream', hex: '#FFF1DC', hsl: [36, 0.85, 0.9] },
}
export const PAINT_COLORS = Object.keys(PAINTS) as PaintColor[]

/** How she's modelled (kaylee.glb): a pink dress, brown hair, lilac fur. A drop of that pot brings it back. */
export const DEFAULT_PAINT: Record<PaintPart, PaintColor> = { dress: 'pink', hair: 'brown', fur: 'lilac' }

/** Her look: what's on each spot, and each color that isn't her own (missing = as modelled). */
export interface Style {
  v: 1
  on: Partial<Record<Slot, string>>
  paint: Partial<Record<PaintPart, PaintColor>>
}
/** Today's Kaylee: nothing on, her own colors. */
export const BARE: Style = { v: 1, on: {}, paint: {} }

/** The saved look's key (useSaved('thailand-look') writes it). */
export const LOOK_KEY = 'thailand-look'
export const lookKey = (halloween = isHalloweenDay()) => halloween ? 'thailand-halloween-look' : LOOK_KEY

/** The color of a part, her own if it isn't painted. */
export const paintOf = (s: Style, part: PaintPart): PaintColor => s.paint[part] ?? DEFAULT_PAINT[part]

/** Cleans up anything (a saved look from an older build, a hand-written link): unknown things and colors are dropped,
 *  so old saves keep working when the closet changes. */
export function normalize(raw: unknown): Style {
  const out: Style = { v: 1, on: {}, paint: {} }
  if (!raw || typeof raw !== 'object') return out
  const r = raw as { on?: Record<string, unknown>; paint?: Record<string, unknown> }
  for (const slot of SLOTS) {
    const id = r.on?.[slot]
    const item = typeof id === 'string' ? itemById(id) : undefined
    if (item && item.slot === slot && (!item.halloween || isHalloweenDay())) out.on[slot] = item.id
  }
  for (const part of PAINT_PARTS) {
    const c = r.paint?.[part]
    if (typeof c === 'string' && c in PAINTS && c !== DEFAULT_PAINT[part]) out.paint[part] = c as PaintColor
  }
  return out
}

/** `crown,hearts,dress-mint` → a look. */
export function parseLook(text: string): Style {
  const out: Style = { v: 1, on: {}, paint: {} }
  for (const word of text.split(',').map((w) => w.trim()).filter(Boolean)) {
    const item = itemById(word)
    if (item && (!item.halloween || isHalloweenDay())) {
      out.on[item.slot] = item.id
      continue
    }
    const [part, color] = word.split('-') as [PaintPart, PaintColor]
    if (PAINT_PARTS.includes(part) && color in PAINTS && color !== DEFAULT_PAINT[part]) out.paint[part] = color
  }
  return out
}

/** A look → `crown,hearts,dress-mint` (empty for today's Kaylee). */
export function formatLook(s: Style): string {
  const words: string[] = []
  for (const slot of SLOTS) if (s.on[slot]) words.push(s.on[slot]!)
  for (const part of PAINT_PARTS) if (s.paint[part]) words.push(`${part}-${s.paint[part]}`)
  return words.join(',')
}

export const sameLook = (a: Style, b: Style) => formatLook(a) === formatLook(b)

/** Puts a thing on (taking off whatever was on its spot), or takes it off. */
export function withItem(s: Style, id: string, on: boolean): Style {
  const item = itemById(id)
  if (!item) return s
  const next: Style = { v: 1, on: { ...s.on }, paint: { ...s.paint } }
  if (on) next.on[item.slot] = id
  else if (next.on[item.slot] === id) delete next.on[item.slot]
  return next
}

export function withPaint(s: Style, part: PaintPart, color: PaintColor): Style {
  const next: Style = { v: 1, on: { ...s.on }, paint: { ...s.paint } }
  if (color === DEFAULT_PAINT[part]) delete next.paint[part]
  else next.paint[part] = color
  return next
}

/** The saved look on this iPad (BARE if none, or if it can't be read). */
export function savedLook(): Style {
  try {
    const raw = localStorage.getItem(savedKey(lookKey()))
    return raw === null ? BARE : normalize(JSON.parse(raw))
  } catch {
    return BARE
  }
}

/** The look a scene dresses her in: the link's `look` (a bare `look=` is today's Kaylee), else the saved one. Test
 *  browsers start with nothing saved, so they get today's Kaylee. */
export function currentLook(): Style {
  const link = flag('look')
  // A Halloween link opened in November must not keep her in a costume (or its paint colors).
  if (link !== null && !isHalloweenDay() && link.split(',').some((id) => itemById(id.trim())?.halloween)) return savedLook()
  return link !== null ? parseLook(link) : savedLook()
}

/** Her colors in a drawn photo (the mall day's, the Nan trip's: trip/postcard.ts unicorn()), from her look when the
 *  photo is taken, so a photo on Agong's wall shows her as she was that day (it's saved as a picture, so changing her
 *  look later doesn't change it). Pastel like the rest of the drawing: her own lilac and pink unless she painted them. */
export function photoColors(s: Style = currentLook()): { fur: string; mane: string; dress: string } {
  const soft = (hex: string, k: number) => {
    const n = parseInt(hex.slice(1), 16)
    const mix = (c: number) => Math.round(c + (255 - c) * k)
    return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => mix(c).toString(16).padStart(2, '0')).join('')}`.toUpperCase()
  }
  return {
    fur: s.paint.fur ? soft(PAINTS[s.paint.fur].hex, 0.55) : '#E5DBFF',
    mane: s.paint.hair ? PAINTS[s.paint.hair].hex : '#FF8FB8',
    dress: s.paint.dress ? soft(PAINTS[s.paint.dress].hex, 0.3) : '#D9CCFF',
  }
}

// How each of Kaylee's family looks as a toy animal: Dad's picks from the lineup (2026-10-17: column A, so kids share
// their parent's animal, and Kaylee's lilac unicorn); later Dad made Jum a chubby pink elephant and Mommy a bit rounder,
// and gave the big cousins (Gan, Ken, BB) phones they never look up from. The concepts are in planning/around-the-world/thailand/lineup.webp;
// characters/animal.ts builds them in 3D. The vet's patients at HarborLand (a puppy, a pony, a baby elephant) are toy
// animals too (PATIENT_LOOKS). Pure data (no three.js).
export type Species = 'unicorn' | 'panda' | 'elephant' | 'fox' | 'buffalo' | 'penguin' | 'hornbill' | 'puppy' | 'pony'
export type Outfit = 'tee' | 'dress' | 'polo' | 'blouse' | 'shirt'
/** What Kaylee can wear on a trip, from her suitcase (or Mommy's spare sun hat if she packed none), or at HarborLand
 *  (the vet's blue scrubs and cap): Avatar.wear. */
export type Wearable = 'sunhat' | 'spare-hat' | 'sunglasses' | 'floaties' | 'scrubs' | 'scrub-cap'
export const WEARABLES: readonly Wearable[] = ['sunhat', 'spare-hat', 'sunglasses', 'floaties', 'scrubs', 'scrub-cap']
export type Extra = 'cane' | 'glasses' | 'moustache' | 'cap' | 'officer-cap' | 'round-glasses' | 'scarf' | 'bib' | 'pigtails' | 'tuft' | 'phone' | Wearable

export interface Look {
  species: Species
  /** Meters, to the top of the head (ears and horns stick up past it). Kaylee is 1.0. */
  height: number
  /** How round the body is (1 = the usual chibi build; Mommy 1.15, Jum 1.25). */
  chub?: number
  /** Main fur or feathers. */
  fur: string
  /** Muzzle, face, belly, paws: the light color. */
  light: string
  /** The second color: hooves, panda patches, penguin back, beak. */
  dark: string
  /** Inside the ears. */
  ear?: string
  /** Unicorn (or pony) mane and tail, in order. */
  mane?: string[]
  /** Unicorn mane length: short (Daddy), to the shoulders, or long and flowing (Mommy). */
  hair?: 'short' | 'medium' | 'long'
  outfit?: { kind: Outfit; color: string; shorts?: string }
  extras?: Extra[]
  /** Lashes on the eyes. */
  lashes?: boolean
  /** A big open happy mouth instead of a small smile. */
  open?: boolean
}

const FOX = { species: 'fox' as const, fur: '#FF9A4D', light: '#FFF1E2', dark: '#2B2330', ear: '#FFE6CC' }
const BUFFALO = { species: 'buffalo' as const, fur: '#94A0C8', light: '#DCD8EE', dark: '#4C4F6B', ear: '#FFB8CC' }
const PENGUIN = { species: 'penguin' as const, fur: '#3F365F', light: '#FFF6EC', dark: '#FFA640' }

export const LOOKS: Record<string, Look> = {
  kaylee: { species: 'unicorn', height: 1.0, fur: '#CDB9F6', light: '#F4EDFF', dark: '#A88EE8', ear: '#FFB3D1', mane: ['#FF6FAE', '#FBE27A', '#8FE3C8', '#8EC9F5'], hair: 'medium', outfit: { kind: 'dress', color: '#FF5FA2' }, lashes: true },
  ji: { species: 'unicorn', height: 1.55, chub: 1.15, fur: '#FFF5EF', light: '#FFE8E0', dark: '#BBA3F2', ear: '#FFC9D6', mane: ['#C7A6F2', '#FF9CC8', '#B494EE', '#FFB8D8'], hair: 'long', outfit: { kind: 'dress', color: '#FFB79E' }, lashes: true },
  nick: { species: 'unicorn', height: 1.7, fur: '#A9EBD6', light: '#E2FAF1', dark: '#9C86DA', ear: '#FFB3C7', mane: ['#8EC9F5', '#B9A6F5'], hair: 'short', outfit: { kind: 'polo', color: '#FBE78A' }, open: true },
  agong: { species: 'panda', height: 1.45, fur: '#FFF6EE', light: '#FFFDF8', dark: '#4A3F4F', ear: '#FFB3C7', outfit: { kind: 'shirt', color: '#FFF0DA' }, extras: ['glasses', 'moustache', 'cane'] },
  jum: { species: 'elephant', height: 1.5, chub: 1.25, fur: '#FFB3CF', light: '#FFE3EE', dark: '#F28CB3', ear: '#FF94BC', outfit: { kind: 'blouse', color: '#A7EBD0' }, lashes: true },
  joy: { ...FOX, height: 1.5, outfit: { kind: 'blouse', color: '#C9B5F7' }, lashes: true },
  gan: { ...FOX, height: 1.32, outfit: { kind: 'tee', color: '#8FC9F5', shorts: '#5D7BB0' }, extras: ['cap', 'phone'] },
  ken: { ...FOX, height: 1.25, outfit: { kind: 'tee', color: '#8FE3C8' }, extras: ['round-glasses', 'phone'] },
  bird: { ...BUFFALO, height: 1.65, outfit: { kind: 'tee', color: '#FFB896' } },
  bb: { ...BUFFALO, height: 1.2, outfit: { kind: 'dress', color: '#FF8FB8' }, extras: ['pigtails', 'phone'], lashes: true },
  ja: { ...PENGUIN, height: 1.45, extras: ['scarf'], lashes: true, open: true },
  putto: { ...PENGUIN, height: 1.0, outfit: { kind: 'tee', color: '#8FE3C8' }, extras: ['tuft'], open: true },
  putter: { ...PENGUIN, height: 0.78, fur: '#B9B4D6', extras: ['bib'] },
  sri: { species: 'hornbill', height: 1.5, fur: '#4A3F4F', light: '#FFF1DC', dark: '#FFB43C', outfit: { kind: 'blouse', color: '#C9B5F7' }, lashes: true },
}

/** The vet's patients (they don't talk: barks, whinnies, trumpets). A golden puppy with floppy ears, a caramel plush pony
 *  with a chocolate mane, and a baby elephant (Thailand's animal), grey-lilac and round. */
export const PATIENT_LOOKS = {
  puppy: { species: 'puppy', height: 0.9, chub: 1.1, fur: '#F4C47E', light: '#FFF1DC', dark: '#4A3640', ear: '#D99A55', open: true },
  pony: { species: 'pony', height: 0.98, fur: '#E9B486', light: '#FFF0E0', dark: '#8A5A4A', ear: '#FFC2C8', mane: ['#9A5E4E', '#B87A62'], hair: 'medium', lashes: true },
  elephant: { species: 'elephant', height: 0.92, chub: 1.25, fur: '#B9B3D6', light: '#E4E0F2', dark: '#9C95C4', ear: '#FFB8CC', lashes: true },
} as const satisfies Record<string, Look>

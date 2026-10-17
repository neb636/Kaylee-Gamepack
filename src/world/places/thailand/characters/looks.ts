// How each of Kaylee's family looks as a toy animal: Dad's picks from the lineup (2026-10-17: column A, so kids share
// their parent's animal, and Kaylee's lilac unicorn). The concepts are in planning/around-the-world/thailand/lineup.webp;
// characters/animal.ts builds them in 3D. Pure data (no three.js).
export type Species = 'unicorn' | 'panda' | 'bunny' | 'fox' | 'buffalo' | 'penguin' | 'hornbill'
export type Outfit = 'tee' | 'dress' | 'polo' | 'blouse' | 'shirt'
export type Extra = 'cane' | 'glasses' | 'moustache' | 'cap' | 'round-glasses' | 'scarf' | 'bib' | 'pigtails' | 'tuft'

export interface Look {
  species: Species
  /** Meters, to the top of the head (ears and horns stick up past it). Kaylee is 1.0. */
  height: number
  /** Main fur or feathers. */
  fur: string
  /** Muzzle, face, belly, paws: the light color. */
  light: string
  /** The second color: hooves, panda patches, penguin back, beak. */
  dark: string
  /** Inside the ears. */
  ear?: string
  /** Unicorn mane and tail, in order. */
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
  ji: { species: 'unicorn', height: 1.55, fur: '#FFF5EF', light: '#FFE8E0', dark: '#BBA3F2', ear: '#FFC9D6', mane: ['#C7A6F2', '#FF9CC8', '#B494EE', '#FFB8D8'], hair: 'long', outfit: { kind: 'dress', color: '#FFB79E' }, lashes: true },
  nick: { species: 'unicorn', height: 1.7, fur: '#A9EBD6', light: '#E2FAF1', dark: '#9C86DA', ear: '#FFB3C7', mane: ['#8EC9F5', '#B9A6F5'], hair: 'short', outfit: { kind: 'polo', color: '#FBE78A' }, open: true },
  agong: { species: 'panda', height: 1.45, fur: '#FFF6EE', light: '#FFFDF8', dark: '#4A3F4F', ear: '#FFB3C7', outfit: { kind: 'shirt', color: '#FFF0DA' }, extras: ['glasses', 'moustache', 'cane'] },
  jum: { species: 'bunny', height: 1.5, fur: '#FFB7A8', light: '#FFE7DD', dark: '#FF8FA8', ear: '#FF9DB4', outfit: { kind: 'blouse', color: '#A7EBD0' }, lashes: true },
  joy: { ...FOX, height: 1.5, outfit: { kind: 'blouse', color: '#C9B5F7' }, lashes: true },
  gun: { ...FOX, height: 1.32, outfit: { kind: 'tee', color: '#8FC9F5', shorts: '#5D7BB0' }, extras: ['cap'] },
  khane: { ...FOX, height: 1.25, outfit: { kind: 'tee', color: '#8FE3C8' }, extras: ['round-glasses'] },
  bert: { ...BUFFALO, height: 1.65, outfit: { kind: 'tee', color: '#FFB896' } },
  bibi: { ...BUFFALO, height: 1.2, outfit: { kind: 'dress', color: '#FF8FB8' }, extras: ['pigtails'], lashes: true },
  ja: { ...PENGUIN, height: 1.45, extras: ['scarf'], lashes: true, open: true },
  pato: { ...PENGUIN, height: 1.0, outfit: { kind: 'tee', color: '#8FE3C8' }, extras: ['tuft'], open: true },
  putter: { ...PENGUIN, height: 0.78, fur: '#B9B4D6', extras: ['bib'] },
  sri: { species: 'hornbill', height: 1.5, fur: '#4A3F4F', light: '#FFF1DC', dark: '#FFB43C', outfit: { kind: 'blouse', color: '#C9B5F7' }, lashes: true },
}

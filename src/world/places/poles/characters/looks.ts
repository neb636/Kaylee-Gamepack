// The Poles' friends as toy animals on the chibi rig (engine3d/characters/animal.ts): Pola the polar bear cub and Mama
// Bear up north, Pebble the emperor chick and Papa down south, and Terry the Arctic tern who visits both. Pure data (no
// three.js), so the 2D puppets and the character lab (#/world/characters) can read the same colors.
import type { Look } from '../../../engine3d/characters/look'

/** The colors the 3D looks and the 2D puppets (puppets/) share, so a friend is the same animal in both. */
export const POLES_COLORS = {
  bearFur: '#FFFFFF',
  bearMuzzle: '#FFF1DE',
  bearEar: '#FFB8CC',
  nose: '#2E2233',
  chickFluff: '#B9BFCB',
  chickCap: '#34344A',
  chickFace: '#FFFFFF',
  beakBlack: '#3A3A4A',
  emperorBack: '#2F3146',
  emperorGold: '#FFC34D',
  ternGrey: '#C9D1E0',
  ternWhite: '#FFFFFF',
  ternCap: '#2E2233',
  ternBeak: '#FF5A3C',
  adelieBlack: '#2A2B3D',
  adelieBeak: '#4A3A44',
} as const

const C = POLES_COLORS

export type PolesFriend = 'pola' | 'mama' | 'pebble' | 'papa' | 'terry' | 'adelie'

export const POLES_LOOKS: Record<PolesFriend, Look> = {
  /** Pola: a small, round, fluffy cub, happy mouth open. */
  pola: { species: 'polarbear', height: 0.9, chub: 1.12, fur: C.bearFur, light: C.bearMuzzle, dark: C.nose, ear: C.bearEar, open: true },
  mama: { species: 'polarbear', height: 1.45, chub: 1.18, fur: C.bearFur, light: C.bearMuzzle, dark: C.nose, ear: C.bearEar, lashes: true },
  /** Pebble: grey fluff under a black head with a white face, a tuft on top. */
  pebble: { species: 'penguin', height: 0.72, fur: C.chickFluff, light: C.chickFace, dark: C.beakBlack, cap: C.chickCap, extras: ['tuft'], open: true },
  /** Papa: an emperor, black back and head, white tummy and the gold patches beside his face. */
  papa: { species: 'penguin', height: 1.3, fur: C.emperorBack, light: C.chickFace, dark: C.beakBlack, ear: C.emperorGold },
  /** Terry: pale grey wings, white body and face, a black cap, red-orange beak and legs. */
  /** An Adélie (Penguin Slide's slope): small, all black on top with a white tummy and a white ring round each eye. */
  adelie: { species: 'penguin', height: 0.86, fur: C.adelieBlack, light: C.chickFace, dark: C.adelieBeak, extras: ['eye-ring'] },
  terry: { species: 'tern', height: 0.8, fur: C.ternGrey, light: C.ternWhite, dark: C.ternBeak, cap: C.ternCap, open: false },
}

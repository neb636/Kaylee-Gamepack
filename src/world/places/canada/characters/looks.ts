// Canada's friends as toy animals on the chibi rig (engine3d/characters/animal.ts): Maple the beaver, who travels with
// Kaylee ocean to ocean, the gentle moose who turns up at every stop (her hockey goalie), and the raccoon bandit of the
// campsite. Pure data (no three.js), so the 2D puppets (puppets/), the activities and the character lab
// (#/world/characters) read the same colors.
import type { Look } from '../../../engine3d/characters/look'

/** The colors the 3D looks and the 2D puppets share, so a friend is the same animal in both. */
export const CANADA_COLORS = {
  beaverFur: '#A8714A',
  beaverLight: '#E2B48A',
  beaverEar: '#F2A7A0',
  beaverTail: '#6E4B3B',
  beaverNose: '#4A2E26',
  teeth: '#FF9A3C',
  scarf: '#FF8FB8',
  mooseFur: '#8A5A3C',
  mooseLight: '#C79A72',
  mooseDark: '#4A3328',
  antler: '#E9D3A6',
  raccoonFur: '#9C97A8',
  raccoonLight: '#ECE8F0',
  raccoonDark: '#4A4458',
  ink: '#2E2233',
} as const

const C = CANADA_COLORS

export type CanadaFriend = 'maple' | 'cousin' | 'moose' | 'raccoon'

export const CANADA_LOOKS: Record<CanadaFriend, Look> = {
  /** Maple: a round, busy beaver girl in a pink scarf, happy mouth open over her orange teeth. */
  maple: { species: 'beaver', height: 0.85, chub: 1.12, fur: C.beaverFur, light: C.beaverLight, dark: C.beaverTail, ear: C.beaverEar, extras: ['scarf'], lashes: true },
  /** Maple's little cousin (Sugar Snow's orders): smaller, no scarf. */
  cousin: { species: 'beaver', height: 0.62, chub: 1.1, fur: '#B98257', light: C.beaverLight, dark: C.beaverTail, ear: C.beaverEar, open: true },
  /** The moose: a gentle giant, always chewing. */
  moose: { species: 'moose', height: 1.7, chub: 1.15, fur: C.mooseFur, light: C.mooseLight, dark: C.mooseDark, ear: C.mooseLight },
  /** The raccoon: a little bandit in a mask. */
  raccoon: { species: 'raccoon', height: 0.75, chub: 1.1, fur: C.raccoonFur, light: C.raccoonLight, dark: C.raccoonDark, ear: '#FFB8CC', open: true },
}

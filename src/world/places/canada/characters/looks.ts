// Maple's team as toy animals on the chibi rig (engine3d/characters/animal.ts): Maple the beaver (the captain), Monty
// the moose (the goalie), Roxy the raccoon (the quickest paws in Canada) and her kits, Ollie the sea otter (the
// spinner) and Misty the spirit bear (the big slap shot). The team's three friends the rig has no shape for are built
// by hand next door: Tuque the snowman (tuque.ts), Lulu the loon (lulu.ts) and Gus's geese (goose.ts).
// Pure data (no three.js), so the 2D puppets (puppets/), the activities, the films and the character lab
// (#/world/characters) read the same colors.
import type { Look } from '../../../engine3d/characters/look'

/** The colors the 3D looks and the 2D puppets share, so a friend is the same animal in both. */
export const CANADA_COLORS = {
  beaverFur: '#A8714A',
  beaverLight: '#E2B48A',
  beaverEar: '#F2A7A0',
  beaverTail: '#6E4B3B',
  beaverNose: '#4A2E26',
  /** Maple's front teeth: warm white (orange looked unappealing, 2026-11-21). */
  teeth: '#FFF6E6',
  /** Maple's scarf, and the team's: everybody on the team wears one. */
  scarf: '#FF8FB8',
  mooseFur: '#8A5A3C',
  mooseLight: '#C79A72',
  mooseDark: '#4A3328',
  antler: '#E9D3A6',
  raccoonFur: '#9C97A8',
  raccoonLight: '#F5F0F1',
  raccoonDark: '#4A4458',
  otterFur: '#6E5A58',
  otterLight: '#F6E8D4',
  otterDark: '#3A2E30',
  spiritFur: '#F7EFDF',
  spiritLight: '#FFFAF0',
  spiritDark: '#4A3C38',
  /** The geese's color (Gus's captain band, their sticks): the other team. */
  geese: '#6FA8FF',
  ink: '#2E2233',
} as const

const C = CANADA_COLORS

export type CanadaFriend = 'maple' | 'moose' | 'raccoon' | 'kit' | 'otter' | 'spirit'

export const CANADA_LOOKS: Record<CanadaFriend, Look> = {
  /** Maple: a round, busy beaver girl in a pink scarf, a big open grin with two white front teeth. */
  maple: { species: 'beaver', height: 0.85, chub: 1.12, fur: C.beaverFur, light: C.beaverLight, dark: C.beaverTail, ear: C.beaverEar, extras: ['scarf'], lashes: true },
  /** Monty the moose: a gentle giant, always chewing. He fills the whole net. */
  moose: { species: 'moose', height: 1.7, chub: 1.15, fur: C.mooseFur, light: C.mooseLight, dark: C.mooseDark, ear: C.mooseLight },
  /** Roxy the raccoon: a little bandit in a mask, a mama. */
  raccoon: { species: 'raccoon', height: 0.75, chub: 1.1, fur: C.raccoonFur, light: C.raccoonLight, dark: C.raccoonDark, lashes: true },
  /** One of Roxy's three kits: the team's fans. */
  kit: { species: 'raccoon', height: 0.42, chub: 1.15, fur: '#A9A4B6', light: C.raccoonLight, dark: C.raccoonDark },
  /** Ollie the sea otter: floats on her back, spins like a top. */
  otter: { species: 'sea-otter', height: 0.8, chub: 1.1, fur: C.otterFur, light: C.otterLight, dark: C.otterDark, ear: '#65504C' },
  /** Misty the spirit bear: a black bear born with cream-white fur, big and soft and a little shy. */
  spirit: { species: 'bear', height: 1.3, chub: 1.18, fur: C.spiritFur, light: C.spiritLight, dark: C.spiritDark, ear: '#F8C8C0', lashes: true, plainChest: true },
}

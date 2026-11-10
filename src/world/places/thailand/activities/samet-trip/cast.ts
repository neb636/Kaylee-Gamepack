// Koh Samet's islanders, on the shared chibi rig (engine3d/characters/animal.ts). Dad left the picks to us
// (2026-11-05: "you pick animals"), so each is an animal that really lives on or round the island:
//   - the jet ski man at Sai Kaew: a smooth-coated otter (Thailand's own, quick in the water), orange life vest,
//   - the boat captain (the speedboat from Ban Phe and the snorkel boat to Ko Kudi): a pelican in a navy captain's cap,
//   - the green taxi's driver: a sun bear in an island-green shirt,
//   - the fire dancers on Sai Kaew at night: two tokay geckos (the "tukkae" that calls its name after dark),
//   - the beach puppy who knows the way round the island (#357 way-finding): a cream beach dog in a pink bandana.
// Pure data (no three.js), so the character lab can list them.
import type { Look } from '../../../../engine3d/characters/look'

export const JETSKI_MAN: Look = { species: 'otter', height: 1.3, chub: 1.05, fur: '#9A6744', light: '#F4DFC4', dark: '#3B2A26', ear: '#6E4630', outfit: { kind: 'tee', color: '#FF8A2E', shorts: '#3F6FB8' }, extras: ['cap'], open: true }

export const CAPTAIN: Look = { species: 'pelican', height: 1.3, fur: '#FBF8F4', light: '#EDE6F2', dark: '#FFCDB8', ear: '#FFA94D', outfit: { kind: 'polo', color: '#4A6AB8', shorts: '#F2E6C8' }, extras: ['officer-cap'], open: true }

export const TAXI_DRIVER: Look = { species: 'bear', height: 1.3, chub: 1.1, fur: '#5B4A52', light: '#F2D49A', dark: '#3A2E34', ear: '#C9A0A8', outfit: { kind: 'shirt', color: '#5FC48A', shorts: '#3F6FB8' }, open: true }

export const FIRE_DANCERS: Look[] = [
  { species: 'gecko', height: 1.2, fur: '#86A8E8', light: '#E2ECFF', dark: '#3E5A8A', ear: '#FF9A3C', outfit: { kind: 'tee', color: '#FF7A45', shorts: '#7A3FA8' }, open: true },
  { species: 'gecko', height: 1.15, fur: '#7FD3B0', light: '#E4FAF0', dark: '#2F7A5E', ear: '#FF7FB0', outfit: { kind: 'tee', color: '#FFC83D', shorts: '#E8403F' }, open: true },
]

/** The beach puppy (#357 way-finding): a cream island dog with brown floppy ears and a pink bandana, smaller than
 *  Kaylee. He knows the way; his voice is barks. */
export const PUPPY: Look = { species: 'puppy', height: 0.7, chub: 1.05, fur: '#FFF1DC', light: '#FFFFFF', dark: '#3B2A26', ear: '#C98A55', extras: ['scarf'], open: true }

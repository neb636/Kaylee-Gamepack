// China's friends as toy animals on the chibi rig (engine3d/characters/animal.ts), for the 3D Dumpling House: Chef Fu
// the pig, Dou Dou the Pekingese puppy, and the friends who sit at his counter (Grandpa Turtle, the Bunny Twins, Mrs
// Goose, Bao Bao the panda) and Hou Hou the cheeky monkey. Colors follow the 2D puppets (puppets/), so a friend is the
// same animal in both. Pure data (no three.js), so the character lab (#/world/characters) reads it too.
import type { Look } from '../../../engine3d/characters/look'

export type ChinaFriend = 'cheffu' | 'doudou' | 'grandpa' | 'bunny' | 'bunny2' | 'goose' | 'baobao' | 'houhou'

export const CHINA_LOOKS: Record<ChinaFriend, Look> = {
  /** Chef Fu: a big, round, jolly pig in a cream chef's jacket, a peach apron and a tall white chef's hat. */
  cheffu: { species: 'pig', height: 1.25, chub: 1.3, fur: '#FDADA8', light: '#F99490', dark: '#6A3020', ear: '#F4968F', outfit: { kind: 'shirt', color: '#FAF1DC' }, extras: ['chef-hat', 'apron'], open: true },
  /** Dou Dou: a fluffy golden Pekingese puppy girl in a red vest. */
  doudou: { species: 'puppy', height: 0.7, chub: 1.1, fur: '#F3B676', light: '#FCE3C8', dark: '#6B3A1E', ear: '#E39A58', outfit: { kind: 'tee', color: '#D9473F' }, lashes: true, open: true },
  /** Grandpa Turtle: a slow, kind old turtle with a green shell, round glasses, a white moustache and a yellow vest. */
  grandpa: { species: 'tortoise', height: 0.85, chub: 1.1, fur: '#9CCB9A', light: '#D8EDC4', dark: '#5E9E73', ear: '#7FB58A', outfit: { kind: 'polo', color: '#F2C45A' }, extras: ['round-glasses', 'moustache'] },
  /** The Bunny Twins: two tiny peachy bunny sisters, one in pink with a pink bow, one in mint with a mint one. */
  bunny: { species: 'bunny', height: 0.6, chub: 1.05, fur: '#F8DDBF', light: '#FFF0DE', dark: '#F2B8A0', ear: '#FFA8BE', outfit: { kind: 'dress', color: '#FFB8CC' }, bow: '#FF8FB8', lashes: true, open: true },
  bunny2: { species: 'bunny', height: 0.6, chub: 1.05, fur: '#F8DDBF', light: '#FFF0DE', dark: '#F2B8A0', ear: '#FFA8BE', outfit: { kind: 'dress', color: '#B8EBD2' }, bow: '#6FD3A8', lashes: true, open: true },
  /** Mrs Goose: an elegant lady goose, lavender-white, with an orange bill and feet, a sun hat and her pearls. */
  goose: { species: 'goose', height: 0.95, chub: 1.05, fur: '#ECE8F8', light: '#FFFFFF', dark: '#FF9A3C', extras: ['spare-hat', 'pearls'], lashes: true },
  /** Bao Bao: a round baby panda girl with a pink bow, always hungry. */
  baobao: { species: 'panda', height: 0.8, chub: 1.2, fur: '#FDF1DC', light: '#FFFFFF', dark: '#45261A', ear: '#FFA3B8', bow: '#FFA3B8', lashes: true, open: true },
  /** Hou Hou: a cheeky golden snub-nosed monkey boy with a sky-blue face. */
  houhou: { species: 'monkey', height: 0.6, chub: 1, fur: '#FDA033', light: '#A6D9F7', dark: '#6B2E12', ear: '#FFE8C4', open: true },
}

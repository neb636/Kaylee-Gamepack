// Australia's puppets, for the puppet lab (#/world/puppets).
import { createElement } from 'react'
import type { PuppetEntry } from '../../../types'
import { L } from '../lines'
import { Chompy } from './Chompy'
import { Koko } from './Koko'
import { Mama, MAMA_POUCH } from './Mama'
import { Pip } from './Pip'

export const PUPPETS: PuppetEntry[] = [
  { id: 'pip', name: 'Pip', render: (ref, height) => createElement(Pip, { ref, height, wearing: { hat: true, glasses: true, water: true } }), actions: ['hop', 'cheer', 'wave', 'dance', 'wiggle', 'shake', 'fan'], lines: [...L.intro, L.outback.brrr, ...L.outback.count] },
  { id: 'pip-plain', name: 'Pip (no outfit)', render: (ref, height) => createElement(Pip, { ref, height }), actions: ['hop', 'cheer', 'wave'], lines: [L.outback.story] },
  { id: 'mama', name: 'Mama', render: (ref, height) => createElement(Mama, { ref, height }), actions: ['hop', 'cheer', 'dance', 'wave', 'hug'], lines: [L.outback.mama, L.party.mama] },
  { id: 'mama-pip', name: 'Mama + Pip in pouch', render: (ref, height) => createElement(Mama, { ref, height, pouch: createElement(Pip, { embed: MAMA_POUCH }) }), actions: ['hop', 'hug', 'dance'], lines: [L.outback.mama, L.outback.pouch] },
  { id: 'koko', name: 'Koko', render: (ref, height) => createElement(Koko, { ref, height }), actions: ['chew', 'yuck', 'yawn', 'cheer', 'dance', 'wiggle'], lines: [L.forest.story, L.forest.only, L.forest.yawn, ...L.forest.count] },
  { id: 'chompy', name: 'Chompy', render: (ref, height) => createElement(Chompy, { ref, height }), actions: ['snap', 'gulp', 'swim', 'cheer', 'dance', 'wiggle', 'nod'], lines: [...L.croc.story, ...L.croc.count, L.croc.gentle, ...L.tickle.chompy] },
  { id: 'chompy-babies', name: 'Chompy + babies', render: (ref, height) => createElement(Chompy, { ref, height, babies: 3 }), actions: ['swim', 'snap', 'dance'], lines: [L.party.chompy] },
  { id: 'chompy-mouth', name: 'Chompy carrying babies', render: (ref, height) => createElement(Chompy, { ref, height, inMouth: 3 }), actions: ['gulp', 'nod'], lines: [L.croc.gentle] },
  { id: 'koko-sleepy', name: 'Koko (asleep)', render: (ref, height) => createElement(Koko, { ref, height, sleepy: 1 }), actions: ['yawn'] },
]

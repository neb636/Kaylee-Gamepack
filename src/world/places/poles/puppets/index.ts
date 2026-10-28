// The Poles' puppets, for the puppet lab (#/world/puppets): the 2D friends, drawn to match their 3D toys
// (characters/looks.ts, #/world/characters/pola, pebble, terry). No voices yet (the full loop records them).
import { createElement } from 'react'
import type { PuppetEntry } from '../../../types'
import { Pebble } from './Pebble'
import { Pola } from './Pola'
import { Terry } from './Terry'

export const PUPPETS: PuppetEntry[] = [
  { id: 'pola', name: 'Pola', render: (ref, height) => createElement(Pola, { ref, height }), actions: ['hop', 'wave', 'cheer', 'wiggle', 'shake'] },
  { id: 'pola-wet', name: 'Pola (wet from the sea)', render: (ref, height) => createElement(Pola, { ref, height, wet: 1 }), actions: ['shake', 'hop'] },
  { id: 'pebble', name: 'Pebble', render: (ref, height) => createElement(Pebble, { ref, height }), actions: ['hop', 'flap', 'cheer', 'wiggle', 'waddle'] },
  { id: 'pebble-cold', name: 'Pebble (cold)', render: (ref, height) => createElement(Pebble, { ref, height, cold: 1 }), actions: ['flap', 'hop'] },
  { id: 'terry', name: 'Terry', render: (ref, height) => createElement(Terry, { ref, height }), actions: ['flap', 'hop', 'cheer', 'wiggle', 'bow'] },
  { id: 'terry-flying', name: 'Terry (flying)', render: (ref, height) => createElement(Terry, { ref, height, flying: true }), actions: ['cheer', 'wiggle'] },
]

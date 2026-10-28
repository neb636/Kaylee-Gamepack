// Canada's puppets, for the puppet lab (#/world/puppets): the 2D friends, drawn to match their 3D toys
// (characters/looks.ts, #/world/characters/maple). The 2D activities add their critters here.
import { createElement } from 'react'
import type { PuppetEntry } from '../../../types'
import { L } from '../lines'
import { Maple } from './Maple'

export const PUPPETS: PuppetEntry[] = [
  { id: 'maple', name: 'Maple', render: (ref, height) => createElement(Maple, { ref, height }), actions: ['hop', 'wave', 'cheer', 'wiggle', 'chomp', 'slap'], lines: [L.bonjour] },
]

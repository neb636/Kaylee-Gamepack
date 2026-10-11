// This activity's puppets, for the puppet lab (#/world/puppets); found automatically, so the shared code never lists them.
import { createElement } from 'react'
import type { PuppetEntry } from '../../../../types'
import { Tika, TIKA_ACTIONS } from '../../puppets/Tika'
import { L } from './lines'

const T = L.terraces

export const PUPPETS: PuppetEntry[] = [
  { id: 'tika', name: 'Tika the llama', render: (ref, height) => createElement(Tika, { ref, height }), actions: Object.keys(TIKA_ACTIONS), lines: [...T.story, ...T.wallDone, ...T.bomb, T.dance, T.innocent] },
  { id: 'tika-grin', name: 'Tika (photobomb grin)', render: (ref, height) => createElement(Tika, { ref, height, pose: 'grin' }), actions: Object.keys(TIKA_ACTIONS) },
  { id: 'tika-tongue', name: 'Tika (photobomb tongue)', render: (ref, height) => createElement(Tika, { ref, height, pose: 'tongue' }), actions: Object.keys(TIKA_ACTIONS) },
]

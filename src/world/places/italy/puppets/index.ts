// Italy's puppets, for the puppet lab (#/world/puppets).
import { createElement } from 'react'
import type { PuppetEntry } from '../../../types'
import { L } from '../lines'
import { Bruno, BRUNO_ACTIONS } from './Bruno'
import { Lupa, LUPA_ACTIONS } from './Lupa'
import { Spina, SPINA_ACTIONS } from './Spina'

const P = L.pizza

export const PUPPETS: PuppetEntry[] = [
  { id: 'lupa', name: 'Lupa', render: (ref, height) => createElement(Lupa, { ref, height }), actions: Object.keys(LUPA_ACTIONS), lines: [...L.intro, ...P.arrive, ...L.tickle.lupa] },
  { id: 'bruno', name: 'Zio Bruno', render: (ref, height) => createElement(Bruno, { ref, height }), actions: Object.keys(BRUNO_ACTIONS), lines: [P.hello, P.storyIntro, P.rush, P.hat, ...L.tickle.bruno] },
  { id: 'spina', name: 'Spina', render: (ref, height) => createElement(Spina, { ref, height }), actions: Object.keys(SPINA_ACTIONS), lines: [] },
  { id: 'spina-olives', name: 'Spina (olives)', render: (ref, height) => createElement(Spina, { ref, height, stuck: 4 }), actions: ['shake', 'puff', 'hop', 'dance'] },
]

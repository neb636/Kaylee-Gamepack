// Italy's puppets, for the puppet lab (#/world/puppets).
import { createElement } from 'react'
import type { PuppetEntry } from '../../../types'
import { L } from '../lines'
import { Bruno, BRUNO_ACTIONS } from './Bruno'
import { Lupa, LUPA_ACTIONS } from './Lupa'

const P = L.pizza

export const PUPPETS: PuppetEntry[] = [
  { id: 'lupa', name: 'Lupa', render: (ref, height) => createElement(Lupa, { ref, height }), actions: Object.keys(LUPA_ACTIONS), lines: [...L.intro, ...P.arrive, ...L.tickle.lupa] },
  { id: 'bruno', name: 'Zio Bruno', render: (ref, height) => createElement(Bruno, { ref, height }), actions: Object.keys(BRUNO_ACTIONS), lines: [P.hello, P.storyIntro, P.rush, P.hat, ...L.tickle.bruno] },
]

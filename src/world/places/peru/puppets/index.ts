import { createElement } from 'react'
import type { PuppetEntry } from '../../../types'
import { Luna, LUNA_ACTIONS } from './Luna'
import { L } from '../lines'
export const PUPPETS: PuppetEntry[] = [
  { id: 'peru-luna', name: 'Luna the alpaca', render: (ref, height) => createElement(Luna, { ref, height }), actions: LUNA_ACTIONS, lines: [L.intro[0], L.cozy.story, L.cozy.ready] },
  { id: 'peru-luna-cozy', name: 'Luna in her warm clothes', render: (ref, height) => createElement(Luna, { ref, height, hat: true, scarf: true, jacket: true, zipped: true }), actions: LUNA_ACTIONS, lines: [L.cozy.ready] },
]

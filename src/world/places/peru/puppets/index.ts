// Peru's puppets, for the puppet lab (#/world/puppets).
import { createElement } from 'react'
import type { PuppetEntry } from '../../../types'
import { L } from '../lines'
import { Alpaca, ALPACA_ACTIONS } from './Alpaca'
import { Tika, TIKA_ACTIONS } from './Tika'

const F = L.fluffy
const actions = Object.keys(ALPACA_ACTIONS)
const T = L.terraces

export const PUPPETS: PuppetEntry[] = [
  { id: 'luna', name: 'Luna the alpaca', render: (ref, height) => createElement(Alpaca, { ref, height, kind: 'luna' }), actions, lines: [...L.intro, ...F.story, F.see, F.chilly, ...L.tickle] },
  { id: 'luna-bangs', name: 'Luna (long fleece)', render: (ref, height) => createElement(Alpaca, { ref, height, kind: 'luna', bangs: true }), actions },
  { id: 'luna-hat', name: 'Luna (cold, pink hat)', render: (ref, height) => createElement(Alpaca, { ref, height, kind: 'luna', hat: 'pink', mustache: true }), actions, lines: [F.cozy.luna, F.photo] },
  { id: 'paco', name: 'Paco', render: (ref, height) => createElement(Alpaca, { ref, height, kind: 'paco', smooth: true }), actions, lines: [F.family[0], ...F.tickle, F.roll, F.doneCold.paco, F.cozy.paco] },
  { id: 'abuela', name: 'Abuela Killa', render: (ref, height) => createElement(Alpaca, { ref, height, kind: 'abuela', smooth: true }), actions, lines: [F.family[1], F.sleepy, F.snore, F.doneCold.abuela, F.cozy.abuela] },
  { id: 'abuela-asleep', name: 'Abuela Killa (asleep)', render: (ref, height) => createElement(Alpaca, { ref, height, kind: 'abuela', smooth: true, asleep: true }), actions },
  { id: 'tika', name: 'Tika the llama', render: (ref, height) => createElement(Tika, { ref, height }), actions: Object.keys(TIKA_ACTIONS), lines: [...T.story, ...T.wallDone, ...T.bomb, T.dance, T.innocent] },
  { id: 'tika-grin', name: 'Tika (photobomb grin)', render: (ref, height) => createElement(Tika, { ref, height, pose: 'grin' }), actions: Object.keys(TIKA_ACTIONS) },
  { id: 'tika-tongue', name: 'Tika (photobomb tongue)', render: (ref, height) => createElement(Tika, { ref, height, pose: 'tongue' }), actions: Object.keys(TIKA_ACTIONS) },
]

// Peru's puppets, for the puppet lab (#/world/puppets).
import { createElement } from 'react'
import type { PuppetEntry } from '../../../types'
import { L } from '../lines'
import { Alpaca, ALPACA_ACTIONS } from './Alpaca'
import { Rosa, ROSA_ACTIONS } from './Rosa'

const F = L.fluffy
const R = L.river
const actions = Object.keys(ALPACA_ACTIONS)

export const PUPPETS: PuppetEntry[] = [
  { id: 'luna', name: 'Luna the alpaca', render: (ref, height) => createElement(Alpaca, { ref, height, kind: 'luna' }), actions, lines: [...L.intro, ...F.story, F.see, F.chilly, ...L.tickle] },
  { id: 'luna-bangs', name: 'Luna (long fleece)', render: (ref, height) => createElement(Alpaca, { ref, height, kind: 'luna', bangs: true }), actions },
  { id: 'luna-hat', name: 'Luna (cold, pink hat)', render: (ref, height) => createElement(Alpaca, { ref, height, kind: 'luna', hat: 'pink', mustache: true }), actions, lines: [F.cozy.luna, F.photo] },
  { id: 'paco', name: 'Paco', render: (ref, height) => createElement(Alpaca, { ref, height, kind: 'paco', smooth: true }), actions, lines: [F.family[0], ...F.tickle, F.roll, F.doneCold.paco, F.cozy.paco] },
  { id: 'abuela', name: 'Abuela Killa', render: (ref, height) => createElement(Alpaca, { ref, height, kind: 'abuela', smooth: true }), actions, lines: [F.family[1], F.sleepy, F.snore, F.doneCold.abuela, F.cozy.abuela] },
  { id: 'abuela-asleep', name: 'Abuela Killa (asleep)', render: (ref, height) => createElement(Alpaca, { ref, height, kind: 'abuela', smooth: true, asleep: true }), actions },
  { id: 'rosa', name: 'Rosa the pink river dolphin', render: (ref, height) => createElement(Rosa, { ref, height }), actions: Object.keys(ROSA_ACTIONS), lines: [...R.story, R.more, R.lagoonGo, R.rainbow, ...R.spout, R.rosaTap] },
]

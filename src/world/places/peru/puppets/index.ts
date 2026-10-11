// Peru's puppets, for the puppet lab (#/world/puppets).
import { createElement } from 'react'
import type { PuppetEntry } from '../../../types'
import { L } from '../lines'
import { Alpaca, ALPACA_ACTIONS } from './Alpaca'
import { Chick, CHICK_ACTIONS, Condor, CONDOR_ACTIONS } from './Condor'
import { Rosa, ROSA_ACTIONS } from './Rosa'

const F = L.fluffy
const C = L.canyon
const R = L.river
const actions = Object.keys(ALPACA_ACTIONS)

export const PUPPETS: PuppetEntry[] = [
  { id: 'luna', name: 'Luna the alpaca', render: (ref, height) => createElement(Alpaca, { ref, height, kind: 'luna' }), actions, lines: [...L.intro, ...F.story, F.see, F.chilly, ...L.tickle] },
  { id: 'luna-bangs', name: 'Luna (long fleece)', render: (ref, height) => createElement(Alpaca, { ref, height, kind: 'luna', bangs: true }), actions },
  { id: 'luna-hat', name: 'Luna (cold, pink hat)', render: (ref, height) => createElement(Alpaca, { ref, height, kind: 'luna', hat: 'pink', mustache: true }), actions, lines: [F.cozy.luna, F.photo] },
  { id: 'paco', name: 'Paco', render: (ref, height) => createElement(Alpaca, { ref, height, kind: 'paco', smooth: true }), actions, lines: [F.family[0], ...F.tickle, F.roll, F.doneCold.paco, F.cozy.paco] },
  { id: 'abuela', name: 'Abuela Killa', render: (ref, height) => createElement(Alpaca, { ref, height, kind: 'abuela', smooth: true }), actions, lines: [F.family[1], F.sleepy, F.snore, F.doneCold.abuela, F.cozy.abuela] },
  { id: 'abuela-asleep', name: 'Abuela Killa (asleep)', render: (ref, height) => createElement(Alpaca, { ref, height, kind: 'abuela', smooth: true, asleep: true }), actions },
  { id: 'coco', name: 'Coco the condor', render: (ref, height) => createElement(Condor, { ref, height }), actions: Object.keys(CONDOR_ACTIONS), lines: [...C.story, C.upWeGo, C.needWarm, C.whoosh, C.sneeze, C.callPluma, C.condors, C.smile, C.proud] },
  { id: 'coco-lift', name: 'Coco (warm air)', render: (ref, height) => createElement(Condor, { ref, height, lift: 1 }), actions: Object.keys(CONDOR_ACTIONS) },
  { id: 'coco-dive', name: 'Coco (diving)', render: (ref, height) => createElement(Condor, { ref, height, tuck: 1 }), actions: Object.keys(CONDOR_ACTIONS) },
  { id: 'coco-trying', name: 'Coco (flapping hard)', render: (ref, height) => createElement(Condor, { ref, height, trying: true }), actions: Object.keys(CONDOR_ACTIONS) },
  { id: 'pluma', name: 'Pluma (in the nest)', render: (ref, height) => createElement(Chick, { ref, height, scared: true }), actions: Object.keys(CHICK_ACTIONS), lines: [C.scared, C.nestTap, C.pTry, C.wait, C.wheee, C.dizzy, C.falls, C.lookout, C.alone, C.lookMe] },
  { id: 'pluma-flying', name: 'Pluma (first flight)', render: (ref, height) => createElement(Chick, { ref, height, flying: true, confidence: 0 }), actions: Object.keys(CHICK_ACTIONS) },
  { id: 'pluma-gliding', name: 'Pluma (gliding)', render: (ref, height) => createElement(Chick, { ref, height, flying: true, confidence: 1 }), actions: Object.keys(CHICK_ACTIONS) },
  { id: 'rosa', name: 'Rosa the pink river dolphin', render: (ref, height) => createElement(Rosa, { ref, height }), actions: Object.keys(ROSA_ACTIONS), lines: [...R.story, R.more, R.lagoonGo, R.rainbow, ...R.spout, R.rosaTap] },
]

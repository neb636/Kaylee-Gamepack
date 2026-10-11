// This activity's puppets, for the puppet lab (#/world/puppets); found automatically, so the shared code never lists them.
import { createElement } from 'react'
import type { PuppetEntry } from '../../../../types'
import { Chick, CHICK_ACTIONS, Condor, CONDOR_ACTIONS } from '../../puppets/Condor'
import { L } from './lines'

const C = L.canyon

export const PUPPETS: PuppetEntry[] = [
  { id: 'coco', name: 'Coco the condor', render: (ref, height) => createElement(Condor, { ref, height }), actions: Object.keys(CONDOR_ACTIONS), lines: [...C.story, C.upWeGo, C.needWarm, C.whoosh, C.sneeze, C.callPluma, C.condors, C.smile, C.proud] },
  { id: 'coco-lift', name: 'Coco (warm air)', render: (ref, height) => createElement(Condor, { ref, height, lift: 1 }), actions: Object.keys(CONDOR_ACTIONS) },
  { id: 'coco-dive', name: 'Coco (diving)', render: (ref, height) => createElement(Condor, { ref, height, tuck: 1 }), actions: Object.keys(CONDOR_ACTIONS) },
  { id: 'coco-trying', name: 'Coco (flapping hard)', render: (ref, height) => createElement(Condor, { ref, height, trying: true }), actions: Object.keys(CONDOR_ACTIONS) },
  { id: 'pluma', name: 'Pluma (in the nest)', render: (ref, height) => createElement(Chick, { ref, height, scared: true }), actions: Object.keys(CHICK_ACTIONS), lines: [C.scared, C.nestTap, C.pTry, C.wait, C.wheee, C.dizzy, C.falls, C.lookout, C.alone, C.lookMe] },
  { id: 'pluma-flying', name: 'Pluma (first flight)', render: (ref, height) => createElement(Chick, { ref, height, flying: true, confidence: 0 }), actions: Object.keys(CHICK_ACTIONS) },
  { id: 'pluma-gliding', name: 'Pluma (gliding)', render: (ref, height) => createElement(Chick, { ref, height, flying: true, confidence: 1 }), actions: Object.keys(CHICK_ACTIONS) },
]

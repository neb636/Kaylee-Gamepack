// Italy's puppets, for the puppet lab (#/world/puppets).
import { createElement } from 'react'
import type { PuppetEntry } from '../../../types'
import { L } from '../lines'
import { Bruno, BRUNO_ACTIONS } from './Bruno'
import { Cesare, CESARE_ACTIONS } from './Cesare'
import { Civetta, CIVETTA_ACTIONS } from './Civetta'
import { Gino, GINO_ACTIONS } from './Gino'
import { Lupa, LUPA_ACTIONS } from './Lupa'
import { Spina, SPINA_ACTIONS } from './Spina'

const P = L.pizza

export const PUPPETS: PuppetEntry[] = [
  { id: 'lupa', name: 'Lupa', render: (ref, height) => createElement(Lupa, { ref, height }), actions: Object.keys(LUPA_ACTIONS), lines: [...L.intro, ...P.arrive, ...L.tickle.lupa] },
  { id: 'bruno', name: 'Zio Bruno', render: (ref, height) => createElement(Bruno, { ref, height }), actions: Object.keys(BRUNO_ACTIONS), lines: [P.hello, P.storyIntro, P.rush, P.hat, ...L.tickle.bruno] },
  { id: 'spina', name: 'Spina', render: (ref, height) => createElement(Spina, { ref, height }), actions: Object.keys(SPINA_ACTIONS), lines: [] },
  { id: 'cesare', name: 'Cesare', render: (ref, height) => createElement(Cesare, { ref, height }), actions: Object.keys(CESARE_ACTIONS), lines: [...L.colosseum.arrive, L.colosseum.hot, ...L.colosseum.call, L.colosseum.bow, ...L.tickle.cesare] },
  { id: 'civetta', name: 'Professoressa Civetta', render: (ref, height) => createElement(Civetta, { ref, height }), actions: Object.keys(CIVETTA_ACTIONS), lines: [...L.pisa.arrive, L.pisa.findOut, L.pisa.bells, ...L.tickle.civetta] },
  { id: 'civetta-hold', name: 'Civetta (holding)', render: (ref, height) => createElement(Civetta, { ref, height, hold: true }), actions: ['hoot', 'nod'] },
  { id: 'civetta-flying', name: 'Civetta (flying)', render: (ref, height) => createElement(Civetta, { ref, height, flying: true }), actions: ['hoot'] },
  { id: 'spina-olives', name: 'Spina (olives)', render: (ref, height) => createElement(Spina, { ref, height, stuck: 4 }), actions: ['shake', 'puff', 'hop', 'dance'] },
  { id: 'gino', name: 'Gino', render: (ref, height) => createElement(Gino, { ref, height }), actions: Object.keys(GINO_ACTIONS), lines: [...L.venice.arrive, L.venice.wheee, L.venice.dizzy, L.venice.hatBack, ...L.tickle.gino] },
  { id: 'gino-oar', name: 'Gino (rowing)', render: (ref, height) => createElement(Gino, { ref, height, oar: true, rowSpeed: 0.6 }), actions: Object.keys(GINO_ACTIONS) },
  { id: 'gino-singing', name: 'Gino (singing)', render: (ref, height) => createElement(Gino, { ref, height, oar: true, singing: true, rowSpeed: 1 }), actions: Object.keys(GINO_ACTIONS) },
  { id: 'gino-dizzy', name: 'Gino (dizzy, hat off)', render: (ref, height) => createElement(Gino, { ref, height, dizzy: true, hatOff: true }), actions: Object.keys(GINO_ACTIONS) },
  { id: 'gino-ducking', name: 'Gino (ducking)', render: (ref, height) => createElement(Gino, { ref, height, oar: true, ducking: true }), actions: Object.keys(GINO_ACTIONS) },
  { id: 'gino-accordion', name: 'Gino (accordion)', render: (ref, height) => createElement(Gino, { ref, height, accordion: true, singing: true }), actions: Object.keys(GINO_ACTIONS) },
]

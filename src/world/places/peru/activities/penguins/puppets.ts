// This activity's puppets, for the puppet lab (#/world/puppets); found automatically, so the shared code never lists them.
import { createElement } from 'react'
import type { PuppetEntry } from '../../../../types'
import { Chick, CHICK_ACTIONS } from '../../puppets/Chick'
import { Lobo, LOBO_ACTIONS } from '../../puppets/Lobo'
import { Penguin, PENGUIN_ACTIONS } from '../../puppets/Penguin'
import { L } from './lines'

const P = L.penguins

export const PUPPETS: PuppetEntry[] = [
  { id: 'pepa', name: 'Pepa the penguin', render: (ref, height) => createElement(Penguin, { ref, height, kind: 'pepa' }), actions: Object.keys(PENGUIN_ACTIONS), lines: [...P.story, ...P.orders, P.feed, ...P.yum, P.hatch, P.firstSwim, P.thanks, ...P.pepaTap] },
  { id: 'diver-chubby', name: 'Diver (chubby)', render: (ref, height) => createElement(Penguin, { ref, height, kind: 'chubby' }), actions: Object.keys(PENGUIN_ACTIONS), lines: [...P.wheee, P.whoa, P.blip, P.sock] },
  { id: 'diver-tiny', name: 'Diver (tiny)', render: (ref, height) => createElement(Penguin, { ref, height, kind: 'tiny' }), actions: Object.keys(PENGUIN_ACTIONS) },
  { id: 'diver-tuft', name: 'Diver (tuft)', render: (ref, height) => createElement(Penguin, { ref, height, kind: 'tuft' }), actions: Object.keys(PENGUIN_ACTIONS) },
  { id: 'chick', name: 'Penguin chick', render: (ref, height) => createElement(Chick, { ref, height }), actions: Object.keys(CHICK_ACTIONS) },
  { id: 'chick-round', name: 'Penguin chick (well fed)', render: (ref, height) => createElement(Chick, { ref, height, full: 1, tuft: 2 }), actions: Object.keys(CHICK_ACTIONS) },
  { id: 'lobo', name: 'Lobo the sea lion', render: (ref, height) => createElement(Lobo, { ref, height }), actions: Object.keys(LOBO_ACTIONS), lines: [...P.lobo, ...P.loboTap] },
  { id: 'lobo-seaweed', name: 'Lobo (seaweed hat)', render: (ref, height) => createElement(Lobo, { ref, height, seaweed: true }), actions: Object.keys(LOBO_ACTIONS) },
]

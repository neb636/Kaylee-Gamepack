// Peru's puppets, for the puppet lab (#/world/puppets).
import { createElement } from 'react'
import type { PuppetEntry } from '../../../types'
import { L } from '../lines'
import { Alpaca, ALPACA_ACTIONS } from './Alpaca'
import { Chick as PenguinChick, CHICK_ACTIONS as PENGUIN_CHICK_ACTIONS } from './Chick'
import { Lobo, LOBO_ACTIONS } from './Lobo'
import { Penguin, PENGUIN_ACTIONS } from './Penguin'
import { Rosa, ROSA_ACTIONS } from './Rosa'
import { Llama, LLAMA_COATS, Tika, TIKA_ACTIONS } from './Tika'

const F = L.fluffy
const R = L.river
const actions = Object.keys(ALPACA_ACTIONS)
const T = L.terraces
const P = L.penguins

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
  { id: 'llama-brown', name: "Tika's friend (brown)", render: (ref, height) => createElement(Llama, { ref, height, coat: LLAMA_COATS.brown }), actions: Object.keys(TIKA_ACTIONS) },
  { id: 'llama-grey', name: "Tika's friend (grey)", render: (ref, height) => createElement(Llama, { ref, height, coat: LLAMA_COATS.grey }), actions: Object.keys(TIKA_ACTIONS) },
  { id: 'llama-cria', name: "Tika's friend (the baby)", render: (ref, height) => createElement(Llama, { ref, height, coat: LLAMA_COATS.cria }), actions: Object.keys(TIKA_ACTIONS) },
  { id: 'pepa', name: 'Pepa the penguin', render: (ref, height) => createElement(Penguin, { ref, height, kind: 'pepa' }), actions: Object.keys(PENGUIN_ACTIONS), lines: [...P.story, ...P.orders, P.feed, ...P.yum, P.hatch, P.firstSwim, P.thanks, ...P.pepaTap] },
  { id: 'diver-chubby', name: 'Diver (chubby)', render: (ref, height) => createElement(Penguin, { ref, height, kind: 'chubby' }), actions: Object.keys(PENGUIN_ACTIONS), lines: [...P.wheee, P.whoa, P.blip, P.sock] },
  { id: 'diver-tiny', name: 'Diver (tiny)', render: (ref, height) => createElement(Penguin, { ref, height, kind: 'tiny' }), actions: Object.keys(PENGUIN_ACTIONS) },
  { id: 'diver-tuft', name: 'Diver (tuft)', render: (ref, height) => createElement(Penguin, { ref, height, kind: 'tuft' }), actions: Object.keys(PENGUIN_ACTIONS) },
  { id: 'chick', name: 'Penguin chick', render: (ref, height) => createElement(PenguinChick, { ref, height }), actions: Object.keys(PENGUIN_CHICK_ACTIONS) },
  { id: 'chick-round', name: 'Penguin chick (well fed)', render: (ref, height) => createElement(PenguinChick, { ref, height, full: 1, tuft: 2 }), actions: Object.keys(PENGUIN_CHICK_ACTIONS) },
  { id: 'lobo', name: 'Lobo the sea lion', render: (ref, height) => createElement(Lobo, { ref, height }), actions: Object.keys(LOBO_ACTIONS), lines: [...P.lobo, ...P.loboTap] },
  { id: 'lobo-seaweed', name: 'Lobo (seaweed hat)', render: (ref, height) => createElement(Lobo, { ref, height, seaweed: true }), actions: Object.keys(LOBO_ACTIONS) },
  { id: 'rosa', name: 'Rosa the pink river dolphin', render: (ref, height) => createElement(Rosa, { ref, height }), actions: Object.keys(ROSA_ACTIONS), lines: [...R.story, R.more, R.lagoonGo, R.rainbow, ...R.spout, R.rosaTap] },
]

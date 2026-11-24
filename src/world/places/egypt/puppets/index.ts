// Egypt's puppets, for the puppet lab (#/world/puppets).
import { createElement } from 'react'
import type { PuppetEntry } from '../../../types'
import { L } from '../lines'
import { Hippo } from './Hippo'
import { Jamal, JAMAL_ACTIONS } from './Jamal'
import { Miu, MIU_ACTIONS } from './Miu'
import { Sphinx, SPHINX_ACTIONS } from './Sphinx'
import { Tutu, TUTU_ACTIONS } from './Tutu'

export const PUPPETS: PuppetEntry[] = [
  { id: 'miu', name: 'Miu', render: (ref, height) => createElement(Miu, { ref, height }), actions: Object.keys(MIU_ACTIONS), lines: [...L.intro, ...L.tickle.miu, L.nile.green] },
  { id: 'miu-torch', name: 'Miu (torch)', render: (ref, height) => createElement(Miu, { ref, height, torch: true }), actions: ['pounce', 'wave', 'shake', 'cheer'], lines: [L.passage.story, L.passage.bat] },
  { id: 'jamal', name: 'Jamal', render: (ref, height) => createElement(Jamal, { ref, height }), actions: Object.keys(JAMAL_ACTIONS), lines: [L.pyramid.story, L.pyramid.tooBig, L.market.order, ...L.tickle.jamal] },
  { id: 'sphinx', name: 'The Sphinx', render: (ref, height) => createElement(Sphinx, { ref, height }), actions: Object.keys(SPHINX_ACTIONS), lines: [L.sphinx.sneeze, L.sphinx.hello, L.sphinx.nose] },
  { id: 'sphinx-asleep', name: 'The Sphinx (asleep)', render: (ref, height) => createElement(Sphinx, { ref, height, asleep: true }), actions: ['wake'] },
  { id: 'hippo', name: 'Hippo', render: (ref, height) => createElement(Hippo, { ref, height }), actions: ['jump', 'dance', 'wiggle', 'cheer', 'nod', 'spout', 'giggle'], lines: [L.nile.hello, L.nile.hippo, L.nile.thanks, L.show.hippo] },
  { id: 'hippo-swimming', name: 'Hippo (in the river)', render: (ref, height) => createElement(Hippo, { ref, height, swimming: true, lotus: true }), actions: ['dive', 'pop', 'spout', 'giggle', 'cheer'] },
  { id: 'hippo-crown', name: 'Hippo (lotus crown)', render: (ref, height) => createElement(Hippo, { ref, height, crown: true }), actions: ['cheer', 'dance'] },
  { id: 'tutu', name: 'Tutu', render: (ref, height) => createElement(Tutu, { ref, height }), actions: Object.keys(TUTU_ACTIONS), lines: [L.passage.tutu, L.passage.nap, L.show.tutu] },
  { id: 'tutu-asleep', name: 'Tutu (asleep)', render: (ref, height) => createElement(Tutu, { ref, height, asleep: true }), actions: ['yawn'] },
]

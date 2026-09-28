// China's puppets, for the puppet lab (#/world/puppets).
import { createElement } from 'react'
import type { PuppetEntry } from '../../../types'
import { L } from '../lines'
import { ChefFu, CHEFFU_ACTIONS } from './ChefFu'
import { DouDou, DOUDOU_ACTIONS } from './DouDou'
import { DumplingGrid } from './DumplingGrid'
import { Dumpling, DUMPLING_ACTIONS } from './Dumpling'

const D = L.dumplings

export const PUPPETS: PuppetEntry[] = [
  { id: 'doudou', name: 'Dou Dou', render: (ref, height) => createElement(DouDou, { ref, height }), actions: Object.keys(DOUDOU_ACTIONS), lines: [...D.arrive, D.teaPour, ...D.tickle.doudou] },
  { id: 'cheffu', name: 'Chef Fu', render: (ref, height) => createElement(ChefFu, { ref, height }), actions: Object.keys(CHEFFU_ACTIONS), lines: [D.aiyo, ...D.kneadCount, D.pleated, D.hat, ...D.tickle.cheffu] },
  { id: 'dumpling', name: 'Dumpling', render: (ref, height) => createElement(Dumpling, { ref, size: height, state: 'cooked', steam: true }), actions: Object.keys(DUMPLING_ACTIONS) },
  { id: 'dumpling-steaming', name: 'Dumpling (steaming)', render: (ref, height) => createElement(Dumpling, { ref, size: height, state: 'steaming', color: 'pink' }), actions: ['wobble', 'hop'] },
  { id: 'dumpling-grid', name: 'Every dumpling', render: (ref, height) => createElement(DumplingGrid, { ref, height }), actions: ['squish'] },
]

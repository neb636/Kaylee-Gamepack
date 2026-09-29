// China's puppets, for the puppet lab (#/world/puppets).
import { createElement } from 'react'
import type { PuppetEntry } from '../../../types'
import { L } from '../lines'
import { BaoBao, BAOBAO_ACTIONS } from './BaoBao'
import { ChefFu, CHEFFU_ACTIONS } from './ChefFu'
import { DouDou, DOUDOU_ACTIONS } from './DouDou'
import { Hong, HONG_ACTIONS } from './Hong'
import { LongLong, LONGLONG_ACTIONS } from './LongLong'
import { HouHou, HOUHOU_ACTIONS } from './HouHou'
import { Mouse, MOUSE_ACTIONS } from './Mouse'
import { DumplingGrid } from './DumplingGrid'
import { Dumpling, DUMPLING_ACTIONS } from './Dumpling'

const D = L.dumplings

export const PUPPETS: PuppetEntry[] = [
  { id: 'doudou', name: 'Dou Dou', render: (ref, height) => createElement(DouDou, { ref, height }), actions: Object.keys(DOUDOU_ACTIONS), lines: [...D.arrive, D.teaPour, ...D.tickle.doudou] },
  { id: 'cheffu', name: 'Chef Fu', render: (ref, height) => createElement(ChefFu, { ref, height }), actions: Object.keys(CHEFFU_ACTIONS), lines: [D.aiyo, ...D.kneadCount, D.pleated, D.hat, ...D.tickle.cheffu] },
  { id: 'hong', name: 'Hong', render: (ref, height) => createElement(Hong, { ref, height }), actions: Object.keys(HONG_ACTIONS), lines: [L.hotpot.bigBubbles, L.hotpot.tingle, ...L.hotpot.tap] },
  { id: 'longlong', name: 'Long Long', render: (ref, height) => createElement(LongLong, { ref, height }), actions: Object.keys(LONGLONG_ACTIONS), lines: [L.parade.arrive, L.parade.lap, L.parade.drumMid] },
  { id: 'houhou', name: 'Hou Hou', render: (ref, height) => createElement(HouHou, { ref, height }), actions: Object.keys(HOUHOU_ACTIONS), lines: [D.sorry] },
  { id: 'mouse', name: 'Tiny Mouse', render: (ref, height) => createElement(Mouse, { ref, height }), actions: Object.keys(MOUSE_ACTIONS), lines: [L.race.story[1], L.race.mouseWin, ...L.race.tap] },
  { id: 'baobao', name: 'Bao Bao', render: (ref, height) => createElement(BaoBao, { ref, height }), actions: Object.keys(BAOBAO_ACTIONS), lines: [L.dumplings.baoYum, ...L.dumplings.tickle.baobao] },
  { id: 'baobao-bamboo', name: 'Bao Bao (bamboo)', render: (ref, height) => createElement(BaoBao, { ref, height, bamboo: true }), actions: ['munch', 'sneeze', 'hop'] },
  { id: 'dumpling', name: 'Dumpling', render: (ref, height) => createElement(Dumpling, { ref, size: height, state: 'cooked', steam: true }), actions: Object.keys(DUMPLING_ACTIONS) },
  { id: 'dumpling-steaming', name: 'Dumpling (steaming)', render: (ref, height) => createElement(Dumpling, { ref, size: height, state: 'steaming', color: 'pink' }), actions: ['wobble', 'hop'] },
  { id: 'dumpling-grid', name: 'Every dumpling', render: (ref, height) => createElement(DumplingGrid, { ref, height }), actions: ['squish'] },
]

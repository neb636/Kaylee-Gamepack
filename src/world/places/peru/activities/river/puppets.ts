// This activity's puppets, for the puppet lab (#/world/puppets); found automatically, so the shared code never lists them.
import { createElement } from 'react'
import type { PuppetEntry } from '../../../../types'
import { Rosa, ROSA_ACTIONS } from '../../puppets/Rosa'
import { L } from './lines'

const R = L.river

export const PUPPETS: PuppetEntry[] = [
  { id: 'rosa', name: 'Rosa the pink river dolphin', render: (ref, height) => createElement(Rosa, { ref, height }), actions: Object.keys(ROSA_ACTIONS), lines: [...R.story, R.more, R.lagoonGo, R.rainbow, ...R.spout, R.rosaTap] },
]

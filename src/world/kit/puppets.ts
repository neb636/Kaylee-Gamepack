// Shared puppets for the lab (#/world/puppets). Sparkle and generic Buddy characters live in the SDK.
import { createElement } from 'react'
import { SPARKLE_ACTIONS, SparklePuppet } from '../../sdk'
import { WORLD_LINES } from '../lines'
import type { PuppetEntry } from '../types'

export const PUPPETS: PuppetEntry[] = [
  { id: 'sparkle', name: 'Sparkle', render: (ref, height) => createElement(SparklePuppet, { ref, height }), actions: SPARKLE_ACTIONS, lines: [WORLD_LINES.firstHello, WORLD_LINES.hello, WORLD_LINES.passport, ...WORLD_LINES.praise] },
  { id: 'sparkle-snorkel', name: 'Sparkle (snorkel)', render: (ref, height) => createElement(SparklePuppet, { ref, height, pose: 'snorkel' }), actions: ['cheer', 'wave', 'think'] },
]

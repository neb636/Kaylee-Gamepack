// Emperor Huddle on the Poles' globe: its spot, its sticker, and whether it's ready for Kaylee (meta.ts reads this, so each
// activity goes into the game in its own PR without touching the others). Loaded at startup: keep it pure data.
import type { ActivityInfo } from '../../../../types'
import { art } from '../../art'
import { L } from '../../lines'

export const READY = false
/** Which side of the globe its spot shows on. */
export const POLE = 'south' as const

const info: ActivityInfo = { id: 'huddle', name: 'Emperor Huddle', icon: '🥚', pos: { x: 70, y: 75 }, sticker: { name: 'Emperor chick', img: art.stickers.chick, fact: L.stickers.chick } }
export default info

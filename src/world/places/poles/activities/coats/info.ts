// Snow Coats on the Poles' globe: its spot, its sticker, and whether it's ready for Kaylee (meta.ts reads this, so each
// activity goes into the game in its own PR without touching the others). Loaded at startup: keep it pure data.
import type { ActivityInfo } from '../../../../types'
import { art } from '../../art'
import { L } from '../../lines'

export const READY = false
/** Which side of the globe its spot shows on. */
export const POLE = 'north' as const

const info: ActivityInfo = { id: 'coats', name: 'Snow Coats', icon: '🦊', pos: { x: 30, y: 25 }, sticker: { name: 'Arctic fox', img: art.stickers.fox, fact: L.stickers.fox } }
export default info

// Ice Floe Hop on the Poles' globe: its spot, its sticker, and whether it's ready for Kaylee (meta.ts reads this, so each
// activity goes into the game in its own PR without touching the others). Loaded at startup: keep it pure data.
import type { ActivityInfo } from '../../../../types'
import { art } from '../../art'
import { L } from '../../lines'

export const READY = false
/** Which side of the globe its spot shows on. */
export const POLE = 'north' as const

const info: ActivityInfo = { id: 'floe', name: 'Ice Floe Hop', icon: '🐻‍❄️', pos: { x: 50, y: 20 }, sticker: { name: 'Polar bear', img: art.stickers.bear, fact: L.stickers.bear } }
export default info

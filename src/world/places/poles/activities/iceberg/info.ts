// Iceberg Maker on the Poles' globe: its spot, its sticker, and whether it's ready for Kaylee (meta.ts reads this, so each
// activity goes into the game in its own PR without touching the others). Loaded at startup: keep it pure data.
import type { ActivityInfo } from '../../../../types'
import { art } from '../../art'
import { L } from '../../lines'

export const READY = true
/** Which side of the globe its spot shows on. */
export const POLE = 'both' as const

const info: ActivityInfo = { id: 'iceberg', name: 'Iceberg Maker', icon: '🧊', pos: { x: 75, y: 50 }, sticker: { name: 'Narwhal', img: art.stickers.narwhal, fact: L.stickers.narwhal } }
export default info

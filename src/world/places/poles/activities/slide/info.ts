// Penguin Slide on the Poles' globe: its spot, its sticker, and whether it's ready for Kaylee (meta.ts reads this, so each
// activity goes into the game in its own PR without touching the others). Loaded at startup: keep it pure data.
import type { ActivityInfo } from '../../../../types'
import { art } from '../../art'
import { L } from '../../lines'

export const READY = false
/** Which side of the globe its spot shows on. */
export const POLE = 'south' as const

const info: ActivityInfo = { id: 'slide', name: 'Penguin Slide', icon: '🐧', pos: { x: 50, y: 80 }, sticker: { name: 'Adelie penguin', img: art.stickers.adelie, fact: L.stickers.adelie } }
export default info

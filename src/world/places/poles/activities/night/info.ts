// The Longest Night (the Poles' ending) on the globe: its spot, its sticker, and whether it's ready for Kaylee (meta.ts
// reads this). It's home, the last picture on the trail, in the place of Emperor Huddle and the old finale: its stamp
// earns the emperor chick, then the trophy. Loaded at startup: keep it pure data.
import type { ActivityInfo } from '../../../../types'
import { art } from '../../art'
import { L } from '../../lines'

export const READY = true
/** Which side of the globe its spot shows on. */
export const POLE = 'south' as const

const info: ActivityInfo = { id: 'night', name: 'The Longest Night', icon: '🎶', pos: { x: 50, y: 85 }, sticker: { name: 'Emperor chick', img: art.stickers.chick, fact: L.stickers.chick } }
export default info

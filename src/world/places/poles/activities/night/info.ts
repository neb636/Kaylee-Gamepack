// The Longest Night (the Poles' new ending) on the globe: its spot, its sticker, and whether it's ready for Kaylee
// (meta.ts reads this). Not ready: it's being built act by act and opens from its links only. When it is, it takes
// the place of Emperor Huddle and the finale. Loaded at startup: keep it pure data.
import type { ActivityInfo } from '../../../../types'
import { art } from '../../art'
import { L } from '../../lines'

export const READY = false
/** Which side of the globe its spot shows on. */
export const POLE = 'south' as const

const info: ActivityInfo = { id: 'night', name: 'The Longest Night', icon: '🎶', pos: { x: 50, y: 85 }, sticker: { name: 'Emperor chick', img: art.stickers.chick, fact: L.stickers.chick } }
export default info

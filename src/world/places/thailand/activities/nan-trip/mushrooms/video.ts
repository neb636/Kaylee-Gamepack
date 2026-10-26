// The mushroom farm's video: real mushrooms growing, offered after the last slice is shared, before the end card. Not in
// Thailand's meta.videos yet: that would put a Theater button in Thailand's top bar before the trip is in the game.
// Its spoken intro reuses Sparkle's already-recorded "Mushrooms aren't plants! They love dark, wet places." (no new clip).
import type { PlaceVideo } from '../../../../../types'
import { L } from '../../../lines'

export const MUSHROOM_VIDEO: PlaceVideo = { id: 'mushrooms', youtubeId: '2fooP2ienR0', icon: '🍄', title: 'Mushrooms for kids', say: L.nan.trip.facts.mushrooms }

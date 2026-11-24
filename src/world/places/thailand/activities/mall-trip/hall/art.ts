// The mini games' pictures: the game shelf's hand-drawn icons (src/world/shelf/icons/thailand/<game>.svg), so the
// HarborLand map and her sock band show the same drawings as the shelf instead of emoji. As file URLs, never inlined.
import type { GameDoor } from './layout'

const icons = import.meta.glob<string>('../../../../../shelf/icons/thailand/*.svg', { eager: true, import: 'default', query: '?no-inline' })
const icon = (name: string): string => icons[`../../../../../shelf/icons/thailand/${name}.svg`]

/** Each mini game's shelf picture. */
export const GAME_ART = Object.fromEntries((['vet', 'cafe', 'barber', 'frame', 'race', 'mountain', 'blocks', 'boxing', 'skypod'] as const).map((id) => [id, icon(id)])) as Record<GameDoor, string>
/** HarborLand's own shelf picture (the map card's title). */
export const HALL_ART = icon('hall')

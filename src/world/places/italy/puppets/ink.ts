// Italy's line style (same as China's, see ../STYLE.md): the same warm brown outline as the generated art, so puppets sit in the scenes
// instead of looking pasted on. The technique (draw a group twice for one outline) and useInk are in world/kit/ink.ts.
import { inkStyle } from '../../../kit/ink'

export { useInk } from '../../../kit/ink'

export const INK = '#6E3B24'
/** Eyes, noses and mouths: a deeper brown than the outline, like the reference stickers. */
export const EYE = '#4A2616'
export const BLUSH = '#F9C4C0'
export const TONGUE = '#F28C8C'
/** Outline width outside the fills (viewBox units, for a ~400-unit-tall character). */
export const LINE = 5

/** `inkPass()` for the <g> of the ink copy; `line()` for thin details on top (pleats, creases, fur tufts). */
export const { inkPass, line } = inkStyle(INK, LINE, 0.7)

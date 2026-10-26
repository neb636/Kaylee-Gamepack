// The pictures on the wardrobe's door (wardrobe.html, gate 4): the mirror takes a picture of her look and pins it to the
// left door (up to 4, the oldest goes when a fifth comes). Drop a picture on her and she wears that whole look.
// Pure data (no three.js): the Hub saves it on the iPad.
import { formatLook, parseLook } from '../../../characters/style'

/** One picture: her look (`crown,hearts,dress-mint`) and the photo itself (a small JPEG data URL; a picture from a link
 *  has none yet: the wardrobe takes it when it opens). */
export interface DoorPhoto {
  look: string
  img?: string
}
export const DOOR_KEY = 'thailand-door'
export const DOOR_MAX = 4
/** The photo's size: a little portrait. */
export const DOOR_SIZE = { w: 240, h: 320 }

/** `crown,hearts;bow,fairy,dress-mint` (a link's `door`) → up to 4 pictures. */
export function parseDoor(text: string): DoorPhoto[] {
  return text
    .split(';')
    .map((w) => w.trim())
    .filter(Boolean)
    .slice(0, DOOR_MAX)
    .map((w) => ({ look: formatLook(parseLook(w)) }))
}

/** Anything saved that doesn't look like pictures is dropped. */
export function cleanDoor(raw: unknown): DoorPhoto[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((p): p is DoorPhoto => !!p && typeof p === 'object' && typeof (p as DoorPhoto).look === 'string')
    .slice(0, DOOR_MAX)
    .map((p) => ({ look: p.look, img: typeof p.img === 'string' && p.img.startsWith('data:image/') ? p.img : undefined }))
}

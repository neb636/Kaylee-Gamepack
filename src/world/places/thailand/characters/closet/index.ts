// Her own things from the wardrobe (style.ts), fitted to the modelled Kaylee's measured shape like model-wear.ts's
// costumes: one file per drawer. Greybox 1: 2-3 simple things per drawer in the house's toon look; gate 3 makes all ~30.
//
// Every hat stays under the tip of her horn (head-local y 0.56: kaylee.glb's horn tops out at 1.0 m, her head pivot is
// at 0.44), so every roof in the game that clears her horn clears her hats (the plan's horn rule; closetCheck below).
import { Box3, type Group } from 'three'
import type { Bag } from '../../engine/dispose'
import type { Worn } from '../animal'
import { itemById } from '../style'
import { buildBack } from './back'
import { buildFace } from './glasses'
import { buildHat } from './hats'
import { buildOutfit } from './outfits'
import { buildShoes } from './shoes'

/** Head-local height of the tip of her horn: hats stay under it. */
export const HORN_TIP = 0.56

export const none = (): Worn => ({ head: null, body: null, armL: null, armR: null, legL: null, legR: null })

/** Builds one of her things (null: not a closet thing). `armTilt` is model.ts's forward turn of her arms. */
export function buildClosetItem(id: string, bag: Bag, armTilt: number): Worn | null {
  const item = itemById(id)
  if (!item) return null
  void armTilt // nothing in greybox 1 rides on her arms
  if (item.slot === 'head') {
    const hat = buildHat(id, bag)
    // The horn rule, checked while building (npm run dev): a hat taller than her horn would poke through the roofs.
    if (import.meta.env.DEV && hatTop(hat) > HORN_TIP) console.warn(`closet: the ${id} is taller than Kaylee's horn (${hatTop(hat).toFixed(3)} > ${HORN_TIP})`)
    return { ...none(), head: hat }
  }
  if (item.slot === 'face') return { ...none(), head: buildFace(id, bag) }
  if (item.slot === 'back') return { ...none(), body: buildBack(id, bag) }
  if (item.slot === 'outfit') return { ...none(), body: buildOutfit(id, bag) }
  const [legL, legR] = buildShoes(id, bag)
  return { ...none(), legL, legR }
}

/** How far a hat tops out above her head pivot (meters, head-local), for the horn rule. */
export function hatTop(hat: Group): number {
  hat.updateMatrixWorld(true)
  return new Box3().setFromObject(hat).max.y
}

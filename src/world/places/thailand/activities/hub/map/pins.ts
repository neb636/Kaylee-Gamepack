// Who floats over each place on the Thailand map, so she can tell the places apart without reading: a friend she'll
// meet there, on the shared rig. The world bobs and squashes them like pins; here they wave, blink and look up at her.
import { Group } from 'three'
import { buildAnimal } from '../../../../../engine3d/characters/animal'
import type { Look } from '../../../../../engine3d/characters/look'
import type { Bag } from '../../../../../engine3d/dispose'
import { LOOKS, PATIENT_LOOKS } from '../../../characters/looks'
import { RIVAL_LOOKS } from '../../nan-trip/cup/rivals'
import { JETSKI_MAN } from '../../samet-trip/cast'
import type { PinId } from './geo'

export interface PinToy {
  root: Group
  /** How high the stamp rides over its feet, clear of the friend's face; the tap target's top is measured from it. */
  head: number
  /** How wide its tap target is (units). */
  wide: number
  /** `pitch`: how far the camera looks down (radians). */
  update(t: number, pitch: number): void
}

/** Who's at each place: Agong at his house, the baby elephant at Baan Chang, Moon the honey seller in Nan, the jet ski
 *  man on Koh Samet. */
const FRIENDS: Record<PinId, Look> = {
  bangkok: LOOKS.agong,
  krabi: PATIENT_LOOKS.elephant,
  nan: RIVAL_LOOKS.moon,
  samet: JETSKI_MAN,
}
const TALL = 1.3

export function buildPin(id: PinId, bag: Bag, phase: number): PinToy {
  const root = new Group()
  const rig = buildAnimal(FRIENDS[id], bag)
  rig.root.scale.setScalar(TALL / rig.height)
  root.add(rig.root)
  return {
    root,
    head: TALL * 1.22,
    wide: 1.25,
    update(t, pitch) {
      rig.armR.rotation.z = 2.5 + Math.sin(t * 8 + phase) * 0.32
      rig.armL.rotation.z = -0.25 + Math.sin(t * 2.2 + phase) * 0.08
      rig.head.rotation.x = -pitch * 0.5
      rig.head.rotation.z = Math.sin(t * 1.3 + phase) * 0.1
      rig.eyes.scale.y = (t + phase) % 3.4 < 0.13 ? 0.1 : 1
    },
  }
}

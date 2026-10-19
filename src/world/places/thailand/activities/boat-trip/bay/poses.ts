// Poses held on top of a character's usual life (breathing, blinking, hops): written onto their rig after their own
// update each frame (assigned, never added: a family member's update doesn't reset what it doesn't move). The Nail
// Island photo's four (wave, cheer, heart, silly: Kaylee picks one, Mommy and Daddy copy her), Kaylee's hands on the
// longtail's tiller, Daddy pointing, Mommy holding up her phone for a selfie.
// Arm pivots: rotation.x < 0 swings an arm forward; rotation.z > 0 lifts the right arm out and up (the left arm < 0).
import type { Rig } from '../../../characters/animal'
import type { PoseKind } from './part'

export const PHOTO_POSES: { id: PoseKind; icon: string; label: string }[] = [
  { id: 'wave', icon: '👋', label: 'Wave' },
  { id: 'cheer', icon: '🙌', label: 'Cheer' },
  { id: 'heart', icon: '🫶', label: 'Heart' },
  { id: 'silly', icon: '🤪', label: 'Silly' },
]

/** Writes the pose `kind`, `t` seconds in (`k` 0..1 eases it in), onto the rig. */
export function applyPose(rig: Rig, kind: PoseKind, t: number, k: number) {
  const { armL, armR, head, body, eyes } = rig
  const ease = k * k * (3 - 2 * k)
  const set = (xL: number, zL: number, xR: number, zR: number) => {
    armL.rotation.x += (xL - armL.rotation.x) * ease
    armL.rotation.z += (zL - armL.rotation.z) * ease
    armR.rotation.x += (xR - armR.rotation.x) * ease
    armR.rotation.z += (zR - armR.rotation.z) * ease
  }
  switch (kind) {
    case 'wave':
      set(0, -0.25, -0.2, 2.5 + Math.sin(t * 12) * 0.35)
      break
    case 'cheer':
      // Up and out (straight up, a chibi's short arms hide behind its big head), waving.
      set(-0.15, -2.15 + Math.sin(t * 9) * 0.15, -0.15, 2.15 - Math.sin(t * 9) * 0.15)
      break
    case 'heart':
      // Arms curved up round the sides like a big heart (and a heart floats over them, nail.ts).
      set(-0.7, -1.9, -0.7, 1.9)
      head.rotation.z = Math.sin(t * 3) * 0.08 * ease
      break
    case 'silly':
      set(-0.6, -0.9, 0, 1.7 + Math.sin(t * 10) * 0.2)
      body.rotation.z = 0.26 * ease
      head.rotation.z = -0.35 * ease
      eyes.scale.y = 1 - 0.65 * ease
      // Tongue out.
      if (!rig.open) {
        rig.talk.visible = true
        rig.mouth.visible = false
        rig.talk.scale.set(0.9, 0.75, 1)
      } else rig.mouth.scale.set(1.15, 1.6, 1)
      break
    case 'tiller':
      // Both hands on the tiller in front of her.
      set(-1.25, 0.4, -1.25, -0.4)
      break
    case 'point':
      set(0, -0.2, -1.55, 0.25)
      break
    case 'selfie':
      set(0, -0.2, -2.1, 0.55)
      head.rotation.z = 0.18 * ease
      break
    case 'broom':
      // Shaking a broom over the porch rail (the broom is in her right hand).
      set(-0.3, -0.3, -1.6 + Math.sin(t * 14) * 0.45, 0.4)
      break
  }
}

/** Back to the usual: arms down, nothing tilted. */
export function clearPose(rig: Rig) {
  rig.armL.rotation.set(0, 0, 0)
  rig.armR.rotation.set(0, 0, 0)
  rig.body.rotation.z = 0
  rig.head.rotation.z = 0
  rig.mouth.scale.set(1, 1, 1)
}

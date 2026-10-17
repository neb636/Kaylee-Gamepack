// What the house needs from any character, placeholder or (gate 2) the real animals, so they can be swapped in.
import type { Group } from 'three'

export type Pose = 'stand' | 'sit' | 'lie' | 'bounce' | 'wai' | 'peek' | 'lookup'

export interface Character {
  readonly id: string
  /** At her feet (or the seat); rotation.y is the way she faces. */
  readonly root: Group
  readonly height: number
  pose: Pose
  setPose(pose: Pose): void
  /** A short reaction: a happy hop, a wiggle. */
  react(kind: 'hop' | 'wiggle'): void
  /** Turn the head toward a world point (null: look ahead). */
  lookAt(x: number, y: number, z: number): void
  lookAway(): void
  update(dt: number, t: number): void
}

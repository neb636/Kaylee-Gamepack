// What every trip vehicle is: a toy model at the waterline (or on the road) facing +z, with seats for the family and
// the moving parts the drive animates. The world moves `root` (where it is, which way it faces); `body` inside it
// rolls, pitches, bobs and squashes.
import type { Group } from 'three'
import type { Feel } from '../../../../engine3d/drive'

export interface Seat {
  /** Local to `body`, meters. */
  x: number
  y: number
  z: number
  /** Stands there (Kaylee at the longtail's tiller) instead of sitting. */
  stand?: boolean
}

export interface Vehicle {
  root: Group
  body: Group
  /** Who sits where, in order: Kaylee, Mommy, Daddy. */
  seats: { kaylee: Seat; ji: Seat; nick: Seat }
  /** Along its length (local z), the centers of the circles that bump into things, and their radius. */
  hull: { at: number[]; r: number }
  /** How it drives (engine3d/drive.ts). */
  feel: Feel
  /** Where the spray and the wake come off (local z): the propeller, or the stern. */
  stern: number
  bow: number
  /** Animates its moving parts: `steer` -1..1 (left..right), `speed` 0..1 of its top speed, `t` seconds. */
  animate(steer: number, speed: number, t: number, dt: number): void
}

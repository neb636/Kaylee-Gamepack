// What the bay's parts share (the pier, the open water, the village, the cave and hong, the Nail Island, the sunset):
// each builds its own things into the bay's scene, puts its tap targets over them, reacts to taps and bumps, and plays
// its moments. The core (bay.ts) owns the boats, the family in them, the driving and the camera; every part gets the
// Bay itself to reach them.
import type { PerspectiveCamera, Vector3 } from 'three'
import type { Line } from '../../../../../../sdk'
import type { Avatar } from '../../../characters/avatar'
import type { Shot } from '../../../../../engine3d/camera'
import type { Member } from '../../../characters/member'
import type { Driver } from '../../../../../engine3d/drive'
import type { Vehicle } from '../../../trip/vehicles/vehicle'
import type { BoatSection } from '../sections'
import type { Rock } from './layout'

export type RiderId = 'kaylee' | 'ji' | 'nick'
export type Pose3 = 'sit' | 'stand' | 'lie'
/** What the core is doing: the family getting in at the pier, driving, swapping boats, on the beach, on the pier. */
export type Phase = 'board' | 'drive' | 'swap' | 'beach' | 'docked'
/** The stops she can visit (the `stops` param; `race` = she has won the boat race, the trophy rides in the boat). */
export type Stop = 'village' | 'cave' | 'race'
/** The photos that drop into the album by themselves (the `photos` param), and Mommy's selfies; Baan Chang's pose photo
 *  at the sign wall (`sign`) and Daddy's photo of the splash (`chang`). */
export type PhotoKind = 'village' | 'hong' | 'nail' | 'selfie' | 'race' | 'sign' | 'chang'
/** Poses for the Nail Island photo (and Kaylee's tiller, Daddy pointing, Mommy's selfie arm). */
export type PoseKind = 'wave' | 'cheer' | 'heart' | 'silly' | 'tiller' | 'point' | 'selfie' | 'broom'

export interface Rider {
  id: RiderId
  char: Avatar | Member
  height: number
  lying: boolean
  /** Lying under a roof too low to sit up: once it's high again, they sit up by themselves. */
  under: boolean
  /** Seconds the roof has been high enough to sit up again. */
  upT: number
  /** The roof ahead is lower than their horn (their tap target glows: "lie down!"). */
  warn: boolean
  /** A pose held on top of their usual life, and for how long (seconds; Infinity = until cleared). */
  pose: { kind: PoseKind; t: number; until: number } | null
}

export interface Ride {
  v: Vehicle
  d: Driver
  roll: { x: number; v: number }
  pitch: { x: number; v: number }
  /** 0 = just squashed (a bonk, a landing), 1 = settled. */
  squash: number
  travelled: number
}

/** A tap target over a thing: where (world), how big (meters), glowing ("tap me!"), the biggest it may get on screen,
 *  and its priority where targets overlap (small toys 3, things 2, people 0). */
export interface Spot {
  at: Vector3
  r: number
  glow?: boolean
  max?: number
  prio?: number
}

/** A bump: a circle [x, z, r], or a box [x, z, half x, half z]. */
export type Circle = [number, number, number]
export type Box = [number, number, number, number]

export interface BayPart {
  /** Its tap targets now (null: hidden). */
  anchorAt(id: string): Spot | null
  /** A tap on one of its targets: true if it handled it. */
  tap(id: string): boolean
  update(dt: number, t: number): void
  /** Its bumps near (x, z). */
  bumps?(x: number, z: number, circles: Circle[], boxes: Box[]): void
  /** The boat bonked something here (a rock, a house). */
  bonked?(x: number, z: number, hit: number): void
  /** Where a "do this" finger points after a while with nothing touched (null: nothing here). */
  hint?(): Vector3 | null
  /** Sparkle's hint for what to do now (after a while with nothing done), if this part has one. */
  stuckLine?(): Line | null
  /** The camera for one of its photos, after staging the scene for it (a deep link's album). */
  photoCamera?(kind: PhotoKind, staged: boolean): PerspectiveCamera | null
  /** It's taking charge of the camera (a close-up), or null. */
  shot?(): Shot | null
  /** It's the part in charge of the section (the core asks each in turn; first answer wins). */
  sectionNow?(): BoatSection | null
  /** Its rock towers (the chase camera keeps out of them, a tap's way goes round them). */
  towers?(): Rock[]
}

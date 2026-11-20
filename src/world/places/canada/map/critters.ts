// The animals on the Canada map who aren't on the team, there to poke: a polar bear on an Arctic island (the chibi rig,
// like the cast, so he can wave), a bison on the prairie who rolls in the dust, a beluga in Hudson Bay, an orca out on
// the Pacific, and the ice floes drifting in the north. Hand-built toys face +z with their moving parts in their own
// groups; world.ts brings them to life.
import { Group } from 'three'
import type { Bag } from '../../../engine3d/dispose'
import { FilmActor } from '../../../engine3d/characters/actor'
import { merge, P, solid } from '../../../engine3d/geo'

const INK = '#2E2233'

const eyes = (x: number, y: number, z: number, r: number) => [P.sphere(r, INK, { at: [x, y, z] }, 6), P.sphere(r, INK, { at: [-x, y, z] }, 6)]

/** The polar bear (a waving chibi, like the friends). */
export const polarBear = (bag: Bag, height = 0.62) => new FilmActor({ species: 'polarbear', height: 1, chub: 1.2, fur: '#FFFFFF', light: '#FFFFFF', dark: '#3A3340', ear: '#F2E4DC' }, bag, { height })

export interface Bison {
  root: Group
  /** Rolls over in the dust. */
  body: Group
  head: Group
}

/** A bison: a big shaggy hump, a beard, little curved horns, four short legs. About 0.5 tall. */
export function bison(bag: Bag): Bison {
  const root = new Group()
  const body = new Group()
  const head = new Group()
  const BROWN = '#7A5240'
  const SHAG = '#9C6A4E'
  body.add(
    solid(
      merge([
        P.sphere(0.2, BROWN, { at: [0, 0.27, -0.06], scale: [0.85, 0.85, 1.25] }, 14),
        P.sphere(0.21, SHAG, { at: [0, 0.34, 0.12], scale: [0.95, 1.0, 0.9] }, 14),
        P.cone(0.04, 0.09, BROWN, { at: [0, 0.27, -0.33], rot: [-1.9, 0, 0] }, 5),
        ...[[-0.1, 0.12], [0.1, 0.12], [-0.09, -0.18], [0.09, -0.18]].map(([x, z]) => P.cyl(0.035, 0.03, 0.17, '#5A3A2E', { at: [x, 0.085, z] }, 6)),
      ]),
      bag,
      1.5,
    ),
  )
  head.position.set(0, 0.3, 0.27)
  head.add(
    solid(
      merge([
        P.sphere(0.12, '#5E3E30', { scale: [1, 0.95, 1.05] }, 12),
        P.sphere(0.07, SHAG, { at: [0, 0.07, -0.02], scale: [1.4, 0.8, 1] }, 10),
        P.sphere(0.06, '#4A2F26', { at: [0, -0.04, 0.09], scale: [1, 0.8, 0.9] }, 10),
        P.cone(0.045, 0.1, SHAG, { at: [0, -0.13, 0.03], rot: [Math.PI, 0, 0] }, 6),
        ...[-1, 1].map((s) => P.cone(0.022, 0.08, '#F3E3C4', { at: [s * 0.12, 0.07, 0], rot: [0, 0, s * -1.0] }, 6)),
        ...eyes(0.06, 0.02, 0.09, 0.016),
      ]),
      bag,
      1.5,
    ),
  )
  body.add(head)
  root.add(body)
  return { root, body, head }
}

export interface Swimmer {
  root: Group
  body: Group
  tail: Group
}

/** A beluga: a round white whale with a big melon head and a smile. */
export function beluga(bag: Bag): Swimmer {
  const root = new Group()
  const body = new Group()
  const tail = new Group()
  body.add(
    solid(
      merge([
        P.sphere(0.16, '#F7F9FF', { scale: [0.85, 0.7, 1.6] }, 14),
        P.sphere(0.12, '#FFFFFF', { at: [0, 0.04, 0.2], scale: [1, 0.9, 1] }, 12),
        ...[-1, 1].map((s) => P.sphere(0.05, '#E9EEFA', { at: [s * 0.13, -0.05, 0.08], scale: [1.2, 0.3, 0.8] }, 8)),
        ...eyes(0.07, 0.05, 0.27, 0.014),
        P.torus(0.035, 0.007, '#C9A8C8', { at: [0, -0.01, 0.31], rot: [0.2, 0, Math.PI] }, Math.PI),
      ]),
      bag,
      1.5,
    ),
  )
  tail.position.set(0, 0, -0.24)
  tail.add(solid(merge([-1, 1].map((s) => P.sphere(0.07, '#EEF2FC', { at: [s * 0.06, 0, -0.04], scale: [1, 0.22, 0.6] }, 8))), bag, 1.4))
  body.add(tail)
  root.add(body)
  return { root, body, tail }
}

/** An orca: black, white eye patches and belly, a tall fin. */
export function orca(bag: Bag): Swimmer {
  const root = new Group()
  const body = new Group()
  const tail = new Group()
  body.add(
    solid(
      merge([
        P.sphere(0.18, '#2B2638', { scale: [0.8, 0.7, 1.8] }, 14),
        P.sphere(0.15, '#FFFFFF', { at: [0, -0.05, 0.08], scale: [0.7, 0.45, 1.6] }, 12),
        ...[-1, 1].map((s) => P.sphere(0.04, '#FFFFFF', { at: [s * 0.12, 0.05, 0.16], scale: [0.5, 0.6, 1.2] }, 8)),
        P.cone(0.06, 0.24, '#2B2638', { at: [0, 0.2, -0.04], rot: [-0.25, 0, 0], scale: [0.35, 1, 1] }, 8),
        ...eyes(0.09, 0.07, 0.24, 0.012),
      ]),
      bag,
      1.5,
    ),
  )
  tail.position.set(0, 0, -0.3)
  tail.add(solid(merge([-1, 1].map((s) => P.sphere(0.08, '#2B2638', { at: [s * 0.07, 0, -0.04], scale: [1, 0.2, 0.55] }, 8))), bag, 1.4))
  body.add(tail)
  root.add(body)
  return { root, body, tail }
}

/** An ice floe: a flat white slab with a lavender side, `r` across. */
export const floe = (bag: Bag, r: number, seed: number) =>
  solid(
    merge([
      P.cyl(r, r * 1.05, 0.05, '#E7E9FB', { at: [0, 0.0, 0], scale: [1, 1, 0.7 + (seed % 3) * 0.1] }, 7),
      P.cyl(r * 0.96, r * 0.96, 0.02, '#FFFFFF', { at: [0, 0.03, 0], scale: [1, 1, 0.7 + (seed % 3) * 0.1] }, 7),
    ]),
    bag,
    1.1,
  )

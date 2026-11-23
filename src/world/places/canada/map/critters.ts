// The animals on the Canada map who aren't on the team, there to poke: a snowy owl on an Arctic island who turns her
// head right round and hoots, a bison on the prairie who rolls in the dust, a beluga in Hudson Bay, an orca out on the
// Pacific, and the ice floes drifting in the north. They're smaller and quieter than the friends (who are big, face the
// camera and wear a heart pin or the team's scarf), so nobody takes one for a friend. Hand-built toys face +z with their
// moving parts in their own groups; world.ts brings them to life.
import { Group } from 'three'
import type { Bag } from '../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../engine3d/geo'
import { LINE } from './shape'

const INK = '#2E2233'

const eyes = (x: number, y: number, z: number, r: number) => [P.sphere(r, INK, { at: [x, y, z] }, 6), P.sphere(r, INK, { at: [-x, y, z] }, 6)]

export interface Owl {
  root: Group
  /** Turns right round when she pokes it. */
  head: Group
  wings: Group[]
}

/** A few black flecks on a snowy owl's white feathers, on a patch facing +z. */
const flecks = (cx: number, cy: number, cz: number, rx: number, ry: number, n: number, seed: number) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i * 2.39996 + seed) % (Math.PI * 2)
    const u = ((i * 0.618 + seed * 0.37) % 1) * 2 - 1
    return P.sphere(0.011, '#3A3340', { at: [cx + Math.cos(a) * rx * 0.8, cy + u * ry, cz], scale: [1.4, 0.6, 0.5] }, 5)
  })

/** A snowy owl on a snowy rock: a round white body flecked with black, big yellow eyes, a little dark beak. About 0.55
 *  tall, rock and all. */
export function snowyOwl(bag: Bag): Owl {
  const root = new Group()
  const head = new Group()
  root.add(
    solidMix(
      [
        // The snowy rock she perches on.
        P.sphere(0.17, '#C9C2D8', { at: [0, 0.05, 0], scale: [1.3, 0.55, 1.1] }, 10),
        P.sphere(0.15, '#FFFFFF', { at: [0, 0.1, 0], scale: [1.25, 0.35, 1.05] }, 10),
        // The body: a round white egg, flecked with black on the front.
        P.sphere(0.13, '#FFFFFF', { at: [0, 0.27, 0], scale: [1, 1.2, 0.95] }, 14),
        // Two little yellow feet.
        ...[-1, 1].map((s) => P.sphere(0.025, '#FFC83D', { at: [s * 0.05, 0.13, 0.08], scale: [1.2, 0.5, 1.4] }, 6)),
      ],
      // (The flecks, her eyes' middles: paint, no ink round each.)
      flecks(0, 0.27, 0.12, 0.09, 0.08, 9, 0.4),
      bag,
      LINE.toy,
    ),
  )
  const wings: Group[] = []
  for (const s of [-1, 1]) {
    const w = new Group()
    w.position.set(s * 0.11, 0.33, -0.01)
    w.add(solidMix([P.sphere(0.08, '#F7F5FF', { at: [s * 0.02, -0.06, 0], scale: [0.35, 1.0, 0.9] }, 10)], flecks(s * 0.045, -0.06, 0.03, 0.02, 0.05, 3, s + 2), bag, LINE.small))
    root.add(w)
    wings.push(w)
  }
  head.position.set(0, 0.43, 0)
  head.add(
    solidMix(
      [
        P.sphere(0.1, '#FFFFFF', { scale: [1.1, 0.95, 1] }, 14),
        // Big yellow eyes and a little dark beak.
        ...[-1, 1].map((s) => P.sphere(0.034, '#FFD23F', { at: [s * 0.042, 0.012, 0.082], scale: [1, 1, 0.5] }, 10)),
        P.cone(0.016, 0.04, '#4A3F55', { at: [0, -0.025, 0.1], rot: [Math.PI / 2 + 0.6, 0, 0] }, 6),
      ],
      [...flecks(0, 0.05, -0.08, 0.06, 0.02, 4, 2.1), ...[-1, 1].map((s) => P.sphere(0.018, INK, { at: [s * 0.042, 0.012, 0.098], scale: [1, 1, 0.5] }, 8))],
      bag,
      LINE.toy,
    ),
  )
  root.add(head)
  return { root, head, wings }
}

export interface Bison {
  root: Group
  /** Rolls over in the dust. */
  body: Group
  head: Group
}

/** A bison: low and wide, a big dark shaggy hump over the shoulders, the head hung low with a beard and two little
 *  pale horns, four short legs. About 0.45 tall: much smaller than any friend. */
export function bison(bag: Bag): Bison {
  const root = new Group()
  const body = new Group()
  const head = new Group()
  const BODY = '#7A5240'
  const HUMP = '#3F2A22'
  const LEG = '#2E201B'
  body.add(
    solid(
      merge([
        // The low back end, and the big shaggy hump rising over the shoulders.
        P.sphere(0.17, BODY, { at: [0, 0.2, -0.13], scale: [1.15, 0.8, 1.2] }, 14),
        P.sphere(0.21, HUMP, { at: [0, 0.27, 0.07], scale: [1.25, 1.0, 0.95] }, 14),
        P.sphere(0.11, HUMP, { at: [0, 0.41, 0.03], scale: [1.4, 0.7, 1.1] }, 10),
        P.cone(0.03, 0.08, BODY, { at: [0, 0.22, -0.34], rot: [-1.9, 0, 0] }, 5),
        ...[[-0.12, 0.13], [0.12, 0.13], [-0.11, -0.21], [0.11, -0.21]].map(([x, z]) => P.cyl(0.035, 0.03, 0.12, LEG, { at: [x, 0.06, z] }, 6)),
      ]),
      bag,
      LINE.toy,
    ),
  )
  head.position.set(0, 0.19, 0.29)
  head.add(
    solid(
      merge([
        P.sphere(0.1, HUMP, { scale: [1.15, 0.95, 1.0] }, 12),
        P.sphere(0.06, LEG, { at: [0, -0.03, 0.07], scale: [1.1, 0.8, 0.9] }, 10),
        // The beard.
        P.cone(0.05, 0.11, HUMP, { at: [0, -0.11, 0.0], rot: [Math.PI, 0, 0] }, 6),
        // Two little pale horns curving up.
        ...[-1, 1].map((s) => P.cone(0.02, 0.07, '#F3E3C4', { at: [s * 0.1, 0.07, 0.0], rot: [0, 0, s * -0.7] }, 6)),
        ...eyes(0.055, 0.02, 0.085, 0.014),
      ]),
      bag,
      LINE.toy,
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
      LINE.toy,
    ),
  )
  tail.position.set(0, 0, -0.24)
  tail.add(solid(merge([-1, 1].map((s) => P.sphere(0.07, '#EEF2FC', { at: [s * 0.06, 0, -0.04], scale: [1, 0.22, 0.6] }, 8))), bag, LINE.small))
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
      LINE.toy,
    ),
  )
  tail.position.set(0, 0, -0.3)
  tail.add(solid(merge([-1, 1].map((s) => P.sphere(0.08, '#2B2638', { at: [s * 0.07, 0, -0.04], scale: [1, 0.2, 0.55] }, 8))), bag, LINE.small))
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
    LINE.toy,
  )

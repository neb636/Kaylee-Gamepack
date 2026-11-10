// The sandcastle's things, built from code in the toy look (greybox: simple shapes, already toon-shaded and outlined):
// the three moulds (her pink bucket, a square one, a unicorn), the towers they leave, shells and coral bits to push
// into the walls, the ghost crab, a longtail going by, the beach ball, Mommy's umbrella and Daddy's blanket of sand.
import { Group } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'

export type MouldKind = 'round' | 'square' | 'unicorn'
export const MOULDS: MouldKind[] = ['round', 'square', 'unicorn']
const MOULD_COLOR: Record<MouldKind, string> = { round: PAL.hotpink, square: PAL.lavenderDark, unicorn: PAL.mint }
/** Wet packed sand (the towers), a shade darker where it's shaded. */
export const PACKED = '#E8CB98'
const PACKED2 = '#D6B37C'
const INK = PAL.ink

/** A mould standing open side up, its handle over it: lifts, flips and slams down to leave its tower. */
export function mouldModel(bag: Bag, kind: MouldKind) {
  const c = MOULD_COLOR[kind]
  const root = new Group()
  const body = new Group()
  const parts =
    kind === 'square'
      ? [P.cyl(0.33, 0.27, 0.46, c, { at: [0, 0.23, 0], rot: [0, Math.PI / 4, 0] }, 4), P.cyl(0.35, 0.35, 0.05, '#FFFFFF', { at: [0, 0.45, 0], rot: [0, Math.PI / 4, 0] }, 4)]
      : [P.cyl(0.3, 0.24, 0.46, c, { at: [0, 0.23, 0] }, 16), P.torus(0.3, 0.028, '#FFFFFF', { at: [0, 0.46, 0], rot: [Math.PI / 2, 0, 0] })]
  // The handle, and on the unicorn a horn and ears on its bottom (they come out on top of the tower).
  parts.push(P.torus(0.27, 0.018, '#FFFFFF', { at: [0, 0.46, 0], rot: [0, 0, 0] }, Math.PI))
  if (kind === 'unicorn') parts.push(P.cone(0.07, 0.2, PAL.gold, { at: [0, -0.06, 0.04], rot: [Math.PI, 0, 0] }, 10), P.sphere(0.07, '#FFFFFF', { at: [0.16, 0.2, 0.22] }, 8), P.sphere(0.07, '#FFFFFF', { at: [-0.16, 0.2, 0.22] }, 8))
  if (kind === 'round') parts.push(P.sphere(0.06, '#FFFFFF', { at: [0, 0.24, 0.26] }, 8))
  body.add(solid(merge(parts), bag, 2))
  // The sand she digs into it: rises inside (scale.y = how full) and heaps up over the rim once it's full.
  const sand = new Group()
  sand.position.y = 0.02
  sand.add(solid(merge([kind === 'square' ? P.cyl(0.3, 0.25, 0.42, PACKED, { at: [0, 0.21, 0], rot: [0, Math.PI / 4, 0] }, 4) : P.cyl(0.28, 0.23, 0.42, PACKED, { at: [0, 0.21, 0] }, 16)]), bag, 0))
  sand.scale.y = 0.001
  sand.visible = false
  const heap = solid(merge([P.sphere(0.27, PACKED, { at: [0, 0, 0], scale: [1, 0.42, 1] }, 12)]), bag, 2)
  heap.position.y = 0.45
  heap.visible = false
  body.add(sand, heap)
  root.add(body)
  return { root, body, sand, heap }
}

/** The tower a mould leaves (its door faces +z, toward the camera when it's placed). */
export function towerModel(bag: Bag, kind: MouldKind) {
  const root = new Group()
  const parts =
    kind === 'square'
      ? [
          P.box(0.42, 0.4, 0.42, PACKED, { at: [0, 0.2, 0] }),
          ...[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([x, z]) => P.box(0.12, 0.1, 0.12, PACKED, { at: [x * 0.15, 0.45, z * 0.15] })),
        ]
      : kind === 'round'
        ? [
            P.cyl(0.24, 0.29, 0.44, PACKED, { at: [0, 0.22, 0] }, 16),
            ...[0, 1, 2, 3, 4, 5].map((i) => P.box(0.09, 0.09, 0.09, PACKED, { at: [Math.sin((i * Math.PI) / 3) * 0.19, 0.48, Math.cos((i * Math.PI) / 3) * 0.19], rot: [0, (i * Math.PI) / 3, 0] })),
          ]
        : [
            // A unicorn's head on a little base: the horn, the ears, the snout, a dot of an eye on each side.
            P.cyl(0.23, 0.28, 0.24, PACKED, { at: [0, 0.12, 0] }, 16),
            P.sphere(0.21, PACKED, { at: [0, 0.4, -0.02] }, 14),
            P.sphere(0.12, PACKED, { at: [0, 0.34, 0.17], scale: [1, 0.8, 1] }, 10),
            P.cone(0.06, 0.24, PACKED, { at: [0, 0.68, 0.04], rot: [0.25, 0, 0] }, 10),
            P.cone(0.055, 0.12, PACKED, { at: [0.12, 0.6, -0.04] }, 8),
            P.cone(0.055, 0.12, PACKED, { at: [-0.12, 0.6, -0.04] }, 8),
          ]
  // The door (where a hermit crab may move in) and a dark band at the foot.
  parts.push(P.rbox(0.13, 0.16, 0.05, 0.03, '#9C7A52', { at: [0, 0.08, kind === 'square' ? 0.21 : kind === 'round' ? 0.255 : 0.24] }))
  parts.push(P.cyl(kind === 'square' ? 0.3 : 0.3, kind === 'square' ? 0.32 : 0.32, 0.03, PACKED2, { at: [0, 0.015, 0] }, kind === 'square' ? 4 : 16))
  const body = new Group()
  body.add(solid(merge(parts), bag, 2))
  root.add(body)
  // A little pink flag on top, popped up by a tap.
  const flag = new Group()
  flag.add(solid(merge([P.cyl(0.012, 0.012, 0.32, '#FFFFFF', { at: [0, 0.16, 0] }, 6), P.prism([[0, 0], [0.16, -0.05], [0, -0.11]], 0.012, PAL.hotpink, { at: [0.008, 0.31, 0] })]), bag, 2))
  flag.position.y = kind === 'unicorn' ? 0.62 : 0.5
  flag.visible = false
  body.add(flag)
  // The hermit crab's eyes peeking out of the door, once it moves in.
  const peek = new Group()
  peek.add(solid(merge([P.sphere(0.025, INK, { at: [0.025, 0, 0] }, 6), P.sphere(0.025, INK, { at: [-0.025, 0, 0] }, 6), P.sphere(0.04, '#E0533F', { at: [0, -0.04, -0.02] }, 6)]), bag, 1))
  peek.position.set(0, 0.11, kind === 'square' ? 0.23 : 0.27)
  peek.visible = false
  body.add(peek)
  return { root, body, flag, peek }
}
export type TowerModel = ReturnType<typeof towerModel>

export type ShellKind = 'scallop' | 'conch' | 'coral' | 'star' | 'cowrie'
export const SHELLS: ShellKind[] = ['scallop', 'conch', 'coral', 'star', 'cowrie', 'scallop']
export function shellModel(bag: Bag, kind: ShellKind, i: number) {
  const root = new Group()
  const c = ['#FFC2D6', '#FFE6C7', '#FF9AAE', '#FFD37A', '#FFFFFF', '#D9CCFF'][i % 6]
  const parts =
    kind === 'scallop'
      ? [P.sphere(0.11, c, { at: [0, 0.03, 0], scale: [1, 0.35, 0.9] }, 10), ...[-2, -1, 0, 1, 2].map((k) => P.box(0.016, 0.035, 0.17, '#FFFFFF', { at: [k * 0.035, 0.05, 0.01], rot: [0, k * 0.28, 0] })), P.box(0.06, 0.03, 0.04, c, { at: [0, 0.02, -0.1] })]
      : kind === 'conch'
        ? [P.cone(0.08, 0.24, c, { at: [0, 0.07, 0], rot: [Math.PI / 2, 0, 0] }, 10), P.sphere(0.075, c, { at: [0, 0.07, 0.07] }, 10), P.torus(0.06, 0.015, '#FFFFFF', { at: [0, 0.07, 0.02] })]
        : kind === 'coral'
          ? [P.capsule(0.025, 0.14, c, { at: [0, 0.07, 0], rot: [0, 0, 0.3] }), P.capsule(0.022, 0.1, c, { at: [0.05, 0.1, 0], rot: [0, 0, -0.6] }), P.capsule(0.02, 0.08, c, { at: [-0.05, 0.08, 0.02], rot: [0.3, 0, 0.9] })]
          : kind === 'star'
            ? [0, 1, 2, 3, 4].map((k) => P.cone(0.04, 0.12, c, { at: [Math.sin((k * Math.PI * 2) / 5) * 0.05, 0.02, Math.cos((k * Math.PI * 2) / 5) * 0.05], rot: [Math.PI / 2, 0, (k * Math.PI * 2) / 5], scale: [1, 1, 0.45] }, 6))
            : [P.sphere(0.07, c, { at: [0, 0.035, 0], scale: [0.8, 0.6, 1.1] }, 10), P.box(0.012, 0.012, 0.11, '#C89B7B', { at: [0, 0.075, 0] })]
  root.add(solid(merge(parts), bag, 2))
  return root
}

/** A pale ghost crab: a flat round body, eyes up on stalks, two claws (they go up when she taps it). */
export function ghostCrab(bag: Bag) {
  const C = '#F1DDB8'
  const D = '#D8BE91'
  const root = new Group()
  const body = new Group()
  body.add(
    solid(
      merge([
        P.sphere(0.12, C, { at: [0, 0.07, 0], scale: [1.2, 0.55, 0.9] }, 12),
        ...[-1, 1].flatMap((s) => [0, 1, 2].map((k) => P.capsule(0.012, 0.09, D, { at: [s * 0.15, 0.04, -0.05 + k * 0.05], rot: [0, 0, s * 1.2] }))),
        P.capsule(0.01, 0.07, C, { at: [0.04, 0.15, 0.06] }),
        P.capsule(0.01, 0.07, C, { at: [-0.04, 0.15, 0.06] }),
        P.sphere(0.022, INK, { at: [0.04, 0.2, 0.065] }, 6),
        P.sphere(0.022, INK, { at: [-0.04, 0.2, 0.065] }, 6),
      ]),
      bag,
      1.5,
    ),
  )
  const claws = [1, -1].map((s) => {
    const g = new Group()
    g.position.set(s * 0.1, 0.08, 0.08)
    g.add(solid(merge([P.capsule(0.015, 0.06, D, { at: [0, 0.03, 0.02], rot: [0.9, 0, 0] }), P.sphere(0.035, C, { at: [0, 0.06, 0.07], scale: [0.8, 1, 1.2] }, 8)]), bag, 1.5))
    body.add(g)
    return g
  })
  root.add(body)
  return { root, body, claws }
}

/** A longtail boat going by out on the bay (wooden, a garland at the bow, a canopy). */
export function longtail(bag: Bag) {
  const root = new Group()
  const body = new Group()
  body.add(
    solid(
      merge([
        P.rbox(1.3, 0.5, 6.2, 0.2, '#9C6B45', { at: [0, 0.2, 0] }),
        P.rbox(1.1, 0.12, 5.8, 0.05, '#C99466', { at: [0, 0.48, 0] }),
        P.cone(0.38, 1.3, '#9C6B45', { at: [0, 0.7, 3.3], rot: [-0.9, 0, 0] }, 8),
        P.sphere(0.16, PAL.hotpink, { at: [0, 1.15, 3.6] }, 8),
        P.sphere(0.12, PAL.butter, { at: [0.1, 1.0, 3.5] }, 8),
        P.box(1.2, 0.06, 2.4, '#3F8FD0', { at: [0, 1.6, -0.5] }),
        ...[[0.5, 1.2], [-0.5, 1.2], [0.5, -1.6], [-0.5, -1.6]].map(([x, z]) => P.cyl(0.03, 0.03, 1.1, '#FFFFFF', { at: [x, 1.05, z] }, 6)),
        P.cyl(0.05, 0.05, 2.2, '#5A5A60', { at: [0, 0.7, -3.6], rot: [1.25, 0, 0] }, 6),
      ]),
      bag,
      2,
    ),
  )
  root.add(body)
  return { root, body }
}

/** The beach ball: pink with white and butter bands. */
export function beachBall(bag: Bag) {
  const root = new Group()
  const ball = new Group()
  ball.add(solid(merge([P.sphere(0.26, PAL.hotpink, {}, 16), P.torus(0.255, 0.05, '#FFFFFF', { rot: [Math.PI / 2, 0, 0] }), P.torus(0.255, 0.05, PAL.butter, { rot: [0, 0, 0] }), P.sphere(0.06, '#FFFFFF', { at: [0, 0.25, 0] }, 8)]), bag, 2))
  ball.position.y = 0.26
  root.add(ball)
  return { root, ball }
}

/** Mommy's umbrella: a pole and a canopy that spins. */
export function umbrella(bag: Bag) {
  const root = new Group()
  root.add(solid(P.cyl(0.05, 0.05, 2.3, '#F4EEE6', { at: [0, 1.15, 0] }, 6), bag, 2))
  const can = new Group()
  can.position.y = 2.2
  can.add(solid(merge([P.cone(1.5, 0.6, PAL.pink, {}, 10), P.sphere(0.09, '#FFFFFF', { at: [0, 0.34, 0] }, 8), P.cone(1.51, 0.08, '#FFFFFF', { at: [0, -0.3, 0] }, 10)]), bag, 2))
  root.add(can)
  return { root, can }
}

/** Sand heaped on Daddy: one soft mound per part of him (shins, knees, tummy, chest), each grown as she buries it. */
export function blanket(bag: Bag, length: number, width: number) {
  const root = new Group()
  const AT = [0.17, 0.33, 0.5, 0.66]
  const mounds = AT.map((f) => {
    const g = new Group()
    g.position.set(0, 0, -f * length)
    g.add(solid(merge([P.sphere(1, PACKED, { scale: [width, 0.9 * width, 0.15 * length] }, 14), P.sphere(1, '#F0D7A8', { at: [0.25 * width, 0.45 * width, 0], scale: [width * 0.55, 0.55 * width, 0.09 * length] }, 10)]), bag, 2))
    g.scale.setScalar(0.001)
    g.visible = false
    root.add(g)
    return g
  })
  return { root, mounds, at: AT }
}

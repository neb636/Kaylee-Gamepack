// The bay's animals as toy models in the house's look (geo.ts parts, flat toon colors, ink outlines, big shiny eyes that
// blink): Kaylee's nine stickers (needlefish, sea eagle, macaque, the village cat, fiddler crab, mudskipper, monitor
// lizard, kingfisher, finless porpoise) and the little rock crab that scuttles out of a notch. Each builder returns the
// pieces its owner moves (a claw that waves, wings that flap, a tail that swishes); the owner does the acting.
import { Group, type BufferGeometry } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { blobShadow, merge, P, solid, solidMix, type V3 } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'

const INK = '#2E2233'
const WHITE = '#FFFFFF'
const BLUSH = '#FF9DB8'

/** The nine stickers to find, in album order (the `found` param uses these ids). */
export const CRITTERS = ['needlefish', 'eagle', 'macaque', 'cat', 'crab', 'mudskipper', 'lizard', 'kingfisher', 'porpoise'] as const
export type CritterId = (typeof CRITTERS)[number]
/** The trip album's stickers: the bay's nine, then Baan Chang's baby elephant (Khanom, chang/). */
export const STICKERS = [...CRITTERS, 'elephant'] as const
export type StickerId = (typeof STICKERS)[number]

/** Two big shiny eyes (ink, with a white shine), as their own group so they can blink (squash scale.y). */
function eyes(at: V3[], r: number, bag: Bag, px = 1.5): Group {
  const g = new Group()
  const ink: BufferGeometry[] = []
  const shine: BufferGeometry[] = []
  for (const [x, y, z] of at) {
    ink.push(P.sphere(r, INK, { at: [x, y, z] }, 10))
    shine.push(P.sphere(r * 0.38, WHITE, { at: [x + r * 0.3, y + r * 0.35, z + r * 0.62] }, 6))
  }
  g.add(solidMix(ink, shine, bag, px))
  return g
}

/** Blinks a group of eyes now and then. */
export class Blink {
  private next = 1 + Math.random() * 3
  private t = -1
  constructor(private g: Group) {}
  update(dt: number) {
    this.next -= dt
    if (this.next <= 0) {
      this.t = 0
      this.next = 2 + Math.random() * 4
    }
    let s = 1
    if (this.t >= 0) {
      this.t += dt / 0.16
      s = 1 - 0.9 * Math.sin(Math.min(1, this.t) * Math.PI)
      if (this.t >= 1) this.t = -1
    }
    this.g.scale.y = s
  }
}

export interface Crab {
  root: Group
  claw: Group
  blink: Blink
}

/** A fiddler crab: a round shell, one huge claw (it waves it) and one tiny one, eyes on stalks. `big` = fiddler. */
export function buildCrab(bag: Bag, shell = '#FF7F6E', big = true): Crab {
  const root = new Group()
  const parts = [
    P.sphere(0.2, shell, { at: [0, 0.14, 0], scale: [1.3, 0.62, 1] }, 14),
    P.sphere(0.08, '#FFD6C8', { at: [0, 0.1, 0.12], scale: [1.6, 0.6, 0.5] }, 10),
    ...[-1, 1].flatMap((s) => [0, 1, 2].map((i) => P.capsule(0.022, 0.12, shell, { at: [s * (0.24 + i * 0.02), 0.07, -0.08 + i * 0.07], rot: [0, 0, s * 1.1] }))),
    // The little claw.
    P.sphere(0.05, shell, { at: [-0.25, 0.14, 0.14] }, 8),
    // Eye stalks.
    ...[-1, 1].map((s) => P.cyl(0.018, 0.018, 0.14, shell, { at: [s * 0.07, 0.26, 0.1] }, 6)),
    ...[-1, 1].map((s) => P.sphere(0.03, BLUSH, { at: [s * 0.14, 0.16, 0.17] }, 6)),
  ]
  root.add(solid(merge(parts), bag, 1.5))
  const claw = new Group()
  claw.position.set(0.22, 0.16, 0.1)
  claw.add(solid(merge([P.capsule(0.03, 0.12, shell, { at: [0.05, 0.05, 0], rot: [0, 0, -0.8] }), P.sphere(0.11, big ? '#FFE9A8' : shell, { at: [0.15, 0.13, 0], scale: [1, 0.75, 0.55] }, 12)]), bag, 1.5))
  if (!big) claw.scale.setScalar(0.45)
  root.add(claw)
  const e = eyes([[-0.07, 0.35, 0.1], [0.07, 0.35, 0.1]], 0.04, bag, 1)
  root.add(e)
  root.add(blobShadow(0.3, bag))
  return { root, claw, blink: new Blink(e) }
}

export interface Fish {
  root: Group
  blink: Blink
}

/** A mudskipper: a long grey-brown fish with spots, big eyes up on top, fins it walks on. */
export function buildMudskipper(bag: Bag): Fish {
  const root = new Group()
  const c = '#9C8FA8'
  root.add(
    solid(
      merge([
        P.capsule(0.12, 0.32, c, { at: [0, 0.12, 0], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.85] }),
        P.cone(0.12, 0.2, c, { at: [0, 0.12, -0.32], rot: [-Math.PI / 2, 0, 0], scale: [0.35, 1, 1] }, 8),
        ...[-1, 1].map((s) => P.sphere(0.07, '#B6AAC2', { at: [s * 0.12, 0.05, 0.12], scale: [1, 0.4, 1.3] }, 8)),
        P.box(0.02, 0.1, 0.22, '#8DB7E8', { at: [0, 0.27, -0.05] }),
        ...[[0.06, 0.2, -0.08], [-0.05, 0.22, 0.02], [0.04, 0.2, 0.12]].map((at) => P.sphere(0.025, '#6FC3E8', { at: at as V3 }, 6)),
        ...[-1, 1].map((s) => P.sphere(0.03, BLUSH, { at: [s * 0.1, 0.1, 0.22] }, 6)),
      ]),
      bag,
      1.5,
    ),
  )
  const e = eyes([[-0.05, 0.26, 0.17], [0.05, 0.26, 0.17]], 0.045, bag, 1)
  root.add(e)
  root.add(blobShadow(0.25, bag))
  return { root, blink: new Blink(e) }
}

export interface Lizard {
  root: Group
  head: Group
  tongue: Group
  tail: Group
  blink: Blink
}

/** A water monitor: long and low, dark with butter-yellow spots, a long tail it swims with, a pink forked tongue. */
export function buildLizard(bag: Bag): Lizard {
  const root = new Group()
  const c = '#6F7A8E'
  const spot = '#F6E08A'
  root.add(
    solid(
      merge([
        P.capsule(0.22, 0.9, c, { at: [0, 0.18, 0], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.7] }),
        ...[-0.3, 0, 0.3].flatMap((z) => [-1, 1].map((s) => P.sphere(0.05, spot, { at: [s * 0.12, 0.3, z] }, 6))),
        ...[-1, 1].flatMap((s) => [0.35, -0.35].map((z) => P.capsule(0.05, 0.16, c, { at: [s * 0.24, 0.1, z], rot: [0, 0, s * 1.2] }))),
      ]),
      bag,
      2,
    ),
  )
  const head = new Group()
  head.position.set(0, 0.22, 0.7)
  head.add(solid(merge([P.capsule(0.13, 0.22, c, { at: [0, 0, 0.15], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.75] }), ...[-1, 1].map((s) => P.sphere(0.035, BLUSH, { at: [s * 0.09, -0.02, 0.27] }, 6))]), bag, 2))
  const e = eyes([[-0.08, 0.06, 0.18], [0.08, 0.06, 0.18]], 0.04, bag, 1)
  head.add(e)
  const tongue = new Group()
  tongue.position.set(0, -0.02, 0.4)
  tongue.add(solid(merge([P.box(0.02, 0.01, 0.16, PAL.hotpink, { at: [0, 0, 0.08] }), ...[-1, 1].map((s) => P.box(0.015, 0.01, 0.07, PAL.hotpink, { at: [s * 0.02, 0, 0.18], rot: [0, s * 0.5, 0] }))]), bag, 0))
  tongue.scale.z = 0.01
  head.add(tongue)
  root.add(head)
  const tail = new Group()
  tail.position.set(0, 0.16, -0.62)
  tail.add(solid(merge([P.cone(0.17, 1.1, c, { at: [0, 0, -0.55], rot: [-Math.PI / 2, 0, 0], scale: [1, 1, 0.6] }, 10), P.sphere(0.04, spot, { at: [0, 0.07, -0.3] }, 6)]), bag, 2))
  root.add(tail)
  return { root, head, tongue, tail, blink: new Blink(e) }
}

export interface Bird {
  root: Group
  wingL: Group
  wingR: Group
  blink: Blink
}

/** A white-bellied sea eagle (big, white head and belly, grey wings) or a kingfisher (tiny, bright blue, orange tummy).
 *  Built facing +z, wings out along x; flapping turns them about z. */
export function buildBird(bag: Bag, kind: 'eagle' | 'kingfisher'): Bird {
  const root = new Group()
  const eagle = kind === 'eagle'
  const s = eagle ? 1 : 0.32
  const back = eagle ? '#8E8AA8' : '#3FA8F0'
  const belly = eagle ? WHITE : '#FFAA5C'
  const beak = eagle ? '#FFC83D' : PAL.ink
  root.add(
    solid(
      merge([
        P.sphere(0.32 * s, belly, { at: [0, 0, 0], scale: [0.8, 0.75, 1.3] }, 14),
        P.sphere(0.22 * s, back, { at: [0, 0.1 * s, -0.08 * s], scale: [0.9, 0.6, 1.2] }, 12),
        P.sphere(0.2 * s, eagle ? WHITE : back, { at: [0, 0.2 * s, 0.34 * s] }, 12),
        P.cone(0.07 * s, eagle ? 0.18 * s : 0.36 * s, beak, { at: [0, 0.17 * s, 0.6 * s], rot: [Math.PI / 2, 0, 0] }, 8),
        P.cone(0.16 * s, 0.34 * s, back, { at: [0, 0.02 * s, -0.5 * s], rot: [-Math.PI / 2, 0, 0], scale: [1, 1, 0.35] }, 8),
        ...[-1, 1].map((x) => P.sphere(0.05 * s, BLUSH, { at: [x * 0.13 * s, 0.14 * s, 0.48 * s] }, 6)),
      ]),
      bag,
      eagle ? 2 : 1.5,
    ),
  )
  const e = eyes([[-0.1 * s, 0.26 * s, 0.48 * s], [0.1 * s, 0.26 * s, 0.48 * s]], 0.05 * s, bag, 1)
  root.add(e)
  const wing = (side: number) => {
    const g = new Group()
    g.position.set(side * 0.18 * s, 0.08 * s, 0)
    g.add(solid(merge([P.sphere(0.5 * s, back, { at: [side * 0.45 * s, 0, -0.02 * s], scale: [1, 0.12, 0.42] }, 12), P.sphere(0.25 * s, eagle ? '#6E6A88' : '#2F86D0', { at: [side * 0.8 * s, 0, -0.08 * s], scale: [1, 0.14, 0.6] }, 8)]), bag, eagle ? 2 : 1.5))
    root.add(g)
    return g
  }
  return { root, wingL: wing(-1), wingR: wing(1), blink: new Blink(e) }
}

export interface Monkey {
  root: Group
  body: Group
  armL: Group
  armR: Group
  blink: Blink
}

/** A long-tailed macaque sitting on a ledge: grey-brown fur, a pink face, round ears, a long curly tail. */
export function buildMacaque(bag: Bag): Monkey {
  const root = new Group()
  const body = new Group()
  root.add(body)
  const fur = '#B9A28E'
  const face = '#FFB8B0'
  body.add(
    solid(
      merge([
        P.sphere(0.24, fur, { at: [0, 0.26, 0], scale: [1, 1.1, 0.9] }, 14),
        P.sphere(0.2, fur, { at: [0, 0.62, 0.02] }, 14),
        P.sphere(0.13, face, { at: [0, 0.58, 0.15], scale: [1.1, 0.95, 0.6] }, 12),
        ...[-1, 1].map((x) => P.sphere(0.07, fur, { at: [x * 0.2, 0.67, 0], scale: [0.6, 1, 0.5] }, 8)),
        ...[-1, 1].map((x) => P.sphere(0.05, face, { at: [x * 0.2, 0.67, 0.02], scale: [0.5, 0.8, 0.4] }, 6)),
        ...[-1, 1].map((x) => P.capsule(0.06, 0.12, fur, { at: [x * 0.12, 0.06, 0.12], rot: [Math.PI / 2, 0, 0] })),
        P.torus(0.14, 0.03, fur, { at: [0, 0.18, -0.28], rot: [0.2, Math.PI / 2, 0] }, Math.PI * 1.5),
        ...[-1, 1].map((x) => P.sphere(0.035, BLUSH, { at: [x * 0.09, 0.55, 0.2] }, 6)),
      ]),
      bag,
      2,
    ),
  )
  const e = eyes([[-0.055, 0.63, 0.21], [0.055, 0.63, 0.21]], 0.035, bag, 1)
  body.add(e)
  const arm = (side: number) => {
    const g = new Group()
    g.position.set(side * 0.2, 0.4, 0.02)
    g.add(solid(merge([P.capsule(0.05, 0.18, fur, { at: [0, -0.12, 0] }), P.sphere(0.055, face, { at: [0, -0.25, 0] }, 8)]), bag, 2))
    body.add(g)
    return g
  }
  root.add(blobShadow(0.3, bag))
  return { root, body, armL: arm(-1), armR: arm(1), blink: new Blink(e) }
}

export interface Cat {
  root: Group
  head: Group
  tail: Group
  blink: Blink
}

/** The village cat: a round ginger-and-cream cat sitting on the bow of a fishing boat. */
export function buildCat(bag: Bag): Cat {
  const root = new Group()
  const fur = '#FFB66E'
  const light = '#FFF1DC'
  root.add(solid(merge([P.sphere(0.2, fur, { at: [0, 0.2, 0], scale: [1, 1.1, 1.15] }, 14), P.sphere(0.13, light, { at: [0, 0.18, 0.14], scale: [1, 1.2, 0.6] }, 10), ...[-1, 1].map((x) => P.sphere(0.06, light, { at: [x * 0.08, 0.04, 0.18] }, 8))]), bag, 2))
  const head = new Group()
  head.position.set(0, 0.42, 0.06)
  head.add(
    solid(
      merge([
        P.sphere(0.17, fur, {}, 14),
        P.sphere(0.08, light, { at: [0, -0.05, 0.12], scale: [1.3, 0.8, 0.6] }, 10),
        ...[-1, 1].map((x) => P.cone(0.07, 0.13, fur, { at: [x * 0.1, 0.15, 0], rot: [0, 0, -x * 0.3] }, 8)),
        ...[-1, 1].map((x) => P.cone(0.04, 0.08, '#FFB3D1', { at: [x * 0.1, 0.14, 0.03], rot: [0, 0, -x * 0.3] }, 6)),
        P.sphere(0.02, PAL.hotpink, { at: [0, -0.02, 0.17] }, 6),
        ...[-1, 1].map((x) => P.sphere(0.03, BLUSH, { at: [x * 0.1, -0.04, 0.13] }, 6)),
      ]),
      bag,
      2,
    ),
  )
  const e = eyes([[-0.06, 0.03, 0.14], [0.06, 0.03, 0.14]], 0.035, bag, 1)
  head.add(e)
  root.add(head)
  const tail = new Group()
  tail.position.set(0, 0.08, -0.2)
  tail.add(solid(P.capsule(0.035, 0.3, fur, { at: [0, 0.15, -0.04], rot: [-0.3, 0, 0] }), bag, 2))
  root.add(tail)
  return { root, head, tail, blink: new Blink(e) }
}

/** A needlefish: thin, long, silver-green, a long pointy beak. */
export function buildNeedlefish(bag: Bag): Fish {
  const root = new Group()
  root.add(solid(merge([P.capsule(0.06, 0.6, '#B8E6D8', { rot: [Math.PI / 2, 0, 0] }), P.box(0.13, 0.02, 0.5, '#7FCDB5', { at: [0, 0.05, -0.05] }), P.cone(0.03, 0.35, '#7FCDB5', { at: [0, 0, 0.5], rot: [Math.PI / 2, 0, 0] }, 6), P.cone(0.08, 0.14, '#7FCDB5', { at: [0, 0, -0.42], rot: [-Math.PI / 2, 0, 0], scale: [0.2, 1, 1] }, 6)]), bag, 1.5))
  const e = eyes([[-0.045, 0.03, 0.22], [0.045, 0.03, 0.22]], 0.025, bag, 1)
  root.add(e)
  return { root, blink: new Blink(e) }
}

/** A finless porpoise: round grey head, a smiley mouth, no fin on its back. */
export function buildPorpoise(bag: Bag): Fish {
  const root = new Group()
  const c = '#A9B4CC'
  root.add(
    solid(
      merge([
        P.sphere(0.5, c, { at: [0, 0, 0], scale: [0.9, 0.85, 1.6] }, 18),
        P.sphere(0.3, '#D7DEEC', { at: [0, -0.15, 0.25], scale: [1, 0.6, 1.6] }, 12),
        P.cone(0.3, 0.6, c, { at: [0, 0, -0.95], rot: [-Math.PI / 2, 0, 0], scale: [1, 1, 0.35] }, 10),
        P.box(0.9, 0.06, 0.28, c, { at: [0, 0, -1.25] }),
        P.torus(0.1, 0.018, INK, { at: [0, -0.06, 0.74], rot: [0.4, 0, Math.PI] }, Math.PI),
        ...[-1, 1].map((x) => P.sphere(0.06, BLUSH, { at: [x * 0.26, -0.02, 0.62] }, 6)),
      ]),
      bag,
      2,
    ),
  )
  const e = eyes([[-0.2, 0.12, 0.62], [0.2, 0.12, 0.62]], 0.06, bag, 1.5)
  root.add(e)
  return { root, blink: new Blink(e) }
}

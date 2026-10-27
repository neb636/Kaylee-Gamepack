// Iceberg Maker's ice and the orca as greybox shapes in the toon look: the ice cliff at each pole, the giant berg that
// breaks off it, the little bits, and the orca under the water. The world (iceberg.ts) moves them; this file only owns
// the shapes and where things sit on them.
//
//   north (Greenland): a tall glacier front with a jagged top, mountains behind; its giant berg is pointy.
//   south (Antarctica): a flat ice shelf, a white table to the horizon; its giant berg is a flat-topped table.
//
// Every berg is built round its waterline: at rest y = 0 is the sea's surface, the white tip above it and the much
// bigger blue keel below (the water hides it until the camera dips under).
import { Group, type BufferGeometry } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'
import type { Pole } from './sections'

export const ICE = '#EEF5FC'
const ICE_SHADE = '#D4E5F6'
/** The keel: old ice packed tight, so it's blue. */
const KEEL = '#9CCBF2'
const KEEL_TOP = '#C9E3FA'
const SNOW = '#FFFFFF'
const ROCK = '#9AA3B8'

export interface Giant {
  /** Half its width across the cliff, and half its depth. */
  hw: number
  hd: number
  /** How high its tip stands out of the water (m), and how deep its keel goes (negative). */
  tip: number
  keel: number
  /** Its footprint on the water (m), for bumping and her finger. */
  r: number
  /** Where riders stand on it (local, above the waterline). */
  deck: [number, number, number][]
}

export interface PoleShape {
  pole: Pole
  /** The cliff's top (m above the sea). */
  h: number
  giant: Giant
  /** Where loose chunks can sit on the face: [x, height of their middle]. */
  slots: [number, number][]
  /** Where the friends stand on the cliff top (x, z). */
  friends: [number, number][]
}

export const SHAPES: Record<Pole, PoleShape> = {
  north: {
    pole: 'north',
    h: 8,
    giant: { hw: 3.2, hd: 2.3, tip: 5.2, keel: -13.6, r: 3.7, deck: [[0.8, 1.2, 1.6]] },
    slots: [-4.7, -6.4, -8.1, 4.7, 6.4, 8.1].flatMap((x) => [1.6, 3.7, 5.8].map((y): [number, number] => [x, y])),
    friends: [[-5.6, -1.1]],
  },
  south: {
    pole: 'south',
    h: 4.5,
    giant: {
      hw: 4.5,
      hd: 3,
      tip: 1.55,
      keel: -12,
      r: 5,
      deck: [
        [-1.6, 1.67, 1.2],
        [0.2, 1.67, 1.8],
        [1.9, 1.67, 0.9],
      ],
    },
    slots: [-5.9, -7.8, 5.9, 7.8].flatMap((x) => [1.3, 3].map((y): [number, number] => [x, y])),
    friends: [
      [-4.6, -1.3],
      [-3.7, -1.6],
      [-2.8, -1.2],
      [-6.2, -2],
      [3.4, -1.8],
    ],
  },
}

/** Seeded, so the cliff looks the same every time. */
export function rng(seed: number) {
  let s = (Math.abs(Math.floor(seed)) * 7919 + 13) % 233280
  return () => (s = (s * 9301 + 49297) % 233280) / 233280
}

/** The cliff: columns of ice from the sea floor up to the top, its front face at z = 0, and the land of ice behind. */
export function buildCliff(s: PoleShape, bag: Bag) {
  const rand = rng(s.pole === 'north' ? 3 : 5)
  const parts: BufferGeometry[] = []
  const W = 1.6
  for (let x = -34; x < 34; x += W) {
    const mid = x + W / 2
    // (Flat where the friends stand, and over the giant: its crack runs across the face there.)
    const flat = s.friends.some(([fx]) => Math.abs(mid - fx) < 1.4) || Math.abs(mid) < s.giant.hw + 1
    const top = s.pole === 'north' ? s.h + (flat ? 0 : (rand() - 0.35) * 1.4) : s.h
    const c = rand() < 0.3 ? ICE_SHADE : ICE
    parts.push(P.box(W + 0.02, top + 16, 7, c, { at: [mid, (top - 16) / 2, -3.5] }))
    // Blue bands low on the face: the old ice at the bottom.
    parts.push(P.box(W + 0.02, 1.1, 0.05, KEEL_TOP, { at: [mid, 0.55, 0.01] }))
    if (s.pole === 'north' && !flat && rand() < 0.6) parts.push(P.cone(0.9 + rand() * 0.4, 0.8 + rand() * 1.4, ICE, { at: [mid, top + 0.5, -0.9 - rand() * 2], rot: [0, rand(), 0] }, 5))
  }
  if (s.pole === 'south') {
    // A snowy lip along the top.
    parts.push(P.rbox(68, 0.3, 0.5, 0.1, SNOW, { at: [0, s.h + 0.05, -0.15] }))
  }
  const cliff = new Group()
  cliff.add(solid(merge(parts), bag, 2.5))

  // Behind the face: Greenland's glacier rising to the mountains, or Antarctica's flat shelf to the horizon.
  const back: BufferGeometry[] = []
  if (s.pole === 'north') {
    back.push(P.prism([[6.9, s.h - 0.2], [90, s.h + 16], [90, -16], [6.9, -16]], 70, ICE, { rot: [0, Math.PI / 2, 0] }))
    const r2 = rng(11)
    for (let i = 0; i < 9; i++) {
      const x = -60 + i * 15 + (r2() - 0.5) * 8
      const hh = 18 + r2() * 16
      back.push(P.cone(12 + r2() * 6, hh, i % 2 ? ROCK : '#B6BFD2', { at: [x, s.h + 12 + hh / 2, -100 - r2() * 20] }, 6))
      back.push(P.cone(5 + r2() * 2, hh * 0.38, SNOW, { at: [x, s.h + 12 + hh * 0.81, -100 - r2() * 2] }, 6))
    }
  } else {
    back.push(P.box(70, 1, 160, SNOW, { at: [0, s.h - 0.45, -87] }))
  }
  cliff.add(solid(merge(back), bag, 0))
  return cliff
}

/** The giant berg, round its waterline (see the file's top). */
export function giantGeo(s: PoleShape): BufferGeometry {
  const g = s.giant
  if (s.pole === 'north') {
    return merge([
      P.rbox(g.hw * 2, 1.4, g.hd * 2, 0.2, ICE, { at: [0, 0.5, 0] }),
      P.cone(2, 4, ICE, { at: [-0.6, 3.2, -0.6], rot: [0, 0.3, 0] }, 6),
      P.cone(1.5, 3, ICE_SHADE, { at: [1.7, 2.7, -0.2], rot: [0, 0.8, 0] }, 6),
      P.cone(1.3, 2.4, ICE, { at: [-2.3, 2.4, -1] }, 6),
      P.rbox(g.hw * 2, 3.4, g.hd * 2, 0.2, KEEL_TOP, { at: [0, -1.7, 0] }),
      P.sphere(4.6, KEEL, { at: [0, -7.1, 0], scale: [1.2, 1.15, 0.95] }, 14),
      P.sphere(3.2, KEEL, { at: [1.8, -10.4, 0.6] }, 12),
      P.sphere(2.8, KEEL, { at: [-2.6, -9, -0.4] }, 12),
    ])
  }
  return merge([
    P.rbox(g.hw * 2, 1.6, g.hd * 2, 0.15, ICE, { at: [0, 0.6, 0] }),
    P.rbox(g.hw * 2 + 0.1, 0.25, g.hd * 2 + 0.1, 0.1, SNOW, { at: [0, 1.45, 0] }),
    P.rbox(g.hw * 2, 3, g.hd * 2, 0.15, KEEL_TOP, { at: [0, -1.5, 0] }),
    P.rbox(g.hw * 2 + 0.4, 9, g.hd * 2 + 0.4, 0.6, KEEL, { at: [0, -7.5, 0] }),
  ])
}

/** A little chunk of the face (about `size` m), centered on its middle. Pointy up north, blocky down south. */
export function bitGeo(pole: Pole, size: number, rand: () => number): BufferGeometry {
  const w = size * (0.9 + rand() * 0.25)
  const h = size * (0.9 + rand() * 0.2)
  const d = size * (0.8 + rand() * 0.2)
  const parts = [P.rbox(w, h, d, 0.14, ICE, {}), P.rbox(w * 0.98, h * 0.3, d * 0.98, 0.1, KEEL_TOP, { at: [0, -h * 0.36, 0] })]
  if (pole === 'north' && rand() < 0.7) parts.push(P.cone(w * 0.32, h * 0.5, ICE, { at: [(rand() - 0.5) * w * 0.4, h * 0.6, 0] }, 5))
  else parts.push(P.rbox(w * 0.5, h * 0.25, d * 0.6, 0.08, ICE_SHADE, { at: [(rand() - 0.5) * w * 0.3, h * 0.55, 0] }))
  return merge(parts)
}

/** A flat little growler for the seal to sunbathe on. */
export function growlerGeo(): BufferGeometry {
  return merge([P.rbox(2.6, 1.2, 2, 0.3, ICE, { at: [0, -0.3, 0] }), P.rbox(2.4, 0.9, 1.8, 0.25, KEEL, { at: [0, -1.1, 0] })])
}

/** The orca: black and white, a tall fin, flukes. Faces +z. */
export function buildOrca(bag: Bag) {
  const BLACK = '#2E2E3E'
  const g = new Group()
  g.add(
    solidMix(
      [
        P.capsule(0.75, 2.6, BLACK, { rot: [Math.PI / 2, 0, 0] }),
        P.cone(0.32, 1.4, BLACK, { at: [0, 1.25, -0.3], rot: [-0.3, 0, 0], scale: [0.35, 1, 1] }),
        P.rbox(1.9, 0.14, 0.6, 0.06, BLACK, { at: [0, 0, -2.3] }),
        P.capsule(0.15, 0.6, BLACK, { at: [0.75, -0.4, 0.7], rot: [0.4, 0, 1.1] }),
        P.capsule(0.15, 0.6, BLACK, { at: [-0.75, -0.4, 0.7], rot: [0.4, 0, -1.1] }),
      ],
      [
        P.sphere(0.62, SNOW, { at: [0, -0.42, 0.6], scale: [0.85, 0.45, 1.9] }),
        P.sphere(0.24, SNOW, { at: [0.5, 0.25, 1.2], scale: [0.4, 0.6, 1.2] }),
        P.sphere(0.24, SNOW, { at: [-0.5, 0.25, 1.2], scale: [0.4, 0.6, 1.2] }),
        P.sphere(0.06, PAL.ink, { at: [0.62, 0.05, 1.55] }),
        P.sphere(0.06, PAL.ink, { at: [-0.62, 0.05, 1.55] }),
      ],
      bag,
      2.5,
    ),
  )
  return g
}

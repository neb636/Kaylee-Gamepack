// The train map's code-built animals and landmarks in the toon look, each facing +z with its moving parts in their own
// groups so map.ts can bring them to life: Canada geese (wings that flap, a neck that bobs) and their yellow goslings,
// the bison (a big shaggy hump, a beard, little curved horns), the orca and the beluga, the Mountie on his horse (an arm
// that lifts his hat and waves it), the CN Tower with its elevator, Niagara's horseshoe falls, Montmorency Falls off its
// cliff, and the St. Lawrence ferry.
import { Group, type BufferGeometry } from 'three'
import type { Bag } from '../../../engine3d/dispose'
import { merge, P, solid } from '../../../engine3d/geo'
import { PAL } from '../../../engine3d/toon'
import { RED } from './train'

const INK = '#2E2233'

const eyes = (x: number, y: number, z: number, r: number): BufferGeometry[] => [
  P.sphere(r, INK, { at: [x, y, z] }, 8),
  P.sphere(r, INK, { at: [-x, y, z] }, 8),
  P.sphere(r * 0.38, '#FFFFFF', { at: [x + r * 0.2, y + r * 0.35, z + r * 0.7] }, 6),
  P.sphere(r * 0.38, '#FFFFFF', { at: [-x + r * 0.2, y + r * 0.35, z + r * 0.7] }, 6),
]

export interface Goose {
  root: Group
  body: Group
  head: Group
  wingL: Group
  wingR: Group
}

/** A Canada goose (grey-brown body, white under the tail, black neck and head with the white chin strap), or a little
 *  yellow gosling. `flying`: legs tucked up, wings out to the sides. */
export function goose(bag: Bag, k = 1, gosling = false, flying = false): Goose {
  const root = new Group()
  const body = new Group()
  const head = new Group()
  const wingL = new Group()
  const wingR = new Group()
  root.add(body)
  const fur = gosling ? '#FBE38A' : '#A39384'
  const neck = gosling ? '#F3D46E' : INK
  body.add(
    solid(
      merge([
        P.sphere(0.08 * k, fur, { at: [0, 0.1 * k, 0], scale: [0.85, 0.78, 1.3] }),
        P.sphere(0.05 * k, gosling ? '#FFF1B8' : '#F4EFE8', { at: [0, 0.08 * k, -0.07 * k], scale: [0.9, 0.8, 1] }),
        P.sphere(0.04 * k, gosling ? fur : INK, { at: [0, 0.12 * k, -0.11 * k], scale: [0.9, 0.5, 1] }),
        ...(flying ? [] : [P.cyl(0.008 * k, 0.008 * k, 0.05 * k, INK, { at: [0.025 * k, 0.025 * k, 0] }, 5), P.cyl(0.008 * k, 0.008 * k, 0.05 * k, INK, { at: [-0.025 * k, 0.025 * k, 0] }, 5)]),
        P.cyl(0.016 * k, 0.022 * k, gosling ? 0.06 * k : 0.13 * k, neck, { at: [0, (gosling ? 0.16 : 0.19) * k, 0.07 * k], rot: [0.3, 0, 0] }, 8),
      ]),
      bag,
      1.5,
    ),
  )
  head.position.set(0, (gosling ? 0.2 : 0.26) * k, 0.09 * k)
  head.add(
    solid(
      merge([
        P.sphere((gosling ? 0.045 : 0.032) * k, neck, { scale: [0.9, 0.9, 1.1] }),
        ...(gosling ? [] : [P.sphere(0.018 * k, '#FFFFFF', { at: [0.018 * k, -0.006 * k, 0.004 * k], scale: [0.6, 1.2, 1] }), P.sphere(0.018 * k, '#FFFFFF', { at: [-0.018 * k, -0.006 * k, 0.004 * k], scale: [0.6, 1.2, 1] })]),
        P.cone(0.012 * k, 0.035 * k, gosling ? '#F2A33A' : '#3A3340', { at: [0, -0.004 * k, (gosling ? 0.055 : 0.042) * k], rot: [Math.PI / 2, 0, 0] }, 6),
        ...eyes(0.022 * k, 0.008 * k, 0.02 * k, (gosling ? 0.008 : 0.006) * k),
      ]),
      bag,
      1.2,
    ),
  )
  body.add(head)
  const wing = (s: number, g: Group) => {
    g.position.set(s * 0.055 * k, 0.12 * k, 0.01 * k)
    const span = flying ? 0.16 : 0.07
    g.add(solid(P.sphere(0.06 * k, gosling ? '#F3D46E' : '#857565', { at: [s * span * 0.6 * k, 0, -0.01 * k], scale: flying ? [1.9, 0.18, 0.75] : [0.45, 0.55, 1.15] }), bag, 1))
    body.add(g)
  }
  wing(1, wingR)
  wing(-1, wingL)
  return { root, body, head, wingL, wingR }
}

export interface Bison {
  root: Group
  body: Group
  head: Group
}

/** A bison: a dark brown body, a big shaggy lighter hump and front, its head held low with a beard and little black
 *  curved horns, a tufted tail. */
export function bison(bag: Bag): Bison {
  const root = new Group()
  const body = new Group()
  const head = new Group()
  const dark = '#5E3E30'
  const shag = '#8E6248'
  body.add(
    solid(
      merge([
        P.sphere(0.13, dark, { at: [0, 0.18, -0.08], scale: [0.85, 0.85, 1.05] }),
        P.sphere(0.16, shag, { at: [0, 0.23, 0.07], scale: [0.95, 1, 0.95] }),
        P.sphere(0.08, shag, { at: [0, 0.34, 0.03] }),
        ...[-0.065, 0.065].flatMap((x) => [P.cyl(0.026, 0.022, 0.12, dark, { at: [x, 0.06, 0.1] }, 7), P.cyl(0.024, 0.02, 0.11, dark, { at: [x, 0.055, -0.13] }, 7)]),
        ...[-0.065, 0.065].flatMap((x) => [P.cyl(0.026, 0.026, 0.02, INK, { at: [x, 0.01, 0.1] }, 7), P.cyl(0.024, 0.024, 0.02, INK, { at: [x, 0.01, -0.13] }, 7)]),
        P.cyl(0.008, 0.006, 0.1, dark, { at: [0, 0.2, -0.22], rot: [-0.6, 0, 0] }, 5),
        P.sphere(0.02, INK, { at: [0, 0.16, -0.25] }, 6),
      ]),
      bag,
      2,
    ),
  )
  head.position.set(0, 0.23, 0.22)
  head.add(
    solid(
      merge([
        P.sphere(0.075, dark, { at: [0, 0, 0.02], scale: [1, 0.95, 1.05] }),
        P.sphere(0.06, shag, { at: [0, 0.045, -0.01] }),
        P.sphere(0.045, '#9A7058', { at: [0, -0.025, 0.07], scale: [1.05, 0.8, 0.9] }),
        P.sphere(0.035, shag, { at: [0, -0.08, 0.03], scale: [0.8, 1.2, 0.7] }),
        P.sphere(0.008, INK, { at: [0.02, -0.02, 0.11] }, 5),
        P.sphere(0.008, INK, { at: [-0.02, -0.02, 0.11] }, 5),
        P.cone(0.014, 0.05, INK, { at: [0.07, 0.04, 0.0], rot: [0, 0, -0.9] }, 6),
        P.cone(0.014, 0.05, INK, { at: [-0.07, 0.04, 0.0], rot: [0, 0, 0.9] }, 6),
        ...eyes(0.045, 0.015, 0.06, 0.011),
      ]),
      bag,
      2,
    ),
  )
  body.add(head)
  root.add(body)
  return { root, body, head }
}

/** An orca: black on top, white belly and eye patch, a grey saddle, the tall fin, flukes. Floats with its middle at y 0. */
export function orca(bag: Bag) {
  const g = new Group()
  g.add(
    solid(
      merge([
        P.sphere(0.12, INK, { scale: [0.95, 0.8, 2.1] }),
        P.sphere(0.1, '#FFFFFF', { at: [0, -0.04, 0.04], scale: [0.8, 0.5, 1.9] }),
        P.sphere(0.05, '#FFFFFF', { at: [0.07, 0.04, 0.15], scale: [0.4, 0.5, 1.1] }),
        P.sphere(0.05, '#FFFFFF', { at: [-0.07, 0.04, 0.15], scale: [0.4, 0.5, 1.1] }),
        P.sphere(0.05, '#B9B3C9', { at: [0, 0.075, -0.07], scale: [1, 0.35, 1.2] }),
        P.prism([[-0.05, 0], [0.05, 0], [0.03, 0.2]], 0.025, INK, { at: [0, 0.07, 0.0], rot: [0, Math.PI / 2, 0] }),
        P.sphere(0.035, INK, { at: [0.11, -0.05, 0.1], scale: [1.6, 0.3, 0.8] }),
        P.sphere(0.035, INK, { at: [-0.11, -0.05, 0.1], scale: [1.6, 0.3, 0.8] }),
        P.sphere(0.06, INK, { at: [0.06, 0, -0.27], scale: [1.4, 0.25, 0.7] }),
        P.sphere(0.06, INK, { at: [-0.06, 0, -0.27], scale: [1.4, 0.25, 0.7] }),
        P.sphere(0.012, '#FFFFFF', { at: [0.09, 0.05, 0.19] }, 6),
        P.sphere(0.012, '#FFFFFF', { at: [-0.09, 0.05, 0.19] }, 6),
        P.sphere(0.009, INK, { at: [0.097, 0.05, 0.195] }, 6),
        P.sphere(0.009, INK, { at: [-0.097, 0.05, 0.195] }, 6),
      ]),
      bag,
      2,
    ),
  )
  return g
}

/** A beluga: round and white, with a bulgy melon forehead, a little smile and flippers. Middle at y 0. */
export function beluga(bag: Bag) {
  const g = new Group()
  const white = '#F4F8FF'
  g.add(
    solid(
      merge([
        P.sphere(0.09, white, { scale: [1, 0.85, 1.9] }),
        P.sphere(0.07, white, { at: [0, 0.03, 0.13], scale: [1, 0.95, 0.95] }),
        P.sphere(0.03, white, { at: [0, -0.005, 0.2], scale: [1.1, 0.8, 0.9] }),
        P.torus(0.02, 0.004, '#B9A6F5', { at: [0, -0.012, 0.215], rot: [0, 0, Math.PI] }, Math.PI),
        P.sphere(0.03, white, { at: [0.08, -0.04, 0.06], scale: [1.4, 0.3, 0.8] }),
        P.sphere(0.03, white, { at: [-0.08, -0.04, 0.06], scale: [1.4, 0.3, 0.8] }),
        P.sphere(0.045, white, { at: [0.04, 0, -0.2], scale: [1.4, 0.25, 0.7] }),
        P.sphere(0.045, white, { at: [-0.04, 0, -0.2], scale: [1.4, 0.25, 0.7] }),
        ...eyes(0.05, 0.03, 0.17, 0.009),
        P.sphere(0.015, PAL.pink, { at: [0.055, 0.0, 0.18] }, 6),
        P.sphere(0.015, PAL.pink, { at: [-0.055, 0.0, 0.18] }, 6),
      ]),
      bag,
      2,
    ),
  )
  return g
}

export interface Mountie {
  root: Group
  /** The horse (it trots: bob and nod). */
  horse: Group
  head: Group
  /** The rider, his right arm and his hat. */
  rider: Group
  arm: Group
  hat: Group
  /** Where his hat sits on his head (rider-local). */
  hatOn: [number, number, number]
}

/** A Mountie in his red coat and brown hat on a dark bay horse with a black mane. Toy-sized: about 0.45 m tall. */
export function mountie(bag: Bag): Mountie {
  const root = new Group()
  const horse = new Group()
  const head = new Group()
  const rider = new Group()
  const arm = new Group()
  const hat = new Group()
  const bay = '#8A5236'
  const mane = INK
  horse.add(
    solid(
      merge([
        P.capsule(0.07, 0.16, bay, { at: [0, 0.2, 0], rot: [Math.PI / 2, 0, 0] }),
        ...[-0.045, 0.045].flatMap((x) => [0.09, -0.09].map((z) => P.cyl(0.018, 0.015, 0.15, bay, { at: [x, 0.075, z] }, 6))),
        ...[-0.045, 0.045].flatMap((x) => [0.09, -0.09].map((z) => P.cyl(0.02, 0.02, 0.02, INK, { at: [x, 0.01, z] }, 6))),
        P.cyl(0.012, 0.025, 0.12, mane, { at: [0, 0.2, -0.17], rot: [-0.8, 0, 0] }, 6),
        // A red saddle blanket under the rider.
        P.rbox(0.15, 0.02, 0.12, 0.01, RED, { at: [0, 0.27, -0.01] }),
      ]),
      bag,
      2,
    ),
  )
  head.position.set(0, 0.28, 0.12)
  head.add(
    solid(
      merge([
        P.cyl(0.035, 0.045, 0.1, bay, { at: [0, -0.02, 0], rot: [0.5, 0, 0] }, 8),
        P.capsule(0.035, 0.05, bay, { at: [0, 0.04, 0.05], rot: [1.2, 0, 0] }),
        P.sphere(0.03, '#6E3F2A', { at: [0, 0.01, 0.11] }, 8),
        P.box(0.012, 0.012, 0.07, '#FFFFFF', { at: [0, 0.075, 0.07], rot: [0.4, 0, 0] }),
        P.cone(0.014, 0.04, bay, { at: [0.022, 0.1, 0.01] }, 5),
        P.cone(0.014, 0.04, bay, { at: [-0.022, 0.1, 0.01] }, 5),
        P.rbox(0.014, 0.07, 0.08, 0.006, mane, { at: [0, 0.06, -0.03], rot: [0.5, 0, 0] }),
        ...eyes(0.032, 0.055, 0.045, 0.008),
      ]),
      bag,
      2,
    ),
  )
  horse.add(head)
  // The rider: navy trousers with a yellow stripe, the red serge coat, a round face, the brown flat-brimmed hat.
  rider.position.set(0, 0.28, -0.01)
  rider.add(
    solid(
      merge([
        P.capsule(0.022, 0.05, '#2B3A67', { at: [0.055, 0.0, 0.02], rot: [Math.PI / 2, 0, 0] }),
        P.capsule(0.022, 0.05, '#2B3A67', { at: [-0.055, 0.0, 0.02], rot: [Math.PI / 2, 0, 0] }),
        P.box(0.006, 0.01, 0.06, PAL.gold, { at: [0.077, 0.0, 0.03] }),
        P.box(0.006, 0.01, 0.06, PAL.gold, { at: [-0.077, 0.0, 0.03] }),
        P.capsule(0.045, 0.06, '#D7263D', { at: [0, 0.07, 0] }),
        P.box(0.095, 0.012, 0.08, '#6E3F2A', { at: [0, 0.04, 0] }),
        P.sphere(0.008, PAL.gold, { at: [0, 0.08, 0.044] }, 5),
        P.sphere(0.008, PAL.gold, { at: [0, 0.055, 0.045] }, 5),
        P.capsule(0.016, 0.05, '#D7263D', { at: [-0.055, 0.07, 0.01], rot: [0, 0, 0.25] }),
        P.sphere(0.045, '#F6C9A8', { at: [0, 0.165, 0] }, 12),
        P.sphere(0.008, INK, { at: [0.016, 0.17, 0.04] }, 6),
        P.sphere(0.008, INK, { at: [-0.016, 0.17, 0.04] }, 6),
        P.sphere(0.01, '#FF9DB8', { at: [0.028, 0.155, 0.033] }, 6),
        P.sphere(0.01, '#FF9DB8', { at: [-0.028, 0.155, 0.033] }, 6),
        P.torus(0.012, 0.003, INK, { at: [0, 0.152, 0.042], rot: [0, 0, Math.PI] }, Math.PI),
      ]),
      bag,
      2,
    ),
  )
  arm.position.set(0.05, 0.1, 0.0)
  arm.add(solid(merge([P.capsule(0.016, 0.05, '#D7263D', { at: [0, -0.035, 0] }), P.sphere(0.016, '#F6C9A8', { at: [0, -0.075, 0] }, 8)]), bag, 2))
  rider.add(arm)
  const hatOn: [number, number, number] = [0, 0.2, 0]
  hat.position.set(...hatOn)
  hat.add(
    solid(
      merge([
        P.cyl(0.075, 0.075, 0.01, '#B07A4F', {}, 18),
        P.cone(0.045, 0.06, '#B07A4F', { at: [0, 0.03, 0], rot: [0, Math.PI / 4, 0] }, 4),
        P.cyl(0.046, 0.046, 0.012, '#6E3F2A', { at: [0, 0.01, 0] }, 14),
      ]),
      bag,
      1.5,
    ),
  )
  rider.add(hat)
  horse.add(rider)
  root.add(horse)
  return { root, horse, head, rider, arm, hat, hatOn }
}

/** The CN Tower, with the little gold elevator (named 'lift') that zips up its side. */
export function cnTower(bag: Bag) {
  const g = new Group()
  const c = '#E8DCCB'
  g.add(
    solid(
      merge([
        P.cyl(0.11, 0.13, 0.04, '#C9C3D6', { at: [0, 0.02, 0] }, 12),
        P.cyl(0.03, 0.07, 1.0, c, { at: [0, 0.52, 0] }, 10),
        P.cyl(0.11, 0.07, 0.07, c, { at: [0, 1.02, 0] }, 16),
        P.cyl(0.115, 0.115, 0.03, PAL.sky, { at: [0, 1.06, 0] }, 16),
        P.cyl(0.08, 0.11, 0.04, c, { at: [0, 1.095, 0] }, 16),
        P.cyl(0.026, 0.03, 0.2, c, { at: [0, 1.21, 0] }, 8),
        P.sphere(0.035, c, { at: [0, 1.32, 0] }, 10),
        P.cyl(0.008, 0.016, 0.34, '#B9B3C9', { at: [0, 1.5, 0] }, 6),
      ]),
      bag,
      2,
    ),
  )
  const light = solid(P.sphere(0.022, RED, {}, 8), bag, 0)
  light.position.y = 1.68
  light.name = 'light'
  g.add(light)
  const lift = solid(P.rbox(0.04, 0.055, 0.03, 0.01, PAL.gold, { at: [0, 0, 0.05] }), bag, 1)
  lift.position.y = 0.1
  lift.name = 'lift'
  g.add(lift)
  return g
}

/** Niagara Falls: the horseshoe of rock with the river on top and white water pouring over its curved edge. */
export function niagara(bag: Bag) {
  const g = new Group()
  const water: BufferGeometry[] = []
  for (let i = 0; i < 7; i++) {
    const a = -1.1 + (i / 6) * 2.2
    water.push(P.box(0.07, 0.15, 0.025, i % 2 ? '#FFFFFF' : '#D3EEFF', { at: [Math.sin(a) * 0.2, 0.09, Math.cos(a) * 0.12 + 0.02], rot: [0, a, 0] }))
  }
  g.add(
    solid(
      merge([
        P.cyl(0.26, 0.28, 0.17, '#B98A6A', { at: [0, 0.085, -0.04], scale: [1, 1, 0.75] }, 18),
        P.cyl(0.22, 0.22, 0.02, PAL.sky, { at: [0, 0.172, -0.05], scale: [1, 1, 0.7] }, 18),
        P.cyl(0.32, 0.32, 0.01, '#D3EEFF', { at: [0, 0.01, 0.12], scale: [1, 1, 0.5] }, 18),
        ...water,
      ]),
      bag,
      1.5,
    ),
  )
  return g
}

/** Montmorency Falls: a tall thin white waterfall pouring off a cliff into the river (taller than Niagara!). */
export function montmorency(bag: Bag) {
  const g = new Group()
  g.add(
    solid(
      merge([
        P.rbox(0.3, 0.42, 0.16, 0.04, '#A9A3B8', { at: [0, 0.21, -0.04] }),
        P.rbox(0.32, 0.03, 0.18, 0.02, '#FFFFFF', { at: [0, 0.43, -0.04] }),
        P.cone(0.05, 0.14, '#4FA474', { at: [0.11, 0.5, -0.05] }, 7),
        P.cone(0.04, 0.12, '#4FA474', { at: [-0.12, 0.49, -0.07] }, 7),
        P.box(0.06, 0.03, 0.12, PAL.sky, { at: [0, 0.43, -0.02] }),
        P.box(0.06, 0.4, 0.02, '#FFFFFF', { at: [0, 0.22, 0.05] }),
        P.box(0.025, 0.38, 0.022, '#D3EEFF', { at: [0.012, 0.21, 0.052] }),
        P.cyl(0.11, 0.11, 0.012, '#D3EEFF', { at: [0, 0.01, 0.12], scale: [1, 1, 0.6] }, 16),
      ]),
      bag,
      1.5,
    ),
  )
  return g
}

/** The St. Lawrence ferry: a white hull with a red stripe, a blue cabin, a red funnel with a black top. */
export function ferry(bag: Bag) {
  const g = new Group()
  g.add(
    solid(
      merge([
        P.rbox(0.2, 0.07, 0.46, 0.04, '#FFFFFF', { at: [0, 0.035, 0] }),
        P.box(0.205, 0.02, 0.4, RED, { at: [0, 0.04, 0] }),
        P.rbox(0.15, 0.08, 0.26, 0.025, '#FFFFFF', { at: [0, 0.11, -0.03] }),
        ...[-0.12, -0.04, 0.04].map((z) => P.box(0.155, 0.03, 0.05, PAL.sky, { at: [0, 0.12, z] })),
        P.cyl(0.028, 0.032, 0.09, RED, { at: [0, 0.19, -0.06] }, 10),
        P.cyl(0.029, 0.029, 0.02, INK, { at: [0, 0.235, -0.06] }, 10),
      ]),
      bag,
      2,
    ),
  )
  return g
}

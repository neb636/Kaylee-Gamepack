// What stands on the home globe for each place: a toy-sized landmark (Pisa's tower, the pyramids, the Great Wall...),
// the country's friend or animal, and its real flag on a pole. Built from code in the flat toon look (engine3d/geo.ts:
// merged primitives, one ink outline each), in centimeters of a globe 100 cm round, so a landmark is ~20 cm tall and
// sticks out of the planet like a toy's. Local axes: +y up from the ground, +z south (toward her when the globe brings
// it round), +x east.
//
// No temples or Buddhas (AGENTS.md rule 7): nothing religious stands here.
import { ConeGeometry, Group, SphereGeometry, type BufferGeometry } from 'three'
import type { Look } from '../engine3d/characters/look'
import type { Bag } from '../engine3d/dispose'
import { bake, merge, P, solid, type V3 } from '../engine3d/geo'
import { PAL } from '../engine3d/toon'
import type { FlagId } from '../kit/Flag'
import { CANADA_LOOKS } from '../places/canada/characters/looks'
import { POLES_LOOKS } from '../places/poles/characters/looks'
import { faceted, palm, rod, roundTree, Toy } from './toys'

export interface Landmark {
  group: Group
  /** How high its top is (cm): the name pill and the sparkles go there. */
  top: number
  toys: Toy[]
  /** Where its flag pole stands (cm), if it has one. */
  flag?: { id: FlagId; at: V3 }
}

type Parts = BufferGeometry[]

function finish(bag: Bag, parts: Parts, px = 2): Group {
  return solid(merge(parts), bag, px)
}

function toy(look: Look, height: number, at: V3, bag: Bag, turn = 0) {
  const t = new Toy({ ...look, height }, bag)
  t.root.position.set(...at)
  t.root.rotation.y = turn
  return t
}

// ---------------------------------------------------------------- the places

/** Italy: the Leaning Tower of Pisa on its lawn. */
function italy(bag: Bag): Landmark {
  const g = new Group()
  g.add(finish(bag, [P.cyl(5, 5.4, 0.8, '#A6DE6E', { at: [0, 0.2, 0] }, 20)]))
  const tower: Parts = []
  const cream = '#FFF7F0'
  const arch = '#C9B6F5'
  let y = 0.6
  tower.push(P.cyl(3.1, 3.2, 3.6, cream, { at: [0, y + 1.8, 0] }, 20))
  y += 3.6
  const tier = (r: number, h: number) => {
    tower.push(P.cyl(r + 0.55, r + 0.55, 0.55, '#F3E6D8', { at: [0, y + 0.27, 0] }, 20))
    y += 0.55
    tower.push(P.cyl(r, r, h, cream, { at: [0, y + h / 2, 0] }, 20))
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2
      tower.push(P.box(0.75, h * 0.62, 0.4, arch, { at: [Math.sin(a) * r, y + h * 0.48, Math.cos(a) * r], rot: [0, a, 0] }))
    }
    y += h
  }
  for (let i = 0; i < 6; i++) tier(2.85, 2.2)
  tier(2.2, 2.4)
  tower.push(P.cyl(2.5, 2.5, 0.5, '#F3E6D8', { at: [0, y + 0.25, 0] }, 20), P.sphere(1.2, '#FFC83D', { at: [0, y + 0.9, 0] }, 12))
  const t = finish(bag, tower)
  t.rotation.z = -0.1
  t.position.x = -0.4
  g.add(t)
  return { group: g, top: y + 3, toys: [], flag: { id: 'italy', at: [6, 0, 3] } }
}

/** Egypt: three golden pyramids on the sand, two palms by a little pool. */
function egypt(bag: Bag): Landmark {
  const g = new Group()
  const gold = '#F5C964'
  const parts: Parts = []
  const pyramid = (r: number, h: number, at: [number, number]) => faceted(P.cone(r, h, gold, { at: [at[0], h / 2 + 0.5, at[1]], rot: [0, Math.PI / 4, 0] }, 4), 0.2)
  parts.push(pyramid(8.5, 10.5, [-1, -3]), pyramid(6.4, 7.8, [-10, 4]), pyramid(4.4, 5.4, [7, 5]))
  // Gold tips.
  parts.push(faceted(P.cone(1.7, 2.1, '#FFF1B8', { at: [-1, 10.5 - 0.55, -3], rot: [0, Math.PI / 4, 0] }, 4), 0.15))
  parts.push(P.cyl(2.6, 2.6, 0.5, PAL.sky, { at: [11, 0.7, -4] }, 16), ...palm([13, 0.5, -6], 7, 0.5), ...palm([9, 0.5, -7.5], 5.6, -2.2))
  g.add(finish(bag, parts))
  return { group: g, top: 14, toys: [], flag: { id: 'egypt', at: [-12, 0, -4] } }
}

/** China: the Great Wall winding over green hills, a panda and bamboo. */
function china(bag: Bag, toys: Toy[]): Landmark {
  const g = new Group()
  const hills: Parts = []
  const wall: Parts = []
  const stone = '#EFD2B3'
  const walk = '#D8B48F'
  const path: [number, number][] = []
  for (let i = 0; i <= 10; i++) {
    const x = -17 + i * 3.4
    path.push([x, Math.sin(x / 6) * 5 - 2])
  }
  const ground = (x: number) => 2.4 + 2.6 * Math.cos((x / 17) * Math.PI * 1.5)
  for (const [x, z] of path.filter((_, i) => i % 2 === 0)) hills.push(P.sphere(7.5, '#A6DE6E', { at: [x, ground(x) - 5.6, z], scale: [1, 0.95, 0.85] }, 14))
  for (let i = 0; i < path.length - 1; i++) {
    const [x1, z1] = path[i]
    const [x2, z2] = path[i + 1]
    const y1 = ground(x1)
    const y2 = ground(x2)
    const dx = x2 - x1
    const dz = z2 - z1
    const flatLen = Math.hypot(dx, dz)
    const len = Math.hypot(flatLen, y2 - y1)
    const heading = Math.atan2(-dz, dx)
    const slope = Math.atan2(y2 - y1, flatLen)
    const mid: V3 = [(x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2]
    wall.push(P.box(len + 0.6, 2.6, 2.4, stone, { at: [mid[0], mid[1] + 1.3, mid[2]], rot: [0, heading, slope] }))
    wall.push(P.box(len + 0.6, 0.3, 1.8, walk, { at: [mid[0], mid[1] + 2.65, mid[2]], rot: [0, heading, slope] }))
    // Battlements on both sides.
    const nx = -dz / flatLen
    const nz = dx / flatLen
    for (let k = 0; k < 3; k++) {
      const f = (k + 0.5) / 3
      const bx = x1 + dx * f
      const bz = z1 + dz * f
      const by = y1 + (y2 - y1) * f + 3
      for (const s of [-1, 1]) wall.push(P.box(0.8, 0.8, 0.45, stone, { at: [bx + nx * s * 1.05, by, bz + nz * s * 1.05], rot: [0, heading, 0] }))
    }
  }
  for (const i of [1, 5, 9]) {
    const [x, z] = path[i]
    const y = ground(x)
    wall.push(P.box(4, 5.4, 4, stone, { at: [x, y + 2.7, z] }), P.box(4.4, 0.4, 4.4, walk, { at: [x, y + 5.4, z] }))
    for (const [cx, cz] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) wall.push(P.box(0.9, 1, 0.9, stone, { at: [x + cx, y + 6, z + cz] }))
    wall.push(P.box(1.2, 1.8, 0.3, '#8E6F86', { at: [x, y + 3.2, z + 2.05] }))
  }
  g.add(finish(bag, hills, 2), finish(bag, wall, 2))
  // Bamboo.
  const bamboo: Parts = []
  for (const [x, z, h] of [[-13, 9, 11], [-11, 10.5, 9], [-14.5, 11, 8]]) {
    bamboo.push(P.cyl(0.45, 0.5, h, '#7FCF6A', { at: [x, h / 2, z] }, 8))
    for (let k = 1; k < h / 2.5; k++) bamboo.push(P.cyl(0.58, 0.58, 0.3, '#5DB458', { at: [x, k * 2.5, z] }, 8))
    for (const s of [-1, 1]) bamboo.push(P.sphere(0.9, '#6FD08A', { at: [x + s * 1.2, h - 1.5, z], scale: [1.8, 0.45, 0.8], rot: [0, 0, s * 0.4] }, 8))
  }
  g.add(finish(bag, bamboo, 1.5))
  const panda: Look = { species: 'panda', height: 1, fur: '#FFF6EE', light: '#FFFDF8', dark: '#4A3F4F', ear: '#FFB3C7', open: true }
  const p = toy(panda, 7.2, [-8, 0.4, 8], bag, 0.3)
  toys.push(p)
  g.add(p.root)
  return { group: g, top: 13, toys, flag: { id: 'china', at: [10, 0, 7] } }
}

/** A kangaroo: a pear of a body, big feet, a long tail and tall ears. */
function kangaroo(at: V3, bag: Bag) {
  const fur = '#E9A46E'
  const light = '#FFE1C2'
  const outlined: Parts = [
    P.sphere(2.2, fur, { at: [0, 3.3, 0], scale: [0.9, 1.25, 0.85] }, 14),
    P.sphere(1.5, fur, { at: [0, 6.4, 0.5] }, 14),
    P.sphere(0.8, light, { at: [0, 6.0, 1.7], scale: [1, 0.8, 1] }, 10),
    P.capsule(0.42, 1.6, fur, { at: [-0.75, 8.2, 0.1], rot: [0, 0, 0.2] }),
    P.capsule(0.42, 1.6, fur, { at: [0.75, 8.2, 0.1], rot: [0, 0, -0.2] }),
    P.rbox(1.1, 0.7, 3, 0.35, fur, { at: [-1, 0.35, 0.9] }),
    P.rbox(1.1, 0.7, 3, 0.35, fur, { at: [1, 0.35, 0.9] }),
    rod([0, 2.2, -1.2], [0, 0.4, -5], 0.6, fur, 8),
    P.capsule(0.35, 1, fur, { at: [-1.3, 4.3, 1.1], rot: [0.9, 0, 0.3] }),
    P.capsule(0.35, 1, fur, { at: [1.3, 4.3, 1.1], rot: [0.9, 0, -0.3] }),
  ]
  const plain: Parts = [
    P.sphere(1.25, light, { at: [0, 3.1, 1.3], scale: [1, 1.3, 0.5] }, 12),
    P.sphere(0.24, PAL.ink, { at: [-0.6, 6.7, 1.3] }, 8),
    P.sphere(0.24, PAL.ink, { at: [0.6, 6.7, 1.3] }, 8),
    P.sphere(0.24, '#5A3A3A', { at: [0, 6.25, 2.45] }, 8),
    P.sphere(0.32, '#FF9DB8', { at: [-1, 6.1, 1.1], scale: [1, 0.6, 0.4] }, 8),
    P.sphere(0.32, '#FF9DB8', { at: [1, 6.1, 1.1], scale: [1, 0.6, 0.4] }, 8),
  ]
  const g = new Group()
  g.add(solid(merge(outlined), bag, 2), solid(merge(plain), bag, 0))
  g.position.set(...at)
  return g
}

/** Australia: the Sydney Opera House by the harbour, Uluru glowing red, and a kangaroo. */
function australia(bag: Bag): Landmark {
  const g = new Group()
  const parts: Parts = [P.rbox(15, 2, 9, 0.6, '#FFD9B8', { at: [5, 1, 2] }), P.rbox(15.6, 0.6, 9.6, 0.3, '#F2C29C', { at: [5, 0.3, 2] })]
  const glass = '#B7D8F7'
  const sail = (x: number, z: number, s: number, face: 1 | -1) => {
    // Half a cone, its flat side glass, leaning over that side like a sail.
    const shell = bake(new ConeGeometry(3.2 * s, 7.5 * s, 14, 1, false, 0, Math.PI), '#FFFFFF')
    const pane = P.prism([[-3.2 * s, 0], [3.2 * s, 0], [0, 7.5 * s]], 0.2, glass, { rot: [0, Math.PI / 2, 0], at: [0, -3.75 * s, 0] })
    const both = merge([shell, pane])
    both.rotateZ(0.42)
    if (face < 0) both.rotateY(Math.PI)
    both.translate(x, 2 + 2.6 * s, z)
    return both
  }
  parts.push(sail(1, 1, 1, 1), sail(5, 1.2, 1.15, 1), sail(9.5, 1.4, 0.95, 1), sail(4, 4.5, 0.7, -1), sail(7.5, 4.6, 0.6, -1))
  g.add(finish(bag, parts))
  const rock: Parts = [faceted(P.sphere(7, '#EF7F4E', { at: [-10, 0, -7], scale: [1, 0.62, 0.55] }, 9), 0.18)]
  g.add(finish(bag, rock))
  g.add(kangaroo([-6, 0.3, 5], bag))
  return { group: g, top: 13, toys: [], flag: { id: 'australia', at: [-13, 0, 2] } }
}

/** Canada: the CN Tower among red maple trees, and Maple the beaver. */
function canada(bag: Bag, toys: Toy[]): Landmark {
  const g = new Group()
  const cream = '#FFF7F0'
  const parts: Parts = [
    P.cyl(0.8, 2.4, 17, cream, { at: [0, 8.5, 0] }, 12),
    P.cyl(3, 2.3, 2.2, PAL.lavender, { at: [0, 16.5, 0] }, 16),
    P.torus(3, 0.6, PAL.pink, { at: [0, 16.2, 0], rot: [Math.PI / 2, 0, 0] }),
    P.cyl(0.55, 0.75, 5.5, cream, { at: [0, 20.4, 0] }, 10),
    P.cyl(1.1, 1.1, 1, PAL.lavender, { at: [0, 22.5, 0] }, 12),
    P.cyl(0.18, 0.3, 5, cream, { at: [0, 25.4, 0] }, 6),
    P.sphere(0.55, PAL.hotpink, { at: [0, 28.1, 0] }, 10),
  ]
  for (const [x, z, h, c] of [[-6, 3, 7, '#F2615A'], [-9, -3, 6, '#FF9F5A'], [6, -4, 7.5, '#F2615A'], [9, 2, 5.5, '#FFB35A'], [-3, -7, 5, '#E9524F']] as [number, number, number, string][])
    parts.push(...roundTree([x, 0, z], h, c))
  g.add(finish(bag, parts))
  const maple = toy(CANADA_LOOKS.maple, 6.5, [4.5, 0, 6], bag, -0.2)
  toys.push(maple)
  g.add(maple.root)
  return { group: g, top: 30, toys, flag: { id: 'canada', at: [-7.5, 0, 7] } }
}

/** A llama in a pink blanket. */
function llama(at: V3, bag: Bag) {
  const wool = '#FFF3E0'
  const outlined: Parts = [
    P.capsule(1.6, 2.6, wool, { at: [0, 4, 0], rot: [Math.PI / 2, 0, 0] }),
    P.capsule(0.75, 2.8, wool, { at: [0, 6.6, 2.2], rot: [0.18, 0, 0] }),
    P.sphere(1.1, wool, { at: [0, 8.9, 2.6] }, 12),
    P.sphere(0.7, '#F7E3CC', { at: [0, 8.6, 3.5], scale: [1, 0.8, 1] }, 10),
    P.cone(0.35, 1.3, wool, { at: [-0.6, 10.3, 2.4], rot: [0, 0, 0.3] }, 6),
    P.cone(0.35, 1.3, wool, { at: [0.6, 10.3, 2.4], rot: [0, 0, -0.3] }, 6),
    P.rbox(3.4, 0.9, 3.4, 0.4, PAL.hotpink, { at: [0, 5.55, -0.2] }),
    P.sphere(0.8, wool, { at: [0, 4.6, -2.9] }, 10),
  ]
  for (const [x, z] of [[-0.9, 1.6], [0.9, 1.6], [-0.9, -1.6], [0.9, -1.6]]) outlined.push(P.cyl(0.42, 0.38, 3.2, wool, { at: [x, 1.6, z] }, 8))
  const plain: Parts = [
    P.sphere(0.2, PAL.ink, { at: [-0.55, 9.2, 3.4] }, 8),
    P.sphere(0.2, PAL.ink, { at: [0.55, 9.2, 3.4] }, 8),
    P.rbox(3.5, 0.3, 3.5, 0.12, PAL.butter, { at: [0, 5.05, -0.2] }),
    P.sphere(0.25, '#FF9DB8', { at: [-0.8, 8.6, 3.2], scale: [1, 0.6, 0.4] }, 8),
    P.sphere(0.25, '#FF9DB8', { at: [0.8, 8.6, 3.2], scale: [1, 0.6, 0.4] }, 8),
  ]
  const g = new Group()
  g.add(solid(merge(outlined), bag, 2), solid(merge(plain), bag, 0))
  g.position.set(...at)
  return g
}

/** Peru: terraces climbing a green mountain in the Andes, a stone hut on top and a llama. */
function peru(bag: Bag): Landmark {
  const g = new Group()
  const parts: Parts = []
  for (let i = 0; i < 5; i++) {
    const r = 11 - i * 1.9
    const y = i * 2.2
    parts.push(P.cyl(r + 0.35, r + 0.35, 0.6, '#E9D2B0', { at: [0, y + 0.3, 0] }, 24), P.cyl(r, r + 0.2, 2.2, i % 2 ? '#9FDC8C' : '#8FD27E', { at: [0, y + 1.3, 0] }, 24))
  }
  parts.push(P.rbox(3.2, 2.4, 3, 0.4, '#D9CFC4', { at: [0, 12.2, 0] }), faceted(P.cone(2.8, 2.4, '#F2C66B', { at: [0, 14.6, 0], rot: [0, Math.PI / 4, 0] }, 4)))
  parts.push(P.rbox(1, 1.5, 0.3, 0.2, '#8E6F86', { at: [0, 11.7, 1.55] }))
  // Snowy peaks behind.
  for (const [x, z, h, r] of [[-9, -9, 15, 6], [3, -12, 12, 5]]) parts.push(faceted(P.cone(r, h, '#D6B9A8', { at: [x, h / 2, z] }, 6)), faceted(P.cone(r * 0.4, h * 0.4, '#FFFFFF', { at: [x, h * 0.8 + 0.05, z] }, 6)))
  g.add(finish(bag, parts))
  g.add(llama([6.5, 2.2, 7], bag))
  return { group: g, top: 17, toys: [], flag: { id: 'peru', at: [-8, 0, 7] } }
}

/** Thailand: an elephant among palms. */
function thailand(bag: Bag, toys: Toy[]): Landmark {
  const g = new Group()
  const parts: Parts = [...palm([-7, 0, -4], 9, 0.4), ...palm([7, 0, -5], 8, 2.6), ...palm([-4, 0, -9], 7, 1.6)]
  g.add(finish(bag, parts))
  const elephant: Look = { species: 'elephant', height: 1, chub: 1.2, fur: '#C4B8E6', light: '#ECE6FA', dark: '#A79BD0', ear: '#FFB8CC', lashes: true, open: true }
  const e = toy(elephant, 9, [0, 0.3, 2], bag)
  toys.push(e)
  g.add(e.root)
  return { group: g, top: 12, toys, flag: { id: 'thailand', at: [7, 0, 5] } }
}

/** The Poles, south: Pebble and Papa on the ice. */
function polesSouth(bag: Bag, toys: Toy[]): Landmark {
  const g = new Group()
  const parts: Parts = []
  for (const [x, z, s] of [[-8, -5, 4], [7, -7, 5], [10, 3, 3]]) parts.push(faceted(P.cone(s, s * 1.6, '#EAF4FF', { at: [x, s * 0.8, z] }, 5)))
  parts.push(P.rbox(3, 1.6, 2, 0.4, '#DDEBFF', { at: [-4, 0.8, 6] }), P.rbox(2, 1.2, 2, 0.4, '#EAF4FF', { at: [-6, 0.6, 4] }))
  g.add(finish(bag, parts))
  const papa = toy(POLES_LOOKS.papa, 8, [-1.5, 0, 1], bag, 0.2)
  const pebble = toy(POLES_LOOKS.pebble, 5.4, [3, 0, 3], bag, -0.2)
  toys.push(papa, pebble)
  g.add(papa.root, pebble.root)
  return { group: g, top: 11, toys, flag: { id: 'poles', at: [6, 0, -1] } }
}

/** The Poles, north: Pola the polar bear cub by the striped North Pole and an igloo. */
function polesNorth(bag: Bag, toys: Toy[]): Landmark {
  const g = new Group()
  const parts: Parts = []
  for (let i = 0; i < 8; i++) parts.push(P.cyl(0.7, 0.7, 1.25, i % 2 ? '#FFFFFF' : PAL.hotpink, { at: [0, 0.62 + i * 1.25, 0] }, 12))
  parts.push(P.sphere(1.2, PAL.gold, { at: [0, 10.8, 0] }, 12))
  const igloo = bake(new SphereGeometry(4, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), '#FFFFFF', { at: [-7, 0, -3] })
  parts.push(igloo, P.cyl(1.8, 1.8, 3, '#F2F7FF', { at: [-7, 0.6, 0.4], rot: [Math.PI / 2, 0, 0] }, 12), P.cyl(1.2, 1.2, 0.2, '#7A86B8', { at: [-7, 0.9, 1.95], rot: [Math.PI / 2, 0, 0] }, 12))
  g.add(finish(bag, parts))
  const pola = toy(POLES_LOOKS.pola, 6.4, [5, 0, 3], bag, -0.3)
  toys.push(pola)
  g.add(pola.root)
  return { group: g, top: 12, toys }
}

/** Sparkle's house, where the tea party is: a pink cottage with a teapot on the roof and a rainbow behind. */
function home(bag: Bag): Landmark {
  const g = new Group()
  const parts: Parts = [
    P.cyl(6.2, 6.6, 0.6, '#A6DE6E', { at: [0, 0.1, 0.5] }, 20),
    P.rbox(9, 6.5, 7.5, 0.6, '#FFC9DE', { at: [0, 3.4, 0] }),
    P.prism([[-5.7, 0], [5.7, 0], [0, 4.4]], 8.6, PAL.lavenderDark, { at: [0, 6.5, 0] }),
    P.rbox(2.2, 3.4, 0.5, 0.5, PAL.hotpink, { at: [0, 1.8, 3.8] }),
    P.cyl(1.1, 1.1, 0.4, '#FFEFA8', { at: [-2.8, 4.1, 3.8], rot: [Math.PI / 2, 0, 0] }, 14),
    P.cyl(1.1, 1.1, 0.4, '#FFEFA8', { at: [2.8, 4.1, 3.8], rot: [Math.PI / 2, 0, 0] }, 14),
    // The teapot on the roof.
    P.sphere(1.9, '#FFFFFF', { at: [2.4, 10.6, 0], scale: [1, 0.82, 1] }, 14),
    P.cyl(0.9, 1.15, 0.5, PAL.pink, { at: [2.4, 12.1, 0] }, 12),
    P.sphere(0.42, PAL.pink, { at: [2.4, 12.6, 0] }, 8),
    P.cone(0.5, 2.3, '#FFFFFF', { at: [4.6, 11.1, 0], rot: [0, 0, -1.05] }, 8),
    P.torus(0.95, 0.3, PAL.pink, { at: [0.5, 10.7, 0] }),
  ]
  const bands = [PAL.pink, PAL.butter, PAL.mint, PAL.sky]
  bands.forEach((c, i) => parts.push(P.torus(14 - i * 1.3, 0.68, c, { at: [0, 0, -6] }, Math.PI)))
  parts.push(...roundTree([-7, 0, 3], 5, '#7FD7A6'), ...roundTree([7, 0, 2.5], 4.4, '#8FE3B0'))
  g.add(finish(bag, parts))
  return { group: g, top: 15, toys: [] }
}

/** A place with no landmark of its own yet: a big pink pin. */
function pin(bag: Bag): Landmark {
  const g = new Group()
  g.add(finish(bag, [P.cone(2.2, 7, PAL.hotpink, { at: [0, 3.5, 0], rot: [Math.PI, 0, 0] }, 14), P.sphere(3.2, PAL.hotpink, { at: [0, 8.5, 0] }, 16), P.sphere(1.3, '#FFFFFF', { at: [0, 8.8, 2.4] }, 10)]))
  return { group: g, top: 12, toys: [] }
}

export function buildLandmark(id: string, bag: Bag): Landmark {
  const toys: Toy[] = []
  switch (id) {
    case 'italy':
      return italy(bag)
    case 'egypt':
      return egypt(bag)
    case 'china':
      return china(bag, toys)
    case 'australia':
      return australia(bag)
    case 'canada':
      return canada(bag, toys)
    case 'peru':
      return peru(bag)
    case 'thailand':
      return thailand(bag, toys)
    case 'poles':
      return polesSouth(bag, toys)
    case 'poles-north':
      return polesNorth(bag, toys)
    case 'home':
      return home(bag)
    default:
      return pin(bag)
  }
}

// The cafe's kitchen, modeled in code in the house's toon look (engine/geo.ts parts): white tiles behind, the front
// counter Kaylee works at, the back counter and the shelf where finished drinks line up, the ceiling beam the blender
// splats, and the things to poke: the fridge (its door swings, the bottles clink), the coffee machine (it steams),
// the bread baskets (the pretzels bounce), the cake stand (it spins) and the tea set (she pours Mommy a cup).
import { Group, Mesh, MeshBasicMaterial, type ShaderMaterial } from 'three'
import type { Bag } from '../../../../engine/dispose'
import { merge, P, solid } from '../../../../engine/geo'
import { PAL } from '../../../../engine/toon'
import { BACK, BEAM, BREAD, CAKE, COFFEE, COUNTER, FRIDGE, ROOM, SHELF, TEA } from './layout'
import { liquidMaterial } from './liquid'

const TILE = '#FFFFFF'
const GROUT = '#E3DDF0'
const WOOD = '#E8B98A'
const WOOD_DARK = '#C99A6E'

export interface Kitchen {
  root: Group
  fridge: { root: Group; door: Group; bottles: Group }
  coffee: { root: Group; cup: Group; coffee: Mesh; coffeeMat: ShaderMaterial }
  bread: { root: Group; pretzels: Group[] }
  cake: { root: Group; top: Group }
  tea: { root: Group; pot: Group; cup: Group }
  lamps: Group[]
}

export function buildKitchen(bag: Bag): Kitchen {
  const root = new Group()
  const add = <T extends Group | Mesh>(o: T) => (root.add(o), o)
  const z = ROOM.back
  const W = ROOM.x1 - ROOM.x0
  // ---- Floor (checks), the white-tiled wall and a peach band above it ----
  add(solid(merge([
    P.box(W, 0.1, 3.4, '#F6F0FF', { at: [0, -0.05, z + 1.7] }),
    ...Array.from({ length: 14 }, (_, i) => P.box(0.42, 0.004, 0.42, '#EADFFB', { at: [ROOM.x0 + 0.21 + i * 0.84 * 0.5 * 2, 0.002, z + 0.6 + (i % 2) * 0.84] })),
  ]), bag, 0))
  add(solid(merge([
    P.box(W, 1.75, 0.12, TILE, { at: [0, 0.875, z - 0.06] }),
    P.box(W, ROOM.height - 1.75, 0.12, '#FFE3D6', { at: [0, (ROOM.height + 1.75) / 2, z - 0.06] }),
    // Grout lines: the white tiles.
    ...Array.from({ length: 11 }, (_, i) => P.box(W, 0.008, 0.01, GROUT, { at: [0, 0.16 * (i + 1), z + 0.002] })),
    ...Array.from({ length: 37 }, (_, i) => P.box(0.008, 1.75, 0.01, GROUT, { at: [ROOM.x0 + 0.16 * (i + 1), 0.875, z + 0.002] })),
    // A pink tile stripe, and a scalloped trim on the top of the tiles.
    P.box(W, 0.07, 0.014, PAL.pink, { at: [0, 1.06, z + 0.006] }),
    ...Array.from({ length: 30 }, (_, i) => P.sphere(0.1, PAL.pink, { at: [ROOM.x0 + 0.1 + i * 0.2, 1.75, z + 0.01], scale: [1, 0.5, 0.15] }, 10)),
  ]), bag, 1))
  // ---- The ceiling beam with its pendant lamps ----
  add(solid(merge([
    P.box(W, BEAM.y1 - BEAM.y0, BEAM.d, '#FFFFFF', { at: [0, (BEAM.y0 + BEAM.y1) / 2, BEAM.z] }),
    P.box(W, 0.04, BEAM.d + 0.02, PAL.lavenderDark, { at: [0, BEAM.y0 + 0.02, BEAM.z] }),
  ]), bag, 2))
  const lamps = [-0.95, 0.75].map((x) => {
    const g = new Group()
    g.position.set(x, BEAM.y0, BEAM.z + 0.05)
    g.add(solid(merge([P.cyl(0.006, 0.006, 0.18, PAL.ink, { at: [0, -0.09, 0] }, 6), P.cone(0.1, 0.1, PAL.butter, { at: [0, -0.22, 0] }, 18), P.sphere(0.035, '#FFFDF0', { at: [0, -0.27, 0] })]), bag, 1.5))
    root.add(g)
    return g
  })

  // ---- The back counter, the shelf, and the front counter ----
  add(solid(merge([
    P.rbox(BACK.x1 - BACK.x0, BACK.top, BACK.d, 0.03, '#FFFFFF', { at: [(BACK.x0 + BACK.x1) / 2, BACK.top / 2, BACK.z] }),
    P.rbox(BACK.x1 - BACK.x0 + 0.04, 0.05, BACK.d + 0.04, 0.02, PAL.lavender, { at: [(BACK.x0 + BACK.x1) / 2, BACK.top - 0.02, BACK.z] }),
    ...Array.from({ length: 5 }, (_, i) => P.rbox(0.7, BACK.top - 0.18, 0.02, 0.02, '#FFE3EF', { at: [BACK.x0 + 0.45 + i * 0.84, BACK.top / 2 - 0.02, BACK.z + BACK.d / 2 + 0.004] })),
    P.rbox(SHELF.step * SHELF.max + 0.16, 0.04, 0.2, 0.015, WOOD, { at: [SHELF.x0 + (SHELF.step * (SHELF.max - 1)) / 2, SHELF.y - 0.02, SHELF.z + 0.02] }),
    ...[0, 1].map((i) => P.box(0.03, 0.12, 0.16, WOOD_DARK, { at: [SHELF.x0 - 0.02 + i * SHELF.step * (SHELF.max - 1) + i * 0.04, SHELF.y - 0.09, SHELF.z + 0.01] })),
  ]), bag, 2))
  add(solid(merge([
    P.rbox(COUNTER.x1 - COUNTER.x0, COUNTER.top - 0.04, COUNTER.d, 0.03, PAL.pink, { at: [(COUNTER.x0 + COUNTER.x1) / 2, (COUNTER.top - 0.04) / 2, COUNTER.z] }),
    P.rbox(COUNTER.x1 - COUNTER.x0 + 0.06, 0.05, COUNTER.d + 0.06, 0.02, '#FFFFFF', { at: [(COUNTER.x0 + COUNTER.x1) / 2, COUNTER.top - 0.025, COUNTER.z] }),
    // Scalloped awning trim along the counter's front, and white stripes.
    ...Array.from({ length: 13 }, (_, i) => P.sphere(0.1, '#FFFFFF', { at: [COUNTER.x0 + 0.1 + i * 0.2, COUNTER.top - 0.08, COUNTER.z + COUNTER.d / 2 + 0.005], scale: [1, 0.45, 0.12] }, 10)),
    ...Array.from({ length: 6 }, (_, i) => P.box(0.08, COUNTER.top - 0.2, 0.01, '#FFD6E6', { at: [COUNTER.x0 + 0.25 + i * 0.44, (COUNTER.top - 0.2) / 2 + 0.02, COUNTER.z + COUNTER.d / 2 + 0.004] })),
  ]), bag, 2))

  // ---- The fridge: a glass door on its hinge, bottles on three shelves ----
  const fridge = new Group()
  fridge.position.set(FRIDGE.x, 0, FRIDGE.z)
  fridge.userData.pick = 'fridge'
  fridge.add(solid(merge([
    P.rbox(FRIDGE.w, FRIDGE.h, FRIDGE.d, 0.05, '#FFFFFF', { at: [0, FRIDGE.h / 2, 0] }),
    P.box(FRIDGE.w - 0.12, FRIDGE.h - 0.3, 0.02, '#CFEFFF', { at: [0, FRIDGE.h / 2 + 0.05, FRIDGE.d / 2 - 0.05] }),
    P.rbox(FRIDGE.w + 0.02, 0.16, FRIDGE.d + 0.02, 0.04, PAL.sky, { at: [0, FRIDGE.h - 0.06, 0] }),
    ...[0.42, 0.82, 1.22].map((y) => P.box(FRIDGE.w - 0.14, 0.02, FRIDGE.d - 0.12, '#FFFFFF', { at: [0, y, 0.02] })),
  ]), bag, 2))
  const bottles = new Group()
  const BOTTLE = [PAL.hotpink, PAL.mint, PAL.gold, PAL.sky, '#FF9F45']
  bottles.add(solid(merge([0.43, 0.83, 1.23].flatMap((y, r) => [-0.22, -0.08, 0.06, 0.2].map((x, i) => {
    const c = BOTTLE[(i + r * 2) % BOTTLE.length]
    return merge([P.cyl(0.04, 0.045, 0.2, c, { at: [x, y + 0.11, 0.08] }, 12), P.cyl(0.016, 0.03, 0.06, c, { at: [x, y + 0.24, 0.08] }, 10)])
  }))), bag, 1.5))
  fridge.add(bottles)
  // The door's hinge is on its left edge.
  const door = new Group()
  door.position.set(-FRIDGE.w / 2, 0, FRIDGE.d / 2 + 0.01)
  const doorGlass = new Mesh(bag.add(P.box(FRIDGE.w - 0.06, FRIDGE.h - 0.22, 0.02, '#fff', { at: [FRIDGE.w / 2, FRIDGE.h / 2 + 0.02, 0] })), bag.add(new MeshBasicMaterial({ color: '#DFF4FF', transparent: true, opacity: 0.35, depthWrite: false })))
  doorGlass.renderOrder = 2
  door.add(doorGlass)
  door.add(solid(merge([
    P.box(FRIDGE.w - 0.02, 0.05, 0.04, '#FFFFFF', { at: [FRIDGE.w / 2, 0.15, 0] }),
    P.box(FRIDGE.w - 0.02, 0.05, 0.04, '#FFFFFF', { at: [FRIDGE.w / 2, FRIDGE.h - 0.12, 0] }),
    ...[0.02, FRIDGE.w - 0.02].map((x) => P.box(0.05, FRIDGE.h - 0.22, 0.04, '#FFFFFF', { at: [x, FRIDGE.h / 2 + 0.02, 0] })),
    P.capsule(0.018, 0.3, PAL.hotpink, { at: [FRIDGE.w - 0.09, 0.95, 0.04] }),
  ]), bag, 2))
  fridge.add(door)
  root.add(fridge)

  // ---- The coffee machine on the back counter: a little cup under its spout (Daddy's coffee) ----
  const coffee = new Group()
  coffee.position.set(...COFFEE)
  coffee.userData.pick = 'coffee'
  coffee.add(solid(merge([
    P.rbox(0.36, 0.44, 0.3, 0.05, '#E86A6A', { at: [0, 0.22, 0] }),
    P.rbox(0.38, 0.08, 0.34, 0.03, '#C94F4F', { at: [0, 0.48, 0] }),
    P.rbox(0.26, 0.05, 0.14, 0.02, '#D8D2E6', { at: [0, 0.02, 0.17] }),
    P.cyl(0.03, 0.025, 0.08, '#D8D2E6', { at: [0, 0.31, 0.16] }, 12),
    ...[-1, 1].map((s) => P.cyl(0.03, 0.03, 0.03, PAL.butter, { at: [s * 0.1, 0.38, 0.155], rot: [Math.PI / 2, 0, 0] }, 12)),
  ]), bag, 2))
  const ccup = new Group()
  ccup.position.set(0, 0.05, 0.17)
  ccup.add(solid(merge([P.cyl(0.05, 0.04, 0.08, '#FFFFFF', { at: [0, 0.04, 0] }, 14), P.torus(0.025, 0.008, '#FFFFFF', { at: [0.055, 0.045, 0] })]), bag, 1.5))
  const coffeeMat = liquidMaterial(bag)
  const coffeeMesh = new Mesh(bag.add(P.cyl(0.046, 0.04, 1, '#fff', { at: [0, 0.5, 0] }, 14)), coffeeMat)
  coffeeMesh.position.y = 0.01
  coffeeMesh.scale.y = 0.0001
  ccup.add(coffeeMesh)
  coffee.add(ccup)
  root.add(coffee)

  // ---- The cake stand: a pink layer cake on a white stand (it spins) ----
  const cake = new Group()
  cake.position.set(...CAKE)
  cake.userData.pick = 'cake'
  cake.add(solid(merge([P.cyl(0.05, 0.08, 0.03, '#FFFFFF', { at: [0, 0.015, 0] }, 18), P.cyl(0.025, 0.025, 0.14, '#FFFFFF', { at: [0, 0.1, 0] }, 10)]), bag, 2))
  const top = new Group()
  top.position.y = 0.17
  top.add(solid(merge([
    P.cyl(0.2, 0.2, 0.02, '#FFFFFF', {}, 24),
    P.cyl(0.15, 0.15, 0.1, PAL.pink, { at: [0, 0.06, 0] }, 24),
    P.cyl(0.152, 0.152, 0.025, '#FFFDF5', { at: [0, 0.06, 0] }, 24),
    P.cyl(0.1, 0.1, 0.08, PAL.lavender, { at: [0, 0.15, 0] }, 24),
    ...Array.from({ length: 8 }, (_, i) => P.sphere(0.025, '#FFFFFF', { at: [Math.cos(i * 0.785) * 0.13, 0.115, Math.sin(i * 0.785) * 0.13] })),
    P.sphere(0.03, '#FF4F6E', { at: [0, 0.21, 0] }),
    // A slice is already missing on one side (cutting cake is the pizza's toy, not this one).
  ]), bag, 2))
  cake.add(top)
  root.add(cake)

  // ---- The bread baskets: wicker baskets of pretzels and buns ----
  const bread = new Group()
  bread.position.set(...BREAD)
  bread.userData.pick = 'bread'
  bread.add(solid(merge([
    ...[-0.11, 0.11].map((x) => P.cyl(0.11, 0.09, 0.08, WOOD_DARK, { at: [x, 0.04, 0] }, 16)),
    ...[-0.11, 0.11].map((x) => P.torus(0.105, 0.015, WOOD, { at: [x, 0.08, 0], rot: [Math.PI / 2, 0, 0] })),
  ]), bag, 2))
  const pretzels = [-0.16, -0.06, 0.06, 0.16].map((x, i) => {
    const p = new Group()
    p.position.set(x, 0.1, i % 2 ? -0.02 : 0.03)
    if (i % 2) p.add(solid(merge([P.sphere(0.05, '#D99A55', { scale: [1.2, 0.8, 1] }), P.sphere(0.012, '#FFF7F0', { at: [0.02, 0.035, 0.02] })]), bag, 1.5))
    else p.add(solid(merge([P.torus(0.032, 0.014, '#C9803F', { at: [-0.022, 0, 0] }), P.torus(0.032, 0.014, '#C9803F', { at: [0.022, 0, 0] }), P.torus(0.045, 0.014, '#C9803F', { at: [0, -0.012, 0] }, Math.PI)]), bag, 1.5))
    bread.add(p)
    return p
  })
  root.add(bread)

  // ---- The tea set: a teapot on a tray and a teacup for Mommy ----
  const tea = new Group()
  tea.position.set(...TEA)
  tea.userData.pick = 'tea'
  tea.add(solid(merge([P.rbox(0.3, 0.02, 0.18, 0.01, PAL.lavender, { at: [0, 0.01, 0] })]), bag, 1.5))
  const pot = new Group()
  pot.position.set(-0.05, 0.02, 0)
  pot.add(solid(merge([
    P.sphere(0.075, '#FFFFFF', { at: [0, 0.07, 0], scale: [1.1, 0.9, 1] }),
    P.cyl(0.035, 0.05, 0.03, '#FFFFFF', { at: [0, 0.14, 0] }, 12),
    P.sphere(0.018, PAL.pink, { at: [0, 0.165, 0] }),
    P.cone(0.022, 0.09, '#FFFFFF', { at: [0.1, 0.09, 0], rot: [0, 0, -1.0] }, 10),
    P.torus(0.04, 0.012, '#FFFFFF', { at: [-0.09, 0.07, 0] }),
    ...[-0.03, 0, 0.03].map((x) => P.sphere(0.012, PAL.pink, { at: [x, 0.07, 0.08] })),
  ]), bag, 2))
  tea.add(pot)
  const tcup = new Group()
  tcup.position.set(0.1, 0.02, 0.02)
  tcup.add(solid(merge([P.cyl(0.04, 0.03, 0.045, '#FFFFFF', { at: [0, 0.0225, 0] }, 14), P.torus(0.016, 0.006, '#FFFFFF', { at: [0.045, 0.025, 0] }), P.cyl(0.055, 0.05, 0.008, PAL.pink, { at: [0, 0.002, 0] }, 14)]), bag, 1.5))
  tea.add(tcup)
  root.add(tea)

  return { root, fridge: { root: fridge, door, bottles }, coffee: { root: coffee, cup: ccup, coffee: coffeeMesh, coffeeMat }, bread: { root: bread, pretzels }, cake: { root: cake, top }, tea: { root: tea, pot, cup: tcup }, lamps }
}

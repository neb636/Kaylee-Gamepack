// Bo Kluea's village dinner (Pa Kluea's story, story.ts): a set of its own along the same wet road, right of the salt
// hut, where the hut's shots never look. Three little food stalls in a row facing the camera, each with a scalloped
// awning, a lantern hanging off its front edge and its food on the counter: Lung Kwai's noodle soup pot, Pa Kai's
// basket of eggs beside her clay jar of water (salty water makes salty eggs), and Yai Nak's three fish on sticks over
// the coals. String lights along the road behind them, two wooden houses and banana plants across it. Built in the hut's
// toon look; the lanterns and bulbs are flat bright colors (they glow at dusk without any light of their own).
import { Color, Group, Mesh, MeshBasicMaterial, SphereGeometry, type Material } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { blobShadow, merge, P, solid } from '../../../../../engine3d/geo'
import { COUNTER_Y, DINNER, FOOD_SPOTS, FOOD_X, ROAD_Z, STALL_X, STALL_Z, type V3 } from './layout'

const PLANK = '#A57C64'
const PLANK_DARK = '#7E5A4C'
const TIN = '#B7B9C9'
const POT = '#6F6B80'
const CLAY = '#C98A6A'
/** The three awnings: pink (the noodles), butter (the eggs), mint (the fish). */
export const AWNING = ['#FF8FB8', '#FBEA9A', '#8FE3C8']
const LANTERN_OFF = '#B48AA6'
const LANTERN_ON = '#FFD3E6'
const OFF = new Color(LANTERN_OFF)
const ON = new Color(LANTERN_ON)
const BULB_OFF = '#8C86A0'
const BULB_ON = '#FFE38A'

export interface Stall {
  root: Group
  /** The food's group (it bounces when salted), and the lantern (it lights up). */
  food: Group
  lantern: Mesh
  glow: Mesh
  /** Where the salt lands on it (world), one per spot (FOOD_SPOTS). */
  spots: V3[]
}

export interface Dinner {
  root: Group
  stalls: Stall[]
  /** The noodle soup's surface (steam comes off it), and the egg jar's water (the eggs plop into it). */
  soup: Mesh
  jarTop: V3
  /** Pa Kai's eggs, in their basket on the counter (each hops into the jar once her water is salty). */
  eggs: Group[]
  /** Yai Nak's fish on the grill (each shines when it's salted). */
  fish: Group[]
  /** The string lights along the road (they come on one by one at the party). */
  bulbs: Mesh[]
  bulbOn: Material
  bulbOff: Material
}

export function buildDinner(bag: Bag): Dinner {
  const root = new Group()
  const X = DINNER.x
  // ---- The ground: packed earth in front of the stalls ----
  root.add(solid(merge([P.box(9, 0.02, 3.2, '#C2B19F', { at: [X, -0.055, 0.3] })]), bag, 0))
  // ---- Across the road: two wooden houses, banana plants, a tree ----
  const across: ReturnType<typeof P.box>[] = []
  for (const [dx, w, h, color] of [[-2.6, 2.6, 1.7, PLANK], [2.4, 2.9, 1.9, '#B88C72']] as [number, number, number, string][]) {
    const z = ROAD_Z - 2.2
    across.push(P.box(w, h, 1.6, color, { at: [X + dx, h / 2, z] }))
    across.push(P.box(w + 0.1, 0.12, 1.65, PLANK_DARK, { at: [X + dx, 0.06, z] }))
    across.push(P.prism([[-w / 2 - 0.25, 0], [w / 2 + 0.25, 0], [0, 0.75]], 1.9, TIN, { at: [X + dx, h, z] }))
    // A door and two windows, warm inside (the dinner is at dusk).
    across.push(P.box(0.42, 0.8, 0.04, PLANK_DARK, { at: [X + dx - 0.5, 0.4, z + 0.81] }))
    for (const wx of [0.25, 0.85]) across.push(P.box(0.38, 0.32, 0.04, '#FFE3A8', { at: [X + dx + wx, h * 0.62, z + 0.81] }))
  }
  for (const [dx, dz] of [[-4.3, -4.4], [0.1, -4.9], [4.4, -4.2], [-0.9, -4.6]] as [number, number][]) {
    across.push(P.capsule(0.06, 0.9, '#9DBE7E', { at: [X + dx, 0.5, ROAD_Z + dz + 2.0] }))
    for (const a of [0, 1.6, 3.2, 4.7]) across.push(P.sphere(0.3, '#7FBF7A', { at: [X + dx + Math.sin(a) * 0.3, 1.05, ROAD_Z + dz + 2.0 + Math.cos(a) * 0.2], rot: [0, a, 0.9], scale: [1.4, 0.3, 0.6] }))
  }
  across.push(P.capsule(0.12, 1.4, '#8A6A58', { at: [X + 5.2, 0.8, ROAD_Z - 2.5] }), P.sphere(0.9, '#79B07E', { at: [X + 5.2, 2.0, ROAD_Z - 2.5] }))
  root.add(solid(merge(across), bag, 2))

  // ---- The string lights: two posts, a wire, bulbs ----
  const wire: ReturnType<typeof P.box>[] = []
  const x0 = X - 4.2
  const x1 = X + 4.2
  const wz = STALL_Z - 1.05
  for (const x of [x0, x1]) wire.push(P.cyl(0.04, 0.05, 2.5, PLANK_DARK, { at: [x, 1.25, wz] }))
  wire.push(P.box(x1 - x0, 0.015, 0.015, '#4A4458', { at: [X, 2.32, wz] }))
  root.add(solid(merge(wire), bag, 2))
  const bulbOff = bag.add(new MeshBasicMaterial({ color: BULB_OFF }))
  const bulbOn = bag.add(new MeshBasicMaterial({ color: BULB_ON }))
  const bulbGeo = bag.add(new SphereGeometry(0.055, 10, 8))
  const bulbs: Mesh[] = []
  for (let i = 0; i < 17; i++) {
    const k = i / 16
    const m = new Mesh(bulbGeo, bulbOff)
    m.position.set(x0 + 0.3 + k * (x1 - x0 - 0.6), 2.24 - Math.sin(k * Math.PI * 4) ** 2 * 0.08, wz)
    root.add(m)
    bulbs.push(m)
  }

  // ---- The stalls ----
  const lanternGeo = bag.add(new SphereGeometry(0.14, 14, 10))
  const glowGeo = bag.add(new SphereGeometry(0.21, 14, 10))
  const stalls: Stall[] = []
  const eggs: Group[] = []
  const fish: Group[] = []
  let soup: Mesh | null = null
  let jarTop: V3 = [0, 0, 0]
  for (const [i, sx] of STALL_X.entries()) {
    const stall = new Group()
    stall.position.set(sx, 0, STALL_Z)
    root.add(stall)
    const color = AWNING[i]
    const frame = [
      // The counter: a wooden table with a skirt of cloth in the stall's color.
      P.rbox(1.25, 0.08, 0.6, 0.03, PLANK, { at: [0, COUNTER_Y - 0.04, 0] }),
      P.box(1.2, COUNTER_Y - 0.1, 0.04, color, { at: [0, (COUNTER_Y - 0.1) / 2, 0.27] }),
      ...[-0.56, 0.56].map((x) => P.box(0.06, COUNTER_Y - 0.08, 0.5, PLANK_DARK, { at: [x, (COUNTER_Y - 0.08) / 2, 0] })),
      // Two posts at the back and the awning on them, tipped down toward the front, a row of scallops along its edge.
      ...[-0.6, 0.6].map((x) => P.cyl(0.035, 0.035, 1.95, PLANK_DARK, { at: [x, 0.975, -0.75] })),
      P.box(1.45, 0.05, 1.05, color, { at: [0, 1.95, -0.28], rot: [0.22, 0, 0] }),
      ...Array.from({ length: 7 }, (_, k) => P.cyl(0.1, 0.1, 0.03, color, { at: [-0.62 + k * 0.207, 1.84, 0.22], rot: [Math.PI / 2, 0, 0] }, 12)),
    ]
    stall.add(solid(merge(frame), bag, 2))
    const food = new Group()
    food.position.set(FOOD_X[i], COUNTER_Y, 0)
    stall.add(food)
    if (i === 0) {
      // Lung Kwai's big pot of noodle soup, on a little charcoal stove.
      food.add(solid(merge([
        P.cyl(0.2, 0.17, 0.16, CLAY, { at: [0, 0.08, 0] }),
        P.cyl(0.24, 0.22, 0.26, POT, { at: [0, 0.29, 0] }),
        P.torus(0.24, 0.02, '#585468', { at: [0, 0.42, 0], rot: [Math.PI / 2, 0, 0] }),
        ...[-1, 1].map((s) => P.torus(0.05, 0.015, '#585468', { at: [s * 0.26, 0.36, 0], rot: [0, Math.PI / 2, 0] })),
        // A stack of bowls and a jar of chopsticks beside it.
        ...[0, 1, 2].map((k) => P.cyl(0.1, 0.06, 0.06, '#FFFFFF', { at: [0.42, 0.03 + k * 0.045, 0.08] })),
        P.cyl(0.04, 0.04, 0.12, '#B9A6F5', { at: [-0.42, 0.06, 0.1] }),
        ...[-0.01, 0.015].map((dx) => P.cyl(0.006, 0.006, 0.2, '#E8C890', { at: [-0.42 + dx, 0.15, 0.1], rot: [0, 0, dx * 8] })),
      ]), bag, 2))
      soup = solid(merge([
        P.cyl(0.215, 0.215, 0.02, '#F2A04E', { at: [0, 0, 0] }),
        ...[[-0.08, 0.05], [0.06, -0.07], [0.1, 0.08], [-0.05, -0.1]].map(([x, z]) => P.sphere(0.045, '#7FC47A', { at: [x, 0.012, z], scale: [1, 0.3, 1] })),
        ...[[0.0, 0.0], [-0.12, -0.02], [0.12, 0.0]].map(([x, z]) => P.torus(0.04, 0.012, '#FFF1C9', { at: [x, 0.012, z], rot: [Math.PI / 2, 0, 0] })),
      ]), bag, 0).children[0] as Mesh
      soup.position.set(0, 0.4, 0)
      food.add(soup)
    } else if (i === 1) {
      // Pa Kai's clay jar of water (on the right) and her basket of eggs (on the left).
      food.add(solid(merge([
        P.cyl(0.17, 0.14, 0.32, CLAY, { at: [0.12, 0.16, 0] }),
        P.torus(0.15, 0.025, '#B87A5C', { at: [0.12, 0.32, 0], rot: [Math.PI / 2, 0, 0] }),
        P.cyl(0.14, 0.14, 0.01, '#BFE6FF', { at: [0.12, 0.29, 0] }),
        P.cyl(0.2, 0.16, 0.1, '#D2A56C', { at: [-0.32, 0.05, 0.02] }),
        P.torus(0.2, 0.02, '#B8884F', { at: [-0.32, 0.1, 0.02], rot: [Math.PI / 2, 0, 0] }),
      ]), bag, 2))
      jarTop = [sx + FOOD_X[i] + 0.12, COUNTER_Y + 0.3, STALL_Z]
      for (const [k, [x, z]] of [[-0.39, -0.02], [-0.27, 0.06], [-0.3, -0.07], [-0.34, 0.1]].entries()) {
        const m = solid(merge([P.sphere(0.06, k % 2 ? '#FFF4E2' : '#F6E2C6', { scale: [1, 1.25, 1] })]), bag, 2)
        m.position.set(x, 0.14, z)
        m.userData.home = [x, 0.14, z]
        food.add(m)
        eggs.push(m)
      }
    } else {
      // Yai Nak's grill: a long tin tray of glowing coals, three fish on sticks across it.
      food.add(solid(merge([
        P.box(1.0, 0.1, 0.3, TIN, { at: [0, 0.05, 0] }),
        P.box(0.92, 0.02, 0.22, '#FF8A5C', { at: [0, 0.1, 0] }),
        ...[-0.36, -0.12, 0.12, 0.36].map((x) => P.sphere(0.035, '#FFC83D', { at: [x, 0.11, 0.04 * Math.sin(x * 9)], scale: [1, 0.4, 1] })),
      ]), bag, 2))
      for (const [x] of FOOD_SPOTS[2]) {
        const f = solid(merge([
          P.capsule(0.006, 0.5, '#E8C890', { at: [0, 0.16, 0], rot: [Math.PI / 2, 0, 0] }),
          P.sphere(0.07, '#8FA2C4', { at: [0, 0.17, 0.02], scale: [0.75, 0.75, 2.0] }),
          P.sphere(0.05, '#D6DEEC', { at: [0, 0.155, 0.03], scale: [0.7, 0.5, 1.6] }),
          P.cone(0.06, 0.1, '#7A8CB0', { at: [0, 0.17, -0.15], rot: [-Math.PI / 2, 0, 0], scale: [0.4, 1, 1] }),
          P.sphere(0.012, '#2B2330', { at: [0.045, 0.19, 0.13] }),
          P.sphere(0.012, '#2B2330', { at: [-0.045, 0.19, 0.13] }),
        ]), bag, 2)
        f.position.set(x, 0, 0)
        food.add(f)
        fish.push(f)
      }
    }
    // The lantern, off the awning's front edge to the right (clear of the cook's face).
    const lantern = new Mesh(lanternGeo, bag.add(new MeshBasicMaterial({ color: LANTERN_OFF })))
    lantern.position.set(0.48, 1.6, 0.22)
    lantern.scale.set(1, 1.15, 1)
    const glow = new Mesh(glowGeo, bag.add(new MeshBasicMaterial({ color: '#FFC8DE', transparent: true, opacity: 0, depthWrite: false })))
    glow.position.copy(lantern.position)
    stall.add(lantern, glow, solid(merge([P.cyl(0.005, 0.005, 0.2, '#4A4458', { at: [0.48, 1.76, 0.22] })]), bag, 0))
    const shadow = blobShadow(0.9, bag)
    shadow.position.set(0, 0.002, 0)
    stall.add(shadow)
    const spots = FOOD_SPOTS[i].map(([x, z]): V3 => [sx + FOOD_X[i] + x, COUNTER_Y + (i === 0 ? 0.4 : i === 1 ? 0.3 : 0.17), STALL_Z + z])
    stalls.push({ root: stall, food, lantern, glow, spots })
  }
  return { root, stalls, soup: soup!, jarTop, eggs, fish, bulbs, bulbOn, bulbOff }
}

/** The lantern over stall `i` lit by `k` (0 dark .. 1 bright pink, with a soft glow round it). */
export function lightLantern(s: Stall, k: number) {
  ;(s.lantern.material as MeshBasicMaterial).color.copy(OFF).lerp(ON, k)
  ;(s.glow.material as MeshBasicMaterial).opacity = k * 0.2
}

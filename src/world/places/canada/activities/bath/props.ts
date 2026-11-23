// The bath's things, in the toon look of the river (story/sets/bath.ts): the tools on the mossy log (the sponge, the
// little rain cloud, the towel, the comb, a berry bush of each color and the decorations), the pokeables round the pool
// (the bar of soap on its rock, the banana slug, the raven), and the white team sweater Maple holds up. Each is one or
// two merged meshes; anything that moves on its own (the cloud's face, the slug's eye stalks, the raven's wings) is
// its own group. Sizes are meters; every tool is built about its middle, so it sits on the log and under her finger.
import { Group, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid, solidMix, type V3 } from '../../../../engine3d/geo'
import { BERRIES, type Berry, type Deco } from '../../looks'
import { decoModel, mapleLeaf, SWEATER, SWEATER_RED } from '../../characters/mistyLook'
import { berry as berry3d, leaf, type BerryParts, type BerryShape } from '../../story/sets/berries'

const INK = '#2E2233'
/** The inside of the sweater, seen through its neck. */
const SWEATER_INSIDE = '#EADFD0'
const MOSS = '#7DB563'
const MOSS_DARK = '#5E9A4E'
const BARK = '#9A5A44'

export type ToolId = 'sponge' | 'cloud' | 'towel' | 'comb' | Berry
/** What the log holds: a tool, or a decoration to put on her. */
export type LogItem = ToolId | `deco:${Deco}` | `bush:${Berry}` | 'deco:x'

/** A tool: what she holds (`root`, placed each frame), and its model inside (tipped and squashed as it works). */
export interface Prop {
  root: Group
  model: Group
  /** Seconds left of a little squish (it was used, or picked up). */
  squish: number
}
const wrap = (model: Group): Prop => {
  const root = new Group()
  root.add(model)
  return { root, model, squish: 0 }
}

/** The pink sponge: a soft rounded block with little holes, a dab of suds on top. */
export function makeSponge(bag: Bag): Prop {
  const holes = [
    [-0.05, 0.03],
    [0.04, 0.045],
    [0.06, -0.02],
    [-0.02, -0.035],
    [-0.065, -0.03],
    [0.015, 0.0],
  ].map(([x, y]) => P.sphere(0.014, '#E86FA0', { at: [x, y, 0.046], scale: [1, 1, 0.4] }, 8))
  const g = new Group()
  g.add(solidMix([P.rbox(0.2, 0.13, 0.09, 0.04, '#FF9EC6')], [...holes, P.sphere(0.035, '#FFFFFF', { at: [-0.04, 0.075, 0.01] }, 10), P.sphere(0.028, '#FFE3F0', { at: [0.0, 0.08, -0.01] }, 10)], bag, 2.4))
  return wrap(g)
}

/** The little rain cloud: puffy and white with a lavender bottom, a sleepy happy face. Its bottom is where the rain
 *  comes out (y = -0.09). */
export function makeCloud(bag: Bag): Prop {
  const puffs: [number, number, number, number][] = [
    [0, 0.05, 0, 0.13],
    [-0.12, 0.0, 0, 0.1],
    [0.12, 0.0, 0, 0.1],
    [-0.06, 0.09, -0.02, 0.09],
    [0.07, 0.1, -0.02, 0.09],
    [-0.2, -0.02, -0.01, 0.07],
    [0.2, -0.02, -0.01, 0.07],
  ]
  const lined = [...puffs.map(([x, y, z, r]) => P.sphere(r, '#FFFFFF', { at: [x, y, z] }, 16)), P.sphere(0.2, '#E3DAFB', { at: [0, -0.03, 0], scale: [1.25, 0.42, 0.7] }, 18)]
  const face = [
    P.torus(0.018, 0.006, INK, { at: [-0.045, 0.06, 0.122], rot: [0, 0, 0] }, Math.PI),
    P.torus(0.018, 0.006, INK, { at: [0.045, 0.06, 0.122], rot: [0, 0, 0] }, Math.PI),
    P.torus(0.028, 0.007, INK, { at: [0, 0.03, 0.127], rot: [0, 0, Math.PI] }, Math.PI),
    P.sphere(0.022, '#FFB3CC', { at: [-0.085, 0.035, 0.105], scale: [1.2, 0.7, 0.3] }, 8),
    P.sphere(0.022, '#FFB3CC', { at: [0.085, 0.035, 0.105], scale: [1.2, 0.7, 0.3] }, 8),
  ]
  const g = new Group()
  g.add(solidMix(lined, face, bag, 2.4))
  return wrap(g)
}

/** The towel: a soft lavender roll with two pink stripes. */
export function makeTowel(bag: Bag): Prop {
  const g = new Group()
  g.add(
    solidMix(
      // A fluffy pink towel folded in three (each fold a soft slab, a little shorter than the one under it), with two
      // white stripes across its end and a fringe.
      [P.rbox(0.26, 0.05, 0.17, 0.024, '#FFA8CF', { at: [0, -0.04, 0] }), P.rbox(0.25, 0.05, 0.165, 0.024, '#FFB8D8', { at: [0.004, 0.004, 0] }), P.rbox(0.24, 0.05, 0.16, 0.024, '#FFC6E0', { at: [0.008, 0.048, 0] })],
      [
        ...[-0.07, -0.045].map((x) => P.box(0.012, 0.145, 0.172, '#FFFFFF', { at: [x, 0.004, 0] })),
        ...Array.from({ length: 7 }, (_, i) => P.box(0.012, 0.012, 0.03, '#FFFFFF', { at: [0.132, -0.04 + (i % 2) * 0.01, -0.07 + i * 0.023] })),
      ],
      bag,
      2.4,
    ),
  )
  return wrap(g)
}

/** The comb: a pink handle and a row of teeth (pointing down, so it combs where its teeth are). */
export function makeComb(bag: Bag): Prop {
  const teeth = Array.from({ length: 9 }, (_, i) => P.rbox(0.014, 0.07, 0.018, 0.006, '#FF6FAE', { at: [-0.08 + i * 0.02, -0.045, 0] }))
  const g = new Group()
  g.add(solidMix([P.rbox(0.22, 0.045, 0.026, 0.02, '#FF8FB8', { at: [0, 0.0, 0] }), ...teeth], [P.sphere(0.012, '#FFFFFF', { at: [-0.07, 0.006, 0.014] }, 8), P.sphere(0.012, '#FFE3F0', { at: [0.07, 0.006, 0.014] }, 8)], bag, 2.2))
  return wrap(g)
}

/** Which real berry each paint color is: pink a raspberry, blue a blueberry, purple a blackberry. */
const SHAPE: Record<Berry, BerryShape> = { pink: 'bumpy', blue: 'crown', purple: 'long' }

/** A squashed berry in her hand: a big berry of its kind (story/sets/berries.ts) dripping its color (what she paints
 *  with). */
export function makeBerry(berry: Berry, bag: Bag): Prop {
  const c = BERRIES[berry]
  const g = new Group()
  const out: BerryParts = { lined: [], plain: [] }
  berry3d(SHAPE[berry], c, 0.085, [0, 0, 0], out, 9)
  out.lined.push(P.sphere(0.03, c, { at: [0.03, -0.1, 0.02], scale: [1, 1.4, 1] }, 10))
  g.add(solidMix(out.lined, out.plain, bag, 2.4))
  return wrap(g)
}

/** A little berry bush for the log: a leafy mound with clusters of its berries hanging out the front. */
export function makeBush(berry: Berry, bag: Bag): Prop {
  const c = BERRIES[berry]
  const out: BerryParts = {
    lined: [P.sphere(0.11, MOSS_DARK, { at: [0, 0.0, 0] }, 14), P.sphere(0.085, '#4E8F4A', { at: [-0.09, -0.02, 0.02] }, 12), P.sphere(0.085, '#4E8F4A', { at: [0.09, -0.02, 0.02] }, 12)],
    plain: [],
  }
  // Leaves all over the mound, pointing out.
  for (let i = 0; i < 14; i++) {
    const a = i * 2.39
    const up = 0.15 + (i % 4) * 0.32
    const rr = 0.115
    leaf(i % 2 ? '#5FB356' : '#4E9A45', 0.075, [Math.cos(a) * rr * Math.cos(up), 0.01 + Math.sin(up) * 0.1, Math.sin(a) * rr * Math.cos(up) * 0.8], -a, -0.35 - up * 0.3, out)
  }
  // Berries in clusters of two or three, out the front where they show.
  const spots: [number, number, number][] = [[-0.1, 0.05, 0.07], [-0.085, 0.0, 0.1], [0.0, 0.08, 0.09], [0.03, 0.03, 0.12], [-0.03, 0.02, 0.12], [0.1, 0.05, 0.07], [0.085, -0.005, 0.1], [0.02, 0.12, 0.03]]
  for (const at of spots) berry3d(SHAPE[berry], c, 0.03, at, out, 6)
  const g = new Group()
  g.add(solidMix(out.lined, out.plain, bag, 2.2))
  return wrap(g)
}

/** A decoration as it lies on the log, ready to go on her. */
export function makeDecoProp(id: Deco, bag: Bag): Prop {
  const m = decoModel(id, 0.36, bag, 2.2)
  // (Built standing on the origin: lift it so it sits about its middle, and turn its face to the camera.)
  m.position.y = -0.11
  if (id === 'flower' || id === 'bow') m.rotation.x = Math.PI / 2 - 0.35
  const g = new Group()
  g.add(m)
  return wrap(g)
}

/** The mossy log along the bottom of the screen: a fallen trunk 1 m long (scaled to fit), moss along its top, bark
 *  rings at its ends, a little fern sprouting from it. */
export function makeLog(bag: Bag): Group {
  const parts = [
    P.cyl(0.11, 0.11, 1, BARK, { rot: [0, 0, Math.PI / 2] }, 18),
    ...[-0.5, 0.5].map((x) => P.cyl(0.095, 0.095, 0.012, '#D9A77F', { at: [x, 0, 0], rot: [0, 0, Math.PI / 2] }, 18)),
    ...[-0.38, -0.12, 0.15, 0.4].map((x, i) => P.sphere(0.1, i % 2 ? MOSS : MOSS_DARK, { at: [x, 0.07, 0.01], scale: [1.5, 0.45, 1.05] }, 12)),
  ]
  return solid(merge(parts), bag, 2.4)
}

/** The bar of pink soap, with its own bubble. */
export function makeSoap(bag: Bag): Group {
  return solidMix([P.rbox(0.2, 0.08, 0.12, 0.035, '#FFB3D1')], [P.sphere(0.03, '#FFFFFF', { at: [0.05, 0.05, 0.02] }, 10), P.sphere(0.02, '#FFE3F0', { at: [0.0, 0.05, -0.02] }, 8), P.rbox(0.08, 0.008, 0.05, 0.004, '#FF8FB8', { at: [-0.03, 0.041, 0] })], bag, 2)
}

/** A pink rubber duck with a little gold unicorn horn, floating in the pool: round body, round head, an orange beak,
 *  a wing bump each side, a pink tail flick. Head toward +x; it floats with its waterline at y 0. Its `body` group bobs
 *  and squashes on a tap. */
export function makeDuck(bag: Bag) {
  const root = new Group()
  const body = new Group()
  const PINK = '#FF9CC8'
  const PINK_DARK = '#F57FB3'
  body.add(
    solidMix(
      [
        P.sphere(0.11, PINK, { at: [0, 0.03, 0], scale: [1.25, 0.8, 1] }, 18),
        P.sphere(0.075, PINK, { at: [0.08, 0.14, 0] }, 16),
        P.cone(0.04, 0.09, PINK, { at: [-0.13, 0.08, 0], rot: [0, 0, 1.1] }, 10),
        P.sphere(0.04, '#FFA64A', { at: [0.155, 0.125, 0], scale: [1.3, 0.55, 1] }, 12),
        P.cone(0.016, 0.075, '#FFD86B', { at: [0.1, 0.245, 0], rot: [0, 0, -0.35] }, 8),
      ],
      [
        ...[-1, 1].map((s) => P.sphere(0.05, PINK_DARK, { at: [-0.01, 0.06, s * 0.095], scale: [1.3, 0.75, 0.45] }, 12)),
        ...[-1, 1].map((s) => P.sphere(0.013, INK, { at: [0.135, 0.16, s * 0.04] }, 8)),
        ...[-1, 1].map((s) => P.sphere(0.005, '#FFFFFF', { at: [0.142, 0.166, s * 0.045] }, 6)),
        ...[-1, 1].map((s) => P.sphere(0.012, '#FF6FA8', { at: [0.12, 0.125, s * 0.06], scale: [1, 0.6, 0.5] }, 6)),
      ],
      bag,
      1.6,
    ),
  )
  root.add(body)
  return { root, body }
}

/** The flat mossy rock the soap sits on. */
export function makeSoapRock(bag: Bag): Group {
  return solid(merge([P.rbox(0.62, 0.26, 0.5, 0.11, '#9A93A3', { at: [0, 0.13, 0] }), P.sphere(0.28, MOSS, { at: [0, 0.255, 0], scale: [1.1, 0.16, 0.85] }, 12)]), bag, 1.8)
}

/** A banana slug: long and bright yellow with a few brown spots; its two eye stalks are their own group (`stalks`) so
 *  they can stretch out. Its head is toward +x. */
export function makeSlug(bag: Bag) {
  const root = new Group()
  const body = solidMix(
    [P.capsule(0.05, 0.22, '#FFD94A', { at: [0, 0.045, 0], rot: [0, 0, Math.PI / 2], scale: [1, 1, 0.8] }), P.sphere(0.055, '#FFD94A', { at: [0.15, 0.06, 0], scale: [1, 0.9, 0.8] }, 12)],
    [...[-0.08, -0.02, 0.05].map((x, i) => P.sphere(0.012, '#B58A2E', { at: [x, 0.08 - (i % 2) * 0.01, 0.025], scale: [1.3, 1, 0.5] }, 6)), P.sphere(0.01, INK, { at: [0.2, 0.06, 0.025] }, 6), P.torus(0.012, 0.004, INK, { at: [0.2, 0.045, 0.02], rot: [0, 0.8, Math.PI] }, Math.PI)],
    bag,
    1.6,
  )
  const stalks = new Group()
  stalks.position.set(0.17, 0.09, 0)
  stalks.add(solidMix([-1, 1].map((s) => P.capsule(0.009, 0.06, '#FFD94A', { at: [0, 0.035, s * 0.018], rot: [s * 0.35, 0, -0.4] })), [-1, 1].map((s) => P.sphere(0.013, INK, { at: [-0.02, 0.075, s * 0.03] }, 6)), bag, 1.4))
  root.add(body, stalks)
  return { root, stalks }
}

/** A raven on its branch stub: glossy blue-black, a big beak, a little tuft on its head. `wings` flap, `head` turns. */
export function makeRaven(bag: Bag) {
  const root = new Group()
  const BLACK = '#3A3550'
  const SHEEN = '#55507A'
  const body = solidMix(
    [P.sphere(0.13, BLACK, { at: [0, 0.14, 0], scale: [0.95, 1.1, 1.3] }, 16), P.cone(0.07, 0.2, BLACK, { at: [0, 0.07, -0.19], rot: [-Math.PI / 2 - 0.5, 0, 0], scale: [1.3, 1, 0.4] }, 8), ...[-1, 1].map((s) => P.capsule(0.012, 0.04, '#6B6080', { at: [s * 0.04, 0.025, 0.02] }))],
    [P.sphere(0.06, SHEEN, { at: [0, 0.18, 0.08], scale: [1, 1.2, 0.6] }, 10)],
    bag,
    1.8,
  )
  const head = new Group()
  head.position.set(0, 0.27, 0.07)
  head.add(
    solidMix(
      [P.sphere(0.085, BLACK, {}, 16), P.cone(0.035, 0.12, '#4A4458', { at: [0, -0.01, 0.12], rot: [Math.PI / 2, 0, 0] }, 8), P.cone(0.02, 0.06, BLACK, { at: [0, 0.09, -0.02], rot: [-0.4, 0, 0] }, 6)],
      [-1, 1].flatMap((s) => [P.sphere(0.02, '#FFFFFF', { at: [s * 0.05, 0.025, 0.05] }, 8), P.sphere(0.011, INK, { at: [s * 0.056, 0.025, 0.062] }, 6)]),
      bag,
      1.8,
    ),
  )
  const wings = [-1, 1].map((s) => {
    const w = new Group()
    w.position.set(s * 0.11, 0.2, 0)
    w.add(solid(P.sphere(0.1, BLACK, { at: [s * 0.02, -0.06, -0.04], rot: [0.3, 0, s * 0.2], scale: [0.35, 1, 1.4] }, 12), bag, 1.6))
    return w
  })
  root.add(body, head, ...wings)
  return { root, head, wings }
}

/** The white team sweater, held up flat facing +z (Maple holds it over her head by the shoulders, y = 0). About `w`
 *  wide across the body. Her paw print goes on its tummy (`printAt`, the sweater's local point). */
export function heldSweater(w: number, bag: Bag) {
  const root = new Group()
  const h = w * 1.05
  const d = w * 0.12
  /** The crew neck: how wide the scoop is (half), how far it dips (of that), and the red rib's thickness. */
  const NECK_W = w * 0.13
  const NECK_DIP = 0.6
  const NECK_RIB = w * 0.032
  const lined: BufferGeometry[] = [
    // The body, a soft rounded panel, and the sleeves out to each side, a little down.
    P.rbox(w, h, d, w * 0.14, SWEATER, { at: [0, -h / 2, 0] }),
    ...[-1, 1].map((s) => P.rbox(w * 0.5, w * 0.3, d * 0.9, w * 0.12, SWEATER, { at: [s * w * 0.62, -w * 0.2, 0], rot: [0, 0, s * -0.55] })),
    // The crew neck: a red ribbed scoop set into the top edge (the lower half of a ring, flat on the front).
    P.torus(NECK_W, NECK_RIB, SWEATER_RED, { at: [0, -NECK_RIB * 0.6, d / 2], rot: [0, 0, Math.PI], scale: [1, NECK_DIP, 1] }, Math.PI),
  ]
  const front = d / 2 + 0.002
  const plain: BufferGeometry[] = [
    // The neck opening inside the rib: the back of the sweater, a shade darker.
    P.prism(
      Array.from({ length: 17 }, (_, i) => {
        const a = Math.PI + (i / 16) * Math.PI
        return [Math.cos(a) * NECK_W, Math.sin(a) * NECK_W * NECK_DIP - NECK_RIB * 0.6] as [number, number]
      }),
      0.004,
      SWEATER_INSIDE,
      { at: [0, 0, front + 0.0005] },
    ),
    // Red stripes across the hem and round each cuff.
    P.box(w * 0.98, h * 0.06, 0.006, SWEATER_RED, { at: [0, -h * 0.86, front] }),
    P.box(w * 0.98, h * 0.03, 0.006, SWEATER_RED, { at: [0, -h * 0.78, front] }),
    ...[-1, 1].map((s) => P.box(w * 0.07, w * 0.3, 0.006, SWEATER_RED, { at: [s * w * 0.79, -w * 0.32, d * 0.47], rot: [0, 0, s * -0.55] })),
    // The red maple leaf on the chest.
    P.prism(
      mapleLeaf(w * 0.32).map(([x, y]) => [x * 1.08, y * 1.08]),
      0.004,
      '#B8302C',
      { at: [0, -h * 0.38, front + 0.002] },
    ),
    P.prism(mapleLeaf(w * 0.32), 0.004, SWEATER_RED, { at: [0, -h * 0.38, front + 0.005] }),
  ]
  root.add(solidMix(lined, plain, bag, 2.4))
  /** Where her paw print goes (local), and the group it's built into. */
  const printAt: V3 = [0, -h * 0.66, front + 0.006]
  const print = new Group()
  print.position.set(...printAt)
  root.add(print)
  return { root, print, w, h, front: new Vector3(...printAt) }
}

/** A flat paw print facing +z, `s` across: the big pad and four toes, each with a thin ink rim, in her paw's colors
 *  (a plain grey-white where she didn't paint it). */
export function pawPrint(colors: Berry[], s: number, bag: Bag): Group {
  const cols = colors.length ? colors.map((b) => BERRIES[b]) : ['#E6DDD3']
  const parts: BufferGeometry[] = []
  const pad = (x: number, y: number, rx: number, ry: number, c: string) => {
    parts.push(P.cyl(1, 1, 0.003, INK, { at: [x * s, y * s, 0], rot: [Math.PI / 2, 0, 0], scale: [rx * s * 1.18, 1, ry * s * 1.18] }, 20))
    parts.push(P.cyl(1, 1, 0.003, c, { at: [x * s, y * s, 0.003], rot: [Math.PI / 2, 0, 0], scale: [rx * s, 1, ry * s] }, 20))
  }
  pad(0, -0.1, 0.34, 0.27, cols[0])
  ;[[-0.4, 0.2], [-0.15, 0.38], [0.15, 0.38], [0.4, 0.2]].forEach(([x, y], i) => pad(x, y, 0.12, 0.145, cols[(i + 1) % cols.length]))
  const g = new Group()
  g.add(solid(merge(parts), bag, 0))
  return g
}

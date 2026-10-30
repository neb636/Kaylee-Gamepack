// Decorate a Snowman's tools as toy props (greybox: simple shapes in the toon look), and the decorations they leave on
// him. Each tool is built with its working end at the origin (the coal at the bottom of the scoop, the carrot's tip,
// the stick's end, the snow mitten's palm, the paint's nozzle, the hat's brim) and the rest above it, so wherever she
// holds it, that end is where it works. Decorations are built the same way: their root goes on his surface and +y
// points out of him.
import { Group, type BufferGeometry } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../engine3d/geo'
import { makeHat, makeSash } from './props'
import type { ToolId } from './studio'

export const COAL = '#3A3340'
export const CARROT = '#FF8A3D'
export const TWIG = '#7A553E'
export const SCARF = '#FF8FB8'
/** The snow paint's colors, in the order it goes round as she sprays. */
export const RAINBOW = ['#FF6B6B', '#FFA94D', '#FFE066', '#8CE99A', '#74C0FC', '#B197FC', '#FF8FB8']

export interface Tool {
  id: ToolId
  /** At the working end. */
  root: Group
  /** Leans when held (rotation.z). */
  model: Group
  /** How high the working end sits above the toboggan when it rests. */
  lift: number
  lean: number
}

export function buildTool(id: ToolId, bag: Bag): Tool {
  const root = new Group()
  const model = new Group()
  root.add(model)
  const tool: Tool = { id, root, model, lift: 0.04, lean: -0.25 }
  const add = (parts: BufferGeometry[], px = 2) => model.add(solid(merge(parts), bag, px))
  switch (id) {
    case 'coal':
      // A little tin scoop of coal, a lump peeking out of its mouth at the bottom.
      add([
        P.sphere(0.06, COAL, { at: [0, 0.02, 0] }, 10),
        P.cyl(0.11, 0.08, 0.16, '#9AA6C0', { at: [0, 0.12, 0] }, 14),
        P.sphere(0.07, COAL, { at: [0.03, 0.22, 0.02] }, 10),
        P.sphere(0.06, COAL, { at: [-0.04, 0.23, -0.02] }, 10),
        P.capsule(0.025, 0.14, '#7A6A88', { at: [0, 0.32, 0], rot: [0, 0, 0.3] }),
      ])
      tool.lift = 0.05
      break
    case 'carrot':
      // A chunky carrot, tip down, its green leaves on top.
      add([
        P.cone(0.07, 0.36, CARROT, { at: [0, 0.18, 0], rot: [Math.PI, 0, 0] }, 12),
        ...[-0.5, 0, 0.5].map((a) => P.capsule(0.022, 0.1, '#5DBB63', { at: [Math.sin(a) * 0.05, 0.42, 0], rot: [0, 0, a] })),
      ])
      tool.lift = 0.02
      tool.lean = 0
      break
    case 'stick':
      // A twig with two little fingers at the top.
      add([
        P.cyl(0.03, 0.04, 0.5, TWIG, { at: [0, 0.25, 0] }, 6),
        P.cyl(0.02, 0.025, 0.16, TWIG, { at: [0.05, 0.47, 0], rot: [0, 0, -0.7] }, 6),
        P.cyl(0.02, 0.025, 0.14, TWIG, { at: [-0.04, 0.5, 0], rot: [0, 0, 0.6] }, 6),
      ], 1.6)
      tool.lift = 0.02
      tool.lean = 0.2
      break
    case 'snow':
      // A big blue mitten holding a snowball: the snow pats on where the palm is.
      add([
        P.sphere(0.1, '#FFFFFF', { at: [0, 0.04, 0] }, 14),
        P.sphere(0.12, '#74A7F0', { at: [0, 0.17, 0], scale: [1.05, 0.9, 0.6] }, 14),
        P.sphere(0.05, '#74A7F0', { at: [0.11, 0.18, 0], scale: [1, 1.4, 0.8] }, 10),
        P.cyl(0.1, 0.1, 0.08, '#FFFFFF', { at: [0, 0.29, 0] }, 14),
      ])
      tool.lift = 0.08
      break
    case 'paint':
      // A squeeze bottle of rainbow snow paint (colored water in a spray bottle), its nozzle at the bottom.
      add([
        P.cyl(0.018, 0.018, 0.04, '#FFFFFF', { at: [0, 0.02, 0] }, 8),
        P.sphere(0.04, '#FFFFFF', { at: [0, 0.05, 0], scale: [1, 0.5, 1] }, 10),
        ...RAINBOW.slice(0, 6).map((c, i) => P.cyl(0.06, 0.06, 0.034, c, { at: [0, 0.085 + i * 0.034, 0] }, 14)),
        P.sphere(0.06, '#FFFFFF', { at: [0, 0.29, 0], scale: [1, 0.5, 1] }, 12),
      ])
      tool.lift = 0.04
      break
    case 'tuque': {
      // The carnival's red tuque (the snowmen wear it), its brim at the origin.
      const hat = makeHat(bag)
      hat.scale.setScalar(0.22)
      hat.position.y = -0.6 * 0.22
      model.add(hat)
      tool.lift = 0.02
      tool.lean = 0
      break
    }
    case 'sash': {
      // The woven sash, rolled up in a ring.
      const sash = makeSash(bag)
      sash.scale.setScalar(0.16)
      sash.position.y = 0.06
      sash.rotation.x = -0.5
      model.add(sash)
      tool.lift = 0.08
      tool.lean = 0
      break
    }
    case 'scarf':
      // A pink scarf in a loop, both tails hanging.
      add([
        P.torus(0.1, 0.035, SCARF, { at: [0, 0.14, 0], rot: [Math.PI / 2.4, 0, 0] }),
        P.rbox(0.06, 0.18, 0.025, 0.012, SCARF, { at: [0.06, 0.06, 0.06], rot: [0, 0, 0.2] }),
        P.rbox(0.06, 0.15, 0.025, 0.012, '#FFD3E4', { at: [0.11, 0.07, 0.04], rot: [0, 0, -0.15] }),
      ])
      tool.lift = 0.04
      tool.lean = 0
      break
  }
  return tool
}

/** Templates for what she puts on him (cloned per piece, so they share their geometry). Each points out along +y. */
export function decorTemplates(bag: Bag) {
  return {
    coal: solid(merge([P.sphere(0.055, COAL, { at: [0, 0.01, 0], scale: [1, 0.7, 1] }, 9)]), bag, 1),
    carrot: solid(merge([P.cone(0.065, 0.42, CARROT, { at: [0, 0.17, 0] }, 12), P.sphere(0.066, CARROT, { at: [0, -0.04, 0], scale: [1, 0.4, 1] }, 10)]), bag, 1.4),
    stick: solid(
      merge([
        P.cyl(0.035, 0.05, 0.8, TWIG, { at: [0, 0.36, 0] }, 6),
        P.cyl(0.025, 0.032, 0.26, TWIG, { at: [0.08, 0.68, 0], rot: [0, 0, -0.7] }, 6),
        P.cyl(0.025, 0.032, 0.22, TWIG, { at: [-0.06, 0.72, 0], rot: [0, 0, 0.6] }, 6),
      ]),
      bag,
      1.4,
    ),
    snow: solid(merge([P.sphere(0.13, '#FFFFFF', { scale: [1, 0.8, 1] }, 12), P.sphere(0.07, '#EEF2FB', { at: [0.07, 0.05, 0.03] }, 8)]), bag, 1.6),
    scarf: solid(
      merge([
        P.torus(0.92, 0.17, SCARF, { rot: [Math.PI / 2, 0, 0] }),
        P.torus(0.92, 0.06, '#FFD3E4', { at: [0, 0.05, 0], rot: [Math.PI / 2, 0, 0] }),
        P.rbox(0.32, 0.9, 0.12, 0.06, SCARF, { at: [0.55, -0.5, 0.78], rot: [0.25, -0.6, 0.12] }),
        P.rbox(0.32, 0.08, 0.13, 0.03, '#FFD3E4', { at: [0.62, -0.92, 0.86], rot: [0.25, -0.6, 0.12] }),
      ]),
      bag,
      2,
    ),
    /** The carnival tuque for a head of radius 1 (from the park's props). */
    tuque: makeHat(bag),
    sash: makeSash(bag),
  }
}
export type Decor = ReturnType<typeof decorTemplates>

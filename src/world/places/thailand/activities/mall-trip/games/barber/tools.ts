// The barber's tools as toy props in the house's look. Each is built with its working end at the origin (the tonic's
// nozzle, where the scissors' blades cross, the comb's teeth, the spray's nozzle, the dryer's mouth, the bow) and the
// rest of it above, so wherever she holds it, that end is where it works. On the trolley they stand facing her.
import { Group } from 'three'
import type { Bag } from '../../../../engine/dispose'
import { merge, P, solid } from '../../../../engine/geo'
import { PAL } from '../../../../engine/toon'
import { BOW_COLORS } from './hair'
import type { ToolId, TrayItem } from './layout'

const STEEL = '#D8D2E6'

export interface Tool {
  item: TrayItem
  /** At the working end. */
  root: Group
  /** Leans when held (rotation.z). */
  model: Group
  /** How high the working end sits above the trolley when it rests. */
  lift: number
  lean: number
  /** The scissors' two blades (they snip open and shut). */
  blades?: [Group, Group]
}

export function buildTool(item: TrayItem, bag: Bag): Tool {
  const root = new Group()
  const model = new Group()
  root.add(model)
  const add = (g: Group) => (model.add(g), g)
  const tool: Tool = { item, root, model, lift: 0.04, lean: -0.25 }
  const kinds: Record<ToolId, () => void> = {
    tonic: () => {
      // A round purple squeeze bottle with a magic star on it, its nozzle pointing down.
      add(solid(merge([
        P.cone(0.025, 0.06, '#FFFFFF', { at: [0, 0.03, 0], rot: [Math.PI, 0, 0] }),
        P.cyl(0.035, 0.05, 0.05, '#FFFFFF', { at: [0, 0.08, 0] }),
        P.sphere(0.1, '#B98CF2', { at: [0, 0.19, 0], scale: [1, 1.15, 0.9] }),
        P.sphere(0.035, PAL.gold, { at: [0, 0.2, 0.085], scale: [1, 1, 0.35] }),
      ]), bag, 2))
      tool.lift = 0.06
    },
    scissors: () => {
      // Two blades crossing at the origin (each its own pivot, so they snip), pink finger rings above.
      const blade = (s: number) => {
        const g = solid(merge([
          P.cone(0.022, 0.16, STEEL, { at: [0, -0.07, 0], rot: [Math.PI, 0, 0], scale: [1, 1, 0.4] }),
          P.cyl(0.012, 0.012, 0.12, STEEL, { at: [s * 0.03, 0.06, 0], rot: [0, 0, s * 0.45] }),
          P.torus(0.04, 0.014, PAL.hotpink, { at: [s * 0.065, 0.14, 0] }),
        ]), bag, 2)
        return add(g)
      }
      tool.blades = [blade(-1), blade(1)]
      add(solid(P.sphere(0.018, PAL.gold, { at: [0, 0, 0.01] }), bag, 1.5))
      tool.lift = 0.12
      tool.lean = 0
    },
    comb: () => {
      // A wide pink comb, teeth down.
      add(solid(merge([
        P.rbox(0.3, 0.06, 0.025, 0.015, '#FF8FB8', { at: [0, 0.07, 0] }),
        ...Array.from({ length: 9 }, (_, i) => P.box(0.014, 0.07, 0.018, '#FF8FB8', { at: [-0.13 + i * 0.0325, 0.01, 0] })),
      ]), bag, 2))
      tool.lift = 0.04
      tool.lean = 0
    },
    spray: () => {
      // A can of rainbow color spray: a white can with rainbow stripes, its nozzle at the bottom.
      add(solid(merge([
        P.cyl(0.018, 0.018, 0.03, '#FFFFFF', { at: [0, 0.015, 0] }),
        P.sphere(0.04, '#FFFFFF', { at: [0, 0.05, 0], scale: [1, 0.5, 1] }),
        ...['#FF6B6B', '#FFA94D', '#FFE066', '#8CE99A', '#74C0FC', '#B197FC'].map((c, i) => P.cyl(0.055, 0.055, 0.032, c, { at: [0, 0.08 + i * 0.032, 0] })),
        P.sphere(0.055, '#FFFFFF', { at: [0, 0.27, 0], scale: [1, 0.5, 1] }),
      ]), bag, 2))
      tool.lift = 0.04
    },
    dryer: () => {
      // A big lavender hair dryer: its mouth at the origin pointing down, the body and handle above.
      add(solid(merge([
        P.cyl(0.07, 0.06, 0.06, '#8E7BD6', { at: [0, 0.03, 0] }),
        P.cyl(0.085, 0.085, 0.2, PAL.lavenderDark, { at: [0, 0.16, 0] }),
        P.sphere(0.085, PAL.lavenderDark, { at: [0, 0.26, 0] }),
        P.capsule(0.03, 0.12, PAL.lavender, { at: [0.11, 0.24, 0], rot: [0, 0, 1.2] }),
        P.sphere(0.03, PAL.hotpink, { at: [0.05, 0.2, 0.08] }),
      ]), bag, 2))
      tool.lift = 0.06
    },
    bow: () => {
      const c = BOW_COLORS[item.color ?? 'p']
      add(solid(merge([...[-1, 1].map((s) => P.cone(0.07, 0.11, c, { at: [s * 0.06, 0, 0], rot: [0, 0, s * Math.PI / 2], scale: [1, 1, 0.55] })), P.sphere(0.035, c)]), bag, 2))
      tool.lean = 0
    },
    clip: () => {
      const c = BOW_COLORS[item.color ?? 'y']
      add(solid(merge([P.rbox(0.15, 0.04, 0.03, 0.018, c, { rot: [0, 0, 0.3] }), P.sphere(0.04, '#FFFFFF', { at: [0, 0, 0.02], scale: [1, 1, 0.5] })]), bag, 2))
      tool.lean = 0
    },
  }
  kinds[item.tool]()
  return tool
}

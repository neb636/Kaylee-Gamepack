// The vet's tools as toy props in the house's look. Each is built with its working tip at the origin (the chest piece,
// the thermometer's bulb, the tweezers' points, the soap's middle) and the rest of it above, so wherever she holds it,
// the tip is where it works. On the tray they stand up facing her; held, they lean a little.
import { Group, Mesh, MeshBasicMaterial } from 'three'
import type { Bag } from '../../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../../engine3d/geo'
import { PAL } from '../../../../../../engine3d/toon'
import { TOOL_SCALE, type ToolId, type TrayItem } from './layout'

const STEEL = '#D8D2E6'
const STEEL_DARK = '#A9A2C2'

export interface Tool {
  item: TrayItem
  /** At the tip. */
  root: Group
  /** Leans when held (rotation.z). */
  model: Group
  /** How high the tip sits above the tray when it's resting. */
  lift: number
  /** How much it leans when held. */
  lean: number
  /** The parts that only show on the tray (the stethoscope's tube, ring and ear tips: in her hand they're on Kaylee). */
  rest?: Group
  /** Where a hose joins it (model-local y), for the stethoscope's chest piece. */
  stem?: number
  /** The thermometer's red line (scale.y 0..1). */
  bar?: Group
  /** The medicine on the spoon. */
  medicine?: Group
  /** The tissue box on the tray, and the giant tissue she pulls out of it. */
  box?: Group
  tissue?: Group
}

export function buildTool(item: TrayItem, bag: Bag): Tool {
  const root = new Group()
  const model = new Group()
  root.add(model)
  const add = (g: Group) => (model.add(g), g)
  const tool: Tool = { item, root, model, lift: 0.02, lean: -0.3 }
  const c = item.color ?? PAL.pink
  const kinds: Record<ToolId, () => void> = {
    stethoscope: () => {
      // The chest piece facing her, with a short stem up from it (where Kaylee's long tube joins it when she holds it).
      add(solid(merge([
        P.cyl(0.065, 0.065, 0.035, STEEL, { rot: [Math.PI / 2, 0, 0] }, 20),
        P.cyl(0.045, 0.045, 0.04, STEEL_DARK, { at: [0, 0, 0.004], rot: [Math.PI / 2, 0, 0] }, 20),
        P.capsule(0.017, 0.05, PAL.hotpink, { at: [0, 0.075, 0] }),
      ]), bag, 2))
      // On the tray the rest of it stands up too: the tube to a ring that opens at the top, and the two gold ear tips.
      // Held, those are on Kaylee's own ears instead (stethoscope.ts), never on the patient.
      const R = 0.09
      const cy = 0.27
      tool.rest = add(solid(merge([
        P.capsule(0.017, 0.04, PAL.hotpink, { at: [0, 0.15, 0] }),
        P.torus(R, 0.017, PAL.hotpink, { at: [0, cy, 0], rot: [0, 0, Math.PI * 0.66] }, Math.PI * 1.68),
        ...[-1, 1].map((s) => P.sphere(0.028, PAL.gold, { at: [s * R * Math.sin(0.16 * Math.PI), cy + R * Math.cos(0.16 * Math.PI), 0] })),
      ]), bag, 2))
      tool.stem = 0.11
      tool.lift = 0.07
      // Held, the stem leans back toward her (she's at the left), not away.
      tool.lean = 0.25
    },
    thermometer: () => {
      add(solid(merge([P.capsule(0.03, 0.24, '#FFFFFF', { at: [0, 0.15, 0] }), P.sphere(0.035, '#FF5A6E', { at: [0, 0.02, 0] }), P.rbox(0.05, 0.05, 0.05, 0.015, PAL.sky, { at: [0, 0.3, 0] })]), bag, 2))
      // The red line inside, which climbs while she takes a temperature.
      const bar = new Group()
      bar.position.set(0, 0.03, 0.026)
      bar.add(new Mesh(bag.add(P.box(0.018, 0.22, 0.004, '#FF5A6E', { at: [0, 0.11, 0] })), bag.add(new MeshBasicMaterial({ color: '#FF5A6E' }))))
      bar.scale.y = 0.15
      model.add(bar)
      tool.bar = bar
      tool.lift = 0.04
    },
    tweezers: () => {
      add(solid(merge([...[-1, 1].map((s) => P.box(0.022, 0.28, 0.02, STEEL, { at: [s * 0.022, 0.14, 0], rot: [0, 0, -s * 0.09] })), P.box(0.08, 0.03, 0.026, STEEL_DARK, { at: [0, 0.28, 0] }), P.box(0.06, 0.04, 0.012, PAL.hotpink, { at: [0, 0.17, 0.016] })]), bag, 2))
      tool.lift = 0.01
    },
    cream: () => {
      add(solid(merge([P.cone(0.022, 0.05, '#FFFFFF', { at: [0, 0.025, 0], rot: [Math.PI, 0, 0] }), P.cyl(0.03, 0.03, 0.03, '#FFFFFF', { at: [0, 0.06, 0] }), P.cyl(0.055, 0.05, 0.2, PAL.mint, { at: [0, 0.17, 0] }, 20), P.box(0.12, 0.03, 0.03, PAL.mint, { at: [0, 0.28, 0] }), P.cyl(0.056, 0.056, 0.05, '#FFFFFF', { at: [0, 0.17, 0] }, 20)]), bag, 2))
      tool.lift = 0.01
    },
    bandage: () => {
      // A roll of bandage in her color, its end hanging down.
      add(solid(merge([P.cyl(0.085, 0.085, 0.09, c, { rot: [Math.PI / 2, 0, 0] }, 22), P.cyl(0.03, 0.03, 0.092, '#FFFFFF', { rot: [Math.PI / 2, 0, 0] }, 12), P.box(0.09, 0.12, 0.012, c, { at: [0.035, -0.08, 0.04] })]), bag, 2))
      tool.lift = 0.09
      tool.lean = 0
    },
    brush: () => {
      add(solid(merge([P.rbox(0.2, 0.06, 0.06, 0.025, PAL.pink, { at: [0, 0.05, 0] }), ...[-0.07, -0.035, 0, 0.035, 0.07].map((x) => P.box(0.016, 0.04, 0.04, '#FFFFFF', { at: [x, 0.005, 0] })), P.capsule(0.025, 0.14, PAL.lavenderDark, { at: [0, 0.18, 0] })]), bag, 2))
      tool.lift = 0.03
      tool.lean = -0.15
    },
    soap: () => {
      add(solid(merge([P.rbox(0.19, 0.11, 0.08, 0.035, '#FF9CC8'), ...[[-0.05, 0.08, 0.03], [0.03, 0.095, 0.04], [0.07, 0.07, 0.035]].map(([x, y, r]) => P.sphere(r, '#FFFFFF', { at: [x, y, 0] }))]), bag, 2))
      tool.lift = 0.06
      tool.lean = 0.15
    },
    shower: () => {
      // The shower head pointing down, its handle and a loop of hose.
      add(solid(merge([P.cyl(0.085, 0.06, 0.05, STEEL, {}, 22), P.cyl(0.07, 0.07, 0.01, STEEL_DARK, { at: [0, -0.026, 0] }, 22), P.capsule(0.026, 0.16, STEEL, { at: [0.05, 0.13, 0], rot: [0, 0, -0.35] }), P.torus(0.08, 0.016, PAL.sky, { at: [0.15, 0.26, 0] }, Math.PI * 1.3)]), bag, 2))
      tool.lift = 0.06
      tool.lean = 0.15
    },
    towel: () => {
      add(solid(merge([P.rbox(0.24, 0.16, 0.07, 0.03, PAL.lavender), P.box(0.245, 0.03, 0.072, PAL.mint, { at: [0, 0.04, 0] }), P.box(0.245, 0.03, 0.072, PAL.mint, { at: [0, -0.04, 0] })]), bag, 2))
      tool.lift = 0.08
      tool.lean = 0.1
    },
    bow: () => {
      add(solid(buildBowGeometry(c, 1), bag, 2))
      tool.lift = 0.07
      tool.lean = 0
    },
    spoon: () => {
      add(solid(merge([P.sphere(0.06, STEEL, { scale: [1, 0.42, 1.25] }), P.capsule(0.017, 0.2, STEEL, { at: [0, 0.14, -0.02], rot: [0.15, 0, 0] }), P.sphere(0.03, PAL.hotpink, { at: [0, 0.27, -0.04] })]), bag, 2))
      const med = solid(merge([P.sphere(0.05, '#FF6FAE', { at: [0, 0.018, 0], scale: [1, 0.3, 1.2] })]), bag, 0)
      model.add(med)
      tool.medicine = med
      tool.lift = 0.03
    },
    tissue: () => {
      // On the tray: a box with a tissue poking out. Held: a giant tissue, pulled out of it.
      tool.box = add(solid(merge([P.rbox(0.22, 0.12, 0.14, 0.03, PAL.sky, { at: [0, 0.06, 0] }), P.sphere(0.06, '#FFFFFF', { at: [0, 0.14, 0], scale: [1.2, 1, 0.6] })]), bag, 2))
      tool.tissue = add(solid(merge([P.rbox(0.38, 0.34, 0.03, 0.04, '#FFFFFF', { at: [0, 0.12, 0], rot: [0, 0, 0.1] }), P.sphere(0.07, '#F4F0FF', { at: [0.1, 0.25, 0.02], scale: [1, 0.6, 0.4] })]), bag, 2))
      tool.tissue.visible = false
      tool.lift = 0.005
      tool.lean = 0
    },
  }
  kinds[item.tool]()
  model.scale.setScalar(TOOL_SCALE)
  tool.lift *= TOOL_SCALE
  return tool
}

/** A bow (for the tray, for a patient's head, for Daddy): two loops and a knot, about 0.2 m across × `k`. */
export function buildBowGeometry(color: string, k: number) {
  return merge([...[-1, 1].map((s) => P.cone(0.075 * k, 0.12 * k, color, { at: [s * 0.065 * k, 0, 0], rot: [0, 0, s * Math.PI / 2], scale: [1, 1, 0.55] })), P.sphere(0.04 * k, color, {})])
}

// The barber's tools as toy props in the house's look. Each is built with its working end at the origin (the tonic's
// nozzle, where the scissors' blades cross, the comb's teeth, the spray's nozzle, the dryer's mouth, the bow) and the
// rest of it above, so wherever she holds it, that end is where it works. On the trolley they stand facing her.
import { ExtrudeGeometry, Group, Path, Shape, type BufferGeometry } from 'three'
import type { Bag } from '../../../../engine/dispose'
import { bake, merge, P, solid, type V3 } from '../../../../engine/geo'
import { PAL } from '../../../../engine/toon'
import { BOW_COLORS } from './hair'
import type { ToolId, TrayItem } from './layout'

const STEEL = '#C2CFEA'

/** A flat cut-out (a blade, a comb) pushed along z with a small rounded edge, so it catches the light like the rounded boxes. */
function cutout(shape: Shape, depth: number, color: string, at: V3 = [0, 0, 0], bevel = 0.004): BufferGeometry {
  const g = new ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 10 })
  g.translate(0, 0, -depth / 2)
  return bake(g, color, { at })
}

/** A pill shape (w x h, round ends) as an outline for P.prism: a shine. */
function stadium(w: number, h: number): [number, number][] {
  const r = h / 2
  const pts: [number, number][] = []
  for (const [cx, a0] of [[w / 2 - r, -Math.PI / 2], [-w / 2 + r, Math.PI / 2]] as const) for (let i = 0; i <= 6; i++) pts.push([cx + Math.cos(a0 + (i / 6) * Math.PI) * r, Math.sin(a0 + (i / 6) * Math.PI) * r])
  return pts
}

/** A comb's outline, teeth down with their tips at y = 0: a rounded spine on top and tapering teeth with round tips,
 *  all one shape (so there's one ink line round it, not one per tooth). */
function combShape(teeth: number, pitch: number, base: number, tip: number, spine: [number, number], round: number) {
  const [y0, y1] = spine
  const span = ((teeth - 1) * pitch) / 2
  const x0 = span + base
  const cx = (i: number) => -span + i * pitch
  const s = new Shape()
  s.moveTo(-x0 + round, y1)
  s.lineTo(x0 - round, y1)
  s.quadraticCurveTo(x0, y1, x0, y1 - round)
  for (let i = teeth - 1; i >= 0; i--) {
    s.lineTo(cx(i) + base, y0)
    s.lineTo(cx(i) + tip, tip)
    s.absarc(cx(i), tip, tip, 0, -Math.PI, true)
    s.lineTo(cx(i) - base, y0)
    // The little round valley between this tooth and the next one.
    if (i > 0) s.absarc(cx(i) - pitch / 2, y0, (pitch - 2 * base) / 2, 0, Math.PI, false)
  }
  s.lineTo(-x0, y1 - round)
  s.quadraticCurveTo(-x0, y1, -x0 + round, y1)
  return s
}

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
      // Two chunky steel blades crossing at the origin, each its own pivot so they snip. Each half is one flat cut-out:
      // a blade that tapers to a rounded point, a neck, and a big pink finger ring bent outward, so the two rings sit
      // side by side (a plain pivot would swing each ring back over the other) and the halves cross like a real pair.
      // `side` 1 is the half that turns clockwise-open (tip to the right, ring to the left); -1 mirrors it.
      const half = (side: 1 | -1, z: number) => {
        const X = (x: number) => side * x
        const blade = new Shape()
        blade.moveTo(X(-0.019), 0.13)
        blade.lineTo(X(-0.027), 0)
        blade.lineTo(X(-0.004), -0.152)
        blade.quadraticCurveTo(X(0.004), -0.17, X(0.015), -0.153)
        blade.quadraticCurveTo(X(0.05), -0.08, X(0.045), -0.01)
        blade.lineTo(X(0.019), 0.03)
        blade.lineTo(X(0.019), 0.13)
        blade.closePath()
        const ring = new Shape()
        ring.absarc(X(-0.015), 0.16, 0.044, 0, Math.PI * 2, false)
        const hole = new Path()
        hole.absarc(X(-0.015), 0.16, 0.024, 0, Math.PI * 2, true)
        ring.holes.push(hole)
        const front = z + 0.007 + 0.004
        return add(solid(merge([
          cutout(blade, 0.014, STEEL, [0, 0, z]),
          // (The ring is thicker than the neck it grows from, or the two flat faces fight over the same depth.)
          cutout(ring, 0.022, PAL.hotpink, [0, 0, z]),
          // A shine along the cutting edge.
          P.prism([[X(-0.02), -0.02], [X(-0.012), -0.02], [X(0.001), -0.14], [X(-0.003), -0.14]], 0.004, '#FFFFFF', { at: [0, 0, front + 0.002] }),
        ]), bag, 1.6))
      }
      tool.blades = [half(1, -0.012), half(-1, 0.012)]
      // The gold screw where they cross, in front of both.
      add(solid(merge([
        P.cyl(0.03, 0.03, 0.014, PAL.gold, { at: [0, 0, 0.034], rot: [Math.PI / 2, 0, 0] }, 18),
        P.cyl(0.011, 0.011, 0.018, '#E0A31F', { at: [0, 0, 0.036], rot: [Math.PI / 2, 0, 0] }, 12),
      ]), bag, 1.5))
      // Standing on its two tips.
      tool.lift = 0.17
      tool.lean = 0
    },
    comb: () => {
      // A chunky pink comb standing on its teeth: one rounded shape (a spine with a shine, six tapering teeth with
      // gaps wide enough that the ink line doesn't close them).
      const shape = combShape(6, 0.0475, 0.0125, 0.0095, [0.068, 0.132], 0.03)
      const k = 0.034
      const heart = new Shape()
      heart.moveTo(0, -0.5 * k)
      heart.bezierCurveTo(-0.9 * k, 0.1 * k, -0.5 * k, 0.8 * k, 0, 0.3 * k)
      heart.bezierCurveTo(0.5 * k, 0.8 * k, 0.9 * k, 0.1 * k, 0, -0.5 * k)
      add(solid(merge([
        cutout(shape, 0.028, PAL.pink, [0, 0, 0], 0.0025),
        // A soft shine along the spine, and a heart.
        P.prism(stadium(0.11, 0.014), 0.004, '#FFD6E6', { at: [-0.045, 0.113, 0.0185] }),
        cutout(heart, 0.004, PAL.hotpink, [0.085, 0.099, 0.0185], 0.0015),
      ]), bag, 1.6))
      tool.lift = 0.012
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

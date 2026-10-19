// The trip's toy props in the house's look (geo.ts parts, toon colors, ink outlines): everything Kaylee can pack, and
// her big pink suitcase, whose lid flaps, which bulges the fuller it gets and which rides along the whole trip (the
// stairs, Aunty Sri's trunk, the x-ray belt). Greybox shapes: the real props come in the trip's art gate.
import { Group, type BufferGeometry } from 'three'
import type { Bag } from '../engine/dispose'
import { merge, P, solid } from '../engine/geo'
import { PAL } from '../engine/toon'

/** One packable thing, modelled around its base (0, 0, 0). Sizes are toy-big (a 5-year-old's finger). */
export function buildItem(id: string, bag: Bag): Group {
  const g = new Group()
  const parts: BufferGeometry[] = []
  const add = (...p: BufferGeometry[]) => parts.push(...p)
  switch (id) {
    case 'sunhat':
      add(P.cyl(0.26, 0.26, 0.025, PAL.butter, { at: [0, 0.015, 0] }, 24), P.cyl(0.13, 0.15, 0.13, PAL.butter, { at: [0, 0.09, 0] }, 20), P.cyl(0.152, 0.152, 0.035, PAL.hotpink, { at: [0, 0.05, 0] }, 20))
      break
    case 'sunglasses':
      add(
        ...[-1, 1].flatMap((s) => [P.cyl(0.075, 0.075, 0.03, '#3A3350', { at: [s * 0.09, 0.08, 0], rot: [Math.PI / 2, 0, 0] }, 16), P.torus(0.075, 0.016, PAL.hotpink, { at: [s * 0.09, 0.08, 0.012] })]),
        P.box(0.05, 0.02, 0.02, PAL.hotpink, { at: [0, 0.1, 0.012] }),
        ...[-1, 1].map((s) => P.box(0.015, 0.015, 0.16, PAL.hotpink, { at: [s * 0.16, 0.09, -0.08] })),
      )
      break
    case 'sunscreen':
      add(P.rbox(0.13, 0.24, 0.08, 0.035, '#FF9F45', { at: [0, 0.12, 0] }), P.cyl(0.035, 0.035, 0.05, PAL.cream, { at: [0, 0.265, 0] }), P.box(0.1, 0.07, 0.005, PAL.butter, { at: [0, 0.13, 0.042] }))
      break
    case 'floaties':
      add(P.torus(0.1, 0.045, '#FF7FA8', { at: [-0.1, 0.05, 0], rot: [Math.PI / 2, 0, 0] }), P.torus(0.1, 0.045, '#FF9F45', { at: [0.12, 0.05, 0.04], rot: [Math.PI / 2, 0, 0] }))
      break
    case 'swimsuit':
      add(P.rbox(0.22, 0.04, 0.28, 0.02, PAL.mint, { at: [0, 0.02, 0] }), P.rbox(0.05, 0.03, 0.12, 0.01, PAL.mint, { at: [-0.07, 0.03, -0.17] }), P.rbox(0.05, 0.03, 0.12, 0.01, PAL.mint, { at: [0.07, 0.03, -0.17] }), ...[-0.05, 0.05].map((x) => P.sphere(0.025, PAL.hotpink, { at: [x, 0.045, 0.05] })))
      break
    case 'duck':
      add(P.sphere(0.12, '#FFD84D', { at: [0, 0.1, 0], scale: [1.2, 0.85, 1] }), P.sphere(0.075, '#FFD84D', { at: [0.1, 0.22, 0] }), P.cone(0.035, 0.07, '#FF9F45', { at: [0.18, 0.21, 0], rot: [0, 0, -Math.PI / 2] }), ...[-1, 1].map((s) => P.sphere(0.012, PAL.ink, { at: [0.14, 0.25, s * 0.04] })))
      break
    case 'teddy':
      add(
        P.sphere(0.12, '#C99A6E', { at: [0, 0.12, 0] }),
        P.sphere(0.1, '#C99A6E', { at: [0, 0.3, 0] }),
        ...[-1, 1].map((s) => P.sphere(0.04, '#C99A6E', { at: [s * 0.075, 0.38, 0] })),
        P.sphere(0.04, '#F2D3B3', { at: [0, 0.28, 0.08] }),
        ...[-1, 1].map((s) => P.sphere(0.012, PAL.ink, { at: [s * 0.035, 0.32, 0.09] })),
        P.box(0.1, 0.03, 0.03, PAL.hotpink, { at: [0, 0.21, 0.08] }),
      )
      break
    case 'bucket':
      add(P.cyl(0.13, 0.1, 0.2, PAL.sky, { at: [0, 0.1, 0] }, 18), P.torus(0.12, 0.012, PAL.hotpink, { at: [0, 0.2, 0] }, Math.PI), P.cyl(0.015, 0.015, 0.26, PAL.gold, { at: [0.15, 0.13, 0], rot: [0, 0, -0.35] }), P.box(0.07, 0.09, 0.02, PAL.gold, { at: [0.2, 0.02, 0] }))
      break
    case 'camera':
      add(P.rbox(0.26, 0.16, 0.12, 0.03, '#6B5BA8', { at: [0, 0.08, 0] }), P.cyl(0.055, 0.055, 0.06, PAL.ink, { at: [0, 0.08, 0.08], rot: [Math.PI / 2, 0, 0] }), P.cyl(0.035, 0.035, 0.02, '#A8DCFF', { at: [0, 0.08, 0.11], rot: [Math.PI / 2, 0, 0] }), P.box(0.05, 0.03, 0.04, PAL.butter, { at: [-0.08, 0.175, 0] }))
      break
    case 'pillow':
      add(P.rbox(0.44, 0.14, 0.3, 0.06, PAL.cream, { at: [0, 0.07, 0] }), P.box(0.44, 0.01, 0.05, PAL.pink, { at: [0, 0.141, 0] }))
      break
    case 'fan': {
      add(P.cyl(0.11, 0.13, 0.05, PAL.lavenderDark, { at: [0, 0.025, 0] }), P.cyl(0.02, 0.02, 0.16, PAL.lavenderDark, { at: [0, 0.12, 0] }), P.torus(0.12, 0.015, PAL.lavender, { at: [0, 0.3, 0] }))
      const blades = new Group()
      blades.position.set(0, 0.3, 0.005)
      blades.add(solid(merge([0, 1, 2].map((i) => P.box(0.2, 0.05, 0.01, PAL.mint, { at: [Math.cos((i * Math.PI * 2) / 3) * 0.06, Math.sin((i * Math.PI * 2) / 3) * 0.06, 0], rot: [0, 0, (i * Math.PI * 2) / 3] })).concat(P.sphere(0.025, PAL.hotpink))), bag, 1.5))
      blades.name = 'blades'
      g.add(blades)
      break
    }
    case 'mango':
      add(P.sphere(0.11, '#FFB83D', { at: [0, 0.09, 0], scale: [1.3, 0.85, 0.9], rot: [0, 0, 0.3] }), P.sphere(0.06, '#FF8A3D', { at: [0.07, 0.11, 0.05], scale: [1, 0.7, 0.6] }), P.cone(0.03, 0.09, '#7FCB8F', { at: [-0.12, 0.17, 0], rot: [0, 0, 0.9] }))
      break
    case 'snacks':
      // Jum's little bag of snacks for the trip.
      add(P.rbox(0.18, 0.2, 0.1, 0.03, PAL.mint, { at: [0, 0.1, 0] }), P.box(0.18, 0.04, 0.1, PAL.cream, { at: [0, 0.22, 0], rot: [0.12, 0, 0] }), P.sphere(0.035, PAL.hotpink, { at: [0, 0.13, 0.052], scale: [1, 1, 0.3] }))
      break
    default:
      add(P.rbox(0.2, 0.2, 0.2, 0.05, PAL.lavender, { at: [0, 0.1, 0] }))
  }
  g.add(solid(merge(parts), bag, 2))
  return g
}

export interface Suitcase {
  root: Group
  /** Squashes and bulges (the lid's hinge is inside it). */
  body: Group
  lid: Group
  /** Where packed things sit (local to `body`): they heap up on the slots in order. */
  slot(i: number, n: number): [number, number, number]
  /** Size, meters. */
  w: number
  h: number
  d: number
}

/** Her big pink suitcase (faces +z; the lid hinges at the back and opens upward). */
export function buildSuitcase(bag: Bag): Suitcase {
  const w = 0.92
  const h = 0.3
  const d = 0.62
  const root = new Group()
  const body = new Group()
  root.add(body)
  body.add(
    solid(
      merge([
        P.rbox(w, h, d, 0.07, PAL.hotpink, { at: [0, h / 2, 0] }),
        P.box(w - 0.08, 0.02, d - 0.08, '#FFD3E6', { at: [0, h - 0.005, 0] }),
        P.box(w + 0.02, 0.04, 0.05, PAL.gold, { at: [0, h * 0.5, d / 2] }),
        ...[-1, 1].map((s) => P.box(0.06, h * 0.9, d + 0.02, PAL.gold, { at: [s * w * 0.3, h * 0.48, 0] })),
        // Little wheels and the handle.
        ...[-1, 1].map((s) => P.cyl(0.04, 0.04, 0.04, PAL.ink, { at: [s * (w / 2 - 0.08), 0.03, -d / 2 + 0.06], rot: [0, 0, Math.PI / 2] })),
      ]),
      bag,
      2,
    ),
  )
  const lid = new Group()
  lid.position.set(0, h, -d / 2)
  // The lid, with the handle on top.
  lid.add(solid(merge([P.rbox(w, 0.1, d, 0.05, PAL.hotpink, { at: [0, 0.05, d / 2] }), P.box(w - 0.12, 0.012, d - 0.12, '#FFD3E6', { at: [0, -0.002, d / 2] }), P.sphere(0.035, PAL.gold, { at: [0, 0.05, d + 0.005] }), P.torus(0.08, 0.02, PAL.ink, { at: [0, 0.1, d / 2] }, Math.PI)]), bag, 2))
  body.add(lid)
  const slot = (i: number, n: number): [number, number, number] => {
    const layer = Math.floor(i / 6)
    const k = i % 6
    const spread = n > 6 ? 0.92 : 1
    return [(-0.27 + (k % 3) * 0.27) * spread, h - 0.02 + layer * 0.13, (k < 3 ? -0.13 : 0.14) * spread]
  }
  return { root, body, lid, slot, w, h, d }
}

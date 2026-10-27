// The trip's toy props in the house's look (geo.ts parts, toon colors, ink outlines): everything Kaylee can pack, and
// her big pink suitcase, whose lid flaps, which bulges the fuller it gets and which rides along the whole trip (the
// stairs, Aunty Sri's van, the x-ray belt). Each prop is one merged toy (two for the fan, whose blades spin), with an
// ink line round its main shapes and none round the little shines, dots and blushes.
import { Group, type BufferGeometry } from 'three'
import type { Bag } from '../../../engine3d/dispose'
import { P, solidMix } from '../../../engine3d/geo'
import { PAL } from '../../../engine3d/toon'

const TAU = Math.PI * 2
const SHINE = '#FFFFFF'
const BLUSH = '#FF9DB8'
const LENS = '#3A3350'

/** One packable thing, modelled around its base (0, 0, 0), facing +z (the duck looks along +x, the way it swims behind
 *  the longtail). Sizes are toy-big (a 5-year-old's finger). */
export function buildItem(id: string, bag: Bag): Group {
  const g = new Group()
  const lined: BufferGeometry[] = []
  const plain: BufferGeometry[] = []
  const add = (...p: BufferGeometry[]) => lined.push(...p)
  const dot = (...p: BufferGeometry[]) => plain.push(...p)
  switch (id) {
    case 'sunhat': {
      // A floppy straw sun hat: a soft wide brim with a rolled edge, a round crown, a pink band with a bow at the
      // front, and a daisy tucked in at the side.
      const straw = PAL.butter
      add(
        P.sphere(0.27, straw, { at: [0, 0.022, 0], scale: [1, 0.075, 1] }, 28),
        P.torus(0.258, 0.017, straw, { at: [0, 0.024, 0], rot: [Math.PI / 2, 0, 0] }),
        P.sphere(0.14, straw, { at: [0, 0.055, 0], scale: [1, 0.86, 1] }, 22),
        P.cyl(0.143, 0.143, 0.045, PAL.hotpink, { at: [0, 0.085, 0] }, 22),
        // The bow: two loops and the knot.
        ...[-1, 1].map((s) => P.sphere(0.042, PAL.hotpink, { at: [s * 0.05, 0.09, 0.14], rot: [0, 0, s * 0.5], scale: [1.35, 0.8, 0.45] })),
        P.sphere(0.022, PAL.hotpink, { at: [0, 0.088, 0.152] }),
        ...[-1, 1].map((s) => P.capsule(0.014, 0.05, PAL.hotpink, { at: [s * 0.03, 0.04, 0.16], rot: [0.3, 0, s * 0.45] })),
      )
      // The daisy at the side, on the band.
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU
        add(P.sphere(0.024, '#FFFFFF', { at: [0.135, 0.1 + Math.sin(a) * 0.03, 0.035 + Math.cos(a) * 0.03], scale: [0.35, 1, 1] }, 10))
      }
      add(P.sphere(0.017, PAL.gold, { at: [0.145, 0.1, 0.035] }, 10))
      // Straw weave lines round the crown.
      dot(...[0.11, 0.14].map((y) => P.torus(Math.sqrt(Math.max(0, 0.14 ** 2 - ((y - 0.055) / 0.86) ** 2)) + 0.002, 0.004, '#E8D27A', { at: [0, y, 0], rot: [Math.PI / 2, 0, 0] })))
      break
    }
    case 'sunglasses': {
      // Pink heart-shaped sunglasses lying on the floor face up, arms folded under them: dark lenses with a shine.
      const heart = (cx: number, k: number, c: string, z: number) => [
        ...[-1, 1].map((s) => P.sphere(0.045 * k, c, { at: [cx + s * 0.03 * k, 0.1, z], scale: [1, 1, 0.3] }, 14)),
        P.cone(0.068 * k, 0.075 * k, c, { at: [cx, 0.1 - 0.042 * k, z], rot: [Math.PI, 0, 0], scale: [1, 1, 0.3] }, 14),
      ]
      // Built standing up (lenses facing +z), then laid back so the hearts look up at her.
      const frame: BufferGeometry[] = [P.capsule(0.013, 0.04, PAL.hotpink, { at: [0, 0.12, 0.004], rot: [0, 0, Math.PI / 2] })]
      const shine: BufferGeometry[] = []
      for (const s of [-1, 1]) {
        frame.push(...heart(s * 0.095, 1.25, PAL.hotpink, 0), ...heart(s * 0.095, 0.86, '#4A3F6B', 0.008))
        frame.push(P.sphere(0.018, PAL.hotpink, { at: [s * 0.168, 0.115, -0.008] }, 8), P.box(0.17, 0.016, 0.016, PAL.hotpink, { at: [s * 0.085, s > 0 ? 0.112 : 0.094, -0.026] }))
        shine.push(P.sphere(0.018, SHINE, { at: [s * 0.095 - 0.022, 0.112, 0.024], scale: [1, 0.7, 0.4] }, 8), P.sphere(0.007, SHINE, { at: [s * 0.095 + 0.012, 0.07, 0.022] }, 6))
      }
      for (const p of [...frame, ...shine]) p.rotateX(-1.35).translate(0, 0.014, 0.05)
      add(...frame)
      dot(...shine)
      break
    }
    case 'sunscreen': {
      // A squeezy orange bottle standing on its flip cap's other end: a cream label with a smiling sun and a wave.
      add(
        P.rbox(0.13, 0.22, 0.08, 0.038, '#FF9F45', { at: [0, 0.11, 0] }),
        P.cyl(0.042, 0.052, 0.035, '#FF9F45', { at: [0, 0.235, 0] }, 14),
        P.cyl(0.05, 0.05, 0.05, PAL.hotpink, { at: [0, 0.272, 0] }, 16),
        P.sphere(0.05, PAL.hotpink, { at: [0, 0.296, 0], scale: [1, 0.35, 1] }, 14),
        P.box(0.03, 0.012, 0.02, PAL.hotpink, { at: [0, 0.3, 0.045] }),
        P.rbox(0.108, 0.13, 0.008, 0.004, PAL.cream, { at: [0, 0.11, 0.04] }),
      )
      // The sun (a gold disc with rays) and a sky-blue wave under it, flat on the label.
      dot(P.cyl(0.026, 0.026, 0.006, PAL.gold, { at: [0, 0.132, 0.046], rot: [Math.PI / 2, 0, 0] }, 16))
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU
        dot(P.box(0.007, 0.016, 0.004, PAL.gold, { at: [Math.cos(a) * 0.038, 0.132 + Math.sin(a) * 0.038, 0.046], rot: [0, 0, a - Math.PI / 2] }))
      }
      dot(...[-0.03, 0, 0.03].map((x) => P.sphere(0.017, PAL.sky, { at: [x, 0.072, 0.045], scale: [1, 0.55, 0.25] }, 10)))
      dot(...[-1, 1].map((s) => P.sphere(0.004, PAL.ink, { at: [s * 0.009, 0.136, 0.05] }, 6)), P.torus(0.009, 0.0025, PAL.ink, { at: [0, 0.128, 0.05], rot: [0, 0, Math.PI] }, Math.PI))
      break
    }
    case 'floaties': {
      // Two inflatable armbands lying on the floor, each a fat two-colour ring with a little valve.
      const band = (x: number, z: number, c: string) => {
        add(
          P.torus(0.085, 0.05, c, { at: [x, 0.05, z], rot: [Math.PI / 2, 0, 0] }, Math.PI),
          P.torus(0.085, 0.05, '#FFFFFF', { at: [x, 0.05, z], rot: [Math.PI / 2, 0, Math.PI] }, Math.PI),
          P.cyl(0.016, 0.02, 0.04, c, { at: [x + 0.058, 0.1, z + 0.058] }, 10),
        )
        dot(P.sphere(0.02, SHINE, { at: [x - 0.05, 0.095, z + 0.05], scale: [1.4, 0.35, 0.8] }, 8))
      }
      band(-0.1, 0, '#FF7FA8')
      band(0.12, 0.04, '#FF9F45')
      break
    }
    case 'swimsuit': {
      // Her one-piece swimsuit lying flat: straps at the back, a frilly skirt at the front, white polka dots.
      const suit = '#FF6FAE'
      const frill = '#FFB3D1'
      add(
        P.rbox(0.2, 0.034, 0.2, 0.016, suit, { at: [0, 0.017, -0.02] }),
        P.rbox(0.14, 0.034, 0.08, 0.016, suit, { at: [0, 0.017, 0.11] }),
        ...[-1, 1].map((s) => P.rbox(0.035, 0.026, 0.12, 0.012, suit, { at: [s * 0.065, 0.018, -0.16] })),
        // The frill round the hips, and a little one along the top.
        ...Array.from({ length: 7 }, (_, i) => P.sphere(0.03, frill, { at: [-0.105 + i * 0.035, 0.03, 0.075], scale: [1, 0.45, 0.8] }, 10)),
        ...Array.from({ length: 5 }, (_, i) => P.sphere(0.02, frill, { at: [-0.07 + i * 0.035, 0.033, -0.115], scale: [1, 0.45, 0.8] }, 8)),
      )
      dot(...[[-0.06, -0.06], [0.03, -0.07], [-0.02, 0.0], [0.065, 0.02], [-0.07, 0.04], [0.01, 0.12]].map(([x, z]) => P.sphere(0.013, '#FFFFFF', { at: [x, 0.035, z], scale: [1, 0.3, 1] }, 8)))
      break
    }
    case 'duck': {
      // A rubber duck looking along +x: a round body with a flicked-up tail, wings, a big head, an orange bill.
      const yellow = '#FFD84D'
      add(
        P.sphere(0.12, yellow, { at: [0, 0.1, 0], scale: [1.25, 0.8, 1] }, 20),
        P.cone(0.065, 0.13, yellow, { at: [-0.15, 0.15, 0], rot: [0, 0, 0.95] }, 12),
        P.sphere(0.085, yellow, { at: [0.09, 0.235, 0] }, 18),
        P.sphere(0.05, '#FF9F45', { at: [0.18, 0.215, 0], scale: [1.3, 0.42, 0.95] }, 12),
        ...[-1, 1].map((s) => P.sphere(0.065, '#FFC93D', { at: [-0.02, 0.13, s * 0.11], rot: [0, 0, -0.3], scale: [1.35, 0.7, 0.35] }, 12)),
        ...[-1, 1].map((s) => P.sphere(0.017, PAL.ink, { at: [0.145, 0.265, s * 0.045] }, 8)),
      )
      dot(...[-1, 1].map((s) => P.sphere(0.006, SHINE, { at: [0.157, 0.272, s * 0.05] }, 6)), ...[-1, 1].map((s) => P.sphere(0.02, BLUSH, { at: [0.135, 0.225, s * 0.07], scale: [1, 0.6, 0.4] }, 8)))
      break
    }
    case 'teddy': {
      // Her teddy bear sitting up: round tummy with a patch, stubby arms and legs, round ears, a snout, a pink bow.
      const fur = '#C99A6E'
      const light = '#F2D3B3'
      add(
        P.sphere(0.12, fur, { at: [0, 0.12, 0], scale: [1, 1.05, 0.95] }, 18),
        ...[-1, 1].map((s) => P.sphere(0.052, fur, { at: [s * 0.07, 0.045, 0.07], scale: [1, 0.8, 1.3] }, 12)),
        ...[-1, 1].map((s) => P.capsule(0.036, 0.06, fur, { at: [s * 0.11, 0.15, 0.03], rot: [0.3, 0, s * 0.7] })),
        P.sphere(0.1, fur, { at: [0, 0.3, 0] }, 18),
        ...[-1, 1].map((s) => P.sphere(0.042, fur, { at: [s * 0.075, 0.385, 0] }, 12)),
        P.sphere(0.043, light, { at: [0, 0.278, 0.083], scale: [1.2, 0.85, 0.7] }, 12),
        P.sphere(0.015, PAL.ink, { at: [0, 0.297, 0.112], scale: [1.3, 0.9, 0.8] }, 8),
        ...[-1, 1].map((s) => P.sphere(0.014, PAL.ink, { at: [s * 0.036, 0.325, 0.088] }, 8)),
        // The bow at the neck.
        ...[-1, 1].map((s) => P.sphere(0.03, PAL.hotpink, { at: [s * 0.035, 0.212, 0.095], rot: [0, 0, s * 0.4], scale: [1.3, 0.8, 0.5] }, 10)),
        P.sphere(0.016, PAL.hotpink, { at: [0, 0.212, 0.105] }, 8),
      )
      dot(
        P.sphere(0.065, light, { at: [0, 0.11, 0.087], scale: [1, 1.1, 0.4] }, 12),
        ...[-1, 1].map((s) => P.sphere(0.022, '#FFB3C7', { at: [s * 0.075, 0.388, 0.028], scale: [1, 1, 0.4] }, 8)),
        ...[-1, 1].map((s) => P.sphere(0.028, light, { at: [s * 0.07, 0.04, 0.135], scale: [1, 1, 0.3] }, 8)),
        ...[-1, 1].map((s) => P.sphere(0.005, SHINE, { at: [s * 0.036 + 0.005, 0.331, 0.1] }, 6)),
        ...[-1, 1].map((s) => P.sphere(0.018, BLUSH, { at: [s * 0.062, 0.29, 0.075], scale: [1, 0.6, 0.4] }, 8)),
      )
      break
    }
    case 'bucket': {
      // A sky-blue sand bucket (sand inside, a rim, a pink handle, a star on the front), a spade leaning on it.
      add(
        P.cyl(0.13, 0.1, 0.2, PAL.sky, { at: [0, 0.1, 0] }, 20),
        P.torus(0.13, 0.016, '#7FC4F0', { at: [0, 0.2, 0], rot: [Math.PI / 2, 0, 0] }),
        P.torus(0.12, 0.012, PAL.hotpink, { at: [0, 0.2, 0] }, Math.PI),
        ...[-1, 1].map((s) => P.sphere(0.02, PAL.hotpink, { at: [s * 0.12, 0.2, 0] }, 8)),
        // The spade: a gold handle with a grip, a pink blade.
        P.cyl(0.014, 0.014, 0.25, PAL.gold, { at: [0.2, 0.19, 0.04], rot: [0, 0, 0.35] }, 8),
        P.cyl(0.018, 0.018, 0.07, PAL.gold, { at: [0.155, 0.31, 0.04], rot: [0, 0, 0.35 + Math.PI / 2] }, 8),
        P.rbox(0.08, 0.1, 0.016, 0.02, PAL.hotpink, { at: [0.25, 0.04, 0.04], rot: [0, 0, 0.35] }),
      )
      dot(P.sphere(0.112, '#F2D9A6', { at: [0, 0.2, 0], scale: [1, 0.12, 1] }, 18))
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU
        dot(P.cone(0.02, 0.04, PAL.gold, { at: [Math.sin(a) * 0.017, 0.105 + Math.cos(a) * 0.017, 0.118], rot: [-0.15, 0, -a], scale: [1, 1, 0.25] }, 6))
      }
      break
    }
    case 'camera': {
      // Daddy's chunky camera: a purple body with a viewfinder hump, a big lens (gold rings, blue glass, a shine), a
      // flash, a pink button and loops for the strap.
      add(
        P.rbox(0.26, 0.16, 0.12, 0.035, '#6B5BA8', { at: [0, 0.08, 0] }),
        P.box(0.264, 0.035, 0.124, PAL.butter, { at: [0, 0.045, 0] }),
        P.rbox(0.1, 0.05, 0.08, 0.018, '#6B5BA8', { at: [-0.01, 0.17, -0.005] }),
        P.cyl(0.062, 0.066, 0.08, LENS, { at: [0, 0.08, 0.095], rot: [Math.PI / 2, 0, 0] }, 20),
        P.torus(0.06, 0.012, PAL.gold, { at: [0, 0.08, 0.135] }),
        P.torus(0.066, 0.008, PAL.gold, { at: [0, 0.08, 0.1] }),
        P.cyl(0.046, 0.046, 0.01, '#A8DCFF', { at: [0, 0.08, 0.134], rot: [Math.PI / 2, 0, 0] }, 18),
        P.rbox(0.055, 0.032, 0.02, 0.008, PAL.cream, { at: [-0.085, 0.13, 0.062] }),
        P.cyl(0.02, 0.02, 0.02, PAL.hotpink, { at: [0.085, 0.168, 0] }, 12),
        ...[-1, 1].map((s) => P.torus(0.02, 0.006, PAL.ink, { at: [s * 0.132, 0.14, 0], rot: [0, Math.PI / 2, 0] })),
      )
      dot(P.sphere(0.014, SHINE, { at: [-0.018, 0.098, 0.141], scale: [1, 0.8, 0.3] }, 8), P.sphere(0.006, SHINE, { at: [0.015, 0.065, 0.141] }, 6), P.sphere(0.01, SHINE, { at: [-0.095, 0.135, 0.073], scale: [1.4, 0.8, 0.3] }, 6))
      break
    }
    case 'pillow': {
      // Her puffy pillow: soft and round, with pinched corners and pink hearts on the pillowcase.
      add(P.sphere(0.22, PAL.cream, { at: [0, 0.07, 0], scale: [1, 0.32, 0.68] }, 24))
      // The corners poke out diagonally: cones laid along x, then turned toward z.
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(P.cone(0.055, 0.07, PAL.cream, { at: [sx * 0.175, 0.07, sz * 0.1], rot: [0, -sx * sz * 0.6, -sx * Math.PI / 2], scale: [1, 1, 0.55] }, 10))
      const onTop = (x: number, z: number) => 0.07 + 0.0704 * Math.sqrt(Math.max(0, 1 - (x / 0.22) ** 2 - (z / 0.15) ** 2))
      for (const [x, z] of [[-0.12, -0.05], [-0.04, 0.05], [0.05, -0.04], [0.13, 0.04], [-0.13, 0.06], [0.04, 0.08]]) {
        const y = onTop(x, z)
        dot(...[-1, 1].map((s) => P.sphere(0.014, PAL.hotpink, { at: [x + s * 0.011, y, z - 0.005], scale: [1, 0.35, 1] }, 8)), P.cone(0.021, 0.024, PAL.hotpink, { at: [x, y, z + 0.012], rot: [Math.PI / 2, 0, 0], scale: [1, 0.35, 1] }, 8))
      }
      break
    }
    case 'fan': {
      // Her little desk fan: a round base with a pink button, a stem, the motor at the back, a cage round the blades.
      add(
        P.cyl(0.11, 0.13, 0.05, PAL.lavenderDark, { at: [0, 0.025, 0] }, 20),
        P.cyl(0.02, 0.02, 0.2, PAL.lavenderDark, { at: [0, 0.15, -0.01] }, 10),
        P.sphere(0.055, PAL.lavenderDark, { at: [0, 0.3, -0.045], scale: [1, 1, 1.15] }, 14),
        P.cyl(0.024, 0.024, 0.02, PAL.hotpink, { at: [0.06, 0.055, 0.06] }, 10),
        P.torus(0.125, 0.013, PAL.lavender, { at: [0, 0.3, 0.022] }),
        P.torus(0.115, 0.01, PAL.lavender, { at: [0, 0.3, -0.018] }),
      )
      dot(...[0, 1, 2, 3].map((i) => P.box(0.24, 0.006, 0.006, PAL.lavender, { at: [0, 0.3, 0.026], rot: [0, 0, (i * Math.PI) / 4] })), P.sphere(0.022, PAL.lavender, { at: [0, 0.3, 0.028], scale: [1, 1, 0.4] }, 10))
      const blades = new Group()
      blades.position.set(0, 0.3, 0.004)
      blades.add(solidMix([0, 1, 2].map((i) => P.sphere(0.1, PAL.mint, { at: [Math.cos((i * TAU) / 3) * 0.055, Math.sin((i * TAU) / 3) * 0.055, 0], rot: [0, 0, (i * TAU) / 3], scale: [0.95, 0.45, 0.1] }, 12)).concat(P.sphere(0.025, PAL.hotpink, {}, 10)), [], bag, 1.5))
      blades.name = 'blades'
      g.add(blades)
      break
    }
    case 'mango': {
      // A ripe mango: plump and kidney-shaped, golden with a rosy blush, a little stem and a leaf.
      add(
        P.sphere(0.11, '#FFB83D', { at: [0, 0.09, 0], rot: [0, 0, 0.3], scale: [1.3, 0.85, 0.9] }, 20),
        // Plumper at the tip, the way a mango curves.
        P.sphere(0.07, '#FFB83D', { at: [0.075, 0.075, 0.005], scale: [1, 0.95, 1.05] }, 14),
        P.cyl(0.012, 0.015, 0.05, '#7A5A3A', { at: [-0.1, 0.16, 0], rot: [0, 0, 0.55] }, 6),
        P.sphere(0.06, '#7FCB8F', { at: [-0.135, 0.18, 0.035], rot: [0.35, 0.6, 0.3], scale: [1.6, 0.22, 0.65] }, 12),
      )
      dot(P.sphere(0.085, '#FF8466', { at: [0.05, 0.115, 0.035], rot: [0, 0, 0.3], scale: [1, 0.72, 0.68] }, 14), P.sphere(0.022, SHINE, { at: [-0.03, 0.155, 0.06], scale: [1.4, 0.5, 0.6] }, 8))
      break
    }
    case 'raincoat': {
      // Her pink raincoat, folded flat on the floor: the coat with its hood up at the back, two sleeves folded across
      // the front, big butter buttons and a pocket.
      const coat = PAL.hotpink
      add(
        P.rbox(0.3, 0.06, 0.26, 0.03, coat, { at: [0, 0.03, 0] }),
        P.sphere(0.09, coat, { at: [0, 0.05, -0.15], scale: [1.2, 0.45, 0.8] }, 16),
        ...[-1, 1].map((s) => P.capsule(0.03, 0.17, coat, { at: [s * 0.04, 0.075, 0.03], rot: [0, s * 0.5, Math.PI / 2] })),
        P.rbox(0.09, 0.012, 0.07, 0.01, '#FF8FB8', { at: [0.08, 0.065, 0.08] }),
      )
      dot(...[-0.06, 0.03, 0.11].map((z) => P.cyl(0.018, 0.018, 0.012, PAL.butter, { at: [-0.1, 0.066, z] }, 10)), P.sphere(0.03, SHINE, { at: [-0.05, 0.062, -0.08], scale: [1.6, 0.2, 0.6] }, 8))
      break
    }
    case 'boots': {
      // Her rain boots, a pair standing side by side: lavender with a pink sole, a pull loop and a white dot.
      for (const s of [-1, 1]) {
        add(
          P.cyl(0.05, 0.055, 0.2, PAL.lavender, { at: [s * 0.07, 0.12, -0.02] }, 14),
          P.sphere(0.06, PAL.lavender, { at: [s * 0.07, 0.045, 0.04], scale: [0.95, 0.75, 1.4] }, 14),
          P.rbox(0.12, 0.025, 0.2, 0.01, PAL.hotpink, { at: [s * 0.07, 0.0125, 0.015] }),
          P.torus(0.02, 0.006, PAL.hotpink, { at: [s * 0.07, 0.225, -0.07], rot: [0, Math.PI / 2, 0] }),
        )
        dot(P.sphere(0.012, SHINE, { at: [s * 0.07, 0.14, 0.04], scale: [1, 1, 0.3] }, 8))
      }
      break
    }
    case 'umbrella': {
      // Mommy's mint umbrella, rolled up and lying down: the furled canopy with a pink strap, the pointy tip and a
      // curly butter handle.
      add(
        P.cone(0.05, 0.36, PAL.mint, { at: [0.03, 0.05, 0], rot: [0, 0, -Math.PI / 2], scale: [1, 1, 0.9] }, 14),
        P.cyl(0.006, 0.006, 0.08, PAL.ink, { at: [0.25, 0.05, 0], rot: [0, 0, Math.PI / 2] }, 6),
        P.cyl(0.012, 0.012, 0.14, PAL.butter, { at: [-0.21, 0.05, 0], rot: [0, 0, Math.PI / 2] }, 8),
        P.torus(0.04, 0.013, PAL.butter, { at: [-0.28, 0.09, 0] }, Math.PI),
        P.cyl(0.04, 0.04, 0.025, PAL.hotpink, { at: [0.0, 0.05, 0], rot: [0, 0, Math.PI / 2] }, 12),
      )
      dot(P.sphere(0.013, PAL.hotpink, { at: [0.0, 0.092, 0] }, 8))
      break
    }
    case 'snacks': {
      // Jum's snacks for the trip: a crinkly mint bag gathered at the top with a pink bow (a mango on the front), and a
      // little box of mango sticky rice in a banana-leaf lid.
      add(
        P.sphere(0.1, PAL.mint, { at: [0, 0.11, 0], scale: [1, 1.1, 0.75] }, 18),
        P.cyl(0.028, 0.05, 0.04, PAL.mint, { at: [0, 0.225, 0] }, 12),
        P.sphere(0.06, PAL.mint, { at: [0, 0.262, 0], scale: [1.35, 0.55, 0.8] }, 12),
        ...[-1, 1].map((s) => P.sphere(0.028, PAL.hotpink, { at: [s * 0.035, 0.225, 0.04], rot: [0, 0, s * 0.4], scale: [1.3, 0.8, 0.5] }, 10)),
        P.sphere(0.015, PAL.hotpink, { at: [0, 0.225, 0.048] }, 8),
        P.rbox(0.11, 0.055, 0.08, 0.015, PAL.cream, { at: [0.15, 0.028, 0.04] }),
        P.rbox(0.116, 0.02, 0.086, 0.008, '#7FCB8F', { at: [0.15, 0.064, 0.04] }),
      )
      dot(P.sphere(0.035, '#FFB83D', { at: [0, 0.11, 0.072], scale: [1.3, 0.85, 0.35] }, 10), P.sphere(0.012, '#7FCB8F', { at: [-0.035, 0.135, 0.07], scale: [1.4, 0.5, 0.4] }, 6), ...[-0.04, 0.04].map((x) => P.box(0.008, 0.06, 0.003, '#B8F0DD', { at: [x * 1.4, 0.12, 0.074] })))
      break
    }
    default:
      add(P.rbox(0.2, 0.2, 0.2, 0.05, PAL.lavender, { at: [0, 0.1, 0] }))
  }
  g.add(solidMix(lined, plain, bag, 2))
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

/** A sticker flat on the suitcase: a heart, a star or a sun, facing +z (rotate it onto the lid). */
function sticker(kind: 'heart' | 'star' | 'sun', at: [number, number, number], r: number, rot: [number, number, number] = [0, 0, 0]) {
  const parts: BufferGeometry[] = []
  const [x, y, z] = at
  const flat: [number, number, number] = [1, 1, 0.12]
  if (kind === 'heart') {
    parts.push(...[-1, 1].map((s) => P.sphere(r * 0.55, '#FFFFFF', { at: [x + s * r * 0.36, y + r * 0.2, z], scale: flat }, 12)), P.cone(r * 0.85, r * 0.95, '#FFFFFF', { at: [x, y - r * 0.3, z], rot: [Math.PI, 0, 0], scale: flat }, 12))
    parts.push(...[-1, 1].map((s) => P.sphere(r * 0.4, PAL.pink, { at: [x + s * r * 0.36, y + r * 0.2, z + 0.004], scale: flat }, 12)), P.cone(r * 0.62, r * 0.72, PAL.pink, { at: [x, y - r * 0.24, z + 0.004], rot: [Math.PI, 0, 0], scale: flat }, 12))
  } else if (kind === 'star') {
    parts.push(P.cyl(r * 0.42, r * 0.42, 0.01, PAL.gold, { at: [x, y, z], rot: [Math.PI / 2, 0, 0] }, 10))
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU
      parts.push(P.cone(r * 0.3, r * 0.6, PAL.gold, { at: [x + Math.sin(a) * r * 0.55, y + Math.cos(a) * r * 0.55, z], rot: [0, 0, -a], scale: flat }, 6))
    }
  } else {
    parts.push(P.cyl(r, r, 0.01, PAL.sky, { at: [x, y, z], rot: [Math.PI / 2, 0, 0] }, 16), P.cyl(r * 0.45, r * 0.45, 0.01, PAL.butter, { at: [x, y + r * 0.1, z + 0.004], rot: [Math.PI / 2, 0, 0] }, 14))
    parts.push(...[-1, 1].map((s) => P.sphere(r * 0.3, '#FFFFFF', { at: [x + s * r * 0.35, y - r * 0.45, z + 0.006], scale: [1.4, 0.7, 0.12] }, 8)))
  }
  if (rot[0] || rot[1] || rot[2]) for (const p of parts) p.translate(-x, -y, -z).rotateX(rot[0]).rotateY(rot[1]).rotateZ(rot[2]).translate(x, y, z)
  return parts
}

/** Her big pink suitcase (faces +z; the lid hinges at the back and opens upward): gold straps and corner bumpers, a
 *  zip round its middle, little wheels, a padded handle on the lid, and her stickers. */
export function buildSuitcase(bag: Bag): Suitcase {
  const w = 0.92
  const h = 0.3
  const d = 0.62
  const root = new Group()
  const body = new Group()
  root.add(body)
  const bumpers = (y: number, ry: number) => [-1, 1].flatMap((sx) => [-1, 1].map((sz) => P.sphere(0.055, PAL.gold, { at: [sx * (w / 2 - 0.035), y, sz * (d / 2 - 0.035)], scale: [1, ry, 1] }, 10)))
  body.add(
    solidMix(
      [
        P.rbox(w, h, d, 0.07, PAL.hotpink, { at: [0, h / 2, 0] }),
        P.box(w - 0.08, 0.02, d - 0.08, '#FFD3E6', { at: [0, h - 0.005, 0] }),
        // The zip all the way round, just under the lid.
        P.box(w + 0.006, 0.02, d + 0.006, '#E0337F', { at: [0, h - 0.03, 0] }),
        P.rbox(0.05, 0.035, 0.03, 0.01, PAL.gold, { at: [w * 0.18, h - 0.03, d / 2 + 0.012] }),
        // Gold straps (round the front and over), the buckle band, the corner bumpers.
        ...[-1, 1].map((s) => P.box(0.06, h * 0.9, d + 0.02, PAL.gold, { at: [s * w * 0.3, h * 0.47, 0] })),
        ...[-1, 1].map((s) => P.rbox(0.08, 0.07, 0.03, 0.012, '#E8A92A', { at: [s * w * 0.3, h * 0.42, d / 2 + 0.012] })),
        ...bumpers(0.04, 0.8),
        // Little spinner wheels and the side handle.
        ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => P.sphere(0.038, PAL.ink, { at: [sx * (w / 2 - 0.08), 0.012, sz * (d / 2 - 0.08)], scale: [0.6, 1, 1] }, 10))),
        P.rbox(0.03, 0.05, 0.2, 0.012, PAL.ink, { at: [w / 2 + 0.012, h * 0.55, 0] }),
      ],
      [
        ...sticker('heart', [-0.14, 0.2, d / 2 + 0.004], 0.06),
        ...sticker('star', [0.13, 0.1, d / 2 + 0.004], 0.05),
        ...sticker('sun', [-w / 2 + 0.085, 0.13, d / 2 + 0.004], 0.04),
      ],
      bag,
      2,
    ),
  )
  const lid = new Group()
  lid.position.set(0, h, -d / 2)
  // The lid: its lining (with elastic straps, seen when it's open), the padded handle on top, its bumpers and a sticker.
  lid.add(
    solidMix(
      [
        P.rbox(w, 0.1, d, 0.05, PAL.hotpink, { at: [0, 0.05, d / 2] }),
        P.box(w - 0.12, 0.012, d - 0.12, '#FFD3E6', { at: [0, -0.002, d / 2] }),
        ...[-0.15, 0.15].map((x) => P.box(0.05, 0.008, d - 0.16, PAL.lavender, { at: [x, -0.01, d / 2] })),
        ...[-1, 1].map((s) => P.box(0.06, 0.104, d + 0.016, PAL.gold, { at: [s * w * 0.3, 0.05, d / 2] })),
        P.sphere(0.035, PAL.gold, { at: [0, 0.05, d + 0.005] }),
        ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => P.sphere(0.05, PAL.gold, { at: [sx * (w / 2 - 0.035), 0.065, d / 2 + sz * (d / 2 - 0.035)], scale: [1, 0.7, 1] }, 10))),
        ...[-1, 1].map((s) => P.rbox(0.05, 0.03, 0.06, 0.012, PAL.gold, { at: [s * 0.1, 0.105, d / 2] })),
        P.torus(0.1, 0.024, PAL.ink, { at: [0, 0.1, d / 2] }, Math.PI),
        P.capsule(0.028, 0.08, PAL.lavender, { at: [0, 0.198, d / 2], rot: [0, 0, Math.PI / 2] }),
      ],
      sticker('heart', [0.14, 0.101, d * 0.62], 0.075, [-Math.PI / 2, 0, 0]),
      bag,
      2,
    ),
  )
  body.add(lid)
  const slot = (i: number, n: number): [number, number, number] => {
    const layer = Math.floor(i / 6)
    const k = i % 6
    const spread = n > 6 ? 0.92 : 1
    return [(-0.27 + (k % 3) * 0.27) * spread, h - 0.02 + layer * 0.13, (k < 3 ? -0.13 : 0.14) * spread]
  }
  return { root, body, lid, slot, w, h, d }
}

// The street: the road, the sidewalk, the row of five shophouses (ตึกแถว, "row building") with Agong's in the middle,
// its roll-up shutter and balcony, electric wires with birds, and the things on the sidewalk to poke.
import { CatmullRomCurve3, Group, Mesh, TubeGeometry, Vector3 } from 'three'
import { P, type V3 } from '../../../engine/geo'
import { PAL, toon } from '../../../engine/toon'
import { DIM } from '../layout'
import { part, poke, scenery, type Kit } from './kit'

const ROAD = '#CFC8E3'
const WALK = '#EEE7F8'
const CURB = '#D2C4F4'
const AGONG_WALL = '#FFD9C4'
const SHUTTER = '#BFE6DA'
const SLAT = '#9FD3C4'
const GLASS = '#A99BE0'
const POT = '#EBA27E'
const LEAF = '#7FCB8F'
/** Height of the shutter opening (the sign board sits above it, below the balcony). */
const SHUT = 2.8
/** How far the balcony sticks out over the sidewalk (shallow, so the sign below it still shows). */
const BALCONY = 0.66
/** Half the house front (the pillars' centers), and the shutter's width. */
const HALF = DIM.houseW / 2 - 0.11
const DOOR_W = DIM.right - DIM.left

export interface Street {
  /** Always there: the ground. */
  ground: Group
  /** The tall things that would block the view into the house: neighbors, poles, wires. */
  tall: Group
  /** Low things on the sidewalk (they stay while she's inside). */
  props: Group
  /** Agong's ground-floor front: pillars, the sign board and the shutter. */
  front: Group
  /** Its right pillar (lowered with the right wall). */
  frontRight: Group
  /** The upper front wall with the balcony doors (lowered when she's upstairs). */
  upperFront: Group
  /** The balcony and its plant (stay). */
  balcony: Group
  /** Roof, parapet and water tank. */
  roof: Group
}

export function buildStreet(kit: Kit): Street {
  const ground = new Group()
  const tall = new Group()
  const props = new Group()
  const front = new Group()
  const frontRight = new Group()
  const upperFront = new Group()
  const balcony = new Group()
  const roof = new Group()

  // ---- Ground: road, curb, sidewalk, lane dashes ----
  const dashes = Array.from({ length: 9 }, (_, i) => P.box(1.4, 0.01, 0.16, PAL.butter, { at: [-16 + i * 4, 0.005, (DIM.curb + DIM.roadFar) / 2] }))
  ground.add(
    scenery(kit, [P.box(60, 0.1, DIM.roadFar - DIM.curb + 14, ROAD, { at: [0, -0.06, (DIM.curb + DIM.roadFar) / 2 + 7] }), ...dashes], 0),
    scenery(kit, [P.box(36, 0.16, DIM.curb, WALK, { at: [0, -0.07, DIM.curb / 2] }), P.box(36, 0.16, 0.14, CURB, { at: [0, -0.07, DIM.curb - 0.07] })], 2),
  )

  // ---- The neighbors (3 or 4 floors, each its own pastel) ----
  const NEIGHBORS: { x: number; floors: number; wall: string; shutter: string; sign: string }[] = [
    { x: DIM.row[0], floors: 4, wall: '#CFF0E4', shutter: '#B7D8EA', sign: PAL.sky },
    { x: DIM.row[1], floors: 3, wall: '#E3DAFF', shutter: '#C9DDE8', sign: PAL.butter },
    { x: DIM.row[3], floors: 3, wall: '#CDE7FF', shutter: '#D6E6C9', sign: PAL.pink },
    { x: DIM.row[4], floors: 4, wall: '#FFF0B8', shutter: '#C9C3E8', sign: PAL.mint },
  ]
  for (const n of NEIGHBORS) {
    const h = DIM.g0 + (n.floors - 1) * DIM.g1
    const parts = [P.box(5.4 - 0.06, h + 0.6, -DIM.back, n.wall, { at: [n.x, (h + 0.6) / 2, DIM.back / 2] })]
    // Upper floors: two windows and a little balcony ledge each.
    for (let f = 1; f < n.floors; f++) {
      const y = DIM.g0 + (f - 1) * DIM.g1
      for (const dx of [-1.25, 1.25]) parts.push(P.rbox(1.3, 1.4, 0.1, 0.04, GLASS, { at: [n.x + dx, y + 1.5, 0.03] }))
      parts.push(P.box(5.4 - 0.8, 0.1, 0.5, PAL.cream, { at: [n.x, y + 0.6, 0.25] }))
    }
    parts.push(P.box(5.4 - 1.0, 0.5, 0.1, n.sign, { at: [n.x, 3.25, 0.06] }))
    tall.add(scenery(kit, parts, 2))
    // Their shutter (the left one is pokeable).
    const slats = Array.from({ length: 9 }, (_, i) => P.box(5.4 - 0.7, 0.025, 0.02, PAL.ink, { at: [0, 0.3 + i * 0.3, 0.06] }))
    const shutter = [P.box(5.4 - 0.6, 2.9, 0.08, n.shutter, { at: [0, 1.45, 0.02] }), ...slats]
    if (n.x === DIM.row[1]) tall.add(poke(kit, 'neighbor-left', shutter, [n.x, 0, 0]))
    else tall.add(scenery(kit, shutter.map((g) => g.translate(n.x, 0, 0)), 1.5))
  }
  // The right neighbor's shop awning (pokeable).
  tall.add(
    poke(kit, 'neighbor-right', [P.rbox(4.4, 0.12, 1.1, 0.05, PAL.hotpink, { at: [0, 0, 0.45], rot: [0.28, 0, 0] }), ...[-1.5, 0, 1.5].map((dx) => P.sphere(0.12, PAL.butter, { at: [dx, -0.16, 0.95] }))], [DIM.row[3], 2.75, 0], { px: 2 }),
  )

  // ---- Agong's house front: pillars, header, sign, shutter ----
  front.add(
    scenery(kit, [
      P.box(0.22, DIM.g0, 0.4, AGONG_WALL, { at: [-HALF, DIM.g0 / 2, 0.05] }),
      P.box(DIM.houseW, DIM.g0 - SHUT, 0.4, AGONG_WALL, { at: [0, (DIM.g0 + SHUT) / 2, 0.05] }),
      // The roll-up shutter's housing.
      P.cyl(0.16, 0.16, DOOR_W, '#9FD3C4', { at: [0, SHUT, 0.12], rot: [0, 0, Math.PI / 2] }),
    ]),
  )
  frontRight.add(scenery(kit, [P.box(0.22, DIM.g0, 0.4, AGONG_WALL, { at: [HALF, DIM.g0 / 2, 0.05] })]))
  front.add(poke(kit, 'sign', [P.rbox(3.6, 0.4, 0.1, 0.04, '#F0646E'), P.rbox(3.76, 0.52, 0.06, 0.03, PAL.gold, { at: [0, 0, -0.03] })], [0, SHUT + 0.38, 0.3]))
  // The shutter: pivots at its top, so rolling up = squashing it upward.
  const curtain = part(
    kit,
    'shutter.curtain',
    [P.box(DOOR_W, SHUT, 0.06, SHUTTER, { at: [0, -SHUT / 2, 0] }), ...Array.from({ length: 13 }, (_, i) => P.box(DOOR_W - 0.04, 0.03, 0.02, SLAT, { at: [0, -0.2 - i * 0.2, 0.04] })), P.box(0.6, 0.08, 0.06, '#7FB8A8', { at: [0, -SHUT + 0.15, 0.06] })],
    [0, 0, 0],
    2,
  )
  const shutter = poke(kit, 'shutter', [], [0, SHUT, 0.1])
  shutter.add(curtain)
  front.add(shutter)

  // ---- Upper front: wall around the balcony doors, the doors, the balcony ----
  const U = DIM.g0
  upperFront.add(
    scenery(kit, [
      ...[-1, 1].map((s) => P.box(DIM.houseW / 2 - 1.0, DIM.g1, 0.15, AGONG_WALL, { at: [(s * (DIM.houseW / 2 + 1.0)) / 2, U + DIM.g1 / 2, -0.075] })),
      P.box(2.0, 0.7, 0.15, AGONG_WALL, { at: [0, U + DIM.g1 - 0.35, -0.075] }),
      // The air-conditioner box, like on every shophouse.
      P.rbox(0.8, 0.55, 0.32, 0.05, PAL.cream, { at: [1.85, U + 2.4, 0.18] }),
      P.cyl(0.18, 0.18, 0.04, '#D9D2E8', { at: [1.85, U + 2.4, 0.35], rot: [Math.PI / 2, 0, 0] }),
    ]),
  )
  // The balcony doors (the front room's, so they stay shut).
  upperFront.add(scenery(kit, [-1, 1].flatMap((side) => [P.box(0.98, 2.28, 0.06, '#BFE0F5', { at: [side * 0.5, U + 1.15, -0.075] }), P.box(0.6, 1.4, 0.02, '#E6F4FF', { at: [side * 0.5, U + 1.35, -0.035] })]), 1.5))
  // Balcony slab + railing.
  const rail: ReturnType<typeof P.box>[] = []
  const bw = DIM.houseW - 0.4
  for (let i = 0; i <= 15; i++) rail.push(P.box(0.05, 0.9, 0.05, PAL.cream, { at: [-bw / 2 + 0.05 + (i * (bw - 0.1)) / 15, U + 0.45, BALCONY - 0.04] }))
  rail.push(P.box(bw, 0.08, 0.1, PAL.cream, { at: [0, U + 0.92, BALCONY - 0.04] }), P.box(0.08, 0.08, BALCONY, PAL.cream, { at: [-bw / 2 + 0.02, U + 0.92, BALCONY / 2] }), P.box(0.08, 0.08, BALCONY, PAL.cream, { at: [bw / 2 - 0.02, U + 0.92, BALCONY / 2] }))
  balcony.add(scenery(kit, [P.box(bw + 0.2, 0.18, BALCONY + 0.04, AGONG_WALL, { at: [0, U - 0.09, BALCONY / 2] })]), scenery(kit, rail, 1.5))
  balcony.add(scenery(kit, [P.cyl(0.18, 0.13, 0.3, POT, { at: [1.9, U + 0.15, 0.36] }), P.sphere(0.24, LEAF, { at: [1.9, U + 0.45, 0.36] }), ...[0, 2, 4].map((a) => P.sphere(0.06, PAL.hotpink, { at: [1.9 + Math.cos(a) * 0.18, U + 0.55, 0.36 + Math.sin(a) * 0.18] }))]))

  // ---- Roof: slab, parapet, water tank ----
  roof.add(
    scenery(kit, [
      P.box(DIM.houseW, 0.2, 0.3 - DIM.back, AGONG_WALL, { at: [0, U + DIM.g1 + 0.1, DIM.back / 2 - 0.15] }),
      P.box(DIM.houseW, 0.7, 0.2, AGONG_WALL, { at: [0, U + DIM.g1 + 0.55, -0.1] }),
      P.box(DIM.houseW + 0.2, 0.12, 0.34, PAL.cream, { at: [0, U + DIM.g1 + 0.95, -0.1] }),
      P.cyl(0.55, 0.55, 1.2, PAL.sky, { at: [-1.3, U + DIM.g1 + 0.8, -12] }),
      P.cone(0.58, 0.3, PAL.sky, { at: [-1.3, U + DIM.g1 + 1.55, -12] }),
    ]),
  )

  // ---- Poles, wires and the birds on them ----
  const poles = [-8.1, 8.1]
  tall.add(scenery(kit, poles.map((x) => P.cyl(0.11, 0.14, 7.4, '#D8D2E6', { at: [x, 3.7, 2.35] })), 1.5))
  const wireMat = toon(PAL.ink)
  for (const [y0, sag] of [
    [6.6, 0.55],
    [6.3, 0.7],
    [6.0, 0.45],
  ] as const) {
    const pts = [-17, -8.1, 0, 8.1, 17].map((x, i) => new Vector3(x, y0 - (i === 2 ? sag : i % 2 ? 0 : sag * 0.8), 2.35))
    const tube = kit.bag.add(new TubeGeometry(new CatmullRomCurve3(pts), 60, 0.018, 5))
    tall.add(new Mesh(tube, wireMat))
  }
  // Birds sit on the lowest wire near the right pole.
  const birds = poke(kit, 'birds', [], [6.3, 5.75, 2.35])
  ;[-0.55, 0, 0.5].forEach((dx, i) => {
    const b = part(kit, `birds.bird${i}`, [P.sphere(0.13, i === 1 ? PAL.sky : PAL.lavenderDark, { scale: [1.15, 1, 0.9] }), P.sphere(0.085, i === 1 ? PAL.sky : PAL.lavenderDark, { at: [0.11, 0.1, 0] }), P.cone(0.03, 0.08, PAL.gold, { at: [0.2, 0.1, 0], rot: [0, 0, -Math.PI / 2] }), P.sphere(0.02, PAL.ink, { at: [0.15, 0.14, 0.06] })], [dx, 0.12, 0], 1.5)
    b.rotation.y = i === 1 ? Math.PI : 0
    birds.add(b)
  })
  tall.add(birds)

  // ---- Sidewalk things ----
  props.add(spiritHouse(kit), motorbike(kit), cat(kit), tukTuk(kit))
  props.add(
    poke(kit, 'pot-left', [P.cyl(0.24, 0.17, 0.42, POT, { at: [0, 0.21, 0] }), P.sphere(0.3, LEAF, { at: [0, 0.62, 0] }), ...[0, 1.2, 2.4, 3.6, 4.8].map((a) => P.sphere(0.09, PAL.hotpink, { at: [Math.cos(a) * 0.24, 0.7 + (a % 2) * 0.1, Math.sin(a) * 0.24] }))], [-2.2, 0, 0.4]),
    poke(kit, 'pot-right', [P.cyl(0.24, 0.17, 0.42, POT, { at: [0, 0.21, 0] }), P.cyl(0.04, 0.05, 0.4, '#B98A6A', { at: [0, 0.6, 0] }), P.sphere(0.34, LEAF, { at: [0, 0.95, 0] }), ...[0.5, 2.2, 4].map((a) => P.sphere(0.07, '#D4F07A', { at: [Math.cos(a) * 0.3, 0.95, Math.sin(a) * 0.3] }))], [2.2, 0, 0.4]),
    poke(kit, 'basil', [P.cyl(0.2, 0.15, 0.3, POT, { at: [0, 0.15, 0] }), ...[0, 2.1, 4.2].map((a) => P.sphere(0.13, '#6FBF7F', { at: [Math.cos(a) * 0.1, 0.4, Math.sin(a) * 0.1] }))], [-7.0, 0, 0.45]),
  )

  return { ground, tall, props, front, frontRight, upperFront, balcony, roof }
}

/** A Thai spirit house on its pillar, with marigolds and a little red drink. It faces the street. */
function spiritHouse(kit: Kit) {
  const g = poke(
    kit,
    'spirit-house',
    [
      P.cyl(0.11, 0.14, 1.15, PAL.cream, { at: [0, 0.575, 0] }),
      P.rbox(0.7, 0.07, 0.6, 0.02, PAL.cream, { at: [0, 1.17, 0] }),
      P.rbox(0.42, 0.36, 0.36, 0.03, PAL.gold, { at: [0, 1.38, 0] }),
      P.box(0.16, 0.22, 0.02, '#D9534F', { at: [0, 1.32, 0.18] }),
      P.cone(0.36, 0.28, '#E2525C', { at: [0, 1.7, 0], rot: [0, Math.PI / 4, 0] }, 4),
      P.cone(0.2, 0.3, PAL.gold, { at: [0, 1.95, 0], rot: [0, Math.PI / 4, 0] }, 4),
      P.cone(0.025, 0.18, PAL.gold, { at: [0, 2.17, 0] }),
      P.torus(0.12, 0.03, '#FF9F45', { at: [-0.2, 1.24, 0.22], rot: [Math.PI / 2, 0, 0] }),
      P.cyl(0.035, 0.035, 0.12, '#E2525C', { at: [0.22, 1.26, 0.2] }),
      P.cyl(0.006, 0.006, 0.2, '#B98A6A', { at: [0.05, 1.3, 0.24] }),
    ],
    [4.3, 0, 0.5],
  )
  return g
}

/** A parked motorbike (faces +x): it beeps, and she can sit on it. */
function motorbike(kit: Kit) {
  const wheel = (x: number) => [P.torus(0.24, 0.07, PAL.ink, { at: [x, 0.3, 0] }), P.cyl(0.08, 0.08, 0.12, '#D8D2E6', { at: [x, 0.3, 0], rot: [Math.PI / 2, 0, 0] })]
  const g = poke(
    kit,
    'motorbike',
    [
      ...wheel(-0.55),
      ...wheel(0.55),
      P.rbox(1.0, 0.32, 0.34, 0.12, '#FF7FA8', { at: [-0.05, 0.55, 0] }),
      P.rbox(0.6, 0.1, 0.3, 0.05, PAL.ink, { at: [-0.15, 0.74, 0] }),
      P.rbox(0.18, 0.6, 0.22, 0.06, '#FF7FA8', { at: [0.48, 0.72, 0], rot: [0, 0, -0.35] }),
      P.cyl(0.025, 0.025, 0.6, PAL.ink, { at: [0.6, 1.02, 0], rot: [Math.PI / 2, 0, 0] }),
      P.rbox(0.3, 0.18, 0.4, 0.05, PAL.lavenderDark, { at: [-0.62, 0.72, 0] }),
    ],
    [-4.5, 0, 1.7],
  )
  g.add(part(kit, 'motorbike.light', [P.sphere(0.09, PAL.butter, { scale: [0.6, 1, 1] })], [0.66, 0.9, 0], 1.5))
  return g
}

/** A sleepy cat in a loaf on the step: she stretches when poked. */
function cat(kit: Kit) {
  const g = poke(kit, 'cat', [], [6.4, 0, 0.55], { rotY: -0.5 })
  g.add(
    part(
      kit,
      'cat.body',
      [
        P.capsule(0.15, 0.32, '#FFB677', { at: [0, 0.16, 0], rot: [0, 0, Math.PI / 2] }),
        P.sphere(0.15, '#FFB677', { at: [0.3, 0.26, 0] }),
        P.cone(0.06, 0.1, '#FFB677', { at: [0.32, 0.42, 0.08] }),
        P.cone(0.06, 0.1, '#FFB677', { at: [0.32, 0.42, -0.08] }),
        P.box(0.02, 0.012, 0.06, PAL.ink, { at: [0.44, 0.28, 0.05] }),
        P.box(0.02, 0.012, 0.06, PAL.ink, { at: [0.44, 0.28, -0.05] }),
        ...[-0.12, 0.02, 0.16].map((x) => P.box(0.05, 0.02, 0.3, '#F29A57', { at: [x, 0.31, 0] })),
      ],
      [0, 0, 0],
      2,
    ),
  )
  g.add(part(kit, 'cat.tail', [P.capsule(0.04, 0.3, '#F29A57', { at: [0, 0.17, 0] })], [-0.3, 0.12, 0], 1.5))
  return g
}

/** The tuk-tuk that brought her (parked on the road after the arrival). Faces +x. */
function tukTuk(kit: Kit) {
  const wheel = (at: V3) => P.torus(0.2, 0.08, PAL.ink, { at })
  return poke(
    kit,
    'tuk-tuk',
    [
      wheel([0.85, 0.28, 0]),
      wheel([-0.6, 0.28, -0.55]),
      wheel([-0.6, 0.28, 0.55]),
      P.rbox(2.1, 0.5, 1.2, 0.12, PAL.sky, { at: [0, 0.62, 0] }),
      P.rbox(0.7, 0.55, 0.9, 0.12, '#FF7FA8', { at: [0.75, 1.1, 0] }),
      P.rbox(1.2, 0.5, 1.15, 0.1, PAL.lavender, { at: [-0.4, 1.1, 0] }),
      P.rbox(2.3, 0.12, 1.4, 0.06, PAL.hotpink, { at: [-0.1, 1.95, 0] }),
      ...[
        [1.05, 0.62],
        [1.05, -0.62],
        [-1.1, 0.62],
        [-1.1, -0.62],
      ].map(([x, z]) => P.cyl(0.035, 0.035, 0.95, PAL.cream, { at: [x, 1.45, z] })),
      P.sphere(0.1, PAL.butter, { at: [1.12, 0.75, 0], scale: [0.5, 1, 1] }),
    ],
    [9.8, 0, 3.95],
  )
}

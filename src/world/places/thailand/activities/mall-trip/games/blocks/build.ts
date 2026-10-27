// Little Land, built from simple shapes in the house's toon look (greybox: no generated art). The flower mats, a low
// foam wall along the back (paler than the bricks she plays with), the brick box, the easel with the picture card and
// its three stars, the foam ball and the foam rocking elephant, round 3's ribbon at Daddy's height, the chedi's gold
// spire and the elephant's face. The bricks are the hall's (hall/build.ts): the same rounded box in the same colors.
import { Color, Group, Mesh, MeshBasicMaterial, type BufferGeometry } from 'three'
import type { Bag } from '../../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../../engine3d/geo'
import { PAL } from '../../../../../../engine3d/toon'
import { CARDS, type Cell } from './grid'
import { BALL, BD, BH, BOX, BRICK_COLORS, BW, EASEL, HALF, MARK_Y, ROCKER, STAR_Y, WALL, X0, type CardId } from './layout'

/** The pictures the easel can show: what to do in each round. */
export type Picture = 'free' | CardId | 'tall'

export interface Built {
  root: Group
  box: Group
  easel: Group
  /** The card on the easel (it flips round to show the next one). */
  card: Group
  pictures: Record<Picture, Group>
  /** The three stars on top of the easel: the dim slots, and the gold ones that go in them. */
  starSlots: Group
  stars: Group[]
  ball: Group
  /** The rocking elephant, pivoting on its rockers. */
  rocker: Group
  wall: Group
  /** Each wall brick's middle and color (a tap pops the nearest out). */
  wallBricks: { at: [number, number, number]; color: string }[]
  /** Round 3's ribbon across the build at Daddy's height, with its flag. */
  ribbon: Group
  /** The chedi's gold spire, and the elephant's face (its ears flap, its trunk swings). */
  spire: Group
  face: { root: Group; earL: Group; earR: Group; trunk: Group }
  picks: Group[]
}

/** The middle of a brick in place (its column pair and row). */
export function cellX(c: Cell) {
  return X0 + (c.s + 1) * HALF
}
export function cellY(c: Cell) {
  return c.r * BH + BH / 2
}

/** A foam brick, as in the hall. */
export function brickGeometry(color: string): BufferGeometry {
  return P.rbox(BW - 0.03, BH - 0.03, BD, 0.06, color)
}
export const brick = (color: string, bag: Bag) => solid(merge([brickGeometry(color)]), bag, 2)

/** The see-through outlines: where a card's bricks go, and where the brick in her hand will land. */
export function ghostMaterials(bag: Bag) {
  const make = (color: string, opacity: number) => bag.add(new MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false }))
  return { dim: make('#FFFFFF', 0.28), lit: make('#FFE27A', 0.55), drop: make('#FFFFFF', 0.5) }
}
export function ghostMesh(bag: Bag, mat: MeshBasicMaterial) {
  const m = new Mesh(bag.add(P.rbox(BW - 0.02, BH - 0.02, BD + 0.02, 0.07, '#FFFFFF')), mat)
  m.renderOrder = 5
  return m
}

export const pale = (c: string) => '#' + new Color(c).lerp(new Color('#FFFFFF'), 0.55).getHexString()
const star = (r: number, color: string, depth: number) =>
  P.prism(
    Array.from({ length: 10 }, (_, i): [number, number] => {
      const a = Math.PI / 2 + (i * Math.PI) / 5
      const rr = i % 2 ? r * 0.45 : r
      return [Math.cos(a) * rr, Math.sin(a) * rr]
    }),
    depth,
    color,
  )

export function buildLittleLand(bag: Bag): Built {
  const root = new Group()
  const picks: Group[] = []
  const add = <T extends Group>(g: T, pick?: string) => {
    root.add(g)
    if (pick) {
      g.userData.pick = pick
      picks.push(g)
    }
    return g
  }

  // ---- The flower mats, and the hall's lavender wall behind ----
  const floor: BufferGeometry[] = []
  for (let x = -6; x < 6; x++) for (let z = -3; z < 4; z++) floor.push(P.box(1, 0.1, 1, (x + z) % 2 ? '#E9E1FF' : '#DCD0FA', { at: [x + 0.5, -0.05, z + 0.5] }))
  // Printed flowers: a few flat petals round a gold middle.
  const flowers: [number, number][] = [[-3.6, 1.6], [-1.1, 1.9], [1.6, 1.7], [3.9, 2.2], [-4.6, -0.6], [4.4, -0.2], [0.4, 2.6], [-2.4, 2.8]]
  for (const [fx, fz] of flowers) {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2
      floor.push(P.cyl(0.09, 0.09, 0.012, ['#FF8FB8', '#8EC9F5', '#FFFFFF'][Math.abs(Math.round(fx)) % 3], { at: [fx + Math.cos(a) * 0.12, 0.006, fz + Math.sin(a) * 0.12] }, 10))
    }
    floor.push(P.cyl(0.06, 0.06, 0.016, PAL.gold, { at: [fx, 0.008, fz] }, 10))
  }
  add(solid(merge(floor), bag, 0))
  const back: BufferGeometry[] = [P.box(14, 5, 0.2, '#EBDDFF', { at: [0, 2.5, WALL.z - 0.45] })]
  // A painted sun and clouds, flat like the hall's.
  back.push(P.cyl(0.42, 0.42, 0.04, PAL.gold, { at: [2.2, 3.1, WALL.z - 0.33], rot: [Math.PI / 2, 0, 0] }, 24))
  for (const [cx, cy] of [[-1.2, 3.2], [-0.5, 3.35], [4.0, 2.9], [4.6, 3.05]] as [number, number][]) back.push(P.sphere(0.32, '#FFFFFF', { at: [cx, cy, WALL.z - 0.34], scale: [1.4, 0.8, 0.12] }, 14))
  add(solid(merge(back), bag, 2))

  // ---- The low foam wall along the back: two rows, staggered, paler than her bricks ----
  const wallParts: BufferGeometry[] = []
  const wallBricks: Built['wallBricks'] = []
  for (let r = 0; r < WALL.rows; r++)
    for (let x = WALL.x0 + (r % 2 ? BW / 2 : 0); x + BW <= WALL.x1 + 1e-6; x += BW) {
      const at: [number, number, number] = [x + BW / 2, BH / 2 + r * BH, WALL.z]
      const color = pale(BRICK_COLORS[(r * 3 + Math.round(x / BW) + 10) % 5])
      wallParts.push(P.rbox(BW - 0.03, BH - 0.03, BD, 0.06, color, { at }))
      wallBricks.push({ at, color })
    }
  const wall = add(solid(merge(wallParts), bag, 2), 'wall')

  // ---- The brick box: an open foam bin with bricks sticking out ----
  const { w, d, h } = BOX
  const box = add(
    solid(
      merge([
        P.rbox(w, 0.08, d, 0.03, '#9C86DA', { at: [0, 0.04, 0] }),
        P.rbox(w, h, 0.1, 0.04, '#B9A6F5', { at: [0, h / 2, d / 2 - 0.05] }),
        P.rbox(w, h, 0.1, 0.04, '#B9A6F5', { at: [0, h / 2, -d / 2 + 0.05] }),
        P.rbox(0.1, h, d, 0.04, '#B9A6F5', { at: [-w / 2 + 0.05, h / 2, 0] }),
        P.rbox(0.1, h, d, 0.04, '#B9A6F5', { at: [w / 2 - 0.05, h / 2, 0] }),
        // A white trim round the top, and bricks peeking out.
        P.box(w + 0.04, 0.06, 0.12, '#FFFFFF', { at: [0, h, d / 2 - 0.05] }),
        P.rbox(BW * 0.7, BH * 0.7, BD * 0.7, 0.05, BRICK_COLORS[0], { at: [-0.18, h - 0.02, -0.05], rot: [0.2, 0.3, 0.35] }),
        P.rbox(BW * 0.7, BH * 0.7, BD * 0.7, 0.05, BRICK_COLORS[2], { at: [0.2, h + 0.02, 0.05], rot: [-0.1, -0.4, -0.5] }),
        P.rbox(BW * 0.7, BH * 0.7, BD * 0.7, 0.05, BRICK_COLORS[3], { at: [0.0, h - 0.08, 0.12], rot: [0.1, 0.1, 0.05] }),
      ]),
      bag,
      2,
    ),
    'box',
  )
  box.position.set(BOX.x, 0, BOX.z)

  // ---- The easel: an A-frame, the card's white board, three star slots on top ----
  const easel = add(
    solid(
      merge([
        ...[-1, 1].map((sx) => P.cyl(0.035, 0.035, EASEL.y + EASEL.h / 2 + 0.1, '#E8B98A', { at: [sx * (EASEL.w / 2 - 0.08), (EASEL.y + EASEL.h / 2) / 2, 0.04], rot: [0.08, 0, -sx * 0.06] }, 8)),
        P.cyl(0.035, 0.035, EASEL.y + 0.2, '#D9A574', { at: [0, (EASEL.y + 0.2) / 2, -0.3], rot: [-0.3, 0, 0] }, 8),
        P.rbox(EASEL.w + 0.08, 0.06, 0.16, 0.02, '#E8B98A', { at: [0, EASEL.y - EASEL.h / 2 - 0.05, 0.09] }),
      ]),
      bag,
      2,
    ),
    'easel',
  )
  easel.position.set(EASEL.x, 0, EASEL.z)
  // The card on its own pivot, so it can flip round.
  const card = new Group()
  card.position.set(0, EASEL.y, 0.1)
  easel.add(card)
  card.add(solid(merge([P.rbox(EASEL.w, EASEL.h, 0.04, 0.03, '#FFFFFF'), P.box(EASEL.w - 0.12, EASEL.h - 0.12, 0.01, '#FFF7F0', { at: [0, 0, 0.022] })]), bag, 2))
  const pictures = buildPictures(bag)
  for (const p of Object.values(pictures)) card.add(p)
  // Three star slots on top, and the gold stars that go in them.
  const starSlots = new Group()
  starSlots.position.set(0, STAR_Y - EASEL.y, 0.02)
  card.add(starSlots)
  const stars: Group[] = []
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 0.3
    starSlots.add(solid(merge([star(0.12, '#E9E1FF', 0.03)]), bag, 1.5).translateX(x))
    const s = solid(merge([star(0.13, PAL.gold, 0.06)]), bag, 2)
    s.position.set(x, 0, 0.03)
    s.visible = false
    starSlots.add(s)
    stars.push(s)
  }
  starSlots.userData.pick = 'stars'
  picks.push(starSlots)

  // ---- The big foam ball (pink, a white band round it) ----
  const ball = add(solid(merge([P.sphere(BALL.r, '#FF8FB8', {}, 22), P.torus(BALL.r * 0.99, 0.04, '#FFFFFF', { rot: [0.4, 0, 0.3] })]), bag, 2), 'ball')
  ball.position.set(BALL.x, BALL.r, BALL.z)

  // ---- The foam rocking elephant: a curved rocker under a chubby mint elephant ----
  const rocker = new Group()
  rocker.position.set(ROCKER.x, 0, ROCKER.z)
  rocker.add(
    solid(
      merge([
        ...[-1, 1].map((sz) => P.torus(0.6, 0.05, '#B9A6F5', { at: [0, 0.62, sz * 0.18], rot: [0, 0, Math.PI + 0.9] }, 1.3)),
        P.rbox(0.62, 0.08, 0.42, 0.03, '#B9A6F5', { at: [0, 0.2, 0] }),
        P.sphere(0.28, '#8FE3C8', { at: [0, 0.48, 0], scale: [1.35, 1, 1] }),
        ...[-0.2, 0.2].flatMap((lx) => [-0.12, 0.12].map((lz) => P.cyl(0.07, 0.07, 0.24, '#8FE3C8', { at: [lx, 0.3, lz] }, 10))),
        P.sphere(0.22, '#8FE3C8', { at: [0.36, 0.7, 0] }),
        P.sphere(0.16, '#FFB8CC', { at: [0.28, 0.72, 0.17], scale: [0.6, 1.1, 0.25] }),
        P.cyl(0.06, 0.05, 0.3, '#8FE3C8', { at: [0.56, 0.56, 0], rot: [0, 0, 0.5] }, 10),
        P.sphere(0.03, PAL.ink, { at: [0.48, 0.76, 0.14] }, 8),
        P.sphere(0.05, '#FFFFFF', { at: [-0.12, 0.76, 0], scale: [1.5, 0.3, 1] }, 10),
      ]),
      bag,
      2,
    ),
  )
  rocker.rotation.y = -0.5
  add(rocker, 'rocker')

  // ---- Round 3's ribbon: a dashed pink line across the build at Daddy's height, a flag at his end ----
  const ribbon = add(
    solid(
      merge([
        ...Array.from({ length: 13 }, (_, i) => P.box(0.2, 0.05, 0.03, PAL.hotpink, { at: [-2.0 + i * 0.36, MARK_Y, -0.33] })),
        P.cyl(0.02, 0.02, 0.5, '#FFFFFF', { at: [2.45, MARK_Y + 0.15, -0.33] }, 6),
        P.prism([[0, 0], [0.26, 0.09], [0, 0.18]], 0.02, PAL.hotpink, { at: [2.46, MARK_Y + 0.22, -0.33] }),
      ]),
      bag,
      1.5,
    ),
  )
  ribbon.visible = false

  // ---- The chedi's gold spire: a bell on a base, rings, the tall point ----
  const spire = solid(
    merge([
      P.cyl(0.3, 0.34, 0.08, PAL.gold, { at: [0, 0.04, 0] }, 20),
      P.sphere(0.26, PAL.gold, { at: [0, 0.2, 0], scale: [1, 0.85, 1] }, 20),
      P.cyl(0.1, 0.16, 0.08, '#E8A92A', { at: [0, 0.42, 0] }, 16),
      ...[0, 1, 2].map((i) => P.torus(0.09 - i * 0.02, 0.025, '#E8A92A', { at: [0, 0.5 + i * 0.08, 0], rot: [Math.PI / 2, 0, 0] })),
      P.cone(0.07, 0.5, PAL.gold, { at: [0, 0.9, 0] }, 14),
      P.sphere(0.035, '#FFFFFF', { at: [0, 1.16, 0] }, 10),
    ]),
    bag,
    2,
  )
  spire.visible = false
  root.add(spire)

  // ---- The elephant's face, on the head brick's front and right: an eye, a tusk, big ears, a trunk to the mat ----
  const face = { root: new Group(), earL: new Group(), earR: new Group(), trunk: new Group() }
  face.root.add(
    solid(
      merge([
        P.sphere(0.07, '#FFFFFF', { at: [0.18, 0.04, BD / 2 + 0.01], scale: [1, 1.1, 0.4] }),
        P.sphere(0.04, PAL.ink, { at: [0.19, 0.03, BD / 2 + 0.035], scale: [1, 1.1, 0.4] }),
        P.sphere(0.06, '#FF8FB8', { at: [0.28, -0.1, BD / 2], scale: [1.2, 0.6, 0.3] }),
        P.cone(0.035, 0.18, '#FFFFFF', { at: [0.42, -0.2, 0.12], rot: [0, 0, -2.2] }, 8),
      ]),
      bag,
      1.5,
    ),
  )
  // The ears hang off the head's back corners and flap round their front edge.
  for (const [ear, z] of [[face.earL, -BD / 2 - 0.02], [face.earR, BD / 2 + 0.02]] as [Group, number][]) {
    ear.position.set(-0.12, 0.05, z)
    ear.add(solid(merge([P.sphere(0.3, '#FFB8CC', { at: [-0.22, -0.05, 0], scale: [1, 1.15, 0.12] }), P.sphere(0.24, '#B9A6F5', { at: [-0.2, -0.04, Math.sign(z) * 0.02], scale: [1, 1.1, 0.1] })]), bag, 1.5))
    face.root.add(ear)
  }
  // The trunk: from the head's right side down to the mat, the tip curled up.
  face.trunk.position.set(BW / 2 - 0.02, -0.05, 0)
  // A tapering chain of overlapping balls, so it reads as one soft trunk.
  const tk = Array.from({ length: 14 }, (_, i) => {
    const k = i / 13
    return [0.06 + 0.1 * Math.sin(k * 2.2) + (k > 0.8 ? (k - 0.8) * 0.9 : 0), -0.05 - 0.82 * Math.min(1, k * 1.1) + (k > 0.85 ? (k - 0.85) * 0.6 : 0), 0.11 - 0.05 * k]
  })
  face.trunk.add(solid(merge(tk.map(([x, y, r]) => P.sphere(r, BRICK_COLORS[4], { at: [x, y, 0] }, 12))), bag, 1.5))
  face.root.add(face.trunk)
  face.root.visible = false
  root.add(face.root)

  return { root, box, easel, card, pictures, starSlots, stars, ball, rocker, wall, wallBricks, ribbon, spire, face, picks }
}

/** The card's pictures, drawn in little bricks: a stack to knock over, the chedi, the elephant, a tower taller than a
 *  unicorn. */
function buildPictures(bag: Bag): Record<Picture, Group> {
  const u = 0.085
  const mini = (cells: { s: number; r: number }[], dx = 0, dy = -0.27) =>
    cells.map((c, i) => P.rbox(2 * u - 0.008, u - 0.008, 0.02, 0.008, BRICK_COLORS[i % 5], { at: [(c.s + 1 - 4) * u + dx, c.r * u + u / 2 + dy, 0.035] }))
  const pic = (parts: BufferGeometry[]) => {
    const g = solid(merge(parts), bag, 1)
    g.visible = false
    return g
  }
  const unicorn = (x: number, h: number) => [
    P.capsule(0.06, h * 0.45, '#A9EBD6', { at: [x, -0.27 + h * 0.4, 0.035] }),
    P.sphere(0.075, '#A9EBD6', { at: [x, -0.27 + h * 0.82, 0.035] }),
    P.cone(0.018, 0.08, PAL.gold, { at: [x + 0.01, -0.27 + h * 0.82 + 0.1, 0.035], rot: [0, 0, -0.3] }, 8),
  ]
  return {
    free: pic([...mini([{ s: 2, r: 0 }, { s: 4, r: 0 }, { s: 3, r: 1 }, { s: 3, r: 2 }]), ...[0, 1, 2].map((i) => P.box(0.08, 0.015, 0.01, PAL.hotpink, { at: [0.3, 0.05 + i * 0.07, 0.035], rot: [0, 0, 0.3 - i * 0.3] }))]),
    chedi: pic([...mini(CARDS.chedi), P.cone(0.05, 0.16, PAL.gold, { at: [0, -0.27 + 3 * u + 0.08, 0.035] }, 10)]),
    elephant: pic([...mini(CARDS.elephant), P.sphere(0.05, '#FFB8CC', { at: [0.11, -0.27 + 2.5 * u, 0.04], scale: [1, 1.2, 0.3] }), P.cyl(0.02, 0.016, 0.17, BRICK_COLORS[4], { at: [0.27, -0.27 + 1.6 * u, 0.035] }, 6)]),
    tall: pic([...mini([0, 1, 2, 3].map((r) => ({ s: 1, r })), -0.08), ...unicorn(0.18, 0.26), P.box(0.5, 0.014, 0.01, PAL.hotpink, { at: [0, -0.27 + 3.6 * u, 0.04] })]),
  }
}

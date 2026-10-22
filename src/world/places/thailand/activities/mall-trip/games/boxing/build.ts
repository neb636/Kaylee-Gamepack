// Muay Thai at HarborLand, built from simple shapes in the house's toon look (greybox: no generated art). The flower
// mats and a blue ring mat, the ring's posts and ropes (red, white, blue; each rope two pieces that bow in the middle),
// the big red bag and the small blue one on their brackets, the coach's drum (a klong on a stand), the ring bell, the
// water bottle on its stool, the board with three stars and the lamps that fill each round, Daddy's pink pad, and the
// gold champion's belt. Pure shapes: the world (ring.ts) moves them.
import { Group, Mesh, SphereGeometry, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../../engine/dispose'
import { merge, P, solid } from '../../../../engine/geo'
import { PAL, toon } from '../../../../engine/toon'
import { BAG, BAG2, BELL, BOARD, BOTTLE, DRUM, MAT, PAD, POST_H, POSTS, ROPE_COLORS, ROPE_Y, WALL_Z } from './layout'

export interface Swinger {
  /** The pivot at the bracket: it swings (rotation.z sideways, rotation.x toward her). */
  pivot: Group
  /** The bag itself (it squashes where it's hit). */
  body: Group
  /** Its middle, below the pivot (m). */
  mid: number
}
export interface Rope {
  /** The two pieces, from a post to the middle and from the middle to the next post. */
  a: Group
  b: Group
  from: Vector3
  to: Vector3
}
export interface Built {
  root: Group
  bag: Swinger
  bag2: Swinger
  drum: Group
  /** The drum's skin (it squashes on each beat). */
  skin: Group
  bell: Group
  bottle: Group
  stool: Group
  /** The back ropes and the right-side ropes (each three, bottom to top). */
  back: Rope[]
  side: Rope[]
  board: Group
  stars: Group[]
  /** The lamps on the board (a material each: dim or lit). */
  lamps: Mesh[]
  pad: Group
  belt: Group
  picks: Group[]
}

export const LAMP_DIM = '#8E80BF'
export const LAMP_LIT = PAL.gold
export const LAMPS = 8

const star = (r: number, color: string, depth: number, at: [number, number, number] = [0, 0, 0]) =>
  P.prism(
    Array.from({ length: 10 }, (_, i): [number, number] => {
      const a = Math.PI / 2 + (i * Math.PI) / 5
      const rr = i % 2 ? r * 0.45 : r
      return [Math.cos(a) * rr + at[0], Math.sin(a) * rr + at[1]]
    }),
    depth,
    color,
    { at: [0, 0, at[2]] },
  )
/** A flat five-point star (for the gold bursts). */
export const starGeometry = () => star(0.5, '#FFFFFF', 0.12)

/** A rope piece: a thin tube one meter long (stretched between two points each frame: `setPiece`). */
const piece = (color: string, bag: Bag) => solid(merge([P.cyl(0.024, 0.024, 1, color, {}, 8)]), bag, 1.5)
const UP = new Vector3(0, 1, 0)
const dir = new Vector3()
/** Stretches a rope piece from a to b. */
export function setPiece(g: Group, a: Vector3, b: Vector3) {
  dir.subVectors(b, a)
  const len = dir.length()
  g.position.copy(a).addScaledVector(dir, 0.5)
  g.quaternion.setFromUnitVectors(UP, dir.normalize())
  g.scale.set(1, len, 1)
}

function swinger(s: { x: number; z: number; pivot: number; y0: number; y1: number; r: number }, colors: { body: string; band: string; trim: string }, bag: Bag): Swinger {
  const pivot = new Group()
  pivot.position.set(s.x, s.pivot, s.z)
  const top = s.y1 - s.pivot
  const mid = (s.y0 + s.y1) / 2 - s.pivot
  // The chain and its four straps down to the bag's top.
  pivot.add(
    solid(
      merge([
        P.cyl(0.018, 0.018, -top - 0.12, '#8D86A8', { at: [0, (top + 0.12) / 2 - 0.0, 0] }, 6),
        ...[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2 + Math.PI / 4
          return P.cyl(0.01, 0.01, 0.2, '#8D86A8', { at: [Math.cos(a) * s.r * 0.45, top + 0.07, Math.sin(a) * s.r * 0.45], rot: [Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9] }, 4)
        }),
      ]),
      bag,
      1.5,
    ),
  )
  const body = new Group()
  body.position.y = mid
  const len = s.y1 - s.y0
  body.add(
    solid(
      merge([
        P.capsule(s.r, len - 2 * s.r, colors.body),
        P.cyl(s.r * 1.02, s.r * 1.02, len * 0.12, colors.band, { at: [0, len * 0.18, 0] }, 20),
        P.cyl(s.r * 1.025, s.r * 1.025, len * 0.05, colors.trim, { at: [0, len * 0.18 - len * 0.09, 0] }, 20),
        P.cyl(s.r * 1.025, s.r * 1.025, len * 0.05, colors.trim, { at: [0, len * 0.18 + len * 0.09, 0] }, 20),
        P.cyl(s.r * 0.85, s.r * 0.95, 0.05, colors.trim, { at: [0, len / 2 - s.r * 0.25, 0] }, 20),
      ]),
      bag,
      2,
    ),
  )
  pivot.add(body)
  return { pivot, body, mid }
}

export function buildGym(bag: Bag): Built {
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

  // ---- The hall's flower mats, the blue ring mat with its white edge, the wall behind ----
  const floor: BufferGeometry[] = []
  for (let x = -6; x < 6; x++) for (let z = -2; z < 5; z++) floor.push(P.box(1, 0.1, 1, (x + z) % 2 ? '#E9E1FF' : '#DCD0FA', { at: [x + 0.5, -0.05, z - 0.5] }))
  for (const [fx, fz] of [[-3.6, 2.1], [3.2, 2.0], [0.4, 2.7], [-4.2, -0.6], [4.0, -0.4]] as [number, number][]) {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2
      floor.push(P.cyl(0.09, 0.09, 0.012, ['#FF8FB8', '#8EC9F5', '#FFFFFF'][Math.abs(Math.round(fx)) % 3], { at: [fx + Math.cos(a) * 0.12, 0.006, fz + Math.sin(a) * 0.12] }, 10))
    }
    floor.push(P.cyl(0.06, 0.06, 0.016, PAL.gold, { at: [fx, 0.008, fz] }, 10))
  }
  const mw = MAT.x1 - MAT.x0
  const md = MAT.z1 - MAT.z0
  const mc: [number, number, number] = [(MAT.x0 + MAT.x1) / 2, 0.04, (MAT.z0 + MAT.z1) / 2]
  floor.push(P.rbox(mw + 0.12, 0.07, md + 0.12, 0.03, '#FFFFFF', { at: [mc[0], 0.035, mc[2]] }))
  floor.push(P.rbox(mw, 0.08, md, 0.03, '#6F9BE8', { at: mc }))
  // A big pale circle in the middle of the mat.
  floor.push(P.cyl(0.95, 0.95, 0.012, '#8DB3F0', { at: [0.1, 0.085, 0.1] }, 32))
  add(solid(merge(floor), bag, 0))
  const back: BufferGeometry[] = [P.box(14, 5, 0.2, '#EBDDFF', { at: [0, 2.5, WALL_Z - 0.1] })]
  // A red and blue band along the wall (Muay Thai's corner colors), and a painted gold Thai pattern of diamonds.
  back.push(P.box(14, 0.22, 0.04, '#FF8F8F', { at: [0, 1.25, WALL_Z + 0.02] }))
  back.push(P.box(14, 0.12, 0.04, '#8EB2F0', { at: [0, 1.06, WALL_Z + 0.02] }))
  for (let i = -6; i <= 6; i++) back.push(P.box(0.14, 0.14, 0.04, PAL.gold, { at: [i * 0.6 + 0.3, 1.25, WALL_Z + 0.05], rot: [0, 0, Math.PI / 4] }))
  add(solid(merge(back), bag, 2))

  // ---- The ring's posts (red and blue corner pads) ----
  const posts: BufferGeometry[] = []
  POSTS.forEach(([x, z], i) => {
    posts.push(P.cyl(0.06, 0.07, POST_H, '#F4EFF8', { at: [x, POST_H / 2, z] }, 12))
    posts.push(P.rbox(0.2, 0.9, 0.2, 0.06, i === 1 ? '#5D7BB0' : '#E8403F', { at: [x, 0.78, z] }))
    posts.push(P.sphere(0.08, PAL.gold, { at: [x, POST_H + 0.04, z] }, 10))
  })
  add(solid(merge(posts), bag, 2))
  // ---- The ropes: along the back, and down the right side (each two pieces, so they can bow in the middle) ----
  const rope = (from: Vector3, to: Vector3, color: string, pick: string): Rope => {
    const a = add(piece(color, bag), pick)
    const b = add(piece(color, bag), pick)
    const mid = from.clone().lerp(to, 0.5)
    setPiece(a, from, mid)
    setPiece(b, mid, to)
    return { a, b, from, to }
  }
  const [bl, br, fr] = POSTS
  const backRopes = ROPE_Y.map((y, i) => rope(new Vector3(bl[0], y, bl[1]), new Vector3(br[0], y, br[1]), ROPE_COLORS[i], 'ropes'))
  const sideRopes = ROPE_Y.map((y, i) => rope(new Vector3(br[0], y, br[1]), new Vector3(fr[0], y, fr[1]), ROPE_COLORS[i], 'ropes'))

  // ---- The arms out from the wall that the bags hang from ----
  const brackets: BufferGeometry[] = []
  for (const s of [BAG, BAG2]) {
    const len = s.z - WALL_Z
    brackets.push(P.box(0.1, 0.1, len + 0.1, '#5D5478', { at: [s.x, s.pivot + 0.05, WALL_Z + len / 2] }))
    brackets.push(P.box(0.24, 0.24, 0.06, '#5D5478', { at: [s.x, s.pivot + 0.05, WALL_Z + 0.03] }))
    brackets.push(P.sphere(0.05, '#8D86A8', { at: [s.x, s.pivot - 0.01, s.z] }, 8))
  }
  add(solid(merge(brackets), bag, 2))

  // ---- The bags ----
  const big = swinger(BAG, { body: '#E8403F', band: '#FFFFFF', trim: PAL.gold }, bag)
  add(big.pivot)
  big.body.userData.pick = 'bag'
  picks.push(big.body)
  const small = swinger(BAG2, { body: '#5D7BB0', band: '#FFFFFF', trim: '#FF8F8F' }, bag)
  add(small.pivot)
  small.body.userData.pick = 'bag2'
  picks.push(small.body)

  // ---- The coach's drum: a red klong with gold bands on a little wooden stand, its skin on top ----
  const drum = add(
    solid(
      merge([
        ...[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2
          return P.cyl(0.025, 0.025, DRUM.h * 0.62, '#B07A4A', { at: [Math.cos(a) * DRUM.r * 0.8, DRUM.h * 0.28, Math.sin(a) * DRUM.r * 0.8], rot: [Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25] }, 6)
        }),
        P.cyl(DRUM.r * 0.95, DRUM.r * 0.8, DRUM.h * 0.46, '#D2483F', { at: [0, DRUM.h * 0.75, 0] }, 20),
        P.sphere(DRUM.r * 1.0, '#D2483F', { at: [0, DRUM.h * 0.78, 0], scale: [1, 0.55, 1] }, 20),
        P.torus(DRUM.r * 0.97, 0.025, PAL.gold, { at: [0, DRUM.h * 0.98, 0], rot: [Math.PI / 2, 0, 0] }),
        P.torus(DRUM.r * 0.86, 0.022, PAL.gold, { at: [0, DRUM.h * 0.56, 0], rot: [Math.PI / 2, 0, 0] }),
        ...Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2
          return P.cyl(0.008, 0.008, DRUM.h * 0.4, '#FFF1DC', { at: [Math.cos(a) * DRUM.r * 0.93, DRUM.h * 0.77, Math.sin(a) * DRUM.r * 0.93], rot: [Math.sin(a) * 0.15, 0, -Math.cos(a) * 0.15] }, 4)
        }),
      ]),
      bag,
      2,
    ),
    'drum',
  )
  drum.position.set(DRUM.x, 0, DRUM.z)
  const skin = solid(merge([P.cyl(DRUM.r * 0.94, DRUM.r * 0.94, 0.03, '#FFF1DC', {}, 24)]), bag, 1.5)
  skin.position.y = DRUM.h * 1.0
  drum.add(skin)

  // ---- The ring bell on the front right post: a gold dome and its little hammer ----
  const bell = add(
    solid(
      merge([
        P.box(0.08, 0.2, 0.06, '#5D5478', { at: [0, -0.12, -0.03] }),
        // Its arm to the corner post.
        P.box(0.2, 0.06, 0.06, '#5D5478', { at: [0.1, -0.18, -0.03] }),
        P.sphere(0.15, PAL.gold, { at: [0, 0, 0.07], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.5] }, 18),
        P.sphere(0.035, '#E8A92A', { at: [0, 0, 0.15] }, 8),
        P.cyl(0.012, 0.012, 0.14, '#5D5478', { at: [0.13, 0.09, 0.1], rot: [0, 0, 0.7] }, 6),
        P.sphere(0.03, '#E8403F', { at: [0.18, 0.15, 0.1] }, 8),
      ]),
      bag,
      2,
    ),
    'bell',
  )
  bell.position.set(BELL.x, BELL.y, BELL.z)

  // ---- The water bottle on a little stool ----
  const stool = add(solid(merge([P.cyl(0.2, 0.18, 0.06, '#FFC2A8', { at: [0, BOTTLE.stool, 0] }, 16), ...[0, 1, 2].map((i) => P.cyl(0.025, 0.025, BOTTLE.stool, '#B07A4A', { at: [Math.cos(i * 2.1) * 0.13, BOTTLE.stool / 2, Math.sin(i * 2.1) * 0.13] }, 6))]), bag, 2))
  stool.position.set(BOTTLE.x, 0, BOTTLE.z)
  const bottle = add(
    solid(
      merge([
        P.cyl(0.065, 0.065, 0.24, '#FF8FB8', { at: [0, 0.12, 0] }, 14),
        P.cyl(0.067, 0.067, 0.08, '#FFFFFF', { at: [0, 0.13, 0] }, 14),
        P.cyl(0.04, 0.06, 0.05, '#FF8FB8', { at: [0, 0.265, 0] }, 12),
        P.cyl(0.03, 0.03, 0.05, '#8FE3C8', { at: [0, 0.31, 0] }, 10),
      ]),
      bag,
      2,
    ),
    'bottle',
  )
  bottle.position.set(BOTTLE.x, BOTTLE.stool + 0.03, BOTTLE.z)

  // ---- The board on the wall: three star slots and the round's lamps ----
  const board = add(
    solid(
      merge([
        P.rbox(BOARD.w, BOARD.h, 0.06, 0.05, '#3F365F', {}),
        P.rbox(BOARD.w - 0.08, BOARD.h - 0.08, 0.02, 0.04, '#4E4475', { at: [0, 0, 0.03] }),
        ...[-1, 0, 1].map((i) => star(0.13, '#6C5FA0', 0.02, [i * 0.34, 0.1, 0.045])),
      ]),
      bag,
      2,
    ),
    'board',
  )
  board.position.set(BOARD.x, BOARD.y, BOARD.z)
  const stars = [-1, 0, 1].map((i) => {
    const g = solid(merge([star(0.15, PAL.gold, 0.05)]), bag, 1.5)
    g.position.set(i * 0.34, 0.1, 0.07)
    g.visible = false
    board.add(g)
    return g
  })
  const lampGeo = bag.add(new SphereGeometry(0.035, 10, 7))
  const lamps = Array.from({ length: LAMPS }, (_, i) => {
    const m = new Mesh(lampGeo, toon(LAMP_DIM))
    m.position.set((i - (LAMPS - 1) / 2) * 0.13, -0.17, 0.05)
    board.add(m)
    return m
  })

  // ---- Daddy's pad: a fat pink kick pad with a white target on the front and handles at the back ----
  const pad = solid(
    merge([
      P.rbox(PAD.w, PAD.h, PAD.d, 0.07, '#FF8FB8', {}),
      P.cyl(0.13, 0.13, 0.02, '#FFFFFF', { at: [0, 0.02, PAD.d / 2], rot: [Math.PI / 2, 0, 0] }, 20),
      P.cyl(0.06, 0.06, 0.024, '#FF4F9A', { at: [0, 0.02, PAD.d / 2 + 0.004], rot: [Math.PI / 2, 0, 0] }, 16),
      ...[-1, 1].map((s) => P.box(0.06, 0.04, 0.08, '#B9A6F5', { at: [s * 0.12, -0.1, -PAD.d / 2 - 0.03] })),
    ]),
    bag,
    2,
  )
  pad.userData.pick = 'pad'
  pad.visible = false
  add(pad)
  picks.push(pad)

  // ---- The champion's belt (it goes round Kaylee's waist at the end) ----
  const belt = solid(
    merge([
      P.torus(0.172, 0.032, PAL.gold, { at: [0, 0, 0], rot: [Math.PI / 2, 0, 0] }),
      P.cyl(0.085, 0.085, 0.03, PAL.gold, { at: [0, 0, 0.17], rot: [Math.PI / 2, 0, 0] }, 20),
      P.torus(0.085, 0.012, '#E8A92A', { at: [0, 0, 0.185] }),
      star(0.045, '#FF4F9A', 0.02, [0, 0, 0.192]),
    ]),
    bag,
    2,
  )
  belt.visible = false

  return { root, bag: big, bag2: small, drum, skin, bell, bottle, stool, back: backRopes, side: sideRopes, board, stars, lamps, pad, belt, picks }
}

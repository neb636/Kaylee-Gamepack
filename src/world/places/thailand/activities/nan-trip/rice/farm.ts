// Sapan's little rice farm, modeled in code in the house's toon look (engine/geo.ts parts), from Dad's Animal Crossing
// pictures: two levels of ground with thick grass lips over sandy cut sides, four square paddies sunk into them (cracked
// mud floors, water that rises and shines), the channel running between them from a bamboo pipe off the hill, down the
// step and under the boardwalk, a wooden gate for each paddy, the plank boardwalk and bridge, the stairs, the scarecrow
// in its ngob, the farm hut under its thatch, a banana plant, bamboo, the nursery bed of seedlings, the drying rack, the
// threshing basket and the straw pile, the buffalo in its wallow, ducks and a frog, the hill behind with its trees and
// Stop Time Cafe up on it, Sapan's rice steps on the valley's sides (what the deck looks out at), low clouds drifting
// round them, and the far mountains all the way round.
import { BackSide, BufferAttribute, CanvasTexture, Color, CylinderGeometry, Euler, ExtrudeGeometry, Group, Matrix4, Mesh, MeshBasicMaterial, Path, PlaneGeometry, Quaternion, RepeatWrapping, RingGeometry, Shape, SRGBColorSpace, Vector2, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../engine/dispose'
import { bake, blobShadow, merge, P, solid } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import {
  BAMBOO,
  BANANA,
  BASKET,
  BOARDWALK,
  BRIDGES,
  CHANNEL,
  DECK,
  CHANNEL_HALF,
  FARM,
  HUT,
  inTerrace,
  MUD_DOWN,
  NURSERY,
  PADDIES,
  PIPE_TO,
  RACK,
  RISE,
  RISER_Z,
  SCARECROW,
  STAIRS,
  STRAW_PILE,
  TERRACES,
  WALLOW,
  WATER_DOWN,
  type Paddy,
  type V3,
} from './layout'
import { FarmWater } from './water'

export const GRASS = '#86CF78'
const GRASS_LIP = '#7DC873'
const SAND = '#E8B784'
const MUD = '#B79E80'
const MUD_CRACK = '#9C8468'
const DIRT = '#DEC296'
const WOOD = '#C08A5B'
const WOOD_LIGHT = '#CF9B6A'
const WOOD_DARK = '#8C6248'
export const STRAW = '#EFCB72'
const STRAW_DARK = '#D9AE52'
const NGOB = '#EBCB86'
const NGOB_DARK = '#C9A05E'
const TREES = ['#6CC08A', '#5FB47E', '#7FCB8C', '#8AD18A']

/** Overhang of the grass lip over the sandy cut sides. */
const LIP = 0.045
const BOTTOM = -1.2
/** Where the hill starts rising, behind the back paddies. */
export const HILL_Z = CHANNEL.z0

/** The hill's height behind the farm (and the flat ground in front of it). */
export function hillY(x: number, z: number) {
  const d = HILL_Z - z
  if (d <= 0) return RISE
  const s = (a: number, b: number, v: number) => {
    const k = Math.min(1, Math.max(0, (v - a) / (b - a)))
    return k * k * (3 - 2 * k)
  }
  return RISE + 2.4 * s(0, 7, d) + 2.2 * s(6, 18, d) + 0.55 * Math.sin(x * 0.33 + 1) * s(1, 6, d) + 0.25 * Math.sin(x * 0.9 + z * 0.4) * s(2, 8, d)
}

export interface Gate {
  /** The board that lifts. */
  board: Group
  /** The water through the open gate (a little surface on the bank). */
  flow: Mesh
}

export interface Farm {
  root: Group
  water: FarmWater
  /** Each paddy's water (it rises from the mud and shines), and the channel's. */
  paddyWater: Mesh[]
  channel: Mesh[]
  /** The little waterfall down the step, and the stream out of the bamboo pipe. */
  fall: Mesh
  stream: Mesh
  gates: Gate[]
  scarecrow: { root: Group; hat: Group; perches: V3[] }
  hut: { root: Group; chime: Group; perch: V3 }
  banana: Group
  nursery: Group
  rack: { root: Group; bundles: Group[]; perch: V3 }
  basket: { root: Group; heap: Mesh; board: Group }
  straw: Group
  buffalo: { root: Group; head: Group; tail: Group }
  ducks: Group[]
  frog: { root: Group; throat: Mesh }
  bamboo: Group
  /** The café's middle (for its tap target). */
  cafeAt: V3
  /** Low clouds along the valley (rice3d.ts drifts them). */
  mist: Group[]
}

// ---------------------------------------------------------------- shapes

/** A flat outline (x, z) with holes, from y0 up to y1. */
function slab(outer: [number, number][], holes: [number, number][][], y0: number, y1: number, color: string): BufferGeometry {
  const shape = new Shape(outer.map(([x, z]) => new Vector2(x, z)))
  for (const h of holes) shape.holes.push(new Path(h.map(([x, z]) => new Vector2(x, z))))
  const g = new ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false, curveSegments: 1 })
  // (Turned so the outline's y is z and it extrudes downward from y1: not mirrored, so its faces stay outward.)
  return bake(g, color, { at: [0, y1, 0], rot: [Math.PI / 2, 0, 0] })
}
const rect = (x0: number, z0: number, x1: number, z1: number, grow = 0): [number, number][] => [
  [x0 - grow, z0 - grow],
  [x1 + grow, z0 - grow],
  [x1 + grow, z1 + grow],
  [x0 - grow, z1 + grow],
]
const holeOf = (p: Paddy, shrink = 0) => rect(p.x0 + shrink, p.z0 + shrink, p.x1 - shrink, p.z1 - shrink)

/** A little hash in [0, 1) (the same seed always gets the same number, so the farm looks the same each visit). */
const rnd = (i: number, j = 0) => {
  const s = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453
  return s - Math.floor(s)
}

/** A round pole from a to b (a rack's leg, a fence rail). */
function stick(a: V3, b: V3, r: number, c: string, seg = 6) {
  const d = new Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2])
  const len = d.length()
  const e = new Euler().setFromQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), d.normalize()))
  return P.cyl(r, r, len, c, { at: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], rot: [e.x, e.y, e.z] }, seg)
}

/** The wide palm-leaf farmer's hat (a ngob): a shallow cone with woven rings, `r` across. Its middle is the crown. */
export function ngobParts(r: number, at: V3 = [0, 0, 0]): BufferGeometry[] {
  const h = r * 0.42
  return [
    P.cone(r, h, NGOB, { at: [at[0], at[1] + h / 2, at[2]] }, 28),
    P.torus(r * 0.98, r * 0.035, NGOB_DARK, { at: [at[0], at[1] + 0.01, at[2]], rot: [Math.PI / 2, 0, 0] }, Math.PI * 2),
    ...[0.38, 0.66].map((k) => P.torus(r * (1 - k) * 0.99, r * 0.02, NGOB_DARK, { at: [at[0], at[1] + h * k, at[2]], rot: [Math.PI / 2, 0, 0] })),
    P.sphere(r * 0.08, NGOB_DARK, { at: [at[0], at[1] + h, at[2]] }, 8),
  ]
}

/** A straw bundle tied in the middle (a sheaf of cut rice), lying along x, its grain heads at +x. */
export function sheafParts(at: V3 = [0, 0, 0], s = 1): BufferGeometry[] {
  return [
    P.cyl(0.07 * s, 0.1 * s, 0.5 * s, STRAW, { at, rot: [0, 0, Math.PI / 2] }, 10),
    P.torus(0.078 * s, 0.018 * s, '#B5823F', { at: [at[0] - 0.02 * s, at[1], at[2]], rot: [0, Math.PI / 2, 0] }, Math.PI * 2),
    P.sphere(0.12 * s, '#F5C84A', { at: [at[0] + 0.27 * s, at[1] - 0.02 * s, at[2]], scale: [1, 0.8, 1.1] }, 10),
  ]
}

// ---------------------------------------------------------------- the farm

export function buildFarm(bag: Bag): Farm {
  const root = new Group()
  const ground: BufferGeometry[] = []
  const [A, B, C, D] = PADDIES
  const cx = CHANNEL_HALF
  // ---- The two levels of ground, split by the channel, the paddies cut into them ----
  // Front level (tops at 0): from under the step to far in front.
  const FAR = 20
  const front = { z0: RISER_Z - 0.05, z1: CHANNEL.z1 }
  const back = { z0: HILL_Z - 0.05, z1: RISER_Z }
  for (const [x0, x1, p] of [[-FAR, -cx, A], [cx, FAR, B]] as const) {
    ground.push(slab(rect(x0, front.z0, x1, front.z1), [holeOf(p)], BOTTOM, -0.07, SAND))
    const lx0 = x0 < 0 ? x0 : x0 - LIP
    const lx1 = x0 < 0 ? x1 + LIP : x1
    ground.push(slab(rect(lx0, front.z0, lx1, front.z1), [holeOf(p, LIP)], -0.075, 0, GRASS_LIP))
  }
  for (const [x0, x1, p] of [[-FAR, -cx, C], [cx, FAR, D]] as const) {
    ground.push(slab(rect(x0, back.z0, x1, back.z1), [holeOf(p)], BOTTOM, RISE - 0.07, SAND))
    const lx0 = x0 < 0 ? x0 : x0 - LIP
    const lx1 = x0 < 0 ? x1 + LIP : x1
    ground.push(slab(rect(lx0, back.z0, lx1, back.z1 + LIP), [holeOf(p, LIP)], RISE - 0.075, RISE, GRASS_LIP))
  }
  // The channel's bed (front and back), and the sandy end where it starts under the pipe.
  ground.push(P.box(cx * 2, 0.2, front.z1 - RISER_Z, SAND, { at: [0, -0.3, (front.z1 + RISER_Z) / 2] }))
  ground.push(P.box(cx * 2, 0.2, RISER_Z - HILL_Z, SAND, { at: [0, RISE - 0.3, (RISER_Z + HILL_Z) / 2] }))
  ground.push(P.box(cx * 2 + 0.1, RISE + 1.2, 0.3, SAND, { at: [0, RISE - 0.6 - 0.02, HILL_Z - 0.12] }))
  // Pebbles along the channel's edges.
  for (let i = 0; i < 26; i++) {
    const z = HILL_Z + 0.3 + rnd(i, 1) * (BOARDWALK.z0 - HILL_Z - 0.4)
    if (BRIDGES.some(([a, b]) => z > a - 0.1 && z < b + 0.1) || Math.abs(z - RISER_Z) < 0.15) continue
    const side = i % 2 ? 1 : -1
    const top = z < RISER_Z ? RISE : 0
    ground.push(P.sphere(0.045 + rnd(i, 2) * 0.03, i % 3 ? '#C9C0D6' : '#B7AFC6', { at: [side * (cx - 0.04), top - 0.11, z], scale: [1, 0.6, 1.3] }, 6))
  }
  // ---- The paddies' mud floors, cracked where they're dry ----
  for (const p of PADDIES) {
    const w = p.x1 - p.x0
    const d = p.z1 - p.z0
    ground.push(P.box(w, 0.1, d, MUD, { at: [p.mid[0], p.top - MUD_DOWN - 0.05, p.mid[2]] }))
    for (let k = 0; k < 16; k++) {
      // Short dark cracks in a loose net, each a thin strip lying on the mud.
      const x = p.x0 + 0.25 + rnd(p.i * 31 + k, 3) * (w - 0.5)
      const z = p.z0 + 0.2 + rnd(p.i * 31 + k, 4) * (d - 0.4)
      const len = 0.3 + rnd(k, p.i) * 0.45
      ground.push(P.box(len, 0.004, 0.03, MUD_CRACK, { at: [x, p.top - MUD_DOWN + 0.002, z], rot: [0, rnd(k, p.i + 9) * Math.PI, 0] }))
    }
  }
  // ---- The dirt path along the step (the front level), and the rows of fields far in front ----
  for (const [x0, x1] of [[-FARM.x - 1.2, -cx - 0.06], [cx + 0.06, FARM.x + 1.6]]) ground.push(P.rbox(x1 - x0, 0.02, 0.78, 0.01, DIRT, { at: [(x0 + x1) / 2, 0.006, -0.02] }))
  // In front of the boardwalk: a dirt lane, and a hedge of bushes beyond it.
  ground.push(P.rbox(40, 0.02, 0.9, 0.01, DIRT, { at: [0, 0.006, 6.1] }))
  for (let i = 0; i < 22; i++) {
    const x = -13 + i * 1.25 + (rnd(i, 31) - 0.5) * 0.5
    if (Math.abs(x) < 0.8 || inTerrace(x, 7.5, 0.5)) continue
    const r = 0.38 + rnd(i, 32) * 0.22
    ground.push(P.sphere(r, TREES[i % 4], { at: [x, r * 0.55, 7.3 + rnd(i, 33) * 0.4], scale: [1.3, 0.9, 1] }, 12))
    if (i % 4 === 1) for (let k = 0; k < 3; k++) ground.push(P.sphere(0.06, ['#FF8FB8', '#FFFFFF', '#FFE27A'][(i + k) % 3], { at: [x - 0.25 + k * 0.25, r * 1.05, 7.3 + r * 0.6] }, 6))
  }
  // Grass tufts and little flowers on the grass round about.
  for (let i = 0; i < 70; i++) {
    const x = -7.5 + rnd(i, 5) * 15
    const z = HILL_Z + 0.2 + rnd(i, 6) * (6.2 - HILL_Z)
    if (Math.abs(x) < FARM.x + 0.15 && z > FARM.back - 0.1 && z < BOARDWALK.z1 + 0.15) {
      // On the farm itself only along the banks' outer edges, never in a paddy.
      if (PADDIES.some((p) => x > p.x0 - 0.3 && x < p.x1 + 0.3 && z > p.z0 - 0.3 && z < p.z1 + 0.3) || Math.abs(x) < 0.7 || (z > -0.5 && z < 0.5) || z > BOARDWALK.z0 - 0.1) continue
    }
    if (inTerrace(x, z, 0.2)) continue
    const top = z < RISER_Z ? RISE : 0
    if (i % 3 === 0) {
      const c = ['#FF8FB8', '#FFFFFF', '#FFE27A', '#E2B6FF'][i % 4]
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2
        ground.push(P.sphere(0.035, c, { at: [x + Math.cos(a) * 0.04, top + 0.05, z + Math.sin(a) * 0.04], scale: [1, 0.5, 1] }, 6))
      }
      ground.push(P.sphere(0.025, '#FFC83D', { at: [x, top + 0.06, z] }, 6))
      ground.push(P.cyl(0.008, 0.008, 0.05, '#5FB47E', { at: [x, top + 0.025, z] }, 4))
    } else for (let k = 0; k < 3; k++) ground.push(P.cone(0.035, 0.14 + k * 0.03, k ? '#6FBF6A' : '#5FAE60', { at: [x + (k - 1) * 0.04, top + 0.06, z + (k % 2) * 0.03], rot: [(k - 1) * 0.25, 0, (k - 1) * 0.3] }, 4))
  }
  root.add(solid(merge(ground), bag, 2))
  // Soft patches of lighter and darker grass round the farm, so the flat ground isn't all one green (paint: no outline).
  const patches: BufferGeometry[] = []
  for (let i = 0; i < 46; i++) {
    const x = -13 + rnd(i, 41) * 26
    const z = HILL_Z + 0.5 + rnd(i, 42) * (8.5 - HILL_Z)
    const r = 0.45 + rnd(i, 43) * 0.8
    if (inTerrace(x, z, r) || (Math.abs(x) < FARM.x + r * 1.4 && z > FARM.back - r && z < BOARDWALK.z1 + r) || Math.hypot(x - WALLOW.x, z - WALLOW.z) < WALLOW.r + r * 1.4) continue
    const top = z < RISER_Z ? RISE : 0
    patches.push(P.cyl(r, r, 0.01, ['#93D586', '#7CC470', '#8FD27F', '#80C977'][i % 4], { at: [x, top + 0.004, z], rot: [0, rnd(i, 44) * 3, 0], scale: [1.5, 1, 0.8] }, 16))
  }
  root.add(solid(merge(patches), bag, 0))

  // ---- The water: each paddy's, the channel's, the fall down the step, the stream out of the pipe ----
  const water = new FarmWater(bag)
  const paddyWater = PADDIES.map((p) => {
    const m = water.surface(p.mid[0], p.mid[2], p.x1 - p.x0, p.z1 - p.z0, { shine: 0 })
    m.position.y = p.top - WATER_DOWN
    m.userData.pick = `paddy:${p.i}`
    root.add(m)
    return m
  })
  const channel = [
    water.surface(0, (RISER_Z + CHANNEL.z1) / 2, cx * 2, CHANNEL.z1 - RISER_Z, { flow: [0, 0.35] }),
    water.surface(0, (HILL_Z + RISER_Z) / 2, cx * 2, RISER_Z - HILL_Z, { flow: [0, 0.35] }),
  ]
  channel[0].position.y = -0.11
  channel[1].position.y = RISE - 0.11
  for (const c of channel) root.add(c)
  const fall = new Mesh(bag.add(new PlaneGeometry(cx * 2 - 0.04, RISE + 0.02)), bag.add(new MeshBasicMaterial({ color: '#CDEBFA', transparent: true, opacity: 0.9, map: stripesTexture(bag) })))
  fall.position.set(0, RISE / 2 - 0.11, RISER_Z + 0.02)
  fall.renderOrder = 2
  root.add(fall)
  const streamLen = PIPE_TO[1] - (RISE - 0.11)
  const stream = new Mesh(bag.add(new CylinderGeometry(0.04, 0.055, streamLen, 10, 1, true)), bag.add(new MeshBasicMaterial({ color: '#CDEBFA', transparent: true, opacity: 0.85, map: stripesTexture(bag) })))
  stream.position.set(PIPE_TO[0], PIPE_TO[1] - streamLen / 2, PIPE_TO[2] + 0.06)
  stream.renderOrder = 2
  root.add(stream)

  // ---- The bamboo pipe off the hill, on its forked sticks ----
  const pipeParts: BufferGeometry[] = []
  const from: V3 = [PIPE_TO[0] - 0.35, hillY(PIPE_TO[0] - 0.35, PIPE_TO[2] - 2.6) + 0.2, PIPE_TO[2] - 2.6]
  const len = Math.hypot(PIPE_TO[0] - from[0], PIPE_TO[1] - from[1], PIPE_TO[2] - from[2])
  const pitch = Math.atan2(PIPE_TO[1] - from[1], PIPE_TO[2] - from[2])
  const yaw = Math.atan2(PIPE_TO[0] - from[0], PIPE_TO[2] - from[2])
  const along = (k: number): V3 => [from[0] + (PIPE_TO[0] - from[0]) * k, from[1] + (PIPE_TO[1] - from[1]) * k, from[2] + (PIPE_TO[2] - from[2]) * k]
  pipeParts.push(P.cyl(0.07, 0.07, len, '#A9CF6B', { at: along(0.5), rot: [Math.PI / 2 + pitch, yaw, 0] }, 10))
  for (const k of [0.2, 0.45, 0.7, 0.95]) pipeParts.push(P.cyl(0.078, 0.078, 0.04, '#8DB35A', { at: along(k), rot: [Math.PI / 2 + pitch, yaw, 0] }, 10))
  for (const k of [0.35, 0.82]) {
    const [x, y, z] = along(k)
    const g = hillY(x, z) - 0.05
    for (const s of [-1, 1]) pipeParts.push(P.cyl(0.025, 0.03, y - g + 0.12, WOOD_DARK, { at: [x + s * 0.06, (y + g) / 2 + 0.02, z], rot: [0, 0, s * 0.3] }, 5))
  }
  root.add(solid(merge(pipeParts), bag, 2))

  // ---- The gates: a wooden board in a slot in each paddy's bank by the channel ----
  const gates = PADDIES.map((p) => {
    const [gx, gy, gz] = p.gate
    root.add(solid(merge([...[-1, 1].map((s) => P.rbox(0.08, 0.44, 0.08, 0.015, WOOD_DARK, { at: [gx, gy + 0.12, gz + s * 0.3] })), P.box(0.37, 0.012, 0.52, '#9A8064', { at: [gx, gy + 0.004, gz] })]), bag, 2))
    const board = new Group()
    board.position.set(gx, gy, gz)
    board.add(solid(merge([P.rbox(0.06, 0.32, 0.52, 0.015, WOOD_LIGHT, { at: [0, 0.12, 0] }), ...[-0.1, 0.1].map((z) => P.box(0.065, 0.32, 0.015, WOOD, { at: [0, 0.12, z] })), P.cyl(0.018, 0.018, 0.22, WOOD_DARK, { at: [0, 0.33, 0], rot: [Math.PI / 2, 0, 0] }, 6), ...[-0.08, 0.08].map((z) => P.cyl(0.012, 0.012, 0.06, WOOD_DARK, { at: [0, 0.3, z] }, 5))]), bag, 2))
    root.add(board)
    const flow = water.surface(gx, gz, 0.37, 0.4)
    flow.position.y = gy + 0.014
    flow.visible = false
    root.add(flow)
    return { board, flow }
  })

  // ---- The boardwalk along the front, the bridge on the path, the stairs up the step ----
  const wood: BufferGeometry[] = []
  const bw = BOARDWALK
  for (let x = bw.x0; x < bw.x1 - 0.1; x += 0.23) wood.push(P.rbox(0.2, 0.06, bw.z1 - bw.z0, 0.012, rnd(x * 7) > 0.5 ? WOOD : WOOD_LIGHT, { at: [x + 0.1, bw.y - 0.03, (bw.z0 + bw.z1) / 2] }))
  for (const z of [bw.z0 + 0.06, bw.z1 - 0.06]) wood.push(P.box(bw.x1 - bw.x0, 0.06, 0.08, WOOD_DARK, { at: [(bw.x0 + bw.x1) / 2, bw.y - 0.08, z] }))
  for (let x = bw.x0 + 0.3; x < bw.x1; x += 1.8) wood.push(P.cyl(0.05, 0.05, 0.3, WOOD_DARK, { at: [x, bw.y - 0.18, bw.z1 - 0.05] }, 8))
  const [pz0, pz1] = BRIDGES[0]
  for (let z = pz0; z < pz1 - 0.05; z += 0.2) wood.push(P.rbox(0.82, 0.05, 0.17, 0.01, rnd(z * 5) > 0.5 ? WOOD : WOOD_LIGHT, { at: [0, 0.035, z + 0.09] }))
  for (const s of [-1, 1]) wood.push(P.box(0.06, 0.06, pz1 - pz0, WOOD_DARK, { at: [s * 0.36, 0.0, (pz0 + pz1) / 2] }))
  for (const sx of STAIRS) {
    for (let k = 0; k < 3; k++) wood.push(P.rbox(0.76, 0.06, 0.2, 0.012, k % 2 ? WOOD_LIGHT : WOOD, { at: [sx, 0.12 + k * 0.14, RISER_Z + 0.42 - k * 0.17] }))
    for (const s of [-1, 1]) wood.push(P.box(0.06, 0.5, 0.62, WOOD_DARK, { at: [sx + s * 0.4, 0.2, RISER_Z + 0.24], rot: [-0.62, 0, 0] }))
  }
  root.add(solid(merge(wood), bag, 2))

  // ---- The scarecrow, in a pink shirt and a ngob ----
  const scare = new Group()
  scare.position.set(...SCARECROW)
  scare.userData.pick = 'scarecrow'
  scare.add(
    solid(
      merge([
        P.cyl(0.045, 0.055, 1.5, WOOD_DARK, { at: [0, 0.75, 0] }, 8),
        P.cyl(0.035, 0.035, 1.15, WOOD_DARK, { at: [0, 1.14, 0], rot: [0, 0, Math.PI / 2] }, 8),
        P.cone(0.24, 0.36, STRAW, { at: [0, 0.74, 0], rot: [Math.PI, 0, 0] }, 12),
        P.rbox(0.42, 0.42, 0.24, 0.09, PAL.pink, { at: [0, 1.05, 0] }),
        ...[-0.1, 0.1].map((x) => P.box(0.03, 0.42, 0.245, PAL.hotpink, { at: [x, 1.05, 0] })),
        P.box(0.425, 0.03, 0.245, PAL.hotpink, { at: [0, 1.0, 0] }),
        ...[-1, 1].map((s) => P.cyl(0.075, 0.085, 0.42, PAL.pink, { at: [s * 0.36, 1.14, 0], rot: [0, 0, Math.PI / 2] }, 10)),
        ...[-1, 1].flatMap((s) => [0, 1, 2].map((k) => P.cone(0.035, 0.18, STRAW, { at: [s * 0.62, 1.14 + (k - 1) * 0.04, (k - 1) * 0.03], rot: [0, 0, -s * (Math.PI / 2 + (k - 1) * 0.35)] }, 5))),
        P.sphere(0.19, '#EAD5A6', { at: [0, 1.43, 0] }, 16),
        ...[-1, 1].map((s) => P.sphere(0.022, PAL.ink, { at: [s * 0.065, 1.46, 0.17] }, 6)),
        ...[-1, 1].map((s) => P.sphere(0.035, '#FF9DB8', { at: [s * 0.11, 1.39, 0.15], scale: [1, 0.6, 0.4] }, 6)),
        P.torus(0.06, 0.012, PAL.ink, { at: [0, 1.4, 0.17], rot: [0, 0, Math.PI] }, Math.PI),
        ...[-0.045, 0, 0.045].map((x) => P.box(0.008, 0.03, 0.01, PAL.ink, { at: [x, 1.36, 0.175] })),
      ]),
      bag,
      2,
    ),
  )
  const hat = new Group()
  hat.position.set(0, 1.56, 0)
  hat.add(solid(merge(ngobParts(0.32)), bag, 2))
  scare.add(hat)
  scare.add(blobShadow(0.35, bag))
  root.add(scare)

  // ---- The farm hut: posts, a raised floor, a thatched roof, rice sacks, a ladder, a chime ----
  const hut = new Group()
  hut.position.set(...HUT)
  hut.userData.pick = 'hut'
  // A thatched gable roof: each side a thick slab of thatch with rows of darker straw and a shaggy fringe along the
  // eaves, a ridge along the top, and the gable ends open (a triangle of wood).
  const thatch: BufferGeometry[] = []
  const slope = 0.6
  for (const s of [-1, 1]) {
    const side: BufferGeometry[] = [P.rbox(2.15, 0.14, 1.2, 0.05, '#DDB874', { at: [0, 0, 0] })]
    for (let k = 0; k < 4; k++) side.push(P.box(2.17, 0.02, 0.05, '#C49A58', { at: [0, 0.072, -0.42 + k * 0.26] }))
    for (let k = 0; k < 15; k++) side.push(P.cone(0.07, 0.16, k % 2 ? '#D3AB64' : '#DDB874', { at: [-1.0 + k * 0.143, -0.06, 0.6], rot: [Math.PI / 2 + 0.6, 0, 0] }, 5))
    const m = new Matrix4().makeRotationX(s * slope).setPosition(0, 2.0, s * 0.5)
    if (s < 0) m.multiply(new Matrix4().makeRotationY(Math.PI))
    for (const g of side) thatch.push(g.applyMatrix4(m))
  }
  thatch.push(P.cyl(0.08, 0.08, 2.2, '#C49A58', { at: [0, 2.33, 0], rot: [0, 0, Math.PI / 2] }, 8))
  for (const x of [-0.95, 0.95]) thatch.push(P.prism([[-0.8, 0], [0.8, 0], [0, 0.5]], 0.04, WOOD, { at: [x, 1.82, 0], rot: [0, Math.PI / 2, 0] }))
  hut.add(
    solid(
      merge([
        ...[-0.75, 0.75].flatMap((x) => [-0.6, 0.6].map((z) => P.cyl(0.06, 0.07, 1.75, WOOD_DARK, { at: [x, 0.87, z] }, 8))),
        P.box(1.7, 0.08, 1.4, WOOD, { at: [0, 0.5, 0] }),
        ...[-0.55, -0.2, 0.15, 0.5].map((x) => P.box(0.02, 0.085, 1.4, WOOD_DARK, { at: [x, 0.5, 0] })),
        P.rbox(0.42, 0.34, 0.3, 0.1, '#F4E9D2', { at: [-0.35, 0.72, -0.25] }),
        P.rbox(0.38, 0.3, 0.28, 0.1, '#EFE0C2', { at: [0.1, 0.7, -0.3] }),
        P.cyl(0.14, 0.11, 0.3, '#D98F6A', { at: [0.45, 0.69, 0.2] }, 12),
        ...[-1, 1].map((s) => P.cyl(0.025, 0.025, 0.75, WOOD_DARK, { at: [0.1 + s * 0.17, 0.3, 0.88], rot: [0.35, 0, 0] }, 5)),
        ...[0.12, 0.3, 0.48].map((y) => P.cyl(0.018, 0.018, 0.34, WOOD_DARK, { at: [0.1, y, 0.97 - y * 0.36], rot: [0, 0, Math.PI / 2] }, 5)),
        ...thatch,
      ]),
      bag,
      2,
    ),
  )
  const chime = new Group()
  chime.position.set(0.85, 1.6, 0.75)
  chime.add(solid(merge([P.cyl(0.005, 0.005, 0.2, PAL.ink, { at: [0, 0.1, 0] }, 4), P.torus(0.07, 0.01, WOOD_DARK, { rot: [Math.PI / 2, 0, 0] }), ...Array.from({ length: 4 }, (_, k) => P.cyl(0.018, 0.018, 0.14 + (k % 2) * 0.05, '#A9CF6B', { at: [Math.cos((k / 4) * Math.PI * 2) * 0.05, -0.1, Math.sin((k / 4) * Math.PI * 2) * 0.05] }, 6))]), bag, 1))
  hut.add(chime)
  hut.add(blobShadow(1.1, bag))
  root.add(hut)

  // ---- The banana plant ----
  const banana = new Group()
  banana.position.set(...BANANA)
  banana.userData.pick = 'banana'
  const leaves: BufferGeometry[] = [P.cyl(0.09, 0.14, 1.2, '#A3C46A', { at: [0, 0.6, 0] }, 10), P.cyl(0.08, 0.1, 0.6, '#93B85E', { at: [0.18, 0.3, 0.1] }, 8)]
  for (let k = 0; k < 6; k++) {
    // Each leaf: a long wide blade arching up and out of the top, then drooping at the tip.
    const a = (k / 6) * Math.PI * 2 + 0.3
    const c = k % 2 ? '#7CCB6A' : '#8FD878'
    const lift = 0.55 - (k % 3) * 0.18
    const leaf = [P.sphere(0.5, c, { at: [0, 0, 0.5], scale: [0.34, 0.045, 1] }, 12), P.sphere(0.36, c, { at: [0, -0.14, 1.12], rot: [0.5, 0, 0], scale: [0.34, 0.045, 0.85] }, 10)]
    const m = new Matrix4().makeRotationY(a).multiply(new Matrix4().makeRotationX(-lift)).setPosition(Math.sin(a) * 0.1, 1.3, Math.cos(a) * 0.1)
    for (const g of leaf) leaves.push(g.applyMatrix4(m))
  }
  leaves.push(P.sphere(0.11, '#9C4F7A', { at: [0.25, 1.0, 0.25], scale: [1, 1.6, 1] }, 10))
  for (let k = 0; k < 5; k++) leaves.push(P.capsule(0.03, 0.09, '#B6D86A', { at: [0.2 + (k % 3) * 0.05, 1.18 - Math.floor(k / 3) * 0.08, 0.2 + (k % 2) * 0.04], rot: [0.5, 0, -0.4] }))
  banana.add(solid(merge(leaves), bag, 2))
  banana.add(blobShadow(0.5, bag))
  root.add(banana)

  // ---- Bamboo at the back right ----
  const bamboo = new Group()
  bamboo.position.set(...BAMBOO)
  bamboo.userData.pick = 'bamboo'
  const stalks: BufferGeometry[] = []
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2
    const h = 2.6 + rnd(k, 3) * 1.6
    const lean = 0.06 + rnd(k, 4) * 0.1
    const bx = Math.sin(a) * 0.22
    const bz = Math.cos(a) * 0.22
    const top: V3 = [bx + Math.sin(a) * h * lean, h, bz + Math.cos(a) * h * lean]
    const rot: V3 = [Math.cos(a) * lean, 0, -Math.sin(a) * lean]
    stalks.push(P.cyl(0.045, 0.055, h, '#A6CC6A', { at: [(bx + top[0]) / 2, h / 2, (bz + top[2]) / 2], rot }, 8))
    for (let n = 1; n < 6; n++) stalks.push(P.cyl(0.06, 0.06, 0.03, '#86AE52', { at: [bx + (top[0] - bx) * (n / 6), (h * n) / 6, bz + (top[2] - bz) * (n / 6)], rot }, 8))
    for (let n = 0; n < 4; n++) {
      const la = a + n * 1.6
      stalks.push(P.sphere(0.32, n % 2 ? '#7DC873' : '#6FBF6A', { at: [top[0] + Math.sin(la) * 0.25, h - 0.3 - n * 0.28, top[2] + Math.cos(la) * 0.25], rot: [0.3, la, 0], scale: [0.3, 0.08, 1] }, 8))
    }
  }
  bamboo.add(solid(merge(stalks), bag, 2))
  bamboo.add(blobShadow(0.6, bag))
  root.add(bamboo)

  // ---- The nursery bed: a little raised bed thick with bright seedlings, bundles of them ready to plant ----
  const nursery = new Group()
  nursery.position.set(NURSERY.x, 0, NURSERY.z)
  nursery.userData.pick = 'nursery'
  const bed: BufferGeometry[] = [P.rbox(NURSERY.w, 0.16, NURSERY.d, 0.05, SAND, { at: [0, 0.06, 0] }), P.box(NURSERY.w - 0.14, 0.02, NURSERY.d - 0.14, '#8E7458', { at: [0, 0.14, 0] })]
  for (let i = 0; i < 5; i++)
    for (let j = 0; j < 9; j++) {
      const x = -0.34 + i * 0.17 + (rnd(i, j) - 0.5) * 0.04
      const z = -0.7 + j * 0.175 + (rnd(j, i) - 0.5) * 0.04
      for (let k = 0; k < 3; k++) bed.push(P.cone(0.025, 0.18 + rnd(i * 9 + j, k) * 0.06, k % 2 ? '#8EE374' : '#7EDB6A', { at: [x + (k - 1) * 0.02, 0.24, z], rot: [(k - 1) * 0.25, 0, (k - 1) * 0.2] }, 4))
    }
  nursery.add(solid(merge(bed), bag, 2))
  root.add(nursery)

  // ---- The drying rack: two crossed-pole A-frames and a pole along the top; bundles hang over it after the harvest ----
  const rack = new Group()
  rack.position.set(RACK.x, 0, RACK.z)
  rack.userData.pick = 'rack'
  // Each end: two legs crossing near the top (an X), the long pole resting in the crosses.
  // (It runs across, so both of its crossed ends show from the front.)
  const poles: BufferGeometry[] = [P.cyl(0.04, 0.04, RACK.len + 0.4, WOOD, { at: [0, RACK.y, 0], rot: [0, 0, Math.PI / 2] }, 8)]
  for (const x of [-RACK.len / 2, RACK.len / 2]) for (const s of [-1, 1]) poles.push(stick([x, 0, s * 0.42], [x, RACK.y + 0.26, -s * 0.16], 0.035, WOOD_DARK, 7))
  rack.add(solid(merge(poles), bag, 2))
  const bundles: Group[] = []
  for (let k = 0; k < 8; k++) {
    const g = new Group()
    g.position.set(-RACK.len / 2 + 0.2 + (k * (RACK.len - 0.4)) / 7, RACK.y, 0)
    g.rotation.y = Math.PI / 2
    // Folded over the pole: the stalks down one side, the golden heads down the other.
    g.add(solid(merge([P.cyl(0.06, 0.09, 0.42, STRAW, { at: [0.07, -0.2, 0], rot: [0, 0, 0.12] }, 8), P.cyl(0.06, 0.08, 0.36, STRAW_DARK, { at: [-0.07, -0.17, 0], rot: [0, 0, -0.12] }, 8), P.sphere(0.1, '#F5C84A', { at: [-0.1, -0.38, 0], scale: [1, 1.3, 1] }, 10), P.torus(0.07, 0.015, '#B5823F', { at: [0, 0.03, 0], rot: [0, Math.PI / 2, 0] })]), bag, 2))
    g.visible = false
    rack.add(g)
    bundles.push(g)
  }
  rack.add(blobShadow(0.8, bag))
  root.add(rack)

  // ---- The threshing basket, its slatted board, and the straw pile ----
  const basketRoot = new Group()
  basketRoot.position.set(...BASKET)
  basketRoot.userData.pick = 'basket'
  basketRoot.add(solid(merge([P.cyl(0.55, 0.42, 0.42, '#C99A5B', { at: [0, 0.21, 0] }, 24), P.torus(0.55, 0.035, '#A87A45', { at: [0, 0.42, 0], rot: [Math.PI / 2, 0, 0] }), ...[0.12, 0.26].map((y) => P.torus(0.45 + y * 0.24, 0.012, '#A87A45', { at: [0, y, 0], rot: [Math.PI / 2, 0, 0] })), P.cyl(0.5, 0.5, 0.02, '#7A5A3A', { at: [0, 0.32, 0] }, 24)]), bag, 2))
  const heap = new Mesh(bag.add(P.sphere(0.45, '#F5C84A', { scale: [1, 0.35, 1] }, 20)), (basketRoot.children[0].children[0] as Mesh).material)
  heap.position.y = 0.33
  heap.scale.set(1, 0.001, 1)
  basketRoot.add(heap)
  const board = new Group()
  // Standing in the basket, leaning, its high end toward where she stands to bang the bundles on it.
  board.position.set(0.02, 0.5, -0.02)
  board.rotation.set(0, 0, -0.55)
  board.add(solid(merge([...[-0.12, 0, 0.12].map((z) => P.box(0.7, 0.03, 0.09, WOOD_LIGHT, { at: [0, 0, z] })), ...[-0.25, 0.25].map((x) => P.box(0.05, 0.04, 0.36, WOOD_DARK, { at: [x, -0.03, 0] }))]), bag, 2))
  basketRoot.add(board)
  basketRoot.add(blobShadow(0.65, bag))
  root.add(basketRoot)
  const straw = new Group()
  straw.position.set(...STRAW_PILE)
  straw.userData.pick = 'straw'
  straw.add(solid(merge([P.sphere(0.5, STRAW, { at: [0, 0.12, 0], scale: [1.2, 0.6, 1] }, 16), P.sphere(0.35, STRAW_DARK, { at: [0.3, 0.2, 0.1], scale: [1, 0.7, 1] }, 12), P.sphere(0.3, STRAW, { at: [-0.2, 0.33, -0.05], scale: [1, 0.8, 1] }, 12), ...Array.from({ length: 9 }, (_, k) => P.cone(0.03, 0.22, k % 2 ? STRAW_DARK : STRAW, { at: [Math.cos(k * 0.7) * 0.45, 0.25 + (k % 3) * 0.06, Math.sin(k * 0.7) * 0.35], rot: [Math.sin(k) * 0.8, 0, Math.cos(k) * 0.8] }, 4))]), bag, 2))
  straw.add(blobShadow(0.65, bag))
  root.add(straw)

  // ---- The buffalo's mud wallow and the buffalo in it ----
  root.add(solid(merge([P.cyl(WALLOW.r + 0.12, WALLOW.r + 0.16, 0.03, '#A8876A', { at: [WALLOW.x, RISE + 0.005, WALLOW.z], scale: [1.2, 1, 0.85] }, 24), P.cyl(WALLOW.r, WALLOW.r, 0.03, '#8A6A4F', { at: [WALLOW.x, RISE + 0.012, WALLOW.z], scale: [1.2, 1, 0.85] }, 24), ...[0, 1, 2].map((k) => P.sphere(0.07, '#9C7A5C', { at: [WALLOW.x - 0.5 + k * 0.45, RISE + 0.03, WALLOW.z + 0.35 - k * 0.2], scale: [1.4, 0.3, 1] }, 8))]), bag, 1))
  const buffalo = buildBuffalo(bag)
  buffalo.root.position.set(WALLOW.x + 0.1, RISE, WALLOW.z)
  buffalo.root.rotation.y = -0.9
  root.add(buffalo.root)

  // ---- Ducks in the channel, a frog on a bank ----
  const ducks = [0, 1].map(() => buildDuck(bag))
  for (const d of ducks) root.add(d)
  const frog = buildFrog(bag)
  root.add(frog.root)

  // ---- A bamboo fence along the back of the farm, bushes and flowers along the hill's foot ----
  const fence: BufferGeometry[] = []
  for (const [x0, x1] of [[-FARM.x - 1.4, -0.45], [0.45, FARM.x + 0.4]]) {
    for (let x = x0; x <= x1 + 1e-3; x += 0.9) fence.push(P.cyl(0.04, 0.045, 0.62, '#B9A26A', { at: [x, RISE + 0.3, HILL_Z + 0.12] }, 7), P.cyl(0.05, 0.05, 0.03, '#9C8752', { at: [x, RISE + 0.62, HILL_Z + 0.12] }, 7))
    for (const y of [0.26, 0.48]) fence.push(stick([x0, RISE + y, HILL_Z + 0.16], [x1, RISE + y, HILL_Z + 0.16], 0.028, '#C9B57A', 6))
  }
  for (let i = 0; i < 16; i++) {
    const x = -9 + i * 1.2 + (rnd(i, 21) - 0.5) * 0.6
    if (Math.abs(x) < 1.0) continue
    const z = HILL_Z - 0.55 - rnd(i, 22) * 0.6
    const y = hillY(x, z)
    const r = 0.35 + rnd(i, 23) * 0.25
    fence.push(P.sphere(r, TREES[i % 4], { at: [x, y + r * 0.6, z], scale: [1.3, 0.9, 1] }, 12), P.sphere(r * 0.7, TREES[(i + 2) % 4], { at: [x + r * 0.6, y + r * 0.45, z + 0.1], scale: [1.2, 0.85, 1] }, 10))
    if (i % 3 === 0) for (let k = 0; k < 3; k++) fence.push(P.sphere(0.06, ['#FF8FB8', '#FFFFFF', '#FFE27A'][(i + k) % 3], { at: [x - r * 0.4 + k * 0.25, y + r * 1.05, z + r * 0.55] }, 6))
  }
  root.add(solid(merge(fence), bag, 2))

  // ---- The hill behind, its trees, and the far mountains all round ----
  root.add(buildHill(bag))
  root.add(panorama(bag))
  root.add(terraces(bag))
  const mist = lowClouds(bag)
  for (const m of mist) root.add(m)
  const cafeAt: V3 = [DECK.x, DECK.y + 1.4, DECK.z]
  return { root, water, paddyWater, channel, fall, stream, gates, scarecrow: { root: scare, hat, perches: [[-0.5, 1.22, 0], [0.5, 1.22, 0], [0, 1.72, 0]] }, hut: { root: hut, chime, perch: [0, 2.32, 0] }, banana, nursery, rack: { root: rack, bundles, perch: [0, RACK.y + 0.06, 0] }, basket: { root: basketRoot, heap, board }, straw, buffalo, ducks, frog, bamboo, cafeAt, mist }
}

// ---------------------------------------------------------------- the hill and the far mountains

function buildHill(bag: Bag) {
  const W = 64
  const D = 34
  const geo = new PlaneGeometry(W, D, 64, 34).rotateX(-Math.PI / 2)
  geo.translate(0, 0, HILL_Z - D / 2)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    pos.setY(i, hillY(x, z))
  }
  geo.computeVertexNormals()
  const g = bake(geo, GRASS)
  // Soft patches of lighter and darker green.
  const col = g.attributes.color as BufferAttribute
  const p = g.attributes.position
  const c = new Color()
  const greens = ['#8ACF7E', '#7FC774', '#94D486', '#79BE70'].map((h) => new Color(h))
  for (let i = 0; i < p.count; i += 3) {
    const x = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3
    const z = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3
    const n = Math.sin(x * 0.45 + z * 0.2) + Math.sin(z * 0.6 - x * 0.15)
    c.copy(greens[n > 1 ? 2 : n > 0 ? 0 : n > -1 ? 1 : 3])
    for (let j = 0; j < 3; j++) col.setXYZ(i + j, c.r, c.g, c.b)
  }
  const parts: BufferGeometry[] = [g]
  // Trees on the hill, round and bushy, avoiding the café's spot and the pipe.
  for (let i = 0; i < 34; i++) {
    const x = -14 + rnd(i, 11) * 28
    const z = HILL_Z - 1.6 - rnd(i, 12) * 12
    if ((x < -4.5 && z > -13 && z < -3) || (Math.abs(x) < 1.4 && z > HILL_Z - 4)) continue
    const y = hillY(x, z)
    const s = 0.8 + rnd(i, 13) * 0.7
    parts.push(P.cyl(0.08 * s, 0.11 * s, 0.7 * s, WOOD_DARK, { at: [x, y + 0.3 * s, z] }, 6))
    parts.push(P.sphere(0.62 * s, TREES[i % 4], { at: [x, y + 1.0 * s, z], scale: [1, 0.95, 1] }, 12))
    parts.push(P.sphere(0.45 * s, TREES[(i + 1) % 4], { at: [x + 0.32 * s, y + 0.85 * s, z + 0.18 * s] }, 10))
    parts.push(P.sphere(0.4 * s, TREES[(i + 2) % 4], { at: [x - 0.25 * s, y + 1.35 * s, z - 0.1 * s] }, 10))
  }
  return solid(merge(parts), bag, 2)
}

/** Sapan's rice steps (TERRACES), climbing the front of a round green hill: sandy risers under grass lips, each step
 *  set a little further up the hill than the one below (wide fields in front, crowded together at the back). The lower
 *  steps are flooded and freshly planted (blue water, rings of green rows, white glints), the upper ones grown thick and
 *  green, and a few trees on the crown. */
function terraces(bag: Bag) {
  const allSides: BufferGeometry[] = []
  const allFlat: BufferGeometry[] = []
  for (const [n, t] of TERRACES.entries()) {
    const sides: BufferGeometry[] = []
    const flat: BufferGeometry[] = []
    const ring = (x: number, y: number, z: number, a: number, b: number, c: string) => flat.push(bake(new RingGeometry(a, b, 64, 1), c, { at: [x, y, z], rot: [-Math.PI / 2, 0, 0] }))
    const crown = 1.5
    const dr = (t.r - crown) / t.steps
    const [bx, bz] = t.back
    // The hill the steps climb, rising behind them.
    sides.push(P.sphere(t.r * 1.15, '#7FC774', { at: [t.x + bx * t.r * 0.95, -0.3, t.z + bz * t.r * 0.95], scale: [1, 0.45, 1] }, 40))
    for (let k = 0; k < t.steps; k++) {
      const r = t.r - k * dr
      const y = 0.32 + k * 0.42
      const cx = t.x + bx * dr * 0.7 * k
      const cz = t.z + bz * dr * 0.7 * k
      sides.push(P.cyl(r, r + 0.06, y + 0.3 - 0.07, SAND, { at: [cx, (y - 0.07 - 0.3) / 2, cz] }, 64))
      sides.push(P.cyl(r + 0.04, r + 0.04, 0.08, GRASS_LIP, { at: [cx, y - 0.04, cz] }, 64))
      if (k === t.steps - 1) break
      // The step's field, between this lip and the next riser.
      const a = r - dr + 0.2
      const b = r - 0.16
      const wet = k < t.steps - 3
      ring(cx, y + 0.004, cz, a, b, wet ? '#BFE4F7' : '#6DBB63')
      for (let rr = a + 0.13; rr < b - 0.08; rr += 0.21) ring(cx, y + 0.008, cz, rr, rr + (wet ? 0.045 : 0.06), wet ? '#7FCB6A' : '#86CF73')
      if (wet)
        for (let g = 0; g < 9; g++) {
          const ang = rnd(n * 40 + k * 9 + g, 51) * Math.PI * 2
          const rr = a + rnd(n * 40 + k * 9 + g, 52) * (b - a)
          flat.push(P.box(0.3, 0.004, 0.035, '#FFFFFF', { at: [cx + Math.cos(ang) * rr, y + 0.012, cz + Math.sin(ang) * rr], rot: [0, -ang + Math.PI / 2, 0] }))
        }
    }
    // Trees on the crown.
    const top = 0.32 + (t.steps - 1) * 0.42
    const shift = dr * 0.7 * (t.steps - 1)
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + n
      const x = t.x + bx * shift + Math.cos(a) * crown * 0.45
      const z = t.z + bz * shift + Math.sin(a) * crown * 0.45
      const s = 0.8 + rnd(i, 60 + n) * 0.5
      sides.push(P.cyl(0.08 * s, 0.11 * s, 0.7 * s, WOOD_DARK, { at: [x, top + 0.3 * s, z] }, 6))
      sides.push(P.sphere(0.6 * s, TREES[(i + n) % 4], { at: [x, top + 1.0 * s, z] }, 12))
      sides.push(P.sphere(0.42 * s, TREES[(i + n + 1) % 4], { at: [x + 0.3 * s, top + 0.85 * s, z + 0.15 * s] }, 10))
    }
    // Built round, then pushed out of round so the steps follow the hill's lumps like real contour terraces.
    for (const [list, into] of [[sides, allSides], [flat, allFlat]] as const) {
      const g = merge(list)
      const pos = g.attributes.position
      for (let i = 0; i < pos.count; i++) {
        const dx = pos.getX(i) - t.x
        const dz = pos.getZ(i) - t.z
        const a = Math.atan2(dz, dx)
        const f = 1 + 0.1 * Math.sin(3 * a + n * 2) + 0.05 * Math.sin(5 * a + 1 + n)
        pos.setXYZ(i, t.x + dx * f, pos.getY(i), t.z + dz * f * 0.7)
      }
      g.computeVertexNormals()
      into.push(g)
    }
  }
  const g = new Group()
  g.add(solid(merge(allSides), bag, 2), solid(merge(allFlat), bag, 0))
  return g
}

/** Low clouds lying along the valley, round the rice steps' crowns where the deck looks out (soft: no outline). */
function lowClouds(bag: Bag) {
  const spots: V3[] = [[16, 2.6, 9], [25, 3.6, 17], [10, 3.0, 15], [30, 2.8, 8], [-15, 2.6, 12]]
  return spots.map(([x, y, z], i) => {
    const w = 1.6 + rnd(i, 70) * 1.2
    const g = solid(merge([P.sphere(0.7, '#FFFFFF', { scale: [w, 0.42, 1] }, 14), P.sphere(0.55, '#FFFFFF', { at: [w * 0.45, 0.16, 0.1], scale: [1.3, 0.6, 1] }, 12), P.sphere(0.5, '#F4F2FA', { at: [-w * 0.5, 0.06, -0.05], scale: [1.3, 0.55, 1] }, 12)]), bag, 0)
    g.position.set(x, y, z)
    g.userData.home = x
    return g
  })
}

/** Far mountains with cloud on their tops all the way round, painted on the inside of a big open cylinder. */
function panorama(bag: Bag) {
  const c = document.createElement('canvas')
  c.width = 2048
  c.height = 512
  const g = c.getContext('2d')!
  const sky = g.createLinearGradient(0, 0, 0, 512)
  sky.addColorStop(0, '#B6DEF5')
  sky.addColorStop(0.75, '#E4F2F9')
  sky.addColorStop(1, '#EEF6F4')
  g.fillStyle = sky
  g.fillRect(0, 0, 2048, 512)
  // (Whole periods across the width, so the picture meets itself round the back.)
  const ridge = (y: number, amp: number, color: string, k: number[], ph: number) => {
    g.fillStyle = color
    g.beginPath()
    g.moveTo(0, 512)
    for (let x = 0; x <= 2048; x += 8) {
      const u = (x / 2048) * Math.PI * 2
      g.lineTo(x, y - amp * (0.5 + 0.3 * Math.sin(u * k[0] + ph) + 0.2 * Math.sin(u * k[1] + ph * 2)))
    }
    g.lineTo(2048, 512)
    g.fill()
  }
  ridge(330, 150, '#B9D3D4', [5, 13], 1)
  g.fillStyle = 'rgba(255,255,255,.85)'
  for (let i = 0; i < 14; i++) {
    g.beginPath()
    g.ellipse(80 + i * 146, 220 + (i % 3) * 22, 90 + (i % 4) * 20, 22 + (i % 2) * 8, 0, 0, Math.PI * 2)
    g.fill()
  }
  ridge(400, 120, '#A2CBAE', [7, 17], 3)
  ridge(470, 80, '#8CC29C', [9, 22], 5)
  const tex = bag.add(new CanvasTexture(c))
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = RepeatWrapping
  const m = new Mesh(bag.add(new CylinderGeometry(60, 60, 30, 64, 1, true)), bag.add(new MeshBasicMaterial({ map: tex, side: BackSide, depthWrite: false, fog: false })))
  m.position.set(0, 9, -4)
  m.renderOrder = -1
  return m
}

/** Pale stripes for falling water (they scroll down: the fall, the pipe's stream). */
let stripes: CanvasTexture | null = null
function stripesTexture(bag: Bag) {
  if (stripes) return stripes
  const c = document.createElement('canvas')
  c.width = 32
  c.height = 64
  const g = c.getContext('2d')!
  g.fillStyle = '#CDEBFA'
  g.fillRect(0, 0, 32, 64)
  g.fillStyle = '#FFFFFF'
  for (const [x, y, h] of [[4, 4, 18], [14, 30, 22], [24, 10, 16], [8, 44, 14], [26, 48, 12]]) g.fillRect(x, y, 3, h)
  stripes = bag.add(new CanvasTexture(c))
  stripes.colorSpace = SRGBColorSpace
  stripes.wrapS = stripes.wrapT = RepeatWrapping
  // (Shared by both falls; the Bag disposes it with the world, and the next world makes a new one.)
  const dispose = stripes.dispose.bind(stripes)
  stripes.dispose = () => {
    dispose()
    stripes = null
  }
  return stripes
}

// ---------------------------------------------------------------- critters

function buildBuffalo(bag: Bag) {
  const root = new Group()
  root.userData.pick = 'buffalo'
  const C = '#6F6884'
  const body = new Group()
  body.add(solid(merge([P.rbox(0.8, 0.7, 1.45, 0.28, C, { at: [0, 0.8, 0] }), ...[[-0.26, 0.5], [0.26, -0.5], [0.26, 0.5], [-0.26, -0.5]].map(([x, z]) => P.rbox(0.17, 0.55, 0.18, 0.06, C, { at: [x, 0.27, z] }))]), bag, 2))
  root.add(body)
  const head = new Group()
  head.position.set(0, 1.0, 0.72)
  head.add(
    solid(
      merge([
        P.rbox(0.44, 0.42, 0.56, 0.18, C, { at: [0, -0.07, 0.24] }),
        P.rbox(0.36, 0.22, 0.2, 0.08, '#9C93AE', { at: [0, -0.18, 0.52] }),
        ...[-1, 1].map((k) => P.torus(0.28, 0.05, '#EDE3D2', { at: [k * 0.3, 0.12, 0.08], rot: [Math.PI / 2, 0, k > 0 ? 0 : Math.PI] }, Math.PI * 0.75)),
        ...[-1, 1].map((k) => P.sphere(0.04, PAL.ink, { at: [k * 0.17, 0.04, 0.44] }, 8)),
        ...[-1, 1].map((k) => P.sphere(0.055, '#FF9DB8', { at: [k * 0.19, -0.1, 0.42], scale: [1, 0.6, 0.4] }, 8)),
      ]),
      bag,
      2,
    ),
  )
  body.add(head)
  const tail = new Group()
  tail.position.set(0, 0.95, -0.72)
  tail.add(solid(P.cyl(0.03, 0.02, 0.45, C, { at: [0, -0.2, -0.04], rot: [0.25, 0, 0] }, 6), bag, 1))
  body.add(tail)
  root.add(blobShadow(0.95, bag))
  // (The body group rolls in the mud; head and tail ride on it.)
  root.userData.body = body
  return { root, head, tail }
}

function buildFrog(bag: Bag) {
  const root = new Group()
  root.userData.pick = 'frog'
  const G = '#8FD67A'
  const s = 1.6
  root.add(
    solid(
      merge([
        P.sphere(0.1 * s, G, { at: [0, 0.07 * s, 0], scale: [1, 0.7, 1.15] }),
        ...[-1, 1].map((k) => P.sphere(0.04 * s, G, { at: [k * 0.055 * s, 0.13 * s, 0.05 * s] }, 10)),
        ...[-1, 1].map((k) => P.sphere(0.022 * s, '#FFFFFF', { at: [k * 0.06 * s, 0.15 * s, 0.075 * s] }, 8)),
        ...[-1, 1].map((k) => P.sphere(0.012 * s, PAL.ink, { at: [k * 0.062 * s, 0.152 * s, 0.093 * s] }, 6)),
        ...[-1, 1].map((k) => P.sphere(0.045 * s, '#7BC266', { at: [k * 0.09 * s, 0.03 * s, -0.05 * s], scale: [0.7, 0.5, 1.4] }, 8)),
      ]),
      bag,
      2,
    ),
  )
  const throat = new Mesh(bag.add(P.sphere(0.05 * s, '#FFF4C8', {}, 10)), (root.children[0].children[0] as Mesh).material)
  throat.position.set(0, 0.045 * s, 0.085 * s)
  throat.scale.set(1, 0.6, 0.6)
  root.add(throat)
  return { root, throat }
}

function buildDuck(bag: Bag) {
  const root = new Group()
  root.userData.pick = 'duck'
  const s = 1.25
  root.add(
    solid(
      merge([
        P.sphere(0.13 * s, '#FFFFFF', { at: [0, 0.08 * s, 0], scale: [0.85, 0.7, 1.25] }),
        P.cone(0.05 * s, 0.12 * s, '#FFFFFF', { at: [0, 0.13 * s, -0.16 * s], rot: [-1.0, 0, 0] }, 8),
        P.sphere(0.075 * s, '#FFFFFF', { at: [0, 0.22 * s, 0.12 * s] }),
        P.cone(0.03 * s, 0.08 * s, '#FFB21F', { at: [0, 0.21 * s, 0.22 * s], rot: [Math.PI / 2, 0, 0] }, 8),
        ...[-1, 1].map((k) => P.sphere(0.013 * s, PAL.ink, { at: [k * 0.045 * s, 0.24 * s, 0.17 * s] }, 6)),
      ]),
      bag,
      2,
    ),
  )
  return root
}

/** Kaylee's things on the farm: the seedling bundle she plants from, the sickle, the armful of cut rice, her ngob. */
export function buildKayleeKit(bag: Bag) {
  const seedlings = solid(merge([...Array.from({ length: 7 }, (_, k) => P.cone(0.02, 0.2 + (k % 3) * 0.04, k % 2 ? '#8EE374' : '#7EDB6A', { at: [Math.sin(k) * 0.03, 0.1, Math.cos(k) * 0.03], rot: [Math.cos(k * 2) * 0.35, 0, Math.sin(k * 2) * 0.35] }, 4)), P.torus(0.035, 0.012, '#B5823F', { at: [0, 0.0, 0], rot: [Math.PI / 2, 0, 0] }), P.sphere(0.04, '#8E7458', { at: [0, -0.05, 0], scale: [1, 0.7, 1] }, 8)]), bag, 1.5)
  const sickle = solid(merge([P.cyl(0.018, 0.02, 0.16, PAL.hotpink, { at: [0, 0, 0] }, 8), P.torus(0.09, 0.014, '#C9CCD8', { at: [0.07, 0.1, 0], rot: [0, 0, 0.3] }, Math.PI * 1.1)]), bag, 1.5)
  const armful = solid(merge(sheafParts([0, 0, 0], 0.8)), bag, 1.5)
  const ngob = solid(merge(ngobParts(0.3)), bag, 2)
  return { seedlings, sickle, armful, ngob }
}

/** A cut bundle on a bank (tied, popped out of her arms). */
export function sheaf(bag: Bag) {
  return solid(merge(sheafParts([0, 0.08, 0])), bag, 2)
}


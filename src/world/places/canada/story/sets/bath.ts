// The rainforest river in British Columbia, where Misty the spirit bear lives: the set of Misty's Bubble Bath (the
// game, activities/bath/) and of its two films (story/films/bath.ts), so the game and its films are one place. The river
// comes toward the camera down a rocky step in the forest floor: the falls, a pool at its foot where Misty has her bath,
// mossy banks with ferns and berry bushes, giant cedars going up out of the frame (the tallest one, `TALLEST`, for the
// pinecone to sail over; a near one on the right bank, `SCRATCH`, for her back), mist round the falls, sunbeams through
// the trees and a light sparkly drizzle. The moving water (the pool's shader, the falls' curtain, the foam and spray) is
// made in bathWater.ts.
// In front of her the pool is still (`MIRROR`): at the end of her bath it glows like a mirror.
//
// The usual camera stands on +z looking toward -z, so the falls face it: the lower pool runs from the falls' foot
// (z = FALLS_Z) toward the camera, the upper river goes back into the forest at y = TOP. Misty has her bath at `BATH`
// (her feet under the water). Maple's bank is on the left (x < -1.6).
//
// `buildRiver` makes it (the film stage and the game both call it), `updateRiver` keeps it moving.
import { AdditiveBlending, BufferGeometry, CircleGeometry, CylinderGeometry, Float32BufferAttribute, Group, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, RingGeometry, Sprite, SpriteMaterial, Vector3, type Camera, type Object3D } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { bake, merge, P, solid, type V3 } from '../../../../engine3d/geo'
import { radialAlpha, softTexture } from '../../../../engine3d/softTexture'
import { bed, clip } from '../../../../kit/clips'
import { noise, sfx, tone } from '../../../../kit/sfx'
import { url } from '../../sfx'
import type { FilmSet, SetLook } from '../stage'
import { edgePoints, lowSdf, makeBeams, makeFalls, makePuffs, makeWater, outward, rng, upSdf, type Puff } from './bathWater'

/** The falls' face (z) and how high the upper river is. */
export const FALLS_Z = -3
export const TOP = 1.5
/** How deep Misty stands in the pool (her feet are this far under the water). */
export const WADE = -0.38
/** The tallest cedar: its foot and its height (the pinecone goes over its top). */
export const TALLEST = { x: 2.6, z: -10, h: 19 }
/** Where Misty has her bath (in the pool, the water round her ankles), facing the camera. */
export const BATH = { x: 0.15, y: -0.12, z: -1.7 }
/** The still water in front of her that glows like a mirror at the end. */
export const MIRROR = { x: 0.92, z: -1.3, r: 0.4 }
/** The big cedar on the right bank she scratches her back on (its trunk's radius at the foot). */
export const SCRATCH = { x: 1.78, z: -2.25, r: 0.42, h: 17 }

/** The water's top (Misty's feet are under it). */
const WATER_Y = 0.04
/** Half the gap in the step where the falls pour (its face is set back there). */
const STEP_GAP = 1.7

// The river's colors.
const MOSS = '#86C268'
const MOSS_DARK = '#68A955'
const ROCK = '#ABA4B8'
const ROCK_DARK = '#918AA0'
const STONES = ['#B9B2C6', '#A79FB5', '#CCC5D6', '#C2B6A8', '#9E97AE']
const LEAF = '#7ACB5C'
const LEAF_DARK = '#62B44E'
const FLOWERS = ['#FF9EC4', '#FFFFFF', '#FFB8D4', '#FF86B5', '#FFF4FA']
/** Lily pads: x, z, radius, which way the notch faces. */
const LILIES: [number, number, number, number][] = [
  [-1.88, -1.08, 0.13, 0.4],
  [1.52, -0.82, 0.15, 2.2],
  [1.32, -0.55, 0.1, 4],
  [-2.02, -1.38, 0.09, 1.3],
]
const BARK = '#9A5A44'
const BARK_DARK = '#7A4434'
const CEDAR = ['#47895A', '#55A063', '#66B470']
const FERN = '#6AB45A'
const BERRY = '#7B5BC4'
const SALMONBERRY = '#FF8A5C'
/** Sockeye on their way home: a bright red body, an olive-green head (the game's SOCKEYE). */
const SOCKEYE = { body: '#E8463F', head: '#6FA35A', fin: '#B8323C', belly: '#F2836E' }

/** A toon sockeye salmon about `len` meters long, head toward +x; its tail wags on `tail`. Orient it with
 *  `rotation.y` (which way it swims: 90 degrees is toward -z, up the river) and `rotation.z` (nose up). */
export function makeSalmon(bag: Bag, len = 0.5) {
  const k = len / 0.5
  const g = new Group()
  g.rotation.order = 'YZX'
  const body = solid(
    merge([
      P.sphere(0.25 * k, SOCKEYE.body, { scale: [1, 0.42, 0.3] }, 14),
      P.sphere(0.22 * k, SOCKEYE.belly, { at: [0, -0.04 * k, 0], scale: [1, 0.28, 0.27] }, 12),
      P.sphere(0.11 * k, SOCKEYE.head, { at: [0.19 * k, 0.005 * k, 0], scale: [1, 0.85, 0.68] }, 12),
      P.prism([[-0.06 * k, 0.08 * k], [0.07 * k, 0.09 * k], [-0.09 * k, 0.17 * k]], 0.015 * k, SOCKEYE.fin),
      ...[-1, 1].map((s) => P.sphere(0.024 * k, '#FFFFFF', { at: [0.245 * k, 0.03 * k, s * 0.055 * k] }, 8)),
      ...[-1, 1].map((s) => P.sphere(0.013 * k, '#2E2233', { at: [0.258 * k, 0.032 * k, s * 0.066 * k] }, 6)),
    ]),
    bag,
    1.5,
  )
  const tail = new Group()
  tail.position.x = -0.22 * k
  tail.add(solid(P.prism([[0.02 * k, 0], [-0.15 * k, 0.11 * k], [-0.1 * k, 0], [-0.15 * k, -0.11 * k]], 0.02 * k, SOCKEYE.fin), bag, 1.5))
  g.add(body, tail)
  return { root: g, tail }
}

/** A salmon leaping: from a spot to another along an arc, nose along the way it flies, tail wagging. */
interface Leap {
  fish: ReturnType<typeof makeSalmon>
  from: Vector3
  to: Vector3
  arc: number
  t0: number
  dur: number
  on: boolean
}

export interface RiverSet {
  /** The still water in front of her bath: `goal` 1 makes it glow like a mirror. */
  mirror: { root: Group; glow: Mesh; shine: Mesh; k: number; goal: number }
  /** Salmon to leap with `leap()` (hidden until then). */
  salmon: ReturnType<typeof makeSalmon>[]
  /** Throws salmon `i` from `from` to `to` (a parabola `arc` meters over the higher end) in `dur` seconds. */
  leap(i: number, from: V3, to: V3, dur: number, arc?: number): void
  /** The enormous splash (a white column of water that grows and falls back) at x, z on the pool. */
  bigSplash(x: number, z: number): void
  /** Maple's umbrella: a big leaf on a stem (add it to her root). */
  leaf: Group
  /** A paw full of berries (add it to Misty's right arm), and the purple round her mouth (her head). */
  berries: Group
  juice: Group
  /** The pinecone she hits, and the twinkle where it vanishes into the sky. */
  cone: Group
  twinkle: Group
  /** Seconds since the set was built (the leaps' clock). */
  now: number
  /** Runs after the actors have posed each frame: a film can bend an arm the rig has no direction for (a paw up to
   *  the mouth). */
  pose: (() => void) | null
  leaps: Leap[]
  streaks: Object3D[]
  foam: Group
  mist: Sprite[]
  rain: LineSegments
  splash: { g: Group; t: number }
  /** Where the rings round her legs spread from on the pool, and how strong they are (0: none, when she's out). */
  wade: { x: number; z: number; k: number }
  /** The shaders' clocks (the water, the falls, the spray, the sunbeams). */
  fx: { update(t: number): void; wade(x: number, z: number, k: number): void }
}

/** A cedar `h` meters tall at (x, y, z): a red-brown trunk with a flared foot and moss on it, drooping green tiers. */
function cedar(x: number, y: number, z: number, h: number, r: number) {
  const parts = [P.cyl(r * 0.5, r, h, BARK, { at: [x, y + h / 2, z] }, 10), P.cone(r * 1.7, r * 2.2, BARK_DARK, { at: [x, y + r * 1.1, z] }, 10)]
  for (let i = 0; i < 4; i++) {
    const a = i * 1.9 + x
    const yy = y + 0.6 + i * 0.9
    parts.push(P.sphere(r * 0.45, i % 2 ? MOSS : MOSS_DARK, { at: [x + Math.cos(a) * r * 0.85, yy, z + Math.sin(a) * r * 0.85], scale: [1, 1.5, 1] }, 8))
  }
  const tiers = 7
  for (let i = 0; i < tiers; i++) {
    const k = i / (tiers - 1)
    const rr = (2.5 - 1.9 * k) * (r / 0.9)
    parts.push(P.cone(rr, h * 0.16, CEDAR[i % 3], { at: [x, y + h * (0.42 + 0.56 * k), z] }, 9))
  }
  return parts
}

/** A fern: eight fronds round a middle, arching up and out. */
function fern(x: number, z: number, s = 1, y = 0) {
  const parts = []
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + x * 3
    parts.push(P.sphere(0.5 * s, i % 2 ? FERN : MOSS_DARK, { at: [x + Math.cos(a) * 0.3 * s, y + 0.16 * s, z - Math.sin(a) * 0.3 * s], rot: [0, a, 0.42], order: 'YZX', scale: [0.75, 0.05, 0.17] }, 8))
  }
  return parts
}

/** A berry bush: round dark leaves, purple huckleberries and orange salmonberries all over. */
function bush(x: number, z: number, s = 1, y = 0) {
  const parts = [
    P.sphere(0.5 * s, MOSS_DARK, { at: [x, y + 0.42 * s, z] }, 12),
    P.sphere(0.38 * s, '#4E8F4A', { at: [x + 0.42 * s, y + 0.32 * s, z + 0.1 * s] }, 10),
    P.sphere(0.36 * s, '#4E8F4A', { at: [x - 0.44 * s, y + 0.3 * s, z - 0.05 * s] }, 10),
  ]
  for (let i = 0; i < 16; i++) {
    const a = i * 2.4
    const up = 0.25 + (i % 5) * 0.14
    const rr = 0.5 * s * Math.cos(up)
    parts.push(P.sphere(0.05 * s, i % 3 ? BERRY : SALMONBERRY, { at: [x + Math.cos(a) * (rr + 0.06 * s) * (i % 2 ? 1.3 : 1), y + 0.42 * s + Math.sin(up) * 0.5 * s, z + Math.sin(a) * rr + 0.05 * s] }, 6))
  }
  return parts
}

/** A skunk cabbage: big bright leaves standing up round a yellow hood. */
function skunk(x: number, z: number, s = 1, y = 0) {
  const parts = []
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + x
    const tilt = 0.35 + (i % 2) * 0.15
    const hh = 0.34 * s * (1 - (i % 2) * 0.15)
    const out = 0.08 * s + Math.sin(tilt) * hh
    parts.push(P.sphere(hh, i % 2 ? LEAF : LEAF_DARK, { at: [x + Math.cos(a) * out, y + Math.cos(tilt) * hh, z + Math.sin(a) * out], rot: [tilt, Math.PI / 2 - a, 0], order: 'YXZ', scale: [0.42, 1, 0.1] }, 10))
  }
  parts.push(P.sphere(0.09 * s, '#FFD95A', { at: [x, y + 0.17 * s, z + 0.04 * s], scale: [0.75, 1.6, 0.7] }, 10))
  return parts
}

/** A clump of little wildflowers (pink and white), each on a stem. */
function flowers(x: number, z: number, n: number, y = 0, seed = 1) {
  const r = rng(seed)
  const parts = []
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2
    const d = 0.05 + r() * 0.16
    const fx = x + Math.cos(a) * d
    const fz = z + Math.sin(a) * d
    const h = 0.12 + r() * 0.12
    const c = FLOWERS[i % FLOWERS.length]
    parts.push(P.cyl(0.006, 0.008, h, MOSS_DARK, { at: [fx, y + h / 2, fz] }, 5))
    for (let k = 0; k < 5; k++) {
      const pa = (k / 5) * Math.PI * 2
      parts.push(P.sphere(0.026, c, { at: [fx + Math.cos(pa) * 0.028, y + h + 0.004, fz + Math.sin(pa) * 0.028], scale: [1, 0.4, 1] }, 6))
    }
    parts.push(P.sphere(0.017, '#FFD95A', { at: [fx, y + h + 0.012, fz] }, 6))
  }
  return parts
}

/** A sunny rainforest morning: a pastel sky, warm light, a soft haze far off (the films' stage and the game's sky). */
export const RIVER_LOOK: SetLook = { sky: ['#94CEF2', '#BEE3F5', '#E6F4EE'], fog: ['#DEEFE6', 20, 85], light: [1.14, 1.12], tint: '#FFFBF6', clouds: false }

/** Builds the river in `root`: everything the films and the game see. */
export function buildRiver(bag: Bag, root: Group): RiverSet {
  {
    // ---- The ground: the lower forest floor, the rocky step (the falls' ledge) and the upper floor behind it.
    const ground = [
      P.cyl(70, 70, 0.4, MOSS, { at: [0, -0.2, 20] }, 40),
      ...[[-5, 2, 2.2], [5.5, 1, 2.6], [-8, -1, 3], [7, 6, 2], [-6, 7, 2.4]].map(([x, z, r]) => P.cyl(r, r * 1.1, 0.06, MOSS_DARK, { at: [x, 0.01, z] }, 14)),
      // The step: rock, mossy on top, the whole way across the forest. Behind the falls its face is set back, so the
      // water bends over a rounded lip in front of it.
      ...[-1, 1].map((sd) => P.box(44, TOP - 0.15, 60, ROCK, { at: [sd * (STEP_GAP + 22), (TOP - 0.15) / 2, FALLS_Z - 30.15] })),
      ...[-1, 1].map((sd) => P.box(44, 0.2, 60, MOSS, { at: [sd * (STEP_GAP + 22), TOP - 0.1, FALLS_Z - 30.25] })),
      P.box(STEP_GAP * 2 + 0.02, TOP - 0.15, 60, ROCK_DARK, { at: [0, (TOP - 0.15) / 2, FALLS_Z - 30.5] }),
      P.box(STEP_GAP * 2 + 0.02, 0.2, 60, MOSS, { at: [0, TOP - 0.1, FALLS_Z - 30.5] }),
    ]
    // Boulders along the face, lumpy and mossy-capped; rounder stones along the shore.
    const rocks: BufferGeometry[] = []
    const boulder = (x: number, z: number, w: number, h: number, i: number) => {
      rocks.push(P.sphere(w * 0.5, i % 2 ? ROCK : ROCK_DARK, { at: [x, h * 0.45, z], scale: [1, h / w, 0.72] }, 14))
      rocks.push(P.sphere(w * 0.32, i % 2 ? ROCK_DARK : ROCK, { at: [x + (i % 2 ? 0.34 : -0.34) * w, h * 0.22, z + 0.18 * w], scale: [1, 0.85, 0.85] }, 12))
      rocks.push(P.sphere(w * 0.4, i % 3 ? MOSS : MOSS_DARK, { at: [x, h * 0.88, z], scale: [1.08, 0.3, 0.78] }, 12))
    }
    const face: [number, number, number][] = [[-2.38, 1.45, 1.75], [-3.75, 1.65, 1.45], [-5.45, 1.45, 1.6], [2.4, 1.4, 1.8], [3.8, 1.7, 1.5], [5.65, 1.35, 1.55], [-7.4, 1.6, 1.45], [7.5, 1.5, 1.55]]
    face.forEach(([x, w, h], i) => boulder(x, FALLS_Z + 0.2, w, h, i))
    // The small ones round the pool (the banana slug sleeps on the one at the back left).
    const stone = (x: number, y: number, z: number, r: number, c: string, yaw: number, moss: boolean) => {
      rocks.push(P.sphere(r, c, { at: [x, y, z], rot: [0, yaw, 0], scale: [1, 0.6, 0.82] }, 10))
      if (moss) rocks.push(P.sphere(r * 0.78, MOSS, { at: [x, y + r * 0.42, z], rot: [0, yaw, 0], scale: [1, 0.32, 0.8] }, 9))
    }
    stone(-1.9, 0.12, -2.2, 0.36, ROCK_DARK, 0.3, true)
    stone(1.95, 0.08, -1.35, 0.3, ROCK, 0.8, true)
    // Stones along the pool's shore (never in the falls' foot, the cedar's roots or on the bigger rocks).
    const r = rng(7)
    const keep = (x: number, z: number) =>
      !(Math.abs(x) < 1.8 && z < FALLS_Z + 0.55) && Math.hypot(x - SCRATCH.x, z - SCRATCH.z) > 0.8 && Math.hypot(x + 1.9, z + 2.2) > 0.5 && Math.hypot(x - 1.95, z + 1.35) > 0.4
    for (const [x, z] of edgePoints(lowSdf, -4, 4, FALLS_Z, 4, 0.34, keep)) {
      // (Smaller toward the camera: big stones there would crowd the bottom of the picture.)
      const rr = (0.07 + r() * 0.08) * (z > -0.8 ? 0.6 : 1)
      const [ox, oz] = outward(lowSdf, x, z)
      stone(x + ox * rr * 0.35, 0.025, z + oz * rr * 0.35, rr, STONES[Math.floor(r() * STONES.length)], r() * 3, rr > 0.12 && r() > 0.6)
    }
    for (const [x, z] of edgePoints(upSdf, -7, 7, -14, FALLS_Z - 0.8, 0.42)) {
      const rr = 0.1 + r() * 0.12
      const [ox, oz] = outward(upSdf, x, z)
      stone(x + ox * rr * 0.35, TOP + 0.02, z + oz * rr * 0.35, rr, STONES[Math.floor(r() * STONES.length)], r() * 3, r() > 0.6)
    }
    // Moss hanging over the lip.
    for (let i = 0; i < 12; i++) {
      const x = -8 + i * 1.45 + ((i * 37) % 5) * 0.08
      if (Math.abs(x) < STEP_GAP + 0.6) continue
      rocks.push(P.sphere(0.4, i % 2 ? MOSS : MOSS_DARK, { at: [x, TOP - 0.15, FALLS_Z + 0.05], scale: [1.2, 0.7, 0.5] }, 8))
    }
    root.add(solid(merge(ground), bag, 0), solid(merge(rocks), bag, 1.5))
    // Pebbles on the shore (too small for an ink line).
    const pebbles: BufferGeometry[] = []
    for (const [x, z] of edgePoints(lowSdf, -4, 4, FALLS_Z + 0.4, 4, 0.16, keep)) {
      const [ox, oz] = outward(lowSdf, x, z)
      const off = 0.06 + r() * 0.1
      pebbles.push(P.sphere(0.025 + r() * 0.025, STONES[Math.floor(r() * STONES.length)], { at: [x + ox * off, 0.045, z + oz * off], scale: [1, 0.55, 0.8] }, 7))
    }
    root.add(solid(merge(pebbles), bag, 0))

    // ---- The water: the pool and the river (one shader), the falls over the lip, the foam at its foot.
    const water = makeWater(bag, WATER_Y, TOP + 0.03, MIRROR)
    root.add(...water.meshes)
    const falls = makeFalls(bag, [{ x: 0, half: 1.52, zStart: FALLS_Z - 0.7, y: TOP + 0.045, zLip: FALLS_Z - 0.46, r: 0.2, yEnd: 0, bow: 0.32 }])
    root.add(falls.mesh)
    // The still water in front of her bath (the shader draws it calm): it glows like a mirror when it's time.
    const mirror = new Group()
    const glowMat = bag.add(new MeshBasicMaterial({ color: '#FFF3B8', transparent: true, opacity: 0, depthWrite: false, fog: false }))
    const glow = new Mesh(bag.add(new RingGeometry(MIRROR.r * 0.88, MIRROR.r * 1.05, 48)), glowMat)
    glow.rotation.x = -Math.PI / 2
    glow.position.y = 0.02
    const shine = new Mesh(bag.add(new CircleGeometry(MIRROR.r * 0.86, 48)), bag.add(new MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0, depthWrite: false, fog: false })))
    shine.rotation.x = -Math.PI / 2
    shine.position.y = 0.018
    mirror.add(shine, glow)
    mirror.position.set(MIRROR.x, 0.028, MIRROR.z)
    mirror.scale.z = 0.7
    root.add(mirror)

    // Foam churning at the falls' foot, sparkles in its spray, dust motes floating in the sunbeams.
    const pr = rng(11)
    const puffs: Puff[] = []
    for (let i = 0; i < 30; i++) {
      const sz = 0.27 + pr() * 0.22
      puffs.push([-1.38 + (i / 29) * 2.76 + (pr() - 0.5) * 0.08, 0.04 + sz * 0.15, FALLS_Z + 0.14 + pr() * 0.1, pr(), sz, 0, 0.35 + pr() * 0.25])
    }
    for (let i = 0; i < 12; i++) puffs.push([-1.3 + pr() * 2.6, 0.08, FALLS_Z + 0.45 + pr() * 0.2, pr(), 0.15 + pr() * 0.1, 0, 0.4])
    for (let i = 0; i < 22; i++) puffs.push([-1.5 + pr() * 3, 0.15 + pr() * 0.3, FALLS_Z + 0.3 + pr() * 0.3, pr(), 0.09 + pr() * 0.07, 1, 1 + pr() * 0.8])
    for (let i = 0; i < 34; i++) puffs.push([-4 + pr() * 8, 0.7 + pr() * 3.2, -6 + pr() * 3.6, pr(), 0.035 + pr() * 0.035, 2, 0])
    const spray = makePuffs(bag, puffs)
    const foam = new Group()
    foam.add(spray.mesh)
    root.add(foam)
    // Soft sunbeams slanting down through the cedars.
    const beams = makeBeams(
      bag,
      [
        [-1.5, TOP, -5.8, 0.9, 2.4, 15],
        [0.9, TOP, -7.4, 1.3, 3, 16],
        [3.1, TOP, -5.2, 0.7, 2, 14],
        [-3.7, 0, -2.4, 0.8, 2.2, 14],
      ],
      [-0.42, 1, -0.3],
    )
    root.add(beams.mesh)
    const streaks: Object3D[] = []

    // ---- The forest: giant cedars, ferns, berry bushes, skunk cabbages, wildflowers, lily pads, a mossy log.
    const trees = [
      ...cedar(-6.2, 0, -0.5, 26, 0.95),
      ...cedar(6.4, 0, 0.6, 24, 1.05),
      ...cedar(-9.5, 0, 5, 22, 0.9),
      ...cedar(10, 0, 4.5, 24, 1),
      ...cedar(-4, TOP, -7.5, 17, 0.8),
      ...cedar(TALLEST.x, TOP, TALLEST.z, TALLEST.h, 1),
      ...cedar(-9, TOP, -12, 22, 0.95),
      ...cedar(8.5, TOP, -8, 20, 0.9),
      ...cedar(-1, TOP, -17, 18, 0.8),
      ...cedar(12, TOP, -16, 20, 0.9),
      ...cedar(SCRATCH.x, 0, SCRATCH.z, SCRATCH.h, SCRATCH.r),
    ]
    root.add(solid(merge(trees), bag, 1.8))
    const plants = [
      ...fern(-2.4, 2.2, 1.1),
      ...fern(-4.8, 0.8),
      ...fern(-3.2, 4.6, 1.2),
      ...fern(2.6, 0.5, 1.1),
      ...fern(3.4, 3.4),
      ...fern(-6.3, 3.2, 1.3),
      ...fern(5.6, 5),
      ...fern(-2.6, -6, 1.2, TOP),
      ...fern(2.4, -5, 1.1, TOP),
      ...fern(-5.6, -4.6, 1.3, TOP),
      ...fern(5, -4.4, 1.2, TOP),
      ...bush(-4.4, -1.4, 1.1),
      ...bush(-5.6, 1.8, 0.9),
      ...bush(4.3, -1.6, 0.95),
      ...skunk(-2.85, -1.25, 1.1),
      ...skunk(2.75, -1.05, 0.95),
      ...skunk(-3.35, -0.1, 1.2),
      ...skunk(2.1, -3.75, 0.9, TOP),
      // The mossy log on the right bank.
      P.cyl(0.28, 0.28, 3, BARK_DARK, { at: [4.4, 0.25, 2], rot: [0, 0.5, Math.PI / 2] }, 10),
      P.sphere(0.6, MOSS, { at: [4.4, 0.48, 2], rot: [0, 0.5, 0], scale: [2.2, 0.35, 0.6] }, 10),
      // Lily pads at the pool's quiet edges, a pink water lily on one.
      ...LILIES.map(([x, z, rr, a]) => bake(new CylinderGeometry(rr, rr, 0.012, 20, 1, false, a, Math.PI * 2 - 0.55), LEAF, { at: [x, WATER_Y + 0.008, z] }, true)),
      ...[0, 1, 2, 3, 4, 5].map((k) => P.sphere(0.04, k % 2 ? '#FF9EC4' : '#FFC2DA', { at: [LILIES[1][0] + Math.cos(k * 1.05) * 0.035, WATER_Y + 0.04, LILIES[1][1] + Math.sin(k * 1.05) * 0.035], rot: [0, -k * 1.05, 0.7], order: 'YZX', scale: [1, 0.45, 0.6] }, 7)),
      P.sphere(0.025, '#FFD95A', { at: [LILIES[1][0], WATER_Y + 0.05, LILIES[1][1]] }, 6),
    ]
    root.add(solid(merge(plants), bag, 1.4))
    root.add(
      solid(
        merge([
          ...flowers(-2.35, -0.75, 6, 0, 1),
          ...flowers(-2.95, -2.0, 5, 0, 2),
          ...flowers(2.35, -0.6, 6, 0, 3),
          ...flowers(-2.3, -3.85, 5, TOP, 4),
          ...flowers(2.85, -3.7, 5, TOP, 5),
          ...flowers(-3.9, -0.9, 4, 0, 6),
        ]),
        bag,
        1,
      ),
    )

    // ---- Mist round the falls, a light sparkly drizzle.
    const puff = bag.add(softTexture(64, 64, [255, 255, 255], (x, y) => radialAlpha(Math.hypot(x - 32, y - 32), 32, [[0, 0.75], [0.55, 0.35], [1, 0]])))
    const mist: Sprite[] = []
    for (let i = 0; i < 9; i++) {
      const sp = new Sprite(bag.add(new SpriteMaterial({ map: puff, transparent: true, opacity: 0.2, depthWrite: false, fog: false })))
      const sz = 2.2 + (i % 3) * 0.8
      sp.scale.set(sz * 1.5, sz, 1)
      sp.position.set(-2.4 + i * 0.6, 0.4 + (i % 3) * 0.35, FALLS_Z + 0.5 + (i % 4) * 0.5)
      root.add(sp)
      mist.push(sp)
    }
    const N = 60
    const rg = bag.add(new BufferGeometry())
    rg.setAttribute('position', new Float32BufferAttribute(new Float32Array(N * 6), 3))
    const rain = new LineSegments(rg, bag.add(new LineBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.22, depthWrite: false, blending: AdditiveBlending, fog: false })))
    rain.frustumCulled = false
    root.add(rain)

    // ---- Props the films move.
    const salmon = [0, 1, 2, 3].map(() => {
      const f = makeSalmon(bag, 0.62)
      f.root.visible = false
      root.add(f.root)
      return f
    })
    const leaf = new Group()
    leaf.add(
      solid(
        merge([
          P.cyl(0.016, 0.02, 0.98, '#5E9A4E', { at: [0.2, 0.84, 0.16], rot: [-0.08, 0, 0.12] }, 6),
          P.sphere(0.52, '#7CC85A', { at: [0.12, 1.33, 0.06], rot: [0.12, 0, -0.1], scale: [1, 0.13, 0.78] }, 16),
          P.box(0.9, 0.02, 0.03, '#5E9A4E', { at: [0.12, 1.4, 0.06], rot: [0.12, 0, -0.1] }),
        ]),
        bag,
        1.4,
      ),
    )
    const berries = new Group()
    berries.add(solid(merge(Array.from({ length: 9 }, (_, i) => P.sphere(0.05, i % 4 ? BERRY : SALMONBERRY, { at: [Math.cos(i * 2.4) * 0.07 * ((i % 3) / 2 + 0.3), Math.sin(i * 1.7) * 0.03, Math.sin(i * 2.4) * 0.07 * ((i % 3) / 2 + 0.3)] }, 7))), bag, 1.2))
    const juice = new Group()
    juice.add(solid(merge([P.sphere(0.07, BERRY, { scale: [1.5, 0.55, 0.5] }, 10), P.sphere(0.03, BERRY, { at: [0.09, -0.03, 0.01], scale: [1, 0.8, 0.6] }, 6), P.sphere(0.025, BERRY, { at: [-0.08, 0.02, 0.01] }, 6)]), bag, 0))
    const cone = solid(merge([P.sphere(0.09, '#8A5A3A', { scale: [1, 1.45, 1] }, 10), ...[0, 1, 2, 3, 4].map((i) => P.sphere(0.05, '#B07A4A', { at: [Math.cos(i * 1.26) * 0.075, -0.06 + (i % 3) * 0.06, Math.sin(i * 1.26) * 0.075] }, 6))]), bag, 1.4)
    cone.visible = false
    root.add(cone)
    const star: [number, number][] = []
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 2
      const r = i % 2 ? 0.16 : 0.6
      star.push([Math.cos(a) * r, Math.sin(a) * r])
    }
    const twinkle = new Group()
    twinkle.add(solid(P.prism(star, 0.06, '#FFE27A'), bag, 1.6))
    twinkle.visible = false
    root.add(twinkle)
    const splashG = solid(
      // A crown of water: a fat foot, a fountain that opens out as it goes up, and a few fat drops on top.
      merge(
        Array.from({ length: 16 }, (_, i) => {
          const up = i / 15
          const a = i * 2.4
          const out = 0.15 + up * 0.6
          return P.sphere(0.2 + (1 - up) * 0.14, i % 3 ? '#FFFFFF' : '#DDF2FB', { at: [Math.cos(a) * out, 0.2 + up * 1.9, Math.sin(a) * out * 0.6], scale: [1, 0.75, 1] }, 9)
        }),
      ),
      bag,
      1.6,
    )
    splashG.visible = false
    root.add(splashG)

    // The river, the falls and the rain on the leaves (one seamless bed, until the film is over).
    bag.add({ dispose: bed(url('salmon-river'), 0.3) })

    const live: RiverSet = {
      mirror: { root: mirror, glow, shine, k: 0, goal: 0 },
      salmon,
      leaps: [],
      leap(i, from, to, dur, arc = 0.9) {
        const f = salmon[i]
        this.leaps = this.leaps.filter((l) => l.fish !== f)
        this.leaps.push({ fish: f, from: new Vector3(...from), to: new Vector3(...to), arc, t0: this.now, dur, on: true })
        f.root.visible = true
        f.root.position.set(...from)
      },
      bigSplash(x, z) {
        this.splash.t = 0
        this.splash.g.position.set(x, 0, z)
        this.splash.g.visible = true
      },
      leaf,
      berries,
      juice,
      cone,
      twinkle,
      now: 0,
      pose: null,
      streaks,
      foam,
      mist,
      rain,
      splash: { g: splashG, t: 9 },
      wade: { x: BATH.x, z: BATH.z, k: 1 },
      fx: {
        update(t) {
          water.update(t)
          falls.update(t)
          spray.update(t)
          beams.update(t)
        },
        wade: (x, z, k) => water.wade(x, z, k),
      },
    }
    return live
  }
}

/** Keeps the river moving: the falls, the foam, the mist, the leaping salmon, the splash, the rain round the camera. */
export function updateRiver(set: RiverSet, dt: number, t: number, camera: Camera, splash: (x: number, y: number, z: number, n: number) => void) {
  {
    set.now = t
    // The water, the falls, the foam and the light move in their shaders; the mist drifts.
    set.fx.update(t)
    set.fx.wade(set.wade.x, set.wade.z, set.wade.k)
    for (const [i, m] of set.mist.entries()) {
      m.position.x += Math.sin(t * 0.3 + i) * dt * 0.15
      m.position.y = 0.4 + (i % 3) * 0.35 + Math.sin(t * 0.5 + i * 1.3) * 0.12
    }
    // Salmon in the air: along their arcs, nose first, tails wagging; into the water at the end.
    for (const l of set.leaps) {
      if (!l.on) continue
      const k = Math.min(1, (t - l.t0) / l.dur)
      const p = l.fish.root.position
      const top = Math.max(l.from.y, l.to.y) + l.arc
      // A parabola through from, the top, and to (the top a little past the middle when it ends higher).
      const y = (u: number) => (1 - u) * (1 - u) * l.from.y + 2 * u * (1 - u) * (2 * top - (l.from.y + l.to.y) / 2) + u * u * l.to.y
      p.lerpVectors(l.from, l.to, k)
      p.y = y(k)
      const k2 = Math.min(1, k + 0.02)
      const dx = (l.to.x - l.from.x) * 0.02
      const dz = (l.to.z - l.from.z) * 0.02
      l.fish.root.rotation.y = Math.atan2(-dz, dx)
      l.fish.root.rotation.z = Math.atan2(y(k2) - p.y, Math.hypot(dx, dz) || 0.001)
      l.fish.tail.rotation.y = Math.sin(t * 26) * 0.5
      if (k >= 1) {
        l.on = false
        l.fish.root.visible = false
        splash(l.to.x, l.to.y + 0.05, l.to.z, 8)
        riverSfx.splash()
      }
    }
    // The big splash: up fast, then falling back.
    const sp = set.splash
    if (sp.t < 9) {
      sp.t += dt
      const k = sp.t / 1.1
      if (k >= 1) sp.g.visible = false
      else {
        // (The column's height rises and falls, but its blobs stay round: they grow in at the start and shrink away at
        // the end, never squashed into flat white plates on the water.)
        const up = Math.sin(Math.min(1, k * 1.6) * Math.PI * 0.5) * (1 - Math.max(0, k - 0.45) / 0.55)
        const f = Math.min(1, k / 0.12) * (k > 0.6 ? 1 - (k - 0.6) / 0.4 : 1)
        const w = (0.6 + k * 0.9) * f
        sp.g.scale.set(w, (0.9 + up * 1.4) * f, w)
      }
    }
    // The twinkle faces the camera and pulses.
    if (set.twinkle.visible) {
      set.twinkle.quaternion.copy(camera.quaternion)
      const k = 1 + 0.25 * Math.sin(t * 14)
      set.twinkle.scale.setScalar(k)
    }
    // Rain: streaks falling round where the camera looks.
    const cam = camera
    cam.getWorldDirection(dir)
    const cx = cam.position.x + dir.x * 5
    const cy = cam.position.y + dir.y * 5
    const cz = cam.position.z + dir.z * 5
    const pos = set.rain.geometry.attributes.position as Float32BufferAttribute
    const a = pos.array as Float32Array
    for (let i = 0; i < a.length; i += 6) {
      let y = a[i + 1] - dt * 6
      if (y < cy - 5 || Math.abs(a[i] - cx) > 7 || Math.abs(a[i + 2] - cz) > 7 || a[i + 1] === 0) {
        a[i] = cx + (Math.random() - 0.5) * 13
        a[i + 2] = cz + (Math.random() - 0.5) * 13
        y = cy + Math.random() * 9 - 2
        // (Never right in front of the lens: a drop there is a big white bar.)
        if (Math.hypot(a[i] - cam.position.x, a[i + 2] - cam.position.z) < 1.8) a[i + 2] -= 3.6 * Math.sign(dir.z || -1) * -1
      }
      a[i + 1] = y
      a[i + 3] = a[i] - 0.03
      a[i + 4] = y + 0.16
      a[i + 5] = a[i + 2]
    }
    pos.needsUpdate = true
    // The mirror: its glow eases in and shimmers.
    const mr = set.mirror
    mr.k += (mr.goal - mr.k) * Math.min(1, dt * 2.5)
    ;(mr.glow.material as MeshBasicMaterial).opacity = mr.k * (0.75 + 0.25 * Math.sin(t * 4))
    ;(mr.shine.material as MeshBasicMaterial).opacity = mr.k * (0.32 + 0.1 * Math.sin(t * 2.3))
    mr.glow.scale.setScalar(1 + mr.k * 0.04 * Math.sin(t * 3))
    set.pose?.()
  }
}
const dir = new Vector3()

/** The films' set: the river, built on the film stage. */
export const RIVER: FilmSet<RiverSet> = {
  id: 'bath',
  look: RIVER_LOOK,
  build: (s, root) => buildRiver(s.bag, root),
  update: (set, dt, t, s) => updateRiver(set, dt, t, s.rig.camera, (x, y, z, n) => s.splash(x, y, z, n)),
}

// The river's own sounds (prompts: sfx/parts/bath.json; the clips kept their salmon names), over synth fallbacks.
/** A salmon leaping out of the water; a small splash as one lands; the enormous one from Misty's swing. */
export const riverSfx = {
  leap: clip(url('salmon-leap'), () => noise(0.22, 0.08, 'bandpass', 1500, 3400, 0, 1.5)),
  splash: clip(url('salmon-splash'), () => noise(0.25, 0.1, 'bandpass', 2000, 700, 0, 1)),
  bigSplash: clip(url('salmon-splash-big'), () => (sfx.splash(), tone(120, 60, 0.3, 0.2, 'sine'))),
  /** A big paw (or a hockey stick) swishing through the air. */
  swing: clip(url('salmon-swing'), () => noise(0.3, 0.12, 'bandpass', 600, 2400, 0, 1)),
  /** The stick hitting the pinecone: thwock. */
  thwack: clip(url('salmon-thwack'), () => tone(700, 260, 0.08, 0.16, 'square')),
  /** A raven in the cedars: kraa. */
  raven: clip(url('salmon-raven'), () => [0, 0.3].forEach((d) => tone(520, 380, 0.22, 0.06, 'sawtooth', d))),
}

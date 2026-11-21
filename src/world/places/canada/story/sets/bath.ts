// The rainforest river in British Columbia, where Misty the spirit bear lives: the set of Misty's Bubble Bath (the
// game, activities/bath/) and of its two films (story/films/bath.ts), so the game and its films are one place. The river
// comes toward the camera down a rocky step in the forest floor: the falls, a pool at its foot where Misty has her bath,
// mossy banks with ferns and berry bushes, giant cedars going up out of the frame (the tallest one, `TALLEST`, for the
// pinecone to sail over; a near one on the right bank, `SCRATCH`, for her back), mist round the falls and a soft rain.
// In front of her the pool is still (`MIRROR`): at the end of her bath it glows like a mirror.
//
// The usual camera stands on +z looking toward -z, so the falls face it: the lower pool runs from the falls' foot
// (z = FALLS_Z) toward the camera, the upper river goes back into the forest at y = TOP. Misty has her bath at `BATH`
// (her feet under the water). Maple's bank is on the left (x < -1.6).
//
// `buildRiver` makes it (the film stage and the game both call it), `updateRiver` keeps it moving.
import { AdditiveBlending, BufferGeometry, CircleGeometry, Float32BufferAttribute, Group, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, RingGeometry, Sprite, SpriteMaterial, Vector3, type Camera, type Object3D } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid, type V3 } from '../../../../engine3d/geo'
import { radialAlpha, softTexture } from '../../../../engine3d/softTexture'
import { bed, clip } from '../../../../kit/clips'
import { noise, sfx, tone } from '../../../../kit/sfx'
import { url } from '../../sfx'
import type { FilmSet, SetLook } from '../stage'

/** The falls' face (z) and how high the upper river is. */
export const FALLS_Z = -3
export const TOP = 1.5
/** How deep Misty stands in the pool (her feet are this far under the water). */
export const WADE = -0.38
/** The river's half width. */
const RW = 1.6
/** The tallest cedar: its foot and its height (the pinecone goes over its top). */
export const TALLEST = { x: 2.6, z: -10, h: 19 }
/** Where Misty has her bath (in the pool, the water round her ankles), facing the camera. */
export const BATH = { x: 0.15, y: -0.12, z: -1.7 }
/** The still water in front of her that glows like a mirror at the end. */
export const MIRROR = { x: 1.05, z: -1.3, r: 0.4 }
/** The big cedar on the right bank she scratches her back on (its trunk's radius at the foot). */
export const SCRATCH = { x: 2.1, z: -1.95, r: 0.46, h: 17 }

// The river's colors.
const WATER = '#6BBBD9'
const WATER_DEEP = '#4E97BC'
const FALLS = '#9DD3EC'
const MOSS = '#7DB563'
const MOSS_DARK = '#5E9A4E'
const ROCK = '#9A93A3'
const ROCK_DARK = '#7F788A'
const BARK = '#9A5A44'
const BARK_DARK = '#7A4434'
const CEDAR = ['#3F7F4C', '#4C9457', '#5AA562']
const FERN = '#5FA552'
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

/** A soft grey-green rainforest day, misty far off (the films' stage and the game's sky). */
export const RIVER_LOOK: SetLook = { sky: ['#9DBFCB', '#C6DCD6', '#DCEBE1'], fog: ['#CFE1D8', 16, 75], light: [1.02, 0.86], tint: '#F2FBF4', clouds: false }

/** Builds the river in `root`: everything the films and the game see. */
export function buildRiver(bag: Bag, root: Group): RiverSet {
  {
    // ---- The ground: the lower forest floor, the rocky step (the falls' ledge) and the upper floor behind it.
    const ground = [
      P.cyl(70, 70, 0.4, MOSS, { at: [0, -0.2, 20] }, 40),
      ...[[-5, 2, 2.2], [5.5, 1, 2.6], [-8, -1, 3], [7, 6, 2], [-6, 7, 2.4]].map(([x, z, r]) => P.cyl(r, r * 1.1, 0.06, MOSS_DARK, { at: [x, 0.01, z] }, 14)),
      // The step: rock, mossy on top, the whole way across the forest.
      P.box(90, TOP - 0.15, 60, ROCK, { at: [0, (TOP - 0.15) / 2, FALLS_Z - 30.15] }),
      P.box(90, 0.2, 60, MOSS, { at: [0, TOP - 0.1, FALLS_Z - 30.25] }),
    ]
    // Boulders along the face and round the pool, mossy caps.
    const rocks: BufferGeometry[] = []
    const boulder = (x: number, y: number, z: number, w: number, h: number) => {
      rocks.push(P.rbox(w, h, w * 0.8, Math.min(w, h) * 0.3, (x * 7) % 2 > 1 ? ROCK : ROCK_DARK, { at: [x, y, z] }))
      rocks.push(P.sphere(w * 0.42, MOSS, { at: [x, y + h * 0.42, z], scale: [1.05, 0.3, 0.85] }, 10))
    }
    for (const [x, w, h] of [[-2.3, 1.3, 1.6], [-3.6, 1.6, 1.3], [-5.4, 1.4, 1.5], [2.3, 1.3, 1.7], [3.7, 1.7, 1.4], [5.6, 1.3, 1.5], [-7.4, 1.6, 1.4], [7.5, 1.5, 1.5]]) boulder(x, h / 2 - 0.05, FALLS_Z + 0.25, w, h)
    for (const [x, z, w] of [[-1.9, -2.2, 0.6], [1.85, -1.4, 0.55], [-1.75, 1.4, 0.5], [1.8, 2.6, 0.62], [-1.85, 4.6, 0.5], [1.75, 6.5, 0.55]]) boulder(x, 0.12, z, w, w * 0.65)
    // Moss hanging over the lip.
    for (let i = 0; i < 12; i++) {
      const x = -8 + i * 1.45 + ((i * 37) % 5) * 0.08
      if (Math.abs(x) < RW + 0.1) continue
      rocks.push(P.sphere(0.4, i % 2 ? MOSS : MOSS_DARK, { at: [x, TOP - 0.15, FALLS_Z + 0.05], scale: [1.2, 0.7, 0.5] }, 8))
    }
    root.add(solid(merge(ground), bag, 0), solid(merge(rocks), bag, 1.6))

    // ---- The water: the pool and the river going off toward the camera, the upper river, the falls between.
    root.add(
      solid(
        merge([
          P.box(RW * 2, 0.6, 40, WATER, { at: [0, -0.28, FALLS_Z + 20] }),
          P.box(RW * 2 - 0.4, 0.02, 3.2, WATER_DEEP, { at: [0, 0.03, FALLS_Z + 2] }),
          P.box(RW * 2, 0.5, 40, WATER, { at: [0, TOP - 0.23, FALLS_Z - 20.05] }),
          P.box(RW * 2, TOP + 0.02, 0.16, FALLS, { at: [0, TOP / 2, FALLS_Z + 0.12] }),
          P.cyl(RW * 1.02, RW * 1.02, 0.05, FALLS, { at: [0, TOP - 0.03, FALLS_Z + 0.08], scale: [1, 1, 0.12] }, 16),
        ]),
        bag,
        1.6,
      ),
    )
    // The still water in front of her bath: a calm round of pool that glows like a mirror when it's time.
    const mirror = new Group()
    const still = solid(merge([P.cyl(MIRROR.r, MIRROR.r, 0.012, '#8FD0E8', {}, 40), P.cyl(MIRROR.r * 0.72, MIRROR.r * 0.72, 0.014, '#A8DCF0', { at: [0, 0.002, 0] }, 40)]), bag, 0)
    const glowMat = bag.add(new MeshBasicMaterial({ color: '#FFF3B8', transparent: true, opacity: 0, depthWrite: false, fog: false }))
    const glow = new Mesh(bag.add(new RingGeometry(MIRROR.r * 0.88, MIRROR.r * 1.05, 48)), glowMat)
    glow.rotation.x = -Math.PI / 2
    glow.position.y = 0.02
    const shine = new Mesh(bag.add(new CircleGeometry(MIRROR.r * 0.86, 48)), bag.add(new MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0, depthWrite: false, fog: false })))
    shine.rotation.x = -Math.PI / 2
    shine.position.y = 0.018
    mirror.add(still, shine, glow)
    mirror.position.set(MIRROR.x, 0.028, MIRROR.z)
    mirror.scale.z = 0.7
    root.add(mirror)

    // White streaks running down the falls (they loop), and the foam at its foot.
    const streaks: Object3D[] = []
    for (let i = 0; i < 16; i++) {
      const st = solid(P.rbox(0.07, 0.42 + (i % 3) * 0.12, 0.03, 0.03, '#FFFFFF'), bag, 0)
      st.position.set(-RW + 0.15 + ((i * 0.53) % (RW * 2 - 0.3)), (i * 0.37) % TOP, FALLS_Z + 0.22)
      root.add(st)
      streaks.push(st)
    }
    const foam = solid(
      merge(Array.from({ length: 11 }, (_, i) => P.sphere(0.24 + (i % 3) * 0.06, '#FFFFFF', { at: [-RW + 0.2 + i * 0.3, 0.04, FALLS_Z + 0.35 + (i % 2) * 0.18], scale: [1, 0.45, 0.8] }, 10))),
      bag,
      1.2,
    )
    root.add(foam)
    // Little white lines of foam drifting down the pool toward the camera.
    for (let i = 0; i < 8; i++) {
      const st = solid(P.rbox(0.4, 0.015, 0.05, 0.01, '#FFFFFF'), bag, 0)
      st.position.set(-1.1 + ((i * 0.71) % 2.2), 0.04, FALLS_Z + 1 + i * 1.6)
      root.add(st)
      streaks.push(st)
    }

    // ---- The forest: giant cedars, ferns, berry bushes, a mossy log.
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
      ...fern(2.5, 0.4, 1.1),
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
      // The mossy log on the right bank.
      P.cyl(0.28, 0.28, 3, BARK_DARK, { at: [4.4, 0.25, 2], rot: [0, 0.5, Math.PI / 2] }, 10),
      P.sphere(0.6, MOSS, { at: [4.4, 0.48, 2], rot: [0, 0.5, 0], scale: [2.2, 0.35, 0.6] }, 10),
    ]
    root.add(solid(merge(plants), bag, 1.4))

    // ---- Mist round the falls, rain all about.
    const puff = bag.add(softTexture(64, 64, [255, 255, 255], (x, y) => radialAlpha(Math.hypot(x - 32, y - 32), 32, [[0, 0.75], [0.55, 0.35], [1, 0]])))
    const mist: Sprite[] = []
    for (let i = 0; i < 9; i++) {
      const sp = new Sprite(bag.add(new SpriteMaterial({ map: puff, transparent: true, opacity: 0.32, depthWrite: false, fog: false })))
      const sz = 2.2 + (i % 3) * 0.8
      sp.scale.set(sz * 1.5, sz, 1)
      sp.position.set(-2.4 + i * 0.6, 0.4 + (i % 3) * 0.35, FALLS_Z + 0.5 + (i % 4) * 0.5)
      root.add(sp)
      mist.push(sp)
    }
    const N = 260
    const rg = bag.add(new BufferGeometry())
    rg.setAttribute('position', new Float32BufferAttribute(new Float32Array(N * 6), 3))
    const rain = new LineSegments(rg, bag.add(new LineBasicMaterial({ color: '#E8F4FF', transparent: true, opacity: 0.4, depthWrite: false, blending: AdditiveBlending, fog: false })))
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
    }
    return live
  }
}

/** Keeps the river moving: the falls, the foam, the mist, the leaping salmon, the splash, the rain round the camera. */
export function updateRiver(set: RiverSet, dt: number, t: number, camera: Camera, splash: (x: number, y: number, z: number, n: number) => void) {
  {
    set.now = t
    // The falls run, the foam heaves, the mist drifts.
    for (const [i, st] of set.streaks.entries()) {
      if (i < 16) {
        st.position.y -= dt * (2.4 + (i % 4) * 0.4)
        if (st.position.y < 0.15) st.position.y = TOP - 0.1
      } else {
        st.position.z += dt * 0.9
        if (st.position.z > FALLS_Z + 14) st.position.z = FALLS_Z + 1
      }
    }
    set.foam.scale.set(1, 1 + Math.sin(t * 7) * 0.12, 1)
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
      else sp.g.scale.set(0.6 + k * 0.9, Math.sin(Math.min(1, k * 1.6) * Math.PI * 0.5) * (1 - Math.max(0, k - 0.45) / 0.55) * 2.2 + 0.01, 0.6 + k * 0.9)
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
      let y = a[i + 1] - dt * 9
      if (y < cy - 5 || Math.abs(a[i] - cx) > 7 || Math.abs(a[i + 2] - cz) > 7 || a[i + 1] === 0) {
        a[i] = cx + (Math.random() - 0.5) * 13
        a[i + 2] = cz + (Math.random() - 0.5) * 13
        y = cy + Math.random() * 9 - 2
        // (Never right in front of the lens: a drop there is a big white bar.)
        if (Math.hypot(a[i] - cam.position.x, a[i + 2] - cam.position.z) < 1.8) a[i + 2] -= 3.6 * Math.sign(dir.z || -1) * -1
      }
      a[i + 1] = y
      a[i + 3] = a[i] - 0.03
      a[i + 4] = y + 0.24
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

// Red Canoe's lake: Moraine Lake in Banff, in the toon look. The pebble beach, the meadow and the spruce forest round
// the water; across from the dock the Valley of the Ten Peaks, a wall of jagged grey summits with snow in their gullies,
// and the glacier flowing down between two of them to the water at the north end (glacier.ts); lower forested mountains
// round the rest. The glacier creek tumbles down into the north-west corner with its milky rock flour spreading on the
// lake. By the dock, the famous rock pile at the outlet (the pika's and the marmot's home) with the log jam in front of
// it; the beaver lodge on the west shore; a crag for the mountain goat on the north-east shore; the sky and its clouds.
// The trees, rocks and mountains come from nature.ts (the Nan forest's level of detail). The world (paddle.ts) adds the
// water, the canoe and the animals.
//
// Everything above the water goes in `land`, so the world can mirror it under the see-through lake as its reflection.
import { BackSide, BufferGeometry, type Material, MeshToonMaterial, Plane, CanvasTexture, CatmullRomCurve3, CircleGeometry, Color, Float32BufferAttribute, Group, Mesh, MeshBasicMaterial, SphereGeometry, Vector3, type Object3D } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../engine3d/geo'
import { toon } from '../../../../engine3d/toon'
import { RiverMaterial } from './flow'
import { buildGlacier, onGlacier } from './glacier'
import { CLIFF, DOCK, FLOUR, LAND, landY, LODGE, LOGJAM, MOOSE, MOUTH, ringPoint, ROCKPILE, SQUIRREL } from './lake'
import { bumps, cragPart, Grove, mirrorShape, rng, rockPart, SPRUCE_GREENS, type CragLook } from './nature'

export { rng }
export const SKY = '#C4E8FA'
const SPRUCE = SPRUCE_GREENS
const ROCK = '#A9A1BA'
const ROCK_DARK = '#8C83A0'
const SNOW = '#FBFDFF'

/** The ground round the lake: rings out from the shoreline, rising into the mountains (vertex colors, no outline).
 *  Rings `from` to `to` of LAND: the first ring is the pebbles under the water, the rest the land above it. */
function buildLand(bag: Bag, from = 1, to = LAND.length - 1) {
  const N = 120
  const pos: number[] = []
  const col: number[] = []
  const c = (hex: string) => {
    const n = parseInt(hex.slice(1), 16)
    // (Vertex colors are linear, like a material's: the same conversion three does for a hex color.)
    const lin = (v: number) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    return [lin((n >> 16) & 255), lin((n >> 8) & 255), lin(n & 255)]
  }
  const rand = rng(11)
  const jitter = LAND.map((_, j) => Array.from({ length: N }, () => (j > 4 ? (rand() - 0.5) * (j - 3) * 1.6 : 0)))
  const vert = (i: number, j: number) => {
    const th = ((i % N) / N) * Math.PI * 2
    const [k, y, color] = LAND[j]
    const p = ringPoint(th, k)
    const calm = onGlacier(p.x, p.z, 4) || nearCreek(p.x, p.z, 7) ? 0 : 1
    // (A little light and shade in patches, so the meadow and the slopes aren't one flat color.)
    const n = 1 + 0.07 * bumps(p.x * 0.09, j, p.z * 0.09, 5)
    return { p: [p.x, y + jitter[j][i % N] * calm, p.z], c: c(color).map((v) => v * n) }
  }
  for (let j = from; j < to; j++)
    for (let i = 0; i < N; i++) {
      const a = vert(i, j)
      const b = vert(i + 1, j)
      const d = vert(i, j + 1)
      const e = vert(i + 1, j + 1)
      for (const v of [a, b, d, b, e, d]) {
        pos.push(...v.p)
        col.push(...v.c)
      }
    }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('color', new Float32BufferAttribute(col, 3))
  g.computeVertexNormals()
  return new Mesh(bag.add(g), toon('#ffffff', true))
}

/** The mountains. Across the lake from the dock, the Valley of the Ten Peaks: a wall of ten jagged grey summits in a
 *  row, each a crag with ridges and buttresses and a smaller one at its shoulder, snow on the tops, in the gullies and
 *  on the ledges, the glacier flowing down from the col between two of them. Round the rest of the lake, lower
 *  mountains with forest up their sides and only a little snow. Returns each peak (for taps and snow puffs). */
function buildPeaks(bag: Bag) {
  const rand = rng(7)
  const group = new Group()
  const peaks: { mesh: Object3D; top: Vector3 }[] = []
  const grey: CragLook = { rock: ROCK, dark: ROCK_DARK, snow: SNOW, snowLine: 0.62 }
  /** One peak: the main crag, a shoulder crag beside it and two lower buttresses at its foot. */
  const spire = (th: number, k: number, r: number, h: number, look: CragLook) => {
    const p = ringPoint(th, k)
    const y = landY(p.x, p.z) - 4
    const seed = rand() * 100
    const parts = [
      cragPart(r, h, seed, look, { at: [0, h / 2, 0] }),
      cragPart(r * 0.7, h * 0.72, seed + 3, { ...look, snowLine: look.snowLine + 0.06 }, { at: [r * 0.62, h * 0.36, r * 0.1], rot: [0, rand() * 2, -0.06] }),
      cragPart(r * 0.6, h * 0.45, seed + 6, { ...look, snowLine: look.snowLine + 0.15 }, { at: [-r * 0.4, h * 0.22, r * 0.38], rot: [0, rand() * 2, 0] }, 7),
      cragPart(r * 0.5, h * 0.4, seed + 9, { ...look, snowLine: look.snowLine + 0.15 }, { at: [-r * 0.5, h * 0.2, -r * 0.3], rot: [0, rand() * 2, 0] }, 7),
    ]
    const g = solid(merge(parts), bag, 2)
    g.position.set(p.x, y, p.z)
    g.rotation.y = rand() * Math.PI * 2
    group.add(g)
    peaks.push({ mesh: g, top: new Vector3(p.x, y + h, p.z) })
    return { x: p.x, y, z: p.z }
  }
  // The Ten Peaks, from the north-west round the north (the glacier) to the east.
  const ten: { x: number; y: number; z: number }[] = []
  for (let i = 0; i < 10; i++) {
    const th = -2.3 + (i / 9) * 2.75
    const big = i === 4 || i === 5 ? 12 : 0
    ten.push(spire(th, 2.3 + 0.12 * Math.sin(i * 1.7), 14 + rand() * 4, (52 + 12 * Math.sin(i * 2.3 + 0.5) + big + rand() * 5) * 0.9, { ...grey, snowLine: 0.55 + rand() * 0.12 }))
  }
  // The wall between them: a long jagged ridge under the summits (lower where the glacier comes through).
  const wall = []
  for (let i = 0; i < 9; i++) {
    const a = ten[i]
    const b = ten[i + 1]
    const d = Math.hypot(b.x - a.x, b.z - a.z)
    const col = i === 2 ? 0.7 : 1
    wall.push(cragPart(d * 0.62, 30 * col, i * 7.7, { ...grey, snowLine: 0.5 }, { at: [(a.x + b.x) / 2, (a.y + b.y) / 2 + 15 * col, (a.z + b.z) / 2], scale: [1, 1, 0.5], rot: [0, Math.atan2(b.x - a.x, b.z - a.z) + Math.PI / 2, 0] }, 10))
  }
  group.add(solid(merge(wall), bag, 2))
  // The forested mountains round the south and west: lower, green up their sides, a little snow on the highest.
  const n = 11
  for (let i = 0; i < n; i++) {
    const th = 0.78 + (i / (n - 1)) * 3.1
    const south = Math.max(0, Math.sin(th))
    const h = (34 + rand() * 26) * (1 - south * 0.3)
    spire(th, 2.15 + rand() * 0.7, 18 + rand() * 10, h, { rock: i % 2 ? '#9FB0AA' : '#A7B5B2', dark: '#82968F', snow: SNOW, snowLine: h > 42 ? 0.8 : 1.5, forest: 0.42 + rand() * 0.15, green: i % 2 ? '#5E9C7C' : '#6AA684' })
  }
  return { group, peaks }
}

/** The sky: a big dome, deeper blue overhead and pale at the horizon (and the same below it, so the lake mirrors it). */
export function buildSky(bag: Bag) {
  const g = new SphereGeometry(900, 32, 20)
  const pos = g.attributes.position
  const col: number[] = []
  const lo = new Color('#CDEBFA')
  const hi = new Color('#7CC6EE')
  const c = new Color()
  for (let i = 0; i < pos.count; i++) {
    const k = Math.min(1, Math.abs(pos.getY(i)) / 600) ** 0.8
    c.copy(lo).lerp(hi, k)
    col.push(c.r, c.g, c.b)
  }
  g.setAttribute('color', new Float32BufferAttribute(col, 3))
  const m = new Mesh(bag.add(g), bag.add(new MeshBasicMaterial({ vertexColors: true, side: BackSide, fog: false, depthWrite: false })))
  m.renderOrder = -10
  return m
}

/** Puffy toon clouds high over the mountains (the world turns them slowly round the sky). */
export function buildClouds(bag: Bag) {
  const rand = rng(61)
  const parts = []
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + rand() * 0.4
    const d = 210 + rand() * 160
    const y = 105 + rand() * 50
    const s = 9 + rand() * 7
    const cx = Math.cos(a) * d
    const cz = Math.sin(a) * d
    for (let j = 0; j < 5; j++) parts.push(P.sphere(s * (j === 2 ? 1.25 : 0.75 + rand() * 0.3), '#FFFFFF', { at: [cx + (j - 2) * s * 0.9 * Math.sin(a), y + (j === 2 ? s * 0.35 : 0), cz - (j - 2) * s * 0.9 * Math.cos(a)], scale: [1, 0.72, 1] }, 10))
  }
  return solid(merge(parts), bag, 2.5)
}

/** Is (x, z) kept clear of plants: the glacier, its creek, the dock, the rock pile, the cliff, the squirrel's rock. */
function clearOf(x: number, z: number, pad = 0) {
  if (onGlacier(x, z, pad)) return false
  if (nearCreek(x, z, 2.5 + pad)) return false
  if (Math.hypot(x - DOCK.x, z - DOCK.z) < 7 + pad || Math.hypot(x - ROCKPILE.x, z - ROCKPILE.z) < ROCKPILE.r + 1 + pad || Math.hypot(x - SQUIRREL.x, z - SQUIRREL.z) < 4 + pad) return false
  if (Math.hypot(x - CLIFF.x, z - CLIFF.z) < 6 + pad || Math.hypot(x - MOOSE.x, z - MOOSE.z) < 3) return false
  return true
}

/** The forest and the meadow round the lake (the Nan forest's way: every plant one shape drawn many times, each its
 *  own green): on the beach, pebbles and boulders; on the meadow, grass, fireweed, bushes and aspens; then the spruce
 *  forest with a subalpine fir poking up here and there, thinning up the slopes into the far forest, a golden larch
 *  now and then high up. Near plants have the ink line. */
function buildForest(bag: Bag) {
  const rand = rng(23)
  const grove = new Grove(rand)
  // The beach: pebbles, and a few big boulders at the water's edge.
  for (let i = 0; i < 520; i++) {
    const th = rand() * Math.PI * 2
    const k = 0.985 + rand() * 0.07
    const p = ringPoint(th, k)
    if (!clearOf(p.x, p.z, -1.5)) continue
    const y = landY(p.x, p.z)
    if (rand() < 0.09) grove.add('boulder', p.x, y, p.z, 0.9 + rand() * 1.3)
    else grove.add('pebble', p.x, y, p.z, 0.18 + rand() * 0.3, { sy: 0.6 + rand() * 0.5 })
  }
  // The meadow and the forest, out from the beach.
  for (let i = 0; i < 2100; i++) {
    const th = rand() * Math.PI * 2
    const k = 1.05 + rand() ** 1.35 * 1.15
    const p = ringPoint(th, k)
    if (!clearOf(p.x, p.z)) continue
    const y = landY(p.x, p.z)
    // (Patches: the meadow comes and goes, the forest has clearings.)
    const patch = bumps(p.x * 0.08, 0, p.z * 0.08, 17)
    const near = k < 1.28
    if (k < 1.2) {
      const r = rand()
      if (r < 0.34) grove.add('tuft', p.x, y, p.z, 0.8 + rand() * 0.7)
      else if (r < 0.5 && patch > 0) grove.add('fireweed', p.x, y, p.z, 0.8 + rand() * 0.5)
      else if (r < 0.6) grove.add('shrub', p.x, y, p.z, 0.7 + rand() * 0.6)
      else if (r < 0.68 && patch < 0.1) grove.add('aspen', p.x, y, p.z, 0.75 + rand() * 0.4)
      else if (r < 0.86) grove.add(rand() < 0.2 ? 'fir' : 'spruce', p.x, y, p.z, 0.5 + rand() * 0.5)
      else if (rand() < 0.5) grove.add('boulder', p.x, y, p.z, 0.8 + rand() * 1.2)
      continue
    }
    if (patch < -0.45 && rand() < 0.7) {
      // A clearing: grass and a rock.
      if (rand() < 0.5) grove.add('tuft', p.x, y, p.z, 1 + rand() * 0.5, { ink: false })
      else if (rand() < 0.3) grove.add('boulder', p.x, y, p.z, 1 + rand() * 1.4, { ink: near })
      continue
    }
    // (Up the slopes, the forest thins out: half the trees there are hidden behind the ones in front anyway.)
    if (!near && rand() < 0.35) continue
    const r = rand()
    const high = k > 1.75
    if (high && r < 0.07) grove.add('larch', p.x, y, p.z, 0.8 + rand() * 0.4, { ink: near })
    else if (!near && r < 0.55) grove.add('far', p.x, y, p.z, 0.7 + rand() * 0.6)
    else if (r < 0.75) grove.add('spruce', p.x, y, p.z, 0.6 + rand() * 0.6, { ink: near })
    else if (r < 0.92) grove.add('fir', p.x, y, p.z, 0.6 + rand() * 0.55, { ink: near })
    else if (near) grove.add('shrub', p.x, y, p.z, 0.8 + rand() * 0.5)
  }
  return grove.build(bag)
}

/** The dock at the south end, the canoe's start. */
function buildDock(bag: Bag) {
  const parts = []
  const x = DOCK.x
  const z0 = DOCK.z + 4
  const z1 = DOCK.z - 4.5
  for (let i = 0; i <= 8; i++) {
    const z = z0 + ((z1 - z0) * i) / 8
    parts.push(P.box(2.2, 0.12, 0.92, i % 2 ? '#C79A72' : '#D2A67E', { at: [x, 0.62, z] }))
  }
  for (const [dx, z] of [[-1, z0], [1, z0], [-1, z1 + 0.3], [1, z1 + 0.3], [-1, (z0 + z1) / 2], [1, (z0 + z1) / 2]])
    parts.push(P.cyl(0.13, 0.13, 2.6, '#9A6B4F', { at: [x + dx, -0.4, z] }, 8))
  // A little red paddle rack and a life ring.
  parts.push(P.torus(0.32, 0.09, '#FF6B6B', { at: [x + 1.15, 1.1, z0 - 1], rot: [0, Math.PI / 2, 0] }))
  return solid(merge(parts), bag, 2)
}

/** The beaver lodge on the west shore: a mound of sticks and mud half in the water. */
function buildLodge(bag: Bag) {
  const rand = rng(31)
  const parts = [P.sphere(2.6, '#8A6650', { at: [0, -0.4, 0], scale: [1.2, 0.75, 1] }, 12)]
  for (let i = 0; i < 26; i++) {
    const a = rand() * Math.PI * 2
    const r = 1 + rand() * 1.8
    parts.push(P.cyl(0.08, 0.08, 1.6 + rand() * 1.4, i % 2 ? '#6E4B3B' : '#A07A5E', { at: [Math.cos(a) * r, 0.3 + rand() * 1.1, Math.sin(a) * r * 0.85], rot: [rand() * 1.4 - 0.7, a, Math.PI / 2 - 0.4 + rand() * 0.6] }, 5))
  }
  const g = solid(merge(parts), bag, 2)
  g.position.set(LODGE.x, 0, LODGE.z)
  return g
}

/** A pile of boulders (the squirrel's lookout). */
function rocks(at: { x: number; z: number }, n: number, size: number, seed: number, bag: Bag) {
  const rand = rng(seed)
  const parts = []
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2
    const r = rand() * size
    const s = size * (0.9 + rand() * 0.8)
    parts.push(rockPart(s * 1.8, i % 3 ? ROCK : ROCK_DARK, seed + i, { at: [Math.cos(a) * r, i > n * 0.6 ? s * 0.5 : -0.1, Math.sin(a) * r], rot: [0, rand() * 3, 0] }, i % 2 === 0))
  }
  const g = solid(merge(parts), bag, 2)
  g.position.set(at.x, landY(at.x, at.z) - 0.2, at.z)
  return g
}

/** How high the rock pile is at a point (its boulders rise in a mound to `top` in the middle). */
export function pileY(x: number, z: number) {
  const d = Math.hypot(x - ROCKPILE.x, z - ROCKPILE.z) / ROCKPILE.r
  return landY(x, z) + Math.max(0, ROCKPILE.top * (1 - d) ** 0.8)
}

/** Moraine Lake's rock pile at the outlet: a big mound of grey boulders heaped up by an old rockslide, a few spruces
 *  on top, a little zigzag of steps up its side. */
function buildRockPile(bag: Bag) {
  const rand = rng(57)
  const parts = []
  for (let i = 0; i < 70; i++) {
    const a = rand() * Math.PI * 2
    const d = rand() ** 0.7 * ROCKPILE.r
    const x = ROCKPILE.x + Math.cos(a) * d
    const z = ROCKPILE.z + Math.sin(a) * d
    const s = 0.7 + rand() * 1.1
    parts.push(rockPart(s * 2.2, i % 4 === 0 ? ROCK_DARK : i % 4 === 1 ? '#B8B1C6' : ROCK, 700 + i, { at: [x, pileY(x, z) - s * 0.55, z], rot: [rand() * 0.3, rand() * 3, rand() * 0.3] }, i % 3 === 0))
  }
  for (let i = 0; i < 5; i++) {
    const a = i * 1.3 + 0.4
    const d = 1.2 + i * 0.5
    const x = ROCKPILE.x + Math.cos(a) * d
    const z = ROCKPILE.z + Math.sin(a) * d - 1.5
    const y = pileY(x, z) - 0.2
    const h = 3 + rand() * 2.5
    parts.push(P.cyl(0.1, 0.14, 0.7, '#7E553E', { at: [x, y + 0.3, z] }, 5))
    for (let t = 0; t < 4; t++) parts.push(P.cone(h * (0.26 - t * 0.05), h * 0.34, SPRUCE[(i + t) % SPRUCE.length], { at: [x, y + 0.5 + h * (0.17 + t * 0.2), z], rot: [0, t, 0] }, 8))
  }
  return solid(merge(parts), bag, 2)
}

/** The log jam in the outlet: silver-grey drift logs piled criss-cross in the water, their ends showing the rings. */
export function buildLogJam(bag: Bag) {
  const rand = rng(71)
  const parts = []
  for (let i = 0; i < 11; i++) {
    const len = 3.5 + rand() * 4
    const r = 0.18 + rand() * 0.12
    const a = (i % 2 ? 0.6 : -0.5) + (rand() - 0.5) * 0.8
    const x = (rand() - 0.5) * 4.5
    const z = (rand() - 0.5) * 3
    const y = 0.05 + (i > 6 ? 0.32 : 0) + (rand() - 0.5) * 0.1
    const tilt = (rand() - 0.5) * 0.25
    // Each log is built lying along z at the origin, then turned and moved into the pile.
    const log = [P.cyl(r, r * 1.08, len, i % 3 ? '#D3CBC4' : '#BDB2AA', { rot: [Math.PI / 2 + tilt, 0, 0] }, 8)]
    for (const e of [-1, 1]) log.push(P.cyl(r * 0.72, r * 0.72, 0.03, '#A48F80', { at: [0, -Math.sin(tilt) * e * len * 0.5, e * (len * 0.5 + 0.01) * Math.cos(tilt)], rot: [Math.PI / 2 + tilt, 0, 0] }, 8))
    for (const p of log) parts.push(p.rotateY(a).translate(x, y, z))
  }
  const g = solid(merge(parts), bag, 2)
  g.position.set(LOGJAM.x, 0, LOGJAM.z)
  g.rotation.y = 0.5
  return g
}

/** A grey crag on the north-east shore, stepped like the mountains' layers, with a flat ledge for the mountain goat. */
function buildCliff(bag: Bag) {
  const y = landY(CLIFF.x, CLIFF.z) - 1
  const h = CLIFF.h
  const parts = [
    cragPart(6, h + 6, 3, { rock: ROCK, dark: ROCK_DARK, snow: SNOW, snowLine: 0.85 }, { at: [1.5, (h + 6) / 2, -1.5] }, 7),
    cragPart(4.5, h * 0.85, 5, { rock: ROCK, dark: ROCK_DARK, snow: SNOW, snowLine: 1.5, forest: 0.2, green: '#6AA684' }, { at: [-2.5, (h * 0.85) / 2, 1.5] }, 7),
    cragPart(3.5, h * 0.7, 8, { rock: ROCK, dark: ROCK_DARK, snow: SNOW, snowLine: 1.5 }, { at: [3, (h * 0.7) / 2, 2.8] }, 7),
    // The ledge, facing the lake, and the layers of rock across the face.
    P.rbox(3.2, 0.5, 2.2, 0.2, '#B8B1C6', { at: [-1.6, h, 2.2] }),
    P.rbox(5, 0.35, 0.8, 0.12, ROCK_DARK, { at: [0.5, h * 0.55, 3.2], rot: [0, -0.3, 0] }),
    P.rbox(4, 0.3, 0.7, 0.1, ROCK_DARK, { at: [1.2, h * 0.3, 3.6], rot: [0, 0.2, 0] }),
    P.cone(1.3, 1.6, SPRUCE[0], { at: [1.6, h + 1.5, 1] }, 8),
    P.cone(1, 1.5, SPRUCE[4], { at: [1.6, h + 2.4, 1], rot: [0, 1, 0] }, 8),
    P.cone(0.7, 1.3, SPRUCE[1], { at: [1.6, h + 3.2, 1], rot: [0, 2, 0] }, 8),
  ]
  const g = solid(merge(parts), bag, 2)
  g.position.set(CLIFF.x, y, CLIFF.z)
  // Facing the middle of the lake.
  g.rotation.y = Math.atan2(-CLIFF.x, -CLIFF.z) - 0.6
  return g
}
/** Where the goat stands on the ledge (world), and which way he faces. */
export function goatSpot() {
  const y = landY(CLIFF.x, CLIFF.z) - 1 + CLIFF.h + 0.25
  const r = Math.atan2(-CLIFF.x, -CLIFF.z) - 0.6
  const lx = -1.6
  const lz = 2.2
  return { x: CLIFF.x + Math.cos(r) * lx + Math.sin(r) * lz, y, z: CLIFF.z - Math.sin(r) * lx + Math.cos(r) * lz, h: r + 0.9 }
}

/** The glacier creek's line, from the waterfall at its top down to where it spills into the lake (x, z). */
const CREEK = [
  { x: -35.5, z: -83 },
  { x: -33.5, z: -75 },
  { x: -31, z: -67 },
  { x: -29.5, z: -59 },
  { x: -26.5, z: -51 },
  { x: -23.8, z: -44 },
  { x: MOUTH.x, z: MOUTH.z },
  { x: MOUTH.x + 2.4, z: MOUTH.z + 3 },
]
/** How tall the waterfall at the creek's top is (m). */
const FALL = 6

interface CreekPoint {
  x: number
  z: number
  y: number
  /** Unit sideways (to the creek's right going downstream), its half width, meters along, how fast it tumbles. */
  sx: number
  sz: number
  w: number
  along: number
  rush: number
}
let creekPts: CreekPoint[] | null = null
/** The creek sampled every meter or so: smooth (a curve through CREEK), always running downhill. */
function creek() {
  if (creekPts) return creekPts
  const curve = new CatmullRomCurve3(CREEK.map((p) => new Vector3(p.x, 0, p.z)))
  const n = 90
  const pts: CreekPoint[] = []
  let along = 0
  let prevY = Infinity
  for (let i = 0; i <= n; i++) {
    const u = i / n
    const p = curve.getPointAt(u)
    const t = curve.getTangentAt(u)
    if (i) along += p.distanceTo(curve.getPointAt((i - 1) / n))
    const ground = landY(p.x, p.z)
    const y = Math.max(0.07, Math.min(prevY, ground + 0.32))
    const ds = i ? p.distanceTo(curve.getPointAt((i - 1) / n)) : 1
    const drop = i ? (prevY - y) / ds : 0
    prevY = y
    // Wider as it nears the lake, fanning out at the mouth.
    const w = 0.9 + u * 1.1 + (u > 0.88 ? (u - 0.88) * 16 : 0) + 0.15 * Math.sin(u * 23)
    pts.push({ x: p.x, z: p.z, y, sx: -t.z, sz: t.x, w, along, rush: Math.min(1, Math.max(0, drop * 1.3 - 0.3)) })
  }
  return (creekPts = pts)
}
/** How far (x, z) is from the creek's water, its waterfall included (m). */
export function creekDistance(x: number, z: number) {
  let d = Infinity
  for (const p of creek()) d = Math.min(d, Math.hypot(x - p.x, z - p.z) - p.w)
  return Math.max(0, d)
}
/** Is (x, z) within `pad` meters of the creek's water? */
export function nearCreek(x: number, z: number, pad = 0) {
  for (const p of creek()) if (Math.hypot(x - p.x, z - p.z) < p.w + pad) return true
  return false
}

/** The glacier creek: a waterfall off a rock ledge at the top, then down the mountainside in a pebbly bed, tumbling
 *  white over the steep steps, past boulders, fanning out into the lake at its mouth. */
function buildStream(flow: RiverMaterial, bag: Bag) {
  const pts = creek()
  // The water: a strip down the bed, `flow` (meters along, 0..1 across) and `rush` for the shader.
  const pos: number[] = []
  const fl: number[] = []
  const rush: number[] = []
  const idx: number[] = []
  const strip = (rows: { l: number[]; r: number[]; along: number; rush: number }[]) => {
    const o = pos.length / 3
    for (const row of rows) {
      pos.push(...row.l, ...row.r)
      fl.push(row.along, 0, row.along, 1)
      rush.push(row.rush, row.rush)
    }
    for (let i = 0; i < rows.length - 1; i++) {
      const a = o + i * 2
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
  }
  strip(pts.map((p) => ({ l: [p.x - p.sx * p.w, p.y, p.z - p.sz * p.w], r: [p.x + p.sx * p.w, p.y, p.z + p.sz * p.w], along: p.along, rush: p.rush })))
  // The waterfall: a sheet pouring off the ledge into the top of the creek (flowing down it, all whitewater).
  const top = pts[0]
  const back = pts[1]
  const bx = top.x - (back.x - top.x) * 0.9
  const bz = top.z - (back.z - top.z) * 0.9
  const fall = []
  for (let i = 0; i <= 6; i++) {
    const t = i / 6
    // (Out over the lip, then straight down.)
    const out = Math.sin(t * Math.PI * 0.5) * 0.5
    const x = bx + (top.x - bx) * (0.15 + out)
    const z = bz + (top.z - bz) * (0.15 + out)
    const w = top.w * (0.75 + t * 0.25)
    fall.push({ l: [x - top.sx * w, top.y + FALL * (1 - t), z - top.sz * w], r: [x + top.sx * w, top.y + FALL * (1 - t), z + top.sz * w], along: -FALL * (1 - t), rush: 1 })
  }
  strip(fall)
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('flow', new Float32BufferAttribute(fl, 2))
  g.setAttribute('rush', new Float32BufferAttribute(rush, 1))
  g.setIndex(idx)
  const water = new Mesh(bag.add(g), flow.mat)
  // The bed: grey pebbles either side of the water, a little lower, over the grass.
  const bed: number[] = []
  const bedC: number[] = []
  const wet = new Color('#B9B0C8')
  const dry = new Color('#D6CFDE')
  for (const side of [-1, 1])
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i]
      const b = pts[i + 1]
      const ring = (p: CreekPoint, k: number) => [p.x + side * p.sx * p.w * k, Math.max(p.y - 0.08, landY(p.x + side * p.sx * p.w * k, p.z + side * p.sz * p.w * k) + 0.2) - (k < 1.2 ? 0.06 : 0), p.z + side * p.sz * p.w * k]
      const quad = [ring(a, 0.8), ring(b, 0.8), ring(a, 1.75), ring(b, 0.8), ring(b, 1.75), ring(a, 1.75)]
      const cols = [wet, wet, dry, wet, dry, dry]
      // (Wound to face up: the sideways vector is (-t.z, t.x), so the left bank keeps this order and the right flips it.)
      quad.forEach((q, j) => {
        bed.push(...(side < 0 ? q : quad[[0, 2, 1, 3, 5, 4][j]]))
        const c = side < 0 ? cols[j] : cols[[0, 2, 1, 3, 5, 4][j]]
        bedC.push(c.r, c.g, c.b)
      })
    }
  const bg = new BufferGeometry()
  bg.setAttribute('position', new Float32BufferAttribute(bed, 3))
  bg.setAttribute('color', new Float32BufferAttribute(bedC, 3))
  bg.computeVertexNormals()
  const bedMesh = new Mesh(bag.add(bg), toon('#ffffff', true))
  // Boulders: in the water where it tumbles (the whitewater pours round them), along the banks, and the ledge the
  // waterfall pours off, a crag with its feet in the plunge pool.
  const rand = rng(41)
  const parts = []
  for (let i = 2; i < pts.length - 6; i += 2) {
    const p = pts[i]
    if (p.rush > 0.3 && rand() < 0.7) {
      const k = (rand() - 0.5) * 1.2
      parts.push(rockPart(0.7 + rand() * 0.7, ROCK, 800 + i, { at: [p.x + p.sx * p.w * k, p.y - 0.25, p.z + p.sz * p.w * k], rot: [0, rand() * 3, 0] }))
    }
    if (rand() < 0.55) {
      const side = rand() < 0.5 ? -1 : 1
      const k = p.w * 1.5 + rand() * 1.4
      const x = p.x + side * p.sx * k
      const z = p.z + side * p.sz * k
      parts.push(rockPart(1 + rand() * 1.6, rand() < 0.3 ? ROCK_DARK : ROCK, 900 + i, { at: [x, landY(x, z) - 0.1, z], rot: [0, rand() * 3, 0] }, rand() < 0.5))
    }
  }
  parts.push(
    cragPart(4.5, FALL + 3, 21, { rock: ROCK, dark: ROCK_DARK, snow: SNOW, snowLine: 0.86 }, { at: [bx - top.sx * 3.2 + (bx - top.x) * 1.2, top.y + (FALL + 3) / 2 - 1.5, bz - top.sz * 3.2 + (bz - top.z) * 1.2] }, 7),
    cragPart(4.5, FALL + 2, 22, { rock: ROCK, dark: ROCK_DARK, snow: SNOW, snowLine: 0.86 }, { at: [bx + top.sx * 3.2 + (bx - top.x) * 1.2, top.y + (FALL + 2) / 2 - 1.5, bz + top.sz * 3.2 + (bz - top.z) * 1.2] }, 7),
    rockPart(4.2, ROCK_DARK, 23, { at: [bx + (bx - top.x) * 1.6, top.y + FALL - 2.4, bz + (bz - top.z) * 1.6], scale: [1.3, 1.1, 1] }),
  )
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    parts.push(rockPart(0.8 + rand() * 0.6, ROCK, 950 + i, { at: [top.x + Math.cos(a) * (top.w + 0.6), top.y - 0.2, top.z + Math.sin(a) * (top.w + 0.6)], rot: [0, rand() * 3, 0] }, i % 2 === 0))
  }
  const g2 = new Group()
  g2.add(water, bedMesh, solid(merge(parts), bag, 1.6))
  // White foam where it spills into the lake.
  const end = pts[pts.length - 1]
  const foam = softDisc(3.2, 'rgba(255,255,255,0.7)', 'rgba(255,255,255,0)', bag)
  foam.position.set(end.x, 0.05, end.z)
  g2.add(foam)
  return g2
}

/** A soft round patch on the water (canvas gradient): the milky rock flour, a glow. */
export function softDisc(r: number, inner: string, outer: string, bag: Bag) {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const x = c.getContext('2d')!
  const grad = x.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, inner)
  grad.addColorStop(0.55, inner)
  grad.addColorStop(1, outer)
  x.fillStyle = grad
  x.fillRect(0, 0, 128, 128)
  // Swirls of the milky water.
  x.strokeStyle = 'rgba(255,255,255,0.4)'
  x.lineWidth = 5
  x.lineCap = 'round'
  for (let i = 0; i < 5; i++) {
    x.beginPath()
    x.arc(64, 64, 14 + i * 9, i * 1.3, i * 1.3 + 1.6)
    x.stroke()
  }
  const tex = bag.add(new CanvasTexture(c))
  const m = new Mesh(bag.add(new CircleGeometry(r, 40)), bag.add(new MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })))
  m.rotation.x = -Math.PI / 2
  m.renderOrder = 2
  return m
}

export interface Shore {
  /** Everything standing above the water (mirrored for the reflection). */
  land: Group
  /** Under the water near the shore: the pale shallows. */
  shallows: Mesh
  peaks: { mesh: Object3D; top: Vector3 }[]
  glacier: Group
  lodge: Group
  /** The log jam in the outlet (it bobs when she pokes it). */
  logs: Group
  stream: RiverMaterial
  /** The milky patch at the stream's mouth (two discs that turn slowly). */
  flour: Group
}

export function buildShore(bag: Bag): Shore {
  const land = new Group()
  const ground = buildLand(bag)
  land.add(ground)
  // The pebbles under the water: not mirrored (the mirror would stand them up above the water as a pale band round the
  // lake), and drawn under the reflection, which lies on the water's surface right up to the shoreline.
  const underwater = underTheReflection(buildLand(bag, 0, 1), bag)
  const { group: peakGroup, peaks } = buildPeaks(bag)
  land.add(peakGroup, buildForest(bag))
  const glacier = buildGlacier(bag)
  land.add(glacier)
  const stream = new RiverMaterial(bag, { deep: '#6FCFD3', light: '#A9E6E4', speed: 2.6 })
  land.add(buildStream(stream, bag))
  land.add(buildDock(bag))
  const lodge = buildLodge(bag)
  land.add(lodge)
  const logs = buildLogJam(bag)
  // (The logs float in the water, so they aren't mirrored: the world adds them, and bobs them.)
  land.add(buildRockPile(bag), buildCliff(bag), rocks(SQUIRREL, 5, 1.1, 53, bag))
  // The shallows: a pale band under the water round the shore (the lake looks shallow and clear at its edge).
  const sh = new BufferGeometry()
  const pos: number[] = []
  const N = 120
  for (let i = 0; i < N; i++) {
    const t0 = (i / N) * Math.PI * 2
    const t1 = ((i + 1) / N) * Math.PI * 2
    const a = ringPoint(t0, 0.86)
    const b = ringPoint(t1, 0.86)
    const d = ringPoint(t0, 1.01)
    const e = ringPoint(t1, 1.01)
    pos.push(a.x, -2.4, a.z, b.x, -2.4, b.z, d.x, 0.05, d.z, b.x, -2.4, b.z, e.x, 0.05, e.z, d.x, 0.05, d.z)
  }
  sh.setAttribute('position', new Float32BufferAttribute(pos, 3))
  sh.computeVertexNormals()
  const shallows = new Mesh(bag.add(sh), toon('#BFE8DC'))
  shallows.add(underwater)
  underTheReflection(shallows, bag)
  // The rock flour.
  const flour = new Group()
  const d1 = softDisc(FLOUR.r, 'rgba(196,238,232,0.72)', 'rgba(196,238,232,0)', bag)
  const d2 = softDisc(FLOUR.r * 0.55, 'rgba(226,248,244,0.55)', 'rgba(226,248,244,0)', bag)
  d2.position.y = 0.01
  flour.add(d1, d2)
  flour.position.set(FLOUR.x, 0.03, FLOUR.z)
  return { land, shallows, peaks, glacier, lodge, logs, stream, flour }
}

/** Something under the water (the pebbles, the pale shallows): drawn first and hiding nothing, so the reflection,
 *  which lies on the water's surface, shows over it right up to the shoreline instead of starting out in the lake. */
function underTheReflection(m: Mesh, bag: Bag) {
  const mat = bag.add((m.material as MeshToonMaterial).clone())
  mat.depthWrite = false
  m.material = mat
  m.renderOrder = -5
  return m
}

/** Keeps what's under the water (y ≤ 0): the mirror cuts off any part of its copy that would stick up out of the lake
 *  (the dock's posts, the boulders' bottoms, the mountains' roots); engine3d/renderer.ts turns local clipping on. */
export const UNDER_WATER = new Plane(new Vector3(0, -1, 0), 0)

/** A mirror image of `src` under the water (no ink lines: a reflection is soft; no grass, pebbles or bushes: too small
 *  to see in it), cut off at the water's surface. Its materials are copies (with the clipping) that go in `bag`. */
export function mirror(src: Group, bag: Bag) {
  const m = src.clone(true)
  m.scale.y = -1
  const drop: Object3D[] = []
  m.traverse((o) => {
    if (o.userData.hull !== undefined || o.userData.noMirror) drop.push(o)
  })
  for (const o of drop) o.removeFromParent()
  const clipped = new Map<Material, Material>()
  const clip = (mat: Material) => {
    let c = clipped.get(mat)
    if (!c) {
      c = bag.add(mat.clone())
      c.clippingPlanes = [UNDER_WATER]
      clipped.set(mat, c)
    }
    return c
  }
  m.traverse((o) => {
    const mesh = o as Mesh
    if (!mesh.isMesh) return
    // (The forest's trees reflect as their plainer shapes.)
    const lite = typeof o.userData.mirrorGeo === 'string' ? mirrorShape(o.userData.mirrorGeo) : undefined
    if (lite) mesh.geometry = lite
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(clip) : clip(mesh.material)
  })
  return m
}


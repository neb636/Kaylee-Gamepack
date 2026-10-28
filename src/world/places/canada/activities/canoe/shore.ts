// Red Canoe's lake: Moraine Lake in Banff, in the toon look. The pebble beach, the meadow and the spruce forest round
// the water; across from the dock the Valley of the Ten Peaks, a wall of jagged grey summits with snow in their gullies,
// and the glacier coming down from them to the water at the north end; lower forested mountains round the rest. The
// glacier stream tumbles into the north-west corner with its milky rock flour spreading on the lake. By the dock, the
// famous rock pile at the outlet (the pika's and the marmot's home) with the log jam in front of it; the beaver lodge on
// the west shore; a crag for the mountain goat on the north-east shore; the sky and its clouds. The world (paddle.ts)
// adds the water, the canoe and the animals.
//
// Everything above the water goes in `land`, so the world can mirror it under the see-through lake as its reflection.
import { BackSide, BufferGeometry, CanvasTexture, CircleGeometry, Color, Float32BufferAttribute, Group, Mesh, MeshBasicMaterial, SphereGeometry, Vector3, type Object3D } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../engine3d/geo'
import { toon } from '../../../../engine3d/toon'
import { FlowMaterial } from './flow'
import { CLIFF, DOCK, FLOUR, GLACIER, LAND, landY, LODGE, LOGJAM, MOUTH, ringPoint, ROCKPILE, SQUIRREL } from './lake'

export const SKY = '#C4E8FA'
const SPRUCE = ['#3F8E6E', '#4C9E78', '#357F63']
const ROCK = '#A9A1BA'
const ROCK_DARK = '#8C83A0'
const SNOW = '#FBFDFF'
const ICE_BLUE = '#9FD8EE'

/** A tiny repeatable random (the same lake every time). */
export function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** The ground round the lake: rings out from the shoreline, rising into the mountains (vertex colors, no outline). */
function buildLand(bag: Bag) {
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
    return { p: [p.x, y + jitter[j][i % N], p.z], c: c(color) }
  }
  for (let j = 0; j < LAND.length - 1; j++)
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
 *  row, each a sharp faceted spire with a smaller one at its shoulder, snow on the tops and in the gullies, little
 *  hanging glaciers between them and the big glacier coming down from the middle. Round the rest of the lake, lower
 *  mountains with forest up their sides and only a little snow. Returns each peak (for taps and snow puffs). */
function buildPeaks(bag: Bag) {
  const rand = rng(7)
  const group = new Group()
  const peaks: { mesh: Object3D; top: Vector3 }[] = []
  /** One jagged peak: a faceted spire (few sides, turned at random), a shoulder spire, darker rock on one face,
   *  a snow cap and streaks of snow down the gullies. */
  const spire = (th: number, k: number, r: number, h: number, snowy: number, rock: string, dark: string) => {
    const p = ringPoint(th, k)
    const y = landY(p.x, p.z) - 4
    const seg = 4 + Math.floor(rand() * 2)
    const lean = (rand() - 0.5) * 0.12
    const parts = [
      P.cone(r, h, rock, { at: [0, h / 2, 0], rot: [0, 0, lean] }, seg),
      P.cone(r * 0.66, h * 0.72, rock, { at: [r * 0.62, h * 0.36, r * 0.1], rot: [0, rand() * 2, -0.08] }, seg),
      P.cone(r * 0.58, h * 0.5, dark, { at: [-r * 0.35, h * 0.25, r * 0.38], rot: [0, rand() * 2, 0] }, 5),
      P.cone(r * 0.5, h * 0.42, dark, { at: [-r * 0.5, h * 0.21, -r * 0.3], rot: [0, rand() * 2, 0] }, 4),
    ]
    if (snowy > 0) {
      const cap = h * 0.3 * snowy
      parts.push(P.cone(r * (cap / h) * 1.06, cap, SNOW, { at: [Math.sin(lean) * -(h - cap / 2) * 0, h - cap / 2 + 0.1, 0], rot: [0, 0, lean] }, seg))
      const cap2 = h * 0.72 * 0.26 * snowy
      parts.push(P.cone(r * 0.66 * (cap2 / (h * 0.72)) * 1.06, cap2, SNOW, { at: [r * 0.62, h * 0.72 - cap2 / 2 + 0.1, r * 0.1] }, seg))
      // A band of snow lower down, where a ledge holds it (a thin ring hugging the spire).
      const yy = h * (0.42 + rand() * 0.1)
      parts.push(P.cyl(r * (1 - (yy + 1.2) / h) * 1.04, r * (1 - yy / h) * 1.05, 1.2, SNOW, { at: [0, yy + 0.6, 0], rot: [0, 0, lean] }, seg))
    }
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
    ten.push(spire(th, 2.3 + 0.12 * Math.sin(i * 1.7), 13 + rand() * 4, (52 + 12 * Math.sin(i * 2.3 + 0.5) + big + rand() * 5) * 0.9, 1, ROCK, ROCK_DARK))
  }
  // The wall between them (a long low ridge under the summits).
  const wall = []
  for (let i = 0; i < 9; i++) {
    const a = ten[i]
    const b = ten[i + 1]
    const mx = (a.x + b.x) / 2
    const mz = (a.z + b.z) / 2
    const my = (a.y + b.y) / 2
    const d = Math.hypot(b.x - a.x, b.z - a.z)
    wall.push(P.cone(d * 0.75, 30, ROCK_DARK, { at: [mx, my + 15, mz], scale: [1, 1, 0.55], rot: [0, Math.atan2(b.x - a.x, b.z - a.z) + Math.PI / 2, 0] }, 6))
  }
  group.add(solid(merge(wall), bag, 2))
  // The forested mountains round the south and west: lower, greener, a little snow on the highest.
  const n = 11
  for (let i = 0; i < n; i++) {
    const th = 0.78 + (i / (n - 1)) * 3.1
    const south = Math.max(0, Math.sin(th))
    const h = (34 + rand() * 26) * (1 - south * 0.3)
    spire(th, 2.15 + rand() * 0.7, 18 + rand() * 10, h, h > 42 ? 0.6 : 0, i % 2 ? '#8FA59A' : '#97A9A4', '#738C84')
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

/** Spruces round the lake on the meadow and the forest band (never on the beach, the glacier or the stream). */
function buildSpruces(bag: Bag) {
  const rand = rng(23)
  const parts = []
  for (let i = 0; i < 640; i++) {
    const th = rand() * Math.PI * 2
    const k = 1.09 + rand() ** 1.6 * 0.75
    const p = ringPoint(th, k)
    // Not on the glacier, its stream, the dock, the rock pile, the cliff or the squirrel's rock.
    if (Math.abs(p.x - GLACIER.x) < GLACIER.halfWidth + 4 && p.z < -40) continue
    if (Math.hypot(p.x - MOUTH.x, p.z - MOUTH.z) < 7 || (p.x < MOUTH.x + 4 && p.x > MOUTH.x - 16 && p.z < MOUTH.z + 2 && p.z > MOUTH.z - 30)) continue
    if (Math.hypot(p.x - DOCK.x, p.z - DOCK.z) < 7 || Math.hypot(p.x - ROCKPILE.x, p.z - ROCKPILE.z) < ROCKPILE.r + 1 || Math.hypot(p.x - SQUIRREL.x, p.z - SQUIRREL.z) < 4) continue
    if (Math.hypot(p.x - CLIFF.x, p.z - CLIFF.z) < 6) continue
    const y = landY(p.x, p.z)
    // Tall narrow spruces in three tiers, a few smaller ones among them.
    const h = (rand() < 0.2 ? 2.4 : 4) + rand() * 3.6
    const r = h * 0.24
    const c = SPRUCE[i % 3]
    parts.push(
      P.cyl(0.1, 0.14, 0.8, '#7E553E', { at: [p.x, y + 0.3, p.z] }, 5),
      P.cone(r, h * 0.48, c, { at: [p.x, y + 0.55 + h * 0.24, p.z] }, 7),
      P.cone(r * 0.78, h * 0.42, c, { at: [p.x, y + 0.55 + h * 0.5, p.z] }, 7),
      P.cone(r * 0.52, h * 0.36, c, { at: [p.x, y + 0.55 + h * 0.76, p.z] }, 7),
    )
  }
  return solid(merge(parts), bag, 1.4)
}

/** The glacier: a wide white ramp of ice from the big peak down to the water (narrowing as it climbs), cracked across
 *  with blue, ending in a blue ice cliff at the lake. */
function buildGlacier(bag: Bag) {
  const g = GLACIER
  // Side profiles (x: meters north of the cliff, y: up), pushed out across the lake's width, then turned to face south.
  const ramp = (w: number, lift: number, from: number, c: string) =>
    P.prism(
      [
        [from, 0],
        [from, 3.4 + lift],
        [46, 33 + lift],
        [58, 35 + lift],
        [58, 0],
      ],
      w,
      c,
      { at: [g.x, -0.6, g.z], rot: [0, Math.PI / 2, 0] },
    )
  const parts = [ramp(g.halfWidth * 2, 0, 0, '#D6EEF8'), ramp(g.halfWidth * 1.35, 0.6, 7, '#E9F6FB'), ramp(g.halfWidth * 0.7, 1.2, 17, SNOW)]
  // Blue cracks across it, lying on the slope; rocky ridges (moraines) down both sides.
  const slope = Math.atan2(29.6, 46)
  // (Crevasses bow downhill in the middle, the way the ice flows faster there: short tilted dashes in a curve.)
  const rand = rng(83)
  for (let i = 0; i < 6; i++) {
    const d = 6 + i * 6.4
    const w = g.halfWidth * 2 * (0.7 - i * 0.06)
    const lift = d > 17 ? 1.2 : d > 7 ? 0.6 : 0
    for (let j = 0; j < 5; j++) {
      const u = (j - 2) / 2.4
      const x = g.x + u * w * 0.5 + (rand() - 0.5) * 0.8
      const dd = d + (1 - u * u) * 2.2
      parts.push(P.rbox(w * (0.12 + rand() * 0.06), 0.14, 0.34, 0.06, ICE_BLUE, { at: [x, 2.8 + dd * Math.tan(slope) + lift + 0.05, g.z - dd], rot: [-slope, -u * 0.5, 0] }))
    }
  }
  // Seracs: jagged blocks of ice along the top of the cliff at the water.
  for (let i = 0; i < 9; i++) {
    const x = g.x + (i / 8 - 0.5) * g.halfWidth * 1.8
    const h = 1.4 + rand() * 1.6
    parts.push(P.cone(1.3 + rand() * 0.6, h, i % 2 ? '#E9F6FB' : '#CDEBF6', { at: [x, 3 + h / 2, g.z - 1.2 - rand()], rot: [0, rand() * 2, (rand() - 0.5) * 0.3] }, 4))
  }
  for (const side of [-1, 1])
    for (let i = 0; i < 8; i++) {
      const d = 2 + i * 6
      parts.push(P.sphere(2 + (i % 3) * 0.6, ROCK_DARK, { at: [g.x + side * (g.halfWidth + 0.6 - i * 0.35), 1 + d * Math.tan(slope) * 0.95, g.z - d], scale: [1, 0.6, 1.4] }, 7))
    }
  // The ice cliff at the water's edge: blocks of different heights, blue and pale.
  for (let i = 0; i < 7; i++) {
    const w = (g.halfWidth * 2.05) / 7
    const h = 3.2 + rand() * 1.4
    parts.push(P.rbox(w + 0.3, h, 2.4 + rand() * 0.6, 0.35, i % 2 ? ICE_BLUE : '#B7E3F3', { at: [g.x - g.halfWidth * 1.025 + w * (i + 0.5), h / 2 - 0.9, g.z + 0.4 + rand() * 0.4] }))
  }
  return solid(merge(parts), bag, 2)
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

/** A pile of rounded rocks (the pika's home; the squirrel's lookout). */
function rocks(at: { x: number; z: number }, n: number, size: number, seed: number, bag: Bag) {
  const rand = rng(seed)
  const parts = []
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2
    const r = rand() * size
    const s = size * (0.45 + rand() * 0.4)
    parts.push(P.sphere(s, i % 3 ? ROCK : ROCK_DARK, { at: [Math.cos(a) * r, s * 0.55 + (i > n * 0.6 ? s * 0.7 : 0), Math.sin(a) * r], scale: [1.2, 0.75, 1] }, 8))
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
    parts.push(P.sphere(s, i % 4 === 0 ? ROCK_DARK : i % 4 === 1 ? '#B8B1C6' : ROCK, { at: [x, pileY(x, z) - s * 0.35, z], rot: [rand(), rand() * 3, rand()], scale: [1.25, 0.7, 1] }, 6))
  }
  for (let i = 0; i < 5; i++) {
    const a = i * 1.3 + 0.4
    const d = 1.2 + i * 0.5
    const x = ROCKPILE.x + Math.cos(a) * d
    const z = ROCKPILE.z + Math.sin(a) * d - 1.5
    const y = pileY(x, z) - 0.2
    const h = 3 + rand() * 2.5
    parts.push(P.cyl(0.1, 0.14, 0.7, '#7E553E', { at: [x, y + 0.3, z] }, 5), P.cone(h * 0.24, h * 0.5, SPRUCE[i % 3], { at: [x, y + 0.5 + h * 0.25, z] }, 7), P.cone(h * 0.17, h * 0.42, SPRUCE[(i + 1) % 3], { at: [x, y + 0.5 + h * 0.6, z] }, 7))
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
    P.cone(6, h + 6, ROCK, { at: [1.5, (h + 6) / 2, -1.5] }, 5),
    P.cone(4.5, h * 0.85, ROCK_DARK, { at: [-2.5, (h * 0.85) / 2, 1.5] }, 4),
    P.cone(3.5, h * 0.7, ROCK, { at: [3, (h * 0.7) / 2, 2.8] }, 5),
    // The ledge, facing the lake, and the layers of rock across the face.
    P.rbox(3.2, 0.5, 2.2, 0.2, '#B8B1C6', { at: [-1.6, h, 2.2] }),
    P.rbox(5, 0.35, 0.8, 0.12, ROCK_DARK, { at: [0.5, h * 0.55, 3.2], rot: [0, -0.3, 0] }),
    P.rbox(4, 0.3, 0.7, 0.1, ROCK_DARK, { at: [1.2, h * 0.3, 3.6], rot: [0, 0.2, 0] }),
    P.cone(1.2, 3.2, SPRUCE[0], { at: [1.6, h + 2.4, 1], rot: [0, 0, 0.1] }, 7),
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

/** The glacier stream: down the mountainside from beside the glacier to its mouth in the lake. */
function buildStream(flow: FlowMaterial, bag: Bag) {
  const path = [
    { x: -34, z: -78 },
    { x: -31, z: -66 },
    { x: -29.5, z: -56 },
    { x: -26, z: -47 },
    { x: MOUTH.x, z: MOUTH.z },
    { x: MOUTH.x + 2.6, z: MOUTH.z + 3.2 },
  ]
  const pos: number[] = []
  const fl: number[] = []
  let along = 0
  for (let i = 0; i < path.length; i++) {
    const a = path[Math.max(0, i - 1)]
    const b = path[Math.min(path.length - 1, i + 1)]
    const dx = b.x - a.x
    const dz = b.z - a.z
    const l = Math.hypot(dx, dz)
    const w = i === path.length - 1 ? 3.2 : 1.4 + i * 0.25
    const nx = (-dz / l) * w
    const nz = (dx / l) * w
    const p = path[i]
    if (i) along += Math.hypot(p.x - path[i - 1].x, p.z - path[i - 1].z)
    const y = Math.max(0.06, landY(p.x, p.z) + 0.25)
    pos.push(p.x - nx, y, p.z - nz, p.x + nx, y, p.z + nz)
    fl.push(along, 0, along, 1)
  }
  const idx: number[] = []
  for (let i = 0; i < path.length - 1; i++) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2)
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('flow', new Float32BufferAttribute(fl, 2))
  g.setIndex(idx)
  const m = new Mesh(bag.add(g), flow.mat)
  // Boulders along it.
  const rand = rng(41)
  const parts = []
  for (let i = 0; i < 14; i++) {
    const p = path[1 + Math.floor(rand() * (path.length - 2))]
    const s = 0.5 + rand() * 0.8
    const side = rand() < 0.5 ? -1 : 1
    parts.push(P.sphere(s, ROCK, { at: [p.x + side * (2 + rand() * 1.5), landY(p.x, p.z) + s * 0.3, p.z + (rand() - 0.5) * 6], scale: [1.2, 0.7, 1] }, 7))
  }
  const g2 = new Group()
  g2.add(m, solid(merge(parts), bag, 1.8))
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
  stream: FlowMaterial
  /** The milky patch at the stream's mouth (two discs that turn slowly). */
  flour: Group
}

export function buildShore(bag: Bag): Shore {
  const land = new Group()
  const ground = buildLand(bag)
  land.add(ground)
  const { group: peakGroup, peaks } = buildPeaks(bag)
  land.add(peakGroup, buildSpruces(bag))
  const glacier = buildGlacier(bag)
  land.add(glacier)
  const stream = new FlowMaterial(bag, { deep: '#9EDCDA', light: '#D3F2EF', speed: 3.2, rows: 5 })
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
  // The rock flour.
  const flour = new Group()
  const d1 = softDisc(FLOUR.r, 'rgba(196,238,232,0.72)', 'rgba(196,238,232,0)', bag)
  const d2 = softDisc(FLOUR.r * 0.55, 'rgba(226,248,244,0.55)', 'rgba(226,248,244,0)', bag)
  d2.position.y = 0.01
  flour.add(d1, d2)
  flour.position.set(FLOUR.x, 0.03, FLOUR.z)
  return { land, shallows, peaks, glacier, lodge, logs, stream, flour }
}

/** A mirror image of `src` under the water (no ink lines: a reflection is soft). */
export function mirror(src: Group) {
  const m = src.clone(true)
  m.scale.y = -1
  const drop: Object3D[] = []
  m.traverse((o) => {
    if (o.userData.hull !== undefined) drop.push(o)
  })
  for (const o of drop) o.removeFromParent()
  return m
}


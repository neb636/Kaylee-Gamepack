// Mountain Bike's mountain, built from the course (trail.ts) in the toon look: Mont-Sainte-Anne in the fall, the
// St. Lawrence and its island far below, the hills beyond. Each piece is one merged mesh (or a few, by stretch of
// trail, so the ones behind the camera aren't drawn):
//
// - the land: one height field from the summit to the far shore, painted by what's there (grass by the trail, the
//   forest floor, ski runs, the patchwork of long narrow fields along the river), the fall forest in a quilt of
//   reds, oranges, golds and spruce green where the trees are too far to build one by one
// - the trail: a ribbon of packed dirt with a worn middle line, leaves fallen on it, banked berms, roots, rocks, the
//   wooden kicker, grassy shoulders and the mossy island between the two ways
// - the forest: thousands of spruces, maples and birches, outlined near the trail; ferns, mushrooms and boulders
// - the gondola: towers, cables, both stations and the cabins going up and down (a pool of cabins placed nearest the
//   camera, each swinging on its grip)
// - running water (the creek across the trail, the waterfall at the bottom) with its own little shader
// - the sky dome, clouds, and three layers of far hills
import { BackSide, BufferAttribute, BufferGeometry, CircleGeometry, Color, DoubleSide, DynamicDrawUsage, Euler, InstancedMesh, Matrix4, Quaternion, Float32BufferAttribute, Group, Mesh, MeshBasicMaterial, ShaderMaterial, SphereGeometry, TorusGeometry, UniformsLib, UniformsUtils, Vector3, type ColorRepresentation } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid, type V3 } from '../../../../engine3d/geo'
import { PAL, toon } from '../../../../engine3d/toon'
import { Water } from '../../../../engine3d/water'
import { BRIDGE_HALF, CLIFF, Course, CREEK, CREEK_END, END, FALLS, GREEN_END, half, inCreek, island, JUMP, onKicker, POOL, RIB, ROCKS, ROOTS, SPLIT, START, STATION } from './trail'

export const SKY = '#E6EEFB'
const SKY_TOP = '#8CC8F2'

/** A deterministic random. */
export function rng(seed: number) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}
const smooth = (k: number) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k))
const hash = (x: number, z: number) => {
  const v = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return v - Math.floor(v)
}

/** The fall forest's colors. */
export const FALL = { red: '#E8553F', scarlet: '#D9443A', orange: '#F2873A', gold: '#F5B83D', yellow: '#F6D45A' }
const SPRUCE = ['#3F8F63', '#4FA474', '#2F7D58', '#46986A']
const MAPLES = [FALL.red, FALL.orange, FALL.scarlet, FALL.gold, FALL.orange, FALL.red]

// ---------------------------------------------------------------- the land

/** Ski runs down the mountain's face: x at the summit, how far they wander, from and to z. */
const RUNS: [number, number, number, number][] = [
  [-150, 18, -40, -720],
  [-290, 26, -80, -640],
  [170, 20, -60, -700],
  [320, 30, -120, -600],
]
const runX = (r: [number, number, number, number], z: number) => r[0] + r[1] * Math.sin(z / 70) - z * 0.05 * Math.sign(r[0])
export function onRun(x: number, z: number, pad = 0) {
  for (const r of RUNS) if (z < r[2] && z > r[3] && Math.abs(x - runX(r, z)) < 12 + pad) return true
  return false
}

/** Coordinates of the land's grid: fine near the course, coarser and coarser outward. */
function axis(lo: number, hi: number, fine: [number, number], step: number, max: number) {
  const out: number[] = []
  for (let v = fine[0]; v <= fine[1] + 1e-6; v += step) out.push(v)
  let d = step
  for (let v = fine[0]; v > lo; ) {
    d = Math.min(max, d * 1.18)
    v -= d
    out.unshift(Math.max(lo, v))
  }
  d = step
  for (let v = fine[1]; v < hi; ) {
    d = Math.min(max, d * 1.18)
    v += d
    out.push(Math.min(hi, v))
  }
  return out
}

export function buildLand(course: Course, gondolaNear: (x: number, z: number, pad: number) => boolean, bag: Bag) {
  const t = course.trail
  const zEnd = t.spot(END, 0).z
  const xs = axis(-1600, 1600, [-140, 140], 3, 80)
  const zs = axis(-2400, 600, [zEnd - 120, 70], 3, 80).reverse()
  const nx = xs.length
  const nz = zs.length
  const pos = new Float32Array(nx * nz * 3)
  const col = new Float32Array(nx * nz * 3)
  const c = new Color()
  const grass = new Color('#A3D67E')
  const floor = new Color('#7DB86C')
  const runC = new Color('#BDE39A')
  const fields = ['#C9E28A', '#E9D77A', '#A9D57F', '#DCC27A', '#B9DB8A', '#E3E59A'].map((h) => new Color(h))
  const quilt = [new Color('#4E9A63'), new Color(FALL.red), new Color(FALL.orange), new Color('#3F8F63'), new Color(FALL.gold), new Color('#5DA86E')]
  const sand = new Color('#E9DCB4')
  const rock = new Color('#A49CB4')
  let hint: number | undefined
  for (let j = 0; j < nz; j++) {
    const z = zs[j]
    const cxz = t.xAtZ(z)
    for (let i = 0; i < nx; i++) {
      const x = xs[i]
      const k = (j * nx + i) * 3
      const near = Math.abs(x - cxz) < 60
      const loc = near ? t.locate(x, z, hint) : null
      if (loc && near) hint = loc.s
      const y = near ? course.land(x, z, loc!.s) : course.landFar(x, z)
      pos[k] = x
      pos[k + 1] = y
      pos[k + 2] = z
      // What's here: the trail's grassy sides, the forest floor, a ski run, the fields, the shore, the fall quilt.
      const d = loc ? Math.abs(loc.lat) - half(loc.s) : Math.abs(x - cxz)
      const n = hash(Math.floor(x / 9), Math.floor(z / 9))
      if (y < 0.2) c.copy(sand)
      else if (course.cliffAt(x, z)) c.copy(rock)
      else if (y < 6 && z < zEnd - 30) c.copy(fields[Math.floor(hash(Math.floor((x + 0.35 * z) / 22), 3) * fields.length)])
      else if (gondolaNear(x, z, 0) || onRun(x, z)) c.copy(runC)
      else if (d < RIB + 10) c.copy(grass).lerp(floor, smooth((d - RIB) / 10))
      else if (Math.abs(x - cxz) < 140) c.copy(floor).lerp(quilt[Math.floor(n * 6)], 0.18)
      else {
        // Far away, the forest is a quilt of fall colors.
        const q = Math.sin(x / 61 + z / 83) * Math.sin(x / 43 - z / 71) + 0.4 * Math.sin((x + z) / 37)
        c.copy(quilt[Math.min(5, Math.floor(((q + 1.4) / 2.8) * 6))])
      }
      col[k] = c.r
      col[k + 1] = c.g
      col[k + 2] = c.b
    }
    hint = undefined
  }
  const idx: number[] = []
  for (let j = 0; j < nz - 1; j++)
    for (let i = 0; i < nx - 1; i++) {
      const a = j * nx + i
      const b = a + 1
      const d = a + nx
      const e = d + 1
      // (Counter-clockwise from above: rows run toward -z, columns toward +x.)
      idx.push(a, b, d, b, e, d)
    }
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(pos, 3))
  geo.setAttribute('color', new BufferAttribute(col, 3))
  geo.setIndex(idx)
  geo.computeVertexNormals()
  bag.add(geo)
  return new Mesh(geo, toon('#ffffff', true))
}

// ---------------------------------------------------------------- the trail

/** Columns across the ribbon: 16 across the rideable trail each side (as a share of its width), then the shoulder. */
const UCOLS = (() => {
  const out: number[] = []
  for (let i = -16; i <= 16; i++) out.push(i / 16)
  for (const e of [0.4, 0.9, 1.6, 2.6, RIB]) {
    out.push(1 + e / 10)
    out.unshift(-1 - e / 10)
  }
  return out
})()
const colLat = (u: number, hw: number) => (Math.abs(u) <= 1 ? u * hw : Math.sign(u) * (hw + (Math.abs(u) - 1) * 10))

export function buildTrail(course: Course, bag: Bag) {
  const t = course.trail
  const rows: number[] = []
  for (let s = START - 6; s < END + 6; s += 0.5) rows.push(s)
  // Sharp enough at the roots, the rocks' and the kicker's lips, the creek's banks.
  for (const r of ROOTS) rows.push(r - 0.2, r, r + 0.2)
  for (const [rs, len] of ROCKS) rows.push(rs + len - 0.04, rs + len + 0.04)
  rows.push(JUMP.s + JUMP.len - 0.04, JUMP.s + JUMP.len + 0.04)
  rows.sort((a, b) => a - b)
  const nc = UCOLS.length
  const nr = rows.length
  const pos = new Float32Array(nr * nc * 3)
  const col = new Float32Array(nr * nc * 3)
  const c = new Color()
  const dirt = new Color('#C99A6E')
  const worn = new Color('#DDB58C')
  const rut = new Color('#B78656')
  const berm = new Color('#C58459')
  const grass = new Color('#A3D67E')
  const moss = new Color('#8CCB78')
  const wood = new Color('#E2B27A')
  const plank = new Color('#C48F5A')
  const root = new Color('#7A5238')
  const stone = new Color('#A9A1BA')
  const bed = new Color('#8FA9B8')
  const p = { x: 0, z: 0 }
  for (let i = 0; i < nr; i++) {
    const s = rows[i]
    const hw = half(s)
    const r = island(s)
    const bk = Math.abs(course.bankAt(s))
    for (let j = 0; j < nc; j++) {
      const u = UCOLS[j]
      const lat = colLat(u, hw)
      const k = (i * nc + j) * 3
      t.spot(s, lat, p)
      pos[k] = p.x
      // (The outermost edge tucks down under the land, so there's no step where they meet.)
      pos[k + 1] = course.ground(s, lat) - (j === 0 || j === nc - 1 ? 0.75 : 0)
      pos[k + 2] = p.z
      const a = Math.abs(lat)
      // Which way she's on, and where in it (0 = the middle of the way).
      const mid = r > 0 ? Math.sign(lat) * (r + (hw - r) / 2) : 0
      const w = r > 0 ? (hw - r) / 2 : hw
      const v = Math.abs(lat - mid) / w
      if (a > hw + 0.05 || (s > CREEK_END && a > 3.1)) c.copy(grass)
      else if (r > 0 && a < r) c.copy(moss)
      else if (onKicker(s, lat)) c.copy(((s - JUMP.s) % 0.6) < 0.08 ? plank : wood)
      else if (inCreek(s) && lat > -0.2) c.copy(bed)
      else if (ROOTS.some((rs) => Math.abs(s - rs) < 0.22) && r > 0 && lat > r) c.copy(root)
      else if (ROCKS.some(([rs, len]) => s >= rs && s < rs + len) && r > 0 && lat > r) c.copy(stone)
      else {
        // Packed dirt: a worn line down the middle, the tire ruts, redder up the berms, and fallen leaves.
        c.copy(v < 0.18 ? worn : v > 0.5 && v < 0.62 ? rut : dirt)
        if (bk > 0.18 && v > 0.55) c.lerp(berm, smooth((bk - 0.18) / 0.15))
        // Faint bands every 6 m: they stream past, so speed reads.
        if (((s % 6) + 6) % 6 < 0.5 && v < 0.9) c.multiplyScalar(0.94)
      }
      col[k] = c.r
      col[k + 1] = c.g
      col[k + 2] = c.b
    }
  }
  const idx: number[] = []
  for (let i = 0; i < nr - 1; i++)
    for (let j = 0; j < nc - 1; j++) {
      const a = i * nc + j
      const b = a + 1
      const d = a + nc
      const e = d + 1
      // (Counter-clockwise from above: the trail heads -z, columns run toward +x.)
      idx.push(a, b, d, b, e, d)
    }
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(pos, 3))
  geo.setAttribute('color', new BufferAttribute(col, 3))
  geo.setIndex(idx)
  geo.computeVertexNormals()
  bag.add(geo)
  return new Mesh(geo, toon('#ffffff', true))
}

/** Fallen leaves lying all over the trail and its shoulders: one instanced mesh of little flat diamonds. */
export function buildFallen(course: Course, bag: Bag) {
  const t = course.trail
  const r = rng(19)
  const N = 5200
  const geo = bag.add(new CircleGeometry(0.13, 4).rotateX(-Math.PI / 2).scale(1, 1, 1.6))
  const mat = toon('#ffffff')
  const m = bag.add(new InstancedMesh(geo, mat, N))
  m.instanceMatrix.setUsage(DynamicDrawUsage)
  const mtx = new Matrix4()
  const q = new Quaternion()
  const e = new Euler()
  const pos = new Vector3()
  const scl = new Vector3()
  const colors = [FALL.red, FALL.orange, FALL.gold, FALL.scarlet, FALL.yellow, '#C9763F'].map((h) => new Color(h))
  const sp = { x: 0, z: 0 }
  let n = 0
  for (let i = 0; i < N; i++) {
    const s = START + r() * (END + 4 - START)
    const hw = half(s)
    // More along the edges and on the shoulders, fewer down the worn middle.
    const u = r() < 0.65 ? (0.55 + r() * 0.75) * (r() < 0.5 ? -1 : 1) : (r() - 0.5) * 1.1
    const lat = u * (hw + 1.4)
    if (onKicker(s, lat) || (inCreek(s) && lat > -0.4)) continue
    t.spot(s, lat, sp)
    const y = course.ground(s, lat) + 0.04
    const tilt = Math.atan((course.ground(s, lat + 0.3) - course.ground(s, lat - 0.3)) / 0.6)
    e.set(0, r() * Math.PI * 2, 0)
    q.setFromEuler(e)
    q.premultiply(new Quaternion().setFromAxisAngle(new Vector3(Math.sin(t.heading(s)), 0, -Math.cos(t.heading(s))), tilt))
    const k = 0.7 + r() * 0.7
    mtx.compose(pos.set(sp.x, y, sp.z), q, scl.set(k, 1, k))
    m.setMatrixAt(n, mtx)
    m.setColorAt(n, colors[Math.floor(r() * colors.length)])
    n++
  }
  m.count = n
  m.instanceMatrix.needsUpdate = true
  return m
}

// ---------------------------------------------------------------- the forest

export interface TreeSpot {
  x: number
  y: number
  z: number
  kind: 'spruce' | 'maple' | 'birch'
  size: number
  color: string
}

function tree(tr: TreeSpot, near: boolean, r: () => number) {
  const { x, y, z, size: s } = tr
  const seg = near ? 8 : 5
  if (tr.kind === 'spruce') {
    const g = SPRUCE[Math.floor(r() * SPRUCE.length)]
    const g2 = SPRUCE[Math.floor(r() * SPRUCE.length)]
    if (!near) return [P.cone(1.4 * s, 4.6 * s, g, { at: [x, y + 2.6 * s, z] }, seg), P.cone(0.9 * s, 2.2 * s, g2, { at: [x, y + 4.6 * s, z] }, seg)]
    return [
      P.cyl(0.13 * s, 0.18 * s, 1.3 * s, '#8A5E44', { at: [x, y + 0.6 * s, z] }, 6),
      P.cone(1.35 * s, 2.3 * s, g, { at: [x, y + 2.1 * s, z] }, seg),
      P.cone(1.05 * s, 2 * s, g2, { at: [x, y + 3.2 * s, z] }, seg),
      P.cone(0.72 * s, 1.7 * s, g, { at: [x, y + 4.2 * s, z] }, seg),
    ]
  }
  if (tr.kind === 'birch') {
    const yl = r() < 0.6 ? FALL.yellow : FALL.gold
    if (!near) return [P.cyl(0.1 * s, 0.12 * s, 2.6 * s, '#F4F0EA', { at: [x, y + 1.3 * s, z] }, 4), P.sphere(1.2 * s, yl, { at: [x, y + 3.3 * s, z], scale: [0.85, 1.2, 0.85] }, seg)]
    return [
      P.cyl(0.09 * s, 0.12 * s, 3.4 * s, '#F7F3EE', { at: [x, y + 1.7 * s, z] }, 6),
      ...[0.8, 1.6, 2.4].map((h) => P.box(0.2 * s, 0.05 * s, 0.05 * s, '#4A4058', { at: [x + 0.05 * s, y + h * s, z + 0.08 * s], rot: [0, r() * 3, 0.1] })),
      P.sphere(0.95 * s, yl, { at: [x, y + 3.6 * s, z], scale: [0.9, 1.15, 0.9] }, seg),
      P.sphere(0.7 * s, r() < 0.5 ? FALL.gold : FALL.yellow, { at: [x + 0.5 * s, y + 3 * s, z + 0.2 * s] }, seg),
    ]
  }
  const m = tr.color
  if (!near) return [P.sphere(1.7 * s, m, { at: [x, y + 2.6 * s, z], scale: [1, 0.95, 1] }, seg)]
  const m2 = MAPLES[Math.floor(r() * MAPLES.length)]
  return [
    P.cyl(0.14 * s, 0.2 * s, 2 * s, '#7E553E', { at: [x, y + 1 * s, z] }, 6),
    P.sphere(1.35 * s, m, { at: [x, y + 2.7 * s, z] }, 7),
    P.sphere(1 * s, m2, { at: [x + 0.75 * s, y + 3.2 * s, z + 0.25 * s] }, 7),
    P.sphere(0.9 * s, m, { at: [x - 0.6 * s, y + 3.3 * s, z - 0.35 * s] }, 7),
  ]
}

/** Little things on the forest floor by the trail: a fern, a red mushroom, a mossy boulder, a fallen log. */
function floorThing(x: number, y: number, z: number, r: () => number) {
  const k = r()
  if (k < 0.4) {
    const g = r() < 0.5 ? '#6CBF6A' : '#5DAF62'
    return [0, 1, 2, 3, 4].map((i) => P.cone(0.12, 0.9, g, { at: [x + Math.sin(i * 1.3) * 0.25, y + 0.3, z + Math.cos(i * 1.3) * 0.25], rot: [Math.cos(i * 1.3) * 0.8, 0, -Math.sin(i * 1.3) * 0.8], scale: [1, 1, 0.35] }, 5))
  }
  if (k < 0.62) {
    const a = r() * 0.3
    return [P.cyl(0.05, 0.06, 0.22, '#FFF7F0', { at: [x, y + 0.11, z] }, 6), P.sphere(0.16, '#E8553F', { at: [x, y + 0.24, z], scale: [1, 0.6, 1] }, 8), P.sphere(0.035, '#FFFFFF', { at: [x + 0.07, y + 0.32, z + 0.03 + a * 0.1] }, 5), P.sphere(0.03, '#FFFFFF', { at: [x - 0.06, y + 0.31, z - 0.05] }, 5)]
  }
  if (k < 0.85) {
    const rr = 0.4 + r() * 0.7
    return [P.sphere(rr, r() < 0.5 ? '#ABA3BC' : '#9A92AE', { at: [x, y + rr * 0.35, z], scale: [1.3, 0.75, 1], rot: [0, r() * 3, 0] }, 7), P.sphere(rr * 0.6, '#8CCB78', { at: [x, y + rr * 0.75, z], scale: [1.3, 0.35, 1] }, 6)]
  }
  return [P.cyl(0.22, 0.25, 2.6, '#9A6B4F', { at: [x, y + 0.2, z], rot: [0, r() * 3, Math.PI / 2] }, 8)]
}

export interface Forest {
  group: Group
  /** Trees close enough to the trail to poke, by chunk (for the taps). */
  meshes: Group[]
  trees: TreeSpot[]
}

/** Thousands of trees on the mountain: built in chunks along the trail (the far ones plainer, without outlines). */
export function buildForest(course: Course, keepOut: (x: number, z: number) => boolean, bag: Bag): Forest {
  const t = course.trail
  const r = rng(41)
  const zTop = 46
  const zEnd = t.spot(END + 40, 0).z
  const CHUNK = 110
  const nearParts = new Map<number, BufferGeometry[]>()
  const farParts = new Map<number, BufferGeometry[]>()
  const trees: TreeSpot[] = []
  const put = (map: Map<number, BufferGeometry[]>, key: number, parts: BufferGeometry[]) => {
    let list = map.get(key)
    if (!list) map.set(key, (list = []))
    list.push(...parts)
  }
  const pick = (near: boolean): TreeSpot['kind'] => {
    const k = r()
    return k < (near ? 0.42 : 0.55) ? 'spruce' : k < (near ? 0.8 : 0.88) ? 'maple' : 'birch'
  }
  let hint: number | undefined
  for (let z = zTop; z > zEnd; z -= 4.2) {
    const cxz = t.xAtZ(z)
    hint = undefined
    for (let x = cxz - 150; x < cxz + 150; x += 4.2) {
      const px = x + (r() - 0.5) * 3.4
      const pz = z + (r() - 0.5) * 3.4
      const loc = t.locate(px, pz, hint)
      hint = loc.s
      const hw = half(loc.s)
      const d = Math.abs(loc.lat) - hw
      const inIsland = island(loc.s) > 1.8 && Math.abs(loc.lat) < island(loc.s) - 1.2
      const near = d < 20 && loc.s > START - 10 && loc.s < END + 30
      if (!near && r() < 0.62) continue
      if (!inIsland && d < 3.4 && loc.s > START - 8 && loc.s < FALLS + 4) continue
      // The island gets ferns, mushrooms and mossy rocks, nothing tall: the camera rides low beside it.
      if (inIsland) {
        if (r() < 0.5) put(nearParts, Math.floor(-pz / CHUNK), floorThing(px, course.ground(loc.s, loc.lat), pz, r))
        continue
      }
      if (keepOut(px, pz)) continue
      const y = course.land(px, pz, loc.s)
      if (y < 1) continue
      const key = Math.floor(-pz / CHUNK)
      const kind = inIsland ? 'spruce' : pick(near)
      const size = inIsland ? 0.4 + r() * 0.2 : 0.75 + r() * 0.55 + (near ? 0 : 0.2)
      const spot: TreeSpot = { x: px, y, z: pz, kind, size, color: MAPLES[Math.floor(r() * MAPLES.length)] }
      put(near ? nearParts : farParts, key, tree(spot, near, r))
      if (near) trees.push(spot)
      // Ferns, mushrooms, boulders and logs between the trail and the trees.
      if (near && d > 2.2 && d < 7 && r() < 0.5) {
        const fx = px + (r() - 0.5) * 2
        const fz = pz + (r() - 0.5) * 2
        const fl = t.locate(fx, fz, loc.s)
        if (Math.abs(fl.lat) - half(fl.s) > 2.1 && !keepOut(fx, fz)) put(nearParts, key, floorThing(fx, course.land(fx, fz, fl.s), fz, r))
      }
    }
  }
  const group = new Group()
  const meshes: Group[] = []
  for (const [, parts] of nearParts) {
    const g = solid(merge(parts), bag, 1.6)
    group.add(g)
    meshes.push(g)
  }
  for (const [, parts] of farParts) group.add(solid(merge(parts), bag, 0))
  return { group, meshes, trees }
}

// ---------------------------------------------------------------- running water

const flowVertex = /* glsl */ `
  #include <fog_pars_vertex>
  attribute vec2 flow;
  varying vec2 vFlow;
  void main() {
    vFlow = flow;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`
const flowFragment = /* glsl */ `
  #include <fog_pars_fragment>
  uniform vec3 uDeep;
  uniform vec3 uLight;
  uniform vec3 uFoam;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uRows;
  uniform float uAlong;
  varying vec2 vFlow;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    // Two flat bands that wobble, white dashes streaming along, foam along both banks.
    float band = sin(vFlow.x * 0.7 - uTime * uSpeed * 0.6 + sin(vFlow.y * 6.0) * 0.8);
    vec3 col = band > 0.35 ? uLight : uDeep;
    vec2 q = vec2(vFlow.y * uRows, vFlow.x * uAlong - uTime * uSpeed * uAlong);
    vec2 cell = floor(q);
    vec2 f = fract(q);
    float dash = step(0.62, hash(cell)) * step(0.3, f.x) * step(f.x, 0.7) * step(0.15, f.y) * step(f.y, 0.75);
    col = mix(col, uFoam, dash * 0.85);
    float edge = 1.0 - smoothstep(0.0, 0.14, min(vFlow.y, 1.0 - vFlow.y));
    col = mix(col, uFoam, edge * 0.75);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`

export class FlowMaterial {
  readonly mat: ShaderMaterial
  constructor(bag: Bag, o: { deep: ColorRepresentation; light: ColorRepresentation; speed: number; rows: number; along?: number }) {
    this.mat = bag.add(
      new ShaderMaterial({
        uniforms: UniformsUtils.merge([
          UniformsLib.fog,
          { uDeep: { value: new Color(o.deep) }, uLight: { value: new Color(o.light) }, uFoam: { value: new Color('#FFFFFF') }, uTime: { value: 0 }, uSpeed: { value: o.speed }, uRows: { value: o.rows }, uAlong: { value: o.along ?? 0.8 } },
        ]),
        vertexShader: flowVertex,
        fragmentShader: flowFragment,
        fog: true,
        side: DoubleSide,
      }),
    )
  }
  update(t: number) {
    this.mat.uniforms.uTime.value = t
  }
}

/** A strip of running water through points (left and right bank each), with how far along each row is. */
function strip(rows: { l: Vector3; r: Vector3; along: number }[], bag: Bag) {
  const pos: number[] = []
  const flow: number[] = []
  for (const row of rows) {
    pos.push(row.l.x, row.l.y, row.l.z, row.r.x, row.r.y, row.r.z)
    flow.push(row.along, 0, row.along, 1)
  }
  const idx: number[] = []
  for (let i = 0; i < rows.length - 1; i++) {
    const a = i * 2
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
  }
  const geo = new BufferGeometry()
  geo.setAttribute('position', new Float32BufferAttribute(pos, 3))
  geo.setAttribute('flow', new Float32BufferAttribute(flow, 2))
  geo.setIndex(idx)
  return bag.add(geo)
}

/** The creek across the mountain: down its gully, under the bridge and through the ford. */
export function buildCreek(course: Course, mat: FlowMaterial, bag: Bag) {
  const c = course.creekLine()
  const rows: { l: Vector3; r: Vector3; along: number }[] = []
  let last = Infinity
  for (let along = -120; along <= 120; along += 2) {
    const wig = 5 * Math.sin(along / 19) * smooth((Math.abs(along) - 10) / 20)
    const x = c.x + c.nx * along + c.tx * wig
    const z = c.z + c.nz * along + c.tz * wig
    // Never uphill: the water only ever runs down (or level across the trail).
    const y = Math.min(last, Math.abs(along) < 8 ? course.creekY : course.land(x, z) + 0.42)
    last = y
    const w = Math.abs(along) < 8 ? CREEK.w / 2 + 0.3 : 2.1
    rows.push({ l: new Vector3(x - c.tx * w, y, z - c.tz * w), r: new Vector3(x + c.tx * w, y, z + c.tz * w), along })
  }
  return new Mesh(strip(rows, bag), mat.mat)
}

/** The waterfall pouring over the cliff into the pool, and the stream along the top that feeds it. */
export function buildFalls(course: Course, mat: FlowMaterial, top: FlowMaterial, bag: Bag) {
  const t = course.trail
  const lat = POOL.lat - 1
  const a = t.heading(FALLS)
  const nx = Math.cos(a)
  const nz = Math.sin(a)
  const g = new Group()
  const rows: { l: Vector3; r: Vector3; along: number }[] = []
  const hi = course.meadowY + CLIFF + 0.25
  const lo = course.poolY + 0.05
  const W = 3
  for (let i = 0; i <= 16; i++) {
    const k = i / 16
    // Out over the lip, then straight down, flaring a little at the bottom.
    const s = FALLS - 1.2 - 1.4 * Math.sin(Math.min(1, k * 3) * Math.PI * 0.5) - k * 0.5
    const p = t.spot(s, lat)
    const y = hi + (lo - hi) * k ** 1.2
    const w = W * (1 + k * 0.35)
    rows.push({ l: new Vector3(p.x - nx * w, y, p.z - nz * w), r: new Vector3(p.x + nx * w, y, p.z + nz * w), along: k * (hi - lo) })
  }
  g.add(new Mesh(strip(rows, bag), mat.mat))
  // The rock face: big boulders stacked up the cliff, mossy on top, a notch where the water pours.
  const r = rng(23)
  const rocks: BufferGeometry[] = []
  const greys = ['#A49CB4', '#958DA8', '#B1AABF', '#8C84A0']
  for (let l = -24; l <= 24; l += 2.6) {
    const notch = Math.abs(l - lat) < W + 0.6
    const tall = CLIFF * (1 - smooth((Math.abs(l) - 12) / 12)) + 1
    for (let y = 0; y < tall; y += 2.4 + r() * 1.2) {
      const sz = 2.2 + r() * 1.8
      const s0 = FALLS + (notch ? 1.6 : -0.6 + r() * 0.8) + (y / CLIFF) * 0.6
      const p = t.spot(s0, l + (r() - 0.5) * 1.2)
      rocks.push(P.rbox(sz * 1.3, sz, sz, sz * 0.25, greys[Math.floor(r() * 4)], { at: [p.x, course.meadowY - 0.6 + y + sz * 0.4, p.z], rot: [r() * 0.3, -a + (r() - 0.5) * 0.5, r() * 0.3] }))
    }
    const p = t.spot(FALLS + 1.5, l)
    if (!notch) rocks.push(P.sphere(2.2, '#8CCB78', { at: [p.x, course.meadowY + tall + 0.2, p.z], scale: [1.4, 0.45, 1.3] }, 8))
  }
  g.add(solid(merge(rocks), bag, 2))
  const back: { l: Vector3; r: Vector3; along: number }[] = []
  for (let i = 0; i <= 12; i++) {
    const s = FALLS + 34 - i * 2.8 - (i === 12 ? 2.2 : 0)
    const p = t.spot(s, lat + 1.8 * Math.sin(i * 0.7))
    back.push({ l: new Vector3(p.x - nx * W, hi, p.z - nz * W), r: new Vector3(p.x + nx * W, hi, p.z + nz * W), along: i * 2.8 })
  }
  g.add(new Mesh(strip(back, bag), top.mat))
  return g
}

/** A round pond of the shared water (engine3d/water.ts, cut to a circle). */
export function roundWater(r: number, y: number, at: { x: number; z: number }, bag: Bag) {
  const w = new Water({ size: 2, deep: '#5FA6DE', shallow: '#86C4EC', haze: SKY, hazeNear: 160, hazeFar: 1500 }, bag)
  w.mesh.geometry = bag.add(new CircleGeometry(r, 40))
  w.mesh.position.set(at.x, y, at.z)
  return w
}

// ---------------------------------------------------------------- the gondola

const CAB_COLORS = [PAL.pink, PAL.mint, PAL.lavender, PAL.butter, PAL.sky, PAL.peach]
/** From the cable down to the cabin's floor (m). */
export const HANG = 3.7
const SPACING = 46
const SPEED = 5
const POOL_N = 12

export interface Cabin {
  /** At the grip on the cable. */
  root: Group
  /** Swings round the grip. */
  swing: Group
  color: number
  /** Which slot it's showing (-1: none). */
  slot: number
}

/** A cabin: the grip and hanger, an open cabin with a roof, its color's lower half. */
function cabinShape(color: string, bag: Bag) {
  const g = new Group()
  const roofY = -1.36
  const roofHeight = 0.3
  const rimY = -HANG + 0.84
  // Sink each support into both the rim and the roof, so the cabin stays joined from every angle.
  const postBottom = rimY - 0.05
  const postTop = roofY - roofHeight / 2 + 0.05
  const post = (x: number, z: number) => P.cyl(0.05, 0.05, postTop - postBottom, '#FFFFFF', { at: [x, (postTop + postBottom) / 2, z] }, 6)
  g.add(
    solid(
      merge([
        P.rbox(0.35, 0.3, 0.6, 0.06, PAL.ink, { at: [0, 0, 0] }),
        P.cyl(0.05, 0.05, 1.2, '#BFB8CC', { at: [0, -0.6, 0] }, 6),
        P.rbox(0.9, 0.12, 0.3, 0.04, '#BFB8CC', { at: [0, -1.2, 0] }),
        P.rbox(2.4, roofHeight, 2.2, 0.12, '#FFFFFF', { at: [0, roofY, 0] }),
        P.rbox(2.2, 0.85, 2.0, 0.14, color, { at: [0, -HANG + 0.42, 0] }),
        P.rbox(2.24, 0.1, 2.04, 0.04, '#FFFFFF', { at: [0, rimY, 0] }),
        post(1.02, 0.92),
        post(-1.02, 0.92),
        post(1.02, -0.92),
        post(-1.02, -0.92),
      ]),
      bag,
      2,
    ),
  )
  return g
}

/** The gondola: from the bottom station by the meadow up to the top station beside the trail's start. */
export class Gondola {
  readonly group = new Group()
  /** Each line's points, bottom to top (up: the cabins climb it; down: they come back down). */
  readonly up: Vector3[] = []
  readonly down: Vector3[] = []
  private upLen: number[] = [0]
  private downLen: number[] = [0]
  readonly length: number
  readonly cabins: Cabin[] = []
  /** Maple's own cabin (in the gondola ride). */
  readonly hers: Cabin
  private swings: { a: number; v: number; b: number; bv: number }[] = []
  readonly top: Vector3
  readonly bottom: Vector3
  private tmp = new Vector3()

  constructor(
    private course: Course,
    bag: Bag,
  ) {
    const t = course.trail
    const st = course.station
    const a = t.heading(STATION.s)
    // The top bullwheel inside the station, toward its far end; the bottom station off to the left of the meadow.
    this.top = new Vector3(st.x + Math.cos(a) * 5, 0, st.z + Math.sin(a) * 5)
    const end = t.spot(END - 20, -46)
    this.bottom = new Vector3(end.x, 0, end.z)
    this.top.y = course.land(this.top.x, this.top.z) + 5.5
    this.bottom.y = course.land(this.bottom.x, this.bottom.z) + 5.5
    // Towers along the line: tall enough to keep the cable well over the trees.
    const dir = new Vector3().subVectors(this.top, this.bottom)
    const flat = Math.hypot(dir.x, dir.z)
    const side = new Vector3(dir.z / flat, 0, -dir.x / flat)
    const N = Math.round(flat / 70)
    const tops: Vector3[] = [this.bottom.clone()]
    const towerParts: BufferGeometry[] = []
    for (let i = 1; i < N; i++) {
      // (Never standing on the trail: nudged along the line till it's clear.)
      let k = i / N
      for (let j = 0; j < 12; j++) {
        const q = this.bottom.clone().lerp(this.top, k)
        const loc = t.locate(q.x, q.z)
        if (Math.abs(loc.lat) > half(loc.s) + 5) break
        k += 0.012 * (j % 2 ? -j : j)
      }
      const p = this.bottom.clone().lerp(this.top, k)
      const g = course.land(p.x, p.z)
      p.y = Math.max(p.y, g + 16)
      tops.push(p)
      const h = p.y - g + 0.6
      for (const sx of [-1, 1]) towerParts.push(P.cyl(0.22, 0.4, h, '#B4ADC8', { at: [p.x + side.x * sx * 1.4, g + h / 2 - 0.6, p.z + side.z * sx * 1.4], rot: [-side.z * sx * 0.03, 0, side.x * sx * 0.03] }, 8))
      for (const k of [0.3, 0.6]) towerParts.push(P.box(0.15, 0.15, 3, '#B4ADC8', { at: [p.x, g + h * k, p.z], rot: [0, Math.atan2(side.x, side.z), 0] }))
      towerParts.push(P.rbox(0.7, 0.5, 6.4, 0.1, '#9A93B5', { at: [p.x, p.y + 0.25, p.z], rot: [0, Math.atan2(side.x, side.z), 0] }))
    }
    tops.push(this.top.clone())
    // The two lines, a little sag between towers.
    for (const [line, lens, off] of [
      [this.up, this.upLen, 2.4],
      [this.down, this.downLen, -2.4],
    ] as const) {
      for (let i = 0; i < tops.length - 1; i++) {
        const a0 = tops[i]
        const a1 = tops[i + 1]
        for (let k = 0; k < 8; k++) {
          const q = k / 8
          const p = a0.clone().lerp(a1, q)
          p.y -= 1.2 * 4 * q * (1 - q)
          p.addScaledVector(side, off)
          line.push(p)
        }
      }
      line.push(this.top.clone().addScaledVector(side, off))
      for (let i = 1; i < line.length; i++) lens.push(lens[i - 1] + line[i].distanceTo(line[i - 1]))
    }
    this.length = this.upLen[this.upLen.length - 1]
    const cable: BufferGeometry[] = []
    for (const line of [this.up, this.down])
      for (let i = 0; i < line.length - 1; i++) {
        const a0 = line[i]
        const a1 = line[i + 1]
        const d = new Vector3().subVectors(a1, a0)
        const len = d.length()
        const mid = a0.clone().add(a1).multiplyScalar(0.5)
        const e = new Euler().setFromQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), d.normalize()))
        cable.push(P.cyl(0.05, 0.05, len + 0.05, '#5E5470', { at: [mid.x, mid.y, mid.z], rot: [e.x, e.y, e.z] }, 4))
      }
    this.group.add(solid(merge(cable), bag, 0))
    this.group.add(solid(merge(towerParts), bag, 2))
    this.group.add(this.stations(side, bag))
    for (let i = 0; i < POOL_N; i++) {
      const color = i % CAB_COLORS.length
      const root = new Group()
      const swing = new Group()
      root.add(swing)
      swing.add(cabinShape(CAB_COLORS[color], bag))
      root.visible = false
      this.group.add(root)
      this.cabins.push({ root, swing, color, slot: -1 })
    }
    const root = new Group()
    const swing = new Group()
    root.add(swing)
    swing.add(cabinShape(PAL.hotpink, bag))
    this.group.add(root)
    this.hers = { root, swing, color: -1, slot: -1 }
    const slots = Math.floor(this.length / SPACING) * 2
    for (let i = 0; i < slots; i++) this.swings.push({ a: 0, v: 0, b: 0, bv: 0 })
  }

  /** Both stations: a lavender building with a pink roof and the big wheel the cable turns round. */
  private stations(side: Vector3, bag: Bag) {
    const parts: BufferGeometry[] = []
    const t = this.course.trail
    const st = this.course.station
    const a = t.heading(STATION.s)
    const yaw = -a
    const y0 = this.course.land(st.x, st.z)
    const { w, d, h } = STATION
    parts.push(
      P.rbox(w, h, d, 0.3, PAL.lavender, { at: [st.x, y0 + h / 2, st.z], rot: [0, yaw, 0] }),
      P.prism(
        [
          [-w / 2 - 0.8, 0],
          [w / 2 + 0.8, 0],
          [w / 2 - 2, 2.6],
          [-w / 2 + 2, 2.6],
        ],
        d + 1.6,
        PAL.hotpink,
        { at: [st.x, y0 + h, st.z], rot: [0, yaw, 0] },
      ),
      P.rbox(w * 0.6, 0.5, d + 1.2, 0.2, '#FFFFFF', { at: [st.x, y0 + h - 0.2, st.z], rot: [0, yaw, 0] }),
    )
    // The door the bike rolls out of: on the trail's side, facing down the mountain.
    const door = t.spot(STATION.s + d / 2 + 0.05, 0)
    parts.push(P.rbox(3.4, 3.6, 0.3, 0.15, PAL.ink, { at: [door.x, y0 + 1.8, door.z], rot: [0, yaw, 0] }), P.rbox(4, 0.4, 0.5, 0.15, '#FFFFFF', { at: [door.x, y0 + 3.75, door.z], rot: [0, yaw, 0] }))
    // Windows along its front.
    for (const l of [4, 8, 12, 16]) {
      const p = t.spot(STATION.s + d / 2 + 0.05, l)
      parts.push(P.rbox(2.2, 1.5, 0.2, 0.2, PAL.sky, { at: [p.x, y0 + h * 0.6, p.z], rot: [0, yaw, 0] }))
    }
    // The bullwheels.
    for (const p of [this.top, this.bottom]) parts.push(P.torus(2.4, 0.18, '#9A93B5', { at: [p.x, p.y + 0.2, p.z], rot: [Math.PI / 2, 0, 0] }))
    // The bottom station, smaller.
    const b = this.bottom
    const by = this.course.land(b.x, b.z)
    const byaw = Math.atan2(side.x, side.z)
    parts.push(
      P.rbox(9, 5, 11, 0.3, PAL.lavender, { at: [b.x, by + 2.5, b.z], rot: [0, byaw, 0] }),
      P.prism(
        [
          [-5.4, 0],
          [5.4, 0],
          [3.6, 2],
          [-3.6, 2],
        ],
        12.4,
        PAL.hotpink,
        { at: [b.x, by + 5, b.z], rot: [0, byaw, 0] },
      ),
    )
    return solid(merge(parts), bag, 2.5)
  }

  /** A point on a line, `u` meters from the bottom (clamped). */
  at(line: 'up' | 'down', u: number, out = new Vector3()) {
    const pts = line === 'up' ? this.up : this.down
    const lens = line === 'up' ? this.upLen : this.downLen
    const L = lens[lens.length - 1]
    const v = Math.max(0, Math.min(L, u))
    let i = 1
    while (i < lens.length - 1 && lens[i] < v) i++
    const k = (v - lens[i - 1]) / Math.max(1e-6, lens[i] - lens[i - 1])
    return out.copy(pts[i - 1]).lerp(pts[i], k)
  }
  /** Which way a line climbs at u (yaw, radians). */
  yawAt(u: number) {
    const a = this.at('up', u - 1, new Vector3())
    const b = this.at('up', u + 1, this.tmp)
    return Math.atan2(b.x - a.x, b.z - a.z)
  }

  /** Pushes the cabin in a slot (or hers, slot -1) swinging: `a` along the line, `b` sideways. */
  push(slot: number, a: number, b: number) {
    const sw = slot < 0 ? this.her : this.swings[slot]
    if (!sw) return
    sw.v += a
    sw.bv += b
  }
  private her = { a: 0, v: 0, b: 0, bv: 0 }

  /** Moves the cabins along (each pooled cabin shows the slot nearest the camera) and lets them swing. */
  update(dt: number, t: number, cam: Vector3) {
    const hers = this.hers.root.visible ? this.hers.root.position : null
    const L = this.length
    const n = this.swings.length / 2
    const spots: { slot: number; p: Vector3; yaw: number; d: number }[] = []
    for (let i = 0; i < n * 2; i++) {
      const line = i < n ? 'up' : 'down'
      const base = ((i % n) * SPACING + t * SPEED) % (n * SPACING)
      const u = line === 'up' ? base : L - base
      if (base > L - 4 || base < 4) continue
      const p = this.at(line, u)
      // (None where Maple's own cabin is riding.)
      if (hers && line === 'up' && p.distanceToSquared(hers) < 100) continue
      const d = p.distanceToSquared(cam)
      spots.push({ slot: i, p, yaw: this.yawAt(u) + (line === 'down' ? Math.PI : 0), d })
    }
    spots.sort((a, b) => a.d - b.d)
    const used = new Set(spots.slice(0, POOL_N).map((s) => s.slot))
    // Keep each cabin on its slot while it's still among the nearest, so it doesn't jump.
    const free: Cabin[] = []
    for (const c of this.cabins) if (!used.has(c.slot)) free.push(c)
    else used.delete(c.slot)
    for (const s of spots.slice(0, POOL_N)) {
      if (!used.has(s.slot)) continue
      const c = free.pop()
      if (c) c.slot = s.slot
    }
    for (const c of free) c.slot = -1
    const bySlot = new Map(spots.map((s) => [s.slot, s]))
    for (const c of this.cabins) {
      const s = bySlot.get(c.slot)
      c.root.visible = !!s
      if (!s) continue
      c.root.position.copy(s.p)
      c.root.rotation.y = s.yaw
      const sw = this.swings[c.slot]
      c.swing.rotation.set(sw.a + Math.sin(t * 1.1 + c.slot) * 0.015, 0, sw.b)
    }
    for (const sw of [...this.swings, this.her]) {
      sw.v += (-3.5 * sw.a - 0.5 * sw.v) * dt
      sw.a += sw.v * dt
      sw.bv += (-3.5 * sw.b - 0.5 * sw.bv) * dt
      sw.b += sw.bv * dt
    }
    this.hers.swing.rotation.set(this.her.a, 0, this.her.b)
  }
}

// ---------------------------------------------------------------- props by the trail

/** The wooden bridge over the creek (left half), its rails; the kicker's side boards and posts; the trail signs. */
export function buildProps(course: Course, bag: Bag) {
  const t = course.trail
  const parts: BufferGeometry[] = []
  const at = (s: number, lat: number, y: number): V3 => {
    const p = t.spot(s, lat)
    return [p.x, y, p.z]
  }
  // The bridge: planks across, two rails along, posts down to the creek bed.
  for (let s = CREEK.at - BRIDGE_HALF; s <= CREEK.at + BRIDGE_HALF; s += 0.55) {
    const hw = half(s)
    const lat = -(hw + 0.15) / 2
    const y = course.deckY(s)
    parts.push(P.rbox(0.45, 0.14, hw + 0.7, 0.04, Math.round(s * 2) % 3 ? '#D8A574' : '#C99464', { at: at(s, lat - 0.05, y - 0.07), rot: [0, -t.heading(s), 0] }))
  }
  for (const lat of [-half(CREEK.at) - 0.45, 0.05]) {
    for (let s = CREEK.at - BRIDGE_HALF; s <= CREEK.at + BRIDGE_HALF + 0.01; s += BRIDGE_HALF / 3) {
      const y = course.deckY(s)
      const bed = course.ground(s, lat)
      parts.push(P.cyl(0.09, 0.09, 1.1 + (y - bed), '#B9825A', { at: at(s, lat, (y + 1.0 + bed) / 2) }, 6))
    }
    for (const h of [0.55, 1.0]) {
      const s0 = CREEK.at - BRIDGE_HALF
      const s1 = CREEK.at + BRIDGE_HALF
      const a = at(s0, lat, course.deckY(s0) + h)
      const b = at(s1, lat, course.deckY(s1) + h)
      const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2])
      parts.push(P.box(0.09, 0.09, len, '#C99464', { at: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], rot: [Math.atan2(a[1] - b[1], Math.hypot(b[0] - a[0], b[2] - a[2])), Math.atan2(b[0] - a[0], b[2] - a[2]), 0] }))
    }
  }
  // The kicker: side boards and a frame under its lip.
  for (const lat of [0.35, half(JUMP.s) - 0.05]) {
    for (let k = 0; k < 1; k += 0.125) {
      const s = JUMP.s + k * JUMP.len
      const top = course.ground(s, lat + (lat < 1 ? 0.4 : -0.4))
      const bot = course.ground(s, lat < 1 ? -0.5 : half(s) + 0.5) - 0.2
      if (top - bot < 0.1) continue
      parts.push(P.box(0.08, top - bot, JUMP.len / 8 + 0.02, '#C48F5A', { at: at(s + JUMP.len / 16, lat, (top + bot) / 2), rot: [0, -t.heading(s), 0] }))
    }
  }
  // Trail markers: little posts with a green circle (the green trail) or a blue square (the blue way); a big one at
  // the split, a jump sign on the kicker's side.
  const marker = (s: number, lat: number, blue: boolean, big = 1) => {
    const g = course.ground(s, lat)
    parts.push(P.cyl(0.07 * big, 0.08 * big, 1.3 * big, '#9A6B4F', { at: at(s, lat, g + 0.65 * big) }, 6))
    const sign = at(s, lat, g + 1.25 * big)
    // Mount the face on the uphill side of the post, with a little overlap at the back.
    const heading = t.heading(s)
    const faceOffset = 0.08 * big + 0.03 - 0.02
    sign[0] -= Math.sin(heading) * faceOffset
    sign[2] += Math.cos(heading) * faceOffset
    if (blue) parts.push(P.rbox(0.42 * big, 0.42 * big, 0.06, 0.04, '#4C8FE0', { at: sign, rot: [0, -t.heading(s), 0] }))
    else parts.push(P.cyl(0.24 * big, 0.24 * big, 0.06, '#5DBB63', { at: sign, rot: [Math.PI / 2, 0, heading] }, 16))
  }
  for (let s = 18; s < GREEN_END; s += 46) marker(s, (s / 46) % 2 < 1 ? -(half(s) + 1.3) : half(s) + 1.3, false)
  marker(SPLIT.from + 4, -0.6, false, 1.5)
  marker(SPLIT.from + 4, 0.6, true, 1.5)
  for (let s = SPLIT.from + 40; s < SPLIT.to - 10; s += 52) {
    marker(s, -(half(s) + 1.3), false)
    marker(s, half(s) + 1.3, true)
  }
  for (let s = 560; s < 820; s += 50) marker(s, (s / 50) % 2 < 1 ? half(s) + 1.3 : -(half(s) + 1.3), false)
  // Rocks for the blue way's rock hops.
  for (const [rs, len, rh] of ROCKS) {
    const lat = island(rs + len) + (half(rs + len) - island(rs + len)) / 2
    parts.push(P.sphere(0.5, '#A9A1BA', { at: at(rs + len + 0.3, lat - 1, course.ground(rs + len + 0.3, lat - 1) - 0.1), scale: [1.2, rh, 1] }, 8))
  }
  return solid(merge(parts), bag, 1.8)
}

// ---------------------------------------------------------------- the sky and far away

export function buildSky(bag: Bag) {
  const geo = bag.add(new SphereGeometry(2900, 32, 16))
  const top = new Color(SKY_TOP)
  const low = new Color(SKY)
  const p = geo.attributes.position
  const col = new Float32Array(p.count * 3)
  const c = new Color()
  for (let i = 0; i < p.count; i++) {
    const k = smooth(Math.max(0, p.getY(i) / 2900) / 0.45)
    c.copy(low).lerp(top, k)
    col.set([c.r, c.g, c.b], i * 3)
  }
  geo.setAttribute('color', new BufferAttribute(col, 3))
  const m = new Mesh(geo, bag.add(new MeshBasicMaterial({ vertexColors: true, side: BackSide, fog: false, depthWrite: false })))
  m.renderOrder = -10
  return m
}

/** Three rings of far hills, each paler (they're further into the haze). */
export function buildHills(center: { x: number; z: number }, bag: Bag) {
  const g = new Group()
  const r = rng(77)
  ;[
    [1750, '#AFC4E2', 130],
    [2250, '#C2D2EC', 170],
    [2700, '#D3DEF2', 210],
  ].forEach(([R, color, H], ring) => {
    const parts: BufferGeometry[] = []
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2 + r() * 0.2 + ring
      const rr = (R as number) * (0.92 + r() * 0.12)
      const h = (H as number) * (0.5 + r() * 0.7)
      parts.push(P.sphere(1, '#ffffff', { at: [center.x + Math.sin(a) * rr, -20, center.z + Math.cos(a) * rr], scale: [h * 2.6, h, h * 2.2] }, 12))
    }
    const m = new Mesh(bag.add(merge(parts)), bag.add(new MeshBasicMaterial({ color: color as string, fog: false })))
    m.renderOrder = -9 + ring
    g.add(m)
  })
  return g
}

/** Puffy clouds drifting over the mountain. */
export function buildClouds(center: { x: number; z: number }, bag: Bag) {
  const r = rng(5)
  const clouds: Group[] = []
  for (let i = 0; i < 14; i++) {
    const parts: BufferGeometry[] = []
    const n = 4 + Math.floor(r() * 3)
    for (let k = 0; k < n; k++) parts.push(P.sphere(5 + r() * 6, '#FFFFFF', { at: [k * 7 - n * 3.5, r() * 3, (r() - 0.5) * 6], scale: [1.3, 0.8, 1] }, 10))
    const c = solid(merge(parts), bag, 2)
    c.position.set(center.x + (r() - 0.5) * 1400, 190 + r() * 120, center.z + (r() - 0.5) * 1600)
    c.userData.v = 2 + r() * 2
    clouds.push(c)
  }
  return clouds
}

/** The rainbow over the waterfall's pool (it fades in at the finish). */
export function buildRainbow(bag: Bag) {
  const g = new Group()
  const colors = ['#FF8FA8', '#FFB27A', '#FFE07A', '#9EE6A8', '#8FCBF5', '#C3A8F5']
  colors.forEach((c, i) => {
    const m = new Mesh(bag.add(new TorusGeometry(14 - i * 0.7, 0.36, 6, 48, Math.PI)), bag.add(new MeshBasicMaterial({ color: c, transparent: true, opacity: 0, depthWrite: false, fog: false })))
    g.add(m)
  })
  return g
}

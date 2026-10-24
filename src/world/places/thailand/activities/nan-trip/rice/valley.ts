// Sapan's valley and Stop Time Cafe, modeled in code in the house's toon look (engine/geo.ts parts). Greybox: shapes
// only. The valley: the terraced spur (grassy steps, a mud floor in every paddy, the banks between them with a notch in
// each front bank), the water in each paddy (it rises, and turns from muddy to shiny sky as it fills), the little
// waterfall at each notch, the hilltop with its trees and the stream's pool, the valley floor with the stream, Sapan's
// houses, the farmer's hat on its post, the buffalo, the frogs and the ducks, the hills round about and the far
// mountains with cloud on their tops. The café: a wooden deck on stilts up on the hill, its railing of crossed branches,
// the peaked roof, two tall stools, a high table and the wind chime.
import { CanvasTexture, DoubleSide, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, type BufferGeometry } from 'three'
import type { Bag } from '../../../engine/dispose'
import { blobShadow, merge, P, solid } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import { CHIME, DECK, HAT_POST, HIGH_TABLE, LEVELS, PADDIES, RAIL_Z, RISE, SIDE, SPAN, SPRING, SPUR, spurXZ, STOOLS, STREAM_Z, TOP, VILLAGE, WATER_Y, type Paddy } from './layout'

const GRASS = '#8ED39A'
const BANK = '#7CC48A'
const MUD = '#C29A74'
const WOOD = '#B98A64'
const WOOD_DARK = '#8C6248'
const TREES = ['#6CC08A', '#5FB47E', '#7FCB8C']

/** A band of a circle round `c` (x, z): radius rIn..rOut, angles a0..a1, from height y0 up to y1. */
export function sector(rIn: number, rOut: number, a0: number, a1: number, y0: number, y1: number, color: string, c = SPUR): BufferGeometry {
  const n = Math.max(3, Math.ceil((a1 - a0) / 0.03))
  const pts: [number, number][] = []
  for (let k = 0; k <= n; k++) {
    const a = a0 + ((a1 - a0) * k) / n
    pts.push([rOut * Math.sin(a), -rOut * Math.cos(a)])
  }
  for (let k = n; k >= 0; k--) {
    const a = a0 + ((a1 - a0) * k) / n
    pts.push([rIn * Math.sin(a), -rIn * Math.cos(a)])
  }
  return P.prism(pts, Math.max(0.001, y1 - y0), color, { at: [c.x, (y0 + y1) / 2, c.z], rot: [-Math.PI / 2, 0, 0] })
}

export interface PaddyParts {
  water: Mesh
  /** The shine on a full paddy (a few white streaks, faded in). */
  glint: Mesh
  /** The little waterfall over its notch. */
  fall: Mesh
}

export interface Valley {
  root: Group
  paddies: PaddyParts[]
  /** The pool's water and the bamboo pipe's mouth sit here. */
  pool: Mesh
  hat: Group
  village: Group
  chimney: Mesh
  buffalo: { root: Group; head: Group; tail: Group }
  frogs: { root: Group; throat: Mesh }[]
  ducks: Group[]
}

export interface Deck {
  root: Group
  chime: Group
  glass: { root: Group; milk: Mesh }
  cup: Group
}

const NOTCH_W = 0.2

export function buildValley(bag: Bag): Valley {
  const root = new Group()
  const parts: BufferGeometry[] = []
  // ---- The steps: a grassy block for each, the mud in each paddy, the banks ----
  for (const [l, L] of LEVELS.entries()) {
    parts.push(sector(L.rIn, L.rOut, -SPAN - SIDE, SPAN + SIDE, -0.2, L.y, GRASS))
    // The grassy sides drop away to the valley floor.
    for (const s of [-1, 1]) parts.push(sector(L.rIn, L.rOut, s > 0 ? SPAN + SIDE : -SPAN - SIDE - 0.1, s > 0 ? SPAN + SIDE + 0.1 : -SPAN - SIDE, -0.2, L.y - RISE * 0.5, GRASS))
    const mine = PADDIES.filter((p) => p.level === l)
    for (const p of mine) {
      const inset = 0.05 / L.rOut
      parts.push(sector(L.rIn + 0.04, L.rOut - 0.06, p.a0 + inset, p.a1 - inset, L.y, L.y + 0.008, MUD))
      // The front bank, with its notch.
      const gap = NOTCH_W / 2 / L.rOut
      parts.push(sector(L.rOut - 0.08, L.rOut, p.a0, p.notch - gap, L.y, L.y + 0.08, BANK))
      parts.push(sector(L.rOut - 0.08, L.rOut, p.notch + gap, p.a1, L.y, L.y + 0.08, BANK))
    }
    // The banks between paddies (and at the steps' ends).
    for (const a of [...new Set(mine.flatMap((p) => [p.a0, p.a1]))]) {
      const w = 0.04 / L.rOut
      parts.push(sector(L.rIn, L.rOut, a - w, a + w, L.y, L.y + 0.08, BANK))
    }
  }
  // ---- The hilltop: a green dome, its trees, the stream running down to the pool ----
  const T = LEVELS[TOP]
  parts.push(P.sphere(4.5, GRASS, { at: [SPUR.x, 2.0, SPUR.z], scale: [1, 0.62, 1] }, 28))
  for (const [x, z, s] of [[-2.2, -14.2, 1], [-1.0, -12.4, 0.8], [1.6, -13.2, 1.1], [2.8, -14.8, 0.9], [0.4, -15.6, 1.2], [-3.2, -12.8, 0.7], [3.4, -12.0, 0.75]]) {
    const r = Math.hypot(x - SPUR.x, z - SPUR.z)
    const y = 2.0 + 0.62 * Math.sqrt(Math.max(0, 4.5 * 4.5 - r * r)) - 0.1
    parts.push(P.cyl(0.07 * s, 0.09 * s, 0.5 * s, WOOD_DARK, { at: [x, y + 0.25 * s, z] }, 6))
    parts.push(P.sphere(0.55 * s, TREES[Math.round(x * 3 + z) & 1 ? 1 : 0], { at: [x, y + 0.75 * s, z], scale: [1, 1.15, 1] }, 12))
    parts.push(P.sphere(0.38 * s, TREES[2], { at: [x + 0.15 * s, y + 1.15 * s, z + 0.1], scale: [1, 1.1, 1] }, 10))
  }
  // The stream, coming down the dome to the pool (flat blue pebbles of water), and the pool's stones.
  for (let k = 0; k < 6; k++) {
    const r = T.rIn - 0.2 - k * 0.55
    const [x, z] = spurXZ(r, 0.03 + Math.sin(k * 1.7) * 0.06)
    const y = 2.0 + 0.62 * Math.sqrt(Math.max(0, 4.5 * 4.5 - r * r)) + 0.02
    parts.push(P.sphere(0.22, '#A9D8F2', { at: [x, y, z], scale: [1.1, 0.12, 1.6] }, 10))
  }
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2
    parts.push(P.sphere(0.09, '#C9C0D6', { at: [SPRING[0] + Math.cos(a) * 0.32, SPRING[1] - 0.04, SPRING[2] + Math.sin(a) * 0.24], scale: [1, 0.7, 1] }, 8))
  }
  // A forked stick holding up the pipe's mouth.
  parts.push(P.cyl(0.03, 0.035, 0.5, WOOD_DARK, { at: [SPRING[0] + 0.3, SPRING[1] - 0.05, SPRING[2] + 0.25], rot: [0, 0, 0.12] }, 6))
  // ---- The valley floor, the stream along it, the hills round about ----
  parts.push(P.box(32, 0.1, 14, '#A9DB97', { at: [0, -0.05, -2.5] }))
  parts.push(P.box(15, 0.03, 0.55, '#A9D8F2', { at: [-3.5, 0.005, STREAM_Z] }))
  for (const x of [-9, -6.5, -4, -1.5, 1, 3.5]) parts.push(P.sphere(0.12, '#C9C0D6', { at: [x, 0.03, STREAM_Z + 0.32], scale: [1.3, 0.5, 1] }, 8))
  parts.push(P.sphere(5, '#7FCB8C', { at: [-8.6, -1.5, -3.6], scale: [1.2, 1, 1] }, 24))
  parts.push(P.sphere(5, '#6CC08A', { at: [9.4, -1.9, -6.5], scale: [1.3, 0.9, 1.2] }, 24))
  parts.push(P.sphere(5.6, '#82BE9A', { at: [-7.6, -1.2, -13], scale: [1.2, 0.9, 1] }, 24))
  parts.push(P.sphere(5.6, '#7FCB8C', { at: [8, -1.1, -14.5], scale: [1.2, 0.95, 1] }, 24))
  root.add(solid(merge(parts), bag, 2))

  // ---- The water in each paddy (its own material: it fills and turns shiny), its glint, its waterfall ----
  const paddies = PADDIES.map((p) => buildPaddy(p, bag, root))

  // ---- The pool ----
  const pool = new Mesh(bag.add(new PlaneGeometry(0.56, 0.42)), bag.add(new MeshBasicMaterial({ color: '#BFE6FA' })))
  pool.rotation.x = -Math.PI / 2
  pool.position.set(SPRING[0], SPRING[1] - 0.03, SPRING[2])
  root.add(pool)

  // ---- The far mountains, with cloud on their tops ----
  const far = new Mesh(bag.add(new PlaneGeometry(90, 22)), bag.add(new MeshBasicMaterial({ map: mountainsTexture(bag), depthWrite: false })))
  far.position.set(0, 5, -34)
  far.renderOrder = -1
  root.add(far)

  // ---- Sapan's houses: on short stilts, with peaked roofs ----
  const village = new Group()
  village.position.set(...VILLAGE)
  village.userData.pick = 'village'
  const houses: BufferGeometry[] = []
  for (const [x, z, r, c] of [[0, 0, 0.3, '#E59A6E'], [-1.1, 0.9, -0.2, '#C98A6E'], [-0.5, -1.3, 0.5, '#D98F6A']] as const) {
    const at = (dx: number, y: number, dz: number): [number, number, number] => [x + dx * Math.cos(r) + dz * Math.sin(r), y, z - dx * Math.sin(r) + dz * Math.cos(r)]
    houses.push(P.box(0.9, 0.55, 0.7, '#FFF1DC', { at: at(0, 0.6, 0), rot: [0, r, 0] }))
    houses.push(P.prism([[-0.58, 0], [0.58, 0], [0, 0.42]], 0.86, c, { at: at(0, 0.87, 0), rot: [0, r + Math.PI / 2, 0] }))
    for (const [dx, dz] of [[-0.38, -0.28], [0.38, -0.28], [-0.38, 0.28], [0.38, 0.28]]) houses.push(P.box(0.06, 0.34, 0.06, WOOD_DARK, { at: at(dx, 0.17, dz) }))
    houses.push(P.box(0.18, 0.26, 0.02, WOOD_DARK, { at: at(0.15, 0.55, 0.36), rot: [0, r, 0] }))
  }
  village.add(solid(merge(houses), bag, 2))
  const chimney = new Mesh(bag.add(new PlaneGeometry(0.01, 0.01)), bag.add(new MeshBasicMaterial({ visible: false })))
  chimney.position.set(0, 1.35, 0)
  village.add(chimney)
  root.add(village)

  // ---- The farmer's hat on its post ----
  const post = solid(P.cyl(0.04, 0.05, 1.05, WOOD_DARK, { at: [0, 0.52, 0] }, 8), bag, 2)
  post.position.set(...HAT_POST)
  root.add(post)
  const hat = solid(merge([P.cone(0.36, 0.2, '#F2D58A', { at: [0, 0.1, 0] }, 20), P.torus(0.2, 0.012, '#E2A85A', { at: [0, 0.05, 0], rot: [Math.PI / 2, 0, 0] })]), bag, 2)
  hat.position.set(HAT_POST[0], 1.05, HAT_POST[2])
  hat.userData.pick = 'hat'
  root.add(hat)

  // ---- The buffalo, grazing by the stream ----
  const buffalo = buildBuffalo(bag)
  root.add(buffalo.root)

  // ---- Frogs and ducks (hidden until the paddies fill) ----
  const frogs = Array.from({ length: 4 }, () => buildFrog(bag))
  const ducks = Array.from({ length: 3 }, () => buildDuck(bag))
  for (const f of frogs) root.add(f.root)
  for (const d of ducks) root.add(d)
  return { root, paddies, pool, hat, village, chimney, buffalo, frogs, ducks }
}

function buildPaddy(p: Paddy, bag: Bag, root: Group): PaddyParts {
  const L = LEVELS[p.level]
  const inset = 0.06 / L.rOut
  const water = new Mesh(bag.add(sector(L.rIn + 0.05, L.rOut - 0.07, p.a0 + inset, p.a1 - inset, 0, 0.004, '#ffffff')), bag.add(new MeshBasicMaterial({ color: '#9C8A78' })))
  water.position.y = L.y - 0.03
  water.visible = false
  water.userData.pick = `paddy:${p.i}`
  root.add(water)
  // Three white streaks across the water, along the contour: what "shiny like a mirror" looks like in flat toon.
  const streaks: BufferGeometry[] = []
  const span = p.a1 - p.a0
  for (const [k, f, len] of [[0, 0.3, 0.32], [1, 0.62, 0.22], [2, 0.45, 0.14]] as const) {
    const r = L.rIn + 0.25 + k * 0.38
    const a = p.a0 + span * f
    streaks.push(sector(r, r + 0.045, a, a + span * len, 0, 0.002, '#ffffff'))
  }
  const glint = new Mesh(bag.add(merge(streaks)), bag.add(new MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0, depthWrite: false })))
  glint.position.y = L.y + WATER_Y + 0.006
  glint.renderOrder = 2
  root.add(glint)
  // The waterfall over the notch: a sheet down the front of the bank to the paddy (or the stream) below.
  const drop = p.level === 0 ? L.y + 0.05 : RISE + 0.05
  const fall = new Mesh(bag.add(new PlaneGeometry(NOTCH_W * 0.8, drop)), bag.add(new MeshBasicMaterial({ color: '#CDEBFA', transparent: true, opacity: 0, depthWrite: false, side: DoubleSide })))
  const [x, z] = spurXZ(L.rOut + 0.03, p.notch)
  fall.position.set(x, L.y + WATER_Y - drop / 2, z)
  fall.rotation.y = p.notch
  fall.renderOrder = 2
  fall.visible = false
  root.add(fall)
  return { water, glint, fall }
}

function buildBuffalo(bag: Bag) {
  const root = new Group()
  root.userData.pick = 'buffalo'
  const C = '#6F6884'
  root.add(solid(merge([P.rbox(0.8, 0.7, 1.45, 0.28, C, { at: [0, 0.8, 0] }), ...[[-0.26, 0.5], [0.26, -0.5], [0.26, 0.5], [-0.26, -0.5]].map(([x, z]) => P.rbox(0.17, 0.55, 0.18, 0.06, C, { at: [x, 0.27, z] }))]), bag, 2))
  const head = new Group()
  head.position.set(0, 1.0, 0.72)
  head.add(
    solid(
      merge([
        P.rbox(0.44, 0.42, 0.56, 0.18, C, { at: [0, -0.07, 0.24] }),
        P.rbox(0.36, 0.22, 0.2, 0.08, '#9C93AE', { at: [0, -0.18, 0.52] }),
        ...[-1, 1].map((k) => P.torus(0.28, 0.05, '#EDE3D2', { at: [k * 0.3, 0.12, 0.08], rot: [Math.PI / 2, 0, k > 0 ? 0 : Math.PI] }, Math.PI * 0.75)),
        ...[-1, 1].map((k) => P.sphere(0.04, PAL.ink, { at: [k * 0.17, 0.04, 0.44] }, 8)),
      ]),
      bag,
      2,
    ),
  )
  root.add(head)
  const tail = new Group()
  tail.position.set(0, 0.95, -0.72)
  tail.add(solid(P.cyl(0.03, 0.02, 0.45, C, { at: [0, -0.2, -0.04], rot: [0.25, 0, 0] }, 6), bag, 1))
  root.add(tail)
  root.add(blobShadow(0.95, bag))
  return { root, head, tail }
}

function buildFrog(bag: Bag) {
  const root = new Group()
  const G = '#8FD67A'
  root.add(
    solid(
      merge([
        P.sphere(0.1, G, { at: [0, 0.07, 0], scale: [1, 0.7, 1.15] }),
        ...[-1, 1].map((s) => P.sphere(0.04, G, { at: [s * 0.055, 0.13, 0.05] }, 10)),
        ...[-1, 1].map((s) => P.sphere(0.022, '#FFFFFF', { at: [s * 0.06, 0.15, 0.075] }, 8)),
        ...[-1, 1].map((s) => P.sphere(0.012, PAL.ink, { at: [s * 0.062, 0.152, 0.093] }, 6)),
        ...[-1, 1].map((s) => P.sphere(0.045, '#7BC266', { at: [s * 0.09, 0.03, -0.05], scale: [0.7, 0.5, 1.4] }, 8)),
      ]),
      bag,
      2,
    ),
  )
  const throat = new Mesh(bag.add(P.sphere(0.05, '#FFF4C8', {}, 10)), (root.children[0].children[0] as Mesh).material)
  throat.position.set(0, 0.045, 0.085)
  throat.scale.set(1, 0.6, 0.6)
  root.add(throat)
  root.visible = false
  return { root, throat }
}

function buildDuck(bag: Bag) {
  const root = new Group()
  root.add(
    solid(
      merge([
        P.sphere(0.13, '#FFFFFF', { at: [0, 0.08, 0], scale: [0.85, 0.7, 1.25] }),
        P.cone(0.05, 0.12, '#FFFFFF', { at: [0, 0.13, -0.16], rot: [-1.0, 0, 0] }, 8),
        P.sphere(0.075, '#FFFFFF', { at: [0, 0.22, 0.12] }),
        P.cone(0.03, 0.08, '#FFB21F', { at: [0, 0.21, 0.22], rot: [Math.PI / 2, 0, 0] }, 8),
        ...[-1, 1].map((s) => P.sphere(0.013, PAL.ink, { at: [s * 0.045, 0.24, 0.17] }, 6)),
      ]),
      bag,
      2,
    ),
  )
  root.visible = false
  return root
}

/** Soft far mountains with cloud sitting on their tops, painted on a canvas (one big flat picture at the back). */
function mountainsTexture(bag: Bag) {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 256
  const g = c.getContext('2d')!
  const sky = g.createLinearGradient(0, 0, 0, 256)
  sky.addColorStop(0, '#CFE6F5')
  sky.addColorStop(1, '#EEF4F8')
  g.fillStyle = sky
  g.fillRect(0, 0, 1024, 256)
  const ridge = (y: number, amp: number, color: string, seed: number) => {
    g.fillStyle = color
    g.beginPath()
    g.moveTo(0, 256)
    for (let x = 0; x <= 1024; x += 12) g.lineTo(x, y - amp * (0.55 + 0.45 * Math.sin(x / 120 + seed) * Math.cos(x / 53 + seed * 2)))
    g.lineTo(1024, 256)
    g.fill()
  }
  ridge(140, 70, '#B5CFD0', 1)
  g.fillStyle = 'rgba(255,255,255,.88)'
  for (const [x, y, r] of [[120, 96, 40], [190, 88, 32], [470, 80, 48], [540, 92, 36], [820, 98, 40], [900, 90, 30]]) {
    g.beginPath()
    g.ellipse(x, y, r * 1.9, r * 0.55, 0, 0, Math.PI * 2)
    g.fill()
  }
  ridge(190, 55, '#97C7A6', 3)
  ridge(235, 40, '#82BE9A', 5)
  const tex = bag.add(new CanvasTexture(c))
  tex.colorSpace = SRGBColorSpace
  return tex
}

// ---------------------------------------------------------------- the café's deck

/** Stop Time Cafe's deck, built deck-local (its railing toward -z), placed and turned on the hill by DECK. */
export function buildDeck(bag: Bag): Deck {
  const root = new Group()
  root.position.set(DECK.x, DECK.y, DECK.z)
  root.rotation.y = DECK.yaw
  const parts: BufferGeometry[] = [
    // The wet dark-wood floor and its planks, on stilts.
    P.box(3.8, 0.1, 3.3, '#9E7A5E', { at: [0, -0.05, 0] }),
    ...Array.from({ length: 11 }, (_, i) => P.box(3.8, 0.012, 0.02, '#7E5E48', { at: [0, 0.002, -1.6 + i * 0.32] })),
    ...[-1.75, 0, 1.75].flatMap((x) => [-1.5, 1.5].map((z) => P.cyl(0.07, 0.08, 2.4, WOOD_DARK, { at: [x, -1.25, z] }, 8))),
    // The railing: posts, the top rail and the crossed branches.
    ...Array.from({ length: 6 }, (_, i) => P.cyl(0.04, 0.045, 1.0, WOOD_DARK, { at: [-1.85 + i * 0.74, 0.5, RAIL_Z] }, 8)),
    P.cyl(0.035, 0.035, 3.8, WOOD_DARK, { at: [0, 0.98, RAIL_Z], rot: [0, 0, Math.PI / 2] }, 8),
    ...Array.from({ length: 5 }, (_, i) => [0.62, -0.62].map((a) => P.cyl(0.022, 0.022, 0.98, '#9A6E52', { at: [-1.48 + i * 0.74, 0.5, RAIL_Z + 0.02], rot: [0, 0, a] }, 6))).flat(),
    // The side railing, on the valley side.
    P.cyl(0.035, 0.035, 2.9, WOOD_DARK, { at: [1.85, 0.98, 0.1], rot: [Math.PI / 2, 0, 0] }, 8),
    ...[-0.6, 0.4, 1.4].map((z) => P.cyl(0.04, 0.045, 1.0, WOOD_DARK, { at: [1.85, 0.5, z] }, 8)),
    // The roof: four posts and a peaked roof of dark wood.
    ...[-1.8, 1.8].flatMap((x) => [-1.5, 1.5].map((z) => P.cyl(0.06, 0.06, 2.4, WOOD_DARK, { at: [x, 1.2, z] }, 8))),
    ...[1, -1].map((s) => P.box(4.2, 0.07, 2.0, '#7E5E48', { at: [0, 2.72, s * 0.85], rot: [s * 0.42, 0, 0] })),
    P.box(4.3, 0.12, 0.12, WOOD_DARK, { at: [0, 3.1, 0] }),
    // The high table and the two tall stools.
    P.cyl(0.3, 0.3, 0.05, WOOD, { at: [HIGH_TABLE[0], HIGH_TABLE[1] - 0.025, HIGH_TABLE[2]] }, 18),
    P.cyl(0.04, 0.06, HIGH_TABLE[1] - 0.05, WOOD_DARK, { at: [HIGH_TABLE[0], (HIGH_TABLE[1] - 0.05) / 2, HIGH_TABLE[2]] }, 8),
    ...Object.values(STOOLS).flatMap((s) => [
      P.cyl(0.17, 0.17, 0.05, WOOD, { at: [s[0], s[1] - 0.025, s[2]] }, 16),
      ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => P.cyl(0.018, 0.022, s[1] - 0.05, WOOD_DARK, { at: [s[0] + a * 0.1, (s[1] - 0.05) / 2, s[2] + b * 0.1], rot: [b * 0.08, 0, -a * 0.08] }, 6)),
      P.torus(0.12, 0.012, WOOD_DARK, { at: [s[0], s[1] * 0.45, s[2]], rot: [Math.PI / 2, 0, 0] }),
    ]),
    // A pot of orchids on the railing post.
    P.cyl(0.09, 0.07, 0.14, '#E59A6E', { at: [-1.85, 1.07, RAIL_Z] }, 10),
    ...[0, 1, 2].map((k) => P.sphere(0.05, k === 1 ? PAL.hotpink : '#E8A6F2', { at: [-1.85 + (k - 1) * 0.06, 1.22 + (k % 2) * 0.05, RAIL_Z + 0.02], scale: [1, 0.7, 0.5] }, 8)),
  ]
  root.add(solid(merge(parts), bag, 2))
  // ---- The wind chime, hanging from the roof's edge ----
  const chime = new Group()
  chime.position.set(...CHIME)
  chime.userData.pick = 'chime'
  chime.add(solid(merge([P.cyl(0.005, 0.005, 0.24, PAL.ink, { at: [0, 0.12, 0] }, 4), P.torus(0.09, 0.012, WOOD_DARK, { rot: [Math.PI / 2, 0, 0] }), ...Array.from({ length: 5 }, (_, k) => P.cyl(0.014, 0.014, 0.16 + (k % 3) * 0.05, ['#BFE6FA', '#FFC2D8', '#FFE27A', '#C9F0DC', '#E2D6FF'][k], { at: [Math.cos((k / 5) * Math.PI * 2) * 0.07, -0.12 - (k % 3) * 0.025, Math.sin((k / 5) * Math.PI * 2) * 0.07] }, 6))]), bag, 1))
  root.add(chime)
  // ---- The pink milk (nom yen) in a tall glass, and Daddy's coffee ----
  const glassRoot = new Group()
  glassRoot.position.set(HIGH_TABLE[0] - 0.12, HIGH_TABLE[1], HIGH_TABLE[2] + 0.02)
  glassRoot.userData.pick = 'glass'
  glassRoot.add(solid(merge([P.cyl(0.055, 0.045, 0.2, '#EEF6FF', { at: [0, 0.1, 0] }, 14), P.cyl(0.006, 0.006, 0.18, PAL.hotpink, { at: [0.02, 0.24, 0], rot: [0, 0, -0.2] }, 6)]), bag, 2))
  const milk = new Mesh(bag.add(P.cyl(0.049, 0.041, 1, '#FF9CC8', { at: [0, 0.5, 0] }, 14)), (glassRoot.children[0].children[0] as Mesh).material)
  milk.position.y = 0.012
  milk.scale.set(1, 0.17, 1)
  glassRoot.add(milk)
  root.add(glassRoot)
  const cup = solid(merge([P.cyl(0.05, 0.04, 0.09, '#FFFFFF', { at: [0, 0.045, 0] }, 12), P.cyl(0.044, 0.044, 0.004, '#7A4E3A', { at: [0, 0.088, 0] }, 12), P.torus(0.025, 0.008, '#FFFFFF', { at: [0.055, 0.05, 0] }, Math.PI * 1.6)]), bag, 2)
  cup.position.set(HIGH_TABLE[0] + 0.16, HIGH_TABLE[1], HIGH_TABLE[2] - 0.04)
  cup.userData.pick = 'cup'
  root.add(cup)
  return { root, chime, glass: { root: glassRoot, milk }, cup }
}

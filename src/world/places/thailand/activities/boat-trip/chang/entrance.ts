// Baan Chang's entrance (`chang`, `sign`; plan: "The photo spot at the entrance"), greybox in the final toon look: the
// road where the songthaew drops the family off, the plank deck with its tree-stump stools, a black-and-white totem
// post either side (zigzags and a spiral), a twisted driftwood tree, potted palms and a fern, and behind it the curved
// wall of upright bamboo poles under a thick thatched band. "Baan Chang Café" and the smaller line under it are canvas
// text on the wall (the way the shop sign is in hub/build/street.ts), never generated. Oil palms stand behind.
import { BackSide, BufferGeometry, CanvasTexture, CylinderGeometry, DoubleSide, Float32BufferAttribute, Group, Mesh, MeshToonMaterial, SRGBColorSpace } from 'three'
import type { Bag } from '../../../engine/dispose'
import { bake, merge, P, solid } from '../../../engine/geo'
import { PAL, toonGradient } from '../../../engine/toon'
import { buildSongthaew, type Songthaew } from '../../../trip/vehicles/songthaew'
import { DECK, ENTRY, ROAD, TOTEMS, WALL } from './layout'
import { EARTH, FROND, FROND_DARK, grassPatches, groundScatter, oilPalm } from './nature'

const BAMBOO = ['#D9B86A', '#CDA95C', '#E3C57C']
const NODE = '#B08F4A'
const PLANK = '#C99A6E'
const STUMP = '#A97C54'
const DRIFT = '#B7A898'
const INK = '#2E2233'

export interface Entrance {
  root: Group
  songthaew: Songthaew
  /** The two totems (a tap: tock, and a wobble). */
  totems: Group[]
}

/** A point on the wall's arc at angle `t` (0 = its middle, straight in front of the camera). */
const onArc = (t: number, r = WALL.r): [number, number] => [WALL.cx + r * Math.sin(Math.PI + t), WALL.cz + r * Math.cos(Math.PI + t)]

/** The thatched band's bottom and top at `u` along the wall (-1 its right end, 0 the middle, 1 its left end): a swoop,
 *  lowest in the middle and sweeping up at both ends, higher on the left, with a ragged, wavy top (Dad's photo). */
export function bandAt(u: number): [number, number] {
  const y0 = WALL.h - 0.2 + 0.38 * u * u + 0.14 * u
  return [y0, y0 + WALL.band - 0.12 * u * u + 0.05 * Math.sin(u * 9.5)]
}

/** The thatch's face, painted: straw strokes hanging down in three shades, and "Baan Chang Café" in big white letters
 *  across it (left to right, so u = 0 is the left end). */
function thatchTexture(bag: Bag) {
  const W = 4096
  const H = 448
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')!
  g.fillStyle = '#CFA772'
  g.fillRect(0, 0, W, H)
  g.lineCap = 'round'
  for (let i = 0; i < 2600; i++) {
    const x = ((Math.sin(i * 91.7) + 1) / 2) * W
    const y = ((Math.sin(i * 37.3) + 1) / 2) * H
    g.strokeStyle = i % 3 === 0 ? '#E3C38C' : i % 3 === 1 ? '#B88F5C' : '#C69D66'
    g.lineWidth = 5 + (i % 4)
    g.beginPath()
    g.moveTo(x, y)
    g.lineTo(x + 10 + (i % 7) * 3, y + 60 + (i % 5) * 14)
    g.stroke()
  }
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  const font = '"Fredoka", "Arial Rounded MT Bold", "Avenir Next", sans-serif'
  let size = H * 0.72
  g.font = `600 ${size}px ${font}`
  const fit = (W * 0.62) / g.measureText('Baan Chang Café').width
  if (fit < 1) size *= fit
  g.font = `600 ${size}px ${font}`
  // White letters standing off the thatch: a soft brown shadow under them, no outline.
  g.fillStyle = 'rgba(94, 66, 36, 0.55)'
  g.fillText('Baan Chang Café', W / 2 + 8, H * 0.54 + 12)
  g.fillStyle = '#FFFFFF'
  g.fillText('Baan Chang Café', W / 2, H * 0.54)
  const tex = bag.add(new CanvasTexture(c))
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

/** The thatched band along the top of the wall: a thick ribbon following the arc and the swoop (outlined), its face
 *  painted with straw and the letters (so they follow the swoop too), and a ragged fringe of straw along both edges. */
function thatchBand(bag: Bag) {
  const N = 48
  const lo = -WALL.a - 0.03
  const hi = WALL.a + 0.03
  const rf = WALL.r - 0.3
  const rb = WALL.r + 0.05
  const pos: number[] = []
  const nor: number[] = []
  const face: number[] = []
  const faceNor: number[] = []
  const uv: number[] = []
  const col = (i: number) => {
    const t = lo + (i / N) * (hi - lo)
    const [y0, y1] = bandAt(t / WALL.a)
    const [fx, fz] = onArc(t, rf)
    const [bx, bz] = onArc(t, rb)
    // Toward the circle's middle (the camera's side) is the front.
    const nx = WALL.cx - fx
    const nz = WALL.cz - fz
    const l = Math.hypot(nx, nz)
    return { t, y0, y1, f: [fx, fz], b: [bx, bz], n: [nx / l, nz / l], u: (hi - t) / (hi - lo) }
  }
  const quad = (out: number[], norm: number[], v: number[][], n: number[][]) => {
    for (const k of [0, 1, 2, 0, 2, 3]) {
      out.push(...v[k])
      norm.push(...n[k])
    }
  }
  for (let i = 0; i < N; i++) {
    const a = col(i)
    const b = col(i + 1)
    const na = [a.n[0], 0, a.n[1]]
    const nb = [b.n[0], 0, b.n[1]]
    const ba = [-a.n[0], 0, -a.n[1]]
    const bb = [-b.n[0], 0, -b.n[1]]
    // Front, back, top and bottom of the ribbon.
    quad(pos, nor, [[a.f[0], a.y0, a.f[1]], [b.f[0], b.y0, b.f[1]], [b.f[0], b.y1, b.f[1]], [a.f[0], a.y1, a.f[1]]], [na, nb, nb, na])
    quad(pos, nor, [[a.b[0], a.y0, a.b[1]], [a.b[0], a.y1, a.b[1]], [b.b[0], b.y1, b.b[1]], [b.b[0], b.y0, b.b[1]]], [ba, ba, bb, bb])
    quad(pos, nor, [[a.f[0], a.y1, a.f[1]], [b.f[0], b.y1, b.f[1]], [b.b[0], b.y1, b.b[1]], [a.b[0], a.y1, a.b[1]]], [[0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]])
    quad(pos, nor, [[a.f[0], a.y0, a.f[1]], [a.b[0], a.y0, a.b[1]], [b.b[0], b.y0, b.b[1]], [b.f[0], b.y0, b.f[1]]], [[0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0]])
    // The painted face, just in front of the ribbon's.
    const fa = onArc(a.t, rf - 0.012)
    const fb = onArc(b.t, rf - 0.012)
    quad(face, faceNor, [[fa[0], a.y0, fa[1]], [fb[0], b.y0, fb[1]], [fb[0], b.y1, fb[1]], [fa[0], a.y1, fa[1]]], [na, nb, nb, na])
    for (const k of [0, 1, 2, 0, 2, 3]) uv.push(...[[a.u, 0], [b.u, 0], [b.u, 1], [a.u, 1]][k])
  }
  const body = new BufferGeometry()
  body.setAttribute('position', new Float32BufferAttribute(pos, 3))
  body.setAttribute('normal', new Float32BufferAttribute(nor, 3))
  // The straw fringe: little tufts hanging under the band and sticking up along its top.
  const fringe = []
  for (let i = 0; i <= 90; i++) {
    const t = lo + (i / 90) * (hi - lo)
    const [y0, y1] = bandAt(t / WALL.a)
    const [x, z] = onArc(t, WALL.r - 0.2)
    const k = i % 3
    fringe.push(P.cone(0.075, 0.2 + k * 0.05, k ? '#C49A62' : '#D9B47A', { at: [x, y0 - 0.08 - k * 0.02, z], rot: [Math.PI, 0, (i % 2 ? 1 : -1) * 0.15] }, 4))
    if (i % 2) fringe.push(P.cone(0.06, 0.16 + k * 0.04, k ? '#D9B47A' : '#B88F5C', { at: [x, y1 + 0.06, z], rot: [0, 0, (k - 1) * 0.3] }, 4))
  }
  const root = new Group()
  root.add(solid(merge([bake(body, '#C49A62'), ...fringe]), bag, 2))
  const faceGeo = bag.add(new BufferGeometry())
  faceGeo.setAttribute('position', new Float32BufferAttribute(face, 3))
  faceGeo.setAttribute('normal', new Float32BufferAttribute(faceNor, 3))
  faceGeo.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  root.add(new Mesh(faceGeo, bag.add(new MeshToonMaterial({ map: thatchTexture(bag), gradientMap: toonGradient(), side: DoubleSide }))))
  return root
}

/** The small line on the poles under the band, white on a clear strip (it's seen from inside its cylinder, so the
 *  canvas is mirrored). */
function motto(bag: Bag, h: number, y: number) {
  // (The canvas has the strip's own shape, 0.48 rad of the arc by 0.62 m, so the letters aren't stretched.)
  const W = 1480
  const H = 256
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')!
  g.translate(W, 0)
  g.scale(-1, 1)
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.font = '600 92px "Fredoka", "Arial Rounded MT Bold", "Avenir Next", sans-serif'
  // A soft dark glow behind the letters, so white reads on the pale bamboo.
  g.shadowColor = 'rgba(74, 50, 26, 0.85)'
  g.shadowBlur = 18
  g.fillStyle = 'rgba(74, 50, 26, 0.7)'
  g.fillText('We hope to be the reason', W / 2 + 4, H * 0.3 + 5)
  g.fillText('you smile today', W / 2 + 4, H * 0.72 + 5)
  g.shadowBlur = 0
  g.fillStyle = '#FFFFFF'
  g.fillText('We hope to be the reason', W / 2, H * 0.3)
  g.fillText('you smile today', W / 2, H * 0.72)
  const tex = bag.add(new CanvasTexture(c))
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  const a = 0.24
  const geo = bag.add(new CylinderGeometry(WALL.r - 0.14, WALL.r - 0.14, h, 12, 1, true, Math.PI - a, a * 2))
  const mesh = new Mesh(geo, bag.add(new MeshToonMaterial({ map: tex, gradientMap: toonGradient(), transparent: true, alphaTest: 0.35, side: BackSide })))
  mesh.position.set(WALL.cx, y, WALL.cz)
  return mesh
}

/** A totem post: black and white bands, zigzag teeth and a spiral eye, a pointed cap. */
function totem(bag: Bag, x: number, z: number, k: number) {
  const parts = [P.cyl(0.2, 0.22, 0.2, INK, { at: [x, 0.1, z] }, 12)]
  for (let i = 0; i < 6; i++) {
    const y = 0.25 + i * 0.32
    parts.push(P.cyl(0.19, 0.19, 0.3, i % 2 ? '#FFFFFF' : INK, { at: [x, y + 0.15, z] }, 12))
    // Zigzag teeth round the white bands; a spiral (a ring and its dot) on the black ones.
    if (i % 2) for (let j = 0; j < 4; j++) parts.push(P.cone(0.05, 0.12, INK, { at: [x - 0.12 + j * 0.08, y + 0.08, z + 0.17], rot: [0, 0, Math.PI] }, 4))
    else parts.push(P.torus(0.07, 0.022, '#FFFFFF', { at: [x, y + 0.15, z + 0.18] }), P.sphere(0.025, '#FFFFFF', { at: [x, y + 0.15, z + 0.2] }, 6))
  }
  parts.push(P.cone(0.22, 0.34, INK, { at: [x, 2.34, z] }, 12), P.sphere(0.06, PAL.gold, { at: [x, 2.54, z] }, 8))
  const g = solid(merge(parts), bag, 2)
  g.userData.pick = `totem:${k}`
  return g
}

/** A potted palm: a terracotta pot and a fan of fronds. */
function pottedPalm(x: number, z: number, s = 1) {
  const parts = [P.cyl(0.26 * s, 0.2 * s, 0.4 * s, '#E58E6C', { at: [x, 0.2 * s, z] }, 12), P.cyl(0.27 * s, 0.27 * s, 0.05 * s, '#D27A5A', { at: [x, 0.4 * s, z] }, 12)]
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2
    parts.push(P.box(0.18 * s, 0.03, 0.8 * s, i % 2 ? FROND : FROND_DARK, { at: [x + Math.sin(a) * 0.32 * s, 0.75 * s, z + Math.cos(a) * 0.32 * s], rot: [0.7, a, 0] }))
  }
  parts.push(P.cyl(0.05 * s, 0.06 * s, 0.4 * s, '#A98A6E', { at: [x, 0.6 * s, z] }, 6))
  return parts
}

export function buildEntrance(bag: Bag): Entrance {
  const root = new Group()
  const z = ENTRY.z
  // ---- The ground: a gravel lot, the road along the front, sand under the deck ----
  root.add(
    solid(
      merge([
        P.box(60, 0.1, 40, EARTH, { at: [0, -0.05, z - 6] }),
        ...grassPatches(-28, 28, z - 24, z + 2.3, 6, 30, [-5.5, 5.5, z - 2, z + 2.6]),
        P.box(60, 0.012, ROAD.w, '#C9C4DE', { at: [0, 0.006, ROAD.z] }),
        ...Array.from({ length: 12 }, (_, i) => P.box(1.2, 0.01, 0.12, PAL.butter, { at: [-26 + i * 4.6, 0.014, ROAD.z] })),
        P.box(9, 0.01, 4.4, '#E6DCC6', { at: [0, 0.008, z + 0.4] }),
        ...groundScatter(-14, 14, z - 12, z + 0.4, 9, 8, 30),
      ]),
      bag,
      0,
    ),
  )
  // ---- The plank deck, its stumps, the driftwood tree, the pots ----
  const deckW = DECK.x1 - DECK.x0
  const deckD = DECK.z1 - DECK.z0
  const deckZ = (DECK.z0 + DECK.z1) / 2
  root.add(
    solid(
      merge([
        P.box(deckW, DECK.y, deckD, PLANK, { at: [0, DECK.y / 2, deckZ] }),
        ...Array.from({ length: 6 }, (_, i) => P.box(deckW, 0.006, 0.025, '#B7865C', { at: [0, DECK.y + 0.002, DECK.z0 + 0.4 + i * 0.4] })),
        // Tree-stump stools along the front of the deck.
        ...([[-2.3, z + 1.55, 0.24], [2.25, z + 1.6, 0.27], [1.6, z + 1.85, 0.2]] as const).flatMap(([x, sz, r]) => [
          P.cyl(r, r * 1.08, 0.36, STUMP, { at: [x, DECK.y + 0.18, sz] }, 12),
          P.cyl(r * 0.92, r * 0.92, 0.012, '#E3C08E', { at: [x, DECK.y + 0.365, sz] }, 12),
          P.torus(r * 0.55, 0.012, '#C9A06C', { at: [x, DECK.y + 0.37, sz], rot: [Math.PI / 2, 0, 0] }),
        ]),
        // The twisted driftwood tree, silver-grey.
        P.capsule(0.12, 1.3, DRIFT, { at: [-4.7, 0.75, z + 0.1], rot: [0, 0, 0.15] }),
        P.capsule(0.08, 0.9, DRIFT, { at: [-4.35, 1.75, z + 0.1], rot: [0.3, 0, -0.7] }),
        P.capsule(0.07, 0.8, DRIFT, { at: [-5.05, 1.85, z + 0.05], rot: [-0.2, 0, 0.8] }),
        P.capsule(0.05, 0.5, DRIFT, { at: [-4.0, 2.25, z + 0.15], rot: [0, 0, -1.2] }),
        P.capsule(0.045, 0.55, DRIFT, { at: [-5.45, 2.3, z + 0.1], rot: [0.3, 0, 1.3] }),
        P.capsule(0.04, 0.4, DRIFT, { at: [-4.55, 2.45, z - 0.05], rot: [-0.4, 0, -0.2] }),
        P.capsule(0.09, 0.3, '#A39383', { at: [-4.7, 0.12, z + 0.1], rot: [0, 0, 1.4] }),
        ...pottedPalm(4.75, z + 0.9),
        ...pottedPalm(-3.75, z + 1.9, 0.75),
        // A fern, and a green plastic basket.
        ...[0, 1, 2, 3, 4, 5].map((i) => P.sphere(0.22, i % 2 ? FROND : FROND_DARK, { at: [3.85 + Math.sin(i) * 0.18, 0.2 + (i % 2) * 0.06, z + 1.95 + Math.cos(i) * 0.12], scale: [1.4, 0.5, 0.8], rot: [0, i, 0.3] }, 8)),
        P.cyl(0.24, 0.2, 0.3, '#6FCB7F', { at: [3.1, 0.15, z + 2.35] }, 12),
      ]),
      bag,
      2,
    ),
  )
  // ---- The bamboo wall: upright poles along the arc (each with its nodes), the thatched band on top ----
  const poles = []
  const n = Math.round((WALL.a * 2 * WALL.r) / 0.165)
  for (let i = 0; i <= n; i++) {
    const t = -WALL.a + (i / n) * WALL.a * 2
    const [x, pz] = onArc(t)
    // (Up into the band, wherever its swoop is.)
    const h = bandAt(t / WALL.a)[0] + 0.3 + Math.sin(i * 2.7) * 0.05
    poles.push(P.cyl(0.075, 0.08, h, BAMBOO[i % 3], { at: [x, h / 2, pz] }, 8))
    for (const y of [0.55, 1.3]) poles.push(P.cyl(0.085, 0.085, 0.04, NODE, { at: [x, y + (i % 2) * 0.12, pz] }, 8))
  }
  root.add(solid(merge(poles), bag, 1))
  root.add(thatchBand(bag))
  root.add(motto(bag, 0.62, bandAt(0)[0] - 0.42))
  // ---- The totem posts either side of the deck (one at a time, so each can wobble on its own) ----
  const totems = TOTEMS.map(([x, , tz], i) => {
    const g = totem(bag, 0, 0, i)
    g.position.set(x, 0, tz)
    root.add(g)
    return g
  })
  // ---- Oil palms behind the wall ----
  const palms = []
  for (let i = -3; i <= 3; i++) for (let j = 0; j < 2; j++) palms.push(...oilPalm(i * 4 + (j % 2) * 2, z - 4.5 - j * 4.5, 5.6 + ((i + j) % 3) * 0.7, i * 0.8 + j, 0, j > 0))
  palms.push(...oilPalm(-8.5, z + 1.2, 6.4, 0.5), ...oilPalm(8.8, z + 0.6, 6.0, 1.7))
  root.add(solid(merge(palms), bag, 2))
  // ---- The songthaew (it drives in along the road) ----
  const songthaew = buildSongthaew(bag)
  songthaew.root.position.set(ROAD.x0, 0, ROAD.z)
  songthaew.root.userData.pick = 'songthaew'
  root.add(songthaew.root)
  return { root, songthaew, totems }
}

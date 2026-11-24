// Red Canoe's glacier: a tongue of ice flowing out of the col between two of the Ten Peaks and down its valley to the
// lake, the way a real valley glacier looks from the water. Up top a white snowfield; then an icefall, where the ice
// steepens and cracks into blue crevasses and seracs; then the smooth lower tongue, striped with curved bands (ogives)
// bowing downhill where the middle flows faster; rocky ridges of moraine along both sides; and at the water an ice
// cliff, fluted with blue, with a little ice cave at the bottom where the meltwater comes out. Ice chunks fall off it
// when she taps it (paddle.ts).
import { BufferAttribute, BufferGeometry, CanvasTexture, Color, Group, Mesh, MeshToonMaterial, SRGBColorSpace } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, solid } from '../../../../engine3d/geo'
import { toonGradient } from '../../../../engine3d/toon'
import { clamp, smoothstep } from '../../../../../sdk/math'
import { GLACIER, landY } from './lake'
import { bumps, cragPart, rng, rockPart, type CragLook } from './nature'

/** How far the glacier runs back from its cliff at the lake (m). */
export const GLACIER_LEN = 70
/** The top of the ice cliff above the water (m). */
const CLIFF_TOP = 3.6
/** The cliff's face stands this far out into the lake from GLACIER.z (m). */
const FRONT = 1.8

/** The middle of the glacier `u` of the way up (0 at the cliff, 1 at the col): x, z and the ice's height there. */
export function glacierAt(u: number) {
  const x = GLACIER.x + 3.5 * Math.sin(u * 2.4) - 1.5 * u
  const z = GLACIER.z + FRONT - u * GLACIER_LEN
  // A gentle lower tongue, the steep icefall in the middle, the snowfield easing off at the top.
  const y = CLIFF_TOP + 12 * u + 30 * smoothstep(0.34, 0.72, u) + 6 * u * u
  return { x, z, y }
}
/** Half the ice's width `u` of the way up: it narrows into the col and spreads a little at the snout. */
export function glacierHalf(u: number) {
  return GLACIER.halfWidth * (1.02 - 0.42 * u + 0.18 * (1 - u) ** 6)
}
/** Is (x, z) on the glacier or its moraines (with `pad` meters more)? (Trees and the stream keep off it.) */
export function onGlacier(x: number, z: number, pad = 0) {
  const u = (GLACIER.z + FRONT - z) / GLACIER_LEN
  if (u < -0.05 || u > 1.08) return false
  const c = glacierAt(clamp(u, 0, 1))
  return Math.abs(x - c.x) < glacierHalf(clamp(u, 0, 1)) + 3.5 + pad
}

/** The ice's surface pattern, painted once: across (x) and up the glacier (y, 0 at the bottom of the canvas = the
 *  cliff). Flat toon colors, no gradients (a canvas gradient speckles on iPads). */
function iceTexture(bag: Bag) {
  const W = 256
  const H = 1024
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const x = c.getContext('2d')!
  const Y = (u: number) => H * (1 - u)
  const rand = rng(97)
  x.fillStyle = '#E4F4FA'
  x.fillRect(0, 0, W, H)
  // The snowfield up top, whiter, with a ragged edge where it meets the ice.
  x.fillStyle = '#FFFFFF'
  x.beginPath()
  x.moveTo(0, 0)
  x.lineTo(W, 0)
  for (let i = 16; i >= 0; i--) x.lineTo((i / 16) * W, Y(0.7 + 0.04 * Math.sin(i * 1.9) + 0.02 * (i % 2)))
  x.closePath()
  x.fill()
  // Ogives: curved bands on the lower tongue, bowing downhill in the middle (the middle flows faster).
  for (let i = 0; i < 9; i++) {
    const u = 0.04 + i * 0.033
    x.strokeStyle = i % 2 ? '#C9E8F4' : '#D5EEF7'
    x.lineWidth = 11
    x.beginPath()
    for (let k = 0; k <= 20; k++) {
      const v = k / 20
      const yy = Y(u) + Math.sin(v * Math.PI) * 34
      if (k) x.lineTo(v * W, yy)
      else x.moveTo(v * W, yy)
    }
    x.stroke()
  }
  // The icefall: rows of blue crevasses, each a dark slot with a pale lip on its uphill side.
  for (let row = 0; row < 11; row++) {
    const u = 0.36 + row * 0.03
    let v = rand() * 0.12
    while (v < 0.95) {
      const len = 0.12 + rand() * 0.2
      const bow = Math.sin((v + len / 2) * Math.PI) * 18
      const y0 = Y(u) + bow
      x.lineCap = 'round'
      x.strokeStyle = '#F4FBFD'
      x.lineWidth = 7
      x.beginPath()
      x.moveTo(v * W, y0 - 5)
      x.quadraticCurveTo((v + len / 2) * W, y0 - 5 + 7, (v + len) * W, y0 - 5)
      x.stroke()
      x.strokeStyle = '#4FA9D6'
      x.lineWidth = 5
      x.beginPath()
      x.moveTo(v * W, y0)
      x.quadraticCurveTo((v + len / 2) * W, y0 + 7, (v + len) * W, y0)
      x.stroke()
      v += len + 0.04 + rand() * 0.08
    }
  }
  // Crevasses at the edges on the lower tongue, slanting up and in (the sides drag on the rock).
  for (const side of [0, 1])
    for (let i = 0; i < 7; i++) {
      const u = 0.06 + i * 0.04
      const x0 = side ? W * 0.97 : W * 0.03
      const x1 = side ? W * 0.82 : W * 0.18
      x.strokeStyle = '#7CC2E2'
      x.lineWidth = 4
      x.beginPath()
      x.moveTo(x0, Y(u))
      x.lineTo(x1, Y(u + 0.03))
      x.stroke()
    }
  // Dirty ice along the edges, where the moraine's grit lies on it.
  for (const side of [0, 1]) {
    x.fillStyle = '#C7C1D3'
    x.beginPath()
    const e = side ? W : 0
    x.moveTo(e, H)
    for (let i = 0; i <= 24; i++) x.lineTo(side ? W - (12 + 6 * Math.sin(i * 1.3)) : 12 + 6 * Math.sin(i * 1.3), H - (i / 24) * H * 0.72)
    x.lineTo(e, H * 0.28)
    x.closePath()
    x.fill()
  }
  const tex = bag.add(new CanvasTexture(c))
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/** The ice's surface: a strip up the valley, crowned across (higher in the middle), its sides tucked down into the
 *  ground under the moraines. */
function surface(bag: Bag) {
  const NU = 40
  const V = [-1.35, -1, -0.85, -0.6, -0.3, 0, 0.3, 0.6, 0.85, 1, 1.35]
  const pos: number[] = []
  const uv: number[] = []
  for (let i = 0; i <= NU; i++) {
    const u = i / NU
    const c = glacierAt(u)
    const hw = glacierHalf(u)
    for (const v of V) {
      const vv = clamp(v, -1, 1)
      const x = c.x + v * hw
      const crown = 1.6 * (1 - vv * vv) + 0.35 * bumps(x * 0.3, u * 9, v * 2, 3) * (1 - vv * vv)
      // (Past the edges, down under the moraine.)
      const y = Math.abs(v) > 1 ? Math.min(c.y - 3, landY(x, c.z) - 0.5) : c.y + crown
      pos.push(x, y, c.z)
      uv.push((vv + 1) / 2, u)
    }
  }
  const idx: number[] = []
  const W = V.length
  for (let i = 0; i < NU; i++)
    for (let j = 0; j < W - 1; j++) {
      const a = i * W + j
      idx.push(a, a + 1, a + W, a + 1, a + W + 1, a + W)
    }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  g.setAttribute('uv', new BufferAttribute(new Float32Array(uv), 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  const mat = bag.add(new MeshToonMaterial({ map: iceTexture(bag), gradientMap: toonGradient() }))
  return new Mesh(bag.add(g), mat)
}

/** The ice's colors as a crag: pale blue faces, deeper blue in the shade, white on top. */
const ICE: CragLook = { rock: '#D2EEF9', dark: '#9DD8F0', snow: '#FFFFFF', snowLine: 0.72 }

/** The ice cliff at the water: one wall of ice, fluted top to bottom (ribs standing out, grooves set back), deep blue
 *  at the waterline, paler up to its white lip; its top broken into tipped blocks; the dark blue mouth of an ice cave at
 *  the bottom, where the meltwater comes out. Flat shaded, painted corner by corner. */
function cliff() {
  const c0 = glacierAt(0)
  const hw = glacierHalf(0) + 0.4
  const NX = 44
  const NY = 6
  const pos: number[] = []
  const col: number[] = []
  const deep = new Color('#4FAEDB')
  const mid = new Color('#8FD2EE')
  const pale = new Color('#CDEEF9')
  const lip = new Color('#F1FAFD')
  const cave = new Color('#2C79B0')
  const c = new Color()
  const top = (v: number) => CLIFF_TOP + 1.6 * (1 - v * v) + 0.5 * bumps(v * 6, 0, 0, 2)
  const at = (i: number, j: number) => {
    const v = (i / NX) * 2 - 1
    const t = j / NY
    const x = c0.x + v * hw
    const y = -1.2 + (top(v) + 1.2) * t
    // Flutes: ribs and grooves, a little deeper low down; the wall leans back a touch.
    const flute = 0.4 * Math.sin(v * 23 + 2 * Math.sin(v * 7)) + 0.25 * Math.sin(v * 59 + 1) + 0.2 * bumps(v * 9, t * 2, 0, 4)
    const z = c0.z + flute * (1.1 - t * 0.4) - t * 0.6 + (1 - v * v) * 0.6
    return { x, y, z, v, t, flute }
  }
  for (let i = 0; i < NX; i++)
    for (let j = 0; j < NY; j++) {
      const a = at(i, j)
      const b = at(i + 1, j)
      const d = at(i, j + 1)
      const e = at(i + 1, j + 1)
      const quad = [a, b, d, b, e, d]
      // (One color per facet: by height, darker in the grooves, the cave's arch low in the middle.)
      const t = (a.t + e.t) / 2 + 0.5 / NY
      const v = (a.v + e.v) / 2
      const groove = (a.flute + b.flute) / 2 < -0.1
      const inCave = Math.hypot((v + 0.18) * 7, t * 2.4) < 1
      if (inCave) c.copy(cave)
      else if (t < 0.3) c.copy(deep)
      else if (t < 0.62) c.copy(groove ? deep : mid)
      else if (t < 0.9) c.copy(groove ? mid : pale)
      else c.copy(lip)
      for (const q of quad) {
        pos.push(q.x, q.y, q.z)
        col.push(c.r, c.g, c.b)
      }
    }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  g.computeVertexNormals()
  g.setAttribute('color', new BufferAttribute(new Float32Array(col), 3))
  // Blocks along the lip, tipped this way and that, where the ice is about to break off.
  const rand = rng(83)
  const parts = [g]
  for (let i = 0; i < 13; i++) {
    const v = ((i + rand()) / 13) * 2 - 1
    const a = at(Math.round(((v + 1) / 2) * NX), NY)
    const s = 0.8 + rand() * 0.6
    parts.push(cragPart(s * 1.6, s * (1.1 + rand() * 0.9), 200 + i * 1.7, ICE, { at: [a.x, a.y + s * 0.5, a.z - 0.9], rot: [(rand() - 0.5) * 0.4, rand() * 3, (rand() - 0.5) * 0.4] }, 5))
  }
  return merge(parts)
}

/** Seracs: jagged towers of ice standing up out of the icefall, and a few broken ones lower down. */
function seracs() {
  const rand = rng(29)
  const parts = []
  for (let i = 0; i < 30; i++) {
    const u = i < 24 ? 0.36 + rand() * 0.34 : 0.08 + rand() * 0.18
    const c = glacierAt(u)
    const v = (rand() * 2 - 1) * 0.82
    const x = c.x + v * glacierHalf(u)
    const s = (i < 24 ? 1.3 : 0.8) + rand() * 1.1
    parts.push(cragPart(s * 1.4, s * (1.3 + rand() * 1.1), 300 + i * 3.3, ICE, { at: [x, c.y + 1.6 * (1 - v * v) + s * 0.6, c.z], rot: [(rand() - 0.5) * 0.3, rand() * 3, (rand() - 0.5) * 0.3] }, 5))
  }
  return merge(parts)
}

/** The lateral moraines: a ridge of rubble down each side, boulders tumbled along its crest. */
function moraines() {
  const rand = rng(61)
  const parts = []
  for (const side of [-1, 1])
    for (let i = 0; i < 26; i++) {
      const u = 0.01 + (i / 26) * 0.95
      const c = glacierAt(u)
      const x = c.x + side * (glacierHalf(u) + 0.6 + rand() * 1.4)
      const y = Math.max(c.y - 1.6, landY(x, c.z))
      const s = 1.8 + rand() * 1.6
      parts.push(rockPart(s * 1.8, i % 3 ? '#A9A1BA' : '#968DAA', 400 + i + side * 50, { at: [x, y - 0.6, c.z], rot: [0, rand() * 3, 0], scale: [1.3, 0.9 + rand() * 0.4, 1.2] }, i % 4 === 0))
      if (rand() < 0.6) parts.push(rockPart(0.9 + rand() * 0.8, '#BDB6CA', 500 + i, { at: [x + side * (rand() - 0.3) * 2, y + s * 0.6, c.z + (rand() - 0.5) * 2], rot: [0, rand() * 3, 0] }))
    }
  return merge(parts)
}

export function buildGlacier(bag: Bag) {
  const g = new Group()
  g.add(surface(bag), solid(cliff(), bag, 2), solid(seracs(), bag, 1.6), solid(moraines(), bag, 1.6))
  return g
}

// The pictures on Agong's walls, from Dad's photo of his desk (~/refs, 2026-10-18): portraits in a white or pale blue
// dress uniform with a sash, in big gold frames (Thai homes hang royal portraits); a faded photo of a couple and an
// old sepia family photo in dark wood; a framed certificate; and a tear-off calendar with a big red date. All drawn on
// one small canvas (an atlas), so a whole wall of frames is one textured mesh.
import { CanvasTexture, Matrix4, Mesh, MeshToonMaterial, PlaneGeometry, SRGBColorSpace, type BufferGeometry } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { toonGradient } from '../../../../../engine3d/toon'
import type { Kit } from './kit'

export type PictureKind = 'uniform-white' | 'uniform-blue' | 'couple' | 'family' | 'certificate' | 'calendar'
const KINDS: PictureKind[] = ['uniform-white', 'uniform-blue', 'couple', 'family', 'certificate', 'calendar']

const CW = 160
const CH = 200
const COLS = 3
const ROWS = 2

type G = CanvasRenderingContext2D

function person(g: G, x: number, y: number, s: number, o: { coat: string; hair?: string; skin?: string; sash?: string; collar?: string }) {
  const skin = o.skin ?? '#E6B992'
  // Shoulders and coat.
  g.fillStyle = o.coat
  g.beginPath()
  g.moveTo(x - 46 * s, y + 120 * s)
  g.quadraticCurveTo(x - 44 * s, y + 52 * s, x, y + 46 * s)
  g.quadraticCurveTo(x + 44 * s, y + 52 * s, x + 46 * s, y + 120 * s)
  g.closePath()
  g.fill()
  if (o.collar) {
    g.fillStyle = o.collar
    g.fillRect(x - 9 * s, y + 42 * s, 18 * s, 10 * s)
  }
  if (o.sash) {
    // A sash from the right shoulder to the left hip, and medals on the chest.
    g.strokeStyle = o.sash
    g.lineWidth = 9 * s
    g.beginPath()
    g.moveTo(x + 30 * s, y + 56 * s)
    g.lineTo(x - 26 * s, y + 118 * s)
    g.stroke()
    g.fillStyle = '#E8B33A'
    for (const [dx, dy] of [
      [-30, 54],
      [30, 54],
    ])
      g.fillRect(x + (dx - 9) * s, y + (dy - 3) * s, 18 * s, 6 * s)
    ;['#D9473B', '#E8B33A', '#3E6FB0', '#E8B33A'].forEach((c, i) => {
      g.fillStyle = c
      g.beginPath()
      g.arc(x - 20 * s + (i % 2) * 9 * s, y + 70 * s + Math.floor(i / 2) * 9 * s, 3.5 * s, 0, Math.PI * 2)
      g.fill()
    })
  }
  // Neck, head, hair.
  g.fillStyle = skin
  g.fillRect(x - 7 * s, y + 30 * s, 14 * s, 16 * s)
  g.beginPath()
  g.ellipse(x, y + 18 * s, 17 * s, 21 * s, 0, 0, Math.PI * 2)
  g.fill()
  g.fillStyle = o.hair ?? '#2A2420'
  g.beginPath()
  g.ellipse(x, y + 4 * s, 18 * s, 11 * s, 0, Math.PI, Math.PI * 2)
  g.fill()
  g.fillRect(x - 18 * s, y + 2 * s, 5 * s, 10 * s)
  // A kind face: eyes and a little smile.
  g.fillStyle = '#2A2420'
  for (const dx of [-6, 6]) {
    g.beginPath()
    g.ellipse(x + dx * s, y + 17 * s, 1.8 * s, 2.2 * s, 0, 0, Math.PI * 2)
    g.fill()
  }
  g.strokeStyle = '#8A4B3A'
  g.lineWidth = 1.6 * s
  g.beginPath()
  g.arc(x, y + 24 * s, 5 * s, 0.2 * Math.PI, 0.8 * Math.PI)
  g.stroke()
}

const DRAW: Record<PictureKind, (g: G) => void> = {
  'uniform-white'(g) {
    const grd = g.createLinearGradient(0, 0, 0, CH)
    grd.addColorStop(0, '#6F8FB3')
    grd.addColorStop(1, '#B9CBDD')
    g.fillStyle = grd
    g.fillRect(0, 0, CW, CH)
    person(g, CW / 2, 46, 1.15, { coat: '#FBFAF5', sash: '#3E64B5', collar: '#E8B33A' })
  },
  'uniform-blue'(g) {
    g.fillStyle = '#E6DFCF'
    g.fillRect(0, 0, CW, CH)
    person(g, CW / 2, 46, 1.15, { coat: '#A9C6E8', sash: '#24407F', collar: '#E8B33A' })
  },
  couple(g) {
    g.fillStyle = '#C9C3B0'
    g.fillRect(0, 0, CW, CH)
    g.fillStyle = '#B5AE98'
    g.fillRect(0, 120, CW, 80)
    person(g, 52, 62, 0.85, { coat: '#3D3A40', collar: '#F2EEE2' })
    person(g, 108, 70, 0.8, { coat: '#E7D9C4', hair: '#3A2E28' })
  },
  family(g) {
    g.fillStyle = '#C9AF86'
    g.fillRect(0, 0, CW, CH)
    g.fillStyle = '#B49870'
    g.fillRect(0, 130, CW, 70)
    const sepia = { skin: '#D9BC92', hair: '#4A3826' }
    person(g, 42, 52, 0.7, { coat: '#6E5A40', ...sepia })
    person(g, 118, 52, 0.7, { coat: '#E2D2B2', ...sepia })
    person(g, 64, 96, 0.55, { coat: '#9C8360', ...sepia })
    person(g, 98, 100, 0.5, { coat: '#EADBBE', ...sepia })
  },
  certificate(g) {
    g.fillStyle = '#FBF8EE'
    g.fillRect(0, 0, CW, CH)
    g.strokeStyle = '#C9A24E'
    g.lineWidth = 4
    g.strokeRect(10, 10, CW - 20, CH - 20)
    // A gold emblem, then lines of writing.
    g.fillStyle = '#E2B13C'
    g.beginPath()
    g.arc(CW / 2, 40, 15, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#9AA0A8'
    for (let i = 0; i < 9; i++) g.fillRect(26 + (i % 3 === 2 ? 20 : 0), 70 + i * 11, CW - 52 - (i % 3 === 2 ? 40 : 0), 3)
    g.fillStyle = '#D9473B'
    g.beginPath()
    g.arc(CW - 40, CH - 34, 10, 0, Math.PI * 2)
    g.fill()
  },
  calendar(g) {
    g.fillStyle = '#FFFFFF'
    g.fillRect(0, 0, CW, CH)
    g.fillStyle = '#D9473B'
    g.fillRect(0, 0, CW, 26)
    g.fillStyle = '#C8333B'
    g.font = 'bold 92px Fredoka, sans-serif'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillText('12', CW / 2, 78)
    // The little month grid under the big date.
    g.fillStyle = '#A9A3B0'
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) g.fillRect(14 + c * 19, 136 + r * 14, 11, 7)
    g.fillStyle = '#D9473B'
    g.fillRect(14 + 4 * 19, 136 + 1 * 14, 11, 7)
  },
}

let atlas: HTMLCanvasElement | null = null
function drawAtlas() {
  if (atlas) return atlas
  const c = document.createElement('canvas')
  c.width = CW * COLS
  c.height = CH * ROWS
  const g = c.getContext('2d')!
  KINDS.forEach((k, i) => {
    g.save()
    g.translate((i % COLS) * CW, Math.floor(i / COLS) * CH)
    g.beginPath()
    g.rect(0, 0, CW, CH)
    g.clip()
    DRAW[k](g)
    g.restore()
  })
  return (atlas = c)
}

/** A picture w by h meters facing +z, placed by `m`, showing one cell of the atlas. */
export function picturePlane(kind: PictureKind, w: number, h: number, m: Matrix4): BufferGeometry {
  const geo = new PlaneGeometry(w, h)
  const i = KINDS.indexOf(kind)
  const u0 = (i % COLS) / COLS
  const v1 = 1 - Math.floor(i / COLS) / ROWS
  const uv = geo.attributes.uv
  for (let k = 0; k < uv.count; k++) uv.setXY(k, u0 + uv.getX(k) / COLS, v1 - (1 - uv.getY(k)) / ROWS)
  geo.applyMatrix4(m)
  return geo
}

/** One mesh for many pictures (picturePlane geometries), lit like the rest of the house. */
export function pictureMesh(kit: Kit, planes: BufferGeometry[]) {
  const tex = kit.bag.add(new CanvasTexture(drawAtlas()))
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  const merged = mergeGeometries(planes, false)!
  for (const p of planes) p.dispose()
  return new Mesh(kit.bag.add(merged), kit.bag.add(new MeshToonMaterial({ map: tex, gradientMap: toonGradient() })))
}

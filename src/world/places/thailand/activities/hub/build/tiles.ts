// The patterned cement tiles on Agong's shop floor, like old Thai-Chinese shophouses have: a pink four-petal flower
// in the middle of each tile and mint quarter-circles in the corners that join into circles across four tiles. Drawn
// once on a canvas and repeated; the toon material still gives it the house's light bands.
import { CanvasTexture, Mesh, MeshToonMaterial, PlaneGeometry, RepeatWrapping, SRGBColorSpace } from 'three'
import { toonGradient } from '../../../engine/toon'
import type { Kit } from './kit'

/** One tile is this many meters across. */
const TILE = 0.5

function drawTile() {
  const n = 128
  const c = document.createElement('canvas')
  c.width = c.height = n
  const g = c.getContext('2d')!
  g.fillStyle = '#FFF1E2'
  g.fillRect(0, 0, n, n)
  // Corner quarter-circles (a full circle where four tiles meet).
  g.fillStyle = '#BFE6DA'
  for (const [x, y] of [
    [0, 0],
    [n, 0],
    [0, n],
    [n, n],
  ]) {
    g.beginPath()
    g.arc(x, y, n * 0.26, 0, Math.PI * 2)
    g.fill()
  }
  g.fillStyle = '#FFF1E2'
  for (const [x, y] of [
    [0, 0],
    [n, 0],
    [0, n],
    [n, n],
  ]) {
    g.beginPath()
    g.arc(x, y, n * 0.15, 0, Math.PI * 2)
    g.fill()
  }
  // The flower: four petals and a butter center.
  g.fillStyle = '#FFB3CF'
  for (let i = 0; i < 4; i++) {
    g.save()
    g.translate(n / 2, n / 2)
    g.rotate((i * Math.PI) / 2)
    g.beginPath()
    g.ellipse(0, -n * 0.17, n * 0.09, n * 0.16, 0, 0, Math.PI * 2)
    g.fill()
    g.restore()
  }
  g.fillStyle = '#FBE27A'
  g.beginPath()
  g.arc(n / 2, n / 2, n * 0.07, 0, Math.PI * 2)
  g.fill()
  // Little lavender diamonds between the petals.
  g.fillStyle = '#C9B5F7'
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2
    const x = n / 2 + Math.cos(a) * n * 0.25
    const y = n / 2 + Math.sin(a) * n * 0.25
    g.beginPath()
    g.moveTo(x, y - 7)
    g.lineTo(x + 7, y)
    g.lineTo(x, y + 7)
    g.lineTo(x - 7, y)
    g.fill()
  }
  // Grout.
  g.strokeStyle = '#E9CDB4'
  g.lineWidth = 3
  g.strokeRect(0, 0, n, n)
  return c
}

/** A tiled floor w by d meters, centered at (x, z), its top at y. */
export function tileFloor(kit: Kit, w: number, d: number, x: number, z: number, y = 0.002) {
  const tex = kit.bag.add(new CanvasTexture(drawTile()))
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = tex.wrapT = RepeatWrapping
  tex.repeat.set(w / TILE, d / TILE)
  tex.anisotropy = 4
  const mat = kit.bag.add(new MeshToonMaterial({ map: tex, gradientMap: toonGradient() }))
  const mesh = new Mesh(kit.bag.add(new PlaneGeometry(w, d)), mat)
  mesh.rotation.x = -Math.PI / 2
  mesh.position.set(x, y, z)
  return mesh
}

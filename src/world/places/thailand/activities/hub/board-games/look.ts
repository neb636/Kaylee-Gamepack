// The floating board's finish, shared by the island, the three boards, the pieces and the die: a soft plum line
// instead of ink (the whole stage is pastel, and ink round every sweet and stone looked scratchy), soft shadows on the
// ground under everything that stands on it (there are no shadow maps: these are painted discs, which is all a toy
// table needs), and the paint helpers the boards' tops share.
import { BufferAttribute, BufferGeometry, CanvasTexture, Mesh, MeshBasicMaterial, MeshToonMaterial, SRGBColorSpace, type Group, type Texture } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, solid } from '../../../../../engine3d/geo'
import { toonGradient } from '../../../../../engine3d/toon'

/** The line round everything on the floating board. */
export const LINE = '#8A6AA6'

/** A finished toy shape with the stage's soft line (`px` wide; 0: none). */
export function toy(parts: BufferGeometry | BufferGeometry[], bag: Bag, px = 1.3): Group {
  return solid(Array.isArray(parts) ? merge(parts) : parts, bag, px, LINE)
}

/** The sun's side of things, as the shadows see it: they fall a little to the back left of what casts them. */
const CAST = { x: -0.28, z: -0.34 }

let blob: CanvasTexture | null = null
let blobMat: MeshBasicMaterial | null = null
function shadowMaterial(): MeshBasicMaterial {
  if (!blob) {
    const c = document.createElement('canvas')
    c.width = c.height = 96
    const g = c.getContext('2d')!
    const grad = g.createRadialGradient(48, 48, 0, 48, 48, 48)
    grad.addColorStop(0, 'rgba(96,70,140,.46)')
    grad.addColorStop(0.55, 'rgba(96,70,140,.3)')
    grad.addColorStop(1, 'rgba(96,70,140,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 96, 96)
    blob = new CanvasTexture(c)
    blob.colorSpace = SRGBColorSpace
  }
  return (blobMat ??= new MeshBasicMaterial({ map: blob, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }))
}

/** One soft shadow: where its caster stands (x, z), how wide it is (r) and how tall (h: taller things throw it
 *  further), and the ground's height there (y). */
export type Shade = [x: number, z: number, r: number, h?: number, y?: number]

/** Soft shadows on the ground, all in one mesh (one draw call however many). */
export function shadows(bag: Bag, list: Shade[]): Mesh {
  const pos = new Float32Array(list.length * 18)
  const uv = new Float32Array(list.length * 12)
  list.forEach(([x, z, r, h = 0.06, y = 0], i) => {
    // An ellipse stretched away from the sun, its near end under the caster's foot.
    const cx = x + CAST.x * h
    const cz = z + CAST.z * h
    const rx = r * 1.15 + Math.abs(CAST.x) * h * 0.6
    const rz = r * 1.15 + Math.abs(CAST.z) * h * 0.6
    const yy = y + 0.0015
    const q = [
      [cx - rx, cz - rz, 0, 1],
      [cx - rx, cz + rz, 0, 0],
      [cx + rx, cz + rz, 1, 0],
      [cx - rx, cz - rz, 0, 1],
      [cx + rx, cz + rz, 1, 0],
      [cx + rx, cz - rz, 1, 1],
    ]
    q.forEach(([px, pz, u, v], j) => {
      pos.set([px, yy, pz], i * 18 + j * 3)
      uv.set([u, v], i * 12 + j * 2)
    })
  })
  const geo = bag.add(new BufferGeometry())
  geo.setAttribute('position', new BufferAttribute(pos, 3))
  geo.setAttribute('uv', new BufferAttribute(uv, 2))
  const m = new Mesh(geo, shadowMaterial())
  m.renderOrder = 1
  m.raycast = () => {}
  return m
}

/** A flat painted top that takes the scene's light like everything round it (so its base color matches the toon
 *  shape it lies on). */
export function paintedMaterial(bag: Bag, canvas: HTMLCanvasElement, transparent = false): MeshToonMaterial {
  const tex = bag.add(new CanvasTexture(canvas)) as Texture
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 8
  return bag.add(new MeshToonMaterial({ map: tex, gradientMap: toonGradient(), transparent, depthWrite: !transparent }))
}

/** A tiny deterministic random (the stage looks the same every visit). */
export function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** A four-point sparkle, for painted tops. */
export function glint(g: CanvasRenderingContext2D, x: number, y: number, r: number) {
  g.beginPath()
  g.moveTo(x, y - r)
  g.quadraticCurveTo(x + r * 0.12, y - r * 0.12, x + r, y)
  g.quadraticCurveTo(x + r * 0.12, y + r * 0.12, x, y + r)
  g.quadraticCurveTo(x - r * 0.12, y + r * 0.12, x - r, y)
  g.quadraticCurveTo(x - r * 0.12, y - r * 0.12, x, y - r)
  g.fill()
}

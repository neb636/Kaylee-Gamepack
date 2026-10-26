// The wings drawer, on her back. Body-local: the back of her dress is at z -0.096 round y 0.3, her hair hangs down over
// her back to y 0.38 and out to z -0.30 and 0.356 to each side, her arms hang out to x ±0.28 (measured on kaylee.glb).
// So wings start under her hair and reach out past its sides, where she can see them from the front.
//
// Fairy wings (mint and lavender, glittery), feathered pink unicorn wings, a princess cape from her shoulders, and a
// bunny backpack (a bunny's face on the back, lop ears down its sides). Wings fold flat when she sits, walks or lies
// (avatar.ts's Dress: `userData.wings`), the cape drapes shorter (`userData.cape`); the backpack stays put.
import { DoubleSide, Group, LatheGeometry, Mesh, MeshToonMaterial, Vector2, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../engine/dispose'
import { bake, P } from '../../engine/geo'
import { makeHull } from '../../engine/outline'
import { toonGradient } from '../../engine/toon'
import { group, PX, ZC } from '../model-wear'
import { aim, facing, star } from './fit'

let capeMat: MeshToonMaterial | null = null
type Parts = BufferGeometry[]
const UP = new Vector3(0, 1, 0)

/** A line of capsules through `pts` (a strap). */
function strap(pts: Vector3[], r: number, c: string, out: Parts) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]]
    const mid = a.clone().add(b).multiplyScalar(0.5)
    out.push(P.capsule(r, a.distanceTo(b), c, { at: [mid.x, mid.y, mid.z], rot: aim(b.clone().sub(a)) }))
  }
}

export function buildBack(id: string, bag: Bag): Group {
  const lined: Parts = []
  const plain: Parts = []
  if (id === 'fairy') {
    // Two big upper wings out past her hair and two small lower ones beside her arms: each a mint (or lavender) teardrop
    // with a paler middle that shows front and back, and glitter.
    for (const s of [-1, 1]) {
      for (const [x, y, r, c, light, tip] of [
        [0.31, 0.5, 0.18, '#B6EEDB', '#E2FBF2', -0.6],
        [0.24, 0.27, 0.115, '#D2C2FF', '#EEE7FF', 0.45],
      ] as const) {
        const at: [number, number, number] = [s * x, y, -0.2]
        const rot: [number, number, number] = [0.15, s * 0.42, s * tip]
        lined.push(P.sphere(r, c, { at, rot, scale: [1.2, 0.74, 0.08] }, 22))
        plain.push(P.sphere(r * 0.7, light, { at, rot, scale: [1.2, 0.7, 0.12] }, 18))
        for (let i = 0; i < 4; i++) {
          const a = i * 1.7 + (s > 0 ? 0 : 0.8)
          const d = r * 0.55
          const p = new Vector3(Math.cos(a) * d * 1.1, Math.sin(a) * d * 0.62, 0).applyAxisAngle(new Vector3(0, 0, 1), s * tip).applyAxisAngle(UP, s * 0.42)
          plain.push(P.sphere(0.009, '#FFFFFF', { at: [at[0] + p.x, at[1] + p.y, at[2] + p.z], scale: [1, 1, 2.2] }, 6))
        }
      }
    }
    lined.push(P.sphere(0.038, '#FF8FB8', { at: [0, 0.36, -0.115], scale: [1, 1.2, 0.7] }))
    const g = group(lined, plain, bag)!
    g.userData.wings = true
    return g
  }
  if (id === 'wings') {
    // A unicorn's feathered wings from her shoulder blades: two rows of pointed feathers fanned out and up past her
    // hair (long white-to-pink ones, short lavender ones over their roots), and a round white covert on top.
    const long = ['#FFFFFF', '#FFF0F6', '#FFE3EF', '#FFD3E5', '#FFC2DD', '#FFB3D1', '#FFA8CF']
    for (const s of [-1, 1]) {
      const root = new Vector3(s * 0.13, 0.42, -0.2)
      const feather = (a: number, len: number, w: number, c: string, from: number) => {
        const dir = new Vector3(s * Math.cos(a), Math.sin(a), 0).applyAxisAngle(UP, s * 0.32)
        const mid = root.clone().addScaledVector(dir, from + len / 2)
        lined.push(P.sphere(len / 2, c, { at: [mid.x, mid.y, mid.z], rot: aim(dir), scale: [w, 1, 0.16] }, 12))
      }
      for (let i = 0; i < 7; i++) feather(-0.2 + i * 0.2, 0.2 + Math.sin((i / 6) * Math.PI) * 0.1, 0.3, long[i], 0.07)
      for (let i = 0; i < 5; i++) feather(0.0 + i * 0.22, 0.13, 0.42, i % 2 ? '#E9DEFF' : '#D9C6FF', 0.04)
      const cover = root.clone().addScaledVector(new Vector3(s, 0.55, 0).normalize().applyAxisAngle(UP, s * 0.32), 0.07)
      lined.push(P.sphere(0.085, '#FFFFFF', { at: [cover.x, cover.y, cover.z], rot: [0, s * 0.32, s * -0.5], scale: [1.35, 0.8, 0.45] }, 16))
    }
    const g = group(lined, plain, bag)!
    g.userData.wings = true
    return g
  }
  if (id === 'backpack') {
    // A pink bunny on her back, below her hair: its face looking out behind her, lop ears down its sides, white straps
    // over her shoulders.
    const at = new Vector3(0, 0.27, -0.16)
    lined.push(P.rbox(0.2, 0.17, 0.11, 0.05, '#FFD3E5', { at: [at.x, at.y, at.z] }))
    for (const s of [-1, 1]) {
      lined.push(P.capsule(0.03, 0.08, '#FFD3E5', { at: [s * 0.112, at.y - 0.005, at.z - 0.01], rot: [0, 0, s * 0.18], scale: [0.7, 1, 1] }))
      plain.push(P.capsule(0.016, 0.06, '#FFA8CF', { at: [s * 0.124, at.y - 0.005, at.z - 0.012], rot: [0, 0, s * 0.18], scale: [0.6, 1, 0.8] }))
      plain.push(P.sphere(0.013, '#3A2F45', { at: [s * 0.042, at.y + 0.02, at.z - 0.056] }, 8))
      plain.push(P.sphere(0.016, '#FFA8CF', { at: [s * 0.06, at.y - 0.012, at.z - 0.054], scale: [1, 0.7, 0.4] }, 8))
      strap([new Vector3(s * 0.06, at.y + 0.07, at.z + 0.04), new Vector3(s * 0.07, 0.455, -0.04), new Vector3(s * 0.075, 0.45, 0.07), new Vector3(s * 0.08, 0.35, 0.16)], 0.011, '#FFFFFF', lined)
    }
    plain.push(P.sphere(0.012, '#FF6FAE', { at: [0, at.y, at.z - 0.058], scale: [1.2, 0.9, 0.6] }, 8))
    plain.push(P.sphere(0.03, '#FFFFFF', { at: [0, at.y - 0.06, at.z - 0.05] }, 10))
    return group(lined, plain, bag)!
  }
  // The cape: the back half of a cone from her shoulders down past her hem, open at the front, two-sided (its inside
  // shows past her arms), with a gold clasp at her neck and gold stars down its back.
  const rings = [
    [0.465, 0.11],
    [0.4, 0.15],
    [0.3, 0.19],
    [0.2, 0.225],
    [0.13, 0.24],
  ].map(([y, r]) => new Vector2(r, y))
  const lathe = new LatheGeometry(rings.reverse(), 24, Math.PI / 2 + 0.25, Math.PI - 0.5)
  lathe.translate(0, 0, ZC)
  const geo = bake(lathe, '#B48CF0', { scale: [1, 1, 1.05] })
  capeMat ??= new MeshToonMaterial({ vertexColors: true, gradientMap: toonGradient(), side: DoubleSide })
  const g = new Group()
  const mesh = new Mesh(bag.add(geo), capeMat)
  g.add(mesh)
  const hull = makeHull(geo, PX)
  bag.add(hull.geometry)
  g.add(hull)
  const stars: Parts = []
  for (const [x, y] of [[0, 0.33], [-0.09, 0.24], [0.1, 0.2], [0.02, 0.16]]) {
    // On the cape's back at that height (its radius there, a little proud).
    const r = 0.19 + (0.3 - y) * 0.35
    const z = ZC - Math.sqrt(Math.max(0, r * r - x * x)) * 1.05 - 0.006
    stars.push(facing(P.prism(star(0.024), 0.006, '#FFE36E'), new Vector3(x, y, z), new Vector3(x, 0, z - ZC)))
  }
  const deco = group([P.sphere(0.022, '#FFC83D', { at: [0, 0.45, 0.1] })], stars, bag)
  if (deco) g.add(deco)
  g.userData.cape = true
  return g
}

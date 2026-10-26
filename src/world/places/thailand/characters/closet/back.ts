// The wings drawer: fairy wings (mint and lavender, out past her hair on both sides) and a princess cape from her
// shoulders. Body-local: the back of her dress is at z -0.07 round y 0.3, and her hair hangs down over her back to
// y 0.38 and out to z -0.30, so the wings start under it and reach out past its sides (0.36).
import { DoubleSide, Group, LatheGeometry, Mesh, MeshToonMaterial, Vector2 } from 'three'
import type { Bag } from '../../engine/dispose'
import { bake, P } from '../../engine/geo'
import { makeHull } from '../../engine/outline'
import { toonGradient } from '../../engine/toon'
import { group, PX, ZC } from '../model-wear'

let capeMat: MeshToonMaterial | null = null

export function buildBack(id: string, bag: Bag): Group {
  if (id === 'fairy') {
    const lined = []
    for (const s of [-1, 1]) {
      lined.push(P.sphere(0.16, '#C9F2E4', { at: [s * 0.27, 0.47, -0.2], rot: [0.2, s * 0.35, s * -0.55], scale: [1.15, 0.72, 0.1] }, 20))
      lined.push(P.sphere(0.1, '#D9CCFF', { at: [s * 0.22, 0.28, -0.17], rot: [0.2, s * 0.35, s * 0.5], scale: [1.1, 0.75, 0.1] }, 18))
    }
    lined.push(P.sphere(0.035, '#FF8FB8', { at: [0, 0.36, -0.12] }))
    const g = group(lined, [], bag)!
    g.userData.wings = true
    return g
  }
  // The cape: the back half of a cone from her shoulders down past her hem, open at the front, two-sided (its inside
  // shows past her arms), with a gold clasp at her neck.
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
  const clasp = group([P.sphere(0.022, '#FFC83D', { at: [0, 0.45, 0.1] })], [], bag)
  if (clasp) g.add(clasp)
  return g
}

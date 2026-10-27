// Clouds that sit on mountains: a layer of fat soft blobs lying across the hills at one height (the sky road drives up
// into it and pops out on top), the sea of clouds she sees from above it (a white floor out to the horizon with lumps
// rolling on it), and puffs resting on peaks or hanging low on the hills. Toon white with lavender shade bands; one or
// two meshes each.
import { CircleGeometry, Group, Mesh, type BufferGeometry, type Material } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../engine3d/geo'
import { toon } from '../../../../engine3d/toon'
import { rng } from './build'

/** A layer of cloud between heights y0 and y1 over the box (meters), `n` blobs. Below 1, `opacity` lets the road and the
 *  hills show through the blobs as she drives in among them. */
export function buildCloudLayer(box: { x0: number; x1: number; z0: number; z1: number }, y0: number, y1: number, n: number, seed: number, bag: Bag, opacity = 1) {
  const rand = rng(seed)
  const parts: BufferGeometry[] = []
  for (let i = 0; i < n; i++) {
    const r = 9 + rand() * 14
    const x = box.x0 + rand() * (box.x1 - box.x0)
    const z = box.z0 + rand() * (box.z1 - box.z0)
    const y = y0 + (y1 - y0) * (0.35 + rand() * 0.5)
    parts.push(P.sphere(r, rand() < 0.2 ? '#F4F1FF' : '#FFFFFF', { at: [x, y, z], scale: [1.4, 0.55, 1.2] }, 10))
  }
  const g = solid(merge(parts), bag, 0)
  if (opacity < 1) {
    // (Its own copy of the shared toon material, see-through and drawn after everything solid.)
    const mesh = g.children[0] as Mesh
    const m = bag.add((mesh.material as Material).clone())
    m.transparent = true
    m.opacity = opacity
    m.depthWrite = false
    mesh.material = m
    mesh.renderOrder = 2
  }
  return g
}

/** Puffy clouds resting on peaks (or anywhere): each a few blobs huddled together. */
export function buildPuffs(at: [number, number, number][], size: number, seed: number, bag: Bag) {
  const rand = rng(seed)
  const parts: BufferGeometry[] = []
  for (const [x, y, z] of at)
    for (let k = 0; k < 4; k++) {
      const r = size * (0.5 + rand() * 0.5)
      parts.push(P.sphere(r, '#FFFFFF', { at: [x + (k - 1.5) * size * 0.7, y + rand() * size * 0.3, z + (rand() - 0.5) * size * 0.6], scale: [1.2, 0.8, 1] }, 10))
    }
  return solid(merge(parts), bag, 2)
}

/** The sea of clouds seen from above: a white floor of cloud at height `y` out to the horizon (it fades into the haze),
 *  with soft lumps rolling on it. Two meshes. Only shown once she's up above the cloud layer. */
export function buildCloudSea(box: { x0: number; x1: number; z0: number; z1: number }, y: number, seed: number, bag: Bag) {
  const rand = rng(seed * 13 + 1)
  const g = new Group()
  const cx = (box.x0 + box.x1) / 2
  const cz = (box.z0 + box.z1) / 2
  const floor = new Mesh(bag.add(new CircleGeometry(1400, 48).rotateX(-Math.PI / 2)), toon('#E3DFF3'))
  floor.position.set(cx, y, cz)
  g.add(floor)
  const lumps: BufferGeometry[] = []
  const R = Math.max(box.x1 - box.x0, box.z1 - box.z0) / 2
  for (let i = 0; i < 170; i++) {
    const a = rand() * Math.PI * 2
    const d = 10 + rand() * rand() * (R + 600)
    const r = 8 + rand() * 20
    lumps.push(P.sphere(r, rand() < 0.3 ? '#F3F0FF' : '#FFFFFF', { at: [cx + Math.cos(a) * d, y + r * 0.02, cz + Math.sin(a) * d], scale: [1.5, 0.5, 1.2] }, 10))
  }
  g.add(solid(merge(lumps), bag, 2))
  return g
}

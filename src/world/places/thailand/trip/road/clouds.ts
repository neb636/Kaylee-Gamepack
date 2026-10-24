// Clouds that sit on mountains: a layer of fat soft blobs lying across the hills at one height (the sky road drives up
// into it and pops out on top, above a white sea), and single puffs resting on far peaks. Toon white with lavender
// shade bands; one mesh each.
import type { BufferGeometry } from 'three'
import type { Bag } from '../../engine/dispose'
import { merge, P, solid } from '../../engine/geo'
import { rng } from './build'

/** A layer of cloud between heights y0 and y1 over the box (meters), `n` blobs. */
export function buildCloudLayer(box: { x0: number; x1: number; z0: number; z1: number }, y0: number, y1: number, n: number, seed: number, bag: Bag) {
  const rand = rng(seed)
  const parts: BufferGeometry[] = []
  for (let i = 0; i < n; i++) {
    const r = 9 + rand() * 14
    const x = box.x0 + rand() * (box.x1 - box.x0)
    const z = box.z0 + rand() * (box.z1 - box.z0)
    const y = y0 + (y1 - y0) * (0.35 + rand() * 0.5)
    parts.push(P.sphere(r, rand() < 0.2 ? '#F4F1FF' : '#FFFFFF', { at: [x, y, z], scale: [1.4, 0.55, 1.2] }, 10))
  }
  return solid(merge(parts), bag, 0)
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

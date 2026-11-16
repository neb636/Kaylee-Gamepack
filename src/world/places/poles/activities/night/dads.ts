// The emperor dads as one cheap shape (the films' emperor, simplified), for a huddle of hundreds drawn as one
// InstancedMesh: Act 3's huddle (through.ts) and the films' colony (story/stage.ts). No three.js scene code here.
import type { BufferGeometry } from 'three'
import { merge, P } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'

/** The huddle's dad as one cheap shape (the films' emperor, simplified): ~300 triangles. `faces` adds eyes. */
export function dadGeo(h: number, detail: number, faces: boolean): BufferGeometry {
  const back = '#35324A'
  const parts = [
    P.sphere(0.3 * h, back, { at: [0, 0.36 * h, -0.02 * h], scale: [1, 1.25, 0.95] }, detail),
    P.sphere(0.26 * h, '#FFFFFF', { at: [0, 0.34 * h, 0.07 * h], scale: [0.95, 1.2, 0.85] }, detail),
    P.sphere(0.17 * h, back, { at: [0, 0.78 * h, 0.02 * h] }, detail),
    P.sphere(0.07 * h, '#FFC83D', { at: [0.13 * h, 0.72 * h, 0.04 * h], scale: [0.6, 1.2, 0.8] }, Math.max(5, detail - 3)),
    P.sphere(0.07 * h, '#FFC83D', { at: [-0.13 * h, 0.72 * h, 0.04 * h], scale: [0.6, 1.2, 0.8] }, Math.max(5, detail - 3)),
    P.cone(0.045 * h, 0.16 * h, '#4A4560', { at: [0, 0.76 * h, 0.2 * h], rot: [Math.PI / 2, 0, 0] }, 5),
    P.sphere(0.06 * h, '#FFB15E', { at: [0, 0.03 * h, 0.12 * h], scale: [1.6, 0.4, 1] }, 5),
  ]
  // Big round eyes, the pupils low and a little blush: shy and friendly, never a scowl.
  if (faces) for (const s of [1, -1]) parts.push(P.sphere(0.036 * h, '#FFFFFF', { at: [s * 0.068 * h, 0.8 * h, 0.15 * h] }, 6), P.sphere(0.022 * h, PAL.ink, { at: [s * 0.068 * h, 0.79 * h, 0.178 * h] }, 5), P.sphere(0.024 * h, '#FFB3C8', { at: [s * 0.1 * h, 0.75 * h, 0.15 * h], scale: [1, 0.6, 0.6] }, 5))
  return merge(parts)
}

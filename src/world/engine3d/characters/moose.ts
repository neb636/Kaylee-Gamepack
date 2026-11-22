import { BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, Vector3 } from 'three'
import { bake } from '../geo'

/** Top edge of the palm in head radii. Pairs of high points round each tine's tip. */
const rim = new CatmullRomCurve3([
  [0.46, 0.82], [0.74, 0.92], [0.84, 1.04],
  [0.90, 1.39], [0.98, 1.48], [1.12, 1.29],
  [1.20, 1.66], [1.26, 1.72], [1.40, 1.40],
  [1.52, 1.84], [1.59, 1.91], [1.70, 1.48],
  [1.86, 1.77], [1.94, 1.81], [2.00, 1.55], [2.02, 1.32],
].map(([x, y]) => new Vector3(x, y, 0)))

/** Loft oval sections along the beam. Each rises to the scalloped rim, while the underside
 * sweeps out in one uninterrupted curve. The tips curl back so the palm has a profile, too. */
export function mooseAntler(side: number, R: number, headY: number) {
  const positions: number[] = []
  const indices: number[] = []
  const rings = 80
  const sides = 16
  for (let i = 0; i <= rings; i++) {
    const t = i / rings
    const { x, y: top } = rim.getPoint(t)
    const span = (x - 0.46) / 1.56
    const bottom = 0.65 + 0.12 * span + 0.42 * span ** 3 + 0.13 * t ** 12
    const thickness = (0.09 + 0.07 * Math.sin(Math.PI * span)) * Math.min(1, (1 - t) * 20)
    for (let j = 0; j < sides; j++) {
      const angle = 2 * Math.PI * j / sides
      const y = bottom + (top - bottom) * (1 + Math.cos(angle)) / 2
      const z = -0.09 - 0.73 * span * span - 0.22 * (y - bottom) + thickness * Math.sin(angle)
      positions.push(side * x, y, z)
      if (i === rings) continue
      const a = i * sides + j
      const b = i * sides + (j + 1) % sides
      if (side > 0) indices.push(a, b, a + sides, b, b + sides, a + sides)
      else indices.push(a, a + sides, b, b, a + sides, b + sides)
    }
  }
  const mesh = new BufferGeometry()
  mesh.setAttribute('position', new Float32BufferAttribute(positions, 3))
  mesh.setIndex(indices)
  mesh.computeVertexNormals()
  return bake(mesh, '#DAB483', { at: [0, headY, 0], scale: [R, R, R] }, true)
}

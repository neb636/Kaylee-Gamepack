import { BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, Vector3 } from 'three'
import { bake } from '../geo'

/** Top edge of the palm in head radii. The broad palm has three uneven points and a rounded outer edge. */
const rim = new CatmullRomCurve3([
  [0.46, 0.82], [0.64, 0.94], [0.79, 1.05],
  [0.85, 1.25], [0.96, 1.36], [1.10, 1.39],
  [1.20, 1.45], [1.25, 1.61], [1.33, 1.46],
  [1.41, 1.49], [1.51, 1.70], [1.58, 1.48],
  [1.66, 1.47], [1.77, 1.59], [1.82, 1.38],
  [1.88, 1.30], [1.92, 1.20], [1.93, 1.08],
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
    const span = (x - 0.46) / 1.47
    const beamRise = Math.sin(Math.min(1, span / 0.30) * Math.PI / 2)
    const palmBelly = Math.sin(Math.max(0, span - 0.30) / 0.70 * Math.PI)
    const bottom = 0.65 + 0.33 * beamRise - 0.16 * palmBelly + 0.10 * t ** 10
    const thickness = (0.08 + 0.13 * Math.sin(Math.PI * span) ** 2) * Math.min(1, (1 - t) * 20)
    for (let j = 0; j < sides; j++) {
      const angle = 2 * Math.PI * j / sides
      const y = bottom + (top - bottom) * (1 + Math.cos(angle)) / 2
      const z = -0.09 - 0.50 * span * span - 0.22 * (y - bottom) + thickness * Math.sin(angle)
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
  return bake(mesh, '#E4C495', { at: [0, headY, 0], scale: [R, R, R] }, true)
}

import { ExtrudeGeometry, Shape } from 'three'
import { bake } from '../geo'

/** A paddle-shaped palm with three short tines. Both broad faces are planar so their
 * ink silhouette stays at the edge as the head turns. The bevel rounds the rim. */
export function mooseAntler(side: number, R: number, headY: number) {
  const palm = new Shape()
  palm.moveTo(side * 0.46, 0.82)
  const curve = (ax: number, ay: number, bx: number, by: number, x: number, y: number) =>
    palm.bezierCurveTo(side * ax, ay, side * bx, by, side * x, y)
  curve(0.65, 0.91, 0.76, 0.98, 0.82, 1.12)
  curve(0.88, 1.32, 0.98, 1.36, 1.10, 1.37)
  curve(1.24, 1.37, 1.23, 1.60, 1.25, 1.58)
  curve(1.29, 1.58, 1.28, 1.44, 1.36, 1.44)
  curve(1.44, 1.44, 1.47, 1.68, 1.51, 1.68)
  curve(1.54, 1.67, 1.54, 1.45, 1.62, 1.45)
  curve(1.68, 1.45, 1.74, 1.57, 1.77, 1.57)
  curve(1.81, 1.57, 1.79, 1.42, 1.84, 1.35)
  curve(1.94, 1.24, 1.98, 1.11, 1.87, 1.02)
  curve(1.68, 0.84, 1.29, 0.76, 0.96, 0.94)
  curve(0.84, 1.00, 0.66, 0.78, 0.46, 0.67)
  palm.closePath()
  const mesh = new ExtrudeGeometry(palm, {
    depth: 0.18, bevelSize: 0.025, bevelThickness: 0.045, bevelSegments: 3, curveSegments: 6,
  })
  // Sweep the palm back from the brow without warping the faces between the tines.
  mesh.translate(-side * 0.46, 0, -0.09)
  return bake(mesh, '#E4C495', {
    at: [side * 0.46 * R, headY, -0.13 * R], rot: [0, side * 0.31, 0], scale: [R, R, R],
  })
}

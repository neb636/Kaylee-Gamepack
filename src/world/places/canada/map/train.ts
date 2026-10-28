// The red Maple Leaf Train in the toon look: a round little steam engine (red boiler with gold bands, a black smokestack
// that flares at the top, a big headlamp, a white disc with a red maple leaf on the front, a cab with a dark roof, a gold
// cowcatcher, red driving wheels with side rods that go round), an open cream car Maple rides in, and a lavender coach
// with a maple leaf on each side. Each piece faces +z (the way the train goes west); map.ts places them on the track.
import { Group, type Object3D } from 'three'
import type { Bag } from '../../../engine3d/dispose'
import { blobShadow, merge, P, solid } from '../../../engine3d/geo'
import { PAL } from '../../../engine3d/toon'

export const RED = '#E8505B'
const RED_DARK = '#C23B4B'
const IRON = '#4A4458'
const ROOF = '#5A5470'

/** A maple leaf's outline (about 1 m tall, stem down): the flag's leaf, simplified. */
export const LEAF: [number, number][] = [
  [0, 1], [0.13, 0.74], [0.3, 0.82], [0.25, 0.44], [0.56, 0.62], [0.5, 0.44], [0.78, 0.4], [0.56, 0.2], [0.63, 0.1], [0.3, 0.07],
  [0.33, -0.13], [0.05, -0.05], [0.05, -0.36], [-0.05, -0.36], [-0.05, -0.05], [-0.33, -0.13], [-0.3, 0.07], [-0.63, 0.1],
  [-0.56, 0.2], [-0.78, 0.4], [-0.5, 0.44], [-0.56, 0.62], [-0.25, 0.44], [-0.3, 0.82], [-0.13, 0.74],
]
/** A maple leaf part of this size, in the xy plane (facing +z). */
export const leaf = (size: number, color: string, at: [number, number, number], rot: [number, number, number] = [0, 0, 0], depth = 0.012) =>
  P.prism(LEAF.map(([x, y]) => [x * size * 0.5, y * size * 0.5]), depth, color, { at, rot })

export interface TrainParts {
  engine: Group
  cars: Group[]
  /** Every wheel (they spin about x). */
  wheels: Object3D[]
  /** The engine's two side rods (they go round with the driving wheels). */
  rods: Object3D[]
  /** Where Maple sits in the open car (car-local). */
  seat: [number, number, number]
}

/** Where the smoke comes out of (engine-local). */
export const CHIMNEY: [number, number, number] = [0, 0.6, 0.2]
/** The driving wheels' radius and axle height, and where the rods sit. */
const DRIVE_R = 0.085
const AXLE_Y = 0.085

export function buildTrain(bag: Bag): TrainParts {
  const wheels: Object3D[] = []
  const wheel = (x: number, z: number, r = 0.065, y = 0.065) => {
    const s = Math.sign(x)
    const w = solid(
      merge([
        P.cyl(r, r, 0.04, PAL.ink, { rot: [0, 0, Math.PI / 2] }, 14),
        P.cyl(r * 0.62, r * 0.62, 0.046, RED, { rot: [0, 0, Math.PI / 2] }, 14),
        // A spoke across the hub, so she can see the wheels turn.
        P.box(0.05, r * 1.15, 0.02, PAL.gold, { at: [0, 0, 0] }),
        P.cyl(r * 0.2, r * 0.2, 0.054, PAL.gold, { at: [s * 0.002, 0, 0], rot: [0, 0, Math.PI / 2] }, 8),
      ]),
      bag,
      1,
    )
    w.position.set(x, y, z)
    w.userData.r = r
    wheels.push(w)
    return w
  }

  // ---- The engine.
  const engine = new Group()
  engine.add(
    solid(
      merge([
        // The frame and the red skirts along the bottom.
        P.rbox(0.28, 0.07, 0.74, 0.02, IRON, { at: [0, 0.13, -0.02] }),
        P.rbox(0.34, 0.04, 0.5, 0.015, RED_DARK, { at: [0, 0.165, 0.05] }),
        // The boiler, its gold bands and the dark smokebox at the front.
        P.cyl(0.13, 0.13, 0.44, RED, { at: [0, 0.3, 0.07], rot: [Math.PI / 2, 0, 0] }, 20),
        P.cyl(0.136, 0.136, 0.025, PAL.gold, { at: [0, 0.3, -0.06], rot: [Math.PI / 2, 0, 0] }, 20),
        P.cyl(0.136, 0.136, 0.025, PAL.gold, { at: [0, 0.3, 0.13], rot: [Math.PI / 2, 0, 0] }, 20),
        P.cyl(0.138, 0.138, 0.07, IRON, { at: [0, 0.3, 0.28], rot: [Math.PI / 2, 0, 0] }, 20),
        // The white disc on the front with the red maple leaf.
        P.cyl(0.105, 0.105, 0.02, '#FFFFFF', { at: [0, 0.3, 0.32], rot: [Math.PI / 2, 0, 0] }, 20),
        leaf(0.15, RED, [0, 0.29, 0.333]),
        // The smokestack, flared at the top like a funnel, and the gold steam dome.
        P.cyl(0.04, 0.045, 0.13, IRON, { at: [0, 0.48, 0.2] }, 12),
        P.cyl(0.075, 0.042, 0.07, IRON, { at: [0, 0.57, 0.2] }, 14),
        P.cyl(0.078, 0.078, 0.015, PAL.gold, { at: [0, 0.605, 0.2] }, 14),
        P.sphere(0.055, PAL.gold, { at: [0, 0.42, 0.03], scale: [1, 0.9, 1] }, 12),
        P.cyl(0.02, 0.02, 0.05, PAL.gold, { at: [0, 0.47, -0.06] }, 8),
        // The headlamp on top of the smokebox.
        P.rbox(0.09, 0.08, 0.07, 0.02, IRON, { at: [0, 0.46, 0.29] }),
        // The cab: red walls, sky windows, a dark roof that overhangs.
        P.rbox(0.34, 0.3, 0.26, 0.035, RED, { at: [0, 0.33, -0.22] }),
        P.box(0.35, 0.1, 0.13, PAL.sky, { at: [0, 0.39, -0.22] }),
        P.box(0.22, 0.1, 0.27, PAL.sky, { at: [0, 0.39, -0.22] }),
        P.rbox(0.4, 0.045, 0.34, 0.02, ROOF, { at: [0, 0.5, -0.22] }),
        P.box(0.35, 0.03, 0.27, PAL.gold, { at: [0, 0.22, -0.22] }),
        // Gold leaves on the cab's sides.
        leaf(0.09, PAL.gold, [0.172, 0.29, -0.22], [0, Math.PI / 2, 0]),
        leaf(0.09, PAL.gold, [-0.172, 0.29, -0.22], [0, -Math.PI / 2, 0]),
        // The cowcatcher.
        P.prism([[-0.16, 0], [0.16, 0], [0, 0.14]], 0.12, PAL.gold, { at: [0, 0.08, 0.38], rot: [-Math.PI / 2, 0, 0] }),
        P.rbox(0.3, 0.04, 0.04, 0.015, IRON, { at: [0, 0.15, 0.36] }),
      ]),
      bag,
      2,
    ),
  )
  // The lamp glows (its own mesh, no outline, so it reads as light).
  engine.add(solid(P.sphere(0.035, PAL.butter, { at: [0, 0.465, 0.33] }, 12), bag, 0))
  // Driving wheels (big) under the boiler and the cab; little ones at the front.
  wheel(0.165, 0.2, 0.05, 0.05)
  wheel(-0.165, 0.2, 0.05, 0.05)
  for (const z of [-0.2, 0.02]) {
    engine.add(wheel(0.17, z, DRIVE_R, AXLE_Y))
    engine.add(wheel(-0.17, z, DRIVE_R, AXLE_Y))
  }
  engine.add(wheels[0], wheels[1])
  // The side rods, from one driving wheel to the other: they go round with them (map.ts moves them).
  const rods: Object3D[] = []
  for (const x of [0.2, -0.2]) {
    const rod = solid(P.rbox(0.014, 0.022, 0.26, 0.006, PAL.gold, {}), bag, 1)
    rod.position.set(x, AXLE_Y, -0.09)
    rods.push(rod)
    engine.add(rod)
  }
  engine.add(blobShadow(0.38, bag))

  // ---- The open car Maple rides in.
  const open = new Group()
  open.add(
    solid(
      merge([
        P.rbox(0.28, 0.06, 0.6, 0.02, IRON, { at: [0, 0.11, 0] }),
        P.rbox(0.32, 0.03, 0.56, 0.015, PAL.cream, { at: [0, 0.155, 0] }),
        // Low walls all round, red on top.
        P.rbox(0.03, 0.12, 0.56, 0.012, PAL.cream, { at: [0.15, 0.22, 0] }),
        P.rbox(0.03, 0.12, 0.56, 0.012, PAL.cream, { at: [-0.15, 0.22, 0] }),
        P.rbox(0.32, 0.12, 0.03, 0.012, PAL.cream, { at: [0, 0.22, 0.27] }),
        P.rbox(0.32, 0.12, 0.03, 0.012, PAL.cream, { at: [0, 0.22, -0.27] }),
        P.rbox(0.05, 0.025, 0.6, 0.01, RED, { at: [0.155, 0.285, 0] }),
        P.rbox(0.05, 0.025, 0.6, 0.01, RED, { at: [-0.155, 0.285, 0] }),
        P.rbox(0.34, 0.025, 0.05, 0.01, RED, { at: [0, 0.285, 0.275] }),
        P.rbox(0.34, 0.025, 0.05, 0.01, RED, { at: [0, 0.285, -0.275] }),
        P.box(0.33, 0.025, 0.5, RED, { at: [0, 0.19, 0] }),
        // A pink cushion to sit on.
        P.rbox(0.26, 0.05, 0.22, 0.02, PAL.pink, { at: [0, 0.19, 0.04] }),
        leaf(0.1, RED, [0.168, 0.22, 0], [0, Math.PI / 2, 0]),
        leaf(0.1, RED, [-0.168, 0.22, 0], [0, -Math.PI / 2, 0]),
      ]),
      bag,
      2,
    ),
  )
  // (The hollow middle is covered by the red rim; seen from above it reads as a tub.)
  open.add(wheel(0.16, 0.18), wheel(-0.16, 0.18), wheel(0.16, -0.18), wheel(-0.16, -0.18), blobShadow(0.34, bag))

  // ---- The coach.
  const coach = new Group()
  const windows = [-0.17, 0, 0.17].flatMap((z) => [0.163, -0.163].map((x) => P.rbox(0.012, 0.09, 0.11, 0.01, PAL.sky, { at: [x, 0.3, z] })))
  coach.add(
    solid(
      merge([
        P.rbox(0.28, 0.06, 0.6, 0.02, IRON, { at: [0, 0.11, 0] }),
        P.rbox(0.32, 0.27, 0.56, 0.04, PAL.lavender, { at: [0, 0.28, 0] }),
        P.box(0.334, 0.035, 0.52, RED, { at: [0, 0.19, 0] }),
        ...windows,
        // A rounded roof.
        P.cyl(0.18, 0.18, 0.6, RED, { at: [0, 0.4, 0], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.38] }, 18),
        P.rbox(0.1, 0.12, 0.012, 0.01, PAL.cream, { at: [0, 0.27, 0.283] }),
        P.rbox(0.1, 0.12, 0.012, 0.01, PAL.cream, { at: [0, 0.27, -0.283] }),
      ]),
      bag,
      2,
    ),
  )
  coach.add(wheel(0.16, 0.18), wheel(-0.16, 0.18), wheel(0.16, -0.18), wheel(-0.16, -0.18), blobShadow(0.34, bag))
  return { engine, cars: [open, coach], wheels, rods, seat: [0, 0.24, 0.02] }
}

/** Moves the side rods round with the driving wheels (`turn` in radians). */
export function turnRods(rods: Object3D[], turn: number) {
  rods.forEach((r, i) => {
    const a = turn + i * Math.PI * 0.5
    r.position.y = AXLE_Y + Math.sin(a) * DRIVE_R * 0.45
    r.position.z = -0.09 + Math.cos(a) * DRIVE_R * 0.45
  })
}

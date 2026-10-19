// The plane, greybox: from outside (the airport), a chubby pastel plane with a pink elephant on its tail and no airline
// name; its door opens onto the boarding stairs. Nose toward -x, the door on its +z side (the side the camera sees).
import { Group } from 'three'
import type { Bag } from '../../engine/dispose'
import { merge, P, solid, type V3 } from '../../engine/geo'
import { PAL } from '../../engine/toon'

const SKIN = '#F7F4FF'
const BELLY = '#D9CCFF'
const STRIPE = PAL.hotpink

export interface PlaneOutside {
  root: Group
  /** The door (opens outward on its hinge). */
  door: Group
  /** Where the door is, and the stairs' steps from the ground up to it (local to `root`). */
  doorAt: V3
  steps: V3[]
}

export function buildPlaneOutside(bag: Bag): PlaneOutside {
  const root = new Group()
  const R = 1.35
  const L = 10
  const parts = [
    // The fuselage: a fat capsule lying along x, a lavender belly, a pink stripe and a round nose.
    P.capsule(R, L, SKIN, { at: [0, 2.2, 0], rot: [0, 0, Math.PI / 2] }),
    P.capsule(R * 0.96, L * 0.98, BELLY, { at: [0, 1.95, 0], rot: [0, 0, Math.PI / 2], scale: [0.9, 1, 1] }),
    P.box(L + 1, 0.22, R * 2.02, STRIPE, { at: [0.3, 2.35, 0], scale: [1, 1, 1] }),
    // The cockpit windows.
    P.box(0.5, 0.35, 1.4, '#3E4A7A', { at: [-L / 2 - 0.55, 2.75, 0], rot: [0, 0, -0.5] }),
    // Wings and engines (the near wing is low and swept back).
    P.box(3.2, 0.25, 9.5, '#E3DAFF', { at: [0.6, 1.6, 0], rot: [0, 0.25, 0] }),
    ...[-1, 1].flatMap((s) => [P.cyl(0.55, 0.5, 1.8, '#C9B5F7', { at: [0.2, 1.05, s * 2.6], rot: [0, 0, Math.PI / 2] }), P.cyl(0.4, 0.4, 0.05, PAL.ink, { at: [-0.72, 1.05, s * 2.6], rot: [0, 0, Math.PI / 2] })]),
    // The tail: a tall fin with a pink elephant on each side, and two little tail wings.
    P.box(2.4, 2.6, 0.24, SKIN, { at: [L / 2 + 0.4, 4.1, 0], rot: [0, 0, -0.45] }),
    P.box(1.9, 0.18, 4.2, '#E3DAFF', { at: [L / 2 + 0.7, 2.7, 0] }),
    ...[-1, 1].flatMap((s) => [
      P.sphere(0.48, '#FF8FB8', { at: [L / 2 + 0.75, 4.2, s * 0.15], scale: [1, 1, 0.3] }),
      P.sphere(0.36, '#FF6FA8', { at: [L / 2 + 1.05, 4.25, s * 0.2], scale: [0.8, 1.1, 0.25] }),
      P.capsule(0.12, 0.45, '#FF8FB8', { at: [L / 2 + 0.3, 3.75, s * 0.18], rot: [0, 0, -0.5] }),
      P.sphere(0.05, PAL.ink, { at: [L / 2 + 0.55, 4.35, s * 0.28] }),
    ]),
    // Round windows along the side the camera sees, and the wheels.
    ...Array.from({ length: 9 }, (_, i) => P.cyl(0.2, 0.2, 0.06, '#A8DCFF', { at: [-L / 2 + 2.6 + i * 0.95, 2.55, R * 0.97], rot: [Math.PI / 2, 0, 0] })),
    ...[[-L / 2 + 0.6, 0], [1, -1.4], [1, 1.4]].map(([x, z]) => P.torus(0.32, 0.14, PAL.ink, { at: [x, 0.42, z] })),
    ...[[-L / 2 + 0.6, 0], [1, -1.4], [1, 1.4]].map(([x, z]) => P.cyl(0.08, 0.08, 1.0, '#D8D2E6', { at: [x, 0.95, z] })),
  ]
  root.add(solid(merge(parts), bag, 2))
  const doorAt: V3 = [-L / 2 + 1.5, 2.15, R + 0.02]
  const door = new Group()
  door.position.set(doorAt[0] - 0.5, doorAt[1], doorAt[2])
  door.add(solid(merge([P.rbox(1.0, 1.7, 0.08, 0.12, '#E3DAFF', { at: [0.5, 0, 0] }), P.cyl(0.18, 0.18, 0.04, '#A8DCFF', { at: [0.5, 0.35, 0.04], rot: [Math.PI / 2, 0, 0] }), P.box(0.12, 0.05, 0.05, PAL.ink, { at: [0.85, -0.1, 0.05] })]), bag, 2))
  door.userData.pick = 'plane-door'
  root.add(door)
  // The boarding stairs: a little truck with steps up to the door.
  const steps: V3[] = []
  const n = 7
  const stair = []
  for (let i = 0; i < n; i++) {
    const y = 0.2 + (i + 1) * ((doorAt[1] - 0.95 - 0.2) / n)
    const z = doorAt[2] + 3.2 - (i + 1) * (2.9 / n)
    steps.push([doorAt[0], y, z])
    stair.push(P.box(1.2, 0.1, 0.42, PAL.cream, { at: [doorAt[0], y - 0.05, z] }))
  }
  stair.push(
    P.box(1.4, 0.25, 3.6, '#FFC83D', { at: [doorAt[0], 0.3, doorAt[2] + 1.9] }),
    ...[-1, 1].map((s) => P.box(0.06, 0.06, 3.3, PAL.hotpink, { at: [doorAt[0] + s * 0.62, 1.6, doorAt[2] + 1.6], rot: [-0.62, 0, 0] })),
    ...[[-0.5, 0.6], [0.5, 0.6], [-0.5, 3.4], [0.5, 3.4]].map(([x, z]) => P.torus(0.16, 0.07, PAL.ink, { at: [doorAt[0] + x, 0.16, doorAt[2] + z], rot: [0, Math.PI / 2, 0] })),
  )
  root.add(solid(merge(stair), bag, 2))
  return { root, door, doorAt, steps }
}

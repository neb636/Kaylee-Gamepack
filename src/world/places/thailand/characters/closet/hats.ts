// The hats drawer: a gold crown round the base of her horn, a big pink bow on the side of her hair, and a sky-blue cap
// worn backwards (so her horn pokes out the front and the brim keeps the sun off her neck: it's shady). Head-local:
// her hair is a dome of 0.30 around (0, 0.18, -0.04); her horn comes out of it at about (0, 0.43, 0.14) and tops out
// at y 0.56.
import { Group, SphereGeometry } from 'three'
import type { Bag } from '../../engine/dispose'
import { bake, P, type V3 } from '../../engine/geo'
import { group } from '../model-wear'

const GOLD = '#FFC83D'
const GEM = '#FF4F9A'

/** A part of her built round its own origin, then set at `at` turned by `rot`. */
function placed(g: Group | null, at: V3, rot: V3 = [0, 0, 0]) {
  const holder = new Group()
  holder.position.set(...at)
  holder.rotation.set(...rot)
  if (g) holder.add(g)
  return holder
}

export function buildHat(id: string, bag: Bag): Group {
  if (id === 'crown') {
    // A band round the base of her horn, tipped forward with her hair there, five points with a gem on the front.
    const r = 0.078
    const lined = [P.cyl(r + 0.004, r, 0.05, GOLD, {}, 24)]
    const plain = []
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2
      lined.push(P.cone(0.022, 0.05, GOLD, { at: [Math.sin(a) * r, 0.048, Math.cos(a) * r] }, 10))
      plain.push(P.sphere(0.011, GEM, { at: [Math.sin(a) * (r + 0.005), 0.076, Math.cos(a) * (r + 0.005)] }, 10))
    }
    plain.push(P.sphere(0.018, GEM, { at: [0, 0, r + 0.006], scale: [1, 1, 0.6] }, 12))
    const crown = placed(group(lined, plain, bag), [0, 0.432, 0.13], [0.6, 0, 0])
    // On the shelf it stands up straight (on her it tips forward with her hair).
    crown.userData.upright = true
    return crown
  }
  if (id === 'bow') {
    // Two loops and a knot, standing out from the side of her hair below her ear.
    const c = '#FF4F9A'
    const lined = [-1, 1].map((s) => P.sphere(0.075, c, { at: [0.012, 0.025, s * 0.068], rot: [s * 0.45, 0, 0], scale: [0.42, 0.75, 1.2] }, 14))
    lined.push(...[-1, 1].map((s) => P.capsule(0.016, 0.06, c, { at: [0.008, -0.05, s * 0.03], rot: [s * 0.35, 0, 0] })))
    lined.push(P.sphere(0.034, '#FF7FB8', { at: [0.025, 0.01, 0], scale: [0.8, 1, 1] }))
    return placed(group(lined, [], bag), [0.345, 0.2, -0.03], [0, 0, -0.35])
  }
  // The cap, backwards: a dome over the top of her hair whose rim runs round her bangs (model-wear.ts's scrub cap),
  // a brim at the back, a button on top.
  const [rx, rz, h] = [0.29, 0.32, 0.19]
  const at: V3 = [0, 0.32, -0.03]
  const tilt = 0.14
  const c = '#8EC9F5'
  const lined = [
    bake(new SphereGeometry(1, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2), c, { at, rot: [tilt, 0, 0], scale: [rx, h, rz] }),
    P.torus(1, 0.02, '#5FA8E8', { at, rot: [Math.PI / 2 + tilt, 0, 0], scale: [rx, rz, 1] }),
    P.cyl(0.17, 0.17, 0.016, '#5FA8E8', { at: [0, at[1] - 0.045, at[2] - rz - 0.06], rot: [-0.32, 0, 0], scale: [1, 1, 0.7] }, 24),
  ]
  const plain = [P.sphere(0.022, '#FFFFFF', { at: [0, at[1] + h + 0.012 - 0.03, at[2] - 0.02] })]
  return placed(group(lined, plain, bag), [0, 0, 0])
}

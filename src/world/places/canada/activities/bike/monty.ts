// Monty the moose, in his bath at the bottom of Mont-Sainte-Anne: the team's goalie-to-be, slow, kind and always
// chewing. He is the rig moose (CANADA_LOOKS.moose) in both places: the game's Moose in the waterfall's pool
// (critters.ts) and the films' cast.monty (story/cast.ts). This dresses him for his bath (a lily pad stuck on one
// antler, a little pink flower on it) and, in the films, keeps his jaw going round whenever he isn't talking. The
// comedy is how little he moves: everything else here is slow.
import { Group, type Object3D } from 'three'
import { speakingVoice } from '../../../../../sdk/speech'
import type { FilmActor } from '../../../../engine3d/characters/actor'
import type { Rig } from '../../../../engine3d/characters/animal'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../engine3d/geo'

const PAD = '#5FB86A'
const PAD_DARK = '#4A9C57'

/** A lily pad stuck on his antler: a flat round leaf with its notch, and a pink flower. Added to his head. */
export function lilyPad(rig: Rig, bag: Bag): Object3D {
  const { R, headY } = rig.face
  const r = 0.5 * R
  // The leaf, a disc with a wedge cut out of it.
  const pts: [number, number][] = []
  for (let i = 0; i <= 20; i++) {
    const a = 0.35 + (i / 20) * (Math.PI * 2 - 0.7)
    pts.push([Math.cos(a) * r, Math.sin(a) * r])
  }
  pts.push([0, 0])
  const g = new Group()
  g.add(
    solid(
      merge([
        P.prism(pts, 0.03 * R, PAD, { rot: [-Math.PI / 2, 0, 0] }),
        P.cyl(0.02 * R, 0.02 * R, 0.6 * r, PAD_DARK, { at: [0.25 * r, 0.02 * R, 0], rot: [0, 0, Math.PI / 2] }, 5),
        // The flower: pink petals round a butter-yellow middle.
        ...[0, 1, 2, 3, 4].map((i) => P.sphere(0.09 * R, '#FF9EC4', { at: [-0.3 * r + Math.cos(i * 1.257) * 0.08 * R, 0.07 * R, 0.1 * r + Math.sin(i * 1.257) * 0.08 * R], scale: [1, 0.55, 1] }, 8)),
        P.sphere(0.06 * R, '#FFE07A', { at: [-0.3 * r, 0.11 * R, 0.1 * r] }, 8),
      ]),
      bag,
      1.6,
    ),
  )
  // Draped over the top of his right antler (as he faces us, on our left), tipped and a little askew.
  g.position.set(-1.39 * R, headY + 1.54 * R, -0.40 * R)
  g.rotation.set(0.22, 0.6, 0.3)
  rig.head.add(g)
  return g
}

/** A small nod as he chews between lines. */
export function chew(monty: FilmActor, t: number, k = 1) {
  if (!monty.root.visible || speakingVoice() === 'moose') return
  const cycle = (1 - Math.cos(t * 5.2)) / 2
  monty.rig.head.rotation.x += cycle * 0.025 * k
}

/** A pinecone (it falls out of a tree and bonks off his antlers), lying on its side, about `s` meters long. */
export function pinecone(bag: Bag, s = 0.16) {
  const parts = [P.sphere(s * 0.5, '#8A5A3C', { scale: [0.62, 1, 0.62] }, 10)]
  for (let i = 0; i < 4; i++) parts.push(P.torus(s * (0.26 - Math.abs(i - 1.5) * 0.05), s * 0.07, '#A8714A', { at: [0, (i - 1.5) * s * 0.22, 0], rot: [Math.PI / 2, 0, 0] }))
  const g = new Group()
  g.add(solid(merge(parts), bag, 1.6))
  return g
}

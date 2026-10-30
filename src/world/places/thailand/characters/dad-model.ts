// Daddy as a modelled vinyl toy (docs/3d-characters.md), like Kaylee (model.ts): a Tripo3D mesh of a mint unicorn in his
// brown tee and khaki shorts, split in Blender into the code-built rig's pivots (body, head at the neck, eyes, arms at
// the shoulders, legs at the hips, tail). Tripo made the arms, legs, ears, brows, nose and eye domes separate pieces,
// so nothing had to be cut. Every wave, hop, look and seat in member.ts works on him unchanged.
//
// He talks, so his painted smile and the eyes painted under the glossy domes were painted out of the texture in
// Blender (paint_out.py next to dad-rig.blend): the domes carry his eyes, so squashing them blinks, and the code draws
// his smile and the open mouth that grows with his voice.
//
// Place.tsx waits for the GLB (dadReady) before any scene builds. If it can't load, the code-built Daddy stands in.
import { Group, Mesh, type Object3D } from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { Bag } from '../../../engine3d/dispose'
import { blobShadow, P, solidMix, type V3 } from '../../../engine3d/geo'
import type { Rig } from '../../../engine3d/characters/animal'
import { inkPieces, swingForward } from './model'
import url from './models/dad.glb?url'

/** How tall he stands (meters; the model is 1 m, like LOOKS.nick). */
export const DAD_SIZE = 1.7
/** How far each arm's swing plane turns forward (model.ts swingForward): his head is wider than his reach, so a wave
 *  out to the side would end inside it. The same turn as Kaylee's. */
const ARM_TILT = 2.0
/** Sitting (member.ts puts the root 0.1 of his height under the seat): how far his body drops (meters), which leaves
 *  his hips just high enough for his legs (12 cm thick) to rest on the seat, and their swing forward. */
export const DAD_SIT = { drop: 0.04 * DAD_SIZE, legs: -1.35 }

/** His hair's browns (sampled from the model's texture): the barber's strands start in these. */
export const DAD_HAIR = ['#6B4A33', '#8A6244', '#55392A']

const SMILE = '#3B2230'
const MOUTH = '#7A2745'
const TONGUE = '#FF8FA8'

let model: GLTF | null = null
let ready: Promise<GLTF | null> | null = null

/** The loaded model, or null while it's on its way (or if it couldn't load). */
export const dadModel = () => model

/** Resolves once he's loaded, or with null if he couldn't be (never rejects: the code-built Daddy stands in). */
export function dadReady(): Promise<GLTF | null> {
  ready ??= new GLTFLoader()
    .loadAsync(url)
    .then((g) => (model = g))
    .catch((e) => {
      console.warn('dad.glb could not be loaded, using the code-built Daddy.', e)
      return null
    })
  return ready
}

// His muzzle in the head pivot's space (model meters, glTF axes: +y up, +z forward), measured in Blender: the painted
// smile was a curve 8.4 cm wide whose ends sat 2 cm above its middle, on a face that curves back ~1.3 cm at its ends.
const NECK_Y = 0.462
const NECK_Z = -0.021
/** A point on his muzzle (x across, y up, Blender heights), stood `lift` off the surface. */
function onMuzzle(x: number, y: number, lift: number): V3 {
  const front = 0.239 - 9.4 * x * x + lift
  return [x, y - NECK_Y, front + NECK_Z]
}
/** A Blender point (heights from his soles) in the head pivot's space, in meters. */
const onHead = (x: number, y: number, z: number): V3 => [x * DAD_SIZE, (y - NECK_Y) * DAD_SIZE, (z + NECK_Z) * DAD_SIZE]

/** A rig like buildAnimal's, from the model (dadModel()).
 *
 *  Unlike Kaylee's, the root isn't scaled: every pivot sits where it is at full size and only the meshes are scaled up,
 *  so the rig keeps the code-built one's contract (head-local, body-local and leg-local meters). Everything the trips
 *  already put on Daddy (the boat's sunglasses, the rice field's straw, the mall's socks, the ball on his horn, the
 *  vet's suds) lands the same way on him. */
export function buildDadRig(gltf: GLTF, bag: Bag): Rig {
  const S = DAD_SIZE
  const scene = gltf.scene.clone(true)
  const node = (name: string): Object3D => {
    const n = scene.getObjectByName(name)
    if (!n) throw new Error(`dad.glb has no ${name}`)
    return n
  }
  const meshes: Mesh[] = []
  scene.traverse((o: Object3D) => {
    if (o === scene) return
    o.position.multiplyScalar(S)
    if (o instanceof Mesh) {
      o.scale.multiplyScalar(S)
      meshes.push(o)
    }
  })
  // Nothing was cut off him, so there are no flat caps to keep the ink off.
  inkPieces(meshes, bag, null)

  const [body, head, eyes, armL, armR, tail, legL, legR] = ['body', 'head', 'eyes', 'armL', 'armR', 'tail', 'legL', 'legR'].map(node) as Group[]
  for (const [arm, s] of [[armL, -1], [armR, 1]] as const) swingForward(arm, s, ARM_TILT)

  // His hair and brows in groups of their own (the barber swaps them for strands), the hair pivoting at its middle so
  // the vet's suds puff it up in place.
  const group = (at: V3, names: string[]) => {
    const g = new Group()
    g.position.set(...at)
    for (const n of names) {
      const m = node(n)
      m.position.sub(g.position)
      g.add(m)
    }
    head.add(g)
    return g
  }
  const hair = group(onHead(0, 0.764, -0.008), ['hair_mesh'])
  const brows = group(onHead(0, 0.708, 0.2), ['brow_L', 'brow_R'])
  // His own horn (the barber's, one a snip can boing, stands in for it).
  const horn = node('horn')

  const root = new Group()
  root.add(blobShadow(0.3 * S, bag), body)

  // The smile: a row of little ink beads along the painted curve, each on the muzzle (a flat torus would float off
  // its ends, where the face curves back). Drawn in model meters inside a group scaled to his size (FaceLife sets the
  // talking mouth's own scale).
  const face = new Group()
  face.scale.setScalar(S)
  head.add(face)
  const mouthAt = onMuzzle(0, 0.556, 0)
  const at = (p: V3): V3 => [p[0] - mouthAt[0], p[1] - mouthAt[1], p[2] - mouthAt[2]]
  const beads = []
  const R = 0.054
  for (let i = 0; i <= 16; i++) {
    const a = -0.89 + (1.78 * i) / 16
    const x = R * Math.sin(a)
    beads.push(P.sphere(0.0048, SMILE, { at: at(onMuzzle(x, 0.601 - R * Math.cos(a), 0.001)), scale: [1, 1, 0.6] }, 8))
  }
  const mouth = new Group()
  const talk = new Group()
  for (const m of [mouth, talk]) m.position.set(...mouthAt)
  mouth.add(solidMix([], beads, bag, 0))
  talk.add(solidMix([], [P.sphere(0.036, MOUTH, { at: [0, -0.002, -0.002], scale: [1.15, 0.9, 0.35] }), P.sphere(0.019, TONGUE, { at: [0, -0.015, 0.004], scale: [1.3, 0.6, 0.5] })], bag, 0))
  talk.scale.setScalar(0.001)
  talk.visible = false
  face.add(mouth, talk)

  return {
    root,
    body,
    head,
    eyes,
    mouth,
    talk,
    open: false,
    armL,
    armR,
    tail,
    legL,
    legR,
    mane: null,
    hair,
    hairColors: DAD_HAIR,
    brows,
    horn,
    height: S,
    radius: 0.2 * S,
    phone: null,
    // His head (head-local): about 0.22 round, its middle 0.19 above the neck (model meters).
    face: { R: 0.22 * S, headY: 0.19 * S, mouth: [mouthAt[0] * S, mouthAt[1] * S, mouthAt[2] * S] },
    spots: {
      // Between the eye domes, on their front; the tip of his nose; the top of his quiff; the horn's tip.
      eyes: onHead(0, 0.645, 0.208),
      brow: onHead(-0.1, 0.708, 0.22),
      nose: onHead(0, 0.586, 0.247),
      crown: onHead(0, 0.927, -0.01),
      horn: onHead(0, 1.0, 0.16),
      // His legs below the shorts (the hips pivot at 0.175 and 8.6 cm out; the hem is at 0.138).
      leg: { x: -0.014 * S, z: 0.015 * S, r: 0.072 * S, sole: -0.175 * S, hem: -0.037 * S },
    },
  }
}

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
 *  his hips just high enough for his legs (7 cm thick) to rest on the seat, and their swing forward. */
export const DAD_SIT = { drop: 0.068, legs: -1.35 }

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

/** A rig like buildAnimal's, from the model (dadModel()). */
export function buildDadRig(gltf: GLTF, bag: Bag): Rig {
  const scene = gltf.scene.clone(true)
  const node = (name: string): Group => {
    const n = scene.getObjectByName(name)
    if (!n) throw new Error(`dad.glb has no ${name}`)
    return n as Group
  }
  // The pivots stay in real meters, like a code-built toy's (only the meshes are scaled up from the 1 m model): what
  // the scenes hang on him (the boat's sunglasses, the mall's socks, the ball on his horn) is sized in meters.
  const meshes: Mesh[] = []
  scene.traverse((o: Object3D) => {
    o.position.multiplyScalar(DAD_SIZE)
    if (o instanceof Mesh) {
      o.scale.multiplyScalar(DAD_SIZE)
      meshes.push(o)
    }
  })
  // Nothing was cut off him, so there are no flat caps to keep the ink off.
  inkPieces(meshes, bag, null)

  const root = new Group()
  const [body, head, eyes, armL, armR, tail, legL, legR] = ['body', 'head', 'eyes', 'armL', 'armR', 'tail', 'legL', 'legR'].map(node)
  root.add(blobShadow(0.3 * DAD_SIZE, bag), body)
  for (const [arm, s] of [[armL, -1], [armR, 1]] as const) swingForward(arm, s, ARM_TILT)

  // The smile: a row of little ink beads along the painted curve, each on the muzzle (a flat torus would float off
  // its ends, where the face curves back). Measured on the 1 m model, so each mouth's shape is scaled up inside it
  // (FaceLife and the plane's doze set the mouths' own scale).
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
  for (const m of [mouth, talk]) m.position.set(...mouthAt).multiplyScalar(DAD_SIZE)
  const sized = (g: Group) => {
    g.scale.setScalar(DAD_SIZE)
    return g
  }
  mouth.add(sized(solidMix([], beads, bag, 0)))
  talk.add(sized(solidMix([], [P.sphere(0.036, MOUTH, { at: [0, -0.002, -0.002], scale: [1.15, 0.9, 0.35] }), P.sphere(0.019, TONGUE, { at: [0, -0.015, 0.004], scale: [1.3, 0.6, 0.5] })], bag, 0)))
  talk.scale.setScalar(0.001)
  talk.visible = false
  head.add(mouth, talk)

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
    hair: meshes.find((m) => m.name.startsWith('hair')),
    horn: meshes.find((m) => m.name.startsWith('horn')),
    hairColors: DAD_HAIR,
    height: DAD_SIZE,
    radius: 0.2 * DAD_SIZE,
    phone: null,
    // His head with its hair (head-local): 0.41 m round, its middle 0.38 m above the neck (hats sit on it, the barber's
    // strands grow from it, the sunglasses stand 0.93 of it in front).
    face: { R: 0.24 * DAD_SIZE, headY: 0.224 * DAD_SIZE, mouth: [mouthAt[0] * DAD_SIZE, mouthAt[1] * DAD_SIZE, mouthAt[2] * DAD_SIZE] },
  }
}

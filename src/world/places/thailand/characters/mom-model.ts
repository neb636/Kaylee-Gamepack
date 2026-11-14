// Mom as a modelled vinyl toy (docs/3d-characters.md), like Kaylee (model.ts): a Tripo3D mesh of a cream unicorn with
// a brown bun and a pink dress, split in Blender into the code-built rig's pivots (body, head at the neck, eyes, arms at
// the shoulders, legs at the hips, tail). Two of Tripo's four meshes are in the lab side by side (`mom-2`, `mom-4`) so
// the user can pick one; the code-built Mom stays the game's until then.
//
// The concept picture went to Tripo with no mouth and no glasses: both are drawn here instead. The smile is a row of
// ink beads on her muzzle and the open mouth grows with her voice (FaceLife), and the round glasses sit in front of her
// painted eyes (thin wire rings from a picture come out of Tripo blobby). She blinks with cream lids over the eyes, like
// Kaylee's.
import { Group, Mesh, type Object3D } from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { Bag } from '../../../engine3d/dispose'
import { blobShadow, merge, P, solid, solidMix, type V3 } from '../../../engine3d/geo'
import type { Rig } from '../../../engine3d/characters/animal'
import { inkPieces, swingForward } from './model'
import url2 from './models/mom-2.glb?url'
import url4 from './models/mom-4.glb?url'

export type MomModel = 'mom-2' | 'mom-4'

/** How tall she stands (meters; the model is 1 m, like LOOKS.ji). */
export const MOM_SIZE = 1.55
/** How far each arm's swing plane turns forward (model.ts swingForward): her hair is about as wide as her reach. */
const ARM_TILT = 2.0

const SMILE = '#5A2A2A'
const MOUTH = '#7A2745'
const TONGUE = '#FF8FA8'
/** Her glasses: round frames in the reddish brown of the concept picture. */
const FRAME = '#8B3A2A'
/** Her face's cream (the lids that close over her painted eyes). */
const LID = '#FACCA2'

/** What was measured on each mesh in Blender (model meters, Blender axes: z up, the face toward -y). */
interface Fit {
  /** The head pivot's depth (Blender y; it sits at z 0.54, the neck). */
  neckY: number
  /** The front of her muzzle at the mouth (Blender -y at x 0) and how fast it curves back across (per x²). */
  muzzle: number
  curve: number
  /** Eye centers (x, z) and how far forward the eye's surface is (Blender -y). */
  eyeX: number
  eyeZ: number
  eyeFront: number
  /** How far the face turns away at the eyes (radians): the lids and lenses turn with it. */
  eyeYaw: number
  /** Eye domes sculpted over the painted eye (mom-4) or painted flat on the face (mom-2). */
  domes: boolean
}
const FITS: Record<MomModel, Fit> = {
  'mom-2': { neckY: -0.0416, muzzle: 0.2267, curve: 2.5, eyeX: 0.077, eyeZ: 0.669, eyeFront: 0.206, eyeYaw: 0.43, domes: false },
  'mom-4': { neckY: -0.0742, muzzle: 0.21, curve: 3.0, eyeX: 0.0768, eyeZ: 0.669, eyeFront: 0.195, eyeYaw: 0.25, domes: true },
}
const NECK_Z = 0.54
const URLS: Record<MomModel, string> = { 'mom-2': url2, 'mom-4': url4 }

const models = new Map<MomModel, GLTF>()
const loading = new Map<MomModel, Promise<GLTF | null>>()

/** The loaded model, or null while it's on its way (or if it couldn't load). */
export const momModel = (id: MomModel) => models.get(id) ?? null

/** Resolves once it's loaded, or with null if it couldn't be (never rejects: the code-built Mom stands in). */
export function momReady(id: MomModel): Promise<GLTF | null> {
  let p = loading.get(id)
  if (!p) {
    p = new GLTFLoader()
      .loadAsync(URLS[id])
      .then((g) => (models.set(id, g), g))
      .catch((e) => {
        console.warn(`${id}.glb could not be loaded, using the code-built Mom.`, e)
        return null
      })
    loading.set(id, p)
  }
  return p
}

/** A rig like buildAnimal's, from one of her models.
 *
 *  Like the code-built rig, every pivot sits where it is at full size and only the meshes are scaled up, so head-local,
 *  body-local and leg-local positions are in meters. */
export function buildMomRig(id: MomModel, gltf: GLTF, bag: Bag): Rig {
  const S = MOM_SIZE
  const fit = FITS[id]
  const scene = gltf.scene.clone(true)
  const node = (name: string): Group => {
    const n = scene.getObjectByName(name)
    if (!n) throw new Error(`${id}.glb has no ${name}`)
    return n as Group
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
  // Her arms and legs were their own pieces already; mom-4's head was cut off at the neck, inside her chin (y 0.54).
  inkPieces(meshes, (_x, y) => Math.abs(y - NECK_Z) < 0.001)

  const [body, head, eyes, armL, armR, tail, legL, legR] = ['body', 'head', 'eyes', 'armL', 'armR', 'tail', 'legL', 'legR'].map(node)
  for (const [arm, s] of [[armL, -1], [armR, 1]] as const) swingForward(arm, s, ARM_TILT)

  const root = new Group()
  root.add(blobShadow(0.24 * S, bag), body)

  // What the code draws on her face, in model meters (head-local, three.js axes) inside a group scaled to her size.
  const face = new Group()
  face.scale.setScalar(S)
  head.add(face)
  /** A Blender point (x, z up, y toward the back) in the head pivot's space. */
  const onHead = (x: number, z: number, y: number): V3 => [x, z - NECK_Z, -y + fit.neckY]
  /** A point on her muzzle, stood `lift` off it. */
  const onMuzzle = (x: number, z: number, lift: number): V3 => onHead(x, z, -(fit.muzzle - fit.curve * x * x + lift))

  // The smile: little ink beads along a gentle curve under her nose (a flat torus would float off its ends, where the
  // face curves back).
  const mouthAt = onMuzzle(0, 0.597, 0)
  const rel = (p: V3): V3 => [p[0] - mouthAt[0], p[1] - mouthAt[1], p[2] - mouthAt[2]]
  const beads = []
  const R = 0.032
  for (let i = 0; i <= 14; i++) {
    const a = -0.85 + (1.7 * i) / 14
    beads.push(P.sphere(0.0038, SMILE, { at: rel(onMuzzle(R * Math.sin(a), 0.624 - R * Math.cos(a), 0.001)), scale: [1, 1, 0.6] }, 8))
  }
  const mouth = new Group()
  const talk = new Group()
  for (const m of [mouth, talk]) m.position.set(...mouthAt)
  mouth.add(solidMix([], beads, bag, 0))
  talk.add(solidMix([], [P.sphere(0.02, MOUTH, { at: [0, -0.002, -0.002], scale: [1.15, 0.9, 0.35] }), P.sphere(0.011, TONGUE, { at: [0, -0.009, 0.003], scale: [1.3, 0.6, 0.5] })], bag, 0))
  talk.scale.setScalar(0.001)
  talk.visible = false
  face.add(mouth, talk)

  // The lids: a cream cap over each eye that grows down from above it as she blinks, turned with her face. Over the
  // sculpted domes (mom-4) it is a deeper cap; over eyes painted on the face (mom-2) a flatter one, so its edges don't
  // sink into the face.
  const lids: Group[] = []
  for (const s of [-1, 1] as const) {
    const turn = new Group()
    turn.position.set(...onHead(s * fit.eyeX, fit.eyeZ, -fit.eyeFront))
    turn.rotation.y = s * fit.eyeYaw
    const lid = new Group()
    lid.position.y = 0.052
    const cap = fit.domes ? { r: 0.056, depth: 0.6, back: -0.016 } : { r: 0.064, depth: 0.35, back: -0.016 }
    lid.add(solid(P.sphere(cap.r, LID, { at: [0, -0.052, cap.back], scale: [1, 0.92, cap.depth] }), bag, 1.2))
    lid.scale.y = 0.001
    lid.visible = false
    turn.add(lid)
    face.add(turn)
    lids.push(lid)
  }

  // The glasses: a round frame in front of each eye (turned with the face), a little arched bridge and the arms
  // tucking back into her hair.
  const frames = []
  const RING = 0.06
  const lens = (s: -1 | 1) => onHead(s * fit.eyeX, fit.eyeZ, -(fit.eyeFront + 0.013))
  for (const s of [-1, 1] as const) {
    const at = lens(s)
    frames.push(P.torus(RING, 0.0055, FRAME, { at, rot: [0, s * fit.eyeYaw, 0] }))
    // The arm from the frame's outer edge back along the side of her head (it disappears under her hair).
    const edge: V3 = [at[0] + s * RING * Math.cos(fit.eyeYaw), at[1] + 0.006, at[2] - RING * Math.sin(fit.eyeYaw)]
    frames.push(P.cyl(0.0045, 0.0045, 0.12, FRAME, { at: [edge[0] + s * 0.012, edge[1], edge[2] - 0.06], rot: [Math.PI / 2, 0, -s * 0.2] }, 8))
  }
  const inner = fit.eyeX - RING * Math.cos(fit.eyeYaw)
  const bridgeAt = lens(1)
  frames.push(P.torus(inner + 0.002, 0.005, FRAME, { at: [0, bridgeAt[1] + 0.004, bridgeAt[2] + RING * Math.sin(fit.eyeYaw) + 0.004] }, Math.PI))
  const glasses = solid(merge(frames), bag, 1.2)
  face.add(glasses)

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
    height: S,
    radius: 0.2 * S,
    phone: null,
    // Her head (head-local): about 0.23 round, its middle 0.15 above the neck (model meters).
    face: { R: 0.23 * S, headY: 0.15 * S, mouth: [mouthAt[0] * S, mouthAt[1] * S, mouthAt[2] * S] },
    blink(open: number) {
      const shut = (1 - open) / 0.9
      for (const lid of lids) {
        lid.visible = shut > 0.02
        lid.scale.y = Math.max(0.001, shut)
      }
    },
  }
}

// Mom as a modelled vinyl toy (docs/3d-characters.md), like Kaylee (model.ts): a Tripo3D mesh of a cream unicorn with
// a brown bun and a pink dress (Tripo's generation 2, the user's pick; slimmed in Blender at
// the belly, hips and legs, she looked chubbier than the concept picture), split in Blender into the code-built rig's
// pivots (body, head at the neck, eyes, arms at the shoulders, legs at the hips, tail). For now she is in the
// character lab only (`mom-model`); the code-built Mom is still the game's.
//
// The concept picture went to Tripo with no mouth and no glasses: both are drawn here instead. The smile is a row of
// ink beads on her muzzle and the open mouth grows with her voice (FaceLife). The glasses are traced on her face: each
// rim and the bridge follow the face's own surface a few millimetres off it (rays cast at the face mesh), so they sit
// on her from every side instead of floating as flat rings. She blinks with cream lids over her painted eyes.
import { CatmullRomCurve3, Group, Mesh, Raycaster, TubeGeometry, Vector3, type BufferGeometry, type Object3D } from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { Bag } from '../../../engine3d/dispose'
import { bake, blobShadow, merge, P, solid, solidMix, type V3 } from '../../../engine3d/geo'
import type { Rig } from '../../../engine3d/characters/animal'
import { inkPieces, swingForward } from './model'
import url from './models/mom.glb?url'

/** How tall she stands (meters; the model is 1 m, like LOOKS.ji). */
export const MOM_SIZE = 1.55
/** How far each arm's swing plane turns forward (model.ts swingForward): her hair is about as wide as her reach. */
const ARM_TILT = 2.0
/** Her ink widths before TUNE.outline: the user's pick in the lab, the Outline slider at 0.35 instead of 0.75, so her
 *  line is under half of Kaylee's (1.8 px) and the glasses' and lids' ink shrink with it. */
const INK = 0.35 / 0.75
const BODY_INK = 1.8 * INK
const FACE_INK = 1.2 * INK

const SMILE = '#5A2A2A'
const MOUTH = '#7A2745'
const TONGUE = '#FF8FA8'
/** Her glasses: round frames in the reddish brown of the concept picture. */
const FRAME = '#8B3A2A'
/** Her face's cream (the lids that close over her painted eyes). */
const LID = '#FACCA2'

// Measured on the model in Blender (model meters, Blender axes: z up, the face toward -y).
/** The head pivot: at the neck (z 0.54), this deep. */
const NECK_Z = 0.54
const NECK_Y = -0.0416
/** The front of her muzzle at the mouth (Blender -y at x 0), and how fast it curves back across (per x²). */
const MUZZLE = 0.2267
const CURVE = 2.5
/** Her painted eyes: centers (x, z), how far forward the face is there, and how far it turns away (radians). */
const EYE_X = 0.077
const EYE_Z = 0.669
const EYE_FRONT = 0.206
const EYE_YAW = 0.43
/** The glasses (model meters): each rim's half-width and half-height around the eye, how far off the face it stands,
 *  and the wire's thickness. Round, like the concept picture. */
const RIM = { rx: 0.057, ry: 0.057, lift: 0.007, wire: 0.0042 }

let model: GLTF | null = null
let ready: Promise<GLTF | null> | null = null

/** The loaded model, or null while it's on its way (or if it couldn't load). */
export const momModel = () => model

/** Resolves once she's loaded, or with null if she couldn't be (never rejects: the code-built Mom stands in). */
export function momReady(): Promise<GLTF | null> {
  ready ??= new GLTFLoader()
    .loadAsync(url)
    .then((g) => (model = g))
    .catch((e) => {
      console.warn('mom.glb could not be loaded, using the code-built Mom.', e)
      return null
    })
  return ready
}

/** A point of the model (three.js axes: x, y up, z forward) in the head pivot's space. */
const toHead = (p: Vector3): V3 => [p.x, p.y - NECK_Z, p.z + NECK_Y]

// The glasses' wire, traced once per face mesh (clones share its geometry) and kept for the session.
const traced = new WeakMap<BufferGeometry, V3[][]>()
/** The glasses as head-local polylines (two closed rims, then the bridge), each point on her face pushed `lift` out
 *  along the face's normal there. */
function traceGlasses(face: BufferGeometry): V3[][] {
  let lines = traced.get(face)
  if (lines) return lines
  const probe = new Mesh(face)
  const ray = new Raycaster()
  const down = new Vector3(0, 0, -1)
  const onFace = (x: number, y: number, lift: number): V3 => {
    ray.set(new Vector3(x, y, 1), down)
    const hit = ray.intersectObject(probe, false)[0]
    if (!hit?.face) return toHead(new Vector3(x, y, EYE_FRONT + lift))
    return toHead(hit.point.clone().addScaledVector(hit.face.normal, lift))
  }
  const rims = ([-1, 1] as const).map((s) => {
    const pts: V3[] = []
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2
      pts.push(onFace(s * EYE_X + RIM.rx * Math.cos(a), EYE_Z + RIM.ry * Math.sin(a), RIM.lift))
    }
    // The depth along the rim, kept to its gentle trend (the first two harmonics round the circle: the face's tilt and
    // its curve), so the sculpt's lash bumps can't kink the ring; then stood out just far enough that no point sits
    // nearer the face than half the lift.
    const z = pts.map((p) => p[2])
    const smooth = z.map(() => z.reduce((s, v) => s + v, 0) / 48)
    for (let h = 1; h <= 2; h++) {
      let c = 0
      let d = 0
      z.forEach((v, i) => {
        c += v * Math.cos((h * i * Math.PI * 2) / 48)
        d += v * Math.sin((h * i * Math.PI * 2) / 48)
      })
      smooth.forEach((_, i) => (smooth[i] += (2 / 48) * (c * Math.cos((h * i * Math.PI * 2) / 48) + d * Math.sin((h * i * Math.PI * 2) / 48))))
    }
    const out = Math.max(0, ...z.map((v, i) => v - RIM.lift / 2 - smooth[i]))
    pts.forEach((p, i) => (p[2] = smooth[i] + out))
    return pts
  })
  // The bridge: from one rim's inner edge to the other's, over the top of her nose in a little arch.
  const inner = EYE_X - RIM.rx
  const bridge: V3[] = []
  for (let i = 0; i <= 12; i++) {
    const t = i / 12
    bridge.push(onFace(-inner + 2 * inner * t, EYE_Z + 0.004 + 0.008 * Math.sin(Math.PI * t), RIM.lift + 0.002))
  }
  lines = [...rims, bridge]
  traced.set(face, lines)
  return lines
}

/** A rig like buildAnimal's, from her model.
 *
 *  Like the code-built rig, every pivot sits where it is at full size and only the meshes are scaled up, so head-local,
 *  body-local and leg-local positions are in meters. */
export function buildMomRig(gltf: GLTF, bag: Bag): Rig {
  const S = MOM_SIZE
  const scene = gltf.scene.clone(true)
  const node = (name: string): Group => {
    const n = scene.getObjectByName(name)
    if (!n) throw new Error(`mom.glb has no ${name}`)
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
  // Tripo made her head, arms, legs and tail separate pieces: nothing was cut, so no caps to keep the ink off.
  inkPieces(meshes, null, BODY_INK)

  const [body, head, eyes, armL, armR, tail, legL, legR] = ['body', 'head', 'eyes', 'armL', 'armR', 'tail', 'legL', 'legR'].map(node)
  for (const [arm, s] of [[armL, -1], [armR, 1]] as const) swingForward(arm, s, ARM_TILT)

  const root = new Group()
  root.add(blobShadow(0.24 * S, bag), body)

  // What the code draws on her face, in model meters (head-local, three.js axes) inside a group scaled to her size.
  const face = new Group()
  face.scale.setScalar(S)
  head.add(face)
  /** A Blender point (x, z up, y toward the back) in the head pivot's space. */
  const onHead = (x: number, z: number, y: number): V3 => [x, z - NECK_Z, -y + NECK_Y]
  /** A point on her muzzle, stood `lift` off it. */
  const onMuzzle = (x: number, z: number, lift: number): V3 => onHead(x, z, -(MUZZLE - CURVE * x * x + lift))

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

  // The lids: a flat cream cap over each painted eye that grows down from above it as she blinks, turned with her face
  // (flat, so its edges don't sink into the face).
  const lids: Group[] = []
  for (const s of [-1, 1] as const) {
    const turn = new Group()
    turn.position.set(...onHead(s * EYE_X, EYE_Z, -EYE_FRONT))
    turn.rotation.y = s * EYE_YAW
    const lid = new Group()
    lid.position.y = 0.052
    lid.add(solid(P.sphere(0.064, LID, { at: [0, -0.052, -0.016], scale: [1, 0.92, 0.35] }), bag, FACE_INK))
    lid.scale.y = 0.001
    lid.visible = false
    turn.add(lid)
    face.add(turn)
    lids.push(lid)
  }

  // The glasses: the traced rims and bridge as one thin wire with a fine ink line.
  const wires = traceGlasses((head.getObjectByName('face_mesh') as Mesh).geometry).map((pts, i) => {
    const closed = i < 2
    const curve = new CatmullRomCurve3(pts.map((p) => new Vector3(...p)), closed)
    return bake(new TubeGeometry(curve, closed ? 72 : 16, RIM.wire, 6, closed), FRAME)
  })
  face.add(solid(merge(wires), bag, FACE_INK))

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

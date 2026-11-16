// Dad as a modelled vinyl toy (docs/3d-characters.md): a mint unicorn with brown hair, a pink tee and khaki shorts.
// The user made four in Tripo3D and picked "Green 2" in the character lab (2026-11-15), recoloured in the texture to
// the code-built Dad's mint. Green 2 came out of Tripo as one fused mesh, and no cut through its short sleeves let an
// arm lift cleanly, so the user regenerated the same picture: this is regeneration 2 (planning repo models/nick/regen/),
// where Tripo made the arms and legs pieces of their own, like Mom's. He is the game's Dad: Member builds him for
// `nick` (familyRig), and Thailand's Place and the character lab wait for his GLB before they build (2026-11-15).
//
// Blender (split-nick.py next to nick-rigs.blend in models/nick/): his own arms, each with a ball joint closing its
// open shoulder end up inside the sleeve (Tripo's arm already runs up under the sleeve, so a raised arm comes out from
// under it as one limb); his own legs under the shorts; the head cut off at the neck and capped (the collar stays on
// the body); the hair and horn by their colours, with a skin scalp under the hair so the barber can take it away. The
// tail stays on the body (it joins it right at the shirt's hem, and cutting it off left a patch across the hem): the
// rig's `tail` is an empty joint where it starts, so it doesn't stream back in the wind. Tripo's own normals are copied back onto every piece (rebuilt pieces lose them,
// and the shirt's folded-back hem then shows light jagged teeth), the shirt-pink Tripo painted on top of each arm is
// mint, and the texture's blotchy baked shading is calmed. His eyes are glossy domes over a socket (squashing them
// would show it), so like Mom he blinks with lids, in his mint. No mouth was sculpted: the smile and the talking mouth
// are drawn on his muzzle.
//
// His sleeves go with his arms (sleevesFollow, below): the shirt past each shoulder seam turns with the arm, so a wave
// or a cheer brings the sleeve up with it instead of the arm sliding out from under a sleeve that stays down. For that,
// split-nick.py's pink_sleeves() painted each sleeve's end cap (Tripo's was mint) and each arm's hidden top shirt pink.
import { Group, Matrix3, Matrix4, Mesh, Raycaster, Vector3, type BufferAttribute, type BufferGeometry, type Object3D } from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { Bag } from '../../../engine3d/dispose'
import { smoothstep } from '../../../../sdk/math'
import { blobShadow, P, solid, solidMix, type V3 } from '../../../engine3d/geo'
import type { Rig } from '../../../engine3d/characters/animal'
import { inkPieces } from './model'
import { reachForward } from './mom-model'
import url from './models/dad.glb?url'

/** How tall he stands (meters; the 1 m model's top is his ear tips and horn tip): a little taller than Mom (1.85). */
export const DAD_SIZE = 1.95
/** His hair's browns, dark to light (measured on the texture): the barber's strands and its falling snips. */
export const DAD_HAIR = ['#794321', '#874828', '#94532D']
/** How far each arm's swing plane turns forward for a wave (mom-model.ts reachForward): his head is wider than his
 *  shoulders, so an arm raised straight out to the side would come up into his ear. */
const ARM_TILT = 1.2
/** His ink before TUNE.outline: the user's pick, the Outline slider at 0.35 (2026-11-15; Mom's is at 1). The lids' ink
 *  follows it. */
const INK = 0.35 / 0.75
const BODY_INK = 1.8 * INK
const FACE_INK = 1.2 * INK
/** His mint, as split-nick.py's mint() painted it into the texture (the lids). */
const SKIN = '#A8EAD5'
const SMILE = '#4A2A2A'
const MOUTH = '#7A2745'
const TONGUE = '#FF8FA8'

// Where he was cut and what's on his face, measured in Blender (model meters, Blender axes: z up, the face toward -y).
const NECK = 0.53
/** The right eye dome's box (Blender axes: x across, y depth, z up): centre and half-sizes (the left is mirrored). */
const EYE = { c: [0.0942, -0.1711, 0.6885] as V3, r: [0.0408, 0.02, 0.0405] as V3 }
/** The bottom of his nose (the mouth goes under it). */
const NOSE = 0.627
/** The middle of the right hoof from the shoulder pivot (three.js axes; the left is mirrored). */
const HOOF: V3 = [0.117, -0.15, 0.024]
/** The left brow's middle and the horn's tip (Blender). */
const BROW: V3 = [-0.104, -0.1809, 0.7548]
const HORN: V3 = [-0.0081, -0.2209, 0.9995]
/** The middle of his hair's height (the vet's suds puff it from there). */
const HAIR_MID = 0.816
/** Where each sleeve meets the shirt (model meters, three.js axes, the right side: the left is mirrored): a seam
 *  line through `x`, `y` running down toward the armpit, its normal `n` pointing out along the sleeve, and how wide
 *  (`band`) the shirt stretches from the body's hold to the arm's. Nothing below `low` (the tail curls out there). */
const SEAM = { x: 0.13, y: 0.5, n: [0.945, 0.327] as const, band: 0.05, low: 0.37 }
/** His chest (model meters, three.js axes, measured on the shirt): its middle height and depth, half-width and
 *  half-depth, and its height from the hem to the collar. */
const CHEST = { y: 0.44, z: -0.02, rx: 0.18, rz: 0.13, h: 0.16 }
/** His left leg in its hip pivot's space (three.js axes, model meters): middle x and z, radius, sole and hem heights. */
const SHIN = { x: -0.0125, z: 0.0096, r: 0.0758, sole: -0.1623, hem: -0.01 }

let model: GLTF | null = null
let ready: Promise<GLTF> | null = null

/** The loaded model. Thailand's Place and the character lab wait for dadReady() before they build anything. */
export function dadModel(): GLTF {
  if (!model) throw new Error('dad.glb is not loaded yet: wait for dadReady() first')
  return model
}

/** Resolves once he's loaded. If the GLB can't be fetched it rejects, and the next call tries again. */
export function dadReady(): Promise<GLTF> {
  ready ??= new GLTFLoader().loadAsync(url).then(
    (g) => (model = g),
    (e) => {
      ready = null
      throw e
    },
  )
  return ready
}

/** A rig like buildAnimal's, from his model. Like Mom's, every pivot sits where it is at full size and only the meshes
 *  are scaled up, so head-local, body-local and leg-local positions are in meters. */
export function buildDadRig(gltf: GLTF, bag: Bag): Rig {
  const S = DAD_SIZE
  const scene = gltf.scene.clone(true)
  const node = (name: string): Group => {
    const n = scene.getObjectByName(name)
    if (!n) throw new Error(`dad.glb has no ${name}`)
    return n as Group
  }
  // The neck pivot in model meters (three.js axes), before anything is scaled.
  const neck = node('head').position.clone()
  const meshes: Mesh[] = []
  scene.traverse((o: Object3D) => {
    if (o === scene) return
    o.position.multiplyScalar(S)
    if (o instanceof Mesh) {
      o.scale.multiplyScalar(S)
      meshes.push(o)
    }
  })
  // No ink on the flat cap where Blender cut his head off (model meters, three.js axes: y up). His arms and legs are
  // Tripo's own pieces: nothing else was cut.
  const onCut = (_x: number, y: number) => Math.abs(y - NECK) < 0.001
  // The body's shape bends where the sleeves go with the arms: his own copy (clones share the model's).
  const bodyMesh = node('body_mesh') as unknown as Mesh
  bodyMesh.geometry = bag.add(bodyMesh.geometry.clone())
  inkPieces(meshes, onCut, BODY_INK)

  const [body, head, eyes, armL, armR, tail, legL, legR] = ['body', 'head', 'eyes', 'armL', 'armR', 'tail', 'legL', 'legR'].map(node)
  // (Every piece is looked up here: once the body moves to `root`, the clone no longer holds it.)
  const [hairMesh, browL, browR, horn] = ['hair_mesh', 'brow_L', 'brow_R', 'horn'].map(node)
  const headMesh = node('head_mesh') as unknown as Mesh
  const hands = ([[armL, -1], [armR, 1]] as const).map(([arm, s]) => {
    reachForward(arm, s, ARM_TILT)
    const hand = new Group()
    hand.position.set(s * HOOF[0] * S, HOOF[1] * S, HOOF[2] * S)
    arm.add(hand)
    return hand
  })
  sleevesFollow(bodyMesh, [[armL, -1], [armR, 1]], bag)
  const root = new Group()
  root.add(blobShadow(0.24 * S, bag), body)

  // His hair and brows, each in a group of their own (the barber hides them, the vet's suds puff the hair up from its
  // middle).
  const hair = new Group()
  const mid: V3 = [0, (HAIR_MID - neck.y) * S, -neck.z * S]
  hair.position.set(...mid)
  hairMesh.position.sub(hair.position)
  head.add(hair)
  hair.add(hairMesh)
  const brows = new Group()
  head.add(brows)
  brows.add(browL, browR)

  // What the code draws on his face, in model meters (head-local) inside a group scaled to his size.
  const face = new Group()
  face.scale.setScalar(S)
  head.add(face)
  /** A Blender point (x, z up, y toward the back) in the head pivot's space. */
  const onHead = (x: number, z: number, y: number): V3 => [x - neck.x, z - neck.y, -y - neck.z]
  const sc = (p: V3): V3 => [p[0] * S, p[1] * S, p[2] * S]
  // The round of his head under the hair (the barber's strands root on it): his hair's box (model meters, three.js
  // axes), its middle a hair's depth down from the crown so the crown is on it, a shade inside so strands start under
  // where his own hair was.
  const hairGeo = (hairMesh as unknown as Mesh).geometry
  hairGeo.boundingBox ?? hairGeo.computeBoundingBox()
  const hb = hairGeo.boundingBox!
  const half = [(hb.max.x - hb.min.x) / 2, (hb.max.z - hb.min.z) / 2]
  const cy = hb.max.y - (half[0] + half[1]) / 2
  const SCALP = { c: [0, (cy - neck.y) * S, ((hb.max.z + hb.min.z) / 2 - neck.z) * S] as V3, r: [half[0] * S * 0.97, (hb.max.y - cy) * S * 0.97, half[1] * S * 0.97] as V3 }
  // Points on his face: rays cast at the head mesh from in front (it's in model meters, three.js axes).
  const probe = new Mesh(headMesh.geometry as BufferGeometry)
  const ray = new Raycaster()
  const back = new Vector3(0, 0, -1)
  const hitAt = (x: number, z: number) => {
    ray.set(new Vector3(x, z, 1), back)
    return ray.intersectObject(probe, false)[0]
  }
  const onFace = (x: number, z: number, lift: number): V3 => {
    const hit = hitAt(x, z)
    const p = hit?.face ? hit.point.clone().addScaledVector(hit.face.normal, lift) : new Vector3(x, z, 0.22)
    return [p.x - neck.x, p.y - neck.y, p.z - neck.z]
  }

  // The smile: little ink beads along a gentle curve under his nose (like Mom's).
  const mouthZ = NOSE - 0.024
  const mouthAt = onFace(0, mouthZ, 0)
  const rel = (p: V3): V3 => [p[0] - mouthAt[0], p[1] - mouthAt[1], p[2] - mouthAt[2]]
  const beads = []
  const R = 0.03
  for (let i = 0; i <= 14; i++) {
    const a = -0.85 + (1.7 * i) / 14
    beads.push(P.sphere(0.0036, SMILE, { at: rel(onFace(R * Math.sin(a), mouthZ + 0.026 - R * Math.cos(a), 0.001)), scale: [1, 1, 0.6] }, 8))
  }
  const mouth = new Group()
  const talk = new Group()
  for (const m of [mouth, talk]) m.position.set(...mouthAt)
  mouth.add(solidMix([], beads, bag, 0))
  talk.add(solidMix([], [P.sphere(0.02, MOUTH, { at: [0, -0.002, -0.002], scale: [1.15, 0.9, 0.35] }), P.sphere(0.011, TONGUE, { at: [0, -0.009, 0.003], scale: [1.3, 0.6, 0.5] })], bag, 0))
  talk.scale.setScalar(0.001)
  talk.visible = false
  face.add(mouth, talk)

  // The lids: his skin colour over each eye dome, growing down from above it.
  const [ex, ey, ez] = EYE.c
  // Blender's half-sizes: across, depth, up (the lid's sphere is in three.js axes: across, up, depth).
  const [rx, depth, up] = EYE.r
  const lids: Group[] = []
  for (const s of [-1, 1] as const) {
    const lid = new Group()
    lid.position.set(...onHead(s * ex, ez + up + 0.005, ey))
    lid.add(solid(P.sphere(1, SKIN, { at: [0, -(up + 0.005), 0], scale: [rx + 0.005, up + 0.005, depth + 0.005] }), bag, FACE_INK))
    lid.scale.y = 0.001
    lid.visible = false
    face.add(lid)
    lids.push(lid)
  }

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
    hands: [hands[0], hands[1]],
    ears: [],
    mane: null,
    hair,
    hairColors: DAD_HAIR,
    brows,
    horn,
    height: S,
    radius: 0.2 * S,
    phone: null,
    face: { R: 0.23 * S, headY: (0.7 - NECK) * S, mouth: sc(mouthAt) },
    // A hat goes round his head under the horn, about 0.2 round (model meters).
    spots: {
      crown: sc(onHead(0, 0.84, -0.02)),
      hat: 0.21 * S,
      nose: sc(onFace(0, NOSE + 0.012, 0)),
      eyes: sc(onFace(0, ez, 0)),
      brow: sc(onHead(BROW[0], BROW[2], BROW[1])),
      horn: sc(onHead(HORN[0], HORN[2], HORN[1])),
      scalp: SCALP,
    },
    chest: { y: CHEST.y * S, z: CHEST.z * S, rx: CHEST.rx * S, rz: CHEST.rz * S, h: CHEST.h * S },
    shin: { x: SHIN.x * S, z: SHIN.z * S, r: SHIN.r * S, sole: SHIN.sole * S, hem: SHIN.hem * S },
    blink(open: number) {
      const shut = (1 - open) / 0.9
      for (const lid of lids) {
        lid.visible = shut > 0.02
        lid.scale.y = Math.max(0.001, shut)
      }
    },
  }
}

/** His short sleeves are part of the shirt (Tripo made the arms on their own, tucked up inside them), so a raised arm
 *  used to come up out of a sleeve that stayed down, its mint top showing under the hem. Each sleeve goes with its arm
 *  instead: the shirt's vertices past the seam (SEAM) turn with the arm, fading across the seam's band to the ones the
 *  body holds, so the shoulder stretches like cloth. Done on the CPU just before each draw, for the shirt and its ink
 *  hull alike (the hull is a welded copy, so it gets its own weights from the same seam). */
function sleevesFollow(mesh: Mesh, arms: [Object3D, -1 | 1][], bag: Bag) {
  const hull = mesh.children.find((c) => c.userData.hull) as Mesh | undefined
  // (His hull was made from his own copy of the shape, so it's his alone too.)
  if (hull) bag.add(hull.geometry)
  // Each arm's rest pose in the body's space (its matrix once unturned), inverted.
  const rest = arms.map(([arm]) => new Matrix4().compose(arm.position, arm.quaternion, arm.scale).invert())
  const D = new Matrix4()
  const M = new Matrix4()
  const N = new Matrix3()
  const v = new Vector3()
  const n = new Vector3()
  const a = new Vector3()
  for (const part of hull ? [mesh, hull] : [mesh]) {
    const pos = part.geometry.attributes.position as BufferAttribute
    const nor = part.geometry.attributes.normal as BufferAttribute
    const P = pos.array as Float32Array
    const Nr = nor.array as Float32Array
    const P0 = P.slice()
    const N0 = Nr.slice()
    const sides = arms.map(([arm, s], k) => {
      const idx: number[] = []
      const w: number[] = []
      for (let i = 0; i < pos.count; i++) {
        const f = (s * P0[i * 3] - SEAM.x) * SEAM.n[0] + (P0[i * 3 + 1] - SEAM.y) * SEAM.n[1]
        const t = smoothstep(0, SEAM.band, f) * smoothstep(SEAM.low - 0.02, SEAM.low, P0[i * 3 + 1])
        if (t > 0) {
          idx.push(i)
          w.push(t)
        }
      }
      return { arm, inv: rest[k], idx, w, last: new Matrix4() }
    })
    part.onBeforeRender = () => {
      let moved = false
      for (const side of sides) {
        // The arm's turn since rest, in the mesh's own space (the mesh is scaled up inside the body).
        M.compose(mesh.position, mesh.quaternion, mesh.scale)
        D.copy(M).invert().multiply(side.arm.matrix).multiply(side.inv).multiply(M)
        if (D.equals(side.last)) continue
        side.last.copy(D)
        moved = true
        N.getNormalMatrix(D)
        side.idx.forEach((i, j) => {
          const t = side.w[j]
          v.fromArray(P0, i * 3)
          const x = v.x
          const y = v.y
          const z = v.z
          v.applyMatrix4(D)
          P[i * 3] = x + (v.x - x) * t
          P[i * 3 + 1] = y + (v.y - y) * t
          P[i * 3 + 2] = z + (v.z - z) * t
          a.fromArray(N0, i * 3)
          n.copy(a).applyMatrix3(N).sub(a).multiplyScalar(t).add(a).normalize()
          n.toArray(Nr, i * 3)
        })
      }
      if (moved) {
        pos.needsUpdate = true
        nor.needsUpdate = true
      }
    }
  }
}

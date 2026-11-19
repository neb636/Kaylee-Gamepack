// Dad 5’s skinned rig for the character lab. His Blender wave uses the original arm chain.
import { AnimationMixer, Group, MeshToonMaterial, ShaderMaterial, SkinnedMesh, Vector3, type BufferGeometry, type Object3D, type Texture } from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import type { Bag } from '../../../engine3d/dispose'
import type { Rig } from '../../../engine3d/characters/animal'
import { blobShadow } from '../../../engine3d/geo'
import { outlineMaterial } from '../../../engine3d/outline'
import { toonGradient } from '../../../engine3d/toon'
import { ARM_TILT, BODY_INK, DAD_SIZE, dadFace, dadShape, type SplitMeta } from './dad-model'
import { reachForward } from './mom-model'
import five from './models/candidates/dad-5.glb?url'
import m5 from './models/candidates/dad-5.json'

const DADS = {
  'dad-5': { url: five, meta: m5 as SplitMeta },
} as const
export type DadCandidate = keyof typeof DADS

const loaded = new Map<DadCandidate, { gltf: GLTF; material: MeshToonMaterial }>()
let ready: Promise<unknown> | null = null

/** Resolves once Dad 5 is loaded (the lab waits for it). */
export function dadCandidatesReady(): Promise<unknown> {
  ready ??= Promise.all(
    (Object.keys(DADS) as DadCandidate[]).map((id) =>
      new GLTFLoader().loadAsync(DADS[id].url).then((gltf) => {
        let map: Texture | null = null
        gltf.scene.traverse((o) => {
          const m = (o as SkinnedMesh).material as { map?: Texture | null } | undefined
          if ((o as SkinnedMesh).isSkinnedMesh && m?.map) map = m.map
        })
        if (!map) throw new Error(`${id} has no texture`)
        // His texture is painted for the game by scripts/blender/paint-dad.py (skin, muzzle, eyes, stubble).
        ;(map as Texture).anisotropy = 8
        loaded.set(id, { gltf, material: new MeshToonMaterial({ map, gradientMap: toonGradient() }) })
      }),
    ),
  ).catch((e) => {
    ready = null
    throw e
  })
  return ready
}

/** One candidate's rig: Tripo's skinned model with the game's pivots on its bones. */
export function buildDadCandidate(id: DadCandidate, bag: Bag): Rig {
  const got = loaded.get(id)
  if (!got) throw new Error(`${id} is not loaded yet: wait for dadCandidatesReady() first`)
  const material = got.material
  const S = DAD_SIZE
  const model = cloneSkinned(got.gltf.scene)
  model.scale.setScalar(S)
  const root = new Group()
  const body = new Group()
  root.add(blobShadow(0.24 * S, bag), body)
  body.add(model)
  root.updateMatrixWorld(true)

  let skinned: SkinnedMesh | null = null
  model.traverse((o) => {
    if ((o as SkinnedMesh).isSkinnedMesh) skinned = o as SkinnedMesh
  })
  const mesh = skinned as unknown as SkinnedMesh
  mesh.material = material
  mesh.frustumCulled = false

  // GLTFLoader drops the ":" from "mixamorig:Head".
  const bone = (name: string): Object3D => {
    const b = model.getObjectByName(`mixamorig${name}`) ?? model.getObjectByName(`mixamorig:${name}`)
    if (!b) throw new Error(`${id} has no ${name} bone`)
    return b
  }
  const where = (o: Object3D) => o.getWorldPosition(new Vector3())
  /** A pivot group on the body at a bone (identity turn, like the game's pieces), with the bone hung under it. */
  const pivot = (b: Object3D) => {
    const g = new Group()
    g.position.copy(body.worldToLocal(where(b)))
    body.add(g)
    g.updateMatrixWorld(true)
    g.attach(b)
    return g
  }
  /** The game's left is three.js -x: whichever of Tripo's pair is there. */
  const sided = (pair: [string, string]) => {
    const [a, b] = pair.map(bone)
    return where(a).x < where(b).x ? [a, b] : [b, a]
  }
  const [armLBone, armRBone] = sided(['LeftArm', 'RightArm'])
  const [legLBone, legRBone] = sided(['LeftUpLeg', 'RightUpLeg'])
  const [handLBone, handRBone] = sided(['LeftHand', 'RightHand'])
  const headBone = bone('Head')
  const hoofAt = [where(handLBone), where(handRBone)]
  const neckAt = where(headBone)

  const head = pivot(headBone)
  const armL = pivot(armLBone)
  const waveClip = got.gltf.animations.find((clip) => clip.name === 'Dad wave')
  // Keep the waving chain under its collarbone. The socket and its inverse cancel at rest,
  // so the GLB clip still sees the exact parent space in which each rotation was keyed.
  // Other actions turn the middle group in the same body axes as the other family rigs.
  const armR = waveClip ? nativeArmPivot(armRBone, body) : pivot(armRBone)
  const mixer = waveClip ? new AnimationMixer(model) : null
  if (mixer && waveClip) mixer.clipAction(waveClip).play()
  const legL = pivot(legLBone)
  const legR = pivot(legRBone)
  // Where a held thing goes: a group at each hoof (turned like the body), before the arm's swing plane turns forward.
  const hands = ([armL, armR] as const).map((arm, k) => {
    const hand = new Group()
    hand.position.copy(hoofAt[k])
    root.add(hand)
    hand.updateMatrixWorld(true)
    const holder = k === 1 && waveClip ? handRBone : arm
    holder.attach(hand)
    return hand
  })
  reachForward(armL, -1, ARM_TILT)
  reachForward(armR, 1, ARM_TILT)

  const meta = DADS[id].meta
  // The neck pivot in model meters (three.js axes): his Head bone.
  const neck = neckAt.clone().divideScalar(S)
  const shape = { ...dadShape(meta), neck: neck.y }
  const f = dadFace(head, neck, mesh.geometry as BufferGeometry, shape, bag)

  const eyes = new Group()
  eyes.position.set(0, (shape.eye.c[2] - neck.y) * S, (-shape.eye.c[1] - neck.z) * S)
  head.add(eyes)
  const hair = new Group()
  hair.position.set(0, (shape.hairMid - neck.y) * S, -neck.z * S)
  head.add(hair)
  const brows = new Group()
  head.add(brows)
  const horn = new Group()
  horn.position.set(...f.spots.horn!)
  head.add(horn)
  const tail = new Group()
  const t = (meta as SplitMeta & { tailRoot?: number[] }).tailRoot ?? [0, 0.29, -0.12]
  tail.position.set(t[0] * S, t[1] * S, t[2] * S)
  body.add(tail)

  // His ink: a skinned copy of his shape, so the line bends with him.
  const hull = new SkinnedMesh(bag.add(hullOf(mesh.geometry as BufferGeometry)), skinnedOutline(BODY_INK))
  hull.bind(mesh.skeleton, mesh.bindMatrix)
  hull.frustumCulled = false
  hull.userData.hull = BODY_INK
  hull.position.copy(mesh.position)
  hull.quaternion.copy(mesh.quaternion)
  hull.scale.copy(mesh.scale)
  mesh.parent!.add(hull)

  const hip = (legL.position.y / S) as number
  return {
    root,
    body,
    head,
    eyes,
    mouth: f.mouth,
    talk: f.talk,
    open: false,
    armL,
    armR,
    wave: mixer && waveClip ? (progress) => mixer.setTime(progress * waveClip.duration) : undefined,
    tail,
    legL,
    legR,
    hands: [hands[0], hands[1]],
    ears: [],
    mane: null,
    hair,
    hairColors: shape.hair,
    brows,
    horn,
    height: S,
    radius: 0.2 * S,
    phone: null,
    face: f.face,
    spots: f.spots,
    shin: { x: 0, z: 0, r: shape.shin.r * S, sole: -hip * S, hem: (0.13 - hip) * S },
    blink: f.blink,
  }
}

function nativeArmPivot(bone: Object3D, body: Group): Group {
  const parent = bone.parent!
  const socket = new Group()
  body.add(socket)
  socket.position.copy(body.worldToLocal(bone.getWorldPosition(new Vector3())))
  parent.attach(socket)
  const pivot = new Group()
  socket.add(pivot)
  const originalSpace = new Group()
  parent.add(originalSpace)
  pivot.attach(originalSpace)
  originalSpace.add(bone)
  return pivot
}

/** The welded copy of his shape the ink is drawn from, keeping what skins it (the weights are the same on both sides of
 *  a texture seam, so the seam's twin vertices weld). Pieces the model marks `_ink` 0 (his eyes, lashes and brows:
 *  small domes sunk into his face, whose ink came out as a broken line) are left out; their rims are painted. */
function hullOf(geometry: BufferGeometry) {
  const g = geometry.clone()
  const ink = g.getAttribute('_ink')
  const index = g.getIndex()
  if (ink && index) {
    const keep: number[] = []
    for (let i = 0; i < index.count; i += 3) {
      const [a, b, c] = [index.getX(i), index.getX(i + 1), index.getX(i + 2)]
      if (ink.getX(a) + ink.getX(b) + ink.getX(c) > 0) keep.push(a, b, c)
    }
    g.setIndex(keep)
  }
  for (const name of Object.keys(g.attributes)) if (!['position', 'skinIndex', 'skinWeight'].includes(name)) g.deleteAttribute(name)
  const welded = mergeVertices(g, 1e-4)
  g.dispose()
  welded.computeVertexNormals()
  return welded
}

const outlines = new Map<number, ShaderMaterial>()
/** engine3d/outline.ts's ink with three.js's skinning chunks in front (it shares that material's uniforms, so the
 *  Outline slider and the canvas size still reach it). */
function skinnedOutline(px: number) {
  let m = outlines.get(px)
  if (!m) {
    const base = outlineMaterial(px)
    m = new ShaderMaterial({
      uniforms: base.uniforms,
      vertexShader: /* glsl */ `
        #include <common>
        #include <skinning_pars_vertex>
        #include <fog_pars_vertex>
        uniform vec2 uRes;
        uniform float uPx;
        uniform float uScale;
        uniform float uBias;
        void main() {
          #include <skinbase_vertex>
          #include <beginnormal_vertex>
          #include <skinnormal_vertex>
          #include <begin_vertex>
          #include <skinning_vertex>
          vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
          mvPosition.xyz -= normalize(mvPosition.xyz) * uBias;
          vec4 clip = projectionMatrix * mvPosition;
          vec3 n = normalMatrix * objectNormal;
          vec2 dir = (projectionMatrix * vec4(n, 0.0)).xy;
          float len = length(dir);
          dir = len > 1e-5 ? dir / len : vec2(0.0);
          float w = uPx * uScale * clamp(14.0 / max(clip.w, 1.0), 0.55, 1.0);
          clip.xy += dir * w * 2.0 / uRes * clip.w;
          gl_Position = clip;
          #include <fog_vertex>
        }
      `,
      fragmentShader: base.fragmentShader,
      side: base.side,
      fog: true,
    })
    outlines.set(px, m)
  }
  return m
}

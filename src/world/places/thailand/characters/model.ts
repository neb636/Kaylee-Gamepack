// Kaylee as a modelled vinyl toy (docs/3d-characters.md): a Tripo3D mesh split in Blender into the same pivots the
// code-built toys have (body, head at the neck, arms at the shoulders, tail at its root, eyes), so every walk, wave,
// pose and outfit in avatar.ts works on it unchanged. The model's own texture is lit with the shared toon bands and
// every piece gets the usual ink outline.
//
// The GLB loads once (loadKayleeModel) and every Kaylee after that clones it. Until it has loaded, kayleeModel() is
// null and callers build the code-built Kaylee instead.
import { Group, Mesh, MeshToonMaterial, type BufferGeometry, type Object3D, type Texture } from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { Bag } from '../engine/dispose'
import { blobShadow, P, solid } from '../engine/geo'
import { hullGeometry, outlineMaterial } from '../engine/outline'
import { toonGradient } from '../engine/toon'
import type { Rig } from './animal'
import url from './models/kaylee.glb?url'

/** The cream around her painted eyes: the lids that sweep down over them when she blinks. */
const LID = '#F6E2DF'
/** Her ink width in pixels: under half the code-built toys' 3 (Dad's pick in the lab, 0.45), so the line stays a
 *  fine edge on the scanned shape instead of tracing every crease where her hair and sleeves meet. */
const PX = 1.35
/** How far each arm's swing plane turns forward (radians; see buildModelRig). */
const ARM_TILT = 2.0
/** Meters the face's smoothed hull stands off the surface (smoothHull). */
const HULL_LIFT = 0.004
/** Where the arms were cut off the body in Blender (|x|, meters; docs/3d-characters.md step 2). */
const SHOULDER_CUT = 0.105
/** Meters the ink is drawn nearer the camera than the hull really is (outlineMaterial's bias). */
const HULL_BIAS = 0.007

let model: GLTF | null = null
let loading: Promise<GLTF> | null = null

/** The loaded model, or null while it's still on its way. */
export const kayleeModel = () => model

export function loadKayleeModel(): Promise<GLTF> {
  loading ??= new GLTFLoader().loadAsync(url).then((g) => (model = g))
  return loading
}

const materials = new Map<Texture, MeshToonMaterial>()
/** One toon material per texture, shared by every Kaylee (like toon.ts's palette materials). */
function toonFor(map: Texture) {
  let m = materials.get(map)
  if (!m) {
    m = new MeshToonMaterial({ map, gradientMap: toonGradient() })
    materials.set(map, m)
  }
  return m
}

/** The outline hull for a scanned-looking mesh: outline.ts's welded copy, smoothed (Taubin: a shrink step and a
 *  slightly bigger grow step, so it keeps its size). The ink then follows the shape instead of every low-poly zigzag
 *  on the hair tips and bangs, and its normals stop pointing every which way in tight creases. */
function smoothHull(geometry: BufferGeometry, rounds = 6, lift = 0) {
  const g = hullGeometry(geometry)
  const pos = g.attributes.position.array as Float32Array
  const original = pos.slice()
  const idx = g.index!.array
  const n = pos.length / 3
  const near: Set<number>[] = Array.from({ length: n }, () => new Set())
  for (let i = 0; i < idx.length; i += 3) {
    const [a, b, c] = [idx[i], idx[i + 1], idx[i + 2]]
    near[a].add(b).add(c)
    near[b].add(a).add(c)
    near[c].add(a).add(b)
  }
  const next = new Float32Array(pos.length)
  for (let r = 0; r < rounds * 2; r++) {
    const k = r % 2 ? -0.53 : 0.5
    for (let v = 0; v < n; v++) {
      let x = 0
      let y = 0
      let z = 0
      for (const u of near[v]) {
        x += pos[u * 3]
        y += pos[u * 3 + 1]
        z += pos[u * 3 + 2]
      }
      const m = near[v].size || 1
      next[v * 3] = pos[v * 3] + k * (x / m - pos[v * 3])
      next[v * 3 + 1] = pos[v * 3 + 1] + k * (y / m - pos[v * 3 + 1])
      next[v * 3 + 2] = pos[v * 3 + 2] + k * (z / m - pos[v * 3 + 2])
    }
    pos.set(next)
  }
  g.computeVertexNormals()
  if (lift) {
    // Smoothing sinks the hull into the surface at bumps and tips (and the ink with it): stand it back off. The face
    // wants that: its sculpted dimples and eye sockets stay ink-free.
    const nor = g.attributes.normal.array as Float32Array
    for (let i = 0; i < pos.length; i++) pos[i] += nor[i] * lift
  } else {
    // Everything else keeps the smoothed normals but goes back on the real surface: the line hugs the shape (no gap
    // under the bangs, where a smoothed hull sags below them) and is pushed out along directions that don't zigzag.
    pos.set(original)
  }
  // No ink on the flat caps where the arms were cut off: at rest the sleeve reads as one piece, and a raised arm shows
  // the shoulder without a line across it.
  const onCut = (v: number) => {
    const [x, y] = [original[v * 3], original[v * 3 + 1]]
    return Math.abs(Math.abs(x) - SHOULDER_CUT) < 0.002 && y > 0.34 && y < 0.46
  }
  const kept: number[] = []
  for (let i = 0; i < idx.length; i += 3) {
    if (!(onCut(idx[i]) && onCut(idx[i + 1]) && onCut(idx[i + 2]))) kept.push(idx[i], idx[i + 1], idx[i + 2])
  }
  g.setIndex(kept)
  return g
}

/** A rig like buildAnimal's, from the model. */
export function buildModelRig(gltf: GLTF, bag: Bag): Rig {
  const scene = gltf.scene.clone(true)
  const node = (name: string): Group => {
    const n = scene.getObjectByName(name)
    if (!n) throw new Error(`kaylee.glb has no ${name}`)
    return n as Group
  }
  const meshes: Mesh[] = []
  scene.traverse((o: Object3D) => {
    if (o instanceof Mesh) meshes.push(o)
  })
  for (const m of meshes) {
    const map = (m.material as { map?: Texture | null }).map
    if (map) m.material = toonFor(map)
    // The eye domes are glossy pieces sitting in the face: no ink ring around them.
    if (!m.name.startsWith('eye')) {
      // The hair's line is drawn a little nearer, so the bangs keep their line where they rest on the forehead (only
      // the hair: on the face it would bring ink up through the creases around the nose and eyes).
      const bias = m.name.startsWith('hair') ? HULL_BIAS : 0
      // The face gets extra rounds and stands off: the sculpted mouth's dimples otherwise poke ink ticks through.
      const shape = m.name.startsWith('face') ? smoothHull(m.geometry, 18, HULL_LIFT) : smoothHull(m.geometry)
      const hull = new Mesh(bag.add(shape), outlineMaterial(PX, undefined, bias))
      hull.userData.hull = PX
      hull.userData.hullBias = bias
      m.add(hull)
    }
  }

  const root = new Group()
  const [body, head, eyes, armL, armR, tail] = ['body', 'head', 'eyes', 'armL', 'armR', 'tail'].map(node)
  root.add(blobShadow(0.26, bag), body)
  // Her hair is as wide as her reach, so an arm raised the code-built way (rotation.z, out to the side) ends up inside
  // it. Each arm swings in a plane turned forward instead: a tilted frame around the pivot and the opposite turn inside
  // it, so the rest pose is unchanged and a raised hoof comes up in front of her.
  for (const [arm, s] of [[armL, -1], [armR, 1]] as const) {
    const tilt = new Group()
    tilt.position.copy(arm.position)
    tilt.rotation.y = -s * ARM_TILT
    arm.parent!.add(tilt)
    arm.position.set(0, 0, 0)
    tilt.add(arm)
    const inner = new Group()
    inner.rotation.y = s * ARM_TILT
    inner.add(...arm.children)
    arm.add(inner)
  }

  // FaceLife squashes `eyes.scale.y` to blink, which works for drawn eyes but not for domes over a painted eye (the
  // painted one shows through). Here a cream lid grows down from above each eye instead, as far as the eyes "close".
  const lids: Group[] = []
  for (const s of [-1, 1]) {
    const lid = new Group()
    lid.position.set(s * 0.109, 0.047, 0.006)
    lid.add(solid(P.sphere(0.058, LID, { at: [0, -0.05, 0], scale: [1, 0.95, 0.6] }), bag, PX))
    lid.scale.y = 0.001
    lid.visible = false
    lids.push(lid)
  }
  // The lids ride on the head (not inside `eyes`, which the blink squashes).
  const lidHolder = new Group()
  lidHolder.position.copy(eyes.position)
  lidHolder.add(...lids)
  head.add(lidHolder)

  const mouth = new Group()
  const talk = new Group()
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
    mane: null,
    height: 1,
    radius: 0.16,
    phone: null,
    face: { R: 0.24, headY: 0.22, mouth: [0, 0.1, 0.23] },
    blink(open: number) {
      eyes.scale.y = 1
      const shut = (1 - open) / 0.9
      for (const lid of lids) {
        lid.visible = shut > 0.02
        lid.scale.y = Math.max(0.001, shut)
      }
    },
  }
}

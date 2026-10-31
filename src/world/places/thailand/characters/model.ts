// Kaylee as a modelled vinyl toy (docs/3d-characters.md): a Tripo3D mesh split in Blender into the same pivots the
// code-built toys have (body, head at the neck, arms at the shoulders, tail at its root, eyes), plus a leg at each hip,
// so every walk, wave and pose in avatar.ts works on it. What she wears is fitted to her shape (model-wear.ts). The model's own texture is lit with the shared toon bands and
// every piece gets the usual ink outline.
//
// She is the game's Kaylee: Place.tsx waits for the GLB (kayleeReady) before any Thailand scene builds, and every
// Kaylee after that clones it. If it can't load, kayleeModel() stays null and the code-built Kaylee stands in.
import { Group, Mesh, MeshToonMaterial, Vector3, Vector4, type BufferGeometry, type Object3D, type Texture } from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { Bag } from '../../../engine3d/dispose'
import { blobShadow, P, solid } from '../../../engine3d/geo'
import { hullGeometry, outlineMaterial } from '../../../engine3d/outline'
import { toonGradient } from '../../../engine3d/toon'
import type { Rig } from '../../../engine3d/characters/animal'
import { buildClosetItem } from './closet'
import { along, HOOF, modelWardrobe, onTunic } from './model-wear'
import { DEFAULT_PAINT, PAINTS, type PaintColor, type PaintPart } from './style'
import url from './models/kaylee.glb?url'

/** The cream around her painted eyes: the lids that sweep down over them when she blinks. */
const LID = '#F6E2DF'
/** Her ink width before TUNE.outline (0.75): 1.35 px on screen, under half the code-built toys' line (Dad's pick in the
 *  lab, 0.45 of 3 px), so it stays a fine edge on the scanned shape instead of tracing every crease where her hair and
 *  sleeves meet. */
const PX = 1.8
/** How far each arm's swing plane turns forward (radians; see buildModelRig). */
const ARM_TILT = 2.0
/** Meters the face's smoothed hull stands off the surface (smoothHull). */
const HULL_LIFT = 0.004
/** How much bigger she stands than the 1 m model (Dad, 2026-10-25: she looked small next to the family). Everything
 *  on her (outfits, socks, what she holds) is inside the scaled root, so it grows with her. */
export const KAYLEE_SIZE = 1.25
/** Where the arms were cut off the body in Blender (|x|, meters; docs/3d-characters.md step 2). */
const SHOULDER_CUT = 0.105
/** And the legs, under the skirt (y). */
const HIP_CUT = 0.17
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

let ready: Promise<GLTF | null> | null = null
/** Resolves once she's loaded, or with null if she couldn't be (never rejects: the code-built Kaylee stands in). */
export function kayleeReady(): Promise<GLTF | null> {
  ready ??= loadKayleeModel().catch((e) => {
    console.warn('kaylee.glb could not be loaded, using the code-built Kaylee.', e)
    return null
  })
  return ready
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

// ---------------------------------------------------------------- painting her (the wardrobe's paint pots)
//
// Her colors are painted into the model's one texture (a 1k JPEG atlas), so a pot of paint can't just set a material
// color. Instead each texel is recolored in the toon shader, per mesh group and per hue band (measured on kaylee.glb):
// the dress is the pink band (~322°) on the body and the sleeves only, so the pink streaks in her hair and the insides of
// her ears stay pink; the hair is the brown band (~22°, darker than 0.55, so her gold horn stays gold) on the hair, the
// braids and the tail; the fur is the lilac band (~272°) on the face, arms, legs, ears and the body (her neck). Each
// texel keeps its own lightness and saturation relative to the band's, so the shading painted into the texture stays,
// and the band's edge is soft (the JPEG blends colors where they meet).

interface Band {
  /** Hue center and half-width (degrees). */
  hue: number
  width: number
  /** The band's typical saturation and lightness (the texel's own are kept relative to these). */
  s: number
  l: number
  /** Only texels this light (0..1): keeps the gold horn out of the brown hair. */
  lmin: number
  lmax: number
}
export const BANDS: Record<PaintPart, Band> = {
  fur: { hue: 272, width: 30, s: 0.61, l: 0.71, lmin: 0.25, lmax: 0.93 },
  dress: { hue: 322, width: 24, s: 0.84, l: 0.74, lmin: 0.4, lmax: 0.95 },
  hair: { hue: 22, width: 30, s: 0.53, l: 0.28, lmin: 0, lmax: 0.55 },
}
/** Which bands each of her meshes takes (by name). The eyes take none. */
export function bandsOf(mesh: string): PaintPart[] {
  if (/^(hair|tail|braid)/.test(mesh)) return ['hair']
  if (/^(body|arm)/.test(mesh)) return ['fur', 'dress']
  if (/^(face|leg|ear)/.test(mesh)) return ['fur']
  return []
}

const RECOLOR_GLSL = /* glsl */ `
uniform vec3 kBand[3];
uniform vec4 kRef[3];
uniform vec3 kTo[3];
vec3 kRgb2Hsl(vec3 c) {
  float mx = max(c.r, max(c.g, c.b));
  float mn = min(c.r, min(c.g, c.b));
  float l = (mx + mn) * 0.5;
  float d = mx - mn;
  if (d < 1e-5) return vec3(0.0, 0.0, l);
  float s = l > 0.5 ? d / (2.0 - mx - mn) : d / (mx + mn);
  float h = mx == c.r ? (c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0) : mx == c.g ? (c.b - c.r) / d + 2.0 : (c.r - c.g) / d + 4.0;
  return vec3(h / 6.0, s, l);
}
float kHue(float p, float q, float t) {
  t = fract(t);
  if (t < 1.0 / 6.0) return p + (q - p) * 6.0 * t;
  if (t < 0.5) return q;
  if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
  return p;
}
vec3 kHsl2Rgb(vec3 h) {
  if (h.y < 1e-5) return vec3(h.z);
  float q = h.z < 0.5 ? h.z * (1.0 + h.y) : h.z + h.y - h.z * h.y;
  float p = 2.0 * h.z - q;
  return vec3(kHue(p, q, h.x + 1.0 / 3.0), kHue(p, q, h.x), kHue(p, q, h.x - 1.0 / 3.0));
}
vec3 kRecolor(vec3 lin) {
  vec3 c = pow(max(lin, vec3(0.0)), vec3(1.0 / 2.2));
  vec3 hsl = kRgb2Hsl(c);
  vec3 outc = c;
  for (int i = 0; i < 3; i++) {
    if (kBand[i].x < 0.5) continue;
    float d = abs(hsl.x - kBand[i].y);
    d = min(d, 1.0 - d);
    float w = (1.0 - smoothstep(kBand[i].z * 0.55, kBand[i].z, d)) * smoothstep(0.12, 0.24, hsl.y);
    w *= smoothstep(kRef[i].z - 0.06, kRef[i].z, hsl.z) * (1.0 - smoothstep(kRef[i].w, kRef[i].w + 0.06, hsl.z));
    vec3 to = vec3(kTo[i].x, clamp(kTo[i].y * hsl.y / kRef[i].x, 0.0, 1.0), clamp(kTo[i].z + (hsl.z - kRef[i].y), 0.03, 0.97));
    outc = mix(outc, kHsl2Rgb(to), w);
  }
  return pow(outc, vec3(2.2));
}
`

const painted = new Map<string, MeshToonMaterial>()
/** The toon material for a mesh taking `parts` in these colors: the shared plain one while they're all her own, else a
 *  recoloring one (shared by every Kaylee painted the same; one shader program for all of them). */
export function paintedToon(map: Texture, parts: PaintPart[], colors: Record<PaintPart, PaintColor>): MeshToonMaterial {
  const on = parts.filter((p) => colors[p] !== DEFAULT_PAINT[p])
  if (!on.length) return toonFor(map)
  const key = `${map.uuid}|${on.map((p) => `${p}:${colors[p]}`).join(',')}`
  let m = painted.get(key)
  if (!m) {
    const band: Vector3[] = []
    const ref: Vector4[] = []
    const to: Vector3[] = []
    for (let i = 0; i < 3; i++) {
      const p = on[i]
      const b = p ? BANDS[p] : null
      const [h, s, l] = p ? PAINTS[colors[p]].hsl : [0, 0, 0]
      band.push(new Vector3(b ? 1 : 0, (b?.hue ?? 0) / 360, (b?.width ?? 0) / 360))
      ref.push(new Vector4(b?.s ?? 1, b?.l ?? 0, b?.lmin ?? 0, b?.lmax ?? 1))
      to.push(new Vector3(h / 360, s, l))
    }
    m = new MeshToonMaterial({ map, gradientMap: toonGradient() })
    m.onBeforeCompile = (shader) => {
      shader.uniforms.kBand = { value: band }
      shader.uniforms.kRef = { value: ref }
      shader.uniforms.kTo = { value: to }
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\n${RECOLOR_GLSL}`)
        .replace('#include <map_fragment>', '#include <map_fragment>\n\tdiffuseColor.rgb = kRecolor(diffuseColor.rgb);')
    }
    m.customProgramCacheKey = () => 'kaylee-recolor'
    painted.set(key, m)
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
  // No ink on the flat caps where the arms and legs were cut off: at rest the sleeve reads as one piece, and a raised
  // arm shows the shoulder (a leg out in front, the hip) without a line across it.
  const onCut = (v: number) => {
    const [x, y] = [original[v * 3], original[v * 3 + 1]]
    return (Math.abs(Math.abs(x) - SHOULDER_CUT) < 0.002 && y > 0.34 && y < 0.46) || Math.abs(y - HIP_CUT) < 0.001
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
    if (map) {
      m.material = toonFor(map)
      m.userData.map = map
    }
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
  const [body, head, eyes, armL, armR, tail, legL, legR] = ['body', 'head', 'eyes', 'armL', 'armR', 'tail', 'legL', 'legR'].map(node)
  root.add(blobShadow(0.26, bag), body)
  root.scale.setScalar(KAYLEE_SIZE)
  // Her hair is as wide as her reach, so an arm raised the code-built way (rotation.z, out to the side) ends up inside
  // it. Each arm swings in a plane turned forward instead: a tilted frame around the pivot and the opposite turn inside
  // it, so the rest pose is unchanged and a raised hoof comes up in front of her.
  // A held thing goes in a group at each hoof, inside that turn back (so it's turned like her body at rest).
  const hands: Group[] = []
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
    const hand = new Group()
    hand.position.set(...along(s, HOOF))
    inner.add(hand)
    hands.push(hand)
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
    legL,
    legR,
    mane: null,
    height: KAYLEE_SIZE,
    radius: 0.16 * KAYLEE_SIZE,
    // Her hair reaches 0.34 m behind her neck and her heels 0.03 m behind her feet: lying, she tips up ~27° so both
    // touch, her head on the hair like a pillow.
    lie: { lift: 0.06, tilt: 0.46 },
    phone: null,
    // Her face (model-wear.ts measures it): a sphere of 0.24 around her eyes, the painted smile under them.
    face: { R: 0.24, headY: 0.148, mouth: [0, 0.06, 0.21] },
    wardrobe: modelWardrobe(ARM_TILT),
    closet: (id, b) => buildClosetItem(id, b, ARM_TILT),
    paint(colors) {
      for (const m of meshes) {
        const map = m.userData.map as Texture | undefined
        if (map) m.material = paintedToon(map, bandsOf(m.name), colors)
      }
    },
    hands: [hands[0], hands[1]],
    // Round the dress at 0.29 m, where it narrows above the skirt (model-wear.ts's tunic, less its few mm).
    waist: { y: 0.29, z: 0.045, rx: 0.155, rz: 0.14 },
    front: (x, y) => onTunic(x, y) - 0.006,
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

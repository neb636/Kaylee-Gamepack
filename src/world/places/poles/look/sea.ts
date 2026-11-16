// The polar sea: the toon water of engine3d/water.ts grown up for the Poles (as Koh Samet's lagoon.ts did for the
// tropics). Deep sapphire with lighter patches drifting through it, a soft painted web of ripples catching the light,
// the sky's horizon mirrored at a low angle, a glittering path under the low sun, cloud shade drifting over it, and haze
// toward the horizon. It rises and falls with engine3d/water.ts `swell()`, exactly, so everything that already bobs on
// that swell (floes, animals, Nari) rides the very waves she sees.
//
// Seen from under the water (the Narwhal Ride under the ice, Papa's dive) its underside is the bright, rippling
// ceiling of the sea.
//
// The ice glows: `skirt()` is a soft turquoise ring round the outline of anything floating (a floe, an iceberg), the ice
// under the water showing through it, with white foam lapping at the edge. It sits on the water's surface wherever its
// owner moves (its height comes from the same swell), so a floe that drifts or tips takes its glow along.
//
// Two meshes share the sea's material, as in lagoon.ts: a fine grid round the action (it follows `update`'s center,
// snapped to its cells) and a flat sheet with a matching hole out to the horizon; the swell fades out before the grid's
// edge, so the two meet.
import { BufferAttribute, BufferGeometry, Color, DoubleSide, UniformsLib, FrontSide, Mesh, Path, PlaneGeometry, ShaderMaterial, Shape, ShapeGeometry, Vector2, Vector3, type ColorRepresentation } from 'three'
import type { Bag } from '../../../engine3d/dispose'
import { CLOUD_GLSL, POLAR } from './look'

const SWELL_GLSL = /* glsl */ `
  float swellAt(vec2 p, float t) {
    return 0.05 * sin(p.x * 0.21 + t * 1.3) + 0.04 * sin(p.y * 0.17 - t * 1.1) + 0.02 * sin((p.x - p.y) * 0.5 + t * 2.1);
  }
  vec2 swellSlope(vec2 p, float t) {
    float c3 = 0.01 * cos((p.x - p.y) * 0.5 + t * 2.1);
    return vec2(0.0105 * cos(p.x * 0.21 + t * 1.3) + c3, 0.0068 * cos(p.y * 0.17 - t * 1.1) - c3);
  }
`

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uLevel;
  uniform vec2 uCenter;
  uniform vec2 uFade;
  varying vec3 vWorld;
  varying float vFade;
  ${SWELL_GLSL}
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vFade = 1.0 - smoothstep(uFade.x, uFade.y, max(abs(w.x - uCenter.x), abs(w.z - uCenter.y)));
    w.y = uLevel + swellAt(w.xz, uTime) * vFade;
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uDeep;
  uniform vec3 uMid;
  uniform vec3 uSheen;
  uniform vec3 uSky;
  uniform vec3 uHaze;
  uniform vec3 uGlow;
  uniform vec3 uUnder;
  uniform vec3 uSunDir;
  uniform float uHazeNear;
  uniform float uHazeFar;
  // (The scene's own fog: under the water it is the deep blue that ends the view.)
  uniform vec3 fogColor;
  uniform float fogNear;
  uniform float fogFar;
  varying vec3 vWorld;
  varying float vFade;
  ${CLOUD_GLSL}
  ${SWELL_GLSL}
  void main() {
    vec2 p = vWorld.xz;
    float t = uTime;
    float dist = distance(cameraPosition.xz, p);
    float near = 1.0 - smoothstep(14.0, 70.0, dist);
    // The painted ripple web: soft bright lines where little waves catch the light (Samet's caustics, gentler).
    float a = sin(p.x * 0.55 + sin(p.y * 0.42 + t * 0.55) * 1.6 + t * 0.4);
    float b = sin(p.y * 0.5 + sin(p.x * 0.37 - t * 0.5) * 1.6 - t * 0.35);
    float web = pow(1.0 - abs(a * b), 8.0);
    float a2 = sin(p.x * 1.3 + sin(p.y * 1.1 - t * 0.9) * 1.3 - t * 0.7);
    float b2 = sin(p.y * 1.2 + sin(p.x * 0.9 + t * 0.8) * 1.3 + t * 0.6);
    float fine = pow(1.0 - abs(a2 * b2), 10.0);
    if (!gl_FrontFacing) {
      // From under the water: the bright rippling ceiling of the sea.
      vec3 c = mix(uUnder, vec3(1.0), (web * 0.5 + fine * 0.3));
      c = mix(c, fogColor, smoothstep(fogNear, fogFar, distance(cameraPosition, vWorld)));
      gl_FragColor = vec4(c, 1.0);
      #include <colorspace_fragment>
      return;
    }
    // Two blues in big soft patches drifting slowly (the light through deep water).
    float blot = polarNoise(p * 0.028 + vec2(t * 0.01, -t * 0.008)) * 0.7 + polarNoise(p * 0.07 - vec2(t * 0.02, 0.0)) * 0.3;
    vec3 col = mix(uDeep, uMid, smoothstep(0.38, 0.7, blot));
    col = mix(col, uSheen, web * 0.34 * near + fine * 0.22 * (1.0 - smoothstep(6.0, 30.0, dist)));
    // The swell's faces: toward the light a touch lighter, away a touch deeper.
    vec2 sl = swellSlope(p, t) * vFade;
    vec3 n = normalize(vec3(-sl.x * 6.0 + (a2 * 0.04), 1.0, -sl.y * 6.0 + (b2 * 0.04)));
    col *= 0.94 + 0.12 * smoothstep(-0.05, 0.05, dot(n.xz, normalize(uSunDir.xz + vec2(0.0001))));
    // The sky's horizon mirrored at a low angle.
    vec3 v = normalize(cameraPosition - vWorld);
    float fres = pow(1.0 - clamp(v.y, 0.0, 1.0), 5.0);
    col = mix(col, uSky, fres * 0.6);
    // The glitter path: little stars on the water toward the low sun, each winking on and off.
    vec3 r = reflect(-v, n);
    float s = max(0.0, dot(r, normalize(uSunDir)));
    col = mix(col, uGlow, smoothstep(0.93, 1.0, s) * 0.35);
    vec2 q = p * vec2(1.6, 2.4);
    vec2 cell = floor(q);
    float h = polarHash(cell);
    vec2 f = fract(q) - 0.5;
    float spark = step(0.55, h) * smoothstep(0.16, 0.0, length(f * vec2(1.0, 1.6))) * max(0.0, sin(t * (2.0 + h * 4.0) + h * 40.0));
    col = mix(col, vec3(1.0), spark * smoothstep(0.975, 0.997, s) * near);
    // Cloud shade drifting across the water as across the ice.
    col = mix(col, col * vec3(0.84, 0.85, 0.97), polarCloud(p) * uShade * 0.6);
    // Haze toward the horizon (solid there, so it meets the sky).
    col = mix(col, uHaze, smoothstep(uHazeNear, uHazeFar, dist));
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

export interface SeaColors {
  deep: ColorRepresentation
  mid: ColorRepresentation
  /** The ripples' light. */
  sheen: ColorRepresentation
  /** The sky near the horizon (mirrored at a low angle). */
  sky: ColorRepresentation
  haze: ColorRepresentation
  /** The sun's glow on the water. */
  glow: ColorRepresentation
  /** The ice's glow under the water (skirts). */
  ice: ColorRepresentation
  /** The sea's ceiling seen from under it. */
  under: ColorRepresentation
}

export const SEA = {
  day: { deep: '#1B67B6', mid: '#2A86D2', sheen: '#9BE3F7', sky: '#D6ECFB', haze: '#DCEEFB', glow: '#FFF6DA', ice: '#6FE0EE', under: '#BDF0FF' },
  south: { deep: '#1C5FAE', mid: '#2C7FCB', sheen: '#9ADDF5', sky: '#DCE8FA', haze: '#E2ECFA', glow: '#FFF6E2', ice: '#6FDCEC', under: '#BDF0FF' },
  dusk: { deep: '#2B4C9C', mid: '#4D6DBA', sheen: '#F0C2DC', sky: '#E6B9CF', haze: '#D9C3DE', glow: '#FFD7B0', ice: '#86D6EC', under: '#B9D8FF' },
  night: { deep: '#1A2462', mid: '#283A84', sheen: '#7F8FE0', sky: '#4A4590', haze: '#3E3C7E', glow: '#CFD6FF', ice: '#5AA6D8', under: '#6A88D8' },
} satisfies Record<string, SeaColors>

export interface SeaOpts {
  colors?: SeaColors
  /** The water's height (m). */
  level?: number
  hazeNear?: number
  hazeFar?: number
  /** The fine grid's size and cell (m). */
  grid?: number
  cell?: number
}

export class PolarSea {
  readonly near: Mesh
  readonly far: Mesh
  private mat: ShaderMaterial
  private cell: number
  private skirtMats: ShaderMaterial[] = []

  constructor(o: SeaOpts, bag: Bag) {
    const grid = o.grid ?? 160
    const cell = (this.cell = o.cell ?? 2)
    const c = o.colors ?? SEA.day
    const col = (x: ColorRepresentation) => ({ value: new Color(x) })
    this.mat = bag.add(
      new ShaderMaterial({
        uniforms: {
          ...UniformsLib.fog,
          ...POLAR,
          uLevel: { value: o.level ?? 0 },
          uCenter: { value: new Vector2() },
          uFade: { value: new Vector2(grid * 0.5 - 24, grid * 0.5 - 6) },
          uDeep: col(c.deep),
          uMid: col(c.mid),
          uSheen: col(c.sheen),
          uSky: col(c.sky),
          uHaze: col(c.haze),
          uGlow: col(c.glow),
          uUnder: col(c.under),
          uSunDir: { value: new Vector3(-0.4, 0.2, -0.9).normalize() },
          uHazeNear: { value: o.hazeNear ?? 60 },
          uHazeFar: { value: o.hazeFar ?? 220 },
        },
        vertexShader,
        fragmentShader,
        side: DoubleSide,
        fog: true,
      }),
    )
    this.ice.set(c.ice)
    const n = Math.round(grid / cell)
    this.near = new Mesh(bag.add(new PlaneGeometry(grid, grid, n, n).rotateX(-Math.PI / 2)), this.mat)
    const R = 4000
    const outer = new Shape([new Vector2(-R, -R), new Vector2(R, -R), new Vector2(R, R), new Vector2(-R, R)])
    const g = grid / 2
    outer.holes.push(new Path([new Vector2(-g, -g), new Vector2(-g, g), new Vector2(g, g), new Vector2(g, -g)]))
    this.far = new Mesh(bag.add(new ShapeGeometry(outer).rotateX(-Math.PI / 2)), this.mat)
    this.near.frustumCulled = this.far.frustumCulled = false
  }

  /** The ice's glow color (skirts made from now on, and those made already). */
  readonly ice = new Color()

  /** Both meshes (add them to the scene, or hide them together). */
  get meshes() {
    return [this.near, this.far]
  }
  set visible(v: boolean) {
    this.near.visible = this.far.visible = v
  }
  get level() {
    return this.mat.uniforms.uLevel.value as number
  }
  set level(y: number) {
    this.mat.uniforms.uLevel.value = y
    for (const m of this.skirtMats) m.uniforms.uLevel.value = y
  }

  /** Moves the fine grid to follow the action (snapped to its cells), and turns the glitter toward the sun. */
  update(x: number, z: number, sun?: Vector3) {
    const cx = Math.round(x / this.cell) * this.cell
    const cz = Math.round(z / this.cell) * this.cell
    this.near.position.set(cx, 0, cz)
    this.far.position.set(cx, 0, cz)
    ;(this.mat.uniforms.uCenter.value as Vector2).set(cx, cz)
    if (sun) (this.mat.uniforms.uSunDir.value as Vector3).copy(sun)
  }

  /** New colors (the night, a sunset). */
  setColors(c: SeaColors) {
    const u = this.mat.uniforms
    ;(u.uDeep.value as Color).set(c.deep)
    ;(u.uMid.value as Color).set(c.mid)
    ;(u.uSheen.value as Color).set(c.sheen)
    ;(u.uSky.value as Color).set(c.sky)
    ;(u.uHaze.value as Color).set(c.haze)
    ;(u.uGlow.value as Color).set(c.glow)
    ;(u.uUnder.value as Color).set(c.under)
    this.ice.set(c.ice)
    for (const m of this.skirtMats) (m.uniforms.uIce.value as Color).copy(this.ice)
  }
  /** Only the haze (the sky's, as a sunrise moves it along). */
  setHaze(c: Color) {
    ;(this.mat.uniforms.uHaze.value as Color).copy(c)
  }
  setHazeRange(near: number, far: number) {
    this.mat.uniforms.uHazeNear.value = near
    this.mat.uniforms.uHazeFar.value = far
  }

  /** The skirts' material (one per sea: it shares the sea's level and ice color). */
  skirtMaterial(bag: Bag) {
    if (this.skirtMats.length) return this.skirtMats[0]
    const m = bag.add(
      new ShaderMaterial({
        uniforms: { ...POLAR, uLevel: { value: this.level }, uIce: { value: this.ice.clone() } },
        vertexShader: skirtVertex,
        fragmentShader: skirtFragment,
        transparent: true,
        depthWrite: false,
        side: FrontSide,
      }),
    )
    this.skirtMats.push(m)
    return m
  }

  /** A glow round something floating, from a skirt geometry (`skirtGeo`), to add as its child (or anywhere: it finds
   *  the water by itself). */
  skirt(geo: BufferGeometry, bag: Bag) {
    const m = new Mesh(bag.add(geo), this.skirtMaterial(bag))
    m.renderOrder = 2
    m.frustumCulled = false
    return m
  }
}

const skirtVertex = /* glsl */ `
  uniform float uTime;
  uniform float uLevel;
  attribute float edge;
  attribute float along;
  varying float vEdge;
  varying float vAlong;
  varying float vDist;
  ${SWELL_GLSL}
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    w.y = uLevel + swellAt(w.xz, uTime) + 0.015;
    vEdge = edge;
    vAlong = along;
    vDist = distance(cameraPosition, w.xyz);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`
const skirtFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uIce;
  varying float vEdge;
  varying float vAlong;
  varying float vDist;
  void main() {
    // The ice under the water: turquoise next to the floe, fading out into the deep.
    float glow = pow(1.0 - vEdge, 1.7) * 0.78;
    // Foam lapping at the edge (it breathes in and out along the outline), and a thin ring drifting out from it.
    float lap = 0.13 + 0.06 * sin(uTime * 1.7 + vAlong * 1.3) + 0.03 * sin(uTime * 2.9 - vAlong * 2.1);
    float foam = 1.0 - smoothstep(lap - 0.04, lap + 0.02, vEdge);
    float ringAt = fract(uTime * 0.18 + 0.15 * sin(vAlong * 0.7));
    float ring = smoothstep(0.035, 0.0, abs(vEdge - 0.1 - ringAt * 0.6)) * (1.0 - ringAt) * 0.55;
    float w = max(foam, ring);
    vec3 col = mix(uIce, vec3(1.0), w);
    float a = max(glow, w * 0.92) * (1.0 - smoothstep(70.0, 170.0, vDist));
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`

/**
 * A skirt round an outline ([x, z] points, in order round it, in its owner's own coordinates): a ring strip from just
 * inside the outline out to `width` meters beyond it, with how far out each corner is (`edge`, 0 at the ice) and how
 * far along the outline (`along`, meters) for the foam to lap by.
 */
export function skirtGeo(outline: [number, number][], width: number) {
  const n = outline.length
  // Each corner's outward direction: the average of its two edges' outward normals.
  let cx = 0
  let cz = 0
  for (const [x, z] of outline) {
    cx += x / n
    cz += z / n
  }
  const pos: number[] = []
  const edge: number[] = []
  const along: number[] = []
  let run = 0
  for (let i = 0; i <= n; i++) {
    const [x, z] = outline[i % n]
    const [px, pz] = outline[(i - 1 + n) % n]
    const [nx, nz] = outline[(i + 1) % n]
    let ox = x - cx
    let oz = z - cz
    const ol = Math.hypot(ox, oz) || 1
    // (Pointing away from the middle, bent toward the edge normals so a long side stays even.)
    const ex = nz - pz
    const ez = -(nx - px)
    const el = Math.hypot(ex, ez) || 1
    const dot = (ex / el) * (ox / ol) + (ez / el) * (oz / ol)
    const s = dot < 0 ? -1 : 1
    ox = (ox / ol) * 0.4 + ((s * ex) / el) * 0.6
    oz = (oz / ol) * 0.4 + ((s * ez) / el) * 0.6
    const l = Math.hypot(ox, oz) || 1
    ox /= l
    oz /= l
    if (i > 0) run += Math.hypot(x - px, z - pz)
    pos.push(x - ox * 0.06, 0, z - oz * 0.06, x + ox * width, 0, z + oz * width)
    edge.push(0, 1)
    along.push(run, run)
  }
  const index: number[] = []
  for (let i = 0; i < n; i++) {
    const a = i * 2
    // (Wound to face up.)
    index.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  g.setAttribute('edge', new BufferAttribute(new Float32Array(edge), 1))
  g.setAttribute('along', new BufferAttribute(new Float32Array(along), 1))
  g.setIndex(index)
  // (Make sure it faces up whichever way the outline ran.)
  const p = g.attributes.position
  const ax = p.getX(2) - p.getX(0)
  const az = p.getZ(2) - p.getZ(0)
  const bx = p.getX(1) - p.getX(0)
  const bz = p.getZ(1) - p.getZ(0)
  if (az * bx - ax * bz < 0) {
    for (let i = 0; i < index.length; i += 3) [index[i + 1], index[i + 2]] = [index[i + 2], index[i + 1]]
    g.setIndex(index)
  }
  return g
}

/** A round skirt (an iceberg's), `r` meters across its waterline. */
export function roundSkirt(r: number, width: number, seg = 28, squash = 1) {
  const pts: [number, number][] = []
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * Math.PI * 2
    pts.push([Math.cos(a) * r, Math.sin(a) * r * squash])
  }
  return skirtGeo(pts, width)
}

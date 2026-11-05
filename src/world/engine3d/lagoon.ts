// Tropical water for an island (Koh Samet's bays): the toon water of water.ts grown up, as its own opt-in class so the
// bay, the boat race and Canada's seas stay exactly as they are.
//
// - Depth colors in soft flat bands, from the sea texture a Terrain bakes (terrain.ts): see-through mint over the sand
//   at the water's edge, turquoise, teal, then deep blue past the buoys.
// - Shore foam: a swash line that slides up the sand and back, and thin foam bands following the shoreline.
// - Real swell in the vertex shader, matching lagoonHeight() exactly, so the jet ski rides (and jumps) the very waves
//   she sees: a gentle chop everywhere, and rolling waves (`waves`) that come in from the open sea in a direction, with
//   lighter crests, white caps on the big ones, and that die away as they reach the sand.
// - Haze toward the horizon in the scene's fog color, and white sun glints that stream past at speed.
//
// Two meshes share one material: a fine grid around the action (it follows `center`, snapped to its own cells so the
// water never swims) and a flat sheet with a matching square hole out to the horizon. The waves fade out before the
// grid's edge, so the two always meet. One draw call each.
//
// Opt-in, for a scene that needs them (Koh Samet's sandcastle): `tide` lifts the whole sea (the shallows and the swash
// creep up the beach with it), and `setCut()` leaves a box out (a finer water of the scene's own fills it in, so dug
// sand above the sea's level stays dry until a channel lets the water through).
import { Color, Mesh, PlaneGeometry, Shape, ShapeGeometry, Path, ShaderMaterial, Vector2, Vector4, type ColorRepresentation, type Texture } from 'three'
import type { Bag } from './dispose'

export interface LagoonOpts {
  /** The terrain's sea texture and where it lies (terrain.ts: Terrain.sea, Terrain.seaBox). */
  sea: Texture
  seaBox: { x0: number; z0: number; w: number; d: number }
  /** The depth bands, shallow to deep, and the depths (m) where each next band begins. */
  bands: [ColorRepresentation, ColorRepresentation, ColorRepresentation, ColorRepresentation, ColorRepresentation]
  steps: [number, number, number, number]
  haze: ColorRepresentation
  hazeNear: number
  hazeFar: number
  /** The fine grid's size and cell (m). */
  grid?: number
  cell?: number
  /** Ripples of light over the sand in the shallows (0 = none, 1 = bright). */
  caustics?: number
}

/** The waves right now (lagoon.ts and whoever rides them read the same numbers). */
export interface Waves {
  /** Height of the rolling waves' crests (m): 0 = only the gentle chop. */
  height: number
  /** Crest to crest (m). */
  length: number
  /** How fast they roll in (m/s). */
  speed: number
  /** Which way they roll (unit, on the ground plane). */
  dir: { x: number; z: number }
  /** The gentle chop's size (1 = water.ts's swell). */
  chop: number
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform sampler2D uSea;
  uniform vec4 uSeaBox;
  uniform vec2 uCenter;
  uniform vec2 uFade;
  uniform vec4 uWave;   // height, length, speed, chop
  uniform vec2 uDir;
  uniform vec2 uTide;   // how high the sea is lifted (m), meters of beach it creeps up per meter
  varying vec3 vWorld;
  varying float vCrest;
  varying float vFace;
  varying vec2 vSea;

  vec2 seaAt(vec2 p) {
    vec2 uv = (p - uSeaBox.xy) / uSeaBox.zw;
    if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return vec2(12.75, 63.75);
    vec4 s = texture2D(uSea, uv);
    return vec2(s.r * 255.0 / 20.0, s.g * 255.0 / 4.0);
  }
  float crestAt(vec2 p, float t) {
    vec2 q = vec2(-uDir.y, uDir.x);
    float s = (dot(p, uDir) - uWave.z * t) / uWave.y + 0.06 * sin(dot(p, q) * 0.045);
    float c = 0.5 + 0.5 * cos(6.2831853 * s);
    return c * c * c * c;
  }
  float fadeAt(vec2 p) {
    return 1.0 - smoothstep(uFade.x, uFade.y, max(abs(p.x - uCenter.x), abs(p.y - uCenter.y)));
  }
  float heightAt(vec2 p, float t, float shore) {
    float chop = 0.05 * sin(p.x * 0.21 + t * 1.3) + 0.04 * sin(p.y * 0.17 - t * 1.1) + 0.02 * sin((p.x - p.y) * 0.5 + t * 2.1);
    float att = smoothstep(1.0, 16.0, shore);
    return fadeAt(p) * (uWave.w * chop * (0.35 + 0.65 * smoothstep(0.0, 6.0, shore)) + uWave.x * att * crestAt(p, t));
  }
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vec2 p = w.xz;
    vec2 sea = seaAt(p);
    sea += vec2(uTide.x, uTide.x * uTide.y);
    float h = heightAt(p, uTime, sea.y);
    float h2 = heightAt(p + uDir * 0.8, uTime, sea.y);
    w.y += h + uTide.x;
    vWorld = w.xyz;
    vSea = sea;
    vCrest = uWave.x > 0.01 ? crestAt(p, uTime) * smoothstep(1.0, 16.0, sea.y) * fadeAt(p) : 0.0;
    vFace = (h - h2) / 0.8;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uB0;
  uniform vec3 uB1;
  uniform vec3 uB2;
  uniform vec3 uB3;
  uniform vec3 uB4;
  uniform vec4 uSteps;
  uniform vec3 uHaze;
  uniform vec3 uFoam;
  uniform float uTime;
  uniform float uHazeNear;
  uniform float uHazeFar;
  uniform vec4 uWave;
  uniform float uCaustics;
  uniform vec4 uCut;    // a box left out: its center (x, z) and its along-axis (unit x, z)
  uniform vec2 uCutHalf; // half its size along and across (0: no box)
  varying vec3 vWorld;
  varying float vCrest;
  varying float vFace;
  varying vec2 vSea;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float band(float d, float at) { return smoothstep(at - 0.25, at + 0.25, d); }
  void main() {
    vec2 p = vWorld.xz;
    if (uCutHalf.x > 0.0) {
      vec2 dc = p - uCut.xy;
      if (abs(dot(dc, uCut.zw)) < uCutHalf.x && abs(dot(dc, vec2(-uCut.w, uCut.z))) < uCutHalf.y) discard;
    }
    float depth = vSea.x;
    float shore = vSea.y;
    // A little wobble in the band edges, so they read as water and not as contour lines.
    float wob = 0.35 * sin(p.x * 0.31 + uTime * 0.4) * sin(p.y * 0.27 - uTime * 0.3);
    float d = depth + wob;
    vec3 col = uB0;
    col = mix(col, uB1, band(d, uSteps.x));
    col = mix(col, uB2, band(d, uSteps.y));
    col = mix(col, uB3, band(d, uSteps.z));
    col = mix(col, uB4, band(d, uSteps.w));
    // Light ripples over the sand in the shallows (the sun through the little waves), fading out with depth.
    if (uCaustics > 0.0) {
      float a = sin(p.x * 1.15 + sin(p.y * 0.8 + uTime * 0.9) * 1.4 + uTime * 0.7);
      float b = sin(p.y * 1.05 + sin(p.x * 0.7 - uTime * 0.8) * 1.4 - uTime * 0.6);
      float cau = pow(1.0 - abs(a * b), 10.0);
      col = mix(col, vec3(1.0), cau * uCaustics * 0.32 * (1.0 - smoothstep(0.4, uSteps.y + 0.4, depth)) * smoothstep(0.02, 0.25, depth));
    }
    // The rolling waves: the face toward the beach a shade darker, the crest lighter, white caps on big ones.
    col = mix(col, col * 0.86, smoothstep(0.02, 0.12, vFace) * min(1.0, uWave.x));
    col = mix(col, mix(col, vec3(1.0), 0.22), smoothstep(0.6, 0.8, vCrest) * min(1.0, uWave.x * 1.4));
    // White water: a thin broken line along the top of the big crests (never blocks).
    float cap = smoothstep(0.88, 0.95, vCrest) * step(0.45, uWave.x) * step(0.1, sin(p.x * 0.8 + p.y * 0.5) + sin(p.x * 0.23 - p.y * 0.31) + 0.4);
    // The swash: a foam line that slides up the sand and back; thin foam bands following the shore behind it.
    float swash = 0.55 + 0.45 * sin(uTime * 0.9 + p.x * 0.05 + p.y * 0.04);
    float edge = 1.0 - step(swash, shore);
    float rows = step(0.86, fract(shore * 0.42 - uTime * 0.22)) * (1.0 - smoothstep(2.0, 6.5, shore)) * step(0.4, hash(floor(p * 0.5)));
    // Sun glints: little white dashes fixed to the world (going fast makes them stream past).
    vec2 q = vec2(p.x * 0.7 + uTime * 0.3, p.y * 0.9);
    vec2 cell = floor(q / vec2(3.0, 1.0));
    vec2 f = fract(q / vec2(3.0, 1.0));
    float dash = step(0.88, hash(cell)) * step(0.2, f.x) * step(f.x, 0.6) * step(0.4, f.y) * step(f.y, 0.6) * smoothstep(1.5, 4.0, depth);
    float dist = distance(cameraPosition.xz, p);
    dash *= 1.0 - smoothstep(16.0, 48.0, dist);
    float foam = max(max(edge, rows), max(cap, dash * 0.75));
    col = mix(col, uFoam, foam);
    // See-through in the shallows (the sand shows), solid out deep.
    float alpha = mix(0.55, 1.0, smoothstep(0.1, uSteps.y + 0.6, depth));
    alpha = max(alpha, foam);
    float haze = smoothstep(uHazeNear, uHazeFar, dist);
    col = mix(col, uHaze, haze);
    gl_FragColor = vec4(col, max(alpha, haze));
    #include <colorspace_fragment>
  }
`

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

export class Lagoon {
  readonly near: Mesh
  readonly far: Mesh
  readonly waves: Waves = { height: 0, length: 14, speed: 4, dir: { x: -1, z: 0 }, chop: 1 }
  /** The tide (opt-in): the sea lifted `level` meters, creeping `reach` meters up the beach per meter. */
  readonly tide = { level: 0, reach: 10 }
  private mat: ShaderMaterial
  private grid: number
  private cell: number
  private cx = 0
  private cz = 0

  constructor(o: LagoonOpts, bag: Bag) {
    const grid = (this.grid = o.grid ?? 200)
    const cell = (this.cell = o.cell ?? 1)
    const col = (c: ColorRepresentation) => ({ value: new Color(c) })
    this.mat = bag.add(
      new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uSea: { value: o.sea },
          uSeaBox: { value: new Vector4(o.seaBox.x0, o.seaBox.z0, o.seaBox.w, o.seaBox.d) },
          uCenter: { value: new Vector2() },
          uFade: { value: new Vector2(grid * 0.5 - 22, grid * 0.5 - 6) },
          uWave: { value: new Vector4(0, 14, 4, 1) },
          uDir: { value: new Vector2(-1, 0) },
          uB0: col(o.bands[0]),
          uB1: col(o.bands[1]),
          uB2: col(o.bands[2]),
          uB3: col(o.bands[3]),
          uB4: col(o.bands[4]),
          uSteps: { value: new Vector4(...o.steps) },
          uHaze: col(o.haze),
          uFoam: col('#FFFFFF'),
          uHazeNear: { value: o.hazeNear },
          uHazeFar: { value: o.hazeFar },
          uCaustics: { value: o.caustics ?? 0 },
          uTide: { value: new Vector2() },
          uCut: { value: new Vector4(0, 0, 1, 0) },
          uCutHalf: { value: new Vector2() },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
      }),
    )
    const n = Math.round(grid / cell)
    this.near = new Mesh(bag.add(new PlaneGeometry(grid, grid, n, n).rotateX(-Math.PI / 2)), this.mat)
    // The sheet out to the horizon, with the grid's square cut out of it.
    const R = 6000
    const outer = new Shape([new Vector2(-R, -R), new Vector2(R, -R), new Vector2(R, R), new Vector2(-R, R)])
    const g = grid / 2
    outer.holes.push(new Path([new Vector2(-g, -g), new Vector2(-g, g), new Vector2(g, g), new Vector2(g, -g)]))
    this.far = new Mesh(bag.add(new ShapeGeometry(outer).rotateX(-Math.PI / 2)), this.mat)
    // (Far off it's solid haze anyway; both are drawn after the land, the near grid's shallows over the sand.)
    this.near.renderOrder = this.far.renderOrder = 1
    this.near.frustumCulled = this.far.frustumCulled = false
  }

  /** Moves the fine grid to follow the action (snapped to its cells) and sets the time and the waves. */
  update(t: number, x: number, z: number) {
    const u = this.mat.uniforms
    this.cx = Math.round(x / this.cell) * this.cell
    this.cz = Math.round(z / this.cell) * this.cell
    this.near.position.set(this.cx, 0, this.cz)
    this.far.position.set(this.cx, 0, this.cz)
    u.uTime.value = t
    ;(u.uCenter.value as Vector2).set(this.cx, this.cz)
    const w = this.waves
    ;(u.uWave.value as Vector4).set(w.height, w.length, w.speed, w.chop)
    const l = Math.hypot(w.dir.x, w.dir.z) || 1
    ;(u.uDir.value as Vector2).set(w.dir.x / l, w.dir.z / l)
    ;(u.uTide.value as Vector2).set(this.tide.level, this.tide.reach)
  }

  /** Leaves a box out of the water (a scene's own finer water fills it): its center, the unit direction of its `along`
   *  side, and half its size along and across. `null` puts the water back. */
  setCut(cut: { x: number; z: number; ax: number; az: number; along: number; across: number } | null) {
    const u = this.mat.uniforms
    if (!cut) return void (u.uCutHalf.value as Vector2).set(0, 0)
    ;(u.uCut.value as Vector4).set(cut.x, cut.z, cut.ax, cut.az)
    ;(u.uCutHalf.value as Vector2).set(cut.along, cut.across)
  }

  /** How high the rolling waves' crest is here (0..1 of their height), for white water and jumps. */
  crestAt(x: number, z: number, t: number, shore: number) {
    const w = this.waves
    if (w.height <= 0.01) return 0
    const l = Math.hypot(w.dir.x, w.dir.z) || 1
    const dx = w.dir.x / l
    const dz = w.dir.z / l
    const s = (x * dx + z * dz - w.speed * t) / w.length + 0.06 * Math.sin((-dz * x + dx * z) * 0.045)
    const c = 0.5 + 0.5 * Math.cos(Math.PI * 2 * s)
    return c * c * c * c * smooth(1, 16, shore) * this.fade(x, z)
  }
  private fade(x: number, z: number) {
    const g = this.grid * 0.5
    return 1 - smooth(g - 22, g - 6, Math.max(Math.abs(x - this.cx), Math.abs(z - this.cz)))
  }
  /** The water's surface height here (exactly what the shader draws). `shore`: meters to the shore (Terrain.shoreAt). */
  heightAt(x: number, z: number, t: number, shore: number) {
    const w = this.waves
    const chop = 0.05 * Math.sin(x * 0.21 + t * 1.3) + 0.04 * Math.sin(z * 0.17 - t * 1.1) + 0.02 * Math.sin((x - z) * 0.5 + t * 2.1)
    const fade = this.fade(x, z)
    return fade * w.chop * chop * (0.35 + 0.65 * smooth(0, 6, shore)) + w.height * this.crestAt(x, z, t, shore) + this.tide.level
  }

  /** New colors (a golden afternoon, the night). */
  setHaze(haze: ColorRepresentation) {
    ;(this.mat.uniforms.uHaze.value as Color).set(haze)
  }
  /** New depth bands (the time of day: warmer at golden hour, deep indigo at night), and the foam's color. */
  setBands(bands: readonly ColorRepresentation[], foam: ColorRepresentation = '#FFFFFF') {
    const u = this.mat.uniforms
    bands.forEach((b, i) => (u[`uB${i}`].value as Color).set(b))
    ;(u.uFoam.value as Color).set(foam)
  }
}

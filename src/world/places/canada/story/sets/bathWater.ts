// The river's moving water for Misty's Bubble Bath (sets/bath.ts): the pool and the river drawn by one small shader
// (an organic outline from a distance function, two blue bands, a pale shallow rim, a pebbly shore, rings spreading from
// the falls' foot and round Misty's legs, drifting glints), the falls as curved water curtains that bend over a rounded
// lip and pour (streaks scrolling down, a bright lip, a white foamy foot), the churning foam, spray sparkles and dust
// motes as camera-facing puffs (one instanced draw), and soft sunbeams slanting through the cedars.
//
// The pool's outline lives here twice, once in JS (`lowSdf`, `upSdf`: where the stones go along its edge) and once as
// GLSL written from the same numbers, so the stones always sit on the shore the shader draws.
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  UniformsLib,
  UniformsUtils,
  Vector3,
} from 'three'
import { smoothstep } from '../../../../../sdk/math'
import type { Bag } from '../../../../engine3d/dispose'

// ---- The outline: smooth unions of ellipses and rounded boxes, plus a meandering channel.

type Blob = { e: [x: number, z: number, rx: number, rz: number] } | { b: [x: number, z: number, hx: number, hz: number, r: number] }
interface Channel {
  /** Middle line: x = a + amp * sin(z * f + ph) (times `ease` from where it starts meandering). */
  a: number
  amp: number
  f: number
  ph: number
  /** Half width, and where it widens (by `flare`) toward `z0`. */
  hw: number
  flare: number
  /** It runs from z0 toward +z (dir 1) or -z (dir -1). */
  z0: number
  dir: 1 | -1
  /** The meander fades in over this many meters from z0 (a straight run at the start). */
  ease: number
}
interface Outline {
  blobs: Blob[]
  chan: Channel
  k: number
}

/** Where the falls' face is (mirrors sets/bath.ts, which imports this file). */
const FZ = -3

/** The pool at the falls' foot, and the river leaving it toward the camera. */
export const LOW: Outline = {
  blobs: [
    { e: [0.0, -2.05, 1.85, 1.05] },
    { e: [-1.15, -1.3, 0.95, 0.85] },
    { e: [0.98, -1.12, 0.82, 0.74] },
    { b: [0.0, FZ + 0.28, 1.72, 0.36, 0.3] },
  ],
  chan: { a: -0.15, amp: 0.55, f: 0.26, ph: 1.0, hw: 0.92, flare: 0.35, z0: -1.5, dir: 1, ease: 1.5 },
  k: 0.38,
}
/** The upper river, coming from the forest to the lip. */
export const UP: Outline = {
  blobs: [],
  chan: { a: 0, amp: 1.2, f: 0.21, ph: 0, hw: 1.08, flare: 0.5, z0: FZ - 0.55, dir: -1, ease: 3.5 },
  k: 0.3,
}

const smin = (a: number, b: number, k: number) => {
  const h = Math.min(1, Math.max(0, 0.5 + (0.5 * (b - a)) / k))
  return b * (1 - h) + a * h - k * h * (1 - h)
}
function chanX(c: Channel, z: number) {
  const s = (z - c.z0) * c.dir
  return c.a + c.amp * Math.sin(s * c.f + c.ph) * smoothstep(0, c.ease, s) - c.amp * Math.sin(c.ph) * (1 - smoothstep(0, c.ease, s))
}
function sdf(o: Outline, x: number, z: number) {
  let d = 1e5
  for (const bl of o.blobs) {
    if ('e' in bl) {
      const [cx, cz, rx, rz] = bl.e
      d = smin(d, (Math.hypot((x - cx) / rx, (z - cz) / rz) - 1) * Math.min(rx, rz), o.k)
    } else {
      const [cx, cz, hx, hz, r] = bl.b
      const qx = Math.abs(x - cx) - hx + r
      const qz = Math.abs(z - cz) - hz + r
      d = smin(d, Math.hypot(Math.max(qx, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qz), 0) - r, o.k)
    }
  }
  const c = o.chan
  const s = (z - c.z0) * c.dir
  const hw = c.hw + c.flare * Math.exp(-Math.max(s, 0) * 0.6)
  const ch = Math.max(Math.abs(x - chanX(c, z)) - hw, -s)
  return smin(d, ch, o.k)
}
export const lowSdf = (x: number, z: number) => sdf(LOW, x, z)
export const upSdf = (x: number, z: number) => sdf(UP, x, z)

const n = (v: number) => v.toFixed(4)
function sdfGlsl(name: string, o: Outline) {
  const c = o.chan
  const lines = o.blobs.map((bl) => {
    if ('e' in bl) {
      const [cx, cz, rx, rz] = bl.e
      return `d = smin(d, (length((p - vec2(${n(cx)}, ${n(cz)})) / vec2(${n(rx)}, ${n(rz)})) - 1.0) * ${n(Math.min(rx, rz))}, ${n(o.k)});`
    }
    const [cx, cz, hx, hz, r] = bl.b
    return `{ vec2 q = abs(p - vec2(${n(cx)}, ${n(cz)})) - vec2(${n(hx - r)}, ${n(hz - r)}); d = smin(d, length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - ${n(r)}, ${n(o.k)}); }`
  })
  return `
  float ${name}(vec2 p) {
    float d = 1e5;
    ${lines.join('\n    ')}
    float s = (p.y - ${n(c.z0)}) * ${n(c.dir)};
    float e = smoothstep(0.0, ${n(c.ease)}, s);
    float cx = ${n(c.a)} + ${n(c.amp)} * sin(s * ${n(c.f)} + ${n(c.ph)}) * e - ${n(c.amp * Math.sin(c.ph))} * (1.0 - e);
    float hw = ${n(c.hw)} + ${n(c.flare)} * exp(-max(s, 0.0) * 0.6);
    return smin(d, max(abs(p.x - cx) - hw, -s), ${n(o.k)});
  }`
}

const col = (c: string) => ({ value: new Color(c) })

// ---- The pool and the rivers.

const waterVert = /* glsl */ `
  varying vec3 vWorld;
  #include <fog_pars_vertex>
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    vec4 mvPosition = viewMatrix * w;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`
const waterFrag = /* glsl */ `
  uniform float uTime;
  uniform vec3 uDeep;
  uniform vec3 uMid;
  uniform vec3 uShallow;
  uniform vec3 uEdge;
  uniform vec3 uRing;
  uniform vec3 uShore;
  uniform vec3 uPebA;
  uniform vec3 uPebB;
  uniform vec3 uStill;
  uniform vec3 uWade;
  uniform vec4 uMirror;
  varying vec3 vWorld;
  #include <fog_pars_fragment>
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
  ${sdfGlsl('lowSdf', LOW)}
  ${sdfGlsl('upSdf', UP)}
  // Rings spreading from c (squashed by sq), one every 1/speed seconds, from r0 out to r1.
  float rings(vec2 p, vec2 c, vec2 sq, float speed, float r0, float r1, float w, float ph) {
    float d = length((p - c) * sq);
    float on = 0.0;
    for (int i = 0; i < 3; i++) {
      float k = fract(uTime * speed + float(i) / 3.0 + ph);
      float r = mix(r0, r1, k);
      on = max(on, step(abs(d - r), w * (1.0 - k * 0.5)) * (1.0 - k));
    }
    return on;
  }
  void main() {
    vec2 p = vWorld.xz;
    bool upper = vWorld.y > 0.8;
    float d = upper ? upSdf(p) : lowSdf(p);
    // The shore: a band of pale sand and pebbles round the water, its outer edge wavy where the moss starts.
    float shoreW = 0.13 + 0.05 * sin(p.x * 3.1 + p.y * 2.3) + 0.03 * sin(p.x * 7.3 - p.y * 5.1);
    if (d > shoreW) discard;
    vec3 c;
    if (d > 0.0) {
      c = uShore;
      vec2 g = p / 0.1;
      vec2 cell = floor(g);
      vec2 f = fract(g) - 0.5;
      float h = hash(cell);
      vec2 o = vec2(hash(cell + 3.1), hash(cell + 7.7)) * 0.36 - 0.18;
      float r = 0.12 + 0.16 * h;
      if (length((f - o) * vec2(1.0, 1.3)) < r) c = h > 0.5 ? uPebA : uPebB;
    } else {
      // Bands that breathe a little, so the edge of each one wobbles slowly.
      float w = 0.035 * sin(p.x * 4.7 + uTime * 0.7) * sin(p.y * 3.9 - uTime * 0.5);
      float dd = d + w;
      c = dd < -0.62 ? uDeep : uMid;
      if (dd > -0.2) c = uShallow;
      float lit = 0.0;
      // The still mirror in front of her bath: calm, a little lighter, a soft gleam across it.
      vec2 mq = (p - uMirror.xy) / vec2(uMirror.z, uMirror.z * 0.7);
      float mr = length(mq);
      if (!upper && mr < 1.0) {
        c = uStill;
        if (abs(mq.x + mq.y * 0.6 - 0.15) < 0.12 && mr < 0.8) c = mix(c, uEdge, 0.55);
      } else {
        // Glints: little white dashes drifting downstream (toward +z), twinkling on and off.
        vec2 q = vec2(p.x * 2.6, (p.y - uTime * 0.28) * 4.2);
        vec2 cell = floor(q);
        float h = hash(cell);
        vec2 f = fract(q);
        float dash = step(0.9, h) * step(0.2, f.x) * step(f.x, 0.8) * step(0.44, f.y) * step(f.y, 0.56);
        dash *= step(0.0, sin(uTime * 1.7 + h * 50.0));
        lit = max(lit, dash);
        if (!upper) {
          // Rings from the falls' foot, and round her legs.
          lit = max(lit, rings(p, vec2(-0.95, ${n(FZ + 0.15)}), vec2(0.8, 1.0), 0.32, 0.15, 1.7, 0.03, 0.0) * 0.85);
          lit = max(lit, rings(p, vec2(0.05, ${n(FZ + 0.15)}), vec2(0.8, 1.0), 0.29, 0.15, 1.8, 0.03, 0.4) * 0.85);
          lit = max(lit, rings(p, vec2(1.0, ${n(FZ + 0.15)}), vec2(0.8, 1.0), 0.34, 0.15, 1.6, 0.03, 0.7) * 0.85);
          lit = max(lit, rings(p, uWade.xz, vec2(1.0, 1.15), 0.45, 0.24, 0.85, 0.022, 0.0) * uWade.y);
        }
        c = mix(c, uRing, lit);
      }
      // A white lace of foam right at the water's edge.
      if (dd > -0.045) c = uEdge;
    }
    gl_FragColor = vec4(c, 1.0);
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`

export interface RiverWater {
  meshes: Mesh[]
  update(t: number): void
  /** Where the rings round her legs spread from (x, z) and how strong (0 hides them). */
  wade(x: number, z: number, k: number): void
}

/** The pool (and the river leaving it) at `y`, and the upper river at `yTop`. `mirror` is the still water's x, z, r. */
export function makeWater(bag: Bag, y: number, yTop: number, mirror: { x: number; z: number; r: number }): RiverWater {
  const mat = bag.add(
    new ShaderMaterial({
      uniforms: UniformsUtils.merge([
        UniformsLib.fog,
        {
          uTime: { value: 0 },
          uDeep: col('#5BA9D6'),
          uMid: col('#76C3E6'),
          uShallow: col('#A3E0EF'),
          uEdge: col('#F4FCFF'),
          uRing: col('#D6F4FC'),
          uShore: col('#E3D6BE'),
          uPebA: col('#F2EADB'),
          uPebB: col('#C9BBAA'),
          uStill: col('#B4E8F6'),
          uWade: { value: new Vector3(0.15, 1, -1.7) },
          uMirror: { value: [mirror.x, mirror.z, mirror.r, 0] },
        },
      ]),
      vertexShader: waterVert,
      fragmentShader: waterFrag,
      fog: true,
    }),
  )
  const plane = (w: number, d: number, x: number, z: number, yy: number) => {
    const m = new Mesh(bag.add(new PlaneGeometry(w, d, 1, 1)), mat)
    m.rotation.x = -Math.PI / 2
    m.position.set(x, yy, z)
    return m
  }
  const low = plane(8, 34, 0, 13.4, y)
  const up = plane(13, 44, 0, FZ - 0.55 - 22 + 0.15, yTop)
  return {
    meshes: [low, up],
    update(t) {
      mat.uniforms.uTime.value = t
    },
    wade(x, z, k) {
      ;(mat.uniforms.uWade.value as Vector3).set(x, k, z)
    },
  }
}

// ---- The falls: curved curtains.

const fallsVert = /* glsl */ `
  attribute vec4 aFlow;
  attribute vec2 aMeta;
  varying vec4 vFlow;
  varying vec2 vMeta;
  #include <fog_pars_vertex>
  void main() {
    vFlow = aFlow;
    vMeta = aMeta;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vec4 mvPosition = viewMatrix * w;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`
const fallsFrag = /* glsl */ `
  uniform float uTime;
  uniform vec3 uDark;
  uniform vec3 uBase;
  uniform vec3 uLight;
  uniform vec3 uWhite;
  uniform vec3 uLip;
  // x: across (m from the middle), y: along the flow from the top (m), z: half width, w: where the lip's curl ends.
  varying vec4 vFlow;
  // x: the curtain's seed, y: its whole length along the flow.
  varying vec2 vMeta;
  #include <fog_pars_fragment>
  float hash(float p) { return fract(sin(p * 127.1) * 43758.5453); }
  void main() {
    float x = vFlow.x;
    float v = vFlow.y;
    float hw = vFlow.z;
    float lip = vFlow.w;
    float seed = vMeta.x;
    float len = vMeta.y;
    float t = uTime;
    float fall = smoothstep(lip - 0.15, lip + 0.25, v);
    // Ragged sides once it falls (the flat top stays straight, to meet the river).
    float edge = hw - 0.03 - fall * (0.03 + 0.035 * sin(v * 7.0 - t * 6.0 + x * 3.0 + seed * 2.0));
    if (abs(x) > edge) discard;
    // Broad lighter ribbons: long lens shapes (pointed at both ends) in columns that wander and scroll down.
    float cx = x * 3.0 + 0.3 * sin(v * 1.7 + seed);
    float hb = hash(floor(cx) + seed * 13.0);
    float fb = fract(cx) - 0.5;
    float lb = 0.55 + 0.25 * hb;
    float sb = fract(v * 0.42 - t * (0.75 + hb * 0.3) + hb * 5.0) / lb;
    float wb = sb < 1.0 ? sqrt(sin(sb * 3.14159)) * 0.46 : 0.0;
    vec3 c = (hb > 0.3 && abs(fb) < wb) ? uLight : uBase;
    // Narrow white strokes rushing down: thin spindles, thick in the middle, pointed at the ends.
    float cs = x * 7.0 + 0.18 * sin(v * 2.6 + seed * 3.0 + x * 2.0);
    float hs = hash(floor(cs) + 7.0 + seed * 31.0);
    float fs = fract(cs) - 0.5;
    float ls = 0.3 + 0.18 * hs;
    float ss = fract(v * (0.5 + hs * 0.35) - t * (1.15 + hs * 0.6) + hs * 9.0) / ls;
    float ws = ss < 1.0 ? sin(ss * 3.14159) * (0.16 + 0.12 * hash(hs * 91.0)) : 0.0;
    float streak = step(abs(fs), ws) * step(0.2, hs);
    c = mix(c, uWhite, streak);
    // Deeper blue down the ragged sides, so the curtain has a round shape.
    if (abs(x) > edge - 0.07 * fall - 0.03) c = uDark;
    // The lip: pale water sliding along the flat, a white crest where it curls over, brighter as it bends down.
    if (v < lip - 0.38) c = (fract(x * 1.6 + v * 0.8 - t * 0.7 + sin(x * 5.0) * 0.2) < 0.2) ? uWhite : uLip;
    else if (v < lip - 0.22) c = uWhite;
    else if (v < lip + 0.05) c = mix(uLip, c, smoothstep(lip - 0.22, lip + 0.05, v));
    // The foamy foot: a wavy white band at the bottom.
    float foot = 0.2 + 0.06 * sin(x * 9.0 + t * 4.0 + seed) + 0.04 * sin(x * 23.0 - t * 6.0);
    if (v > len - foot) c = uWhite;
    gl_FragColor = vec4(c, 1.0);
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`

export interface CurtainSpec {
  /** Middle of the curtain across x, and its half width. */
  x: number
  half: number
  /** Where it starts on the flat (z) and at what height, and where the lip's curl is (center z), its radius. */
  zStart: number
  y: number
  zLip: number
  r: number
  /** Where it ends (water level below). */
  yEnd: number
  /** How far forward it bows as it falls (m at the bottom). */
  bow: number
}

/** The falls' curtains as one mesh. */
export function makeFalls(bag: Bag, specs: CurtainSpec[]) {
  const pos: number[] = []
  const flow: number[] = []
  const meta: number[] = []
  const index: number[] = []
  specs.forEach((s, si) => {
    // The profile in (z, y) with its length along the flow: the flat top, the curl over the lip, then the fall.
    const prof: [number, number, number][] = []
    const push = (z: number, y: number) => {
      const last = prof[prof.length - 1]
      prof.push([z, y, last ? last[2] + Math.hypot(z - last[0], y - last[1]) : 0])
    }
    const flatN = 3
    for (let i = 0; i <= flatN; i++) push(s.zStart + ((s.zLip - s.zStart) * i) / flatN, s.y)
    const cy = s.y - s.r
    const a1 = -0.15
    const arcN = 10
    for (let i = 1; i <= arcN; i++) {
      const a = Math.PI / 2 + ((a1 - Math.PI / 2) * i) / arcN
      push(s.zLip + Math.cos(a) * s.r, cy + Math.sin(a) * s.r)
    }
    const lipV = prof[prof.length - 1][2]
    const [z0, y0] = prof[prof.length - 1]
    const H = y0 - s.yEnd
    const fallN = 22
    for (let i = 1; i <= fallN; i++) {
      const k = i / fallN
      push(z0 + s.bow * (0.55 * Math.sqrt(k) + 0.45 * k) - 0.02 * Math.sin(k * Math.PI), y0 - H * k)
    }
    const len = prof[prof.length - 1][2]
    const across = Math.max(6, Math.round(s.half * 14))
    const base = pos.length / 3
    for (const [z, y, v] of prof) {
      for (let j = 0; j <= across; j++) {
        const u = (j / across) * 2 - 1
        // (The curtain bellies forward a touch in the middle.)
        const belly = (1 - u * u) * 0.05 * smoothstep(lipV, lipV + 0.5, v)
        pos.push(s.x + u * s.half, y, z + belly)
        flow.push(u * s.half, v, s.half, lipV)
        meta.push(si, 0)
      }
    }
    for (let k = base * 2 + 1; k < meta.length; k += 2) meta[k] = len
    const row = across + 1
    for (let i = 0; i + 1 < prof.length; i++)
      for (let j = 0; j < across; j++) {
        const a = base + i * row + j
        index.push(a, a + row, a + 1, a + 1, a + row, a + row + 1)
      }
  })
  const g = bag.add(new BufferGeometry())
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  g.setAttribute('aFlow', new BufferAttribute(new Float32Array(flow), 4))
  g.setAttribute('aMeta', new BufferAttribute(new Float32Array(meta), 2))
  g.setIndex(index)
  const mat = bag.add(
    new ShaderMaterial({
      uniforms: UniformsUtils.merge([
        UniformsLib.fog,
        {
          uTime: { value: 0 },
          uDark: col('#6DB5DE'),
          uBase: col('#8FD0EE'),
          uLight: col('#BCE8F8'),
          uWhite: col('#FAFEFF'),
          uLip: col('#CDEFFA'),
        },
      ]),
      vertexShader: fallsVert,
      fragmentShader: fallsFrag,
      side: DoubleSide,
      fog: true,
    }),
  )
  const mesh = new Mesh(g, mat)
  return {
    mesh,
    update(t: number) {
      mat.uniforms.uTime.value = t
    },
  }
}

// ---- Puffs: foam churning at the falls' foot, sparkles rising in the spray, dust motes in the sunbeams.

const puffVert = /* glsl */ `
  attribute vec3 aBase;
  attribute vec4 aInfo;
  uniform float uTime;
  varying vec2 vP;
  varying float vKind;
  varying float vSeed;
  varying float vA;
  void main() {
    float seed = aInfo.x;
    float size = aInfo.y;
    float kind = aInfo.z;
    float t = uTime;
    vec3 c = aBase;
    float s = size;
    float a = 1.0;
    if (kind < 0.5) {
      // Foam: born small at the foot, swells and rolls forward, shrinks away.
      float life = fract(t * (0.32 + 0.12 * fract(seed * 7.3)) + seed);
      c.z += life * aInfo.w;
      c.y += sin(life * 3.14159) * 0.12;
      c.x += 0.06 * sin(t * 1.7 + seed * 20.0);
      s *= 0.35 + 0.75 * sin(life * 3.14159);
    } else if (kind < 1.5) {
      // A sparkle in the spray: rises and drifts, twinkles.
      float life = fract(t * 0.22 + seed);
      c.y += life * aInfo.w;
      c.x += 0.15 * sin(t * 0.9 + seed * 9.0);
      c.z += life * 0.3;
      s *= sin(life * 3.14159) * (0.55 + 0.45 * sin(t * 7.0 + seed * 30.0));
    } else {
      // A dust mote, floating in the light.
      c += vec3(0.3 * sin(t * 0.21 + seed * 11.0), 0.25 * sin(t * 0.17 + seed * 7.0), 0.2 * sin(t * 0.19 + seed * 5.0));
      a = 0.45 + 0.55 * (0.5 + 0.5 * sin(t * 0.9 + seed * 20.0));
    }
    vP = position.xy * 2.0;
    vKind = kind;
    vSeed = seed;
    vA = a;
    vec4 mv = modelViewMatrix * vec4(c, 1.0);
    mv.xy += position.xy * s;
    gl_Position = projectionMatrix * mv;
  }
`
const puffFrag = /* glsl */ `
  uniform vec3 uFoam;
  uniform vec3 uFoamShade;
  uniform vec3 uSpark;
  uniform vec3 uMote;
  varying vec2 vP;
  varying float vKind;
  varying float vSeed;
  varying float vA;
  void main() {
    float r = length(vP);
    vec3 c;
    float a;
    if (vKind < 0.5) {
      float lump = r * (1.0 + 0.07 * sin(atan(vP.y, vP.x) * 5.0 + vSeed * 40.0));
      a = 1.0 - smoothstep(0.86, 0.98, lump);
      // Two tones: white, with a round pale-blue crescent of shade underneath (a puff with a shape, no ink line).
      c = length(vP - vec2(-0.12, 0.22)) > 0.92 ? uFoamShade : uFoam;
      a *= 0.96;
    } else if (vKind < 1.5) {
      float star = max(1.0 - smoothstep(0.0, 0.11, abs(vP.x) * (0.25 + abs(vP.y))), 1.0 - smoothstep(0.0, 0.11, abs(vP.y) * (0.25 + abs(vP.x))));
      a = star * (1.0 - smoothstep(0.7, 1.0, r)) + (1.0 - smoothstep(0.12, 0.22, r));
      c = uSpark;
    } else {
      a = pow(max(0.0, 1.0 - r), 1.6) * 0.75 * vA;
      c = uMote;
    }
    if (a < 0.01) discard;
    gl_FragColor = vec4(c, min(a, 1.0));
    #include <colorspace_fragment>
  }
`

/** One puff: where (base), its seed, size, kind (0 foam, 1 sparkle, 2 mote) and how far it travels. */
export type Puff = [x: number, y: number, z: number, seed: number, size: number, kind: 0 | 1 | 2, travel: number]

export function makePuffs(bag: Bag, puffs: Puff[]) {
  const quad = new PlaneGeometry(1, 1)
  const g = bag.add(new InstancedBufferGeometry())
  g.index = quad.index
  g.setAttribute('position', quad.getAttribute('position'))
  g.instanceCount = puffs.length
  g.setAttribute('aBase', new InstancedBufferAttribute(new Float32Array(puffs.flatMap((p) => [p[0], p[1], p[2]])), 3))
  g.setAttribute('aInfo', new InstancedBufferAttribute(new Float32Array(puffs.flatMap((p) => [p[3], p[4], p[5], p[6]])), 4))
  quad.dispose()
  const mat = bag.add(
    new ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uFoam: col('#FFFFFF'), uFoamShade: col('#D3EDF8'), uSpark: col('#FFFDF0'), uMote: col('#FFF1C4') },
      vertexShader: puffVert,
      fragmentShader: puffFrag,
      transparent: true,
      depthWrite: false,
    }),
  )
  const mesh = new Mesh(g, mat)
  mesh.frustumCulled = false
  return {
    mesh,
    update(t: number) {
      mat.uniforms.uTime.value = t
    },
  }
}

// ---- Sunbeams: soft additive shafts slanting down through the cedars.

const beamVert = /* glsl */ `
  attribute vec3 aBeam;
  varying vec3 vBeam;
  void main() {
    vBeam = aBeam;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const beamFrag = /* glsl */ `
  uniform float uTime;
  uniform float uStrength;
  uniform vec3 uColor;
  // x: across (-1..1), y: along (0 at the ground, 1 at the top), z: phase.
  varying vec3 vBeam;
  void main() {
    float u = vBeam.x;
    float side = pow(max(0.0, 1.0 - u * u), 1.5);
    float along = smoothstep(0.0, 0.35, vBeam.y) * (1.0 - smoothstep(0.55, 1.0, vBeam.y));
    float pulse = 0.7 + 0.3 * sin(uTime * 0.45 + vBeam.z * 6.0);
    gl_FragColor = vec4(uColor * side * along * pulse * uStrength, 1.0);
    #include <colorspace_fragment>
  }
`

/** A beam: where it reaches the ground, its width there and at the top, how long. */
export type Beam = [x: number, y: number, z: number, wBottom: number, wTop: number, len: number]

export function makeBeams(bag: Bag, beams: Beam[], dir: [number, number, number]) {
  const dl = Math.hypot(...dir)
  const D = dir.map((v) => v / dl)
  // Across: level and square to the beam, as near to facing the camera (+z) as it can.
  const al = Math.hypot(D[1], D[0])
  const A = [D[1] / al, -D[0] / al, 0]
  const pos: number[] = []
  const info: number[] = []
  const index: number[] = []
  beams.forEach(([x, y, z, wb, wt, len], i) => {
    const b = pos.length / 3
    const top = [x + D[0] * len, y + D[1] * len, z + D[2] * len]
    for (const [cx, cy, cz, w, v] of [
      [x, y, z, wb, 0],
      [top[0], top[1], top[2], wt, 1],
    ])
      for (const s of [-1, 0, 1]) {
        pos.push(cx + A[0] * s * w * 0.5, cy + A[1] * s * w * 0.5, cz)
        info.push(s, v, i * 0.37)
      }
    for (const j of [0, 1]) index.push(b + j, b + j + 1, b + 3 + j, b + j + 1, b + 4 + j, b + 3 + j)
  })
  const g = bag.add(new BufferGeometry())
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  g.setAttribute('aBeam', new BufferAttribute(new Float32Array(info), 3))
  g.setIndex(index)
  const mat = bag.add(
    new ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uStrength: { value: 0.13 }, uColor: col('#FFF0C8') },
      vertexShader: beamVert,
      fragmentShader: beamFrag,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: DoubleSide,
    }),
  )
  const mesh = new Mesh(g, mat)
  mesh.renderOrder = 2
  return {
    mesh,
    update(t: number) {
      mat.uniforms.uTime.value = t
    },
  }
}

// ---- Placing things along the shore.

/** A tiny repeatable random (so the stones are always in the same places). */
export function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Points on the water's edge (d = 0) inside a box, at least `gap` apart (in the order a grid walk finds them). */
export function edgePoints(f: (x: number, z: number) => number, x0: number, x1: number, z0: number, z1: number, gap: number, keep: (x: number, z: number) => boolean = () => true) {
  const step = 0.03
  const out: [number, number][] = []
  for (let z = z0; z < z1; z += step)
    for (let x = x0; x < x1; x += step) {
      const a = f(x, z)
      if ((a < 0) === (f(x + step, z) < 0) && (a < 0) === (f(x, z + step) < 0)) continue
      if (!keep(x, z)) continue
      if (out.some(([px, pz]) => Math.hypot(px - x, pz - z) < gap)) continue
      out.push([x, z])
    }
  return out
}

/** The outward direction of the edge at a point (toward the shore). */
export function outward(f: (x: number, z: number) => number, x: number, z: number): [number, number] {
  const e = 0.02
  const gx = f(x + e, z) - f(x - e, z)
  const gz = f(x, z + e) - f(x, z - e)
  const l = Math.hypot(gx, gz) || 1
  return [gx / l, gz / l]
}

// Open water in the toon look: one big flat plane drawn by a small shader. Jade green in two flat bands, little white
// wave dashes that drift (they're fixed to the world, so going fast makes them stream past: that's how speed reads),
// and haze toward the horizon in the scene's fog color. One draw call however big the bay is.
//
// swell() is the gentle up-and-down every boat on it rides (the plane itself stays flat in the greybox).
import { Color, Mesh, PlaneGeometry, ShaderMaterial, type ColorRepresentation } from 'three'
import type { Bag } from './dispose'

const vertexShader = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`
const fragmentShader = /* glsl */ `
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uDash;
  uniform vec3 uHaze;
  uniform float uTime;
  uniform float uHazeNear;
  uniform float uHazeFar;
  varying vec3 vWorld;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    vec2 p = vWorld.xz;
    // Two flat bands: big slow patches of lighter water.
    // (Not called "patch": that's a reserved word in WebGL2's shading language, and the shader would silently fail.)
    float blot = sin(p.x * 0.045 + uTime * 0.05) * sin(p.y * 0.038 - uTime * 0.04) + 0.35 * sin((p.x + p.y) * 0.11);
    vec3 col = blot > 0.42 ? uShallow : uDeep;
    // Wave dashes: short white strokes in rows, broken up cell by cell, drifting slowly.
    vec2 q = vec2(p.x * 0.7 + uTime * 0.35, p.y * 0.9);
    vec2 cell = floor(q / vec2(3.0, 1.0));
    float on = step(0.86, hash(cell));
    vec2 f = fract(q / vec2(3.0, 1.0));
    float dash = on * step(0.2, f.x) * step(f.x, 0.6) * step(0.4, f.y) * step(f.y, 0.6);
    float dist = distance(cameraPosition.xz, p);
    // Dashes thin out with distance (no shimmering far away).
    dash *= 1.0 - smoothstep(14.0, 42.0, dist);
    col = mix(col, uDash, dash * 0.7);
    col = mix(col, uHaze, smoothstep(uHazeNear, uHazeFar, dist));
    gl_FragColor = vec4(col, 1.0);
    // The colors are linear (like every material's): convert for the screen, as three's own materials do.
    #include <colorspace_fragment>
  }
`

export interface WaterOpts {
  size: number
  deep: ColorRepresentation
  shallow: ColorRepresentation
  haze: ColorRepresentation
  hazeNear: number
  hazeFar: number
}

export class Water {
  readonly mesh: Mesh
  private mat: ShaderMaterial

  constructor(o: WaterOpts, bag: Bag) {
    this.mat = bag.add(
      new ShaderMaterial({
        uniforms: {
          uDeep: { value: new Color(o.deep) },
          uShallow: { value: new Color(o.shallow) },
          uDash: { value: new Color('#FFFFFF') },
          uHaze: { value: new Color(o.haze) },
          uTime: { value: 0 },
          uHazeNear: { value: o.hazeNear },
          uHazeFar: { value: o.hazeFar },
        },
        vertexShader,
        fragmentShader,
      }),
    )
    this.mesh = new Mesh(bag.add(new PlaneGeometry(o.size, o.size)), this.mat)
    this.mesh.rotation.x = -Math.PI / 2
  }

  update(t: number) {
    this.mat.uniforms.uTime.value = t
  }
}

/** The water's gentle rise and fall at a point (meters), so boats bob on it. */
export function swell(x: number, z: number, t: number) {
  return 0.05 * Math.sin(x * 0.21 + t * 1.3) + 0.04 * Math.sin(z * 0.17 - t * 1.1) + 0.02 * Math.sin((x - z) * 0.5 + t * 2.1)
}

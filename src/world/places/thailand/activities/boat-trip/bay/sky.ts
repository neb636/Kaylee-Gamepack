// The bay's sky: a pastel gradient dome, fat toon clouds drifting round the horizon, and the colors of the whole bay
// (the haze, the water, the sunlight) with one dial for the sunset: 0 = a sunny day, 1 = the pink-gold ride home.
import { BackSide, Color, Group, Mesh, MeshToonMaterial, ShaderMaterial, SphereGeometry, type Fog } from 'three'
import type { Bag } from '../../../engine/dispose'
import { merge, P } from '../../../engine/geo'
import { toonGradient } from '../../../engine/toon'
import type { Water } from '../../../engine/water'

const vertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const fragmentShader = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uMid;
  uniform vec3 uHorizon;
  varying vec3 vDir;
  void main() {
    float h = clamp(vDir.y, 0.0, 1.0);
    vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.18, h));
    col = mix(col, uTop, smoothstep(0.18, 0.6, h));
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

/** Day and sunset colors (the sunset is pink and gold, the rock towers glow). */
const DAY = { top: '#8FCBFF', mid: '#BDE3FF', horizon: '#E4F3FC', haze: '#DCEFFB', deep: '#5FC7B4', shallow: '#78D4C1', sun: '#FFF7F0', ambient: '#FFF7F0', cloud: '#FFFFFF' }
const DUSK = { top: '#A98FE8', mid: '#FF9DC0', horizon: '#FFC98F', haze: '#FFC6B4', deep: '#B08CC2', shallow: '#D6A6CC', sun: '#FFC08A', ambient: '#FFD3DF', cloud: '#FFD2DE' }

export class Sky {
  readonly root = new Group()
  private mat: ShaderMaterial
  private clouds: Group
  private cloudMat: MeshToonMaterial
  private k = -1
  private c = new Color()

  constructor(
    bag: Bag,
    private fog: Fog,
    private water: Water,
    private lights: { sun: { color: Color }; ambient: { color: Color } },
  ) {
    this.mat = bag.add(
      new ShaderMaterial({
        uniforms: { uTop: { value: new Color() }, uMid: { value: new Color() }, uHorizon: { value: new Color() } },
        vertexShader,
        fragmentShader,
        side: BackSide,
        depthWrite: false,
        fog: false,
      }),
    )
    const dome = new Mesh(bag.add(new SphereGeometry(660, 24, 12)), this.mat)
    dome.renderOrder = -1
    dome.frustumCulled = false
    this.root.add(dome)
    // Fat clouds round the horizon: lumps of spheres, toon-lit, no fog (they'd vanish in the haze).
    this.cloudMat = bag.add(new MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: toonGradient(), fog: false }))
    const puffs = []
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + (i % 3) * 0.2
      const d = 330 + (i % 4) * 40
      const x = Math.sin(a) * d
      const z = Math.cos(a) * d - 40
      const y = 70 + (i % 5) * 14
      const s = 9 + (i % 3) * 4
      for (let k = 0; k < 4; k++) puffs.push(P.sphere(s * (1 - Math.abs(k - 1.5) * 0.18), '#FFFFFF', { at: [x + (k - 1.5) * s * 1.1 * Math.cos(a), y + (k % 2) * s * 0.35, z - (k - 1.5) * s * 1.1 * Math.sin(a)], scale: [1, 0.75, 1] }, 10))
      puffs.push(P.sphere(s * 0.9, '#EEE8FF', { at: [x, y - s * 0.35, z], scale: [2.6, 0.35, 2.6] }, 10))
    }
    this.clouds = new Group()
    this.clouds.add(new Mesh(bag.add(merge(puffs)), this.cloudMat))
    this.root.add(this.clouds)
    this.set(0)
  }

  /** 0 = day, 1 = sunset. */
  set(k: number) {
    if (Math.abs(k - this.k) < 0.002) return
    this.k = k
    const mix = (a: string, b: string) => this.c.set(a).lerp(new Color(b), k)
    const u = this.mat.uniforms
    ;(u.uTop.value as Color).copy(mix(DAY.top, DUSK.top))
    ;(u.uMid.value as Color).copy(mix(DAY.mid, DUSK.mid))
    ;(u.uHorizon.value as Color).copy(mix(DAY.horizon, DUSK.horizon))
    const haze = mix(DAY.haze, DUSK.haze).clone()
    this.fog.color.copy(haze)
    this.water.setColors(mix(DAY.deep, DUSK.deep).clone(), mix(DAY.shallow, DUSK.shallow).clone(), haze)
    this.lights.sun.color.copy(mix(DAY.sun, DUSK.sun))
    this.lights.ambient.color.copy(mix(DAY.ambient, DUSK.ambient))
    this.cloudMat.color.copy(mix(DAY.cloud, DUSK.cloud))
  }

  /** The dome and the clouds stay round the camera (only the clouds drift). */
  update(dt: number, x: number, z: number) {
    this.root.position.set(x, 0, z)
    this.clouds.rotation.y += dt * 0.004
  }
}

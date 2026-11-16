// The Poles' sky: a painted dome round the camera instead of a flat background color. Deep blue overhead, pale near
// the horizon with a blush of peach or pink along it, the low polar sun with its wide glow (or a moon at night), puffy
// toon clouds with lavender bellies, and stars. A mood (`MOODS`) sets all of it at once, so a film can cut from the
// Arctic's bright day to the long night, or ease through a sunrise (`blend`). Everything here sits at the camera's
// far edge and follows the camera, so it never comes closer however far the game goes.
//
// The sky also runs the look's clock (look.ts `POLAR.uTime`) and says what the fog and the sea should blend into
// (`haze`), so one call a frame keeps them all in step.
import { BackSide, BufferAttribute, BufferGeometry, Color, Group, Mesh, MeshToonMaterial, Points, PointsMaterial, ShaderMaterial, SphereGeometry, Vector3, type Camera, type Fog, type PerspectiveCamera } from 'three'
import type { Bag } from '../../../engine3d/dispose'
import { merge, P } from '../../../engine3d/geo'
import { toonGradient } from '../../../engine3d/toon'
import { rng } from '../story/props'
import { POLAR } from './look'

export interface Mood {
  top: string
  mid: string
  horizon: string
  /** The blush along the horizon (peach by day, pink at dusk). */
  blush: string
  /** Toward the sun (or the moon), and its glow's color. */
  sun: [number, number, number]
  glow: string
  /** 0 day .. 1 night (a moon instead of the sun, stars out). */
  night: number
  cloud: string
  belly: string
  /** How many of the clouds show (0..1). */
  clouds: number
  /** The fog's and the sea's far color. */
  haze: string
}

export const MOODS = {
  /** The Arctic's bright day: clear blue, the low sun off to one side. */
  day: { top: '#4E9FE6', mid: '#93CBF5', horizon: '#E4F2FC', blush: '#FCE7D8', sun: [-0.42, 0.2, -0.88], glow: '#FFF4D8', night: 0, cloud: '#FFFFFF', belly: '#DCD6FA', clouds: 1, haze: '#DCEEFB' },
  /** Autumn on the tundra: a warmer, softer day. */
  autumn: { top: '#6AA6E4', mid: '#A9D0F2', horizon: '#F6EAD8', blush: '#FFD9B8', sun: [0.5, 0.22, -0.84], glow: '#FFE9C2', night: 0, cloud: '#FFFBF4', belly: '#E5D3EA', clouds: 0.8, haze: '#EAE8E6' },
  /** Antarctica: crisp and high, a little lilac at the horizon. */
  south: { top: '#4A93DE', mid: '#9AC9F3', horizon: '#ECF1FC', blush: '#EBDDF6', sun: [0.55, 0.25, -0.8], glow: '#FFF6E2', night: 0, cloud: '#FFFFFF', belly: '#D8D6F6', clouds: 0.7, haze: '#E2ECFA' },
  /** The pink polar evening (Papa's long night coming, the flight home). */
  dusk: { top: '#4C5AA8', mid: '#9C8FD0', horizon: '#FFC9C2', blush: '#FFB1C6', sun: [-0.2, 0.06, -0.98], glow: '#FFD7B0', night: 0.25, cloud: '#FFE3E8', belly: '#B7A3DA', clouds: 0.6, haze: '#D9C3DE' },
  /** The long night: deep blue to violet, the moon, stars (the aurora is the stage's, props.ts). */
  night: { top: '#141A4A', mid: '#2E3478', horizon: '#6A5DA6', blush: '#8D6FB4', sun: [0.45, 0.42, -0.78], glow: '#CFD6FF', night: 1, cloud: '#5A5698', belly: '#3A3778', clouds: 0.25, haze: '#3E3C7E' },
  /** Behind the little globe in the ship's film: a soft lilac nursery sky. */
  globe: { top: '#CDBDF5', mid: '#E6DBFF', horizon: '#FBEFFF', blush: '#FFE3F0', sun: [0.3, 0.6, -0.7], glow: '#FFFFFF', night: 0, cloud: '#FFFFFF', belly: '#E3D8FF', clouds: 0, haze: '#F1E8FF' },
} satisfies Record<string, Mood>
export type MoodName = keyof typeof MOODS

const vertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const fragmentShader = /* glsl */ `
  uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uHorizon; uniform vec3 uBlush; uniform vec3 uSun; uniform vec3 uGlow;
  uniform float uNight;
  varying vec3 vDir;
  void main() {
    vec3 d = normalize(vDir);
    float h = d.y;
    // Below the horizon (seen past the edge of the sea): the horizon's color, so nothing ends in a hard line.
    vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.12, h));
    col = mix(col, uTop, smoothstep(0.12, 0.55, h));
    // The blush: a low band along the horizon, strongest toward the sun.
    float toSun = max(0.0, dot(normalize(vec3(d.x, 0.0, d.z)), normalize(vec3(uSun.x, 0.0, uSun.z))));
    col = mix(col, uBlush, (1.0 - smoothstep(0.0, 0.16, abs(h - 0.02))) * (0.35 + 0.45 * toSun));
    // The sun's wide glow and its disc; at night a crescent moon instead (the disc with a bite out of it).
    float s = max(0.0, dot(d, normalize(uSun)));
    col = mix(col, uGlow, smoothstep(0.82, 1.0, s) * (0.6 - uNight * 0.3));
    col = mix(col, uGlow, smoothstep(0.985, 0.995, s) * 0.5);
    float disc = smoothstep(0.9968, 0.9975, s);
    vec3 side = normalize(cross(normalize(uSun), vec3(0.0, 1.0, 0.0)));
    float bite = smoothstep(0.998, 0.9985, max(0.0, dot(d, normalize(normalize(uSun) + side * 0.03)))) * step(0.5, uNight);
    col = mix(col, uNight > 0.5 ? vec3(1.0, 0.97, 0.88) : vec3(1.0, 0.99, 0.93), disc * (1.0 - bite));
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

export class PolarSky {
  /** Add to the scene: the dome, the clouds and the stars (it follows the camera). */
  readonly root = new Group()
  /** The fog's and the sea's far color right now. */
  readonly haze = new Color()
  /** Toward the sun right now (for the sea's glitter path). */
  readonly sun = new Vector3()
  private mat: ShaderMaterial
  private cloudTop: MeshToonMaterial
  private cloudBelly: MeshToonMaterial
  private clouds = new Group()
  private stars: Points
  private starMat: PointsMaterial
  private now: Mood = { ...MOODS.day }

  constructor(bag: Bag, mood: MoodName | Mood = 'day') {
    const u = (c: string) => ({ value: new Color(c) })
    this.mat = bag.add(
      new ShaderMaterial({
        uniforms: { uTop: u('#000'), uMid: u('#000'), uHorizon: u('#000'), uBlush: u('#000'), uSun: { value: new Vector3(0, 1, 0) }, uGlow: u('#000'), uNight: { value: 0 } },
        vertexShader,
        fragmentShader,
        side: BackSide,
        depthWrite: false,
        fog: false,
      }),
    )
    const dome = new Mesh(bag.add(new SphereGeometry(1, 48, 24)), this.mat)
    dome.renderOrder = -10
    dome.frustumCulled = false
    this.root.add(dome)

    // Stars (a unit dome; they show as the night comes).
    const R = rng(77)
    const pos: number[] = []
    for (let i = 0; i < 360; i++) {
      const a = R() * Math.PI * 2
      const e = 0.06 + Math.asin(R()) * 0.95
      pos.push(Math.cos(e) * Math.sin(a) * 0.97, Math.sin(e) * 0.97, Math.cos(e) * Math.cos(a) * 0.97)
    }
    const sg = bag.add(new BufferGeometry())
    sg.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
    this.starMat = bag.add(new PointsMaterial({ color: '#FFF8E6', size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }))
    this.stars = new Points(sg, this.starMat)
    this.stars.frustumCulled = false
    this.stars.renderOrder = -9
    this.root.add(this.stars)

    // Clouds: puffy toon heaps round the horizon, white tops and lavender bellies, each its own mesh so a mood can show
    // fewer of them.
    this.cloudTop = bag.add(new MeshToonMaterial({ color: '#ffffff', gradientMap: toonGradient(), fog: false }))
    this.cloudBelly = bag.add(new MeshToonMaterial({ color: '#DCD6FA', gradientMap: toonGradient(), fog: false }))
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + R() * 0.3
      const d = 0.86
      const y = 0.16 + R() * 0.2
      const s = 0.016 + R() * 0.014
      // A heap: a row of puffs, the middle ones biggest and highest, and smaller ones round their feet.
      const n = 4 + Math.floor(R() * 3)
      const tops = []
      const bellies = []
      const ca = Math.cos(a)
      const sa = Math.sin(a)
      const at = (along: number, up: number, out: number): [number, number, number] => [Math.sin(a) * (d + out) + along * ca, y + up, Math.cos(a) * (d + out) - along * sa]
      for (let k = 0; k < n; k++) {
        const m = (k - (n - 1) / 2) / ((n - 1) / 2 || 1)
        const r = s * (1.15 - Math.abs(m) * 0.5) * (0.85 + R() * 0.3)
        tops.push(P.sphere(r, '#FFFFFF', { at: at(m * s * n * 0.42, r * 0.45 + (1 - Math.abs(m)) * s * 0.35, 0) }, 12))
        bellies.push(P.sphere(r * 0.8, '#FFFFFF', { at: at(m * s * n * 0.45, -r * 0.05, s * 0.2), scale: [1.25, 0.55, 1] }, 10))
      }
      const g = new Group()
      const top = new Mesh(bag.add(merge(tops)), this.cloudTop)
      const belly = new Mesh(bag.add(merge(bellies)), this.cloudBelly)
      for (const m of [top, belly]) {
        m.frustumCulled = false
        m.renderOrder = -8
      }
      g.add(top, belly)
      g.userData.k = R()
      this.clouds.add(g)
    }
    this.root.add(this.clouds)
    this.set(mood)
  }

  /** A mood at once. */
  set(mood: MoodName | Mood) {
    this.apply(typeof mood === 'string' ? MOODS[mood] : mood)
  }
  /** Part way from one mood to another (a sunrise: `k` 0 .. 1). */
  blend(a: MoodName | Mood, b: MoodName | Mood, k: number) {
    const A = typeof a === 'string' ? MOODS[a] : a
    const B = typeof b === 'string' ? MOODS[b] : b
    const mix = (x: string, y: string) => '#' + tmp.set(x).lerp(tmp2.set(y), k).getHexString()
    this.apply({
      top: mix(A.top, B.top),
      mid: mix(A.mid, B.mid),
      horizon: mix(A.horizon, B.horizon),
      blush: mix(A.blush, B.blush),
      sun: [0, 1, 2].map((i) => A.sun[i] + (B.sun[i] - A.sun[i]) * k) as [number, number, number],
      glow: mix(A.glow, B.glow),
      night: A.night + (B.night - A.night) * k,
      cloud: mix(A.cloud, B.cloud),
      belly: mix(A.belly, B.belly),
      clouds: A.clouds + (B.clouds - A.clouds) * k,
      haze: mix(A.haze, B.haze),
    })
  }
  get mood(): Readonly<Mood> {
    return this.now
  }
  private apply(m: Mood) {
    this.now = m
    const u = this.mat.uniforms
    ;(u.uTop.value as Color).set(m.top)
    ;(u.uMid.value as Color).set(m.mid)
    ;(u.uHorizon.value as Color).set(m.horizon)
    ;(u.uBlush.value as Color).set(m.blush)
    ;(u.uGlow.value as Color).set(m.glow)
    ;(u.uSun.value as Vector3).set(...m.sun).normalize()
    u.uNight.value = m.night
    this.sun.set(...m.sun).normalize()
    this.haze.set(m.haze)
    this.cloudTop.color.set(m.cloud)
    this.cloudBelly.color.set(m.belly)
    this.clouds.children.forEach((g) => (g.visible = (g.userData.k as number) < m.clouds))
    this.starMat.opacity = Math.max(0, (m.night - 0.3) / 0.7)
    this.stars.visible = this.starMat.opacity > 0.01
  }

  /** Keeps the sky round the camera (at the edge of what it sees), drifts the clouds, runs the look's clock, and
   *  colors the fog. */
  update(t: number, camera: Camera, fog?: Fog | null) {
    POLAR.uTime.value = t
    const far = (camera as PerspectiveCamera).far ?? 300
    this.root.position.copy(camera.position)
    this.root.scale.setScalar(far * 0.9)
    this.clouds.rotation.y = t * 0.004
    this.starMat.size = 2.2 + 0.4 * Math.sin(t * 2.1)
    fog?.color.copy(this.haze)
  }
}

const tmp = new Color()
const tmp2 = new Color()

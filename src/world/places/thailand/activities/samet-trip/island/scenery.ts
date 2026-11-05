// Koh Samet's look, island-wide, built from code in the toon look (no generated art): shared by the island to roam
// (island.ts) and the jet ski bay (jetski/scenery.ts adds the bay's own pieces). Plan:
// planning/around-the-world/thailand/samet-trip.html ("The look", "Tech plan").
//
// - The ground (island/ground.ts) as two Terrains: a fine one (1.25 m) over the north half where she walks, with what's
//   underfoot kept per point (surfaceAt), and a coarse one (2.5 m) for the south half and the sea floor, with a hole
//   where the fine one is.
// - The lagoon water (engine3d/lagoon.ts) from the coarse ground's depths.
// - The sky through the day (Day: morning, noon, afternoon, golden, night): a gradient dome with the sun's glow, fat
//   toon clouds with lavender bellies, the stars and a crescent moon at night; the light, the haze and the water's
//   colors follow it.
// - The horizon: Ko Kudi and its neighbors to the east, the mainland's blue hills to the north.
// - The plants, in 40 m tiles (each one mesh and one outline, so the camera only draws the tiles it sees): forest and
//   samet trees where she can't walk (it hems in the paths), coconut palms leaning out over the beaches, pandanus on
//   stilt roots at the back of the sand, round granite boulders on the rocky shores (they block her), pink
//   bougainvillea and flowers along the paths, tufts of beach grass.
// - `blockers`: circles she slides round (palm trunks, boulders), on a 4 m hash grid.
import { AdditiveBlending, BackSide, BufferGeometry, Color, Euler, Float32BufferAttribute, Group, Matrix4, Mesh, MeshBasicMaterial, MeshToonMaterial, Points, PointsMaterial, Quaternion, ShaderMaterial, SphereGeometry, Vector3, type ColorRepresentation } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../../../engine3d/geo'
import { Lagoon } from '../../../../../engine3d/lagoon'
import { Terrain } from '../../../../../engine3d/terrain'
import { toonGradient } from '../../../../../engine3d/toon'
import { LOOK, lookMaterial } from './look'
import { groundAt, groundColor, noise, SAND_W, surfaceAt, type Surface } from './ground'
import { BAN_PHE, BEACHES, KO_KUDI, POKES, STOPS, type XZ } from './layout'

/** The play area the fine ground covers (on the coarse grid's cell lines). */
export const FINE = { x0: -235, z0: -125, x1: 75, z1: 195 }
const SURFACES: Surface[] = ['water', 'wet', 'sand', 'rock', 'grass', 'road', 'path', 'forest']

export const up = new Vector3(0, 1, 0)
const q = new Quaternion()
const m4 = new Matrix4()
/** A part moved by a whole matrix (bake's Euler angles can't lean a palm frond). */
export function xf(g: BufferGeometry, pos: Vector3, quat: Quaternion, s = 1) {
  return g.applyMatrix4(m4.compose(pos, quat, new Vector3(s, s, s)))
}
/** A cylinder from a to b. */
export function stick(a: Vector3, b: Vector3, r0: number, r1: number, c: string, seg = 8) {
  const d = b.clone().sub(a)
  const g = P.cyl(r1, r0, d.length(), c, {}, seg)
  return xf(g, a.clone().add(b).multiplyScalar(0.5), q.clone().setFromUnitVectors(up, d.normalize()))
}
export const rng = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}
const recolor = (g: BufferGeometry, c: ColorRepresentation) => {
  const col = new Color(c)
  const a = g.attributes.color
  for (let v = 0; v < a.count; v++) a.setXYZ(v, col.r, col.g, col.b)
  return g
}

// ---------------------------------------------------------------- plants, as geometry (merged by the tiles)

/** A coconut palm: a curved ringed trunk leaning `lean` (a ground vector, its length how far), fronds, coconuts. */
export function palmGeo(R: () => number, base: Vector3, h: number, lean: Vector3): BufferGeometry[] {
  const out: BufferGeometry[] = []
  const pts: Vector3[] = []
  for (let i = 0; i <= 6; i++) {
    const s = i / 6
    pts.push(base.clone().add(new Vector3(lean.x * h * 0.34 * s * s, h * s, lean.z * h * 0.34 * s * s)))
  }
  for (let i = 0; i < 6; i++) out.push(stick(pts[i], pts[i + 1], 0.2 - i * 0.012, 0.19 - (i + 1) * 0.012, i % 2 ? '#C9A57A' : '#BD9870', 7))
  const top = pts[6]
  out.push(P.sphere(0.26, '#A98A62', { at: [top.x, top.y, top.z] }, 8))
  const n = 8
  const spin = R() * Math.PI
  for (let k = 0; k < n; k++) {
    const yaw = spin + (k / n) * Math.PI * 2
    const droop = 0.55 + (k % 2) * 0.35 + R() * 0.2
    const g = recolor(P.prism([[0, 0], [0.42, 0.7], [0.3, 1.9], [0, 2.9], [-0.3, 1.9], [-0.42, 0.7]], 0.05, '#ffffff'), k % 2 ? '#5DB85F' : '#74C96A')
    out.push(xf(g, top.clone().add(new Vector3(0, 0.05, 0)), new Quaternion().setFromEuler(new Euler(Math.PI / 2 + droop * 0.6 - 0.15, yaw, 0, 'YXZ'))))
  }
  for (let k = 0; k < 3; k++) {
    const a = spin + k * 2.1
    out.push(P.sphere(0.17, '#8A6A3E', { at: [top.x + Math.sin(a) * 0.25, top.y - 0.28, top.z + Math.cos(a) * 0.25] }, 8))
  }
  return out
}
/** The palm's top (where the coconuts hang), for whoever drops one. */
export function palmTop(base: Vector3, h: number, lean: Vector3) {
  return base.clone().add(new Vector3(lean.x * h * 0.34, h, lean.z * h * 0.34))
}

/** A samet tree (the island's own: Melaleuca): a pale, papery, forked trunk and small grey-green crowns. */
export function sametGeo(R: () => number, x: number, y: number, z: number, s: number): BufferGeometry[] {
  const out: BufferGeometry[] = []
  const tones = ['#9CC79A', '#8CBF8B', '#A9D3A0', '#93C597']
  const base = new Vector3(x, y - 0.1, z)
  const fork = base.clone().add(new Vector3((R() - 0.5) * 0.4 * s, 1.5 * s, (R() - 0.5) * 0.4 * s))
  out.push(stick(base, fork, 0.2 * s, 0.15 * s, '#EFE8DA', 7))
  for (let k = 0; k < 2; k++) {
    const a = R() * Math.PI * 2
    const tip = fork.clone().add(new Vector3(Math.sin(a) * 0.7 * s, 1.1 * s, Math.cos(a) * 0.7 * s))
    out.push(stick(fork, tip, 0.13 * s, 0.08 * s, k ? '#E4DCCB' : '#F6F1E6', 6))
    out.push(P.sphere(s * (0.95 + R() * 0.4), tones[Math.floor(R() * tones.length)], { at: [tip.x, tip.y + 0.55 * s, tip.z], scale: [1.15, 0.72, 1.15] }, 9))
  }
  // Peeling bark: a few pinkish-cream flakes on the trunk.
  out.push(P.box(0.12 * s, 0.3 * s, 0.03, '#F7E3D8', { at: [x + 0.17 * s, y + 0.8 * s, z], rot: [0, 0, 0.2] }))
  return out
}

/** A pandanus: a slim trunk standing on a tent of stilt roots, spiky crowns of long leaves (Dad's lunch photo). */
function pandanusGeo(R: () => number, x: number, y: number, z: number, s: number): BufferGeometry[] {
  const out: BufferGeometry[] = []
  const knee = new Vector3(x, y + 0.9 * s, z)
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + R()
    out.push(stick(new Vector3(x + Math.sin(a) * 0.7 * s, y - 0.1, z + Math.cos(a) * 0.7 * s), knee, 0.05 * s, 0.07 * s, '#B49274', 5))
  }
  const top = knee.clone().add(new Vector3((R() - 0.5) * 0.8 * s, 1.9 * s, (R() - 0.5) * 0.8 * s))
  out.push(stick(knee, top, 0.12 * s, 0.1 * s, '#A98868', 6))
  for (let k = 0; k < 9; k++) {
    const yaw = (k / 9) * Math.PI * 2 + R() * 0.3
    const g = recolor(P.prism([[0, 0], [0.12, 0.5], [0.05, 1.5], [0, 1.7], [-0.05, 1.5], [-0.12, 0.5]], 0.07, '#ffffff'), k % 3 ? '#6FAE5E' : '#87BF6A')
    out.push(xf(g, top, new Quaternion().setFromEuler(new Euler(0.5 + (k % 3) * 0.35, yaw, 0, 'YXZ')), s))
  }
  return out
}

/** Forest: two or three round green crowns (the hills' cover). */
function forestGeo(R: () => number, x: number, y: number, z: number, s: number): BufferGeometry[] {
  const tones = ['#5FAE63', '#6DB463', '#55A35E', '#79BD6B', '#64A95C']
  const out = [P.sphere(s * 1.6, tones[Math.floor(R() * tones.length)], { at: [x, y + s * 1.25, z], scale: [1, 0.9, 1] }, 8)]
  out.push(P.sphere(s * 1.1, tones[Math.floor(R() * tones.length)], { at: [x + s * 0.8, y + s * 2.1, z - s * 0.3], scale: [1, 0.9, 1] }, 8))
  if (R() > 0.5) out.push(P.sphere(s * 0.9, tones[Math.floor(R() * tones.length)], { at: [x - s * 0.7, y + s * 1.9, z + s * 0.5], scale: [1, 0.9, 1] }, 7))
  return out
}
/** Pink bougainvillea: a mound of magenta flowers over dark leaves. */
export function bushGeo(R: () => number, x: number, y: number, z: number, s: number): BufferGeometry[] {
  const out = [P.sphere(0.9 * s, '#4F9A55', { at: [x, y + 0.55 * s, z], scale: [1.2, 0.8, 1.1] }, 9)]
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + R()
    out.push(P.sphere(0.42 * s, k % 2 ? '#FF5FA8' : '#FF8FC6', { at: [x + Math.sin(a) * 0.65 * s, y + (0.75 + R() * 0.4) * s, z + Math.cos(a) * 0.55 * s] }, 7))
  }
  return out
}
/** A heap of round granite boulders (`r` the biggest). Pushes their circles into `block`. */
function boulderGeo(R: () => number, x: number, y: number, z: number, r: number, block: (x: number, z: number, r: number) => void): BufferGeometry[] {
  const out: BufferGeometry[] = []
  const n = 2 + Math.floor(R() * 2)
  for (let k = 0; k < n; k++) {
    const rr = r * (0.55 + R() * 0.45)
    const bx = x + (R() - 0.5) * r * 1.6
    const bz = z + (R() - 0.5) * r * 1.6
    out.push(P.sphere(rr, R() > 0.5 ? '#CFC4B8' : '#BDB2A8', { at: [bx, y + rr * 0.3 - 0.35, bz], scale: [1, 0.72, 0.9], rot: [0, R() * 3, 0] }, 10))
    block(bx, bz, rr * 0.92)
  }
  return out
}

// ---------------------------------------------------------------- the day

export type TimeOfDay = 'morning' | 'noon' | 'afternoon' | 'golden' | 'night'
export const TIMES: TimeOfDay[] = ['morning', 'noon', 'afternoon', 'golden', 'night']
/** A look for the time of day (DAY's keys, or a scene's own: the fire show's darker night). */
export interface Key {
  top: string
  mid: string
  horizon: string
  haze: string
  /** Toward the sun (or the moon), and its glow's color. */
  sun: [number, number, number]
  glow: string
  /** The light: ambient and sun colors and how bright (× the house's). */
  amb: string
  ambK: number
  light: string
  lightK: number
  cloud: string
  belly: string
  water: [string, string, string, string, string]
  far: string
  hills: [string, string]
  /** Night lights' glow (0..1). */
  lamps: number
}
export const DAY: Record<TimeOfDay, Key> = {
  morning: { top: '#6FBDF0', mid: '#ACDDF8', horizon: '#FCE9DC', haze: '#E4EEF4', sun: [0.75, 0.32, -0.1], glow: '#FFF0D6', amb: '#FFF4EE', ambK: 1, light: '#FFF1DE', lightK: 0.98, cloud: '#FFFFFF', belly: '#EBDDFF', water: ['#A6F5EA', '#52E2D8', '#1FC9D8', '#119FD6', '#1C7CCB'], far: '#94CBAE', hills: ['#ADBCE6', '#BBC6EC'], lamps: 0 },
  noon: { top: '#5FB8F2', mid: '#9ED6FA', horizon: '#E2F4FD', haze: '#D5EEFA', sun: [0.35, 0.55, 0.76], glow: '#FFFAE6', amb: '#FFF7F0', ambK: 1, light: '#FFF7F0', lightK: 1, cloud: '#FFFFFF', belly: '#E6DDFF', water: ['#A2F6EA', '#4CE4D9', '#17CADB', '#0FA2DA', '#1A7ED0'], far: '#8FC9A8', hills: ['#A9B8E2', '#B7C3EA'], lamps: 0 },
  afternoon: { top: '#5BAFEB', mid: '#A2D3F4', horizon: '#F6EEDC', haze: '#E2E7EA', sun: [-0.55, 0.42, 0.5], glow: '#FFEFCF', amb: '#FFF3E6', ambK: 1, light: '#FFEBD2', lightK: 1, cloud: '#FFFBF4', belly: '#E9D9F4', water: ['#A8F2E2', '#58DDCF', '#25C3D0', '#169DD0', '#1F7CC4'], far: '#93C6A4', hills: ['#B0B5DC', '#BEC0E2'], lamps: 0 },
  golden: { top: '#7F98DE', mid: '#F2B7AA', horizon: '#FFD49A', haze: '#F5CFB2', sun: [-0.9, 0.12, 0.15], glow: '#FFD08A', amb: '#FFE3D3', ambK: 0.92, light: '#FFC994', lightK: 0.95, cloud: '#FFE0CF', belly: '#E6B3C8', water: ['#B2F0DA', '#62D9C9', '#34BDC8', '#2F95C2', '#4874B4'], far: '#A9B79A', hills: ['#B79EC6', '#C7AACB'], lamps: 0.35 },
  night: { top: '#1F1D4A', mid: '#3B3478', horizon: '#7C64A8', haze: '#4E4380', sun: [0.4, 0.5, -0.6], glow: '#D9DCFF', amb: '#A49EE6', ambK: 0.78, light: '#C9D0FF', lightK: 0.45, cloud: '#5E5896', belly: '#3E3878', water: ['#5F8FB0', '#46769E', '#335F8E', '#294B7C', '#22396A'], far: '#3E4A72', hills: ['#3A3770', '#44407A'], lamps: 1 },
}

const lerpHex = (a: string, b: string, k: number, out = new Color()) => out.set(a).lerp(new Color(b), k)

// ---------------------------------------------------------------- the island

export interface Ground {
  /** Ground height (negative under the sea). */
  heightAt(x: number, z: number): number
  /** Meters to the shore (positive at sea). */
  shoreAt(x: number, z: number): number
  /** What's underfoot (from the fine grid; off it: water or forest). */
  surfaceAt(x: number, z: number): Surface
}

export interface Blockers {
  /** Circles near a point (a 4 m hash grid). */
  near(x: number, z: number): readonly [number, number, number][]
  add(x: number, z: number, r: number): void
}

export interface Island {
  root: Group
  ground: Ground
  fine: Terrain
  coarse: Terrain
  lagoon: Lagoon
  blockers: Blockers
  /** The light: the house's lights, colored and dimmed by the day (call after makeLights' follow()). */
  setTime(k: TimeOfDay | Key | { from: TimeOfDay | Key; to: TimeOfDay | Key; k: number }): void
  /** How lit the night lamps should be now (0..1). */
  readonly lamps: number
  /** Hides the plant tiles further than `r` meters from (x, z) (the haze hides the bare hills there). */
  cull(x: number, z: number, r: number): void
  /** More things to hide when far (props.ts's tiles). */
  cullable: { g: Group; x: number; z: number }[]
  /** The sky dome and the stars stay round the camera; the clouds drift. */
  update(dt: number, t: number, camX: number, camZ: number, lights: { ambient: { color: Color; intensity: number }; sun: { color: Color; intensity: number } }): void
}

/** Builds the island. `poked`: places that get their own pokeable plant (kept clear here). */
export function buildIsland(bag: Bag): Island {
  const root = new Group()
  const R = rng(20261104)

  // ---- The ground: fine where she walks, coarse beyond, and the sea's numbers from the coarse one.
  const sample = (x: number, z: number) => groundAt(x, z)
  const coarse = new Terrain({ x0: -275, z0: -205, x1: 105, z1: 520, cell: 2.5, sample, color: groundColor, hole: FINE, chunk: 100 }, bag)
  const fine = new Terrain({ ...FINE, cell: 1.25, chunk: 64, sample, color: groundColor, tag: (x, z) => SURFACES.indexOf(surfaceAt(x, z)) }, bag)
  root.add(coarse.mesh, fine.mesh)
  const ground: Ground = {
    heightAt: (x, z) => (fine.covers(x, z) ? fine.heightAt(x, z) : coarse.heightAt(x, z)),
    shoreAt: (x, z) => (fine.covers(x, z) ? fine.shoreAt(x, z) : coarse.shoreAt(x, z)),
    surfaceAt: (x, z) => (fine.covers(x, z) ? SURFACES[fine.tagAt(x, z)] : coarse.shoreAt(x, z) > 0 ? 'water' : 'forest'),
  }

  const lagoon = new Lagoon(
    { sea: coarse.sea, seaBox: coarse.seaBox, bands: DAY.noon.water, steps: [0.55, 1.9, 4.6, 8.5], haze: DAY.noon.haze, hazeNear: 160, hazeFar: 900, grid: 224, cell: 1.75, caustics: 1 },
    bag,
  )
  root.add(lagoon.near, lagoon.far)

  // ---- Blockers on a hash grid.
  const grid = new Map<number, [number, number, number][]>()
  const key = (i: number, j: number) => (i + 500) * 1000 + (j + 500)
  const blockers: Blockers = {
    add(x, z, r) {
      const i0 = Math.floor((x - r) / 4)
      const i1 = Math.floor((x + r) / 4)
      const j0 = Math.floor((z - r) / 4)
      const j1 = Math.floor((z + r) / 4)
      for (let i = i0; i <= i1; i++)
        for (let j = j0; j <= j1; j++) {
          const k = key(i, j)
          let a = grid.get(k)
          if (!a) grid.set(k, (a = []))
          a.push([x, z, r])
        }
    },
    near(x, z) {
      return grid.get(key(Math.floor(x / 4), Math.floor(z / 4))) ?? []
    },
  }

  // ---- The sky.
  const sky = new Group()
  const skyMat = bag.add(
    new ShaderMaterial({
      uniforms: { uTop: { value: new Color(DAY.noon.top) }, uMid: { value: new Color(DAY.noon.mid) }, uHorizon: { value: new Color(DAY.noon.horizon) }, uSun: { value: new Vector3(...DAY.noon.sun).normalize() }, uGlow: { value: new Color(DAY.noon.glow) }, uNight: { value: 0 } },
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uHorizon; uniform vec3 uSun; uniform vec3 uGlow; uniform float uNight;
        varying vec3 vDir;
        void main() {
          float h = clamp(vDir.y, 0.0, 1.0);
          vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.16, h));
          col = mix(col, uTop, smoothstep(0.16, 0.7, h));
          vec3 d = normalize(vDir);
          float s = max(0.0, dot(d, uSun));
          // The sun's wide glow and its disc; at night a crescent moon instead (the disc with a bite out of it).
          col = mix(col, uGlow, smoothstep(0.75, 1.0, s) * (0.55 - uNight * 0.3));
          float disc = step(0.9975, s);
          vec3 side = normalize(cross(uSun, vec3(0.0, 1.0, 0.0)));
          float bite = step(0.9985, max(0.0, dot(d, normalize(uSun + side * 0.035))));
          col = mix(col, uNight > 0.5 ? vec3(1.0, 0.97, 0.86) : vec3(1.0), disc * (1.0 - bite * uNight));
          gl_FragColor = vec4(col, 1.0);
          #include <colorspace_fragment>
        }`,
      side: BackSide,
      depthWrite: false,
      fog: false,
    }),
  )
  const dome = new Mesh(bag.add(new SphereGeometry(1400, 32, 16)), skyMat)
  dome.renderOrder = -1
  dome.frustumCulled = false
  sky.add(dome)
  // Stars (only at night).
  const starPos: number[] = []
  for (let i = 0; i < 420; i++) {
    const a = R() * Math.PI * 2
    const e = 0.08 + R() * 1.3
    starPos.push(Math.cos(e) * Math.sin(a) * 1300, Math.sin(e) * 1300, Math.cos(e) * Math.cos(a) * 1300)
  }
  const starGeo = bag.add(new BufferGeometry())
  starGeo.setAttribute('position', new Float32BufferAttribute(starPos, 3))
  const starMat = bag.add(new PointsMaterial({ color: '#FFF8E0', size: 2.4, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }))
  const stars = new Points(starGeo, starMat)
  stars.frustumCulled = false
  stars.renderOrder = -1
  sky.add(stars)
  // Clouds: white tops, lavender bellies (two materials, so the day can tint them).
  const cloudMat = bag.add(new MeshToonMaterial({ color: '#ffffff', gradientMap: toonGradient(), fog: false }))
  const bellyMat = bag.add(new MeshToonMaterial({ color: DAY.noon.belly, gradientMap: toonGradient(), fog: false }))
  const clouds = new Group()
  const tops: BufferGeometry[] = []
  const bellies: BufferGeometry[] = []
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + R() * 0.25
    const d = 560 + R() * 300
    const x = Math.sin(a) * d
    const z = Math.cos(a) * d
    const y = 80 + R() * 130
    const s = 16 + R() * 18
    const n = 4 + Math.floor(R() * 3)
    for (let k = 0; k < n; k++) {
      const o = (k - (n - 1) / 2) * s * 0.95
      const r = s * (1 - Math.abs(k - (n - 1) / 2) * 0.16) * (0.8 + R() * 0.35)
      tops.push(P.sphere(r, '#FFFFFF', { at: [x + o * Math.cos(a), y + (k % 2) * r * 0.3, z - o * Math.sin(a)], scale: [1, 0.78, 1] }, 12))
    }
    bellies.push(P.sphere(s * 1.1, '#FFFFFF', { at: [x, y - s * 0.42, z], scale: [n * 0.62, 0.3, 1.6] }, 12))
  }
  clouds.add(new Mesh(bag.add(merge(tops)), cloudMat), new Mesh(bag.add(merge(bellies)), bellyMat))
  sky.add(clouds)
  root.add(sky)

  // ---- The horizon (no fog: they are the haze's own soft colors, retinted through the day).
  const farMats: { m: MeshBasicMaterial; kind: 'far' | 'hill0' | 'hill1' | 'rim' }[] = []
  const far = (kind: 'far' | 'hill0' | 'hill1' | 'rim', c: string) => {
    const m = bag.add(new MeshBasicMaterial({ color: c, fog: false }))
    farMats.push({ m, kind })
    return m
  }
  const isle = (at: XZ, r: number, h: number, kind: 'far' | 'hill0' | 'hill1') => {
    const g = new Group()
    const hump = new Mesh(bag.add(new SphereGeometry(r, 18, 9, 0, Math.PI * 2, 0, Math.PI / 2)), far(kind, kind === 'far' ? DAY.noon.far : DAY.noon.hills[kind === 'hill0' ? 0 : 1]))
    hump.scale.set(1, h / r, 0.7)
    g.add(hump)
    if (kind === 'far') {
      const rim = new Mesh(bag.add(new SphereGeometry(r * 1.06, 18, 4, 0, Math.PI * 2, 0, Math.PI / 2)), far('rim', '#F2EEDC'))
      rim.scale.set(1, 0.05, 0.72)
      g.add(rim)
    }
    g.position.set(at.x, -0.4, at.z)
    return g
  }
  root.add(isle(KO_KUDI, 40, 20, 'far'), isle({ x: KO_KUDI.x + 85, z: KO_KUDI.z + 60 }, 26, 13, 'far'), isle({ x: KO_KUDI.x - 60, z: KO_KUDI.z + 150 }, 30, 15, 'far'))
  for (let i = 0; i < 9; i++) {
    const p = { x: BAN_PHE.x + (i - 4) * 230 + R() * 60, z: BAN_PHE.z - 180 - R() * 160 }
    root.add(isle(p, 150 + R() * 120, 45 + R() * 50, i % 2 ? 'hill0' : 'hill1'))
  }
  // The mainland to the west too (Ao Prao looks at its hills at sunset).
  for (let i = 0; i < 5; i++) root.add(isle({ x: -900 - R() * 200, z: -300 + i * 220 }, 160 + R() * 90, 40 + R() * 40, i % 2 ? 'hill0' : 'hill1'))

  // ---- The plants, by tile.
  const TILE = 40
  const tiles = new Map<string, { lined: BufferGeometry[]; plain: BufferGeometry[] }>()
  const put = (x: number, z: number, gs: BufferGeometry[], plain = false) => {
    const k = `${Math.floor(x / TILE)},${Math.floor(z / TILE)}`
    let a = tiles.get(k)
    if (!a) tiles.set(k, (a = { lined: [], plain: [] }))
    ;(plain ? a.plain : a.lined).push(...gs)
  }
  // Keep the pokeable things' spots (and the stops) clear: those are built on their own.
  const kept = [...POKES.map((p) => ({ ...p.at, r: p.kind === 'palm' || p.kind === 'samet' ? 3 : 2.2 })), ...Object.values(STOPS).map((s) => ({ ...s.at, r: 5 }))]
  const clear = (x: number, z: number) => kept.every((k) => Math.hypot(x - k.x, z - k.z) > k.r)
  const surf = (x: number, z: number) => ground.surfaceAt(x, z)
  // Coconut palms along every beach, at the back of the sand, leaning out to sea.
  for (const b of BEACHES) {
    for (let i = 0; i < b.pts.length; i++) {
      const a = b.pts[i]
      const c = b.pts[(i + 1) % b.pts.length]
      const len = Math.hypot(c.x - a.x, c.z - a.z)
      const n = Math.floor(len / 5)
      for (let k = 0; k < n; k++) {
        const s = (k + R()) / Math.max(1, n)
        const x = a.x + (c.x - a.x) * s
        const z = a.z + (c.z - a.z) * s
        const g = groundAt(x, z)
        if (g.shore > -1) continue
        const out = new Vector3()
        for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
          const sh = ground.shoreAt(x + dx * 3, z + dz * 3)
          out.x += dx * sh
          out.z += dz * sh
        }
        out.normalize()
        const back = SAND_W.beach - 1 - R() * 3.5 + g.shore
        const px = x - out.x * back
        const pz = z - out.z * back
        if (ground.shoreAt(px, pz) > -SAND_W.beach + 3.5 || !clear(px, pz)) continue
        const su = surf(px, pz)
        if (su === 'road' || su === 'path') continue
        const base = new Vector3(px, ground.heightAt(px, pz) - 0.2, pz)
        put(px, pz, palmGeo(R, base, 6 + R() * 3, out.clone().multiplyScalar(0.7 + R() * 0.6)))
        blockers.add(px, pz, 0.38)
      }
    }
  }
  // Forest, samet trees, pandanus, flowers and boulders on a jittered grid over the fine ground; big blobs beyond.
  for (let gi = 0, gx = FINE.x0; gx < FINE.x1; gx += 3.6, gi++)
    for (let gj = 0, gz = FINE.z0; gz < FINE.z1; gz += 3.6, gj++) {
      const x = gx + (R() - 0.5) * 2.8
      const z = gz + (R() - 0.5) * 2.8
      const su = surf(x, z)
      const y = ground.heightAt(x, z)
      const sh = ground.shoreAt(x, z)
      if (su === 'rock' || (su === 'water' && sh < 2.2 && groundAt(x, z).sand < 0.3)) {
        // The granite on the rocky shore (in the shallows too).
        if (R() < 0.7) put(x, z, boulderGeo(R, x, Math.max(y, -0.6), z, 1.0 + R() * 1.4, blockers.add))
        continue
      }
      if (su === 'water') continue
      if (su === 'forest') {
        // Right at the forest's edge: smaller things (samet, pandanus, flowers), so the paths and beaches are hemmed
        // in by something pretty; deeper in, the round green crowns.
        let edge = false
        for (const [dx, dz] of [[3, 0], [-3, 0], [0, 3], [0, -3]] as const) if (surf(x + dx, z + dz) !== 'forest') edge = true
        if (!clear(x, z)) continue
        if (edge) {
          const r = R()
          const nearSand = sh > -SAND_W.beach - 6
          if (r < 0.32) put(x, z, sametGeo(R, x, y, z, 0.85 + R() * 0.4))
          else if (r < 0.55 && nearSand) put(x, z, pandanusGeo(R, x, y, z, 0.8 + R() * 0.3))
          else if (r < 0.75) put(x, z, bushGeo(R, x, y, z, 0.8 + R() * 0.5))
          else put(x, z, forestGeo(R, x, y, z, 1.1 + R() * 0.5))
        } else if (gi % 2 === 0 && gj % 2 === 0) {
          // Deep in the forest: every other spot, bigger crowns (the same canopy for fewer triangles).
          if (noise(x * 0.05, z * 0.05) > 0.68) put(x, z, sametGeo(R, x, y, z, 1.3 + R() * 0.6))
          else put(x, z, forestGeo(R, x, y, z, 2.0 + R() * 1.2))
        }
        continue
      }
      // Walkable ground: tufts of grass and little flowers at the edges of the sand and along the ways (never on them).
      if ((su === 'grass' || su === 'sand') && R() < (su === 'grass' ? 0.55 : 0.12) && clear(x, z)) {
        const g: BufferGeometry[] = []
        for (let k = 0; k < 3; k++) {
          const a = R() * Math.PI * 2
          g.push(P.cone(0.07, 0.45, su === 'sand' ? '#A8CF7B' : '#7FBF62', { at: [x + Math.sin(a) * 0.2, y + 0.18, z + Math.cos(a) * 0.2], rot: [(R() - 0.5) * 0.5, 0, (R() - 0.5) * 0.5] }, 4))
        }
        if (su === 'grass' && R() < 0.5) g.push(P.sphere(0.1, ['#FFFFFF', '#FFD84D', '#FF8FB8'][Math.floor(R() * 3)], { at: [x + 0.25, y + 0.32, z] }, 6))
        put(x, z, g, true)
      }
    }
  // The south half beyond the fine ground: bigger, fewer blobs (seen from the jet ski and from Wong Duan).
  const south: BufferGeometry[] = []
  for (let gx = -270; gx < 100; gx += 10)
    for (let gz = FINE.z1; gz < 500; gz += 10) {
      const x = gx + (R() - 0.5) * 8
      const z = gz + (R() - 0.5) * 8
      const g = groundAt(x, z)
      if (g.shore > -6) continue
      south.push(...forestGeo(R, x, g.h, z, 2.6 + R() * 1.6))
    }
  // The plants sway in the breeze and catch the clouds' shadows (look.ts); the ground twinkles.
  const plantMat = lookMaterial(bag, { plants: true })
  const sway = (g: Group) => {
    for (const c of g.children) if (c instanceof Mesh && !c.userData.hull) {
      c.material = plantMat
      c.userData.sway = true
    }
    return g
  }
  const tileList: { g: Group; x: number; z: number }[] = []
  for (const [k, t] of tiles)
    if (t.lined.length || t.plain.length) {
      const g = sway(solidMix(t.lined, t.plain, bag, 2))
      root.add(g)
      const [i, j] = k.split(',').map(Number)
      tileList.push({ g, x: (i + 0.5) * TILE, z: (j + 0.5) * TILE })
    }
  if (south.length) root.add(sway(solid(merge(south), bag, 2)))
  const groundMat = lookMaterial(bag, { ground: true })
  for (const m of [...fine.meshes, ...coarse.meshes]) m.material = groundMat

  // ---- The day.
  const cur = { lamps: 0 }
  let want: Key = DAY.noon
  const tmpC = new Color()
  const mixKey = (a: Key, b: Key, k: number): Key => {
    const c = (x: string, y: string) => '#' + lerpHex(x, y, k, tmpC).getHexString()
    return {
      top: c(a.top, b.top),
      mid: c(a.mid, b.mid),
      horizon: c(a.horizon, b.horizon),
      haze: c(a.haze, b.haze),
      sun: [0, 1, 2].map((i) => a.sun[i] + (b.sun[i] - a.sun[i]) * k) as [number, number, number],
      glow: c(a.glow, b.glow),
      amb: c(a.amb, b.amb),
      ambK: a.ambK + (b.ambK - a.ambK) * k,
      light: c(a.light, b.light),
      lightK: a.lightK + (b.lightK - a.lightK) * k,
      cloud: c(a.cloud, b.cloud),
      belly: c(a.belly, b.belly),
      water: a.water.map((w, i) => c(w, b.water[i])) as Key['water'],
      far: c(a.far, b.far),
      hills: [c(a.hills[0], b.hills[0]), c(a.hills[1], b.hills[1])],
      lamps: a.lamps + (b.lamps - a.lamps) * k,
    }
  }
  const apply = (k: Key) => {
    const u = skyMat.uniforms
    ;(u.uTop.value as Color).set(k.top)
    ;(u.uMid.value as Color).set(k.mid)
    ;(u.uHorizon.value as Color).set(k.horizon)
    ;(u.uGlow.value as Color).set(k.glow)
    ;(u.uSun.value as Vector3).set(...k.sun).normalize()
    u.uNight.value = k.lamps > 0.9 ? 1 : 0
    starMat.opacity = Math.max(0, k.lamps - 0.5) * 2
    cloudMat.color.set(k.cloud)
    bellyMat.color.set(k.belly)
    lagoon.setHaze(k.haze)
    lagoon.setBands(k.water, k.lamps > 0.9 ? '#D6E2FF' : '#FFFFFF')
    for (const f of farMats) f.m.color.set(f.kind === 'far' ? k.far : f.kind === 'rim' ? (k.lamps > 0.9 ? '#6A6A9A' : '#F2EEDC') : k.hills[f.kind === 'hill0' ? 0 : 1])
    cur.lamps = k.lamps
    want = k
  }
  apply(DAY.noon)

  return {
    root,
    ground,
    fine,
    coarse,
    lagoon,
    blockers,
    get lamps() {
      return cur.lamps
    },
    cullable: tileList,
    cull(x, z, r) {
      for (const c of tileList) c.g.visible = Math.hypot(c.x - x, c.z - z) < r + TILE * 0.71
    },
    setTime(t) {
      const key = (x: TimeOfDay | Key) => (typeof x === 'string' ? DAY[x] : x)
      apply(typeof t === 'string' ? DAY[t] : 'from' in t ? mixKey(key(t.from), key(t.to), t.k) : t)
    },
    update(dt, t, cx, cz, lights) {
      LOOK.uTime.value = t
      LOOK.uShade.value = want.lamps > 0.9 ? 0 : 1
      sky.position.set(cx, 0, cz)
      clouds.rotation.y += dt * 0.003
      lights.ambient.color.set(want.amb)
      lights.ambient.intensity *= want.ambK
      lights.sun.color.set(want.light)
      lights.sun.intensity *= want.lightK
    },
  }
}

/** A soft additive glow (fairy lights, lanterns, the moon on the water at night). */
export function glowMaterial(bag: Bag, c: ColorRepresentation) {
  return bag.add(new MeshBasicMaterial({ color: c, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, fog: false }))
}

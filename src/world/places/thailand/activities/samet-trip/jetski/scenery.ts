// Sai Kaew's scenery for the jet ski greybox, built from code in the toon look (no generated art): the island's ground
// from the real coastline (island/ground.ts), the lagoon water, a sunny sky with fat clouds, Ko Kudi and its little
// neighbors on the eastern horizon and the mainland's blue hills to the north, coconut palms leaning out over the
// crystal sand, samet trees and forest up the hill, granite boulders on the headlands, the pink umbrellas and red
// chairs, the jet ski hut with its bell, and the mermaid on her rocks at the beach's south-west end. Plan:
// planning/around-the-world/thailand/samet-trip.html ("The look"). Greybox 2 lifts the island-wide parts out of here.
import { BackSide, Color, Euler, Group, Matrix4, Mesh, MeshBasicMaterial, MeshToonMaterial, Quaternion, ShaderMaterial, SphereGeometry, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid, type V3 } from '../../../../../engine3d/geo'
import { Lagoon } from '../../../../../engine3d/lagoon'
import { Terrain } from '../../../../../engine3d/terrain'
import { PAL, toonGradient } from '../../../../../engine3d/toon'
import { groundAt, groundColor, noise, SAND_W } from '../island/ground'
import { BAN_PHE, bay, BEACHES, FAR_BUOY, HUT, KO_KUDI, PLACES, RACE, toBay, UMBRELLAS, type XZ } from '../island/layout'

export const SKY = { top: '#5FB8F2', mid: '#9ED6FA', horizon: '#E2F4FD', haze: '#D5EEFA' }

const up = new Vector3(0, 1, 0)
const q = new Quaternion()
const m4 = new Matrix4()
/** A part moved by a whole matrix (bake's Euler angles can't lean a palm frond). */
function xf(g: BufferGeometry, pos: Vector3, quat: Quaternion, s = 1) {
  return g.applyMatrix4(m4.compose(pos, quat, new Vector3(s, s, s)))
}
/** A cylinder from a to b. */
function stick(a: Vector3, b: Vector3, r0: number, r1: number, c: string, seg = 8) {
  const d = b.clone().sub(a)
  const g = P.cyl(r1, r0, d.length(), c, {}, seg)
  return xf(g, a.clone().add(b).multiplyScalar(0.5), q.clone().setFromUnitVectors(up, d.normalize()))
}
const rng = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

export interface Scenery {
  root: Group
  terrain: Terrain
  lagoon: Lagoon
  sky: Group
  /** The bell on the hut's front post (it swings on its own pivot). */
  bell: Group
  /** The big orange buoy, and the two pink flag buoys at the finish (they bob). */
  farBuoy: Group
  flags: Group[]
  /** The umbrellas' canopies (a tap spins one). */
  umbrellas: Group[]
  mermaid: Group
  /** The far horizon's pieces stay put; the clouds drift (update). */
  update(dt: number, t: number, x: number, z: number): void
}

export function buildScenery(bag: Bag): Scenery {
  const root = new Group()
  const R = rng(20261104)

  // ---- The island and the sea.
  const terrain = new Terrain(
    {
      x0: -275,
      z0: -205,
      x1: 105,
      z1: 520,
      cell: 2.5,
      sample: (x, z) => groundAt(x, z),
      color: groundColor,
    },
    bag,
  )
  root.add(terrain.mesh)
  const lagoon = new Lagoon(
    {
      sea: terrain.sea,
      seaBox: terrain.seaBox,
      bands: ['#9DF0E2', '#62DDD3', '#38C8D4', '#24AED6', '#2190D0'],
      steps: [0.8, 2.6, 5.5, 9.5],
      haze: SKY.haze,
      hazeNear: 160,
      hazeFar: 900,
      grid: 224,
      cell: 1.4,
    },
    bag,
  )
  root.add(lagoon.near, lagoon.far)

  // ---- The sky: a gradient dome with the sun's glow, and fat toon clouds with lavender bellies.
  const sky = new Group()
  const skyMat = bag.add(
    new ShaderMaterial({
      uniforms: { uTop: { value: new Color(SKY.top) }, uMid: { value: new Color(SKY.mid) }, uHorizon: { value: new Color(SKY.horizon) }, uSun: { value: new Vector3(0.35, 0.55, 0.76).normalize() } },
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uHorizon; uniform vec3 uSun;
        varying vec3 vDir;
        void main() {
          float h = clamp(vDir.y, 0.0, 1.0);
          vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.16, h));
          col = mix(col, uTop, smoothstep(0.16, 0.7, h));
          float s = max(0.0, dot(normalize(vDir), uSun));
          col = mix(col, vec3(1.0, 0.98, 0.9), smoothstep(0.82, 1.0, s) * 0.55);
          col = mix(col, vec3(1.0), step(0.9975, s));
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
  const cloudMat = bag.add(new MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: toonGradient(), fog: false }))
  const clouds = new Group()
  const puffs: BufferGeometry[] = []
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + R() * 0.25
    const d = 620 + R() * 260
    const x = Math.sin(a) * d
    const z = Math.cos(a) * d
    const y = 90 + R() * 110
    const s = 16 + R() * 16
    const n = 4 + Math.floor(R() * 3)
    for (let k = 0; k < n; k++) {
      const o = (k - (n - 1) / 2) * s * 0.95
      const r = s * (1 - Math.abs(k - (n - 1) / 2) * 0.16) * (0.8 + R() * 0.35)
      puffs.push(P.sphere(r, '#FFFFFF', { at: [x + o * Math.cos(a), y + (k % 2) * r * 0.3, z - o * Math.sin(a)], scale: [1, 0.78, 1] }, 12))
    }
    puffs.push(P.sphere(s * 1.1, '#E6DDFF', { at: [x, y - s * 0.42, z], scale: [n * 0.62, 0.3, 1.6] }, 12))
  }
  clouds.add(new Mesh(bag.add(merge(puffs)), cloudMat))
  sky.add(clouds)
  root.add(sky)

  // ---- The horizon: Ko Kudi and its neighbors to the east, the mainland's blue hills to the north (no fog: they are
  // the haze's own soft colors).
  const far = (c: string) => bag.add(new MeshBasicMaterial({ color: c, fog: false }))
  const isle = (at: XZ, r: number, h: number, c = '#8FC9A8') => {
    const g = new Group()
    const hump = new Mesh(bag.add(new SphereGeometry(r, 18, 9, 0, Math.PI * 2, 0, Math.PI / 2)), far(c))
    hump.scale.set(1, h / r, 0.7)
    const rim = new Mesh(bag.add(new SphereGeometry(r * 1.06, 18, 4, 0, Math.PI * 2, 0, Math.PI / 2)), far('#F2EEDC'))
    rim.scale.set(1, 0.05, 0.72)
    g.add(hump, rim)
    g.position.set(at.x, -0.4, at.z)
    return g
  }
  root.add(isle(KO_KUDI, 40, 20), isle({ x: KO_KUDI.x + 85, z: KO_KUDI.z + 60 }, 26, 13, '#9ACDB2'), isle({ x: KO_KUDI.x - 60, z: KO_KUDI.z + 150 }, 30, 15, '#A3D1BA'))
  for (let i = 0; i < 9; i++) {
    const at = { x: BAN_PHE.x + (i - 4) * 230 + R() * 60, z: BAN_PHE.z - 180 - R() * 160 }
    root.add(isle(at, 150 + R() * 120, 45 + R() * 50, i % 2 ? '#A9B8E2' : '#B7C3EA'))
  }

  // ---- Coconut palms along the back of the sand (leaning out to sea), samet trees and forest up the hill, boulders on
  // the rocky shore. All merged: one mesh and one outline per kind.
  const palms: BufferGeometry[] = []
  const trees: BufferGeometry[] = []
  const rocks: BufferGeometry[] = []
  const palm = (x: number, z: number, h: number, lean: Vector3) => {
    const base = new Vector3(x, groundAt(x, z).h - 0.2, z)
    const pts: Vector3[] = []
    for (let i = 0; i <= 6; i++) {
      const s = i / 6
      pts.push(base.clone().add(new Vector3(lean.x * h * 0.34 * s * s, h * s, lean.z * h * 0.34 * s * s)))
    }
    for (let i = 0; i < 6; i++) palms.push(stick(pts[i], pts[i + 1], 0.2 - i * 0.012, 0.19 - (i + 1) * 0.012, i % 2 ? '#C9A57A' : '#BD9870', 7))
    const top = pts[6]
    palms.push(P.sphere(0.26, '#A98A62', { at: [top.x, top.y, top.z] }, 8))
    const leaf = (): BufferGeometry => P.prism([[0, 0], [0.42, 0.7], [0.3, 1.9], [0, 2.9], [-0.3, 1.9], [-0.42, 0.7]], 0.05, '#ffffff')
    const n = 8
    const spin = R() * Math.PI
    for (let k = 0; k < n; k++) {
      const yaw = spin + (k / n) * Math.PI * 2
      const droop = 0.55 + (k % 2) * 0.35 + R() * 0.2
      const g = leaf()
      // (Color per frond: alternate two greens.)
      const c = new Color(k % 2 ? '#5DB85F' : '#74C96A')
      const col = g.attributes.color
      for (let v = 0; v < col.count; v++) col.setXYZ(v, c.r, c.g, c.b)
      const rot = new Quaternion().setFromEuler(new Euler(Math.PI / 2 + droop * 0.6 - 0.15, yaw, 0, 'YXZ'))
      palms.push(xf(g, top.clone().add(new Vector3(0, 0.05, 0)), rot))
    }
    for (let k = 0; k < 3; k++) {
      const a = spin + k * 2.1
      palms.push(P.sphere(0.17, '#8A6A3E', { at: [top.x + Math.sin(a) * 0.25, top.y - 0.28, top.z + Math.cos(a) * 0.25] }, 8))
    }
  }
  const samet = (x: number, z: number, s: number) => {
    const y = groundAt(x, z).h
    const tones = ['#9CC79A', '#8CBF8B', '#A9D3A0', '#7FB98A']
    trees.push(P.cyl(0.14 * s, 0.2 * s, 2.2 * s, '#EDE6D8', { at: [x, y + 1.1 * s, z] }, 6))
    const n = 2 + Math.floor(R() * 2)
    for (let k = 0; k < n; k++) {
      const a = R() * Math.PI * 2
      trees.push(P.sphere(s * (1.1 + R() * 0.5), tones[Math.floor(R() * tones.length)], { at: [x + Math.sin(a) * s * 0.7, y + 2.6 * s + R() * s * 0.8, z + Math.cos(a) * s * 0.7], scale: [1, 0.85, 1] }, 9))
    }
  }
  const forest = (x: number, z: number, s: number) => {
    const y = groundAt(x, z).h
    const tones = ['#5FAE63', '#6DB463', '#55A35E', '#79BD6B']
    trees.push(P.sphere(s * 1.6, tones[Math.floor(R() * tones.length)], { at: [x, y + s * 1.2, z], scale: [1, 0.9, 1] }, 9))
    trees.push(P.sphere(s * 1.1, tones[Math.floor(R() * tones.length)], { at: [x + s * 0.8, y + s * 2.1, z - s * 0.3], scale: [1, 0.9, 1] }, 8))
  }
  // Palms: along every beach, at the back of the sand (most of them round Sai Kaew, where she rides).
  for (const b of BEACHES) {
    for (let i = 0; i < b.pts.length; i++) {
      const a = b.pts[i]
      const c = b.pts[(i + 1) % b.pts.length]
      const len = Math.hypot(c.x - a.x, c.z - a.z)
      const n = Math.floor(len / 5.5)
      for (let k = 0; k < n; k++) {
        const s = (k + R()) / Math.max(1, n)
        const x = a.x + (c.x - a.x) * s
        const z = a.z + (c.z - a.z) * s
        const g = groundAt(x, z)
        if (g.shore > -1) continue
        // Inland to the back of the sand, then lean out toward the water.
        const out = new Vector3(0, 0, 0)
        for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) out.x += dx * groundAt(x + dx * 3, z + dz * 3).shore, out.z += dz * groundAt(x + dx * 3, z + dz * 3).shore
        out.normalize()
        const back = SAND_W.beach - 1 - R() * 3 - -g.shore
        const px = x - out.x * back
        const pz = z - out.z * back
        if (groundAt(px, pz).shore > -SAND_W.beach + 3.5) palm(px, pz, 6 + R() * 3, out.clone().multiplyScalar(0.7 + R() * 0.6))
      }
    }
  }
  // Trees and boulders on a jittered grid over the north half of the island (where she can see from the bay).
  for (let gx = -270; gx < 100; gx += 8)
    for (let gz = -200; gz < 300; gz += 8) {
      // Dense near Sai Kaew (where she rides), every other spot farther off, as bigger blobs.
      const farOff = Math.hypot(gx - 8, gz + 4) > 130
      if (farOff && (Math.round(gx / 8) + Math.round(gz / 8)) % 3 !== 0) continue
      const x = gx + (R() - 0.5) * 6
      const z = gz + (R() - 0.5) * 6
      const g = groundAt(x, z)
      const d = -g.shore
      const W = SAND_W.rock + (SAND_W.beach - SAND_W.rock) * g.sand
      if (d > -1.5 && d < 2.2 && g.sand < 0.3) {
        // The granite on the rocky shore: two or three round boulders in a heap.
        for (let k = 0; k < 2 + Math.floor(R() * 2); k++) {
          const r = 0.9 + R() * 1.6
          rocks.push(P.sphere(r, R() > 0.5 ? '#C9BFB4' : '#B8AEA5', { at: [x + (R() - 0.5) * 3, g.h + r * 0.3 - 0.4, z + (R() - 0.5) * 3], scale: [1, 0.72, 0.9], rot: [0, R() * 3, 0] }, 10))
        }
        continue
      }
      if (d < W + 1.5) continue
      if (R() < 0.12) continue
      if (d < W + 9 && g.sand > 0.4) samet(x, z, 0.9 + R() * 0.5)
      else if (noise(x * 0.05, z * 0.05) > 0.62) samet(x, z, 1.1 + R() * 0.6)
      else forest(x, z, (1.6 + R() * 1.2) * (farOff ? 1.6 : 1))
    }
  root.add(solid(merge(palms), bag, 2), solid(merge(trees), bag, 2), solid(merge(rocks), bag, 2))

  // ---- The beach: pink umbrellas and red chairs along the sand.
  const umbrellas: Group[] = []
  const beach: BufferGeometry[] = []
  UMBRELLAS.forEach((p, i) => {
    const at = bay(p.u, p.v)
    const y = groundAt(at.x, at.z).h
    const c = [PAL.pink, '#FFFFFF', PAL.hotpink, '#FFD0E2'][i % 4]
    beach.push(P.cyl(0.05, 0.05, 2.3, '#F4EEE6', { at: [at.x, y + 1.15, at.z] }, 6))
    const u = new Group()
    const canopy = merge([P.cone(1.55, 0.6, c, { at: [0, 0, 0] }, 10), P.sphere(0.09, '#FFFFFF', { at: [0, 0.34, 0] }, 8), P.cone(1.56, 0.08, i % 2 ? PAL.pink : '#FFFFFF', { at: [0, -0.3, 0] }, 10)])
    u.add(solid(canopy, bag, 2))
    u.position.set(at.x, y + 2.45, at.z)
    root.add(u)
    umbrellas.push(u)
    // Two loungers in front of it (toward the sea), red and white like the sunset beach.
    const n = { x: Math.sin(0.31), z: Math.cos(0.31) }
    for (const side of [-0.7, 0.7]) {
      const lx = at.x + n.x * 1.4 + Math.cos(0.31) * side
      const lz = at.z + n.z * 1.4 - Math.sin(0.31) * side
      const ly = groundAt(lx, lz).h
      const col = i % 2 ? '#F0596B' : '#FFFFFF'
      beach.push(P.rbox(0.6, 0.12, 1.7, 0.05, col, { at: [lx, ly + 0.36, lz], rot: [0, 0.31, 0] }))
      beach.push(P.rbox(0.6, 0.12, 0.7, 0.05, col, { at: [lx - n.x * 0.95, ly + 0.62, lz - n.z * 0.95], rot: [-0.9, 0.31, 0] }))
      beach.push(P.box(0.06, 0.3, 0.06, '#D7CFC6', { at: [lx + n.x * 0.6, ly + 0.15, lz + n.z * 0.6] }))
      beach.push(P.box(0.06, 0.3, 0.06, '#D7CFC6', { at: [lx - n.x * 0.6, ly + 0.15, lz - n.z * 0.6] }))
    }
  })

  // ---- The jet ski hut on the sand: posts, a thatch roof, a striped counter, life jackets hanging, and the bell.
  const hy = groundAt(HUT.x, HUT.z).h
  const hut: BufferGeometry[] = []
  const face = 0.31
  const local = (lx: number, ly: number, lz: number): V3 => [HUT.x + Math.cos(face) * lx + Math.sin(face) * lz, hy + ly, HUT.z - Math.sin(face) * lx + Math.cos(face) * lz]
  for (const [lx, lz] of [[-1.8, -1.4], [1.8, -1.4], [-1.8, 1.4], [1.8, 1.4]]) hut.push(P.cyl(0.09, 0.11, 2.6, '#B98A5E', { at: local(lx, 1.3, lz) }, 7))
  hut.push(P.rbox(3.9, 0.16, 3.2, 0.04, '#D8B48A', { at: local(0, 0.1, 0), rot: [0, face, 0] }))
  hut.push(P.cone(3.3, 1.5, '#E3C27F', { at: local(0, 3.25, 0), rot: [0, face + Math.PI / 4, 0] }, 4))
  hut.push(P.cone(3.0, 0.2, '#CDA96A', { at: local(0, 2.55, 0), rot: [0, face + Math.PI / 4, 0] }, 4))
  hut.push(P.rbox(3.2, 0.95, 0.5, 0.06, '#FFFFFF', { at: local(0, 0.65, 1.2), rot: [0, face, 0] }))
  hut.push(P.box(3.22, 0.14, 0.52, '#F0596B', { at: local(0, 0.78, 1.2), rot: [0, face, 0] }))
  hut.push(P.box(3.22, 0.08, 0.52, PAL.gold, { at: local(0, 0.6, 1.2), rot: [0, face, 0] }))
  for (let k = 0; k < 4; k++) hut.push(P.rbox(0.42, 0.55, 0.16, 0.06, k % 2 ? '#FF9A3D' : PAL.pink, { at: local(-1.3 + k * 0.42, 1.9, -1.35), rot: [0, face, 0] }))
  root.add(solid(merge(hut), bag, 2))
  const bell = new Group()
  bell.add(solid(merge([P.cone(0.26, 0.42, PAL.gold, { at: [0, -0.28, 0] }, 14), P.sphere(0.07, '#B08A2E', { at: [0, -0.5, 0] }, 8), P.torus(0.06, 0.02, '#B08A2E', { at: [0, -0.04, 0] })]), bag, 2))
  bell.position.set(...local(1.8, 2.45, 1.75))
  root.add(bell)

  // ---- The mermaid on her rocks (the poem's mermaid, Sunthorn Phu's: a stone statue, verdigris green).
  const mermaid = new Group()
  const mp = PLACES.mermaid
  const my = Math.max(0, groundAt(mp.x, mp.z).h)
  const stone = '#9DBDB3'
  mermaid.add(
    solid(
      merge([
        P.sphere(2.2, '#C9BFB4', { at: [0, 0.4, 0], scale: [1.3, 0.7, 1] }, 12),
        P.sphere(1.5, '#B8AEA5', { at: [1.6, 0.2, 0.9], scale: [1, 0.7, 1] }, 10),
        P.capsule(0.42, 0.7, stone, { at: [0, 2.3, 0], rot: [0.1, 0, 0] }),
        P.sphere(0.42, stone, { at: [0, 3.35, 0.05] }, 14),
        P.sphere(0.46, '#87A99F', { at: [0, 3.45, -0.12], scale: [1, 1, 1.05] }, 12),
        P.capsule(0.32, 0.9, stone, { at: [0.55, 1.6, 0.35], rot: [1.25, 0, -0.35] }),
        P.capsule(0.24, 0.5, stone, { at: [1.05, 1.35, 1.05], rot: [1.6, 0, -0.9] }),
        P.prism([[0, 0], [0.55, 0.45], [0.25, 0.05], [0.55, -0.4]], 0.12, stone, { at: [1.35, 1.25, 1.5], rot: [0, 0.6, 0] }),
        P.capsule(0.1, 0.55, stone, { at: [-0.42, 2.45, 0.2], rot: [0.3, 0, 0.6] }),
        P.capsule(0.1, 0.55, stone, { at: [0.42, 2.45, 0.2], rot: [0.3, 0, -0.6] }),
      ]),
      bag,
      2,
    ),
  )
  mermaid.position.set(mp.x, my - 0.4, mp.z)
  mermaid.rotation.y = 0.3
  root.add(mermaid)

  // ---- The buoys: the big orange one the race goes round, and the two pink flags at the finish.
  const buoy = (c: string, r: number, flag?: string) => {
    const g = new Group()
    const parts = [P.sphere(r, c, { at: [0, r * 0.35, 0] }, 16), P.torus(r * 0.98, r * 0.12, '#FFFFFF', { at: [0, r * 0.5, 0], rot: [Math.PI / 2, 0, 0] })]
    if (flag) parts.push(P.cyl(0.04, 0.04, 2.2, '#FFFFFF', { at: [0, r + 1.0, 0] }, 6), P.prism([[0, 0], [0.9, -0.3], [0, -0.6]], 0.03, flag, { at: [0.03, r + 2.05, 0] }))
    g.add(solid(merge(parts), bag, 2))
    return g
  }
  const farBuoy = buoy('#FF8A2E', 1.4, PAL.hotpink)
  farBuoy.position.set(FAR_BUOY.x, 0, FAR_BUOY.z)
  root.add(farBuoy)
  const flags = [RACE.finish.w, RACE.finish.e].map((u) => {
    const b = buoy(PAL.pink, 0.55, PAL.hotpink)
    const p = bay(u, RACE.finish.v)
    b.position.set(p.x, 0, p.z)
    root.add(b)
    return b
  })
  root.add(solid(merge(beach), bag, 2))

  return {
    root,
    terrain,
    lagoon,
    sky,
    bell,
    farBuoy,
    flags,
    umbrellas,
    mermaid,
    update(dt, _t, x, z) {
      sky.position.set(x, 0, z)
      clouds.rotation.y += dt * 0.003
    },
  }
}

/** The beach frame helper for whoever places things on the sand. */
export { toBay }

// The floating board: where the game table's games are played. Once she sits on her stool the screen fades, and the
// board is out on a little floating island in a pastel sky, with no characters in sight (the cousin plays from their
// face at the side of the screen). Under the board: a grass top with a pink dice tray in front, a strata rock
// underneath that tapers to a point (pink, lilac, lavender) with crystals hanging off it. Round the board, each game
// dresses the island its own way (a rainbow and cotton-candy trees for the Unicorn game, lollipops, candy canes and
// gumdrops for Candy Land, swings, a sandbox and a seesaw for Chutes and Ladders), and every prop wobbles and
// makes a sound when she taps it. Round the island: clouds drifting past below and around, little islands bobbing far
// off, two striped hot-air balloons rising, and twinkles in the air.
//
// The finish (2026-11-12, "really polish the game scenes"): the grass is painted (mown stripes, tufts, clover), the
// island's side is a wall of pastel stone blocks with vines hanging down it, everything standing on the grass throws a
// soft shadow, the pond has lily pads, reeds and a foamy lip, the far islands are little places (a cottage with a
// smoking chimney, a windmill that turns, a tower with a flag), butterflies flutter round the edges, and the line
// round it all is a soft plum instead of ink (look.ts).
//
// It isn't a second scene: it's drawn in the house's own scene, on its own camera layer (STAGE_LAYER), right where the
// table top is. The plugin switches the house camera (and its taps) to that layer, so the house and everyone in it
// vanish and only the stage shows; the board, the pieces and the die keep the table top's space exactly as before.
// The island hangs off the table top (`top`), so its gentle bob carries the board and pieces with it; the sky is in
// the world, round the table top's place.
import { BufferAttribute, BufferGeometry, CanvasTexture, Color, CylinderGeometry, DoubleSide, Fog, Group, Mesh, MeshBasicMaterial, PlaneGeometry, Points, PointsMaterial, Shape, ShapeGeometry, SphereGeometry, Sprite, SpriteMaterial, RepeatWrapping, SRGBColorSpace, Vector3, type Object3D, type Scene, type Texture } from 'three'
import { makeLights, PAL } from '../../../../../engine3d/toon'
import type { Bag } from '../../../../../engine3d/dispose'
import { bake, merge, P } from '../../../../../engine3d/geo'
import { TUNE } from '../../../../../engine3d/tune'
import type { GameId } from './list'
import { paintedMaterial, rng, shadows, toy, type Shade } from './look'
import { unicornParts } from './pieces'

/** The camera layer the stage is drawn on (the house is on layer 0). */
export const STAGE_LAYER = 3

/** Every mesh under `o` on the stage's layer only. */
export function onStage(o: Object3D) {
  o.traverse((c) => c.layers.set(STAGE_LAYER))
}

const GRASS = '#A9E59B'
const GRASS_DARK = '#8FD68A'
const GRASS_LIGHT = '#C2F0AE'
/** The stone blocks of the island's side. */
const STONES = ['#FFC9DA', '#F9B4CD', '#F2A3C6', '#FFD6E2', '#E9B3DC']
const SOIL = '#FBCBA8'
/** The rock's strata, top to bottom. */
const STRATA = ['#F9B8CB', '#F2A6C9', '#DDB0EE', '#C6B4F6', '#AE9FEA']
const TRUNK = '#D8A983'
const CLOUD = '#FFFFFF'
const CLOUD_UNDER = '#EADFFF'
const FOG = '#FBDDEC'

/** The island's top, in the table top's space (x across, z toward the camera): the board (0.6 x 0.72) in the middle,
 *  a margin round it for the props, more in front for the die. */
const ISLAND = { w: 1.08, d: 1.22, z: 0.04 }
/** The pond in the front-right corner, its waterfall pouring off the island's front edge. */
const POND = { x: 0.33, z: 0.565, r: 0.062 }

/** A smooth bump field from a position (the same corner of the rock always gets the same dent). */
const hash = (x: number, y: number, z: number) => Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453 - Math.floor(Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453)

/** The rock under the island: a faceted cone tapering to a point, its vertices pushed in and out, colored in strata
 *  by height (with a ragged edge between bands). */
function rock(rx: number, rz: number, h: number, colors: string[], o: { at: [number, number, number]; seed?: number; seg?: number }): BufferGeometry {
  const seed = o.seed ?? 1
  const g = new CylinderGeometry(1, 1, h, o.seg ?? 11, 7)
  const pos = g.attributes.position as BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const top = y > h / 2 - 1e-4
    // Round-bellied, then tapering to a point (so it shows under the island's edge from above).
    const v = (h / 2 - y) / h
    const vv = Math.min(1, Math.max(0, v))
    const f = Math.max(0.03, Math.pow(1 - vv, 0.85) * (1 + 0.3 * Math.sin(vv * Math.PI)))
    const k = top ? 1 : f * (0.84 + 0.32 * hash(Math.round(x * 50) + seed, Math.round(y * 50), Math.round(z * 50)))
    pos.setXYZ(i, x * rx * k, y, z * rz * k)
  }
  const geo = bake(g, colors[0], { at: o.at })
  geo.computeVertexNormals()
  const col = geo.attributes.color as BufferAttribute
  const p = geo.attributes.position as BufferAttribute
  const c = new Color()
  const y0 = o.at[1] + h / 2
  for (let i = 0; i < p.count; i += 3) {
    // One band per triangle (by its middle), so the bands have facet edges like painted rock.
    const my = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3
    const mx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3
    const f = Math.min(0.999, Math.max(0, (y0 - my) / h + (hash(mx * 9, my * 9, seed) - 0.5) * 0.12))
    c.set(colors[Math.floor(Math.pow(f, 0.6) * colors.length)])
    for (let j = 0; j < 3; j++) col.setXYZ(i + j, c.r, c.g, c.b)
  }
  return geo
}

/** A puffy cloud: overlapping balls, white on top and a soft lilac underneath. */
function cloudParts(size: number, seed: number): BufferGeometry[] {
  const r = rng(seed)
  const n = 5 + Math.floor(r() * 3)
  const parts: BufferGeometry[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / (n - 1) - 0.5) * 2
    const rad = size * (0.32 + 0.22 * (1 - Math.abs(a)) + r() * 0.08)
    parts.push(P.sphere(rad, CLOUD, { at: [a * size * 0.62, rad * 0.35 + (1 - Math.abs(a)) * size * 0.1, (r() - 0.5) * size * 0.35], scale: [1, 0.82, 0.9] }, 14))
  }
  // A flat base, so it sits like a cartoon cloud.
  parts.push(P.sphere(size * 0.55, CLOUD_UNDER, { at: [0, 0, 0], scale: [1.45, 0.32, 0.7] }, 14))
  return parts
}

/** A round tree: a trunk and two or three balls of leaves. */
function tree(x: number, z: number, h: number, leaf: string, leaf2: string, r = 1): BufferGeometry[] {
  return [
    P.cyl(0.011 * r, 0.016 * r, h * 0.55, TRUNK, { at: [x, h * 0.275, z] }, 8),
    P.sphere(0.055 * r, leaf, { at: [x, h * 0.62, z] }, 12),
    P.sphere(0.04 * r, leaf2, { at: [x + 0.028 * r, h * 0.78, z + 0.01] }, 12),
    P.sphere(0.036 * r, leaf, { at: [x - 0.03 * r, h * 0.74, z - 0.006] }, 12),
  ]
}
/** A pine: three stacked cones. */
function pine(x: number, z: number, h: number, c: string): BufferGeometry[] {
  return [P.cyl(0.01, 0.012, h * 0.25, TRUNK, { at: [x, h * 0.125, z] }, 8), ...[0, 1, 2].map((i) => P.cone(0.05 - i * 0.012, h * 0.42, c, { at: [x, h * (0.38 + i * 0.2), z] }, 9))]
}
/** A little pastel cottage with a pointy roof, a door and a window. */
function cottage(x: number, z: number, wall: string, roof: string, rotY = 0): BufferGeometry[] {
  const w = 0.085
  const d = 0.075
  const h = 0.065
  const parts = [
    P.rbox(w, h, d, 0.008, wall, { at: [0, h / 2, 0] }),
    P.prism(
      [
        [-w / 2 - 0.012, 0],
        [w / 2 + 0.012, 0],
        [0, 0.055],
      ],
      d + 0.016,
      roof,
      { at: [0, h, 0] },
    ),
    P.rbox(0.022, 0.034, 0.006, 0.004, '#C98B6B', { at: [0, 0.017, d / 2 + 0.002] }),
    P.rbox(0.018, 0.018, 0.006, 0.003, PAL.sky, { at: [0.026, 0.042, d / 2 + 0.002] }),
    // A cream chimney with its cap, and a round window in the gable.
    P.rbox(0.016, 0.04, 0.016, 0.003, PAL.cream, { at: [-0.024, h + 0.034, -0.012] }),
    P.rbox(0.021, 0.006, 0.021, 0.002, roof, { at: [-0.024, h + 0.056, -0.012] }),
    P.cyl(0.008, 0.008, 0.004, PAL.butter, { at: [0, h + 0.018, d / 2 + 0.008], rot: [Math.PI / 2, 0, 0] }, 10),
    // A flower box under the window and a doorstep.
    P.rbox(0.026, 0.006, 0.008, 0.002, '#FFFFFF', { at: [0.026, 0.03, d / 2 + 0.005] }),
    ...[-1, 0, 1].map((i) => P.sphere(0.004, i ? PAL.hotpink : PAL.butter, { at: [0.026 + i * 0.008, 0.035, d / 2 + 0.006] }, 6)),
    P.rbox(0.03, 0.005, 0.014, 0.002, PAL.cream, { at: [0, 0.0025, d / 2 + 0.008] }),
  ]
  const g = merge(parts)
  g.rotateY(rotY)
  g.translate(x, 0, z)
  return [g]
}
/** A mushroom: a stem and a spotty cap. */
function mushroom(x: number, z: number, s: number, cap: string): BufferGeometry[] {
  return [
    P.cyl(0.011 * s, 0.014 * s, 0.03 * s, PAL.cream, { at: [x, 0.015 * s, z] }, 10),
    P.sphere(0.026 * s, cap, { at: [x, 0.03 * s, z], scale: [1, 0.62, 1] }, 12),
    ...[0, 2.1, 4.2].map((a) => P.sphere(0.0055 * s, '#FFFFFF', { at: [x + Math.cos(a) * 0.016 * s, 0.043 * s, z + Math.sin(a) * 0.016 * s] }, 6)),
  ]
}
/** A lollipop: a stick and a swirly disc facing the camera. */
function lollipop(x: number, z: number, h: number, c: string, c2: string): BufferGeometry[] {
  const r = h * 0.3
  return [
    P.cyl(0.005, 0.005, h, '#FFFFFF', { at: [x, h / 2, z] }, 8),
    P.cyl(r, r, 0.014, c, { at: [x, h + r * 0.75, z], rot: [Math.PI / 2, 0, 0] }, 20),
    ...[0.72, 0.44].map((k, i) => P.torus(r * k, r * 0.09, i % 2 ? c : c2, { at: [x, h + r * 0.75, z + 0.008] }, Math.PI * 2)),
    P.sphere(r * 0.18, c2, { at: [x, h + r * 0.75, z + 0.008], scale: [1, 1, 0.4] }, 10),
  ]
}
/** A candy cane: a red-and-white striped stick with its hook. */
function candyCane(x: number, z: number, h: number, rotY: number): BufferGeometry[] {
  const pts: Vector3[] = []
  const n = 14
  for (let i = 0; i <= n; i++) pts.push(new Vector3(0, (h * 0.78 * i) / n, 0))
  const hr = h * 0.16
  for (let i = 1; i <= 8; i++) {
    const a = (Math.PI * i) / 8
    pts.push(new Vector3(hr - Math.cos(a) * hr, h * 0.78 + Math.sin(a) * hr, 0))
  }
  const parts = pts.map((p, i) => P.sphere(0.011, i % 2 ? '#FFFFFF' : '#FF4F6E', { at: [p.x, p.y, p.z] }, 8))
  const g = merge(parts)
  g.rotateY(rotY)
  g.translate(x, 0.008, z)
  return [g]
}
/** A gumdrop: a sugary dome. */
const gumdrop = (x: number, z: number, s: number, c: string) => [P.sphere(0.024 * s, c, { at: [x, 0.012 * s, z], scale: [1, 1.05, 1] }, 12), P.cyl(0.024 * s, 0.024 * s, 0.012 * s, c, { at: [x, 0.006 * s, z] }, 12)]
/** A cupcake: a striped cup, a swirl of frosting and a cherry. */
function cupcake(x: number, z: number, cup: string, icing: string): BufferGeometry[] {
  return [
    P.cyl(0.03, 0.022, 0.032, cup, { at: [x, 0.016, z] }, 12),
    P.sphere(0.034, icing, { at: [x, 0.04, z], scale: [1, 0.55, 1] }, 14),
    P.sphere(0.024, icing, { at: [x, 0.058, z], scale: [1, 0.6, 1] }, 12),
    P.sphere(0.011, '#FF3B6B', { at: [x, 0.075, z] }, 10),
  ]
}
/** An ice-cream tree: a waffle cone, tip down, with two scoops. */
function iceCream(x: number, z: number, a: string, b: string): BufferGeometry[] {
  return [P.cone(0.026, 0.07, '#EDB874', { at: [x, 0.035, z], rot: [Math.PI, 0, 0] }, 10), P.sphere(0.032, a, { at: [x, 0.078, z] }, 14), P.sphere(0.025, b, { at: [x, 0.112, z] }, 12)]
}
/** A star on a stick. */
function starWand(x: number, z: number, h: number, c: string): BufferGeometry[] {
  const pts: [number, number][] = []
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2
    const r = i % 2 ? 0.014 : 0.032
    pts.push([Math.cos(a) * r, Math.sin(a) * r])
  }
  return [P.cyl(0.004, 0.004, h, PAL.cream, { at: [x, h / 2, z] }, 6), P.prism(pts, 0.012, c, { at: [x, h + 0.02, z] })]
}
/** A rainbow arch, along x, its feet in two clouds. */
function rainbow(x: number, z: number, r: number): BufferGeometry[] {
  const bands = ['#FF8FB0', '#FFB27A', '#FFE37A', '#8FE3A8', '#8FCBFF', '#C7A6FF']
  const t = r * 0.06
  return [
    ...bands.map((c, i) => P.torus(r - i * t * 1.9, t, c, { at: [x, 0, z] }, Math.PI)),
    ...[-1, 1].flatMap((s) => [P.sphere(r * 0.24, CLOUD, { at: [x + s * r * 0.82, r * 0.08, z], scale: [1.2, 0.8, 1] }, 12), P.sphere(r * 0.17, CLOUD, { at: [x + s * r * 1.05, r * 0.05, z + 0.02] }, 12)]),
  ]
}
/** A swing set: an A-frame each end, a bar, two seats on ropes. */
function swings(x: number, z: number, rotY: number): BufferGeometry[] {
  const h = 0.12
  const parts: BufferGeometry[] = []
  for (const sx of [-0.07, 0.07]) for (const sz of [-1, 1]) parts.push(P.cyl(0.004, 0.005, h * 1.04, PAL.sky, { at: [sx, h / 2, sz * 0.022], rot: [sz * 0.36, 0, 0] }, 6))
  parts.push(P.cyl(0.005, 0.005, 0.15, PAL.hotpink, { at: [0, h, 0], rot: [0, 0, Math.PI / 2] }, 8))
  for (const sx of [-0.032, 0.032]) {
    for (const s of [-1, 1]) parts.push(P.cyl(0.0015, 0.0015, h * 0.66, PAL.ink, { at: [sx + s * 0.012, h * 0.65, 0] }, 4))
    parts.push(P.rbox(0.032, 0.006, 0.018, 0.002, sx < 0 ? PAL.butter : PAL.mint, { at: [sx, h * 0.31, 0] }))
  }
  const g = merge(parts)
  g.rotateY(rotY)
  g.translate(x, 0, z)
  return [g]
}
/** A hot-air balloon: an envelope striped in gores with a scalloped skirt, a wicker basket with its rim and sandbags,
 *  four ropes and a string of flags. */
function balloonParts(a: string, b: string): BufferGeometry[] {
  const env = new SphereGeometry(0.16, 20, 14)
  const geo = bake(env, a, { scale: [1, 1.14, 1] })
  const col = geo.attributes.color as BufferAttribute
  const p = geo.attributes.position as BufferAttribute
  const ca = new Color(a)
  const cb = new Color(b)
  for (let i = 0; i < p.count; i += 3) {
    const ang = Math.atan2((p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3, (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3)
    const c = Math.floor(((ang + Math.PI) / (Math.PI * 2)) * 10) % 2 ? cb : ca
    for (let j = 0; j < 3; j++) col.setXYZ(i + j, c.r, c.g, c.b)
  }
  return [
    geo,
    P.cone(0.075, 0.09, a, { at: [0, -0.185, 0], rot: [Math.PI, 0, 0] }, 16),
    P.sphere(0.022, PAL.gold, { at: [0, 0.185, 0], scale: [1, 0.6, 1] }, 10),
    // The skirt: a ring of little scallops where the envelope narrows.
    ...Array.from({ length: 10 }, (_, i) => {
      const t = (i / 10) * Math.PI * 2
      return P.sphere(0.02, i % 2 ? a : b, { at: [Math.cos(t) * 0.062, -0.158, Math.sin(t) * 0.062], scale: [1, 1.2, 1] }, 7)
    }),
    P.rbox(0.068, 0.05, 0.068, 0.012, '#E0AE82', { at: [0, -0.31, 0] }),
    P.rbox(0.078, 0.012, 0.078, 0.005, '#F4CFA6', { at: [0, -0.285, 0] }),
    ...[-1, 1].map((sx) => P.sphere(0.012, PAL.pink, { at: [sx * 0.04, -0.315, 0.02], scale: [1, 1.3, 1] }, 7)),
    ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => P.cyl(0.002, 0.002, 0.1, '#B58A6A', { at: [sx * 0.03, -0.24, sz * 0.03] }, 4))),
  ]
}

/** A round bush with a few blossoms. */
function bush(x: number, z: number, s: number, leaf: string, bloom: string): BufferGeometry[] {
  return [
    P.sphere(0.03 * s, leaf, { at: [x, 0.018 * s, z], scale: [1.15, 0.85, 1] }, 10),
    P.sphere(0.022 * s, leaf, { at: [x + 0.026 * s, 0.014 * s, z + 0.008 * s] }, 9),
    P.sphere(0.02 * s, leaf, { at: [x - 0.024 * s, 0.013 * s, z + 0.01 * s] }, 9),
    ...[
      [0.006, 0.04, 0.014],
      [-0.02, 0.028, 0.018],
      [0.03, 0.028, 0.02],
      [0.0, 0.03, -0.02],
    ].map(([dx, dy, dz]) => P.sphere(0.0065 * s, bloom, { at: [x + dx * s, dy * s, z + dz * s] }, 6)),
  ]
}
/** A daisy lying open on the grass: five petals round a yellow middle. */
function daisy(x: number, z: number, s: number, c: string): BufferGeometry[] {
  return [
    ...Array.from({ length: 5 }, (_, i) => {
      const a = (i / 5) * Math.PI * 2
      return P.sphere(0.0058 * s, c, { at: [x + Math.cos(a) * 0.0068 * s, 0.006, z + Math.sin(a) * 0.0068 * s], scale: [1, 0.5, 1] }, 6)
    }),
    P.sphere(0.0048 * s, PAL.gold, { at: [x, 0.0085, z], scale: [1, 0.7, 1] }, 6),
  ]
}
/** A vine hanging down the island's side from (x, z): a string of leaves with a blossom at its end. */
function vine(x: number, z: number, len: number, nx: number, nz: number, bloom: string, seed: number): BufferGeometry[] {
  const r = rng(seed)
  const n = Math.max(3, Math.round(len / 0.022))
  const parts: BufferGeometry[] = []
  for (let i = 0; i < n; i++) {
    const sway = Math.sin(i * 1.3 + seed) * 0.006
    parts.push(P.sphere(0.011 - i * 0.0006, i % 2 ? GRASS : GRASS_DARK, { at: [x + nx * 0.006 + nz * sway, -0.05 - i * 0.022, z + nz * 0.006 + nx * sway], scale: [1, 1.25, 1] }, 6))
  }
  if (r() < 0.75) parts.push(P.sphere(0.009, bloom, { at: [x + nx * 0.01, -0.05 - n * 0.022, z + nz * 0.01] }, 7))
  return parts
}

/** The grass, painted: mown stripes, soft light and dark patches, blades, clover and specks of flowers. */
function paintGrass(w: number, d: number): HTMLCanvasElement {
  const PX = 760
  const W = Math.round(w * PX)
  const D = Math.round(d * PX)
  const c = document.createElement('canvas')
  c.width = W
  c.height = D
  const g = c.getContext('2d')!
  g.fillStyle = GRASS
  g.fillRect(0, 0, W, D)
  const r = rng(31)
  // Mown stripes on the slant, like a lawn.
  g.save()
  g.translate(W / 2, D / 2)
  g.rotate(-0.42)
  const band = 0.085 * PX
  for (let i = -14; i < 14; i += 2) {
    g.fillStyle = 'rgba(214,250,190,.42)'
    g.fillRect(-W * 1.5, i * band, W * 3, band)
  }
  g.restore()
  // Soft patches.
  for (let i = 0; i < 46; i++) {
    const x = r() * W
    const y = r() * D
    const rad = 26 + r() * 70
    const grad = g.createRadialGradient(x, y, 0, x, y, rad)
    const light = i % 3 === 0
    grad.addColorStop(0, light ? 'rgba(226,252,196,.5)' : 'rgba(120,205,128,.3)')
    grad.addColorStop(1, light ? 'rgba(226,252,196,0)' : 'rgba(120,205,128,0)')
    g.fillStyle = grad
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2)
  }
  // Blades: little ticks in threes.
  g.lineCap = 'round'
  for (let i = 0; i < 620; i++) {
    const x = r() * W
    const y = r() * D
    g.strokeStyle = i % 4 === 0 ? 'rgba(232,255,206,.8)' : 'rgba(104,190,118,.62)'
    g.lineWidth = 2.2
    for (const k of [-1, 0, 1]) {
      g.beginPath()
      g.moveTo(x + k * 4, y)
      g.lineTo(x + k * 6.5, y - 7 - (k === 0 ? 3 : 0))
      g.stroke()
    }
  }
  // Clover and specks of flowers.
  for (let i = 0; i < 150; i++) {
    const x = r() * W
    const y = r() * D
    if (i % 3 === 0) {
      g.fillStyle = 'rgba(112,196,124,.7)'
      for (const a of [0, 2.1, 4.2]) {
        g.beginPath()
        g.arc(x + Math.cos(a) * 3.4, y + Math.sin(a) * 3.4, 3.2, 0, Math.PI * 2)
        g.fill()
      }
    } else {
      g.fillStyle = ['rgba(255,255,255,.95)', 'rgba(255,214,232,.95)', 'rgba(255,240,170,.95)'][i % 3]
      g.beginPath()
      g.arc(x, y, 2.2 + r() * 1.4, 0, Math.PI * 2)
      g.fill()
    }
  }
  return c
}

/** A prop she can tap: it wobbles like jelly. */
interface Prop {
  root: Group
  t: number
  /** What it sounds like (the plugin plays it). */
  sound: 'boing' | 'chime' | 'plink' | 'giggle' | 'pop'
}

/** The pastel sky behind it all: blue at the top through lilac to pink and peach. */
function skyTexture(bag: Bag): Texture {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 512
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 0, 512)
  grad.addColorStop(0, '#A9CDFF')
  grad.addColorStop(0.34, '#D3D2FF')
  grad.addColorStop(0.66, '#FFD3EA')
  grad.addColorStop(1, '#FFE9D6')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 512)
  const t = bag.add(new CanvasTexture(c))
  t.colorSpace = SRGBColorSpace
  return t
}

/** A soft round glow (the sun's, far off). */
function glowTexture(bag: Bag): Texture {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  r.addColorStop(0, 'rgba(255,252,236,1)')
  r.addColorStop(0.16, 'rgba(255,246,214,.95)')
  r.addColorStop(0.3, 'rgba(255,236,214,.42)')
  r.addColorStop(0.62, 'rgba(255,226,226,.16)')
  r.addColorStop(1, 'rgba(255,226,236,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 128, 128)
  const t = bag.add(new CanvasTexture(c))
  t.colorSpace = SRGBColorSpace
  return t
}

/** A soft round twinkle for the sparkles in the air. */
function twinkleTexture(bag: Bag): Texture {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  r.addColorStop(0, 'rgba(255,255,255,1)')
  r.addColorStop(0.25, 'rgba(255,240,250,.9)')
  r.addColorStop(1, 'rgba(255,220,240,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 64, 64)
  // A four-point glint across it.
  g.fillStyle = 'rgba(255,255,255,.95)'
  g.beginPath()
  g.moveTo(32, 2)
  g.quadraticCurveTo(35, 29, 62, 32)
  g.quadraticCurveTo(35, 35, 32, 62)
  g.quadraticCurveTo(29, 35, 2, 32)
  g.quadraticCurveTo(29, 29, 32, 2)
  g.fill()
  const t = bag.add(new CanvasTexture(c))
  t.colorSpace = SRGBColorSpace
  return t
}

/** What stands on a far island. */
type MiniTop = 'cottage' | 'windmill' | 'pines' | 'blossom' | 'tower'

export class FloatingStage {
  /** The island (under the board, in the table top's space). */
  readonly island = new Group()
  /** The sky round it (in the world). */
  readonly sky = new Group()
  private themes = new Map<GameId, Group>()
  private props: Prop[] = []
  private clouds: { o: Group; r: number; a: number; y: number; speed: number; bob: number }[] = []
  private far: { o: Group; base: Vector3; phase: number }[] = []
  private balloons: { o: Group; x: number; z: number; y: number; speed: number; phase: number }[] = []
  /** Things that turn (a windmill's sails) or rise and fade (chimney smoke). */
  private spinners: Object3D[] = []
  private puffs: { o: Object3D; base: number; phase: number }[] = []
  private flutter: { o: Group; wings: [Mesh, Mesh]; cx: number; cz: number; rx: number; rz: number; y: number; speed: number; phase: number }[] = []
  /** The foam at the waterfall's lip, and the lily pads on the pond. */
  private foam: Object3D[] = []
  private lilies: Object3D[] = []
  private twinkles: Points
  private twinkleBase: Float32Array
  private skyTex: Texture
  private saved: { background: Scene['background']; fog: Scene['fog'] } | null = null
  private fog = new Fog(FOG, 3.6, 12)
  private time = 0
  /** The board just changed: it pops in (0..1). */
  private popT = -1
  private popping: Object3D | null = null
  /** The table top's own height, which the bob rides on. */
  private baseY: number

  constructor(
    private bag: Bag,
    /** The table top (the board, pieces and die hang off it); the island goes under it. */
    private top: Group,
    /** The table top's place in the world (the sky is built round it). */
    center: Vector3,
  ) {
    this.baseY = top.position.y
    this.skyTex = skyTexture(bag)
    this.buildIsland()
    for (const g of ['unicorn', 'candy', 'chutes'] as GameId[]) this.themes.set(g, this.buildTheme(g))
    this.buildSky()
    this.buildButterflies()
    // The sky's own lights (the house's are on its layer): a warm sun from the front right and high enough that
    // every top shows its own bright color, a soft fill.
    const lights = makeLights(this.sky)
    lights.follow(0, 0, 0)
    lights.sun.position.set(2.2, 5.8, 3.6)
    lights.ambient.intensity = TUNE.ambient * Math.PI * 1.04
    // Twinkles drifting in the air round the island.
    const n = 70
    const r = rng(7)
    this.twinkleBase = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2
      const d = 0.62 + r() * 1.5
      this.twinkleBase.set([Math.cos(a) * d, -0.5 + r() * 1.1, Math.sin(a) * d - 0.2], i * 3)
    }
    const geo = bag.add(new BufferGeometry())
    geo.setAttribute('position', new BufferAttribute(this.twinkleBase.slice(), 3))
    this.twinkles = new Points(geo, bag.add(new PointsMaterial({ map: twinkleTexture(bag), size: 0.035, transparent: true, depthWrite: false, opacity: 0.9, sizeAttenuation: true, fog: false })))
    this.twinkles.frustumCulled = false
    this.sky.add(this.twinkles)
    this.sky.position.copy(center)
    onStage(this.island)
    onStage(this.sky)
    this.show(false)
  }

  // ---------------------------------------------------------------- the island

  private buildIsland() {
    const { w, d, z } = ISLAND
    const front = z + d / 2
    const parts: BufferGeometry[] = [
      // Grass on top, its edge drooping a little over the soil like icing.
      P.rbox(w, 0.04, d, 0.028, GRASS, { at: [0, -0.02, z] }),
      P.rbox(w - 0.01, 0.05, d - 0.01, 0.025, SOIL, { at: [0, -0.06, z] }),
      // A chunky band of pink rock with straight sides (the island's edge, seen from the camera), then the strata rock
      // tapering down to a point under it.
      P.rbox(w - 0.03, 0.1, d - 0.03, 0.03, STRATA[0], { at: [0, -0.13, z] }),
      P.rbox(w - 0.07, 0.05, d - 0.07, 0.02, STRATA[1], { at: [0, -0.195, z] }),
      rock(w * 0.47, d * 0.47, 0.74, STRATA.slice(1), { at: [0, -0.57, z], seed: 3, seg: 13 }),
      // Two smaller rocks hanging beside the big one.
      rock(0.13, 0.12, 0.3, STRATA.slice(2), { at: [-0.3, -0.36, z + 0.34], seed: 8, seg: 8 }),
      rock(0.1, 0.11, 0.24, STRATA.slice(2), { at: [0.34, -0.33, z - 0.3], seed: 12, seg: 8 }),
      // The pond in the front-right corner: a pale sandy rim, the water, a lighter shallow, and the stream to the edge
      // (the waterfall pours off there).
      P.cyl(POND.r + 0.012, POND.r + 0.012, 0.006, '#FFF3D9', { at: [POND.x, 0.0005, POND.z] }, 24),
      P.cyl(POND.r, POND.r, 0.006, '#7CCBFF', { at: [POND.x, 0.0022, POND.z] }, 24),
      P.cyl(POND.r * 0.66, POND.r * 0.66, 0.004, '#A9E0FF', { at: [POND.x - 0.008, 0.0045, POND.z - 0.008] }, 20),
      P.cyl(POND.r * 0.2, POND.r * 0.2, 0.004, '#DDF4FF', { at: [POND.x - 0.022, 0.0058, POND.z - 0.02], scale: [1.6, 1, 0.8] }, 10),
      P.box(0.07, 0.007, front - POND.z, '#7CCBFF', { at: [POND.x, 0.0, (front + POND.z) / 2 + 0.004] }),
      // Round stones along the pond's bank (a gap at the front, where the stream leaves).
      ...Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2
        if (Math.sin(a) > 0.62 && Math.abs(Math.cos(a)) < 0.7) return P.box(0.001, 0.001, 0.001, GRASS)
        const s = 0.011 + ((i * 7) % 4) * 0.0022
        return P.sphere(s, ['#F4EEFF', '#FFFFFF', '#E3D8F8', '#FFE9F2'][i % 4], { at: [POND.x + Math.cos(a) * (POND.r + 0.008), 0.005, POND.z + Math.sin(a) * (POND.r + 0.008)], scale: [1.15, 0.7, 1] }, 8)
      }),
      // Reeds at the back of the pond.
      ...[
        [-0.03, -0.055, 0.06],
        [-0.012, -0.066, 0.075],
        [0.012, -0.064, 0.055],
        [0.045, -0.05, 0.068],
      ].flatMap(([dx, dz, h]) => [P.cyl(0.0022, 0.0022, h, GRASS_DARK, { at: [POND.x + dx, h / 2, POND.z + dz] }, 5), P.capsule(0.005, 0.014, '#B98463', { at: [POND.x + dx, h + 0.004, POND.z + dz] })]),
      // Mist puffs where the waterfall fades, far below.
      ...[0, 1, 2, 3].map((i) => P.sphere(0.036 - i * 0.006, '#FFFFFF', { at: [POND.x + (i - 1.5) * 0.034, -0.62 + (i % 2) * 0.014, front + 0.012], scale: [1.3, 0.8, 1] }, 10)),
      // The dice tray in front (where the die rolls and the cards sit): a cream rim with gold studs round pink felt.
      P.rbox(0.66, 0.012, 0.23, 0.045, '#FFF6EA', { at: [0, -0.003, 0.468] }),
      P.rbox(0.62, 0.012, 0.19, 0.04, '#FFBBD6', { at: [0, -0.0015, 0.468] }),
      P.rbox(0.59, 0.004, 0.16, 0.034, '#FFDCEA', { at: [0, 0.0033, 0.468] }),
      ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => P.sphere(0.008, PAL.gold, { at: [sx * 0.312, 0.004, 0.468 + sz * 0.097], scale: [1, 0.6, 1] }, 8))),
    ]
    const r = rng(11)
    // The island's side: two courses of rounded stone blocks, like a garden wall, each a slightly different pink.
    const hw = (w - 0.03) / 2
    const hd = (d - 0.03) / 2
    for (const [row, y] of [
      [0, -0.108],
      [1, -0.154],
    ] as const) {
      for (const side of [0, 1, 2, 3]) {
        const len = side < 2 ? w - 0.1 : d - 0.1
        let u = -len / 2 + (row ? 0.03 : 0)
        while (u < len / 2 - 0.03) {
          const bw = Math.min(0.06 + r() * 0.07, len / 2 - u)
          const c = STONES[Math.floor(r() * STONES.length)]
          const m = u + bw / 2
          const out = 0.004 + r() * 0.006
          if (side < 2) parts.push(P.rbox(bw - 0.008, 0.04, 0.03, 0.01, c, { at: [m, y, z + (side ? -1 : 1) * (hd - 0.008 + out)] }))
          else parts.push(P.rbox(0.03, 0.04, bw - 0.008, 0.01, c, { at: [(side === 2 ? -1 : 1) * (hw - 0.008 + out), y, z + m] }))
          u += bw
        }
      }
    }
    // Drips of grass over the soil all round the edge, long and short.
    const drip = (x: number, zz: number) => {
      const s = 0.022 + r() * 0.014
      const long = r() < 0.3
      parts.push(P.sphere(s, GRASS, { at: [x, -0.04 - (long ? 0.012 : 0), zz], scale: [1, (long ? 1.6 : 0.85) + r() * 0.5, 1] }, 8))
    }
    for (let i = 0; i <= 15; i++) {
      const x = -w / 2 + 0.03 + ((w - 0.06) * i) / 15
      drip(x, front - 0.012)
      drip(x, z - d / 2 + 0.012)
    }
    for (let i = 1; i < 17; i++) {
      const zz = z - d / 2 + 0.03 + ((d - 0.06) * i) / 17
      drip(-w / 2 + 0.012, zz)
      drip(w / 2 - 0.012, zz)
    }
    // Vines hanging down the front and the right side (the two sides the camera sees), a blossom at the end of most.
    const blooms = ['#FF8FB8', '#FFFFFF', '#FBEA9A', '#C7A6FF']
    ;[-0.44, -0.27, -0.08, 0.1, 0.46].forEach((x, i) => parts.push(...vine(x, front - 0.004, 0.05 + r() * 0.07, 0, 1, blooms[i % 4], 20 + i)))
    ;[-0.36, -0.12, 0.14, 0.4].forEach((zz, i) => parts.push(...vine(w / 2 - 0.004, z + zz, 0.05 + r() * 0.07, 1, 0, blooms[(i + 1) % 4], 40 + i)))
    ;[-0.3, 0.05, 0.36].forEach((zz, i) => parts.push(...vine(-w / 2 + 0.004, z + zz, 0.05 + r() * 0.06, -1, 0, blooms[(i + 2) % 4], 60 + i)))
    // Crystals hanging off the rock, in twos and threes.
    const crystals: [number, number, number, string][] = [
      [-0.24, -0.26, 0.32, '#A8DCFF'],
      [0.27, -0.24, 0.2, '#FF9FCB'],
      [0.05, -0.38, 0.33, '#D9CCFF'],
      [-0.12, -0.3, -0.28, '#FFB8D8'],
      [0.4, -0.25, -0.05, '#BFF0E0'],
      [-0.4, -0.25, 0.02, '#FBEA9A'],
    ]
    for (const [x, y, zz, c] of crystals)
      parts.push(P.cone(0.03, 0.13, c, { at: [x, y, zz], rot: [Math.PI, 0, 0.1] }, 5), P.cone(0.018, 0.075, c, { at: [x + 0.03, y + 0.012, zz + 0.01], rot: [Math.PI, 0, -0.25] }, 5), P.cone(0.013, 0.05, '#FFFFFF', { at: [x - 0.024, y + 0.02, zz + 0.012], rot: [Math.PI, 0, 0.3] }, 5))
    // In the margin round the board (low, so nothing hides it): daisies, tufts of grass, pebbles.
    const flowers = ['#FF8FB8', '#FFFFFF', '#FBEA9A', '#C7A6FF', '#A8DCFF']
    const free = (x: number, zz: number, pad = 0) => {
      // Not under a board (the widest is 0.91 across), on the tray, or in the pond and its stream.
      if (Math.abs(x) < 0.465 + pad && zz > -0.545 - pad && zz < 0.33 + pad) return false
      if (Math.abs(x) < 0.34 + pad && zz >= 0.3 && zz < 0.6 + pad) return false
      if (Math.hypot(x - POND.x, zz - POND.z) < POND.r + 0.03 + pad) return false
      if (Math.abs(x - POND.x) < 0.05 + pad && zz > POND.z) return false
      return true
    }
    for (let i = 0; i < 150; i++) {
      const x = (r() - 0.5) * (w - 0.07)
      const zz = z + (r() - 0.5) * (d - 0.07)
      if (!free(x, zz)) continue
      const k = r()
      if (k < 0.45) parts.push(...daisy(x, zz, 0.9 + r() * 0.5, flowers[i % flowers.length]))
      else if (k < 0.85) parts.push(P.cone(0.008, 0.024, GRASS_DARK, { at: [x, 0.01, zz] }, 5), P.cone(0.006, 0.018, GRASS_LIGHT, { at: [x + 0.008, 0.008, zz + 0.004], rot: [0, 0, -0.3] }, 5), P.cone(0.006, 0.016, GRASS_DARK, { at: [x - 0.007, 0.007, zz + 0.003], rot: [0, 0, 0.3] }, 5))
      else parts.push(P.sphere(0.009, i % 2 ? '#F4EEFF' : '#FFE9F2', { at: [x, 0.004, zz], scale: [1.2, 0.6, 1] }, 7))
    }
    this.island.add(toy(parts, this.bag, 1.3))
    // The painted lawn, just over the grass's top (lit like it, so the two are one green).
    const lawn = new Mesh(this.bag.add(new PlaneGeometry(w - 0.034, d - 0.034)), paintedMaterial(this.bag, paintGrass(w - 0.034, d - 0.034)))
    lawn.rotation.x = -Math.PI / 2
    lawn.position.set(0, 0.0006, z)
    lawn.raycast = () => {}
    this.island.add(lawn)
    // The tray and the pond's stones sit in a little shade.
    this.island.add(shadows(this.bag, [[0, 0.468, 0.2, 0.012], [-0.2, 0.468, 0.16, 0.012], [0.2, 0.468, 0.16, 0.012], [POND.x, POND.z, POND.r + 0.01, 0.01]]))
    this.island.add(this.waterfall())
    this.buildPondLife()
    this.top.add(this.island)
  }

  /** On the pond: lily pads that bob, one with a pink flower; at its lip, foam that bubbles. */
  private buildPondLife() {
    const pads: [number, number, number, boolean][] = [
      [-0.024, 0.012, 0.016, true],
      [0.022, -0.016, 0.013, false],
      [0.012, 0.03, 0.01, false],
    ]
    for (const [dx, dz, s, flower] of pads) {
      const parts = [P.cyl(s, s, 0.003, '#7FD98C', {}, 12), P.cyl(s * 0.5, s * 0.5, 0.0034, '#A5E8A2', { at: [s * 0.15, 0.0003, 0] }, 8)]
      if (flower) parts.push(...Array.from({ length: 5 }, (_, i) => P.sphere(s * 0.34, '#FF9CC4', { at: [Math.cos(i * 1.257) * s * 0.36, 0.005, Math.sin(i * 1.257) * s * 0.36], scale: [1, 0.8, 1] }, 6)), P.sphere(s * 0.26, PAL.butter, { at: [0, 0.008, 0] }, 6))
      const o = toy(parts, this.bag, 0.8)
      o.position.set(POND.x + dx, 0.0085, POND.z + dz)
      this.island.add(o)
      this.lilies.push(o)
    }
    const front = ISLAND.z + ISLAND.d / 2
    for (let i = 0; i < 6; i++) {
      const o = toy([P.sphere(0.013 + (i % 3) * 0.003, '#FFFFFF', { scale: [1, 0.8, 1] }, 8)], this.bag, 0)
      o.position.set(POND.x + (i - 2.5) * 0.013, 0.004, front + 0.004 + (i % 2) * 0.006)
      this.island.add(o)
      this.foam.push(o)
    }
  }

  /** The waterfall: a ribbon of streaky water pouring off the front edge, scrolling down and fading out far below. */
  private waterfall(): Mesh {
    const c = document.createElement('canvas')
    c.width = 64
    c.height = 128
    const g = c.getContext('2d')!
    const base = g.createLinearGradient(0, 0, 64, 0)
    base.addColorStop(0, '#8ED2FF')
    base.addColorStop(0.5, '#B2E3FF')
    base.addColorStop(1, '#8ED2FF')
    g.fillStyle = base
    g.fillRect(0, 0, 64, 128)
    const r = rng(5)
    for (let i = 0; i < 34; i++) {
      g.fillStyle = i % 3 ? 'rgba(255,255,255,.9)' : 'rgba(214,241,255,.9)'
      const x = Math.floor(r() * 60)
      const y = Math.floor(r() * 128)
      const h = 12 + Math.floor(r() * 30)
      g.beginPath()
      g.roundRect(x, y, 3 + Math.floor(r() * 3), h, 2)
      g.fill()
      // (The same streak again a tile up, so the scroll never shows a seam.)
      g.beginPath()
      g.roundRect(x, y - 128, 4, h, 2)
      g.fill()
    }
    const map = this.bag.add(new CanvasTexture(c))
    map.colorSpace = SRGBColorSpace
    map.wrapS = map.wrapT = RepeatWrapping
    map.repeat.set(1, 2.5)
    this.water = map
    const a = document.createElement('canvas')
    a.width = 4
    a.height = 64
    const ga = a.getContext('2d')!
    const grad = ga.createLinearGradient(0, 0, 0, 64)
    grad.addColorStop(0, '#fff')
    grad.addColorStop(0.6, '#ddd')
    grad.addColorStop(1, '#000')
    ga.fillStyle = grad
    ga.fillRect(0, 0, 4, 64)
    const alpha = this.bag.add(new CanvasTexture(a))
    const h = 0.62
    const m = new Mesh(this.bag.add(new PlaneGeometry(0.07, h)), this.bag.add(new MeshBasicMaterial({ map, alphaMap: alpha, transparent: true, depthWrite: false })))
    m.position.set(POND.x, -h / 2 + 0.004, ISLAND.z + ISLAND.d / 2 + 0.005)
    m.raycast = () => {}
    return m
  }
  private water: Texture | null = null

  private hitGeo: SphereGeometry | null = null
  private hitMat: MeshBasicMaterial | null = null
  private hitBall(): Mesh {
    this.hitGeo ??= this.bag.add(new SphereGeometry(0.1, 10, 8))
    this.hitMat ??= this.bag.add(new MeshBasicMaterial({ colorWrite: false, depthWrite: false }))
    const m = new Mesh(this.hitGeo, this.hitMat)
    m.position.y = 0.06
    return m
  }

  /** The shadows of the theme being built. */
  private shade: Shade[] = []

  /** One of a game's props, its own little group so it can wobble. `shade`: how wide and how tall it is, for its
   *  shadow on the grass (0 wide: none). */
  private prop(theme: Group, parts: BufferGeometry[], at: [number, number], sound: Prop['sound'], shade: [r: number, h: number] = [0.035, 0.1], px = 1.3) {
    // Each prop is built round its own foot, so it wobbles from the ground up.
    const g = merge(parts)
    g.translate(-at[0], 0, -at[1])
    const root = new Group()
    root.add(toy(g, this.bag, px))
    // An invisible ball round it for her finger: 0.2 m across is at least 64 px even on a portrait iPhone, where the
    // whole island is about the screen's width (the props sit 0.1-0.25 m apart off the board, so the nearest wins).
    root.add(this.hitBall())
    root.position.set(at[0], 0, at[1])
    root.userData.pick = `trip:table:prop:${this.props.length}`
    theme.add(root)
    this.props.push({ root, t: -1, sound })
    if (shade[0] > 0) this.shade.push([at[0], at[1], shade[0], shade[1]])
  }

  /** What each game puts round its board. Keep them low in front and at the sides; the tall ones go at the back. */
  private buildTheme(game: GameId): Group {
    const g = new Group()
    this.shade = []
    // The boards are up to 0.91 m across on a 1.08 m island: the props stand in the strip of grass left at each side
    // (x beyond 0.47), along the back, and in the two front corners beside the tray.
    const L = -0.495
    const R = 0.495
    if (game === 'unicorn') {
      this.prop(g, rainbow(-0.2, -0.525, 0.21), [-0.2, -0.525], 'chime', [0, 0])
      this.shade.push([-0.2 - 0.17, -0.525, 0.05, 0.02], [-0.2 + 0.17, -0.525, 0.05, 0.02])
      this.prop(g, tree(L + 0.01, -0.47, 0.2, '#FFB8D8', '#FFD6E8', 1.2), [L + 0.01, -0.47], 'boing', [0.05, 0.16])
      this.prop(g, tree(R - 0.01, -0.46, 0.24, '#D9CCFF', '#EEE6FF', 1.25), [R - 0.01, -0.46], 'boing', [0.05, 0.18])
      this.prop(g, tree(L, -0.2, 0.16, '#FFC9E0', '#FFE3EF'), [L, -0.2], 'boing', [0.045, 0.13])
      this.prop(g, cottage(R - 0.005, -0.2, '#FFF1F6', PAL.lavenderDark, -0.5), [R - 0.005, -0.2], 'giggle', [0.05, 0.08])
      this.prop(g, tree(R, 0.04, 0.15, '#C9B3FF', '#E6DCFF'), [R, 0.04], 'boing', [0.045, 0.12])
      this.prop(g, starWand(L, 0.02, 0.12, PAL.gold), [L, 0.02], 'chime', [0.014, 0.1])
      this.prop(g, starWand(L + 0.012, 0.13, 0.09, '#FF8FB8'), [L + 0.012, 0.13], 'chime', [0.014, 0.08])
      this.prop(g, bush(R, 0.2, 1, '#B7EBA6', '#FF8FB8'), [R, 0.2], 'boing', [0.04, 0.03])
      // A big unicorn statue in the front right corner, on a cloud (like the pieces, twice the size).
      const statue = unicornParts('lavender').map((p) => p.scale(2.1, 2.1, 2.1).rotateY(-2.07))
      this.prop(g, [...statue.map((p) => p.translate(R - 0.035, 0.03, 0.4)), ...cloudParts(0.055, 5).map((p) => p.translate(R - 0.035, 0.012, 0.4))], [R - 0.035, 0.4], 'giggle', [0.07, 0.1])
      this.prop(g, mushroom(L + 0.03, 0.4, 1.3, PAL.hotpink), [L + 0.03, 0.4], 'plink', [0.03, 0.03])
      this.prop(g, mushroom(L + 0.09, 0.52, 0.9, '#C7A6FF'), [L + 0.09, 0.52], 'plink', [0.022, 0.02])
      this.prop(g, bush(L + 0.02, 0.56, 0.9, '#B7EBA6', '#FFFFFF'), [L + 0.02, 0.56], 'boing', [0.035, 0.03])
    } else if (game === 'candy') {
      this.prop(g, lollipop(L, -0.5, 0.16, '#FF6FA8', '#FFFFFF'), [L, -0.5], 'plink', [0.02, 0.2])
      this.prop(g, lollipop(R, -0.5, 0.19, '#A77BFF', '#FFE3F2'), [R, -0.5], 'plink', [0.02, 0.22])
      this.prop(g, candyCane(L, -0.2, 0.16, 0.4), [L, -0.2], 'chime', [0.02, 0.14])
      this.prop(g, candyCane(R, -0.24, 0.14, 2.6), [R, -0.24], 'chime', [0.02, 0.12])
      this.prop(g, cupcake(R, 0.02, '#8FCBFF', '#FFF1F6'), [R, 0.02], 'giggle', [0.036, 0.06])
      this.prop(g, cupcake(L, 0.04, '#FFB27A', '#FFD3E6'), [L, 0.04], 'giggle', [0.036, 0.06])
      this.prop(g, iceCream(L, 0.22, '#FFB8D8', '#FFF1DE'), [L, 0.22], 'boing', [0.03, 0.11])
      this.prop(g, iceCream(R, 0.24, '#8FE3C8', '#FBEA9A'), [R, 0.24], 'boing', [0.03, 0.11])
      this.prop(g, lollipop(L + 0.02, 0.42, 0.09, '#FFD93D', '#FF9A3D'), [L + 0.02, 0.42], 'plink', [0.016, 0.11])
      this.prop(g, [...gumdrop(R - 0.05, 0.4, 1.2, '#4FCB7F'), ...gumdrop(R + 0.005, 0.44, 1, '#FF6FA8')], [R - 0.02, 0.42], 'boing', [0.05, 0.03])
      this.prop(g, [...gumdrop(L + 0.1, 0.5, 1, '#A77BFF'), ...gumdrop(L + 0.04, 0.55, 0.8, '#FFD93D'), ...gumdrop(L + 0.14, 0.57, 0.7, '#4FA8FF')], [L + 0.09, 0.53], 'boing', [0.06, 0.025])
    } else {
      this.prop(g, swings(L + 0.07, -0.535, 0.1), [L + 0.07, -0.535], 'giggle', [0.07, 0.06])
      this.prop(g, pine(R - 0.01, -0.5, 0.19, '#7FD3A1'), [R - 0.01, -0.5], 'boing', [0.045, 0.15])
      this.prop(g, tree(L, -0.22, 0.15, '#9BE08F', '#C5F0B5'), [L, -0.22], 'boing', [0.045, 0.12])
      this.prop(g, cottage(R, -0.2, '#FFF7E6', '#FF9A3D', -0.6), [R, -0.2], 'giggle', [0.05, 0.08])
      this.prop(g, pine(R, 0.06, 0.15, '#8FDDB0'), [R, 0.06], 'boing', [0.04, 0.12])
      this.prop(g, tree(L, 0.06, 0.13, '#FFC9E0', '#FFE3EF'), [L, 0.06], 'boing', [0.045, 0.1])
      this.prop(g, bush(R, 0.24, 1, '#B7EBA6', '#FBEA9A'), [R, 0.24], 'boing', [0.04, 0.03])
      // A sandbox with a bucket and a spade, front left; a little seesaw, front right.
      this.prop(
        g,
        [
          P.rbox(0.13, 0.018, 0.11, 0.007, '#F0CDA8', { at: [L + 0.06, 0.009, 0.47] }),
          P.rbox(0.108, 0.012, 0.088, 0.006, '#FFEBBE', { at: [L + 0.06, 0.014, 0.47] }),
          P.sphere(0.022, '#FFE3A8', { at: [L + 0.04, 0.02, 0.455], scale: [1, 0.6, 1] }, 9),
          P.cyl(0.013, 0.01, 0.022, PAL.hotpink, { at: [L + 0.085, 0.03, 0.48] }, 10),
          P.torus(0.011, 0.002, '#FFFFFF', { at: [L + 0.085, 0.043, 0.48] }, Math.PI),
          P.cyl(0.002, 0.002, 0.03, PAL.sky, { at: [L + 0.05, 0.03, 0.49], rot: [0.5, 0, 0.3] }, 5),
        ],
        [L + 0.06, 0.47],
        'plink',
        [0.07, 0.01],
      )
      this.prop(g, [P.cone(0.016, 0.022, PAL.sky, { at: [R - 0.03, 0.011, 0.42] }, 8), P.rbox(0.13, 0.008, 0.022, 0.004, PAL.butter, { at: [R - 0.03, 0.024, 0.42], rot: [0, 0.5, 0.15] }), ...[-1, 1].map((s) => P.sphere(0.008, PAL.hotpink, { at: [R - 0.03 + s * 0.05 * Math.cos(0.5), 0.034 + s * 0.008, 0.42 - s * 0.05 * Math.sin(0.5)] }, 7))], [R - 0.03, 0.42], 'boing', [0.05, 0.02])
      this.prop(g, mushroom(L + 0.02, 0.58, 1, '#FF9A3D'), [L + 0.02, 0.58], 'plink', [0.024, 0.02])
    }
    g.add(shadows(this.bag, this.shade))
    g.visible = false
    this.island.add(g)
    return g
  }

  /** Butterflies round the island's edges: two wings each, flapping, on slow loops over the grass. */
  private buildButterflies() {
    const wing = new Shape()
    wing.moveTo(0, 0)
    wing.bezierCurveTo(0.004, 0.02, 0.026, 0.024, 0.024, 0.006)
    wing.bezierCurveTo(0.03, -0.006, 0.016, -0.02, 0.008, -0.012)
    wing.bezierCurveTo(0.004, -0.008, 0.001, -0.004, 0, 0)
    const geo = this.bag.add(new ShapeGeometry(wing, 6))
    geo.rotateX(-Math.PI / 2)
    const spots: [string, number, number, number, number, number][] = [
      ['#FF8FC0', -0.5, 0.46, 0.09, 0.12, 0.09],
      ['#FFD45E', 0.5, -0.1, 0.07, 0.3, 0.12],
      ['#B79BFF', -0.5, -0.3, 0.06, 0.24, 0.15],
      ['#7FD4FF', 0.2, 0.56, 0.2, 0.06, 0.07],
    ]
    spots.forEach(([c, cx, cz, rx, rz, y], i) => {
      const mat = this.bag.add(new MeshBasicMaterial({ color: c, side: DoubleSide }))
      const o = new Group()
      const wings = [1, -1].map((s) => {
        const m: Mesh = new Mesh(geo, mat)
        m.scale.x = s
        m.raycast = () => {}
        o.add(m)
        return m
      }) as unknown as [Mesh, Mesh]
      this.island.add(o)
      this.flutter.push({ o, wings, cx, cz, rx, rz, y, speed: 0.5 + i * 0.13, phase: i * 1.9 })
    })
  }

  // ---------------------------------------------------------------- the sky

  /** A far island: a domed grass cap dripping over its soil, a faceted rock under it with a crystal or two, and a
   *  little place on top. */
  private mini(r: number, seed: number, top: MiniTop): Group {
    const rnd = rng(seed)
    const o = new Group()
    const parts: BufferGeometry[] = [
      P.sphere(r, GRASS, { at: [0, -0.012, 0], scale: [1, 0.2, 1] }, 16),
      P.cyl(r * 0.99, r * 0.95, 0.034, GRASS, { at: [0, -0.026, 0] }, 16),
      P.cyl(r * 0.94, r * 0.86, 0.04, SOIL, { at: [0, -0.06, 0] }, 14),
      P.cyl(r * 0.86, r * 0.8, 0.04, STRATA[0], { at: [0, -0.095, 0] }, 12),
      rock(r * 0.8, r * 0.8, r * 1.7, STRATA.slice(1), { at: [0, -0.11 - r * 0.85, 0], seed, seg: 10 }),
      P.cone(r * 0.12, r * 0.5, '#A8DCFF', { at: [r * 0.38, -0.16 - r * 0.2, r * 0.3], rot: [Math.PI, 0, 0.15] }, 5),
      P.cone(r * 0.09, r * 0.36, '#FFB8D8', { at: [-r * 0.36, -0.15 - r * 0.2, r * 0.2], rot: [Math.PI, 0, -0.2] }, 5),
    ]
    const n = Math.round(r * 70)
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      parts.push(P.sphere(r * 0.15 + rnd() * r * 0.06, GRASS, { at: [Math.cos(a) * r * 0.95, -0.04 - rnd() * 0.012, Math.sin(a) * r * 0.95], scale: [1, 1 + rnd() * 0.8, 1] }, 7))
    }
    for (let i = 0; i < 7; i++) {
      const a = rnd() * Math.PI * 2
      const d = r * (0.45 + rnd() * 0.4)
      parts.push(...daisy(Math.cos(a) * d, Math.sin(a) * d, 1.5, ['#FF8FB8', '#FFFFFF', '#FBEA9A'][i % 3]).map((p) => p.translate(0, 0.012, 0)))
    }
    const lift = (ps: BufferGeometry[], y = 0.012) => ps.map((p) => p.translate(0, y, 0))
    if (top === 'cottage') {
      parts.push(...lift(cottage(-r * 0.12, 0, '#FFF1F6', PAL.hotpink, 0.5).map((p) => p.scale(1.25, 1.25, 1.25))), ...lift(tree(r * 0.5, -r * 0.2, 0.15, '#FFB8D8', '#FFD6E8', 1.1)), ...lift(bush(r * 0.3, r * 0.45, 1, '#B7EBA6', '#FFFFFF')))
      // Smoke from the chimney: three puffs that rise and shrink, over and over.
      for (let i = 0; i < 3; i++) {
        const puff = toy([P.sphere(0.016, '#FFFFFF', {}, 8)], this.bag, 0)
        puff.position.set(-r * 0.12 - 0.045, 0.16, -0.01)
        o.add(puff)
        this.puffs.push({ o: puff, base: 0.15, phase: i / 3 })
      }
    } else if (top === 'windmill') {
      parts.push(
        ...lift([
          P.cyl(0.03, 0.045, 0.13, PAL.cream, { at: [0, 0.065, 0] }, 12),
          P.cone(0.042, 0.05, PAL.lavenderDark, { at: [0, 0.155, 0] }, 12),
          P.rbox(0.02, 0.03, 0.006, 0.006, '#C98B6B', { at: [0, 0.015, 0.043] }),
          P.cyl(0.009, 0.009, 0.005, PAL.sky, { at: [0, 0.075, 0.035], rot: [Math.PI / 2, 0, 0] }, 10),
        ]),
        ...lift(bush(-r * 0.5, r * 0.2, 1.1, '#B7EBA6', '#FF8FB8')),
        ...lift(pine(r * 0.5, -r * 0.1, 0.13, '#8FDDB0')),
      )
      const sails = toy([P.sphere(0.01, PAL.gold, {}, 8), ...[0, 1, 2, 3].flatMap((i) => [P.box(0.005, 0.085, 0.004, '#C98B6B', { at: [Math.sin((i * Math.PI) / 2) * 0.043, Math.cos((i * Math.PI) / 2) * 0.043, 0], rot: [0, 0, (-i * Math.PI) / 2] }), P.box(0.024, 0.06, 0.003, i % 2 ? '#FFD3E6' : '#FFFFFF', { at: [Math.sin((i * Math.PI) / 2) * 0.052 + Math.cos((i * Math.PI) / 2) * 0.014, Math.cos((i * Math.PI) / 2) * 0.052 - Math.sin((i * Math.PI) / 2) * 0.014, 0], rot: [0, 0, (-i * Math.PI) / 2] })])], this.bag, 1)
      sails.position.set(0, 0.135, 0.046)
      o.add(sails)
      this.spinners.push(sails)
    } else if (top === 'pines') {
      parts.push(...lift(pine(-r * 0.3, r * 0.1, 0.22, '#7FD3A1')), ...lift(pine(r * 0.32, -r * 0.15, 0.17, '#93DDB0')), ...lift(pine(r * 0.05, r * 0.5, 0.12, '#A5E6BD')), ...lift(mushroom(-r * 0.5, r * 0.5, 1.2, PAL.hotpink)), P.cyl(r * 0.24, r * 0.24, 0.004, '#8FD3FF', { at: [r * 0.45, 0.014, r * 0.35] }, 12))
    } else if (top === 'blossom') {
      parts.push(...lift(tree(0, 0, 0.2, '#FFB8D8', '#FFD6E8', 1.7)), ...lift(bush(r * 0.55, r * 0.2, 1, '#B7EBA6', '#FBEA9A')), ...lift([P.rbox(0.06, 0.006, 0.02, 0.003, '#E9C3A2', { at: [-r * 0.4, 0.022, r * 0.5] }), ...[-1, 1].map((s) => P.box(0.005, 0.02, 0.016, '#D8A983', { at: [-r * 0.4 + s * 0.022, 0.01, r * 0.5] }))]))
    } else {
      // A little round tower with a flag: somebody's lookout.
      parts.push(
        ...lift([
          P.cyl(0.04, 0.048, 0.15, '#FFF1F6', { at: [0, 0.075, 0] }, 14),
          P.cyl(0.05, 0.046, 0.022, PAL.lavender, { at: [0, 0.155, 0] }, 14),
          ...Array.from({ length: 6 }, (_, i) => P.rbox(0.018, 0.02, 0.018, 0.004, PAL.lavender, { at: [Math.cos(i * 1.047) * 0.04, 0.174, Math.sin(i * 1.047) * 0.04] })),
          P.cone(0.034, 0.07, PAL.hotpink, { at: [0, 0.2, 0] }, 12),
          P.cyl(0.002, 0.002, 0.05, '#B58A6A', { at: [0, 0.255, 0] }, 5),
          P.prism(
            [
              [0, 0],
              [0.035, 0.01],
              [0, 0.022],
            ],
            0.003,
            PAL.gold,
            { at: [0.001, 0.256, 0] },
          ),
          P.rbox(0.024, 0.04, 0.008, 0.01, '#B58FD6', { at: [0, 0.02, 0.046] }),
          P.rbox(0.014, 0.022, 0.006, 0.006, PAL.sky, { at: [0, 0.1, 0.042] }),
        ]),
        ...lift(tree(r * 0.55, r * 0.05, 0.12, '#D9CCFF', '#EEE6FF', 0.9)),
        ...lift(bush(-r * 0.5, r * 0.3, 1, '#B7EBA6', '#FF8FB8')),
      )
    }
    o.add(toy(parts, this.bag, 1.1))
    return o
  }

  private buildSky() {
    const r = rng(23)
    // Clouds in three rings: a sea of big ones far below, drifting ones round the island's middle, a few up high.
    const rings: [count: number, rMin: number, rMax: number, yMin: number, yMax: number, sMin: number, sMax: number][] = [
      [13, 1.1, 3.4, -1.4, -0.95, 0.35, 0.72],
      [9, 1.5, 2.9, -0.6, -0.05, 0.14, 0.3],
      [5, 1.7, 3.2, 0.35, 0.9, 0.18, 0.32],
    ]
    let seed = 100
    for (const [n, rMin, rMax, yMin, yMax, sMin, sMax] of rings)
      for (let i = 0; i < n; i++) {
        const o = toy(cloudParts(sMin + r() * (sMax - sMin), seed++), this.bag, 0)
        const c = { o, r: rMin + r() * (rMax - rMin), a: (i / n) * Math.PI * 2 + r() * 0.5, y: yMin + r() * (yMax - yMin), speed: (0.012 + r() * 0.02) * (r() < 0.5 ? 1 : -1), bob: r() * 6 }
        this.sky.add(o)
        this.clouds.push(c)
      }
    // The sun's glow, far off and up on the right.
    const sun = new Sprite(this.bag.add(new SpriteMaterial({ map: glowTexture(this.bag), transparent: true, depthWrite: false, fog: false })))
    sun.position.set(2.6, 1.5, -5.5)
    sun.scale.setScalar(3.4)
    sun.raycast = () => {}
    this.sky.add(sun)
    // Little islands far off, each one somebody's place.
    const minis: [number, number, number, number, MiniTop][] = [
      [-1.4, -0.1, -1.0, 0.17, 'cottage'],
      [1.45, 0.14, -1.5, 0.19, 'windmill'],
      [-1.95, -0.5, 0.3, 0.15, 'pines'],
      [1.8, -0.6, 0.3, 0.14, 'blossom'],
      [0.2, 0.34, -2.5, 0.2, 'tower'],
    ]
    minis.forEach(([x, y, z, rr, top], i) => {
      const o = this.mini(rr, 40 + i, top)
      o.position.set(x, y, z)
      // Its front turned toward the camera (which looks in from the front right).
      o.rotation.y = 0.3 + (i % 2) * 0.25
      o.userData.pick = `trip:table:prop:${this.props.length}`
      this.props.push({ root: o, t: -1, sound: i % 2 ? 'chime' : 'giggle' })
      this.sky.add(o)
      this.far.push({ o, base: new Vector3(x, y, z), phase: i * 1.7 })
    })
    // Two hot-air balloons rising slowly (and starting again from below), clear of the islands.
    const bs: [string, string, number, number, number, number][] = [
      ['#FF8FB8', '#FFF1F6', -2.1, -2.7, 0.05, 0],
      ['#C7A6FF', '#FBEA9A', 2.5, -0.9, 0.04, 2.5],
    ]
    for (const [a, b, x, z, speed, phase] of bs) {
      const o = new Group()
      o.add(toy(balloonParts(a, b), this.bag, 1.2))
      o.userData.pick = `trip:table:prop:${this.props.length}`
      this.props.push({ root: o, t: -1, sound: 'boing' })
      this.sky.add(o)
      this.balloons.push({ o, x, z, y: -0.5 + phase * 0.3, speed, phase })
    }
  }

  // ---------------------------------------------------------------- what the plugin does with it

  /** The stage on (the sky as the background, the pink haze) or off (the house's own back). */
  show(on: boolean, scene?: Scene) {
    this.island.visible = on
    this.sky.visible = on
    if (!scene) return
    if (on && !this.saved) {
      this.saved = { background: scene.background, fog: scene.fog }
      scene.background = this.skyTex
      scene.fog = this.fog
    } else if (!on && this.saved) {
      scene.background = this.saved.background
      scene.fog = this.saved.fog
      this.saved = null
    }
  }

  /** The game's props round its board. */
  setGame(game: GameId) {
    for (const [g, o] of this.themes) o.visible = g === game
  }

  /** The board that just came out pops in. */
  pop(o: Object3D) {
    this.popping = o
    this.popT = 0
  }

  /** The things she can tap (the plugin raycasts them). */
  get roots(): Object3D[] {
    return this.props.filter((p) => visibleUp(p.root)).map((p) => p.root)
  }

  /** A tap on prop `id`: it wobbles; returns its sound and where it is (for the sparkles). */
  poke(id: string): { sound: Prop['sound']; at: Vector3 } | null {
    const i = Number(id.slice('trip:table:prop:'.length))
    const p = this.props[i]
    if (!p) return null
    p.t = 0
    return { sound: p.sound, at: p.root.getWorldPosition(new Vector3()).add(new Vector3(0, 0.08, 0)) }
  }

  get busy() {
    return this.island.visible
  }

  /** `eye`: where the camera is (the haze starts just past the island, however far a narrow screen backs it off). */
  update(dt: number, eye?: Vector3) {
    if (!this.island.visible) {
      this.top.position.y = this.baseY
      this.top.rotation.set(0, 0, 0)
      return
    }
    this.time += dt
    const t = this.time
    if (eye) {
      const d = eye.distanceTo(this.sky.position)
      this.fog.near = d + 0.7
      this.fog.far = d + 8
    }
    // The island floats: a slow bob and the gentlest sway (the board and pieces ride along).
    this.top.position.y = this.baseY + Math.sin(t * 0.9) * 0.006
    this.top.rotation.set(Math.sin(t * 0.55) * 0.004, 0, Math.sin(t * 0.7 + 1) * 0.005)
    for (const c of this.clouds) {
      c.a += c.speed * dt
      c.o.position.set(Math.cos(c.a) * c.r, c.y + Math.sin(t * 0.4 + c.bob) * 0.02, Math.sin(c.a) * c.r - 0.3)
    }
    for (const f of this.far) {
      f.o.position.set(f.base.x, f.base.y + Math.sin(t * 0.6 + f.phase) * 0.03, f.base.z)
      f.o.rotation.z = Math.sin(t * 0.45 + f.phase) * 0.03
    }
    for (const s of this.spinners) s.rotation.z -= dt * 1.1
    for (const p of this.puffs) {
      const k = (t * 0.35 + p.phase) % 1
      p.o.position.y = p.base + k * 0.11
      p.o.scale.setScalar(Math.sin(k * Math.PI) * 1.2 + 0.05)
    }
    for (const b of this.balloons) {
      b.y += b.speed * dt
      if (b.y > 1.4) b.y = -1.0
      b.o.position.set(b.x + Math.sin(t * 0.3 + b.phase) * 0.08, b.y, b.z)
      b.o.rotation.z = Math.sin(t * 0.8 + b.phase) * 0.05
    }
    // The waterfall pours, its lip bubbles, the lily pads bob.
    if (this.water) this.water.offset.y = (this.water.offset.y + dt * 0.9) % 1
    this.foam.forEach((f, i) => f.scale.setScalar(0.8 + Math.sin(t * 5 + i * 1.7) * 0.25))
    this.lilies.forEach((l, i) => {
      l.position.y = 0.0085 + Math.sin(t * 1.6 + i * 2) * 0.0012
      l.rotation.y = Math.sin(t * 0.5 + i) * 0.4
    })
    // Butterflies loop over the grass, wings beating.
    for (const f of this.flutter) {
      const a = t * f.speed + f.phase
      const x = f.cx + Math.cos(a) * f.rx
      const z = f.cz + Math.sin(a * 1.0) * f.rz
      f.o.position.set(x, f.y + Math.sin(a * 2.3) * 0.02, z)
      f.o.rotation.y = Math.atan2(-Math.sin(a) * f.rx, Math.cos(a) * f.rz) + Math.PI / 2
      const flap = 0.25 + Math.abs(Math.sin(t * 13 + f.phase)) * 1.05
      f.wings[0].rotation.z = flap
      f.wings[1].rotation.z = -flap
    }
    // Twinkles drift upward and wink.
    const pos = this.twinkles.geometry.attributes.position as BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      const b = i * 3
      const y = ((this.twinkleBase[b + 1] + t * 0.03 + 0.5) % 1.1) - 0.5
      pos.setXYZ(i, this.twinkleBase[b] + Math.sin(t * 0.5 + i) * 0.03, y, this.twinkleBase[b + 2] + Math.cos(t * 0.4 + i) * 0.03)
    }
    pos.needsUpdate = true
    ;(this.twinkles.material as PointsMaterial).opacity = 0.75 + Math.sin(t * 2.3) * 0.2
    // Tapped props wobble like jelly.
    for (const p of this.props) {
      if (p.t < 0) continue
      p.t = Math.min(1, p.t + dt / 0.6)
      const w = Math.sin(p.t * Math.PI * 4) * (1 - p.t) * 0.22
      p.root.scale.set(1 - w * 0.5, 1 + w, 1 - w * 0.5)
      if (p.t >= 1) {
        p.t = -1
        p.root.scale.set(1, 1, 1)
      }
    }
    // A new board pops in with a little bounce.
    if (this.popping && this.popT >= 0) {
      this.popT = Math.min(1, this.popT + dt / 0.5)
      const k = this.popT
      const s = 1 + Math.sin(k * Math.PI * 2.5) * (1 - k) * 0.08 - (1 - k) * (1 - k) * 0.12
      this.popping.scale.setScalar(s)
      if (k >= 1) {
        this.popping.scale.setScalar(1)
        this.popping = null
        this.popT = -1
      }
    }
  }
}

function visibleUp(o: Object3D | null) {
  for (let c = o; c; c = c.parent) if (!c.visible) return false
  return true
}

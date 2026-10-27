// The rental desk's shapes (layout.ts says where), in the house's toon look, cooler and greener for the mountains: the
// arrivals hall's tiled floor and its back wall with big windows (white frames, a peek of green outside), a clock, a
// bench, a potted palm and a hanging welcome garland; the rental counter under its pink sign (a car and a key, no
// letters) with the clerk behind it (a puppy in a blue shirt and a scarf), the bell and a pot of orchids on the counter,
// a rack of folded maps, a poster of a mountain on the wall. Outside, the car park (white bays, a parking sign, a lamp,
// little trees in round planters, a hedge) and Nan's green mountains with low cloud on their tops, painted on a soft
// grey-lavender sky that drifts, and a tiny plane that crosses it now and then. And the things she uses: the key fob,
// her pink suitcase, Mommy's bag and Daddy's backpack.
import { BackSide, CanvasTexture, CylinderGeometry, Group, Mesh, MeshBasicMaterial, RepeatWrapping, SRGBColorSpace } from 'three'
import { buildAnimal, type Rig } from '../../../../../engine3d/characters/animal'
import type { Look } from '../../../characters/looks'
import type { Bag } from '../../../../../engine3d/dispose'
import { blobShadow, merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { buildSuitcase } from '../../../trip/props'
import { BELL, CLERK_AT, COUNTER, MAPS, ORCHIDS, POSTER, WALL } from './layout'

/** The rental clerk: a puppy in a blue shirt with a little scarf (not family: the airport's rental desk, a placeholder
 *  animal like the farm aunties, for Dad to pick). */
export const CLERK: Look = { species: 'puppy', height: 1.25, fur: '#E9C79A', light: '#FFF4E4', dark: '#6A4E46', ear: '#C99564', outfit: { kind: 'shirt', color: '#5D7BB0' }, extras: ['scarf'], open: true }

const FLOOR = '#F3EEF8'
const TILE = '#E6DDF2'
const WALL_C = '#EADFF7'
const WINDOW = '#CDEBFF'
const FRAME = '#FFFFFF'
const WOOD = '#C99A6E'
const ASPHALT = '#C3BDD0'
const GRASS = '#9ED69A'
/** How far the floor and the car park come toward the camera (so the bottom of the screen is floor, never sky). */
const FRONT = 6

export interface Desk {
  root: Group
  clerk: Rig
  bell: Group
  orchids: Group
  maps: Group
  /** The map that flaps open when she pokes the rack. */
  map: Group
  poster: Group
  fob: Group
  /** Her suitcase, Mommy's bag, Daddy's backpack (each faces +z; its origin at its bottom). */
  bags: Group[]
  /** The painted sky and mountains all round (its clouds drift: offset its texture). */
  sky: CanvasTexture
  /** A tiny plane that crosses the sky now and then. */
  plane: Group
  /** The clock's hands (they tick round). */
  clock: { min: Group; hour: Group }
  /** The garland over the counter (it sways). */
  garland: Group
}

/** Nan's mountains with low cloud on their tops, on a soft grey-lavender sky: painted on the inside of a big cylinder
 *  (whole periods across the width, so it meets itself round the back). */
function backdrop(bag: Bag) {
  const c = document.createElement('canvas')
  c.width = 2048
  c.height = 512
  const g = c.getContext('2d')!
  const sky = g.createLinearGradient(0, 0, 0, 512)
  sky.addColorStop(0, '#C9C6E6')
  sky.addColorStop(0.45, '#DCE3F4')
  sky.addColorStop(0.8, '#E9F2F6')
  sky.addColorStop(1, '#EEF6F2')
  g.fillStyle = sky
  g.fillRect(0, 0, 2048, 512)
  const ridge = (y: number, amp: number, color: string, k: number[], ph: number) => {
    g.fillStyle = color
    g.beginPath()
    g.moveTo(0, 512)
    for (let x = 0; x <= 2048; x += 8) {
      const u = (x / 2048) * Math.PI * 2
      g.lineTo(x, y - amp * (0.5 + 0.3 * Math.sin(u * k[0] + ph) + 0.2 * Math.sin(u * k[1] + ph * 2)))
    }
    g.lineTo(2048, 512)
    g.fill()
  }
  const puffs = (y: number, n: number, a: number) => {
    g.fillStyle = `rgba(255,255,255,${a})`
    for (let i = 0; i < n; i++) {
      const x = ((i + 0.3) * 2048) / n
      for (const [dx, dy, rx, ry] of [[0, 0, 70, 20], [50, -10, 50, 18], [-50, 4, 46, 14]]) {
        g.beginPath()
        g.ellipse(x + dx + (i % 3) * 12, y + dy + (i % 2) * 14, rx + (i % 4) * 10, ry, 0, 0, Math.PI * 2)
        g.fill()
      }
    }
  }
  puffs(110, 7, 0.75)
  ridge(320, 160, '#BCCFDB', [5, 13], 1)
  puffs(215, 11, 0.9)
  ridge(390, 130, '#A6CDB2', [7, 17], 3)
  puffs(300, 9, 0.8)
  ridge(455, 90, '#8FC59D', [9, 22], 5)
  const tex = bag.add(new CanvasTexture(c))
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = RepeatWrapping
  const m = new Mesh(bag.add(new CylinderGeometry(40, 40, 22, 64, 1, true)), bag.add(new MeshBasicMaterial({ map: tex, side: BackSide, depthWrite: false, fog: false })))
  m.position.set(2, 6, 0)
  m.renderOrder = -1
  return { mesh: m, tex }
}

export function buildDesk(bag: Bag): Desk {
  const root = new Group()

  // ---- The hall's floor, the car park outside, the grass and the painted mountains all round ----
  const tiles = []
  for (let x = WALL.x0 + 0.5; x < WALL.x1; x += 1) for (let z = WALL.z + 0.5; z < FRONT; z += 1) if ((Math.round(x - 0.5) + Math.round(z - 0.5)) % 2) tiles.push(P.box(0.98, 0.005, 0.98, TILE, { at: [x, 0.004, z] }))
  const fd = FRONT - WALL.z
  root.add(solid(merge([
    P.box(WALL.x1 - WALL.x0, 0.1, fd, FLOOR, { at: [(WALL.x0 + WALL.x1) / 2, -0.05, WALL.z + fd / 2] }),
    ...tiles,
    // A pink welcome mat in front of the counter.
    P.rbox(1.5, 0.012, 0.8, 0.005, '#FFD3E6', { at: [-1.55, 0.007, -0.45] }),
    P.rbox(1.3, 0.014, 0.6, 0.005, '#FFB3CF', { at: [-1.55, 0.008, -0.45] }),
    // The car park: grey with white bays, a curb along the hall, the grass verge and a hedge behind it.
    P.box(14, 0.1, fd + 2.4, ASPHALT, { at: [WALL.x1 + 7, -0.06, WALL.z - 1.2 + (fd + 2.4) / 2] }),
    P.box(0.18, 0.12, fd, '#E8E2F0', { at: [WALL.x1 + 0.09, 0.0, WALL.z + fd / 2] }),
    ...[2.0, 6.6, 9.4].map((x) => P.box(0.08, 0.01, 2.6, '#FFFFFF', { at: [x, 0.0, -1.6] })),
    P.box(14, 0.01, 0.08, '#FFFFFF', { at: [WALL.x1 + 7, 0.0, -2.9] }),
    P.box(16, 0.12, 0.25, '#E8E2F0', { at: [WALL.x1 + 6, 0.0, -3.85] }),
    P.box(18, 0.1, 8, GRASS, { at: [WALL.x1 + 6, -0.07, -8] }),
    P.box(WALL.x1 - WALL.x0 + 4, 0.1, 8, GRASS, { at: [(WALL.x0 + WALL.x1) / 2, -0.07, WALL.z - 4] }),
    P.box(40, 0.1, 30, '#A9DC97', { at: [2, -0.09, -20] }),
  ]), bag, 0))
  const sky = backdrop(bag)
  root.add(sky.mesh)
  // Near hills in the toon look (with ink), in front of the painted ones, and puffs of cloud sitting on them.
  root.add(solid(merge([
    ...[[-9, 7, 3.4, '#94CF94'], [-1, 9, 4.4, '#86C88E'], [8, 8, 3.8, '#94CF94'], [15, 7, 3.2, '#86C88E']].map(([x, r, h, c]) => P.sphere(r as number, c as string, { at: [x as number, -(r as number) * 0.55 + (h as number), -22], scale: [1, 0.6, 0.5] }, 20)),
    ...[[-1.5, 4.1], [8.6, 3.6]].flatMap(([x, h]) => [
      P.sphere(0.9, '#FFFFFF', { at: [x, h + 0.2, -20.5], scale: [1.8, 0.55, 0.6] }, 12),
      P.sphere(0.7, '#F4F1FA', { at: [x + 1.3, h + 0.05, -20.3], scale: [1.6, 0.5, 0.6] }, 12),
    ]),
  ]), bag, 2))
  // The hedge along the car park, little trees in round planters, a lamp post and the parking sign (a car on blue).
  const park = []
  for (let x = 2.2; x < 15; x += 0.55) park.push(P.sphere(0.32, x % 1.1 < 0.55 ? '#6FBF7F' : '#7FC98A', { at: [x, 0.22, -4.15], scale: [1, 0.8, 0.8] }, 10))
  for (const x of [3.0, 6.4, 9.8]) park.push(P.cyl(0.3, 0.26, 0.3, '#F1E4D4', { at: [x, 0.15, -3.45] }, 14), P.cyl(0.05, 0.06, 0.9, WOOD, { at: [x, 0.7, -3.45] }, 8), P.sphere(0.45, '#5FAE78', { at: [x, 1.3, -3.45], scale: [1, 0.9, 1] }, 12), P.sphere(0.3, '#74C08A', { at: [x + 0.15, 1.55, -3.35] }, 10))
  park.push(
    P.cyl(0.05, 0.06, 2.8, '#7A7290', { at: [7.9, 1.4, -3.3] }, 8),
    P.box(0.6, 0.06, 0.12, '#7A7290', { at: [7.65, 2.78, -3.3] }),
    P.cyl(0.14, 0.18, 0.12, '#FFF4CF', { at: [7.4, 2.7, -3.3] }, 12),
    P.cyl(0.035, 0.035, 1.6, '#7A7290', { at: [2.5, 0.8, -3.2] }, 8),
    P.rbox(0.5, 0.5, 0.05, 0.06, '#5D7BB0', { at: [2.5, 1.75, -3.18] }),
    P.rbox(0.3, 0.12, 0.02, 0.04, '#FFFFFF', { at: [2.5, 1.74, -3.14] }),
    P.rbox(0.2, 0.08, 0.02, 0.03, '#FFFFFF', { at: [2.5, 1.82, -3.14] }),
    ...[-0.08, 0.08].map((dx) => P.cyl(0.035, 0.035, 0.03, '#FFFFFF', { at: [2.5 + dx, 1.67, -3.14], rot: [Math.PI / 2, 0, 0] }, 10)),
  )
  root.add(solid(merge(park), bag, 2))

  // ---- The back wall: big windows (white frames, a peek of green outside), the roof's edge, a clock, a bench ----
  const wallH = 2.8
  const panes = []
  for (let x = WALL.x0 + 1.9; x < WALL.x1 - 0.4; x += 1.25) {
    panes.push(
      P.box(1.08, 1.43, 0.03, FRAME, { at: [x, 1.55, WALL.z + 0.075] }),
      P.box(1.0, 1.35, 0.03, WINDOW, { at: [x, 1.55, WALL.z + 0.09] }),
      // Outside: the hills' green along the bottom of each pane, a cloud near the top.
      P.box(1.0, 0.36, 0.03, '#A6D7A4', { at: [x, 1.05, WALL.z + 0.095] }),
      P.sphere(0.12, '#FFFFFF', { at: [x - 0.18 + (x % 0.5), 1.95, WALL.z + 0.1], scale: [1.8, 0.6, 0.1] }, 10),
      P.box(0.04, 1.35, 0.03, FRAME, { at: [x, 1.55, WALL.z + 0.105] }),
      P.box(1.0, 0.04, 0.03, FRAME, { at: [x, 1.55, WALL.z + 0.105] }),
    )
  }
  root.add(solid(merge([
    P.box(WALL.x1 - WALL.x0, wallH, 0.14, WALL_C, { at: [(WALL.x0 + WALL.x1) / 2, wallH / 2, WALL.z] }),
    P.box(WALL.x1 - WALL.x0, 0.35, 0.02, '#DCCDF0', { at: [(WALL.x0 + WALL.x1) / 2, 0.175, WALL.z + 0.08] }),
    P.box(WALL.x1 - WALL.x0 + 0.3, 0.22, 0.5, PAL.lavenderDark, { at: [(WALL.x0 + WALL.x1) / 2, wallH + 0.1, WALL.z + 0.1] }),
    ...Array.from({ length: 22 }, (_, i) => P.sphere(0.13, i % 2 ? PAL.pink : '#FFFFFF', { at: [WALL.x0 + 0.13 + i * 0.26, wallH - 0.02, WALL.z + 0.36], scale: [1, 0.7, 0.4] }, 10)),
    P.box(0.3, wallH + 0.2, 0.3, PAL.lavenderDark, { at: [WALL.x1, (wallH + 0.2) / 2, WALL.z] }),
    ...panes,
    // The bench under the windows, with a pink cushion.
    P.rbox(1.3, 0.08, 0.42, 0.03, WOOD, { at: [0.25, 0.45, WALL.z + 0.35] }),
    P.rbox(1.2, 0.08, 0.36, 0.04, '#FFB3CF', { at: [0.25, 0.53, WALL.z + 0.35] }),
    ...[-0.5, 1.0].map((x) => P.box(0.06, 0.45, 0.36, '#9C7250', { at: [x, 0.22, WALL.z + 0.35] })),
    // The potted palm in the corner.
    P.cyl(0.24, 0.18, 0.42, '#F1E4D4', { at: [-3.85, 0.21, -2.15] }, 14),
    P.cyl(0.03, 0.04, 1.2, '#9C7250', { at: [-3.85, 0.95, -2.15] }, 8),
    ...[0, 1, 2, 3, 4, 5].map((i) => P.sphere(0.32, i % 2 ? '#5FAE78' : '#74C08A', { at: [-3.85 + Math.cos(i) * 0.3, 1.55 - (i % 3) * 0.06, -2.15 + Math.sin(i) * 0.22], scale: [1.4, 0.3, 0.5], rot: [0, i, (i % 2 ? 1 : -1) * 0.4] }, 10)),
  ]), bag, 2))
  // The clock on the wall (no numbers: four dots), its hands go round.
  const clockAt: [number, number, number] = [-1.6, 2.35, WALL.z + 0.1]
  root.add(solid(merge([
    P.cyl(0.24, 0.24, 0.04, PAL.hotpink, { at: clockAt, rot: [Math.PI / 2, 0, 0] }, 24),
    P.cyl(0.2, 0.2, 0.045, '#FFFFFF', { at: [clockAt[0], clockAt[1], clockAt[2] + 0.005], rot: [Math.PI / 2, 0, 0] }, 24),
    ...[0, 1, 2, 3].map((i) => P.sphere(0.018, '#4A4458', { at: [clockAt[0] + Math.cos((i * Math.PI) / 2) * 0.15, clockAt[1] + Math.sin((i * Math.PI) / 2) * 0.15, clockAt[2] + 0.03] }, 6)),
  ]), bag, 1.5))
  const hand = (len: number, w: number) => {
    const h = new Group()
    h.position.set(clockAt[0], clockAt[1], clockAt[2] + 0.035)
    h.add(solid(P.box(w, len, 0.01, '#4A4458', { at: [0, len / 2, 0] }), bag, 0))
    root.add(h)
    return h
  }
  const clock = { min: hand(0.16, 0.02), hour: hand(0.11, 0.03) }
  // The garland over the counter: pink and white flowers on a string.
  const garland = new Group()
  garland.position.set((COUNTER.x0 + COUNTER.x1) / 2, 2.5, WALL.z + 0.2)
  garland.add(solid(merge(Array.from({ length: 11 }, (_, i) => {
    const u = i / 10 - 0.5
    return P.sphere(0.06, [PAL.pink, '#FFFFFF', '#C77DF0'][i % 3], { at: [u * 1.9, -0.25 * (1 - 4 * u * u), 0] }, 8)
  })), bag, 1.5))
  root.add(garland)

  // ---- The rental sign behind the counter: a pink board with a car and a key (pictures, no letters) ----
  const sx = (COUNTER.x0 + COUNTER.x1) / 2
  root.add(solid(merge([
    P.rbox(1.7, 0.5, 0.06, 0.12, PAL.hotpink, { at: [sx, 2.0, WALL.z + 0.12] }),
    P.rbox(1.55, 0.38, 0.02, 0.1, '#FFFFFF', { at: [sx, 2.0, WALL.z + 0.155] }),
    // A little silver car.
    P.rbox(0.5, 0.15, 0.03, 0.05, '#A9AEBC', { at: [sx - 0.3, 1.98, WALL.z + 0.17] }),
    P.rbox(0.3, 0.1, 0.03, 0.04, '#A9AEBC', { at: [sx - 0.33, 2.08, WALL.z + 0.17] }),
    P.box(0.22, 0.06, 0.035, WINDOW, { at: [sx - 0.33, 2.08, WALL.z + 0.172] }),
    ...[-0.47, -0.13].map((x) => P.cyl(0.055, 0.055, 0.04, '#3E3849', { at: [sx + x, 1.9, WALL.z + 0.18], rot: [Math.PI / 2, 0, 0] }, 12)),
    // A gold key.
    P.torus(0.06, 0.02, PAL.gold, { at: [sx + 0.2, 2.0, WALL.z + 0.18] }),
    P.box(0.26, 0.035, 0.03, PAL.gold, { at: [sx + 0.39, 2.0, WALL.z + 0.18] }),
    ...[0.44, 0.5].map((x) => P.box(0.025, 0.06, 0.03, PAL.gold, { at: [sx + x, 1.96, WALL.z + 0.18] })),
  ]), bag, 2))

  // ---- The counter, with a picture of a key on its front ----
  const cw = COUNTER.x1 - COUNTER.x0
  const cx = (COUNTER.x0 + COUNTER.x1) / 2
  root.add(solid(merge([
    P.rbox(cw, COUNTER.h - 0.06, COUNTER.d, 0.05, PAL.cream, { at: [cx, (COUNTER.h - 0.06) / 2, COUNTER.z] }),
    P.rbox(cw + 0.1, 0.07, COUNTER.d + 0.12, 0.03, WOOD, { at: [cx, COUNTER.h - 0.035, COUNTER.z] }),
    P.box(cw, 0.12, 0.01, PAL.hotpink, { at: [cx, 0.7, COUNTER.z + COUNTER.d / 2 + 0.005] }),
    P.torus(0.07, 0.025, PAL.gold, { at: [cx - 0.12, 0.42, COUNTER.z + COUNTER.d / 2 + 0.01] }),
    P.box(0.22, 0.04, 0.02, PAL.gold, { at: [cx + 0.06, 0.42, COUNTER.z + COUNTER.d / 2 + 0.01] }),
    ...[0.12, 0.17].map((x) => P.box(0.03, 0.06, 0.02, PAL.gold, { at: [cx + x, 0.38, COUNTER.z + COUNTER.d / 2 + 0.01] })),
    // A little screen and a pen pot behind the counter's top.
    P.rbox(0.36, 0.26, 0.04, 0.02, '#4A4458', { at: [cx - 0.3, COUNTER.h + 0.18, COUNTER.z - 0.18], rot: [-0.2, 0.3, 0] }),
  ]), bag, 2))
  root.add(solid(P.rbox(cw - 0.2, CLERK_AT[1], 0.7, 0.04, WOOD, { at: [cx, CLERK_AT[1] / 2, CLERK_AT[2]] }), bag, 2))
  const clerk = buildAnimal(CLERK, bag)
  clerk.root.position.set(...CLERK_AT)
  root.add(clerk.root)

  // ---- The bell, the orchids, the rack of maps, the poster ----
  const bell = new Group()
  bell.position.set(...BELL)
  bell.add(solid(merge([P.cyl(0.07, 0.08, 0.02, '#4A4458', { at: [0, 0.01, 0] }), P.sphere(0.06, PAL.gold, { at: [0, 0.02, 0], scale: [1, 0.85, 1] }), P.sphere(0.015, PAL.gold, { at: [0, 0.075, 0] })]), bag, 2))
  root.add(bell)
  const orchids = new Group()
  orchids.position.set(...ORCHIDS)
  orchids.add(solid(merge([
    P.cyl(0.07, 0.055, 0.12, '#FFFFFF', { at: [0, 0.06, 0] }),
    ...[-0.04, 0.03].map((x, i) => P.cyl(0.005, 0.005, 0.3, '#6FBF7F', { at: [x, 0.25, 0], rot: [0, 0, (i ? -1 : 1) * 0.15] })),
    ...[[-0.06, 0.36], [-0.03, 0.4], [0.02, 0.33], [0.06, 0.38], [0.0, 0.43]].map(([x, y], i) => P.sphere(0.03, i % 2 ? '#C77DF0' : PAL.pink, { at: [x, y, 0.02], scale: [1, 0.8, 0.5] }, 10)),
    P.sphere(0.06, '#6FBF7F', { at: [0, 0.13, 0], scale: [1.4, 0.35, 1] }, 10),
  ]), bag, 2))
  root.add(orchids)
  const maps = new Group()
  maps.position.set(...MAPS)
  maps.add(solid(merge([
    P.box(0.04, 1.2, 0.04, '#7A7290', { at: [0, 0.6, 0] }),
    P.cyl(0.2, 0.22, 0.04, '#7A7290', { at: [0, 0.02, 0] }),
    P.box(0.5, 0.6, 0.05, '#B9A6F5', { at: [0, 0.95, 0.03] }),
    ...[0, 1, 2].map((i) => P.box(0.12, 0.17, 0.02, [PAL.mint, PAL.butter, PAL.sky][i], { at: [-0.15 + i * 0.15, 0.85, 0.07] })),
  ]), bag, 2))
  const map = new Group()
  map.position.set(0.0, 1.1, 0.08)
  map.add(solid(merge([P.box(0.13, 0.17, 0.02, PAL.peach, { at: [0, -0.085, 0] }), P.box(0.1, 0.012, 0.022, '#6FBF7F', { at: [0, -0.07, 0] })]), bag, 2))
  maps.add(map)
  root.add(maps)
  const poster = new Group()
  poster.position.set(...POSTER.at)
  poster.add(solid(merge([
    P.box(POSTER.w + 0.08, POSTER.h + 0.08, 0.03, WOOD, {}),
    P.box(POSTER.w, POSTER.h, 0.035, '#BFE3FF', {}),
    P.prism([[-0.48, -0.4], [0.05, 0.3], [0.48, -0.4]], 0.04, '#7FC689', { at: [0, -0.15, 0.005] }),
    P.prism([[-0.12, 0.13], [0.05, 0.3], [0.2, 0.1]], 0.045, '#FFFFFF', { at: [0, -0.15, 0.007] }),
    P.prism([[-0.5, -0.4], [-0.28, -0.05], [-0.05, -0.4]], 0.045, '#5FA97E', { at: [0, -0.15, 0.009] }),
    P.sphere(0.13, '#FFFFFF', { at: [-0.2, 0.38, 0.02], scale: [1.8, 0.7, 0.2] }, 12),
  ]), bag, 2))
  root.add(poster)

  // ---- The key fob, and the bags ----
  const fob = new Group()
  fob.add(solid(merge([
    P.rbox(0.08, 0.13, 0.03, 0.03, '#3E3849', {}),
    ...[0.035, -0.005].map((y, i) => P.cyl(0.016, 0.016, 0.012, i ? '#FFFFFF' : PAL.hotpink, { at: [0, y, 0.016], rot: [Math.PI / 2, 0, 0] }, 12)),
    P.torus(0.03, 0.008, '#C9CDD8', { at: [0, 0.09, 0] }),
  ]), bag, 1.5))
  root.add(fob)
  const suitcase = buildSuitcase(bag)
  const momBag = new Group()
  momBag.add(solid(merge([
    P.rbox(0.6, 0.34, 0.3, 0.12, PAL.lavenderDark, { at: [0, 0.17, 0] }),
    P.torus(0.12, 0.02, '#7A68C8', { at: [0, 0.34, 0], scale: [1, 1, 0.4] }, Math.PI),
    P.box(0.62, 0.05, 0.31, '#FFD3E6', { at: [0, 0.2, 0] }),
  ]), bag, 2))
  const backpack = new Group()
  backpack.add(solid(merge([
    P.rbox(0.36, 0.5, 0.24, 0.1, PAL.mint, { at: [0, 0.25, 0] }),
    P.rbox(0.26, 0.2, 0.06, 0.05, '#6FCFB0', { at: [0, 0.18, 0.13] }),
    P.torus(0.06, 0.016, '#4FA889', { at: [0, 0.52, 0] }, Math.PI),
  ]), bag, 2))
  const bags = [suitcase.root, momBag, backpack]
  for (const b of bags) {
    b.add(blobShadow(0.38, bag))
    root.add(b)
  }
  // ---- The tiny plane that crosses the sky now and then (rental3d.ts flies it) ----
  const plane = new Group()
  plane.add(solid(merge([
    P.capsule(0.12, 0.7, '#FFFFFF', { rot: [0, 0, Math.PI / 2] }),
    P.box(0.22, 0.03, 1.1, '#FFFFFF', { at: [0.05, 0, 0] }),
    P.box(0.14, 0.28, 0.03, PAL.hotpink, { at: [-0.42, 0.16, 0] }),
    P.box(0.7, 0.04, 0.012, PAL.hotpink, { at: [0, 0.02, 0.122] }),
  ]), bag, 1.5))
  plane.visible = false
  root.add(plane)
  return { root, clerk, bell, orchids, maps, map, poster, fob, bags, sky: sky.tex, plane, clock, garland }
}

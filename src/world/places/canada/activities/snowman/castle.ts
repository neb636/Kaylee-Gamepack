// Old Quebec up on the cliff behind the carnival park, in the toon look: the castle hotel (the Château Frontenac: brick
// walls with pale stone bands, steep green copper roofs with dormers, a tall middle tower, round turrets with pointed
// caps, a flag on top), the terrace in front of it with its green railing and two little pavilions (where the horse and
// carriage clip-clop past), the old stone city wall either side, and the old town's pastel houses with snow on their
// steep roofs. Some of the castle's windows are always lit; a tap lights all of them (setWindows).
import { Color, Group, Mesh, MeshBasicMaterial, type BufferGeometry } from 'three'
import { clamp } from '../../../../../sdk'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../../engine3d/geo'
import { CASTLE, CLIFF_Y, CLIFF_Z, TERRACE_HALF, TERRACE_Z } from './park'

const BRICK = '#E39B85'
const BRICK_DARK = '#CC8572'
const TRIM = '#F4E8DC'
const COPPER = '#7FCDB2'
const COPPER_DARK = '#5FB096'
const COPPER_LIGHT = '#A6E0CB'
const SNOW = '#FBFBFF'
const STONE = '#DCD2C6'
const STONE_DARK = '#C8BCB0'
const ROCK = '#C8C0D4'
const ROCK_DARK = '#B5ACC4'
const RAIL = '#4F9C83'
const DOOR = '#6E4B5E'
const WINDOW_DARK = new Color('#6E6288')
const WINDOW_LIT = new Color('#FFE58A')
const LIT = '#FFE08A'

export interface OldTown {
  root: Group
  /** The castle (for the tap target and the sparkles): its front middle, in the world. */
  castle: Group
  /** How lit the castle's other windows are (0..1). */
  setWindows(k: number): void
}

/** A steep roof along x: `w` long, `d` deep at the eaves, `h` tall, with a flat ridge `top` deep (its bottom at y). */
function roofX(w: number, d: number, h: number, top: number, color: string, at: [number, number, number]) {
  return P.prism(
    [
      [-d / 2, 0],
      [d / 2, 0],
      [top / 2, h],
      [-top / 2, h],
    ],
    w,
    color,
    { at, rot: [0, Math.PI / 2, 0] },
  )
}

/** A four-sided pointed roof with its faces toward ±x and ±z (a cone of 4 turned 45°), `r` to its corners. */
const pyramid = (r: number, h: number, color: string, at: [number, number, number]) => P.cone(r, h, color, { at, rot: [0, Math.PI / 4, 0] }, 4)

export function buildOldTown(bag: Bag): OldTown {
  const root = new Group()
  const rnd = mulberry(11)

  // ---------------------------------------------------------------- the cliff, the wall and the terrace
  const cliff: BufferGeometry[] = [
    P.box(110, CLIFF_Y, 50, ROCK, { at: [0, CLIFF_Y / 2, CLIFF_Z - 25] }),
    P.box(110, 0.3, 50, SNOW, { at: [0, CLIFF_Y + 0.1, CLIFF_Z - 25] }),
    // Snow banked against its foot.
    P.box(110, 0.9, 1.2, SNOW, { at: [0, 0.3, CLIFF_Z + 0.3], rot: [-0.5, 0, 0] }),
  ]
  // Rocks sticking out of the cliff face, with snow on their ledges.
  for (let i = 0; i < 46; i++) {
    const x = -44 + i * 1.95 + rnd() * 0.8
    const y = 0.8 + rnd() * (CLIFF_Y - 1.4)
    const w = 1.2 + rnd() * 1.6
    const h = 0.5 + rnd() * 0.7
    cliff.push(P.rbox(w, h, 0.5, 0.18, i % 3 ? ROCK_DARK : ROCK, { at: [x, y, CLIFF_Z + 0.05] }))
    if (rnd() < 0.55) cliff.push(P.rbox(w * 0.85, 0.12, 0.42, 0.05, SNOW, { at: [x, y + h / 2 + 0.04, CLIFF_Z + 0.12] }))
  }
  // The old stone wall along the edge: two tones of blocks; battlements beyond the terrace, a green railing along it.
  const WALL_Z = CLIFF_Z - 0.6
  cliff.push(P.box(110, 1.1, 0.8, STONE, { at: [0, CLIFF_Y + 0.55, WALL_Z] }))
  for (let row = 0; row < 2; row++)
    for (let x = -54 + row * 0.6; x < 54; x += 1.2) if (rnd() < 0.45) cliff.push(P.box(1.05, 0.45, 0.06, STONE_DARK, { at: [x, CLIFF_Y + 0.3 + row * 0.5, WALL_Z + 0.41] }))
  for (let x = -54; x <= 54; x += 1.6) {
    if (Math.abs(x) < TERRACE_HALF) continue
    cliff.push(P.box(0.8, 0.5, 0.8, STONE, { at: [x, CLIFF_Y + 1.35, WALL_Z] }))
    cliff.push(P.box(0.8, 0.1, 0.8, SNOW, { at: [x, CLIFF_Y + 1.64, WALL_Z] }))
  }
  // The terrace: a boardwalk under snow from the wall back to the castle, a railing, two pavilions with green roofs.
  cliff.push(P.box(TERRACE_HALF * 2, 0.08, 4.4, '#EFE6F4', { at: [0, CLIFF_Y + 0.29, TERRACE_Z + 0.4] }))
  const rail: BufferGeometry[] = []
  for (let x = -TERRACE_HALF; x <= TERRACE_HALF + 0.01; x += 1.1) rail.push(P.cyl(0.05, 0.05, 0.85, RAIL, { at: [x, CLIFF_Y + 1.5, WALL_Z] }, 6))
  rail.push(P.box(TERRACE_HALF * 2, 0.1, 0.12, RAIL, { at: [0, CLIFF_Y + 1.92, WALL_Z] }))
  rail.push(P.box(TERRACE_HALF * 2, 0.06, 0.08, RAIL, { at: [0, CLIFF_Y + 1.45, WALL_Z] }))
  rail.push(P.box(TERRACE_HALF * 2, 0.06, 0.16, SNOW, { at: [0, CLIFF_Y + 2.0, WALL_Z] }))
  for (const s of [-1, 1]) {
    const px = s * (TERRACE_HALF - 1.4)
    const pz = WALL_Z - 1.1
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      rail.push(P.cyl(0.07, 0.07, 2.2, TRIM, { at: [px + Math.cos(a) * 0.9, CLIFF_Y + 1.4, pz + Math.sin(a) * 0.9] }, 6))
    }
    rail.push(P.cyl(1.05, 1.05, 0.18, TRIM, { at: [px, CLIFF_Y + 2.55, pz] }, 6))
    rail.push(P.cone(1.25, 1.3, COPPER, { at: [px, CLIFF_Y + 3.3, pz] }, 6))
    rail.push(P.cone(0.62, 0.36, SNOW, { at: [px, CLIFF_Y + 3.82, pz] }, 6))
    rail.push(P.sphere(0.14, COPPER_DARK, { at: [px, CLIFF_Y + 4.05, pz] }, 8))
  }
  root.add(solid(merge(cliff), bag, 1.6), solid(merge(rail), bag, 1.4))

  // ---------------------------------------------------------------- the castle hotel
  const castle = new Group()
  castle.position.set(CASTLE.x, CLIFF_Y, CASTLE.z)
  const c: BufferGeometry[] = []
  const plain: BufferGeometry[] = []
  /** Windows that are always lit, and the ones a tap lights up. */
  const lit: BufferGeometry[] = []
  const dark: BufferGeometry[] = []
  const win = (x: number, y: number, z: number, w = 0.52, h = 0.78, on = rnd() < 0.35) => {
    ;(on ? lit : dark).push(P.box(w, h, 0.08, '#FFFFFF', { at: [x, y, z] }))
    plain.push(P.box(w + 0.14, 0.08, 0.14, TRIM, { at: [x, y - h / 2 - 0.04, z - 0.02] }))
  }

  // The plinth of pale stone it stands on.
  c.push(P.box(23, 0.8, 10, STONE, { at: [0, 0.4, -0.5] }))

  // The tall middle tower: brick with two stone bands, a steep copper roof with dormers, turrets at its corners.
  const TZ = -1
  const TH = 11
  c.push(P.box(6, TH, 6, BRICK, { at: [0, TH / 2, TZ] }))
  for (const y of [3.7, 7.5]) c.push(P.box(6.16, 0.26, 6.16, TRIM, { at: [0, y, TZ] }))
  c.push(P.box(6.4, 0.3, 6.4, TRIM, { at: [0, TH + 0.1, TZ] }))
  c.push(pyramid(4.6, 5.8, COPPER, [0, TH + 0.25 + 2.9, TZ]))
  c.push(P.cyl(0.05, 0.05, 1.6, COPPER_DARK, { at: [0, TH + 6.6, TZ] }, 6))
  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    c.push(P.cyl(0.5, 0.5, 2.0, BRICK, { at: [sx * 3, TH - 0.3, TZ + sz * 3] }, 12))
    c.push(P.cone(0.66, 2.0, COPPER_DARK, { at: [sx * 3, TH + 1.7, TZ + sz * 3] }, 12))
  }
  // Dormers on the roof's front: little brick boxes with pointed copper hats, a window each.
  const face = (dy: number) => 4.6 * Math.SQRT1_2 * (1 - dy / 5.8)
  for (const [x, dy] of [
    [-1.15, 1.2],
    [1.15, 1.2],
    [0, 3.0],
  ]) {
    const z = TZ + face(dy) + 0.12
    c.push(P.box(0.8, 1.0, 0.9, TRIM, { at: [x, TH + 0.25 + dy, z - 0.2] }))
    c.push(pyramid(0.66, 0.75, COPPER_DARK, [x, TH + 0.25 + dy + 0.86, z - 0.2]))
    win(x, TH + 0.2 + dy, z + 0.26, 0.42, 0.56)
  }
  // Its windows: four across, six rows (the door at the bottom in the middle).
  for (const y of [1.6, 2.9, 4.6, 6.0, 8.4, 9.8]) for (const x of [-1.8, -0.6, 0.6, 1.8]) if (y > 2 || Math.abs(x) > 1) win(x, y, TZ + 3.05, 0.55, 0.8)
  c.push(P.rbox(1.5, 2.2, 0.3, 0.2, DOOR, { at: [0, 1.1, TZ + 3.05] }))
  c.push(P.rbox(1.9, 0.3, 0.5, 0.1, TRIM, { at: [0, 2.3, TZ + 3.1] }))
  // The flag on top (red and white, like Canada's).
  c.push(P.cyl(0.04, 0.04, 2.2, '#5A4A5E', { at: [0, TH + 8.4, TZ] }, 6))
  plain.push(P.box(0.04, 0.6, 0.3, '#E8443F', { at: [0, TH + 9.15, TZ + 0.17] }))
  plain.push(P.box(0.04, 0.6, 0.4, '#FFFFFF', { at: [0, TH + 9.15, TZ + 0.52] }))
  plain.push(P.box(0.04, 0.6, 0.3, '#E8443F', { at: [0, TH + 9.15, TZ + 0.87] }))
  plain.push(P.sphere(0.1, '#E8443F', { at: [0.03, TH + 9.15, TZ + 0.52], scale: [0.4, 1, 1] }, 8))

  // The two front wings, with steep copper roofs, a row of dormers and chimneys with snow on top.
  const WH = 6.5
  const WZ = 0.5
  for (const s of [-1, 1]) {
    const wx = s * 6.8
    c.push(P.box(7, WH, 5, BRICK_DARK, { at: [wx, WH / 2, WZ] }))
    c.push(P.box(7.12, 0.24, 5.12, TRIM, { at: [wx, 3.2, WZ] }))
    c.push(P.box(7.3, 0.26, 5.4, TRIM, { at: [wx, WH + 0.05, WZ] }))
    c.push(roofX(7.2, 5.5, 3.6, 1.2, COPPER, [wx, WH + 0.18, WZ]))
    c.push(P.box(7.2, 0.14, 1.3, SNOW, { at: [wx, WH + 3.85, WZ] }))
    // A chimney with snow on top.
    c.push(P.box(0.5, 1.4, 0.5, BRICK, { at: [wx + s * 1.9, WH + 3.6, WZ - 0.2] }))
    c.push(P.box(0.62, 0.14, 0.62, SNOW, { at: [wx + s * 1.9, WH + 4.36, WZ - 0.2] }))
    for (const k of [-2, 0, 2]) {
      const x = wx + k
      const z = WZ + 2.75 - 2.15 * (1.3 / 3.6) + 0.15
      c.push(P.box(0.8, 1.0, 1.0, TRIM, { at: [x, WH + 1.5, z - 0.25] }))
      c.push(
        P.prism(
          [
            [-0.55, 0],
            [0.55, 0],
            [0, 0.7],
          ],
          1.1,
          COPPER_DARK,
          { at: [x, WH + 2.0, z - 0.3] },
        ),
      )
      win(x, WH + 1.45, z + 0.27, 0.4, 0.55)
    }
    // Its windows: four across, four rows.
    for (const y of [1.4, 2.6, 4.2, 5.5]) for (const k of [-1.65, -0.55, 0.55, 1.65]) win(wx + k, y, WZ + 2.55)
    // The round towers: tall ones at the outer corners, thinner ones beside the middle tower.
    for (const [tx, tz, r, h, capR, capH] of [
      [s * 10.3, WZ + 2.4, 1.3, 8.2, 1.62, 3.8],
      [s * 3.45, WZ + 2.1, 0.95, 9.6, 1.2, 3.0],
    ]) {
      c.push(P.cyl(r, r, h, BRICK, { at: [tx, h / 2, tz] }, 20))
      c.push(P.cyl(r + 0.06, r + 0.06, 0.24, TRIM, { at: [tx, 3.2, tz] }, 20))
      c.push(P.cyl(r + 0.16, r + 0.16, 0.28, TRIM, { at: [tx, h, tz] }, 20))
      c.push(P.cone(capR, capH, COPPER_DARK, { at: [tx, h + 0.14 + capH / 2, tz] }, 20))
      c.push(P.cone(capR * 0.32, capH * 0.3, SNOW, { at: [tx, h + 0.14 + capH * 0.86, tz] }, 12))
      c.push(P.sphere(0.12, COPPER_LIGHT, { at: [tx, h + capH + 0.2, tz] }, 8))
      for (let y = 1.6; y < h - 0.8; y += 1.5) win(tx, y, tz + r + 0.02, 0.42, 0.66)
    }
  }
  // The back wing behind, lower, with two more turrets: the castle has depth from the side.
  c.push(P.box(17, 5.5, 5, BRICK_DARK, { at: [0, 2.75, -6.5] }))
  c.push(roofX(17.2, 5.5, 3.4, 1.0, COPPER_DARK, [0, 5.6, -6.5]))
  for (const s of [-1, 1]) {
    c.push(P.cyl(1.0, 1.0, 7.4, BRICK, { at: [s * 8.6, 3.7, -8] }, 16))
    c.push(P.cone(1.3, 3.2, COPPER, { at: [s * 8.6, 9.0, -8] }, 16))
  }
  castle.add(solidMix(c, plain, bag, 2))
  const litMat = bag.add(new MeshBasicMaterial({ color: LIT }))
  castle.add(new Mesh(bag.add(merge(lit)), litMat))
  const winMat = bag.add(new MeshBasicMaterial({ color: WINDOW_DARK.clone() }))
  castle.add(new Mesh(bag.add(merge(dark)), winMat))
  root.add(castle)

  // ---------------------------------------------------------------- the old town
  // Pastel stone houses with steep roofs under snow, along the terrace either side of the castle, and spruces behind.
  const town: BufferGeometry[] = []
  const townPlain: BufferGeometry[] = []
  const WALLS = ['#F4E3C8', '#F7E2A0', '#D9CFC4', '#BFD8EE', '#F6C3A5', '#CDE8D2', '#F2D0DA']
  const ROOFS = ['#E8726A', COPPER, '#B9C2D6', '#7C8AB0', COPPER_DARK]
  for (const s of [-1, 1]) {
    let x = 13.5
    let i = 0
    while (x < 42) {
      const w = 2.8 + rnd() * 1.4
      const h = 2.6 + rnd() * 1.6
      const d = 3.2
      const z = TERRACE_Z - 2.7 - rnd() * 0.8 - (i % 2) * 1.4
      const hx = s * (x + w / 2)
      town.push(P.box(w, h, d, WALLS[(i * 3 + (s > 0 ? 1 : 0)) % WALLS.length], { at: [hx, CLIFF_Y + h / 2, z] }))
      town.push(
        P.prism(
          [
            [-d / 2 - 0.2, 0],
            [d / 2 + 0.2, 0],
            [0, 2],
          ],
          w + 0.2,
          ROOFS[(i + (s > 0 ? 2 : 0)) % ROOFS.length],
          { at: [hx, CLIFF_Y + h, z], rot: [0, Math.PI / 2, 0] },
        ),
      )
      town.push(
        P.prism(
          [
            [-0.95, 0.95],
            [0.95, 0.95],
            [0, 2.06],
          ],
          w + 0.26,
          SNOW,
          { at: [hx, CLIFF_Y + h, z], rot: [0, Math.PI / 2, 0] },
        ),
      )
      town.push(P.box(0.45, 1.1, 0.45, BRICK, { at: [hx + w * 0.25, CLIFF_Y + h + 1.4, z - 0.4] }))
      town.push(P.box(0.56, 0.14, 0.56, SNOW, { at: [hx + w * 0.25, CLIFF_Y + h + 2.0, z - 0.4] }))
      town.push(P.rbox(0.62, 1.05, 0.1, 0.06, i % 2 ? '#E8443F' : RAIL, { at: [hx - w * 0.22, CLIFF_Y + 0.55, z + d / 2 + 0.03] }))
      const cols = w > 3.4 ? [-0.2, 0.25] : [0.22]
      for (const k of cols) for (const y of h > 3.3 ? [1.1, 2.4] : [1.4]) townPlain.push(P.box(0.48, 0.62, 0.06, rnd() < 0.4 ? LIT : '#7C70A0', { at: [hx + k * w + (k > 0 ? 0 : 0.35), CLIFF_Y + y, z + d / 2 + 0.03] }))
      x += w + 0.15
      i++
    }
  }
  root.add(solidMix(town, townPlain, bag, 1.6))

  return {
    root,
    castle,
    setWindows(k: number) {
      winMat.color.copy(WINDOW_DARK).lerp(WINDOW_LIT, clamp(k))
    },
  }
}

/** A little seeded random, so the town looks the same every time. */
export function mulberry(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

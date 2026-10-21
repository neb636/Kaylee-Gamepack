// The Golden Mountain, built from simple shapes in the house's toon look (greybox: no generated art). The flower mats,
// the painted wall behind (a green hill, a sun, two elephants with kids riding), the yellow cone with its Thai pattern
// bands, the flat top with its red rail and the bell under a little roof, the shiny steel slide down the front onto a
// pink mat, the monkeys' rock and ledge, and a flag on the rail for each round. The holds are made one by one
// (golden.ts places them for each round).
import { CatmullRomCurve3, Group, MeshBasicMaterial, Mesh, TubeGeometry, Vector3, type BufferGeometry, type Curve } from 'three'
import type { Bag } from '../../../../engine/dispose'
import { bake, merge, P, solid } from '../../../../engine/geo'
import { PAL } from '../../../../engine/toon'
import { trough } from '../../harborland/build'
import { BANDS, BELL, CONE, ELEPHANTS, FLAG_A, HOLD_COLORS, MAT, MONKEYS, onCone, rAt, SLIDE_A, slidePath, WALL_Z, type HoldColor } from './layout'

export interface Built {
  root: Group
  /** The pattern bands round the cone (they ripple gold when tapped). */
  bands: Group[]
  /** The bell, swinging from its beam; the rope hangs from it. */
  bell: Group
  rope: Group
  /** The steel slide's path (where she sits), and the shine that runs down it. */
  slide: Curve<Vector3>
  shine: Mesh
  /** A flag on the rail for each round (pink, pink, gold with a star). */
  flags: Group[]
  /** The two painted elephants' trunks (they go up), and where each sprays from. */
  trunks: Group[]
  picks: Group[]
}

const GOLD = '#FFD23F'
const GOLD_DARK = '#E8A92A'
const RED = '#FF5A5A'
const STEEL = '#D5DAE3'
const STEEL_RIM = '#8E95A6'
const v = (x: number, y: number, z: number) => new Vector3(x, y, z)

/** A flat painted shape on the wall (an ellipse `w` by `h` radii). */
const dab = (x: number, y: number, w: number, h: number, c: string, z = WALL_Z + 0.05) => P.cyl(1, 1, 0.02, c, { at: [x, y, z], rot: [Math.PI / 2, 0, 0], scale: [w, 1, h] }, 24)

/** A climbing hold: a chunky rounded blob with a bolt in the middle, facing out of the cone. */
export function holdShape(color: HoldColor, bag: Bag) {
  const c = HOLD_COLORS[color]
  return solid(merge([P.sphere(0.13, c, { scale: [1.25, 0.85, 0.62] }, 14), P.sphere(0.035, '#FFFFFF', { at: [0, 0.01, 0.07] }, 8)]), bag, 2)
}

/** A gold ring that glows round a hold she can reach. */
export function haloMesh(bag: Bag) {
  const m = new Mesh(bag.add(P.torus(0.19, 0.035, '#FFFFFF')), bag.add(new MeshBasicMaterial({ color: '#FFE27A', transparent: true, opacity: 0.8, depthWrite: false })))
  m.renderOrder = 4
  return m
}

export function buildGolden(bag: Bag): Built {
  const root = new Group()
  const picks: Group[] = []
  const add = <T extends Group>(g: T, pick?: string) => {
    root.add(g)
    if (pick) {
      g.userData.pick = pick
      picks.push(g)
    }
    return g
  }

  // ---- The flower mats, and the painted wall behind ----
  const floor: BufferGeometry[] = []
  for (let x = -7; x < 7; x++) for (let z = -5; z < 5; z++) floor.push(P.box(1, 0.1, 1, (x + z) % 2 ? '#E9E1FF' : '#DCD0FA', { at: [x + 0.5, -0.05, z + 0.5] }))
  const flowers: [number, number][] = [[-3.4, 1.6], [-1.6, 2.6], [2.9, 2.9], [4.2, 0.6], [-4.8, -0.4], [4.6, -2.4], [-0.6, 3.6], [-4.2, 3.2]]
  for (const [fx, fz] of flowers) {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2
      floor.push(P.cyl(0.1, 0.1, 0.012, ['#FF8FB8', '#8EC9F5', '#FFFFFF'][Math.abs(Math.round(fx)) % 3], { at: [fx + Math.cos(a) * 0.13, 0.006, fz + Math.sin(a) * 0.13] }, 10))
    }
    floor.push(P.cyl(0.065, 0.065, 0.016, PAL.gold, { at: [fx, 0.008, fz] }, 10))
  }
  add(solid(merge(floor), bag, 0))
  const wall: BufferGeometry[] = [P.box(16, 7, 0.2, '#EBDDFF', { at: [0, 3.5, WALL_Z - 0.1] })]
  // A green hill, a sun and clouds, flat like the hall's.
  wall.push(dab(0, 0.4, 6.2, 2.6, '#CFF3E3'), dab(-4.4, 0.2, 2.4, 1.6, '#BDEBD5', WALL_Z + 0.04), dab(4.6, 0.3, 2.6, 1.8, '#BDEBD5', WALL_Z + 0.04))
  wall.push(dab(4.4, 5.0, 0.7, 0.7, '#FFE680'))
  for (const [cx, cy, s] of [[-2.6, 5.2, 1], [1.8, 5.6, 0.8], [-5.4, 4.6, 0.7]] as [number, number, number][]) wall.push(dab(cx, cy, 0.9 * s, 0.38 * s, '#FFFFFF'), dab(cx - 0.6 * s, cy - 0.08 * s, 0.55 * s, 0.3 * s, '#FFFFFF', WALL_Z + 0.06), dab(cx + 0.6 * s, cy - 0.06 * s, 0.5 * s, 0.28 * s, '#FFFFFF', WALL_Z + 0.06))
  add(solid(merge(wall), bag, 0))

  // ---- The painted elephants with kids riding (flat, inked); their trunks on their own pivots ----
  const trunks: Group[] = []
  ELEPHANTS.forEach((e, i) => {
    const d = e.dir
    const z = WALL_Z + 0.08
    const parts: BufferGeometry[] = [
      dab(e.x, e.y, 0.95, 0.62, e.color, z),
      dab(e.x + d * 0.85, e.y + 0.28, 0.45, 0.45, e.color, z + 0.01),
      dab(e.x + d * 0.68, e.y + 0.25, 0.28, 0.38, '#FFB8CC', z + 0.02),
      dab(e.x + d * 1.0, e.y + 0.38, 0.06, 0.06, PAL.ink, z + 0.02),
      ...[-0.55, -0.2, 0.25, 0.6].map((lx) => P.box(0.24, 0.6, 0.02, e.color, { at: [e.x + lx, e.y - 0.75, z - 0.005] })),
      P.box(0.05, 0.4, 0.02, e.color, { at: [e.x - d * 0.98, e.y - 0.1, z], rot: [0, 0, d * 0.4] }),
      // A saddle cloth, and the kid riding on top (a dress, a face, pigtails).
      dab(e.x - d * 0.05, e.y + 0.48, 0.45, 0.16, GOLD, z + 0.02),
      dab(e.x - d * 0.05, e.y + 0.82, 0.2, 0.3, i ? '#FF8FB8' : '#8FE3C8', z + 0.03),
      dab(e.x - d * 0.05, e.y + 1.18, 0.17, 0.17, '#F6D9B8', z + 0.04),
      dab(e.x - d * 0.05 - 0.17, e.y + 1.22, 0.08, 0.1, '#5A4148', z + 0.035),
      dab(e.x - d * 0.05 + 0.17, e.y + 1.22, 0.08, 0.1, '#5A4148', z + 0.035),
      ...[-1, 1].map((sx) => dab(e.x - d * 0.05 + sx * 0.06, e.y + 1.2, 0.022, 0.022, PAL.ink, z + 0.05)),
      P.box(0.05, 0.3, 0.02, i ? '#FF8FB8' : '#8FE3C8', { at: [e.x - d * 0.05 + d * 0.22, e.y + 0.98, z + 0.03], rot: [0, 0, -d * 0.9] }),
    ]
    add(solid(merge(parts), bag, 1.5), `ele:${i}`)
    const trunk = new Group()
    trunk.position.set(e.x + d * 1.18, e.y + 0.18, z + 0.015)
    trunk.add(solid(merge(Array.from({ length: 7 }, (_, j) => dab(d * (0.05 + j * 0.035), -0.08 - j * 0.08, 0.1 - j * 0.006, 0.1 - j * 0.006, e.color, 0))), bag, 1.5))
    trunk.userData.dir = d
    add(trunk, `ele:${i}`)
    trunks.push(trunk)
  })

  // ---- The Golden Mountain: a yellow cone up to a flat top ----
  const C = CONE
  add(solid(merge([P.cyl(C.rt, C.r0, C.top, GOLD, { at: [C.x, C.top / 2, C.z] }, 40), P.cyl(C.rt + 0.04, C.rt + 0.04, 0.1, '#FBEA9A', { at: [C.x, C.top - 0.03, C.z] }, 40)]), bag, 2), 'cone')
  // The pattern bands: a red ring with a row of little gold flames (a Thai kranok, simply) on the front half.
  const slope = Math.atan((C.r0 - C.rt) / C.top)
  const bands = BANDS.map((y) => {
    const r = rAt(y)
    const parts: BufferGeometry[] = [P.torus(r + 0.015, 0.06, RED, { at: [C.x, y, C.z], rot: [Math.PI / 2, 0, 0] }), P.torus(rAt(y + 0.2) + 0.01, 0.025, GOLD_DARK, { at: [C.x, y + 0.2, C.z], rot: [Math.PI / 2, 0, 0] })]
    for (let a = -1.7; a <= 1.75; a += 0.24) {
      const [x, yy, z] = onCone(a, y + 0.1, 0.02)
      parts.push(P.prism([[-0.07, 0], [0.07, 0], [0.02, 0.07], [0, 0.14], [-0.02, 0.07]], 0.03, GOLD_DARK, { at: [x, yy - 0.06, z], rot: [-slope, a, 0] }))
    }
    const g = solid(merge(parts), bag, 1.5)
    add(g, 'band')
    // (Scaled round the cone's middle when they ripple.)
    g.position.set(C.x, y, C.z)
    g.children.forEach((m) => m.position.set(-C.x, -y, -C.z))
    return g
  })

  // ---- The red rail round the top (a gap at the slide's mouth), its posts ----
  const railR = C.rt - 0.06
  const railPts: Vector3[] = []
  const gap = 0.42
  for (let i = 0; i <= 40; i++) {
    const a = SLIDE_A + gap + ((Math.PI * 2 - 2 * gap) * i) / 40
    railPts.push(v(C.x + Math.sin(a) * railR, C.top + 0.45, C.z + Math.cos(a) * railR))
  }
  const rail: BufferGeometry[] = [bake(new TubeGeometry(new CatmullRomCurve3(railPts), 60, 0.045, 6), RED)]
  for (let i = 0; i < 9; i++) {
    const a = SLIDE_A + gap + ((Math.PI * 2 - 2 * gap) * i) / 8
    rail.push(P.cyl(0.035, 0.035, 0.45, RED, { at: [C.x + Math.sin(a) * railR, C.top + 0.22, C.z + Math.cos(a) * railR] }, 6))
  }
  add(solid(merge(rail), bag, 2), 'rail')

  // ---- The bell: a little red sala on top (two posts, a beam, a gold roof), the bell hanging in the middle ----
  const B = BELL
  add(
    solid(
      merge([
        ...[-1, 1].map((s) => P.cyl(0.05, 0.05, 1.6, RED, { at: [B.x + s * 0.42, C.top + 0.8, B.z] }, 8)),
        P.box(1.0, 0.08, 0.1, RED, { at: [B.x, C.top + 1.58, B.z] }),
        P.prism([[-0.65, 0], [0.65, 0], [0, 0.42]], 0.5, GOLD, { at: [B.x, C.top + 1.62, B.z] }),
        P.prism([[-0.66, -0.01], [0.66, -0.01], [0.6, 0.05], [-0.6, 0.05]], 0.52, RED, { at: [B.x, C.top + 1.62, B.z] }),
        P.cone(0.04, 0.22, GOLD_DARK, { at: [B.x, C.top + 2.15, B.z] }, 8),
      ]),
      bag,
      2,
    ),
    'bell',
  )
  const bellG = new Group()
  bellG.position.set(B.x, C.top + 1.55, B.z)
  bellG.add(solid(merge([P.cyl(0.03, 0.03, 0.12, GOLD_DARK, { at: [0, -0.06, 0] }, 8), P.sphere(0.13, GOLD, { at: [0, -0.18, 0], scale: [1, 0.8, 1] }), P.cyl(0.13, 0.2, 0.2, GOLD, { at: [0, -0.3, 0] }, 18), P.torus(0.2, 0.025, GOLD_DARK, { at: [0, -0.4, 0], rot: [Math.PI / 2, 0, 0] }), P.sphere(0.05, GOLD_DARK, { at: [0, -0.44, 0] }, 8)]), bag, 2))
  const rope = new Group()
  rope.position.set(0, -0.44, 0)
  rope.add(solid(merge([P.cyl(0.018, 0.018, 0.5, '#E8B574', { at: [0, -0.25, 0] }, 6), P.sphere(0.05, RED, { at: [0, -0.52, 0] }, 10)]), bag, 1.5))
  bellG.add(rope)
  add(bellG, 'bell')

  // ---- The flags on the back of the rail, one a round ----
  const flags = FLAG_A.map((a, i) => {
    const g = new Group()
    const [x, , z] = onCone(a, C.top, -0.06)
    g.position.set(x, C.top + 0.45, z)
    const gold = i === 2
    g.add(solid(merge([P.cyl(0.025, 0.025, 0.9, '#FFFFFF', { at: [0, 0.45, 0] }, 6), P.sphere(0.04, GOLD, { at: [0, 0.92, 0] }, 8), P.prism([[0, 0], [0.42, 0.13], [0, 0.26]], 0.025, gold ? GOLD : PAL.hotpink, { at: [0.02, 0.6, 0] }), ...(gold ? [P.prism(Array.from({ length: 10 }, (_, j): [number, number] => { const aa = Math.PI / 2 + (j * Math.PI) / 5; const rr = j % 2 ? 0.035 : 0.075; return [0.14 + Math.cos(aa) * rr, 0.73 + Math.sin(aa) * rr] }), 0.035, '#FFFFFF')] : [])]), bag, 1.5))
    g.visible = false
    root.add(g)
    return g
  })

  // ---- The steel slide down the front, onto the pink mat ----
  const slide = new CatmullRomCurve3(slidePath().map((p) => v(...p)))
  add(trough(slide, 0.3, STEEL, STEEL_RIM, 50, bag), 'chute')
  const shine = new Mesh(bag.add(P.box(0.5, 0.02, 0.12, '#FFFFFF')), bag.add(new MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.85, depthWrite: false })))
  shine.visible = false
  shine.renderOrder = 5
  root.add(shine)
  add(solid(merge([P.rbox(MAT.w, 0.14, MAT.d, 0.06, '#FF8FB8', { at: [MAT.at[0], 0.07, MAT.at[2]], rot: [0, SLIDE_A, 0] }), P.box(MAT.w - 0.2, 0.01, 0.06, '#FFFFFF', { at: [MAT.at[0], 0.145, MAT.at[2]], rot: [0, SLIDE_A, 0] })]), bag, 2), 'mat')

  // ---- The monkeys' rock at the foot, and their ledge halfway up ----
  const [rx, , rz] = MONKEYS[0].at
  add(solid(merge([P.sphere(0.36, '#C9BBA8', { at: [rx, 0.1, rz], scale: [1.2, 0.6, 1] }, 14)]), bag, 2))
  const [lx, ly, lz] = MONKEYS[1].at
  add(solid(merge([P.cyl(0.24, 0.2, 0.08, GOLD_DARK, { at: [lx, ly - 0.02, lz] }, 14)]), bag, 1.5))

  return { root, bands, bell: bellG, rope, slide, shine, flags, trunks, picks }
}

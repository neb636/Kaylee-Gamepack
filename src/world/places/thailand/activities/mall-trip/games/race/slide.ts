// The racing slide built from simple shapes in the house's toon look (greybox): four wavy orange lanes as one open
// shell with ink rims along the dividers, solid sides down to the floor, the top deck with its fence, the eight steps
// up the left with a padded rail, a flag at the top of each lane, the start lights, the ball pit's padded walls, the
// ribbon board, and the dark hall behind (HarborLand's ceiling with its strip lights). Still things are merged into a
// few meshes; what moves (the rail, the flags, the lamps, the bump stripes in her lane) comes back as its own piece.
import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshToonMaterial, PlaneGeometry, TubeGeometry, Vector3 } from 'three'
import type { Bag } from '../../../../engine/dispose'
import { bake, merge, P, solid, type V3 } from '../../../../engine/geo'
import { PAL, toon, toonGradient } from '../../../../engine/toon'
import { BOARD, CRESTS, DECK, FLAG_COLORS, FLAG_H, LAMPS, LANE_W, LANES, laneSlope, laneY, laneZ, PIT, RAIL_X, SLIDE, STEPS, stepAt } from './layout'

export const RC = {
  lane: '#FF9A3C',
  lane2: '#FFAD55',
  rim: '#FFF1E0',
  side: '#FF8530',
  deck: '#C9B5F7',
  deckSide: '#B9A6F5',
  step1: '#FF8FB8',
  step2: '#FFB3CF',
  rail: '#FF4F9A',
  pitWall: '#8EC9F5',
  pitTop: '#FFFFFF',
  pitFloor: '#FFD6E7',
  floor: '#E3D8FA',
  wall: '#4A4166',
  light: '#FFF7E0',
  board: '#FFFFFF',
  boardFrame: '#B9A6F5',
}

export interface Built {
  root: Group
  rail: Group
  flags: Group[]
  /** The start lights: red, yellow, green (their own materials, to light up). */
  lamps: { root: Group; mats: MeshBasicMaterial[] }
  board: Group
  /** Where each ribbon pins on the board (world). */
  slots: Vector3[]
  /** A stripe across her lane at each bump's crest (lights up when a tap would make her fly). */
  stripes: { mesh: Mesh; mat: MeshBasicMaterial }[]
  /** Things with userData.pick, for taps on the canvas. */
  picks: Group[]
}

const v = (x: number, y: number, z: number) => new Vector3(x, y, z)
const S = 180

export function buildSlide(bag: Bag): Built {
  const root = new Group()
  const picks: Group[] = []
  const add = (g: Group, pick?: string) => {
    root.add(g)
    if (pick) {
      g.userData.pick = pick
      picks.push(g)
    }
    return g
  }

  // ---- The hall: the floor mats, and the dark back wall with its strip lights ----
  const floor = new Mesh(bag.add(new PlaneGeometry(60, 60)), toon(RC.floor))
  floor.rotation.x = -Math.PI / 2
  root.add(floor)
  add(solid(merge([
    P.box(30, 9, 0.2, RC.wall, { at: [0, 4.5, -12.5] }),
    ...[-6, -2, 2, 6].map((x) => P.box(2.6, 0.12, 0.08, RC.light, { at: [x, 6.6, -12.35] })),
    ...[-6, -2, 2, 6].map((x) => P.box(2.6, 0.12, 0.08, RC.light, { at: [x, 5.6, -12.35] })),
  ]), bag, 0))

  // ---- The lanes: one open shell (floor and low walls per lane), striped across like the real ones ----
  {
    const hw = LANE_W / 2 - 0.01
    const cross: [number, number][] = [[-hw, 0.2], [-hw + 0.05, 0.05], [-hw + 0.13, 0], [hw - 0.13, 0], [hw - 0.05, 0.05], [hw, 0.2]]
    const pos: number[] = []
    const col: number[] = []
    const idx: number[] = []
    let base = 0
    LANES.forEach((lx, li) => {
      const c = new Color(li % 2 ? RC.lane2 : RC.lane)
      for (let i = 0; i <= S; i++) {
        const u = i / S
        const k = Math.floor(i / 6) % 2 ? 0.93 : 1
        for (const [dx, dy] of cross) {
          pos.push(lx + dx, laneY(u) + dy, laneZ(u))
          col.push(c.r * k, c.g * k, c.b * k)
        }
      }
      const n = cross.length
      for (let i = 0; i < S; i++)
        for (let j = 0; j < n - 1; j++) {
          const a = base + i * n + j
          const b = a + n
          idx.push(a, a + 1, b, b, a + 1, b + 1)
        }
      base += (S + 1) * n
    })
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
    geo.setAttribute('color', new BufferAttribute(new Float32Array(col), 3))
    geo.setIndex(idx)
    geo.computeVertexNormals()
    const shell = new Mesh(bag.add(geo), bag.add(new MeshToonMaterial({ vertexColors: true, gradientMap: toonGradient(), side: DoubleSide })))
    root.add(shell)
    // Ink rims along the top of every divider.
    const rims = [-2, -1, 0, 1, 2].map((k) => {
      const pts: Vector3[] = []
      for (let i = 0; i <= 60; i++) pts.push(v(k * LANE_W, laneY(i / 60) + 0.2, laneZ(i / 60)))
      return bake(new TubeGeometry(new CatmullRomCurve3(pts), 120, 0.04, 6), RC.rim)
    })
    // The finish: a checkered band across the lanes just before the lip.
    const fin: ReturnType<typeof bake>[] = []
    const uf = 0.965
    const tilt = -Math.atan(laneSlope(uf))
    for (let i = 0; i < 16; i++)
      for (let j = 0; j < 2; j++)
        fin.push(P.box(LANE_W / 4, 0.012, 0.11, (i + j) % 2 ? PAL.ink : '#FFFFFF', { at: [-2 * LANE_W + (i + 0.5) * (LANE_W / 4), laneY(uf + j * 0.0125) + 0.012, laneZ(uf + j * 0.0125)], rot: [tilt, 0, 0] }))
    add(solid(merge([...rims, ...fin]), bag, 2))
  }

  // ---- The slide's sides, down to the floor (the wavy profile, cut out), and the top deck on its tower ----
  {
    const prof: [number, number][] = []
    for (let i = 0; i <= 80; i++) prof.push([-laneZ(i / 80), laneY(i / 80) - 0.02])
    prof.push([-SLIDE.z1, 0], [-DECK.z0, 0], [-DECK.z0, SLIDE.y0 - 0.02])
    const side = (x: number) => P.prism(prof.slice().reverse(), 0.08, RC.side, { at: [x, 0, 0], rot: [0, Math.PI / 2, 0] })
    add(solid(merge([
      side(-2 * LANE_W - 0.04),
      side(2 * LANE_W + 0.04),
      // The bottom lip's front, under the end of the lanes.
      P.box(4 * LANE_W, SLIDE.y1 - 0.02, 0.06, RC.side, { at: [0, (SLIDE.y1 - 0.02) / 2, SLIDE.z1 - 0.03] }),
    ]), bag, 2))
    const fence: ReturnType<typeof P.box>[] = []
    for (let x = DECK.x0 + 0.1; x <= DECK.x1; x += 0.5) fence.push(P.cyl(0.035, 0.035, 0.7, PAL.hotpink, { at: [x, DECK.y + 0.35, DECK.z0 + 0.06] }))
    for (let z = DECK.z0 + 0.06; z <= DECK.z1 - 0.1; z += 0.45) fence.push(P.cyl(0.035, 0.035, 0.7, PAL.hotpink, { at: [DECK.x1 - 0.05, DECK.y + 0.35, z] }))
    add(solid(merge([
      // The deck and the tower under it.
      P.rbox(DECK.x1 - DECK.x0, 0.16, DECK.z1 - DECK.z0, 0.05, RC.deck, { at: [(DECK.x0 + DECK.x1) / 2, DECK.y - 0.08, (DECK.z0 + DECK.z1) / 2] }),
      P.box(DECK.x1 - DECK.x0 - 0.2, DECK.y - 0.16, DECK.z1 - DECK.z0 - 0.1, RC.deckSide, { at: [(DECK.x0 + DECK.x1) / 2, (DECK.y - 0.16) / 2, (DECK.z0 + DECK.z1) / 2 - 0.05] }),
      ...fence,
      P.cyl(0.045, 0.045, DECK.x1 - DECK.x0, PAL.hotpink, { at: [(DECK.x0 + DECK.x1) / 2, DECK.y + 0.7, DECK.z0 + 0.06], rot: [0, 0, Math.PI / 2] }),
      P.cyl(0.045, 0.045, DECK.z1 - DECK.z0 - 0.1, PAL.hotpink, { at: [DECK.x1 - 0.05, DECK.y + 0.7, (DECK.z0 + DECK.z1) / 2 - 0.05], rot: [Math.PI / 2, 0, 0] }),
    ]), bag, 2))
  }

  // ---- The steps: eight soft blocks up the left side ----
  add(solid(merge(Array.from({ length: STEPS.n }, (_, i) => {
    const [x, y, z] = stepAt(i + 1)
    return P.rbox(STEPS.w, y, STEPS.run + 0.02, 0.04, i % 2 ? RC.step2 : RC.step1, { at: [x, y / 2, z] })
  })), bag, 2), 'steps')

  // ---- The rail up the outside of the steps (padded, it plays notes) ----
  const rail = new Group()
  {
    const tops: Vector3[] = []
    const posts: ReturnType<typeof P.cyl>[] = []
    for (let k = 0; k <= STEPS.n; k++) {
      const [, y, z] = k ? stepAt(k) : [0, 0, STEPS.foot + 0.2]
      const top = v(RAIL_X, y + 0.75, z)
      tops.push(top)
      if (k % 2 === 0) posts.push(P.cyl(0.04, 0.04, top.y - 0.02, '#FFFFFF', { at: [RAIL_X, top.y / 2, z] }))
    }
    tops.push(v(RAIL_X, DECK.y + 0.75, DECK.z0 + 0.1))
    rail.add(solid(merge([...posts, bake(new TubeGeometry(new CatmullRomCurve3(tops), 60, 0.07, 8), RC.rail)]), bag, 2))
  }
  add(rail, 'rail')

  // ---- A flag at the top of each lane ----
  const flags = LANES.map((lx, i) => {
    const g = new Group()
    g.position.set(lx + LANE_W / 2 - 0.02, DECK.y, SLIDE.z0 - 0.12)
    g.add(solid(merge([
      P.cyl(0.03, 0.03, FLAG_H, '#FFFFFF', { at: [0, FLAG_H / 2, 0] }),
      P.sphere(0.06, PAL.gold, { at: [0, FLAG_H + 0.03, 0] }),
      P.prism([[0, 0], [0.5, 0.17], [0, 0.34]], 0.04, FLAG_COLORS[i], { at: [0.02, FLAG_H - 0.38, 0] }),
    ]), bag, 2))
    return add(g, `flag:${i}`)
  })

  // ---- The start lights on a pole at the right of the deck ----
  const lamps = { root: new Group(), mats: [] as MeshBasicMaterial[] }
  {
    const L = lamps.root
    L.position.set(LAMPS.x, LAMPS.y, LAMPS.z)
    L.add(solid(merge([
      P.cyl(0.05, 0.05, LAMPS.y - DECK.y, '#FFFFFF', { at: [0, -(LAMPS.y - DECK.y) / 2, 0] }),
      P.rbox(0.36, 0.98, 0.2, 0.06, PAL.ink, { at: [0, 0.32, 0] }),
    ]), bag, 2))
    ;['#FF4F6A', '#FFC83D', '#5BD88A'].forEach((_, i) => {
      const mat = bag.add(new MeshBasicMaterial({ color: '#6D6377' }))
      const m = new Mesh(bag.add(P.sphere(0.12, '#ffffff', {}, 14)), mat)
      m.position.set(0, 0.64 - i * 0.31, 0.1)
      L.add(m)
      lamps.mats.push(mat)
    })
    add(L, 'lamps')
  }

  // ---- The ball pit's padded walls and floor ----
  {
    const { x0, x1, z0, z1, wall } = PIT
    const w = 0.16
    add(solid(merge([
      P.box(x1 - x0, 0.02, z1 - z0, RC.pitFloor, { at: [(x0 + x1) / 2, 0.01, (z0 + z1) / 2] }),
      P.rbox(x1 - x0 + 2 * w, wall, w, 0.05, RC.pitWall, { at: [(x0 + x1) / 2, wall / 2, z1 + w / 2] }),
      P.rbox(w, wall, z1 - z0 + w, 0.05, RC.pitWall, { at: [x0 - w / 2, wall / 2, (z0 + z1) / 2 + w / 2] }),
      P.rbox(w, wall, z1 - z0 + w, 0.05, RC.pitWall, { at: [x1 + w / 2, wall / 2, (z0 + z1) / 2 + w / 2] }),
      P.capsule(0.09, x1 - x0 + 2 * w - 0.18, RC.pitTop, { at: [(x0 + x1) / 2, wall + 0.04, z1 + w / 2], rot: [0, 0, Math.PI / 2] }),
      P.capsule(0.09, z1 - z0 + w - 0.18, RC.pitTop, { at: [x0 - w / 2, wall + 0.04, (z0 + z1) / 2 + w / 2], rot: [Math.PI / 2, 0, 0] }),
      P.capsule(0.09, z1 - z0 + w - 0.18, RC.pitTop, { at: [x1 + w / 2, wall + 0.04, (z0 + z1) / 2 + w / 2], rot: [Math.PI / 2, 0, 0] }),
    ]), bag, 2))
  }

  // ---- The ribbon board: a white board in a lavender frame on two legs ----
  const board = new Group()
  board.position.set(BOARD.x, BOARD.y, BOARD.z)
  board.add(solid(merge([
    P.rbox(BOARD.w + 0.12, BOARD.h + 0.12, 0.06, 0.04, RC.boardFrame, { at: [0, 0, -0.01] }),
    P.box(BOARD.w, BOARD.h, 0.03, RC.board, { at: [0, 0, 0.02] }),
    ...[-1, 1].map((s) => P.cyl(0.04, 0.04, BOARD.y, '#FFFFFF', { at: [s * (BOARD.w / 2 - 0.08), -BOARD.y / 2, -0.04] })),
    P.sphere(0.07, PAL.gold, { at: [0, BOARD.h / 2 + 0.1, 0] }),
  ]), bag, 2))
  add(board, 'board')
  const slots: Vector3[] = []
  for (let i = 0; i < BOARD.slots; i++) slots.push(v(BOARD.x + ((i % 3) - 1) * 0.3, BOARD.y + 0.3 - Math.floor(i / 3) * 0.52, BOARD.z + 0.08))

  // ---- A stripe across her lane at each crest (rounds 2 and 3) ----
  const stripes = CRESTS.map((u) => {
    const mat = bag.add(new MeshBasicMaterial({ color: '#FFD0E4' }))
    const mesh = new Mesh(bag.add(P.box(LANE_W - 0.3, 0.02, 0.16, '#ffffff')), mat)
    mesh.position.set(LANES[0], laneY(u) + 0.012, laneZ(u))
    mesh.visible = false
    root.add(mesh)
    return { mesh, mat }
  })

  return { root, rail, flags, lamps, board, slots, stripes, picks }
}

/** A winner's ribbon: a pink rosette with a gold middle and two tails, facing her. */
export function buildRibbon(bag: Bag): Group {
  const petals = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2
    return P.sphere(0.075, i % 2 ? PAL.hotpink : PAL.pink, { at: [Math.cos(a) * 0.13, Math.sin(a) * 0.13, 0], scale: [1, 1, 0.4] }, 10)
  })
  return solid(merge([
    P.box(0.09, 0.28, 0.02, PAL.hotpink, { at: [-0.06, -0.2, -0.02], rot: [0, 0, 0.25] }),
    P.box(0.09, 0.28, 0.02, PAL.hotpink, { at: [0.06, -0.2, -0.02], rot: [0, 0, -0.25] }),
    ...petals,
    P.cyl(0.1, 0.1, 0.05, PAL.gold, { rot: [Math.PI / 2, 0, 0], at: [0, 0, 0.03] }),
    P.sphere(0.05, '#FFFFFF', { at: [0, 0, 0.05], scale: [1, 1, 0.4] }, 10),
  ] as ReturnType<typeof P.box>[]), bag, 2)
}

export type { V3 }

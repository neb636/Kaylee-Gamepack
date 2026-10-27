// Bo Kluea's street outside the salt hut, in the toon look, cooler and greener for the mountains (plan: "The look in
// 3D"): the rain-wet road (darker, with shiny streaks and puddles that drizzle rings across), its ditches and the power
// poles along it, the wooden house across the road with the Tai Lue couple painted big on its wall (from Dad's video,
// drawn by us in our flat style), the neighbours' houses, banana plants, bamboo and trees, and behind it all the green
// mountains with low cloud lying on them (a painted ring all the way round, and soft clouds that drift). A scooter
// putters past now and then, on the far lane (Thailand drives on the left).
import { BackSide, CanvasTexture, CylinderGeometry, Group, Mesh, MeshBasicMaterial, PlaneGeometry, RepeatWrapping, RingGeometry, SRGBColorSpace } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { blobShadow, merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { MURAL, ROAD_Z, type V3 } from './layout'

const ROAD = '#8F8BA6'
const ROAD_WET = '#A9B4CF'
const PUDDLE = '#C4D9EE'
const GRASS = '#86BE86'
const GRASS_DARK = '#6FAE7E'
const PLANK = '#A57C64'
const PLANK_DARK = '#7E5A4C'
const TIN = '#B7B9C9'
const TIN_RUST = '#C99A86'

const rnd = (i: number, j = 0) => {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453
  return s - Math.floor(s)
}

export interface Village {
  root: Group
  mural: Group
  scooter: Group
  /** The scooter's wheels (they spin) and its rider (bobs). */
  wheels: Group[]
  /** Low clouds on the mountains (they drift; soft, no outline). */
  clouds: Group[]
  /** Drizzle rings on the puddles (each one grows and fades, then starts again somewhere else). */
  rings: Mesh[]
  puddles: V3[]
  /** A hen and her chicks pecking about in the yard in front of the hut. */
  hen: { root: Group; head: Group }
  chicks: Group[]
}

export function buildVillage(bag: Bag): Village {
  const root = new Group()
  const roadN = ROAD_Z + 1.0
  const roadF = ROAD_Z - 1.0
  // ---- The ground, the road and its edges ----
  const ground = [
    // Grass all round (so no screen sees past its edge), and the packed earth in front of the hut.
    P.box(60, 0.05, 40, GRASS, { at: [0, -0.09, 0] }),
    P.box(12, 0.02, 4, '#C2B19F', { at: [0, -0.06, 3.4] }),
    // The road: wet asphalt, a lighter wet sheen down its middle, the centre dashes, the ditches either side.
    P.box(40, 0.04, roadN - roadF, ROAD, { at: [0, -0.05, ROAD_Z] }),
    ...Array.from({ length: 16 }, (_, i) => P.box(0.8, 0.006, 0.07, '#F4F0E8', { at: [-17 + i * 2.3, -0.027, ROAD_Z] })),
    ...[roadN + 0.12, roadF - 0.12].map((z) => P.box(40, 0.05, 0.22, '#7B9C84', { at: [0, -0.07, z] })),
    ...[roadN + 0.03, roadF - 0.03].map((z) => P.box(40, 0.06, 0.05, '#C9C3D6', { at: [0, -0.04, z] })),
    // The grass verge across the road and the yard in front of the house.
    P.box(40, 0.04, 8, GRASS_DARK, { at: [0, -0.07, roadF - 4.2] }),
    P.box(5.4, 0.02, 0.9, '#C2B19F', { at: [MURAL.x + 0.2, -0.04, MURAL.z + 0.5] }),
  ]
  root.add(solid(merge(ground), bag, 0))
  // The wet shine: soft light streaks along the road, and puddles (flat, no lighting: they mirror the pale sky).
  const sheen = new MeshBasicMaterial({ color: ROAD_WET, transparent: true, opacity: 0.55, depthWrite: false })
  bag.add(sheen)
  const streaks: [number, number, number][] = [[-6.5, -0.35, 2.6], [-2.4, 0.4, 1.8], [1.6, -0.5, 2.4], [5.2, 0.3, 2.0], [8.5, -0.2, 2.2], [-9.5, 0.2, 2.4]]
  for (const [x, dz, w] of streaks) {
    const m = new Mesh(bag.add(new PlaneGeometry(w, 0.12)), sheen)
    m.rotation.x = -Math.PI / 2
    m.position.set(x, -0.026, ROAD_Z + dz)
    root.add(m)
  }
  const puddles: V3[] = [[-3.3, -0.024, ROAD_Z + 0.55], [2.6, -0.024, ROAD_Z - 0.55], [-0.6, -0.024, ROAD_Z + 0.35], [5.8, -0.024, ROAD_Z + 0.5], [-6.8, -0.024, ROAD_Z - 0.4], [-1.4, -0.034, 2.55], [1.9, -0.034, 3.1]]
  const pMat = bag.add(new MeshBasicMaterial({ color: PUDDLE }))
  for (const [i, [x, y, z]] of puddles.entries()) {
    const m = new Mesh(bag.add(new CylinderGeometry(1, 1, 0.004, 24)), pMat)
    m.scale.set(0.45 + rnd(i, 1) * 0.35, 1, 0.16 + rnd(i, 2) * 0.08)
    m.position.set(x, y, z)
    root.add(m)
  }
  const ringMat = bag.add(new MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0, depthWrite: false }))
  const rings = Array.from({ length: 6 }, () => {
    const r = new Mesh(bag.add(new RingGeometry(0.8, 1, 24)), ringMat.clone())
    bag.add(r.material as MeshBasicMaterial)
    r.rotation.x = -Math.PI / 2
    r.userData.t = Math.random()
    root.add(r)
    return r
  })
  // ---- The yard in front of the hut: a row of stones along the floor's edge, tufts of grass and little pink flowers ----
  const yard = [
    ...Array.from({ length: 22 }, (_, i) => P.sphere(0.09 + rnd(i, 11) * 0.04, i % 3 ? '#B7B0C6' : '#C9C3D6', { at: [-3.7 + i * 0.355, 0.0, 1.93 + rnd(i, 12) * 0.05], scale: [1.3, 0.55, 1] }, 8)),
    ...Array.from({ length: 16 }, (_, i): ReturnType<typeof P.box>[] => {
      const x = -3.6 + rnd(i, 13) * 7.2
      const z = 2.15 + rnd(i, 14) * 1.6
      return [0, 1, 2].map((k) => P.cone(0.025, 0.16 + k * 0.03, k % 2 ? '#7CC46E' : '#6CB462', { at: [x + (k - 1) * 0.035, 0.06, z], rot: [0, 0, (k - 1) * 0.35] }, 5))
    }).flat(),
    ...Array.from({ length: 9 }, (_, i): ReturnType<typeof P.box>[] => {
      const x = -3.4 + rnd(i, 15) * 6.8
      const z = 2.3 + rnd(i, 16) * 1.4
      return [P.cyl(0.008, 0.008, 0.16, '#6CB462', { at: [x, 0.05, z] }, 4), P.sphere(0.04, i % 2 ? PAL.pink : '#FFFFFF', { at: [x, 0.14, z], scale: [1, 0.6, 1] }, 8), P.sphere(0.016, '#FFC83D', { at: [x, 0.16, z] }, 6)]
    }).flat(),
  ]
  root.add(solid(merge(yard), bag, 2))
  // The hen and her chicks.
  const hen = new Group()
  hen.position.set(1.0, 0, 2.75)
  hen.rotation.y = -0.4
  hen.userData.pick = 'hen'
  hen.add(
    solid(
      merge([
        P.sphere(0.15, '#C98A5A', { at: [0, 0.2, 0], scale: [1.25, 0.95, 0.95] }),
        P.sphere(0.1, '#B5754A', { at: [-0.04, 0.22, 0], scale: [1.2, 0.7, 1.12] }),
        P.cone(0.07, 0.14, '#9E6440', { at: [-0.18, 0.3, 0], rot: [0, 0, 0.8] }, 6),
        ...[1, -1].map((s) => P.cyl(0.01, 0.01, 0.1, '#FFB43C', { at: [0.02, 0.05, s * 0.05] }, 6)),
      ]),
      bag,
      2,
    ),
  )
  const henHead = new Group()
  henHead.position.set(0.14, 0.32, 0)
  henHead.add(solid(merge([P.sphere(0.06, '#C98A5A'), P.cone(0.02, 0.05, '#FFB43C', { at: [0.065, -0.005, 0], rot: [0, 0, -Math.PI / 2] }, 6), ...[0, 1].map((k) => P.sphere(0.02, '#FF5A6E', { at: [-0.005 + k * 0.025, 0.055, 0] }, 6)), ...[1, -1].map((s) => P.sphere(0.01, PAL.ink, { at: [0.03, 0.015, s * 0.045] }, 6))]), bag, 2))
  hen.add(henHead)
  hen.add(blobShadow(0.2, bag))
  root.add(hen)
  const chicks = ([[1.45, 2.95], [1.3, 2.5], [0.6, 3.05]] as [number, number][]).map(([x, z], i) => {
    const c = solid(merge([P.sphere(0.06, '#FFE27A', { at: [0, 0.06, 0] }), P.sphere(0.04, '#FFE27A', { at: [0.045, 0.11, 0] }), P.cone(0.012, 0.03, '#FFB43C', { at: [0.09, 0.105, 0], rot: [0, 0, -Math.PI / 2] }, 5), ...[1, -1].map((s) => P.sphere(0.008, PAL.ink, { at: [0.07, 0.12, s * 0.025] }, 5))]), bag, 2)
    c.position.set(x, 0, z)
    c.rotation.y = i * 2.1
    c.userData.home = [x, z]
    c.userData.pick = 'hen'
    c.add(blobShadow(0.09, bag))
    root.add(c)
    return c
  })
  // ---- The wooden house across the road, with the couple painted on its wall ----
  const hx = MURAL.x + 0.2
  const hz = MURAL.z - 1.0
  const wallTop = 2.55
  const house = [
    // Plank walls (lines of darker planks either side of the mural), on a low stone footing.
    P.box(5.0, 0.22, 2.2, '#B7B0C6', { at: [hx, 0.11, hz] }),
    P.box(4.8, wallTop - 0.2, 2.0, PLANK, { at: [hx, 0.2 + (wallTop - 0.2) / 2, hz] }),
    ...Array.from({ length: 13 }, (_, i) => -2.35 + i * 0.39)
      .filter((x) => Math.abs(hx + x - MURAL.x) > MURAL.w / 2 + 0.08)
      .map((x) => P.box(0.025, wallTop - 0.3, 0.02, PLANK_DARK, { at: [hx + x, 0.25 + (wallTop - 0.3) / 2, hz + 1.005] })),
    // The mural's painted frame.
    P.box(MURAL.w + 0.16, MURAL.h + 0.16, 0.02, '#E7A07A', { at: [MURAL.x, MURAL.y, MURAL.z + 0.002] }),
    // A window with blue shutters on each side, and the door.
    ...[-1, 1].flatMap((s) => {
      const x = MURAL.x + s * (MURAL.w / 2 + 0.55)
      return [
        P.box(0.5, 0.6, 0.03, '#4E4060', { at: [x, 1.45, MURAL.z] }),
        ...[-1, 1].map((k) => P.box(0.24, 0.62, 0.04, '#7FB6D9', { at: [x + k * 0.38, 1.45, MURAL.z + 0.01], rot: [0, k * 0.5, 0] })),
        P.box(0.62, 0.05, 0.12, PLANK_DARK, { at: [x, 1.12, MURAL.z + 0.04] }),
      ]
    }),
    // The tin roof: a gable along the road, overhanging, with a ridge cap; rusty stripes.
    ...[-1, 1].map((s) => P.box(5.6, 0.06, 1.6, TIN, { at: [hx, wallTop + 0.4, hz + s * 0.72], rot: [s * 0.5, 0, 0] })),
    ...[-1, 1].flatMap((s) => Array.from({ length: 4 }, (_, i) => P.box(0.18, 0.065, 1.55, TIN_RUST, { at: [hx - 2.1 + i * 1.3 + rnd(i, s) * 0.3, wallTop + 0.405, hz + s * 0.72], rot: [s * 0.5, 0, 0] }))),
    P.box(5.6, 0.08, 0.16, '#9A9CB0', { at: [hx, wallTop + 0.78, hz] }),
    P.prism([[-1.0, 0], [1.0, 0], [0, 0.72]], 4.8, PLANK, { at: [hx, wallTop, hz], rot: [0, Math.PI / 2, 0] }),
    // Potted plants and a bench by the wall.
    ...[-1, 1].flatMap((s) => {
      const x = hx + s * 2.6
      return [P.cyl(0.16, 0.12, 0.28, '#D98E6E', { at: [x, 0.14, MURAL.z + 0.35] }, 10), P.sphere(0.26, '#5FAE6E', { at: [x, 0.42, MURAL.z + 0.35], scale: [1, 0.9, 1] }, 10)]
    }),
  ]
  root.add(solid(merge(house), bag, 2))
  const mural = new Group()
  mural.userData.pick = 'mural'
  mural.position.set(MURAL.x, MURAL.y, MURAL.z + 0.018)
  mural.add(new Mesh(bag.add(new PlaneGeometry(MURAL.w, MURAL.h)), bag.add(new MeshBasicMaterial({ map: muralTexture(bag) }))))
  root.add(mural)
  // ---- The neighbours: a little shop with an awning on the left, a wooden house on stilts on the right ----
  const nb = [
    // The shop: pastel walls, a striped awning, its open front dark inside, crates out front.
    P.box(3.2, 2.2, 2.2, '#F2D4C4', { at: [-5.0, 1.1, hz - 0.1] }),
    P.box(2.4, 1.4, 0.03, '#5E4E6E', { at: [-5.0, 0.8, hz + 1.0] }),
    ...Array.from({ length: 6 }, (_, i) => P.box(0.55, 0.05, 0.9, i % 2 ? '#FFFFFF' : PAL.pink, { at: [-6.37 + i * 0.55, 1.8, hz + 1.4], rot: [0.35, 0, 0] })),
    P.box(3.5, 0.06, 2.6, TIN, { at: [-5.0, 2.3, hz - 0.1], rot: [0.12, 0, 0] }),
    ...[-5.6, -4.4].map((x) => P.rbox(0.45, 0.32, 0.35, 0.04, '#FFC83D', { at: [x, 0.16, hz + 1.5] })),
    // The house on stilts.
    ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => P.cyl(0.07, 0.07, 1.1, PLANK_DARK, { at: [6.4 + sx * 1.3, 0.55, hz + sz * 0.8] }, 8))),
    P.box(3.0, 1.5, 2.0, '#B98A6E', { at: [6.4, 1.85, hz] }),
    P.box(0.55, 0.5, 0.03, '#4E4060', { at: [5.9, 1.95, hz + 1.01] }),
    P.box(0.55, 0.5, 0.03, '#4E4060', { at: [7.0, 1.95, hz + 1.01] }),
    ...[-1, 1].map((s) => P.box(3.5, 0.06, 1.4, TIN_RUST, { at: [6.4, 2.95, hz + s * 0.62], rot: [s * 0.55, 0, 0] })),
    P.prism([[-1.0, 0], [1.0, 0], [0, 0.65]], 3.0, '#B98A6E', { at: [6.4, 2.6, hz], rot: [0, Math.PI / 2, 0] }),
    // A water jar under it, a bike leaning on a stilt.
    P.cyl(0.22, 0.16, 0.45, '#8E5A4A', { at: [6.0, 0.22, hz + 0.3] }, 12),
  ]
  root.add(solid(merge(nb), bag, 2))
  // ---- Power poles along the far side of the road, the wires sagging between them ----
  const poleXs = [-7.5, -2.5, 3.6, 8.6]
  const poleZ = roadF - 0.35
  const poles = poleXs.flatMap((x) => [P.cyl(0.07, 0.09, 4.2, '#C9C3D6', { at: [x, 2.1, poleZ] }, 8), P.box(0.9, 0.06, 0.06, '#9C95AE', { at: [x, 3.9, poleZ] })])
  root.add(solid(merge(poles), bag, 2))
  const wires: ReturnType<typeof P.box>[] = []
  for (let i = 0; i < poleXs.length - 1; i++)
    for (const dx of [-0.38, 0.38]) {
      const x0 = poleXs[i] + dx
      const x1 = poleXs[i + 1] + dx
      const n = 10
      for (let k = 0; k < n; k++) {
        const a = k / n
        const b = (k + 1) / n
        const ya = 3.92 - Math.sin(a * Math.PI) * 0.45
        const yb = 3.92 - Math.sin(b * Math.PI) * 0.45
        const len = Math.hypot((x1 - x0) / n, yb - ya)
        wires.push(P.box(len, 0.018, 0.018, '#4E4060', { at: [x0 + (x1 - x0) * (a + b) / 2, (ya + yb) / 2, poleZ], rot: [0, 0, Math.atan2(yb - ya, (x1 - x0) / n)] }))
      }
    }
  root.add(solid(merge(wires), bag, 0))
  // ---- Banana plants, bamboo and trees behind the houses and round the hut ----
  const green = [
    // Round trees behind the houses.
    ...([[-8.6, -7.6, 1.5], [-3.0, -7.4, 1.2], [3.2, -8.0, 1.6], [9.6, -7.0, 1.3], [-11.5, -6.0, 1.4], [12.0, -5.5, 1.6]] as V3[]).flatMap(([x, z, r], i) => [
      P.cyl(0.1, 0.13, 1.8, '#8E6A5C', { at: [x, 0.9, z] }, 6),
      P.sphere(r, i % 2 ? '#5FA878' : '#6CB884', { at: [x, 1.8 + r * 0.55, z], scale: [1, 0.85, 1] }, 12),
      P.sphere(r * 0.7, i % 2 ? '#6CB884' : '#7EC48E', { at: [x + r * 0.5, 2.1 + r * 0.5, z + 0.3] }, 10),
    ]),
    // Banana plants: a trunk and big drooping leaves.
    ...([[-3.3, -4.0], [-7.4, -4.4], [4.0, -4.5], [-4.6, 1.6], [4.4, 1.5]] as [number, number][]).flatMap(([x, z], i) => [
      P.cyl(0.08, 0.11, 1.3, '#9CB06E', { at: [x, 0.65, z] }, 8),
      ...[0, 1, 2, 3, 4].map((k) => {
        const a = (k / 5) * Math.PI * 2 + i
        return P.sphere(0.34, k % 2 ? '#7CC46E' : '#6CB462', { at: [x + Math.cos(a) * 0.38, 1.38 - (k % 2) * 0.1, z + Math.sin(a) * 0.38], rot: [0, -a, 0.55], scale: [1.7, 0.12, 0.6] }, 8)
      }),
    ]),
    // A clump of bamboo on the right, beside the stilt house.
    ...Array.from({ length: 7 }, (_, i) => P.cyl(0.05, 0.06, 3.6 + rnd(i, 3) * 1.2, i % 2 ? '#9CC46E' : '#86B65E', { at: [9.0 + rnd(i, 4) * 0.8, 1.9, hz + 1.2 + rnd(i, 5) * 0.6], rot: [0, 0, (rnd(i, 6) - 0.5) * 0.3] }, 6)),
    ...Array.from({ length: 6 }, (_, i) => P.sphere(0.5, '#8CCB78', { at: [9.0 + rnd(i, 7) * 1.4 - 0.3, 3.4 + rnd(i, 8) * 1.2, hz + 1.3 + rnd(i, 9) * 0.6], scale: [1.4, 0.45, 0.8] }, 8)),
  ]
  root.add(solid(merge(green), bag, 2))
  // ---- The mountains, with low cloud lying on them ----
  root.add(panorama(bag))
  const near = [
    // Two big green ridges just behind the village (in 3D, so they move a little against the ring).
    P.sphere(9, '#79B58E', { at: [-11, -3.6, -22], scale: [1.5, 0.75, 0.6] }, 20),
    P.sphere(10, '#6AA884', { at: [10, -4.2, -24], scale: [1.4, 0.75, 0.6] }, 20),
    P.sphere(7, '#8DC59C', { at: [0, -3.4, -18], scale: [1.8, 0.62, 0.6] }, 20),
  ]
  root.add(solid(merge(near), bag, 0))
  const clouds = ([[-9, 3.2, -17], [-1.5, 3.9, -19.5], [7, 3.4, -18], [14, 4.4, -21], [-15, 4.6, -22]] as V3[]).map(([x, y, z], i) => {
    const w = 1.8 + rnd(i, 70) * 1.4
    const g = solid(merge([P.sphere(0.8, '#FFFFFF', { scale: [w, 0.4, 1] }, 14), P.sphere(0.6, '#FFFFFF', { at: [w * 0.45, 0.18, 0.1], scale: [1.3, 0.6, 1] }, 12), P.sphere(0.55, '#F2F1F8', { at: [-w * 0.5, 0.06, -0.05], scale: [1.4, 0.55, 1] }, 12)]), bag, 0)
    g.position.set(x, y, z)
    g.userData.home = x
    root.add(g)
    return g
  })
  // ---- The scooter: a pink step-through with a rider in a lavender rain poncho and a helmet ----
  const scooter = new Group()
  const wheels = [0.28, -0.28].map((x) => {
    const w = solid(merge([P.cyl(0.14, 0.14, 0.07, '#3E3548', { rot: [Math.PI / 2, 0, 0] }, 14), P.cyl(0.06, 0.06, 0.08, '#C9C3D6', { rot: [Math.PI / 2, 0, 0] }, 10)]), bag, 2)
    w.position.set(x, 0.14, 0)
    scooter.add(w)
    return w
  })
  scooter.add(
    solid(
      merge([
        P.rbox(0.48, 0.16, 0.22, 0.06, PAL.pink, { at: [-0.06, 0.3, 0] }),
        P.rbox(0.12, 0.42, 0.2, 0.05, PAL.pink, { at: [0.24, 0.45, 0], rot: [0, 0, -0.25] }),
        P.rbox(0.3, 0.07, 0.2, 0.03, '#4E4060', { at: [-0.1, 0.43, 0] }),
        P.box(0.04, 0.04, 0.34, '#7E7A8E', { at: [0.3, 0.68, 0] }),
        P.sphere(0.045, '#FFF3B0', { at: [0.34, 0.56, 0] }, 8),
        // The rider: a poncho cone, arms to the handlebar, a round helmet.
        P.cone(0.2, 0.42, '#C9B6FF', { at: [-0.08, 0.65, 0] }, 12),
        P.capsule(0.035, 0.22, '#C9B6FF', { at: [0.12, 0.66, 0.09], rot: [0, 0, -1.2] }),
        P.capsule(0.035, 0.22, '#C9B6FF', { at: [0.12, 0.66, -0.09], rot: [0, 0, -1.2] }),
        P.sphere(0.1, '#F2C9A0', { at: [-0.05, 0.92, 0] }, 12),
        P.sphere(0.115, '#FFE27A', { at: [-0.07, 0.96, 0], scale: [1, 0.75, 1] }, 12),
      ]),
      bag,
      2,
    ),
  )
  scooter.add(blobShadow(0.35, bag))
  scooter.position.set(-20, 0, ROAD_Z - 0.45)
  root.add(scooter)
  return { root, mural, scooter, wheels, clouds, rings, puddles, hen: { root: hen, head: henHead }, chicks }
}

/** Each frame: the clouds drift, the drizzle rings spread on the puddles. */
export function stepVillage(v: Village, dt: number, t: number) {
  for (const [i, c] of v.clouds.entries()) c.position.x = (c.userData.home as number) + Math.sin(t * 0.04 + i * 1.9) * 2.2
  for (const [i, r] of v.rings.entries()) {
    let k = (r.userData.t as number) + dt / 1.3
    if (k >= 1) {
      k = 0
      const p = v.puddles[Math.floor(Math.random() * v.puddles.length)]
      r.position.set(p[0] + (Math.random() - 0.5) * 0.5, p[1] + 0.004, p[2] + (Math.random() - 0.5) * 0.12)
    }
    r.userData.t = k
    const s = 0.03 + k * 0.14
    r.scale.set(s, s, s)
    ;(r.material as MeshBasicMaterial).opacity = (1 - k) * 0.8 * (i < 4 ? 1 : 0.6)
  }
}

/** Far mountains with cloud lying on their tops, all the way round, painted on the inside of a big open cylinder: cool
 *  greens fading into a soft grey-lavender sky (the rainy season). */
function panorama(bag: Bag) {
  const c = document.createElement('canvas')
  c.width = 2048
  c.height = 512
  const g = c.getContext('2d')!
  const sky = g.createLinearGradient(0, 0, 0, 512)
  sky.addColorStop(0, '#C9CDE4')
  sky.addColorStop(0.6, '#E3E6F1')
  sky.addColorStop(1, '#EEF1F4')
  g.fillStyle = sky
  g.fillRect(0, 0, 2048, 512)
  // (Whole periods across the width, so the picture meets itself round the back.)
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
  const mist = (y: number, n: number, a: number) => {
    g.fillStyle = `rgba(255,255,255,${a})`
    for (let i = 0; i < n; i++) {
      g.beginPath()
      g.ellipse(60 + i * (2048 / n), y + (i % 3) * 18, 110 + (i % 4) * 26, 20 + (i % 2) * 9, 0, 0, Math.PI * 2)
      g.fill()
    }
  }
  ridge(300, 160, '#B4CBD0', [5, 13], 1)
  mist(205, 13, 0.85)
  ridge(370, 130, '#99C1A6', [7, 17], 3)
  mist(300, 11, 0.7)
  ridge(450, 90, '#82B795', [9, 22], 5)
  const tex = bag.add(new CanvasTexture(c))
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = RepeatWrapping
  const m = new Mesh(bag.add(new CylinderGeometry(45, 45, 26, 64, 1, true)), bag.add(new MeshBasicMaterial({ map: tex, side: BackSide, depthWrite: false })))
  m.position.set(0, 7, -2)
  m.renderOrder = -1
  return m
}

/** The Tai Lue couple painted on the house across the road, in our flat style (our own drawing, not a copy of the real
 *  one): she in a pink head wrap, a dark jacket with a pink trim and a striped pha sin; he in an indigo jacket with a
 *  white head cloth and a red sash; hand in hand and waving, the green mountains and flowers behind them. */
function muralTexture(bag: Bag) {
  const W = 1024
  const H = 612
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')!
  const ink = '#3A2B33'
  const shape = (draw: () => void, fill: string, line = 6) => {
    g.beginPath()
    draw()
    g.fillStyle = fill
    g.fill()
    g.lineWidth = line
    g.strokeStyle = ink
    g.lineJoin = 'round'
    g.stroke()
  }
  const poly = (pts: [number, number][], fill: string, line = 6) =>
    shape(() => {
      g.moveTo(...pts[0])
      for (const p of pts.slice(1)) g.lineTo(...p)
      g.closePath()
    }, fill, line)
  const oval = (x: number, y: number, rx: number, ry: number, fill: string, rot = 0, line = 6) => shape(() => g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2), fill, line)
  const dot = (x: number, y: number, r: number, fill: string) => {
    g.beginPath()
    g.ellipse(x, y, r, r, 0, 0, Math.PI * 2)
    g.fillStyle = fill
    g.fill()
  }
  // The painted wall: a pale sky, the mountains, a sun, a meadow with flowers.
  const sky = g.createLinearGradient(0, 0, 0, H)
  sky.addColorStop(0, '#CFE9F7')
  sky.addColorStop(1, '#F6EAD8')
  g.fillStyle = sky
  g.fillRect(0, 0, W, H)
  dot(860, 110, 56, '#FFD86B')
  for (const [y, col, amp] of [[330, '#A9D6B8', 120], [400, '#8CC79E', 90]] as const) {
    g.fillStyle = col
    g.beginPath()
    g.moveTo(0, H)
    for (let x = 0; x <= W; x += 16) g.lineTo(x, y - amp * (0.5 + 0.5 * Math.sin(x / 140 + y)))
    g.lineTo(W, H)
    g.fill()
  }
  g.fillStyle = '#B9DE9A'
  g.fillRect(0, 500, W, H - 500)
  for (let i = 0; i < 22; i++) {
    const x = 30 + i * 46 + (i % 3) * 7
    const y = 530 + (i % 4) * 18
    for (let k = 0; k < 5; k++) dot(x + Math.cos((k / 5) * 6.28) * 9, y + Math.sin((k / 5) * 6.28) * 9, 7, i % 2 ? '#FF8FB8' : '#FFFFFF')
    dot(x, y, 6, '#FFC83D')
  }
  // ---- She (on the left): striped pha sin, the jacket, her face, the pink head wrap, waving ----
  const sx = 400
  poly([[sx - 70, 330], [sx + 70, 330], [sx + 92, 575], [sx - 92, 575]], '#FF8FB8')
  for (const [i, y] of [360, 400, 440, 480, 520, 555].entries()) {
    const k = (y - 330) / 245
    g.fillStyle = ['#B97CE0', '#FFFFFF', '#3FA58A', '#FF4F9A', '#FFC83D', '#B97CE0'][i]
    g.fillRect(sx - 70 - k * 22 + 4, y, 140 + k * 44 - 8, 14)
  }
  poly([[sx - 70, 330], [sx + 70, 330], [sx + 92, 575], [sx - 92, 575]], 'rgba(0,0,0,0)')
  poly([[sx - 66, 200], [sx + 66, 200], [sx + 74, 338], [sx - 74, 338]], '#3E3A6E')
  poly([[sx - 10, 200], [sx + 10, 200], [sx + 50, 338], [sx + 30, 338]], '#FF8FB8', 4)
  // Her waving arm (up on the left) and the hand she holds his with (to the right).
  poly([[sx - 60, 215], [sx - 40, 240], [sx - 125, 160], [sx - 140, 175]], '#3E3A6E')
  oval(sx - 138, 150, 22, 24, '#F2C9A0')
  poly([[sx + 55, 220], [sx + 70, 245], [sx + 130, 300], [sx + 118, 318]], '#3E3A6E')
  oval(sx + 140, 314, 22, 20, '#F2C9A0')
  oval(sx, 140, 58, 62, '#F2C9A0')
  shape(() => {
    g.ellipse(sx, 98, 66, 42, 0, Math.PI, Math.PI * 2)
    g.closePath()
  }, '#FF4F9A')
  poly([[sx - 62, 100], [sx + 62, 100], [sx + 56, 116], [sx - 56, 116]], '#FF8FB8', 4)
  dot(sx - 20, 142, 7, ink)
  dot(sx + 20, 142, 7, ink)
  dot(sx - 18, 139, 2.5, '#FFFFFF')
  dot(sx + 22, 139, 2.5, '#FFFFFF')
  dot(sx - 34, 162, 11, '#FF9DB8')
  dot(sx + 34, 162, 11, '#FF9DB8')
  g.beginPath()
  g.arc(sx, 160, 16, 0.2, Math.PI - 0.2)
  g.lineWidth = 5
  g.strokeStyle = ink
  g.stroke()
  dot(sx - 58, 160, 7, '#D9D4E4')
  dot(sx + 58, 160, 7, '#D9D4E4')
  // ---- He (on the right): indigo jacket and trousers, the red sash, the white head cloth, waving ----
  const hx = 640
  poly([[hx - 64, 360], [hx + 64, 360], [hx + 70, 575], [hx + 10, 575], [hx, 430], [hx - 10, 575], [hx - 70, 575]], '#34386A')
  poly([[hx - 72, 205], [hx + 72, 205], [hx + 78, 368], [hx - 78, 368]], '#4A4F8C')
  poly([[hx - 78, 340], [hx + 78, 340], [hx + 80, 372], [hx - 80, 372]], '#E8505B', 4)
  for (const y of [240, 280, 320]) dot(hx, y, 6, '#FFFFFF')
  poly([[hx - 62, 220], [hx - 76, 245], [hx - 122, 300], [hx - 108, 318]], '#4A4F8C')
  poly([[hx + 62, 220], [hx + 44, 240], [hx + 128, 160], [hx + 142, 175]], '#4A4F8C')
  oval(hx + 140, 150, 22, 24, '#E5B488')
  oval(hx, 140, 58, 62, '#E5B488')
  shape(() => {
    g.ellipse(hx, 100, 64, 36, 0, Math.PI, Math.PI * 2)
    g.closePath()
  }, '#FFFFFF')
  poly([[hx + 50, 92], [hx + 92, 70], [hx + 86, 110]], '#FFFFFF', 4)
  dot(hx - 20, 142, 7, ink)
  dot(hx + 20, 142, 7, ink)
  dot(hx - 18, 139, 2.5, '#FFFFFF')
  dot(hx + 22, 139, 2.5, '#FFFFFF')
  dot(hx - 34, 162, 10, '#F5A0A8')
  dot(hx + 34, 162, 10, '#F5A0A8')
  g.beginPath()
  g.arc(hx, 158, 18, 0.2, Math.PI - 0.2)
  g.lineWidth = 5
  g.strokeStyle = ink
  g.stroke()
  // Their hands held between them, and a little heart above.
  oval(hx - 112, 314, 22, 20, '#E5B488')
  const heart = (x: number, y: number, s: number) =>
    shape(() => {
      g.moveTo(x, y + s * 0.9)
      g.bezierCurveTo(x - s * 1.4, y, x - s * 0.7, y - s, x, y - s * 0.35)
      g.bezierCurveTo(x + s * 0.7, y - s, x + s * 1.4, y, x, y + s * 0.9)
    }, '#FF4F9A', 5)
  heart(520, 250, 30)
  // The painted border.
  g.lineWidth = 16
  g.strokeStyle = '#C9785A'
  g.strokeRect(8, 8, W - 16, H - 16)
  const tex = bag.add(new CanvasTexture(c))
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

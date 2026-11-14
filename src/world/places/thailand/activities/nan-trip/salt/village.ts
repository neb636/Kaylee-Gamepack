// Bo Kluea's street outside the salt hut, in the toon look, cooler and greener for the mountains (plan: "The look in
// 3D"): the rain-wet road (darker, with shiny streaks and puddles that drizzle rings across), its ditches and the power
// poles along it, the wooden house across the road with the Tai Lue couple painted big on its wall (from Dad's video,
// drawn by us in our flat style), the neighbours' houses, banana plants, bamboo and trees, and behind it all the green
// mountains with low cloud lying on them (a painted ring all the way round, and soft clouds that drift). A scooter (the
// one on the Nan roads) putters past now and then, on the far lane (Thailand drives on the left).
import { BackSide, CanvasTexture, CylinderGeometry, Group, Mesh, MeshBasicMaterial, PlaneGeometry, RepeatWrapping, RingGeometry, SRGBColorSpace } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { blobShadow, merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { buildScooter, type Local } from '../../../trip/vehicles/locals'
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
  /** The mountains and sky painted round about (the dinner tints it for dusk). */
  sky: Mesh
  mural: Group
  scooter: Group
  /** The scooter itself: its wheels (they spin) and its riders (they blink and look about). */
  ride: Local
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
  const sky = panorama(bag)
  root.add(sky)
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
  // ---- The scooter: the Nan roads' step-through (trip/vehicles/locals.ts), a gecko on a pink one,
  // turned to drive along the road (+x) ----
  const ride = buildScooter(3, bag)
  ride.root.rotation.y = Math.PI / 2
  const scooter = new Group()
  scooter.add(ride.root, blobShadow(0.7, bag))
  scooter.scale.setScalar(0.85)
  scooter.position.set(-20, 0, ROAD_Z - 0.45)
  root.add(scooter)
  return { root, sky, mural, scooter, ride, clouds, rings, puddles, hen: { root: hen, head: henHead }, chicks }
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

/** The Tai Lue couple painted on the house across the road (from Dad's video), redrawn as two toy animals in the
 *  game's chibi look (2026-11-13: the stick figures looked lame): she a cream pony in a pink head wrap, an indigo
 *  jacket with silver buttons and a striped pha sin with a zigzag hem; he a brown bear in an indigo jacket, a white head
 *  cloth and a red sash. Hand in hand and waving, a heart between them, on a hillside of rice terraces with misty
 *  mountains, a smiling sun, birds and flowers, inside a painted border of woven diamonds. */
function muralTexture(bag: Bag) {
  const W = 1024
  const H = 612
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')!
  const ink = '#3A2B33'
  g.lineJoin = 'round'
  g.lineCap = 'round'
  const fillStroke = (fill: string, line = 6) => {
    g.fillStyle = fill
    g.fill()
    if (line > 0) {
      g.lineWidth = line
      g.strokeStyle = ink
      g.stroke()
    }
  }
  const oval = (x: number, y: number, rx: number, ry: number, fill: string, line = 6, rot = 0) => {
    g.beginPath()
    g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2)
    fillStroke(fill, line)
  }
  const dot = (x: number, y: number, r: number, fill: string) => oval(x, y, r, r, fill, 0)
  const path = (pts: [number, number][], fill: string, line = 6, closed = true) => {
    g.beginPath()
    g.moveTo(...pts[0])
    for (const p of pts.slice(1)) g.lineTo(...p)
    if (closed) g.closePath()
    fillStroke(fill, line)
  }
  /** A soft blob through the points (a rounded shape for skirts, jackets, mountains). */
  const blob = (pts: [number, number][], fill: string, line = 6) => {
    g.beginPath()
    const n = pts.length
    const mid = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
    g.moveTo(...mid(pts[n - 1], pts[0]))
    for (let i = 0; i < n; i++) g.quadraticCurveTo(...pts[i], ...mid(pts[i], pts[(i + 1) % n]))
    g.closePath()
    fillStroke(fill, line)
  }
  /** A thick round-ended limb with an ink outline: through the points. */
  const limb = (pts: [number, number][], w: number, fill: string) => {
    for (const [lw, col] of [[w + 10, ink], [w, fill]] as const) {
      g.beginPath()
      g.moveTo(...pts[0])
      if (pts.length === 3) g.quadraticCurveTo(...pts[1], ...pts[2])
      else for (const p of pts.slice(1)) g.lineTo(...p)
      g.lineWidth = lw
      g.strokeStyle = col
      g.stroke()
    }
  }
  const heart = (x: number, y: number, s: number, fill: string, line = 5) => {
    g.beginPath()
    g.moveTo(x, y + s * 0.9)
    g.bezierCurveTo(x - s * 1.5, y - s * 0.1, x - s * 0.75, y - s * 1.15, x, y - s * 0.4)
    g.bezierCurveTo(x + s * 0.75, y - s * 1.15, x + s * 1.5, y - s * 0.1, x, y + s * 0.9)
    fillStroke(fill, line)
  }

  // ---- The sky, the sun, the mountains with mist, the rice terraces ----
  const sky = g.createLinearGradient(0, 0, 0, 360)
  sky.addColorStop(0, '#BFE3F7')
  sky.addColorStop(1, '#FBEEDD')
  g.fillStyle = sky
  g.fillRect(0, 0, W, H)
  // The sun with a smile, its rays.
  g.save()
  g.translate(890, 112)
  for (let i = 0; i < 12; i++) {
    g.rotate(Math.PI / 6)
    path([[0, -70], [10, -92], [-10, -92]], '#FFC83D', 0)
  }
  g.restore()
  oval(890, 112, 54, 54, '#FFD86B', 5)
  dot(874, 106, 5, ink)
  dot(906, 106, 5, ink)
  dot(864, 124, 8, '#FFAA8A')
  dot(916, 124, 8, '#FFAA8A')
  g.beginPath()
  g.arc(890, 118, 14, 0.3, Math.PI - 0.3)
  g.lineWidth = 4
  g.strokeStyle = ink
  g.stroke()
  // Fluffy clouds.
  for (const [x, y, s] of [[150, 90, 1], [560, 60, 0.8], [720, 150, 0.6]] as const) {
    g.fillStyle = '#FFFFFF'
    g.beginPath()
    for (const [dx, dy, r] of [[-40, 6, 26], [-10, -10, 34], [28, -2, 28], [52, 10, 20], [0, 14, 26]] as const) {
      g.moveTo(x + dx * s + r * s, y + dy * s)
      g.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2)
    }
    g.fill()
  }
  // Mountains, far to near, each with a band of mist lying along its foot.
  const ridge = (base: number, amp: number, col: string, f: number, ph: number) => {
    g.fillStyle = col
    g.beginPath()
    g.moveTo(0, H)
    for (let x = 0; x <= W; x += 8) g.lineTo(x, base - amp * (0.55 + 0.3 * Math.sin(x / f + ph) + 0.15 * Math.sin(x / (f * 0.37) + ph * 2)))
    g.lineTo(W, H)
    g.fill()
  }
  const mist = (y: number) => {
    const m = g.createLinearGradient(0, y - 22, 0, y + 22)
    m.addColorStop(0, 'rgba(255,255,255,0)')
    m.addColorStop(0.5, 'rgba(255,255,255,0.75)')
    m.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = m
    g.fillRect(0, y - 22, W, 44)
  }
  ridge(300, 150, '#B7D3D6', 120, 1)
  mist(270)
  ridge(360, 120, '#9CCBAA', 90, 4)
  mist(335)
  // The rice terraces: stepped bands of greens down the hill, each lip a lighter line.
  const greens = ['#A6D98C', '#93CF7E', '#B5E39A', '#86C574', '#A0D688']
  for (let i = 0; i < 5; i++) {
    const y = 380 + i * 38
    g.beginPath()
    g.moveTo(0, H)
    for (let x = 0; x <= W; x += 8) g.lineTo(x, y + 10 * Math.sin(x / 160 + i * 1.3))
    g.lineTo(W, H)
    g.fillStyle = greens[i]
    g.fill()
    g.beginPath()
    for (let x = 0; x <= W; x += 8) (x ? g.lineTo : g.moveTo).call(g, x, y + 10 * Math.sin(x / 160 + i * 1.3))
    g.lineWidth = 4
    g.strokeStyle = '#D6F0B8'
    g.stroke()
  }
  // Birds far off.
  for (const [x, y] of [[160, 215], [195, 196], [222, 222], [770, 215]] as const) {
    g.beginPath()
    g.moveTo(x - 14, y)
    g.quadraticCurveTo(x - 7, y - 9, x, y)
    g.quadraticCurveTo(x + 7, y - 9, x + 14, y)
    g.lineWidth = 4
    g.strokeStyle = '#5B5068'
    g.stroke()
  }

  // ---- She, the pony (left) ----
  const sx = 395
  const FUR_S = '#FFF1E2'
  const MANE = '#B97CE0'
  const JACKET = '#3E3A7E'
  // Her feet, the pha sin (striped, flaring, with a zigzag hem), the jacket over it.
  oval(sx - 34, 572, 26, 14, '#C9A48E')
  oval(sx + 34, 572, 26, 14, '#C9A48E')
  g.save()
  g.beginPath()
  g.moveTo(sx - 74, 330)
  g.lineTo(sx + 74, 330)
  g.quadraticCurveTo(sx + 96, 450, sx + 100, 556)
  g.lineTo(sx - 100, 556)
  g.quadraticCurveTo(sx - 96, 450, sx - 74, 330)
  g.closePath()
  g.fillStyle = '#FF8FB8'
  g.fill()
  g.clip()
  const stripes = ['#B97CE0', '#FFFFFF', '#3FA58A', '#FF4F9A', '#FFC83D']
  for (let i = 0; i < 9; i++) {
    g.fillStyle = stripes[i % stripes.length]
    g.fillRect(sx - 110, 360 + i * 22, 220, 9)
  }
  // The zigzag hem.
  g.fillStyle = '#7A3D9C'
  g.fillRect(sx - 110, 528, 220, 30)
  g.beginPath()
  for (let i = 0; i <= 12; i++) g.lineTo(sx - 110 + i * 19, i % 2 ? 518 : 534)
  g.lineWidth = 6
  g.strokeStyle = '#FFC83D'
  g.stroke()
  g.restore()
  g.beginPath()
  g.moveTo(sx - 74, 330)
  g.lineTo(sx + 74, 330)
  g.quadraticCurveTo(sx + 96, 450, sx + 100, 556)
  g.lineTo(sx - 100, 556)
  g.quadraticCurveTo(sx - 96, 450, sx - 74, 330)
  g.closePath()
  g.lineWidth = 6
  g.strokeStyle = ink
  g.stroke()
  // Arms first (behind the jacket's shoulders): waving up on the left, reaching right to hold his hand.
  limb([[sx - 52, 248], [sx - 120, 230], [sx - 138, 168]], 30, JACKET)
  oval(sx - 140, 152, 22, 24, FUR_S)
  limb([[sx + 52, 252], [sx + 100, 300], [sx + 128, 318]], 30, JACKET)
  // The jacket: rounded, crossing over with a pink trim, silver buttons down the side.
  blob([[sx - 70, 216], [sx + 70, 216], [sx + 82, 342], [sx - 82, 342]], JACKET)
  path([[sx - 14, 218], [sx + 14, 218], [sx + 56, 340], [sx + 34, 340]], '#FF8FB8', 4)
  for (const y of [252, 284, 316]) oval(sx + 22 + (y - 252) * 0.28, y, 6, 6, '#E6E8F2', 3)
  // Her head: the cream pony face, a long muzzle, ears, the lilac mane showing under the head wrap.
  oval(sx - 46, 72, 18, 30, FUR_S, 6, -0.4)
  oval(sx + 46, 72, 18, 30, FUR_S, 6, 0.4)
  oval(sx - 46, 76, 8, 16, '#FFC2C8', 0, -0.4)
  oval(sx + 46, 76, 8, 16, '#FFC2C8', 0, 0.4)
  oval(sx, 148, 74, 70, FUR_S)
  oval(sx, 186, 44, 30, '#FFE0CC', 5)
  dot(sx - 14, 186, 5, '#C98A7A')
  dot(sx + 14, 186, 5, '#C98A7A')
  // The mane: two swoops of bangs down the sides of her face.
  blob([[sx - 70, 110], [sx - 30, 92], [sx - 50, 150], [sx - 80, 170]], MANE, 5)
  blob([[sx + 70, 110], [sx + 30, 92], [sx + 50, 150], [sx + 80, 170]], MANE, 5)
  // The pink head wrap, tied in a knot on top with a flower.
  blob([[sx - 78, 118], [sx - 70, 78], [sx, 66], [sx + 70, 78], [sx + 78, 118], [sx, 104]], '#FF4F9A', 6)
  g.beginPath()
  g.moveTo(sx - 70, 108)
  g.quadraticCurveTo(sx, 92, sx + 70, 108)
  g.lineWidth = 6
  g.strokeStyle = '#FF9DC4'
  g.stroke()
  for (let k = 0; k < 5; k++) dot(sx + 42 + Math.cos((k / 5) * 6.28) * 10, 78 + Math.sin((k / 5) * 6.28) * 10, 8, '#FFFFFF')
  dot(sx + 42, 78, 6, '#FFC83D')
  // Big shiny eyes with lashes, blush, a smile.
  for (const s of [-1, 1]) {
    oval(sx + s * 28, 140, 12, 15, ink, 0)
    dot(sx + s * 28 + 4, 134, 5, '#FFFFFF')
    dot(sx + s * 28 - 3, 146, 2.5, '#FFFFFF')
    g.beginPath()
    g.moveTo(sx + s * 38, 130)
    g.lineTo(sx + s * 46, 124)
    g.lineWidth = 4
    g.strokeStyle = ink
    g.stroke()
    dot(sx + s * 54, 168, 13, '#FF9DB8')
  }
  g.beginPath()
  g.arc(sx, 196, 14, 0.25, Math.PI - 0.25)
  g.lineWidth = 5
  g.strokeStyle = ink
  g.stroke()

  // ---- He, the bear (right) ----
  const hx = 650
  const FUR_H = '#B07A55'
  const MUZ = '#F6DCC0'
  const INDIGO = '#2F3570'
  // Baggy trousers, feet.
  oval(hx - 36, 572, 28, 14, '#6E4A3A')
  oval(hx + 36, 572, 28, 14, '#6E4A3A')
  blob([[hx - 70, 350], [hx + 70, 350], [hx + 78, 560], [hx + 8, 560], [hx, 450], [hx - 8, 560], [hx - 78, 560]], INDIGO)
  // Arms: one reaching left to hold her hand, one waving up on the right.
  limb([[hx - 56, 254], [hx - 104, 300], [hx - 128, 318]], 32, '#4A52A0')
  limb([[hx + 56, 248], [hx + 122, 230], [hx + 140, 168]], 32, '#4A52A0')
  oval(hx + 142, 152, 24, 25, FUR_H)
  // The jacket, the red sash, the buttons.
  blob([[hx - 76, 212], [hx + 76, 212], [hx + 86, 368], [hx - 86, 368]], '#4A52A0')
  path([[hx - 84, 338], [hx + 84, 338], [hx + 86, 368], [hx - 86, 368]], '#E8505B', 5)
  path([[hx + 40, 360], [hx + 62, 404], [hx + 36, 410]], '#E8505B', 4)
  for (const y of [240, 272, 304]) oval(hx, y, 6, 6, '#FFFFFF', 3)
  // His head: round ears, a round face, a big muzzle with a nose.
  oval(hx - 58, 92, 26, 26, FUR_H)
  oval(hx + 58, 92, 26, 26, FUR_H)
  dot(hx - 58, 94, 13, '#FFB8A8')
  dot(hx + 58, 94, 13, '#FFB8A8')
  oval(hx, 150, 78, 72, FUR_H)
  oval(hx, 186, 42, 30, MUZ, 5)
  oval(hx, 174, 14, 10, ink, 0)
  dot(hx + 4, 171, 3.5, '#FFFFFF')
  // The white head cloth, tied with its ends flying out to the right.
  blob([[hx - 76, 124], [hx - 66, 86], [hx, 74], [hx + 66, 86], [hx + 76, 124], [hx, 110]], '#FFFFFF', 6)
  path([[hx + 66, 100], [hx + 116, 70], [hx + 106, 98], [hx + 120, 118]], '#FFFFFF', 5)
  for (const s of [-1, 1]) {
    oval(hx + s * 30, 146, 11, 14, ink, 0)
    dot(hx + s * 30 + 4, 140, 4.5, '#FFFFFF')
    dot(hx + s * 56, 172, 13, '#F5A0A8')
  }
  g.beginPath()
  g.moveTo(hx, 184)
  g.lineTo(hx, 192)
  g.arc(hx - 10, 192, 10, 0, Math.PI * 0.85)
  g.moveTo(hx, 192)
  g.arc(hx + 10, 192, 10, Math.PI, Math.PI * 0.15, true)
  g.lineWidth = 5
  g.strokeStyle = ink
  g.stroke()

  // ---- Their hands held between them, a big heart and two little ones above ----
  oval(sx + 140, 322, 22, 20, FUR_S)
  oval(hx - 140, 322, 24, 21, FUR_H)
  heart(522, 238, 34, '#FF4F9A')
  heart(478, 196, 14, '#FF9DC4', 4)
  heart(566, 186, 16, '#FF9DC4', 4)

  // ---- Flowers along the bottom ----
  for (let i = 0; i < 18; i++) {
    const x = 24 + i * 58 + (i % 3) * 9
    if (Math.abs(x - sx) < 110 || Math.abs(x - hx) < 100) continue
    const y = 548 + (i % 3) * 16
    g.beginPath()
    g.moveTo(x, y + 30)
    g.quadraticCurveTo(x - 6, y + 14, x, y)
    g.lineWidth = 5
    g.strokeStyle = '#5FA866'
    g.stroke()
    for (let k = 0; k < 5; k++) oval(x + Math.cos((k / 5) * 6.28) * 11, y + Math.sin((k / 5) * 6.28) * 11, 9, 9, ['#FF8FB8', '#FFFFFF', '#C9B6FF'][i % 3], 3)
    dot(x, y, 7, '#FFC83D')
  }

  // ---- The painted border: woven diamonds, like a Tai Lue cloth ----
  const B = 26
  g.fillStyle = '#C9785A'
  g.fillRect(0, 0, W, B)
  g.fillRect(0, H - B, W, B)
  g.fillRect(0, 0, B, H)
  g.fillRect(W - B, 0, B, H)
  const diamond = (x: number, y: number, r: number, fill: string) => path([[x, y - r], [x + r, y], [x, y + r], [x - r, y]], fill, 0)
  for (let x = B; x < W - B; x += 34) {
    diamond(x + 17, B / 2, 9, (x / 34) % 2 < 1 ? '#FFD86B' : '#FFB8D0')
    diamond(x + 17, H - B / 2, 9, (x / 34) % 2 < 1 ? '#FFD86B' : '#FFB8D0')
  }
  for (let y = B; y < H - B; y += 34) {
    diamond(B / 2, y + 17, 9, (y / 34) % 2 < 1 ? '#FFB8D0' : '#FFD86B')
    diamond(W - B / 2, y + 17, 9, (y / 34) % 2 < 1 ? '#FFB8D0' : '#FFD86B')
  }
  g.lineWidth = 5
  g.strokeStyle = ink
  g.strokeRect(B, B, W - 2 * B, H - 2 * B)

  const tex = bag.add(new CanvasTexture(c))
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

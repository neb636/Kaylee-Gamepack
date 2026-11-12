// Ko Kudi's reef (the trip: planning/around-the-world/thailand/samet-story.md): the layout in meters and the props,
// built from code in the island's toy look. The sea's surface is y = 0; the sandy bed lies about 2.6 m down. x runs across the screen,
// and the reef runs away from the camera toward −z: the snorkel boat at the start, the coral heads, the two big rocks
// with the gap between them, the sandy patch (the clam, the sea cucumber), and the hidden garden of soft corals where
// the cuttlefish lives, hugging the bubble Bubbles the firefly is in (story.ts). Ko Kudi itself (a green hump with a
// white beach and palms) sits on the horizon ahead.
import { AdditiveBlending, BufferAttribute, CatmullRomCurve3, CircleGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial, PlaneGeometry, RingGeometry, TubeGeometry, Vector3, type BufferGeometry, type Material } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { bake, merge, P, solid, solidMix } from '../../../../../engine3d/geo'
import { PAL, toon } from '../../../../../engine3d/toon'
import { coralModel, urchinModel, type Model } from '../book/models'
import { palmGeo, rng } from '../island/scenery'

export interface XZ {
  x: number
  z: number
}
export const BED = -2.6
/** Where she splashes in, beside the boat. */
export const START: XZ = { x: 0, z: 1.5 }
export const BOAT: XZ = { x: 3.3, z: 3.2 }
/** The boat's deck (m over the water), and where on it the captain stands (boat-local: x to starboard, z to the
 *  stern): out on the bow in the open, where the swimmer and the camera can see her face. */
export const DECK_Y = 0.55
export const BOW = { x: 0.4, z: -2.95 }
/** The bubble Bubbles is in: its size (m), and where the cuttlefish holds it (the cuttlefish's own space: in front of
 *  its arms). */
export const BUBBLE_R = 0.38
export const HUG = { y: -0.03, z: 0.5, mouth: 0.36 }
export const DADDY: XZ = { x: -2.2, z: -0.5 }
/** The hidden garden (the cuttlefish hovers in its middle). */
export const GARDEN: XZ = { x: -2, z: -35 }
export const SANDY: XZ & { r: number } = { x: -3, z: -24, r: 4.5 }
export const CLAM: XZ = { x: 1.4, z: -25.5 }
export const CUCUMBER: XZ = { x: -4.6, z: -22.6 }
/** The parrotfish's way: past the coral heads, through the gap between the rocks, over the sand, into the garden. */
export const ROUTE: XZ[] = [
  { x: 1.2, z: -6 },
  { x: 0.2, z: -11.5 },
  { x: 0, z: -16 },
  { x: -1.4, z: -20.5 },
  { x: -3, z: -24.5 },
  { x: -2.8, z: -29 },
  { x: -2, z: -32.2 },
]
/** Where she may swim (a soft wall past these). */
export const BOUNDS = { x0: -13, x1: 13, z0: -44, z1: 7 }

export type Kind = 'rock' | 'coral' | 'urchin' | 'boat'
/** Things she bumps into at the surface: rocks out of the water, coral heads (bommies) just under it, urchins on top of
 *  some of them, the boat. */
export interface Obstacle extends XZ {
  r: number
  kind: Kind
  /** A bommie's top (m, under the surface), a rock's height out of the water. */
  top: number
}
export const OBSTACLES: Obstacle[] = [
  // The gap: two big rocks, and more rock either side (she can swim round the very ends).
  { x: -2.9, z: -16, r: 1.7, kind: 'rock', top: 1.5 },
  { x: 2.9, z: -16.2, r: 1.7, kind: 'rock', top: 1.2 },
  { x: -6.4, z: -16.6, r: 2.2, kind: 'rock', top: 0.9 },
  { x: 6.6, z: -15.6, r: 2.2, kind: 'rock', top: 0.7 },
  // Coral heads (a soft bump) and the prickly ones (a boing).
  { x: -4.6, z: -5.5, r: 0.95, kind: 'coral', top: -0.5 },
  { x: 4.8, z: -9.2, r: 0.9, kind: 'urchin', top: -0.45 },
  { x: -6.5, z: -11, r: 1.0, kind: 'coral', top: -0.55 },
  { x: 5.6, z: -21.5, r: 0.95, kind: 'coral', top: -0.5 },
  { x: -7.2, z: -26, r: 0.9, kind: 'urchin', top: -0.45 },
  { x: 2.2, z: -31.5, r: 0.85, kind: 'urchin', top: -0.5 },
  { x: -8.5, z: -33, r: 1.0, kind: 'coral', top: -0.55 },
  // The boat (a long thing along z: three circles).
  { x: BOAT.x, z: BOAT.z - 2.4, r: 1.0, kind: 'boat', top: 0.6 },
  { x: BOAT.x, z: BOAT.z, r: 1.0, kind: 'boat', top: 0.6 },
  { x: BOAT.x, z: BOAT.z + 2.4, r: 1.0, kind: 'boat', top: 0.6 },
]

const R = rng(41)

/** The sandy bed: a big gentle sheet, lighter on the sandy patch and in the garden. */
export function bed(bag: Bag) {
  const g = new PlaneGeometry(140, 140, 70, 70)
  g.rotateX(-Math.PI / 2)
  const pos = g.attributes.position
  const col = new Float32Array(pos.count * 3)
  const a = [0.93, 0.86, 0.72]
  const b = [0.86, 0.79, 0.66]
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i) - 18
    pos.setY(i, bedHeight(x, z))
    const k = (Math.sin(x * 1.3) * Math.sin(z * 1.1) + 1) / 2
    for (let c = 0; c < 3; c++) col[i * 3 + c] = a[c] * (1 - k * 0.5) + b[c] * k * 0.5
  }
  g.translate(0, 0, -18)
  g.setAttribute('color', new BufferAttribute(col, 3))
  g.computeVertexNormals()
  const m = new Mesh(bag.add(g), toon('#ffffff', true))
  return m
}
export function bedHeight(x: number, z: number) {
  const n = Math.sin(x * 0.35) * Math.cos(z * 0.3) * 0.18 + Math.sin(x * 0.11 + z * 0.07) * 0.3
  const off = Math.max(0, Math.hypot(x / 16, (z + 18) / 34) - 1) * 3
  return BED + n - off
}

/** The sea's top (seen from above, out to the horizon) as one flat sheet. */
export function seaTop(bag: Bag) {
  const g = new PlaneGeometry(900, 900, 1, 1)
  g.rotateX(-Math.PI / 2)
  const m = new Mesh(bag.add(g), bag.add(new MeshBasicMaterial({ color: '#45C4D6' })))
  m.renderOrder = -1
  return m
}

/** The same surface from underneath (only a camera under the water sees it: a film's shot on the reef): a bright
 *  ceiling, so the light is up there and nothing over the water shows through. */
export function seaUnder(bag: Bag) {
  const g = new PlaneGeometry(900, 900, 1, 1)
  g.rotateX(Math.PI / 2)
  return new Mesh(bag.add(g), bag.add(new MeshBasicMaterial({ color: '#A9F0F2' })))
}

/** Sunbeams slanting down through the water (only drawn under it): a few soft additive sheets. */
export function sunbeams(bag: Bag, n = 9) {
  const root = new Group()
  const mat = bag.add(new MeshBasicMaterial({ color: '#E9FFFB', transparent: true, opacity: 0.12, blending: AdditiveBlending, depthWrite: false, side: DoubleSide, fog: false }))
  const beams: Mesh[] = []
  for (let i = 0; i < n; i++) {
    const g = new PlaneGeometry(0.5 + R() * 0.9, 5.5)
    g.translate(0, -2.75, 0)
    const m = new Mesh(bag.add(g), mat)
    m.position.set((i - n / 2) * 2.4 + R() * 1.2, 0, -R() * 14 + 2)
    m.rotation.set(0, R() * 0.6 - 0.3, 0.32)
    m.userData.phase = R() * 6
    root.add(m)
    beams.push(m)
  }
  return { root, beams, mat }
}

/** A coral patch on the bed (book/models.ts coralModel), bigger. */
export function coralPatch(bag: Bag, x: number, z: number, s: number, seed: number) {
  const m = coralModel(bag, seed)
  m.root.position.set(x, bedHeight(x, z) - 0.04, z)
  m.root.scale.setScalar(s)
  m.root.rotation.y = seed * 1.7
  return m
}

/** A soft coral that sways: a little bunch of pink, lilac or orange fingers on a pivot. */
export function softCoral(bag: Bag, x: number, z: number, s: number, i: number) {
  const cols = ['#FF7FB3', '#C59BFF', '#FFA36B', '#FF9EC9', '#8FE3C8']
  const c = cols[i % cols.length]
  const root = new Group()
  root.position.set(x, bedHeight(x, z) - 0.02, z)
  const sway = new Group()
  const parts: BufferGeometry[] = []
  const plain: BufferGeometry[] = []
  const n = 5 + (i % 3)
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + i
    const tilt = 0.18 + (k % 3) * 0.12
    const len = 0.5 + ((k * 7 + i) % 5) * 0.12
    parts.push(P.capsule(0.07, len, c, { at: [Math.sin(a) * len * 0.22, len * 0.5 + 0.05, Math.cos(a) * len * 0.22], rot: [Math.cos(a) * tilt, 0, -Math.sin(a) * tilt] }))
    plain.push(P.sphere(0.075, '#FFE3F0', { at: [Math.sin(a) * tilt * len, len + 0.07, Math.cos(a) * tilt * len] }, 6))
  }
  sway.add(solidMix(parts, plain, bag, 1.5))
  sway.scale.setScalar(s)
  root.add(sway)
  return { root, sway, phase: i * 0.9 }
}

/** A coral head rising to just under the surface (a bommie): a rock column with coral on top (and urchins, if
 *  prickly). */
export function bommie(bag: Bag, o: Obstacle, i: number) {
  const root = new Group()
  const by = bedHeight(o.x, o.z)
  root.position.set(o.x, 0, o.z)
  const h = o.top - by
  // Living reef all the way down, not bare stone: a rosy reef rock, crusted with round brain corals and little plate
  // corals in the reef's pastels (each bommie its own mix).
  const knobs = ['#FF9EC4', '#FFB38A', '#C9A8FF', '#8FE3C8', '#FFD27A']
  const crust = []
  for (let k = 0; k < 9; k++) {
    const a = k * 2.4 + i * 1.3
    const y = by + h * (0.2 + ((k * 0.37 + i * 0.11) % 0.75))
    const rr = o.r * (0.22 + ((k * 0.53) % 0.18))
    crust.push(P.sphere(rr, knobs[(k + i) % knobs.length], { at: [Math.sin(a) * o.r * 0.92, y, Math.cos(a) * o.r * 0.92], scale: [1, 0.8, 1] }, 8))
    if (k % 3 === 0) crust.push(P.cyl(rr * 1.4, rr * 1.2, 0.06, knobs[(k + i + 2) % knobs.length], { at: [Math.sin(a + 1.2) * o.r * 1.02, y + 0.25, Math.cos(a + 1.2) * o.r * 1.02], rot: [0.15, 0, 0.2] }, 10))
  }
  root.add(solid(merge([P.cyl(o.r * 0.85, o.r * 1.15, h, '#C8A6A8', { at: [0, by + h / 2 - 0.1, 0] }, 9), P.sphere(o.r * 0.9, '#D9B9B6', { at: [0, o.top - 0.3, 0], scale: [1, 0.45, 1] }, 10), ...crust]), bag, 2))
  const top = coralModel(bag, 7 + i)
  top.root.position.y = o.top - 0.45
  top.root.scale.setScalar(o.r * 0.95)
  root.add(top.root)
  const urchins: Model[] = []
  if (o.kind === 'urchin')
    for (let k = 0; k < 3; k++) {
      const u = urchinModel(bag)
      const a = k * 2.1 + i
      u.root.position.set(Math.sin(a) * o.r * 0.45, o.top - 0.32, Math.cos(a) * o.r * 0.45)
      u.root.scale.setScalar(1.4 - k * 0.2)
      root.add(u.root)
      urchins.push(u)
    }
  return { root, urchins }
}

/** A big granite rock out of the water (Samet's warm pinkish granite). */
export function rock(bag: Bag, o: Obstacle, i: number) {
  const root = new Group()
  const by = bedHeight(o.x, o.z)
  const h = o.top - by
  root.position.set(o.x, 0, o.z)
  root.add(
    solid(
      merge([
        P.sphere(o.r, '#B3A7A6', { at: [0, by + h * 0.5, 0], scale: [1, (h / o.r) * 0.62, 1.05] }, 9),
        P.sphere(o.r * 0.7, '#C9BEBA', { at: [o.r * 0.35, o.top - o.r * 0.35, -o.r * 0.2], scale: [1, 0.8, 1] }, 8),
        P.sphere(o.r * 0.5, '#A0938F', { at: [-o.r * 0.6, by + h * 0.3, o.r * 0.3] }, 7),
      ]),
      bag,
      2,
    ),
  )
  // Seaweed and a little coral round the foot.
  const c = coralModel(bag, 30 + i)
  c.root.position.set(o.r * 0.6, by, o.r * 0.7)
  c.root.scale.setScalar(1.2)
  root.add(c.root)
  return root
}

/** The snorkel boat: a blue-and-white longtail with a canopy, a ladder down its side and an anchor rope. Faces −z. */
export function boat(bag: Bag) {
  const root = new Group()
  const body = new Group()
  body.add(
    solid(
      merge([
        P.rbox(1.8, 0.8, 7.2, 0.3, '#FFFFFF', { at: [0, 0.15, 0] }),
        P.box(1.82, 0.16, 7.22, '#3F8FE8', { at: [0, 0.42, 0] }),
        P.cone(0.24, 1.8, '#FFFFFF', { at: [0, 0.95, -3.7], rot: [-0.5, 0, 0] }, 6),
        P.sphere(0.24, PAL.hotpink, { at: [0, 1.65, -4.1] }, 8),
        P.rbox(1.7, 0.08, 4.4, 0.04, '#5FC4E0', { at: [0, 2.2, 0.6] }),
        ...[-1, 1].flatMap((s) => [P.cyl(0.04, 0.04, 1.8, '#E9E3D8', { at: [s * 0.75, 1.3, 2.6] }, 5), P.cyl(0.04, 0.04, 1.8, '#E9E3D8', { at: [s * 0.75, 1.3, -1.4] }, 5)]),
        ...[0, 1, 2].map((k) => P.rbox(0.3, 0.14, 0.3, 0.05, [PAL.gold, PAL.mint, PAL.hotpink][k], { at: [-0.5 + k * 0.5, 0.62, 2.4] })),
        // The long-tail motor at the back.
        P.cyl(0.05, 0.05, 2.6, '#6A6A72', { at: [0, 0.7, 4.4], rot: [1.2, 0, 0] }, 6),
        P.rbox(0.4, 0.4, 0.6, 0.08, '#E8E2D6', { at: [0, 1.1, 3.6] }),
      ]),
      bag,
      2,
    ),
  )
  root.add(body)
  // The ladder, down the side she climbs off (−x, toward the reef's middle).
  const ladder = new Group()
  ladder.position.set(-0.95, 0.5, -0.4)
  ladder.add(solid(merge([P.cyl(0.03, 0.03, 1.8, '#C8CCD2', { at: [0, -0.6, -0.22] }, 5), P.cyl(0.03, 0.03, 1.8, '#C8CCD2', { at: [0, -0.6, 0.22] }, 5), ...[0, 1, 2, 3].map((k) => P.cyl(0.025, 0.025, 0.44, '#C8CCD2', { at: [0, 0.1 - k * 0.42, 0], rot: [Math.PI / 2, 0, 0] }, 5))]), bag, 1.5))
  ladder.rotation.z = 0.12
  root.add(ladder)
  // The anchor rope from the bow down to the sand.
  const ropeLen = 0.4 - BED + 0.2
  root.add(solid(merge([P.cyl(0.025, 0.025, ropeLen, '#E8D8A8', { at: [0, 0.4 - ropeLen / 2, -4.6], rot: [-0.35, 0, 0] }, 5), P.torus(0.16, 0.04, '#7A7A82', { at: [0, BED + 0.2, -5.6], rot: [0, 0, 0] })]), bag, 1.5))
  // (The captain stands on the bow, BOW: snorkel.ts puts her there, a talking islander.)
  return { root, body, ladder }
}

/** The giant clam: two wavy shells with a blue-purple mantle; the top shell closes. */
export function clam(bag: Bag) {
  const root = new Group()
  root.add(solidMix([P.sphere(0.55, '#E8E0CF', { at: [0, 0.05, 0], scale: [1.2, 0.5, 0.8] }, 14)], [P.sphere(0.5, '#5B7CF0', { at: [0, 0.22, 0], scale: [1.08, 0.2, 0.62] }, 12), ...[-1, 0, 1].map((k) => P.sphere(0.07, '#9FE3FF', { at: [k * 0.26, 0.29, 0.05] }, 6))], bag, 2))
  const lid = new Group()
  lid.position.set(0, 0.2, -0.38)
  lid.add(solid(P.sphere(0.55, '#DCD3C0', { at: [0, 0, 0.38], scale: [1.2, 0.42, 0.8] }, 14), bag, 2))
  root.add(lid)
  return { root, lid }
}

/** A sea cucumber: a fat bumpy sausage on the sand. */
export function cucumber(bag: Bag) {
  const root = new Group()
  const body = new Group()
  const bumps: BufferGeometry[] = []
  for (let i = 0; i < 9; i++) bumps.push(P.sphere(0.05, '#E07A5A', { at: [((i % 3) - 1) * 0.08, 0.17, -0.3 + i * 0.075] }, 6))
  body.add(solidMix([P.capsule(0.15, 0.6, '#B8503E', { at: [0, 0.14, 0], rot: [Math.PI / 2, 0, 0] })], [...bumps, P.sphere(0.03, PAL.ink, { at: [0.06, 0.2, 0.42] }, 5), P.sphere(0.03, PAL.ink, { at: [-0.06, 0.2, 0.42] }, 5)], bag, 2))
  root.add(body)
  return { root, body }
}

/** A little orange fish that hides in a coral head (and pops out when she pokes it, or bumps the coral). */
export function hideFish(bag: Bag) {
  const root = new Group()
  root.add(
    solidMix(
      [P.sphere(0.12, '#FF8A3D', { scale: [0.6, 0.85, 1.3] }, 10), P.prism([[0, 0], [0.12, -0.1], [0.12, 0.1]].map(([a, b]) => [b, a]) as [number, number][], 0.02, '#FF8A3D', { at: [0, 0, -0.14], rot: [0, Math.PI / 2, 0] })],
      [P.torus(0.07, 0.016, '#FFFFFF', { at: [0, 0, 0.04], rot: [0, Math.PI / 2, 0], scale: [1, 1.2, 1] }), P.sphere(0.022, PAL.ink, { at: [0.05, 0.03, 0.1] }, 5), P.sphere(0.022, PAL.ink, { at: [-0.05, 0.03, 0.1] }, 5)],
      bag,
      1.5,
    ),
  )
  root.scale.setScalar(1.8)
  return root
}

/** Ko Kudi on the horizon: a green hump with a white beach and palms (and the land behind the boat). */
export function koKudi(bag: Bag) {
  const root = new Group()
  const parts: BufferGeometry[] = [
    P.sphere(34, '#78C47A', { at: [10, -6, -120], scale: [1.3, 0.42, 0.6] }, 22),
    P.sphere(20, '#6AB56E', { at: [-22, -3, -112], scale: [1.2, 0.5, 0.6] }, 18),
    P.cyl(48, 50, 1.2, '#FFF4DE', { at: [0, 0.2, -108], scale: [1.1, 1, 0.32] }, 28),
  ]
  for (let i = 0; i < 9; i++) {
    const x = -30 + i * 7 + R() * 3
    parts.push(...palmGeo(R, new Vector3(x, 0.5, -100 - R() * 4), 6 + R() * 3, new Vector3(R() - 0.5, 1, 0).normalize()))
  }
  root.add(solid(merge(parts), bag, 1.5))
  return root
}

/** A bubble ring (Dad blows one). */
export function bubbleRing(bag: Bag) {
  const m = new Mesh(bag.add(P.torus(0.3, 0.06, '#FFFFFF')), bag.add(new MeshBasicMaterial({ color: '#F2FFFF', transparent: true, opacity: 0.75, depthWrite: false })))
  m.visible = false
  return m
}

/** The bubble Bubbles the firefly is in, drawn the toy way: a white ring, a faint fill and a shine. Turn `root` to
 *  face the camera every frame (it is flat); the firefly sits at its middle, between the fill and the ring. */
export function bubble(bag: Bag) {
  const root = new Group()
  const R = BUBBLE_R
  const flat = (color: string, opacity: number) => bag.add(new MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, fog: false, side: DoubleSide }))
  const fill = new Mesh(bag.add(new CircleGeometry(R, 32)), flat('#CDF3FF', 0.2))
  fill.position.z = -0.14
  const soft = new Mesh(bag.add(new RingGeometry(R * 0.8, R * 0.94, 40)), flat('#DFF8FF', 0.28))
  const rim = new Mesh(bag.add(new RingGeometry(R * 0.93, R, 40)), flat('#FFFFFF', 0.92))
  const shineMat = flat('#FFFFFF', 0.92)
  const shine = new Mesh(bag.add(new CircleGeometry(R * 0.17, 14)), shineMat)
  shine.position.set(-R * 0.48, R * 0.5, 0.16)
  shine.scale.set(1.5, 0.75, 1)
  shine.rotation.z = 0.75
  const dot = new Mesh(bag.add(new CircleGeometry(R * 0.06, 10)), shineMat)
  dot.position.set(-R * 0.7, R * 0.2, 0.16)
  const low = new Mesh(bag.add(new RingGeometry(R * 0.7, R * 0.78, 20, 1, Math.PI * 1.55, Math.PI * 0.4)), flat('#FFFFFF', 0.5))
  low.position.z = 0.16
  for (const m of [fill, soft, rim, shine, dot, low]) m.renderOrder = 7
  root.add(fill, soft, rim, shine, dot, low)
  return { root }
}

/** The cuttlefish's two long arms round the bubble (in its own space and its own material, so they change color
 *  with it): they dip from its mouth and cradle the bubble from underneath, so whoever is in it can be seen. Each
 *  swings on a pivot at its mouth: `hug(1)` wraps them round the bubble, `hug(0)` lets go. */
export function hugArms(bag: Bag, mat: Material) {
  const root = new Group()
  const r = HUG.z - HUG.mouth
  const pivots = ([1, -1] as const).map((s) => {
    const pts: Vector3[] = []
    for (let i = 0; i <= 10; i++) {
      const u = -Math.PI / 2 + (i / 10) * Math.PI * 0.94
      // (Down under the bubble's middle within the first third of the way round, a smaller ring there.)
      const low = Math.min(1, i / 3.2)
      const ring = r * (1 - 0.2 * low)
      pts.push(new Vector3(s * ring * Math.cos(u), -0.085 * low * (2 - low), r + ring * Math.sin(u)))
    }
    const tip = pts[pts.length - 1]
    const geo = bag.add(merge([bake(new TubeGeometry(new CatmullRomCurve3(pts), 20, 0.017, 7), '#F2E6DA', {}, true), P.sphere(0.024, '#FFFFFF', { at: [tip.x, tip.y, tip.z] }, 8)]))
    const pivot = new Group()
    pivot.position.set(0, HUG.y, HUG.mouth)
    pivot.add(new Mesh(geo, mat))
    root.add(pivot)
    return { pivot, s }
  })
  const hug = (k: number) => {
    for (const p of pivots) p.pivot.rotation.set(0, p.s * (1 - k) * 1.15, p.s * (1 - k) * -0.5)
  }
  hug(1)
  return { root, hug }
}

/** Her mask and snorkel, for her head (head-local: `R` the head's radius, `y` its center's height). `lift(1)` pushes
 *  it up onto her forehead (out of the water, so her eyes show); `lift(0)` is over her eyes. */
export function mask(bag: Bag, R: number, y: number) {
  const g = new Group()
  g.add(
    solidMix(
      [P.rbox(R * 1.25, R * 0.62, R * 0.3, R * 0.14, PAL.hotpink, { at: [0, y + R * 0.18, R * 0.9] }), P.torus(R * 1.02, R * 0.06, PAL.hotpink, { at: [0, y + R * 0.18, 0], rot: [Math.PI / 2, 0, 0] })],
      [P.rbox(R * 1.05, R * 0.46, R * 0.1, R * 0.1, '#BFF4FF', { at: [0, y + R * 0.18, R * 1.03] })],
      bag,
      1.5,
    ),
  )
  // The snorkel: up the side of her head and out the back (to the sky, when she's face down).
  g.add(solid(merge([P.cyl(R * 0.07, R * 0.07, R * 1.9, PAL.lavenderDark, { at: [R * 0.8, y + R * 0.1, -R * 0.1], rot: [Math.PI / 2, 0, 0] }), P.cyl(R * 0.09, R * 0.09, R * 0.18, PAL.butter, { at: [R * 0.8, y + R * 0.1, -R * 1.1], rot: [Math.PI / 2, 0, 0] })]), bag, 1.5))
  // (It turns about the middle of her head, sliding up over her forehead.)
  g.position.y = -y
  const root = new Group()
  root.position.y = y
  root.add(g)
  return { root, lift: (k: number) => void (root.rotation.x = -k * 0.62) }
}

/** Pink flippers for her feet (foot-local: the leg's pivot is at the hip, the foot `len` below it). */
export function flipper(bag: Bag, len: number) {
  return solid(P.sphere(0.08, PAL.hotpink, { at: [0, -len - 0.1, 0.02], scale: [1.4, 2.4, 0.35] }, 10), bag, 1.5)
}

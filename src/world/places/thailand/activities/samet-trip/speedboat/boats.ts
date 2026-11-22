// The boats on the way to Koh Samet (speedboat.ts films them): the family's speedboat, the boats coming the other way
// and the flying fish. Each faces +z.
import { Group } from 'three'
import { buildAnimal, hipsOf, sitBack, type Rig } from '../../../../../engine3d/characters/animal'
import { FaceLife } from '../../../../../engine3d/characters/face'
import type { Look } from '../../../../../engine3d/characters/look'
import type { Bag } from '../../../../../engine3d/dispose'
import { loft, merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { buildSki, HIS } from '../jetski/ski'

export type PassId = 'ferry' | 'longtail' | 'ski' | 'speed'

/** The boat: 7.2 m, faces +z. Where the hull's sides are (local x), its floor, and the seats. */
export const HALF_W = 1.2
export const FLOOR = 0.72
export const BENCH = 1.14
export const STERN_Z = -3.3
/** The top of its sides (the gunwales), at the stern; they rise toward the bow. */
const GUN = FLOOR + 0.42

/**
 * One section of a hull with an open deck, for loft() (geo.ts), standing at `z`: from the keel up the right side
 * (a V bottom to the chine, three lines up the side for two colored bands, the gunwale), over the gunwale (`t` thick)
 * and down inside to the `floor`, across it, and the same back down the left: 18 points, so 18 bands to paint
 * (HULL_BANDS). `floor` null decks it over at the gunwale instead, with a little crown (a bow's foredeck, a stern deck);
 * two sections a couple of centimeters apart, one open and one decked, make the bulkhead between.
 */
export function hullSection(z: number, w: number, keel: number, gun: number, floor: number | null, t = 0.12) {
  const chine = keel + Math.max(0.06, (gun - keel) * 0.22)
  const at = (f: number) => chine + (gun - chine) * f
  const half: [number, number][] = [
    [w * 0.5, keel + (chine - keel) * 0.55],
    [w * 0.93, chine],
    [w, at(0.2)],
    [w, at(0.3)],
    [w, at(0.48)],
    [w, gun],
    [w - t, gun],
    [w - t, floor ?? gun],
  ]
  const mid: [number, number] = [0, floor ?? gun + 0.05]
  return { z, pts: [[0, keel], ...half, mid, ...half.reverse().map(([x, y]) => [-x, y] as [number, number])] as [number, number][] }
}
/** The paint for hullSection's bands: under the chine, the side up to the first line, between the lines (the
 *  pinstripe), the stripe, the side above it (`upper`, or `side` again), the gunwale's top, the inside of the sides,
 *  the floor. */
export function hullBands(c: { bottom: string; side: string; pin: string; stripe: string; upper?: string; top: string; inside: string; floor: string }) {
  const right = [c.bottom, c.bottom, c.side, c.pin, c.stripe, c.upper ?? c.side, c.top, c.inside, c.floor]
  return [...right, ...[...right].reverse()]
}

/** The family's speedboat: white with a pink stripe, a blue sun canopy over the back, a console up front. */
export function buildBoat(bag: Bag, stripe: string = PAL.hotpink) {
  const root = new Group()
  const tilt = new Group()
  const body = new Group()
  root.add(tilt)
  tilt.add(body)
  const W = '#FFFFFF'
  const cushion = '#FFB6D3'
  // The hull (hullSection): a V underneath, flat white sides with a sky pinstripe under the colored stripe, a sheer
  // that rises to a raked bow, and inside an open cockpit with a little deck over the stern (the motors and the flag)
  // and a foredeck over the bow.
  const section = (z: number, w: number, keel: number, gun: number, open: boolean) => hullSection(z, w, keel, gun, open ? FLOOR : null)
  const BOTTOM = '#E6E0F0'
  const TOP = '#EEEAF4'
  const DECK = '#F1E6D8'
  const hull = loft(
    [
      section(STERN_Z - 0.05, 1.16, -0.1, GUN, false),
      section(-3.02, 1.19, -0.15, GUN, false),
      section(-3.0, 1.19, -0.15, GUN, true),
      section(-1.6, 1.22, -0.2, GUN + 0.01, true),
      section(0.4, 1.22, -0.2, GUN + 0.03, true),
      section(1.5, 1.16, -0.17, GUN + 0.06, true),
      section(2.08, 1.08, -0.12, GUN + 0.08, true),
      section(2.1, 1.08, -0.12, GUN + 0.08, false),
      section(2.9, 0.86, -0.02, GUN + 0.13, false),
      section(3.5, 0.6, 0.18, GUN + 0.18, false),
      section(3.95, 0.33, 0.45, GUN + 0.22, false),
      section(4.25, 0.1, 0.8, GUN + 0.25, false),
      section(4.38, 0.02, 1.1, GUN + 0.26, false),
    ],
    hullBands({ bottom: BOTTOM, side: W, pin: PAL.sky, stripe, top: TOP, inside: DECK, floor: DECK }),
  )
  const parts = [
    hull,
    // A rail along each side on little posts, a hatch and a cleat on the foredeck, the red and green running lights.
    ...[-1, 1].flatMap((s) => [P.box(0.05, 0.05, 4.3, '#D8DEEA', { at: [s * 1.15, GUN + 0.2, -0.8] }), ...[-2.8, -1.2, 0.4, 1.3].map((z) => P.cyl(0.025, 0.025, 0.2, '#D8DEEA', { at: [s * 1.15, GUN + 0.1, z] }, 5))]),
    P.rbox(0.8, 0.06, 0.7, 0.03, '#E8E2F0', { at: [0, 1.27, 2.95], rot: [0.06, 0, 0] }),
    P.rbox(0.36, 0.06, 0.08, 0.03, '#D8DEEA', { at: [0, 1.38, 3.75] }),
    P.sphere(0.06, '#FF5C7A', { at: [-0.5, 1.33, 3.5] }, 8),
    P.sphere(0.06, '#5FD48A', { at: [0.5, 1.33, 3.5] }, 8),
    // The console with its windscreen and wheel.
    P.rbox(1.0, 0.95, 0.8, 0.14, '#F6F3FA', { at: [0.45, FLOOR + 0.47, 1.3] }),
    P.rbox(1.1, 0.42, 0.07, 0.03, '#9FD5F2', { at: [0.45, FLOOR + 1.12, 1.66], rot: [-0.45, 0, 0] }),
    P.torus(0.17, 0.035, '#5C5468', { at: [0.45, FLOOR + 1.05, 0.88], rot: [0.9, 0, 0] }),
    // The back bench (Mom and Dad) and the side benches (Kaylee).
    P.rbox(2.0, 0.42, 0.62, 0.1, cushion, { at: [0, BENCH - 0.2, -2.55] }),
    P.rbox(2.0, 0.55, 0.14, 0.06, cushion, { at: [0, BENCH + 0.16, -2.9] }),
    ...[-1, 1].map((s) => P.rbox(0.5, 0.38, 2.6, 0.08, cushion, { at: [s * 0.8, BENCH - 0.2, -0.45] })),
    // A little blue sun top over the console, on two posts (the camera sees the family from behind, so it stays forward).
    ...[-1, 1].map((s) => P.cyl(0.035, 0.035, 1.5, '#D8DEEA', { at: [0.45 + s * 0.55, FLOOR + 1.45, 0.95] }, 6)),
    P.rbox(1.5, 0.1, 1.4, 0.04, '#3F8FE8', { at: [0.45, FLOOR + 2.2, 1.2] }),
    P.rbox(1.52, 0.04, 1.42, 0.02, '#FFFFFF', { at: [0.45, FLOOR + 2.14, 1.2] }),
    // Two outboard motors at the stern.
    ...[-0.5, 0.5].flatMap((x) => [P.rbox(0.42, 0.75, 0.55, 0.12, '#5C5468', { at: [x, 0.95, STERN_Z - 0.35] }), P.box(0.12, 0.9, 0.16, '#3E3848', { at: [x, 0.2, STERN_Z - 0.45] })]),
  ]
  body.add(solid(merge(parts), bag, 2.5))
  // The pink flag at the stern (it flutters). Its pole stands in a socket on the back corner of the left gunwale, out
  // past the end of the back bench, so it clears Mom's head and reaches all the way down to the boat.
  const flag = new Group()
  flag.position.set(-(HALF_W - 0.07), FLOOR + 0.42, STERN_Z + 0.12)
  flag.add(solid(merge([P.cyl(0.07, 0.08, 0.14, '#D8DEEA', { at: [0, 0.07, 0] }, 8), P.cyl(0.03, 0.03, 2.3, '#D8DEEA', { at: [0, 1.15, 0] }, 6)]), bag, 2))
  const cloth = new Group()
  cloth.position.y = 2.12
  cloth.add(solid(P.box(0.02, 0.32, 0.5, PAL.pink, { at: [0, 0, -0.25] }), bag, 1.5))
  flag.add(cloth)
  body.add(flag)
  // The life ring on the side.
  const ring = new Group()
  ring.position.set(HALF_W + 0.02, FLOOR + 0.25, -1.6)
  ring.add(solid(merge([P.torus(0.28, 0.08, '#FF8A2E', { rot: [0, Math.PI / 2, 0] }), ...[0, 1, 2, 3].map((k) => P.torus(0.28, 0.085, '#FFFFFF', { rot: [(k * Math.PI) / 2, Math.PI / 2, 0] }, 0.45))]), bag, 2))
  body.add(ring)
  return { root, tilt, body, flag, cloth, ring }
}

/** The people out on the water (toy animals, nobody in the family): ferry passengers, a longtail's driver, a jet
 *  skier, another speedboat's captain and riders. Sun hats and sunglasses: they're on holiday. */
const SEA_FOLK: Look[] = [
  { species: 'otter', height: 1.05, fur: '#B07A55', light: '#F6DCC0', dark: '#6E4A3A', ear: '#FFC2B0', outfit: { kind: 'tee', color: '#FF9AC8' }, extras: ['sunhat'], lashes: true, open: true },
  { species: 'raccoon', height: 1.05, fur: '#A9A3B8', light: '#F4F0FA', dark: '#4A4458', ear: '#FFC2C8', outfit: { kind: 'shirt', color: '#8FD3FF' }, extras: ['sunglasses'], open: true },
  { species: 'monkey', height: 1.0, fur: '#C08A5E', light: '#FFE6CC', dark: '#7A5340', ear: '#FFC2B0', outfit: { kind: 'dress', color: '#FFE07A' }, lashes: true, open: true },
  { species: 'beaver', height: 1.1, chub: 1.15, fur: '#9C6B4E', light: '#F6DCC0', dark: '#5E3E30', ear: '#FFC2B0', outfit: { kind: 'polo', color: '#9EE6B8' }, extras: ['cap'], open: true },
  { species: 'fox', height: 1.0, fur: '#F29A5C', light: '#FFF1E0', dark: '#6E4A3A', ear: '#FFC2B0', outfit: { kind: 'blouse', color: '#C9B5F7' }, extras: ['sunglasses'], lashes: true, open: true },
  { species: 'gecko', height: 1.0, fur: '#9BDB8A', light: '#E8F8D8', dark: '#5AA06A', ear: '#FFD48A', outfit: { kind: 'tee', color: '#FFB36B' }, open: true },
  { species: 'bear', height: 1.15, chub: 1.2, fur: '#7A5A4E', light: '#FFD9A8', dark: '#3A2A30', ear: '#FFB8A8', outfit: { kind: 'shirt', color: '#FFFFFF', shorts: '#3F6FB8' }, extras: ['cap'], open: true },
]

interface Rider {
  rig: Rig
  life: FaceLife
  /** Which arm waves (+1 right, -1 left) and when in the wave it starts. */
  arm: 1 | -1
  phase: number
  /** Standing at a wheel or tiller: its arms stay forward when not waving. */
  holds: boolean
}

/** A boat coming the other way: its people wave as it goes by (`update`, `waving`), and bounce when she taps it. */
export interface Passer {
  root: Group
  /** The people on it (they bounce when she taps it). */
  crew: Group
  update(dt: number, t: number, waving: boolean): void
}

export function buildPasser(bag: Bag, id: PassId): Passer {
  const root = new Group()
  const crew = new Group()
  root.add(crew)
  const riders: Rider[] = []
  let n = 0
  /** Someone sitting back on a seat whose top is at (x, y, z), facing `face` (radians; 0 = +z). */
  const sit = (x: number, y: number, z: number, face: number, look = SEA_FOLK[n % SEA_FOLK.length]) => {
    const rig = buildAnimal(look, bag)
    rig.root.children[0].visible = false
    const g = new Group()
    g.position.set(x, y, z)
    g.rotation.y = face
    rig.root.position.set(0, -hipsOf(rig), 0.12)
    sitBack(rig, 0.5)
    g.add(rig.root)
    crew.add(g)
    riders.push({ rig, life: new FaceLife(rig), arm: n % 3 === 1 ? -1 : 1, phase: (n * 0.37) % 1, holds: false })
    n++
    return rig
  }
  /** Someone standing on the floor at (x, y, z), hands forward on a wheel or a tiller. */
  const stand = (x: number, y: number, z: number, face: number, look: Look) => {
    const rig = buildAnimal(look, bag)
    rig.root.children[0].visible = false
    rig.root.position.set(x, y, z)
    rig.root.rotation.y = face
    crew.add(rig.root)
    riders.push({ rig, life: new FaceLife(rig), arm: 1, phase: (n * 0.37) % 1, holds: true })
    n++
    return rig
  }

  if (id === 'ferry') {
    // The wooden ferry to Na Dan: blue below and white above, a red band, a wooden rail and planked floor; a red roof
    // on white posts over two long benches back to back down the middle (the passengers face out at the sea and
    // wave), the wheelhouse up front with the captain at the wheel, life rings on the posts, tyres hung over the side
    // as fenders, and the Thai flag at the stern.
    const F = 0.95
    const G = 1.55
    const ROOF = 3.4
    const hull = loft(
      [
        hullSection(-7.15, 1.85, 0.05, G, null, 0.14),
        hullSection(-6.62, 2.0, -0.25, G, null, 0.14),
        hullSection(-6.6, 2.0, -0.25, G, F, 0.14),
        hullSection(-3, 2.06, -0.35, G + 0.01, F, 0.14),
        hullSection(2, 2.06, -0.35, G + 0.05, F, 0.14),
        hullSection(4.8, 1.9, -0.3, G + 0.13, F, 0.14),
        hullSection(5.6, 1.76, -0.22, G + 0.19, F, 0.14),
        hullSection(5.62, 1.76, -0.22, G + 0.19, null, 0.14),
        hullSection(6.8, 1.36, -0.05, G + 0.31, null, 0.14),
        hullSection(7.6, 0.86, 0.25, G + 0.41, null, 0.14),
        hullSection(8.1, 0.4, 0.7, G + 0.49, null, 0.14),
        hullSection(8.42, 0.05, 1.3, G + 0.53, null, 0.14),
      ],
      hullBands({ bottom: '#2F78D0', side: '#3F8FE8', pin: '#FFFFFF', stripe: '#F06A6A', upper: '#FFFFFF', top: '#C8925E', inside: '#E8CFA8', floor: '#D9B48A' }),
    )
    const posts = [-6.2, -3.6, -1, 1.6, 3.6]
    const parts = [
      hull,
      // The benches back to back down the middle, with their backrest between.
      ...[-1, 1].flatMap((s) => [P.rbox(0.5, 0.1, 9.4, 0.04, '#FFD48A', { at: [s * 0.42, 1.4, -1.6] }), P.box(0.36, 0.4, 9.2, '#E0B070', { at: [s * 0.42, 1.15, -1.6] })]),
      P.rbox(0.1, 0.5, 9.4, 0.04, '#FFD48A', { at: [0, 1.72, -1.6] }),
      // The posts and the roof: red, with a white edge and a raised middle.
      ...[-1, 1].flatMap((s) => posts.map((z) => P.cyl(0.07, 0.07, ROOF - G, '#FFFFFF', { at: [s * 1.92, (ROOF + G) / 2, z] }, 8))),
      P.rbox(4.4, 0.16, 11.2, 0.06, '#F06A6A', { at: [0, ROOF + 0.06, -1.3] }),
      P.rbox(4.46, 0.07, 11.26, 0.03, '#FFFFFF', { at: [0, ROOF - 0.04, -1.3] }),
      P.rbox(2.6, 0.16, 10.4, 0.06, '#FF8A8A', { at: [0, ROOF + 0.2, -1.3] }),
      // The wheelhouse: a low white wall, corner posts, glass in front, its own blue roof, the wheel.
      P.rbox(2.6, 1.0, 1.7, 0.08, '#FFFFFF', { at: [0, F + 0.5, 4.75] }),
      ...[-1, 1].flatMap((s) => [-1, 1].map((e) => P.box(0.1, ROOF - F - 1, 0.1, '#FFFFFF', { at: [s * 1.25, (ROOF + F + 1) / 2, 4.75 + e * 0.8] }))),
      P.box(2.4, 0.9, 0.05, '#9FD5F2', { at: [0, F + 1.6, 5.58], rot: [-0.12, 0, 0] }),
      P.rbox(3.0, 0.16, 2.2, 0.06, '#3F8FE8', { at: [0, ROOF + 0.06, 4.75] }),
      P.torus(0.22, 0.04, '#7A5340', { at: [0.5, F + 1.2, 5.25], rot: [1.2, 0, 0] }),
      // The engine box at the stern, its exhaust, and the flag pole.
      P.rbox(1.4, 0.7, 1.0, 0.1, '#5C5468', { at: [0, G + 0.3, -6.7] }),
      P.cyl(0.08, 0.08, 1.6, '#3E3848', { at: [0.5, G + 1.2, -6.8] }, 8),
      P.cyl(0.04, 0.04, 2.6, '#FFFFFF', { at: [-1.4, G + 1.3, -6.9] }, 6),
      // Tyres hung over the sides as fenders, and life rings on the outer posts.
      ...[-1, 1].flatMap((s) => [-4.6, -0.4, 3.4].map((z) => P.torus(0.24, 0.1, '#3A3140', { at: [s * 2.12, 1.0, z], rot: [0, Math.PI / 2, 0] }))),
      ...[-1, 1].flatMap((s) => [-6.2, 1.6].flatMap((z) => [P.torus(0.26, 0.07, '#FF8A2E', { at: [s * 2.0, 2.3, z], rot: [0, Math.PI / 2, 0] }), ...[0, 1, 2, 3].map((k) => P.torus(0.26, 0.075, '#FFFFFF', { at: [s * 2.0, 2.3, z], rot: [(k * Math.PI) / 2, Math.PI / 2, 0] }, 0.45))])),
    ]
    root.add(solid(merge(parts), bag, 2.5))
    // The Thai flag: red, white, a wide blue middle, white, red.
    const flag = new Group()
    flag.position.set(-1.4, G + 2.3, -6.9)
    flag.add(solid(merge([['#E8403F', 0.24], ['#FFFFFF', 0.12], ['#2F3E9C', 0], ['#FFFFFF', -0.12], ['#E8403F', -0.24]].map(([c, y], i) => P.box(0.02, i === 2 ? 0.24 : 0.12, 0.72, c as string, { at: [0, y as number, -0.38] }))), bag, 1.5))
    root.add(flag)
    // Passengers on the benches facing out, and the captain at the wheel.
    // (A little bigger than life, so they read from her boat across the water.)
    for (const [s, z] of [[-1, -4.9], [-1, -2.3], [-1, 0.3], [1, -3.4]] as const) {
      const look = SEA_FOLK[n % SEA_FOLK.length]
      sit(s * 0.42, 1.45, z, (s * Math.PI) / 2, { ...look, height: look.height * 1.3 })
    }
    stand(0.5, F, 4.5, 0, SEA_FOLK[6])
  } else if (id === 'longtail') {
    // A longtail boat: a long narrow wooden hull whose bow sweeps up high, a blue band, a striped sun canopy on four
    // poles, and the big engine on its pivot at the stern with the long shaft out behind into the water.
    const hull = loft(
      [
        hullSection(-3.6, 0.45, 0.05, 0.5, null, 0.07),
        hullSection(-3.3, 0.55, -0.08, 0.5, null, 0.07),
        hullSection(-3.28, 0.55, -0.08, 0.5, 0.18, 0.07),
        hullSection(-1, 0.64, -0.14, 0.52, 0.18, 0.07),
        hullSection(1.4, 0.6, -0.12, 0.6, 0.18, 0.07),
        hullSection(2.6, 0.45, -0.04, 0.78, 0.18, 0.07),
        hullSection(2.62, 0.45, -0.04, 0.78, null, 0.07),
        hullSection(3.3, 0.24, 0.2, 1.1, null, 0.07),
        hullSection(3.7, 0.08, 0.6, 1.55, null, 0.07),
        hullSection(3.85, 0.02, 1.2, 1.85, null, 0.07),
      ],
      hullBands({ bottom: '#7A5236', side: '#9A6B44', pin: '#FFFFFF', stripe: '#4FA3C9', top: '#C8925E', inside: '#B8885C', floor: '#C89A6A' }),
    )
    const parts = [
      hull,
      // The canopy: four poles and a striped top.
      ...[-1, 1].flatMap((s) => [-1.6, 1.2].map((z) => P.cyl(0.03, 0.03, 1.5, '#F4EEE6', { at: [s * 0.5, 1.2, z] }, 6))),
      ...[0, 1, 2, 3, 4].map((k) => P.box(0.24, 0.06, 3.0, k % 2 ? '#FFFFFF' : '#FF8FB8', { at: [-0.48 + k * 0.24, 1.97, -0.2] })),
      // Cross benches.
      ...[-0.9, 0.6].map((z) => P.rbox(1.08, 0.08, 0.36, 0.03, '#E8B880', { at: [0, 0.52, z] })),
      // The engine on its pivot, the long shaft and the propeller.
      P.cyl(0.06, 0.08, 0.3, '#3E3848', { at: [0, 0.65, -3.45] }, 8),
      P.rbox(0.5, 0.42, 0.7, 0.08, '#5C5468', { at: [0, 0.98, -3.55] }),
      P.cyl(0.04, 0.04, 2.6, '#9AA0AE', { at: [0, 0.4, -4.75], rot: [Math.PI / 2 + 0.26, 0, 0] }, 6),
      P.box(0.4, 0.06, 0.06, '#9AA0AE', { at: [0, 0.06, -6.0] }),
      P.cyl(0.03, 0.03, 0.8, '#5C5468', { at: [0, 1.3, -3.2], rot: [-0.9, 0, 0] }, 6),
    ]
    root.add(solid(merge(parts), bag, 2))
    stand(0, 0.18, -2.75, 0, SEA_FOLK[6])
    sit(0, 0.56, 0.6, 0, SEA_FOLK[0])
    sit(0, 0.56, -0.9, 0, SEA_FOLK[4])
  } else if (id === 'ski') {
    const ski = buildSki(bag, HIS)
    root.add(ski.root)
    const r = stand(0, 0.56, -0.25, 0, SEA_FOLK[1])
    r.root.position.y = 0.66 - hipsOf(r)
  } else {
    const b = buildBoat(bag, PAL.mint)
    root.add(b.root)
    stand(0.45, FLOOR, 0.62, 0, SEA_FOLK[3])
    sit(-0.5, BENCH, -2.55, 0, SEA_FOLK[2])
    sit(0.5, BENCH, -2.55, 0, SEA_FOLK[5])
  }

  return {
    root,
    crew,
    update(dt, t, waving) {
      for (const r of riders) {
        r.life.update(dt)
        const { armL, armR, head } = r.rig
        const ease = Math.min(1, dt * 8)
        const flap = Math.sin(t * 13 + r.phase * 6) * 0.35
        const rest = r.holds ? -1.1 : -0.2
        const waveR = waving && r.arm === 1
        const waveL = waving && r.arm === -1
        armR.rotation.x += ((waveR ? -0.2 : rest) - armR.rotation.x) * ease
        armR.rotation.z += ((waveR ? 2.5 + flap : r.holds ? 0 : -0.15) - armR.rotation.z) * ease
        armL.rotation.x += ((waveL ? -0.2 : rest) - armL.rotation.x) * ease
        armL.rotation.z += ((waveL ? -2.5 - flap : r.holds ? 0 : 0.15) - armL.rotation.z) * ease
        head.rotation.y = Math.sin(t * 0.5 + r.phase * 9) * 0.3
      }
    },
  }
}

/** A flying fish: its body, its two big wing fins and its tail (flyFish animates them). */
export interface FlyFishParts {
  root: Group
  wings: Group[]
  hind: Group[]
  tail: Group
}

/** A flying fish, about 0.8 m long so she can see and tap it: a sleek body, deep blue on top, silver on its sides and
 *  white underneath, big round eyes, two long see-through blue wing fins with dark rays (and a smaller pair behind),
 *  a little fin on its back and a forked tail with the longer lobe below (the one it skims the water with). */
export function buildFlyFish(bag: Bag): FlyFishParts {
  const root = new Group()
  const ring = (z: number, w: number, h: number) => ({
    z,
    pts: [[0, -h], [w * 0.75, -h * 0.65], [w, 0], [w * 0.75, h * 0.7], [0, h], [-w * 0.75, h * 0.7], [-w, 0], [-w * 0.75, -h * 0.65]] as [number, number][],
  })
  const BACK = '#3F6FC8'
  const SIDE = '#A9CDF2'
  const BELLY = '#F4F8FF'
  const body = loft([ring(-0.34, 0.025, 0.035), ring(-0.22, 0.055, 0.07), ring(0, 0.085, 0.1), ring(0.18, 0.08, 0.09), ring(0.3, 0.05, 0.06), ring(0.37, 0.012, 0.016)], [BELLY, SIDE, SIDE, BACK, BACK, SIDE, SIDE, BELLY])
  root.add(
    solid(
      merge([
        body,
        ...[-1, 1].flatMap((s) => [P.sphere(0.042, '#FFFFFF', { at: [s * 0.058, 0.025, 0.25] }, 12), P.sphere(0.026, '#2A2333', { at: [s * 0.085, 0.028, 0.265] }, 10), P.sphere(0.009, '#FFFFFF', { at: [s * 0.1, 0.04, 0.275] }, 6)]),
        P.prism([[0, 0], [-0.12, 0.07], [-0.1, 0]], 0.012, BACK, { at: [0, 0.08, -0.12], rot: [0, Math.PI / 2, 0] }),
      ]),
      bag,
      1.5,
    ),
  )
  // A wing fin (in the x-z plane, reaching out along +x from its root): a long fan, rays along it.
  const fin = (len: number, s: 1 | -1) => {
    const pts: [number, number][] = [[0, 0.03], [len * 0.5, 0.1], [len, 0.06], [len * 1.02, -0.04], [len * 0.7, -0.16], [len * 0.3, -0.14], [0, -0.04]]
    const shape = pts.map(([x, y]) => [x * s, y] as [number, number])
    // Rays fanning out from the root toward the tip.
    const rays = [0.06, -0.02, -0.1].map((tip) => {
      const a = Math.atan2(tip, len)
      const r = len * 0.88
      return P.box(r, 0.016, 0.012, '#5D8FD8', { at: [s * Math.cos(a) * r * 0.5, 0.008, Math.sin(a) * r * 0.5], rot: [0, -s * a, 0] })
    })
    const g = new Group()
    g.add(solid(merge([P.prism(s < 0 ? [...shape].reverse() : shape, 0.01, '#BFE3FF', { rot: [Math.PI / 2, 0, 0] }), ...rays]), bag, 1.2))
    return g
  }
  const wings = ([-1, 1] as const).map((s) => {
    const g = fin(0.55, s)
    g.position.set(s * 0.07, 0.02, 0.14)
    root.add(g)
    return g
  })
  const hind = ([-1, 1] as const).map((s) => {
    const g = fin(0.22, s)
    g.position.set(s * 0.04, -0.04, -0.14)
    root.add(g)
    return g
  })
  const tail = new Group()
  tail.position.z = -0.33
  tail.add(solid(P.prism([[0, 0.02], [0.2, 0.15], [0.13, 0.01], [0.28, -0.19], [0, -0.03]], 0.012, SIDE, { rot: [0, Math.PI / 2, 0] }), bag, 1.2))
  root.add(tail)
  root.visible = false
  return { root, wings, hind, tail }
}

/** A flying fish `k` of the way through its glide (0 out of the water .. 1 back in): the wings spread wide as it leaves
 *  the water and fold back as it dives, quivering while it glides; the tail beats hard as it takes off and lands and
 *  hardly at all in the air. */
export function flyFish(f: FlyFishParts, k: number, t: number) {
  const open = Math.min(1, Math.min(k, 1 - k) / 0.12)
  f.wings.forEach((w, i) => {
    const s = i ? 1 : -1
    w.rotation.y = s * (1 - open) * 1.2
    w.rotation.z = s * (0.1 + Math.sin(t * 38) * 0.06 * open)
  })
  f.hind.forEach((w, i) => (w.rotation.y = (i ? 1 : -1) * (1 - open) * 1.0))
  f.tail.rotation.y = Math.sin(t * 40) * (0.15 + 0.45 * (1 - open))
}

// Penguin Slide's Antarctica, in the films' look (story/props.ts: the same mountains, table icebergs, drifts and ice
// colors as story/stage.ts `buildAntarctic`): the land beside the valley (mountains, drifts, blue ice, rocks), the
// science station with its flag and a waving scientist, the sea's table icebergs and floes, the light under the sea,
// and the sea floor. Everything that never moves is merged into a few shapes; the station's flag and the scientist's
// arm are on pivots for slide.ts to swing.
import { AdditiveBlending, Group, Mesh, MeshBasicMaterial, type BufferGeometry, type Object3D } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { roundSkirt } from '../../look/sea'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'
import { bergGeo, driftGeo, floeGeo, floeSkirt, ICE_BLUE, ICE_LINE, mountainGeo, rng, tableBergGeo } from '../../story/props'
import { cx, DIVE_END, EDGE, ground, half, HOME, LOOKS, SHELF, SHELF_Y, SPOTS } from './course'

/** Nothing is scattered this close (m) to someone standing on the snowbank. */
const CLEAR: [number, number][] = [...SPOTS.gentoos, SPOTS.elephant, SPOTS.skua, SPOTS.station, SPOTS.scientist, [SPOTS.station[0] - 6, SPOTS.station[1] - 3]]
const clear = (s: number, lat: number) => CLEAR.every(([cs, cl]) => Math.hypot(s - cs, lat - cl) > 6)

/** The land beside the valley: mountains beyond it, drifts and blue ice on its banks, dark rocks poking through. */
export function buildLand(bag: Bag) {
  const r = rng(21)
  const g = new Group()
  const far = []
  for (let s = -40; s < EDGE - 10; s += 46) {
    for (const side of [-1, 1]) {
      const lat = side * (46 + r() * 44)
      const rr = 15 + r() * 12
      const h = 20 + r() * 20
      far.push(mountainGeo(rr, h, Math.floor(r() * 99)).translate(cx(s) + lat, ground(Math.max(0, s), lat) - 3, -s - r() * 20))
    }
  }
  g.add(solid(merge(far), bag, 2.5, ICE_LINE))
  const near = []
  for (let s = 6; s < EDGE - 6; s += 9) {
    for (const side of [-1, 1]) {
      const k = r()
      const lat = side * (half(s) + 2.6 + r() * 6)
      if (!clear(s, lat)) continue
      const x = cx(s) + lat
      const y = ground(s, lat)
      if (k < 0.5) near.push(driftGeo(1.3 + r() * 1.8, 0.5 + r() * 0.5).rotateY(r() * 3).translate(x, y - 0.05, -s))
      else if (k < 0.8) {
        // Blue ice: a faceted lump of old ice poking through the snow.
        near.push(bergGeo(0.9 + r() * 0.9, Math.floor(r() * 500)).rotateY(r() * 6).translate(x, y - 0.2, -s))
      } else {
        const w = 1 + r() * 1.4
        near.push(P.rbox(w, w * 0.8, w * 1.2, 0.3, r() < 0.5 ? '#8E95A8' : '#7F879B', { at: [x + side * 2, ground(s, lat + side * 2) + w * 0.2, -s], rot: [r() * 0.4, r() * 3, r() * 0.4] }), P.sphere(w * 0.5, '#FFFFFF', { at: [x + side * 2, ground(s, lat + side * 2) + w * 0.62, -s], scale: [1.1, 0.35, 1.2] }, 10))
      }
    }
  }
  g.add(solid(merge(near), bag, 2.5))
  return g
}

/** The science station on its stilts (root at the snow under it, door toward +z), and the scientist (root at their
 *  boots, facing +z). `flag` flaps about the pole; `arm` waves from the shoulder. */
export function buildStation(bag: Bag) {
  const red = '#F0564E'
  const hut = new Group()
  hut.add(
    solidMix(
      [
        ...[-1.6, 1.6].flatMap((x) => [-0.9, 0.9].map((z) => P.cyl(0.1, 0.1, 3.4, '#8A8FA6', { at: [x, 0.3, z] }, 8))),
        P.rbox(4.6, 2, 2.8, 0.3, red, { at: [0, 2.9, 0] }),
        P.rbox(4.8, 0.3, 3, 0.12, '#FFFDF7', { at: [0, 4, 0] }),
        P.rbox(0.8, 1.3, 0.1, 0.05, '#FFFDF7', { at: [-1.3, 2.7, 1.42] }),
        // Steps down from the door, the radar ball and the mast on the roof, fuel drums and a sled on the snow.
        ...[0, 1, 2, 3].map((i) => P.box(0.8, 0.08, 0.3, '#C98B4B', { at: [-1.3, 1.9 - i * 0.5, 1.7 + i * 0.35] })),
        P.sphere(0.85, '#FFFFFF', { at: [1.1, 4.6, 0] }, 14),
        P.cyl(0.04, 0.04, 2.2, '#8A8FA6', { at: [-1.6, 5.2, -0.6] }, 6),
        P.sphere(0.14, red, { at: [-1.6, 6.35, -0.6] }, 8),
        P.cyl(0.32, 0.32, 0.8, PAL.gold, { at: [3.2, 0.3, 0.6] }, 12),
        P.cyl(0.32, 0.32, 0.8, PAL.mint, { at: [3.9, 0.25, 0.2] }, 12),
        P.rbox(1.5, 0.12, 0.6, 0.05, '#E0A868', { at: [-3.4, 0.2, 1.4], rot: [0, 0.3, 0] }),
        // The flagpole.
        P.cyl(0.06, 0.06, 5, '#FFFFFF', { at: [3, 2.6, 2.2] }, 8),
        P.sphere(0.12, PAL.gold, { at: [3, 5.15, 2.2] }, 8),
      ],
      [0.2, 1.1].map((x) => P.sphere(0.36, '#8FD0F5', { at: [x, 3, 1.41], scale: [1, 1, 0.12] }, 12)),
      bag,
      2.5,
    ),
  )
  // The flag: pink with a gold star (nobody owns Antarctica), hinged at the pole.
  const flag = new Group()
  flag.position.set(3, 4.55, 2.2)
  flag.add(solidMix([P.box(1.5, 0.9, 0.04, PAL.pink, { at: [0.78, 0, 0] })], [P.cone(0.24, 0.02, PAL.gold, { at: [0.78, 0, 0.03], rot: [Math.PI / 2, 0, 0] }, 5)], bag, 2))
  hut.add(flag)

  // The scientist: an orange parka with a furry hood, goggles pushed up, big mittens.
  const who = new Group()
  const skin = '#F3CDAE'
  const parka = '#FF9A3D'
  who.add(
    solidMix(
      [
        P.capsule(0.3, 0.5, parka, { at: [0, 0.85, 0] }),
        P.capsule(0.11, 0.3, '#4A4F60', { at: [0.14, 0.3, 0] }),
        P.capsule(0.11, 0.3, '#4A4F60', { at: [-0.14, 0.3, 0] }),
        P.sphere(0.14, '#7A5C48', { at: [0.14, 0.08, 0.05], scale: [1, 0.6, 1.4] }, 10),
        P.sphere(0.14, '#7A5C48', { at: [-0.14, 0.08, 0.05], scale: [1, 0.6, 1.4] }, 10),
        P.sphere(0.3, parka, { at: [0, 1.52, -0.03] }, 16),
        P.torus(0.25, 0.07, PAL.cream, { at: [0, 1.52, 0.12] }),
        P.sphere(0.23, skin, { at: [0, 1.52, 0.08] }, 16),
        // The arm that hangs.
        P.capsule(0.09, 0.4, parka, { at: [-0.38, 0.92, 0], rot: [0, 0, -0.25] }),
        P.sphere(0.12, PAL.mint, { at: [-0.46, 0.62, 0] }, 10),
      ],
      [
        P.sphere(0.03, PAL.ink, { at: [0.08, 1.55, 0.3] }, 8),
        P.sphere(0.03, PAL.ink, { at: [-0.08, 1.55, 0.3] }, 8),
        P.torus(0.07, 0.014, PAL.ink, { at: [0, 1.47, 0.3], rot: [0, 0, Math.PI] }, Math.PI),
        P.sphere(0.04, PAL.pink, { at: [0.15, 1.47, 0.26], scale: [1, 0.6, 0.4] }, 8),
        P.sphere(0.04, PAL.pink, { at: [-0.15, 1.47, 0.26], scale: [1, 0.6, 0.4] }, 8),
      ],
      bag,
      2.5,
    ),
  )
  const arm = new Group()
  arm.position.set(0.34, 1.14, 0)
  arm.add(solid(merge([P.capsule(0.09, 0.4, parka, { at: [0, 0.28, 0] }), P.sphere(0.13, PAL.mint, { at: [0, 0.6, 0] }, 10)]), bag, 2.5))
  who.add(arm)
  return { hut, flag, who, arm }
}

/** The sea: flat table icebergs standing in it (each with its blue keel under the water), floes on top (their
 *  undersides are the ceiling he swims under) and the ice edge's land at the end, mountains beyond. */
/** `glow`: the sea's glow round floating ice (look/sea.ts PolarSea.skirt), from its skirt geometry. */
export function buildSea(bag: Bag, glow: (g: BufferGeometry) => Object3D) {
  const r = rng(33)
  const g = new Group()
  const bergs = []
  const glows: BufferGeometry[] = []
  for (const [ds, lat, w, d, h] of [
    [40, -78, 34, 20, 7],
    [70, 46, 30, 18, 6],
    [120, 15, 7, 6, 2],
    [150, -52, 40, 22, 8],
    [182, -17, 8, 6, 2.4],
    [215, 36, 22, 14, 5],
    [250, 16, 6, 5, 1.8],
    [282, -36, 28, 16, 6],
    [330, 62, 46, 24, 9],
    [345, -70, 30, 18, 7],
  ]) {
    const s = EDGE + ds
    bergs.push(tableBergGeo(w, d, h).translate(cx(s) + lat, 0, -s), P.rbox(w * 0.86, 8, d * 0.86, 0.5, '#9CCBEF', { at: [cx(s) + lat, -4.3, -s] }))
    glows.push(roundSkirt(w / 2, Math.min(3, w * 0.12), 32, d / w).translate(cx(s) + lat, 0, -s))
  }
  // The land at the ice edge behind where he climbs out, and its mountains.
  bergs.push(P.box(260, 6, 150, '#FFFFFF', { at: [cx(HOME), SHELF_Y - 3.05, -(SHELF + 44 + 75)] }), P.box(260, 1.2, 0.4, ICE_BLUE, { at: [cx(HOME), SHELF_Y - 1.4, -(SHELF + 43.9)] }))
  for (const [dx, dz, rr, h, seed] of [[-60, 110, 26, 30, 1], [-8, 130, 34, 40, 2], [52, 105, 24, 26, 3], [-110, 90, 22, 24, 4], [96, 120, 20, 22, 5]]) bergs.push(mountainGeo(rr, h, seed).translate(cx(HOME) + dx, SHELF_Y - 0.5, -(SHELF + dz)))
  for (let i = 0; i < 9; i++) bergs.push(driftGeo(1.5 + r() * 2.5, 0.4 + r() * 0.5).translate(cx(HOME) + (r() - 0.5) * 36, SHELF_Y - 0.05, -(SHELF + 16 + r() * 40)))
  g.add(solid(merge(bergs), bag, 2.5, ICE_LINE))

  const floes = []
  for (let s = EDGE + 26; s < DIVE_END - 26; s += 15) {
    const side = r() < 0.5 ? -1 : 1
    const rr = 1.6 + r() * 2.2
    const seed = Math.floor(r() * 999)
    const turn = r() * 6
    const x = cx(s) + side * (rr + 0.5 + r() * 8)
    const z = -s - r() * 6
    floes.push(floeGeo(rr, seed).rotateY(turn).translate(x, 0, z))
    glows.push(floeSkirt(rr, seed).rotateY(turn).translate(x, 0, z))
  }
  // A few round the ice edge too.
  for (const [dx, dz, rr] of [[-19, 6, 2.6], [20, 14, 3], [-22, 26, 2.2]]) {
    floes.push(floeGeo(rr, 70 + dz).translate(cx(HOME) + dx, 0, -(SHELF + dz)))
    glows.push(floeSkirt(rr, 70 + dz).translate(cx(HOME) + dx, 0, -(SHELF + dz)))
  }
  g.add(solid(merge(floes), bag, 2.5, ICE_LINE), glow(mergeGeometries(glows)!))
  return g
}

/** Sunlight coming down through the sea in soft shafts, all along his swim. `update(t)` makes them shimmer. */
export function buildShafts(bag: Bag) {
  const r = rng(5)
  const parts = []
  for (let s = EDGE + 8; s < DIVE_END + 6; s += 11) {
    const lat = (r() - 0.5) * 26
    const w = 1.4 + r() * 2
    parts.push(P.cone(w, 10.5, '#FFFFFF', { at: [cx(s) + lat, -5.2, -s - r() * 8], rot: [(r() - 0.5) * 0.3, 0, 0.12 + (r() - 0.5) * 0.2] }, 7))
  }
  const mat = bag.add(new MeshBasicMaterial({ color: '#CFF3FF', transparent: true, opacity: 0.05, blending: AdditiveBlending, depthWrite: false, fog: false }))
  const mesh = new Mesh(bag.add(merge(parts)), mat)
  mesh.renderOrder = 2
  return { mesh, update: (t: number) => (mat.opacity = 0.05 + 0.015 * Math.sin(t * 0.9)) }
}

/** The sea floor's life (no kelp grows here): sea stars, pale sponges and lumps of blue ice among the rocks. */
export function buildFloor(bag: Bag, y: number) {
  const r = rng(9)
  const parts = []
  // (Nothing right under a maybe-Pebble: the buoy and the fish ball are looked at against plain water.)
  const sea = LOOKS.filter((l) => l.s > EDGE)
  for (let s = EDGE + 6; s < DIVE_END; s += 4.5) {
    const lat = (r() - 0.5) * 24
    if (sea.some((l) => Math.hypot(l.s - s, l.lat - lat) < 3)) continue
    const x = cx(s) + lat
    const k = r()
    if (k < 0.45) parts.push(P.cone(0.45 + r() * 0.35, 0.16, [PAL.pink, PAL.peach, '#FFB36B', PAL.lavenderDark][Math.floor(r() * 4)], { at: [x, y + 0.1, -s], rot: [0, r() * 3, 0] }, 5))
    else if (k < 0.75) {
      const h = 0.6 + r() * 1.1
      parts.push(P.cyl(0.3 + r() * 0.2, 0.2, h, r() < 0.5 ? PAL.butter : PAL.cream, { at: [x, y + h / 2, -s] }, 9), P.cyl(0.2, 0.14, h * 0.6, PAL.butter, { at: [x + 0.45, y + h * 0.3, -s + 0.2] }, 8))
    } else parts.push(P.cone(0.8 + r() * 0.8, 1.4 + r() * 1.6, r() < 0.5 ? ICE_BLUE : '#CBE6FB', { at: [x, y + 0.6, -s], rot: [(r() - 0.5) * 0.5, r() * 3, (r() - 0.5) * 0.5] }, 5))
  }
  return solid(merge(parts), bag, 2)
}

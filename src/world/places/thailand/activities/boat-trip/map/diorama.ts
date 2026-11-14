// The Krabi map's shapes (layout.ts says where): a toy diorama of Krabi and Phang Nga Bay in the Thailand map's look
// (hub/map/), floating in the sky in the same toy tray. The land and the islands stand up out of the sea like slices
// of cake (ground.ts paints them), wooded in the Thailand map's round trees, palms along the shore, Khao Phanom Bencha
// green with a waterfall, and the bay full of limestone towers with jungle on top, foam round their feet.
//
// The places stand up like chunky toys (layout.ts PLACES `scale`): the airport (a pink-roofed terminal, its tower and the runway),
// Krabi Town (pastel shophouses along the river between its twin rocks, and the giant fiddler crab by the water),
// Baan Chang (a thatched cafe in a bamboo yard, two elephants under the palms) and the pier (a wooden jetty out into
// the bay, a ticket hut, the family's longtail with its ribbons at the end).
//
// The places the trip doesn't go to yet stand there too, to poke: Ao Nang's beach (umbrellas, longtails pulled up,
// little hotels) and Railay's cliffs with a monkey on top, Chicken Island (a rock with a chicken's head), Koh Phi Phi
// (two green humps on a sandy neck), Koh Lanta's lighthouse, Ko Tapu (the Nail Island) and Ko Panyee's stilt village
// with its floating football pitch. And what moves: the little pink songthaew, a tiny plane, two longtails buzzing
// round, the big ferry to Phi Phi and Lanta, dolphins, a sea turtle, a sea eagle, clouds.
import { Group, type BufferGeometry } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { trayParts } from '../../../trip/sky'
import { smoothLine, type Net } from '../../../trip/net'
import { buildSongthaew, type Songthaew } from '../../../trip/vehicles/songthaew'
import * as T from '../../hub/map/toys'
import type { Sea } from '../../hub/map/terrain'
import { buildField, buildGround, buildSea } from './ground'
import {
  BOARD,
  CAR_SCALE,
  CLOUDS,
  DEG_M,
  HILLS,
  KARSTS,
  ll,
  MORE_ROADS,
  PLACES,
  RUNWAY,
  SPOTS,
  STAMP_Y,
  STOP_PLACE,
  STOPS,
  TOY_ISLANDS,
  TWINS,
  type PlaceId,
  type SpotId,
  type Stop,
  type XZ,
} from './layout'

const WOOD = '#C99A6E'
const WOOD_DARK = '#9C7250'
const ROOF = '#FF8A4D'
const THATCH = '#E9C98F'
const ROCK = '#CFC8E4'
const ROCK_DARK = '#B9B0D6'
/** The spots (the places the trip doesn't go to yet) stand this much bigger than the board's scale, like toys. */
const SPOT_SCALE = 1.5
/** Toy limestone towers, scaled from the Thailand map's to this board. */
const KARST_S = 0.42
/** The sea's top (the land stands up from it). */
const LEVEL_SEA = 0

export interface Diorama {
  root: Group
  places: Record<PlaceId, Group>
  spots: Record<SpotId, Group>
  stamps: Record<Stop, Group>
  /** What floats over each place still to do, like the Thailand map's pins: a baby elephant over Baan Chang, a longtail
   *  with its ribbons over the pier (the stamp takes its place once it's done). */
  markers: Record<Stop, Group>
  plane: Group
  clouds: Group[]
  car: Songthaew
  /** The longtails buzzing round (BOAT_LOOPS), the family's longtail at the pier, the big ferry. */
  boats: Group[]
  pierBoat: Group
  ferry: Group
  dolphins: Group[]
  turtle: T.Turtle
  whale: { root: Group; tail: Group }
  yacht: Group
  eagle: { root: Group; wingL: Group; wingR: Group }
  elephants: T.Elephant[]
  crab: { root: Group; claw: Group }
  monkey: Group
  chicken: Group
  beam: Group
  sea: Sea
  /** Where things stand (x, z) that a tap on the board near them pokes, beyond the places and spots. */
  karsts: [number, number, number][]
}

export function buildDiorama(bag: Bag, net: Net<PlaceId>): Diorama {
  const f = buildField()
  const y = (x: number, z: number) => Math.max(0, f.height(x, z))
  const root = new Group()
  const W = BOARD.x1 - BOARD.x0
  const D = BOARD.z1 - BOARD.z0
  // ---- The toy tray round the board (the Thailand map's), the sea in it ----
  root.add(solid(merge(trayParts(W, D, 0.07, 0.2, 0.55)), bag, 2))
  const sea = buildSea(bag)
  root.add(sea.mesh)

  // ---- The limestone towers in the bay (only the ones out at sea) ----
  const karsts: [number, number, number][] = []
  const rocks: BufferGeometry[] = []
  KARSTS.forEach(([lon, lat, s], i) => {
    const [x, z] = ll(lon, lat)
    if (f.land(x, z) > -0.04) return
    karsts.push([x, z, s])
    rocks.push(...T.karstParts(x, LEVEL_SEA - 0.02, z, s * KARST_S, i))
  })
  // Krabi Town's twin rocks at the river mouth.
  for (const [k, [lon, lat]] of TWINS.entries()) {
    const [x, z] = ll(lon, lat)
    rocks.push(...T.karstParts(x, y(x, z) - 0.02, z, 0.26 + k * 0.04, k + 3))
  }
  root.add(solid(merge(rocks), bag, 1.5))

  // ---- Mountains, trees and palms on the land, away from the roads, rivers and places ----
  const lines = [...net.lines, ...MORE_ROADS.map((l) => smoothLine(l))]
  const placeSpots: [number, number, number][] = [
    ...(Object.keys(PLACES) as PlaceId[]).flatMap((id) => [[...PLACES[id].model, 0.36], [...PLACES[id].at, 0.16]] as [number, number, number][]),
    ...(Object.keys(SPOTS) as SpotId[]).map((id) => [...SPOTS[id], id === 'bencha' ? 0.25 : 0.3] as [number, number, number]),
    [RUNWAY.at[0], RUNWAY.at[1], 0.55],
    ...TWINS.map(([lon, lat]) => [...ll(lon, lat), 0.22] as [number, number, number]),
  ]
  const away = (x: number, z: number, road = 0.1) =>
    !lines.some((l) => l.some(([px, pz], i) => i % 3 === 0 && Math.hypot(px - x, pz - z) < road)) && placeSpots.every(([px, pz, r]) => Math.hypot(px - x, pz - z) > r)
  const shadows: [number, number, number][] = []
  const mountains: BufferGeometry[] = []
  const peaks: [number, number, number][] = []
  HILLS.forEach(([lon, lat, r, h], i) => {
    if (h < 0.2) return
    const [x, z] = ll(lon, lat)
    const rad = r * DEG_M * 0.42
    if (!away(x, z, 0.12)) return
    peaks.push([x, z, rad])
    shadows.push([x, z, rad * 1.25])
    mountains.push(...T.mountainParts(x, y(x, z), z, rad, h * 1.2 + 0.1, i))
  })
  const trees: BufferGeometry[] = []
  const planted: [number, number][] = []
  let seed = 23
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  for (let i = 0; i < 5000 && planted.length < 240; i++) {
    const x = BOARD.x0 + 0.1 + rnd() * (W - 0.2)
    const z = BOARD.z0 + 0.1 + rnd() * (D - 0.2)
    const d = f.land(x, z)
    if (d < 0.07 || !away(x, z) || peaks.some(([px, pz, r]) => Math.hypot(px - x, pz - z) < r * 1.05)) continue
    // Forest up the hills, palms down by the shore, a few trees dotted on the flat.
    const hill = f.hill(x, z)
    const shore = d < 0.2
    if (!shore && hill < 0.06 && rnd() > 0.12) continue
    if (planted.some(([sx, sz]) => Math.hypot(sx - x, sz - z) < 0.075)) continue
    planted.push([x, z])
    const s = 0.42 + rnd() * 0.22
    if (shore || z > BOARD.z1 - 1.6) trees.push(...T.palmParts(x, y(x, z), z, s * 0.55, rnd() * 6.28, false))
    else trees.push(...T.treeParts(x, y(x, z), z, s, i))
    shadows.push([x, z, 0.1 * s + 0.02])
  }
  root.add(solid(merge(mountains), bag, 1.5), solid(merge(trees), bag, 1.5))
  for (const [x, z, r] of placeSpots) shadows.push([x, z, Math.min(0.3, r * 0.8)])
  root.add(buildGround(bag, { roads: net.lines, more: MORE_ROADS.map((l) => smoothLine(l)), shadows, keep: placeSpots }))

  // A bridge wherever a road crosses the Krabi River.
  const river = smoothLine([ll(98.955, 8.18), ll(98.94, 8.13), ll(98.925, 8.09), ll(98.915, 8.055)])
  const bridges: BufferGeometry[] = []
  for (const line of lines)
    for (let i = 0; i < line.length; i += 2) {
      const [x, z] = line[i]
      if (!river.some(([rx, rz]) => Math.hypot(rx - x, rz - z) < 0.035)) continue
      const [ax, az] = line[Math.max(0, i - 2)]
      const [bx, bz] = line[Math.min(line.length - 1, i + 2)]
      const yaw = Math.atan2(bx - ax, bz - az)
      const g = y(x, z)
      bridges.push(P.rbox(0.1, 0.02, 0.2, 0.008, '#E8DCCB', { at: [x, g + 0.012, z], rot: [0, yaw, 0] }), ...[-1, 1].map((s) => P.box(0.008, 0.026, 0.2, WOOD_DARK, { at: [x + Math.cos(yaw) * s * 0.05, g + 0.03, z - Math.sin(yaw) * s * 0.05], rot: [0, yaw, 0] })))
      i += 10
    }
  if (bridges.length) root.add(solid(merge(bridges), bag, 1.5))

  // ---- The places ----
  /** A group standing at (x, z), built from parts in board coordinates, scaled up like a toy about its foot. */
  const toyAt = (at: XZ, parts: BufferGeometry[], px = 2, scale = SPOT_SCALE) => {
    const g = new Group()
    const [x, z] = at
    const gy = y(x, z)
    g.position.set(x, gy, z)
    g.scale.setScalar(scale)
    for (const p of parts) p.translate(-x, -gy, -z)
    g.add(solid(merge(parts), bag, px))
    root.add(g)
    return g
  }
  const places = {
    airport: toyAt(PLACES.airport.model, airportParts(PLACES.airport.model, y), 2, PLACES.airport.scale),
    town: toyAt(PLACES.town.model, townParts(PLACES.town.model, y), 1.5, PLACES.town.scale),
    chang: toyAt(PLACES.chang.model, changParts(PLACES.chang.model, y), 2, PLACES.chang.scale),
    pier: toyAt(PLACES.pier.model, pierParts(PLACES.pier.model, y), 2, PLACES.pier.scale),
  } as Record<PlaceId, Group>
  // The runway (flat on the board, not scaled with the terminal).
  root.add(solid(merge(runwayParts(y)), bag, 1.5))
  // Baan Chang's two elephants in their yard.
    const elephants = [T.elephant(bag, 1), T.elephant(bag, 0.7)]
  elephants.forEach((e, i) => {
    // (In the cafe's group, so they bounce with it: local to its foot, before its toy scale.)
    e.root.scale.setScalar(0.17 - i * 0.04)
    e.root.position.set(0.1 + i * 0.07, 0.005, 0.05 - i * 0.05)
    e.root.rotation.y = -0.5 - i * 0.4
    places.chang.add(e.root)
  })
  // Krabi Town's giant fiddler crab by the river mouth (its big claw waves).
  const crab = { root: new Group(), claw: new Group() }
  {
    const [x, z] = ll(98.94, 8.074)
    crab.root.position.set(x, y(x, z), z)
    crab.root.add(solid(merge([
      P.cyl(0.045, 0.05, 0.025, '#FFF7F0', { at: [0, 0.012, 0] }, 12),
      P.sphere(0.04, '#8E7FD0', { at: [0, 0.05, 0], scale: [1.3, 0.6, 1] }, 12),
      ...[-1, 1].flatMap((s) => [P.cyl(0.004, 0.004, 0.03, '#8E7FD0', { at: [s * 0.012, 0.08, 0.02] }, 5), P.sphere(0.008, '#FFFFFF', { at: [s * 0.012, 0.095, 0.02] }, 6), P.sphere(0.004, '#2B2330', { at: [s * 0.012, 0.096, 0.026] }, 5)]),
      ...[-1, 1].flatMap((s) => [0, 1, 2].map((k) => P.cyl(0.004, 0.004, 0.04, '#7A6CC0', { at: [s * 0.05, 0.04, -0.02 + k * 0.018], rot: [0, 0, s * 1.1] }, 4))),
      P.sphere(0.012, '#8E7FD0', { at: [-0.05, 0.05, 0.03] }, 6),
    ]), bag, 1.5))
    crab.claw.position.set(0.045, 0.055, 0.025)
    crab.claw.add(solid(merge([P.cyl(0.006, 0.006, 0.03, '#8E7FD0', { at: [0.008, 0.012, 0], rot: [0, 0, -0.5] }, 5), P.sphere(0.03, PAL.hotpink, { at: [0.02, 0.04, 0], scale: [0.8, 1.2, 0.6] }, 10)]), bag, 1.5))
    crab.root.add(crab.claw)
    crab.root.scale.setScalar(2.2)
    root.add(crab.root)
  }

  // ---- The places the trip doesn't go to yet (toys to poke) ----
  const monkey = new Group()
  const chicken = new Group()
  const beam = new Group()
  const spots = {} as Record<SpotId, Group>
  {
    // Ao Nang: the beach, umbrellas, longtails pulled up on the sand, little hotels behind.
    const [x, z] = SPOTS.aonang
    const g = y(x, z)
    spots.aonang = toyAt(SPOTS.aonang, [
      ...[[-0.12, 0.04, '#FF8FB8'], [0.0, 0.07, PAL.butter], [0.12, 0.05, PAL.mint]].flatMap(([dx, dz, c]) => parasol(x + (dx as number), g, z + (dz as number), c as string)),
      ...[[-0.15, -0.09, '#FFE9D9', ROOF], [-0.03, -0.12, '#FFD9E6', '#E86A8E'], [0.1, -0.1, '#E7E0FF', '#9C8BE0']].flatMap(([dx, dz, wall, roof]) => house(x + (dx as number), z + (dz as number), 0.09, 0.07, 0.1, wall as string, roof as string, y)),
      ...[-0.06, 0.07].flatMap((dx, k) => boatParts(x + dx, g + 0.004, z + 0.13, 0.25 + k * 0.4)),
    ])
    // Railay: its cliffs (a big rock on the land) with a monkey on top.
    const [rx, rz] = SPOTS.railay
    spots.railay = toyAt(SPOTS.railay, [...T.karstParts(rx, y(rx, rz) - 0.02, rz, 0.5, 1), ...T.karstParts(rx + 0.09, y(rx, rz) - 0.02, rz - 0.05, 0.36, 2)], 1.5, 1)
    monkey.add(solid(merge([
      P.sphere(0.03, '#C99A6E', { at: [0, 0.03, 0] }, 10),
      P.sphere(0.024, '#C99A6E', { at: [0, 0.07, 0.01] }, 10),
      P.sphere(0.016, '#F2D3A8', { at: [0, 0.066, 0.028] }, 8),
      ...[-1, 1].map((s) => P.sphere(0.009, '#F2D3A8', { at: [s * 0.024, 0.074, 0.008] }, 6)),
      P.cyl(0.005, 0.004, 0.06, '#C99A6E', { at: [0, 0.03, -0.04], rot: [-1, 0, 0] }, 5),
    ]), bag, 1.2))
    monkey.position.set(rx, y(rx, rz) + 0.36, rz)
    root.add(monkey)
    // Chicken Island: a rock out at sea with a chicken's head on top (its beak and red comb), sand at its foot.
    const [kx, kz] = SPOTS.chicken
    spots.chicken = toyAt(SPOTS.chicken, [
      P.cyl(0.11, 0.13, 0.03, '#FFE7B0', { at: [kx, 0.005, kz], scale: [1.3, 1, 1] }, 16),
      ...T.karstParts(kx - 0.04, -0.02, kz, 0.42, 0),
    ], 1.5, 1)
    chicken.position.set(kx + 0.06, 0.04, kz + 0.01)
    chicken.add(solid(merge([
      P.cyl(0.035, 0.045, 0.22, ROCK, { at: [0, 0.11, 0] }, 9),
      P.sphere(0.055, ROCK, { at: [0.02, 0.24, 0], scale: [1.15, 1, 0.9] }, 10),
      P.cone(0.026, 0.07, PAL.butter, { at: [0.09, 0.235, 0], rot: [0, 0, -Math.PI / 2] }, 8),
      ...[-0.02, 0.01, 0.04].map((dx, k) => P.sphere(0.02 - k * 0.002, '#FF6F8E', { at: [dx, 0.3 - k * 0.006, 0] }, 7)),
      P.sphere(0.014, '#FF6F8E', { at: [0.07, 0.205, 0], scale: [0.7, 1.3, 0.7] }, 6),
      ...[-1, 1].flatMap((s) => [P.sphere(0.011, '#2B2330', { at: [0.05, 0.255, s * 0.04] }, 6), P.sphere(0.004, '#FFFFFF', { at: [0.054, 0.26, s * 0.047] }, 4)]),
      P.sphere(0.05, ROCK_DARK, { at: [-0.04, 0.05, 0.02], scale: [1, 0.6, 1] }, 8),
    ]), bag, 1.5))
    root.add(chicken)
    // Koh Phi Phi: two green humps on a sandy neck, palms on the beach between the bays.
    const [px, pz] = SPOTS.phiphi
    const phi: BufferGeometry[] = []
    for (const [k, [lon, lat, rx2]] of TOY_ISLANDS.entries()) {
      if (rx2 < 0.02) continue
      const [ix, iz] = ll(lon, lat)
      phi.push(...T.karstParts(ix, y(ix, iz) - 0.03, iz, k === 3 ? 0.42 : 0.5, k))
    }
    phi.push(...[0, 1, 2].flatMap((k) => T.palmParts(px + (k - 1) * 0.04, y(px, pz), pz + (k % 2) * 0.03, 0.3, k * 2.1)))
    spots.phiphi = toyAt(SPOTS.phiphi, phi, 1.5, 1)
    // Koh Lanta: the lighthouse on the south tip (white with pink bands, its lamp turns), beach huts on the west shore.
    const [lx, lz] = SPOTS.lighthouse
    const lg = y(lx, lz)
    spots.lighthouse = toyAt(SPOTS.lighthouse, [
      P.cyl(0.04, 0.05, 0.2, '#FFFFFF', { at: [lx, lg + 0.1, lz] }, 12),
      ...[0.05, 0.12].map((h) => P.cyl(0.046 - h * 0.05, 0.047 - h * 0.05, 0.028, PAL.hotpink, { at: [lx, lg + h, lz] }, 12)),
      P.cyl(0.05, 0.05, 0.012, '#FFF7F0', { at: [lx, lg + 0.205, lz] }, 12),
      P.cyl(0.03, 0.03, 0.04, '#FFF4B8', { at: [lx, lg + 0.23, lz] }, 10),
      P.cone(0.04, 0.04, PAL.hotpink, { at: [lx, lg + 0.27, lz] }, 10),
    ])
    beam.position.set(lx, lg + 0.23 * SPOT_SCALE, lz)
    beam.add(solid(merge([P.cone(0.05, 0.3, '#FFF4B8', { at: [0.17, 0, 0], rot: [0, 0, Math.PI / 2] }, 10)]), bag, 0))
    beam.visible = false
    root.add(beam)
    const [ax, az] = SPOTS.lanta
    spots.lanta = toyAt(SPOTS.lanta, [
      ...[[-0.05, 0, '#FFE9D9'], [0.04, 0.06, '#E4F4E8'], [-0.02, 0.12, '#FFD9E6']].flatMap(([dx, dz, c]) => hut(ax + (dx as number), az + (dz as number), c as string, y)),
      ...[[0.05, -0.06], [-0.07, 0.08]].flatMap(([dx, dz], k) => T.palmParts(ax + dx, y(ax + dx, az + dz), az + dz, 0.38, k * 2.4)),
      ...parasol(ax - 0.1, y(ax, az), az + 0.04, PAL.butter),
    ])
    // Khao Phanom Bencha: the big mountain north of town, a waterfall down its side into a pool.
    const [bx, bz] = SPOTS.bencha
    const bg = y(bx, bz)
    spots.bencha = toyAt(SPOTS.bencha, [
      ...T.mountainParts(bx, bg - 0.05, bz, 0.34, 0.62, 1),
      P.box(0.05, 0.3, 0.012, '#BFEAFF', { at: [bx + 0.02, bg + 0.08, bz + 0.27], rot: [-0.55, 0, 0] }),
      P.box(0.022, 0.3, 0.014, '#FFFFFF', { at: [bx + 0.02, bg + 0.08, bz + 0.272], rot: [-0.55, 0, 0] }),
      P.cyl(0.07, 0.07, 0.01, '#9FDDF6', { at: [bx + 0.02, bg + 0.005, bz + 0.37] }, 14),
    ], 1.5, 1)
    // Ko Tapu, the Nail Island: a thin rock spike standing straight up out of the sea, wider at the top.
    const [nx, nz] = SPOTS.nail
    spots.nail = toyAt(SPOTS.nail, [
      P.cyl(0.045, 0.028, 0.32, ROCK, { at: [nx, 0.14, nz] }, 9),
      P.cyl(0.03, 0.02, 0.18, ROCK_DARK, { at: [nx + 0.02, 0.08, nz + 0.01] }, 7),
      P.sphere(0.05, '#79CC8F', { at: [nx, 0.31, nz], scale: [1, 0.55, 1] }, 9),
      P.cyl(0.05, 0.06, 0.02, '#F2FBFF', { at: [nx, 0.004, nz] }, 12),
    ], 1.5, 1)
    // Ko Panyee: the stilt village on its platform in front of a big rock, and the floating football pitch.
    const [vx, vz] = SPOTS.panyee
    spots.panyee = toyAt(SPOTS.panyee, [
      ...T.karstParts(vx, -0.02, vz - 0.14, 0.6, 0),
      P.box(0.34, 0.012, 0.16, WOOD, { at: [vx, 0.03, vz] }),
      ...[-0.15, -0.05, 0.05, 0.15].flatMap((dx) => [-0.06, 0.06].map((dz) => P.cyl(0.005, 0.005, 0.04, WOOD_DARK, { at: [vx + dx, 0.012, vz + dz] }, 5))),
      ...[[-0.11, '#FFE9D9', ROOF], [-0.01, '#E7E0FF', '#9C8BE0'], [0.1, '#FFF4CF', '#F59E5B']].flatMap(([dx, wall, roof]) => [
        P.rbox(0.07, 0.05, 0.06, 0.008, wall as string, { at: [vx + (dx as number), 0.06, vz - 0.03] }),
        P.prism([[-0.045, 0], [0.045, 0], [0, 0.035]], 0.07, roof as string, { at: [vx + (dx as number), 0.085, vz - 0.03] }),
      ]),
      // The floating pitch: yellow with white lines and two little goals.
      P.box(0.16, 0.01, 0.1, PAL.butter, { at: [vx + 0.05, 0.02, vz + 0.12] }),
      P.box(0.004, 0.012, 0.1, '#FFFFFF', { at: [vx + 0.05, 0.022, vz + 0.12] }),
      ...[-1, 1].map((s) => P.box(0.006, 0.025, 0.04, '#FFFFFF', { at: [vx + 0.05 + s * 0.08, 0.035, vz + 0.12] })),
    ], 1.5, 1)
  }

  // ---- The family's longtail at the end of the jetty, the boats buzzing round, the ferry ----
  const boat = (s = 0.5) => {
    const b = T.longtail(bag)
    b.scale.setScalar(s)
    return b
  }
  const pierBoat = boat(0.72)
  {
    const [mx, mz] = PLACES.pier.model
    pierBoat.position.set(mx - 0.56, 0.004, mz + 0.1)
    pierBoat.rotation.y = Math.PI / 2
    root.add(pierBoat)
  }
  const boats = [boat(), boat()]
  root.add(...boats)
  const ferry = new Group()
  ferry.add(solid(merge([
    P.rbox(0.14, 0.06, 0.38, 0.03, '#FFFFFF', { at: [0, 0.02, 0] }),
    P.box(0.145, 0.016, 0.34, '#7FD8F4', { at: [0, 0.04, 0] }),
    P.rbox(0.11, 0.05, 0.22, 0.02, '#FFF7F0', { at: [0, 0.08, -0.02] }),
    P.box(0.112, 0.016, 0.2, '#BFE2FA', { at: [0, 0.085, -0.02] }),
    P.rbox(0.07, 0.035, 0.08, 0.012, '#FFFFFF', { at: [0, 0.12, 0.04] }),
    P.cyl(0.016, 0.018, 0.05, PAL.hotpink, { at: [0, 0.14, -0.08] }, 8),
  ]), bag, 1.5))
  ferry.scale.setScalar(1.6)
  root.add(ferry)

  // ---- The tiny plane at the end of the runway ----
  const plane = new Group()
  plane.add(solid(merge([
    P.capsule(0.022, 0.13, '#FFFFFF', { rot: [0, 0, Math.PI / 2] }),
    P.box(0.04, 0.006, 0.2, '#FFFFFF', { at: [0.01, 0, 0] }),
    P.box(0.025, 0.05, 0.006, PAL.hotpink, { at: [-0.075, 0.03, 0] }),
    P.box(0.02, 0.004, 0.07, '#FFFFFF', { at: [-0.07, 0.01, 0] }),
    P.box(0.13, 0.008, 0.002, PAL.hotpink, { at: [0, 0.006, 0.0225] }),
    P.box(0.13, 0.008, 0.002, PAL.hotpink, { at: [0, 0.006, -0.0225] }),
  ]), bag, 1.5))
  plane.scale.setScalar(1.8)
  root.add(plane)

  // ---- The stamps over the stops (shown once she's done each one), facing the camera ----
  const stamps = {} as Record<Stop, Group>
  for (const id of STOPS) {
    const g = new Group()
    const [x, z] = PLACES[STOP_PLACE[id]].model
    g.position.set(x, y(x, z) + STAMP_Y, z)
    const face = new Group()
    face.rotation.x = Math.PI / 2 - 0.85
    face.add(solid(merge([
      P.cyl(0.13, 0.13, 0.025, PAL.hotpink, {}, 24),
      P.torus(0.105, 0.008, '#FFFFFF', { at: [0, 0.014, 0], rot: [Math.PI / 2, 0, 0] }),
      ...[-1, 1].map((s) => P.sphere(0.035, '#FFFFFF', { at: [s * 0.026, 0.016, -0.018], scale: [1, 0.3, 1] }, 10)),
      P.cone(0.058, 0.07, '#FFFFFF', { at: [0, 0.016, 0.022], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.3] }, 10),
    ]), bag, 2))
    g.add(face)
    g.visible = false
    root.add(g)
    stamps[id] = g
  }

  // ---- The floating friends over the places still to do ----
  const markers = {} as Record<Stop, Group>
  for (const id of STOPS) {
    const g = new Group()
    const [x, z] = PLACES[STOP_PLACE[id]].model
    g.position.set(x, y(x, z) + STAMP_Y, z)
    if (id === 'chang') {
      const e = T.elephant(bag, 1)
      e.root.scale.setScalar(0.42)
      e.root.position.y = -0.1
      g.add(e.root)
      g.userData.toy = e
    } else {
      const b = T.longtail(bag)
      b.scale.setScalar(0.62)
      b.rotation.y = Math.PI / 2
      g.add(b)
    }
    // A soft pink disc under each, like a pin's head.
    g.add(solid(merge([P.cyl(0.11, 0.11, 0.012, PAL.pink, { at: [0, -0.12, 0] }, 20)]), bag, 1.5))
    root.add(g)
    markers[id] = g
  }

  // ---- Clouds on the hills ----
  const clouds = CLOUDS.map(([lon, lat, cy], i) => {
    const g = new Group()
    const [x, z] = ll(lon, lat)
    g.position.set(x, cy, z)
    g.add(solid(merge([
      P.sphere(0.16, '#FFFFFF', { scale: [1.3, 0.7, 1] }),
      P.sphere(0.12, '#FFFFFF', { at: [0.16, -0.02, 0.03], scale: [1.2, 0.75, 1] }),
      P.sphere(0.11, '#F4F1FA', { at: [-0.17, -0.03, -0.02], scale: [1.2, 0.75, 1] }),
      P.sphere(0.1, '#FFFFFF', { at: [0.04, 0.07, -0.05 + i * 0.01] }),
    ]), bag, 2))
    root.add(g)
    return g
  })

  // ---- Out at sea: dolphins, the turtle; over the bay, the sea eagle ----
  const dolphins = [T.dolphin(bag), T.dolphin(bag)]
  for (const d of dolphins) {
    d.scale.setScalar(0.7)
    root.add(d)
  }
  const turtle = T.turtle(bag)
  turtle.root.scale.setScalar(0.75)
  root.add(turtle.root)
  // The whale shark: a big blue-grey body with white spots, a wide mouth, its tail swinging (nose along +z).
  const whale = { root: new Group(), tail: new Group() }
  {
    const c = '#8E9ED8'
    const spots: BufferGeometry[] = []
    for (let i = 0; i < 16; i++) {
      const a = i * 2.4
      const along = -0.12 + (i / 16) * 0.3
      spots.push(P.sphere(0.009, '#FFFFFF', { at: [Math.cos(a) * 0.045, 0.03 + Math.abs(Math.sin(a)) * 0.012, along] }, 5))
    }
    whale.root.add(solid(merge([
      P.sphere(0.07, c, { at: [0, 0, 0.02], scale: [0.85, 0.55, 2.4] }, 14),
      P.sphere(0.055, '#F2F4FF', { at: [0, -0.018, 0.04], scale: [0.8, 0.35, 2.1] }, 12),
      P.box(0.06, 0.006, 0.012, '#5E5468', { at: [0, -0.006, 0.18] }),
      ...[-1, 1].flatMap((s) => [P.sphere(0.008, '#2B2330', { at: [s * 0.045, 0.012, 0.15] }, 6), P.prism([[0, 0], [0.07, 0], [0.02, -0.02]], 0.006, c, { at: [s * 0.05, -0.01, 0.06], rot: [0, s > 0 ? 0 : Math.PI, 0] })]),
      P.prism([[-0.03, 0], [0.04, 0], [-0.02, 0.06]], 0.01, c, { at: [0, 0.035, -0.02], rot: [0, -Math.PI / 2, 0] }),
      ...spots,
    ]), bag, 1.5))
    whale.tail.position.set(0, 0, -0.14)
    whale.tail.add(solid(merge([P.prism([[0, 0.07], [0, -0.04], [-0.07, 0.1]], 0.01, c, { rot: [0, Math.PI / 2, 0] })]), bag, 1.5))
    whale.root.add(whale.tail)
    whale.root.scale.setScalar(1.4)
    root.add(whale.root)
  }
  // The yacht: a white hull, a tall mast and a pink sail (sails along +z).
  const yacht = new Group()
  yacht.add(solid(merge([
    P.rbox(0.07, 0.035, 0.2, 0.015, '#FFFFFF', { at: [0, 0.012, 0] }),
    P.box(0.072, 0.008, 0.18, PAL.mint, { at: [0, 0.026, 0] }),
    P.cyl(0.003, 0.003, 0.24, '#EDEAF2', { at: [0, 0.14, 0.02] }, 5),
    P.prism([[0, 0], [0.15, 0], [0, 0.2]], 0.004, PAL.pink, { at: [0, 0.035, 0.02], rot: [0, Math.PI / 2, 0] }),
    P.prism([[0, 0], [0.06, 0], [0, 0.16]], 0.004, '#FFFFFF', { at: [0, 0.035, 0.035], rot: [0, -Math.PI / 2, 0] }),
    P.prism([[0, 0], [0.04, 0.012], [0, 0.024]], 0.003, PAL.butter, { at: [0, 0.255, 0.02] }),
  ]), bag, 1.5))
  yacht.scale.setScalar(1.3)
  root.add(yacht)
  const eagle = { root: new Group(), wingL: new Group(), wingR: new Group() }
  eagle.root.scale.setScalar(1.8)
  eagle.root.add(solid(merge([
    P.sphere(0.03, '#B98A66', { scale: [0.8, 0.7, 1.6] }, 10),
    P.sphere(0.022, '#FFFFFF', { at: [0, 0.01, 0.045] }, 8),
    P.cone(0.008, 0.02, PAL.butter, { at: [0, 0.006, 0.07], rot: [Math.PI / 2, 0, 0] }, 6),
    P.prism([[-0.02, 0], [0.02, 0], [0, -0.04]], 0.006, '#FFFFFF', { at: [0, 0, -0.05], rot: [Math.PI / 2, 0, 0] }),
  ]), bag, 1.2))
  for (const [s, w] of [[-1, eagle.wingL], [1, eagle.wingR]] as const) {
    w.add(solid(merge([P.box(0.09, 0.006, 0.04, '#B98A66', { at: [s * 0.045, 0, 0] }), P.box(0.03, 0.007, 0.035, '#8A6448', { at: [s * 0.08, 0, -0.004] })]), bag, 1.2))
    eagle.root.add(w)
  }
  root.add(eagle.root)

  // ---- The little songthaew ----
  const car = buildSongthaew(bag)
  car.root.scale.setScalar(CAR_SCALE)
  root.add(car.root)

  return { root, places, spots, stamps, markers, plane, clouds, car, boats, pierBoat, ferry, dolphins, turtle, whale, yacht, eagle, elephants, crab, monkey, chicken, beam, sea, karsts }
}

type Ground = (x: number, z: number) => number

/** A little toy house: rounded walls, a pitched roof with an overhang, a door and two windows. */
function house(x: number, z: number, w: number, d: number, h: number, wall: string, roof: string, y: Ground, yaw = 0): BufferGeometry[] {
  const at = (px: number, py: number, pz: number): [number, number, number] => [x + px * Math.cos(yaw) + pz * Math.sin(yaw), py, z - px * Math.sin(yaw) + pz * Math.cos(yaw)]
  const g = y(x, z)
  const rot: [number, number, number] = [0, yaw, 0]
  return [
    P.rbox(w, h, d, Math.min(w, d) * 0.12, wall, { at: at(0, g + h / 2, 0), rot }),
    P.prism([[-w / 2 - 0.02, 0], [w / 2 + 0.02, 0], [0, h * 0.62]], d + 0.04, roof, { at: at(0, g + h - 0.004, 0), rot }),
    P.rbox(w * 0.24, h * 0.5, 0.012, 0.005, '#B07A58', { at: at(0, g + h * 0.25, d / 2 + 0.003), rot }),
    ...[-1, 1].map((k) => P.rbox(w * 0.17, h * 0.22, 0.012, 0.004, '#DDF3FF', { at: at(k * w * 0.31, g + h * 0.58, d / 2 + 0.003), rot })),
  ]
}

/** A beach hut on short stilts with a thatched roof. */
function hut(x: number, z: number, wall: string, y: Ground): BufferGeometry[] {
  const g = y(x, z)
  return [
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => P.cyl(0.004, 0.004, 0.03, WOOD_DARK, { at: [x + a * 0.025, g + 0.015, z + b * 0.02] }, 5)),
    P.rbox(0.06, 0.04, 0.05, 0.006, wall, { at: [x, g + 0.05, z] }),
    P.prism([[-0.045, 0], [0.045, 0], [0, 0.04]], 0.065, THATCH, { at: [x, g + 0.068, z] }),
  ]
}

/** A beach umbrella. */
function parasol(x: number, g: number, z: number, color: string): BufferGeometry[] {
  return [
    P.cyl(0.003, 0.003, 0.07, '#FFF7F0', { at: [x, g + 0.035, z] }, 5),
    P.cone(0.045, 0.022, color, { at: [x, g + 0.075, z] }, 8),
    P.box(0.04, 0.004, 0.022, '#A8DCFF', { at: [x + 0.02, g + 0.003, z + 0.025], rot: [0, 0.4, 0] }),
  ]
}

/** A longtail pulled up on the sand (pointing out to sea). */
function boatParts(x: number, g: number, z: number, yaw: number): BufferGeometry[] {
  const rot: [number, number, number] = [0, yaw, 0]
  const along = (d: number, up: number): [number, number, number] => [x + Math.sin(yaw) * d, g + up, z + Math.cos(yaw) * d]
  return [
    P.rbox(0.045, 0.022, 0.17, 0.01, '#E6A375', { at: along(0, 0.011), rot }),
    P.box(0.046, 0.006, 0.15, PAL.hotpink, { at: along(0, 0.02), rot }),
    P.box(0.014, 0.014, 0.06, '#E6A375', { at: along(0.095, 0.03), rot: [-0.75, yaw, 0] }),
    P.sphere(0.009, PAL.pink, { at: along(0.115, 0.056) }, 6),
  ]
}

/** The airport: a pastel terminal with a pink roof and Thai-style swept gables, its control tower and windsock. */
function airportParts([ax, az]: XZ, y: Ground): BufferGeometry[] {
  const ag = y(ax, az)
  return [
    P.rbox(0.3, 0.08, 0.14, 0.022, '#FFF7F0', { at: [ax, ag + 0.04, az] }),
    P.rbox(0.26, 0.032, 0.01, 0.006, '#BFE2FA', { at: [ax, ag + 0.05, az + 0.071] }),
    P.prism([[-0.18, 0], [0.18, 0], [0, 0.07]], 0.18, '#FF9DC0', { at: [ax, ag + 0.08, az] }),
    ...[-1, 1].map((s) => P.cone(0.012, 0.05, PAL.gold, { at: [ax + s * 0.18, ag + 0.1, az], rot: [0, 0, -s * 0.9] }, 6)),
    P.rbox(0.05, 0.045, 0.012, 0.006, '#DDF3FF', { at: [ax - 0.09, ag + 0.023, az + 0.072] }),
    P.cyl(0.02, 0.026, 0.2, '#FFF7F0', { at: [ax + 0.2, ag + 0.1, az - 0.02] }, 12),
    P.cyl(0.042, 0.036, 0.04, '#BFE2FA', { at: [ax + 0.2, ag + 0.22, az - 0.02] }, 12),
    P.cone(0.048, 0.036, PAL.hotpink, { at: [ax + 0.2, ag + 0.258, az - 0.02] }, 12),
    P.cyl(0.004, 0.004, 0.12, '#EDEAF2', { at: [ax - 0.2, ag + 0.06, az + 0.04] }, 5),
    P.cone(0.015, 0.055, '#FF8A4D', { at: [ax - 0.172, ag + 0.11, az + 0.04], rot: [0, 0, Math.PI / 2 + 0.25] }, 8),
  ]
}

/** The runway, flat on the board, with its stripes and lights. */
function runwayParts(y: Ground): BufferGeometry[] {
  const rw = RUNWAY
  const along = (k: number, off = 0, lift = 0): [number, number, number] => {
    const px = rw.at[0] + Math.cos(rw.yaw) * k * rw.len + Math.sin(rw.yaw) * off
    const pz = rw.at[1] - Math.sin(rw.yaw) * k * rw.len + Math.cos(rw.yaw) * off
    return [px, y(px, pz) + lift, pz]
  }
  return [
    P.rbox(rw.len, 0.014, rw.w, 0.006, '#7A7390', { at: along(0, 0, 0.007), rot: [0, rw.yaw, 0] }),
    ...[-0.4, -0.2, 0, 0.2, 0.4].map((k) => P.box(0.08, 0.004, 0.014, '#FFFFFF', { at: along(k, 0, 0.016), rot: [0, rw.yaw, 0] })),
    ...[-0.46, -0.3, -0.15, 0, 0.15, 0.3, 0.46].flatMap((k) => [-1, 1].map((sd) => P.sphere(0.008, k === -0.46 || k === 0.46 ? PAL.hotpink : PAL.butter, { at: along(k, sd * (rw.w / 2 - 0.01), 0.017) }, 6))),
  ]
}

/** Krabi Town: pastel shophouses in rows along the river, a market umbrella or two, the Thai flag on a pole. */
function townParts([tx, tz]: XZ, y: Ground): BufferGeometry[] {
  const tg = y(tx, tz)
  const row = (x0: number, z: number, cols: [string, string][], yaw = 0) =>
    cols.flatMap(([wall, roof], k) => house(tx + x0 + k * 0.06, tz + z, 0.055, 0.07, 0.09 + (k % 2) * 0.025, wall, roof, y, yaw))
  return [
    ...row(-0.16, -0.06, [['#FFE9D9', ROOF], ['#FFD9E6', '#E86A8E'], ['#FFF4CF', '#F59E5B']]),
    ...row(0.04, -0.09, [['#E7E0FF', '#9C8BE0'], ['#E4F4E8', '#5FBF8F'], ['#FFE9D9', ROOF]]),
    ...[[-0.06, 0.06, PAL.pink], [0.06, 0.07, PAL.mint]].flatMap(([dx, dz, c]) => [
      P.rbox(0.045, 0.022, 0.032, 0.006, '#FFF7F0', { at: [tx + (dx as number), tg + 0.011, tz + (dz as number)] }),
      P.cyl(0.003, 0.003, 0.06, '#EDEAF2', { at: [tx + (dx as number), tg + 0.03, tz + (dz as number)] }),
      P.cone(0.045, 0.026, c as string, { at: [tx + (dx as number), tg + 0.07, tz + (dz as number)] }, 10),
    ]),
    // The flag of Thailand on its pole.
    P.cyl(0.004, 0.004, 0.22, '#EDEAF2', { at: [tx + 0.17, tg + 0.11, tz + 0.04] }, 5),
    ...([['#E8404E', 0], ['#FFFFFF', 1], ['#2D3A8C', 2], ['#2D3A8C', 3], ['#FFFFFF', 4], ['#E8404E', 5]] as const).map(([c, k]) => P.box(0.08, 0.009, 0.004, c, { at: [tx + 0.212, tg + 0.21 - k * 0.009, tz + 0.04] })),
  ]
}

/** Baan Chang: a thatched cafe on stilts, its deck, a bamboo fence round the elephants' yard, a water trough, bananas. */
function changParts([cx, cz]: XZ, y: Ground): BufferGeometry[] {
  const g = y(cx, cz)
  const fence: BufferGeometry[] = []
  for (let a = -0.4; a < Math.PI + 0.4; a += 0.32) {
    const fx = cx + 0.12 + Math.cos(a) * 0.17
    const fz = cz + 0.02 + Math.sin(a) * 0.12
    fence.push(P.cyl(0.005, 0.006, 0.05, '#D9C27A', { at: [fx, g + 0.025, fz] }, 5))
  }
  return [
    // The cafe: posts, the floor, walls open at the front, the big thatched roof.
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => P.cyl(0.006, 0.007, 0.06, WOOD_DARK, { at: [cx - 0.1 + a * 0.07, g + 0.03, cz - 0.04 + b * 0.05] }, 6)),
    P.rbox(0.17, 0.014, 0.12, 0.005, WOOD, { at: [cx - 0.1, g + 0.06, cz - 0.04] }),
    P.rbox(0.15, 0.06, 0.012, 0.004, '#F2D3A8', { at: [cx - 0.1, g + 0.095, cz - 0.095] }),
    P.prism([[-0.12, 0], [0.12, 0], [0, 0.09]], 0.17, THATCH, { at: [cx - 0.1, g + 0.125, cz - 0.04] }),
    P.box(0.012, 0.012, 0.18, '#C9A46C', { at: [cx - 0.1, g + 0.215, cz - 0.04] }),
    // A pink sign over the steps, and a table with a pink cup on the deck.
    P.rbox(0.07, 0.025, 0.006, 0.004, PAL.hotpink, { at: [cx - 0.1, g + 0.105, cz + 0.02] }),
    P.cyl(0.012, 0.012, 0.025, '#FFF7F0', { at: [cx - 0.13, g + 0.08, cz - 0.03] }, 8),
    P.cyl(0.006, 0.005, 0.014, PAL.pink, { at: [cx - 0.13, g + 0.1, cz - 0.03] }, 8),
    // The yard: sand, the bamboo fence, the trough, a bunch of bananas.
    P.cyl(0.17, 0.17, 0.006, '#F6E2B4', { at: [cx + 0.12, g + 0.003, cz + 0.02], scale: [1, 1, 0.72] }, 20),
    ...fence,
    P.rbox(0.07, 0.02, 0.03, 0.006, '#9C8BE0', { at: [cx + 0.2, g + 0.01, cz - 0.06] }),
    P.box(0.06, 0.004, 0.022, '#9FDDF6', { at: [cx + 0.2, g + 0.021, cz - 0.06] }),
    ...[0, 1, 2].map((k) => P.capsule(0.006, 0.025, PAL.butter, { at: [cx + 0.03 + k * 0.012, g + 0.012, cz + 0.11], rot: [0, 0, 1.2 + k * 0.15] })),
  ]
}

/** The pier: a ticket hut with a pink roof on the shore, and a wooden jetty on posts out into the bay (west). */
function pierParts([px, pz]: XZ, y: Ground): BufferGeometry[] {
  const g = y(px + 0.05, pz)
  const deck = 0.03
  return [
    ...house(px + 0.07, pz - 0.05, 0.09, 0.07, 0.07, '#FFF7F0', PAL.hotpink, y),
    P.rbox(0.28, 0.012, 0.055, 0.004, WOOD, { at: [px - 0.12, deck, pz + 0.03] }),
    ...[-0.24, -0.16, -0.08, 0].flatMap((dx) => [-1, 1].map((s) => P.cyl(0.005, 0.005, 0.06, WOOD_DARK, { at: [px + dx, deck - 0.02, pz + 0.03 + s * 0.026] }, 5))),
    ...[-0.24, -0.12, 0].map((dx) => P.cyl(0.004, 0.004, 0.03, WOOD_DARK, { at: [px + dx, deck + 0.02, pz + 0.058] }, 5)),
    P.box(0.26, 0.005, 0.005, WOOD_DARK, { at: [px - 0.12, deck + 0.033, pz + 0.058] }),
    // A life ring on the hut, and the ribbons' basket.
    P.torus(0.014, 0.005, '#FF6F8E', { at: [px + 0.07, g + 0.045, pz - 0.013] }),
    P.cyl(0.018, 0.014, 0.02, '#D9B98A', { at: [px + 0.0, g + 0.01, pz + 0.04] }, 10),
    ...[PAL.pink, PAL.butter, PAL.mint].map((c, k) => P.sphere(0.007, c, { at: [px - 0.007 + k * 0.007, g + 0.023, pz + 0.04] }, 6)),
  ]
}

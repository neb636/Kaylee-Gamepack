// The Krabi map's shapes (layout.ts says where): a toy diorama of Krabi and Phang Nga Bay floating in the sky, in the
// same toy tray as the Thailand map. What makes it Krabi: a calm emerald sea with a few groups of limestone towers in
// it (soft green humps of jungle over cream cliffs, the sea's notch cut round the foot), a few crags standing up out of
// the jungle on the land, coconut palms along the beaches and wide pale sand (ground.ts paints it). It's kept laid back on purpose (2026-11-14: the first Krabi board was too busy): open water, a few
// big shapes, a handful of toys. No roads, no fields, no pointed mountains: Khao Phanom Bencha and the other hills are
// round domes of rainforest.
//
// The places stand up like chunky toys (layout.ts PLACES `scale`): the airport (a pink-roofed terminal, its tower and
// a little runway), Krabi Town (a row of pastel shophouses by the river between its twin rocks, the Thai flag), Baan
// Chang (a thatched cafe in a bamboo yard, two elephants) and the pier (a wooden jetty out into the bay, a ticket hut,
// the family's longtail with its ribbons at the end).
//
// The pins (layout.ts PINS): over each place she can go to floats a pink pin, a toy of the place on its head (a baby
// elephant with bananas, a longtail under a rock tower, the plane home on a cloud).
//
// To poke: Ao Nang's beach (two umbrellas and the sailfish statue), Railay's cliffs with a monkey on top, Chicken
// Island (a rock with a chicken's head) and its sandbar, Koh Phi Phi, Koh Lanta's lighthouse and Ko Tapu (the Nail
// Island). And what moves, slowly: a tiny plane, a longtail among the rocks, dolphins, a yacht, clouds.
import { Group, type BufferGeometry } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { trayParts } from '../../../trip/sky'
import * as T from '../../hub/map/toys'
import type { Sea } from '../../hub/map/terrain'
import { buildField, buildGround, buildSea } from './ground'
import {
  BOARD,
  BOAT_LOOPS,
  CLOUDS,
  CRAGS,
  DEG_M,
  HILLS,
  KARSTS,
  ll,
  PIN_IDS,
  PINS,
  PLACES,
  RIVERS,
  RUNWAY,
  SANDBAR,
  SPOTS,
  STAMP_Y,
  STOP_PLACE,
  STOPS,
  TOY_ISLANDS,
  TWINS,
  type PinId,
  type PlaceId,
  type SpotId,
  type Stop,
  type XZ,
} from './layout'

const WOOD = '#C99A6E'
const WOOD_DARK = '#9C7250'
const ROOF = '#FF8A4D'
const THATCH = '#E9C98F'
/** Krabi's limestone: warm cream, a shaded side, the rust streaks the rain leaves, the dark notch the sea cuts. */
const ROCK = '#F6EBDD'
const ROCK_DARK = '#E6D2C6'
const RUST = '#F3B58E'
const NOTCH = '#C9B4C4'
/** Rainforest greens, deep to bright. */
const JUNGLE = ['#52B881', '#67C78F', '#84D79C']
const SAND = '#FFF0C4'
/** The spots (the places the trip doesn't go to yet) stand this much bigger than the board's scale, like toys. */
const SPOT_SCALE = 1.5
/** The rock towers' size on this board (layout.ts sizes them about 1). */
const KARST_S = 0.56
/** The sea's top (the land stands up from it). */
const LEVEL_SEA = 0

/** A pin floating over a place: its point hangs just over the place, a toy of the place stands on its head. */
export interface Pin {
  root: Group
  /** The toy on its head (it turns when the pin is poked). */
  mini: Group
  /** The baby elephant's ears and trunk (Baan Chang's pin). */
  elephant?: T.Elephant
  /** What goes round and round on it (the plane over its cloud). */
  spin?: Group
}

export interface Diorama {
  root: Group
  places: Record<PlaceId, Group>
  spots: Record<SpotId, Group>
  stamps: Record<Stop, Group>
  /** The pins (layout.ts PINS): over a place still to do, and the way home (a stop's stamp takes its pin's place once
   *  it's done). */
  pins: Record<PinId, Pin>
  plane: Group
  clouds: Group[]
  /** The longtail buzzing round (BOAT_LOOPS), the family's longtail at the pier. */
  boats: Group[]
  pierBoat: Group
  dolphins: Group[]
  yacht: Group
  elephants: T.Elephant[]
  monkey: Group
  /** Ao Nang's sailfish statue (it leaps when the beach is poked). */
  sailfish: Group
  chicken: Group
  beam: Group
  sea: Sea
  /** Where things stand (x, z) that a tap on the board near them pokes, beyond the places and spots. */
  karsts: [number, number, number][]
}

export function buildDiorama(bag: Bag): Diorama {
  const f = buildField()
  const y = (x: number, z: number) => Math.max(0, f.height(x, z))
  const root = new Group()
  const W = BOARD.x1 - BOARD.x0
  const D = BOARD.z1 - BOARD.z0
  // ---- The toy tray round the board (the Thailand map's), the sea in it ----
  root.add(solid(merge(trayParts(W, D, 0.07, 0.2, 0.55)), bag, 2))
  const sea = buildSea(bag)
  root.add(sea.mesh)

  /** Rock towers go in two piles: their shapes (outlined) and their streaks and vines (painted on, no outline). */
  const rock = { lined: [] as BufferGeometry[], plain: [] as BufferGeometry[] }
  const addTower = (x: number, gy: number, z: number, s: number, k: number) => {
    const t = tower(x, gy, z, s, k)
    rock.lined.push(...t.lined)
    rock.plain.push(...t.plain)
  }

  // ---- The limestone towers in the sea (only the ones out at sea), each with a little one or two beside it ----
  const karsts: [number, number, number][] = []
  KARSTS.forEach(([lon, lat, s], i) => {
    const [x, z] = ll(lon, lat)
    if (f.land(x, z) > -0.04) return
    karsts.push([x, z, s])
    addTower(x, LEVEL_SEA - 0.02, z, s * KARST_S, i)
    if (i % 2 === 0) {
      const a = i * 1.9
      const [bx, bz] = [x + Math.cos(a) * 0.15 * s, z + Math.sin(a) * 0.11 * s]
      if (f.land(bx, bz) < -0.05) addTower(bx, LEVEL_SEA - 0.02, bz, s * KARST_S * 0.55, i + 2)
    }
  })
  // Krabi Town's twin rocks at the river mouth.
  for (const [k, [lon, lat]] of TWINS.entries()) {
    const [x, z] = ll(lon, lat)
    addTower(x, y(x, z) - 0.02, z, 0.3 + k * 0.04, k + 1)
  }

  // ---- On the land: limestone crags, jungle hills, palms and rainforest, away from the places and the rivers ----
  const placeSpots: [number, number, number][] = [
    ...(Object.keys(PLACES) as PlaceId[]).map((id) => [...PLACES[id].at, 0.4] as [number, number, number]),
    ...(Object.keys(SPOTS) as SpotId[]).map((id) => [...SPOTS[id], 0.3] as [number, number, number]),
    [RUNWAY.at[0], RUNWAY.at[1], 0.42],
    ...TWINS.map(([lon, lat]) => [...ll(lon, lat), 0.22] as [number, number, number]),
  ]
  const away = (x: number, z: number, pad = 0) => placeSpots.every(([px, pz, r]) => Math.hypot(px - x, pz - z) > r + pad)
  const shadows: [number, number, number][] = []
  /** What stands where already (nothing is planted inside): [x, z, radius]. */
  const taken: [number, number, number][] = []
  CRAGS.forEach(([lon, lat, s], i) => {
    const [x, z] = ll(lon, lat)
    if (f.land(x, z) < 0.06 || !away(x, z, 0.08)) return
    const size = s * 0.52
    addTower(x, y(x, z) - 0.03, z, size, i + 1)
    if (s >= 1.2) {
      const a = i * 2.3 + 0.6
      addTower(x + Math.cos(a) * 0.17 * s, y(x, z) - 0.03, z + Math.sin(a) * 0.12 * s, size * 0.62, i + 3)
    }
    taken.push([x, z, 0.2 * s])
    shadows.push([x, z, 0.24 * s])
  })
  root.add(solidMix(rock.lined, rock.plain, bag, 1.5))
  const hills: BufferGeometry[] = []
  HILLS.forEach(([lon, lat, r, h], i) => {
    if (h < 0.2) return
    const [x, z] = ll(lon, lat)
    const rad = r * DEG_M * 0.5
    if (!away(x, z, 0.05) || taken.some(([px, pz, pr]) => Math.hypot(px - x, pz - z) < pr + rad * 0.6)) return
    taken.push([x, z, rad * 0.95])
    shadows.push([x, z, rad * 1.2])
    hills.push(...jungleHill(x, y(x, z) - 0.04, z, rad, h * 0.7 + 0.14, i))
  })
  const trees: BufferGeometry[] = []
  const planted: [number, number][] = []
  let seed = 23
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  // Few and spaced out, so the land reads as a few calm shapes: palms in loose twos and threes along the beaches,
  // big soft clumps of rainforest up the hills, and the painted greens (ground.ts) everywhere between.
  for (let i = 0; i < 6000 && planted.length < 110; i++) {
    const x = BOARD.x0 + 0.1 + rnd() * (W - 0.2)
    const z = BOARD.z0 + 0.1 + rnd() * (D - 0.2)
    const d = f.land(x, z)
    if (d < 0.085 || !away(x, z) || taken.some(([px, pz, r]) => Math.hypot(px - x, pz - z) < r)) continue
    if (RIVER_PTS.some(([rx, rz]) => Math.hypot(rx - x, rz - z) < 0.09)) continue
    const hill = f.hill(x, z)
    const shore = d < 0.2
    const jungle = hill > 0.06
    if (!shore && !jungle) continue
    // Palms come in little groups along the shore (a stretch with, a stretch without).
    if (shore && !jungle && Math.sin(x * 4.3 + z * 1.9) < 0.1) continue
    if (planted.some(([sx, sz]) => Math.hypot(sx - x, sz - z) < (jungle ? 0.16 : 0.11))) continue
    planted.push([x, z])
    const s = 0.42 + rnd() * 0.22
    if (jungle) trees.push(...clump(x, y(x, z), z, s * 1.6, i))
    else trees.push(...palm(x, y(x, z), z, s * 0.62, rnd() * 6.28))
    shadows.push([x, z, 0.1 * s + 0.02])
  }
  root.add(solid(merge(hills), bag, 1.5), solid(merge(trees), bag, 1.5))
  for (const [x, z, r] of placeSpots) shadows.push([x, z, Math.min(0.3, r * 0.8)])
  root.add(buildGround(bag, { shadows }))

  // ---- Chicken Island's sandbar: at low tide you can walk between the islands ----
  {
    const bar: BufferGeometry[] = []
    for (let i = 0; i < SANDBAR.length - 1; i++) {
      const [ax, az] = SANDBAR[i]
      const [bx, bz] = SANDBAR[i + 1]
      const len = Math.hypot(bx - ax, bz - az)
      bar.push(P.rbox(0.075, 0.016, len + 0.07, 0.007, SAND, { at: [(ax + bx) / 2, 0.004, (az + bz) / 2], rot: [0, Math.atan2(bx - ax, bz - az), 0] }))
    }
    const [mx, mz] = SANDBAR[2]
    const [ex, ez] = SANDBAR[3]
    bar.push(P.cyl(0.07, 0.08, 0.02, SAND, { at: [mx, 0.005, mz] }, 12), ...T.palmParts(mx, 0.012, mz, 0.3, 1.2, false), P.cyl(0.08, 0.09, 0.02, SAND, { at: [ex, 0.005, ez] }, 12))
    root.add(solid(merge(bar), bag, 1.5))
    const t = tower(ex, -0.02, ez - 0.02, 0.3, 2)
    root.add(solidMix(t.lined, t.plain, bag, 1.5))
  }

  // ---- The places ----
  /** A group standing at (x, z), built from parts in board coordinates, scaled up like a toy about its foot. */
  const toyAt = (at: XZ, parts: BufferGeometry[], px = 2, scale = SPOT_SCALE, plain: BufferGeometry[] = []) => {
    const g = new Group()
    const [x, z] = at
    const gy = y(x, z)
    g.position.set(x, gy, z)
    g.scale.setScalar(scale)
    for (const p of [...parts, ...plain]) p.translate(-x, -gy, -z)
    g.add(plain.length ? solidMix(parts, plain, bag, px) : solid(merge(parts), bag, px))
    root.add(g)
    return g
  }
  /** Rock towers as a toy: [dx, dz, size, look] each, from (x, z) on ground `gy`. */
  const towers = (x: number, gy: number, z: number, list: [number, number, number, number][]) => {
    const all = list.map(([dx, dz, s, k]) => tower(x + dx, gy, z + dz, s, k))
    return { lined: all.flatMap((t) => t.lined), plain: all.flatMap((t) => t.plain) }
  }
  const places = {
    airport: toyAt(PLACES.airport.at, airportParts(PLACES.airport.at, y), 2, PLACES.airport.scale),
    town: toyAt(PLACES.town.at, townParts(PLACES.town.at, y), 1.5, PLACES.town.scale),
    chang: toyAt(PLACES.chang.at, changParts(PLACES.chang.at, y), 2, PLACES.chang.scale),
    pier: toyAt(PLACES.pier.at, pierParts(PLACES.pier.at, y), 2, PLACES.pier.scale),
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
  // ---- Toys to poke ----
  const monkey = new Group()
  const sailfish = new Group()
  const chicken = new Group()
  const beam = new Group()
  const spots = {} as Record<SpotId, Group>
  {
    // Ao Nang's beach: two umbrellas, a longtail pulled up on the sand, and the sailfish statue.
    const [x, z] = SPOTS.aonang
    const g = y(x, z)
    spots.aonang = toyAt(SPOTS.aonang, [
      ...[[-0.08, 0.04, '#FF8FB8'], [0.05, 0.07, PAL.butter]].flatMap(([dx, dz, c]) => parasol(x + (dx as number), g, z + (dz as number), c as string)),
      ...boatParts(x - 0.01, g + 0.004, z + 0.14, 0.4),
      P.cyl(0.03, 0.036, 0.03, '#FFF7F0', { at: [x + 0.2, g + 0.015, z + 0.02] }, 10),
    ])
    // The sailfish leaps over its plinth (nose up, its big sail along its back).
    sailfish.position.set(0.2, 0.03, 0.02)
    sailfish.add(solid(merge([
      P.sphere(0.022, '#7FA8F0', { at: [0, 0.05, 0], scale: [1, 2.6, 0.8] }, 10),
      P.sphere(0.014, '#F2F4FF', { at: [0.008, 0.045, 0], scale: [1, 2.4, 0.7] }, 8),
      P.cone(0.006, 0.055, '#5E7FD0', { at: [0, 0.125, 0] }, 6),
      P.prism([[0, -0.04], [0, 0.04], [-0.05, 0.02], [-0.045, -0.03]], 0.005, '#9C8BE0', { at: [-0.014, 0.05, 0] }),
      P.prism([[-0.03, 0], [0.03, 0], [0, 0.03]], 0.005, '#5E7FD0', { at: [0, -0.012, 0], rot: [0, 0, Math.PI] }),
      P.sphere(0.004, '#2B2330', { at: [0.012, 0.085, 0.012] }, 5),
    ]), bag, 1.2))
    sailfish.rotation.z = -0.35
    spots.aonang.add(sailfish)
    // Railay: its cliffs (a big rock on the land) with a monkey on top.
    const [rx, rz] = SPOTS.railay
    const railay = towers(rx, y(rx, rz) - 0.02, rz, [[0, 0, 0.5, 1], [0.1, -0.05, 0.4, 2], [-0.1, 0.03, 0.3, 0]])
    spots.railay = toyAt(SPOTS.railay, railay.lined, 1.5, 1, railay.plain)
    monkey.add(solid(merge([
      P.sphere(0.03, '#C99A6E', { at: [0, 0.03, 0] }, 10),
      P.sphere(0.024, '#C99A6E', { at: [0, 0.07, 0.01] }, 10),
      P.sphere(0.016, '#F2D3A8', { at: [0, 0.066, 0.028] }, 8),
      ...[-1, 1].map((s) => P.sphere(0.009, '#F2D3A8', { at: [s * 0.024, 0.074, 0.008] }, 6)),
      P.cyl(0.005, 0.004, 0.06, '#C99A6E', { at: [0, 0.03, -0.04], rot: [-1, 0, 0] }, 5),
    ]), bag, 1.2))
    monkey.position.set(rx, y(rx, rz) + MONKEY_Y, rz)
    root.add(monkey)
    // Chicken Island: a rock out at sea with a chicken's head on top (its beak and red comb), sand at its foot.
    const [kx, kz] = SPOTS.chicken
    const hen = towers(kx, -0.02, kz, [[-0.04, 0, 0.36, 0]])
    spots.chicken = toyAt(SPOTS.chicken, [P.cyl(0.11, 0.13, 0.03, SAND, { at: [kx, 0.005, kz], scale: [1.3, 1, 1] }, 16), ...hen.lined], 1.5, 1, hen.plain)
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
    const phi = { lined: [] as BufferGeometry[], plain: [] as BufferGeometry[] }
    for (const [k, [lon, lat, rx2]] of TOY_ISLANDS.entries()) {
      if (rx2 < 0.02) continue
      const [ix, iz] = ll(lon, lat)
      const t = towers(ix, y(ix, iz) - 0.03, iz, [[0, 0, k === 3 ? 0.4 : 0.48, k], [k === 3 ? 0.07 : -0.09, 0.03, 0.26, k + 1]])
      phi.lined.push(...t.lined)
      phi.plain.push(...t.plain)
    }
    phi.lined.push(...[0, 1, 2].flatMap((k) => T.palmParts(px + (k - 1) * 0.04, y(px, pz), pz + (k % 2) * 0.03, 0.3, k * 2.1)))
    spots.phiphi = toyAt(SPOTS.phiphi, phi.lined, 1.5, 1, phi.plain)
    // Koh Lanta's lighthouse on the south tip (white with pink bands, its lamp turns), a palm beside it.
    const [lx, lz] = SPOTS.lighthouse
    const lg = y(lx, lz)
    spots.lighthouse = toyAt(SPOTS.lighthouse, [
      P.cyl(0.04, 0.05, 0.2, '#FFFFFF', { at: [lx, lg + 0.1, lz] }, 12),
      ...[0.05, 0.12].map((h) => P.cyl(0.046 - h * 0.05, 0.047 - h * 0.05, 0.028, PAL.hotpink, { at: [lx, lg + h, lz] }, 12)),
      P.cyl(0.05, 0.05, 0.012, '#FFF7F0', { at: [lx, lg + 0.205, lz] }, 12),
      P.cyl(0.03, 0.03, 0.04, '#FFF4B8', { at: [lx, lg + 0.23, lz] }, 10),
      P.cone(0.04, 0.04, PAL.hotpink, { at: [lx, lg + 0.27, lz] }, 10),
      ...T.palmParts(lx + 0.08, lg, lz + 0.03, 0.34, 0.6),
    ])
    beam.position.set(lx, lg + 0.23 * SPOT_SCALE, lz)
    beam.add(solid(merge([P.cone(0.05, 0.3, '#FFF4B8', { at: [0.17, 0, 0], rot: [0, 0, Math.PI / 2] }, 10)]), bag, 0))
    beam.visible = false
    root.add(beam)
    // Ko Tapu, the Nail Island: a thin rock spike standing straight up out of the sea, wider at the top.
    const [nx, nz] = SPOTS.nail
    spots.nail = toyAt(SPOTS.nail, [
      P.cyl(0.045, 0.028, 0.32, ROCK, { at: [nx, 0.14, nz] }, 9),
      P.cyl(0.03, 0.02, 0.18, ROCK_DARK, { at: [nx + 0.02, 0.08, nz + 0.01] }, 7),
      P.sphere(0.05, '#79CC8F', { at: [nx, 0.31, nz], scale: [1, 0.55, 1] }, 9),
      P.cyl(0.05, 0.06, 0.02, '#F2FBFF', { at: [nx, 0.004, nz] }, 12),
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
    const [mx, mz] = PLACES.pier.at
    pierBoat.position.set(mx - 0.56, 0.004, mz + 0.1)
    pierBoat.rotation.y = Math.PI / 2
    root.add(pierBoat)
  }
  const boats = BOAT_LOOPS.map(() => boat())
  root.add(...boats)
  // ---- The tiny plane at the end of the runway ----
  const plane = new Group()
  plane.add(solid(merge(planeParts()), bag, 1.5))
  plane.scale.setScalar(1.8)
  root.add(plane)

  // ---- The stamps over the stops (shown once she's done each one), facing the camera ----
  const stamps = {} as Record<Stop, Group>
  for (const id of STOPS) {
    const g = new Group()
    const [x, z] = PLACES[STOP_PLACE[id]].at
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

  // ---- The pins ----
  const pins = {} as Record<PinId, Pin>
  for (const id of PIN_IDS) {
    const pin = buildPin(id, bag)
    const [x, z] = PINS[id].at
    pin.root.position.set(x, y(x, z) + PINS[id].lift, z)
    root.add(pin.root)
    pins[id] = pin
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

  // ---- Out at sea: the dolphins, the yacht ----
  const dolphins = [T.dolphin(bag), T.dolphin(bag)]
  for (const d of dolphins) {
    d.scale.setScalar(0.7)
    root.add(d)
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
  return { root, places, spots, stamps, pins, plane, clouds, boats, pierBoat, dolphins, yacht, elephants, monkey, sailfish, chicken, beam, sea, karsts }
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
    P.rbox(rw.len, 0.014, rw.w, 0.006, '#B4ABCF', { at: along(0, 0, 0.007), rot: [0, rw.yaw, 0] }),
    ...[-0.36, -0.12, 0.12, 0.36].map((k) => P.box(0.07, 0.004, 0.012, '#FFFFFF', { at: along(k, 0, 0.016), rot: [0, rw.yaw, 0] })),
    ...[-0.46, -0.3, -0.15, 0, 0.15, 0.3, 0.46].flatMap((k) => [-1, 1].map((sd) => P.sphere(0.008, k === -0.46 || k === 0.46 ? PAL.hotpink : PAL.butter, { at: along(k, sd * (rw.w / 2 - 0.01), 0.017) }, 6))),
  ]
}

/** Krabi Town: a row of pastel shophouses along the river, the Thai flag on a pole. */
function townParts([tx, tz]: XZ, y: Ground): BufferGeometry[] {
  const tg = y(tx, tz)
  const row = (x0: number, z: number, cols: [string, string][], yaw = 0) =>
    cols.flatMap(([wall, roof], k) => house(tx + x0 + k * 0.06, tz + z, 0.055, 0.07, 0.09 + (k % 2) * 0.025, wall, roof, y, yaw))
  return [
    ...row(-0.1, -0.04, [['#FFE9D9', ROOF], ['#FFD9E6', '#E86A8E'], ['#E7E0FF', '#9C8BE0'], ['#FFF4CF', '#F59E5B']]),
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

/** How high Railay's monkey sits (on top of its tallest cliff). */
export const MONKEY_Y = 0.5

/** The Krabi River and the creeks, as points (nothing is planted on them). */
const RIVER_PTS: XZ[] = RIVERS.flatMap((r) => r.flatMap(([lon, lat], i) => (i ? [ll((lon + r[i - 1][0]) / 2, (lat + r[i - 1][1]) / 2), ll(lon, lat)] : [ll(lon, lat)])))

/** A limestone tower, Krabi's own, kept soft: a rounded hump of cream rock leaning out over the notch the sea cuts
 *  round its foot, a lower shoulder beside it, a rust streak or two, and jungle draped thick over the top and spilling
 *  down the sides (mostly green, the cliff showing between). `lined` are its shapes, `plain` what's painted on them
 *  (no outline). About 0.75 * s tall, 0.4 * s across. */
function tower(x: number, y: number, z: number, s: number, k: number): { lined: BufferGeometry[]; plain: BufferGeometry[] } {
  const h = (0.46 + (k % 4) * 0.08) * s
  const r = 0.2 * s
  const foot = y + 0.05 * s
  const a = k * 2.4 + 0.5
  const [ax, az] = [Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9]
  const lined = [
    P.cyl(r * 0.8, r * 0.74, 0.07 * s, NOTCH, { at: [x, y + 0.03 * s, z] }, 10),
    P.cyl(r * 0.88, r, h, ROCK, { at: [x, foot + h / 2, z], rot: [0, k, 0] }, 10),
    P.cyl(r * 0.56, r * 0.7, h * 0.56, ROCK_DARK, { at: [x + ax, foot + h * 0.28, z + az] }, 8),
    // The jungle: a big soft dome on top, a smaller one on the shoulder.
    P.sphere(r * 1.1, JUNGLE[k % 3], { at: [x, foot + h * 0.96, z], scale: [1, 0.66, 1] }, 12),
    P.sphere(r * 0.66, JUNGLE[(k + 1) % 3], { at: [x - r * 0.25, foot + h * 0.96 + r * 0.42, z - r * 0.1], scale: [1, 0.72, 1] }, 9),
    P.sphere(r * 0.66, JUNGLE[(k + 2) % 3], { at: [x + ax, foot + h * 0.58, z + az], scale: [1, 0.66, 1] }, 9),
  ]
  const plain: BufferGeometry[] = []
  // Down the face that looks at us (south, +z): a rust streak or two, and greenery hanging over the edge.
  for (let i = 0; i < 2; i++) {
    const b = Math.PI / 2 + (i - 0.5) * 0.9 + (k % 3) * 0.2
    const t = 0.62 - i * 0.12
    plain.push(P.sphere(r * 0.12, RUST, { at: [x + Math.cos(b) * r * 0.9, foot + h * t, z + Math.sin(b) * r * 0.9], rot: [0, -b, 0], scale: [0.5, (h / r) * 0.6, 1] }, 5))
  }
  for (let i = 0; i < 5; i++) {
    const b = 0.5 + i * 1.26 + k
    const rad = r * 0.86
    plain.push(P.sphere(r * 0.3, JUNGLE[(k + i) % 3], { at: [x + Math.cos(b) * rad, foot + h * 0.8, z + Math.sin(b) * rad], scale: [1, 1.5 + (i % 2) * 0.6, 1] }, 6))
  }
  return { lined, plain }
}

/** A hill of rainforest: one big round dome with treetops bubbling all over it (no point on top, no snow-pale cap). */
function jungleHill(x: number, y: number, z: number, r: number, h: number, k: number): BufferGeometry[] {
  const parts = [P.sphere(r, JUNGLE[0], { at: [x, y, z], scale: [1, h / r, 1] }, 14)]
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4 + k
    const d = i < 3 ? 0.3 : 0.68
    const up = Math.sqrt(1 - d * d)
    const size = r * (i < 3 ? 0.4 : 0.34)
    parts.push(P.sphere(size, JUNGLE[(i + k) % 3], { at: [x + Math.cos(a) * r * d, y + h * up - size * 0.25, z + Math.sin(a) * r * d], scale: [1, 0.72, 1] }, 8))
  }
  parts.push(P.sphere(r * 0.34, JUNGLE[2], { at: [x, y + h * 0.98, z], scale: [1, 0.7, 1] }, 8))
  return parts
}

/** A clump of rainforest: three treetops, no trunks to see. */
function clump(x: number, y: number, z: number, s: number, k: number): BufferGeometry[] {
  return [
    P.sphere(0.1 * s, JUNGLE[k % 3], { at: [x, y + 0.055 * s, z], scale: [1.1, 0.8, 1] }, 8),
    P.sphere(0.075 * s, JUNGLE[(k + 1) % 3], { at: [x + 0.075 * s, y + 0.1 * s, z + 0.03 * s], scale: [1, 0.8, 1] }, 7),
    P.sphere(0.062 * s, JUNGLE[(k + 2) % 3], { at: [x - 0.06 * s, y + 0.08 * s, z - 0.045 * s] }, 7),
  ]
}

/** A coconut palm for planting by the hundred (the Thailand map's, T.palmParts, in a third of the triangles): a
 *  leaning trunk in two pieces, six fronds. */
function palm(x: number, y: number, z: number, s: number, turn: number): BufferGeometry[] {
  const lean = 0.22 * s
  const [cx, cz] = [Math.cos(turn), Math.sin(turn)]
  const parts = [
    P.cyl(0.028 * s, 0.034 * s, 0.26 * s, '#B88662', { at: [x + cx * lean * 0.12, y + 0.13 * s, z + cz * lean * 0.12], rot: [cz * 0.12, 0, -cx * 0.12] }, 5),
    P.cyl(0.024 * s, 0.028 * s, 0.26 * s, '#C99B74', { at: [x + cx * lean * 0.6, y + 0.37 * s, z + cz * lean * 0.6], rot: [cz * 0.36, 0, -cx * 0.36] }, 5),
  ]
  const [tx, ty, tz] = [x + cx * lean, y + 0.5 * s, z + cz * lean]
  for (let i = 0; i < 6; i++) {
    const a = turn + (i / 6) * Math.PI * 2
    parts.push(P.sphere(0.1 * s, i % 2 ? '#5FC084' : '#7FD496', { at: [tx + Math.cos(a) * 0.11 * s, ty - 0.015 * s, tz + Math.sin(a) * 0.11 * s], rot: [0, -a, -0.45], scale: [1.35, 0.22, 0.5] }, 6))
  }
  parts.push(P.sphere(0.045 * s, '#7FD496', { at: [tx, ty + 0.01 * s, tz] }, 5))
  return parts
}

/** The tiny plane (nose along +x). */
function planeParts(): BufferGeometry[] {
  return [
    P.capsule(0.022, 0.13, '#FFFFFF', { rot: [0, 0, Math.PI / 2] }),
    P.box(0.04, 0.006, 0.2, '#FFFFFF', { at: [0.01, 0, 0] }),
    P.box(0.025, 0.05, 0.006, PAL.hotpink, { at: [-0.075, 0.03, 0] }),
    P.box(0.02, 0.004, 0.07, '#FFFFFF', { at: [-0.07, 0.01, 0] }),
    P.box(0.13, 0.008, 0.002, PAL.hotpink, { at: [0, 0.006, 0.0225] }),
    P.box(0.13, 0.008, 0.002, PAL.hotpink, { at: [0, 0.006, -0.0225] }),
  ]
}

/** How high a pin's head is over its point, and how wide. */
export const PIN = { head: 0.2, r: 0.15, top: 0.5, size: 1.5 }

/** A pin: a white point, a round pink head, and a toy of the place on top. */
function buildPin(id: PinId, bag: Bag): Pin {
  const root = new Group()
  const c = PAL.hotpink
  const top = PIN.head + 0.035
  const floor = id === 'bay' ? '#8FEBD8' : id === 'home' ? '#DDF3FF' : '#CDEFB0'
  root.add(solid(merge([
    P.cone(0.09, 0.19, c, { at: [0, 0.095, 0], rot: [Math.PI, 0, 0] }, 16),
    P.sphere(0.016, '#FFFFFF', { at: [0, 0.004, 0] }, 6),
    P.cyl(PIN.r, PIN.r * 0.8, 0.06, c, { at: [0, PIN.head, 0] }, 28),
    P.cyl(PIN.r * 0.84, PIN.r * 0.84, 0.014, floor, { at: [0, top - 0.004, 0] }, 28),
  ]), bag, 2))
  const mini = new Group()
  mini.position.y = top
  root.add(mini)
  const pin: Pin = { root, mini }
  const add = (parts: BufferGeometry[], px = 1.5) => mini.add(solid(merge(parts), bag, px))
  if (id === 'chang') {
    // The baby elephant, a bunch of bananas at its feet.
    const e = T.elephant(bag, 1)
    e.root.scale.setScalar(0.4)
    e.root.position.set(-0.01, 0, -0.02)
    mini.add(e.root)
    pin.elephant = e
    add([0, 1, 2].map((k) => P.capsule(0.011, 0.04, PAL.butter, { at: [0.085 + k * 0.012, 0.02, 0.07 - k * 0.012], rot: [0, 0.4, 1.1 + k * 0.2] })))
  } else if (id === 'bay') {
    // The longtail with its ribbons, under a rock tower.
    const b = T.longtail(bag)
    b.scale.setScalar(0.42)
    b.position.set(0.0, 0.004, 0.035)
    b.rotation.y = Math.PI / 2 - 0.25
    mini.add(b)
    const t = tower(-0.045, -0.01, -0.055, 0.3, 1)
    mini.add(solidMix(t.lined, t.plain, bag, 1.5))
  } else {
    // The plane home, round and round over a puff of cloud.
    add([P.sphere(0.06, '#FFFFFF', { at: [0, 0.05, 0], scale: [1.3, 0.7, 1] }, 10), P.sphere(0.045, '#FFFFFF', { at: [0.07, 0.04, 0.01], scale: [1.2, 0.75, 1] }, 9), P.sphere(0.04, '#F4F1FA', { at: [-0.07, 0.04, -0.01], scale: [1.2, 0.75, 1] }, 9)], 2)
    const spin = new Group()
    spin.position.y = 0.17
    const p = solid(merge(planeParts()), bag, 1.5)
    p.scale.setScalar(1.25)
    p.position.set(0, 0, 0.06)
    p.rotation.set(0.3, 0, 0.1)
    spin.add(p)
    mini.add(spin)
    pin.spin = spin
  }
  root.scale.setScalar(PIN.size)
  return pin
}

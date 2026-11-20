// The Bangkok map's shapes (layout.ts says where): a toy diorama of the middle of Bangkok floating in the sky, in the
// same toy tray as the Thailand, Nan and Krabi maps. What makes it Bangkok: the wide teal Chao Phraya winding through
// a flat city printed on warm paper (ground.ts paints the blocks, the roads, the khlongs and the parks), a skyline of candy-colored glass towers in three tight bunches where
// they really stand, the river's bridges (Rama VIII's one leaning tower and its fan of cables, the Bhumibol bridges'
// golden diamonds), the skytrain on its pillars, rows of shophouses under terracotta roofs, coconut palms along the
// banks, a hot pink taxi and a tuk-tuk on the roads, little cars in taxi colors on the big roads, and Bang Krachao's
// jungle in the river's big loop. The corners have their own things: the night market's tents up by Rama 9, a
// floating market and Bang Mot's orange orchard out south-west. Thonburi and the south are city too, leafier than the
// middle (big trees standing here and there among the roofs). The pins and the river are still what she sees first.
// Bangkok's great landmark stands in the old town: Wat Arun's tall prang on the Thonburi bank. Scenery only, never a toy.
//
// The places stand up like chunky toys: the Thailand house (a row of pastel shophouses, the pink one in the middle,
// the flag, a tuk-tuk parked outside) and ICONSIAM (its folded glass front on the river, the gold roof, two towers
// behind, the fountain on its terrace). Over each floats a pink pin with a toy of what she does there on its head
// (a little house with a heart; a slide and a slice of pizza). Sparkle's balloon floats over the board's corner: a
// toy to poke.
//
// To poke: Asiatique's big wheel, Chinatown's red gate and lanterns, Lumphini Park's swan boat and monitor lizard,
// Mahanakhon (the tower made of blocks), Central Rama 3, the flower market, the port's crane, Bang Krachao's bird
// tower, the night market's tents, the floating market's boats, the orange orchard. And what moves: the skytrain, an express boat and a string of rice barges on the river, a
// fruit seller's boat on Khlong Bangkok Yai, the fast boat on Khlong Saen Saep, a tuk-tuk on Rama IV Road, a pink
// taxi on Rama III Road, the traffic, clouds.
import { Color, Group, InstancedMesh, LatheGeometry, Vector2, type BufferGeometry } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { bake, merge, P, solid, solidMix, type V3 } from '../../../../../engine3d/geo'
import { PAL, toon } from '../../../../../engine3d/toon'
import { trayParts } from '../../../trip/sky'
import type { Sea } from '../map/terrain'
import * as T from '../map/toys'
import { RIVER_LINE } from './geo'
import { blockMid, blockOf, buildField, buildGround, buildSea, crowns, districtAt, inBlock, inOrchard, LAKES, leafy, outward, type Field } from './ground'
import { BALLOON, BOARD, BOATS, BRIDGES, CANAL, CLOUDS, DEG_M, FRUIT_KHLONG, GROVES, LANDMARKS, LEVEL, ll, OLD_TOWN, PIN_IDS, PINS, PLACES, SANAM_LUANG, SKYTRAIN, SPOTS, STAMP_OFF, TAXI_ROAD, TOWERS, TRACK_Y, TRAFFIC, TUKTUK_ROAD, type LandmarkId, type PinId, type PlaceId, type SpotId, type XZ } from './layout'
import { pathLL, reachOn, type Path } from './path'

const CREAM = '#FFF7F0'
const WOOD = '#C99A6E'
const WOOD_DARK = '#9C7250'
const GOLD = '#FFD36B'
const RED = '#F0576B'
/** The towers' glass: the app's pastels, strong enough to stand out against the paper. */
const GLASS = ['#9CD3F7', '#C4B2FA', '#FFB5D0', '#A4E8D2', '#FFDC8A', '#AFC6FF']
/** The shophouses' roofs: Bangkok's terracotta tiles, a coral and a pink row here and there. */
const ROOFS = ['#F28B66', '#F7A072', '#F28B66', '#EE7F6E', '#F7A072', '#FF9DC0']
const WALLS = ['#FFF7F0', '#FFD9E6', '#FFF1B8', '#FFF7F0', '#CFEFE0', '#E7E0FF']
const LEAF = ['#66C890', '#7CD49C', '#97DFAB']
/** The spots stand this much bigger than the board's scale, like toys. */
const SPOT_SCALE = 1.5
/** How many of the leafy squares' big trees stand up off the paper out west and down south (the rest are painted). */
const GARDEN_TREES = 56
/** The top of the land everywhere (Bangkok is flat). */
const G = LEVEL.land

/** A color mixed toward white (0: itself, 1: white). */
function tint(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16)
  const ch = (s: number) => Math.round(((n >> s) & 255) + (255 - ((n >> s) & 255)) * k)
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`
}

/** A straight bar from `a` to `b`, `t` thick (and `w` wide across). */
function rod(a: V3, b: V3, t: number, c: string, w = t): BufferGeometry {
  const [dx, dy, dz] = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
  const len = Math.hypot(dx, dy, dz) || 1e-6
  return P.box(len, t, w, c, { at: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], rot: [0, Math.atan2(-dz, dx), Math.asin(dy / len)], order: 'YZX' })
}

/** A pin floating over a place: its point hangs just over the place, a toy of the place stands on its head. */
export interface Pin {
  root: Group
  /** The toy on its head (it turns when the pin is poked). */
  mini: Group
}

export interface Boat {
  root: Group
  /** Barges pulled along behind (the tug's string). */
  tail: Group[]
}

export interface Diorama {
  root: Group
  places: Record<PlaceId, Group>
  spots: Record<SpotId, Group>
  pins: Record<PinId, Pin>
  /** The mall day's stamp, beside ICONSIAM's pin (shown once she has it). */
  stamp: Group
  /** Sparkle's balloon, and the group it floats in (map3d.ts bobs and lifts it). */
  balloon: T.Balloon
  balloonAt: Group
  sea: Sea
  /** The river's middle line (the boats follow it), the skytrain's track, the tuk-tuk's road, the taxi's road and
   *  the fruit boat's khlong. */
  river: Path
  rail: Path
  road: Path
  taxiRoad: Path
  khlong: Path
  boats: Boat[]
  /** The skytrain's cars, front first. */
  train: Group[]
  tuktuk: Group
  taxi: Group
  fruit: Group
  /** Khlong Saen Saep and its fast boat. */
  canal: Path
  canalBoat: Group
  /** The little cars on the big roads: one instanced mesh, each car with its road, the stretch of it on the board
   *  ([from, to]), where it is along it, which way it's going and how fast. */
  traffic: { mesh: InstancedMesh; cars: { path: Path; from: number; to: number; d: number; dir: number; speed: number }[] }
  /** The night market's rows of tents, the floating market's boats (each bobs and hops by itself). */
  tentRows: Group[]
  marketBoats: Group[]
  clouds: Group[]
  /** Asiatique's wheel (it turns), Chinatown's lanterns (they swing), Lumphini's swan boat and monitor lizard, the
   *  port crane's box on its cable, Bang Krachao's birds, the fountain's bowl on ICONSIAM's terrace (world spot). */
  wheel: Group
  lanterns: Group
  swan: Group
  lizard: Group
  craneBox: Group
  birds: Group[]
  fountain: V3
  /** The towers a tap on the board pokes: [x, z, height]. */
  towers: [number, number, number][]
  /** The bridges a tap pokes: [x, z]. */
  bridges: XZ[]
  /** Where Wat Arun's and the golden chedi's gold glints now and then. */
  gold: V3[]
}

export function buildDiorama(bag: Bag): Diorama {
  const f = buildField()
  const root = new Group()
  const W = BOARD.x1 - BOARD.x0
  const D = BOARD.z1 - BOARD.z0
  // ---- The toy tray round the board, the river in it ----
  root.add(solid(merge(trayParts(W, D, 0.07, 0.2, 0.55)), bag, 2))
  // (A plain liner inside the rim: where the river runs off the board, the rim's ink line would show over the water.)
  {
    const [cx, cz] = [(BOARD.x0 + BOARD.x1) / 2, (BOARD.z0 + BOARD.z1) / 2]
    root.add(solid(merge([
      ...[-1, 1].map((s) => P.box(0.024, 0.16, D + 0.02, CREAM, { at: [cx + s * (W / 2 - 0.006), -0.012, cz] })),
      ...[-1, 1].map((s) => P.box(W + 0.02, 0.16, 0.024, CREAM, { at: [cx, -0.012, cz + s * (D / 2 - 0.006)] })),
    ]), bag, 0))
  }
  const sea = buildSea(bag)
  root.add(sea.mesh)
  const river = pathLL(RIVER_LINE, 1)
  const rail = pathLL(SKYTRAIN, 2)
  const road = pathLL(TUKTUK_ROAD, 2)
  const taxiRoad = pathLL(TAXI_ROAD, 2)
  const khlong = pathLL(FRUIT_KHLONG, 2)
  const canal = pathLL(CANAL, 2)

  /** What stands where already (nothing else is put inside): [x, z, radius]. */
  const taken: [number, number, number][] = [
    ...(Object.keys(PLACES) as PlaceId[]).map((id) => [...PLACES[id].at, 0.36] as [number, number, number]),
    // (Mahanakhon is a tower among towers: its neighbors stand close.)
    ...(Object.keys(LANDMARKS) as LandmarkId[]).map((id) => [...LANDMARKS[id].at, LANDMARKS[id].r] as [number, number, number]),
    ...(Object.keys(SPOTS) as SpotId[]).map((id) => [...SPOTS[id], id === 'mahanakhon' ? 0.15 : id === 'floating' || id === 'orchard' || id === 'tents' ? 0.34 : 0.26] as [number, number, number]),
  ]
  const free = (x: number, z: number, pad = 0) => taken.every(([px, pz, r]) => Math.hypot(px - x, pz - z) > r + pad)
  const shadows: [number, number, number][] = []
  const casts: [number, number, number, number][] = []
  // (The floating market stands in its own water and the orchard on its own grass: no paved square under them.)
  const unpaved = [SPOTS.floating, SPOTS.orchard]
  const plazas: [number, number, number][] = taken.filter(([x, z]) => !unpaved.some((u) => u[0] === x && u[1] === z)).map(([x, z, r]) => [x, z, r * 0.8])
  /** Water painted on the ground: the floating market's wide stretch of khlong ([x, z, radius east-west, north-south]). */
  const basins: [number, number, number, number][] = [[SPOTS.floating[0], SPOTS.floating[1] + 0.03, 0.26, 0.13]]
  // (Nothing stands on Sanam Luang's open field.)
  taken.push([...SANAM_LUANG, 0.16])

  // ---- The bridges ----
  const bridges: XZ[] = []
  {
    const lined: BufferGeometry[] = []
    const plain: BufferGeometry[] = []
    for (const [lon, lat, kind] of BRIDGES) {
      const b = bridge(f, river, ll(lon, lat), kind)
      lined.push(...b.lined)
      plain.push(...b.plain)
      bridges.push(b.mid)
      taken.push([b.a[0], b.a[1], 0.12], [b.b[0], b.b[1], 0.12])
    }
    root.add(solidMix(lined, plain, bag, 1.5))
  }

  // ---- The skytrain's track on its pillars, a little station at every stop ----
  {
    const parts: BufferGeometry[] = []
    const ty = G + TRACK_Y
    for (let i = 1; i < rail.pts.length; i++) {
      const [ax, az] = rail.pts[i - 1]
      const [bx, bz] = rail.pts[i]
      parts.push(rod([ax, ty, az], [bx, ty, bz], 0.01, '#CDBBF7', 0.022))
    }
    for (let d = 0.06; d < rail.len; d += 0.17) {
      const p = rail.at(d)
      if (f.land(p.x, p.z) < 0.02) continue
      parts.push(P.cyl(0.007, 0.009, TRACK_Y, '#E6DEFA', { at: [p.x, G + TRACK_Y / 2, p.z] }, 6))
    }
    for (const [lon, lat] of SKYTRAIN) {
      const [x, z] = ll(lon, lat)
      if (f.land(x, z) < 0.03 || x < BOARD.x0 + 0.1 || x > BOARD.x1 - 0.1) continue
      const yaw = rail.at(rail.near(x, z).d).yaw - Math.PI / 2
      parts.push(P.rbox(0.07, 0.012, 0.04, 0.004, CREAM, { at: [x, ty + 0.002, z], rot: [0, yaw, 0] }), P.rbox(0.062, 0.008, 0.046, 0.003, PAL.pink, { at: [x, ty + 0.05, z], rot: [0, yaw, 0] }))
      for (const s of [-1, 1]) parts.push(P.cyl(0.003, 0.003, 0.045, CREAM, { at: [x + Math.cos(yaw) * s * 0.026, ty + 0.026, z - Math.sin(yaw) * s * 0.026] }, 4))
    }
    root.add(solid(merge(parts), bag, 1))
  }
  const train = [0, 1, 2].map((i) => {
    const car = new Group()
    car.add(solid(merge(trainCar(i === 0, i === 2)), bag, 1.5))
    root.add(car)
    return car
  })

  // ---- The towers, in the districts they really stand in ----
  const towers: [number, number, number][] = []
  {
    const lined: BufferGeometry[] = []
    const plain: BufferGeometry[] = []
    TOWERS.forEach(([lon, lat, h, look], k) => {
      let [x, z] = ll(lon, lat)
      const w = 0.1 + h * 0.075
      // (A tower by the skytrain steps back from the track.)
      const near = rail.near(x, z)
      const need = w * 0.62 + 0.03
      if (near.dist < need) {
        const p = rail.at(near.d)
        const [nx, nz] = near.dist > 1e-4 ? [(x - p.x) / near.dist, (z - p.z) / near.dist] : [Math.cos(p.yaw), -Math.sin(p.yaw)]
        x = p.x + nx * need
        z = p.z + nz * need
      }
      if (f.land(x, z) < w * 0.6 || !free(x, z, w * 0.5) || f.park(x, z)) return
      const t = tower(x, G, z, h, w, look, k)
      lined.push(...t.lined)
      plain.push(...t.plain)
      towers.push([x, z, h])
      taken.push([x, z, w * 0.75])
      shadows.push([x, z, w * 1.1])
      casts.push([x, z, w, h])
    })
    root.add(solidMix(lined, plain, bag, 1.5))
  }

  // ---- Rows of shophouses along the little streets: three or four pastel fronts under one long terracotta roof,
  // close together in the old town and Chinatown, few and far apart everywhere else: one low neighborhood and open
  // paper (not confetti). Thonburi and the south get a few of their own (built up now, not orchards) ----
  {
    const parts: BufferGeometry[] = []
    const rnd = T.rng(41)
    const rows: XZ[] = []
    const quota = { in: 30, out: 10 }
    let outer = 0
    for (let i = 0; i < 60000 && rows.length < quota.in + quota.out; i++) {
      const px = BOARD.x0 + 0.1 + rnd() * (W - 0.2)
      const pz = BOARD.z0 + 0.1 + rnd() * (D - 0.2)
      const count = 3 + Math.floor(rnd() * 2)
      const pick = rnd()
      const o = districtAt(px, pz)
      if (inOrchard(px, pz)) continue
      const b = blockOf(o, px, pz)
      const [mx, mz] = blockMid(o, b.iu, b.iv)
      // (Close together in the old town, far apart everywhere else.)
      const out = outward(mx, mz) > 0.3
      if (out ? outer >= quota.out : rows.length - outer >= quota.in) continue
      const apart = Math.hypot(mx - OLD_TOWN.at[0], mz - OLD_TOWN.at[1]) < OLD_TOWN.r ? 0.24 : out ? 0.5 : 0.66
      if (rows.some(([rx, rz]) => Math.hypot(rx - mx, rz - mz) < apart)) continue
      // (The row runs along its district's streets.)
      const [ux, uz] = [Math.cos(o.turn), Math.sin(o.turn)]
      const wide = 0.06
      const spot = (j: number): XZ => [mx + ux * (j - (count - 1) / 2) * wide, mz + uz * (j - (count - 1) / 2) * wide]
      const ok = ([x, z]: XZ) => districtAt(x, z) === o && f.land(x, z) > 0.07 && !f.park(x, z) && !f.jungle(x, z) && free(x, z, 0.04) && f.clear(x, z) > 0.05 && rail.near(x, z).dist > 0.06
      if (![-0.7, ...Array.from({ length: count }, (_, j) => j), count - 0.3].every((j) => ok(spot(j)))) continue
      rows.push([mx, mz])
      if (out) outer++
      const deep = 0.06
      const h = 0.066 + rnd() * 0.012
      for (let j = 0; j < count; j++) {
        const [x, z] = spot(j)
        parts.push(P.box(wide - 0.003, h, deep, WALLS[(o.k + j + rows.length) % WALLS.length], { at: [x, G + h / 2, z], rot: [0, -o.turn, 0] }))
      }
      parts.push(P.prism([[-deep / 2 - 0.003, 0], [deep / 2 + 0.003, 0], [0, deep * 0.4]], count * wide + 0.006, ROOFS[(o.k + (pick > 0.8 ? 1 : 0)) % ROOFS.length], { at: [mx, G + h - 0.001, mz], rot: [0, Math.PI / 2 - o.turn, 0] }))
      shadows.push([mx, mz, count * wide * 0.5])
      taken.push([mx, mz, count * wide * 0.55])
    }
    root.add(solid(merge(parts), bag, 1))
  }

  // ---- Trees: round ones in the parks, coconut palms along the river's banks, jungle and palms on Bang Krachao (big
  // soft clumps, well apart: a green lung, not a dark thicket) ----
  {
    const parts: BufferGeometry[] = []
    const put: XZ[] = []
    const rnd = T.rng(7)
    const inLake = (x: number, z: number) =>
      LAKES.some(([lon, lat, rx, ry]) => {
        const [lx, lz] = ll(lon, lat)
        return ((x - lx) / (rx * DEG_M + 0.03)) ** 2 + ((z - lz) / (ry * DEG_M + 0.03)) ** 2 < 1
      })
    for (let i = 0; i < 30000 && put.length < 110; i++) {
      const x = BOARD.x0 + 0.08 + rnd() * (W - 0.16)
      const z = BOARD.z0 + 0.08 + rnd() * (D - 0.16)
      const s = 0.36 + rnd() * 0.2
      const turn = rnd() * 6.28
      if (f.land(x, z) < 0.05 || !free(x, z, 0.03) || inLake(x, z)) continue
      const jungle = f.jungle(x, z)
      const park = f.park(x, z)
      if (!jungle && !park) continue
      // (The jungle keeps back from the banks and off the taxi's road: its big clumps would hang over them.)
      if (jungle && (f.land(x, z) < 0.1 || taxiRoad.near(x, z).dist < 0.12)) continue
      if (put.some(([px, pz]) => Math.hypot(px - x, pz - z) < (jungle ? 0.15 : 0.085))) continue
      put.push([x, z])
      if (jungle && put.length % 4 === 0) parts.push(...palm(x, G, z, s * 0.7, turn))
      else if (jungle) parts.push(...clump(x, G, z, s * 1.7, i))
      else parts.push(...roundTree(x, G, z, s * 0.9, i))
      shadows.push([x, z, (jungle ? 0.09 : 0.05) * s + 0.015])
    }
    // Out west and down south, the big trees of the leafy squares stand up off the paper here and there (on their
    // painted crowns): the green that's left among the roofs, thickest along the khlongs and toward the edges.
    {
      const rnd2 = T.rng(23)
      const stood: XZ[] = []
      for (let i = 0; i < 40000 && stood.length < GARDEN_TREES; i++) {
        const px = BOARD.x0 + 0.08 + rnd2() * (W - 0.16)
        const pz = BOARD.z0 + 0.08 + rnd2() * (D - 0.16)
        const o = districtAt(px, pz)
        const b = blockOf(o, px, pz)
        if (leafy(o, b.iu, b.iv) < 0.5) continue
        const [cu, cv, cr] = crowns(o, b.iu, b.iv)[0]
        const [x, z] = inBlock(o, b.iu, b.iv, cu, cv)
        if (f.land(x, z) < 0.07 || f.park(x, z) || f.jungle(x, z) || !free(x, z, 0.03) || f.clear(x, z) < 0.035 || rail.near(x, z).dist < 0.06) continue
        if (stood.some(([sx, sz]) => Math.hypot(sx - x, sz - z) < 0.12)) continue
        stood.push([x, z])
        parts.push(...roundTree(x, G, z, 0.4 + cr * 0.6 + rnd2() * 0.08, i))
        shadows.push([x, z, 0.035])
        taken.push([x, z, 0.035])
      }
    }
    // Bang Mot's orange orchard: neat rows of little fruit trees beside the orchard toy, each on its painted row.
    for (const [lon, lat, rowsN, n] of GROVES) {
      const [gx, gz] = ll(lon, lat)
      const o = districtAt(gx, gz)
      const b = blockOf(o, gx, gz)
      for (let r = 0; r < rowsN; r++)
        for (let j = 0; j < n; j++) {
          const [x, z] = blockMid(o, b.iu + r, b.iv + j)
          if (f.land(x, z) < 0.06 || !free(x, z, 0.04) || f.clear(x, z) < 0.04 || f.jungle(x, z) || !inOrchard(x, z)) continue
          parts.push(...roundTree(x, G, z, 0.5 + ((r + j) % 3) * 0.05, r + j), P.sphere(0.008, '#FF9A4D', { at: [x + 0.016, G + 0.058, z + 0.022] }, 5), P.sphere(0.008, PAL.butter, { at: [x - 0.02, G + 0.05, z + 0.016] }, 5))
          shadows.push([x, z, 0.04])
          taken.push([x, z, 0.04])
        }
    }
    // The palms along the banks: one every so often, on one bank and then the other, leaning out over the water.
    let side = 1
    for (let d = 0.5; d < river.len - 0.3; d += 0.46) {
      const p = river.at(d)
      const [ux, uz] = [Math.cos(p.yaw), -Math.sin(p.yaw)]
      side = -side
      for (let off = 0.04; off < 0.4; off += 0.008) {
        const [x, z] = [p.x + ux * off * side, p.z + uz * off * side]
        if (f.land(x, z) < 0.045) continue
        if (x > BOARD.x0 + 0.1 && x < BOARD.x1 - 0.1 && z > BOARD.z0 + 0.1 && z < BOARD.z1 - 0.1 && free(x, z, 0.16) && !f.jungle(x, z) && f.clear(x, z) > 0.04 && rail.near(x, z).dist > 0.08) {
          parts.push(...palm(x, G, z, 0.42 + rnd() * 0.1, Math.atan2(-uz * side, -ux * side)))
          shadows.push([x, z, 0.05])
          taken.push([x, z, 0.05])
        }
        break
      }
    }
    root.add(solid(merge(parts), bag, 1.5))
  }

  // ---- The places and the toys to poke ----
  /** A group standing at (x, z), built from parts in its own frame (its foot at 0, +z toward the south), scaled up
   *  like a toy. */
  const toy = (at: XZ, parts: BufferGeometry[], scale = SPOT_SCALE, plain: BufferGeometry[] = [], px = 1.5, yaw = 0) => {
    const g = new Group()
    g.position.set(at[0], G, at[1])
    g.rotation.y = yaw
    g.scale.setScalar(scale)
    g.add(plain.length ? solidMix(parts, plain, bag, px) : solid(merge(parts), bag, px))
    root.add(g)
    shadows.push([at[0], at[1], 0.2])
    return g
  }
  const sub = (parent: Group, parts: BufferGeometry[], at: V3, px = 1.2) => {
    const g = new Group()
    g.position.set(...at)
    g.add(solid(merge(parts), bag, px))
    parent.add(g)
    return g
  }

  const house = toy(PLACES.house.at, houseParts(), PLACES.house.scale)
  {
    const tuk = T.tuktuk(bag)
    tuk.scale.setScalar(0.26)
    tuk.position.set(0.12, 0, 0.1)
    tuk.rotation.y = -1.25
    house.add(tuk)
  }
  const icon = iconsiamParts()
  // (Its glass front really looks east over the river: the toy is turned a little toward us, so she sees it.)
  const iconsiam = toy(PLACES.iconsiam.at, icon.lined, PLACES.iconsiam.scale, icon.plain, 1.5, ICON_YAW)
  // (The fountain's bowl is on the terrace by the river: map3d.ts sprays it.)
  const [fc, fs] = [Math.cos(ICON_YAW), Math.sin(ICON_YAW)]
  const fountain: V3 = [
    PLACES.iconsiam.at[0] + (ICON_FOUNTAIN[0] * fc + ICON_FOUNTAIN[1] * fs) * PLACES.iconsiam.scale,
    G + 0.03 * PLACES.iconsiam.scale,
    PLACES.iconsiam.at[1] + (-ICON_FOUNTAIN[0] * fs + ICON_FOUNTAIN[1] * fc) * PLACES.iconsiam.scale,
  ]
  const balloon = T.balloon(bag)
  balloon.root.scale.setScalar(0.62)
  const balloonAt = new Group()
  balloonAt.position.set(BALLOON[0], G, BALLOON[1])
  balloonAt.add(balloon.root)
  root.add(balloonAt)
  const places = { house, iconsiam } as Record<PlaceId, Group>

  const spots = {} as Record<SpotId, Group>
  // Asiatique: the big wheel by the river, the old warehouses under it.
  spots.asiatique = toy(SPOTS.asiatique, asiatiqueParts())
  const wheel = sub(spots.asiatique, wheelParts(), [0.02, 0.165, -0.02])
  // Chinatown: the red gate, shophouses with bright signs, a string of lanterns.
  spots.chinatown = toy(SPOTS.chinatown, chinatownParts())
  const lanterns = sub(spots.chinatown, lanternParts(), [0, 0.125, 0.07])
  // Lumphini Park: a bandstand and trees by the lake; the swan boat and the monitor lizard are on the board itself.
  spots.lumphini = toy(SPOTS.lumphini, lumphiniParts(), 1.3)
  const [lkx, lkz] = ll(LAKES[0][0], LAKES[0][1])
  const swan = new Group()
  swan.add(solid(merge(swanParts()), bag, 1.2))
  swan.position.set(lkx, G + 0.004, lkz)
  swan.scale.setScalar(1.4)
  root.add(swan)
  const lizard = new Group()
  lizard.add(solid(merge(lizardParts()), bag, 1.2))
  lizard.position.set(lkx - 0.02, G + 0.004, lkz + 0.085)
  lizard.scale.setScalar(1.5)
  root.add(lizard)
  // Mahanakhon: the tower made of blocks.
  const maha = mahanakhonParts()
  spots.mahanakhon = toy(SPOTS.mahanakhon, maha.lined, SPOT_SCALE, maha.plain)
  spots.rama3 = toy(SPOTS.rama3, mallParts())
  spots.flowers = toy(SPOTS.flowers, flowerParts())
  spots.port = toy(SPOTS.port, portParts())
  const craneBox = sub(spots.port, [P.rbox(0.05, 0.026, 0.026, 0.004, PAL.pink, { at: [0, -0.013, 0] }), P.cyl(0.0015, 0.0015, 0.2, '#5E5468', { at: [0, 0.1, 0] }, 4)], [-0.02, CRANE_BOX_Y, 0.1])
  spots.krachao = toy(SPOTS.krachao, krachaoParts())
  const birds = [0, 1, 2].map((i) => sub(spots.krachao, birdParts(i), [0, 0.2, 0], 1))
  // The night market: rows of tents in every color behind its gate of lights.
  spots.tents = toy(SPOTS.tents, tentsParts(), 2)
  const tentRows = [0, 1, 2].map((i) => sub(spots.tents, tentRowParts(i), [0, 0.008, -0.085 + i * 0.075], 1.2))
  // The floating market: stilt houses and a jetty on the khlong, the sellers' boats moored in front.
  spots.floating = toy(SPOTS.floating, floatingParts())
  const marketBoats = MARKET_BOATS.map(([x, z, yaw], i) => {
    const b = sub(spots.floating, marketBoatParts(i), [x, 0.002, z], 1.2)
    b.rotation.y = yaw
    return b
  })
  // Bang Mot's orange orchard: trees heavy with oranges, the farmer's house on its stilts, baskets out front.
  spots.orchard = toy(SPOTS.orchard, orchardParts(), 1.6)

  // ---- Bangkok's landmark: Wat Arun on the Thonburi bank. To look at, never a toy: nothing pokes it, no pin, no
  // line (layout.ts LANDMARKS) ----
  const arun = arunParts()
  toy(LANDMARKS.arun.at, arun.lined, LANDMARKS.arun.scale, arun.plain)
  /** Where its gold catches the light (map3d.ts glints it): Wat Arun's tip. */
  const gold: V3[] = [
    [LANDMARKS.arun.at[0], G + 0.36 * LANDMARKS.arun.scale, LANDMARKS.arun.at[1]],
  ]

  // ---- The pins, and the mall day's stamp beside ICONSIAM's ----
  const pins = {} as Record<PinId, Pin>
  for (const id of PIN_IDS) {
    const pin = buildPin(id, bag)
    const [x, z] = PINS[id].at
    pin.root.position.set(x, G + PINS[id].lift, z)
    root.add(pin.root)
    pins[id] = pin
  }
  const stamp = new Group()
  {
    stamp.position.set(PINS.iconsiam.at[0] + STAMP_OFF[0], G + PINS.iconsiam.lift + STAMP_OFF[1], PINS.iconsiam.at[1] + STAMP_OFF[2])
    const face = new Group()
    face.rotation.x = Math.PI / 2 - 0.85
    face.add(solid(merge([
      P.cyl(0.13, 0.13, 0.025, PAL.hotpink, {}, 24),
      P.torus(0.105, 0.008, '#FFFFFF', { at: [0, 0.014, 0], rot: [Math.PI / 2, 0, 0] }),
      ...[-1, 1].map((s) => P.sphere(0.035, '#FFFFFF', { at: [s * 0.026, 0.016, -0.018], scale: [1, 0.3, 1] }, 10)),
      P.cone(0.058, 0.07, '#FFFFFF', { at: [0, 0.016, 0.022], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.3] }, 10),
    ]), bag, 2))
    stamp.add(face)
    stamp.visible = false
    root.add(stamp)
  }

  // ---- On the river: the express boat with its orange flag, a tug pulling rice barges ----
  const boats = BOATS.map(({ kind }) => {
    const g = new Group()
    const tail: Group[] = []
    if (kind === 'express') g.add(solid(merge(expressParts()), bag, 1.5))
    else {
      g.add(solid(merge(tugParts()), bag, 1.5))
      for (let i = 0; i < 2; i++) {
        const b = T.barge(bag)
        b.scale.setScalar(0.26)
        root.add(b)
        tail.push(b)
      }
    }
    root.add(g)
    return { root: g, tail }
  })
  // ---- A tuk-tuk on Rama IV Road ----
  const tuktuk = T.tuktuk(bag)
  tuktuk.scale.setScalar(0.5)
  root.add(tuktuk)
  // ---- A hot pink taxi on Rama III Road, a fruit seller's boat on Khlong Bangkok Yai ----
  const taxi = new Group()
  taxi.add(solid(merge(taxiParts()), bag, 1.5))
  root.add(taxi)
  const fruit = new Group()
  fruit.add(solid(merge(fruitBoatParts()), bag, 1.5))
  root.add(fruit)
  // ---- The fast boat on Khlong Saen Saep ----
  const canalBoat = new Group()
  canalBoat.add(solid(merge(canalBoatParts()), bag, 1.5))
  root.add(canalBoat)
  // ---- Traffic: little cars in taxi colors on the big roads (one instanced mesh, no outlines: they're specks) ----
  const cars: Diorama['traffic']['cars'] = []
  const rndCar = T.rng(23)
  for (const [line, n] of TRAFFIC) {
    const path = pathLL(line, 2)
    const [from, to] = reachOn(path, 0.14)
    if (to - from < 0.5) continue
    for (let i = 0; i < n; i++) cars.push({ path, from, to, d: from + ((i + rndCar() * 0.6) / n) * (to - from), dir: i % 2 ? 1 : -1, speed: 0.07 + rndCar() * 0.05 })
  }
  const carMesh = new InstancedMesh(bag.add(merge(carParts())), toon('#ffffff', true), cars.length)
  bag.add(carMesh)
  carMesh.frustumCulled = false
  const carCols = [PAL.hotpink, '#8FDB8A', '#FF9A4D', PAL.sky, PAL.butter, PAL.lavenderDark, '#FFFFFF', '#F0576B']
  const col = new Color()
  cars.forEach((_, i) => carMesh.setColorAt(i, col.set(carCols[i % carCols.length])))
  root.add(carMesh)
  const traffic = { mesh: carMesh, cars }
  // ---- Clouds over the city ----
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

  root.add(buildGround(bag, { shadows, plazas, casts, basins }))
  return { root, places, spots, pins, stamp, balloon, balloonAt, sea, river, rail, road, taxiRoad, khlong, canal, canalBoat, traffic, tentRows, marketBoats, boats, train, tuktuk, taxi, fruit, clouds, wheel, lanterns, swan, lizard, craneBox, birds, fountain, towers, bridges, gold }
}

// ---------------------------------------------------------------- towers

/** A glass tower `h` tall and about `w` across, standing on `y`: one of five looks, or Baiyoke's tower with its round
 *  crown and mast ('crown'), or the riverside tower with the gold dome ('dome'). `lined` are its shapes, `plain` its
 *  floors and windows (painted on: no outline). */
function tower(x: number, y: number, z: number, h: number, w: number, look: number | 'crown' | 'dome', k: number): { lined: BufferGeometry[]; plain: BufferGeometry[] } {
  const c = GLASS[k % GLASS.length]
  const pale = tint(c, 0.55)
  const lined: BufferGeometry[] = []
  const plain: BufferGeometry[] = []
  const yaw = -districtAt(x, z).turn
  const rot: V3 = [0, yaw, 0]
  /** Floor lines round a box `bw` by `bd` from `y0` up to `y1`. */
  const floors = (bw: number, bd: number, y0: number, y1: number, col = pale, cx = x, cz = z) => {
    for (let fy = y0 + 0.05; fy < y1 - 0.02; fy += 0.055) plain.push(P.box(bw + 0.004, 0.009, bd + 0.004, col, { at: [cx, fy, cz], rot }))
  }
  if (look === 'crown') {
    // Baiyoke's tower: tall, slim and peach, a round crown and a mast on top.
    const body = '#FFD9C4'
    lined.push(
      P.rbox(w * 1.25, h * 0.2, w * 1.25, 0.012, '#FFE9DC', { at: [x, y + h * 0.1, z], rot }),
      P.rbox(w * 0.82, h * 0.86, w * 0.82, 0.012, body, { at: [x, y + h * 0.43, z], rot }),
      P.cyl(w * 0.56, w * 0.46, h * 0.07, GOLD, { at: [x, y + h * 0.89, z] }, 14),
      P.cyl(w * 0.4, w * 0.44, h * 0.06, body, { at: [x, y + h * 0.95, z] }, 14),
      P.sphere(w * 0.38, GOLD, { at: [x, y + h * 0.98, z], scale: [1, 0.5, 1] }, 12),
      P.cyl(0.004, 0.006, h * 0.2, CREAM, { at: [x, y + h * 1.1, z] }, 5),
      P.sphere(0.011, PAL.hotpink, { at: [x, y + h * 1.2, z] }, 6),
    )
    floors(w * 0.82, w * 0.82, y + h * 0.2, y + h * 0.86, '#FFF1E6')
  } else if (look === 'dome') {
    // The riverside tower with the gold dome.
    lined.push(
      P.rbox(w, h * 0.82, w * 0.86, 0.012, '#FFF1DC', { at: [x, y + h * 0.41, z], rot }),
      P.rbox(w * 1.12, 0.016, w * 0.98, 0.006, CREAM, { at: [x, y + h * 0.82, z], rot }),
      P.cyl(w * 0.36, w * 0.4, h * 0.08, '#FFF1DC', { at: [x, y + h * 0.87, z] }, 12),
      P.sphere(w * 0.4, GOLD, { at: [x, y + h * 0.92, z], scale: [1, 0.7, 1] }, 12),
    )
    floors(w, w * 0.86, y, y + h * 0.82, '#FFFDF6')
  } else if (look === 0) {
    // A glass slab with a flat hat.
    lined.push(P.rbox(w, h, w * 0.72, 0.012, c, { at: [x, y + h / 2, z], rot }), P.rbox(w * 0.7, 0.03, w * 0.5, 0.008, CREAM, { at: [x, y + h + 0.012, z], rot }))
    floors(w, w * 0.72, y, y + h)
  } else if (look === 1) {
    // Three steps up to a spire.
    lined.push(
      P.rbox(w * 1.1, h * 0.5, w * 1.1, 0.012, c, { at: [x, y + h * 0.25, z], rot }),
      P.rbox(w * 0.84, h * 0.32, w * 0.84, 0.012, tint(c, 0.25), { at: [x, y + h * 0.65, z], rot }),
      P.rbox(w * 0.56, h * 0.2, w * 0.56, 0.01, c, { at: [x, y + h * 0.9, z], rot }),
      P.cone(w * 0.16, h * 0.16, CREAM, { at: [x, y + h * 1.07, z] }, 6),
    )
    floors(w * 1.1, w * 1.1, y, y + h * 0.5)
    floors(w * 0.84, w * 0.84, y + h * 0.5, y + h * 0.8)
  } else if (look === 2) {
    // A round one with a dome.
    const r = w * 0.52
    lined.push(P.cyl(r, r * 1.06, h, c, { at: [x, y + h / 2, z] }, 16), P.sphere(r * 0.92, tint(c, 0.4), { at: [x, y + h, z], scale: [1, 0.5, 1] }, 12))
    for (let fy = y + 0.05; fy < y + h - 0.02; fy += 0.055) plain.push(P.cyl(r * 1.05, r * 1.05, 0.009, pale, { at: [x, fy, z] }, 16))
  } else if (look === 3) {
    // A slab with a sloped top.
    const d = w * 0.7
    lined.push(P.rbox(w, h * 0.82, d, 0.012, c, { at: [x, y + h * 0.41, z], rot }), P.prism([[-w / 2, 0], [w / 2, 0], [w / 2, h * 0.2]], d, tint(c, 0.25), { at: [x, y + h * 0.8, z], rot }))
    floors(w, d, y, y + h * 0.8)
  } else {
    // Twin slabs with a bridge between them.
    const off = w * 0.34
    const [ox, oz] = [Math.cos(yaw) * off, -Math.sin(yaw) * off]
    lined.push(
      P.rbox(w * 0.52, h, w * 0.7, 0.012, c, { at: [x - ox, y + h / 2, z - oz], rot }),
      P.rbox(w * 0.52, h * 0.84, w * 0.7, 0.012, tint(c, 0.25), { at: [x + ox, y + h * 0.42, z + oz], rot }),
      P.rbox(w * 0.3, 0.03, w * 0.4, 0.008, CREAM, { at: [x, y + h * 0.6, z], rot }),
    )
    floors(w * 0.52, w * 0.7, y, y + h, pale, x - ox, z - oz)
    floors(w * 0.52, w * 0.7, y, y + h * 0.84, pale, x + ox, z + oz)
  }
  return { lined, plain }
}

/** Mahanakhon: a tall glass tower with a ribbon of blocks winding round it, as if it were made of toy bricks (in the
 *  toy's own frame, its foot at 0). */
function mahanakhonParts(): { lined: BufferGeometry[]; plain: BufferGeometry[] } {
  const h = 0.54
  const half = 0.05
  const lined = [
    P.rbox(0.16, 0.03, 0.16, 0.008, CREAM, { at: [0, 0.015, 0] }),
    P.rbox(half * 2, h, half * 2, 0.014, '#CFE6FA', { at: [0, h / 2 + 0.02, 0] }),
    P.rbox(0.07, 0.03, 0.07, 0.008, '#E3DBFF', { at: [0, h + 0.03, 0] }),
  ]
  const plain: BufferGeometry[] = []
  for (let fy = 0.08; fy < h; fy += 0.05) plain.push(P.box(half * 2 + 0.004, 0.008, half * 2 + 0.004, '#E9F4FF', { at: [0, fy, 0] }))
  // The ribbon: little blocks sticking out and cut in, spiralling up.
  const cols = ['#FFFFFF', '#E3DBFF', '#9FC8EE', '#FFD3E4']
  for (let i = 0; i < 34; i++) {
    const t = i / 33
    const a = t * Math.PI * 2 * 1.6 + 0.6
    const px = Math.max(-1, Math.min(1, Math.cos(a) * 1.5)) * half
    const pz = Math.max(-1, Math.min(1, Math.sin(a) * 1.5)) * half
    const s = 0.024 + (i % 3) * 0.006
    const out = i % 4 === 2 ? 0.2 : 0.7
    lined.push(P.box(s, s, s, cols[i % cols.length], { at: [px * (1 + out * 0.16), 0.07 + t * (h - 0.08) + ((i * 7) % 5) * 0.004, pz * (1 + out * 0.16)] }))
  }
  return { lined, plain }
}

// ---------------------------------------------------------------- bridges

/** A bridge square across the river at `at`: where its two ends stand on the banks, and its shapes. */
function bridge(f: Field, river: Path, at: XZ, kind: (typeof BRIDGES)[number][2]): { lined: BufferGeometry[]; plain: BufferGeometry[]; mid: XZ; a: XZ; b: XZ } {
  const p = river.at(river.near(...at).d)
  // Across the river: at right angles to the way it flows here.
  const [ux, uz] = [Math.cos(p.yaw), -Math.sin(p.yaw)]
  const bank = (dir: number): number => {
    for (let d = 0.02; d < 0.4; d += 0.006) if (f.land(p.x + ux * d * dir, p.z + uz * d * dir) > 0.012) return d
    return 0.2
  }
  const [da, db] = [bank(-1), bank(1)]
  const deckY = 0.125
  const col = kind === 'truss' ? '#8FD4B0' : kind === 'rail' ? '#E6DEFA' : CREAM
  const wide = kind === 'rail' ? 0.062 : 0.05
  /** A spot on the deck: `s` meters from the river's middle (minus: toward the first bank), `up` over the deck,
   *  `side` meters across it. */
  const on = (s: number, up = 0, side = 0): V3 => [p.x + ux * s + uz * side, deckY + up, p.z + uz * s - ux * side]
  const [s0, s1] = [-da - 0.03, db + 0.03]
  const L = s1 - s0
  const along = (k: number) => s0 + L * k
  const lined: BufferGeometry[] = [
    rod(on(s0), on(s1), 0.014, col, wide),
    // Ramps down onto the banks.
    rod([p.x + ux * (s0 - 0.11), G + 0.004, p.z + uz * (s0 - 0.11)], on(s0), 0.012, col, wide),
    rod(on(s1), [p.x + ux * (s1 + 0.11), G + 0.004, p.z + uz * (s1 + 0.11)], 0.012, col, wide),
    // Piers in the water.
    ...[0.3, 0.7].map((k) => P.cyl(0.011, 0.014, deckY + 0.03, tint(col, 0.3), { at: [on(along(k))[0], deckY / 2 - 0.02, on(along(k))[2]] }, 8)),
  ]
  const plain: BufferGeometry[] = [rod(on(s0, 0.008), on(s1, 0.008), 0.003, '#FFFFFF', 0.004)]
  const cable = (a: V3, b: V3) => plain.push(rod(a, b, 0.003, '#FFFFFF'))
  if (kind === 'harp') {
    // Rama VIII: one tall tower leaning back on its two legs at one end, a fan of cables down to the deck.
    const s = along(0.14)
    const top = on(along(0.08), 0.5)
    const knee = on(s, 0.22)
    lined.push(rod(on(s, 0, 0.034), knee, 0.016, GOLD), rod(on(s, 0, -0.034), knee, 0.016, GOLD), rod(knee, top, 0.018, GOLD), P.sphere(0.016, PAL.hotpink, { at: top }, 8))
    for (let i = 0; i < 8; i++) cable(on(along(0.1), 0.26 + i * 0.03), on(along(0.3 + i * 0.085), 0.006, i % 2 ? 0.02 : -0.02))
  } else if (kind === 'stay') {
    // Rama IX: two yellow towers down the middle, cables fanning out both ways from each.
    for (const k of [0.3, 0.7]) {
      const top = on(along(k), 0.27)
      lined.push(rod(on(along(k)), top, 0.016, '#FFD95E'), P.sphere(0.013, CREAM, { at: top }, 6))
      for (const dir of [-1, 1]) for (let i = 1; i <= 3; i++) cable(on(along(k), 0.27 - i * 0.035), on(along(k) + dir * i * L * 0.062, 0.006))
    }
  } else if (kind === 'diamond') {
    // A Bhumibol bridge: two golden diamonds the road runs through, cables down to the deck.
    for (const k of [0.27, 0.73]) {
      const s = along(k)
      const top = on(s, 0.36)
      const foot: V3 = [on(s)[0], -0.02, on(s)[2]]
      for (const side of [-1, 1]) lined.push(rod(on(s, 0.02, side * 0.045), top, 0.013, GOLD), rod(foot, on(s, 0.02, side * 0.045), 0.013, GOLD))
      lined.push(P.sphere(0.014, PAL.hotpink, { at: top }, 6))
      for (const dir of [-1, 1]) for (let i = 1; i <= 3; i++) cable(on(s, 0.36 - i * 0.05), on(s + dir * i * L * 0.07, 0.006))
    }
  } else if (kind === 'truss') {
    // An old steel bridge: a green hump of girders on each side.
    const yaw = Math.atan2(-uz, ux)
    for (const side of [-1, 1]) {
      const c = on((s0 + s1) / 2, -0.002, side * (wide / 2 - 0.004))
      lined.push(P.torus(L * 0.3, 0.006, '#6FC49C', { at: c, rot: [0, yaw, 0], scale: [1, 0.42, 1] }, Math.PI))
      for (const k of [-0.5, 0, 0.5]) plain.push(rod(on((s0 + s1) / 2 + k * L * 0.3, 0, side * (wide / 2 - 0.004)), on((s0 + s1) / 2 + k * L * 0.3, L * 0.126 * Math.sqrt(1 - k * k), side * (wide / 2 - 0.004)), 0.004, '#6FC49C'))
    }
  }
  return { lined, plain, mid: [p.x, p.z], a: [on(s0 - 0.06)[0], on(s0 - 0.06)[2]], b: [on(s1 + 0.06)[0], on(s1 + 0.06)[2]] }
}

// ---------------------------------------------------------------- the places

/** Where the fountain's bowl is on ICONSIAM's terrace (east, south of the toy's foot, before its scale and turn). */
const ICON_FOUNTAIN: XZ = [0.165, 0.02]
/** How far ICONSIAM's toy is turned toward the south (radians). */
const ICON_YAW = -0.7

/** The Thailand house: three pastel shophouses in a row (the pink one in the middle is hers), striped awnings, the
 *  flag on its pole, plants by the door. Its front looks south (+z). */
function houseParts(): BufferGeometry[] {
  const parts: BufferGeometry[] = []
  const paint = ['#FBEA9A', '#FF9DC0', '#8FE3C8']
  const awning = [PAL.pink, '#FFFFFF', PAL.gold]
  for (let i = -1; i <= 1; i++) {
    const x = i * 0.078
    const h = i ? 0.115 : 0.145
    parts.push(
      P.rbox(0.074, h, 0.09, 0.008, paint[i + 1], { at: [x, h / 2, 0] }),
      P.box(0.082, 0.011, 0.098, CREAM, { at: [x, h + 0.003, 0] }),
      P.box(0.078, 0.007, 0.036, awning[i + 1], { at: [x, 0.058, 0.058], rot: [0.4, 0, 0] }),
      P.box(0.042, 0.042, 0.006, i ? '#C8BEDD' : '#9A6B4F', { at: [x, 0.021, 0.046] }),
      ...[-0.018, 0.018].map((wx) => P.box(0.02, 0.026, 0.006, '#DDF3FF', { at: [x + wx, h - 0.032, 0.046] })),
    )
  }
  // A water tank and a little roof garden on the pink one.
  parts.push(P.cyl(0.014, 0.014, 0.022, '#BFE2FA', { at: [0.016, 0.162, -0.02] }, 8), P.sphere(0.014, LEAF[1], { at: [-0.018, 0.158, 0.012] }, 7), P.sphere(0.01, PAL.pink, { at: [-0.006, 0.156, 0.026] }, 6))
  // The flag of Thailand on its pole.
  parts.push(P.cyl(0.0035, 0.004, 0.2, CREAM, { at: [-0.14, 0.1, 0.03] }, 5), P.sphere(0.007, PAL.gold, { at: [-0.14, 0.203, 0.03] }, 6))
  const stripes: [string, number][] = [[RED, 1], ['#FFFFFF', 1], ['#4B5FB8', 2], ['#FFFFFF', 1], [RED, 1]]
  let fy = 0.195
  for (const [c, n] of stripes) {
    const sh = (0.048 * n) / 6
    parts.push(P.box(0.066, sh, 0.004, c, { at: [-0.105, fy - sh / 2, 0.03] }))
    fy -= sh
  }
  // Plants in pots by the doors.
  for (const px of [-0.045, 0.04]) parts.push(P.cyl(0.008, 0.006, 0.012, '#E6A375', { at: [px, 0.006, 0.07] }, 6), P.sphere(0.012, LEAF[2], { at: [px, 0.022, 0.07] }, 6))
  return parts
}

/** ICONSIAM: the mall's folded glass front on the river (east, +x) and round the south side, the gold barrel roof,
 *  its two towers behind, the terrace with the fountain's bowl, a ferry pier. */
function iconsiamParts(): { lined: BufferGeometry[]; plain: BufferGeometry[] } {
  const lined: BufferGeometry[] = [
    // The mall.
    P.rbox(0.2, 0.075, 0.27, 0.012, '#FFF1D6', { at: [0, 0.0375, 0] }),
    P.cyl(0.1, 0.1, 0.27, '#FFDFA0', { at: [0, 0.072, 0], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.36] }, 16),
    // The two towers behind it.
    P.rbox(0.075, 0.4, 0.075, 0.012, '#CFE6FA', { at: [-0.085, 0.2, -0.07] }),
    P.prism([[-0.0375, 0], [0.0375, 0], [0.0375, 0.07]], 0.075, '#E3F1FF', { at: [-0.085, 0.398, -0.07] }),
    P.rbox(0.066, 0.29, 0.066, 0.012, '#E3DBFF', { at: [-0.09, 0.145, 0.075] }),
    P.rbox(0.046, 0.025, 0.046, 0.008, CREAM, { at: [-0.09, 0.3, 0.075] }),
    // The terrace on the river, the fountain's bowl, the ferry pier.
    P.rbox(0.1, 0.012, 0.31, 0.005, '#FFFDF6', { at: [0.15, 0.006, 0] }),
    P.cyl(0.034, 0.038, 0.014, CREAM, { at: [ICON_FOUNTAIN[0], 0.018, ICON_FOUNTAIN[1]] }, 14),
    P.rbox(0.07, 0.008, 0.03, 0.003, WOOD, { at: [0.225, 0.004, -0.09] }),
    // A pink star on the roof.
    P.sphere(0.02, PAL.hotpink, { at: [0.02, 0.118, 0], scale: [1, 1, 0.5] }, 5),
  ]
  const plain: BufferGeometry[] = [P.cyl(0.028, 0.028, 0.004, '#8FD8F2', { at: [ICON_FOUNTAIN[0], 0.026, ICON_FOUNTAIN[1]] }, 14)]
  // The folded glass: tall panes turned one way then the other, down the river side and round the south.
  for (let i = 0; i < 8; i++) lined.push(P.box(0.014, 0.078, 0.038, i % 2 ? '#9FD8F5' : '#DFF4FF', { at: [0.104, 0.044, -0.117 + i * 0.0335], rot: [0, i % 2 ? 0.6 : -0.6, 0] }))
  for (let i = 0; i < 6; i++) lined.push(P.box(0.038, 0.078, 0.014, i % 2 ? '#9FD8F5' : '#DFF4FF', { at: [-0.083 + i * 0.0335, 0.044, 0.139], rot: [0, i % 2 ? 0.6 : -0.6, 0] }))
  for (let fy = 0.06; fy < 0.39; fy += 0.05) plain.push(P.box(0.079, 0.008, 0.079, '#EEF7FF', { at: [-0.085, fy, -0.07] }))
  for (let fy = 0.06; fy < 0.28; fy += 0.05) plain.push(P.box(0.07, 0.008, 0.07, '#F3EEFF', { at: [-0.09, fy, 0.075] }))
  return { lined, plain }
}

// ---------------------------------------------------------------- toys to poke

/** A little gabled shed or shophouse (in a toy's own frame). */
function shed(x: number, z: number, w: number, d: number, h: number, wall: string, roof: string, yaw = 0): BufferGeometry[] {
  const rot: V3 = [0, yaw, 0]
  return [P.rbox(w, h, d, Math.min(w, d) * 0.1, wall, { at: [x, h / 2, z], rot }), P.prism([[-w / 2 - 0.008, 0], [w / 2 + 0.008, 0], [0, w * 0.42]], d + 0.012, roof, { at: [x, h - 0.002, z], rot })]
}

/** Asiatique: the old riverside warehouses, their bunting, the wheel's legs (the wheel itself turns: wheelParts). */
function asiatiqueParts(): BufferGeometry[] {
  return [
    ...[-0.1, -0.035, 0.03].flatMap((x, i) => shed(x + 0.03, 0.085, 0.058, 0.11, 0.045, CREAM, ['#F08A7A', '#F7A072', '#E88AA6'][i])),
    P.rbox(0.26, 0.008, 0.05, 0.003, WOOD, { at: [0, 0.004, 0.17] }),
    // The wheel's legs and its hub.
    rod([-0.05, 0, -0.02], [0.02, 0.165, -0.035], 0.012, CREAM),
    rod([0.09, 0, -0.02], [0.02, 0.165, -0.035], 0.012, CREAM),
    P.cyl(0.014, 0.014, 0.03, PAL.hotpink, { at: [0.02, 0.165, -0.02], rot: [Math.PI / 2, 0, 0] }, 10),
    // Bunting between two poles.
    ...[-0.13, 0.13].map((x) => P.cyl(0.003, 0.003, 0.08, CREAM, { at: [x, 0.04, 0.15] }, 4)),
    ...[0, 1, 2, 3, 4, 5, 6].map((i) => P.cone(0.009, 0.016, [PAL.pink, PAL.butter, PAL.mint, PAL.lavender][i % 4], { at: [-0.11 + i * 0.037, 0.068 - Math.sin((i / 6) * Math.PI) * 0.012, 0.15], rot: [Math.PI, 0, 0] }, 4)),
  ]
}

/** The big wheel: a white rim and spokes, a gondola in every color round it. It faces the south, turning about z. */
function wheelParts(): BufferGeometry[] {
  const r = 0.125
  const parts = [P.torus(r, 0.006, '#FFFFFF', {}), P.torus(r * 0.55, 0.004, '#F4E9FF', {})]
  const cols = [PAL.pink, PAL.butter, PAL.mint, PAL.lavender, PAL.sky, PAL.peach, PAL.hotpink, '#FFFFFF']
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    parts.push(P.box(r * 2, 0.004, 0.004, '#FFFFFF', { rot: [0, 0, a / 2] }), P.sphere(0.018, cols[i], { at: [Math.cos(a) * r, Math.sin(a) * r, 0], scale: [1, 1, 0.8] }, 8))
  }
  return parts
}

/** Chinatown: the red gate with its stacked gold roofs, shophouses with bright signs hanging out over the street. */
function chinatownParts(): BufferGeometry[] {
  const parts: BufferGeometry[] = [
    // The gate.
    ...[-0.06, 0.06].map((x) => P.cyl(0.011, 0.012, 0.13, RED, { at: [x, 0.065, 0.07] }, 8)),
    ...[-0.06, 0.06].map((x) => P.rbox(0.03, 0.012, 0.03, 0.004, CREAM, { at: [x, 0.006, 0.07] })),
    P.box(0.17, 0.016, 0.022, RED, { at: [0, 0.128, 0.07] }),
    P.rbox(0.06, 0.022, 0.008, 0.003, GOLD, { at: [0, 0.112, 0.082] }),
    P.prism([[-0.12, 0], [0.12, 0], [0.085, 0.03], [-0.085, 0.03]], 0.05, RED, { at: [0, 0.136, 0.07] }),
    P.box(0.15, 0.008, 0.03, PAL.mint, { at: [0, 0.169, 0.07] }),
    P.prism([[-0.075, 0], [0.075, 0], [0.045, 0.026], [-0.045, 0.026]], 0.04, RED, { at: [0, 0.173, 0.07] }),
    ...[-1, 1].flatMap((s) => [P.cone(0.007, 0.03, GOLD, { at: [s * 0.123, 0.146, 0.07], rot: [0, 0, -s * 1.0] }, 5), P.cone(0.006, 0.024, GOLD, { at: [s * 0.078, 0.183, 0.07], rot: [0, 0, -s * 1.0] }, 5)]),
    P.sphere(0.009, GOLD, { at: [0, 0.204, 0.07] }, 6),
  ]
  // Shophouses behind, each with a sign hanging out.
  const paint = ['#FFE9D9', '#FFD9E6', '#FFF4CF', '#E7E0FF']
  const signs = [PAL.hotpink, PAL.gold, PAL.mint, RED]
  for (let i = 0; i < 4; i++) {
    const x = -0.105 + i * 0.07
    const h = 0.085 + (i % 2) * 0.025
    parts.push(P.rbox(0.064, h, 0.07, 0.006, paint[i], { at: [x, h / 2, -0.04] }), P.box(0.07, 0.008, 0.076, CREAM, { at: [x, h + 0.002, -0.04] }))
    parts.push(P.rbox(0.012, 0.05, 0.022, 0.003, signs[i], { at: [x + 0.024, h * 0.62, 0.008] }), ...[-0.014, 0.014].map((wx) => P.box(0.016, 0.02, 0.005, '#DDF3FF', { at: [x + wx - 0.008, h - 0.022, -0.003] })))
  }
  // Street food out front: three carts under bright umbrellas.
  const brollies: [number, number, string][] = [[-0.135, 0.125, PAL.butter], [0.135, 0.12, PAL.mint], [0.105, 0.17, PAL.hotpink]]
  for (const [x, z, c] of brollies) {
    parts.push(
      P.rbox(0.03, 0.016, 0.02, 0.003, CREAM, { at: [x, 0.012, z] }),
      P.cyl(0.0018, 0.0018, 0.05, CREAM, { at: [x, 0.03, z] }, 4),
      P.cone(0.03, 0.016, c, { at: [x, 0.062, z] }, 8),
      P.sphere(0.004, '#FFFFFF', { at: [x, 0.071, z] }, 5),
    )
  }
  return parts
}

/** The string of red lanterns across the gate (it swings from its middle). */
function lanternParts(): BufferGeometry[] {
  const parts: BufferGeometry[] = []
  for (let i = 0; i < 5; i++) {
    const x = -0.048 + i * 0.024
    const y = -0.012 - Math.sin((i / 4) * Math.PI) * 0.012
    parts.push(P.sphere(0.0095, RED, { at: [x, y, 0], scale: [1, 1.1, 1] }, 7), P.cyl(0.004, 0.004, 0.004, GOLD, { at: [x, y + 0.011, 0] }, 5), P.cyl(0.0015, 0.0015, 0.012, GOLD, { at: [x, y - 0.015, 0] }, 4))
  }
  return parts
}

/** Lumphini Park: a little white bandstand and a few big trees beside the lake. */
function lumphiniParts(): BufferGeometry[] {
  return [
    P.cyl(0.035, 0.04, 0.012, CREAM, { at: [-0.1, 0.006, -0.02] }, 10),
    ...[0, 1, 2, 3, 4, 5].map((i) => P.cyl(0.003, 0.003, 0.04, CREAM, { at: [-0.1 + Math.cos(i * 1.047) * 0.028, 0.03, -0.02 + Math.sin(i * 1.047) * 0.028] }, 4)),
    P.cone(0.045, 0.03, PAL.pink, { at: [-0.1, 0.065, -0.02] }, 10),
    ...roundTree(0.12, 0, -0.04, 0.7, 0),
    ...roundTree(-0.15, 0, 0.05, 0.6, 1),
    ...roundTree(0.14, 0, 0.06, 0.55, 2),
  ]
}

/** A swan boat (its nose along +z). */
function swanParts(): BufferGeometry[] {
  return [
    P.sphere(0.022, '#FFFFFF', { at: [0, 0.012, 0], scale: [0.9, 0.6, 1.5] }, 10),
    P.cyl(0.005, 0.006, 0.03, '#FFFFFF', { at: [0, 0.03, 0.026], rot: [0.35, 0, 0] }, 6),
    P.sphere(0.008, '#FFFFFF', { at: [0, 0.046, 0.034] }, 7),
    P.cone(0.004, 0.012, '#FF9A4D', { at: [0, 0.045, 0.045], rot: [Math.PI / 2, 0, 0] }, 5),
    P.sphere(0.0022, '#2B2330', { at: [0.005, 0.049, 0.038] }, 4),
    P.sphere(0.0022, '#2B2330', { at: [-0.005, 0.049, 0.038] }, 4),
    ...[-1, 1].map((s) => P.sphere(0.014, '#F4F1FA', { at: [s * 0.014, 0.02, -0.008], scale: [0.4, 0.8, 1.3] }, 7)),
    P.box(0.02, 0.004, 0.02, PAL.pink, { at: [0, 0.022, -0.004] }),
  ]
}

/** Lumphini's monitor lizard: long, green-grey and friendly, a pink tongue (its nose along +z). */
function lizardParts(): BufferGeometry[] {
  const c = '#9CCBA8'
  return [
    P.sphere(0.016, c, { at: [0, 0.012, 0], scale: [1, 0.7, 2.3] }, 10),
    P.sphere(0.011, c, { at: [0, 0.014, 0.04], scale: [1, 0.8, 1.5] }, 8),
    P.cone(0.01, 0.07, c, { at: [0.008, 0.009, -0.062], rot: [-Math.PI / 2, 0.25, 0] }, 6),
    ...[[-1, 0.02], [1, 0.02], [-1, -0.02], [1, -0.02]].map(([s, z]) => P.sphere(0.006, '#86BC96', { at: [s * 0.018, 0.005, z], scale: [1.5, 0.7, 1] }, 5)),
    ...[-1, 1].map((s) => P.sphere(0.003, '#2B2330', { at: [s * 0.007, 0.021, 0.046] }, 4)),
    P.box(0.003, 0.002, 0.016, PAL.hotpink, { at: [0, 0.011, 0.062] }),
    ...[0, 1, 2].map((i) => P.sphere(0.004, '#C9E9C4', { at: [0, 0.022, -0.016 + i * 0.016], scale: [1.4, 0.5, 1.4] }, 5)),
  ]
}

/** Central Rama 3: a big cream building with a round corner, a lavender band and glass doors. (Kept plain on purpose:
 *  "the mall" she goes to is ICONSIAM, and a shopping bag on this roof looked more like a mall than the mall did.) */
function mallParts(): BufferGeometry[] {
  return [
    P.rbox(0.2, 0.085, 0.14, 0.012, CREAM, { at: [0, 0.0425, 0] }),
    P.cyl(0.05, 0.05, 0.1, '#FFE9DC', { at: [0.1, 0.05, 0.06] }, 14),
    P.box(0.204, 0.014, 0.144, PAL.lavender, { at: [0, 0.072, 0] }),
    P.cyl(0.052, 0.052, 0.014, PAL.lavender, { at: [0.1, 0.085, 0.06] }, 14),
    P.rbox(0.07, 0.04, 0.008, 0.003, '#BFE2FA', { at: [-0.02, 0.022, 0.071] }),
    P.box(0.09, 0.006, 0.03, PAL.butter, { at: [-0.02, 0.048, 0.085], rot: [0.3, 0, 0] }),
    // Cars parked outside.
    ...[0, 1, 2].map((i) => P.rbox(0.022, 0.012, 0.014, 0.004, [PAL.sky, PAL.mint, PAL.lavender][i], { at: [-0.085 + i * 0.03, 0.006, 0.11] })),
  ]
}

/** Pak Khlong Talat, the flower market: stalls under striped awnings, heaps of flowers in every color. */
function flowerParts(): BufferGeometry[] {
  const parts: BufferGeometry[] = []
  const blooms = [PAL.hotpink, PAL.butter, '#FFFFFF', PAL.lavenderDark, '#FF9A4D', PAL.pink]
  for (let s = 0; s < 3; s++) {
    const x = -0.09 + s * 0.09
    const z = s === 1 ? -0.03 : 0.02
    parts.push(P.rbox(0.07, 0.022, 0.045, 0.004, WOOD, { at: [x, 0.011, z] }))
    for (const [px, pz] of [[-0.03, -0.02], [0.03, -0.02], [-0.03, 0.02], [0.03, 0.02]]) parts.push(P.cyl(0.0025, 0.0025, 0.07, CREAM, { at: [x + px, 0.035, z + pz] }, 4))
    for (let k = 0; k < 4; k++) parts.push(P.box(0.02, 0.005, 0.06, k % 2 ? '#FFFFFF' : [PAL.pink, PAL.butter, PAL.mint][s], { at: [x - 0.03 + k * 0.02, 0.073, z], rot: [0, 0, 0] }))
    for (let k = 0; k < 9; k++) parts.push(P.sphere(0.008 + (k % 3) * 0.002, blooms[(k + s * 2) % blooms.length], { at: [x - 0.024 + (k % 3) * 0.024, 0.027 + (k % 2) * 0.004, z - 0.012 + Math.floor(k / 3) * 0.012] }, 6))
  }
  // Buckets of flowers out front.
  for (let k = 0; k < 5; k++) {
    const x = -0.1 + k * 0.05
    parts.push(P.cyl(0.011, 0.008, 0.016, [PAL.sky, PAL.lavender, PAL.mint][k % 3], { at: [x, 0.008, 0.075] }, 7))
    for (let j = 0; j < 3; j++) parts.push(P.sphere(0.007, blooms[(k + j) % blooms.length], { at: [x + (j - 1) * 0.007, 0.022 + (j % 2) * 0.005, 0.075] }, 5))
  }
  return parts
}

/** How high the crane's box hangs when it's all the way up (in the port toy's frame). */
export const CRANE_BOX_Y = 0.13

/** The port: a big pink and white crane reaching out over the river, stacks of bright boxes on the quay. */
function portParts(): BufferGeometry[] {
  const parts: BufferGeometry[] = [P.rbox(0.28, 0.01, 0.13, 0.004, '#FFFDF6', { at: [0, 0.005, 0] })]
  // The crane: four legs, a beam across, a long arm out toward the water (+z).
  for (const [x, z] of [[-0.06, -0.03], [0.02, -0.03], [-0.06, 0.03], [0.02, 0.03]]) parts.push(P.box(0.008, 0.17, 0.008, PAL.hotpink, { at: [x, 0.085, z] }))
  parts.push(P.box(0.1, 0.012, 0.075, CREAM, { at: [-0.02, 0.172, 0] }), P.box(0.014, 0.014, 0.26, PAL.hotpink, { at: [-0.02, 0.185, 0.05] }), P.rbox(0.03, 0.026, 0.03, 0.005, '#BFE2FA', { at: [-0.02, 0.165, 0.03] }))
  parts.push(rod([-0.02, 0.25, -0.02], [-0.02, 0.19, 0.17], 0.004, CREAM), rod([-0.02, 0.25, -0.02], [-0.02, 0.19, -0.07], 0.004, CREAM), P.box(0.008, 0.07, 0.008, PAL.hotpink, { at: [-0.02, 0.22, -0.02] }))
  // The boxes.
  const cols = [PAL.sky, PAL.butter, PAL.mint, PAL.lavender, PAL.peach, PAL.pink]
  let n = 0
  for (let ix = 0; ix < 2; ix++)
    for (let iz = 0; iz < 2; iz++)
      for (let iy = 0; iy < (ix + iz === 1 ? 3 : 2); iy++) parts.push(P.rbox(0.05, 0.024, 0.026, 0.004, cols[n++ % cols.length], { at: [0.07 + ix * 0.054, 0.022 + iy * 0.025, -0.035 + iz * 0.03] }))
  return parts
}

/** Bang Krachao: the wooden bird tower in the park, a bicycle leaning on it, palms. */
function krachaoParts(): BufferGeometry[] {
  const wheel = (x: number) => P.torus(0.014, 0.0025, '#5E5468', { at: [x, 0.016, 0.07] })
  return [
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => P.cyl(0.005, 0.006, 0.15, WOOD_DARK, { at: [a * 0.028, 0.075, b * 0.028] }, 5)),
    P.rbox(0.085, 0.01, 0.085, 0.003, WOOD, { at: [0, 0.075, 0] }),
    P.rbox(0.095, 0.01, 0.095, 0.003, WOOD, { at: [0, 0.15, 0] }),
    ...[-1, 1].map((s) => P.box(0.09, 0.004, 0.004, WOOD_DARK, { at: [0, 0.175, s * 0.045] })),
    P.cone(0.075, 0.045, '#E9C98F', { at: [0, 0.215, 0] }, 4),
    rod([0.04, 0, 0.04], [0.04, 0.075, 0.005], 0.004, WOOD_DARK, 0.016),
    // The bicycle.
    wheel(-0.075),
    wheel(-0.04),
    rod([-0.075, 0.016, 0.07], [-0.058, 0.034, 0.07], 0.003, PAL.hotpink),
    rod([-0.058, 0.034, 0.07], [-0.04, 0.016, 0.07], 0.003, PAL.hotpink),
    rod([-0.045, 0.04, 0.07], [-0.04, 0.016, 0.07], 0.003, PAL.hotpink),
    P.box(0.012, 0.003, 0.006, '#2B2330', { at: [-0.06, 0.037, 0.07] }),
    ...palm(0.1, 0, -0.03, 0.34, 0.8),
    ...palm(-0.11, 0, -0.05, 0.4, 2.6),
    ...clump(0.08, 0, 0.08, 0.8, 1),
  ]
}

/** One of Bang Krachao's little birds (its nose along +z). */
function birdParts(i: number): BufferGeometry[] {
  const c = [PAL.sky, PAL.butter, PAL.pink][i % 3]
  return [
    P.sphere(0.009, c, { scale: [1, 0.9, 1.4] }, 7),
    P.sphere(0.006, c, { at: [0, 0.006, 0.01] }, 6),
    P.cone(0.0025, 0.007, '#FF9A4D', { at: [0, 0.006, 0.018], rot: [Math.PI / 2, 0, 0] }, 4),
    ...[-1, 1].map((s) => P.sphere(0.008, tint(c, 0.35), { at: [s * 0.009, 0.002, 0], scale: [1.4, 0.25, 0.9] }, 5)),
  ]
}

/** The night market's ground: a cream yard, its gate strung with lights, a food cart (the tents are tentRowParts). */
function tentsParts(): BufferGeometry[] {
  const lights = [PAL.hotpink, PAL.butter, PAL.mint, PAL.sky, PAL.lavenderDark]
  return [
    P.rbox(0.36, 0.008, 0.3, 0.004, '#FFFDF6', { at: [0, 0.004, 0] }),
    // The gate: two posts, a sign across, a string of lights under it.
    ...[-1, 1].map((s) => P.cyl(0.006, 0.007, 0.11, PAL.hotpink, { at: [s * 0.1, 0.055, 0.15] }, 6)),
    P.rbox(0.23, 0.03, 0.012, 0.005, PAL.butter, { at: [0, 0.115, 0.15] }),
    ...[0, 1, 2, 3, 4, 5, 6].map((i) => P.sphere(0.008, lights[i % lights.length], { at: [-0.084 + i * 0.028, 0.088 - Math.sin((i / 6) * Math.PI) * 0.012, 0.15] }, 6)),
    // A cart by the gate, a pot steaming on it.
    P.rbox(0.045, 0.026, 0.03, 0.004, PAL.sky, { at: [0.15, 0.02, 0.13] }),
    P.cyl(0.011, 0.009, 0.014, '#C8BEDD', { at: [0.15, 0.04, 0.13] }, 7),
    P.sphere(0.009, '#FFFFFF', { at: [0.152, 0.058, 0.128] }, 5),
    ...[-1, 1].map((s) => P.cyl(0.008, 0.008, 0.005, '#5E5468', { at: [0.15 + s * 0.016, 0.008, 0.147], rot: [Math.PI / 2, 0, 0] }, 7)),
  ]
}

/** One row of the night market's tents: four stalls, each under its own pointed roof, every roof another color. */
function tentRowParts(row: number): BufferGeometry[] {
  const cols = [PAL.hotpink, PAL.butter, PAL.mint, PAL.sky, PAL.lavenderDark, '#FF9A4D', PAL.pink]
  const parts: BufferGeometry[] = []
  for (let i = 0; i < 4; i++) {
    const x = -0.117 + i * 0.078
    parts.push(
      P.rbox(0.05, 0.03, 0.044, 0.005, CREAM, { at: [x, 0.015, 0] }),
      P.cone(0.05, 0.04, cols[(i + row * 3) % cols.length], { at: [x, 0.056, 0], rot: [0, Math.PI / 4, 0] }, 4),
      P.sphere(0.006, '#FFFFFF', { at: [x, 0.079, 0] }, 5),
    )
  }
  return parts
}

/** Where the floating market's boats are moored (in the toy's frame): [east, south, which way the nose points]. */
const MARKET_BOATS: [number, number, number][] = [[-0.115, 0.035, 0.5], [-0.04, 0.07, -0.3], [0.045, 0.04, 0.35], [0.12, 0.075, -0.5]]

/** A wooden house on stilts over the water: teak walls, a steep terracotta roof. */
function stiltHouse(x: number, z: number, wall: string): BufferGeometry[] {
  return [
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => P.cyl(0.004, 0.004, 0.03, WOOD_DARK, { at: [x + a * 0.03, 0.015, z + b * 0.022] }, 4)),
    P.rbox(0.08, 0.006, 0.062, 0.002, WOOD, { at: [x, 0.032, z] }),
    P.rbox(0.07, 0.04, 0.05, 0.004, wall, { at: [x, 0.055, z] }),
    P.prism([[-0.044, 0], [0.044, 0], [0, 0.045]], 0.062, ROOFS[0], { at: [x, 0.073, z] }),
    P.box(0.016, 0.022, 0.004, '#9A6B4F', { at: [x, 0.046, z + 0.026] }),
  ]
}

/** The floating market's bank: two stilt houses, the jetty along the water, bunting, a banana tree. (The boats are
 *  marketBoatParts; the water is painted: diorama `basins`.) */
function floatingParts(): BufferGeometry[] {
  return [
    ...stiltHouse(-0.085, -0.07, '#E9B98A'),
    ...stiltHouse(0.06, -0.08, '#F2CFA0'),
    P.rbox(0.3, 0.008, 0.03, 0.003, WOOD, { at: [0, 0.02, -0.022] }),
    ...[-0.13, -0.045, 0.045, 0.13].map((x) => P.cyl(0.004, 0.004, 0.024, WOOD_DARK, { at: [x, 0.01, -0.012] }, 4)),
    ...[-0.15, 0.15].map((x) => P.cyl(0.003, 0.003, 0.085, CREAM, { at: [x, 0.062, -0.03] }, 4)),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => P.cone(0.009, 0.016, [PAL.pink, PAL.butter, PAL.mint, PAL.lavender][i % 4], { at: [-0.131 + i * 0.0375, 0.094 - Math.sin((i / 7) * Math.PI) * 0.014, -0.03], rot: [Math.PI, 0, 0] }, 4)),
    ...palm(0.165, 0, -0.085, 0.36, 0.6),
    ...palm(-0.175, 0, -0.06, 0.3, 2.4),
  ]
}

/** One of the floating market's boats (its nose along +z): a little wooden sampan heaped with fruit or flowers, the
 *  seller's straw hat at the back, a big round umbrella over it all. */
function marketBoatParts(i: number): BufferGeometry[] {
  const brolly = [PAL.hotpink, PAL.butter, PAL.mint, '#FF9A4D'][i % 4]
  const loads = [['#FF9A4D', PAL.butter, '#FF9A4D'], [PAL.hotpink, '#FFFFFF', PAL.lavenderDark], ['#8FDB8A', PAL.butter, '#8FDB8A'], ['#F0576B', '#FF9A4D', PAL.butter]][i % 4]
  return [
    P.rbox(0.04, 0.015, 0.12, 0.007, '#D9A072', { at: [0, 0.008, 0] }),
    P.box(0.042, 0.004, 0.1, '#B98A66', { at: [0, 0.014, 0] }),
    ...[0, 1, 2, 3, 4].map((k) => P.sphere(0.01, loads[k % 3], { at: [(k % 2 ? 1 : -1) * 0.007, 0.022 + (k % 2 ? 0.006 : 0), 0.04 - k * 0.014] }, 6)),
    P.sphere(0.011, PAL.pink, { at: [0, 0.026, -0.04], scale: [1, 1.2, 1] }, 7),
    P.cone(0.019, 0.011, '#F2DCA6', { at: [0, 0.044, -0.04] }, 9),
    P.cyl(0.0018, 0.0018, 0.06, CREAM, { at: [0, 0.045, 0.004] }, 4),
    P.cone(0.042, 0.02, brolly, { at: [0, 0.082, 0.004] }, 10),
    P.sphere(0.005, '#FFFFFF', { at: [0, 0.094, 0.004] }, 5),
  ]
}

/** An orange tree: round and leafy, oranges all over it. */
function orangeTree(x: number, z: number, s: number, k: number): BufferGeometry[] {
  const dots: [number, number, number][] = [[0.03, 0.12, 0.045], [-0.035, 0.1, 0.04], [0.0, 0.085, 0.056], [0.045, 0.09, 0.02], [-0.01, 0.14, 0.04], [-0.05, 0.125, 0.01]]
  return [...roundTree(x, 0, z, s, k), ...dots.map(([dx, dy, dz]) => P.sphere(0.011 * s, '#FF9A4D', { at: [x + dx * s, dy * s, z + dz * s] }, 6))]
}

/** Bang Mot's orange orchard: two rows of orange trees, the farmer's wooden house on stilts, baskets of oranges and
 *  a wheelbarrow out front. */
function orchardParts(): BufferGeometry[] {
  const parts: BufferGeometry[] = []
  for (let r = 0; r < 2; r++) for (let i = 0; i < 3; i++) parts.push(...orangeTree(-0.14 + i * 0.1, -0.075 + r * 0.095, 0.82 + ((i + r) % 2) * 0.1, i + r))
  parts.push(...stiltHouse(0.16, -0.045, '#E9B98A'))
  // Baskets heaped with oranges.
  for (const [bx, bz] of [[0.12, 0.07], [0.165, 0.085]]) {
    parts.push(P.cyl(0.017, 0.013, 0.016, '#E6C28A', { at: [bx, 0.008, bz] }, 8))
    for (let k = 0; k < 4; k++) parts.push(P.sphere(0.008, '#FF9A4D', { at: [bx + Math.cos(k * 1.6) * 0.007, 0.02 + (k === 3 ? 0.008 : 0), bz + Math.sin(k * 1.6) * 0.007] }, 5))
  }
  // The wheelbarrow.
  parts.push(P.rbox(0.034, 0.014, 0.024, 0.004, PAL.sky, { at: [0.06, 0.02, 0.1] }), P.cyl(0.009, 0.009, 0.005, '#5E5468', { at: [0.04, 0.009, 0.1], rot: [Math.PI / 2, 0, 0] }, 8), rod([0.075, 0.022, 0.092], [0.098, 0.03, 0.092], 0.003, WOOD_DARK), rod([0.075, 0.022, 0.108], [0.098, 0.03, 0.108], 0.003, WOOD_DARK))
  parts.push(P.sphere(0.008, '#FF9A4D', { at: [0.056, 0.031, 0.098] }, 5), P.sphere(0.008, '#FF9A4D', { at: [0.066, 0.031, 0.103] }, 5))
  return parts
}

// ---------------------------------------------------------------- what moves

/** One of the traffic's little cars (driving along +z). White where a car's own color goes (the instance's color
 *  tints it), dark wheels. */
function carParts(): BufferGeometry[] {
  return [
    P.rbox(0.044, 0.02, 0.085, 0.008, '#FFFFFF', { at: [0, 0.02, 0] }),
    P.rbox(0.038, 0.016, 0.042, 0.007, '#DDF3FF', { at: [0, 0.037, -0.004] }),
    ...[[-1, 0.026], [1, 0.026], [-1, -0.028], [1, -0.028]].map(([sd, z]) => P.cyl(0.009, 0.009, 0.008, '#5E5468', { at: [sd * 0.021, 0.009, z], rot: [0, 0, Math.PI / 2] }, 7)),
  ]
}

/** Khlong Saen Saep's boat (racing along +z): long, low and wooden, a pink stripe, blue covers down both sides, the
 *  roof on its posts. */
function canalBoatParts(): BufferGeometry[] {
  return [
    P.rbox(0.036, 0.02, 0.19, 0.009, '#E6A375', { at: [0, 0.01, 0] }),
    P.box(0.038, 0.005, 0.17, PAL.hotpink, { at: [0, 0.016, 0] }),
    P.cone(0.018, 0.036, '#E6A375', { at: [0, 0.011, 0.108], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.55] }, 6),
    ...[-1, 1].map((s) => P.box(0.003, 0.016, 0.13, PAL.sky, { at: [s * 0.018, 0.03, -0.005] })),
    P.rbox(0.04, 0.005, 0.14, 0.002, '#FFFFFF', { at: [0, 0.046, -0.005] }),
    ...[[-1, 0.05], [1, 0.05], [-1, -0.06], [1, -0.06]].map(([s, z]) => P.cyl(0.002, 0.002, 0.026, '#FFFFFF', { at: [s * 0.016, 0.034, z] }, 4)),
    ...[0, 1, 2].map((i) => P.sphere(0.006, [PAL.butter, PAL.mint, PAL.lavender][i], { at: [0, 0.028, 0.03 - i * 0.03] }, 5)),
  ]
}

/** One car of the skytrain (driving along +z): white, a blue and pink stripe, windows down the sides. */
function trainCar(front: boolean, back: boolean): BufferGeometry[] {
  return [
    P.rbox(0.032, 0.03, 0.09, 0.009, '#FFFFFF', { at: [0, 0.024, 0] }),
    P.box(0.034, 0.006, 0.084, '#7CC4F2', { at: [0, 0.014, 0] }),
    P.box(0.034, 0.004, 0.084, PAL.hotpink, { at: [0, 0.02, 0] }),
    P.box(0.0335, 0.009, 0.07, '#9FC8EE', { at: [0, 0.03, 0] }),
    ...(front ? [P.box(0.022, 0.01, 0.004, '#9FC8EE', { at: [0, 0.03, 0.0445] })] : []),
    ...(back ? [P.box(0.022, 0.01, 0.004, '#9FC8EE', { at: [0, 0.03, -0.0445] })] : []),
  ]
}

/** The Chao Phraya express boat: long and white, an orange stripe, a roof on posts, its orange flag at the back
 *  (sailing along +z). */
function expressParts(): BufferGeometry[] {
  return [
    P.rbox(0.04, 0.022, 0.2, 0.01, '#FFFFFF', { at: [0, 0.01, 0] }),
    P.box(0.041, 0.006, 0.18, '#FF9A4D', { at: [0, 0.014, 0] }),
    P.cone(0.02, 0.04, '#FFFFFF', { at: [0, 0.011, 0.115], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.55] }, 6),
    P.rbox(0.042, 0.006, 0.14, 0.003, '#FF9A4D', { at: [0, 0.05, -0.01] }),
    ...[[-1, 0.05], [1, 0.05], [-1, -0.07], [1, -0.07]].map(([s, z]) => P.cyl(0.002, 0.002, 0.03, '#FFFFFF', { at: [s * 0.017, 0.034, z] }, 4)),
    ...[0, 1, 2, 3].map((i) => P.sphere(0.006, [PAL.pink, PAL.butter, PAL.mint, PAL.lavender][i], { at: [0, 0.03, 0.04 - i * 0.03] }, 5)),
    P.cyl(0.002, 0.002, 0.05, '#FFFFFF', { at: [0, 0.075, -0.09] }, 4),
    P.prism([[0, 0], [0.03, 0.01], [0, 0.02]], 0.003, '#FF9A4D', { at: [0, 0.08, -0.09], rot: [0, Math.PI / 2, 0] }),
  ]
}

/** A fruit seller's boat on the khlong (paddling along +z): a little wooden sampan heaped with fruit, the seller in
 *  her wide straw hat at the back, a paddle over the side. */
function fruitBoatParts(): BufferGeometry[] {
  const fruit = ['#FF9A4D', PAL.butter, '#8FDB8A', PAL.hotpink, '#FF9A4D', PAL.butter]
  return [
    P.rbox(0.042, 0.016, 0.13, 0.008, '#D9A072', { at: [0, 0.008, 0] }),
    P.box(0.044, 0.004, 0.11, '#B98A66', { at: [0, 0.015, 0] }),
    ...fruit.map((c, i) => P.sphere(0.011, c, { at: [(i % 2 ? 1 : -1) * 0.008, 0.024 + (i % 3 === 1 ? 0.008 : 0), 0.044 - i * 0.012] }, 6)),
    // The seller: a round pink body, a wide straw hat.
    P.sphere(0.012, PAL.pink, { at: [0, 0.028, -0.042], scale: [1, 1.2, 1] }, 7),
    P.cone(0.022, 0.012, '#F2DCA6', { at: [0, 0.048, -0.042] }, 10),
    rod([0.014, 0.034, -0.04], [0.034, 0.002, -0.07], 0.003, '#B98A66', 0.006),
  ]
}

/** A Bangkok taxi (driving along +z): hot pink all over, its sign on the roof. */
function taxiParts(): BufferGeometry[] {
  return [
    P.rbox(0.05, 0.022, 0.1, 0.009, PAL.hotpink, { at: [0, 0.022, 0] }),
    P.rbox(0.044, 0.02, 0.052, 0.008, '#DDF3FF', { at: [0, 0.042, -0.004] }),
    P.rbox(0.046, 0.006, 0.05, 0.003, PAL.hotpink, { at: [0, 0.054, -0.004] }),
    P.rbox(0.02, 0.008, 0.01, 0.002, PAL.butter, { at: [0, 0.061, -0.004] }),
    ...[[-1, 0.03], [1, 0.03], [-1, -0.032], [1, -0.032]].map(([sd, z]) => P.cyl(0.011, 0.011, 0.008, '#5E5468', { at: [sd * 0.025, 0.011, z], rot: [0, 0, Math.PI / 2] }, 8)),
    ...[-1, 1].map((sd) => P.sphere(0.004, '#FFF7C9', { at: [sd * 0.016, 0.024, 0.05] }, 5)),
  ]
}

/** The little tug that pulls the rice barges (along +z). */
function tugParts(): BufferGeometry[] {
  return [
    P.rbox(0.04, 0.024, 0.08, 0.01, PAL.hotpink, { at: [0, 0.01, 0] }),
    P.rbox(0.026, 0.024, 0.03, 0.006, '#FFFFFF', { at: [0, 0.032, -0.008] }),
    P.cyl(0.007, 0.007, 0.03, PAL.butter, { at: [0, 0.055, -0.014] }, 6),
    P.box(0.027, 0.008, 0.004, '#9FC8EE', { at: [0, 0.036, 0.008] }),
  ]
}

// ---------------------------------------------------------------- trees

/** A round leafy tree. */
function roundTree(x: number, y: number, z: number, s: number, k: number): BufferGeometry[] {
  return [
    P.cyl(0.012 * s, 0.016 * s, 0.07 * s, '#B98A66', { at: [x, y + 0.035 * s, z] }, 5),
    P.sphere(0.058 * s, LEAF[k % 3], { at: [x, y + 0.105 * s, z], scale: [1, 0.9, 1] }, 8),
    P.sphere(0.036 * s, LEAF[(k + 1) % 3], { at: [x + 0.026 * s, y + 0.15 * s, z + 0.006 * s] }, 6),
  ]
}

/** A clump of jungle: three treetops, no trunks to see. */
function clump(x: number, y: number, z: number, s: number, k: number): BufferGeometry[] {
  return [
    P.sphere(0.1 * s, LEAF[k % 3], { at: [x, y + 0.055 * s, z], scale: [1.1, 0.8, 1] }, 8),
    P.sphere(0.075 * s, LEAF[(k + 1) % 3], { at: [x + 0.075 * s, y + 0.1 * s, z + 0.03 * s], scale: [1, 0.8, 1] }, 7),
    P.sphere(0.062 * s, LEAF[(k + 2) % 3], { at: [x - 0.06 * s, y + 0.08 * s, z - 0.045 * s] }, 7),
  ]
}

/** A coconut palm: a leaning trunk in two pieces, six fronds. */
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

// ---------------------------------------------------------------- landmarks (to look at, never toys)

/** Wat Arun's stone: warm ivory, a shade for the steps. */
const STONE = '#FFF4E6'
const STONE_SHADE = '#F1E2D4'
/** The porcelain set into Wat Arun's prangs: little flowers of broken china in every color (the app's pastels). */
const CHINA = [PAL.pink, PAL.sky, PAL.mint, PAL.butter, PAL.lavenderDark, '#FFFFFF']
const TEMPLE_GOLD = '#FFC94D'
const ROOF_ORANGE = '#F47B45'
const ROOF_GREEN = '#3DB27F'
const LAWN = '#A9DEA6'

/** A prang, the tall corncob tower of Wat Arun: three stepped plinths, then a body in rings that swells and narrows
 *  to a point, each ring's lip set with dots of porcelain, a gold tip. Its foot at (x, y, z), about `h` tall.
 *  `stairs`: the steep stairs up its four sides (the big one). */
function prang(x: number, y: number, z: number, h: number, k: number, stairs = false): { lined: BufferGeometry[]; plain: BufferGeometry[] } {
  const lined: BufferGeometry[] = []
  const plain: BufferGeometry[] = []
  const r0 = h * 0.135
  let yy = y
  for (let i = 0; i < 3; i++) {
    const ph = h * 0.055
    const r = r0 * (1.75 - i * 0.25)
    lined.push(P.cyl(r * 0.94, r, ph, i % 2 ? STONE_SHADE : STONE, { at: [x, yy + ph / 2, z], rot: [0, Math.PI / 8, 0] }, 8))
    // A band of porcelain round each step.
    plain.push(P.cyl(r * 0.97, r * 0.99, ph * 0.28, CHINA[(i + k) % 5], { at: [x, yy + ph * 0.55, z], rot: [0, Math.PI / 8, 0] }, 8))
    yy += ph
  }
  if (stairs)
    for (let a = 0; a < 4; a++) {
      const [ux, uz] = [Math.sin((a * Math.PI) / 2), Math.cos((a * Math.PI) / 2)]
      const foot = r0 * 1.9
      const top = r0 * 0.9
      lined.push(rod([x + ux * foot, y, z + uz * foot], [x + ux * top, yy + h * 0.12, z + uz * top], 0.006, STONE_SHADE, r0 * 0.4))
    }
  // The body: rings that swell a little, then narrow fast to the tip (the corncob). One turned shape, so its ink
  // line only runs round the outside; each ring's lip is a pastel band set with dots of porcelain.
  const n = 9
  const body = h * 0.7
  const rad = (t: number) => r0 * (0.06 + 0.98 * Math.pow(1 - Math.pow(t, 1.7), 0.6))
  const prof: Vector2[] = [new Vector2(0.0005, yy)]
  const lips: [number, number, number][] = []
  let by = yy
  for (let i = 0; i < n; i++) {
    const [t0, t1] = [i / n, (i + 1) / n]
    const rh = (body * (1.25 - 0.5 * ((i + 0.5) / n))) / n
    const lr = rad(t1) * 1.04
    prof.push(new Vector2(rad(t0) * 0.97, by), new Vector2(rad(t1) * 0.94, by + rh * 0.78), new Vector2(lr, by + rh * 0.8), new Vector2(lr, by + rh))
    lips.push([lr, by + rh * 0.9, rh])
    by += rh
  }
  prof.push(new Vector2(0.0005, by))
  lined.push(bake(new LatheGeometry(prof, 8, Math.PI / 8), STONE, { at: [x, 0, z] }, true))
  lips.forEach(([lr, ly, rh], i) => {
    plain.push(P.cyl(lr * 1.01, lr * 1.01, rh * 0.16, i % 2 ? '#FFD3E2' : '#DCD3FA', { at: [x, ly, z], rot: [0, Math.PI / 8, 0] }, 8))
    // (The little prangs get fewer, so they don't read as grey stripes from up above.)
    const dots = !stairs ? (i % 2 ? 0 : 4) : i < 6 ? 8 : 4
    for (let j = 0; j < dots; j++) {
      const a = (j / dots) * Math.PI * 2 + (i % 2) * 0.4
      plain.push(P.sphere(Math.max(0.0028, r0 * 0.08 * (1 - (i / n) * 0.6)), CHINA[(i + j + k) % CHINA.length], { at: [x + Math.cos(a) * lr * 0.93, ly - rh * 0.45, z + Math.sin(a) * lr * 0.93] }, 5))
    }
  })
  // The tip: a gold bead and a thin gold point.
  lined.push(P.cyl(r0 * 0.1, r0 * 0.14, h * 0.05, TEMPLE_GOLD, { at: [x, by + h * 0.025, z] }, 6), P.sphere(r0 * 0.13, TEMPLE_GOLD, { at: [x, by + h * 0.06, z] }, 7), P.cone(r0 * 0.07, h * 0.13, TEMPLE_GOLD, { at: [x, by + h * 0.13, z] }, 6))
  return { lined, plain }
}

/** Wat Arun, the Temple of Dawn, on the Thonburi bank (in its own frame, its foot at 0, the river to its east, +x):
 *  the tall prang on two square terraces, the four little prangs at the corners, a little pavilion on each side, a
 *  lawn with palms, and its pier on the river. */
function arunParts(): { lined: BufferGeometry[]; plain: BufferGeometry[] } {
  const lined: BufferGeometry[] = [
    P.rbox(0.31, 0.008, 0.3, 0.004, LAWN, { at: [0, 0.004, 0] }),
    P.rbox(0.27, 0.022, 0.27, 0.005, STONE, { at: [0, 0.019, 0] }),
    P.rbox(0.19, 0.022, 0.19, 0.005, STONE_SHADE, { at: [0, 0.041, 0] }),
    // The pier and its little roof on the river.
    P.rbox(0.05, 0.008, 0.09, 0.003, WOOD, { at: [0.2, 0.004, 0.04] }),
  ]
  const plain: BufferGeometry[] = []
  // White balustrades round the terraces, with porcelain set in them.
  for (const [w, y] of [[0.27, 0.03], [0.19, 0.052]] as const)
    for (let side = 0; side < 4; side++) {
      const along = side % 2 === 0
      const off = (side < 2 ? 1 : -1) * (w / 2 + 0.001)
      plain.push(P.box(along ? w : 0.004, 0.008, along ? 0.004 : w, '#FFFFFF', { at: [along ? 0 : off, y, along ? off : 0] }))
      for (let j = 0; j < 5; j++) {
        const t = (j - 2) * (w / 5.5)
        plain.push(P.sphere(0.004, CHINA[(j + side) % 5], { at: [along ? t : off * 1.02, y, along ? off * 1.02 : t] }, 5))
      }
    }
  const add = (b: { lined: BufferGeometry[]; plain: BufferGeometry[] }) => {
    lined.push(...b.lined)
    plain.push(...b.plain)
  }
  add(prang(0, 0.052, 0, 0.38, 0, true))
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(prang(sx * 0.105, 0.03, sz * 0.105, 0.15, sx + sz + 4))
  // The four little pavilions (mondops) between them: white, a stack of roofs, a gold point.
  for (const [mx, mz] of [[0, 0.118], [0, -0.118], [0.118, 0], [-0.118, 0]]) {
    lined.push(
      P.rbox(0.03, 0.03, 0.03, 0.004, STONE, { at: [mx, 0.045, mz] }),
      P.cone(0.026, 0.02, ROOF_GREEN, { at: [mx, 0.068, mz], rot: [0, Math.PI / 4, 0] }, 4),
      P.cone(0.018, 0.02, ROOF_ORANGE, { at: [mx, 0.08, mz], rot: [0, Math.PI / 4, 0] }, 4),
      P.cone(0.006, 0.03, TEMPLE_GOLD, { at: [mx, 0.1, mz] }, 5),
    )
  }
  lined.push(P.box(0.05, 0.004, 0.032, ROOF_ORANGE, { at: [0.21, 0.045, 0.07] }))
  plain.push(...[-1, 1].map((s) => P.cyl(0.0025, 0.0025, 0.04, CREAM, { at: [0.21 + s * 0.02, 0.024, 0.07] }, 4)))
  lined.push(...palm(-0.15, 0, 0.13, 0.32, 2.2), ...palm(0.15, 0, -0.14, 0.3, -0.6), ...roundTree(-0.155, 0, -0.13, 0.55, 1))
  return { lined, plain }
}

// ---------------------------------------------------------------- pins

/** How high a pin's head is over its point, and how wide. */
export const PIN = { head: 0.2, r: 0.15, top: 0.5, size: 1.2 }

/** A pin: a white point, a round pink head, and a toy of what she does at the place on top. */
function buildPin(id: PinId, bag: Bag): Pin {
  const root = new Group()
  const c = PAL.hotpink
  const top = PIN.head + 0.035
  root.add(solid(merge([
    P.cone(0.09, 0.19, c, { at: [0, 0.095, 0], rot: [Math.PI, 0, 0] }, 16),
    P.sphere(0.016, '#FFFFFF', { at: [0, 0.004, 0] }, 6),
    P.cyl(PIN.r, PIN.r * 0.8, 0.06, c, { at: [0, PIN.head, 0] }, 28),
    // (A white rim: the city round it is full of pinks.)
    P.torus(PIN.r, 0.014, '#FFFFFF', { at: [0, PIN.head + 0.03, 0], rot: [Math.PI / 2, 0, 0] }),
    P.cyl(PIN.r * 0.84, PIN.r * 0.84, 0.014, id === 'house' ? '#CDEFB0' : '#FFE9C7', { at: [0, top - 0.004, 0] }, 28),
  ]), bag, 2))
  const mini = new Group()
  mini.position.y = top
  root.add(mini)
  if (id === 'house') {
    // Home: a little pink house with a heart over its door, a tree beside it.
    mini.add(solid(merge([
      P.rbox(0.13, 0.1, 0.11, 0.015, '#FF9DC0', { at: [-0.015, 0.05, 0] }),
      P.prism([[-0.085, 0], [0.085, 0], [0, 0.075]], 0.13, '#FFF7F0', { at: [-0.015, 0.098, 0] }),
      P.rbox(0.034, 0.05, 0.01, 0.006, '#9A6B4F', { at: [-0.015, 0.025, 0.056] }),
      ...[-1, 1].map((s) => P.sphere(0.014, PAL.hotpink, { at: [-0.015 + s * 0.01, 0.079, 0.058], scale: [1, 1, 0.4] }, 7)),
      P.cone(0.02, 0.024, PAL.hotpink, { at: [-0.015, 0.064, 0.058], rot: [Math.PI, 0, 0], scale: [1, 1, 0.4] }, 4),
      ...roundTree(0.09, 0, 0.03, 0.75, 1),
    ]), bag, 1.5))
  } else {
    // The mall day: a rainbow slide and a big slice of pizza.
    const slide: BufferGeometry[] = [
      ...[-1, 1].map((s) => P.cyl(0.006, 0.006, 0.14, '#FFF7F0', { at: [-0.07, 0.07, -0.02 + s * 0.022] }, 5)),
      P.rbox(0.04, 0.008, 0.06, 0.003, PAL.lavender, { at: [-0.07, 0.14, -0.02] }),
      rod([-0.055, 0.14, -0.02], [0.03, 0.012, -0.02], 0.008, PAL.sky, 0.05),
      ...[-1, 1].map((s) => rod([-0.055, 0.15, -0.02 + s * 0.026], [0.03, 0.022, -0.02 + s * 0.026], 0.012, PAL.hotpink, 0.005)),
      ...[0, 1, 2].map((i) => P.box(0.004, 0.004, 0.044, '#FFF7F0', { at: [-0.085, 0.035 + i * 0.035, -0.02] })),
    ]
    const pizza: BufferGeometry[] = [
      P.prism([[0, 0], [0.11, 0.035], [0.11, -0.035]], 0.014, '#F4C77B', { at: [0.0, 0.05, 0.075], rot: [-0.5, 0.35, 0] }),
      P.prism([[0.012, 0], [0.098, 0.027], [0.098, -0.027]], 0.004, PAL.butter, { at: [0.002, 0.059, 0.08], rot: [-0.5, 0.35, 0] }),
      ...[[0.05, 0.004], [0.08, -0.012], [0.082, 0.014]].map(([px, py]) => P.sphere(0.008, RED, { at: [0.002 + px * 0.94, 0.064 + py * 0.85 + px * 0.0, 0.082 - px * 0.34 + py * 0.3], scale: [1, 1, 0.5] }, 6)),
    ]
    mini.add(solid(merge([...slide, ...pizza]), bag, 1.5))
  }
  root.scale.setScalar(PIN.size)
  return { root, mini }
}

// The seven places on the Canada map, each a little diorama where its friend lives (the friends themselves are
// world.ts's: they stand here until they join the team, then at the rink): Ottawa's frozen canal with the rink, the Maple
// Cup and Maple; the castle hotel in Quebec City (and, before Tuque is built, three snowballs and a red tuque); Mont-
// Sainte-Anne's green mountain with its trail and waterfall, Monty's pond at the bottom; the campsite (a tent, a fire
// that flickers, dark spruces); Banff's turquoise lake between snowy peaks with the red canoe; the rainforest's giant
// cedars and the falls where a salmon jumps; Tofino's kelp out on the Pacific and a whale that spouts. Built at map
// scale (a friend is about a unit tall), every one a toy: one merged mesh for what stands still, small groups for what
// moves. Each knows how to bounce when tapped.
import { BufferGeometry, Float32BufferAttribute, Group, Vector3, type Mesh, type Object3D } from 'three'
import { bell, clamp } from '../../../../sdk'
import type { Bag } from '../../../engine3d/dispose'
import { bake, blobShadow, merge, P, solid, solidMix } from '../../../engine3d/geo'
import { outlineMaterial } from '../../../engine3d/outline'
import { CANADA_COLORS } from '../characters/looks'
import { makeCup } from '../story/props'
import { buildHut, type Hut } from './hut'
import { LINE, type PlaceId } from './shape'
import { peakParts, snowCap, spruceParts } from './terrain'

const SNOW = '#FFFFFF'
const SNOW_SHADE = '#EEF1FF'
const WATER = '#8ED6EE'
const RED = '#E8504B'
const WOOD = '#B07A4A'
const WOOD_DARK = '#8A5A3C'
const PINK = CANADA_COLORS.scarf
const TAU = Math.PI * 2

export interface PlaceToy {
  id: PlaceId
  /** At the place's spot on the ground. */
  root: Group
  /** Where the friend who lives here stands (local); null: the rink, where Maple and the team stand. */
  home: Vector3 | null
  /** Half its footprint (x, z) and its height, for the tap target. */
  size: { hw: number; hd: number; h: number }
  /** The little pink flag with a heart: her chapter here is done. */
  flag: Group
  /** Seconds since she tapped it (-1: idle). */
  t: number
  /** Its size on the board (world.ts scales the root by it, times its bounce). */
  k: number
  update(dt: number, t: number): void
}

/**
 * Every ink line under `root` drawn `lift` meters nearer the camera than its shape (the outline shader's bias). A toy's
 * line runs round its back corners, and whatever it stands on (its snowy base, the ground, a hill) is nearer than those,
 * so without a lift the base ate the line down the sides while the front edge kept it. Kept small (LINE.lift): more
 * than a part is thick and the line shows through it (a pin's face, the rink's ice, a tree's tiers go black). Lines
 * already lifted keep theirs.
 */
export function inkLift(root: Object3D, lift: number = LINE.lift, skip?: Set<Object3D>) {
  const walk = (o: Object3D) => {
    if (skip?.has(o)) return
    const px = o.userData.hull as number | undefined
    if (px !== undefined && !o.userData.hullBias) {
      o.userData.hullBias = lift
      ;(o as Mesh).material = outlineMaterial(px, o.userData.hullColor as string | undefined, lift)
    }
    for (const c of o.children) walk(c)
  }
  walk(root)
}

/** The done-mark: a pink pennant with a white heart on a little pole. */
function doneFlag(bag: Bag) {
  const g = new Group()
  const heart: [number, number][] = []
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * TAU
    const x = 16 * Math.sin(a) ** 3
    const y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)
    heart.push([x * 0.0042, y * 0.0042])
  }
  const cloth = new Group()
  cloth.add(
    solid(
      merge([
        P.prism([[0, 0.13], [0.3, 0.075], [0, 0.0]], 0.02, PINK, { at: [0.012, 0, 0] }),
        P.prism(heart, 0.03, SNOW, { at: [0.1, 0.066, 0] }),
      ]),
      bag,
      LINE.toy,
    ),
  )
  cloth.position.y = 0.42
  g.add(solid(merge([P.cyl(0.012, 0.012, 0.56, '#FFF7F0', { at: [0, 0.28, 0] }, 6), P.sphere(0.025, '#FFC83D', { at: [0, 0.57, 0] }, 8)]), bag, LINE.small), cloth)
  g.userData.cloth = cloth
  g.visible = false
  return g
}

function base(id: PlaceId, bag: Bag, size: PlaceToy['size'], home: Vector3 | null): PlaceToy {
  const root = new Group()
  const flag = doneFlag(bag)
  root.add(flag)
  return { id, root, home, size, flag, t: -1, k: 1.3, update: () => {} }
}

/** Waving the done-flag in the breeze. */
const flutter = (p: PlaceToy, t: number) => {
  const c = p.flag.userData.cloth as Group
  c.rotation.y = Math.sin(t * 2.4 + p.root.position.x) * 0.3
}

// ---------------------------------------------------------------- Ottawa: the frozen canal and the rink

export interface Rink {
  place: PlaceToy
  /** Where Maple stands, and the six teammates' spots in a row behind the rink (local). */
  maple: Vector3
  row: Vector3[]
  /** The skating ring the geese go round (local center, radii). */
  loop: { x: number; z: number; rx: number; rz: number }
  /** The Cup (it glints), and the glow under the rink when the whole team is home. */
  cup: Group
  glow: Group
  rinkAt: Vector3
  /** Where the rink's tap target is centered: the left half of the ice, away from the geese's ring. */
  aim: Vector3
  /** The team's skate hut beside the canal (hut.ts): tap it for the Team Cabin. */
  hut: Hut
}

export function buildRink(bag: Bag): Rink {
  const place = base('party', bag, { hw: 1.15, hd: 0.6, h: 0.8 }, null)
  place.k = 1.25
  const parts = [
    // The snowy bank and the canal's ice running along it.
    P.cyl(1.0, 1.04, 0.07, '#F7F9FF', { at: [0.2, 0.03, -0.08], scale: [1.4, 1, 0.78] }, 32),
    // (and a snowy strip behind it, where the team's back row stands)
    P.cyl(1.0, 1.04, 0.07, '#F7F9FF', { at: [0.72, 0.03, -0.74], scale: [1.08, 1, 0.34] }, 28),
    // The frozen canal: a long ribbon of blue ice from the river, the rink on its widest stretch.
    P.cyl(1, 1, 0.03, '#BFE3F6', { at: [0.25, 0.06, 0.3], scale: [1.32, 1, 0.38] }, 32),
    P.rbox(1.3, 0.03, 0.22, 0.1, '#BFE3F6', { at: [1.55, 0.06, 0.12], rot: [0, 0.45, 0] }),
    P.rbox(1.76, 0.02, 0.6, 0.05, '#F4FBFF', { at: [0.25, 0.08, 0.28] }),
    // The rink: low white boards with a pink rail, the red line and two blue lines, the faceoff circle.
    ...[-1, 1].map((s) => P.rbox(1.78, 0.07, 0.035, 0.012, SNOW, { at: [0.25, 0.13, 0.28 + s * 0.31] })),
    ...[-1, 1].map((s) => P.rbox(0.035, 0.07, 0.62, 0.012, SNOW, { at: [0.25 + s * 0.89, 0.13, 0.28] })),
    ...[-1, 1].map((s) => P.rbox(1.78, 0.015, 0.04, 0.006, PINK, { at: [0.25, 0.17, 0.28 + s * 0.31] })),
    P.box(0.025, 0.004, 0.6, RED, { at: [0.25, 0.098, 0.28] }),
    ...[-1, 1].map((s) => P.box(0.02, 0.004, 0.6, '#6FA8FF', { at: [0.25 + s * 0.3, 0.098, 0.28] })),
    P.torus(0.12, 0.008, RED, { at: [0.25, 0.098, 0.28], rot: [Math.PI / 2, 0, 0] }),
    // The two nets: red posts and crossbar, a white mesh back.
    ...[-1, 1].flatMap((s) => {
      const x = 0.25 + s * 0.74
      return [
        P.cyl(0.012, 0.012, 0.12, RED, { at: [x, 0.16, 0.28 - 0.1] }, 6),
        P.cyl(0.012, 0.012, 0.12, RED, { at: [x, 0.16, 0.28 + 0.1] }, 6),
        P.cyl(0.012, 0.012, 0.2, RED, { at: [x, 0.22, 0.28], rot: [Math.PI / 2, 0, 0] }, 6),
        P.rbox(0.06, 0.11, 0.2, 0.02, '#F4F1FA', { at: [x + s * 0.04, 0.16, 0.28] }),
      ]
    }),
    // Snowbanks and two little spruces on the far bank, a lamp post.
    P.sphere(0.2, SNOW_SHADE, { at: [-1.35, 0.05, -0.75], scale: [1.4, 0.5, 1] }, 10),
    ...spruceParts(-1.4, 0.05, -0.5, 0.42, true),
    P.cyl(0.015, 0.018, 0.5, '#3A3340', { at: [-1.25, 0.3, 0.05] }, 6),
    P.sphere(0.045, '#FFE9A8', { at: [-1.25, 0.57, 0.05] }, 8),
  ]
  place.root.add(solid(merge(parts), bag, LINE.toy))
  // The Cup on its stand, by the rink's left end.
  const cup = makeCup(bag, 0.72, true)
  cup.scale.setScalar(0.5)
  cup.position.set(-0.98, 0.06, -0.18)
  cup.add(blobShadow(0.42, bag))
  place.root.add(cup)
  // The glow round the rink when the team is whole: a soft pink ring on the ice.
  const glow = solid(merge([P.torus(1.0, 0.05, '#FFB8D6', { rot: [Math.PI / 2, 0, 0], scale: [1, 0.42, 1] })]), bag, 0)
  glow.position.set(0.25, 0.1, 0.28)
  glow.visible = false
  place.root.add(glow)
  place.flag.visible = false
  // Maple, the captain, stands in front by the Cup, nearest the ice.
  const maple = new Vector3(-0.6, 0.06, -0.08)
  // The team stands on the far bank in two staggered rows, the back row in the front row's gaps so every face shows:
  // the big ones (Monty, Misty, Tuque) at the back, the small ones in front. (In CHAPTERS order: snowman, bike,
  // campfire, canoe, salmon, whales.)
  const row = [
    [1.42, -0.78],
    [0.12, -0.8],
    [-0.16, -0.3],
    [1.16, -0.36],
    [0.78, -0.8],
    [0.47, -0.3],
  ].map(([x, z]) => new Vector3(x, 0.06, z))
  const rinkAt = new Vector3(0.25, 0.1, 0.28)
  // The skate hut, on the snow at the rink's right end, beside the canal where it runs off to the river; turned a
  // little toward the ice.
  const hut = buildHut(bag)
  hut.root.position.set(1.74, 0, 0.52)
  hut.root.rotation.y = -0.35
  place.root.add(hut.root)
  place.update = (dt, t) => {
    cup.rotation.y = Math.sin(t * 0.6) * 0.25
    hut.update(dt, t)
  }
  return { place, aim: new Vector3(-0.1, 0.1, 0.28), maple, row, loop: { x: 0.62, z: 0.36, rx: 0.3, rz: 0.15 }, cup, glow, rinkAt, hut }
}

// ---------------------------------------------------------------- Quebec City: the castle hotel

export interface CastlePlace {
  place: PlaceToy
  /** Three snowballs and a red tuque: Tuque before he's built. */
  heap: Group
}

/** A hipped roof `w` (x) by `d` (z) and `h` tall, standing on `at`: four steep slopes up to a ridge along the longer
 *  side (a point when it's square), like the château's copper roofs. Flat-shaded, so each slope reads in the toon light. */
function hipRoof(w: number, d: number, h: number, c: string, at: [number, number, number]) {
  const [hw, hd] = [w / 2, d / 2]
  const along = w >= d
  const r = Math.max(0, (along ? hw - hd : hd - hw) * 0.9)
  const [A, B, C, D] = [[-hw, 0, -hd], [hw, 0, -hd], [hw, 0, hd], [-hw, 0, hd]]
  const [R1, R2] = along ? [[-r, h, 0], [r, h, 0]] : [[0, h, -r], [0, h, r]]
  // Front, back, right, left (wound to face out).
  const tris = along ? [D, C, R2, D, R2, R1, B, A, R1, B, R1, R2, C, B, R2, A, D, R1] : [D, C, R2, B, A, R1, C, B, R1, C, R1, R2, A, D, R2, A, R2, R1]
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(tris.flat(), 3))
  g.computeVertexNormals()
  return bake(g, c, { at })
}

export function buildCastle(bag: Bag): CastlePlace {
  const place = base('snowman', bag, { hw: 0.75, hd: 0.55, h: 1.35 }, new Vector3(0.45, 0.05, 0.35))
  const BRICK = '#F2BCA6'
  const BRICK_DARK = '#E2A38C'
  const STONE = '#FFF1DF'
  const COPPER = '#7FD3B4'
  const COPPER_DARK = '#62C09F'
  const WIN = '#FFE9A8'
  const G = 0.21
  // A dormer on a roof's front slope: a little copper gable with a lit window.
  // (Windows, sills and the door are paint on the walls, on `paint`: the ink goes round the building, not each window.)
  const paint: BufferGeometry[] = []
  const dormer = (x: number, y: number, z: number, k = 1) => {
    paint.push(P.box(0.04 * k, 0.045 * k, 0.01, WIN, { at: [x, y - 0.005 * k, z + 0.041 * k] }))
    return [P.box(0.07 * k, 0.07 * k, 0.08 * k, COPPER_DARK, { at: [x, y, z] }), P.prism([[-0.045 * k, 0], [0.045 * k, 0], [0, 0.05 * k]], 0.09 * k, COPPER, { at: [x, y + 0.035 * k, z] })]
  }
  const windows = (xs: number[], ys: number[], z: number, w = 0.045, h = 0.065): BufferGeometry[] => {
    for (const y of ys) for (const x of xs) paint.push(P.box(w + 0.014, 0.012, 0.012, STONE, { at: [x, y - h / 2 - 0.004, z + 0.002] }), P.box(w, h, 0.01, WIN, { at: [x, y, z] }))
    return []
  }
  const parts = [
    // A snowy cliff above the river, with lavender rock showing on its face.
    P.rbox(1.45, 0.16, 1.05, 0.08, SNOW, { at: [0, 0.06, 0] }),
    P.rbox(1.3, 0.1, 0.9, 0.05, SNOW_SHADE, { at: [0, 0.16, -0.05] }),
    P.rbox(1.38, 0.08, 0.2, 0.04, '#D6CDEB', { at: [0, 0.04, 0.45] }),
    // The long front wing on its cream stone base, a cream band between the floors, its steep copper roof.
    P.rbox(1.04, 0.05, 0.34, 0.015, STONE, { at: [0, G + 0.025, -0.12] }),
    P.rbox(1.0, 0.34, 0.3, 0.02, BRICK, { at: [0, G + 0.17, -0.12] }),
    P.rbox(1.02, 0.02, 0.32, 0.008, STONE, { at: [0, G + 0.19, -0.12] }),
    hipRoof(1.08, 0.38, 0.26, COPPER, [0, G + 0.34, -0.12]),
    // Two wings stepping back behind it, so the roofs pile up like the real château's.
    P.rbox(0.3, 0.3, 0.3, 0.02, BRICK_DARK, { at: [-0.34, G + 0.15, -0.36] }),
    hipRoof(0.34, 0.34, 0.24, COPPER_DARK, [-0.34, G + 0.3, -0.36]),
    P.rbox(0.28, 0.4, 0.28, 0.02, BRICK_DARK, { at: [0.36, G + 0.2, -0.38] }),
    hipRoof(0.32, 0.32, 0.26, COPPER_DARK, [0.36, G + 0.4, -0.38]),
    // The big tower in the middle, a little in front of the wing: tall, with the steepest roof and a gold spire.
    P.rbox(0.32, 0.05, 0.32, 0.015, STONE, { at: [0, G + 0.025, -0.06] }),
    P.rbox(0.3, 0.64, 0.3, 0.02, BRICK, { at: [0, G + 0.32, -0.06] }),
    P.rbox(0.32, 0.03, 0.32, 0.01, STONE, { at: [0, G + 0.63, -0.06] }),
    hipRoof(0.38, 0.38, 0.4, COPPER, [0, G + 0.645, -0.06]),
    // (The arched door at the tower's foot is paint, below.)
    // The corner turrets with their witch-hat roofs.
    ...[-1, 1].flatMap((s) => [
      P.cyl(0.085, 0.09, 0.48, BRICK, { at: [s * 0.5, G + 0.24, 0.0] }, 12),
      P.cyl(0.1, 0.1, 0.025, STONE, { at: [s * 0.5, G + 0.48, 0.0] }, 12),
      P.cone(0.115, 0.3, COPPER_DARK, { at: [s * 0.5, G + 0.64, 0.0] }, 12),
      ...windows([s * 0.5], [G + 0.12, G + 0.3], 0.085, 0.035, 0.06),
    ]),
    // Rows of warm windows on the wing and the tower, dormers on the roofs, chimneys.
    ...windows([-0.38, -0.27, 0.27, 0.38], [G + 0.1, G + 0.26], 0.035),
    ...windows([-0.06, 0.06], [G + 0.22, G + 0.36, G + 0.5], 0.095, 0.04, 0.06),
    ...[-0.32, 0.32].flatMap((x) => dormer(x, G + 0.42, -0.01)),
    ...dormer(0, G + 0.76, 0.03, 0.9),
    ...[-0.2, 0.2].map((x) => P.box(0.045, 0.12, 0.045, BRICK_DARK, { at: [x, G + 0.5, -0.2] })),
    // Snowy spruces round the back.
    ...spruceParts(-0.64, 0.12, -0.3, 0.36, false, true, 0.4),
    ...spruceParts(0.66, 0.12, -0.18, 0.34, true, true, 1.3),
    ...spruceParts(0.62, 0.12, 0.1, 0.24, false, true, 2.2),
  ]
  paint.push(P.rbox(0.1, 0.13, 0.02, 0.03, STONE, { at: [0, G + 0.065, 0.095] }), P.rbox(0.07, 0.11, 0.02, 0.03, '#8A5A3C', { at: [0, G + 0.055, 0.1] }))
  // The thin bits (the gold spire; the boardwalk terrace along the cliff's edge, its lamp posts and a little green
  // kiosk) are their own toy: the castle's bigger lift would show their line right through them.
  const bits = [
    P.cyl(0.006, 0.01, 0.12, '#F2C14E', { at: [0, G + 1.1, -0.06] }, 6),
    P.sphere(0.018, '#F2C14E', { at: [0, G + 1.17, -0.06] }, 8),
    P.rbox(0.62, 0.025, 0.16, 0.01, '#E7C79E', { at: [-0.32, G - 0.005, 0.36] }),
    P.rbox(0.62, 0.015, 0.015, 0.005, SNOW, { at: [-0.32, G + 0.06, 0.435] }),
    ...[-0.6, -0.44, -0.28, -0.12].map((x) => P.cyl(0.008, 0.008, 0.06, SNOW, { at: [x, G + 0.03, 0.435] }, 4)),
    ...[-0.52, -0.14].flatMap((x) => [P.cyl(0.007, 0.009, 0.2, '#3A3340', { at: [x, G + 0.1, 0.33] }, 6), P.sphere(0.022, WIN, { at: [x, G + 0.21, 0.33] }, 8)]),
    ...[-1, 1].flatMap((s) => [-1, 1].map((t) => P.cyl(0.006, 0.006, 0.1, SNOW, { at: [-0.33 + s * 0.04, G + 0.05, 0.33 + t * 0.04] }, 4))),
    P.cone(0.075, 0.08, COPPER, { at: [-0.33, G + 0.14, 0.33] }, 8),
  ]
  place.root.add(solid(merge(bits), bag, LINE.small))
  const castle = solidMix(parts, paint, bag, LINE.toy)
  // (Tall deep walls: the snowy cliff in front of their back corners needs a bigger lift than the rest of the board.)
  inkLift(castle, LINE.lift * 2.5)
  place.root.add(castle)
  // Flags on the turrets.
  const flags: Group[] = []
  for (const s of [-1, 1]) {
    const f = solid(merge([P.cyl(0.006, 0.006, 0.14, '#3A3340', { at: [0, 0.07, 0] }, 4), P.prism([[0, 0.14], [0.1, 0.115], [0, 0.09]], 0.008, s < 0 ? '#4F8FE8' : RED)]), bag, LINE.small)
    f.position.set(s * 0.5, 0.99, 0.0)
    place.root.add(f)
    flags.push(f)
  }
  // The heap: three snowballs and the red tuque lying on top.
  const heap = solid(
    merge([
      P.sphere(0.16, SNOW, { at: [0.36, 0.3, 0.32] }, 14),
      P.sphere(0.12, SNOW, { at: [0.6, 0.27, 0.36] }, 12),
      P.sphere(0.085, SNOW_SHADE, { at: [0.47, 0.47, 0.34] }, 10),
      P.cone(0.075, 0.15, RED, { at: [0.5, 0.59, 0.36], rot: [0, 0, -1.15] }, 10),
      P.torus(0.065, 0.022, SNOW, { at: [0.45, 0.565, 0.36], rot: [0, Math.PI / 2, 0.42] }),
      P.sphere(0.035, SNOW, { at: [0.57, 0.62, 0.36] }, 8),
    ]),
    bag,
    LINE.toy,
  )
  place.root.add(heap)
  place.flag.position.set(-0.6, 0.2, 0.3)
  place.update = (_dt, t) => {
    flags.forEach((f, i) => (f.rotation.y = Math.sin(t * 2 + i) * 0.4))
    heap.rotation.z = place.t >= 0 ? Math.sin(place.t * 18) * 0.05 * (1 - clamp(place.t / 0.6, 0, 1)) : 0
    flutter(place, t)
  }
  return { place, heap }
}

// ---------------------------------------------------------------- Mont-Sainte-Anne: the green mountain

export function buildMountain(bag: Bag): PlaceToy {
  const place = base('bike', bag, { hw: 0.8, hd: 0.7, h: 1.35 }, new Vector3(0.2, 0.0, 0.62))
  const GREEN = '#86CF8F'
  const GREEN_DARK = '#6DBE7E'
  const TRAIL = '#FFF6E0'
  const parts = [
    // The mountain: a big round green cone with a snowy top.
    P.cone(0.85, 1.25, GREEN, { at: [-0.05, 0.6, -0.22] }, 9),
    P.cone(0.62, 0.42, GREEN_DARK, { at: [0.55, 0.2, -0.2] }, 8),
    snowCap(0.85, 1.25, 0.27, 18, SNOW, [-0.05, -0.025, -0.22], 0),
    // The bike trail zigzagging down its front: stepping-stone dots, like the trails on the other maps.
    ...Array.from({ length: 16 }, (_, i) => {
      const y = 0.98 - i * 0.058
      const r = (0.85 * (1.225 - y)) / 1.25 + 0.012
      const a = Math.sin(i * 0.55) * 0.55
      return P.sphere(0.034, TRAIL, { at: [-0.05 + Math.sin(a) * r, y, -0.22 + Math.cos(a) * r], scale: [1, 0.45, 1] }, 8)
    }),
    // The rock the waterfall leaps from, the pond at the bottom with its rim.
    P.rbox(0.26, 0.22, 0.2, 0.06, '#C9BFE0', { at: [0.42, 0.42, 0.16] }),
    P.cyl(0.42, 0.44, 0.04, '#F2FBFF', { at: [0.25, 0.03, 0.6], scale: [1.2, 1, 0.8] }, 20),
    P.cyl(0.38, 0.38, 0.05, WATER, { at: [0.25, 0.04, 0.6], scale: [1.2, 1, 0.8] }, 20),
    ...spruceParts(-0.68, 0.0, 0.32, 0.4, true),
    ...spruceParts(-0.5, 0.0, 0.55, 0.3),
    ...spruceParts(0.8, 0.0, 0.2, 0.34, true),
  ]
  place.root.add(solid(merge(parts), bag, LINE.toy))
  // The waterfall: a pale sheet with white stripes that run down it.
  const fall = new Group()
  fall.add(solid(P.rbox(0.13, 0.4, 0.02, 0.01, '#BFE9F7', { at: [0, -0.2, 0] }), bag, LINE.small))
  const stripes: Group[] = []
  for (let i = 0; i < 3; i++) {
    const s = solid(P.box(0.1, 0.05, 0.01, SNOW, { at: [0, 0, 0.012] }), bag, 0)
    fall.add(s)
    stripes.push(s)
  }
  fall.position.set(0.42, 0.42, 0.27)
  fall.rotation.x = 0.12
  place.root.add(fall)
  place.flag.position.set(-0.65, 0.0, 0.62)
  place.update = (_dt, t) => {
    stripes.forEach((s, i) => {
      const u = (t * 0.7 + i / 3) % 1
      s.position.y = -u * 0.38
      s.scale.x = 0.7 + 0.3 * Math.sin(u * Math.PI)
    })
    flutter(place, t)
  }
  place.root.userData.foam = new Vector3(0.42, 0.06, 0.5)
  return place
}

// ---------------------------------------------------------------- the campsite

export interface Camp {
  place: PlaceToy
  flames: Group
  /** Where Roxy stands beside the tent, and where she sidles out to (both clear of it, the fire and the trees). */
  peek: { hide: Vector3; out: Vector3 }
}

export function buildCamp(bag: Bag): Camp {
  const place = base('campfire', bag, { hw: 0.75, hd: 0.55, h: 0.95 }, null)
  const TENT = '#FF9A6B'
  const TENT_DARK = '#E57A52'
  const parts = [
    P.cyl(0.75, 0.78, 0.05, '#BFE3A4', { at: [0, 0.02, 0.05], scale: [1.1, 1, 0.82] }, 20),
    // The tent: a triangle prism, a darker door flap open.
    P.prism([[-0.34, 0], [0.34, 0], [0, 0.46]], 0.62, TENT, { at: [-0.18, 0.04, -0.12] }),
    P.prism([[-0.13, 0], [0.13, 0], [0, 0.3]], 0.02, '#7A4A3A', { at: [-0.18, 0.04, 0.2] }),
    P.prism([[0, 0], [0.13, 0], [0, 0.3]], 0.03, TENT_DARK, { at: [-0.04, 0.04, 0.21], rot: [0, -0.5, 0] }),
    P.cyl(0.008, 0.008, 0.12, WOOD_DARK, { at: [-0.18, 0.54, 0.19] }, 4),
    // The fire's ring of stones and its logs.
    ...Array.from({ length: 8 }, (_, i) => P.sphere(0.045, '#C9C2D8', { at: [0.42 + Math.cos((i / 8) * TAU) * 0.13, 0.06, 0.32 + Math.sin((i / 8) * TAU) * 0.1], scale: [1, 0.7, 1] }, 6)),
    P.cyl(0.025, 0.025, 0.22, WOOD, { at: [0.42, 0.08, 0.32], rot: [0, 0.6, Math.PI / 2] }, 6),
    P.cyl(0.025, 0.025, 0.22, WOOD_DARK, { at: [0.42, 0.09, 0.32], rot: [0, -0.6, Math.PI / 2] }, 6),
    // A log to sit on, dark spruces round the back.
    P.cyl(0.05, 0.05, 0.36, WOOD, { at: [0.48, 0.07, 0.62], rot: [0, 0.2, Math.PI / 2] }, 8),
    ...spruceParts(-0.68, 0.02, -0.25, 0.62, true),
    // (Clear of the grass right of the tent, where Roxy stands.)
    ...spruceParts(-0.12, 0.02, -0.6, 0.7, true),
    ...spruceParts(0.74, 0.02, -0.42, 0.5, true),
    ...spruceParts(-0.62, 0.02, 0.32, 0.4, true),
  ]
  place.root.add(solid(merge(parts), bag, LINE.toy))
  const flames = new Group()
  flames.add(solid(merge([P.cone(0.075, 0.22, '#FF8A3D', { at: [0, 0.11, 0] }, 7), P.cone(0.05, 0.16, '#FFC83D', { at: [0.02, 0.09, 0.02] }, 7), P.cone(0.03, 0.1, '#FFF1A8', { at: [-0.01, 0.07, 0.03] }, 6)]), bag, LINE.small))
  flames.position.set(0.42, 0.09, 0.32)
  place.root.add(flames)
  place.flag.position.set(-0.55, 0.04, 0.5)
  place.update = (_dt, t) => {
    const f = 1 + 0.18 * Math.sin(t * 13) + 0.1 * Math.sin(t * 21 + 1) + (place.t >= 0 ? 0.5 * bell(clamp(place.t / 0.6, 0, 1)) : 0)
    flames.scale.set(1 + 0.08 * Math.sin(t * 17), f, 1 + 0.08 * Math.sin(t * 15))
    flames.rotation.y = t * 0.8
    flutter(place, t)
  }
  return { place, flames, peek: { hide: new Vector3(0.38, 0.04, -0.2), out: new Vector3(0.5, 0.04, -0.08) } }
}

// ---------------------------------------------------------------- Banff: the turquoise lake

export interface Lake {
  place: PlaceToy
  canoe: Group
  /** Where Lulu floats (local), round which she glides. */
  float: Vector3
}

export function buildLake(bag: Bag): Lake {
  const place = base('canoe', bag, { hw: 0.85, hd: 0.6, h: 1.25 }, null)
  const parts = [
    P.cyl(0.8, 0.82, 0.05, '#F2FBFF', { at: [0, 0.03, 0.15], scale: [1.15, 1, 0.75] }, 24),
    P.cyl(0.75, 0.75, 0.06, '#5ED6D2', { at: [0, 0.04, 0.15], scale: [1.15, 1, 0.75] }, 24),
    P.cyl(0.5, 0.5, 0.062, '#4CC6CC', { at: [0.05, 0.04, 0.05], scale: [1.2, 1, 0.6] }, 20),
    // The peaks round the far shore.
    ...peakParts(-0.55, 0, -0.5, 0.42, 1.05, 0.3),
    ...peakParts(0.1, 0, -0.62, 0.48, 1.2, 1.1),
    ...peakParts(0.72, 0, -0.42, 0.36, 0.85, 2.1),
    ...spruceParts(-0.9, 0.0, 0.2, 0.4, true),
    ...spruceParts(0.95, 0.0, 0.3, 0.36),
    ...spruceParts(0.8, 0.0, 0.58, 0.3, true),
  ]
  place.root.add(solid(merge(parts), bag, LINE.toy))
  // The red canoe: a long hull with pointed ends, a paddle laid across.
  const canoe = new Group()
  canoe.add(
    solid(
      merge([
        P.sphere(0.1, RED, { at: [0, 0.03, 0], scale: [3.2, 0.55, 1] }, 14),
        P.sphere(0.08, '#F6E7CF', { at: [0, 0.06, 0], scale: [3.4, 0.2, 0.9] }, 12),
        P.cyl(0.008, 0.008, 0.3, WOOD, { at: [0.04, 0.08, 0], rot: [Math.PI / 2, 0, 0.1] }, 4),
      ]),
      bag,
      LINE.toy,
    ),
  )
  canoe.position.set(-0.32, 0.07, 0.32)
  canoe.rotation.y = 0.35
  place.root.add(canoe)
  place.flag.position.set(-0.85, 0.0, 0.55)
  place.update = (_dt, t) => {
    canoe.position.y = 0.07 + Math.sin(t * 1.6) * 0.012
    canoe.rotation.z = Math.sin(t * 1.3) * 0.06 + (place.t >= 0 ? Math.sin(place.t * 14) * 0.15 * (1 - clamp(place.t / 0.8, 0, 1)) : 0)
    flutter(place, t)
  }
  // (Lulu floats on the near half of the lake, in front of the peaks, so the camera always sees her.)
  return { place, canoe, float: new Vector3(0.24, 0.06, 0.44) }
}

// ---------------------------------------------------------------- the rainforest: cedars and the salmon's falls

export interface Forest {
  place: PlaceToy
  /** The salmon that jumps the falls. */
  fish: Group
  pool: Vector3
}

export function buildForest(bag: Bag): Forest {
  const place = base('bath', bag, { hw: 0.75, hd: 0.6, h: 1.4 }, new Vector3(-0.35, 0.03, 0.4))
  const cedar = (x: number, z: number, s: number) => [
    P.cyl(0.06 * s, 0.1 * s, 1.0 * s, '#B5654A', { at: [x, 0.5 * s, z] }, 8),
    P.cone(0.32 * s, 0.5 * s, '#2F7F58', { at: [x, 0.78 * s, z] }, 8),
    P.cone(0.26 * s, 0.45 * s, '#3A9064', { at: [x, 1.05 * s, z] }, 8),
    P.cone(0.18 * s, 0.38 * s, '#46A06E', { at: [x, 1.3 * s, z] }, 8),
  ]
  const parts = [
    P.cyl(0.75, 0.78, 0.05, '#7CCB8C', { at: [0, 0.02, 0.05], scale: [1.1, 1, 0.85] }, 20),
    // The rocky ledge the river falls from, the pool below.
    P.rbox(0.5, 0.36, 0.3, 0.08, '#B9B1D6', { at: [0.3, 0.2, -0.2] }),
    P.rbox(0.42, 0.06, 0.2, 0.03, '#8ED6EE', { at: [0.3, 0.39, -0.22] }),
    P.cyl(0.32, 0.34, 0.04, '#F2FBFF', { at: [0.3, 0.03, 0.25], scale: [1.2, 1, 0.8] }, 18),
    P.cyl(0.29, 0.29, 0.05, WATER, { at: [0.3, 0.04, 0.25], scale: [1.2, 1, 0.8] }, 18),
    // Giant cedars and ferns.
    ...cedar(-0.55, -0.3, 1.25),
    ...cedar(-0.1, -0.5, 1.05),
    ...cedar(0.78, -0.35, 1.15),
    ...cedar(-0.75, 0.25, 0.8),
    ...[[-0.15, 0.55], [0.75, 0.45], [0.05, 0.15]].map(([x, z]) => P.sphere(0.09, '#5DB27F', { at: [x, 0.06, z], scale: [1.5, 0.6, 1.2] }, 8)),
  ]
  place.root.add(solid(merge(parts), bag, LINE.toy))
  const fall = solid(P.rbox(0.3, 0.34, 0.02, 0.01, '#CFF0FA', { at: [0, -0.17, 0] }), bag, LINE.small)
  fall.position.set(0.3, 0.38, -0.04)
  place.root.add(fall)
  const fish = solid(merge([P.sphere(0.06, '#F28A7A', { scale: [0.6, 0.8, 1.7] }, 10), P.cone(0.05, 0.08, '#E0705F', { at: [0, 0, -0.12], rot: [-Math.PI / 2, 0, 0], scale: [0.4, 1, 1] }, 6), P.sphere(0.012, '#2E2233', { at: [0.03, 0.02, 0.06] }, 5)]), bag, LINE.small)
  place.root.add(fish)
  place.flag.position.set(0.72, 0.02, 0.55)
  const pool = new Vector3(0.3, 0.05, 0.25)
  let jump = 0
  place.update = (dt, t) => {
    // The salmon leaps from the pool up the falls every few seconds (higher when tapped).
    if (place.t >= 0 && place.t <= dt) jump = Math.ceil(jump)
    jump += dt / 2.6
    const u = jump % 1
    const k = clamp(u / 0.4, 0, 1)
    fish.visible = u < 0.4
    fish.position.set(pool.x - 0.05 + k * 0.05, pool.y + bell(k) * 0.55, pool.z + 0.05 - k * 0.3)
    fish.rotation.set(-1.2 + k * 2.4, Math.PI, 0)
    flutter(place, t)
  }
  return { place, fish, pool }
}

// ---------------------------------------------------------------- Tofino: kelp on the Pacific, a whale

export interface Bay {
  place: PlaceToy
  whale: Group
  /** Where the whale's blowhole is (local), for the spout. */
  hole: Vector3
}

export function buildBay(bag: Bag): Bay {
  const place = base('whales', bag, { hw: 0.65, hd: 0.55, h: 0.7 }, new Vector3(0.0, 0.02, 0.2))
  const kelp: ReturnType<typeof P.sphere>[] = []
  // The kelp forest: golden-green fronds lying on the water, a round float at each one's tip.
  for (const [x, z, r] of [[-0.42, -0.1, 0.4], [-0.3, 0.42, 1.9], [0.4, 0.38, 2.6], [0.5, -0.02, 0.9], [-0.5, 0.25, 1.2], [0.12, 0.6, 2.2]]) {
    for (const k of [0, 1, 2]) kelp.push(P.sphere(0.06, k === 1 ? '#9BB24E' : '#B5A94C', { at: [x + Math.cos(r + k * 0.5) * 0.08 * k, 0.015, z + Math.sin(r + k * 0.5) * 0.08 * k], rot: [0, r + k * 0.5, 0], scale: [1.6, 0.25, 0.7] }, 8))
    kelp.push(P.sphere(0.03, '#C9A84E', { at: [x, 0.03, z] }, 6))
  }
  place.root.add(solid(merge(kelp), bag, LINE.toy))
  // The humpback: a dark back and a fin above the water, the tail lifting now and then.
  const whale = new Group()
  whale.add(
    solid(
      merge([
        P.sphere(0.22, '#4A5A7A', { at: [0, 0, 0], scale: [0.8, 0.45, 2.0] }, 14),
        P.sphere(0.16, '#E9EEF8', { at: [0, -0.05, 0.12], scale: [0.7, 0.3, 1.6] }, 10),
        P.cone(0.04, 0.09, '#4A5A7A', { at: [0, 0.1, -0.2], rot: [-0.4, 0, 0] }, 6),
        P.sphere(0.012, '#2E2233', { at: [0.13, 0.04, 0.32] }, 5),
        P.sphere(0.012, '#2E2233', { at: [-0.13, 0.04, 0.32] }, 5),
      ]),
      bag,
      LINE.toy,
    ),
  )
  const tail = solid(merge([P.sphere(0.12, '#4A5A7A', { at: [0.1, 0, 0], scale: [1, 0.2, 0.55] }, 8), P.sphere(0.12, '#4A5A7A', { at: [-0.1, 0, 0], scale: [1, 0.2, 0.55] }, 8)]), bag, LINE.small)
  tail.position.set(0, 0.0, -0.5)
  whale.add(tail)
  // (Out in the water behind Ollie, and smaller than her: only a back, a fin and a tail.)
  whale.position.set(0.5, -0.02, -0.42)
  whale.rotation.y = -0.6
  whale.scale.setScalar(0.62)
  place.root.add(whale)
  place.flag.position.set(0.6, 0.24, 0.1)
  place.update = (_dt, t) => {
    const k = place.t >= 0 ? bell(clamp(place.t / 1.2, 0, 1)) : 0
    whale.position.y = -0.03 + Math.sin(t * 0.9) * 0.015 + k * 0.06
    tail.rotation.x = 0.4 + Math.sin(t * 0.9 + 1) * 0.3 + k * 0.6
    tail.position.y = 0.04 + Math.max(0, Math.sin(t * 0.45)) * 0.12
    flutter(place, t)
  }
  return { place, whale, hole: new Vector3(0.53, 0.07, -0.37) }
}

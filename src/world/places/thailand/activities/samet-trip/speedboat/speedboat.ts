// The speedboat from Ban Phe to Koh Samet (plan: planning/around-the-world/thailand/samet-trip.html, greybox 7): the
// way onto the island. A ride, so Kaylee doesn't steer: the captain drives the family's hired speedboat from Ban Phe
// pier on the mainland across the real 5.7 km (570 game meters at the island's 1:10) to Na Dan pier, about a minute,
// while the island grows ahead. It's the real island (island/scenery.ts buildIsland and props.ts), so the boat ties up
// right where she lands.
//
// The toy (core verb): her hand in the spray. Hold a finger on the water beside the boat and Kaylee leans over the
// rail and trails her hoof in the sea there: a fan of spray flies up where her finger is, back along the hull; drag
// along the side and her hoof follows it, fast drags splash bigger. It deepens as the ride goes on, by itself:
//   1. leaving the pier, slowly: little splashes, the boat swinging out past the moored longtails;
//   2. the open sea at full speed: a big curtain of spray with a rainbow in it, and flying fish skipping out of her
//      spray (tap one: it flips);
//   3. the boats coming the other way (the ferry, a longtail, a jet ski cutting across, another speedboat): tap them
//      and they toot and wave; their wakes bounce the boat into the air, and a bump while her hoof is in the water
//      soaks Mommy. Then the turquoise shallows, slowing in to Na Dan pier: the rope, and they hop onto the pier.
// Things to poke: Kaylee (hooves up, whee), Mommy (her sun hat flies up, she catches it), Daddy (his cap blows off and
// he catches it), the captain (the horn, and the boat wiggles), the pink flag at the stern, the life ring.
//
// Greybox: simple shapes in the toon look, no voices (the captain is the pelican from cast.ts). Its feel numbers are knobs (?feel=1).
//
// ?cine=1 films the ride like a game's cutscene instead (engine3d/cinema.ts, the camera lab's "Cinema camera" switch):
// a crane up off Ban Phe pier, then cuts between a chase, a low hero shot skimming the water, over her shoulder at the
// rail, a fixed camera the boat roars past and a high wide one; a two-shot with each boat coming the other way, a crane
// up as they slow in to Na Dan, and back to the game's camera on the pier. Her finger still plays: a touch cuts to a
// shot that shows her hoof and holds it while she splashes.
import { CAPTAIN } from '../cast'
import { Color, Fog, Group, Mesh, MeshBasicMaterial, CatmullRomCurve3, Plane, Raycaster, Scene, TorusGeometry, Vector2, Vector3, type WebGLRenderer } from 'three'
import { clamp } from '../../../../../../sdk'
import { knobs, watch } from '../../../../../kit/knobs'
import { noise as hiss, sfx, tone } from '../../../../../kit/sfx'
import type { AnchorInfo } from '../../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../../engine3d/camera'
import { cinemaOn, Director, Letterbox, type CineMove } from '../../../../../engine3d/cinema'
import { buildAnimal, type Rig } from '../../../../../engine3d/characters/animal'
import { Bag } from '../../../../../engine3d/dispose'
import { blobShadow, merge, P, solid } from '../../../../../engine3d/geo'
import { setOutlineResolution } from '../../../../../engine3d/outline'
import { Particles } from '../../../../../engine3d/particles'
import { applyBands, makeLights, PAL } from '../../../../../engine3d/toon'
import type { World3D } from '../../../../../engine3d/View3D'
import { Avatar } from '../../../characters/avatar'
import { FAMILY } from '../../../characters/family'
import { Member } from '../../../characters/member'
import { wearing } from '../../../trip/packing'
import { buildSki, HIS } from '../jetski/ski'
import { at as atFrame, BAN_PHE, FRAMES, PIER } from '../island/layout'
import { buildProps } from '../island/props'
import { buildIsland, DAY, palmGeo, rng, type Island, type TimeOfDay } from '../island/scenery'

const FILE = 'src/world/places/thailand/activities/samet-trip/speedboat/speedboat.ts'
const BOAT = knobs('sametBoat', 'The speedboat ride', FILE, {
  top: { value: 12, min: 4, max: 25, step: 0.5, label: 'Top speed', unit: 'm/s', note: 'Ban Phe to Na Dan is 570 m: at 12 m/s the ride takes about a minute' },
  accel: { value: 1.8, min: 0.4, max: 6, step: 0.1, label: 'Speeds up', unit: 'm/s²' },
  brake: { value: 1.1, min: 0.3, max: 4, step: 0.05, label: 'Slows in to the pier', unit: 'm/s²' },
  waves: { value: 0.38, min: 0, max: 1.2, step: 0.02, label: 'Waves out at sea', unit: 'm' },
  bump: { value: 2.6, min: 0, max: 6, step: 0.1, label: 'A wake bumps it up', unit: 'm/s' },
  plane: { value: 0.07, min: 0, max: 0.25, step: 0.01, label: 'Bow lifts at speed', unit: 'rad' },
  skip: { value: 12, min: 3, max: 40, step: 1, label: 'Skip button after', unit: 's' },
})
const SPRAY = knobs('sametSpray', 'Her hoof in the spray', FILE, {
  rate: { value: 120, min: 10, max: 300, step: 5, label: 'Drops a second', note: 'at full speed (fewer when slow)' },
  up: { value: 4.6, min: 0.5, max: 10, step: 0.1, label: 'Spray height', unit: 'm/s' },
  size: { value: 0.28, min: 0.06, max: 0.6, step: 0.01, label: 'Drop size', unit: 'm' },
  drag: { value: 700, min: 100, max: 2000, step: 50, label: 'Big splash at', unit: 'px/s', note: 'dragging her finger this fast along the side doubles the spray' },
  along: { value: 2.4, min: 0.5, max: 3.2, step: 0.1, label: 'Hoof reaches along', unit: 'm', note: 'how far forward and back along the side her hoof can go' },
  lean: { value: 0.32, min: 0, max: 0.8, step: 0.02, label: 'Leans over', unit: 'rad' },
  fish: { value: 3.2, min: 0.8, max: 12, step: 0.1, label: 'A flying fish every', unit: 's', note: 'while her hoof is in the water at speed' },
  rainbow: { value: 0.55, min: 0, max: 1, step: 0.05, label: 'Rainbow', note: 'how bright the rainbow in the spray is' },
})
const CAM = knobs('sametBoatCam', 'The speedboat camera', FILE, {
  pitch: { value: 15, min: 5, max: 60, step: 1, label: 'Looks down', unit: '°' },
  tallPitch: { value: 13, min: 5, max: 70, step: 1, label: 'Looks down (portrait)', unit: '°' },
  box: { value: 3, min: 1.5, max: 12, step: 0.1, label: 'Shows round the boat', unit: 'm' },
  ahead: { value: 3.5, min: 0, max: 20, step: 0.5, label: 'Looks ahead', unit: 'm' },
  side: { value: 16, min: -60, max: 60, step: 1, label: 'From the side', unit: '°', note: 'how far round from behind the boat (her side of it)' },
  far: { value: 110, min: 60, max: 400, step: 10, label: 'Draws plants out to', unit: 'm', note: 'further trees are left to the haze (fewer draw calls on the iPad)' },
})

const CINE = knobs('sametBoatCine', 'The speedboat cinema camera (?cine=1)', FILE, {
  pace: { value: 1, min: 0.4, max: 2.5, step: 0.05, label: 'Shot length ×', note: 'how long each shot runs before the next cut' },
})

/** The cinema camera's shots (?cine=1), in the boat's frame: x to its right, y up from the water, z toward the bow
 *  (the boat is 7.2 m, stern at -3.3; Kaylee sits on the side bench at about x 0.8, z -0.4). In the rotation in this
 *  order; `event` ones are cut to when something happens. */
const MOVES: CineMove[] = [
  // Leaving Ban Phe: a crane up and round, the sea opening out ahead.
  { id: 'open', event: true, dur: 6, from: { eye: [10, 2.2, 14], look: [0, 1.2, 0], fov: 36 }, to: { eye: [18, 9, 2], look: [0, 1.2, 3], fov: 42 } },
  // A chase from behind and above: both sides of the boat, the island ahead.
  { id: 'chase', playable: true, dur: 7, from: { eye: [-2, 2.6, -11], look: [0, 1.4, 3], fov: 50 }, to: { eye: [1.5, 3.2, -10], look: [0, 1.2, 4], fov: 48 } },
  // The hero shot: low over the water ahead of the bow, the boat bearing down on the lens.
  { id: 'skim', dur: 5, from: { eye: [4, 1, 16], look: [0, 1.3, 0], fov: 34 }, to: { eye: [2.6, 0.9, 11], look: [0, 1.4, 0], fov: 36 }, sway: 0.08 },
  // Over her shoulder at the rail: her hoof, the spray, the sea going by.
  { id: 'rail', playable: true, mirror: true, dur: 6, from: { eye: [3.6, 2.4, -4.5], look: [1, 0.8, 1.8], fov: 52 }, to: { eye: [3.2, 2.1, -3.2], look: [1, 0.7, 2.2], fov: 50 } },
  // A camera set down on the water ahead: the boat roars past it and away.
  { id: 'flyby', anchor: 'fixed', mirror: true, dur: 5.5, from: { eye: [6, 1.4, 34], look: [0, 1.3, 0], fov: 40 }, sway: 0.03 },
  // High and wide, drifting across: the whole crossing, the island growing ahead.
  { id: 'aerial', dur: 7, from: { eye: [-14, 18, -10], look: [0, 0.5, 6], fov: 42 }, to: { eye: [12, 15, -4], look: [0, 0.5, 8], fov: 40 }, sway: 0.1 },
  // A boat coming the other way: from the far side of hers, looking past the family at it.
  { id: 'pass', event: true, mirror: true, twoShot: 0.5, dur: 5.5, from: { eye: [-2.5, 2.2, -9], look: [0, 1.4, 4], fov: 48 }, to: { eye: [-2, 2.5, -7], look: [0, 1.4, 4], fov: 46 } },
  // Slowing in to Na Dan: a crane up from the front quarter, the pier and the beach behind.
  { id: 'arrive', event: true, dur: 9, from: { eye: [8, 1.8, 10], look: [0, 1, 0], fov: 40 }, to: { eye: [12, 7, 3], look: [0, 1, -1], fov: 42 } },
]

/** The captain: a pelican in a navy captain's cap (cast.ts). */
const CAPTAIN_LOOK = CAPTAIN

/** The boat: 7.2 m, faces +z. Where the hull's sides are (local x), its floor, and the seats. */
const HALF_W = 1.2
const FLOOR = 0.72
const BENCH = 1.14
const STERN_Z = -3.3

export type BoatPhase = 'pier' | 'ride' | 'dock' | 'off'

export interface BoatStart {
  time?: TimeOfDay | null
  /** What she packed (her sun hat and sunglasses go on). */
  packed?: string[]
}
export interface BoatEvents {
  /** They're on the pier at Na Dan: the island next. */
  done(): void
}

export const BOAT_ANCHORS: AnchorInfo[] = [
  { id: 'kaylee', label: 'Kaylee', kind: 'thing' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'captain', label: 'The captain', kind: 'thing' },
  { id: 'flag', label: 'The pink flag', kind: 'thing' },
  { id: 'ring', label: 'The life ring', kind: 'thing' },
  { id: 'pass:ferry', label: 'The ferry', kind: 'thing' },
  { id: 'pass:longtail', label: 'A longtail boat', kind: 'thing' },
  { id: 'pass:ski', label: 'A jet ski', kind: 'thing' },
  { id: 'pass:speed', label: 'Another speedboat', kind: 'thing' },
  ...[0, 1, 2, 3].map((i) => ({ id: `fish:${i}`, label: 'A flying fish', kind: 'thing' as const })),
]

type PassId = 'ferry' | 'longtail' | 'ski' | 'speed'
interface Passer {
  id: PassId
  root: Group
  /** The people on it (they bounce and wave when she taps it). */
  crew: Group
  /** Where along the route it meets her boat (0..1), which side (+1: her right) and how far off, its speed. */
  meet: number
  side: number
  off: number
  speed: number
  /** Where it is along the route (m) once it's on its way; -1 before. */
  s: number
  /** The jet ski cuts across: how far across it is. */
  across: number
  wave: number
  bumped: boolean
  h: number
}

interface FlyFish {
  root: Group
  t: number
  /** Where it starts, and its velocity. */
  p: Vector3
  v: Vector3
  flip: number
  live: boolean
}

const DEG = 180 / Math.PI
const HINT_S = 8
const tmp = new Vector3()
const tmp2 = new Vector3()
const tmp3 = new Vector3()
const ease = (dt: number, k: number) => 1 - Math.exp(-dt * k)

/** The family's speedboat: white with a pink stripe, a blue sun canopy over the back, a console up front. */
function buildBoat(bag: Bag, stripe: string = PAL.hotpink) {
  const root = new Group()
  const tilt = new Group()
  const body = new Group()
  root.add(tilt)
  tilt.add(body)
  const W = '#FFFFFF'
  const cushion = '#FFB6D3'
  const parts = [
    P.rbox(2.4, 0.9, 6.8, 0.36, W, { at: [0, 0.27, -0.1] }),
    P.cone(1.2, 1.7, W, { at: [0, 0.27, 3.9], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.38] }, 12),
    P.box(2.42, 0.16, 6.6, stripe, { at: [0, 0.45, -0.1] }),
    P.box(2.42, 0.07, 6.6, PAL.sky, { at: [0, 0.3, -0.1] }),
    P.box(2.05, 0.06, 6.2, '#F1E6D8', { at: [0, FLOOR, -0.2] }),
    // The sides (gunwales) and the rail along them.
    ...[-1, 1].flatMap((s) => [P.rbox(0.14, 0.42, 6.2, 0.05, W, { at: [s * (HALF_W - 0.07), FLOOR + 0.2, -0.2] }), P.box(0.06, 0.06, 5.6, '#D8DEEA', { at: [s * (HALF_W - 0.07), FLOOR + 0.62, -0.4] }), ...[-2.6, -0.6, 1.4].map((z) => P.cyl(0.03, 0.03, 0.24, '#D8DEEA', { at: [s * (HALF_W - 0.07), FLOOR + 0.5, z] }, 5))]),
    // The console with its windscreen and wheel.
    P.rbox(1.0, 0.95, 0.8, 0.14, '#F6F3FA', { at: [0.45, FLOOR + 0.47, 1.3] }),
    P.rbox(1.1, 0.42, 0.07, 0.03, '#9FD5F2', { at: [0.45, FLOOR + 1.12, 1.66], rot: [-0.45, 0, 0] }),
    P.torus(0.17, 0.035, '#5C5468', { at: [0.45, FLOOR + 1.05, 0.88], rot: [0.9, 0, 0] }),
    // The back bench (Mommy and Daddy) and the side benches (Kaylee).
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
  // The pink flag at the stern (it flutters).
  const flag = new Group()
  flag.position.set(-0.85, FLOOR + 1.85, -3.05)
  flag.add(solid(merge([P.cyl(0.025, 0.025, 1.1, '#D8DEEA', { at: [0, 0.55, 0] }, 5)]), bag, 2))
  const cloth = new Group()
  cloth.position.y = 0.95
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

/** The Ban Phe pier on the mainland: a strip of shore, the town behind, and a long pier out into the sea (its south
 *  end at the ride's start). No temples or shrines (AGENTS.md rule 7): shops, palms, boats. */
function buildBanPhe(bag: Bag) {
  const g = new Group()
  const R = rng(20261105)
  const x0 = BAN_PHE.x
  const z0 = BAN_PHE.z
  const parts = [
    // The land and its sand front.
    P.sphere(1, '#9ED48E', { at: [x0, -3.2, z0 - 46], scale: [340, 7, 42] }, 24),
    P.sphere(1, '#F6E7C8', { at: [x0, -0.9, z0 - 10], scale: [330, 1.6, 12] }, 24),
    // The pier: a deck on posts, out to sea.
    P.rbox(3.4, 0.3, 40, 0.06, '#E9E3D8', { at: [x0 + 4, 1.0, z0 + 14] }),
    ...Array.from({ length: 9 }, (_, i) => [-1, 1].map((s) => P.cyl(0.15, 0.15, 3.4, '#CFC7B8', { at: [x0 + 4 + s * 1.55, -0.6, z0 - 4 + i * 4.6] }, 7))).flat(),
    ...[-1, 1].map((s) => P.box(0.08, 0.08, 38, '#5FA2E0', { at: [x0 + 4 + s * 1.55, 1.95, z0 + 14] })),
    // A ticket hut at the end of the pier (blue roof).
    P.rbox(2.6, 2.0, 2.4, 0.12, '#FFF6E8', { at: [x0 + 4, 2.15, z0 + 0.5] }),
    P.rbox(3.2, 0.2, 3.0, 0.06, '#3F8FE8', { at: [x0 + 4, 3.25, z0 + 0.5] }),
    // The town: a row of little shophouses in sweet colors.
    ...Array.from({ length: 14 }, (_, i) => {
      const w = 6 + R() * 4
      const h = 5 + R() * 6
      const c = ['#FFD7E6', '#FFF1B8', '#CDEFD9', '#D7E6FF', '#F3DDF7', '#FFE2C8'][i % 6]
      return P.box(w, h, 7, c, { at: [x0 - 70 + i * 11 + R() * 2, h / 2 - 0.4, z0 - 24 - R() * 6] })
    }),
  ]
  const palms: ReturnType<typeof palmGeo> = []
  for (let i = 0; i < 12; i++) {
    const px = x0 - 60 + i * 11 + R() * 4
    palms.push(...palmGeo(R, new Vector3(px, -0.2, z0 - 12 - R() * 4), 6 + R() * 2.5, new Vector3((R() - 0.5) * 0.8, 0, 0.6)))
  }
  g.add(solid(merge([...parts, ...palms]), bag, 2))
  // Two longtails moored by the pier.
  for (const [dx, dz] of [[-4.5, 22], [11, 18]] as const) {
    const lt = solid(merge([P.rbox(1.1, 0.5, 5.6, 0.2, '#9A6B44', { at: [0, 0.15, 0] }), P.box(1.12, 0.1, 5.62, '#4FA3C9', { at: [0, 0.36, 0] }), P.cone(0.2, 1.6, '#9A6B44', { at: [0, 0.95, 2.9], rot: [0.5, 0, 0] }, 6), P.sphere(0.22, PAL.hotpink, { at: [0, 1.5, 3.25] }, 8)]), bag, 2)
    lt.position.set(x0 + dx, 0, z0 + dz)
    lt.rotation.y = 0.2
    g.add(lt)
  }
  return g
}

/** A boat coming the other way. */
function buildPasser(bag: Bag, id: PassId) {
  const root = new Group()
  const crew = new Group()
  root.add(crew)
  const person = (x: number, y: number, z: number, c: string) => [P.capsule(0.22, 0.4, c, { at: [x, y + 0.42, z] }), P.sphere(0.22, '#F3D3B5', { at: [x, y + 0.95, z] }, 10)]
  if (id === 'ferry') {
    // The big wooden ferry to Na Dan, white and blue with a roof, a row of passengers.
    root.add(solid(merge([P.rbox(4, 1.6, 15, 0.4, '#FFFFFF', { at: [0, 0.4, 0] }), P.box(4.02, 0.35, 15.02, '#3F8FE8', { at: [0, 0.7, 0] }), P.cone(2, 2.6, '#FFFFFF', { at: [0, 0.4, 8.6], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.4] }, 10), P.rbox(3.6, 0.2, 10, 0.06, '#F06A6A', { at: [0, 3.4, -1] }), ...[-1, 1].flatMap((s) => [-5.5, -1, 3.5].map((z) => P.cyl(0.07, 0.07, 2.2, '#F4EEE6', { at: [s * 1.6, 2.3, z] }, 6)))]), bag, 2.5))
    crew.add(solid(merge([-4, -2, 0, 2].flatMap((z, i) => person(1.4 * (i % 2 ? 1 : -1), 1.2, z, ['#FF9AC8', '#8FD3FF', '#FFE07A', '#9EE6B8'][i]))), bag, 2))
  } else if (id === 'longtail') {
    root.add(solid(merge([P.rbox(1.2, 0.55, 7, 0.22, '#9A6B44', { at: [0, 0.15, 0] }), P.box(1.22, 0.12, 7.02, '#4FA3C9', { at: [0, 0.38, 0] }), P.cone(0.22, 1.8, '#9A6B44', { at: [0, 1.0, 3.6], rot: [0.5, 0, 0] }, 6), P.sphere(0.24, PAL.hotpink, { at: [0, 1.6, 4] }, 8), P.sphere(0.2, PAL.butter, { at: [0.1, 1.45, 3.95] }, 8), P.box(0.2, 0.2, 2, '#5C5468', { at: [0, 0.55, -4.2], rot: [0.25, 0, 0] })]), bag, 2))
    crew.add(solid(merge([...person(0, 0.3, -2.6, '#FFB36B'), ...person(0, 0.3, 0.4, '#C7A8F0')]), bag, 2))
  } else if (id === 'ski') {
    const ski = buildSki(bag, HIS)
    root.add(ski.root)
    crew.add(solid(merge(person(0, 0.62, -0.2, '#FF8A2E')), bag, 2))
  } else {
    const b = buildBoat(bag, PAL.mint)
    root.add(b.root)
    crew.add(solid(merge([...person(0.45, FLOOR, 0.6, '#FFFFFF'), ...person(-0.5, FLOOR, -2.4, '#FF9AC8'), ...person(0.5, FLOOR, -2.4, '#8FD3FF')]), bag, 2))
  }
  return { root, crew }
}

/** A flying fish: a silver-blue body with long wing fins. */
function buildFlyFish(bag: Bag) {
  const root = new Group()
  root.add(solid(merge([P.sphere(0.13, '#8FB8E8', { scale: [1, 0.8, 2.4] }, 10), P.sphere(0.1, '#E8F2FF', { at: [0, -0.03, 0.02], scale: [0.9, 0.6, 2.2] }, 8), ...[-1, 1].map((s) => P.box(0.5, 0.015, 0.22, '#B9D7FF', { at: [s * 0.3, 0.02, 0.05], rot: [0, s * 0.25, s * 0.12] })), P.cone(0.12, 0.2, '#8FB8E8', { at: [0, 0, -0.38], rot: [-Math.PI / 2, 0, 0], scale: [0.3, 1, 1] }, 6)]), bag, 1.5))
  root.visible = false
  return root
}

/** A rainbow: five thin pastel arcs (see-through), shown in the spray. */
function buildRainbow(bag: Bag) {
  const g = new Group()
  const cols = ['#FF8FA8', '#FFC36B', '#FFF08A', '#9EE6A8', '#9CC8FF', '#C7A8F0']
  const mats: MeshBasicMaterial[] = []
  cols.forEach((c, i) => {
    const m = bag.add(new MeshBasicMaterial({ color: new Color(c), transparent: true, opacity: 0, depthWrite: false, fog: false }))
    mats.push(m)
    const arc = new Mesh(bag.add(new TorusGeometry(1.5 - i * 0.09, 0.045, 6, 32, Math.PI)), m)
    g.add(arc)
  })
  g.visible = false
  return { g, mats }
}

export class SametSpeedboat implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private isl: Island
  private anchorEls = new Map<string, HTMLElement>()
  private hintEl: HTMLElement | null = null
  private raycaster = new Raycaster()
  private water0 = new Plane(new Vector3(0, 1, 0), 0)
  private unwatch: () => void
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private cullT = 0
  private phase: BoatPhase = 'pier'
  private phaseT = 0

  // ---- The route and the boat.
  private route: CatmullRomCurve3
  private len: number
  private s = 0
  private v = 0
  private heading = 0
  private boat: ReturnType<typeof buildBoat>
  private shadow: Mesh
  private lift = 0
  private liftV = 0
  private wiggleT = -1
  private pos = new Vector3()
  private fwd = new Vector3(0, 0, 1)
  private xAxis = new Vector3(1, 0, 0)

  // ---- The people.
  private kaylee: Avatar
  private nick: Member
  private ji: Member
  private captain: Rig
  private nickCap: Group | null = null
  private capT = -1
  private hatT = -1

  // ---- Her hoof in the spray.
  private finger: { x: number; y: number; t: number; speed: number } | null = null
  private side = 1
  private along = -0.4
  private dip = 0
  private sprayAcc = 0
  private fishT = 0
  private hissT = 0
  private lastTouch = 0
  private spray: Particles
  private splash: Particles
  private sparkle: Particles
  private rainbow: ReturnType<typeof buildRainbow>
  private fish: FlyFish[] = []
  private passers: Passer[] = []
  // ---- The cinema camera (?cine=1).
  private dir = new Director(MOVES, 'open')
  private bars = new Letterbox()
  private filmed = new Set<PassId>()
  private filming: PassId | null = null
  private arrived = false
  private counts = { sprays: 0, splashes: 0, fish: 0, fishTaps: 0, waves: 0, bumps: 0, soaks: 0, pokes: 0, skips: 0 }
  private skipped = false

  constructor(
    private renderer: WebGLRenderer,
    start: BoatStart,
    private events: BoatEvents,
  ) {
    const { scene, bag } = this
    const time = start.time ?? 'morning'
    scene.fog = new Fog(DAY[time].haze, 200, 1100)
    applyBands()
    this.rig.fov = 46
    this.rig.lag = 0.3
    this.rig.camera.far = 3200

    // ---- The island (and Na Dan pier), the mainland at Ban Phe.
    this.isl = buildIsland(bag)
    scene.add(this.isl.root)
    this.isl.setTime(time)
    const props = buildProps(bag, this.isl.root, this.isl.ground, this.isl.blockers, this.isl.cullable)
    // (Its speedboat at Na Dan is this one: it ties up there.)
    for (const p of props.pokes.values()) if (p.kind === 'speedboat') p.g.visible = false
    scene.add(buildBanPhe(bag))

    // ---- The route: off the end of Ban Phe pier, across the sea, round to Na Dan pier's side.
    const f = FRAMES.nadan
    const P0 = new Vector3(BAN_PHE.x + 7.5, 0, BAN_PHE.z + 30)
    const dock = atFrame(f, -7.5, 22)
    const a1 = atFrame(f, -7.5, 48)
    const a2 = atFrame(f, -9, 105)
    const mid = { x: (P0.x + a2.x) / 2 + 30, z: (P0.z + a2.z) / 2 }
    this.route = new CatmullRomCurve3([P0, new Vector3(P0.x + 1, 0, P0.z + 30), new Vector3(P0.x + 18, 0, P0.z + 90), new Vector3(mid.x, 0, mid.z), new Vector3(a2.x, 0, a2.z), new Vector3(a1.x, 0, a1.z), new Vector3(dock.x, 0, dock.z)], false, 'centripetal')
    this.len = this.route.getLength()

    // ---- The boat, the captain at the wheel, Mommy and Daddy on the back bench, Kaylee on the side bench.
    this.boat = buildBoat(bag)
    scene.add(this.boat.root)
    this.shadow = blobShadow(1.5, bag)
    this.shadow.scale.set(1, 1, 2.6)
    this.shadow.visible = false
    this.captain = buildAnimal(CAPTAIN_LOOK, bag)
    this.captain.root.position.set(0.45, FLOOR, 0.62)
    this.boat.body.add(this.captain.root)
    const fam = (id: string) => new Member({ ...FAMILY.find((m) => m.id === id)!, spot: null }, bag)
    this.nick = fam('nick')
    this.ji = fam('ji')
    this.boat.body.add(this.nick.root, this.ji.root)
    this.nick.place(0.5, BENCH - 0.1 * this.nick.height, -2.55, 0, 'sit')
    this.ji.place(-0.5, BENCH - 0.1 * this.ji.height, -2.55, 0, 'sit')
    this.kaylee = new Avatar(bag)
    if (start.packed?.length) this.kaylee.wear(wearing(start.packed).filter((w) => w !== 'floaties'))
    this.boat.body.add(this.kaylee.root)
    this.kaylee.place(0.8, BENCH, -0.4, 0)
    this.kaylee.setPose('sit')
    // Daddy's cap (blows off when she pokes him): his face's top.
    const nf = this.nick.rig.face
    this.nickCap = new Group()
    this.nickCap.add(solid(merge([P.sphere(nf.R * 0.98, '#3F6FB8', { scale: [1, 0.55, 1] }, 14), P.box(nf.R * 1.1, 0.03, nf.R * 0.9, '#3F6FB8', { at: [0, -nf.R * 0.2, nf.R * 0.85] })]), bag, 2))
    this.nickCap.position.set(0, nf.headY + nf.R * 0.55, 0)
    this.nick.rig.head.add(this.nickCap)

    // ---- The others on the water: they meet her on the way.
    const defs: [PassId, number, number, number, number][] = [
      ['ferry', 0.26, 1, 32, 5],
      ['longtail', 0.44, -1, 20, 6],
      ['ski', 0.6, 1, 0, 11],
      ['speed', 0.76, -1, 26, 10],
    ]
    for (const [id, meet, side, off, speed] of defs) {
      const b = buildPasser(bag, id)
      b.root.visible = false
      scene.add(b.root)
      this.passers.push({ id, root: b.root, crew: b.crew, meet, side, off, speed, s: -1, across: 0, wave: -1, bumped: false, h: 0 })
    }
    for (let i = 0; i < 4; i++) {
      const root = buildFlyFish(bag)
      scene.add(root)
      this.fish.push({ root, t: 0, p: new Vector3(), v: new Vector3(), flip: -1, live: false })
    }
    this.rainbow = buildRainbow(bag)
    scene.add(this.rainbow.g)

    this.spray = new Particles({ kind: 'spray', count: 420, colors: ['#FFFFFF', '#EAFBFF', '#C9F6EC', '#DFF4FF'], gravity: 9 }, bag)
    this.splash = new Particles({ kind: 'spray', count: 260, colors: ['#FFFFFF', '#EAFBFF', '#BFEFFF'], gravity: 9 }, bag)
    this.sparkle = new Particles({ kind: 'spray', count: 120, colors: ['#FFFFFF', '#FFF6B8', PAL.gold, PAL.pink], gravity: -0.6 }, bag)
    scene.add(this.spray.mesh, this.splash.mesh, this.sparkle.mesh)

    this.isl.lagoon.waves.height = BOAT.waves
    this.isl.lagoon.waves.dir = { x: 0.5, z: 0.86 }
    this.isl.lagoon.waves.length = 18
    this.placeBoat(0)
    this.unwatch = watch('speedboat', () => ({
      'her finger (px/s)': [this.finger?.speed ?? 0, SPRAY.drag * 1.5],
      'spray (0..1)': [this.dip, 1.2],
      'boat speed (m/s)': [this.v, BOAT.top * 1.2],
    }))
  }

  // ---------------------------------------------------------------- World3D

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.tall = h > w
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
    this.rig.setShot(this.shot(), true)
  }
  setAnchorElements(els: Map<string, HTMLElement>) {
    this.anchorEls = els
  }
  setHintElement(el: HTMLElement | null) {
    this.hintEl = el
  }
  get calm() {
    return false
  }
  /** How far along the ride (0..1), and whether the skip button should show. */
  get progress() {
    return this.s / this.len
  }
  get canSkip() {
    return this.phase === 'ride' && this.time > BOAT.skip && this.s < this.len - 110 && !this.skipped
  }
  /** ⏩: on to the turquoise water by the pier. */
  skip() {
    if (!this.canSkip) return
    this.skipped = true
    this.counts.skips++
    this.s = this.len - 110
    this.v = Math.min(this.v, BOAT.top * 0.8)
    for (const p of this.passers) {
      p.root.visible = false
      p.s = -2
    }
    this.placeBoat(0)
    this.rig.setShot(this.shot(), true)
    this.dir.cut('skim')
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.phaseT += dt
    this.drive(dt, t)
    this.hoof(dt)
    this.others(dt, t)
    this.people(dt, t)
    for (const p of [this.spray, this.splash, this.sparkle]) p.update(dt)

    const c = this.pos
    this.isl.lagoon.waves.height = BOAT.waves * clamp((this.len - this.s) / 160, 0.35, 1)
    this.isl.lagoon.update(t, c.x, c.z)
    this.lights.follow(c.x, 0, c.z)
    if ((this.cullT -= dt) <= 0) {
      this.cullT = 0.5
      this.isl.cull(c.x, c.z, CAM.far)
    }
    this.isl.update(dt, t, this.rig.camera.position.x, this.rig.camera.position.z, this.lights)
    this.rig.setShot(this.shot())
    this.film(dt)
    this.rig.update(dt)
    this.bars.update(dt, this.rig.cinema)
    this.drawHint(t)
  }

  // ---------------------------------------------------------------- the ride

  private setPhase(p: BoatPhase) {
    this.phase = p
    this.phaseT = 0
  }
  private waterAt(x: number, z: number) {
    return this.isl.lagoon.heightAt(x, z, this.time, this.isl.ground.shoreAt(x, z))
  }

  private drive(dt: number, t: number) {
    if (this.phase === 'pier') {
      // The motors cough into life, and off they go.
      if (this.phaseT > 0.3 && this.phaseT - dt <= 0.3) tone(90, 140, 0.6, 0.06, 'sawtooth')
      if (this.phaseT > 1.6) {
        this.setPhase('ride')
        tone(110, 260, 0.9, 0.05, 'sawtooth')
      }
    } else if (this.phase === 'ride') {
      const left = this.len - this.s
      const want = Math.min(BOAT.top, Math.sqrt(2 * BOAT.brake * Math.max(0, left)) + 0.4)
      if (this.v < want) this.v = Math.min(want, this.v + BOAT.accel * dt)
      else this.v = Math.max(want, this.v - BOAT.brake * 2 * dt)
      this.s = Math.min(this.len, this.s + this.v * dt)
      if (left < 0.4) {
        this.s = this.len
        this.v = 0
        this.setPhase('dock')
        sfx.thump()
        tone(300, 220, 0.2, 0.05, 'triangle')
      }
      // The motors' hum, a little higher the faster it goes.
      if ((this.hissT -= dt) <= 0) {
        this.hissT = 0.5
        if (this.v > 1) tone(70 + this.v * 6, 75 + this.v * 6, 0.5, 0.012, 'sawtooth')
      }
    } else if (this.phase === 'dock') {
      // Tied up: Kaylee hops onto the pier, Mommy and Daddy after her.
      if (this.phaseT > 0.8 && this.kaylee.root.parent !== this.scene) this.hopOff()
      if (this.phaseT > 3.2) {
        this.setPhase('off')
        this.events.done()
      }
    }
    // The wiggle when she pokes the captain: a little S on the water.
    let wig = 0
    if (this.wiggleT >= 0) {
      this.wiggleT += dt
      wig = Math.sin(this.wiggleT * 7) * 0.22 * Math.max(0, 1 - this.wiggleT / 1.6)
      if (this.wiggleT > 1.6) this.wiggleT = -1
    }
    // Up in the air off a wake, and down with a splash.
    if (this.lift > 0 || this.liftV > 0) {
      this.liftV -= 9.8 * dt
      this.lift += this.liftV * dt
      if (this.lift <= 0) {
        const hard = -this.liftV
        this.lift = 0
        this.liftV = 0
        this.land(hard)
      }
    }
    this.placeBoat(wig, t)
  }

  private placeBoat(wig: number, t = this.time) {
    const u = clamp(this.s / this.len, 0, 1)
    const p = this.route.getPointAt(u)
    const tan = this.route.getTangentAt(u)
    this.heading = Math.atan2(tan.x, tan.z) + wig
    this.fwd.set(Math.sin(this.heading), 0, Math.cos(this.heading))
    this.xAxis.set(this.fwd.z, 0, -this.fwd.x)
    const hb = this.waterAt(p.x + this.fwd.x * 3, p.z + this.fwd.z * 3)
    const hs = this.waterAt(p.x - this.fwd.x * 3, p.z - this.fwd.z * 3)
    const hl = this.waterAt(p.x - this.xAxis.x * 1.2, p.z - this.xAxis.z * 1.2)
    const hr = this.waterAt(p.x + this.xAxis.x * 1.2, p.z + this.xAxis.z * 1.2)
    const y = (hb + hs + hl + hr) / 4
    this.pos.set(p.x, y, p.z)
    const b = this.boat
    b.root.position.set(p.x, y + this.lift, p.z)
    b.root.rotation.y = this.heading
    const speedK = this.v / BOAT.top
    b.tilt.rotation.x = -Math.atan2(hb - hs, 6) - BOAT.plane * speedK - (this.lift > 0 ? 0.06 : 0)
    b.tilt.rotation.z = Math.atan2(hr - hl, 2.4) * 0.8 + wig * 0.5 + (this.dip > 0 ? -this.side * 0.025 : 0)
    // The flag streams back faster the faster it goes.
    b.cloth.rotation.y = Math.sin(t * (6 + speedK * 14)) * (0.15 + speedK * 0.2)
    b.ring.rotation.x *= 0.96
  }

  /** Off a wake: up it goes (a bigger wake, higher). */
  private bump(k: number) {
    if (this.phase !== 'ride' || this.lift > 0) return
    this.liftV = BOAT.bump * k
    this.lift = 0.001
    this.counts.bumps++
    tone(520, 880, 0.18, 0.05, 'sine')
  }
  private land(hard: number) {
    const p = this.pos
    sfx.splash()
    this.splash.burst(p.x + this.fwd.x * 2, p.y + 0.4, p.z + this.fwd.z * 2, Math.round(10 + hard * 8), 2 + hard * 0.6, 2 + hard * 0.5, 0.2)
    this.kaylee.react('hop')
    this.nick.react('hop')
    this.ji.react('hop')
    // Her hoof in the water as it lands: a big wave of spray right over Mommy.
    if (this.dip > 0.2 && hard > 1.2) {
      this.counts.soaks++
      const m = this.ji.root.getWorldPosition(tmp)
      this.splash.burst(m.x, m.y + 1.6, m.z, 26, 1.2, 0.5, 0.18)
      this.ji.react('wiggle')
      this.hatT = 0
      window.setTimeout(() => sfx.boing(), 300)
    }
  }

  private hopOff() {
    const k = this.kaylee
    this.scene.attach(k.root)
    k.setPose('stand')
    const f = FRAMES.nadan
    const pier = atFrame(f, -4, 22.5)
    k.hopTo(new Vector3(pier.x, PIER.y, pier.z), 0.5, 0.7, () => k.faceToward(atFrame(f, -4, 0).x, atFrame(f, -4, 0).z))
    sfx.fwip()
    for (const [m, i] of [[this.ji, 1], [this.nick, 2]] as const) {
      window.setTimeout(() => {
        this.scene.attach(m.root)
        const q = atFrame(f, -4 + (i === 1 ? -0.9 : 0.9), 21.2)
        m.place(q.x, PIER.y, q.z, Math.atan2(-f.n.x, -f.n.z) * DEG, 'stand')
        m.react('hop')
        sfx.fwip()
      }, 350 * i)
    }
  }

  // ---------------------------------------------------------------- her hoof in the spray

  private hoof(dt: number) {
    const k = this.kaylee
    const out = this.finger && this.phase !== 'dock' && this.phase !== 'off'
    if (out && this.finger) {
      // Where her finger is on the water, beside the boat: that side, and that far along it.
      const g = this.pick(this.finger.x, this.finger.y, tmp)
      if (g) {
        const dx = g.x - this.pos.x
        const dz = g.z - this.pos.z
        const lx = dx * this.xAxis.x + dz * this.xAxis.z
        const lz = dx * this.fwd.x + dz * this.fwd.z
        const want = lx >= 0 ? 1 : -1
        if (want !== this.side) this.side = want
        this.along += (clamp(lz, -SPRAY.along, SPRAY.along * 0.55) - this.along) * ease(dt, 10)
      }
      const drag = clamp((this.finger.speed ?? 0) / SPRAY.drag, 0, 1)
      this.dip += (0.6 + 0.4 * drag - this.dip) * ease(dt, 8)
      this.finger.speed *= Math.exp(-dt * 6)
    } else this.dip += (0 - this.dip) * ease(dt, 6)
    if (this.dip < 0.01) this.dip = 0
    const lean = this.dip > 0.05 ? 1 : 0

    // Kaylee slides along the side bench to her finger's side and leans out over the rail.
    if (k.root.parent === this.boat.body) {
      const kx = this.side * 0.8
      const kz = clamp(this.along, -1.5, 0.7)
      k.root.position.x += (kx - k.root.position.x) * ease(dt, 6)
      k.root.position.z += (kz - k.root.position.z) * ease(dt, 6)
      k.root.position.y = BENCH
      k.root.rotation.y += (this.side * 0.6 * lean - k.root.rotation.y) * ease(dt, 6)
      k.root.rotation.z += (-this.side * SPRAY.lean * lean - k.root.rotation.z) * ease(dt, 6)
      const arm = this.side > 0 ? k.rig.armL : k.rig.armR
      const other = this.side > 0 ? k.rig.armR : k.rig.armL
      arm.rotation.x += (-1.3 * lean - arm.rotation.x) * ease(dt, 8)
      arm.rotation.z += ((this.side > 0 ? -0.3 : 0.3) * lean - arm.rotation.z) * ease(dt, 8)
      other.rotation.x += (0 - other.rotation.x) * ease(dt, 8)
      other.rotation.z += (0 - other.rotation.z) * ease(dt, 8)
    }

    // The spray where her hoof is in the water: a fan up and back along the hull, more the faster the boat goes.
    if (this.dip > 0.05) {
      const hand = this.handPoint(tmp2)
      const speedK = clamp(this.v / BOAT.top, 0.15, 1)
      this.sprayAcc += SPRAY.rate * this.dip * speedK * dt * (this.finger && this.finger.speed > SPRAY.drag ? 2 : 1)
      while (this.sprayAcc >= 1) {
        this.sprayAcc -= 1
        const r = Math.random()
        const up = SPRAY.up * (0.5 + 0.6 * Math.random()) * (0.5 + this.dip * 0.6) * (0.4 + speedK * 0.6)
        const o = this.side * (0.6 + Math.random() * 1.4)
        this.spray.emit(hand.x, hand.y + 0.05, hand.z, this.fwd.x * this.v * 0.55 + this.xAxis.x * o, up, this.fwd.z * this.v * 0.55 + this.xAxis.z * o, 0.7 + r * 0.5, SPRAY.size * (0.6 + Math.random() * 0.8))
      }
      if ((this.hissT -= dt * 0.5) <= 0) {
        this.hissT = 0.3
        hiss(0.32, 0.025 + this.dip * 0.02, 'highpass', 2600, 1800)
      }
      // The rainbow in the spray (the sun's behind her).
      const rb = this.rainbow
      rb.g.visible = SPRAY.rainbow > 0 && speedK > 0.5
      if (rb.g.visible) {
        rb.g.position.set(hand.x + this.xAxis.x * this.side * 1.4 - this.fwd.x * 1.6, hand.y + 0.2, hand.z + this.xAxis.z * this.side * 1.4 - this.fwd.z * 1.6)
        rb.g.lookAt(this.rig.camera.position)
        const op = SPRAY.rainbow * clamp((this.dip - 0.3) * 2, 0, 1) * clamp((speedK - 0.5) * 3, 0, 1)
        for (const m of rb.mats) m.opacity = op
      }
      // A flying fish skips out of her spray now and then, at speed.
      if (speedK > 0.6 && (this.fishT += dt) > SPRAY.fish) {
        this.fishT = 0
        this.launchFish(hand)
      }
    } else {
      this.rainbow.g.visible = false
      this.fishT = Math.min(this.fishT, SPRAY.fish * 0.6)
    }

    // The flying fish glide along beside the boat and dive back in.
    for (const f of this.fish) {
      if (!f.live) continue
      f.t += dt
      const T = 1.5
      const x = f.p.x + f.v.x * f.t
      const z = f.p.z + f.v.z * f.t
      const arc = Math.sin(Math.PI * clamp(f.t / T, 0, 1)) * 1.3
      f.root.position.set(x, this.waterAt(x, z) + arc + 0.1, z)
      f.root.rotation.y = Math.atan2(f.v.x, f.v.z)
      f.root.rotation.x = -Math.cos(Math.PI * clamp(f.t / T, 0, 1)) * 0.4
      if (f.flip >= 0) {
        f.flip += dt
        f.root.rotation.z = f.flip * 14
        if (f.flip > 0.45) f.flip = -1
      } else f.root.rotation.z = 0
      if (f.t > T) {
        f.live = false
        f.root.visible = false
        this.splash.burst(x, this.waterAt(x, z) + 0.1, z, 6, 1.2, 1.4, 0.12)
      }
    }
  }

  /** Where her hoof is in the water: beside the hull at her side, where she leans out. */
  private handPoint(out: Vector3) {
    const lz = clamp(this.along, -1.5, 0.7) + 0.2
    const lx = this.side * (HALF_W + 0.35)
    out.set(this.pos.x + this.xAxis.x * lx + this.fwd.x * lz, 0, this.pos.z + this.xAxis.z * lx + this.fwd.z * lz)
    out.y = this.waterAt(out.x, out.z)
    return out
  }

  private launchFish(from: Vector3) {
    const f = this.fish.find((x) => !x.live)
    if (!f) return
    const o = this.side * (1.2 + Math.random() * 1.2)
    f.p.set(from.x + this.xAxis.x * o + this.fwd.x * 1.5, 0, from.z + this.xAxis.z * o + this.fwd.z * 1.5)
    const sp = this.v + 1.8
    f.v.set(this.fwd.x * sp, 0, this.fwd.z * sp)
    f.t = 0
    f.flip = -1
    f.live = true
    f.root.visible = true
    this.counts.fish++
    tone(900, 1400, 0.12, 0.03, 'sine')
  }

  // ---------------------------------------------------------------- the boats coming the other way

  private others(dt: number, t: number) {
    const u = this.s / this.len
    for (const p of this.passers) {
      if (p.s === -2) continue
      if (p.s === -1) {
        // On its way when she's a little before where they meet.
        const lead = p.id === 'ski' ? 0.05 : 0.11
        if (this.phase === 'ride' && u > p.meet - lead) {
          p.s = p.id === 'ski' ? p.meet * this.len : Math.min(this.len - 20, this.s + 170)
          p.across = -46
          p.root.visible = true
        } else continue
      }
      let x: number
      let z: number
      let yaw: number
      if (p.id === 'ski') {
        // The jet ski cuts across her way, from one side to the other.
        p.across += p.speed * dt
        const q = this.route.getPointAt(clamp(p.s / this.len, 0, 1))
        const tan = this.route.getTangentAt(clamp(p.s / this.len, 0, 1))
        const rx = tan.z
        const rz = -tan.x
        x = q.x + rx * p.across * p.side
        z = q.z + rz * p.across * p.side
        yaw = Math.atan2(rx * p.side, rz * p.side)
        if (!p.bumped && this.s > p.s + 2 && p.across > 0) {
          p.bumped = true
          this.bump(0.9)
        }
        if (p.across > 60) {
          p.root.visible = false
          p.s = -2
        }
      } else {
        p.s -= p.speed * dt
        const q = this.route.getPointAt(clamp(p.s / this.len, 0, 1))
        const tan = this.route.getTangentAt(clamp(p.s / this.len, 0, 1))
        const rx = tan.z
        const rz = -tan.x
        x = q.x + rx * p.off * p.side
        z = q.z + rz * p.off * p.side
        yaw = Math.atan2(-tan.x, -tan.z)
        // Its wake reaches her a little after they pass.
        if (!p.bumped && p.s < this.s - (p.id === 'ferry' ? 8 : 4)) {
          p.bumped = true
          this.bump(p.id === 'ferry' ? 1.15 : 0.8)
        }
        if (p.s < this.s - 90 || p.s < 0) {
          p.root.visible = false
          p.s = -2
        }
      }
      if (!p.root.visible) continue
      p.h = this.waterAt(x, z)
      p.root.position.set(x, p.h, z)
      p.root.rotation.y = yaw
      p.root.rotation.z = Math.sin(t * 1.3 + p.meet * 10) * 0.03
      // Their bow wave.
      if (Math.random() < dt * 12) this.splash.emit(x + Math.sin(yaw) * 3, p.h + 0.2, z + Math.cos(yaw) * 3, (Math.random() - 0.5) * 2, 1.2 + Math.random(), (Math.random() - 0.5) * 2, 0.6, 0.16)
      // They wave back (a bounce of the crew).
      if (p.wave >= 0) {
        p.wave += dt
        p.crew.position.y = Math.abs(Math.sin(p.wave * 9)) * 0.25 * Math.max(0, 1 - p.wave / 1.4)
        if (p.wave > 1.4) p.wave = -1
      }
    }
  }

  // ---------------------------------------------------------------- the people

  private people(dt: number, t: number) {
    this.kaylee.update(dt, t)
    this.nick.update(dt, t)
    this.ji.update(dt, t)
    // The wind in their faces at speed.
    const wind = clamp(this.v / BOAT.top, 0, 1)
    this.kaylee.setWind(wind)
    this.nick.setWind(wind)
    this.ji.setWind(wind)
    // Daddy's cap blows off and he catches it.
    if (this.nickCap && this.capT >= 0) {
      this.capT += dt
      const k = this.capT / 1.1
      this.nickCap.position.y = this.nick.rig.face.headY + this.nick.rig.face.R * 0.55 + Math.sin(Math.PI * clamp(k, 0, 1)) * 0.9
      this.nickCap.rotation.x = k * 9
      this.nick.rig.armR.rotation.set(-2.4 * Math.sin(Math.PI * clamp(k, 0, 1)), 0, -0.3)
      if (this.capT > 1.1) {
        this.capT = -1
        this.nickCap.rotation.x = 0
        this.nick.rig.armR.rotation.set(0, 0, 0)
        sfx.pop()
      }
    }
    // Mommy holds her sun hat on (it lifts in the wind, she grabs it).
    if (this.hatT >= 0) {
      this.hatT += dt
      const k = clamp(this.hatT / 1, 0, 1)
      this.ji.rig.armL.rotation.set(-2.6 * Math.sin(Math.PI * k), 0, 0.3 * Math.sin(Math.PI * k))
      this.ji.rig.head.position.y += 0
      if (this.hatT > 1) {
        this.hatT = -1
        this.ji.rig.armL.rotation.set(0, 0, 0)
      }
    }
    // The captain at the wheel, turning it a little with the bends.
    this.captain.root.rotation.y = Math.sin(t * 0.7) * 0.08
    this.captain.armL.rotation.x = -1.1 + Math.sin(t * 1.3) * 0.08
    this.captain.armR.rotation.x = -1.1 - Math.sin(t * 1.3) * 0.08
    // Look where the boats are coming from, or at the island ahead.
    const near = this.passers.find((p) => p.root.visible)
    if (near) this.kaylee.lookAt(near.root.position.x, near.h + 1, near.root.position.z)
    else this.kaylee.lookAt(this.pos.x + this.fwd.x * 30, this.pos.y + 1.5, this.pos.z + this.fwd.z * 30)
  }

  // ---------------------------------------------------------------- input

  private toScreen(v: Vector3) {
    const p = v.clone().project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }
  private pick(x: number, y: number, out: Vector3): Vector3 | null {
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    this.water0.constant = -this.pos.y
    return this.raycaster.ray.intersectPlane(this.water0, out)
  }

  pointerDown(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    if (id) return
    this.finger = { x, y, t: performance.now(), speed: 0 }
    this.counts.sprays++
    sfx.splash()
  }
  pointerMove(x: number, y: number) {
    if (!this.finger) return
    const now = performance.now()
    const dtm = Math.max(1, now - this.finger.t) / 1000
    const sp = Math.hypot(x - this.finger.x, y - this.finger.y) / dtm
    this.finger.speed = Math.max(this.finger.speed * 0.7, sp)
    if (sp > SPRAY.drag && this.dip > 0.3 && Math.random() < 0.15) {
      this.counts.splashes++
      sfx.splash()
    }
    this.finger.x = x
    this.finger.y = y
    this.finger.t = now
    this.lastTouch = this.time
  }
  pointerUp() {
    this.finger = null
  }
  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    if (!id) {
      // A quick tap on the water: one splash there, by her hoof.
      const g = this.pick(x, y, tmp)
      if (g) this.splash.burst(this.handPoint(tmp2).x, tmp2.y + 0.1, tmp2.z, 10, 1.6, 2.4, 0.16)
      return
    }
    this.counts.pokes++
    if (id === 'kaylee') {
      this.kaylee.react('hop')
      tone(600, 1100, 0.25, 0.05, 'triangle')
    } else if (id === 'family:nick') {
      if (this.capT < 0) this.capT = 0
      this.nick.react('wiggle')
      tone(400, 700, 0.2, 0.04, 'triangle')
    } else if (id === 'family:ji') {
      if (this.hatT < 0) this.hatT = 0
      this.ji.react('wave')
      tone(700, 900, 0.2, 0.04, 'sine')
    } else if (id === 'captain') {
      // The horn, and a wiggle on the water.
      tone(330, 330, 0.35, 0.07, 'square')
      tone(415, 415, 0.35, 0.05, 'square', 0.4)
      if (this.phase === 'ride' && this.wiggleT < 0) this.wiggleT = 0
      this.captain.armR.rotation.z = -2
    } else if (id === 'flag') {
      sfx.fwip()
      this.boat.cloth.rotation.y = 1.2
    } else if (id === 'ring') {
      sfx.boing()
      this.boat.ring.rotation.x = 6
    } else if (id.startsWith('pass:')) {
      const p = this.passers.find((q) => q.id === id.slice(5))
      if (!p || !p.root.visible) return
      p.wave = 0
      this.counts.waves++
      tone(p.id === 'ferry' ? 220 : 360, p.id === 'ferry' ? 220 : 360, 0.4, 0.06, 'square')
      this.kaylee.react('wave')
    } else if (id.startsWith('fish:')) {
      const f = this.fish[Number(id.slice(5))]
      if (!f?.live) return
      f.flip = 0
      this.counts.fishTaps++
      tone(1200, 1800, 0.15, 0.04, 'sine')
      this.sparkle.burst(f.root.position.x, f.root.position.y, f.root.position.z, 12, 1.2, 1, 0.12)
    }
  }

  // ---------------------------------------------------------------- the camera

  /** The cinema camera (?cine=1): cut on what happens, hold a shot that shows her hoof while she plays. Off the boat
   *  (Kaylee hops onto the pier) the game's camera takes over again. */
  private film(dt: number) {
    const on = cinemaOn() && (this.phase === 'pier' || this.phase === 'ride' || (this.phase === 'dock' && this.kaylee.root.parent === this.boat.body))
    if (!on) {
      this.rig.setCine(null)
      return
    }
    const d = this.dir
    d.side = this.side
    d.play(!!this.finger)
    if (!this.finger) {
      // A boat coming the other way: the two-shot (once each).
      const p = this.passers.find((q) => q.root.visible && !this.filmed.has(q.id) && q.root.position.distanceTo(this.pos) < 55)
      if (p) {
        this.filmed.add(p.id)
        this.filming = p.id
        d.cut('pass', p.side)
      }
      if (!this.arrived && this.phase === 'ride' && this.len - this.s < 45) {
        this.arrived = true
        d.cut('arrive')
      }
    }
    d.aspect = this.w / Math.max(1, this.h)
    const near = d.move.id === 'pass' ? this.passers.find((q) => q.id === this.filming && q.root.visible) : undefined
    this.rig.setCine(d.update(dt / CINE.pace, { pos: this.pos, fwd: this.fwd }, near ? tmp3.copy(near.root.position).setY(near.h + 1) : null))
  }

  private shot(): Shot {
    const center = new Vector3(this.pos.x + this.fwd.x * CAM.ahead, this.pos.y + 1.2, this.pos.z + this.fwd.z * CAM.ahead)
    const b = CAM.box
    let yaw = (this.heading + Math.PI) * DEG - CAM.side * this.side
    let half = this.tall ? new Vector3(b, 1.2, b * 1.6) : new Vector3(b * 1.35, 1.2, b)
    if (this.phase === 'dock' || this.phase === 'off') {
      // Tied up: the pier and the family on it.
      const pier = atFrame(FRAMES.nadan, -5.5, 21)
      center.set(pier.x, PIER.y + 0.8, pier.z)
      half = this.tall ? new Vector3(4, 1.2, 5) : new Vector3(5.5, 1.2, 3.5)
      yaw = (this.heading + Math.PI) * DEG + 35
    }
    return { center, half, yaw, pitch: this.tall ? CAM.tallPitch : CAM.pitch, follow: true, minDist: 5, maxDist: 60 }
  }

  render() {
    this.bars.render(this.renderer, this.scene, this.rig.camera, this.w, this.h)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  /** After a while with no hoof in the water: a finger pressing on the water beside her. */
  private drawHint(t: number) {
    const el = this.hintEl
    if (!el) return
    const idle = !this.finger && t - this.lastTouch > HINT_S && this.phase === 'ride'
    const want = idle ? '' : 'none'
    if (el.style.display !== want) el.style.display = want
    if (!idle) return
    const s = this.toScreen(this.handPoint(tmp).add(tmp2.copy(this.xAxis).multiplyScalar(this.side * 0.8)))
    el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const place = (el: HTMLElement, base: Vector3 | null, height: number, scale = 1.2, small = min) => {
      let spot: { x: number; y: number; size: number } | null = null
      if (base) {
        const c = this.toScreen(tmp.copy(base).setY(base.y + height * 0.5))
        const top = this.toScreen(tmp2.copy(base).setY(base.y + height))
        if (c.z < 1) spot = { x: c.x, y: c.y, size: Math.max(small, Math.min(this.w * 0.24, Math.abs(c.y - top.y) * 2 * scale)) }
      }
      const show = !!spot && spot.x > -spot.size / 2 && spot.x < this.w + spot.size / 2 && spot.y > -spot.size / 2 && spot.y < this.h + spot.size / 2
      if (show && spot) {
        el.style.transform = `translate3d(${(spot.x - spot.size / 2).toFixed(1)}px, ${(spot.y - spot.size / 2).toFixed(1)}px, 0)`
        el.style.width = el.style.height = `${spot.size.toFixed(0)}px`
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
    const v = new Vector3()
    const off = this.phase === 'off'
    for (const [id, el] of this.anchorEls) {
      if (id === 'kaylee') place(el, off ? null : this.kaylee.root.getWorldPosition(v), this.kaylee.height, 0.8, 64)
      else if (id === 'family:nick') place(el, off ? null : this.nick.root.getWorldPosition(v), this.nick.height * 0.9, 0.7, 64)
      else if (id === 'family:ji') place(el, off ? null : this.ji.root.getWorldPosition(v), this.ji.height * 0.9, 0.7, 64)
      else if (id === 'captain') place(el, this.captain.root.getWorldPosition(v), 1.3, 0.7, 64)
      else if (id === 'flag') place(el, this.boat.flag.getWorldPosition(v).setY(v.y + 0.6), 0.6, 1, 64)
      else if (id === 'ring') place(el, this.boat.ring.getWorldPosition(v).setY(v.y - 0.3), 0.6, 1, 64)
      else if (id.startsWith('pass:')) {
        const p = this.passers.find((q) => q.id === id.slice(5))
        place(el, p && p.root.visible ? v.copy(p.root.position) : null, p?.id === 'ferry' ? 4 : 2, 1.2)
      } else if (id.startsWith('fish:')) {
        const f = this.fish[Number(id.slice(5))]
        place(el, f?.live ? v.copy(f.root.position).setY(f.root.position.y - 0.4) : null, 0.8, 2, 72)
      }
      el.style.zIndex = id === 'kaylee' ? '3' : id.startsWith('fish:') ? '4' : id.startsWith('family') ? '2' : '1'
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const sc = (p: Vector3) => (({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }))(this.toScreen(p))
    return {
      section: 'speedboat',
      phase: this.phase,
      cine: this.rig.cinema ? this.dir.move.id : null,
      cuts: this.dir.cuts,
      along: +(this.s / this.len).toFixed(3),
      routeM: Math.round(this.len),
      speed: +this.v.toFixed(1),
      side: this.side,
      spray: +this.dip.toFixed(2),
      canSkip: this.canSkip,
      passers: this.passers.filter((p) => p.root.visible).map((p) => p.id),
      kaylee: sc(this.kaylee.root.getWorldPosition(new Vector3())),
      water: sc(this.handPoint(new Vector3()).add(new Vector3().copy(this.xAxis).multiplyScalar(this.side * 1.2))),
      ...this.counts,
    }
  }
  memory() {
    return { ...this.renderer.info.memory }
  }
  dispose() {
    this.unwatch()
    this.scene.clear()
    this.bag.dispose()
  }
}

// Baan Huanam's mushroom house and its table, modeled in code in the house's toon look (engine3d/geo.ts parts).
// The house: a cozy, dim wooden shed. Rough planks in a few browns with the day shining through the gaps (soft rays
// slant down into the room), a dripping roof (beads of water on the beams, the misting pipe), the rack of sawdust bags
// with their collars, spare bags piled on the floor, moss in the damp corners, a bulb on a cord, the bright door, the
// sign (a mushroom with a smiley face, no words), a gecko on the wall, a drip from the beam, the sleepy dog, her basket
// and the misting hose.
// The table, outside: a wooden deck over the cool green mountains with cloud lying low in the valleys and rice steps
// going down, the table with its mats, plates and a flower, the pizza board, the clay oven on its stone stand with the
// woodpile and the peel, and the farmer aunty.
import { CanvasTexture, CircleGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SphereGeometry, SRGBColorSpace, type BufferGeometry } from 'three'
import { buildAnimal, type Rig } from '../../../../../engine3d/characters/animal'
import type { Look } from '../../../characters/looks'
import type { Bag } from '../../../../../engine3d/dispose'
import { blobShadow, merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { BACK_Z, BAG_R, BAG_Y, BAGS, BEAM_Y, BULB, DOG, DOOR, DRIP, EATERS, FARMER_AT, GECKO, OVEN, PIZZA, PLATE_R, PLATE_Z, RACK, RAIL_Z, SEAT_Z, SEATS, SIGN, TABLE, TX, type EaterId } from './layout'
import { bagsGeo, COLLAR, SAWDUST } from './shroom'

const WOOD = '#8E6A5C'
const WOOD_DARK = '#6E5049'
const WOODS = ['#8E6A5C', '#9C7666', '#84614F', '#967060', '#7E5D50']
const FLOOR = '#8F786A'
const FLOOR_DARK = '#7E685C'
const DECK = '#C49A72'
/** Cool mountain greens (the rainy season in Nan). */
const GREENS = ['#86C9A0', '#5FA886', '#9DD4B0', '#6FB794', '#4E9878']

/** The farmer aunty: a buffalo in a sun hat and an apron (not family: a farm's aunty, like the airport officer). */
export const FARMER: Look = { species: 'buffalo', height: 1.42, chub: 1.12, fur: '#A99CCB', light: '#E8E2F5', dark: '#5B5578', ear: '#FFB8CC', outfit: { kind: 'blouse', color: '#8FE3C8' }, extras: ['sunhat', 'apron'], lashes: true, open: true }

export interface House {
  root: Group
  door: Mesh
  sign: Group
  gecko: Group
  dog: { root: Group; head: Group; tail: Group; bubble: Mesh }
  drop: Group
  puddle: Mesh
  wand: Group
  farmer: Rig
  bulb: Group
}

export interface Table {
  root: Group
  plates: Record<EaterId, Group>
  board: Group
  oven: { root: Group; glow: Mesh }
  view: Group
  cloud: Group
  /** The low cloud lying in the valleys (it drifts). */
  mist: Mesh[]
  flower: Group
}

/** A little hash: the same "random" every build. */
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** Spare bags standing on the floor in a little crowd, mouths up with their plain collars (`n` of them). */
function bagCrowd(x: number, z: number, n: number, seed: number): BufferGeometry[] {
  const parts: BufferGeometry[] = []
  for (let k = 0; k < n; k++) {
    const bx = x + (k % 3) * 0.27 - 0.27 + (Math.floor(k / 3) % 2) * 0.13
    const bz = z - Math.floor(k / 3) * 0.24
    const h = 0.34 + 0.05 * rnd(seed + k)
    // The plump sack, sagging a little, its gathered neck, the collar and the plug of cotton in its mouth.
    parts.push(P.capsule(BAG_R, h - BAG_R * 2, SAWDUST, { at: [bx, h / 2 + 0.01, bz], scale: [1.05, 1, 1.05] }))
    for (let f = 0; f < 3; f++) parts.push(P.sphere(0.016, '#CDB083', { at: [bx + Math.cos(f * 2.1 + k) * BAG_R * 0.98, 0.1 + f * 0.08, bz + Math.sin(f * 2.1 + k) * BAG_R * 0.98], scale: [1, 1.5, 1] }, 6))
    parts.push(P.cyl(0.05, BAG_R * 0.8, 0.07, '#F1E2C6', { at: [bx, h + 0.03, bz] }, 12))
    parts.push(P.torus(0.055, 0.022, COLLAR.plain, { at: [bx, h + 0.07, bz], rot: [Math.PI / 2, 0, 0] }))
    parts.push(P.sphere(0.04, '#FFFFFF', { at: [bx, h + 0.085, bz], scale: [1, 0.6, 1] }, 8))
  }
  return parts
}

/** A cushion of moss with a few blades of grass, where the damp floor meets the walls. */
function tuft(x: number, z: number, s: number, color: string, i: number): BufferGeometry[] {
  return [
    P.sphere(0.12 * s, color, { at: [x, 0.0, z], scale: [1.4, 0.35, 0.9] }, 10),
    P.sphere(0.08 * s, '#A6D6A2', { at: [x + 0.08 * s, 0.01, z + 0.03], scale: [1.3, 0.4, 0.9] }, 8),
    ...Array.from({ length: 3 }, (_, k) => P.cone(0.012 * s, (0.1 + 0.05 * rnd(i * 7 + k)) * s, '#6FB07E', { at: [x - 0.05 * s + k * 0.05 * s, 0.05 * s, z], rot: [0, 0, (k - 1) * 0.35] }, 4)),
  ]
}

export function buildHouse(bag: Bag): House {
  const root = new Group()
  // ---- The back wall: rough planks in a few browns with gaps between, and the bright day showing through some of them
  // (a warm plane behind the wall) ----
  const planks: BufferGeometry[] = []
  let x = -3.2
  for (let i = 0; x < 3.2; i++) {
    const w = 0.24 + 0.08 * rnd(i)
    const h = 3.4
    planks.push(P.box(w, h, 0.06, WOODS[i % WOODS.length], { at: [x + w / 2, h / 2, BACK_Z - 0.03] }))
    // A knot here and there.
    if (rnd(i + 9) > 0.6) planks.push(P.sphere(0.03, WOOD_DARK, { at: [x + w * (0.3 + 0.4 * rnd(i + 3)), 0.5 + 2.2 * rnd(i + 5), BACK_Z + 0.002], scale: [1, 1.5, 0.2] }, 8))
    const gap = 0.022
    // Most gaps are shut with a dark strip; every third one lets the light in.
    if (i % 3 !== 1) planks.push(P.box(gap + 0.004, h, 0.02, '#4E3833', { at: [x + w + gap / 2, h / 2, BACK_Z - 0.05] }))
    x += w + gap
  }
  // The battens nailed across the planks, with nail heads.
  for (const y of [0.32, 2.72]) {
    planks.push(P.box(6.4, 0.1, 0.03, WOOD_DARK, { at: [0, y, BACK_Z + 0.015] }))
    for (let k = 0; k < 14; k++) planks.push(P.sphere(0.012, '#C9C0D6', { at: [-3.05 + k * 0.47, y, BACK_Z + 0.032], scale: [1, 1, 0.4] }, 6))
  }
  const shed = [
    // The floor: packed earth and a path of old boards down the aisle.
    P.box(7.4, 0.06, 7.0, FLOOR, { at: [0, -0.03, 2.2] }),
    ...Array.from({ length: 6 }, (_, i) => P.rbox(0.5, 0.025, 0.24, 0.01, i % 2 ? '#A88468' : '#9A785F', { at: [-2.1 + i * 0.62, 0.012, 0.98 + (i % 2) * 0.04], rot: [0, (rnd(i + 20) - 0.5) * 0.2, 0] })),
    ...planks,
    P.box(0.08, 3.4, 5.4, WOOD, { at: [-3.2, 1.7, 2.2] }),
    P.box(0.08, 3.4, 5.4, WOOD, { at: [3.2, 1.7, 2.2] }),
    // The roof's underside: dark planks and rafters; the beams the bags' water drips from.
    P.box(6.4, 0.06, 2.6, WOOD_DARK, { at: [0, 3.0, 0.6], rot: [0.12, 0, 0] }),
    // The dark gable above the wall, up into the roof.
    P.box(6.6, 2.4, 0.02, '#4E3833', { at: [0, 4.2, BACK_Z - 0.09] }),
    ...Array.from({ length: 7 }, (_, i) => P.box(0.08, 0.1, 2.6, '#5A4038', { at: [-3 + i, 2.94, 0.6], rot: [0.12, 0, 0] })),
    ...[-0.1, 0.62].map((z) => P.box(6.4, 0.1, 0.12, WOOD_DARK, { at: [0, BEAM_Y, z] })),
    // The misting pipe under the front beam, with its little nozzles.
    P.cyl(0.018, 0.018, 6.2, '#7FB8A4', { at: [0, BEAM_Y - 0.08, 0.62], rot: [0, 0, Math.PI / 2] }, 8),
    ...Array.from({ length: 9 }, (_, i) => P.cyl(0.012, 0.016, 0.05, '#C9CDD8', { at: [-2.8 + i * 0.7, BEAM_Y - 0.12, 0.62] }, 6)),
    // Beads of water along the beams' undersides.
    ...Array.from({ length: 16 }, (_, i) => P.sphere(0.014 + 0.008 * rnd(i + 50), '#BFE6FF', { at: [-3 + i * 0.39 + 0.1 * rnd(i), BEAM_Y - 0.055, -0.1 + (i % 2) * 0.72], scale: [1, 1.3, 1] }, 6)),
    // ---- The rack: posts, a plank under each row of bags and one on top ----
    ...[RACK.x0, 0, RACK.x1].map((x) => P.box(0.06, 1.7, 0.06, WOOD_DARK, { at: [x, 0.85, 0.06] })),
    ...[RACK.x0, RACK.x1].map((x) => P.box(0.06, 1.7, 0.06, WOOD_DARK, { at: [x, 0.85, -0.38] })),
    ...[...BAG_Y.map((y) => y - BAG_R - 0.02), BAG_Y[2] + BAG_R + 0.04].map((y) => P.box(RACK.x1 - RACK.x0 + 0.08, 0.035, 0.52, WOOD, { at: [0, y, -0.15] })),
    // Spare bags waiting on the floor, by the sign and past the door.
    ...bagCrowd(-2.5, 0.12, 6, 1),
    ...bagCrowd(2.95, 0.3, 5, 2),
    // Moss and grass where the damp floor meets the walls, and by the door.
    ...[[-2.9, -0.2], [-1.95, -0.3], [1.35, -0.32], [2.5, -0.3], [3.0, 0.9], [-3.0, 1.2]].flatMap(([x, z], i) => tuft(x, z, 1 + 0.4 * rnd(i + 90), i % 2 ? '#7FB98A' : '#93C996', i)),
  ]
  root.add(solid(merge(shed), bag, 2))
  // Damp darker patches on the earth floor (no ink: they're stains, not things).
  root.add(solid(merge(Array.from({ length: 7 }, (_, i) => P.cyl(0.35 + 0.3 * rnd(i + 70), 0.35 + 0.3 * rnd(i + 70), 0.006, FLOOR_DARK, { at: [-2.6 + i * 0.9, 0.003, 0.35 + 1.4 * rnd(i + 80)], scale: [1.6, 1, 0.7] }, 16))), bag, 0))
  root.add(solid(merge(bagsGeo(BAGS)), bag, 2))
  // The day behind the wall, shining through the gaps.
  const day = new Mesh(bag.add(new PlaneGeometry(6.4, 3.4)), bag.add(new MeshBasicMaterial({ color: '#FFE9B8' })))
  day.position.set(0, 1.55, BACK_Z - 0.075)
  day.scale.y = 3.1 / 3.4
  root.add(day)
  // Soft rays from three of the gaps, slanting down into the room.
  const rays = new Group()
  const rayMat = bag.add(new MeshBasicMaterial({ color: '#FFF1C8', transparent: true, opacity: 0.11, depthWrite: false, side: DoubleSide }))
  for (const [rx, w] of [[-2.25, 0.16], [-0.62, 0.12], [0.86, 0.2]] as const) {
    const ray = new Mesh(bag.add(new PlaneGeometry(w, 2.6)), rayMat)
    ray.position.set(rx, 1.15, BACK_Z + 0.75)
    ray.rotation.set(-0.62, 0, 0.12)
    ray.renderOrder = 1
    rays.add(ray)
  }
  root.add(rays)
  // The bulb hanging from the roof on its cord, with a warm glow round it (moths visit it).
  const bulb = new Group()
  bulb.position.set(BULB[0], 3.0, BULB[2])
  bulb.add(solid(merge([P.cyl(0.006, 0.006, 3.0 - BULB[1], '#2B2330', { at: [0, -(3.0 - BULB[1]) / 2, 0] }, 5), P.cyl(0.03, 0.03, 0.05, '#4E3833', { at: [0, -(3.0 - BULB[1]) + 0.04, 0] }, 10)]), bag, 1))
  const glass = new Mesh(bag.add(new SphereGeometry(0.05, 14, 10)), bag.add(new MeshBasicMaterial({ color: '#FFF0B3' })))
  glass.position.y = -(3.0 - BULB[1])
  glass.scale.y = 1.2
  bulb.add(glass)
  const halo = new Mesh(bag.add(new SphereGeometry(0.22, 16, 12)), bag.add(new MeshBasicMaterial({ color: '#FFE3A0', transparent: true, opacity: 0.16, depthWrite: false })))
  halo.position.y = glass.position.y
  halo.renderOrder = 2
  bulb.add(halo)
  root.add(bulb)
  // The door: bright daylight and a green bush outside.
  const door = new Mesh(bag.add(new PlaneGeometry(DOOR.x1 - DOOR.x0, DOOR.y1)), bag.add(new MeshBasicMaterial({ color: '#FFF4D2' })))
  door.position.set((DOOR.x0 + DOOR.x1) / 2, DOOR.y1 / 2, BACK_Z + 0.012)
  door.userData.pick = 'door'
  root.add(door)
  root.add(solid(merge([P.box(0.08, DOOR.y1 + 0.08, 0.08, WOOD_DARK, { at: [DOOR.x0 - 0.04, (DOOR.y1 + 0.08) / 2, BACK_Z + 0.03] }), P.box(0.08, DOOR.y1 + 0.08, 0.08, WOOD_DARK, { at: [DOOR.x1 + 0.04, (DOOR.y1 + 0.08) / 2, BACK_Z + 0.03] }), P.box(DOOR.x1 - DOOR.x0 + 0.16, 0.08, 0.08, WOOD_DARK, { at: [(DOOR.x0 + DOOR.x1) / 2, DOOR.y1 + 0.04, BACK_Z + 0.03] })]), bag, 2))
  const bush = solid(merge([P.sphere(0.3, '#8FD49A', { at: [0, 0.25, 0], scale: [1.2, 0.8, 0.4] }), P.sphere(0.22, '#6CC08A', { at: [0.3, 0.18, 0.02], scale: [1, 0.8, 0.4] })]), bag, 1)
  bush.position.set(DOOR.x0 + 0.3, 0, BACK_Z + 0.02)
  root.add(bush)
  // A soft shaft of light from the door across the floor.
  const shaft = new Mesh(bag.add(new PlaneGeometry(0.9, 2.2)), bag.add(new MeshBasicMaterial({ color: '#FFF2C4', transparent: true, opacity: 0.16, depthWrite: false })))
  shaft.position.set(1.8, 0.02, 0.5)
  shaft.rotation.set(-Math.PI / 2, 0, 0.5)
  shaft.renderOrder = 1
  root.add(shaft)
  // ---- The sign ----
  const sign = solid(
    merge([
      P.rbox(0.46, 0.36, 0.035, 0.03, '#FFF1DC', {}),
      P.sphere(0.12, PAL.pink, { at: [0, 0.03, 0.02], scale: [1, 0.6, 0.3] }),
      P.box(0.08, 0.1, 0.02, '#FFF7EC', { at: [0, -0.08, 0.02] }),
      ...[-0.035, 0.035].map((x) => P.sphere(0.012, PAL.ink, { at: [x, 0.045, 0.06] }, 8)),
      P.torus(0.03, 0.007, PAL.ink, { at: [0, 0.02, 0.06], rot: [0, 0, Math.PI] }, Math.PI),
      ...[0.16, -0.16].map((x) => P.sphere(0.018, '#FFC2D8', { at: [x * 0.4, 0.02, 0.05] }, 8)),
    ]),
    bag,
    2,
  )
  sign.position.set(...SIGN)
  sign.userData.pick = 'sign'
  root.add(sign)
  // ---- The gecko on the wall ----
  const gecko = solid(
    merge([
      P.capsule(0.03, 0.1, '#9BD67E', { rot: [0, 0, Math.PI / 2] }),
      P.sphere(0.04, '#9BD67E', { at: [0.1, 0, 0], scale: [1.2, 0.9, 0.7] }),
      P.cone(0.022, 0.16, '#9BD67E', { at: [-0.15, 0, 0], rot: [0, 0, Math.PI / 2] }),
      ...[[0.05, 1], [0.05, -1], [-0.05, 1], [-0.05, -1]].map(([x, s]) => P.box(0.012, 0.07, 0.01, '#7BBF62', { at: [x, s * 0.04, 0], rot: [0, 0, s * 0.5] })),
      ...[1, -1].map((s) => P.sphere(0.012, PAL.ink, { at: [0.125, s * 0.02, 0.02] }, 8)),
    ]),
    bag,
    1,
  )
  gecko.position.set(...GECKO)
  gecko.rotation.z = 0.25
  gecko.userData.pick = 'gecko'
  root.add(gecko)
  // ---- The sleepy dog, curled up on the floor ----
  const dogRoot = new Group()
  dogRoot.position.set(...DOG)
  dogRoot.rotation.y = -0.4
  dogRoot.userData.pick = 'dog'
  dogRoot.add(solid(merge([P.sphere(0.2, '#E8B984', { at: [0, 0.12, 0], scale: [1.5, 0.75, 1.1] }), P.sphere(0.09, '#FFF1DC', { at: [0.1, 0.12, 0.16], scale: [1.4, 0.8, 0.6] })]), bag, 2))
  const head = new Group()
  head.position.set(0.24, 0.12, 0.08)
  head.add(
    solid(
      merge([
        P.sphere(0.1, '#E8B984', { scale: [1, 0.85, 0.95] }),
        P.sphere(0.055, '#FFF1DC', { at: [0.07, -0.02, 0.04], scale: [1.2, 0.8, 1] }),
        P.sphere(0.018, PAL.ink, { at: [0.12, 0.0, 0.05] }, 8),
        ...[1, -1].map((s) => P.sphere(0.05, '#C98E5C', { at: [-0.02, 0.06, s * 0.08], scale: [0.6, 1.2, 0.5], rot: [s * 0.5, 0, 0] })),
        // Closed eyes: two little lines.
        ...[1, -1].map((s) => P.box(0.035, 0.008, 0.01, PAL.ink, { at: [0.06, 0.03, s * 0.04 + 0.05] })),
      ]),
      bag,
      2,
    ),
  )
  dogRoot.add(head)
  const tail = new Group()
  tail.position.set(-0.28, 0.12, 0)
  tail.add(solid(P.capsule(0.03, 0.12, '#E8B984', { at: [0, 0.07, 0], rot: [0, 0, 0.6] }), bag, 1))
  dogRoot.add(tail)
  // The snore bubble at her nose (it swells as she breathes out and pops).
  const bubble = new Mesh(bag.add(new SphereGeometry(0.04, 12, 8)), bag.add(new MeshBasicMaterial({ color: '#DFF2FF', transparent: true, opacity: 0.6, depthWrite: false })))
  bubble.position.set(0.37, 0.1, 0.12)
  bubble.renderOrder = 2
  dogRoot.add(bubble)
  const dogShadow = blobShadow(0.36, bag)
  dogRoot.add(dogShadow)
  root.add(dogRoot)
  // ---- The drip from the beam, and its puddle ----
  const drop = solid(P.sphere(0.035, '#BFE6FF', { scale: [1, 1.35, 1] }), bag, 1)
  drop.position.set(...DRIP)
  drop.userData.pick = 'drip'
  root.add(drop)
  const puddle = new Mesh(bag.add(new CircleGeometry(0.2, 20)), bag.add(new MeshBasicMaterial({ color: '#A9C8EE', transparent: true, opacity: 0.7, depthWrite: false })))
  puddle.rotation.x = -Math.PI / 2
  puddle.scale.y = 0.7
  puddle.position.set(DRIP[0], 0.008, DRIP[2])
  puddle.renderOrder = 1
  root.add(puddle)
  // ---- The misting hose's wand (it points along +z: lookAt aims it) ----
  const wand = new Group()
  wand.add(
    solid(
      merge([
        P.cyl(0.024, 0.024, 0.2, '#4DB57A', { at: [0, 0, -0.06], rot: [Math.PI / 2, 0, 0] }, 10),
        P.cyl(0.03, 0.03, 0.05, '#2F8F5B', { at: [0, 0, -0.16], rot: [Math.PI / 2, 0, 0] }, 10),
        P.cone(0.045, 0.08, '#C9CDD8', { at: [0, 0, 0.07], rot: [-Math.PI / 2, 0, 0] }, 12),
        P.box(0.02, 0.07, 0.03, '#2F8F5B', { at: [0, -0.05, -0.1] }),
      ]),
      bag,
      2,
    ),
  )
  root.add(wand)
  // ---- The farmer aunty, by the door ----
  const farmer = buildAnimal(FARMER, bag)
  farmer.root.position.set(...FARMER_AT)
  farmer.root.rotation.y = -1.1
  farmer.root.userData.pick = 'farmer'
  root.add(farmer.root)
  return { root, door, sign, gecko, dog: { root: dogRoot, head, tail, bubble }, drop, puddle, wand, farmer, bulb }
}

/** Soft far mountains with cloud sitting on the tops, painted on a canvas (one big flat picture behind the railing). */
function hillsTexture(bag: Bag) {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 384
  const g = c.getContext('2d')!
  const sky = g.createLinearGradient(0, 0, 0, 384)
  sky.addColorStop(0, '#C9DDEB')
  sky.addColorStop(1, '#E9F0F2')
  g.fillStyle = sky
  g.fillRect(0, 0, 1024, 384)
  const ridge = (y: number, amp: number, color: string, seed: number) => {
    g.fillStyle = color
    g.beginPath()
    g.moveTo(0, 384)
    for (let x = 0; x <= 1024; x += 16) g.lineTo(x, y - amp * (0.55 + 0.45 * Math.sin(x / 140 + seed) * Math.cos(x / 61 + seed * 2)))
    g.lineTo(1024, 384)
    g.fill()
  }
  const clouds = (list: number[][], a: number) => {
    g.fillStyle = `rgba(255,255,255,${a})`
    for (const [x, y, r] of list) {
      g.beginPath()
      g.ellipse(x, y, r * 1.8, r * 0.55, 0, 0, Math.PI * 2)
      g.fill()
    }
  }
  ridge(180, 90, '#B4CFCF', 1)
  // Clouds sitting on the far tops, and a band of mist lying between the ridges.
  clouds([[160, 120, 50], [230, 112, 40], [610, 104, 60], [690, 118, 46], [900, 132, 44]], 0.9)
  ridge(240, 70, '#97C4AE', 3)
  clouds([[80, 236, 50], [340, 246, 70], [520, 232, 44], [780, 244, 66], [990, 236, 40]], 0.7)
  ridge(300, 50, '#79B497', 5)
  const tex = bag.add(new CanvasTexture(c))
  tex.colorSpace = SRGBColorSpace
  return tex
}

/** A round tree: a trunk and a few balls of leaves. */
function tree(x: number, y: number, z: number, s: number, i: number): BufferGeometry[] {
  const g = GREENS[i % GREENS.length]
  const g2 = GREENS[(i + 2) % GREENS.length]
  return [
    P.cyl(0.06 * s, 0.09 * s, 0.7 * s, '#8C6248', { at: [x, y + 0.35 * s, z] }, 7),
    P.sphere(0.42 * s, g, { at: [x, y + 0.95 * s, z] }, 12),
    P.sphere(0.3 * s, g2, { at: [x + 0.3 * s, y + 0.8 * s, z + 0.1 * s] }, 10),
    P.sphere(0.28 * s, g2, { at: [x - 0.3 * s, y + 0.78 * s, z - 0.05 * s] }, 10),
  ]
}

/** A soft, see-through cloud lying low between the hills (no outline: it's mist). */
function mistCloud(bag: Bag, w: number, op: number) {
  const parts = [P.sphere(0.6, '#FFFFFF', { scale: [w, 0.32, 0.7] }, 14), P.sphere(0.45, '#FFFFFF', { at: [w * 0.35, 0.08, 0.05], scale: [w * 0.7, 0.4, 0.6] }, 12), P.sphere(0.42, '#FFFFFF', { at: [-w * 0.38, 0.05, -0.05], scale: [w * 0.6, 0.36, 0.6] }, 12)]
  const m = new Mesh(bag.add(merge(parts)), bag.add(new MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: op, depthWrite: false })))
  m.renderOrder = 1
  return m
}

export function buildTable(bag: Bag): Table {
  const root = new Group()
  // ---- The deck, its railing of crossed branches, the stools and the table ----
  const deck = [
    P.box(6.2, 0.08, 4.4, DECK, { at: [TX, -0.04, -0.1] }),
    ...Array.from({ length: 14 }, (_, i) => P.box(6.2, 0.012, 0.02, '#A57E5C', { at: [TX, 0.002, -2.2 + i * 0.31] })),
    ...Array.from({ length: 9 }, (_, i) => P.cyl(0.04, 0.045, 1.0, '#8C6248', { at: [TX - 3 + i * 0.75, 0.5, RAIL_Z] }, 8)),
    P.cyl(0.035, 0.035, 6.1, '#8C6248', { at: [TX, 0.98, RAIL_Z], rot: [0, 0, Math.PI / 2] }, 8),
    ...Array.from({ length: 8 }, (_, i) => [0.6, -0.6].map((a) => P.cyl(0.022, 0.022, 0.98, '#9A6E52', { at: [TX - 2.62 + i * 0.75, 0.5, RAIL_Z + 0.02], rot: [0, 0, a] }, 6))).flat(),
    P.rbox(TABLE.w, 0.06, TABLE.d, 0.03, '#C99A6E', { at: [TABLE.x, TABLE.top - 0.03, TABLE.z] }),
    // The table's boards.
    ...[-0.3, 0, 0.3].map((dz) => P.box(TABLE.w - 0.04, 0.004, 0.012, '#B4865C', { at: [TABLE.x, TABLE.top + 0.001, TABLE.z + dz] })),
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => P.box(0.06, TABLE.top - 0.06, 0.06, '#A57E5C', { at: [TABLE.x + sx * (TABLE.w / 2 - 0.1), (TABLE.top - 0.06) / 2, TABLE.z + sz * (TABLE.d / 2 - 0.1)] })),
    ...EATERS.flatMap((e) => [
      P.cyl(0.17, 0.17, 0.05, '#B98A64', { at: [SEATS[e].x, SEATS[e].seat - 0.025, SEAT_Z] }, 16),
      P.cyl(0.04, 0.05, SEATS[e].seat - 0.05, '#8C6248', { at: [SEATS[e].x, (SEATS[e].seat - 0.05) / 2, SEAT_Z] }, 8),
      // A woven mat under each plate.
      P.rbox(0.36, 0.008, 0.26, 0.004, '#EAD3A2', { at: [SEATS[e].x, TABLE.top + 0.002, PLATE_Z] }),
    ]),
    // A jug of water and two cups.
    P.cyl(0.05, 0.06, 0.16, '#BFE2FA', { at: [TX - 0.82, TABLE.top + 0.08, 0.22] }, 12),
    ...[TX - 0.62, TX + 0.36].map((x) => P.cyl(0.035, 0.03, 0.08, '#FFFFFF', { at: [x, TABLE.top + 0.04, -0.12] }, 10)),
    // Pots of pink flowers at the railing's ends.
    ...[TX - 2.75, TX + 2.75].flatMap((x, i) => [
      P.cyl(0.16, 0.12, 0.26, '#E59A6E', { at: [x, 0.13, RAIL_Z + 0.3] }, 14),
      P.sphere(0.2, GREENS[i + 1], { at: [x, 0.34, RAIL_Z + 0.3], scale: [1.2, 0.8, 1.2] }, 12),
      ...[0, 1, 2, 3].map((k) => P.sphere(0.055, k % 2 ? PAL.pink : '#FFD3E6', { at: [x + Math.cos(k * 1.7) * 0.14, 0.44, RAIL_Z + 0.3 + Math.sin(k * 1.7) * 0.12] }, 8)),
    ]),
  ]
  root.add(solid(merge(deck), bag, 2))
  // A little vase with a pink flower on the table (it nods in the breeze).
  const flower = solid(merge([P.cyl(0.03, 0.04, 0.09, '#BFE2FA', { at: [0, 0.045, 0] }, 10), P.cyl(0.005, 0.005, 0.12, '#5FA886', { at: [0, 0.14, 0] }, 5), ...[0, 1, 2, 3, 4].map((k) => P.sphere(0.022, PAL.pink, { at: [Math.cos(k * 1.256) * 0.026, 0.2, Math.sin(k * 1.256) * 0.026] }, 8)), P.sphere(0.016, PAL.gold, { at: [0, 0.205, 0] }, 8)]), bag, 1)
  flower.position.set(TX + 0.84, TABLE.top, -0.44)
  root.add(flower)
  // ---- The view: rice steps going down, the green mountains, trees on the slope and cloud lying low ----
  const view = new Group()
  view.userData.pick = 'view'
  const steps = Array.from({ length: 6 }, (_, i) => {
    const w = 9.4 - i * 0.6
    const y = -0.7 - i * 0.45
    const z = RAIL_Z - 1.5 - i * 1.2
    const c = i % 2 ? '#A3DDB0' : '#8CCFA0'
    return [
      P.rbox(w, 0.18, 1.25, 0.09, c, { at: [TX + (i % 2 ? 0.4 : -0.3), y, z] }),
      // The bund on its front edge, and the shine of water on the young rice.
      P.rbox(w, 0.06, 0.08, 0.03, '#7BB98E', { at: [TX + (i % 2 ? 0.4 : -0.3), y + 0.1, z + 0.58] }),
      P.box(w * 0.7, 0.004, 0.5, '#C7EAF2', { at: [TX + (i % 2 ? 0.4 : -0.3) + 0.6, y + 0.092, z - 0.1] }),
    ]
  }).flat()
  const hills = [
    P.sphere(3.2, GREENS[1], { at: [TX - 6, -3.4, -14], scale: [1.6, 0.7, 0.6] }, 22),
    P.sphere(3.6, GREENS[3], { at: [TX + 5.5, -3.6, -15], scale: [1.7, 0.65, 0.6] }, 22),
    P.sphere(2.4, GREENS[0], { at: [TX + 0.5, -3.0, -11], scale: [1.8, 0.55, 0.6] }, 22),
    P.sphere(2.0, GREENS[4], { at: [TX - 4.5, -1.6, -6], scale: [1.4, 0.5, 0.7] }, 18),
    P.sphere(2.2, GREENS[4], { at: [TX + 5.2, -1.8, -6.5], scale: [1.4, 0.5, 0.7] }, 18),
    // A little village down in the valley: three roofs.
    ...[-1.2, -0.6, 0.1].map((x, i) => P.prism([[-0.25, 0], [0.25, 0], [0, 0.22]], 0.3, i === 1 ? '#E59A6E' : '#C98A6E', { at: [TX + x, -2.05 + i * 0.05, -6.6] })),
    ...[-1.2, -0.6, 0.1].map((x, i) => P.box(0.42, 0.24, 0.28, '#FFF1DC', { at: [TX + x, -2.17 + i * 0.05, -6.6] })),
    // Trees on the slope below the deck, and on the near hills.
    ...tree(TX - 3.4, -0.6, RAIL_Z - 1.2, 1.1, 0),
    ...tree(TX - 2.6, -1.1, RAIL_Z - 2.4, 0.9, 1),
    ...tree(TX + 3.3, -0.7, RAIL_Z - 1.4, 1.2, 2),
    ...tree(TX + 2.4, -1.3, RAIL_Z - 2.8, 0.85, 3),
    ...tree(TX - 4.4, -1.0, -5.6, 1.0, 4),
    ...tree(TX + 4.6, -1.2, -6.0, 1.0, 1),
  ]
  view.add(solid(merge([...steps, ...hills]), bag, 2))
  const far = new Mesh(bag.add(new PlaneGeometry(40, 15)), bag.add(new MeshBasicMaterial({ map: hillsTexture(bag), depthWrite: false })))
  far.position.set(TX, 2.4, -20)
  view.add(far)
  // The low cloud, lying in the valleys between the hills.
  const mist: Mesh[] = []
  for (const [mx, my, mz, w, op] of [[-3.5, -1.4, -8, 2.6, 0.75], [2.5, -1.9, -9.5, 3.2, 0.7], [-0.5, -2.4, -7.2, 2.2, 0.6], [5, -1.0, -12, 3, 0.8]]) {
    const m = mistCloud(bag, w, op)
    m.position.set(TX + mx, my, mz)
    m.userData.home = TX + mx
    mist.push(m)
    view.add(m)
  }
  root.add(view)
  // A cloud that drifts across the view (a tap on the view sends another).
  const cloud = solid(merge([P.sphere(0.6, '#FFFFFF', { scale: [1.6, 0.6, 0.6] }), P.sphere(0.45, '#FFFFFF', { at: [0.6, 0.15, 0], scale: [1.4, 0.7, 0.6] }), P.sphere(0.4, '#FFFFFF', { at: [-0.6, 0.05, 0], scale: [1.3, 0.6, 0.6] })]), bag, 2)
  cloud.position.set(TX - 6, 0.6, -7)
  root.add(cloud)
  // ---- The plates ----
  const plates = {} as Record<EaterId, Group>
  for (const e of EATERS) {
    const p = solid(merge([P.cyl(PLATE_R, PLATE_R * 0.8, 0.02, '#FFFFFF', {}, 24), P.torus(PLATE_R * 0.78, 0.008, '#E8E2F5', { at: [0, 0.011, 0], rot: [Math.PI / 2, 0, 0] })]), bag, 2)
    p.position.set(SEATS[e].x, TABLE.top + 0.01, PLATE_Z)
    p.userData.pick = `plate:${e}`
    plates[e] = p
    root.add(p)
  }
  // ---- The pizza's wooden board ----
  const board = solid(merge([P.cyl(PIZZA.r + 0.05, PIZZA.r + 0.05, 0.03, '#C08654', {}, 28), P.rbox(0.09, 0.03, 0.2, 0.012, '#C08654', { at: [0.27, 0, 0.32], rot: [0, -0.8, 0] })]), bag, 2)
  board.position.set(PIZZA.x, TABLE.top + 0.015, PIZZA.z)
  root.add(board)
  // ---- The clay oven: a stand of round river stones, the dome, its brick arch and dark mouth, the fire's glow inside;
  // the woodpile beside it and the peel leaning on it ----
  const ovenRoot = new Group()
  ovenRoot.position.set(...OVEN)
  ovenRoot.userData.pick = 'oven'
  const stones: BufferGeometry[] = []
  for (let row = 0; row < 4; row++)
    for (let k = 0; k < 6; k++) {
      const sx = -0.36 + k * 0.145 + (row % 2) * 0.07
      if (sx > 0.4) continue
      stones.push(P.sphere(0.085, ['#D9C8B4', '#CDB9A4', '#E3D4C2'][(row + k) % 3], { at: [sx, 0.08 + row * 0.14, 0.38], scale: [1, 0.75, 0.4] }, 10))
    }
  ovenRoot.add(
    solid(
      merge([
        P.rbox(0.86, 0.6, 0.8, 0.06, '#C8B5A0', { at: [0, 0.3, 0] }),
        ...stones,
        P.rbox(0.92, 0.05, 0.86, 0.02, '#B59F88', { at: [0, 0.61, 0] }),
        P.sphere(0.4, '#E59A6E', { at: [0, 0.62, 0], scale: [1, 0.85, 0.95] }, 22),
        // A paler band of fresh clay near the top, and the chimney.
        P.sphere(0.3, '#EDB08A', { at: [0, 0.78, -0.02], scale: [1, 0.55, 0.95] }, 18),
        P.cyl(0.07, 0.08, 0.26, '#C9785A', { at: [-0.08, 1.02, -0.12] }, 10),
        P.cyl(0.085, 0.085, 0.03, '#A8604A', { at: [-0.08, 1.15, -0.12] }, 10),
        // The brick arch round the mouth.
        ...Array.from({ length: 7 }, (_, k) => {
          const a = (k / 6) * Math.PI
          return P.rbox(0.07, 0.05, 0.06, 0.01, k % 2 ? '#C9785A' : '#B9684E', { at: [Math.cos(a) * 0.17, 0.68 + Math.sin(a) * 0.17, 0.34], rot: [0, 0, a - Math.PI / 2] })
        }),
        P.box(0.38, 0.03, 0.12, '#C9785A', { at: [0, 0.665, 0.34] }),
        // The woodpile.
        ...[[0, 0], [1, 0], [2, 0], [0.5, 1], [1.5, 1], [1, 2]].map(([k, row]) => P.cyl(0.055, 0.055, 0.42, '#A8714E', { at: [0.62 + (k - 1) * 0.115, 0.06 + row * 0.1, 0.05], rot: [Math.PI / 2, 0, 0] }, 9)),
        ...[[0, 0], [1, 0], [2, 0], [0.5, 1], [1.5, 1], [1, 2]].map(([k, row]) => P.cyl(0.045, 0.045, 0.01, '#EBCB9C', { at: [0.62 + (k - 1) * 0.115, 0.06 + row * 0.1, 0.265], rot: [Math.PI / 2, 0, 0] }, 9)),
        // The peel (the long wooden paddle) leaning on the stand.
        P.cyl(0.018, 0.018, 1.0, '#B4865C', { at: [-0.5, 0.55, 0.22], rot: [0, 0, -0.22] }, 6),
        P.rbox(0.2, 0.24, 0.02, 0.02, '#C99A6E', { at: [-0.4, 0.1, 0.24], rot: [0, 0, -0.22] }),
      ]),
      bag,
      2,
    ),
  )
  const mouth = new Mesh(bag.add(new PlaneGeometry(0.3, 0.16)), bag.add(new MeshBasicMaterial({ color: '#3A2B33' })))
  mouth.position.set(0, 0.76, 0.352)
  ovenRoot.add(mouth)
  const glow = new Mesh(bag.add(new PlaneGeometry(0.26, 0.13)), bag.add(new MeshBasicMaterial({ color: '#FF8A3D', transparent: true, opacity: 0, depthWrite: false })))
  glow.position.set(0, 0.755, 0.356)
  ovenRoot.add(glow)
  root.add(ovenRoot)
  return { root, plates, board, oven: { root: ovenRoot, glow }, view, cloud, mist, flower }
}

/** The fire's glow in the oven's mouth: 0 out, 1 roaring (it flickers). */
export function ovenGlow(t: Table['oven'], k: number, time: number) {
  const mat = t.glow.material as MeshBasicMaterial
  mat.opacity = k * (0.75 + 0.25 * Math.sin(time * 23) * Math.sin(time * 7.3))
}


// Baan Huanam's mushroom house and its table, modeled in code in the house's toon look (engine/geo.ts parts). Greybox:
// shapes only. The house: a dim wooden shed, the rack of sawdust bags, the bright door, the sign (a mushroom with a
// smiley face, no words), a gecko on the wall, a drip from the beam, the sleepy dog, her basket and the misting hose.
// The table, outside: a wooden deck over green hills and rice steps, the table and its stools and plates, the pizza
// board, the clay oven and the farmer aunty.
import { CanvasTexture, CircleGeometry, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace } from 'three'
import { buildAnimal, type Rig } from '../../../characters/animal'
import type { Look } from '../../../characters/looks'
import type { Bag } from '../../../engine/dispose'
import { blobShadow, merge, P, solid } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import { BACK_Z, BAG_R, BAG_Y, BAGS, BEAM_Y, DOG, DOOR, DRIP, EATERS, FARMER_AT, GECKO, OVEN, PIZZA, PLATE_R, PLATE_Z, RACK, RAIL_Z, SEAT_Z, SEATS, SIGN, TABLE, TX, type EaterId } from './layout'
import { bagsGeo } from './shroom'

const WOOD = '#8E6A5C'
const WOOD_DARK = '#6E5049'
const DECK = '#C49A72'
const GREENS = ['#7FCB8C', '#5FB47E', '#9BD9A3', '#6CC08A']

/** The farmer aunty: a buffalo in a sun hat and an apron (not family: a farm's aunty, like the airport officer). */
export const FARMER: Look = { species: 'buffalo', height: 1.42, chub: 1.12, fur: '#A99CCB', light: '#E8E2F5', dark: '#5B5578', ear: '#FFB8CC', outfit: { kind: 'blouse', color: '#8FE3C8' }, extras: ['sunhat', 'apron'], lashes: true, open: true }

export interface House {
  root: Group
  door: Mesh
  sign: Group
  gecko: Group
  dog: { root: Group; head: Group; tail: Group }
  drop: Group
  puddle: Mesh
  wand: Group
  farmer: Rig
}

export interface Table {
  root: Group
  plates: Record<EaterId, Group>
  board: Group
  oven: { root: Group; glow: Mesh }
  view: Group
  cloud: Group
}

export function buildHouse(bag: Bag): House {
  const root = new Group()
  // ---- The shed: the floor, the back wall of planks, the side walls, the beams ----
  const shed = [
    P.box(7.4, 0.06, 7.0, '#9C877B', { at: [0, -0.03, 2.2] }),
    P.box(6.4, 3.4, 0.08, WOOD, { at: [0, 1.7, BACK_Z - 0.04] }),
    ...Array.from({ length: 21 }, (_, i) => P.box(0.025, 3.4, 0.02, WOOD_DARK, { at: [-3.1 + i * 0.31, 1.7, BACK_Z + 0.005] })),
    P.box(0.08, 3.4, 5.4, WOOD, { at: [-3.2, 1.7, 2.2] }),
    P.box(0.08, 3.4, 5.4, WOOD, { at: [3.2, 1.7, 2.2] }),
    // The roof's underside: dark planks, a little light at the ridge.
    P.box(6.4, 0.06, 2.6, WOOD_DARK, { at: [0, 3.0, 0.6], rot: [0.12, 0, 0] }),
    ...[-0.1, 0.62].map((z) => P.box(6.4, 0.1, 0.12, WOOD_DARK, { at: [0, BEAM_Y, z] })),
    // ---- The rack: posts, a plank under each row of bags and one on top ----
    ...[RACK.x0, 0, RACK.x1].map((x) => P.box(0.06, 1.7, 0.06, WOOD_DARK, { at: [x, 0.85, 0.06] })),
    ...[RACK.x0, RACK.x1].map((x) => P.box(0.06, 1.7, 0.06, WOOD_DARK, { at: [x, 0.85, -0.38] })),
    ...[...BAG_Y.map((y) => y - BAG_R - 0.02), BAG_Y[2] + BAG_R + 0.04].map((y) => P.box(RACK.x1 - RACK.x0 + 0.08, 0.035, 0.52, WOOD, { at: [0, y, -0.15] })),
  ]
  root.add(solid(merge(shed), bag, 2))
  root.add(solid(merge(bagsGeo(BAGS)), bag, 2))
  // The door: bright daylight and a green bush outside.
  const door = new Mesh(bag.add(new PlaneGeometry(DOOR.x1 - DOOR.x0, DOOR.y1)), bag.add(new MeshBasicMaterial({ color: '#FFF4D2' })))
  door.position.set((DOOR.x0 + DOOR.x1) / 2, DOOR.y1 / 2, BACK_Z + 0.012)
  door.userData.pick = 'door'
  root.add(door)
  const bush = solid(merge([P.sphere(0.3, '#8FD49A', { at: [0, 0.25, 0], scale: [1.2, 0.8, 0.4] }), P.sphere(0.22, '#6CC08A', { at: [0.3, 0.18, 0.02], scale: [1, 0.8, 0.4] })]), bag, 1)
  bush.position.set(DOOR.x0 + 0.3, 0, BACK_Z + 0.02)
  root.add(bush)
  // A soft shaft of light from the door across the floor.
  const shaft = new Mesh(bag.add(new PlaneGeometry(0.9, 2.2)), bag.add(new MeshBasicMaterial({ color: '#FFF2C4', transparent: true, opacity: 0.16, depthWrite: false })))
  shaft.position.set(1.7, 0.02, 0.5)
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
  return { root, door, sign, gecko, dog: { root: dogRoot, head, tail }, drop, puddle, wand, farmer }
}

/** Soft far hills with cloud sitting on the tops, painted on a canvas (one big flat picture behind the railing). */
function hillsTexture(bag: Bag) {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 384
  const g = c.getContext('2d')!
  const sky = g.createLinearGradient(0, 0, 0, 384)
  sky.addColorStop(0, '#CFE6F5')
  sky.addColorStop(1, '#EEF4F8')
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
  ridge(190, 90, '#A9C9C4', 1)
  // Clouds sitting on the far tops.
  g.fillStyle = 'rgba(255,255,255,.85)'
  for (const [x, y, r] of [[160, 130, 50], [230, 120, 40], [610, 110, 60], [690, 125, 46], [900, 140, 44]]) {
    g.beginPath()
    g.ellipse(x, y, r * 1.8, r * 0.6, 0, 0, Math.PI * 2)
    g.fill()
  }
  ridge(250, 70, '#82BE9A', 3)
  ridge(310, 50, '#6CB487', 5)
  const tex = bag.add(new CanvasTexture(c))
  tex.colorSpace = SRGBColorSpace
  return tex
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
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => P.box(0.06, TABLE.top - 0.06, 0.06, '#A57E5C', { at: [TABLE.x + sx * (TABLE.w / 2 - 0.1), (TABLE.top - 0.06) / 2, TABLE.z + sz * (TABLE.d / 2 - 0.1)] })),
    ...EATERS.flatMap((e) => [
      P.cyl(0.17, 0.17, 0.05, '#B98A64', { at: [SEATS[e].x, SEATS[e].seat - 0.025, SEAT_Z] }, 16),
      P.cyl(0.04, 0.05, SEATS[e].seat - 0.05, '#8C6248', { at: [SEATS[e].x, (SEATS[e].seat - 0.05) / 2, SEAT_Z] }, 8),
    ]),
    // A jug of water and two cups.
    P.cyl(0.05, 0.06, 0.16, '#BFE2FA', { at: [TX - 0.82, TABLE.top + 0.08, 0.22] }, 12),
    ...[TX - 0.62, TX + 0.36].map((x) => P.cyl(0.035, 0.03, 0.08, '#FFFFFF', { at: [x, TABLE.top + 0.04, -0.12] }, 10)),
  ]
  root.add(solid(merge(deck), bag, 2))
  // ---- The view: rice steps going down, the hills and the cloud ----
  const view = new Group()
  view.userData.pick = 'view'
  const steps = Array.from({ length: 5 }, (_, i) => P.rbox(9 - i * 0.6, 0.18, 1.3, 0.06, i % 2 ? '#A6E6B0' : '#8ED9A2', { at: [TX + (i % 2 ? 0.4 : -0.3), -0.7 - i * 0.45, RAIL_Z - 1.5 - i * 1.25] }))
  const hills = [
    P.sphere(3.2, GREENS[1], { at: [TX - 6, -3.4, -14], scale: [1.6, 0.7, 0.6] }),
    P.sphere(3.6, GREENS[3], { at: [TX + 5.5, -3.6, -15], scale: [1.7, 0.65, 0.6] }),
    P.sphere(2.4, GREENS[0], { at: [TX + 0.5, -3.0, -11], scale: [1.8, 0.55, 0.6] }),
    // A little village down in the valley: three roofs.
    ...[-1.2, -0.6, 0.1].map((x, i) => P.prism([[-0.25, 0], [0.25, 0], [0, 0.22]], 0.3, i === 1 ? '#E59A6E' : '#C98A6E', { at: [TX + x, -2.05 + i * 0.05, -6.6] })),
    ...[-1.2, -0.6, 0.1].map((x, i) => P.box(0.42, 0.24, 0.28, '#FFF1DC', { at: [TX + x, -2.17 + i * 0.05, -6.6] })),
  ]
  view.add(solid(merge([...steps, ...hills]), bag, 2))
  const far = new Mesh(bag.add(new PlaneGeometry(40, 15)), bag.add(new MeshBasicMaterial({ map: hillsTexture(bag), depthWrite: false })))
  far.position.set(TX, 2.4, -20)
  view.add(far)
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
  // ---- The clay oven: a stone stand, the dome, its dark mouth and the fire's glow inside ----
  const ovenRoot = new Group()
  ovenRoot.position.set(...OVEN)
  ovenRoot.userData.pick = 'oven'
  ovenRoot.add(
    solid(
      merge([
        P.rbox(0.86, 0.6, 0.8, 0.05, '#C9C0D6', { at: [0, 0.3, 0] }),
        ...[0.15, 0.32, 0.48].map((y) => P.box(0.87, 0.014, 0.81, '#B0A6C2', { at: [0, y, 0] })),
        P.sphere(0.4, '#E59A6E', { at: [0, 0.62, 0], scale: [1, 0.85, 0.95] }, 22),
        P.cyl(0.07, 0.08, 0.26, '#C9785A', { at: [-0.08, 1.02, -0.12] }, 10),
        P.torus(0.17, 0.035, '#C9785A', { at: [0, 0.68, 0.34], rot: [0, 0, 0] }, Math.PI),
        P.box(0.38, 0.03, 0.12, '#C9785A', { at: [0, 0.665, 0.34] }),
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
  return { root, plates, board, oven: { root: ovenRoot, glow }, view, cloud }
}

/** The fire's glow in the oven's mouth: 0 out, 1 roaring (it flickers). */
export function ovenGlow(t: Table['oven'], k: number, time: number) {
  const mat = t.glow.material as MeshBasicMaterial
  mat.opacity = k * (0.75 + 0.25 * Math.sin(time * 23) * Math.sin(time * 7.3))
}


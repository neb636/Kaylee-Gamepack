// What floats over each place on the Thailand map, so she can tell the places apart without reading. Three styles for
// Dad to choose between (`?pins=picture|friends|rides`, or the 1 2 3 buttons on the map); the two he doesn't pick get
// deleted:
//   - picture: the fat teardrop pin, with a hand-drawn picture of what's there printed on its head,
//   - friends: who she'll meet there, a real character on the shared rig, standing on a puff of cloud and waving,
//   - rides: what she'll ride there, on a little floating turntable tipped up to show it off.
import { Box3, CanvasTexture, Group, Mesh, MeshBasicMaterial, SphereGeometry, SRGBColorSpace, Vector3, type BufferGeometry, type Object3D } from 'three'
import { buildAnimal, type Rig } from '../../../../../engine3d/characters/animal'
import type { Look } from '../../../../../engine3d/characters/look'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { LOOKS, PATIENT_LOOKS } from '../../../characters/looks'
import { buildPajero } from '../../../trip/vehicles/pajero'
import { RIVAL_LOOKS } from '../../nan-trip/cup/rivals'
import { JETSKI_MAN } from '../../samet-trip/cast'
import { buildSki } from '../../samet-trip/jetski/ski'
import type { PinId } from './geo'
import { longtail, tuktuk } from './toys'

export type PinStyle = 'picture' | 'friends' | 'rides'
export const PIN_STYLES: PinStyle[] = ['picture', 'friends', 'rides']

export interface PinToy {
  root: Group
  /** How high its head is over its own feet: the stamp rides there and the tap target's top is measured from it. */
  head: number
  /** How wide its tap target is (units). */
  wide: number
  /** `pitch`: how far the camera looks down (radians). */
  update(t: number, pitch: number): void
}

const TAU = Math.PI * 2
const INK = '#2B2330'
type Pen = CanvasRenderingContext2D

// ------------------------------------------------------------------------------------------------ 1. picture pins

/** How the head of a picture pin is: its radius, and how far round the head the picture reaches (radians). */
const HEAD = { r: 0.36, y: 0.8, art: 0.98 }
const SIZE = 512

const oval = (g: Pen, x: number, y: number, rx: number, ry = rx, turn = 0) => {
  g.beginPath()
  g.ellipse(x, y, rx, ry, turn, 0, TAU)
}
/** Filled with an ink line round it. */
const blob = (g: Pen, color: string, x: number, y: number, rx: number, ry = rx, turn = 0, line = 13) => {
  oval(g, x, y, rx, ry, turn)
  g.fillStyle = color
  g.fill()
  if (line) {
    g.lineWidth = line
    g.strokeStyle = INK
    g.stroke()
  }
}
const fillDot = (g: Pen, color: string, x: number, y: number, rx: number, ry = rx, turn = 0) => blob(g, color, x, y, rx, ry, turn, 0)
const cheeks = (g: Pen, x: number, y: number, dx: number, r = 28) => {
  for (const s of [-1, 1]) fillDot(g, '#FF9EC4', x + s * dx, y, r, r * 0.68)
}
/** A big toy eye with a shine. */
const eyeAt = (g: Pen, x: number, y: number, r = 26) => {
  fillDot(g, INK, x, y, r)
  fillDot(g, '#FFFFFF', x + r * 0.32, y - r * 0.36, r * 0.34)
}
const smile = (g: Pen, x: number, y: number, w: number, h: number, line = 11) => {
  g.beginPath()
  g.moveTo(x - w, y)
  g.quadraticCurveTo(x, y + h, x + w, y)
  g.lineWidth = line
  g.strokeStyle = INK
  g.stroke()
}

/** Agong: the panda with round gold glasses and a white moustache. */
function drawAgong(g: Pen) {
  const dark = '#4A3F4F'
  for (const s of [-1, 1]) blob(g, dark, 256 + s * 128, 142, 60)
  blob(g, '#FFF6EE', 256, 282, 178, 158)
  for (const s of [-1, 1]) {
    fillDot(g, dark, 256 + s * 74, 262, 52, 62, -s * 0.32)
    fillDot(g, '#FFFFFF', 256 + s * 72, 258, 24)
    eyeAt(g, 256 + s * 72, 260, 15)
    oval(g, 256 + s * 74, 260, 60)
    g.lineWidth = 12
    g.strokeStyle = '#F2B632'
    g.stroke()
  }
  g.beginPath()
  g.moveTo(256 - 16, 256)
  g.quadraticCurveTo(256, 244, 256 + 16, 256)
  g.lineWidth = 12
  g.strokeStyle = '#F2B632'
  g.stroke()
  cheeks(g, 256, 332, 122, 26)
  fillDot(g, dark, 256, 332, 22, 15)
  // The moustache: two soft white curls with an ink edge, and his smile under it.
  for (const line of [26, 15]) {
    for (const s of [-1, 1]) {
      g.beginPath()
      g.moveTo(256, 356)
      g.quadraticCurveTo(256 + s * 42, 346, 256 + s * 74, 372)
      g.lineCap = 'round'
      g.lineWidth = line
      g.strokeStyle = line === 26 ? INK : '#FFFFFF'
      g.stroke()
    }
  }
  smile(g, 256, 392, 34, 20)
}

/** A baby elephant with big pink ears, its trunk curling up. */
function drawElephant(g: Pen) {
  const c = '#B9B3D6'
  for (const s of [-1, 1]) {
    blob(g, c, 256 + s * 158, 236, 92, 122, s * 0.18)
    fillDot(g, '#FFB8CC', 256 + s * 158, 240, 56, 84, s * 0.18)
  }
  blob(g, c, 256, 232, 142, 134)
  // The trunk: one thick line with a thinner one over it, curling up at the end.
  for (const [line, color] of [[86, INK], [62, c]] as const) {
    g.beginPath()
    g.moveTo(256, 290)
    g.bezierCurveTo(256, 410, 232, 462, 306, 462)
    g.bezierCurveTo(350, 462, 366, 430, 358, 396)
    g.lineCap = 'round'
    g.lineWidth = line
    g.strokeStyle = color
    g.stroke()
  }
  for (const y of [342, 382, 420]) {
    g.beginPath()
    g.moveTo(226, y)
    g.quadraticCurveTo(250, y + 10, 276, y)
    g.lineWidth = 7
    g.strokeStyle = '#8F88B8'
    g.stroke()
  }
  eyeAt(g, 198, 216, 27)
  eyeAt(g, 314, 216, 27)
  cheeks(g, 256, 272, 118, 27)
}

/** Nan's pink mushroom, smiling on the green hill. */
function drawMushroom(g: Pen) {
  blob(g, '#8FD79A', 256, 520, 300, 112)
  // The stem.
  g.beginPath()
  g.moveTo(178, 262)
  g.bezierCurveTo(176, 350, 164, 410, 170, 438)
  g.quadraticCurveTo(256, 470, 342, 438)
  g.bezierCurveTo(348, 410, 336, 350, 334, 262)
  g.closePath()
  g.fillStyle = '#FFF1DC'
  g.fill()
  g.lineWidth = 13
  g.strokeStyle = INK
  g.stroke()
  // The cap.
  g.beginPath()
  g.moveTo(58, 276)
  g.bezierCurveTo(58, 40, 454, 40, 454, 276)
  g.quadraticCurveTo(256, 342, 58, 276)
  g.closePath()
  g.fillStyle = '#FF7FB0'
  g.fill()
  g.lineWidth = 13
  g.stroke()
  fillDot(g, '#FFFFFF', 172, 180, 40, 34)
  fillDot(g, '#FFFFFF', 298, 138, 48, 38)
  fillDot(g, '#FFFFFF', 372, 226, 30, 26)
  fillDot(g, '#FFFFFF', 248, 244, 26, 20)
  eyeAt(g, 214, 352, 23)
  eyeAt(g, 298, 352, 23)
  cheeks(g, 256, 392, 76, 21)
  smile(g, 256, 388, 24, 22, 10)
}

/** The jet ski man: a cheeky otter in an orange cap. */
function drawOtter(g: Pen) {
  const fur = '#9A6744'
  for (const s of [-1, 1]) {
    blob(g, '#6E4630', 256 + s * 146, 176, 40)
    fillDot(g, '#E8B987', 256 + s * 146, 178, 18)
  }
  blob(g, fur, 256, 278, 180, 162)
  blob(g, '#F4DFC4', 256, 346, 112, 80, 0, 0)
  eyeAt(g, 184, 262, 28)
  eyeAt(g, 328, 262, 28)
  cheeks(g, 256, 322, 142, 26)
  // The nose and a big open grin.
  g.beginPath()
  g.moveTo(226, 304)
  g.quadraticCurveTo(256, 290, 286, 304)
  g.quadraticCurveTo(280, 336, 256, 340)
  g.quadraticCurveTo(232, 336, 226, 304)
  g.fillStyle = INK
  g.fill()
  g.beginPath()
  g.moveTo(208, 362)
  g.quadraticCurveTo(256, 438, 304, 362)
  g.quadraticCurveTo(256, 382, 208, 362)
  g.closePath()
  g.fillStyle = '#FF6F91'
  g.fill()
  g.lineWidth = 10
  g.strokeStyle = INK
  g.stroke()
  // Whiskers.
  g.lineWidth = 6
  for (const s of [-1, 1]) {
    for (const k of [-1, 0, 1]) {
      g.beginPath()
      g.moveTo(256 + s * 110, 340 + k * 14)
      g.lineTo(256 + s * 172, 330 + k * 28)
      g.stroke()
    }
  }
  // The orange cap, its bill pointing at her.
  g.beginPath()
  g.moveTo(106, 198)
  g.bezierCurveTo(116, 54, 396, 54, 406, 198)
  g.quadraticCurveTo(256, 150, 106, 198)
  g.closePath()
  g.fillStyle = '#FF8A2E'
  g.fill()
  g.lineWidth = 13
  g.stroke()
  blob(g, '#FFFFFF', 256, 112, 34, 30, 0, 0)
  g.beginPath()
  g.moveTo(150, 190)
  g.quadraticCurveTo(256, 236, 362, 190)
  g.quadraticCurveTo(256, 158, 150, 190)
  g.closePath()
  g.fillStyle = '#FFB066'
  g.fill()
  g.lineWidth = 11
  g.stroke()
}

const PICTURES: Record<PinId, { back: string; draw: (g: Pen) => void }> = {
  bangkok: { back: '#FFE0EC', draw: drawAgong },
  krabi: { back: '#CDEBFF', draw: drawElephant },
  nan: { back: '#D8F6E8', draw: drawMushroom },
  samet: { back: '#FFF0BE', draw: drawOtter },
}

function paintPicture(id: PinId, bag: Bag) {
  const c = document.createElement('canvas')
  c.width = c.height = SIZE
  const g = c.getContext('2d')!
  g.lineCap = g.lineJoin = 'round'
  g.fillStyle = PICTURES[id].back
  g.fillRect(0, 0, SIZE, SIZE)
  PICTURES[id].draw(g)
  const tex = bag.add(new CanvasTexture(c))
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/** A piece of a ball round +z, `reach` radians from the middle to the edge, with the picture laid flat over it. */
function capGeometry(r: number, reach: number): BufferGeometry {
  const geo = new SphereGeometry(r, 36, 14, 0, TAU, 0, reach).rotateX(Math.PI / 2)
  const pos = geo.attributes.position
  const uv = geo.attributes.uv
  const edge = r * Math.sin(reach)
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) / edge + 1) / 2, (pos.getY(i) / edge + 1) / 2)
  return geo
}

function picturePin(id: PinId, color: string, bag: Bag): PinToy {
  const root = new Group()
  const big = new Group()
  big.scale.setScalar(1.22)
  root.add(big)
  big.add(
    solid(
      merge([
        P.sphere(HEAD.r, color, { at: [0, HEAD.y, 0] }, 26),
        P.cone(0.31, 0.66, color, { at: [0, 0.33, 0], rot: [Math.PI, 0, 0] }, 26),
      ]),
      bag,
      2.5,
    ),
  )
  // The picture turns on its own to look up at the camera; the pin stays upright.
  const face = new Group()
  face.position.y = HEAD.y
  big.add(face)
  const white = new Mesh(bag.add(capGeometry(HEAD.r + 0.003, HEAD.art + 0.08)), bag.add(new MeshBasicMaterial({ color: '#FFFFFF' })))
  const art = new Mesh(bag.add(capGeometry(HEAD.r + 0.006, HEAD.art)), bag.add(new MeshBasicMaterial({ map: paintPicture(id, bag) })))
  face.add(white, art)
  return {
    root,
    head: HEAD.y * 1.22,
    wide: 1.25,
    update(_t, pitch) {
      face.rotation.x = -pitch * 0.85
    },
  }
}

// ------------------------------------------------------------------------------------------------ 2. friends

/** Who's at each place: Agong at his house, the baby elephant at Baan Chang, Moon the honey seller in Nan, the jet ski
 *  man on Koh Samet. */
const FRIENDS: Record<PinId, Look> = {
  bangkok: LOOKS.agong,
  krabi: PATIENT_LOOKS.elephant,
  nan: RIVAL_LOOKS.moon,
  samet: JETSKI_MAN,
}
const FRIEND_TALL = 1.3
const PUFF_SCALE = 1.35

function puff(color: string, bag: Bag) {
  const white = '#FFFFFF'
  return solid(
    merge([
      P.sphere(0.36, color, { at: [0, 0.08, 0], scale: [1.28, 0.42, 1.28] }, 20),
      P.sphere(0.2, color, { at: [-0.34, 0.06, 0.1], scale: [1.1, 0.6, 1.1] }, 14),
      P.sphere(0.2, color, { at: [0.33, 0.05, 0.12], scale: [1.15, 0.6, 1.1] }, 14),
      P.sphere(0.17, color, { at: [0.02, 0.04, 0.34], scale: [1.25, 0.6, 1] }, 14),
      P.sphere(0.17, color, { at: [-0.04, 0.05, -0.32], scale: [1.25, 0.65, 1] }, 14),
      P.sphere(0.09, white, { at: [-0.2, 0.16, 0.22], scale: [1.4, 0.45, 1] }, 10),
      P.sphere(0.07, white, { at: [0.24, 0.15, 0.2], scale: [1.4, 0.45, 1] }, 10),
    ]),
    bag,
    2,
  )
}

function friendPin(id: PinId, color: string, bag: Bag, phase: number): PinToy {
  const root = new Group()
  const cloud = puff(color, bag)
  cloud.scale.setScalar(PUFF_SCALE)
  root.add(cloud)
  const look = FRIENDS[id]
  const rig: Rig = buildAnimal(look, bag)
  const k = FRIEND_TALL / rig.height
  rig.root.scale.setScalar(k)
  rig.root.position.y = 0.2
  root.add(rig.root)
  return {
    root,
    head: 0.2 + FRIEND_TALL * 0.92,
    wide: 1.5,
    update(t, pitch) {
      // A happy wave, a little bounce, and a blink now and then.
      rig.armR.rotation.z = 2.5 + Math.sin(t * 8 + phase) * 0.32
      rig.armL.rotation.z = -0.25 + Math.sin(t * 2.2 + phase) * 0.08
      const hop = Math.abs(Math.sin(t * 2.6 + phase))
      rig.body.position.y = hop * 0.05 * rig.height
      rig.body.scale.set(1 + (1 - hop) * 0.03, 1 - (1 - hop) * 0.04, 1 + (1 - hop) * 0.03)
      rig.head.rotation.x = -pitch * 0.5
      rig.head.rotation.z = Math.sin(t * 1.3 + phase) * 0.1
      rig.eyes.scale.y = (t + phase) % 3.4 < 0.13 ? 0.1 : 1
    },
  }
}

// ------------------------------------------------------------------------------------------------ 3. rides

const RIDE_LONG = 1.0
/** The whole turntable, bigger than the pins were so the ride shows from the far side of the map. */
const TABLE_SCALE = 1.45

/** Stands a vehicle on the turntable, whatever size it was built at, the middle of it over the middle of the table. */
function onTable(ride: Object3D, table: Group, y: number, long = RIDE_LONG) {
  const box = new Box3().setFromObject(ride)
  const size = box.getSize(new Vector3())
  const k = long / Math.max(size.x, size.z)
  ride.scale.multiplyScalar(k)
  const fitted = new Box3().setFromObject(ride)
  const mid = fitted.getCenter(new Vector3())
  ride.position.x -= mid.x
  ride.position.z -= mid.z
  ride.position.y += y - fitted.min.y
  table.add(ride)
}

function turntable(color: string, bag: Bag) {
  const parts: BufferGeometry[] = [
    P.cyl(0.54, 0.46, 0.14, color, { at: [0, 0.07, 0] }, 28),
    P.cyl(0.5, 0.5, 0.02, '#FFF7F0', { at: [0, 0.145, 0] }, 28),
  ]
  // Bulbs round the rim, like a toy carousel.
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU
    parts.push(P.sphere(0.042, i % 2 ? '#FFFFFF' : '#FFD46B', { at: [Math.cos(a) * 0.53, 0.09, Math.sin(a) * 0.53] }, 8))
  }
  return solid(merge(parts), bag, 2)
}

function ridePin(id: PinId, color: string, bag: Bag, phase: number): PinToy {
  const root = new Group()
  // Tipped up towards the camera, so she sees the ride from the side and not from on top.
  const tip = new Group()
  tip.scale.setScalar(TABLE_SCALE)
  root.add(tip)
  tip.add(turntable(color, bag))
  const holder = new Group()
  tip.add(holder)
  let body: Object3D = holder
  if (id === 'bangkok') onTable(tuktuk(bag), holder, 0.155)
  else if (id === 'krabi') onTable(longtail(bag), holder, 0.17, 1.28)
  else if (id === 'nan') {
    const car = buildPajero(bag)
    car.beams.removeFromParent()
    onTable(car.root, holder, 0.155)
    body = car.body
  } else onTable(buildSki(bag).root, holder, 0.17)
  const rest = body === holder ? 0 : body.position.y
  return {
    root,
    head: 0.72 * TABLE_SCALE,
    wide: 1.7,
    update(t, pitch) {
      tip.rotation.x = -pitch * 0.62
      // Showing its side to her, swinging slowly so she sees all of it.
      holder.rotation.y = 0.95 + Math.sin(t * 0.8 + phase) * 0.4
      // It's ready to go: the engine shakes it, and now and then it does a happy hop.
      const beat = (t + phase) % 2.4
      const hop = beat < 0.42 ? Math.sin((beat / 0.42) * Math.PI) * 0.1 : 0
      const shake = Math.sin(t * 34 + phase) * 0.006
      if (body === holder) holder.position.y = hop + shake
      else {
        holder.position.y = hop
        body.position.y = rest + shake * 0.4
      }
      holder.rotation.z = Math.sin(t * 2.1 + phase) * 0.035
    },
  }
}

export function buildPin(style: PinStyle, id: PinId, color: string, bag: Bag, phase: number): PinToy {
  if (style === 'friends') return friendPin(id, color, bag, phase)
  if (style === 'rides') return ridePin(id, color, bag, phase)
  return picturePin(id, color, bag)
}

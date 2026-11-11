// The Nan mountain roads' other traffic (trip/road/traffic.ts drives them), as toys in the house's toon look with
// Nan folk at the wheel, toy animals on the chibi rig (not family: a monkey, a raccoon, a beaver, a gecko, a sun bear):
// - a step-through scooter, the motorbike every Thai family rides: a round leg shield and a bulging tail in a pastel
//   color, a long dark seat, a chrome handlebar with its round headlamp and two mirrors on stalks, a wicker basket of
//   fruit on the front, spoked wheels; a rider in a round helmet and, half the time, a little one behind holding on.
// - a tuk-tuk: a bright three-wheeler with the driver up front at the handlebar, under a canopy roof that sweeps up at
//   the front, fringed with little pompoms; a bench in the back with chrome rails and a passenger or two, waving.
// - the little car behind the blind bend: a round toy hatchback with fat fenders over its wheels, big round headlamps
//   (they flash hello) in chrome rings over a little grille, see-through windows with a driver inside, bumpers, wing
//   mirrors, a roof rack with a bag strapped on.
// Each faces +z with its wheels at the ground, and rocks a little as it goes. `update` gives the riders their small life
// (they blink, hold on, look about) and waves (`wave`) when she taps them or as they go by.
import { Group, Mesh, MeshBasicMaterial, SphereGeometry, type BufferGeometry } from 'three'
import { bell, clamp } from '../../../../../sdk'
import { buildAnimal, type Rig } from '../../../../engine3d/characters/animal'
import { FaceLife } from '../../../../engine3d/characters/face'
import type { Look } from '../../../../engine3d/characters/look'
import type { Bag } from '../../../../engine3d/dispose'
import { bake, merge, P, solid } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'

const CHROME = '#EEF0F6'
const TRIM = '#3E3849'
const SEAT = '#5E5468'
const GLASS = '#CDEBFF'
const LAMP = '#FFF1B8'
const RED = '#FF5C7A'
const WICKER = '#D9A066'

/** Nan folk on the road (toy animals, nobody in the family). */
const FOLK: Look[] = [
  { species: 'monkey', height: 1.05, fur: '#C08A5E', light: '#FFE6CC', dark: '#7A5340', ear: '#FFC2B0', outfit: { kind: 'tee', color: '#8FC9F5' }, open: true },
  { species: 'raccoon', height: 1.05, fur: '#A9A3B8', light: '#F4F0FA', dark: '#4A4458', ear: '#FFC2C8', outfit: { kind: 'shirt', color: '#FBE78A' }, lashes: true, open: true },
  { species: 'beaver', height: 1.1, chub: 1.15, fur: '#B07A55', light: '#F6DCC0', dark: '#6E4A3A', ear: '#FFC2B0', outfit: { kind: 'polo', color: '#A7EBD0' }, open: true },
  { species: 'gecko', height: 1.0, fur: '#9BDB8A', light: '#E8F8D8', dark: '#5AA06A', ear: '#FFD48A', outfit: { kind: 'tee', color: '#FFB8D0' }, lashes: true, open: true },
  { species: 'bear', height: 1.15, chub: 1.2, fur: '#5E4440', light: '#FFD48A', dark: '#3A2A30', ear: '#FFB8A8', outfit: { kind: 'shirt', color: '#C9B5F7' }, open: true },
]
/** The little ones riding pillion. */
const KIDS: Look[] = [
  { species: 'monkey', height: 0.75, fur: '#D49A6A', light: '#FFEEDB', dark: '#7A5340', ear: '#FFC2B0', outfit: { kind: 'dress', color: '#FF9CC8' }, lashes: true, open: true },
  { species: 'raccoon', height: 0.75, fur: '#B9B3C8', light: '#F8F5FC', dark: '#4A4458', ear: '#FFC2C8', outfit: { kind: 'tee', color: '#8FE3C8' }, open: true },
]

/** A rider: their rig, how they sit and what their arms do. */
interface Seat {
  rig: Rig
  life: FaceLife
  /** Holding on: the arms reach forward to the handlebar (the driver) or round the one in front (pillion), or rest. */
  hold: 'bar' | 'hug' | 'rest'
  /** Waves first with this arm when they wave (+1 right, -1 left: the side toward her as they pass). */
  phase: number
}

export interface Local {
  root: Group
  /** The bit that bounces (the mover rocks it). */
  body: Group
  /** Roll about their x axis. */
  wheels: Group[]
  /** The headlamps' color (the blind bend's car flashes them). */
  lamps: MeshBasicMaterial | null
  /** Seconds of waving left (everyone aboard waves). */
  wave: number
  update(dt: number, t: number): void
}

/** A toy animal sitting at `at` (body-local), facing forward, its bottom on the cushion. */
function sit(body: Group, look: Look, at: [number, number, number], hold: Seat['hold'], bag: Bag, phase: number): Seat {
  const rig = buildAnimal(look, bag)
  // (The vehicle has its own shadow.)
  rig.root.children[0].visible = false
  // (Sunk into the seat: the chibi legs have no knees to bend, so they go down into the seat and the body under it.)
  rig.root.position.set(at[0], at[1] - 0.3 * rig.height, at[2])
  body.add(rig.root)
  return { rig, life: new FaceLife(rig), hold, phase }
}

/** A round open-face helmet on a rider's head, tipped back so the face shows, with a little peak. */
function helmet(rig: Rig, color: string, bag: Bag) {
  const { R, headY } = rig.face
  const shell = bake(new SphereGeometry(R * 1.2, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), color, { at: [0, headY + R * 0.12, -R * 0.12], rot: [-0.6, 0, 0] })
  const rim = P.torus(R * 1.2, R * 0.07, PAL.cream, { at: [0, headY + R * 0.12, -R * 0.12], rot: [Math.PI / 2 - 0.6, 0, 0] })
  const peak = P.cyl(R * 0.5, R * 0.5, R * 0.07, color, { at: [0, headY + R * 0.95, R * 0.55], rot: [0.95, 0, 0], scale: [1, 1, 0.5] }, 14)
  rig.head.add(solid(merge([shell, rim, peak]), bag, 2))
}

/** A spoked wheel (axle along x), radius `r`. */
function wheel(r: number, hub: string, bag: Bag, spokes = 5) {
  const w = new Group()
  const tyre = r * 0.3
  w.add(solid(merge([
    P.torus(r - tyre, tyre, PAL.ink, { rot: [0, Math.PI / 2, 0] }),
    P.cyl(r - tyre, r - tyre, tyre * 1.2, TRIM, { rot: [0, 0, Math.PI / 2] }),
    ...Array.from({ length: spokes }, (_, i) => {
      const a = (i * Math.PI * 2) / spokes
      return P.box(tyre * 1.4, (r - tyre) * 1.7, r * 0.12, hub, { rot: [a, 0, 0] })
    }),
    P.cyl(r * 0.26, r * 0.26, tyre * 1.5, hub, { rot: [0, 0, Math.PI / 2] }),
  ]), bag, 2))
  return w
}

/** The riders' small life: blinking, holding on, a look about now and then, and the wave. */
function animate(seats: Seat[], self: { wave: number }, dt: number, t: number) {
  self.wave = Math.max(0, self.wave - dt)
  const ease = Math.min(1, dt * 8)
  seats.forEach((s, i) => {
    const { body, head, armL, armR } = s.rig
    s.life.update(dt)
    const breath = 1 + Math.sin(t * 2.4 + i * 1.7) * 0.02
    body.scale.set(1 / Math.sqrt(breath), breath, 1 / Math.sqrt(breath))
    head.rotation.y = Math.sin(t * 0.5 + i * 2.1) * 0.35 * clamp(Math.sin(t * 0.23 + i) * 3, 0, 1)
    head.rotation.z = Math.sin(t * 1.6 + i) * 0.05
    const set = (g: Group, x: number, z: number) => {
      g.rotation.x += (x - g.rotation.x) * ease
      g.rotation.z += (z - g.rotation.z) * ease
    }
    const [lx, lz, rx, rz] = s.hold === 'bar' ? [-1.25, 0.28, -1.25, -0.28] : s.hold === 'hug' ? [-1.0, 0.75, -1.0, -0.75] : [-0.25, -0.15, -0.25, 0.15]
    // The driver waves with one paw (the other stays on the bar); everyone else with both, hopping in the seat.
    const waving = self.wave > 0
    const flap = Math.sin(t * 12 + i) * 0.35
    const wavesL = waving && (s.hold !== 'bar' || s.phase < 0)
    const wavesR = waving && (s.hold !== 'bar' || s.phase > 0)
    set(armL, wavesL ? -0.2 : lx, wavesL ? -2.5 - flap : lz)
    set(armR, wavesR ? -0.2 : rx, wavesR ? 2.5 + flap : rz)
    s.rig.root.position.y += ((waving && s.hold !== 'bar' ? bell((t * 2.5 + i * 0.4) % 1) * 0.06 : 0) - (s.rig.root.userData.bob ?? 0))
    s.rig.root.userData.bob = waving && s.hold !== 'bar' ? bell((t * 2.5 + i * 0.4) % 1) * 0.06 : 0
  })
}

function local(root: Group, body: Group, wheels: Group[], lamps: MeshBasicMaterial | null, seats: Seat[]): Local {
  const self: Local = {
    root,
    body,
    wheels,
    lamps,
    wave: 0,
    update: (dt, t) => animate(seats, self, dt, t),
  }
  return self
}

/** A step-through scooter, in one of the pastel paints, with its rider (and maybe a little one behind). */
export function buildScooter(i: number, bag: Bag): Local {
  const root = new Group()
  const body = new Group()
  root.add(body)
  const c = [PAL.mint, PAL.sky, PAL.peach, '#FF9EC2'][i % 4]
  const dark = [ '#5FBFA0', '#6FB0E0', '#E8956F', '#E86A9C'][i % 4]
  const W = { r: 0.27, front: 0.62, rear: -0.6 }
  body.add(solid(merge([
    // The floorboard between her feet, and the frame under it.
    P.rbox(0.4, 0.09, 0.62, 0.04, TRIM, { at: [0, 0.36, 0.04] }),
    // The tail: a round bulge under the seat, tapering back.
    P.rbox(0.44, 0.34, 0.74, 0.16, c, { at: [0, 0.58, -0.36] }),
    P.sphere(0.24, c, { at: [0, 0.6, -0.68], scale: [0.9, 0.8, 0.9] }, 14),
    P.box(0.46, 0.05, 0.6, dark, { at: [0, 0.5, -0.38] }),
    // The long seat and the grab rail behind it.
    P.rbox(0.36, 0.1, 0.78, 0.05, SEAT, { at: [0, 0.8, -0.34] }),
    P.torus(0.15, 0.025, CHROME, { at: [0, 0.82, -0.78], rot: [Math.PI / 2, 0, 0], scale: [1.1, 1, 1] }, Math.PI),
    // The leg shield, round in front, and the front fender over the wheel.
    P.rbox(0.5, 0.72, 0.16, 0.08, c, { at: [0, 0.74, 0.4], rot: [-0.22, 0, 0] }),
    P.rbox(0.36, 0.5, 0.1, 0.05, dark, { at: [0, 0.7, 0.47], rot: [-0.22, 0, 0] }),
    P.torus(W.r + 0.05, 0.06, c, { at: [0, W.r, W.front], rot: [0, Math.PI / 2, 0] }, Math.PI * 0.85),
    // The fork, the steering column and the handlebar's cowl with its round headlamp.
    ...[-1, 1].map((s) => P.cyl(0.025, 0.025, 0.5, CHROME, { at: [s * 0.08, 0.5, W.front - 0.02], rot: [-0.25, 0, 0] })),
    P.cyl(0.04, 0.045, 0.5, CHROME, { at: [0, 1.0, 0.47], rot: [-0.25, 0, 0] }),
    P.rbox(0.36, 0.16, 0.24, 0.07, c, { at: [0, 1.28, 0.42] }),
    P.cyl(0.02, 0.02, 0.74, CHROME, { at: [0, 1.32, 0.38], rot: [0, 0, Math.PI / 2] }),
    ...[-1, 1].flatMap((s) => [
      P.cyl(0.035, 0.035, 0.13, PAL.ink, { at: [s * 0.36, 1.32, 0.38], rot: [0, 0, Math.PI / 2] }),
      // The mirrors on their stalks.
      P.cyl(0.012, 0.012, 0.26, CHROME, { at: [s * 0.22, 1.46, 0.38], rot: [0, 0, -s * 0.35] }),
      P.sphere(0.06, CHROME, { at: [s * 0.27, 1.59, 0.38], scale: [1.3, 0.9, 0.35] }, 10),
      // The indicators, front and back.
      P.sphere(0.035, PAL.gold, { at: [s * 0.17, 1.26, 0.55] }, 8),
      P.sphere(0.035, PAL.gold, { at: [s * 0.16, 0.66, -0.88] }, 8),
    ]),
    P.sphere(0.07, RED, { at: [0, 0.66, -0.9], scale: [1.4, 0.8, 0.6] }, 10),
    // The number plate.
    P.box(0.22, 0.12, 0.02, PAL.cream, { at: [0, 0.45, -0.86], rot: [0.2, 0, 0] }),
    // The wicker basket on the front, full of fruit from the market.
    P.rbox(0.34, 0.2, 0.22, 0.03, WICKER, { at: [0, 1.06, 0.66] }),
    P.box(0.36, 0.03, 0.24, '#B9844F', { at: [0, 1.16, 0.66] }),
    P.sphere(0.07, PAL.peach, { at: [-0.08, 1.2, 0.64] }, 10),
    P.sphere(0.06, '#9BDB8A', { at: [0.07, 1.2, 0.68] }, 10),
    P.sphere(0.055, PAL.gold, { at: [0.02, 1.22, 0.6] }, 10),
  ]), bag, 2))
  const lamps = bag.add(new MeshBasicMaterial({ color: LAMP }))
  body.add(new Mesh(bag.add(P.sphere(0.085, '#ffffff', { at: [0, 1.28, 0.55], scale: [1.2, 1, 0.5] }, 12)), lamps))
  const wheels = [W.front, W.rear].map((z) => {
    const w = wheel(W.r, CHROME, bag)
    w.position.set(0, W.r, z)
    body.add(w)
    return w
  })
  const rider = sit(body, FOLK[i % FOLK.length], [0, 0.86, -0.12], 'bar', bag, i % 2 ? 1 : -1)
  helmet(rider.rig, [PAL.hotpink, '#FFFFFF', PAL.gold, '#8FC9F5'][i % 4], bag)
  const seats = [rider]
  if (i % 2 === 0) {
    const kid = sit(body, KIDS[(i >> 1) % KIDS.length], [0, 0.86, -0.52], 'hug', bag, 1)
    helmet(kid.rig, [PAL.gold, PAL.hotpink][(i >> 1) % 2], bag)
    seats.push(kid)
  }
  return local(root, body, wheels, lamps, seats)
}

/** A tuk-tuk, with its driver up front and a passenger or two on the back bench. */
export function buildTuktuk(i: number, bag: Bag): Local {
  const root = new Group()
  const body = new Group()
  root.add(body)
  const c = [PAL.sky, PAL.hotpink, PAL.mint][i % 3]
  const trim = [PAL.butter, PAL.butter, '#FF9EC2'][i % 3]
  const roof = ['#3E6FD8', '#7A3D9C', '#2F8F6F'][i % 3]
  const FRONT = { z: 1.05, r: 0.27 }
  const REAR = { x: 0.64, z: -0.85, r: 0.29 }
  const parts: BufferGeometry[] = [
    // The tub: the back's body round the bench, and the long nose up to the front wheel.
    P.rbox(1.3, 0.5, 1.5, 0.16, c, { at: [0, 0.62, -0.55] }),
    P.box(1.32, 0.08, 1.52, trim, { at: [0, 0.72, -0.55] }),
    P.rbox(0.62, 0.42, 1.0, 0.16, c, { at: [0, 0.58, 0.5] }),
    P.box(0.64, 0.06, 1.0, trim, { at: [0, 0.66, 0.5] }),
    // The nose's round face, its fender and the chrome bumper.
    P.rbox(0.7, 0.62, 0.36, 0.17, c, { at: [0, 0.78, 1.0] }),
    P.torus(FRONT.r + 0.06, 0.07, c, { at: [0, FRONT.r, FRONT.z], rot: [0, Math.PI / 2, 0] }, Math.PI * 0.9),
    P.cyl(0.035, 0.035, 0.6, CHROME, { at: [0, 0.46, 1.2], rot: [0, 0, Math.PI / 2] }),
    ...[-1, 1].flatMap((s) => [P.sphere(0.05, PAL.gold, { at: [s * 0.3, 1.0, 1.19] }, 8), P.sphere(0.06, RED, { at: [s * 0.58, 0.62, -1.32], scale: [1, 1, 0.6] }, 8)]),
    // The rear fenders.
    ...[-1, 1].map((s) => P.torus(REAR.r + 0.06, 0.08, c, { at: [s * REAR.x, REAR.r, REAR.z], rot: [0, Math.PI / 2, 0] }, Math.PI)),
    // The driver's seat, the column and the handlebar.
    P.rbox(0.58, 0.12, 0.44, 0.05, SEAT, { at: [0, 0.92, 0.42] }),
    P.cyl(0.04, 0.045, 0.6, CHROME, { at: [0, 1.08, 0.86], rot: [-0.35, 0, 0] }),
    P.cyl(0.022, 0.022, 0.78, CHROME, { at: [0, 1.36, 0.78], rot: [0, 0, Math.PI / 2] }),
    ...[-1, 1].map((s) => P.cyl(0.036, 0.036, 0.13, PAL.ink, { at: [s * 0.39, 1.36, 0.78], rot: [0, 0, Math.PI / 2] })),
    // The windscreen's chrome top (the glass is see-through, below).
    P.box(0.9, 0.04, 0.05, CHROME, { at: [0, 1.86, 1.06] }),
    // The back bench, its backrest and the chrome rails along the sides.
    P.rbox(1.1, 0.14, 0.5, 0.05, SEAT, { at: [0, 0.92, -0.62] }),
    P.rbox(1.1, 0.5, 0.12, 0.05, SEAT, { at: [0, 1.22, -0.95], rot: [-0.12, 0, 0] }),
    ...[-1, 1].flatMap((s) => [P.cyl(0.03, 0.03, 0.9, CHROME, { at: [s * 0.66, 1.18, -0.5], rot: [Math.PI / 2, 0, 0] }), P.cyl(0.025, 0.025, 0.3, CHROME, { at: [s * 0.66, 1.04, -0.05] })]),
    // The posts up to the canopy.
    ...[-1, 1].flatMap((s) => [P.cyl(0.035, 0.035, 1.25, CHROME, { at: [s * 0.62, 1.5, -1.05] }), P.cyl(0.035, 0.035, 1.08, CHROME, { at: [s * 0.42, 1.65, 0.98], rot: [-0.15, 0, 0] })]),
    // The canopy: flat over the back, sweeping up at the front, a stripe all round.
    P.rbox(1.42, 0.1, 2.0, 0.05, roof, { at: [0, 2.14, -0.2] }),
    P.rbox(1.12, 0.1, 0.62, 0.05, roof, { at: [0, 2.24, 1.02], rot: [-0.32, 0, 0] }),
    P.box(1.45, 0.07, 2.03, trim, { at: [0, 2.08, -0.2] }),
    P.box(1.15, 0.06, 0.64, trim, { at: [0, 2.18, 1.0], rot: [-0.32, 0, 0] }),
  ]
  // Little pompoms fringing the canopy.
  const pom = [PAL.hotpink, PAL.gold, PAL.cream]
  for (let k = 0; k < 9; k++) for (const s of [-1, 1]) parts.push(P.sphere(0.045, pom[k % 3], { at: [s * 0.72, 2.0, -1.12 + k * 0.23] }, 8))
  for (let k = 0; k < 6; k++) parts.push(P.sphere(0.045, pom[k % 3], { at: [-0.6 + k * 0.24, 2.0, -1.22] }, 8))
  body.add(solid(merge(parts), bag, 2))
  const glass = bag.add(new MeshBasicMaterial({ color: GLASS, transparent: true, opacity: 0.32, depthWrite: false }))
  body.add(new Mesh(bag.add(P.box(0.86, 0.5, 0.02, '#ffffff', { at: [0, 1.6, 1.02], rot: [-0.15, 0, 0] })), glass))
  const lamps = bag.add(new MeshBasicMaterial({ color: LAMP }))
  body.add(new Mesh(bag.add(P.sphere(0.11, '#ffffff', { at: [0, 0.9, 1.18], scale: [1.2, 1, 0.5] }, 12)), lamps))
  const wheels: Group[] = []
  const front = wheel(FRONT.r, CHROME, bag)
  front.position.set(0, FRONT.r, FRONT.z)
  for (const s of [-1, 1]) {
    const w = wheel(REAR.r, CHROME, bag)
    w.position.set(s * REAR.x, REAR.r, REAR.z)
    wheels.push(w)
  }
  wheels.push(front)
  body.add(...wheels)
  const seats = [sit(body, FOLK[(i + 1) % FOLK.length], [0, 0.98, 0.38], 'bar', bag, 1)]
  // A passenger or two on the bench, waving at everyone.
  seats.push(sit(body, FOLK[(i + 3) % FOLK.length], [i % 2 ? 0.26 : -0.26, 0.99, -0.62], 'rest', bag, 1))
  if (i % 2 === 0) seats.push(sit(body, KIDS[i % KIDS.length], [0.3, 0.99, -0.62], 'rest', bag, 1))
  return local(root, body, wheels, lamps, seats)
}

/** The little round car (the one behind the blind bend), with its driver inside. */
export function buildMiniCar(i: number, bag: Bag): Local {
  const root = new Group()
  const body = new Group()
  root.add(body)
  const c = ['#FFD36E', '#8FE3C8', '#FF9EC2'][i % 3]
  const shade = ['#F2B84A', '#5FBFA0', '#E86A9C'][i % 3]
  const W = 1.62
  const WH = { r: 0.36, x: 0.66, front: 1.02, rear: -1.0 }
  const BELT = 1.02
  const ROOF = 1.72
  const half = W / 2
  const glass = bag.add(new MeshBasicMaterial({ color: GLASS, transparent: true, opacity: 0.32, depthWrite: false }))
  const parts: BufferGeometry[] = [
    // The body up to the windows: a round tub, the hood sloping down to the nose.
    P.rbox(W, 0.6, 3.1, 0.28, c, { at: [0, 0.68, -0.05] }),
    P.rbox(W - 0.06, 0.24, 1.0, 0.12, c, { at: [0, 0.92, 1.0], rot: [0.1, 0, 0] }),
    // The fat fenders over the wheels.
    ...[-1, 1].flatMap((s) => [WH.front, WH.rear].map((z) => P.torus(WH.r + 0.08, 0.13, c, { at: [s * (half - 0.04), WH.r + 0.04, z], rot: [0, Math.PI / 2, 0] }, Math.PI))),
    ...[-1, 1].flatMap((s) => [WH.front, WH.rear].map((z) => P.cyl(WH.r + 0.06, WH.r + 0.06, 0.06, TRIM, { at: [s * (half - 0.02), WH.r + 0.04, z], rot: [0, 0, Math.PI / 2] }))),
    // A stripe along each side, the door's line and its handle.
    ...[-1, 1].flatMap((s) => [
      P.box(0.02, 0.07, 2.3, shade, { at: [s * (half + 0.005), 0.78, -0.05] }),
      P.box(0.02, 0.5, 0.025, shade, { at: [s * (half + 0.005), 0.72, -0.25] }),
      P.rbox(0.03, 0.04, 0.16, 0.015, CHROME, { at: [s * (half + 0.01), 0.92, -0.4] }),
      // The wing mirrors.
      P.rbox(0.08, 0.13, 0.2, 0.04, c, { at: [s * (half + 0.1), 1.12, 0.42] }),
    ]),
    // The cabin's frame: a pillar at each corner and the roof.
    ...[-1, 1].flatMap((s) => [
      P.box(0.08, 0.72, 0.09, c, { at: [s * (half - 0.12), BELT + 0.33, 0.5], rot: [-0.45, 0, 0] }),
      P.box(0.08, 0.72, 0.12, c, { at: [s * (half - 0.12), BELT + 0.34, -0.25] }),
      P.box(0.08, 0.7, 0.14, c, { at: [s * (half - 0.12), BELT + 0.33, -1.28], rot: [0.18, 0, 0] }),
    ]),
    P.rbox(W - 0.18, 0.1, 1.82, 0.05, c, { at: [0, ROOF, -0.45] }),
    // The roof rack with a pink bag strapped on.
    ...[-1, 1].map((s) => P.cyl(0.025, 0.025, 1.3, CHROME, { at: [s * 0.5, ROOF + 0.12, -0.45], rot: [Math.PI / 2, 0, 0] })),
    ...[-0.95, 0.05].map((z) => P.cyl(0.02, 0.02, 1.04, CHROME, { at: [0, ROOF + 0.12, z], rot: [0, 0, Math.PI / 2] })),
    P.rbox(0.7, 0.26, 0.6, 0.1, PAL.hotpink, { at: [0, ROOF + 0.26, -0.5] }),
    P.box(0.04, 0.27, 0.62, PAL.cream, { at: [0, ROOF + 0.27, -0.5] }),
    // The face: big round headlamps in chrome rings, a little grille, the bumpers.
    ...[-1, 1].flatMap((s) => [P.torus(0.15, 0.035, CHROME, { at: [s * 0.5, 0.78, 1.55] }), P.sphere(0.05, PAL.gold, { at: [s * 0.72, 0.64, 1.47] }, 8)]),
    P.rbox(0.5, 0.14, 0.06, 0.06, TRIM, { at: [0, 0.62, 1.54] }),
    P.box(0.44, 0.025, 0.02, CHROME, { at: [0, 0.62, 1.575] }),
    P.rbox(W + 0.04, 0.16, 0.2, 0.07, '#D9DCE8', { at: [0, 0.42, 1.52] }),
    P.rbox(W + 0.04, 0.16, 0.2, 0.07, '#D9DCE8', { at: [0, 0.42, -1.62] }),
    P.box(0.36, 0.12, 0.02, PAL.cream, { at: [0, 0.42, 1.63] }),
    P.box(0.36, 0.12, 0.02, PAL.cream, { at: [0, 0.62, -1.62] }),
    // The tail lamps.
    ...[-1, 1].map((s) => P.rbox(0.2, 0.22, 0.04, 0.05, RED, { at: [s * 0.6, 0.82, -1.6] })),
    // Inside: the dashboard, the steering wheel (on the right) and the seats.
    P.box(W - 0.24, 0.14, 0.3, TRIM, { at: [0, BELT + 0.02, 0.6] }),
    P.torus(0.15, 0.025, PAL.ink, { at: [-0.36, BELT + 0.18, 0.42], rot: [-0.5, 0, 0] }),
    ...[-0.36, 0.36].map((x) => P.rbox(0.5, 0.6, 0.12, 0.05, SEAT, { at: [x, BELT + 0.02, -0.25] })),
    P.rbox(W - 0.26, 0.55, 0.12, 0.05, SEAT, { at: [0, BELT, -1.05] }),
  ]
  body.add(solid(merge(parts), bag, 2))
  // The windows all round (see-through: the driver shows).
  const glassParts = [
    P.box(W - 0.3, 0.66, 0.02, '#ffffff', { at: [0, BELT + 0.33, 0.52], rot: [-0.45, 0, 0] }),
    P.box(W - 0.3, 0.62, 0.02, '#ffffff', { at: [0, BELT + 0.31, -1.3], rot: [0.18, 0, 0] }),
    ...[-1, 1].map((s) => P.box(0.02, 0.64, 1.7, '#ffffff', { at: [s * (half - 0.12), BELT + 0.33, -0.42] })),
  ]
  body.add(new Mesh(bag.add(merge(glassParts)), glass))
  const lamps = bag.add(new MeshBasicMaterial({ color: LAMP }))
  for (const s of [-1, 1]) body.add(new Mesh(bag.add(P.sphere(0.13, '#ffffff', { at: [s * 0.5, 0.78, 1.53], scale: [1, 1, 0.45] }, 14)), lamps))
  const wheels = [[-1, WH.front], [1, WH.front], [-1, WH.rear], [1, WH.rear]].map(([s, z]) => {
    const w = wheel(WH.r, CHROME, bag, 6)
    w.position.set(s * (half - 0.14), WH.r, z)
    body.add(w)
    return w
  })
  // The driver on the right (Thailand keeps left), hands on the wheel.
  const seats = [sit(body, FOLK[(i + 2) % FOLK.length], [-0.36, BELT - 0.02, -0.12], 'bar', bag, 1)]
  return local(root, body, wheels, lamps, seats)
}

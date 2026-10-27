// The boat race's rivals (race.ts): the village kids from Koh Panyee in their sky-blue longtail (the buffalo kid at the
// tiller, the fox kid cheering in the front), and the cheeky macaque from the bay in a banana boat with a little
// outboard motor (he drops banana peels behind him). Their crews are the bay's own toy animals; each crew reacts to the
// race: a cheer when they pass her, a "whoa" when they spin out on a banana, a wave at the finish.
import { Group, Vector3, type BufferGeometry } from 'three'
import { buildAnimal } from '../../../../../engine3d/characters/animal'
import { FaceLife } from '../../../../../engine3d/characters/face'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import type { Feel } from '../../../trip/drive'
import { buildLongtail, type Longtail } from '../../../trip/vehicles/longtail'
import type { Vehicle } from '../../../trip/vehicles/vehicle'
import { buildMacaque, type Monkey } from '../bay/critters'
import { applyPose, clearPose } from '../bay/poses'
import { KIDS } from '../bay/village'

/** How every racing boat drives (trip/drive.ts): quicker and grippier than cruising the bay, and always full speed
 *  toward a finger held on the water (`near`/`far` are short: the target is always well ahead on the course). */
export const RACE_FEEL: Feel = { top: 16, boost: 1.6, accel: 9, coast: 0.5, turn: 2.1, grip: 3.2, near: 2, far: 9, dead: 0.04, lean: 0.22 }

export type CrewMood = 'race' | 'whoa' | 'cheer' | 'wave' | 'tease'

export interface Crew {
  /** Their toys' roots (to stand them on the podium). */
  roots: Group[]
  /** On the podium: no tiller, just cheering and waving. */
  onStage: boolean
  /** A short reaction on top of racing. */
  react(kind: Exclude<CrewMood, 'race'>, seconds?: number): void
  /** Where their tap target sits (world). */
  head(out: Vector3): Vector3
  update(dt: number, t: number, steer: number): void
}

// ---------------------------------------------------------------- the kids' longtail

export function buildKidsBoat(bag: Bag): { v: Longtail; crew: Crew } {
  const v = buildLongtail(bag, { hull: '#8EC9F5', hullDark: '#6FA9DA', inside: '#E3F2FF', stripe: PAL.butter, trim: '#FFFFFF' })
  v.setRibbons(['butter', 'mint', 'sky'])
  v.setGarland(true)
  // The buffalo kid steers standing at the back; the fox kid rides in the front.
  const driver = buildAnimal(KIDS[0], bag)
  const rider = buildAnimal(KIDS[1], bag)
  driver.root.position.set(v.seats.kaylee.x, v.seats.kaylee.y, v.seats.kaylee.z)
  rider.root.position.set(v.seats.nick.x, v.seats.nick.y - 0.1, v.seats.nick.z)
  rider.body.scale.set(1, 0.92, 1)
  v.body.add(driver.root, rider.root)
  const lives = [new FaceLife(driver, 'kids'), new FaceLife(rider, 'kids')]
  let mood: { kind: CrewMood; t: number; until: number } = { kind: 'race', t: 0, until: Infinity }
  return {
    v,
    crew: {
      roots: [driver.root, rider.root],
      onStage: false,
      react(kind, seconds = 1.6) {
        mood = { kind, t: 0, until: seconds }
      },
      head(out) {
        return rider.root.getWorldPosition(out).setY(out.y + 0.9)
      },
      update(dt, t, steer) {
        for (const l of lives) l.update(dt)
        mood.t += dt
        if (mood.t > mood.until) mood = { kind: 'race', t: 0, until: Infinity }
        if (this.onStage) {
          // Second place and happy about it: both cheer, then wave, taking turns.
          ;[driver, rider].forEach((rig, i) => {
            clearPose(rig)
            applyPose(rig, Math.sin(t * 0.8 + i * 2) > 0 || mood.kind === 'cheer' ? 'cheer' : 'wave', t + i, 1)
            rig.body.position.y = Math.abs(Math.sin(t * 6 + i)) * 0.08
          })
          return
        }
        // The driver's hands on the tiller (it swings with the steering), the rider's per the mood.
        const grip = new Vector3()
        v.grip(grip)
        driver.root.position.x += (grip.x * 0.55 - driver.root.position.x) * Math.min(1, dt * 10)
        clearPose(driver)
        applyPose(driver, 'tiller', t, 1)
        driver.body.rotation.z = -steer * 0.15
        clearPose(rider)
        rider.root.rotation.y = 0
        rider.root.position.y = v.seats.nick.y - 0.1 + Math.abs(Math.sin(t * 7)) * (mood.kind === 'cheer' ? 0.18 : 0.03)
        if (mood.kind === 'cheer' || mood.kind === 'wave') applyPose(rider, mood.kind, mood.t, Math.min(1, mood.t / 0.2))
        else if (mood.kind === 'tease') {
          // Turned round in the seat, pointing back at her: "Catch us!"
          rider.root.rotation.y = Math.PI * 0.85
          applyPose(rider, 'point', mood.t, Math.min(1, mood.t / 0.2))
        } else if (mood.kind === 'whoa') {
          applyPose(rider, 'cheer', mood.t, 1)
          rider.body.rotation.z = Math.sin(mood.t * 14) * 0.25
          driver.body.rotation.z = Math.sin(mood.t * 14 + 1) * 0.25
        }
      },
    },
  }
}

// ---------------------------------------------------------------- the macaque's banana boat

const BANANA = '#FFE15A'
const BANANA_DARK = '#F2C24C'
const TIP = '#8B6A4E'

export interface BananaBoat extends Vehicle {
  /** The outboard motor's tiller, where the macaque holds on (local to the body). */
  tiller: Vector3
}

/** A banana boat: a fat yellow banana curving up at both ends, brown tips, a cream seat, a little outboard motor and a
 *  pink pennant on a pole. */
export function buildBananaBoat(bag: Bag): BananaBoat {
  const root = new Group()
  const body = new Group()
  root.add(body)
  const hull: BufferGeometry[] = []
  const N = 10
  for (let i = 0; i <= N; i++) {
    const k = (i / N) * 2 - 1
    const z = k * 2.3
    const y = 0.25 + k * k * 0.62
    const r = 0.62 * (1 - 0.55 * k * k) + 0.1
    hull.push(P.sphere(r, i % 3 === 1 ? BANANA_DARK : BANANA, { at: [0, y, z], scale: [1.15, 0.8, 1] }, 12))
  }
  hull.push(
    P.sphere(0.16, TIP, { at: [0, 0.95, 2.32] }, 8),
    P.cyl(0.1, 0.14, 0.4, TIP, { at: [0, 0.98, -2.42], rot: [0.5, 0, 0] }, 8),
    // A cream seat across the middle, and a life ring hanging on its side.
    P.rbox(1.1, 0.16, 0.6, 0.06, '#FFF7F0', { at: [0, 0.68, 0.35] }),
    P.torus(0.26, 0.08, PAL.hotpink, { at: [0.78, 0.35, 0.8], rot: [0, Math.PI / 2, 0] }),
  )
  body.add(solid(merge(hull), bag, 2))
  // The motor: a grey box on the stern, its shaft down into the water, the propeller.
  const motor = new Group()
  motor.position.set(0, 0.85, -2.05)
  motor.add(
    solid(
      merge([
        P.rbox(0.42, 0.5, 0.5, 0.1, '#A3AAC4', { at: [0, 0.15, -0.1] }),
        P.rbox(0.3, 0.12, 0.3, 0.05, PAL.hotpink, { at: [0, 0.45, -0.1] }),
        P.cyl(0.05, 0.05, 1.3, '#5E5468', { at: [0, -0.5, -0.15] }, 6),
        // The tiller arm reaching forward to the driver.
        P.cyl(0.03, 0.03, 0.7, '#5E5468', { at: [0, 0.2, 0.35], rot: [Math.PI / 2, 0, 0] }, 6),
        P.capsule(0.045, 0.1, PAL.hotpink, { at: [0, 0.2, 0.72], rot: [Math.PI / 2, 0, 0] }),
      ]),
      bag,
      2,
    ),
  )
  const prop = new Group()
  prop.position.set(0, -1.1, -0.15)
  prop.add(solid(merge([P.box(0.42, 0.07, 0.05, PAL.gold), P.box(0.07, 0.42, 0.05, PAL.gold)]), bag, 1.5))
  motor.add(prop)
  body.add(motor)
  // A pennant on a pole at the back.
  const flag = new Group()
  flag.position.set(-0.35, 1.0, -1.7)
  flag.add(solid(merge([P.cyl(0.03, 0.03, 1.6, '#8C6A55', { at: [0, 0.8, 0] }, 4)]), bag, 1.5))
  const cloth = new Group()
  cloth.position.set(0, 1.45, 0)
  cloth.add(solid(merge([P.prism([[0, 0], [0, -0.45], [-0.9, -0.22]], 0.04, PAL.hotpink, { rot: [0, Math.PI / 2, 0] })]), bag, 1.5))
  flag.add(cloth)
  body.add(flag)
  let flutter = 0
  return {
    root,
    body,
    seats: { kaylee: { x: 0, y: 0.72, z: -1.25, stand: true }, ji: { x: 0, y: 0.76, z: 0.35 }, nick: { x: 0, y: 0.76, z: 1.1 } },
    hull: { at: [1.5, 0, -1.4], r: 0.72 },
    feel: RACE_FEEL,
    stern: -2.9,
    bow: 2.5,
    tiller: new Vector3(0, 1.05, -1.33),
    animate(steer, speed, t, dt) {
      motor.rotation.y += (-steer * 0.5 - motor.rotation.y) * Math.min(1, dt * 8)
      prop.rotation.z += dt * (8 + 60 * speed)
      motor.position.y = 0.85 + Math.sin(t * 55) * 0.008 * (0.5 + 2 * speed)
      flutter += dt * (4 + 12 * speed)
      cloth.rotation.y = Math.sin(flutter) * (0.2 + 0.25 * speed) - 0.15 * speed
    },
  }
}

/** The macaque at the motor: one hand on the tiller, the other free to wave, cheer or toss a banana peel. */
export function buildMonkeyCrew(v: BananaBoat, bag: Bag): Crew & { monkey: Monkey; toss(): void } {
  const monkey = buildMacaque(bag)
  monkey.root.scale.setScalar(1.75)
  monkey.root.position.set(0, v.seats.kaylee.y - 0.05, v.seats.kaylee.z - 0.15)
  v.body.add(monkey.root)
  let mood: { kind: CrewMood; t: number; until: number } = { kind: 'race', t: 0, until: Infinity }
  let toss = -1
  return {
    monkey,
    roots: [monkey.root],
    onStage: false,
    toss() {
      toss = 0
    },
    react(kind, seconds = 1.6) {
      mood = { kind, t: 0, until: seconds }
    },
    head(out) {
      return monkey.root.getWorldPosition(out).setY(out.y + 1.1)
    },
    update(dt, t, steer) {
      monkey.blink.update(dt)
      mood.t += dt
      if (mood.t > mood.until) mood = { kind: 'race', t: 0, until: Infinity }
      const { body, armL, armR } = monkey
      if (this.onStage) {
        // Third, and clapping anyway (a somersault now and then is the reaction to a tap).
        body.rotation.set(0, 0, 0)
        const clap = Math.sin(t * 14) * 0.35
        armL.rotation.set(-1.3, 0, -0.5 + clap)
        armR.rotation.set(-1.3, 0, 0.5 - clap)
        body.position.y = Math.abs(Math.sin(t * 5)) * 0.05
        if (mood.kind === 'cheer' || mood.kind === 'wave') {
          body.rotation.x = -Math.PI * 2 * Math.min(1, mood.t / 0.7)
          body.position.y = Math.sin(Math.min(1, mood.t / 0.7) * Math.PI) * 0.5
        }
        return
      }
      // Hunched forward, racing; a little bounce with the waves.
      body.rotation.x = 0.18
      body.rotation.z = -steer * 0.2
      body.position.y = Math.abs(Math.sin(t * 8)) * 0.02
      armR.rotation.set(-1.1, 0, 0.1)
      armL.rotation.set(-0.3, 0, -0.2)
      if (toss >= 0) {
        // Over the shoulder: a peel flies off the back.
        toss += dt / 0.5
        armL.rotation.set(-0.3 - Math.sin(Math.min(1, toss) * Math.PI) * 2.6, 0, -0.4)
        if (toss >= 1) toss = -1
      } else if (mood.kind === 'cheer' || mood.kind === 'wave') {
        armL.rotation.set(0, 0, -2.3 + Math.sin(mood.t * 12) * 0.4)
        body.position.y = Math.abs(Math.sin(mood.t * 10)) * 0.08
      } else if (mood.kind === 'tease') {
        // Turns round and wiggles his ears at her.
        body.rotation.y = Math.PI * 0.7
        armL.rotation.set(0, 0, -2 + Math.sin(mood.t * 16) * 0.3)
      } else if (mood.kind === 'whoa') {
        armL.rotation.set(0, 0, -2.2)
        armR.rotation.set(0, 0, 2.2)
        body.rotation.z = Math.sin(mood.t * 16) * 0.3
      }
      if (mood.kind !== 'tease') body.rotation.y *= 1 - Math.min(1, dt * 6)
    },
  }
}


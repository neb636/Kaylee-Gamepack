// The rivals as toy animals on the chibi rig (the look step; greybox 1 had blocks): Grandma Taeng the tortoise, Pao the
// hornbill postman and Moon the sun bear (rivals.ts RIVAL_LOOKS), built by the shared rig (engine3d/characters/animal.ts)
// with their faces' small life (they blink; their mouths will move with their voices in the full loop).
// In a kart they sit low in the seat with both hands on the wheel, lean into the bends and look where they're going;
// standing (the podium) their arms rest at their sides. Either way they hop when tapped or bumped and wave when they
// win. Grandma Taeng naps at the wheel on the grid (her head drops, her eyes close, she sways). A bee buzzes round Moon
// the whole time and now and then she swats at it.
import { Group, type Object3D } from 'three'
import { bell, clamp } from '../../../../../../sdk'
import { buildAnimal, type Rig } from '../../../../../engine3d/characters/animal'
import { FaceLife } from '../../../../../engine3d/characters/face'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { RIVAL_LOOKS, RIVALS, type RivalId } from './rivals'

export interface Rider {
  root: Group
  /** The head's pivot (at the neck). */
  head: Object3D
  rig: Rig
  /** A hop (0 = none, counting down from 1), a wave (seconds left). */
  hop: number
  wave: number
  /** Asleep at the wheel (Grandma Taeng on the grid): her head nods. */
  nap: boolean
  /** Sitting in a kart (hands on the wheel), or standing (the podium). */
  sit: boolean
  update(dt: number, t: number, lean: number): void
  react(kind: 'hop' | 'wave', seconds?: number): void
}

/** How far a rider sinks into the seat (times their height): their bottom on the cushion. */
const SINK = 0.12

/** Moon's bee: a round gold body with black stripes and two white wings that flap. */
function buildBee(bag: Bag) {
  const g = new Group()
  g.add(solid(merge([P.sphere(0.08, PAL.gold, { scale: [1, 0.9, 1.3] }, 10), P.box(0.165, 0.05, 0.035, PAL.ink, { at: [0, 0, -0.02] }), P.box(0.165, 0.05, 0.035, PAL.ink, { at: [0, 0, -0.07] })]), bag, 1))
  const wings = new Group()
  wings.position.y = 0.06
  wings.add(solid(merge([P.sphere(0.06, '#FFFFFF', { at: [0.06, 0, 0], scale: [1, 0.35, 1.5] }, 8), P.sphere(0.06, '#FFFFFF', { at: [-0.06, 0, 0], scale: [1, 0.35, 1.5] }, 8)]), bag, 1))
  g.add(wings)
  return { g, wings }
}

export function buildRider(bag: Bag, id: RivalId): Rider {
  const rig = buildAnimal(RIVAL_LOOKS[id], bag)
  const H = rig.height
  const life = new FaceLife(rig, id)
  const root = new Group()
  root.add(rig.root)
  // (The kart has its own shadow.)
  rig.root.children[0].visible = false
  const sway = RIVALS[id].lane
  const bee = id === 'moon' ? buildBee(bag) : null
  if (bee) root.add(bee.g)
  let swat = -1
  let nextSwat = 3 + Math.random() * 3
  let napK = 0

  const rider: Rider = {
    root,
    head: rig.head,
    rig,
    hop: 0,
    wave: 0,
    nap: false,
    sit: true,
    react(kind, seconds = 1.4) {
      if (kind === 'hop') rider.hop = 1
      else rider.wave = seconds
    },
    update(dt, t, lean) {
      const { body, head, armL, armR, eyes } = rig
      life.update(dt)
      rider.hop = Math.max(0, rider.hop - dt / 0.55)
      rider.wave = Math.max(0, rider.wave - dt)
      // A hop: crouch, up, land with a squash.
      const p = 1 - rider.hop
      const air = rider.hop > 0 ? bell(clamp((p - 0.15) / 0.7, 0, 1)) : 0
      const squash = rider.hop > 0 ? 1 - 0.12 * bell(clamp(p / 0.2, 0, 1)) - 0.08 * bell(clamp((p - 0.82) / 0.18, 0, 1)) + 0.08 * air : 1
      rig.root.position.y = (rider.sit ? -SINK * H : 0) + air * 0.4
      rig.root.children[0].visible = !rider.sit
      const breath = 1 + Math.sin(t * 2.6 + sway) * 0.018
      body.scale.set(1 / Math.sqrt(breath * squash), breath * squash, 1 / Math.sqrt(breath * squash))
      body.rotation.z = rider.sit ? lean * 0.28 : 0
      // Napping: the head drops and sways, the eyes close (and it eases back when she wakes).
      napK += ((rider.nap ? 1 : 0) - napK) * Math.min(1, dt * 5)
      head.rotation.x = napK * (0.5 + Math.sin(t * 1.3) * 0.08) + (1 - napK) * Math.sin(t * 1.7 + sway) * 0.04
      head.rotation.z = Math.sin(t * 2.1 + sway) * 0.05 * (1 - napK) - lean * 0.22 + napK * Math.sin(t * 0.65) * 0.12
      // Looking into the bend.
      head.rotation.y = rider.sit ? -lean * 0.35 : 0
      if (napK > 0.05) eyes.scale.y = Math.min(eyes.scale.y, 1 - 0.88 * napK)
      // The arms: both hands on the wheel in the kart (the wheel turns them a little), down at the sides standing; the
      // right one up and waving when they wave.
      const ease = Math.min(1, dt * 10)
      const set = (g: Group, x: number, z: number) => {
        g.rotation.x += (x - g.rotation.x) * ease
        g.rotation.z += (z - g.rotation.z) * ease
      }
      if (rider.sit) set(armL, -1.15 - lean * 0.15, 0.32)
      else set(armL, 0, -0.12)
      if (rider.wave > 0) set(armR, -0.2, 2.5 + Math.sin(t * 12) * 0.35)
      else if (rider.sit) set(armR, -1.15 + lean * 0.15, -0.32)
      else set(armR, 0, 0.12)
      // Moon's bee loops round her head; now and then she swats at it (her left paw flaps up).
      if (bee) {
        const a = t * 2.3
        const r = 0.55 + Math.sin(t * 1.7) * 0.12
        bee.g.position.set(Math.cos(a) * r, H * 0.95 + Math.sin(t * 3.1) * 0.15 + (rider.sit ? -SINK * H : 0), Math.sin(a) * r * 0.8)
        bee.g.rotation.y = -a
        bee.wings.scale.y = 0.4 + Math.abs(Math.sin(t * 60)) * 0.6
        nextSwat -= dt
        if (nextSwat <= 0 && swat < 0 && rider.wave <= 0) {
          swat = 0
          nextSwat = 4 + Math.random() * 4
        }
        if (swat >= 0) {
          swat += dt / 0.6
          const k = bell(Math.min(1, swat))
          armL.rotation.z = armL.rotation.z * (1 - k) + (-2.2 + Math.sin(swat * 20) * 0.3) * k
          armL.rotation.x = armL.rotation.x * (1 - k) - 0.3 * k
          if (swat >= 1) swat = -1
        }
      }
    },
  }
  return rider
}

// The animals Nari passes on her ride (ride.ts): a walrus, belugas, a seal, an orca and puffins. Toy shapes with ink
// outlines (engine3d/geo.ts), each one alive on its own (breathing, bobbing, looking about) and with one big reaction
// when it is poked. Noses point to +z; the origin is where it rests (the ice it lies on, or the waterline).
import { Group } from 'three'
import { bell } from '../../../../../sdk'
import type { Bag } from '../../../../engine3d/dispose'
import { P, solidMix } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'

export type CritterKind = 'walrus' | 'beluga' | 'seal' | 'orca' | 'puffin'

/** How tall each one's tap target is (m). */
const HEIGHT: Record<CritterKind, number> = { walrus: 1.5, beluga: 1.2, seal: 0.9, orca: 2, puffin: 0.6 }

const eyes = (x: number, y: number, z: number, r = 0.07) => [-1, 1].flatMap((side) => [P.sphere(r, PAL.ink, { at: [side * x, y, z] }, 8), P.sphere(r * 0.38, '#FFFFFF', { at: [side * x * 0.94, y + r * 0.45, z + r * 0.7] }, 6)])

function build(kind: CritterKind, bag: Bag) {
  if (kind === 'walrus') {
    const fur = '#B98562'
    const parts = [
      P.sphere(0.85, fur, { at: [0, 0.6, -0.2], scale: [1.05, 0.78, 1.5] }, 16),
      P.sphere(0.52, fur, { at: [0, 1.05, 0.85] }, 14),
      // The whiskery muzzle and the two long tusks.
      ...[-1, 1].map((side) => P.sphere(0.24, '#E3B592', { at: [side * 0.2, 0.9, 1.26], scale: [1, 0.85, 0.8] }, 10)),
      ...[-1, 1].map((side) => P.cone(0.07, 0.62, '#FFFDF2', { at: [side * 0.2, 0.52, 1.28], rot: [Math.PI + 0.12, 0, 0] }, 8)),
      ...[-1, 1].map((side) => P.sphere(0.34, '#A67352', { at: [side * 0.8, 0.14, 0.5], scale: [1, 0.22, 0.7], rot: [0, side * 0.5, 0] }, 10)),
      P.sphere(0.4, '#A67352', { at: [0, 0.16, -1.5], scale: [1.3, 0.25, 0.8] }, 10),
    ]
    const plain = [...eyes(0.24, 1.2, 1.24, 0.065), P.sphere(0.07, PAL.ink, { at: [0, 1.0, 1.44], scale: [1.4, 0.8, 1] }, 8)]
    return solidMix(parts, plain, bag, 2.5)
  }
  if (kind === 'beluga') {
    const skin = '#FCFDFF'
    const parts = [
      P.sphere(0.62, skin, { scale: [0.85, 0.8, 1.9] }, 16),
      // The round "melon" on its forehead, and a little beak of a mouth.
      P.sphere(0.36, skin, { at: [0, 0.22, 0.92] }, 12),
      P.sphere(0.2, skin, { at: [0, -0.02, 1.22], scale: [1.1, 0.6, 1] }, 10),
      ...[-1, 1].map((side) => P.sphere(0.26, '#E9F1FB', { at: [side * 0.56, -0.2, 0.4], scale: [1, 0.18, 0.6] }, 10)),
      P.sphere(0.22, skin, { at: [0, 0, -1.2], scale: [0.7, 0.6, 1.4] }, 10),
      ...[-1, 1].map((side) => P.sphere(0.28, '#E9F1FB', { at: [side * 0.26, 0, -1.6], scale: [1, 0.16, 0.6], rot: [0, side * 0.5, 0] }, 10)),
    ]
    const plain = [...eyes(0.34, 0.08, 1.05, 0.06), ...[-1, 1].map((side) => P.sphere(0.08, '#FFB3CF', { at: [side * 0.4, -0.08, 0.98], scale: [1, 0.6, 0.5] }, 8))]
    return solidMix(parts, plain, bag, 2.5)
  }
  if (kind === 'seal') {
    const fur = '#AEB6CB'
    const parts = [
      P.sphere(0.42, fur, { at: [0, 0.34, -0.1], scale: [1, 0.8, 1.9] }, 14),
      P.sphere(0.3, fur, { at: [0, 0.62, 0.62] }, 12),
      P.sphere(0.15, '#D6DCEA', { at: [0, 0.56, 0.86], scale: [1.3, 0.8, 0.8] }, 10),
      ...[-1, 1].map((side) => P.sphere(0.2, '#959DB5', { at: [side * 0.42, 0.1, 0.3], scale: [1, 0.2, 0.6], rot: [0, side * 0.5, 0] }, 8)),
      ...[-1, 1].map((side) => P.sphere(0.2, '#959DB5', { at: [side * 0.14, 0.14, -0.95], scale: [0.6, 0.2, 1], rot: [0, side * 0.4, 0] }, 8)),
    ]
    const plain = [...eyes(0.14, 0.7, 0.86, 0.05), P.sphere(0.045, PAL.ink, { at: [0, 0.6, 0.99] }, 6), ...[0, 1, 2, 3, 4].map((i) => P.sphere(0.05, '#8E96AE', { at: [Math.sin(i * 2.2) * 0.26, 0.62 + (i % 2) * 0.04, -0.3 + i * 0.12], scale: [1, 0.3, 1] }, 6))]
    return solidMix(parts, plain, bag, 2.5)
  }
  if (kind === 'orca') {
    const black = '#2F3146'
    const parts = [
      P.sphere(0.95, black, { at: [0, -0.5, 0], scale: [0.85, 0.78, 2.1] }, 16),
      // The tall fin, all that shows until it comes up.
      P.cone(0.5, 1.7, black, { at: [0, 0.85, -0.25], scale: [0.22, 1, 1], rot: [-0.12, 0, 0] }, 8),
      P.sphere(0.3, black, { at: [0, -0.5, -2.1], scale: [0.7, 0.6, 1.5] }, 10),
      ...[-1, 1].map((side) => P.sphere(0.4, black, { at: [side * 0.36, -0.5, -2.7], scale: [1, 0.16, 0.6], rot: [0, side * 0.5, 0] }, 10)),
    ]
    const plain = [
      P.sphere(0.8, '#FFFFFF', { at: [0, -0.74, 0.5], scale: [0.8, 0.6, 1.6] }, 12),
      ...[-1, 1].map((side) => P.sphere(0.2, '#FFFFFF', { at: [side * 0.62, -0.2, 1.3], scale: [0.4, 0.6, 1.3] }, 8)),
      ...eyes(0.66, -0.36, 1.52, 0.06),
    ]
    return solidMix(parts, plain, bag, 2.5)
  }
  // A puffin: black back, white tummy and face, a big bright beak, orange feet.
  const parts = [
    P.sphere(0.2, '#2F3146', { at: [0, 0.26, -0.03], scale: [1, 1.25, 1] }, 12),
    P.sphere(0.16, '#2F3146', { at: [0, 0.52, 0.02] }, 12),
    P.cone(0.09, 0.2, '#FF7A3C', { at: [0, 0.5, 0.2], rot: [Math.PI / 2, 0, 0], scale: [0.6, 1, 1.25] }, 8),
    ...[-1, 1].map((side) => P.sphere(0.07, '#FF7A3C', { at: [side * 0.08, 0.02, 0.06], scale: [1, 0.3, 1.5] }, 6)),
  ]
  const plain = [
    P.sphere(0.17, '#FFFFFF', { at: [0, 0.24, 0.06], scale: [0.85, 1.15, 0.85] }, 10),
    ...[-1, 1].map((side) => P.sphere(0.09, '#FFFFFF', { at: [side * 0.09, 0.53, 0.09], scale: [0.7, 1, 0.7] }, 8)),
    ...eyes(0.1, 0.56, 0.15, 0.03),
    P.sphere(0.05, PAL.gold, { at: [0, 0.5, 0.13], scale: [1.5, 1.7, 0.6] }, 6),
  ]
  return solidMix(parts, plain, bag, 2)
}

export class Critter {
  /** Where it is and which way it faces (the world places it). */
  readonly root = new Group()
  private body = new Group()
  private phase = Math.random() * 6
  private pokeT = -1
  readonly height: number
  /** An orca stays under until it's poked; a beluga porpoises. `up` 0..1 lifts it out of the water. */
  up = 0

  constructor(readonly kind: CritterKind, bag: Bag, size = 1) {
    this.body.add(build(kind, bag))
    this.body.scale.setScalar(size)
    this.root.add(this.body)
    this.height = HEIGHT[kind] * size
  }

  get busy() {
    return this.pokeT >= 0
  }
  poke() {
    this.pokeT = 0
  }

  update(dt: number, t: number) {
    if (this.pokeT >= 0 && (this.pokeT += dt / (this.kind === 'orca' ? 2.2 : 1.1)) >= 1) this.pokeT = -1
    const k = this.pokeT >= 0 ? bell(this.pokeT) : 0
    const b = this.body
    const a = t + this.phase
    switch (this.kind) {
      case 'walrus':
        // Breathing, a slow look about; poked: he rears up and wobbles his tusks.
        b.scale.y = b.scale.x * (1 + 0.03 * Math.sin(a * 1.6))
        b.rotation.set(-0.45 * k, 0.12 * Math.sin(a * 0.5), 0.14 * k * Math.sin(a * 16))
        b.position.y = 0.25 * k
        break
      case 'seal':
        b.rotation.set(-0.4 * k, 0.2 * Math.sin(a * 0.6), 0.25 * k * Math.sin(a * 18))
        b.position.y = 0.12 * k
        break
      case 'beluga':
        // Porpoising along; poked: a happy spin out of the water.
        b.position.y = -0.25 + 0.3 * Math.sin(a * 1.4) + this.up * 0.3 + k * 1.3
        b.rotation.set(-0.3 * Math.cos(a * 1.4) - 0.5 * k, 0, this.pokeT >= 0 ? this.pokeT * Math.PI * 2 : 0.1 * Math.sin(a))
        break
      case 'orca':
        // Only the fin shows; poked, it rises to say hello and sinks again.
        b.position.y = 0.1 * Math.sin(a) + k * 1.25
        b.rotation.set(-0.22 * k, 0, 0.05 * Math.sin(a * 0.8))
        break
      case 'puffin':
        // A waddle on the spot; poked: a flappy hop and a spin.
        b.position.y = Math.abs(Math.sin(a * 2.2)) * 0.03 + k * 0.9
        b.rotation.set(0, (this.pokeT >= 0 ? this.pokeT * Math.PI * 2 : 0) + 0.3 * Math.sin(a * 0.7), 0.1 * Math.sin(a * 2.2) + 0.5 * k * Math.sin(a * 30))
        break
    }
  }
}

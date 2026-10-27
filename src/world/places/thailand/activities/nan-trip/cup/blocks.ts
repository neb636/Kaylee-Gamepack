// The rivals as blocks (greybox 1: placeholders in the final toon look, for the chibi rig in the look step): a rounded
// body and a big head in the rival's color with dot eyes, and one thing that says who it is (Grandma Taeng's shell and
// little parasol, Pao's beak and mailbag, Moon's round ears and the cream moon on her chest). They sit in their karts,
// lean into the bends, hop when they're tapped or bounce, and wave when they win.
import { Group, type BufferGeometry } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import type { RivalId } from './rivals'
import { RIVALS } from './rivals'

export interface Block {
  root: Group
  head: Group
  /** Arm up in a wave (the right one). */
  arm: Group
  /** A hop (0 = none, counting down from 1), a wave (seconds left). */
  hop: number
  wave: number
  /** Asleep at the wheel (Grandma Taeng on the grid): her head nods. */
  nap: boolean
  update(dt: number, t: number, lean: number): void
  react(kind: 'hop' | 'wave', seconds?: number): void
}

export function buildBlock(bag: Bag, id: RivalId): Block {
  const r = RIVALS[id]
  const c = r.color
  const root = new Group()
  const torso: BufferGeometry[] = [P.rbox(0.62, 0.62, 0.5, 0.16, c, { at: [0, 0.31, 0] })]
  const face: BufferGeometry[] = [P.rbox(0.72, 0.62, 0.62, 0.2, c, { at: [0, 0.3, 0] })]
  // Dot eyes with shines, a little blush.
  for (const x of [-0.15, 0.15]) {
    face.push(P.sphere(0.06, PAL.ink, { at: [x, 0.36, 0.31] }, 8), P.sphere(0.022, '#FFFFFF', { at: [x + 0.02, 0.39, 0.36] }, 6), P.sphere(0.05, PAL.pink, { at: [x * 1.55, 0.24, 0.3], scale: [1, 0.6, 0.4] }, 8))
  }
  if (id === 'taeng') {
    // A green shell on her back, a little parasol over her.
    torso.push(P.sphere(0.42, '#5E9A6C', { at: [0, 0.4, -0.26], scale: [1, 0.9, 0.6] }, 12))
    face.push(P.cyl(0.015, 0.015, 0.9, PAL.ink, { at: [0.3, 0.75, -0.1] }, 5), P.cone(0.42, 0.18, PAL.pink, { at: [0.3, 1.2, -0.1] }, 12))
  } else if (id === 'pao') {
    // A big orange beak, a mailbag on his side.
    face.push(P.cone(0.13, 0.42, '#FF9A3C', { at: [0, 0.3, 0.5], rot: [Math.PI / 2, 0, 0] }, 10), P.rbox(0.44, 0.2, 0.08, 0.05, '#FFE07A', { at: [0, 0.5, 0.36] }))
    torso.push(P.rbox(0.18, 0.34, 0.4, 0.06, '#C9875C', { at: [0.4, 0.3, 0] }))
  } else {
    // Round ears and a cream moon on her chest.
    face.push(P.sphere(0.14, c, { at: [-0.3, 0.62, 0] }, 10), P.sphere(0.14, c, { at: [0.3, 0.62, 0] }, 10), P.sphere(0.13, '#F6E3C8', { at: [0, 0.18, 0.32], scale: [1.2, 0.8, 0.5] }, 10))
    torso.push(P.sphere(0.16, '#F6E3C8', { at: [0, 0.42, 0.24], scale: [1.3, 0.7, 0.4] }, 10))
  }
  const body = solid(merge(torso), bag, 2)
  root.add(body)
  const head = new Group()
  head.position.y = 0.6
  head.add(solid(merge(face), bag, 2))
  root.add(head)
  const arm = new Group()
  arm.position.set(-0.36, 0.5, 0)
  arm.add(solid(merge([P.capsule(0.08, 0.3, c, { at: [0, 0.2, 0] })]), bag, 2))
  arm.rotation.z = -2.4
  root.add(arm)

  const block: Block = {
    root,
    head,
    arm,
    hop: 0,
    wave: 0,
    nap: false,
    react(kind, seconds = 1.4) {
      if (kind === 'hop') block.hop = 1
      else block.wave = seconds
    },
    update(dt, t, lean) {
      block.hop = Math.max(0, block.hop - dt / 0.55)
      block.wave = Math.max(0, block.wave - dt)
      const h = block.hop > 0 ? Math.sin((1 - block.hop) * Math.PI) : 0
      root.position.y = h * 0.45
      root.scale.set(1 + h * -0.06, 1 + h * 0.12, 1 + h * -0.06)
      root.rotation.z = lean * 0.25
      head.rotation.z = Math.sin(t * 2.1 + r.lane) * 0.05 - lean * 0.2
      const nod = block.nap ? 0.45 + Math.sin(t * 1.3) * 0.08 : Math.sin(t * 1.7) * 0.04
      head.rotation.x += (nod - head.rotation.x) * Math.min(1, dt * 6)
      // Waving: the arm up and swinging; otherwise on the wheel.
      const want = block.wave > 0 ? -2.6 + Math.sin(t * 12) * 0.35 : -0.9
      arm.rotation.z += (want - arm.rotation.z) * Math.min(1, dt * 10)
      arm.rotation.x = block.wave > 0 ? 0 : -1.1
    },
  }
  return block
}

// HarborLand's grip socks (a must for everyone there): the three colors she can pick at the counter, and Kaylee wearing
// them, in the hall and in the playground. (No three.js imports of its own: it uses the engine's shapes.)
import type { Group } from 'three'
import type { Rig } from '../../characters/animal'
import type { Dress } from '../../characters/avatar'
import type { Bag } from '../../engine/dispose'
import { merge, P, solid } from '../../engine/geo'

export const SOCK_COLORS: Record<string, string> = { pink: '#FF8FB8', lavender: '#C9B5F7', mint: '#8FE3C8' }

/** A sock over each foot, a band round each ankle (returned, so the counter can swap them for another pair). The
 *  code-built Kaylee's go on her body; the vinyl toy's go on her legs (so they follow them when she sits), sized to
 *  her hooves (kaylee.glb: x 0.02-0.153, z -0.03-0.146 below y 0.08, around a hip pivot at (±0.072, 0.16, 0.03)). */
export function wearSocks(kaylee: { rig: Rig; height: number; dress?: Pick<Dress, 'claim'> }, color: string, bag: Bag): Group[] {
  const { rig, height: H } = kaylee
  // The socks take her feet: her own shoes are in the cubby at the counter (arrive.ts), so they just aren't on her.
  kaylee.dress?.claim('socks', ['feet'], true)
  if (rig.legL && rig.legR) {
    return ([[rig.legL, -1], [rig.legR, 1]] as const).map(([leg, s]) => {
      const sock = solid(merge([P.sphere(0.075, color, { at: [s * 0.015, -0.12, 0.027], scale: [1, 0.66, 1.3] }), P.cyl(0.066, 0.066, 0.04, '#FFFFFF', { at: [s * 0.006, -0.06, 0.01], scale: [1, 1, 1.08] })]), bag, 1.5)
      leg.add(sock)
      return sock
    })
  }
  const socks = solid(merge([-1, 1].flatMap((s) => [P.sphere(0.083 * H, color, { at: [s * 0.085 * H, 0.036 * H, 0.022 * H], scale: [1, 0.66, 1.32] }), P.cyl(0.074 * H, 0.074 * H, 0.04 * H, '#FFFFFF', { at: [s * 0.085 * H, 0.085 * H, 0] })])), bag, 1.5)
  rig.body.add(socks)
  return [socks]
}

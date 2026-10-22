// HarborLand's grip socks (a must for everyone there): the three colors she can pick at the counter, and Kaylee wearing
// them, in the hall and in the playground. (No three.js imports of its own: it uses the engine's shapes.)
import type { Avatar } from '../../characters/avatar'
import type { Bag } from '../../engine/dispose'
import { merge, P, solid } from '../../engine/geo'

export const SOCK_COLORS: Record<string, string> = { pink: '#FF8FB8', lavender: '#C9B5F7', mint: '#8FE3C8' }

/** A sock over each foot, a band round each ankle (returned, so the counter can swap them for another pair). */
export function wearSocks(kaylee: Avatar, color: string, bag: Bag) {
  const H = kaylee.height
  const socks = solid(merge([-1, 1].flatMap((s) => [P.sphere(0.083 * H, color, { at: [s * 0.085 * H, 0.036 * H, 0.022 * H], scale: [1, 0.66, 1.32] }), P.cyl(0.074 * H, 0.074 * H, 0.04 * H, '#FFFFFF', { at: [s * 0.085 * H, 0.085 * H, 0] })])), bag, 1.5)
  kaylee.rig.body.add(socks)
  return socks
}

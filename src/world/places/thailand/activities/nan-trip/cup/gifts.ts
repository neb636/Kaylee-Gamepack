// The gifts on Kaylee's kart (plan: thailand/nan-cup.html, "Losing a race"): the rival who wins the race she loses gives
// her something that goes on her kart for the rest of the Cup. Greybox: simple shapes in the toon look.
// - Grandma Taeng's lucky pink ribbon: a big bow tied on the seat's back, its tails fluttering.
// - Pao's feather: a long orange feather with a white tip, stuck up behind the seat.
// - Moon's honey-pot sticker: a round gold honey pot on the kart's left side, with a brown lid and a shine.
// Each is its own group on the kart's body, so it can wiggle (a tap on her kart wiggles them; it flutters as she races).
import { Group, type BufferGeometry } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import type { Kart } from '../../../trip/vehicles/kart'
import type { RivalId } from './rivals'

/** The kart's wheel radius (it sits this high: trip/vehicles/kart.ts). */
const R = 0.3

export interface Gift {
  id: RivalId
  root: Group
}

/** Builds one gift (kart-body local). */
export function buildGift(id: RivalId, bag: Bag): Gift {
  const root = new Group()
  const parts: BufferGeometry[] = []
  if (id === 'taeng') {
    // On top of the seat's back: two loops, a knot and two tails.
    root.position.set(0, R + 0.78, -0.76)
    parts.push(
      P.sphere(0.16, PAL.hotpink, { at: [-0.17, 0, 0], scale: [1.2, 0.8, 0.45] }, 12),
      P.sphere(0.16, PAL.hotpink, { at: [0.17, 0, 0], scale: [1.2, 0.8, 0.45] }, 12),
      P.sphere(0.08, PAL.pink, { at: [0, 0, 0.02] }, 10),
      P.box(0.07, 0.3, 0.03, PAL.hotpink, { at: [-0.08, -0.18, -0.02], rot: [0, 0, 0.35] }),
      P.box(0.07, 0.3, 0.03, PAL.hotpink, { at: [0.08, -0.18, -0.02], rot: [0, 0, -0.35] }),
    )
  } else if (id === 'pao') {
    // Stuck up behind the seat, leaning back: a long orange vane on a quill, a white tip.
    root.position.set(0.24, R + 0.62, -0.84)
    root.rotation.x = -0.35
    parts.push(
      P.cyl(0.015, 0.02, 0.9, PAL.cream, { at: [0, 0.45, 0] }, 6),
      P.sphere(0.13, '#FF9A3C', { at: [0, 0.5, 0], scale: [0.6, 3.0, 0.2] }, 12),
      P.sphere(0.1, '#FFFFFF', { at: [0, 0.86, 0], scale: [0.6, 1.2, 0.22] }, 10),
    )
  } else {
    // On the left side panel: a round gold pot, its brown lid, a shine.
    root.position.set(-0.6, R + 0.22, -0.05)
    parts.push(
      P.cyl(0.17, 0.17, 0.03, PAL.gold, { rot: [0, 0, Math.PI / 2] }, 18),
      P.box(0.035, 0.07, 0.26, '#A86A3C', { at: [-0.005, 0.12, 0] }),
      P.sphere(0.045, '#FFFFFF', { at: [-0.02, 0.04, 0.06], scale: [0.4, 1, 1] }, 8),
    )
  }
  root.add(solid(merge(parts), bag, 1.5))
  return { id, root }
}

/** Puts the gifts on a kart (on its body, so they lean and bounce with it). */
export function giveGifts(kart: Kart, ids: readonly RivalId[], bag: Bag): Gift[] {
  return ids.map((id) => {
    const g = buildGift(id, bag)
    kart.body.add(g.root)
    return g
  })
}

/** The gifts flutter as she goes (`speed` 0..1) and wiggle after a tap (`wiggle` 1 → 0). */
export function animateGifts(gifts: Gift[], t: number, speed: number, wiggle: number) {
  for (const g of gifts) {
    const w = Math.sin(t * 22) * 0.35 * wiggle + Math.sin(t * (6 + speed * 14)) * 0.08 * speed
    if (g.id === 'taeng') g.root.rotation.z = w
    else if (g.id === 'pao') g.root.rotation.z = w * 1.4
    else g.root.scale.setScalar(1 + Math.abs(w) * 0.5)
  }
}

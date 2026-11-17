// Agong's take-away box from The Pizza Company (the one she filled at the table, pizza/share.ts): white with the green
// band and Agong the panda on the front, the two slices she saved inside. Coming home she carries it to him, and its
// lid opens (trip/legs/house-plugin.ts, a box trip's gift). Built facing +z, its lid hinged at the back.
import { Group } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../engine3d/geo'
import type { PizzaId } from './pizza/layout'

const TOPPING: Record<PizzaId, string> = { hawaiian: '#FFD24D', seafood: '#FF8F7A', cheese: '#FFE9A0' }

export function buildPizzaBox(bag: Bag, pizza: PizzaId) {
  const root = new Group()
  const w = 0.42
  const h = 0.09
  const t = 0.014
  root.add(solid(merge([
    P.box(w, t, w, '#FFFFFF', { at: [0, t / 2, 0] }),
    P.box(w, h, t, '#FFFFFF', { at: [0, h / 2, w / 2 - t / 2] }),
    P.box(w, h, t, '#FFFFFF', { at: [0, h / 2, -w / 2 + t / 2] }),
    P.box(t, h, w, '#FFFFFF', { at: [w / 2 - t / 2, h / 2, 0] }),
    P.box(t, h, w, '#FFFFFF', { at: [-w / 2 + t / 2, h / 2, 0] }),
    P.box(w + 0.002, 0.02, t + 0.004, '#4DB57A', { at: [0, h * 0.35, w / 2 - t / 2] }),
    // Agong (a panda) on the front.
    P.sphere(0.034, '#FFFFFF', { at: [0.11, h * 0.62, w / 2 + 0.004], scale: [1, 1, 0.3] }),
    ...[-1, 1].map((s) => P.sphere(0.013, '#4A3F4F', { at: [0.11 + s * 0.027, h * 0.62 + 0.029, w / 2 + 0.006], scale: [1, 1, 0.4] })),
    ...[-1, 1].map((s) => P.sphere(0.009, '#4A3F4F', { at: [0.11 + s * 0.012, h * 0.63, w / 2 + 0.014], scale: [1, 1.2, 0.4] })),
    // The two slices inside, side by side, with their toppings.
    ...[-1, 1].flatMap((s) => [
      P.prism([[0, 0.17], [-0.1, -0.13], [0.1, -0.13]], 0.025, '#E7A94B', { at: [s * 0.095, t + 0.014, 0], rot: [-Math.PI / 2, 0, s * 0.5] }),
      P.prism([[0, 0.14], [-0.08, -0.1], [0.08, -0.1]], 0.012, TOPPING[pizza], { at: [s * 0.095, t + 0.03, 0], rot: [-Math.PI / 2, 0, s * 0.5] }),
    ]),
  ]), bag, 1.5))
  const lid = new Group()
  lid.position.set(0, h, -w / 2)
  lid.add(solid(merge([P.box(w + 0.01, t, w + 0.01, '#FFFFFF', { at: [0, t / 2, w / 2] }), P.cyl(0.07, 0.07, 0.006, '#4DB57A', { at: [0, t + 0.004, w / 2] }, 20), P.box(w * 0.86, 0.004, w * 0.86, '#BFEBD2', { at: [0, -0.002, w / 2] })]), bag, 1.5))
  root.add(lid)
  return { root, lid }
}

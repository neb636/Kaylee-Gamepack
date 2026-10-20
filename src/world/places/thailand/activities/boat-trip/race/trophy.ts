// The boat race's payoff (race.ts): a big gold trophy with KAYLEE on its plaque, and the floating podium she stands on
// to lift it (1 in the middle and highest, the kids on 2, the macaque on 3), under a rainbow balloon arch. The trophy
// rides home in the longtail afterwards (bay/race-gate.ts puts it in the boat).
import { CanvasTexture, Group, LatheGeometry, Mesh, MeshBasicMaterial, PlaneGeometry, Vector2, Vector3, type BufferGeometry } from 'three'
import { KID_NAME } from '../../../../../../sdk'
import type { Bag } from '../../../engine/dispose'
import { merge, P, solid } from '../../../engine/geo'
import { makeHull } from '../../../engine/outline'
import { PAL, toon } from '../../../engine/toon'
import { RAINBOW } from './scenery'

const GOLD = '#FFC83D'
const GOLD_DARK = '#E5A21F'

/** Text on a little canvas (the plaque's name, the podium's numbers): crisp, never a generated picture. */
function label(bag: Bag, text: string, w: number, h: number, color: string, bg: string) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  g.fillStyle = bg
  g.fillRect(0, 0, w, h)
  g.fillStyle = color
  g.font = `bold ${Math.round(h * 0.62)}px Fredoka, sans-serif`
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(text, w / 2, h * 0.54)
  return bag.add(new CanvasTexture(c))
}

/** The trophy, `size` meters tall: a cup with two handles on a stem and a base, a star on top, a pink bow, and a
 *  plaque with her name. Its origin is at the bottom of the base. */
export function buildTrophy(bag: Bag, size = 0.8): Group {
  const g = new Group()
  const k = size / 0.8
  // The cup: turned like a vase (a lathe), gold.
  const profile = [
    [0.0, 0.42],
    [0.08, 0.42],
    [0.11, 0.46],
    [0.2, 0.52],
    [0.25, 0.62],
    [0.27, 0.72],
    [0.26, 0.74],
    [0.0, 0.74],
  ].map(([x, y]) => new Vector2(x * k, y * k))
  const cup = bag.add(new LatheGeometry(profile, 20))
  const cupMesh = new Mesh(cup, toon(GOLD))
  const cupHull = makeHull(cup, 2)
  bag.add(cupHull.geometry)
  g.add(cupMesh, cupHull)
  const parts: BufferGeometry[] = [
    // The base (two steps, pink and gold), the stem with a knob.
    P.rbox(0.42 * k, 0.1 * k, 0.42 * k, 0.03 * k, PAL.hotpink, { at: [0, 0.05 * k, 0] }),
    P.rbox(0.32 * k, 0.1 * k, 0.32 * k, 0.03 * k, GOLD_DARK, { at: [0, 0.15 * k, 0] }),
    P.cyl(0.05 * k, 0.08 * k, 0.24 * k, GOLD, { at: [0, 0.3 * k, 0] }, 12),
    P.sphere(0.08 * k, GOLD_DARK, { at: [0, 0.32 * k, 0] }, 10),
    // The handles, a ring on each side.
    ...[-1, 1].map((s) => P.torus(0.11 * k, 0.025 * k, GOLD, { at: [s * 0.27 * k, 0.6 * k, 0], rot: [0, 0, 0] }, Math.PI * 2)),
    // A star on top, and a pink bow on the front.
    P.prism(starPts(0.12 * k, 0.05 * k), 0.05 * k, GOLD, { at: [0, 0.9 * k, 0] }),
    ...[-1, 1].map((s) => P.sphere(0.06 * k, PAL.hotpink, { at: [s * 0.07 * k, 0.5 * k, 0.2 * k], scale: [1.3, 0.8, 0.6] }, 8)),
    P.sphere(0.035 * k, PAL.hotpink, { at: [0, 0.5 * k, 0.22 * k] }, 8),
  ]
  g.add(solid(merge(parts), bag, 2))
  // The plaque on the base's front: KAYLEE.
  const plaque = new Mesh(bag.add(new PlaneGeometry(0.3 * k, 0.075 * k)), bag.add(new MeshBasicMaterial({ map: label(bag, KID_NAME.toUpperCase(), 256, 64, PAL.hotpink, '#FFF4C8') })))
  plaque.position.set(0, 0.05 * k, 0.212 * k)
  g.add(plaque)
  return g
}

/** A five-pointed star outline (for prism). */
function starPts(outer: number, inner: number): [number, number][] {
  const pts: [number, number][] = []
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2
    const r = i % 2 ? inner : outer
    pts.push([Math.cos(a) * r, Math.sin(a) * r])
  }
  return pts
}

export interface Podium {
  root: Group
  /** Where each place stands (local to `root`, the top of its step), 1st first. */
  steps: Vector3[]
  /** Where the three boats tie up, along its sides (local). */
  docks: { x: number; z: number }[]
  update(t: number): void
}

/** The podium's floating stage. Local +x faces the course (where the camera looks from); the steps stand in a row
 *  along local z: 2nd on the left (seen from the course), 1st in the middle, 3rd on the right. */
export function buildPodium(bag: Bag): Podium {
  const root = new Group()
  const heights = [1.3, 0.9, 0.6]
  const along = [0, 2.1, -2.1]
  const colors = [GOLD, '#D9DDEA', '#E8A87C']
  const parts: BufferGeometry[] = [
    // The deck on its blue barrels, a pink carpet up to the steps.
    P.box(9, 0.45, 12, '#C9875C', { at: [-1, 0.3, 0] }),
    P.box(3.6, 0.04, 2.4, PAL.hotpink, { at: [2.2, 0.55, 0] }),
  ]
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) parts.push(P.cyl(0.5, 0.5, 1, '#5FA7E8', { at: [-1 + s * 3.9, 0.05, -5 + i * 2], rot: [Math.PI / 2, 0, 0] }, 10))
  heights.forEach((h, i) => parts.push(P.rbox(2, h, 2, 0.12, colors[i], { at: [0, 0.52 + h / 2, along[i]] })))
  // The rainbow balloon arch over the steps, balloon by balloon.
  for (let i = 0; i <= 22; i++) {
    const a = (i / 22) * Math.PI
    parts.push(P.sphere(0.42, RAINBOW[i % RAINBOW.length], { at: [-0.4, 0.6 + Math.sin(a) * 5.2, Math.cos(a) * 4.6] }, 10))
  }
  // Flower pots at the back corners (Mommy and Daddy stand at the front ends).
  for (const s of [-1, 1]) parts.push(P.cyl(0.4, 0.3, 0.6, '#FFC2A8', { at: [-4.6, 0.85, s * 5.2] }, 10), ...[0, 1, 2].map((k) => P.sphere(0.26, [PAL.hotpink, PAL.butter, PAL.lavenderDark][k], { at: [-4.6 + (k - 1) * 0.2, 1.3 + (k % 2) * 0.12, s * 5.2 + (k - 1) * 0.18] }, 8)))
  root.add(solid(merge(parts), bag, 2))
  // The numbers on the steps' fronts.
  heights.forEach((h, i) => {
    const n = new Mesh(bag.add(new PlaneGeometry(0.9, 0.9)), bag.add(new MeshBasicMaterial({ map: label(bag, String(i + 1), 64, 64, PAL.ink, colors[i]) })))
    n.position.set(1.01, 0.52 + h / 2, along[i])
    n.rotation.y = Math.PI / 2
    root.add(n)
  })
  // Two big balloons tied at the back corners, swaying.
  const balloons = [-1, 1].map((s) => {
    const b = new Group()
    b.position.set(-4.2, 0.6, s * 5.6)
    b.add(solid(merge([P.cyl(0.02, 0.02, 3.4, '#FFFFFF', { at: [0, 1.7, 0] }, 4), P.sphere(0.7, s < 0 ? PAL.hotpink : PAL.sky, { at: [0, 3.9, 0], scale: [1, 1.18, 1] }, 14)]), bag, 2))
    root.add(b)
    return b
  })
  return {
    root,
    steps: heights.map((h, i) => new Vector3(0, 0.52 + h, along[i])),
    docks: [
      { x: 1.5, z: -9.2 },
      { x: 1.5, z: 9.2 },
      { x: -4.5, z: 9.2 },
    ],
    update(t) {
      balloons.forEach((b, i) => {
        b.rotation.x = Math.sin(t * 1.3 + i * 2) * 0.08
        b.rotation.z = Math.cos(t * 1.1 + i) * 0.06
      })
    },
  }
}

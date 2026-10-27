// The family's longtail boat (เรือหางยาว, ruea hang yao): a long, narrow wooden boat with a bow that sweeps up into a
// tall prow, two benches, and at the back a car engine on a pivot with a long pole that reaches down into the water,
// the propeller at its end. Real longtails steer by swinging the whole engine and pole with a long tiller: Kaylee
// stands at the back holding it, and the tiller swings the other way to where the boat turns.
//
// Thai boats wear ribbons and a jasmine garland on the prow for the boat's spirit (Mae Ya Nang) and good luck: she ties
// three on at the pier (setRibbons, setGarland), and they stream back and flutter faster the faster she goes. What
// rides along (the football, the coconut, the duck's string) sits in `cargo`, at the CARGO spots.
import { Group, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'
import type { Feel } from '../../../../engine3d/drive'
import type { Vehicle } from './vehicle'

const WOOD = '#E6A375'
const WOOD_DARK = '#C9875C'
const WOOD_IN = '#F6D3AE'
const ENGINE = '#A3AAC4'
const ENGINE_DARK = '#7E86A6'
const POLE = '#5E5468'

/** Tuned by eye in the greybox (the ?debug panel edits it live). */
export const LONGTAIL_FEEL: Feel = { top: 9, boost: 1.75, accel: 5, coast: 0.42, turn: 1.35, grip: 2.2, near: 3, far: 26, dead: 0.2, lean: 0.16 }

/** The ribbon colors in the basket at the pier (the `ribbons` param uses these names). */
export const RIBBON_COLORS: Record<string, string> = {
  pink: PAL.pink,
  butter: PAL.butter,
  mint: PAL.mint,
  sky: PAL.sky,
  lavender: PAL.lavenderDark,
  hotpink: PAL.hotpink,
}

/** Where things ride in the boat (local to its body): the bow floor, beside Daddy, by Kaylee's feet, Mommy's lap, and
 *  the boat race's trophy up front. */
export const CARGO = {
  football: [0.12, 0.62, 2.05],
  coconut: [-0.3, 0.6, 1.75],
  mango: [0.42, 0.62, 1.25],
  bucket: [0.38, 0.5, -1.45],
  teddy: [0, 0.78, -0.22],
  trophy: [-0.28, 0.5, 2.3],
} satisfies Record<string, [number, number, number]>

const L = 6.4
/** The tip of the prow, where the ribbons and the garland are tied (local to the body). */
export const PROW = new Vector3(0, 1.66, L / 2 + 0.66)

export interface Longtail extends Vehicle {
  /** Ties these ribbon colors on the prow (names from RIBBON_COLORS), replacing what was there. */
  setRibbons(colors: string[]): void
  setGarland(on: boolean): void
  /** Things riding along (the football, the coconut, the teddy). */
  cargo: Group
  /** Where the tiller's handle is now (local to the body): Kaylee's hands follow it. */
  grip(out: Vector3): Vector3
}

/** Another family's longtail (the village kids' in the boat race): its hull, the stripe along the top and the trim
 *  under it. */
export interface LongtailPaint {
  hull: string
  hullDark: string
  inside: string
  stripe: string
  trim: string
}
const FAMILY_PAINT: LongtailPaint = { hull: WOOD, hullDark: WOOD_DARK, inside: WOOD_IN, stripe: PAL.hotpink, trim: PAL.butter }

export function buildLongtail(bag: Bag, paint: LongtailPaint = FAMILY_PAINT): Longtail {
  const root = new Group()
  const body = new Group()
  root.add(body)
  const parts = [
    // The hull: a long rounded tub, a pink stripe along the top, the inside lighter, a darker keel line.
    P.rbox(1.3, 0.55, L, 0.25, paint.hull, { at: [0, 0.2, 0] }),
    P.box(1.36, 0.1, L - 0.6, paint.stripe, { at: [0, 0.43, -0.1] }),
    P.box(1.34, 0.05, L - 0.8, paint.trim, { at: [0, 0.33, -0.1] }),
    P.box(1.1, 0.06, L - 1.2, paint.inside, { at: [0, 0.46, -0.2] }),
    // Planks along the inside floor.
    ...[-0.32, 0, 0.32].map((x) => P.box(0.04, 0.02, L - 1.6, paint.hullDark, { at: [x, 0.495, -0.2] })),
    // The bow sweeps up into a tall prow.
    P.rbox(0.9, 0.4, 1.3, 0.18, paint.hull, { at: [0, 0.48, L / 2 - 0.25], rot: [-0.45, 0, 0] }),
    P.rbox(0.42, 0.34, 1.1, 0.15, paint.hull, { at: [0, 0.92, L / 2 + 0.25], rot: [-0.9, 0, 0] }),
    P.cyl(0.07, 0.09, 0.7, paint.hull, { at: [0, 1.32, L / 2 + 0.55], rot: [-0.35, 0, 0] }),
    P.sphere(0.1, PAL.gold, { at: [PROW.x, PROW.y, PROW.z] }),
    // Two benches.
    ...[0.9, -0.5].map((z) => P.box(1.2, 0.08, 0.36, paint.inside, { at: [0, 0.5, z] })),
    // The engine's post at the stern.
    P.cyl(0.09, 0.12, 0.5, POLE, { at: [0, 0.62, -L / 2 + 0.35] }),
  ]
  body.add(solid(merge(parts), bag, 2))

  // The tail: the engine on its pivot, the long tiller forward to Kaylee's hands, the long pole back into the water and
  // the propeller, all swinging together round the post.
  const tail = new Group()
  tail.position.set(0, 0.9, -L / 2 + 0.35)
  const handle = new Vector3(0, 0.08, 1.12)
  tail.add(
    solid(
      merge([
        // The engine: a block with a flywheel on its side, an exhaust pipe and a little fuel tank.
        P.rbox(0.52, 0.44, 0.72, 0.1, ENGINE, { at: [0, 0.12, -0.05] }),
        P.cyl(0.17, 0.17, 0.08, ENGINE_DARK, { at: [0.3, 0.1, -0.05], rot: [0, 0, Math.PI / 2] }),
        P.cyl(0.04, 0.04, 0.38, PAL.ink, { at: [-0.14, 0.48, -0.2], rot: [-0.25, 0, 0] }),
        P.rbox(0.3, 0.16, 0.3, 0.06, PAL.hotpink, { at: [0, 0.4, 0.12] }),
        // The tiller, reaching forward, with a pink grip at its end.
        P.cyl(0.035, 0.035, 1.1, POLE, { at: [0, 0.06, 0.6], rot: [Math.PI / 2 - 0.03, 0, 0] }),
        P.capsule(0.05, 0.14, PAL.hotpink, { at: [handle.x, handle.y, handle.z], rot: [Math.PI / 2, 0, 0] }),
        // The pole, slanting back and down into the water.
        P.cyl(0.055, 0.05, 3.6, POLE, { at: [0, -0.4, -1.78], rot: [Math.PI / 2 - 0.27, 0, 0] }),
      ]),
      bag,
      2,
    ),
  )
  const prop = new Group()
  prop.position.set(0, -0.9, -3.5)
  prop.add(solid(merge([P.box(0.5, 0.08, 0.05, PAL.gold), P.box(0.08, 0.5, 0.05, PAL.gold), P.sphere(0.07, ENGINE_DARK)]), bag, 1.5))
  tail.add(prop)
  body.add(tail)

  // ---- Ribbons and the garland on the prow ----
  const dress = new Group()
  dress.position.copy(PROW)
  body.add(dress)
  const garland = new Group()
  const buds: BufferGeometry[] = []
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    buds.push(P.sphere(0.045, i % 4 === 0 ? '#FFE9A8' : '#FFFFFF', { at: [Math.sin(a) * 0.12, -0.12 + Math.cos(a) * 0.02, Math.cos(a) * 0.12] }, 8))
  }
  // A strand hanging down the front of the prow, a marigold and a pink rose at its end.
  for (let i = 0; i < 6; i++) buds.push(P.sphere(0.04, '#FFFFFF', { at: [0, -0.16 - i * 0.07, 0.1 + i * 0.012] }, 8))
  buds.push(P.sphere(0.075, '#FFB43C', { at: [0, -0.62, 0.17] }, 10), P.sphere(0.06, PAL.hotpink, { at: [0, -0.73, 0.18] }, 10))
  garland.add(solid(merge(buds), bag, 1.5))
  garland.visible = false
  dress.add(garland)
  /** Each ribbon: a chain of segments (each joint bends a little more than the last, so it waves). */
  let ribbons: { joints: Group[]; phase: number }[] = []
  const ribbonRoot = new Group()
  dress.add(ribbonRoot)
  const SEG = 0.34

  const cargo = new Group()
  body.add(cargo)
  let flutter = 0

  return {
    root,
    body,
    cargo,
    seats: { nick: { x: 0, y: 0.52, z: 0.9 }, ji: { x: 0, y: 0.52, z: -0.5 }, kaylee: { x: 0, y: 0.5, z: -1.98, stand: true } },
    hull: { at: [2.4, 0.4, -1.8], r: 0.85 },
    feel: LONGTAIL_FEEL,
    stern: -L / 2 - 3.1,
    bow: L / 2 + 0.4,
    setRibbons(colors) {
      ribbonRoot.clear()
      ribbons = colors.slice(0, 3).map((name, i) => {
        const c = RIBBON_COLORS[name] ?? PAL.pink
        const joints: Group[] = []
        let parent: Group = ribbonRoot
        for (let k = 0; k < 5; k++) {
          const j = new Group()
          if (k === 0) {
            j.position.set((i - 1) * 0.09, 0, -0.02)
            j.rotation.set(-0.7, (i - 1) * 0.5, 0)
          } else j.position.set(0, 0, -SEG)
          // A strip trailing back (local -z), a little narrower toward the end, with a bow where it's tied.
          const strip = [P.box(0.2 - k * 0.025, 0.02, SEG, c, { at: [0, 0, -SEG / 2] })]
          if (k === 0) strip.push(...[-1, 1].map((s) => P.sphere(0.09, c, { at: [s * 0.1, 0.03, 0.02], scale: [1.2, 0.5, 0.8] }, 8)))
          j.add(solid(merge(strip), bag, 1.5))
          parent.add(j)
          joints.push(j)
          parent = j
        }
        return { joints, phase: i * 1.9 }
      })
    },
    setGarland(on) {
      garland.visible = on
    },
    grip(out) {
      return out.copy(handle).applyAxisAngle(new Vector3(0, 1, 0), tail.rotation.y).add(tail.position)
    },
    animate(steer, speed, t, dt) {
      // Steering swings the tail the other way (push the handle left, the boat goes right).
      tail.rotation.y += (-steer * 0.45 - tail.rotation.y) * Math.min(1, dt * 8)
      // Faster = the pole dips deeper and the propeller spins.
      tail.rotation.x = 0.04 * speed
      prop.rotation.z += dt * (8 + 50 * speed)
      // The engine shakes a little (more when it roars).
      tail.position.y = 0.9 + Math.sin(t * 60) * 0.006 * (0.4 + 2 * speed)
      // Ribbons stream back in the wind of going fast, and flutter (gently even when it's still).
      flutter += dt * (3 + 14 * speed)
      for (const r of ribbons)
        r.joints.forEach((j, k) => {
          const wave = Math.sin(flutter + r.phase - k * 1.1) * (0.18 + 0.25 * speed)
          // Trailing down and back in the breeze when still (a positive x turn lifts the far end), streaming straight
          // back at speed.
          if (k === 0) j.rotation.x = -0.75 + 0.62 * Math.min(1, speed) + wave * 0.35
          else {
            j.rotation.x = wave * 0.9 - 0.12 * (1 - speed)
            j.rotation.y = Math.cos(flutter * 0.7 + r.phase + k) * 0.2 * (0.3 + speed)
          }
        })
    },
  }
}

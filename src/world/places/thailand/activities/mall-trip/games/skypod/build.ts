// The Sky Pod, built from simple shapes in the house's toon look (greybox: no generated art). The hall's dark back and
// flower mats; the Sky Pod's wall, painted as a night sky (stars, a moon); the scoreboard's dark screen (its numbers
// are HTML, laid over it by wall.ts); the springy mat in front; the big speaker; the rocket on top. Two of everything
// that depends on the screen (the wall is wide with an arch of pods, or tall with a three-by-three): wall.ts shows one.
import { Group, type BufferGeometry } from 'three'
import type { Bag } from '../../../../engine/dispose'
import { merge, P, solid } from '../../../../engine/geo'
import { PAL } from '../../../../engine/toon'
import { boardSpot, matX, moonSpot, podSpots, rocketSpot, speakerSpot, wallSize, BEZEL_R, KAYLEE_Z } from './layout'

/** The springy mat's top (Kaylee and Daddy stand on it). */
export const MAT_Y = 0.12
const NIGHT = '#3B3466'
const NIGHT_EDGE = '#B9A6F5'

export interface Layer {
  root: Group
  speaker: Group
  /** The speaker's cone (it thumps with the beat). */
  cone: Group
  rocket: Group
  flame: Group
  moon: Group
  /** The little stars painted on the wall (they twinkle when the moon is tapped). */
  stars: Group
}
export interface Built {
  root: Group
  wide: Layer
  tall: Layer
}

/** A five-pointed star (flat, facing the camera). */
function star(r: number, color: string, at: [number, number, number]): BufferGeometry {
  const pts: [number, number][] = []
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 ? r * 0.45 : r
    pts.push([Math.cos(a) * rr, Math.sin(a) * rr])
  }
  return P.prism(pts, 0.015, color, { at })
}

/** A crescent moon. */
function crescent(r: number, color: string): BufferGeometry {
  const pts: [number, number][] = []
  for (let i = 0; i <= 16; i++) {
    const a = -Math.PI / 2 + (i / 16) * Math.PI
    pts.push([Math.cos(a) * r, Math.sin(a) * r])
  }
  for (let i = 16; i >= 0; i--) {
    const a = -Math.PI / 2 + (i / 16) * Math.PI
    pts.push([Math.cos(a) * r * 0.45 + r * 0.05, Math.sin(a) * r * 0.86])
  }
  return P.prism(pts, 0.05, color, { rot: [0, 0, 0.35] })
}

function layer(tall: boolean, bag: Bag): Layer {
  const root = new Group()
  const W = wallSize(tall)
  const b = boardSpot(tall)
  // ---- The wall: a dark night-sky panel with a lilac edge and a pink strip along the top ----
  const parts: BufferGeometry[] = [
    P.rbox(W.w + 0.16, W.h + 0.16, 0.16, 0.08, NIGHT_EDGE, { at: [0, (W.h + 0.16) / 2 - 0.04, -0.14] }),
    P.rbox(W.w, W.h, 0.16, 0.06, NIGHT, { at: [0, W.h / 2 + 0.04, -0.08] }),
    P.rbox(W.w + 0.2, 0.12, 0.22, 0.05, PAL.hotpink, { at: [0, W.h + 0.08, -0.08] }),
    // The scoreboard: a frame and its dark screen.
    P.rbox(b.w + 0.14, b.h + 0.14, 0.1, 0.05, '#2B2330', { at: [b.at[0], b.at[1], 0.0] }),
    P.rbox(b.w, b.h, 0.04, 0.03, '#120E26', { at: [b.at[0], b.at[1], 0.05] }),
  ]
  // Each pod sits in a lilac socket on the wall.
  for (const [x, y] of podSpots(tall)) parts.push(P.cyl(BEZEL_R + 0.05, BEZEL_R + 0.05, 0.05, '#4E4583', { at: [x, y, 0.0], rot: [Math.PI / 2, 0, 0] }, 24))
  root.add(solid(merge(parts), bag, 2.4))
  // ---- Little painted stars where there are no pods (no outline: they're paint) ----
  const spots = podSpots(tall)
  const stars: BufferGeometry[] = []
  let seed = tall ? 7 : 3
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  for (let tries = 0; stars.length < (tall ? 9 : 16) && tries < 400; tries++) {
    const x = (rnd() - 0.5) * (W.w - 0.3)
    const y = 0.25 + rnd() * (W.h - 0.4)
    const clear = spots.every(([px, py]) => Math.hypot(px - x, py - y) > BEZEL_R + 0.2) && !(Math.abs(x - b.at[0]) < b.w / 2 + 0.15 && Math.abs(y - b.at[1]) < b.h / 2 + 0.15)
    const m = moonSpot(tall)
    if (clear && Math.hypot(x - m[0], y - m[1]) > 0.4) stars.push(star(0.05 + rnd() * 0.05, rnd() < 0.5 ? PAL.butter : '#FFFFFF', [x, y, 0.005]))
  }
  const starG = solid(merge(stars), bag, 0)
  root.add(starG)
  // ---- The moon on the wall ----
  const moon = new Group()
  moon.position.set(...moonSpot(tall))
  moon.add(solid(merge([crescent(0.22, PAL.butter)]), bag, 2))
  root.add(moon)
  // ---- The springy mat in front: a sky-blue pad on a pink frame ----
  const [mx0, mx1] = matX(tall)
  const mw = mx1 - mx0 + 1.2
  root.add(
    solid(
      merge([
        P.rbox(mw + 0.16, 0.08, 1.3, 0.04, PAL.hotpink, { at: [(mx0 + mx1) / 2, 0.04, KAYLEE_Z + 0.12] }),
        P.rbox(mw, 0.06, 1.14, 0.03, PAL.sky, { at: [(mx0 + mx1) / 2, 0.09, KAYLEE_Z + 0.12] }),
        ...[-0.25, 0.25].map((dz) => P.box(mw - 0.3, 0.004, 0.03, '#FFFFFF', { at: [(mx0 + mx1) / 2, 0.122, KAYLEE_Z + 0.12 + dz] })),
      ]),
      bag,
      2,
    ),
  )
  // ---- The big speaker (tap it: a beat to play along to) ----
  const speaker = new Group()
  speaker.position.set(...speakerSpot(tall))
  // (On a tall screen it stands on the mat's end.)
  if (tall) speaker.position.y = MAT_Y
  const sh = tall ? 0.7 : 1.0
  const sw = tall ? 0.46 : 0.6
  speaker.add(solid(merge([P.rbox(sw, sh, 0.45, 0.06, '#4A4170', { at: [0, sh / 2, 0] }), P.cyl(sw * 0.16, sw * 0.16, 0.03, '#2B2330', { at: [0, sh * 0.8, 0.23], rot: [Math.PI / 2, 0, 0] })]), bag, 2))
  const cone = new Group()
  cone.position.set(0, sh * 0.38, 0.23)
  cone.add(solid(merge([P.cyl(sw * 0.36, sw * 0.36, 0.03, PAL.hotpink, { rot: [Math.PI / 2, 0, 0] }), P.cyl(sw * 0.28, sw * 0.28, 0.04, '#2B2330', { rot: [Math.PI / 2, 0, 0] }), P.sphere(sw * 0.1, '#5D5390', { at: [0, 0, 0.02], scale: [1, 1, 0.5] })]), bag, 1.6))
  speaker.add(cone)
  root.add(speaker)
  // ---- The rocket on top of the wall (tap it: it rumbles and hops) ----
  const rocket = new Group()
  rocket.position.set(...rocketSpot(tall))
  const s = tall ? 0.8 : 1
  rocket.add(
    solid(
      merge([
        P.capsule(0.13 * s, 0.32 * s, '#FFFFFF', { at: [0, 0.32 * s, 0] }),
        P.cone(0.13 * s, 0.2 * s, PAL.hotpink, { at: [0, 0.68 * s, 0] }),
        P.cyl(0.06 * s, 0.06 * s, 0.03, PAL.sky, { at: [0, 0.42 * s, 0.12 * s], rot: [Math.PI / 2, 0, 0] }),
        ...[-1, 1].map((d) => P.prism([[0, 0], [0.16 * s * d, -0.06 * s], [0.16 * s * d, 0.08 * s], [0, 0.2 * s]], 0.05, PAL.lavenderDark, { at: [0.1 * s * d, 0.1 * s, 0] })),
      ]),
      bag,
      2,
    ),
  )
  const flame = new Group()
  flame.add(solid(merge([P.cone(0.08 * s, 0.22 * s, PAL.gold, { at: [0, -0.06 * s, 0], rot: [Math.PI, 0, 0] })]), bag, 0))
  flame.visible = false
  rocket.add(flame)
  root.add(rocket)
  return { root, speaker, cone, rocket, flame, moon, stars: starG }
}

export function buildSkyPod(bag: Bag): Built {
  const root = new Group()
  // ---- The hall around it: the flower mats and the dark back ----
  root.add(
    solid(
      merge([
        P.box(18, 0.05, 9, '#EBDDFF', { at: [0, -0.025, 1.0] }),
        ...[-6, -3, 0, 3, 6].flatMap((x) => [-1, 1.6].map((z) => P.cyl(0.32, 0.32, 0.004, (x + z * 2) % 2 ? '#FFD6E7' : '#D9F5EA', { at: [x + (z > 0 ? 1.5 : 0), 0.003, z + 1.2] }, 18))),
        P.box(18, 9, 0.1, '#2E2748', { at: [0, 4.5, -0.6] }),
      ]),
      bag,
      0,
    ),
  )
  const wide = layer(false, bag)
  const tall = layer(true, bag)
  root.add(wide.root, tall.root)
  return { root, wide, tall }
}

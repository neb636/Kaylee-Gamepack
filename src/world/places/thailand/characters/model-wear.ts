// What the modelled Kaylee (model.ts) wears: the same sun hat, sunglasses, scrubs, apron, gloves... as the code-built
// one, fitted to her shape. Her head is a wide bob of hair over a smaller face, her dress a narrow cone, her arms thin
// and hanging out at 47°, and her legs on their own hip pivots, so the code-built sizes (animal.ts's Frame, in
// fractions of a round head and a capsule torso) land in the wrong places: glasses on her bangs, floaties on her tummy.
//
// Hats and sunglasses reuse animal.ts's recipes with a Frame measured on her (the hair dome for hats, the face for the
// glasses). Clothes and the things on her arms and legs are built here around her measured shape.
//
// Her numbers (meters, from kaylee.glb): head pivot at the neck (0, 0.44, 0.04); the face a sphere of 0.24 around her
// eyes (head-local y 0.148, center z -0.02), the hair a dome of 0.30 (y 0.18, z -0.04); the dress centered at z 0.045,
// shoulders at y 0.46, hem at 0.19; arms from (±0.11, 0.40, 0.04), hoof 0.184 out at 0.818 rad from straight down;
// legs from hips at (±0.072, 0.16, 0.03), hooves below y 0.07.
import { CatmullRomCurve3, Group, LatheGeometry, SphereGeometry, TubeGeometry, Vector2, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../engine3d/dispose'
import { bake, P, solidMix, type V3 } from '../../../engine3d/geo'
import { buildWorn, SCRUBS, SCRUBS_DARK, type Frame, type Wardrobe, type Worn } from '../../../engine3d/characters/animal'
import { LOOKS, type Wearable } from './looks'

/** The model's ink width (model.ts's PX), so what she wears is drawn with the same line as she is. */
export const PX = 1.8
/** The dress's center front-to-back (body-local z). */
export const ZC = 0.045
/** Her arm's angle out from straight down, and how far along it the hoof is. */
const ARM = 0.818
export const HOOF = 0.184
const SMOCK = '#C9B5F7'
type Parts = BufferGeometry[]
const APRON = '#FF8FB8'

const turnTo = (R: number) => (x: number): V3 => [0, Math.asin(Math.max(-1, Math.min(1, x / R))), 0]

/** A sphere-shaped part of her head for animal.ts's recipes: `R` around (0, y, z), her eyes 0.109 out. */
function frame(R: number, y: number, z: number): Frame {
  return {
    H: 1,
    R,
    headY: y,
    shoulder: [0, 0, 0],
    eyeX: 0.109,
    eyeY: 0,
    eyeSize: 0.05,
    lift: 0,
    on: (x, dy, lift = 0) => [x, y + dy, z + Math.sqrt(Math.max(0, R * R - x * x - dy * dy)) + lift],
    turnTo: turnTo(R),
  }
}
/** The sunglasses sit on her face. */
export const FACE = frame(0.24, 0.148, -0.02)
/** Hats sit on her hair (built around z 0, then the group moves back to the dome's center). */
export const HAIR = frame(0.3, 0.18, 0)
export const HAIR_Z = -0.04

/** A garment over her dress, turned on a lathe: `[y, half-width, half-depth]` rings from the hem up, closed at both
 *  ends, centered on the dress. */
export function shell(rings: [number, number, number][], color: string) {
  const g = new LatheGeometry(rings.map(([y, rx]) => new Vector2(rx, y)), 28)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    // The lathe goes round at the ring's half-width; squash its depth to the ring's half-depth.
    const ring = rings.reduce((best, r) => (Math.abs(r[0] - y) < Math.abs(best[0] - y) ? r : best))
    const k = ring[1] ? ring[2] / ring[1] : 1
    pos.setZ(i, ZC + pos.getZ(i) * k)
  }
  g.computeVertexNormals()
  return bake(g, color)
}

/** A top over her dress, a little proud of it all the way down (`[y, half-width, half-depth]`). */
const TUNIC: [number, number, number][] = [
  [0.2, 0.172, 0.152],
  [0.24, 0.162, 0.14],
  [0.3, 0.137, 0.12],
  [0.34, 0.12, 0.111],
  [0.4, 0.118, 0.095],
  [0.45, 0.112, 0.072],
  [0.468, 0.07, 0.045],
]
export const tunic = (hem: number, color: string) => {
  // (A short top starts at its own hem: the rings below it would fold the shell back on itself.)
  const [, rx, rz] = TUNIC.find((r) => r[0] >= hem) ?? TUNIC[0]
  return shell([[hem, 0, 0], [hem, Math.max(rx, 0.12) + 0.004, Math.max(rz, 0.1) + 0.004], ...TUNIC.filter((r) => r[0] > hem), [0.472, 0, 0]], color)
}

/** Where the tunic's front is at height `y`, `x` out from the middle (body-local z), for things sewn on it. */
export function onTunic(x: number, y: number): number {
  const i = Math.max(0, TUNIC.findIndex((r) => r[0] >= y) - 1)
  const [a, b] = [TUNIC[i], TUNIC[Math.min(i + 1, TUNIC.length - 1)]]
  const k = b[0] > a[0] ? Math.min(1, Math.max(0, (y - a[0]) / (b[0] - a[0]))) : 0
  const rx = a[1] + (b[1] - a[1]) * k
  const rz = a[2] + (b[2] - a[2]) * k
  return ZC + rz * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2))
}

/** A point `d` along her arm from the shoulder (arm-local, `s` -1 left, 1 right). */
export const along = (s: number, d: number): V3 => [s * Math.sin(ARM) * d, -Math.cos(ARM) * d, 0]

/** A short sleeve over the top of her arm, from over the shoulder cap (which rises 0.04 above the pivot) to past her
 *  dress's own sleeve. */
export const sleeve = (s: number, color: string) => P.capsule(0.049, 0.07, color, { at: along(s, 0.015), rot: [0, 0, s * ARM] })

/** Groups for whatever has parts, with her line. */
export const group = (lined: Parts, plain: Parts, bag: Bag) => (lined.length || plain.length ? solidMix(lined, plain, bag, PX) : null)

/** The arms swing in a frame turned forward (model.ts's ARM_TILT): what rides on them turns back into the arm's own. */
export function onArm(g: Group | null, s: number, tilt: number) {
  if (!g) return null
  const holder = new Group()
  holder.rotation.y = s * tilt
  holder.add(g)
  return holder
}

/** The vet's scrub cap, made for her: a dome over the top of her hair whose rim runs round her bangs (the code-built
 *  one is a whole squashed ball, which on her bulges out over her forehead), set back so her horn and ears poke out,
 *  with little pink dots. */
function scrubCap(bag: Bag) {
  // The rim's half-width and half-depth, the dome's height above it, and its center (head-local, tipped down at the
  // front).
  const [rx, rz, h] = [0.29, 0.32, 0.19]
  const at: V3 = [0, 0.32, -0.03]
  const tilt = 0.14
  const dome = bake(new SphereGeometry(1, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2), SCRUBS, { at, rot: [tilt, 0, 0], scale: [rx, h, rz] })
  const rim = P.torus(1, 0.022, SCRUBS_DARK, { at, rot: [Math.PI / 2 + tilt, 0, 0], scale: [rx, rz, 1] })
  // A point on the dome (u across, v front to back, both -1..1 of the rim), turned with it.
  const onDome = (u: number, v: number): V3 => {
    const up = h * Math.sqrt(Math.max(0, 1 - u * u - v * v)) + 0.004
    const [y, z] = [up, v * rz]
    return [u * rx, at[1] + y * Math.cos(tilt) - z * Math.sin(tilt), at[2] + y * Math.sin(tilt) + z * Math.cos(tilt)]
  }
  const dots = [[-0.5, 0.45], [0.15, 0.6], [0.55, 0.3], [-0.15, 0.15], [0.35, -0.2], [-0.45, -0.25]].map(([u, v]) => P.sphere(0.018, '#FF8FB8', { at: onDome(u, v), scale: [1, 0.45, 1] }))
  return solidMix([dome, rim], dots, bag, PX)
}

/** How far her hair reaches out from the headband's center, every 15° round from the front toward her left (+x), in
 *  the band's tipped plane (measured on kaylee.glb, the braid and streaks included). Not round: furthest at the front
 *  where her bangs and the pink lock stand out, small at the back. */
export const BAND_R = [0.306, 0.307, 0.302, 0.286, 0.273, 0.267, 0.26, 0.247, 0.244, 0.241, 0.22, 0.209, 0.205, 0.21, 0.22, 0.241, 0.244, 0.248, 0.26, 0.268, 0.29, 0.306, 0.302, 0.308]

/** The red Muay Thai headband (mongkhon), made for her: a band that follows her hair all the way round over the top
 *  of her bangs (a round one sinks into her hair at the sides and goes under the pink lock), its two tails hanging
 *  down at the back, and a gold bead in front. */
function mongkhon(bag: Bag) {
  // Up on the round part of her hair, across the top of her bangs (lower down, her bob flares out and it reads as a
  // hoop).
  const center = new Vector3(0, 0.33, -0.04)
  const tilt = 0.12
  const tube = 0.022
  const n = BAND_R.length
  const at = (i: number, out: number) => {
    // Never dip between two measured spokes: each takes the bigger of itself and its neighbours' average.
    const r = Math.max(BAND_R[i % n], (BAND_R[(i + n - 1) % n] + BAND_R[(i + 1) % n]) / 2) + out
    const th = (i / n) * Math.PI * 2
    return new Vector3(Math.sin(th), -Math.cos(th) * Math.sin(tilt), Math.cos(th) * Math.cos(tilt)).multiplyScalar(r).add(center)
  }
  const ring = Array.from({ length: n }, (_, i) => at(i, tube + 0.004))
  const band = bake(new TubeGeometry(new CatmullRomCurve3(ring, true), 96, tube, 10, true), '#E8403F')
  const back = at(n / 2, tube + 0.01)
  const tails = [-1, 1].map((s) => P.capsule(0.016, 0.09, '#E8403F', { at: [s * 0.03, back.y - 0.06, back.z - 0.012], rot: [-0.35, 0, s * 0.3], scale: [1.4, 1, 0.6] }))
  const front = at(0, tube * 2 + 0.006)
  const bead = P.sphere(0.018, '#FFC83D', { at: [front.x, front.y, front.z] })
  return solidMix([band, ...tails], [bead], bag, PX)
}

export function modelWardrobe(armTilt: number): Wardrobe {
  return {
    // Up on her hair, above the bangs, tipped back.
    glassesUp: { y: 0.11, z: 0.11, tilt: -0.42 },
    build(id: Wearable, bag: Bag): Worn {
      const look = LOOKS.kaylee
      if (id === 'sunglasses') return buildWorn(look, id, bag, FACE, PX)
      if (id === 'scrub-cap') return { head: scrubCap(bag), body: null, armL: null, armR: null }
      if (id === 'mongkhon') return { head: mongkhon(bag), body: null, armL: null, armR: null }
      if (id === 'sunhat' || id === 'spare-hat' || id === 'chef-hat') {
        const w = buildWorn(look, id, bag, HAIR, PX)
        w.head!.position.z = HAIR_Z
        return w
      }
      const body: Parts = []
      const bodyPlain: Parts = []
      const arm: Record<'L' | 'R', Parts> = { L: [], R: [] }
      const leg: Record<'L' | 'R', Parts> = { L: [], R: [] }
      const sides = [['L', -1], ['R', 1]] as const
      if (id === 'scrubs') {
        // The vet's blue scrubs over her dress: a tunic with a white V at the neck and a pocket (a pink pen in it),
        // short sleeves, and trousers over each leg down to the hooves.
        body.push(tunic(0.175, SCRUBS))
        body.push(P.rbox(0.05, 0.045, 0.01, 0.006, SCRUBS_DARK, { at: [0.05, 0.37, onTunic(0.05, 0.37) + 0.004], rot: [-0.25, 0.4, 0] }))
        body.push(P.cyl(0.006, 0.006, 0.045, '#FF4F9A', { at: [0.04, 0.397, onTunic(0.04, 0.397) + 0.006], rot: [-0.25, 0, 0.15] }))
        for (const s of [-1, 1]) bodyPlain.push(P.box(0.01, 0.05, 0.008, '#FFFFFF', { at: [s * 0.016, 0.44, onTunic(0.016, 0.44) + 0.002], rot: [-0.6, 0, s * 0.5] }))
        for (const [side, s] of sides) {
          arm[side].push(sleeve(s, SCRUBS))
          leg[side].push(P.cyl(0.058, 0.066, 0.12, SCRUBS_DARK, { at: [s * -0.003, -0.03, 0.012], scale: [1, 1, 1.08] }))
        }
      }
      if (id === 'smock') {
        // The barber's smock: lavender down past her hem, buttoned up one side, a comb in the chest pocket.
        body.push(tunic(0.17, SMOCK))
        bodyPlain.push(...[0.4, 0.33, 0.26].map((y) => P.sphere(0.011, '#FFFFFF', { at: [0.045, y, onTunic(0.045, y)] })))
        body.push(P.rbox(0.05, 0.045, 0.01, 0.006, '#B39CEB', { at: [-0.05, 0.37, onTunic(-0.05, 0.37) + 0.004], rot: [-0.25, -0.4, 0] }))
        body.push(P.box(0.036, 0.022, 0.006, '#FF8FB8', { at: [-0.05, 0.398, onTunic(-0.05, 0.398) + 0.004], rot: [-0.25, -0.4, 0] }))
        for (const [side, s] of sides) arm[side].push(sleeve(s, SMOCK))
      }
      if (id === 'apron') {
        // The cafe's pink apron: a bib on her chest, a skirt round her dress to the hem with a white pocket, straps up
        // over her shoulders and a white tie round the waist.
        body.push(shell([[0.185, 0, 0], [0.185, 0.178, 0.159], [0.24, 0.164, 0.142], [0.3, 0.139, 0.122], [0.305, 0, 0]], APRON))
        body.push(P.rbox(0.13, 0.11, 0.016, 0.016, APRON, { at: [0, 0.37, 0.15], rot: [-0.3, 0, 0] }))
        body.push(P.torus(0.14, 0.011, '#FFFFFF', { at: [0, 0.302, ZC], rot: [Math.PI / 2, 0, 0], scale: [1, 0.88, 1] }))
        for (const s of [-1, 1]) body.push(P.capsule(0.009, 0.07, '#FFFFFF', { at: [s * 0.05, 0.44, 0.105], rot: [-0.9, 0, -s * 0.4] }))
        bodyPlain.push(P.rbox(0.06, 0.04, 0.01, 0.008, '#FFFFFF', { at: [0, 0.235, 0.192], rot: [-0.3, 0, 0] }))
      }
      if (id === 'gloves') {
        // Pink Muay Thai gloves over her hooves: a big round glove, a thumb on its inner side and a white cuff.
        for (const [side, s] of sides) {
          arm[side].push(P.sphere(0.064, '#FF4F9A', { at: along(s, HOOF + 0.012), rot: [0, 0, s * ARM], scale: [1, 1.1, 1.12] }))
          const [x, y] = along(s, HOOF - 0.01)
          arm[side].push(P.sphere(0.026, '#FF4F9A', { at: [x, y, 0.05], rot: [0, 0, s * ARM], scale: [0.9, 1.4, 0.9] }))
          arm[side].push(P.cyl(0.046, 0.05, 0.03, '#FFFFFF', { at: along(s, HOOF - 0.06), rot: [0, 0, s * ARM] }))
        }
      }
      if (id === 'floaties') {
        // An armband round each upper arm (pink on one, orange on the other), a cream stripe round its top and a valve.
        for (const [side, s, color] of [['L', -1, '#FF7FA8'], ['R', 1, '#FF9F45']] as const) {
          const rot: V3 = [Math.PI / 2, s * ARM, 0]
          const at = along(s, 0.095)
          arm[side].push(P.torus(0.046, 0.03, color, { at, rot }))
          arm[side].push(P.torus(0.06, 0.01, '#FFF7F0', { at: along(s, 0.071), rot }))
          // The valve on the band's outside (away from her body), pointing out.
          const out: V3 = [Math.cos(ARM) * s, Math.sin(ARM), 0]
          arm[side].push(P.cyl(0.009, 0.009, 0.026, '#FFF7F0', { at: [at[0] + out[0] * 0.08, at[1] + out[1] * 0.08, 0.012], rot: [0, 0, s * (ARM - Math.PI / 2)] }))
        }
      }
      return {
        head: null,
        body: group(body, bodyPlain, bag),
        armL: onArm(group(arm.L, [], bag), -1, armTilt),
        armR: onArm(group(arm.R, [], bag), 1, armTilt),
        legL: group(leg.L, [], bag),
        legR: group(leg.R, [], bag),
      }
    },
  }
}

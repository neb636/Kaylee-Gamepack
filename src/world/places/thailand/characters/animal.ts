// Kaylee's family as toy animals, built from simple shapes in the house's toon look (looks.ts says who is what).
//
// Every character is the same chibi rig: a root at the feet (facing +z), a `body` group that squashes and leans, and
// inside it the torso (legs, clothes, tail), a `head` pivot at the neck, and an arm pivot at each shoulder. The eyes
// (to blink) and the mouth (to talk) are their own groups on the head. Each piece is one merged mesh plus one ink outline, which also draws
// a line around the features that sit on top (a muzzle, a sleeve, an ear), like the concept pictures. Blush and the
// shine in the eyes have no outline.
//
// Sizes are fractions of the character's height H, so the same recipe makes Agong and little Putter; `chub` makes the
// body rounder (Mommy, and Jum the elephant).
import { Group, type BufferGeometry } from 'three'
import type { Bag } from '../engine/dispose'
import { blobShadow, P, solidMix, type PartOpts, type V3 } from '../engine/geo'
import { WEARABLES, type Look, type Wearable } from './looks'

export interface Rig {
  root: Group
  body: Group
  head: Group
  /** Both eyes (with their shine and lashes), pivoting at eye height: squash `scale.y` to blink. */
  eyes: Group
  /** The mouth at rest (a smile, or a big open grin), and the open talking mouth that grows with their voice. */
  mouth: Group
  talk: Group
  /** Their resting mouth is already open (Daddy, Ja, Putto): it stretches when they talk instead. */
  open: boolean
  armL: Group
  armR: Group
  tail: Group | null
  /** A unicorn's mane locks (down the back and sides), pivoting at the top of the back of the head: the wind swings
   *  them (Wind). */
  mane: Group | null
  height: number
  /** Body radius (lying down lifts the body by this). */
  radius: number
  /** The big cousins' phone, held in front of the tummy (its own group, so they can put it down). */
  phone: Group | null
  /** Where the face is (head-local): the head's radius, its center's height and the mouth (the vet aims at these). */
  face: { R: number; headY: number; mouth: V3 }
}

const INK = '#2E2233'
const BLUSH = '#FF9DB8'
const MOUTH = '#7A2745'
const TONGUE = '#FF8FA8'
const WHITE = '#FFFFFF'

type Parts = BufferGeometry[]

/** A frustum (skirts, shorts), baked like the other parts. */
const frustum = (top: number, bottom: number, h: number, c: string, o?: PartOpts) => P.cyl(top, bottom, h, c, o, 20)

/** A rig's proportions (head-local for the face, body-local for the rest): shared by the body and by things worn
 *  later (a sun hat, sunglasses, floaties), so they fit any character. */
interface Frame {
  H: number
  R: number
  headY: number
  shoulder: V3
  eyeX: number
  eyeY: number
  eyeSize: number
  /** A penguin's face mask stands out from its head: the eyes and blush sit on the mask. */
  lift: number
  /** A point on the head's surface (head-local), `lift` pulls it out a little. */
  on(x: number, y: number, lift?: number): V3
  /** Turns a part on the head's surface to face out at `x`. */
  turnTo(x: number): V3
}

function frameOf(look: Look): Frame {
  const H = look.height
  const penguin = look.species === 'penguin'
  const bird = look.species === 'hornbill'
  const R = (penguin ? 0.27 : look.species === 'panda' || look.species === 'elephant' ? 0.26 : bird ? 0.22 : look.species === 'puppy' ? 0.25 : 0.24) * H
  const c = look.chub ?? 1
  const headY = penguin ? 0.2 * H : R * 0.92
  return {
    H,
    R,
    headY,
    shoulder: penguin ? [0.3 * H, 0.5 * H, 0] : [0.155 * H * c, 0.47 * H, 0],
    eyeX: look.species === 'unicorn' || look.species === 'pony' ? 0.37 * R : bird ? 0.46 * R : 0.36 * R,
    eyeY: look.species === 'unicorn' || look.species === 'pony' ? 0.12 * R : penguin ? 0.02 * R : bird ? 0.14 * R : 0.05 * R,
    eyeSize: 0.21 * R,
    lift: penguin ? 0.12 * R : 0,
    on: (x, y, lift = 0) => [x, headY + y, Math.sqrt(Math.max(0, R * R - x * x - y * y)) + lift],
    turnTo: (x) => [0, Math.asin(Math.max(-1, Math.min(1, x / R))), 0],
  }
}

const isWearable = (e: string): e is Wearable => (WEARABLES as readonly string[]).includes(e)

interface WornParts {
  head: Parts
  headPlain: Parts
  armL: Parts
  armR: Parts
  body: Parts
  bodyPlain: Parts
}

const SCRUBS = '#7FB2F0'
const SCRUBS_DARK = '#5D8FD6'

/** One worn thing's parts, on the head pivot, the body or each arm pivot (in their local space). */
function wornParts(id: Wearable, f: Frame): WornParts {
  const { H, R, headY, eyeX, eyeY, on, turnTo } = f
  const out: WornParts = { head: [], headPlain: [], armL: [], armR: [], body: [], bodyPlain: [] }
  if (id === 'sunhat' || id === 'spare-hat') {
    const mine = id === 'sunhat'
    const straw = mine ? '#FBEA9A' : '#FFC2A8'
    const band = mine ? '#FF4F9A' : '#B9A6F5'
    // A low crown set back a little, so the horn pokes up out of it, and the ears poke up through the wide brim. The
    // brim's rim curls up.
    const cz = -0.16 * R
    const brimY = headY + 0.64 * R
    out.head.push(
      P.cyl(1.24 * R, 1.28 * R, 0.07 * R, straw, { at: [0, brimY, cz + 0.1 * R] }, 32),
      P.torus(1.26 * R, 0.07 * R, straw, { at: [0, brimY + 0.04 * R, cz + 0.1 * R], rot: [Math.PI / 2, 0, 0] }),
      P.cyl(0.6 * R, 0.66 * R, 0.26 * R, straw, { at: [0, brimY + 0.15 * R, cz] }, 24),
      P.sphere(0.6 * R, straw, { at: [0, brimY + 0.27 * R, cz], scale: [1, 0.42, 1] }, 24),
      P.cyl(0.675 * R, 0.69 * R, 0.14 * R, band, { at: [0, brimY + 0.1 * R, cz] }, 24),
    )
    // A bow on the band (hers), or a little daisy (Mommy's spare).
    const side: V3 = [0.46 * R, brimY + 0.12 * R, cz + 0.5 * R]
    if (mine) {
      for (const s of [-1, 1]) out.head.push(P.sphere(0.13 * R, band, { at: [side[0] + s * 0.13 * R, side[1], side[2]], rot: [0, 0.75, s * 0.5], scale: [1.2, 0.75, 0.45] }))
      out.head.push(P.sphere(0.06 * R, band, { at: side }))
    } else {
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2
        out.head.push(P.sphere(0.07 * R, '#FFFFFF', { at: [side[0] + Math.cos(a) * 0.08 * R, side[1] + Math.sin(a) * 0.08 * R, side[2]], rot: [0, 0.75, 0], scale: [1, 1, 0.4] }))
      }
      out.headPlain.push(P.sphere(0.055 * R, '#FFC83D', { at: [side[0], side[1], side[2] + 0.02 * R] }))
    }
  }
  if (id === 'sunglasses') {
    // Her pink heart sunglasses (the ones she packed) over the eyes: a pink heart frame, a dark plum heart lens in it
    // with a shine (cool, and still her face).
    const lift = f.lift + 0.13 * R
    const heart = (x: number, k: number, c: string, dz: number, parts: Parts) => {
      const rot = turnTo(x)
      for (const s of [-1, 1]) parts.push(P.sphere(0.12 * R * k, c, { at: on(x + s * 0.085 * R * k, eyeY + 0.04 * R, lift + dz), rot, scale: [1, 1, 0.3] }, 14))
      parts.push(P.cone(0.19 * R * k, 0.22 * R * k, c, { at: on(x, eyeY - 0.1 * R * k, lift + dz), rot: [Math.PI, rot[1], 0], scale: [1, 1, 0.3] }, 14))
    }
    for (const s of [-1, 1]) {
      const x = s * eyeX
      heart(x, 1.22, '#FF4F9A', 0, out.head)
      heart(x, 0.9, '#5A3F66', 0.012 * R, out.head)
      out.headPlain.push(P.sphere(0.05 * R, '#FFFFFF', { at: on(x - s * 0.07 * R, eyeY + 0.08 * R, lift + 0.05 * R), rot: turnTo(x), scale: [1, 0.7, 0.3] }))
      out.headPlain.push(P.sphere(0.022 * R, '#FFFFFF', { at: on(x + s * 0.05 * R, eyeY - 0.04 * R, lift + 0.05 * R), rot: turnTo(x), scale: [1, 1, 0.3] }))
    }
    out.head.push(P.capsule(0.035 * R, eyeX * 2 - 0.5 * R, '#FF4F9A', { at: on(0, eyeY + 0.07 * R, lift + 0.02 * R), rot: [0, 0, Math.PI / 2] }))
  }
  if (id === 'scrubs') {
    // The vet's blue scrubs over her dress: a top with a white V at the neck and a pocket (a pink pen in it), a tunic
    // hem over the skirt, trousers over the legs, and short sleeves.
    out.body.push(P.capsule(0.172 * H, 0.06 * H, SCRUBS, { at: [0, 0.37 * H, 0] }))
    out.body.push(P.cyl(0.168 * H, 0.248 * H, 0.18 * H, SCRUBS, { at: [0, 0.232 * H, 0] }, 20))
    for (const s of [-1, 1]) out.body.push(P.capsule(0.078 * H, 0.05 * H, SCRUBS_DARK, { at: [s * 0.085 * H, 0.115 * H, 0] }))
    out.body.push(P.rbox(0.07 * H, 0.06 * H, 0.012 * H, 0.008 * H, SCRUBS_DARK, { at: [0.075 * H, 0.42 * H, 0.165 * H], rot: [0, 0.4, 0] }))
    out.body.push(P.cyl(0.008 * H, 0.008 * H, 0.06 * H, '#FF4F9A', { at: [0.06 * H, 0.46 * H, 0.168 * H], rot: [0, 0, 0.15] }))
    for (const s of [-1, 1]) out.bodyPlain.push(P.box(0.012 * H, 0.08 * H, 0.01 * H, '#FFFFFF', { at: [s * 0.022 * H, 0.505 * H, 0.152 * H], rot: [-0.35, 0, s * 0.5] }))
    for (const [side, s] of [['armL', -1], ['armR', 1]] as const) out[side].push(P.sphere(0.074 * H, SCRUBS, { at: [s * 0.006 * H, -0.02 * H, 0] }))
  }
  if (id === 'scrub-cap') {
    // A round scrub cap with little pink dots, set back so her horn and ears poke out, and a band round its rim.
    const cz = -0.12 * R
    out.head.push(P.sphere(1.0 * R, SCRUBS, { at: [0, headY + 0.4 * R, cz], scale: [1.07, 0.7, 1.05] }, 24))
    out.head.push(P.torus(0.98 * R, 0.07 * R, SCRUBS_DARK, { at: [0, headY + 0.42 * R, cz], rot: [Math.PI / 2 + 0.12, 0, 0], scale: [1.08, 1.05, 1] }))
    for (const [x, y] of [[-0.5, 0.86], [0.1, 1.02], [0.6, 0.82], [-0.15, 0.7]]) out.headPlain.push(P.sphere(0.07 * R, '#FF8FB8', { at: on(x * R, (y - 0.45) * R + 0.4 * R, 0.08 * R), scale: [1, 1, 0.4] }))
  }
  if (id === 'apron') {
    // The cafe's pink apron over her dress: a bib on the chest, a skirt panel to the knees with a white pocket, the
    // neck strap and a white tie round the waist.
    out.body.push(P.rbox(0.2 * H, 0.15 * H, 0.03 * H, 0.03 * H, '#FF8FB8', { at: [0, 0.4 * H, 0.15 * H], rot: [-0.12, 0, 0] }))
    out.body.push(P.cyl(0.2 * H, 0.26 * H, 0.2 * H, '#FF8FB8', { at: [0, 0.22 * H, 0.012 * H], scale: [1, 1, 0.9] }, 20))
    out.body.push(P.torus(0.19 * H, 0.016 * H, '#FFFFFF', { at: [0, 0.32 * H, 0], rot: [Math.PI / 2, 0, 0] }))
    for (const s of [-1, 1]) out.body.push(P.capsule(0.012 * H, 0.1 * H, '#FFFFFF', { at: [s * 0.075 * H, 0.5 * H, 0.1 * H], rot: [-0.6, 0, -s * 0.5] }))
    out.bodyPlain.push(P.rbox(0.09 * H, 0.06 * H, 0.012 * H, 0.012 * H, '#FFFFFF', { at: [0, 0.2 * H, 0.235 * H], rot: [-0.3, 0, 0] }))
  }
  if (id === 'chef-hat') {
    // A tall white chef's hat, puffy on top, set back so her horn pokes out in front and her ears at the sides.
    const cz = -0.32 * R
    out.head.push(P.cyl(0.62 * R, 0.66 * R, 0.4 * R, '#FFFFFF', { at: [0, headY + 0.98 * R, cz], rot: [-0.25, 0, 0] }, 24))
    for (const [x, z] of [[0, 0], [-0.32, -0.1], [0.32, -0.1], [0, -0.3], [-0.18, 0.2], [0.18, 0.2]]) out.head.push(P.sphere(0.4 * R, '#FFFFFF', { at: [x * R, headY + 1.32 * R, cz + (z - 0.12) * R] }, 16))
    out.head.push(P.torus(0.65 * R, 0.06 * R, '#FFD6E6', { at: [0, headY + 0.8 * R, cz + 0.04 * R], rot: [Math.PI / 2 - 0.25, 0, 0] }))
  }
  if (id === 'floaties') {
    // An armband round each upper arm (pink on one, orange on the other, like the ones she packed), a cream stripe
    // round its top and a little valve.
    for (const [side, s, color] of [['armL', -1, '#FF7FA8'], ['armR', 1, '#FF9F45']] as const) {
      const ring = 0.058 * H
      const tube = 0.038 * H
      const dir: V3 = [s * Math.sin(0.35), -Math.cos(0.35), 0]
      const at: V3 = [s * 0.026 * H, -0.072 * H, 0]
      const up = (d: number): V3 => [at[0] - dir[0] * d, at[1] - dir[1] * d, at[2]]
      // The ring's axis along the arm (which hangs out at 0.35 rad).
      const rot: V3 = [Math.PI / 2, s * 0.35, 0]
      out[side].push(P.torus(ring, tube, color, { at, rot }))
      out[side].push(P.torus(ring + tube * 0.5, tube * 0.32, '#FFF7F0', { at: up(tube * 0.82), rot }))
      out[side].push(P.cyl(0.012 * H, 0.012 * H, 0.03 * H, '#FFF7F0', { at: [at[0] + s * (ring + tube * 0.9), at[1], at[2] + 0.01 * H], rot: [0, 0, s * (Math.PI / 2 - 0.35)] }))
    }
  }
  return out
}

/** Builds a worn thing to add to a finished rig at runtime (Kaylee puts on her sun hat): a group for the head pivot
 *  and one for each arm pivot (null where there's nothing). */
export function buildWorn(look: Look, id: Wearable, bag: Bag): { head: Group | null; armL: Group | null; armR: Group | null; body: Group | null } {
  const parts = wornParts(id, frameOf(look))
  const px = look.height >= 1 ? 3 : 2.5
  const group = (lined: Parts, plain: Parts) => (lined.length || plain.length ? solidMix(lined, plain, bag, px) : null)
  return { head: group(parts.head, parts.headPlain), armL: group(parts.armL, []), armR: group(parts.armR, []), body: group(parts.body, parts.bodyPlain) }
}

/** The wind in a unicorn's mane and tail: it eases toward `goal` (0 still, 1 strong), and they stream back and
 *  flutter. */
export class Wind {
  goal = 0
  private k = 0
  update(rig: Rig, dt: number, t: number) {
    this.k += (this.goal - this.k) * (1 - Math.exp(-dt * 4))
    const k = this.k
    if (!rig.mane) return
    rig.mane.rotation.x = k * (0.62 + Math.sin(t * 13) * 0.08 + Math.sin(t * 5.3) * 0.06)
    rig.mane.rotation.z = k * Math.sin(t * 9.1) * 0.05
    if (rig.tail) {
      rig.tail.rotation.x = k * (0.75 + Math.sin(t * 11 + 1) * 0.12)
      rig.tail.rotation.y = k * Math.sin(t * 7) * 0.12
    }
  }
}

export function buildAnimal(look: Look, bag: Bag): Rig {
  const f = frameOf(look)
  const { H, R, headY, shoulder, eyeX, eyeY, eyeSize, lift, on, turnTo } = f
  const px = H >= 1 ? 3 : 2.5
  const penguin = look.species === 'penguin'
  const bird = look.species === 'hornbill'

  const torso: Parts = []
  const torsoPlain: Parts = []
  const head: Parts = []
  const headPlain: Parts = []
  const eyes: Parts = []
  const eyesPlain: Parts = []
  const rest: Parts = []
  /** A unicorn's locks, which swing in the wind (their own group on the head). */
  const locks: Parts = []
  /** Where the mouth is (head-local): the resting mouth and the talking one are built around it. */
  let mouthAt: V3 = [0, 0, 0]
  const arm: { L: Parts; R: Parts } = { L: [], R: [] }
  const tail: Parts = []
  /** Where the tail pivots (body-local): it wags from its root. */
  let tailRoot: V3 = [0, 0, 0]
  const phone: Parts = []
  const phonePlain: Parts = []

  // ---- Proportions ----
  const c = look.chub ?? 1
  /** Round tummies: the torso and the clothes on it widen, and the legs and arms move out to match. */
  const round: V3 = [c, 1, 1 + (c - 1) * 0.8]
  const neck = 0.52 * H

  // ---- Body ----
  if (penguin) {
    // The body stays below the face (its top at the chin), so the cream face mask shows whole.
    torso.push(P.sphere(0.31 * H, look.fur, { at: [0, 0.33 * H, 0], scale: [1, 1.02, 0.95] }, 24))
    torso.push(P.sphere(0.25 * H, look.light, { at: [0, 0.3 * H, 0.12 * H], scale: [1, 1.08, 0.66] }, 20))
    for (const s of [-1, 1]) torso.push(P.sphere(0.09 * H, look.dark, { at: [s * 0.11 * H, 0.025 * H, 0.13 * H], scale: [1, 0.42, 1.45] }))
  } else if (bird) {
    torso.push(P.sphere(0.17 * H, look.fur, { at: [0, 0.36 * H, 0], scale: [1, 1.2, 1] }, 20))
    torso.push(P.sphere(0.13 * H, look.light, { at: [0, 0.3 * H, 0.07 * H], scale: [1, 1.15, 0.7] }))
    for (const s of [-1, 1]) {
      const x = s * 0.07 * H
      torso.push(P.capsule(0.025 * H, 0.12 * H, look.fur, { at: [x, 0.1 * H, 0] }))
      for (const a of [-0.5, 0, 0.5]) torso.push(P.capsule(0.017 * H, 0.06 * H, look.fur, { at: [x + Math.sin(a) * 0.04 * H, 0.015 * H, Math.cos(a) * 0.04 * H], rot: [Math.PI / 2, a, 0] }))
    }
  } else {
    const legColor = look.species === 'panda' ? look.dark : look.fur
    const feetColor = look.species === 'unicorn' || look.species === 'buffalo' || look.species === 'panda' || look.species === 'pony' ? look.dark : look.light
    const legX = 0.085 * H * (1 + (c - 1) * 0.7)
    const legR = 0.07 * H * (1 + (c - 1) * 0.6)
    for (const s of [-1, 1]) {
      torso.push(P.capsule(legR, 0.06 * H, legColor, { at: [s * legX, 0.1 * H, 0] }))
      torso.push(P.sphere(0.075 * H * (1 + (c - 1) * 0.6), feetColor, { at: [s * legX, 0.035 * H, 0.02 * H], scale: [1, 0.6, 1.3] }))
    }
    torso.push(P.capsule(0.155 * H, 0.1 * H, look.fur, { at: [0, 0.34 * H, 0], scale: round }))
    if (look.species === 'fox' || look.species === 'puppy') torso.push(P.sphere(0.075 * H, look.light, { at: [0, 0.5 * H, 0.11 * H * round[2]], scale: [1.1, 0.8, 0.7] }))
    if (look.species === 'buffalo' && !look.outfit) torso.push(P.sphere(0.11 * H, look.light, { at: [0, 0.27 * H, 0.1 * H], scale: [1, 1.1, 0.55] }))
  }

  // ---- Clothes ----
  const o = look.outfit
  if (o) {
    if (penguin) torso.push(frustum(0.3 * H, 0.335 * H, 0.18 * H, o.color, { at: [0, 0.43 * H, 0] }))
    else {
      const long = o.kind === 'shirt'
      torso.push(P.capsule(0.163 * H, (long ? 0.1 : 0.06) * H, o.color, { at: [0, (long ? 0.35 : 0.37) * H, 0], scale: round }))
      if (o.kind === 'dress') torso.push(frustum(0.15 * H, 0.235 * H, 0.17 * H, o.color, { at: [0, 0.235 * H, 0], scale: round }))
      if (o.shorts) torso.push(frustum(0.16 * H, 0.168 * H, 0.09 * H, o.shorts, { at: [0, 0.205 * H, 0], scale: round }))
      if (o.kind === 'polo') {
        for (const s of [-1, 1]) torso.push(P.box(0.08 * H, 0.012 * H, 0.06 * H, o.color, { at: [s * 0.045 * H, 0.535 * H, 0.1 * H], rot: [0.5, 0, s * -0.4] }))
        torsoPlain.push(...[0.47, 0.42].map((y) => P.sphere(0.009 * H, WHITE, { at: [0, y * H, 0.162 * H * round[2]] })))
      }
      if (o.kind === 'blouse') {
        torso.push(P.torus(0.075 * H, 0.016 * H, '#FFFFFF', { at: [0, 0.525 * H, 0.04 * H * round[2]], rot: [Math.PI / 2 - 0.35, 0, 0] }))
        torsoPlain.push(...[0.46, 0.4].map((y) => P.sphere(0.009 * H, '#FFE7A8', { at: [0, y * H, 0.163 * H * round[2]] })))
      }
      if (o.kind === 'shirt') {
        torsoPlain.push(...[0.47, 0.4, 0.33, 0.26].map((y) => P.sphere(0.011 * H, '#E8B85C', { at: [0, y * H, 0.164 * H * round[2]] })))
        torso.push(P.box(0.06 * H, 0.06 * H, 0.01 * H, o.color, { at: [0.07 * H, 0.44 * H, 0.15 * H], rot: [0, 0.45, 0] }))
      }
    }
  }

  // ---- Arms (flippers, wings), each on its own shoulder pivot ----
  for (const [side, s] of [['L', -1], ['R', 1]] as const) {
    const parts = arm[side]
    if (penguin) {
      parts.push(P.capsule(0.07 * H, 0.14 * H, look.fur, { at: [s * 0.015 * H, -0.12 * H, 0], rot: [0, 0, s * 0.3], scale: [0.45, 1, 1] }))
      if (o) parts.push(P.sphere(0.06 * H, o.color, { at: [s * 0.0, -0.02 * H, 0], scale: [0.8, 1, 1] }))
    } else if (bird) {
      parts.push(P.sphere(0.08 * H, look.fur, { at: [s * 0.02 * H, -0.09 * H, 0], rot: [0, 0, s * 0.3], scale: [0.5, 1.35, 0.95] }))
      parts.push(P.sphere(0.04 * H, look.light, { at: [s * 0.05 * H, -0.18 * H, 0.02 * H], scale: [0.6, 1, 0.9] }))
      if (o) parts.push(P.sphere(0.06 * H, o.color, { at: [0, -0.01 * H, 0] }))
    } else {
      const armColor = look.species === 'panda' ? look.dark : look.fur
      const hand = look.species === 'unicorn' || look.species === 'buffalo' || look.species === 'panda' || look.species === 'pony' ? look.dark : look.species === 'fox' || look.species === 'puppy' ? look.light : look.fur
      parts.push(P.capsule(0.052 * H, 0.09 * H, armColor, { at: [s * 0.025 * H, -0.075 * H, 0], rot: [0, 0, s * 0.35] }))
      parts.push(P.sphere(0.054 * H, hand, { at: [s * 0.05 * H, -0.14 * H, 0.005 * H] }))
      if (o) parts.push(P.sphere(0.068 * H, o.color, { at: [s * 0.004 * H, -0.015 * H, 0] }))
    }
  }

  // ---- The face: big shiny eyes, blush, a smile (or a big open happy mouth) ----
  for (const s of [-1, 1]) {
    const x = s * eyeX
    eyes.push(P.sphere(eyeSize, INK, { at: on(x, eyeY, lift - 0.03 * R), rot: turnTo(x), scale: [0.78, 1, 0.42] }))
    eyesPlain.push(P.sphere(eyeSize * 0.3, WHITE, { at: on(x + s * 0.05 * R, eyeY + 0.08 * R, lift + 0.035 * R) }))
    eyesPlain.push(P.sphere(eyeSize * 0.14, WHITE, { at: on(x - s * 0.05 * R, eyeY - 0.07 * R, lift + 0.035 * R) }))
    if (look.lashes) for (const k of [0, 1]) eyesPlain.push(P.capsule(0.012 * R, 0.07 * R, INK, { at: on(x + s * (0.16 + k * 0.05) * R, eyeY + (0.17 - k * 0.07) * R, lift + 0.01 * R), rot: [0, 0, s * (-0.9 - k * 0.5)] }))
    const blushY = look.species === 'unicorn' || look.species === 'pony' ? -0.08 * R : -0.2 * R
    headPlain.push(P.sphere(0.12 * R, BLUSH, { at: on(s * 0.58 * R, blushY, lift * 0.6 - 0.02 * R), rot: turnTo(s * 0.58 * R), scale: [1.25, 0.65, 0.3] }))
  }
  const mouthPoint = (y: number, z?: number): V3 => (z === undefined ? on(0, y, 0.005 * R) : [0, headY + y, z])
  /** The resting mouth, built around the origin (its group sits at `mouthAt`). */
  const mouth = (at: V3) => {
    mouthAt = at
    if (look.open) {
      rest.push(P.sphere(0.2 * R, MOUTH, { scale: [1.15, 0.72, 0.35] }))
      rest.push(P.sphere(0.1 * R, TONGUE, { at: [0, -0.07 * R, 0.03 * R], scale: [1.3, 0.6, 0.5] }))
    } else rest.push(P.torus(0.075 * R, 0.017 * R, MOUTH, { rot: [0, 0, Math.PI] }, Math.PI))
  }

  // ---- What makes each animal itself ----
  switch (look.species) {
    case 'unicorn': {
      const mane = look.mane ?? [look.fur]
      const m = (i: number) => mane[i % mane.length]
      head.push(P.sphere(R, look.fur, { at: [0, headY, 0] }, 26))
      head.push(P.sphere(0.52 * R, look.light, { at: [0, headY - 0.36 * R, 0.6 * R], scale: [1.05, 0.66, 0.6] }))
      headPlain.push(...[-1, 1].map((s) => P.sphere(0.032 * R, INK, { at: [s * 0.16 * R, headY - 0.27 * R, 0.91 * R], scale: [1, 0.7, 0.6] })))
      mouth(mouthPoint(-0.47 * R, 0.86 * R))
      for (const s of [-1, 1]) {
        head.push(P.cone(0.24 * R, 0.7 * R, look.fur, { at: [s * 0.62 * R, headY + 0.92 * R, 0.0 * R], rot: [-0.1, 0, -s * 0.42] }))
        headPlain.push(P.cone(0.13 * R, 0.44 * R, look.ear ?? look.light, { at: [s * 0.6 * R, headY + 0.87 * R, 0.1 * R], rot: [-0.1, 0, -s * 0.42] }))
      }
      // The horn (gold, with a spiral of rings), the hair cap, the forelock, locks down the back and sides.
      head.push(P.cone(0.15 * R, 0.78 * R, '#FFC83D', { at: [0, headY + 1.12 * R, 0.25 * R], rot: [0.28, 0, 0] }))
      headPlain.push(...[0, 1, 2].map((i) => P.torus(0.12 * R - i * 0.03 * R, 0.022 * R, '#E8A92A', { at: [0, headY + (0.86 + i * 0.17) * R, (0.18 + i * 0.05) * R], rot: [Math.PI / 2 + 0.28, 0, 0] })))
      head.push(P.sphere(0.88 * R, m(0), { at: [0, headY + 0.42 * R, -0.12 * R], scale: [1.05, 0.62, 1.0] }))
      head.push(P.sphere(0.32 * R, m(0), { at: [-0.32 * R, headY + 0.62 * R, 0.62 * R] }), P.sphere(0.27 * R, m(1), { at: [0.02 * R, headY + 0.72 * R, 0.6 * R] }))
      const back = look.hair === 'short' ? 2 : look.hair === 'long' ? 5 : 3
      const sides = look.hair === 'short' ? 0 : look.hair === 'long' ? 5 : 2
      for (let i = 0; i < back; i++) locks.push(P.sphere((0.42 - i * 0.03) * R, m(i + 1), { at: [0.05 * R * (i % 2), headY + (0.15 - i * 0.36) * R, -0.82 * R + i * 0.04 * R] }))
      // Locks down the sides, framing the face (to the shoulders, or down past them for long hair).
      for (const s of [-1, 1]) for (let i = 0; i < sides; i++) locks.push(P.sphere((0.34 - i * 0.02) * R, m(i + (s < 0 ? 2 : 3)), { at: [s * (0.86 + i * 0.03) * R, headY + (0.05 - i * 0.34) * R, (-0.2 - i * 0.04) * R] }))
      const chain: [number, number, number][] = [
        [0.27, -0.16, 0.07],
        [0.23, -0.23, 0.075],
        [0.17, -0.29, 0.075],
        [0.11, -0.31, 0.068],
        [0.06, -0.27, 0.058],
      ]
      chain.forEach(([y, z, r], i) => tail.push(P.sphere(r * H, m(i), { at: [0, y * H, z * H] })))
      break
    }
    case 'panda': {
      head.push(P.sphere(R, look.fur, { at: [0, headY, 0] }, 26))
      for (const s of [-1, 1]) {
        head.push(P.sphere(0.27 * R, look.dark, { at: [s * 0.7 * R, headY + 0.7 * R, -0.12 * R] }))
        headPlain.push(P.sphere(0.15 * R, look.ear ?? '#FFB3C7', { at: [s * 0.68 * R, headY + 0.68 * R, 0.08 * R], scale: [1, 1, 0.4] }))
        head.push(P.sphere(0.3 * R, '#62566A', { at: on(s * eyeX, eyeY - 0.03 * R, -0.12 * R), rot: [0, Math.asin(s * eyeX / R), s * 0.45], scale: [0.85, 1.12, 0.4] }))
      }
      head.push(P.sphere(0.42 * R, look.light, { at: [0, headY - 0.33 * R, 0.62 * R], scale: [1.1, 0.72, 0.7] }))
      head.push(P.sphere(0.1 * R, look.dark, { at: [0, headY - 0.17 * R, 0.96 * R], scale: [1.3, 0.8, 0.8] }))
      mouth(mouthPoint(-0.47 * R, 0.86 * R))
      head.push(P.sphere(0.16 * R, look.fur, { at: [0.05 * R, headY + 0.96 * R, 0.1 * R], scale: [1.4, 0.7, 1] }))
      break
    }
    case 'elephant': {
      head.push(P.sphere(R, look.fur, { at: [0, headY, 0], scale: [1.08, 1, 1] }, 26))
      // Big round ears like fans, pink inside, facing a little forward.
      for (const s of [-1, 1]) {
        head.push(P.sphere(0.62 * R, look.fur, { at: [s * 1.02 * R, headY + 0.08 * R, -0.12 * R], rot: [0, s * 0.45, -s * 0.15], scale: [1, 1.12, 0.26] }))
        headPlain.push(P.sphere(0.46 * R, look.ear ?? look.dark, { at: [s * 1.07 * R, headY + 0.06 * R, -0.03 * R], rot: [0, s * 0.45, -s * 0.15], scale: [1, 1.1, 0.2] }))
      }
      // The trunk: down from the middle of the face, curling up at the tip, with a smile peeking out either side.
      const trunk: [number, number, number][] = [
        [-0.15, 0.88, 0.24],
        [-0.32, 0.98, 0.21],
        [-0.48, 1.05, 0.19],
        [-0.62, 1.14, 0.17],
        [-0.7, 1.27, 0.155],
        [-0.7, 1.4, 0.145],
        [-0.62, 1.5, 0.14],
      ]
      for (const [y, z, r] of trunk) head.push(P.sphere(r * R, look.fur, { at: [0, headY + y * R, z * R] }))
      headPlain.push(P.torus(0.09 * R, 0.035 * R, look.dark, { at: [0, headY - 0.55 * R, 1.56 * R], rot: [-0.9, 0, 0] }))
      mouthAt = on(0, -0.36 * R, 0.01 * R)
      rest.push(P.torus(0.24 * R, 0.022 * R, MOUTH, { rot: [0, 0, Math.PI] }, Math.PI))
      head.push(...[-0.14, 0.04, 0.2].map((x, i) => P.sphere((0.15 - i * 0.02) * R, look.dark, { at: [x * R, headY + (0.95 - i * 0.04) * R, 0.15 * R], scale: [0.8, 1.2, 0.8] })))
      tail.push(P.capsule(0.018 * H, 0.12 * H, look.fur, { at: [0, 0.2 * H, -0.2 * H * round[2]], rot: [-0.5, 0, 0] }))
      tail.push(P.sphere(0.035 * H, look.dark, { at: [0, 0.13 * H, -0.24 * H * round[2]], scale: [1, 1.4, 1] }))
      tailRoot = [0, 0.26 * H, -0.17 * H * round[2]]
      break
    }
    case 'puppy': {
      head.push(P.sphere(R, look.fur, { at: [0, headY, 0], scale: [1.08, 1, 1] }, 26))
      head.push(P.sphere(0.44 * R, look.light, { at: [0, headY - 0.36 * R, 0.66 * R], scale: [1.15, 0.72, 0.75] }))
      head.push(P.sphere(0.14 * R, look.dark, { at: [0, headY - 0.18 * R, 1.0 * R], scale: [1.35, 0.9, 0.8] }))
      mouth(mouthPoint(-0.52 * R, 0.92 * R))
      // Long floppy ears down the sides of the head, a shade darker, and a little tuft on top.
      for (const s of [-1, 1]) head.push(P.sphere(0.38 * R, look.ear ?? look.fur, { at: [s * 0.94 * R, headY - 0.02 * R, -0.04 * R], rot: [0, 0, s * 0.22], scale: [0.58, 1.38, 0.55] }))
      head.push(...[-0.12, 0.1].map((x, i) => P.sphere((0.2 - i * 0.03) * R, look.fur, { at: [x * R, headY + (0.94 - i * 0.04) * R, 0.2 * R], scale: [0.8, 1.2, 0.8] })))
      // A feathery tail that curls up (it wags from its root).
      tailRoot = [0, 0.24 * H, -0.15 * H * round[2]]
      tail.push(P.sphere(0.05 * H, look.fur, { at: [0, 0.3 * H, -0.2 * H * round[2]], rot: [-0.7, 0, 0], scale: [0.8, 1.7, 0.8] }))
      tail.push(P.sphere(0.04 * H, look.light, { at: [0, 0.38 * H, -0.24 * H * round[2]] }))
      break
    }
    case 'pony': {
      const mane = look.mane ?? [look.dark]
      const m = (i: number) => mane[i % mane.length]
      head.push(P.sphere(R, look.fur, { at: [0, headY, 0] }, 26))
      // A long soft muzzle with nostrils, and pointy ears standing up.
      head.push(P.sphere(0.56 * R, look.light, { at: [0, headY - 0.4 * R, 0.62 * R], scale: [1.05, 0.72, 0.76] }))
      headPlain.push(...[-1, 1].map((s) => P.sphere(0.05 * R, INK, { at: [s * 0.2 * R, headY - 0.32 * R, 1.02 * R], scale: [1, 1.3, 0.6] })))
      mouth(mouthPoint(-0.56 * R, 0.9 * R))
      for (const s of [-1, 1]) {
        head.push(P.cone(0.22 * R, 0.62 * R, look.fur, { at: [s * 0.5 * R, headY + 0.98 * R, -0.05 * R], rot: [-0.1, 0, -s * 0.28] }))
        headPlain.push(P.cone(0.12 * R, 0.38 * R, look.ear ?? look.light, { at: [s * 0.49 * R, headY + 0.94 * R, 0.05 * R], rot: [-0.1, 0, -s * 0.28] }))
      }
      // The mane: a forelock, a crest from the forehead over the top and down the back (it fluffs when brushed).
      locks.push(P.sphere(0.3 * R, m(0), { at: [0, headY + 0.74 * R, 0.62 * R], scale: [1, 0.9, 0.8] }))
      for (let i = 0; i < 5; i++) locks.push(P.sphere((0.36 - i * 0.02) * R, m(i + 1), { at: [0, headY + (0.92 - i * 0.36) * R, (0.2 - i * 0.26) * R], scale: [0.85, 1, 1] }))
      tailRoot = [0, 0.26 * H, -0.16 * H]
      ;[[0.27, -0.2, 0.06], [0.22, -0.25, 0.065], [0.16, -0.28, 0.065], [0.1, -0.29, 0.058]].forEach(([y, z, r], i) => tail.push(P.sphere(r * H, m(i), { at: [0, y * H, z * H] })))
      break
    }
    case 'fox': {
      head.push(P.sphere(R, look.fur, { at: [0, headY, 0], scale: [1.1, 1, 1] }, 26))
      for (const s of [-1, 1]) {
        head.push(P.cone(0.36 * R, 0.98 * R, look.fur, { at: [s * 0.58 * R, headY + 0.95 * R, -0.08 * R], rot: [-0.1, 0, -s * 0.38] }))
        headPlain.push(P.cone(0.2 * R, 0.6 * R, look.ear ?? look.light, { at: [s * 0.56 * R, headY + 0.88 * R, 0.06 * R], rot: [-0.1, 0, -s * 0.38] }))
        head.push(P.sphere(0.34 * R, look.light, { at: [s * 0.52 * R, headY - 0.42 * R, 0.55 * R] }))
      }
      head.push(P.sphere(0.3 * R, look.light, { at: [0, headY - 0.36 * R, 0.8 * R], scale: [1.1, 0.8, 0.8] }))
      head.push(P.sphere(0.08 * R, look.dark, { at: [0, headY - 0.22 * R, 1.03 * R], scale: [1.3, 0.85, 0.9] }))
      mouth(mouthPoint(-0.48 * R, 1.0 * R))
      head.push(...[-0.2, 0.05, 0.28].map((x, i) => P.sphere((0.24 - i * 0.03) * R, look.fur, { at: [x * R, headY + (0.82 - i * 0.06) * R, 0.48 * R] })))
      tail.push(P.sphere(0.13 * H, look.fur, { at: [0.05 * H, 0.27 * H, -0.2 * H], rot: [-0.6, 0, 0.25], scale: [0.78, 1.38, 0.78] }))
      tail.push(P.sphere(0.085 * H, look.light, { at: [0.09 * H, 0.42 * H, -0.29 * H] }))
      break
    }
    case 'buffalo': {
      head.push(P.sphere(R, look.fur, { at: [0, headY, 0], scale: [1.1, 0.98, 1] }, 26))
      head.push(P.sphere(0.56 * R, look.light, { at: [0, headY - 0.36 * R, 0.56 * R], scale: [1.25, 0.75, 0.76] }))
      headPlain.push(...[-1, 1].map((s) => P.sphere(0.05 * R, INK, { at: [s * 0.2 * R, headY - 0.28 * R, 0.94 * R], scale: [1.3, 0.8, 0.6] })))
      mouth(mouthPoint(-0.5 * R, 0.9 * R))
      for (const s of [-1, 1]) {
        head.push(P.sphere(0.22 * R, look.fur, { at: [s * 1.02 * R, headY + 0.18 * R, -0.05 * R], rot: [0, 0, -s * 0.35], scale: [1.6, 0.62, 0.42] }))
        headPlain.push(P.sphere(0.13 * R, look.ear ?? BLUSH, { at: [s * 1.05 * R, headY + 0.17 * R, 0.01 * R], rot: [0, 0, -s * 0.35], scale: [1.5, 0.55, 0.3] }))
        // Big curved horns: a quarter circle out from the side of the head and up, with a pointed tip.
        const horn = '#FFF3DC'
        const hr = 0.4 * R
        const hx = s * 0.78 * R
        const hy = headY + 0.42 * R
        const start = s > 0 ? -Math.PI / 2 : Math.PI / 2 + 0.55
        head.push(P.torus(hr, 0.17 * R, horn, { at: [hx, hy + hr, -0.05 * R], rot: [0, 0, start] }, 2.05))
        const end = s > 0 ? -Math.PI / 2 + 2.05 : Math.PI / 2 + 0.55
        head.push(P.cone(0.16 * R, 0.34 * R, horn, { at: [hx + Math.cos(end) * hr, hy + hr + Math.sin(end) * hr + 0.08 * R, -0.05 * R], rot: [0, 0, s > 0 ? 0.45 : -0.45] }))
      }
      head.push(...[-0.15, 0.12].map((x) => P.sphere(0.25 * R, '#7A86B0', { at: [x * R, headY + 0.82 * R, 0.3 * R], scale: [1.2, 0.7, 1] })))
      if (look.extras?.includes('pigtails')) {
        for (const s of [-1, 1]) {
          head.push(P.capsule(0.16 * R, 0.5 * R, '#7A86B0', { at: [s * 1.12 * R, headY - 0.52 * R, -0.02 * R], rot: [0, 0, s * 0.45] }))
          head.push(P.sphere(0.13 * R, '#7A86B0', { at: [s * 1.36 * R, headY - 0.98 * R, 0.02 * R] }))
          head.push(P.cone(0.13 * R, 0.26 * R, '#FF6FAE', { at: [s * 1.12 * R, headY - 0.2 * R, 0.04 * R], rot: [0, 0, s * Math.PI / 2] }))
          head.push(P.cone(0.13 * R, 0.26 * R, '#FF6FAE', { at: [s * 0.9 * R, headY - 0.2 * R, 0.04 * R], rot: [0, 0, -s * Math.PI / 2] }))
        }
      }
      tail.push(P.capsule(0.02 * H, 0.14 * H, look.fur, { at: [0, 0.18 * H, -0.19 * H], rot: [-0.6, 0, 0] }))
      tailRoot = [0, 0.26 * H, -0.15 * H]
      tail.push(P.sphere(0.04 * H, look.dark, { at: [0, 0.1 * H, -0.25 * H], scale: [1, 1.3, 1] }))
      break
    }
    case 'penguin': {
      head.push(P.sphere(R, look.fur, { at: [0, headY, 0] }, 26))
      // A big heart-shaped cream face (two overlapping ovals), dark only over the top and the sides.
      for (const s of [-1, 1]) head.push(P.sphere(0.62 * R, look.light, { at: [s * 0.28 * R, headY - 0.16 * R, 0.48 * R], scale: [1, 1.02, 0.95] }))
      // Talking happens just under the beak.
      mouthAt = [0, headY - (look.open ? 0.25 : 0.33) * R, (look.open ? 1.08 : 1.04) * R]
      if (look.open) {
        head.push(P.cone(0.2 * R, 0.4 * R, look.dark, { at: [0, headY - 0.14 * R, 1.13 * R], rot: [Math.PI / 2, 0, 0], scale: [1.5, 1, 0.65] }))
        head.push(P.cone(0.14 * R, 0.26 * R, look.dark, { at: [0, headY - 0.33 * R, 1.06 * R], rot: [Math.PI / 2 + 0.4, 0, 0], scale: [1.4, 1, 0.6] }))
        rest.push(P.sphere(0.11 * R, MOUTH, { scale: [1.5, 0.6, 0.5] }))
      } else head.push(P.cone(0.18 * R, 0.36 * R, look.dark, { at: [0, headY - 0.2 * R, 1.12 * R], rot: [Math.PI / 2, 0, 0], scale: [1.45, 1, 0.65] }))
      if (look.extras?.includes('tuft')) head.push(...[-0.15, 0.05, 0.24].map((x, i) => P.sphere(0.17 * R, look.fur, { at: [x * R, headY + (1.0 + (i % 2) * 0.1) * R, 0.0], rot: [0, 0, -x * 2.5], scale: [0.7, 1.5, 0.7] })))
      if (!look.extras?.includes('tuft')) head.push(P.sphere(0.18 * R, look.fur, { at: [0.05 * R, headY + 0.93 * R, 0.1 * R], scale: [1.3, 0.6, 1] }))
      break
    }
    case 'hornbill': {
      mouthAt = [0, headY - 0.45 * R, 0.95 * R]
      head.push(P.sphere(R, look.fur, { at: [0, headY, 0] }, 26))
      for (const s of [-1, 1]) head.push(P.sphere(0.42 * R, look.light, { at: [s * 0.42 * R, headY + 0.02 * R, 0.62 * R], scale: [1, 1.05, 0.55] }))
      // The big curved beak (pointing forward and down, narrow, so her face shows) and the casque on top of it.
      head.push(P.cone(0.32 * R, 1.45 * R, look.dark, { at: [0, headY - 0.32 * R, 1.35 * R], rot: [2.05, 0, 0], scale: [0.62, 1, 1.25] }))
      head.push(P.capsule(0.2 * R, 0.55 * R, '#FFD45C', { at: [0, headY + 0.22 * R, 1.0 * R], rot: [Math.PI / 2 + 0.3, 0, 0], scale: [0.65, 1, 0.8] }))
      head.push(P.sphere(0.6 * R, look.light, { at: [0, headY - 0.75 * R, 0.1 * R], scale: [1.15, 0.55, 1] }))
      head.push(...[-0.2, 0.15].map((x) => P.sphere(0.22 * R, look.fur, { at: [x * R, headY + 0.9 * R, -0.15 * R], scale: [1.2, 0.7, 1] })))
      for (const [i, a] of [-0.9, -0.45, 0, 0.45, 0.9].entries()) tail.push(P.sphere(0.07 * H, i % 2 ? look.light : '#EADFCB', { at: [Math.sin(a) * 0.1 * H, 0.2 * H, -0.2 * H - Math.cos(a) * 0.05 * H], rot: [-0.9, a, 0], scale: [0.55, 1.6, 0.3] }))
      break
    }
  }

  // ---- Extras ----
  for (const e of look.extras ?? []) {
    if (e === 'glasses' || e === 'round-glasses') {
      const c = e === 'glasses' ? '#E8A92A' : '#5FBFA0'
      const rr = (e === 'glasses' ? 0.2 : 0.26) * R
      for (const s of [-1, 1]) head.push(P.torus(rr, 0.03 * R, c, { at: on(s * eyeX, eyeY, 0.06 * R), rot: turnTo(s * eyeX) }))
      head.push(P.capsule(0.025 * R, eyeX * 2 - rr * 2, c, { at: on(0, eyeY + 0.03 * R, 0.08 * R), rot: [0, 0, Math.PI / 2] }))
    }
    if (e === 'moustache') for (const s of [-1, 1]) head.push(P.capsule(0.08 * R, 0.24 * R, '#F4EFF4', { at: [s * 0.18 * R, headY - 0.33 * R, 0.95 * R], rot: [0, 0, s * 1.15] }))
    if (e === 'cap') {
      // A cap worn backwards: the dome over the top of the head, the brim sticking out at the back.
      head.push(P.sphere(1.0 * R, '#8FC9F5', { at: [0, headY + 0.32 * R, -0.06 * R], rot: [-0.3, 0, 0], scale: [1.12, 0.72, 1.06] }))
      head.push(P.cyl(0.5 * R, 0.5 * R, 0.06 * R, '#6FB0E6', { at: [0, headY + 0.42 * R, -1.0 * R], rot: [0.35, 0, 0], scale: [1, 1, 1.3] }))
      head.push(P.box(0.5 * R, 0.08 * R, 0.06 * R, '#6FB0E6', { at: [0, headY + 0.5 * R, 0.86 * R], rot: [-0.55, 0, 0] }))
    }
    if (e === 'officer-cap') {
      // A small navy peaked cap high on the crown (the face stays clear): band, flat top, a short brim and a gold badge.
      head.push(P.cyl(0.66 * R, 0.72 * R, 0.3 * R, '#3E4C8A', { at: [0, headY + 0.84 * R, -0.04 * R], rot: [-0.12, 0, 0] }, 24))
      head.push(P.cyl(0.8 * R, 0.72 * R, 0.12 * R, '#4A5A9C', { at: [0, headY + 1.03 * R, -0.07 * R], rot: [-0.12, 0, 0] }, 24))
      head.push(P.cyl(0.52 * R, 0.52 * R, 0.05 * R, '#2B3566', { at: [0, headY + 0.72 * R, 0.62 * R], rot: [0.3, 0, 0], scale: [1, 1, 0.55] }, 20))
      head.push(P.sphere(0.11 * R, '#FFC83D', { at: [0, headY + 0.88 * R, 0.66 * R], scale: [1, 1, 0.5] }))
    }
    if (e === 'scarf') {
      torso.push(P.torus(0.255 * H, 0.05 * H, '#FF8FB8', { at: [0, 0.54 * H, 0.02 * H], rot: [Math.PI / 2, 0, 0] }, Math.PI * 2))
      torso.push(P.rbox(0.09 * H, 0.24 * H, 0.04 * H, 0.015 * H, '#FF8FB8', { at: [0.12 * H, 0.42 * H, 0.27 * H], rot: [0.25, 0, -0.15] }))
    }
    if (e === 'bib') torso.push(P.sphere(0.2 * H, '#A8DCFF', { at: [0, 0.48 * H, 0.2 * H], scale: [1.1, 0.55, 0.45] }))
    if (e === 'phone') {
      // Held in front of the tummy, screen tipped up toward their face (we see its back, and the glow along its edge).
      const at: V3 = [0, 0.42 * H, 0.25 * H * round[2]]
      const a = -2.3
      const tilt: V3 = [a, 0, 0]
      // The screen side faces (0, -sin a, cos a): up and back, toward their eyes.
      const n: V3 = [0, -Math.sin(a), Math.cos(a)]
      const off = (d: number): V3 => [at[0] + n[0] * d, at[1] + n[1] * d, at[2] + n[2] * d]
      phone.push(P.rbox(0.13 * H, 0.21 * H, 0.022 * H, 0.016 * H, '#6B5BA8', { at, rot: tilt }))
      phonePlain.push(P.rbox(0.11 * H, 0.18 * H, 0.006 * H, 0.012 * H, '#BFE9FF', { at: off(0.012 * H), rot: tilt }))
    }
    if (e === 'cane') {
      arm.L.push(P.cyl(0.018 * H, 0.018 * H, 0.42 * H, '#B07A4A', { at: [-0.09 * H, -0.32 * H, 0.04 * H] }))
      arm.L.push(P.torus(0.04 * H, 0.016 * H, '#B07A4A', { at: [-0.06 * H, -0.11 * H, 0.04 * H] }, Math.PI))
    }
    if (isWearable(e)) {
      const w = wornParts(e, f)
      head.push(...w.head)
      headPlain.push(...w.headPlain)
      torso.push(...w.body)
      torsoPlain.push(...w.bodyPlain)
      arm.L.push(...w.armL)
      arm.R.push(...w.armR)
    }
  }

  // ---- Assemble the rig ----
  const root = new Group()
  const body = new Group()
  const headPivot = new Group()
  headPivot.position.y = neck
  const armL = new Group()
  const armR = new Group()
  armL.position.set(-shoulder[0], shoulder[1], shoulder[2])
  armR.position.set(shoulder[0], shoulder[1], shoulder[2])
  root.add(blobShadow((penguin ? 0.3 : 0.2 * c) * H * 1.3, bag), body)
  body.add(solidMix(torso, torsoPlain, bag, px), headPivot, armL, armR)
  const phoneGroup = phone.length ? solidMix(phone, phonePlain, bag, px) : null
  if (phoneGroup) body.add(phoneGroup)
  headPivot.add(solidMix(head, headPlain, bag, px))
  // The eyes pivot at eye height (a blink squashes them flat); the mouths sit at mouthAt.
  const eyeGroup = new Group()
  eyeGroup.position.y = headY + eyeY
  for (const g of [...eyes, ...eyesPlain]) g.translate(0, -(headY + eyeY), 0)
  eyeGroup.add(solidMix(eyes, eyesPlain, bag, px))
  const mouthGroup = new Group()
  const talk = new Group()
  for (const m of [mouthGroup, talk]) m.position.set(...mouthAt)
  if (rest.length) mouthGroup.add(solidMix([], rest, bag, 0))
  talk.add(solidMix([], [P.sphere(0.17 * R, MOUTH, { scale: [1.1, 0.9, 0.35] }), P.sphere(0.09 * R, TONGUE, { at: [0, -0.06 * R, 0.03 * R], scale: [1.3, 0.6, 0.5] })], bag, 0))
  talk.scale.setScalar(0.001)
  talk.visible = false
  headPivot.add(eyeGroup, mouthGroup, talk)
  // A unicorn's locks swing from the top of the back of the head (the wind blows them back), its tail from its root. A
  // pony's mane grows from the top of its head (a brush fluffs it up).
  let maneGroup: Group | null = null
  if (locks.length) {
    maneGroup = pivoted(locks, look.species === 'pony' ? [0, headY + 0.6 * R, 0] : [0, headY + 0.5 * R, -0.6 * R], bag, px)
    headPivot.add(maneGroup)
  }
  armL.add(solidMix(arm.L, [], bag, px))
  armR.add(solidMix(arm.R, [], bag, px))
  let tailGroup: Group | null = null
  if (tail.length) {
    tailGroup = pivoted(tail, look.species === 'unicorn' ? [0, 0.29 * H, -0.15 * H] : tailRoot, bag, px)
    body.add(tailGroup)
  }
  return { root, body, head: headPivot, eyes: eyeGroup, mouth: mouthGroup, talk, open: !!look.open && rest.length > 0, armL, armR, tail: tailGroup, mane: maneGroup, height: H, radius: penguin ? 0.3 * H : 0.16 * H * c, phone: phoneGroup, face: { R, headY, mouth: mouthAt } }
}

/** Parts in a group that pivots at `at` (the parts stay where they were). */
function pivoted(parts: Parts, at: V3, bag: Bag, px: number) {
  const g = new Group()
  g.position.set(...at)
  for (const p of parts) p.translate(-at[0], -at[1], -at[2])
  g.add(solidMix(parts, [], bag, px))
  return g
}

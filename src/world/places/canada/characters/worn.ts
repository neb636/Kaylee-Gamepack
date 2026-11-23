// The team in what she chose in the Team Cabin (looks.ts Worn: a jersey, a hat, a scarf, a cheek stamp), on every
// friend wherever they are: the films (story/cast.ts), the map (map/world.ts), the big game (activities/party/) and the
// cabin itself. The things' shapes are in wear.ts; here is how each one sits on eight very different friends:
//
// - a hat sits on a circle on the head (worn.ts turns each head into a ball: wear.ts's crown units), high enough to
//   clear the ears and antlers that would poke through it, tipped back off the face. HAT_FIT holds each head's numbers,
//   tuned by eye on the fitting sheets (#/world/canada/cabin/dress?fit=hat.crown, activities/cabin/qa.mjs).
// - a jersey goes over the body: the rig friends' capsule and hem with sleeves on the arms, Tuque's middle ball, Lulu's
//   long low body with her wings as sleeves. Gus plays for the geese: no jersey for him.
// - a scarf is the team's pink scarf in her color (Maple's own is part of her look: the same, recolored). Gus has none,
//   so his is a new one round his neck.
// - a cheek stamp (a maple leaf, a heart, a star) on the left cheek, flat on the face.
//
// Misty's team sweater from her bubble bath (mistyLook.ts, the bath's) stays hers: a jersey she picks here tints it if
// the sweater offers `userData.tint(color | null)` on a group named 'misty-sweater'; otherwise this jersey goes over
// it, with her paw print on its front in the berry colors of her look.
//
// Both dressers take off whatever they put on last time first, so they can be called again with a new Worn.
import { Color, Euler, Group, Matrix4, Mesh, SphereGeometry, Vector3, type BufferAttribute, type BufferGeometry, type Intersection, type Object3D } from 'three'
import type { FilmActor } from '../../../engine3d/characters/actor'
import { RACCOON_HEAD } from '../../../engine3d/characters/raccoon'
import { Bag } from '../../../engine3d/dispose'
import { bake, loft, merge, P, solid, solidMix, type LoftRing, type V3 } from '../../../engine3d/geo'
import { BERRIES, mistyLook, WEAR_COLORS, type TeamId, type Worn } from '../looks'
import { CANADA_COLORS } from './looks'
import { mistyCoat } from './mistyLook'
import type { ToyActor } from './toy'
import { cheekParts, crestGeo, hatParts, WHITE, type HatId } from './wear'

/** The name of anything on a toy's head that a hat goes on instead of (Lulu's flick of feathers): hidden under a hat. */
export const UNDER_HAT = 'under-hat'
/** The name of the team's pink scarf group on anyone who wears it (story/cast.ts, tuque.ts, lulu.ts). */
export const TEAM_SCARF = 'team-scarf'

/** Where the cabin's things sit on a hand-built toy: `hat` at the middle of the head (userData.R its radius; userData.cheeks, if her
 *  head isn't a ball, how much wider and deeper it is where a cheek stamp goes), `neck` at
 *  the middle of the ring a scarf goes round (userData.r), `belly` at the middle of the body a jersey goes over (Tuque's
 *  middle ball: userData.r, sx, sy; Lulu's body: rx, ry, rz), her `wings` (a jersey's sleeves), Tuque's floppy `flop`. */
export interface ToySpots {
  hat: Group
  neck: Group
  belly?: Group
  wings?: Group[]
  flop?: Group
}

export type WearKind = keyof Worn

// ---------------------------------------------------------------- fits

interface HatFit {
  /** How high up the head the crown circle sits, in head radii from its middle (0.5 low on the head, 0.9 a little hat
   *  perched on top). */
  y: number
  /** Tipped forward (+) or back (-), and toward their right (+) or left, radians. */
  tilt?: number
  roll?: number
  /** Bigger than the circle on the head, times (a beanie pulled over the ears). */
  grow?: number
  /** Moved after placing, in head radii (forward, up). */
  dz?: number
  dy?: number
}
type Fit = { base: HatFit } & Partial<Record<HatId, Partial<HatFit>>>

/** Each head's hat numbers. The rig heads by species (characters/looks.ts), the toys by who. */
const HAT_FIT: Record<string, Fit> = {
  beaver: { base: { y: 0.56, tilt: -0.14 }, crown: { y: 0.64 }, chef: { y: 0.62 }, flowers: { y: 0.52 }, antlers: { y: 0.5 } },
  moose: { base: { y: 0.74, tilt: -0.1 }, crown: { y: 0.82 }, flowers: { y: 0.8 }, antlers: { y: 0.72 }, chef: { y: 0.8 } },
  raccoon: { base: { y: 0.62, tilt: 0.08 }, crown: { y: 0.7 }, helmet: { y: 0.66, grow: 1.1 }, antlers: { y: 0.55, tilt: 0.05 } },
  'sea-otter': { base: { y: 0.52, tilt: -0.1 }, flowers: { y: 0.48 }, antlers: { y: 0.45 } },
  bear: { base: { y: 0.6, tilt: -0.12 }, crown: { y: 0.66 }, antlers: { y: 0.52 } },
  tuque: { base: { y: 0.64, tilt: -0.06, roll: -0.16 }, flowers: { y: 0.68 }, crown: { y: 0.68 } },
  lulu: { base: { y: 0.55, tilt: -0.16 } },
  gus: { base: { y: 0.58, tilt: -0.12 } },
}

/** How a rig species' head ball is squashed (engine3d/characters/animal.ts builds it this way). */
const HEAD_SCALE: Record<string, V3> = { beaver: [1.08, 1, 1], moose: [0.94, 1.04, 1], raccoon: RACCOON_HEAD, 'sea-otter': [1.12, 0.96, 1], bear: [1.08, 1, 1] }

/** Where a cheek stamp goes on each head (across, up, on the unit head ball before it's squashed). */
const CHEEK_AT: Record<string, [number, number]> = { beaver: [0.6, -0.2], moose: [0.72, -0.08], raccoon: [0.62, -0.34], 'sea-otter': [0.69, -0.14], bear: [0.62, -0.22], tuque: [0.55, -0.2], lulu: [0.6, -0.16] }

const fitOf = (key: string, hat: HatId): HatFit => ({ ...HAT_FIT[key].base, ...HAT_FIT[key][hat] })
/** The hats that cover the top of the head (a hairdo goes under them). */
const COVERS: HatId[] = ['pompom', 'helmet', 'chef']

// ---------------------------------------------------------------- what was put on, to take off again

interface Dressing {
  bag: Bag
  added: Object3D[]
  undo: (() => void)[]
}
const dressings = new WeakMap<object, Dressing>()

function undress(who: object) {
  const d = dressings.get(who)
  if (!d) return
  for (const o of d.added) o.removeFromParent()
  for (const f of d.undo.reverse()) f()
  d.bag.dispose()
  dressings.delete(who)
}
function dressing(who: object, bag: Bag): Dressing {
  const d: Dressing = { bag: bag.add(new Bag()), added: [], undo: [] }
  dressings.set(who, d)
  return d
}

// ---------------------------------------------------------------- colors

const tmpColor = new Color()
/** Paints every vertex of a one-color shape (the team scarf) another color. */
function paint(o: Object3D, hex: string) {
  tmpColor.set(hex)
  o.traverse((m) => {
    if (!(m instanceof Mesh) || m.userData.hull !== undefined) return
    const c = m.geometry.getAttribute('color') as BufferAttribute | undefined
    if (!c) return
    for (let i = 0; i < c.count; i++) c.setXYZ(i, tmpColor.r, tmpColor.g, tmpColor.b)
    c.needsUpdate = true
  })
}

/** The vertices of Maple's own scarf in her torso (they are the only scarf-pink ones there), found once. */
const scarfVerts = new WeakMap<BufferGeometry, number[]>()
function bakedScarf(actor: FilmActor): { geo: BufferGeometry; idx: number[] } | null {
  const torso = actor.rig.body.children.find((c) => c instanceof Group && c.children.some((m) => m instanceof Mesh))
  const mesh = torso?.children.find((m): m is Mesh => m instanceof Mesh && m.userData.hull === undefined)
  if (!mesh) return null
  const geo = mesh.geometry
  let idx = scarfVerts.get(geo)
  if (!idx) {
    idx = []
    const c = geo.getAttribute('color') as BufferAttribute | undefined
    tmpColor.set(CANADA_COLORS.scarf)
    if (c) for (let i = 0; i < c.count; i++) if (Math.abs(c.getX(i) - tmpColor.r) + Math.abs(c.getY(i) - tmpColor.g) + Math.abs(c.getZ(i) - tmpColor.b) < 1e-3) idx.push(i)
    scarfVerts.set(geo, idx)
  }
  return { geo, idx }
}
function paintVerts(geo: BufferGeometry, idx: number[], hex: string) {
  const c = geo.getAttribute('color') as BufferAttribute
  tmpColor.set(hex)
  for (const i of idx) c.setXYZ(i, tmpColor.r, tmpColor.g, tmpColor.b)
  c.needsUpdate = true
}

/** The color of a friend's scarf: hers from the cabin, or the team's pink. */
export const scarfColor = (worn: Worn) => (worn.scarf ? WEAR_COLORS[worn.scarf] : CANADA_COLORS.scarf)

/** The team scarf in a friend's chosen color (story/cast.ts calls it when the scarf is first put on). */
export function tintTeamScarf(scarf: Object3D, worn: Worn) {
  paint(scarf, scarfColor(worn))
}

// ---------------------------------------------------------------- building

/** A hat on a head: its ball's middle `center` (in the parent's space), radius R, squashed by `squash`, fitted by `fit`. */
function placeHat(id: HatId, center: Vector3, R: number, squash: V3, fit: HatFit, bag: Bag) {
  const g = fit.grow ?? 1
  const crown = Math.sqrt(Math.max(0.05, 1 - fit.y * fit.y)) * R
  const unit = crown * g
  const parts = hatParts(id, { k: R / unit, d: (fit.y * R) / unit })
  const holder = new Group()
  const rot = new Euler(fit.tilt ?? 0, 0, -(fit.roll ?? 0))
  const up = new Vector3(0, fit.y * R, 0).applyEuler(rot)
  holder.position.set(center.x + up.x * squash[0], center.y + up.y * squash[1] + (fit.dy ?? 0) * R, center.z + up.z * squash[2] + (fit.dz ?? 0) * R)
  holder.rotation.copy(rot)
  holder.scale.set(unit * squash[0], unit * squash[1], unit * squash[2])
  holder.add(solidMix(parts.lined, parts.plain, bag, 2))
  return holder
}

/** A cheek stamp on a head ball (middle `center`, radius R, squashed), at (x, y) on the unit ball. */
function placeCheek(id: NonNullable<Worn['cheek']>, center: Vector3, R: number, squash: V3, at: [number, number], bag: Bag) {
  const [x, y] = at
  const z = Math.sqrt(Math.max(0, 1 - x * x - y * y))
  const p = new Vector3(x * squash[0], y * squash[1], z * squash[2]).multiplyScalar(R).add(center)
  const n = new Vector3(x / squash[0], y / squash[1], z / squash[2]).normalize()
  const zAxis = n
  const xAxis = new Vector3(0, 1, 0).cross(zAxis).normalize()
  const yAxis = zAxis.clone().cross(xAxis)
  const g = solid(merge(cheekParts(id, 0.42 * R)), bag, 1.2)
  g.matrixAutoUpdate = true
  const m = new Matrix4().makeBasis(xAxis, yAxis, zAxis)
  g.quaternion.setFromRotationMatrix(m)
  g.position.copy(p).addScaledVector(n, 0.01 * R)
  return g
}

/** A rig friend's jersey: over the body (a top and a hem with two white stripes, a white maple leaf on the front, or
 *  Misty's paw print) and a sleeve on each arm. */
function rigJersey(H: number, c: number, color: string, print: string[] | null, bag: Bag) {
  const round: V3 = [c, 1, 1 + (c - 1) * 0.8]
  const lined: BufferGeometry[] = []
  const plain: BufferGeometry[] = []
  lined.push(P.capsule(0.168 * H, 0.1 * H, color, { at: [0, 0.35 * H, 0], scale: round }))
  const hem = (y: number) => 0.19 * H + (0.172 * H - 0.19 * H) * ((y - 0.18 * H) / (0.12 * H))
  lined.push(P.cyl(0.172 * H, 0.19 * H, 0.12 * H, color, { at: [0, 0.24 * H, 0], scale: round }, 24))
  for (const y of [0.2 * H, 0.228 * H]) plain.push(P.torus(hem(y) + 0.002 * H, 0.0095 * H, WHITE, { at: [0, y, 0], rot: [Math.PI / 2, 0, 0], scale: [round[0], round[2], 1] }))
  // The front: a white maple leaf (or Misty's paw print) on the chest, off to the side of a scarf's tail.
  const fx = -0.05 * H
  const r = 0.168 * H
  const fy = 0.41 * H
  const dy = fy - 0.4 * H
  const across = Math.sqrt(Math.max(0, r * r - dy * dy))
  const fz = across * round[2] * Math.sqrt(Math.max(0, 1 - (fx / (across * round[0])) ** 2))
  const turn = Math.atan2(fx / round[0], fz / round[2])
  if (print) {
    for (const g of pawGeo(0.13 * H, print)) plain.push(g.rotateY(turn).translate(fx, fy, fz + 0.001 * H))
  } else plain.push(crestGeo(0.13 * H).rotateY(turn).translate(fx, fy - 0.01 * H, fz - 0.002 * H))
  const body = solidMix(lined, plain, bag, 2)
  const sleeves = ([-1, 1] as const).map((s) =>
    solidMix(
      [P.sphere(0.07 * H, color, { at: [s * 0.006 * H, -0.02 * H, 0] }, 16)],
      [P.torus(0.054 * H, 0.009 * H, WHITE, { at: [s * 0.024 * H, -0.062 * H, 0], rot: [Math.PI / 2, s * 0.35, 0] })],
      bag,
      2,
    ),
  )
  return { body, sleeves }
}

/** A paw print in berry colors (a pad and four toes), `s` across, facing +z. */
function pawGeo(s: number, colors: string[]) {
  const col = (i: number) => (colors.length ? BERRIES[colors[i % colors.length] as keyof typeof BERRIES] ?? WHITE : WHITE)
  const out = [P.sphere(0.34 * s, col(0), { at: [0, -0.1 * s, 0], scale: [1.15, 0.9, 0.18] }, 12)]
  ;[-0.34, -0.12, 0.12, 0.34].forEach((x, i) => out.push(P.sphere(0.13 * s, col(i + 1), { at: [x * s, (0.26 - Math.abs(x) * 0.35) * s, 0], scale: [1, 1.1, 0.18] }, 8)))
  return out
}

// ---------------------------------------------------------------- the rig friends

/** Puts a rig friend in what she chose in the cabin: what it added last time comes off first. */
export function dressWorn(actor: FilmActor, who: TeamId, worn: Worn, bag: Bag): void {
  undress(actor)
  const d = dressing(actor, bag)
  const rig = actor.rig
  const sp = actor.look.species
  const H = rig.height
  const { R, headY } = rig.face
  const squash = HEAD_SCALE[sp] ?? [1, 1, 1]
  const center = new Vector3(0, headY, 0)

  if (worn.hat && HAT_FIT[sp]) {
    // Misty in her bath look: a hat she can't see through (a beanie, a helmet, a chef's hat) has her hairdo tucked
    // under it, so the spikes and puffs don't poke through it; a crown, flowers or antlers sit round it. Whatever she
    // wears on her crown from the mossy log comes off under any hat (it would stand inside it).
    const look = who === 'misty' ? mistyLook() : null
    // (Her fluff stands out from her head: the hat sits on a head that much bigger, a helmet's shell clear of it.)
    const fluff = look ? 1 + (worn.hat === 'helmet' ? 0.16 : 0.07) * look.puff : 1
    const hat = placeHat(worn.hat, center, R * fluff, squash, fitOf(sp, worn.hat), d.bag)
    hat.name = 'cabin-hat'
    rig.head.add(hat)
    d.added.push(hat)
    if (look) {
      const coat = mistyCoat(actor, bag)
      if (COVERS.includes(worn.hat) && coat.hairGroup?.visible) {
        coat.showHair(false)
        d.undo.push(() => coat.showHair(true))
      }
      for (const o of rig.head.children)
        if (o.userData.spot === 'crown' && o.visible) {
          o.visible = false
          d.undo.push(() => (o.visible = true))
        }
    }
  }
  if (worn.cheek && CHEEK_AT[sp]) {
    const cheek = placeCheek(worn.cheek, center, R, squash, CHEEK_AT[sp], d.bag)
    cheek.name = 'cabin-cheek'
    rig.head.add(cheek)
    d.added.push(cheek)
  }
  if (worn.jersey) {
    const color = WEAR_COLORS[worn.jersey]
    const sweater = who === 'misty' ? rig.root.getObjectByName('misty-sweater') : undefined
    if (sweater && typeof sweater.userData.tint === 'function') {
      sweater.userData.tint(color)
      d.undo.push(() => sweater.userData.tint(null))
    } else {
      if (sweater) {
        const was = sweater.visible
        sweater.visible = false
        d.undo.push(() => (sweater.visible = was))
      }
      const look = who === 'misty' ? mistyLook() : null
      const j = rigJersey(H, actor.look.chub ?? 1, color, look?.sweater ? look.print : null, d.bag)
      j.body.name = 'cabin-jersey'
      for (const sl of j.sleeves) sl.name = 'cabin-jersey'
      rig.body.add(j.body)
      rig.armL.add(j.sleeves[0])
      rig.armR.add(j.sleeves[1])
      d.added.push(j.body, ...j.sleeves)
    }
  }
  // The scarf: the team's, in her color (and Maple's own, which is part of her look).
  const team = rig.body.getObjectByName(TEAM_SCARF)
  if (team) {
    paint(team, scarfColor(worn))
    d.undo.push(() => paint(team, CANADA_COLORS.scarf))
  }
  if (actor.look.extras?.includes('scarf')) {
    const baked = bakedScarf(actor)
    if (baked?.idx.length) {
      paintVerts(baked.geo, baked.idx, scarfColor(worn))
      d.undo.push(() => paintVerts(baked.geo, baked.idx, CANADA_COLORS.scarf))
    }
  }
}

// ---------------------------------------------------------------- the hand-built toys

type Dressable = ToyActor & { spots?: ToySpots | null }

/** The same for a hand-built toy (Tuque, Lulu, Gus): each has a `hat` and a `neck` spot. */
export function dressToy(actor: ToyActor, who: TeamId, worn: Worn, bag: Bag): void {
  const spots = (actor as Dressable).spots
  undress(actor)
  if (!spots) return
  const d = dressing(actor, bag)
  const R = (spots.hat.userData.R as number) ?? 0.2
  if (worn.hat && HAT_FIT[who]) {
    // Tuque's is perched on top of his own red tuque ("Two hats!"): it sits on the cap's dome, a ball whose top is a
    // little above the cap's, so the second hat stands on the first instead of sinking into it, tipped jauntily away
    // from the floppy tip, which droops out from under it.
    const tuque = who === 'tuque'
    const center = tuque ? new Vector3(0, 0.65 * R, -0.02 * R) : new Vector3()
    const hat = placeHat(worn.hat, center, tuque ? 0.86 * R : R, [1, 1, 1], fitOf(who, worn.hat), d.bag)
    hat.name = 'cabin-hat'
    spots.hat.add(hat)
    d.added.push(hat)
    const under = actor.root.getObjectByName(UNDER_HAT)
    if (under) {
      under.visible = false
      d.undo.push(() => (under.visible = true))
    }
    const flop = spots.flop
    if (flop) {
      const was = flop.rotation.z
      flop.rotation.z = -0.95
      d.undo.push(() => (flop.rotation.z = was))
    }
  }
  if (worn.cheek && CHEEK_AT[who]) {
    const cheek = placeCheek(worn.cheek, new Vector3(), R, (spots.hat.userData.cheeks as V3 | undefined) ?? [1, 1, 1], CHEEK_AT[who], d.bag)
    cheek.name = 'cabin-cheek'
    spots.hat.add(cheek)
    d.added.push(cheek)
  }
  if (worn.jersey && spots.belly) {
    const color = WEAR_COLORS[worn.jersey]
    const parts = who === 'tuque' ? tuqueJersey(spots.belly.userData, color) : who === 'lulu' ? luluJersey(spots.belly.userData, color) : null
    if (parts) {
      const g = solidMix(parts.lined, parts.plain, d.bag, 2)
      g.name = 'cabin-jersey'
      spots.belly.add(g)
      d.added.push(g)
    }
    for (const [i, w] of (spots.wings ?? []).entries()) {
      const s = i ? 1 : -1
      const H = actor.height
      // (A short sleeve over the front of the wing, from the shoulder: the wing's tip stays bare.)
      const sleeve = solid(P.sphere(0.2 * H, color, { at: [s * 0.022 * H, -0.06 * H, -0.02 * H], scale: [0.31, 0.74, 0.78] }, 14), d.bag, 2)
      sleeve.name = 'cabin-jersey'
      w.add(sleeve)
      d.added.push(sleeve)
    }
  }
  // The scarf: the team's in her color, or (Gus) a new one round his neck.
  const team = actor.root.getObjectByName(TEAM_SCARF)
  if (team) {
    paint(team, scarfColor(worn))
    d.undo.push(() => paint(team, CANADA_COLORS.scarf))
  } else if (worn.scarf) {
    const r = (spots.neck.userData.r as number) ?? 0.08
    const c = WEAR_COLORS[worn.scarf]
    // (A knitted scarf: white stripes round it and across its two tails, so even a blue one never reads as more of
    // his blue captain's band just above it.)
    const tail = (x: number, len: number, rz: number) => {
      const at: V3 = [x, -len / 2 + r * 0.1, r * 1.3]
      const rot: V3 = [0.3, 0, rz]
      return {
        lined: P.rbox(r * 0.75, len, r * 0.3, r * 0.13, c, { at, rot }),
        plain: [0.25, -0.05, -0.35].map((f) => P.box(r * 0.78, r * 0.16, r * 0.33, WHITE, { at: [at[0] - Math.sin(rz) * f * len, at[1] + f * len * Math.cos(rz), at[2] + f * len * 0.3], rot })),
      }
    }
    const tails = [tail(r * 0.5, r * 2.4, -0.16), tail(r * -0.15, r * 2.0, 0.14)]
    const scarf = solidMix(
      [P.torus(r * 1.32, r * 0.52, c, { rot: [Math.PI / 2, 0, 0] }), ...tails.map((t) => t.lined)],
      [P.torus(r * 1.68, r * 0.16, WHITE, { rot: [Math.PI / 2, 0, 0] }), ...tails.flatMap((t) => t.plain)],
      d.bag,
      2,
    )
    scarf.name = 'cabin-scarf'
    spots.neck.add(scarf)
    d.added.push(scarf)
  }
}

/** Tuque's jersey: a sweater over the top half of his middle ball, down to just above the carnival sash, with a white
 *  hem and a leaf on the front. */
function tuqueJersey(u: Record<string, number>, color: string) {
  const r = u.r * 1.07
  const sx = u.sx ?? 1
  const sy = u.sy ?? 1
  const theta = Math.PI / 2 - 0.06
  // (The top of a ball, open at the bottom: a white hem round its edge hides the seam.)
  const lined: BufferGeometry[] = [shellGeo(r, theta, color, [sx, sy, sx])]
  const hy = r * Math.cos(theta) * sy
  const hr = r * Math.sin(theta) * sx
  const plain: BufferGeometry[] = [P.torus(hr, 0.06 * u.r, WHITE, { at: [0, hy, 0], rot: [Math.PI / 2, 0, 0] })]
  const fy = 0.42 * r * sy
  const fz = Math.sqrt(Math.max(0, 1 - (fy / (r * sy)) ** 2)) * r * sx
  plain.push(crestGeo(0.5 * u.r).rotateX(-0.4).translate(0, fy, fz - 0.01 * u.r))
  return { lined, plain }
}

/** Lulu's jersey: a band round her long low body from behind her neck to before her tail, with a leaf on top. */
function luluJersey(u: Record<string, number>, color: string) {
  // (A snug band round her middle, not a shell over her whole back: her white checks show behind it and her tail.)
  const k = 1.03
  const rings: LoftRing[] = []
  const N = 18
  for (const f of [-0.42, -0.34, -0.18, 0, 0.18, 0.34, 0.44]) {
    const z = f * u.rz
    const w = Math.sqrt(Math.max(0.04, 1 - f * f))
    const pts: [number, number][] = []
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2
      pts.push([Math.cos(a) * u.rx * w * k, Math.sin(a) * u.ry * w * k])
    }
    rings.push({ z, pts })
  }
  const lined = [loft(rings, color)]
  const plain: BufferGeometry[] = []
  for (const f of [-0.4, 0.42]) {
    const w = Math.sqrt(1 - f * f) * k
    plain.push(P.torus(1, 0.04, WHITE, { at: [0, 0, f * u.rz], scale: [u.rx * w + 0.002, u.ry * w + 0.002, 0.25 * u.ry] }))
  }
  plain.push(crestGeo(0.5 * u.ry).rotateX(-Math.PI / 2 + 0.25).translate(0, u.ry * k * 0.99, 0.05 * u.rz))
  return { lined, plain }
}

/** The top of a ball down to `theta` from its top, squashed by `scale`. */
const shellGeo = (r: number, theta: number, color: string, scale: V3) => bake(new SphereGeometry(r, 24, 14, 0, Math.PI * 2, 0, theta), color, { scale }, true)

// ---------------------------------------------------------------- where a thing lands

/** Where a thing of `kind` lands on a friend (world): the top of the head, the chest, the neck, the cheek. */
export function wearPoint(actor: FilmActor | ToyActor, kind: WearKind, out = new Vector3()): Vector3 {
  if ('rig' in actor) {
    const rig = actor.rig
    const { R, headY } = rig.face
    const H = rig.height
    if (kind === 'hat') return rig.head.localToWorld(out.set(0, headY + R * 0.95, 0))
    if (kind === 'cheek') return rig.head.localToWorld(out.set(0.6 * R, headY - 0.2 * R, 0.8 * R))
    if (kind === 'scarf') return rig.body.localToWorld(out.set(0, 0.52 * H, 0.15 * H))
    return rig.body.localToWorld(out.set(0, 0.36 * H, 0.17 * H))
  }
  const spots = (actor as Dressable).spots
  if (!spots) return actor.at(0.5, out)
  const R = (spots.hat.userData.R as number) ?? 0.2
  if (kind === 'hat') return spots.hat.localToWorld(out.set(0, R * (spots.flop ? 1.3 : 0.95), 0))
  if (kind === 'cheek') return spots.hat.localToWorld(out.set(0.6 * R, -0.2 * R, 0.8 * R))
  if (kind === 'scarf') return spots.neck.localToWorld(out.set(0, 0, 0))
  return (spots.belly ?? spots.neck).localToWorld(out.set(0, 0, 0))
}

/** Which of the things she put on a friend a ray hit first (`hits`: a raycast against the friend), if any: a tap or a
 *  drag that starts there takes it off. The team's own pink scarf only counts when she gave it a color. */
export function wornAt(actor: FilmActor | ToyActor, worn: Worn, hits: Intersection[]): WearKind | null {
  for (const hit of hits) {
    if (hit.object.userData.hull !== undefined || !hit.object.visible) continue
    for (let o: Object3D | null = hit.object; o && o !== actor.root; o = o.parent) {
      if (o.name === 'cabin-hat') return worn.hat ? 'hat' : null
      if (o.name === 'cabin-cheek') return worn.cheek ? 'cheek' : null
      if (o.name === 'cabin-jersey' || o.name === 'misty-sweater') return worn.jersey ? 'jersey' : null
      if (o.name === TEAM_SCARF || o.name === 'cabin-scarf') return worn.scarf ? 'scarf' : null
    }
    // Maple's own scarf is part of her body: its scarf-colored corners.
    if (worn.scarf && 'rig' in actor && actor.look.extras?.includes('scarf') && hit.face) {
      const b = bakedScarf(actor)
      if (b && hit.object instanceof Mesh && hit.object.geometry === b.geo && b.idx.includes(hit.face.a)) return 'scarf'
    }
    return null
  }
  return null
}

/** What a friend can wear (Gus plays for the geese: a hat and a scarf, no jersey or stamp). */
export const canWear = (who: TeamId, kind: WearKind) => who !== 'gus' || kind === 'hat' || kind === 'scarf'

// Misty in the look from her bubble bath (looks.ts MistyLook; planning/around-the-world/canada-round-2.md): her coat.
// The bath (activities/bath/) changes it live as she rubs, and `dressMisty` puts a saved look on any Misty (the films'
// cast, the map, the big game), so she is the same bear everywhere.
//
// Misty is the chibi rig's bear (engine3d/characters/animal.ts), whose every part is one merged mesh with its colors
// baked into the vertices. Her coat works on those vertices, so everything sits ON her and moves with her:
//   - zones: each fur vertex belongs to one of MISTY_ZONES (head, ears, muzzle, chest, tummy, back, arms, legs), worked
//     out from where it is on her (fur and the cream muzzle can take color; her dark paws take it a little);
//   - mud: every vertex holds its own mud (0..1), so mud comes off where she rubs (`wash`), plus a few flat brown
//     dollops and bits of moss stuck on the surface that shrink as the mud under them goes;
//   - color: each zone takes one berry (`paint`), as much or as little as she likes (k 0..1);
//   - fluff: soft round tufts on the surface that grow with each zone's puff (a giant puffball at 1), never on her face;
//   - hair: a topknot and cheek tufts in four styles (fluff, spikes, bangs, swoop), white or a berry color;
//   - decorations from the mossy log on five spots (crown, each ear, nose, chest);
//   - the white team sweater with the red maple leaf and her berry paw print on the tummy.
// It is built the first time it's asked for, once per actor (`mistyCoat`), on the actor's own bag.
import { Color, DynamicDrawUsage, Euler, Group, IcosahedronGeometry, InstancedMesh, Matrix4, Mesh, Object3D, Quaternion, Vector3, type BufferAttribute, type BufferGeometry } from 'three'
import type { FilmActor } from '../../../engine3d/characters/actor'
import type { Bag } from '../../../engine3d/dispose'
import { smoothstep } from '../../../../sdk/math'
import { P, solidMix, type V3 } from '../../../engine3d/geo'
import { hullGeometry, instancedOutlineMaterial } from '../../../engine3d/outline'
import { toon } from '../../../engine3d/toon'
import { BERRIES, DECO_SPOTS, MISTY_ZONES, type Berry, type Deco, type DecoSpot, type HairStyle, type MistyLook, type MistyZone } from '../looks'
import { CANADA_COLORS } from './looks'

/** How far (in head radii) above her head a crown sits in each hairdo, and anything else worn on the crown spot. */
const CROWN_LIFT: Record<HairStyle, number> = { fluff: 0.2, spikes: 0, bangs: 0.06, swoop: 0.08 }
const TOPKNOT: Record<HairStyle, number> = { fluff: 0.4, spikes: 0.34, bangs: 0.36, swoop: 0.32 }
/** River mud, and the moss in it. */
export const MUD = '#8A5E43'
/** The mud on her fur goes from a dry tan to a wet dark brown in blotches; the dollops on her are darker still. */
const MUD_LIGHT = new Color('#C9A584')
const MUD_DARK = new Color('#7A4C30')
const MUD_SHADES = ['#6E4B35', '#76513A', '#694530', '#7A563D']
const MOSS = '#6FA35A'
const INK = '#2E2233'
/** The sweater's white and red. */
export const SWEATER = '#FFFDF8'
export const SWEATER_RED = '#E8443F'
/** The paw print where she didn't paint the paw: a soft grey-white, so it shows on the white sweater. */
const PLAIN_PRINT = '#E6DDD3'

/** The rig's parts the coat works on (each a pivot with one merged mesh in it). */
export type CoatPart = 'body' | 'head' | 'armL' | 'armR' | 'tail'

interface PartMesh {
  part: CoatPart
  pivot: Object3D
  mesh: Mesh
  geo: BufferGeometry
  pos: Float32Array
  nrm: Float32Array
  base: Float32Array
  /** Zone index per vertex (-1: not hers to change: the nose, the inside of the ears, the blush). */
  zone: Int8Array
  /** 1 fur, 2 the cream muzzle/chest, 3 a dark paw. */
  kind: Uint8Array
  mud: Float32Array
  /** How dark the mud is at each vertex (0 dry tan .. 1 wet brown). */
  shade: Float32Array
  dirty: boolean
  /** The mud dollops and the fluff on this part. */
  blobs: Dot[]
  fluff: Dot[]
  blobMesh: InstancedMesh | null
  fluffMesh: InstancedMesh | null
  fluffHull: InstancedMesh | null
}

interface Dot {
  /** The vertex it sits on (its mud, its zone). */
  v: number
  p: Vector3
  q: Quaternion
  size: number
  color: Color
  zone: number
  /** For fluff: grown to (eases toward the zone's puff). */
  k: number
}

export interface ZoneState {
  color: Berry | null
  k: number
  /** Berries this zone has had, in order (its paw print's stripes, on an arm). */
  had: Berry[]
  puff: number
  wet: number
}

const ZONE_INDEX = Object.fromEntries(MISTY_ZONES.map((z, i) => [z, i])) as Record<MistyZone, number>
const BERRY_COLORS = Object.fromEntries(Object.entries(BERRIES).map(([k, v]) => [k, new Color(v)])) as Record<Berry, Color>
const mudC = new Color()
const tmpC = new Color()
const tmpV = new Vector3()
const Y = new Vector3(0, 1, 0)
const m4 = new Matrix4()
const sclV = new Vector3()

/** Turns +y to `dir` (a part's "out of the surface"), as Euler angles for a P part. */
function rotTo(dir: Vector3, spin = 0): V3 {
  const q = new Quaternion().setFromUnitVectors(Y, dir.clone().normalize())
  if (spin) q.multiply(new Quaternion().setFromAxisAngle(Y, spin))
  const e = new Euler().setFromQuaternion(q, 'XYZ')
  return [e.x, e.y, e.z]
}
const add = (a: V3, d: Vector3, k: number): V3 => [a[0] + d.x * k, a[1] + d.y * k, a[2] + d.z * k]

export class MistyCoat {
  readonly parts: PartMesh[] = []
  readonly zones: Record<MistyZone, ZoneState>
  readonly H: number
  readonly R: number
  readonly headY: number
  /** How round her body is (the rig's chub) and the body's z stretch. */
  private c: number
  private rz: number
  hair: { style: HairStyle; color: Berry | null } = { style: 'fluff', color: null }
  worn: { id: Deco; at: DecoSpot }[] = []
  print: Berry[] = []
  sweaterOn = false
  /** The hairdo's groups, built when first worn (style|color). */
  private hairs = new Map<string, Group>()
  private hairNow: Group | null = null
  private hairShown = true
  /** The hairdos hang off this: it grows a little with the fluff on her head, so the hair sits on top of the puff. */
  private hairRoot = new Group()
  private decos: Group[] = []
  private sweater: { body: Group; armL: Group; armR: Group } | null = null
  private sweaterPrint = ''
  private sweaterPuff = -1
  /** The color a Team Cabin jersey gives the sweater (null: its own white). */
  private sweaterTint: string | null = null
  private fur: Color
  private light: Color
  private dark: Color

  constructor(
    readonly actor: FilmActor,
    private bag: Bag,
  ) {
    const rig = actor.rig
    this.H = rig.height
    this.R = rig.face.R
    this.headY = rig.face.headY
    this.c = actor.look.chub ?? 1
    this.rz = 1 + (this.c - 1) * 0.8
    this.fur = new Color(actor.look.fur)
    this.light = new Color(actor.look.light)
    this.dark = new Color(actor.look.dark)
    this.zones = Object.fromEntries(MISTY_ZONES.map((z) => [z, { color: null, k: 0, had: [], puff: 0, wet: 0 }])) as unknown as Record<MistyZone, ZoneState>
    const meshIn = (g: Object3D | undefined) => (g?.children[0] as Mesh | undefined)?.isMesh ? (g!.children[0] as Mesh) : null
    const add = (part: CoatPart, pivot: Object3D, group: Object3D | undefined) => {
      const mesh = meshIn(group)
      if (mesh) this.parts.push(this.part(part, pivot, mesh))
    }
    rig.head.add(this.hairRoot)
    add('body', rig.body, rig.body.children[0])
    add('head', rig.head, rig.head.children[0])
    add('armL', rig.armL, rig.armL.children[0])
    add('armR', rig.armR, rig.armR.children[0])
    if (rig.tail) add('tail', rig.tail, rig.tail.children[0])
    for (const p of this.parts) this.dots(p)
  }

  /** The meshes a finger ray should hit (no outlines, no tufts). */
  get meshes(): Mesh[] {
    return this.parts.map((p) => p.mesh)
  }
  partOf(mesh: Object3D): PartMesh | undefined {
    return this.parts.find((p) => p.mesh === mesh)
  }

  // ---------------------------------------------------------------- building

  private part(part: CoatPart, pivot: Object3D, mesh: Mesh): PartMesh {
    const geo = mesh.geometry
    const pos = geo.attributes.position.array as Float32Array
    const nrm = geo.attributes.normal.array as Float32Array
    const col = geo.attributes.color as BufferAttribute
    const n = geo.attributes.position.count
    const base = new Float32Array(col.array as Float32Array)
    const zone = new Int8Array(n).fill(-1)
    const kind = new Uint8Array(n)
    const same = (i: number, c: Color) => Math.abs(base[i * 3] - c.r) + Math.abs(base[i * 3 + 1] - c.g) + Math.abs(base[i * 3 + 2] - c.b) < 0.004
    for (let i = 0; i < n; i++) {
      const k = same(i, this.fur) ? 1 : same(i, this.light) ? 2 : same(i, this.dark) && part !== 'head' ? 3 : 0
      if (!k) continue
      kind[i] = k
      zone[i] = ZONE_INDEX[this.zoneAt(part, tmpV.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]), k)]
    }
    // Blotches: a smooth wobble over her surface, so the mud is patchy (the same on every Misty).
    const shade = new Float32Array(n)
    const k = 9 / this.H
    for (let i = 0; i < n; i++) {
      const x = pos[i * 3] * k
      const y = pos[i * 3 + 1] * k
      const z = pos[i * 3 + 2] * k
      const w = Math.sin(x * 1.7 + y * 0.9) + Math.sin(y * 2.3 - z * 1.3 + 1.7) + Math.sin(z * 1.9 + x * 1.1 + 4.1)
      // (Wading: the mud is thickest low down on her legs and tummy, and thins out going up.)
      const low = part === 'body' ? 1 - smoothstep(0.1 * this.H, 0.36 * this.H, pos[i * 3 + 1]) : 0
      // (Her head only gets the dusting and the splats: a soft brown patch there reads as a bruise.)
      shade[i] = part === 'head' ? 0.3 : Math.min(1, Math.max(0, 0.42 + w * 0.22 + low * 0.6))
      // (Her face stays mostly clean round the eyes and the smile: a light dusting there, never a splat over her eyes.)
      if (part === 'head' && pos[i * 3 + 2] > 0.35 * this.R && Math.abs(pos[i * 3]) < 0.62 * this.R && Math.abs(pos[i * 3 + 1] - this.headY) < 0.5 * this.R) shade[i] *= 0.35
    }
    return { part, pivot, mesh, geo, pos, nrm, base, zone, kind, shade, mud: new Float32Array(n), dirty: true, blobs: [], fluff: [], blobMesh: null, fluffMesh: null, fluffHull: null }
  }

  /** Which zone a point on a part is in (part-local meters). `kind` 2: the cream muzzle on the head. */
  zoneAt(part: CoatPart, p: Vector3, kind = 1): MistyZone {
    const { H, R, headY } = this
    if (part === 'armL' || part === 'armR') return part
    if (part === 'tail') return 'back'
    if (part === 'head') {
      if (kind === 2) return 'muzzle'
      if (Math.hypot(Math.abs(p.x) - 0.74 * R, p.y - headY - 0.7 * R, (p.z + 0.08 * R) / 0.7) < 0.33 * R) return p.x < 0 ? 'earL' : 'earR'
      return 'head'
    }
    if (p.y < 0.2 * H && Math.abs(p.x) > 0.03 * H) return p.x < 0 ? 'legL' : 'legR'
    if (p.z < -0.07 * H) return 'back'
    return p.y > 0.42 * H ? 'chest' : 'tummy'
  }

  /** The dollops of mud and the tufts of fluff on a part: on fur vertices spread out over its surface. */
  private dots(p: PartMesh) {
    const { H, R, headY } = this
    const n = p.zone.length
    const picked: number[] = []
    const gap = p.part === 'head' ? 0.3 * R : 0.055 * H
    const at = (i: number) => tmpV.set(p.pos[i * 3], p.pos[i * 3 + 1], p.pos[i * 3 + 2])
    // A seeded walk through the vertices, so every Misty gets the same dots.
    let seed = 7 + p.part.length * 13
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    const order = Array.from({ length: n }, (_, i) => i).sort(() => rnd() - 0.5)
    for (const i of order) {
      if (p.kind[i] !== 1 && p.kind[i] !== 2) continue
      const v = at(i)
      const nz = p.nrm[i * 3 + 2]
      const ny = p.nrm[i * 3 + 1]
      // Only on the outside of the shape (not where one part sits inside another: the top of a leg in the body).
      if (p.part === 'body' && (v.y < 0.04 * H || (v.y < 0.2 * H && Math.abs(v.x) < 0.04 * H))) continue
      if (p.part === 'body' && ny < -0.5) continue
      if (p.part === 'head' && v.y < headY - 0.75 * R && nz < 0.6) continue
      if (picked.some((j) => Math.hypot(p.pos[j * 3] - v.x, p.pos[j * 3 + 1] - v.y, p.pos[j * 3 + 2] - v.z) < gap)) continue
      picked.push(i)
    }
    for (const i of picked) {
      const v = at(i).clone()
      const nn = new Vector3(p.nrm[i * 3], p.nrm[i * 3 + 1], p.nrm[i * 3 + 2]).normalize()
      const z = p.zone[i]
      const zoneId = MISTY_ZONES[z]
      // Mud everywhere she's muddy (not on the muzzle's middle, so her smile still shows).
      const onFace = p.part === 'head' && v.z > 0.45 * R && Math.abs(v.x) < 0.55 * R && v.y < headY + 0.3 * R
      // (A clump here and there, not a spot on every patch: a third of the places get one, a few of them moss.)
      // (A splat here and there, each with a drop or two flicked off beside it: a few on her head, more on her body.)
      if (!onFace && rnd() < (p.part === 'head' ? 0.13 : 0.17)) {
        const s = (p.part === 'head' ? 0.15 * R : 0.036 * H) * (0.7 + rnd() * 0.7)
        const q = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), nn).multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), rnd() * 6))
        const moss = p.part !== 'head' && rnd() < 0.1
        const color = new Color(moss ? MOSS : MUD_SHADES[Math.floor(rnd() * MUD_SHADES.length)])
        const at = v.clone().addScaledVector(nn, s * 0.06)
        p.blobs.push({ v: i, p: at, q, size: s, color, zone: z, k: 1 })
        if (!moss) {
          const ta = new Vector3(1, 0, 0).applyQuaternion(q)
          const tb = new Vector3(0, 1, 0).applyQuaternion(q)
          const drops = 1 + Math.floor(rnd() * 2)
          for (let d = 0; d < drops; d++) {
            const a = rnd() * Math.PI * 2
            const r = s * (1.35 + rnd() * 0.5)
            const dp = at.clone().addScaledVector(ta, Math.cos(a) * r * 1.2).addScaledVector(tb, Math.sin(a) * r * 0.8)
            // (Snapped onto her: the nearest fur vertex there, so no drop hangs off her outline in the air.)
            let best = -1
            let bd = Infinity
            for (let j = 0; j < n; j++) {
              if (p.kind[j] !== 1 && p.kind[j] !== 2) continue
              const dd = (p.pos[j * 3] - dp.x) ** 2 + (p.pos[j * 3 + 1] - dp.y) ** 2 + (p.pos[j * 3 + 2] - dp.z) ** 2
              if (dd < bd) ((bd = dd), (best = j))
            }
            if (best < 0) continue
            const bn = new Vector3(p.nrm[best * 3], p.nrm[best * 3 + 1], p.nrm[best * 3 + 2]).normalize()
            const ds = s * (0.22 + rnd() * 0.18)
            const bq = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), bn)
            p.blobs.push({ v: best, p: new Vector3(p.pos[best * 3], p.pos[best * 3 + 1], p.pos[best * 3 + 2]).addScaledVector(bn, ds * 0.06), q: bq, size: ds, color, zone: p.zone[best], k: 1 })
          }
        }
      }
      // Fluff: never on her face, round the eyes or on the muzzle (the cheek tufts are her hairdo), nor under her chin
      // where the team's scarf sits.
      const face = p.part === 'head' && (p.kind[i] === 2 || (v.z > 0.2 * R && Math.abs(v.x) < 0.8 * R && v.y < headY + 0.62 * R))
      const neck = p.part === 'body' && v.y > 0.49 * H
      if (!face && !neck && zoneId !== 'muzzle') {
        const s = (p.part === 'head' ? 0.22 * R : p.part === 'body' ? 0.066 * H : 0.042 * H) * (0.85 + rnd() * 0.3)
        p.fluff.push({ v: i, p: v.clone().addScaledVector(nn, -s * 0.35), q: new Quaternion(), size: s, color: new Color(), zone: z, k: 0 })
      }
    }
    const { bag } = this
    if (p.blobs.length) {
      const geo = bag.add(new IcosahedronGeometry(1, 1))
      const mesh = bag.add(new InstancedMesh(geo, toon('#ffffff'), p.blobs.length))
      mesh.instanceMatrix.setUsage(DynamicDrawUsage)
      mesh.frustumCulled = false
      mesh.raycast = () => {}
      p.blobs.forEach((b, j) => mesh.setColorAt(j, b.color))
      p.pivot.add(mesh)
      p.blobMesh = mesh
    }
    if (p.fluff.length) {
      const geo = bag.add(new IcosahedronGeometry(1, 2))
      const mesh = bag.add(new InstancedMesh(geo, toon('#ffffff'), p.fluff.length))
      mesh.instanceMatrix.setUsage(DynamicDrawUsage)
      mesh.frustumCulled = false
      mesh.raycast = () => {}
      const hull = bag.add(new InstancedMesh(bag.add(hullGeometry(geo)), instancedOutlineMaterial(this.H >= 1 ? 2.5 : 2), p.fluff.length))
      hull.instanceMatrix = mesh.instanceMatrix
      hull.frustumCulled = false
      hull.raycast = () => {}
      p.fluff.forEach((_, j) => mesh.setColorAt(j, this.fur))
      p.pivot.add(mesh, hull)
      p.fluffMesh = mesh
      p.fluffHull = hull
    }
  }

  // ---------------------------------------------------------------- changing her

  /** Mud everywhere (k 1: a brown, mossy lump), or none (0). */
  setMud(k: number) {
    for (const p of this.parts) {
      for (let i = 0; i < p.mud.length; i++) p.mud[i] = p.zone[i] >= 0 ? k : 0
      p.dirty = true
    }
  }
  /** Rubs mud off round a point (in `part`'s local meters; `r` meters), down to `floor` (the sponge loosens it, the rain
   *  rinses it away). Returns how much came off. */
  wash(part: CoatPart | 'any', local: Vector3 | null, r: number, amount: number, floor = 0) {
    let off = 0
    for (const p of this.parts) {
      if (part !== 'any' && p.part !== part && !(part === 'body' && p.part === 'tail')) continue
      for (let i = 0; i < p.mud.length; i++) {
        if (p.mud[i] <= floor) continue
        let w = 1
        if (local) {
          const d = Math.hypot(p.pos[i * 3] - local.x, p.pos[i * 3 + 1] - local.y, p.pos[i * 3 + 2] - local.z)
          if (d > r) continue
          w = 1 - (d / r) ** 2
        }
        const before = p.mud[i]
        p.mud[i] = Math.max(floor, before - amount * w)
        off += before - p.mud[i]
      }
      p.dirty = true
    }
    return off
  }
  /** Rinses mud off wherever `where` says (0..1 for a point in the world: the rain under her cloud), `amount` at 1.
   *  Returns how much came off. */
  washWhere(where: (x: number, y: number, z: number) => number, amount: number, floor = 0) {
    let off = 0
    for (const p of this.parts) {
      const e = p.pivot.matrixWorld.elements
      let hit = false
      for (let i = 0; i < p.mud.length; i++) {
        if (p.mud[i] <= floor) continue
        const x = p.pos[i * 3]
        const y = p.pos[i * 3 + 1]
        const z = p.pos[i * 3 + 2]
        const w = where(e[0] * x + e[4] * y + e[8] * z + e[12], e[1] * x + e[5] * y + e[9] * z + e[13], e[2] * x + e[6] * y + e[10] * z + e[14])
        if (w <= 0) continue
        const before = p.mud[i]
        p.mud[i] = Math.max(floor, before - amount * w)
        off += before - p.mud[i]
        hit = true
      }
      if (hit) p.dirty = true
    }
    return off / 400
  }
  /** Washes a whole zone toward `floor`. */
  washZone(zone: MistyZone, amount: number, floor = 0) {
    const zi = ZONE_INDEX[zone]
    for (const p of this.parts) {
      let hit = false
      for (let i = 0; i < p.mud.length; i++) if (p.zone[i] === zi && p.mud[i] > floor) ((p.mud[i] = Math.max(floor, p.mud[i] - amount)), (hit = true))
      if (hit) p.dirty = true
    }
  }
  /** How muddy a zone still is (0..1, its fur's mean), or her whole front (the zones she can see). */
  mudOf(zone?: MistyZone) {
    let sum = 0
    let n = 0
    const zi = zone ? ZONE_INDEX[zone] : -2
    for (const p of this.parts) {
      for (let i = 0; i < p.mud.length; i++) {
        const z = p.zone[i]
        if (z < 0 || (zi >= 0 && z !== zi) || (zi === -2 && z === ZONE_INDEX.back)) continue
        sum += p.mud[i]
        n++
      }
    }
    return n ? sum / n : 0
  }
  /** How muddy her fur is right at a point on a part (part-local meters): the nearest of its vertices. */
  mudNear(part: CoatPart, local: Vector3) {
    const p = this.parts.find((q) => q.part === part)
    if (!p) return 0
    let best = Infinity
    let mud = 0
    for (let i = 0; i < p.mud.length; i++) {
      if (p.zone[i] < 0) continue
      const d = (p.pos[i * 3] - local.x) ** 2 + (p.pos[i * 3 + 1] - local.y) ** 2 + (p.pos[i * 3 + 2] - local.z) ** 2
      if (d < best) ((best = d), (mud = p.mud[i]))
    }
    return mud
  }
  /** The muddiest spot left (part, local point), for the sparkle that helps her find it. */
  muddiest(): { part: PartMesh; local: Vector3; mud: number } | null {
    let best: { part: PartMesh; local: Vector3; mud: number } | null = null
    for (const p of this.parts) {
      if (p.part === 'tail') continue
      for (const b of p.blobs) {
        const m = p.mud[b.v]
        // (Only spots the camera sees: the front.)
        if (p.nrm[b.v * 3 + 2] < 0.2) continue
        if (!best || m > best.mud + 0.05) best = { part: p, local: b.p, mud: m }
      }
    }
    return best && best.mud > 0.08 ? best : null
  }

  /** Paints a zone with a berry (k grows by `dk`; another berry takes over the zone as it's rubbed in). */
  paint(zone: MistyZone, berry: Berry, dk: number) {
    const z = this.zones[zone]
    if (z.color !== berry) {
      // Rubbing a new color over an old one: the old one fades out first, then the new one comes in.
      if (z.color && z.k > 0.05) z.k = Math.max(0, z.k - dk * 1.5)
      if (!z.color || z.k <= 0.05) ((z.color = berry), (z.k = Math.min(1, dk)))
    } else z.k = Math.min(1, z.k + dk)
    if (z.color === berry && z.had[z.had.length - 1] !== berry) {
      z.had = [...z.had.filter((b) => b !== berry), berry].slice(-3)
    }
    this.dirtyZone(zone)
  }
  /** Fluffs a zone up (puff grows by `dk`), and dries it. */
  fluff(zone: MistyZone, dk: number) {
    const z = this.zones[zone]
    z.puff = Math.min(1, Math.max(0, z.puff + dk))
    if (dk > 0) z.wet = Math.max(0, z.wet - dk * 3)
    this.dirtyZone(zone)
  }
  /** Wet fur (the rain): a little darker and cooler until the towel dries it. */
  wet(zone: MistyZone | 'all', k: number) {
    for (const z of zone === 'all' ? MISTY_ZONES : [zone]) this.zones[z].wet = Math.max(0, Math.min(1, k))
    for (const p of this.parts) p.dirty = true
  }
  private dirtyZone(zone: MistyZone) {
    const zi = ZONE_INDEX[zone]
    for (const p of this.parts) if (p.zone.includes(zi)) p.dirty = true
  }
  /** How fluffy she is, all over (0..1). */
  get puff() {
    const zs = MISTY_ZONES.filter((z) => z !== 'muzzle')
    return zs.reduce((s, z) => s + this.zones[z].puff, 0) / zs.length
  }

  /** Her hairdo: a style and a color (null: her own white). */
  setHair(style: HairStyle, color: Berry | null) {
    this.hair = { style, color }
    const key = `${style}|${color ?? ''}`
    let g = this.hairs.get(key)
    if (!g) {
      g = this.buildHair(style, color)
      g.visible = false
      this.hairRoot.add(g)
      this.hairs.set(key, g)
    }
    if (this.hairNow && this.hairNow !== g) this.hairNow.visible = false
    this.hairNow = g
    g.visible = this.hairShown
    // (Whatever's on the crown spot moves to sit on the new hairdo.)
    if (this.worn.some((w) => w.at === 'crown')) this.setWorn(this.worn)
  }
  /** Shows or hides the hairdo (a muddy Misty has none yet). */
  showHair(on: boolean) {
    this.hairShown = on
    if (this.hairNow) this.hairNow.visible = on
  }
  get hairGroup() {
    return this.hairNow
  }

  /** What she wears from the mossy log (one thing a spot; a new one on a spot takes the old one's place). */
  setWorn(list: { id: Deco; at: DecoSpot }[]) {
    const bySpot = new Map<DecoSpot, Deco>()
    for (const w of list) bySpot.set(w.at, w.id)
    this.worn = [...bySpot].map(([at, id]) => ({ id, at }))
    for (const d of this.decos) d.removeFromParent()
    this.decos = this.worn.map((w) => {
      const g = this.buildDeco(w.id, w.at)
      return g
    })
  }
  /** Puts one more on (returns its group, so the bath can pop it in). */
  wear(id: Deco, at: DecoSpot) {
    this.setWorn([...this.worn.filter((w) => w.at !== at), { id, at }])
    return this.decos[this.worn.findIndex((w) => w.at === at)]
  }
  /** Where a spot is: its pivot, the point on her (pivot-local) and the way out of her there. */
  spot(at: DecoSpot, id?: Deco): { pivot: Object3D; p: Vector3; n: Vector3 } {
    const { H, R, headY } = this
    const rig = this.actor.rig
    const onHead = (x: number, y: number, lift = 0) => {
      const z = Math.sqrt(Math.max(0, 1 - (x / 1.08) ** 2 - y * y))
      const p = new Vector3(x * R, headY + y * R, z * R)
      const n = new Vector3(x / (1.08 * 1.08), y, z).normalize()
      return { pivot: rig.head, p: p.addScaledVector(n, lift * R), n }
    }
    // (Out past her fluff, so a crown or a flower sits on top of a puffball instead of sinking into it.)
    const out = (zone: MistyZone) => 0.15 * Math.pow(this.zones[zone].puff, 0.7)
    if (at === 'crown') {
      // With a hairdo on, a crown rides up round the topknot (a bun pokes out of its middle), and anything else sits on
      // top of the topknot, where it shows from the front, instead of inside it.
      const style = this.hairNow && this.hairShown ? this.hair.style : null
      const hair = !style ? 0 : id === 'crown' ? CROWN_LIFT[style] : TOPKNOT[style]
      return onHead(0, 0.97, -0.02 + out('head') + hair)
    }
    if (at === 'earL') return onHead(-0.6, 0.62, -0.02 + out('earL'))
    if (at === 'earR') return onHead(0.6, 0.62, -0.02 + out('earR'))
    if (at === 'nose') return { pivot: rig.head, p: new Vector3(0, headY - 0.14 * R, 1.1 * R), n: new Vector3(0, 0.15, 1).normalize() }
    // The chest: on the sweater if she has it on, on her fur if not.
    const y = 0.47 * H
    const z = this.frontZ(0.075 * H, y) + (this.sweaterOn ? 0.036 * H : 0.045 * H * Math.pow(this.zones.chest.puff, 0.7))
    return { pivot: rig.body, p: new Vector3(0.075 * H, y, z), n: new Vector3(0.3, 0.15, 1).normalize() }
  }
  /** The nearest spot to a point in the world (a decoration she drops). */
  nearestSpot(world: Vector3): DecoSpot {
    let best: DecoSpot = 'crown'
    let d = Infinity
    for (const s of DECO_SPOTS) {
      const sp = this.spot(s)
      const w = sp.pivot.localToWorld(sp.p.clone())
      const dd = w.distanceTo(world) * (s === 'nose' ? 1.4 : 1)
      if (dd < d) ((d = dd), (best = s))
    }
    return best
  }

  /** The team sweater on (or off), with her paw print in `print`'s colors. */
  setSweater(on: boolean, print: Berry[] = this.print) {
    this.sweaterOn = on
    this.print = print.slice(0, 3)
    const key = this.print.join('.')
    if (on && (!this.sweater || key !== this.sweaterPrint)) {
      this.dropSweater()
      this.sweater = this.buildSweater(this.print)
      if (this.sweaterTint) this.tintSweater(this.sweaterTint)
      this.sweaterPrint = key
    }
    if (this.sweater) for (const g of Object.values(this.sweater)) g.visible = on
    // The chest decoration moves out onto the sweater (or back onto her fur).
    if (this.worn.some((w) => w.at === 'chest')) this.setWorn(this.worn)
    for (const p of this.parts) p.dirty = true
  }
  private dropSweater() {
    if (!this.sweater) return
    for (const g of Object.values(this.sweater)) g.removeFromParent()
    this.sweater = null
  }

  /** Back to the plain white bear: no mud, no color, no fluff, no hairdo, nothing worn, no sweater. */
  clear() {
    for (const z of MISTY_ZONES) Object.assign(this.zones[z], { color: null, k: 0, had: [], puff: 0, wet: 0 })
    this.setMud(0)
    this.setWorn([])
    this.setSweater(false, [])
    this.hair = { style: 'fluff', color: null }
    if (this.hairNow) this.hairNow.visible = false
    this.hairNow = null
    for (const p of this.parts) for (const f of p.fluff) f.k = 0
  }

  /** Puts a saved look on her (null: the plain white bear). */
  apply(look: MistyLook | null) {
    this.clear()
    if (!look) return this.refresh(true)
    for (const z of MISTY_ZONES) {
      const f = look.fur[z]
      if (f) Object.assign(this.zones[z], { color: f.c, k: f.k, had: [f.c] })
      this.zones[z].puff = z === 'muzzle' ? 0 : look.puff
    }
    // (The arm she pressed onto the sweater had these berries on it.)
    if (look.print.length) this.zones.armR.had = [...look.print]
    this.setHair(look.hair.style, look.hair.color)
    this.setWorn(look.worn)
    this.setSweater(look.sweater, look.print)
    this.refresh(true)
  }
  /** The look as it is now (to save, or to put in a link). */
  look(): MistyLook {
    const fur: MistyLook['fur'] = {}
    for (const z of MISTY_ZONES) {
      const s = this.zones[z]
      if (s.color && s.k > 0.08) fur[z] = { c: s.color, k: Math.round(s.k * 9) / 9 }
    }
    return { fur, puff: Math.round(this.puff * 9) / 9, hair: { ...this.hair }, worn: this.worn.map((w) => ({ ...w })), print: [...this.print], sweater: this.sweaterOn }
  }
  /** The berries on a paw (what it prints): the arm's, oldest first, or none if she never painted it. */
  pawColors(arm: 'armL' | 'armR'): Berry[] {
    const z = this.zones[arm]
    return z.color && z.k > 0.08 ? (z.had.length ? z.had : [z.color]) : []
  }

  // ---------------------------------------------------------------- every frame

  /** Writes the colors where something changed, and eases the fluff toward each zone's puff (`snap`: at once). */
  refresh(snap = false, dt = 0.016, t = 0) {
    for (const p of this.parts) {
      if (p.dirty) this.paintPart(p)
      this.placeDots(p, snap, dt, t)
    }
    const hp = Math.pow(this.zones.head.puff, 0.7)
    if (Math.abs(this.hairRoot.scale.x - (1 + 0.14 * hp)) > 0.002) {
      const k = 1 + 0.14 * hp
      this.hairRoot.scale.setScalar(k)
      this.hairRoot.position.set(0, this.headY * (1 - k), 0)
    }
    const pf = this.puff
    if (this.sweater && Math.abs(pf - this.sweaterPuff) > 0.01) {
      this.sweaterPuff = pf
      const k = 1 + 0.09 * pf
      this.sweater.body.scale.set(k, 1 + 0.03 * pf, k)
    }
  }
  update(dt: number, t: number) {
    this.refresh(false, dt, t)
  }

  /** A vertex's color now: its own, then the zone's berry, wet, mud. */
  private colorOf(p: PartMesh, i: number, out: Color, mud = true) {
    out.setRGB(p.base[i * 3], p.base[i * 3 + 1], p.base[i * 3 + 2])
    const z = p.zone[i]
    if (z < 0) return out
    const s = this.zones[MISTY_ZONES[z]]
    if (s.color && s.k > 0) out.lerp(BERRY_COLORS[s.color], s.k * (p.kind[i] === 3 ? 0.7 : p.kind[i] === 2 ? 0.85 : 0.95))
    if (s.wet > 0) out.multiplyScalar(1 - 0.12 * s.wet)
    if (mud && p.mud[i] > 0) {
      // A light dusty coat that her white shows through, a little thicker in soft patches; the round chocolate splats
      // stuck on her (the dollops, placeDots) do the rest. So she reads as a white bear splattered with mud, not a grey
      // or brown bear.
      const blot = smoothstep(0.5, 0.95, p.shade[i])
      const cover = p.kind[i] === 3 ? 0.3 : (p.kind[i] === 2 ? 0.2 : 0.28) + 0.62 * blot
      out.lerp(mudC.copy(MUD_LIGHT).lerp(MUD_DARK, blot * 0.85), Math.min(1, p.mud[i] * 1.1) * cover)
    }
    return out
  }
  private paintPart(p: PartMesh) {
    p.dirty = false
    const col = p.geo.attributes.color as BufferAttribute
    const a = col.array as Float32Array
    for (let i = 0; i < p.zone.length; i++) {
      if (p.zone[i] < 0) continue
      this.colorOf(p, i, tmpC)
      a[i * 3] = tmpC.r
      a[i * 3 + 1] = tmpC.g
      a[i * 3 + 2] = tmpC.b
    }
    col.needsUpdate = true
    // The fluff takes its zone's color (without the mud: the mud's gone by the time she's fluffy).
    if (p.fluffMesh) {
      p.fluff.forEach((f, j) => p.fluffMesh!.setColorAt(j, this.colorOf(p, f.v, tmpC, false)))
      if (p.fluffMesh.instanceColor) p.fluffMesh.instanceColor.needsUpdate = true
    }
  }
  private placeDots(p: PartMesh, snap: boolean, dt: number, t: number) {
    if (p.blobMesh) {
      let n = 0
      for (const b of p.blobs) {
        const k = Math.min(1, p.mud[b.v] * 1.25)
        b.k += snap ? k - b.k : (k - b.k) * Math.min(1, dt * 10)
        if (b.k < 0.04) continue
        sclV.set(b.size * b.k * 1.3, b.size * b.k * 0.7, b.size * 0.4 * b.k)
        p.blobMesh.setMatrixAt(n, m4.compose(b.p, b.q, sclV))
        p.blobMesh.setColorAt(n, b.color)
        n++
      }
      p.blobMesh.count = n
      p.blobMesh.instanceMatrix.needsUpdate = true
      if (p.blobMesh.instanceColor) p.blobMesh.instanceColor.needsUpdate = true
    }
    if (p.fluffMesh) {
      let n = 0
      // Under the sweater, the fluff on her body stays inside it.
      const hidden = this.sweaterOn && p.part === 'body'
      for (const [j, f] of p.fluff.entries()) {
        const zone = MISTY_ZONES[f.zone]
        const want = hidden && zone !== 'legL' && zone !== 'legR' ? 0 : this.zones[zone].puff
        f.k += snap ? want - f.k : (want - f.k) * Math.min(1, dt * 6)
        const s = f.size * Math.pow(Math.max(0, f.k), 0.7) * (1 + 0.04 * Math.sin(t * 3 + j))
        // (Index order is kept, so each tuft keeps its color slot.)
        p.fluffMesh.setMatrixAt(j, m4.compose(f.p, f.q, sclV.set(s, s, s)))
        if (f.k > 0.02) n = j + 1
      }
      p.fluffMesh.count = n
      p.fluffHull!.count = n
      p.fluffMesh.instanceMatrix.needsUpdate = true
    }
  }

  // ---------------------------------------------------------------- her things

  /** How far forward the front of her body is at (x, y), body-local (her round capsule of a tummy). */
  frontZ(x: number, y: number) {
    const { H } = this
    const r = 0.155 * H
    const dy = Math.max(0, Math.abs(y - 0.34 * H) - 0.05 * H)
    const rr = Math.max(0, r * r - dy * dy)
    return this.rz * Math.sqrt(Math.max(0, rr - (x / this.c) ** 2))
  }

  /** The hairdo: a topknot on the crown and a tuft on each cheek, in one of four styles. Every tuft grows out of a point
   *  on her head, along the way out of it there (tipped as the style says), so it sits on her. */
  private buildHair(style: HairStyle, color: Berry | null): Group {
    const { R, headY } = this
    const c = color ? BERRIES[color] : CANADA_COLORS.spiritLight
    const parts: BufferGeometry[] = []
    /** A point on her head (x, y in R from the head's middle), its way out, and the base sunk a little into it. */
    const on = (x: number, y: number, sink = 0.06) => {
      const z = Math.sqrt(Math.max(0, 1 - (x / 1.08) ** 2 - y * y))
      const n = new Vector3(x / 1.17, y, z).normalize()
      const p = new Vector3(x * R, headY + y * R, z * R).addScaledVector(n, -sink * R)
      return { p, n }
    }
    /** A cone tuft `len` long from (x, y), tipped by `tip` (added to the way out). */
    const spike = (x: number, y: number, len: number, r: number, tip: [number, number, number]) => {
      const { p, n } = on(x, y)
      const d = n.clone().add(new Vector3(...tip)).normalize()
      parts.push(P.cone(r * R, len * R, c, { at: add([p.x, p.y, p.z], d, (len * R) / 2), rot: rotTo(d) }, 12))
    }
    /** A soft round puff (an ellipsoid) from (x, y), stretched along the way out (plus `tip`). */
    const puff = (x: number, y: number, r: number, stretch: number, tip: [number, number, number], out = 0.55) => {
      const { p, n } = on(x, y)
      const d = n.clone().add(new Vector3(...tip)).normalize()
      parts.push(P.sphere(r * R, c, { at: add([p.x, p.y, p.z], d, r * R * out * stretch), rot: rotTo(d), scale: [1, stretch, 1] }, 14))
    }
    if (style === 'fluff') {
      puff(0, 0.97, 0.26, 1.1, [0, 0, 0.1])
      puff(-0.2, 0.92, 0.2, 1, [-0.1, 0, 0.1])
      puff(0.2, 0.92, 0.2, 1, [0.1, 0, 0.1])
      puff(0, 0.9, 0.2, 1, [0, 0, -0.3])
      for (const s of [-1, 1]) {
        puff(s * 0.98, -0.22, 0.17, 1.15, [s * 0.2, -0.3, 0])
        puff(s * 0.95, -0.42, 0.13, 1.1, [s * 0.1, -0.5, 0.1])
      }
    } else if (style === 'spikes') {
      spike(0, 0.98, 0.5, 0.12, [0, 0.3, 0.15])
      spike(-0.2, 0.93, 0.42, 0.11, [-0.35, 0.3, 0.1])
      spike(0.2, 0.93, 0.42, 0.11, [0.35, 0.3, 0.1])
      spike(-0.08, 0.9, 0.38, 0.1, [-0.15, 0.2, -0.45])
      spike(0.08, 0.9, 0.38, 0.1, [0.15, 0.2, -0.45])
      for (const s of [-1, 1]) {
        spike(s * 0.98, -0.18, 0.3, 0.09, [s * 0.4, 0.05, 0.2])
        spike(s * 0.94, -0.38, 0.26, 0.08, [s * 0.3, -0.3, 0.2])
      }
    } else if (style === 'bangs') {
      // A fringe over the brow (above the eyes), and the topknot swept forward into it.
      for (const [i, x] of [-0.36, -0.18, 0, 0.18, 0.36].entries()) puff(x, 0.66 - Math.abs(x) * 0.25, 0.15, 1.5, [0, -1.1, 0.2], 0.45 + (i % 2) * 0.1)
      puff(0, 0.95, 0.22, 1.2, [0, 0.2, 0.9])
      for (const s of [-1, 1]) {
        puff(s * 0.97, -0.25, 0.15, 1.6, [0, -1.2, 0])
        puff(s * 0.93, -0.45, 0.12, 1.5, [0, -1.2, 0.1])
      }
    } else {
      // A swoop: a wave of hair over the top from her left to her right, ending in a curl over her right ear.
      const arc: [number, number, number][] = [
        [-0.32, 0.9, 0.17],
        [-0.12, 0.98, 0.2],
        [0.1, 0.98, 0.21],
        [0.32, 0.9, 0.19],
        [0.5, 0.78, 0.16],
      ]
      for (const [i, [x, y, r]] of arc.entries()) puff(x, y, r, 1.25, [0.55 + i * 0.1, 0.1, 0.15])
      puff(0.62, 0.72, 0.12, 1, [0.9, -0.5, 0.2])
      for (const s of [-1, 1]) {
        puff(s * 0.98, -0.2, 0.15, 1.5, [s * 0.1, 0, -1])
        puff(s * 0.94, -0.4, 0.12, 1.4, [s * 0.1, -0.2, -1])
      }
    }
    return solidMix(parts, [], this.bag, this.H >= 1 ? 2.5 : 2)
  }

  /** One decoration on its spot: +y the way out of her (a crown stands on her head), a flower's and a bow's face
   *  turned toward where her face looks. */
  private buildDeco(id: Deco, at: DecoSpot): Group {
    const g = decoModel(id, this.R * (at === 'nose' ? 0.8 : 1), this.bag, this.H >= 1 ? 2.2 : 1.8)
    const sp = this.spot(at, id)
    // Up is the way out of her (a crown stands on her head); a flower and a bow turn their faces toward the camera.
    const up = id === 'flower' || id === 'bow' ? sp.n.clone().multiplyScalar(0.55).add(new Vector3(0, 0.2, 0.8)).normalize() : sp.n.clone()
    const fwd = new Vector3(0, 0, 1).addScaledVector(up, -up.z).normalize()
    if (fwd.lengthSq() < 0.01) fwd.set(0, 1, 0).addScaledVector(up, -up.y).normalize()
    const side = new Vector3().crossVectors(up, fwd).normalize()
    g.quaternion.setFromRotationMatrix(new Matrix4().makeBasis(side, up, fwd.crossVectors(side, up)))
    g.position.copy(sp.p)
    g.userData.spot = at
    sp.pivot.add(g)
    return g
  }

  /** The white team sweater: a body like the rig's own shirt (so it fits her), red stripes round the hem and the
   *  sleeves, a red collar, the red maple leaf on the chest and her paw print on the tummy, each wrapped onto the
   *  sweater's curve so it lies flat on it. */
  private buildSweater(print: Berry[]) {
    const { H } = this
    const c = this.c
    // (A chunky sweater, a little deeper than she is, so nothing on her chest pokes through it.)
    const rz = this.rz * 1.1
    const round: V3 = [c, 1, rz]
    const r = 0.171 * H
    const top = 0.34 * H
    const lined: BufferGeometry[] = [P.capsule(r, 0.1 * H, SWEATER, { at: [0, top, 0], scale: round })]
    const plain: BufferGeometry[] = []
    /** The sweater's radius at height y (its round bottom), and a point on its front. */
    const rAt = (y: number) => {
      const dy = Math.max(0, Math.abs(y - top) - 0.05 * H)
      return Math.sqrt(Math.max(0, r * r - dy * dy))
    }
    const front = (x: number, y: number) => {
      const rr = rAt(y)
      return rz * Math.sqrt(Math.max(0, rr * rr - (x / c) ** 2))
    }
    // Red stripes round the hem: a band hugging the curve of the bottom.
    for (const [y0, y1] of [[0.165, 0.195], [0.21, 0.225]] as const) {
      const a = rAt(y1 * H) + 0.006 * H
      const b = rAt(y0 * H) + 0.006 * H
      plain.push(P.cyl(a, b, (y1 - y0) * H, SWEATER_RED, { at: [0, ((y0 + y1) / 2) * H, 0], scale: round }, 28))
    }
    // The collar.
    lined.push(P.torus(0.105 * H, 0.022 * H, SWEATER_RED, { at: [0, 0.525 * H, 0.012 * H], rot: [Math.PI / 2 + 0.15, 0, 0], scale: [c, rz, 1] }))
    // The maple leaf (red, on the chest) and the paw print (the tummy), wrapped onto the front.
    const wrap = (pts: [number, number][], cx: number, cy: number, color: string, lift: number) => {
      const g = P.prism(pts, 0.004 * H, color)
      const a = g.attributes.position.array as Float32Array
      for (let i = 0; i < a.length; i += 3) {
        const x = cx + a[i]
        const y = cy + a[i + 1]
        a[i] = x
        a[i + 1] = y
        a[i + 2] = front(x, y) + lift * H + a[i + 2]
      }
      g.attributes.position.needsUpdate = true
      g.computeVertexNormals()
      return g
    }
    const leaf = mapleLeaf(0.07 * H)
    plain.push(wrap(leaf.map(([x, y]) => [x * 1.1, y * 1.1]), -0.012 * H, 0.44 * H, '#B8302C', 0.004))
    plain.push(wrap(leaf, -0.012 * H, 0.44 * H, SWEATER_RED, 0.008))
    // Her paw print: the big pad and four toes, each with a thin ink rim; the colors of her paw in stripes.
    const cols = print.length ? print.map((b) => BERRIES[b]) : [PLAIN_PRINT]
    const pad = (cx: number, cy: number, rx: number, ry: number, color: string) => {
      const ring = (k: number) => Array.from({ length: 18 }, (_, i): [number, number] => [Math.cos((i / 18) * Math.PI * 2) * rx * k, Math.sin((i / 18) * Math.PI * 2) * ry * k])
      plain.push(wrap(ring(1.18), cx, cy, INK, 0.004))
      plain.push(wrap(ring(1), cx, cy, color, 0.008))
    }
    const px = 0.0
    const py = 0.275 * H
    pad(px, py - 0.012 * H, 0.04 * H, 0.032 * H, cols[0])
    const toes: [number, number][] = [[-0.048, 0.024], [-0.018, 0.046], [0.018, 0.046], [0.048, 0.024]]
    toes.forEach(([x, y], i) => pad(px + x * H, py + y * H, 0.014 * H, 0.017 * H, cols[(i + 1) % cols.length]))
    const px3 = this.H >= 1 ? 2.5 : 2
    const body = solidMix(lined, plain, this.bag, px3)
    this.actor.rig.body.add(body)
    // Sleeves: the shirt's round shoulder on each arm, with a red stripe round it.
    const sleeve = (s: number) => {
      const g = solidMix([P.sphere(0.074 * H, SWEATER, { at: [s * 0.006 * H, -0.02 * H, 0] }, 18)], [P.torus(0.06 * H, 0.012 * H, SWEATER_RED, { at: [s * 0.022 * H, -0.072 * H, 0], rot: [Math.PI / 2, 0, s * 0.35], order: 'ZYX' })], this.bag, px3)
      return g
    }
    const armL = sleeve(-1)
    const armR = sleeve(1)
    this.actor.rig.armL.add(armL)
    this.actor.rig.armR.add(armR)
    // The Team Cabin's jersey tints it through this hook (characters/worn.ts): the body and sleeves take the color, the
    // red stripes, collar, maple leaf and her paw print stay as they are.
    body.name = 'misty-sweater'
    body.userData.tint = (color: string | null) => this.tintSweater(color)
    return { body, armL, armR }
  }

  /** Recolors the sweater's white (body and sleeves) to `color`, or back to white (null). */
  tintSweater(color: string | null) {
    this.sweaterTint = color
    if (!this.sweater) return
    const white = new Color(SWEATER)
    const to = new Color(color ?? SWEATER)
    for (const g of Object.values(this.sweater)) {
      const mesh = g.children[0] as Mesh
      const attr = mesh.geometry.attributes.color as BufferAttribute
      const a = attr.array as Float32Array
      // (Which corners were white is remembered the first time, so a second tint finds them again.)
      let was = mesh.userData.white as Uint8Array | undefined
      if (!was) {
        was = new Uint8Array(attr.count)
        for (let i = 0; i < attr.count; i++) was[i] = Math.abs(a[i * 3] - white.r) + Math.abs(a[i * 3 + 1] - white.g) + Math.abs(a[i * 3 + 2] - white.b) < 0.004 ? 1 : 0
        mesh.userData.white = was
      }
      for (let i = 0; i < attr.count; i++) if (was[i]) a.set([to.r, to.g, to.b], i * 3)
      attr.needsUpdate = true
    }
  }
}

/** One decoration from the mossy log, `s` its size (about a head's radius): built standing on the ground at the
 *  origin, +y up out of whatever it's on and its face toward +z. */
export function decoModel(id: Deco, s: number, bag: Bag, px = 2): Group {
  const lined: BufferGeometry[] = []
  const plain: BufferGeometry[] = []
  if (id === 'fern') {
    // A fern frond: a curving stem with leaflets down both sides, getting smaller to the tip.
    const n = 6
    for (let i = 0; i < n; i++) {
      const k = i / (n - 1)
      const y = (0.08 + k * 0.62) * s
      const z = -Math.pow(k, 2) * 0.22 * s
      lined.push(P.capsule(0.022 * s, 0.11 * s, '#4E9A4A', { at: [0, y, z], rot: [-k * 0.6, 0, 0] }))
      for (const side of [-1, 1]) {
        const l = (0.2 - k * 0.12) * s
        lined.push(P.sphere(l * 0.5, i % 2 ? '#6CC062' : '#5FB356', { at: [side * l * 0.45, y + 0.02 * s, z], rot: [-k * 0.5, 0, side * 0.55], scale: [1, 0.32, 0.55] }, 10))
      }
    }
    lined.push(P.sphere(0.04 * s, '#6CC062', { at: [0, 0.74 * s, -0.24 * s] }, 8))
  } else if (id === 'flower') {
    // Five pink petals round a yellow middle, its face out of her.
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2
      lined.push(P.sphere(0.13 * s, i % 2 ? '#FF8FB8' : '#FFA6C9', { at: [Math.cos(a) * 0.13 * s, 0.05 * s, Math.sin(a) * 0.13 * s], scale: [1, 0.35, 0.75], rot: [0, -a, 0] }, 12))
    }
    plain.push(P.sphere(0.075 * s, '#FFD86B', { at: [0, 0.09 * s, 0], scale: [1, 0.6, 1] }, 10))
    for (const side of [-1, 1]) lined.push(P.sphere(0.09 * s, '#5FB356', { at: [side * 0.2 * s, 0.02 * s, -0.12 * s], rot: [0, side * 0.7, 0], scale: [1, 0.25, 0.5] }, 8))
  } else if (id === 'bow') {
    // Two round loops and two tails round a knot, standing up off her.
    for (const side of [-1, 1]) {
      lined.push(P.sphere(0.16 * s, '#FF6FAE', { at: [side * 0.17 * s, 0.13 * s, 0], rot: [0, 0, side * -0.5], scale: [1.15, 0.8, 0.5] }, 14))
      lined.push(P.capsule(0.04 * s, 0.12 * s, '#FF6FAE', { at: [side * 0.07 * s, 0.03 * s, 0.03 * s], rot: [0.3, 0, side * 2.4] }))
    }
    lined.push(P.sphere(0.07 * s, '#FF4F9A', { at: [0, 0.13 * s, 0.02 * s] }, 10))
  } else {
    // A little gold crown: a band, five points with a pink gem on each, a big gem in front.
    const r = 0.32 * s
    lined.push(P.cyl(r, r * 0.92, 0.13 * s, '#FFC83D', { at: [0, 0.065 * s, 0] }, 20))
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + Math.PI / 2
      const x = Math.cos(a) * r * 0.93
      const z = Math.sin(a) * r * 0.93
      lined.push(P.cone(0.075 * s, 0.17 * s, '#FFC83D', { at: [x, 0.2 * s, z] }, 8))
      plain.push(P.sphere(0.035 * s, '#FF8FB8', { at: [x, 0.3 * s, z] }, 8))
    }
    plain.push(P.sphere(0.05 * s, '#FF4F9A', { at: [0, 0.07 * s, r * 0.98], scale: [1, 1, 0.5] }, 10))
  }
  const g = new Group()
  g.add(solidMix(lined, plain, bag, px))
  return g
}

/** A maple leaf outline about `s` tall (11 points and the stem), centered. */
export function mapleLeaf(s: number): [number, number][] {
  const pts: [number, number][] = [
    [0, 1],
    [0.14, 0.72],
    [0.3, 0.8],
    [0.26, 0.45],
    [0.62, 0.62],
    [0.54, 0.4],
    [0.78, 0.28],
    [0.42, 0.04],
    [0.5, -0.16],
    [0.06, -0.08],
    [0.05, -0.5],
    [-0.05, -0.5],
    [-0.06, -0.08],
    [-0.5, -0.16],
    [-0.42, 0.04],
    [-0.78, 0.28],
    [-0.54, 0.4],
    [-0.62, 0.62],
    [-0.26, 0.45],
    [-0.3, 0.8],
    [-0.14, 0.72],
  ]
  return pts.map(([x, y]) => [x * s, (y - 0.2) * s])
}

const coats = new WeakMap<FilmActor, MistyCoat>()
/** Misty's coat (built the first time it's asked for). */
export function mistyCoat(actor: FilmActor, bag: Bag): MistyCoat {
  let c = coats.get(actor)
  if (!c) {
    c = new MistyCoat(actor, bag)
    coats.set(actor, c)
  }
  return c
}

/** Puts Misty in a look (fur colors, fluff, hairdo, decorations, her paw-print sweater): everything it added last
 *  time comes off first, so it can be called again with another look. `null`: the plain white bear. */
export function dressMisty(actor: FilmActor, look: MistyLook | null, bag: Bag): void {
  mistyCoat(actor, bag).apply(look)
}

/** Misty as she is before her bath: a brown, mossy lump (the film in, and her bath's first minute). */
export function muddyMisty(actor: FilmActor, bag: Bag): MistyCoat {
  const c = mistyCoat(actor, bag)
  c.apply(null)
  c.setMud(1)
  c.refresh(true)
  return c
}

export type { MistyZone }

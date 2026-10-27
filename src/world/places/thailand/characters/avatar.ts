// Kaylee, the one she steers: her lilac unicorn, a modelled vinyl toy with brown hair and a pink striped dress
// (model.ts; on purpose nothing like Sparkle). The code-built one (looks.ts) stands in if the model can't load.
//
// How she moves: a bouncy hop-trot along a path (a little hop every step, squash when she lands, stretch at the top,
// leaning into the walk), turning with a spring so corners curve, a settle wobble when she arrives. Everything else
// (sitting down, hopping onto the mattress, each stair) is a short tween with an arc.
import { Box3, Euler, Group, Vector3, type Object3D } from 'three'
import { bell, clamp, span, wobble } from '../../../../sdk'
import type { Bag } from '../engine/dispose'
import { Particles } from '../engine/particles'
import type { XZ } from '../engine/nav'
import { TUNE } from '../engine/tune'
import { buildAnimal, buildWorn, Wind, type Rig } from './animal'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FaceLife } from './face'
import { HATS, LOOKS, SPOTS_OF, type Spot, type Wearable } from './looks'
import { buildModelRig, kayleeModel } from './model'
import { BARE, currentLook, itemById, paintOf, PAINT_PARTS, SLOTS, type PaintColor, type PaintPart, type ShowPose, type Slot, type Style } from './style'
import type { Character, Pose } from './types'

const BOUNCES = [0.28, 0.5, 0.78]
/** How long each show-off pose lasts (seconds). */
export const SHOW_SECS: Record<ShowPose, number> = { curtsy: 1.2, wave: 1.4, twirl: 0.9, cute: 1.3, bunny: 0.9, paw: 1.2, cheer: 1.1, yeehaw: 1.4, peek: 1.2, cool: 1.4, flutter: 1.0, stomp: 1.1 }
/** A rig with legs (the modelled Kaylee) sitting: how far her body drops onto her hips, and the legs' swing forward. */
const HIP_DROP = 0.11
const SIT_LEGS = -1.35

interface Tween {
  from: Vector3
  to: Vector3
  dur: number
  arc: number
  t: number
  done?: () => void
}

// ---------------------------------------------------------------- the costume layer
//
// Two layers on her (wardrobe plan, "When her look clashes with a game"): her own look (style.ts, what she picked in
// her wardrobe) and a game's costume (`wear`: the vet's scrubs, the packed sun hat). Each costume takes only the spots
// it needs (looks.ts SPOTS_OF); she keeps her own things on every other spot. A thing of hers that loses its spot
// doesn't vanish: it shrinks into a trail of sparkles at her hip (her pocket) and pops back out of a burst of them when
// the spot is free again.
// Sun smarts: on a sunny trip a shady hat of hers counts (no spare hat), and tinted glasses count as sunglasses.
// Her wings fold when she sits, lies, walks or climbs (inside her walking circle), and flap when she hops; every hat
// comes off into her hooves for a wai. The Avatar and the race's Racer both dress through this, so her look shows up
// in every scene from one place: their constructors read currentLook().

/** Where her pocket is: body-local, at her right hip. */
const POCKET = new Vector3(0.17, 0.27, 0.07)
/** Where a hat goes for a wai: body-local, held in front of her chest. */
const HAT_HELD = new Vector3(0, 0.36, 0.2)
const v1 = new Vector3()
const box = new Box3()
const POCKET_SPARKLE = ['#FFFFFF', '#FFE36E', '#FF8FD0', '#B9A6F5', '#8FE3C8']

interface Home {
  pos: Vector3
  rot: Euler
}
const homeOf = (g: Group): Home => (g.userData.home ??= { pos: g.position.clone(), rot: g.rotation.clone() }) as Home
const ease = (k: number) => k * k * (3 - 2 * k)
/** The middle of a thing, from its group's origin, in its pivot's frame (measured once, at rest): a hat's middle is
 *  what lands in her hooves for a wai. */
function midOf(g: Group): Vector3 {
  if (g.userData.mid) return g.userData.mid as Vector3
  const mid = new Vector3()
  if (g.parent) {
    g.parent.updateWorldMatrix(true, true)
    new Box3().setFromObject(g).getCenter(mid)
    g.parent.worldToLocal(mid).sub(g.position)
  }
  g.userData.mid = mid
  return mid
}

const X_AXIS = new Vector3(1, 0, 0)
/** Her hat in the air for the top bounce: up and a full somersault about its own middle. */
function flipped(g: Group, rx: number, k: number, tmp: Vector3) {
  const angle = ease(k) * Math.PI * 2
  g.position.y += Math.sin(Math.PI * k) * 0.22
  g.rotation.x = rx + angle
  const m = midOf(g)
  g.position.add(m).sub(tmp.copy(m).applyAxisAngle(X_AXIS, angle))
}

/** How she's posed this frame, for what she wears: folded wings, a flap, a wai. */
export interface DressPose {
  /** 0 wings spread (standing still) .. 1 folded flat (sitting, lying, walking, climbing). */
  fold: number
  /** Hopping or bouncing: the wings flap. */
  flap: boolean
  /** Doing a wai: her hat comes off into her hooves. */
  wai: boolean
  /** Walking: the light-up sneakers blink. */
  walk: boolean
}

export class Dress {
  /** Her own look. Bare until setLook. */
  style: Style = BARE
  /** The costume the game asked for (`wear`). */
  private asked: Wearable[] = []
  /** What's on her of it (sun smarts can leave the spare hat and the packed sunglasses off). */
  private costume: Wearable[] = []
  /** Spots something outside the costume took (HarborLand's grip socks, Agong's shoe rack, the boxing belt). */
  private claims = new Map<string, readonly Spot[]>()
  private worn = new Map<Wearable, Group[]>()
  private entering = new Map<Wearable, number>()
  private closet = new Map<string, Group[]>()
  /** Her things showing on her now (not taken by a costume). */
  private shown = new Set<string>()
  private popping = new Map<string, number>()
  /** Her things on their way into her pocket (0..1). */
  private pocketing = new Map<string, number>()
  private up = false
  private foldK = 0
  private waiK = 0
  /** The hat flipping up and landing back on (the top bounce on the mattress): 0..1, -1 when not. */
  private flipK = -1
  private flapT = 0
  private flapping = 0
  /** The lights in her shoes (the light-up sneakers'), by thing. */
  private lights = new Map<string, Object3D[]>()
  /** The sparkles of her pocket, riding on her (root-local). */
  private sparkle: Particles

  constructor(
    private rig: Rig,
    private bag: Bag,
  ) {
    this.sparkle = new Particles({ kind: 'spray', count: 60, colors: POCKET_SPARKLE, gravity: 1.2 }, bag)
    rig.root.add(this.sparkle.mesh)
  }

  /** Can she wear her own things (the modelled Kaylee)? The code-built one has no closet and no paint. */
  get dressable() {
    return !!this.rig.closet
  }

  /** Her own look: her things on their spots (the free ones), her colors. `show`: what's new pops on. */
  setLook(style: Style, show = false) {
    const before = this.style
    this.style = style
    this.apply(show ? 'pop' : 'instant', before)
    const colors = {} as Record<PaintPart, PaintColor>
    for (const p of PAINT_PARTS) colors[p] = paintOf(style, p)
    if (PAINT_PARTS.some((p) => paintOf(before, p) !== colors[p]) || before === BARE) this.rig.paint?.(colors)
  }

  /** The game's costume: exactly these (the last call's go). They take their spots; her own things on those spots go
   *  in her pocket, and come back when the costume comes off. */
  wear(ids: readonly Wearable[]) {
    this.asked = [...ids]
    this.apply('pocket')
  }
  /** Puts these on with a little show: the hat drops onto her head, the sunglasses slide down, the floaties pop on. */
  putOn(ids: readonly Wearable[]) {
    const before = new Set(this.costume)
    this.wear(ids)
    for (const id of this.costume) if (!before.has(id)) this.entering.set(id, 0)
  }
  /** Something a game puts on her itself takes these spots (null gives them back). `quiet`: her own things there just
   *  go (and come back) without the pocket show, because the game shows it (her shoes hopping into a cubby). */
  claim(key: string, spots: readonly Spot[] | null, quiet = false) {
    if (spots) this.claims.set(key, spots)
    else this.claims.delete(key)
    this.apply(quiet ? 'instant' : 'pocket')
  }
  /** A costume thing a game built itself (the rice farm's ngob): from now on `wear([id])` puts it on. `pivot` is where
   *  each group rides (her head, an arm). */
  attach(id: Wearable, parts: [Group, Object3D][]) {
    const groups: Group[] = []
    for (const [g, pivot] of parts) {
      if (g.parent !== pivot) pivot.add(g)
      g.userData.base = g.position.clone()
      g.userData.baseRx = g.rotation.x
      if (HATS.includes(id)) midOf(g)
      g.visible = false
      groups.push(g)
    }
    this.worn.set(id, groups)
    this.apply('instant')
  }
  /** Indoors (the plane) she pushes whatever glasses are on her face up onto her hair; outdoors they're back on her eyes. */
  /** The top bounce: her hat flips up into the air and lands back on her head. */
  flipHat() {
    this.flipK = 0
  }

  glassesUp(up: boolean) {
    this.up = up
    const R = 0.24 * LOOKS.kaylee.height
    const to = this.rig.wardrobe?.glassesUp ?? { y: 0.62 * R, z: 0.12 * R, tilt: -0.42 }
    for (const g of this.worn.get('sunglasses') ?? []) {
      g.position.set(0, up ? to.y : 0, up ? to.z : 0)
      g.userData.base = g.position.clone()
      g.rotation.x = up ? to.tilt : 0
    }
  }

  /** The costume on her now. */
  get wearing(): Wearable[] {
    return [...this.costume]
  }
  /** The spots taken from her look (by the costume or a game's claim). */
  get taken(): Set<Spot> {
    return new Set<Spot>([...this.costume.flatMap((c) => SPOTS_OF[c]), ...[...this.claims.values()].flat()])
  }
  /** Her own things in her pocket now (on her look, but their spot is taken). */
  get pocket(): string[] {
    return SLOTS.map((s) => this.style.on[s]).filter((id): id is string => !!id && !this.shown.has(id))
  }
  /** The groups of what's on a spot of hers now (empty if nothing is): the wardrobe aims at them and takes them off. */
  onSpot(slot: Slot): Group[] {
    const id = this.style.on[slot]
    return id && this.shown.has(id) ? (this.closet.get(id) ?? []) : []
  }
  get busy() {
    return this.popping.size > 0 || this.pocketing.size > 0 || this.entering.size > 0 || this.flapping > 0 || this.sparkle.busy || Math.abs(this.waiK - Math.round(this.waiK)) > 0.01
  }

  /** Works out what shows: sun smarts, the costume, then her things on every spot left free. */
  private apply(how: 'instant' | 'pop' | 'pocket', before: Style = this.style) {
    const head = itemById(this.style.on.head ?? '')
    const face = itemById(this.style.on.face ?? '')
    // ---- Sun smarts: her own shady hat and tinted glasses count ----
    this.costume = this.asked.filter((id) => !(id === 'spare-hat' && head?.shade) && !(id === 'sunglasses' && face?.tinted))
    for (const id of new Set([...this.costume, ...this.worn.keys()])) {
      const on = this.costume.includes(id)
      let groups = this.worn.get(id)
      if (!groups && on) groups = this.buildCostume(id)
      for (const g of groups ?? []) g.visible = on
      if (!on) this.entering.delete(id)
    }
    // ---- Her own things, on the spots nobody took ----
    const taken = this.taken
    const mine = new Set(Object.values(this.style.on))
    const had = new Set(Object.values(before.on))
    for (const slot of SLOTS) {
      const id = this.style.on[slot]
      if (id && !this.closet.has(id)) this.buildOwn(id)
    }
    for (const [id, groups] of this.closet) {
      const item = itemById(id)
      const want = !!item && mine.has(id) && !taken.has(item.slot)
      const was = this.shown.has(id)
      if (want && !was) {
        this.shown.add(id)
        this.pocketing.delete(id)
        for (const g of groups) this.rest(g, true)
        // Back out of her pocket (out of a burst of sparkles), or new on her from the wardrobe: pop!
        if ((how === 'pocket' && had.has(id)) || (how === 'pop' && !had.has(id))) this.popping.set(id, 0)
        if (how === 'pocket' && had.has(id)) {
          this.burst(this.bodyLocal(POCKET), 10)
          this.burst(this.centerOf(groups), 14)
        }
      } else if (!want && was) {
        this.shown.delete(id)
        this.popping.delete(id)
        // Still hers, but a costume took its spot: into her pocket with a sparkle. Taken off in the wardrobe: just gone.
        if (how === 'pocket' && mine.has(id)) this.pocketing.set(id, 0)
        else for (const g of groups) this.rest(g, false)
      } else if (!want) for (const g of groups) if (!this.pocketing.has(id)) g.visible = false
    }
  }

  private buildCostume(id: Wearable): Group[] {
    const c = this.rig
    const w = c.wardrobe?.build(id, this.bag) ?? buildWorn(LOOKS.kaylee, id as Exclude<Wearable, 'ngob'>, this.bag)
    const groups: Group[] = []
    for (const [g, pivot] of [[w.head, c.head], [w.armL, c.armL], [w.armR, c.armR], [w.body, c.body], [w.legL, c.legL], [w.legR, c.legR]] as const) {
      if (!g || !pivot) continue
      pivot.add(g)
      groups.push(g)
      // Hats sit tipped back a little, so her face shows under the brim.
      if (id === 'sunhat' || id === 'spare-hat') g.rotation.x = -0.16
      g.userData.base = g.position.clone()
      g.userData.baseRx = g.rotation.x
      if (pivot === c.head && HATS.includes(id)) midOf(g)
    }
    this.worn.set(id, groups)
    return groups
  }

  private buildOwn(id: string) {
    const c = this.rig
    const w = c.closet?.(id, this.bag)
    const groups: Group[] = []
    if (w) {
      for (const [g, pivot] of [[w.head, c.head], [w.armL, c.armL], [w.armR, c.armR], [w.body, c.body], [w.legL, c.legL], [w.legR, c.legR]] as const) {
        if (!g || !pivot) continue
        pivot.add(g)
        g.userData.closet = id
        g.traverse((o) => o.userData.blink && (this.lights.get(id) ?? this.lights.set(id, []).get(id)!).push(o))
        homeOf(g)
        if (pivot === c.head) midOf(g)
        g.visible = false
        groups.push(g)
      }
    }
    this.closet.set(id, groups)
  }

  /** Back where it sits on her, full size. */
  private rest(g: Group, visible: boolean) {
    const h = homeOf(g)
    g.position.copy(h.pos)
    g.rotation.copy(h.rot)
    g.scale.setScalar(1)
    g.visible = visible
  }

  /** A body-local point, in her root's frame (where the pocket's sparkles fly). */
  private bodyLocal(p: Vector3) {
    this.rig.root.updateMatrixWorld(true)
    return this.rig.root.worldToLocal(this.rig.body.localToWorld(p.clone()))
  }
  /** The middle of a thing on her now, in her root's frame. */
  private centerOf(gs: Group[]) {
    this.rig.root.updateMatrixWorld(true)
    box.makeEmpty()
    for (const g of gs) box.expandByObject(g)
    return box.isEmpty() ? this.bodyLocal(POCKET) : this.rig.root.worldToLocal(box.getCenter(new Vector3()))
  }
  private burst(at: Vector3, n: number) {
    this.sparkle.burst(at.x, at.y, at.z, n, 0.55, 0.7, 0.035)
  }

  /** A body-local point, in the frame of `g`'s pivot. */
  private bodyPoint(g: Group, p: Vector3, out: Vector3) {
    this.rig.body.localToWorld(out.copy(p))
    return g.parent ? g.parent.worldToLocal(out) : out
  }

  update(dt: number, pose: DressPose) {
    // (Only a wai and the pocket move things between pivots, which needs this frame's matrices.)
    if (pose.wai || this.waiK > 0 || this.pocketing.size) this.rig.root.updateMatrixWorld(true)
    this.foldK += (pose.fold - this.foldK) * (1 - Math.exp(-dt * 10))
    if (this.flipK >= 0) {
      this.flipK += dt / 0.8
      if (this.flipK >= 1) this.flipK = -1
    }
    this.waiK = clamp(this.waiK + (pose.wai ? dt : -dt) / 0.4)
    if (pose.flap) this.flapping = 1
    else this.flapping = Math.max(0, this.flapping - dt / 0.3)
    this.flapT += dt
    const wai = ease(this.waiK)
    // ---- The costume: the little show putting each on, and hats off for a wai ----
    for (const [id, gs] of this.worn) {
      const e = this.entering.get(id)
      if (e !== undefined) {
        const next = Math.min(1, e + dt / 0.5)
        if (next >= 1) this.entering.delete(id)
        else this.entering.set(id, next)
      }
      const k = this.entering.get(id) ?? 1
      const hat = HATS.includes(id)
      for (const g of gs) {
        if (!g.visible) continue
        const base = (g.userData.base as Vector3 | undefined) ?? g.position
        g.position.copy(base)
        g.scale.setScalar(1)
        if (k < 1) {
          if (id === 'floaties') g.scale.setScalar(Math.max(0.01, k < 0.6 ? (k / 0.6) * 1.2 : 1.2 - (k - 0.6) * 0.5))
          else if (id === 'sunglasses' || id === 'ngob') g.position.y += (1 - k) * 0.12
          else {
            g.position.y += (1 - k) ** 2 * 0.55
            g.scale.set(1, 1 - 0.22 * bell(span(k, 0.65, 1)), 1)
          }
        }
        if (hat && wai > 0 && g.parent === this.rig.head) {
          this.bodyPoint(g, HAT_HELD, v1).sub(midOf(g))
          g.position.lerp(v1, wai)
          g.position.y += bell(wai) * 0.08
          g.rotation.x = ((g.userData.baseRx as number | undefined) ?? 0) * (1 - wai) - 1.1 * wai
        } else if (hat) g.rotation.x = (g.userData.baseRx as number | undefined) ?? g.rotation.x
        if (hat && this.flipK >= 0 && g.parent === this.rig.head) flipped(g, g.rotation.x, this.flipK, v1)
      }
    }
    // ---- Her own things ----
    const R = 0.24 * LOOKS.kaylee.height
    const up = this.rig.wardrobe?.glassesUp ?? { y: 0.62 * R, z: 0.12 * R, tilt: -0.42 }
    const fold = this.foldK
    const flap = this.flapping > 0 ? Math.sin(this.flapT * 26) * 0.22 * this.flapping : 0
    for (const [id, gs] of this.closet) {
      const slot = itemById(id)?.slot
      const pop = this.popping.get(id)
      const out = this.pocketing.get(id)
      let k = 1
      if (pop !== undefined) {
        const e = Math.min(1, pop + dt / 0.45)
        if (e >= 1) this.popping.delete(id)
        else this.popping.set(id, e)
        // From nothing, past full size, back: pop!
        k = e < 0.6 ? (e / 0.6) * 1.18 : 1.18 - 0.18 * span(e, 0.6, 1)
      }
      for (const g of gs) {
        const h = homeOf(g)
        if (!g.visible && out === undefined) continue
        g.position.copy(h.pos)
        g.rotation.copy(h.rot)
        let sx = 1
        let sy = 1
        let sz = 1
        if (slot === 'back') {
          if (g.userData.wings) {
            // Folded flat against her back (inside her walking circle), spread standing still, a flutter on a hop.
            sx = (1 - 0.6 * fold) * (1 + flap)
            sz = 1 - 0.3 * fold
            g.rotation.x = h.rot.x - 0.25 * fold
          } else if (g.userData.cape) {
            // The cape drapes: shorter and closer in when she sits.
            sy = 1 - 0.18 * fold
            sz = 1 - 0.25 * fold
          }
        } else if (slot === 'face' && this.up) {
          g.position.y += up.y
          g.position.z += up.z
          g.rotation.x += up.tilt
        } else if (slot === 'head' && wai > 0) {
          this.bodyPoint(g, HAT_HELD, v1).sub(midOf(g))
          g.position.lerp(v1, wai)
          g.position.y += bell(wai) * 0.08
          g.rotation.x = h.rot.x - 1.1 * wai
        }
        if (slot === 'head' && this.flipK >= 0) flipped(g, g.rotation.x, this.flipK, v1)
        if (out !== undefined) {
          // Into her pocket: smaller and smaller, toward her hip, then gone.
          const e = ease(out)
          this.bodyPoint(g, POCKET, v1)
          g.position.lerp(v1, e)
          k *= Math.max(0.01, 1 - e)
        }
        g.scale.set(sx * k, sy * k, sz * k)
      }
      if (out !== undefined) {
        // A trail of sparkles behind it, and a burst when it's in.
        if (out === 0) this.burst(this.centerOf(gs), 10)
        else {
          const at = this.centerOf(gs)
          this.sparkle.emit(at.x, at.y, at.z, (Math.random() - 0.5) * 0.3, 0.25, (Math.random() - 0.5) * 0.3, 0.45, 0.03)
        }
        const e = Math.min(1, out + dt / 0.45)
        if (e >= 1) {
          this.pocketing.delete(id)
          for (const g of gs) this.rest(g, false)
          this.burst(this.bodyLocal(POCKET), 14)
        } else this.pocketing.set(id, e)
      }
    }
    // The light-up sneakers blink as she walks (steady when she stands).
    const blink = !pose.walk || Math.floor(this.flapT * 7) % 2 === 0
    for (const ls of this.lights.values()) for (const l of ls) l.visible = blink
    this.sparkle.update(dt)
  }
}

export class Avatar implements Character {
  readonly id = 'kaylee'
  readonly root: Group
  /** How tall she stands (the vinyl toy is scaled up: model.ts's KAYLEE_SIZE). */
  readonly height: number
  pose: Pose = 'stand'
  /** Which floor she's on (0 = street level, 1 = upstairs). */
  floor: 0 | 1 = 0
  /** Where she steps back to when she gets up from a seat or the mattress. */
  standPoint: Vector3 | null = null
  /** How much faster than her usual walk she goes (the rice farm's trot behind a finger). */
  pace = 1
  private chibi: Rig
  private path: XZ[] = []
  private onArrive: (() => void) | null = null
  private speed = 0
  private yaw = Math.PI
  private yawVel = 0
  private yawGoal = Math.PI
  private phase = 0
  private tweens: Tween[] = []
  private settle = 1
  private bounce = { level: -1, t: 0 }
  private flop = 1
  /** How far she has sat down (0..1, eased): a rig with legs swings them forward as it lowers onto its hips. */
  private sitK = 0
  private look: Vector3 | null = null
  private headYaw = 0
  private life: FaceLife
  private waving = -1
  private wind = new Wind()
  /** Her look and the game's costume on her (the costume layer, Dress above). */
  readonly dress: Dress
  /** Climbing or crawling (Golden Mountain, a tunnel): her wings fold flat, so they don't hide her hooves. */
  tuck = false
  /** A twirl on the spot (0..1), -1 when not twirling. */
  private twirling = -1
  /** Showing off something new she put on (showOff). */
  private showing: { kind: ShowPose; t: number } | null = null

  /** `model`: the modelled vinyl-toy Kaylee (model.ts), the one the game uses (Place.tsx loads it before any scene
   *  builds); `null` builds the code-built Kaylee instead (the lab's comparison, or if the model couldn't load). */
  constructor(bag: Bag, model: GLTF | null = kayleeModel()) {
    this.chibi = model ? buildModelRig(model, bag) : buildAnimal(LOOKS.kaylee, bag)
    this.height = this.chibi.height
    this.life = new FaceLife(this.chibi)
    this.root = this.chibi.root
    this.root.rotation.y = this.yaw
    this.root.userData.pick = 'kaylee'
    this.dress = new Dress(this.chibi, bag)
    // In her own look in every scene: the link's ?look=, else the one saved in her wardrobe (style.ts).
    if (model) this.dress.setLook(currentLook())
  }

  get position() {
    return this.root.position
  }
  /** The toy's pivots (arms, head, eyes), for a pose held on top of the usual life (the boat trip's photo poses). */
  get rig(): Rig {
    return this.chibi
  }
  /** The game's costume: exactly these (and none of the last ones). They take only the spots they need (looks.ts
   *  SPOTS_OF); her own things on those spots go in her pocket until the costume comes off. */
  wear(ids: readonly Wearable[]) {
    this.dress.wear(ids)
  }
  /** Dresses her in her own look (style.ts): her things on their spots, her colors. `show`: what's new pops on. Things
   *  she can't wear (the code-built Kaylee has no closet and no paint) are just left off. */
  setLook(style: Style, show = false) {
    this.dress.setLook(style, show)
  }
  get myLook(): Style {
    return this.dress.style
  }
  /** Can she wear her own things and paint (the modelled Kaylee)? */
  get dressable() {
    return this.dress.dressable
  }
  /** The groups of what's on a spot now (empty if nothing is): the wardrobe aims at them and takes them off. */
  onSpot(slot: Slot): Group[] {
    return this.dress.onSpot(slot)
  }
  /** Something a game puts on her itself (grip socks, the shoe rack) takes these spots; null gives them back. */
  claim(key: string, spots: readonly Spot[] | null, quiet = false) {
    this.dress.claim(key, spots, quiet)
  }
  /** A costume thing a game built itself (the rice farm's ngob): `wear([id])` puts it on from then on. */
  attach(id: Wearable, parts: [Group, Object3D][]) {
    this.dress.attach(id, parts)
  }
  /** Which of her own things this is (a mesh inside one of them), if any. */
  itemOf(o: Object3D | null): string | null {
    for (let p = o; p; p = p.parent) if (typeof p.userData.closet === 'string') return itemById(p.userData.closet) ? (p.userData.closet as string) : null
    return null
  }
  /** A happy twirl right round on the spot. */
  twirl() {
    if (this.twirling < 0) this.twirling = 0
    this.react('hop')
  }

  /** Shows off something she just put on (style.ts's `pose` for each thing): a curtsy for the crown, a flutter hop for
   *  wings, a cool lean for sunglasses, a tap dance for new shoes... */
  showOff(kind: ShowPose) {
    this.endShow()
    this.showing = { kind, t: 0 }
    const here = this.root.position
    if (this.pose !== 'stand' || this.tweens.length) return
    if (kind === 'twirl') this.twirling = 0
    if (kind === 'flutter') this.hopTo(here, 0.6, 0.3)
    if (kind === 'cheer' || kind === 'yeehaw') this.hopTo(here, 0.45, 0.22)
    if (kind === 'bunny') {
      this.hopTo(here, 0.34, 0.16)
      this.hopTo(here, 0.34, 0.16)
    }
  }
  get showingOff(): ShowPose | null {
    return this.showing?.kind ?? null
  }

  /** Puts these on with a little show: the hat drops onto her head, the sunglasses slide down, the floaties pop on. */
  putOn(ids: readonly Wearable[]) {
    this.dress.putOn(ids)
  }
  /** Indoors (the plane) she pushes the glasses on her face (packed or her own) up onto her hair; outdoors they're
   *  back on her eyes. */
  glassesUp(up: boolean) {
    this.dress.glassesUp(up)
  }
  /** The costume on her now (QA: what she packed shows here). */
  get wearing(): Wearable[] {
    return this.dress.wearing
  }
  /** Wind in her mane and tail: 0 still, 1 strong (it eases there). */
  setWind(k: number) {
    this.wind.goal = k
  }

  get walking() {
    return this.path.length > 0 || this.tweens.length > 0
  }
  /** Something is moving (the frame loop may slow down when nothing is). */
  get busy() {
    return this.walking || this.speed > 0.01 || this.pose === 'bounce' || this.settle < 1 || this.flop < 1 || this.dress.busy || this.twirling >= 0 || !!this.showing
  }

  /** Puts her somewhere at once (a deep link, the end of the arrival). */
  place(x: number, y: number, z: number, faceDeg: number) {
    this.root.position.set(x, y, z)
    this.yaw = this.yawGoal = faceDeg * (Math.PI / 180)
    this.yawVel = 0
    this.path = []
    this.tweens = []
    this.speed = 0
  }

  face(yawRad: number) {
    this.yawGoal = yawRad
  }
  faceToward(x: number, z: number) {
    const p = this.root.position
    if (Math.hypot(x - p.x, z - p.z) > 0.05) this.yawGoal = Math.atan2(x - p.x, z - p.z)
  }

  /** Walks along `path` (from a NavGrid); getting up first if she's sitting or bouncing. */
  walk(path: XZ[], onArrive?: () => void) {
    const go = () => {
      this.path = path.slice()
      this.onArrive = onArrive ?? null
    }
    if (this.pose !== 'stand' && this.standPoint) {
      const to = this.standPoint
      this.standPoint = null
      this.setPose('stand')
      this.path = []
      this.hopTo(to, 0.28, 0.18, go)
    } else {
      this.setPose('stand')
      go()
    }
  }

  stop() {
    this.path = []
    this.onArrive = null
  }

  /** A little jump to `to` (onto a stool, the mattress, the next stair). */
  hopTo(to: Vector3, dur: number, arc: number, done?: () => void) {
    this.tweens.push({ from: new Vector3(), to: to.clone(), dur, arc, t: -1, done })
  }

  setPose(pose: Pose) {
    if (pose === 'bounce' && this.pose !== 'bounce') this.bounce = { level: 0, t: 0 }
    if (pose === 'lie') this.flop = 0
    this.pose = pose
  }

  /** On the mattress: each tap bounces higher, and after the highest one she flops down. Returns the new level. */
  bounceHigher(): number {
    if (this.pose === 'lie') {
      this.setPose('bounce')
      return 0
    }
    if (this.pose !== 'bounce') this.setPose('bounce')
    else if (this.bounce.level >= BOUNCES.length - 1) {
      this.setPose('lie')
      return BOUNCES.length
    } else {
      this.bounce.level++
      // The top bounce throws her hat in the air (it lands back on her head).
      if (this.bounce.level === BOUNCES.length - 1) this.dress.flipHat()
    }
    return this.bounce.level
  }

  react(kind: 'hop' | 'wiggle' | 'wave') {
    if (kind === 'wave') this.waving = 0
    else if (kind === 'hop' && this.pose === 'stand' && !this.tweens.length) this.hopTo(this.root.position, 0.45, 0.25)
    else this.settle = 0
  }
  lookAt(x: number, y: number, z: number) {
    this.look = (this.look ?? new Vector3()).set(x, y, z)
  }
  lookAway() {
    this.look = null
  }

  update(dt: number, t: number) {
    // Small substeps keep the turning spring steady when a frame is slow (headless browsers run at 10-20 fps).
    const steps = Math.max(1, Math.ceil(dt / (1 / 90)))
    for (let i = 0; i < steps; i++) this.step(dt / steps)
    this.sitK += ((this.pose === 'sit' ? 1 : 0) - this.sitK) * (1 - Math.exp(-dt * 14))
    this.pose3d(t)
    this.life.update(dt)
    this.wind.update(this.chibi, dt, t)
    // Wings fold when she sits, lies, walks or climbs, spread when she stands still, flap when she hops.
    const walkK = Math.min(1, this.speed / TUNE.walkSpeed)
    const fold = Math.max(this.sitK, this.pose === 'lie' ? 1 : 0, walkK, this.tuck ? 1 : 0)
    if (this.showing) this.show(dt)
    this.dress.update(dt, { fold, flap: this.tweens.length > 0 || this.pose === 'bounce' || this.showing?.kind === 'flutter', wai: this.pose === 'wai', walk: walkK > 0.1 })
    if (this.twirling >= 0) {
      this.twirling = Math.min(1, this.twirling + dt / 0.75)
      if (this.twirling >= 1) this.twirling = -1
    }
    if (this.waving >= 0) {
      this.waving += dt / 1.3
      const p = Math.min(1, this.waving)
      const up = span(p, 0, 0.15) * (1 - span(p, 0.8, 1))
      this.chibi.armR.rotation.z = up * (2.5 + Math.sin(p * Math.PI * 6) * 0.35)
      if (p >= 1) this.waving = -1
    }
  }

  private step(dt: number) {
    const p = this.root.position
    // Scripted hops first (sitting down, stairs, the mattress).
    const tw = this.tweens[0]
    if (tw) {
      if (tw.t < 0) {
        tw.from.copy(p)
        tw.t = 0
        if (tw.to.distanceToSquared(tw.from) > 1e-4) this.yawGoal = Math.atan2(tw.to.x - tw.from.x, tw.to.z - tw.from.z)
      }
      tw.t += dt
      const k = clamp(tw.t / tw.dur)
      p.lerpVectors(tw.from, tw.to, k)
      p.y += bell(k) * tw.arc
      if (k >= 1) {
        this.tweens.shift()
        this.settle = 0
        tw.done?.()
      }
    } else if (this.path.length) {
      const [tx, tz] = this.path[0]
      const dx = tx - p.x
      const dz = tz - p.z
      const d = Math.hypot(dx, dz)
      const left = d + this.pathLength()
      // Long trips (across the house to the stairs) turn into a happy run, up to 1.6x.
      const run = 1 + clamp((left - 4) / 6, 0, 0.6)
      const max = TUNE.walkSpeed * this.pace * run * clamp(left / 0.45, 0.35, 1)
      this.speed = this.speed > max ? max : Math.min(max, this.speed + ((TUNE.walkSpeed * this.pace) / 0.15) * dt)
      const move = this.speed * dt
      if (d <= Math.max(move, 0.02)) {
        p.x = tx
        p.z = tz
        this.path.shift()
        if (!this.path.length) {
          this.speed = 0
          this.settle = 0
          const cb = this.onArrive
          this.onArrive = null
          cb?.()
        }
      } else {
        p.x += (dx / d) * move
        p.z += (dz / d) * move
        this.yawGoal = Math.atan2(dx, dz)
      }
    } else this.speed = 0
    // Turning spring (angle-wrapped).
    let diff = this.yawGoal - this.yaw
    diff = Math.atan2(Math.sin(diff), Math.cos(diff))
    this.yawVel += (220 * diff - 28 * this.yawVel) * dt
    this.yaw += this.yawVel * dt
    // Gait phase: one hop per step, faster the faster she goes.
    if (this.speed > 0.01) this.phase += Math.PI * TUNE.stepsPerSecond * (this.speed / TUNE.walkSpeed) * dt
    else this.phase = 0
    this.settle = Math.min(1, this.settle + dt / 0.35)
    this.flop = Math.min(1, this.flop + dt / 0.5)
    if (this.pose === 'bounce') this.bounce.t += dt
  }

  private pathLength() {
    let sum = 0
    for (let i = 1; i < this.path.length; i++) sum += Math.hypot(this.path[i][0] - this.path[i - 1][0], this.path[i][1] - this.path[i - 1][1])
    return sum
  }

  /** The show-off pose this frame, on top of pose3d's: arms, head and legs eased in and out of it. */
  private show(dt: number) {
    const sh = this.showing!
    const dur = SHOW_SECS[sh.kind]
    sh.t += dt
    const k = Math.min(1, sh.t / dur)
    const e = ease(span(k, 0, 0.18)) * (1 - ease(span(k, 0.78, 1)))
    const t = sh.t
    const { armL, armR, head, body, legL, legR } = this.chibi
    /** Arms to these, weighted by the ease: z raises an arm up in front of her (the left's is negative), x swings it
     *  out to the side (negative for both), the way the bay's photo poses do (her arms swing in a frame turned forward,
     *  model.ts). */
    const arms = (xL: number, zL: number, xR: number, zR: number) => {
      armL.rotation.x = xL * e
      armL.rotation.z = zL * e
      armR.rotation.x = xR * e
      armR.rotation.z = zR * e
    }
    switch (sh.kind) {
      case 'curtsy':
        // Hooves out holding her skirt, one leg back, a dip and a tilt of the head.
        arms(-0.5, -0.45, -0.5, 0.45)
        body.position.y -= 0.05 * e * bell(span(k, 0.15, 0.85))
        body.rotation.x += 0.12 * e
        head.rotation.z += 0.22 * e
        if (legL) legL.rotation.x += -0.45 * e
        break
      case 'wave':
        // A princess wave, the other hoof on her tummy.
        arms(0, -1.0, 0, 2.4 + Math.sin(t * 12) * 0.3)
        head.rotation.z += 0.12 * e
        break
      case 'twirl':
        arms(-0.9, -0.3, -0.9, 0.3)
        break
      case 'cute':
        // Both hooves under her chin, head tipping side to side.
        arms(0.25, -1.65, 0.25, 1.65)
        head.rotation.z += Math.sin(t * 7) * 0.22 * e
        body.position.y += Math.abs(Math.sin(t * 7)) * 0.02 * e
        break
      case 'bunny':
        // Bunny paws in front of her chest while she hops.
        arms(0.2, -1.3, 0.2, 1.3)
        head.rotation.x += Math.sin(t * 18) * 0.08 * e
        break
      case 'paw':
        // A kitty paw up by her face, batting.
        arms(0, -0.2, 0.2, 2.0 + Math.sin(t * 11) * 0.2)
        head.rotation.z -= 0.25 * e
        break
      case 'cheer':
        arms(-0.15, -2.15 + Math.sin(t * 9) * 0.15, -0.15, 2.15 - Math.sin(t * 9) * 0.15)
        break
      case 'yeehaw':
        // One hoof up swinging a lasso round, the other on her hip.
        arms(-0.5, -0.2, Math.sin(t * 10) * 0.5, 2.7)
        head.rotation.z += 0.1 * e
        break
      case 'peek':
        // Leans in and pushes her glasses (or her brim) up with a hoof, looking at you.
        arms(0, -0.15, 0.15, 2.1)
        body.rotation.x += 0.18 * e
        head.rotation.x -= 0.12 * e
        break
      case 'cool':
        // A cool lean to one side, a hoof at her shades, the other on her hip.
        arms(-0.6, -0.1, 0.2, 2.0)
        body.rotation.z -= 0.13 * e
        head.rotation.z += 0.18 * e
        break
      case 'flutter':
        // Arms flapping with her wings while she hops.
        arms(-(0.7 + Math.sin(t * 22) * 0.45), -0.2, -(0.7 + Math.sin(t * 22) * 0.45), 0.2)
        break
      case 'stomp':
        // Tap, tap, tap: showing off new shoes, one foot then the other, arms out for balance.
        arms(-0.45, 0, -0.45, 0)
        if (legL && legR) {
          legL.rotation.x -= 0.5 * Math.max(0, Math.sin(t * 13)) * e
          legR.rotation.x -= 0.5 * Math.max(0, -Math.sin(t * 13)) * e
        }
        body.position.y += Math.abs(Math.sin(t * 13)) * 0.025 * e
        break
    }
    if (k >= 1) this.endShow()
  }
  private endShow() {
    if (!this.showing) return
    this.showing = null
    for (const a of [this.chibi.armL, this.chibi.armR]) {
      a.rotation.x = 0
      a.rotation.z = 0
    }
  }

  /** Writes the body's pose for this frame: gait, squash and stretch, sitting, lying, bouncing, bowing. */
  private pose3d(t: number) {
    const { body, head } = this.chibi
    // A twirl goes right round once (eased), on top of where she faces.
    const tw = this.twirling < 0 ? 0 : this.twirling
    this.root.rotation.y = this.yaw + (tw * tw * (3 - 2 * tw)) * Math.PI * 2
    const pose = this.pose
    let y = 0
    let sy = 1 + Math.sin(t * 2.4) * 0.015
    let lean = 0
    let roll = 0
    let headPitch = 0
    const walkK = this.speed / TUNE.walkSpeed
    if (walkK > 0.01) {
      const s = Math.abs(Math.sin(this.phase))
      y = s * TUNE.hop
      sy *= 1 + 0.06 * (s - 0.5) * 2 * walkK
      lean = 0.14 * walkK
    }
    const { legL, legR, tail } = this.chibi
    if (legL) {
      // Down onto her hips, legs reaching out in front over the seat, the tail lifted clear of it.
      y -= HIP_DROP * this.sitK
      if (tail) tail.rotation.x = 0.6 * this.sitK
    } else if (pose === 'sit') {
      y -= 0.1
      sy *= 0.92
    }
    if (pose === 'wai') {
      lean = 0.32
      headPitch = 0.15
    } else if (pose === 'peek') {
      lean = 0.22
      headPitch = 0.2
    } else if (pose === 'lookup') {
      headPitch = -0.5
    } else if (pose === 'bounce') {
      const level = BOUNCES[clamp(this.bounce.level, 0, BOUNCES.length - 1)]
      const period = 0.42 + level * 0.55
      const ph = (this.bounce.t % period) / period
      y += Math.sin(ph * Math.PI) * level
      // Squash in the mattress at each landing.
      const contact = 1 - span(Math.min(ph, 1 - ph), 0, 0.08)
      sy *= 1 - 0.2 * contact + 0.08 * Math.sin(ph * Math.PI)
    }
    // Settle wobble when she lands somewhere.
    if (this.settle < 1) sy *= 1 + wobble(this.settle, 2) * 0.12
    const lie = this.chibi.lie ?? { lift: this.chibi.radius, tilt: 0 }
    body.position.y = pose === 'lie' ? lie.lift * (1 - 0.5 * (1 - this.flop)) : y
    body.rotation.x = pose === 'lie' ? -(Math.PI / 2 - lie.tilt) * Math.min(1, this.flop * 1.2) : lean
    body.rotation.z = roll
    body.scale.set(1 / Math.sqrt(sy), sy, 1 / Math.sqrt(sy))
    if (legL && legR) {
      // A stride with each hop (one leg forward, then the other), and both forward when she sits.
      const stride = Math.sin(this.phase) * 0.5 * Math.min(1, walkK)
      legL.rotation.x = SIT_LEGS * this.sitK + stride
      legR.rotation.x = SIT_LEGS * this.sitK - stride
    }
    // Head: look at something interesting, otherwise ahead.
    let want = 0
    if (this.look && pose !== 'lie') {
      const local = this.root.worldToLocal(this.look.clone())
      want = clamp(Math.atan2(local.x, local.z), -0.9, 0.9)
    }
    this.headYaw += (want - this.headYaw) * 0.15
    head.rotation.set(headPitch, this.headYaw, 0)
  }
}

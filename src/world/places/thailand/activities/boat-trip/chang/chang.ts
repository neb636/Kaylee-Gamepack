// Baan Chang Cafe, the elephants in Krabi (plan: thailand/baan-chang.md), a world of its own inside the boat trip.
// Greybox 1 is only the yard's toy (`feed`): she pulls a banana or a stick of sugarcane out of Daddy's basket and holds
// it up over the rail. Every trunk in reach snakes after her finger, lagging and bending along its length; the first tip
// to touch the food curls round it (her finger lets go by itself), swings it up to the mouth, and the elephant munches,
// its ears flap and its belly gets a little rounder. Held high, the trunks stretch up; held low, they reach down over
// the boulders. A tap on a food (no drag) floats it to the hungriest trunk, and food let go far from every trunk falls
// on the gravel and gets snuffled up (or Daddy pops it back in the basket). Mali is big and slow and reaches further;
// Khanom is small, quick and always hungry. Three bites in a row and Mali burps. Taps: an elephant trumpets, the
// family hop, the basket wobbles. No voices yet.
import { Color, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { clamp, sounds } from '../../../../../../sdk'
import type { Avatar } from '../../../characters/avatar'
import type { AnchorInfo } from '../../../engine/Anchors'
import type { Shot } from '../../../engine/camera'
import { sfx } from '../../../sfx'
import { wearing } from '../../../trip/packing'
import { Stage, type AnchorSpot, type LegEvents, type Rider } from '../../../trip/legs/stage'
import { Basket, type Food } from './basket'
import { Elephant } from './elephant'
import { CHANG_FEEL } from './feel'
import { ELEPHANTS, FAMILY, HOLD, SHOT, type ElephantId, type FoodKind } from './layout'
import { tipOf } from './trunk'
import { buildYard } from './yard'

export type ChangSection = 'feed'

/** What the yard tells the trip around it. */
export interface ChangEvents extends LegEvents {
  /** Another food eaten: how many so far (the address bar keeps it, so a link reproduces the bellies). */
  fed(n: number): void
}

export const CHANG_ANCHORS: AnchorInfo[] = [
  { id: 'food:banana', label: 'Banana', kind: 'thing' },
  { id: 'food:cane', label: 'Sugarcane', kind: 'thing' },
  { id: 'ele:mali', label: 'Mali the elephant', kind: 'thing' },
  { id: 'ele:khanom', label: 'Khanom the baby elephant', kind: 'thing' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'family:kaylee', label: 'Kaylee', kind: 'family' },
]

type Mode = 'idle' | 'carry' | 'munch'

interface Eater {
  e: Elephant
  mode: Mode
  t: number
  food: Food | null
  /** When it last started after a food (for the sniff, not every frame). */
  sniffed: number
  chasing: boolean
}

/** The food in her hand: where her finger is (screen px) and where it went down, or gliding to a trunk by itself. */
interface Held {
  food: Food
  x: number
  y: number
  sx: number
  sy: number
  moved: boolean
  auto: Eater | null
}

const tmp = new Vector3()
const tmp2 = new Vector3()
const rest = new Vector3()

export class Chang extends Stage {
  private eaters: Eater[]
  private basket: Basket
  private riders: Record<'kaylee' | 'ji' | 'nick', Rider>
  private held: Held | null = null
  private fed: number
  /** Mali's bites lately (three in a row: a burp). */
  private maliBites: number[] = []
  private burpAt = -1

  constructor(
    renderer: WebGLRenderer,
    protected events: ChangEvents,
    readonly section: ChangSection,
    packed: string[],
    fed: number,
  ) {
    super(renderer, events)
    const { scene, bag } = this
    scene.background = new Color('#BFE6FF')
    this.rig.fov = 32
    this.fed = fed
    scene.add(buildYard(bag))
    this.eaters = ELEPHANTS.map((spot) => {
      const e = new Elephant(bag, spot)
      e.setReach(CHANG_FEEL.reach)
      e.root.userData.pick = `ele:${spot.id}`
      scene.add(e.root, e.trunk.root)
      return { e, mode: 'idle' as Mode, t: 0, food: null, sniffed: -9, chasing: false }
    })
    // A link with `fed`: the bellies are as round as that many meals (Khanom always gets the extra one).
    this.eater('khanom').e.full = Math.ceil(fed / 2)
    this.eater('mali').e.full = Math.floor(fed / 2)
    this.basket = new Basket(bag, scene)
    scene.add(this.basket.root)
    const { kaylee, members } = this.makeFamily(['ji', 'nick'])
    kaylee.wear(wearing(packed))
    this.riders = { kaylee, ji: members.get('ji')!, nick: members.get('nick')! }
    for (const id of ['kaylee', 'ji', 'nick'] as const) {
      const c = this.riders[id]
      const [x, z, face] = FAMILY[id]
      c.root.userData.pick = `family:${id}`
      scene.add(c.root)
      this.put(c, x, 0, z, 'stand', face)
    }
  }

  private eater(id: ElephantId) {
    return this.eaters.find((x) => x.e.id === id)!
  }

  // ---------------------------------------------------------------- touch

  protected pickRoots(): Object3D[] {
    return [...this.basket.foods.map((f) => f.obj), ...this.eaters.map((x) => x.e.root), ...Object.values(this.riders).map((r) => r.root)]
  }

  pointerDown(x = 0, y = 0, id?: string) {
    super.pointerDown()
    const what = id ?? this.pick(x, y)
    if (!what?.startsWith('food:') || this.held) return
    const food = this.basket.next(what.slice(5) as FoodKind)
    if (!food) return this.basket.poke()
    food.state = 'held'
    food.t = 0
    this.held = { food, x, y, sx: x, sy: y, moved: false, auto: null }
    this.touches++
    sounds.pickup()
  }

  pointerMove(x: number, y: number, _dx: number, _dy: number, down: boolean) {
    const h = this.held
    if (!down || !h || h.auto) return
    h.x = x
    h.y = y
    if (Math.hypot(x - h.sx, y - h.sy) > 12) h.moved = true
  }

  pointerUp() {
    const h = this.held
    if (!h || h.auto) return
    if (!h.moved) {
      // A tap: the food floats to the hungriest trunk by itself.
      h.auto = this.hungriest()
      sfx.fwip()
      return
    }
    // Let go away from every trunk: it falls on the gravel.
    this.held = null
    h.food.state = 'falling'
    h.food.vy = 0
    h.food.t = 0
  }

  protected onTap(id: string | null) {
    if (!id || id.startsWith('food:')) return
    if (id.startsWith('ele:')) {
      const x = this.eater(id.slice(4) as ElephantId)
      x.e.trumpet()
      if (x.e.id === 'khanom') sfx.squeal()
      else sfx.trumpet()
      return
    }
    if (id.startsWith('family:')) {
      const c = this.riders[id.slice(7) as 'ji']
      c?.react('hop')
      sfx.boing()
    }
  }

  /** Who should get a tapped food: the free elephant who has eaten least (Khanom, if it's a tie: always hungry). */
  private hungriest(): Eater {
    const free = this.eaters.filter((x) => x.mode === 'idle')
    const pool = free.length ? free : this.eaters
    return [...pool].sort((a, b) => a.e.full - b.e.full || (a.e.id === 'khanom' ? -1 : 1))[0]
  }

  // ---------------------------------------------------------------- per frame

  /** The point on the plane z = `z` under a screen point. */
  private onPlane(x: number, y: number, z: number, out: Vector3) {
    const cam = this.rig.camera
    const n = this.ndc(x, y)
    const near = out.set(n.x, n.y, -1).unproject(cam)
    const dir = tmp2.set(n.x, n.y, 1).unproject(cam).sub(near)
    return near.addScaledVector(dir, (z - near.z) / (dir.z || 1e-6))
  }

  protected step(dt: number, t: number) {
    const F = CHANG_FEEL
    const h = this.held
    // ---- The food in her hand: on the plane in front of the boulders, a little above her finger ----
    if (h) {
      const p = h.food.obj.position
      if (h.auto) tmp.copy(tipOf(h.auto.e.trunk))
      else {
        this.onPlane(h.x, h.y - F.lift, HOLD.z, tmp)
        tmp.set(clamp(tmp.x, HOLD.x0, HOLD.x1), clamp(tmp.y, HOLD.y0, HOLD.y1), HOLD.z)
      }
      // It stands up straight in her hand and swings a little as it moves.
      const o = h.food.obj.rotation
      o.x *= 1 - Math.min(1, dt * 6)
      o.z += (clamp((tmp.x - p.x) * -1.5, -0.5, 0.5) - o.z) * Math.min(1, dt * 8)
      p.lerp(tmp, 1 - Math.exp(-dt * (h.auto ? F.glide : 28)))
    }
    // ---- Foods falling, lying on the gravel, and coming back to the basket ----
    for (const f of this.basket.foods) {
      f.t += dt
      if (f.state === 'falling') {
        f.vy -= 9.8 * dt
        f.obj.position.y += f.vy * dt
        if (f.obj.position.y <= HOLD.ground) {
          f.obj.position.y = HOLD.ground
          f.obj.rotation.set(Math.PI / 2, f.obj.rotation.y, 0.4)
          f.state = 'ground'
          f.t = 0
          sfx.thump()
        }
      } else if (f.state === 'ground' && f.t > F.ground && !this.eaters.some((x) => x.chasing && x.food === null && this.targetOf(x) === f)) {
        // Out of everyone's reach: Daddy pops it back in.
        this.basket.putBack(f)
        sfx.pop()
      } else if (f.state === 'eaten' && f.t > 1.2) {
        this.basket.putBack(f)
        sfx.pop()
      }
    }
    // ---- The elephants: each trunk goes after food in reach, carries it to the mouth, munches ----
    for (const x of this.eaters) {
      const e = x.e
      x.t += dt
      const base = e.trunkRoot(tmp)
      const reach = e.reach
      let chase = e.id === 'khanom' ? F.chaseBaby : F.chase
      let target: Vector3
      let look: Vector3 | null = null
      if (x.mode === 'carry') {
        target = e.mouth(rest)
        chase *= 1.6
        if (x.t > F.curl) this.eat(x)
      } else if (x.mode === 'munch') {
        // The tip stays at the mouth while it chews, then lets go.
        target = e.mouth(rest).add(tmp2.set(0, -0.15 * e.spot.s, 0.2 * e.spot.s))
        if (x.t > F.munch) {
          x.mode = 'idle'
          x.t = 0
          if (e.id === 'mali' && this.burpAt < 0 && this.maliBites.filter((b) => this.time - b < F.burpWindow).length >= F.burp) this.burpAt = this.time + 0.4
        }
      } else {
        const food = this.targetOf(x)
        if (food) {
          target = food.obj.position
          look = food.obj.position
          if (!x.chasing && this.time - x.sniffed > 1.5) {
            x.sniffed = this.time
            sfx.sniff()
          }
          x.chasing = true
          // The first tip to touch it curls round it.
          if (tipOf(e.trunk).distanceTo(food.obj.position) < F.grab * (0.75 + 0.25 * e.spot.s)) this.grab(x, food)
        } else {
          x.chasing = false
          // Hanging behind the rail and swaying; held high when trumpeting.
          const sway = Math.sin(t * 1.3 + (e.id === 'mali' ? 0 : 2)) * 0.12 * reach
          target = e.trumpeting > 0 ? rest.copy(base).add(tmp2.set(0, reach * 0.7, reach * 0.45)) : rest.copy(base).add(tmp2.set(sway, -reach * 0.85, 0.12))
          if (h) look = h.food.obj.position
        }
      }
      e.update(dt, t, target, chase, look)
      // The food it's carrying rides at the tip.
      if (x.food && (x.mode === 'carry' || x.mode === 'munch')) {
        x.food.obj.position.copy(tipOf(e.trunk)).add(tmp2.set(0, -0.06, 0.04))
        x.food.obj.rotation.z += dt * 2
      }
    }
    // Mali's big burp (Daddy laughs).
    if (this.burpAt > 0 && this.time > this.burpAt) {
      this.burpAt = -1
      this.maliBites = []
      sfx.burp()
      this.eater('mali').e.trumpet()
      setTimeout(() => {
        if (this.disposed) return
        sfx.haha()
        this.riders.nick.react('hop')
      }, 500)
    }
    this.basket.update(dt)
    // ---- The family watch the food, and whoever is eating ----
    const munching = this.eaters.find((x) => x.mode !== 'idle')
    const watch = h ? h.food.obj.position : munching ? munching.e.headAt(tmp) : this.eater('mali').e.headAt(tmp)
    for (const c of Object.values(this.riders)) {
      c.lookAt(watch.x, watch.y, watch.z)
      c.update(dt, t)
    }
  }

  /** What a free trunk goes after: the food in her hand (if it's in reach, or floating to this trunk), else the
   *  nearest food on the gravel within its reach. */
  private targetOf(x: Eater): Food | null {
    const h = this.held
    const base = x.e.trunkRoot(tmp2)
    const reach = x.e.reach
    if (h && (h.auto ? h.auto === x : base.distanceTo(h.food.obj.position) < reach * CHANG_FEEL.notice)) return h.food
    let best: Food | null = null
    let bestD = reach * 1.02
    for (const f of this.basket.foods) {
      if (f.state !== 'ground') continue
      const d = base.distanceTo(f.obj.position)
      if (d < bestD) {
        best = f
        bestD = d
      }
    }
    return best
  }

  private grab(x: Eater, food: Food) {
    if (this.held?.food === food) this.held = null
    food.state = 'carried'
    x.food = food
    x.mode = 'carry'
    x.t = 0
    x.chasing = false
    sfx.sniff()
  }

  private eat(x: Eater) {
    const f = x.food!
    f.state = 'eaten'
    f.t = 0
    f.obj.visible = false
    x.mode = 'munch'
    x.t = 0
    x.e.ate()
    if (f.kind === 'cane') sfx.crunch()
    else sfx.munch()
    if (x.e.id === 'khanom') sfx.squeal()
    else sfx.rumble()
    if (x.e.id === 'mali') this.maliBites.push(this.time)
    x.food = null
    this.fed++
    this.events.fed(this.fed)
    // Kaylee bounces and giggles at every other bite.
    if (this.fed % 2 === 1) {
      this.riders.kaylee.react('hop')
      sfx.giggle()
    }
  }

  // ---------------------------------------------------------------- camera, anchors

  protected shot(): Shot {
    const s = this.w < this.h ? SHOT.tall : SHOT.wide
    return { center: new Vector3(...s.center), half: new Vector3(...s.half), yaw: s.yaw, pitch: s.pitch, minDist: 5 }
  }

  protected anchorAt(id: string): AnchorSpot | null {
    if (id === 'food:banana' || id === 'food:cane') {
      // (Hidden while she's holding one: her finger is busy.)
      if (this.held) return null
      return { at: this.basket.spot(id.slice(5) as FoodKind, new Vector3()), r: 0.34, glow: this.fed === 0 && this.time - this.lastTouch > 4, prio: 3 }
    }
    if (id.startsWith('ele:')) {
      const e = this.eater(id.slice(4) as ElephantId).e
      return { at: e.headAt(new Vector3()), r: 0.85 * e.spot.s, max: 220, prio: 1 }
    }
    if (id.startsWith('family:')) {
      const c = this.riders[id.slice(7) as 'ji']
      if (!c) return null
      return { at: c.root.getWorldPosition(new Vector3()).setY(c.height * 0.55), r: c.height * 0.3, max: 120 }
    }
    return null
  }

  protected hintAt() {
    return this.held ? null : this.basket.spot('banana', new Vector3())
  }

  /** The ?debug panel changed the trunks' reach. */
  retune() {
    for (const x of this.eaters) x.e.setReach(CHANG_FEEL.reach)
  }

  qa() {
    const r = (v: Vector3) => [+v.x.toFixed(2), +v.y.toFixed(2), +v.z.toFixed(2)]
    return {
      leg: 'chang',
      section: this.section,
      fed: this.fed,
      holding: this.held ? this.held.food.kind : null,
      trunks: this.eaters.map((x) => ({ id: x.e.id, mode: x.mode, full: x.e.full, chasing: x.chasing, tip: r(tipOf(x.e.trunk)), reach: +x.e.reach.toFixed(2) })),
      touches: this.touches,
      kaylee: (this.riders.kaylee as Avatar).wearing,
    }
  }
}

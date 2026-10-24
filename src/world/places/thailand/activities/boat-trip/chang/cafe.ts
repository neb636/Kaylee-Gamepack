// The cafe at Baan Chang (`drinks`, plan: thailand/baan-chang.md, "Side verb"): her chocolate milk, poured the mall
// cafe's way (mall-trip/games/cafe/shop.ts). Kaylee stands behind the counter of the open sala at the top of the
// boardwalk; the tray along the front holds the milk jug, the chocolate, a long spoon, three straws, a bowl of ice and
// Daddy's coffee pot.
//   - Pour: drag the milk jug to her glass. It's pulled in and tips as it gets there (the nearer, the more), and pours
//     in a stream. Too much and the milk fountains up out of the glass (silly, never wrong).
//   - Squeeze: hold the chocolate over the glass; it turns upside down and squirts brown ribbons into the milk.
//   - Stir: put the spoon in and go round and round; the ribbons swirl and melt into chocolate milk (clink, clink).
//   - A straw: pink, purple or yellow, dropped in (another one swaps it). It rides along to the yard (`straw`).
// A tap on any of them does it for her. Daddy's iced coffee is the optional second glass: ice cubes and the coffee pot,
// then he takes it ("ahh", and brrr with ice). Anything goes in either glass. Once hers has milk, chocolate, a stir and
// a straw, she has a sip and the 🐘 button (BoatTrip.tsx) takes them down to the elephants. Pokes: the glasses ring
// like a xylophone, the bell on the counter dings.
// The Chang world owns it: this is its scene, touch and frame while the section is `drinks`.
import { Group, Mesh, MeshBasicMaterial, OctahedronGeometry, IcosahedronGeometry, Vector2, Vector3, type Object3D, type PerspectiveCamera } from 'three'
import { bell, clamp, sounds } from '../../../../../../sdk'
import type { AnchorSpot } from '../../../trip/legs/stage'
import type { Shot } from '../../../engine/camera'
import type { Bag } from '../../../engine/dispose'
import { merge, P, solid } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import { Floaters } from '../../mall-trip/games/cafe/fx'
import { cafeSfx as sfx } from '../../mall-trip/games/cafe/sounds'
import { buildGlass, buildStraw, CHOC, chocBottle, coffeePot, COFFEE, counterBell, fillOf, iceBowl, iceCube, MILK_WHITE, milkJug, NOZZLE, pourInto, spoon, SPOON_KNOB, SPOUT, type Drink, type Glass } from './drink'
import { BELL, CAFE_FAMILY, CAFE_FAMILY_TALL, CAFE_HOLD_Z, CAFE_SHOT, DAD_GLASS, DAD_SIP, GLASS, HER_GLASS, STRAW_COLORS, TOOLS_TALL, TOOLS_WIDE, TRAY, type StrawColor, type ToolId } from './layout'
import { buildCafe } from './yard'

/** Pixels: what she holds sits this far above her finger (so the finger doesn't hide it). */
const LIFT = 34
/** How far a pourer tips (radians), and from how far it starts pouring. */
const TIP = 1.85
const POURS_AT = 0.95
/** How fast a full tip pours (glasses a second). */
const RATE = 0.5
const STRAWS: StrawColor[] = ['pink', 'purple', 'yellow']

type Who = 'her' | 'dad'
interface GlassState extends Drink {
  id: Who
  g: Glass
  straw: StrawColor | null
  /** Poured past full (a fountain at enough), seconds since anything went in, Daddy has it, a little hop. */
  over: number
  quiet: number
  served: boolean
  hop: number
}
interface Held {
  what: ToolId
  x: number
  y: number
  x0: number
  y0: number
  moved: boolean
  /** An ice cube from the bowl (the bowl stays). */
  cube?: Group
}
interface Auto {
  what: ToolId
  t: number
  glass: GlassState
  from: Vector2
}
interface Flight {
  obj: Object3D
  from: Vector3
  to: () => Vector3
  t: number
  dur: number
  arc: number
  done?: () => void
}

/** What the cafe needs from the world it's in. */
export interface CafeHost {
  camera(): PerspectiveCamera
  size(): { w: number; h: number }
  ndc(x: number, y: number): Vector2
  /** Kaylee and Mommy and Daddy (they're the yard's too). */
  riders: Record<'kaylee' | 'ji' | 'nick', { root: Object3D; react(k: 'hop' | 'wiggle' | 'wave'): void }>
  put(id: 'kaylee' | 'ji' | 'nick', x: number, z: number, face: number): void
  later(ms: number, fn: () => void): void
  /** Her drink is ready (the 🐘 shows), and she picked a straw. */
  ready(): void
  straw(c: StrawColor): void
}

const tmp = new Vector3()
const right = new Vector3()

export class Cafe {
  readonly root = new Group()
  private tools = new Map<ToolId, Group>()
  private homes = new Map<ToolId, Vector3>()
  private glasses: GlassState[]
  private bellObj: Group
  private bellT = 1
  private boards = new Map<string, Group>()
  private tall = false
  private step0 = 0.46
  private held: Held | null = null
  private auto: Auto | null = null
  private flights: Flight[] = []
  /** Which glass each straw is in. */
  private strawIn: Record<StrawColor, GlassState | null> = { pink: null, purple: null, yellow: null }
  private tilt = { milk: 0, coffee: 0, choc: 0 }
  private lastX = 0
  private vx = 0
  private lastF = new Vector2()
  private stirPx = 0
  private stream: Mesh
  private streamMat: MeshBasicMaterial
  private trickleT = 0
  private squirtT = 0
  private drops: Floaters
  private sparkles: Floaters
  private cool = new Map<string, number>()
  private time = 0
  private done = false
  private fountains = 0
  private touches = 0

  constructor(
    private bag: Bag,
    private host: CafeHost,
    straw: StrawColor | null,
  ) {
    this.root.add(buildCafe(bag))
    const make = (id: Who, at: readonly number[]): GlassState => {
      const g = buildGlass(bag)
      g.root.position.set(at[0], at[1], at[2])
      g.root.userData.pick = `glass:${id}`
      this.root.add(g.root)
      return { id, g, milk: 0, choc: 0, coffee: 0, stir: 0, ice: 0, straw: null, over: 0, quiet: 9, served: false, hop: 1 }
    }
    this.glasses = [make('her', HER_GLASS), make('dad', DAD_GLASS)]
    const add = (id: ToolId, g: Group) => {
      g.userData.pick = `tool:${id}`
      this.tools.set(id, g)
      this.root.add(g)
    }
    add('milk', milkJug(bag))
    add('choc', chocBottle(bag))
    add('spoon', spoon(bag))
    for (const c of STRAWS) add(`straw-${c}`, buildStraw(bag, c))
    add('ice', iceBowl(bag))
    add('coffee', coffeePot(bag))
    this.bellObj = counterBell(bag)
    this.bellObj.position.set(...BELL)
    this.bellObj.userData.pick = 'bell'
    this.root.add(this.bellObj)
    // The stream from a spout (or the bottle's nozzle) down to the drink.
    this.streamMat = bag.add(new MeshBasicMaterial({ color: '#ffffff' }))
    this.stream = new Mesh(bag.add(P.cyl(1, 0.8, 1, '#fff', { at: [0, -0.5, 0] }, 10)), this.streamMat)
    this.stream.visible = false
    this.root.add(this.stream)
    this.drops = new Floaters(new IcosahedronGeometry(0.5, 0), 160, bag, 6, 0.3, 0.02)
    this.sparkles = new Floaters(new OctahedronGeometry(0.5), 60, bag, 1.2, 1.2)
    this.root.add(this.drops.mesh, this.sparkles.mesh)
    // A link with a straw: it's in her glass already (a drink half made).
    if (straw) this.putStraw(this.glasses[0], straw, false)
    this.layout(false)
  }

  private get her() {
    return this.glasses[0]
  }
  private get dad() {
    return this.glasses[1]
  }

  /** She's here: the family at the counter. */
  enter() {
    const spots = this.tall ? CAFE_FAMILY_TALL : CAFE_FAMILY
    for (const id of ['kaylee', 'nick', 'ji'] as const) {
      const [x, z, face] = spots[id]
      this.host.put(id, x, z, face)
    }
  }

  /** The tray's things in one row on a wide screen, two on a tall one (and toy-sized: bigger than life). */
  layout(tall: boolean) {
    this.tall = tall
    const rows = tall ? TOOLS_TALL : [TOOLS_WIDE]
    this.step0 = tall ? 0.7 : Math.min(0.5, 3.6 / TOOLS_WIDE.length)
    const s = this.step0
    for (const b of this.boards.values()) b.visible = false
    rows.forEach((row, r) => {
      const y = r ? TRAY.yB : TRAY.y
      const z = r ? TRAY.zB : TRAY.z
      row.forEach((id, i) => this.homes.set(id, new Vector3((i - (row.length - 1) / 2) * s, y, z)))
      const key = `${r}:${row.length}:${s.toFixed(2)}`
      let b = this.boards.get(key)
      if (!b) {
        b = new Group()
        b.add(board(row.length * s + 0.1, y, z, this.bag))
        this.boards.set(key, b)
        this.root.add(b)
      }
      b.visible = true
    })
    for (const [id, g] of this.tools) {
      g.scale.setScalar(this.scaleOf(id))
      if (this.atHome(id)) {
        g.position.copy(this.homes.get(id)!).add(tmp.set(0, this.restY(id), 0))
        g.rotation.set(0, 0, 0)
      }
    }
  }

  /** The jug, the bottle, the pot and the bowl are toy-sized; the spoon and the straws stay life-sized (they go in a glass). */
  private scaleOf(id: ToolId) {
    return id === 'spoon' || id.startsWith('straw-') ? 1 : this.tall ? 1.7 : 1.45
  }
  /** How high over the tray its origin sits (the jug, the bottle and the pot are built round their middles). */
  private restY(id: ToolId) {
    const k = this.scaleOf(id)
    if (id === 'milk') return 0.085 * k
    if (id === 'choc') return 0.1 * k
    if (id === 'coffee') return 0.088 * k
    if (id === 'spoon') return 0.018
    return 0
  }
  private atHome(id: ToolId) {
    if (this.active() === id) return false
    if (id.startsWith('straw-') && this.strawIn[id.slice(6) as StrawColor]) return false
    return !this.flights.some((f) => f.obj === this.tools.get(id))
  }
  /** What's moving under her finger (or a tap's). */
  private active(): ToolId | null {
    return this.auto?.what ?? (this.held?.moved ? this.held.what : null)
  }

  // ---------------------------------------------------------------- touch

  pickRoots(): Object3D[] {
    return [...this.tools.values(), ...this.glasses.map((g) => g.g.root), this.bellObj]
  }

  down(x: number, y: number, what: string | null) {
    if (!what?.startsWith('tool:') || this.auto || this.held) return
    this.held = { what: what.slice(5) as ToolId, x, y, x0: x, y0: y, moved: false }
    this.lastX = x
    this.lastF.set(x, y)
  }

  move(x: number, y: number) {
    const h = this.held
    if (!h) return
    h.x = x
    h.y = y
    if (h.moved || Math.hypot(x - h.x0, y - h.y0) < 10) return
    h.moved = true
    this.touches++
    sfx.pickup()
    if (h.what === 'ice') {
      h.cube = iceCube(this.bag)
      h.cube.scale.setScalar(1.3)
      this.root.add(h.cube)
    }
    // A straw out of a glass.
    if (h.what.startsWith('straw-')) {
      const c = h.what.slice(6) as StrawColor
      const gs = this.strawIn[c]
      if (gs) gs.straw = null
      this.strawIn[c] = null
    }
  }

  up() {
    const h = this.held
    this.held = null
    if (!h) return
    if (!h.moved) return this.tapTool(h.what)
    this.stream.visible = false
    const tip = new Vector2(h.x, h.y - LIFT)
    const gs = this.glassAt(tip)
    if (h.what.startsWith('straw-')) {
      const c = h.what.slice(6) as StrawColor
      if (gs) this.putStraw(gs, c, false)
      else this.flyHome(h.what)
    } else if (h.what === 'ice' && h.cube) {
      const cube = h.cube
      if (gs) this.iceIn(gs, cube)
      else this.fly(cube, () => this.homes.get('ice')!.clone().add(tmp.set(0, 0.12, 0)), 0.35, 0.15, () => cube.removeFromParent())
    } else this.flyHome(h.what)
  }

  /** A tap on a thing on the tray: it does its job for her. */
  private tapTool(id: ToolId) {
    this.touches++
    const her = this.her
    const dad = this.dad
    const open = (g: GlassState) => !g.served
    if (id.startsWith('straw-')) {
      const c = id.slice(6) as StrawColor
      // Into her glass (or, if it's hers already, Daddy's).
      const to = her.straw === c && open(dad) ? dad : her
      return this.putStraw(to, c, true)
    }
    if (id === 'ice') {
      const to = open(dad) && dad.ice < 3 ? dad : her
      const cube = iceCube(this.bag)
      cube.scale.setScalar(1.3)
      cube.position.copy(this.homes.get('ice')!).add(tmp.set(0, 0.15, 0))
      this.root.add(cube)
      sfx.fwip()
      return this.iceIn(to, cube)
    }
    // The coffee goes to Daddy's glass (while he hasn't had it); everything else to hers.
    const glass = id === 'coffee' && open(dad) ? dad : her
    const s = this.toPx(this.tools.get(id)!.position, 0)
    this.auto = { what: id, t: 0, glass, from: new Vector2(s?.x ?? 0, (s?.y ?? 0) + LIFT) }
    sfx.pickup()
  }

  tap(id: string) {
    if (id.startsWith('glass:')) {
      const gs = id === 'glass:her' ? this.her : this.dad
      gs.hop = 0
      // It rings like a xylophone: the fuller, the lower.
      sounds.note(Math.round(clamp(9 - fillOf(gs) * 8, 0, 10)))
      if (gs === this.her && this.done) {
        sfx.slurp()
        this.host.riders.kaylee.react('wiggle')
      }
      return true
    }
    if (id === 'bell') {
      this.bellT = 0
      sfx.ding()
      this.host.later(250, () => this.host.riders.ji.react('hop'))
      return true
    }
    return false
  }

  // ---------------------------------------------------------------- the drink

  private putStraw(gs: GlassState, c: StrawColor, fly: boolean) {
    const obj = this.tools.get(`straw-${c}`)!
    // (The straw that was in it goes back to the tray; this one leaves any glass it was in.)
    if (gs.straw && gs.straw !== c) {
      const old = gs.straw
      this.strawIn[old] = null
      this.flyHome(`straw-${old}`)
    }
    const was = this.strawIn[c]
    if (was) was.straw = null
    gs.straw = c
    gs.hop = 0
    const land = () => {
      this.strawIn[c] = gs
      sfx.pop()
    }
    if (fly) {
      sfx.fwip()
      this.fly(obj, () => gs.g.slot.getWorldPosition(new Vector3()), 0.45, 0.25, land)
    } else land()
    if (gs === this.her) this.host.straw(c)
  }

  private iceIn(gs: GlassState, cube: Group) {
    this.fly(cube, () => gs.g.root.position.clone().add(tmp.set(0, GLASS.h + 0.05, 0)), 0.4, 0.2, () => {
      cube.removeFromParent()
      gs.hop = 0
      sfx.plunk()
      sfx.clink()
      if (gs.ice < 3) gs.ice++
      else this.drops.burst(gs.g.root.position.clone().add(tmp.set(0, GLASS.h, 0)), 6, 0.4, 1.2, 0.5, 0.025, ['#DDF3FF'])
    })
  }

  /** Poured past the top: the milk (or the coffee) fountains up out of the glass, and everyone laughs. */
  private fountain(gs: GlassState) {
    gs.over = 0
    gs.hop = 0
    this.fountains++
    const top = gs.g.root.position.clone().add(tmp.set(0, GLASS.h, 0))
    const c = '#' + MILK_WHITE.clone().lerp(gs.coffee > gs.milk ? COFFEE : CHOC, gs.coffee > gs.milk ? 1 : clamp(gs.choc * 2, 0, 0.8)).getHexString()
    for (let i = 0; i < 40; i++) this.drops.emit(top, tmp.set((Math.random() - 0.5) * 0.9, 1.6 + Math.random() * 1.6, (Math.random() - 0.3) * 0.5), 0.9 + Math.random() * 0.4, 0.022 + Math.random() * 0.02, c)
    sfx.boing()
    sfx.splash(0.4)
    this.host.later(250, () => {
      sfx.giggle()
      this.host.riders.kaylee.react('hop')
      this.host.riders.ji.react('hop')
    })
  }

  private flyHome(id: ToolId) {
    const g = this.tools.get(id)!
    this.fly(g, () => this.homes.get(id)!.clone().add(new Vector3(0, this.restY(id), 0)), 0.35, 0.15)
  }

  private fly(obj: Object3D, to: () => Vector3, dur: number, arc: number, done?: () => void) {
    this.flights = this.flights.filter((f) => f.obj !== obj)
    this.flights.push({ obj, from: obj.position.clone(), to, t: 0, dur, arc, done })
  }

  // ---------------------------------------------------------------- per frame

  step(dt: number) {
    this.time += dt
    const what = this.active()
    const finger = this.auto ? this.autoFinger(dt) : what ? new Vector2(this.held!.x, this.held!.y) : null
    let streaming = false
    this.tools.get('choc')!.scale.setScalar(this.scaleOf('choc'))
    for (const gs of this.glasses) gs.g.liquidMat.uniforms.uSpin.value *= Math.exp(-dt * 3)
    if (what && finger) {
      if (what === 'milk' || what === 'coffee') streaming = this.trackPour(what, finger, dt)
      else if (what === 'choc') streaming = this.trackSqueeze(finger, dt)
      else if (what === 'spoon') this.trackStir(finger, dt)
      else this.trackCarry(what, finger)
      this.lastF.copy(finger)
    }
    if (!streaming) this.stream.visible = false
    // The things at rest settle back on the tray (or in their glass, a straw).
    for (const [id, g] of this.tools) {
      if (id.startsWith('straw-') && this.strawIn[id.slice(6) as StrawColor] && !this.flights.some((f) => f.obj === g)) {
        const gs = this.strawIn[id.slice(6) as StrawColor]!
        gs.g.slot.getWorldPosition(g.position)
        gs.g.slot.getWorldQuaternion(g.quaternion)
        continue
      }
      if (!this.atHome(id)) continue
      g.position.lerp(tmp.copy(this.homes.get(id)!).add(new Vector3(0, this.restY(id), 0)), 1 - Math.exp(-dt * 12))
      g.rotation.z *= Math.exp(-dt * 10)
      g.rotation.x = g.rotation.y = 0
    }
    for (const k of ['milk', 'coffee', 'choc'] as const) if (what !== k) this.tilt[k] *= Math.exp(-dt * 10)
    // Flights: a straw to a glass, an ice cube, things going home, Daddy's glass to him.
    for (const f of [...this.flights]) {
      f.t += dt / f.dur
      const k = Math.min(1, f.t)
      f.obj.position.lerpVectors(f.from, f.to(), k)
      f.obj.position.y += bell(k) * f.arc
      if (k >= 1) {
        this.flights.splice(this.flights.indexOf(f), 1)
        f.done?.()
      }
    }
    // The glasses: what's in them, a hop when something lands, Daddy taking his.
    for (const gs of this.glasses) {
      gs.quiet += dt
      gs.hop = Math.min(1, gs.hop + dt / 0.35)
      gs.g.root.scale.set(1 - bell(gs.hop) * 0.06, 1 + bell(gs.hop) * 0.1, 1 - bell(gs.hop) * 0.06)
      pourInto(gs.g, gs)
      gs.g.liquidMat.uniforms.uTime.value = this.time
    }
    const dad = this.dad
    if (!dad.served && fillOf(dad) >= 0.5 && dad.quiet > 1.2 && this.active() === null) this.daddyDrinks()
    const her = this.her
    if (!this.done && her.milk >= 0.45 && her.choc >= 0.05 && her.stir >= 0.85 && her.straw && this.strawIn[her.straw] === her && this.active() === null) this.ready()
    this.bellT = Math.min(1, this.bellT + dt / 0.4)
    this.bellObj.scale.setScalar(1 + bell(this.bellT) * 0.25)
    this.drops.update(dt)
    this.sparkles.update(dt)
  }

  /** Daddy takes his glass, sips, "ahh" (and brrr, with ice). */
  private daddyDrinks() {
    const dad = this.dad
    dad.served = true
    const g = dad.g.root
    this.fly(g, () => new Vector3(...DAD_SIP), 0.5, 0.15, () => {
      this.host.riders.nick.react('hop')
      sfx.slurp()
      this.host.later(600, () => {
        sfx.aah()
        if (dad.ice > 0)
          this.host.later(500, () => {
            sfx.brrr()
            this.host.riders.nick.react('wiggle')
          })
        else this.host.later(400, () => sfx.haha())
      })
    })
  }

  /** Her chocolate milk is ready: a sip, a sparkle, and the 🐘 to go and see the elephants. */
  private ready() {
    this.done = true
    const her = this.her
    this.host.later(350, () => {
      her.hop = 0
      sfx.slurp()
      this.host.riders.kaylee.react('wiggle')
      this.sparkles.burst(her.g.root.position.clone().add(tmp.set(0, GLASS.h + 0.1, 0)), 18, 0.8, 0.8, 0.9, 0.04, [PAL.gold, PAL.pink, '#FFFFFF'])
      sounds.sparkle()
      this.host.ready()
    })
  }

  /** A tap's finger: from the tray to the glass, holding there (going round, for the spoon) till it's done. */
  private autoFinger(dt: number): Vector2 | null {
    const a = this.auto!
    a.t += dt
    const gs = a.glass
    const top = this.topOf(gs)
    const at = a.what === 'choc' ? this.squeezePoint(top) : a.what === 'spoon' ? this.stirPoint(gs) : this.pourPoint(top)
    const s = this.toPx(at, 0)
    const fill = fillOf(gs)
    const finished =
      a.what === 'choc' ? a.t > 1.7 || gs.choc >= 0.4 : a.what === 'spoon' ? a.t > 2.4 || (a.t > 1.2 && gs.stir >= 1) : a.t > 0.7 && (fill >= 0.9 || gs.served)
    if (!s || a.t > 4 || finished) {
      const id = a.what
      this.auto = null
      this.stream.visible = false
      this.flyHome(id)
      return null
    }
    const p = new Vector2(s.x, s.y + LIFT)
    if (a.what === 'spoon' && a.t > 0.4) p.add(new Vector2(Math.cos(a.t * 9) * 30, Math.sin(a.t * 9) * 14))
    if (a.t < 0.4) return a.from.clone().lerp(p, a.t / 0.4)
    return p
  }

  private topOf(gs: GlassState) {
    return gs.g.root.position.clone().add(new Vector3(0, GLASS.h, 0))
  }
  /** Where to hold a pourer to pour into a glass (its middle, up and to the left of the rim). */
  private pourPoint(top: Vector3) {
    const k = this.scaleOf('milk') / 1.45
    return top.clone().add(new Vector3(-0.09 * k, 0.22 * k, 0.06))
  }
  /** Where the chocolate bottle hangs upside down to squirt into a glass. */
  private squeezePoint(top: Vector3) {
    return top.clone().add(new Vector3(0, 0.36 * (this.scaleOf('choc') / 1.45), 0.05))
  }
  /** Where the spoon's knob is with its bowl in a glass. */
  private stirPoint(gs: GlassState) {
    return gs.g.root.position.clone().add(new Vector3(0, 0.07 + SPOON_KNOB, 0.02))
  }

  /** The nearest glass to a pour point (and how near, 0..1). */
  private nearest(finger: Vector2, at: (gs: GlassState) => Vector3) {
    let best: GlassState | null = null
    let bestK = 0
    for (const gs of this.glasses) {
      if (gs.served || this.flights.some((f) => f.obj === gs.g.root)) continue
      const s = this.toPx(at(gs), 0.36)
      if (!s) continue
      const R = Math.max(96, s.r)
      const k = clamp((1 - Math.hypot(finger.x - s.x, finger.y - LIFT - s.y) / R) / 0.6, 0, 1)
      if (k > bestK) {
        bestK = k
        best = gs
      }
    }
    return { best, k: bestK }
  }

  /** The milk jug or the coffee pot follows her finger; near a glass it's pulled in and tips, and pours. */
  private trackPour(what: 'milk' | 'coffee', finger: Vector2, dt: number) {
    const obj = this.tools.get(what)!
    const hold = this.onPlane(finger.x, finger.y - LIFT)
    const { best, k } = this.nearest(finger, (gs) => this.pourPoint(this.topOf(gs)))
    if (best) obj.position.copy(hold).lerp(this.pourPoint(this.topOf(best)), k * 0.75)
    else obj.position.copy(hold)
    this.vx = this.vx * 0.8 + (finger.x - this.lastX) * 0.2
    this.lastX = finger.x
    const goal = best ? k * TIP : clamp(-this.vx * 0.012, -0.3, 0.3)
    const tilt = (this.tilt[what] += (goal - this.tilt[what]) * (1 - Math.exp(-dt * 10)))
    obj.rotation.set(0, 0, -tilt)
    const rate = clamp((tilt - POURS_AT) / (TIP - POURS_AT), 0, 1)
    if (!best || rate <= 0) return false
    const gs = best
    const amt = rate * RATE * dt
    const before = fillOf(gs)
    const into = Math.min(amt, Math.max(0, 1 - before))
    if (what === 'milk') gs.milk += into
    else gs.coffee += into
    // (Fresh milk on top of the chocolate makes new ribbons.)
    if (gs.choc > 0) gs.stir = Math.max(0, gs.stir - into * 0.6)
    gs.quiet = 0
    if (amt - into > 0) {
      gs.over += amt - into
      if (gs.over > 0.12 && this.ready_('fountain', 2.2)) this.fountain(gs)
    }
    const surface = gs.g.root.position.clone().add(tmp.set(0, 0.02 + before * GLASS.h * 0.92, 0))
    this.pourStream(obj.localToWorld(SPOUT.clone()), surface, what === 'milk' ? '#FFFFFF' : '#' + COFFEE.getHexString(), 0.016 * (0.5 + rate * 0.6))
    return true
  }

  /** The chocolate follows her finger; over a glass it turns upside down and squirts. */
  private trackSqueeze(finger: Vector2, dt: number) {
    const obj = this.tools.get('choc')!
    const hold = this.onPlane(finger.x, finger.y - LIFT)
    const { best, k } = this.nearest(finger, (gs) => this.squeezePoint(this.topOf(gs)))
    if (best) obj.position.copy(hold).lerp(this.squeezePoint(this.topOf(best)), k * 0.8)
    else obj.position.copy(hold)
    const goal = best ? k * Math.PI : 0
    const flip = (this.tilt.choc += (goal - this.tilt.choc) * (1 - Math.exp(-dt * 9)))
    obj.rotation.set(0, 0, flip)
    if (!best || flip < 2.5) return false
    const gs = best
    gs.choc = Math.min(0.4, gs.choc + dt * 0.16)
    gs.stir = Math.max(0, gs.stir - dt * 1.4)
    gs.quiet = 0
    // It squishes a little as she squeezes.
    obj.scale.set(this.scaleOf('choc') * (1 + Math.sin(this.time * 18) * 0.04), this.scaleOf('choc'), this.scaleOf('choc'))
    this.squirtT -= dt
    if (this.squirtT <= 0) {
      this.squirtT = 0.35
      sfx.squirt()
    }
    const surface = gs.g.root.position.clone().add(tmp.set(0, 0.02 + fillOf(gs) * GLASS.h * 0.92, 0))
    this.pourStream(obj.localToWorld(NOZZLE.clone()), surface, '#' + CHOC.getHexString(), 0.009)
    return true
  }

  /** The spoon follows her finger by its knob; in a glass its bowl goes round inside, and stirring melts the ribbons. */
  private trackStir(finger: Vector2, dt: number) {
    const obj = this.tools.get('spoon')!
    let inside: GlassState | null = null
    let s: { x: number; y: number; r: number } | null = null
    for (const gs of this.glasses) {
      if (gs.served) continue
      const p = this.toPx(this.stirPoint(gs), 0.2)
      if (p && Math.hypot(finger.x - p.x, finger.y - LIFT - p.y) < Math.max(80, p.r)) {
        inside = gs
        s = p
      }
    }
    if (!inside || !s) {
      obj.position.lerp(this.onPlane(finger.x, finger.y - LIFT).sub(tmp.set(0, SPOON_KNOB, 0)), 1 - Math.exp(-dt * 25))
      obj.rotation.set(0, 0, clamp((finger.x - this.lastF.x) * -0.02, -0.3, 0.3))
      return
    }
    const ox = clamp((finger.x - s.x) / 50, -1, 1)
    const oz = clamp((finger.y - LIFT - s.y) / 30, -1, 1)
    const c = inside.g.root.position
    obj.position.lerp(tmp.set(c.x + ox * 0.045, c.y + 0.07, c.z + oz * 0.04), 1 - Math.exp(-dt * 20))
    obj.rotation.set(oz * 0.15, 0, -ox * 0.2)
    const moved = Math.hypot(finger.x - this.lastF.x, finger.y - this.lastF.y)
    if (fillOf(inside) > 0.03) {
      inside.stir = Math.min(1, inside.stir + moved / 520)
      inside.g.liquidMat.uniforms.uSpin.value = clamp(moved / Math.max(dt, 0.001) / 200, 0, 3)
    }
    this.stirPx += moved
    if (this.stirPx > 130) {
      this.stirPx = 0
      sfx.clink()
    }
  }

  private trackCarry(what: ToolId, finger: Vector2) {
    const g = what === 'ice' ? this.held?.cube : this.tools.get(what)
    if (!g) return
    const p = this.onPlane(finger.x, finger.y - LIFT)
    // (A straw by its middle.)
    if (what.startsWith('straw-')) p.y -= 0.2
    g.position.copy(p)
    g.quaternion.identity()
    g.rotation.z = clamp((finger.x - this.lastX) * -0.02, -0.4, 0.4)
    this.lastX = finger.x
  }

  private pourStream(from: Vector3, to: Vector3, color: string, wid: number) {
    const s = this.stream
    s.visible = true
    this.streamMat.color.set(color)
    s.position.copy(from)
    const d = tmp.copy(to).sub(from)
    const len = Math.max(0.02, d.length())
    s.quaternion.setFromUnitVectors(new Vector3(0, -1, 0), d.normalize())
    s.scale.set(wid, len, wid)
    if (Math.random() < 0.3) this.drops.emit(to, new Vector3((Math.random() - 0.5) * 0.5, 0.6 + Math.random() * 0.4, 0.1), 0.35, 0.016, color)
    this.trickleT -= 1 / 60
    if (this.trickleT <= 0) {
      this.trickleT = 0.14
      sfx.trickle()
    }
  }

  private ready_(key: string, every: number) {
    if (this.time < (this.cool.get(key) ?? -9)) return false
    this.cool.set(key, this.time + every)
    return true
  }

  // ---------------------------------------------------------------- screen

  private toPx(world: Vector3, r: number) {
    const cam = this.host.camera()
    const { w, h } = this.host.size()
    const c = world.clone().project(cam)
    if (c.z > 1) return null
    right.set(1, 0, 0).applyQuaternion(cam.quaternion)
    const e = world.clone().addScaledVector(right, r).project(cam)
    return { x: ((c.x + 1) / 2) * w, y: ((1 - c.y) / 2) * h, r: (Math.abs(e.x - c.x) * w) / 2 }
  }
  private onPlane(x: number, y: number) {
    const cam = this.host.camera()
    const n = this.host.ndc(x, y)
    const near = new Vector3(n.x, n.y, -1).unproject(cam)
    const dir = new Vector3(n.x, n.y, 1).unproject(cam).sub(near)
    return near.addScaledVector(dir, (CAFE_HOLD_Z - near.z) / (dir.z || 1e-6))
  }
  /** The glass under a point (its middle or its top, with some room round it). */
  private glassAt(tip: Vector2) {
    let best: GlassState | null = null
    let bestD = Infinity
    for (const gs of this.glasses) {
      if (gs.served) continue
      const s = this.toPx(gs.g.root.position.clone().add(tmp.set(0, GLASS.h * 0.8, 0)), 0.2)
      if (!s) continue
      const d = Math.hypot(tip.x - s.x, tip.y - s.y)
      if (d < Math.max(90, s.r) && d < bestD) {
        best = gs
        bestD = d
      }
    }
    return best
  }

  /** What the family watch: the thing in her hand, else her glass. */
  watch(out: Vector3) {
    const a = this.active()
    if (a) return out.copy(a === 'ice' && this.held?.cube ? this.held.cube.position : this.tools.get(a)!.position)
    return out.copy(this.her.g.root.position).add(tmp.set(0, 0.2, 0))
  }

  shot(): Shot {
    const s = this.tall ? CAFE_SHOT.tall : CAFE_SHOT.wide
    return { center: new Vector3(...s.center), half: new Vector3(...s.half), yaw: s.yaw, pitch: s.pitch, minDist: 4 }
  }

  /** The next thing her drink needs (it glows after a while, and the finger points at it). */
  private next(): ToolId[] {
    const her = this.her
    if (this.done) return []
    if (her.milk < 0.45) return ['milk']
    if (her.choc < 0.05) return ['choc']
    if (her.stir < 0.85) return ['spoon']
    if (!her.straw) return STRAWS.map((c) => `straw-${c}` as ToolId)
    return []
  }

  anchorAt(id: string, idle: number): AnchorSpot | null {
    if (id.startsWith('tool:')) {
      const t = id.slice(5) as ToolId
      if (!this.atHome(t)) return null
      return { at: this.homes.get(t)!.clone().add(new Vector3(0, t === 'spoon' || t.startsWith('straw-') ? 0.22 : 0.12, 0)), r: this.tall ? 0.24 : this.step0 * 0.47, prio: 3, max: this.tall ? 120 : 140, glow: idle > 4 && this.next().includes(t) }
    }
    if (id.startsWith('glass:')) {
      const gs = id === 'glass:her' ? this.her : this.dad
      if (gs.served || this.flights.some((f) => f.obj === gs.g.root)) return null
      return { at: gs.g.root.position.clone().add(new Vector3(0, GLASS.h * 0.5, 0)), r: 0.15, prio: 2, max: 110 }
    }
    if (id === 'bell') return { at: this.bellObj.position.clone().add(new Vector3(0, 0.05, 0)), r: 0.15, prio: 2, max: 100 }
    return null
  }

  hintAt() {
    if (this.active() || this.flights.length) return null
    const t = this.next()[0]
    return t ? this.homes.get(t)!.clone().add(new Vector3(0, 0.32, 0)) : null
  }

  qa() {
    const px = (v: Vector3) => {
      const s = this.toPx(v, 0)
      return s ? [Math.round(s.x), Math.round(s.y)] : null
    }
    const g = (gs: GlassState) => ({ milk: +gs.milk.toFixed(2), choc: +gs.choc.toFixed(2), coffee: +gs.coffee.toFixed(2), stir: +gs.stir.toFixed(2), ice: gs.ice, straw: gs.straw, fill: +fillOf(gs).toFixed(2), served: gs.served })
    const tools: Record<string, number[] | null> = {}
    for (const [id, h] of this.homes) tools[id] = px(h.clone().add(new Vector3(0, 0.12, 0)))
    return {
      her: g(this.her),
      dad: g(this.dad),
      ready: this.done,
      next: this.next()[0] ?? null,
      held: this.active(),
      pouring: this.stream.visible,
      fountains: this.fountains,
      touches: this.touches,
      liftPx: LIFT,
      tools,
      /** Where her finger goes to pour (or squeeze, or stir) into each glass. */
      pourAt: this.glasses.map((gs) => px(this.pourPoint(this.topOf(gs)))?.map((v, i) => (i ? v + LIFT : v)) ?? null),
      squeezeAt: this.glasses.map((gs) => px(this.squeezePoint(this.topOf(gs)))?.map((v, i) => (i ? v + LIFT : v)) ?? null),
      stirAt: this.glasses.map((gs) => px(this.stirPoint(gs))?.map((v, i) => (i ? v + LIFT : v)) ?? null),
      glassAt: this.glasses.map((gs) => px(gs.g.root.position.clone().add(new Vector3(0, GLASS.h * 0.8, 0)))?.map((v, i) => (i ? v + LIFT : v)) ?? null),
      strawColor: STRAW_COLORS,
    }
  }
}

/** The tray's board: a white shelf on two legs, with a lavender edge (the mall cafe's). */
function board(wide: number, y: number, z: number, bag: Bag) {
  return solid(
    merge([
      P.rbox(wide, 0.06, 0.38, 0.03, '#FFFFFF', { at: [0, y - 0.03, z] }),
      P.box(wide, 0.05, 0.03, PAL.lavenderDark, { at: [0, y - 0.01, z + 0.19] }),
      ...[-1, 1].map((sx) => P.cyl(0.025, 0.025, Math.max(0.02, y - 0.06), '#D8D2E6', { at: [sx * (wide / 2 - 0.08), Math.max(0.01, (y - 0.06) / 2), z - 0.1] })),
    ]),
    bag,
    2,
  )
}

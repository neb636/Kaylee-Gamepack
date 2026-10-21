// The Barber Salon in Harbor Town (plan: planning/around-the-world/thailand/mall-trip.md, "★ 2. The Barber Salon"),
// greybox: shapes, sounds, no voices. Daddy sits in the big chair facing her, a cape round him; Kaylee stands on her
// step stool beside him; Mommy waits on the bench with her phone.
//
// The toy: grab a tool from the trolley and work it on his mane (mane.ts: strands, each with its own length and
// color). The tool's working end sits just above her finger, and it works on the strands under it on screen:
//   - grow tonic: squirt it and the hair there grows long and wild (on his eyebrows: big bushy brows)
//   - scissors: snip where she drags, and the tufts fall (every strand the sweep crosses, so a quick swipe on an iPhone
//     still cuts); snip his horn and it boings back
//   - comb: drag up for spikes, down to smooth it flat
//   - dryer: a big poof; held on for a while it goes to full and blows everyone's mane
//   - color spray: the color goes round the rainbow as she sprays, so a sweep paints stripes
//   - bows and a clip: put them in the hair
// Rounds: (1) grow and snip, (2) colors, the dryer, bows, (3) kids come in with a picture card (spiky, pigtails,
// curly): whatever she makes, "close enough!". After a dozen or so touches of hair work the mirror glows: a tap and
// the chair spins round to it, Daddy poses and Mommy takes a photo. Daddy keeps the hairdo (the `hair` param).
// A tap on a tool does a short go with it, so dragging is never a must. Nothing fails.
import { CapsuleGeometry, Color, IcosahedronGeometry, OctahedronGeometry, Vector2, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { bell, wobble } from '../../../../../../../sdk'
import type { Avatar } from '../../../../characters/avatar'
import { LOOKS } from '../../../../characters/looks'
import type { Member } from '../../../../characters/member'
import type { AnchorInfo } from '../../../../engine/Anchors'
import type { Shot } from '../../../../engine/camera'
import { merge, P, solid } from '../../../../engine/geo'
import { PAL } from '../../../../engine/toon'
import { Stage, type AnchorSpot, type LegEvents } from '../../../../trip/legs/stage'
import { Racer } from '../race/racer'
import { Floaters } from '../vet/fx'
import { HAIR_COLORS, LEN_STEPS, RAINBOW, TUFTS, type BowId } from './hair'
import { ALL_ITEMS, BENCH, CHAIR, CUSTOMERS, DOOR, ENOUGH, ENOUGH_KID, KAYLEE_FACE, LIFT_PX, MIRROR, MOMMY, POLE, ROOM, SHELF, STOOL, TRAYS, type Card, type Round, type ToolId } from './layout'
import { Mane } from './mane'
import { buildRoom, type Room } from './room'
import { barberSfx as sfx } from './sounds'
import { buildTool, type Tool } from './tools'

export interface BarberEvents extends LegEvents {
  /** The round now (the address bar follows). */
  round(n: Round): void
  /** Daddy's hairdo changed (the `hair` param). */
  hair(code: string): void
  /** The mirror's reveal is done (the sock band's barber sticker comes with the first). */
  revealed(n: Round): void
  /** The picture card the kid in the chair holds up (round 3), or null. */
  card(c: Card | null): void
  /** Mommy's camera flashes. */
  flash(): void
  /** All three kids are done. */
  allDone(): void
}

const LABELS: Record<ToolId, string> = { tonic: 'Grow tonic', scissors: 'Scissors', comb: 'Comb', spray: 'Color spray', dryer: 'Hair dryer', bow: 'Bow', clip: 'Hair clip' }
export const BARBER_ANCHORS: AnchorInfo[] = [
  ...ALL_ITEMS.map((t): AnchorInfo => ({ id: `tool:${t.key}`, label: LABELS[t.tool] + (t.color ? ` (${t.color === 'p' ? 'pink' : t.color === 'v' ? 'lavender' : 'gold'})` : ''), kind: 'thing' })),
  { id: 'client', label: 'Who is in the chair', kind: 'thing' },
  { id: 'mirror', label: 'The mirror', kind: 'thing' },
  { id: 'pump', label: 'The chair pump', kind: 'thing' },
  { id: 'pole', label: "Barber's pole", kind: 'thing' },
  { id: 'jar', label: 'Comb jar', kind: 'thing' },
  { id: 'family:kaylee', label: 'Kaylee', kind: 'family' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
]

/** Tools are toy-sized, bigger than life so they're easy to see and grab. */
const TOOL_SCALE = 1.45
type Phase = 'play' | 'reveal' | 'swap' | 'done'

const tmp = new Vector3()
const right = new Vector3()
const FALL_COLORS = [...new Set([...(LOOKS.nick.mane ?? []), ...Object.values(HAIR_COLORS), ...CUSTOMERS.flatMap((c) => c.look.mane ?? [c.look.dark])])]

export class Salon extends Stage {
  private room: Room
  private kaylee: Avatar
  private nick: Member
  private ji: Member
  private mane: Mane
  private kid: { i: number; r: Racer; mane: Mane } | null = null
  private kidsDone = 0
  private round: Round
  private phase: Phase = 'play'
  /** Strokes of hair work this round (the mirror glows at `enough`), and the stroke going on now. */
  private work = 0
  private stroke = { hit: false, t: 0 }
  private tools = new Map<string, Tool>()
  private homes = new Map<string, Vector3>()
  private boards = new Map<string, Object3D>()
  private pops = new Map<Tool, number>()
  private going: { tool: Tool; from: Vector3; t: number }[] = []
  private held: { tool: Tool; x: number; y: number; x0: number; y0: number; moved: boolean } | null = null
  private auto: { tool: Tool; t: number; home: Vector2; n: number } | null = null
  private autoCount = new Map<ToolId, number>()
  /** The tools she's worked with (the 👆 shows her the others). */
  private used = new Set<ToolId>()
  private reach = 0
  private tip = new Vector2(NaN, NaN)
  private prevTip = new Vector2(NaN, NaN)
  private tipWorld = new Vector3()
  private onHair = false
  private cool = new Map<string, number>()
  private later: { t: number; f: () => void }[] = []
  private tall = false
  private sprayT = 0
  private dryT = 0
  private snipK = 1
  private falls: Floaters
  private sparkles: Floaters
  private mist: Floaters
  private horn: { g: Object3D; k: number }
  private spinGoal = 0
  private spinFrom = 0
  private spinT = 1
  private lift = { y: 0, goal: 0 }
  private pole = 0
  private jarK = 1
  private photoK = 1
  private dadOnBench = false
  private headR = 60
  private cardEl: HTMLElement | null = null

  constructor(renderer: WebGLRenderer, private bev: BarberEvents, start: { round: Round; hair: string }) {
    super(renderer, bev)
    const { scene, bag } = this
    scene.background = new Color('#DCEBFF')
    this.rig.fov = 30
    this.round = start.round
    this.room = buildRoom(bag)
    scene.add(this.room.root)
    // ---- Daddy in the chair (a cape round him), Kaylee on her stool in her smock, Mommy with her phone ----
    const { kaylee, members } = this.makeFamily(['nick', 'ji'])
    this.kaylee = kaylee
    this.nick = members.get('nick')!
    this.ji = members.get('ji')!
    kaylee.wear(['smock'])
    scene.add(kaylee.root, this.ji.root)
    this.put(kaylee, STOOL.x, STOOL.top, STOOL.z, 'stand', KAYLEE_FACE)
    this.put(this.ji, MOMMY.x, BENCH.seat, MOMMY.z, 'sit', MOMMY.face)
    this.room.chair.spin.add(this.nick.root)
    this.put(this.nick, 0, CHAIR.seat, 0, 'sit', 0)
    const nr = this.nick.rig
    const H = nr.height
    nr.body.add(solid(merge([
      P.cone(0.36 * H, 0.42 * H, '#FFFFFF', { at: [0, 0.27 * H, 0.02 * H] }, 24),
      P.torus(0.07 * H, 0.018 * H, PAL.hotpink, { at: [0, 0.47 * H, 0.02 * H], rot: [Math.PI / 2, 0, 0] }),
      ...[-1, 0, 1].map((s) => P.sphere(0.022 * H, PAL.pink, { at: [s * 0.12 * H, 0.28 * H, 0.26 * H], scale: [1, 1, 0.4] })),
    ]), bag, 2.5))
    // His horn, on its own (a snip makes it boing): a copy sitting just over the toy's own.
    const R = nr.face.R
    const horn = solid(P.cone(0.155 * R, 0.8 * R, '#FFC83D', { at: [0, 0.4 * R, 0] }), bag, 2.5)
    horn.position.set(0, nr.face.headY + 0.72 * R, 0.14 * R)
    horn.rotation.x = 0.28
    nr.head.add(horn)
    this.horn = { g: horn, k: 1 }
    this.mane = new Mane(nr, LOOKS.nick, bag, start.hair)
    // ---- Effects ----
    this.falls = new Floaters(new CapsuleGeometry(0.22, 0.6, 3, 6), FALL_COLORS, 140, bag, 3.5, 1.2)
    this.sparkles = new Floaters(new OctahedronGeometry(0.5), [PAL.gold, PAL.hotpink, '#FFFFFF', PAL.mint], 80, bag, 1.2, 1.2)
    this.mist = new Floaters(new IcosahedronGeometry(0.5, 1), [...RAINBOW.map((c) => HAIR_COLORS[c as keyof typeof HAIR_COLORS]), '#FFFFFF', '#E9DDFF'], 120, bag, -0.2, 2.2)
    for (const f of [this.falls, this.sparkles, this.mist]) scene.add(f.mesh)
    // A round-3 link: Daddy's done (on the bench with his new look), the first kid's in the chair.
    if (this.round === 3) {
      this.benchDaddy(true)
      this.after(0.3, () => this.nextKid())
    }
    this.setTray()
  }

  // ---------------------------------------------------------------- who's in the chair

  /** The mane being styled now (Daddy's, or the kid's in round 3). */
  private get client(): Mane | null {
    if (this.round === 3) return this.kid?.mane ?? null
    return this.mane
  }
  /** Strokes before the mirror glows: fewer for each kid. */
  private get enough() {
    return this.round === 3 ? ENOUGH_KID : ENOUGH
  }
  private get clientRig() {
    return this.round === 3 ? (this.kid?.r.rig ?? null) : this.nick.rig
  }

  /** Daddy hops out of the chair onto the waiting bench (with his new look). */
  private benchDaddy(now = false) {
    this.dadOnBench = true
    const to = new Vector3(BENCH.spots[0], BENCH.seat, BENCH.z)
    if (now) {
      this.scene.add(this.nick.root)
      this.put(this.nick, to.x, to.y, to.z, 'sit', 0)
    } else this.hop(this.nick, this.scene, to, { pose: 'sit', dur: 0.6, arc: 0.6 })
  }

  /** The next kid comes in from the door and hops up into the chair, holding up a picture card. */
  private nextKid() {
    const i = this.kidsDone
    const c = CUSTOMERS[i]
    if (!c) return
    const r = new Racer('kidA', this.bag, c.look)
    r.root.userData.pick = 'client'
    this.scene.add(r.root)
    r.place(...DOOR, -Math.PI / 2)
    const mane = new Mane(r.rig, c.look, this.bag, '')
    this.kid = { i, r, mane }
    this.phase = 'swap'
    r.walkTo(new Vector3(0.75, 0, 0.55), 2.2, () =>
      r.hopTo(new Vector3(CHAIR.x, CHAIR.seat + CHAIR.booster + this.lift.y, CHAIR.z), 0.5, 0.5, () => {
        r.sitting = true
        r.face(0)
        this.phase = 'play'
        this.work = 0
        this.play(sfx.giggle)
        this.bev.card(c.card)
      }),
    )
  }

  // ---------------------------------------------------------------- the trolley

  private setTray() {
    const items = this.phase === 'done' ? [] : TRAYS[this.round]
    for (const [key, t] of this.tools) if (!items.some((i) => i.key === key)) t.root.visible = false
    for (const item of items) {
      let t = this.tools.get(item.key)
      if (!t) {
        t = buildTool(item, this.bag)
        t.root.userData.pick = `tool:${item.key}`
        t.root.scale.setScalar(TOOL_SCALE)
        this.tools.set(item.key, t)
        this.scene.add(t.root)
        this.pops.set(t, 0)
      }
      t.root.visible = true
    }
    this.layout()
  }

  private get trayItems() {
    return [...this.tools.values()].filter((t) => t.root.visible).map((t) => t.item)
  }

  /** Where the trolley is: just in front of the chair, along the bottom of the picture. */
  private trayAt() {
    return this.tall ? { y: 0.66, z: 1.15, yB: 0.42, zB: 1.45 } : { y: 0.62, z: 1.2, yB: 0.62, zB: 1.2 }
  }

  /** Where each tool rests: one row on a wide screen, two on a tall one (and the boards under them). */
  private layout() {
    this.tall = this.w < this.h
    const items = this.trayItems
    const n = items.length
    for (const b of this.boards.values()) b.visible = false
    if (!n) return
    const rows = this.tall && n > 4 ? [items.slice(0, Math.ceil(n / 2)), items.slice(Math.ceil(n / 2))] : [items]
    const at = this.trayAt()
    rows.forEach((row, r) => {
      const s = this.tall ? 0.48 : Math.min(0.5, 2.6 / n)
      const y = r ? at.yB : at.y
      const z = r ? at.zB : at.z
      row.forEach((it, i) => this.homes.set(it.key, new Vector3((i - (row.length - 1) / 2) * s, y, z)))
      const key = `${r}:${row.length}:${s.toFixed(2)}`
      let b = this.boards.get(key)
      if (!b) {
        const wide = row.length * s + 0.12
        b = solid(merge([
          P.rbox(wide, 0.06, 0.36, 0.03, '#FFFFFF', { at: [0, y - 0.03, z] }),
          P.box(wide, 0.05, 0.03, '#8EB6F0', { at: [0, y - 0.01, z + 0.18] }),
          ...[-1, 1].map((sx) => P.cyl(0.025, 0.025, y - 0.06, '#D8D2E6', { at: [sx * (wide / 2 - 0.08), (y - 0.06) / 2, z - 0.1] })),
        ]), this.bag, 2)
        this.boards.set(key, b)
        this.scene.add(b)
      }
      b.visible = true
    })
    for (const t of this.tools.values()) if (t.root.visible && this.isHome(t)) this.rest(t)
  }

  private isHome(t: Tool) {
    return this.held?.tool !== t && this.auto?.tool !== t && !this.going.some((g) => g.tool === t)
  }
  private rest(t: Tool) {
    const h = this.homes.get(t.item.key)
    if (!h) return
    t.root.position.set(h.x, h.y + t.lift * TOOL_SCALE, h.z)
    t.model.rotation.z = 0
  }
  private sendHome(t: Tool) {
    this.going.push({ tool: t, from: t.root.position.clone(), t: 0 })
  }

  // ---------------------------------------------------------------- touch

  protected pickRoots(): Object3D[] {
    const roots: Object3D[] = [...[...this.tools.values()].filter((t) => t.root.visible).map((t) => t.root), this.room.chair.root, this.room.pole.root, this.room.jar.root, this.room.mirror.glass, this.kaylee.root, this.ji.root, this.nick.root]
    if (this.kid) roots.push(this.kid.r.root)
    return roots
  }

  pointerDown(x?: number, y?: number, id?: string) {
    super.pointerDown()
    if (x === undefined || y === undefined) return
    const what = id ?? this.pick(x, y)
    const t = what?.startsWith('tool:') ? this.tools.get(what.slice(5)) : undefined
    if (t && t.root.visible && this.auto?.tool !== t) this.held = { tool: t, x, y, x0: x, y0: y, moved: false }
  }
  pointerMove(x: number, y: number, _dx: number, _dy: number, isHeld: boolean) {
    const h = this.held
    if (!h || !isHeld) return
    h.x = x
    h.y = y
    this.lastTouch = this.time
    if (!h.moved && Math.hypot(x - h.x0, y - h.y0) > 10) {
      h.moved = true
      this.touches++
      this.going = this.going.filter((g) => g.tool !== h.tool)
      this.play(sfx.fwip)
    }
    // Every move counts (snipping, combing), even when frames are slow.
    if (h.moved) this.track(h.tool, new Vector2(x, y), 0)
  }
  pointerUp() {
    const h = this.held
    this.held = null
    if (!h?.moved) return
    this.letGo(h.tool)
  }

  /** Let go: a bow over the hair goes in; anything else flies home. */
  private letGo(t: Tool) {
    const it = t.item
    if ((it.tool === 'bow' || it.tool === 'clip') && this.onHair) this.putBow(it.tool === 'clip' ? ((it.color ?? 'y').toUpperCase() as BowId) : (it.color ?? 'p'))
    this.leave()
    this.sendHome(t)
    this.saveHair()
  }

  private saveHair() {
    if (this.mane.changed) {
      this.mane.changed = false
      this.bev.hair(this.mane.code)
    }
  }

  protected onTap(id: string | null) {
    if (!id) return
    if (id.startsWith('tool:')) {
      const t = this.tools.get(id.slice(5))
      if (t) this.tapTool(t)
      return
    }
    switch (id) {
      case 'client': {
        if (this.round === 3 && this.kid) {
          this.kid.r.wiggle()
          this.play(sfx.giggle)
        } else if (!this.dadOnBench) {
          this.nick.react('wiggle')
          this.play(sfx.haha)
        }
        return
      }
      case 'family:nick':
        this.nick.react('hop')
        this.play(sfx.haha)
        return
      case 'family:kaylee':
        this.kaylee.react('hop')
        this.play(sfx.giggle)
        return
      case 'family:ji':
        this.ji.react('wave')
        this.photo()
        return
      case 'mirror':
        if (this.phase === 'play' && this.work >= this.enough) this.reveal()
        else {
          // Not yet: the bulbs twinkle, and whoever's in the chair peeks.
          this.sparkles.burst(new Vector3(MIRROR.x, MIRROR.y1, MIRROR.z + 0.2), 10, 1.2, 1, 0.8, 0.05)
          this.play(sfx.chime)
        }
        return
      case 'pump':
        // Pump it up, three steps; then it hisses all the way down.
        if (this.lift.goal < 0.24) {
          this.lift.goal += 0.08
          this.play(sfx.pump)
        } else {
          this.lift.goal = 0
          this.play(sfx.hiss)
        }
        if (!this.dadOnBench && this.round < 3) this.nick.react('wiggle')
        return
      case 'pole':
        this.pole = 1
        this.play(sfx.chime)
        return
      case 'jar':
        this.jarK = 0
        this.play(sfx.blub)
        return
    }
  }

  /** A tap on a tool: it goes and does a short go by itself (a squirt on top, a trim, a comb up, a bow in). */
  private tapTool(t: Tool) {
    if (this.auto || !t.root.visible) return
    if (this.phase !== 'play' || !this.client) {
      this.pops.set(t, 0)
      sfx.boing()
      return
    }
    const s = this.toScreenPx(t.root.position, 0)
    const n = this.autoCount.get(t.item.tool) ?? 0
    this.autoCount.set(t.item.tool, n + 1)
    this.going = this.going.filter((g) => g.tool !== t)
    this.auto = { tool: t, t: 0, home: new Vector2(s?.x ?? this.w / 2, (s?.y ?? this.h) + LIFT_PX), n }
    this.play(sfx.fwip)
  }

  /** The synthetic finger of a tap's go, over the head in screen pixels. */
  private autoFinger(dt: number): Vector2 | null {
    const a = this.auto
    const head = this.headPx()
    if (!a || !head) return null
    a.t += dt
    const tool = a.tool.item.tool
    const dur = tool === 'bow' || tool === 'clip' ? 0.8 : 1.7
    if (a.t > dur) {
      this.auto = null
      this.letGo(a.tool)
      return null
    }
    const r = head.r
    const k = Math.max(0, (a.t - 0.35) / (dur - 0.35))
    let target: Vector2
    switch (tool) {
      case 'scissors':
        // A trim straight across, a little lower each time (the fringe, then the sides).
        target = new Vector2(head.x + (k * 2.4 - 1.2) * r, head.y - r * (0.55 - (a.n % 3) * 0.35))
        break
      case 'comb':
        // Up through the top for spikes, down for smooth, in turn.
        target = new Vector2(head.x + Math.sin(k * 9) * r * 0.5, head.y - r * (a.n % 2 ? 1.2 - k * 1.1 : 0.2 + k * 1.1))
        break
      case 'bow':
      case 'clip':
        target = new Vector2(head.x + ((a.n % 3) - 1) * r * 0.6, head.y - r * 0.9)
        break
      default:
        target = new Vector2(head.x + Math.cos(k * 8) * r * 0.7, head.y - r * (0.85 + Math.sin(k * 5) * 0.2))
    }
    target.y += LIFT_PX
    if (a.t < 0.35) return a.home.clone().lerp(target, a.t / 0.35)
    return target
  }

  // ---------------------------------------------------------------- where the tool works

  private toScreenPx(world: Vector3, r: number) {
    const cam = this.rig.camera
    const c = world.clone().project(cam)
    if (c.z > 1) return null
    right.set(1, 0, 0).applyQuaternion(cam.quaternion)
    const e = world.clone().addScaledVector(right, r).project(cam)
    return { x: ((c.x + 1) / 2) * this.w, y: ((1 - c.y) / 2) * this.h, r: (Math.abs(e.x - c.x) * this.w) / 2 }
  }

  /** The head in the chair, on screen (its center and radius). */
  private headPx() {
    const r = this.clientRig
    if (!r) return null
    return this.toScreenPx(r.head.localToWorld(tmp.set(0, r.face.headY + 0.2 * r.face.R, 0)), r.face.R)
  }

  /** A head-local point of the client's mane on screen. */
  private manePx = (v: Vector3) => {
    const m = this.client
    if (!m) return null
    const s = this.toScreenPx(m.root.localToWorld(tmp.copy(v)), 0)
    return s ? new Vector2(s.x, s.y) : null
  }

  private onPlane(x: number, y: number, z: number) {
    const cam = this.rig.camera
    const n = this.ndc(x, y)
    const near = new Vector3(n.x, n.y, -1).unproject(cam)
    const dir = new Vector3(n.x, n.y, 1).unproject(cam).sub(near)
    return near.addScaledVector(dir, (z - near.z) / (dir.z || 1e-6))
  }

  /** The tool's working end follows the finger; what it does to the strands under it (`dt`: time held there). */
  private track(tool: Tool, finger: Vector2, dt: number) {
    this.prevTip.copy(this.tip)
    this.tip.set(finger.x, finger.y - LIFT_PX)
    if (Number.isNaN(this.prevTip.x)) this.prevTip.copy(this.tip)
    this.tipWorld.copy(this.onPlane(this.tip.x, this.tip.y, 0.75))
    tool.root.position.copy(this.tipWorld)
    tool.model.rotation.z = tool.lean
    this.used.add(tool.item.tool)
    this.use(tool, dt)
  }

  private leave() {
    // A stroke that touched the hair counts (a long one a bit more).
    if (this.stroke.hit) this.work += 1 + Math.floor(this.stroke.t / 2.5)
    this.stroke = { hit: false, t: 0 }
    this.tip.set(NaN, NaN)
    this.prevTip.set(NaN, NaN)
    this.onHair = false
    this.dryT = 0
  }

  // ---------------------------------------------------------------- what each tool does

  private use(t: Tool, dt: number) {
    const mane = this.client
    if (!mane || this.phase !== 'play') return
    const head = this.headPx()
    const rPx = Math.max(26, Math.min(80, (head?.r ?? 100) * 0.34))
    this.headR = head?.r ?? this.headR
    const { x, y } = this.tip
    const daddy = this.round < 3
    const moved = Number.isNaN(this.prevTip.x) ? 0 : this.tip.distanceTo(this.prevTip)
    const dy = this.tip.y - this.prevTip.y
    if (this.onHair) {
      this.stroke.hit = true
      this.stroke.t += dt
    }
    switch (t.item.tool) {
      case 'tonic': {
        let brows = false
        const hits = mane.nearest(x, y, rPx * 1.2, this.manePx, (s, k) => {
          if (s.tuft >= TUFTS) brows = true
          s.len = Math.min(LEN_STEPS, s.len + (dt + moved * 0.004) * 14 * (0.4 + k))
          s.wild = Math.max(s.wild, mane.wildFor(s.len))
        })
        this.onHair = hits > 0
        if (hits) {
          mane.touched()
          if (this.ready('grow', 0.28)) this.play(sfx.grow)
          if (Math.random() < 0.5) this.mist.emit(this.tipWorld.clone(), new Vector3((Math.random() - 0.5) * 0.4, -0.3, -0.3), 0.6, 0.03, 7)
          if (Math.random() < 0.3) this.sparkles.emit(this.tipWorld.clone().add(new Vector3((Math.random() - 0.5) * 0.3, 0, 0)), new Vector3(0, 0.6, 0), 0.7, 0.04)
          // On his eyebrows: big bushy brows, and he wiggles them.
          if (brows && daddy && this.ready('brows', 1.6)) {
            this.nick.react('wiggle')
            this.after(0.3, () => sfx.haha())
          }
        } else if (this.ready('squirt', 0.5)) this.play(sfx.squirt)
        break
      }
      case 'scissors': {
        const fell = mane.cut(this.prevTip, this.tip, Math.max(18, rPx * 0.6), this.manePx)
        if (fell.length) {
          this.snipK = 0
          this.onHair = true
          if (this.ready('snip', 0.09)) this.play(sfx.snip)
          // The tufts fall (a few, in the colors that fell).
          for (const f of fell.slice(0, 14)) {
            const w = mane.root.localToWorld(f.at.clone())
            this.falls.emit(w, new Vector3((Math.random() - 0.5) * 0.8, 0.4 + Math.random() * 0.5, 0.3 + Math.random() * 0.4), 1.4, Math.min(0.16, f.size * 1.6), Math.max(0, FALL_COLORS.indexOf(f.color)))
          }
          if (daddy && this.ready('dad-snip', 2.4)) this.after(0.2, () => this.nick.react('wiggle'))
        } else if (moved > 6 && this.ready('clack', 0.35)) {
          this.snipK = 0
          this.play(sfx.clack)
        }
        // His horn: snip it and it boings back.
        const r = this.clientRig
        if (r && daddy) {
          const hornTip = this.toScreenPx(this.horn.g.localToWorld(tmp.set(0, 0.6 * r.face.R, 0)), 0)
          if (hornTip && Math.hypot(hornTip.x - x, hornTip.y - y) < Math.max(34, rPx * 0.8) && this.ready('horn', 1.6)) {
            this.horn.k = 0
            this.play(sfx.horn)
            this.after(0.35, () => sfx.haha())
            this.sparkles.burst(this.horn.g.localToWorld(new Vector3(0, 0.5 * r.face.R, 0)), 8, 1, 1.4, 0.7, 0.04)
          }
        }
        break
      }
      case 'comb': {
        if (moved < 1) break
        const up = dy < 0
        const hits = mane.nearest(x, y, rPx, this.manePx, (s, k) => {
          s.spike = Math.max(-1, Math.min(1, s.spike - dy * 0.018 * (0.4 + k)))
          s.wild *= 1 - Math.min(0.5, moved * 0.006 * k)
          s.curl *= 1 - Math.min(0.5, moved * 0.004 * k)
        })
        this.onHair = hits > 0
        if (hits) {
          mane.touched()
          if (this.ready(up ? 'zip-up' : 'zip-down', 0.3)) this.play(() => sfx.zip(up))
        }
        break
      }
      case 'spray': {
        this.sprayT += dt + moved * 0.002
        const ci = Math.floor(this.sprayT / 0.3) % RAINBOW.length
        const color = RAINBOW[ci]
        const hits = mane.nearest(x, y, rPx * 1.1, this.manePx, (s) => {
          if (s.tuft < TUFTS) s.color = color
        })
        this.onHair = hits > 0
        if (Math.random() < 0.7) this.mist.emit(this.tipWorld.clone(), new Vector3((Math.random() - 0.5) * 0.5, -0.2 + (Math.random() - 0.5) * 0.4, -0.5), 0.5, 0.04, ci)
        if (hits) {
          mane.touched()
        }
        if (this.ready('pssht', 0.35)) this.play(sfx.pssht)
        break
      }
      case 'dryer': {
        const hits = mane.nearest(x, y, rPx * 2.2, this.manePx, (s, k) => {
          s.curl = Math.min(1, s.curl + dt * 0.9 * k + moved * 0.002 * k)
          s.spike *= 1 - Math.min(0.3, dt * 0.6)
        })
        this.onHair = hits > 0
        this.dryT = hits ? this.dryT + dt + moved * 0.0015 : 0
        const full = this.dryT > 1.4
        // The wind blows from the dryer through the hair (in the head's own space).
        const head = this.clientRig?.head
        if (head) {
          const from = head.worldToLocal(this.tipWorld.clone())
          mane.wind.dir.copy(from).multiplyScalar(-1).normalize()
          mane.wind.k = hits ? (full ? 1 : 0.55) : 0.2
        }
        if (hits) {
          mane.touched()
        }
        if (this.ready('dryer', 0.28)) this.play(() => sfx.dryer(full ? 1 : 0.5))
        if (full && this.ready('full', 3)) this.blowEveryone()
        break
      }
      case 'bow':
      case 'clip': {
        this.onHair = mane.nearest(x, y, rPx * 1.2, this.manePx, () => {}) > 0
        break
      }
    }
  }

  /** The dryer on full: everyone's mane blows, Daddy laughs, Kaylee hops. */
  private blowEveryone() {
    this.kaylee.setWind(1)
    this.ji.setWind(1)
    if (this.dadOnBench) this.nick.setWind(1)
    this.kid?.r.setWind(1)
    this.play(sfx.whoosh)
    this.after(0.3, () => sfx.haha())
    this.ji.react('wiggle')
    this.after(2.2, () => {
      this.kaylee.setWind(0)
      this.ji.setWind(0)
      this.nick.setWind(0)
      this.kid?.r.setWind(0)
    })
  }

  /** A bow or clip into the tuft under the tool. */
  private putBow(bow: BowId) {
    const mane = this.client
    if (!mane) return
    const local = mane.root.worldToLocal(this.onPlane(this.tip.x, this.tip.y, 0.3))
    mane.addBow(mane.tuftNear(local), bow)
    this.play(sfx.clip)
    this.sparkles.burst(this.tipWorld.clone(), 8, 1, 1, 0.6, 0.035)
  }

  // ---------------------------------------------------------------- the mirror

  /** The chair spins round to the mirror, back again, a pose and Mommy's photo; then the next round (or kid). */
  private reveal() {
    this.phase = 'reveal'
    if (this.held) {
      this.letGo(this.held.tool)
      this.held = null
    }
    this.saveHair()
    this.spinTo(Math.PI)
    this.play(sfx.spin)
    const kid = this.kid
    this.after(0.85, () => {
      sfx.ooh()
      this.sparkles.burst(new Vector3(MIRROR.x, (MIRROR.y0 + MIRROR.y1) / 2, MIRROR.z + 0.3), 18, 1.6, 1, 1, 0.06)
    })
    this.after(1.5, () => {
      this.spinTo(Math.PI * 2)
      sfx.spin()
    })
    this.after(2.3, () => {
      if (kid) {
        kid.r.hop()
        sfx.giggle()
      } else {
        this.nick.react('hop')
        sfx.haha()
      }
      sfx.cheer()
      this.kaylee.react('hop')
    })
    this.after(2.8, () => this.photo())
    this.after(3.8, () => {
      this.room.chair.spin.rotation.y = 0
      this.spinGoal = this.spinFrom = 0
      const n = this.round
      this.bev.revealed(n)
      if (n === 1) {
        this.round = 2
        this.bev.round(2)
        this.work = 0
        this.phase = 'play'
        this.setTray()
      } else if (n === 2) {
        this.round = 3
        this.bev.round(3)
        this.work = 0
        this.benchDaddy()
        this.setTray()
        this.phase = 'swap'
        this.after(0.9, () => this.nextKid())
      } else this.kidLeaves()
    })
  }

  /** "Close enough!": the kid hops down and skips out happy; the next one comes in (or everyone's done). */
  private kidLeaves() {
    const k = this.kid
    this.bev.card(null)
    if (!k) return
    this.phase = 'swap'
    this.kidsDone++
    k.r.sitting = false
    k.r.hopTo(new Vector3(0.75, 0, 0.55), 0.45, 0.4, () => k.r.walkTo(new Vector3(...DOOR), 2.4, () => (k.r.root.visible = false)))
    if (this.kidsDone < CUSTOMERS.length) this.after(1.4, () => this.nextKid())
    else
      this.after(1.0, () => {
        this.phase = 'done'
        this.kid = null
        this.setTray()
        sfx.cheer()
        this.nick.react('hop')
        this.kaylee.react('hop')
        this.bev.allDone()
      })
  }

  private spinTo(goal: number) {
    this.spinFrom = this.room.chair.spin.rotation.y
    this.spinGoal = goal
    this.spinT = 0
  }

  /** Mommy's photo: her phone up, a flash. */
  private photo() {
    this.photoK = 0
    this.bev.flash()
    this.play(sfx.shutter)
    this.sparkles.burst(this.ji.root.position.clone().setY(1.2), 10, 1, 1, 0.6, 0.04)
  }

  // ---------------------------------------------------------------- the frame

  private play(f: () => void) {
    f()
  }
  private ready(key: string, every: number) {
    if (this.time - (this.cool.get(key) ?? -99) < every) return false
    this.cool.set(key, this.time)
    return true
  }
  private after(s: number, f: () => void) {
    this.later.push({ t: this.time + s, f })
  }

  protected step(dt: number, t: number) {
    for (const l of this.later.filter((x) => x.t <= this.time)) {
      this.later.splice(this.later.indexOf(l), 1)
      if (!this.disposed) l.f()
    }
    // ---- The tool in her hand (or doing a tap's go) ----
    const h = this.held?.moved ? this.held : null
    const finger = h ? new Vector2(h.x, h.y) : this.autoFinger(dt)
    const tool = h?.tool ?? this.auto?.tool ?? null
    if (finger && tool) this.track(tool, finger, dt)
    else {
      const m = this.client
      if (m) m.wind.k = Math.max(0, m.wind.k - dt * 1.5)
    }
    // The scissors snip shut and open again.
    this.snipK = Math.min(1, this.snipK + dt / 0.14)
    for (const tl of this.tools.values()) {
      if (!tl.blades) continue
      const open = tl === tool ? 0.1 + 0.32 * bell(Math.min(1, 0.3 + this.snipK * 0.7)) : 0.25
      tl.blades[0].rotation.z = open
      tl.blades[1].rotation.z = -open
    }
    // ---- Tools flying home, popping in ----
    for (const g of [...this.going]) {
      g.t += dt / 0.35
      const home = this.homes.get(g.tool.item.key)
      if (!home) continue
      const to = tmp.set(home.x, home.y + g.tool.lift * TOOL_SCALE, home.z)
      g.tool.root.position.lerpVectors(g.from, to, Math.min(1, g.t)).y += bell(Math.min(1, g.t)) * 0.15
      g.tool.model.rotation.z = g.tool.lean * (1 - Math.min(1, g.t))
      if (g.t >= 1) {
        this.going.splice(this.going.indexOf(g), 1)
        this.rest(g.tool)
        this.play(sfx.thump)
      }
    }
    for (const [tl, k] of this.pops) {
      const k2 = Math.min(1, k + dt / 0.45)
      this.pops.set(tl, k2)
      tl.root.scale.setScalar(TOOL_SCALE * (k2 < 1 ? 1 + wobble(k2, 2) * 0.25 : 1))
      if (k2 >= 1) this.pops.delete(tl)
    }
    if (this.held && !this.held.moved && this.isHome(this.held.tool)) this.held.tool.root.position.y += (this.homes.get(this.held.tool.item.key)!.y + (this.held.tool.lift + 0.05) * TOOL_SCALE - this.held.tool.root.position.y) * 0.3
    // ---- The chair: the pump, the spin ----
    const ch = this.room.chair
    this.lift.y += (this.lift.goal - this.lift.y) * (1 - Math.exp(-dt * (this.lift.goal > this.lift.y ? 10 : 3)))
    ch.lift.position.y = this.lift.y
    if (this.spinT < 1) {
      this.spinT = Math.min(1, this.spinT + dt / 0.7)
      const e = this.spinT < 0.5 ? 2 * this.spinT * this.spinT : 1 - (-2 * this.spinT + 2) ** 2 / 2
      ch.spin.rotation.y = this.spinFrom + (this.spinGoal - this.spinFrom) * e
    }
    // ---- People ----
    const look = tool ? this.tipWorld : this.mirrorLook()
    this.kaylee.lookAt(look.x, look.y, look.z)
    this.ji.lookAt(look.x, look.y, look.z)
    if (!this.dadOnBench) this.nick.lookAt(look.x, look.y, look.z)
    else this.nick.lookAt(0, 1.6, 0)
    this.kaylee.update(dt, t)
    this.ji.update(dt, t)
    this.nick.update(dt, t)
    // Kaylee reaches out while she holds a tool; Mommy holds up her phone for a photo.
    this.reach += ((tool ? 1 : 0) - this.reach) * (1 - Math.exp(-dt * 8))
    this.kaylee.rig.armR.rotation.x = -1.1 * this.reach
    if (this.photoK < 1) {
      this.photoK = Math.min(1, this.photoK + dt / 1.4)
      this.ji.rig.armR.rotation.x = -2.2 * bell(Math.min(1, this.photoK * 1.4))
      this.ji.rig.armL.rotation.x = -2.0 * bell(Math.min(1, this.photoK * 1.4))
    }
    const k = this.kid
    if (k) {
      if (k.r.sitting) {
        k.r.place(CHAIR.x, CHAIR.seat + CHAIR.booster + this.lift.y, CHAIR.z, 0)
        k.r.spin = ch.spin.rotation.y
      }
      k.r.lookAt(k.r.sitting ? look : null)
      k.r.update(dt, t)
      k.mane.update(dt, t)
    }
    this.mane.update(dt, t)
    // His horn boings back (a stretchy wobble).
    this.horn.k = Math.min(1, this.horn.k + dt / 1.1)
    const hk = this.horn.k
    this.horn.g.scale.set(1 - 0.25 * wobble(hk, 4) * (1 - hk), Math.max(0.2, 1 + wobble(hk, 4) * 0.6 * (1 - hk) - (hk < 0.08 ? 0.7 : 0)), 1)
    // ---- Pokeables ----
    const r = this.room
    this.pole = Math.max(0, this.pole - dt * 0.4)
    r.pole.stripes.rotation.y += dt * (1.2 + 9 * this.pole)
    this.jarK = Math.min(1, this.jarK + dt / 0.8)
    r.jar.combs.position.y = bell(this.jarK) * 0.12
    r.jar.combs.rotation.z = Math.sin(this.jarK * 18) * 0.2 * (1 - this.jarK)
    if (this.jarK < 1 && Math.random() < dt * 20) this.mist.emit(r.jar.root.position.clone().add(new Vector3((Math.random() - 0.5) * 0.12, 0.3, 0.05)), new Vector3(0, 0.6, 0.1), 0.6, 0.025, 4)
    // The mirror glows when it's time for the reveal: its bulbs blink round.
    const glow = this.phase === 'play' && this.work >= this.enough
    r.mirror.bulbs.scale.setScalar(glow ? 1 + 0.12 * Math.max(0, Math.sin(t * 8)) : 1)
    r.mirror.shine.position.x = glow ? Math.sin(t * 1.5) * 0.25 : 0
    for (const f of [this.falls, this.sparkles, this.mist]) f.update(dt)
  }

  private mirrorLook() {
    const r = this.clientRig
    return r && !this.dadOnBench ? r.head.localToWorld(new Vector3(0, r.face.headY + 0.6 * r.face.R, 0)) : new Vector3(0, 1.5, 0.5)
  }

  // ---------------------------------------------------------------- camera, anchors, hint

  setCardElement(el: HTMLElement | null) {
    this.cardEl = el
  }
  /** The kid holds the picture card up beside their head. */
  placeAnchors() {
    super.placeAnchors()
    const el = this.cardEl
    if (!el) return
    const r = this.kid?.r.sitting ? this.kid.r.rig : null
    const s = r ? this.toScreenPx(r.head.localToWorld(new Vector3(1.25 * r.face.R, r.face.headY + 0.6 * r.face.R, 0)), 0) : null
    el.style.display = s ? '' : 'none'
    if (s) el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`
  }

  setSize(w: number, h: number, top: number) {
    super.setSize(w, h, top)
    this.layout()
  }

  protected shot(): Shot {
    // His head (and long hair down to his shoulders), the mirror round it, the trolley along the bottom; Kaylee on her
    // stool and Mommy at the sides. On a tall screen, two rows of tools and more ceiling and floor.
    // (The kids in round 3 are smaller: a little closer, a little lower.)
    const kid = this.round === 3 ? 0.88 : 1
    const low = this.round === 3 ? 0.16 : 0
    if (this.w < this.h) return { center: new Vector3(0, 1.3 - low, 0.6), half: new Vector3(1.05, 1.35, 0.6).multiplyScalar(kid), yaw: 0, pitch: 8, minDist: 3.5 }
    return { center: new Vector3(0.05, 1.4 - low, 0.5), half: new Vector3(1.4, 0.95, 0.6).multiplyScalar(kid), yaw: 0, pitch: 7, minDist: 3.5 }
  }

  protected anchorAt(id: string): AnchorSpot | null {
    if (id.startsWith('tool:')) {
      const t = this.tools.get(id.slice(5))
      if (!t?.root.visible) return null
      const n = Math.max(1, this.trayItems.length)
      const s = this.tall ? 0.48 : Math.min(0.5, 2.6 / n)
      return { at: t.root.position.clone().add(new Vector3(0, 0.12, 0)), r: s * 0.47, prio: 3, max: 140 }
    }
    switch (id) {
      case 'client': {
        const r = this.clientRig
        if (!r || this.phase !== 'play' || (this.round < 3 && this.dadOnBench)) return null
        return { at: r.head.localToWorld(new Vector3(0, r.face.headY - 0.2 * r.face.R, 0.3 * r.face.R)), r: 0.5 * r.face.R, prio: 1, max: 130 }
      }
      case 'mirror':
        return { at: new Vector3(MIRROR.x + MIRROR.w * 0.32, MIRROR.y1 - 0.35, MIRROR.z + 0.1), r: 0.3, glow: this.phase === 'play' && this.work >= this.enough, prio: 2, max: 120 }
      case 'pump':
        return { at: new Vector3(CHAIR.x + 0.32, 0.12, CHAIR.z + 0.28), r: 0.2, prio: 2 }
      case 'pole':
        return { at: new Vector3(POLE.x, POLE.y, POLE.z + 0.1), r: 0.25 }
      case 'jar':
        return { at: new Vector3(SHELF.x - 0.1, SHELF.y + 0.18, SHELF.z + 0.12), r: 0.16 }
      case 'family:kaylee':
        return { at: this.kaylee.root.position.clone().setY(STOOL.top + 0.55), r: 0.3, prio: 0, max: 120 }
      case 'family:ji':
        return { at: this.ji.root.position.clone().setY(1.0), r: 0.35, prio: 0, max: 130 }
      case 'family:nick':
        return this.dadOnBench ? { at: this.nick.root.position.clone().setY(1.2), r: 0.4, prio: 1, max: 130 } : null
    }
    return null
  }

  /** Nothing touched for a while: the mirror once it's time, or a tool she hasn't used yet (else the tonic). */
  protected hintAt() {
    if (this.phase !== 'play' || this.auto || this.held?.moved) return null
    if (this.work >= this.enough) return new Vector3(MIRROR.x + MIRROR.w * 0.32, MIRROR.y1 - 0.45, MIRROR.z + 0.1)
    const unused = [...this.tools.values()].find((tl) => tl.root.visible && !this.used.has(tl.item.tool))
    const t = unused ?? this.tools.get('tonic')
    return t?.root.visible ? t.root.position.clone().add(new Vector3(0, 0.3, 0)) : null
  }

  qa() {
    const head = this.headPx()
    const tools: Record<string, [number, number]> = {}
    for (const [k, t] of this.tools) {
      if (!t.root.visible) continue
      const s = this.toScreenPx(t.root.position.clone().add(new Vector3(0, 0.12, 0)), 0)
      if (s) tools[k] = [Math.round(s.x), Math.round(s.y)]
    }
    const m = this.client
    const lens = m ? m.strands.filter((s) => s.tuft < TUFTS).map((s) => s.len) : []
    return {
      game: 'barber',
      phase: this.phase,
      round: this.round,
      client: this.round === 3 ? (this.kid ? CUSTOMERS[this.kid.i].card : null) : 'daddy',
      hair: this.mane.code,
      work: Math.round(this.work * 10) / 10,
      mirror: this.work >= this.enough,
      head: head ? [Math.round(head.x), Math.round(head.y), Math.round(head.r)] : null,
      avgLen: lens.length ? Math.round((lens.reduce((a, b) => a + b, 0) / lens.length) * 10) / 10 : 0,
      held: this.held?.moved ? this.held.tool.item.key : (this.auto?.tool.item.key ?? null),
      liftPx: LIFT_PX,
      touches: this.touches,
      tools,
      room: { x0: ROOM.x0, x1: ROOM.x1 },
    }
  }
}

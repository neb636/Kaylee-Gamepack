// The Vet Clinic in Harbor Town (plan: planning/around-the-world/thailand/mall-trip.md, "★ 1. The Vet Clinic"),
// greybox 1: shapes and sounds, with the voices (lines.ts L.mall.vet). Dr. Kaylee in blue scrubs and a cap stands by
// the exam table; Daddy watches.
//
// The toy: grab a tool from the tray and use it on the patient, right where she holds it. The tool's tip sits just
// above her finger; each frame the patient's zones (head, mouth, chest, paw, tail...) are projected onto the screen and
// the nearest one under the tip is what the tool touches (zoneAt), so it lands the same on an iPad or an iPhone.
//   - stethoscope: thump-thump hearts float up, loudest over the chest (on Daddy: BA-BOOM)
//   - thermometer: the red line climbs and the cheeks glow, then cool (in the pony's ear: boing!)
//   - tweezers: pinch the thorn in the puppy's paw and pull it out; cream: rub it in; bandage: wind it round the paw
//   - soap: suds where she rubs (the pony's mud comes off); shower: rinses them; towel: dries; brush: fluffs; bow
//   - spoon: medicine (bleh!); tissue: a giant one for the elephant's trunk (HONK)
// Three patients, each a step deeper: the puppy's check-up and sore paw, the muddy pony's bath, the sniffly baby
// elephant (its sneeze blows the suds everywhere, then it gives her a trunk shower). Each hops off the table, through
// the window, onto the waiting room's bench. A tap on a tool uses it for her (a short go), so dragging is never a must.
// Nothing fails: a tool anywhere does something (a giggle, a yip, Daddy hamming it up).
import { BackSide, Color, Group, IcosahedronGeometry, OctahedronGeometry, Raycaster, Vector2, Vector3, type Mesh, type Object3D, type WebGLRenderer } from 'three'
import { bell, wobble, type Line } from '../../../../../../../sdk'
import type { Avatar } from '../../../../characters/avatar'
import type { Member } from '../../../../characters/member'
import { PATIENT_LOOKS } from '../../../../characters/looks'
import { L } from '../../../../lines'
import type { AnchorInfo } from '../../../../engine/Anchors'
import type { Shot } from '../../../../engine/camera'
import { merge, P, solid } from '../../../../engine/geo'
import { PAL } from '../../../../engine/toon'
import { Stage, type AnchorSpot, type LegEvents } from '../../../../trip/legs/stage'
import { PATIENTS, type PatientId } from '../../sections'
import { Blobs, Floaters, heartGeometry } from './fx'
import { ALL_ITEMS, BENCH, DADDY_AT, DADDY_TALL, DOOR, HOLD_Z, JAR, KAYLEE_AT, NEED_ICONS, NEED_TOOL, PARROT, PATIENT_AT, SCALE, TRAY, TRAYS, WINDOW, XRAY, type Need, type ToolId } from './layout'
import { PART_OF, Patient, type Zone, type ZoneId } from './patient'
import { buildRoom, drawXray, type Room } from './room'
import { vetSfx as sfx, voiceOf } from './sounds'
import { buildBowGeometry, buildTool, type Tool } from './tools'

export interface VetEvents extends LegEvents {
  /** The patient on the table now (the address bar follows). */
  patient(id: PatientId): void
  /** A patient is all better (the sock band's vet sticker comes with the first). */
  healed(id: PatientId): void
  /** What the patient on the table needs next, as a tool icon (its thought bubble), or null. */
  need(icon: string | null): void
  /** All three are better. */
  allDone(): void
}

const LABELS: Record<ToolId, string> = { stethoscope: 'Stethoscope', thermometer: 'Thermometer', tweezers: 'Tweezers', cream: 'Cream', bandage: 'Bandage', brush: 'Brush', soap: 'Soap', shower: 'Shower', towel: 'Towel', bow: 'Bow', spoon: 'Medicine spoon', tissue: 'Tissues' }
export const VET_ANCHORS: AnchorInfo[] = [
  ...ALL_ITEMS.map((t): AnchorInfo => ({ id: `tool:${t.key}`, label: LABELS[t.tool] + (t.color ? ` (${t.key.split('-')[1]})` : ''), kind: 'thing' })),
  { id: 'patient', label: 'Patient', kind: 'thing' },
  ...PATIENTS.map((p): AnchorInfo => ({ id: `waiting:${p}`, label: `Waiting ${p}`, kind: 'thing' })),
  { id: 'xray', label: 'X-ray box', kind: 'thing' },
  { id: 'parrot', label: 'Parrot', kind: 'thing' },
  { id: 'cat', label: 'Cat carrier', kind: 'thing' },
  { id: 'jar', label: 'Treat jar', kind: 'thing' },
  { id: 'scale', label: 'Scale', kind: 'thing' },
  { id: 'family:kaylee', label: 'Kaylee', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
]

/** Where a tap sends each tool (its "aim": that zone also pulls a held tool in a little). */
const AIM: Record<ToolId, ZoneId> = { stethoscope: 'chest', thermometer: 'mouth', tweezers: 'paw', cream: 'paw', bandage: 'paw', brush: 'head', soap: 'belly', shower: 'head', towel: 'belly', bow: 'head', spoon: 'mouth', tissue: 'nose' }
/** Pixels: the tool's tip sits this far above her finger (so the finger doesn't hide what it does). */
const LIFT_PX = 34
/** Zones are never smaller than this on screen (px), plus some slop for a finger. */
const MIN_R = 22
const SLOP = 14

interface Hit {
  who: 'patient' | 'daddy'
  zone: Zone
}
type Phase = 'enter' | 'exam' | 'healed' | 'leave' | 'done'

/** Daddy's reactions: at most one line this often (seconds), so talk stays short and play long. */
const DADDY_GAP = 12
const V = L.mall.vet

const tmp = new Vector3()
const right = new Vector3()

export class VetClinic extends Stage {
  private room: Room
  private kaylee: Avatar
  private nick: Member
  private patients = new Map<PatientId, Patient>()
  private cur: Patient | null = null
  private phase: Phase = 'enter'
  private tools = new Map<string, Tool>()
  private homes = new Map<string, Vector3>()
  private boards = new Map<string, Group>()
  private pops = new Map<Tool, number>()
  private going: { tool: Tool; from: Vector3; t: number }[] = []
  private held: { tool: Tool; x: number; y: number; x0: number; y0: number; moved: boolean } | null = null
  private auto: { tool: Tool; t: number; zone: ZoneId; home: Vector2 } | null = null
  private hit: Hit | null = null
  private hitKey = ''
  private tip = new Vector2(NaN, NaN)
  private tipWorld = new Vector3()
  /** Per contact (reset when the tool moves onto another zone). */
  private acc = { t: 0, beat: 0.6, ang: NaN, done: false, dist: 0 }
  /** Per patient progress. */
  private prog = { beats: 0, temp: 0, cream: 0, wrap: 0, brush: 0, soap: 0, towel: 0, color: '' }
  private grabbed: Vector2 | null = null
  private cool = new Map<string, number>()
  private later: { t: number; f: () => void }[] = []
  private hearts: Floaters
  private bubbles: Floaters
  private drops: Floaters
  private fluff: Floaters
  private sparkles: Floaters
  private ray = new Raycaster()
  private tall = false
  private needIcon: string | null = 'none'
  private bubbleEl: HTMLElement | null = null
  private hintHands: HTMLElement | null = null
  private hintDown = false
  private last: () => void = () => sfx.squawk()
  // The pokeables.
  private xrayLit = 0
  private parrotFlap = 1
  private catPoke = 1
  private lidPop = 1
  private needle = { k: 1, base: 0.9 }
  private treat: { g: Group; t: number; from: Vector3; to: () => Vector3; done: () => void } | null = null
  private treatMesh: Group
  private spray = 0
  private daddy = { suds: null as Blobs | null, bow: null as Group | null, band: null as Group | null, fluff: 0, zones: [] as Zone[] }
  private kayleeHop = 0
  // The voices: when Daddy last spoke, which idle spell the hint was said for, the facts said, his heart line next.
  private daddySaid = -99
  private hintFor = -1
  private told = new Set<string>()
  private heartN = 0

  constructor(renderer: WebGLRenderer, private vev: VetEvents, start: { patient: PatientId }) {
    super(renderer, vev)
    const { scene, bag } = this
    scene.background = new Color('#E9FBF4')
    this.rig.fov = 30
    this.room = buildRoom(bag)
    scene.add(this.room.root)
    // ---- Kaylee in her scrubs and cap, Daddy watching ----
    const { kaylee, members } = this.makeFamily(['nick'])
    this.kaylee = kaylee
    this.nick = members.get('nick')!
    kaylee.wear(['scrubs', 'scrub-cap'])
    scene.add(kaylee.root, this.nick.root)
    this.put(kaylee, KAYLEE_AT.x, 0, KAYLEE_AT.z, 'stand', KAYLEE_AT.face)
    this.put(this.nick, DADDY_AT.x, 0, DADDY_AT.z, 'stand', DADDY_AT.face)
    const nr = this.nick.rig
    this.daddy.zones = [
      { id: 'head', obj: nr.head, at: new Vector3(0, nr.face.headY, 0.2 * nr.face.R), r: nr.face.R },
      { id: 'chest', obj: nr.body, at: new Vector3(0, 0.4 * nr.height, 0.17 * nr.height), r: 0.13 * nr.height },
    ]
    this.daddy.suds = new Blobs('#FFFFFF', 20, nr.head, bag)
    // ---- Effects ----
    this.hearts = new Floaters(heartGeometry(), ['#FF4F9A', '#FF8FB8'], 40, bag, -0.5, 1)
    this.bubbles = new Floaters(new IcosahedronGeometry(0.5, 1), ['#FFFFFF', '#BFE9FF', '#FFC9E3', '#D9CCFF'], 90, bag, -0.25, 0.9)
    this.drops = new Floaters(new IcosahedronGeometry(0.5, 0), ['#8EC9F5', '#BFE9FF'], 160, bag, 7, 0.2)
    this.fluff = new Floaters(new IcosahedronGeometry(0.5, 0), [PATIENT_LOOKS.puppy.fur, PATIENT_LOOKS.pony.mane[0], PATIENT_LOOKS.elephant.fur, '#FFFFFF'], 60, bag, 0.6, 2)
    this.sparkles = new Floaters(new OctahedronGeometry(0.5), [PAL.gold, PAL.hotpink, '#FFFFFF', PAL.mint], 80, bag, 1.2, 1.2)
    for (const f of [this.hearts, this.bubbles, this.drops, this.fluff, this.sparkles]) scene.add(f.mesh)
    this.treatMesh = solid(merge([P.capsule(0.03, 0.08, '#E8B98A', { rot: [0, 0, Math.PI / 2] }), ...[-1, 1].flatMap((s) => [-1, 1].map((u) => P.sphere(0.028, '#E8B98A', { at: [s * 0.065, u * 0.02, 0] })))]), bag, 1.5)
    this.treatMesh.visible = false
    scene.add(this.treatMesh)
    // ---- The patients: the ones before the link's are already better, on the bench ----
    const si = PATIENTS.indexOf(start.patient)
    PATIENTS.forEach((id, i) => {
      const p = new Patient(id, bag)
      p.root.userData.pick = i < si ? `waiting:${id}` : 'patient'
      this.patients.set(id, p)
      scene.add(p.root)
      if (i < si) this.seat(p, i)
      else p.root.visible = false
    })
    this.layout()
    // Daddy welcomes her; Sparkle says who's coming in (begin).
    this.after(0.3, () => this.vev.say(V.open))
    this.begin(start.patient)
  }

  setBubbleElement(el: HTMLElement | null) {
    this.bubbleEl = el
  }
  /** The hint has two hands: 👆 under a spot on the patient, 👇 over a tool on the tray (it's at the bottom edge). */
  setHintElement(el: HTMLElement | null) {
    super.setHintElement(el)
    this.hintHands = el
  }

  // ---------------------------------------------------------------- patients come and go

  private seat(p: Patient, i: number) {
    p.root.visible = true
    p.root.position.set(BENCH.spots[i], BENCH.y, BENCH.z)
    p.root.scale.setScalar(BENCH.scale)
    p.waiting = true
    p.faceGoal = 0
    p.root.rotation.y = 0
    p.root.userData.pick = `waiting:${p.id}`
  }

  /** The next patient hops in from the door, onto the scale (the needle wiggles), and up onto the table. */
  private begin(id: PatientId) {
    const p = this.patients.get(id)!
    this.cur = p
    this.phase = 'enter'
    this.prog = { beats: 0, temp: 0, cream: 0, wrap: 0, brush: 0, soap: 0, towel: 0, color: '' }
    this.grabbed = null
    this.setTray(id)
    this.vev.patient(id)
    this.after(0.3, () => this.vev.say(V.patient[id]))
    p.root.visible = true
    p.root.position.set(...DOOR)
    p.root.scale.setScalar(1)
    p.faceGoal = -Math.PI / 2
    p.root.rotation.y = -Math.PI / 2
    p.hopTo(new Vector3(SCALE[0], 0.09, SCALE[2]), {
      dur: 0.6,
      arc: 0.5,
      delay: 0.3,
      done: () => {
        this.needle.k = 0
        this.play(sfx.needle)
        p.hopTo(new Vector3(...PATIENT_AT), {
          dur: 0.6,
          arc: 0.6,
          delay: 0.45,
          done: () => {
            p.faceGoal = 0
            this.phase = 'exam'
            voiceOf(id)()
            if (id === 'puppy') this.after(0.7, () => sfx.whimper())
            if (id === 'elephant') this.after(0.6, () => sfx.sniff())
          },
        })
      },
    })
  }

  /** All better: a happy hop, then off the table, through the window, onto the bench. */
  private heal(p: Patient) {
    this.phase = 'healed'
    this.after(0.5, () => {
      sfx.healed()
      voiceOf(p.id)()
      p.react('hop')
      p.wag = 1
      this.sparkles.burst(this.patientCenter(p), 26, 2.2, 3, 1.1, 0.07)
      this.kaylee.react('hop')
      this.nick.react('wave')
      this.vev.say(V.healed[p.id])
      this.vev.healed(p.id)
    })
    this.after(1.7, () => {
      this.phase = 'leave'
      const i = PATIENTS.indexOf(p.id)
      const x = BENCH.spots[i]
      p.faceGoal = Math.PI
      p.hopTo(new Vector3(x, WINDOW.y0 + 0.02, -1.7), {
        dur: 0.7,
        arc: 0.7,
        scale: 0.8,
        done: () =>
          p.hopTo(new Vector3(x, BENCH.y, BENCH.z), {
            dur: 0.45,
            arc: 0.25,
            scale: BENCH.scale,
            done: () => {
              p.waiting = true
              p.faceGoal = 0
              p.root.userData.pick = `waiting:${p.id}`
              voiceOf(p.id)()
              const next = PATIENTS[i + 1]
              if (next) this.after(0.4, () => this.begin(next))
              else this.finale()
            },
          }),
      })
    })
  }

  /** Everyone's better: they hop in turn on the bench, wagging; the tray stays to play with. */
  private finale() {
    this.phase = 'done'
    this.cur = null
    this.setTray(null)
    PATIENTS.forEach((id, i) =>
      this.after(0.25 + i * 0.35, () => {
        const p = this.patients.get(id)!
        p.react('hop')
        p.wag = 1
        voiceOf(id)()
        this.sparkles.burst(this.patientCenter(p), 14, 1.5, 2.5, 1, 0.05)
      }),
    )
    this.after(1.4, () => {
      sfx.cheer()
      this.kaylee.react('hop')
      this.nick.react('hop')
      this.vev.say(V.allDone)
      this.vev.allDone()
    })
  }

  private patientCenter(p: Patient) {
    return p.root.localToWorld(tmp.set(0, 0.45 * p.H, 0)).clone()
  }

  // ---------------------------------------------------------------- the tray

  private setTray(id: PatientId | null) {
    const items = id ? TRAYS[id] : []
    for (const [key, t] of this.tools) if (!items.some((i) => i.key === key)) t.root.visible = false
    for (const item of items) {
      let t = this.tools.get(item.key)
      if (!t) {
        t = buildTool(item, this.bag)
        t.root.userData.pick = `tool:${item.key}`
        this.tools.set(item.key, t)
        this.scene.add(t.root)
      }
      t.root.visible = true
      this.pops.set(t, 0)
    }
    this.going = this.going.filter((g) => g.tool.root.visible)
    this.layout()
  }

  private get trayItems() {
    return this.cur ? TRAYS[this.cur.id] : []
  }

  /** Where each tool rests: one row on a wide screen, two on a tall one (and the boards under them). */
  private layout() {
    this.tall = this.w < this.h
    const items = [...this.tools.values()].filter((t) => t.root.visible).map((t) => t.item)
    const n = items.length
    for (const b of this.boards.values()) b.visible = false
    // Kaylee and Daddy stand closer in on a tall screen.
    const d = this.tall ? DADDY_TALL : DADDY_AT
    this.nick.place(d.x, 0, d.z, d.face)
    if (!n) return
    const rows = this.tall ? [items.slice(0, Math.ceil(n / 2)), items.slice(Math.ceil(n / 2))] : [items]
    rows.forEach((row, r) => {
      if (!row.length) return
      const s = this.tall ? 0.6 : Math.min(0.5, 3.4 / n)
      const y = r ? TRAY.yB : TRAY.y
      const z = r ? TRAY.zB : TRAY.z
      row.forEach((it, i) => this.homes.set(it.key, new Vector3((i - (row.length - 1) / 2) * s + 0.05, y, z)))
      const key = `${r}:${row.length}:${s.toFixed(2)}`
      let b = this.boards.get(key)
      if (!b) {
        const wide = row.length * s + 0.1
        b = solid(merge([
          P.rbox(wide, 0.06, 0.36, 0.03, '#FFFFFF', { at: [0.05, y - 0.03, z] }),
          P.box(wide, 0.05, 0.03, PAL.lavenderDark, { at: [0.05, y - 0.01, z + 0.18] }),
          ...[-1, 1].map((sx) => P.cyl(0.025, 0.025, y - 0.06, '#D8D2E6', { at: [0.05 + sx * (wide / 2 - 0.08), (y - 0.06) / 2, z - 0.1] })),
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
    t.root.position.set(h.x, h.y + t.lift, h.z)
    t.model.rotation.z = 0
  }
  private sendHome(t: Tool) {
    this.going.push({ tool: t, from: t.root.position.clone(), t: 0 })
    if (t.item.tool === 'tweezers' && this.grabbed) this.grabbed = null
  }
  /** Back on the tray: the spoon refills, the tissue goes back in its box, the thermometer resets. */
  private reset(t: Tool) {
    if (t.medicine) t.medicine.visible = true
    if (t.box && t.tissue) {
      t.box.visible = true
      t.tissue.visible = false
    }
    if (t.bar) t.bar.scale.y = 0.15
    for (const c of [...t.root.children]) if (c !== t.model) c.removeFromParent()
  }

  // ---------------------------------------------------------------- touch

  protected pickRoots(): Object3D[] {
    return [...[...this.tools.values()].filter((t) => t.root.visible).map((t) => t.root), ...[...this.patients.values()].map((p) => p.root), this.room.xray.mesh, this.room.parrot.root, this.room.carrier.root, this.room.jar.root, this.room.scale.root, this.kaylee.root, this.nick.root]
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
      if (h.tool.box && h.tool.tissue) {
        h.tool.box.visible = false
        h.tool.tissue.visible = true
      }
    }
    // Every move counts (rubbing, winding, pulling), even when frames are slow.
    if (h.moved) this.track(h.tool, new Vector2(x, y), 0)
  }
  pointerUp() {
    const h = this.held
    this.held = null
    if (!h?.moved) return
    // Let go over Daddy's head with a bow: he wears it.
    if (this.hit?.who === 'daddy' && h.tool.item.tool === 'bow' && h.tool.item.color) this.daddyBow(h.tool.item.color)
    this.leave()
    this.sendHome(h.tool)
  }

  protected onTap(id: string | null) {
    if (!id) return
    if (id.startsWith('tool:')) {
      const t = this.tools.get(id.slice(5))
      if (t) this.tapTool(t)
      return
    }
    if (id.startsWith('waiting:')) {
      const p = this.patients.get(id.slice(8) as PatientId)
      if (p?.waiting) {
        p.react('hop')
        p.wag = 1
        this.play(voiceOf(p.id))
        if (p.id === 'elephant') this.tell('elephant', V.facts.elephant)
      }
      return
    }
    switch (id) {
      case 'patient': {
        const p = this.cur
        if (!p || p.hopping) return
        p.react('giggle')
        p.wag = 1
        this.play(voiceOf(p.id))
        if (p.id === 'elephant') this.tell('elephant', V.facts.elephant)
        this.hearts.emit(p.zoneWorld(p.zones[0], tmp).clone().add(new Vector3(0, 0.15, 0.1)), new Vector3(0, 0.4, 0), 1.2, 0.09)
        return
      }
      case 'xray':
        this.xrayLit = 3
        this.play(sfx.boop)
        this.tell('xray', V.facts.xray)
        if (this.cur) this.cur.wag = 1
        return
      case 'parrot': {
        // Flap, squawk, then it copies the last sound she made.
        this.parrotFlap = 0
        sfx.squawk()
        const copy = this.last
        this.after(0.45, () => {
          this.parrotFlap = 0
          copy()
        })
        return
      }
      case 'cat':
        this.catPoke = 0
        this.play(sfx.meow)
        return
      case 'jar':
        this.giveTreat()
        return
      case 'scale':
        this.needle.k = 0
        this.play(sfx.needle)
        return
      case 'family:kaylee':
        this.kaylee.react('hop')
        this.play(sfx.giggle)
        return
      case 'family:nick':
        this.nick.react('hop')
        this.play(sfx.haha)
        return
    }
  }

  /** A tap on a tool: it goes and does a short go by itself (a few beats, a turn of bandage, some suds). */
  private tapTool(t: Tool) {
    const p = this.cur
    if (this.auto || !t.root.visible) return
    if (!p || this.phase !== 'exam') {
      this.pops.set(t, 0)
      sfx.boing()
      return
    }
    let zone = AIM[t.item.tool]
    if (zone === 'nose' && p.id !== 'elephant') zone = 'mouth'
    if (t.item.tool === 'brush' && p.id === 'puppy') zone = 'belly'
    if (t.item.tool === 'soap' && p.id === 'elephant') zone = 'head'
    const s = this.toScreenPx(t.root.position, 0)
    this.going = this.going.filter((g) => g.tool !== t)
    this.auto = { tool: t, t: 0, zone, home: new Vector2(s?.x ?? this.w / 2, (s?.y ?? this.h) + LIFT_PX) }
    this.play(sfx.fwip)
    if (t.box && t.tissue) {
      t.box.visible = false
      t.tissue.visible = true
    }
  }

  /** The synthetic finger of a tap's go: to the zone, a few circles round it (or a pull away), and back. */
  private autoFinger(dt: number): Vector2 | null {
    const a = this.auto
    const p = this.cur
    if (!a || !p) return null
    a.t += dt
    const z = p.zones.find((zz) => zz.id === a.zone) ?? p.zones[0]
    const s = this.toScreenPx(p.zoneWorld(z, tmp), z.r)
    if (!s || a.t > 1.65) {
      this.auto = null
      this.leave()
      this.sendHome(a.tool)
      return null
    }
    const tool = a.tool.item.tool
    const target = new Vector2(s.x, s.y + LIFT_PX - (tool === 'shower' ? 70 : 0))
    if (a.t < 0.35) return a.home.clone().lerp(target, a.t / 0.35)
    const k = a.t - 0.35
    if (tool === 'tweezers') return k < 0.4 ? target : target.clone().add(new Vector2(110, -90).multiplyScalar(Math.min(1, (k - 0.4) / 0.35)))
    if (tool === 'bow' || tool === 'spoon' || tool === 'tissue' || tool === 'thermometer' || tool === 'stethoscope') return target.clone().add(new Vector2(Math.sin(k * 7) * 4, 0))
    const r = Math.max(14, s.r * 0.6)
    return target.clone().add(new Vector2(Math.cos(k * Math.PI * 2) * r, Math.sin(k * Math.PI * 2) * r * 0.7))
  }

  // ---------------------------------------------------------------- where the tool touches

  private toScreenPx(world: Vector3, r: number) {
    const cam = this.rig.camera
    const c = world.clone().project(cam)
    if (c.z > 1) return null
    right.set(1, 0, 0).applyQuaternion(cam.quaternion)
    const e = world.clone().addScaledVector(right, r).project(cam)
    return { x: ((c.x + 1) / 2) * this.w, y: ((1 - c.y) / 2) * this.h, r: (Math.abs(e.x - c.x) * this.w) / 2 }
  }

  /** The zone under a screen point (the tool's tip): the nearest, relative to its size; `aim` pulls a little. */
  zoneAt(x: number, y: number, aim?: ZoneId): Hit | null {
    let best: Hit | null = null
    let score = Infinity
    const test = (who: Hit['who'], zones: Zone[]) => {
      for (const z of zones) {
        const s = this.toScreenPx(z.obj.localToWorld(tmp.copy(z.at)), z.r)
        if (!s) continue
        const rr = Math.max(s.r, MIN_R) * (z.id === aim && who === 'patient' ? 1.4 : 1) + SLOP
        const d = Math.hypot(x - s.x, y - s.y)
        if (d < rr && d / rr < score) {
          score = d / rr
          best = { who, zone: z }
        }
      }
    }
    if (this.cur && !this.cur.hopping && this.phase === 'exam') test('patient', this.cur.zones)
    test('daddy', this.daddy.zones)
    return best
  }

  /** The point on the patient's surface under the tip (for suds), in its part's local space. */
  private surface(p: Patient, z: Zone) {
    this.ray.setFromCamera(this.ndc(this.tip.x, this.tip.y), this.rig.camera)
    // (Not the ink outlines: they draw their back faces, which would put the suds on the far side, inside.)
    const hit = this.ray.intersectObject(p.rig.root, true).find((h) => {
      const m = (h.object as Mesh).material
      return h.object.visible && !Array.isArray(m) && m.side !== BackSide
    })
    const world = hit ? hit.point.clone() : p.zoneWorld(z, new Vector3()).add(new Vector3(0, 0, z.r * 0.8))
    const part = PART_OF[z.id]
    return { part, local: p.partObj(part).worldToLocal(world.clone()), world }
  }

  private onPlane(x: number, y: number, z: number) {
    const cam = this.rig.camera
    const n = this.ndc(x, y)
    const near = new Vector3(n.x, n.y, -1).unproject(cam)
    const dir = new Vector3(n.x, n.y, 1).unproject(cam).sub(near)
    return near.addScaledVector(dir, (z - near.z) / (dir.z || 1e-6))
  }

  /** The tool's tip follows the finger: what's under it now, and what the tool does there (`dt`: time held there). */
  private track(tool: Tool, finger: Vector2, dt: number) {
    const prev = this.tip.clone()
    this.tip.set(finger.x, finger.y - LIFT_PX)
    const moved = Number.isNaN(prev.x) ? 0 : this.tip.distanceTo(prev)
    this.tipWorld.copy(this.onPlane(this.tip.x, this.tip.y, HOLD_Z))
    tool.root.position.copy(this.tipWorld)
    tool.model.rotation.z = tool.lean
    const hit = this.zoneAt(this.tip.x, this.tip.y, AIM[tool.item.tool])
    const key = hit ? `${hit.who}:${hit.zone.id}` : ''
    if (key !== this.hitKey) {
      this.hitKey = key
      this.acc = { t: 0, beat: 0.6, ang: NaN, done: false, dist: 0 }
    }
    this.hit = hit
    this.use(tool, dt, moved)
  }

  /** How many things to leave behind for this much rubbing (one every `px`). */
  private every(px: number, moved: number) {
    this.acc.dist += moved
    const n = Math.floor(this.acc.dist / px)
    this.acc.dist -= n * px
    return Math.min(n, 3)
  }

  private leave() {
    this.hit = null
    this.hitKey = ''
    this.tip.set(NaN, NaN)
  }

  // ---------------------------------------------------------------- what each tool does

  private use(t: Tool, dt: number, moved: number) {
    const p = this.cur
    const hit = this.hit
    const on = hit?.who === 'patient' && p ? hit.zone.id : null
    const dad = hit?.who === 'daddy'
    const id = t.item.tool
    if (hit) this.acc.t += dt
    const silly = (key: string, f: () => void, every = 1.1) => this.ready(key, every) && f()
    const giggle = () => silly('giggle', () => {
      p?.react('giggle')
      if (p) p.wag = 1
      this.play(p?.id === 'puppy' ? sfx.yip : sfx.giggle)
    })
    const daddyHaha = () => silly('daddy', () => {
      this.nick.react('hop')
      this.play(sfx.haha)
      this.daddySays(V.daddy.tickles)
    }, 1.3)
    switch (id) {
      case 'stethoscope': {
        if (!hit) {
          this.acc.beat = 0.6
          break
        }
        this.acc.beat += dt
        const chest = on === 'chest'
        if (this.acc.beat < (dad ? 1.1 : 0.75)) break
        this.acc.beat = 0
        if (dad) {
          this.play(sfx.baboom)
          if (this.daddySays(V.daddy.heart[this.heartN % V.daddy.heart.length])) this.heartN++
          this.hearts.emit(this.tipWorld.clone().add(new Vector3(0, 0.1, 0.1)), new Vector3(0, 0.6, 0.2), 1.6, 0.32, 0)
          this.nick.react('hop')
          break
        }
        this.play(() => sfx.heartbeat(chest ? 1 : 0.35))
        this.hearts.emit(this.tipWorld.clone().add(new Vector3(0.05, 0.05, 0.05)), new Vector3((Math.random() - 0.5) * 0.3, 0.5, 0.1), 1.3, chest ? 0.13 : 0.06)
        if (p && chest) {
          p.wag = Math.min(1, p.wag + 0.3)
          if (++this.prog.beats >= 3) this.finish(p, 'heart')
        }
        break
      }
      case 'thermometer': {
        if (on === 'mouth' || on === 'head') {
          this.prog.temp += dt
          const k = Math.min(1, this.prog.temp / 1.4)
          if (t.bar) t.bar.scale.y = 0.15 + 0.85 * k
          if (p) p.heat = Math.max(p.heat, k)
          if (k >= 1 && p && !p.done.has('temp') && this.finish(p, 'temp')) this.play(sfx.beep)
        } else if (on === 'ear') {
          // In the pony's ear: the line shoots to the top, boing, and a giggly whinny.
          if (t.bar) t.bar.scale.y = 1
          silly('ear', () => {
            this.play(sfx.boing)
            this.after(0.2, () => sfx.whinny())
            p?.react('shake')
          }, 1.4)
        } else if (dad) {
          if (t.bar) t.bar.scale.y = 1
          this.daddySays(V.daddy.hot)
          daddyHaha()
        } else if (on) giggle()
        break
      }
      case 'tweezers': {
        if (p?.thorn && on === 'paw' && !this.grabbed) {
          this.grabbed = this.tip.clone()
          this.play(sfx.pop)
          p.react('wince')
          sfx.whimper()
        }
        if (p?.thorn && this.grabbed && this.tip.distanceTo(this.grabbed) > 70) {
          // Out it comes, on the tweezers' tip.
          const thorn = p.thorn
          p.thorn = null
          t.root.attach(thorn)
          this.grabbed = null
          this.play(sfx.pluck)
          p.react('hop')
          p.wag = 1
          this.sparkles.burst(p.zoneWorld(p.zones.find((z) => z.id === 'paw')!, new Vector3()), 10, 1.4, 1.5, 0.8, 0.04)
          this.finish(p, 'thorn')
        } else if (on && on !== 'paw') giggle()
        else if (dad) daddyHaha()
        break
      }
      case 'cream': {
        if (!hit || moved < 0.5) break
        this.prog.cream += moved
        if (p && on) {
          const z = hit.zone
          if (this.every(22, moved)) {
            const s = this.surface(p, z)
            if (on === 'paw' && p.cream) p.cream.add(s.local, 0.022 * p.H * 2)
            else p.suds[s.part].add(s.local, 0.018 * p.H * 2)
            if (this.ready('squish', 0.3)) this.play(sfx.squish)
          }
          if (on === 'paw' && this.prog.cream > 220 && this.finish(p, 'cream')) this.sparkles.burst(this.tipWorld, 8, 1, 1.4, 0.7, 0.04)
        } else if (dad) {
          if (this.every(30, moved)) this.daddy.suds?.add(this.nick.rig.head.worldToLocal(this.tipWorld.clone()), 0.035)
          daddyHaha()
        }
        break
      }
      case 'bandage': {
        const color = t.item.color ?? PAL.pink
        if (p && on === 'paw') {
          const z = hit!.zone
          const c = this.toScreenPx(p.zoneWorld(z, tmp), z.r)
          if (!c) break
          const ang = Math.atan2(this.tip.y - c.y, this.tip.x - c.x)
          if (!Number.isNaN(this.acc.ang) && moved > 0.5) {
            let d = ang - this.acc.ang
            d = Math.atan2(Math.sin(d), Math.cos(d))
            this.prog.wrap += Math.abs(d)
          }
          this.acc.ang = ang
          const n = Math.min(3, Math.floor(this.prog.wrap / Math.PI))
          if (n > 0 && (n !== Math.min(3, Math.floor((this.prog.wrap - 0.001) / Math.PI)) || this.prog.color !== color)) {
            if (this.prog.color !== color || this.ready('wrap', 0.15)) this.play(sfx.wrap)
          }
          this.prog.color = color
          p.wrap(n, color)
          if (this.prog.wrap >= 3 * Math.PI && this.finish(p, 'bandage')) this.sparkles.burst(this.tipWorld, 12, 1.2, 1.6, 0.8, 0.045)
        } else if (dad && hit?.zone.id === 'head') {
          this.daddyBand(color)
          daddyHaha()
        } else if (on) giggle()
        break
      }
      case 'brush': {
        if (!hit || moved < 0.5) break
        if (p && on) {
          this.prog.brush += moved
          if (this.every(25, moved)) this.fluff.emit(this.tipWorld, new Vector3((Math.random() - 0.5) * 0.8, 0.4, 0.3), 1, 0.035, PATIENTS.indexOf(p.id))
          if (this.ready('swish', 0.35)) this.play(sfx.swish)
          p.wag = Math.min(1, p.wag + 0.02)
          if (p.id === 'pony' && (on === 'head' || on === 'ear')) p.fluff = Math.min(1, p.fluff + moved / 500)
          if (p.id === 'elephant') giggle()
          if (p.id === 'pony' && this.prog.brush > 260 && this.finish(p, 'brush')) {
            p.fluff = 1
            this.sparkles.burst(this.tipWorld, 10, 1.2, 1.5, 0.8, 0.045)
          }
        } else if (dad) {
          this.daddy.fluff = Math.min(1, this.daddy.fluff + moved / 400)
          daddyHaha()
        }
        break
      }
      case 'soap': {
        if (!hit || moved < 0.5) break
        if (p && on) {
          this.prog.soap += moved
          for (let i = this.every(16, moved); i > 0; i--) {
            const s = this.surface(p, hit.zone)
            p.suds[s.part].add(s.local, (0.05 + Math.random() * 0.035) * p.H)
            if (this.ready('bubbles', 0.25)) this.play(sfx.bubbles)
            if (Math.random() < 0.3) this.bubbles.emit(s.world, new Vector3((Math.random() - 0.5) * 0.3, 0.35, 0.2), 1.5, 0.04)
          }
          // The mud under the soap comes off.
          for (const m of p.mud) m.wash((w) => this.near(w, 48))
          const suds = Object.values(p.suds).reduce((a, b) => a + b.count, 0)
          if (suds >= 12 && this.finish(p, 'soap') && p.id === 'elephant') this.sneeze(p)
        } else if (dad) {
          if (this.every(24, moved)) this.daddy.suds?.add(this.nick.rig.head.worldToLocal(this.tipWorld.clone()), 0.05 + Math.random() * 0.03)
          daddyHaha()
        }
        break
      }
      case 'shower': {
        // Water falls from it wherever it is; whatever is under the stream gets rinsed.
        for (let i = 0; i < 2; i++) this.drops.emit(this.tipWorld.clone().add(new Vector3((Math.random() - 0.5) * 0.1, -0.03, (Math.random() - 0.5) * 0.06)), new Vector3((Math.random() - 0.5) * 0.4, -1.2, 0), 0.9, 0.03)
        if (this.ready('water', 0.2)) this.play(sfx.water)
        if (p && this.phase === 'exam' && !p.hopping) {
          const under = (w: Vector3) => {
            const s = this.toScreenPx(w, 0)
            return !!s && Math.abs(s.x - this.tip.x) < 75 && s.y > this.tip.y - 30
          }
          const wet = Object.values(p.suds).reduce((a, b) => a + b.wash(under), 0) + p.mud.reduce((a, m) => a + m.wash(under), 0)
          const c = this.toScreenPx(this.patientCenter(p), 0.4 * p.H)
          const over = !!c && Math.abs(c.x - this.tip.x) < c.r + 40 && this.tip.y < c.y + c.r
          if (over) {
            p.wet = 1
            if (wet && this.ready('splash', 0.25)) this.play(sfx.splash)
            const left = Object.values(p.suds).reduce((a, b) => a + b.count, 0) + p.mud.reduce((a, m) => a + m.count, 0)
            if (p.id === 'elephant') {
              if (p.done.has('sneeze') && !p.done.has('rinse') && this.spray === 0) this.trunkShower(p)
            } else if (p.done.has('soap') && left === 0 && this.finish(p, 'rinse')) {
              p.react('shake')
              this.play(sfx.shake)
              this.drops.burst(this.patientCenter(p), 24, 2.2, 1.8, 0.8, 0.035)
            } else if (!p.done.has('soap')) silly('shake', () => {
              p.react('shake')
              this.play(sfx.shake)
            }, 1.6)
          }
        }
        if (dad) daddyHaha()
        break
      }
      case 'towel': {
        if (!hit || moved < 0.5) break
        if (p && on) {
          if (p.wet > 0) {
            p.wet = Math.max(0, p.wet - moved / 320)
            if (this.ready('rub', 0.3)) this.play(sfx.swish)
            if (p.wet === 0 && p.done.has('rinse') && this.finish(p, 'dry')) {
              p.react('shake')
              this.fluff.burst(this.patientCenter(p), 10, 1.2, 1.2, 0.9, 0.04)
            }
          } else giggle()
        } else if (dad) daddyHaha()
        break
      }
      case 'bow': {
        const color = t.item.color ?? PAL.hotpink
        if (p && (on === 'head' || on === 'ear') && this.acc.t > 0.3 && !this.acc.done) {
          this.acc.done = true
          p.putBow(color, this.bag)
          this.play(sfx.chime)
          p.wag = 1
          p.react('hop')
          this.finish(p, 'bow')
        } else if (dad && hit?.zone.id === 'head' && this.acc.t > 0.3 && !this.acc.done) {
          this.acc.done = true
          this.daddyBow(color)
        } else if (on && on !== 'head' && on !== 'ear') giggle()
        break
      }
      case 'spoon': {
        if ((on === 'mouth' || on === 'head') && p && t.medicine?.visible && this.acc.t > 0.35) {
          t.medicine.visible = false
          this.play(sfx.slurp)
          this.after(0.35, () => {
            p.react('shiver')
            sfx.bleh()
          })
          this.after(1.1, () => {
            p.react('hop')
            p.wag = 1
            this.finish(p, 'medicine')
          })
        } else if (dad && t.medicine?.visible && this.acc.t > 0.35) {
          t.medicine.visible = false
          this.play(sfx.slurp)
          this.after(0.35, () => {
            this.nick.react('wiggle')
            sfx.bleh()
            this.daddySays(V.daddy.yucky)
          })
        } else if (on && on !== 'mouth' && on !== 'head') giggle()
        break
      }
      case 'tissue': {
        // (The elephant's trunk hangs over its mouth: either one is its nose.)
        const nose = on === 'nose' || on === 'mouth'
        if (p && nose && this.acc.t > 0.25 && !this.acc.done) {
          this.acc.done = true
          this.play(sfx.honk)
          p.react('giggle')
          if (t.tissue) t.tissue.scale.setScalar(1.25)
          if (p.id === 'elephant') this.finish(p, 'tissue')
        } else if (dad && this.acc.t > 0.25 && !this.acc.done) {
          this.acc.done = true
          this.play(sfx.honk)
          this.nick.react('hop')
          this.daddySays(V.daddy.honk)
        } else if (on && !nose) giggle()
        break
      }
    }
  }

  /** A screen-space test: is this world point within `px` of the tool's tip? */
  private near(w: Vector3, px: number) {
    const s = this.toScreenPx(w, 0)
    return !!s && Math.hypot(s.x - this.tip.x, s.y - this.tip.y) < px
  }

  private finish(p: Patient, n: Need) {
    if (!p.finish(n)) return false
    sfx.chime()
    this.kaylee.react('hop')
    p.wag = 1
    return true
  }

  /** The elephant, all soapy: ah... ah... CHOO! The suds fly all over the room. */
  private sneeze(p: Patient) {
    this.after(0.9, () => {
      p.tiltGoal = 1
      sfx.ahh()
    })
    this.after(2.0, () => {
      p.tiltGoal = 0
      p.react('hop')
      sfx.choo()
      const c = this.patientCenter(p)
      for (const b of Object.values(p.suds))
        for (const w of b.clear()) {
          const v = w.clone().sub(c).setY(0.3).normalize().multiplyScalar(1.5 + Math.random() * 1.5)
          this.bubbles.emit(w, v.add(new Vector3(0, Math.random() * 0.8, 0.6)), 2.4 + Math.random(), 0.12 + Math.random() * 0.06)
        }
      this.bubbles.burst(p.zoneWorld(p.zones.find((z) => z.id === 'nose')!, new Vector3()), 24, 2.5, 1.2, 2.2, 0.13)
      this.after(0.5, () => {
        this.nick.react('hop')
        this.kaylee.react('hop')
        sfx.giggle()
        this.vev.say(V.bless)
      })
      this.finish(p, 'sneeze')
    })
  }

  /** The elephant drinks from the shower, then gives everyone a happy trunk shower. */
  private trunkShower(p: Patient) {
    this.spray = 0.001
    p.tiltGoal = 1
    sfx.slurp()
    this.after(0.8, () => {
      sfx.trumpet()
      this.spray = 1.6
    })
    this.after(2.6, () => {
      p.tiltGoal = 0
      this.kaylee.react('hop')
      sfx.giggle()
      this.finish(p, 'rinse')
    })
  }

  private giveTreat() {
    this.lidPop = 0
    this.play(sfx.pop)
    const p = this.cur && this.phase === 'exam' ? this.cur : null
    const from = new Vector3(JAR[0], JAR[1] + 0.3, JAR[2])
    this.treatMesh.visible = true
    this.treat = {
      g: this.treatMesh,
      t: 0,
      from,
      to: () => (p ? p.zoneWorld(p.zones.find((z) => z.id === 'mouth')!, new Vector3()) : this.nick.rig.head.localToWorld(new Vector3(0, this.nick.rig.face.headY - 0.2, 0.3))),
      done: () => {
        sfx.munch()
        if (p) {
          p.react('hop')
          p.wag = 1
          this.after(0.4, () => voiceOf(p.id)())
        } else this.nick.react('hop')
      },
    }
  }

  private daddyBow(color: string) {
    this.daddy.bow?.removeFromParent()
    const r = this.nick.rig
    const b = solid(buildBowGeometry(color, 1.3), this.bag, 2)
    b.position.set(0.4 * r.face.R, r.face.headY + 1.0 * r.face.R, 0.2 * r.face.R)
    b.rotation.z = -0.4
    r.head.add(b)
    this.daddy.bow = b
    this.play(sfx.chime)
    this.nick.react('hop')
    this.after(0.3, () => sfx.haha())
    this.daddySays(V.daddy.bow)
  }
  private daddyBand(color: string) {
    if (this.daddy.band) return
    const r = this.nick.rig
    const b = solid(merge([P.torus(r.face.R * 1.02, r.face.R * 0.12, color, { at: [0, r.face.headY + 0.3 * r.face.R, 0], rot: [Math.PI / 2 + 0.15, 0, 0] })]), this.bag, 2)
    r.head.add(b)
    this.daddy.band = b
    this.play(sfx.wrap)
  }

  // ---------------------------------------------------------------- per frame

  private play(f: () => void) {
    this.last = f
    f()
  }
  /** Daddy says it, unless he spoke a moment ago. */
  private daddySays(l: Line) {
    if (this.time - this.daddySaid < DADDY_GAP) return false
    this.daddySaid = this.time
    this.vev.say(l)
    return true
  }
  /** Sparkle's fact, the first time she pokes the thing. */
  private tell(key: string, l: Line) {
    if (this.told.has(key)) return
    this.told.add(key)
    this.vev.say(l)
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
    // ---- Tools flying home, popping in ----
    for (const g of [...this.going]) {
      g.t += dt / 0.35
      const home = this.homes.get(g.tool.item.key)
      if (!home) continue
      const to = tmp.set(home.x, home.y + g.tool.lift, home.z)
      g.tool.root.position.lerpVectors(g.from, to, Math.min(1, g.t)).y += bell(Math.min(1, g.t)) * 0.15
      g.tool.model.rotation.z = g.tool.lean * (1 - Math.min(1, g.t))
      if (g.t >= 1) {
        this.going.splice(this.going.indexOf(g), 1)
        this.reset(g.tool)
        this.rest(g.tool)
        this.play(sfx.thump)
      }
    }
    for (const [tl, k] of this.pops) {
      const k2 = Math.min(1, k + dt / 0.45)
      this.pops.set(tl, k2)
      tl.root.scale.setScalar(k2 < 1 ? 1 + wobble(k2, 2) * 0.25 : 1)
      if (k2 >= 1) this.pops.delete(tl)
    }
    // A hand that's held still on a tool on the tray: it lifts a little ("I'm ready").
    if (this.held && !this.held.moved && this.isHome(this.held.tool)) this.held.tool.root.position.y += (this.homes.get(this.held.tool.item.key)!.y + this.held.tool.lift + 0.06 - this.held.tool.root.position.y) * 0.3
    // ---- The patients ----
    const look = tool ? this.tipWorld : this.kaylee.root.position.clone().setY(1.0)
    for (const p of this.patients.values()) {
      if (!p.root.visible) continue
      p.lookAt(p.waiting ? null : look)
      if (p === this.cur) {
        // Wet: drops fall off it (and off the pony's mane) until the towel.
        if (p.wet > 0 && Math.random() < dt * 8 * p.wet) this.drops.emit(this.patientCenter(p).add(new Vector3((Math.random() - 0.5) * 0.3, -0.05, 0.1)), new Vector3(0, -0.4, 0), 0.8, 0.025)
        if (!(tool?.item.tool === 'thermometer' && (this.hit?.zone.id === 'mouth' || this.hit?.zone.id === 'head'))) p.heat = Math.max(0, p.heat - dt * (p.done.has('temp') ? 0.45 : 0.15))
        if (p.id === 'elephant' && p.done.has('rinse')) p.wet = 0
      }
      p.update(dt, t)
    }
    if (this.spray > 0.001) {
      this.spray = Math.max(0.001, this.spray - dt)
      const p = this.patients.get('elephant')!
      const nose = p.zoneWorld(p.zones.find((z) => z.id === 'nose')!, new Vector3())
      for (let i = 0; i < 3; i++) this.drops.emit(nose, new Vector3(-1.4 - Math.random() * 1.2, 2.6 + Math.random() * 1.2, 0.3 + (Math.random() - 0.5) * 0.6), 1.2, 0.04)
      if (this.spray <= 0.002) this.spray = 0
    }
    if (this.cur && this.phase === 'exam' && this.cur.healed) this.heal(this.cur)
    const nxt = this.cur && this.phase === 'exam' ? this.cur.next : null
    const icon = nxt ? NEED_ICONS[nxt] : null
    if (icon !== this.needIcon) {
      this.needIcon = icon
      this.vev.need(icon)
    }
    // ---- Kaylee and Daddy watch the tool (Kaylee reaches out while she holds one) ----
    this.kaylee.lookAt(look.x, look.y, look.z)
    this.nick.lookAt(look.x, look.y, look.z)
    this.kaylee.update(dt, t)
    this.kayleeHop += ((tool ? 1 : 0) - this.kayleeHop) * (1 - Math.exp(-dt * 8))
    this.kaylee.rig.armR.rotation.x = -1.1 * this.kayleeHop
    this.nick.update(dt, t)
    this.daddy.suds?.update(dt, t)
    const dm = this.nick.rig.mane
    if (dm) dm.scale.setScalar(1 + 0.4 * this.daddy.fluff)
    // ---- The pokeables ----
    const r = this.room
    this.xrayLit = Math.max(0, this.xrayLit - dt)
    if (this.xrayLit > 0 || Math.floor(t * 4) !== Math.floor((t - dt) * 4)) {
      drawXray(r.xray.canvas, this.cur?.id ?? 'puppy', t, this.xrayLit > 0)
      r.xray.tex.needsUpdate = true
    }
    this.parrotFlap = Math.min(1, this.parrotFlap + dt / 0.6)
    const flap = Math.sin(this.parrotFlap * Math.PI * 6) * bell(this.parrotFlap) * 1.1
    r.parrot.wingL.rotation.z = -0.1 - flap
    r.parrot.wingR.rotation.z = 0.1 + flap
    r.parrot.root.position.y = PARROT.perch + 0.02 + bell(this.parrotFlap) * 0.08
    r.parrot.root.rotation.y = 0.5 + Math.sin(t * 0.7) * 0.3
    r.parrot.root.rotation.z = Math.sin(t * 1.3) * 0.08
    this.catPoke = Math.min(1, this.catPoke + dt / 1.0)
    r.carrier.root.rotation.z = Math.sin(this.catPoke * Math.PI * 5) * 0.05 * (1 - this.catPoke)
    r.carrier.paw.scale.setScalar(Math.max(0.01, bell(this.catPoke)))
    this.lidPop = Math.min(1, this.lidPop + dt / 0.5)
    r.jar.lid.position.y = 0.26 + bell(this.lidPop) * 0.18
    r.jar.lid.rotation.z = bell(this.lidPop) * 0.5
    this.needle.k = Math.min(1, this.needle.k + dt / 1.2)
    r.scale.needle.rotation.z = this.needle.base + wobble(this.needle.k, 4) * 1.2
    if (this.treat) {
      const tr = this.treat
      tr.t += dt / 0.6
      const k = Math.min(1, tr.t)
      tr.g.position.lerpVectors(tr.from, tr.to(), k).y += bell(k) * 0.5
      tr.g.rotation.z = k * 8
      if (k >= 1) {
        tr.g.visible = false
        this.treat = null
        tr.done()
      }
    }
    for (const f of [this.hearts, this.bubbles, this.drops, this.fluff, this.sparkles]) f.update(dt)
  }

  // ---------------------------------------------------------------- camera, anchors, hint

  setSize(w: number, h: number, top: number) {
    super.setSize(w, h, top)
    this.layout()
  }

  protected shot(): Shot {
    // The table, the tray, Kaylee and Daddy; on a tall screen two rows of tools and more ceiling and floor.
    if (this.w < this.h) return { center: new Vector3(0.12, 1.0, 0.65), half: new Vector3(1.12, 1.15, 0.5), yaw: 0, pitch: 13, minDist: 4 }
    return { center: new Vector3(0.05, 1.12, 0.35), half: new Vector3(1.8, 1.02, 0.45), yaw: 0, pitch: 11, minDist: 4 }
  }

  protected anchorAt(id: string): AnchorSpot | null {
    if (id.startsWith('tool:')) {
      const t = this.tools.get(id.slice(5))
      if (!t?.root.visible) return null
      const s = this.tall ? 0.6 : Math.min(0.5, 3.4 / Math.max(1, this.trayItems.length))
      return { at: t.root.position.clone().add(new Vector3(0, 0.1, 0)), r: s * 0.47, prio: 3, max: 140 }
    }
    if (id.startsWith('waiting:')) {
      const p = this.patients.get(id.slice(8) as PatientId)
      return p?.waiting ? { at: this.patientCenter(p), r: 0.2, prio: 2, max: 110 } : null
    }
    switch (id) {
      case 'patient': {
        const p = this.cur
        return p && this.phase === 'exam' ? { at: this.patientCenter(p), r: 0.32 * p.H, prio: 1, max: 160 } : null
      }
      case 'xray':
        return { at: new Vector3(XRAY.x, XRAY.y, -1.5), r: 0.36 }
      case 'parrot':
        return { at: this.room.parrot.root.position.clone().add(new Vector3(0, 0.15, 0)), r: 0.2 }
      case 'cat':
        return { at: this.room.carrier.root.position.clone().add(new Vector3(0, 0.16, 0.1)), r: 0.22 }
      case 'jar':
        return { at: this.room.jar.root.position.clone().add(new Vector3(0, 0.14, 0)), r: 0.16 }
      case 'scale':
        return { at: new Vector3(SCALE[0], 0.4, SCALE[2] - 0.1), r: 0.26, prio: 1 }
      case 'family:kaylee':
        return { at: this.kaylee.root.position.clone().setY(0.55), r: 0.3, prio: 0, max: 120 }
      case 'family:nick':
        return { at: this.nick.root.position.clone().setY(0.95), r: 0.4, prio: 0, max: 130 }
    }
    return null
  }

  protected hintAt() {
    const p = this.cur
    if (!p || this.phase !== 'exam' || this.auto) return null
    const n = p.next
    const want = n ? NEED_TOOL[n] : null
    if (!want || !n) return null
    // Sparkle says what's next, once each time the 👆 shows.
    if (this.hintFor !== this.lastTouch) {
      this.hintFor = this.lastTouch
      this.vev.say(V.hint[n])
    }
    const held = this.held?.moved ? this.held.tool : null
    if (held?.item.tool === want) {
      let zone = AIM[want]
      if (zone === 'nose' && p.id !== 'elephant') zone = 'mouth'
      const z = p.zones.find((zz) => zz.id === zone)
      this.hintDown = false
      return z ? p.zoneWorld(z, new Vector3()) : null
    }
    const t = [...this.tools.values()].find((tl) => tl.root.visible && tl.item.tool === want)
    this.hintDown = !!t
    return t ? t.root.position.clone().add(new Vector3(0, 0.36, 0)) : null
  }

  placeAnchors() {
    super.placeAnchors()
    const hands = this.hintHands?.children
    if (hands?.length === 2) {
      ;(hands[0] as HTMLElement).style.display = this.hintDown ? 'none' : ''
      ;(hands[1] as HTMLElement).style.display = this.hintDown ? '' : 'none'
    }
    const el = this.bubbleEl
    if (!el) return
    const p = this.cur
    const s = p && this.phase === 'exam' && this.needIcon ? this.toScreenPx(p.root.localToWorld(new Vector3(0.35 * p.H, 1.25 * p.H, 0)), 0) : null
    el.style.display = s ? '' : 'none'
    if (s) el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`
  }

  qa() {
    const p = this.cur
    const zones: Record<string, [number, number, number]> = {}
    if (p)
      for (const z of p.zones) {
        if (zones[z.id]) continue
        const s = this.toScreenPx(p.zoneWorld(z, new Vector3()), z.r)
        if (s) zones[z.id] = [Math.round(s.x), Math.round(s.y), Math.round(s.r)]
      }
    const tools: Record<string, [number, number]> = {}
    for (const [k, t] of this.tools) {
      if (!t.root.visible) continue
      const s = this.toScreenPx(t.root.position.clone().add(new Vector3(0, 0.1, 0)), 0)
      if (s) tools[k] = [Math.round(s.x), Math.round(s.y)]
    }
    return {
      game: 'vet',
      phase: this.phase,
      patient: p?.id ?? null,
      need: p?.next ?? null,
      done: p ? [...p.done] : [],
      healed: [...this.patients.values()].filter((x) => x.waiting).map((x) => x.id),
      held: this.held?.moved ? this.held.tool.item.key : (this.auto?.tool.item.key ?? null),
      hover: this.hitKey || null,
      liftPx: LIFT_PX,
      touches: this.touches,
      zones,
      tools,
    }
  }
}

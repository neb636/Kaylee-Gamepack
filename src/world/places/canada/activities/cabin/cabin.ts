// The Team Cabin (planning/around-the-world/canada-round-2.md, part 4): inside the skate hut beside the canal, the
// friends who have joined sit on the bench and she dresses them. A toy on the map: no stamp, no end.
//
// The toy (core verb): drag a thing from the cubby shelf onto a friend, or tap it and it flies onto the friend in focus
// (the last one she touched or dressed; Maple to begin with). Jerseys in five colors, six hats, five scarves, three
// cheek stamps. It grows by itself: Maple alone at first, a friend more on the bench after every chapter.
// Silly, never wrong: a thing dropped in the wrong place sits where it landed (a hat on a tummy, a jersey on a head,
// anything on Monty's antlers) while they go cross-eyed at it, then it hops to where it goes; dropped on the floor it
// boings and goes back to its bin. Each friend has a hat they love (a line in their own voice). Gus pokes his head in
// at the window now and then (tap the window and he comes) and takes a hat or a scarf. The mirror takes a team photo
// that's pinned on the wall. Every choice is saved at once (looks.ts saveWorn) and stays: on the map, at the rink, in
// the films and in the big game (characters/worn.ts dresses them everywhere).
//
// room.ts is the hut, tray.ts the cubby shelf, characters/worn.ts how each thing sits on each friend. Built for
// engine3d/View3D.tsx; nothing here comes from Thailand (its wardrobe has its own drag and fly; engine3d/drag.ts is the
// shared one).
import { Box3, Color, Group, Mesh, MeshBasicMaterial, PlaneGeometry, Raycaster, Scene, SRGBColorSpace, TextureLoader, Vector2, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { clamp, say, Timers, type Line } from '../../../../../sdk'
import { knobs } from '../../../../kit/knobs'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import { CameraRig } from '../../../../engine3d/camera'
import { Bag } from '../../../../engine3d/dispose'
import { DragPlane, Flights, nearestSlot, toScreen } from '../../../../engine3d/drag'
import { merge, P, solid, solidMix } from '../../../../engine3d/geo'
import { setOutlineResolution } from '../../../../engine3d/outline'
import { Particles } from '../../../../engine3d/particles'
import { photoCamera, snapPhoto } from '../../../../engine3d/photo'
import { makeLights, PAL } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import type { FilmActor } from '../../../../engine3d/characters/actor'
import { dressToy, dressWorn } from '../../characters/dress'
import { Goose } from '../../characters/goose'
import type { CanadaFriend } from '../../characters/looks'
import { Lulu } from '../../characters/lulu'
import type { Performer, ToyActor } from '../../characters/toy'
import { Tuque } from '../../characters/tuque'
import { canWear, wearPoint, type WearKind } from '../../characters/worn'
import { L } from '../../lines'
import { saveWorn, wornBy, type TeamId, type Worn } from '../../looks'
import { Friend } from '../../story/cast'
import { buildRoom, type Layout, type Room } from './room'
import { cabinSfx } from './sounds'
import { Tray, type TrayItem } from './tray'

const FILE = 'src/world/places/canada/activities/cabin/cabin.ts'
/** How a thing feels in her finger (the feel lab, ?feel=1). */
export const FEEL = knobs('cabin', 'The Team Cabin', FILE, {
  lift: { value: 26, min: 0, max: 90, step: 2, label: 'Held above her finger', unit: 'px', note: 'a dragged thing rides this far above her finger, so she can see what she carries' },
  snap: { value: 95, min: 30, max: 220, step: 5, label: 'Snaps onto a friend from', unit: 'px', note: 'let go this close to where it goes on a friend (or anywhere on them) and it goes on' },
  fly: { value: 0.42, min: 0.15, max: 1.2, step: 0.01, label: 'Fly-on time', unit: 's', note: 'a tapped thing’s flight from the shelf onto the friend in focus' },
  arc: { value: 0.5, min: 0, max: 1.6, step: 0.05, label: 'Fly-on arc', unit: 'm', note: 'how high the middle of that flight lifts' },
  perch: { value: 0.9, min: 0.3, max: 2.5, step: 0.05, label: 'Silly perch', unit: 's', note: 'how long a thing dropped in a silly place (a hat on a tummy) sits there before it hops to where it goes' },
})

/** Who the cabin seats besides Maple, in the order they joined. */
export interface CabinStart {
  team: TeamId[]
}
export interface CabinEvents {
  /** She's been still a while: Sparkle says the one instruction again (the page decides if it's time). */
  hint(): void
  /** The mirror's photo, as a JPEG data URL. */
  photo(url: string): void
  /** The camera's flash. */
  flash(): void
}

/** A friend's height in the cabin (a little bigger than life, so faces read). */
const CABIN_H: Record<TeamId, number> = { maple: 1.0, monty: 1.7, roxy: 1.0, ollie: 1.0, misty: 1.35, tuque: 1.15, lulu: 0.8, gus: 1.0 }
/** How much of the bench each takes (antlers and stick arms included). */
const WIDTH: Record<TeamId, number> = { maple: 0.66, monty: 1.02, roxy: 0.64, ollie: 0.66, misty: 0.9, tuque: 1.02, lulu: 0.64, gus: 0.6 }
const RIG: Partial<Record<TeamId, CanadaFriend>> = { maple: 'maple', monty: 'moose', roxy: 'raccoon', misty: 'spirit', ollie: 'otter' }
const VOICE: Partial<Record<TeamId, string>> = { maple: 'maple', monty: 'moose', roxy: 'raccoon', misty: 'bear', ollie: 'otter' }
/** The hat each friend loves (Tuque loves them all: "Two hats!"). */
const LOVES: Partial<Record<TeamId, string>> = { maple: 'flowers', monty: 'crown', roxy: 'antlers', misty: 'pompom', ollie: 'helmet', lulu: 'flowers' }
const NAMES: Record<TeamId, string> = { maple: 'Maple', monty: 'Monty', roxy: 'Roxy', ollie: 'Ollie', misty: 'Misty', tuque: 'Tuque', lulu: 'Lulu', gus: 'Gus' }
/** A friend says something silly at most this often (s). */
const SILLY_GAP = 12
/** Seconds still before Sparkle helps. */
const HINT_S = 8
/** The camera's lens (degrees, top to bottom). */
const FOV = 40
/** The camera looks down this much (degrees). */
const PITCH = 9

export const CABIN_ANCHORS: AnchorInfo[] = [
  ...(['maple', 'tuque', 'monty', 'roxy', 'lulu', 'misty', 'ollie'] as TeamId[]).map((id) => ({ id: `f:${id}`, label: NAMES[id], kind: 'thing' as const })),
  { id: 'gus', label: 'Gus at the window', kind: 'thing' },
  { id: 'window', label: 'The window', kind: 'thing' },
  { id: 'mirror', label: 'The mirror: a team photo', kind: 'thing' },
  { id: 'stove', label: 'The stove', kind: 'thing' },
  { id: 'lantern', label: 'The lantern', kind: 'thing' },
  { id: 'skates', label: 'The skates', kind: 'thing' },
]

interface Seat {
  who: TeamId
  actor: Performer
  row: 0 | 1
  x: number
  /** A rig friend's sitting legs (sitLegs), and the bench top they sit on. */
  legs: Group | null
  seatY: number
  /** When they last said something (s of the cabin's clock). */
  spoke: number
}

/** A thing being dragged or flying: a copy of its shelf icon, in the room. */
interface Flyer {
  item: TrayItem
  obj: Group
  /** Its scale at the shelf's distance (the icon's own), so it keeps its size on screen. */
  base: number
}

const tmp = new Vector3()
const tmp2 = new Vector3()
/** Where a thing lands on anyone in the cast (rig-built or hand-built). */
const wp = (a: Performer, kind: WearKind, out: Vector3) => wearPoint(a as FilmActor | ToyActor, kind, out)

export class TeamCabinWorld implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  readonly timers = new Timers()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private room!: Room
  private layoutNow: Layout | null = null
  private narrow = false
  private fronted = 0
  /** How many fit in the front row: four, or on a phone held upright half the team (the rest on the back bench). */
  private get frontMax() {
    return this.h > this.w * 1.6 ? Math.max(2, Math.ceil(this.seats.length / 2)) : 4
  }
  private seats: Seat[] = []
  private gus: Goose
  private gusAt = { state: 'away' as 'away' | 'up' | 'in' | 'down', t: 0, next: 9, stay: 10 }
  private tray: Tray
  private flights = new Flights()
  private plane = new DragPlane()
  private ray = new Raycaster()
  private sparkle: Particles
  private sparks: Particles
  private ring: Group
  private pending: { item: TrayItem; x: number; y: number } | null = null
  private drag: Flyer | null = null
  private hover: TeamId | null = null
  private focus: TeamId = 'maple'
  private w = 1
  private h = 1
  private top = 104
  private time = 0
  private idle = 0
  private hints = 0
  private photoT = -1
  private photos: Group[] = []
  private stoveT = -1
  private lanternV = 0
  private skateV = 0
  private paneK = 0
  private spoken = new Map<string, number>()
  private anchorEls = new Map<string, HTMLElement>()
  private hintEl: HTMLElement | null = null
  private gone = false
  private counts = { taps: 0, drags: 0, dressed: 0, silly: 0, floor: 0, photos: 0, gusCalls: 0, binsOpened: 0, pokes: 0 }
  private last = ''
  /** Things sitting in a silly place, about to hop where they go. */
  private perching = 0

  constructor(
    private renderer: WebGLRenderer,
    start: CabinStart,
    private events: CabinEvents,
  ) {
    this.scene.background = new Color('#8A5A3C')
    this.scene.add(this.rig.camera)
    this.tray = new Tray(this.bag)
    this.rig.camera.add(this.tray.group)
    this.sparkle = new Particles({ kind: 'spray', count: 160, colors: [PAL.hotpink, PAL.butter, PAL.mint, PAL.lavender, '#FFFFFF'], gravity: 2.5 }, this.bag)
    this.sparks = new Particles({ kind: 'spray', count: 60, colors: ['#FFC86B', '#FF9A3C', '#FFE9A8'], gravity: 1.5 }, this.bag)
    this.scene.add(this.sparkle.mesh, this.sparks.mesh)
    this.ring = solid(merge([P.torus(1, 0.06, '#FF8FB8', { rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.5] })]), this.bag, 0)
    this.scene.add(this.ring)
    for (const who of ['maple', ...start.team] as TeamId[]) this.seats.push(this.makeSeat(who))
    this.gus = new Goose(this.bag, { height: CABIN_H.gus, voice: 'gus', captain: true })
    dressToy(this.gus as ToyActor, 'gus', wornBy('gus'), this.bag)
    this.scene.add(this.gus.root)
    this.arrange('wide')
  }

  // ---------------------------------------------------------------- the team on the bench

  private makeSeat(who: TeamId): Seat {
    const H = CABIN_H[who]
    let actor: Performer
    const rig = RIG[who]
    if (rig) {
      const f = new Friend(rig, this.bag, { height: H, voice: VOICE[who] })
      if (who !== 'maple') f.scarf(true)
      actor = f
    } else if (who === 'tuque') {
      const t = new Tuque(this.bag, { height: H }).scarf(true)
      dressToy(t, who, wornBy(who), this.bag)
      actor = t
    } else {
      const l = new Lulu(this.bag, { height: H }).scarf(true)
      dressToy(l, who, wornBy(who), this.bag)
      actor = l
    }
    this.scene.add(actor.root)
    return { who, actor, row: 0, x: 0, legs: null, seatY: 0, spoke: -99 }
  }

  /** Seats everyone for the screen's shape: one long bench, or (a tall screen) the small ones in front and the big
   *  ones on the step behind, like a team photo. Builds the room for that shape. */
  private arrange(layout: Layout) {
    const narrow = layout === 'wide' && this.h > this.w * 1.05
    if (this.layoutNow === layout && this.narrow === narrow && this.fronted === this.frontMax) return
    this.layoutNow = layout
    this.narrow = narrow
    this.fronted = this.frontMax
    if (this.room) {
      this.room.root.removeFromParent()
      this.room.root.traverse((o) => {
        if (o instanceof Mesh) o.geometry.dispose()
      })
      for (const p of this.photos) p.removeFromParent()
      this.photos = []
    }
    const maple = this.seats[0]
    const rest = this.seats.slice(1)
    let rows: Seat[][]
    if (layout === 'tall' && this.seats.length > this.frontMax) {
      const big = [...rest].sort((a, b) => CABIN_H[b.who] - CABIN_H[a.who]).slice(0, this.seats.length - this.frontMax)
      rows = [this.order(maple, rest.filter((s) => !big.includes(s))), this.order(null, big)]
    } else rows = [this.order(maple, rest), []]
    // Maple (or the middle one) at x = 0, the rest out to each side.
    for (const [r, row] of rows.entries()) {
      if (!row.length) continue
      const at = row.indexOf(maple) >= 0 ? row.indexOf(maple) : Math.floor(row.length / 2)
      let x = -WIDTH[row[at].who] / 2 - row.slice(0, at).reduce((s, q) => s + WIDTH[q.who], 0)
      for (const s of row) {
        s.row = r as 0 | 1
        s.x = x + WIDTH[s.who] / 2
        x += WIDTH[s.who]
      }
    }
    const half = Math.max(0.4, ...rows[0].map((s) => Math.abs(s.x) + WIDTH[s.who] / 2))
    this.room = buildRoom(this.bag, layout, half, narrow)
    this.scene.add(this.room.root)
    const p = this.room.plan
    for (const [r, row] of rows.entries()) for (const s of row) this.sit(s, r === 0 ? p.bench : p.back!)
    this.placeGus(true)
    this.lights.follow(0, 1, -0.5)
    this.frame()
  }

  /** Maple in the middle, the others either side of her, tallest nearest (like a team photo), each on whichever side
   *  is shorter so the row stays balanced. */
  private order(first: Seat | null, rest: Seat[]) {
    const left: Seat[] = []
    const right: Seat[] = []
    let l = 0
    let r = 0
    for (const s of [...rest].sort((a, b) => CABIN_H[b.who] - CABIN_H[a.who])) {
      if (r <= l) {
        right.push(s)
        r += WIDTH[s.who]
      } else {
        left.unshift(s)
        l += WIDTH[s.who]
      }
    }
    return [...left, ...(first ? [first] : []), ...right]
  }

  /** Sits a friend on a bench the way a toy sits on a sofa: bottom on the seat, legs straight out along it, feet up at
   *  its front edge (a rig friend's own legs are built standing, so they stay inside the bench and a pair of sitting legs
   *  goes on: sitLegs). Tuque and Lulu, who have no legs, sit on the bench itself. */
  private sit(s: Seat, b: { y: number; front: number; depth: number }) {
    const a = s.actor
    const H = a.height
    let y = b.y - 0.135 * H
    let z = b.front - 0.37 * H
    if (s.who === 'tuque') {
      y = b.y + 0.005 * H
      z = b.front - 0.33 * H
    } else if (s.who === 'lulu') {
      y = b.y - 0.015 * H
      z = b.front - 0.42 * H
    } else if (a instanceof Friend && !s.legs) {
      s.legs = sitLegs(a, this.bag)
      a.rig.body.add(s.legs)
    }
    s.seatY = b.y
    // The ones at the ends turn in a little, toward the middle.
    a.place(s.x, y, z, clamp(-s.x * 4, -10, 10))
  }

  // ---------------------------------------------------------------- the camera

  /** Frames the room above the shelf: the bench (or both), the window and the mirror, below the top bar. */
  private frame() {
    const cam = this.rig.camera
    const p = this.room.plan
    cam.fov = FOV
    cam.aspect = this.w / this.h
    cam.updateProjectionMatrix()
    // The back wall from the window to the mirror, and the front row from end to end (it's nearer, so it looks wider).
    const wall = Math.max(-(p.window.x - p.window.hw - 0.34), p.mirror.x + p.mirror.hw + 0.24)
    const row = this.seats.filter((s) => s.row === 0)
    const front = Math.max(1.2, ...row.map((s) => Math.abs(s.x) + WIDTH[s.who] / 2 + 0.06))
    const yTop = Math.max(p.window.y + p.window.hh + 0.12, p.mirror.y + p.mirror.hh + 0.12)
    const zBack = p.wallZ
    const zFront = p.bench.front + 0.15
    const corners: Vector3[] = []
    for (const x of [-wall, wall]) for (const y of [p.bench.y, yTop]) corners.push(new Vector3(x, y, zBack))
    for (const x of [-front, front]) for (const y of [p.bench.y * 0.55, p.bench.y + 1.0]) corners.push(new Vector3(x, y, zFront))
    const ndcTop = 1 - (2 * (this.top + 6)) / this.h
    const ndcBottom = 1 - (2 * (this.tray.top - 10)) / this.h
    const margin = 0.96
    const pitch = (PITCH * Math.PI) / 180
    const dir = new Vector3(0, -Math.sin(pitch), -Math.cos(pitch))
    const look = new Vector3(0, yTop * 0.45, (zBack + zFront) / 2)
    const fits = (dist: number) => {
      // Placed, then slid in its own plane until the room sits in the middle of the space above the shelf.
      cam.position.copy(look).addScaledVector(dir, -dist)
      cam.lookAt(cam.position.clone().add(dir))
      for (let it = 0; it < 4; it++) {
        cam.updateMatrixWorld()
        let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
        for (const c of corners) {
          const v = c.clone().project(cam)
          x0 = Math.min(x0, v.x)
          x1 = Math.max(x1, v.x)
          y0 = Math.min(y0, v.y)
          y1 = Math.max(y1, v.y)
        }
        const dx = (x0 + x1) / 2
        // (Sitting just above the shelf: any room to spare goes to the wall above them.)
        const dy = Math.max((y0 + y1) / 2 - (ndcTop + ndcBottom) / 2, y0 - (ndcBottom + 0.02))
        const right = new Vector3(1, 0, 0)
        const up = new Vector3().crossVectors(right, dir).normalize()
        const k = dist * Math.tan((cam.fov * Math.PI) / 360)
        cam.position.addScaledVector(right, dx * k * cam.aspect).addScaledVector(up, dy * k)
        if (it === 3) return x1 - x0 <= 2 * margin && y1 - y0 <= (ndcTop - ndcBottom) * margin
      }
      return false
    }
    let lo = 2
    let hi = 60
    for (let i = 0; i < 22; i++) {
      const mid = (lo + hi) / 2
      if (fits(mid)) hi = mid
      else lo = mid
    }
    fits(hi)
    cam.updateMatrixWorld()
  }

  // ---------------------------------------------------------------- Gus at the window

  private placeGus(snap = false) {
    const p = this.room.plan
    const g = this.gus
    const H = g.height
    const k = this.gusAt.state === 'in' ? 1 : this.gusAt.state === 'up' ? Math.min(1, this.gusAt.t / 0.6) : this.gusAt.state === 'down' ? Math.max(0, 1 - this.gusAt.t / 0.6) : 0
    const e = k * k * (3 - 2 * k)
    const lean = this.gusAt.state === 'in' ? Math.min(1, this.gusAt.t / 0.35) : this.gusAt.state === 'down' ? Math.max(0, 1 - this.gusAt.t / 0.25) : 0
    // Leaning in, his head comes through the open window; ducked down, he's hidden below the sill.
    const y = p.window.y - 0.06 - 0.66 * H - (1 - e) * 1.05
    const z = p.wallZ + 0.22 - 0.58 * H
    if (snap || !g.root.visible) g.place(p.window.x, y, z, 0)
    else g.root.position.set(p.window.x, y, z)
    g.lean = 0.55 * lean
  }

  private callGus() {
    if (this.gusAt.state !== 'away') return
    this.gusAt.state = 'up'
    this.gusAt.t = 0
    this.gusAt.stay = 10
    cabinSfx.creak()
    this.counts.gusCalls++
  }

  private updateGus(dt: number, t: number) {
    const s = this.gusAt
    s.t += dt
    if (s.state === 'away') {
      s.next -= dt
      if (s.next <= 0 && !this.drag) this.callGus()
    } else if (s.state === 'up' && s.t >= 0.6) {
      s.state = 'in'
      s.t = 0
      cabinSfx.honk()
      this.gus.pull('wow')
    } else if (s.state === 'in') {
      // He looks round the room at everybody, then at you.
      this.gus.headTurn = Math.sin(t * 0.9) * 0.45
      const near = this.drag && this.hover === 'gus'
      if (s.t >= s.stay && !near) {
        s.state = 'down'
        s.t = 0
        s.next = 26
      }
    } else if (s.state === 'down' && s.t >= 0.6) {
      s.state = 'away'
      s.t = 0
      cabinSfx.creak()
    }
    // The panes swing open while he's there.
    const open = s.state === 'away' ? 0 : 1
    this.paneK += (open - this.paneK) * Math.min(1, dt * 6)
    this.room.panes[0].rotation.y = -1.35 * this.paneK
    this.room.panes[1].rotation.y = 1.35 * this.paneK
    this.placeGus()
  }

  // ---------------------------------------------------------------- dressing

  private seat(who: TeamId) {
    return this.seats.find((s) => s.who === who) ?? null
  }
  private actorOf(who: TeamId): Performer | null {
    return who === 'gus' ? this.gus : (this.seat(who)?.actor ?? null)
  }

  /** Puts the thing on, saves it, and they react. */
  private wear(who: TeamId, kind: WearKind, id: string) {
    const a = this.actorOf(who)
    if (!a) return
    const worn: Worn = { ...wornBy(who), [kind]: id }
    saveWorn(who, worn)
    if (a instanceof Friend) dressWorn(a, who, worn, this.bag)
    else dressToy(a as ToyActor, who, worn, this.bag)
    // The new thing pops on with a little squash.
    a.root.traverse((o) => {
      if (o.name === 'cabin-hat' || o.name === 'cabin-jersey') o.userData.popT = 0
    })
    this.popping.push(a)
    const at = wp(a, kind, tmp)
    this.sparkle.burst(at.x, at.y, at.z, 16, 1.1, 1.4, 0.06)
    if (kind === 'cheek') cabinSfx.stamp()
    else cabinSfx.pop()
    a.hop()
    a.pull('happy')
    this.counts.dressed++
    this.last = `${who}:${kind}.${id}`
    if (who !== 'gus') this.setFocus(who)
    else this.gusAt.stay = Math.max(this.gusAt.stay, this.gusAt.t + 4)
    // A hat they love: their line (Tuque loves every hat; Gus likes himself in any).
    if (kind === 'hat') {
      if (who === 'gus') this.speak('gus', L.cabin.gus, 0)
      else if (who === 'tuque') this.speak('tuque', L.cabin.love.tuque)
      else if (LOVES[who] === id) {
        if (who === 'lulu') {
          cabinSfx.loon()
          ;(a as Lulu).calling = 1
          this.timers.later(() => ((a as Lulu).calling = 0), 900)
        } else this.speak(who, L.cabin.love[who as keyof typeof L.cabin.love])
      }
    }
  }
  private popping: Performer[] = []

  /** A friend's line, at most every SILLY_GAP seconds each (Gus's every time he gets a new hat). */
  private speak(key: string, line: Line, gap = SILLY_GAP) {
    const last = this.spoken.get(key) ?? -99
    if (this.time - last < gap) return
    this.spoken.set(key, this.time)
    this.timers.later(() => void say(line, { interrupt: false }), 350)
  }

  private setFocus(who: TeamId) {
    this.focus = who
  }

  // ---------------------------------------------------------------- her finger

  private flyerOf(item: TrayItem): Flyer {
    const obj = new Group()
    const icon = item.icon.clone(true)
    obj.add(icon)
    const base = item.holder.getWorldScale(tmp).x
    obj.scale.setScalar(base)
    item.holder.getWorldPosition(obj.position)
    obj.quaternion.copy(this.rig.camera.quaternion)
    this.scene.add(obj)
    return { item, obj, base }
  }

  /** Keeps a flyer the same size on screen wherever it is (it was sized at the shelf's distance). */
  private screenScale(f: Flyer, p: Vector3, k = 1) {
    return f.base * (p.distanceTo(this.rig.camera.position) / this.tray.hudDistance) * k
  }

  /** The friend a thing let go at (x, y) is for, and where on them it landed. */
  private friendAt(x: number, y: number, kind: WearKind): { who: TeamId; part: 'right' | 'head' | 'body' | 'antler' } | null {
    const cands: { key: TeamId; x: number; y: number; r: number }[] = []
    const boxes = new Map<TeamId, { x0: number; x1: number; y0: number; y1: number; neck: number; head: Vector3 }>()
    const all: { who: TeamId; a: Performer }[] = this.seats.map((s) => ({ who: s.who, a: s.actor }))
    if (this.gusAt.state === 'in') all.push({ who: 'gus', a: this.gus })
    for (const { who, a } of all) {
      const b = this.screenBox(a, who)
      boxes.set(who, b)
      const at = toScreen(wp(a, kind, tmp), this.rig.camera, this.w, this.h)
      const inside = x > b.x0 - 14 && x < b.x1 + 14 && y > b.y0 - 14 && y < b.y1 + 10
      cands.push({ key: who, x: at.x, y: at.y, r: inside ? Math.max(b.x1 - b.x0, b.y1 - b.y0) : 0 })
    }
    // (Let go over someone: them, whoever's slot is nearer. Otherwise the nearest slot within the snap.)
    const over = cands.filter((c) => c.r > 0)
    const near = nearestSlot(over.length ? over : cands, x, y, FEEL.snap)
    if (!near) return null
    const who = near.key
    const b = boxes.get(who)!
    if (who === 'monty' && y < b.head.y - (b.neck - b.head.y) * 0.6 && Math.abs(x - (b.x0 + b.x1) / 2) > (b.x1 - b.x0) * 0.2) return { who, part: 'antler' }
    const part = y < b.neck ? 'head' : 'body'
    const wrong = (kind === 'hat' && part === 'body' && y > b.neck + (b.y1 - b.neck) * 0.3) || ((kind === 'jersey' || kind === 'scarf') && part === 'head' && y < b.head.y)
    return { who, part: wrong ? part : 'right' }
  }

  /** A friend's box on screen, where their neck is, and their head's middle. */
  private screenBox(a: Performer, who: TeamId) {
    const cam = this.rig.camera
    const box = new Box3().setFromObject(a.root)
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
    for (const px of [box.min.x, box.max.x]) for (const py of [box.min.y, box.max.y]) {
      const s = toScreen(tmp2.set(px, py, (box.min.z + box.max.z) / 2 + 0.1), cam, this.w, this.h)
      x0 = Math.min(x0, s.x)
      x1 = Math.max(x1, s.x)
      y0 = Math.min(y0, s.y)
      y1 = Math.max(y1, s.y)
    }
    const head = a.head(new Vector3())
    const hs = toScreen(head, cam, this.w, this.h)
    const neck = toScreen(wp(a, 'scarf', tmp2), cam, this.w, this.h).y
    void who
    return { x0, x1, y0, y1, neck: Math.max(neck, hs.y + 4), head: new Vector3(hs.x, hs.y, 0) }
  }

  /** Where the dragged thing rides: on an upright plane just in front of the bench. */
  private planeAt(x: number, y: number) {
    const p = this.room.plan
    this.plane.through(this.rig.camera, tmp.set(0, 1, p.bench.front + 0.1))
    return this.plane.at(this.rig.camera, x, y - FEEL.lift, this.w, this.h)
  }

  pointerDown(x: number, y: number) {
    this.idle = 0
    this.pending = null
    const hit = this.tray.pick(x, y)
    if (hit && 'item' in hit) this.pending = { item: hit.item, x, y }
  }

  pointerMove(x: number, y: number, _dx: number, _dy: number, held: boolean) {
    if (!held) return
    this.idle = 0
    const pd = this.pending
    if (pd && !this.drag && Math.hypot(x - pd.x, y - pd.y) > 10) {
      this.drag = this.flyerOf(pd.item)
      this.pending = null
      this.counts.drags++
      cabinSfx.whoosh()
    }
    const d = this.drag
    if (!d) return
    const p = this.planeAt(x, y)
    if (!p) return
    d.obj.position.copy(p)
    d.obj.scale.setScalar(this.screenScale(d, p, 1.12))
    d.obj.quaternion.copy(this.rig.camera.quaternion)
    const f = this.friendAt(x, y, d.item.kind)
    this.hover = f && canWear(f.who, d.item.kind) ? f.who : null
  }

  pointerUp() {
    this.pending = null
    const d = this.drag
    this.drag = null
    this.hover = null
    if (!d) return
    this.drop(d)
  }

  /** Let go: onto a friend (or a silly place on them), or onto the floor. */
  private drop(d: Flyer) {
    const sx = toScreen(d.obj.position.clone(), this.rig.camera, this.w, this.h)
    const fx = sx.x
    const fy = sx.y + FEEL.lift
    const kind = d.item.kind
    const t = this.friendAt(fx, fy, kind)
    if (!t) return this.floor(d)
    const a = this.actorOf(t.who)!
    if (!canWear(t.who, kind)) {
      // Gus plays for the geese: a jersey (or a stamp) for him gets a honk, and back it goes.
      cabinSfx.honk()
      this.gus.shake()
      return this.home(d, 0.15)
    }
    if (t.part !== 'right') return this.perch(d, t.who, t.part)
    const to = wp(a, kind, new Vector3())
    cabinSfx.whoosh()
    this.flights.add(d.obj, d.obj.position, to, { dur: 0.2, arc: 0.08, scaleFrom: d.obj.scale.x, scaleTo: d.obj.scale.x * 0.6, then: () => this.land(d, t.who) })
  }

  private land(d: Flyer, who: TeamId) {
    d.obj.removeFromParent()
    this.wear(who, d.item.kind, d.item.id)
  }

  /** Dropped in a silly place on a friend: it sits there while they go cross-eyed at it, then hops where it goes. */
  private perch(d: Flyer, who: TeamId, part: 'head' | 'body' | 'antler') {
    const a = this.actorOf(who)!
    let at: Vector3
    if (part === 'antler' && a instanceof Friend) {
      const R = a.rig.face.R
      const side = d.obj.position.x < a.pos.x ? -1 : 1
      at = a.rig.head.localToWorld(new Vector3(side * 1.25 * R, a.rig.face.headY + 1.25 * R, 0.1 * R))
    } else at = wp(a, part === 'head' ? 'hat' : 'jersey', new Vector3()).add(new Vector3(0, part === 'head' ? 0.05 : 0, 0.08))
    this.counts.silly++
    this.last = `silly:${who}:${part}`
    cabinSfx.boing()
    this.flights.add(d.obj, d.obj.position, at, {
      dur: 0.18,
      arc: 0.05,
      scaleFrom: d.obj.scale.x,
      scaleTo: this.screenScale(d, at, 0.75),
      then: () => {
        a.silly('crossed', FEEL.perch + 0.2)
        cabinSfx.giggle()
        this.perching++
        this.timers.later(() => {
          this.perching--
          if (this.gone) return
          const to = wp(a, d.item.kind, new Vector3())
          cabinSfx.whoosh()
          this.flights.add(d.obj, d.obj.position, to, { dur: 0.32, arc: 0.35, scaleFrom: d.obj.scale.x, scaleTo: d.obj.scale.x * 0.7, then: () => this.land(d, who) })
        }, FEEL.perch * 1000)
      },
    })
  }

  /** Dropped on nobody: it plops on the floor with a boing, somebody giggles, and it hops back to its bin. */
  private floor(d: Flyer) {
    this.counts.floor++
    this.last = 'floor'
    const p = d.obj.position.clone()
    const ground = new Vector3(p.x, 0.1, Math.max(p.z, this.room.plan.bench.front + 0.45))
    this.flights.add(d.obj, p, ground, {
      dur: 0.3,
      arc: 0.05,
      then: () => {
        cabinSfx.boing()
        this.sparkle.burst(ground.x, 0.1, ground.z, 8, 0.8, 1.2, 0.05)
        // The nearest friend giggles at it.
        const near = [...this.seats].sort((a, b) => Math.abs(a.x - ground.x) - Math.abs(b.x - ground.x))[0]
        if (near) {
          near.actor.hop()
          near.actor.pull('happy')
          cabinSfx.giggle()
        }
        this.home(d, 0.35)
      },
    })
  }

  /** Back onto the shelf it goes (and vanishes into its bin). */
  private home(d: Flyer, delay: number) {
    this.timers.later(() => {
      if (this.gone) return
      const to = this.tray.worldOf(d.item, new Vector3())
      this.flights.add(d.obj, d.obj.position, to, { dur: 0.42, arc: 0.4, scaleFrom: d.obj.scale.x, scaleTo: d.base, then: () => d.obj.removeFromParent() })
    }, delay * 1000)
  }

  tap(x: number, y: number, id?: string) {
    this.idle = 0
    this.counts.taps++
    const hit = this.tray.pick(x, y)
    if (hit && 'bin' in hit) {
      if (this.tray.open !== hit.bin) {
        this.tray.setOpen(hit.bin)
        cabinSfx.lid()
        this.counts.binsOpened++
      }
      return
    }
    if (hit && 'item' in hit) return this.flyOn(hit.item)
    const what = id ?? this.thingAt(x, y)
    if (!what) return
    this.counts.pokes++
    if (what.startsWith('f:')) return this.pokeFriend(what.slice(2) as TeamId)
    if (what === 'gus') {
      if (this.gusAt.state !== 'in') return this.callGus()
      cabinSfx.honk()
      this.gus.wave()
      this.gus.pull('happy')
      this.gusAt.stay = Math.max(this.gusAt.stay, this.gusAt.t + 4)
      return
    }
    if (what === 'window') return this.callGus()
    if (what === 'mirror') return this.takePhoto()
    if (what === 'stove') {
      this.stoveT = 0
      cabinSfx.puff()
      const s = this.room.stove.position
      this.sparks.burst(s.x, s.y + 0.6, s.z + 0.4, 16, 0.6, 1.6, 0.04)
      return
    }
    if (what === 'lantern') {
      this.lanternV += 2.2
      cabinSfx.jingle()
      return
    }
    if (what === 'skates') {
      this.skateV += 3
      cabinSfx.jingle()
    }
  }

  /** A tapped thing flies onto the friend in focus. */
  private flyOn(item: TrayItem) {
    const who = canWear(this.focus, item.kind) ? this.focus : 'maple'
    const a = this.actorOf(who)
    if (!a) return
    const f = this.flyerOf(item)
    const to = wp(a, item.kind, new Vector3())
    cabinSfx.whoosh()
    item.wiggle = 0.4
    this.flights.add(f.obj, f.obj.position, to, { dur: FEEL.fly, arc: FEEL.arc, scaleFrom: f.base, scaleTo: this.screenScale(f, to, 0.6), spin: item.kind === 'hat' ? Math.PI * 2 : 0, then: () => this.land(f, who) })
  }

  private pokeFriend(who: TeamId) {
    const s = this.seat(who)
    if (!s) return
    this.setFocus(who)
    const a = s.actor
    a.wave()
    a.pull('happy')
    cabinSfx.giggle()
    if (who === 'lulu') {
      cabinSfx.loon()
      ;(a as Lulu).calling = 1
      this.timers.later(() => ((a as Lulu).calling = 0), 700)
    }
    if (who === 'tuque') (a as Tuque).boing()
  }

  /** What's under a screen point that has no tap target (a fallback for the anchors). */
  private thingAt(x: number, y: number): string | null {
    for (const s of this.seats) {
      const b = this.screenBox(s.actor, s.who)
      if (x > b.x0 && x < b.x1 && y > b.y0 && y < b.y1) return `f:${s.who}`
    }
    this.ray.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    const hits = this.ray.intersectObjects([this.room.mirror, this.room.stove, this.room.lantern, this.room.skates], true)
    for (const h of hits) {
      for (let o: Object3D | null = h.object; o; o = o.parent) {
        if (o === this.room.mirror) return 'mirror'
        if (o === this.room.stove) return 'stove'
        if (o === this.room.lantern) return 'lantern'
        if (o === this.room.skates) return 'skates'
      }
    }
    return null
  }

  // ---------------------------------------------------------------- the team photo

  private takePhoto() {
    if (this.photoT >= 0) return
    this.photoT = 0
    this.counts.photos++
    this.last = 'photo'
    void say(L.cabin.photo, { interrupt: false })
    const m = this.room.mirror.position
    this.sparkle.burst(m.x, m.y + 0.4, m.z + 0.2, 18, 0.9, 1.2, 0.05)
    for (const s of this.seats) {
      s.actor.pull('happy')
      s.actor.headTurn = 0
    }
  }

  private snap() {
    const p = this.room.plan
    const row = this.seats.filter((s) => s.row === 0)
    const half = Math.max(1.4, ...row.map((s) => Math.abs(s.x) + WIDTH[s.who] / 2)) + 0.2
    const tall = p.back && this.seats.some((s) => s.row === 1)
    // From the bench seat up to the tallest head (and the back row's, on a tall screen).
    const span = tall ? 2.3 : 1.65
    const mid = p.bench.y + span / 2 - 0.05
    const fov = 36
    const t = Math.tan((fov * Math.PI) / 360)
    const dist = Math.max(half / (t * (4 / 3)), span / 2 / t) + 0.5
    const cam = photoCamera(fov, 0, mid + 0.25, p.bench.front + dist, 0, mid, p.bench.front - 0.45)
    this.tray.group.visible = false
    this.ring.visible = false
    const url = snapPhoto(this.renderer, this.scene, cam)
    this.tray.group.visible = true
    this.ring.visible = true
    this.pin(url)
    this.events.photo(url)
  }

  /** The photo, pinned on the wall by the mirror (the three newest). */
  private pin(url: string) {
    const slots = this.room.pins
    if (this.photos.length >= slots.length) this.photos.shift()?.removeFromParent()
    const at = slots[this.photos.length]
    const g = new Group()
    const tex = this.bag.add(new TextureLoader().load(url))
    tex.colorSpace = SRGBColorSpace
    const pic = new Mesh(this.bag.add(new PlaneGeometry(0.48, 0.36)), this.bag.add(new MeshBasicMaterial({ map: tex })))
    pic.position.set(0, 0.04, 0.012)
    g.add(solid(merge([P.rbox(0.56, 0.52, 0.02, 0.01, '#FFFFFF')]), this.bag, 1.4), pic, solid(P.sphere(0.035, '#FF5C9A', { at: [0, 0.24, 0.02] }), this.bag, 1.2))
    g.position.set(...at)
    g.rotation.z = (Math.random() - 0.5) * 0.2
    g.scale.setScalar(0.01)
    g.userData.popT = 0
    this.room.root.add(g)
    this.photos.push(g)
  }

  // ---------------------------------------------------------------- World3D

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.top = top
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
    // (The rig widens its view up under the top bar; the cabin frames itself below it instead.)
    this.rig.camera.clearViewOffset()
    this.rig.camera.fov = FOV
    this.rig.camera.aspect = w / h
    this.rig.camera.updateProjectionMatrix()
    const sparkleW = Math.min(120, h * 0.16, w * 0.24) + 14
    this.tray.layout(w, h, this.rig.camera, sparkleW, 6)
    // (Two rows only on a tall screen with more than four on the bench: four fit in one row anywhere.)
    const want: Layout = h > w * 1.05 && this.seats.length > this.frontMax ? 'tall' : 'wide'
    if (want !== this.layoutNow || this.narrow !== (want === 'wide' && h > w * 1.05) || this.fronted !== this.frontMax) this.arrange(want)
    else this.frame()
  }
  setAnchorElements(els: Map<string, HTMLElement>) {
    this.anchorEls = els
  }
  setHintElement(el: HTMLElement | null) {
    this.hintEl = el
  }
  get calm() {
    return false
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.idle += dt
    this.flights.update(dt)
    this.tray.update(dt, t)
    this.sparkle.update(dt)
    this.sparks.update(dt)
    this.updateGus(dt, t)
    // Everybody watches what she carries.
    const d = this.drag
    for (const s of this.seats) {
      const a = s.actor
      if (d) {
        const dx = d.obj.position.x - a.pos.x
        const dz = d.obj.position.z - a.pos.z
        a.headTurn += (clamp(Math.atan2(dx, Math.max(0.3, dz)) - a.root.rotation.y, -0.7, 0.7) - a.headTurn) * Math.min(1, dt * 6)
      } else a.headTurn += ((this.photoT >= 0 ? 0 : Math.sin(t * 0.4 + s.x) * 0.12) - a.headTurn) * Math.min(1, dt * 3)
      a.armsUp += ((this.hover === s.who ? 0.35 : this.photoT >= 0 && this.photoT < 2.6 ? 0.7 : 0) - a.armsUp) * Math.min(1, dt * 6)
      a.update(dt, t)
    }
    this.gus.update(dt, t)
    // Pop the new things on with a squash.
    for (const a of this.popping) {
      let busy = false
      a.root.traverse((o) => {
        if (o.userData.popT === undefined) return
        o.userData.popT += dt / 0.35
        const k = Math.min(1, o.userData.popT)
        const s = 1 + Math.sin(k * Math.PI) * 0.22 * (1 - k)
        if (!o.userData.base) o.userData.base = o.scale.clone()
        o.scale.copy(o.userData.base).multiplyScalar(k < 0.25 ? 0.4 + k * 2.4 : s)
        if (k >= 1) {
          o.scale.copy(o.userData.base)
          delete o.userData.popT
          delete o.userData.base
        } else busy = true
      })
      if (!busy) this.popping = this.popping.filter((p) => p !== a)
    }
    // The focus ring, under whoever a tapped thing will fly to (or the friend she's carrying something to).
    const ringWho = this.hover ?? this.focus
    const ra = ringWho === 'gus' ? null : this.actorOf(ringWho)
    this.ring.visible = !!ra && this.photoT < 0
    if (ra) {
      const s = this.seat(ringWho)!
      const H = ra.height
      // (Round them on the seat.)
      this.ring.position.set(ra.pos.x, s.seatY + 0.012, ra.pos.z + (ringWho === 'lulu' ? 0.1 * H : 0.04 * H))
      this.ring.scale.setScalar(Math.min(0.62, 0.3 * H) * (1 + Math.sin(t * 4) * 0.05) * (this.hover ? 1.15 : 1))
    }
    // The photo: everyone cheers for the camera, then click.
    if (this.photoT >= 0) {
      const before = this.photoT
      this.photoT += dt
      if (before < 2.1 && this.photoT >= 2.1) {
        cabinSfx.shutter()
        this.events.flash()
        this.snap()
      }
      if (this.photoT > 3.2) this.photoT = -1
    }
    for (const g of this.photos) {
      if (g.userData.popT === undefined) continue
      g.userData.popT = Math.min(1, g.userData.popT + dt / 0.5)
      const k = g.userData.popT
      g.scale.setScalar(Math.max(0.01, k < 0.7 ? (k / 0.7) * 1.12 : 1.12 - 0.12 * ((k - 0.7) / 0.3)))
      if (k >= 1) delete g.userData.popT
    }
    // The room's life: the stove's flames, the lantern and the skates swinging, snow outside.
    const flick = 1 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7.3) * 0.06
    let puff = 1
    if (this.stoveT >= 0) {
      this.stoveT += dt
      puff = 1 + 0.9 * Math.max(0, 1 - this.stoveT / 0.8)
      if (this.stoveT > 0.8) this.stoveT = -1
    }
    this.room.flames.scale.set(flick * puff, flick * puff * (1 + Math.sin(t * 9) * 0.1), 1)
    this.lanternV += (-this.room.lantern.rotation.z * 18 - this.lanternV * 1.6) * dt
    this.room.lantern.rotation.z += this.lanternV * dt
    this.skateV += (-this.room.skates.rotation.z * 30 - this.skateV * 2.2) * dt
    this.room.skates.rotation.z += this.skateV * dt
    this.snowfall(dt)
    // Stuck a while: Sparkle says it again, and a hand shows the way.
    if (this.idle > HINT_S && !this.drag && !this.flights.busy && this.photoT < 0) {
      this.idle = 0
      this.hints++
      this.events.hint()
      const it = this.tray.items[0]
      if (it) it.wiggle = 1.6
      this.showHint(1.8)
    }
    this.updateHint(dt)
  }

  private hintT = -1
  private showHint(seconds: number) {
    this.hintT = seconds
  }
  private updateHint(dt: number) {
    const el = this.hintEl
    if (!el) return
    if (this.hintT > 0) this.hintT -= dt
    const on = this.hintT > 0
    if (el.style.display !== (on ? '' : 'none')) el.style.display = on ? '' : 'none'
    if (!on) return
    const it = this.tray.items[0]
    const a = this.actorOf(this.focus)
    if (!it || !a) return
    const to = toScreen(wp(a, it.kind, tmp), this.rig.camera, this.w, this.h)
    el.style.transform = `translate3d(${it.slot.x.toFixed(0)}px, ${it.slot.y.toFixed(0)}px, 0)`
    el.style.setProperty('--dx', `${(to.x - it.slot.x).toFixed(0)}px`)
    el.style.setProperty('--dy', `${(to.y - it.slot.y).toFixed(0)}px`)
  }

  private snowfall(dt: number) {
    const snow = this.room.snow
    const base = snow.userData.base as Vector3[]
    const win = this.room.plan.window
    const m = new Group()
    for (let i = 0; i < snow.count; i++) {
      const b = base[i]
      b.y = (b.y + dt * (0.12 + (i % 5) * 0.02)) % 1
      m.position.set(b.x + Math.sin(this.time * 0.8 + i) * 0.06, win.y + win.hh * 1.5 - b.y * win.hh * 3, b.z)
      m.updateMatrix()
      snow.setMatrixAt(i, m.matrix)
    }
    snow.instanceMatrix.needsUpdate = true
  }

  render() {
    this.renderer.render(this.scene, this.rig.camera)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const trayTop = this.tray.top
    const put = (el: HTMLElement, box: { x0: number; x1: number; y0: number; y1: number } | null) => {
      let show = !!box
      if (box) {
        const cx = (box.x0 + box.x1) / 2
        const cy = (box.y0 + box.y1) / 2
        const w = Math.max(min, box.x1 - box.x0)
        const h = Math.max(min, Math.min(box.y1 - box.y0, trayTop - 4 - (cy - Math.max(min, box.y1 - box.y0) / 2)))
        show = cy < trayTop - 10
        if (show) {
          el.style.transform = `translate3d(${(cx - w / 2).toFixed(1)}px, ${(cy - h / 2).toFixed(1)}px, 0)`
          el.style.width = `${w.toFixed(0)}px`
          el.style.height = `${h.toFixed(0)}px`
        }
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
    const boxOf = (o: Object3D, pad = 0) => {
      const b = new Box3().setFromObject(o)
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
      for (const px of [b.min.x, b.max.x]) for (const py of [b.min.y, b.max.y]) for (const pz of [b.min.z, b.max.z]) {
        const s = toScreen(tmp.set(px, py, pz), this.rig.camera, this.w, this.h)
        x0 = Math.min(x0, s.x)
        x1 = Math.max(x1, s.x)
        y0 = Math.min(y0, s.y)
        y1 = Math.max(y1, s.y)
      }
      return { x0: x0 - pad, x1: x1 + pad, y0: y0 - pad, y1: y1 + pad }
    }
    for (const [id, el] of this.anchorEls) {
      if (id.startsWith('f:')) {
        const s = this.seat(id.slice(2) as TeamId)
        put(el, s ? this.screenBox(s.actor, s.who) : null)
      } else if (id === 'gus') put(el, this.gusAt.state === 'in' ? boxOf(this.gus.root) : null)
      else if (id === 'window') {
        const win = this.room.plan.window
        const c = toScreen(tmp.set(win.x, win.y, this.room.plan.wallZ), this.rig.camera, this.w, this.h)
        const e = toScreen(tmp2.set(win.x + win.hw, win.y + win.hh, this.room.plan.wallZ), this.rig.camera, this.w, this.h)
        put(el, this.gusAt.state === 'in' ? null : { x0: c.x - (e.x - c.x), x1: e.x, y0: e.y, y1: c.y + (c.y - e.y) })
      } else if (id === 'mirror') put(el, boxOf(this.room.mirror))
      else if (id === 'stove') put(el, boxOf(this.room.stove, 0))
      else if (id === 'lantern') put(el, boxOf(this.room.lantern))
      else if (id === 'skates') put(el, boxOf(this.room.skates))
      el.style.zIndex = id.startsWith('f:') ? '3' : id === 'gus' ? '4' : '1'
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const r = (n: number) => Math.round(n)
    const cam = this.rig.camera
    const scr = (v: Vector3) => (({ x, y }) => ({ x: r(x), y: r(y) }))(toScreen(v, cam, this.w, this.h))
    return {
      layout: this.layoutNow,
      open: this.tray.open,
      focus: this.focus,
      friends: this.seats.map((s) => {
        const b = this.screenBox(s.actor, s.who)
        return { who: s.who, row: s.row, box: { x0: r(b.x0), x1: r(b.x1), y0: r(b.y0), y1: r(b.y1) }, hat: scr(wp(s.actor, 'hat', new Vector3())), chest: scr(wp(s.actor, 'jersey', new Vector3())), worn: wornBy(s.who) }
      }),
      items: this.tray.items.map((it) => ({ kind: it.kind, id: it.id, x: r(it.slot.x), y: r(it.slot.y), size: r(it.slot.size) })),
      bins: this.tray.bins_(),
      trayTop: r(this.tray.top),
      gus: { state: this.gusAt.state, worn: wornBy('gus'), at: this.gusAt.state === 'in' ? scr(this.gus.head(new Vector3())) : null },
      window: scr(new Vector3(this.room.plan.window.x, this.room.plan.window.y, this.room.plan.wallZ)),
      mirror: scr(this.room.mirror.getWorldPosition(new Vector3())),
      dragging: !!this.drag,
      flying: this.flights.busy || this.perching > 0,
      photo: this.photoT >= 0,
      pinned: this.photos.length,
      hints: this.hints,
      last: this.last,
      ...this.counts,
    }
  }

  memory() {
    return { ...this.renderer.info.memory }
  }

  dispose() {
    this.gone = true
    this.timers.dispose()
    this.flights.clear()
    this.scene.clear()
    this.bag.dispose()
  }
}

/** A rig friend's legs as they sit: two stubby legs straight out from the hips along the seat, the feet up at the end
 *  with a pad on each sole (the rig builds legs standing; those stay hidden inside the bench). For `rig.body`. */
function sitLegs(f: Friend, bag: Bag) {
  const look = f.look
  const H = f.height
  const c = look.chub ?? 1
  const x = 0.085 * H * (1 + (c - 1) * 0.7)
  const r = 0.064 * H * (1 + (c - 1) * 0.6)
  const dark = look.species === 'bear' || look.species === 'moose' || look.species === 'raccoon'
  const foot = dark ? look.dark : look.light
  const lined: ReturnType<typeof P.box>[] = []
  const plain: ReturnType<typeof P.box>[] = []
  for (const s of [-1, 1]) {
    lined.push(P.capsule(r, 0.15 * H, look.fur, { at: [s * x, 0.165 * H, 0.15 * H], rot: [Math.PI / 2, 0, 0] }))
    lined.push(P.sphere(0.074 * H * (1 + (c - 1) * 0.6), foot, { at: [s * x, 0.19 * H, 0.325 * H], scale: [1, 1.28, 0.62] }))
    plain.push(P.sphere(0.034 * H, look.species === 'moose' ? look.light : '#FFC9D6', { at: [s * x, 0.18 * H, 0.37 * H], scale: [1.1, 1.2, 0.3] }))
  }
  return solidMix(lined, plain, bag, 2)
}

// Animal Bridge (plan: planning/around-the-world/canada.html): the green wildlife bridge over the Trans-Canada
// Highway in Banff in summer, seen straight down the road like a theater stage. One verb, lead the herd: her finger
// leads a family's mama and the rest follow in a wobbly line (herd.ts), up the forest bank, over the bridge while the
// cars and trucks zoom under it, and down into the meadow where Maple the beaver watches and cheers. It gets richer three
// times:
//   elk     Mama elk and her three spotted calves. On the way the littlest calf stops to sniff a flower and she has to
//           fetch it (lead it over by itself). Into the meadow, and they munch.
//   sheep   The bighorn sheep: the big ram leads, over the boulders by the fence if she likes (the rocky way: they hop
//           up it, the elk and bears slow down there) or round them (the grassy way). In the middle of the bridge the
//           two rams bonk heads.
//   bears   Mama grizzly won't step on a bare bridge: she sniffs at it and sits down. Now the others carry seeds (in
//           their fur): every one she leads over the bridge, either way, makes grass, then bushes, then berries grow
//           behind it. Once it looks like the forest, the bears follow her over.
//   album   Everyone in the meadow, and the wildlife camera's photos of each family on the bridge; then the stamp.
// The bare link opens with Maple's story line (`story`). Any family can go next (she leads whichever she touches); a
// finger anywhere else leads the family she led last. Always there: cars and trucks zooming under the bridge (tap:
// honk), the wildlife camera (tap: click, flash), a bald eagle circling, a wolf peeking out of his bush, a mountain goat
// on a ledge, an elk walking down Banff's street, the fence (it rattles; dragged toward the highway, mama stops there,
// looks at her and shakes her head), Maple (a giggle). The animals are live SVG puppets (critters.tsx); the scenery is
// painted sprites (assets/bridge-*.webp) placed on the stage. How mama follows her finger and how the line follows mama
// are knobs (herd.ts), with the planting and the highway's here (?feel=1). 2D only: one SVG written every frame.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { BigButton, bigCelebration, burst, lineText, say as speak, sounds, speechLevel, spendHint, useElementSize, type Line, type PuppetHandle } from '../../../../../sdk'
import { knobs, watch } from '../../../../kit/knobs'
import { useSections } from '../../../../kit/sections'
import { sfx } from '../../../../kit/sfx'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { meet } from '../../book/met'
import type { AnimalId } from '../../book/animals'
import { L } from '../../lines'
import { Maple } from '../../puppets/Maple'
import type { CanadaActivityProps } from '../props'
import { ART, type Pic } from './art'
import { collect, Critter, CritterLife, INK, poseCritter, put, type CritterEls } from './critters'
import { FOLLOW, Herd, LEAD, type Family, type Member } from './herd'
import { noises } from './noises'
import BRIDGE_SECTIONS, { type BridgeSection } from './sections'
import { EMOJI, FAMILIES, FENCE_GAP, LOOKS, MEMBERS, TALL, WIDE, deckEnds, depth, halfCut, inMeadow, lift, mountainsBox, onBridge, onDeck, rng, type FamilyId, type Kind, type Pt, type StageDef } from './stage'

const FILE = 'src/world/places/canada/activities/bridge/AnimalBridge.tsx'
const PLANT = knobs('bridgePlant', 'Planting the bridge (for the bears)', FILE, {
  grow: { value: 0.25, min: 0.05, max: 1.5, step: 0.01, label: 'Each animal grows', note: 'how much each animal carrying seeds grows the spot of the bridge it walks over (1 = a whole step: grass, then a bush, then berries)' },
  need: { value: 0.6, min: 0.1, max: 1, step: 0.05, label: 'Green enough for the bears', note: 'how much of the bridge has to grow before mama grizzly steps on it' },
})
const ROAD = knobs('bridgeRoad', 'The highway and the hints', FILE, {
  every: { value: 2.2, min: 0.5, max: 8, step: 0.1, label: 'A car every', unit: 's' },
  speed: { value: 0.3, min: 0.08, max: 1, step: 0.02, label: 'Car speed', note: 'how much of the road a car drives in a second' },
  help: { value: 8, min: 3, max: 30, step: 1, label: 'Hint after', unit: 's', note: 'a hand shows the way after this long without her leading' },
})

/** The play sections (Maple's story comes before them). */
type Part = Exclude<BridgeSection, 'story'>
const B = L.bridge
/** Sparkle's line when a family's turn begins (the photos: Maple). */
const SAY: Record<Part, Line> = { elk: B.lead.elk, sheep: B.lead.sheep, bears: B.lead.bears, album: B.album }
/** Each family's page in Maple's animal book. */
const ANIMAL: Record<FamilyId, AnimalId> = { elk: 'elk', sheep: 'bighorn', bears: 'grizzly' }
/** The mamas who talk (their mouths open with their voices). */
const VOICE: Partial<Record<FamilyId, string>> = { elk: 'elk', bears: 'bear' }
/** Who is already across at the start of each section (`?crossed=` overrides). */
const START_CROSSED: Record<Part, FamilyId[]> = { elk: [], sheep: ['elk'], bears: ['elk', 'sheep'], album: ['elk', 'sheep', 'bears'] }

function parseCrossed(v: string, section: Part): FamilyId[] {
  if (v === '') return START_CROSSED[section]
  if (v === 'none') return []
  const ids = new Set(v.split(','))
  return FAMILIES.filter((id) => ids.has(id))
}
/** The shortest `?crossed=` for these families: empty for the section's own start, `none` for nobody (an empty value
 *  would read as the section's start), else the list. */
const crossedParam = (ids: FamilyId[], section: Part) =>
  ids.length === START_CROSSED[section].length && ids.every((id) => START_CROSSED[section].includes(id)) ? '' : ids.length ? FAMILIES.filter((id) => ids.includes(id)).join(',') : 'none'
const greenParam = (g: number) => (g < 0.05 ? '' : String(Math.round(g * 10) / 10))
/** The section for this moment: the family she leads (or leads next), or the photos once everyone is across. */
function sectionOf(lead: FamilyId | null, crossed: FamilyId[]): Part {
  if (crossed.length === FAMILIES.length) return 'album'
  if (lead && !crossed.includes(lead)) return lead
  return FAMILIES.find((id) => !crossed.includes(id))!
}

const N_CELLS = 12
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
const bell = (p: number) => (p <= 0 || p >= 1 ? 0 : Math.sin(p * Math.PI))
const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by)

// ---------------------------------------------------------------- the runtime (plain objects, written every frame)

type AnimKind = 'hop' | 'shake' | 'sniff' | 'munch' | 'sit' | 'bonk'
interface Anim {
  kind: AnimKind
  t0: number
  dur: number
}
interface Car {
  el: SVGGElement
  /** The car's and the truck's sprites, seen from the front (coming at us) and the back (driving away). */
  looks: Record<'car-front' | 'car-back' | 'truck-front' | 'truck-back', SVGElement>
  /** A glow over its lights when it honks. */
  glow: SVGElement
  on: boolean
  s: number
  dir: 1 | -1
  truck: boolean
  honk: number
  zoomed: boolean
}
/** A photo: each animal's kind, place (from mama) and which way it faced. */
export interface Snapshot {
  fam: FamilyId
  pts: [Kind, number, number, 1 | -1][]
}

interface Info {
  section: Part
  crossed: FamilyId[]
  green: number
  seeds: boolean
}
interface Events {
  info: (i: Info) => void
  /** Speak a line (and show its words for Dad). `queue` waits for the line playing now (a book card's) to finish.
   *  `voice` false: only show the words (a hint the budget in sdk/hints.ts keeps quiet). */
  say: (line: Line, queue: boolean, voice?: boolean) => void
  album: (photos: Snapshot[]) => void
  /** Maple in the meadow: an action. */
  maple: (action: 'cheer' | 'hop' | 'wave' | 'wiggle' | 'slap') => void
  /** Every family is across and the album has played: the payoff is over. */
  done: () => void
}

class BridgeWorld {
  st: StageDef
  herd: Herd
  lead: FamilyId | null
  crossed: FamilyId[]
  section: Part
  now = 0
  lastTouch = 0
  /** Her finger, and the family it leads (fixed while it's down, so a family arriving doesn't hand her drag to the next). */
  finger: { id: number; x: number; y: number; sx: number; sy: number; t0: number; moved: number; who: Member | null; poke: boolean; fam: FamilyId | null; lost: Member | null } | null = null
  /** Waypoints for a family walking by itself (over the bridge to the meadow for the photos). */
  routes = new Map<FamilyId, Pt[]>()
  vb = { x: 0, y: 0, w: 1600, h: 1000 }
  els: Record<string, Element | null> = {}
  ael = new Map<Member, CritterEls>()
  life = new Map<Member, CritterLife>()
  anims = new Map<Member, Anim>()
  order: Member[] = []
  cells: number[] = new Array(N_CELLS).fill(0)
  cellEls: { g: SVGGElement; grass: Element; bush: Element; berry: Element; pop: number }[] = []
  lastCell = new Map<Member, number>()
  seedsOn = false
  photos = new Map<FamilyId, Snapshot>()
  lastFlash: Record<FamilyId, number> = { elk: -99, sheep: -99, bears: -99 }
  bonked: Record<FamilyId, boolean> = { elk: false, sheep: false, bears: false }
  bonk: { t0: number; a: Member; b: Member; x: number; y: number } | null = null
  flashAt = -9
  cars: Car[] = []
  nextCar = 0.4
  eagle = { dive: -9 }
  wolf = { up: 0, next: 9, until: -9, howl: -9, rustle: -9 }
  goat = { at: 0, from: 0, t0: -9 }
  townElk = { x: 0, dir: 1, stop: -9 }
  clouds: { el: SVGGElement; x: number; y: number; v: number }[] = []
  seedDots: { el: SVGCircleElement; x: number; y: number; t: number }[] = []
  graze = 3
  albumAt = -1
  readyAt = -9
  sayAt = -9
  lastSay = ''
  sentGreen = -1
  /** Lines said once a run, and when a book card last popped (lines after it wait their turn). */
  once = new Set<string>()
  metAt = -9
  /** The littlest calf that stops to sniff a flower (once a run, on the elk's first crossing). */
  strayed = false
  strayAt = -9
  fetched = false
  flower: Pt | null = null
  /** The hint's spoken line, at most once per stuck spell. */
  hintSaid = false
  r: () => number
  /** Set when the scene goes away (a new run, or React trying the effect twice): its timers do nothing then. */
  dead = false
  private later(f: () => void, ms: number) {
    setTimeout(() => !this.dead && f(), ms)
  }

  constructor(
    private svg: SVGSVGElement,
    stage: StageDef,
    section: Part,
    crossed: FamilyId[],
    green: number,
    seed: number,
    private ev: Events,
  ) {
    this.st = stage
    this.section = section
    this.crossed = [...crossed]
    this.r = rng(seed)
    const spots = {} as Record<FamilyId, Pt[]>
    for (const id of FAMILIES) spots[id] = crossed.includes(id) ? stage.meadow[id] : stage.wait[id]
    this.herd = new Herd(stage, spots)
    // Across already: they face back toward the forest, grazing.
    for (const id of crossed) for (const m of this.herd.fams[id].m) m.dir = -1
    const s0 = sectionOf(section === 'album' ? null : section, crossed)
    this.lead = s0 === 'album' ? null : s0
    const q = <T extends Element>(k: string) => svg.querySelector(`[data-k="${k}"]`) as T | null
    const qa = <T extends Element>(k: string) => [...svg.querySelectorAll(`[data-k="${k}"]`)] as T[]
    for (const k of ['animals', 'deck-green', 'deck-trees', 'camera', 'lamp', 'flash', 'stars', 'hint', 'hint-path', 'hint-hand', 'eagle', 'eagle-wings', 'wolf', 'goat', 'town-elk', 'town-car', 'flower', 'bush']) this.els[k] = q(k)
    this.herd.all().forEach((m, i) => {
      this.ael.set(m, collect(q<SVGGElement>(`a-${m.fam}-${m.i}`)!))
      const life = new CritterLife(i * 5 + 3)
      life.face = m.dir
      this.life.set(m, life)
    })
    for (const g of qa<SVGGElement>('cell'))
      this.cellEls.push({ g, grass: g.querySelector('[data-k="grass"]')!, bush: g.querySelector('[data-k="bush"]')!, berry: g.querySelector('[data-k="berry"]')!, pop: -9 })
    for (const el of qa<SVGGElement>('car')) {
      const look = (k: string) => el.querySelector<SVGElement>(`[data-k="${k}"]`)!
      this.cars.push({ el, looks: { 'car-front': look('car-front'), 'car-back': look('car-back'), 'truck-front': look('truck-front'), 'truck-back': look('truck-back') }, glow: look('car-glow'), on: false, s: 0, dir: 1, truck: false, honk: -9, zoomed: false })
    }
    for (const el of qa<SVGGElement>('cloud')) this.clouds.push({ el, x: +(el.dataset.x ?? 0), y: +(el.dataset.y ?? 0), v: 6 + this.r() * 8 })
    for (const el of qa<SVGCircleElement>('seed')) this.seedDots.push({ el, x: 0, y: 0, t: 9 })
    // The bridge as planted as the link says (the bears' section can start green).
    const g = clamp(green, 0, 1)
    if (g > 0) {
      this.cells.fill(g * 3)
      this.seedsOn = true
    }
    this.herd.fams.bears.shy = !crossed.includes('bears') && this.green() < PLANT.need
    this.townElk.x = stage.town.x + stage.town.w * 0.3
    this.wolf.next = 6 + this.r() * 8
    // Album: the photos are there already when a link opens it.
    for (const id of crossed) this.photos.set(id, this.posed(id))
    if (section === 'album') this.albumAt = 0.9
    this.later(() => this.info(), 0)
  }

  // -------------------------------------------------------------- state

  green() {
    return this.cells.reduce((s, c) => s + Math.min(3, c), 0) / (3 * N_CELLS)
  }

  info() {
    const section = sectionOf(this.lead, this.crossed)
    this.section = section
    this.ev.info({ section, crossed: [...this.crossed], green: this.green(), seeds: this.seedsOn })
  }

  private say(line: Line, minGap = 0, voice = true) {
    const text = lineText(line)
    if (text === this.lastSay && this.now - this.sayAt < minGap) return
    this.lastSay = text
    this.sayAt = this.now
    // Right after a book card pops up, Sparkle is naming the animal: wait for her.
    this.ev.say(line, this.now - this.metAt < 3, voice)
  }
  /** Say it only the first time this run. */
  private sayOnce(key: string, line: Line) {
    if (this.once.has(key)) return
    this.once.add(key)
    this.say(line)
  }
  /** She touched this animal: its page in Maple's book (the card pops up the first time). */
  private met(id: AnimalId) {
    if (meet(id)) this.metAt = this.now
  }

  private album() {
    return this.crossed.map((id) => this.photos.get(id) ?? this.posed(id))
  }

  /** A made-up photo of a family on the bridge (for a link that starts after they crossed). */
  private posed(id: FamilyId): Snapshot {
    return { fam: id, pts: MEMBERS[id].map((kind, i) => [kind, -i * FOLLOW.gap * 0.9, (i % 2) * 10, 1]) }
  }

  setVb(vb: { x: number; y: number; w: number; h: number }) {
    this.vb = vb
    this.herd.x0 = Math.max(vb.x + 50, -400)
    this.herd.x1 = Math.min(vb.x + vb.w - 50, this.st.w + 400)
  }

  // -------------------------------------------------------------- her finger

  toStage(e: { clientX: number; clientY: number }): Pt {
    const m = this.svg.getScreenCTM()
    if (!m) return [0, 0]
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    return [p.x, p.y]
  }

  /** Mama's feet go here for a finger at (x, y): her body just above the fingertip. */
  private aim(x: number, y: number): Pt {
    return [x, y + 40 - LEAD.lift]
  }

  down(e: RPointerEvent) {
    if (this.finger) return
    const [x, y] = this.toStage(e)
    this.lastTouch = this.now
    const f = { id: e.pointerId, x, y, sx: e.clientX, sy: e.clientY, t0: this.now, moved: 0, who: null as Member | null, poke: false, fam: this.lead, lost: null as Member | null }
    this.finger = f
    this.hintSaid = false
    // Things to poke come first (they don't lead anyone).
    if (this.pokeAt(x, y)) {
      f.poke = true
      return
    }
    const hit = this.herd.near(x, y, LEAD.grab)
    // The calf sniffing its flower: her finger leads it by itself, back to its family.
    if (hit?.a.lost) {
      f.who = hit.a
      f.fam = null
      f.lost = hit.a
      hit.a.lostTo = this.aim(x, y)
      this.fetched = true
      this.play(hit.a, 'hop', 0.45)
      noises.call('calf')
      this.met('elk')
      return
    }
    if (hit) {
      f.who = hit.a
      f.fam = hit.f.id
      this.pick(hit.f.id)
      return
    }
    // The sky: nothing to lead there.
    if (y < this.st.back - 20 || !this.lead) {
      f.poke = true
      return
    }
    this.lead_(this.lead, x, y)
  }

  private lead_(id: FamilyId, x: number, y: number) {
    const fam = this.herd.fams[id]
    fam.target = this.aim(x, y)
    fam.auto = false
    this.routes.delete(id)
  }

  move(e: RPointerEvent) {
    const f = this.finger
    if (!f || f.id !== e.pointerId) return
    const [x, y] = this.toStage(e)
    f.moved = Math.max(f.moved, Math.hypot(e.clientX - f.sx, e.clientY - f.sy))
    f.x = x
    f.y = y
    this.lastTouch = this.now
    if (f.lost) {
      if (f.moved >= 12 && f.lost.lost) f.lost.lostTo = this.aim(x, y)
      return
    }
    if (f.poke || !f.fam) return
    if (f.who && f.moved < 12) return
    this.lead_(f.fam, x, y)
  }

  up(e: RPointerEvent) {
    const f = this.finger
    if (!f || f.id !== e.pointerId) return
    this.finger = null
    this.lastTouch = this.now
    if (f.lost) f.lost.lostTo = null
    const tap = f.moved < 12 && this.now - f.t0 < 0.45
    if (!tap || f.poke) return
    if (f.who && !f.lost) this.pokeAnimal(f.who)
    else if (!f.who && this.nearFence(f.x, f.y)) {
      noises.rattle()
      this.sayOnce('fenceTap', B.fenceTap)
    }
  }

  /** Lead this family from now on. */
  private pick(id: FamilyId) {
    if (this.lead === id) return
    if (this.lead) {
      const old = this.herd.fams[this.lead]
      old.target = null
    }
    this.lead = id
    const f = this.herd.fams[id]
    f.auto = false
    sounds.pickup()
    this.play(f.m[0], 'hop', 0.45)
    this.met(ANIMAL[id])
    const before = this.section
    this.info()
    if (this.section !== before && this.section !== 'album') this.say(SAY[this.section])
    else if (id === 'elk') this.sayOnce('elkGo', B.elkGo)
  }

  private nearFence(x: number, y: number) {
    if (y < this.st.back || onDeck(this.st, y)) return false
    return Math.abs(Math.abs(x - this.st.road.x) - halfCut(this.st, y)) < 36
  }

  // -------------------------------------------------------------- pokes

  private pokeAt(x: number, y: number) {
    const st = this.st
    // The wildlife camera.
    const [cx, cy] = st.camera
    if (dist(x, y, cx, cy - 100) < 80) {
      this.snap(true)
      return true
    }
    // A car or truck.
    for (const c of this.cars) {
      if (!c.on) continue
      const { x: px, y: py, sz } = this.carAt(c)
      if (onDeck(st, py) || (py > st.deck[1] && py < st.deck[1] + 44)) continue
      if (Math.abs(x - px) < 60 * sz && y < py + 6 && y > py - (c.truck ? 110 : 70) * sz) {
        c.honk = this.now
        noises.honk(c.truck)
        return true
      }
    }
    // The eagle.
    const ea = this.eaglePos()
    if (dist(x, y, ea[0], ea[1]) < 100) {
      this.eagle.dive = this.now
      noises.screech()
      this.met('bald-eagle')
      return true
    }
    // The wolf (peeking or not: a tap on his bush brings him out).
    const [wx, wy] = st.wolf
    const onWolf = this.wolf.up > 0.5 && dist(x, y, wx, wy - 150) < 90
    if (onWolf || dist(x, y, wx, wy - 40) < 100) {
      if (onWolf) {
        this.wolf.howl = this.now
        noises.howl()
        this.met('wolf')
      } else {
        // His bush rustles, and out he peeks.
        sfx.fwip()
        this.wolf.next = this.now
        this.wolf.rustle = this.now
      }
      return true
    }
    // The mountain goat.
    const gp = this.goatPos()
    if (dist(x, y, gp[0], gp[1] - 20) < 70) {
      this.goat.from = this.goat.at
      this.goat.at = (this.goat.at + 1) % st.goat.length
      this.goat.t0 = this.now
      sfx.boing()
      this.met('mountain-goat')
      return true
    }
    // The elk walking down Banff's street.
    if (Math.abs(x - this.townElk.x) < 60 && Math.abs(y - (st.town.y - 10)) < 50) {
      this.townElk.stop = this.now
      noises.honk(false)
      noises.call('calf')
      this.met('elk')
      return true
    }
    return false
  }

  private pokeAnimal(a: Member) {
    const f = this.herd.fams[a.fam]
    // The rams bonk each other when they're close.
    if (a.kind === 'ram') {
      const [r0, r1] = f.m
      if (!this.bonk && dist(r0.x, r0.y, r1.x, r1.y) < 200) {
        this.startBonk(f)
        return
      }
    }
    this.play(a, 'hop', 0.5)
    sfx.boing()
    this.met(ANIMAL[a.fam])
    this.later(() => noises.call(a.kind), 120)
  }

  // -------------------------------------------------------------- the bridge

  private startBonk(f: Family) {
    const [a, b] = f.m
    this.bonk = { t0: this.now, a, b, x: (a.x + b.x) / 2, y: Math.max(a.y, b.y) }
    f.hold = this.now + 1.8
    f.target = null
    a.dir = b.x < a.x ? -1 : 1
    b.dir = a.x > b.x ? 1 : -1
    this.sayOnce('bonk', B.bonk)
    this.later(() => noises.bonk(), 600)
  }

  /** The wildlife camera: a flash, and a photo of whoever is on the bridge. */
  private snap(byHand: boolean) {
    this.flashAt = this.now
    noises.click()
    let who: Family | null = null
    let best = 1e9
    for (const f of Object.values(this.herd.fams)) {
      const on = f.m.filter((a) => onDeck(this.st, a.y) && Math.abs(a.x - this.st.road.x) < 260).length
      const d = Math.abs(f.m[0].x - this.st.road.x)
      if (on && d < best) {
        best = d
        who = f
      }
    }
    if (who && !this.photos.has(who.id)) {
      const L = who.m[0]
      this.photos.set(who.id, { fam: who.id, pts: who.m.map((a) => [a.kind, a.x - L.x, a.y - L.y, a.dir]) })
      this.sayOnce('camera', B.camera)
    } else if (byHand) this.sayOnce('camera', B.camera)
  }

  private plant(a: Member) {
    if (!this.seedsOn || a.fam === 'bears') return
    const st = this.st
    if (!onBridge(st, a.x, a.y)) {
      this.lastCell.delete(a)
      return
    }
    const [l, r] = deckEnds(st)
    const cell = clamp(Math.floor(((a.x - l) / (r - l)) * N_CELLS), 0, N_CELLS - 1)
    if (this.lastCell.get(a) === cell) return
    this.lastCell.set(a, cell)
    const before = Math.floor(Math.min(3, this.cells[cell]))
    this.cells[cell] = Math.min(3, this.cells[cell] + PLANT.grow)
    const after = Math.floor(Math.min(3, this.cells[cell]))
    // A seed drops behind it.
    const dot = this.seedDots.find((d) => d.t > 0.6)
    if (dot) {
      dot.t = 0
      dot.x = a.x - a.dir * LOOKS[a.kind].rx * 0.6
      dot.y = a.y - lift(st, a.x, a.y) - LOOKS[a.kind].legs
    }
    if (after > before) {
      this.cellEls[cell].pop = this.now
      noises.sprout(cell + after * 3)
    }
    const g = this.green()
    if (Math.abs(g - this.sentGreen) >= 0.05) {
      this.sentGreen = g
      this.info()
    }
    const bears = this.herd.fams.bears
    if (bears.shy && g >= PLANT.need) {
      bears.shy = false
      this.readyAt = this.now
      this.play(bears.m[0], 'sniff', 1.2)
      this.later(() => {
        this.play(bears.m[0], 'hop', 0.5)
        noises.call('grizzly')
      }, 1100)
      sounds.sparkle()
      this.say(B.bearYes)
      this.info()
    }
  }

  private refuse(f: Family) {
    // Mama grizzly at the bare bridge: sniff, shake her head, sit down.
    f.hold = this.now + 2.2
    f.target = null
    f.push = 0
    this.play(f.m[0], 'sniff', 0.9)
    noises.sniff()
    this.later(() => this.play(f.m[0], 'shake', 0.9), 900)
    this.later(() => {
      for (const m of f.m) this.play(m, 'sit', 2.4)
    }, 1500)
    this.say(B.bareNo, 6)
    this.later(() => this.herd.fams.bears.shy && this.say(B.seeds, 6), 2600)
    if (!this.seedsOn) {
      this.seedsOn = true
      sounds.sparkle()
      this.info()
    }
  }

  private fenceNo(f: Family) {
    f.hold = this.now + 1.1
    f.target = null
    f.push = 0
    this.play(f.m[0], 'shake', 1)
    noises.huff()
    noises.rattle()
    this.say(B.fence, 8)
  }

  private arrive(f: Family) {
    this.crossed.push(f.id)
    f.target = null
    f.m.forEach((m, i) => this.later(() => this.play(m, 'munch', 2.6), 300 + i * 180))
    this.later(() => sfx.munch(), 500)
    sounds.correct()
    const p = this.toScreen(f.m[0].x, f.m[0].y - 60)
    if (p) burst(p[0], p[1])
    // Maple cheers them in, and the mamas say thank you.
    this.ev.maple('cheer')
    this.say(B.cheer[f.id])
    const thanks = f.id === 'elk' ? B.elkHome : f.id === 'bears' ? B.bearHome : null
    if (thanks) this.later(() => this.say(thanks), 1900)
    if (!this.photos.has(f.id)) this.photos.set(f.id, this.posed(f.id))
    if (this.lead === f.id) this.lead = FAMILIES.find((id) => !this.crossed.includes(id)) ?? null
    const before = this.section
    this.info()
    if (this.section === 'album') {
      // (After Maple's cheer and the mama's thank-you.)
      this.albumAt = this.now + (thanks ? 3.8 : 2.4)
      this.later(() => this.gather(), 1200)
    } else if (this.section !== before)
      this.later(() => {
        // Unless she's already leading the next ones.
        if (!this.finger) this.say(SAY[this.section])
        const next = this.lead && this.herd.fams[this.lead]
        if (next) this.play(next.m[0], 'hop', 0.5)
      }, 3400)
  }

  /** Everyone walks into the meadow for the photos. */
  private gather() {
    const st = this.st
    const [l, r] = deckEnds(st)
    const my = (st.deck[0] + st.deck[1]) / 2
    for (const f of Object.values(this.herd.fams)) {
      const L = f.m[0]
      if (inMeadow(st, L.x, L.y) || (this.finger && this.finger.fam === f.id)) continue
      // From the forest side, the long way round: over the bridge.
      const route: Pt[] = L.x < st.road.x ? [[l - 20, my + 10], [r - 10, my], st.meadow[f.id][0]] : [st.meadow[f.id][0]]
      f.target = route.shift()!
      this.routes.set(f.id, route)
      f.auto = true
    }
  }

  toScreen(x: number, y: number): Pt | null {
    const m = this.svg.getScreenCTM()
    if (!m) return null
    const p = new DOMPoint(x, y).matrixTransform(m)
    return [p.x / innerWidth, p.y / innerHeight]
  }

  // -------------------------------------------------------------- the frame

  play(a: Member, kind: AnimKind, dur: number) {
    this.anims.set(a, { kind, t0: this.now, dur })
  }

  dt = 1 / 60
  /** While the story plays over the scene: no hints. */
  paused = false
  tick(dt: number) {
    if (this.dead) return
    this.now += dt
    this.dt = dt
    const st = this.st
    const now = this.now
    // Her finger keeps leading while it's down (the target was set by down/move); the herd walks.
    this.herd.step(dt, now)
    for (const f of Object.values(this.herd.fams)) {
      const L = f.m[0]
      // Pushing into the fence (or the bears at the bare bridge).
      if (f.push > LEAD.fence && now >= f.hold && !f.auto) {
        if (f.block === 'bare') this.refuse(f)
        else this.fenceNo(f)
      }
      // The middle of the bridge: the camera, and the rams' bonk.
      const mid = onDeck(st, L.y) && Math.abs(L.x - st.road.x) < 50
      if (mid && now - this.lastFlash[f.id] > 6) {
        this.lastFlash[f.id] = now
        this.later(() => this.snap(false), 250)
      }
      if (f.id === 'sheep') {
        if (mid && !this.bonked.sheep && !this.bonk && dist(L.x, L.y, f.m[1].x, f.m[1].y) < 220) {
          this.bonked.sheep = true
          this.startBonk(f)
        }
        if (!onDeck(st, L.y)) this.bonked.sheep = false
      }
      for (const m of f.m) this.plant(m)
      // Across for the first time.
      if (!this.crossed.includes(f.id) && inMeadow(st, L.x, L.y) && f.m.every((m) => m.x > st.road.x + halfCut(st, m.y) + FENCE_GAP - 2)) this.arrive(f)
      // Resting in the meadow, dropped on top of another family: stroll over to its own spot.
      if (!f.target && inMeadow(st, L.x, L.y) && L.speed < 5 && this.finger?.fam !== f.id) {
        const spot = st.meadow[f.id][0]
        const crowd = FAMILIES.some((o) => o !== f.id && dist(L.x, L.y, this.herd.fams[o].m[0].x, this.herd.fams[o].m[0].y) < 150)
        if (crowd && dist(L.x, L.y, spot[0], spot[1]) > 60) {
          f.target = spot
          f.auto = true
        }
      }
      // Walking by itself: on to the next waypoint, or done.
      if (f.auto && f.target && dist(L.x, L.y, f.target[0], f.target[1]) < 24) {
        const next = this.routes.get(f.id)?.shift()
        f.target = next ?? null
        f.auto = !!next
      }
    }
    if (this.albumAt > 0 && now >= this.albumAt) {
      this.albumAt = -1
      this.payoff()
    }
    this.lostCalf()
    // Idle families graze now and then.
    this.graze -= dt
    if (this.graze <= 0) {
      this.graze = 2 + this.r() * 3
      const all = this.herd.all().filter((m) => m.speed < 5 && !this.anims.has(m) && !(this.lead === m.fam && this.finger))
      const m = all[Math.floor(this.r() * all.length)]
      if (m) this.play(m, 'munch', 1.6 + this.r() * 1.4)
    }
    // Stuck: show the way (and say it, once per stuck spell).
    const stuck = !this.paused && now - this.lastTouch > ROAD.help && !this.finger && this.section !== 'album'
    this.hint(stuck)
    if (stuck && !this.hintSaid) {
      this.hintSaid = true
      const calf = this.herd.fams.elk.m.find((m) => m.lost)
      const line = calf ? B.fetch : this.lead === 'bears' && this.herd.fams.bears.shy && this.seedsOn ? B.seeds : this.lead ? SAY[this.lead] : B.lead.elk
      this.say(line, 0, spendHint(line))
    }
    this.cars_(dt)
    this.ambient(dt)
    this.draw()
  }

  private hint(on: boolean) {
    const hint = this.els.hint
    if (!on) {
      put(hint, 'opacity', '0')
      return
    }
    const st = this.st
    const bears = this.herd.fams.bears
    // Who to lead: the family whose turn it is, or (the bears waiting at a bare bridge) one that carries seeds.
    let who: Family | null = this.lead ? this.herd.fams[this.lead] : null
    if (who?.id === 'bears' && bears.shy && this.seedsOn) who = this.herd.fams[(['elk', 'sheep'] as FamilyId[]).find((id) => this.crossed.includes(id)) ?? 'elk']
    // The lost calf: from it, over the bridge, to its family.
    const calf = this.herd.fams.elk.m.find((m) => m.lost)
    if (calf) {
      const mama = this.herd.fams.elk.m[0]
      const [l, r] = deckEnds(st)
      const my = (st.deck[0] + st.deck[1]) / 2
      const across = mama.x > st.road.x
      this.hintPath(across ? [[calf.x, calf.y], [l - 10, my + 20], [st.road.x, my], [r - 20, my], [mama.x - 80, mama.y]] : [[calf.x, calf.y], [mama.x - 60, mama.y]])
      return
    }
    if (!who) {
      put(hint, 'opacity', '0')
      return
    }
    const L = who.m[0]
    const [l, r] = deckEnds(st)
    const my = (st.deck[0] + st.deck[1]) / 2
    const right = L.x > st.road.x
    const pts: Pt[] = right
      ? [[L.x, L.y], [r + 10, my + 20], [st.road.x, my], [l + 20, my], [st.wait[who.id][0][0], st.wait[who.id][0][1]]]
      : [[L.x, L.y], [l - 10, my + 20], [st.road.x, my], [r - 20, my], [st.meadow[who.id][0][0], st.meadow[who.id][0][1]]]
    this.hintPath(pts)
  }

  /** The dotted way and the hand walking along it. */
  private hintPath(pts: Pt[]) {
    const hint = this.els.hint
    put(this.els['hint-path'], 'points', pts.map((p) => `${p[0].toFixed(0)},${p[1].toFixed(0)}`).join(' '))
    // The hand walks the way, then starts again.
    const p = ((this.now - this.lastTouch - ROAD.help) % 3) / 2.4
    let [hx, hy] = pts[0]
    if (p < 1) {
      let total = 0
      for (let i = 1; i < pts.length; i++) total += dist(...pts[i - 1], ...pts[i])
      let d = p * total
      for (let i = 1; i < pts.length; i++) {
        const s = dist(...pts[i - 1], ...pts[i])
        if (d <= s) {
          hx = pts[i - 1][0] + ((pts[i][0] - pts[i - 1][0]) * d) / s
          hy = pts[i - 1][1] + ((pts[i][1] - pts[i - 1][1]) * d) / s
          break
        }
        d -= s
      }
    }
    put(this.els['hint-hand'], 'transform', `translate(${hx.toFixed(0)} ${(hy + 40).toFixed(0)})`)
    put(hint, 'opacity', String(clamp((this.now - this.lastTouch - ROAD.help) * 2, 0, 0.9)))
  }

  // -------------------------------------------------------------- the highway

  carY(s: number) {
    const st = this.st
    return st.back + (st.h + 160 - st.back) * Math.pow(s, 1.7)
  }

  carAt(c: Car) {
    const st = this.st
    const y = this.carY(c.s)
    const hw = halfCut(st, y)
    return { x: st.road.x + (c.dir === 1 ? -1 : 1) * hw * 0.42, y, sz: hw / 240 }
  }

  private cars_(dt: number) {
    this.nextCar -= dt
    if (this.nextCar <= 0) {
      this.nextCar = ROAD.every * (0.6 + this.r() * 0.8)
      const c = this.cars.find((o) => !o.on)
      if (c) {
        c.on = true
        c.dir = this.r() < 0.5 ? 1 : -1
        c.s = c.dir === 1 ? 0 : 1.05
        c.truck = this.r() < 0.25
        c.zoomed = false
        // Coming at us we see its front; driving away, its back.
        const look = `${c.truck ? 'truck' : 'car'}-${c.dir === 1 ? 'front' : 'back'}`
        for (const [k, el] of Object.entries(c.looks)) put(el, 'visibility', k === look ? 'visible' : 'hidden')
        put(c.glow, 'fill', c.dir === 1 ? '#FFF6C8' : '#FF8A8A')
      }
    }
    for (const c of this.cars) {
      if (!c.on) continue
      c.s += c.dir * ROAD.speed * dt
      if (c.dir === 1 && c.s > 0.86 && !c.zoomed) {
        c.zoomed = true
        if (this.r() < 0.35) noises.zoom()
      }
      if (c.s > 1.08 || c.s < 0) c.on = false
    }
  }

  // -------------------------------------------------------------- the things around

  eaglePos(): Pt {
    const e = this.st.eagle
    const a = this.now * 0.55
    const p = (this.now - this.eagle.dive) / 1.4
    return [e.x + Math.cos(a) * e.rx, e.y + Math.sin(a) * e.ry + bell(p) * 150]
  }

  goatPos(): Pt {
    const g = this.st.goat
    const p = clamp((this.now - this.goat.t0) / 0.6, 0, 1)
    const [ax, ay] = g[this.goat.from]
    const [bx, by] = g[this.goat.at]
    return [ax + (bx - ax) * p, ay + (by - ay) * p - bell(p) * 40]
  }

  private ambient(dt: number) {
    const st = this.st
    const now = this.now
    // The eagle circles, and dives when she taps it.
    const [ex, ey] = this.eaglePos()
    const facing = -Math.sin(now * 0.55) >= 0 ? 1 : -1
    put(this.els.eagle, 'transform', `translate(${ex.toFixed(1)} ${ey.toFixed(1)}) scale(${facing} 1)`)
    put(this.els['eagle-wings'], 'transform', `scale(1 ${(0.75 + 0.25 * Math.sin(now * 5)).toFixed(2)})`)
    // The wolf peeks out of the forest every so often.
    const w = this.wolf
    if (now >= w.next && w.until < now) {
      w.until = now + 4
      w.next = now + 12 + this.r() * 10
    }
    const want = now < w.until || now - w.howl < 1.6 ? 1 : 0
    w.up += (want - w.up) * Math.min(1, dt * 5)
    const tilt = now - w.howl < 1.6 ? -25 * bell((now - w.howl) / 1.6) : 0
    const peek = Math.sin(now * 1.7) * 3 * w.up
    put(this.els.wolf, 'transform', `translate(${st.wolf[0]} ${(st.wolf[1] - 104 + (1 - w.up) * 130).toFixed(1)}) rotate(${(tilt + peek).toFixed(1)})`)
    const rs = now - w.rustle < 0.5 ? Math.sin((now - w.rustle) * 50) * 4 * (1 - (now - w.rustle) / 0.5) : 0
    put(this.els.bush, 'transform', `rotate(${rs.toFixed(1)} ${st.wolf[0]} ${st.wolf[1] + 22})`)
    // The goat.
    const [gx, gy] = this.goatPos()
    put(this.els.goat, 'transform', `translate(${gx.toFixed(1)} ${gy.toFixed(1)})`)
    // The elk on Banff's street (the little car waits while it stops).
    const te = this.townElk
    const stopped = now - te.stop < 3
    if (!stopped) {
      te.x += te.dir * 14 * dt
      if (te.x > st.town.x + st.town.w) te.dir = -1
      if (te.x < st.town.x) te.dir = 1
    }
    put(this.els['town-elk'], 'transform', `translate(${te.x.toFixed(1)} ${st.town.y}) scale(${te.dir * 0.22} 0.22)`)
    put(this.els['town-car'], 'transform', `translate(${(stopped ? te.x + 70 : st.town.x - 60 + ((now * 30) % (st.town.w + 120))).toFixed(1)} ${st.town.y + 2})`)
    // Clouds drift.
    for (const c of this.clouds) {
      c.x += c.v * dt
      if (c.x > this.vb.x + this.vb.w + 200) c.x = this.vb.x - 200
      put(c.el, 'transform', `translate(${c.x.toFixed(1)} ${c.y})`)
    }
  }

  // -------------------------------------------------------------- drawing

  private draw() {
    const st = this.st
    const now = this.now
    // The animals, nearest drawn last.
    const all = this.herd.all()
    const sorted = [...all].sort((a, b) => a.y - b.y)
    if (sorted.some((m, i) => this.order[i] !== m)) {
      this.order = sorted
      const parent = this.els.animals
      if (parent) for (const m of sorted) parent.appendChild(this.ael.get(m)!.root)
    }
    for (const m of all) this.drawAnimal(m)
    // The rams' bonk: stars over their heads.
    const b = this.bonk
    if (b) {
      const p = (now - b.t0) / 1.8
      if (p >= 1) this.bonk = null
      const hit = p > 0.33 && p < 0.85
      put(this.els.stars, 'opacity', hit ? '1' : '0')
      if (hit) put(this.els.stars, 'transform', `translate(${((b.a.x + b.b.x) / 2).toFixed(0)} ${(Math.min(b.a.y, b.b.y) - lift(st, b.a.x, b.a.y) - 120).toFixed(0)}) rotate(${(now * 200) % 360})`)
    } else put(this.els.stars, 'opacity', '0')
    // The bridge's plants.
    for (let i = 0; i < N_CELLS; i++) {
      const c = this.cellEls[i]
      if (!c) continue
      const v = Math.floor(Math.min(3, this.cells[i]) + 1e-6)
      put(c.grass, 'visibility', v >= 1 ? 'visible' : 'hidden')
      put(c.bush, 'visibility', v >= 2 ? 'visible' : 'hidden')
      put(c.berry, 'visibility', v >= 3 ? 'visible' : 'hidden')
      const p = (now - c.pop) / 0.5
      const s = p < 1 ? 0.4 + 0.6 * p + bell(p) * 0.35 : 1
      put(c.g, 'transform', `translate(${c.g.dataset.x} ${c.g.dataset.y}) scale(${s.toFixed(2)})`)
    }
    const g = this.green()
    put(this.els['deck-green'], 'opacity', (0.15 + g * 0.85).toFixed(2))
    const ready = !this.herd.fams.bears.shy && (this.seedsOn || g > 0)
    const tp = clamp((now - this.readyAt) / 0.6, 0, 1)
    put(this.els['deck-trees'], 'opacity', ready ? '1' : '0')
    put(this.els['deck-trees'], 'transform', ready && tp < 1 ? `translate(0 ${((1 - tp) * 30).toFixed(0)})` : '')
    // Seeds falling onto the bridge.
    for (const d of this.seedDots) {
      d.t += 1 / 60
      put(d.el, 'opacity', d.t < 0.6 ? (1 - d.t / 0.6).toFixed(2) : '0')
      if (d.t < 0.6) put(d.el, 'transform', `translate(${d.x.toFixed(0)} ${(d.y + d.t * 60).toFixed(0)})`)
    }
    // The flower the lost calf sniffs (it stays where it grew).
    const fl = this.flower
    put(this.els.flower, 'visibility', fl ? 'visible' : 'hidden')
    if (fl) put(this.els.flower, 'transform', `translate(${fl[0].toFixed(0)} ${fl[1].toFixed(0)}) scale(${depth(st, fl[1]).toFixed(2)})`)
    // The camera's flash.
    const fp = (now - this.flashAt) / 0.35
    put(this.els.flash, 'opacity', fp < 1 ? (0.4 * (1 - fp)).toFixed(2) : '0')
    put(this.els.lamp, 'fill', fp < 1.5 ? '#FFFFFF' : now % 2 < 0.15 ? '#FF6A6A' : '#7A2A3A')
    // Cars.
    for (const c of this.cars) {
      put(c.el, 'visibility', c.on ? 'visible' : 'hidden')
      if (!c.on) continue
      const { x, y, sz } = this.carAt(c)
      const honk = now - c.honk < 0.5
      put(c.el, 'transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(sz * (honk ? 1.08 : 1)).toFixed(3)})`)
      put(c.glow, 'opacity', honk && Math.floor(now * 10) % 2 ? '0.85' : '0')
    }
  }

  private drawAnimal(m: Member) {
    const st = this.st
    const a = this.anims.get(m)
    const now = this.now
    let p = a ? (now - a.t0) / a.dur : 1
    if (a && p >= 1) {
      this.anims.delete(m)
      p = 1
    }
    const act = a && p < 1 ? a.kind : null
    // The bonk: back up, charge, knock, wobble.
    let dx = 0
    let bonkHead: number | null = null
    const bk = this.bonk
    if (bk && (bk.a === m || bk.b === m)) {
      const look = LOOKS[m.kind]
      const q = (now - bk.t0) / 1.8
      const toward = (bk.a === m ? bk.b.x : bk.a.x) > m.x ? 1 : -1
      const gap = Math.abs(bk.a.x - bk.b.x)
      const meet = Math.max(0, gap / 2 - look.rx * 0.95)
      if (q < 0.2) dx = -toward * 22 * (q / 0.2)
      else if (q < 0.33) dx = -toward * 22 + toward * (meet + 22) * ((q - 0.2) / 0.13)
      else if (q < 0.85) dx = toward * meet - toward * 10 * bell((q - 0.33) / 0.52)
      else dx = toward * meet * (1 - (q - 0.85) / 0.15)
      bonkHead = q > 0.12 && q < 0.4 ? 22 : q < 0.85 ? Math.sin(q * 40) * 8 : 0
    }
    // The mamas' mouths move with their voices.
    const voice = m.i === 0 ? VOICE[m.fam] : undefined
    poseCritter(this.ael.get(m)!, this.life.get(m)!, {
      kind: m.kind,
      x: m.x,
      y: m.y - lift(st, m.x, m.y),
      scale: depth(st, m.y),
      dir: m.dir,
      walk: m.walk,
      speed: m.speed,
      rocky: m.rocky,
      sheep: m.fam === 'sheep',
      now,
      dt: this.dt,
      act: act === 'bonk' ? null : act,
      p,
      dx,
      bonkHead,
      mouth: voice ? speechLevel(voice) : 0,
      seeds: m.fam !== 'bears' && this.seedsOn && this.herd.fams.bears.shy,
    })
  }

  /** The littlest calf stops to sniff a flower on the elk's first crossing (once a run), and waits to be fetched. */
  private lostCalf() {
    const st = this.st
    const elk = this.herd.fams.elk
    const calf = elk.m[elk.m.length - 1]
    const mama = elk.m[0]
    const [l] = deckEnds(st)
    if (!this.strayed && !this.crossed.includes('elk') && onDeck(st, mama.y) && Math.abs(mama.x - st.road.x) < halfCut(st, mama.y) && calf.x < l - 40 && !onBridge(st, calf.x, calf.y)) {
      this.strayed = true
      this.strayAt = this.now
      calf.lost = true
      calf.lostTo = null
      calf.vx = 0
      calf.vy = 0
      this.flower = [calf.x + calf.dir * 46, calf.y + 6]
      this.play(calf, 'sniff', 1.4)
      this.later(() => noises.call('calf'), 400)
      this.later(() => this.say(B.lost), 1200)
    }
    if (!calf.lost) return
    // Sniffing away at its flower until she fetches it, with a little bleat now and then.
    if (!this.finger?.lost && !this.anims.has(calf) && this.flower) {
      calf.dir = this.flower[0] > calf.x ? 1 : -1
      if (dist(calf.x, calf.y, this.flower[0], this.flower[1]) < 120) this.play(calf, 'sniff', 1.6 + this.r())
      else if (this.r() < 0.02) {
        this.play(calf, 'hop', 0.4)
        noises.call('calf')
      }
    }
    // Back with its family: it hops into the line again.
    // (Once she's touched it, or after a while: her family came back for it.)
    const near = elk.m.some((o) => o !== calf && !o.lost && dist(o.x, o.y, calf.x, calf.y) < 170)
    if (near && (this.fetched || this.now - this.strayAt > 4)) {
      calf.lost = false
      calf.lostTo = null
      if (this.finger?.lost === calf) this.finger.lost = null
      this.play(calf, 'hop', 0.5)
      this.play(mama, 'hop', 0.5)
      noises.call('calf')
      sounds.correct()
      const sp = this.toScreen(calf.x, calf.y - 60)
      if (sp) burst(sp[0], sp[1])
      this.say(B.elkFound)
    }
  }

  /** Everyone is across: the camera's photos pop in, Maple cheers, and then the stamp. */
  private payoff() {
    sounds.fanfare()
    bigCelebration()
    this.ev.album(this.album())
    this.ev.maple('cheer')
    this.say(B.album)
    this.later(() => this.say(B.done, 0), 2600)
    this.later(() => this.ev.done(), 5200)
  }

  qa() {
    const scr = (x: number, y: number) => {
      const m = this.svg.getScreenCTM()
      if (!m) return { x: 0, y: 0 }
      const p = new DOMPoint(x, y).matrixTransform(m)
      return { x: Math.round(p.x), y: Math.round(p.y) }
    }
    const st = this.st
    const [l, r] = deckEnds(st)
    const my = (st.deck[0] + st.deck[1]) / 2
    const fams: Record<string, unknown> = {}
    for (const f of Object.values(this.herd.fams)) fams[f.id] = { ...scr(f.m[0].x, f.m[0].y - 40), stage: [Math.round(f.m[0].x), Math.round(f.m[0].y)], shy: f.shy }
    return {
      section: this.section,
      lead: this.lead,
      crossed: [...this.crossed],
      green: Math.round(this.green() * 100) / 100,
      seeds: this.seedsOn,
      photos: [...this.photos.keys()],
      fams,
      calf: ((c) => (c ? scr(c.x, c.y - 30) : null))(this.herd.fams.elk.m.find((m) => m.lost)),
      strayed: this.strayed,
      bridge: { left: scr(l + 30, my), middle: scr(st.road.x, my), right: scr(r - 30, my) },
      forest: scr(st.wait.elk[0][0], st.wait.elk[0][1]),
      meadow: scr(st.meadow.elk[0][0], st.meadow.elk[0][1]),
      rocks: scr(st.rocks.x, st.rocks.y),
      road: scr(st.road.x, st.deck[1] + 160),
    }
  }
}

// ---------------------------------------------------------------- React

interface Run {
  section: Part
  crossed: FamilyId[]
  green: number
  seed: number
  n: number
}

export function AnimalBridge({ onDone, setProgress }: CanadaActivityProps) {
  const { start, param, enter } = useSections(BRIDGE_SECTIONS)
  const first = (start && start !== 'story' ? start : 'elk') as Part
  // The bare link (and the story's own link) opens with Maple's line; a later section starts playing at once.
  const [story, setStory] = useState(start === null || start === 'story')
  const storyOn = useRef(story)
  const [run, setRun] = useState<Run>(() => ({ section: first, crossed: parseCrossed(param('crossed'), first), green: clamp(parseFloat(param('green')) || 0, 0, 1), seed: (Math.random() * 1e9) | 0, n: 0 }))
  const [say, setSay] = useState<Line>(SAY[run.section])
  const [info, setInfo] = useState<Info>({ section: run.section, crossed: run.crossed, green: run.green, seeds: run.green > 0 })
  const [album, setAlbum] = useState<Snapshot[] | null>(null)
  const box = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const world = useRef<BridgeWorld | null>(null)
  const maple = useRef<PuppetHandle>(null)
  const finished = useRef(false)
  const giggled = useRef(-99)
  const size = useElementSize(box)
  const wide = !size.height || size.width / size.height >= 1.05
  const stage = wide ? WIDE : TALL
  const mid = `bridge${run.n}`
  const props = useRef({ onDone, setProgress })
  props.current = { onDone, setProgress }

  // The view box: the stage scaled to fit, the extra edge filled with more of the valley (sky above, the banks at the
  // sides, the highway and the banks below).
  const k = size.width && size.height ? Math.min(size.width / stage.w, size.height / stage.h) : 1
  const vw = size.width ? size.width / k : stage.w
  const vh = size.height ? size.height / k : stage.h
  const vb = { x: (stage.w - vw) / 2, y: (stage.h - vh) / 2, w: vw, h: vh }

  useEffect(() => {
    if (storyOn.current) enter('story')
    // A link into the middle: Sparkle says whose turn it is (the photos speak for themselves).
    else if (first !== 'album') {
      setSay(SAY[first])
      void speak(SAY[first])
      const t = setTimeout(() => void maple.current?.play('wave'), 600)
      return () => clearTimeout(t)
    }
  }, [])

  useLayoutEffect(() => {
    if (!svg.current) return
    const w = new BridgeWorld(svg.current, stage, run.section, run.crossed, run.green, run.seed, {
      info: (i) => {
        setInfo(i)
        props.current.setProgress(i.crossed.length, FAMILIES.length)
        // The bridge's green counts in every section (she can plant it while leading any family).
        if (!storyOn.current) enter(i.section, { crossed: crossedParam(i.crossed, i.section), green: greenParam(i.green) })
      },
      say: (line, queue, voice = true) => {
        setSay(line)
        if (voice) void speak(line, { interrupt: !queue })
      },
      album: setAlbum,
      maple: (a) => void maple.current?.play(a),
      done: () => {
        if (finished.current) return
        finished.current = true
        props.current.onDone()
      },
    })
    w.setVb(vb)
    w.paused = storyOn.current
    world.current = w
    ;(window as unknown as { __canadaBridgeQA?: () => unknown }).__canadaBridgeQA = () => w.qa()
    const unwatch = watch('bridge', () => {
      const f = w.lead ? w.herd.fams[w.lead] : w.herd.fams.elk
      const L = f.m[0]
      const lag = f.target ? dist(L.x, L.y, f.target[0], f.target[1]) : 0
      let gaps = 0
      for (let i = 1; i < f.m.length; i++) gaps += dist(f.m[i].x, f.m[i].y, f.m[i - 1].x, f.m[i - 1].y)
      const last = f.m[f.m.length - 1]
      const [px, py] = w.herd.pathPoint(f, (f.m.length - 1) * FOLLOW.gap)
      return {
        lag: [lag, 600],
        mama: [L.speed, Math.max(200, LEAD.speed)],
        stretch: [gaps / (f.m.length - 1) / FOLLOW.gap - 1, 1],
        tail: [dist(last.x, last.y, px, py), 200],
      }
    })
    let raf = 0
    let last = performance.now()
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000)
      last = t
      if (!document.hidden) w.tick(dt)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      w.dead = true
      cancelAnimationFrame(raf)
      unwatch()
      if (world.current === w) world.current = null
    }
  }, [run])

  // Turning the iPad: the other stage, the same moment again (who's across and how green the bridge is are kept).
  const shape = useRef(stage)
  useEffect(() => {
    const w = world.current
    if (!w) return
    w.setVb(vb)
    if (shape.current !== stage) {
      shape.current = stage
      setRun((r) => ({ ...r, section: w.section, crossed: [...w.crossed], green: w.green(), n: r.n + 1 }))
    }
  })

  // Each photo clicks as it pops in.
  useEffect(() => {
    if (!album) return
    const ts = album.map((_, i) => setTimeout(() => noises.click(), 300 + i * 500))
    return () => ts.forEach(clearTimeout)
  }, [album])

  const endStory = () => {
    storyOn.current = false
    setStory(false)
    const w = world.current
    if (w) {
      w.paused = false
      w.lastTouch = w.now
      w.info()
    }
    setTimeout(() => void maple.current?.play('wave'), 300)
  }

  const again = () => {
    setAlbum(null)
    setSay(SAY.elk)
    void speak(SAY.elk)
    setRun((r) => ({ section: 'elk', crossed: [], green: 0, seed: (Math.random() * 1e9) | 0, n: r.n + 1 }))
  }

  const st = stage
  const big = 6000
  const [deckL, deckR] = deckEnds(st)
  const rc = st.road.x
  const scene = useScene(st)
  const mb = mountainsBox(st)
  // Maple stands in the meadow, on the stage like everyone else (her feet on her spot).
  const mh = st.mapleH * k
  const mapleBox = { left: (st.maple[0] - vb.x) * k - mh / 2, top: (st.maple[1] - vb.y) * k - mh * 0.97, width: mh, height: mh }

  return (
    <div
      ref={box}
      style={{ position: 'absolute', inset: 0, background: '#BFE3F7', overflow: 'clip', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
      aria-label="Lead the animals over the bridge"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        world.current?.down(e)
      }}
      onPointerMove={(e) => world.current?.move(e)}
      onPointerUp={(e) => world.current?.up(e)}
      onPointerCancel={(e) => world.current?.up(e)}
    >
      <style>{CSS}</style>
      <svg key={`s${run.n}`} ref={svg} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} style={SVG_STYLE} aria-hidden>
        <defs>
          <linearGradient id={`${mid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9FD3F2" />
            <stop offset="1" stopColor="#E4F4FB" />
          </linearGradient>
        </defs>
        <rect x={-big} y={-big} width={big * 2} height={big + st.back} fill={`url(#${mid}-sky)`} />
        {scene.clouds.map(([x, y, s], i) => (
          <g key={i} data-k="cloud" data-x={x} data-y={y} transform={`translate(${x} ${y})`}>
            <g transform={`scale(${s})`}>
              <path d="M-74 10 C -84 -10, -60 -24, -40 -16 C -36 -40, 0 -50, 14 -28 C 30 -46, 66 -36, 62 -12 C 84 -12, 88 10, 70 14 Z" fill="#FFFFFF" stroke="#C9DDF0" strokeWidth={4} strokeLinejoin="round" />
            </g>
          </g>
        ))}
        {/* The Rockies: the painted range, and more peaks beyond it on very wide screens. */}
        {scene.extraPeaks.map(([px, py], i) => (
          <path key={i} d={`M${px - 260} ${st.back + 12} L ${px - 40} ${py + 30} L ${px} ${py} L ${px + 50} ${py + 40} L ${px + 260} ${st.back + 12} Z`} fill={i % 2 ? '#8E9CC0' : '#7F8EB4'} stroke="#2B2330" strokeWidth={3} strokeLinejoin="round" />
        ))}
        <image href={ART.mountains.src} x={mb.x} y={mb.y} width={mb.w} height={mb.h} preserveAspectRatio="none" />
        {/* Two peaks over the painting's cut ends (only seen on very wide screens). */}
        {[vb.x < mb.x + 4 ? mb.x + 30 : null, vb.x + vb.w > mb.x + mb.w - 4 ? mb.x + mb.w - 30 : null].map((px, i) => px !== null && (
          <path key={i} d={`M${px - 230} ${st.back + 12} L ${px - 30} ${mb.y + mb.h * 0.42} L ${px} ${mb.y + mb.h * 0.36} L ${px + 40} ${mb.y + mb.h * 0.46} L ${px + 230} ${st.back + 12} Z`} fill={i ? '#8E9CC0' : '#7F8EB4'} stroke="#2B2330" strokeWidth={3} strokeLinejoin="round" />
        ))}
        {/* The goat's ledges, and the goat. */}
        {st.goat.map(([x, y], i) => (
          <path key={i} d={`M${x - 34} ${y + 2} L ${x + 34} ${y + 2} L ${x + 24} ${y + 14} L ${x - 26} ${y + 12} Z`} fill="#A7B2D6" stroke="#2B2330" strokeWidth={3} strokeLinejoin="round" />
        ))}
        <g data-k="goat">
          <Sprite pic={ART.goat} h={64} />
        </g>
        {/* The bald eagle circling. */}
        <g data-k="eagle">
          <g data-k="eagle-wings">
            <Sprite pic={ART.eagle} h={110} y={40} />
          </g>
        </g>
        {/* The far forest along the back, then Banff town in the valley, with its elk on the street. */}
        {scene.far.map(([x, h], i) => (
          <path key={i} d={`M${x - h * 0.3} ${st.back + 6} L ${x - h * 0.12} ${st.back - h * 0.45} L ${x - h * 0.2} ${st.back - h * 0.45} L ${x} ${st.back - h} L ${x + h * 0.2} ${st.back - h * 0.45} L ${x + h * 0.12} ${st.back - h * 0.45} L ${x + h * 0.3} ${st.back + 6} Z`} fill={i % 2 ? '#3E7A5A' : '#4A8A64'} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        ))}
        <Sprite pic={ART.town} w={st.town.w} x={st.town.x + st.town.w / 2} y={st.town.y + 2} />
        <g data-k="town-car">
          <path d="M-15 -4 L -15 -10 Q -12 -14 -6 -14 L -2 -20 L 8 -20 L 12 -14 L 15 -12 L 15 -4 Z" fill="#FF8FB8" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
          <circle cx={-8} cy={-3} r={3.5} fill={INK} />
          <circle cx={8} cy={-3} r={3.5} fill={INK} />
        </g>
        <g data-k="town-elk">
          <Critter kind="elk" />
        </g>
        {/* The banks: the forest floor on the left, the meadow on the right. */}
        <rect x={-big} y={st.back} width={big + rc} height={big} fill="#86B46C" />
        <rect x={rc} y={st.back} width={big} height={big} fill="#A9D684" />
        {scene.dots.map(([x, y, c], i) => (
          <circle key={i} cx={x} cy={y} r={6} fill={c} stroke={INK} strokeWidth={2} />
        ))}
        {scene.flowers.map(([x, y, s], i) => (
          <Sprite key={i} pic={ART.flower} h={s} x={x} y={y} />
        ))}
        {scene.ferns.map(([x, y], i) => (
          <path key={i} d={`M${x - 16} ${y} q 4 -18 8 -20 q 1 12 4 13 q 4 -20 8 -24 q 1 16 4 18 q 5 -14 10 -16 q -1 14 -2 29 Z`} fill="#6E9E58" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
        ))}
        {/* The wolf, behind his bush at the forest's edge (clipped at the bush's middle, so he can duck out of sight). */}
        <clipPath id={`${mid}-wolf`}>
          <rect x={st.wolf[0] - 200} y={st.wolf[1] - 400} width={400} height={400 - 50} />
        </clipPath>
        <g clipPath={`url(#${mid}-wolf)`}>
          <g data-k="wolf">
            <Sprite pic={ART.wolf} h={110} y={14} />
          </g>
        </g>
        <g data-k="bush">
          <Sprite pic={ART.bush} w={190} x={st.wolf[0]} y={st.wolf[1] + 40} />
        </g>
        {st.trees.map(([x, y, h], i) => (
          <Sprite key={i} pic={i % 3 === 1 ? ART.spruce2 : ART.spruce} h={i % 3 === 1 ? h * 0.8 : h} x={x} y={y + 6} />
        ))}
        {/* The highway in its cut, coming toward us from the forest. */}
        <path d={scene.cut} fill="#93A07E" />
        <path d={scene.road} fill="#8C8A98" stroke={INK} strokeWidth={4} />
        {scene.dashes.map((d, i) => (
          <path key={i} d={d} fill="#FFE07A" />
        ))}
        {scene.edges.map((d, i) => (
          <path key={i} d={d} stroke="#F4F2F8" strokeWidth={4} fill="none" />
        ))}
        <g>
          {Array.from({ length: 7 }, (_, i) => (
            <g key={i} data-k="car" visibility="hidden">
              <g data-k="car-front" visibility="hidden">
                <Sprite pic={ART.carFront} w={124} />
              </g>
              <g data-k="car-back" visibility="hidden">
                <Sprite pic={ART.carBack} w={124} />
              </g>
              <g data-k="truck-front" visibility="hidden">
                <Sprite pic={ART.truckFront} w={150} />
              </g>
              <g data-k="truck-back" visibility="hidden">
                <Sprite pic={ART.truckBack} w={150} />
              </g>
              <g data-k="car-glow" opacity={0}>
                <circle cx={-40} cy={-34} r={20} />
                <circle cx={40} cy={-34} r={20} />
              </g>
            </g>
          ))}
        </g>
        {/* The wildlife fence along both sides of the highway. */}
        {scene.fences.map((d, i) => (
          <path key={i} d={d} stroke="#6E6A7E" strokeWidth={3} fill="none" />
        ))}
        {scene.posts.map(([x, y, h], i) => (
          <path key={i} d={`M${x} ${y} L ${x} ${y - h}`} stroke="#5E5A6E" strokeWidth={5} strokeLinecap="round" />
        ))}
        {/* The animal bridge: its shadow on the road, its stone face with the arch, the walkway on top with its grassy
            lip, and the plants that grow on it. */}
        <path d={scene.shadow} fill="#5A5870" opacity={0.35} />
        <path d={scene.face} fill="#C9C2D6" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {scene.blocks.map((d, i) => (
          <path key={i} d={d} stroke="#A9A1B8" strokeWidth={3} fill="none" strokeLinecap="round" />
        ))}
        <path d={scene.arch} fill="#6E6A82" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d={scene.deck} fill="#D9C79C" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path data-k="deck-green" d={scene.deck} fill="#7CC46A" opacity={0.15} />
        {scene.lip.map((d, i) => (
          <path key={i} d={d} fill="#7CBF62" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        ))}
        <g data-k="deck-trees" opacity={0}>
          <Sprite pic={ART.spruce2} h={120} x={deckL + 30} y={st.deck[0] + 10} />
          <Sprite pic={ART.spruce2} h={120} x={deckR - 30} y={st.deck[0] + 10} />
        </g>
        {scene.cells.map(([x, y], i) => (
          <g key={i} data-k="cell" data-x={x} data-y={y} transform={`translate(${x} ${y})`}>
            <g data-k="grass" visibility="hidden">
              {[-14, 0, 14].map((dx) => (
                <path key={dx} d={`M${dx - 6} 0 L ${dx} -22 L ${dx + 6} 0 Z`} fill="#5EAA4E" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
              ))}
            </g>
            <g data-k="bush" visibility="hidden">
              <circle cx={-14} cy={-14} r={15} fill="#4E9A50" stroke={INK} strokeWidth={3} />
              <circle cx={14} cy={-14} r={15} fill="#4E9A50" stroke={INK} strokeWidth={3} />
              <circle cx={0} cy={-24} r={18} fill="#5AAA5C" stroke={INK} strokeWidth={3} />
            </g>
            <g data-k="berry" visibility="hidden">
              {[[-12, -18], [6, -30], [14, -12], [-2, -10]].map(([bx, by], j) => (
                <circle key={j} cx={bx} cy={by} r={5} fill="#D84A6A" stroke={INK} strokeWidth={1.5} />
              ))}
            </g>
          </g>
        ))}
        {/* The wildlife camera on its post. */}
        <g data-k="camera">
          <Sprite pic={ART.camera} h={125} x={st.camera[0]} y={st.camera[1]} />
          <circle data-k="lamp" cx={st.camera[0] + 6} cy={st.camera[1] - 102} r={5} fill="#7A2A3A" stroke={INK} strokeWidth={2} />
        </g>
        {/* The rocky way: boulders against the fence. */}
        <Sprite pic={ART.boulders} w={st.rocks.rx * 2.5} x={st.rocks.x} y={st.rocks.y + st.rocks.ry * 0.85} />
        <g fill="#C8A24A" stroke={INK} strokeWidth={2}>
          {Array.from({ length: 10 }, (_, i) => (
            <circle key={i} data-k="seed" r={5} opacity={0} />
          ))}
        </g>
        <g data-k="flower" visibility="hidden">
          <Sprite pic={ART.flower} h={70} />
        </g>
        {/* The families. */}
        <g data-k="animals">
          {FAMILIES.flatMap((id) =>
            MEMBERS[id].map((kind, i) => (
              <g key={`${id}-${i}`} data-k={`a-${id}-${i}`}>
                <g data-k="pose">
                  <Critter kind={kind} seeds={id !== 'bears'} live />
                </g>
              </g>
            )),
          )}
        </g>
        {/* Grass tufts along the front edge. */}
        {scene.tufts.map(([x, y], i) => (
          <path key={i} d={`M${x - 26} ${y} q 6 -30 12 -34 q 2 20 6 22 q 6 -34 14 -40 q 2 26 6 30 q 8 -24 16 -28 q -2 24 -2 50 Z`} fill={x < rc ? '#6E9E58' : '#8CC46C'} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        ))}
        <g data-k="stars" opacity={0}>
          {[0, 120, 240].map((a) => (
            <path key={a} transform={`rotate(${a}) translate(0 -26)`} d="M0 -12 L 4 -4 L 12 -3 L 6 3 L 8 12 L 0 7 L -8 12 L -6 3 L -12 -3 L -4 -4 Z" fill="#FFE07A" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
          ))}
        </g>
        <g data-k="hint" opacity={0} pointerEvents="none">
          <polyline data-k="hint-path" points="" fill="none" stroke="#FFFFFF" strokeWidth={10} strokeDasharray="4 22" strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
          <g data-k="hint-hand">
            <text fontSize={90} textAnchor="middle" dominantBaseline="middle" className="bridge-hint">
              👆
            </text>
          </g>
        </g>
        <rect data-k="flash" x={-big} y={-big} width={big * 2} height={big * 2} fill="#FFFFFF" opacity={0} pointerEvents="none" />
      </svg>
      {/* Maple watching from the meadow: she cheers each family in. A tap: she giggles. */}
      {size.width > 0 && (
        <div
          style={{ position: 'absolute', zIndex: 5, ...mapleBox }}
          aria-label="Maple"
          onPointerDown={(e) => {
            e.stopPropagation()
            const w = world.current
            if (w) w.lastTouch = w.now
            sfx.pop()
            void maple.current?.play('hop')
            if (performance.now() - giggled.current > 8000) {
              giggled.current = performance.now()
              setSay(B.giggle)
              void speak(B.giggle)
            }
          }}
        >
          <Maple ref={maple} height="100%" flip={-1} />
        </div>
      )}
      {/* The families across so far, and how green the bridge is (for Dad). */}
      <div style={TALLY}>
        {info.seeds && (
          <div style={{ ...CHIP, width: 'auto', padding: '0 10px', gap: 6, display: 'flex', alignItems: 'center' }}>
            🌱
            <div style={{ width: 'clamp(40px, 7vmin, 70px)', height: 10, borderRadius: 99, background: '#E4E0EA', overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, width: `${Math.round(info.green * 100)}%`, background: info.green >= PLANT.need ? '#5AAA5C' : '#9AD48A' }} />
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${PLANT.need * 100}%`, width: 2, background: INK }} />
            </div>
          </div>
        )}
        {FAMILIES.map((id) => (
          <motion.div key={id} animate={{ scale: info.crossed.includes(id) ? [1.4, 1] : 1 }} style={{ ...CHIP, opacity: info.crossed.includes(id) ? 1 : 0.4 }}>
            {EMOJI[id]}
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {album && (
          <motion.div key="album" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} style={ALBUM}>
            {album.map((p, i) => (
              <motion.div key={p.fam} initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: (i - 1) * 4 }} transition={{ delay: 0.3 + i * 0.5, type: 'spring' }} style={PHOTO}>
                <Photo shot={p} />
                <div style={{ fontSize: 'clamp(16px, 3vmin, 26px)', lineHeight: 1 }}>{EMOJI[p.fam]}</div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {album && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.5, type: 'spring' }} style={AGAIN} onPointerDown={(e) => e.stopPropagation()}>
          <BigButton onClick={again} ariaLabel="Again">
            🔁 🦌
          </BigButton>
        </motion.div>
      )}
      {/* What was just said, for Dad: tap to hear it again. */}
      {!story && (
        <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 30 }}>
          <AnimatePresence mode="popLayout">
            <motion.button
              key={lineText(say)}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              style={PILL}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => void speak(say)}
            >
              🔊 {lineText(say)}
            </motion.button>
          </AnimatePresence>
        </div>
      )}
      {story && <StoryBeat lines={B.story} friend={<Maple height="100%" />} onDone={endStory} />}
    </div>
  )
}

// ---------------------------------------------------------------- pieces of the scene

/** A painted piece standing on (x, y): its feet there, `h` tall (or `w` wide). */
function Sprite({ pic, x = 0, y = 0, h, w }: { pic: Pic; x?: number; y?: number; h?: number; w?: number }) {
  const hh = h ?? (w ?? 100) / pic.aspect
  const ww = w ?? hh * pic.aspect
  return <image href={pic.src} x={x - ww / 2} y={y - hh} width={ww} height={hh} />
}

/** A photo from the wildlife camera: the family on the bridge's grass, as it crossed. */
function Photo({ shot }: { shot: Snapshot }) {
  const xs = shot.pts.map((p) => p[1])
  const ys = shot.pts.map((p) => p[2])
  // Everyone in the frame, padded out to the photo's 4:3.
  let x0 = Math.min(...xs) - 120
  let x1 = Math.max(...xs) + 150
  let y0 = Math.min(...ys) - 170
  let y1 = Math.max(...ys) + 40
  const w = Math.max(x1 - x0, ((y1 - y0) * 4) / 3)
  const h = (w * 3) / 4
  ;[x0, x1] = [(x0 + x1) / 2 - w / 2, (x0 + x1) / 2 + w / 2]
  ;[y0, y1] = [y1 - h, y1]
  const order = [...shot.pts].sort((a, b) => a[2] - b[2])
  return (
    <svg viewBox={`${x0} ${y0} ${w} ${h}`} style={{ width: '100%', aspectRatio: '4 / 3', display: 'block', borderRadius: 6, background: '#BFE3F7' }}>
      <image href={ART.mountains.src} x={x0 - w * 0.1} y={y1 - 70 - w * 0.3} width={w * 1.2} height={w * 0.36} preserveAspectRatio="none" />
      <rect x={x0} y={y1 - 70} width={w} height={200} fill="#8CCB72" />
      {order.map(([kind, x, y, dir], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${dir} 1)`}>
          <Critter kind={kind} />
        </g>
      ))}
    </svg>
  )
}

/** The scene's fixed shapes for this stage (the road's perspective, the fences, the bridge), worked out once. */
function useScene(st: StageDef) {
  return useMemo(() => {
    const r = rng(st.w * 7 + st.h)
    const rc = st.road.x
    const bot = st.h + 400
    const yAt = (t: number) => st.back + (bot - st.back) * Math.pow(t, 1.7)
    // The center line's dashes and the road's edge lines, in perspective.
    const dashes: string[] = []
    for (let t = 0.02; t < 1; t += 0.06) {
      const a = yAt(t)
      const b = yAt(t + 0.03)
      const wa = halfCut(st, a) * 0.03
      const wb = halfCut(st, b) * 0.03
      dashes.push(`M${rc - wa} ${a} L ${rc + wa} ${a} L ${rc + wb} ${b} L ${rc - wb} ${b} Z`)
    }
    const edges = [-1, 1].map((s) => `M${rc + s * halfCut(st, st.back) * 0.72} ${st.back} L ${rc + s * halfCut(st, bot) * 0.72} ${bot}`)
    const band = (f: number) => `M${rc - halfCut(st, st.back) * f} ${st.back} L ${rc + halfCut(st, st.back) * f} ${st.back} L ${rc + halfCut(st, bot) * f} ${bot} L ${rc - halfCut(st, bot) * f} ${bot} Z`
    const cut = band(1)
    const road = band(0.8)
    // The fences: posts closer together far away.
    const posts: [number, number, number][] = []
    const fences: string[] = []
    for (const s of [-1, 1]) {
      const top: string[] = []
      const midw: string[] = []
      for (let t = 0; t <= 1.0001; t += 1 / 16) {
        const y = yAt(t)
        const x = rc + s * (halfCut(st, y) + 8)
        const h = 44 * depth(st, y)
        posts.push([x, y, h])
        top.push(`${x.toFixed(1)} ${(y - h).toFixed(1)}`)
        midw.push(`${x.toFixed(1)} ${(y - h * 0.5).toFixed(1)}`)
      }
      fences.push(`M${top.join(' L ')}`, `M${midw.join(' L ')}`)
    }
    // The bridge: the walkway's top and front edges hump up in the middle; the concrete face spans the cut below it.
    const [l, rr] = deckEnds(st)
    const hump = (x: number) => {
      const p = (x - l) / (rr - l)
      return p <= 0 || p >= 1 ? 0 : st.hump * Math.sin(p * Math.PI)
    }
    const xs: number[] = []
    for (let x = l; x <= rr + 0.1; x += (rr - l) / 24) xs.push(x)
    const [d0, d1] = st.deck
    const deck = `M${l - 30} ${d1} Q ${l - 50} ${(d0 + d1) / 2} ${l - 10} ${d0} ` + xs.map((x) => `L ${x.toFixed(1)} ${(d0 - hump(x)).toFixed(1)}`).join(' ') + ` Q ${rr + 50} ${(d0 + d1) / 2} ${rr + 30} ${d1} ` + [...xs].reverse().map((x) => `L ${x.toFixed(1)} ${(d1 - hump(x)).toFixed(1)}`).join(' ') + ' Z'
    const fl = rc - halfCut(st, d1) - FENCE_GAP - 14
    const fr = rc + halfCut(st, d1) + FENCE_GAP + 14
    const fxs = xs.filter((x) => x >= fl && x <= fr)
    const faceH = 48
    const face = `M${fl} ${d1 - hump(fl)} ` + fxs.map((x) => `L ${x.toFixed(1)} ${(d1 - hump(x)).toFixed(1)}`).join(' ') + ` L ${fr} ${d1 - hump(fr)} L ${fr} ${d1 + faceH} L ${fl} ${d1 + faceH} Z`
    const ah = halfCut(st, d1 + faceH) * 0.8
    // The dark opening the highway runs through, and the stone blocks of the face either side of it.
    const arch = `M${rc - ah} ${d1 + faceH} L ${rc - ah} ${d1 + faceH * 0.55} Q ${rc - ah} ${d1 + 8} ${rc} ${d1 + 8} Q ${rc + ah} ${d1 + 8} ${rc + ah} ${d1 + faceH * 0.55} L ${rc + ah} ${d1 + faceH} Z`
    const blocks: string[] = []
    for (const side of [-1, 1]) {
      const x0 = side < 0 ? fl + 10 : rc + ah + 8
      const x1 = side < 0 ? rc - ah - 8 : fr - 10
      blocks.push(`M${x0} ${d1 + faceH * 0.5} L ${x1} ${d1 + faceH * 0.5}`)
      for (let x = x0 + 26; x < x1 - 10; x += 52) blocks.push(`M${x} ${d1 + 6 - hump(x)} L ${x} ${d1 + faceH * 0.5}`, `M${x + 26} ${d1 + faceH * 0.5} L ${x + 26} ${d1 + faceH - 2}`)
    }
    // The grassy lip along the walkway's front edge.
    const lip: string[] = []
    for (let x = l - 10; x < rr + 10; x += 30) {
      const y = d1 - hump(x) + 2
      lip.push(`M${x - 18} ${y} q 6 -16 10 -18 q 2 10 6 12 q 6 -14 12 -16 q 0 12 6 22 Z`)
    }
    const shadow = `M${rc - halfCut(st, d1 + faceH)} ${d1 + faceH} L ${rc + halfCut(st, d1 + faceH)} ${d1 + faceH} L ${rc + halfCut(st, d1 + faceH + 40)} ${d1 + faceH + 40} L ${rc - halfCut(st, d1 + faceH + 40)} ${d1 + faceH + 40} Z`
    // Where plants grow: a row of spots along the walkway, back and front by turns.
    const cells: Pt[] = []
    for (let i = 0; i < N_CELLS; i++) {
      const x = l + ((i + 0.5) / N_CELLS) * (rr - l)
      const y = (i % 2 ? d0 + 16 : d1 - 10) - hump(x)
      cells.push([Math.round(x), Math.round(y)])
    }
    // The boulders of the rocky way.
    const rk = st.rocks
    const boulders: [number, number, number][] = [
      [rk.x - rk.rx * 0.55, rk.y + rk.ry * 0.1, rk.ry * 0.95],
      [rk.x + rk.rx * 0.05, rk.y - rk.ry * 0.35, rk.ry * 1.05],
      [rk.x + rk.rx * 0.45, rk.y + rk.ry * 0.3, rk.ry * 0.85],
      [rk.x - rk.rx * 0.1, rk.y + rk.ry * 0.55, rk.ry * 0.7],
    ]
    // Flowers in the meadow (a few painted clumps, the rest dots), ferns on the forest floor (kept off the road and the
    // rocks).
    const dots: [number, number, string][] = []
    const flowers: [number, number, number][] = []
    const ferns: Pt[] = []
    for (let i = 0; i < 60; i++) {
      const y = st.back + 30 + r() * (st.h - st.back + 200)
      const right = i % 2 === 0
      const edge = halfCut(st, y) + 50
      const x = right ? rc + edge + r() * (st.w * 0.55) : rc - edge - r() * (st.w * 0.55)
      if (Math.abs(((x - rk.x) / (rk.rx + 30)) ** 2 + ((y - rk.y) / (rk.ry + 30)) ** 2) < 1) continue
      if (right && i % 6 === 0) flowers.push([Math.round(x), Math.round(y), Math.round(40 + 20 * depth(st, y))])
      else if (right) dots.push([Math.round(x), Math.round(y), ['#F48FB1', '#FFF7F0', '#FFE07A', '#C7B3F0'][i % 4]])
      else if (i % 4 === 1) ferns.push([Math.round(x), Math.round(y)])
    }
    // The far forest along the treeline, with a gap for the road and for Banff town.
    const far: [number, number][] = []
    for (let x = -2000; x < st.w + 2000; x += 34) {
      if (Math.abs(x - rc) < halfCut(st, st.back) + 10) continue
      if (x > st.town.x - 30 && x < st.town.x + st.town.w + 30) continue
      far.push([x, 46 + 26 * Math.abs(Math.sin(x * 0.07)) + 12 * Math.sin(x * 0.013)])
    }
    const houses: [number, number, number, string][] = []
    for (let x = st.town.x; x < st.town.x + st.town.w - 20; x += 40 + Math.round(r() * 16)) houses.push([x, 26 + Math.round(r() * 8), 20 + Math.round(r() * 12), ['#FFF2D6', '#F6D6E2', '#DDEBF8', '#E8F2D8'][houses.length % 4]])
    const clouds: [number, number, number][] = [
      [st.w * 0.12, st.back * 0.2, 1.1],
      [st.w * 0.55, st.back * 0.12, 0.8],
      [st.w * 0.85, st.back * 0.32, 1],
    ]
    // More peaks past the painted range, for very wide screens.
    const m = mountainsBox(st)
    const extraPeaks: Pt[] = []
    for (let x = m.x - 120; x > -1400; x -= 300) extraPeaks.push([x, m.y + m.h * (0.25 + 0.2 * Math.abs(Math.sin(x)))])
    for (let x = m.x + m.w + 120; x < st.w + 1400; x += 300) extraPeaks.push([x, m.y + m.h * (0.25 + 0.2 * Math.abs(Math.sin(x)))])
    // Grass tufts along the stage's front edge (and below it), off the road.
    const tufts: Pt[] = []
    for (let x = -1400; x < st.w + 1400; x += 110 + Math.round(r() * 60)) {
      const y = st.h - 6 + Math.round(r() * 30)
      if (Math.abs(x - rc) > halfCut(st, y) + 40) tufts.push([x, y])
    }
    return { dashes, edges, cut, road, posts, fences, deck, face, arch, blocks, lip, shadow, cells, boulders, dots, flowers, ferns, far, houses, clouds, extraPeaks, tufts }
  }, [st])
}

const SVG_STYLE = { position: 'absolute' as const, inset: 0, width: '100%', height: '100%', display: 'block' }

const CSS = `
.bridge-hint { animation: bridge-hint 1s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes bridge-hint { 0%,100% { transform: scale(1) } 50% { transform: scale(1.15) } }
`

const AGAIN = { position: 'absolute' as const, zIndex: 31, right: 'calc(var(--safe-right, 0px) + 16px)', bottom: 'calc(var(--safe-bottom) + 70px)', pointerEvents: 'auto' as const }

const ALBUM = {
  position: 'absolute' as const,
  zIndex: 29,
  left: 0,
  right: 0,
  top: 'calc(var(--top-clear) + 52px)',
  display: 'flex',
  justifyContent: 'center',
  gap: 'clamp(8px, 2vmin, 20px)',
  padding: '0 16px',
  pointerEvents: 'none' as const,
}
const PHOTO = {
  width: 'clamp(96px, 22vmin, 210px)',
  background: '#FFFFFF',
  borderRadius: 10,
  padding: 'clamp(5px, 1vmin, 10px) clamp(5px, 1vmin, 10px) 6px',
  boxShadow: 'var(--shadow)',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  gap: 4,
}

const TALLY = {
  position: 'absolute' as const,
  zIndex: 30,
  right: 'calc(var(--safe-right, 0px) + 12px)',
  top: 'calc(var(--top-clear) + 8px)',
  display: 'flex',
  gap: 4,
  pointerEvents: 'none' as const,
}
const CHIP = {
  width: 'clamp(26px, 4vmin, 36px)',
  height: 'clamp(26px, 4vmin, 36px)',
  borderRadius: 999,
  background: 'rgba(255,255,255,.85)',
  display: 'grid',
  placeItems: 'center',
  fontSize: 'clamp(14px, 2.4vmin, 20px)',
  fontWeight: 700,
  color: 'var(--lavender-dark)',
}

const PILL = {
  background: 'rgba(255,255,255,.92)',
  color: 'var(--ink)',
  borderRadius: 999,
  padding: '8px 20px',
  fontSize: 'clamp(16px, 2.4vmin, 22px)',
  fontWeight: 600,
  boxShadow: 'var(--shadow)',
  textAlign: 'center' as const,
  maxWidth: '100%',
  border: 'none',
  font: 'inherit',
  pointerEvents: 'auto' as const,
}

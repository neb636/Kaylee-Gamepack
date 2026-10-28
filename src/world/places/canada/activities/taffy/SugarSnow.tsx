// Sugar Snow (plan: planning/around-the-world/canada.html): maple taffy on snow (tire d'érable) at a Quebec sugar shack
// in winter. Maple's cousins are coming for a treat (the story beat). One verb, pour, that gets richer three times, and
// the stick that rolls up what she poured:
//   pour    tip the pot over the tray of snow: a little tilt pours a thin golden line, more tilt gushes, and standing
//           still makes a puddle. Wherever the pot goes the syrup draws on the snow (perfect-freehand strokes, as wide as
//           the syrup that fell there), steams, and sets lighter. Then she drags the stick along her line and it winds
//           up into a lollipop, which Maple crunches. Three of them and Maple brings out her picture cards.
//   shapes  a card with a shape (a heart, a maple leaf, a loop, a K) and the same shape pressed into the snow: pour over
//           it and it sparkles. Any shape is yummy.
//   orders  the animals line up across the table, each with a bubble showing the lollipop they want, at its real size:
//           the chipmunk a tiny one, Maple's cousin a medium one, the owl a swirl, the moose a GIANT one. She drags
//           each finished lollipop to whoever she likes; their bubble fills (small ones add up, so nobody waits forever).
//   share   everyone at the table has a lollipop and they all crunch at once.
// The tree's tap fills the pot (sap → syrup), the roof drops fresh snow over the melt marks, the owl turns its head
// right round, a red squirrel sneaks in to lick the set syrup, a chickadee lands on a stick left lying.
// Two ways to tip the pot (`?tip=hold`: it tips more the longer she holds it; `?tip=lead`: it trails her finger and
// tips by how far she pulls ahead). The pour, the setting and the roll are knobs (?feel=1). 2D only: SVG written every
// frame, no three.js. One camera: straight down at the table (the props are drawn from above; the animals lean over
// the tray's far edge and look up at her). Maple is her live puppet; the others are code-drawn faces that blink, chomp
// and puff their cheeks. Sparkle speaks when something new starts and when she's stuck; the friends react in their own
// voices (lines.ts, L.taffy). A short line at the bottom shows what's said, for Dad.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent, type Ref } from 'react'
import { BigButton, bigCelebration, burst, say, sounds, useElementSize, type Line, type PuppetHandle } from '../../../../../sdk'
import { knobs, watch } from '../../../../kit/knobs'
import { useSections } from '../../../../kit/sections'
import { noise, sfx, tone } from '../../../../kit/sfx'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { meet } from '../../book/met'
import type { AnimalId as BookId } from '../../book/animals'
import { L } from '../../lines'
import { Maple } from '../../puppets/Maple'
import type { CanadaActivityProps } from '../props'
import potImg from '../../assets/taffy-pot.webp'
import { Bucket, Crate, Drips, Post, ROOF_CHIMNEY, Roof, Sparkles, Stove, Tray, Tree, Yard } from './Scenery'
import { CANADA_COLORS } from '../../characters/looks'
import TAFFY_SECTIONS, { type TaffySection } from './sections'
import { LOOKS, ORDER_IDS, SHAPE_IDS, TALL, WANTS, WIDE, sampleShape, shapePath, type AnimalId, type Look, type OrderId, type Pt, type ShapeId, type StageDef } from './stage'
import { drawPiece, isGone, isSet, left, newPiece, puddleVol, removePiece, syrupColor, type Layers, type Piece } from './syrup'

const T = L.taffy
/** Who each animal at the table is in Maple's book. */
const BOOK: Record<AnimalId, BookId> = { maple: 'beaver', cousin: 'beaver', chipmunk: 'chipmunk', owl: 'snowy-owl', moose: 'moose' }
/** Their reactions, in their own voices: a hello when poked, more please, full, and far too big. */
const VOICE: Record<OrderId, { hi: Line; yum: Line; full: Line; big?: Line }> = {
  chipmunk: { hi: T.chipHi, yum: T.chipYum, full: T.chipFull, big: T.chipBig },
  cousin: { hi: T.cousinHi, yum: T.cousinYum, full: T.cousinFull },
  owl: { hi: T.owlHi, yum: T.owlYum, full: T.owlFull },
  moose: { hi: T.mooseHi, yum: T.mooseYum, full: T.mooseFull },
}
/** Maple's puppet acts out what the code animals do with their faces. */
type AnimKind = 'hop' | 'wiggle' | 'chomp' | 'spin' | 'puff' | 'squint' | 'wave' | 'slap'
const MAPLE_ACT: Record<AnimKind, string> = { hop: 'hop', wiggle: 'wiggle', chomp: 'chomp', spin: 'hop', puff: 'wiggle', squint: 'wiggle', wave: 'wave', slap: 'slap' }
/** Maple's puppet: its 500-unit box is drawn this big (stage units), with her head's middle on the animal's spot. */
const MAPLE_BOX = 336
const MAPLE_HEAD: Pt = [250, 186]

const FILE = 'src/world/places/canada/activities/taffy/SugarSnow.tsx'
/** Sizes are stage units (the wide stage is 1600 x 1000; on an iPad a stage unit is about 0.7 px). Syrup is measured
 *  in lollipops: 1 is the syrup in a medium one. */
const TIP = knobs('taffyTip', 'Tip the pot', FILE, {
  tipIn: { value: 1.4, min: 0.2, max: 6, step: 0.1, label: 'Tips over', unit: '/s', note: 'hold: how fast the pot tips further while she holds it (1 = all the way in a second)' },
  tipOut: { value: 4, min: 0.5, max: 12, step: 0.5, label: 'Rights itself', unit: '/s', note: 'how fast the pot tips back up when she lets go' },
  start: { value: 0.12, min: 0, max: 0.6, step: 0.02, label: 'Pours from', note: 'how far it has to tip before any syrup comes out' },
  glide: { value: 26, min: 4, max: 60, step: 1, label: 'Pot follows', unit: '/s', note: 'hold: how tightly the spout follows her finger' },
  lag: { value: 6, min: 1, max: 20, step: 0.5, label: 'Lead: pot trails', unit: '/s', note: 'lead: how slowly the pot follows (slower = it tips more when she moves)' },
  leadFull: { value: 120, min: 30, max: 300, step: 5, label: 'Lead: full tip at', unit: 'u', note: 'lead: how far ahead her finger pulls to tip it all the way' },
  leadMin: { value: 0.3, min: 0, max: 1, step: 0.05, label: 'Lead: tip when still', note: 'lead: how tipped it stays while she holds it still' },
})
const FLOW = knobs('taffyFlow', 'Syrup flow', FILE, {
  max: { value: 1.3, min: 0.2, max: 5, step: 0.05, label: 'Gush', unit: 'lolly/s', note: 'how much pours at full tilt' },
  curve: { value: 1.5, min: 0.5, max: 4, step: 0.1, label: 'Tilt curve', note: '1 = flow grows evenly with the tilt; higher = a long thin trickle, then a gush' },
  wMin: { value: 10, min: 2, max: 40, step: 1, label: 'Thinnest line', unit: 'u' },
  wMax: { value: 72, min: 30, max: 160, step: 2, label: 'Widest line', unit: 'u', note: 'syrup beyond this pools into a puddle' },
  puddle: { value: 190, min: 60, max: 400, step: 5, label: 'Biggest puddle', unit: 'u', note: 'radius' },
  spacing: { value: 6, min: 2, max: 30, step: 1, label: 'Point spacing', unit: 'u' },
  smoothing: { value: 0.5, min: 0, max: 1, step: 0.05, label: 'Smoothing', note: "perfect-freehand: how round the line's edge is" },
  streamline: { value: 0.35, min: 0, max: 0.95, step: 0.05, label: 'Streamline', note: 'perfect-freehand: how much the line evens out a wobbly finger' },
  thinning: { value: 1, min: 0, max: 1, step: 0.05, label: 'Width follows syrup', note: '1 = each point is exactly as wide as the syrup that fell there; 0 = an even line' },
  potHolds: { value: 14, min: 2, max: 60, step: 1, label: 'Pot holds', unit: 'lolly' },
  sap: { value: 4, min: 1, max: 20, step: 0.5, label: 'Sap per tap', unit: 'lolly', note: 'how much a tap on the maple tree adds to the pot' },
})
const ROLL = knobs('taffyRoll', 'Set and roll', FILE, {
  set: { value: 2.2, min: 0.2, max: 8, step: 0.1, label: 'Sets in', unit: 's', note: 'how long it steams before it can be rolled' },
  steam: { value: 1, min: 0, max: 3, step: 0.1, label: 'Steam' },
  reach: { value: 46, min: 10, max: 140, step: 2, label: 'Stick reach', unit: 'u', note: 'how close to the line the stick has to pass to pick it up' },
  puddleRate: { value: 2.6, min: 0.3, max: 12, step: 0.1, label: 'Puddle rolls up', unit: 'lolly/s', note: 'how fast a puddle winds on while the stick is on it' },
  finish: { value: 0.3, min: 0, max: 0.9, step: 0.05, label: 'Slurps the rest at', note: 'when she lets go with less than this share left, the rest winds on by itself' },
  ball: { value: 36, min: 15, max: 80, step: 1, label: 'Lollipop size', unit: 'u', note: 'radius of a medium lollipop (bigger ones grow as the square root)' },
  unit: { value: 12000, min: 3000, max: 40000, step: 500, label: 'One lollipop of syrup', unit: 'u²', note: 'how much syrup makes a medium lollipop (a 500 u line, 24 u wide)' },
  giant: { value: 5, min: 2, max: 20, step: 0.5, label: 'Too big for Maple', unit: 'lolly', note: 'from this size Maple can’t fit it, and the moose eats it in one bite' },
  swirl: { value: 1.5, min: 0.5, max: 4, step: 0.1, label: 'Swirl from', unit: 'turns', note: 'how many times a pour turns on itself to count as a swirl (the owl wants one)' },
  done: { value: 0.8, min: 0.3, max: 1.5, step: 0.05, label: 'Order full at', note: "share of an animal's wish that fills it" },
})

const POT_R = 84
const STICK = 120
const UNIT = () => ROLL.unit
const ballR = (vol: number) => ROLL.ball * Math.sqrt(Math.max(0, vol) / UNIT())

const SAY: Record<TaffySection, string> = {
  story: "🍁 Maple's cousins are coming!",
  pour: '🍯 Tip the pot onto the snow',
  shapes: '💗 Pour a shape!',
  orders: '🍭 Who wants which size?',
  share: '🎉 Everybody crunch!',
}
const SHAPE_NAME: Record<ShapeId, string> = { heart: 'A heart', leaf: 'A maple leaf', loop: 'A loop', k: 'A K' }
/** How many lollipops each section starts with (the little sticks along the tray). */
const START_MADE: Record<TaffySection, number> = { story: 0, pour: 0, shapes: 3, orders: 6, share: 10 }

const ease = (p: number) => (p < 0 ? 0 : p > 1 ? 1 : p * p * (3 - 2 * p))
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
const NS = 'http://www.w3.org/2000/svg'

// ---------------------------------------------------------------- the runtime (plain objects, written every frame)

type LollyState = 'roll' | 'lying' | 'ready' | 'drag' | 'fly' | 'eat'
interface Lolly {
  vol: number
  turn: number
  x: number
  y: number
  /** Where a finished one stands in the snow, waiting to be given (orders). */
  home: Pt
  state: LollyState
  rot: number
  touched: Set<Piece>
  fly: { x0: number; y0: number; t0: number; dur: number; to: AnimalId; bump?: boolean } | null
  eatT: number
  /** Who's eating it, and how many bites so far. */
  by: AnimalId | null
  bites: number
  eatDur: number
  /** When it popped (finished): a little bounce. */
  popT: number
  /** One handed out at the end (share): it doesn't count as one she made. */
  gift: boolean
  still: number
  el: SVGGElement
  ball: SVGGElement
}
interface Animal {
  id: AnimalId
  x: number
  y: number
  look: Look
  anim: { kind: AnimKind; t0: number; dur: number; played?: boolean } | null
  fill: number
  done: boolean
  /** A silly overfill: puffed-out cheeks for a while. */
  puffed: number
  shown: boolean
  els: { root: SVGGElement; body: SVGGElement | null; paws: SVGGElement | null; mouth: SVGEllipseElement | null; cheeks: SVGGElement | null; head: SVGGElement | null; meter: SVGCircleElement | null; bubble: SVGGElement | null; eyes: SVGElement[]; happy: SVGElement | null }
}
interface Puff {
  el: SVGCircleElement
  x: number
  y: number
  t: number
  life: number
  r: number
  vy: number
}

interface Events {
  section: (s: TaffySection, state: { made: number; fed?: string }) => void
  fed: (fed: string, made: number) => void
  say: (text: string) => void
  share: () => void
  /** Speak a line (Sparkle's or a friend's); `queue` waits for what's being said. */
  talk: (line: Line, queue?: boolean) => void
  /** The payoff has played: the stamp. */
  done: () => void
}

class TaffyWorld {
  stage: StageDef
  section: TaffySection
  tipMode: 'hold' | 'lead'
  made: number
  sectionMade = 0
  pieces: Piece[] = []
  layers: Layers
  /** Maple's puppet (set by React). */
  maple: PuppetHandle | null = null
  /** When each once-only or rate-limited line was last said. */
  talked = new Map<string, number>()
  crunches = 0
  /** The section's first line has been said (after the story). */
  started = false
  idleHinted = false
  pot = { x: 0, y: 0, sx: 0, sy: 0, held: false, tilt: 0, level: 0, angle: Math.PI / 2, piece: null as Piece | null, last: null as Pt | null, acc: 0, wobble: -9, flow: 0, width: 0 }
  lollies: Lolly[] = []
  animals = new Map<AnimalId, Animal>()
  finger: { id: number; x: number; y: number; sx: number; sy: number; t0: number; tl: number; moved: number; mode: 'pot' | 'stick' | 'give' | 'tap'; lolly: Lolly | null; px: number; py: number } | null = null
  speed = 0
  puffs: Puff[] = []
  flakes: { el: SVGCircleElement; x: number; y: number; vy: number; ph: number }[] = []
  snowfall = -9
  now = 0
  lastTouch = 0
  steamAcc = 0
  smokeAt = 2
  owlSpin = -9
  squirrel = { state: 'off' as 'off' | 'in' | 'lick' | 'out', x: 0, y: 0, x0: 0, y0: 0, tx: 0, ty: 0, t: 0, next: 12, ate: 0 }
  bird = { on: null as Lolly | null, t: 0, flyT: -9, x: 0, y: 0 }
  shape = { i: 0, guide: [] as Pt[], matched: false, checkAt: 0 }
  bucket = 0.3
  drips: { el: SVGCircleElement; t: number }[] = []
  ended = false
  lastSay = ''
  vb = { x: 0, y: 0, w: 1600, h: 1000 }
  els: Record<string, Element | null> = {}
  /** Set when the scene goes away (a new section, or React trying the effect twice): its timers do nothing then. */
  dead = false
  private later(f: () => void, ms: number) {
    setTimeout(() => !this.dead && f(), ms)
  }

  /** Says a line. With a key: once only (every = 0), or at most every `every` seconds. */
  private talk(line: Line, key?: string, every = 0, queue = false) {
    if (key) {
      const at = this.talked.get(key)
      if (at !== undefined && (every <= 0 || this.now - at < every)) return
      this.talked.set(key, this.now)
    }
    this.ev.talk(line, queue)
  }

  /** The play begins (after the story, or straight from a section link): Sparkle says what's new, once. */
  start() {
    if (this.started) return
    this.started = true
    this.lastTouch = this.now
    if (this.section === 'pour') this.talk(T.pour)
    else if (this.section === 'shapes') {
      this.talk(T.shapes)
      this.talk(T.card[SHAPE_IDS[this.shape.i % SHAPE_IDS.length]], undefined, 0, true)
    } else if (this.section === 'orders') this.talk(T.orders)
  }

  /** She poked or fed an animal: the first time, it goes in Maple's book. */
  private met(id: AnimalId) {
    meet(BOOK[id])
  }

  constructor(
    private svg: SVGSVGElement,
    stage: StageDef,
    section: TaffySection,
    made: number,
    fed: string[],
    tip: 'hold' | 'lead',
    private ev: Events,
  ) {
    this.stage = stage
    this.section = section
    this.made = made
    this.tipMode = tip
    const q = <T extends Element>(k: string) => svg.querySelector(`[data-k="${k}"]`) as T
    const qa = <T extends Element>(k: string) => [...svg.querySelectorAll(`[data-k="${k}"]`)] as T[]
    this.layers = { dent: q('dents'), ink: q('ink'), fill: q('fill'), gloss: q('gloss') }
    for (const k of ['pot-gloss', 'pot', 'pot-body', 'pot-syrup', 'pot-stream', 'steam', 'fx', 'lollies', 'hint', 'tally', 'guide', 'guide-glow', 'squirrel', 'squirrel-body', 'bird', 'owl-head', 'bucket-sap', 'smoke', 'drips']) this.els[k] = q(k)
    for (const el of qa<SVGCircleElement>('flake')) this.flakes.push({ el, x: Math.random(), y: Math.random(), vy: 0.7 + Math.random() * 0.8, ph: Math.random() * 6 })
    for (const el of qa<SVGCircleElement>('puff')) this.puffs.push({ el, x: 0, y: 0, t: 9, life: 1, r: 10, vy: 0 })
    for (const el of qa<SVGCircleElement>('drip')) this.drips.push({ el, t: 9 })
    for (const id of ['maple', ...ORDER_IDS] as AnimalId[]) {
      const root = q<SVGGElement>(`a-${id}`)
      if (!root) continue
      const wants = id !== 'maple' ? WANTS[id as OrderId] : null
      const isFed = fed.includes(id) || section === 'share'
      this.animals.set(id, {
        id,
        x: 0,
        y: 0,
        look: LOOKS[id],
        anim: null,
        fill: isFed && wants ? wants.size : 0,
        done: isFed,
        puffed: 0,
        shown: true,
        els: {
          root,
          body: q(`a-${id}-body`),
          paws: q(`a-${id}-paws`),
          mouth: q(`a-${id}-mouth`),
          cheeks: q(`a-${id}-cheeks`),
          head: q(`a-${id}-head`),
          meter: q(`a-${id}-meter`),
          bubble: q(`a-${id}-bubble`),
          eyes: qa(`a-${id}-eye`),
          happy: q(`a-${id}-happy`),
        },
      })
    }
    this.pot.level = FLOW.potHolds
    this.setStage(stage)
    this.pot.x = this.pot.sx = stage.stove[0]
    this.pot.y = this.pot.sy = stage.stove[1]
    if (section === 'share') this.later(() => this.crunchAll(), 900)
    // An orders link with everyone already full (a reload in the moment before the finale): on to everyone crunching.
    else if (section === 'orders' && ORDER_IDS.every((id) => this.animals.get(id)?.done)) this.later(() => this.ev.section('share', { made }), 1500)
  }

  setStage(stage: StageDef) {
    const moved = this.stage !== stage
    this.stage = stage
    for (const a of this.animals.values()) {
      const [x, y] = this.section === 'pour' || this.section === 'shapes' ? (a.id === 'maple' ? stage.maple : stage.mooseIn) : stage.line[a.id]
      a.x = x
      a.y = y
    }
    // The syrup stays put in the tray's own coordinates when the iPad turns (it's scaled to the new tray).
    if (moved) this.clearTray()
    for (const l of this.lollies) if (l.state === 'ready') l.home = this.readySpot(this.lollies.filter((o) => o.state === 'ready').indexOf(l))
    if (this.section === 'shapes') this.newShape(this.shape.i)
    for (const a of this.animals.values()) {
      const off = a.id !== 'maple' ? stage.bubbles[a.id as OrderId] : null
      if (off && a.els.bubble) a.els.bubble.setAttribute('transform', `translate(${off[0]} ${off[1]})`)
    }
    this.drawTally()
  }

  /** Turning the iPad: the tray changes shape, so the snow starts fresh (a greybox shortcut). */
  private clearTray() {
    for (const p of this.pieces) removePiece(p)
    this.pieces = []
    this.pot.piece = null
    for (const l of [...this.lollies]) if (l.state === 'roll' || l.state === 'lying') this.dropLolly(l)
  }

  // -------------------------------------------------------------- her finger

  toStage(e: { clientX: number; clientY: number }): Pt {
    const m = this.svg.getScreenCTM()
    if (!m) return [0, 0]
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    return [p.x, p.y]
  }

  inSnow(x: number, y: number, pad = 0) {
    const s = this.stage.snow
    return x > s.x - pad && x < s.x + s.w + pad && y > s.y - pad && y < s.y + s.h + pad
  }

  down(e: RPointerEvent) {
    if (this.finger) return
    const [x, y] = this.toStage(e)
    this.lastTouch = this.now
    const f = { id: e.pointerId, x, y, sx: e.clientX, sy: e.clientY, t0: this.now, tl: this.now, moved: 0, mode: 'tap' as 'pot' | 'stick' | 'give' | 'tap', lolly: null as Lolly | null, px: x, py: y }
    this.finger = f
    this.speed = 0
    // 1. A finished lollipop waiting to be given, or the stick she left lying with taffy on it.
    const near = this.lollies.filter((l) => l.state === 'ready' || l.state === 'lying').sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0]
    if (near && this.hitLolly(near, x, y)) {
      if (this.bird.on === near) meet('chickadee')
      this.scareBird(near)
      f.lolly = near
      if (near.state === 'ready') {
        f.mode = 'give'
        near.state = 'drag'
        sounds.pickup()
      } else {
        f.mode = 'stick'
        near.state = 'roll'
        near.x = x
        near.y = y
      }
      return
    }
    // 2. The pot.
    if (Math.hypot(this.pot.x - x, this.pot.y - y) < POT_R + 30) {
      this.grabPot(f)
      return
    }
    // 3. Syrup in the tray: the stick comes to her finger.
    if (this.inSnow(x, y) && this.syrupAt(x, y)) {
      f.mode = 'stick'
      f.lolly = this.takeStick(x, y)
      return
    }
    // 4. The jar of sticks.
    const [jx, jy] = this.stage.jar
    if (Math.hypot(jx - x, jy - y) < 90) {
      f.mode = 'stick'
      f.lolly = this.takeStick(x, y)
      sounds.pickup()
      return
    }
    // 5. Things to poke (decided when she lifts, if it was a tap).
    if (this.pokeTarget(x, y)) return
    // 6. Anywhere else on the snow: the pot comes to her finger and pours there.
    if (this.inSnow(x, y)) this.grabPot(f)
  }

  private grabPot(f: NonNullable<TaffyWorld['finger']>) {
    f.mode = 'pot'
    this.pot.held = true
    this.pot.last = null
    this.pot.acc = 0
    this.pot.piece = null
    sounds.pickup()
  }

  move(e: RPointerEvent) {
    const f = this.finger
    if (!f || f.id !== e.pointerId) return
    const [x, y] = this.toStage(e)
    f.moved = Math.max(f.moved, Math.hypot(e.clientX - f.sx, e.clientY - f.sy))
    f.x = x
    f.y = y
    this.lastTouch = this.now
  }

  up(e: RPointerEvent) {
    const f = this.finger
    if (!f || f.id !== e.pointerId) return
    this.finger = null
    this.speed = 0
    this.lastTouch = this.now
    const tap = f.moved < 14 && this.now - f.t0 < 0.45
    if (f.mode === 'pot') {
      this.pot.held = false
      this.endPour()
      if (tap) this.pot.wobble = this.now
    } else if (f.mode === 'stick' && f.lolly) this.letGoStick(f.lolly)
    else if (f.mode === 'give' && f.lolly) this.give(f.lolly)
    else if (f.mode === 'tap' && tap) this.poke(f.x, f.y)
  }

  // -------------------------------------------------------------- pouring

  private endPour() {
    const p = this.pot.piece
    if (p) {
      p.endAt = this.now
      p.setAt = this.now + ROLL.set
      if (p.pts.length + p.puddles.length === 0) {
        removePiece(p)
        this.pieces = this.pieces.filter((o) => o !== p)
      }
    }
    this.pot.piece = null
    this.pot.last = null
    this.pot.acc = 0
  }

  private tickPot(dt: number) {
    const pot = this.pot
    const f = this.finger
    const st = this.stage
    // Where the spout wants to be: under her finger while she holds it, on the stove otherwise.
    const holding = pot.held && f && f.mode === 'pot'
    const tx = holding ? f.x : st.stove[0]
    const ty = holding ? f.y : st.stove[1] + POT_R + 22
    const rate = holding ? (this.tipMode === 'lead' ? TIP.lag : TIP.glide) : 9
    const k = 1 - Math.exp(-rate * dt)
    const ox = pot.sx
    const oy = pot.sy
    pot.sx += (tx - pot.sx) * k
    pot.sy += (ty - pot.sy) * k
    const v = Math.hypot(pot.sx - ox, pot.sy - oy) / Math.max(dt, 1e-3)
    this.speed = this.speed * 0.8 + v * 0.2
    // The tilt.
    let want = 0
    if (holding) {
      if (this.tipMode === 'lead') want = clamp(TIP.leadMin + Math.hypot(tx - pot.sx, ty - pot.sy) / TIP.leadFull, 0, 1)
      else want = 1
    }
    const up = want > pot.tilt
    const r = up ? (this.tipMode === 'lead' ? 10 : TIP.tipIn) : TIP.tipOut
    pot.tilt = up ? Math.min(want, pot.tilt + r * dt) : Math.max(want, pot.tilt - r * dt)
    // The spout points down at the snow; it swings a little with the pot's motion, for life.
    const vx = (pot.sx - ox) / Math.max(dt, 1e-3)
    const ang = Math.PI / 2 - clamp(vx / 2400, -0.3, 0.3)
    pot.angle += (ang - pot.angle) * Math.min(1, dt * 8)
    const reach = POT_R + 22
    pot.x = pot.sx - Math.cos(pot.angle) * reach
    pot.y = pot.sy - Math.sin(pot.angle) * reach
    // The syrup.
    const over = holding && this.inSnow(pot.sx, pot.sy)
    const level = pot.level > 0
    const t = clamp((pot.tilt - TIP.start) / Math.max(0.01, 1 - TIP.start), 0, 1)
    pot.flow = over && level && pot.tilt > TIP.start ? FLOW.max * Math.pow(t, FLOW.curve) : 0
    if (pot.flow > 0) this.deposit(pot.flow * UNIT() * dt)
    else if (pot.piece) this.endPour()
    if (holding && pot.tilt > TIP.start && !level) {
      if (Math.random() < dt * 3) tone(500, 300, 0.08, 0.05, 'sine')
      this.talk(T.empty, 'empty', 12)
    }
  }

  /** `dv` square units of syrup fall at the spout this frame. */
  private deposit(dv: number) {
    const pot = this.pot
    const x = pot.sx
    const y = pot.sy
    pot.level = Math.max(0, pot.level - dv / UNIT())
    let p = pot.piece
    if (!p) {
      p = newPiece(this.layers)
      this.pieces.push(p)
      pot.piece = p
      pot.last = null
      pot.acc = 0
    }
    pot.acc += dv
    if (!pot.last) {
      const r = FLOW.wMin / 2
      p.pts.push({ x, y, r, v: pot.acc, eaten: false })
      p.total += pot.acc
      pot.acc = 0
      pot.last = [x, y]
      p.dirty = p.dentDirty = true
      return
    }
    const [lx, ly] = pot.last
    const ds = Math.hypot(x - lx, y - ly)
    if (ds >= FLOW.spacing) {
      let w = pot.acc / ds
      let extra = 0
      if (w > FLOW.wMax) {
        extra = pot.acc - FLOW.wMax * ds
        w = FLOW.wMax
      }
      w = Math.max(FLOW.wMin, w)
      p.pts.push({ x, y, r: w / 2, v: pot.acc - extra, eaten: false })
      p.total += pot.acc - extra
      if (extra > 0) this.pool(p, x, y, extra)
      pot.width = w
      // How much the pour turns on itself (for the owl's swirl).
      const dir = Math.atan2(y - ly, x - lx)
      if (p.lastDir !== null) {
        let d = dir - p.lastDir
        while (d > Math.PI) d -= Math.PI * 2
        while (d < -Math.PI) d += Math.PI * 2
        p.turn += d
      }
      p.lastDir = dir
      pot.last = [x, y]
      pot.acc = 0
      p.dirty = p.dentDirty = true
    } else if (pot.acc > FLOW.wMax * FLOW.spacing) {
      // Standing still: it pools.
      this.pool(p, x, y, pot.acc)
      pot.acc = 0
    }
    if (Math.random() < 0.25) noise(0.09, 0.03, 'highpass', 3500, 5200, 0, 0.7)
  }

  private pool(p: Piece, x: number, y: number, dv: number) {
    let pd = p.puddles.find((q) => !q.eaten && Math.hypot(q.x - x, q.y - y) < Math.max(20, q.r * 0.6))
    if (!pd) {
      // A new puddle starts as just the syrup that fell (it's drawn over the line, so it shows once it's wider).
      pd = { x, y, r: 0, eaten: false }
      p.puddles.push(pd)
    }
    const area = puddleVol(pd) + dv
    const r = Math.min(FLOW.puddle, Math.sqrt(area / Math.PI))
    p.total += Math.PI * r * r - puddleVol(pd)
    pd.r = r
    p.dirty = p.dentDirty = true
    this.pot.width = r * 2
  }

  private syrupAt(x: number, y: number) {
    return this.pieces.some((p) => p.pts.some((q) => !q.eaten && Math.hypot(q.x - x, q.y - y) < q.r + 34) || p.puddles.some((q) => !q.eaten && Math.hypot(q.x - x, q.y - y) < q.r + 20))
  }

  // -------------------------------------------------------------- the stick

  private makeLollyEl(): { el: SVGGElement; ball: SVGGElement } {
    const el = document.createElementNS(NS, 'g') as SVGGElement
    el.innerHTML = `<g class="stick" transform="rotate(52)"><rect x="-6" y="-9" width="${STICK + 8}" height="18" rx="9" fill="#F3E2C0" stroke="#4A3B57" stroke-width="5"/></g><g class="ball"><circle r="1" fill="${syrupColor(1)}" stroke="#4A3B57" stroke-width="5" vector-effect="non-scaling-stroke"/><path d="M0 0 C 0.2 -0.35 0.62 -0.12 0.5 0.25 C 0.38 0.62 -0.3 0.66 -0.56 0.28 C -0.8 -0.1 -0.5 -0.68 0.04 -0.72" fill="none" stroke="#B8742A" stroke-width="4" stroke-linecap="round" vector-effect="non-scaling-stroke"/></g>`
    this.els.lollies?.appendChild(el)
    return { el, ball: el.querySelector('.ball') as SVGGElement }
  }

  /** A clean stick from the jar, into her finger (or the one she left lying, if there is one). */
  private takeStick(x: number, y: number): Lolly {
    const lying = this.lollies.find((l) => l.state === 'lying')
    if (lying) {
      this.scareBird(lying)
      lying.state = 'roll'
      lying.x = x
      lying.y = y
      return lying
    }
    const { el, ball } = this.makeLollyEl()
    const l: Lolly = { vol: 0, turn: 0, x, y, home: [x, y], state: 'roll', rot: 0, touched: new Set(), fly: null, eatT: 0, by: null, bites: -1, eatDur: 1, popT: -9, gift: false, still: 0, el, ball }
    this.lollies.push(l)
    sfx.fwip()
    return l
  }

  private hitLolly(l: Lolly, x: number, y: number) {
    // The ball or anywhere along the stick.
    const a = (52 * Math.PI) / 180
    const ex = l.x + Math.cos(a) * STICK
    const ey = l.y + Math.sin(a) * STICK
    const t = clamp(((x - l.x) * (ex - l.x) + (y - l.y) * (ey - l.y)) / (STICK * STICK), 0, 1)
    const d = Math.hypot(x - (l.x + (ex - l.x) * t), y - (l.y + (ey - l.y) * t))
    return d < Math.max(70, ballR(l.vol) + 30)
  }

  /** While she drags the stick: the set syrup under it winds on. Hot syrup only stretches and hisses. */
  private roll(l: Lolly, dt: number) {
    const reach = Math.max(ROLL.reach, ballR(l.vol) * 0.75)
    let ate = 0
    let hot = false
    for (const p of this.pieces) {
      const set = isSet(p, this.now)
      let hit = false
      for (const q of p.pts) {
        if (q.eaten || Math.hypot(q.x - l.x, q.y - l.y) > reach + q.r * 0.5) continue
        if (!set) {
          hot = true
          break
        }
        q.eaten = true
        ate += q.v
        hit = true
      }
      for (const q of p.puddles) {
        if (q.eaten || Math.hypot(q.x - l.x, q.y - l.y) > q.r + reach * 0.5) continue
        if (!set) {
          hot = true
          continue
        }
        const area = puddleVol(q)
        const dv = Math.min(area, ROLL.puddleRate * UNIT() * dt)
        const r2 = (area - dv) / Math.PI
        if (r2 < 36) {
          q.eaten = true
          ate += area
        } else {
          q.r = Math.sqrt(r2)
          ate += dv
        }
        hit = true
      }
      if (hit) {
        p.dirty = true
        if (!l.touched.has(p)) {
          l.touched.add(p)
          l.turn = Math.max(Math.abs(l.turn), Math.abs(p.turn))
        }
      }
    }
    if (ate > 0) {
      const before = l.vol
      l.vol += ate
      l.rot += (ate / UNIT()) * 900
      const step = Math.floor((l.vol / UNIT()) * 4)
      if (step > Math.floor((before / UNIT()) * 4)) tone(260 + Math.min(step, 16) * 40, 420 + Math.min(step, 16) * 40, 0.12, 0.06, 'triangle')
    }
    if (hot && Math.random() < dt * 6) {
      noise(0.18, 0.05, 'highpass', 3000, 6000)
      this.steamAt(l.x, l.y, 3)
      this.say('♨️ Still hot! Let it set')
      this.talk(T.hot, 'hot', 10)
    }
  }

  private letGoStick(l: Lolly) {
    if (l.vol <= 0) {
      this.dropLolly(l)
      return
    }
    // The pieces it touched, and anything poured over them: if only a little is left, it all winds on by itself.
    const group = new Set(l.touched)
    let grew = true
    while (grew) {
      grew = false
      for (const p of this.pieces) if (!group.has(p) && isSet(p, this.now) && [...group].some((g) => this.overlap(g, p))) (group.add(p), (grew = true))
    }
    const rest = [...group].reduce((s, p) => s + left(p), 0)
    const total = l.vol + rest
    if (rest <= ROLL.finish * total || rest < UNIT() * 0.05) {
      for (const p of group) {
        for (const q of p.pts) q.eaten = true
        for (const q of p.puddles) q.eaten = true
        p.dirty = true
      }
      l.vol += rest
      l.rot += 200
      if (rest > 0) noise(0.25, 0.08, 'bandpass', 900, 2400, 0, 2)
      this.finishLolly(l)
    } else {
      l.state = 'lying'
      l.still = 0
      sounds.place()
    }
  }

  private overlap(a: Piece, b: Piece) {
    const all = (p: Piece) => [...p.pts.filter((q) => !q.eaten), ...p.puddles.filter((q) => !q.eaten)] as { x: number; y: number; r: number }[]
    const bs = all(b)
    return all(a).some((q) => bs.some((o) => Math.hypot(q.x - o.x, q.y - o.y) < q.r + o.r + 4))
  }

  private dropLolly(l: Lolly) {
    l.el.remove()
    this.lollies = this.lollies.filter((o) => o !== l)
    if (this.bird.on === l) this.bird.on = null
  }

  /** A whole lollipop. Lines and shapes: Maple crunches it (the moose takes a giant one). Orders: it stands in the snow
   *  until she gives it to someone. */
  private finishLolly(l: Lolly) {
    sounds.sparkle()
    l.popT = this.now
    if (this.section === 'orders') {
      l.state = 'ready'
      l.home = this.readySpot(this.lollies.filter((o) => o.state === 'ready').length)
      l.still = 0
      this.talk(T.give, 'give')
      return
    }
    const giant = l.vol / UNIT() >= ROLL.giant
    const to: AnimalId = this.section === 'share' ? this.nearestAnimal(l.x, l.y) : 'maple'
    this.flyTo(l, to, giant && to === 'maple')
  }

  private readySpot(i: number): Pt {
    const s = this.stage.snow
    const n = 4
    return [s.x + s.w * (0.18 + (0.64 * (i % n)) / (n - 1)), s.y + s.h - 70 - Math.floor(i / n) * 40]
  }

  private nearestAnimal(x: number, y: number): AnimalId {
    let best: AnimalId = 'maple'
    let bd = Infinity
    for (const a of this.animals.values()) {
      if (!a.shown) continue
      const d = Math.hypot(a.x - x, a.y - y)
      if (d < bd) [bd, best] = [d, a.id]
    }
    return best
  }

  private flyTo(l: Lolly, to: AnimalId, bump = false, delay = 0) {
    l.state = 'fly'
    l.fly = { x0: l.x, y0: l.y, t0: this.now + delay, dur: 0.5, to, bump }
    if (delay) this.later(() => sounds.whoosh(), delay * 1000)
    else sounds.whoosh()
  }

  /** She lets go of a finished lollipop: on an animal it's theirs, anywhere else it goes back to its spot. */
  private give(l: Lolly) {
    for (const a of this.animals.values()) {
      if (!a.shown) continue
      if (Math.hypot(a.x - l.x, a.y + a.look.r * 0.3 - l.y) < a.look.r + 80) {
        this.met(a.id)
        this.flyTo(l, a.id)
        return
      }
    }
    l.state = 'ready'
    sounds.place()
  }

  private mouth(a: Animal): Pt {
    if (a.id === 'maple') return [a.x, a.y + 56]
    return [a.x, a.y + a.look.r * (a.id === 'moose' ? 0.62 : 0.5)]
  }

  private tickLolly(l: Lolly, dt: number) {
    const f = this.finger
    if (l.state === 'roll' && f && f.lolly === l) {
      l.x = f.x
      l.y = f.y
      this.roll(l, dt)
    } else if (l.state === 'drag' && f && f.lolly === l) {
      l.x += (f.x - l.x) * Math.min(1, dt * 30)
      l.y += (f.y - l.y) * Math.min(1, dt * 30)
    } else if (l.state === 'ready') {
      l.x += (l.home[0] - l.x) * Math.min(1, dt * 8)
      l.y += (l.home[1] - l.y) * Math.min(1, dt * 8)
      l.still += dt
    } else if (l.state === 'lying') l.still += dt
    else if (l.state === 'fly' && l.fly) {
      const a = this.animals.get(l.fly.to)!
      const [mx, my] = this.mouth(a)
      const p = clamp((this.now - l.fly.t0) / l.fly.dur, 0, 1)
      const e = ease(p)
      l.x = l.fly.x0 + (mx - l.fly.x0) * e
      l.y = l.fly.y0 + (my - l.fly.y0) * e - Math.sin(p * Math.PI) * 120
      if (p >= 1) {
        if (l.fly.bump) {
          // Too big for Maple: it bonks her nose, she squints, and the moose leans in and gulps it.
          sfx.boing()
          a.anim = { kind: 'squint', t0: this.now, dur: 0.9 }
          const moose = this.animals.get('moose')
          if (moose) {
            moose.x = this.stage.maple[0] + 200
            moose.y = this.stage.maple[1] - 10
            moose.anim = { kind: 'hop', t0: this.now + 0.3, dur: 0.5 }
            moose.shown = true
          }
          l.fly = { x0: l.x, y0: l.y, t0: this.now + 0.5, dur: 0.45, to: 'moose' }
          this.say('🫎 Too big for Maple… the moose eats it in one bite!')
          this.talk(T.tooBig)
          if (moose) this.met('moose')
        } else {
          l.state = 'eat'
          l.eatT = this.now
          l.fly = null
          l.by = a.id
          a.anim = { kind: 'chomp', t0: this.now, dur: a.id === 'moose' && l.vol / UNIT() >= ROLL.giant ? 0.45 : 1.05 }
          l.eatDur = a.anim.dur
          if (!l.gift && a.id === 'maple') this.talk(T.crunch[this.crunches++ % T.crunch.length])
          else if (!l.gift && a.id === 'moose' && this.section !== 'orders') this.talk(T.mooseGulp, undefined, 0, true)
        }
      }
    } else if (l.state === 'eat') {
      const by = l.by!
      const a = this.animals.get(by)!
      const dur = l.eatDur
      const p = (this.now - l.eatT) / dur
      const [mx, my] = this.mouth(a)
      l.x = mx
      l.y = my
      const bites = by === 'moose' && dur < 0.6 ? 1 : 3
      const done = Math.floor(p * bites)
      if (done > l.bites && done < bites) {
        l.bites = done
        sfx.chomp()
        noise(0.12, 0.25, 'bandpass', 2200 + Math.random() * 800, 1400, 0.05, 2)
      }
      if (p >= 1) this.eaten(l, a)
    }
    // Draw it.
    const scale = l.state === 'eat' ? Math.max(0, 1 - (this.now - l.eatT) / l.eatDur) : 1
    const pk = (this.now - l.popT) / 0.45
    const pop = pk >= 0 && pk < 1 ? 1 + 0.35 * Math.sin(pk * Math.PI) * (1 - pk) : 1
    const r = Math.max(l.vol > 0 ? 12 : 0, ballR(l.vol)) * scale * pop
    l.el.setAttribute('transform', `translate(${l.x.toFixed(1)} ${l.y.toFixed(1)})`)
    l.ball.setAttribute('transform', `rotate(${l.rot.toFixed(1)}) scale(${r.toFixed(2)})`)
    l.ball.style.display = r > 0.5 ? '' : 'none'
    const stick = l.el.firstElementChild as SVGGElement
    // The stick pokes out from under the ball, however big it gets.
    stick.setAttribute('transform', `rotate(52) translate(${(r * 0.6).toFixed(1)} 0)`)
    stick.style.display = l.state === 'eat' && scale < 0.15 ? 'none' : ''
  }

  private eaten(l: Lolly, a: Animal) {
    const size = l.vol / UNIT()
    const swirl = Math.abs(l.turn) >= ROLL.swirl * Math.PI * 2
    this.dropLolly(l)
    if (l.gift) return
    this.made++
    this.sectionMade++
    this.drawTally()
    a.anim = { kind: 'hop', t0: this.now, dur: 0.55 }
    sounds.correct()
    if (this.section === 'orders' && a.id !== 'maple') {
      const want = WANTS[a.id as OrderId]
      const add = want.swirl ? (swirl ? size * 1.6 : size * 0.55) : size
      const was = a.fill
      a.fill += add
      const v = VOICE[a.id as OrderId]
      let line: Line | null = null
      if (!a.done && size > want.size * 2.4 && a.id !== 'moose') {
        // Silly: far too big for her. Cheeks puff right out, a wobble, and she's full anyway.
        line = v.big ?? null
        a.puffed = this.now
        a.anim = { kind: 'puff', t0: this.now, dur: 1.4 }
        sfx.boing()
        a.fill = Math.max(a.fill, want.size)
      }
      if (!a.done && a.fill >= want.size * ROLL.done) {
        a.done = true
        line = v.full
        burst()
        sounds.fanfare()
        const fed = ORDER_IDS.filter((id) => this.animals.get(id)?.done)
        this.ev.fed(fed.join(','), this.made)
        if (fed.length === ORDER_IDS.length) this.later(() => this.ev.section('share', { made: this.made }), 2200)
      } else if (!a.done && was < a.fill) {
        this.say(want.swirl && !swirl ? '🦉 Yum! The owl wants a swirl' : `😋 More, please!`)
        line = line ?? v.yum
      } else if (a.done && was >= want.size) sfx.boing()
      if (line) this.talk(line)
      if (!a.done) this.ev.fed(ORDER_IDS.filter((id) => this.animals.get(id)?.done).join(','), this.made)
      return
    }
    if (this.section === 'share') {
      burst()
      return
    }
    // Lines and shapes: on to the next part after three.
    if (this.section === 'pour' && this.sectionMade >= 3) this.later(() => this.ev.section('shapes', { made: this.made }), 1600)
    else if (this.section === 'shapes') {
      if (this.sectionMade >= 3) this.later(() => this.ev.section('orders', { made: this.made }), 1600)
      else this.later(() => this.newShape(this.shape.i + 1), 700)
    }
  }

  // -------------------------------------------------------------- shapes

  private newShape(i: number) {
    const s = this.stage.snow
    const id = SHAPE_IDS[i % SHAPE_IDS.length]
    this.shape = { i, guide: sampleShape(id, s.x + s.w / 2, s.y + s.h / 2, Math.min(s.w, s.h) * 0.36, 22), matched: false, checkAt: 0 }
    const d = shapePath(id, s.x + s.w / 2, s.y + s.h / 2, Math.min(s.w, s.h) * 0.36)
    this.els.guide?.setAttribute('d', d)
    this.els['guide-glow']?.setAttribute('d', d)
    this.els['guide-glow']?.setAttribute('opacity', '0')
    this.svg.querySelectorAll('[data-k="card-shape"]').forEach((el) => el.setAttribute('d', shapePath(id, 0, 0, 52)))
    this.svg.querySelector('[data-k="card"]')?.classList.remove('taffy-pop')
    void (this.svg.querySelector('[data-k="card"]') as SVGGElement | null)?.getBBox()
    this.svg.querySelector('[data-k="card"]')?.classList.add('taffy-pop')
    if (this.started && i > 0 && !this.ended) this.talk(T.card[id], undefined, 0, true)
  }

  private checkShape() {
    if (this.section !== 'shapes' || this.shape.matched || this.now < this.shape.checkAt) return
    this.shape.checkAt = this.now + 0.25
    const g = this.shape.guide
    let hit = 0
    for (const [x, y] of g) {
      const on = this.pieces.some((p) => p.pts.some((q) => !q.eaten && Math.hypot(q.x - x, q.y - y) < q.r + 22) || p.puddles.some((q) => !q.eaten && Math.hypot(q.x - x, q.y - y) < q.r + 22))
      if (on) hit++
    }
    if (hit / Math.max(1, g.length) >= 0.72) {
      this.shape.matched = true
      sounds.sparkle()
      this.later(() => sounds.correct(), 200)
      this.els['guide-glow']?.setAttribute('opacity', '1')
      const a = this.animals.get('maple')
      if (a) a.anim = { kind: 'hop', t0: this.now, dur: 0.55 }
      this.say(`✨ ${SHAPE_NAME[SHAPE_IDS[this.shape.i % SHAPE_IDS.length]]}! Roll it up`)
      this.talk(T.pretty)
    }
  }

  // -------------------------------------------------------------- pokes

  private pokeTarget(x: number, y: number) {
    const st = this.stage
    if (Math.hypot(st.tree[0] - x, st.tree[1] - y) < 150 || Math.hypot(st.bucket[0] - x, st.bucket[1] - y) < 80) return true
    if (Math.abs(st.roof[0] - x) < 130 * st.roofScale && Math.abs(st.roof[1] - y) < 110 * st.roofScale) return true
    if (this.section !== 'orders' && this.section !== 'share' && Math.hypot(st.post[0] - x, st.post[1] - y) < 90) return true
    if (Math.hypot(st.card[0] - x, st.card[1] - y) < 100 && this.section === 'shapes') return true
    for (const a of this.animals.values()) if (a.shown && Math.hypot(a.x - x, a.y - y) < a.look.r + 30) return true
    if (this.squirrel.state !== 'off' && Math.hypot(this.squirrel.x - x, this.squirrel.y - y) < 80) return true
    if (this.bird.on && Math.hypot(this.bird.x - x, this.bird.y - y) < 70) return true
    return !this.inSnow(x, y)
  }

  private poke(x: number, y: number) {
    const st = this.stage
    if (this.bird.on && Math.hypot(this.bird.x - x, this.bird.y - y) < 70) {
      meet('chickadee')
      return this.scareBird(this.bird.on)
    }
    if (this.squirrel.state !== 'off' && Math.hypot(this.squirrel.x - x, this.squirrel.y - y) < 80) {
      ;[0, 0.08, 0.16, 0.24].forEach((d) => tone(1800, 2400, 0.06, 0.06, 'square', d))
      meet('red-squirrel')
      this.squirrelOut()
      return
    }
    for (const a of this.animals.values()) {
      if (!a.shown || Math.hypot(a.x - x, a.y - y) > a.look.r + 30) continue
      const pokes = (this.talked.get(`poke-${a.id}`) ?? 0) + 1
      this.talked.set(`poke-${a.id}`, pokes)
      if (a.id === 'maple') {
        // Maple: a different trick each time (a hop, a wave, a tail slap, a wiggle).
        const kinds: AnimKind[] = ['wave', 'hop', 'slap', 'wiggle']
        a.anim = { kind: kinds[(pokes - 1) % kinds.length], t0: this.now, dur: 0.9 }
        sfx.thump()
        this.talk(pokes === 1 ? L.bonjour : T.mapleHi, 'maple-hi', 4)
      } else {
        a.anim = { kind: a.id === 'owl' ? 'spin' : Math.random() < 0.5 ? 'hop' : 'wiggle', t0: this.now, dur: a.id === 'owl' ? 1.1 : 0.6 }
        if (a.id === 'owl') this.hoo()
        else if (a.id === 'cousin') (sfx.thump(), sfx.splash())
        else if (a.id === 'moose') tone(160, 110, 0.5, 0.18, 'sawtooth')
        else sfx.chirp()
        this.talk(VOICE[a.id as OrderId].hi, `hi-${a.id}`, 5)
      }
      this.met(a.id)
      return
    }
    if (Math.hypot(st.tree[0] - x, st.tree[1] - y) < 150 || Math.hypot(st.bucket[0] - x, st.bucket[1] - y) < 80) return this.tapTree()
    if (Math.abs(st.roof[0] - x) < 130 * st.roofScale && Math.abs(st.roof[1] - y) < 110 * st.roofScale) {
      this.snowfall = this.now
      this.smoke(true)
      noise(0.6, 0.06, 'lowpass', 1200, 300)
      return
    }
    if (Math.hypot(st.post[0] - x, st.post[1] - y) < 90) {
      this.owlSpin = this.now
      this.hoo()
      this.talk(T.owlHi, 'hi-owl', 5)
      meet('snowy-owl')
      return
    }
    if (Math.hypot(st.card[0] - x, st.card[1] - y) < 100) {
      sounds.pop()
      this.svg.querySelector('[data-k="card"]')?.classList.remove('taffy-pop')
      void (this.svg.querySelector('[data-k="card"]') as SVGGElement | null)?.getBBox()
      this.svg.querySelector('[data-k="card"]')?.classList.add('taffy-pop')
      return
    }
    this.flakePuff(x, y)
    sounds.pop()
  }

  private hoo() {
    tone(420, 380, 0.3, 0.1, 'sine')
    tone(400, 360, 0.4, 0.1, 'sine', 0.38)
  }

  /** Drip, drip, drip: sap from the tree's tap into the bucket, and the bucket into the pot. */
  private tapTree() {
    this.talk(T.tree, 'tree')
    this.drips.forEach((d, i) => (d.t = -i * 0.28))
    ;[0, 0.28, 0.56].forEach((d) => tone(1300, 900, 0.07, 0.08, 'sine', d + 0.25))
    this.later(() => {
      this.pot.level = Math.min(FLOW.potHolds, this.pot.level + FLOW.sap)
      this.pot.wobble = this.now
      this.steamAt(this.pot.x, this.pot.y, 6)
      noise(0.3, 0.06, 'bandpass', 700, 300)
    }, 1100)
    this.bucket = 1
  }

  private smoke(big = false) {
    const [rx, ry] = this.stage.roof
    const k = this.stage.roofScale
    for (let i = 0; i < (big ? 6 : 1); i++) this.emit(rx + ROOF_CHIMNEY[0] * k + (Math.random() - 0.5) * 10, ry + ROOF_CHIMNEY[1] * k, big ? 26 : 18, 1.8, 50, '#B9B4C4')
  }

  private flakePuff(x: number, y: number) {
    const g = document.createElementNS(NS, 'g')
    g.setAttribute('transform', `translate(${x.toFixed(0)} ${y.toFixed(0)})`)
    g.innerHTML = Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2
      return `<circle class="taffy-fly" style="--dx:${(Math.cos(a) * 56).toFixed(0)}px;--dy:${(Math.sin(a) * 56).toFixed(0)}px" r="8" fill="#fff" stroke="#9FB4D6" stroke-width="2"/>`
    }).join('')
    this.els.fx?.appendChild(g)
    this.later(() => g.remove(), 800)
  }

  private scareBird(l: Lolly) {
    if (this.bird.on !== l) return
    this.bird.on = null
    this.bird.flyT = this.now
    ;[0, 0.1].forEach((d) => tone(2600, 3400, 0.07, 0.06, 'sine', d))
  }

  private squirrelOut() {
    const s = this.squirrel
    s.state = 'out'
    s.t = 0
    s.x0 = s.x
    s.y0 = s.y
    s.next = 24 + Math.random() * 12
  }

  // -------------------------------------------------------------- steam

  private emit(x: number, y: number, r: number, life: number, vy: number, color = '#FFFFFF') {
    const p = this.puffs.find((q) => q.t >= q.life)
    if (!p) return
    p.x = x
    p.y = y
    p.t = 0
    p.life = life
    p.r = r
    p.vy = vy
    p.el.setAttribute('fill', color)
  }

  private steamAt(x: number, y: number, n: number) {
    for (let i = 0; i < n; i++) this.emit(x + (Math.random() - 0.5) * 40, y + (Math.random() - 0.5) * 30, 12 + Math.random() * 10, 1.1, 60)
  }

  // -------------------------------------------------------------- every frame

  tick(dt: number) {
    this.now += dt
    const now = this.now
    this.tickPot(dt)
    for (const l of [...this.lollies]) this.tickLolly(l, dt)
    // The syrup: steam while it's hot, then the color settles.
    let hot = 0
    let set = 0
    const rMax = FLOW.wMax / 2
    const feel = { smoothing: FLOW.smoothing, streamline: FLOW.streamline, thinning: FLOW.thinning }
    for (const p of this.pieces) {
      drawPiece(p, rMax, feel)
      if (isGone(p) && p !== this.pot.piece) continue
      const pouring = p.endAt === Infinity
      const sp = pouring ? 0 : ease((now - p.endAt - ROLL.set * 0.35) / (ROLL.set * 0.65))
      p.els.fill.setAttribute('fill', syrupColor(sp))
      p.els.fill.setAttribute('opacity', sp < 1 ? (0.9 + 0.1 * sp).toFixed(3) : '1')
      if (sp < 1) {
        hot++
        const vol = Math.min(4, left(p) / UNIT())
        this.steamAcc += dt * ROLL.steam * (3 + vol * 5) * (1 - sp)
        while (this.steamAcc > 1) {
          this.steamAcc -= 1
          const pts = p.pts.filter((q) => !q.eaten)
          const q = pts.length ? pts[Math.floor(Math.random() * pts.length)] : p.puddles.find((o) => !o.eaten)
          if (q) this.emit(q.x + (Math.random() - 0.5) * q.r, q.y + (Math.random() - 0.5) * q.r, 9 + Math.random() * 9, 1 + Math.random() * 0.6, 50)
        }
        if (!pouring && now >= p.setAt - dt && now < p.setAt) {
          tone(1200, 1500, 0.08, 0.04, 'sine')
          if (this.section === 'pour') this.talk(T.set, 'set')
        }
      } else set++
    }
    this.checkShape()
    // Puffs (steam and chimney smoke) rise and fade.
    for (const p of this.puffs) {
      if (p.t >= p.life) {
        if (p.el.getAttribute('opacity') !== '0') p.el.setAttribute('opacity', '0')
        continue
      }
      p.t += dt
      p.y -= p.vy * dt
      p.x += Math.sin(now * 2 + p.r) * 6 * dt
      const k = p.t / p.life
      p.el.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${(p.r * (0.6 + k * 0.9)).toFixed(2)})`)
      p.el.setAttribute('opacity', (Math.sin(Math.min(1, k) * Math.PI) * 0.75).toFixed(3))
    }
    if (now > this.smokeAt) {
      this.smoke()
      this.smokeAt = now + 2.5 + Math.random() * 2
    }
    // Fresh snow from the roof: flakes fall and the melt marks fade away.
    const fall = clamp(1 - (now - this.snowfall) / 2.6, 0, 1)
    const { x: vx, y: vy, w: vw, h: vh } = this.vb
    for (const fl of this.flakes) {
      fl.y += (fl.vy * dt * 110) / vh
      if (fl.y > 1) {
        fl.y -= 1
        fl.x = Math.random()
      }
      fl.el.setAttribute('transform', `translate(${(vx + fl.x * vw + Math.sin(now * 1.3 + fl.ph) * 16).toFixed(0)} ${(vy + fl.y * vh).toFixed(0)})`)
      fl.el.setAttribute('opacity', fall > 0 ? (fall * 0.95).toFixed(2) : '0')
    }
    if (this.snowfall > 0) {
      // The melt marks fade under the fresh snow; then the rolled-up pieces are gone for good (the rest keep theirs).
      const k = (now - this.snowfall) / 2.2
      this.layers.dent.setAttribute('opacity', Math.max(0, 1 - k).toFixed(3))
      if (k >= 1) {
        this.pieces = this.pieces.filter((p) => {
          const gone = isGone(p) && p !== this.pot.piece
          if (gone) removePiece(p)
          else p.els.dent.replaceChildren()
          return !gone
        })
        this.layers.dent.setAttribute('opacity', '1')
        this.snowfall = -9
      }
    }
    this.tickAnimals(dt)
    this.tickSquirrel(dt, set > 0)
    this.tickBird(dt)
    this.tickTree(dt)
    this.drawPot()
    this.tickHint()
    this.updateSay(hot, set)
  }

  private drawPot() {
    const pot = this.pot
    const g = this.els.pot
    if (!g) return
    const wob = Math.max(0, 1 - (this.now - pot.wobble) / 0.6)
    const lift = pot.held ? 1 : 0
    const a = (pot.angle * 180) / Math.PI - 90
    g.setAttribute('transform', `translate(${pot.x.toFixed(1)} ${pot.y.toFixed(1)}) rotate(${(a + wob * 8 * Math.sin(wob * 20)).toFixed(2)}) scale(${(1 + lift * 0.04).toFixed(3)})`)
    // Tipping toward the spout (down in the pot's own frame): it squashes that way and the syrup slides to the lip.
    const t = pot.tilt
    this.els['pot-body']?.setAttribute('transform', `translate(0 ${(t * 14).toFixed(1)}) scale(1 ${(1 - t * 0.14).toFixed(3)})`)
    const lvl = clamp(pot.level / FLOW.potHolds, 0, 1)
    const s = this.els['pot-syrup']
    if (s) {
      s.setAttribute('r', (8 + 58 * Math.sqrt(lvl)).toFixed(1))
      s.setAttribute('cy', (t * 22 * (1 - lvl * 0.5)).toFixed(1))
      s.setAttribute('opacity', lvl > 0.01 ? '1' : '0')
      // The shine on the syrup rides on top of it.
      const r = 8 + 58 * Math.sqrt(lvl)
      const gl = this.els['pot-gloss']
      gl?.setAttribute('cx', (-r * 0.36).toFixed(1))
      gl?.setAttribute('cy', (t * 22 * (1 - lvl * 0.5) - r * 0.4).toFixed(1))
      gl?.setAttribute('rx', (r * 0.42).toFixed(1))
      gl?.setAttribute('ry', (r * 0.2).toFixed(1))
      gl?.setAttribute('opacity', lvl > 0.01 ? '0.75' : '0')
    }
    const stream = this.els['pot-stream']
    if (stream) {
      const w = pot.flow > 0 ? clamp(pot.width / 2, 5, 18) * (0.85 + 0.15 * Math.sin(this.now * 30)) : 0
      stream.setAttribute('r', w.toFixed(1))
    }
    if (!pot.held && Math.random() < 0.02) this.steamAt(pot.x, pot.y, 1)
  }

  private tickTree(dt: number) {
    for (const d of this.drips) {
      if (d.t >= 1) {
        d.el.setAttribute('opacity', '0')
        continue
      }
      d.t += dt
      if (d.t < 0) continue
      const [tx, ty] = [this.stage.tree[0] + 40, this.stage.tree[1] + 70]
      const [bx, by] = this.stage.bucket
      const k = Math.min(1, d.t / 0.35)
      d.el.setAttribute('transform', `translate(${(tx + (bx - tx) * k).toFixed(1)} ${(ty + (by - 10 - ty) * k * k).toFixed(1)})`)
      d.el.setAttribute('opacity', k < 1 ? '1' : '0')
    }
    this.bucket += (0.3 - this.bucket) * Math.min(1, dt * 0.6)
    this.els['bucket-sap']?.setAttribute('r', (6 + 22 * this.bucket).toFixed(1))
    const h = this.els['owl-head']
    if (h) {
      const k = (this.now - this.owlSpin) / 1.1
      h.setAttribute('transform', `rotate(${k >= 0 && k < 1 ? (ease(k) * 360).toFixed(1) : '0'})`)
    }
  }

  // -------------------------------------------------------------- animals

  private tickAnimals(dt: number) {
    const now = this.now
    for (const a of this.animals.values()) {
      const r = a.look.r
      // Off-screen until needed: the moose (lines and shapes) waits off the far edge.
      const off = (this.section === 'pour' || this.section === 'shapes') && a.id === 'moose'
      if (off && a.anim === null && a.shown && !this.lollies.some((l) => l.fly?.to === 'moose' || l.by === 'moose')) {
        a.shown = false
        a.x = this.stage.mooseIn[0]
        a.y = this.stage.mooseIn[1]
      }
      if (off && !a.shown) {
        a.els.root.setAttribute('opacity', '0')
        continue
      }
      a.els.root.setAttribute('opacity', '1')
      if (a.id === 'maple') {
        // Maple is her own puppet: it breathes and blinks by itself; the world only moves her and starts her actions.
        if (a.anim && !a.anim.played && now >= a.anim.t0) {
          a.anim.played = true
          void this.maple?.play(MAPLE_ACT[a.anim.kind])
        }
        if (a.anim && now - a.anim.t0 >= a.anim.dur) a.anim = null
        a.els.root.setAttribute('transform', `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)})`)
        a.els.paws?.setAttribute('transform', `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)})`)
        continue
      }
      let ty = 0
      let sx = 1
      let sy = 1 + Math.sin(now * 2.2 + r) * 0.012
      let rot = 0
      let mouth = 0.05
      let squint = false
      if (a.anim) {
        const t = now - a.anim.t0
        const p = t / a.anim.dur
        if (p >= 1) a.anim = null
        else if (t >= 0) {
          switch (a.anim.kind) {
            case 'hop':
              sy = p < 0.2 ? 1 - 0.14 * (p / 0.2) : p < 0.75 ? 1.06 : 1 - 0.08 * Math.sin(((p - 0.75) / 0.25) * Math.PI)
              sx = 2 - sy
              if (p >= 0.2 && p < 0.75) ty = -36 * Math.sin(((p - 0.2) / 0.55) * Math.PI)
              mouth = 0.3
              break
            case 'wiggle':
              rot = 9 * Math.sin(t * 28) * (1 - p)
              break
            case 'chomp':
              mouth = 0.15 + 0.55 * Math.abs(Math.sin(p * Math.PI * (a.anim.dur < 0.6 ? 1 : 3)))
              sy = 1 + 0.04 * Math.sin(p * Math.PI * 6)
              break
            case 'puff':
              rot = 12 * Math.sin(t * 16) * (1 - p)
              break
            case 'squint':
              squint = true
              rot = -6 * Math.sin(p * Math.PI)
              break
            case 'spin':
              break
          }
        }
      }
      a.els.root.setAttribute('transform', `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)})`)
      a.els.body?.setAttribute('transform', `translate(0 ${ty.toFixed(1)}) rotate(${rot.toFixed(2)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)})`)
      a.els.mouth?.setAttribute('ry', (r * 0.2 * mouth).toFixed(2))
      const puff = a.puffed > 0 ? Math.max(0, 1 - (now - a.puffed) / 3) : 0
      a.els.cheeks?.setAttribute('transform', `scale(${(puff > 0 ? 0.4 + 0.6 * ease(Math.min(1, puff * 3)) : 0).toFixed(3)})`)
      if (a.els.head) {
        const k = a.anim?.kind === 'spin' ? ease((now - a.anim.t0) / a.anim.dur) : 0
        a.els.head.setAttribute('transform', `rotate(${(k * 360).toFixed(1)})`)
      }
      // Blinks, a squint, and happy closed eyes once she's full.
      const blink = (now * 0.37 + r * 0.013) % 3.1 < 0.05
      const closed = blink || squint || (a.done && this.section === 'orders')
      for (const e of a.els.eyes) e.setAttribute('opacity', closed ? '0' : '1')
      a.els.happy?.setAttribute('opacity', closed ? '1' : '0')
      // The order bubble: the lollipop she wants, at its real size, filling up as she eats.
      if (a.els.meter) {
        const want = WANTS[a.id as OrderId]
        const k = clamp(a.fill / (want.size * ROLL.done), 0, 1)
        const C = 2 * Math.PI * 40
        a.els.meter.setAttribute('stroke-dasharray', `${(C * k).toFixed(1)} ${C.toFixed(1)}`)
        a.els.meter.setAttribute('opacity', k > 0.01 ? '1' : '0')
      }
      if (a.els.bubble) a.els.bubble.setAttribute('opacity', this.section === 'orders' && !a.done ? '1' : '0')
    }
    void dt
  }

  private crunchAll() {
    if (this.ended) return
    this.ended = true
    this.ev.share()
    // A lollipop for everybody, out of the tray, one after another (each the size they asked for)...
    const s = this.stage.snow
    let i = 0
    for (const a of this.animals.values()) {
      const { el, ball } = this.makeLollyEl()
      const want = a.id === 'maple' ? 1 : WANTS[a.id as OrderId].size
      const l: Lolly = { vol: want * UNIT(), turn: a.id === 'owl' ? 99 : 0, x: s.x + s.w / 2, y: s.y + s.h * 0.7, home: [0, 0], state: 'fly', rot: i * 70, touched: new Set(), fly: null, eatT: 0, by: null, bites: -1, eatDur: 1, popT: -9, gift: true, still: 0, el, ball }
      this.lollies.push(l)
      this.flyTo(l, a.id, false, i * 0.18)
      i++
    }
    this.talk(T.share)
    // ...then they all crunch at once, Maple says thank you, and the stamp.
    this.later(() => {
      bigCelebration()
      sounds.fanfare()
      for (const a of this.animals.values()) if (a.id !== 'maple') a.anim = { kind: 'hop', t0: this.now + Math.random() * 0.3, dur: 0.6 }
      const m = this.animals.get('maple')
      if (m) m.anim = { kind: 'slap', t0: this.now + 0.4, dur: 1 }
    }, 1500)
    this.later(() => this.talk(T.thanks, undefined, 0, true), 2300)
    this.later(() => this.ev.done(), 5200)
  }

  // -------------------------------------------------------------- the squirrel and the chickadee

  private tickSquirrel(dt: number, anySet: boolean) {
    const s = this.squirrel
    const el = this.els.squirrel
    const st = this.stage
    if (s.state === 'off') {
      el?.setAttribute('opacity', '0')
      s.next -= dt
      if (s.next > 0 || !anySet || this.finger) return
      // Sneak in from the nearer side of the tray toward a bit of set syrup.
      const set = this.pieces.filter((p) => isSet(p, this.now) && !isGone(p))
      const p = set[Math.floor(Math.random() * set.length)]
      const q = p?.pts.find((o) => !o.eaten) ?? p?.puddles.find((o) => !o.eaten)
      if (!q) return
      const fromLeft = q.x < st.snow.x + st.snow.w / 2
      s.x0 = s.x = fromLeft ? st.snow.x - 60 : st.snow.x + st.snow.w + 60
      s.y0 = s.y = q.y
      s.tx = q.x + (fromLeft ? -30 : 30)
      s.ty = q.y
      s.state = 'in'
      s.t = 0
      s.ate = 0
      return
    }
    s.t += dt
    if (s.state === 'in') {
      const k = ease(s.t / 0.9)
      s.x = s.x0 + (s.tx - s.x0) * k
      s.y = s.y0 + (s.ty - s.y0) * k
      if (s.t >= 0.9) ((s.state = 'lick'), (s.t = 0))
    } else if (s.state === 'lick') {
      // It licks a little syrup off where it stands.
      if (Math.random() < dt * 4) {
        for (const p of this.pieces) {
          if (!isSet(p, this.now)) continue
          const q = p.pts.find((o) => !o.eaten && Math.hypot(o.x - s.x, o.y - s.y) < 60)
          if (q && s.ate < UNIT() * 0.3) {
            q.eaten = true
            s.ate += q.v
            p.dirty = true
            tone(2200, 1800, 0.04, 0.05, 'sine')
          }
        }
      }
      if (s.t >= 1.6) this.squirrelOut()
    } else if (s.state === 'out') {
      const k = ease(s.t / 0.7)
      const ex = s.x0 < st.snow.x + st.snow.w / 2 ? st.snow.x - 120 : st.snow.x + st.snow.w + 120
      s.x = s.x0 + (ex - s.x0) * k
      if (s.t >= 0.7) s.state = 'off'
    }
    const hop = s.state === 'lick' ? Math.abs(Math.sin(s.t * 14)) * 4 : Math.abs(Math.sin(s.t * 18)) * 10
    el?.setAttribute('opacity', '1')
    el?.setAttribute('transform', `translate(${s.x.toFixed(1)} ${(s.y - hop).toFixed(1)})`)
  }

  private tickBird(dt: number) {
    const b = this.bird
    const el = this.els.bird
    if (!el) return
    if (!b.on) {
      const l = this.lollies.find((o) => (o.state === 'lying' || o.state === 'ready') && o.still > 3.5)
      if (l && Math.random() < dt * 0.25) {
        b.on = l
        b.t = 0
        tone(3000, 2600, 0.08, 0.05, 'sine')
        tone(3000, 2600, 0.08, 0.05, 'sine', 0.15)
      }
    }
    if (b.on) {
      if (!this.lollies.includes(b.on) || (b.on.state !== 'lying' && b.on.state !== 'ready')) return this.scareBird(b.on)
      b.t += dt
      const a = (52 * Math.PI) / 180
      b.x = b.on.x + Math.cos(a) * STICK * 0.7
      b.y = b.on.y + Math.sin(a) * STICK * 0.7 - 10
      const land = ease(b.t / 0.4)
      el.setAttribute('opacity', '1')
      el.setAttribute('transform', `translate(${b.x.toFixed(1)} ${(b.y - (1 - land) * 160).toFixed(1)}) scale(${(1 + 0.05 * Math.sin(this.now * 9)).toFixed(3)})`)
      return
    }
    const k = (this.now - b.flyT) / 0.6
    if (k >= 0 && k < 1) el.setAttribute('transform', `translate(${(b.x + k * 220).toFixed(1)} ${(b.y - k * 260).toFixed(1)})`)
    el.setAttribute('opacity', k >= 0 && k < 1 ? (1 - k).toFixed(2) : '0')
  }

  // -------------------------------------------------------------- what's on screen, for Dad, and the hint

  private say(text: string) {
    this.lastSay = text
    this.sayAt = this.now
    this.ev.say(text)
  }
  sayAt = -9

  private updateSay(hot: number, set: number) {
    if (this.now - this.sayAt < 2.5) return
    let text = SAY[this.section]
    if (this.section === 'share' && !this.ended) text = '🍭 One for everybody…'
    else if (this.pot.level <= 0.01) text = '🌳 The pot is empty: tap the maple tree'
    else if (this.section === 'orders' && this.lollies.some((l) => l.state === 'ready')) text = '🍭 Who gets this one?'
    else if (this.lollies.some((l) => l.state === 'lying')) text = '🥢 Keep rolling it up'
    else if (set > 0 && !this.finger) text = '🥢 It’s set! Roll it up on a stick'
    else if (hot > 0 && !this.finger) text = '♨️ It steams… and sets'
    else if (this.section === 'shapes' && this.shape.matched) text = `✨ ${SHAPE_NAME[SHAPE_IDS[this.shape.i % SHAPE_IDS.length]]}! Roll it up`
    if (text !== this.lastSay) {
      this.lastSay = text
      this.ev.say(text)
    }
  }

  private tickHint() {
    const h = this.els.hint
    if (!h) return
    const idle = !this.finger && this.now - this.lastTouch > 8 && !this.ended
    let at: Pt | null = null
    if (idle) {
      const ready = this.lollies.find((l) => l.state === 'ready')
      const lying = this.lollies.find((l) => l.state === 'lying')
      const set = this.pieces.find((p) => isSet(p, this.now) && !isGone(p))
      if (ready) {
        // From the lollipop to whoever it fits best.
        const best = this.bestFor(ready)
        const k = (this.now * 0.6) % 1
        const [mx, my] = best ? this.mouth(best) : ready.home
        at = [ready.x + (mx - ready.x) * ease(k), ready.y + (my - ready.y) * ease(k)]
      } else if (lying) at = [lying.x, lying.y]
      else if (set) {
        const q = set.pts.find((o) => !o.eaten) ?? set.puddles.find((o) => !o.eaten)
        if (q) at = [q.x, q.y]
      } else if (this.pot.level <= 0.01) at = [this.stage.tree[0], this.stage.tree[1]]
      else at = [this.pot.x, this.pot.y]
    }
    // Sparkle says the hint once per quiet stretch (and not again for a while).
    if (!idle) this.idleHinted = false
    else if (at && !this.idleHinted && this.started) {
      this.idleHinted = true
      const ready = this.lollies.some((l) => l.state === 'ready')
      const lying = this.lollies.some((l) => l.state === 'lying')
      const set = this.pieces.some((p) => isSet(p, this.now) && !isGone(p))
      const line = ready ? T.give : lying ? T.rest : set ? T.set : this.pot.level <= 0.01 ? T.empty : this.section === 'shapes' ? T.shapes : this.section === 'orders' ? T.orders : T.pour
      this.talk(line, 'hint', 16)
    }
    h.setAttribute('opacity', at ? '1' : '0')
    if (at) h.setAttribute('transform', `translate(${at[0].toFixed(0)} ${(at[1] + 30).toFixed(0)})`)
  }

  private bestFor(l: Lolly): Animal | null {
    const size = l.vol / UNIT()
    const swirl = Math.abs(l.turn) >= ROLL.swirl * Math.PI * 2
    let best: Animal | null = null
    let bd = Infinity
    for (const id of ORDER_IDS) {
      const a = this.animals.get(id)
      if (!a || a.done) continue
      const want = WANTS[id]
      const need = want.size - a.fill
      const d = Math.abs(Math.log(Math.max(0.05, size) / Math.max(0.05, need))) - (want.swirl && swirl ? 2 : 0)
      if (d < bd) [bd, best] = [d, a]
    }
    return best
  }

  private drawTally() {
    const g = this.els.tally
    if (!g) return
    const [x, y] = this.stage.tally
    g.innerHTML = Array.from({ length: Math.min(this.made, 24) }, (_, i) => `<rect x="${x + i * 20}" y="${y}" width="10" height="22" rx="5" fill="#F3E2C0" stroke="#4A3B57" stroke-width="3" transform="rotate(10 ${x + i * 20 + 5} ${y + 11})"/>`).join('')
  }

  qa() {
    return {
      section: this.section,
      tip: this.tipMode,
      made: this.made,
      pieces: this.pieces.filter((p) => !isGone(p)).length,
      hot: this.pieces.filter((p) => !isGone(p) && !isSet(p, this.now)).length,
      set: this.pieces.filter((p) => !isGone(p) && isSet(p, this.now)).length,
      syrup: +(this.pieces.reduce((s, p) => s + left(p), 0) / UNIT()).toFixed(2),
      pot: +this.pot.level.toFixed(2),
      tilt: +this.pot.tilt.toFixed(2),
      lollies: this.lollies.map((l) => ({ state: l.state, size: +(l.vol / UNIT()).toFixed(2) })),
      fed: ORDER_IDS.filter((id) => this.animals.get(id)?.done),
      shape: this.section === 'shapes' ? { id: SHAPE_IDS[this.shape.i % SHAPE_IDS.length], matched: this.shape.matched } : null,
      ended: this.ended,
    }
  }
}

// ---------------------------------------------------------------- the animals at the table (code-drawn faces)

/** One of the friends across the table, leaning over the rim and looking up at her: paws on the rim, a face that
 *  blinks, chomps, puffs its cheeks and closes its eyes happily when full. */
function AnimalEl({ id, order }: { id: AnimalId; order: boolean }) {
  const L = LOOKS[id]
  const r = L.r
  const want = id !== 'maple' ? WANTS[id as OrderId] : null
  const ink = '#4A3B57'
  const eyeX = L.eyes * r
  const eyeY = L.eyeY * r
  const moose = id === 'moose'
  const beaver = id === 'cousin'
  return (
    <g data-k={`a-${id}`}>
      {/* Paws on the tray's edge. */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <ellipse cx={s * r * 0.52} cy={r * 0.98} rx={r * 0.24} ry={r * 0.15} fill={moose ? '#4A3328' : L.fill} stroke={ink} strokeWidth={5} />
          {!moose && <path d={`M${s * r * 0.52 - r * 0.08} ${r * 1.02} l0 ${r * 0.06} M${s * r * 0.52 + r * 0.08} ${r * 1.02} l0 ${r * 0.06}`} stroke={ink} strokeWidth={2.5} strokeLinecap="round" />}
        </g>
      ))}
      <g data-k={`a-${id}-body`}>
        <g data-k={id === 'owl' ? `a-${id}-head` : undefined}>
          {L.antlers &&
            [-1, 1].map((s) => (
              // Wide flat moose antlers (palms with points along the top).
              <path key={s} d={`M${s * r * 0.5} ${-r * 0.6} C ${s * r * 0.8} ${-r * 0.66}, ${s * r * 1.0} ${-r * 0.7}, ${s * r * 1.14} ${-r * 0.82} L ${s * r * 1.5} ${-r * 0.96} L ${s * r * 1.36} ${-r * 1.04} L ${s * r * 1.5} ${-r * 1.22} L ${s * r * 1.28} ${-r * 1.2} L ${s * r * 1.3} ${-r * 1.42} L ${s * r * 1.1} ${-r * 1.28} L ${s * r * 1.0} ${-r * 1.46} L ${s * r * 0.9} ${-r * 1.18} C ${s * r * 0.84} ${-r * 0.96}, ${s * r * 0.66} ${-r * 0.82}, ${s * r * 0.44} ${-r * 0.76} Z`} fill="#E9D3A6" stroke={ink} strokeWidth={5} strokeLinejoin="round" />
            ))}
          {L.ears.map(([x, y, er], i) => (
            <g key={i}>
              {moose ? (
                <ellipse cx={x * r} cy={y * r} rx={er * r * 1.3} ry={er * r * 0.7} fill={L.fill} stroke={ink} strokeWidth={5} transform={`rotate(${x < 0 ? 24 : -24} ${x * r} ${y * r})`} />
              ) : (
                <circle cx={x * r} cy={y * r} r={er * r} fill={id === 'owl' ? '#FBFBFF' : L.fill} stroke={ink} strokeWidth={5} />
              )}
              {!moose && id !== 'owl' && <circle cx={x * r * 0.96} cy={y * r * 0.96} r={er * r * 0.55} fill={L.earFill} />}
              {moose && <ellipse cx={x * r} cy={y * r} rx={er * r * 0.7} ry={er * r * 0.32} fill={L.earFill} transform={`rotate(${x < 0 ? 24 : -24} ${x * r} ${y * r})`} />}
            </g>
          ))}
          {/* The moose's long nose hangs below its face; the dewlap under its chin. */}
          {moose && <ellipse cx={0} cy={r * 0.62} rx={r * 0.6} ry={r * 0.5} fill={L.muzzleFill} stroke={ink} strokeWidth={5} />}
          <circle r={r} fill={L.fill} stroke={ink} strokeWidth={5} />
          {beaver && <path d={`M${-r * 0.12} ${-r * 0.96} q ${r * 0.1} ${-r * 0.26} ${r * 0.24} ${-r * 0.06}`} stroke={ink} strokeWidth={4} fill={L.fill} strokeLinecap="round" />}
          {L.stripes && (
            <g>
              {[-0.25, 0, 0.25].map((x) => (
                <path key={x} d={`M${x * r} ${-r * 0.95} L ${x * r} ${-r * 0.45}`} stroke="#5A3420" strokeWidth={7} strokeLinecap="round" />
              ))}
              {[-1, 1].map((s) => (
                <path key={s} d={`M${s * r * 0.15} ${-r * 0.26} q ${s * r * 0.3} ${-r * 0.1} ${s * r * 0.62} ${r * 0.06}`} stroke="#FFF1DE" strokeWidth={6} fill="none" strokeLinecap="round" />
              ))}
            </g>
          )}
          {id === 'owl' && (
            <g>
              {[[-0.5, 0.4], [0.46, 0.5], [-0.2, 0.7], [0.18, 0.66], [0.4, -0.6], [-0.36, -0.66]].map(([fx, fy], i) => (
                <path key={i} d={`M${fx * r - 5} ${fy * r} l5 4 l5 -4`} stroke="#5A4E68" strokeWidth={3} fill="none" strokeLinecap="round" />
              ))}
            </g>
          )}
          {L.muzzle && !moose && <ellipse cx={L.muzzle[0] * r} cy={L.muzzle[1] * r} rx={L.muzzle[2] * r} ry={L.muzzle[3] * r} fill={L.muzzleFill} stroke={ink} strokeWidth={4} />}
          {/* Puffed cheeks (a silly too-big lollipop). */}
          <g data-k={`a-${id}-cheeks`} transform="scale(0)">
            {[-1, 1].map((s) => (
              <circle key={s} cx={s * r * 0.62} cy={r * 0.38} r={r * 0.42} fill={L.fill} stroke={ink} strokeWidth={5} />
            ))}
          </g>
          <ellipse data-k={`a-${id}-mouth`} cx={0} cy={r * (moose ? 0.84 : L.muzzle ? L.muzzle[1] + 0.22 : 0.42)} rx={r * 0.2} ry={1} fill="#5A2A32" />
          {L.teeth && (
            <g>
              <rect x={-r * 0.13} y={r * 0.42} width={r * 0.12} height={r * 0.2} rx={3} fill="#FF9A3C" stroke={ink} strokeWidth={3} />
              <rect x={r * 0.01} y={r * 0.42} width={r * 0.12} height={r * 0.2} rx={3} fill="#FF9A3C" stroke={ink} strokeWidth={3} />
            </g>
          )}
          {moose && [-1, 1].map((s) => <ellipse key={s} cx={s * r * 0.2} cy={r * 0.66} rx={r * 0.08} ry={r * 0.11} fill="#4A3328" />)}
          {L.nose && !moose && <ellipse cx={0} cy={r * (L.muzzle ? L.muzzle[1] - 0.12 : 0.2)} rx={r * 0.13} ry={r * 0.09} fill={L.nose} />}
          {L.beak && <polygon points={`${-r * 0.1},${r * 0.12} ${r * 0.1},${r * 0.12} 0,${r * 0.34}`} fill="#3A2F45" stroke="#3A2F45" strokeWidth={3} strokeLinejoin="round" />}
          {[-1, 1].map((s) => (
            <g key={s}>
              {L.yellowEyes && <circle cx={s * eyeX} cy={eyeY} r={r * 0.2} fill="#FFD84D" stroke={ink} strokeWidth={3} />}
              <g data-k={`a-${id}-eye`}>
                <circle cx={s * eyeX} cy={eyeY} r={r * 0.12} fill="#2B2236" />
                <circle cx={s * eyeX + r * 0.04} cy={eyeY - r * 0.05} r={r * 0.045} fill="#fff" />
                <circle cx={s * eyeX - r * 0.04} cy={eyeY + r * 0.04} r={r * 0.02} fill="#fff" />
              </g>
            </g>
          ))}
          <path data-k={`a-${id}-happy`} opacity={0} d={`M${-eyeX - r * 0.12} ${eyeY + 2} q ${r * 0.12} ${-r * 0.14} ${r * 0.24} 0 M${eyeX - r * 0.12} ${eyeY + 2} q ${r * 0.12} ${-r * 0.14} ${r * 0.24} 0`} stroke="#2B2236" strokeWidth={5} fill="none" strokeLinecap="round" />
          {[-1, 1].map((s) => (
            <ellipse key={s} cx={s * r * 0.6} cy={r * 0.25} rx={r * 0.13} ry={r * 0.075} fill="#FF9EB8" opacity={0.7} />
          ))}
        </g>
      </g>
      {/* The order bubble: the lollipop she wants (its real size), and a ring that fills as she eats. */}
      {order && want && (
        <g data-k={`a-${id}-bubble`}>
          <circle r={40} fill="#fff" stroke={ink} strokeWidth={4} />
          <circle data-k={`a-${id}-meter`} r={40} fill="none" stroke="#F2B544" strokeWidth={9} strokeLinecap="round" transform="rotate(-90)" strokeDasharray="0 999" />
          <BubbleLolly size={want.size} swirl={!!want.swirl} />
        </g>
      )}
    </g>
  )
}

/** Maple, her live puppet, standing behind the tray (the tray hides her tummy) with her head over the far rim. */
function MapleEl({ puppet }: { puppet: Ref<PuppetHandle> }) {
  const k = MAPLE_BOX / 500
  return (
    <g data-k="a-maple">
      <svg x={-MAPLE_HEAD[0] * k} y={-MAPLE_HEAD[1] * k} width={MAPLE_BOX} height={MAPLE_BOX} viewBox={`0 0 ${MAPLE_BOX} ${MAPLE_BOX}`} overflow="visible">
        <Maple ref={puppet} height="100%" />
      </svg>
    </g>
  )
}

/** Maple's paws on the rim, in front of the tray. */
function MaplePaws({ rimY }: { rimY: number }) {
  const ink = '#4A3B57'
  return (
    <g data-k="a-maple-paws" pointerEvents="none">
      {[-1, 1].map((s) => (
        <g key={s}>
          <ellipse cx={s * 58} cy={rimY} rx={24} ry={15} fill={CANADA_COLORS.beaverFur} stroke={ink} strokeWidth={5} />
          <path d={`M${s * 58 - 8} ${rimY + 4} l0 7 M${s * 58 + 8} ${rimY + 4} l0 7`} stroke={ink} strokeWidth={2.5} strokeLinecap="round" />
        </g>
      ))}
    </g>
  )
}

/** The lollipop in a bubble: drawn at 0.45 of a real one's size, so the moose's still fits. */
function BubbleLolly({ size, swirl }: { size: number; swirl: boolean }) {
  const r = 36 * Math.sqrt(size) * 0.45
  return (
    <g transform={`translate(${-r * 0.2} ${-r * 0.2})`}>
      <rect x={-3} y={0} width={6} height={r + 16} rx={3} fill="#FFF3DC" stroke="#4A3B57" strokeWidth={2.5} transform="rotate(-35)" />
      <circle r={r} fill={syrupFill} stroke="#4A3B57" strokeWidth={3} />
      <ellipse cx={-r * 0.35} cy={-r * 0.38} rx={r * 0.3} ry={r * 0.16} fill="#FFF3D0" opacity={0.8} transform={`rotate(-30 ${-r * 0.35} ${-r * 0.38})`} />
      {swirl && <path d={`M0 0 C ${r * 0.2} ${-r * 0.35} ${r * 0.62} ${-r * 0.12} ${r * 0.5} ${r * 0.25} C ${r * 0.38} ${r * 0.62} ${-r * 0.3} ${r * 0.66} ${-r * 0.56} ${r * 0.28} C ${-r * 0.8} ${-r * 0.1} ${-r * 0.5} ${-r * 0.68} ${r * 0.04} ${-r * 0.72}`} fill="none" stroke="#9A5A1E" strokeWidth={3} strokeLinecap="round" />}
    </g>
  )
}
const syrupFill = '#F0B44C'

/** The copper pot from above: handle away from her, the spout toward her, hot syrup bubbling inside. */
function Pot() {
  const ink = '#4A3B57'
  return (
    <g data-k="pot">
      <g data-k="pot-body">
        {/* The copper pot (painted from above: the handle away from her, the spout toward her). */}
        <image href={potImg} x={-POT_R * 1.006} y={-POT_R * 1.875} width={POT_R * 2.012} height={POT_R * 3.048} />
        <circle data-k="pot-syrup" r={50} fill="#C26A12" />
        <ellipse data-k="pot-gloss" cx={-18} cy={-20} rx={22} ry={10} fill="#FFE2A8" opacity={0.7} transform="rotate(-30)" />
        <g data-k="pot-bubbles">
          {[[-14, 16, 0], [18, -4, 0.5], [6, 26, 1.1], [-26, -8, 1.6]].map(([bx, by, d], i) => (
            <circle key={i} cx={bx} cy={by} r={5} fill="none" stroke="#FFD58A" strokeWidth={2.5} className="taffy-bubble" style={{ animationDelay: `${d}s` }} />
          ))}
        </g>
      </g>
      {/* The stream landing at the spout. */}
      <circle data-k="pot-stream" cx={0} cy={POT_R + 22} r={0} fill="#C26A12" stroke={ink} strokeWidth={3} />
    </g>
  )
}

// ---------------------------------------------------------------- the React side

const FLAKES = 70
const PUFFS = 70
const PARTS: TaffySection[] = ['pour', 'shapes', 'orders', 'share']

export function SugarSnow({ onDone, setProgress }: CanadaActivityProps) {
  const { start, param, enter } = useSections(TAFFY_SECTIONS)
  const first = (start && start !== 'story' ? start : 'pour') as TaffySection
  const [story, setStory] = useState(!start || start === 'story')
  const tip = param('tip') as 'hold' | 'lead'
  const [run, setRun] = useState(() => ({ section: first, made: param('made') === '' ? START_MADE[first] : Math.max(0, parseInt(param('made')) || 0), fed: param('fed').split(',').filter((f): f is OrderId => (ORDER_IDS as readonly string[]).includes(f)), n: 0 }))
  const [say_, setSay] = useState(SAY[run.section])
  const [ended, setEnded] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const world = useRef<TaffyWorld | null>(null)
  const maple = useRef<PuppetHandle>(null)
  const storyRef = useRef(story)
  storyRef.current = story
  const doneRef = useRef(false)
  const size = useElementSize(box)
  const wide = !size.height || size.width / size.height >= 1.05
  const stage = wide ? WIDE : TALL
  const mid = `taffy${run.n}`

  // The view box: the stage scaled to fit, the extra edge filled with more of the snowy yard.
  const k = size.width && size.height ? Math.min(size.width / stage.w, size.height / stage.h) : 1
  const vw = size.width ? size.width / k : stage.w
  const vh = size.height ? size.height / k : stage.h
  const vb = { x: (stage.w - vw) / 2, y: (stage.h - vh) / 2, w: vw, h: vh }

  useEffect(() => {
    if (story) enter('story')
    else enter(run.section, { made: run.made === START_MADE[run.section] ? '' : String(run.made), fed: run.section === 'orders' ? run.fed.join(',') : '', tip })
  }, [run, story])

  // The stars in the top bar: one per part.
  useEffect(() => {
    setProgress(ended ? PARTS.length : PARTS.indexOf(run.section), PARTS.length)
  }, [run.section, ended])

  useLayoutEffect(() => {
    if (!svg.current) return
    const w = new TaffyWorld(svg.current, stage, run.section, run.made, run.fed, tip, {
      section: (s, st) => {
        setEnded(false)
        setSay(SAY[s])
        setRun((r) => ({ section: s, made: st.made, fed: (st.fed ?? '').split(',').filter(Boolean) as OrderId[], n: r.n + 1 }))
      },
      fed: (fed, made) => enter('orders', { made: made === START_MADE.orders ? '' : String(made), fed, tip }),
      say: setSay,
      share: () => setEnded(true),
      talk: (line, queue) => void say(line, { interrupt: !queue }),
      done: () => {
        if (doneRef.current) return
        doneRef.current = true
        onDone()
      },
    })
    w.vb = vb
    w.maple = maple.current
    world.current = w
    if (!storyRef.current) w.start()
    ;(window as unknown as { __canadaTaffyQA?: () => unknown }).__canadaTaffyQA = () => w.qa()
    const unwatch = watch('taffy', () => {
      const l = w.lollies.find((o) => o.state === 'roll')
      return { finger: [w.finger ? w.speed : 0, 3000], tilt: [w.pot.tilt, 1], flow: [w.pot.flow, FLOW.max], width: [w.pot.flow > 0 ? w.pot.width : 0, FLOW.wMax * 1.5], lollipop: [l ? l.vol / ROLL.unit : 0, 5] }
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

  // Turning the iPad: the other stage (the tray starts with fresh snow).
  useEffect(() => {
    const w = world.current
    if (!w) return
    w.vb = vb
    w.maple = maple.current
    if (w.stage !== stage) w.setStage(stage)
  })

  const again = () => {
    setEnded(false)
    setSay(SAY.pour)
    setRun((r) => ({ section: 'pour', made: 0, fed: [], n: r.n + 1 }))
  }

  const section = run.section
  const s = stage.snow
  const lineUp = section === 'orders' || section === 'share'
  const animals: OrderId[] = lineUp ? [...ORDER_IDS] : ['moose']
  const mapleAt = lineUp ? stage.line.maple : stage.maple
  const [cx, cy] = stage.card

  return (
    <div ref={box} style={{ position: 'absolute', inset: 0, background: '#E8EFF8', overflow: 'clip' }}>
      <style>{CSS}</style>
      <svg
        key={run.n}
        ref={svg}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        aria-label="Pour maple syrup on the snow"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          world.current?.down(e)
        }}
        onPointerMove={(e) => world.current?.move(e)}
        onPointerUp={(e) => world.current?.up(e)}
        onPointerCancel={(e) => world.current?.up(e)}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'none', display: 'block', userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        {/* Everything seen from straight above: the yard, the tree and its bucket, the shack's roof, the owl's post. */}
        <Yard stage={stage} mid={mid} />
        <Tree x={stage.tree[0]} y={stage.tree[1]} />
        <Bucket x={stage.bucket[0]} y={stage.bucket[1]} />
        <Drips />
        <Roof x={stage.roof[0]} y={stage.roof[1]} scale={stage.roofScale} />
        <Post x={stage.post[0]} y={stage.post[1]} owl={!lineUp} />
        <Stove x={stage.stove[0]} y={stage.stove[1]} />
        <Crate x={stage.jar[0]} y={stage.jar[1]} />
        {/* Maple stands behind the tray, her head over its far rim. */}
        <MapleEl puppet={maple} />
        <Tray stage={stage} mid={mid} />
        <Sparkles stage={stage} />
        <g data-k="tally" />
        {/* The shape pressed into the snow, and its glow when she pours over it. */}
        {section === 'shapes' && (
          <g pointerEvents="none">
            <path data-k="guide" d="" fill="none" stroke="#B7C7DE" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 30" />
            <path data-k="guide-glow" d="" fill="none" stroke="#FFE27A" strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" opacity={0} className="taffy-glow" />
          </g>
        )}
        {/* The syrup: melt marks, ink, the syrup itself, and its shine. */}
        <g data-k="dents" pointerEvents="none" />
        <g data-k="ink" pointerEvents="none" />
        <g data-k="fill" pointerEvents="none" />
        <g data-k="gloss" pointerEvents="none" opacity={0.75} />
        {/* Across the table. */}
        <MaplePaws rimY={s.y - 22 - mapleAt[1]} />
        {animals.map((id) => (
          <AnimalEl key={id} id={id} order={lineUp} />
        ))}
        {/* The red squirrel and the chickadee. */}
        <g data-k="squirrel" opacity={0}>
          <path d="M26 6 C 74 -6, 92 -70, 50 -88 C 22 -84, 30 -50, 40 -36 C 46 -24, 34 -10, 18 -8 Z" fill="#D0612E" stroke="#4A3B57" strokeWidth={5} strokeLinejoin="round" />
          <path d="M40 -20 C 66 -34, 70 -66, 52 -78" stroke="#F09060" strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d="M-22 -22 l-6 -20 l14 10 M22 -22 l6 -20 l-14 10" fill="#B04A20" stroke="#4A3B57" strokeWidth={4} strokeLinejoin="round" />
          <circle r={30} fill="#D0612E" stroke="#4A3B57" strokeWidth={5} />
          <ellipse cx={0} cy={10} rx={14} ry={10} fill="#F6E2CC" stroke="#4A3B57" strokeWidth={3} />
          <circle cx={-11} cy={-7} r={6} fill="#fff" stroke="#4A3B57" strokeWidth={2} />
          <circle cx={11} cy={-7} r={6} fill="#fff" stroke="#4A3B57" strokeWidth={2} />
          <circle cx={-11} cy={-6} r={4} fill="#2B2236" />
          <circle cx={11} cy={-6} r={4} fill="#2B2236" />
          <ellipse cx={0} cy={4} rx={4} ry={3} fill="#3A2622" />
          <ellipse cx={-20} cy={8} rx={6} ry={3.5} fill="#FF9EB8" opacity={0.7} />
          <ellipse cx={20} cy={8} rx={6} ry={3.5} fill="#FF9EB8" opacity={0.7} />
        </g>
        <g data-k="lollies" />
        <g data-k="bird" opacity={0}>
          <path d="M22 -4 L46 -10 L44 6 Z" fill="#8E8A9C" stroke="#4A3B57" strokeWidth={3.5} strokeLinejoin="round" />
          <ellipse rx={30} ry={22} fill="#E7DCCB" stroke="#4A3B57" strokeWidth={4} />
          <ellipse cx={8} cy={-2} rx={18} ry={14} fill="#A8A4B4" />
          <circle cx={-18} cy={-10} r={17} fill="#2B2236" stroke="#4A3B57" strokeWidth={3} />
          <ellipse cx={-15} cy={-5} rx={10} ry={8} fill="#fff" />
          <circle cx={-12} cy={-12} r={3.5} fill="#fff" />
          <circle cx={-12} cy={-12} r={2} fill="#2B2236" />
          <polygon points="-34,-10 -44,-7 -34,-4" fill="#3A2F45" />
        </g>
        {/* The shape card from Maple. */}
        {section === 'shapes' && (
          <g transform={`translate(${cx} ${cy})`}>
            <g data-k="card">
              <rect x={-82} y={-72} width={164} height={144} rx={18} fill="#FFF7F0" stroke="#4A3B57" strokeWidth={5} transform="rotate(-4)" />
              <rect x={-70} y={-60} width={140} height={120} rx={12} fill="none" stroke="#FF8FB8" strokeWidth={3} strokeDasharray="8 8" transform="rotate(-4)" />
              <path data-k="card-shape" d="" fill="none" stroke="#C26A12" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" transform="rotate(-4)" />
            </g>
          </g>
        )}
        <g data-k="steam" pointerEvents="none">
          {Array.from({ length: PUFFS }, (_, i) => (
            <circle key={i} data-k="puff" r={1} fill="#fff" opacity={0} />
          ))}
        </g>
        <Pot />
        <g fill="#fff" stroke="#A8BCD9" strokeWidth={2} pointerEvents="none">
          {Array.from({ length: FLAKES }, (_, i) => (
            <circle key={i} data-k="flake" r={4 + (i % 4) * 2} opacity={0} />
          ))}
        </g>
        <g data-k="fx" pointerEvents="none" />
        <g data-k="hint" opacity={0} pointerEvents="none">
          <text fontSize={100} textAnchor="middle" dominantBaseline="middle" className="taffy-hint">
            👆
          </text>
        </g>
      </svg>
      {story && <StoryBeat lines={T.story} friend={<Maple height="100%" />} onDone={() => (setStory(false), world.current?.start())} />}
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 20 }}>
        {ended && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 6, type: 'spring' }} style={CORNER}>
            <BigButton onClick={again} ariaLabel="Again">
              🔁 🍁
            </BigButton>
          </motion.div>
        )}
        {!story && (
          <AnimatePresence mode="popLayout">
            <motion.div key={say_} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={PILL}>
              {say_}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

const CSS = `
.taffy-pop { animation: taffy-pop .45s cubic-bezier(.3,1.6,.5,1) both; transform-box: fill-box; transform-origin: center; }
@keyframes taffy-pop { from { transform: scale(0.4) } to { transform: scale(1) } }
.taffy-fly { animation: taffy-fly .7s ease-out both; }
@keyframes taffy-fly { from { transform: translate(0,0) scale(1); opacity: 1 } to { transform: translate(var(--dx), var(--dy)) scale(.3); opacity: 0 } }
.taffy-hint { animation: taffy-hint 1s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes taffy-hint { 0%,100% { transform: scale(1) } 50% { transform: scale(1.15) } }
.taffy-glow { animation: taffy-glow 1.2s ease-in-out infinite; }
@keyframes taffy-glow { 0%,100% { stroke-opacity: .5 } 50% { stroke-opacity: 1 } }
.taffy-flame { animation: taffy-flame 1.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes taffy-flame { 0%,100% { transform: scale(1) } 50% { transform: scale(1.06) } }
.taffy-twinkle { animation: taffy-twinkle 2.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; opacity: 0; }
@keyframes taffy-twinkle { 0%,70%,100% { opacity: 0; transform: scale(.2) rotate(0deg) } 82% { opacity: 1; transform: scale(1) rotate(25deg) } }
.taffy-bubble { animation: taffy-bubble 1.8s ease-out infinite; transform-box: fill-box; transform-origin: center; opacity: 0; }
@keyframes taffy-bubble { 0% { opacity: 0; transform: scale(.3) } 30% { opacity: .9 } 100% { opacity: 0; transform: scale(1.5) } }
`

/** The 🔁 button waits in the corner, clear of the table. */
const CORNER = { position: 'fixed' as const, right: 'calc(var(--safe-right, 0px) + 20px)', top: 'calc(var(--top-clear) + 12px)', pointerEvents: 'auto' as const }

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
}

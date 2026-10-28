// Emperor Huddle (plan: planning/around-the-world/poles.html): winter night in Antarctica. One verb, drag a
// penguin into the huddle, that gets richer three times:
//   small     five emperor dads, each with an egg on his feet. The ones on the windy edge slowly get cold: they shiver,
//             go blue and snow piles on their backs. Her finger lifts one (he paddles his feet), carries him into the
//             middle and lets go: the huddle squishes to make room, everyone shuffles, and out of the wind he warms up
//             (pink cheeks, a happy honk). Moving one in pushes another out, so the huddle keeps turning, like a real one.
//   blizzard  two more dads waddle in, the wind gets stronger, and every so often it swings round: they all turn their
//             backs to it and different dads end up on the cold side.
//   hatch     Pebble's papa is out on the edge: bring him in and keep him warm, and his egg wobbles, cracks and hatches.
//             Then gusts blow Pebble off his feet across the ice; she carries the chick back to Papa's feet (the same
//             drag) and Pebble tucks in under his belly.
//   sunrise   the wind drops and the sun peeks over the horizon for the first time in months: everyone turns to look.
// Silly, never "oops": one left out too long sneezes a snowball and waddles in himself; one dropped right on top of
// another pops the other out the top like a cork. Every penguin sings when tapped (or shakes off his snow), the sky
// glows with the southern lights, the moon twinkles, the ice puffs snow.
// The huddle packs as circles on the ice (huddle.ts). Plain SVG written to every frame, no three.js and no Phaser.
// The dads and Pebble are the 2D puppets (puppets/Emperor.tsx, Pebble.tsx) on the painted night (bg-huddle-night).
// Sparkle says what to do from her corner (kit/Guide), the dads talk in Papa's voice and Pebble in Pebble's (L.huddle).
// The sunrise is the payoff: then `onDone` (the stamp). The drag and the warmth are knobs (?feel=1).
import { motion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { BigButton, burst, say, sounds, useElementSize, type Line } from '../../../../../sdk'
import { afterTalk, Guide, type GuideHandle } from '../../../../kit/Guide'
import { knobs, watch } from '../../../../kit/knobs'
import { useSections } from '../../../../kit/sections'
import { noise, sfx, tone } from '../../../../kit/sfx'
import type { ActivityProps } from '../../Place'
import { Emperor, emperorLive, type EmperorLive } from '../../puppets/Emperor'
import { Pebble } from '../../puppets/Pebble'
import night from '../../assets/bg-huddle-night.webp'
import { L } from '../../lines'
import { BIG, DEPTH, HATCH, LATE, onChick, onDad, RADIUS, scaleAt, SMALL, SNUG, TALL, WIDE, type StageDef, type Start } from './huddle'
import HUDDLE_SECTIONS, { type HuddleSection } from './sections'

const FILE = 'src/world/places/poles/activities/huddle/EmperorHuddle.tsx'
/** Her finger on a penguin (live in the feel lab: ?feel=1). Stage units: the wide stage is 1600 x 1000, the tall one
 *  1000 x 1500 (on an iPad a stage unit is about 0.65 px). */
const DRAG = knobs('huddleDrag', 'Drag a penguin', FILE, {
  follow: { value: 16, min: 2, max: 40, step: 1, label: 'Follow her finger', unit: '/s', note: 'how quickly a held penguin catches up with her finger (low = floaty)' },
  lift: { value: 34, min: 0, max: 100, step: 2, label: 'Lift', unit: 'u', note: 'how high a held penguin is lifted off the ice' },
  grab: { value: 30, min: 0, max: 90, step: 2, label: 'Grab reach', unit: 'u', note: 'how far outside a penguin her finger still picks him up' },
  pushHeld: { value: 0.4, min: 0, max: 1, step: 0.05, label: 'Push while held', note: 'how hard a held penguin shoves the others aside (0 = he floats over them)' },
  squish: { value: 9, min: 1, max: 30, step: 0.5, label: 'Squish', unit: '/s', note: 'how quickly the huddle makes room (low = soft and slow)' },
  snug: { value: 70, min: 0, max: 200, step: 5, label: 'Huddle together', unit: 'u/s', note: 'how fast warm penguins shuffle up to touch the huddle (cold ones are too frozen to move)' },
  drift: { value: 30, min: 0, max: 120, step: 5, label: 'Back to the middle', unit: 'u/s', note: 'how fast the whole huddle shuffles back to the middle of the ice' },
  cork: { value: 0.38, min: 0.1, max: 0.9, step: 0.02, label: 'Cork pop', note: 'squeezed this far into another when let go (0.2 is a careful drop, 0.4 a hard shove), the other pops out the top' },
})
const WARM = knobs('huddle', 'Wind and warmth', FILE, {
  warm: { value: 3, min: 0.5, max: 12, step: 0.5, label: 'Warm-up time', unit: 's', note: 'cold to warm, out of the wind in the huddle' },
  cool: { value: 15, min: 4, max: 60, step: 1, label: 'Cool-down time', unit: 's', note: 'warm to cold on the windy edge' },
  blizzard: { value: 1.4, min: 1, max: 3, step: 0.1, label: 'Blizzard is colder', unit: '×', note: 'how much faster they cool in the blizzard' },
  alone: { value: 1.8, min: 1, max: 4, step: 0.1, label: 'Alone is colder', unit: '×', note: 'how much faster one touching nobody cools' },
  shiver: { value: 0.4, min: 0.1, max: 0.8, step: 0.05, label: 'Shivers below', note: 'how cold before he shivers (warmed up from there, he counts)' },
  shelter: { value: 2.4, min: 1.2, max: 5, step: 0.1, label: 'Shelter reach', note: 'how far upwind a neighbour still blocks the wind (in penguin widths)' },
  small: { value: 5, min: 1, max: 20, step: 1, label: 'Warm-ups, small huddle', note: 'cold dads warmed up before the blizzard' },
  big: { value: 8, min: 1, max: 30, step: 1, label: 'Warm-ups, blizzard', note: 'cold dads warmed up before the egg' },
  turn: { value: 18, min: 6, max: 60, step: 1, label: 'Wind turns every', unit: 's', note: 'in the blizzard' },
  sneeze: { value: 10, min: 3, max: 30, step: 1, label: 'Sneeze after', unit: 's', note: 'frozen this long, he sneezes a snowball and waddles in himself' },
  egg: { value: 5, min: 1, max: 20, step: 0.5, label: 'Egg hatches after', unit: 's', note: "of Pebble's papa being warm" },
  gusts: { value: 3, min: 1, max: 8, step: 1, label: 'Gusts', note: 'times the wind blows Pebble out before the sunrise' },
  gustEvery: { value: 7, min: 2, max: 20, step: 0.5, label: 'Gust after', unit: 's', note: 'once Pebble is tucked back in' },
  tuck: { value: 110, min: 40, max: 260, step: 5, label: 'Tuck reach', unit: 'u', note: "how near Papa's feet Pebble must be let go to tuck in" },
})

const INK = '#4A3B57'
const SNOW = '#F7FAFE'
const MAX_DADS = 7
/** The painted night: its shape, where its horizon is (a fraction of its height), and the colors at its edges. */
const NIGHT = { aspect: 1536 / 1024, horizon: 532 / 1024, top: '#1E275B', ice: '#C2CFEF' }

/** What Sparkle says to do at each moment (L.huddle): spoken when it changes (`speak`), and her hint when stuck. */
export type Cue = 'small' | 'more' | 'blizzard' | 'turned' | 'hatch' | 'hatched' | 'blown' | 'sunrise' | 'done'
/** A friend's line: Papa's (one of the dads) or Pebble's. */
export type Talk = 'cold' | 'thanks' | 'egg' | 'hatched' | 'blown' | 'tucked' | 'sunrise' | 'hi'
export type Fact = 'egg' | 'coldest' | 'night'

type Step = 'small' | 'more' | 'blizzard' | 'egg' | 'chick' | 'sunrise'
type Wind = 'left' | 'right'
type Phase = 'play' | 'end'

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const ease = (p: number) => (p <= 0 ? 0 : p >= 1 ? 1 : p * p * (3 - 2 * p))

// ---------------------------------------------------------------- drawing: the puppets (puppets/Emperor.tsx, Pebble.tsx)

// The huddle moves each one about (its root and body groups); the puppet draws him, breathes, blinks, watches her
// finger and reads how cold and snowy he is, the egg and his beak from `live` every frame.
function DadEl({ i, live }: { i: number; live: EmperorLive }) {
  const k = `d${i}`
  return (
    <g data-k={k} data-dad={i} transform="translate(-9999 0)">
      <ellipse data-k={`${k}-shadow`} cx={10} cy={0} rx={58} ry={13} fill="#6E76A8" opacity={0.35} />
      <g data-k={`${k}-body`}>
        <Emperor embed live={live} />
      </g>
    </g>
  )
}

function ChickEl({ live }: { live: { cold: number } }) {
  return (
    <g data-k="chick" transform="translate(-9999 0)">
      <ellipse data-k="chick-shadow" cx={4} cy={0} rx={30} ry={7} fill="#6E76A8" opacity={0.3} />
      <g data-k="chick-body">
        <Pebble embed live={live} />
      </g>
    </g>
  )
}

// ---------------------------------------------------------------- the runtime (plain objects, written every frame)

interface Anim {
  kind: 'hop' | 'sing' | 'shake' | 'sneeze' | 'land' | 'turn'
  t0: number
}
interface Dad {
  i: number
  on: boolean
  x: number
  y: number
  speed: number
  warmth: number
  cold: boolean
  coldFor: number
  exposed: boolean
  alone: boolean
  snow: number
  face: number
  lift: number
  held: boolean
  walk: { x: number; y: number } | null
  /** Seconds on the current walk (a walk the huddle blocks gives up). */
  walkFor: number
  cork: { x0: number; y0: number; x1: number; y1: number; t0: number } | null
  anim: Anim | null
  egg: boolean
  /** What the puppet reads every frame. */
  live: EmperorLive
  els: Record<string, SVGElement>
}
interface Chick {
  state: 'egg' | 'tucked' | 'tumble' | 'out' | 'held'
  x: number
  y: number
  lift: number
  face: number
  tumble: { x0: number; y0: number; x1: number; y1: number; t0: number } | null
  outAt: number
  chirpAt: number
  hop: number
}
interface Events {
  section: (s: HuddleSection, p: Record<string, string>) => void
  /** Sparkle's instruction changed (spoken when `speak`). */
  cue: (c: Cue, speak: boolean) => void
  /** A friend talks: Papa (the dad `dad`, whose beak moves) or Pebble. */
  talk: (who: 'papa' | 'pebble', what: Talk) => void
  /** Something true about it, the first time it comes up. */
  fact: (f: Fact) => void
  dots: (n: number, of: number) => void
  phase: (p: Phase) => void
}

class HuddleWorld {
  dads: Dad[] = []
  chick: Chick
  stage: StageDef
  section: HuddleSection
  step: Step
  windFrom: Wind
  /** Where the wind blows to, as an angle on the ice (0 = to the right, from the left). */
  angle: number
  angleTo: number
  windInt = 0.55
  windIntTo = 0.55
  gustT = -9
  nextTurn = 0
  turning = false
  warmups = 0
  goal = 0
  pebble = 0
  eggP = 0
  tucks = 0
  gustAt = 0
  sunT = 0
  sunStart = -1
  sunCheer = false
  corks = 0
  squeeze = 0
  sneezes = 0
  later: { at: number; fn: () => void }[] = []
  finger: { id: number; x: number; y: number; sx: number; sy: number; t0: number; moved: number; dx: number; dy: number; what: Dad | 'chick' | null; speed: number; tl: number } | null = null
  lastTouch = 0
  nextWhoosh = 0
  aurora = -9
  moonPulse = -9
  cueNow: Cue | '' = ''
  /** The dad whose beak moves with Papa's voice. */
  talker = 0
  gusts = 0
  turns = 0
  order = ''
  streaks: { el: SVGLineElement; u: number; v: number; len: number; spd: number }[] = []
  vb = { x: 0, y: 0, w: 1600, h: 1000 }
  now = 0
  els: Record<string, SVGElement | null> = {}

  constructor(
    private svg: SVGSVGElement,
    stage: StageDef,
    section: HuddleSection,
    wind: Wind,
    chick: 'egg' | 'hatched',
    private ev: Events,
    lives: EmperorLive[],
    private chickLive: { cold: number },
  ) {
    this.stage = stage
    this.section = section
    this.windFrom = wind
    this.angle = this.angleTo = wind === 'left' ? 0 : Math.PI
    const q = <T extends SVGElement>(k: string) => svg.querySelector(`[data-k="${k}"]`) as T
    for (const k of ['layer', 'chick', 'chick-body', 'chick-shadow', 'sun', 'moon', 'stars', 'aurora', 'sunrise', 'icewarm', 'hint', 'fx']) this.els[k] = q(k)
    for (const el of svg.querySelectorAll<SVGLineElement>('[data-k="streak"]')) this.streaks.push({ el, u: Math.random(), v: Math.random(), len: 30 + Math.random() * 50, spd: 0.7 + Math.random() * 0.6 })
    for (let i = 0; i < MAX_DADS; i++) {
      const keys = ['', '-body', '-shadow']
      const els: Record<string, SVGElement> = {}
      for (const s of keys) els[s.slice(1) || 'root'] = q(`d${i}${s}`)
      this.dads.push({ i, on: false, x: -9999, y: 0, speed: 0, warmth: 1, cold: false, coldFor: 0, exposed: false, alone: false, snow: 0, face: 1, lift: 0, held: false, walk: null, walkFor: 0, cork: null, anim: null, egg: true, live: lives[i], els })
    }
    // Where to start: each section as if she had played to there.
    const starts: Start[] = section === 'small' ? SMALL : section === 'blizzard' ? BIG : section === 'hatch' && chick === 'egg' ? HATCH : SNUG
    this.place(starts)
    this.chick = { state: 'egg', x: 0, y: 0, lift: 0, face: 1, tumble: null, outAt: 0, chirpAt: 0, hop: -9 }
    this.step = 'small'
    if (section === 'small') {
      this.goal = WARM.small
      this.windInt = this.windIntTo = 0.55
    } else if (section === 'blizzard') {
      this.step = 'blizzard'
      this.goal = WARM.big
      this.windInt = this.windIntTo = 1
      this.nextTurn = WARM.turn
    } else if (section === 'hatch') {
      this.pebble = 0
      this.windInt = this.windIntTo = 0.7
      if (chick === 'egg') {
        this.step = 'egg'
        this.goal = 3
      } else {
        this.hatchNow(true)
      }
    } else {
      this.pebble = 0
      this.hatchNow(true)
      this.tucks = WARM.gusts
      this.later.push({ at: 0.8, fn: () => this.sunrise() })
    }
    const step = this.step as Step
    if (step !== 'sunrise') this.ev.dots(step === 'chick' ? this.tucks : 0, step === 'chick' ? WARM.gusts : this.goal)
    // The cold dad alone on the edge says so first, then Sparkle says what to do.
    if (section === 'small') this.talk('papa', 'cold', 0)
    this.cue(section === 'hatch' && chick === 'hatched' ? 'hatched' : section)
    this.tick(0)
  }

  /** Puts the dads at their starting spots (mirrored when the wind comes from the right) and lets them settle. */
  private place(starts: Start[]) {
    const st = this.stage
    const m = this.windFrom === 'left' ? 1 : -1
    starts.forEach((s, i) => {
      const d = this.dads[i]
      d.on = true
      d.x = st.home[0] + s.dx * RADIUS * st.base * m
      d.y = st.home[1] + s.dy * RADIUS * DEPTH * st.base
      d.warmth = s.warm
      d.cold = s.warm < WARM.shiver
      d.snow = d.cold ? 0.7 : s.warm < 0.6 ? 0.3 : 0
      d.face = m
    })
    for (let k = 0; k < 60; k++) this.pack(1 / 30, true)
  }

  setStage(st: StageDef) {
    const old = this.stage
    if (old === st) return
    // The new stage first, so walk targets are clamped to its field, not the old one.
    this.stage = st
    const k = st.base / old.base
    const move = (x: number, y: number): [number, number] => [st.home[0] + (x - old.home[0]) * k, st.home[1] + (y - old.home[1]) * k]
    for (const d of this.dads) {
      if (!d.on) continue
      ;[d.x, d.y] = move(d.x, d.y)
      d.walk = d.walk && this.clampSpot(...move(d.walk.x, d.walk.y))
      if (d.cork) {
        ;[d.x, d.y] = move(d.cork.x1, d.cork.y1)
        d.cork = null
      }
    }
    ;[this.chick.x, this.chick.y] = move(this.chick.x, this.chick.y)
    if (this.chick.tumble) {
      ;[this.chick.x, this.chick.y] = move(this.chick.tumble.x1, this.chick.tumble.y1)
      this.chick.tumble = null
      this.chick.state = 'out'
    }
    for (const d of this.dads) if (d.on) this.clampDad(d)
  }

  private cue(c: Cue, speak = true) {
    if (c === this.cueNow) return
    this.cueNow = c
    this.ev.cue(c, speak)
  }
  private talk(who: 'papa' | 'pebble', what: Talk, dad = this.pebble) {
    if (who === 'papa') this.talker = dad
    this.ev.talk(who, what)
  }

  // -------------------------------------------------------------- geometry

  r(d: Dad) {
    return RADIUS * scaleAt(this.stage, d.y)
  }
  /** Where the wind blows to, on the ice (squashed depth undone). */
  wind(): [number, number] {
    return [Math.cos(this.angle), Math.sin(this.angle)]
  }
  private clampSpot(x: number, y: number) {
    const f = this.stage.field
    return { x: Math.min(f.r, Math.max(f.l, x)), y: Math.min(f.b, Math.max(f.t, y)) }
  }
  private clampDad(d: Dad) {
    const c = this.clampSpot(d.x, d.y)
    d.x = c.x
    d.y = c.y
  }
  private ground(d: Dad) {
    return d.on && !d.cork && !d.held
  }
  /** A free spot on the side of the huddle away from the wind (where a dad who comes in by himself goes). */
  leeSpot(not?: Dad) {
    const ds = this.dads.filter((d) => this.ground(d) && d !== not)
    if (!ds.length) return { x: this.stage.home[0], y: this.stage.home[1] }
    const cx = ds.reduce((s, d) => s + d.x, 0) / ds.length
    const cy = ds.reduce((s, d) => s + d.y, 0) / ds.length
    const rc = Math.max(...ds.map((d) => Math.hypot(d.x - cx, (d.y - cy) / DEPTH)))
    const [wx, wy] = this.wind()
    const R = RADIUS * this.stage.base
    const side = (Math.random() - 0.5) * 2 * R
    return this.clampSpot(cx + wx * (rc + 1.4 * R) - wy * side, cy + (wy * (rc + 1.4 * R) + wx * side) * DEPTH)
  }

  // -------------------------------------------------------------- her finger

  toStage(e: { clientX: number; clientY: number }): [number, number] {
    const m = this.svg.getScreenCTM()
    if (!m) return [0, 0]
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    return [p.x, p.y]
  }

  /** The chick or the dad under her finger, front first. */
  private hit(x: number, y: number): Dad | 'chick' | null {
    const c = this.chick
    const items: (Dad | 'chick')[] = this.dads.filter((d) => d.on && !d.cork)
    if (c.state === 'out' || c.state === 'tucked' || c.state === 'tumble') items.push('chick')
    const depth = (it: Dad | 'chick') => (it === 'chick' ? (c.state === 'tucked' ? this.dads[this.pebble].y + 2 : c.y + 1) : it.y)
    items.sort((a, b) => depth(b) - depth(a))
    for (const it of items) {
      if (it === 'chick') {
        const [cx, cy, s] = this.chickSpot()
        if (onChick((x - cx) / s, (y - cy) / s, DRAG.grab / s)) return it
      } else {
        const s = scaleAt(this.stage, it.y)
        if (onDad((x - it.x) / (s * (it.face < 0 ? -1 : 1)), (y - it.y + it.lift * DRAG.lift) / s, DRAG.grab / s)) return it
      }
    }
    return null
  }

  down(e: RPointerEvent) {
    if (this.finger) return
    const [x, y] = this.toStage(e)
    this.lastTouch = this.now
    const what = this.step === 'sunrise' ? null : this.hit(x, y)
    let dx = 0
    let dy = 0
    if (what === 'chick') {
      // A tucked chick stays put (a tap is a chirp); one out on the ice is carried.
      if (this.chick.state === 'out' || this.chick.state === 'tumble') {
        const [cx, cy] = this.chickSpot()
        dx = cx - x
        dy = cy - y
        this.chick.state = 'held'
        this.chick.tumble = null
        sounds.pickup()
      }
    } else if (what) {
      dx = what.x - x
      dy = what.y - y
      what.held = true
      what.walk = null
      what.anim = null
      sounds.pickup()
      this.ev.fact('egg')
    }
    this.finger = { id: e.pointerId, x, y, sx: e.clientX, sy: e.clientY, t0: this.now, moved: 0, dx, dy, what, speed: 0, tl: this.now }
  }

  move(e: RPointerEvent) {
    const f = this.finger
    if (!f || f.id !== e.pointerId) return
    const [x, y] = this.toStage(e)
    const dt = Math.max(1 / 120, this.now - f.tl)
    f.speed = f.speed * 0.6 + (Math.hypot(x - f.x, y - f.y) / dt) * 0.4
    f.tl = this.now
    f.x = x
    f.y = y
    f.moved = Math.max(f.moved, Math.hypot(e.clientX - f.sx, e.clientY - f.sy))
    this.lastTouch = this.now
  }

  up(e: RPointerEvent) {
    const f = this.finger
    if (!f || f.id !== e.pointerId) return
    this.finger = null
    this.lastTouch = this.now
    const tap = f.moved < 12 && this.now - f.t0 < 0.35
    const w = f.what
    if (w === 'chick') {
      if (this.chick.state === 'held') this.dropChick()
      if (tap) this.pokeChick()
    } else if (w) {
      w.held = false
      w.anim = { kind: 'land', t0: this.now }
      if (tap) this.pokeDad(w)
      else {
        sounds.place()
        this.corkCheck(w)
      }
    } else if (tap) this.pokeScene(f.x, f.y)
  }

  // -------------------------------------------------------------- pokes and silly moments

  private pokeDad(d: Dad) {
    if (d.snow > 0.35) {
      d.anim = { kind: 'shake', t0: this.now }
      d.snow = 0
      const s = scaleAt(this.stage, d.y)
      this.puff(d.x - 20 * s * d.face, d.y - 170 * s, SNOW)
      noise(0.3, 0.08, 'bandpass', 2200, 900, 0, 1.2)
      return
    }
    // His special call: every emperor dad's song is his own.
    d.anim = { kind: 'sing', t0: this.now }
    const p = 340 + d.i * 22
    tone(p, p * 1.25, 0.16, 0.07, 'triangle')
    tone(p * 1.25, p * 0.95, 0.22, 0.07, 'triangle', 0.17)
  }

  private pokeChick() {
    this.chick.hop = this.now
    sfx.chirp()
  }

  private pokeScene(x: number, y: number) {
    const st = this.stage
    if (y < st.horizon) {
      if (Math.hypot(x - st.moon[0], y - st.moon[1]) < 110 && this.sunT < 0.5) {
        this.moonPulse = this.now
        this.ev.fact('night')
        sounds.sparkle()
      } else {
        this.aurora = this.now
        tone(660, 990, 0.5, 0.04, 'sine')
        tone(880, 1320, 0.5, 0.03, 'sine', 0.12)
      }
      return
    }
    this.puff(x, y, SNOW)
    noise(0.5, 0.06, 'bandpass', 800, 2200, 0, 0.8)
  }

  /** Dropped right on top of another: the other pops out of the top like a cork. */
  private corkCheck(d: Dad) {
    this.squeeze = Math.max(0, ...this.dads.filter((o) => o !== d && this.ground(o)).map((o) => 1 - Math.hypot(o.x - d.x, (o.y - d.y) / DEPTH) / (this.r(o) + this.r(d))))
    for (const o of this.dads) {
      if (o === d || !this.ground(o)) continue
      const dist = Math.hypot(o.x - d.x, (o.y - d.y) / DEPTH)
      if (dist > (1 - DRAG.cork) * (this.r(o) + this.r(d))) continue
      const to = this.leeSpot(o)
      o.cork = { x0: o.x, y0: o.y, x1: to.x, y1: to.y, t0: this.now }
      o.walk = null
      this.corks++
      sounds.pop()
      sfx.boing()
      return
    }
  }

  private sneeze(d: Dad) {
    d.anim = { kind: 'sneeze', t0: this.now }
    d.coldFor = -1e9
    this.sneezes++
    tone(900, 1300, 0.12, 0.06, 'triangle')
    noise(0.25, 0.14, 'bandpass', 1800, 700, 0.18, 1.5)
    const s = scaleAt(this.stage, d.y)
    // A snowball pops off his beak and rolls away.
    const ns = 'http://www.w3.org/2000/svg'
    const g = document.createElementNS(ns, 'g')
    g.setAttribute('transform', `translate(${(d.x + 76 * s * d.face).toFixed(0)} ${(d.y - 186 * s).toFixed(0)})`)
    g.innerHTML = `<circle class="huddle-ball" style="--dx:${(d.face * 140 * s).toFixed(0)}px;--dy:${(186 * s).toFixed(0)}px" r="${(14 * s).toFixed(1)}" fill="${SNOW}" stroke="${INK}" stroke-width="4"/>`
    this.els.fx?.appendChild(g)
    setTimeout(() => g.remove(), 1000)
    this.at(0.7, () => {
      if (!d.held && d.on) d.walk = this.leeSpot(d)
    })
  }

  /** A little burst of snow where something happened. */
  private puff(x: number, y: number, col: string) {
    const ns = 'http://www.w3.org/2000/svg'
    const g = document.createElementNS(ns, 'g')
    g.setAttribute('transform', `translate(${x.toFixed(0)} ${y.toFixed(0)})`)
    g.innerHTML = Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2
      return `<circle class="huddle-fly" style="--dx:${(Math.cos(a) * 60).toFixed(0)}px;--dy:${(Math.sin(a) * 40).toFixed(0)}px" r="9" fill="${col}" stroke="#9FB4D6" stroke-width="2"/>`
    }).join('')
    this.els.fx?.appendChild(g)
    setTimeout(() => g.remove(), 800)
  }

  private at(sec: number, fn: () => void) {
    this.later.push({ at: this.now + sec, fn })
  }

  // -------------------------------------------------------------- the story steps

  private warmedUp(d: Dad) {
    d.cold = false
    d.coldFor = 0
    d.anim = { kind: 'hop', t0: this.now }
    tone(520, 700, 0.12, 0.06, 'triangle')
    if (d.snow > 0.2) {
      const s = scaleAt(this.stage, d.y)
      this.puff(d.x - 20 * s * d.face, d.y - 170 * s, SNOW)
      d.snow = 0
    }
    if (this.step !== 'small' && this.step !== 'blizzard') return
    this.warmups++
    if (this.warmups === 1 || this.warmups % 3 === 0) this.talk('papa', 'thanks', d.i)
    sounds.note(Math.min(10, 1 + Math.round((this.warmups / this.goal) * 9)))
    this.ev.dots(this.warmups, this.goal)
    if (this.warmups < this.goal) return
    if (this.step === 'small') this.toBlizzard()
    else this.toEgg()
  }

  private toBlizzard() {
    this.step = 'more'
    sounds.sparkle()
    this.cue('more')
    this.at(0.8, () => {
      const st = this.stage
      const m = this.windFrom === 'left' ? 1 : -1
      LATE.forEach((s, j) => {
        const d = this.dads[SMALL.length + j]
        d.on = true
        d.x = m > 0 ? this.vb.x + this.vb.w + 120 : this.vb.x - 120
        d.y = st.home[1] + s.dy * RADIUS * DEPTH * st.base
        d.warmth = s.warm
        d.face = -m
        d.walk = { x: st.home[0] + s.dx * RADIUS * st.base * m, y: d.y }
      })
    })
    this.at(3.4, () => {
      this.step = 'blizzard'
      this.section = 'blizzard'
      this.warmups = 0
      this.goal = WARM.big
      this.windIntTo = 1
      this.gustT = this.now
      this.nextTurn = this.now + WARM.turn
      noise(1.6, 0.12, 'bandpass', 500, 1400, 0, 0.7)
      this.ev.section('blizzard', { wind: this.windFrom })
      this.ev.dots(0, this.goal)
      this.cue('blizzard')
      this.ev.fact('coldest')
    })
  }

  private toEgg() {
    this.step = 'egg'
    this.section = 'hatch'
    this.windIntTo = 0.7
    // Pebble's papa is the dad out on the cold edge right now.
    const ds = this.dads.filter((d) => d.on)
    const pick = ds.filter((d) => d.exposed).sort((a, b) => a.warmth - b.warmth)[0] ?? ds.sort((a, b) => a.warmth - b.warmth)[0]
    this.pebble = pick.i
    pick.warmth = Math.min(pick.warmth, 0.3)
    pick.cold = true
    pick.anim = { kind: 'sing', t0: this.now }
    this.eggP = 0
    this.goal = 3
    sounds.sparkle()
    this.ev.section('hatch', { wind: this.windFrom, chick: 'egg' })
    this.ev.dots(0, 3)
    this.talk('papa', 'egg')
    this.cue('hatch')
  }

  /** Pebble is out of the egg, on Papa's feet. */
  private hatchNow(quiet = false) {
    this.step = 'chick'
    this.section = 'hatch'
    this.dads[this.pebble].egg = false
    this.chick.state = 'tucked'
    this.tucks = 0
    this.gustAt = this.now + (quiet ? 2.5 : 3.5)
    if (quiet) return
    const d = this.dads[this.pebble]
    const s = scaleAt(this.stage, d.y)
    this.puff(d.x + 24 * s * d.face, d.y - 20 * s, '#FFF3DA')
    sfx.crack()
    sounds.sparkle()
    setTimeout(() => sfx.chirp(), 250)
    this.chick.hop = this.now + 0.2
    this.dads.forEach((o, i) => o.on && (o.anim = { kind: 'hop', t0: this.now + 0.3 + i * 0.12 }))
    this.ev.section('hatch', { wind: this.windFrom, chick: 'hatched' })
    this.ev.dots(0, WARM.gusts)
    this.talk('papa', 'hatched')
    this.talk('pebble', 'hi')
    // No “tuck Pebble back” yet: Pebble is still on Papa's feet until the first gust.
    this.cue('hatched', false)
  }

  /** A gust blows Pebble off Papa's feet, rolling across the ice. */
  private gust() {
    const c = this.chick
    const d = this.dads[this.pebble]
    const [x0] = this.chickSpot()
    const [wx, wy] = this.wind()
    const far = (300 + Math.random() * 100) * this.stage.base
    const side = (Math.random() - 0.5) * 120 * this.stage.base
    const to = this.clampSpot(d.x + wx * far - wy * side, d.y + (wy * far + wx * side) * DEPTH)
    // Don't roll it right back onto Papa's feet: if the edge of the ice stops it close, roll the other way along it.
    if (Math.hypot(to.x - d.x, (to.y - d.y) / DEPTH) < WARM.tuck * 1.6) to.x = this.clampSpot(d.x - wx * far, 0).x
    c.state = 'tumble'
    c.tumble = { x0, y0: d.y, x1: to.x, y1: to.y, t0: this.now }
    c.x = x0
    c.y = d.y
    this.gustT = this.now
    noise(1.2, 0.16, 'bandpass', 600, 1800, 0, 0.7)
    sfx.chirp()
    d.anim = { kind: 'sing', t0: this.now + 0.3 }
    this.gusts++
    this.talk(this.gusts % 2 ? 'pebble' : 'papa', 'blown')
    // Sparkle says it the first time; after that it's her hint.
    this.cue('blown', this.gusts === 1)
  }

  private dropChick() {
    const c = this.chick
    c.state = 'out'
    c.outAt = this.now
    const d = this.dads[this.pebble]
    const s = scaleAt(this.stage, d.y)
    const fx = d.x + 26 * s * d.face
    if (Math.hypot(c.x - fx, (c.y - d.y) / DEPTH) < WARM.tuck) this.tuck()
    else sounds.place()
  }

  private tuck() {
    const c = this.chick
    const d = this.dads[this.pebble]
    c.state = 'tucked'
    c.tumble = null
    c.hop = this.now
    d.walk = null
    d.anim = { kind: 'hop', t0: this.now + 0.1 }
    sfx.fwip()
    setTimeout(() => sfx.chirp(), 150)
    this.tucks++
    this.talk(this.tucks % 2 ? 'papa' : 'pebble', 'tucked')
    this.cue('hatched', false)
    sounds.note(Math.min(10, 2 + this.tucks * 2))
    this.ev.dots(this.tucks, WARM.gusts)
    if (this.tucks >= WARM.gusts) this.at(1.4, () => this.sunrise())
    else this.gustAt = this.now + WARM.gustEvery
  }

  private sunrise() {
    if (this.step === 'sunrise') return
    this.step = 'sunrise'
    this.section = 'sunrise'
    this.windIntTo = 0.06
    this.sunStart = this.now + 1.2
    for (const d of this.dads) d.held = false
    // Papa steps out to the front of the huddle, so Pebble sees the sun too.
    const pd = this.dads[this.pebble]
    const front = Math.max(...this.dads.filter((d) => d.on && d !== pd).map((d) => d.y))
    pd.walk = this.clampSpot(pd.x * 0.5 + this.stage.home[0] * 0.5, front + 1.6 * this.r(pd) * DEPTH)
    this.ev.section('sunrise', {})
    this.ev.dots(0, 0)
    this.cue('sunrise')
    this.at(4.5, () => {
      this.talk('papa', 'sunrise')
      this.talk('pebble', 'sunrise')
    })
  }

  // -------------------------------------------------------------- every frame

  /** Pushes overlapping penguins apart (the huddle squishes to make room), and pulls the warm ones together. */
  private pack(dt: number, settle = false) {
    const ds = this.dads.filter((d) => d.on && !d.cork)
    const k = settle ? 1 : Math.min(1, dt * DRAG.squish)
    for (let a = 0; a < ds.length; a++) {
      for (let b = a + 1; b < ds.length; b++) {
        const p = ds[a]
        const q = ds[b]
        let dx = q.x - p.x
        let dy = (q.y - p.y) / DEPTH
        let d = Math.hypot(dx, dy)
        const min = this.r(p) + this.r(q)
        if (d >= min) continue
        if (d < 0.01) {
          dx = Math.random() - 0.5
          dy = Math.random() - 0.5
          d = Math.hypot(dx, dy)
        }
        const nx = dx / d
        const ny = dy / d
        const over = (min - d) * k
        // A held penguin doesn't move; he shoves the other with "push while held".
        const wp = p.held ? 0 : q.held ? DRAG.pushHeld : 0.5
        const wq = q.held ? 0 : p.held ? DRAG.pushHeld : 0.5
        p.x -= nx * over * wp
        p.y -= ny * over * wp * DEPTH
        q.x += nx * over * wq
        q.y += ny * over * wq * DEPTH
      }
    }
    if (settle) {
      for (const d of ds) this.clampDad(d)
      return
    }
    // Warm ones shuffle up to touch the huddle (the cold ones are too frozen to move).
    const ground = ds.filter((d) => !d.held)
    for (const d of ground) {
      if (d.walk || d.warmth < 0.5 || ground.length < 2) continue
      const all = ground.filter((o) => o !== d)
      const snug = all.filter((o) => o.warmth >= 0.5)
      const others = snug.length ? snug : all
      const near = Math.min(...others.map((o) => Math.hypot(o.x - d.x, (o.y - d.y) / DEPTH) - this.r(o) - this.r(d)))
      if (near < 6) continue
      const cx = others.reduce((s, o) => s + o.x, 0) / others.length
      const cy = others.reduce((s, o) => s + o.y, 0) / others.length
      const dx = cx - d.x
      const dy = (cy - d.y) / DEPTH
      const l = Math.hypot(dx, dy) || 1
      const v = Math.min(DRAG.snug * dt, near)
      d.x += (dx / l) * v
      d.y += (dy / l) * v * DEPTH
    }
    // The whole huddle slowly shuffles back to the middle of the ice (it drifts downwind as she moves them in).
    const moving = ground.filter((d) => !d.cold && !d.walk)
    if (moving.length) {
      const st = this.stage
      const cx = ground.reduce((s, d) => s + d.x, 0) / ground.length
      const cy = ground.reduce((s, d) => s + d.y, 0) / ground.length
      const ox = st.home[0] - cx
      const oy = (st.home[1] - cy) / DEPTH
      const l = Math.hypot(ox, oy)
      const slack = RADIUS * st.base
      if (l > slack) {
        const v = Math.min(DRAG.drift * dt, l - slack)
        for (const d of moving) {
          d.x += (ox / l) * v
          d.y += (oy / l) * v * DEPTH
        }
      }
    }
    for (const d of ds) this.clampDad(d)
  }

  /** Who is out of the wind: a neighbour upwind, close enough and in line, blocks it. */
  private shelter() {
    const [wx, wy] = this.wind()
    const ds = this.dads.filter((d) => this.ground(d))
    for (const d of this.dads) {
      if (!this.ground(d)) continue
      let shelter = false
      let alone = true
      for (const o of ds) {
        if (o === d) continue
        const dx = o.x - d.x
        const dy = (o.y - d.y) / DEPTH
        const dist = Math.hypot(dx, dy)
        const min = this.r(o) + this.r(d)
        if (dist < min * 1.35) alone = false
        const along = -(dx * wx + dy * wy)
        const across = Math.abs(dx * wy - dy * wx)
        if (along > 0 && along < WARM.shelter * min && across < min * 0.8) shelter = true
      }
      d.exposed = !shelter || alone
      d.alone = alone
    }
  }

  tick(dt: number) {
    this.now += dt
    const now = this.now
    const st = this.stage
    // Things waiting their turn.
    if (this.later.length) {
      const due = this.later.filter((l) => l.at <= now)
      this.later = this.later.filter((l) => l.at > now)
      due.forEach((l) => l.fn())
    }
    // The wind: it swings round in the blizzard, gusts in the hatch, drops at sunrise.
    if (this.step === 'blizzard' && now >= this.nextTurn && !this.turning) {
      this.turning = true
      this.windFrom = this.windFrom === 'left' ? 'right' : 'left'
      this.angleTo = this.windFrom === 'left' ? 0 : Math.PI
      this.gustT = now
      noise(2.2, 0.14, 'bandpass', 400, 1600, 0, 0.6)
      // Said the first two times; after that the whoosh says it.
      if (++this.turns <= 2) this.ev.cue('turned', true)
    }
    const da = this.angleTo - this.angle
    if (Math.abs(da) > 0.002) this.angle += da * Math.min(1, dt * 1.1)
    else if (this.turning) {
      this.angle = this.angleTo
      this.turning = false
      this.nextTurn = now + WARM.turn
      if (this.step === 'blizzard') this.ev.section('blizzard', { wind: this.windFrom })

    }
    this.windInt += (this.windIntTo - this.windInt) * Math.min(1, dt * 0.8)
    const gust = Math.max(0, 1 - (now - this.gustT) / 1.6)
    const windNow = this.windInt + gust * 0.9
    if (now >= this.nextWhoosh && windNow > 0.2) {
      this.nextWhoosh = now + 1.6 + Math.random() * 1.6
      noise(1.6, 0.03 * windNow, 'bandpass', 380 + Math.random() * 300, 260, 0, 0.6)
    }
    const [wx] = this.wind()
    const downwind = Math.abs(wx) > 0.2 ? Math.sign(wx) : 0

    // Her finger carries a dad or the chick.
    const f = this.finger
    for (const d of this.dads) {
      if (!d.on) continue
      const px = d.x
      const py = d.y
      if (d.held && f) {
        const t = this.clampSpot(f.x + f.dx, f.y + f.dy)
        const k = Math.min(1, dt * DRAG.follow)
        d.x += (t.x - d.x) * k
        d.y += (t.y - d.y) * k
      } else if (d.cork) {
        const p = (now - d.cork.t0) / 0.9
        if (p >= 1) {
          d.x = d.cork.x1
          d.y = d.cork.y1
          d.cork = null
          d.anim = { kind: 'land', t0: now }
          sfx.thump()
        } else {
          d.x = d.cork.x0 + (d.cork.x1 - d.cork.x0) * ease(p)
          d.y = d.cork.y0 + (d.cork.y1 - d.cork.y0) * ease(p)
        }
      } else if (d.walk) {
        const dx = d.walk.x - d.x
        const dy = (d.walk.y - d.y) / DEPTH
        const l = Math.hypot(dx, dy)
        const v = 230 * st.base * dt
        d.walkFor += dt
        if (l < 12 || d.walkFor > 6) {
          d.walk = null
          d.walkFor = 0
        } else {
          d.x += (dx / l) * Math.min(v, l)
          d.y += (dy / l) * Math.min(v, l) * DEPTH
        }
      }
      if (!d.walk) d.walkFor = 0
      d.lift += ((d.held ? 1 : 0) - d.lift) * Math.min(1, dt * 14)
      if (dt > 0) d.speed = d.speed * 0.8 + (Math.hypot(d.x - px, d.y - py) / dt) * 0.2
    }
    if (dt > 0) this.pack(dt)
    this.shelter()

    // Warmth: out of the wind they warm up, on the windy edge they cool down.
    const coldK = this.step === 'blizzard' || this.step === 'more' ? WARM.blizzard : this.step === 'chick' ? 0.7 : 1
    for (const d of this.dads) {
      if (!d.on) continue
      if (this.step === 'sunrise') {
        d.warmth = Math.min(1, d.warmth + dt / 2)
        d.cold = false
      } else if (!d.held && !d.cork) {
        if (!d.exposed) d.warmth += dt / WARM.warm
        else d.warmth -= (dt / WARM.cool) * coldK * (d.alone ? WARM.alone : 1)
        d.warmth = clamp01(d.warmth)
        if (d.warmth < WARM.shiver && !d.cold) {
          d.cold = true
          tone(300, 270, 0.3, 0.025, 'square')
        }
        if (d.cold && d.warmth >= 0.95) this.warmedUp(d)
        if (d.warmth < 0.12 && !d.walk) d.coldFor += dt
        else if (d.warmth > 0.2) d.coldFor = Math.max(0, d.coldFor)
        if (d.coldFor > WARM.sneeze) this.sneeze(d)
      }
      d.snow = clamp01(d.snow + dt * (d.exposed && !d.held && this.step !== 'sunrise' ? 0.05 * (0.5 + windNow) : -0.12))
      // Backs to the wind (at sunrise, faces to the sun).
      const want = this.step === 'sunrise' && this.sunStart >= 0 && now > this.sunStart + 1 ? Math.sign(st.sunX - d.x) || 1 : d.walk ? Math.sign(d.walk.x - d.x) || d.face : downwind || Math.sign(d.face) || 1
      d.face += (want - d.face) * Math.min(1, dt * 6)
      if (Math.abs(d.face) < 0.15 && Math.abs(want - d.face) < 0.01) d.face = want
    }

    // The egg and the chick.
    const pd = this.dads[this.pebble]
    if (this.step === 'egg') {
      if (pd.warmth > 0.7 && !pd.held) {
        const was = Math.floor(this.eggP * 3)
        this.eggP = Math.min(1, this.eggP + dt / WARM.egg)
        const n = Math.floor(this.eggP * 3)
        if (n > was) {
          if (n >= 3) this.hatchNow()
          else {
            sfx.crack()
            this.ev.dots(n, 3)
          }
        }
      }
    }
    const c = this.chick
    if (this.step === 'chick') {
      if (c.state === 'tucked' && this.tucks < WARM.gusts && now >= this.gustAt && !pd.held) this.gust()
      if (c.state === 'tumble' && c.tumble) {
        const p = (now - c.tumble.t0) / 0.9
        if (p >= 1) {
          c.x = c.tumble.x1
          c.y = c.tumble.y1
          c.tumble = null
          c.state = 'out'
          c.outAt = now
          c.chirpAt = now + 1.5
          sfx.thump()
        } else {
          c.x = c.tumble.x0 + (c.tumble.x1 - c.tumble.x0) * ease(p)
          c.y = c.tumble.y0 + (c.tumble.y1 - c.tumble.y0) * ease(p)
        }
      }
      if (c.state === 'out') {
        if (now > c.chirpAt) {
          c.chirpAt = now + 2.6
          sfx.chirp()
        }
        // Left out a long while: Papa waddles over and scoops Pebble up himself.
        if (now - c.outAt > 14 && !pd.held) {
          pd.walk = this.clampSpot(c.x - 26 * scaleAt(st, pd.y) * Math.sign(c.x - pd.x || 1), c.y)
          if (Math.hypot(c.x - pd.x, (c.y - pd.y) / DEPTH) < WARM.tuck) this.tuck()
        }
      }
    }
    if (c.state === 'held' && f) {
      const t = this.clampSpot(f.x + f.dx, f.y + f.dy)
      const k = Math.min(1, dt * DRAG.follow)
      c.x += (t.x - c.x) * k
      c.y += (t.y - c.y) * k
    }
    c.lift += ((c.state === 'held' ? 1 : 0) - c.lift) * Math.min(1, dt * 14)

    // The sunrise.
    if (this.sunStart >= 0 && now > this.sunStart) {
      this.sunT = Math.min(1, (now - this.sunStart) / 7)
      if (this.sunT > 0.5 && !this.sunCheer) {
        this.sunCheer = true
        this.at(1.6, () => this.cue('done'))
        sounds.fanfare()
        burst()
        this.chick.hop = now
        this.dads.forEach((d, i) => d.on && (d.anim = { kind: 'hop', t0: now + 0.2 + i * 0.12 }))
        this.at(5, () => this.ev.phase('end'))
      }
    }

    this.draw(dt, windNow)
  }

  /** Where the chick is drawn: on Papa's feet, or out on the ice. [x, y, scale] */
  chickSpot(): [number, number, number] {
    const c = this.chick
    if (c.state === 'tucked' || c.state === 'egg') {
      const d = this.dads[this.pebble]
      const s = scaleAt(this.stage, d.y)
      return [d.x + 26 * s * d.face, d.y - d.lift * DRAG.lift, s * 0.8]
    }
    return [c.x, c.y - c.lift * DRAG.lift * 0.7, scaleAt(this.stage, c.y)]
  }

  private draw(dt: number, windNow: number) {
    const now = this.now
    const st = this.stage
    const set = (el: SVGElement | null | undefined, k: string, v: string) => el?.setAttribute(k, v)
    // Dads.
    for (const d of this.dads) {
      const e = d.els
      if (!d.on) {
        set(e.root, 'transform', 'translate(-9999 0)')
        continue
      }
      const s = scaleAt(st, d.y)
      let sx = 1
      let sy = 1
      let ty = 0
      let rot = 0
      let flip = 0
      let beak = 0
      let jx = 0
      if (d.cork) {
        const p = (now - d.cork.t0) / 0.9
        ty = -Math.sin(Math.min(1, p) * Math.PI) * 260
        rot = p * 360 * Math.sign(d.cork.x1 - d.cork.x0 || 1)
        flip = -40
      }
      if (d.anim) {
        const t = now - d.anim.t0
        if (t >= 0) {
          const kind = d.anim.kind
          const dur = kind === 'hop' ? 0.6 : kind === 'sing' ? 0.8 : kind === 'shake' ? 0.6 : kind === 'sneeze' ? 0.6 : 0.3
          const p = t / dur
          if (p >= 1) d.anim = null
          else if (kind === 'hop') {
            sy = p < 0.2 ? 1 - 0.16 * (p / 0.2) : p < 0.75 ? 1.07 : 1 - 0.1 * Math.sin(((p - 0.75) / 0.25) * Math.PI)
            sx = 2 - sy
            if (p >= 0.2 && p < 0.75) ty += -50 * Math.sin(((p - 0.2) / 0.55) * Math.PI)
            flip = -30 * Math.sin(p * Math.PI)
          } else if (kind === 'sing') {
            sy = 1 + 0.07 * Math.sin(p * Math.PI)
            sx = 2 - sy
            rot = -8 * Math.sin(p * Math.PI)
            flip = -45 * Math.sin(p * Math.PI) + 10 * Math.sin(t * 30)
            beak = Math.sin(p * Math.PI) * (0.6 + 0.4 * Math.sin(t * 24))
          } else if (kind === 'shake') rot = 9 * Math.sin(t * 34) * (1 - p)
          else if (kind === 'sneeze') {
            rot = p < 0.4 ? -10 * (p / 0.4) : 14 * Math.sin(((p - 0.4) / 0.6) * Math.PI)
            beak = p > 0.35 && p < 0.6 ? 1 : 0
          } else if (kind === 'land') {
            sy = 1 - 0.12 * Math.sin(p * Math.PI)
            sx = 2 - sy
          }
        }
      }
      // Held: lifted, feet paddling, flippers out. Walking or shoved: a waddle.
      const lift = d.lift * DRAG.lift
      if (d.lift > 0.05) {
        rot += Math.sin(now * 16) * 5 * d.lift
        flip += -38 * d.lift
      } else if (d.speed > 25 && !d.cork) rot += Math.sin(now * 13 + d.i) * Math.min(7, d.speed / 25)
      // Shivering.
      const shiver = d.cold && !d.held ? clamp01((WARM.shiver - d.warmth) / WARM.shiver + 0.35) : 0
      if (shiver) jx = Math.sin(now * 47 + d.i * 2) * 3.2 * shiver
      const face = Math.abs(d.face) < 0.06 ? 0.06 * Math.sign(d.face || 1) : d.face
      set(e.root, 'transform', `translate(${d.x.toFixed(1)} ${d.y.toFixed(1)}) scale(${s.toFixed(3)})`)
      set(e.body, 'transform', `translate(${jx.toFixed(1)} ${(ty - lift / s).toFixed(1)}) rotate(${rot.toFixed(2)} 0 -90) scale(${(face * sx).toFixed(3)} ${sy.toFixed(3)})`)
      set(e.shadow, 'transform', `scale(${(1 - d.lift * 0.3).toFixed(3)})`)
      set(e.shadow, 'opacity', (0.35 * (1 - d.lift * 0.4) * (d.cork ? 0.4 : 1)).toFixed(2))
      // What the puppet draws itself: cold, snow, the flipper, the beak, the egg.
      const L = d.live
      L.cold = clamp01((0.65 - d.warmth) / 0.65)
      L.snow = d.snow
      L.lift = d.lift
      L.flip = flip
      L.beak = beak
      L.speaks = d.i === this.talker
      // The egg: Pebble's (pink) wobbles and cracks as Papa keeps it warm.
      const isPebble = d.i === this.pebble && (this.step === 'egg' || this.section === 'hatch')
      L.egg = d.egg ? (isPebble && this.step === 'egg' ? 2 : 1) : 0
      L.wob = isPebble && this.step === 'egg' && this.eggP > 0 ? Math.sin(now * (8 + this.eggP * 14)) * (3 + this.eggP * 9) * (d.warmth > 0.7 ? 1 : 0.3) : 0
      L.crack = isPebble && this.step === 'egg' ? Math.floor(this.eggP * 3) : 0
    }
    // The chick.
    const c = this.chick
    const ce = this.els.chick
    if (c.state === 'egg') ce?.setAttribute('transform', 'translate(-9999 0)')
    else {
      const [x, y, s] = this.chickSpot()
      const d = this.dads[this.pebble]
      const face = c.state === 'tucked' ? d.face : c.state === 'held' ? Math.sign(d.x - c.x) || 1 : c.face
      if (c.state === 'out' || c.state === 'held') c.face = Math.sign(d.x - c.x) || 1
      let ty = 0
      let rot = 0
      const hp = (now - c.hop) / 0.5
      if (hp >= 0 && hp < 1) ty = -40 * Math.sin(hp * Math.PI)
      if (c.state === 'tumble' && c.tumble) {
        const p = (now - c.tumble.t0) / 0.9
        rot = p * 540 * Math.sign(c.tumble.x1 - c.tumble.x0 || 1)
        ty -= Math.abs(Math.sin(p * Math.PI * 2)) * 50
      } else if (c.state === 'out') rot = Math.sin(now * 45) * 4
      else if (c.state === 'held') rot = Math.sin(now * 16) * 6
      const baseY = c.state === 'tucked' ? d.y : c.y
      ce?.setAttribute('transform', `translate(${x.toFixed(1)} ${baseY.toFixed(1)}) scale(${s.toFixed(3)})`)
      set(this.els['chick-body'], 'transform', `translate(0 ${((y - baseY) / s + ty).toFixed(1)}) rotate(${rot.toFixed(1)} 0 -40) scale(${Math.abs(face) < 0.1 ? 0.1 : face} 1)`)
      set(this.els['chick-shadow'], 'opacity', c.state === 'tucked' ? '0' : '0.3')
      this.chickLive.cold = c.state === 'out' || c.state === 'tumble' ? 0.7 : 0
    }
    // Depth order: nearer ones (lower on the screen) in front; whatever her finger holds on top.
    const items: [number, SVGElement][] = []
    for (const d of this.dads) if (d.on) items.push([d.held || d.cork ? 1e5 + d.y : d.y, d.els.root])
    if (ce && c.state !== 'egg') {
      const d = this.dads[this.pebble]
      items.push([c.state === 'held' ? 2e5 : c.state === 'tucked' ? (d.held ? 1e5 + d.y + 1 : d.y + 1) : c.y + 0.5, ce])
    }
    items.sort((a, b) => a[0] - b[0])
    const key = items.map((it) => it[1].getAttribute('data-k')).join(',')
    if (key !== this.order) {
      this.order = key
      const layer = this.els.layer
      for (const [, el] of items) layer?.appendChild(el)
    }

    // Blowing snow: streaks along the wind, falling slowly when it's calm.
    const [wx, wy] = this.wind()
    const sx = wx
    const sy = wy * DEPTH
    const { x: vx, y: vy, w: vw, h: vh } = this.vb
    const spd = 900 * windNow
    for (const s of this.streaks) {
      s.u += ((sx * spd * s.spd) * dt) / vw
      s.v += ((sy * spd * s.spd + 70 * s.spd) * dt) / vh
      s.u = ((s.u % 1) + 1) % 1
      s.v = ((s.v % 1) + 1) % 1
      const x = vx + s.u * vw
      const y = vy + s.v * vh
      const len = s.len * (0.15 + windNow)
      const l = Math.hypot(sx * spd, sy * spd + 70) || 1
      s.el.setAttribute('x1', x.toFixed(0))
      s.el.setAttribute('y1', y.toFixed(0))
      s.el.setAttribute('x2', (x - ((sx * spd) / l) * len).toFixed(0))
      s.el.setAttribute('y2', (y - ((sy * spd + 70) / l) * len).toFixed(0))
      s.el.setAttribute('opacity', Math.min(0.9, 0.25 + windNow * 0.6).toFixed(2))
    }
    // The sky.
    const sunT = ease(this.sunT)
    set(this.els.sunrise, 'opacity', sunT.toFixed(3))
    set(this.els.icewarm, 'opacity', (sunT * 0.55).toFixed(3))
    set(this.els.stars, 'opacity', (1 - sunT).toFixed(3))
    set(this.els.sun, 'transform', `translate(${st.sunX} ${(st.horizon + 150 - sunT * 195).toFixed(1)})`)
    const mk = Math.max(0, 1 - (now - this.moonPulse) / 0.6)
    set(this.els.moon, 'transform', `translate(${st.moon[0]} ${st.moon[1]}) scale(${(1 + 0.15 * mk * Math.sin(mk * 9)).toFixed(3)})`)
    set(this.els.moon, 'opacity', (1 - sunT).toFixed(3))
    const au = this.els.aurora
    if (au) {
      const kick = Math.max(0, 1 - (now - this.aurora) / 2)
      au.setAttribute('opacity', ((0.35 + 0.15 * Math.sin(now * 0.7) + 0.5 * kick) * (1 - sunT)).toFixed(3))
      au.setAttribute('transform', `translate(${(Math.sin(now * 0.25) * 40).toFixed(1)} 0) skewX(${(Math.sin(now * 0.4) * 5 + kick * 6 * Math.sin(now * 10)).toFixed(2)})`)
    }
    this.drawHint()
  }

  /** Stuck for 8 s: a hand carries the one that needs it toward where it should go. */
  private drawHint() {
    const hint = this.els.hint
    if (!hint) return
    const st = this.stage
    let from: [number, number] | null = null
    let to: [number, number] | null = null
    const pd = this.dads[this.pebble]
    if (this.step === 'chick' && this.chick.state === 'out') {
      const [x, y, s] = this.chickSpot()
      from = [x, y - 50 * s]
      to = [pd.x, pd.y - 40]
    } else if (this.step === 'egg' && pd.warmth <= 0.7) {
      from = [pd.x, pd.y - 110 * scaleAt(st, pd.y)]
      to = this.middle()
    } else if (this.step === 'small' || this.step === 'blizzard') {
      const d = this.dads.filter((o) => o.on && o.cold && !o.walk && !o.cork).sort((a, b) => a.warmth - b.warmth)[0]
      if (d) {
        from = [d.x, d.y - 110 * scaleAt(st, d.y)]
        to = this.middle()
      }
    }
    const show = from && to && !this.finger && this.now - this.lastTouch > 8
    hint.setAttribute('opacity', show ? '1' : '0')
    if (!show || !from || !to) return
    const p = ease(((this.now - this.lastTouch - 8) % 2) / 1.6)
    hint.setAttribute('transform', `translate(${(from[0] + (to[0] - from[0]) * p).toFixed(0)} ${(from[1] + (to[1] - from[1]) * p).toFixed(0)})`)
  }

  /** The middle of the huddle, a bit downwind (where a cold one warms up best). */
  private middle(): [number, number] {
    const ds = this.dads.filter((d) => this.ground(d) && !d.cold)
    const list = ds.length ? ds : this.dads.filter((d) => d.on)
    const cx = list.reduce((s, d) => s + d.x, 0) / list.length
    const cy = list.reduce((s, d) => s + d.y, 0) / list.length
    return [cx + this.wind()[0] * 30, cy - 110 * scaleAt(this.stage, cy)]
  }

  qa() {
    return {
      section: this.section,
      step: this.step,
      wind: this.windFrom,
      warmups: this.warmups,
      goal: this.goal,
      egg: +this.eggP.toFixed(2),
      pebble: this.pebble,
      chick: this.chick.state,
      tucks: this.tucks,
      sun: +this.sunT.toFixed(2),
      corks: this.corks,
      squeeze: +this.squeeze.toFixed(2),
      sneezes: this.sneezes,
      dads: this.dads.filter((d) => d.on).map((d) => ({ i: d.i, x: Math.round(d.x), y: Math.round(d.y), warmth: +d.warmth.toFixed(2), cold: d.cold, exposed: d.exposed })),
    }
  }
}

// ---------------------------------------------------------------- the React side

const STREAKS = 70
const STARS: [number, number, number][] = Array.from({ length: 46 }, (_, i) => [((i * 61) % 100) / 100, ((i * 37) % 100) / 100, 2 + (i % 3) * 1.4])

export function EmperorHuddle({ onDone }: ActivityProps) {
  const { start, param, enter } = useSections(HUDDLE_SECTIONS)
  const [run, setRun] = useState(() => ({
    section: (start ?? 'small') as HuddleSection,
    wind: (param('wind') === 'right' ? 'right' : 'left') as Wind,
    chick: (param('chick') === 'hatched' ? 'hatched' : 'egg') as 'egg' | 'hatched',
    n: 0,
  }))
  const [phase, setPhase] = useState<Phase>('play')
  const [hint, setHint] = useState<Line | null>(null)
  const guide = useRef<GuideHandle>(null)
  const lives = useRef(Array.from({ length: MAX_DADS }, emperorLive)).current
  const chickLive = useRef({ cold: 0 }).current
  const done = useRef(false)
  const thanks = useRef(0)
  // The same line twice in a row within a moment is one line (React mounts the world twice in development).
  const said = useRef({ key: '', at: 0 })
  const fresh = (key: string) => {
    const now = performance.now()
    if (said.current.key === key && now - said.current.at < 400) return false
    said.current = { key, at: now }
    return true
  }
  const [dots, setDots] = useState<[number, number]>([0, 0])
  const box = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const world = useRef<HuddleWorld | null>(null)
  const size = useElementSize(box)
  const wide = !size.height || size.width / size.height >= 1.05
  const stage = wide ? WIDE : TALL
  const mid = `huddle${run.n}`

  // The view box: the stage scaled to fit, the extra edge filled with more sky and more ice.
  const k = size.width && size.height ? Math.min(size.width / stage.w, size.height / stage.h) : 1
  const vw = size.width ? size.width / k : stage.w
  const vh = size.height ? size.height / k : stage.h
  const vb = { x: (stage.w - vw) / 2, y: (stage.h - vh) / 2, w: vw, h: vh }
  // The painting's horizon on the stage's, and as big as it takes to cover the screen above and below it.
  const bgH = Math.max(vb.w / NIGHT.aspect, (stage.horizon - vb.y) / NIGHT.horizon, (vb.y + vb.h - stage.horizon) / (1 - NIGHT.horizon))
  const bg = { x: stage.w / 2 - (bgH * NIGHT.aspect) / 2, y: stage.horizon - NIGHT.horizon * bgH, w: bgH * NIGHT.aspect, h: bgH }

  useEffect(() => {
    enter(run.section, run.section === 'sunrise' ? {} : run.section === 'hatch' ? { wind: run.wind, chick: run.chick } : { wind: run.wind })
  }, [run])

  useLayoutEffect(() => {
    if (!svg.current) return
    setPhase('play')
    const w = new HuddleWorld(svg.current, stage, run.section, run.wind, run.chick, {
      section: (s, p) => enter(s, p),
      cue: (c, speak) => {
        const line = L.huddle[c]
        if (c !== 'turned' && c !== 'done') setHint(line)
        if (speak && fresh(`cue:${c}`)) guide.current?.speak(line, true)
      },
      talk: (who, what) => {
        if (!fresh(`${who}:${what}`)) return
        const line = who === 'pebble' ? L.huddle.pebble[what as keyof typeof L.huddle.pebble] : what === 'thanks' ? L.huddle.papa.thanks[thanks.current++ % L.huddle.papa.thanks.length] : L.huddle.papa[what as Exclude<keyof typeof L.huddle.papa, 'thanks'>]
        if (line) void say(line, { interrupt: false })
      },
      fact: (f) => guide.current?.once(`huddle:${f}`, L.huddle.facts[f], true),
      dots: (n, of) => setDots([n, of]),
      phase: (ph) => {
        setPhase(ph)
        // The payoff: the stamp and the sticker (Place.tsx), once.
        if (ph === 'end' && !done.current) {
          done.current = true
          // After the sunrise cheers have been said (the stamp's sticker line would cut them off).
          afterTalk(onDone)
        }
      },
    }, lives, chickLive)
    w.vb = vb
    world.current = w
    ;(window as unknown as { __polesHuddleQA?: () => unknown }).__polesHuddleQA = () => w.qa()
    const unwatch = watch('huddle', () => {
      const f = w.finger
      const held = f && f.what && f.what !== 'chick' ? f.what : null
      const cold = Math.min(...w.dads.filter((d) => d.on).map((d) => d.warmth))
      return {
        finger: [f ? f.speed : 0, 4000],
        lag: [held ? Math.hypot(held.x - (f!.x + f!.dx), held.y - (f!.y + f!.dy)) : 0, 200],
        coldest: [cold, 1],
        held: [held ? held.warmth : 0, 1],
        wind: [Math.cos(w.angle), 1],
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
      cancelAnimationFrame(raf)
      unwatch()
      if (world.current === w) world.current = null
    }
  }, [run])

  // Turning the iPad: the same huddle stands on the other stage.
  useEffect(() => {
    const w = world.current
    if (!w) return
    w.vb = vb
    w.setStage(stage)
  })

  const again = () => setRun((r) => ({ section: 'small', wind: r.wind === 'left' ? 'right' : 'left', chick: 'egg', n: r.n + 1 }))

  const big = 6000
  const h0 = stage.horizon

  return (
    <div ref={box} style={{ position: 'absolute', inset: 0, background: '#C7D0EA', overflow: 'clip' }}>
      <style>{CSS}</style>
      <svg
        key={run.n}
        ref={svg}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        aria-label="Bring the cold penguins into the huddle"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          world.current?.down(e)
        }}
        onPointerMove={(e) => world.current?.move(e)}
        onPointerUp={(e) => world.current?.up(e)}
        onPointerCancel={(e) => world.current?.up(e)}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'none', display: 'block', userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        <defs>
          <linearGradient id={`${mid}-dawn`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6E8FD6" />
            <stop offset="0.65" stopColor="#F7B7C8" />
            <stop offset="1" stopColor="#FFD3A1" />
          </linearGradient>
          <linearGradient id={`${mid}-aurora`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7DFFC8" stopOpacity="0" />
            <stop offset="0.5" stopColor="#7DFFC8" stopOpacity="0.8" />
            <stop offset="1" stopColor="#C98BFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* The painted night (bg-huddle-night: the sky, the far ice and the tabletop bergs on the horizon, the flat ice),
            its horizon pinned to the stage's, big enough to cover the screen; plain sky and ice past its edges. */}
        <rect x={-big} y={-big} width={big * 2} height={big + h0} fill={NIGHT.top} />
        <rect x={-big} y={h0} width={big * 2} height={big} fill={NIGHT.ice} />
        <image href={night} x={bg.x} y={bg.y} width={bg.w} height={bg.h} preserveAspectRatio="none" />
        {/* The dawn: a warm light over the sky and the far ice (screen, so the painting shows through). */}
        <rect data-k="sunrise" x={-big} y={-big} width={big * 2} height={big + h0} fill={`url(#${mid}-dawn)`} opacity={0} style={{ mixBlendMode: 'screen' }} />
        <g data-k="stars" fill="#FFF6D8">
          {STARS.map(([u, v, r], i) => (
            <circle key={i} cx={vb.x + u * vb.w} cy={vb.y + v * (h0 - vb.y) * 0.8} r={r} className={i % 4 ? undefined : 'huddle-twinkle'} />
          ))}
        </g>
        <g data-k="aurora" opacity={0.35}>
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${-200 + i * 120} ${h0 * 0.42 + i * 40} C ${stage.w * 0.25} ${h0 * 0.12 + i * 30}, ${stage.w * 0.55} ${h0 * 0.55 - i * 20}, ${stage.w + 200} ${h0 * 0.2 + i * 50} l 0 ${-140 + i * 20} C ${stage.w * 0.55} ${h0 * 0.35 - i * 20}, ${stage.w * 0.25} ${h0 * -0.05 + i * 30}, ${-200 + i * 120} ${h0 * 0.28 + i * 40} Z`} fill={`url(#${mid}-aurora)`} opacity={0.75 - i * 0.18} />
          ))}
        </g>
        <g data-k="moon" transform={`translate(${stage.moon[0]} ${stage.moon[1]})`}>
          <circle r={52} fill="#FFF6D8" stroke={INK} strokeWidth={5} />
          <circle cx={-16} cy={-10} r={10} fill="#EFE3BE" />
          <circle cx={14} cy={16} r={7} fill="#EFE3BE" />
        </g>
        {/* The sun, under the horizon until it rises. */}
        <clipPath id={`${mid}-above`}>
          <rect x={-big} y={-big} width={big * 2} height={big + h0 - 3} />
        </clipPath>
        <g clipPath={`url(#${mid}-above)`}>
          <g data-k="sun" transform={`translate(${stage.sunX} ${h0 + 150})`}>
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x={-9} y={-128} width={18} height={40} rx={9} fill="#FFD84D" stroke={INK} strokeWidth={5} transform={`rotate(${i * 30})`} />
            ))}
            <circle r={74} fill="#FFE27A" stroke={INK} strokeWidth={5} />
          </g>
        </g>
        <rect data-k="icewarm" x={-big} y={h0} width={big * 2} height={big} fill="#FFD9C2" opacity={0} style={{ mixBlendMode: 'screen' }} />
        {/* The huddle (dads and Pebble), sorted by depth every frame. */}
        <g data-k="layer">
          {Array.from({ length: MAX_DADS }, (_, i) => (
            <DadEl key={i} i={i} live={lives[i]} />
          ))}
          <ChickEl live={chickLive} />
        </g>
        {/* Blowing snow, pokes, the hint. */}
        <g stroke="#fff" strokeWidth={5} strokeLinecap="round" pointerEvents="none">
          {Array.from({ length: STREAKS }, (_, i) => (
            <line key={i} data-k="streak" opacity={0} />
          ))}
        </g>
        <g data-k="fx" pointerEvents="none" />
        <g data-k="hint" opacity={0} pointerEvents="none">
          <text fontSize={110} textAnchor="middle" dominantBaseline="middle" className="huddle-hint">
            👆
          </text>
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, pointerEvents: 'none', zIndex: 20 }}>
        {phase === 'end' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} style={CORNER}>
            <BigButton onClick={again} ariaLabel="Again">
              🔁 🐧
            </BigButton>
          </motion.div>
        )}
        {dots[1] > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }} aria-hidden>
            {Array.from({ length: dots[1] }, (_, i) => (
              <motion.div key={`${dots[1]}-${i}`} animate={{ scale: i < dots[0] ? [1, 1.4, 1] : 1 }} style={{ width: 16, height: 16, borderRadius: 99, background: i < dots[0] ? 'var(--hotpink)' : 'rgba(255,255,255,.55)', border: '3px solid var(--ink)' }} />
            ))}
          </div>
        )}
      </div>
      <Guide ref={guide} hint={phase === 'end' ? null : hint} />
    </div>
  )
}


const CSS = `
.huddle-fly { animation: huddle-fly .7s ease-out both; }
@keyframes huddle-fly { from { transform: translate(0,0) scale(1); opacity: 1 } to { transform: translate(var(--dx), var(--dy)) scale(.3); opacity: 0 } }
.huddle-ball { animation: huddle-ball .9s cubic-bezier(.3,.4,.6,1) both; }
@keyframes huddle-ball { 0% { transform: translate(0,0) } 40% { transform: translate(calc(var(--dx) * .5), calc(var(--dy) * -.25)) } 100% { transform: translate(var(--dx), var(--dy)); opacity: .2 } }
.huddle-hint { animation: huddle-hint 1s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes huddle-hint { 0%,100% { transform: scale(1) } 50% { transform: scale(1.15) } }
.huddle-twinkle { animation: huddle-twinkle 2.4s ease-in-out infinite; }
@keyframes huddle-twinkle { 0%,100% { opacity: 1 } 50% { opacity: .3 } }
`

/** The 🔁 button waits in the sky's corner, clear of the huddle. */
const CORNER = { position: 'fixed' as const, right: 'calc(var(--safe-right, 0px) + 20px)', top: 'calc(var(--top-clear) + 12px)', pointerEvents: 'auto' as const }

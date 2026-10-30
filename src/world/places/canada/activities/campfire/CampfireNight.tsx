// Campfire Night (plan: planning/around-the-world/canada.html): a dark campsite at the foot of Mont-Sainte-Anne in the
// fall. One verb, shine the flashlight: a circle of light follows her finger over the night forest, and it gets richer
// three times:
//   story        Maple, on her log by the fire with the flashlight: "Shh! Something is out there in the dark."
//   eyes         pairs of eyes shine in the dark (a barred owl, the raccoon, a deer, a spring peeper); rest the light on
//                them (or tap them) and the animal comes out to say hi.
//   sounds       a hoot, a tail slap on the lake, a peep, a hare's thump-thump, each from one side (panned left or right,
//                with faint ripples there); she sweeps the light that way to find who made it.
//   bandit       the marshmallow bag by the fire is empty! Paw prints light up as the light finds them, round the tent
//                and along the trees (a bush rustles ahead, a porcupine puffs up in one) to the hollow log, where the
//                raccoon mama is sharing the marshmallows with her babies. She's sorry, and they share.
//   marshmallow  the side verb: she holds a marshmallow on a stick near the flames. It puffs and goes golden, then
//                brown, then catches fire (tap it to blow it out: a black crunchy one, the raccoons' favorite). She gives
//                each one to Maple or the raccoons.
//   stars        everyone she met sits round the fire; she shines the light at the sky and the stars come out. Then the
//                stamp (onDone).
// Always there: fireflies, a bat that only shows in the light, the moose at the edge of the camp (shine it in his face
// and he squints, then puts on pretend sunglasses), the snoring tent, the fire's sparks, the lake, the bushes.
// The light's size and softness, how it follows her finger and how finding works are knobs (?feel=1). 2D: painted
// sprites (assets/campfire-*.webp) and code-drawn bits in SVG, written every frame by a plain object (CampWorld) under and
// over the night; Maple and the raccoons are live puppets over the night. The night itself is one big div with a hole,
// drawn once and slid under her finger (only the compositor moves it).
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent, type RefObject } from 'react'
import { BigButton, bell as bellIn, bigCelebration, burst, lerp, lineText, say, smooth, sounds, span, spendHint, useElementSize, wobble, type Line, type PuppetHandle } from '../../../../../sdk'
import { knobs, watch } from '../../../../kit/knobs'
import { useSections } from '../../../../kit/sections'
import { sfx } from '../../../../kit/sfx'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { meet } from '../../book/met'
import { CANADA_COLORS } from '../../characters/looks'
import { L } from '../../lines'
import { Maple } from '../../puppets/Maple'
import type { CanadaActivityProps } from '../props'
import { night } from './night'
import { Raccoon } from './Raccoon'
import CAMPFIRE_SECTIONS, { type CampSection } from './sections'
import { BOOK, EMOJI, EYES, KIT_GAP, LOOKS, MOOSE_EYES, NAMES, ROSTER, SOUNDS, TALL, WIDE, rng, type CritterId, type Pt, type StageDef } from './stage'

const FILE = 'src/world/places/canada/activities/campfire/CampfireNight.tsx'
const T = L.campfire
/** Sizes are stage units (the wide stage is 1600 x 1000; on an iPad a stage unit is about 0.7 px). */
const TORCH = knobs('campTorch', 'The flashlight', FILE, {
  size: { value: 220, min: 60, max: 480, step: 5, label: 'Light size', unit: 'u', note: 'radius of the circle of light' },
  soft: { value: 0.5, min: 0.05, max: 0.95, step: 0.05, label: 'Softness', note: 'how much of the circle fades into the dark (0.05 = a hard edge, 0.95 = all glow)' },
  dark: { value: 0.94, min: 0.4, max: 1, step: 0.01, label: 'How dark', note: 'the night outside the light (0 shows everything, for checking)' },
  follow: { value: 14, min: 2, max: 60, step: 1, label: 'Follows her finger', unit: '/s', note: 'how tightly the light keeps up (lower = it swings behind like a heavy flashlight)' },
  lift: { value: 60, min: 0, max: 200, step: 5, label: 'Light above finger', unit: 'u', note: 'how far above her fingertip the light lands, so her finger doesn’t cover what she finds' },
  beam: { value: 0.1, min: 0, max: 0.4, step: 0.01, label: 'Beam from Maple', note: 'how strongly the beam shows from Maple’s flashlight to the light (0 = none)' },
})
const FIND = knobs('campFind', 'Finding things', FILE, {
  reach: { value: 0.6, min: 0.2, max: 1.2, step: 0.05, label: 'Lights it from', note: 'share of the light’s size: how close the middle of the light has to come' },
  dwell: { value: 0.35, min: 0, max: 2, step: 0.05, label: 'Hold the light', unit: 's', note: 'how long the light rests on it before it comes out (a tap on it is at once)' },
  shine: { value: 1, min: 0.3, max: 2.5, step: 0.05, label: 'Eye shine', note: 'how big and bright the eyes in the dark are' },
  help: { value: 15, min: 4, max: 60, step: 1, label: 'Easier after', unit: 's', note: 'eyes, sounds and paw prints get easier to spot after this long without a find' },
  every: { value: 3.2, min: 1, max: 8, step: 0.1, label: 'Sound every', unit: 's' },
  side: { value: 0.85, min: 0, max: 1, step: 0.05, label: 'Sound to one side', note: 'stereo: 1 = all in one ear, 0 = both' },
})
const ROAST = knobs('campRoast', 'Roast a marshmallow', FILE, {
  heat: { value: 230, min: 60, max: 500, step: 10, label: 'Heat reaches', unit: 'u', note: 'how far from the flames it still toasts' },
  golden: { value: 3.5, min: 0.5, max: 12, step: 0.25, label: 'Golden in', unit: 's', note: 'held right over the flames' },
  burn: { value: 2.5, min: 0.5, max: 10, step: 0.25, label: 'Catches fire after golden', unit: 's' },
  out: { value: 4, min: 1, max: 12, step: 0.5, label: 'Goes out by itself', unit: 's' },
  grab: { value: 120, min: 40, max: 240, step: 5, label: 'Grab reach', unit: 'u', note: 'how near the marshmallow her finger has to land to pick the stick up' },
})

/** The pictures (art/source/world/canada/campfire-*.png, `npm run art -- canada`). */
const PICS = import.meta.glob<string>('../../assets/campfire-*.webp', { eager: true, import: 'default' })
const pic = (name: string) => PICS[`../../assets/campfire-${name}.webp`] ?? ''
/** Width / height of each picture. */
const ASPECT: Record<string, number> = { bag: 0.912, bat: 1.6, beaver: 1.662, bush: 1.354, deer: 0.914, 'den-hd': 2.212, fern: 1.418, firepit: 1.344, hare: 0.77, 'mapletree-hd': 0.688, 'mountain-hd': 2.709, owl: 0.764, peeper: 1.049, porcupine: 1.103, 'spruce-hd': 0.469, 'tent-hd': 1.554 }
/** A picture standing on (x, bottom), `h` tall (or `w` wide). */
function Pic({ name, x, bottom, h, w, flip, opacity }: { name: string; x: number; bottom: number; h?: number; w?: number; flip?: boolean; opacity?: number }) {
  const a = ASPECT[name] ?? 1
  const hh = h ?? (w ?? 100) / a
  const ww = w ?? hh * a
  return <image href={pic(name)} x={flip ? -x - ww / 2 : x - ww / 2} y={bottom - hh} width={ww} height={hh} transform={flip ? 'scale(-1 1)' : undefined} opacity={opacity} preserveAspectRatio="none" />
}

/** What the pill at the bottom says in each part (for Dad; the line itself is spoken, and a tap on the pill says it again). */
const SAY: Record<CampSection, string> = {
  story: '🔦 Shine the light: who’s watching?',
  eyes: '🔦 Shine the light: who’s watching?',
  sounds: '👂 Who’s that sound?',
  bandit: '🍡 The marshmallows are gone! Follow the paw prints',
  marshmallow: '🔥 Hold the marshmallow near the fire',
  stars: '🌌 Shine the light at the sky',
}
/** Sparkle's instruction for each part. */
const TELL: Record<CampSection, Line> = { story: T.eyes, eyes: T.eyes, sounds: T.sounds, bandit: T.bandit, marshmallow: T.marshmallow, stars: T.stars }
const HINT: Record<CampSection, Line> = { story: T.eyesHint, eyes: T.eyesHint, sounds: T.soundsHint, bandit: T.banditHint, marshmallow: T.marshmallowHint, stars: T.starsHint }
/** The parts, for the stars in the top bar. */
const PARTS: CampSection[] = ['eyes', 'sounds', 'bandit', 'marshmallow', 'stars']
/** How many night animals each section starts with (the first N of Maple's book; `?found=` overrides). */
const START_FOUND: Record<CampSection, number> = { story: 0, eyes: 0, sounds: 4, bandit: 6, marshmallow: 8, stars: 8 }
const EATEN_TO_STARS = 4

/** Who she has met, from `?found=`: a number (the first N of Maple's book) or a comma list of ids; empty = what the
 *  section starts with. */
function parseFound(v: string, section: CampSection): CritterId[] {
  if (v === '') return ROSTER.slice(0, START_FOUND[section])
  if (/^\d+$/.test(v)) return ROSTER.slice(0, Math.min(ROSTER.length, parseInt(v)))
  const ids = new Set(v.split(','))
  return ROSTER.filter((id) => ids.has(id))
}
/** The shortest `?found=` for these ids: empty for the section's own start, a number for the first N, else the list. */
function foundParam(ids: CritterId[], section: CampSection) {
  const prefix = ids.every((id, i) => ROSTER[i] === id)
  if (prefix && ids.length === START_FOUND[section]) return ''
  return prefix ? String(ids.length) : ids.join(',')
}
const INK = '#4A3B57'
const MC = CANADA_COLORS
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
const bell = (p: number) => (p <= 0 || p >= 1 ? 0 : Math.sin(p * Math.PI))
const ease = (p: number) => (p < 0 ? 0 : p > 1 ? 1 : p * p * (3 - 2 * p))
const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by)

/** Maple's puppet box (stage units) and where it sits: her head is about at stage.maple, her feet on the log. */
const MAPLE_BOX = 250
const mapleBox = (st: StageDef): Pt => [st.maple[0] - MAPLE_BOX / 2, st.maple[1] - 135]
/** Maple's puppet actions and how long they last (puppets/Maple.tsx), so her flashlight can stay in her paw. */
type MapleAct = 'hop' | 'cheer' | 'chomp' | 'wiggle' | 'slap' | 'wave'
const MAPLE_DUR: Record<MapleAct, number> = { hop: 0.9, cheer: 1.1, chomp: 0.9, wiggle: 0.7, slap: 1.0, wave: 1.5 }

/** Where Maple's right paw is (her puppet's 500-unit box) during an action, the same curves as puppets/Maple.tsx. */
function maplePaw(kind: MapleAct | null, q: number): Pt {
  let armR = -16
  let rootY = 0
  let sy = 1
  if (kind) {
    const env = smooth(span(q, 0, 0.15)) * (1 - smooth(span(q, 0.85, 1)))
    if (kind === 'hop' || kind === 'cheer') {
      const crouch = bellIn(span(q, 0, 0.22))
      const air = bellIn(span(q, 0.2, 0.72))
      const land = wobble(span(q, 0.72, 1), 2)
      sy = 1 - crouch * 0.12 + air * 0.09 - land * 0.1
      rootY = -air * (kind === 'cheer' ? 70 : 90)
      armR = lerp(-16, kind === 'cheer' ? -150 : -50, kind === 'cheer' ? env : air)
    } else if (kind === 'chomp') armR = lerp(-16, -110, env)
    else if (kind === 'wave') armR = lerp(-16, -140 + Math.sin(q * Math.PI * 8) * 22, env)
    else if (kind === 'slap') {
      const jolt = bellIn(span(q, 0.48, 0.7))
      sy = 1 - jolt * 0.08
      rootY = -jolt * 12
    }
  }
  const a = (armR * Math.PI) / 180
  const px = 348 - 58 * Math.sin(a)
  const py = 318 + 58 * Math.cos(a)
  return [px, 476 + (py - 476) * sy + rootY]
}

// ---------------------------------------------------------------- the runtime (plain objects, written every frame)

type AnimKind = 'out' | 'hop' | 'wiggle' | 'slap' | 'croak' | 'puff' | 'cheer' | 'munch' | 'shake' | 'sorry' | 'thump'
interface Crit {
  id: CritterId
  x: number
  y: number
  /** Where it walks from when it comes out (from behind a bush, out of the log). */
  from: Pt
  on: boolean
  /** She has met it: now it's her friend, shown softly over the dark. */
  found: boolean
  /** In the dark waiting to be found (eyes, or the maker of a sound). */
  hiding: boolean
  eyes: boolean
  dwell: number
  anim: { kind: AnimKind; t0: number; dur: number } | null
  blinkAt: number
  frontA: number
  /** Facing: 1 as drawn, -1 mirrored. */
  face: 1 | -1
  pokes: number
  els: { front: SVGGElement | null; body: SVGGElement | null; eyes: SVGGElement | null; eyesIn: SVGGElement | null; puppets: HTMLElement[] }
}
interface Star {
  x: number
  y: number
  on: number
  lit: boolean
  ph: number
  el: SVGCircleElement
}
interface Spark {
  el: SVGCircleElement
  x: number
  y: number
  vx: number
  vy: number
  t: number
  life: number
}
interface Fly {
  el: SVGGElement
  x: number
  y: number
  hx: number
  hy: number
  ph: number
  zip: number
}

type Who = 'maple' | 'raccoon' | 'kits'
interface Events {
  section: (s: CampSection, found: CritterId[]) => void
  found: (ids: CritterId[]) => void
  /** The pill at the bottom (for Dad). */
  say: (text: string) => void
  /** Speak a line: `important` ones wait their turn, the rest are skipped while someone is talking. */
  speak: (line: Line, important?: boolean) => void
  play: (who: Who, action: string) => void
  /** The night's hole moved (stage units). */
  light: (x: number, y: number) => void
  end: () => void
}

/** Writes an SVG attribute (or a style) only when it changes (most of the scene is still most frames). */
const written = new WeakMap<Element, Record<string, string>>()
function put(el: Element | null | undefined, name: string, value: string) {
  if (!el) return
  let w = written.get(el)
  if (!w) written.set(el, (w = {}))
  if (w[name] === value) return
  w[name] = value
  if (name.startsWith('style.')) (el as HTMLElement).style.setProperty(name.slice(6), value)
  else el.setAttribute(name, value)
}

class CampWorld {
  stage: StageDef
  section: CampSection
  crits = new Map<CritterId, Crit>()
  light = { x: 0, y: 0, tx: 0, ty: 0, speed: 0 }
  finger: { id: number; x: number; y: number; sx: number; sy: number; t0: number; moved: number; speed: number; stick: boolean } | null = null
  now = 0
  lastTouch = 0
  lastFind = 0
  lastSay = ''
  sayAt = -9
  ended = false
  hinted = false
  vb = { x: 0, y: 0, w: 1600, h: 1000 }
  k = 1
  els: Record<string, Element | null> = {}
  stars: Star[] = []
  sparks: Spark[] = []
  flies: Fly[] = []
  zs: { el: SVGTextElement; t: number }[] = []
  ripples: { el: SVGCircleElement; t: number; x: number; y: number }[] = []
  /** Sounds: which sound now, when it plays next, how often she's heard it. */
  snd = { i: 0, next: 1.2, heard: 0, done: false, wait: 0 }
  /** Bandit: the next paw print to find, when the last one lit, the bush that rustles next. */
  trail = { next: 0, lit: [] as number[], at: 0, rustle: 4, bush: -1, shake: -9, den: false }
  /** The moose: how long the light has been on his face, his squint, his pretend sunglasses. */
  moose = { lit: 0, dark: 0, shades: 0, squint: 0, anim: -9, shadesAt: -9, said: 0, ear: 3, earAt: -9, blinkAt: 2 }
  bat = { on: false, x: 0, y: 0, dir: 1, next: 9, loop: -9 }
  stick = { x: 0, y: 0, rx: 0, ry: 0, held: false, toast: 0, fire: false, fireT: 0, charred: false, eaten: 0, back: 0, pop: -9, heat: 0, golden: false, eat: null as null | { to: 'maple' | 'family'; t0: number } }
  maple = { anim: -9, kind: null as MapleAct | null, pokes: 0 }
  fireTap = -9
  glow: HTMLElement | null = null
  tentT = -9
  tentPokes = 0
  starsDone = false
  /** Set when the scene goes away (a new section, or React trying the effect twice): its timers do nothing then. */
  dead = false
  private back: SVGSVGElement
  private later(f: () => void, ms: number) {
    setTimeout(() => !this.dead && f(), ms)
  }

  constructor(
    root: HTMLElement,
    stage: StageDef,
    section: CampSection,
    found: CritterId[],
    seed: number,
    light: Pt | null,
    told: boolean,
    private ev: Events,
  ) {
    this.stage = stage
    this.section = section
    this.back = root.querySelector('svg[data-k="back"]') as SVGSVGElement
    const q = <T extends Element>(k: string) => root.querySelector(`[data-k="${k}"]`) as T
    const qa = <T extends Element>(k: string) => [...root.querySelectorAll(`[data-k="${k}"]`)] as T[]
    this.glow = q<HTMLElement>('glow')
    for (const k of ['flames', 'sparks', 'beam', 'hint', 'shades', 'squint', 'moose-eyes', 'moose-eyes-in', 'moose-head', 'moose-jaw', 'moose-earL', 'moose-earR', 'moose-hoof', 'bat', 'bat-wings', 'stick', 'mallow', 'mallow-body', 'mallow-fire', 'shoot', 'trail-glow', 'bushes', 'moose-front', 'flash', 'dark'])
      this.els[k] = q(k)
    const r = rng(seed)
    const pick = (spots: Pt[]) => spots[Math.floor(r() * spots.length) % spots.length]
    const spot: Record<string, Pt> = { owl: pick(stage.spots.owl), raccoon: pick(stage.spots.raccoon), deer: pick(stage.spots.deer), frog: pick(stage.spots.frog) }
    const known = new Set(found)
    for (const id of ROSTER) {
      const c: Crit = {
        id,
        x: 0,
        y: 0,
        from: [0, 0],
        on: false,
        found: known.has(id),
        hiding: false,
        eyes: false,
        dwell: 0,
        anim: null,
        blinkAt: 1 + r() * 4,
        frontA: 0,
        face: 1,
        pokes: 0,
        els: { front: q(`cf-${id}`), body: q(`cf-${id}-body`), eyes: q(`e-${id}`), eyesIn: q(`e-${id}-in`), puppets: qa<HTMLElement>(`pp-${id}`) },
      }
      this.crits.set(id, c)
    }
    const set = (id: CritterId, p: Pt, opts: { hiding?: boolean; eyes?: boolean } = {}) => {
      const c = this.crits.get(id)!
      c.on = true
      ;[c.x, c.y] = this.outAt(id, p, !opts.hiding)
      c.from = [p[0], p[1]]
      c.hiding = !!opts.hiding
      c.eyes = !!opts.eyes
      c.frontA = !c.hiding ? 1 : 0
      c.face = this.faceOf(id, c.x)
    }
    const [dx, dy] = stage.den
    if (section === 'eyes') {
      for (const id of EYES) set(id, spot[id], { hiding: !this.crits.get(id)!.found, eyes: !this.crits.get(id)!.found })
      if (EYES.every((id) => this.crits.get(id)!.found)) this.later(() => this.ev.section('sounds', this.foundIds()), 1500)
      else if (!told) this.later(() => this.ev.speak(T.eyes, true), 500)
    } else if (section === 'sounds') {
      set('raccoon', spot.raccoon)
      set('deer', spot.deer)
      this.startSound()
      this.later(() => this.ev.speak(T.sounds, true), 300)
    } else if (section === 'bandit') {
      set('owl', stage.sounds.owl)
      set('deer', spot.deer)
      set('frog', stage.sounds.frog)
      set('beaver', stage.sounds.beaver)
      set('hare', stage.sounds.hare)
      const b = stage.bushes[stage.quillBush]
      set('porcupine', [b[0], b[1] + 10], { hiding: !this.crits.get('porcupine')!.found })
      // The raccoon and her babies are in the hollow log at the end of the trail.
      set('raccoon', [dx - 70, dy - 30], { hiding: true })
      set('kits', [dx - 76, dy - 6], { hiding: true })
      // Not even a whisker shows until the trail gets there.
      this.crits.get('raccoon')!.on = false
      this.crits.get('kits')!.on = false
      this.later(() => {
        this.ev.speak(T.banditGone, true)
        this.ev.speak(T.bandit, true)
        this.mapleDo('wave')
      }, 400)
    } else {
      // By the fire: the raccoon family (marshmallow), or everyone she met round the fire (stars).
      if (section === 'marshmallow') {
        set('owl', stage.sounds.owl)
        set('deer', spot.deer)
        set('frog', stage.sounds.frog)
        set('beaver', stage.sounds.beaver)
        set('hare', stage.sounds.hare)
        const b = stage.bushes[stage.quillBush]
        set('porcupine', [b[0], b[1] + 10])
        const [fx, fy] = stage.family
        set('raccoon', [fx, fy])
        set('kits', [fx + 130, fy + 46])
        for (const id of ['raccoon', 'kits'] as CritterId[]) this.crits.get(id)!.found = true
        if (!known.has('raccoon') || !known.has('kits')) this.later(() => this.ev.found(this.foundIds()), 0)
        this.later(() => this.ev.speak(T.marshmallow, true), 300)
      } else {
        let i = 0
        for (const id of ROSTER) {
          const c = this.crits.get(id)!
          if (!c.found) continue
          set(id, stage.seats[i++ % stage.seats.length])
        }
        this.later(() => this.ev.speak(T.stars, true), 300)
      }
    }
    this.stick.x = this.stick.rx = stage.stick[0]
    this.stick.y = this.stick.ry = stage.stick[1]
    // The light starts where she left it, or on the forest just above the fire (the first part: up in the empty sky,
    // so nobody is found before she has touched anything). The bandit starts on the empty marshmallow bag, where the
    // trail begins.
    const [lx, ly] = section === 'bandit' ? [stage.bag[0], stage.bag[1] - 30] : (light ?? [stage.fire[0], section === 'stars' || section === 'eyes' || section === 'story' ? stage.sky - 60 : stage.treeline - 60])
    this.light.x = this.light.tx = lx
    this.light.y = this.light.ty = ly
    for (const el of qa<SVGCircleElement>('star')) {
      const s: Star = { x: +el.getAttribute('cx')!, y: +el.getAttribute('cy')!, on: 0, lit: el.dataset.always === '1', ph: r() * 6, el }
      if (s.lit) s.on = 0.6
      this.stars.push(s)
    }
    for (const el of qa<SVGCircleElement>('spark')) this.sparks.push({ el, x: 0, y: 0, vx: 0, vy: 0, t: 9, life: 1 })
    for (const el of qa<SVGGElement>('fly')) {
      const hx = r() * stage.w
      const hy = stage.treeline - 40 + r() * (stage.ground - stage.treeline + 220)
      this.flies.push({ el, x: hx, y: hy, hx, hy, ph: r() * 6, zip: -9 })
    }
    for (const el of qa<SVGTextElement>('z')) this.zs.push({ el, t: 9 })
    for (const el of qa<SVGCircleElement>('ripple')) this.ripples.push({ el, t: 9, x: 0, y: 0 })
    this.bat.next = 6 + r() * 6
  }

  foundIds() {
    return ROSTER.filter((id) => this.crits.get(id)!.found)
  }

  /** Where an animal stands once it has come out (beside its bush, on the shore). */
  private outAt(id: CritterId, p: Pt, out: boolean): Pt {
    if (!out) return p
    if (id === 'raccoon' || id === 'porcupine') {
      // Out beside its bush, on the side away from the fire (so it doesn't stand on Maple or the flames).
      const b = this.stage.bushes.find((o) => Math.abs(o[0] - p[0]) < 4)
      if (b) return [b[0] + (b[0] < this.stage.fire[0] ? -1 : 1) * (b[2] + 50), b[1] + 4]
    }
    if (id === 'deer') return [p[0], p[1] + 20]
    return p
  }

  /** Animals face the fire (the side-view pictures are drawn facing one way). */
  private faceOf(id: CritterId, x: number): 1 | -1 {
    const right = x < this.stage.fire[0]
    if (id === 'deer' || id === 'beaver') return right ? 1 : -1
    if (id === 'hare' || id === 'porcupine') return right ? -1 : 1
    return 1
  }

  setVb(vb: { x: number; y: number; w: number; h: number }, k: number) {
    this.vb = vb
    this.k = k
  }

  // -------------------------------------------------------------- her finger

  toStage(e: { clientX: number; clientY: number }): Pt {
    const m = this.back.getScreenCTM()
    if (!m) return [0, 0]
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    return [p.x, p.y]
  }

  down(e: RPointerEvent) {
    if (this.finger) return
    const [x, y] = this.toStage(e)
    this.lastTouch = this.now
    this.hinted = false
    const f = { id: e.pointerId, x, y, sx: e.clientX, sy: e.clientY, t0: this.now, moved: 0, speed: 0, stick: false }
    this.finger = f
    // The marshmallow stick (marshmallow section): grab it near the marshmallow or along the stick.
    if (this.section === 'marshmallow' && !this.stick.eat && this.onStick(x, y)) {
      f.stick = true
      this.stick.held = true
      sounds.pickup()
      // A tap on a burning marshmallow blows it out.
      if (this.stick.fire) this.blowOut()
      return
    }
    // A tap right on eyes in the dark finds the animal at once (and the light jumps there).
    for (const c of this.crits.values()) {
      if (!c.on || !c.hiding || !c.eyes) continue
      if (dist(c.x, c.y, x, y) < Math.max(70, LOOKS[c.id].gap * 3)) {
        this.light.tx = c.x
        this.light.ty = c.y
        this.reveal(c)
        return
      }
    }
    this.aim(x, y)
  }

  /** Where the light goes for her finger at (x, y). */
  private aim(x: number, y: number) {
    const v = this.vb
    this.light.tx = clamp(x, v.x, v.x + v.w)
    this.light.ty = clamp(y - TORCH.lift, v.y, v.y + v.h)
  }

  move(e: RPointerEvent) {
    const f = this.finger
    if (!f || f.id !== e.pointerId) return
    const [x, y] = this.toStage(e)
    f.moved = Math.max(f.moved, Math.hypot(e.clientX - f.sx, e.clientY - f.sy))
    f.x = x
    f.y = y
    this.lastTouch = this.now
    if (!f.stick) this.aim(x, y)
  }

  up(e: RPointerEvent) {
    const f = this.finger
    if (!f || f.id !== e.pointerId) return
    this.finger = null
    this.lastTouch = this.now
    const tap = f.moved < 14 && this.now - f.t0 < 0.45
    if (f.stick) {
      this.stick.held = false
      this.letGoStick()
      return
    }
    if (tap) this.poke(f.x, f.y)
  }

  private onStick(x: number, y: number) {
    const s = this.stick
    if (dist(s.x, s.y, x, y) < ROAST.grab) return true
    // Anywhere along the stick toward its handle.
    const [hx, hy] = this.handle()
    const L = dist(s.x, s.y, hx, hy)
    const t = clamp(((x - s.x) * (hx - s.x) + (y - s.y) * (hy - s.y)) / (L * L), 0, 1)
    return dist(x, y, s.x + (hx - s.x) * t, s.y + (hy - s.y) * t) < 60
  }

  private handle(): Pt {
    return [this.stick.x - 110, this.stick.y + 260]
  }

  // -------------------------------------------------------------- pokes

  /** Her first poke of an animal puts it in Maple's book (meet() does nothing after the first time). */
  private met(c: Crit) {
    meet(BOOK[c.id])
  }

  private poke(x: number, y: number) {
    const st = this.stage
    const pan = this.pan(x)
    // A friend she has met: a hop and its own sound (and sometimes a word).
    for (const c of this.crits.values()) {
      if (!c.on || c.hiding) continue
      const Lk = LOOKS[c.id]
      const cy = c.y + (Lk.foot - Lk.eye[1]) * Lk.h * 0.4
      if (dist(c.x, cy, x, y) < Math.max(70, Lk.h * 0.55)) {
        c.pokes++
        this.act(c, c.id === 'beaver' ? 'slap' : c.id === 'frog' ? 'croak' : c.id === 'porcupine' ? 'puff' : c.id === 'hare' ? 'thump' : c.id === 'raccoon' && c.pokes % 3 === 2 ? 'sorry' : 'hop')
        this.voice(c.id, pan)
        this.met(c)
        if (c.id === 'owl' && c.pokes % 2 === 1) this.ev.speak(T.owl)
        if ((c.id === 'raccoon' || c.id === 'kits') && c.pokes % 3 === 1) this.ev.speak(T.raccoonHi)
        if (c.id === 'porcupine' && c.pokes % 3 === 1) {
          this.ev.speak(T.porcupine)
          this.mapleDo('wiggle')
        }
        return
      }
    }
    // Maple: a tail slap (and a giggle now and then).
    const [mx, my] = st.maple
    if (dist(mx, my, x, y) < 130) {
      this.maple.pokes++
      this.mapleDo(this.maple.pokes % 2 ? 'slap' : 'hop')
      night.slap(pan, 0.2)
      meet('beaver')
      if (this.maple.pokes % 3 === 1) this.ev.speak(T.mapleHi)
      return
    }
    // The moose: a groan and a shake of the antlers.
    const [ox, oy] = st.moose
    if (dist(ox, oy, x, y) < 130) {
      this.moose.anim = this.now
      night.groan(pan)
      meet('moose')
      if (this.now - this.moose.said > 4) {
        this.moose.said = this.now
        this.ev.speak(T.mooseHi)
      }
      return
    }
    // The fire: sparks whoosh up.
    const [fx, fy] = st.fire
    if (dist(fx, fy - 40, x, y) < 110) {
      this.fireTap = this.now
      night.whoosh()
      for (let i = 0; i < 16; i++) this.spark(fx + (Math.random() - 0.5) * 60, fy - 60, 1.6)
      return
    }
    // The tent: the zipper, and someone snoring.
    const [tx, ty] = st.tent
    const [tw, th] = st.tentSize
    if (y < ty + 10 && y > ty - th && Math.abs(x - tx) < tw + 20) {
      this.tentT = this.now
      this.tentPokes++
      night.zip(pan)
      this.later(() => night.snore(pan), 500)
      if (this.tentPokes % 3 === 2) this.later(() => this.ev.speak(T.tent), 1400)
      return
    }
    // The bat, if it's in the light.
    if (this.bat.on && dist(this.bat.x, this.bat.y, x, y) < 110) {
      this.bat.loop = this.now
      night.squeak(pan)
      meet('bat')
      return
    }
    // A firefly: it flares and zips off.
    for (const f of this.flies) {
      if (dist(f.x, f.y, x, y) < 70) {
        f.zip = this.now
        sounds.note(8 + Math.floor(Math.random() * 3))
        meet('firefly')
        return
      }
    }
    // A bush: it rustles.
    for (const [bx, by, br] of st.bushes) {
      if (dist(bx, by, x, y) < br + 30) {
        this.trail.bush = st.bushes.findIndex((b) => b[0] === bx)
        this.trail.shake = this.now
        night.rustle(pan)
        return
      }
    }
    // The lake: a plop.
    if (x < st.lake.x && y > st.lake.y) {
      this.ripple(x, y)
      sfx.splash()
      return
    }
    // Anywhere else: a soft click of the flashlight.
    sounds.pop()
  }

  private voice(id: CritterId, pan: number) {
    if (id === 'owl') night.hoot(pan, 0.14)
    else if (id === 'beaver') night.slap(pan)
    else if (id === 'frog') night.peep(pan)
    else if (id === 'hare') night.thump(pan, 0.24)
    else if (id === 'porcupine') night.quills(pan)
    else if (id === 'deer') sfx.fwip()
    else if (id === 'raccoon' || id === 'kits') night.munch(pan)
    else sounds.pop()
  }

  private pan(x: number) {
    const v = this.vb
    return clamp((x - (v.x + v.w / 2)) / (v.w * 0.35), -1, 1) * FIND.side
  }

  private act(c: Crit, kind: AnimKind) {
    const dur = kind === 'out' ? 1.1 : kind === 'wiggle' || kind === 'cheer' ? 0.8 : kind === 'munch' ? 1.2 : kind === 'puff' ? 1.4 : kind === 'thump' ? 0.8 : kind === 'sorry' ? 1.8 : 0.6
    c.anim = { kind, t0: this.now, dur }
    // The raccoons are puppets: they act it out themselves.
    if (c.id === 'raccoon' || c.id === 'kits') {
      const a = kind === 'out' || kind === 'hop' ? 'hop' : kind === 'cheer' ? 'cheer' : kind === 'munch' ? 'munch' : kind === 'sorry' ? 'sorry' : kind === 'wiggle' ? 'wash' : 'hop'
      this.ev.play(c.id, a)
    }
  }

  private mapleDo(kind: MapleAct) {
    this.maple.anim = this.now
    this.maple.kind = kind
    this.ev.play('maple', kind)
  }

  // -------------------------------------------------------------- finding

  /** The light rests on an animal hiding in the dark: it comes out and says hi. */
  private reveal(c: Crit) {
    if (!c.hiding) return
    c.hiding = false
    c.eyes = false
    c.dwell = 0
    this.lastFind = this.now
    this.hinted = false
    const was = c.found
    c.found = true
    const [ox, oy] = this.outAt(c.id, c.from, true)
    c.from = [c.x, c.y]
    c.x = ox
    c.y = oy
    c.face = this.faceOf(c.id, c.x)
    this.act(c, c.id === 'beaver' ? 'slap' : c.id === 'frog' ? 'croak' : c.id === 'porcupine' ? 'puff' : c.id === 'hare' ? 'thump' : 'out')
    this.voice(c.id, this.pan(c.x))
    sounds.sparkle()
    this.met(c)
    if (c.id === 'porcupine') {
      this.mapleDo('wiggle')
      this.later(() => this.ev.speak(T.porcupine), 2600)
    } else this.mapleDo('cheer')
    if (!was) this.ev.found(this.foundIds())
    this.say(`${EMOJI[c.id]} ${NAMES[c.id]}!`)
    if (this.section === 'eyes' && EYES.every((id) => !this.crits.get(id)!.hiding)) {
      this.later(() => {
        burst()
        this.say('✨ Everybody’s out!')
        this.ev.speak(T.allOut, true)
      }, 1600)
      this.later(() => this.ev.section('sounds', this.foundIds()), 4200)
    }
  }

  private tickFinding(dt: number) {
    const R = TORCH.size
    const reach = R * FIND.reach
    const lx = this.light.x
    const ly = this.light.y
    for (const c of this.crits.values()) {
      if (!c.on || !c.hiding) continue
      // The porcupine is found by lighting its bush; the den's raccoons only at the end of the trail.
      if (this.section === 'bandit' && (c.id === 'raccoon' || c.id === 'kits')) continue
      const [ex, ey] = c.id === 'porcupine' ? [c.from[0], c.from[1] - 40] : [c.x, c.y]
      if (dist(ex, ey, lx, ly) < reach) {
        c.dwell += dt
        if (c.dwell >= FIND.dwell) this.reveal(c)
      } else c.dwell = Math.max(0, c.dwell - dt * 2)
    }
  }

  // -------------------------------------------------------------- sounds

  private startSound() {
    const s = this.snd
    if (s.i >= SOUNDS.length) {
      s.done = true
      this.later(() => {
        burst()
        this.say('✨ You found every sound!')
        this.ev.speak(T.allSounds, true)
        this.mapleDo('cheer')
      }, 900)
      this.later(() => this.ev.section('bandit', this.foundIds()), 3600)
      return
    }
    const id = SOUNDS[s.i]
    const c = this.crits.get(id)!
    c.on = true
    c.hiding = true
    c.eyes = false
    c.from = [...this.stage.sounds[id]] as Pt
    c.x = c.from[0]
    c.y = c.from[1]
    c.frontA = 0
    s.next = this.now + 0.8
    s.heard = 0
    this.lastFind = this.now
  }

  private tickSounds() {
    const s = this.snd
    if (s.done) return
    const id = SOUNDS[s.i]
    const c = this.crits.get(id)!
    if (!c.hiding) {
      // Found: on to the next sound after a moment.
      if (!s.wait) s.wait = this.now + 2.2
      if (this.now >= s.wait) {
        s.wait = 0
        s.i++
        this.startSound()
      }
      return
    }
    if (this.now >= s.next) {
      s.next = this.now + FIND.every
      s.heard++
      const pan = this.pan(c.x) || (c.x < this.stage.w / 2 ? -FIND.side : FIND.side)
      if (id === 'owl') night.hoot(pan)
      else if (id === 'beaver') night.slap(pan)
      else if (id === 'frog') night.peep(pan, 0.12)
      else night.thump(pan)
      this.ripple(c.x, c.y)
      // After a few times unfound, the eyes peek out too.
      if (s.heard >= 4) c.eyes = true
      const side = c.x < this.light.x - TORCH.size * 0.5 ? '⬅️' : c.x > this.light.x + TORCH.size * 0.5 ? '➡️' : '👀'
      this.say(`👂 Who’s that? ${side}`)
    }
  }

  // -------------------------------------------------------------- the bandit's trail

  private tickTrail() {
    const t = this.trail
    const pr = this.stage.prints
    const R = TORCH.size * FIND.reach * 1.1
    if (t.next < pr.length) {
      // Any of the next three prints in the light lights every print up to it.
      for (let i = Math.min(pr.length - 1, t.next + 2); i >= t.next; i--) {
        if (dist(pr[i][0], pr[i][1], this.light.x, this.light.y) < R) {
          for (let j = t.next; j <= i; j++) {
            t.lit.push(j)
            this.later(() => night.print(j, this.pan(pr[j][0])), (j - t.next) * 90)
          }
          t.next = i + 1
          t.at = this.now
          this.lastFind = this.now
          this.hinted = false
          break
        }
      }
      // A bush ahead on the trail rustles now and then (leading her on).
      if (this.now > t.rustle && t.next < pr.length) {
        t.rustle = this.now + 3.6
        const [ax, ay] = pr[Math.min(pr.length - 1, t.next + 3)]
        const bi = this.stage.bushes.findIndex(([bx, by, br]) => dist(bx, by, ax, ay) < br + 200)
        if (bi >= 0) {
          t.bush = bi
          t.shake = this.now
          night.rustle(this.pan(this.stage.bushes[bi][0]))
        }
      }
      if (t.next >= pr.length && !t.den) this.denFound()
    }
  }

  private denFound() {
    const t = this.trail
    t.den = true
    const raccoon = this.crits.get('raccoon')!
    const kits = this.crits.get('kits')!
    const [dx, dy] = this.stage.den
    // Light the log, then out they come with the marshmallows.
    this.light.tx = dx - 40
    this.light.ty = dy - 30
    this.later(() => {
      raccoon.on = kits.on = true
      raccoon.hiding = false
      raccoon.found = true
      raccoon.frontA = 0
      raccoon.from = [dx - 60, dy - 10]
      raccoon.x = dx - 50
      raccoon.y = dy - 44
      this.act(raccoon, 'out')
      kits.hiding = false
      kits.from = [dx - 60, dy + 10]
      kits.x = dx + 60
      kits.y = dy - 76
      const was = kits.found
      kits.found = true
      this.act(kits, 'out')
      meet('raccoon')
      sounds.sparkle()
      night.munch(this.pan(kits.x))
      this.mapleDo('cheer')
      this.say('🦝 The bandit! She’s sharing with her babies')
      this.ev.speak(T.caught, true)
      if (!was) this.ev.found(this.foundIds())
      burst()
    }, 700)
    this.later(() => {
      this.act(kits, 'munch')
      this.act(raccoon, 'sorry')
      this.ev.speak(T.sorry, true)
    }, 3200)
    this.later(() => this.ev.speak(T.roast, true), 4800)
    this.later(() => this.ev.section('marshmallow', this.foundIds()), 7400)
  }

  // -------------------------------------------------------------- the marshmallow

  private tickStick(dt: number) {
    const s = this.stick
    const f = this.finger
    const [fx, fy] = this.stage.fire
    if (s.eat) {
      const k = (this.now - s.eat.t0) / 0.5
      const [tx, ty] = s.eat.to === 'maple' ? this.stage.maple : this.stage.family
      if (k < 1) {
        s.x += (tx + 20 - s.x) * Math.min(1, dt * 10)
        s.y += (ty - s.y) * Math.min(1, dt * 10)
      } else {
        // A new marshmallow on the stick, back on its rest.
        s.eat = null
        s.toast = 0
        s.fire = false
        s.charred = false
        s.golden = false
        s.x = s.rx
        s.y = s.ry
        s.pop = this.now
        sounds.pop()
      }
    } else if (s.held && f) {
      const ox = s.x
      const oy = s.y
      s.x = f.x
      s.y = f.y - TORCH.lift * 0.6
      const v = dist(s.x, s.y, ox, oy) / Math.max(dt, 1e-3)
      f.speed = f.speed * 0.8 + v * 0.2
      // A fast wave blows a burning marshmallow out.
      if (s.fire && f.speed > 2600) this.blowOut()
    } else {
      s.x += (s.rx - s.x) * Math.min(1, dt * 6)
      s.y += (s.ry - s.y) * Math.min(1, dt * 6)
    }
    // Heat: closer to the flames is hotter.
    const d = dist(s.x, s.y, fx, fy - 60)
    s.heat = s.charred || !s.held ? 0 : Math.pow(clamp(1 - d / ROAST.heat, 0, 1), 1.5)
    if (!s.fire && !s.charred) {
      s.toast += s.heat * dt
      if (s.heat > 0.05 && Math.random() < dt * 6 * s.heat) night.sizzle(0.02 + 0.03 * s.heat)
      if (!s.golden && s.toast >= ROAST.golden) {
        s.golden = true
        sounds.sparkle()
      }
      if (s.toast >= ROAST.golden + ROAST.burn) {
        s.fire = true
        s.fireT = this.now
        night.whoosh(0.1)
        this.say('🔥 It’s on fire! Tap it to blow it out')
        this.ev.speak(T.onFire)
      }
    } else if (s.fire && this.now - s.fireT > ROAST.out) this.blowOut()
    if (s.fire && Math.random() < dt * 8) this.spark(s.x, s.y - 20, 0.7)
  }

  private blowOut() {
    const s = this.stick
    if (!s.fire) return
    s.fire = false
    s.charred = true
    night.blow()
    for (let i = 0; i < 6; i++) this.spark(s.x, s.y - 10, 0.5)
    this.say('🖤 A black, crunchy one!')
  }

  private letGoStick() {
    const s = this.stick
    const [mx, my] = this.stage.maple
    const [fx, fy] = this.stage.family
    const toMaple = dist(s.x, s.y, mx, my) < 160
    const toFamily = dist(s.x, s.y, fx + 60, fy) < 200
    if (!toMaple && !toFamily) {
      sounds.place()
      return
    }
    if (s.fire) this.blowOut()
    s.eat = { to: toMaple ? 'maple' : 'family', t0: this.now }
    const g = ROAST.golden
    const golden = s.toast >= g * 0.75 && !s.charred
    if (toMaple) {
      this.mapleDo('chomp')
      night.munch(this.pan(mx))
      if (s.charred) {
        this.later(() => this.mapleDo('wiggle'), 900)
        this.say('😅 Too crunchy for Maple!')
        this.ev.speak(T.tooCrunchy)
      } else {
        this.say(golden ? '😋 Golden! Maple loves it' : s.toast < g * 0.3 ? '☁️ Squishy and white: yum anyway' : '😋 Yum!')
        this.ev.speak(golden ? T.golden : T.squishy)
      }
    } else {
      const r = this.crits.get('raccoon')!
      const k = this.crits.get('kits')!
      this.act(r, s.charred ? 'cheer' : 'munch')
      this.act(k, s.charred ? 'cheer' : 'munch')
      night.munch(this.pan(fx))
      this.say(s.charred ? '🦝 The raccoons LOVE the burnt ones!' : '🦝 Crunch munch!')
      this.ev.speak(s.charred ? T.burntYum : T.munch)
    }
    s.eaten++
    if (s.eaten === EATEN_TO_STARS) this.later(() => this.ev.section('stars', this.foundIds()), 2600)
  }

  // -------------------------------------------------------------- the stars

  private tickStars(dt: number) {
    const R = TORCH.size
    const up = this.light.y < this.stage.sky + R * 0.4
    let lit = 0
    let all = 0
    for (const s of this.stars) {
      if (!s.lit && up && dist(s.x, s.y, this.light.x, this.light.y) < R * 0.9) {
        s.lit = true
        if (Math.random() < 0.3) night.twinkle(this.pan(s.x))
      }
      const want = s.lit ? 0.75 + 0.25 * Math.sin(this.now * 2.2 + s.ph) : 0
      const was = s.on
      s.on += (want - s.on) * Math.min(1, dt * 3)
      if (Math.abs(s.on - was) > 0.004) put(s.el, 'opacity', s.on.toFixed(2))
      if (s.x >= 0 && s.x <= this.stage.w) {
        all++
        if (s.lit) lit++
      }
    }
    if (this.section === 'stars' && !this.starsDone && all && lit / all > 0.6) this.starsFinale()
  }

  private starsFinale() {
    this.starsDone = true
    for (const s of this.stars) s.lit = true
    this.later(() => {
      const el = this.els.shoot
      if (el) put(el, 'class', 'camp-shoot')
      sounds.fanfare()
      bigCelebration()
      for (const c of this.crits.values()) if (c.on) this.act(c, 'cheer')
      this.mapleDo('cheer')
      this.say('🌟 The sky is full of stars!')
      this.ev.speak(T.fullSky, true)
      this.ev.speak(T.goodnight, true)
      this.ended = true
      this.ev.end()
    }, 600)
  }

  // -------------------------------------------------------------- every frame

  tick(dt: number) {
    if (this.dead) return
    this.now += dt
    const l = this.light
    const k = 1 - Math.exp(-TORCH.follow * dt)
    const ox = l.x
    const oy = l.y
    l.x += (l.tx - l.x) * k
    l.y += (l.ty - l.y) * k
    l.speed = l.speed * 0.8 + (dist(l.x, l.y, ox, oy) / Math.max(dt, 1e-3)) * 0.2
    this.ev.light(l.x, l.y)
    this.tickStars(dt)
    if (this.section === 'eyes' || this.section === 'sounds' || this.section === 'bandit') this.tickFinding(dt)
    if (this.section === 'sounds') this.tickSounds()
    if (this.section === 'bandit') this.tickTrail()
    if (this.section === 'marshmallow') this.tickStick(dt)
    this.drawCritters()
    this.tickMoose(dt)
    this.tickBat(dt)
    this.drawFire()
    this.drawFlies()
    this.drawFx()
    this.drawTrail()
    this.drawStick()
    this.drawFlashlight()
    this.tickHint()
    this.updateSay()
  }

  private drawCritters() {
    const help = clamp((this.now - this.lastFind - FIND.help) / 6, 0, 1)
    const k = this.k
    for (const c of this.crits.values()) {
      const { front, body, eyes, eyesIn, puppets } = c.els
      const Lk = LOOKS[c.id]
      // Over the dark: friends glow softly once they're out.
      const want = c.on && !c.hiding ? 0.95 : 0
      c.frontA += (want - c.frontA) * 0.1
      const vis = c.on && (c.frontA > 0.01 || !!c.anim) ? 'visible' : 'hidden'
      put(front, 'visibility', vis)
      for (const p of puppets) put(p, 'style.visibility', vis)
      put(eyes, 'visibility', c.on && c.eyes ? 'visible' : 'hidden')
      if (!c.on) continue
      // The animation: hops, a tail slap, a puff of quills; coming out walks it from where it hid to where it stands.
      let dx = 0
      let dy = 0
      let sx = 1
      let sy = 1
      let rot = 0
      let x = c.x
      let y = c.y
      const a = c.anim
      if (a) {
        const p = (this.now - a.t0) / a.dur
        if (p >= 1) c.anim = null
        else if (a.kind === 'out') {
          const w = ease(p * 1.4)
          x = c.from[0] + (c.x - c.from[0]) * w
          y = c.from[1] + (c.y - c.from[1]) * w
          dy = -40 * bell(clamp(p * 1.6, 0, 1))
          sy = 1 + 0.12 * bell(clamp(p * 1.6, 0, 1)) - 0.1 * bell(clamp((p - 0.6) * 2.5, 0, 1))
          sx = 2 - sy
          rot = 6 * Math.sin(p * 18) * bell(clamp((p - 0.55) * 2.2, 0, 1))
        } else if (a.kind === 'hop' || a.kind === 'cheer') {
          const n = a.kind === 'cheer' ? 2 : 1
          const q = (p * n) % 1
          const crouch = bell(clamp(q * 4, 0, 1)) * (q < 0.25 ? 1 : 0)
          dy = -36 * bell(clamp((q - 0.15) / 0.75, 0, 1))
          sy = 1 - 0.14 * crouch + 0.1 * bell(clamp((q - 0.15) / 0.75, 0, 1)) - 0.1 * bell(clamp((q - 0.88) * 8, 0, 1))
          sx = 2 - sy
        } else if (a.kind === 'wiggle' || a.kind === 'munch') {
          rot = 7 * Math.sin(p * Math.PI * 6) * bell(p)
          sy = 1 + 0.05 * Math.sin(p * Math.PI * 8)
        } else if (a.kind === 'croak') {
          // A peeper puffs up to sing.
          sx = 1 + 0.18 * bell(clamp(p * 2, 0, 1))
          sy = 1 - 0.06 * bell(clamp(p * 2, 0, 1))
        } else if (a.kind === 'slap') {
          dy = -18 * bell(clamp(p * 2, 0, 1))
          rot = -10 * bell(p)
          if (p > 0.45 && p - (1 / 60 / a.dur) * 2 < 0.45) this.ripple(x, y + 40)
        } else if (a.kind === 'puff') {
          // Quills up: the porcupine puffs big, holds it, and settles.
          const up = bell(clamp(p * 1.1, 0, 1))
          sx = 1 + 0.16 * up
          sy = 1 + 0.12 * up
          dy = -8 * bell(clamp(p * 4, 0, 1))
        } else if (a.kind === 'thump') {
          const q = p < 0.4 ? p / 0.4 : (p - 0.4) / 0.6
          const j = bell(q)
          dy = -10 * j
          sy = 1 - 0.08 * bell(clamp(q * 3 - 2, 0, 1)) + 0.05 * j
          sx = 2 - sy
        } else if (a.kind === 'shake') rot = 12 * Math.sin(p * 30) * bell(p)
      }
      // Everybody breathes.
      sy *= 1 + 0.025 * Math.sin(this.now * 2.4 + c.blinkAt)
      const foot = (Lk.foot - Lk.eye[1]) * Lk.h
      put(front, 'transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`)
      put(body, 'transform', `translate(${dx.toFixed(1)} ${(dy + foot).toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${(sx * c.face).toFixed(3)} ${sy.toFixed(3)}) translate(0 ${(-foot).toFixed(1)})`)
      put(front, 'opacity', c.frontA.toFixed(2))
      // The puppets (the raccoons) stand over the night at the same spot; they do their own hops.
      puppets.forEach((el, i) => {
        const off = c.id === 'kits' ? (i ? KIT_GAP : -KIT_GAP) : 0
        const px = (x + off - Lk.eye[0] * Lk.w - this.vb.x) * k
        const py = (y + (c.id === 'kits' && i ? 6 : 0) - Lk.eye[1] * Lk.h - this.vb.y) * k
        put(el, 'style.transform', `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`)
        put(el, 'style.width', `${(Lk.w * k).toFixed(1)}px`)
        put(el, 'style.height', `${(Lk.h * k).toFixed(1)}px`)
        put(el, 'style.opacity', c.frontA.toFixed(2))
      })
      // The eyes shining in the dark: they blink now and then, and grow brighter while she hasn't found any for a
      // while (help).
      if (c.eyes && eyes) {
        if (this.now > c.blinkAt + 0.16) c.blinkAt = this.now + 1.5 + Math.random() * 3.5
        const blink = this.now > c.blinkAt ? 0.1 : 1
        const s = FIND.shine * (1 + 0.6 * help) * (1 + 0.15 * Math.min(1, c.dwell / Math.max(0.05, FIND.dwell)))
        put(eyes, 'transform', `translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) scale(${s.toFixed(3)})`)
        put(eyes, 'opacity', (0.75 + 0.25 * help).toFixed(2))
        put(eyesIn, 'transform', `scale(1 ${blink})`)
      }
    }
  }

  private tickMoose(dt: number) {
    const m = this.moose
    const [mx, my] = this.stage.moose
    const lit = dist(mx, my, this.light.x, this.light.y) < TORCH.size * 0.55
    if (lit) {
      m.lit += dt
      m.dark = 0
    } else {
      m.dark += dt
      if (m.dark > 1.2) m.lit = 0
    }
    // Shine it in his face: he squints, then on go his (pretend) sunglasses.
    const squint = m.lit > 0.4 ? 1 : 0
    const shades = m.lit > 1.4 ? 1 : 0
    if (squint && m.squint < 0.5) {
      meet('moose')
      if (this.now - m.said > 6) {
        m.said = this.now
        this.ev.speak(T.mooseBright)
      }
    }
    if (shades && m.shades < 0.5 && m.squint > 0.5) {
      m.shadesAt = this.now
      this.later(() => {
        sounds.sparkle()
        this.ev.speak(T.mooseShades)
        if (this.lastSay.indexOf('😎') < 0) this.say('😎 Pretend sunglasses for the moose!')
      }, 350)
    }
    m.squint += (squint - m.squint) * Math.min(1, dt * 10)
    // The glasses go on once his hoof has brought them up.
    const hoof = (this.now - m.shadesAt) / 0.9
    m.shades += ((shades && hoof > 0.45 ? 1 : 0) - m.shades) * Math.min(1, dt * 8)
    put(this.els.squint, 'opacity', m.squint > 0.5 && m.shades < 0.5 ? '1' : '0')
    put(this.els['moose-eyes'], 'opacity', m.squint > 0.5 ? '0' : '1')
    put(this.els.shades, 'transform', `translate(0 ${(-30 * (1 - m.shades)).toFixed(1)}) scale(${(0.8 + 0.2 * m.shades).toFixed(3)})`)
    put(this.els.shades, 'opacity', m.shades.toFixed(2))
    put(this.els['moose-hoof'], 'transform', `translate(0 ${(170 * (1 - bell(clamp(hoof, 0, 1)))).toFixed(1)})`)
    put(this.els['moose-hoof'], 'visibility', hoof >= 0 && hoof < 1 ? 'visible' : 'hidden')
    // Always chewing; an ear flicks now and then; he blinks.
    put(this.els['moose-jaw'], 'transform', `translate(0 ${(3 + 3 * Math.sin(this.now * 5.2)).toFixed(1)})`)
    if (this.now > m.ear) {
      m.earAt = this.now
      m.ear = this.now + 2.5 + Math.random() * 4
    }
    const flick = 18 * wobble(clamp((this.now - m.earAt) / 0.6, 0, 1), 2) * (this.now - m.earAt < 0.6 ? 1 : 0)
    put(this.els['moose-earL'], 'transform', `rotate(${(-flick).toFixed(1)} -52 -46)`)
    put(this.els['moose-earR'], 'transform', `rotate(${(flick * 0.4).toFixed(1)} 52 -46)`)
    if (this.now > m.blinkAt + 0.15) m.blinkAt = this.now + 2 + Math.random() * 3
    put(this.els['moose-eyes-in'], 'transform', `scale(1 ${this.now > m.blinkAt ? 0.1 : 1})`)
    const p = (this.now - m.anim) / 0.9
    if (p >= 0 && p < 1.1) {
      const rot = p < 1 ? 10 * Math.sin(p * 24) * bell(p) : 0
      for (const k of ['moose-head', 'moose-front']) put(this.els[k], 'transform', `rotate(${rot.toFixed(1)} ${mx} ${my + 60})`)
    }
  }

  private tickBat(dt: number) {
    const b = this.bat
    const el = this.els.bat
    if (!el) return
    if (!b.on && this.now > b.next) {
      // It swoops through the light when the light is up in the trees or the sky.
      if (this.light.y < this.stage.treeline + 40) {
        b.on = true
        b.dir = Math.random() < 0.5 ? 1 : -1
        b.x = this.light.x - b.dir * (this.vb.w * 0.6)
        b.y = this.light.y - 40
      } else b.next = this.now + 2
    }
    if (b.on) {
      const loop = (this.now - b.loop) / 0.8
      b.x += b.dir * 620 * dt
      const ly = loop >= 0 && loop < 1 ? -Math.sin(loop * Math.PI * 2) * 90 : 0
      const lx = loop >= 0 && loop < 1 ? (1 - Math.cos(loop * Math.PI * 2)) * 50 * b.dir : 0
      put(el, 'transform', `translate(${(b.x + lx).toFixed(0)} ${(b.y + ly + Math.sin(this.now * 7) * 14).toFixed(0)}) scale(${b.dir} 1)`)
      put(this.els['bat-wings'], 'transform', `scale(1 ${(0.45 + 0.55 * Math.abs(Math.sin(this.now * 14))).toFixed(2)})`)
      if (Math.abs(b.x - this.light.x) < 20 && Math.random() < 0.5) night.squeak(this.pan(b.x))
      if (Math.abs(b.x - this.light.x) > this.vb.w * 0.7) {
        b.on = false
        b.next = this.now + 10 + Math.random() * 10
      }
    }
    put(el, 'visibility', b.on ? 'visible' : 'hidden')
  }

  private spark(x: number, y: number, power: number) {
    const s = this.sparks.find((o) => o.t >= o.life)
    if (!s) return
    s.x = x
    s.y = y
    s.vx = (Math.random() - 0.5) * 80 * power
    s.vy = -(120 + Math.random() * 160) * power
    s.t = 0
    s.life = 0.8 + Math.random() * 0.8
  }

  private drawFire() {
    const [fx, fy] = this.stage.fire
    const tap = clamp(1 - (this.now - this.fireTap) / 0.8, 0, 1)
    const f = 1 + 0.08 * Math.sin(this.now * 13) + 0.05 * Math.sin(this.now * 7.3) + 0.35 * tap
    put(this.els.flames, 'transform', `translate(${fx} ${fy + 6}) scale(${(1 + 0.04 * Math.sin(this.now * 9)).toFixed(3)} ${f.toFixed(3)})`)
    if (this.glow && (tap > 0 || this.glow.dataset.tap === '1')) {
      this.glow.style.transform = `scale(${(1 + 0.25 * tap).toFixed(3)})`
      this.glow.dataset.tap = tap > 0 ? '1' : '0'
    }
    if (Math.random() < 0.06) this.spark(fx + (Math.random() - 0.5) * 50, fy - 60, 0.8)
    if (Math.random() < 0.04) night.crackle()
  }

  private drawFlies() {
    for (const f of this.flies) {
      const zip = clamp(1 - (this.now - f.zip) / 1.2, 0, 1)
      f.x = f.hx + Math.sin(this.now * 0.6 + f.ph) * 60 + zip * 140 * Math.sin(f.ph * 3)
      f.y = f.hy + Math.sin(this.now * 0.9 + f.ph * 2) * 30 - zip * 160
      const on = Math.max(0, Math.sin(this.now * 1.6 + f.ph * 5)) ** 3
      put(f.el, 'transform', `translate(${f.x.toFixed(0)} ${f.y.toFixed(0)}) scale(${(1 + zip).toFixed(2)})`)
      put(f.el, 'opacity', Math.min(1, on + zip).toFixed(2))
    }
  }

  private ripple(x: number, y: number) {
    const r = this.ripples.find((o) => o.t >= 1.6) ?? this.ripples[0]
    if (!r) return
    r.t = 0
    r.x = x
    r.y = y
  }

  private drawFx() {
    const dt = 1 / 60
    for (const s of this.sparks) {
      if (s.t >= s.life) {
        if (s.t < 9) {
          put(s.el, 'opacity', '0')
          s.t = 9
        }
        continue
      }
      s.t += dt
      s.x += s.vx * dt
      s.y += s.vy * dt
      s.vy += 40 * dt
      put(s.el, 'cx', s.x.toFixed(0))
      put(s.el, 'cy', s.y.toFixed(0))
      put(s.el, 'opacity', (1 - s.t / s.life).toFixed(2))
    }
    // Sound ripples: faint at first, clearer the more often she's heard it without finding it (help).
    const strong = this.section === 'sounds' ? clamp(0.25 + this.snd.heard * 0.1 + clamp((this.now - this.lastFind - FIND.help) / 6, 0, 1) * 0.4, 0, 0.9) : 0.6
    for (const r of this.ripples) {
      if (r.t >= 1.6) {
        if (r.t < 9) {
          put(r.el, 'opacity', '0')
          r.t = 9
        }
        continue
      }
      r.t += dt
      put(r.el, 'cx', r.x.toFixed(0))
      put(r.el, 'cy', r.y.toFixed(0))
      put(r.el, 'r', (30 + r.t * 110).toFixed(0))
      put(r.el, 'opacity', (strong * (1 - r.t / 1.6)).toFixed(2))
    }
    // Snores from the tent.
    if (this.now - this.tentT < 2.4) {
      const [tx, ty] = this.stage.tent
      this.zs.forEach((z, i) => {
        const p = (this.now - this.tentT - i * 0.4) / 1.6
        const on = p > 0 && p < 1
        put(z.el, 'opacity', on ? (1 - p).toFixed(2) : '0')
        if (on) put(z.el, 'transform', `translate(${(tx + 30 + p * 60 + i * 10).toFixed(0)} ${(ty - this.stage.tentSize[1] * 0.6 - p * 110).toFixed(0)})`)
      })
    } else for (const z of this.zs) put(z.el, 'opacity', '0')
    // A rustling bush shakes.
    const g = this.els.bushes
    if (g) {
      const p = (this.now - this.trail.shake) / 0.7
      const b = g.children[this.trail.bush]
      const [bx, by, br] = this.stage.bushes[this.trail.bush] ?? [0, 0, 0]
      if (b && p >= 0 && p < 1.2) put(b, 'transform', `rotate(${(p < 1 ? 6 * Math.sin(p * 40) * bell(p) : 0).toFixed(1)} ${bx} ${by + br})`)
    }
  }

  private drawTrail() {
    const g = this.els['trail-glow']
    if (!g || this.section !== 'bandit') return
    const t = this.trail
    ;[...g.children].forEach((el, i) => {
      let o = 0
      if (t.lit.includes(i)) o = 0.85
      // The next print shimmers faintly when she hasn't found one for a while.
      else if (i === t.next && this.now - Math.max(t.at, this.lastFind) > 4) o = 0.2 + 0.2 * Math.sin(this.now * 4)
      put(el, 'opacity', o.toFixed(2))
    })
  }

  private drawStick() {
    const el = this.els.stick
    if (!el) return
    const s = this.stick
    const [hx, hy] = this.handle()
    put(el, 'd', `M${hx.toFixed(0)} ${hy.toFixed(0)} L ${s.x.toFixed(0)} ${s.y.toFixed(0)}`)
    const m = this.els.mallow
    if (!m) return
    const g = ROAST.golden
    const t = s.toast
    // White, then golden, then brown; black once it has burnt.
    const col = s.charred ? '#2E2630' : t < g * 0.5 ? mix('#FFFDF8', '#F7E3B5', t / (g * 0.5)) : t < g ? mix('#F7E3B5', '#E8B15A', (t - g * 0.5) / (g * 0.5)) : mix('#E8B15A', '#9A5A2A', (t - g) / ROAST.burn)
    const puff = 1 + 0.22 * clamp(t / g, 0, 1) + (s.charred ? -0.12 : 0)
    const pop = 1 + 0.3 * bell(clamp((this.now - s.pop) / 0.4, 0, 1))
    // It wobbles a little while it's hot (puffing up).
    const jig = s.heat > 0.05 ? 1 + 0.04 * Math.sin(this.now * 22) * s.heat : 1
    put(m, 'transform', `translate(${s.x.toFixed(0)} ${s.y.toFixed(0)}) rotate(-25) scale(${(puff * pop * jig).toFixed(3)} ${(puff * pop).toFixed(3)})`)
    put(m, 'visibility', s.eat && this.now - s.eat.t0 > 0.35 ? 'hidden' : 'visible')
    put(this.els['mallow-body'], 'fill', col)
    const fire = this.els['mallow-fire']
    if (fire) {
      put(fire, 'opacity', s.fire ? '1' : '0')
      put(fire, 'transform', `translate(${s.x.toFixed(0)} ${(s.y - 26).toFixed(0)}) scale(${(1 + 0.15 * Math.sin(this.now * 18)).toFixed(2)} ${(1 + 0.2 * Math.sin(this.now * 23)).toFixed(2)})`)
    }
  }

  /** Maple's flashlight stays in her paw and points at the light; the beam runs from its lens to the circle. */
  private drawFlashlight() {
    const m = this.maple
    const q = m.kind ? (this.now - m.anim) / MAPLE_DUR[m.kind] : 1
    if (q >= 1) m.kind = null
    const [px, py] = maplePaw(m.kind, clamp(q, 0, 1))
    const [bx, by] = mapleBox(this.stage)
    const u = MAPLE_BOX / 500
    const sx = bx + px * u
    const sy = by + py * u
    const ang = Math.atan2(this.light.y - sy, this.light.x - sx)
    put(this.els.flash, 'transform', `translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${((ang * 180) / Math.PI).toFixed(1)})`)
    // The beam, from the lens (70 units along the flashlight) to the edge of the light.
    const el = this.els.beam
    if (!el) return
    const hx = sx + Math.cos(ang) * 70 * u
    const hy = sy + Math.sin(ang) * 70 * u
    const R = TORCH.size * 0.55
    const dx = this.light.x - hx
    const dy = this.light.y - hy
    const D = Math.hypot(dx, dy)
    if (D <= R + 10 || TORCH.beam <= 0) {
      put(el, 'opacity', '0')
      return
    }
    const a = Math.asin(R / D)
    const base = Math.atan2(dy, dx)
    const Tn = Math.sqrt(D * D - R * R)
    const p1 = [hx + Math.cos(base - a) * Tn, hy + Math.sin(base - a) * Tn]
    const p2 = [hx + Math.cos(base + a) * Tn, hy + Math.sin(base + a) * Tn]
    put(el, 'points', `${hx.toFixed(0)},${hy.toFixed(0)} ${p1[0].toFixed(0)},${p1[1].toFixed(0)} ${p2[0].toFixed(0)},${p2[1].toFixed(0)}`)
    put(el, 'opacity', TORCH.beam.toFixed(2))
  }

  // -------------------------------------------------------------- what's on screen, for Dad, and the hint

  private say(text: string) {
    this.lastSay = text
    this.sayAt = this.now
    this.ev.say(text)
  }

  private updateSay() {
    if (this.now - this.sayAt < 2.6) return
    let text = SAY[this.section]
    const s = this.stick
    if (this.section === 'marshmallow') {
      if (s.fire) text = '🔥 It’s on fire! Tap it to blow it out'
      else if (s.charred || s.toast >= ROAST.golden * 0.75) text = '🍡 Give it to Maple or the raccoons'
      else if (s.heat > 0.1) text = '♨️ It puffs up… keep it there'
    } else if (this.section === 'sounds' && !this.snd.done) {
      const c = this.crits.get(SOUNDS[this.snd.i])!
      const side = c.x < this.light.x - TORCH.size * 0.5 ? '⬅️' : c.x > this.light.x + TORCH.size * 0.5 ? '➡️' : '👀'
      text = `👂 Who’s that? ${side}`
    } else if (this.section === 'stars' && this.ended) text = '🌟 Goodnight, campsite!'
    if (text !== this.lastSay) {
      this.lastSay = text
      this.ev.say(text)
    }
  }

  private tickHint() {
    const h = this.els.hint
    if (!h) return
    const idle = !this.finger && this.now - this.lastTouch > 8 && this.now - this.lastFind > 8 && !this.ended
    let at: Pt | null = null
    if (idle) {
      const st = this.stage
      if (this.section === 'eyes') {
        const c = [...this.crits.values()].filter((o) => o.on && o.hiding).sort((a, b) => dist(a.x, a.y, this.light.x, this.light.y) - dist(b.x, b.y, this.light.x, this.light.y))[0]
        if (c) at = [c.x, c.y]
      } else if (this.section === 'sounds' && !this.snd.done) {
        const c = this.crits.get(SOUNDS[this.snd.i])!
        if (c.hiding) at = [c.x, c.y]
      } else if (this.section === 'bandit' && this.trail.next < st.prints.length) at = st.prints[this.trail.next]
      else if (this.section === 'marshmallow') {
        const s = this.stick
        const k = (this.now * 0.6) % 1
        if (s.charred || s.toast >= ROAST.golden * 0.75) at = [s.x + (st.maple[0] - s.x) * ease(k), s.y + (st.maple[1] - s.y) * ease(k)]
        else at = [s.x + (st.fire[0] - s.x) * ease(k), s.y + (st.fire[1] - 80 - s.y) * ease(k)]
      } else if (this.section === 'stars') at = [this.light.x + 200 * Math.sin(this.now * 0.5), st.sky - 160]
      // Sparkle says the hint once each time she gets stuck.
      if (at && !this.hinted) {
        this.hinted = true
        if (spendHint(HINT[this.section])) this.ev.speak(HINT[this.section])
      }
    }
    put(h, 'opacity', at ? '1' : '0')
    if (at) put(h, 'transform', `translate(${at[0].toFixed(0)} ${(at[1] + 50).toFixed(0)})`)
  }

  qa() {
    return {
      section: this.section,
      found: ROSTER.filter((id) => this.crits.get(id)!.found),
      hiding: ROSTER.filter((id) => this.crits.get(id)!.on && this.crits.get(id)!.hiding),
      light: [Math.round(this.light.x), Math.round(this.light.y)],
      size: TORCH.size,
      sound: this.section === 'sounds' ? (this.snd.done ? 'done' : SOUNDS[this.snd.i]) : null,
      prints: this.section === 'bandit' ? { next: this.trail.next, of: this.stage.prints.length } : null,
      stick: this.section === 'marshmallow' ? { x: Math.round(this.stick.x), y: Math.round(this.stick.y), held: this.stick.held, heat: +this.stick.heat.toFixed(2), toast: +this.stick.toast.toFixed(2), fire: this.stick.fire, charred: this.stick.charred, eaten: this.stick.eaten } : null,
      stars: this.stars.filter((s) => s.lit).length,
      shades: this.moose.shades > 0.5,
      ended: this.ended,
    }
  }
}

function mix(a: string, b: string, t: number) {
  const k = clamp(t, 0, 1)
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * k).toString(16).padStart(2, '0')).join('')}`
}

// ---------------------------------------------------------------- the pieces of the scene

/** A night animal over the dark: a soft halo and its picture (the raccoons' puppets are HTML over the scene). Its (0, 0)
 *  is the middle of its eyes. */
function CritterEl({ id, halo }: { id: CritterId; halo: string }) {
  const Lk = LOOKS[id]
  const left = -Lk.eye[0] * Lk.w
  const top = -Lk.eye[1] * Lk.h
  const foot = (Lk.foot - Lk.eye[1]) * Lk.h
  return (
    <g data-k={`cf-${id}`} visibility="hidden">
      <ellipse cx={0} cy={foot - Lk.h * 0.45} rx={Lk.w * (id === 'kits' ? 1.3 : 0.85)} ry={Lk.h * 0.75} fill={halo} />
      <g data-k={`cf-${id}-body`}>{Lk.pic && <image href={pic(Lk.pic)} x={left} y={top} width={Lk.w} height={Lk.h} preserveAspectRatio="none" />}</g>
    </g>
  )
}

/** Eyes shining in the dark (drawn over the darkness), around (0, 0). */
function EyesEl({ id }: { id: CritterId }) {
  const Lk = LOOKS[id]
  const twins = id === 'kits' ? [-KIT_GAP, KIT_GAP] : [0]
  return (
    <g data-k={`e-${id}`} visibility="hidden" pointerEvents="none">
      <g data-k={`e-${id}-in`}>
        {twins.flatMap((dx) =>
          [-1, 1].map((s) => (
            <g key={`${dx}${s}`}>
              <circle cx={dx + s * Lk.gap} cy={0} r={Lk.eyeR * 2.3} fill={Lk.shine} opacity={0.22} />
              <circle cx={dx + s * Lk.gap} cy={0} r={Lk.eyeR} fill={Lk.shine} />
              <circle cx={dx + s * Lk.gap + Lk.eyeR * 0.35} cy={-Lk.eyeR * 0.35} r={Lk.eyeR * 0.35} fill="#fff" />
            </g>
          )),
        )}
      </g>
    </g>
  )
}

/** The moose at the edge of the camp, head and shoulders out of the trees: big droopy nose, the bell under his chin,
 *  flat palmate antlers, always chewing. His eyes, squint and pretend sunglasses are drawn over the dark (MooseFront). */
function MooseEl() {
  const fur = MC.mooseFur
  const antler = (s: 1 | -1) => (
    <path
      transform={`scale(${s} 1)`}
      d="M34 -62 C60 -78 84 -82 104 -80 C108 -100 116 -118 128 -128 C130 -112 128 -100 128 -90 C138 -106 150 -118 164 -124 C162 -108 156 -96 150 -86 C162 -96 176 -102 190 -102 C184 -88 174 -78 162 -70 C150 -58 120 -50 92 -50 C72 -50 52 -46 40 -40 Z"
      fill={MC.antler}
      stroke={INK}
      strokeWidth={5}
      strokeLinejoin="round"
    />
  )
  return (
    <g>
      {/* His long legs and big body behind his head, the hump at his shoulders. */}
      {[40, 90, 190, 230].map((x, i) => (
        <g key={x}>
          <rect x={x - 13} y={150} width={26} height={150} rx={12} fill={i % 2 ? MC.mooseDark : fur} stroke={INK} strokeWidth={5} />
          <rect x={x - 15} y={284} width={30} height={18} rx={6} fill={MC.mooseDark} stroke={INK} strokeWidth={4} />
        </g>
      ))}
      <path d="M-30 90 C-30 30 20 0 80 4 C150 8 260 40 270 120 C278 180 230 210 150 210 L30 210 C-10 206 -30 160 -30 90 Z" fill={fur} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M262 92 l 22 -14 l -4 28 Z" fill={MC.mooseDark} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {antler(1)}
      {antler(-1)}
      <g data-k="moose-earL">
        <path d="M-40 -40 C-70 -62 -96 -60 -104 -52 C-94 -36 -70 -26 -46 -26 Z" fill={fur} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M-50 -38 C-70 -50 -86 -50 -92 -46 C-84 -38 -70 -32 -54 -32 Z" fill={MC.mooseLight} />
      </g>
      <g data-k="moose-earR">
        <path d="M40 -40 C70 -62 96 -60 104 -52 C94 -36 70 -26 46 -26 Z" fill={fur} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M50 -38 C70 -50 86 -50 92 -46 C84 -38 70 -32 54 -32 Z" fill={MC.mooseLight} />
      </g>
      {/* The bell (the flap of fur under his chin). */}
      <path d="M-12 96 C-16 120 -10 146 0 152 C10 146 16 120 12 96 Z" fill={MC.mooseDark} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {/* His long face. */}
      <path d="M-54 -30 C-56 -62 56 -62 54 -30 C58 0 52 30 46 54 C40 80 24 100 0 100 C-24 100 -40 80 -46 54 C-52 30 -58 0 -54 -30 Z" fill={fur} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {/* The big droopy nose and its chewing chin. */}
      <g data-k="moose-jaw">
        <ellipse cx={0} cy={86} rx={30} ry={14} fill={MC.mooseLight} stroke={INK} strokeWidth={4} />
      </g>
      <path d="M-50 40 C-54 74 -30 92 0 92 C30 92 54 74 50 40 C44 20 -44 20 -50 40 Z" fill={MC.mooseLight} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <ellipse cx={-18} cy={56} rx={8} ry={11} fill={MC.mooseDark} />
      <ellipse cx={18} cy={56} rx={8} ry={11} fill={MC.mooseDark} />
      <path d="M-14 78 Q0 86 14 78" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      {[-1, 1].map((s) => (
        <ellipse key={s} cx={s * 40} cy={14} rx={11} ry={7} fill="#FF9DB8" opacity={0.7} />
      ))}
      {[-1, 1].map((s) => (
        <g key={s}>
          <circle cx={s * MOOSE_EYES.gap} cy={MOOSE_EYES.y} r={11} fill="#2B2236" />
          <circle cx={s * MOOSE_EYES.gap + 4} cy={MOOSE_EYES.y - 4} r={4} fill="#fff" />
        </g>
      ))}
    </g>
  )
}

/** Over the dark: the moose's shining eyes, his squint, the hoof that brings up his pretend sunglasses, and the
 *  sunglasses themselves (dotted, sparkly: there aren't really any). */
function MooseFront() {
  const { gap, y, r, shine } = MOOSE_EYES
  return (
    <>
      <g data-k="moose-eyes" pointerEvents="none">
        <g data-k="moose-eyes-in" transform={`translate(0 ${y})`}>
          {[-1, 1].map((s) => (
            <g key={s}>
              <circle cx={s * gap} cy={0} r={r * 2.3} fill={shine} opacity={0.22} />
              <circle cx={s * gap} cy={0} r={r} fill={shine} />
              <circle cx={s * gap + 4} cy={-4} r={3.5} fill="#fff" />
            </g>
          ))}
        </g>
      </g>
      <g data-k="squint" opacity={0}>
        {[-1, 1].map((s) => (
          <path key={s} d={`M${s * gap - 14} ${y + 2} Q ${s * gap} ${y - 8} ${s * gap + 14} ${y + 2}`} stroke="#2B2236" strokeWidth={6} fill="none" strokeLinecap="round" />
        ))}
        <path d={`M-48 ${y - 26} l 12 8 M 48 ${y - 26} l -12 8`} stroke="#2B2236" strokeWidth={5} strokeLinecap="round" />
      </g>
      <g data-k="moose-hoof" visibility="hidden">
        <path d={`M26 ${y + 150} C22 ${y + 100} 20 ${y + 50} 30 ${y + 22} L 58 ${y + 22} C 66 ${y + 50} 64 ${y + 100} 60 ${y + 150} Z`} fill={MC.mooseFur} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d={`M28 ${y + 30} C 30 ${y + 10} 58 ${y + 10} 60 ${y + 30} Z M 44 ${y + 12} L 44 ${y + 30}`} fill={MC.mooseDark} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      </g>
      <g data-k="shades" opacity={0}>
        <g transform={`translate(0 ${y})`}>
          <path d="M-14 -2 Q0 -10 14 -2" stroke="#FFF2C8" strokeWidth={4} fill="none" strokeDasharray="5 5" strokeLinecap="round" />
          {[-1, 1].map((s) => (
            <rect key={s} x={s * gap - 22} y={-14} width={44} height={28} rx={11} fill="rgba(255,242,200,.12)" stroke="#FFF2C8" strokeWidth={4} strokeDasharray="7 6" strokeLinecap="round" />
          ))}
          {[
            [-58, -26, 1],
            [60, -22, 0.8],
            [8, -36, 0.6],
          ].map(([x, yy, s], i) => (
            <path key={i} transform={`translate(${x} ${yy}) scale(${s})`} d="M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3 Z" fill="#FFF2C8" />
          ))}
        </g>
      </g>
    </>
  )
}

function Spruce({ x, y, h, fill }: { x: number; y: number; h: number; fill: string }) {
  const w = h * 0.36
  const tiers = 4
  return (
    <g>
      {Array.from({ length: tiers }, (_, i) => {
        const top = y - h + (i * h * 0.75) / tiers
        const bot = top + h * 0.42
        const ww = w * (0.45 + (0.55 * (i + 1)) / tiers)
        return <path key={i} d={`M${x} ${top.toFixed(0)} L ${(x + ww).toFixed(0)} ${bot.toFixed(0)} L ${(x - ww).toFixed(0)} ${bot.toFixed(0)} Z`} fill={fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      })}
    </g>
  )
}

function Paw({ fill }: { fill: string }) {
  return (
    <g>
      <ellipse cx={0} cy={4} rx={11} ry={9} fill={fill} />
      {[-12, -4, 4, 12].map((x, i) => (
        <circle key={i} cx={x} cy={-10 - (i === 1 || i === 2 ? 4 : 0)} r={4.5} fill={fill} />
      ))}
    </g>
  )
}

/** The direction a print points along the trail ([dy, dx] for atan2, turned so the toes point the way she goes). */
function dirOf(pts: Pt[], i: number): [number, number] {
  const a = pts[Math.max(0, i - 1)]
  const b = pts[Math.min(pts.length - 1, i + 1)]
  return [b[0] - a[0], -(b[1] - a[1])]
}

/** The stars in the sky (a few always out, the rest come out in the light), the same for a run. */
function useStarField(stage: StageDef, seed: number) {
  const [pts] = useState(() => new Map<StageDef, [number, number, number, boolean][]>())
  let out = pts.get(stage)
  if (!out) {
    const r = rng(seed + 7)
    out = Array.from({ length: STARS }, (_, i) => {
      const x = -stage.w * 0.3 + r() * stage.w * 1.6
      const y = -stage.h * 0.3 + r() * (stage.sky - 30 + stage.h * 0.3)
      return [Math.round(x), Math.round(y), 3 + r() * 4, i % 9 === 0] as [number, number, number, boolean]
    }).filter(([x, y]) => dist(x, y, stage.moon[0], stage.moon[1]) > 70)
    pts.set(stage, out)
  }
  return out
}

/** The far row of spruces behind the clearing (night-blue, out past both edges of the stage). */
function useSpruces(stage: StageDef) {
  const out: [number, number, number][] = []
  let i = 0
  for (let x = -stage.w * 0.6; x < stage.w * 1.6; x += 92) {
    const h = 250 + 90 * Math.abs(Math.sin(x * 0.013)) + 50 * Math.sin(x * 0.041)
    out.push([Math.round(x), Math.round(h), i++])
  }
  return out
}

/** Trees of the forest's edge between the far row and the clearing: spruces and red maples (pictures). */
function useEdgeTrees(stage: StageDef) {
  const out: [number, number, 'spruce-hd' | 'mapletree-hd'][] = []
  let i = 0
  for (let x = -stage.w * 0.5; x < stage.w * 1.5; x += 150) {
    if (stage.trees.some(([tx]) => Math.abs(tx - x) < 90)) continue
    const maple = i % 3 === 1
    const h = (maple ? 300 : 360) + 70 * Math.abs(Math.sin(x * 0.021))
    out.push([Math.round(x + 30 * Math.sin(i * 2.3)), Math.round(h), maple ? 'mapletree-hd' : 'spruce-hd'])
    i++
  }
  return out
}

// ---------------------------------------------------------------- the React side

const STARS = 110
const SPARKS = 30
const FLIES = 9

interface Run {
  section: CampSection
  found: CritterId[]
  seed: number
  n: number
  light: Pt | null
  /** The story already said this part's instruction. */
  told: boolean
}

export function CampfireNight({ onDone, setProgress }: CanadaActivityProps) {
  const { start, param, enter } = useSections(CAMPFIRE_SECTIONS)
  const [story, setStory] = useState(!start || start === 'story')
  const first = (start && start !== 'story' ? start : 'eyes') as CampSection
  const [run, setRun] = useState<Run>(() => ({ section: first, found: parseFound(param('found'), first), seed: (Math.random() * 1e9) | 0, n: 0, light: null, told: false }))
  const [pill, setPill] = useState(SAY[run.section])
  const [found, setFound] = useState<CritterId[]>(run.found)
  const [ended, setEnded] = useState(false)
  const lightAt = useRef<((x: number, y: number) => void) | null>(null)
  const box = useRef<HTMLDivElement>(null)
  const world = useRef<CampWorld | null>(null)
  const maple = useRef<PuppetHandle>(null)
  const raccoon = useRef<PuppetHandle>(null)
  const kitA = useRef<PuppetHandle>(null)
  const kitB = useRef<PuppetHandle>(null)
  const done = useRef(false)
  const busy = useRef(false)
  const size = useElementSize(box)
  const wide = !size.height || size.width / size.height >= 1.05
  const stage = wide ? WIDE : TALL
  const mid = `camp${run.n}`

  // The view box: the stage scaled to fit, the extra edge filled with more of the night (sky above, forest at the
  // sides, the clearing below).
  const k = size.width && size.height ? Math.min(size.width / stage.w, size.height / stage.h) : 1
  const vw = size.width ? size.width / k : stage.w
  const vh = size.height ? size.height / k : stage.h
  const vb = { x: (stage.w - vw) / 2, y: (stage.h - vh) / 2, w: vw, h: vh }

  useEffect(() => {
    if (story) {
      enter('story', {})
      setProgress(0, PARTS.length)
      return
    }
    enter(run.section, { found: foundParam(run.found, run.section) })
    setFound(run.found)
    setProgress(PARTS.indexOf(run.section), PARTS.length)
  }, [run, story])

  useLayoutEffect(() => {
    if (!box.current || story) return
    const speak = (line: Line, important = false) => {
      // Reactions don't talk over each other; instructions wait their turn.
      if (!important && busy.current) return
      busy.current = true
      void say(line, { interrupt: false }).finally(() => (busy.current = false))
    }
    const w = new CampWorld(box.current, stage, run.section, run.found, run.seed, run.light, run.told, {
      section: (s, n) => {
        setEnded(false)
        setPill(SAY[s])
        setRun((r) => ({ section: s, found: n, seed: r.seed, n: r.n + 1, light: s === 'stars' ? null : [w.light.x, w.light.y], told: false }))
      },
      found: (ids) => {
        setFound(ids)
        enter(w.section, { found: foundParam(ids, w.section) })
      },
      say: setPill,
      speak,
      play: (who, action) => {
        if (who === 'maple') void maple.current?.play(action)
        else if (who === 'raccoon') void raccoon.current?.play(action)
        else {
          void kitA.current?.play(action)
          setTimeout(() => void kitB.current?.play(action), 120)
        }
      },
      light: (x, y) => lightAt.current?.(x, y),
      end: () => {
        setEnded(true)
        setProgress(PARTS.length, PARTS.length)
        // The stamp, once, after the celebration (🔁 plays it again without another stamp).
        if (!done.current) {
          done.current = true
          setTimeout(() => !w.dead && onDone(), 4200)
        }
      },
    })
    w.setVb(vb, k)
    world.current = w
    ;(window as unknown as { __canadaCampfireQA?: () => unknown }).__canadaCampfireQA = () => w.qa()
    const unwatch = watch('campfire', () => {
      const f = w.finger
      const lag = f && !f.stick ? dist(w.light.x, w.light.y, f.x, f.y - TORCH.lift) : 0
      let near = 9
      let dwell = 0
      for (const c of w.crits.values())
        if (c.on && c.hiding) {
          near = Math.min(near, dist(c.x, c.y, w.light.x, w.light.y) / TORCH.size)
          dwell = Math.max(dwell, c.dwell / Math.max(0.05, FIND.dwell))
        }
      return {
        light: [w.light.speed, 3000],
        lag: [lag, TORCH.size * 2],
        near: [Math.min(near, 3), 3],
        dwell: [Math.min(dwell, 1), 1],
        heat: [w.section === 'marshmallow' ? w.stick.heat : 0, 1],
        toast: [w.section === 'marshmallow' ? w.stick.toast / Math.max(0.1, ROAST.golden + ROAST.burn) : 0, 1],
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
  }, [run, story])

  // Turning the iPad: the other stage, the same section again (where things hide is kept; a trail half followed
  // starts over).
  const shape = useRef(stage)
  useEffect(() => {
    const w = world.current
    if (!w) return
    w.setVb(vb, k)
    if (shape.current !== stage) {
      shape.current = stage
      setRun((r) => ({ ...r, found: w.foundIds(), n: r.n + 1, light: null, told: true }))
    }
  })

  const again = () => {
    setEnded(false)
    setPill(SAY.eyes)
    setRun((r) => ({ section: 'eyes', found: [], seed: (Math.random() * 1e9) | 0, n: r.n + 1, light: null, told: false }))
  }

  const section = run.section
  const big = 6000
  const st = stage
  const [fx, fy] = st.fire
  const [mx, my] = st.maple
  const [tx, ty] = st.tent
  const [tw] = st.tentSize
  const [ox, oy] = st.moose
  const [dx, dy] = st.den
  const starPts = useStarField(stage, run.seed)
  const spruces = useSpruces(stage)
  const edge = useEdgeTrees(stage)
  const [mbx, mby] = mapleBox(st)
  const px = (x: number) => (x - vb.x) * k
  const py = (y: number) => (y - vb.y) * k
  const layer = (z: number) => ({ ...SVG_STYLE, zIndex: z, pointerEvents: 'none' as const })
  const lake = st.lake

  return (
    <div
      ref={box}
      style={{ position: 'absolute', inset: 0, background: '#14102A', overflow: 'clip', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
      aria-label="Shine the flashlight around the campsite"
      onPointerDown={(e) => {
        try {
          e.currentTarget.setPointerCapture(e.pointerId)
        } catch {
          // (A pointer the browser doesn't know, e.g. a test's made-up one: play on without the capture.)
        }
        world.current?.down(e)
      }}
      onPointerMove={(e) => world.current?.move(e)}
      onPointerUp={(e) => world.current?.up(e)}
      onPointerCancel={(e) => world.current?.up(e)}
    >
      <style>{CSS}</style>
      {/* The campsite as it really looks (only the flashlight shows it): the sky, Mont-Sainte-Anne, the forest, the
          clearing, the lake, the tent and the raccoons' log. Drawn once. */}
      <svg key={`b${run.n}`} data-k="back" viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} style={{ ...SVG_STYLE, willChange: 'transform' }} aria-hidden>
        <defs>
          <linearGradient id={`${mid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#25306A" />
            <stop offset="1" stopColor="#5E6AAE" />
          </linearGradient>
        </defs>
        <rect x={-big} y={-big} width={big * 2} height={big + st.treeline} fill={`url(#${mid}-sky)`} />
        {/* Mont-Sainte-Anne behind the trees, in its fall colors. */}
        <Pic name="mountain-hd" x={st.peak[0]} bottom={st.treeline - 20} w={Math.max(st.w * 1.05, 1700)} />
        {spruces.map(([x, h, i]) => (
          <Spruce key={i} x={x} y={st.treeline + 10} h={h} fill={i % 2 ? '#2C4F5C' : '#355C66'} />
        ))}
        {/* The forest's edge: spruces and red maples. */}
        {edge.map(([x, h, name], i) => (
          <Pic key={i} name={name} x={x} bottom={st.treeline + 30} h={h} />
        ))}
        {/* The clearing. */}
        <rect x={-big} y={st.ground - 30} width={big * 2} height={big} fill="#5A8A4E" />
        <path d={`M${-big} ${st.ground - 30} L ${big} ${st.ground - 30}`} stroke={INK} strokeWidth={5} />
        <ellipse cx={fx} cy={fy + 40} rx={st.w * 0.36} ry={140} fill="#A88762" />
        {st.trees.map(([x, y, h], i) => (
          <Pic key={i} name={i % 2 ? 'mapletree-hd' : 'spruce-hd'} x={x} bottom={y + 20} h={h} />
        ))}
        {/* Branches the owl can sit on. */}
        {[...st.spots.owl, st.sounds.owl].map(([x, y], i) => (
          <path key={i} d={`M${x - 80} ${y + 102} Q ${x} ${y + 92} ${x + 80} ${y + 96}`} stroke="#6E4A34" strokeWidth={16} strokeLinecap="round" fill="none" />
        ))}
        {/* The hollow log where the raccoons live. */}
        <Pic name="den-hd" x={dx + 4} bottom={dy + 46} w={250} />
        {/* The lake, with lily pads and cattails. */}
        <path d={`M${-big} ${lake.y} L ${lake.x - 60} ${lake.y} Q ${lake.x + 30} ${lake.y + 10} ${lake.x + 20} ${lake.y + 90} L ${lake.x - 40} ${big} L ${-big} ${big} Z`} fill="#4E86C0" stroke={INK} strokeWidth={5} />
        <path d={`M${-big} ${lake.y + 26} L ${lake.x - 70} ${lake.y + 26}`} stroke="#7FB0E0" strokeWidth={10} strokeLinecap="round" />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${lake.x - 340 + i * 90} ${lake.y + 140 + i * 50} q 30 -10 60 0`} stroke="#A8D0F0" strokeWidth={5} fill="none" strokeLinecap="round" />
        ))}
        {[...st.spots.frog, st.sounds.frog].map(([x, y], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y + 36} rx={54} ry={15} fill="#5EA868" stroke={INK} strokeWidth={4} />
            <path d={`M${x + 20} ${y + 28} L ${x + 50} ${y + 36}`} stroke={INK} strokeWidth={3} />
          </g>
        ))}
        {[-60, -30, 0].map((o, i) => (
          <g key={i} transform={`translate(${lake.x + o - 20} ${lake.y + 6})`}>
            <path d={`M0 0 L ${i * 4 - 4} ${-110 + i * 18}`} stroke="#4E7A3E" strokeWidth={6} strokeLinecap="round" />
            <rect x={i * 4 - 11} y={-130 + i * 18} width={14} height={36} rx={7} fill="#8A5A3A" stroke={INK} strokeWidth={3} />
          </g>
        ))}
        {/* The tent (pink). */}
        <Pic name="tent-hd" x={tx} bottom={ty + 14} w={tw * 2.3} />
        {/* The bandit's paw prints in the dirt. */}
        {section === 'bandit' &&
          st.prints.map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${(Math.atan2(...dirOf(st.prints, i)) * 180) / Math.PI})`}>
              <Paw fill="#6A4A36" />
            </g>
          ))}
        {/* Ferns along the front edge. */}
        {Array.from({ length: 9 }, (_, i) => {
          const x = vb.x + (i + 0.5) * (vb.w / 9) + 30 * Math.sin(i * 3.1)
          return Math.abs(x - fx) < 260 || x < lake.x - 40 ? null : <Pic key={i} name="fern" x={x} bottom={vb.y + vb.h + 20} h={90 + 20 * Math.abs(Math.sin(i * 1.7))} />
        })}
      </svg>
      {/* What moves in the dark (its own layer, so the forest behind isn't redrawn every frame). */}
      <svg key={`d${run.n}`} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} style={SVG_STYLE} aria-hidden>
        {/* The moose at the edge of the camp (his eyes shine over the dark). */}
        <g data-k="moose-head">
          <g transform={`translate(${ox} ${oy})`}>
            <MooseEl />
          </g>
        </g>
        {/* The bat only shows in the light. */}
        <g data-k="bat" visibility="hidden">
          <g data-k="bat-wings">
            <Pic name="bat" x={0} bottom={44} w={170} />
          </g>
        </g>
        <g data-k="bushes">
          {st.bushes.map(([x, y, r], i) => (
            <g key={i}>
              <Pic name="bush" x={x} bottom={y + r * 0.95} w={r * 2.6} flip={i % 2 === 1} />
            </g>
          ))}
        </g>
      </svg>
      {/* The night: one big dark sheet with a hole of light, drawn once and slid under her finger. */}
      <Night hook={lightAt} vb={vb} k={k} w={size.width} h={size.height} />
      {/* The fire's warm glow over the dark (a plain div, flickering on the compositor). */}
      <div
        data-k="glow"
        className="camp-glow"
        style={{ position: 'absolute', zIndex: 21, pointerEvents: 'none', left: px(fx - 340), top: py(fy - 280), width: 680 * k, height: 520 * k, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,180,90,.42), rgba(255,138,76,.14) 55%, rgba(255,138,76,0))' }}
      />
      {/* Over the dark: the moon, the stars that came out, the friends, the fire and whatever it lights, the eyes. */}
      <svg key={`f${run.n}`} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} style={layer(22)} aria-hidden>
        <defs>
          <radialGradient id={`${mid}-halo`}>
            <stop offset="0" stopColor="#FFF2C8" stopOpacity={0.3} />
            <stop offset="1" stopColor="#FFF2C8" stopOpacity={0} />
          </radialGradient>
          <radialGradient id={`${mid}-moon`}>
            <stop offset="0.4" stopColor="#FFF6DA" stopOpacity={0.35} />
            <stop offset="1" stopColor="#FFF6DA" stopOpacity={0} />
          </radialGradient>
        </defs>
        <polygon data-k="beam" points="0,0 0,0 0,0" fill="#FFE7A8" opacity={0} />
        <circle cx={st.moon[0]} cy={st.moon[1]} r={110} fill={`url(#${mid}-moon)`} />
        <circle cx={st.moon[0]} cy={st.moon[1]} r={42} fill="#FFF6DA" stroke={INK} strokeWidth={4} />
        <circle cx={st.moon[0] + 18} cy={st.moon[1] - 8} r={38} fill="#2A2350" />
        {starPts.map(([x, y, r, always], i) => (
          <circle key={i} data-k="star" data-always={always ? '1' : '0'} cx={x} cy={y} r={r} fill="#FFF6DA" opacity={0} />
        ))}
        <path data-k="shoot" d={`M${st.w * 0.15} ${st.sky * 0.25} l 260 90`} stroke="#FFF6DA" strokeWidth={6} strokeLinecap="round" opacity={0} />
        {/* Friends she has met (under the fire, so they can sit round it). */}
        {ROSTER.map((id) => (
          <CritterEl key={id} id={id} halo={`url(#${mid}-halo)`} />
        ))}
        {/* Maple's log by the fire. */}
        <g transform={`translate(${mx} ${my + 104})`}>
          <rect x={-120} y={-26} width={240} height={52} rx={26} fill="#8A5A3A" stroke={INK} strokeWidth={5} />
          <ellipse cx={108} cy={0} rx={16} ry={22} fill="#D9A46E" stroke={INK} strokeWidth={4} />
          <path d="M-90 -6 L 40 -6 M -60 10 L 70 10" stroke="#6E4428" strokeWidth={5} strokeLinecap="round" />
        </g>
        {/* The fire. */}
        <Pic name="firepit" x={fx} bottom={fy + 74} w={300} />
        <g data-k="flames">
          <path d="M-60 0 C -70 -50, -30 -70, -20 -120 C 0 -80, 10 -90, 20 -140 C 40 -90, 70 -60, 60 0 Z" fill="#FF8A4C" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M-36 0 C -40 -40, -12 -50, -6 -86 C 8 -60, 20 -64, 26 -96 C 40 -60, 46 -40, 38 0 Z" fill="#FFC85A" />
          <path d="M-16 0 C -18 -24, 0 -30, 4 -52 C 12 -30, 22 -20, 18 0 Z" fill="#FFF0B0" />
        </g>
        <g fill="#FFC85A">
          {Array.from({ length: SPARKS }, (_, i) => (
            <circle key={i} data-k="spark" r={4 + (i % 3)} opacity={0} />
          ))}
        </g>
        {/* The empty marshmallow bag, tipped over (bandit), or the bag of marshmallows (by the fire). */}
        {section !== 'eyes' && section !== 'sounds' && (
          <g transform={`translate(${st.bag[0]} ${st.bag[1]})`}>
            {section === 'bandit' ? (
              <g transform="translate(0 30) rotate(-78)">
                <Pic name="bag" x={0} bottom={40} h={86} />
                {[-30, 10, 34].map((x, i) => (
                  <circle key={i} cx={46 + i * 6} cy={x} r={4} fill="#FFF7F0" stroke={INK} strokeWidth={2} />
                ))}
              </g>
            ) : (
              <Pic name="bag" x={0} bottom={34} h={96} />
            )}
          </g>
        )}
        {/* The trail's prints glowing once the light has found them. */}
        {section === 'bandit' && (
          <g data-k="trail-glow">
            {st.prints.map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y}) rotate(${(Math.atan2(...dirOf(st.prints, i)) * 180) / Math.PI})`} opacity={0}>
                <circle r={34} fill="#FFE7A8" opacity={0.25} />
                <Paw fill="#FFD27A" />
              </g>
            ))}
          </g>
        )}
        {/* Eyes still hiding. */}
        {ROSTER.map((id) => (
          <EyesEl key={id} id={id} />
        ))}
        {/* The moose's eyes, his squint and his sunglasses. */}
        <g data-k="moose-front">
          <g transform={`translate(${ox} ${oy})`}>
            <MooseFront />
          </g>
        </g>
      </svg>
      {/* Maple on her log with the flashlight in her paw, and the raccoons: live puppets over the night. */}
      <div style={{ position: 'absolute', zIndex: 23, pointerEvents: 'none', left: px(mbx), top: py(mby), width: MAPLE_BOX * k, height: MAPLE_BOX * k }}>
        <Maple ref={maple} height="100%" />
        <svg viewBox="0 0 500 500" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }} aria-hidden>
          <g data-k="flash">
            <rect x={-18} y={-13} width={58} height={26} rx={9} fill="#FF8FB8" stroke={INK} strokeWidth={5} />
            <path d="M38 -16 L 64 -24 L 64 24 L 38 16 Z" fill="#B9A6F5" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            <rect x={62} y={-22} width={10} height={44} rx={4} fill="#FFF2B0" stroke={INK} strokeWidth={4} />
            <circle cx={6} cy={0} r={6} fill="#FFF7F0" stroke={INK} strokeWidth={3} />
            {/* Her paw round it. */}
            <ellipse cx={0} cy={4} rx={20} ry={17} fill={MC.beaverNose} stroke={INK} strokeWidth={4} />
          </g>
        </svg>
      </div>
      <div data-k="pp-raccoon" style={PUPPET}>
        <Raccoon ref={raccoon} height="100%" />
      </div>
      <div data-k="pp-kits" style={PUPPET}>
        <Raccoon ref={kitA} height="100%" baby />
      </div>
      <div data-k="pp-kits" style={PUPPET}>
        <Raccoon ref={kitB} height="100%" baby flip={-1} />
      </div>
      {/* On top of everyone: the marshmallow on its stick, fireflies, ripples, snores and the hint. */}
      <svg key={`t${run.n}`} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} style={layer(25)} aria-hidden>
        {section === 'marshmallow' && (
          <g>
            <path data-k="stick" d="" stroke="#A8784E" strokeWidth={12} strokeLinecap="round" fill="none" />
            <g data-k="mallow">
              <rect data-k="mallow-body" x={-24} y={-20} width={48} height={40} rx={14} fill="#FFFDF8" stroke={INK} strokeWidth={4} />
              <ellipse cx={-8} cy={-8} rx={9} ry={4} fill="#fff" opacity={0.7} />
            </g>
            <g data-k="mallow-fire" opacity={0}>
              <path d="M-22 10 C -26 -10, -6 -16, -2 -40 C 8 -20, 24 -16, 20 10 Z" fill="#FF8A4C" stroke={INK} strokeWidth={3} />
              <path d="M-10 8 C -12 -4, 0 -8, 2 -22 C 8 -10, 14 -6, 10 8 Z" fill="#FFE07A" />
            </g>
          </g>
        )}
        {Array.from({ length: FLIES }, (_, i) => (
          <g key={i} data-k="fly" opacity={0}>
            <circle r={16} fill="#FFF07A" opacity={0.3} />
            <circle r={7} fill="#FFF07A" />
          </g>
        ))}
        <g fill="none" stroke="#FFF2C8" strokeWidth={6}>
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} data-k="ripple" r={30} opacity={0} />
          ))}
        </g>
        <g fill="#FFF6DA" fontWeight={700} fontSize={44}>
          {[0, 1, 2].map((i) => (
            <text key={i} data-k="z" opacity={0}>
              z
            </text>
          ))}
        </g>
        <g data-k="hint" opacity={0} pointerEvents="none">
          <text fontSize={100} textAnchor="middle" dominantBaseline="middle" className="camp-hint">
            👆
          </text>
        </g>
      </svg>
      {/* The night animals met so far (a row of chips; Maple's book has their cards). */}
      <div style={TALLY}>
        {ROSTER.map((id) => (
          <motion.div key={id} animate={{ scale: found.includes(id) ? [1.4, 1] : 1 }} style={{ ...CHIP, opacity: found.includes(id) ? 1 : 0.4 }}>
            {found.includes(id) ? EMOJI[id] : '?'}
          </motion.div>
        ))}
      </div>
      {ended && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.5, type: 'spring' }} style={AGAIN} onPointerDown={(e) => e.stopPropagation()}>
          <BigButton onClick={again} ariaLabel="Again">
            🔁 🔦
          </BigButton>
        </motion.div>
      )}
      {/* At the top, under the tally's row: at the bottom it sat over Maple's log and the marshmallow stick. */}
      <div style={{ position: 'absolute', left: 16, right: 'calc(var(--safe-right, 0px) + 16px)', top: 'calc(var(--top-clear) + 52px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 30 }}>
        <AnimatePresence mode="popLayout">
          <motion.button
            key={pill}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            style={PILL}
            aria-label={`Hear it again: ${lineText(TELL[section])}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => void say(TELL[section])}
          >
            🔊 {pill}
          </motion.button>
        </AnimatePresence>
      </div>
      {story && (
        <StoryBeat
          lines={T.story}
          friend={<Maple height="100%" />}
          onDone={() => {
            setStory(false)
            setRun((r) => ({ ...r, n: r.n + 1, told: true }))
          }}
        />
      )}
    </div>
  )
}

/** The night: a sheet twice the screen with the circle of light in its middle. Its gradient is drawn again only when a
 *  knob changes; every frame only its transform moves (the compositor slides it under her finger). */
function Night({ hook, vb, k, w, h }: { hook: RefObject<((x: number, y: number) => void) | null>; vb: { x: number; y: number }; k: number; w: number; h: number }) {
  const el = useRef<HTMLDivElement>(null)
  const [look, setLook] = useState({ size: TORCH.size, soft: TORCH.soft, dark: TORCH.dark })
  const D = Math.ceil(Math.max(w, h, 400) * 2 + 40)
  useEffect(() => {
    hook.current = (x, y) => {
      if (look.size !== TORCH.size || look.soft !== TORCH.soft || look.dark !== TORCH.dark) setLook({ size: TORCH.size, soft: TORCH.soft, dark: TORCH.dark })
      const d = el.current
      if (!d) return
      put(d, 'style.transform', `translate3d(${((x - vb.x) * k - D / 2).toFixed(1)}px, ${((y - vb.y) * k - D / 2).toFixed(1)}px, 0)`)
    }
    return () => {
      hook.current = null
    }
  }, [hook, look, vb.x, vb.y, k, D])
  const s = Math.min(0.98, Math.max(0.02, look.soft))
  const inner = 1 - s
  const midStop = inner + s * 0.6
  const pc = (v: number) => `${+(v * 100).toFixed(1)}%`
  const R = Math.round(look.size * k)
  const dk = look.dark
  return (
    <div
      ref={el}
      data-k="dark"
      className="camp-night"
      aria-hidden
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: D,
        height: D,
        zIndex: 20,
        pointerEvents: 'none',
        willChange: 'transform',
        background: `radial-gradient(circle ${R}px at 50% 50%, rgba(255, 190, 90, 0.12) 0%, rgba(255, 170, 70, 0.06) ${pc(inner)}, rgba(40, 20, 50, ${dk * 0.6}) ${pc(midStop)}, rgba(20, 10, 34, ${dk}) 100%)`,
      }}
    />
  )
}

const SVG_STYLE = { position: 'absolute' as const, inset: 0, width: '100%', height: '100%', display: 'block' }
const PUPPET = { position: 'absolute' as const, left: 0, top: 0, zIndex: 24, pointerEvents: 'none' as const, visibility: 'hidden' as const, willChange: 'transform' }

const CSS = `
.camp-glow { animation: camp-glow 0.9s ease-in-out infinite alternate; transition: transform .2s; }
@keyframes camp-glow { from { opacity: .85 } to { opacity: 1 } }
.camp-night { animation: camp-flicker 1.6s ease-in-out infinite; }
@keyframes camp-flicker { 0%, 100% { opacity: 1 } 25% { opacity: .95 } 60% { opacity: .97 } }
.camp-hint { animation: camp-hint 1s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes camp-hint { 0%,100% { transform: scale(1) } 50% { transform: scale(1.15) } }
.camp-shoot { animation: camp-shoot 1.4s ease-out 2 both; }
@keyframes camp-shoot { 0% { opacity: 0; transform: translate(-200px, -60px) } 30% { opacity: 1 } 100% { opacity: 0; transform: translate(500px, 160px) } }
`

/** The 🔁 button waits in the corner under the row of animals, clear of the fire. */
const AGAIN = { position: 'absolute' as const, zIndex: 31, right: 'calc(var(--safe-right, 0px) + 16px)', top: 'calc(var(--top-clear) + 120px)', pointerEvents: 'auto' as const }

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
  border: 'none',
  fontFamily: 'inherit',
  borderRadius: 999,
  padding: '10px 22px',
  minHeight: 64,
  fontSize: 'clamp(16px, 2.4vmin, 22px)',
  fontWeight: 600,
  boxShadow: 'var(--shadow)',
  textAlign: 'center' as const,
  maxWidth: '100%',
  pointerEvents: 'auto' as const,
}

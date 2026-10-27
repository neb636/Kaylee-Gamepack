// Campfire Night (greybox 4, plan: planning/around-the-world/canada.html): a dark campsite at the foot of Mont-Sainte-
// Anne. One verb, shine the flashlight: the kit's Torchlight follows her finger over the night forest, and it gets
// richer three times:
//   eyes         pairs of eyes shine in the dark (an owl, a raccoon, a deer, a frog); rest the light on them (or tap
//                them) and the animal comes out to say hi.
//   sounds       a hoot, a tail slap on the lake, a croak, a mosquito's whine, each from one side (panned left or right,
//                with faint ripples there); she sweeps the light that way to find who made it.
//   bandit       the marshmallow bag by the fire is empty! Paw prints light up one by one as the light finds them, round
//                the tent and along the trees (a bush rustles ahead, a skunk pops out of one) to the hollow log, where
//                the raccoon is sharing the marshmallows with her babies.
//   marshmallow  the side verb: she holds a marshmallow on a stick near the flames. It puffs and goes golden, then
//                brown, then catches fire (tap it to blow it out: a black crunchy one, the raccoon's favorite). She gives
//                each one to Maple or the raccoons.
//   stars        everyone she met sits round the fire; she shines the light at the sky and the stars come out.
// Always there: fireflies, a bat that only shows in the light, the moose at the edge of the camp (shine it in his face
// and he squints and puts on sunglasses), the snoring tent, the fire's sparks, Maple holding the flashlight.
// The light's size and softness, how it follows her finger and how finding works are knobs (?feel=1). 2D only: SVG
// written every frame under and over the kit's Torchlight, no three.js. Placeholder shapes, no voices yet (the
// full-loop gate): a short line at the bottom says what's on screen, for Dad.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { BigButton, bigCelebration, burst, sounds, useElementSize } from '../../../../../sdk'
import { knobs, watch } from '../../../../kit/knobs'
import { useSections } from '../../../../kit/sections'
import { sfx } from '../../../../kit/sfx'
import { Torchlight } from '../../../../kit/Torchlight'
import { night } from './night'
import CAMPFIRE_SECTIONS, { type CampSection } from './sections'
import { EMOJI, EYES, LOOKS, NAMES, ROSTER, SOUNDS, TALL, WIDE, rng, type CritterId, type Look, type Pt, type StageDef } from './stage'

const FILE = 'src/world/places/canada/activities/campfire/CampfireNight.tsx'
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

const SAY: Record<CampSection, string> = {
  eyes: '🔦 Shine the light: who’s watching?',
  sounds: '👂 Who’s that sound?',
  bandit: '🍡 The marshmallows are gone! Follow the paw prints',
  marshmallow: '🔥 Hold the marshmallow near the fire',
  stars: '🌌 Shine the light at the sky',
}
/** How many night animals each section starts with (`?found=` overrides). */
const START_FOUND: Record<CampSection, number> = { eyes: 0, sounds: 4, bandit: 6, marshmallow: 8, stars: 8 }
const EATEN_TO_STARS = 4
const INK = '#4A3B57'
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
const bell = (p: number) => (p <= 0 || p >= 1 ? 0 : Math.sin(p * Math.PI))
const ease = (p: number) => (p < 0 ? 0 : p > 1 ? 1 : p * p * (3 - 2 * p))
const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by)

// ---------------------------------------------------------------- the runtime (plain objects, written every frame)

type AnimKind = 'out' | 'hop' | 'wiggle' | 'slap' | 'croak' | 'phew' | 'cheer' | 'munch' | 'shake'
interface Crit {
  id: CritterId
  x: number
  y: number
  /** Where it walks to when it comes out (from behind a bush, onto the lake shore). */
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
  backStill: boolean
  els: { back: SVGGElement | null; backBody: SVGGElement | null; front: SVGGElement | null; frontBody: SVGGElement | null; eyes: SVGGElement | null; eyesIn: SVGGElement | null; tail: SVGGElement[] }
}
interface Star {
  x: number
  y: number
  r: number
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
  el: SVGCircleElement
  x: number
  y: number
  hx: number
  hy: number
  ph: number
  zip: number
}

interface Events {
  section: (s: CampSection, found: number) => void
  found: (ids: CritterId[]) => void
  say: (text: string) => void
  beam: (x: number, y: number) => void
  end: () => void
}

/** Writes an SVG attribute only when it changes (most of the scene is still most frames). */
const written = new WeakMap<Element, Record<string, string>>()
function put(el: Element | null | undefined, name: string, value: string) {
  if (!el) return
  let w = written.get(el)
  if (!w) written.set(el, (w = {}))
  if (w[name] === value) return
  w[name] = value
  el.setAttribute(name, value)
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
  vb = { x: 0, y: 0, w: 1600, h: 1000 }
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
  /** The moose: how long the light has been on his face, and whether his sunglasses are on. */
  moose = { lit: 0, dark: 0, shades: 0, squint: 0, anim: -9 }
  bat = { on: false, x: 0, y: 0, dir: 1, next: 9, loop: -9 }
  stick = { x: 0, y: 0, rx: 0, ry: 0, held: false, toast: 0, fire: false, fireT: 0, charred: false, eaten: 0, back: 0, pop: -9, heat: 0, eat: null as null | { to: 'maple' | 'family'; t0: number } }
  maple = { anim: -9, kind: 'hop' as 'hop' | 'cheer' | 'munch' | 'nose' }
  fireTap = -9
  glow: HTMLElement | null = null
  tentT = -9
  starsDone = false
  /** Set when the scene goes away (a new section, or React trying the effect twice): its timers do nothing then. */
  dead = false
  private later(f: () => void, ms: number) {
    setTimeout(() => !this.dead && f(), ms)
  }

  constructor(
    private back: SVGSVGElement,
    live: SVGSVGElement,
    front: SVGSVGElement,
    stage: StageDef,
    section: CampSection,
    found: number,
    seed: number,
    light: Pt | null,
    private ev: Events,
  ) {
    this.stage = stage
    this.section = section
    const q = <T extends Element>(k: string) => (front.querySelector(`[data-k="${k}"]`) ?? live.querySelector(`[data-k="${k}"]`)) as T
    const qa = <T extends Element>(k: string) => [...front.querySelectorAll(`[data-k="${k}"]`), ...live.querySelectorAll(`[data-k="${k}"]`)] as T[]
    this.glow = (front.parentElement?.querySelector('[data-k="glow"]') as HTMLElement) ?? null
    for (const k of ['flames', 'glow', 'sparks', 'beam', 'hint', 'shades', 'squint', 'moose-eyes', 'moose-head', 'bat', 'bat-wings', 'zs', 'stick', 'mallow', 'mallow-fire', 'shoot', 'maple', 'maple-body', 'trail-glow', 'bushes', 'moose-front'])
      this.els[k] = q(k)
    const r = rng(seed)
    const pick = (spots: Pt[]) => spots[Math.floor(r() * spots.length) % spots.length]
    const spot: Record<string, Pt> = { owl: pick(stage.spots.owl), raccoon: pick(stage.spots.raccoon), deer: pick(stage.spots.deer), frog: pick(stage.spots.frog) }
    const known = new Set(ROSTER.slice(0, clamp(found, 0, ROSTER.length)))
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
        backStill: false,
        els: { back: q(`c-${id}`), backBody: q(`c-${id}-body`), front: q(`cf-${id}`), frontBody: q(`cf-${id}-body`), eyes: q(`e-${id}`), eyesIn: q(`e-${id}-in`), tail: qa(`c-${id}-tail`) },
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
      c.frontA = c.found && !c.hiding ? 1 : 0
    }
    if (section === 'eyes') {
      for (const id of EYES) set(id, spot[id], { hiding: !this.crits.get(id)!.found, eyes: !this.crits.get(id)!.found })
      if (EYES.every((id) => this.crits.get(id)!.found)) this.later(() => this.ev.section('sounds', this.count()), 1500)
    } else if (section === 'sounds') {
      set('raccoon', spot.raccoon)
      set('deer', spot.deer)
      this.startSound()
    } else if (section === 'bandit') {
      set('owl', stage.sounds.owl)
      set('deer', spot.deer)
      set('frog', stage.sounds.frog)
      set('beaver', stage.sounds.beaver)
      const b = stage.bushes[stage.skunkBush]
      set('skunk', [b[0], b[1] + 10], { hiding: !this.crits.get('skunk')!.found })
      // The raccoon and her babies are in the hollow log at the end of the trail.
      const [dx, dy] = stage.den
      set('raccoon', [dx + 70, dy - 12], { hiding: true })
      set('kits', [dx - 4, dy + 2], { hiding: true })
      // Not even a whisker shows until the trail gets there.
      this.crits.get('raccoon')!.on = false
      this.crits.get('kits')!.on = false
    } else {
      // By the fire: the raccoon family (marshmallow), or everyone she met round the fire (stars).
      if (section === 'marshmallow') {
        set('owl', stage.sounds.owl)
        set('deer', spot.deer)
        set('frog', stage.sounds.frog)
        set('beaver', stage.sounds.beaver)
        const b = stage.bushes[stage.skunkBush]
        set('skunk', [b[0], b[1] + 10])
        const [fx, fy] = stage.family
        set('raccoon', [fx, fy])
        set('kits', [fx + 110, fy + 20])
        for (const id of ['raccoon', 'kits'] as CritterId[]) this.crits.get(id)!.found = true
        for (const c of this.crits.values()) c.frontA = c.found ? 1 : 0
      } else {
        let i = 0
        for (const id of ROSTER) {
          const c = this.crits.get(id)!
          if (!c.found || id === 'mosquito') continue
          set(id, stage.seats[i++ % stage.seats.length])
        }
      }
    }
    this.stick.x = this.stick.rx = stage.stick[0]
    this.stick.y = this.stick.ry = stage.stick[1]
    // The light starts where she left it, or on the forest just above the fire.
    // (The bandit starts on the empty marshmallow bag, where the trail begins.)
    const [lx, ly] = section === 'bandit' ? [stage.bag[0], stage.bag[1] - 30] : (light ?? [stage.fire[0], section === 'stars' ? stage.sky - 60 : stage.treeline - 60])
    this.light.x = this.light.tx = lx
    this.light.y = this.light.ty = ly
    for (const el of qa<SVGCircleElement>('star')) {
      const s: Star = { x: +el.getAttribute('cx')!, y: +el.getAttribute('cy')!, r: +el.getAttribute('r')!, on: 0, lit: el.dataset.always === '1', ph: r() * 6, el }
      if (s.lit) s.on = 0.6
      this.stars.push(s)
    }
    for (const el of qa<SVGCircleElement>('spark')) this.sparks.push({ el, x: 0, y: 0, vx: 0, vy: 0, t: 9, life: 1 })
    for (const el of qa<SVGCircleElement>('fly')) {
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
  count() {
    return this.foundIds().length
  }

  /** Where an animal stands once it has come out (in front of its bush, on the shore). */
  private outAt(id: CritterId, p: Pt, out: boolean): Pt {
    if (!out) return p
    if (id === 'raccoon' || id === 'skunk') {
      // Out beside its bush, on the side away from the fire (so it doesn't stand on Maple or the flames).
      const b = this.stage.bushes.find((o) => Math.abs(o[0] - p[0]) < 4)
      if (b) return [b[0] + (b[0] < this.stage.fire[0] ? -1 : 1) * (b[2] + 34), b[1] + 12]
    }
    if (id === 'deer') return [p[0], p[1] + 30]
    return p
  }

  setVb(vb: { x: number; y: number; w: number; h: number }) {
    this.vb = vb
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
      const [ex, ey] = this.eyePoint(c)
      if (dist(ex, ey, x, y) < Math.max(70, LOOKS[c.id].r * 1.4)) {
        this.light.tx = ex
        this.light.ty = ey
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

  private poke(x: number, y: number) {
    const st = this.stage
    const pan = this.pan(x)
    // A friend she has met: a hop and a hello.
    for (const c of this.crits.values()) {
      if (!c.on || c.hiding) continue
      const L = LOOKS[c.id]
      if (dist(c.x, c.y + L.r * 0.4, x, y) < Math.max(70, L.r * 1.5)) {
        this.act(c, c.id === 'beaver' ? 'slap' : c.id === 'frog' ? 'croak' : c.id === 'skunk' ? 'phew' : 'hop')
        this.voice(c.id, pan)
        return
      }
    }
    // Maple: a hop and a tail slap.
    const [mx, my] = st.maple
    if (dist(mx, my + 20, x, y) < 100) {
      this.mapleDo('hop')
      night.slap(pan, 0.2)
      return
    }
    // The moose: a groan and a shake of the antlers.
    const [ox, oy] = st.moose
    if (dist(ox, oy, x, y) < 120) {
      this.moose.anim = this.now
      night.groan(pan)
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
    if (y < ty && y > ty - th && Math.abs(x - tx) < tw * ((y - (ty - th)) / th) + 20) {
      this.tentT = this.now
      night.zip(pan)
      this.later(() => night.snore(pan), 500)
      return
    }
    // The bat, if it's in the light.
    if (this.bat.on && dist(this.bat.x, this.bat.y, x, y) < 110) {
      this.bat.loop = this.now
      night.squeak(pan)
      return
    }
    // A firefly: it flares and zips off.
    for (const f of this.flies) {
      if (dist(f.x, f.y, x, y) < 70) {
        f.zip = this.now
        sounds.note(8 + Math.floor(Math.random() * 3))
        return
      }
    }
    // A bush: it rustles.
    for (const [bx, by, br] of st.bushes) {
      if (dist(bx, by, x, y) < br + 20) {
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
  }

  private voice(id: CritterId, pan: number) {
    if (id === 'owl') night.hoot(pan, 0.14)
    else if (id === 'beaver') night.slap(pan)
    else if (id === 'frog') night.croak(pan)
    else if (id === 'mosquito') night.whine(pan, 0.05, 0.6)
    else if (id === 'skunk') night.phew(pan)
    else if (id === 'deer') sfx.fwip()
    else sounds.pop()
  }

  private pan(x: number) {
    const v = this.vb
    return clamp((x - (v.x + v.w / 2)) / (v.w * 0.35), -1, 1) * FIND.side
  }

  private act(c: Crit, kind: AnimKind) {
    const dur = kind === 'out' ? 1.1 : kind === 'wiggle' || kind === 'cheer' ? 0.8 : kind === 'munch' ? 1.2 : kind === 'phew' ? 1.4 : 0.6
    c.anim = { kind, t0: this.now, dur }
  }

  private mapleDo(kind: 'hop' | 'cheer' | 'munch' | 'nose') {
    this.maple.anim = this.now
    this.maple.kind = kind
  }

  // -------------------------------------------------------------- finding

  private eyePoint(c: Crit): Pt {
    const L = LOOKS[c.id]
    return [c.x, c.y + L.eyeY * L.r]
  }

  /** The light rests on an animal hiding in the dark: it comes out and says hi. */
  private reveal(c: Crit) {
    if (!c.hiding) return
    c.hiding = false
    c.eyes = false
    c.dwell = 0
    this.lastFind = this.now
    const was = c.found
    c.found = true
    const [ox, oy] = this.outAt(c.id, c.from, true)
    c.from = [c.x, c.y]
    c.x = ox
    c.y = oy
    this.act(c, c.id === 'beaver' ? 'slap' : c.id === 'frog' ? 'croak' : c.id === 'skunk' ? 'phew' : 'out')
    this.voice(c.id, this.pan(c.x))
    sounds.sparkle()
    this.mapleDo(c.id === 'skunk' ? 'nose' : 'cheer')
    if (!was) this.ev.found(this.foundIds())
    this.say(`${EMOJI[c.id]} ${NAMES[c.id]}!`)
    if (c.id === 'mosquito') this.later(() => (c.on = false), 3200)
    if (this.section === 'eyes' && EYES.every((id) => !this.crits.get(id)!.hiding)) {
      this.later(() => {
        burst()
        this.say('✨ Everybody’s out!')
      }, 1200)
      this.later(() => this.ev.section('sounds', this.count()), 3000)
    }
  }

  private tickFinding(dt: number) {
    const R = TORCH.size
    const reach = R * FIND.reach
    const lx = this.light.x
    const ly = this.light.y
    for (const c of this.crits.values()) {
      if (!c.on || !c.hiding) continue
      // The skunk is found by lighting its bush; the den's raccoons only at the end of the trail.
      if (this.section === 'bandit' && (c.id === 'raccoon' || c.id === 'kits')) continue
      const [ex, ey] = c.id === 'skunk' ? [c.from[0], c.from[1] - 40] : this.eyePoint(c)
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
      }, 600)
      this.later(() => this.ev.section('bandit', this.count()), 2600)
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
      if (!s.wait) s.wait = this.now + 1.8
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
      else if (id === 'frog') night.croak(pan)
      else night.whine(pan)
      this.ripple(c.x, c.y)
      const side = c.x < this.light.x - TORCH.size * 0.5 ? '⬅️' : c.x > this.light.x + TORCH.size * 0.5 ? '➡️' : '👀'
      this.say(`👂 Who’s that? ${side}`)
    }
    // The mosquito wobbles round in the dark.
    if (id === 'mosquito') {
      const [mx, my] = this.stage.sounds.mosquito
      c.x = mx + Math.sin(this.now * 1.7) * 60
      c.y = my + Math.sin(this.now * 2.9) * 30
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
    // Light the log, then out they come with the marshmallows.
    this.light.tx = this.stage.den[0] + 30
    this.light.ty = this.stage.den[1] - 20
    this.later(() => {
      raccoon.on = kits.on = true
      raccoon.hiding = false
      raccoon.frontA = 0
      this.act(raccoon, 'out')
      kits.hiding = false
      const was = kits.found
      kits.found = true
      this.act(kits, 'out')
      sounds.sparkle()
      night.munch(this.pan(kits.x))
      this.mapleDo('cheer')
      this.say('🦝 The bandit! She’s sharing with her babies')
      if (!was) this.ev.found(this.foundIds())
      burst()
    }, 700)
    this.later(() => this.ev.section('marshmallow', this.count()), 4200)
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
        s.x += (tx + 40 - s.x) * Math.min(1, dt * 10)
        s.y += (ty - 10 - s.y) * Math.min(1, dt * 10)
      } else {
        // A new marshmallow on the stick, back on its rest.
        s.eat = null
        s.toast = 0
        s.fire = false
        s.charred = false
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
      if (s.toast >= ROAST.golden + ROAST.burn) {
        s.fire = true
        s.fireT = this.now
        night.whoosh(0.1)
        this.say('🔥 It’s on fire! Tap it to blow it out')
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
    const toMaple = dist(s.x, s.y, mx, my) < 150
    const toFamily = dist(s.x, s.y, fx + 50, fy) < 190
    if (!toMaple && !toFamily) return
    if (s.fire) this.blowOut()
    s.eat = { to: toMaple ? 'maple' : 'family', t0: this.now }
    const g = ROAST.golden
    const golden = s.toast >= g * 0.75 && !s.charred
    if (toMaple) {
      this.mapleDo('munch')
      night.munch(this.pan(mx))
      if (s.charred) this.later(() => this.say('😅 Too crunchy for Maple!'), 300)
      else this.say(golden ? '😋 Golden! Maple loves it' : s.toast < g * 0.3 ? '☁️ Squishy and white: yum anyway' : '😋 Yum!')
    } else {
      const r = this.crits.get('raccoon')!
      const k = this.crits.get('kits')!
      this.act(r, s.charred ? 'cheer' : 'munch')
      this.act(k, 'hop')
      night.munch(this.pan(fx))
      this.say(s.charred ? '🦝 The raccoons LOVE the burnt ones!' : '🦝 Crunch munch!')
    }
    s.eaten++
    if (s.eaten === EATEN_TO_STARS) this.later(() => this.ev.section('stars', this.count()), 2600)
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
    this.ev.beam(l.x, l.y)
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
    this.drawMaple()
    this.drawBeam()
    this.tickHint()
    this.updateSay()
  }

  private drawCritters() {
    const help = clamp((this.now - this.lastFind - FIND.help) / 6, 0, 1)
    for (const c of this.crits.values()) {
      const { back, backBody, front, frontBody, eyes, eyesIn } = c.els
      const vis = c.on ? 'visible' : 'hidden'
      put(back, 'visibility', vis)
      put(front, 'visibility', vis)
      put(eyes, 'visibility', c.on && c.eyes ? 'visible' : 'hidden')
      if (!c.on) continue
      const L = LOOKS[c.id]
      const r = L.r
      // The animation: hops, wiggles, a tail slap; coming out walks it from where it hid to where it stands.
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
          rot = 8 * Math.sin(p * 18) * bell(clamp((p - 0.55) * 2.2, 0, 1))
        } else if (a.kind === 'hop' || a.kind === 'cheer') {
          const n = a.kind === 'cheer' ? 2 : 1
          const q = (p * n) % 1
          dy = -36 * bell(q)
          sy = 1 + 0.12 * bell(q) - 0.14 * bell(clamp(q * 5, 0, 1))
          sx = 2 - sy
        } else if (a.kind === 'wiggle' || a.kind === 'munch') {
          rot = 9 * Math.sin(p * Math.PI * 6) * bell(p)
          sy = 1 + 0.06 * Math.sin(p * Math.PI * 8)
        } else if (a.kind === 'croak') {
          sx = 1 + 0.25 * bell(clamp(p * 2, 0, 1))
          sy = 1 - 0.1 * bell(clamp(p * 2, 0, 1))
        } else if (a.kind === 'slap') {
          dy = -24 * bell(clamp(p * 2, 0, 1))
          rot = -14 * bell(p)
          if (p > 0.45 && p - (1 / 60 / a.dur) * 2 < 0.45) this.ripple(x, y + r)
        } else if (a.kind === 'phew') {
          dy = -50 * bell(clamp(p * 2.2, 0, 1))
          for (const t of c.els.tail) put(t, 'transform', `rotate(${(-40 * bell(clamp(p * 1.4, 0, 1))).toFixed(1)} ${r * 0.6} ${r * 1.4})`)
        } else if (a.kind === 'shake') rot = 12 * Math.sin(p * 30) * bell(p)
      }
      // Hidden ones peek a little and breathe; found ones breathe.
      sy *= 1 + 0.025 * Math.sin(this.now * 2.4 + c.blinkAt)
      const foot = ((L.body ? L.body[1] + L.body[3] : 0.9) * r) | 0
      const tr = `translate(${x.toFixed(1)} ${y.toFixed(1)})`
      const body = `translate(${dx.toFixed(1)} ${(dy + foot).toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) translate(0 ${-foot})`
      // The copy in the dark only needs redrawing while it's hiding there or moving; a friend shows over the dark.
      const still = !c.hiding && !a && c.frontA > 0.9
      if (!still || !c.backStill) {
        put(back, 'transform', tr)
        put(backBody, 'transform', body)
      }
      c.backStill = still
      if (c.frontA > 0.01 || c.anim) {
        put(front, 'transform', tr)
        put(frontBody, 'transform', body)
      }
      // Over the dark: friends glow softly once met.
      const want = c.found && !c.hiding ? 0.92 : 0
      const fa = c.frontA
      c.frontA += (want - c.frontA) * 0.08
      if (Math.abs(fa - c.frontA) > 0.002 || !c.backStill) put(front, 'opacity', c.frontA.toFixed(2))
      // The eyes shining in the dark: they blink now and then, and grow brighter while she hasn't found any for a
      // while (help).
      if (c.eyes && eyes) {
        if (this.now > c.blinkAt + 0.16) c.blinkAt = this.now + 1.5 + Math.random() * 3.5
        const blink = this.now > c.blinkAt ? 0.1 : 1
        const s = FIND.shine * (1 + 0.6 * help) * (1 + 0.15 * Math.min(1, c.dwell / Math.max(0.05, FIND.dwell)))
        const ey = L.eyeY * r
        put(eyes, 'transform', `${tr} translate(0 ${ey.toFixed(1)}) scale(${s.toFixed(3)}) translate(0 ${(-ey).toFixed(1)})`)
        put(eyes, 'opacity', (0.75 + 0.25 * help).toFixed(2))
        put(eyesIn, 'transform', `translate(0 ${ey.toFixed(1)}) scale(1 ${blink}) translate(0 ${(-ey).toFixed(1)})`)
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
    // Shine it in his face: he squints, then on go the sunglasses.
    const squint = m.lit > 0.4 ? 1 : 0
    const shades = m.lit > 1.1 ? 1 : 0
    if (shades && m.shades < 0.5 && m.squint > 0.5) {
      sounds.whoosh()
      if (this.lastSay.indexOf('😎') < 0) this.say('😎 Too bright for the moose!')
    }
    m.squint += (squint - m.squint) * Math.min(1, dt * 10)
    m.shades += (shades - m.shades) * Math.min(1, dt * 6)
    put(this.els.squint, 'opacity', m.squint > 0.5 && m.shades < 0.5 ? '1' : '0')
    put(this.els['moose-eyes'], 'opacity', m.squint > 0.5 ? '0' : '1')
    put(this.els.shades, 'transform', `translate(0 ${(-90 * (1 - m.shades)).toFixed(1)})`)
    put(this.els.shades, 'opacity', m.shades.toFixed(2))
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
      put(this.els['bat-wings'], 'transform', `scale(1 ${(0.4 + 0.6 * Math.abs(Math.sin(this.now * 16))).toFixed(2)})`)
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
    put(this.els.flames, 'transform', `translate(${fx} ${fy - 10}) scale(${(1 + 0.04 * Math.sin(this.now * 9)).toFixed(3)} ${f.toFixed(3)})`)
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
      put(f.el, 'cx', f.x.toFixed(0))
      put(f.el, 'cy', f.y.toFixed(0))
      put(f.el, 'opacity', Math.min(1, on + zip).toFixed(2))
      put(f.el, 'r', (7 + 6 * zip).toFixed(1))
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
      const [bx, by] = this.stage.bushes[this.trail.bush] ?? [0, 0]
      if (b && p >= 0 && p < 1.2) put(b, 'transform', `rotate(${(p < 1 ? 6 * Math.sin(p * 40) * bell(p) : 0).toFixed(1)} ${bx} ${by + 40})`)
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
    put(m, 'transform', `translate(${s.x.toFixed(0)} ${s.y.toFixed(0)}) rotate(-25) scale(${(puff * pop).toFixed(3)})`)
    put(m, 'visibility', s.eat && this.now - s.eat.t0 > 0.35 ? 'hidden' : 'visible')
    m.querySelector('rect')?.setAttribute('fill', col)
    const fire = this.els['mallow-fire']
    if (fire) {
      put(fire, 'opacity', s.fire ? '1' : '0')
      put(fire, 'transform', `translate(${s.x.toFixed(0)} ${(s.y - 26).toFixed(0)}) scale(${(1 + 0.15 * Math.sin(this.now * 18)).toFixed(2)} ${(1 + 0.2 * Math.sin(this.now * 23)).toFixed(2)})`)
    }
  }

  private drawMaple() {
    const el = this.els['maple-body']
    if (!el) return
    const p = (this.now - this.maple.anim) / 0.8
    const k = this.maple.kind
    let dy = 0
    let rot = 0
    let sx = 1
    let sy = 1 + 0.02 * Math.sin(this.now * 2)
    if (p >= 0 && p < 1) {
      if (k === 'hop' || k === 'cheer') {
        const q = k === 'cheer' ? (p * 2) % 1 : p
        dy = -34 * bell(q)
        sy += 0.1 * bell(q)
        sx = 2 - sy
      } else if (k === 'munch') rot = 8 * Math.sin(p * Math.PI * 6)
      else if (k === 'nose') {
        rot = -10 * bell(p)
        sx = 0.94
      }
    }
    put(el, 'transform', `translate(0 ${(dy + 110).toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) translate(0 -110)`)
  }

  private drawBeam() {
    const el = this.els.beam
    if (!el) return
    const [mx, my] = this.stage.maple
    const hx = mx + 62
    const hy = my - 6
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
    const T = Math.sqrt(D * D - R * R)
    const p1 = [hx + Math.cos(base - a) * T, hy + Math.sin(base - a) * T]
    const p2 = [hx + Math.cos(base + a) * T, hy + Math.sin(base + a) * T]
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
    const idle = !this.finger && this.now - this.lastTouch > 8 && !this.ended
    let at: Pt | null = null
    if (idle) {
      const st = this.stage
      if (this.section === 'eyes') {
        const c = [...this.crits.values()].filter((o) => o.on && o.hiding).sort((a, b) => dist(a.x, a.y, this.light.x, this.light.y) - dist(b.x, b.y, this.light.x, this.light.y))[0]
        if (c) at = this.eyePoint(c)
      } else if (this.section === 'sounds' && !this.snd.done) {
        const c = this.crits.get(SOUNDS[this.snd.i])!
        if (c.hiding) at = [c.x, c.y]
      } else if (this.section === 'bandit' && this.trail.next < st.prints.length) at = st.prints[this.trail.next]
      else if (this.section === 'marshmallow') {
        const s = this.stick
        if (s.charred || s.toast >= ROAST.golden * 0.75) {
          const k = (this.now * 0.6) % 1
          at = [s.x + (st.maple[0] - s.x) * ease(k), s.y + (st.maple[1] - s.y) * ease(k)]
        } else {
          const k = (this.now * 0.6) % 1
          at = [s.x + (st.fire[0] - s.x) * ease(k), s.y + (st.fire[1] - 80 - s.y) * ease(k)]
        }
      } else if (this.section === 'stars') at = [this.light.x + 200 * Math.sin(this.now * 0.5), st.sky - 160]
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

// ---------------------------------------------------------------- the placeholder shapes

/** An animal facing her, head at (0, 0), body below; `layer` b is in the dark scene, f is the friend over the dark. */
function CritterEl({ id, layer, halo }: { id: CritterId; layer: 'b' | 'f'; halo?: string }) {
  const pre = layer === 'b' ? 'c' : 'cf'
  const L = LOOKS[id]
  const twins = id === 'kits' ? [-36, 36] : [0]
  return (
    <g data-k={`${pre}-${id}`} visibility="hidden">
      {halo && <ellipse cx={0} cy={L.r * 0.6} rx={L.r * (id === 'kits' ? 3 : 1.9)} ry={L.r * 1.9} fill={halo} />}
      <g data-k={`${pre}-${id}-body`}>
        {twins.map((dx) => (
          <g key={dx} transform={`translate(${dx} ${id === 'kits' ? (dx < 0 ? 6 : 0) : 0})`}>
            <Shape look={L} id={id} tailKey={`c-${id}-tail`} />
          </g>
        ))}
      </g>
    </g>
  )
}

function Shape({ look: L, id, tailKey }: { look: Look; id: string; tailKey?: string }) {
  const r = L.r
  const eyeX = L.eyes * r
  const eyeY = L.eyeY * r
  if (L.wings)
    return (
      <g>
        <ellipse cx={-14} cy={-12} rx={16} ry={8} fill="#E8EEF7" opacity={0.8} stroke={INK} strokeWidth={2} transform="rotate(-30 -14 -12)" />
        <ellipse cx={14} cy={-12} rx={16} ry={8} fill="#E8EEF7" opacity={0.8} stroke={INK} strokeWidth={2} transform="rotate(30 14 -12)" />
        <ellipse rx={r * 0.7} ry={r * 1.1} cy={r * 0.6} fill={L.fill} stroke={INK} strokeWidth={3} />
        <circle r={r * 0.6} fill={L.fill} stroke={INK} strokeWidth={3} />
        <path d={`M0 ${r * 0.3} L 0 ${r * 1.4}`} stroke={INK} strokeWidth={2} />
        {[-1, 1].map((s) => (
          <circle key={s} cx={s * r * 0.25} cy={-r * 0.1} r={r * 0.18} fill="#2B2236" />
        ))}
      </g>
    )
  return (
    <g>
      {id === 'skunk' && (
        <g data-k={tailKey}>
          <ellipse cx={r * 1.0} cy={r * 0.6} rx={r * 0.6} ry={r * 1.3} fill={L.fill} stroke={INK} strokeWidth={5} transform={`rotate(25 ${r} ${r * 0.6})`} />
          <ellipse cx={r * 1.0} cy={r * 0.6} rx={r * 0.18} ry={r * 1.1} fill="#F4F2F8" transform={`rotate(25 ${r} ${r * 0.6})`} />
        </g>
      )}
      {(id === 'raccoon' || id === 'kits') && <ellipse cx={r * 0.95} cy={r * 1.35} rx={r * 0.7} ry={r * 0.22} fill="#8E8A96" stroke={INK} strokeWidth={4} transform={`rotate(-20 ${r * 0.95} ${r * 1.35})`} />}
      {id === 'beaver' && <ellipse cx={r * 0.9} cy={r * 1.6} rx={r * 0.6} ry={r * 0.25} fill="#5A3A26" stroke={INK} strokeWidth={4} />}
      {L.antlers &&
        [-1.15, -0.55, 0.95, 1.5].map((x, i) => <rect key={i} x={(L.body![0] + x) * r - r * 0.13} y={L.body![1] * r} width={r * 0.26} height={r * 1.75} rx={r * 0.1} fill={L.fill} stroke={INK} strokeWidth={5} />)}
      {L.body && <ellipse cx={L.body[0] * r} cy={L.body[1] * r} rx={L.body[2] * r} ry={L.body[3] * r} fill={L.fill} stroke={INK} strokeWidth={5} />}
      {id === 'deer' && [[-0.4, 1.3], [0.2, 1.5], [0.5, 1.2], [-0.1, 1.75]].map(([x, y], i) => <circle key={i} cx={x * r} cy={y * r} r={r * 0.09} fill="#F4E6D2" />)}
      {id === 'owl' && <ellipse cx={0} cy={r * 1.2} rx={r * 0.5} ry={r * 0.6} fill="#D9CBB4" />}
      {L.antlers &&
        [-1, 1].map((s) => (
          <path key={s} d={`M${s * r * 0.55} ${-r * 0.55} C ${s * r * 0.95} ${-r * 0.7}, ${s * r * 1.2} ${-r * 0.9}, ${s * r * 1.32} ${-r * 1.2} L ${s * r * 1.16} ${-r * 1.04} L ${s * r * 1.12} ${-r * 1.38} L ${s * r * 0.98} ${-r * 1.0} L ${s * r * 0.88} ${-r * 1.3} L ${s * r * 0.8} ${-r * 0.92} C ${s * r * 0.78} ${-r * 0.84}, ${s * r * 0.66} ${-r * 0.78}, ${s * r * 0.45} ${-r * 0.72} Z`} fill="#E6CFA2" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        ))}
      {id === 'deer'
        ? L.ears.map(([x, y], i) => (
            <ellipse key={i} cx={x * r} cy={y * r} rx={r * 0.2} ry={r * 0.42} fill={L.earFill} stroke={INK} strokeWidth={5} transform={`rotate(${x < 0 ? -55 : 55} ${x * r} ${y * r})`} />
          ))
        : L.ears.map(([x, y, er], i) => <circle key={i} cx={x * r} cy={y * r} r={er * r} fill={L.earFill} stroke={INK} strokeWidth={5} />)}
      <circle r={r} fill={L.fill} stroke={INK} strokeWidth={5} />
      {L.stripe && <path d={`M0 ${-r * 0.98} L 0 ${-r * 0.2}`} stroke="#F4F2F8" strokeWidth={r * 0.22} strokeLinecap="round" />}
      {L.mask && <ellipse cx={0} cy={eyeY} rx={r * 0.72} ry={r * 0.24} fill="#3A3446" />}
      {L.muzzle && <ellipse cx={L.muzzle[0] * r} cy={L.muzzle[1] * r} rx={L.muzzle[2] * r} ry={L.muzzle[3] * r} fill={L.muzzleFill} stroke={INK} strokeWidth={4} />}
      {L.teeth && (
        <g>
          <rect x={-r * 0.13} y={r * 0.42} width={r * 0.12} height={r * 0.2} rx={3} fill="#F6A43C" stroke={INK} strokeWidth={3} />
          <rect x={r * 0.01} y={r * 0.42} width={r * 0.12} height={r * 0.2} rx={3} fill="#F6A43C" stroke={INK} strokeWidth={3} />
        </g>
      )}
      {L.muzzle && <ellipse cx={0} cy={r * (L.muzzle[1] - 0.12)} rx={r * 0.13} ry={r * 0.09} fill="#2E1E18" />}
      {L.beak && <polygon points={`${-r * 0.12},${r * 0.12} ${r * 0.12},${r * 0.12} 0,${r * 0.38}`} fill="#E8B04A" stroke={INK} strokeWidth={3} strokeLinejoin="round" />}
      {id === 'frog' && (
        <g>
          {[-1, 1].map((s) => (
            <circle key={s} cx={s * eyeX} cy={eyeY} r={r * 0.32} fill={L.fill} stroke={INK} strokeWidth={4} />
          ))}
          <path d={`M${-r * 0.5} ${r * 0.25} Q 0 ${r * 0.55} ${r * 0.5} ${r * 0.25}`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
      )}
      {[-1, 1].map((s) => (
        <g key={s}>
          {id === 'owl' && <circle cx={s * eyeX} cy={eyeY} r={r * 0.24} fill="#FFD84D" stroke={INK} strokeWidth={3} />}
          <circle cx={s * eyeX} cy={eyeY} r={r * 0.12} fill="#2B2236" />
          <circle cx={s * eyeX + r * 0.04} cy={eyeY - r * 0.04} r={r * 0.045} fill="#fff" />
        </g>
      ))}
      {[-1, 1].map((s) => (
        <ellipse key={s} cx={s * r * 0.6} cy={r * 0.25} rx={r * 0.12} ry={r * 0.07} fill="#FF9EB8" opacity={0.6} />
      ))}
    </g>
  )
}

/** Eyes shining in the dark (drawn over the darkness). */
function EyesEl({ id }: { id: CritterId | 'moose' }) {
  const L = LOOKS[id]
  const r = L.r
  const twins = id === 'kits' ? [-36, 36] : [0]
  const ey = L.eyeY * r
  return (
    <g data-k={id === 'moose' ? 'moose-eyes' : `e-${id}`} visibility={id === 'moose' ? undefined : 'hidden'} pointerEvents="none">
      <g data-k={id === 'moose' ? undefined : `e-${id}-in`}>
        {twins.flatMap((dx) =>
          [-1, 1].map((s) => (
            <g key={`${dx}${s}`}>
              <circle cx={dx + s * L.eyes * r} cy={ey} r={r * 0.34} fill={L.shine} opacity={0.22} />
              <circle cx={dx + s * L.eyes * r} cy={ey} r={r * 0.15} fill={L.shine} />
              <circle cx={dx + s * L.eyes * r + r * 0.05} cy={ey - r * 0.05} r={r * 0.05} fill="#fff" />
            </g>
          )),
        )}
      </g>
    </g>
  )
}

function Spruce({ x, y, h, fill }: { x: number; y: number; h: number; fill: string }) {
  const w = h * 0.36
  const tiers = 4
  return (
    <g>
      <rect x={x - h * 0.03} y={y - h * 0.18} width={h * 0.06} height={h * 0.2} fill="#5A3E30" stroke={INK} strokeWidth={4} />
      {Array.from({ length: tiers }, (_, i) => {
        const top = y - h + (i * h * 0.75) / tiers
        const bot = top + h * 0.42
        const ww = w * (0.45 + (0.55 * (i + 1)) / tiers)
        return <path key={i} d={`M${x} ${top.toFixed(0)} L ${(x + ww).toFixed(0)} ${bot.toFixed(0)} L ${(x - ww).toFixed(0)} ${bot.toFixed(0)} Z`} fill={fill} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      })}
    </g>
  )
}

// ---------------------------------------------------------------- the React side

const STARS = 110
const SPARKS = 30
const FLIES = 9

interface Run {
  section: CampSection
  found: number
  seed: number
  n: number
  light: Pt | null
}

export function CampfireNight() {
  const { start, param, enter } = useSections(CAMPFIRE_SECTIONS)
  const first = (start ?? 'eyes') as CampSection
  const [run, setRun] = useState<Run>(() => ({ section: first, found: param('found') === '' ? START_FOUND[first] : clamp(parseInt(param('found')) || 0, 0, ROSTER.length), seed: (Math.random() * 1e9) | 0, n: 0, light: null }))
  const [say, setSay] = useState(SAY[run.section])
  const [found, setFound] = useState<CritterId[]>(() => ROSTER.slice(0, run.found))
  const [ended, setEnded] = useState(false)
  const beam = useRef<((x: number, y: number) => void) | null>(null)
  const box = useRef<HTMLDivElement>(null)
  const back = useRef<SVGSVGElement>(null)
  const live = useRef<SVGSVGElement>(null)
  const front = useRef<SVGSVGElement>(null)
  const world = useRef<CampWorld | null>(null)
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
    enter(run.section, { found: run.found === START_FOUND[run.section] ? '' : String(run.found) })
    setFound(ROSTER.slice(0, run.found))
  }, [run])

  useLayoutEffect(() => {
    if (!back.current || !live.current || !front.current) return
    const w = new CampWorld(back.current, live.current, front.current, stage, run.section, run.found, run.seed, run.light, {
      section: (s, n) => {
        setEnded(false)
        setSay(SAY[s])
        setRun((r) => ({ section: s, found: n, seed: r.seed, n: r.n + 1, light: s === 'stars' ? null : [w.light.x, w.light.y] }))
      },
      found: setFound,
      say: setSay,
      beam: (x, y) => beam.current?.(x, y),
      end: () => setEnded(true),
    })
    w.setVb(vb)
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
  }, [run])

  // Turning the iPad: the other stage, the same section again (where things hide is kept; a trail half followed
  // starts over).
  const shape = useRef(stage)
  useEffect(() => {
    const w = world.current
    if (!w) return
    w.setVb(vb)
    if (shape.current !== stage) {
      shape.current = stage
      setRun((r) => ({ ...r, found: w.count(), n: r.n + 1, light: null }))
    }
  })

  const again = () => {
    setEnded(false)
    setSay(SAY.eyes)
    setRun((r) => ({ section: 'eyes', found: 0, seed: (Math.random() * 1e9) | 0, n: r.n + 1, light: null }))
  }

  const section = run.section
  const big = 6000
  const st = stage
  const [fx, fy] = st.fire
  const [mx, my] = st.maple
  const [tx, ty] = st.tent
  const [tw, th] = st.tentSize
  const [ox, oy] = st.moose
  const [dx, dy] = st.den
  const starPts = useStarField(stage, run.seed)
  const spruces = useSpruces(stage)

  return (
    <div
      ref={box}
      style={{ position: 'absolute', inset: 0, background: '#14102A', overflow: 'clip', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
      aria-label="Shine the flashlight around the campsite"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        world.current?.down(e)
      }}
      onPointerMove={(e) => world.current?.move(e)}
      onPointerUp={(e) => world.current?.up(e)}
      onPointerCancel={(e) => world.current?.up(e)}
    >
      <style>{CSS}</style>
      {/* The campsite as it really looks (only the flashlight shows it). */}
      <svg key={`b${run.n}`} ref={back} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} style={{ ...SVG_STYLE, willChange: 'transform' }} aria-hidden>
        <defs>
          <linearGradient id={`${mid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2A3A78" />
            <stop offset="1" stopColor="#6A7AB8" />
          </linearGradient>
        </defs>
        <rect x={-big} y={-big} width={big * 2} height={big + st.treeline} fill={`url(#${mid}-sky)`} />
        {/* Mont-Sainte-Anne behind the trees. */}
        <path d={`M${-big} ${st.treeline} L ${st.peak[0] - st.w * 0.7} ${st.treeline - 40} Q ${st.peak[0] - 160} ${st.peak[1] - 10} ${st.peak[0]} ${st.peak[1]} Q ${st.peak[0] + 220} ${st.peak[1] + 10} ${st.peak[0] + st.w * 0.6} ${st.treeline - 80} L ${big} ${st.treeline} Z`} fill="#5A7A9A" stroke={INK} strokeWidth={5} />
        <path d={`M${st.peak[0] - 60} ${st.peak[1] + 30} L ${st.peak[0] - 40} ${st.treeline - 60} M ${st.peak[0] + 70} ${st.peak[1] + 40} L ${st.peak[0] + 90} ${st.treeline - 70}`} stroke="#86A2BC" strokeWidth={14} strokeLinecap="round" />
        {spruces.map(([x, h, i]) => (
          <Spruce key={i} x={x} y={st.treeline + 10} h={h} fill={i % 2 ? '#2F6A4E' : '#3A7A58'} />
        ))}
        {/* The clearing. */}
        <rect x={-big} y={st.ground - 30} width={big * 2} height={big} fill="#4E7A46" />
        <ellipse cx={fx} cy={fy + 40} rx={st.w * 0.36} ry={140} fill="#9A7A58" />
        {st.trees.map(([x, y, h], i) => (
          <Spruce key={i} x={x} y={y} h={h} fill="#2A5E44" />
        ))}
        {/* Branches the owl can sit on. */}
        {[...st.spots.owl, st.sounds.owl].map(([x, y], i) => (
          <path key={i} d={`M${x - 80} ${y + 96} L ${x + 80} ${y + 90}`} stroke="#5A3E30" strokeWidth={14} strokeLinecap="round" />
        ))}
        {/* The hollow log where the raccoons live. */}
        <g transform={`translate(${dx} ${dy})`}>
          <rect x={-90} y={-36} width={190} height={78} rx={36} fill="#8A5A3A" stroke={INK} strokeWidth={5} />
          <ellipse cx={-80} cy={3} rx={26} ry={36} fill="#3A2622" stroke={INK} strokeWidth={5} />
          <path d="M-20 -20 L 60 -20 M -10 10 L 80 10" stroke="#6E4428" strokeWidth={5} strokeLinecap="round" />
        </g>
        {/* The lake, with lily pads. */}
        <path d={`M${-big} ${st.lake.y} L ${st.lake.x - 60} ${st.lake.y} Q ${st.lake.x + 30} ${st.lake.y + 10} ${st.lake.x + 20} ${st.lake.y + 90} L ${st.lake.x - 40} ${big} L ${-big} ${big} Z`} fill="#4A82B8" stroke={INK} strokeWidth={5} />
        {[...st.spots.frog, st.sounds.frog].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y + 34} rx={52} ry={16} fill="#5EA868" stroke={INK} strokeWidth={4} />
        ))}
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${st.lake.x - 340 + i * 90} ${st.lake.y + 140 + i * 50} q 30 -10 60 0`} stroke="#9CC4E8" strokeWidth={5} fill="none" strokeLinecap="round" />
        ))}
        {/* The tent (pink). */}
        <g>
          <path d={`M${tx} ${ty - th} L ${tx + tw} ${ty} L ${tx - tw} ${ty} Z`} fill="#F07AA0" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d={`M${tx} ${ty - th + 30} L ${tx + tw * 0.4} ${ty} L ${tx - tw * 0.4} ${ty} Z`} fill="#C85A82" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <path d={`M${tx} ${ty - th + 30} L ${tx} ${ty}`} stroke="#F6C6D6" strokeWidth={4} strokeDasharray="6 6" />
        </g>
        {/* The bandit's paw prints in the dirt. */}
        {section === 'bandit' &&
          st.prints.map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${(Math.atan2(...dirOf(st.prints, i)) * 180) / Math.PI})`}>
              <Paw fill="#5A4030" />
            </g>
          ))}
      </svg>
      {/* What moves in the dark (its own layer, so the forest behind isn't redrawn every frame). */}
      <svg key={`d${run.n}`} ref={live} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} style={SVG_STYLE} aria-hidden>
        {/* The moose at the edge of the camp (his eyes shine over the dark). */}
        <g data-k="moose-head">
          <g transform={`translate(${ox} ${oy})`}>
            <Shape look={LOOKS.moose} id="moose" />
          </g>
        </g>
        {/* The night animals in the dark. */}
        {ROSTER.map((id) => (
          <CritterEl key={id} id={id} layer="b" />
        ))}
        {/* The bat only shows in the light. */}
        <g data-k="bat" visibility="hidden">
          <g data-k="bat-wings">
            <path d="M0 0 C -30 -30, -60 -20, -80 -6 C -60 -8, -50 6, -40 4 C -30 10, -20 4, 0 6 Z" fill="#3A3046" stroke={INK} strokeWidth={4} />
            <path d="M0 0 C 30 -30, 60 -20, 80 -6 C 60 -8, 50 6, 40 4 C 30 10, 20 4, 0 6 Z" fill="#3A3046" stroke={INK} strokeWidth={4} />
          </g>
          <circle r={14} fill="#4A3E56" stroke={INK} strokeWidth={4} />
          <circle cx={-5} cy={-3} r={3} fill="#fff" />
          <circle cx={5} cy={-3} r={3} fill="#fff" />
        </g>
        <g data-k="bushes">
          {st.bushes.map(([x, y, r], i) => (
            <g key={i}>
              <circle cx={x - r * 0.55} cy={y + r * 0.2} r={r * 0.7} fill="#3E7E4A" stroke={INK} strokeWidth={5} />
              <circle cx={x + r * 0.55} cy={y + r * 0.2} r={r * 0.7} fill="#3E7E4A" stroke={INK} strokeWidth={5} />
              <circle cx={x} cy={y} r={r * 0.85} fill="#4A9058" stroke={INK} strokeWidth={5} />
              <circle cx={x - r * 0.3} cy={y - r * 0.2} r={r * 0.12} fill="#D8577A" />
              <circle cx={x + r * 0.25} cy={y + r * 0.1} r={r * 0.1} fill="#D8577A" />
            </g>
          ))}
        </g>
      </svg>
      <Beam hook={beam} vb={vb} k={k} />
      {/* The fire's warm glow over the dark (a plain div, flickering on the compositor). */}
      <div
        data-k="glow"
        className="camp-glow"
        style={{ position: 'absolute', zIndex: 21, pointerEvents: 'none', left: (fx - vb.x - 340) * k, top: (fy - 20 - vb.y - 260) * k, width: 680 * k, height: 520 * k, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,180,90,.42), rgba(255,138,76,.14) 55%, rgba(255,138,76,0))' }}
      />
      {/* Over the dark: the moon, the stars that came out, the fire and whatever it lights, the eyes, the friends. */}
      <svg key={`f${run.n}`} ref={front} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} style={{ ...SVG_STYLE, zIndex: 22, pointerEvents: 'none' }} aria-hidden>
        <defs>
          <radialGradient id={`${mid}-halo`}>
            <stop offset="0" stopColor="#FFF2C8" stopOpacity={0.35} />
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
          <CritterEl key={id} id={id} layer="f" halo={`url(#${mid}-halo)`} />
        ))}
        {/* The fire. */}
        <g>
          <rect x={fx - 90} y={fy + 10} width={180} height={34} rx={17} fill="#8A5A3A" stroke={INK} strokeWidth={5} transform={`rotate(-12 ${fx} ${fy + 27})`} />
          <rect x={fx - 90} y={fy + 10} width={180} height={34} rx={17} fill="#7A4A2E" stroke={INK} strokeWidth={5} transform={`rotate(12 ${fx} ${fy + 27})`} />
          {[-110, -60, 0, 60, 110].map((x, i) => (
            <circle key={i} cx={fx + x} cy={fy + 50} r={22} fill="#9A98A8" stroke={INK} strokeWidth={4} />
          ))}
        </g>
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
        {/* Maple on her log by the fire, holding the flashlight. */}
        <g transform={`translate(${mx} ${my})`}>
          <rect x={-100} y={74} width={200} height={40} rx={20} fill="#8A5A3A" stroke={INK} strokeWidth={5} />
          <g data-k="maple-body">
            <ellipse cx={-70} cy={96} rx={44} ry={18} fill="#5A3A26" stroke={INK} strokeWidth={4} />
            <Shape look={LOOKS.maple} id="maple" />
            <rect x={44} y={-16} width={44} height={20} rx={6} fill="#B9B2C6" stroke={INK} strokeWidth={4} />
            <circle cx={88} cy={-6} r={11} fill="#FFF2B0" stroke={INK} strokeWidth={3} />
            <circle cx={44} cy={0} r={14} fill={LOOKS.maple.fill} stroke={INK} strokeWidth={4} />
          </g>
        </g>
        {/* The empty marshmallow bag (bandit), or the bag of marshmallows (by the fire). */}
        {section !== 'eyes' && section !== 'sounds' && (
          <g transform={`translate(${st.bag[0]} ${st.bag[1]})`}>
            <path d="M-50 30 L -42 -36 L 42 -36 L 50 30 Z" fill="#EEF2FA" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            {section === 'bandit' ? (
              <g data-k="bag-empty">
                <path d="M-42 -36 L -28 -20 L -14 -38 L 0 -22 L 14 -38 L 28 -20 L 42 -36" fill="none" stroke={INK} strokeWidth={4} />
                <ellipse cx={0} cy={4} rx={26} ry={14} fill="#C8CDDA" />
              </g>
            ) : (
              [-20, 4, 26].map((x, i) => <rect key={i} x={x - 12} y={-56 + (i % 2) * 8} width={24} height={30} rx={8} fill="#FFFDF8" stroke={INK} strokeWidth={3} />)
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
          <EyesEl id="moose" />
          <g data-k="squint" opacity={0}>
            {[-1, 1].map((s) => (
              <path key={s} d={`M${s * 25 - 12} -15 L ${s * 25 + 12} -15`} stroke="#2B2236" strokeWidth={6} strokeLinecap="round" />
            ))}
          </g>
          <g data-k="shades" opacity={0}>
            <path d="M-52 -26 L 52 -26" stroke="#2B2236" strokeWidth={6} />
            {[-1, 1].map((s) => (
              <rect key={s} x={s * 25 - 22} y={-28} width={44} height={26} rx={10} fill="#2B2236" stroke={INK} strokeWidth={3} />
            ))}
            <path d="M-38 -22 l 10 0" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
          </g>
         </g>
        </g>
        {/* The marshmallow on its stick, with the raccoons by the fire. */}
        {section === 'marshmallow' && (
          <g>
            <path data-k="stick" d="" stroke="#A8784E" strokeWidth={12} strokeLinecap="round" fill="none" />
            <g data-k="mallow">
              <rect x={-24} y={-20} width={48} height={40} rx={14} fill="#FFFDF8" stroke={INK} strokeWidth={4} />
            </g>
            <g data-k="mallow-fire" opacity={0}>
              <path d="M-22 10 C -26 -10, -6 -16, -2 -40 C 8 -20, 24 -16, 20 10 Z" fill="#FF8A4C" stroke={INK} strokeWidth={3} />
              <path d="M-10 8 C -12 -4, 0 -8, 2 -22 C 8 -10, 14 -6, 10 8 Z" fill="#FFE07A" />
            </g>
          </g>
        )}
        <g fill="#FFF07A">
          {Array.from({ length: FLIES }, (_, i) => (
            <circle key={i} data-k="fly" r={7} opacity={0} />
          ))}
        </g>
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
      {/* The night animals met so far (Maple's book, for now a row of chips). */}
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
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 30 }}>
        <AnimatePresence mode="popLayout">
          <motion.div key={say} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={PILL}>
            {say}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/** The kit's Torchlight over the scene, moved every frame by the world: its own little component, so the scene itself
 *  doesn't re-render 60 times a second. Its size, softness and darkness are knobs. */
function Beam({ hook, vb, k }: { hook: { current: ((x: number, y: number) => void) | null }; vb: { x: number; y: number }; k: number }) {
  const [b, setB] = useState({ x: -9999, y: -9999, size: TORCH.size, soft: TORCH.soft, dark: TORCH.dark })
  useEffect(() => {
    hook.current = (x, y) =>
      setB((o) => (Math.abs(o.x - x) < 0.4 && Math.abs(o.y - y) < 0.4 && o.size === TORCH.size && o.soft === TORCH.soft && o.dark === TORCH.dark ? o : { x, y, size: TORCH.size, soft: TORCH.soft, dark: TORCH.dark }))
    return () => {
      hook.current = null
    }
  }, [hook])
  return <Torchlight at={`${((b.x - vb.x) * k).toFixed(1)}px ${((b.y - vb.y) * k).toFixed(1)}px`} radius={b.size * k} soft={b.soft} darkness={b.dark} />
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

/** The row of spruces behind the clearing, out past both edges of the stage. */
function useSpruces(stage: StageDef) {
  const out: [number, number, number][] = []
  let i = 0
  for (let x = -stage.w * 0.6; x < stage.w * 1.6; x += 92) {
    const h = 250 + 90 * Math.abs(Math.sin(x * 0.013)) + 50 * Math.sin(x * 0.041)
    out.push([Math.round(x), Math.round(h), i++])
  }
  return out
}

const SVG_STYLE = { position: 'absolute' as const, inset: 0, width: '100%', height: '100%', display: 'block' }

const CSS = `
.camp-glow { animation: camp-glow 0.9s ease-in-out infinite alternate; transition: transform .2s; }
@keyframes camp-glow { from { opacity: .85 } to { opacity: 1 } }
.camp-hint { animation: camp-hint 1s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes camp-hint { 0%,100% { transform: scale(1) } 50% { transform: scale(1.15) } }
.camp-shoot { animation: camp-shoot 1.4s ease-out 2 both; }
@keyframes camp-shoot { 0% { opacity: 0; transform: translate(-200px, -60px) } 30% { opacity: 1 } 100% { opacity: 0; transform: translate(500px, 160px) } }
`

/** The 🔁 button waits in the corner under the row of animals, clear of the fire. */
const AGAIN = { position: 'absolute' as const, zIndex: 31, right: 'calc(var(--safe-right, 0px) + 16px)', top: 'calc(var(--top-clear) + 60px)', pointerEvents: 'auto' as const }

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
}

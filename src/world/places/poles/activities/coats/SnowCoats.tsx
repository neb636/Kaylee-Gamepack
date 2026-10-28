// Snow Coats (plan: planning/around-the-world/poles.html): Arctic animals change coats with the seasons.
// One verb, rub with her finger, that gets richer three times:
//   fox    one Arctic fox, brown in late summer. Snow starts to fall; where her finger goes the coat turns white (and
//          fluffier at the edges). The ground slowly goes white by itself, and she can rub snow onto it too.
//   hide   a hare, a ptarmigan and a lemming join the fox on the snow, brown. Rubbed white, each one fades into the snow.
//          Then a polar bear wanders past sniffing: a white one isn't there for him (he looks round, "?"), one with brown
//          left on it giggles and runs (silly, never caught), and he comes back for it later. When he can't find any,
//          dusk falls: only their eyes and noses blink.
//   summer now her finger is sunshine: the snow melts off the ground in streaks, flowers pop up, coats turn brown. The
//          snowy owl stays white all year (rub it and it shakes its head).
// Each animal is a flat puppet (animals.ts) in its summer coat, with its white coat on top masked by her strokes
// (perfect-freehand outlines, in the animal's own units so the paint moves with it). Its head and tail turn on their
// own pivots, it breathes, blinks, watches her finger, giggles and hops. A grid of cells under each coat says how white
// it is; past "finishes itself at" the rest puffs on by itself. The tundra is painted (art.coats): the far hills and the
// ground of each season, the winter ones fading in as the snow settles and out as it melts. Sparkle (kit/Guide) says
// one short line as each part starts, a hint when nothing's been touched for a while, and a fact the first time she
// pokes an animal. The summer all brown: the stamp. The brush and the coats are knobs (?feel=1). 2D only: SVG written
// to every frame, no three.js.
import { getStroke } from 'perfect-freehand'
import { motion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { BigButton, burst, sounds, useAlive, useElementSize, type Line } from '../../../../../sdk'
import { Guide, type GuideHandle } from '../../../../kit/Guide'
import { knobs, watch } from '../../../../kit/knobs'
import { useSections } from '../../../../kit/sections'
import { noise, sfx, tone } from '../../../../kit/sfx'
import { art } from '../../art'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { COAT_IDS, coatGrid, DARK, GROUPS, inShape, SHAPES, TALL, VOICE, WIDE, type CoatGrid, type CoatId, type Detail, type Group, type Part, type Shape, type StageDef } from './animals'
import COATS_SECTIONS, { type CoatsSection } from './sections'

type Geo = { e: [number, number, number, number, number?] } | { p: number[] }

const FILE = 'src/world/places/poles/activities/coats/SnowCoats.tsx'
/** Her finger's brush (live in the feel lab: ?feel=1). Sizes are stage units: the wide stage is 1600 x 1000, the tall
 *  one 1000 x 1500 (on an iPad a stage unit is about 0.65 px). */
const BRUSH = knobs('coatsBrush', 'Rub the coat', FILE, {
  size: { value: 84, min: 20, max: 240, step: 2, label: 'Brush size', unit: 'u', note: 'how wide her finger paints (the stage is 1600 wide)' },
  smoothing: { value: 0.6, min: 0, max: 1, step: 0.05, label: 'Smoothing', note: "how soft and round the stroke's edge is" },
  streamline: { value: 0.4, min: 0, max: 0.95, step: 0.05, label: 'Streamline', note: 'how much the stroke lags behind to even out a wobbly finger' },
  thinning: { value: 0.15, min: 0, max: 0.9, step: 0.05, label: 'Thinning', note: 'how much a fast rub gets thinner (0 = always the full size)' },
  spacing: { value: 4, min: 1, max: 30, step: 1, label: 'Point spacing', unit: 'u', note: 'how far her finger moves before the stroke takes a new point' },
  reach: { value: 0.9, min: 0.4, max: 1.3, step: 0.05, label: 'Counts as painted', note: "share of the brush's width that counts toward how done a coat is" },
})
const COAT = knobs('coats', 'Coats and hiding', FILE, {
  finish: { value: 0.78, min: 0.3, max: 1, step: 0.02, label: 'Finishes itself at', note: 'once this share of a coat is done, the rest puffs on by itself' },
  fluff: { value: 14, min: 0, max: 30, step: 1, label: 'Fluff', unit: 'u', note: 'how big the fluffy tufts grow on a white coat' },
  settle: { value: 35, min: 5, max: 120, step: 1, label: 'Snow settles', unit: 's', note: 'how long the ground takes to go white by itself while she paints the fox' },
  bearWait: { value: 4, min: 1, max: 15, step: 0.5, label: 'Bear comes after', unit: 's', note: 'seconds without rubbing (every animal at least half white) before the polar bear comes looking' },
  bearSpeed: { value: 260, min: 80, max: 700, step: 10, label: 'Bear walk', unit: 'u/s', note: 'how fast the polar bear walks' },
  sniff: { value: 1.6, min: 0.5, max: 4, step: 0.1, label: 'Sniff', unit: 's', note: 'how long he sniffs at each animal' },
  flowers: { value: 0.3, min: 0, max: 1, step: 0.05, label: 'Flowers', note: 'chance a melted patch of ground pops a flower' },
})

const INK = [0x4a, 0x3b, 0x57]
const PALE = [0xd4, 0xdd, 0xec]
const SNOW = '#F7FAFE'
const GROUND_CELL = 40

/** What Sparkle says as each part starts, and again when nothing's been touched for a while. */
const START: Record<CoatsSection, Line> = { fox: L.coats.fox.start, hide: L.coats.hide.start, summer: L.coats.summer.start }
const HINT: Record<CoatsSection, Line> = { fox: L.coats.fox.hint, hide: L.coats.hide.hint, summer: L.coats.summer.hint }
type Phase = 'play' | 'bear' | 'dusk' | 'end'
/** After the summer's fanfare: the stamp. */
const DONE_AFTER_S = 4.5

type Mode = 'snow' | 'sun'
const ease = (p: number) => (p < 0 ? 0 : p > 1 ? 1 : p * p * (3 - 2 * p))
const lerpInk = (t: number) => `rgb(${INK.map((c, i) => Math.round(c + (PALE[i] - c) * t)).join(',')})`

function outline(points: number[][], size: number, last: boolean): string {
  const stroke = getStroke(points, { size, thinning: BRUSH.thinning, smoothing: BRUSH.smoothing, streamline: BRUSH.streamline, simulatePressure: true, last })
  if (stroke.length < 3) return ''
  let d = `M${stroke[0][0].toFixed(1)} ${stroke[0][1].toFixed(1)}`
  for (let i = 0; i < stroke.length; i++) {
    const [x0, y0] = stroke[i]
    const [x1, y1] = stroke[(i + 1) % stroke.length]
    d += ` Q${x0.toFixed(1)} ${y0.toFixed(1)} ${((x0 + x1) / 2).toFixed(1)} ${((y0 + y1) / 2).toFixed(1)}`
  }
  return d + ' Z'
}

// ---------------------------------------------------------------- drawing the animals

const partEl = (pt: Geo, key: number, props: Record<string, unknown>) =>
  'e' in pt ? (
    <ellipse key={key} cx={pt.e[0]} cy={pt.e[1]} rx={pt.e[2]} ry={pt.e[3]} transform={pt.e[4] ? `rotate(${pt.e[4]} ${pt.e[0]} ${pt.e[1]})` : undefined} {...props} />
  ) : (
    <polygon key={key} points={pt.p.join(' ')} strokeLinejoin="round" {...props} />
  )

/** The 5-unit ink outline: every part filled and stroked in ink, under the fills (so no lines inside the shape). */
const Silhouette = ({ parts, s }: { parts: Geo[]; s: number }) => <g style={{ fill: 'var(--ci)', stroke: 'var(--ci)' }}>{parts.map((pt, i) => partEl(pt, i, { strokeWidth: 10 / s }))}</g>
const Fill = ({ parts, color }: { parts: Geo[]; color: string }) => <g fill={color}>{parts.map((pt, i) => partEl(pt, i, {}))}</g>
const coatColor = (sh: Shape, pt: Part) => (pt.c === 'l' ? sh.light : pt.c === 'd' ? sh.dark : sh.brown)
const inGroup = (g: Group) => (x: { g?: Group }) => (x.g ?? 'body') === g

/** What sits on top of the coat whatever the season: eyes (they blink and look at her finger), nose, mouth, blush. */
function DetailEl({ d, k }: { d: Detail; k: string }) {
  switch (d.k) {
    case 'eye':
      return (
        <g data-k={`${k}-eye`} data-x={d.x} data-y={d.y} data-r={d.r}>
          <g data-k={`${k}-pupil`}>
            {d.iris ? (
              <>
                <circle cx={d.x} cy={d.y} r={d.r} fill={d.iris} stroke={DARK} strokeWidth={3} />
                <circle cx={d.x} cy={d.y} r={d.r * 0.6} fill={DARK} />
              </>
            ) : (
              <ellipse cx={d.x} cy={d.y} rx={d.r} ry={d.r * 1.15} fill={DARK} />
            )}
            <circle cx={d.x - d.r * 0.3} cy={d.y - d.r * 0.38} r={d.r * 0.36} fill="#fff" />
            <circle cx={d.x + d.r * 0.32} cy={d.y + d.r * 0.3} r={d.r * 0.15} fill="#fff" />
          </g>
        </g>
      )
    case 'nose':
      return (
        <g>
          <ellipse cx={d.x} cy={d.y} rx={d.r} ry={d.r * 0.8} fill={d.color ?? DARK} />
          <ellipse cx={d.x - d.r * 0.3} cy={d.y - d.r * 0.3} rx={d.r * 0.32} ry={d.r * 0.22} fill="#fff" opacity={0.7} />
        </g>
      )
    case 'blush':
      return <ellipse cx={d.x} cy={d.y} rx={d.r * 1.25} ry={d.r * 0.75} fill="#FF9DB8" opacity={0.6} />
    case 'mouth':
      return (
        <g>
          <path data-k={`${k}-smile`} d={`M${d.x - d.w} ${d.y} Q${d.x} ${d.y + d.w * 0.95} ${d.x + d.w} ${d.y}`} fill="none" stroke={DARK} strokeWidth={3.2} strokeLinecap="round" />
          <path
            data-k={`${k}-open`}
            d={`M${d.x - d.w * 1.1} ${d.y - 1} Q${d.x} ${d.y - 3} ${d.x + d.w * 1.1} ${d.y - 1} C${d.x + d.w * 1.1} ${d.y + d.w * 1.3} ${d.x - d.w * 1.1} ${d.y + d.w * 1.3} ${d.x - d.w * 1.1} ${d.y - 1}Z`}
            fill="#7A2745"
            stroke={DARK}
            strokeWidth={2.5}
            strokeLinejoin="round"
            style={{ display: 'none' }}
          />
        </g>
      )
    case 'ell':
      return partEl({ e: d.e }, 0, { fill: d.color })
    case 'poly':
      return <polygon points={d.p.join(' ')} fill={d.color} stroke={d.color} strokeWidth={3} strokeLinejoin="round" />
    case 'line':
      return <path d={d.d} fill="none" stroke={d.color ?? 'var(--ci)'} strokeWidth={d.w ?? 4} strokeLinecap="round" strokeLinejoin="round" />
  }
}

/** A puppet: its tail, body and head on their own pivots (back to front), each drawn as an ink silhouette, the fluff
 *  (paintable coats only), the summer coat, the white coat under her strokes (`mid`), then the details. The bear and
 *  the owl pass no grid and no mask: they're white all year. */
function AnimalEl({ id, sh, grid, mid, s = 1 }: { id: string; sh: Shape; grid?: CoatGrid; mid?: string; s?: number }) {
  return (
    <g data-k={`${id}-body`}>
      {GROUPS.map((g) => {
        const parts = sh.parts.filter(inGroup(g))
        const details = sh.details.filter(inGroup(g))
        if (!parts.length && !details.length) return null
        const edge = grid ? grid.edge.map((e, i) => [e, i] as const).filter(([, i]) => grid.edgeGroup[i] === g) : []
        return (
          <g key={g} data-k={`${id}-g-${g}`}>
            <Silhouette parts={parts} s={s} />
            {grid && (
              <>
                <g style={{ fill: 'var(--ci)' }}>
                  {edge.map(([e, i]) => (
                    <circle key={e} data-k={`${id}-fi`} data-i={i} cx={grid.xs[e]} cy={grid.ys[e]} r={0} />
                  ))}
                </g>
                <g fill={SNOW}>
                  {edge.map(([e, i]) => (
                    <circle key={e} data-k={`${id}-fw`} data-i={i} cx={grid.xs[e]} cy={grid.ys[e]} r={0} />
                  ))}
                </g>
              </>
            )}
            <g>{parts.map((pt, i) => partEl(pt, i, { fill: coatColor(sh, pt) }))}</g>
            {mid && (
              <g mask={`url(#${mid}-${id})`}>
                <Fill parts={parts} color={SNOW} />
              </g>
            )}
            {details.map((d, i) => (
              <DetailEl key={i} d={d} k={id} />
            ))}
          </g>
        )
      })}
    </g>
  )
}

/** One paintable animal: the mask her strokes draw into, then the puppet. */
function CoatEl({ id, mid, base }: { id: CoatId; mid: string; base: 'white' | 'black' }) {
  const sh = SHAPES[id]
  const { x, y, w, h } = sh.box
  const m = 80
  return (
    <g data-k={`${id}-root`} data-coat={id}>
      <defs>
        <mask id={`${mid}-${id}`} maskUnits="userSpaceOnUse" x={x - m} y={y - m} width={w + 2 * m} height={h + 2 * m}>
          <rect x={x - m} y={y - m} width={w + 2 * m} height={h + 2 * m} fill={base} />
          <g data-k={`${id}-strokes`} />
          <rect data-k={`${id}-finish`} x={x - m} y={y - m} width={w + 2 * m} height={h + 2 * m} fill={base === 'black' ? 'white' : 'black'} opacity={0} />
        </mask>
      </defs>
      <AnimalEl id={id} sh={sh} grid={GRIDS[id]} mid={mid} />
    </g>
  )
}

const GRIDS = Object.fromEntries(COAT_IDS.map((id) => [id, coatGrid(SHAPES[id])])) as Record<CoatId, CoatGrid>

// ---------------------------------------------------------------- the runtime (plain objects, written every frame)

interface Seg {
  el: SVGPathElement
  pts: number[][]
}
interface Anim {
  kind: 'hop' | 'giggle' | 'nope'
  t0: number
}
/** A puppet's moving bits, found once in the SVG: the head and tail pivots, the eyes, the mouth. */
interface Rig {
  head: SVGGElement | null
  tail: SVGGElement | null
  eyes: { el: SVGGElement; pupil: SVGGElement; x: number; y: number; r: number }[]
  smile: SVGPathElement[]
  open: SVGPathElement[]
  pivots: Shape['pivots']
  /** The tail's spring (it flops after a hop and streams back in a run). */
  tail0: number
  tailV: number
  blinkAt: number
  ph: number
}
function findRig(svg: SVGSVGElement, id: string, sh: Shape): Rig {
  const q = <T extends Element>(k: string) => svg.querySelector(`[data-k="${k}"]`) as T | null
  const eyes = [...svg.querySelectorAll<SVGGElement>(`[data-k="${id}-eye"]`)].map((el) => ({ el, pupil: el.querySelector<SVGGElement>(`[data-k="${id}-pupil"]`)!, x: +el.dataset.x!, y: +el.dataset.y!, r: +el.dataset.r! }))
  return {
    head: q<SVGGElement>(`${id}-g-head`),
    tail: q<SVGGElement>(`${id}-g-tail`),
    eyes,
    smile: [...svg.querySelectorAll<SVGPathElement>(`[data-k="${id}-smile"]`)],
    open: [...svg.querySelectorAll<SVGPathElement>(`[data-k="${id}-open"]`)],
    pivots: sh.pivots,
    tail0: 0,
    tailV: 0,
    blinkAt: 1 + Math.random() * 3,
    ph: Math.random() * 6,
  }
}
/** Each frame: head and tail angles (degrees), how open the eyes are (1 open, 0 shut), where the pupils look (-1..1),
 *  and whether the mouth is open. */
function poseRig(r: Rig, head: number, headY: number, tail: number, eyes: number, look: [number, number], open: boolean) {
  const [hx, hy] = r.pivots.head ?? [0, 0]
  r.head?.setAttribute('transform', `translate(0 ${headY.toFixed(1)}) rotate(${head.toFixed(2)} ${hx} ${hy})`)
  const [tx, ty] = r.pivots.tail ?? [0, 0]
  r.tail?.setAttribute('transform', `rotate(${tail.toFixed(2)} ${tx} ${ty})`)
  for (const e of r.eyes) {
    e.el.setAttribute('transform', `translate(0 ${(e.y * (1 - eyes)).toFixed(2)}) scale(1 ${Math.max(0.08, eyes).toFixed(3)})`)
    e.pupil.setAttribute('transform', `translate(${(look[0] * e.r * 0.22).toFixed(2)} ${(look[1] * e.r * 0.2).toFixed(2)})`)
  }
  for (const s of r.smile) s.style.display = open ? 'none' : ''
  for (const o of r.open) o.style.display = open ? '' : 'none'
}
/** Blinks: how open the eyes are now (a quick shut every few seconds, more often at dusk). */
function blink(r: Rig, now: number, often: boolean) {
  if (now > r.blinkAt + 0.14) r.blinkAt = now + (often ? 0.8 + Math.random() * 1.6 : 2 + Math.random() * 3.5)
  return now > r.blinkAt && now < r.blinkAt + 0.14 ? 0.1 : 1
}
interface Coat {
  id: CoatId
  shape: Shape
  grid: CoatGrid
  cells: Uint8Array
  white: number
  done: boolean
  x: number
  y: number
  s: number
  dir: number
  run: { x0: number; x1: number; t0: number; dur: number } | null
  anim: Anim | null
  seg: Seg | null
  finishT: number
  ink: number
  step: number
  rig: Rig
  fluff: Float32Array
  els: { root: SVGGElement; body: SVGGElement; strokes: SVGGElement; finish: SVGRectElement; fi: SVGCircleElement[]; fw: SVGCircleElement[] }
}
/** The fluff circles in edge order (each pivot group draws its own, so the document order is mixed). */
const byIndex = (els: SVGCircleElement[]) => {
  const out: SVGCircleElement[] = []
  for (const el of els) out[+(el.dataset.i ?? 0)] = el
  return out
}
interface Bear {
  state: 'off' | 'walk' | 'sniff' | 'leave'
  x: number
  dir: number
  t: number
  visit: Coat[]
  at: number
  found: boolean
  cooldown: number
  huff: number
  walked: number
}

interface Events {
  section: (s: CoatsSection, painted?: string) => void
  phase: (p: Phase) => void
  note: (show: boolean) => void
  /** She poked something (a tap, not a rub): Sparkle's fact the first time. */
  poked: (what: CoatId | 'bear' | 'land') => void
  /** The bear sniffed an animal: nobody there (white), or it ran off giggling (brown showing). */
  sniffed: (found: 'missed' | 'ran') => void
}

class CoatsWorld {
  coats: Coat[] = []
  stage: StageDef
  mode: Mode
  section: CoatsSection
  phase: Phase = 'play'
  ground = { cells: new Uint8Array(0), cols: 0, rows: 0, snow: 0, total: 0, seg: null as Seg | null, strokes: null as SVGGElement | null, finish: null as SVGRectElement | null, settle: null as SVGRectElement | null, flowers: null as SVGGElement | null, settleV: 0, finishT: -1, gx: 0, gy: 0 }
  bear: Bear = { state: 'off', x: -600, dir: 1, t: 0, visit: [], at: 0, found: false, cooldown: 0, huff: -9, walked: 0 }
  finger: { id: number; x: number; y: number; sx: number; sy: number; t0: number; tl: number; moved: number; last: [number, number] | null } | null = null
  speed = 0
  lastRub = 0
  lastTouched: Coat | null = null
  flakes: { el: SVGCircleElement; x: number; y: number; vy: number; ph: number }[] = []
  vb = { x: 0, y: 0, w: 1600, h: 1000 }
  now = 0
  t0 = 0
  dusk = 0
  owlAnim: Anim | null = null
  owlNoteAt = -9
  owlStroke = false
  sunPulse = -9
  aurora = -9
  phaseAt = 0
  els: Record<string, Element | null> = {}
  bearRig: Rig | null = null
  owlRig: Rig | null = null

  constructor(
    private svg: SVGSVGElement,
    stage: StageDef,
    section: CoatsSection,
    painted: string[],
    private ev: Events,
  ) {
    this.stage = stage
    this.section = section
    this.mode = section === 'summer' ? 'sun' : 'snow'
    const q = <T extends Element>(k: string) => svg.querySelector(`[data-k="${k}"]`) as T
    const qa = <T extends Element>(k: string) => [...svg.querySelectorAll(`[data-k="${k}"]`)] as T[]
    const ids: CoatId[] = section === 'fox' ? ['fox'] : [...COAT_IDS]
    for (const id of ids) {
      const grid = GRIDS[id]
      const n = grid.xs.length
      const white = section === 'summer' || (section === 'hide' && painted.includes(id))
      const c: Coat = {
        id,
        shape: SHAPES[id],
        grid,
        cells: new Uint8Array(n).fill(white ? 1 : 0),
        white: white ? n : 0,
        done: section === 'hide' && white,
        x: 0,
        y: 0,
        s: 1,
        dir: 1,
        run: null,
        anim: null,
        seg: null,
        finishT: section === 'hide' && white ? -100 : -1,
        ink: section === 'fox' ? 0 : white ? 1 : 0,
        step: white && section !== 'summer' ? 5 : 0,
        rig: findRig(svg, id, SHAPES[id]),
        fluff: new Float32Array(grid.edge.length),
        els: { root: q(`${id}-root`), body: q(`${id}-body`), strokes: q(`${id}-strokes`), finish: q(`${id}-finish`), fi: byIndex(qa(`${id}-fi`)), fw: byIndex(qa(`${id}-fw`)) },
      }
      if (c.finishT === -100) c.els.finish.setAttribute('opacity', '1')
      this.coats.push(c)
    }
    const g = this.ground
    g.strokes = q('ground-strokes')
    g.finish = q('ground-finish')
    g.settle = q('ground-settle')
    g.flowers = q('flowers')
    for (const el of qa<SVGCircleElement>('flake')) this.flakes.push({ el, x: Math.random(), y: Math.random(), vy: 0.6 + Math.random() * 0.8, ph: Math.random() * 6 })
    for (const k of ['bear-root', 'bear-body', 'bear-q', 'owl-root', 'owl-body', 'dusk', 'aurora', 'sun', 'hint', 'hills-alt', 'ground-alt']) this.els[k] = q(k)
    this.bearRig = this.els['bear-body'] ? findRig(svg, 'bear', SHAPES.bear) : null
    this.owlRig = this.els['owl-body'] ? findRig(svg, 'owl', SHAPES.owl) : null
    this.setStage(stage)
  }

  setStage(stage: StageDef) {
    this.stage = stage
    for (const c of this.coats) {
      const spot = this.section === 'fox' ? stage.fox : stage.spots[c.id]
      c.x = spot.x
      c.y = spot.y
      c.s = spot.s
      c.dir = this.section === 'fox' ? 1 : spot.x > stage.w / 2 ? -1 : 1
      c.run = null
    }
    // The ground's cells cover the stage below the ground line, in ground units (0,0 = the middle of the ground line).
    const g = this.ground
    const cols = Math.ceil(stage.w / GROUND_CELL)
    const rows = Math.ceil((stage.h - stage.ground) / GROUND_CELL)
    if (cols !== g.cols || rows !== g.rows) {
      const start = this.section === 'fox' ? 0 : 1
      g.cells = new Uint8Array(cols * rows).fill(start)
      g.cols = cols
      g.rows = rows
      g.total = cols * rows
      g.snow = start ? g.total : 0
    }
    g.gx = stage.w / 2
    g.gy = stage.ground
    const owl = this.els['owl-root']
    owl?.setAttribute('transform', `translate(${stage.owl.x} ${stage.owl.y}) scale(${stage.owl.s})`)
    this.els.sun?.setAttribute('transform', `translate(${stage.sun[0]} ${stage.sun[1]})`)
  }

  // -------------------------------------------------------------- her finger

  toStage(e: { clientX: number; clientY: number }): [number, number] {
    const m = this.svg.getScreenCTM()
    if (!m) return [0, 0]
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    return [p.x, p.y]
  }

  local(c: Coat, x: number, y: number): [number, number] {
    return [(x - c.x) / (c.s * c.dir), (y - c.y) / c.s]
  }

  down(e: RPointerEvent) {
    if (this.finger || this.phase === 'end') return
    const [x, y] = this.toStage(e)
    this.finger = { id: e.pointerId, x, y, sx: e.clientX, sy: e.clientY, t0: this.now, tl: this.now, moved: 0, last: null }
    this.speed = 0
    this.owlStroke = false
    this.paint(x, y)
  }

  move(e: RPointerEvent) {
    const f = this.finger
    if (!f || f.id !== e.pointerId) return
    const [x, y] = this.toStage(e)
    const d = Math.hypot(x - f.x, y - f.y)
    f.moved = Math.max(f.moved, Math.hypot(e.clientX - f.sx, e.clientY - f.sy))
    if (d < BRUSH.spacing) return
    this.paint(x, y)
  }

  up(e: RPointerEvent) {
    const f = this.finger
    if (!f || f.id !== e.pointerId) return
    for (const c of this.coats) this.endSeg(c.seg, BRUSH.size / c.s, () => (c.seg = null))
    this.endSeg(this.ground.seg, BRUSH.size, () => (this.ground.seg = null))
    if (f.moved < 14 && this.now - f.t0 < 0.4) this.poke(f.x, f.y)
    this.finger = null
    this.speed = 0
  }

  private endSeg(seg: Seg | null, size: number, clear: () => void) {
    if (!seg) return
    seg.el.setAttribute('d', outline(seg.pts, size, true))
    clear()
  }

  private newSeg(into: SVGGElement | null): Seg | null {
    if (!into) return null
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    el.setAttribute('fill', this.mode === 'snow' ? 'white' : 'black')
    into.appendChild(el)
    return { el, pts: [] }
  }

  /** Her finger at stage (x, y): add it to the stroke on everything under the brush, and mark the cells it covers. */
  private paint(x: number, y: number) {
    const f = this.finger!
    const dt = Math.max(1 / 120, this.now - f.tl)
    if (f.last) this.speed = this.speed * 0.6 + (Math.hypot(x - f.x, y - f.y) / dt) * 0.4
    f.tl = this.now
    const prev = f.last ?? [x, y]
    f.x = x
    f.y = y
    f.last = [x, y]
    this.lastRub = this.now
    const r = BRUSH.size / 2
    if (this.phase === 'dusk' || this.phase === 'end') return
    for (const c of this.coats) {
      const [lx, ly] = this.local(c, x, y)
      const rl = r / c.s
      const b = c.shape.box
      const inside = lx > b.x - rl && lx < b.x + b.w + rl && ly > b.y - rl && ly < b.y + b.h + rl
      if (!inside || c.done) {
        this.endSeg(c.seg, BRUSH.size / c.s, () => (c.seg = null))
        continue
      }
      if (!c.seg) c.seg = this.newSeg(c.els.strokes)
      if (!c.seg) continue
      c.seg.pts.push([lx, ly])
      c.seg.el.setAttribute('d', outline(c.seg.pts, BRUSH.size / c.s, false))
      const [px, py] = this.local(c, prev[0], prev[1])
      this.markCoat(c, px, py, lx, ly, rl * BRUSH.reach)
      this.lastTouched = c
    }
    // The ground (below the ground line): snow in winter, melt in summer.
    const g = this.ground
    if (y > this.stage.ground - r) {
      const gx = x - g.gx
      const gy = y - g.gy
      if (!g.seg) g.seg = this.newSeg(g.strokes)
      if (g.seg) {
        g.seg.pts.push([gx, gy])
        g.seg.el.setAttribute('d', outline(g.seg.pts, BRUSH.size, false))
        this.markGround(prev[0] - g.gx, prev[1] - g.gy, gx, gy, r * BRUSH.reach)
      }
    } else this.endSeg(g.seg, BRUSH.size, () => (g.seg = null))
    // The snowy owl stays white: rubbing sunshine on it gets a head shake.
    if (this.section === 'summer' && !this.owlStroke) {
      const o = this.stage.owl
      const lx = (x - o.x) / o.s
      const ly = (y - o.y) / o.s
      if (inShape(SHAPES.owl, lx, ly)) {
        this.owlStroke = true
        this.owlSaysNo()
      }
    }
    if (Math.random() < 0.18) noise(0.08, 0.035, 'bandpass', this.mode === 'snow' ? 2600 : 1600, this.mode === 'snow' ? 3400 : 2200, 0, 1.2)
  }

  private markCoat(c: Coat, x0: number, y0: number, x1: number, y1: number, r: number) {
    const g = c.grid
    const val = this.mode === 'snow' ? 1 : 0
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / (g.cell * 0.5)))
    for (let k = 0; k <= n; k++) {
      const px = x0 + ((x1 - x0) * k) / n
      const py = y0 + ((y1 - y0) * k) / n
      const c0 = Math.max(0, Math.floor((px - r - g.x0) / g.cell))
      const c1 = Math.min(g.cols - 1, Math.floor((px + r - g.x0) / g.cell))
      const r0 = Math.max(0, Math.floor((py - r - g.y0) / g.cell))
      const r1 = Math.min(g.rows - 1, Math.floor((py + r - g.y0) / g.cell))
      for (let row = r0; row <= r1; row++) {
        for (let col = c0; col <= c1; col++) {
          const i = g.index[row * g.cols + col]
          if (i < 0 || c.cells[i] === val) continue
          if (Math.hypot(g.xs[i] - px, g.ys[i] - py) > r) continue
          c.cells[i] = val
          c.white += val ? 1 : -1
        }
      }
    }
    const share = this.share(c)
    const step = Math.floor(share * 5)
    if (step > c.step) {
      c.step = step
      sounds.note(step * 2)
    }
    if (share >= COAT.finish) this.finishCoat(c)
  }

  private markGround(x0: number, y0: number, x1: number, y1: number, r: number) {
    const g = this.ground
    const val = this.mode === 'snow' ? 1 : 0
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / (GROUND_CELL * 0.5)))
    const left = -this.stage.w / 2
    for (let k = 0; k <= n; k++) {
      const px = x0 + ((x1 - x0) * k) / n
      const py = y0 + ((y1 - y0) * k) / n
      const c0 = Math.max(0, Math.floor((px - r - left) / GROUND_CELL))
      const c1 = Math.min(g.cols - 1, Math.floor((px + r - left) / GROUND_CELL))
      const r0 = Math.max(0, Math.floor((py - r) / GROUND_CELL))
      const r1 = Math.min(g.rows - 1, Math.floor((py + r) / GROUND_CELL))
      for (let row = r0; row <= r1; row++) {
        for (let col = c0; col <= c1; col++) {
          const i = row * g.cols + col
          if (g.cells[i] === val) continue
          const cx = left + (col + 0.5) * GROUND_CELL
          const cy = (row + 0.5) * GROUND_CELL
          if (Math.hypot(cx - px, cy - py) > r) continue
          g.cells[i] = val
          g.snow += val ? 1 : -1
          if (!val && Math.random() < COAT.flowers) this.flower(cx + (Math.random() - 0.5) * GROUND_CELL, cy + (Math.random() - 0.5) * GROUND_CELL * 0.6)
        }
      }
    }
  }

  /** How done a coat is: white in winter, brown in the summer. */
  share(c: Coat) {
    const w = c.white / c.cells.length
    return this.mode === 'snow' ? w : 1 - w
  }

  private finishCoat(c: Coat) {
    if (c.done) return
    c.done = true
    c.finishT = this.now
    c.cells.fill(this.mode === 'snow' ? 1 : 0)
    c.white = this.mode === 'snow' ? c.cells.length : 0
    this.endSeg(c.seg, BRUSH.size / c.s, () => (c.seg = null))
    c.anim = { kind: 'hop', t0: this.now + 0.15 }
    sounds.sparkle()
    setTimeout(() => sfx.boing(), 200)
    if (this.section === 'fox') {
      this.ground.settleV = Math.max(this.ground.settleV, 0.6)
      setTimeout(() => this.ev.section('hide', 'fox'), 2600)
    } else if (this.section === 'hide') {
      this.ev.section('hide', this.coats.filter((k) => k.done).map((k) => k.id).join(','))
    } else if (this.coats.every((k) => k.done)) this.summerDone()
  }

  private flower(x: number, y: number) {
    const g = this.ground.flowers
    if (!g || g.childElementCount > 140) return
    const colors = ['#FF8FC3', '#FFD84D', '#C9A7FF', '#FFFFFF', '#FF9E7A']
    const col = colors[Math.floor(Math.random() * colors.length)]
    const ns = 'http://www.w3.org/2000/svg'
    const fl = document.createElementNS(ns, 'g')
    fl.setAttribute('transform', `translate(${x.toFixed(0)} ${y.toFixed(0)})`)
    const inner = document.createElementNS(ns, 'g')
    inner.setAttribute('class', 'coats-pop')
    const sz = 0.8 + Math.random() * 0.5
    inner.innerHTML = `<path d="M0 0 V${-26 * sz}" stroke="#5E8C3A" stroke-width="4" stroke-linecap="round"/>${[0, 72, 144, 216, 288]
      .map((a) => `<circle cx="${(Math.cos((a * Math.PI) / 180) * 8 * sz).toFixed(1)}" cy="${(-26 * sz + Math.sin((a * Math.PI) / 180) * 8 * sz).toFixed(1)}" r="${6.5 * sz}" fill="${col}" stroke="#4A3B57" stroke-width="2.5"/>`)
      .join('')}<circle cx="0" cy="${-26 * sz}" r="${4.5 * sz}" fill="#FFC93C" stroke="#4A3B57" stroke-width="2"/>`
    fl.appendChild(inner)
    g.appendChild(fl)
    if (Math.random() < 0.5) tone(900 + Math.random() * 500, 1600, 0.1, 0.05, 'sine')
  }

  private summerDone() {
    this.phase = 'end'
    this.ev.phase('end')
    const g = this.ground
    g.finishT = this.now
    sounds.fanfare()
    burst()
    const w = this.stage.w
    for (let i = 0; i < 26; i++) setTimeout(() => this.flower((Math.random() - 0.5) * w * 0.95, 20 + Math.random() * (this.stage.h - this.stage.ground - 60)), i * 60)
    this.coats.forEach((c, i) => (c.anim = { kind: 'hop', t0: this.now + 0.3 + i * 0.15 }))
  }

  private owlSaysNo() {
    this.owlAnim = { kind: 'nope', t0: this.now }
    this.owlNoteAt = this.now
    this.ev.note(true)
    tone(700, 520, 0.12, 0.08, 'triangle')
    tone(700, 520, 0.12, 0.08, 'triangle', 0.16)
  }

  private poke(x: number, y: number) {
    for (const c of [...this.coats].reverse()) {
      const [lx, ly] = this.local(c, x, y)
      if (!inShape(c.shape, lx, ly)) continue
      c.anim = { kind: Math.random() < 0.5 ? 'giggle' : 'hop', t0: this.now }
      this.squeak(c.id)
      this.ev.poked(c.id)
      return
    }
    const b = this.bear
    if (b.state !== 'off') {
      const s = this.stage.bear.s
      const lx = (x - b.x) / (s * b.dir)
      const ly = (y - this.stage.bear.y) / s
      if (inShape(SHAPES.bear, lx, ly) || Math.hypot(lx - 180, ly + 160) < 80) {
        b.huff = this.now
        noise(0.25, 0.12, 'lowpass', 500, 200)
        this.ev.poked('bear')
        return
      }
    }
    if (this.section === 'summer') {
      const o = this.stage.owl
      if (inShape(SHAPES.owl, (x - o.x) / o.s, (y - o.y) / o.s)) return this.owlSaysNo()
      const [sx, sy] = this.stage.sun
      if (Math.hypot(x - sx, y - sy) < 110) {
        this.sunPulse = this.now
        sounds.sparkle()
        return
      }
    }
    if (this.phase === 'dusk' && y < this.stage.ground) {
      this.aurora = this.now
      sounds.sparkle()
      return
    }
    // The sky puffs snowflakes (sparkles in summer); the land does too, and the first time Sparkle says who lives here.
    this.puff(x, y)
    sounds.pop()
    if (y > this.stage.ground - 220) this.ev.poked('land')
  }

  /** Each animal's own little sound when it's poked or giggles. */
  private squeak(id: CoatId) {
    const v = VOICE[id]
    tone(v.f, v.to, 0.09, 0.07, v.type)
    tone(v.f * 1.15, v.to * 1.2, 0.09, 0.06, v.type, 0.12)
  }

  /** A little burst of snowflakes (or sparkles in summer) where she tapped the sky. */
  private puff(x: number, y: number) {
    const ns = 'http://www.w3.org/2000/svg'
    const g = document.createElementNS(ns, 'g')
    g.setAttribute('transform', `translate(${x.toFixed(0)} ${y.toFixed(0)})`)
    const col = this.mode === 'snow' ? '#fff' : '#FFE27A'
    g.innerHTML = Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2
      return `<circle class="coats-fly" style="--dx:${(Math.cos(a) * 60).toFixed(0)}px;--dy:${(Math.sin(a) * 60).toFixed(0)}px" r="9" fill="${col}" stroke="#9FB4D6" stroke-width="2"/>`
    }).join('')
    this.svg.querySelector('[data-k="fx"]')?.appendChild(g)
    setTimeout(() => g.remove(), 800)
  }

  // -------------------------------------------------------------- every frame

  tick(dt: number) {
    this.now += dt
    const now = this.now
    const st = this.stage
    // Falling snow (fox and hide), more and more in the fox section.
    const want = this.section === 'summer' ? 0 : this.section === 'fox' ? Math.min(1, 0.25 + (now / Math.max(5, COAT.settle)) * 0.9) : this.phase === 'dusk' ? 0.35 : 0.6
    const { x: vx, y: vy, w: vw, h: vh } = this.vb
    this.flakes.forEach((fl, i) => {
      const on = i / this.flakes.length < want
      fl.y += (fl.vy * dt * 90) / vh
      if (fl.y > 1) {
        fl.y -= 1
        fl.x = Math.random()
      }
      const x = vx + fl.x * vw + Math.sin(now * 1.2 + fl.ph) * 18
      const y = vy + fl.y * vh
      fl.el.setAttribute('transform', `translate(${x.toFixed(0)} ${y.toFixed(0)})`)
      fl.el.setAttribute('opacity', on ? '0.95' : '0')
    })
    // The ground: snow settles by itself while she paints the fox; in summer it all melts at the end.
    const g = this.ground
    if (this.section === 'fox') {
      const target = this.coats[0]?.done ? 1 : Math.min(0.85, now / COAT.settle)
      g.settleV += (target - g.settleV) * Math.min(1, dt * (this.coats[0]?.done ? 1.5 : 3))
      g.settle?.setAttribute('opacity', g.settleV.toFixed(3))
    }
    if (g.finishT >= 0) g.finish?.setAttribute('opacity', ease((now - g.finishT) / 1.6).toFixed(3))
    // The far hills follow the ground: snowy as the snow settles, green as she melts it.
    const alt = this.els['hills-alt']
    if (alt) {
      const melted = g.finishT >= 0 ? ease((now - g.finishT) / 1.6) : 0
      alt.setAttribute('opacity', (this.section === 'fox' ? g.settleV : Math.min(1, (g.snow / Math.max(1, g.total)) * 1.15) * (1 - melted)).toFixed(3))
    }
    for (const c of this.coats) this.tickCoat(c, dt)
    this.tickBear(dt)
    this.tickOwl()
    // Dusk (the payoff of hide and seek).
    const duskTarget = this.phase === 'dusk' ? 1 : 0
    this.dusk += (duskTarget - this.dusk) * Math.min(1, dt * 0.8)
    this.els.dusk?.setAttribute('opacity', this.dusk.toFixed(3))
    const au = this.els.aurora
    if (au) {
      const kick = Math.max(0, 1 - (now - this.aurora) / 1.5)
      au.setAttribute('opacity', (this.dusk * (0.55 + 0.25 * Math.sin(now * 0.9) + 0.3 * kick)).toFixed(3))
      au.setAttribute('transform', `translate(${(Math.sin(now * 0.3) * 40).toFixed(1)} 0) skewX(${(Math.sin(now * 0.5) * 6 + kick * 8 * Math.sin(now * 12)).toFixed(2)})`)
    }
    const sun = this.els.sun
    if (sun) {
      const k = Math.max(0, 1 - (now - this.sunPulse) / 0.6)
      sun.setAttribute('transform', `translate(${st.sun[0]} ${st.sun[1]}) rotate(${(now * 8).toFixed(1)}) scale(${(1 + 0.18 * k * Math.sin(k * 9)).toFixed(3)})`)
    }
    if (now - this.owlNoteAt > 3.2 && this.owlNoteAt > 0) {
      this.owlNoteAt = -9
      this.ev.note(false)
    }
    // Stuck for 8 s: a hand rubs over the coat that needs it most.
    const hint = this.els.hint
    if (hint) {
      const todo = this.coats.filter((c) => !c.done && !c.run).sort((a, b) => this.share(a) - this.share(b))[0]
      const show = this.phase === 'play' && !this.finger && todo && now - this.lastRub > 8
      if (show) {
        const b = todo.shape.box
        const cx = todo.x + (b.x + b.w / 2) * todo.s * todo.dir + Math.sin(now * 3) * b.w * 0.25 * todo.s
        const cy = todo.y + (b.y + b.h * 0.45) * todo.s
        hint.setAttribute('transform', `translate(${cx.toFixed(0)} ${cy.toFixed(0)})`)
      }
      hint.setAttribute('opacity', show ? '1' : '0')
    }
    // The dusk lasts a while, then the sun rises by itself (the ☀️ button skips it).
    if (this.phase === 'dusk' && now - this.phaseAt > 14) this.ev.section('summer')
  }

  private tickCoat(c: Coat, dt: number) {
    const now = this.now
    // Running away from the bear: little hops to its new spot.
    let x = c.x
    let hopY = 0
    if (c.run) {
      const p = (now - c.run.t0) / c.run.dur
      if (p >= 1) {
        c.x = c.run.x1
        c.run = null
        c.dir = c.x > this.stage.w / 2 ? -1 : 1
        x = c.x
      } else {
        x = c.run.x0 + (c.run.x1 - c.run.x0) * ease(p)
        c.dir = c.run.x1 > c.run.x0 ? 1 : -1
        hopY = -Math.abs(Math.sin(p * Math.PI * 5)) * 26
      }
    }
    // The body's action: squash and stretch around the feet.
    let sx = 1
    let sy = 1
    let ty = hopY
    let rot = 0
    if (c.anim) {
      const t = now - c.anim.t0
      if (t >= 0) {
        if (c.anim.kind === 'hop') {
          const p = t / 0.6
          if (p >= 1) c.anim = null
          else {
            sy = p < 0.2 ? 1 - 0.18 * (p / 0.2) : p < 0.75 ? 1.08 : 1 - 0.12 * Math.sin(((p - 0.75) / 0.25) * Math.PI)
            sx = 2 - sy
            if (p >= 0.2 && p < 0.75) ty += -60 * Math.sin(((p - 0.2) / 0.55) * Math.PI)
          }
        } else {
          const p = t / 0.7
          if (p >= 1) c.anim = null
          else rot = 7 * Math.sin(t * 30) * (1 - p)
        }
      }
    } else if (!c.run) {
      // Breathing.
      sy = 1 + Math.sin(now * 2.4 + c.rig.ph) * 0.016
      sx = 1 - Math.sin(now * 2.4 + c.rig.ph) * 0.008
    }
    c.els.root.setAttribute('transform', `translate(${x.toFixed(1)} ${c.y}) scale(${(c.s * c.dir).toFixed(3)} ${c.s.toFixed(3)})`)
    c.els.body.setAttribute('transform', `translate(0 ${ty.toFixed(1)}) rotate(${rot.toFixed(2)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)})`)
    // The rest of the coat puffs on when it finished itself.
    if (c.finishT >= 0) {
      const p = ease((now - c.finishT) / 0.7)
      c.els.finish.setAttribute('opacity', p.toFixed(3))
      if (p >= 1) {
        c.els.strokes.replaceChildren()
        c.finishT = -100
      }
    }
    // Ink: in hide and seek a white coat fades into the snow; in the summer brown brings the outline back.
    const share = this.share(c)
    let inkT = 0
    if (this.section === 'hide') inkT = c.done ? 1 : ease((share - 0.3) / Math.max(0.05, COAT.finish - 0.3)) * 0.55
    else if (this.section === 'summer') inkT = c.done ? 0 : 1 - Math.min(1, share * 3.5)
    c.ink += (inkT - c.ink) * Math.min(1, dt * 3)
    c.els.root.style.setProperty('--ci', lerpInk(c.ink))
    // Fluff where the coat is white.
    const fr = COAT.fluff
    const sw = 5 / c.s
    c.grid.edge.forEach((e, i) => {
      const target = c.cells[e] ? 1 : 0
      let f = c.fluff[i]
      if (f === target) return
      f += (target - f) * Math.min(1, dt * 7)
      if (Math.abs(f - target) < 0.01) f = target
      c.fluff[i] = f
      const r = fr * f
      c.els.fw[i]?.setAttribute('r', r > 0.01 ? r.toFixed(2) : '0')
      c.els.fi[i]?.setAttribute('r', r > 0.5 ? (r + sw).toFixed(2) : '0')
    })
    // The puppet: the head looks round (toward her finger), the tail swishes and flops after a hop or streams back in a
    // run, the eyes blink (more often at dusk, when only the eyes show) and squeeze in a giggle. While she rubs it, it
    // holds nearly still.
    const r = c.rig
    const still = c.seg ? 0.25 : 1
    const f = this.finger
    let look: [number, number] = [Math.sin(now * 0.5 + r.ph) * 0.4, 0.1]
    let headTo = 0
    if (f) {
      const [lx, ly] = this.local(c, f.x, f.y)
      const e = r.eyes[0]
      if (e) {
        look = [Math.max(-1, Math.min(1, (lx - e.x) / 160)), Math.max(-1, Math.min(1, (ly - e.y) / 160))]
        headTo = look[1] * 5
      }
    }
    let head = still * Math.sin(now * 1.1 + r.ph) * 3 + headTo
    let headY = 0
    let tailTo = still * Math.sin(now * 1.7 + r.ph) * 6
    let eyes = blink(r, now, this.phase === 'dusk')
    let open = false
    if (c.run) {
      tailTo = 22
      head = -4
      open = true
    }
    if (c.anim && now >= c.anim.t0) {
      const t = now - c.anim.t0
      if (c.anim.kind === 'hop') {
        const p = t / 0.6
        // The head lags the jump and nods on the landing; the tail flies up.
        head += p < 0.2 ? 3 : p < 0.75 ? -6 : 5 * Math.sin(((p - 0.75) / 0.25) * Math.PI)
        headY = p < 0.2 ? 3 : p < 0.75 ? -4 : 0
        tailTo = p < 0.75 ? 26 : -8
        open = p > 0.15 && p < 0.9
      } else {
        eyes = Math.min(eyes, 0.35)
        open = true
        head += Math.sin(t * 26) * 4
      }
    }
    r.tailV += ((tailTo - r.tail0) * 90 - r.tailV * 9) * dt
    r.tail0 += r.tailV * dt
    poseRig(r, head, headY, r.tail0, eyes, look, open)
  }

  private tickOwl() {
    const body = this.els['owl-body']
    if (!body) return
    // An owl turns its head right round to look: a slow look about, a quick "no no" shake when she rubs sunshine on it.
    let rot = Math.sin(this.now * 0.6) * 6
    let open = false
    if (this.owlAnim) {
      const t = this.now - this.owlAnim.t0
      if (t > 0.9) this.owlAnim = null
      else {
        rot = 16 * Math.sin(t * 20) * (1 - t / 0.9)
        open = true
      }
    }
    body.setAttribute('transform', `translate(0 -20) scale(${(1 - Math.sin(this.now * 2) * 0.008).toFixed(3)} ${(1 + Math.sin(this.now * 2) * 0.016).toFixed(3)})`)
    const r = this.owlRig
    if (r) poseRig(r, rot, 0, 0, this.owlAnim ? 0.55 : blink(r, this.now, false), [Math.sin(this.now * 0.6) * 0.6, 0], open)
  }

  // -------------------------------------------------------------- the polar bear

  private tickBear(dt: number) {
    const b = this.bear
    const st = this.stage
    const s = st.bear.s
    const now = this.now
    if (this.section !== 'hide') return this.drawBear(0, 0, 0)
    if (b.state === 'off') {
      b.cooldown -= dt
      const ready = this.phase === 'play' && b.cooldown <= 0 && this.coats.every((c) => this.share(c) >= 0.5) && (this.coats.every((c) => c.done) || now - this.lastRub > COAT.bearWait) && !this.finger
      if (ready) {
        b.state = 'walk'
        b.x = b.dir > 0 ? this.vb.x - 300 * s : this.vb.x + this.vb.w + 300 * s
        b.visit = [...this.coats].sort((p, q) => (p.x - q.x) * b.dir)
        b.at = 0
        b.found = false
        this.phase = 'bear'
        this.ev.phase('bear')
      }
      return this.drawBear(0, 0, 0)
    }
    const nose = 256 * s
    let head = 0
    let q = 0
    if (b.state === 'walk' || b.state === 'leave') {
      b.x += b.dir * COAT.bearSpeed * dt
      b.walked += COAT.bearSpeed * dt
      const target = b.state === 'walk' ? b.visit[b.at] : null
      if (target && !target.run && (b.x + nose * b.dir - target.x) * b.dir >= 0) {
        b.state = 'sniff'
        b.t = 0
        b.found = false
        ;[0, 0.18, 0.36].forEach((d) => noise(0.09, 0.08, 'bandpass', 1400, 900, d, 2))
      } else if (target && target.run) b.at++
      if (b.state === 'walk' && b.at >= b.visit.length) b.state = 'leave'
      const off = b.dir > 0 ? b.x > this.vb.x + this.vb.w + 320 * s : b.x < this.vb.x - 320 * s
      if (b.state === 'leave' && off) {
        b.state = 'off'
        b.dir = -b.dir
        b.cooldown = 3
        if (this.coats.every((c) => c.done)) {
          this.phase = 'dusk'
          this.phaseAt = now
          this.ev.phase('dusk')
          sounds.sparkle()
        } else {
          this.phase = 'play'
          this.ev.phase('play')
        }
      }
    } else if (b.state === 'sniff') {
      b.t += dt
      const c = b.visit[b.at]
      const decide = COAT.sniff * 0.6
      head = 16 + Math.sin(b.t * 24) * 5
      if (b.t >= decide && !b.found) {
        b.found = true
        if (c.done) {
          // Nobody here! He looks round, puzzled.
          tone(330, 250, 0.3, 0.08, 'triangle')
          this.ev.sniffed('missed')
        } else {
          // Brown showing: a giggle and off it runs (never caught). He'll come back for it.
          this.squeak(c.id)
          setTimeout(() => this.squeak(c.id), 220)
          this.ev.sniffed('ran')
          // A free spot on its own row, behind the bear (he has already looked there).
          let away = c.x
          let best = -Infinity
          for (let i = 0; i <= 10; i++) {
            const x = st.w * (0.1 + 0.08 * i)
            const free = Math.min(...this.coats.filter((o) => o !== c).map((o) => Math.hypot((o.run ? o.run.x1 : o.x) - x, (o.y - c.y) * 2)))
            const score = Math.min(free, 420) + ((x - b.x) * b.dir < 0 ? 300 : 0) - Math.abs(x - c.x) * 0.15
            if (score > best) [best, away] = [score, x]
          }
          c.run = { x0: c.x, x1: away, t0: now, dur: 1 }
          c.anim = null
        }
      }
      if (b.t >= decide) {
        head = c.done ? -10 + Math.sin(b.t * 5) * 8 : -4
        q = c.done ? Math.min(1, (b.t - decide) * 4) : 0
      }
      if (b.t >= COAT.sniff) {
        b.at++
        b.state = 'walk'
      }
    }
    const huff = Math.max(0, 1 - (now - b.huff) / 0.5)
    this.drawBear(head - huff * 12 * Math.sin(huff * 10), q, b.state === 'sniff' ? 0 : Math.abs(Math.sin(b.walked / 40)) * 7)
  }

  private drawBear(head: number, q: number, bob: number) {
    const b = this.bear
    const st = this.stage
    const s = st.bear.s
    const on = this.section === 'hide' && b.state !== 'off'
    this.els['bear-root']?.setAttribute('transform', `translate(${b.x.toFixed(1)} ${st.bear.y}) scale(${(s * b.dir).toFixed(3)} ${s})`)
    this.els['bear-root']?.setAttribute('opacity', on ? '1' : '0')
    this.els['bear-body']?.setAttribute('transform', `translate(0 ${(-bob).toFixed(1)})`)
    const r = this.bearRig
    if (r && on) {
      // Sniffing, his nose twitches; puzzled, he looks round with his mouth open ("?"); a huff when she pokes him.
      const sniff = b.state === 'sniff' && !b.found
      const huff = this.now - b.huff < 0.5
      poseRig(r, head, sniff ? Math.sin(this.now * 30) * 2 : 0, Math.sin(this.now * 3) * 8, q > 0 ? 1 : blink(r, this.now, false), q > 0 ? [Math.sin(this.now * 4), -0.6] : [0.8, 0.4], q > 0.5 || huff)
    }
    const qe = this.els['bear-q']
    if (qe) {
      qe.setAttribute('opacity', (on ? q : 0).toFixed(2))
      qe.setAttribute('transform', `translate(${(b.x + 170 * s * b.dir).toFixed(0)} ${(st.bear.y - 300 * s - q * 12).toFixed(0)})`)
    }
  }

  qa() {
    return {
      section: this.section,
      phase: this.phase,
      coats: Object.fromEntries(this.coats.map((c) => [c.id, +this.share(c).toFixed(3)])),
      done: this.coats.filter((c) => c.done).map((c) => c.id),
      ground: +(this.ground.snow / Math.max(1, this.ground.total)).toFixed(3),
      bear: this.bear.state,
    }
  }
}

// ---------------------------------------------------------------- the React side

const FLAKES = 80

/** `onDone` (Place.tsx): the stamp, a few seconds after the summer's fanfare. */
export function SnowCoats({ onDone }: ActivityProps) {
  const { start, param, enter } = useSections(COATS_SECTIONS)
  const [run, setRun] = useState(() => ({ section: (start ?? 'fox') as CoatsSection, painted: (param('painted') || '').split(',').filter(Boolean), n: 0 }))
  const [phase, setPhase] = useState<Phase>('play')
  const guide = useRef<GuideHandle>(null)
  const alive = useAlive()
  const talk = useRef({ ran: -99, owl: -99 })
  const box = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const world = useRef<CoatsWorld | null>(null)
  const size = useElementSize(box)
  const wide = !size.height || size.width / size.height >= 1.05
  const stage = wide ? WIDE : TALL
  const mid = `coats${run.n}`

  // The view box: the stage scaled to fit, the extra edge filled with more sky and snow.
  const k = size.width && size.height ? Math.min(size.width / stage.w, size.height / stage.h) : 1
  const vw = size.width ? size.width / k : stage.w
  const vh = size.height ? size.height / k : stage.h
  const vb = { x: (stage.w - vw) / 2, y: (stage.h - vh) / 2, w: vw, h: vh }

  // Each part starts with one short line from Sparkle, then her hands are busy.
  useEffect(() => {
    enter(run.section, run.section === 'hide' ? { painted: run.painted.join(',') } : {})
    const t = setTimeout(() => guide.current?.speak(START[run.section]), 400)
    return () => clearTimeout(t)
  }, [run])

  useLayoutEffect(() => {
    if (!svg.current) return
    const say = (l: Line, gap: 'ran' | 'owl') => {
      const now = performance.now() / 1000
      if (now - talk.current[gap] < 7) return
      talk.current[gap] = now
      guide.current?.speak(l)
    }
    const w = new CoatsWorld(svg.current, stage, run.section, run.painted, {
      section: (s, painted) => {
        if (s === world.current?.section) {
          enter(s, { painted: painted ?? '' })
          return
        }
        setPhase('play')
        setRun((r) => ({ section: s, painted: (painted ?? '').split(',').filter(Boolean), n: r.n + 1 }))
      },
      phase: (p) => {
        setPhase(p)
        if (p === 'bear') guide.current?.speak(L.coats.hide.bear)
        else if (p === 'dusk') guide.current?.speak(L.coats.hide.gone)
        else if (p === 'end') {
          guide.current?.speak(L.coats.summer.end)
          setTimeout(() => alive() && onDone(), DONE_AFTER_S * 1000)
        }
      },
      note: (show) => show && say(L.coats.summer.owl, 'owl'),
      poked: (what) => guide.current?.once(`coats-${what}`, L.coats.facts[what]),
      sniffed: (found) => (found === 'ran' ? say(L.coats.hide.ran, 'ran') : guide.current?.once('coats-camo', L.coats.facts.camo)),
    })
    w.vb = vb
    world.current = w
    const qa = () => w.qa()
    ;(window as unknown as { __polesCoatsQA?: () => unknown }).__polesCoatsQA = qa
    const unwatch = watch('coats', () => {
      const c = w.lastTouched
      return { finger: [w.finger ? w.speed : 0, 4000], brush: [BRUSH.size, 240], coat: [c ? w.share(c) : 0, 1], ground: [w.ground.snow / Math.max(1, w.ground.total), 1] }
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

  // Turning the iPad: the same animals (their paint is in their own units) stand on the other stage.
  useEffect(() => {
    const w = world.current
    if (!w) return
    w.vb = vb
    if (w.stage !== stage) w.setStage(stage)
  })

  const toSummer = () => {
    setPhase('play')
    setRun((r) => ({ section: 'summer', painted: [], n: r.n + 1 }))
  }

  const again = () => {
    setPhase('play')
    setRun((r) => ({ section: 'fox', painted: [], n: r.n + 1 }))
  }

  const section = run.section
  const summer = section === 'summer'
  const scene = SCENES[section]
  const big = 6000
  const ids: CoatId[] = section === 'fox' ? ['fox'] : [...COAT_IDS].sort((a, b) => stage.spots[a].y - stage.spots[b].y)
  const g0 = stage.ground
  // The painted hills keep about the same height on every screen (stretched a little sideways on a very wide one).
  const hillsH = wide ? 700 : 760

  return (
    <div ref={box} style={{ position: 'absolute', inset: 0, background: SKY[scene.from], overflow: 'clip' }}>
      <style>{CSS}</style>
      <svg
        key={run.n}
        ref={svg}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        aria-label={section === 'summer' ? 'Rub the summer back' : 'Rub the snow on'}
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
          <linearGradient id={`${mid}-dusk`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#252E5E" />
            <stop offset="1" stopColor="#7A6AA6" />
          </linearGradient>
          <linearGradient id={`${mid}-aurora`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7DFFC8" stopOpacity="0" />
            <stop offset="0.5" stopColor="#7DFFC8" stopOpacity="0.8" />
            <stop offset="1" stopColor="#C98BFF" stopOpacity="0" />
          </linearGradient>
          <mask id={`${mid}-ground`} maskUnits="userSpaceOnUse" x={-big} y={-200} width={big * 2} height={big}>
            <rect x={-big} y={-200} width={big * 2} height={big} fill={section === 'fox' ? 'black' : 'white'} />
            {section === 'fox' && <rect data-k="ground-settle" x={-big} y={-200} width={big * 2} height={big} fill="white" opacity={0} />}
            <g data-k="ground-strokes" />
            <rect data-k="ground-finish" x={-big} y={-200} width={big * 2} height={big} fill={summer ? 'black' : 'white'} opacity={0} />
          </mask>
        </defs>
        {/* The painted sky and far hills (the season she starts in), and the winter ones over them that come and go
            with the snow on the ground (settling while she paints the fox, melting in the summer). */}
        <Backdrop scene={scene.from} vb={vb} g0={g0} h={hillsH} big={big} />
        {scene.to && (
          <g data-k="hills-alt" opacity={section === 'summer' ? 1 : 0}>
            <Backdrop scene={scene.to} vb={vb} g0={g0} h={hillsH} big={big} />
          </g>
        )}
        {/* Dusk and the northern lights. */}
        <rect data-k="dusk" x={-big} y={-big} width={big * 2} height={big + g0} fill={`url(#${mid}-dusk)`} opacity={0} />
        <g data-k="aurora" opacity={0}>
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${-200 + i * 120} ${g0 * 0.42 + i * 40} C ${stage.w * 0.25} ${g0 * 0.12 + i * 30}, ${stage.w * 0.55} ${g0 * 0.55 - i * 20}, ${stage.w + 200} ${g0 * 0.2 + i * 50} l 0 ${-140 + i * 20} C ${stage.w * 0.55} ${g0 * 0.35 - i * 20}, ${stage.w * 0.25} ${g0 * -0.05 + i * 30}, ${-200 + i * 120} ${g0 * 0.28 + i * 40} Z`} fill={`url(#${mid}-aurora)`} opacity={0.75 - i * 0.18} />
          ))}
        </g>
        {summer && (
          <g data-k="sun" transform={`translate(${stage.sun[0]} ${stage.sun[1]})`}>
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x={-9} y={-150} width={18} height={44} rx={9} fill="#FFD84D" stroke="#4A3B57" strokeWidth={5} transform={`rotate(${i * 30})`} />
            ))}
            <circle r={88} fill="#FFE27A" stroke="#4A3B57" strokeWidth={5} />
          </g>
        )}
        {/* The ground: the painted tundra, the painted snow over it under her strokes, flowers where it melted. */}
        <image href={scene.ground} x={vb.x} y={g0} width={vb.w} height={Math.max(60, vb.y + vb.h - g0)} preserveAspectRatio="xMidYMin slice" />
        <g transform={`translate(${stage.w / 2} ${g0})`}>
          <g mask={`url(#${mid}-ground)`}>
            <rect x={vb.x - stage.w / 2} y={-6} width={vb.w} height={8} fill={SNOW} />
            <image href={art.coats.groundSnow} x={vb.x - stage.w / 2} y={0} width={vb.w} height={Math.max(60, vb.y + vb.h - g0)} preserveAspectRatio="xMidYMin slice" />
          </g>
          <line x1={-big} y1={0} x2={big} y2={0} stroke="#4A3B57" strokeWidth={5} />
          <g data-k="flowers" />
        </g>
        {/* The snowy owl on its rock (summer). */}
        {summer && (
          <g data-k="owl-root" transform={`translate(${stage.owl.x} ${stage.owl.y}) scale(${stage.owl.s})`} style={{ ['--ci' as string]: 'rgb(74,59,87)' }}>
            <path d="M -110 30 Q -100 -20 -40 -20 L 50 -22 Q 110 -16 112 30 Z" fill="#9C93A8" stroke="#4A3B57" strokeWidth={5 / stage.owl.s} strokeLinejoin="round" />
            <AnimalEl id="owl" sh={SHAPES.owl} s={stage.owl.s} />
          </g>
        )}
        {/* The polar bear (hide and seek): white all year, behind the animals. */}
        {section === 'hide' && (
          <>
            <g data-k="bear-root" opacity={0} style={{ ['--ci' as string]: 'rgb(74,59,87)' }}>
              <AnimalEl id="bear" sh={SHAPES.bear} s={stage.bear.s} />
            </g>
            <text data-k="bear-q" opacity={0} fontSize={110} fontWeight={700} textAnchor="middle" fill="#4A3B57" stroke="#fff" strokeWidth={8} paintOrder="stroke" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              ?
            </text>
          </>
        )}
        {/* The coats. */}
        {ids.map((id) => (
          <CoatEl key={id} id={id} mid={mid} base={summer ? 'white' : 'black'} />
        ))}
        {/* Falling snow, pokes, the hint. */}
        <g fill="#fff" stroke="#A8BCD9" strokeWidth={2} pointerEvents="none">
          {Array.from({ length: FLAKES }, (_, i) => (
            <circle key={i} data-k="flake" r={4 + (i % 4) * 2.2} opacity={0} />
          ))}
        </g>
        <g data-k="fx" pointerEvents="none" />
        <g data-k="hint" opacity={0} pointerEvents="none">
          <text fontSize={110} textAnchor="middle" dominantBaseline="middle" className="coats-hint">
            👆
          </text>
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 20 }}>
        {phase === 'dusk' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.5, type: 'spring' }} style={CORNER}>
            <BigButton onClick={toSummer} ariaLabel="Bring the summer back">
              ☀️ ▶
            </BigButton>
          </motion.div>
        )}
        {phase === 'end' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.5, type: 'spring' }} style={CORNER}>
            <BigButton onClick={again} ariaLabel="Again">
              🔁 ❄️
            </BigButton>
          </motion.div>
        )}
      </div>
      <Guide ref={guide} hint={phase === 'play' ? HINT[section] : phase === 'dusk' ? L.coats.hide.dusk : null} quiet={phase === 'bear' || phase === 'end'} />
    </div>
  )
}

type Season = 'late' | 'winter' | 'summer'
/** The flat sky color of each painted backdrop (sampled from its top), which carries on above the picture. */
const SKY: Record<Season, string> = { late: '#C6C0D7', winter: '#BAE1FD', summer: '#92D3FD' }
const HILLS: Record<Season, string> = { late: art.coats.skyLate, winter: art.coats.skyWinter, summer: art.coats.skySummer }
/** Each part's painted scene: the season she starts in (`from`), the winter one over it that comes and goes with the
 *  snow (`to`), and the tundra under the snow she rubs on and off. */
const SCENES: Record<CoatsSection, { from: Season; to?: Season; ground: string }> = {
  fox: { from: 'late', to: 'winter', ground: art.coats.groundLate },
  hide: { from: 'winter', ground: art.coats.groundLate },
  summer: { from: 'summer', to: 'winter', ground: art.coats.groundSummer },
}

/** A painted sky and far hills, standing on the ground line, with its flat sky color carrying on above it. */
function Backdrop({ scene, vb, g0, h, big }: { scene: Season; vb: { x: number; y: number; w: number; h: number }; g0: number; h: number; big: number }) {
  return (
    <>
      <rect x={-big} y={-big} width={big * 2} height={big + g0} fill={SKY[scene]} />
      <image href={HILLS[scene]} x={vb.x} y={g0 - h} width={vb.w} height={h + 4} preserveAspectRatio="none" />
    </>
  )
}

const CSS = `
.coats-pop { animation: coats-pop .45s cubic-bezier(.3,1.6,.5,1) both; transform-box: fill-box; transform-origin: 50% 100%; }
@keyframes coats-pop { from { transform: scale(0) } to { transform: scale(1) } }
.coats-fly { animation: coats-fly .7s ease-out both; }
@keyframes coats-fly { from { transform: translate(0,0) scale(1); opacity: 1 } to { transform: translate(var(--dx), var(--dy)) scale(.3); opacity: 0 } }
.coats-hint { animation: coats-hint 1s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes coats-hint { 0%,100% { transform: scale(1) } 50% { transform: scale(1.15) } }
`

/** The ☀️ and 🔁 buttons wait in the sky's corner, clear of the animals on the snow. */
const CORNER = { position: 'fixed' as const, right: 'calc(var(--safe-right, 0px) + 20px)', top: 'calc(var(--top-clear) + 12px)', pointerEvents: 'auto' as const }

// One alpaca rig for Luna, Paco and Abuela Killa (like australia/puppets/roo.ts for the kangaroos): same body, own
// colors and extras. Drawn by hand in the flat look of the game shelf (src/world/shelf/STYLE.md), like Tika the llama
// (Tika.tsx), whose head, face and ears they share: no dark outlines, form from a base, a shade and a light tone, ink
// only for the little face details. The fleece is made of puffs (fleece.ts) that the salon brushes and snips through
// `rig`.
//
// Two layers so Safari stays smooth with ~90 puffs: the body SVG only repaints when a puff changes, and the head is its
// own small SVG that turns, blinks and talks every frame. Breathing, hops and shivers move the whole root <div> with a
// CSS transform (composited, no repaint).
import { forwardRef, useId, useMemo, useRef, type MutableRefObject } from 'react'
import { bell, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { BODY_MID, FAR_LEGS, HAT_SPOT, HEAD_BOX, makeFleece, NEAR_LEGS, NECK_PIVOT, SHORN_BODY, SHORN_NECK, SHORN_TAIL, VIEW, type Puff } from './fleece'
import { EYE_Y, FACE, HEAD, mouthPath } from './Tika'

export const INK = '#2B2330'

export type AlpacaKind = 'luna' | 'paco' | 'abuela'

interface Look {
  /** Brushed fleece, and the duller color of a tangled, unbrushed puff. */
  fleece: string
  dull: string
  /** The shade on the lower right of every woolly clump, and the light on a brushed one. */
  shade: string
  light: string
  /** The short fleece left after a haircut, and its shade. */
  shorn: string
  shornShade: string
  face: string
  muzzle: string
  sock: string
  hoof: string
  earIn: string
  seed: number
}

// Luna is peach, Paco fur brown and Abuela Killa a soft grape grey: each a base, a shade and a light tone.
export const LOOKS: Record<AlpacaKind, Look> = {
  luna: { fleece: '#FFC2A8', dull: '#F6B296', shade: '#F09D80', light: '#FFE2D4', shorn: '#FFD6C2', shornShade: '#F6B79C', face: '#FFDCC6', muzzle: '#FFF8EE', sock: '#FFF8EE', hoof: '#A46E4B', earIn: '#FF9DBF', seed: 11 },
  paco: { fleece: '#B17D56', dull: '#9F6D49', shade: '#8A5B3D', light: '#D3A47C', shorn: '#C99266', shornShade: '#A9744D', face: '#D3A47C', muzzle: '#FFF1DD', sock: '#FFF1DD', hoof: '#4E3226', earIn: '#F7AFC0', seed: 23 },
  abuela: { fleece: '#8B7FA6', dull: '#7C7096', shade: '#685C85', light: '#B5AACB', shorn: '#A498BD', shornShade: '#8478A0', face: '#F6DCCB', muzzle: '#FFF6EE', sock: '#F7F4FF', hoof: '#4B4160', earIn: '#FFC4DA', seed: 37 },
}

/** The head is Tika's drawing (900 x 1110 units), shrunk onto the alpaca's neck so the eyes sit at (455, 148). */
const HEAD_K = 0.56
const HEAD_AT = `translate(455 141) scale(${HEAD_K}) translate(-610 -300)`
const EAR_L = '500 204'
const EAR_R = '720 204'

export const ALPACA_ACTIONS = { hop: 0.9, giggle: 1.1, shiver: 1.4, nod: 0.7, lean: 1.2, look: 1.8, cheer: 1.3, yawn: 1.8, roll: 1.9, shake: 0.8, sneeze: 0.9 }

/** Things stuck in the fleece before it's brushed. */
export interface StuckItem {
  kind: string
  img: string
  x: number
  y: number
  size: number
}

/** What the salon does to the fleece (no React re-render per puff). */
export interface AlpacaRig {
  puffs: Puff[]
  gone: Set<number>
  brushed: Set<number>
  snip: (id: number) => void
  brush: (id: number) => void
  bangsAside: () => void
  dropItem: (index: number) => void
}

export interface AlpacaProps {
  kind: AlpacaKind
  height: string
  /** Shivering because the fleece is gone and the wind is cold. */
  cold?: boolean
  asleep?: boolean
  /** Eyes closed in a happy hum (leaning into the brush). */
  happy?: boolean
  /** Trotting along (walking in, stepping back): a bouncy step cycle. */
  walking?: boolean
  hat?: string | null
  mustache?: boolean
  /** Luna only: long bangs over her eyes until they're brushed aside. */
  bangs?: boolean
  /** Start with every puff already brushed smooth (Paco and Abuela come brushed). */
  smooth?: boolean
  items?: StuckItem[]
  rig?: MutableRefObject<AlpacaRig | null>
  onTap?: () => void
  label?: string
}

/** Write an attribute or style only when it changes (an unchanged write can still trigger a repaint). */
const last = new WeakMap<Element, Record<string, string>>()
function put(el: Element | undefined, key: string, value: string) {
  if (!el) return
  let memo = last.get(el)
  if (!memo) last.set(el, (memo = {}))
  if (memo[key] === value) return
  memo[key] = value
  if (key === 'transform' && el instanceof HTMLElement) el.style.transform = value
  else el.setAttribute(key, value)
}

type Part = 'root' | 'head' | 'earL' | 'earR' | 'eyesOpen' | 'eyesShut' | 'pupils' | 'mouth' | 'tail' | 'zzz' | 'breath'

export const Alpaca = forwardRef<PuppetHandle, AlpacaProps>(function Alpaca(props, ref) {
  const { kind, height, hat, mustache, bangs = false, smooth: brushedStart = false, items = [], rig, onTap, label } = props
  const look = LOOKS[kind]
  const puffs = useMemo(() => makeFleece(look.seed, bangs), [look.seed, bangs])
  const els = useRef(new Map<number, { ink: SVGElement | null; fill: SVGElement | null; main: SVGElement | null; tangle: SVGElement | null; shine: SVGElement | null }>())
  const itemEls = useRef<(SVGElement | null)[]>([])
  const bangEls = useRef<SVGGElement | null>(null)
  const state = useRef({ gone: new Set<number>(), brushed: new Set<number>(brushedStart ? puffs.map((p) => p.id) : []) })
  const live = useRef(props)
  live.current = props
  const springs = useRef({ earL: spring(150, 9), earR: spring(150, 9), tail: spring(120, 7), head: spring(90, 11) }).current

  if (rig) {
    rig.current = {
      puffs,
      gone: state.current.gone,
      brushed: state.current.brushed,
      snip: (id) => {
        if (state.current.gone.has(id)) return
        state.current.gone.add(id)
        const e = els.current.get(id)
        if (e?.ink) e.ink.style.display = 'none'
        if (e?.fill) e.fill.style.display = 'none'
      },
      brush: (id) => {
        if (state.current.brushed.has(id)) return
        state.current.brushed.add(id)
        const e = els.current.get(id)
        if (e?.tangle) e.tangle.style.display = 'none'
        if (e?.shine) e.shine.style.display = ''
        e?.main?.setAttribute('fill', look.fleece)
      },
      bangsAside: () => {
        if (bangEls.current) bangEls.current.style.transform = 'translate(0px, -34px) scale(0.9)'
      },
      dropItem: (i) => {
        const el = itemEls.current[i]
        if (el) el.style.display = 'none'
      },
    }
  }

  const { svg, part } = usePuppet<Part>(ref, {
    voice: kind,
    actions: ALPACA_ACTIONS,
    eyes: [455, 148],
    reach: [455, 192],
    frame: (f, p) => {
      const { cold, asleep, happy, walking } = live.current
      const q = f.p
      const a = f.action
      const e = bell(q)
      let x = 0
      let y = 0
      let sx = 1
      let sy = 1
      let rot = 0
      // Breathing (slow and deep while asleep; her fleece puffs rise and fall with it).
      const breathe = Math.sin(f.t * (asleep ? 1.3 : 2.2))
      sx += breathe * (asleep ? 0.012 : 0.005)
      sy -= breathe * (asleep ? -0.022 : 0.008)
      if (a === 'hop' || a === 'cheer') {
        // Anticipation, take-off stretch, float, squash on landing, settle.
        const crouch = bell(span(q, 0, 0.22))
        const air = bell(span(q, 0.22, 0.72))
        const land = wobble(span(q, 0.72, 1), 2)
        sx += crouch * 0.08 - air * 0.05 + land * 0.07
        sy += -crouch * 0.1 + air * 0.08 - land * 0.09
        y -= air * (a === 'cheer' ? 14 : 10)
      } else if (a === 'giggle') {
        rot += Math.sin(q * Math.PI * 10) * 2.5 * e
        sy += Math.abs(Math.sin(q * Math.PI * 10)) * 0.03 * e
      } else if (a === 'roll') {
        // Paco rocks with laughter: back, forward, back again, bouncing on his hooves, giggle shakes all the way.
        rot += Math.sin(q * Math.PI * 3) * 14 * e + Math.sin(q * Math.PI * 16) * 2 * e
        y -= Math.abs(Math.sin(q * Math.PI * 6)) * 4 * e
        sy += Math.abs(Math.sin(q * Math.PI * 6)) * 0.04 * e
      }
      if (walking && !a) {
        // A trot: little bounces with a squash on each step and a sway.
        const step = Math.abs(Math.sin(f.t * 9))
        y -= step * 3
        sy += (step - 0.5) * 0.05
        sx -= (step - 0.5) * 0.03
        rot += Math.sin(f.t * 9) * 1.5
      } else if (a === 'shake') {
        rot += wobble(q, 3) * 4
      }
      // Shivering: big chilly shudders in bursts while cold (and as an action), so she can see they need their fleece.
      const burst = cold && !a ? Math.max(0, Math.sin(f.t * 1.6)) ** 2 : 0
      const shiver = (a === 'shiver' ? 0.8 + e : burst * 1.4) * Math.sin(f.t * 46)
      x += shiver * 1.2
      sy -= Math.abs(shiver) * 0.012
      put(p.root, 'transform', `translate(${x.toFixed(2)}%, ${y.toFixed(2)}%) rotate(${rot.toFixed(2)}deg) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`)

      // Head: idle sway, looks toward her finger, nods, leans into the brush, bows to the pond, yawns.
      let head = Math.sin(f.t * 1.1) * 2 + f.look.x * 4
      let headY = 0
      if (a === 'nod') head += Math.sin(q * Math.PI * 2) * 7
      if (a === 'lean') head += e * 10
      if (a === 'look') head += bell(span(q, 0, 0.9)) * 22
      if (a === 'giggle') head += Math.sin(q * Math.PI * 8) * 6 * e
      if (a === 'shake' || a === 'sneeze') head += Math.sin(q * Math.PI * 7) * 8 * e
      if (a === 'yawn') head -= e * 8
      if (a === 'cheer') head -= e * 6
      if (asleep) head += 9 + Math.sin(f.t * 1.3) * 2
      if (a === 'sneeze') headY = -bell(span(q, 0, 0.6)) * 3 + bell(span(q, 0.6, 1)) * 4
      const hr = springs.head.step(head, f.dt)
      put(p.head, 'transform', `translate(0%, ${(headY + shiver * 0.4).toFixed(2)}%) rotate(${hr.toFixed(2)}deg)`)

      // Ears lag behind the head and flop on hops; droop while asleep.
      const flop = a === 'hop' || a === 'cheer' ? bell(span(q, 0.2, 0.75)) * 18 : 0
      const droop = asleep ? 22 : 0
      put(p.earL, 'transform', `rotate(${springs.earL.step(-hr * 1.4 - flop - droop + shiver * 3, f.dt).toFixed(2)} ${EAR_L})`)
      put(p.earR, 'transform', `rotate(${springs.earR.step(-hr * 1.4 + flop + droop - shiver * 3, f.dt).toFixed(2)} ${EAR_R})`)
      put(p.tail, 'transform', `rotate(${(a ? springs.tail.step(Math.sin(f.t * 8) * e * 14, f.dt) : springs.tail.step(Math.sin(f.t * 1.3) * 3, f.dt)).toFixed(1)} 122 372)`)

      // Eyes: blink, follow her finger; shut while asleep, humming happily, giggling or yawning.
      const shut = asleep || happy || a === 'giggle' || a === 'roll' || a === 'lean' || a === 'yawn' || a === 'sneeze'
      put(p.eyesOpen, 'display', shut ? 'none' : 'inline')
      put(p.eyesShut, 'display', shut ? 'inline' : 'none')
      put(p.eyesOpen, 'transform', `translate(0 ${(EYE_Y * (1 - f.blink)).toFixed(1)}) scale(1 ${f.blink.toFixed(3)})`)
      put(p.pupils, 'transform', `translate(${(f.look.x * 5).toFixed(1)} ${(f.look.y * 4).toFixed(1)})`)
      // Mouth: the voice opens it; giggles, cheers and yawns open it too.
      const open = Math.max(f.mouth, a === 'giggle' || a === 'roll' ? 0.55 : 0, a === 'cheer' ? e * 0.7 : 0, a === 'yawn' ? bell(span(q, 0.1, 0.8)) : 0, kind === 'paco' && !a ? 0.25 : 0, cold && !a ? Math.abs(Math.sin(f.t * 30)) * 0.3 : 0)
      put(p.mouth, 'd', mouthPath(open, 0))
      put(p.zzz, 'display', asleep ? 'inline' : 'none')
      put(p.breath, 'display', cold ? 'inline' : 'none')
    },
  })

  const ids = useId().replace(/[^a-zA-Z0-9]/g, '')
  // Far legs first, near legs next, then the body and neck from top to bottom so each lower clump overlaps the one
  // above it (that overlap is what makes it read as wool).
  const byY = (a: Puff, b: Puff) => a.y - b.y || a.x - b.x
  const farLegs = puffs.filter((q) => q.zone === 'leg' && FAR_LEGS.some((x) => Math.abs(q.x - x) < 10))
  const nearLegs = puffs.filter((q) => q.zone === 'leg' && !farLegs.includes(q))
  const tail = puffs.filter((q) => q.zone === 'tail')
  const bodyPuffs = puffs.filter((q) => q.zone === 'body' || q.zone === 'belly' || q.zone === 'neck').sort(byY)
  const topPuffs = puffs.filter((q) => q.zone === 'top').sort(byY)
  const bangPuffs = puffs.filter((q) => q.zone === 'bang')
  const register = (id: number, key: 'ink' | 'fill' | 'main' | 'tangle' | 'shine') => (el: SVGElement | null) => {
    let e = els.current.get(id)
    if (!e) els.current.set(id, (e = { ink: null, fill: null, main: null, tangle: null, shine: null }))
    e[key] = el
  }
  const brushed0 = state.current.brushed
  const gone0 = state.current.gone
  /** The shade behind a group of puffs: it peeks out along the group's lower right edge, away from the light. */
  const puffShade = (list: Puff[]) =>
    list.map((q) => <circle key={q.id} ref={register(q.id, 'ink')} cx={q.x + 3} cy={q.y + 5} r={q.r + 2} fill={look.shade} style={{ display: gone0.has(q.id) ? 'none' : undefined }} />)
  const puffFill = (list: Puff[], far = false) =>
    list.map((q) => {
      const smooth = brushed0.has(q.id)
      const arc = (r: number, a0: number, a1: number) => {
        const p0 = [q.x + r * Math.cos((a0 * Math.PI) / 180), q.y + r * Math.sin((a0 * Math.PI) / 180)]
        const p1 = [q.x + r * Math.cos((a1 * Math.PI) / 180), q.y + r * Math.sin((a1 * Math.PI) / 180)]
        return `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`
      }
      const c = (q.curl * Math.PI) / 180
      const tx = q.x + Math.cos(c) * q.r * 0.3
      const ty = q.y + Math.sin(c) * q.r * 0.25
      // Only some clumps get a shaded edge or a shine, so the fleece reads as soft wool rather than scales.
      const edged = q.curl % 3 < 1.7
      const shiny = q.curl % 90 < 50
      return (
        <g key={q.id} ref={register(q.id, 'fill')} style={{ display: gone0.has(q.id) ? 'none' : undefined }}>
          <circle ref={register(q.id, 'main')} cx={q.x} cy={q.y} r={q.r} fill={smooth ? look.fleece : look.dull} />
          {far && <circle cx={q.x} cy={q.y} r={q.r} fill={look.shade} opacity=".45" />}
          {edged && <path d={arc(q.r - 3, 20, 100)} fill="none" stroke={look.shade} strokeWidth="5" strokeLinecap="round" opacity=".5" />}
          {/* Unbrushed: tangly little curls. Brushed: a soft shine on the side toward the light. */}
          <g ref={register(q.id, 'tangle')} fill="none" stroke={look.shade} strokeWidth="3.5" strokeLinecap="round" style={{ display: smooth ? 'none' : undefined }}>
            <path d={`M${(tx - 8).toFixed(1)} ${(ty + 5).toFixed(1)}q-1 -11 8 -10q8 2 3 9q-3 3 -5 0`} transform={`rotate(${q.curl.toFixed(0)} ${tx.toFixed(1)} ${ty.toFixed(1)})`} />
            {q.curl > 240 && <path d={`M${(q.x - q.r * 0.55).toFixed(1)} ${(q.y + q.r * 0.38).toFixed(1)}q4 -7 8 0q4 7 8 0`} />}
          </g>
          <path ref={register(q.id, 'shine')} d={arc(q.r * 0.62, 195, 262)} fill="none" stroke={look.light} strokeWidth="6" strokeLinecap="round" opacity={shiny && !far ? 1 : 0} style={{ display: smooth ? undefined : 'none' }} />
        </g>
      )
    })

  /** A stubby leg like Tika's: short wool, a cream sock, a rounded hoof. */
  const leg = (x: number, far: boolean) => {
    const h = far ? 20 : 23
    const cuff = 560
    const r = (h / 3).toFixed(1)
    return (
      <g key={x}>
        <path d={`M${x - h} ${cuff}H${x + h}V${VIEW.feetY - 12}Q${x + h} ${VIEW.feetY} ${x + h - 12} ${VIEW.feetY}H${x - h + 12}Q${x - h} ${VIEW.feetY} ${x - h} ${VIEW.feetY - 12}Z`} fill={look.hoof} />
        <rect x={x - h} y={cuff - 3} width={h * 2} height={36} fill={look.sock} />
        {far && <rect x={x - h} y={cuff - 3} width={h * 2} height={36} fill={look.shornShade} opacity=".4" />}
        {/* The short wool comes down over the sock in three soft scallops. */}
        <path d={`M${x - h} 446H${x + h}V${cuff}A${r} ${r} 0 0 1 ${(x + h / 3).toFixed(1)} ${cuff}A${r} ${r} 0 0 1 ${(x - h / 3).toFixed(1)} ${cuff}A${r} ${r} 0 0 1 ${x - h} ${cuff}Z`} fill={far ? look.shornShade : look.shorn} />
        <path d={`M${x} ${VIEW.feetY - 15}V${VIEW.feetY - 3}`} stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".3" />
      </g>
    )
  }

  return (
    <div
      role="img"
      aria-label={label ?? kind}
      onClick={onTap}
      style={{ position: 'relative', height, aspectRatio: `${VIEW.w} / ${VIEW.h}`, cursor: onTap ? 'pointer' : undefined }}
    >
      {/* A soft shadow on the ground under her. */}
      <div aria-hidden style={{ position: 'absolute', left: '17%', right: '21%', bottom: '1.6%', height: '3.6%', borderRadius: '50%', background: 'rgba(60, 40, 90, 0.16)' }} />
      <div ref={part('root')} style={{ position: 'absolute', inset: 0, transformOrigin: '47% 97%', willChange: 'transform' }}>
        {/* Body: legs, shorn body, fleece, stuck things. */}
        <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <clipPath id={`${ids}-body`}>
              <path d={SHORN_BODY} />
            </clipPath>
            <clipPath id={`${ids}-neck`}>
              <path d={SHORN_NECK} />
            </clipPath>
          </defs>
          {FAR_LEGS.map((x) => leg(x, true))}
          {puffShade(farLegs)}
          {puffFill(farLegs, true)}
          <g ref={part('tail')}>
            <path d={SHORN_TAIL} fill={look.shorn} />
            {puffShade(tail)}
            {puffFill(tail)}
          </g>
          {/* Shorn body and neck: the short fleece that shows as the long fleece comes off. Shaded underneath, lit on
              the back, with a few little curls. */}
          <path d={SHORN_NECK} fill={look.shorn} />
          <g clipPath={`url(#${ids}-neck)`}>
            <path d="M470 190Q520 300 440 420H540V190Z" fill={look.shornShade} opacity=".6" />
          </g>
          <path d={SHORN_BODY} fill={look.shorn} />
          <g clipPath={`url(#${ids}-body)`}>
            <path d="M90 440Q272 510 450 426V520H90Z" fill={look.shornShade} />
            <ellipse cx="214" cy="324" rx="84" ry="15" fill={look.light} opacity=".7" />
          </g>
          <path d="M170 388q9 -10 19 -1M300 372q9 -10 19 -1M232 436q9 -10 19 -1M396 304q8 -9 17 -1M340 426q8 -9 17 -1M414 252q8 -9 17 -1" fill="none" stroke={look.shornShade} strokeWidth="4.5" strokeLinecap="round" />
          {NEAR_LEGS.map((x) => leg(x, false))}
          {puffShade(nearLegs)}
          {puffFill(nearLegs)}
          <g>{puffShade(bodyPuffs)}</g>
          <g>{puffFill(bodyPuffs)}</g>
          {items.map((it, i) => (
            <image key={i} ref={(el) => void (itemEls.current[i] = el)} href={it.img} x={it.x - it.size / 2} y={it.y - it.size / 2} width={it.size} height={it.size} preserveAspectRatio="xMidYMid meet" />
          ))}
        </svg>

        {/* Head: its own layer that turns on the neck. */}
        <div
          ref={part('head')}
          style={{
            position: 'absolute',
            left: `${(HEAD_BOX.x / VIEW.w) * 100}%`,
            top: `${(HEAD_BOX.y / VIEW.h) * 100}%`,
            width: `${(HEAD_BOX.w / VIEW.w) * 100}%`,
            height: `${(HEAD_BOX.h / VIEW.h) * 100}%`,
            transformOrigin: `${((NECK_PIVOT.x - HEAD_BOX.x) / HEAD_BOX.w) * 100}% ${((NECK_PIVOT.y - HEAD_BOX.y) / HEAD_BOX.h) * 100}%`,
            willChange: 'transform',
          }}
        >
          <svg ref={svg} viewBox={`${HEAD_BOX.x} ${HEAD_BOX.y} ${HEAD_BOX.w} ${HEAD_BOX.h}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <clipPath id={`${ids}-head`}>
                <path d={HEAD} />
              </clipPath>
            </defs>
            {/* Tika's head, in the alpaca's own colors. */}
            <g transform={HEAD_AT}>
              <g ref={part('earL')}>
                <path d="M470 222Q414 124 448 22Q522 66 536 196Z" fill={look.fleece} />
                <path d="M478 190Q446 124 460 66Q504 100 512 184Z" fill={look.earIn} />
              </g>
              <g ref={part('earR')}>
                <path d="M750 222Q806 124 772 22Q698 66 684 196Z" fill={look.fleece} />
                <path d="M742 190Q774 124 760 66Q716 100 708 184Z" fill={look.earIn} />
              </g>
              <path d={HEAD} fill={look.fleece} />
              <g clipPath={`url(#${ids}-head)`}>
                <path d="M700 120Q830 300 690 480H820V120Z" fill={look.shade} opacity=".5" />
              </g>
              <path d="M468 232q16 -20 38 -6M452 330q10 -20 28 -12M742 250q14 -14 30 -4" fill="none" stroke={look.light} strokeWidth="9" strokeLinecap="round" opacity=".8" />
              <path d={FACE} fill={look.face} />
              <ellipse cx="610" cy="392" rx="84" ry="60" fill={look.muzzle} />
              <ellipse cx="500" cy="378" rx="27" ry="17" fill="#FF8FB8" opacity=".7" />
              <ellipse cx="720" cy="378" rx="27" ry="17" fill="#FF8FB8" opacity=".7" />
              <g ref={part('eyesOpen')}>
                <path d="M514 292L498 280M522 282L510 266M706 292L722 280M698 282L710 266" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
                <ellipse cx="540" cy={EYE_Y} rx="27" ry="33" fill={INK} />
                <ellipse cx="680" cy={EYE_Y} rx="27" ry="33" fill={INK} />
                <g ref={part('pupils')} fill="#fff">
                  <circle cx="531" cy="299" r="11" />
                  <circle cx="671" cy="299" r="11" />
                  <circle cx="550" cy="326" r="5" />
                  <circle cx="690" cy="326" r="5" />
                </g>
              </g>
              <g ref={part('eyesShut')} display="none" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round">
                <path d="M514 320Q540 292 566 320" />
                <path d="M654 320Q680 292 706 320" />
              </g>
              {kind === 'abuela' && (
                <g fill="none" stroke="#EBA123" strokeWidth="9" strokeLinecap="round">
                  <circle cx="540" cy={EYE_Y + 2} r="44" fill="#fff" fillOpacity=".18" />
                  <circle cx="680" cy={EYE_Y + 2} r="44" fill="#fff" fillOpacity=".18" />
                  <path d="M584 308Q610 294 636 308" />
                </g>
              )}
              {/* Nose, and the little split lip. */}
              <path d="M590 362Q610 352 630 362Q630 376 610 386Q590 376 590 362Z" fill={kind === 'luna' ? '#8A5B3D' : look.hoof} />
              <path ref={part('mouth')} d={mouthPath(0, 0)} fill="#7A2745" />
              <path d="M610 386V398M610 398Q594 414 576 402M610 398Q626 414 644 402" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            {mustache && (
              <g>
                {[[436, 204, 15], [474, 204, 15], [455, 208, 12]].map(([x, y, r]) => (
                  <circle key={x} cx={x + 2} cy={y + 3} r={r + 1.5} fill={look.shade} />
                ))}
                {[[436, 204, 15], [474, 204, 15], [455, 208, 12]].map(([x, y, r]) => (
                  <circle key={x} cx={x} cy={y} r={r} fill={look.fleece} />
                ))}
                <path d="M426 198q6 -7 13 -1M466 198q6 -7 13 -1" fill="none" stroke={look.light} strokeWidth="4" strokeLinecap="round" />
              </g>
            )}
            {/* Topknot (and bangs) over the forehead: the same woolly clumps as the body. */}
            <g>{puffShade(topPuffs)}</g>
            <g>{puffFill(topPuffs)}</g>
            {bangPuffs.length > 0 && (
              <g ref={bangEls} style={{ transition: 'transform 0.45s cubic-bezier(.3,1.6,.5,1)', transformBox: 'view-box', transformOrigin: '455px 120px' }}>
                {puffShade(bangPuffs)}
                {puffFill(bangPuffs)}
              </g>
            )}
            {kind === 'abuela' && (
              <g transform="translate(528 84)">
                {[0, 72, 144, 216, 288].map((r) => (
                  <ellipse key={r} cx="0" cy="-11" rx="9" ry="12" fill={r === 72 || r === 144 ? '#E7699C' : '#FF8FB8'} transform={`rotate(${r})`} />
                ))}
                <circle r="7" fill="#FFC83D" />
                <circle cx="-2" cy="-2" r="2.5" fill="#FFE189" />
              </g>
            )}
            {hat && (
              <g transform={`translate(${HAT_SPOT.x} ${HAT_SPOT.y - 8}) scale(1.3)`}>
                <HatShape color={hat} />
              </g>
            )}
            {/* Cold breath puffs drifting from her mouth. */}
            <g ref={part('breath')} display="none" className="peru-breath">
              <circle cx="474" cy="216" r="9" fill="#fff" opacity=".9" />
              <circle cx="494" cy="208" r="12" fill="#fff" opacity=".9" />
              <circle cx="518" cy="198" r="15" fill="#fff" opacity=".9" />
              <path d="M510 192a9 9 0 0 1 8 -6" fill="none" stroke="#C3D3F4" strokeWidth="3" strokeLinecap="round" />
            </g>
            <g ref={part('zzz')} display="none" fill="none" stroke="#8B78E6" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M548 22h16l-16 20h16" />
              <path d="M572 -14h22l-22 26h22" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
})

/** Hat colors: pink wool dyed with the cochineal bug, and the alpacas' own natural colors. */
export const HAT_COLORS: Record<string, { main: string; shade: string; accent: string; pom: string; pomShade: string }> = {
  pink: { main: '#FF8FB8', shade: '#E7699C', accent: '#FFF7F0', pom: '#FF4F9A', pomShade: '#D8367F' },
  hotpink: { main: '#FF4F9A', shade: '#D8367F', accent: '#FBEA9A', pom: '#FF8FB8', pomShade: '#E7699C' },
  cream: { main: '#FFF7F0', shade: '#EFDCCD', accent: '#FF8FB8', pom: '#FF8FB8', pomShade: '#E7699C' },
  brown: { main: '#C99266', shade: '#A46E4B', accent: '#FFE2D4', pom: '#FF4F9A', pomShade: '#D8367F' },
}

/** A Peruvian chullo: a knitted dome with ear flaps, tassels and a pompom. Drawn around (0, 0); about 120 x 160.
 *  Flat tones, no outline: the shade falls on the right, away from the light. */
export function HatShape({ color }: { color: string }) {
  const c = HAT_COLORS[color] ?? HAT_COLORS.pink
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const dome = 'M-56 16Q-60 -52 0 -56Q60 -52 56 16Q0 30 -56 16Z'
  return (
    <g>
      <defs>
        <clipPath id={`${id}-dome`}>
          <path d={dome} />
        </clipPath>
      </defs>
      {/* Ear flaps hang beside the face, with braided ties and little pompoms. */}
      <path d="M-48 56V72M48 56V72" fill="none" stroke={c.pomShade} strokeWidth="4" strokeLinecap="round" />
      <path d="M-55 8L-59 50Q-50 63 -37 52L-35 14Z" fill={c.main} />
      <path d="M55 8L59 50Q50 63 37 52L35 14Z" fill={c.shade} />
      <circle cx="-48" cy="78" r="8" fill={c.pom} />
      <circle cx="48" cy="78" r="8" fill={c.pom} />
      <circle cx="-50.5" cy="75.5" r="2.6" fill="#fff" opacity=".45" />
      <circle cx="45.5" cy="75.5" r="2.6" fill="#fff" opacity=".45" />
      <path d={dome} fill={c.main} />
      <g clipPath={`url(#${id}-dome)`}>
        <path d="M30 -70Q64 -20 34 40H80V-70Z" fill={c.shade} />
        {/* Knitted pattern: a row of dots, a zigzag band and a striped brim. */}
        <path d="M-60 -5L-39 -18L-26 -6L-13 -18L0 -6L13 -18L26 -6L39 -18L60 -5" fill="none" stroke={c.accent} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M-60 6Q0 18 60 6" fill="none" stroke={c.accent} strokeWidth="5" />
        <path d="M-60 16Q0 30 60 16V40H-60Z" fill={c.shade} opacity=".55" />
      </g>
      <circle cx="-22" cy="-33" r="4.5" fill={c.accent} />
      <circle cx="0" cy="-39" r="4.5" fill={c.accent} />
      <circle cx="22" cy="-33" r="4.5" fill={c.accent} />
      <circle cx="1.5" cy="-62" r="15" fill={c.pomShade} />
      <circle cx="0" cy="-64" r="14" fill={c.pom} />
      <circle cx="-5" cy="-69" r="4.5" fill="#fff" opacity=".45" />
    </g>
  )
}

/** Converts a point in the alpaca's picture (viewBox units) to a share of its box, for placing things over it. */
export const shareOf = (x: number, y: number) => ({ x: x / VIEW.w, y: y / VIEW.h })
export { BODY_MID, HAT_SPOT }

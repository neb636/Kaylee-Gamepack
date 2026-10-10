// One alpaca rig for Luna, Paco and Abuela Killa (like australia/puppets/roo.ts for the kangaroos): same body, own
// colors and extras. The fleece is made of puffs (fleece.ts) that the salon brushes and snips through `rig`.
//
// Two layers so Safari stays smooth with ~90 puffs: the body SVG only repaints when a puff changes, and the head is its
// own small SVG that turns, blinks and talks every frame. Breathing, hops and shivers move the whole root <div> with a
// CSS transform (composited, no repaint).
import { forwardRef, useMemo, useRef, type MutableRefObject } from 'react'
import { bell, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { BODY_MID, HAT_SPOT, HEAD_BOX, makeFleece, NECK_PIVOT, SHORN_BODY, SHORN_NECK, VIEW, type Puff } from './fleece'

export const INK = '#2B2330'

export type AlpacaKind = 'luna' | 'paco' | 'abuela'

interface Look {
  fleece: string
  curl: string
  shine: string
  skin: string
  face: string
  muzzle: string
  feet: string
  seed: number
}

export const LOOKS: Record<AlpacaKind, Look> = {
  luna: { fleece: '#FFC2A8', curl: '#E99A7D', shine: '#FFE6DA', skin: '#FFD6C4', face: '#FFC2A8', muzzle: '#FFF7F0', feet: '#6B4B4F', seed: 11 },
  paco: { fleece: '#8B5A3C', curl: '#6A412A', shine: '#B98261', skin: '#A9714E', face: '#A9714E', muzzle: '#F2D6B8', feet: '#3E2A22', seed: 23 },
  abuela: { fleece: '#4E4357', curl: '#352C3D', shine: '#7C6E86', skin: '#6E6178', face: '#5E5268', muzzle: '#FFF7F0', feet: '#2B2330', seed: 37 },
}

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
  const els = useRef(new Map<number, { ink: SVGElement | null; fill: SVGElement | null; tangle: SVGElement | null; shine: SVGElement | null }>())
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
    eyes: [455, 146],
    reach: [455, 190],
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
      put(p.earL, 'transform', `rotate(${springs.earL.step(-hr * 1.4 - flop - droop + shiver * 3, f.dt).toFixed(2)} 421 100)`)
      put(p.earR, 'transform', `rotate(${springs.earR.step(-hr * 1.4 + flop + droop - shiver * 3, f.dt).toFixed(2)} 489 100)`)
      put(p.tail, 'transform', `rotate(${(a ? springs.tail.step(Math.sin(f.t * 8) * e * 14, f.dt) : springs.tail.step(0, f.dt)).toFixed(1)} 110 372)`)

      // Eyes: blink, follow her finger; shut while asleep, humming happily, giggling or yawning.
      const shut = asleep || happy || a === 'giggle' || a === 'roll' || a === 'lean' || a === 'yawn' || a === 'sneeze'
      put(p.eyesOpen, 'display', shut ? 'none' : 'inline')
      put(p.eyesShut, 'display', shut ? 'inline' : 'none')
      put(p.eyesOpen, 'transform', `translate(0 ${(146 * (1 - f.blink)).toFixed(1)}) scale(1 ${f.blink.toFixed(3)})`)
      put(p.pupils, 'transform', `translate(${(f.look.x * 4).toFixed(1)} ${(f.look.y * 3).toFixed(1)})`)
      // Mouth: the voice opens it; giggles, cheers and yawns open it too.
      const open = Math.max(f.mouth, a === 'giggle' || a === 'roll' ? 0.55 : 0, a === 'cheer' ? e * 0.7 : 0, a === 'yawn' ? bell(span(q, 0.1, 0.8)) : 0, kind === 'paco' && !a ? 0.25 : 0, cold && !a ? Math.abs(Math.sin(f.t * 30)) * 0.3 : 0)
      put(p.mouth, 'd', `M441 201Q455 ${(207 + open * 3).toFixed(1)} 469 201Q468 ${(206 + open * 22).toFixed(1)} 455 ${(208 + open * 24).toFixed(1)}Q442 ${(206 + open * 22).toFixed(1)} 441 201Z`)
      put(p.zzz, 'display', asleep ? 'inline' : 'none')
      put(p.breath, 'display', cold ? 'inline' : 'none')
    },
  })

  const ids = useRef(`alp-${Math.random().toString(36).slice(2, 8)}`).current
  const bodyPuffs = puffs.filter((q) => q.zone !== 'top' && q.zone !== 'bang')
  const topPuffs = puffs.filter((q) => q.zone === 'top')
  const bangPuffs = puffs.filter((q) => q.zone === 'bang')
  const register = (id: number, key: 'ink' | 'fill' | 'tangle' | 'shine') => (el: SVGElement | null) => {
    let e = els.current.get(id)
    if (!e) els.current.set(id, (e = { ink: null, fill: null, tangle: null, shine: null }))
    e[key] = el
  }
  const brushed0 = state.current.brushed
  const puffInk = (list: Puff[]) =>
    list.map((q) => <circle key={q.id} ref={register(q.id, 'ink')} cx={q.x} cy={q.y} r={q.r + 5} fill={INK} style={{ display: state.current.gone.has(q.id) ? 'none' : undefined }} />)
  const puffFill = (list: Puff[]) =>
    list.map((q) => (
      <g key={q.id} ref={register(q.id, 'fill')} style={{ display: state.current.gone.has(q.id) ? 'none' : undefined }}>
        <circle cx={q.x} cy={q.y} r={q.r} fill={look.fleece} />
        {/* Unbrushed: a messy curl. Brushed: a soft shine. */}
        <path ref={register(q.id, 'tangle')} d={`M${q.x - q.r * 0.45} ${q.y + 2}q${q.r * 0.2} ${-q.r * 0.6} ${q.r * 0.5} ${-q.r * 0.25}q${-q.r * 0.25} ${q.r * 0.5} ${q.r * 0.45} ${q.r * 0.3}`} transform={`rotate(${q.curl} ${q.x} ${q.y})`} fill="none" stroke={look.curl} strokeWidth="4" strokeLinecap="round" style={{ display: brushed0.has(q.id) ? 'none' : undefined }} />
        <path ref={register(q.id, 'shine')} d={`M${q.x - q.r * 0.5} ${q.y - q.r * 0.15}a${q.r * 0.55} ${q.r * 0.55} 0 0 1 ${q.r * 0.6} ${-q.r * 0.45}`} fill="none" stroke={look.shine} strokeWidth="5" strokeLinecap="round" style={{ display: brushed0.has(q.id) ? undefined : 'none' }} />
      </g>
    ))

  const leg = (x: number, far: boolean) => (
    <g key={x}>
      <path d={`M${x - 14} 450L${x - 13} 604Q${x} 612 ${x + 13} 604L${x + 14} 450Z`} fill={far ? look.curl : look.skin} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <path d={`M${x - 19} 602Q${x} 594 ${x + 19} 602L${x + 20} 616Q${x} 624 ${x - 20} 616Z`} fill={look.feet} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
    </g>
  )

  return (
    <div
      role="img"
      aria-label={label ?? kind}
      onClick={onTap}
      style={{ position: 'relative', height, aspectRatio: `${VIEW.w} / ${VIEW.h}`, cursor: onTap ? 'pointer' : undefined }}
    >
      <div ref={part('root')} style={{ position: 'absolute', inset: 0, transformOrigin: '47% 97%', willChange: 'transform' }}>
        {/* Body: legs, shorn body, fleece, stuck things. */}
        <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
          {leg(168, true)}
          {leg(372, true)}
          <g ref={part('tail')}>
            <path d="M118 360Q96 352 92 372Q96 392 118 388Z" fill={look.skin} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          </g>
          {/* Shorn body and neck: what shows as the fleece comes off. */}
          <path d={SHORN_NECK} fill={look.skin} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path d={SHORN_BODY} fill={look.skin} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path d="M170 372q12 -10 24 0q12 10 24 0M300 360q12 -10 24 0q12 10 24 0M226 432q12 -10 24 0q12 10 24 0M392 300q10 -8 20 0q10 8 20 0" fill="none" stroke={look.curl} strokeWidth="4" strokeLinecap="round" opacity=".55" />
          {leg(204, false)}
          {leg(408, false)}
          <g>{puffInk(bodyPuffs)}</g>
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
              <clipPath id={`${ids}-face`}>
                <ellipse cx="455" cy="152" rx="60" ry="68" />
              </clipPath>
            </defs>
            <g stroke={INK} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
              <g ref={part('earL')}>
                <path d="M410 110Q380 60 396 14Q424 26 434 98Z" fill={look.face} />
                <path d="M412 92Q398 62 404 34Q420 46 424 88Z" fill="#FF8FB8" stroke="none" />
              </g>
              <g ref={part('earR')}>
                <path d="M500 110Q530 60 514 14Q486 26 476 98Z" fill={look.face} />
                <path d="M498 92Q512 62 506 34Q490 46 486 88Z" fill="#FF8FB8" stroke="none" />
              </g>
              <ellipse cx="455" cy="152" rx="60" ry="68" fill={look.face} />
              <ellipse cx="455" cy="192" rx="36" ry="27" fill={look.muzzle} clipPath={`url(#${ids}-face)`} stroke="none" />
              <ellipse cx="411" cy="176" rx="12" ry="8" fill="#FF8FB8" stroke="none" opacity=".85" />
              <ellipse cx="499" cy="176" rx="12" ry="8" fill="#FF8FB8" stroke="none" opacity=".85" />
              <g ref={part('eyesOpen')}>
                <ellipse cx="431" cy="146" rx="13" ry="16" fill={INK} stroke="none" />
                <ellipse cx="479" cy="146" rx="13" ry="16" fill={INK} stroke="none" />
                <g ref={part('pupils')} fill="#fff" stroke="none">
                  <circle cx="427" cy="140" r="5" />
                  <circle cx="475" cy="140" r="5" />
                  <circle cx="434" cy="152" r="2.4" />
                  <circle cx="482" cy="152" r="2.4" />
                </g>
              </g>
              <g ref={part('eyesShut')} fill="none" strokeWidth="4.5" display="none">
                <path d="M419 148Q431 158 443 148" />
                <path d="M467 148Q479 158 491 148" />
              </g>
              {kind === 'abuela' && (
                <g fill="none" stroke="#FFC83D" strokeWidth="4">
                  <circle cx="431" cy="147" r="20" />
                  <circle cx="479" cy="147" r="20" />
                  <path d="M451 145Q455 140 459 145" />
                </g>
              )}
              <path d="M447 182Q455 176 463 182Q462 189 455 191Q448 189 447 182Z" fill={INK} stroke="none" />
              <path d="M455 191V199" fill="none" strokeWidth="3.5" />
              <path ref={part('mouth')} d="M441 201Q455 207 469 201Q468 206 455 208Q442 206 441 201Z" fill="#FF6F9F" strokeWidth="3.5" />
              {mustache && (
                <g>
                  <circle cx="442" cy="199" r="14" fill={INK} stroke="none" />
                  <circle cx="468" cy="199" r="14" fill={INK} stroke="none" />
                  <circle cx="442" cy="199" r="10" fill={look.fleece} stroke="none" />
                  <circle cx="468" cy="199" r="10" fill={look.fleece} stroke="none" />
                </g>
              )}
            </g>
            {/* Topknot (and bangs) over the forehead: same puff style as the body, with its own outline pass. */}
            <g>{puffInk(topPuffs)}</g>
            <g>{puffFill(topPuffs)}</g>
            {bangPuffs.length > 0 && (
              <g ref={bangEls} style={{ transition: 'transform 0.45s cubic-bezier(.3,1.6,.5,1)', transformBox: 'view-box', transformOrigin: '455px 120px' }}>
                {puffInk(bangPuffs)}
                {puffFill(bangPuffs)}
              </g>
            )}
            {kind === 'abuela' && (
              <g transform="translate(500 84)" stroke={INK} strokeWidth="3">
                {[0, 72, 144, 216, 288].map((r) => (
                  <ellipse key={r} cx="0" cy="-9" rx="7" ry="10" fill="#FF8FB8" transform={`rotate(${r})`} />
                ))}
                <circle r="6" fill="#FFC83D" />
              </g>
            )}
            {hat && (
              <g transform={`translate(${HAT_SPOT.x} ${HAT_SPOT.y - 14})`}>
                <HatShape color={hat} />
              </g>
            )}
            {/* Cold breath puffs drifting from her mouth. */}
            <g ref={part('breath')} display="none" className="peru-breath">
              <circle cx="470" cy="214" r="9" fill="#FFF7F0" stroke={INK} strokeWidth="2.5" />
              <circle cx="490" cy="206" r="12" fill="#FFF7F0" stroke={INK} strokeWidth="2.5" />
              <circle cx="514" cy="196" r="15" fill="#FFF7F0" stroke={INK} strokeWidth="2.5" />
            </g>
            <g ref={part('zzz')} display="none" fill={INK} fontFamily="Fredoka, sans-serif" fontWeight="700">
              <text x="515" y="40" fontSize="30">z</text>
              <text x="535" y="14" fontSize="38">z</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
})

/** Hat colors: pink wool dyed with the cochineal bug, and the alpacas' own natural colors. */
export const HAT_COLORS: Record<string, { main: string; accent: string; pom: string }> = {
  pink: { main: '#FF8FB8', accent: '#FFF7F0', pom: '#FF4F9A' },
  hotpink: { main: '#FF4F9A', accent: '#FBEA9A', pom: '#FF8FB8' },
  cream: { main: '#FFF7F0', accent: '#FF8FB8', pom: '#FF8FB8' },
  brown: { main: '#A9714E', accent: '#FFC2A8', pom: '#FF4F9A' },
}

/** A Peruvian chullo: a knitted dome with ear flaps, tassels and a pompom. Drawn around (0, 0); about 110 x 140. */
export function HatShape({ color }: { color: string }) {
  const c = HAT_COLORS[color] ?? HAT_COLORS.pink
  return (
    <g stroke={INK} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M-40 14L-44 52Q-36 62 -26 52L-24 16Z" fill={c.main} />
      <path d="M40 14L44 52Q36 62 26 52L24 16Z" fill={c.main} />
      <path d="M-35 58V74M35 58V74" fill="none" strokeWidth="4" />
      <circle cx="-35" cy="78" r="6" fill={c.pom} strokeWidth="3.5" />
      <circle cx="35" cy="78" r="6" fill={c.pom} strokeWidth="3.5" />
      <path d="M-46 18Q-48 -44 0 -48Q48 -44 46 18Q0 28 -46 18Z" fill={c.main} />
      <path d="M-44 -2L-33 -12L-22 -2L-11 -12L0 -2L11 -12L22 -2L33 -12L44 -2" fill="none" stroke={c.accent} strokeWidth="6" />
      <path d="M-46 18Q0 28 46 18" fill="none" />
      <circle cx="-20" cy="-26" r="4" fill={c.accent} stroke="none" />
      <circle cx="0" cy="-32" r="4" fill={c.accent} stroke="none" />
      <circle cx="20" cy="-26" r="4" fill={c.accent} stroke="none" />
      <circle cx="0" cy="-56" r="14" fill={c.pom} />
    </g>
  )
}

/** Converts a point in the alpaca's picture (viewBox units) to a share of its box, for placing things over it. */
export const shareOf = (x: number, y: number) => ({ x: x / VIEW.w, y: y / VIEW.h })
export { BODY_MID, HAT_SPOT }

// One alpaca rig for Luna, Paco and Abuela Killa (like australia/puppets/roo.ts for the kangaroos): same body, own
// colors and extras. The fleece is made of puffs (fleece.ts) that the salon brushes and snips through `rig`.
//
// Two layers so Safari stays smooth with ~90 puffs: the body SVG only repaints when a puff changes, and the head is its
// own small SVG that turns, blinks and talks every frame. Breathing, hops and shivers move the whole root <div> with a
// CSS transform (composited, no repaint).
import { forwardRef, useMemo, useRef, type MutableRefObject } from 'react'
import { bell, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { BODY_MID, FAR_LEGS, HAT_SPOT, HEAD_BOX, makeFleece, makeHood, NEAR_LEGS, NECK_PIVOT, SHORN_BODY, shornLeg, SHORN_NECK, VIEW, type Puff } from './fleece'

export const INK = '#2B2330'

export type AlpacaKind = 'luna' | 'paco' | 'abuela'

interface Look {
  /** Brushed fleece, and the duller color of a tangled, unbrushed puff. */
  fleece: string
  dull: string
  /** The shadow under each woolly clump, the thin lines between clumps, and the brushed shine. */
  shade: string
  line: string
  shine: string
  /** The short fleece left after a haircut. */
  shorn: string
  face: string
  muzzle: string
  ear: string
  legs: string
  legsFar: string
  hoof: string
  seed: number
}

// Colors picked from the reference pictures (assets/luna.webp, paco.webp, abuela.webp): a lighter face framed by a
// fluffy hood, cream lower legs and dark split hooves.
export const LOOKS: Record<AlpacaKind, Look> = {
  luna: { fleece: '#FFC4A6', dull: '#F2B497', shade: '#F2A483', line: '#D9876A', shine: '#FFE9DD', shorn: '#FFD3BD', face: '#FFDCC9', muzzle: '#FFF5EC', ear: '#FFCFB6', legs: '#FCE7D8', legsFar: '#EDCDB8', hoof: '#5B3F43', seed: 11 },
  paco: { fleece: '#94603F', dull: '#82543A', shade: '#6F4329', line: '#563320', shine: '#BC8866', shorn: '#A6764F', face: '#C99572', muzzle: '#F7E1C8', ear: '#A8714E', legs: '#F3DDC4', legsFar: '#DCC2A6', hoof: '#3E2A22', seed: 23 },
  abuela: { fleece: '#514659', dull: '#463C4E', shade: '#3B3244', line: '#2F2737', shine: '#83768E', shorn: '#675B71', face: '#F6DCCB', muzzle: '#FFF6EE', ear: '#5E5268', legs: '#F3DDCF', legsFar: '#DCC4B6', hoof: '#2B2330', seed: 37 },
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
  const hood = useMemo(() => makeHood(look.seed), [look.seed])
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
      put(p.earL, 'transform', `rotate(${springs.earL.step(-hr * 1.4 - flop - droop + shiver * 3, f.dt).toFixed(2)} 420 98)`)
      put(p.earR, 'transform', `rotate(${springs.earR.step(-hr * 1.4 + flop + droop - shiver * 3, f.dt).toFixed(2)} 490 98)`)
      put(p.tail, 'transform', `rotate(${(a ? springs.tail.step(Math.sin(f.t * 8) * e * 14, f.dt) : springs.tail.step(0, f.dt)).toFixed(1)} 110 372)`)

      // Eyes: blink, follow her finger; shut while asleep, humming happily, giggling or yawning.
      const shut = asleep || happy || a === 'giggle' || a === 'roll' || a === 'lean' || a === 'yawn' || a === 'sneeze'
      put(p.eyesOpen, 'display', shut ? 'none' : 'inline')
      put(p.eyesShut, 'display', shut ? 'inline' : 'none')
      put(p.eyesOpen, 'transform', `translate(0 ${(148 * (1 - f.blink)).toFixed(1)}) scale(1 ${f.blink.toFixed(3)})`)
      put(p.pupils, 'transform', `translate(${(f.look.x * 4).toFixed(1)} ${(f.look.y * 3).toFixed(1)})`)
      // Mouth: the voice opens it; giggles, cheers and yawns open it too.
      const open = Math.max(f.mouth, a === 'giggle' || a === 'roll' ? 0.55 : 0, a === 'cheer' ? e * 0.7 : 0, a === 'yawn' ? bell(span(q, 0.1, 0.8)) : 0, kind === 'paco' && !a ? 0.25 : 0, cold && !a ? Math.abs(Math.sin(f.t * 30)) * 0.3 : 0)
      put(p.mouth, 'd', mouthPath(open))
      put(p.zzz, 'display', asleep ? 'inline' : 'none')
      put(p.breath, 'display', cold ? 'inline' : 'none')
    },
  })

  const ids = useRef(`alp-${Math.random().toString(36).slice(2, 8)}`).current
  // Far legs first, near legs next, then the body and neck from top to bottom so each lower clump overlaps the one
  // above it (that overlap draws the woolly scallops, like the reference picture).
  const byY = (a: Puff, b: Puff) => a.y - b.y || a.x - b.x
  const farLegs = puffs.filter((q) => q.zone === 'leg' && FAR_LEGS.some((x) => Math.abs(q.x - x) < 10))
  const nearLegs = puffs.filter((q) => q.zone === 'leg' && !farLegs.includes(q))
  const tail = puffs.filter((q) => q.zone === 'tail')
  const bodyPuffs = puffs.filter((q) => q.zone === 'body' || q.zone === 'belly' || q.zone === 'neck').sort(byY)
  const topPuffs = puffs.filter((q) => q.zone === 'top').sort(byY)
  const bangPuffs = puffs.filter((q) => q.zone === 'bang')
  const register = (id: number, key: 'ink' | 'fill' | 'main' | 'tangle' | 'shine') => (el: SVGElement | null) => {
    if (id < 0) return
    let e = els.current.get(id)
    if (!e) els.current.set(id, (e = { ink: null, fill: null, main: null, tangle: null, shine: null }))
    e[key] = el
  }
  const brushed0 = state.current.brushed
  const gone0 = state.current.gone
  const puffInk = (list: Puff[], w = 5) =>
    list.map((q) => <circle key={q.id} ref={register(q.id, 'ink')} cx={q.x} cy={q.y} r={q.r + w} fill={INK} style={{ display: gone0.has(q.id) ? 'none' : undefined }} />)
  const puffFill = (list: Puff[]) =>
    list.map((q) => {
      const smooth = q.id < 0 || brushed0.has(q.id)
      // Flat fill like the art; a thin line along the upper edge of each clump marks where it overlaps the one above.
      const arc = (r: number, a0: number, a1: number, cx = q.x, cy = q.y) => {
        const p0 = [cx + r * Math.cos((a0 * Math.PI) / 180), cy + r * Math.sin((a0 * Math.PI) / 180)]
        const p1 = [cx + r * Math.cos((a1 * Math.PI) / 180), cy + r * Math.sin((a1 * Math.PI) / 180)]
        return `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`
      }
      const c = (q.curl * Math.PI) / 180
      const tx = q.x + Math.cos(c) * q.r * 0.3
      const ty = q.y + Math.sin(c) * q.r * 0.25
      // Only some clumps get a line or a shine, so the fleece reads as soft wool rather than scales.
      const lineFrom = 150 + (q.curl % 40)
      const lined = q.curl < 160 || q.zone === 'top' || q.zone === 'bang'
      const shiny = q.curl % 90 < 50
      return (
        <g key={q.id} ref={register(q.id, 'fill')} style={{ display: gone0.has(q.id) ? 'none' : undefined }}>
          <circle ref={register(q.id, 'main')} cx={q.x} cy={q.y} r={q.r} fill={smooth ? look.fleece : look.dull} />
          {lined && <path d={arc(q.r - 1, lineFrom, lineFrom + 95)} fill="none" stroke={look.line} strokeWidth="3.5" strokeLinecap="round" opacity=".55" />}
          {/* Unbrushed: tangly little curls. Brushed: a soft shine. */}
          <g ref={register(q.id, 'tangle')} fill="none" stroke={look.line} strokeWidth="3" strokeLinecap="round" opacity=".75" style={{ display: smooth ? 'none' : undefined }}>
            <path d={`M${(tx - 8).toFixed(1)} ${(ty + 5).toFixed(1)}q-1 -11 8 -10q8 2 3 9q-3 3 -5 0`} transform={`rotate(${q.curl.toFixed(0)} ${tx.toFixed(1)} ${ty.toFixed(1)})`} />
            {q.curl > 240 && <path d={`M${(q.x - q.r * 0.55).toFixed(1)} ${(q.y + q.r * 0.38).toFixed(1)}q4 -7 8 0q4 7 8 0`} />}
          </g>
          <path ref={register(q.id, 'shine')} d={arc(q.r * 0.58, 205, 260)} fill="none" stroke={look.shine} strokeWidth="5" strokeLinecap="round" opacity={shiny ? 1 : 0} style={{ display: smooth ? undefined : 'none' }} />
        </g>
      )
    })

  const leg = (x: number, far: boolean) => (
    <g key={x} stroke={INK} strokeWidth="5" strokeLinejoin="round">
      <path d={`M${x - 14} 448L${x - 11} 592Q${x} 598 ${x + 11} 592L${x + 14} 448Z`} fill={far ? look.legsFar : look.legs} />
      <path d={shornLeg(x)} fill={far ? look.shade : look.shorn} />
      {/* A small split hoof: two rounded toes. */}
      <path d={`M${x - 1} 600Q${x - 1} 594 ${x - 8} 594Q${x - 16} 596 ${x - 18} 606Q${x - 19} 618 ${x - 10} 618H${x - 1}Z`} fill={look.hoof} />
      <path d={`M${x + 1} 600Q${x + 1} 594 ${x + 8} 594Q${x + 16} 596 ${x + 18} 606Q${x + 19} 618 ${x + 10} 618H${x + 1}Z`} fill={look.hoof} />
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
          {FAR_LEGS.map((x) => leg(x, true))}
          {puffInk(farLegs)}
          {puffFill(farLegs)}
          <g ref={part('tail')}>
            <path d="M118 356Q90 350 88 372Q92 394 118 390Z" fill={look.shorn} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
            {puffInk(tail)}
            {puffFill(tail)}
          </g>
          {/* Shorn body and neck: the short fleece that shows as the long fleece comes off. */}
          <path d={SHORN_NECK} fill={look.shorn} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path d={SHORN_BODY} fill={look.shorn} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path d="M170 372q12 -10 24 0q12 10 24 0M300 360q12 -10 24 0q12 10 24 0M226 432q12 -10 24 0q12 10 24 0M392 300q10 -8 20 0q10 8 20 0M150 420q10 -8 20 0q10 8 20 0M330 420q10 -8 20 0q10 8 20 0M410 250q10 -8 20 0q10 8 20 0" fill="none" stroke={look.shade} strokeWidth="4" strokeLinecap="round" />
          {NEAR_LEGS.map((x) => leg(x, false))}
          {puffInk(nearLegs)}
          {puffFill(nearLegs)}
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
                <path d={FACE} />
              </clipPath>
            </defs>
            <g stroke={INK} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
              {/* Long leaf ears behind the hood. */}
              <g ref={part('earL')}>
                <path d="M402 112Q370 52 390 4Q428 18 440 100Z" fill={look.ear} />
                <path d="M408 94Q392 56 397 24Q421 38 428 90Z" fill="#FF9DBF" stroke="none" />
              </g>
              <g ref={part('earR')}>
                <path d="M508 112Q540 52 520 4Q482 18 470 100Z" fill={look.ear} />
                <path d="M502 94Q518 56 513 24Q489 38 482 90Z" fill="#FF9DBF" stroke="none" />
              </g>
            </g>
            {/* The fluffy hood around the face. */}
            <g>{puffInk(hood)}</g>
            <g>{puffFill(hood)}</g>
            <g stroke={INK} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
              <path d={FACE} fill={look.face} />
              <ellipse cx="455" cy="194" rx="40" ry="28" fill={look.muzzle} clipPath={`url(#${ids}-face)`} stroke="none" />
              <ellipse cx="406" cy="178" rx="13" ry="8.5" fill="#FF8FB8" stroke="none" opacity=".8" />
              <ellipse cx="504" cy="178" rx="13" ry="8.5" fill="#FF8FB8" stroke="none" opacity=".8" />
              <g ref={part('eyesOpen')}>
                {/* Lashes on the outer corners. */}
                <path d="M417 140L408 134M420 135L414 126M493 140L502 134M490 135L496 126" fill="none" strokeWidth="3.5" />
                <ellipse cx="429" cy="148" rx="14.5" ry="17.5" fill="#3A2630" stroke="none" />
                <ellipse cx="481" cy="148" rx="14.5" ry="17.5" fill="#3A2630" stroke="none" />
                <ellipse cx="429" cy="155" rx="9" ry="7" fill="#6B4650" stroke="none" />
                <ellipse cx="481" cy="155" rx="9" ry="7" fill="#6B4650" stroke="none" />
                <g ref={part('pupils')} fill="#fff" stroke="none">
                  <circle cx="424" cy="141" r="6" />
                  <circle cx="476" cy="141" r="6" />
                  <circle cx="434" cy="155" r="2.6" />
                  <circle cx="486" cy="155" r="2.6" />
                </g>
              </g>
              <g ref={part('eyesShut')} fill="none" strokeWidth="4.5" display="none">
                <path d="M416 148Q429 159 442 148M416 148L409 143" />
                <path d="M468 148Q481 159 494 148M494 148L501 143" />
              </g>
              {kind === 'abuela' && (
                <g fill="none" stroke="#E9A92B" strokeWidth="4.5">
                  <circle cx="429" cy="149" r="22" />
                  <circle cx="481" cy="149" r="22" />
                  <path d="M451 146Q455 141 459 146" />
                </g>
              )}
              {/* A soft rounded nose and a little smile. */}
              <path d="M446 180Q455 174 464 180Q464 187 455 191Q446 187 446 180Z" fill="#4A3038" stroke="none" />
              <path d="M455 191V197" fill="none" strokeWidth="3.5" />
              <path ref={part('mouth')} d={mouthPath(0)} fill="#FF6F9F" strokeWidth="3.5" />
              {mustache && (
                <g>
                  {[[440, 202, 14], [470, 202, 14], [455, 206, 11]].map(([x, y, r]) => (
                    <circle key={x} cx={x} cy={y} r={r + 4} fill={INK} stroke="none" />
                  ))}
                  {[[440, 202, 14], [470, 202, 14], [455, 206, 11]].map(([x, y, r]) => (
                    <g key={x} stroke="none">
                      <circle cx={x} cy={y} r={r} fill={look.shade} />
                      <circle cx={x - 1.5} cy={y - 2} r={r * 0.82} fill={look.fleece} />
                    </g>
                  ))}
                </g>
              )}
            </g>
            {/* Topknot (and bangs) over the forehead: the same woolly clumps as the body. */}
            <g>{puffInk(topPuffs)}</g>
            <g>{puffFill(topPuffs)}</g>
            {bangPuffs.length > 0 && (
              <g ref={bangEls} style={{ transition: 'transform 0.45s cubic-bezier(.3,1.6,.5,1)', transformBox: 'view-box', transformOrigin: '455px 120px' }}>
                {puffInk(bangPuffs)}
                {puffFill(bangPuffs)}
              </g>
            )}
            {kind === 'abuela' && (
              <g transform="translate(506 86)" stroke={INK} strokeWidth="3">
                {[0, 72, 144, 216, 288].map((r) => (
                  <ellipse key={r} cx="0" cy="-10" rx="8" ry="11" fill="#FF9DBF" transform={`rotate(${r})`} />
                ))}
                <circle r="6.5" fill="#FFC83D" />
              </g>
            )}
            {hat && (
              <g transform={`translate(${HAT_SPOT.x} ${HAT_SPOT.y - 8}) scale(1.3)`}>
                <HatShape color={hat} />
              </g>
            )}
            {/* Cold breath puffs drifting from her mouth. */}
            <g ref={part('breath')} display="none" className="peru-breath">
              <circle cx="474" cy="216" r="9" fill="#FFF7F0" stroke={INK} strokeWidth="2.5" />
              <circle cx="494" cy="208" r="12" fill="#FFF7F0" stroke={INK} strokeWidth="2.5" />
              <circle cx="518" cy="198" r="15" fill="#FFF7F0" stroke={INK} strokeWidth="2.5" />
            </g>
            <g ref={part('zzz')} display="none" fill={INK} fontFamily="Fredoka, sans-serif" fontWeight="700">
              <text x="525" y="40" fontSize="30">z</text>
              <text x="545" y="14" fontSize="38">z</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
})

/** The face: rounded on top, a little wider at the cheeks. */
const FACE = 'M455 88C499 88 520 118 520 156C520 198 492 220 455 220C418 220 390 198 390 156C390 118 411 88 455 88Z'

/** The mouth opens downward from a small smile (open: 0 closed .. 1 wide). */
function mouthPath(open: number) {
  return `M442 198Q455 ${(204 + open * 3).toFixed(1)} 468 198Q467 ${(203 + open * 22).toFixed(1)} 455 ${(205 + open * 24).toFixed(1)}Q443 ${(203 + open * 22).toFixed(1)} 442 198Z`
}

/** Hat colors: pink wool dyed with the cochineal bug, and the alpacas' own natural colors. */
export const HAT_COLORS: Record<string, { main: string; accent: string; pom: string }> = {
  pink: { main: '#FF8FB8', accent: '#FFF7F0', pom: '#FF4F9A' },
  hotpink: { main: '#FF4F9A', accent: '#FBEA9A', pom: '#FF8FB8' },
  cream: { main: '#FFF7F0', accent: '#FF8FB8', pom: '#FF8FB8' },
  brown: { main: '#A9714E', accent: '#FFC2A8', pom: '#FF4F9A' },
}

/** A Peruvian chullo: a knitted dome with ear flaps, tassels and a pompom. Drawn around (0, 0); about 120 x 160. */
export function HatShape({ color }: { color: string }) {
  const c = HAT_COLORS[color] ?? HAT_COLORS.pink
  return (
    <g stroke={INK} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
      {/* Ear flaps hang beside the face, with braided ties and little pompoms. */}
      <path d="M-54 8L-58 50Q-50 62 -38 52L-36 14Z" fill={c.main} />
      <path d="M54 8L58 50Q50 62 38 52L36 14Z" fill={c.main} />
      <path d="M-48 58V72M48 58V72" fill="none" strokeWidth="4" />
      <circle cx="-48" cy="77" r="6.5" fill={c.pom} strokeWidth="3.5" />
      <circle cx="48" cy="77" r="6.5" fill={c.pom} strokeWidth="3.5" />
      <path d="M-55 16Q-58 -50 0 -54Q58 -50 55 16Q0 28 -55 16Z" fill={c.main} />
      {/* Knitted pattern: a zigzag band, a row of dots and a striped brim. */}
      <path d="M-52 -6L-39 -17L-26 -6L-13 -17L0 -6L13 -17L26 -6L39 -17L52 -6" fill="none" stroke={c.accent} strokeWidth="6" />
      <path d="M-54 6Q0 16 54 6" fill="none" stroke={c.accent} strokeWidth="5" />
      <circle cx="-22" cy="-32" r="4.5" fill={c.accent} stroke="none" />
      <circle cx="0" cy="-38" r="4.5" fill={c.accent} stroke="none" />
      <circle cx="22" cy="-32" r="4.5" fill={c.accent} stroke="none" />
      <path d="M-55 16Q0 28 55 16" fill="none" />
      <circle cx="0" cy="-62" r="14" fill={c.pom} />
    </g>
  )
}

/** Converts a point in the alpaca's picture (viewBox units) to a share of its box, for placing things over it. */
export const shareOf = (x: number, y: number) => ({ x: x / VIEW.w, y: y / VIEW.h })
export { BODY_MID, HAT_SPOT }

// A xiaolongbao soup dumpling as a tiny puppet, drawn like the kawaii sticker reference (art/source/world/china/
// ref-kawaii.jpg): cream dough, chunky warm-brown outline, blush, dot or arc eyes, pleats curving up to a twisted top.
// One component covers every state she makes it through, so the same little character squishes, gets filled, folded,
// steamed and eaten:
//   dough → (smooth) dough → wrapper → filled → pleated (sleepy) → steaming (wobbly, "ooh") → cooked (shiny) → nibbled → eaten
import { forwardRef, useId, type CSSProperties } from 'react'
import { bell, setA, setT, show, span, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { BLUSH, EYE, INK, TONGUE } from './ink'

export type DumplingState = 'dough' | 'wrapper' | 'filled' | 'pleated' | 'steaming' | 'cooked' | 'nibbled' | 'eaten'
export type DumplingFace = 'happy' | 'smile' | 'content' | 'surprised' | 'giggle' | 'none'
export type DoughColor = 'cream' | 'pink' | 'green' | 'yellow'

/** Fill, shade band and a slightly darker pleat line for each dough (colored xiaolongbao are real in Shanghai). */
export const DOUGH: Record<DoughColor, { fill: string; shade: string; name: string }> = {
  cream: { fill: '#F7E7DA', shade: '#F2D2BE', name: 'cream' },
  pink: { fill: '#FCD3DA', shade: '#F6B6C4', name: 'pink' },
  green: { fill: '#D6EBC4', shade: '#BCDBA4', name: 'green' },
  yellow: { fill: '#FCEBAE', shade: '#F4D685', name: 'yellow' },
}

export const DUMPLING_ACTIONS: Record<string, number> = { squish: 0.45, hop: 0.7, wobble: 0.9, giggle: 0.6, pop: 0.35, boing: 0.6 }

const W = 5.5 // outline: chunky, like the sticker reference
const FACE_FOR: Record<DumplingState, DumplingFace> = { dough: 'content', wrapper: 'smile', filled: 'smile', pleated: 'content', steaming: 'surprised', cooked: 'happy', nibbled: 'happy', eaten: 'happy' }
const PLEATS = 5 // pleat lines drawn at the top (the real thing has 18 folds; five chunky ones read clearly at this size)

type Part = 'root' | 'body' | 'face' | 'eyeL' | 'eyeR' | 'mouth' | 'steam' | 'puff' | 'shine'

export interface DumplingProps {
  state: DumplingState
  face?: DumplingFace
  color?: DoughColor
  /** 0..1 of the pleats folded so far (the pleat gesture reveals them); `pleated` and later default to all. */
  pleats?: number
  /** For `dough`: 0 = lumpy, 1 = kneaded smooth and shiny. */
  smooth?: number
  /** Soft steam curls rising (hot out of the basket). */
  steam?: boolean
  /** CSS width (the dumpling is square). */
  size: string
  style?: CSSProperties
  onTap?: () => void
  label?: string
}

export const Dumpling = forwardRef<PuppetHandle, DumplingProps>(function Dumpling({ state, face, color = 'cream', pleats, smooth = 1, steam, size, style, onTap, label }, ref) {
  const c = DOUGH[color]
  const uid = useId().replace(/:/g, '')
  const f = face ?? FACE_FOR[state]
  const bun = state === 'pleated' || state === 'steaming' || state === 'cooked' || state === 'nibbled'
  const folded = pleats ?? (bun ? 1 : 0)
  const { svg, part } = usePuppet<Part>(ref, {
    actions: DUMPLING_ACTIONS,
    eyes: [100, 128],
    frame: (fr, p) => {
      const t = fr.t
      const q = fr.p
      let sx = 1 + Math.sin(t * 2.4) * 0.012
      let sy = 1 - Math.sin(t * 2.4) * 0.018
      let y = 0
      let rot = 0
      if (state === 'steaming') {
        // Wobbling in the steamer: a little jelly jiggle all the time.
        rot += Math.sin(t * 11) * 2.5
        sx += Math.sin(t * 13) * 0.025
        sy -= Math.sin(t * 13) * 0.03
      }
      if (fr.action === 'squish') {
        const press = bell(span(q, 0, 0.35))
        const back = wobble(span(q, 0.35, 1), 2)
        sx += press * 0.28 + back * 0.1
        sy -= press * 0.3 + back * 0.12
      } else if (fr.action === 'hop' || fr.action === 'boing') {
        const crouch = bell(span(q, 0, 0.22))
        const air = fr.action === 'hop' ? bell(span(q, 0.22, 0.7)) : 0
        const land = wobble(span(q, fr.action === 'hop' ? 0.7 : 0, 1), 2)
        sx += crouch * 0.18 - air * 0.1 + land * 0.16
        sy += -crouch * 0.2 + air * 0.14 - land * 0.18
        y -= air * 46
      } else if (fr.action === 'wobble') {
        rot += wobble(q, 3) * 10
        sx += wobble(q, 4) * 0.06
      } else if (fr.action === 'giggle') {
        rot += Math.sin(q * Math.PI * 8) * 7 * bell(q)
        y -= Math.abs(Math.sin(q * Math.PI * 4)) * 6
      } else if (fr.action === 'pop') {
        const b = bell(q)
        sx += b * 0.12
        sy += b * 0.12
      }
      setT(p.root, `translate(0 ${y}) translate(100 186) rotate(${rot}) scale(${sx} ${sy}) translate(-100 -186)`)
      // Dot eyes blink and glance toward her finger; arcs stay put.
      const dots = f === 'smile' || f === 'surprised'
      for (const eye of [p.eyeL, p.eyeR]) setA(eye, 'transform', dots ? `translate(${fr.look.x * 2.5} ${fr.look.y * 2}) scale(1 ${fr.blink})` : '')
      if (p.steam) {
        const k = (t * 0.6) % 1
        setT(p.steam, `translate(0 ${-k * 14})`)
        ;(p.steam as SVGElement).style.opacity = String(0.9 * bell(k))
      }
      if (p.shine) (p.shine as SVGElement).style.opacity = String(0.75 + Math.sin(t * 3) * 0.2)
      show(p.puff, state === 'eaten')
    },
  })

  // Body shapes (viewBox 200x200, sitting on y = 186).
  const bunBody = 'M28 130 C28 84 60 58 100 58 C140 58 172 84 172 130 C172 168 142 186 100 186 C58 186 28 168 28 130Z'
  const knot = 'M68 74 C64 62 72 54 81 57 C80 45 92 41 99 48 C104 39 117 42 117 53 C126 49 136 58 132 70 C133 73 131 76 128 76 Z'
  const bunShade = 'M30 146 C44 170 70 180 100 180 C130 180 156 170 170 146 C168 172 140 186 100 186 C60 186 32 172 30 146Z'
  const doughBody = smooth > 0.5 ? 'M34 150 C30 112 60 88 100 88 C140 88 170 112 166 150 C164 178 136 186 100 186 C64 186 36 178 34 150Z' : 'M36 152 C26 130 44 100 70 96 C82 84 110 84 124 94 C150 96 172 120 164 150 C170 172 144 186 100 186 C60 188 30 176 36 152Z'
  const doughShade = 'M38 164 C54 178 76 182 100 182 C124 182 146 178 162 164 C158 180 134 186 100 186 C66 186 42 180 38 164Z'
  const disc = { cx: 100, cy: 160, rx: 86, ry: 30 }

  // Face placement per shape: eyes wide and low on the bun, smaller on the flat wrapper.
  const faceAt = bun ? 'translate(0 0)' : state === 'dough' ? 'translate(100 150) scale(0.86) translate(-100 -132)' : 'translate(100 158) scale(0.62) translate(-100 -130)'
  const eyes = (s: 'L' | 'R') => {
    const x = s === 'L' ? 70 : 130
    const k = s === 'L' ? 'eyeL' : 'eyeR'
    if (f === 'smile' || f === 'surprised')
      return (
        <g transform={`translate(${x} 128)`}>
          <g ref={part(k)}>
            <ellipse rx={f === 'surprised' ? 7.5 : 6.5} ry={f === 'surprised' ? 9 : 8} fill={EYE} />
            <circle cx={-2} cy={-3} r={2.2} fill="#fff" />
          </g>
        </g>
      )
    // Arcs: happy/giggle look up (^ ^), content is closed (‿ ‿).
    const d = f === 'content' ? 'M-9 -2 Q0 6 9 -2' : 'M-9 3 Q0 -8 9 3'
    return <path transform={`translate(${x} 128)`} d={d} fill="none" stroke={EYE} strokeWidth={4.5} strokeLinecap="round" />
  }
  const mouth = () => {
    if (f === 'happy' || f === 'giggle')
      return (
        <g>
          <path d="M88 138 Q100 136 112 138 Q110 156 100 156 Q90 156 88 138Z" fill="#8E3B2E" stroke={EYE} strokeWidth={3.5} strokeLinejoin="round" />
          <path d="M93 151 Q100 145 107 151 Q104 155 100 155 Q96 155 93 151Z" fill={TONGUE} />
        </g>
      )
    if (f === 'surprised') return <ellipse cx={100} cy={144} rx={6} ry={7} fill="#8E3B2E" stroke={EYE} strokeWidth={3.5} />
    return <path d="M89 140 Q100 150 111 140" fill="none" stroke={EYE} strokeWidth={4} strokeLinecap="round" />
  }

  // Pleats: curved lines from the knot fanning down over the top of the bun, revealed one by one.
  const shown = Math.round(folded * PLEATS)
  const pleatLines = Array.from({ length: PLEATS }, (_, i) => {
    const a = (i - (PLEATS - 1) / 2) / ((PLEATS - 1) / 2) // -1..1
    const x0 = 100 + a * 20
    const x1 = 100 + a * 30
    const len = 84 + (1 - Math.abs(a)) * 6
    return <path key={i} d={`M${x0} 60 Q${x0 + a * 9} ${len - 12} ${x1} ${len}`} fill="none" stroke={INK} strokeWidth={4.4} strokeLinecap="round" style={{ opacity: i < shown ? 1 : 0, transition: 'opacity .2s' }} />
  })

  const eatenOnly = state === 'eaten'
  return (
    <svg ref={svg} viewBox="0 0 200 200" onClick={onTap} role={onTap ? 'button' : undefined} aria-label={onTap ? (label ?? 'dumpling') : undefined} style={{ width: size, display: 'block', overflow: 'visible', ...style }}>
      <g ref={part('root')}>
        {!eatenOnly && (
          <g ref={part('body')}>
            {state === 'dough' && (
              <>
                <path d={doughBody} fill={c.fill} stroke={INK} strokeWidth={W} strokeLinejoin="round" />
                <path d={doughShade} fill={c.shade} />
                {smooth > 0.5 && <ellipse cx={72} cy={108} rx={12} ry={6} fill="#fff" opacity={0.6} transform="rotate(-20 72 108)" />}
              </>
            )}
            {(state === 'wrapper' || state === 'filled') && (
              <>
                <ellipse {...disc} fill={c.fill} stroke={INK} strokeWidth={W} />
                <path d="M16 162 C30 184 70 190 100 190 C130 190 170 184 184 162 C176 180 140 190 100 190 C60 190 24 180 16 162Z" fill={c.shade} />
                <ellipse cx={100} cy={156} rx={62} ry={19} fill="none" stroke={INK} strokeWidth={2.4} opacity={0.35} />
                {state === 'filled' && (
                  <g>
                    <path d="M72 158 C72 136 84 128 100 128 C116 128 128 136 128 158 C122 166 78 166 72 158Z" fill="#E29A78" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
                    <path d="M80 150 C84 140 92 136 100 136" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.6} />
                    <circle cx={112} cy={146} r={3} fill="#9CCB7A" />
                    <circle cx={92} cy={152} r={2.6} fill="#9CCB7A" />
                  </g>
                )}
              </>
            )}
            {bun && (
              <g mask={state === 'nibbled' ? `url(#bitemask-${uid})` : undefined}>
                <defs>
                  <mask id={`bitemask-${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200">
                    <rect width="200" height="200" fill="#fff" />
                    <circle cx={160} cy={76} r={24} fill="#000" />
                  </mask>
                  <clipPath id={`bite-${uid}`}>
                    <path d={bunBody} />
                  </clipPath>
                </defs>
                <g fill={INK} stroke={INK} strokeWidth={W * 2} strokeLinejoin="round">
                  <path d={bunBody} />
                  {folded > 0 && <path d={knot} style={{ transform: `scaleY(${0.3 + folded * 0.7})`, transformOrigin: '100px 70px' }} />}
                </g>
                <path d={bunBody} fill={c.fill} />
                {folded > 0 && <path d={knot} fill={c.fill} style={{ transform: `scaleY(${0.3 + folded * 0.7})`, transformOrigin: '100px 70px' }} />}
                <path d={bunShade} fill={c.shade} />
                {pleatLines}
                {state === 'nibbled' && (
                  <g>
                    <circle cx={156} cy={80} r={25} fill="#F6C766" stroke={INK} strokeWidth={4} clipPath={`url(#bite-${uid})`} />
                    <path d="M136 72 Q146 86 160 80" fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" opacity={0.7} />
                  </g>
                )}
                {(state === 'cooked' || state === 'nibbled') && <ellipse ref={part('shine')} cx={62} cy={92} rx={11} ry={7} fill="#fff" transform="rotate(-30 62 92)" />}
              </g>
            )}
            {f !== 'none' && (
              <g ref={part('face')} transform={faceAt}>
                <ellipse cx={f === 'giggle' ? 54 : 56} cy={145} rx={12} ry={7} fill={BLUSH} />
                <ellipse cx={f === 'giggle' ? 146 : 144} cy={145} rx={12} ry={7} fill={BLUSH} />
                {eyes('L')}
                {eyes('R')}
                <g ref={part('mouth')}>{mouth()}</g>
              </g>
            )}
          </g>
        )}
        {/* Eaten: a happy little puff of steam where the dumpling was. */}
        <g ref={part('puff')} style={{ display: 'none' }}>
          <path d="M60 150 C44 150 40 128 56 122 C54 104 76 96 88 106 C94 90 120 90 124 108 C140 100 160 114 150 130 C164 136 158 156 142 154 C130 166 76 166 60 150Z" fill="#FFF7F0" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
          <path d="M84 130 Q90 124 96 130 M104 130 Q110 124 116 130" fill="none" stroke={EYE} strokeWidth={3.5} strokeLinecap="round" />
          <path d="M94 140 Q100 146 106 140" fill="none" stroke={EYE} strokeWidth={3.5} strokeLinecap="round" />
        </g>
        {steam && (
          <g ref={part('steam')} fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.9}>
            <path d="M80 44 C70 32 90 24 80 10" />
            <path d="M118 40 C108 28 128 20 118 6" />
          </g>
        )}
      </g>
    </svg>
  )
})

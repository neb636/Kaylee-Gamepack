// Jamal the camel: a layered SVG puppet, side view with his head turned to her. His long neck sways on a spring (so his
// head lags and bobs when he walks), his droopy eyelids blink slowly, his jaw chews, and his tail swishes. Actions: walk
// (four legs stepping), chew, cheer, shake (no, no), nod, wiggle, dance. Voice: jamal.
import { forwardRef, useId, useRef, type CSSProperties } from 'react'
import { bell, clamp, lerp, setA, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { inkPass as inkPassIn, line as lineIn, useInk } from '../../../kit/ink'

export interface JamalProps {
  height?: string
  style?: CSSProperties
  flip?: boolean
  onTap?: () => void
}

const FUR = '#E8B98A'
const FUR_DARK = '#D39B66'
const BELLY = '#F4D2AE'
const HOOF = '#8C5A3A'
const INK = '#3F2A26'
const inkPass = () => inkPassIn(undefined, INK)
const line = (width?: number) => lineIn(width, INK)

export const JAMAL_ACTIONS = { walk: 1.1, chew: 1.3, cheer: 1.1, shake: 0.9, nod: 0.7, wiggle: 0.6, dance: 1.8 }

type Leg = 'legBL' | 'legBR' | 'legFL' | 'legFR'
type Part = 'root' | 'shadow' | 'neck' | 'head' | 'tail' | Leg | 'eyes' | 'lidL' | 'lidR' | 'lidLineL' | 'lidLineR' | 'happy' | 'jaw' | 'mouth' | 'smile' | 'earL' | 'earR'

// Leg tops (hips and shoulders), in viewBox units.
const LEGS: { id: Leg; x: number; back: boolean; phase: number }[] = [
  { id: 'legBR', x: 168, back: true, phase: Math.PI },
  { id: 'legFR', x: 340, back: true, phase: 0 },
  { id: 'legBL', x: 196, back: false, phase: 0 },
  { id: 'legFL', x: 368, back: false, phase: Math.PI },
]

/** Jamal the camel. Actions: walk, chew, cheer, shake, nod, wiggle, dance. Voice: jamal. */
export const Jamal = forwardRef<PuppetHandle, JamalProps>(function Jamal({ height, style, flip, onTap }, ref) {
  const id = useId().replace(/:/g, '')
  const st = useRef({ neck: spring(60, 7), head: spring(90, 8), tail: spring(50, 4), ears: spring(120, 7), neckRot: 0 }).current
  const ink = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'jamal',
    actions: JAMAL_ACTIONS,
    eyes: [452, 104],
    frame: (f, p) => {
      const { t, dt, look } = f
      const q = f.p
      const act = f.action
      const env = smooth(span(q, 0, 0.15)) * (1 - smooth(span(q, 0.85, 1)))

      const breath = Math.sin(t * 1.6)
      let sx = 1 + breath * 0.006
      let sy = 1 - breath * 0.004
      let lift = 0
      let rot = 0
      let neckTarget = Math.sin(t * 0.9) * 3 + look.y * 3
      let headTarget = look.x * 6 + Math.sin(t * 1.3) * 2
      let lid = 0.1 // relaxed, friendly eyes
      let happy = false
      let jaw = f.mouth * 0.9
      let tailWag = Math.sin(t * 1.4) * 8
      const legs: Record<Leg, number> = { legBL: 0, legBR: 0, legFL: 0, legFR: 0 }

      if (act === 'walk') {
        const cyc = q * Math.PI * 4
        for (const l of LEGS) legs[l.id] = Math.sin(cyc + l.phase) * 16 * env
        lift = Math.abs(Math.sin(cyc)) * 6 * env
        neckTarget += Math.sin(cyc * 2) * 5 * env
        tailWag += Math.sin(cyc) * 16
      } else if (act === 'chew') {
        jaw = Math.max(jaw, (0.2 + 0.25 * Math.abs(Math.sin(q * Math.PI * 7))) * env)
        headTarget += Math.sin(q * Math.PI * 7) * 3 * env
        lid = lerp(lid, 0.7, env)
        happy = true
      } else if (act === 'cheer') {
        const crouch = bell(span(q, 0, 0.22))
        const air = bell(span(q, 0.22, 0.7))
        const land = wobble(span(q, 0.7, 1), 2)
        sx *= 1 + crouch * 0.08 - air * 0.04 + land * 0.06
        sy *= 1 - crouch * 0.1 + air * 0.08 - land * 0.08
        lift = air * 50
        rot = -air * 6
        neckTarget -= air * 14
        legs.legFL = legs.legFR = -air * 24
        legs.legBL = legs.legBR = air * 14
        happy = true
        lid = 0
        jaw = Math.max(jaw, 0.6 * env)
        tailWag += air * 30
      } else if (act === 'shake') {
        headTarget += Math.sin(q * Math.PI * 6) * 18 * (1 - q)
        lid = lerp(lid, 0.2, env)
      } else if (act === 'nod') {
        neckTarget += bell(q) * 12
        happy = true
      } else if (act === 'wiggle') {
        const w = wobble(q, 3)
        sx *= 1 + 0.05 * w
        sy *= 1 - 0.05 * w
        rot += w * 3
        happy = true
      } else if (act === 'dance') {
        const beat = q * Math.PI * 8
        rot = Math.sin(beat / 2) * 5 * bell(q)
        lift = Math.abs(Math.sin(beat)) * 14 * env
        neckTarget += Math.sin(beat / 2) * 12 * env
        headTarget += Math.sin(beat / 2 + 1) * 10 * env
        for (const l of LEGS) legs[l.id] = Math.sin(beat + l.phase) * 12 * env
        happy = true
        jaw = Math.max(jaw, 0.4 * env)
        tailWag = Math.sin(beat) * 30
      }
      // Talking nods his head a little.
      neckTarget += Math.sin(t * 9) * f.mouth * 3

      // The neck lags, then the head lags the neck.
      const neck = st.neck.step(neckTarget - lift * 0.1, dt)
      const vel = (neck - st.neckRot) / Math.max(dt, 0.001)
      st.neckRot = neck
      const head = st.head.step(headTarget + clamp(-vel * 0.2, -12, 12), dt)
      const ears = st.ears.step(clamp(-vel * 0.5, -25, 25), dt)
      const tail = st.tail.step(tailWag, dt)

      setT(p.root, `translate(0 ${-lift}) rotate(${rot} 260 460) translate(260 460) scale(${sx} ${sy}) translate(-260 -460)`)
      setT(p.shadow, `translate(262 464) scale(${1 - Math.min(0.4, lift / 200)})`)
      setT(p.neck, `rotate(${neck} 352 236)`)
      setT(p.head, `rotate(${head} 440 150)`)
      setT(p.tail, `rotate(${tail} 102 228)`)
      setT(p.earL, `rotate(${-ears} 414 70)`)
      setT(p.earR, `rotate(${ears} 482 70)`)
      for (const l of LEGS) setT(p[l.id], `rotate(${legs[l.id]} ${l.x} 300)`)

      const closed = happy ? 0 : Math.max(lid, 1 - f.blink)
      show(p.eyes, !happy)
      show(p.happy, happy)
      // Heavy eyelids: a fur-colored lid slides down inside each eye, with a line along its edge.
      for (const [lidEl, edge, x] of [
        [p.lidL, p.lidLineL, 432],
        [p.lidR, p.lidLineR, 472],
      ] as const) {
        const y = 88 + 28 * clamp(closed)
        setA(lidEl, 'd', `M${x - 13} 84 H${x + 13} V${y} Q${x} ${y + 5} ${x - 13} ${y} Z`)
        const w = 11 * Math.sqrt(Math.max(0, 1 - ((y + 2 - 102) / 14) ** 2)) + 1
        setA(edge, 'd', closed > 0.04 ? `M${x - w} ${y} Q${x} ${y + 5} ${x + w} ${y}` : '')
      }
      const j = Math.min(1, jaw)
      setT(p.jaw, `translate(0 ${j * 5})`)
      show(p.smile, j <= 0.05)
      setA(p.mouth, 'd', j > 0.05 ? `M446 146 Q470 ${146 + 4 + 14 * j} 494 146 Z` : '')
      ink.sync(p)
    },
  })

  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))

  const leg = (l: (typeof LEGS)[number], pass: boolean) => (
    <g key={l.id} ref={r(l.id, pass)}>
      <path fill={l.back ? FUR_DARK : FUR} d={`M${l.x - 16} 290 L${l.x - 12} 370 C${l.x - 14} 380 ${l.x - 14} 390 ${l.x - 10} 398 L${l.x - 10} 446 L${l.x + 10} 446 L${l.x + 10} 398 C${l.x + 14} 390 ${l.x + 14} 380 ${l.x + 12} 370 L${l.x + 16} 290 Z`} />
      <path fill={l.back ? FUR_DARK : FUR} d={`M${l.x - 13} 440 C${l.x - 23} 440 ${l.x - 24} 454 ${l.x - 14} 457 C${l.x - 4} 460 ${l.x + 16} 459 ${l.x + 20} 452 Q${l.x + 24} 440 ${l.x + 12} 440 Z`} />
      {!pass && <path {...line(2)} d={`M${l.x + 3} 450 L${l.x + 3} 457`} />}
    </g>
  )

  const back = (pass: boolean) => (
    <>
      <g ref={r('tail', pass)}>
        <path fill="none" stroke={pass ? INK : FUR_DARK} strokeWidth={pass ? 16 : 9} strokeLinecap="round" d="M104 228 C86 250 84 282 90 312" />
        <path fill={HOOF} d="M80 300 C74 330 106 334 102 304 Z" />
      </g>
      {LEGS.filter((l) => l.back).map((l) => leg(l, pass))}
    </>
  )

  const body = (pass: boolean) => (
    <>
      {/* Body with one big hump */}
      <path fill={FUR} d="M104 232 C104 196 140 176 176 176 C188 122 234 96 262 96 C300 96 330 130 340 176 C372 180 400 206 400 244 C400 296 360 318 300 320 L180 320 C130 320 104 290 104 232 Z" />
      {!pass && <path fill={BELLY} d="M150 300 C200 318 300 318 350 300 C330 318 300 322 260 322 C210 322 170 318 150 300 Z" />}
      {LEGS.filter((l) => !l.back).map((l) => leg(l, pass))}
    </>
  )

  const neckAndHead = (pass: boolean) => (
    <g ref={r('neck', pass)}>
      <path fill={FUR} d="M322 200 C346 170 372 150 392 128 C404 114 424 112 436 126 C446 140 440 156 428 166 C408 184 392 212 388 248 L330 262 Z" />
      <g ref={r('head', pass)}>
        <g ref={r('earL', pass)}>
          <path fill={FUR} d="M404 78 C398 60 410 50 422 58 C426 66 422 74 416 80 Z" />
        </g>
        <g ref={r('earR', pass)}>
          <path fill={FUR} d="M492 78 C498 60 486 50 474 58 C470 66 474 74 480 80 Z" />
        </g>
        {/* Head and big soft muzzle */}
        <path fill={FUR} d="M452 58 C492 58 510 84 508 110 C520 120 522 150 500 160 C484 168 456 168 440 160 C414 150 402 128 404 104 C406 76 424 58 452 58 Z" />
        <g ref={r('jaw', pass)}>
          <path fill={BELLY} d="M436 132 C436 118 460 112 480 114 C504 116 514 128 510 142 C506 154 486 158 466 156 C446 154 436 146 436 132 Z" />
          {!pass && <>
            <path ref={part('mouth')} fill="#B8323F" stroke={INK} strokeWidth="3" d="" />
            <path ref={part('smile')} {...line(3.2)} d="M446 146 Q470 154 494 146" />
            <path {...line(3.4)} d="M462 128 Q466 124 470 128 M486 126 Q490 122 494 126" />
          </>}
        </g>
        {!pass && (
          <>
            <ellipse fill="#FF9DB0" opacity="0.8" cx="420" cy="122" rx="13" ry="8" />
            <g ref={part('eyes')}>
              {[432, 472].map((x) => (
                <g key={x}>
                  <clipPath id={`${id}-eye${x}`}>
                    <ellipse cx={x} cy="102" rx="11" ry="14" />
                  </clipPath>
                  <g transform={`translate(${x} 102)`}>
                    <ellipse fill="#2E1C1A" rx="11" ry="14" />
                    <circle fill="#fff" cx="-3" cy="-5" r="4" />
                    <circle fill="#fff" cx="4" cy="4" r="1.8" />
                  </g>
                  <path ref={part(x === 432 ? 'lidL' : 'lidR')} fill={FUR} clipPath={`url(#${id}-eye${x})`} d="" />
                  <path ref={part(x === 432 ? 'lidLineL' : 'lidLineR')} {...line(3)} d="" />
                </g>
              ))}
              <path {...line(2.6)} d="M418 100 L410 104 M419 106 L411 112 M486 100 L494 104 M485 106 L493 112" />
            </g>
            <g ref={part('happy')} style={{ display: 'none' }}>
              <path {...line(4)} d="M420 104 Q432 94 444 104 M460 104 Q472 94 484 104" />
            </g>
            <path {...line(3)} d="M426 82 Q434 78 442 82 M462 82 Q470 78 478 82" />
          </>
        )}
      </g>
    </g>
  )

  // The cloth follows the hump's silhouette all the way over its peak. Clip the weave
  // to the drape so the colored bands never spill over its curved edges.
  const drape = 'M174 178 C186 122 232 94 262 94 C302 94 332 130 342 178 L350 238 Q262 260 166 238 Z'
  const blanket = (
    <g strokeLinejoin="round">
      <defs>
        <clipPath id={`${id}-blanket`}><path d={drape} /></clipPath>
      </defs>
      <path d={drape} fill="#FF8FB8" />
      <g clipPath={`url(#${id}-blanket)`}>
        <path d="M172 182 Q262 204 344 182" fill="none" stroke="#8FE3C8" strokeWidth="14" />
        <path d="M188 151 L202 163 L216 151 L230 163 L244 151 L258 163 L272 151 L286 163 L300 151 L314 163 L328 151" fill="none" stroke="#FFC83D" strokeWidth="5" />
        <path d="M164 226 Q262 248 352 226" fill="none" stroke="#FFC83D" strokeWidth="5" />
      </g>
      <path d={drape} fill="none" stroke={INK} strokeWidth="3.2" />
      {[180, 210, 240, 270, 300, 330].map((x) => (
        <g key={x} transform={`translate(${x} ${249 - 11 * ((x - 258) / 92) ** 2})`}>
          <line y2="9" stroke={INK} strokeWidth="2.5" />
          <path d="M-5 9 H5 L3 22 H-3 Z" fill="#FFC83D" stroke={INK} strokeWidth="2.5" />
        </g>
      ))}
    </g>
  )

  const all = (
    <>
      <ellipse ref={part('shadow')} rx="170" ry="14" fill="#6B3A2A" opacity="0.18" />
      <g ref={part('root')} strokeLinejoin="round">
        <g {...inkPass()}>{back(true)}</g>
        {back(false)}
        <g {...inkPass()}>{neckAndHead(true)}</g>
        <g {...inkPass()}>{body(true)}</g>
        {body(false)}
        {neckAndHead(false)}
        {blanket}
      </g>
    </>
  )
  return (
    <svg ref={svg} viewBox="60 40 470 430" onClick={onTap} role={onTap ? 'button' : undefined} aria-label="Jamal the camel" style={{ height, aspectRatio: '470 / 430', overflow: 'visible', display: 'block', transform: flip ? 'scaleX(-1)' : undefined, ...style }}>
      {all}
    </svg>
  )
})

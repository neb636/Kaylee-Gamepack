// Jamal the camel: a layered SVG puppet, drawn by hand in the Nile's look (one bold ink line, round shapes, plain dark
// eyes with two highlights: the hippo's look). Side view with his head turned to her. His long neck sways on a spring (so his
// head lags and bobs when he walks), his droopy eyelids blink slowly, his jaw chews, and his tail swishes. Actions: walk
// (four legs stepping), chew, cheer, shake (no, no), nod, wiggle, dance. Voice: jamal.
import { forwardRef, useId, useRef, type CSSProperties } from 'react'
import { bell, clamp, lerp, setA, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { INK, inkStyle, useInk } from '../../../kit/ink'

export interface JamalProps {
  height?: string
  style?: CSSProperties
  flip?: boolean
  onTap?: () => void
}

const FUR = '#F0C795'
const FUR_DARK = '#DDA873'
const BELLY = '#FBE3C2'
const HOOF = '#9A6646'
// The hippo's line: 6 units of ink around every part.
const { inkPass, line } = inkStyle(INK, 6, 0.75)
/** His eyes: where they are, and how big. */
const EYES = [426, 474]
const EYE = { y: 95, rx: 13, ry: 16 }

export const JAMAL_ACTIONS = { walk: 1.1, chew: 1.3, cheer: 1.1, shake: 0.9, nod: 0.7, wiggle: 0.6, dance: 1.8 }

type Leg = 'legBL' | 'legBR' | 'legFL' | 'legFR'
type Part = 'root' | 'shadow' | 'neck' | 'head' | 'tail' | Leg | 'eyes' | 'lidL' | 'lidR' | 'lidLineL' | 'lidLineR' | 'happy' | 'jaw' | 'mouth' | 'smile' | 'earL' | 'earR'

// Leg tops (hips and shoulders), in viewBox units.
const LEGS: { id: Leg; x: number; back: boolean; phase: number }[] = [
  { id: 'legBR', x: 158, back: true, phase: Math.PI },
  { id: 'legFR', x: 330, back: true, phase: 0 },
  { id: 'legBL', x: 202, back: false, phase: 0 },
  { id: 'legFL', x: 370, back: false, phase: Math.PI },
]

/** Jamal the camel. Actions: walk, chew, cheer, shake, nod, wiggle, dance. Voice: jamal. */
export const Jamal = forwardRef<PuppetHandle, JamalProps>(function Jamal({ height, style, flip, onTap }, ref) {
  const id = useId().replace(/:/g, '')
  const st = useRef({ neck: spring(60, 7), head: spring(90, 8), tail: spring(50, 4), ears: spring(120, 7), neckRot: 0 }).current
  const ink = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'jamal',
    actions: JAMAL_ACTIONS,
    eyes: [450, 95],
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
      let lid = 0 // wide, friendly eyes; his heavy lids come down when he chews
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
      setT(p.earR, `rotate(${ears} 490 70)`)
      for (const l of LEGS) setT(p[l.id], `rotate(${legs[l.id]} ${l.x} 300)`)

      const closed = happy ? 0 : Math.max(lid, 1 - f.blink)
      show(p.eyes, !happy)
      show(p.happy, happy)
      // Heavy eyelids: a fur-colored lid slides down inside each eye, with a line along its edge.
      for (const [lidEl, edge, x] of [
        [p.lidL, p.lidLineL, EYES[0]],
        [p.lidR, p.lidLineR, EYES[1]],
      ] as const) {
        const top = EYE.y - EYE.ry
        const y = top + 2 + (EYE.ry * 2 - 2) * clamp(closed)
        setA(lidEl, 'd', closed <= 0.04 ? '' : `M${x - EYE.rx - 2} ${top - 4} H${x + EYE.rx + 2} V${y} Q${x} ${y - 4} ${x - EYE.rx - 2} ${y} Z`)
        const w = EYE.rx * Math.sqrt(Math.max(0, 1 - ((y - EYE.y) / EYE.ry) ** 2))
        setA(edge, 'd', closed > 0.04 ? `M${x - w} ${y} Q${x} ${y - 4} ${x + w} ${y}` : '')
      }
      const j = Math.min(1, jaw)
      setT(p.jaw, `translate(0 ${j * 6})`)
      show(p.smile, j <= 0.05)
      setA(p.mouth, 'd', j > 0.05 ? `M448 148 Q472 ${148 + 5 + 16 * j} 496 148 Z` : '')
      ink.sync(p)
    },
  })

  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))

  const leg = (l: (typeof LEGS)[number], pass: boolean) => {
    const x = l.x
    const foot = `C${x - 18} 452 ${x - 10} 459 ${x + 1} 459 C${x + 13} 459 ${x + 21} 452 ${x + 19} 438`
    return (
      <g key={l.id} ref={r(l.id, pass)}>
        <path fill={l.back ? FUR_DARK : FUR} d={`M${x - 21} 286 L${x - 18} 438 ${foot} L${x + 21} 286 Z`} />
        {!pass && (
          <>
            <path fill={HOOF} d={`M${x - 18} 430 L${x - 18} 438 ${foot} L${x + 19} 430 Z`} />
            <path {...line()} d={`M${x - 18} 430 H${x + 19}`} />
            <path {...line(3.5)} d={`M${x + 1} 446 V458`} />
          </>
        )}
      </g>
    )
  }

  const back = (pass: boolean) => (
    <>
      <g ref={r('tail', pass)}>
        <path fill="none" stroke={pass ? INK : FUR_DARK} strokeWidth={pass ? 24 : 12} strokeLinecap="round" d="M106 230 C86 252 84 284 90 310" />
        <path fill={HOOF} d="M78 300 C70 336 110 340 104 304 Z" />
      </g>
      {LEGS.filter((l) => l.back).map((l) => leg(l, pass))}
    </>
  )

  const body = (pass: boolean) => (
    <>
      {/* A round body with one big hump */}
      <path fill={FUR} d="M100 244 C100 200 136 180 178 178 C190 118 232 92 262 92 C298 92 330 124 342 178 C378 182 404 208 404 248 C404 308 364 340 300 340 L184 340 C132 340 100 306 100 244 Z" />
      {!pass && <path fill={BELLY} d="M126 304 C190 328 314 328 380 304 C356 332 320 340 262 340 L184 340 C156 340 136 326 126 304 Z" />}
      {LEGS.filter((l) => !l.back).map((l) => leg(l, pass))}
    </>
  )

  const neckAndHead = (pass: boolean) => (
    <g ref={r('neck', pass)}>
      <path fill={FUR} d="M310 204 C338 170 364 150 386 126 C402 108 430 106 444 124 C456 140 452 162 438 174 C420 192 408 218 406 256 L324 270 Z" />
      <g ref={r('head', pass)}>
        <g ref={r('earL', pass)}>
          <path fill={FUR} d="M408 78 C396 54 408 38 424 48 C431 58 428 72 420 82 Z" />
        </g>
        <g ref={r('earR', pass)}>
          <path fill={FUR} d="M496 78 C508 54 496 38 480 48 C473 58 476 72 484 82 Z" />
        </g>
        {/* a tuft of hair between his ears */}
        <path fill={FUR_DARK} d="M436 54 C432 38 444 30 451 40 C456 28 472 32 468 54 Z" />
        {/* A round head and a big soft muzzle */}
        <path fill={FUR} d="M452 46 C494 46 516 74 514 104 C528 116 530 150 506 164 C488 174 456 174 438 166 C408 154 394 130 396 102 C398 70 420 46 452 46 Z" />
        <g ref={r('jaw', pass)}>
          <path fill={BELLY} d="M432 136 C432 118 458 110 482 112 C508 114 520 128 516 146 C512 160 490 166 468 164 C446 162 432 152 432 136 Z" />
          {!pass && (
            <>
              <path ref={part('mouth')} fill="#B8323F" stroke={INK} strokeWidth="4" d="" />
              <path ref={part('smile')} {...line()} d="M448 148 Q472 160 496 148" />
              <ellipse cx="466" cy="128" rx="5" ry="3.6" fill="#B98556" transform="rotate(-14 466 128)" />
              <ellipse cx="492" cy="127" rx="5" ry="3.6" fill="#B98556" transform="rotate(14 492 127)" />
            </>
          )}
        </g>
        {!pass && (
          <>
            <ellipse fill="#FF9DB0" opacity="0.8" cx="414" cy="128" rx="13" ry="8" />
            <g ref={part('eyes')}>
              {EYES.map((x, i) => (
                <g key={x}>
                  <clipPath id={`${id}-eye${i}`}>
                    <ellipse cx={x} cy={EYE.y} rx={EYE.rx} ry={EYE.ry} />
                  </clipPath>
                  <g transform={`translate(${x} ${EYE.y})`}>
                    <ellipse fill="#2E1C1A" rx={EYE.rx} ry={EYE.ry} />
                    <circle fill="#fff" cx="-4" cy="-6" r="5" />
                    <circle fill="#fff" cx="5" cy="6" r="2.4" />
                  </g>
                  <path ref={part(i === 0 ? 'lidL' : 'lidR')} fill={FUR} clipPath={`url(#${id}-eye${i})`} d="" />
                  <path ref={part(i === 0 ? 'lidLineL' : 'lidLineR')} {...line(4)} d="" />
                </g>
              ))}
            </g>
            <g ref={part('happy')} style={{ display: 'none' }}>
              <path {...line(5.5)} d="M413 100 Q426 85 439 100 M461 100 Q474 85 487 100" />
            </g>
          </>
        )}
      </g>
    </g>
  )

  // The cloth follows the hump's silhouette all the way over its peak. Clip the weave
  // to the drape so the colored bands never spill over its curved edges.
  const drape = 'M172 182 C184 118 232 88 262 88 C302 88 336 124 346 182 L354 240 Q262 264 162 240 Z'
  const blanket = (
    <g strokeLinejoin="round">
      <defs>
        <clipPath id={`${id}-blanket`}><path d={drape} /></clipPath>
      </defs>
      {[186, 224, 262, 300, 338].map((x) => (
        <g key={x} transform={`translate(${x} ${250 - 11 * ((x - 262) / 92) ** 2})`}>
          <path d="M-7 4 H7 L5 24 H-5 Z" fill="#FFC83D" stroke={INK} strokeWidth="4" />
        </g>
      ))}
      <path d={drape} fill="#FF8FB8" />
      <g clipPath={`url(#${id}-blanket)`}>
        <path d="M168 188 Q262 212 350 188" fill="none" stroke="#8FE3C8" strokeWidth="16" />
        <path d="M186 152 L202 166 L218 152 L234 166 L250 152 L266 166 L282 152 L298 166 L314 152 L330 166" fill="none" stroke="#FFC83D" strokeWidth="6" strokeLinecap="round" />
        <path d="M160 226 Q262 250 356 226" fill="none" stroke="#FFC4DA" strokeWidth="7" />
      </g>
      <path d={drape} fill="none" stroke={INK} strokeWidth="6" />
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

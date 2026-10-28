// Maple the beaver: a layered SVG puppet drawn to match her 3D toy (characters/looks.ts, #/world/characters/maple), for
// the 2D activities and the story beats. A round brown beaver girl in a pink scarf: small round ears, a big light muzzle
// with a dark nose, two big orange front teeth, and her flat criss-crossed paddle tail behind her. She breathes, blinks,
// watches Kaylee's finger and talks in her own voice (the mouth opens under the teeth), and can hop, wave, cheer,
// wiggle, chomp (three quick bites: taffy, a stick) and slap her tail on the ground when she's excited.
import { forwardRef, useId, useRef, type CSSProperties } from 'react'
import { bell, clamp, lerp, setA, setT, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { inkPass as inkPassIn, line as lineIn, useInk } from '../../../kit/ink'
import { blob, BLUSH, Eye, INK, MOUTH, mouthPath, TONGUE, updateEyes, type EyeKind, type EyePart } from '../../poles/puppets/face'
import { CANADA_COLORS as C } from '../characters/looks'

export interface MapleProps {
  height: string
  style?: CSSProperties
  /** Facing: 1 = her right (default), -1 = mirrored. */
  flip?: 1 | -1
}

const FUR = C.beaverFur
const LIGHT = C.beaverLight
const inkPass = () => inkPassIn(undefined, INK)
const line = (width?: number) => lineIn(width, INK)

const HEAD = blob(250, 186, 132, 116, 18, 0.03)
const BODY = blob(250, 372, 118, 100, 20, 0.025)
const ARM = 'M-26 -16 C-26 -36 26 -36 26 -16 C26 20 26 40 22 56 C16 78 -16 78 -22 56 C-26 40 -26 20 -26 -16Z'
const TAIL = 'M0 0 C40 -26 120 -44 168 -20 C196 -6 196 22 168 34 C120 54 40 38 0 12 Z'

type Part = 'root' | 'body' | 'head' | 'earL' | 'earR' | 'armL' | 'armR' | 'tail' | 'blushL' | 'blushR' | 'mouth' | 'mouthClip' | 'tongue' | 'teeth' | 'scarfEnd' | EyePart

/** Maple the beaver. Actions: hop, wave, cheer, wiggle, chomp, slap. Voice: maple. */
export const Maple = forwardRef<PuppetHandle, MapleProps>(function Maple({ height, style, flip = 1 }, ref) {
  const id = useId().replace(/:/g, '')
  const st = useRef({ headRot: 0, earL: spring(150, 8), earR: spring(150, 8), tail: spring(90, 7), scarf: spring(70, 6) }).current
  const ink = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'maple',
    actions: { hop: 0.9, wave: 1.5, cheer: 1.1, wiggle: 0.7, chomp: 0.9, slap: 1.0 },
    eyes: [250, 160],
    reach: [250, 240],
    frame: (f, p) => {
      const { t, dt, look } = f
      const q = f.p
      const act = f.action

      const breath = Math.sin(t * 2.4)
      let sx = 1 - breath * 0.008
      let sy = 1 + breath * 0.016
      let rootY = 0
      let rootRot = 0
      let headRot = Math.sin(t * 1.1) * 2.5 + look.x * 3
      let armL = 16
      let armR = -16
      let eye: EyeKind = 'open'
      let mouth = f.mouth
      let blush = 1
      // The tail rests lifted a little, and swishes slowly.
      let tail = -8 + Math.sin(t * 1.6) * 3

      const env = smooth(span(q, 0, 0.15)) * (1 - smooth(span(q, 0.85, 1)))
      if (act === 'hop' || act === 'cheer') {
        const crouch = bell(span(q, 0, 0.22))
        const air = bell(span(q, 0.2, 0.72))
        const land = wobble(span(q, 0.72, 1), 2)
        sx *= 1 + crouch * 0.1 - air * 0.06 + land * 0.08
        sy *= 1 - crouch * 0.12 + air * 0.09 - land * 0.1
        rootY -= air * (act === 'cheer' ? 70 : 90)
        tail += air * 18
        armL = lerp(armL, act === 'cheer' ? 150 : 50, act === 'cheer' ? env : air)
        armR = lerp(armR, act === 'cheer' ? -150 : -50, act === 'cheer' ? env : air)
        if (act === 'cheer') {
          eye = 'happy'
          mouth = Math.max(mouth, 0.8 * env)
          blush = 1 + 0.3 * env
        }
      } else if (act === 'wave') {
        armR = lerp(armR, -140 + Math.sin(q * Math.PI * 8) * 22, env)
        headRot += 6 * env
        mouth = Math.max(mouth, 0.45 * env)
      } else if (act === 'wiggle') {
        const w = wobble(q, 3)
        sx *= 1 + 0.07 * w
        sy *= 1 - 0.07 * w
        rootRot += w * 6
        tail += w * 20
      } else if (act === 'chomp') {
        // Three quick bites, eyes squeezed happy, paws up at the mouth.
        const bite = Math.abs(Math.sin(q * Math.PI * 3))
        mouth = Math.max(mouth, bite * 0.7)
        eye = 'happy'
        armL = lerp(armL, 110, env)
        armR = lerp(armR, -110, env)
        headRot += Math.sin(q * Math.PI * 6) * 3
      } else if (act === 'slap') {
        // Up goes the tail... and SLAP on the ground: the whole beaver jolts, then a proud grin.
        const up = smooth(span(q, 0, 0.4))
        const down = smooth(span(q, 0.4, 0.5))
        tail += up * 55 - down * 75
        const jolt = bell(span(q, 0.48, 0.7))
        sy *= 1 - jolt * 0.08
        sx *= 1 + jolt * 0.06
        rootY -= jolt * 12
        eye = q > 0.45 ? 'happy' : 'open'
        mouth = Math.max(mouth, q > 0.45 ? 0.6 * env : 0)
      }

      const vel = (headRot - st.headRot) / Math.max(dt, 0.001)
      st.headRot = headRot
      const earL = st.earL.step(clamp(-vel * 0.05, -14, 14) + rootY * 0.05, dt)
      const earR = st.earR.step(clamp(-vel * 0.05, -14, 14) - rootY * 0.05, dt)
      const tailNow = st.tail.step(tail + rootY * 0.15, dt)
      const scarf = st.scarf.step(clamp(-rootY * 0.3 - vel * 0.04, -30, 30), dt)

      setT(p.root, `translate(250 0) scale(${flip} 1) translate(-250 0) translate(0 ${rootY}) rotate(${rootRot} 250 476) translate(250 476) scale(${sx} ${sy}) translate(-250 -476)`)
      setT(p.head, `rotate(${headRot} 250 280)`)
      setT(p.earL, `rotate(${earL} 150 96)`)
      setT(p.earR, `rotate(${earR} 350 96)`)
      setT(p.armL, `translate(152 318) rotate(${armL})`)
      setT(p.armR, `translate(348 318) rotate(${armR})`)
      setT(p.tail, `translate(318 432) rotate(${-tailNow})`)
      setT(p.scarfEnd, `rotate(${scarf} 300 300)`)
      setT(p.blushL, `translate(160 214) scale(${blush})`)
      setT(p.blushR, `translate(340 214) scale(${blush})`)
      updateEyes(p, eye, eye === 'open' ? 1 - f.blink : 0, look)
      const m = clamp(mouth)
      const d = mouthPath(250, 262, m, 16)
      setA(p.mouth, 'd', d)
      setA(p.mouthClip, 'd', d)
      const bottom = 272 + 46 * m
      setA(p.tongue, 'd', `M230 ${bottom + 4} Q250 ${bottom - 10 - 18 * m} 270 ${bottom + 4}Z`)
      // The teeth lift with the top lip as she opens wide.
      setT(p.teeth, `translate(0 ${-m * 4})`)
      ink.sync(p)
    },
  })

  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))

  const arm = (side: 'L' | 'R', pass: boolean) => (
    <g ref={r(side === 'L' ? 'armL' : 'armR', pass)} transform={side === 'L' ? 'translate(152 318) rotate(16)' : 'translate(348 318) rotate(-16)'}>
      <path d={ARM} fill={FUR} />
      {!pass && <ellipse cy="58" rx="20" ry="17" fill={C.beaverNose} opacity="0.85" />}
    </g>
  )

  const tail = (pass: boolean) => (
    <g ref={r('tail', pass)} transform="translate(318 432) rotate(8)">
      <path d={TAIL} fill={C.beaverTail} />
      {!pass && (
        <g {...line(2.6)} stroke="#4F3428" opacity="0.9">
          {[40, 80, 120, 156].map((x) => (
            <path key={`a${x}`} d={`M${x} -30 L${x + 26} 40`} />
          ))}
          {[30, 70, 110, 150].map((x) => (
            <path key={`b${x}`} d={`M${x} 40 L${x + 26} -30`} />
          ))}
        </g>
      )}
    </g>
  )

  const lower = (pass: boolean) => (
    <>
      {tail(pass)}
      <g ref={r('body', pass)}>
        <path d={BODY} fill={FUR} />
      </g>
      {!pass && <ellipse cx="250" cy="396" rx="76" ry="62" fill={LIGHT} />}
      {([-1, 1] as const).map((s) => (
        <g key={s} transform={`translate(${250 + s * 70} 460)`}>
          <ellipse rx="46" ry="26" fill={C.beaverNose} />
          {!pass && [-16, 0, 16].map((x) => <circle key={x} cx={x} cy="-12" r="5" fill="#6E4B3B" />)}
        </g>
      ))}
      {/* The pink scarf round her neck, one end hanging down and swinging. */}
      <path d="M150 292 C190 318 310 318 350 292 L352 318 C310 344 190 344 148 318 Z" fill={C.scarf} />
      <g ref={r('scarfEnd', pass)}>
        <path d="M300 312 L336 312 L344 392 L304 388 Z" fill={C.scarf} />
        {!pass && <path d="M306 386 L306 400 M318 388 L318 402 M330 389 L330 403 M342 390 L342 402" {...line(3)} stroke="#FF4F9A" />}
      </g>
      {!pass && <path d="M170 302 C200 320 300 320 330 302 M200 318 L200 330 M240 322 L240 334 M280 322 L280 334" {...line(2.4)} stroke="#FF4F9A" />}
    </>
  )

  const ear = (side: 'L' | 'R', pass: boolean) => {
    const x = side === 'L' ? 150 : 350
    return (
      <g ref={r(side === 'L' ? 'earL' : 'earR', pass)}>
        <circle cx={x} cy="90" r="30" fill={FUR} />
        {!pass && <circle cx={x + (side === 'L' ? 4 : -4)} cy="94" r="16" fill={C.beaverEar} />}
      </g>
    )
  }

  const head = (pass: boolean) => (
    <g ref={r('head', pass)}>
      {ear('L', pass)}
      {ear('R', pass)}
      {!pass && (
        <g {...inkPass()}>
          <path d={HEAD} />
        </g>
      )}
      <path d={HEAD} fill={FUR} />
      {!pass && (
        <>
          {/* Lashes, like the 3D Maple. */}
          {([-1, 1] as const).map((s) => (
            <path key={s} d={`M${250 + s * 74} 142 l${s * 12} -10 M${250 + s * 80} 152 l${s * 14} -6`} {...line(3.4)} />
          ))}
          <ellipse ref={part('blushL')} rx="22" ry="12" fill={BLUSH} opacity="0.9" transform="translate(160 214)" />
          <ellipse ref={part('blushR')} rx="22" ry="12" fill={BLUSH} opacity="0.9" transform="translate(340 214)" />
          <Eye id={id} side="L" x={190} y={160} skin={FUR} part={part} />
          <Eye id={id} side="R" x={310} y={160} skin={FUR} part={part} />
          <path ref={part('mouth')} fill={MOUTH} stroke={INK} strokeWidth="3.4" />
          <path ref={part('tongue')} fill={TONGUE} clipPath={`url(#${id}-mouth)`} />
          {/* The muzzle: two round puffy cheeks either side of the nose, the teeth hanging below them. */}
          <ellipse cx="222" cy="232" rx="40" ry="30" fill={LIGHT} stroke={INK} strokeWidth="3.4" />
          <ellipse cx="278" cy="232" rx="40" ry="30" fill={LIGHT} stroke={INK} strokeWidth="3.4" />
          <path d="M214 228 l-26 -4 M214 238 l-26 4 M286 228 l26 -4 M286 238 l26 4" {...line(2.4)} />
          <g ref={part('teeth')}>
            <rect x="231" y="254" width="18" height="26" rx="5" fill={C.teeth} stroke={INK} strokeWidth="3" />
            <rect x="251" y="254" width="18" height="26" rx="5" fill={C.teeth} stroke={INK} strokeWidth="3" />
          </g>
          <ellipse cx="250" cy="212" rx="24" ry="16" fill={C.beaverNose} stroke={INK} strokeWidth="3" />
          <ellipse cx="242" cy="207" rx="7" ry="4" fill="#fff" opacity="0.4" transform="rotate(-15 242 207)" />
        </>
      )}
    </g>
  )

  return (
    <svg ref={svg} viewBox="0 0 500 500" aria-label="Maple the beaver" style={{ height, aspectRatio: '1 / 1', overflow: 'visible', display: 'block', ...style }}>
      <defs>
        <clipPath id={`${id}-mouth`}>
          <path ref={part('mouthClip')} />
        </clipPath>
      </defs>
      <g ref={part('root')} strokeLinejoin="round">
        <g {...inkPass()}>{lower(true)}</g>
        {lower(false)}
        <g {...inkPass()}>{head(true)}</g>
        {head(false)}
        {(['L', 'R'] as const).map((s) => (
          <g key={s}>
            <g {...inkPass()}>{arm(s, true)}</g>
            {arm(s, false)}
          </g>
        ))}
      </g>
    </svg>
  )
})

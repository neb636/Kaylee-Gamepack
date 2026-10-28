// Terry the Arctic tern: a layered SVG puppet drawn to match the 3D toy (characters/looks.ts, #/world/characters/terry).
// A round white bird with a black cap, a red-orange beak and short red legs, long pale grey wings with dark tips folded
// at the sides, and a forked tail of two white streamers. Breathes, blinks, watches her finger, talks in Terry's voice,
// and can flap, hop, cheer, wiggle and bow. `flying` spreads the wings and beats them (the finale, the postcards).
import { forwardRef, useId, useRef, type CSSProperties } from 'react'
import { bell, clamp, lerp, setA, setT, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { inkPass as inkPassIn, useInk } from '../../../kit/ink'
import { BLUSH, C, Eye, INK, MOUTH, updateEyes, type EyeKind, type EyePart } from './face'

export interface TerryProps {
  height: string
  style?: CSSProperties
  /** Wings out and beating, feet tucked up. */
  flying?: boolean
}

const GREY = C.ternGrey
const WHITE = C.ternWhite
const CAP = C.ternCap
const BEAK = C.ternBeak
const TIP = '#7E88A0'
const inkPass = () => inkPassIn(undefined, INK)

const HEAD = 'M250 62 C318 62 362 110 362 170 C362 230 314 272 250 272 C186 272 138 230 138 170 C138 110 182 62 250 62Z'
// The black cap over the top of the head, its front edge sweeping up over a white forehead.
const CAPPATH = 'M139 176 C132 96 190 60 250 60 C310 60 368 96 361 176 C346 140 312 118 250 118 C188 118 154 140 139 176Z'
const BODY = 'M250 238 C318 238 352 300 350 352 C348 410 306 440 250 440 C194 440 152 410 150 352 C148 300 182 238 250 238Z'
// A long pointed wing hanging from the shoulder (its tip is the dark part).
const WING = 'M-26 0 C-30 -26 26 -26 26 0 C28 60 16 130 0 176 C-16 130 -28 60 -26 0Z'
const WING_TIP = 'M-11 120 C-6 140 6 140 11 120 C8 146 4 164 0 176 C-4 164 -8 146 -11 120Z'
const STREAMER = 'M0 0 L20 8 L-16 96 Z'

type Part = 'root' | 'head' | 'wingL' | 'wingR' | 'legs' | 'tail' | 'blushL' | 'blushR' | 'beakLow' | 'mouth' | EyePart

/** Terry the Arctic tern. Actions: flap, hop, cheer, wiggle, bow. Voice: terry. */
export const Terry = forwardRef<PuppetHandle, TerryProps>(function Terry({ height, style, flying = false }, ref) {
  const id = useId().replace(/:/g, '')
  const st = useRef({ fly: 0, headRot: 0, tail: spring(140, 8) }).current
  const ink = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'terry',
    actions: { flap: 1.2, hop: 0.8, cheer: 1.2, wiggle: 0.7, bow: 1.2 },
    eyes: [250, 182],
    reach: [250, 226],
    frame: (f, p) => {
      const { t, dt, look } = f
      st.fly += ((flying ? 1 : 0) - st.fly) * Math.min(1, dt * 4)
      const fly = st.fly
      const q = f.p
      const act = f.action

      const breath = Math.sin(t * 3)
      let sx = 1 - breath * 0.01
      let sy = 1 + breath * 0.016
      // Flying: the body bobs with each beat, the wings sweep from high over the back down past level.
      const beat = Math.sin(t * 9)
      let rootY = -fly * (40 + beat * 10)
      let rootRot = 0
      let headRot = Math.sin(t * 1.5) * 4 + look.x * 5
      let headY = 0
      let wing = lerp(8, 100 + beat * 32, fly)
      let eye: EyeKind = 'open'
      let mouth = f.mouth

      const env = smooth(span(q, 0, 0.15)) * (1 - smooth(span(q, 0.85, 1)))
      if (act === 'flap') {
        const b = Math.sin(q * Math.PI * 10)
        wing = lerp(wing, 95 + b * 40, env)
        rootY -= (16 + b * 8) * env
        mouth = Math.max(mouth, 0.4 * env)
      } else if (act === 'hop' || act === 'cheer') {
        const crouch = bell(span(q, 0, 0.22))
        const air = bell(span(q, 0.2, 0.72))
        const land = wobble(span(q, 0.72, 1), 2)
        sx *= 1 + crouch * 0.1 - air * 0.06 + land * 0.08
        sy *= 1 - crouch * 0.12 + air * 0.09 - land * 0.1
        rootY -= air * (act === 'cheer' ? 90 : 70)
        if (act === 'cheer') {
          wing = lerp(wing, 120 + Math.sin(q * Math.PI * 12) * 30, env)
          eye = 'happy'
          mouth = Math.max(mouth, 0.8 * env)
        } else wing = lerp(wing, 50, air)
      } else if (act === 'wiggle') {
        const w = wobble(q, 3)
        sx *= 1 + 0.07 * w
        sy *= 1 - 0.07 * w
        rootRot += w * 7
      } else if (act === 'bow') {
        // A polite little bow: the head dips and the eyes smile.
        const b = bell(span(q, 0.1, 0.9))
        headY += b * 26
        headRot = lerp(headRot, 0, b)
        sy *= 1 - 0.05 * b
        eye = b > 0.5 ? 'happy' : 'open'
      }

      const vel = (rootY - st.headRot) / Math.max(dt, 0.001)
      st.headRot = rootY
      const tail = st.tail.step(clamp(vel * 0.02, -12, 12) + fly * 6, dt)

      setT(p.root, `translate(0 ${rootY}) rotate(${rootRot} 250 470) translate(250 470) scale(${sx} ${sy}) translate(-250 -470)`)
      setT(p.head, `translate(0 ${headY}) rotate(${headRot} 250 262)`)
      setT(p.wingL, `translate(160 288) rotate(${wing})`)
      setT(p.wingR, `translate(340 288) rotate(${-wing}) scale(-1 1)`)
      setT(p.tail, `rotate(${tail} 250 420)`)
      // Feet tuck up in flight.
      setT(p.legs, `translate(0 ${-fly * 26}) scale(1 ${1 - fly * 0.5})`)
      setT(p.blushL, `translate(176 222)`)
      setT(p.blushR, `translate(324 222)`)
      updateEyes(p, eye, eye === 'open' ? 1 - f.blink : 0, look, 16, 20)
      const m = clamp(mouth)
      setT(p.beakLow, `rotate(${m * 14} 250 214)`)
      setA(p.mouth, 'ry', 2 + m * 10)
      ink.sync(p)
    },
  })

  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))

  const wing = (side: 'L' | 'R', pass: boolean) => (
    <g ref={r(side === 'L' ? 'wingL' : 'wingR', pass)} transform={side === 'L' ? 'translate(160 288) rotate(8)' : 'translate(340 288) rotate(-8) scale(-1 1)'}>
      <path d={WING} fill={GREY} />
      {!pass && <path d={WING_TIP} fill={TIP} />}
    </g>
  )

  const back = (pass: boolean) => (
    <>
      <g ref={r('tail', pass)}>
        <path d={STREAMER} fill={WHITE} transform="translate(214 392) rotate(38)" />
        <path d={STREAMER} fill={WHITE} transform="translate(286 392) scale(-1 1) rotate(38)" />
      </g>
      <g ref={r('legs', pass)}>
        {([-1, 1] as const).map((s) => (
          <g key={s} transform={`translate(${250 + s * 34} 430)`}>
            <rect x="-8" y="0" width="16" height="34" rx="8" fill={BEAK} />
            <ellipse cy="36" rx="22" ry="9" fill={BEAK} />
          </g>
        ))}
      </g>
    </>
  )

  const body = () => <path d={BODY} fill={WHITE} />

  const head = (pass: boolean) => (
    <g ref={r('head', pass)}>
      <path d={HEAD} fill={WHITE} />
      {!pass && (
        <>
          <path d={CAPPATH} fill={CAP} />
          <ellipse ref={part('blushL')} rx="20" ry="11" fill={BLUSH} transform="translate(176 222)" />
          <ellipse ref={part('blushR')} rx="20" ry="11" fill={BLUSH} transform="translate(324 222)" />
          <Eye id={id} side="L" x={200} y={182} skin={WHITE} part={part} rx={16} ry={20} />
          <Eye id={id} side="R" x={300} y={182} skin={WHITE} part={part} rx={16} ry={20} />
          <ellipse ref={part('mouth')} cx="250" cy="222" rx="10" ry="2" fill={MOUTH} />
          <path ref={part('beakLow')} d="M240 214 L260 214 L250 240Z" fill={BEAK} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M232 204 Q250 196 268 204 L250 236Z" fill={BEAK} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="244" cy="206" rx="5" ry="3" fill="#fff" opacity="0.4" />
        </>
      )}
    </g>
  )

  return (
    <svg ref={svg} viewBox="0 0 500 500" aria-label="Terry the Arctic tern" style={{ height, aspectRatio: '1 / 1', overflow: 'visible', display: 'block', ...style }}>
      <g ref={part('root')} strokeLinejoin="round">
        <g {...inkPass()}>{back(true)}</g>
        {back(false)}
        <g {...inkPass()}>{body()}</g>
        {body()}
        <g {...inkPass()}>{head(true)}</g>
        {head(false)}
        {(['L', 'R'] as const).map((s) => (
          <g key={s}>
            <g {...inkPass()}>{wing(s, true)}</g>
            {wing(s, false)}
          </g>
        ))}
      </g>
    </svg>
  )
})

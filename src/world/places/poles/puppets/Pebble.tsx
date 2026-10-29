// Pebble the emperor penguin chick: a layered SVG puppet drawn to match the 3D toy (characters/looks.ts,
// #/world/characters/pebble). Grey fluff all over, a black head with a heart-shaped white face, a little black beak and a
// tuft on top. Breathes, blinks, watches her finger, talks in Pebble's voice, and can hop, flap, cheer, wiggle and
// waddle. `cold` makes the chick shiver with pale cheeks (the huddle); warm again, the pink comes back.
import { forwardRef, useId, useRef, type CSSProperties } from 'react'
import { bell, clamp, lerp, setA, setT, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { inkPass as inkPassIn, line as lineIn, useInk } from '../../../kit/ink'
import { blob, BLUSH, C, Eye, INK, MOUTH, updateEyes, win, type EyeKind, type EyePart } from './face'

export interface PebbleProps {
  height?: string
  style?: CSSProperties
  /** 0 = warm and cosy, 1 = freezing (shivers, pale cheeks, flippers hugged in). */
  cold?: number
  /** Drawn inside another SVG (the huddle): feet at (0, 0), about 100 units tall. */
  embed?: boolean
  /** Read every frame instead of `cold` (the huddle changes it without re-rendering). */
  live?: { cold: number }
}

const FLUFF = C.chickFluff
const CAP = C.chickCap
const FACE = C.chickFace
const BELLY = '#EEF0F5'
const BEAK = C.beakBlack
const inkPass = () => inkPassIn(undefined, INK)
const line = (width?: number) => lineIn(width, INK)

// Fluffy all round the body, the head round and smooth (its tuft sticks up on top).
const BODY = blob(250, 352, 138, 122, 30, 0.06, (a) => 0.35 + win(a, -0.3, Math.PI + 0.3))
const HEAD = 'M250 52 C330 52 372 108 372 168 C372 232 320 276 250 276 C180 276 128 232 128 168 C128 108 170 52 250 52Z'
const TUFT = 'M222 62 C212 34 232 22 242 44 C244 16 270 18 266 46 C282 26 302 40 284 66 Z'
// The white face: two round lobes meeting in a point under the beak, like the toy's two overlapping ovals.
const MASK = 'M250 128 C232 100 150 104 146 168 C142 222 196 256 250 262 C304 256 358 222 354 168 C350 104 268 100 250 128Z'
const FLIPPER = 'M-20 -10 C-24 -30 20 -30 18 -8 C22 40 14 92 -2 116 C-14 96 -22 40 -20 -10Z'

type Part = 'root' | 'head' | 'tuft' | 'flipL' | 'flipR' | 'blushL' | 'blushR' | 'beakTop' | 'beakLow' | 'mouth' | EyePart

/** Pebble the emperor chick. Actions: hop, flap, cheer, wiggle, waddle. Voice: pebble. */
export const Pebble = forwardRef<PuppetHandle, PebbleProps>(function Pebble({ height = '100%', style, cold = 0, embed = false, live }, ref) {
  const id = useId().replace(/:/g, '')
  const st = useRef({ cold: 0, headRot: 0, tuft: spring(160, 7) }).current
  const ink = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'pebble',
    actions: { hop: 0.8, flap: 1.2, cheer: 1.1, wiggle: 0.7, waddle: 1.6 },
    eyes: [250, 172],
    reach: [250, 222],
    frame: (f, p) => {
      const { t, dt, look } = f
      st.cold += ((live ? live.cold : cold) - st.cold) * Math.min(1, dt * 2)
      const k = st.cold
      const q = f.p
      const act = f.action

      const breath = Math.sin(t * 2.8)
      let sx = 1 - breath * 0.01
      let sy = 1 + breath * 0.018
      let rootY = 0
      let rootX = 0
      let rootRot = 0
      let headRot = Math.sin(t * 1.3) * 3 + look.x * 4
      let flipL = lerp(14, 4, k)
      let flipR = lerp(-14, -4, k)
      let eye: EyeKind = 'open'
      let mouth = f.mouth
      let blush = 1 - 0.75 * k

      // Shivering: a fast little jitter that grows with the cold.
      if (k > 0.02) {
        rootX += Math.sin(t * 55) * 2.4 * k
        rootRot += Math.sin(t * 47) * 1.6 * k
      }

      const env = smooth(span(q, 0, 0.15)) * (1 - smooth(span(q, 0.85, 1)))
      if (act === 'hop' || act === 'cheer') {
        const crouch = bell(span(q, 0, 0.22))
        const air = bell(span(q, 0.2, 0.72))
        const land = wobble(span(q, 0.72, 1), 2)
        sx *= 1 + crouch * 0.12 - air * 0.06 + land * 0.1
        sy *= 1 - crouch * 0.14 + air * 0.1 - land * 0.12
        rootY -= air * 70
        const flap = Math.sin(q * Math.PI * 10) * 18
        flipL = lerp(flipL, 70 + flap, act === 'cheer' ? env : air)
        flipR = lerp(flipR, -70 - flap, act === 'cheer' ? env : air)
        if (act === 'cheer') {
          eye = 'happy'
          mouth = Math.max(mouth, 0.8 * env)
          blush = 1.3
        }
      } else if (act === 'flap') {
        const flap = Math.sin(q * Math.PI * 12)
        flipL = lerp(flipL, 60 + flap * 30, env)
        flipR = lerp(flipR, -60 - flap * 30, env)
        rootY -= Math.abs(flap) * 10 * env
        mouth = Math.max(mouth, 0.5 * env)
      } else if (act === 'wiggle') {
        const w = wobble(q, 3)
        sx *= 1 + 0.07 * w
        sy *= 1 - 0.07 * w
        rootRot += w * 7
      } else if (act === 'waddle') {
        // Side to side from foot to foot, flippers out for balance.
        const w = Math.sin(q * Math.PI * 6)
        rootRot += w * 9 * env
        rootX += w * 10 * env
        rootY -= Math.abs(w) * 6 * env
        flipL = lerp(flipL, 34 - w * 10, env)
        flipR = lerp(flipR, -34 - w * 10, env)
      }

      const vel = (headRot - st.headRot) / Math.max(dt, 0.001)
      st.headRot = headRot
      // The tuft lags behind the head and flops when Pebble lands.
      const tuft = st.tuft.step(clamp(-vel * 0.06, -16, 16) + rootY * 0.12, dt)

      setT(p.root, `translate(${rootX} ${rootY}) rotate(${rootRot} 250 484) translate(250 484) scale(${sx} ${sy}) translate(-250 -484)`)
      setT(p.head, `rotate(${headRot} 250 270)`)
      setT(p.flipL, `translate(118 296) rotate(${flipL})`)
      setT(p.flipR, `translate(382 296) rotate(${flipR})`)
      setT(p.blushL, `translate(178 214) scale(${Math.max(0.2, blush)})`)
      setT(p.blushR, `translate(322 214) scale(${Math.max(0.2, blush)})`)
      ;(p.blushL as SVGElement).style.opacity = (p.blushR as SVGElement).style.opacity = String(clamp(0.25 + blush * 0.7))
      updateEyes(p, eye, eye === 'open' ? Math.max(1 - f.blink, 0.3 * k) : 0, look, 16, 20)
      // The beak opens: the lower half drops away from the top, showing the mouth.
      const m = clamp(mouth)
      setT(p.beakLow, `translate(0 ${m * 16}) rotate(${m * 8} 250 214)`)
      setA(p.mouth, 'ry', 2 + m * 12)
      setT(p.beakTop, `rotate(${-m * 4} 250 206)`)
      setT(p.tuft, `rotate(${tuft} 250 66)`)
      ink.sync(p)
    },
  })

  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))

  const flipper = (side: 'L' | 'R', pass: boolean) => (
    <g ref={r(side === 'L' ? 'flipL' : 'flipR', pass)} transform={side === 'L' ? 'translate(118 296) rotate(14)' : 'translate(382 296) rotate(-14)'}>
      <path d={FLIPPER} fill={FLUFF} transform={side === 'R' ? 'scale(-1 1)' : undefined} />
    </g>
  )

  const lower = (pass: boolean) => (
    <>
      {([-1, 1] as const).map((s) => (
        <ellipse key={s} cx={250 + s * 50} cy="470" rx="44" ry="18" fill={BEAK} />
      ))}
      <path d={BODY} fill={FLUFF} />
      {!pass && <ellipse cx="250" cy="372" rx="88" ry="84" fill={BELLY} />}
    </>
  )

  const head = (pass: boolean) => (
    <g ref={r('head', pass)}>
      <g ref={r('tuft', pass)}>
        <path d={TUFT} fill={CAP} />
      </g>
      <path d={HEAD} fill={CAP} />
      {!pass && (
        <>
          <path d={MASK} fill={FACE} />
          <ellipse ref={part('blushL')} rx="20" ry="11" fill={BLUSH} transform="translate(178 214)" />
          <ellipse ref={part('blushR')} rx="20" ry="11" fill={BLUSH} transform="translate(322 214)" />
          <Eye id={id} side="L" x={200} y={174} skin={FACE} part={part} rx={16} ry={20} />
          <Eye id={id} side="R" x={300} y={174} skin={FACE} part={part} rx={16} ry={20} />
          <ellipse ref={part('mouth')} cx="250" cy="220" rx="14" ry="2" fill={MOUTH} />
          <path ref={part('beakLow')} d="M236 214 Q250 210 264 214 Q258 230 250 232 Q242 230 236 214Z" fill={BEAK} stroke={INK} strokeWidth="3" />
          <path ref={part('beakTop')} d="M232 202 Q250 194 268 202 Q262 216 250 222 Q238 216 232 202Z" fill={BEAK} stroke={INK} strokeWidth="3" />
          <ellipse cx="243" cy="203" rx="5" ry="3" fill="#fff" opacity="0.35" />
        </>
      )}
    </g>
  )

  const body = (
    <g ref={part('root')} strokeLinejoin="round">
      {(['L', 'R'] as const).map((s) => (
        <g key={s}>
          <g {...inkPass()}>{flipper(s, true)}</g>
          {flipper(s, false)}
        </g>
      ))}
      <g {...inkPass()}>{lower(true)}</g>
      {lower(false)}
      <path d="M200 330 Q206 340 214 332 M286 332 Q294 340 300 330 M236 300 Q244 308 252 300" {...line(2.6)} />
      <g {...inkPass()}>{head(true)}</g>
      {head(false)}
    </g>
  )
  if (embed)
    return (
      <g ref={svg}>
        <g transform="scale(0.215) translate(-250 -488)">{body}</g>
      </g>
    )
  return (
    <svg ref={svg} viewBox="0 0 500 500" aria-label="Pebble the emperor penguin chick" style={{ height, aspectRatio: '1 / 1', overflow: 'visible', display: 'block', ...style }}>
      {body}
    </svg>
  )
})

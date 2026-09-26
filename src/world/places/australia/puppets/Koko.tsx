// Koko the koala: a layered SVG puppet. She breathes, blinks, watches her finger, opens her mouth as a leaf comes near,
// talks in her own voice, and can chew, say yuck, yawn, cheer, dance and wiggle. `sleepy` droops her eyelids to sleep.
import { forwardRef, useId, useRef, type CSSProperties } from 'react'
import { bell, clamp, lerp, setA, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { inkPass as inkPassIn, line as lineIn, useInk } from './ink'

export interface KokoProps {
  height: string
  style?: CSSProperties
  /** 0 = wide awake, 1 = fast asleep (eyelids droop as it rises). */
  sleepy?: number
  /** 0..1 how full her tummy is: it gets a little rounder. */
  full?: number
}

const FUR = '#B8B1CC'
const BELLY = '#DCD5EE'
const PINK = '#FF9DB6'
const INK = '#3A2A33'
const inkPass = () => inkPassIn(undefined, INK)
const line = (width?: number) => lineIn(width, INK)

/** A fluffy scalloped ellipse: `bumps` round tufts, only where `weight(angle)` > 0. */
function blob(cx: number, cy: number, rx: number, ry: number, bumps: number, depth: number, weight: (a: number) => number = () => 1, n = 220) {
  const pts: string[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const w = weight(a)
    const k = 1 - depth * w + depth * w * Math.abs(Math.sin((a * bumps) / 2))
    pts.push(`${(cx + Math.cos(a) * rx * k).toFixed(1)} ${(cy + Math.sin(a) * ry * k).toFixed(1)}`)
  }
  return `M${pts.join('L')}Z`
}
const win = (a: number, from: number, to: number) => (a > from && a < to ? Math.sin(((a - from) / (to - from)) * Math.PI) : 0)
// A few soft tufts on the cheeks, low on each side of the head, like the art.
const HEAD = blob(250, 176, 162, 116, 20, 0.06, (a) => win(a, 0.1, 1.0) + win(a, Math.PI - 1.0, Math.PI - 0.1))
// Ears: fluffy on the outside, smooth where they tuck behind the head.
const EAR_L = blob(96, 112, 80, 82, 10, 0.12, (a) => 0.25 + 0.75 * Math.max(0, -Math.cos(a - 0.4)))
const EAR_R = blob(404, 112, 80, 82, 10, 0.12, (a) => 0.25 + 0.75 * Math.max(0, Math.cos(a + 0.4)))
const BODY = 'M250 258 C338 258 390 330 392 396 C394 452 342 472 250 472 C158 472 106 452 108 396 C110 330 162 258 250 258Z'
const TUFT = 'M216 80 C210 54 230 44 242 60 C244 38 268 38 268 58 C282 44 300 56 288 80 Z'
const ARM = 'M-31 -22 C-31 -42 31 -42 31 -22 C31 20 30 48 26 64 C20 88 -20 88 -26 64 C-30 48 -31 20 -31 -22Z'
const NOSE = 'M250 128 C272 128 282 150 283 170 C284 190 270 199 250 199 C230 199 216 190 217 170 C218 150 228 128 250 128Z'

function mouthPath(m: number) {
  const w = 24 + 18 * m
  const top = 208
  const bottom = top + 10 + 56 * m
  const mid = top + (bottom - top) * 0.72
  return `M${250 - w} ${top} Q250 ${top - 5} ${250 + w} ${top} C${250 + w} ${mid} ${250 + w * 0.5} ${bottom} 250 ${bottom} C${250 - w * 0.5} ${bottom} ${250 - w} ${mid} ${250 - w} ${top}Z`
}

type Part =
  | 'root'
  | 'head'
  | 'earL'
  | 'earR'
  | 'armL'
  | 'armR'
  | 'belly'
  | 'body'
  | 'blushL'
  | 'blushR'
  | 'mouth'
  | 'mouthClip'
  | 'tongue'
  | 'smile'
  | 'tongueOut'
  | 'zzz'
  | `eye${'L' | 'R'}${'' | 'Open' | 'Pupil' | 'Lid' | 'LidLine' | 'Happy' | 'Sleep' | 'Squeeze'}`

/** Koko the koala. Actions: chew, yuck, yawn, cheer, dance, wiggle. Voice: koko. Eyes follow her finger; mouth opens as a leaf comes near. */
export const Koko = forwardRef<PuppetHandle, KokoProps>(function Koko({ height, style, sleepy = 0, full = 0 }, ref) {
  const id = useId().replace(/:/g, '')
  const st = useRef({ sleepy: 0, full: 0, headRot: 0, earL: spring(140, 7), earR: spring(140, 7) }).current
  const ink = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'koko',
    actions: { chew: 1.3, yuck: 1.1, yawn: 1.9, cheer: 1.1, dance: 1.8, wiggle: 0.7 },
    eyes: [250, 158],
    reach: [250, 215],
    frame: (f, p) => {
      const { t, dt, look } = f
      st.sleepy += (sleepy - st.sleepy) * Math.min(1, dt * 2.5)
      st.full += (full - st.full) * Math.min(1, dt * 4)
      const sl = st.sleepy
      const q = f.p
      const act = f.action

      // Idle: breathing (slower and deeper when sleepy), a gentle sway, glances.
      const breath = Math.sin(t * (2.3 - 1.4 * sl))
      let sx = 1 - breath * 0.006
      let sy = 1 + breath * (0.012 + 0.02 * sl)
      let rootY = 0
      let rootRot = 0
      let headRot = Math.sin(t * 1.1) * 2.5 * (1 - sl) + look.x * 3 * (1 - sl) + sl * 10 + Math.sin(t * 0.8) * 2.5 * sl
      let headY = sl * 7
      let armL = lerp(-44, -66, sl)
      let armR = lerp(44, 66, sl)
      let closure = Math.max(1 - f.blink, sl < 0.97 ? sl * 0.82 : 1)
      let eye: 'open' | 'happy' | 'squeeze' | 'sleep' = sl > 0.95 ? 'sleep' : 'open'
      let mouth = f.mouth * 0.8
      let blush = 1
      let tongueOut = 0
      let pupil = 1

      // A leaf coming close: eyes go big, mouth opens, she leans toward it.
      if (f.near > 0.15 && !act && sl < 0.5) {
        const n = (f.near - 0.15) / 0.85
        mouth = Math.max(mouth, 0.15 + 0.6 * n)
        pupil = 1 + 0.25 * n
        closure = Math.min(closure, 0.3)
        headRot += look.x * 4 * n
        headY -= 4 * n
      }

      const env = smooth(span(q, 0, 0.15)) * (1 - smooth(span(q, 0.85, 1)))
      if (act === 'chew') {
        const c = Math.abs(Math.sin(q * Math.PI * 8)) * env
        armL = lerp(armL, -139, env)
        armR = lerp(armR, 139, env)
        mouth = 0.08 + 0.32 * c
        eye = 'happy'
        blush = 1 + 0.4 * env
        headY += c * 4
        sy *= 1 - 0.02 * c
      } else if (act === 'yuck') {
        headRot += Math.sin(q * Math.PI * 7) * 13 * (1 - q)
        eye = 'squeeze'
        tongueOut = env
        mouth = 0
        armL = lerp(armL, -70, env)
        armR = lerp(armR, 70, env)
        sx *= 1 + Math.sin(q * Math.PI * 14) * 0.015 * env
      } else if (act === 'yawn') {
        const e = bell(span(q, 0.05, 0.85))
        mouth = Math.max(mouth, e)
        if (e > 0.3) eye = 'squeeze'
        armL = lerp(armL, 168, e)
        armR = lerp(armR, -168, e)
        sy *= 1 + 0.06 * e
        headRot = lerp(headRot, -4, e)
        headY -= 10 * e
      } else if (act === 'cheer') {
        const crouch = bell(span(q, 0, 0.2))
        const air = bell(span(q, 0.2, 0.7))
        const land = wobble(span(q, 0.7, 1), 2)
        sx *= 1 + crouch * 0.1 - air * 0.06 + land * 0.08
        sy *= 1 - crouch * 0.12 + air * 0.08 - land * 0.1
        rootY -= air * 60
        armL = lerp(armL, 150 + Math.sin(q * Math.PI * 8) * 14, env)
        armR = lerp(armR, -150 - Math.sin(q * Math.PI * 8) * 14, env)
        eye = 'happy'
        mouth = Math.max(mouth, 0.7 * env)
      } else if (act === 'dance') {
        const beat = q * Math.PI * 8
        rootRot = Math.sin(beat / 2) * 10 * bell(q)
        rootY -= Math.abs(Math.sin(beat)) * 14 * env
        armL = lerp(armL, 120 + Math.sin(beat) * 25, env)
        armR = lerp(armR, -120 + Math.sin(beat + Math.PI) * 25, env)
        headRot += Math.sin(beat / 2 + 0.6) * 6 * env
        eye = 'happy'
        mouth = Math.max(mouth, 0.45 * env)
      } else if (act === 'wiggle') {
        const w = wobble(q, 3)
        sx *= 1 + 0.07 * w
        sy *= 1 - 0.07 * w
        rootRot += w * 6
      }
      if (eye !== 'open') closure = 0

      // Ears lag behind the head, then jiggle and settle.
      const vel = (headRot - st.headRot) / Math.max(dt, 0.001)
      st.headRot = headRot
      const earL = st.earL.step(clamp(-vel * 0.05, -14, 14) - sl * 6 + rootY * 0.06, dt)
      const earR = st.earR.step(clamp(-vel * 0.05, -14, 14) + sl * 6 - rootY * 0.06, dt)

      const fx = 1 + st.full * 0.06
      setT(p.root, `translate(0 ${rootY}) rotate(${rootRot} 250 470) translate(250 470) scale(${sx} ${sy}) translate(-250 -470)`)
      setT(p.body, `translate(250 470) scale(${fx} ${1 + st.full * 0.03}) translate(-250 -470)`)
      setT(p.belly, `translate(250 470) scale(${1 + st.full * 0.12} ${1 + st.full * 0.06}) translate(-250 -470)`)
      setT(p.head, `translate(0 ${headY}) rotate(${headRot} 250 272)`)
      setT(p.earL, `rotate(${earL} 150 150)`)
      setT(p.earR, `rotate(${earR} 350 150)`)
      setT(p.armL, `translate(150 318) rotate(${armL})`)
      setT(p.armR, `translate(350 318) rotate(${armR})`)
      setT(p.blushL, `translate(152 190) scale(${blush})`)
      setT(p.blushR, `translate(348 190) scale(${blush})`)

      for (const side of ['L', 'R'] as const) {
        show(p[`eye${side}Open`], eye === 'open')
        show(p[`eye${side}Happy`], eye === 'happy')
        show(p[`eye${side}Sleep`], eye === 'sleep')
        show(p[`eye${side}Squeeze`], eye === 'squeeze')
        setT(p[`eye${side}Pupil`], `translate(${look.x * 3} ${look.y * 3}) scale(${pupil})`)
        const y = -19.5 + 39 * clamp(closure)
        setA(p[`eye${side}Lid`], 'height', y + 40)
        const w = 16 * Math.sqrt(Math.max(0, 1 - (y / 19.5) ** 2)) + 1.5
        setA(p[`eye${side}LidLine`], 'd', closure > 0.04 ? `M${-w} ${y} Q0 ${y + 4 * closure} ${w} ${y}` : '')
      }

      const open = mouth > 0.06
      show(p.mouth, open)
      show(p.tongue, open)
      show(p.smile, !open && tongueOut < 0.05)
      if (open) {
        const d = mouthPath(mouth)
        setA(p.mouth, 'd', d)
        setA(p.mouthClip, 'd', d)
        const bottom = 218 + 56 * mouth
        setA(p.tongue, 'd', `M${250 - 30} ${bottom + 4} Q250 ${bottom - 12 - 20 * mouth} ${250 + 30} ${bottom + 4}Z`)
      }
      show(p.tongueOut, tongueOut > 0.05)
      setA(p.tongueOut, 'd', `M232 212 L232 ${214 + 16 * tongueOut} Q250 ${230 + 30 * tongueOut} 268 ${214 + 16 * tongueOut} L268 212Z`)
      show(p.zzz, sl > 0.95)
      if (sl > 0.95) setT(p.zzz, `translate(${392 + Math.sin(t * 1.3) * 6} ${150 - ((t * 18) % 30)})`)
      ink.sync(p)
    },
  })

  const eye = (side: 'L' | 'R', x: number) => (
    <g key={side} transform={`translate(${x} 158)`}>
      <clipPath id={`${id}-eye${side}`}>
        <ellipse rx="16" ry="19.5" />
      </clipPath>
      <g ref={part(`eye${side}Open`)}>
        <ellipse rx="16" ry="19.5" fill={INK} />
        <g ref={part(`eye${side}Pupil`)}>
          <circle cx="-4" cy="-6" r="5.5" fill="#fff" />
          <circle cx="5" cy="5" r="2.4" fill="#fff" />
        </g>
        <rect ref={part(`eye${side}Lid`)} x="-20" y="-40" width="40" height="0" fill={FUR} clipPath={`url(#${id}-eye${side})`} />
        <path ref={part(`eye${side}LidLine`)} fill="none" stroke={INK} strokeWidth="3.6" strokeLinecap="round" />
      </g>
      <path ref={part(`eye${side}Happy`)} d="M-15 5 Q0 -14 15 5" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" style={{ display: 'none' }} />
      <g ref={part(`eye${side}Sleep`)} style={{ display: 'none' }}>
        <path d="M-15 -2 Q0 11 15 -2" fill="none" stroke={INK} strokeWidth="4.2" strokeLinecap="round" />
        <path d={side === 'L' ? 'M-15 -2 L-21 -8 M-10 3 L-14 -4' : 'M15 -2 L21 -8 M10 3 L14 -4'} stroke={INK} strokeWidth="3" strokeLinecap="round" />
      </g>
      <path ref={part(`eye${side}Squeeze`)} d={side === 'L' ? 'M-12 -9 L9 0 L-12 9' : 'M12 -9 L-9 0 L12 9'} fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'none' }} />
    </g>
  )

  // Each group is drawn twice: an ink copy (one outline around the whole group), then the fills and details on top.
  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))
  const arm = (side: 'L' | 'R', pass: boolean) => (
    <g ref={r(side === 'L' ? 'armL' : 'armR', pass)} transform={side === 'L' ? 'translate(150 318) rotate(-44)' : 'translate(350 318) rotate(44)'}>
      <path d={ARM} fill={FUR} />
      {!pass && (
        <>
          <path d="M-9 68 L-9 78 M9 68 L9 78" {...line(3)} />
          {/* Fur over the top of the arm's outline, so the arm grows out of the shoulder instead of ending in a cap. */}
          <ellipse cy="-16" rx="26" ry="18" fill={FUR} />
        </>
      )}
    </g>
  )

  // Legs curl forward: the soles are part of the body's outline, with a crease where they meet the belly.
  const foot = (side: 'L' | 'R', pass: boolean) => (
    <g transform={side === 'L' ? 'translate(138 430) rotate(-14)' : 'translate(362 430) rotate(14) scale(-1 1)'}>
      <ellipse rx="60" ry="52" fill={FUR} />
      {!pass && (
        <>
          <path d="M-48 -31 A60 52 0 0 1 50 29" {...line()} />
          <ellipse cx="6" cy="14" rx="30" ry="24" fill={PINK} />
          <circle cx="-26" cy="-14" r="9" fill={PINK} />
          <circle cx="-6" cy="-26" r="9.5" fill={PINK} />
          <circle cx="18" cy="-24" r="9" fill={PINK} />
        </>
      )}
    </g>
  )

  const lower = (pass: boolean) => (
    <>
      <g ref={r('body', pass)}>
        <path d={BODY} fill={FUR} />
      </g>
      {!pass && (
        <g ref={part('belly')}>
          <ellipse cx="250" cy="388" rx="80" ry="72" fill={BELLY} />
        </g>
      )}
      {foot('L', pass)}
      {foot('R', pass)}
    </>
  )

  const head = (pass: boolean) => (
    <g ref={r('head', pass)}>
      <g ref={r('earL', pass)}>
        <path d={EAR_L} fill={FUR} />
        {!pass && <ellipse cx="114" cy="124" rx="42" ry="48" fill={PINK} />}
      </g>
      <g ref={r('earR', pass)}>
        <path d={EAR_R} fill={FUR} />
        {!pass && <ellipse cx="386" cy="124" rx="42" ry="48" fill={PINK} />}
      </g>
      {/* The head keeps its own outline over the ears (the tuft on top melts into it). */}
      {!pass && (
        <g {...inkPass()}>
          <path d={TUFT} />
          <path d={HEAD} />
        </g>
      )}
      <path d={TUFT} fill={FUR} />
      <path d={HEAD} fill={FUR} />
      {!pass && (
        <>
          <path d="M156 124 Q170 113 184 121 M316 121 Q330 113 344 124" {...line(3.4)} />
          <ellipse ref={part('blushL')} rx="20" ry="12" fill={PINK} opacity="0.85" transform="translate(152 190)" />
          <ellipse ref={part('blushR')} rx="20" ry="12" fill={PINK} opacity="0.85" transform="translate(348 190)" />
          {eye('L', 174)}
          {eye('R', 326)}
          <path ref={part('mouth')} fill="#8E2B3B" stroke={INK} strokeWidth="3.4" style={{ display: 'none' }} />
          <path ref={part('tongue')} fill="#FF8FA8" clipPath={`url(#${id}-mouth)`} style={{ display: 'none' }} />
          <path ref={part('smile')} d="M232 214 Q241 225 250 216 Q259 225 268 214" {...line(3.4)} />
          <path ref={part('tongueOut')} fill="#FF8FA8" stroke={INK} strokeWidth="3" style={{ display: 'none' }} />
          <path d={NOSE} fill={INK} />
          <ellipse cx="240" cy="146" rx="7" ry="10" fill="#fff" opacity="0.28" transform="rotate(-20 240 146)" />
        </>
      )}
    </g>
  )

  return (
    <svg ref={svg} viewBox="0 0 500 490" aria-label="Koko the koala" style={{ height, aspectRatio: '500 / 490', overflow: 'visible', display: 'block', ...style }}>
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
        <g ref={part('zzz')} style={{ display: 'none' }} fontFamily="Fredoka, sans-serif" fontWeight="700" fill="#7E6FC7">
          <text fontSize="44">z</text>
          <text x="26" y="-30" fontSize="32">z</text>
        </g>
      </g>
    </svg>
  )
})

// Pola the polar bear cub: a layered SVG puppet drawn to match his 3D toy (characters/looks.ts, #/world/characters/pola).
// A round white cub with a fluffy tuft, little ears set out to the sides, a cream muzzle with a big black nose and a
// happy open mouth. He breathes, blinks, watches her finger and talks in his own voice, and can hop, wave, cheer,
// wiggle and shake the sea water off (Ice Floe Hop's belly-flop).
import { forwardRef, useId, useRef, type CSSProperties } from 'react'
import { bell, clamp, lerp, setA, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { inkPass as inkPassIn, line as lineIn, useInk } from '../../../kit/ink'
import { blob, BLUSH, C, Eye, INK, MOUTH, mouthPath, TONGUE, updateEyes, win, type EyeKind, type EyePart } from './face'

export interface PolaProps {
  height: string
  style?: CSSProperties
  /** 0..1: wet from the sea (his fur goes flat and drips) until he shakes it off. */
  wet?: number
}

const FUR = C.bearFur
const MUZZLE = C.bearMuzzle
const SHADE = '#ECE8F6'
const inkPass = () => inkPassIn(undefined, INK)
const line = (width?: number) => lineIn(width, INK)

// The head: fluffy on the cheeks (low on each side), smooth on top where the tuft sits.
const HEAD = blob(250, 178, 138, 120, 22, 0.07, (a) => win(a, 0.05, 1.1) + win(a, Math.PI - 1.1, Math.PI - 0.05))
const TUFT = 'M214 72 C206 44 228 36 240 54 C242 30 266 30 268 52 C282 36 304 48 290 74 Z'
const BODY = blob(250, 372, 122, 104, 26, 0.035)
const ARM = 'M-30 -18 C-30 -40 30 -40 30 -18 C30 22 30 46 26 62 C20 86 -20 86 -26 62 C-30 46 -30 22 -30 -18Z'

type Part = 'root' | 'body' | 'head' | 'earL' | 'earR' | 'armL' | 'armR' | 'blushL' | 'blushR' | 'mouth' | 'mouthClip' | 'tongue' | 'drips' | EyePart

/** Pola the polar bear cub. Actions: hop, wave, cheer, wiggle, shake. Voice: pola. */
export const Pola = forwardRef<PuppetHandle, PolaProps>(function Pola({ height, style, wet = 0 }, ref) {
  const id = useId().replace(/:/g, '')
  const st = useRef({ wet: 0, headRot: 0, earL: spring(150, 8), earR: spring(150, 8) }).current
  const ink = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'pola',
    actions: { hop: 0.9, wave: 1.5, cheer: 1.1, wiggle: 0.7, shake: 1.1 },
    eyes: [250, 160],
    reach: [250, 232],
    frame: (f, p) => {
      const { t, dt, look } = f
      st.wet += (wet - st.wet) * Math.min(1, dt * 3)
      const q = f.p
      const act = f.action

      // Idle: breathing, a little sway, a glance at her finger.
      const breath = Math.sin(t * 2.4)
      let sx = 1 - breath * 0.008
      let sy = 1 + breath * 0.016
      let rootY = 0
      let rootX = 0
      let rootRot = 0
      let headRot = Math.sin(t * 1.2) * 2.5 + look.x * 3
      let headY = 0
      let armL = 18
      let armR = -18
      let eye: EyeKind = 'open'
      let mouth = 0.25 + f.mouth * 0.75
      let blush = 1

      const env = smooth(span(q, 0, 0.15)) * (1 - smooth(span(q, 0.85, 1)))
      if (act === 'hop' || act === 'cheer') {
        // Crouch, spring up (stretched), land (squashed) and settle.
        const crouch = bell(span(q, 0, 0.22))
        const air = bell(span(q, 0.2, 0.72))
        const land = wobble(span(q, 0.72, 1), 2)
        sx *= 1 + crouch * 0.1 - air * 0.06 + land * 0.08
        sy *= 1 - crouch * 0.12 + air * 0.09 - land * 0.1
        rootY -= air * (act === 'cheer' ? 70 : 90)
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
        mouth = Math.max(mouth, 0.5 * env)
      } else if (act === 'wiggle') {
        const w = wobble(q, 3)
        sx *= 1 + 0.07 * w
        sy *= 1 - 0.07 * w
        rootRot += w * 6
      } else if (act === 'shake') {
        // Like a wet dog: the whole cub twists side to side, fast and dying away, eyes squeezed shut.
        const s = Math.sin(q * Math.PI * 12) * bell(q)
        rootRot = s * 9
        rootX = s * 8
        headRot += s * 14
        eye = q > 0.1 && q < 0.85 ? 'happy' : 'open'
        armL = lerp(armL, 40, env) + s * 20
        armR = lerp(armR, -40, env) + s * 20
        if (q > 0.5) st.wet = Math.min(st.wet, 1 - span(q, 0.5, 0.9))
      }

      // Ears lag behind the head and wobble back.
      const vel = (headRot - st.headRot) / Math.max(dt, 0.001)
      st.headRot = headRot
      const earL = st.earL.step(clamp(-vel * 0.05, -14, 14) + rootY * 0.05, dt)
      const earR = st.earR.step(clamp(-vel * 0.05, -14, 14) - rootY * 0.05, dt)

      const wetK = st.wet
      setT(p.root, `translate(${rootX} ${rootY}) rotate(${rootRot} 250 476) translate(250 476) scale(${sx * (1 - 0.04 * wetK)} ${sy}) translate(-250 -476)`)
      setT(p.head, `translate(0 ${headY}) rotate(${headRot} 250 280)`)
      setT(p.earL, `rotate(${earL} 140 100)`)
      setT(p.earR, `rotate(${earR} 360 100)`)
      setT(p.armL, `translate(150 312) rotate(${armL})`)
      setT(p.armR, `translate(350 312) rotate(${armR})`)
      setT(p.blushL, `translate(158 212) scale(${blush})`)
      setT(p.blushR, `translate(342 212) scale(${blush})`)
      updateEyes(p, eye, eye === 'open' ? 1 - f.blink : 0, look)
      const d = mouthPath(250, 246, clamp(mouth))
      setA(p.mouth, 'd', d)
      setA(p.mouthClip, 'd', d)
      const bottom = 256 + 46 * clamp(mouth)
      setA(p.tongue, 'd', `M226 ${bottom + 4} Q250 ${bottom - 10 - 18 * mouth} 274 ${bottom + 4}Z`)
      show(p.drips, wetK > 0.1)
      if (wetK > 0.1) {
        p.drips.style.opacity = String(wetK)
        setT(p.drips, `translate(0 ${(t * 40) % 24})`)
      }
      ink.sync(p)
    },
  })

  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))

  const arm = (side: 'L' | 'R', pass: boolean) => (
    <g ref={r(side === 'L' ? 'armL' : 'armR', pass)} transform={side === 'L' ? 'translate(150 312) rotate(18)' : 'translate(350 312) rotate(-18)'}>
      <path d={ARM} fill={FUR} />
      {!pass && (
        <>
          <ellipse cy="64" rx="24" ry="20" fill={MUZZLE} />
          <path d="M-8 74 L-8 82 M8 74 L8 82" {...line(3)} />
          <ellipse cy="-14" rx="26" ry="18" fill={FUR} />
        </>
      )}
    </g>
  )

  const feet = (pass: boolean) =>
    ([-1, 1] as const).map((s) => (
      <g key={s} transform={`translate(${250 + s * 72} 458)`}>
        <ellipse rx="50" ry="30" fill={FUR} />
        {!pass && (
          <>
            <ellipse cy="6" rx="26" ry="15" fill={MUZZLE} />
            {[-18, 0, 18].map((x) => (
              <circle key={x} cx={x} cy="-12" r="6" fill={MUZZLE} />
            ))}
          </>
        )}
      </g>
    ))

  const lower = (pass: boolean) => (
    <>
      <g ref={r('body', pass)}>
        <path d={BODY} fill={FUR} />
      </g>
      {!pass && (
        <>
          <ellipse cx="250" cy="398" rx="78" ry="66" fill={SHADE} opacity="0.55" />
          <path d="M214 330 Q222 338 230 330 M270 330 Q278 338 286 330" {...line(2.6)} />
        </>
      )}
      {feet(pass)}
    </>
  )

  const ear = (side: 'L' | 'R', pass: boolean) => {
    const x = side === 'L' ? 140 : 360
    return (
      <g ref={r(side === 'L' ? 'earL' : 'earR', pass)}>
        <circle cx={x} cy="86" r="40" fill={FUR} />
        {!pass && <circle cx={x + (side === 'L' ? 4 : -4)} cy="90" r="22" fill={C.bearEar} />}
      </g>
    )
  }

  const head = (pass: boolean) => (
    <g ref={r('head', pass)}>
      {ear('L', pass)}
      {ear('R', pass)}
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
          <ellipse cx="250" cy="226" rx="66" ry="48" fill={MUZZLE} stroke={INK} strokeWidth="3.4" />
          <ellipse ref={part('blushL')} rx="22" ry="12" fill={BLUSH} opacity="0.9" transform="translate(158 212)" />
          <ellipse ref={part('blushR')} rx="22" ry="12" fill={BLUSH} opacity="0.9" transform="translate(342 212)" />
          <Eye id={id} side="L" x={192} y={160} skin={FUR} part={part} />
          <Eye id={id} side="R" x={308} y={160} skin={FUR} part={part} />
          <path ref={part('mouth')} fill={MOUTH} stroke={INK} strokeWidth="3.4" />
          <path ref={part('tongue')} fill={TONGUE} clipPath={`url(#${id}-mouth)`} />
          <path d="M250 214 L250 238" {...line(3.2)} />
          <ellipse cx="250" cy="204" rx="27" ry="18" fill={INK} />
          <ellipse cx="241" cy="198" rx="8" ry="5" fill="#fff" opacity="0.4" transform="rotate(-15 241 198)" />
        </>
      )}
    </g>
  )

  return (
    <svg ref={svg} viewBox="0 0 500 500" aria-label="Pola the polar bear cub" style={{ height, aspectRatio: '1 / 1', overflow: 'visible', display: 'block', ...style }}>
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
        <g ref={part('drips')} style={{ display: 'none' }} fill="#8EC9F5" stroke={INK} strokeWidth="2.4">
          {[
            [150, 300],
            [352, 290],
            [196, 420],
            [318, 430],
          ].map(([x, y]) => (
            <path key={x} d={`M${x} ${y} q-7 12 0 16 q7 -4 0 -16Z`} />
          ))}
        </g>
      </g>
    </svg>
  )
})

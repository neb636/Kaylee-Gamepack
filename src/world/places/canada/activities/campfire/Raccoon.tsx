// The raccoon mama of the campsite (the marshmallow bandit) and her babies: a layered SVG puppet in the colors of her 3D
// look (characters/looks.ts, CANADA_LOOKS.raccoon): grey fur, a light face and belly, the dark bandit mask, pink-lined
// ears and a big ringed tail. She breathes, blinks, watches Kaylee's finger and talks in her own voice (`raccoon`), and
// can hop, cheer, munch (paws up at her mouth), wash (rubbing her little hands together, like real raccoons do with
// their food), sneak (crouched, looking left and right), say sorry (ears down, head tilted, paws together) and wave.
// `baby` draws one of her babies: smaller, a rounder head, a higher squeak (no voice of their own).
import { forwardRef, useId, useRef, type CSSProperties } from 'react'
import { bell, clamp, lerp, setA, setT, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../../sdk'
import { inkPass as inkPassIn, line as lineIn, useInk } from '../../../../kit/ink'
import { blob, BLUSH, Eye, INK, MOUTH, mouthPath, TONGUE, updateEyes, type EyeKind, type EyePart } from '../../../poles/puppets/face'
import { CANADA_COLORS as C } from '../../characters/looks'

export interface RaccoonProps {
  height: string
  style?: CSSProperties
  /** Facing: 1 = her right (default), -1 = mirrored. */
  flip?: 1 | -1
  /** One of the babies. */
  baby?: boolean
  /** A marshmallow in her paws (`burnt` = a black crunchy one). */
  holding?: 'white' | 'burnt' | null
}

const FUR = C.raccoonFur
const LIGHT = C.raccoonLight
const DARK = C.raccoonDark
const EAR = '#FFB8CC'
const inkPass = () => inkPassIn(undefined, INK)
const line = (width?: number) => lineIn(width, INK)

const BODY = blob(250, 372, 112, 98, 22, 0.035)
const HEAD = blob(250, 196, 128, 104, 26, 0.04, (a) => (Math.sin(a) > 0.2 ? 1 : 0.2))
const ARM = 'M-24 -14 C-24 -34 24 -34 24 -14 C24 20 24 40 20 54 C14 74 -14 74 -20 54 C-24 40 -24 20 -24 -14Z'
const TAIL = 'M0 0 C30 -20 70 -60 92 -120 C108 -166 150 -196 180 -176 C206 -158 196 -112 176 -84 C140 -30 80 26 14 34 Z'
const MASK = 'M120 184 C130 150 180 150 214 168 C236 178 264 178 286 168 C320 150 370 150 380 184 C384 214 352 226 320 214 C296 204 280 206 266 214 L234 214 C220 206 204 204 180 214 C148 226 116 214 120 184Z'

type Part = 'root' | 'body' | 'head' | 'earL' | 'earR' | 'armL' | 'armR' | 'tail' | 'blushL' | 'blushR' | 'mouth' | 'mouthClip' | 'tongue' | 'snack' | EyePart

/** Raccoon mama (or a baby). Actions: hop, cheer, munch, wash, sneak, sorry, wave. Voice: raccoon. */
export const Raccoon = forwardRef<PuppetHandle, RaccoonProps>(function Raccoon({ height, style, flip = 1, baby = false, holding = null }, ref) {
  const id = useId().replace(/:/g, '')
  const st = useRef({ headRot: 0, earL: spring(160, 8), earR: spring(160, 8), tail: spring(80, 6) }).current
  const ink = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: baby ? undefined : 'raccoon',
    actions: { hop: 0.8, cheer: 1.1, munch: 1.1, wash: 1.3, sneak: 1.6, sorry: 1.8, wave: 1.3 },
    eyes: [250, 186],
    reach: [250, 250],
    frame: (f, p) => {
      const { t, dt, look } = f
      const q = f.p
      const act = f.action

      const breath = Math.sin(t * (baby ? 3.2 : 2.5))
      let sx = 1 - breath * 0.01
      let sy = 1 + breath * 0.018
      let rootY = 0
      let rootX = 0
      let rootRot = 0
      let headRot = Math.sin(t * 1.3) * 3 + look.x * 4
      let headY = 0
      let armL = 22
      let armR = -22
      let ears = 0
      let eye: EyeKind = 'open'
      let mouth = f.mouth
      let blush = 1
      // The tail sways slowly behind her.
      let tail = Math.sin(t * 1.4) * 6
      let lookX = look.x
      let lookY = look.y

      const env = smooth(span(q, 0, 0.15)) * (1 - smooth(span(q, 0.85, 1)))
      if (act === 'hop' || act === 'cheer') {
        const crouch = bell(span(q, 0, 0.22))
        const air = bell(span(q, 0.2, 0.72))
        const land = wobble(span(q, 0.72, 1), 2)
        sx *= 1 + crouch * 0.12 - air * 0.06 + land * 0.08
        sy *= 1 - crouch * 0.14 + air * 0.1 - land * 0.1
        rootY -= air * (act === 'cheer' ? 60 : 80)
        tail += air * 26
        ears -= air * 10
        armL = lerp(armL, act === 'cheer' ? 150 : 60, act === 'cheer' ? env : air)
        armR = lerp(armR, act === 'cheer' ? -150 : -60, act === 'cheer' ? env : air)
        if (act === 'cheer') {
          eye = 'happy'
          mouth = Math.max(mouth, 0.8 * env)
          blush = 1 + 0.35 * env
        }
      } else if (act === 'munch') {
        // Paws up at her mouth, quick little bites, eyes squeezed happy.
        const bite = Math.abs(Math.sin(q * Math.PI * 4))
        mouth = Math.max(mouth, bite * 0.6)
        eye = 'happy'
        armL = lerp(armL, 128, env)
        armR = lerp(armR, -128, env)
        headRot += Math.sin(q * Math.PI * 8) * 2.5
        headY += bite * 3
      } else if (act === 'wash') {
        // Rubbing her little hands together in front of her tummy.
        const rub = Math.sin(q * Math.PI * 10)
        armL = lerp(armL, 70 + rub * 14, env)
        armR = lerp(armR, -70 + rub * 14, env)
        headRot += -6 * env
        lookY = 0.8
        lookX = 0
        mouth = Math.max(mouth, 0.2 * env)
      } else if (act === 'sneak') {
        // Crouched low, tiptoeing, looking left... and right.
        const low = env
        sy *= 1 - 0.1 * low
        sx *= 1 + 0.06 * low
        rootY += 10 * low
        rootX += Math.sin(q * Math.PI * 2) * 18 * low
        rootRot += Math.sin(q * Math.PI * 8) * 2 * low
        lookX = q < 0.5 ? -1 : 1
        lookY = 0
        headRot += (q < 0.5 ? -8 : 8) * low
        armL = lerp(armL, 50, low)
        armR = lerp(armR, -50, low)
        ears -= 6 * low
      } else if (act === 'sorry') {
        // Ears flop down, the head tilts, paws together, big eyes up at her.
        ears += 26 * env
        headRot += 12 * env
        headY += 8 * env
        armL = lerp(armL, 62, env)
        armR = lerp(armR, -62, env)
        lookX = 0.2
        lookY = -0.9
        tail -= 16 * env
        blush = 1 + 0.4 * env
      } else if (act === 'wave') {
        armR = lerp(armR, -140 + Math.sin(q * Math.PI * 8) * 22, env)
        headRot += 6 * env
        mouth = Math.max(mouth, 0.4 * env)
      }

      const vel = (headRot - st.headRot) / Math.max(dt, 0.001)
      st.headRot = headRot
      const earL = st.earL.step(clamp(-vel * 0.05, -16, 16) - ears + rootY * 0.06, dt)
      const earR = st.earR.step(clamp(-vel * 0.05, -16, 16) + ears - rootY * 0.06, dt)
      const tailNow = st.tail.step(tail + rootY * 0.2, dt)

      // A baby: a shorter body under a rounder, bigger head.
      const bs = baby ? 0.86 : 1
      setT(p.root, `translate(250 0) scale(${flip} 1) translate(-250 0) translate(${rootX} ${rootY}) rotate(${rootRot} 250 476) translate(250 476) scale(${sx} ${sy * bs}) translate(-250 -476)`)
      setT(p.head, `translate(0 ${headY + (baby ? 26 : 0)}) rotate(${headRot} 250 290)${baby ? ' translate(250 200) scale(1.12 1.18) translate(-250 -200)' : ''}`)
      setT(p.earL, `rotate(${earL} 150 110)`)
      setT(p.earR, `rotate(${earR} 350 110)`)
      setT(p.armL, `translate(166 322) rotate(${armL})`)
      setT(p.armR, `translate(334 322) rotate(${armR})`)
      setT(p.tail, `translate(320 430) rotate(${-tailNow})`)
      setT(p.blushL, `translate(166 238) scale(${blush})`)
      setT(p.blushR, `translate(334 238) scale(${blush})`)
      // The snack sits between her paws, and goes up to her mouth when she munches.
      const up = act === 'munch' ? env : 0
      setT(p.snack, `translate(250 ${lerp(372, 288, up)})`)
      updateEyes(p, eye, eye === 'open' ? 1 - f.blink : 0, { x: lookX, y: lookY }, 15, 17)
      const m = clamp(mouth)
      const d = mouthPath(250, 262, m, 14)
      setA(p.mouth, 'd', d)
      setA(p.mouthClip, 'd', d)
      const bottom = 272 + 46 * m
      setA(p.tongue, 'd', `M232 ${bottom + 4} Q250 ${bottom - 10 - 18 * m} 268 ${bottom + 4}Z`)
      ink.sync(p)
    },
  })

  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))

  const arm = (side: 'L' | 'R', pass: boolean) => (
    <g ref={r(side === 'L' ? 'armL' : 'armR', pass)} transform={side === 'L' ? 'translate(166 322) rotate(22)' : 'translate(334 322) rotate(-22)'}>
      <path d={ARM} fill={FUR} />
      {/* Her little dark hands. */}
      <ellipse cy="56" rx="20" ry="17" fill={DARK} />
      {!pass && [-10, 0, 10].map((x) => <circle key={x} cx={x} cy="70" r="4.5" fill={DARK} />)}
    </g>
  )

  const tail = (pass: boolean) => (
    <g ref={r('tail', pass)} transform="translate(320 430)">
      <path d={TAIL} fill={FUR} />
      {!pass && (
        <g clipPath={`url(#${id}-tail)`}>
          {[
            [40, 10, 70, -20],
            [70, -30, 110, -40],
            [86, -76, 130, -86],
            [110, -122, 150, -112],
            [150, -160, 180, -134],
          ].map(([x1, y1, x2, y2], i) => (
            <path key={i} d={`M${x1 - 30} ${y1 - 30} L${x2 + 30} ${y2 + 30}`} stroke={DARK} strokeWidth="20" />
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
      {!pass && <ellipse cx="250" cy="392" rx="72" ry="62" fill={LIGHT} />}
      {([-1, 1] as const).map((s) => (
        <g key={s} transform={`translate(${250 + s * 66} 462)`}>
          <ellipse rx="40" ry="22" fill={DARK} />
          {!pass && [-14, 0, 14].map((x) => <circle key={x} cx={x} cy="-10" r="4.5" fill="#6A6278" />)}
        </g>
      ))}
    </>
  )

  const ear = (side: 'L' | 'R', pass: boolean) => {
    const x = side === 'L' ? 150 : 350
    const s = side === 'L' ? -1 : 1
    return (
      <g ref={r(side === 'L' ? 'earL' : 'earR', pass)}>
        <path d={`M${x - 34} 128 C${x - 34 + s * 4} 92 ${x + s * 4} 60 ${x + s * 10} 54 C${x + s * 24} 70 ${x + 36} 100 ${x + 34} 130 Z`} fill={FUR} />
        {!pass && <path d={`M${x - 18} 122 C${x - 16} 98 ${x + s * 4} 78 ${x + s * 8} 74 C${x + s * 16} 88 ${x + 20} 104 ${x + 18} 124 Z`} fill={EAR} />}
        {!pass && <path d={`M${x - 32} 126 C${x - 30} 112 ${x + 30} 112 ${x + 32} 128`} fill={LIGHT} />}
      </g>
    )
  }

  const head = (pass: boolean) => (
    <g ref={r('head', pass)}>
      {ear('L', pass)}
      {ear('R', pass)}
      <path d={HEAD} fill={FUR} />
      {!pass && (
        <>
          {/* The light face: brows over the mask and the cheeks and muzzle under it. */}
          <path d="M150 168 C160 130 214 124 236 150 C220 160 180 160 150 168Z M350 168 C340 130 286 124 264 150 C280 160 320 160 350 168Z" fill={LIGHT} />
          <path d="M130 214 C150 270 200 296 250 296 C300 296 350 270 370 214 C340 232 300 222 280 214 L220 214 C200 222 160 232 130 214Z" fill={LIGHT} />
          {/* The dark stripe down her forehead to the nose. */}
          <path d="M240 112 C244 130 244 160 238 176 L262 176 C256 160 256 130 260 112 Z" fill={DARK} />
          {/* The bandit mask. */}
          <path d={MASK} fill={DARK} />
          {([-1, 1] as const).map((s) => (
            <circle key={s} cx={250 + s * 52} cy="186" r="21" fill="none" stroke={LIGHT} strokeWidth="3" opacity="0.7" />
          ))}
          <Eye id={id} side="L" x={198} y={186} skin={DARK} part={part} rx={15} ry={17} />
          <Eye id={id} side="R" x={302} y={186} skin={DARK} part={part} rx={15} ry={17} />
          <ellipse ref={part('blushL')} rx="20" ry="11" fill={BLUSH} opacity="0.9" transform="translate(166 238)" />
          <ellipse ref={part('blushR')} rx="20" ry="11" fill={BLUSH} opacity="0.9" transform="translate(334 238)" />
          <path ref={part('mouth')} fill={MOUTH} stroke={INK} strokeWidth="3.4" />
          <path ref={part('tongue')} fill={TONGUE} clipPath={`url(#${id}-mouth)`} />
          <path d="M226 254 Q238 264 250 256 Q262 264 274 254" {...line(3)} />
          <path d="M212 246 l-34 -6 M212 254 l-34 4 M288 246 l34 -6 M288 254 l34 4" {...line(2.4)} />
          <ellipse cx="250" cy="240" rx="18" ry="13" fill={INK} />
          <ellipse cx="244" cy="236" rx="6" ry="3.5" fill="#fff" opacity="0.45" transform="rotate(-15 244 236)" />
        </>
      )}
    </g>
  )

  const snack = holding && (
    <g ref={part('snack')} transform="translate(250 372)">
      <rect x="-22" y="-18" width="44" height="36" rx="13" fill={holding === 'burnt' ? '#3A2E36' : '#FFF7F0'} stroke={INK} strokeWidth="4" />
      {holding === 'burnt' ? <path d="M-12 -6 l8 6 l6 -8 l8 6" {...line(2.4)} stroke="#6A5A64" /> : <ellipse cx="-6" cy="-6" rx="8" ry="4" fill="#FBEA9A" opacity="0.8" />}
    </g>
  )

  return (
    <svg ref={svg} viewBox="0 0 500 500" aria-label={baby ? 'A baby raccoon' : 'The raccoon'} style={{ height, aspectRatio: '1 / 1', overflow: 'visible', display: 'block', ...style }}>
      <defs>
        <clipPath id={`${id}-mouth`}>
          <path ref={part('mouthClip')} />
        </clipPath>
        <clipPath id={`${id}-tail`}>
          <path d={TAIL} />
        </clipPath>
      </defs>
      <g ref={part('root')} strokeLinejoin="round">
        <g {...inkPass()}>{lower(true)}</g>
        {lower(false)}
        <g {...inkPass()}>{head(true)}</g>
        {head(false)}
        {snack}
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
